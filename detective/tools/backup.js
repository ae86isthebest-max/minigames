// 自動備份（arc.js 的 BACKUP）：用假的 window.claude（db＋user）模擬試玩卡的雲端資料。最後要印出 BACKUP TEST PASS。
// 注意：這只證明邏輯對；真的試玩卡有沒有開到備份，要看首頁存檔列那一行寫的是不是「☁ 自動備份開著」。
const { chromium } = require('playwright');
const URL = 'http://localhost:8765/index.html';
(async () => {
  const b = await chromium.launch();
  const cloud = {};                       // "data/users/u_test/<key>" → { t, json }
  const cfg = { fail: null, delay: 0, writes: 0 };
  const errs = [];
  const ctx = await b.newContext({ viewport: { width: 1180, height: 820 } });
  await ctx.exposeFunction('__cloud', async (op, path, data) => {
    if (cfg.delay) await new Promise(r => setTimeout(r, cfg.delay));
    if (cfg.fail) return { err: cfg.fail };
    if (op === 'list') return { docs: Object.keys(cloud).filter(k => k.startsWith(path + '/')).map(k => ({ id: k.slice(path.length + 1), data: cloud[k] })) };
    if (op === 'set'){ cloud[path] = data; cfg.writes++; return {}; }
    if (op === 'del'){ delete cloud[path]; cfg.writes++; return {}; }
  });
  await ctx.addInitScript(() => {
    const call = async (op, path, data) => { const r = await window.__cloud(op, path, data); if (r && r.err) throw Object.assign(new Error(r.err), { code: r.err }); return r; };
    window.claude = { use: async name => name === 'user' ? { id: async () => 'u_test' }
      : name === 'db' ? { collection: path => ({ get: async () => ({ docs: (await call('list', path)).docs.map(d => ({ id: d.id, exists: true, data: () => d.data })) }),
          doc: id => ({ set: data => call('set', path + '/' + id, data), delete: () => call('del', path + '/' + id) }) }) }
      : null };
  });
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  const K = 'data/users/u_test/detective_tw3_save_villa';
  const open = async () => { await p.goto(URL); await p.waitForFunction(() => BACKUP.state() !== 'wait'); await p.waitForTimeout(150); };
  const dlg = async yes => { await p.waitForSelector('.dlg'); await p.click(`.dlg [data-v="${yes ? 1 : 0}"]`); await p.waitForTimeout(100); };
  const seen = () => p.evaluate(() => { try { return JSON.parse(localStorage.getItem('detective_tw3_save_villa')).seen.length; } catch (e) { return -1; } });
  const cseen = () => cloud[K] ? JSON.parse(cloud[K].json).seen.length : -1;
  const r = {};

  // 1) 空的雲端：玩一下 → 備份上去
  await open(); await p.evaluate(() => localStorage.clear()); await open();
  r.on = await p.evaluate(() => [BACKUP.state(), document.getElementById('bkStatus').textContent.includes('自動備份開著')]);
  await p.evaluate(async () => { openCase(0); inspectById('ev_phone'); inspectById('ev_glass'); ARC.set('bk_flag', 'villa'); goHome(); await BACKUP.flush(); });
  r.pushed = [cseen(), !!cloud['data/users/u_test/detective_tw3_series']];

  // 2) 瀏覽器的儲存空間整個不見 → 回到首頁自動拿回來
  await p.evaluate(() => localStorage.clear()); await open();
  r.lost = [await seen(), await p.evaluate(() => [SLOT.summary(1).open, ARC.has('bk_flag')])];

  // 3) 這邊是剛重玩的少量進度、備份比較多 → 會問；按確定＝拿回備份
  const small = JSON.stringify({ asked: [], seen: ['ev_phone'], qp: {}, sp: {}, phase: 0, visits: {}, labq: {}, ev: {}, used: {}, done: false, result: null });
  await p.evaluate(s => { localStorage.clear(); localStorage.setItem('detective_tw3_save_villa', s); }, small);
  await p.goto(URL); await dlg(true); r.askYes = [await seen(), cseen()];

  // 4) 同樣的情況按取消＝保留這邊的；備份先不動，等這邊有變化才蓋過去
  await p.evaluate(s => { localStorage.clear(); localStorage.setItem('detective_tw3_save_villa', s); }, small);
  await p.goto(URL); await dlg(false); await p.evaluate(() => BACKUP.flush());
  r.askNo = [await seen(), cseen()];
  await p.evaluate(async () => { openCase(0); inspectById('ev_glass'); inspectById('ev_note'); goHome(); await BACKUP.flush(); });
  r.askNo.push(await seen(), cseen());

  // 5) 這邊比備份多 → 不問，直接備份這邊的
  await p.evaluate(async () => { openCase(0); const it = allItems().find(x => !S.seen.includes(x.id) && itemOpen(x) && unlocked(x)); inspectById(it.id); goHome(); });
  const more = await seen(); await p.goto(URL); await p.waitForFunction(() => BACKUP.state() === 'on'); await p.waitForTimeout(200);
  r.localMore = [await p.evaluate(() => !document.querySelector('.dlg')), more, await seen()]; await p.evaluate(() => BACKUP.flush()); r.localMore.push(cseen());

  // 6) 一開畫面就進案件（備份還沒回來）：玩的時候不會往備份寫；回首頁才處理
  await p.evaluate(() => localStorage.clear()); cfg.delay = 700; const w0 = cfg.writes, before = cseen();
  await p.goto(URL); await p.evaluate(() => { openCase(0); inspectById('ev_phone'); });
  await p.waitForTimeout(1200); await p.evaluate(() => BACKUP.flush());
  r.midCase = [cfg.writes === w0, cseen() === before, await p.evaluate(() => !document.querySelector('.dlg'))];
  cfg.delay = 0; await p.evaluate(() => goHome()); await dlg(true); r.midCase.push(await seen() === before);

  // 7) 自己刪掉的存檔：備份那邊也刪，重開不會又跑回來
  await p.evaluate(() => { slotDelete(1); }); await dlg(true); await p.evaluate(() => BACKUP.flush());
  r.del = [Object.keys(cloud).length]; await open(); r.del.push(await p.evaluate(() => SLOT.summary(1).empty), Object.keys(cloud).length);

  // 8) 用存檔碼還原 → 備份跟著換成還原後的內容
  await p.evaluate(async s => { localStorage.setItem('detective_tw3_save_villa', s); const code = await SLOT.code(1); SLOT.wipe(1); window._code = code; }, small);
  await p.evaluate(() => { slotImport(); }); await p.waitForSelector('.dlg textarea'); await p.fill('.dlg textarea', await p.evaluate(() => window._code)); await p.click('.dlg .btn.primary');
  await p.waitForTimeout(200); await p.evaluate(() => BACKUP.flush()); r.imp = [await seen(), cseen()];

  // 9) 連不上：不當機、不亂寫，畫面寫「暫時連不上」
  cfg.fail = 'unavailable'; const w1 = cfg.writes; await open();
  r.err = [await p.evaluate(() => [BACKUP.state(), document.getElementById('bkStatus').textContent.includes('連不上')]), cfg.writes === w1, await seen()];
  cfg.fail = null;

  // 10) 沒有 window.claude（網站版）：安靜略過
  const ctx2 = await b.newContext(); const q = await ctx2.newPage(); q.on('pageerror', e => errs.push(e.message)); await q.goto(URL); await q.waitForTimeout(300);
  r.off = await q.evaluate(() => [BACKUP.state(), document.getElementById('bkStatus').textContent.includes('沒有自動備份')]);

  console.log(JSON.stringify(r));
  const ok = r.on[0] === 'on' && r.on[1] && r.pushed[0] === 2 && r.pushed[1] && r.lost[0] === 2 && r.lost[1][0] === 1 && r.lost[1][1]
    && r.askYes.join() === '2,2' && r.askNo[0] === 1 && r.askNo[1] === 2 && r.askNo[2] === 3 && r.askNo[3] === 3
    && r.localMore[0] && r.localMore[1] === 4 && r.localMore[2] === 4 && r.localMore[3] === 4
    && r.midCase.every(Boolean) && r.del[0] === 0 && r.del[1] === true && r.del[2] === 0 && r.imp.join() === '1,1'
    && r.err[0][0] === 'err' && r.err[0][1] && r.err[1] && r.err[2] === 1 && r.off[0] === 'off' && r.off[1] && !errs.length;
  console.log(ok ? 'BACKUP TEST PASS' : 'BACKUP TEST FAIL', errs); await b.close();
})();
