// 四個可選設定的檢查（都在第 6 集上臨時試，試完還原）。用法：node tools/phaseopts.js [截圖資料夾]（要先在 detective/ 開 python3 -m http.server 8765）
// 1) EPn.phaseWord：一個 phase 的叫法（今天／下一天／結束今天…）  2) phases[n].tip：早上簡報最後一句提示（字＝換掉，false＝不說）
// 3) EPn.world[地點].street = false：只有室內，走不到街上；band:false／"sign"：上面那條外牆換成天花板           4) 問題的 until：過了那一段，還沒問的問題收起來
// 5) 每次打開案件，走動畫面的狀態都重新開始（上一集站的位置、還沒講完的開場，不會跑到有同名地點的下一集）
// 6) 外牆：EPn.world[地點].facadeDark = true（停電：窗和門燈都是暗的）；band 有寫＝平房，街上看只有一層；沒有街道、頭尾是戶外場景時外面是黑的
// 最後要印出 PHASE OPTS PASS。
const {chromium}=require('playwright'); const shot=process.argv[2]; const PORT=process.env.PORT||8765;
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(`http://localhost:${PORT}/index.html`); await p.waitForTimeout(500);
const open=()=>p.evaluate(async()=>{ localStorage.clear(); try{ ARC.reset(); }catch(e){} window.uiConfirm=async()=>true; window.toast=()=>{}; CASES[5].locations.forEach(l=>WORLD.reset(l.id));
  await openCase(5); for (let i=0;i<30&&inter;i++) closeSheet(); if (SHEETS.includes(tab)) closeSheet(); WORLD.skip(); render(); });
await open();
// 1) 叫法
const words=w=>p.evaluate(w=>{ delete C.phaseWord; if (w) C.phaseWord=w; const txt=()=>document.body.innerText, r={};
  openBuddy(); r.menu=[...document.querySelectorAll('.fs-panel .wq')].map(e=>e.childNodes[0].textContent.trim()).find(t=>t.includes('進入「'))||''; closePanel();
  openSheet('brief'); r.brief=document.body.textContent; closeSheet(); leaveWorld(); r.mapBtn=(document.querySelector('.hb.go')||{}).textContent; r.map=txt();
  r.pw=pw("🌙 今天能做的都做完了，到「案情」進入下一天。"); openLoc=mapFrom; wArrive=null; render(); delete C.phaseWord; return r; }, w);
const W0=await words(null); await p.waitForTimeout(300); const W1=await words({ unit:"段" }); await p.waitForTimeout(300); const W2=await words({ unit:"段", next:"下午", icon:"☀️" }); await p.waitForTimeout(300);
const old=/今天|下一天|每天|隔天|明天/;
const ok1 = /^🌙 結束今天，進入「/.test(W0.menu) && W0.mapBtn==="🌙 下一天" && /案件一共 \d+ 天/.test(W0.brief) && W0.brief.includes("「進入下一天」") && W0.pw.includes("今天")
  && /^⏭ 結束這一段，進入「/.test(W1.menu) && W1.mapBtn==="⏭ 下一段" && /案件一共 \d+ 段/.test(W1.brief) && W1.brief.includes("「進入下一段」") && W1.pw==="⏭ 這一段能做的都做完了，到「案情」進入下一段。"
  && W2.mapBtn==="☀️ 下午" && W2.brief.includes("「進入下午」");
// 設定以後，引擎自己的字裡不可以還有「今天／下一天…」（劇本寫的字不算，所以只看玩法說明那一段）
const help1=(W1.brief.match(/🕐 時間[\s\S]*?「進入下一段」[^\n]*/)||[''])[0]; const ok1b = help1.length>40 && !old.test(help1);
// 2) 早上的提示
const T=await p.evaluate(()=>{ const l=curLoc(), def=worldDef(l), P=PH(), keep=P.tip; const last=()=>{ const s=WK.morning(def,"小吳").filter(k=>k.say); return s[s.length-1].say[1]; };
  const r={}; delete P.tip; r.def=last(); r.n0=WK.morning(def,"小吳").length; P.tip="這一段只能待在這裡。"; r.txt=last(); r.n1=WK.morning(def,"小吳").length; P.tip=false; r.off=last(); r.n2=WK.morning(def,"小吳").length;
  if (keep===undefined) delete P.tip; else P.tip=keep; return r; });
