// 跨集記憶（arc.js）的檢查：臨時在第 1、2 集加上測試用的主線旗標，確認「這一集查到 → 下一集記得」和前情提要兩個版本都正常。
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1180,height:820}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
const boot=async()=>{ await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>{ localStorage.clear(); ARC.reset(); window.uiConfirm=async()=>true;
  ARC.define({ t_gun:{ title:"測試：來路不明的警槍", text:"第 1 集車庫", ep:1 } });
  const it = CASES[0].evidence.find(x=>x.id==="o_car") || CASES[0].evidence[0]; it.arc = "t_gun"; window.TID = it.id;
  CASES[1].arcRecap = [{ flag:"t_gun", text:"FOUND 版本", miss:"MISS 版本" }];
  CASES[1].suspects[0].questions.push({ id:"t_q", q:"（測試）那把槍……", a:"……", requires:["arc:t_gun"] }, { id:"t_q2", q:"（測試）你自己找到的槍", a:"……", requires:["arcfound:t_gun"] });
  delete CASES[0]._arc; delete CASES[1]._arc; }); };
const out={};
// A：先玩第 1 集查到，再開第 2 集
await boot();
out.A = await p.evaluate(()=>{ const r={}; openCase(0); r.before=[has("arc:t_gun"), ARC.list().length]; inspectById(TID); r.after=[has("arc:t_gun"), has("arcfound:t_gun"), ARC.list().map(x=>x.title+"/"+x.how)];
  openCase(1); const qs=C.suspects[0].questions; r.ep2=[ARC.recap(), unlocked(qs.find(q=>q.id==="t_q")), unlocked(qs.find(q=>q.id==="t_q2"))]; r.briefHas=phaseBlock(0).includes("FOUND 版本");
  openCase(1); r.again=ARC.recap(); return r; });
// B：沒查到就開第 2 集（前情提要要用 miss 版本，之後當作已知道；再回第 1 集查到會升級成 found）
await boot();
out.B = await p.evaluate(()=>{ const r={}; openCase(1); const qs=C.suspects[0].questions; r.ep2=[ARC.recap(), unlocked(qs.find(q=>q.id==="t_q")), unlocked(qs.find(q=>q.id==="t_q2")), ARC.list().map(x=>x.how)];
  openCase(1); r.again=ARC.recap();
  openCase(0); inspectById(TID); r.upgraded=[has("arcfound:t_gun"), ARC.list().map(x=>x.how)];
  openCase(1); r.stillMiss=ARC.recap(); return r; });
// C：結案紀錄
await boot();
out.C = await p.evaluate(async()=>{ openCase(0); ['ev_glass','ev_lab','ev_printer','cctv_hall','cctv_back','ev_phone'].forEach(inspectById);
  openSheet('accuse'); pickKind('murder'); ['ho','chow'].forEach(toggleCulprit); ['ev_glass','ev_lab','ev_printer'].forEach(toggleEv); C.reasoning.forEach((r,i)=>pickReason(i,r.answer)); await submitAccuse();
  return [has("arc:done_villa"), has("arc:solved_villa"), ARC.grade("villa"), has("arc:done_tea")]; });
