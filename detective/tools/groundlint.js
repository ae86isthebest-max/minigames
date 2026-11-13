// 室內場景的「浮空」檢查＋可以點的範圍檢查（每個房間的原圖，192×108）。
// 用法：node tools/groundlint.js [輸出檔名（會存成 名字-0.png、名字-1.png…）] [從第幾集=1] [到第幾集=最後]　（PORT=8766 可以換埠號，預設 8765）
// 做法：把場景裡的 wall()／floor() 單獨重畫一次當背景，跟完整的圖比，不一樣的地方就是「畫上去的東西」，連在一起的算一件。
//   FLOAT：一件東西的底在地板線上面 2～10 格、下面又沒有東西托著（盆栽、箱子、椅子停在半空）。掛在牆上的東西通常離地更高，不會被抓。
//   EMPTY：證物／小細節的可點範圍（hot）裡幾乎沒有畫東西（框到空牆、空地板）。　OUT：範圍超出畫面。
// 沒有 floor() 的場景和戶外場景檢查不了，另外存成 名字-look-0.png…（紅虛線＝人站的線，黃框＝可點範圍），要人看。
// 每一條都要人看一眼（輸出的圖把每個有問題的房間放大，紅框＝FLOAT，黃框＝EMPTY／OUT）；確定沒問題的寫進下面的 OK 清單。
const { chromium } = require('playwright');
const OK = new Set([
  // "場景名:FLOAT:x,y"（或 "場景名:FLOAT:*" 整個場景）　或　"第幾集:證物或小細節 id"　（看過、確定是故意的）
  // 掛在牆上的東西：公告欄、信箱、電箱、掛著的外套、牆上的小盒子、門框跟踢腳板同色
  "taipei:FLOAT:150,24", "mhall:FLOAT:150,38", "c3_lobby:FLOAT:126,20", "c6_koroom:FLOAT:30,38", "c6_office:FLOAT:16,50", "t_machine:FLOAT:100,18",
  "ys_room:FLOAT:62,58", "qshop:FLOAT:150,52", "m12_teashop:FLOAT:170,20", "c22_vault:FLOAT:2,20",
  // 牆面本身的花紋（磁磚、壁紙、鐵皮）被當成一件件東西
  "c6_hongda:FLOAT:*", "s8_front:FLOAT:*", "i_zhu:FLOAT:*", "p_fish:FLOAT:*", "i_song:FLOAT:*",
  // 範圍本來就是一整片（橋底）
  "4:d4_bridge",
]);
(async () => {
  const out = process.argv[2] || 'groundlint.png', from = +(process.argv[3] || 1), to = +(process.argv[4] || 999);
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/pixel.js', async route => { const r = await route.fetch(); let body = await r.text();
    const a = body.indexOf('function floor(y, c, line){'), w = body.indexOf('function wall(y, c, brick){');
    if (a < 0 || w < 0) throw new Error('pixel.js: floor()/wall() not found');
    body = body.replace('function floor(y, c, line){', 'function floor(y, c, line){ if (window.__bg) window.__bg.push(["floor",[y,c,line]]);')
               .replace('function wall(y, c, brick){', 'function wall(y, c, brick){ if (window.__bg) window.__bg.push(["wall",[y,c,brick]]);');
    route.fulfill({ response: r, body }); });
  await p.goto(`http://localhost:${process.env.PORT || 8765}/index.html`);
  const res = await p.evaluate(async ([from, to, OKL]) => {
    const OK = new Set(OKL); window.uiConfirm = async () => true; window.toast = () => {};
    PX.SCENES.__bgonly = o => o.calls.forEach(([k, a]) => PX.prim[k](...a));
    const rects0 = (r, l) => { const first = roomsOf(l)[0].id; return [...(r.details || []).map(d => d.hot), ...allItems().filter(it => (it.loc || '_') === l.id && it.hot && (it.room || first) === r.id).map(it => it.hot)].filter(Boolean); };
    const W = 192, H = 108, flags = [], seen = {}, empt = {}, cells = [], unchecked = [], stats = { rooms: 0, noFloor: 0 };
    const bx = document.createElement('div'); bx.id = 'glbx'; bx.style.cssText = 'display:grid;grid-template-columns:repeat(3,576px);gap:6px;background:#222;padding:6px;position:absolute;left:0;top:0;z-index:99999;width:max-content';
    document.body.appendChild(bx);
    const px = c => c.getContext('2d').getImageData(0, 0, W, H).data;
    for (let ci = from - 1; ci < Math.min(CASES.length, to); ci++){
      try { localStorage.clear(); await openCase(ci); } catch (e) { flags.push(`ep${ci+1} ERR ${e.message}`); continue; }
      const outs = new Set(["care", "vgarden", "farm", "backyard", "pool", "courtyard", "road", ...(C.outScenes || [])]);
      const locs = [...(C.locations || [])]; Object.keys(C.rooms || {}).forEach(id => { if (!locs.some(l => l.id === id)) locs.push({ id, name: id }); });
      const last = (C.phases || [0]).length - 1;
      for (const l of locs){ let wd = null; try { wd = C.locations ? worldDef(l) : (typeof HOME !== 'undefined' ? worldDef(HOME) : null); } catch (e) {}
       if (wd && !wd.auto) continue;   // 手畫的走動場景（第 1 集、第 2 集茶園）位置是另外排的，用 scenesheet.js 看
       for (const r of roomsOf(l)){
        const first = roomsOf(l)[0].id, variants = [];
        for (const ph of new Set([Math.max(0, l.phase || 0, r.phase || 0), Math.min(last, l.until ?? last, r.until ?? last)])) for (const hv of [false, true]){
          let o = {}; try { o = typeof r.opt === 'function' ? r.opt(ph, () => hv) : (r.opt || {}); } catch (e) {} variants.push({ ...o, phase: ph }); }
        for (const o of variants){
          const key = r.scene + '|' + JSON.stringify(o); if (seen[key]) continue; seen[key] = 1; stats.rooms++;
          const c = document.createElement('canvas'); window.__bg = [];
          try { PX.draw(c, r.scene, o, 1); } catch (e) { flags.push(`ep${ci+1} ${l.id}/${r.id} ${r.scene} ERR ${e.message}`); window.__bg = null; continue; }
          const calls = window.__bg; window.__bg = null;
          const fl = calls.filter(k => k[0] === "floor").pop(), mine = [];
          const img = px(c); let fg = null, yf = null;
          if (fl && !outs.has(r.scene)){
            yf = fl[1][0]; const c2 = document.createElement('canvas'); PX.draw(c2, "__bgonly", { calls }, 1); const bg = px(c2);
            fg = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) fg[i] = (img[i*4] !== bg[i*4] || img[i*4+1] !== bg[i*4+1] || img[i*4+2] !== bg[i*4+2]) ? 1 : 0;
            // 緊貼地板線、很矮（≤8 格）的整排色帶是踢腳板，算背景：不然靠著它的東西會跟它連成一件，停在踢腳板上面的東西也抓不到。
            // 比較高的整排色帶（櫃台、流理台）不算，放在上面的東西有它托著。
            const band = y => { const n = {}; let best = 0, bc = -1; for (let x = 0; x < W; x++){ const i = y * W + x; if (!fg[i]) continue; const v = (img[i*4] << 16) | (img[i*4+1] << 8) | img[i*4+2]; n[v] = (n[v] || 0) + 1; if (n[v] > best){ best = n[v]; bc = v; } } return best >= W * 0.6 ? bc : -1; };
            let top = yf; while (top > 0 && band(top - 1) >= 0) top--;
            if (yf - top <= 8) for (let y = top; y < yf; y++){ const bc = band(y); for (let x = 0; x < W; x++){ const i = y * W + x; if (fg[i] && ((img[i*4] << 16) | (img[i*4+1] << 8) | img[i*4+2]) === bc) fg[i] = 0; } }
            // 連在一起的算一件
            const lab = new Int32Array(W * H).fill(-1); let n = 0;
            for (let s = 0; s < W * H; s++){ if (!fg[s] || lab[s] >= 0) continue;
              const st = [s]; lab[s] = n; let x0 = W, x1 = 0, y0 = H, y1 = 0, area = 0;
              while (st.length){ const q = st.pop(), x = q % W, y = (q / W) | 0; area++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
                for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){ const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const t = yy * W + xx; if (fg[t] && lab[t] < 0){ lab[t] = n; st.push(t); } } }
              n++;
              const gap = yf - 1 - y1, w = x1 - x0 + 1, h = y1 - y0 + 1;
              if (gap >= 2 && gap <= 10 && area >= 12 && w >= 3 && h >= 4 && w < 150 && y1 > 30){ const id = `${r.scene}:FLOAT:${x0},${y0}`; if (!OK.has(id) && !OK.has(`${r.scene}:FLOAT:*`)) mine.push({ t: "FLOAT", id, r: [x0, y0, w, h], note: `底離地板 ${gap} 格` }); }
            }
          } else { stats.noFloor++;
            if (!seen['U' + r.scene]){ seen['U' + r.scene] = 1;   // 沒有 floor() 的場景和戶外場景：這支工具看不了，另外排成一張圖給人看
              const u = document.createElement('div'); u.style.cssText = 'position:relative;line-height:0;height:216px;background:#f0f'; const cu = document.createElement('canvas'); PX.draw(cu, r.scene, o, 1); cu.style.cssText = 'width:384px;height:216px;image-rendering:pixelated'; u.appendChild(cu);
              const ln = document.createElement('div'); ln.style.cssText = 'position:absolute;left:0;right:0;top:196px;border-top:1px dotted #f00'; u.appendChild(ln);
              rects0(r, l).forEach(h => { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:${h[0]*2}px;top:${h[1]*2}px;width:${h[2]*2}px;height:${h[3]*2}px;outline:1px solid #ff0`; u.appendChild(d); });
              const t = document.createElement('div'); t.textContent = `ep${ci+1} ${l.id}/${r.id} (${r.scene})`; t.style.cssText = 'position:absolute;left:0;top:0;color:#ff0;background:#000a;font:11px/1.3 sans-serif;padding:0 3px'; u.appendChild(t); unchecked.push(u); } }
          // 可以點的範圍
          const rects = [...(r.details || []).map(d => [d.id, d.hot]), ...allItems().filter(it => (it.loc || "_") === l.id && it.hot && (it.room || first) === r.id).map(it => [it.id, it.hot])];
          for (const [id, h] of rects){ if (!h || OK.has(`${ci+1}:${id}`)) continue;
            if (h[0] < 0 || h[1] < 0 || h[0] + h[2] > W || h[1] + h[3] > H){ mine.push({ t: "OUT", id, r: h, note: "超出畫面" }); continue; }
            if (fg){ let k = 0; for (let y = h[1]; y < h[1] + h[3]; y++) for (let x = h[0]; x < h[0] + h[2]; x++) k += fg[y * W + x];
              const ek = ci + '|' + l.id + '|' + id; (empt[ek] = empt[ek] || { n: 0, e: 0, line: `ep${ci+1} ${l.id}/${r.id} (${r.scene}) EMPTY ${id} [${h.join(',')}] 每一種狀態下範圍裡都沒有畫東西`, cell: null }); empt[ek].n++;
              if (k < Math.min(8, h[2] * h[3] * 0.08)){ empt[ek].e++; mine.push({ t: "EMPTY", id, r: h, ek }); } }
          }
          const fresh = mine.filter(m => !seen['F' + ci + r.scene + m.id]); mine.forEach(m => seen['F' + ci + r.scene + m.id] = 1);
          if (!fresh.length) continue;
          fresh.filter(m => m.t !== 'EMPTY').forEach(m => flags.push(`ep${ci+1} ${l.id}/${r.id} (${r.scene}) ${m.t} ${m.id} [${m.r.join(",")}] ${m.note}`));
          const wdiv = document.createElement('div'); wdiv.style.cssText = 'position:relative;line-height:0;height:324px'; c.style.cssText = 'width:576px;height:324px;image-rendering:pixelated'; wdiv.appendChild(c);
          const box = (x, y, ww, hh, css) => { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:${x*3-2}px;top:${y*3-2}px;width:${ww*3+2}px;height:${hh*3+2}px;${css}`; wdiv.appendChild(d); };
          if (yf !== null) box(0, yf, 192, 0, 'border-top:1px dotted #0ff');
          mine.forEach(m => box(...m.r, m.t === "FLOAT" ? 'outline:1px solid #f00' : 'outline:1px solid #ff0'));
          const t = document.createElement('div'); t.textContent = `ep${ci+1} ${l.id}/${r.id} (${r.scene}) ${mine.map(m => m.t).join(" ")}`; t.style.cssText = 'position:absolute;left:0;top:0;color:#ff0;background:#000a;font:11px/1.3 sans-serif;padding:0 3px'; wdiv.appendChild(t);
          cells.push({ el: wdiv, hard: fresh.some(m => m.t !== 'EMPTY'), eks: fresh.filter(m => m.t === 'EMPTY').map(m => m.ek) });
        }
      } }
    }
    // 可點範圍：每一種狀態都是空的才算
    const bad = new Set(Object.keys(empt).filter(k => empt[k].e === empt[k].n)); bad.forEach(k => flags.push(empt[k].line));
    cells.filter(c => c.hard || c.eks.some(k => bad.has(k))).forEach(c => bx.appendChild(c.el));
    const ux = document.createElement('div'); ux.id = 'glux'; ux.style.cssText = 'display:grid;grid-template-columns:repeat(5,384px);gap:4px;background:#222;padding:4px;position:absolute;left:0;top:0;z-index:99998;width:max-content'; unchecked.forEach(u => ux.appendChild(u)); document.body.appendChild(ux);
    return { flags, stats, n: bx.children.length, u: unchecked.length };
  }, [from, to, [...OK]]);
  console.log(res.flags.join('\n'));
  console.log(`rooms ${res.stats.rooms}, without floor() or outdoor ${res.stats.noFloor}, flagged rooms ${res.n}`);
  for (let k = 0; k * 12 < res.n; k++){   // 每張圖 12 個房間
    await p.evaluate(k => [...document.getElementById('glbx').children].forEach((e, i) => e.style.display = (i >= k * 12 && i < k * 12 + 12) ? '' : 'none'), k);
    await p.waitForTimeout(120); await (await p.$('#glbx')).screenshot({ path: out.replace(/\.png$/, '') + '-' + k + '.png' }); }
  await p.evaluate(() => { document.getElementById('glbx').style.display = 'none'; });
  for (let k = 0; k * 25 < res.u; k++){   // 看不了的場景：每張圖 25 個，紅虛線＝人站的線，黃框＝可以點的範圍
    await p.evaluate(k => [...document.getElementById('glux').children].forEach((e, i) => e.style.display = (i >= k * 25 && i < k * 25 + 25) ? '' : 'none'), k);
    await p.waitForTimeout(120); await (await p.$('#glux')).screenshot({ path: out.replace(/\.png$/, '') + '-look-' + k + '.png' }); }
  console.log(`scenes to look at by eye (no floor() / outdoor): ${res.u}`);
  console.log(errs.length ? errs.slice(0, 5) : (res.flags.length ? `GROUND LINT: ${res.flags.length} to look at (${out})` : 'GROUND LINT PASS')); await b.close();
})();
