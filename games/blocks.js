// 方塊消除 — Block Blast style 8x8 puzzle.
(function () {
  'use strict';
  const N = 8;
  const COLORS = ['#ff4f5e', '#ff9a2e', '#ffcf2e', '#47cf62', '#22c3e6', '#3f7bff', '#a35cff', '#ff63bd'];

  // ---------- shapes ----------
  function norm(cells) {
    let mr = 99, mc = 99;
    for (const p of cells) { mr = Math.min(mr, p[0]); mc = Math.min(mc, p[1]); }
    return cells.map((p) => [p[0] - mr, p[1] - mc]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  }
  function rot(cells) { return norm(cells.map((p) => [p[1], -p[0]])); }
  function keyOf(cells) { return cells.map((p) => p[0] + ',' + p[1]).join(';'); }
  function rect(h, w) { const o = []; for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) o.push([r, c]); return o; }
  const BASE = [
    { cells: [[0, 0]], wt: 0.8 },
    { cells: rect(1, 2), wt: 1.1 },
    { cells: rect(1, 3), wt: 1.2 },
    { cells: rect(1, 4), wt: 1.0 },
    { cells: rect(1, 5), wt: 0.75 },
    { cells: rect(2, 2), wt: 1.3 },
    { cells: rect(3, 3), wt: 0.55 },
    { cells: rect(2, 3), wt: 0.6 },
    { cells: [[0, 0], [1, 0], [1, 1]], wt: 1.0 },
    { cells: [[0, 0], [1, 0], [2, 0], [2, 1]], wt: 0.9 },
    { cells: [[0, 1], [1, 1], [2, 1], [2, 0]], wt: 0.9 },
    { cells: [[0, 0], [0, 1], [0, 2], [1, 1]], wt: 0.9 },
    { cells: [[0, 1], [0, 2], [1, 0], [1, 1]], wt: 0.7 },
    { cells: [[0, 0], [0, 1], [1, 1], [1, 2]], wt: 0.7 },
    { cells: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], wt: 0.5 },
  ];
  const SHAPES = [];
  BASE.forEach((b) => {
    const vars = []; const seen = {};
    let cur = norm(b.cells);
    for (let i = 0; i < 4; i++) {
      const k = keyOf(cur);
      if (!seen[k]) { seen[k] = 1; vars.push(cur); }
      cur = rot(cur);
    }
    vars.forEach((cells) => {
      let h = 0, w = 0;
      cells.forEach((p) => { h = Math.max(h, p[0] + 1); w = Math.max(w, p[1] + 1); });
      SHAPES.push({ cells, w, h, n: cells.length, wt: b.wt / vars.length });
    });
  });

  // ---------- pure board logic (shared with tools/check_blocks.js) ----------
  function fits(b, s, r, c) {
    if (r < 0 || c < 0 || r + s.h > N || c + s.w > N) return false;
    for (let i = 0; i < s.cells.length; i++) if (b[(r + s.cells[i][0]) * N + c + s.cells[i][1]]) return false;
    return true;
  }
  function anyFit(b, s) {
    for (let r = 0; r + s.h <= N; r++) for (let c = 0; c + s.w <= N; c++) if (fits(b, s, r, c)) return true;
    return false;
  }
  function fullLines(b) {
    const rows = [], cols = [];
    for (let r = 0; r < N; r++) { let f = true; for (let c = 0; c < N; c++) if (!b[r * N + c]) { f = false; break; } if (f) rows.push(r); }
    for (let c = 0; c < N; c++) { let f = true; for (let r = 0; r < N; r++) if (!b[r * N + c]) { f = false; break; } if (f) cols.push(c); }
    return { rows, cols };
  }
  // place + clear; returns {lines, cleared:[idx]} (mutates b and optional gem array)
  function placeAndClear(b, s, r, c, col, gems) {
    for (let i = 0; i < s.cells.length; i++) b[(r + s.cells[i][0]) * N + c + s.cells[i][1]] = col;
    const fl = fullLines(b);
    const set = {};
    fl.rows.forEach((rr) => { for (let cc = 0; cc < N; cc++) set[rr * N + cc] = 1; });
    fl.cols.forEach((cc) => { for (let rr = 0; rr < N; rr++) set[rr * N + cc] = 1; });
    const cleared = Object.keys(set).map(Number);
    let gemsGot = 0;
    cleared.forEach((i) => { b[i] = 0; if (gems && gems[i]) { gems[i] = 0; gemsGot++; } });
    return { lines: fl.rows.length + fl.cols.length, rows: fl.rows, cols: fl.cols, cleared, gemsGot };
  }
  function clearPoints(lines, combo) {
    if (!lines) return 0;
    const base = 80 * lines + 20 * lines * (lines - 1);
    return Math.round(base * (1 + 0.5 * Math.max(0, combo - 1)));
  }
  function evalBoard(b) {
    let s = 0, empty = 0;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const i = r * N + c;
      if (b[i]) continue;
      empty++;
      let nf = 0;
      if (r === 0 || b[i - N]) nf++;
      if (r === N - 1 || b[i + N]) nf++;
      if (c === 0 || b[i - 1]) nf++;
      if (c === N - 1 || b[i + 1]) nf++;
      if (nf === 4) s -= 7; else if (nf === 3) s -= 2.2;
    }
    let tr = 0;
    for (let r = 0; r < N; r++) for (let c = 0; c < N - 1; c++) if (!b[r * N + c] !== !b[r * N + c + 1]) tr++;
    for (let c = 0; c < N; c++) for (let r = 0; r < N - 1; r++) if (!b[r * N + c] !== !b[(r + 1) * N + c]) tr++;
    s -= tr * 0.9;
    s += empty * 0.6;
    if (anyFit(b, SHAPES[BIG3])) s += 6;
    if (anyFit(b, SHAPES[LINE5H]) && anyFit(b, SHAPES[LINE5V])) s += 3;
    return s;
  }
  let BIG3 = 0, LINE5H = 0, LINE5V = 0;
  SHAPES.forEach((s, i) => {
    if (s.w === 3 && s.h === 3 && s.n === 9) BIG3 = i;
    if (s.w === 5 && s.h === 1) LINE5H = i;
    if (s.w === 1 && s.h === 5) LINE5V = i;
  });
  // best placement of a single shape (greedy). gems: optional, adds bonus for collecting.
  function bestPlacement(b, s, gems) {
    let best = null;
    const tmp = new Array(N * N), tg = gems ? new Array(N * N) : null;
    for (let r = 0; r + s.h <= N; r++) for (let c = 0; c + s.w <= N; c++) {
      if (!fits(b, s, r, c)) continue;
      for (let i = 0; i < N * N; i++) tmp[i] = b[i];
      if (tg) for (let i = 0; i < N * N; i++) tg[i] = gems[i];
      const res = placeAndClear(tmp, s, r, c, 1, tg);
      const v = res.lines * 14 + res.gemsGot * 30 + evalBoard(tmp);
      if (!best || v > best.v) best = { r, c, v, lines: res.lines };
    }
    return best;
  }
  const PERMS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  // can the triple be placed one after another (greedy per order)?
  function canPlaceAll(b, idxs) {
    const tmp = new Array(N * N);
    for (const p of PERMS) {
      for (let i = 0; i < N * N; i++) tmp[i] = b[i];
      let ok = true;
      for (const k of p) {
        const s = SHAPES[idxs[k]];
        const bp = bestPlacement(tmp, s, null);
        if (!bp) { ok = false; break; }
        placeAndClear(tmp, s, bp.r, bp.c, 1, null);
      }
      if (ok) return true;
    }
    return false;
  }
  function pickWeighted(rng, list, wfn) {
    let tot = 0; for (const x of list) tot += wfn(x);
    let v = rng() * tot;
    for (const x of list) { v -= wfn(x); if (v <= 0) return x; }
    return list[list.length - 1];
  }
  function clearsLine(b, s) {
    const tmp = new Array(N * N);
    for (let r = 0; r + s.h <= N; r++) for (let c = 0; c + s.w <= N; c++) {
      if (!fits(b, s, r, c)) continue;
      for (let i = 0; i < N * N; i++) tmp[i] = b[i];
      for (const p of s.cells) tmp[(r + p[0]) * N + c + p[1]] = 1;
      const fl = fullLines(tmp);
      if (fl.rows.length + fl.cols.length) return true;
    }
    return false;
  }
  // fair piece generation: bias to fitting / line-clearing pieces when crowded, triple must be placeable
  // nasty 0..1: 0 = friendly (簡單), 1 = no line-clear help and more big awkward pieces (困難)
  // nasty > 1 (無盡 only, grows with score): some triples are no longer guaranteed placeable together
  function genTriplet(b, rng, nastyIn) {
    const relax = Math.min(14, Math.max(0, Math.floor(((nastyIn || 0) - 1) * 12)));
    const nasty = Math.min(1, nastyIn || 0);
    let filled = 0; for (let i = 0; i < N * N; i++) if (b[i]) filled++;
    const fill = filled / (N * N);
    const all = SHAPES.map((s, i) => i);
    const fitting = all.filter((i) => anyFit(b, SHAPES[i]));
    const helpful = {};
    if (fill > 0.2) fitting.forEach((i) => { if (clearsLine(b, SHAPES[i])) helpful[i] = 1; });
    for (let attempt = 0; attempt < 40; attempt++) {
      const pool = (fill > 0.38 || attempt > 8) ? fitting : all;
      const w = (i) => SHAPES[i].wt * (helpful[i] ? 2.4 - 1.4 * nasty : 1) * (SHAPES[i].n >= 5 ? 1 + 0.7 * nasty : 1) * (fill > 0.55 && SHAPES[i].n >= 6 ? 0.4 + 0.6 * nasty : 1);
      const t = [pickWeighted(rng, pool, w), pickWeighted(rng, pool, w), pickWeighted(rng, pool, w)];
      if (attempt < relax) {
        if (t.every((i) => anyFit(b, SHAPES[i]))) return t;
        continue;
      }
      if (canPlaceAll(b, t)) return t;
    }
    const small = fitting.filter((i) => SHAPES[i].n <= 2);
    const p = small.length ? small : [0];
    return [p[Math.floor(rng() * p.length)], 0, p[Math.floor(rng() * p.length)]];
  }
  function scoreTarget(e) { return e === 1 ? 300 : Math.round((300 + (e - 1) * 95 + Math.pow(e, 1.35) * 4) / 10) * 10; }
  // diff: 0 簡單 (original), 1 普通, 2 困難
  function genLevel(lv, rng, diff) {
    diff = diff || 0;
    const b = new Array(N * N).fill(0), gems = new Array(N * N).fill(0);
    let type = 'score', density = 0;
    const e = diff === 0 ? lv : diff === 1 ? lv + 11 : lv + 28;
    if (diff === 0) {
      if (lv >= 4 && lv % 4 === 0) type = 'gems';
      if (type === 'gems') density = Math.min(0.42, 0.24 + lv * 0.003);
      else if (lv >= 6 && lv % 4 === 2) density = Math.min(0.4, 0.18 + lv * 0.003);
      else if (lv >= 15 && lv % 4 === 3) density = Math.min(0.34, 0.12 + lv * 0.002);
    } else if (diff === 1) {
      if (lv % 3 === 0) type = 'gems';
      if (type === 'gems') density = Math.min(0.44, 0.3 + lv * 0.004);
      else if (lv % 3 === 2) density = Math.min(0.4, 0.2 + lv * 0.004);
    } else {
      if (lv % 3 === 0) type = 'gems';
      density = type === 'gems' ? Math.min(0.48, 0.36 + lv * 0.004) : Math.min(0.42, 0.26 + lv * 0.004);
    }
    if (density > 0) {
      const want = Math.round(density * N * N);
      let cnt = 0, guard = 0;
      while (cnt < want && guard++ < 500) {
        let r = Math.floor(rng() * N), c = Math.floor(rng() * N);
        const col = 1 + Math.floor(rng() * COLORS.length);
        const len = 2 + Math.floor(rng() * 5);
        for (let k = 0; k < len && cnt < want; k++) {
          const i = r * N + c;
          if (!b[i]) { b[i] = col; cnt++; }
          const d = Math.floor(rng() * 4);
          if (d === 0) r = Math.min(N - 1, r + 1); else if (d === 1) r = Math.max(0, r - 1);
          else if (d === 2) c = Math.min(N - 1, c + 1); else c = Math.max(0, c - 1);
        }
      }
      for (let pass = 0; pass < 3; pass++) {
        const fl = fullLines(b);
        fl.rows.forEach((rr) => { b[rr * N + Math.floor(rng() * N)] = 0; });
        fl.cols.forEach((cc) => { b[Math.floor(rng() * N) * N + cc] = 0; });
      }
    }
    let target = 0, gemsNeed = 0;
    if (type === 'gems') {
      const filledIdx = []; for (let i = 0; i < N * N; i++) if (b[i]) filledIdx.push(i);
      gemsNeed = Math.min(filledIdx.length, Math.min(diff === 2 ? 15 : 12, 3 + Math.floor(e / 6)));
      shuffleR(rng, filledIdx);
      for (let k = 0; k < gemsNeed; k++) gems[filledIdx[k]] = 1;
    } else {
      target = diff === 0 ? scoreTarget(lv) : Math.round(scoreTarget(e) * (diff === 1 ? 1.15 : 1.5) / 10) * 10;
    }
    return { type, target, gemsNeed, board: b, gems, nasty: [0, 0.5, 1][diff] };
  }
  function shuffleR(rng, a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  const LOGIC = { N, SHAPES, COLORS, fits, anyFit, fullLines, placeAndClear, clearPoints, evalBoard, bestPlacement, canPlaceAll, genTriplet, genLevel, PERMS };

  // ---------- sprites ----------
  const DPR = () => Math.min(3, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
    return c;
  }
  function blockSprite(util, color, size) {
    const d = DPR();
    const cv = makeCanvas(size * d, size * d);
    const g = cv.getContext('2d');
    g.scale(d, d);
    const s = size, r = s * 0.16, b = s * 0.14;
    util.rr(g, 0, 0, s, s, r); g.fillStyle = util.shade(color, -0.38); g.fill();
    util.rr(g, 0, 0, s, s - b * 0.75, r); g.fillStyle = util.shade(color, 0.38); g.fill();
    util.rr(g, b * 0.5, b * 0.45, s - b, s - b * 1.25, r * 0.7);
    const gr = g.createLinearGradient(0, b * 0.45, 0, s - b * 0.8);
    gr.addColorStop(0, util.shade(color, 0.16)); gr.addColorStop(1, util.shade(color, -0.1));
    g.fillStyle = gr; g.fill();
    g.globalAlpha = 0.42; g.fillStyle = '#fff';
    util.rr(g, b * 0.85, b * 0.75, s * 0.42, s * 0.13, s * 0.065); g.fill();
    g.globalAlpha = 0.28;
    g.beginPath(); g.arc(s * 0.74, s * 0.28, s * 0.05, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
    return cv;
  }
  function drawGem(g, cx, cy, s, t) {
    const w = s * 0.34, h = s * 0.36;
    g.save(); g.translate(cx, cy + Math.sin(t * 3 + cx) * s * 0.02);
    g.beginPath();
    g.moveTo(-w, -h * 0.3); g.lineTo(-w * 0.55, -h * 0.75); g.lineTo(w * 0.55, -h * 0.75); g.lineTo(w, -h * 0.3); g.lineTo(0, h);
    g.closePath();
    const gr = g.createLinearGradient(0, -h, 0, h);
    gr.addColorStop(0, '#e9fdff'); gr.addColorStop(0.45, '#5fe3ff'); gr.addColorStop(1, '#1d7fd8');
    g.fillStyle = gr; g.fill();
    g.lineWidth = Math.max(1, s * 0.035); g.strokeStyle = '#0d4f9c'; g.stroke();
    g.beginPath(); g.moveTo(-w, -h * 0.3); g.lineTo(w, -h * 0.3);
    g.moveTo(-w * 0.55, -h * 0.75); g.lineTo(-w * 0.25, -h * 0.3); g.lineTo(0, h);
    g.moveTo(w * 0.55, -h * 0.75); g.lineTo(w * 0.25, -h * 0.3); g.lineTo(0, h);
    g.lineWidth = Math.max(0.8, s * 0.02); g.strokeStyle = 'rgba(13,79,156,0.55)'; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.beginPath(); g.moveTo(-w * 0.5, -h * 0.55); g.lineTo(-w * 0.3, -h * 0.68); g.lineTo(-w * 0.2, -h * 0.4); g.closePath(); g.fill();
    g.restore();
  }

  MG.register({
    id: 'blocks', name: '方塊消除', icon: '🧱', color: '#5560c8',
    endless: true,
    _logic: LOGIC,
    create(api) {
      const U = api.util;
      const lvData = api.endless
        ? { type: 'endless', target: 0, gemsNeed: 0, board: new Array(N * N).fill(0), gems: new Array(N * N).fill(0), nasty: 0.6 }
        : genLevel(api.level, api.rng, api.diff);
      const best = api.best || 0;
      const board = lvData.board.slice();
      const gems = lvData.gems.slice();
      let gemsLeft = lvData.gemsNeed;
      let score = 0, shownScore = 0, combo = 0, sinceClear = 0;
      let pieces = [];
      let drag = null;
      let time = 0, endT = -1, endWin = false, ended = false;
      let shake = 0;
      const pop = new Float32Array(N * N);
      const clearing = [];
      const parts = [];
      const texts = [];
      let L = {};
      let sprites = [];
      let bgCache = null;
      let hintT = api.level === 1 && api.diff === 0 && !api.endless ? 0 : -1;

      function cellCol(i) { return COLORS[(board[i] - 1 + COLORS.length) % COLORS.length]; }

      function layout() {
        const W = api.W, H = api.H;
        const hdr = U.clamp(H * 0.14, 70, 110);
        const avail = H - hdr - 14;
        let bs = Math.min(W - 28, avail / 1.42, 560);
        bs = Math.floor(bs / N) * N;
        const cs = bs / N;
        const bx = Math.round((W - bs) / 2), by = Math.round(hdr + Math.max(4, (avail - bs * 1.42) * 0.3));
        const trayY = by + bs + (H - (by + bs)) / 2;
        const trayH = Math.min(H - (by + bs) - 8, bs * 0.42);
        const ts = Math.min(cs * 0.62, (W / 3 - 16) / 5, trayH / 5.2);
        L = { W, H, hdr, bs, cs, bx, by, trayY, trayH, ts };
        sprites = COLORS.map((c) => blockSprite(U, c, Math.max(8, Math.round(cs))));
        buildBg();
      }
      function buildBg() {
        const d = DPR();
        bgCache = makeCanvas(L.W * d, L.H * d);
        const g = bgCache.getContext('2d');
        g.scale(d, d);
        const gr = g.createLinearGradient(0, 0, 0, L.H);
        gr.addColorStop(0, '#4a5bd6'); gr.addColorStop(0.55, '#3241a8'); gr.addColorStop(1, '#232d7c');
        g.fillStyle = gr; g.fillRect(0, 0, L.W, L.H);
        g.globalAlpha = 0.07; g.fillStyle = '#fff';
        for (let k = -2; k < 8; k++) {
          g.beginPath();
          const x = k * L.W * 0.22;
          g.moveTo(x, 0); g.lineTo(x + L.W * 0.1, 0); g.lineTo(x + L.W * 0.45, L.H); g.lineTo(x + L.W * 0.35, L.H); g.closePath(); g.fill();
        }
        g.globalAlpha = 1;
        const p = 8;
        g.fillStyle = 'rgba(10,14,50,0.35)';
        U.rr(g, L.bx - p, L.by - p + 5, L.bs + p * 2, L.bs + p * 2, 16); g.fill();
        const pg = g.createLinearGradient(0, L.by - p, 0, L.by + L.bs + p);
        pg.addColorStop(0, '#1f2766'); pg.addColorStop(1, '#161c4e');
        g.fillStyle = pg; U.rr(g, L.bx - p, L.by - p, L.bs + p * 2, L.bs + p * 2, 16); g.fill();
        g.strokeStyle = 'rgba(140,160,255,0.35)'; g.lineWidth = 2; g.stroke();
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          g.fillStyle = (r + c) % 2 ? '#262f78' : '#2a3482';
          U.rr(g, L.bx + c * L.cs + 1.5, L.by + r * L.cs + 1.5, L.cs - 3, L.cs - 3, L.cs * 0.14); g.fill();
        }
        g.fillStyle = 'rgba(10,14,50,0.25)';
        U.rr(g, 10, L.trayY - L.trayH / 2, L.W - 20, L.trayH, 18); g.fill();
      }
      layout();

      function slotX(i) { return L.W * (i * 2 + 1) / 6; }
      function newPieces() {
        const t = genTriplet(board, api.rng, api.endless ? 0.6 + score / 3000 : lvData.nasty);
        pieces = t.map((si, i) => ({
          s: SHAPES[si], col: Math.floor(api.rng() * COLORS.length), used: false,
          appear: -i * 0.07, fits: true,
        }));
        refreshFits();
      }
      function refreshFits() { pieces.forEach((p) => { if (!p.used) p.fits = anyFit(board, p.s); }); }
      newPieces();

      function setInfo() {
        if (api.endless) api.info('無盡模式：方塊放不下就結束，撐越久分數越高');
        else if (api.level === 1 && api.diff === 0) api.info('拖曳方塊到棋盤，填滿整行或整列即可消除');
        else if (lvData.type === 'gems') api.info('消除寶石所在的行列，收集全部 ' + lvData.gemsNeed + ' 顆寶石');
        else api.info('目標 ' + lvData.target + ' 分');
      }
      setInfo();

      function burst(x, y, color, n, spd) {
        for (let k = 0; k < n; k++) {
          if (parts.length > 420) parts.shift();
          const a = Math.random() * Math.PI * 2, v = (0.3 + Math.random()) * spd;
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spd * 0.4, life: 0.6 + Math.random() * 0.5, t: 0, c: color, s: 3 + Math.random() * 5, rot: Math.random() * 6 });
        }
      }
      function addText(str, x, y, size, color) { texts.push({ str, x, y, size, color, t: 0 }); }

      function dragGeom() {
        if (!drag) return null;
        const p = pieces[drag.i];
        const k = U.easeOutCubic(Math.min(1, drag.t / 0.12));
        const cs = U.lerp(L.ts, L.cs, k);
        const pw = p.s.w * cs, ph = p.s.h * cs;
        const lift = U.lerp(0, L.cs * 1.6 + ph * 0.5, k);
        const cx = U.lerp(drag.sx, drag.x, k), cy = U.lerp(drag.sy, drag.y - lift, k);
        const tlx = cx - pw / 2, tly = cy - ph / 2;
        const col = Math.round((tlx - L.bx) / L.cs), row = Math.round((tly - L.by) / L.cs);
        const ok = k > 0.5 && fits(board, p.s, row, col);
        return { cs, tlx, tly, row, col, ok };
      }
      function previewLines(gm) {
        if (!gm || !gm.ok) return null;
        const p = pieces[drag.i];
        const tmp = board.slice();
        for (const q of p.s.cells) tmp[(gm.row + q[0]) * N + gm.col + q[1]] = 1;
        const fl = fullLines(tmp);
        if (!fl.rows.length && !fl.cols.length) return null;
        const set = new Uint8Array(N * N);
        fl.rows.forEach((r) => { for (let c = 0; c < N; c++) set[r * N + c] = 1; });
        fl.cols.forEach((c) => { for (let r = 0; r < N; r++) set[r * N + c] = 1; });
        return set;
      }

      function place(i, row, col) {
        const p = pieces[i];
        p.used = true;
        api.sfx('drop');
        let cx = 0, cy = 0;
        for (const q of p.s.cells) {
          const idx = (row + q[0]) * N + col + q[1];
          pop[idx] = 0.001;
          cx += L.bx + (col + q[1] + 0.5) * L.cs; cy += L.by + (row + q[0] + 0.5) * L.cs;
        }
        cx /= p.s.n; cy /= p.s.n;
        const before = board.slice();
        const gemBefore = gems.slice();
        const res = placeAndClear(board, p.s, row, col, p.col + 1, gems);
        score += p.s.n;
        if (res.lines) {
          combo++; sinceClear = 0;
          const pts = clearPoints(res.lines, combo);
          score += pts;
          res.cleared.forEach((idx) => {
            const r = Math.floor(idx / N), c = idx % N;
            const x = L.bx + (c + 0.5) * L.cs, y = L.by + (r + 0.5) * L.cs;
            const dist = Math.hypot(x - cx, y - cy) / L.cs;
            const colr = before[idx] ? COLORS[before[idx] - 1] : COLORS[p.col];
            clearing.push({ x, y, col: before[idx] ? before[idx] - 1 : p.col, colr, t: 0, delay: dist * 0.035, gem: gemBefore[idx] ? 1 : 0, burst: false });
          });
          if (res.gemsGot) { gemsLeft = Math.max(0, gemsLeft - res.gemsGot); }
          let empty = true; for (let k = 0; k < N * N; k++) if (board[k]) { empty = false; break; }
          if (empty) { score += 300; addText('全部清空！+300', L.W / 2, L.by + L.bs * 0.62, 30, '#7dfcff'); }
          const words = ['', '', 'Great!', 'Excellent!', 'Amazing!', 'Unbelievable!'];
          if (res.lines >= 2) addText(words[Math.min(5, res.lines)], L.W / 2, L.by + L.bs * 0.38, 36, '#ffe14d');
          if (combo >= 2) addText('Combo x' + combo, L.W / 2, L.by + L.bs * 0.5, 30, '#ff8ad8');
          addText('+' + pts, cx, cy, 24, '#fff');
          shake = Math.min(0.35, 0.08 * res.lines + (combo >= 3 ? 0.08 : 0));
          api.sfx(res.lines >= 2 || combo >= 2 ? 'good' : 'pop');
        } else {
          sinceClear++;
          if (sinceClear >= 3) combo = 0;
        }
        api.score(score);
        if (pieces.every((q) => q.used)) newPieces(); else refreshFits();
        checkEnd();
      }
      function checkEnd() {
        if (endT >= 0) return;
        const won = lvData.type === 'endless' ? false : lvData.type === 'gems' ? gemsLeft <= 0 : score >= lvData.target;
        if (won) {
          endT = time + 0.9; endWin = true;
          for (let k = 0; k < 60; k++) burst(L.W / 2 + (Math.random() - 0.5) * L.bs, L.by + Math.random() * L.bs * 0.5, COLORS[k % COLORS.length], 1, 420);
          return;
        }
        const left = pieces.filter((q) => !q.used);
        if (left.length && !left.some((q) => q.fits)) { endT = time + 1.1; endWin = false; api.sfx('bad'); shake = 0.25; }
      }

      function trayPieceRect(i) {
        const p = pieces[i];
        const x = slotX(i), y = L.trayY;
        return { x, y, w: p.s.w * L.ts, h: p.s.h * L.ts };
      }

      function update(dt) {
        time += dt;
        if (shownScore < score) shownScore = Math.min(score, shownScore + Math.max(1, (score - shownScore) * dt * 8));
        for (let i = 0; i < N * N; i++) if (pop[i] > 0) { pop[i] += dt; if (pop[i] > 0.3) pop[i] = 0; }
        for (let i = clearing.length - 1; i >= 0; i--) {
          const c = clearing[i]; c.t += dt;
          if (!c.burst && c.t > c.delay + 0.12) { c.burst = true; burst(c.x, c.y, c.colr, 5, 260); }
          if (c.t > c.delay + 0.42) clearing.splice(i, 1);
        }
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i]; p.t += dt;
          p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 8;
          if (p.t > p.life) parts.splice(i, 1);
        }
        for (let i = texts.length - 1; i >= 0; i--) { texts[i].t += dt; if (texts[i].t > 1.1) texts.splice(i, 1); }
        pieces.forEach((p) => { p.appear += dt; });
        if (drag) drag.t += dt;
        if (shake > 0) shake = Math.max(0, shake - dt);
        if (hintT >= 0) hintT += dt;
        if (endT >= 0 && !ended && time >= endT) {
          ended = true;
          if (endWin) api.win(lvData.type === 'gems' ? '寶石全部收集完成！' : '得分 ' + score + '！');
          else api.lose(api.endless ? '沒有空間了' : '沒有空間放方塊了');
        }
      }

      function drawPiece(g, p, tlx, tly, cs, alpha) {
        g.globalAlpha = alpha;
        for (const q of p.s.cells) g.drawImage(sprites[p.col], tlx + q[1] * cs, tly + q[0] * cs, cs, cs);
        g.globalAlpha = 1;
      }

      function draw(g) {
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake * 26, (Math.random() - 0.5) * shake * 26);
        g.drawImage(bgCache, 0, 0, L.W, L.H);
        // header
        const hc = L.W / 2;
        U.text(g, String(Math.floor(shownScore)), hc, L.hdr * 0.38, Math.round(L.hdr * 0.38), '#fff', 'center', 900);
        const bw = Math.min(L.W * 0.62, 320), bh = 14, bx0 = hc - bw / 2, by0 = L.hdr * 0.74;
        let prog, label;
        if (lvData.type === 'endless') {
          const rec = Math.floor(shownScore) > best && best > 0;
          prog = best > 0 ? Math.min(1, shownScore / best) : 0;
          label = rec ? '新紀錄！' : '最高 ' + best;
        } else if (lvData.type === 'gems') { prog = 1 - gemsLeft / Math.max(1, lvData.gemsNeed); label = (lvData.gemsNeed - gemsLeft) + ' / ' + lvData.gemsNeed; }
        else { prog = Math.min(1, shownScore / lvData.target); label = '目標 ' + lvData.target; }
        g.fillStyle = 'rgba(10,14,50,0.45)'; U.rr(g, bx0, by0 - bh / 2, bw, bh, bh / 2); g.fill();
        if (prog > 0) {
          const pg = g.createLinearGradient(bx0, 0, bx0 + bw, 0);
          pg.addColorStop(0, '#ffb422'); pg.addColorStop(1, '#ffe66b');
          g.fillStyle = pg; U.rr(g, bx0, by0 - bh / 2, Math.max(bh, bw * prog), bh, bh / 2); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.35)'; U.rr(g, bx0 + 3, by0 - bh / 2 + 2, Math.max(bh, bw * prog) - 6, 4, 2); g.fill();
        }
        if (lvData.type === 'gems') drawGem(g, bx0 - 16, by0, 28, time);
        U.text(g, label, hc, by0 + 16, 12, '#ffe9a8', 'center', 800);

        // board blocks
        const gm = dragGeom();
        const hl = previewLines(gm);
        const cs = L.cs;
        for (let i = 0; i < N * N; i++) {
          if (!board[i]) continue;
          const r = Math.floor(i / N), c = i % N;
          let x = L.bx + c * cs, y = L.by + r * cs, s = cs;
          if (pop[i] > 0) { const k = pop[i] / 0.3; const sc = 1 + Math.sin(k * Math.PI) * 0.14; x -= (sc - 1) * cs / 2; y -= (sc - 1) * cs / 2; s = cs * sc; }
          const spr = hl && hl[i] ? sprites[pieces[drag.i].col] : sprites[(board[i] - 1) % COLORS.length];
          g.drawImage(spr, x, y, s, s);
          if (gems[i]) drawGem(g, x + s / 2, y + s / 2, s, time);
        }
        // ghost + line highlight
        if (gm && gm.ok) {
          const p = pieces[drag.i];
          drawPiece(g, p, L.bx + gm.col * cs, L.by + gm.row * cs, cs, 0.38);
          if (hl) {
            g.globalAlpha = 0.25 + 0.15 * Math.sin(time * 12);
            g.fillStyle = '#fff';
            for (let i = 0; i < N * N; i++) if (hl[i]) { const r = Math.floor(i / N), c = i % N; U.rr(g, L.bx + c * cs + 2, L.by + r * cs + 2, cs - 4, cs - 4, cs * 0.15); g.fill(); }
            g.globalAlpha = 1;
          }
        }
        // clearing cells
        for (const c of clearing) {
          const t = c.t - c.delay;
          if (t < 0) { g.drawImage(sprites[c.col], c.x - cs / 2, c.y - cs / 2, cs, cs); continue; }
          const k = Math.min(1, t / 0.42);
          const sc = k < 0.3 ? 1 + k * 0.5 : Math.max(0, 1.15 * (1 - (k - 0.3) / 0.7));
          g.globalAlpha = 1 - k * 0.5;
          g.drawImage(sprites[c.col], c.x - cs * sc / 2, c.y - cs * sc / 2, cs * sc, cs * sc);
          if (k < 0.45) { g.globalAlpha = (0.45 - k) * 2; g.fillStyle = '#fff'; U.rr(g, c.x - cs * sc / 2, c.y - cs * sc / 2, cs * sc, cs * sc, cs * 0.16); g.fill(); }
          g.globalAlpha = 1;
          if (c.gem) {
            const gx = U.lerp(c.x, L.W / 2 - Math.min(L.W * 0.31, 160) - 16, U.easeOutCubic(k)), gy = U.lerp(c.y, L.hdr * 0.74, U.easeOutCubic(k));
            drawGem(g, gx, gy, cs * (1 - k * 0.3), time);
          }
        }
        // tray pieces
        for (let i = 0; i < pieces.length; i++) {
          const p = pieces[i];
          if (p.used || (drag && drag.i === i)) continue;
          const tr = trayPieceRect(i);
          const a = U.clamp(p.appear / 0.35, 0, 1);
          const off = (1 - U.easeOutBack(a)) * L.W * 0.5;
          drawPiece(g, p, tr.x - tr.w / 2 + off, tr.y - tr.h / 2, L.ts, p.fits ? 1 : 0.32);
        }
        if (gm) {
          const p = pieces[drag.i];
          g.fillStyle = 'rgba(0,0,0,0.18)';
          for (const q of p.s.cells) { U.rr(g, gm.tlx + q[1] * gm.cs + 4, gm.tly + q[0] * gm.cs + 8, gm.cs, gm.cs, gm.cs * 0.16); g.fill(); }
          drawPiece(g, p, gm.tlx, gm.tly, gm.cs, 1);
        }
        // particles
        for (const p of parts) {
          const a = 1 - p.t / p.life;
          g.globalAlpha = Math.max(0, a);
          g.fillStyle = p.c;
          g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
          g.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
          g.restore();
        }
        g.globalAlpha = 1;
        // floating texts
        for (const t of texts) {
          const k = t.t / 1.1;
          const sc = t.t < 0.2 ? U.easeOutBack(t.t / 0.2) : 1;
          g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
          const y = t.y - k * 40;
          g.save(); g.translate(t.x, y); g.scale(sc, sc);
          g.lineWidth = 6; g.strokeStyle = 'rgba(30,20,80,0.75)'; g.lineJoin = 'round';
          g.font = '900 ' + t.size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.strokeText(t.str, 0, 0);
          U.text(g, t.str, 0, 0, t.size, t.color, 'center', 900);
          g.restore();
        }
        g.globalAlpha = 1;
        // level 1 hint: pulsing finger under first piece
        if (hintT >= 0 && hintT < 6 && !drag && score === 0) {
          const k = (hintT % 1.6) / 1.6;
          const x = slotX(1), y = U.lerp(L.trayY, L.by + L.bs * 0.6, U.easeOutCubic(Math.min(1, k * 1.3)));
          g.globalAlpha = Math.sin(k * Math.PI);
          g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 14, 0, Math.PI * 2); g.fill();
          g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 22, 0, Math.PI * 2); g.stroke();
          g.globalAlpha = 1;
        }
        if (endT >= 0 && !endWin) {
          g.fillStyle = 'rgba(10,10,40,0.35)'; g.fillRect(0, 0, L.W, L.H);
          U.text(g, '沒有空間了！', L.W / 2, L.by + L.bs / 2, 34, '#ffd2d8', 'center', 900);
        }
        g.restore();
      }

      function down(x, y) {
        if (api.ended || endT >= 0) return;
        if (y < L.trayY - L.trayH / 2 - 10) return;
        const i = U.clamp(Math.floor(x / (L.W / 3)), 0, 2);
        const p = pieces[i];
        if (!p || p.used) return;
        api.sfx('tap');
        hintT = -1;
        const tr = trayPieceRect(i);
        drag = { i, x, y, sx: tr.x, sy: tr.y, t: 0 };
      }
      function move(x, y) { if (drag) { drag.x = x; drag.y = y; } }
      function up(x, y) {
        if (!drag) return;
        drag.x = x; drag.y = y; drag.t = Math.max(drag.t, 0.2);
        const gm = dragGeom();
        const i = drag.i;
        drag = null;
        if (api.ended || endT >= 0) return;
        if (gm && gm.ok) place(i, gm.row, gm.col);
        else {
          pieces[i].appear = 0.22;
          if (y < L.by + L.bs + L.cs) { api.sfx('bad'); shake = 0.12; }
        }
      }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        destroy() { parts.length = 0; },
      };
    },
  });
})();
