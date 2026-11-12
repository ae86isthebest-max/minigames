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

   6) 幕間（案件之間跟同事、朋友聊天的場面，像劇集一樣）：案件加 before（第一次打開這一集、開場之前播）或 after（真相公布之後播）
        after: { title:"收工之後・麵攤", scene:"noodle", opt:{…}, cast:[ { id:"_you", x:40 }, { id:"wu", x:90, pose:"drink", facing:-1 } ],
                 lines:[ { who:"wu", text:"……" },
                         { who:"you", text:"那把槍的事……", when:"arc:gun" },        // when／unless：跟 requires 一樣，可以用 "arc:旗標"，也可以用這一集的 id
                         { who:"narr", text:"你總覺得忘了什麼。", unless:"arc:gun" },
                         { who:"lin", name:"林法醫", text:"……", pose:"point" } ],
                 arc:"gun_talk" }                                                    // 看完就記下的旗標（可省略）
      scene 是 PX.SCENES 裡的場景名（可省略，沒有就只有對話）；cast 的 id 可以是這一集的人物、C.looks，或 ARC.defineCast 定義的固定班底；"_you" 是偵探。
      固定班底：ARC.defineCast({ wu:{ name:"吳……", look:{ skin:…, hair:…, top:… } } })，每一集的幕間都可以直接用。
      幕間只能聊天、埋伏筆，不可以放破案必需的線索；沒看（跳過）也不影響任何一集。
   7) 劇情選擇、限時行動：lines 裡放一個「選擇題」
        { who:"wu", text:"他往後巷跑了！怎麼辦？", time:10, timeout:2, id:"chase",        // time＝限時幾秒（不寫就不限時）；timeout＝時間到自動選第幾個（從 0 算，不寫就是最後一個）
          choices:[ { text:"追上去", set:"ep7_chased", say:"你翻過圍牆追了上去。" },      // set＝記下跨集旗標（之後用 "arc:ep7_chased"）
                    { text:"叫支援", mark:"called", say:[ { who:"wu", text:"我馬上叫！" } ] },   // mark＝只記在這一集（之後用 "pick:called"）
                    { text:"先保護人質", say:"你停下腳步。", when:"pick:found_kid" } ] }       // 選項也可以有 when／unless
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
  return { N, cur:() => cur, caseKey, seriesKey, summary, wipe, use };
})();
// 換存檔、刪存檔之後：把記在記憶體裡的東西（主線紀錄、場景裡走到哪）清掉，從新存檔重新讀
function slotRefresh(){
  ARC.reload();
  if (typeof WORLD !== "undefined") CASES.forEach(c => (c.locations ? c.locations.map(l => l.id) : ["_"]).forEach(id => WORLD.reset(id)));
  inter = null; render(); scrollTo(0, 0);
}
function slotUse(n){ if (n === SLOT.cur()) return; SLOT.use(n); slotRefresh(); toast(`💾 現在用的是存檔 ${n}`); }
async function slotDelete(n){
  if (!await uiConfirm(`刪除存檔 ${n}？\n這個存檔裡每一集的進度和主線紀錄都會消失，不能復原。`)) return;
  SLOT.wipe(n); slotRefresh(); toast(`🗑 存檔 ${n} 已刪除`);
}
// 首頁的存檔列
function slotsHTML(){
  return `<div class="card"><h3 style="margin:0 0 6px">💾 存檔</h3><p class="muted small" style="margin:0 0 8px">這台裝置有 ${SLOT.N} 個存檔，各玩各的。點一個來用；想重新玩，就開一個空白的，或把舊的刪掉。</p>
    ${[1, 2, 3].slice(0, SLOT.N).map(n => { const m = SLOT.summary(n), on = n === SLOT.cur();
      const txt = m.empty ? "空白" : [m.solved ? `已結案 ${m.solved} 集` : "", m.open ? `調查中 ${m.open} 集` : ""].filter(Boolean).join("・") || "剛開始";
      return `<div class="pick ${on ? "on" : ""}" onclick="slotUse(${n})" style="align-items:center"><span class="box">${on ? "✓" : ""}</span><span style="flex:1"><b>存檔 ${n}</b>　<span class="muted small">${txt}${on ? "・使用中" : ""}</span></span>${m.empty ? "" : `<button class="tag" style="border:0;cursor:pointer;padding:5px 10px;margin:0;color:#ff9a8a" onclick="event.stopPropagation();slotDelete(${n})">🗑 刪除</button>`}</div>`; }).join("")}</div>`;
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
  const store = () => { try { localStorage.setItem(SLOT.seriesKey(), JSON.stringify(D)); } catch (e) {} };
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
  inter = { k, L, key, idx:-1, pend:[], force:!!force, back };
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
// 限時的選擇題：開始倒數；時間到就自動選 timeout 那一個（沒寫就是最後一個）
function interArm(){
  clearTimeout(inter.timer); inter.deadline = null;
  const l = interLine();
  if (interOpen(l) && l.time && !inter.force){
    const me = inter; me.deadline = Date.now() + l.time * 1000;
    me.timer = setTimeout(() => { if (inter === me && interOpen(interLine())){ const cs = interChoices(l); interPick(l.timeout !== undefined ? l.timeout : cs[cs.length - 1].j, true); } }, l.time * 1000);
  }
}
const interChoices = l => l.choices.map((c, j) => ({ ...c, j })).filter(interOK);
function interPick(j, timedOut){
  if (!inter) return; const l = interLine(); if (!interOpen(l)) return;
  const c = l.choices[j]; if (!c) return;
  clearTimeout(inter.timer); inter.deadline = null;
  interPickSet(interPid(), j);
  [].concat(c.set || []).forEach(f => ARC.set(f, C.id, "found"));
  if (c.mark){ S.picks = S.picks || {}; [].concat(c.mark).forEach(f => { S.picks[f] = 1; }); save(); }
  const say = [].concat(c.say || []).map(x => typeof x === "string" ? { who: l.reply || "narr", text: x } : x);
  if (timedOut) say.unshift({ who:"narr", text: l.late || "你來不及決定——" });
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
  const { k, L, key, force, back } = inter; clearTimeout(inter.timer); inter = null;
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
function vInter(){
  const L = inter.L, st = interLine(), open = interOpen(st);
  const sus = id => C.suspects.find(s => s.id === id);
  const who = st.who || (st.choices ? "narr" : "narr");
  const speaker = who === "you" ? "你" : who === "narr" ? "" : st.name || ARC.name(who) || (sus(who) || { name:"" }).name.replace(/（.*）/, "");
  const cast = (L.cast || []).map(c => { const me = c.id === who || (c.id === "_you" && who === "you"); return { y:100, facing:1, ...c, pose: me && st.pose ? st.pose : c.pose || "stand", mark: me }; });
  const more = inter.pend.length > 1 || interNextIdx(inter.idx + 1) >= 0;
  let btns;
  if (open){
    const left = inter.deadline ? Math.max(0, (inter.deadline - Date.now()) / 1000) : 0;
    btns = `${inter.deadline ? `<div class="ibar"><i style="width:${Math.round(left / st.time * 100)}%;animation:ibar ${left.toFixed(1)}s linear forwards"></i></div><div class="muted small" style="margin:4px 0 0">⏱ 要馬上決定（${st.time} 秒）</div>` : ""}
      ${interChoices(st).map(c => `<button class="btn" style="margin-top:8px;border-color:var(--accent)" onclick="interPick(${c.j})">${esc(c.text)}</button>`).join("")}`;
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
try { const st = document.createElement("style"); st.textContent = ".ibar{height:8px;border-radius:99px;background:#ffffff1a;overflow:hidden;margin-top:12px}.ibar i{display:block;height:100%;background:#ff7a5a;border-radius:99px}@keyframes ibar{to{width:0}}"; document.head.appendChild(st); } catch (e) {}
