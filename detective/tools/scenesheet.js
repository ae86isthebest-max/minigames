// 全部走動畫面的對照圖：每一集、每個地點、每個區域（房間、戶外、二樓、暗格、街上）各拍一張，排成一張張對照圖給人看。
// 用法：node tools/scenesheet.js <輸出資料夾> [從第幾集=1] [到第幾集=最後] [mode]
//   mode：all（預設）＝當作什麼都解鎖了（看得到暗格和後來才出現的東西）；fresh＝剛開始什麼都不知道的樣子；last＝最後一天、全部解鎖
//   PORT=8766 可以換埠號（預設 8765）；COLS=5 CELL=384 PER=25 可以改每張圖的欄數、每格寬度、每張幾格（預設 4、480、16）；STREET=0 不拍街上。圖檔：<輸出>/epNN-<mode>-<k>.png，街上的另外一份 epNN-<mode>-street-<k>.png
// 看什麼：東西有沒有停在半空／陷進地面、門有沒有被切掉、人有沒有站在地上、有沒有疊在一起、畫面邊緣有沒有一刀切
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const out = process.argv[2] || 'sheets', from = +(process.argv[3] || 1), to = +(process.argv[4] || 999), mode = process.argv[5] || 'all';
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1180, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const url = `http://localhost:${process.env.PORT || 8765}/index.html`;
  const COLS = +(process.env.COLS || 4), CELL = +(process.env.CELL || 480), PER = +(process.env.PER || 16), STREET = process.env.STREET !== '0';
  await p.goto(url);
  const n = await p.evaluate(() => CASES.length);
  for (let ci = from - 1; ci < Math.min(n, to); ci++){
    await p.goto(url);
    const plan = await p.evaluate(async ([ci, mode]) => {
      localStorage.clear(); window.uiConfirm = async () => true; window.toast = () => {};
      await openCase(ci); if (typeof restart === "function") try { await restart(true); } catch (e) {}
      if (mode !== 'fresh') window.unlocked = () => true;
      const locs = C.locations || [{ id: "_", name: "現場" }], last = (C.phases || [0]).length - 1;
      S.introSeen = {}; locs.forEach(l => S.introSeen[l.id] = 1); if (typeof HOME !== "undefined" && HOME) S.introSeen[HOME.id] = 1;
      return locs.map(l => ({ id: l.id, ph: mode === 'last' ? Math.min(last, l.until ?? last) : Math.max(0, l.phase || 0) }));
    }, [ci, mode]);
    const shots = [];
    for (const L of plan){
      const areas = await p.evaluate(async L => {
        S.phase = L.ph; if (travel()){ openLoc = L.id; tab = "map"; } else { tab = "scene"; } wGo = false; wRoom = null; render();
        await new Promise(r => setTimeout(r, 250));
        for (let i = 0; i < 30 && WORLD.skip(); i++) await new Promise(r => setTimeout(r, 30));
        const l = curLoc(), def = l && worldDef(l); if (!def) return null;
        return areaList(def).map(a => ({ id: a.id, x: Math.round((a.x0 + a.x1) / 2), y: areaY(a), w: def.w }));
      }, L);
      if (!areas){ console.log(`ep${ci+1} ${L.id}: no world`); continue; }
      for (const a of areas){ if (!STREET && a.id === '_street') continue;
        await p.evaluate(a => { const l = curLoc(), st = WORLD.state(l.id); for (let i = 0; i < 30 && WORLD.skip(); i++);
          const A = areaList(worldDef(l)).find(q => q.id === a.id); if (WORLD.standIn && A) a.x = WORLD.standIn(A)[0];   // 跟遊戲裡走進這個區域站的位置一樣
          st.px = a.x; st.py = a.y; st.bx = a.x - 18; st.by = a.y; st.path = []; st.walking = false; st.areaSay = null; st.trail = [[st.bx, st.by], [st.px, st.py]];
          st.cam = Math.max(0, Math.min(a.w - 240, a.x - 120)); closePanel && 0; }, a);
        await p.waitForTimeout(650);
        const d = await p.evaluate(() => { const st = WORLD.state(curLoc().id); st.areaSay = null; return document.getElementById('worldcv').toDataURL(); });
        shots.push({ label: `ep${ci+1} ${L.id}/${a.id} d${L.ph}`, d, street: a.id === "_street" });
      }
    }
    // 排成對照圖：每張 16 格
    for (const [tag, list] of [["", shots.filter(s => !s.street)], ["street-", shots.filter(s => s.street)]]){
      for (let k = 0; k * PER < list.length; k++){
        await p.evaluate(([items, COLS, CELL]) => { let bx = document.getElementById('sheetbx'); if (bx) bx.remove(); bx = document.createElement('div'); bx.id = 'sheetbx';
          bx.style.cssText = `display:grid;grid-template-columns:repeat(${COLS},${CELL}px);gap:4px;background:#222;padding:4px;position:absolute;left:0;top:0;z-index:99999;width:max-content`;
          items.forEach(s => { const w = document.createElement('div'); w.style.cssText = 'position:relative;line-height:0'; const im = new Image(); im.src = s.d; im.style.cssText = `width:${CELL}px;height:${CELL * 135 / 240}px;image-rendering:pixelated`;
            const t = document.createElement('div'); t.textContent = s.label; t.style.cssText = 'position:absolute;left:0;top:0;color:#ff0;background:#000a;font:11px/1.3 sans-serif;padding:0 3px'; w.appendChild(im); w.appendChild(t); bx.appendChild(w); });
          document.body.appendChild(bx); }, [list.slice(k * PER, k * PER + PER), COLS, CELL]);
        await p.waitForTimeout(150);
        await (await p.$('#sheetbx')).screenshot({ path: `${out}/ep${String(ci+1).padStart(2,'0')}-${mode}-${tag}${k}.png` });
      }
    }
    console.log(`ep${ci+1}: ${shots.length} shots`);
  }
  console.log(errs.length ? errs.slice(0, 10) : 'SCENE SHEETS SAVED'); await b.close();
})();
