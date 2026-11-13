/* =========================================================
   跨集記憶（主線用）：這一集查到的東西，下一集還記得
   存在另一個存檔（每個存檔位各一份，見 SLOT），重玩某一集、換集數都不會消失。

   寫劇本的人這樣用：
   1) 把某樣東西標成「主線線索」：在問題／證物／監視器／化驗／報告／突發事件／小細節上加 arc:"旗標名"（也可以是陣列）
        { id:"ev_gun", title:"草叢裡的手槍", text:"…", arc:"gun" }
      玩家看到（問到）那一樣，旗標就永久記下來，畫面會跳出「📌 主線線索」。
   2) 之後的集數拿來當前提：requires / requiresAll / unless / alt.when 都可以寫
        "arc:gun"        玩家知道這件事（自己查到，或被前情提要告知）
        "arcfound:gun"   玩家是自己查到的（沒查到的人看不到這一條，可以用來做獎勵對話）
        "arc:done_案件id"   那一集已經結案（不管對錯）　"arc:solved_案件id"  那一集推理全對
   3) 前情提要：這一集一開始要交代的主線（沒查到的人也要接得上）
        arcRecap: [ { flag:"gun", text:"上一集你在草叢裡找到一把警用手槍……", miss:"上一集的現場後來清出一把警用手槍，你當時沒看到……" } ]
      玩家有這個旗標就顯示 text，沒有就顯示 miss，並且從此當作「已經知道」（所以 "arc:gun" 之後一定成立）。
      會出現在「案情」最上面；場景開場要讓小吳講，就在 intro 裡用 ARC.recap() 拿到這幾句。
   4) 主線筆記：ARC.define({ gun:{ title:"來路不明的警槍", text:"第 4 集……", ep:4 } })
      玩家知道的旗標才會列在筆記的「📌 主線」，不知道的完全不顯示（連數量都不顯示，免得洩露）。
   5) 程式裡直接問：ARC.has("gun")、ARC.found("gun")、ARC.grade("案件id")

   6) 幕間（案件之間跟同事、朋友聊天的場面，像劇集一樣）：一句台詞加 cut:{ title, scene, opt, cast } 就從那一句起換場景。案件加 before（第一次打開這一集、開場之前播）或 after（真相公布之後播）
        after: { title:"收工之後・麵攤", scene:"noodle", opt:{…}, cast:[ { id:"_you", x:40 }, { id:"wu", x:90, pose:"drink", facing:-1 } ],
                 lines:[ { who:"wu", text:"……" },
                         { who:"you", text:"那把槍的事……", when:"arc:gun" },        // when／unless：跟 requires 一樣，可以用 "arc:旗標"，也可以用這一集的 id
                         { who:"narr", text:"你總覺得忘了什麼。", unless:"arc:gun" },
                         { who:"lin", name:"林法醫", text:"……", pose:"point" } ],
                 arc:"gun_talk" }                                                    // 看完就記下的旗標（可省略）
      scene 是 PX.SCENES 裡的場景名（可省略，沒有就只有對話）；cast 的 id 可以是這一集的人物、C.looks，或 ARC.defineCast 定義的固定班底；"_you" 是偵探。
      固定班底：ARC.defineCast({ wu:{ name:"吳……", look:{ skin:…, hair:…, top:… } } })，每一集的幕間都可以直接用。
      幕間只能聊天、埋伏筆，不可以放破案必需的線索；沒看（跳過）也不影響任何一集。
   7) 劇情選擇、限時行動：lines 裡放一個「選擇題」。限時一律是「遊戲裡的時間」，沒有現實世界的倒數（使用者 2026-11-13 決定）
        { who:"wu", text:"他往後巷跑了！怎麼辦？", id:"chase", by:"21:30", timeout:2,      // by＝要在遊戲時鐘幾點前決定（案件進行中才有用）；timeout＝來不及時算選了第幾個（從 0 算，不寫就是最後一個）
          choices:[ { text:"追上去", mins:10, set:"ep7_chased", say:"你翻過圍牆追了上去。" },   // mins＝做這件事要花幾分鐘遊戲時間（案件進行中會算進當天的時鐘）；set＝記下跨集旗標（之後用 "arc:ep7_chased"）
                    { text:"叫支援", mins:5, mark:"called", say:[ { who:"wu", text:"我馬上叫！" } ] },   // mark＝只記在這一集（之後用 "pick:called"）
                    { text:"先保護人質", say:"你停下腳步。", when:"pick:found_kid" } ] }       // 選項也可以有 when／unless；沒寫 mins 就是不花時間
      整個場面也可以有時間額度：場面加 limit:15（分鐘），每個選項的 mins 從裡面扣，扣完之後有 mins 的選擇題就「來不及」。
      剩下的時間＝ min(場面額度剩多少, 離 by 還有多久, 今天還剩多少)。不夠時間做的選項會變灰；全部都來不及，玩家按「時間不夠了」就算選了 timeout。
      玩家不用趕：畫面不會自己倒數，時間只在「選了要花時間的行動」時才前進。所以每個選項花多久、值不值得，要設計成真的取捨。
      舊的 time（現實秒數）已經沒有作用，請改用 by／limit／mins。
      選完會接著說 say（字串＝旁白，或 { who, text }），之後的台詞可以用 when:"arc:…"／"pick:…" 分支。選擇題不能跳過；重看時不能改選。
      案件進行中也可以播這種場面：突發事件加 scene:{ title, scene, cast, lines }，事件一發生就播（搭配 atTime 就是「幾點幾分突然……」）；
      程式裡用 interPlay(def, "這一集裡不重複的名字")。選擇的後果要寫成之後的台詞、問題或事件，不要讓任何一個選項把案子變成破不了。

   規則：主線線索只能是加分，任何一集沒有它也要破得了案；下一集一定要用 arcRecap 的 miss 把沒查到的人接回來。
   ========================================================= */
