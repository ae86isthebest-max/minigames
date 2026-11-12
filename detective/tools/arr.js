const {chromium}=require('playwright');

(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1180,height:820},hasTouch:true,deviceScaleFactor:1});
const p=await ctx.newPage(); const errs=[];p.on('pageerror',e=>errs.push(e.message+"\n"+e.stack));
await p.goto('http://localhost:8765/index.html');
const skip=async()=>{for(let i=0;i<10;i++){ const v=await p.evaluate(()=>{const b=document.querySelector('.wskip'); return b && !b.hidden;}); if(!v) break; await p.click('.wskip'); await p.waitForTimeout(400);} };
const settle=async()=>{ for(let i=0;i<40;i++){await p.waitForTimeout(300); if(await p.evaluate(()=>!WORLD.walking())) break;} await p.waitForTimeout(250); };
const visLabels=async()=>p.$$eval('.wnav', els=>els.filter(e=>!e.hidden && !e.classList.contains('secret')).map(e=>e.textContent));
for (const [ci,ph] of [[1,2]]){
 await p.evaluate(([ci,ph])=>{localStorage.clear(); window.uiConfirm=async()=>true; openCase(ci); if(ph){S.phase=ph; save(); openCase(ci);} },[ci,ph]);
 await p.waitForTimeout(800); await skip(); await p.waitForTimeout(600);
 const start=await p.evaluate(()=>curArea); const seen=new Set([start]); const queue=[start]; const edges=[];
 while(queue.length){
   const a=queue.shift();
   await p.evaluate(id=>{closePanel(); goArea(id);},a); await settle(); await p.evaluate(()=>closePanel()); await p.waitForTimeout(200);
   const labels=await visLabels();
   for (const lb of labels){
     await p.evaluate(id=>{closePanel(); goArea(id);},a); await settle(); await p.evaluate(()=>closePanel()); await p.waitForTimeout(200);
     const ok=await p.evaluate(lb=>{ const el=[...document.querySelectorAll('.wnav')].find(e=>!e.hidden && e.textContent===lb); if(!el) return false; el.click(); return true; }, lb);
     if(!ok){ edges.push(a+' ?'+lb); continue; }
     await settle();
     const to=await p.evaluate(()=>curArea); edges.push(a+'→'+to+' ['+lb+']');
     if(to && !seen.has(to)){ seen.add(to); queue.push(to); }
   }
 }
 const all=await p.evaluate(()=>areaList(worldDef(curLoc())).map(a=>a.id));
 console.log(ci,ph,'start',start,'missing:',all.filter(x=>!seen.has(x)).join(','),'\n  '+edges.join('\n  '));
}
await p.evaluate(()=>{ closePanel(); goArea('police'); }); await settle(); await p.evaluate(()=>closePanel()); await p.waitForTimeout(300);

console.log(errs); await b.close();})();
