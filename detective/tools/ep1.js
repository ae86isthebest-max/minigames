const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:390,height:844}});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
 await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(300); await p.evaluate(()=>{window.uiConfirm=async()=>true;});
 await p.click('text=半山別墅之夜'); await p.evaluate(()=>{askById('wong','w1'); inspectById('ev_glass');});
 for(const [s,q] of [['wong','w3'],['ho','h3']]) await p.evaluate(([s,q])=>askById(s,q),[s,q]);
 for(const id of ['ev_lab','ev_printer','cctv_hall','cctv_back','ev_phone']) await p.evaluate(id=>inspectById(id),id);
 await p.evaluate(()=>{go('accuse');pickKind('murder');toggleCulprit('ho');toggleCulprit('chow');['ev_glass','ev_lab','ev_printer'].forEach(toggleEv);C.reasoning.forEach((r,i)=>pickReason(i,r.answer));submitAccuse();});
 console.log(JSON.stringify(await p.evaluate(()=>({r:S.result,t:S.tries,g:S.result.grade,tabs:[...document.querySelectorAll('nav button')].map(b=>b.textContent.trim())}))));
 await p.evaluate(()=>{noteView='time';go('notes')}); 
 
 console.log('errors',errs); await b.close();
})();