/* ---------- 存檔位：每台裝置 3 個存檔，各自有自己的集數進度和主線紀錄 ----------
   存檔 1 沿用原本的鍵名，所以以前的進度會自動變成存檔 1。 */
const SLOT = (() => {
  const CUR = "detective_tw3_slot", N = 3;
  let cur = 1;
  try { cur = Math.min(N, Math.max(1, parseInt(localStorage.getItem(CUR), 10) || 1)); } catch (e) {}
  const pre = n => n === 1 ? "detective_tw3_" : `detective_tw3_s${n}_`;
  const caseKey = (id, n) => pre(n || cur) + "save_" + id;
  const seriesKey = n => pre(n || cur) + "series";
  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  // 這個存檔位的概況：{ solved, open, empty }
  function summary(n){
    let solved = 0, open = 0;
    CASES.forEach(c => { const s = read(caseKey(c.id, n)); if (!s || !s.asked) return;
      if (s.done && s.result && s.revealed !== false) solved++; else if (s.asked.length || s.seen.length || s.phase || s.done) open++; });
    return { solved, open, empty: !solved && !open && !read(seriesKey(n)) };
  }
  function wipe(n){
    try { const ks = []; for (let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if (k && (k.startsWith(pre(n) + "save_") || k === seriesKey(n))) ks.push(k); }
      ks.forEach(k => localStorage.removeItem(k)); } catch (e) {}
  }
  function use(n){ cur = n; try { localStorage.setItem(CUR, String(n)); } catch (e) {} }
  // 這個存檔位在這台裝置上的所有鍵（每一集的進度＋主線紀錄）
  const keys = n => { const ks = []; try { for (let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if (k && (k.startsWith(pre(n) + "save_") || k === seriesKey(n))) ks.push(k); } } catch (e) {} return ks; };
  // 整個存檔位打包／還原（存檔碼和自動備份都用這個）。cases 的鍵是案件 id，不含存檔位，所以可以還原到另一個存檔位
  function dump(n){ n = n || cur; const cases = {}; let series = null;
    keys(n).forEach(k => { const v = read(k); if (v === null) return; if (k === seriesKey(n)) series = v; else cases[k.slice((pre(n) + "save_").length)] = v; });
    return { app:"detective_tw3", v:1, t:Date.now(), cases, series }; }
  function restore(n, data){
    if (!data || data.app !== "detective_tw3" || typeof data.cases !== "object" || !data.cases) return -1;
    wipe(n); let c = 0;
    try { Object.entries(data.cases).forEach(([id, v]) => { if (v && typeof v === "object" && /^[\w.-]+$/.test(id)){ localStorage.setItem(caseKey(id, n), JSON.stringify(v)); c++; } });
      if (data.series && typeof data.series === "object") localStorage.setItem(seriesKey(n), JSON.stringify(data.series)); } catch (e) { return -1; }
    return c; }
  // 存檔碼：「DT1.」＋壓縮過的內容（瀏覽器不支援壓縮就用「DT0.」不壓縮）。只有英數和 - _，方便複製貼上
  const b64 = { enc: u8 => { let b = ""; for (let i = 0; i < u8.length; i += 0x8000) b += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(b).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); },
    dec: t => { const b = atob(t.replace(/-/g, "+").replace(/_/g, "/")), u8 = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u8[i] = b.charCodeAt(i); return u8; } };
  const pipe = async (u8, T) => new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(T)).arrayBuffer());
  async function code(n){
    const raw = new TextEncoder().encode(JSON.stringify(dump(n)));
    try { if (typeof CompressionStream === "function") return "DT1." + b64.enc(await pipe(raw, new CompressionStream("deflate-raw"))); } catch (e) {}
    return "DT0." + b64.enc(raw); }
  // 回傳 { ok, cases:還原了幾集 } 或 { ok:false, why }
  async function load(text, n){
    try { const t = String(text || "").replace(/\s+/g, ""), m = /^DT([01])\.([\w-]+)$/.exec(t); if (!m) return { ok:false, why:"這不是存檔碼（要從「DT」開頭、整段貼上）。" };
      let u8 = b64.dec(m[2]); if (m[1] === "1"){ if (typeof DecompressionStream !== "function") return { ok:false, why:"這個瀏覽器讀不了這種存檔碼。" }; u8 = await pipe(u8, new DecompressionStream("deflate-raw")); }
      const c = restore(n || cur, JSON.parse(new TextDecoder().decode(u8)));
      return c < 0 ? { ok:false, why:"存檔碼的內容不對，可能少貼了一段。" } : { ok:true, cases:c };
    } catch (e) { return { ok:false, why:"存檔碼讀不出來，可能少貼了一段。" }; } }
  return { N, cur:() => cur, caseKey, seriesKey, summary, wipe, use, keys, dump, restore, code, load, pre };
})();
/* ---------- 自動備份 ----------
   在 claude.ai 的試玩卡裡，把每個存檔位的進度另外存一份到「這個玩家自己的」雲端資料（data/users/<自己>/…，別人看不到）。
   瀏覽器的儲存空間被清掉、或換了裝置：回到首頁時會自動拿回來；兩邊都有、而備份比較多時會先問。
   只是備份，不是同步：這台裝置上的進度永遠不會在沒問過的情況下被蓋掉。
   網站版沒有 window.claude，一律安靜地略過。發佈試玩卡時要宣告 capabilities:{ db:{}, user:{} }，否則存檔列會寫「沒有自動備份」。 */
