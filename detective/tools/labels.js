// 場景裡的字（EPn.world[地點].labels）的檢查，在第 6 集、第 17 集上臨時加幾個字來試，試完還原。
// 用法：node tools/labels.js [截圖資料夾]（要先在 detective/ 開 python3 -m http.server 8765）。最後要印出 SCENE LABELS PASS。
// 1) 沒寫 labels：走動畫面沒有多出任何東西  2) 走動畫面：在街上看不到、走進去才出現；位置（左邊、基線）對得上；when 是 false 的不出現
// 3) 人走到字前面：被擋住的那幾個字收起來，走開又出現  4) 放大的場景：字直接畫在畫布上；走動畫面的小畫布不畫（PX.inWorld）
// 5) 戶外場景在晚上：字的顏色跟著場景變暗，tint:false 的不變
const {chromium}=require('playwright'); const shot=process.argv[2]; const PORT=process.env.PORT||8765;
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(`http://localhost:${PORT}/index.html`); await p.waitForTimeout(500);
const open=ci=>p.evaluate(async ci=>{ localStorage.clear(); try{ ARC.reset(); }catch(e){} window.uiConfirm=async()=>true; window.toast=()=>{}; await openCase(ci); for (let i=0;i<30&&inter;i++) closeSheet(); if (SHEETS.includes(tab)) closeSheet(); WORLD.skip(); render(); }, ci);
await open(5);
const lid=await p.evaluate(()=>C.locations.find(l=>locOpen(l) && l.id!==curLoc().id && roomsOf(l).some(r=>!(C.outScenes||[]).includes(r.scene))).id);
const enter=async(labels)=>{ await p.evaluate(([lid,labels])=>{ const w=(C.world=C.world||{}); if (!('__k' in window)) window.__k=w[lid]; w[lid]=labels?{ ...(window.__k||{}), labels:eval(labels) }:window.__k; if (w[lid]===undefined) delete w[lid];
  WORLD.reset(lid); openLoc=lid; wArrive=null; render(); },[lid,labels]); await p.waitForTimeout(500); await p.evaluate(()=>WORLD.skip()); await p.waitForTimeout(700); };
const walk=async(dx)=>{ await p.evaluate(dx=>{ const d=worldDef(curLoc()); WORLD.goTo(d.buildings[0].x0+6+dx,124); }, dx); await p.waitForTimeout(3800); };
const dom=()=>p.evaluate(()=>{ const cv=document.getElementById('worldcv'), r=cv.getBoundingClientRect(), k=r.width/240, d=worldDef(curLoc()), s=WORLD.state(curLoc().id, d);
  return { k, cam:Math.round(s.cam), x0:d.buildings[0].x0, texts:!!d.texts, els:[...document.querySelectorAll('.wtext')].map(e=>{ const q=e.getBoundingClientRect(), i=e.querySelector('i'), b=i?i.getBoundingClientRect():q;
    return { t:e.textContent, on:e.style.display!=='none' && +e.style.opacity>0.9, left:(q.left-r.left)/k+s.cam, base:(b.top-r.top)/k, w:q.width/k, color:e.style.color, weight:e.style.fontWeight, hid:[...e.querySelectorAll('span')].map(c=>c.style.visibility==='hidden'?'x':'o').join('') }; }) }; });
// 1) 沒寫
await enter(null); await walk(40); const D0=await dom(); const ok1 = !D0.texts && D0.els.length===0;
// 2) 走動畫面
const LAB=`[{ x:14, y:22, text:"南澳雜貨店", size:9, color:"#ffe9a8", bold:true }, { x:96, y:40, text:"營業中 OPEN", size:6, color:(ph)=>ph>50?"#000000":"#d23a3a", align:"center" },
  { x:150, y:62, text:"木炭", size:4 }, { x:60, y:84, text:"今日公休的牌子", size:6, color:"#fff8e8" }, { x:10, y:100, text:"之後才有", size:5, when:ph=>ph>=50 }]`;
await enter(LAB); const Dout=await dom(); if (shot) await p.screenshot({path:`${shot}/out.png`});
await walk(20); const Din=await dom(); if (shot) await p.screenshot({path:`${shot}/in.png`});
const ox=Din.x0+6, near=(a,b,t)=>Math.abs(a-b)<=t, E=Din.els;
const ok2 = Dout.texts && Dout.els.length>=4 && Dout.els.every(e=>!e.on)
  && E.length===5 && E[0].on && E[1].on && E[2].on && !E[4].on
  && near(E[0].left, ox+14, 0.6) && near(E[0].base, 26+22, 0.6) && E[0].weight==="700" && near(E[0].w, 45, 3)
  && near(E[1].left+E[1].w/2, ox+96, 0.8) && near(E[1].base, 26+40, 0.6) && /210, 58, 58/.test(E[1].color)
  && near(E[2].left, ox+150, 0.6) && near(E[2].base, 26+62, 0.6) && E[2].weight==="400";
