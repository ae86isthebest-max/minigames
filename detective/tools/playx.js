// 第 3 集檢查：
// 1) 不限時間、題數，把每天能做的全部做完 → 找出永遠拿不到的問題／證物／調閱／推理題（死內容）
// 2) 從「推理題全部解鎖 + 3 項關鍵證據 + 兇手可選」倒推最少要做的事，按真正的時間和題數限制玩一次，要拿到 S
// 用法：node tools/play3.js（要先在 detective/ 開 python3 -m http.server 8765）
const {chromium}=require('playwright'); const CID=process.env.CASE||'fingers';
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:657}});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
 await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(400);
 await p.evaluate(()=>{window.uiConfirm=async()=>true; window.toast=()=>{}; localStorage.clear();});
 const idx=await p.evaluate((CID)=>CASES.findIndex(c=>c.id===CID),CID);
 await p.evaluate(async i=>{await openCase(i); restart&&0;},idx);
 // ---------- 1) 不限量全做 ----------
 const FULL=!!process.env.FULL;
 const plan=await p.evaluate((FULL)=>{
  S=fresh(); S.warned=1; S.marks=[]; S.mp={};
  const seq={}, dep={}, how={}; let n=0, round=0;
  const mark=(id,d,h)=>{ if(seq[id]===undefined){ seq[id]=n++; dep[id]=d; how[id]={...h,round}; } };
  const pick=reqs=>{ if(!reqs) return []; const ok=[].concat(reqs).filter(has); ok.sort((a,b)=>(seq[a]??1e9)-(seq[b]??1e9)); return ok.length?[ok[0]]:[]; };
  const reqDeps=x=>[...pick(x.requires), ...(x.requiresAll||[])];
  const N=phasesOf(C).length;
  for(let ph=0;ph<N;ph++){
   S.phase=ph; S.visits[ph]=[];
   phasesOf(C)[ph].reports&&phasesOf(C)[ph].reports.forEach(r=>mark(r.id,[], {k:'report',ph}));
   tests().filter(testReady).forEach(t=>mark(t.id,['T:'+t.id],{k:'ready',ph}));
   const evs=()=>{ const u0=(S.used||{})[ph]; (S.used=S.used||{})[ph]=9999; const fe=checkEvents(); S.used[ph]=u0||0; fe.forEach(e=>mark(e.id,[...reqDeps(e),...(e.atLoc?['L:'+e.atLoc+'@'+ph]:[])],{k:'event',ph,loc:e.atLoc})); };
   evs();
   let ch=true;
   round=0;
   while(ch){ ch=false; round++;
    for(const l of C.locations){ if(locOpen(l) && !here(l.id)){ S.visits[ph].push(l.id); mark('L:'+l.id+'@'+ph, reqDeps(l), {k:'visit',ph,loc:l.id}); ch=true; evs(); } }
    const startL=PH().startAt; if(startL) mark('L:'+startL+'@'+ph,[],{k:'start',ph,loc:startL});
    for(const it of allItems()){ if(!S.seen.includes(it.id) && itemOpen(it) && unlocked(it) && (!it.loc || here(it.loc))){ const d=[...reqDeps(it), ...(it.loc?['L:'+it.loc+'@'+ph]:[])]; S.seen.push(it.id); S.sp[it.id]=ph; mark(it.id,d,{k:'item',ph,loc:it.loc,mins:costItem(it)}); ch=true; evs(); } }
    for(const t of tests()){ if(S.labq[t.id]===undefined && testOpen(t) && here(t.loc)){ S.labq[t.id]=ph; mark('T:'+t.id,[...reqDeps(t),'L:'+t.loc+'@'+ph],{k:'test',ph,loc:t.loc,mins:costTest()}); ch=true; evs(); } }
    for(const s of C.suspects){ if(isGone(s)) continue; const w=whereOf(s); if(travel() && !here(w)) continue;
     for(const q of s.questions){ if(!S.asked.includes(q.id) && unlocked(q)){ S.asked.push(q.id); S.qp[q.id]=ph; mark(q.id,[...reqDeps(q), ...(w?['L:'+w+'@'+ph]:[])],{k:'q',ph,sid:s.id,loc:w,mins:CLK().ask||5}); ch=true; evs(); } } }
    for(const x of [...allItems().filter(it=>S.seen.includes(it.id)), ...readyTests()]){ if(!x.doc) continue;
     docRows(x.doc,x).forEach(([r,i])=>{ if(r.hit && !S.marks.includes(r.hit.id)){ S.marks.push(r.hit.id); S.mp[r.hit.id]=ph; mark(r.hit.id,[x.id],{k:'mark',ph,doc:x.id,row:i}); ch=true; evs(); } }); }
   }
  }
  // 死內容
  const dead={
   q:C.suspects.flatMap(s=>s.questions.filter(q=>!S.asked.includes(q.id)).map(q=>s.id+':'+q.id)),
   items:allItems().filter(it=>!S.seen.includes(it.id)).map(i=>i.id),
   tests:tests().filter(t=>S.labq[t.id]===undefined).map(t=>t.id),
   testsNeverReady:tests().filter(t=>S.labq[t.id]!==undefined && S.labq[t.id]+t.days>N-1).map(t=>t.id+'@'+S.labq[t.id]),
   locs:C.locations.filter(l=>!Object.values(S.visits).some(v=>v.includes(l.id))).map(l=>l.id),
   events:(C.events||[]).filter(e=>S.ev[e.id]===undefined).map(e=>e.id),
   reasoning:C.reasoning.map((r,i)=>unlocked(r)?null:i).filter(x=>x!==null),
   kinds:C.kinds.filter(k=>!unlocked(k)).map(k=>k.id),
   people:allPeople().map(x=>x.id)
  };
  // 倒推
  const targets=[]; C.reasoning.forEach(r=>targets.push(...pick(r.requires),...(r.requiresAll||[])));
  const pool=new Set(evidencePool().map(x=>x.id));
  const closure=(ids,acc)=>{ ids.forEach(id=>{ if(acc.has(id)) return; acc.add(id); closure(dep[id]||[],acc); }); return acc; };
  const base=closure(targets,new Set());
  const keyC=C.solution.keyEvidence.filter(k=>pool.has(k)).map(k=>{ const c=closure([k],new Set(base)); return [k,c.size-base.size]; }).sort((a,b)=>a[1]-b[1]);
  const keys=keyC.slice(0,3).map(x=>x[0]);
  // FULL=1：要拿齊全部關鍵證據，再加上跟兇手對質的問題
  const extra=FULL?[...keyC.map(x=>x[0]), ...C.suspects.find(s=>s.id===C.solution.culprits[0]).questions.filter(q=>/^（出示/.test(q.q)).map(q=>q.id)]:[];
  const need=closure([...keys,...extra],new Set(base));
  const acts=[...need].filter(id=>how[id]).map(id=>({id,...how[id],seq:seq[id]})).sort((a,b)=>a.seq-b.seq);
  const perPh={}; Object.values(how).forEach(h=>{ if(h.mins) perPh[h.ph]=(perPh[h.ph]||0)+h.mins; });
  return {perPh,dead,keys,keyC,acts,counts:{asked:S.asked.length,seen:S.seen.length,tests:Object.keys(S.labq).length,marks:S.marks.length}};
 },FULL);
 console.log('ALL-DONE counts',JSON.stringify(plan.counts)); console.log('minutes of all actions per phase (first time available)',JSON.stringify(plan.perPh));
 console.log('DEAD',JSON.stringify(plan.dead,null,0));
 console.log('key evidence cost',JSON.stringify(plan.keyC));
 // ---------- 2) 照時間限制玩 ----------
 await p.evaluate(()=>{ S=fresh(); S.warned=1; save(); });
 const byPh={}; plan.acts.forEach(a=>{ if(['item','test','q','mark','visit'].includes(a.k) || (a.k==='event' && a.loc)) (byPh[a.ph]=byPh[a.ph]||[]).push(a); });
 const fail=[];
 const NPH=await p.evaluate(()=>phasesOf(C).length); for(let ph=0; ph<NPH; ph++){
  const acts=byPh[ph]||[]; const rounds=[...new Set(acts.map(a=>a.round))].sort((a,b)=>a-b); const vis=[], retry=[];
  const doMarks=async()=>{ for(const m of acts.filter(m=>m.k==='mark')) await p.evaluate(m=>{ const x=[...allItems().filter(i=>S.seen.includes(i.id)),...readyTests()].find(x=>x.id===m.doc); if(x && !(S.marks||[]).includes(m.id)) markRow(m.doc,m.row); },m); };
  await doMarks();
  for(const rd of rounds){
   const ra=acts.filter(a=>a.round===rd && a.k!=='mark' && a.k!=='visit');
   for(const loc of [...new Set(ra.map(a=>a.loc).filter(Boolean))]){
    const here=await p.evaluate(loc=>mapFrom===loc || (!mapFrom && PH().startAt===loc),loc);
    if(!here){ const r=await p.evaluate(async loc=>{ await visit(loc); mapFrom=loc; return here(loc); },loc); vis.push(loc); if(!r) fail.push(`V ${loc} d${ph}`); }
    for(const a of ra.filter(a=>a.loc===loc)){
     const ok=await p.evaluate(async a=>{
      if(a.k==='item'){ const b=S.seen.length; inspectById(a.id); return S.seen.length>b; }
      if(a.k==='test'){ const id=a.id.slice(2); await submitTest(id,true); return S.labq[id]!==undefined; }
      if(a.k==='q'){ const b=S.asked.length; askById(a.sid,a.id); return S.asked.length>b; }
      if(a.k==='event') return S.ev[a.id]!==undefined;
     },a);
     if(!ok){ if(a.k==='test'||a.k==='q') retry.push(a); else fail.push(`${a.k} ${a.id} d${ph} t=${await p.evaluate(()=>nowStr())}`); }
     await doMarks();
    }
   }
   // 同一輪裡，化驗的前提要在後面的地點才拿得到：繞回去再送一次
   for(const a of retry.splice(0)){
    const ok=await p.evaluate(async a=>{ if(a.loc && !here(a.loc)){ await visit(a.loc); mapFrom=a.loc; } if(a.k==='q'){ const b=S.asked.length; askById(a.sid,a.id); return S.asked.length>b; } const id=a.id.slice(2); await submitTest(id,true); return S.labq[id]!==undefined; },a);
    if(ok) vis.push(a.loc+'(again)'); else fail.push(`${a.k} ${a.id} d${ph} t=${await p.evaluate(()=>nowStr())}`);
   }
  }
  const locs=vis;
  const st=await p.evaluate(()=>({used:usedNow(),left:timeLeft(),t:nowStr()}));
  console.log(`day ${ph}: ${acts.length} actions, used ${st.used} min, left ${st.left} (now ${st.t}), visits ${locs.join(',')}`);
  if(ph<NPH-1) await p.evaluate(async()=>{ const p0=S.phase; for(let k=0;k<6 && S.phase===p0;k++){ await nextPhase(); if(typeof inter!=="undefined" && inter){ for(let j=0;j<80 && inter;j++){ const L=interLine(); if(L && L.choices) interPick(0); else interNext(1); } } } });
 }
 const res=await p.evaluate(async keys=>{
  go('accuse'); pickKind(C.solution.kind); C.solution.culprits.forEach(toggleCulprit); keys.forEach(toggleEv);
  C.reasoning.forEach((r,i)=>{ if(reasonFor(r,C.solution.kind)) pickReason(i,r.answer); });
  const locked=C.reasoning.map((r,i)=>unlocked(r)?null:i).filter(x=>x!==null);
  await submitAccuse(); return {locked, r:S.result, asked:S.asked.length, seen:S.seen.length, tests:Object.keys(S.labq).length};
 },plan.keys);
 console.log(JSON.stringify(res));
 console.log('FAILS',fail); console.log('errors',errs); await b.close();
})();
