// 地區地圖檢查：每一集（有地圖的）在幾種螢幕大小打開地圖，全部地點都當作已經知道，
// 看地點的名牌有沒有互相蓋住、有沒有跑出地圖外面、有沒有蓋住別的地點的小房子。
// 用法：node tools/maplint.js [輸出資料夾（給了就順便存圖）] [從第幾集=1] [到第幾集=最後]   PORT=8766 可以換埠號
// 最後印 "MAP LINT PASS" 或 "MAP LINT: n to look at"
const { chromium } = require('playwright'); const fs = require('fs');
const SIZES = [[1920, 960], [1366, 657], [1180, 820], [820, 1180], [390, 844]];
(async () => {
  const out = process.argv[2] && process.argv[2] !== '-' ? process.argv[2] : null, from = +(process.argv[3] || 1), to = +(process.argv[4] || 999);
  if (out) fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const url = `http://localhost:${process.env.PORT || 8765}/index.html`;
  let bad = 0, maps = 0;
  for (const [w, h] of SIZES){
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(url); const n = await p.evaluate(() => CASES.length);
    for (let ci = from - 1; ci < Math.min(n, to); ci++){
      await p.goto(url);
      const res = await p.evaluate(async ci => {
        localStorage.clear(); window.uiConfirm = async () => true; window.toast = () => {};
        await openCase(ci); if (typeof restart === "function") try { await restart(true); } catch (e) {}
        if (!travel()) return null;
        window.unlocked = () => true;
        const last = (C.phases || [0]).length - 1, outp = [];
        // 每一天都看一次（有些地點只開幾天）
        for (let ph = 0; ph <= last; ph++){
          S.phase = ph; openLoc = null; tab = "map"; render();
          await new Promise(r => setTimeout(r, 120));
          for (let i = 0; i < 30 && typeof WORLD !== "undefined" && WORLD.skip && WORLD.skip(); i++) await new Promise(r => setTimeout(r, 20));
          const box = document.querySelector(".wmap"); if (!box) continue;
          const B = box.getBoundingClientRect(), k = B.width / 240;
          const labs = [...box.querySelectorAll(".mlab")].map(e => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 14), x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }; });
          const known = C.locations.filter(mapKnown), pos = C.mapPos || {};
          const pins = known.map(l => { const [x, y] = pos[l.id] || [120, 70]; return { id: l.id, x0: B.left + (x - 7) * k, y0: B.top + (y - 9) * k, x1: B.left + (x + 7) * k, y1: B.top + (y + 1) * k }; });
          const ov = (a, c) => Math.max(0, Math.min(a.x1, c.x1) - Math.max(a.x0, c.x0)) * Math.max(0, Math.min(a.y1, c.y1) - Math.max(a.y0, c.y0));
          const area = a => (a.x1 - a.x0) * (a.y1 - a.y0);
          const f = [];
          labs.forEach((a, i) => {
            if (a.x0 < B.left - 1 || a.y0 < B.top - 1 || a.x1 > B.right + 1 || a.y1 > B.bottom + 1) f.push(`OUT ${a.t}`);
            labs.forEach((c, j) => { if (j > i && ov(a, c) > 0.06 * Math.min(area(a), area(c))) f.push(`OVERLAP ${a.t} × ${c.t}`); });
            pins.forEach((q, j) => { if (j !== i && ov(a, q) > 0.5 * area(q)) f.push(`COVERS ${a.t} 蓋住 ${q.id}`); });
          });
          outp.push({ ph, f, n: labs.length });
        }
        return outp;
      }, ci);
      if (!res) continue;
      maps++;
      const seen = new Set();
      for (const r of res){ for (const f of r.f){ if (seen.has(f)) continue; seen.add(f); bad++; console.log(`ep${ci + 1} ${w}x${h} d${r.ph}: ${f}`); } }
      if (out && (seen.size || process.env.ALL)){ await p.waitForTimeout(250); await p.screenshot({ path: `${out}/map-ep${String(ci + 1).padStart(2, '0')}-${w}x${h}.png` }); }
    }
    await p.close();
  }
  await b.close();
  console.log(`maps checked: ${maps}`);
  console.log(bad ? `MAP LINT: ${bad} to look at` : 'MAP LINT PASS');
})();