const ok2 = T.def.includes("可以調查") && T.txt==="這一段只能待在這裡。" && T.n1===T.n0 && !T.off.includes("可以調查") && T.n2===T.n0-1;
// 3) 沒有街道
const lid=await p.evaluate(()=>C.locations.find(l=>locOpen(l) && l.id!==curLoc().id && roomsOf(l).some(r=>!(C.outScenes||[]).includes(r.scene))).id);
const street=async off=>{ await p.evaluate(([lid,off])=>{ const w=(C.world=C.world||{}); window.__old=w[lid]; if (off) w[lid]={ ...(w[lid]||{}), street:false }; WORLD.reset(lid); openLoc=lid; wArrive=null; render(); },[lid,off]);
  await p.waitForTimeout(500); await p.evaluate(()=>{ WORLD.skip(); WORLD.goTo(0, 124); }); await p.waitForTimeout(3500);
  if (shot) await p.screenshot({path:`${shot}/street-${off?'off':'on'}.png`});
  return p.evaluate(lid=>{ const l=LOC(lid), def=worldDef(l), s=WORLD.state(lid, def); const w0=C.world[lid]; C.world[lid]={ ...(w0||{}), band:false }; const noLab=worldDef(l).buildings.every(b=>!(b.labels||[]).length); C.world[lid]={ ...(w0||{}), band:'sign' }; const lab=worldDef(l).buildings[0].labels.length>0; if (w0===undefined) delete C.world[lid]; else C.world[lid]=w0; const r={ band:noLab && lab && def.buildings[0].labels.length>0, minX:def.minX, park:def.park, spawn:def.spawn, w:def.w, px:Math.round(s.px), cam:Math.round(s.cam), street:def.areas.some(a=>a.id==="_street"), doors:def.buildings.map(b=>JSON.stringify(b.doors||null)).join('|'), car:!!s.car, x0:def.buildings[0].x0, x1:def.buildings[def.buildings.length-1].x1,
      chips:[...document.querySelectorAll('.wnav, .wsign, [data-nav]')].map(e=>e.textContent).join('|') };
    const w=C.world; if (window.__old===undefined) delete w[lid]; else w[lid]=window.__old; WORLD.reset(lid); return r; }, lid); };
const S0=await street(false), S1=await street(true);
const ok3 = S0.band && S1.band && S0.minX===undefined && S0.street && S0.px<S0.x0 && S0.car
  && S1.minX===S1.x0 && !S1.street && S1.park===undefined && !S1.car && S1.spawn>S1.x0+16 && S1.px>=S1.minX+16 && S1.w===S1.x1 && S1.doors.split("|").every(d=>d==="[false,false]") && (S1.w-S1.minX<=240 ? S1.cam<=S1.minX : S1.cam>=S1.minX);
// 4) 問題的 until
const Q=await p.evaluate(()=>{ const s=C.suspects.find(s=>!isGone(s) && s.questions.filter(q=>unlocked(q) && !S.asked.includes(q.id)).length>=2), qs=s.questions.filter(q=>unlocked(q) && !S.asked.includes(q.id)), a=qs[0], c=qs[1], ph=S.phase, r={};
  const n=()=>qsOf(s).length, av=availCount; r.n0=n(); r.av0=av(); a.until=ph; c.until=ph; r.n1=n();   // 這一段還看得到
  S.asked.push(c.id);                                                                                 // c 問過了
  S.phase=ph+1; r.n2=n(); r.live=[qLive(a), qLive(c)]; r.av2=av(); const k=S.asked.length; ask(s, a); r.askBlocked=S.asked.length===k;
  S.phase=ph; S.asked.splice(S.asked.indexOf(c.id),1); delete a.until; delete c.until; r.n3=n(); return r; });
const ok4 = Q.n1===Q.n0 && Q.n2===Q.n0-1 && Q.live.join()==="false,true" && Q.askBlocked && Q.n3===Q.n0;
console.log(JSON.stringify({W0:{menu:W0.menu,mapBtn:W0.mapBtn}, W1:{menu:W1.menu,mapBtn:W1.mapBtn,pw:W1.pw}, W2:{mapBtn:W2.mapBtn}, help1:help1.slice(0,400), T, S0, S1, Q}));
// 5) 換案件：狀態重新開始
const R=await p.evaluate(async()=>{ const l=curLoc(), a=WORLD.state(l.id, worldDef(l)); a.px=worldDef(l).w-40; a.mark=1; goHome(); await openCase(5); for (let i=0;i<30&&inter;i++) closeSheet(); if (SHEETS.includes(tab)) closeSheet();
  const b=WORLD.state(l.id, worldDef(l)); return { fresh:a!==b && !b.mark, px:Math.round(b.px) }; });
