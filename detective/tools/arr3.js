// 第 3 集：每個地點，只靠畫面上的箭嘴能不能走到每一個區域（node tools/arr3.js）
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1180,height:820},hasTouch:true,deviceScaleFactor:1});
const p=await ctx.newPage(); const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/index.html');
const skip=async()=>{for(let i=0;i<12;i++){ const v=await p.evaluate(()=>{const b=document.querySelector('.wskip'); return b && !b.hidden;}); if(!v) break; await p.click('.wskip'); await p.waitForTimeout(300);} };
const settle=async()=>{ await p.waitForTimeout(500); for(let i=0;i<40;i++){await p.waitForTimeout(250); if(await p.evaluate(()=>!WORLD.walking())) break;} await p.waitForTimeout(200); };
const visLabels=async()=>{ for(let i=0;i<16;i++){ const l=await p.$$eval('.wnav', els=>els.filter(e=>!e.hidden && !e.classList.contains('secret')).map(e=>e.textContent)); if(l.length) return l; await p.waitForTimeout(250);} return []; };
const CID=process.argv[2]||'fingers'; const ci=await p.evaluate(id=>CASES.findIndex(c=>c.id===id),CID);
const locs=await p.evaluate(ci=>CASES[ci].locations.map(l=>l.id),ci);
let bad=0;
for (const loc of locs){
 const ph = await p.evaluate(([ci,loc])=>{ const l=CASES[ci].locations.find(x=>x.id===loc); return l.phase||(loc==='morgue'?1:0); },[ci,loc]);
 await p.evaluate(async([ci,ph,loc])=>{localStorage.clear(); window.uiConfirm=async()=>true; await openCase(ci); S.phase=ph; (S.visits[ph]=S.visits[ph]||[]).push(loc); save(); mapFrom=null; openLoc=loc; tab='map'; wArrive=null; render(); },[ci,ph,loc]);
 await p.waitForTimeout(700); await skip(); await p.waitForTimeout(300);
 const start=await p.evaluate(()=>curArea); const seen=new Set([start]); const queue=[start]; const edges=[];
 while(queue.length){
   const a=queue.shift();
   await p.evaluate(id=>{closePanel(); goArea(id);},a); await settle(); await p.evaluate(()=>closePanel());
   for (const lb of await visLabels()){
     await p.evaluate(id=>{closePanel(); goArea(id);},a); await settle(); await p.evaluate(()=>closePanel());
     await visLabels();
     const ok=await p.evaluate(lb=>{ const el=[...document.querySelectorAll('.wnav')].find(e=>!e.hidden && e.textContent===lb); if(!el) return false; el.click(); return true; }, lb);
     if(!ok){ edges.push(a+' ?'+lb); continue; }
     await settle();
     const to=await p.evaluate(()=>curArea); edges.push(a+'→'+to);
     if(to && !seen.has(to)){ seen.add(to); queue.push(to); }
   }
 }
 const all=await p.evaluate(()=>areaList(worldDef(curLoc())).map(a=>a.id));
 const miss=all.filter(x=>!seen.has(x)); if(miss.length) bad++;
 console.log(loc,'areas',all.length,'missing:',miss.join(',')||'-');
}
console.log(bad?'FAIL':'OK', errs); await b.close();})();
