const {chromium}=require('playwright');
const SP='/tmp/claude-0/-home-user/02932761-879e-5116-b9f5-3977896359d5/scratchpad/';
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:390,height:844}});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
 await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(400); await p.evaluate(()=>{window.uiConfirm=async()=>true;});
 await p.evaluate(()=>{localStorage.clear(); openCase(1); restart(true);});
 const shot=n=>p.screenshot({path:SP+n+'.png',fullPage:true});
 const fail=[];
 const Q=async(...pairs)=>{for(const q of pairs){const s=await p.evaluate(q=>{const s=C.suspects.find(s=>s.questions.some(x=>x.id===q));const b=S.asked.length;askById(s.id,q);return S.asked.length>b},q); if(!s) fail.push('Q '+q+' day'+await p.evaluate(()=>S.phase));}};
 const I=async(...ids)=>{for(const id of ids){const r=await p.evaluate(id=>{const b=S.seen.length;inspectById(id);return S.seen.length>b},id); if(!r) fail.push('I '+id+' day'+await p.evaluate(()=>S.phase));}};
 const T=async(...ids)=>{for(const id of ids){const r=await p.evaluate(async id=>{await submitTest(id);return S.labq[id]!==undefined},id); if(!r) fail.push('T '+id+' day'+await p.evaluate(()=>S.phase));}};
 const V=async(id)=>{const r=await p.evaluate(async id=>{await visit(id);return here(id)},id); if(!r) fail.push('V '+id+' day'+await p.evaluate(()=>S.phase));};
 const next=async()=>{ console.log("day",await p.evaluate(()=>S.phase),"used",await p.evaluate(()=>usedNow()),"left",await p.evaluate(()=>timeLeft())); await p.evaluate(()=>{S.phase++;mapFrom=null;checkEvents();save();}); };
 // 第一晚
 await I('ev_dryer','ev_tools','ev_hair','ev_ladder');
 await Q('t1','t6','t7','y1','y2','y13','h1','h11','h18','x1','x1b','x13','o1','o13','o11','p1','p2','p12','wu1','wu3','wu2');
 await p.evaluate(()=>go('map')); await shot('m0');
 await next(); // 第二天 AP3
 await I('ev_dryerlog','ev_luminol','ev_raincoat','ev_laundry');
 await Q('p6','p7','p5','p13','y11','y14'/*needs y8*/,'h8','h7','h6'/*needs t8*/,'x4','x12');
 await V('lab'); await T('lab_hoodie','lab_nail','lab_soil');
 await V('shop'); await Q('de1','de7','de2','de4'); await I('ev_dashcam');
 await V('police'); await T('pol_phone'); await I('pol_old','pol_road');
 await p.evaluate(()=>{tab='map';openLoc='lab';render()}); await shot('lab1');
 await next(); // 第三天 AP4 start police
 await V('lab'); await T('lab_stomach','lab_hair','lab_weight');
 await V('farm'); await I('ev_note','ev_drawer','ev_backstair'); await Q('p14','y23','pp_bm','o6','h21','x6');
 await V('lawyer'); await Q('w1','w2','w5','w7');
 await V('care'); await Q('fg2','fg5','fg4','fg6'); await I('ev_visitlog');
 await next(); // 第四天
 await V('lab'); await T('lab_drawer','lab_backstair','lab_ladder');
 await V('farm'); await I('ev_ashes','ev_receipt'); await Q('pp_bm','pp4','pp5','pp6','y8','x10','x9','x14','p22','x15','y16','x7');
 await V('office'); await I('ev_video','ev_contract'); await Q('o3','o4','o15');
 await next(); // 第五天
 await V('lab'); await T('lab_ashes','lab_note');
 await V('taipei'); await Q('n1','n2','n4'); await I('ev_leave');
 await next(); // 第六天
 await V('farm'); await Q('x5','x18','x19','x24','y7');
 const st=await p.evaluate(()=>({ap:apLeft(),reasoning:C.reasoning.filter(unlocked).length,ready:readyTests().map(t=>t.id),asked:S.asked.length,seen:S.seen.length,ev:Object.keys(S.ev)}));
 console.log(JSON.stringify(st));
 await p.evaluate(async ()=>{go("accuse");pickKind('murder');toggleCulprit('xin');['lab_hoodie','lab_nail','ev_dryerlog'].forEach(toggleEv);C.reasoning.forEach((r,i)=>pickReason(i,r.answer));await submitAccuse();});
 console.log(JSON.stringify(await p.evaluate(()=>S.result)));
 await p.evaluate(()=>{noteView='time';go('notes')}); await shot('time');
 await p.evaluate(()=>{go('brief')}); await shot('brief_end');
 console.log('FAILS',fail); console.log('errors',errs); await b.close();
})();
