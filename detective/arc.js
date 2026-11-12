/* =========================================================
   跨集記憶（主線用）：這一集查到的東西，下一集還記得
   存在另一個存檔（SERIES_KEY），重玩某一集、換集數都不會消失。

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

   規則：主線線索只能是加分，任何一集沒有它也要破得了案；下一集一定要用 arcRecap 的 miss 把沒查到的人接回來。
   ========================================================= */
const ARC = (() => {
  const SERIES_KEY = "detective_tw3_series";
  let D = null;
  const info = {};
  const load = () => {
    if (D) return D;
    try { D = JSON.parse(localStorage.getItem(SERIES_KEY)) || {}; } catch (e) { D = {}; }
    D.flags = D.flags || {}; D.cases = D.cases || {};
    return D;
  };
  const store = () => { try { localStorage.setItem(SERIES_KEY, JSON.stringify(D)); } catch (e) {} };
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
  const is = id => typeof id === "string" && (id.startsWith("arc:") || id.startsWith("arcfound:"));
  const test = id => id.startsWith("arcfound:") ? found(id.slice(9)) : has(id.slice(4));
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
  const reset = () => { D = { flags:{}, cases:{} }; store(); };
  return { has, found, set, is, test, sync, open, recap, recapHTML, list, notesHTML, define, grade, reset, entries, info, bind:fn => { engineHas = fn; } };
})();