const BACKUP = (() => {
  const TOMB = "detective_tw3_bkdel";   // 玩家自己刪掉的存檔：記下來，備份那邊也要刪，不能又被拿回來
  const mine = k => /^detective_tw3_(s[23]_)?(save_[\w.~:@+-]{1,120}|series)$/.test(k);
  const live = () => { try { return !!(window.claude && typeof window.claude.use === "function"); } catch (e) { return false; } };
  let col = null, state = "off", ready = false, pulled = null, applying = false, synced = {}, timer = null, busy = false, again = false, last = 0, retry = 0;
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
  const tomb = () => { try { return JSON.parse(get(TOMB)) || {}; } catch (e) { return {}; } };
  const setTomb = t => { try { Object.keys(t).length ? localStorage.setItem(TOMB, JSON.stringify(t)) : localStorage.removeItem(TOMB); } catch (e) {} };
  const localKeys = () => { const ks = []; try { for (let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if (k && mine(k)) ks.push(k); } } catch (e) {} return ks; };
  // 進度多少的粗略分數：只用來比較「備份」和「這台裝置」哪一份走得比較遠
  const score = (k, json) => { try { const s = JSON.parse(json); if (!s || typeof s !== "object") return -1;
      const n = v => Array.isArray(v) ? v.length : v && typeof v === "object" ? Object.keys(v).length : 0;
      return k.endsWith("series") ? n(s.flags) + n(s.cases) * 50 + n(s.seen) + n(s.picks)
        : (s.done && s.result ? 1e6 : 0) + (s.phase || 0) * 1e4 + n(s.asked) + n(s.seen) + n(s.found); } catch (e) { return -1; } };
  const hhmm = t => { const d = new Date(t); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  function statusText(){
    return state === "on" ? `☁ 自動備份開著${last ? `（上次 ${hhmm(last)}）` : ""}。存檔碼是多一層保險。`
      : state === "wait" ? "☁ 正在連接自動備份…"
      : state === "err" ? "☁ 自動備份暫時連不上，等一下會再試。先按「存檔碼」抄下來比較保險。"
      : "這個畫面沒有自動備份。想保險一點，按「存檔碼」把進度抄下來。"; }
  const show = () => { try { const e = document.getElementById("bkStatus"); if (e) e.textContent = statusText(); } catch (e) {} };
  const atHome = () => { try { return typeof screen !== "string" || screen === "home"; } catch (e) { return true; } };
  function fail(e){ const c = e && e.code;
    if (["not_granted", "revoked", "capability_disabled", "capability_removed", "invalid_argument"].includes(c)){ state = "off"; col = null; }
    else { state = "err"; if (retry < 6) setTimeout(() => { ready ? scan() : pull(); }, Math.min(300000, 20000 * 2 ** retry++)); }
    show(); }
  async function pull(){
    if (!col) return; if (pulled) return apply();
    try { const snap = await col.get(), got = {};
      snap.docs.forEach(d => { const v = d.data(); if (mine(d.id) && v && typeof v.json === "string") got[d.id] = v.json; });
      pulled = got; state = "on"; retry = 0; show(); apply(); }
    catch (e) { fail(e); } }
  // 只在首頁做：玩到一半不動存檔。做完這一步之前不會往備份寫東西，以免空白的新進度蓋掉備份
  async function apply(){
    if (!pulled || ready || applying || !atHome()) return; applying = true;
    try { const t = tomb(), use = [], ask = [];
      Object.entries(pulled).forEach(([k, json]) => { if (t[k]) return; const loc = get(k);
        if (loc === null) use.push(k); else if (loc === json) synced[k] = json; else if (score(k, json) > score(k, loc)) ask.push(k); });
      if (ask.length){ const eps = ask.filter(k => !k.endsWith("series")).length;
        if (await uiConfirm(`☁ 自動備份裡的進度，比這台裝置上的多${eps ? `（${eps} 集）` : ""}。\n要拿回備份裡的進度嗎？\n「確定」＝用備份裡的；「取消」＝保留現在這台裝置上的。`)) use.push(...ask);
        else ask.forEach(k => { synced[k] = get(k); }); }   // 不拿：等這邊的進度有變化，才會蓋過備份
      let n = 0; use.forEach(k => { if (put(k, pulled[k])){ synced[k] = pulled[k]; if (!k.endsWith("series")) n++; } });
      ready = true; pulled = null;
      if (use.length){ slotRefresh(); toast(`☁ 已從自動備份拿回進度${n ? `（${n} 集）` : ""}`); }
      touch();
    } catch (e) {} finally { applying = false; } }
  async function scan(){
    if (!col || !ready) return; if (busy){ again = true; return; } busy = true;
    try {
      for (const k of Object.keys(tomb())){ if (get(k) === null) await col.doc(k).delete(); delete synced[k]; const t = tomb(); delete t[k]; setTomb(t); }
      for (const k of localKeys()){ const v = get(k); if (v === null || v === synced[k] || v.length > 80000) continue;
        await col.doc(k).set({ t:Date.now(), json:v }); synced[k] = v; last = Date.now(); }
      state = "on"; retry = 0; show();
    } catch (e) { fail(e); }
    finally { busy = false; if (again){ again = false; touch(); } } }
  // 存檔有變化時呼叫（ARC.sync／主線紀錄寫入／還原存檔碼之後）：過幾秒一起備份
  function touch(){ if (!col || !ready) return; clearTimeout(timer); timer = setTimeout(scan, 4000); }
  // 玩家自己刪掉（或用存檔碼蓋掉）的鍵：備份那邊也刪
  function forget(keys){ if (!live()) return; const t = tomb(); keys.filter(mine).forEach(k => { t[k] = Date.now(); delete synced[k]; }); setTomb(t); touch(); }
  const home = () => { if (pulled && !ready) setTimeout(apply, 0); };
  async function init(){
    if (col || state === "wait" || !live()) return; state = "wait"; show();
    try { const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]), uid = db && user ? await user.id() : null;
      if (!uid){ state = "off"; show(); return; }
      col = db.collection("data/users/" + uid); await pull(); }
    catch (e) { state = "off"; col = null; show(); } }
  try { addEventListener("load", init);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden"){ clearTimeout(timer); scan(); } else if (state === "err" && col){ ready ? scan() : pull(); } });
  } catch (e) {}
  init();
  return { init, touch, forget, home, statusText, state:() => state, flush:() => { clearTimeout(timer); return scan(); } };
})();
// 以前有「現實秒數倒數」的設定；現在限時一律用遊戲裡的時間（見最上面第 7 點），這裡只留空殼給舊程式呼叫
const OPT = { timed:() => false, setTimed(){} };
// 換存檔、刪存檔之後：把記在記憶體裡的東西（主線紀錄、場景裡走到哪）清掉，從新存檔重新讀
function slotRefresh(){
  ARC.reload();
  if (typeof WORLD !== "undefined") CASES.forEach(c => (c.locations ? c.locations.map(l => l.id) : ["_"]).forEach(id => WORLD.reset(id)));
  inter = null; render(); scrollTo(0, 0);
}
const slotLabel = n => { const m = SLOT.summary(n); return m.empty ? "空白" : [m.solved ? `已結案 ${m.solved} 集` : "", m.open ? `調查中 ${m.open} 集` : ""].filter(Boolean).join("・") || "剛開始"; };
// 換存檔位一定先問一次：以免不小心點到，以為進度不見了
async function slotUse(n){ if (n === SLOT.cur()) return;
  if (!await uiConfirm(`換到存檔 ${n}（${slotLabel(n)}）？\n現在的存檔 ${SLOT.cur()}（${slotLabel(SLOT.cur())}）會原封不動留著，隨時可以換回來。`)) return;
  SLOT.use(n); slotRefresh(); toast(`💾 現在用的是存檔 ${n}`); }
