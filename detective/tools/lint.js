const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/index.html');
for (const ci of [0,1]){
const r=await p.evaluate((ci)=>{ localStorage.clear(); openCase(ci);
  const out=[]; const ph=phasesOf(C);
  const ids=new Set();
  C.suspects.forEach(s=>s.questions.forEach(q=>ids.add(q.id)));
  allItems().forEach(i=>ids.add(i.id)); tests().forEach(t=>ids.add(t.id));
  (C.events||[]).forEach(e=>ids.add(e.id)); ph.forEach(x=>(x.reports||[]).forEach(r=>ids.add(r.id)));
  const refs=[], arcUse=[]; const chk=(o,where)=>{ const arr=v=>v===undefined?[]:Array.isArray(v)?v:[v]; [...arr(o.requires),...arr(o.requiresAll),...arr(o.unless),...arr(o.alt&&o.alt.when)].forEach(id=>{ if (ARC.is(id)){ arcUse.push(id.split(':')[1]); return; } if(!ids.has(id)) refs.push(where+':'+id); }); };
  C.suspects.forEach(s=>s.questions.forEach(q=>chk(q,'Q '+q.id)));
  allItems().forEach(i=>chk(i,'I '+i.id)); tests().forEach(t=>chk(t,'T '+t.id));
  (C.locations||[]).forEach(l=>chk(l,'L '+l.id)); (C.reasoning||[]).forEach((x,i)=>chk(x,'R'+i)); (C.kinds||[]).forEach(k=>chk(k,'K '+k.id)); (C.events||[]).forEach(e=>chk(e,'E '+e.id)); (C.extraPeople||[]).forEach(e=>chk(e,'X '+e.id));
  (C.solution.keyEvidence||[]).forEach(id=>{ if(!ids.has(id)) refs.push('keyEvidence:'+id); });
  out.push('dangling refs: '+(refs.join(', ')||'none'));
  // 主線（跨集記憶）：這一集會記下哪些旗標、用到哪些旗標。用到的旗標要在前面的集數記下，或由這一集的 arcRecap（有 miss）補上
  const arcSet = [...new Set(ARC.entries().flatMap(e=>e.arc))], recap = (C.arcRecap||[]).filter(r=>r.miss).map(r=>r.flag);
  window.__arcSeen = window.__arcSeen || new Set();
  const bad = [...new Set(arcUse)].filter(f=>!/^(done|solved)_/.test(f) && !recap.includes(f) && !arcSet.includes(f));
  const noMiss = [...new Set(arcUse)].filter(f=>!/^(done|solved)_/.test(f) && window.__arcSeen.has(f) && !recap.includes(f));
  out.push('arc flags set here: '+(arcSet.join(', ')||'none')+' | used here: '+([...new Set(arcUse)].join(', ')||'none')+(bad.length?' | !! used but never set or recapped: '+bad.join(', '):'')+(noMiss.length?' | !! set in an earlier episode but no arcRecap miss here: '+noMiss.join(', '):''));
  arcSet.forEach(f=>window.__arcSeen.add(f));
  // areas
  const locs = travel() ? C.locations : [HOME];
  const noArea=[], dead=[], noName=[];
  locs.forEach(l=>{ const d=worldDef(l); if(!d) return; const used=new Set();
    allItems().filter(it=>(it.loc||'_')===l.id).forEach(it=>{ const a=areaOf(it,l,d); if(!a || !(d.areas||[]).some(x=>x.id===a)) noArea.push(it.id); else used.add(a); });
    (d.areas||[]).forEach(a=>{ if(!a.name) noName.push(l.id+'/'+a.id+'→'+areaName(d,a.id)); if(!used.has(a.id)) dead.push(l.id+'/'+a.id); }); });
  out.push('items without area: '+(noArea.join(',')||'none'));
  out.push('areas with no items (any day): '+(dead.join(', ')||'none'));
  out.push('areas using fallback name: '+(noName.join(', ')||'none'));
  // content volume
  const nQ=C.suspects.reduce((n,s)=>n+s.questions.length,0);
  out.push('questions '+nQ+', items '+allItems().length+' (objects '+allItems().filter(i=>i.obj).length+'), tests '+tests().length+', details '+allDetails().length);
  out.push('per suspect: '+C.suspects.map(s=>s.id+':'+s.questions.length).join(' '));
  out.push('no clue: Q '+C.suspects.flatMap(s=>s.questions.filter(q=>!q.clue).map(q=>q.id)).length+' / items '+allItems().filter(i=>!i.clue).map(i=>i.id).join(','));
  // time budget per phase
  ph.forEach((x,i)=>{ const k=x.clock||C.clock; if(!k) return; const toMin=t=>{const [h,m]=t.split(':').map(Number); return h*60+m;}; let len=toMin(k.end)-toMin(k.start); if(len<0) len+=1440;
    const its=allItems().filter(it=>(it.phase===undefined||i>=it.phase)&&(it.until===undefined||i<=it.until));
    const itemMin=its.reduce((n,it)=>n+(it.mins||(it.cctv?k.cctv:k.item)||0),0);
    const ppl=C.suspects.filter(s=>!(s.gone!==undefined && i>=s.gone) && (!s.where || s.where[Math.min(i,s.where.length-1)]));
    const askMin=ppl.length*(x.questionLimit||C.questionLimit||0)*(k.ask||0);
    out.push('phase '+i+': '+len+' min available; all items '+itemMin+' min ('+its.length+'), max asking '+askMin+' min ('+ppl.length+' people × '+(x.questionLimit||C.questionLimit)+')'); });
  out.push('max questions askable in whole game: '+ph.reduce((n,x,i)=>n+C.suspects.filter(s=>!(s.gone!==undefined && i>=s.gone) && (!s.where || s.where[Math.min(i,s.where.length-1)])).length*(x.questionLimit||C.questionLimit||0),0)+' of '+nQ);
  // 推理題：每題列出「看到哪一樣東西就會出現」，人工確認每一樣單獨都足以知道題目的前提（題目、選項不可以洩露沒查到的劇情）
  const titleOf = id => { const x = [...allItems(), ...tests(), ...(C.events||[]), ...ph.flatMap(p=>p.reports||[])].find(x=>x.id===id); if (x) return x.title; const q = C.suspects.flatMap(s=>s.questions.map(q=>({q, s}))).find(o=>o.q.id===id); return q ? q.s.name+'：'+q.q.q : id; };
  out.push('reasoning premises (check each one alone proves the premise):');
  (C.reasoning||[]).forEach((r,i)=>{ const req=[].concat(r.requires||[]), all=[].concat(r.requiresAll||[]);
    out.push('  R'+i+' '+r.q+'  ['+r.options.join(' / ')+']'+(req.length||all.length?'':'  !! NO requires'));
    req.forEach(id=>out.push('      any: '+id+' = '+String(titleOf(id)).slice(0,40)));
    all.forEach(id=>out.push('      all: '+id+' = '+String(titleOf(id)).slice(0,40))); });
  return out; }, ci);
console.log('=== CASE',ci,'===\n'+r.join('\n'));
}
console.log(errs); await b.close();})();
