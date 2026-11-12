const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('http://localhost:8765/index.html');
for (const ci of [0,1]){ const r=await p.evaluate(ci=>{ localStorage.clear(); openCase(ci);
 const show=C.suspects.flatMap(s=>s.questions.filter(q=>/^（出示/.test(q.q) && !q.requires && !q.requiresAll).map(q=>q.id));
 const ungated=C.suspects.map(s=>s.id+':'+s.questions.filter(q=>!q.requires && !q.requiresAll && q.phase===undefined).length+'/'+s.questions.length).join(' ');
 const timed=allItems().filter(i=>i.until!==undefined).map(i=>i.id+'≤'+i.until).join(' ');
 const key=(C.solution.keyEvidence||[]).length;
 return {show, ungated, timed, key, reasoning:(C.reasoning||[]).length}; },ci); console.log(ci, JSON.stringify(r)); }
await b.close();})();
