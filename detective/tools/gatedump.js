// 問題解鎖檢查用的清單（CASE=案件id）：node tools/gatedump.js 輸出.txt
// 每一題列出：誰、第幾天、問法、需要什麼（連同那樣東西的內容），方便逐題看
// (1) 追問有沒有說出玩家還不知道的事 (2) 鎖是不是太窄（明明有別的路知道，卻沒開）
const {chromium}=require('playwright'); const fs=require('fs'); const CID=process.env.CASE||'fingers';
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('http://localhost:8765/index.html');
const r=await p.evaluate((CID)=>{ localStorage.clear(); window.uiConfirm=async()=>true; C=CASES[CASES.findIndex(c=>c.id===CID)]; KEY=saveKey(C); S=fresh();
  const arr=v=>v===undefined||v===null?[]:Array.isArray(v)?v:[v]; const cut=(s,n)=>{ s=String(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' '); return s.length>n?s.slice(0,n)+'…':s; };
  const T={}; const ph=phasesOf(C);
  ph.forEach((x,i)=>(x.reports||[]).forEach(r=>T[r.id]={k:'報告',ph:i,t:cut(r.clue||r.text,90)}));
  C.suspects.forEach(s=>s.questions.forEach(q=>T[q.id]={k:'問'+s.name.replace(/（.*）/,''),ph:q.phase||0,t:cut(q.clue||q.a,90)}));
  allItems().forEach(i=>T[i.id]={k:i.obj?'小物':i.cctv?'監視器':'證物',ph:i.phase||0,t:cut((i.title||'')+'：'+(i.clue||i.text),100),req:[...arr(i.requires)],all:[...arr(i.requiresAll)],loc:i.loc});
  tests().forEach(t=>T[t.id]={k:t.rec?'調閱':'化驗',ph:t.phase||0,days:t.days,t:cut((t.title||'')+'：'+(t.clue||t.result||t.text),100),req:[...arr(t.requires)],all:[...arr(t.requiresAll)]});
  (C.events||[]).forEach(e=>T[e.id]={k:'事件',ph:e.phase||0,t:cut((e.title||'')+'：'+(e.clue||e.text),100),req:[...arr(e.requires)],all:[...arr(e.requiresAll)],at:e.atTime});
  [...allItems(),...tests()].forEach(x=>x.doc&&x.doc.rows.forEach(r=>r.hit&&(T[r.hit.id]={k:'圈:'+x.id,ph:T[x.id].ph,t:cut(r.hit.clue,90)})));
  const Q=[]; C.suspects.forEach(s=>s.questions.forEach(q=>Q.push({who:s.name.replace(/（.*）/,''),sid:s.id,id:q.id,ph:q.phase||0,q:q.q,alt:q.alt?{when:q.alt.when,q:q.alt.q}:null,req:arr(q.requires),all:arr(q.requiresAll),a:cut(q.a,70),sreq:arr(s.requires)})));
  return {T,Q,title:C.title,intro:cut((C.intro||[]).join(' '),900),n:ph.length,
    locs:(C.locations||[]).map(l=>({id:l.id,name:l.name,req:arr(l.requires),all:arr(l.requiresAll),ph:l.phase||0})),
    reasoning:(C.reasoning||[]).map((x,i)=>({i,q:x.q,req:arr(x.requires),all:arr(x.requiresAll),opts:(x.options||[]).map(o=>typeof o==='string'?o:o.text||o.t||JSON.stringify(o))})),
    kinds:(C.kinds||[]).map(k=>({id:k.id,name:k.name||k.title,req:arr(k.requires)}))};
},CID);
const {T,Q}=r; const FULL=!!process.env.FULL;
const d=id=>{ if(Array.isArray(id)) return '('+id.map(d).join(' 或 ')+')'; const x=T[id]; if(/^(arc|arcfound|pick):/.test(id)) return id; if(!x) return id+'(??)'; return `${id}〔${x.k}${x.ph?' D'+(x.ph+1):''}${x.days?' +'+x.days+'天':''}〕${x.t.slice(0,FULL?100:56)}`; };
let out=`# ${CID}「${r.title}」 ${r.n} 天\n開場：${r.intro}\n\n## 問題\n`; let last='';
Q.forEach(q=>{ if(q.who!==last){ out+=`\n### ${q.who} (${q.sid})${q.sreq.length?' 人物出現需要: '+q.sreq.join(','):''}\n`; last=q.who; }
  out+=`- ${q.id}${q.ph?' [D'+(q.ph+1)+'起]':''} ${q.q}${q.alt&&q.alt.q?` ‖ALT(${q.alt.when.join(',')}) ${q.alt.q}`:''}`;
  if(!q.req.length&&!q.all.length) out+=' ∅\n'; else out+='\n'+(q.req.length?'    任一: '+q.req.map(d).join(' ｜ ')+'\n':'')+(q.all.length?'    全部: '+q.all.map(d).join(' ＆ ')+'\n':''); });
if(FULL){ out+='\n## 東西（有條件的）\n'; Object.entries(T).forEach(([id,x])=>{ if((x.req&&x.req.length)||(x.all&&x.all.length)) out+=`- ${id}〔${x.k}${x.ph?' D'+(x.ph+1):''}〕${x.t}\n`+((x.req||[]).length?'    任一: '+x.req.map(d).join(' ｜ ')+'\n':'')+((x.all||[]).length?'    全部: '+x.all.map(d).join(' ＆ ')+'\n':''); });
out+='\n## 地點\n'+r.locs.map(l=>`- ${l.id} ${l.name}${l.ph?' D'+(l.ph+1):''}`+(l.req.length?'\n    任一: '+l.req.map(d).join(' ｜ '):'')+(l.all.length?'\n    全部: '+l.all.map(d).join(' ＆ '):'')).join('\n');
out+='\n\n## 推理題\n'+r.reasoning.map(x=>`- R${x.i} ${x.q}\n    選項：${x.opts.join(' / ')}`+(x.req.length?'\n    任一: '+x.req.map(d).join(' ｜ '):'')+(x.all.length?'\n    全部: '+x.all.map(d).join(' ＆ '):'')).join('\n'); }
fs.writeFileSync(process.argv[2],out); console.log(process.argv[2],out.length,'chars',Q.length,'questions');
await b.close();})();
