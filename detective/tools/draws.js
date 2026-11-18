// 每一集的地圖、每個地點的走動畫面都打開畫幾格，看有沒有畫到一半就出錯（例如 mapDraw 用了沒拿出來的 P）。
// 畫面出錯不會讓遊戲停下來，只會少畫東西（地圖沒有路、沒有車），所以要另外查。
// 用法：node tools/draws.js [第幾集（從 1 算），不寫＝全部]（要先在 detective/ 開 python3 -m http.server 8765）。最後要印出 DRAWS PASS。
const {chromium}=require('playwright'); const only=+process.argv[2]||0; const PORT=process.env.PORT||8765;
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1180,height:820}}); let cur=""; const errs=[]; p.on('pageerror',e=>{ const m=cur+": "+e.message+" @ "+((e.stack||"").split("\n")[1]||"").trim(); if (!errs.includes(m)) errs.push(m); });
await p.goto(`http://localhost:${PORT}/index.html`); await p.waitForTimeout(500);
const n=await p.evaluate(()=>CASES.length); let shots=0;
for (let i=0;i<n;i++){ if (only && only!==i+1) continue; cur=`第 ${i+1} 集 開案`;
  const locs=await p.evaluate(async i=>{ localStorage.clear(); try{ ARC.reset(); }catch(e){} window.uiConfirm=async()=>true; window.toast=()=>{}; await openCase(i); for (let k=0;k<30&&inter;k++) closeSheet(); if (SHEETS.includes(tab)) closeSheet(); try{ WORLD.skip(); }catch(e){} render();
    return { ids:(C.locations||[]).filter(l=>{ try{ return !!worldDef(l); }catch(e){ return false; } }).map(l=>l.id), map:!!travel(), phases:phasesOf(C).length }; }, i);
  await p.waitForTimeout(250);
  // 每一段各看一次（房間、天色、外牆會跟著段落變）
  for (let ph=0; ph<locs.phases; ph++){
    await p.evaluate(ph=>{ S.phase=ph; }, ph);
    if (locs.map){ cur=`第 ${i+1} 集 地圖（第 ${ph} 段）`; await p.evaluate(()=>{ try{ leaveWorld(); }catch(e){ throw e; } }); await p.waitForTimeout(220); shots++; }
    for (const lid of locs.ids){ cur=`第 ${i+1} 集 ${lid}（第 ${ph} 段）`;
      const ok=await p.evaluate(lid=>{ const l=LOC(lid); if (!locOpen(l)) return false; WORLD.reset(lid); openLoc=lid; wArrive=null; tab="map"; render(); return true; }, lid); if (!ok) continue;
      await p.waitForTimeout(160); await p.evaluate(()=>{ try{ WORLD.skip(); const d=worldDef(curLoc()); if (d && d.buildings && d.buildings[0]) WORLD.goTo(d.buildings[0].x0+40, 124); }catch(e){} }); await p.waitForTimeout(160); shots++; } } }
console.log(`${shots} 個畫面`); errs.forEach(e=>console.log("  ✗ "+e));
console.log(errs.length ? `DRAWS FAIL ${errs.length}` : "DRAWS PASS"); await b.close(); })();