async function slotDelete(n){
  if (!await uiConfirm(`刪除存檔 ${n}？\n這個存檔裡每一集的進度和主線紀錄都會消失，不能復原。`)) return;
  BACKUP.forget(SLOT.keys(n)); SLOT.wipe(n); slotRefresh(); toast(`🗑 存檔 ${n} 已刪除`);
}
// 首頁的存檔列
function slotsHTML(){
  BACKUP.home();
  const cur = SLOT.cur(), me = SLOT.summary(cur);
  // 現在用的存檔比別的存檔少：提醒一下（最常見的「進度不見了」其實是換到了另一個存檔）
  const other = [1, 2, 3].slice(0, SLOT.N).filter(n => n !== cur).map(n => ({ n, m:SLOT.summary(n) })).filter(o => o.m.solved > me.solved || (me.empty && !o.m.empty)).sort((a, b) => b.m.solved - a.m.solved)[0];
  const hint = other ? `<div class="report" style="border-color:var(--accent);margin:0 0 8px"><b>現在用的是存檔 ${cur}（${slotLabel(cur)}）。</b><div class="muted small">存檔 ${other.n} 有比較多進度（${slotLabel(other.n)}）。<button class="tag" style="border:0;cursor:pointer;padding:4px 10px;margin:4px 0 0;color:var(--accent)" onclick="slotUse(${other.n})">換到存檔 ${other.n}</button></div></div>` : "";
  return `<div class="card"><h3 style="margin:0 0 6px">💾 存檔</h3><p class="muted small" style="margin:0 0 8px">這台裝置有 ${SLOT.N} 個存檔，各玩各的。點一個來用；想重新玩，就開一個空白的，或把舊的刪掉。</p>${hint}
    ${[1, 2, 3].slice(0, SLOT.N).map(n => { const m = SLOT.summary(n), on = n === cur;
      return `<div class="pick ${on ? "on" : ""}" onclick="slotUse(${n})" style="align-items:center"><span class="box">${on ? "✓" : ""}</span><span style="flex:1"><b>存檔 ${n}</b>　<span class="muted small">${slotLabel(n)}${on ? "・使用中" : ""}</span></span>${m.empty ? "" : `<button class="tag" style="border:0;cursor:pointer;padding:5px 10px;margin:0;color:#ff9a8a" onclick="event.stopPropagation();slotDelete(${n})">🗑 刪除</button>`}</div>`; }).join("")}
    <div class="muted small" style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center"><span id="bkStatus" style="flex:1;min-width:150px">${BACKUP.statusText()}</span>
      <button class="tag" style="border:0;cursor:pointer;padding:5px 10px;margin:0" onclick="slotExport()">📤 存檔碼</button><button class="tag" style="border:0;cursor:pointer;padding:5px 10px;margin:0" onclick="slotImport()">📥 用存檔碼還原</button></div></div>`;
}
// 存檔碼的小視窗（跟 uiConfirm 同一個樣子）
function slotDialog(title, body, btns){
  return new Promise(res => { const d = document.createElement("div"); d.className = "dlg";
    d.innerHTML = `<div class="dlg-box" style="max-width:420px"><div class="dlg-msg" style="margin-bottom:8px"></div><textarea style="width:100%;height:110px;box-sizing:border-box;font:12px monospace;background:#0003;color:inherit;border:1px solid #0006;border-radius:6px;padding:6px;word-break:break-all"></textarea><div class="muted small" data-note style="margin:6px 0 10px;min-height:1.2em"></div><div class="dlg-btns">${btns.map((b, i) => `<button class="btn ${b.primary ? "primary" : ""}" style="margin:0;text-align:center" data-i="${i}">${b.text}</button>`).join("")}</div></div>`;
    d.querySelector(".dlg-msg").textContent = title; const ta = d.querySelector("textarea"), note = d.querySelector("[data-note]"); ta.value = body.value || ""; ta.readOnly = !!body.readOnly; ta.placeholder = body.placeholder || "";
    const close = v => { d.remove(); res(v); };
    d.onclick = async e => { if (e.target === d) return close(null); const i = e.target.dataset && e.target.dataset.i; if (i === undefined) return;
      const r = await btns[+i].run(ta, note); if (r !== false) close(r); };
    document.body.appendChild(d); if (body.readOnly){ ta.focus(); ta.select(); } });
}
async function slotExport(){
  const n = SLOT.cur(); if (SLOT.summary(n).empty){ toast("這個存檔還是空白的，沒有東西可以備份。"); return; }
  const code = await SLOT.code(n);
  await slotDialog(`存檔 ${n} 的存檔碼（${slotLabel(n)}）\n把整段複製起來，貼到備忘錄或傳給自己。之後在任何裝置按「用存檔碼還原」貼上，進度就回來。`, { value:code, readOnly:true }, [
    { text:"關閉", run:() => null },
    { text:"複製", primary:true, run:async (ta, note) => { ta.focus(); ta.select(); let ok = false; try { await navigator.clipboard.writeText(ta.value); ok = true; } catch (e) { try { ok = document.execCommand("copy"); } catch (e2) {} }
        note.textContent = ok ? "✓ 已複製。" : "複製不了，請長按上面的文字，自己全選再複製。"; return false; } } ]);
}
async function slotImport(){
  const n = SLOT.cur();
  const r = await slotDialog(`把存檔碼貼在下面，還原到存檔 ${n}。${SLOT.summary(n).empty ? "" : `\n注意：存檔 ${n} 現在的進度（${slotLabel(n)}）會被蓋掉。想保留的話，先關掉這個視窗，換到一個空白的存檔再還原。`}`, { placeholder:"DT1.……" }, [
    { text:"取消", run:() => null },
    { text:`還原到存檔 ${n}`, primary:true, run:async (ta, note) => { if (!ta.value.trim()){ note.textContent = "還沒貼上存檔碼。"; return false; }
        const before = SLOT.dump(n); BACKUP.forget(SLOT.keys(n)); const r = await SLOT.load(ta.value, n); if (!r.ok){ SLOT.restore(n, before); note.textContent = r.why; return false; } return r; } } ]);
  if (r && r.ok){ BACKUP.touch(); slotRefresh(); toast(`📥 已還原到存檔 ${n}（${r.cases} 集的進度）`); }
}