// D：幕間（開場前、結案後），台詞跟著主線旗標變
await boot();
out.D = await p.evaluate(async()=>{ const r={};
  ARC.defineCast({ t_lin:{ name:"林法醫", look:{ skin:"#e8c09a", hair:"#2a2220", hairStyle:"long", top:"#e9e4da", bottom:"#3a3328" } } });
  CASES[0].before = { title:"測試開場", scene:"living", cast:[{ id:"_you", x:40 }, { id:"t_lin", x:120, facing:-1 }], lines:[{ who:"t_lin", text:"B1" }, { who:"you", text:"B2" }] };
  CASES[0].after = { title:"測試收工", scene:"living", cast:[{ id:"_you", x:40 }, { id:"t_lin", x:120, facing:-1 }], arc:"t_talk",
    lines:[{ who:"t_lin", text:"A1" }, { who:"you", text:"A-GUN", when:"arc:t_gun" }, { who:"narr", text:"A-NOGUN", unless:"arc:t_gun" }] };
  openCase(0); r.before=[!!inter, tab, document.body.innerText.includes("測試開場"), document.body.innerText.includes("林法醫")];
  interNext(0); interNext(1); r.beforeEnd=[!!inter, tab, ARC.seen("villa:before")];
  openCase(0); r.beforeAgain=!!inter;
  inspectById(TID); ['ev_glass','ev_lab','ev_printer','cctv_hall','cctv_back','ev_phone'].forEach(inspectById);
  openSheet('accuse'); pickKind('murder'); ['ho','chow'].forEach(toggleCulprit); ['ev_glass','ev_lab','ev_printer'].forEach(toggleEv); C.reasoning.forEach((x,i)=>pickReason(i,x.answer)); await submitAccuse();
  r.court=[S.court, !!inter]; courtNext(1); r.after=[!!inter, [interLine().text]]; interNext(0); r.after[1].push(interLine().text);
  return r; });
await p.waitForTimeout(300);
Object.assign(out.D, await p.evaluate(()=>{ const r={}; interNext(0); r.afterEnd=[!!inter, has("arc:t_talk"), ARC.seen("villa:after"), document.body.innerText.includes("重看幕間：測試收工"), !!S.result]; return r; }));
// E：劇情選擇、限時行動、案件中途由事件觸發的場面
await boot();
out.E = await p.evaluate(async()=>{ const r={}; const wait = ms => new Promise(f=>setTimeout(f, ms));
  CASES[0].after = { title:"測試選擇", lines:[ { who:"narr", text:"L1" },
    { who:"narr", text:"Q1", id:"q1", choices:[ { text:"甲", set:"t_a", say:"SAY-A" }, { text:"乙", set:"t_b", say:[{ who:"you", text:"SAY-B1" }, "SAY-B2"] }, { text:"丙（看不到）", when:"arc:nope" } ] },
    { who:"narr", text:"ONLY-A", when:"arc:t_a" }, { who:"narr", text:"ONLY-B", when:"arc:t_b" },
    { who:"narr", text:"Q2", time:0.6, timeout:0, choices:[ { text:"快", mark:"fast", say:"SAY-FAST" }, { text:"慢", mark:"slow" } ] },
    { who:"narr", text:"END" } ] };
  CASES[0].events = (CASES[0].events||[]).concat([{ id:"t_ev", requires:["o_milk"], title:"測試事件", text:"x", scene:{ title:"測試場面", lines:[ { who:"narr", text:"S1" }, { who:"narr", text:"SQ", choices:[ { text:"一", mark:"one" }, { text:"二", mark:"two" } ] }, { who:"narr", text:"S-ONE", when:"pick:one" } ] } }]);
  CASES[0].suspects[0].questions.push({ id:"t_pq", q:"（測試）", a:"…", requires:["pick:one"] });
  openCase(0); const tab0 = tab;
  inspectById('o_milk'); await wait(1000); r.scene=[!!inter, inter && inter.L.title, tab, document.body.innerText.includes("測試場面")];
  interNext(1); r.sceneSkip=[interLine().text, interOpen(interLine())]; interNext(1); r.cantSkip=interLine().text;
  interPick(0); r.sceneBranch=interLine().text; interNext(0); r.sceneEnd=[!!inter, tab===tab0, has("pick:one"), has("pick:two"), unlocked(C.suspects[0].questions.find(q=>q.id==="t_pq")), !!S.scenes["ev:t_ev"]];
  ['ev_glass','ev_lab','ev_printer','cctv_hall','cctv_back','ev_phone'].forEach(inspectById);
  openSheet('accuse'); pickKind('murder'); ['ho','chow'].forEach(toggleCulprit); ['ev_glass','ev_lab','ev_printer'].forEach(toggleEv); C.reasoning.forEach((x,i)=>pickReason(i,x.answer)); await submitAccuse(); courtNext(1);
  const seq=[]; seq.push(interLine().text); interNext(0); seq.push(interLine().text, interChoices(interLine()).length);
  interPick(1); seq.push(interLine().text); interNext(0); seq.push(interLine().text); interNext(0); seq.push(interLine().text); interNext(0);
  seq.push(interLine().text, !!inter.deadline, document.querySelector('.ibar') ? "bar" : "nobar"); await wait(900);
  seq.push(interLine().text); interNext(0); seq.push(interLine().text); interNext(0); seq.push(interLine().text); interNext(0);
  r.seq=seq; r.end0=1; r.end=[!!inter, has("arc:t_b"), has("arc:t_a"), has("pick:fast"), has("pick:slow")];
  // 關掉倒數：同一題不會自動選
  OPT.setTimed(false); interPlay({ title:"t", lines:[{ who:"narr", text:"TQ", time:0.3, choices:[{ text:"a", mark:"ta" }, { text:"b", mark:"tb" }] }] }, "t_off"); await wait(700);
  r.off=[!!inter && interOpen(interLine()), !!(inter && inter.deadline), has("pick:ta"), has("pick:tb")]; interPick(0); OPT.setTimed(true); r.off.push(!!inter, has("pick:ta"));
  CASES[0].before = { title:"x", lines:[{ who:"narr", text:"q", time:5, choices:[{ text:"a" }] }] }; _anyTimed = undefined; goHome(); r.optShown = document.body.innerText.includes("限時行動要倒數"); openCase(0); if (inter){ interPick(0); } 
  openSheet('accuse'); interReplay('after'); interNext(0); r.replay=[interLine().text, interOpen(interLine()), document.body.innerText.includes("你的選擇：乙")]; interNext(1); r.replayEnd=!!inter;
  return r; });
