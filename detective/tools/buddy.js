// 「這一集的拍檔」設定（EPn.buddy）的檢查。用法：node tools/buddy.js（要先在 detective/ 開 python3 -m http.server 8765）
// 在第 1 集上臨時試三種：不寫（小吳）／false（主角自己查）／{ id, name, av }（換人），看跟著的人、按鈕、選單、提示、結案標題、開場的話是誰說。
// 最後要印出 BUDDY TEST PASS。
const {chromium}=require('playwright'); const PORT=process.env.PORT||8765;
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(`http://localhost:${PORT}/index.html`); await p.waitForTimeout(500);
const run=buddy=>p.evaluate(async buddy=>{ localStorage.clear(); try{ ARC.reset(); }catch(e){} window.uiConfirm=async()=>true; window.toast=()=>{};
  delete CASES[0].buddy; if (buddy !== null) CASES[0].buddy = buddy; await openCase(0); inter=null; render();
  const txt=()=>document.body.innerText, l=curLoc(), def=worldDef(l), h=worldHooks(l,def), bd=h.buddy(), r={};
  r.follow=bd&&bd.id; r.people=h.people().map(x=>x.id).join(); r.say=(h.script||[]).filter(k=>k.say).slice(0,1).map(k=>k.say[0]+"/"+(k.name||h.nameOf(k.say[0]))).join(); r.alias=h.nameOf("wu"); r.morning=soloSteps(WK.morning(def, BUD().name)).filter(k=>k.say).slice(0,1).map(k=>k.say[0]+"/"+k.name).join();
  r.hud=document.querySelector('.hb.buddy').textContent; openBuddy(); r.head=document.querySelector('.fs-panel .card b').textContent;
  r.close=[...document.querySelectorAll('.fs-panel .wq')].map(e=>e.childNodes[0].textContent.trim()).find(t=>t.includes('結案'));
  wBuddy='help'; render(); r.tip=(txt().match(/筆記、案情、結案：[^。]*。/)||[])[0]; r.green=/綠\s/.test(txt()); closePanel();
  openSheet('accuse'); r.title=(txt().match(/⚖️ [^\n]{0,8}結案/)||[])[0]; r.lead=(document.querySelector('.wusay b')||{}).textContent||null; closeSheet();
  delete CASES[0].buddy; return r; }, buddy);
const A=await run(null), B=await run(false), X=await run({ id:"ho", name:"阿明", av:"👮" });   // ho＝第 1 集裡的一個嫌疑人，臨時拿來當拍檔
console.log(JSON.stringify({A,B,X}));
const ok = A.follow==="_wu" && A.say==="wu/小吳" && A.morning==="wu/小吳" && A.hud==="💬 小吳" && A.head==="🧑‍🔬 小吳" && A.close.includes("跟小吳結案") && A.tip.includes("點小吳或右上角「💬 小吳」") && A.green && A.title==="⚖️ 跟小吳結案" && A.lead==="小吳"
  && B.follow===null && B.say==="you/你" && B.morning==="you/你" && B.hud==="☰ 選單" && B.head==="☰ 調查選單" && B.close==="⚖️ 我知道真相了！結案" && B.tip.includes("點右上角「☰ 選單」") && !B.green && B.title==="⚖️ 結案" && B.lead===null && B.people===A.people
  && X.follow==="ho" && X.alias==="阿明" && X.morning==="wu/阿明" && X.hud==="💬 阿明" && X.head==="👮 阿明" && X.close.includes("跟阿明結案") && X.tip.includes("「💬 阿明」") && X.title==="⚖️ 跟阿明結案" && X.lead==="阿明" && !X.people.split(",").includes("ho") && A.people.split(",").includes("ho")
  && !errs.length;
console.log(ok ? "BUDDY TEST PASS" : "BUDDY TEST FAIL", errs); await b.close(); })();
