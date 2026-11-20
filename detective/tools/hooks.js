// 三個可選的引擎接口的檢查（在一集還是橫向畫面的案子上臨時試，試完還原；第 6 集改成俯視以後自動往後找）。用法：node tools/hooks.js [截圖資料夾]（要先在 detective/ 開 python3 -m http.server 8765）
// 1) EPn.world[地點].front(p, t, op, cam, def)：畫在所有人前面的那一層（淹到腿的水、霧）
// 2) EPn.world[地點].ext：false＝從外面看整棟塗黑；函式＝自己畫外觀。有寫的時候外面的招牌字不放
// 3) 房間這一段沒開（phase／until／requires），裡面的證物就不算可以查：itemOpen 是 false、inspect() 沒有作用；
//    找不到房間 id 的、用 spots／area 搬到別處的、自己寫走動場景的地點，照舊
// 最後要印出 ENGINE HOOKS PASS。
const {chromium}=require('playwright'); const shot=process.argv[2]; const PORT=process.env.PORT||8765;
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(`http://localhost:${PORT}/index.html`); await p.waitForTimeout(500);
await p.evaluate(async()=>{ localStorage.clear(); try{ ARC.reset(); }catch(e){} window.uiConfirm=async()=>true; window.toast=()=>{};
  // 用哪一集：第 6 集起陸續改成俯視畫面（TOPW），這裡從最後一集往前找一集還是橫向畫面、開頭就有「兩個房間以上、全在室內」的另一個地點
  window.okLoc=l=>locOpen(l) && l.id!==curLoc().id && roomsOf(l).length>1 && roomsOf(l).every(r=>!(C.outScenes||[]).includes(r.scene)) && (worldDef(l).buildings||[]).length===1 && worldDef(l).buildings[0].x0<200;   // 一棟、房間全在室內、離街口不遠（取樣點在畫面裡）
  for (let i=CASES.length-1;i>=0;i--){ const c=CASES[i]; if (Object.values(c.world||{}).some(w=>w&&w.top)) continue; await openCase(i); for (let k=0;k<30&&inter;k++) closeSheet(); if (SHEETS.includes(tab)) closeSheet(); if (C.locations.some(okLoc)) break; }
  for (let i=0;i<30&&inter;i++) closeSheet(); if (SHEETS.includes(tab)) closeSheet(); WORLD.skip(); render(); });
const lid=await p.evaluate(()=>C.locations.find(okLoc).id);
const enter=async(opt)=>{ await p.evaluate(([lid,opt])=>{ const w=(C.world=C.world||{}); if (!('__k' in window)) window.__k=w[lid]; w[lid]=opt?{ ...(window.__k||{}), ...eval('('+opt+')') }:window.__k; if (w[lid]===undefined) delete w[lid];
  WORLD.reset(lid); openLoc=lid; wArrive=null; render(); },[lid,opt]); await p.waitForTimeout(500); await p.evaluate(()=>{ WORLD.skip(); const d=worldDef(curLoc()); WORLD.goTo(Math.max(8, d.buildings[0].x0-30), 124); }); await p.waitForTimeout(3000); };   // 站到門口外的街上（有的地點一進來就在店裡）