console.log(JSON.stringify(out,null,1));
const E = out.E, okE = E.scene[0] && E.scene[1]==="測試場面" && E.scene[3] && E.sceneSkip[0]==="SQ" && E.sceneSkip[1] && E.cantSkip==="SQ" && E.sceneBranch==="S-ONE" && !E.sceneEnd[0] && E.sceneEnd[1] && E.sceneEnd[2] && !E.sceneEnd[3] && E.sceneEnd[4] && E.sceneEnd[5]
  && E.seq.join("|")==="L1|Q1|2|SAY-B1|SAY-B2|ONLY-B|Q2|true|bar|你來不及決定——|SAY-FAST|END" && !E.end[0] && E.end[1] && !E.end[2] && E.end[3] && !E.end[4] && E.off.join()==="true,false,false,false,false,true" && E.optShown && E.replay[0]==="Q1" && !E.replay[1] && E.replay[2] && !E.replayEnd;
const ok = okE && out.A.after[0] && out.A.after[1] && !out.A.before[0] && out.A.ep2[0][0]==="FOUND 版本" && out.A.ep2[1] && out.A.ep2[2] && out.A.briefHas && out.A.again[0]==="FOUND 版本"
  && out.B.ep2[0][0]==="MISS 版本" && out.B.ep2[1] && !out.B.ep2[2] && out.B.again[0]==="MISS 版本" && out.B.upgraded[0] && out.B.stillMiss[0]==="MISS 版本"
  && out.D.before[0] && out.D.before[2] && out.D.before[3] && !out.D.beforeEnd[0] && out.D.beforeEnd[1]==="scene" && out.D.beforeEnd[2] && !out.D.beforeAgain
  && out.D.court[0]===0 && out.D.after[0] && out.D.after[1].join()==="A1,A-GUN" && !out.D.afterEnd[0] && out.D.afterEnd[1] && out.D.afterEnd[2] && out.D.afterEnd[3] && out.D.afterEnd[4]
  && out.C[0] && out.C[1] && out.C[2]==="S" && !out.C[3];
console.log(ok ? "ARC TEST PASS" : "ARC TEST FAIL", errs); await b.close();})();
