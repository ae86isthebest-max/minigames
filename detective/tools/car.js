// 「停在場景裡的車」設定（EPn.car／EPn.world[地點].car）的檢查。用法：node tools/car.js（要先在 detective/ 開 python3 -m http.server 8765）
// 在一集還是橫向畫面的案子上臨時試（從最後一集往前找）：不寫（巡邏車）／顏色（一般的車）／false（沒有車，走路進來）／只改一個地點；同一次開遊戲換設定，停著的車要跟著換。
// 最後要印出 CAR TEST PASS。
const {chromium}=require('playwright'); const PORT=process.env.PORT||8765;
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(`http://localhost:${PORT}/index.html`); await p.waitForTimeout(500);
// 原本用第 6 集；第 6 集起陸續改成俯視畫面（TOPW），改成從最後一集往前找：整集還是橫向畫面、沒有自己寫 EPn.car、開頭就有第二個地點、第一個地點的開場有車
const CI=await p.evaluate(async()=>{ for (let i=CASES.length-1;i>=0;i--){ const c=CASES[i]; if (c.car!==undefined || Object.values(c.world||{}).some(w=>w&&(w.top||w.car!==undefined))) continue;
  localStorage.clear(); await openCase(i); for (let k=0;k<30&&inter;k++) closeSheet(); if (SHEETS.includes(tab)) closeSheet();
  const l=C.locations.find(x=>locOpen(x) && x.id!==curLoc().id); if (l && WK.arrive(worldDef(l)).some(k=>k.car)) return i; } return -1; });
const run=(car, locCar, fresh)=>p.evaluate(async ([car, locCar, fresh, CI])=>{ localStorage.clear(); try{ ARC.reset(); }catch(e){} window.uiConfirm=async()=>true; window.toast=()=>{};
  const E=CASES[CI]; delete E.car; if (car !== null) E.car = car; if (fresh) E.locations.forEach(l=>WORLD.reset(l.id));
  await openCase(CI); for (let i=0;i<30&&inter;i++) closeSheet(); if (SHEETS.includes(tab)) closeSheet(); WORLD.skip(); render();
  // 用第二個地點來看（第一個地點的開場劇本自己指定了巡邏車的顏色，那種車照劇本，不跟設定）
  const l=C.locations.find(x=>locOpen(x) && x.id!==curLoc().id), w=(C.world=C.world||{}), old=w[l.id]; if (locCar !== null) w[l.id]={ ...(old||{}), car:locCar };
  openLoc=l.id; wArrive=null;
  render(); await new Promise(r=>setTimeout(r,300));
  const def=worldDef(l), s=WORLD.state(l.id, def), r={ park:def.park, of:WORLD.carOf(def), car:s.car ? s.car.c : null, arrive:WK.arrive(def).map(k=>k.car ? "car" : k.walk ? "walk" : "set").join() };
  if (locCar !== null){ if (old===undefined) delete w[l.id]; else w[l.id]=old; } delete E.car; return r; },[car, locCar, fresh, CI]);
const P="#e9e4da", G="#7a8a6a";
const A=await run(null,null,true), B=await run(G,null,true), N=await run(false,null,true), L=await run(G,false,true), M=await run(null,G,true), S1=await run(G,null,false), S2=await run(null,null,false), S3=await run(false,null,false);
console.log(JSON.stringify({A,B,N,L,M,S1,S2,S3}));
const ok = A.park!==undefined && A.of===P && A.car===P && A.arrive==="set,car,set" && B.of===G && B.car===G && B.arrive==="set,car,set" && N.of===false && N.car===null && N.arrive==="set,walk"
  && L.of===false && L.car===null && M.of===G && M.car===G && S1.car===G && S2.car===P && S3.car===null && !errs.length;
console.log(ok ? "CAR TEST PASS" : "CAR TEST FAIL", errs); await b.close(); })();
