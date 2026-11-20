// 走近才閃＋小東西的點擊範圍（第 1 集，俯視畫面 topdown.js）：最後要印出 GLINT TEST PASS。
// 1) 還沒看過的東西只有在主角附近（同一個房間、56 格內）才算「附近」；看過就不閃；劇情進行中不閃
// 2) iPad、手機大小：手指點在小東西外面一點點也算點中；離很遠不算；點人還是點到人
// 3) 人擋在東西前面：閃光會移到沒被擋住的位置；點在人身上＝找人；整個被擋住的東西，點它閃的位置先看東西，看過之後才輪到人
// 4) 沒有左上角／下面的提示；🧭 平面圖列出全部星星，點別的房間的星星＝走過去看
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = []; const r = {};
  for (const [name, w, h] of [['ipad', 1180, 820], ['phone', 844, 390], ['ipadP', 820, 1180]]){
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:8765/index.html');
    const settle = async () => { for (let i = 0; i < 40; i++){ await p.waitForTimeout(250); if (await p.evaluate(() => !TOPW.walking())) break; } await p.waitForTimeout(300); };
    await p.evaluate(() => { localStorage.clear(); window.uiConfirm = async () => true; openCase(0); }); await p.waitForTimeout(800);
    await p.evaluate(() => TOPW.skip()); await p.waitForTimeout(500);
    // 把主角放到某個房間的某一點（不走路）
    const put = (room, x, y) => p.evaluate(([room, x, y]) => { const s = TOPW.state("_"); s.room = room; s.px = x; s.py = y; s.path = []; s.plan = []; s.use = null; s.broom = room; s.bx = x + 44; s.by = y + 10; s.trail = []; s.areaSay = null; s.flavor = null; }, [room, x, y]);
    const near = () => p.evaluate(() => curHooks.spots().filter(q => q.fresh && TOPW.nearYou(q)).map(q => q.id || q.ids[0]).sort().join());
    const still = async () => { let c = ""; for (let i = 0; i < 60; i++){ const n = await p.evaluate(() => TOPW.state("_").cam.map(v => v.toFixed(2)).join()); if (n === c) break; c = n; await p.waitForTimeout(120); } };
    const tapAt = async (x, y) => { await still(); const pt = await p.evaluate(([x, y]) => { const c = document.getElementById('worldcv'), rc = c.getBoundingClientRect(), s = TOPW.state("_"); return [rc.left + (x - s.cam[0]) * rc.width / TOPW.VW, rc.top + (y - s.cam[1]) * rc.height / TOPW.VH]; }, [x, y]); await p.touchscreen.tap(pt[0], pt[1]); await settle(); };
    const found = () => p.evaluate(() => (S.found || []).join());
    const close = () => p.evaluate(() => { wTalk = null; wSay = null; peek = null; wRoom = null; wAct = null; TOPW.endUse(); render(); });
    const o = r[name] = {};
    o.top = await p.evaluate(() => WE === TOPW);
    await put("security", 90, 96); await p.waitForTimeout(400); o.security = await near();
    await put("study", 40, 110); await p.waitForTimeout(400); o.study = await near();
    // 小東西：書房門邊的密碼鎖 v_keypad [0,88,7,12]。點在它右邊外面 3 格、上面 2 格
    await tapAt(10, 86); o.tapNear = await found();
    o.afterFound = (await near()).includes('v_keypad');
    await close(); await put("study", 40, 110);
    // 離很遠（牆上兩幅東西中間）不算
    await tapAt(180, 30); o.tapFar = await found();
    // 人擋在前面：保全室裡，讓周曉晴站在值班紀錄本（v_log）前面，整本被擋住
    await close(); await p.evaluate(() => { C.world._.top.place._chow = C.world._.top.place.chow; C.world._.top.place.chow = { room:"security", x:60, y:74, act:"idle", view:"down" }; });
    await put("security", 130, 118); await p.waitForTimeout(500);
    const ui = () => p.evaluate(() => [wTalk, peek && peek.kind + ":" + peek.id, (S.found || []).join()].join("|"));
    const g = id => p.evaluate(id => { const q = curHooks.spots().find(q => q.id === id || (q.ids || []).includes(id)); return TOPW.glintAt(q); }, id);
    const snow = await g('v_snow'); o.pts = [snow, await p.evaluate(() => { const q = curHooks.spots().find(q => q.id === 'v_log'); const pp = curHooks.people().find(x => x.id === 'chow'); return [q.r, pp.x, pp.y]; })];
    o.cover = await g('v_log');
    await tapAt(60, 44); o.body = await ui(); await close();                          // 點在人身上（頭）→ 找人
    await tapAt(o.cover.x, o.cover.y); o.covered = await ui(); await close();        // 整個被擋住的東西，點它閃的位置 → 先看東西
    await tapAt(o.cover.x, o.cover.y); o.coveredAgain = await ui(); await close();   // 看過之後再點同一個位置 → 才輪到人
    await p.evaluate(() => { C.world._.top.place.chow = C.world._.top.place._chow; delete C.world._.top.place._chow; render(); });
    // 平面圖（🧭）：星星＝所有還沒看過的東西；點別的房間的星星＝走過去看（小細節直接看；證物先問、還沒花時間）
    await close(); await put("hall", 110, 150); await p.waitForTimeout(400);
    o.noHints = await p.evaluate(() => !document.querySelector('.wnear') && !document.querySelector('.wroom'));
    await p.click('text=平面圖'); await p.waitForTimeout(400);
    o.planAll = await p.evaluate(() => window._plan.stars === curHooks.spots().filter(q => q.fresh).length);
    const tapStar = async key => { await p.evaluate(k => { const cv = document.getElementById('plancv'), q = window._plan.pts.find(q => q.key === k); cv.scrollIntoView({ block:'center' }); const c = cv.getBoundingClientRect(); const pan = document.querySelector('.fs-panel'); pan.scrollTop += c.top + q.y - pan.getBoundingClientRect().top - pan.clientHeight / 2; }, key); await p.waitForTimeout(150); const pt = await p.evaluate(k => { const c = document.getElementById('plancv').getBoundingClientRect(), q = window._plan.pts.find(q => q.key === k); return [c.left + q.x, c.top + q.y]; }, key); await p.mouse.click(pt[0], pt[1]); await settle(); await settle(); };
    await tapStar('v_shelf'); o.planDetail = [await ui(), await p.evaluate(() => TOPW.room())];
    await close(); await put("hall", 110, 150); await p.click('text=平面圖'); await p.waitForTimeout(400);
    const used0 = await p.evaluate(() => usedNow());
    await tapStar("ev_note");
    o.planItem = await p.evaluate(u => [!!wAct && wAct.ids.join(), S.seen.includes('ev_note'), usedNow() === u, TOPW.room()], used0);
    o.fits = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
    await ctx.close();
  }
  console.log(JSON.stringify(r));
  const ok = ['ipad', 'phone', 'ipadP'].every(n => { const o = r[n];
    return o.top && o.security.includes('v_snow') && o.security.includes('v_log') && !o.security.includes('v_keypad') && !o.security.includes('v_photo')
      && o.study.includes('v_keypad') && o.study.includes('v_shelf') && !o.study.includes('v_snow') && !o.study.includes('v_fridge')
      && o.tapNear === 'v_keypad' && !o.afterFound && o.tapFar === 'v_keypad'
      && o.pts[0].free && !o.cover.free && o.body.startsWith('chow|') && o.covered.includes('detail:v_log') && o.covered.endsWith('v_keypad,v_log') && o.coveredAgain.startsWith('chow|')
      && o.noHints && o.planAll && o.planDetail[0].includes('detail:v_shelf') && o.planDetail[1] === 'study' && o.planItem[0] === 'ev_note' && !o.planItem[1] && o.planItem[2] && o.planItem[3] === 'study' && o.fits; }) && !errs.length;
  console.log(ok ? 'GLINT TEST PASS' : 'GLINT TEST FAIL', errs); await b.close();
})();
