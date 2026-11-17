// 戶外場景總覽：把每一集用 WK.autoWorld 排出來的戶外場景（OUT0 ＋ C.outScenes）畫成一張對照圖。
// 用法：node tools/outscenes.js <輸出.png>　（先在 detective/ 開 python3 -m http.server 8765）
// 紅線＝人站的那條線（圖上 y=98）。房子的牆腳、門、桌椅、盆栽都要落在地面上（地面那一塊要蓋到紅線），
// 不能停在半空；黃框＝可以點的東西（證物、小細節）的範圍，要框在畫出來的東西上。洋紅色＝會被去掉的天空。
// 每一天畫出來不一樣的（晚上、下雨）都會各畫一格。海、遠山、牆不可以變成洋紅色；
// 文字輸出裡的 LEFT n＝還有 n 格跟天空同色的地方沒去掉（被框住的窗戶不算問題；招牌下面留一塊天空才要看）。
// 自動判斷不準的場景可以在那一集寫 skyTo:{ 場景名: 第幾排 }（從那一排開始一律不挖）。
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html');
  const list = await p.evaluate(async () => {
    window.uiConfirm = async () => true; window.toast = () => {};
    const OUT0 = ["care", "vgarden", "farm", "backyard", "pool", "courtyard", "road"], out = [], seen = {};
    const bx = document.createElement('div'); bx.id = 'bx'; bx.style.cssText = 'display:grid;grid-template-columns:repeat(4,336px);gap:6px;background:#222;padding:6px;position:absolute;left:0;top:0;z-index:99999';
    document.body.appendChild(bx);
    for (let i = 0; i < CASES.length; i++){
      try { await openCase(i); } catch (e) { out.push(`ep${i+1} ERR ${e.message}`); continue; }
      const outs = new Set([...OUT0, ...(C.outScenes || [])]), locs = [...(C.locations || [])];
      Object.keys(C.rooms || {}).forEach(id => { if (!locs.some(l => l.id === id)) locs.push({ id, name: id }); });
      const last = (C.phases || [0]).length - 1;
      for (let ph = 0; ph <= last; ph++){ S.phase = ph;
      for (const l of locs){ const def = typeof worldDef === "function" && C.locations ? worldDef(l) : null; if (def && !def.auto) continue;   // 自己畫的走動場景不走這條路
        for (const r of roomsOf(l)){ if (!outs.has(r.scene)) continue;
          const first = roomsOf(l)[0].id, c = document.createElement('canvas');
          let o = {}; try { o = typeof r.opt === 'function' ? r.opt(S.phase, () => false) : (r.opt || {}); } catch (e) {}
          try { PX.draw(c, r.scene, { ...o, phase: S.phase }); } catch (e) { out.push(`ep${i+1} ${r.scene} ERR ${e.message}`); continue; }
          const u = c.toDataURL(), key = i + r.scene + u.length + u.slice(-160); if (seen[key]) continue; seen[key] = 1;   // 每一天畫出來一樣的只畫一次
          const ns = WK.noSky(c, (C.skyTo || {})[r.scene]), w = document.createElement('div'), k = 336 / 192; w.style.cssText = 'position:relative;background:#f0f;height:' + 108 * k + 'px';
          ns.style.cssText = 'width:336px;display:block;image-rendering:pixelated'; w.appendChild(ns);
          const box = (x, y, ww, h, css) => { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:${x*k}px;top:${y*k}px;width:${ww*k}px;height:${h*k}px;${css}`; w.appendChild(d); };
          box(0, 98, 192, 0, 'border-top:1px solid #f00');
          (r.details || []).forEach(d => box(...d.hot, 'outline:1px solid #ff0'));
          allItems().filter(it => (it.loc || "_") === l.id && it.hot && (it.room || first) === r.id).forEach(it => box(...it.hot, 'outline:1px dashed #ff0'));
          const t = document.createElement('div'); t.textContent = `ep${i+1} d${ph} ${l.id}/${r.id} (${r.scene})`; t.style.cssText = 'position:absolute;left:2px;top:0;color:#ff0;background:#0009;font:11px sans-serif'; w.appendChild(t);
          bx.appendChild(w); out.push(`ep${i+1} d${ph} ${l.id}/${r.id} ${r.scene}${ns._left >= 24 ? '  LEFT ' + ns._left : ''}`);
        } }
      }
    }
    return out;
  });
  console.log(list.join('\n')); await p.waitForTimeout(300);
  await (await p.$('#bx')).screenshot({ path: process.argv[2] || 'outscenes.png' });
  console.log(errs.length ? errs : 'OUTSCENES SHEET SAVED'); await b.close();
})();