const ok5 = R.fresh;
// 6) 外牆：facadeDark（停電）、band 有寫＝平房（外面只畫一層）、band:false＝外面也沒有招牌；沒有街道而且頭尾是戶外場景：場景外面是黑的
const F=await p.evaluate(lid=>{ const l=LOC(lid), w=(C.world=C.world||{}), w0=w[lid]; const B=o=>{ w[lid]={ ...(w0||{}), ...o }; const b=worldDef(l).buildings[0]; return { y0:b.y0, rows:b.rows.length, dark:b.dark, sign:typeof b.sign, labels:(b.labels||[]).length }; };
  const r={ def:B({}), dark:B({ facadeDark:true }), sign:B({ band:"sign" }), none:B({ band:false }) }; if (w0===undefined) delete w[lid]; else w[lid]=w0; return r; }, lid);
const ok6a = F.def.y0===4 && F.def.rows===2 && F.def.dark===false && F.def.sign==="function" && F.dark.dark===true && F.dark.rows===2
  && F.sign.y0===24 && F.sign.rows===1 && F.sign.sign==="function" && F.sign.labels>0 && F.none.y0===24 && F.none.rows===1 && F.none.sign!=="function" && F.none.labels===0;
// 平房在街上看：屋頂上面是天空，不是裡面的天花板（#3b3b40）；走進去才看得到天花板
const roofPx=async inside=>{ await p.evaluate(([lid,inside])=>{ const w=(C.world=C.world||{}); window.__old=w[lid]; w[lid]={ ...(w[lid]||{}), band:"sign" }; WORLD.reset(lid); openLoc=lid; wArrive=null; render(); },[lid,inside]);
  await p.waitForTimeout(500); await p.evaluate(inside=>{ WORLD.skip(); if (inside){ const d=worldDef(curLoc()); WORLD.goTo(d.buildings[0].x0+60, 124); } }, inside); await p.waitForTimeout(inside?3500:900);
  if (shot) await p.screenshot({path:`${shot}/flat-${inside?'in':'out'}.png`});
  return p.evaluate(lid=>{ const d=worldDef(LOC(lid)), s=WORLD.state(lid, d), b=d.buildings[0], cv=document.getElementById("worldcv"), x=Math.round(Math.max(b.x0+40, s.cam+4)-s.cam);
    const px=[...cv.getContext("2d").getImageData(x, 10, 1, 1).data].slice(0,3).join(); const w=C.world; if (window.__old===undefined) delete w[lid]; else w[lid]=window.__old; WORLD.reset(lid); return px; }, lid); };
const slab="59,59,64", pxOut=await roofPx(false), pxIn=await roofPx(true); const ok6b = pxOut!==slab && pxIn===slab;
// 頭一個房間是戶外場景的地點（第 5 集的 school）：關掉街道以後，畫面最左邊那幾格要是黑的
await p.evaluate(async()=>{ await openCase(4); for (let i=0;i<30&&inter;i++) closeSheet(); if (SHEETS.includes(tab)) closeSheet(); WORLD.skip();
  const lid="school", w=(C.world=C.world||{}); window.__old=w[lid]; w[lid]={ ...(w[lid]||{}), street:false }; WORLD.reset(lid); openLoc=lid; wArrive=null; render(); });
await p.waitForTimeout(500); await p.evaluate(()=>{ WORLD.skip(); WORLD.goTo(0, 124); }); await p.waitForTimeout(3000); if (shot) await p.screenshot({path:`${shot}/edge.png`});
const E=await p.evaluate(()=>{ const lid="school", d=worldDef(LOC(lid)), s=WORLD.state(lid, d), cv=document.getElementById("worldcv"), g=cv.getContext("2d"), r={ cam:Math.round(s.cam), minX:d.minX, out:roomsOf(LOC(lid))[0].scene, px:[] };
  [20, 60, 100].forEach(y=>[1, 4].forEach(x=>r.px.push([...g.getImageData(x, y, 1, 1).data].slice(0,3).join())));
  const w=C.world; if (window.__old===undefined) delete w[lid]; else w[lid]=window.__old; WORLD.reset(lid); return r; });
const ok6c = E.cam===E.minX && E.px.every(c=>c==="12,10,8");
const ok6 = ok6a && ok6b && ok6c;
console.log(JSON.stringify({ok1, ok1b, ok2, ok3, ok4, ok5, ok6, R, F, pxOut, pxIn, E}));
console.log(ok1 && ok1b && ok2 && ok3 && ok4 && ok5 && ok6 && !errs.length ? "PHASE OPTS PASS" : "PHASE OPTS FAIL", errs); await b.close(); })();
