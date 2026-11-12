// 存檔位（arc.js 的 SLOT）：三個存檔各自獨立；原本的進度＝存檔 1；刪除只刪那一個。最後要印出 SLOT TEST PASS。
const {chromium}=require('playwright');
const shot = process.argv[2];   // 可選：給一個資料夾就會存首頁截圖
(async()=>{const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1180,height:820}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/index.html');
// 模擬「更新前就有的舊存檔」：用舊鍵名寫一份第 1 集進度
await p.evaluate(()=>{ localStorage.clear(); localStorage.setItem("detective_tw3_save_villa", JSON.stringify({ asked:["w1"], seen:["ev_glass"], qp:{}, sp:{}, phase:0, visits:{}, labq:{}, ev:{}, used:{}, done:false, result:null })); });
await p.reload();
const r = await p.evaluate(async()=>{ const r={}; window.uiConfirm=async()=>true;
  r.old = [SLOT.cur(), SLOT.summary(1), SLOT.summary(2).empty];
  slotUse(2); openCase(0); r.s2fresh = [S.asked.length, S.seen.length]; inspectById('ev_phone'); ARC.set("t_flag", "villa"); goHome();
  r.s2 = [SLOT.cur(), SLOT.summary(2), ARC.has("t_flag")];
  slotUse(1); openCase(0); r.back1 = [S.asked.join(), S.seen.join(), ARC.has("t_flag")]; goHome();
  slotUse(3); r.s3 = [SLOT.summary(3).empty, ARC.has("t_flag")];
  await slotDelete(2); r.del = [SLOT.summary(2).empty, SLOT.summary(1).open, SLOT.cur()];
  slotUse(2); r.s2after = [ARC.has("t_flag")]; openCase(0); r.s2after.push(S.seen.length); goHome(); slotUse(1);
  r.keys = Object.keys(localStorage).sort();
  return r; });
await p.reload(); const cur = await p.evaluate(()=>SLOT.cur());
if (shot){ await p.waitForTimeout(300); await p.screenshot({path:shot+'/slots-pc.png'}); await p.setViewportSize({width:390,height:800}); await p.waitForTimeout(300); await p.screenshot({path:shot+'/slots-phone.png'}); }
console.log(JSON.stringify(r));
const ok = r.old[0]===1 && r.old[1].open===1 && r.old[2] && r.s2fresh.join()==="0,0" && r.s2[0]===2 && r.s2[1].open===1 && r.s2[2]
  && r.back1[0]==="w1" && r.back1[1]==="ev_glass" && !r.back1[2] && r.s3[0] && !r.s3[1] && r.del[0] && r.del[1]===1 && r.del[2]===3 && !r.s2after[0] && r.s2after[1]===0 && cur===1;
console.log(ok ? "SLOT TEST PASS" : "SLOT TEST FAIL", errs); await b.close();})();
