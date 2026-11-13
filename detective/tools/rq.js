// 推理題「一打開就算一次機會」：平常蓋著、打開前確認、離開就再蓋起來；第一次全對才有 S。最後要印出 RQ TEST PASS。
const {chromium}=require('playwright');
const shot = process.argv[2];
(async()=>{const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1180,height:820}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/index.html');
const fresh = ()=>p.evaluate(()=>{ localStorage.clear(); ARC.reset(); window.uiConfirm=async()=>true; openCase(0); ['ev_glass','ev_lab','ev_printer','cctv_hall','cctv_back','ev_phone'].forEach(inspectById); openSheet('accuse'); pickKind('murder'); ['ho','chow'].forEach(toggleCulprit); ['ev_glass','ev_lab','ev_printer'].forEach(toggleEv); });
const out={};
await fresh();
if (shot){ await p.waitForTimeout(500); await p.screenshot({path:shot+'/rq-covered.png', fullPage:true}); }
out.A = await p.evaluate(async()=>{ const r={}; const txt=()=>document.body.innerText;
  r.covered=[!S.rq, txt().includes("先蓋著"), txt().includes(C.reasoning[0].q), S.tries||0];
  await submitAccuse(); r.blocked=[S.done, S.tries||0];
  await openReasoning(); r.open=[S.rq, S.tries, txt().includes(C.reasoning[0].q)];
  closeSheet(); r.left=[S.rq, S.tries]; openSheet('accuse'); r.again=[txt().includes("先蓋著"), txt().includes(C.reasoning[0].q), txt().includes("第 2 次推理")];
  await openReasoning(); C.reasoning.forEach((x,i)=>pickReason(i,x.answer)); await submitAccuse(); r.result=[S.result.verdict, S.result.grade, S.tries, !!S.rq];
  return r; });
await fresh();
out.B = await p.evaluate(async()=>{ await openReasoning(); C.reasoning.forEach((x,i)=>pickReason(i,x.answer)); await submitAccuse(); return [S.result.verdict, S.result.grade, S.tries]; });
await fresh();   // 舊的測試腳本：不打開、直接填答案提交，也只算一次
out.C = await p.evaluate(async()=>{ C.reasoning.forEach((x,i)=>pickReason(i,x.answer)); await submitAccuse(); return [S.result.verdict, S.result.grade, S.tries]; });
await fresh();   // 打開過、重新整理／重進案件：題目蓋回去，機會已經用掉
out.D = await p.evaluate(async()=>{ await openReasoning(); openCase(0); openSheet('accuse'); pickKind('murder'); return [!!S.rq, S.tries, document.body.innerText.includes("先蓋著")]; });
console.log(JSON.stringify(out));
const A=out.A, ok = A.covered.join()==="true,true,false,0" && A.blocked.join()==="false,0" && A.open.join()==="true,1,true" && A.left.join()==="false,1" && A.again.join()==="true,false,true" && A.result.join()==="perfect,A,2,false"
  && out.B.join()==="perfect,S,1" && out.C.join()==="perfect,S,1" && out.D.join()==="false,1,true";
console.log(ok ? "RQ TEST PASS" : "RQ TEST FAIL", errs); await b.close();})();
