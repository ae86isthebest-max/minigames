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
console.log(JSON.stringify(out,null,1));
const ok = out.A.after[0] && out.A.after[1] && !out.A.before[0] && out.A.ep2[0][0]==="FOUND 版本" && out.A.ep2[1] && out.A.ep2[2] && out.A.briefHas && out.A.again[0]==="FOUND 版本"
  && out.B.ep2[0][0]==="MISS 版本" && out.B.ep2[1] && !out.B.ep2[2] && out.B.again[0]==="MISS 版本" && out.B.upgraded[0] && out.B.stillMiss[0]==="MISS 版本"
  && out.C[0] && out.C[1] && out.C[2]==="S" && !out.C[3];
console.log(ok ? "ARC TEST PASS" : "ARC TEST FAIL", errs); await b.close();})();