const ARC = (() => {
  let D = null;
  const info = {};
  const load = () => {
    if (D) return D;
    try { D = JSON.parse(localStorage.getItem(SLOT.seriesKey())) || {}; } catch (e) { D = {}; }
    D.flags = D.flags || {}; D.cases = D.cases || {}; D.seen = D.seen || {}; D.picks = D.picks || {};
    return D;
  };
  const store = () => { try { localStorage.setItem(SLOT.seriesKey(), JSON.stringify(D)); } catch (e) {} BACKUP.touch(); };
  const has = f => !!load().flags[f];
  const found = f => has(f) && D.flags[f].how === "found";
  // how："found" 自己查到、"told" 前情提要告知、"auto" 結案紀錄。told 之後自己查到會升級成 found
  function set(f, ep, how){
    load(); how = how || "found";
    const cur = D.flags[f];
    if (cur && (cur.how === how || how !== "found")) return false;
    D.flags[f] = { ep: cur ? cur.ep : (ep || null), how, n: cur ? cur.n : Object.keys(D.flags).length + 1 };
    store();
    return !cur;
  }
  const is = id => typeof id === "string" && (id.startsWith("arc:") || id.startsWith("arcfound:") || id.startsWith("pick:"));
  // "pick:名字" 是這一集裡（案件中途的場面）選過的選項，記在這一集的存檔，不跨集
  const test = id => id.startsWith("pick:") ? !!((typeof S !== "undefined" && S && S.picks) || {})[id.slice(5)] : id.startsWith("arcfound:") ? found(id.slice(9)) : has(id.slice(4));
  const arr = v => v === undefined || v === null ? [] : [].concat(v);
  const esc0 = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));

  // 引擎的 has()（看過、問過、收到報告……）由 index.html 用 ARC.bind 交進來；不經過 arc: 判斷，避免繞圈
  let engineHas = null;
  const has0 = id => { try { return engineHas ? !!engineHas(id) : false; } catch (e) { return false; } };
  // 這一集（目前打開的 C）所有標了 arc 的東西：[{ id, arc:[…], detail }]
  function entries(){
    if (C._arc) return C._arc;
    const out = [], add = (x, detail) => { if (x && x.arc && x.id) out.push({ id:x.id, arc:arr(x.arc), detail:!!detail }); };
    (C.suspects || []).forEach(s => (s.questions || []).forEach(q => add(q)));
    const things = [...allItems(), ...tests()];
    things.forEach(x => add(x));
    (C.events || []).forEach(x => add(x));
    phasesOf(C).forEach(p => (p.reports || []).forEach(r => add(r)));
    allDetails().forEach(d => add(d, true));
    // 文件裡被圈出來的那一行（第 3 集起的月結單、通聯紀錄）
    things.forEach(x => x.doc && (x.doc.rows || []).forEach(r => r && r.hit && add(r.hit)));
    return (C._arc = out);
  }
  // 每次存檔時呼叫：把這一集已經看到的主線線索記進跨集存檔
  function sync(){
    BACKUP.touch();
    if (typeof C === "undefined" || !C || typeof S === "undefined" || !S) return;
    const fresh = [];
    entries().forEach(e => {
      const got = e.detail ? (S.found || []).includes(e.id) : has0(e.id);
      if (got) e.arc.forEach(f => { const was = has(f); if (set(f, C.id, "found") || !was) fresh.push(f); });
    });
    if (S.done && S.result){
      set("done_" + C.id, C.id, "auto");
      if (S.result.verdict === "perfect") set("solved_" + C.id, C.id, "auto");
      const rank = "FDCBAS", old = D.cases[C.id];
      if (!old || rank.indexOf(S.result.grade) > rank.indexOf(old.grade)){ D.cases[C.id] = { grade:S.result.grade }; store(); }
    }
    if (fresh.length && typeof toast === "function") setTimeout(() => toast("📌 主線線索：" + fresh.map(f => (info[f] || {}).title || "已記下，之後的案子可能用得上").join("、")), 600);
  }
  // 開始一集時呼叫一次：決定前情提要要講哪個版本，並把沒查到的旗標補成「已告知」
  function open(){
    if (typeof C === "undefined" || !C || !C.arcRecap || S.recap) return;
    S.recap = C.arcRecap.map(r => ({ f:r.flag, had:has(r.flag) }));
    C.arcRecap.forEach(r => { if (!has(r.flag) && r.miss) set(r.flag, C.id, "told"); });
    if (typeof save === "function") save();   // 馬上存起來：之後重開這一集，前情提要還是同一個版本
  }
  // 這一集的前情提要（純文字陣列），給開場讓小吳講
  function recap(){
    if (typeof C === "undefined" || !C || !C.arcRecap) return [];
    const had = {}; ((typeof S !== "undefined" && S && S.recap) || []).forEach(r => { had[r.f] = r.had; });
    return C.arcRecap.map(r => (had[r.flag] !== undefined ? had[r.flag] : has(r.flag)) ? r.text : (r.miss || "")).filter(Boolean);
  }
  const recapHTML = () => { const ls = recap(); return ls.length ? `<div class="report" style="border-color:var(--accent)"><b>📌 前情提要</b><div class="muted small">${ls.map(esc0).join("<br>")}</div></div>` : ""; };

  // 筆記「📌 主線」：只列玩家知道、而且有定義標題的旗標
  const list = () => { load(); return Object.keys(D.flags).filter(f => info[f]).sort((a, b) => ((info[a].ep || 0) - (info[b].ep || 0)) || (D.flags[a].n - D.flags[b].n)).map(f => ({ id:f, ...info[f], how:D.flags[f].how })); };
  function notesHTML(){
    const ls = list();
    if (!ls.length) return `<div class="card"><p class="muted small" style="margin:0">還沒有主線線索。</p></div>`;
    return `<div class="card log-sec"><h3>📌 主線</h3><p class="muted small" style="margin:0 0 8px">跨集的線索：每一集查到的，都會留在這裡。</p>${ls.map(x => `<div style="margin:10px 0"><b>${esc0(x.title)}</b>${x.ep ? ` <span class="muted small">（第 ${x.ep} 集）</span>` : ""}${x.how === "told" ? ` <span class="muted small">・事後才知道</span>` : ""}<div class="muted small">${esc0(x.text || "").replace(/\n/g, "<br>")}</div></div>`).join("")}</div>`;
  }
  const define = o => Object.assign(info, o);
  const grade = id => (load().cases[id] || {}).grade || null;
  const reset = () => { D = { flags:{}, cases:{}, seen:{}, picks:{} }; store(); };
  const pick = k => load().picks[k];
  const setPick = (k, j) => { load(); D.picks[k] = j; store(); };
  const reload = () => { D = null; };   // 換存檔之後重新讀
  // 幕間看過沒、固定班底
  const seen = k => !!load().seen[k];
  const mark = k => { load(); if (!D.seen[k]){ D.seen[k] = 1; store(); } };
  const cast = {};
  const defineCast = o => Object.assign(cast, o);
  const look = id => (cast[id] || {}).look || null;
  const name = id => (cast[id] || {}).name || null;
  return { has, found, set, is, test, sync, open, recap, recapHTML, list, notesHTML, define, grade, reset, reload, entries, info, seen, mark, pick, setPick, cast, defineCast, look, name, bind:fn => { engineHas = fn; } };
})();