// 3) 人擋住字
await walk(96); const Dblock=await dom(); if (shot) await p.screenshot({path:`${shot}/block.png`});
await walk(176); const Dfree=await dom();
const ok3 = /x/.test(Dblock.els[3].hid) && Dblock.els[0].hid==="ooooo" && Dfree.els[3].hid==="ooooooo";
// 4) 放大的場景＋小畫布
const Big=await p.evaluate(lid=>{ const r=roomsOf(LOC(lid))[0], sc=r.scene, list=PX.sceneLabels(sc, { phase:S.phase }), seen=[]; const f=PX.SCENES[sc], g=function(o){ seen.push(PX.inWorld); return f.apply(this, arguments); }; Object.assign(g, f); PX.SCENES[sc]=g;
  const cv=document.createElement('canvas'); cv.style.cssText='position:fixed;left:0;top:0;width:384px;z-index:9'; document.body.appendChild(cv);
  PX.draw(cv, sc, { phase:S.phase }); const withL=cv.toDataURL(); const keep=PX.sceneLabels; PX.sceneLabels=null; PX.draw(cv, sc, { phase:S.phase }); const noL=cv.toDataURL(); PX.sceneLabels=keep;
  const w=C.world[lid]; w.ropt={ [r.id]:{ __bust:1 } }; WORLD.reset(lid); render(); cv.remove(); window.__seen=seen; window.__undo=()=>{ delete w.ropt; PX.SCENES[sc]=f; };   // ropt 換一個值：小畫布上的房間要重畫一次
  return { n:list.length, first:list[0], col:list[1].color, differ:withL!==noL, big:seen.slice(0,2), other:PX.sceneLabels("__none__", {}).length }; }, lid);
await p.waitForTimeout(600); Big.world=await p.evaluate(()=>{ const v=window.__seen.slice(2); window.__undo(); return v; });
const ok4 = Big.n===4 && Big.first.text==="南澳雜貨店" && Big.first.x===14 && Big.first.y===22 && Big.first.bold===true && Big.col==="#d23a3a" && Big.differ && Big.big.join()==="false,false" && Big.world.length>0 && Big.world.every(v=>v===true) && Big.other===0;
await enter(null);
// 5) 戶外場景、晚上
await open(16);
const N=await p.evaluate(()=>{ const l=C.locations.find(l=>(C.outScenes||[]).includes(roomsOf(l)[0].scene)), w=(C.world=C.world||{}), w0=w[l.id], sky=C.worldSky; const r={ lid:l.id };
  w[l.id]={ ...(w0||{}), labels:[{ x:10, y:60, text:"廟口", color:"#ffffff" }, { x:10, y:80, text:"不變", color:"#ffffff", tint:false }, { x:10, y:10, text:"上面", color:"#ffffff" }] };
  C.worldSky=()=>["#0b0f1c","#27324a","#18241f","#1d2c25",0,1]; r.night=worldDef(l).texts({ phase:0 }).map(t=>[t.color, t.y]);
  C.worldSky=()=>["#6fa0d0","#cfe3ee","#4f7a4a","#5f8a5a",0,0]; r.day=worldDef(l).texts({ phase:0 }).map(t=>t.color);
  C.worldSky=sky; if (w0===undefined) delete w[l.id]; else w[l.id]=w0; return r; });
const ok5 = N.night[0][0]==="#919399" && N.night[1][0]==="#ffffff" && N.night[0][1]===86 && N.night[2][1]===23 && N.day.join()==="#ffffff,#ffffff,#ffffff";
console.log(JSON.stringify({ D0:{texts:D0.texts,n:D0.els.length}, Dout:Dout.els.map(e=>e.on), Din:E.map(e=>[e.t,e.on,+e.left.toFixed(1),+e.base.toFixed(1),+e.w.toFixed(1)]), ox, block:Dblock.els.map(e=>e.hid), free:Dfree.els.map(e=>e.hid), Big, N }));
console.log(JSON.stringify({ok1, ok2, ok3, ok4, ok5}));
console.log(ok1 && ok2 && ok3 && ok4 && ok5 && !errs.length ? "SCENE LABELS PASS" : "SCENE LABELS FAIL", errs); await b.close(); })();
