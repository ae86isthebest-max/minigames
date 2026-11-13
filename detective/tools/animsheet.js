// 重播／監視器動畫的逐格總表：CASE=案件id node tools/animsheet.js <輸出資料夾> [只看哪個動畫的 id 或場景名] [每段幾格=4] [每格寬=288]
// 只看其中幾段：BEATS=4-7（從 1 算起）。
// 放大看一小塊：CROP=x,y,w,h（192×108 的座標），例如 CROP=80,40,80,45。
// 每個動畫存一張圖：一列是一段（beat），由左到右是這一段的 12%、40%、68%、97%；左上角印第幾段和字幕開頭。
// 用眼睛檢查：動作和字幕對不對、用哪隻手、有沒有走樓梯、人有沒有飄在半空、有沒有穿牆。
// 也會印出引擎覺得可疑的地方（打錯的姿勢／物件名字、斜著走又不在樓梯上的路線）。
const {chromium}=require('playwright');
const out = process.argv[2] || __dirname, only = process.argv[3] && process.argv[3] !== "-" ? process.argv[3] : null;
const CROP = process.env.CROP ? process.env.CROP.split(",").map(Number) : [0,0,192,108];
const N = +(process.argv[4] || 4), CW = +(process.argv[5] || 288), CH = Math.round(CW*CROP[3]/CROP[2]);
const port = process.env.PORT || 8765;
const BR = (process.env.BEATS || "").split("-").map(Number), B0 = BR[0] ? BR[0]-1 : 0, B1 = BR[1] || BR[0] || 999;
(async()=>{const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1400,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(`http://localhost:${port}/index.html`);
const list = await p.evaluate((cid)=>{ localStorage.clear(); window.uiConfirm=async()=>true;
  const i = CASES.findIndex(c=>c.id===cid); if (i < 0) return null; openCase(i);
  const found = [], walk = (o, path, seen=new Set()) => { if (!o || typeof o!=="object" || seen.has(o)) return; seen.add(o);
    if (Array.isArray(o.beats) && o.scene){ found.push({ A:o, path }); return; }
    for (const k in o){ let v; try { v = o[k]; } catch(e){ continue; } if (v && typeof v==="object") walk(v, Array.isArray(o) ? path+"["+(v.id||k)+"]" : path+"."+k, seen); } };
  walk(C, cid); window.__A = found;
  return found.map((f,j)=>({ j, path:f.path, scene:f.A.scene, beats:f.A.beats.length })); }, process.env.CASE);
if (!list){ console.log("找不到案件：CASE=" + process.env.CASE); await b.close(); process.exit(1); }
const warn = [];
for (const it of list){
  if (only && !(it.path.includes(only) || it.scene === only)) continue;
  const w = await p.evaluate(async ({j, N, CW, CH, B0, B1, CROP})=>{
    const A = window.__A[j].A, warn = [];
    let box = document.getElementById('__as'); if (!box){ box = document.createElement('div'); box.id = '__as'; box.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#000'; document.body.appendChild(box); }
    box.innerHTML = '<canvas id="src" style="width:384px"></canvas><canvas id="sheet"></canvas>';
    const src = document.getElementById('src'), sh = document.getElementById('sheet'); const nb = Math.min(A.beats.length, B1) - B0; sh.width = CW*N; sh.height = CH*nb; sh.style.width = sh.width+"px";
    const g = sh.getContext('2d'); g.imageSmoothingEnabled = CROP[2] >= 192;
    const ctl = PX.play(src, A, looksFor, null, false), spans = ctl.beatsAt();
    const tick = () => new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    for (let bi=B0; bi<Math.min(A.beats.length, B1); bi++){ const [t0,t1] = spans[bi], row = bi - B0;
      for (let k=0;k<N;k++){ const f = N===1 ? 0.97 : [0.12,0.4,0.68,0.97,0.25,0.55,0.82][k] ?? (k+0.5)/N; ctl.seek(t0 + (t1-t0)*f); await tick(); const K = src.width/192; g.drawImage(src, CROP[0]*K, CROP[1]*K, CROP[2]*K, CROP[3]*K, k*CW, row*CH, CW, CH); }
      g.fillStyle = "#000b"; g.fillRect(0, row*CH, CW*N, 13); g.fillStyle = "#ffe27a"; g.font = "11px sans-serif"; g.fillText(`#${bi+1} ${A.beats[bi].scene ? "["+A.beats[bi].scene+"] " : ""}${A.beats[bi].t||""} ${(A.beats[bi].cap||"").slice(0, Math.floor(CW*N/12))}`, 3, row*CH+10);
      // 可疑的地方
      const stt = {}, scOf = b => b.scene || A.scene, cur = A.beats[bi], stairsB = cur.stairs || (cur.scene && cur.scene !== A.scene ? [] : A.stairs) || [], laddersB = cur.ladders || (cur.scene && cur.scene !== A.scene ? [] : A.ladders) || [];
      A.beats.slice(0, bi+1).forEach((bt,bj)=>{ if (bj > 0 && scOf(bt) !== scOf(A.beats[bj-1])) Object.keys(stt).forEach(k=>delete stt[k]); Object.entries(bt.m||{}).forEach(([id,v])=>{ const pv = stt[id]||{}; stt[id] = { x:v[0], y:v[1]||96, fx: v[4]!==undefined?v[4]:pv.x!==undefined?pv.x:v[0], fy: v[5]!==undefined?v[5]:pv.y!==undefined?pv.y:(v[1]||96), v, last: bt===A.beats[bi] }; }); if (bt !== A.beats[bi]) (bt.out||[]).forEach(id=>delete stt[id]); });
      Object.entries(stt).forEach(([id,o])=>{ if (!o.last) return; const e = PX.poseErr(o.v[2]); if (e) warn.push(`#${bi+1} ${id}：${e}`);
        const pts = [[o.fx,o.fy], ...(o.v[6]||[]), [o.x,o.y]];
        pts.slice(1).forEach((q,i)=>{ const dx = Math.abs(q[0]-pts[i][0]), dy = Math.abs(q[1]-pts[i][1]);
          const onStair = stairsB.some(k => [pts[i],q].every(pt => { const sx = k[2]-k[0], sy = k[3]-k[1], len = Math.hypot(sx,sy)||1; return Math.abs((pt[0]-k[0])*sy - (pt[1]-k[1])*sx)/len <= 4; }));
          const onLadder = laddersB.some(k => Math.abs(q[0]-k[0]) <= 3 && Math.abs(pts[i][0]-k[0]) <= 3);
          if (dy > 28 && dx > 3 && !onStair) warn.push(`#${bi+1} ${id}：從 (${pts[i]}) 斜著走到 (${q})，高度差 ${dy}，不在 A.stairs 的樓梯上——是樓梯就要宣告，是往裡面走就沒問題`);
          if (dy > 20 && dx <= 3 && !onLadder) warn.push(`#${bi+1} ${id}：從 (${pts[i]}) 直上直下到 (${q})——是梯子就要宣告 A.ladders，是走進門裡就沒問題`); }); });
    }
    ctl.stop(); return warn; }, { j: it.j, N, CW, CH, B0, B1, CROP });
  const name = `${process.env.CASE}_${String(it.j).padStart(2,"0")}_${it.scene}.png`;
  await (await p.$('#sheet')).screenshot({ path: out + "/" + name });
  console.log(`${name}　${it.path}　${it.beats} 段`); w.forEach(x=>{ console.log("   ⚠ " + x); warn.push(x); });
}
console.log(errs.length ? "PAGE ERRORS " + JSON.stringify(errs) : `ANIM SHEETS OK（${warn.length} 個要看一下的地方）`); await b.close();})();
