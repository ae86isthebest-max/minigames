// 推理題選項「只打亂顯示順序」的檢查。用法：node tools/optorder.js [截圖資料夾]（要先在 detective/ 開 python3 -m http.server 8765）
// 1) 每一集每一題：optOrder(i) 是不是完整的排列、算兩次是不是一樣、「看不出來／不知道…」是不是在最後、fixed:true 是不是照原本的順序
// 2) 印出正確答案顯示在第幾格的次數（應該大致平均，不可以集中在同一格）
// 3) 第 1 集實際點一次：畫面上的順序＝optOrder；點「畫面上寫著正確答案的那一格」，存的是原本的編號，拿得到 S；
//    用原本的編號直接填（舊存檔、舊工具的做法）打勾的還是同一句話；重新整理以後順序不變
// 4) 「誰」的清單（whoOrder）：畫面順序對不對、多一個人少一個人的時候其他人的順序會不會跳
// 最後要印出 OPT ORDER PASS。
const {chromium}=require('playwright'); const shot=process.argv[2]; const PORT=process.env.PORT||8765;
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1180,height:820}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(`http://localhost:${PORT}/index.html`); await p.waitForTimeout(500);
const all=await p.evaluate(()=>{ const res=[], keep=C; CASES.forEach((c,k)=>{ C=c; (c.reasoning||[]).forEach((r,i)=>{ const base=r.options.map((_,j)=>j), o=optOrder(i), o2=optOrder(i), last=r.options.findIndex(x=>OPT_LAST.test(x));
  res.push({ k:k+1, i, pos:o.indexOf(r.answer), perm:o.slice().sort((a,b)=>a-b).join()===base.join(), stable:o.join()===o2.join(), lastOk:r.fixed||last<0||o[o.length-1]===last, fixedOk:!r.fixed||o.join()===base.join() }); }); }); C=keep; return res; });
const bad=all.filter(x=>!x.perm||!x.stable||!x.lastOk||!x.fixedOk), cnt=[0,0,0,0,0,0]; all.forEach(x=>cnt[x.pos]++);
console.log(`${all.length} 題；正確答案顯示在第 1–4 格的次數：${cnt.slice(0,4).join(' / ')}`); if (bad.length) console.log('BAD', JSON.stringify(bad));
const top=Math.max(...cnt)/all.length;
const fresh=()=>p.evaluate(async()=>{ localStorage.clear(); ARC.reset(); window.uiConfirm=async()=>true; await openCase(0); ['ev_glass','ev_lab','ev_printer','cctv_hall','cctv_back','ev_phone'].forEach(inspectById); openSheet('accuse'); pickKind('murder'); ['ho','chow'].forEach(toggleCulprit); ['ev_glass','ev_lab','ev_printer'].forEach(toggleEv); await openReasoning(); });
const cards=()=>p.evaluate(()=>C.reasoning.map((r,i)=>{ const card=[...document.querySelectorAll('.card')].find(c=>c.querySelector('h3') && c.querySelector('h3').textContent.includes(r.q)); return card ? [...card.querySelectorAll('.pick')].map(e=>({ t:e.textContent.replace(/^✓/,'').trim(), on:e.classList.contains('on') })) : null; }));
await fresh(); const d1=await cards();
const exp=await p.evaluate(()=>C.reasoning.map((r,i)=>optOrder(i).map(j=>r.options[j])));
const domOk=d1.every((c,i)=>c && c.map(x=>x.t).join('|')===exp[i].join('|'));
if (shot){ await p.screenshot({path:shot+'/optorder-1180.png', fullPage:true}); }
// 點畫面上寫著正確答案的那一格
const n=await p.evaluate(()=>C.reasoning.length);
for (let i=0;i<n;i++){ const [q,a]=await p.evaluate(i=>[C.reasoning[i].q, C.reasoning[i].options[C.reasoning[i].answer]],i);
  await p.locator('.card',{has:p.locator('h3',{hasText:q})}).locator('.pick',{hasText:a}).first().click(); }
const stored=await p.evaluate(()=>C.reasoning.map((r,i)=>accusePick.reasoning[i]===r.answer));
const d2=await cards(); const tickOk=await p.evaluate(d2=>C.reasoning.every((r,i)=>d2[i].filter(x=>x.on).map(x=>x.t).join()===r.options[r.answer]),d2);
const res=await p.evaluate(async()=>{ await submitAccuse(); return [S.result.verdict, S.result.grade, JSON.stringify(S.result.pick.reasoning)===JSON.stringify(Object.fromEntries(C.reasoning.map((r,i)=>[i,r.answer])))]; });
// 用原本的編號直接填（舊存檔／舊工具）：打勾的是同一句話
await fresh(); await p.evaluate(()=>C.reasoning.forEach((r,i)=>pickReason(i,0))); const d3=await cards();
const oldOk=await p.evaluate(d3=>C.reasoning.every((r,i)=>d3[i].filter(x=>x.on).map(x=>x.t).join()===r.options[0]),d3);
// 重新整理：順序不變
await p.reload(); await p.waitForTimeout(500); await p.evaluate(async()=>{ window.uiConfirm=async()=>true; await openCase(0); openSheet('accuse'); pickKind('murder'); await openReasoning(); }); const d4=await cards();
const sameOk=d4.every((c,i)=>c && c.map(x=>x.t).join('|')===exp[i].join('|'));
if (shot){ const q=await b.newPage({viewport:{width:390,height:844}}); await q.goto(`http://localhost:${PORT}/index.html`); await q.waitForTimeout(500); await q.evaluate(async()=>{ window.uiConfirm=async()=>true; await openCase(0); openSheet('accuse'); pickKind('murder'); await openReasoning(); }); await q.waitForTimeout(300); await q.screenshot({path:shot+'/optorder-390.png', fullPage:true}); }
// 「誰」的清單：畫面順序＝whoOrder(allPeople())；少一個人的時候其他人的上下順序不變（之後多出來的人只是插進去）
const who=await p.evaluate(()=>{ const all=whoOrder(allPeople()).map(s=>s.id), dom=[...document.querySelectorAll('.pick')].map(e=>(e.getAttribute('onclick')||'').match(/toggleCulprit\('(.+?)'\)/)).filter(Boolean).map(m=>m[1]);
  const keep=CASES.every(c=>{ const k=C; C=c; const L=[...c.suspects.filter(s=>!s.witness), ...(c.extraPeople||[])], full=whoOrder(L).map(s=>s.id); const ok=L.every((_,d)=>{ const part=whoOrder(L.filter((_,j)=>j!==d)).map(s=>s.id); return part.join()===full.filter(id=>id!==L[d].id).join(); }); C=k; return ok; });
  return { domOk: dom.length>0 && dom.join()===all.join(), keep }; });
console.log(JSON.stringify({domOk, stored, tickOk, res, oldOk, sameOk, who}));
const ok=!bad.length && top<0.4 && domOk && stored.every(Boolean) && tickOk && res.join()==="perfect,S,true" && oldOk && sameOk && who.domOk && who.keep && !errs.length;
console.log(ok ? "OPT ORDER PASS" : "OPT ORDER FAIL", errs); await b.close(); })();
