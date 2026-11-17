// 解鎖規則的檢查：node tools/gate.js → "GATE TEST PASS"
// (1) requiresAll 裡的一組（任一） (2) 用一般問法問過以後，拿到證據可以再質問一次 (3) qid@alt (4) 🔒 提示會說「線索在手上的文件裡」 (5) 筆記用質問版的重點
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/index.html');
const r=await p.evaluate(async()=>{ localStorage.clear(); window.uiConfirm=async()=>true; const F=[];
  const open=id=>{ C=CASES[CASES.findIndex(c=>c.id===id)]; KEY=saveKey(C); S=fresh(); S.warned=1; S.marks=[]; S.mp={}; };
  // (1)
  open('curve'); S.phase=1; S.visits[1]=['site','police','lab'];
  if(reqOK({requiresAll:["a",["b","c"]]},x=>x==="a")) F.push('group should fail');
  if(!reqOK({requiresAll:["a",["b","c"]]},x=>x==="a"||x==="c")) F.push('group should pass');
  // (2)(3)(5) 第 6 集 li1
  const li=C.suspects.find(s=>s.id==='li'), q1=li.questions.find(q=>q.id==='li1'), q2=li.questions.find(q=>q.id==='li2');
  ask(li,q1); if(S.variant.li1!=='base') F.push('li1 should be base');
  if(canAsk(q1)) F.push('li1 should not be askable again yet'); if(unlocked(q2)) F.push('li2 open too early');
  const n0=S.asked.length; S.marks.push('h_li_key');
  if(!reAsk(q1)) F.push('li1 should be re-askable after h_li_key'); if(unlocked(q2)) F.push('li2 should wait for the confrontation');
  if(askText(q1)!==q1.alt.q) F.push('re-ask should show alt wording');
  ask(li,q1); if(S.variant.li1!=='alt') F.push('li1 should now be alt'); if(S.asked.length!==n0) F.push('asked list grew on re-ask');
  if(!has('li1@alt')||!unlocked(q2)) F.push('li2 should open after confrontation'); if(canAsk(q1)) F.push('li1 askable a third time');
  const k=knownThings().find(x=>x.id==='li1'); if(!k||k.clue!==q1.alt.clue) F.push('notes should use alt clue');
  // (4) 第 3 集：拿到文件但沒圈 → 提示
  open('fingers'); const lin=C.suspects.find(s=>s.id==='lin');
  if(docPending(lin.questions)!==0) F.push('no doc yet → 0');
  const rec=tests().find(t=>t.id==='rec_phone_lin'); S.labq=S.labq||{}; S.labq[rec.id]=0; S.phase=2; S.asked.push('lin2');
  if(!readyTests().some(t=>t.id==='rec_phone_lin')) F.push('rec not ready: '+JSON.stringify(S.labq));
  const d=docPending(lin.questions); if(d<1) F.push('doc pending should be ≥1, got '+d);
  if(!/手上的文件/.test(lockNote(lin.questions,5,'x'))) F.push('lock note text');
  S.marks.push('h_lin_call'); if(docPending(lin.questions)!==d-1) F.push('pending should drop after marking');
  return F; });
console.log(r.length||errs.length?['FAIL',r,errs]:'GATE TEST PASS'); await b.close();})();