/* ---------- 幕間：案件之間的對話場面（資料格式見最上面第 6、7 點） ---------- */
let inter = null;   // { k:"before"|"after"|null（案件裡的場面）, L:資料, key:記錄用的名字, idx:第幾句, pend:[選完之後要接著說的話], force:重看 }
let interQueue = [];
const interOK = l => (!l.when || [].concat(l.when).some(has)) && (!l.unless || ![].concat(l.unless).some(has));
// 選過的選項：幕間（before/after）記在跨集存檔；案件裡的場面記在這一集的存檔
const interPickGet = id => inter.k ? ARC.pick(inter.key + "#" + id) : ((S.scenePicks || {})[inter.key + "#" + id]);
function interPickSet(id, j){ if (inter.k) ARC.setPick(inter.key + "#" + id, j); else { (S.scenePicks = S.scenePicks || {})[inter.key + "#" + id] = j; save(); } }
const interLine = () => inter.pend.length ? inter.pend[0] : inter.L.lines[inter.idx];
const interPid = () => { const l = inter.L.lines[inter.idx]; return l.id || String(inter.idx); };
const interOpen = l => !!(l && l.choices) && !inter.pend.length && interPickGet(interPid()) === undefined;   // 還沒選的選擇題
const interNextIdx = from => { const ls = inter.L.lines; for (let i = from; i < ls.length; i++) if (interOK(ls[i])) return i; return -1; };
function interStart(k, L, key, force, back){
  inter = { k, L, key, idx:-1, pend:[], force:!!force, back, used:0 };
  inter.idx = interNextIdx(0);
  if (inter.idx < 0){ inter = null; return false; }
  interArm();
  return true;
}
// 條件符合而且還沒看過，就開始播；force＝重看
function interMaybe(k, force){
  const L = C[k]; if (!L || !L.lines) return false;
  if (!force){
    if (ARC.seen(C.id + ":" + k)) return false;
    if (k === "after" && !(S.done && S.result && (S.result.verdict === "perfect" || S.revealed))) return false;
    if (k === "before" && (S.asked.length || S.seen.length || S.phase || S.done)) return false;
  }
  return interStart(k, L, C.id + ":" + k, force);
}
function interReplay(k){ if (interMaybe(k, true)){ render(); scrollTo(0, 0); } }
// 案件進行中播一段場面（例如綁匪來電、突然被鎖在房間裡）：def 跟幕間同一個格式，key 是這一集裡不重複的名字
function interPlay(def, key, force){
  if (!def || !def.lines) return false;
  if (!force && (S.scenes || {})[key]) return false;
  if (inter){ interQueue.push([def, key, force]); return true; }
  const back = { tab, openLoc, sheetFrom: typeof sheetFrom !== "undefined" ? sheetFrom : null };
  if (!interStart(null, def, key, force, back)) return false;
  if (fsMode()) openSheet("accuse"); else { tab = "accuse"; render(); }
  scrollTo(0, 0);
  return true;
}
// 限時一律用「遊戲裡的時間」，沒有現實世界的倒數：
//   場面 limit:分鐘＝這個場面總共只有這麼多時間；選擇題 by:"HH:MM"＝要在遊戲時鐘幾點前決定；選項 mins:分鐘＝做這件事要花多久。
//   案件進行中的場面，花掉的分鐘也會算進當天的時鐘。
const interClock = () => !!inter && !inter.k && typeof CLK === "function" && !!CLK();
const interTimed = l => !!(l && l.choices) && (!!l.by || l.choices.some(c => c.mins));
function interRemain(l){
  let r = Infinity;
  if (inter.L.limit !== undefined) r = Math.min(r, inter.L.limit - (inter.used || 0));
  if (interClock()){ r = Math.min(r, timeLeft()); if (l && l.by) r = Math.min(r, clkAt(CLK(), l.by) - nowMin()); }
  return r;
}
// 這個選項現在來不來得及做
const interCan = (l, c) => { if (!interTimed(l) || inter.force) return true; const r = interRemain(l); return r === Infinity || (r > 0 && (c.mins || 0) <= r); };
function interArm(){ /* 不再有現實時間的計時器 */ }
const interChoices = l => l.choices.map((c, j) => ({ ...c, j })).filter(interOK);
function interPick(j, timedOut){
  if (!inter) return; const l = interLine(); if (!interOpen(l)) return;
  const c = l.choices[j]; if (!c) return;
  if (!timedOut && !interCan(l, c)) return;                 // 來不及做的選項不能選
  if (!timedOut && c.mins && !inter.force){ inter.used = (inter.used || 0) + c.mins; if (interClock()) spend(c.mins); }
  interPickSet(interPid(), j);
  [].concat(c.set || []).forEach(f => ARC.set(f, C.id, "found"));
  if (c.mark){ S.picks = S.picks || {}; [].concat(c.mark).forEach(f => { S.picks[f] = 1; }); save(); }
  const say = [].concat(c.say || []).map(x => typeof x === "string" ? { who: l.reply || "narr", text: x } : x);
  if (timedOut) say.unshift({ who:"narr", text: l.late || "時間不夠了，你什麼都來不及做——" });
  inter.pend = say;
  if (say.length){ render(); scrollTo(0, 0); } else interNext(0);
}
function interNext(end){
  if (!inter) return;
  if (interOpen(interLine())) return;                       // 選擇題不能跳過，一定要選
  if (inter.pend.length) inter.pend.shift();
  if (!inter.pend.length || end){
    inter.pend = [];
    let n = interNextIdx(inter.idx + 1);
    if (end && !inter.force) while (n >= 0 && !(inter.L.lines[n].choices && interPickGet(inter.L.lines[n].id || String(n)) === undefined)) n = interNextIdx(n + 1);   // 跳過：停在下一個還沒選的選擇題
    else if (end) n = -1;
    if (n < 0){ interEnd(); return; }
    inter.idx = n;
  }
  interArm(); render(); scrollTo(0, 0);
}
function interEnd(){
  const { k, L, key, force, back } = inter; inter = null;
  if (k) ARC.mark(key); else { (S.scenes = S.scenes || {})[key] = 1; save(); }
  [].concat(L.arc || []).forEach(f => ARC.set(f, C.id, "found"));
  if (typeof L.done === "function") try { L.done(); } catch (e) {}
  if (!k && typeof checkEvents === "function") checkEvents();
  if (interQueue.length && !inter){ const [d, ky, f] = interQueue.shift(); if (interStart(null, d, ky, f, back)){ render(); scrollTo(0, 0); return; } }
  if (inter) return;
  if (k === "before" && !force){ if (fsMode()) { closeSheet(); return; } tab = art() ? (travel() ? "map" : "scene") : "brief"; }
  else if (!k && back){ if (fsMode() && !["notes", "brief", "accuse"].includes(back.tab)) { closeSheet(); return; } tab = back.tab; openLoc = back.openLoc; }
  render(); scrollTo(0, 0);
}
// 換場：台詞可以帶 cut:{ title, scene, opt, cast }，從這一句起換到另一個場景（像劇集剪接）
const interShot = () => { let s = inter.L; for (let i = 0; i <= inter.idx && i < inter.L.lines.length; i++){ const l = inter.L.lines[i]; if (l.cut && interOK(l)) s = { ...inter.L, ...l.cut }; } return s; };
function vInter(){
  const L = interShot(), st = interLine(), open = interOpen(st);
  const sus = id => C.suspects.find(s => s.id === id);
  const who = st.who || (st.choices ? "narr" : "narr");
  const speaker = who === "you" ? "你" : who === "narr" ? "" : st.name || ARC.name(who) || (sus(who) || { name:"" }).name.replace(/（.*）/, "");
  const cast = (L.cast || []).map(c => { const me = c.id === who || (c.id === "_you" && who === "you"); return { y:100, facing:1, ...c, pose: me && st.pose ? st.pose : c.pose || "stand", mark: me }; });
  const more = inter.pend.length > 1 || interNextIdx(inter.idx + 1) >= 0;
  let btns;
  if (open){
    const cs = interChoices(st), timed = interTimed(st) && !inter.force, r = timed ? interRemain(st) : Infinity;
    const none = timed && !cs.some(c => interCan(st, c)), to = st.timeout !== undefined ? st.timeout : cs[cs.length - 1].j;
    const clock = !timed || r === Infinity ? "" : `<p class="muted small" style="margin:10px 2px 0">${interClock() ? `🕐 現在 ${nowStr()}` : "⏱"}${st.by && interClock() ? `・要在 ${st.by} 前決定` : ""}・${r > 0 ? `還有 ${minLabel(r)}` : "已經沒有時間了"}<span style="opacity:.7">（遊戲裡的時間，不用趕，想清楚再選）</span></p>`;
    btns = `${clock}
      ${cs.map(c => { const ok = interCan(st, c); return `<button class="btn" style="margin-top:8px;${ok ? "border-color:var(--accent)" : "opacity:.45"}" ${ok ? "" : "disabled"} onclick="interPick(${c.j})">${esc(c.text)}${c.mins ? ` <span class="tag cost">⏱ ${minLabel(c.mins)}</span>` : ""}${ok ? "" : ` <span class="tag">來不及</span>`}</button>`; }).join("")}
      ${none ? `<button class="btn primary" style="margin-top:12px" onclick="interPick(${to}, true)">時間不夠了 ▶</button>` : ""}`;
  } else {
    const picked = st.choices && !inter.pend.length ? st.choices[interPickGet(interPid())] : null;
    btns = `${picked ? `<p class="muted small" style="margin:8px 2px 0">你的選擇：${esc(picked.text)}</p>` : ""}
      <button class="btn primary" style="margin-top:12px" onclick="interNext(0)">${more ? "下一句 ▶" : (inter.k === "before" && !inter.force ? "開始調查 ▶" : inter.k ? "看完了" : "繼續 ▶")}</button>
      ${more ? `<button class="btn" style="text-align:center" onclick="interNext(1)">跳過</button>` : ""}`;
  }
  return `<div class="card" style="padding:12px"><div class="muted small" style="margin-bottom:8px">🎬 ${esc(L.title || "幕間")}</div>
    <div class="bubble court-bubble" data-type="${esc(st.text).replace(/"/g, "&quot;")}">${speaker ? `<b>${esc(speaker)}</b>` : "<b>　</b>"}<span class="say-text" style="white-space:pre-line"></span></div>
    ${art() && L.scene ? sceneHTML(L.scene, { ...(L.opt || {}), phase:S.phase, cast }) : ""}
    ${btns}</div>`;
}
// 結案畫面上的「重看幕間」按鈕
const interBtns = () => ["before", "after"].filter(k => C[k] && C[k].lines && ARC.seen(C.id + ":" + k)).map(k => `<button class="btn" style="text-align:center;margin-top:0" onclick="interReplay('${k}')">🎬 重看幕間：${esc(C[k].title || (k === "before" ? "開場" : "收工之後"))}</button>`).join("");
