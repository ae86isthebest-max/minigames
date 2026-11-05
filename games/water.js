// 倒水分色 — Water Sort Puzzle
(function () {
  'use strict';

  const CAP = 4;
  const UNDO_MAX = 5;
  const COLORS = ['#ff4757', '#3d8bff', '#2ed573', '#ffd32a', '#a55eea', '#ff9f1a',
    '#18dcff', '#ff6bcb', '#9c6644', '#f1f2f6', '#14833b', '#3c40c6'];
  const HID_COL = '#474c6e';

  // diff 0 簡單 (original), 1 普通, 2 困難
  function params(level, diff) {
    if (diff === 1) return { n: Math.min(12, 6 + Math.floor((level - 1) / 2)), hid: Math.min(0.5, 0.25 + level * 0.008), spare: 2, undo: 3 };
    if (diff === 2) return { n: Math.min(12, 10 + Math.floor((level - 1) / 3)), hid: Math.min(0.75, 0.62 + level * 0.005), spare: 1, undo: 1 };
    return {
      n: Math.min(12, 3 + Math.floor((level - 1) / 2.5)),
      hid: level >= 8 ? Math.min(0.5, 0.2 + (level - 8) * 0.012) : 0,
      spare: 2, undo: UNDO_MAX,
    };
  }

  function shuffle(rng, a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function tubeDone(t) {
    if (t.length === 0) return true;
    if (t.length !== CAP) return false;
    for (let i = 1; i < t.length; i++) if (t[i] !== t[0]) return false;
    return true;
  }

  // DFS solver with memo. tubes: arrays of colour ints (bottom -> top).
  // Returns a list of [from, to] moves, or null (unsolvable or node budget exceeded).
  function solve(tubes, limit) {
    const st = tubes.map((t) => t.map((c) => String.fromCharCode(97 + c)).join(''));
    const seen = new Set();
    const path = [];
    let nodes = 0;
    function solved() {
      for (let i = 0; i < st.length; i++) {
        const s = st[i];
        if (s.length === 0) continue;
        if (s.length !== CAP) return false;
        for (let k = 1; k < CAP; k++) if (s[k] !== s[0]) return false;
      }
      return true;
    }
    function dfs() {
      if (solved()) return true;
      if (++nodes > limit) return false;
      const key = st.slice().sort().join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      const N = st.length;
      const moves = [];
      for (let i = 0; i < N; i++) {
        const s = st[i];
        if (!s.length) continue;
        const top = s[s.length - 1];
        let run = 1;
        while (run < s.length && s[s.length - 1 - run] === top) run++;
        if (run === CAP) continue;
        let emptyTried = false;
        for (let j = 0; j < N; j++) {
          if (i === j) continue;
          const d = st[j];
          if (d.length >= CAP) continue;
          if (d.length === 0) {
            if (run === s.length || emptyTried) continue;
            emptyTried = true;
            moves.push(i, j, 0);
          } else if (d[d.length - 1] === top) {
            moves.push(i, j, Math.min(run, CAP - d.length) === run ? 2 : 1);
          }
        }
      }
      for (let pass = 2; pass >= 0; pass--) {
        for (let m = 0; m < moves.length; m += 3) {
          if (moves[m + 2] !== pass) continue;
          const i = moves[m], j = moves[m + 1];
          const s = st[i], d = st[j];
          const top = s[s.length - 1];
          let run = 1;
          while (run < s.length && s[s.length - 1 - run] === top) run++;
          const amt = Math.min(run, CAP - d.length);
          st[i] = s.slice(0, s.length - amt);
          st[j] = d + top.repeat(amt);
          path.push([i, j]);
          if (dfs()) return true;
          path.pop();
          st[i] = s; st[j] = d;
          if (nodes > limit) return false;
        }
      }
      return false;
    }
    return dfs() ? path : null;
  }

  // Level generator: random fill, kept only if the DFS solver proves it solvable with the
  // starting empty tubes (the 加管 bonus is NOT counted). Otherwise retry with next rng values.
  // 困難 has only 1 spare tube; random fills are almost never solvable then, so it scrambles a
  // solved set by random cell swaps, keeping each swap only while the solver still proves it.
  function gen(level, rng, diff) {
    diff = diff || 0;
    const p = params(level, diff);
    const n = p.n;
    const pal = shuffle(rng, COLORS.map((_, i) => i)).slice(0, n);
    let tubes = null, sol = null, tries = 0;
    if (p.spare === 1) {
      tubes = [];
      for (let c = 0; c < n; c++) tubes.push([c, c, c, c]);
      const iters = 140 + n * 24;
      for (let it = 0; it < iters || (tubes.some(tubeDone) && it < iters * 4); it++) {
        tries++;
        const i = Math.floor(rng() * n), j = Math.floor(rng() * n), a = Math.floor(rng() * CAP), b = Math.floor(rng() * CAP);
        if (tubes[i][a] === tubes[j][b]) continue;
        let t = tubes[i][a]; tubes[i][a] = tubes[j][b]; tubes[j][b] = t;
        const s2 = solve(tubes.concat([[]]), 20000);
        if (!s2) { t = tubes[i][a]; tubes[i][a] = tubes[j][b]; tubes[j][b] = t; }
      }
      tubes.push([]);
      sol = tubes.slice(0, n).some(tubeDone) ? null : solve(tubes, 200000);
    }
    while (!sol && tries < 5000) {
      tries++;
      const balls = [];
      for (let c = 0; c < n; c++) for (let k = 0; k < CAP; k++) balls.push(c);
      shuffle(rng, balls);
      tubes = [];
      for (let i = 0; i < n; i++) tubes.push(balls.slice(i * CAP, i * CAP + CAP));
      if (tubes.some(tubeDone)) continue;
      for (let k = 0; k < p.spare; k++) tubes.push([]);
      sol = solve(tubes, 60000);
    }
    const hidden = tubes.map((t) => t.map((c, i) => p.hid > 0 && i < t.length - 1 && rng() < p.hid));
    return { n, tubes, hidden, sol, pal, tries, spare: p.spare, undo: p.undo };
  }

  // area of polygon pts (flat x,y list) clipped to y >= L
  const clipBuf = new Float64Array(32);
  function areaBelow(pts, L) {
    let n = 0;
    const m = pts.length / 2;
    for (let i = 0; i < m; i++) {
      const ax = pts[i * 2], ay = pts[i * 2 + 1];
      const j = (i + 1) % m;
      const bx = pts[j * 2], by = pts[j * 2 + 1];
      const ain = ay >= L, bin = by >= L;
      if (ain) { clipBuf[n++] = ax; clipBuf[n++] = ay; }
      if (ain !== bin) {
        const t = (L - ay) / (by - ay);
        clipBuf[n++] = ax + (bx - ax) * t; clipBuf[n++] = L;
      }
    }
    let a = 0;
    const k = n / 2;
    for (let i = 0; i < k; i++) {
      const j = (i + 1) % k;
      a += clipBuf[i * 2] * clipBuf[j * 2 + 1] - clipBuf[j * 2] * clipBuf[i * 2 + 1];
    }
    return Math.abs(a) / 2;
  }
  function levelFor(pts, target, lo, hi) {
    for (let it = 0; it < 18; it++) {
      const mid = (lo + hi) / 2;
      if (areaBelow(pts, mid) > target) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  MG.register({
    id: 'water', name: '倒水分色', icon: '🧪', color: '#3de0e0',
    gen, solve, params, CAP,
    create(api) {
      const U = api.util;
      const L = gen(api.level, api.rng, api.diff || 0);
      const tubes = L.tubes.map((t, ti) => ({
        cells: t.map((c, i) => ({ k: c, h: L.hidden[ti][i], rv: -1 })),
        hx: 0, hy: 0, lift: 0, shake: 0, cork: -1, pop: 0, born: 1, wig: 0,
      }));
      let sel = -1, anim = null, pending = null;
      const history = [];
      let undoLeft = L.undo, addUsed = false;
      let winT = -1, time = 0, flash = 0;
      const parts = [];
      let tw = 40, cellH = 36, TH = 160, slot = 60, rowsY = [], rowSpan = [];
      const undoBtn = { x: 0, y: 0, w: 0, h: 0, p: 0 }, addBtn = { x: 0, y: 0, w: 0, h: 0, p: 0 };
      const bubbles = [];
      for (let i = 0; i < 16; i++) bubbles.push({ x: Math.random(), y: Math.random(), r: 2 + Math.random() * 6, s: 0.02 + Math.random() * 0.05 });
      const poly = new Float64Array(8);

      function colorOf(k) { return COLORS[L.pal[k]]; }

      function layout() {
        const W = api.W, H = api.H, N = tubes.length;
        const btnH = 54;
        const top = 14, bottom = btnH + 30;
        const rows = N <= 6 ? 1 : 2;
        const per = Math.ceil(N / rows);
        slot = Math.min((W - 20) / per, 100);
        tw = Math.min(64, slot * 0.66);
        const availH = H - top - bottom;
        const rowH = availH / rows;
        cellH = Math.max(14, Math.min(tw * 1.1, (rowH - 58 - tw * 0.5) / CAP));
        TH = CAP * cellH + tw * 0.45 + 3;
        const gapY = 58;
        const totalH = rows * TH + (rows - 1) * gapY;
        const y0 = top + Math.max(30, (availH - totalH) / 2);
        rowsY = []; rowSpan = [];
        let idx = 0;
        for (let r = 0; r < rows; r++) {
          const cnt = r < rows - 1 ? per : N - per * (rows - 1);
          const x0 = (W - cnt * slot) / 2 + slot / 2;
          const y = y0 + r * (TH + gapY);
          rowsY.push(y); rowSpan.push([x0 - slot / 2 + 4, x0 + (cnt - 1) * slot + slot / 2 - 4]);
          for (let i = 0; i < cnt; i++, idx++) { tubes[idx].hx = x0 + i * slot; tubes[idx].hy = y; tubes[idx].row = r; }
        }
        const bw = Math.min(150, (W - 48) / 2);
        undoBtn.w = addBtn.w = bw; undoBtn.h = addBtn.h = btnH;
        undoBtn.x = W / 2 - bw - 8; addBtn.x = W / 2 + 8;
        undoBtn.y = addBtn.y = H - btnH - 14;
      }
      layout();

      function topRun(t) {
        const c = t.cells;
        if (!c.length) return 0;
        const k = c[c.length - 1].k;
        let run = 1;
        while (run < c.length && c[c.length - 1 - run].k === k && !c[c.length - 1 - run].h) run++;
        return run;
      }
      function isDone(t) {
        const c = t.cells;
        if (c.length === 0) return true;
        if (c.length !== CAP) return false;
        for (let i = 0; i < CAP; i++) if (c[i].k !== c[0].k) return false;
        return true;
      }
      function busy(i) { return anim && (anim.s === i); }
      function canPour(i, j) {
        if (i === j) return false;
        const s = tubes[i], d = tubes[j];
        if (!s.cells.length || isDone(s) || d.cells.length >= CAP) return false;
        if (!d.cells.length) return true;
        return d.cells[d.cells.length - 1].k === s.cells[s.cells.length - 1].k;
      }
      function anyMove() {
        for (let i = 0; i < tubes.length; i++) for (let j = 0; j < tubes.length; j++) if (canPour(i, j)) return true;
        return false;
      }
      function doneCount() {
        let n = 0;
        for (const t of tubes) if (t.cells.length === CAP && isDone(t)) n++;
        return n;
      }
      function updInfo() {
        if (api.level === 1 && !api.diff) api.info('點一支試管，再點另一支，把同色倒在一起');
        else if (api.level === 1 && api.diff === 2) api.info('困難：只有 1 支空試管，「?」藏很多');
        else if (api.level === 8 && !api.diff) api.info('新挑戰：「?」要露出到最上面才會揭曉');
        else api.info('已完成 ' + doneCount() + ' / ' + L.n + ' 色');
      }
      updInfo();

      function burst(x, y, col, n, spd, star) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, v = spd * (0.3 + Math.random() * 0.7);
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spd * 0.3, life: 0, max: 0.5 + Math.random() * 0.5, c: col, s: 2 + Math.random() * 3, star });
        }
      }

      function startPour(i, j) {
        const s = tubes[i], d = tubes[j];
        history.push(tubes.map((t) => t.cells.slice()));
        const amt = Math.min(topRun(s), CAP - d.cells.length);
        const moved = s.cells.splice(s.cells.length - amt, amt);
        for (const c of moved) d.cells.push(c);
        const side = s.hx >= d.hx ? 1 : -1;
        const len0 = s.cells.length + amt;
        const a0 = 0.9 + 0.55 * (1 - len0 / CAP);
        anim = { s: i, d: j, k: amt, col: colorOf(moved[0].k), t: 0, ph: 0, p: 0, side, a0, sx: s.hx, sy: s.hy - s.lift * 22 };
        const cs = Math.cos(a0), sn = Math.sin(a0);
        const offX = -side * (tw / 2) * cs, offY = (tw / 2) * sn;
        anim.tx = d.hx - offX + side * 2;
        anim.ty = d.hy - 26 - offY;
        sel = -1;
        api.sfx('pour');
      }

      function endPour() {
        const a = anim;
        anim = null;
        const s = tubes[a.s], d = tubes[a.d];
        s.lift = 0;
        const top = s.cells[s.cells.length - 1];
        if (top && top.h) { top.h = false; top.rv = 0; api.sfx('pop'); burst(s.hx, s.hy + TH - 3 - s.cells.length * cellH, '#ffffff', 8, 90, false); }
        if (d.cells.length === CAP && isDone(d) && d.cork < 0) {
          d.cork = 0; d.pop = 1;
          for (const c of d.cells) if (c.h) { c.h = false; c.rv = 0; }
          api.sfx('good');
          burst(d.hx, d.hy, colorOf(d.cells[0].k), 18, 160, true);
          burst(d.hx, d.hy, '#fff6c2', 10, 120, true);
        }
        updInfo();
        if (tubes.every(isDone)) { winT = 0; return; }
        if (pending) {
          const pd = pending; pending = null;
          if (canPour(pd[0], pd[1])) { startPour(pd[0], pd[1]); return; }
        }
        if (!anyMove() && (undoLeft <= 0 || !history.length) && addUsed) api.lose('沒有可以倒的了');
      }

      function doUndo() {
        if (anim || !history.length || undoLeft <= 0) { undoBtn.p = -1; api.sfx('bad'); return; }
        const snap = history.pop();
        undoLeft--;
        tubes.forEach((t, i) => { t.cells = snap[i] ? snap[i].slice() : []; if (!isDone(t) || !t.cells.length) t.cork = -1; t.wig = 0.3; });
        sel = -1; pending = null;
        undoBtn.p = 1;
        api.sfx('drop');
        updInfo();
      }
      function doAdd() {
        if (addUsed) { addBtn.p = -1; api.sfx('bad'); return; }
        addUsed = true;
        tubes.push({ cells: [], hx: 0, hy: 0, lift: 0, shake: 0, cork: -1, pop: 0, born: 0, wig: 0 });
        for (const h of history) h.push([]);
        layout();
        addBtn.p = 1;
        api.sfx('good');
        const t = tubes[tubes.length - 1];
        burst(t.hx, t.hy + TH / 2, '#bff8ff', 14, 120, true);
        if (anim) {
          const d = tubes[anim.d];
          const cs = Math.cos(anim.a0), sn = Math.sin(anim.a0);
          anim.tx = d.hx + anim.side * (tw / 2) * cs + anim.side * 2;
          anim.ty = d.hy - 26 - (tw / 2) * sn;
        }
      }

      function tubeAt(x, y) {
        for (let i = 0; i < tubes.length; i++) {
          const t = tubes[i];
          const half = Math.max(tw / 2 + 6, 24);
          if (x >= t.hx - half && x <= t.hx + half && y >= t.hy - 34 && y <= t.hy + TH + 12) return i;
        }
        return -1;
      }
      function inBtn(b, x, y) { return x >= b.x && x <= b.x + b.w && y >= b.y - 4 && y <= b.y + b.h + 4; }

      function down(x, y) {
        if (api.ended || winT >= 0) return;
        if (inBtn(undoBtn, x, y)) { doUndo(); return; }
        if (inBtn(addBtn, x, y)) { doAdd(); return; }
        const i = tubeAt(x, y);
        if (i < 0) { if (sel >= 0) { sel = -1; api.sfx('tap'); } return; }
        const t = tubes[i];
        if (busy(i)) return;
        if (sel < 0) {
          if (!t.cells.length || isDone(t)) { t.shake = 0.35; api.sfx('bad'); return; }
          sel = i; api.sfx('tap');
          return;
        }
        if (sel === i) { sel = -1; api.sfx('tap'); return; }
        if (canPour(sel, i)) {
          if (anim) { pending = [sel, i]; tubes[sel].lift = 1; sel = -1; api.sfx('tap'); }
          else startPour(sel, i);
          return;
        }
        t.shake = 0.35; tubes[sel].shake = 0.2;
        api.sfx('bad');
        sel = -1;
      }

      function update(dt) {
        time += dt;
        for (const b of bubbles) { b.y -= b.s * dt; if (b.y < -0.05) { b.y = 1.05; b.x = Math.random(); } }
        for (let i = 0; i < tubes.length; i++) {
          const t = tubes[i];
          const target = (sel === i || (pending && pending[0] === i)) ? 1 : 0;
          if (!(anim && anim.s === i)) t.lift += (target - t.lift) * Math.min(1, dt * 18);
          if (t.shake > 0) t.shake = Math.max(0, t.shake - dt);
          if (t.wig > 0) t.wig = Math.max(0, t.wig - dt);
          if (t.pop > 0) t.pop = Math.max(0, t.pop - dt * 2.5);
          if (t.born < 1) t.born = Math.min(1, t.born + dt * 3);
          if (t.cork >= 0 && t.cork < 1) t.cork = Math.min(1, t.cork + dt * 2.6);
          for (const c of t.cells) if (c.rv >= 0) { c.rv += dt; if (c.rv > 0.45) c.rv = -1; }
        }
        if (anim) {
          const a = anim;
          const D = [0.2, 0.16, 0.16 + 0.11 * a.k, 0.24];
          a.t += dt;
          while (a.ph < 4 && a.t >= D[a.ph]) { a.t -= D[a.ph]; a.ph++; if (a.ph === 2) burst(a.tx, tubes[a.d].hy, a.col, 4, 40, false); }
          if (a.ph === 2) a.p = Math.min(1, a.t / D[2]);
          else if (a.ph > 2) a.p = 1;
          a.u = a.ph < 4 ? Math.min(1, a.t / D[a.ph]) : 1;
          if (a.ph >= 4) endPour();
        }
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 320 * dt; p.vx *= 0.985;
          if (p.life > p.max) parts.splice(i, 1);
        }
        if (undoBtn.p) undoBtn.p = Math.abs(undoBtn.p) < 0.05 ? 0 : undoBtn.p * Math.pow(0.002, dt);
        if (addBtn.p) addBtn.p = Math.abs(addBtn.p) < 0.05 ? 0 : addBtn.p * Math.pow(0.002, dt);
        if (winT >= 0) {
          const before = winT;
          winT += dt;
          if (before < 0.35 && winT >= 0.35) {
            for (let i = 0; i < 90; i++) {
              const col = COLORS[i % COLORS.length];
              parts.push({ x: api.W * Math.random(), y: -10 - Math.random() * 60, vx: (Math.random() - 0.5) * 120, vy: 60 + Math.random() * 140, life: 0, max: 2.2, c: col, s: 3 + Math.random() * 3, conf: true, rot: Math.random() * 6 });
            }
          }
          if (before < 1.1 && winT >= 1.1) api.win('全部分好色了！');
        }
      }

      // pose of tube i: mouth centre (px, py) and angle th
      function pose(i, out) {
        const t = tubes[i];
        let px = t.hx, py = t.hy - t.lift * 22, th = 0;
        if (t.shake > 0) px += Math.sin(t.shake * 60) * 5 * (t.shake / 0.35);
        if (t.wig > 0) th = Math.sin(t.wig * 40) * 0.05 * (t.wig / 0.3);
        if (anim && anim.s === i) {
          const a = anim, e = (x) => x * x * (3 - 2 * x);
          const thF = -a.side * a.a0;
          if (a.ph === 0) { const u = e(a.u); px = U.lerp(a.sx, a.tx, u); py = U.lerp(a.sy, a.ty, u) - Math.sin(u * Math.PI) * 26; th = thF * 0.3 * u; }
          else if (a.ph === 1) { px = a.tx; py = a.ty; th = U.lerp(thF * 0.3, thF, e(a.u)); }
          else if (a.ph === 2) { px = a.tx; py = a.ty; th = thF - a.side * 0.28 * a.p; }
          else { const u = e(a.u); px = U.lerp(a.tx, t.hx, u); py = U.lerp(a.ty, t.hy, u) - Math.sin(u * Math.PI) * 20; th = (thF - a.side * 0.28) * (1 - u); }
        }
        out.px = px; out.py = py; out.th = th;
        return out;
      }
      const P = { px: 0, py: 0, th: 0 };

      // ---------- art: 卡通 Q 版 potion shop ----------
      const OL = '#2a1a14';
      function olw() { return Math.max(2, Math.min(3.5, tw * 0.075)); }
      function stroked(g, str, x, y, size, col, lw) {
        g.font = '900 ' + size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineJoin = 'round'; g.lineWidth = lw || Math.max(3, size * 0.22); g.strokeStyle = OL;
        g.strokeText(str, x, y); g.fillStyle = col; g.fillText(str, x, y);
      }

      // static shop background, cached per size
      function drawBackground(c, W, H) {
        const R = mulberryLite(17);
        // wallpaper
        const wall = c.createLinearGradient(0, 0, 0, H);
        wall.addColorStop(0, '#6b3f7a'); wall.addColorStop(0.6, '#8a4f86'); wall.addColorStop(1, '#a55f86');
        c.fillStyle = wall; c.fillRect(0, 0, W, H);
        c.fillStyle = 'rgba(255,255,255,0.06)';
        for (let x = 0; x < W; x += 36) c.fillRect(x, 0, 14, H);
        c.fillStyle = 'rgba(255,220,160,0.22)';
        for (let y = 24; y < H; y += 46) for (let x = (y / 46 % 2) * 18 + 4; x < W; x += 36) {
          c.beginPath(); c.moveTo(x, y - 5); c.lineTo(x + 4, y); c.lineTo(x, y + 5); c.lineTo(x - 4, y); c.closePath(); c.fill();
        }
        // round window with moon, top-left
        const wr = Math.min(W, H) * 0.12, wx = wr + 14, wy = wr + 30;
        c.beginPath(); c.arc(wx, wy, wr, 0, Math.PI * 2);
        const sky = c.createLinearGradient(0, wy - wr, 0, wy + wr);
        sky.addColorStop(0, '#2b2f6b'); sky.addColorStop(1, '#5b5fae');
        c.fillStyle = sky; c.fill();
        c.fillStyle = '#fff3b0'; c.beginPath(); c.arc(wx + wr * 0.3, wy - wr * 0.25, wr * 0.32, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#5b5fae'; c.beginPath(); c.arc(wx + wr * 0.45, wy - wr * 0.35, wr * 0.26, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fff'; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(wx - wr * 0.6 + R() * wr * 0.9, wy - wr * 0.5 + R() * wr, 1.3, 0, Math.PI * 2); c.fill(); }
        c.lineWidth = 6; c.strokeStyle = '#9c6236'; c.beginPath(); c.arc(wx, wy, wr, 0, Math.PI * 2); c.stroke();
        c.lineWidth = 3; c.strokeStyle = '#9c6236'; c.beginPath(); c.moveTo(wx - wr, wy); c.lineTo(wx + wr, wy); c.moveTo(wx, wy - wr); c.lineTo(wx, wy + wr); c.stroke();
        c.lineWidth = 2.5; c.strokeStyle = OL;
        c.beginPath(); c.arc(wx, wy, wr + 3, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.arc(wx, wy, wr - 3, 0, Math.PI * 2); c.stroke();
        // hanging lantern top-right
        const lx = W - 34, ly = 46;
        c.strokeStyle = OL; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, 0); c.lineTo(lx, ly - 14); c.stroke();
        c.fillStyle = 'rgba(255,214,120,0.18)'; c.beginPath(); c.arc(lx, ly + 4, 34, 0, Math.PI * 2); c.fill();
        U.rr(c, lx - 10, ly - 16, 20, 7, 3); c.fillStyle = '#4a3a3a'; c.fill(); c.lineWidth = 2.5; c.stroke();
        U.rr(c, lx - 13, ly - 9, 26, 28, 9); c.fillStyle = '#ffd36b'; c.fill(); c.stroke();
        c.fillStyle = '#fff6c8'; U.rr(c, lx - 8, ly - 5, 6, 18, 3); c.fill();
        U.rr(c, lx - 10, ly + 19, 20, 6, 3); c.fillStyle = '#4a3a3a'; c.fill(); c.stroke();
        // bunting across the top
        c.strokeStyle = OL; c.lineWidth = 2;
        c.beginPath(); c.moveTo(wx + wr + 6, 8); c.quadraticCurveTo((wx + wr + lx) / 2, 30, lx - 16, 8); c.stroke();
        const fl = ['#ff5d6c', '#ffcc4d', '#4cd986', '#4c9bff', '#ff7ac8'];
        const n = Math.max(3, Math.floor((lx - 16 - wx - wr - 6) / 30));
        for (let k = 1; k < n; k++) {
          const t = k / n, x0 = wx + wr + 6, x1 = lx - 16;
          const fx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t * t * x1;
          const fy = (1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * 30 + t * t * 8;
          c.beginPath(); c.moveTo(fx - 8, fy); c.lineTo(fx + 8, fy); c.lineTo(fx, fy + 15); c.closePath();
          c.fillStyle = fl[k % fl.length]; c.fill(); c.lineWidth = 2; c.stroke();
        }
        // counter at the bottom (buttons sit on it)
        const cy = H - 54 - 30;
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, cy - 4, W, 8);
        const wood = c.createLinearGradient(0, cy, 0, H);
        wood.addColorStop(0, '#c98a52'); wood.addColorStop(1, '#8d5530');
        c.fillStyle = wood; c.fillRect(0, cy, W, H - cy);
        c.fillStyle = '#e0a868'; c.fillRect(0, cy, W, 9);
        c.strokeStyle = OL; c.lineWidth = 3;
        c.beginPath(); c.moveTo(0, cy); c.lineTo(W, cy); c.moveTo(0, cy + 9); c.lineTo(W, cy + 9); c.stroke();
        c.strokeStyle = 'rgba(80,40,20,0.35)'; c.lineWidth = 1.5;
        for (let x = 40; x < W; x += 74) { c.beginPath(); c.moveTo(x, cy + 12); c.lineTo(x, H); c.stroke(); }
        for (let k = 0; k < 6; k++) { const x = R() * W, y = cy + 20 + R() * (H - cy - 26); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 14, y - 3, x + 28, y); c.stroke(); }
        // little cauldron peeking at bottom-left and a mushroom jar bottom-right
        blobC(c, 10, cy - 2, 26, 18, '#3d3550');
        c.fillStyle = '#7dff9a'; c.beginPath(); c.ellipse(10, cy - 14, 20, 5, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(200,255,210,0.8)'; c.beginPath(); c.arc(6, cy - 24, 4, 0, Math.PI * 2); c.arc(16, cy - 32, 3, 0, Math.PI * 2); c.fill();
        U.rr(c, W - 30, cy - 34, 26, 32, 8); c.fillStyle = 'rgba(210,240,255,0.55)'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = OL; c.stroke();
        c.fillStyle = '#ff5d6c'; c.beginPath(); c.arc(W - 17, cy - 14, 8, Math.PI, 0); c.closePath(); c.fill(); c.lineWidth = 2; c.stroke();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(W - 20, cy - 17, 1.6, 0, Math.PI * 2); c.arc(W - 14, cy - 16, 1.3, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#f2e3c6'; c.fillRect(W - 19, cy - 14, 4, 8);
        U.rr(c, W - 32, cy - 40, 30, 8, 3); c.fillStyle = '#b07a4a'; c.fill(); c.stroke();
      }
      function mulberryLite(a) { return () => { a = (a * 9301 + 49297) % 233280; return a / 233280; }; }
      function blobC(c, x, y, rx, ry, fill) {
        c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
      }
      let bgC = null, bgW = 0, bgH = 0;
      function bgLayer(W, H) {
        if (bgC && bgW === W && bgH === H) return bgC;
        bgW = W; bgH = H;
        try {
          const dpr = Math.min(window.devicePixelRatio || 1, 3);
          bgC = document.createElement('canvas');
          bgC.width = Math.max(1, Math.round(W * dpr)); bgC.height = Math.max(1, Math.round(H * dpr));
          const c = bgC.getContext('2d');
          c.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawBackground(c, W, H);
        } catch (e) { bgC = null; }
        return bgC;
      }

      function tubePath(g, w, h, inset) {
        const r = w / 2 - inset;
        g.beginPath();
        g.moveTo(-r, inset * 0.3);
        g.lineTo(-r, h - inset - r);
        g.arc(0, h - inset - r, r, Math.PI, 0, true);
        g.lineTo(r, inset * 0.3);
        g.closePath();
      }

      function drawTube(g, i) {
        const t = tubes[i];
        pose(i, P);
        const px = P.px, py = P.py, th = P.th;
        const w = tw, h = TH, lw = olw();
        const sc = (0.6 + 0.4 * U.easeOutBack(t.born)) * (1 + t.pop * 0.08);
        g.save();
        g.translate(px, py + h / 2);
        g.scale(sc, sc);
        g.translate(0, -h / 2);
        g.rotate(th);
        // selection glow
        if (sel === i || (pending && pending[0] === i)) {
          tubePath(g, w, h, 0);
          g.lineWidth = lw + 7; g.strokeStyle = 'rgba(255,236,120,' + (0.75 + 0.25 * Math.sin(time * 8)).toFixed(3) + ')';
          g.lineJoin = 'round'; g.stroke();
        }
        // glass body
        tubePath(g, w, h, 0);
        g.fillStyle = 'rgba(225,245,255,0.42)';
        g.fill();
        // liquid
        g.save();
        tubePath(g, w, h, 0);
        g.clip();
        let cnt = t.cells.length, extra = 0, extraCol = null;
        if (anim && anim.d === i) { cnt -= anim.k; extra = anim.k * anim.p; extraCol = anim.col; }
        if (anim && anim.s === i) { extra = anim.k * (1 - anim.p); extraCol = anim.col; }
        const iw = w - 6, bottom = h - 3;
        const tilted = Math.abs(th) > 0.002;
        const cs = Math.cos(th), sn = Math.sin(th);
        if (tilted) {
          g.rotate(-th);
          const lx = [-iw / 2, iw / 2, iw / 2, -iw / 2], ly = [0, 0, bottom, bottom];
          let ymin = 1e9, ymax = -1e9;
          for (let k = 0; k < 4; k++) {
            const yy = lx[k] * sn + ly[k] * cs;
            poly[k * 2] = lx[k] * cs - ly[k] * sn; poly[k * 2 + 1] = yy;
            if (yy < ymin) ymin = yy; if (yy > ymax) ymax = yy;
          }
          let cum = 0, prevY = ymax + 8;
          const span = h + w;
          const total = cnt + (extra > 0.001 ? 1 : 0);
          for (let s = 0; s < total; s++) {
            const isExtra = s === cnt;
            const amt = isExtra ? extra : 1;
            cum += amt;
            const yTop = levelFor(poly, Math.min(cum * cellH * iw, iw * bottom * 0.999), ymin, ymax);
            const cell = isExtra ? null : t.cells[s];
            const col = isExtra ? extraCol : (cell.h ? HID_COL : colorOf(cell.k));
            g.fillStyle = col;
            g.fillRect(-span, yTop, span * 2, prevY - yTop + 0.6);
            g.fillStyle = 'rgba(42,26,20,0.28)'; g.fillRect(-span, yTop, span * 2, 1.5);
            if (s === total - 1) { g.fillStyle = U.shade(col, 0.45); g.fillRect(-span, yTop, span * 2, 3.5); }
            prevY = yTop;
          }
          g.rotate(th);
        } else {
          let y = h + 2;
          const total = cnt + (extra > 0.001 ? 1 : 0);
          let prevCol = null;
          for (let s = 0; s < total; s++) {
            const isExtra = s === cnt;
            const hh = (isExtra ? extra : 1) * cellH + (s === 0 ? 5 : 0);
            const cell = isExtra ? null : t.cells[s];
            const col = isExtra ? extraCol : (cell.h ? HID_COL : colorOf(cell.k));
            g.fillStyle = col;
            g.fillRect(-w, y - hh, w * 2, hh + 0.6);
            g.fillStyle = U.shade(col, -0.18);
            g.fillRect(w / 2 - w * 0.26, y - hh, w * 0.26, hh + 0.6);
            if (s > 0 && col !== prevCol) { g.fillStyle = 'rgba(42,26,20,0.3)'; g.fillRect(-w, y - 1, w * 2, 1.5); }
            prevCol = col;
            if (cell && cell.h) {
              stroked(g, '?', 0, y - hh / 2 + 1, Math.min(cellH * 0.62, w * 0.6), '#ffffff', 3);
            }
            if (cell && cell.rv >= 0) {
              g.fillStyle = 'rgba(255,255,255,' + (0.8 * (1 - cell.rv / 0.45)).toFixed(3) + ')';
              g.fillRect(-w, y - hh, w * 2, hh);
            }
            if (s === total - 1) {
              g.fillStyle = U.shade(col, 0.45);
              g.fillRect(-w, y - hh, w * 2, Math.min(4, hh));
            }
            y -= hh;
          }
        }
        g.restore();
        // gloss strip
        g.fillStyle = 'rgba(255,255,255,0.7)';
        U.rr(g, -w / 2 + w * 0.16, 9, Math.max(3, w * 0.12), h - w / 2 - 12, w * 0.06); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.5)';
        g.beginPath(); g.arc(-w / 2 + w * 0.22, h - w * 0.32, Math.max(1.5, w * 0.05), 0, Math.PI * 2); g.fill();
        // happy face on a finished tube
        if (t.cork >= 0 && t.cells.length === CAP && !tilted) {
          const fy = h - cellH * 1.6, s = Math.max(0.55, Math.min(1.2, w / 44));
          g.save(); g.translate(0, fy); g.scale(s, s);
          g.strokeStyle = OL; g.lineWidth = 2.4; g.lineCap = 'round';
          g.beginPath(); g.arc(-8, 0, 4, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
          g.beginPath(); g.arc(8, 0, 4, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
          g.beginPath(); g.arc(0, 3, 5, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
          g.fillStyle = 'rgba(255,120,150,0.65)';
          g.beginPath(); g.ellipse(-13, 5, 4, 2.5, 0, 0, Math.PI * 2); g.ellipse(13, 5, 4, 2.5, 0, 0, Math.PI * 2); g.fill();
          g.restore();
        }
        // outline + lip
        tubePath(g, w, h, 0);
        g.lineWidth = lw; g.lineJoin = 'round';
        g.strokeStyle = OL;
        g.stroke();
        U.rr(g, -w / 2 - 5, -7, w + 10, 11, 5);
        g.fillStyle = '#e9f8ff';
        g.fill();
        g.lineWidth = lw * 0.85; g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.9)';
        U.rr(g, -w / 2 - 1, -5, w * 0.5, 3, 1.5); g.fill();
        // cork
        if (t.cork >= 0) {
          const e = U.easeOutBack(t.cork);
          const cy = -w * 0.42 - (1 - e) * 46;
          const cw = w * 0.74, ch = w * 0.52;
          g.globalAlpha = Math.min(1, t.cork * 3);
          U.rr(g, -cw / 2, cy, cw, ch, cw * 0.22);
          g.fillStyle = '#d99a5a'; g.fill();
          g.lineWidth = lw * 0.85; g.strokeStyle = OL; g.stroke();
          U.rr(g, -cw / 2 + 3, cy + 3, cw - 6, ch * 0.28, 4);
          g.fillStyle = '#f2c38a'; g.fill();
          g.fillStyle = 'rgba(120,70,30,0.6)';
          g.beginPath(); g.arc(-cw * 0.2, cy + ch * 0.62, 1.6, 0, Math.PI * 2); g.arc(cw * 0.18, cy + ch * 0.72, 1.4, 0, Math.PI * 2); g.fill();
          g.globalAlpha = 1;
        }
        g.restore();
        return P;
      }

      function drawStream(g) {
        const a = anim;
        if (!a || a.ph !== 2) return;
        pose(a.s, P);
        const cs = Math.cos(P.th), sn = Math.sin(P.th);
        const lx = -a.side * tw / 2;
        const sx = P.px + lx * cs, sy = P.py + lx * sn;
        const d = tubes[a.d];
        const lvl = d.cells.length - a.k + a.k * a.p;
        const ey = d.hy + TH - 3 - lvl * cellH;
        const wdt = Math.max(3, tw * 0.17) * (a.p < 0.85 ? 1 : (1 - a.p) / 0.15 + 0.2);
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(sx, sy);
        g.quadraticCurveTo(sx + (d.hx - sx) * 0.2, sy + 6, d.hx + Math.sin(time * 40) * 0.8, ey);
        g.strokeStyle = OL; g.lineWidth = wdt + 4; g.stroke();
        g.strokeStyle = a.col; g.lineWidth = wdt; g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.45)';
        g.lineWidth = wdt * 0.3;
        g.stroke();
        g.fillStyle = a.col; g.strokeStyle = OL; g.lineWidth = 1.5;
        for (let k = 0; k < 3; k++) {
          const ang = time * 9 + k * 2.1;
          g.beginPath(); g.arc(d.hx + Math.cos(ang) * tw * 0.25, ey - 2 - Math.abs(Math.sin(ang)) * 5, 2.6, 0, Math.PI * 2); g.fill(); g.stroke();
        }
      }

      function drawBtn(g, b, label, badge, enabled, base) {
        const s = 1 + (b.p > 0 ? b.p * 0.08 : 0);
        const off = b.p < 0 ? Math.sin(time * 50) * 4 * -b.p : 0;
        g.save();
        g.translate(b.x + b.w / 2 + off, b.y + b.h / 2);
        g.scale(s, s);
        const c1 = enabled ? base : '#9a8f94';
        g.lineJoin = 'round';
        U.rr(g, -b.w / 2, -b.h / 2 + 5, b.w, b.h, b.h / 2);
        g.fillStyle = U.shade(c1, -0.35); g.fill();
        g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
        U.rr(g, -b.w / 2, -b.h / 2, b.w, b.h, b.h / 2);
        g.fillStyle = c1; g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.35)';
        U.rr(g, -b.w / 2 + 12, -b.h / 2 + 5, b.w - 24, b.h * 0.3, b.h * 0.15); g.fill();
        stroked(g, label, 0, 2, 19, enabled ? '#fff' : '#e4dde0', 4);
        if (badge !== null) {
          const bx = b.w / 2 - 6, by = -b.h / 2 + 4;
          g.fillStyle = enabled ? '#ff4d6d' : '#8a8da0';
          g.beginPath(); g.arc(bx, by, 12, 0, Math.PI * 2); g.fill();
          g.strokeStyle = OL; g.lineWidth = 2.5; g.stroke();
          stroked(g, String(badge), bx, by + 1, 13, '#fff', 3);
        }
        g.restore();
      }

      function drawShelf(g, a, b, y) {
        const lw = 3;
        g.lineJoin = 'round';
        // brackets
        g.fillStyle = '#7a4a28'; g.strokeStyle = OL; g.lineWidth = 2.5;
        for (const bx of [a + 18, b - 18]) {
          g.beginPath(); g.moveTo(bx - 6, y + 12); g.lineTo(bx + 6, y + 12); g.lineTo(bx + 6, y + 22); g.quadraticCurveTo(bx, y + 26, bx - 6, y + 34); g.closePath(); g.fill(); g.stroke();
        }
        g.fillStyle = 'rgba(0,0,0,0.22)';
        U.rr(g, a + 4, y + 14, b - a - 8, 8, 4); g.fill();
        U.rr(g, a, y, b - a, 14, 6);
        g.fillStyle = '#c98a52'; g.fill();
        g.lineWidth = lw; g.strokeStyle = OL; g.stroke();
        g.fillStyle = '#e8b47a';
        U.rr(g, a + 6, y + 2.5, b - a - 12, 4, 2); g.fill();
        g.strokeStyle = 'rgba(90,45,20,0.4)'; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(a + (b - a) * 0.3, y + 9); g.lineTo(a + (b - a) * 0.45, y + 9); g.moveTo(a + (b - a) * 0.62, y + 10); g.lineTo(a + (b - a) * 0.8, y + 10); g.stroke();
      }

      function draw(g) {
        const W = api.W, H = api.H;
        const bc = bgLayer(W, H);
        if (bc) g.drawImage(bc, 0, 0, W, H); else drawBackground(g, W, H);
        // drifting sparkles from the cauldron
        g.fillStyle = 'rgba(190,255,210,0.55)';
        for (const b of bubbles) { g.beginPath(); g.arc(b.x * W, b.y * H, b.r * 0.5, 0, Math.PI * 2); g.fill(); }
        // shelves
        for (let r = 0; r < rowsY.length; r++) drawShelf(g, rowSpan[r][0], rowSpan[r][1], rowsY[r] + TH + 6);
        for (let i = 0; i < tubes.length; i++) if (!(anim && anim.s === i)) drawTube(g, i);
        if (anim) { drawTube(g, anim.s); drawStream(g); }
        // particles
        for (const p of parts) {
          const al = Math.max(0, 1 - p.life / p.max);
          g.globalAlpha = al;
          g.fillStyle = p.c;
          if (p.conf) {
            g.save(); g.translate(p.x, p.y); g.rotate(p.rot + p.life * 8);
            g.fillRect(-p.s, -p.s * 0.5, p.s * 2, p.s); g.restore();
          } else if (p.star) {
            const r = p.s * (1.2 - p.life / p.max * 0.5);
            g.beginPath();
            g.moveTo(p.x, p.y - r * 1.8); g.lineTo(p.x + r * 0.45, p.y - r * 0.45); g.lineTo(p.x + r * 1.8, p.y);
            g.lineTo(p.x + r * 0.45, p.y + r * 0.45); g.lineTo(p.x, p.y + r * 1.8); g.lineTo(p.x - r * 0.45, p.y + r * 0.45);
            g.lineTo(p.x - r * 1.8, p.y); g.lineTo(p.x - r * 0.45, p.y - r * 0.45); g.closePath(); g.fill();
            g.strokeStyle = OL; g.lineWidth = 1.2; g.stroke();
          } else {
            g.beginPath(); g.arc(p.x, p.y, p.s, 0, Math.PI * 2); g.fill();
          }
        }
        g.globalAlpha = 1;
        drawBtn(g, undoBtn, '↶ 撤銷', undoLeft, undoLeft > 0 && history.length > 0 && !anim, '#4c9bff');
        drawBtn(g, addBtn, '＋ 試管', addUsed ? 0 : 1, !addUsed, '#2ecc8f');
      }

      function resize() { layout(); }

      const _test = { L, tap(i) { const t = tubes[i]; return [t.hx, t.hy + TH / 2]; }, busy: () => !!anim || winT >= 0, cells: () => tubes.map((t) => t.cells.map((c) => c.k).join(',')) };
      return { update, draw, down, resize, _test };
    },
  });
})();