const px=(wx,wy)=>p.evaluate(([wx,wy])=>{ const d=worldDef(curLoc()), s=WORLD.state(curLoc().id, d), cv=document.getElementById('worldcv'); return [...cv.getContext('2d').getImageData(Math.round(wx-s.cam), wy, 1, 1).data].slice(0,3).join(); },[wx,wy]);
const info=()=>p.evaluate(()=>{ const d=worldDef(curLoc()), s=WORLD.state(curLoc().id, d), b=d.buildings[0]; return { px:Math.round(s.px), py:Math.round(s.py), cam:Math.round(s.cam), x0:b.x0, x1:b.x1, ext:typeof b.ext, out:(b.labels||[]).filter(L=>L.when==="out").length, inn:(b.labels||[]).filter(L=>L.when==="in").length }; });
// 1) front：一條洋紅色的帶子蓋在人的腿上
await enter(null); const A0=await info(), legs0=await px(A0.px, 118);
await enter(`{ front:(p, t, op, cam, def) => { window.__front=[!!def && !!def.rooms && def.pos[def.rooms[0].id], cam, op.phase]; p.R(cam, 112, 240, 12, "#ff00ff"); } }`);
const A1=await info(), legs1=await px(A1.px, 118), head1=await px(A1.px, 100), F=await p.evaluate(()=>window.__front); if (shot) await p.screenshot({path:`${shot}/front.png`});
const ok1 = legs0!=="255,0,255" && legs1==="255,0,255" && head1!=="255,0,255" && F && F[0]===A1.x0+6 && F[1]===A1.cam && F[2]===0;
// 2) ext
await enter(`{ ext:false }`); const B1=await info(), wall1=await px(B1.x0+40, 60), top1=await px(B1.x0+40, 2); if (shot) await p.screenshot({path:`${shot}/ext-false.png`});
await enter(`{ ext:(p, t, op, b) => { window.__ext=[b.x0, b.x1, op.phase]; p.R(b.x0, 30, b.x1-b.x0, 94, "#00ff00"); } }`); const B2=await info(), wall2=await px(B2.x0+40, 60), E=await p.evaluate(()=>window.__ext); if (shot) await p.screenshot({path:`${shot}/ext-fn.png`});
await p.evaluate(()=>{ const d=worldDef(curLoc()); WORLD.goTo(d.buildings[0].x0+60,124); }); await p.waitForTimeout(3500); const wall3=await px(B2.x0+40, 60);   // 走進去：外觀淡掉，看得到房間
const ok2 = A0.ext==="undefined" && A0.out===1 && A0.inn===1 && B1.ext==="function" && B1.out===0 && B1.inn===1 && wall1==="12,10,8" && top1==="12,10,8"
  && B2.ext==="function" && B2.out===0 && wall2==="0,255,0" && E && E[0]===B2.x0 && E[1]===B2.x1 && wall3!=="0,255,0";
await enter(null);
// 3) 房間沒開，裡面的證物不能查
const R=await p.evaluate(lid=>{ const l=LOC(lid), rs=roomsOf(l), r=rs[1], it=allItems().find(x=>x.loc===lid && x.room===r.id && !S.seen.includes(x.id) && itemOpen(x) && unlocked(x)), o={ item:!!it }; if (!it) return o;
  const cnt=()=>allItems().filter(x=>!S.seen.includes(x.id) && itemOpen(x) && unlocked(x)).length, n0=cnt(), w=(C.world=C.world||{}), w0=w[lid];
  const inRoom=allItems().filter(x=>x.loc===lid && (x.room||rs[0].id)===r.id && !S.seen.includes(x.id) && itemOpen(x) && unlocked(x)).length;
  r.phase=99; o.closed=[itemOpen(it), itemRoomOpen(it), cnt()-n0===-inRoom]; const k=S.seen.length; openLoc=lid; inspect(it); o.inspected=S.seen.length>k;
  o.spot=(()=>{ w[lid]={ ...(w0||{}), spots:{ [it.id]:[10,100,8,8] } }; const v=itemOpen(it); if (w0===undefined) delete w[lid]; else w[lid]=w0; return v; })();          // 搬到別處的
  o.area=(()=>{ it.area="_street"; const v=itemOpen(it); delete it.area; return v; })();
  o.custom=(()=>{ w[lid]={ ...(w0||{}), auto:false }; const v=itemOpen(it); if (w0===undefined) delete w[lid]; else w[lid]=w0; return v; })();                          // 自己寫走動場景的地點
  o.noRoom=(()=>{ const keep=it.room; it.room="__nope__"; const v=itemOpen(it); it.room=keep; return v; })();                                                             // 找不到房間 id
  delete r.phase; o.until=(()=>{ r.until=-1; const v=itemOpen(it); delete r.until; return v; })();
  o.req=(()=>{ r.requires=["__never__"]; const v=itemOpen(it); delete r.requires; return v; })();
  o.back=[itemOpen(it), cnt()-n0]; return o; }, lid);
const ok3 = R.item && R.closed.join()==="false,false,true" && R.inspected===false && R.spot===true && R.area===true && R.custom===true && R.noRoom===true && R.until===false && R.req===false && R.back.join()==="true,0";
console.log(JSON.stringify({A0, legs0, legs1, head1, F, B1, wall1, top1, wall2, E, wall3, R}));
console.log(JSON.stringify({ok1, ok2, ok3}));
console.log(ok1 && ok2 && ok3 && !errs.length ? "ENGINE HOOKS PASS" : "ENGINE HOOKS FAIL", errs); await b.close(); })();
