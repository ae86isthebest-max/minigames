// 平衡統計（多日、有時間制的集數）：每天「做得到的事全部做完要幾分鐘」÷「那天有幾分鐘」，以及照正常玩法一輪下來看得到多少。
// 用法：node tools/balance.js <第幾個案件，從 0 算，預設 1> ['{"night":{"ql":9,"ask":3},"day":{"ql":8,"end":"21:00"},"p":{"1":{"end":"22:00"}}}' 試別的數字；p 是個別某一天]
// 標準（2026-11-13 玩家要求）：每個人每天肯回答 6–10 題、至少是當天問得到的一半；每天的時間至少夠做完一半（比值一定要 ≤ 2，目標 ≤ 1.8 左右）。「全部做完」包含開車去每一個地方。
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(300);
  const out = await p.evaluate(async ([ci, cfg]) => { window.uiConfirm = async () => true; window.toast = () => {}; localStorage.clear(); openCase(ci); restart(true);
    if (cfg) C.phases.forEach((ph, i) => { if (i < (cfg.from || 0)) return; const c = Object.assign({}, i === 0 ? cfg.night : cfg.day, (cfg.p || {})[i]); if (c.ql) ph.questionLimit = c.ql; ["ask", "item", "cctv", "test", "end"].forEach(k => { if (c[k] !== undefined) ph.clock[k] = c[k]; }); });
    const people = () => C.suspects.filter(s => !isGone(s));
    const doAll = async (lid, capped) => { let n = 0, again = true;   // 在這個地方把做得到的都做了（capped：照真正的限制）
      while (again){ again = false;
        for (const s of C.suspects){ if (!reachable(s)) continue; for (const q of s.questions){ if (S.asked.includes(q.id) || !unlocked(q)) continue; const k = S.asked.length; askById(s.id, q.id); if (S.asked.length > k){ n++; again = true; } } }
        for (const it of allItems()){ if (S.seen.includes(it.id) || !itemOpen(it) || !unlocked(it) || (travel() && (it.loc || "_") !== lid)) continue; const k = S.seen.length; inspectById(it.id); if (S.seen.length > k){ n++; again = true; } }
        for (const t of tests()){ if (S.labq[t.id] !== undefined) continue; try { await submitTest(t.id); } catch (e) {} if (S.labq[t.id] !== undefined){ n++; again = true; } }
      } return n; };
    const res = [];
    for (let d = 0; d < C.phases.length; d++){
      const ph = C.phases[d], mins = clkAt(ph.clock, ph.clock.end) - toMin(ph.clock.start);
      // 1) 今天全部做完要多久：先存起來，拿掉限制跑一遍，再還原
      const snap = JSON.stringify(S), real = { ql: ph.questionLimit, end: ph.clock.end }, mf = mapFrom;
      ph.questionLimit = 999; ph.clock.end = fmtMin(toMin(ph.clock.start) - 1);
      const per = {}; const a0 = S.asked.slice();
      let prog = true, g = 0; while (prog && g++ < 10){ prog = false; for (const lid of (travel() ? C.locations.filter(locOpen).map(l => l.id) : [null])){ if (lid && !here(lid)){ await visit(lid); if (!here(lid)) continue; } if (await doAll(lid)) prog = true; } }
      S.asked.filter(id => !a0.includes(id)).forEach(id => { const s = C.suspects.find(s => s.questions.some(q => q.id === id)); per[s.id] = (per[s.id] || 0) + 1; });
      const all = usedNow(), allAsk = S.asked.length - a0.length;
      S = JSON.parse(snap); ph.questionLimit = real.ql; ph.clock.end = real.end; mapFrom = mf; save();
      // 2) 照真正的限制玩這一天：先把所在的地方做完，再去還有最多事情可以做的地方
      const b0 = { a: S.asked.length, s: S.seen.length, t: Object.keys(S.labq).length }; const went = [];
      let lid = travel() ? (visitsToday().slice(-1)[0] || ph.startAt) : null; await doAll(lid, true);
      if (travel()) for (let k = 0; k < 12; k++){
        const cands = C.locations.filter(l => locOpen(l) && !here(l.id) && timeLeft() >= costTravel(l) + 10).map(l => ({ l, n: C.suspects.filter(s => !isGone(s) && whereOf(s) === l.id).reduce((n, s) => n + Math.min(PH().questionLimit, s.questions.filter(q => !S.asked.includes(q.id) && unlocked(q)).length), 0)
          + allItems().filter(it => (it.loc || "_") === l.id && !S.seen.includes(it.id) && itemOpen(it) && unlocked(it)).length * 2 + (l.id === "lab" || l.id === "police" ? tests().filter(t => S.labq[t.id] === undefined && testOpen(t)).length * 2 : 0) })).filter(c => c.n > 0).sort((x, y) => y.n / costTravel(y.l) - x.n / costTravel(x.l));
        if (!cands.length) break; await visit(cands[0].l.id); if (!here(cands[0].l.id)) break; went.push(cands[0].l.id); await doAll(cands[0].l.id, true);
      }
      res.push({ d, ql: real.ql, mins, all, ratio: +(all / mins).toFixed(2), allAsk, per, did: { ask: S.asked.length - b0.a, item: S.seen.length - b0.s, test: Object.keys(S.labq).length - b0.t }, used: usedNow(), went });
      if (d < C.phases.length - 1){ S.phase++; mapFrom = null; checkEvents(); save(); }
    }
    const tot = {}, got = {}; C.suspects.forEach(s => { tot[s.id] = s.questions.length; got[s.id] = s.questions.filter(q => S.asked.includes(q.id)).length; });
    return { res, tot, got, asked: S.asked.length, allQ: C.suspects.flatMap(s => s.questions).length, seen: S.seen.length, allItems: allItems().length, tests: Object.keys(S.labq).length, allTests: tests().length, reasoning: C.reasoning.filter(unlocked).length + "/" + C.reasoning.length };
  }, [+process.argv[2] || (process.argv[2] === "0" ? 0 : 1), process.argv[3] ? JSON.parse(process.argv[3]) : null]);
  out.res.forEach(R => console.log(`day${R.d}: ${R.ql}/人 ${R.mins}分 | 全部做完 ${R.all}分 比值 ${R.ratio}${R.ratio > 2 ? " ✗ 做不到一半" : R.ratio > 1.85 ? " △" : " ✓"} | 當天問得到 ${R.allAsk} 題：${Object.entries(R.per).map(([k, v]) => `${k}:${v}${v > 2 * R.ql ? "!" : ""}`).join(" ")} | 實際 問${R.did.ask} 查${R.did.item} 驗${R.did.test} 用${R.used}分 去了[${R.went.join(",")}]`));
  console.log(`一輪下來：問 ${out.asked}/${out.allQ}（${Math.round(out.asked / out.allQ * 100)}%） 查 ${out.seen}/${out.allItems}（${Math.round(out.seen / out.allItems * 100)}%） 化驗 ${out.tests}/${out.allTests} 推理題 ${out.reasoning}`);
  console.log('每人問到：' + Object.keys(out.tot).map(k => `${k} ${out.got[k]}/${out.tot[k]}`).join("  "), errs);
  await b.close(); })();
