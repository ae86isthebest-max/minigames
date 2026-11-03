// 拔針救人 — Pull the Pin: particle balls in glass tubes held by golden pins.
(function () {
  'use strict';

  const WW = 300, WH = 540;
  const RB = 5.5, RR = 8, WR = 4, PR = 3.6;
  const T_C = 0, T_G = 1, T_K = 2, T_W = 3, T_S = 4, T_D = 5, T_R = 6;
  const CANDY = ['#ff4f7b', '#ffb21e', '#4fd36b', '#b45cff', '#ff7a2f', '#ff5fd2'];
  const HSTEP = 1 / 240;
  const GRAV = 1500 * HSTEP * HSTEP;

  // ---------- level templates (hand designed) ----------
  // lay A: one tube. B: two tubes. C: two tubes -> funnel -> centre tube. R: rescue rooms.
  // cols: chambers top->bottom; each chamber = type letter + count (c colour, g grey, k lava,
  // w water, r rock, e empty). Every chamber has a pin as its floor. Pins are numbered column by
  // column, top to bottom (rescue: door pin last). order = intended solution, wrong = orders that fail.
  const TPL = [
    { lay: 'A', cols: [['c36']], order: [0], need: 0.9, tutorial: true },
    { lay: 'B', cols: [['c30'], ['g30']], order: [0, 1], need: 0.85, tutorial: true },
    { lay: 'A', cols: [['c24', 'g30']], order: [0, 1], need: 0.85 },
    { lay: 'B', cols: [['k16', 'g26'], ['c28']], order: [1, 2], wrong: [[0, 1, 2]], need: 0.8 },
    { lay: 'B', cols: [['c22', 'g26'], ['k22']], order: [0, 1], wrong: [[2, 0, 1]], need: 0.8 },
    { lay: 'B', cols: [['c18', 'w16', 'k14'], ['g26']], order: [1, 2, 3, 0], wrong: [[2, 3, 1, 0], [3, 2, 1, 0]], need: 0.8 },
    { lay: 'C', cols: [['c26'], ['k20'], ['g30']], order: [0, 2], wrong: [[1, 0, 2]], need: 0.8 },
    { lay: 'R', cols: [['k18'], ['r12']], order: [1, 2], wrong: [[0], [2]] },
    { lay: 'C', cols: [['w22'], ['c30'], ['k16']], order: [0, 2, 1], wrong: [[1, 0, 2]], need: 0.8 },
    { lay: 'B', cols: [['g24', 'c24'], ['k14', 'g26']], order: [0, 1, 3], wrong: [[2, 0, 1, 3]], need: 0.8 },
    { lay: 'R', cols: [['k16'], ['r10', 'w14']], order: [2, 1, 3], wrong: [[0], [3], [2, 3]] },
    { lay: 'C', cols: [['c24', 'k16'], ['w20'], ['e']], order: [2, 1, 3, 0], wrong: [[1, 3, 0]], need: 0.8 },
    { lay: 'A', cols: [['w16', 'k14', 'c20', 'g24']], order: [0, 1, 2, 3], wrong: [[1, 0, 2, 3]], need: 0.8 },
    { lay: 'R', cols: [['k18'], ['w12', 'k16']], order: [2, 1, 3], wrong: [[2, 3], [0], [3]] },
    { lay: 'C', cols: [['k16'], ['g24'], ['c26']], order: [2, 1], wrong: [[0, 2, 1]], need: 0.8 },
    { lay: 'B', cols: [['w18', 'k18', 'c24'], ['g30']], order: [0, 1, 2, 3], wrong: [[1, 0, 2, 3]], need: 0.8 },
    { lay: 'R', cols: [['w14', 'k16'], ['r12']], order: [2, 3], wrong: [[1], [3]] },
    { lay: 'C', cols: [['k18'], ['c26'], ['w22']], order: [0, 2, 1], wrong: [[1, 0, 2]], need: 0.8 },
    { lay: 'C', cols: [['w20'], ['k14', 'c22'], ['g24']], order: [2, 3], wrong: [[1, 2, 3]], need: 0.8 },
    { lay: 'A', cols: [['c22', 'k14', 'w16']], order: [1, 2, 0], wrong: [[0, 1, 2], [2, 0, 1]], need: 0.8 },
    { lay: 'R', cols: [['w14', 'k16'], ['w12', 'k16']], order: [3, 2, 4], wrong: [[3, 4], [1]] },
    { lay: 'C', cols: [['c20', 'g20'], ['k14'], ['w18']], order: [2, 3, 0, 1], wrong: [[0, 1, 2, 3]], need: 0.8 },
    { lay: 'C', cols: [['g26'], ['c20', 'k12'], ['w18']], order: [2, 3, 0, 1], wrong: [[1, 2, 3, 0]], need: 0.8 },
    { lay: 'C', cols: [['c16', 'g20'], ['w20'], ['k14']], order: [2, 3, 0, 1], wrong: [[0, 1, 2, 3]], need: 0.8 },
  ];

  const TYPE_OF = { c: T_C, g: T_G, k: T_K, w: T_W, r: T_R, e: -1 };

  function chamberH(code) {
    const t = code[0], n = parseInt(code.slice(1), 10) || 0;
    if (t === 'e') return 46;
    const rock = t === 'r';
    const r = rock ? RR : RB, per = rock ? 5 : 6.5;
    const rows = Math.ceil(n / per);
    return rows * r * 2 * 0.88 + 2 * r + 12;
  }

  // which template + variation a level uses
  // 普通: trickier templates from level 1; 困難: only the hardest ones, decoy lava pins, higher targets
  const NORMAL_SEQ = [5, 8, 6, 11, 9, 19, 12, 14, 18, 13, 21, 22];
  const NORMAL_POOL = [5, 6, 8, 9, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 22, 23];
  const HARD_POOL = [11, 12, 14, 17, 19, 20, 21, 22, 23, 5, 8, 13];
  function levelPlan(level, rng, diff) {
    let idx, mirror = false, scale = 1, decoy = false, needAdd = 0;
    if (diff === 1) {
      idx = level <= NORMAL_SEQ.length ? NORMAL_SEQ[level - 1] : NORMAL_POOL[Math.floor(rng() * NORMAL_POOL.length)];
      mirror = level > 1 && rng() < 0.5;
      scale = 1 + Math.floor(rng() * 3) * 0.08;
      decoy = level > 2 && rng() < 0.5;
      needAdd = 0.05;
    } else if (diff === 2) {
      idx = HARD_POOL[Math.floor(rng() * HARD_POOL.length)];
      mirror = rng() < 0.5;
      scale = 1.08 + Math.floor(rng() * 3) * 0.08;
      decoy = true;
      needAdd = 0.08;
    } else if (level <= TPL.length) idx = level - 1;
    else {
      idx = 6 + Math.floor(rng() * (TPL.length - 6));
      mirror = rng() < 0.5;
      scale = 1 + Math.floor(rng() * 4) * 0.08;
    }
    const colors = CANDY.slice();
    for (let i = colors.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = colors[i]; colors[i] = colors[j]; colors[j] = t; }
    return { idx, mirror, scale, colors, decoy, needAdd };
  }

  // add a decoy lava chamber (with its own pin) on top of a tube whose top chamber holds colour/grey
  function withDecoy(tpl) {
    if (tpl.lay === 'R') return null;
    const tops = tpl.lay === 'C' ? 2 : tpl.cols.length;
    let cc = -1;
    for (let c = 0; c < tops; c++) { const t = tpl.cols[c][0][0]; if (t === 'c' || t === 'g') { cc = c; break; } }
    if (cc < 0) return null;
    let start = 0;
    for (let c = 0; c < cc; c++) start += tpl.cols[c].length;
    const map = (q) => (q >= start ? q + 1 : q);
    const cols = tpl.cols.map((col, c) => (c === cc ? ['k10'].concat(col) : col.slice()));
    const wrong = (tpl.wrong || []).map((w) => w.map(map));
    const order = tpl.order.map(map);
    wrong.push([start].concat(order));
    return { lay: tpl.lay, cols, order, wrong, need: tpl.need, decoyPin: start };
  }

  // build geometry for a template; returns null if it does not fit
  function buildLayout(tpl, scale, mirror, colors, rng) {
    const L = { walls: [], pins: [], fills: [], glass: [], kind: tpl.lay === 'R' ? 'rescue' : 'cup', cup: null, person: null, monster: null };
    const colDefs = [];
    if (tpl.lay === 'A') colDefs.push({ x1: 105, x2: 195, bot: 385, side: 'R', wallEnd: 407, cap: true, minTop: 14 });
    else if (tpl.lay === 'B') {
      colDefs.push({ x1: 40, x2: 130, bot: 385, side: 'L', wallEnd: 407, cap: true, minTop: 14 });
      colDefs.push({ x1: 170, x2: 260, bot: 385, side: 'R', wallEnd: 407, cap: true, minTop: 14 });
    } else if (tpl.lay === 'C') {
      colDefs.push({ x1: 40, x2: 130, bot: 205, side: 'L', wallEnd: 205, cap: true, minTop: 14 });
      colDefs.push({ x1: 170, x2: 260, bot: 205, side: 'R', wallEnd: 205, cap: true, minTop: 14 });
      colDefs.push({ x1: 105, x2: 195, bot: 398, side: 'R', wallEnd: 420, cap: false, minTop: 280, top: 268 });
    } else {
      colDefs.push({ x1: 40, x2: 130, bot: 300, side: 'L', wallEnd: 322, cap: true, minTop: 14 });
      colDefs.push({ x1: 170, x2: 260, bot: 300, side: 'R', wallEnd: 322, cap: true, minTop: 14 });
    }
    let colorI = 0;
    let rocks = 0;
    for (let c = 0; c < colDefs.length; c++) {
      const d = colDefs[c], chs = tpl.cols[c] || [];
      const codes = chs.map((s) => {
        const t = s[0]; let n = parseInt(s.slice(1), 10) || 0;
        if (t !== 'e' && t !== 'r') n = Math.round(n * scale);
        return t + n;
      });
      const hs = codes.map(chamberH);
      const ys = new Array(codes.length);
      let y = d.bot;
      for (let k = codes.length - 1; k >= 0; k--) { ys[k] = y; y -= hs[k]; }
      const top = d.cap ? y - 4 : d.top;
      if (y < d.minTop) return null;
      L.walls.push([d.x1, top, d.x1, d.wallEnd], [d.x2, top, d.x2, d.wallEnd]);
      if (d.cap) L.walls.push([d.x1, top, d.x2, top]);
      L.glass.push([d.x1, top, d.x2, d.wallEnd]);
      for (let k = 0; k < codes.length; k++) {
        const py = ys[k];
        if (d.side === 'R') L.pins.push({ ax: d.x1 - 3, ay: py, bx: d.x2 + 17, by: py });
        else L.pins.push({ ax: d.x2 + 3, ay: py, bx: d.x1 - 17, by: py });
        const t = codes[k][0], n = parseInt(codes[k].slice(1), 10) || 0;
        if (t === 'e' || n <= 0) continue;
        const type = TYPE_OF[t];
        const col = type === T_C ? colors[colorI++ % colors.length] : null;
        if (type === T_R) rocks += n;
        L.fills.push({ type, n, col, x1: d.x1 + WR, x2: d.x2 - WR, yb: py - PR, yt: py - hs[k] });
      }
    }
    if (tpl.lay === 'C') {
      L.walls.push([40, 205, 105, 268], [260, 205, 195, 268]);
      L.glass.push([40, 205, 260, 268, 1]);
    }
    if (L.kind === 'cup') {
      L.walls.push([26, 436, 52, 528], [52, 528, 248, 528], [248, 528, 274, 436]);
      L.cup = { y0: 436, y1: 528, xt0: 26, xt1: 274, xb0: 52, xb1: 248 };
    } else {
      L.walls.push([24, 482, 276, 482], [24, 322, 24, 482], [276, 322, 276, 482],
        [24, 322, 40, 322], [130, 322, 170, 322], [260, 322, 276, 322], [150, 322, 150, 400]);
      L.pins.push({ ax: 150, ay: 480, bx: 150, by: 392, door: true });
      L.person = { x: 85, y: 456, r: 22, alive: true };
      L.monster = { x: 215, y: 454, r: 24, alive: true, hp: Math.max(3, Math.round(rocks * 0.4)), hits: 0 };
    }
    if (mirror) {
      const mx = (x) => WW - x;
      L.walls.forEach((w) => { w[0] = mx(w[0]); w[2] = mx(w[2]); });
      L.glass.forEach((gq) => { const a = mx(gq[0]), b = mx(gq[2]); gq[0] = Math.min(a, b); gq[2] = Math.max(a, b); });
      L.pins.forEach((p) => { p.ax = mx(p.ax); p.bx = mx(p.bx); });
      L.fills.forEach((f) => { const a = mx(f.x1), b = mx(f.x2); f.x1 = Math.min(a, b); f.x2 = Math.max(a, b); });
      if (L.person) { L.person.x = mx(L.person.x); L.monster.x = mx(L.monster.x); }
      L.mirror = true;
    }
    return L;
  }

  function makeLevel(level, rng, diff) {
    const plan = levelPlan(level, rng, diff || 0);
    let tpl = TPL[plan.idx];
    let L = null;
    if (plan.decoy) {
      const d = withDecoy(tpl);
      if (d) {
        L = buildLayout(d, plan.scale, plan.mirror, plan.colors, rng) || buildLayout(d, 1, plan.mirror, plan.colors, rng);
        if (L) tpl = d;
      }
    }
    if (!L) L = buildLayout(tpl, plan.scale, plan.mirror, plan.colors, rng);
    if (!L) L = buildLayout(tpl, 1, plan.mirror, plan.colors, rng);
    L.tplIndex = plan.idx; L.tpl = tpl; L.need = tpl.need ? Math.min(0.95, tpl.need + plan.needAdd) : 0;
    return L;
  }

  // ---------- physics world ----------
  function World(L, rng) {
    let n = 0;
    L.fills.forEach((f) => { n += f.n; });
    const N = n;
    const X = new Float64Array(N), Y = new Float64Array(N), PX = new Float64Array(N), PY = new Float64Array(N);
    const RAD = new Float64Array(N), TY = new Int8Array(N), CI = new Int16Array(N), ALIVE = new Uint8Array(N), HIT = new Uint8Array(N);
    const colorList = [];
    let k = 0;
    L.fills.forEach((f) => {
      const r = f.type === T_R ? RR : RB;
      let ci = -1;
      if (f.col) { ci = colorList.indexOf(f.col); if (ci < 0) { colorList.push(f.col); ci = colorList.length - 1; } }
      const dx = r * 2.02, dy = r * 2 * 0.88;
      let row = 0, placed = 0;
      while (placed < f.n && row < 60) {
        const off = (row & 1) ? r : 0;
        const y = f.yb - r - 0.6 - row * dy;
        for (let x = f.x1 + r + 0.6 + off; x <= f.x2 - r - 0.6 && placed < f.n; x += dx) {
          X[k] = x + (rng() - 0.5) * 0.6; Y[k] = y; PX[k] = X[k]; PY[k] = Y[k];
          RAD[k] = r; TY[k] = f.type; CI[k] = ci; ALIVE[k] = 1; k++; placed++;
        }
        row++;
      }
    });
    const count = k;
    const pins = L.pins.map((p) => {
      const dx = p.bx - p.ax, dy = p.by - p.ay, len = Math.hypot(dx, dy);
      return { ax: p.ax, ay: p.ay, bx: p.bx, by: p.by, ux: dx / len, uy: dy / len, len, t: 0, pulled: false, gone: false, off: 0, door: !!p.door, shake: 0 };
    });
    const walls = L.walls;
    const CELL = 16, GX0 = -40, GY0 = -40, GW = 24, GH = 42;
    const head = new Int32Array(GW * GH), next = new Int32Array(Math.max(1, count));
    const ev = { recolor: 0, ruin: 0, steam: 0, hit: 0, lavaPerson: false, lavaMonster: false, lost: 0, fx: [] };

    function emit(kind, x, y, c) { if (ev.fx.length < 40) ev.fx.push(kind, x, y, c); }

    function contact(i, j) {
      const a = TY[i], b = TY[j];
      if (a === b) return;
      if ((a === T_C && b === T_G) || (a === T_G && b === T_C)) {
        const src = a === T_C ? i : j, dst = a === T_C ? j : i;
        TY[dst] = T_C; CI[dst] = CI[src]; ev.recolor++; if ((ev.recolor & 3) === 1) emit(1, X[dst], Y[dst], CI[dst]);
        return;
      }
      const bad = (t) => t === T_K || t === T_D;
      const good = (t) => t === T_C || t === T_G;
      if (bad(a) && good(b)) { TY[j] = T_D; ev.ruin++; if ((ev.ruin & 3) === 1) emit(2, X[j], Y[j], 0); return; }
      if (bad(b) && good(a)) { TY[i] = T_D; ev.ruin++; if ((ev.ruin & 3) === 1) emit(2, X[i], Y[i], 0); return; }
      if ((a === T_K && b === T_W) || (a === T_W && b === T_K)) { TY[i] = T_S; TY[j] = T_S; ev.steam++; if ((ev.steam & 1) === 1) emit(3, X[i], Y[i], 0); return; }
      if (a === T_K && b === T_S) { TY[i] = T_S; ev.steam++; if ((ev.steam & 7) === 1) emit(3, X[i], Y[i], 0); return; }
      if (b === T_K && a === T_S) { TY[j] = T_S; ev.steam++; if ((ev.steam & 7) === 1) emit(3, X[j], Y[j], 0); }
    }

    function segPush(i, ax, ay, bx, by, rad) {
      const x = X[i], y = Y[i], r = RAD[i] + rad;
      const minx = (ax < bx ? ax : bx) - r, maxx = (ax > bx ? ax : bx) + r;
      if (x < minx || x > maxx) return false;
      const miny = (ay < by ? ay : by) - r, maxy = (ay > by ? ay : by) + r;
      if (y < miny || y > maxy) return false;
      const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
      let t = l2 > 0 ? ((x - ax) * dx + (y - ay) * dy) / l2 : 0;
      if (t < 0) t = 0; else if (t > 1) t = 1;
      const cx = ax + t * dx, cy = ay + t * dy;
      let ex = x - cx, ey = y - cy;
      const d2 = ex * ex + ey * ey;
      if (d2 >= r * r) return false;
      let d = Math.sqrt(d2);
      if (d < 1e-6) { ex = -dy; ey = dx; d = Math.sqrt(ex * ex + ey * ey) || 1; if (ey > 0) { ex = -ex; ey = -ey; } }
      const nx = ex / d, ny = ey / d, pen = r - (d < 1e-6 ? 0 : d);
      X[i] += nx * pen; Y[i] += ny * pen;
      const vx = X[i] - PX[i], vy = Y[i] - PY[i];
      let vn = vx * nx + vy * ny;
      const tx = vx - vn * nx, ty = vy - vn * ny;
      if (vn < 0) vn = 0;
      PX[i] = X[i] - (tx * 0.95 + nx * vn * 0.2);
      PY[i] = Y[i] - (ty * 0.95 + ny * vn * 0.2);
      return true;
    }

    function substep() {
      for (let i = 0; i < count; i++) {
        if (!ALIVE[i]) continue;
        let vx = (X[i] - PX[i]) * 0.999, vy = (Y[i] - PY[i]) * 0.999;
        const sp = vx * vx + vy * vy;
        if (sp > 9) { const s = 3 / Math.sqrt(sp); vx *= s; vy *= s; }
        PX[i] = X[i]; PY[i] = Y[i];
        X[i] += vx; Y[i] += vy + GRAV;
        if (Y[i] > 600 || X[i] < -30 || X[i] > WW + 30) { ALIVE[i] = 0; ev.lost++; }
      }
      for (let it = 0; it < 2; it++) {
        head.fill(-1);
        for (let i = 0; i < count; i++) {
          if (!ALIVE[i]) continue;
          let gx = ((X[i] - GX0) / CELL) | 0, gy = ((Y[i] - GY0) / CELL) | 0;
          if (gx < 0) gx = 0; else if (gx >= GW) gx = GW - 1;
          if (gy < 0) gy = 0; else if (gy >= GH) gy = GH - 1;
          const c = gy * GW + gx; next[i] = head[c]; head[c] = i;
        }
        for (let i = 0; i < count; i++) {
          if (!ALIVE[i]) continue;
          let gx = ((X[i] - GX0) / CELL) | 0, gy = ((Y[i] - GY0) / CELL) | 0;
          if (gx < 0) gx = 0; else if (gx >= GW) gx = GW - 1;
          if (gy < 0) gy = 0; else if (gy >= GH) gy = GH - 1;
          for (let oy = -1; oy <= 1; oy++) {
            const yy = gy + oy; if (yy < 0 || yy >= GH) continue;
            for (let ox = -1; ox <= 1; ox++) {
              const xx = gx + ox; if (xx < 0 || xx >= GW) continue;
              let j = head[yy * GW + xx];
              while (j >= 0) {
                if (j > i) {
                  const dx = X[j] - X[i], dy = Y[j] - Y[i], rs = RAD[i] + RAD[j];
                  const d2 = dx * dx + dy * dy;
                  if (d2 < (rs + 0.4) * (rs + 0.4)) {
                    if (TY[i] !== TY[j]) contact(i, j);
                    if (d2 < rs * rs && d2 > 1e-9) {
                      const d = Math.sqrt(d2), pen = (rs - d) / d;
                      const mi = RAD[i] * RAD[i], mj = RAD[j] * RAD[j], wi = mj / (mi + mj), wj = mi / (mi + mj);
                      X[i] -= dx * pen * wi; Y[i] -= dy * pen * wi;
                      X[j] += dx * pen * wj; Y[j] += dy * pen * wj;
                    }
                  }
                }
                j = next[j];
              }
            }
          }
        }
        for (let i = 0; i < count; i++) {
          if (!ALIVE[i]) continue;
          for (let w = 0; w < walls.length; w++) { const q = walls[w]; segPush(i, q[0], q[1], q[2], q[3], WR); }
          for (let p = 0; p < pins.length; p++) {
            const q = pins[p]; if (q.gone) continue;
            segPush(i, q.ax + q.ux * q.off, q.ay + q.uy * q.off, q.bx + q.ux * q.off, q.by + q.uy * q.off, PR);
          }
          if (L.person && L.person.alive) {
            const e = L.person;
            if (segPush(i, e.x, e.y, e.x, e.y, e.r) || (Math.hypot(X[i] - e.x, Y[i] - e.y) < e.r + RAD[i] + 0.5)) {
              if (TY[i] === T_K) ev.lavaPerson = true;
            }
          }
          if (L.monster && L.monster.alive) {
            const e = L.monster;
            const touching = segPush(i, e.x, e.y, e.x, e.y, e.r) || (Math.hypot(X[i] - e.x, Y[i] - e.y) < e.r + RAD[i] + 0.5);
            if (touching) {
              if (TY[i] === T_K) ev.lavaMonster = true;
              else if ((TY[i] === T_R || TY[i] === T_S) && !HIT[i]) { HIT[i] = 1; ev.hit++; }
            }
          }
        }
      }
    }

    function maxSpeed() {
      let m = 0;
      for (let i = 0; i < count; i++) {
        if (!ALIVE[i]) continue;
        const vx = X[i] - PX[i], vy = Y[i] - PY[i], s = vx * vx + vy * vy;
        if (s > m) m = s;
      }
      return Math.sqrt(m) / HSTEP;
    }

    function inCup(i) {
      const c = L.cup; if (!c) return false;
      const y = Y[i]; if (y < c.y0 + 4 || y > c.y1) return false;
      const t = (y - c.y0) / (c.y1 - c.y0);
      const xl = c.xt0 + (c.xb0 - c.xt0) * t, xr = c.xt1 + (c.xb1 - c.xt1) * t;
      return X[i] > xl && X[i] < xr;
    }

    function stats() {
      let colorable = 0, colored = 0, cupColored = 0;
      for (let i = 0; i < count; i++) {
        const t = TY[i];
        if (t === T_C || t === T_G) {
          if (ALIVE[i]) colorable++;
          if (t === T_C && ALIVE[i]) { colored++; if (inCup(i)) cupColored++; }
        }
      }
      return { colorable, colored, cupColored };
    }

    let initialColorable = 0;
    for (let i = 0; i < count; i++) if (TY[i] === T_C || TY[i] === T_G) initialColorable++;

    return { X, Y, PX, PY, RAD, TY, CI, ALIVE, count, pins, walls, colorList, ev, substep, maxSpeed, stats, inCup, initialColorable };
  }

  // ---------- sprites (卡通 Q 版: flat fill, darker rim shade, thick dark outline, gloss dot) ----------
  const OL = '#2a1a14';
  function makeSprite(fill, kind) {
    const S = 40;
    let cv = null;
    try { cv = document.createElement('canvas'); cv.width = S; cv.height = S; } catch (e) { return null; }
    const g = cv.getContext('2d'); if (!g) return null;
    const c = S / 2, r = S / 2 - 3;
    const sh = MG.util.shade;
    let base, dark, light;
    if (kind === 'lava') { base = '#ff6a1c'; dark = '#d8260f'; light = '#ffe27a'; }
    else if (kind === 'water') { base = '#4fc0ff'; dark = '#2a86e0'; light = '#d9f6ff'; }
    else if (kind === 'stone') { base = '#9a948c'; dark = '#6e6862'; light = '#d6d1ca'; }
    else if (kind === 'dead') { base = '#3a3a42'; dark = '#1c1c22'; light = '#77777f'; }
    else if (kind === 'rock') { base = '#b07a4f'; dark = '#7d5233'; light = '#e8bf92'; }
    else if (kind === 'grey') { base = '#d4d7e0'; dark = '#a2a6b4'; light = '#ffffff'; }
    else { base = fill; dark = sh(fill, -0.28); light = sh(fill, 0.55); }
    g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2);
    g.fillStyle = base; g.fill();
    g.save(); g.clip();
    g.fillStyle = dark; g.beginPath(); g.arc(c + r * 0.35, c + r * 0.45, r * 0.95, 0, Math.PI * 2); g.globalAlpha = 0.55; g.fill(); g.globalAlpha = 1;
    g.fillStyle = base; g.beginPath(); g.arc(c - r * 0.12, c - r * 0.12, r * 0.78, 0, Math.PI * 2); g.fill();
    g.restore();
    if (kind === 'stone' || kind === 'rock') {
      g.fillStyle = dark;
      g.beginPath(); g.arc(c + 5, c + 4, 3.2, 0, 7); g.arc(c - 6, c + 6, 2.2, 0, 7); g.arc(c + 2, c - 7, 2.4, 0, 7); g.fill();
    }
    if (kind === 'lava') {
      g.fillStyle = '#ffd24a';
      g.beginPath(); g.arc(c + 4, c + 3, 3.4, 0, 7); g.arc(c - 5, c + 5, 2.4, 0, 7); g.fill();
    }
    g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2);
    g.lineWidth = 4.5; g.strokeStyle = OL; g.stroke();
    g.fillStyle = light;
    g.beginPath(); g.ellipse(c - r * 0.36, c - r * 0.4, r * 0.3, r * 0.2, -0.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff';
    g.beginPath(); g.arc(c - r * 0.42, c - r * 0.44, r * 0.11, 0, Math.PI * 2); g.fill();
    return cv;
  }

  MG.register({
    id: 'pins', name: '拔針救人', icon: '📌', color: '#ffcc4d',
    _TPL: TPL, _makeLevel: makeLevel,
    create(api) {
      const U = api.util;
      const L = makeLevel(api.level, api.rng, api.diff || 0);
      const world = World(L, api.rng);
      const { X, Y, RAD, TY, CI, ALIVE, pins } = world;
      const kind = L.kind;
      const need = kind === 'cup' ? Math.max(1, Math.ceil(L.need * world.initialColorable)) : 0;
      let sc = 1, ox = 0, oy = 0;
      let acc = 0, time = 0, sinceMove = 0, sincePull = 99, settleT = 0, endT = 0, ending = null;
      let shake = 0, cupBounce = 0, lastCup = 0, reachedNeed = false;
      let sndT = 0;
      const parts = [];
      const sprites = {};
      const monster = L.monster, person = L.person;
      let monsterHitFlash = 0, monsterAttack = 0, personHappy = 0, monsterDeadT = 0, walkT = 0, walkX0 = 0;
      const hintPin = (L.tpl.order && L.tpl.order.length) ? L.tpl.order[0] : 0;

      function layout() {
        const W = api.W, H = api.H;
        sc = Math.min(W / WW, H / (WH + 6));
        ox = (W - WW * sc) / 2; oy = (H - WH * sc) / 2 + 2;
      }
      layout();

      function sprite(key, fill, kindName) {
        if (sprites[key] === undefined) sprites[key] = makeSprite(fill, kindName);
        return sprites[key];
      }

      function setInfo() {
        if (kind === 'cup') {
          const s = world.stats();
          if (!api.diff && api.level === 1 && sincePull > 50) api.info('點金針把它拔出來，讓彩球掉進杯子！');
          else api.info('目標 ' + need + ' 顆彩球進杯' + (world.TY.indexOf(T_G) >= 0 ? '・灰球碰彩球會上色' : ''));
        } else {
          if (!monster.alive) api.info(walkT > 0 ? '快走！' : '怪物倒了！拔掉門閂救人（小心岩漿）');
          else api.info('用石頭砸怪物，別讓岩漿碰到人！');
        }
      }
      setInfo();

      function puff(x, y, color, n, spd, life, size) {
        for (let i = 0; i < n && parts.length < 320; i++) {
          const a = Math.random() * Math.PI * 2, v = spd * (0.4 + Math.random() * 0.8);
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spd * 0.3, life, max: life, color, size: size * (0.6 + Math.random() * 0.7), g: 0 });
        }
      }
      function confetti() {
        for (let i = 0; i < 90 && parts.length < 400; i++) {
          parts.push({ x: WW / 2 + (Math.random() - 0.5) * 60, y: WH * 0.45, vx: (Math.random() - 0.5) * 420, vy: -200 - Math.random() * 380, life: 1.8, max: 1.8, color: CANDY[i % CANDY.length], size: 3 + Math.random() * 3, g: 600, rot: Math.random() * 6, conf: true });
        }
      }

      function pullPin(i) {
        const p = pins[i];
        if (!p || p.pulled) return false;
        p.pulled = true; sincePull = 0;
        api.sfx('pop');
        puff(p.bx, p.by, '#fff2a8', 8, 90, 0.4, 2.5);
        if (p.door && monster && monster.alive) { monsterAttack = 0.001; }
        if (p.door && monster && !monster.alive) { walkT = 0.001; walkX0 = person.x; personHappy = 1; }
        return true;
      }

      function finish(won, text) {
        if (ending) return;
        ending = { won, text }; endT = 0;
        if (won) { confetti(); if (person) personHappy = 1; }
        else shake = Math.max(shake, 8);
        if (won) api.win(text); else api.lose(text);
      }

      function judge(dt) {
        const ev = world.ev;
        // events → effects
        while (ev.fx.length) {
          const c = ev.fx.pop(), y = ev.fx.pop(), x = ev.fx.pop(), k = ev.fx.pop();
          if (k === 1) puff(x, y, world.colorList[c] || '#fff', 3, 50, 0.35, 2);
          else if (k === 2) puff(x, y, 'rgba(40,40,40,0.8)', 4, 40, 0.6, 3.5);
          else if (k === 3) puff(x, y, 'rgba(255,255,255,0.85)', 5, 45, 0.7, 4);
        }
        sndT -= dt;
        if (ev.ruin > 0 && sndT <= 0) { api.sfx('bad'); sndT = 0.35; shake = Math.max(shake, 2.5); }
        else if (ev.steam > 0 && sndT <= 0) { api.sfx('pour'); sndT = 0.4; }
        else if (ev.recolor > 0 && sndT <= 0) { api.sfx('tap'); sndT = 0.2; }
        ev.ruin = 0; ev.steam = 0; ev.recolor = 0;
        if (kind === 'rescue') {
          if (ev.hit > 0 && monster.alive) {
            monster.hits += ev.hit; ev.hit = 0; monsterHitFlash = 0.18; shake = Math.max(shake, 3); api.sfx('hit');
            if (monster.hits >= monster.hp) killMonster();
          }
          if (ev.lavaMonster && monster.alive) killMonster();
          ev.lavaMonster = false;
          if (ev.lavaPerson && person.alive) { person.alive = false; puff(person.x, person.y - 10, 'rgba(60,60,60,0.8)', 16, 70, 0.9, 5); finish(false, '岩漿燒到人了！'); return; }
          if (monsterAttack > 0) { monsterAttack += dt; if (monsterAttack > 0.55) { person.alive = false; finish(false, '怪物衝過去了！'); } return; }
          if (!monster.alive) monsterDeadT += dt;
          if (walkT > 0) {
            walkT += dt;
            const t = Math.min(1, walkT / 1.3);
            person.x = U.lerp(walkX0, monster.x, t * t * (3 - 2 * t));
            if (t >= 1 && (settleT > 0.2 || walkT > 3)) finish(true, '成功救出！');
          } else if (monster.alive && pins.every((p) => p.pulled || p.door) && settleT > 0.8) finish(false, '怪物還活著…');
          return;
        }
        const s = world.stats();
        if (s.cupColored > lastCup) { cupBounce = 1; }
        lastCup = s.cupColored;
        if (!reachedNeed && s.cupColored >= need) { reachedNeed = true; api.sfx('good'); }
        if (s.cupColored >= need && (settleT > 0.35 || sincePull > 5)) { finish(true, '彩球滿杯！'); return; }
        if (s.colorable < need) { endT += dt; if (endT > 0.8) finish(false, s.colored < need ? '太多球被弄黑了' : '球不夠了'); return; }
        if (pins.every((p) => p.pulled) && (settleT > 0.8 || sincePull > 7)) finish(false, '彩球不夠多');
      }

      function killMonster() {
        if (!monster.alive) return;
        monster.alive = false; monsterDeadT = 0;
        puff(monster.x, monster.y, '#c58cff', 22, 120, 0.8, 4.5);
        puff(monster.x, monster.y, '#ffffff', 10, 80, 0.6, 3);
        shake = Math.max(shake, 7); api.sfx('good');
      }

      function update(dt) {
        time += dt;
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i]; p.life -= dt;
          if (p.life <= 0) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
          p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.98; if (!p.g) p.vy *= 0.97;
        }
        shake = Math.max(0, shake - dt * 30);
        cupBounce = Math.max(0, cupBounce - dt * 5);
        monsterHitFlash = Math.max(0, monsterHitFlash - dt);
        if (api.ended) return;
        for (let i = 0; i < pins.length; i++) {
          const p = pins[i];
          if (p.pulled && !p.gone) {
            p.t = Math.min(1, p.t + dt / 0.42);
            const e = p.t * p.t * (3 - 2 * p.t);
            p.off = e * (p.len + 34);
            if (p.t >= 1) p.gone = true;
          }
          if (p.shake > 0) p.shake = Math.max(0, p.shake - dt);
        }
        acc += dt;
        let steps = 0;
        while (acc >= HSTEP && steps < 14) { world.substep(); acc -= HSTEP; steps++; }
        if (steps >= 14) acc = 0;
        sincePull += dt;
        const ms = world.maxSpeed();
        if (ms < 22) settleT += dt; else settleT = 0;
        judge(dt);
        if (!ending) setInfo();
      }

      function hitPin(wx, wy) {
        let best = -1, bd = 26 / sc;
        for (let i = 0; i < pins.length; i++) {
          const p = pins[i]; if (p.pulled) continue;
          const dh = Math.hypot(wx - p.bx, wy - p.by) * 0.75;
          const dx = p.bx - p.ax, dy = p.by - p.ay, l2 = dx * dx + dy * dy;
          let t = ((wx - p.ax) * dx + (wy - p.ay) * dy) / l2; t = Math.max(0, Math.min(1, t));
          const ds = Math.hypot(wx - (p.ax + dx * t), wy - (p.ay + dy * t)) + 4 / sc;
          const d = Math.min(dh, ds);
          if (d < bd) { bd = d; best = i; }
        }
        return best;
      }

      function down(x, y) {
        if (api.ended || ending) return;
        const wx = (x - ox) / sc, wy = (y - oy) / sc;
        const i = hitPin(wx, wy);
        if (i >= 0) pullPin(i);
        else puff(wx, wy, 'rgba(255,255,255,0.9)', 5, 40, 0.3, 2);
      }

      // ---------- drawing (卡通 Q 版) ----------
      function olStroke(g, lw) { g.lineWidth = lw; g.strokeStyle = OL; g.lineJoin = 'round'; g.stroke(); }
      function blob(g, x, y, rx, ry, fill, lw) {
        g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = fill; g.fill();
        if (lw !== 0) olStroke(g, lw || 2);
      }
      function otext(g, str, x, y, size, color) {
        g.font = '900 ' + size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = Math.max(2.5, size * 0.24); g.strokeStyle = OL; g.lineJoin = 'round';
        g.strokeText(str, x, y); g.fillStyle = color; g.fillText(str, x, y);
      }
      // cosy lab backdrop, cached per canvas size
      let bgCv = null, bgW = 0, bgH = 0;
      const bgDpr = Math.min(3, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
      function flask(g, x, y, s, liquid, type) {
        g.save(); g.translate(x, y); g.scale(s, s);
        g.beginPath();
        if (type === 0) { g.moveTo(-4, -22); g.lineTo(-4, -10); g.arc(0, 2, 12.6, -1.89, -1.25, true); g.lineTo(4, -22); g.closePath(); }
        else if (type === 1) { g.moveTo(-10, -18); g.lineTo(10, -18); g.lineTo(10, 12); g.quadraticCurveTo(10, 15, 7, 15); g.lineTo(-7, 15); g.quadraticCurveTo(-10, 15, -10, 12); g.closePath(); }
        else { g.moveTo(-4, -22); g.lineTo(-4, -6); g.lineTo(-13, 12); g.quadraticCurveTo(-14, 15, -10, 15); g.lineTo(10, 15); g.quadraticCurveTo(14, 15, 13, 12); g.lineTo(4, -6); g.lineTo(4, -22); g.closePath(); }
        g.fillStyle = 'rgba(235,250,255,0.9)'; g.fill();
        g.save(); g.clip(); g.fillStyle = liquid; g.fillRect(-16, 1, 32, 16);
        g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(-16, 1, 32, 2.5); g.restore();
        g.lineWidth = 2.6; g.strokeStyle = OL; g.lineJoin = 'round'; g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(-7, -12 + (type === 1 ? -2 : 8), 2.4, 8);
        if (type !== 1) { U.rr(g, -5.5, -25, 11, 4.5, 2); g.fillStyle = '#c98b52'; g.fill(); olStroke(g, 2); }
        g.restore();
      }
      function paintBg(g, W, H) {
        const warm = kind === 'rescue';
        let gr = g.createLinearGradient(0, 0, 0, H);
        if (warm) { gr.addColorStop(0, '#ffe7c4'); gr.addColorStop(1, '#f6c48f'); }
        else { gr.addColorStop(0, '#e2f6ef'); gr.addColorStop(1, '#bfe6dc'); }
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        // wall tiles
        g.strokeStyle = warm ? 'rgba(170,100,50,0.13)' : 'rgba(40,120,110,0.12)'; g.lineWidth = 1.5;
        g.beginPath();
        for (let y = 0; y < H; y += 34) { g.moveTo(0, y); g.lineTo(W, y); }
        for (let y = 0, k = 0; y < H; y += 34, k++) for (let x = (k % 2) * 17; x < W; x += 34) { g.moveTo(x, y); g.lineTo(x, y + 34); }
        g.stroke();
        // shelves with flasks and jars on both sides
        const cols = ['#ff6b8a', '#6fd3ff', '#8be06b', '#ffcf4d', '#b98cff', '#ff9a4a'];
        const shelf = (x0, x1, y, seed) => {
          let i = seed;
          for (let x = x0 + 16; x < x1 - 12; x += 30) {
            flask(g, x, y - 16, 0.85 + ((i * 37) % 10) / 40, cols[i % cols.length], i % 3); i += 2;
          }
          U.rr(g, x0, y, x1 - x0, 8, 3); g.fillStyle = '#c98b52'; g.fill(); olStroke(g, 2.5);
          g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x0 + 4, y + 1.5, x1 - x0 - 8, 2);
          for (const bx of [x0 + 10, x1 - 14]) { g.beginPath(); g.moveTo(bx, y + 8); g.lineTo(bx + 4, y + 18); g.lineTo(bx + 8, y + 8); g.closePath(); g.fillStyle = '#a86c39'; g.fill(); olStroke(g, 2); }
        };
        shelf(-6, W * 0.36, H * 0.17, 0);
        shelf(W * 0.64, W + 6, H * 0.17, 3);
        shelf(-6, W * 0.3, H * 0.5, 1);
        shelf(W * 0.7, W + 6, H * 0.5, 4);
        // hanging lamps
        for (const lx of [W * 0.22, W * 0.78]) {
          g.strokeStyle = OL; g.lineWidth = 2; g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx, 26); g.stroke();
          g.fillStyle = 'rgba(255,240,170,0.35)'; g.beginPath(); g.arc(lx, 40, 30, 0, Math.PI * 2); g.fill();
          g.beginPath(); g.moveTo(lx - 16, 40); g.quadraticCurveTo(lx, 14, lx + 16, 40); g.closePath();
          g.fillStyle = warm ? '#ff8a5a' : '#4fbfa8'; g.fill(); olStroke(g, 2.5);
          blob(g, lx, 42, 6, 4, '#fff3a8', 2);
        }
        // depth wash so the backdrop stays behind the puzzle
        g.fillStyle = warm ? 'rgba(255,231,196,0.42)' : 'rgba(226,246,239,0.42)';
        g.fillRect(0, 0, W, H);
        // floor
        const fy = H * 0.94;
        g.fillStyle = warm ? '#d79a62' : '#9fd3c4'; g.fillRect(0, fy, W, H - fy);
        g.fillStyle = warm ? '#c48550' : '#8cc4b4';
        for (let x = 0, k = 0; x < W; x += 30, k++) if (k % 2) g.fillRect(x, fy, 30, H - fy);
        g.fillStyle = OL; g.fillRect(0, fy - 1.5, W, 3);
      }
      function drawBg(g) {
        const W = api.W, H = api.H;
        if (!bgCv || bgW !== W || bgH !== H) {
          bgW = W; bgH = H;
          try { bgCv = document.createElement('canvas'); bgCv.width = Math.round(W * bgDpr); bgCv.height = Math.round(H * bgDpr); } catch (e) { bgCv = null; }
          if (bgCv && bgCv.getContext) { const c2 = bgCv.getContext('2d'); c2.setTransform(bgDpr, 0, 0, bgDpr, 0, 0); paintBg(c2, W, H); }
        }
        if (bgCv && bgCv.getContext) g.drawImage(bgCv, 0, 0, W, H); else paintBg(g, W, H);
        // drifting potion bubbles
        for (let i = 0; i < 12; i++) {
          const x = ((i * 97 + 31) % 100) / 100 * W, r = 3 + (i * 13) % 7;
          const y = H - ((time * (14 + (i % 4) * 6) + i * 83) % (H + 40)) + 20;
          g.beginPath(); g.arc(x + Math.sin(time * 1.3 + i) * 6, y, r, 0, Math.PI * 2);
          g.fillStyle = 'rgba(255,255,255,0.45)'; g.fill();
          g.lineWidth = 1.5; g.strokeStyle = 'rgba(42,26,20,0.25)'; g.stroke();
        }
      }

      function drawGlass(g) {
        for (let i = 0; i < L.glass.length; i++) {
          const q = L.glass[i];
          if (q[4]) {
            g.fillStyle = 'rgba(225,245,255,0.5)';
            g.beginPath();
            const a = L.mirror ? WW - 40 : 40, b = L.mirror ? WW - 105 : 105, c2 = L.mirror ? WW - 195 : 195, d = L.mirror ? WW - 260 : 260;
            g.moveTo(a, 205); g.lineTo(d, 205); g.lineTo(c2, 268); g.lineTo(b, 268); g.closePath(); g.fill();
            continue;
          }
          g.fillStyle = 'rgba(225,245,255,0.55)';
          U.rr(g, q[0], q[1], q[2] - q[0], q[3] - q[1], 10); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.55)';
          U.rr(g, q[0] + 5, q[1] + 8, 4, Math.max(0, q[3] - q[1] - 16), 2); g.fill();
        }
      }

      function strokeWalls(g, w, col) {
        g.strokeStyle = col; g.lineWidth = w;
        g.beginPath();
        for (let i = 0; i < L.walls.length; i++) { const q = L.walls[i]; g.moveTo(q[0], q[1]); g.lineTo(q[2], q[3]); }
        g.stroke();
      }

      function drawCupBack(g) {
        const c = L.cup;
        const gr = g.createLinearGradient(0, c.y0, 0, c.y1);
        gr.addColorStop(0, 'rgba(235,250,255,0.55)'); gr.addColorStop(1, 'rgba(170,225,255,0.65)');
        g.fillStyle = gr;
        g.beginPath(); g.moveTo(c.xt0, c.y0); g.lineTo(c.xb0, c.y1); g.lineTo(c.xb1, c.y1); g.lineTo(c.xt1, c.y0); g.closePath(); g.fill();
      }

      function drawCupFront(g) {
        const c = L.cup;
        const s = world.stats();
        const cx = WW / 2, cy = c.y1 - 22;
        const b = 1 + cupBounce * 0.12;
        g.save(); g.translate(cx, cy); g.scale(b, b);
        const ok = s.cupColored >= need;
        U.rr(g, -42, -14, 84, 28, 14);
        g.fillStyle = ok ? '#3fcf7a' : '#5a4a7a'; g.fill(); olStroke(g, 2.5);
        U.rr(g, -36, -11, 72, 7, 3.5); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fill();
        const total = world.initialColorable;
        otext(g, Math.min(s.cupColored, total) + ' / ' + total, 0, 1, 15, '#ffffff');
        g.restore();
        const p = Math.min(1, s.cupColored / total), pn = need / total;
        U.rr(g, cx - 50, c.y1 - 7, 100, 7, 3.5); g.fillStyle = '#fff8ea'; g.fill(); olStroke(g, 1.8);
        if (p > 0) { g.fillStyle = ok ? '#38d27a' : '#ffb21e'; U.rr(g, cx - 49, c.y1 - 6, 98 * p, 5, 2.5); g.fill(); }
        g.fillStyle = OL; g.fillRect(cx - 50 + 100 * pn - 1.5, c.y1 - 10, 3, 12);
        otext(g, '★', cx - 50 + 100 * pn, c.y1 - 15, 9, ok ? '#38d27a' : '#ffd34d');
        g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 3; g.lineCap = 'round';
        g.beginPath(); g.moveTo(c.xt0 + 8, c.y0 + 12); g.lineTo(c.xb0 + 6, c.y1 - 14); g.stroke();
      }

      function drawRooms(g) {
        // cartoon room: striped wallpaper, picture frames, wooden floor, outlined
        const a = L.mirror ? WW - 276 : 24;
        g.fillStyle = '#fff1d8'; g.fillRect(a, 322, 252, 160);
        g.fillStyle = '#ffe2bd';
        for (let x = a + 6; x < a + 252; x += 24) g.fillRect(x, 322, 12, 160);
        g.fillStyle = '#e8b98a'; g.fillRect(a, 450, 252, 30);
        g.fillStyle = OL; g.fillRect(a, 449, 252, 2);
        for (let i = 0; i < 3; i++) {
          const fx = a + 22 + i * 84;
          U.rr(g, fx, 344, 34, 28, 4); g.fillStyle = '#c98b52'; g.fill(); olStroke(g, 2);
          U.rr(g, fx + 5, 349, 24, 18, 2); g.fillStyle = ['#9fe0ff', '#ffd1e6', '#c8f0b0'][i]; g.fill();
          g.fillStyle = '#6cc35c'; g.beginPath(); g.moveTo(fx + 5, 367); g.lineTo(fx + 14, 357); g.lineTo(fx + 21, 363); g.lineTo(fx + 29, 355); g.lineTo(fx + 29, 367); g.closePath(); g.fill();
        }
        U.rr(g, a - 4, 480, 260, 13, 4); g.fillStyle = '#c98b52'; g.fill(); olStroke(g, 2.5);
        g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(a, 482, 252, 2.5);
        g.fillStyle = '#a86c39'; g.fillRect(a - 2, 493, 256, 5);
      }

      function drawPerson(g) {
        // chibi kid: big round head, tiny body, stubby limbs
        const e = person; if (!e) return;
        let x = e.x, y = e.y;
        const scared = monster && monster.alive;
        const bob = Math.sin(time * (scared ? 14 : 4)) * (scared ? 1 : 1.5);
        const dead = !e.alive;
        g.save(); g.translate(x, y + bob);
        if (dead) g.globalAlpha = 0.85;
        g.fillStyle = 'rgba(0,0,0,0.2)'; g.beginPath(); g.ellipse(0, 24, 15, 4, 0, 0, Math.PI * 2); g.fill();
        const skin = dead ? '#4a4a4a' : '#ffd8b4', shirt = dead ? '#333' : '#3d8bff', pants = dead ? '#222' : '#2c3a6e';
        blob(g, -5, 19, 4.5, 5.5, pants, 2.2); blob(g, 5, 19, 4.5, 5.5, pants, 2.2);
        const armY = (scared || personHappy) ? -1 : 9;
        blob(g, -12, armY, 4, 5.5, skin, 2.2);
        blob(g, 12, armY, 4, 5.5, skin, 2.2);
        U.rr(g, -10, 2, 20, 17, 8); g.fillStyle = shirt; g.fill(); olStroke(g, 2.4);
        U.rr(g, -7, 5, 5, 9, 2.5); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fill();
        blob(g, 0, -11, 15, 14, skin, 2.6);
        // hair
        g.beginPath(); g.ellipse(0, -15, 15, 10.5, 0, Math.PI * 1.02, Math.PI * 1.98); g.quadraticCurveTo(8, -14, 2, -17); g.quadraticCurveTo(-6, -12, -15, -14);
        g.fillStyle = dead ? '#111' : '#5a3418'; g.fill(); olStroke(g, 2.2);
        if (dead) { otext(g, '×', -5, -9, 9, '#eeeeee'); otext(g, '×', 5, -9, 9, '#eeeeee'); }
        else {
          for (const ex of [-5.5, 5.5]) {
            blob(g, ex, -9, 3.4, 4, '#ffffff', 1.6);
            g.fillStyle = OL; g.beginPath(); g.arc(ex + (scared ? 0 : 0.4), -8.5, 2.2, 0, 7); g.fill();
            g.fillStyle = '#ffffff'; g.beginPath(); g.arc(ex - 0.6, -9.8, 0.9, 0, 7); g.fill();
          }
          g.fillStyle = 'rgba(255,110,110,0.45)';
          g.beginPath(); g.ellipse(-10, -4, 2.6, 1.6, 0, 0, 7); g.ellipse(10, -4, 2.6, 1.6, 0, 0, 7); g.fill();
          g.strokeStyle = OL; g.lineWidth = 1.8; g.lineCap = 'round';
          g.beginPath();
          if (scared) { g.ellipse(0, -2, 2.4, 3, 0, 0, Math.PI * 2); g.fillStyle = '#8a2a2a'; g.fill(); }
          else g.arc(0, -4, 3.5, 0.15 * Math.PI, 0.85 * Math.PI);
          g.stroke();
          if (scared) { blob(g, 13, -17, 2, 3, '#7fd3ff', 1.2); }
        }
        g.restore();
        if (personHappy && e.alive) {
          for (let i = 0; i < 3; i++) {
            const t = (time * 0.8 + i / 3) % 1;
            g.globalAlpha = 1 - t;
            otext(g, '♥', e.x - 12 + i * 12, e.y - 34 - t * 26, 11, '#ff4f7b');
          }
          g.globalAlpha = 1;
        }
      }

      function drawMonster(g) {
        // chibi monster: round purple blob with horns, big angry eyes, little fangs
        const e = monster; if (!e) return;
        if (!e.alive) {
          if (monsterDeadT < 0.6) {
            g.globalAlpha = 1 - monsterDeadT / 0.6;
            blob(g, e.x, e.y + monsterDeadT * 10, e.r * (1 - monsterDeadT), e.r * (1 - monsterDeadT) * 0.9, '#b37cff', 2.5);
            g.globalAlpha = 1;
          }
          return;
        }
        let x = e.x, y = e.y;
        if (monsterAttack > 0) { const t = Math.min(1, monsterAttack / 0.5); x = U.lerp(e.x, person.x + (e.x > person.x ? 26 : -26), t * t); }
        const sq = 1 + Math.sin(time * 5) * 0.04 + (monsterHitFlash > 0 ? 0.12 : 0);
        const hit = monsterHitFlash > 0;
        const R = e.r;
        g.save(); g.translate(x + (hit ? Math.sin(time * 80) * 2 : 0), y + 4); g.scale(1 / sq, sq);
        g.fillStyle = 'rgba(0,0,0,0.2)'; g.beginPath(); g.ellipse(0, R - 1, R, 5, 0, 0, Math.PI * 2); g.fill();
        // horns
        for (const s of [-1, 1]) {
          g.beginPath(); g.moveTo(s * R * 0.18, -R * 0.75); g.quadraticCurveTo(s * R * 0.5, -R * 1.05, s * R * 0.82, -R * 1.4); g.quadraticCurveTo(s * R * 0.95, -R * 0.95, s * R * 0.72, -R * 0.5); g.closePath();
          g.fillStyle = '#ffe9b0'; g.fill(); olStroke(g, 2.4);
        }
        // feet
        blob(g, -R * 0.45, R * 0.82, R * 0.3, R * 0.2, '#6a2fc2', 2.2); blob(g, R * 0.45, R * 0.82, R * 0.3, R * 0.2, '#6a2fc2', 2.2);
        // body
        g.beginPath(); g.ellipse(0, 0, R * 1.02, R * 0.92, 0, 0, Math.PI * 2);
        g.fillStyle = hit ? '#ffd0e0' : '#9a5cf0'; g.fill(); olStroke(g, 2.8);
        g.fillStyle = hit ? '#ffffff' : '#b98bff'; g.beginPath(); g.ellipse(-R * 0.3, -R * 0.42, R * 0.38, R * 0.22, -0.4, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(-R * 0.42, -R * 0.5, R * 0.14, R * 0.08, -0.4, 0, Math.PI * 2); g.fill();
        // arms
        blob(g, -R * 1.02, R * 0.15, R * 0.2, R * 0.28, '#8a4ae6', 2.2); blob(g, R * 1.02, R * 0.15, R * 0.2, R * 0.28, '#8a4ae6', 2.2);
        // eyes + angry brows
        for (const s of [-1, 1]) {
          blob(g, s * R * 0.36, -R * 0.12, R * 0.27, R * 0.3, '#fffbe8', 2);
          g.fillStyle = '#d0021b'; g.beginPath(); g.arc(s * R * 0.3, -R * 0.06, R * 0.13, 0, 7); g.fill();
          g.fillStyle = OL; g.beginPath(); g.arc(s * R * 0.3, -R * 0.06, R * 0.06, 0, 7); g.fill();
          g.strokeStyle = OL; g.lineWidth = 2.6; g.lineCap = 'round';
          g.beginPath(); g.moveTo(s * R * 0.62, -R * 0.5); g.lineTo(s * R * 0.14, -R * 0.34); g.stroke();
        }
        // mouth with fangs
        U.rr(g, -R * 0.42, R * 0.28, R * 0.84, R * 0.3, R * 0.14); g.fillStyle = '#3a0d5c'; g.fill(); olStroke(g, 2);
        g.fillStyle = '#ffffff';
        g.beginPath(); g.moveTo(-R * 0.32, R * 0.3); g.lineTo(-R * 0.22, R * 0.48); g.lineTo(-R * 0.12, R * 0.3);
        g.moveTo(R * 0.12, R * 0.3); g.lineTo(R * 0.22, R * 0.48); g.lineTo(R * 0.32, R * 0.3); g.fill();
        g.restore();
        const hpw = 36, hy = e.y - e.r * 1.45 - 10;
        U.rr(g, e.x - hpw / 2, hy, hpw, 7, 3.5); g.fillStyle = OL; g.fill();
        g.fillStyle = '#ff4f5e'; U.rr(g, e.x - hpw / 2 + 1.5, hy + 1.5, (hpw - 3) * Math.max(0, 1 - e.hits / e.hp), 4, 2); g.fill();
      }

      function drawBalls(g) {
        for (let i = 0; i < world.count; i++) {
          if (!ALIVE[i]) continue;
          const t = TY[i];
          let sp;
          if (t === T_C) sp = sprite('c' + CI[i], world.colorList[CI[i]] || '#ff4f7b', 'col');
          else if (t === T_G) sp = sprite('g', null, 'grey');
          else if (t === T_K) sp = sprite('k', null, 'lava');
          else if (t === T_W) sp = sprite('w', null, 'water');
          else if (t === T_S) sp = sprite('s', null, 'stone');
          else if (t === T_D) sp = sprite('d', null, 'dead');
          else sp = sprite('r', null, 'rock');
          const r = RAD[i] * 1.12;
          if (sp) g.drawImage(sp, X[i] - r, Y[i] - r, r * 2, r * 2);
          else { g.fillStyle = '#888'; g.beginPath(); g.arc(X[i], Y[i], RAD[i], 0, 7); g.fill(); }
        }
      }

      function drawPins(g) {
        for (let i = 0; i < pins.length; i++) {
          const p = pins[i]; if (p.gone) continue;
          const ox2 = p.ux * p.off, oy2 = p.uy * p.off;
          const ax = p.ax + ox2, ay = p.ay + oy2, bx = p.bx + ox2, by = p.by + oy2;
          g.globalAlpha = p.t > 0.7 ? Math.max(0, 1 - (p.t - 0.7) / 0.3) : 1;
          g.lineCap = 'round';
          g.strokeStyle = OL; g.lineWidth = PR * 2 + 3.4;
          g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
          g.strokeStyle = '#ffc93a'; g.lineWidth = PR * 2;
          g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
          g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1.5;
          const nx = -p.uy, ny = p.ux, sgn = ny > 0 ? -1 : 1;
          g.beginPath(); g.moveTo(ax + nx * 1.4 * sgn, ay + ny * 1.4 * sgn); g.lineTo(bx + nx * 1.4 * sgn, by + ny * 1.4 * sgn); g.stroke();
          const hx = bx + p.ux * 8, hy = by + p.uy * 8;
          g.strokeStyle = OL; g.lineWidth = 8;
          g.beginPath(); g.arc(hx, hy, 8, 0, Math.PI * 2); g.stroke();
          g.strokeStyle = '#ffc93a'; g.lineWidth = 4.4;
          g.beginPath(); g.arc(hx, hy, 8, 0, Math.PI * 2); g.stroke();
          g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1.5;
          g.beginPath(); g.arc(hx, hy, 8, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
          if (p.door) { U.text(g, '🚪', bx, by + 18, 9, '#fff'); }
          g.globalAlpha = 1;
          if (!p.pulled && i === hintPin && !api.diff && api.level <= 2 && pins.every((q) => !q.pulled)) {
            const t = (time * 1.4) % 1;
            g.strokeStyle = 'rgba(255,90,90,' + (1 - t) + ')'; g.lineWidth = 2.5;
            g.beginPath(); g.arc(hx, hy, 10 + t * 16, 0, Math.PI * 2); g.stroke();
            U.text(g, '👆', hx + 10, hy + 22 + Math.sin(time * 6) * 3, 18, '#fff');
          }
        }
      }

      function drawParts(g) {
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          g.globalAlpha = Math.max(0, p.life / p.max);
          g.fillStyle = p.color;
          if (p.conf) { g.save(); g.translate(p.x, p.y); g.rotate(p.rot + p.life * 8); g.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size); g.restore(); }
          else { g.beginPath(); g.arc(p.x, p.y, p.size * (1.4 - 0.4 * p.life / p.max), 0, Math.PI * 2); g.fill(); }
        }
        g.globalAlpha = 1;
      }

      function draw(g) {
        drawBg(g);
        g.save();
        const sx = shake > 0 ? (Math.random() - 0.5) * shake : 0, sy = shake > 0 ? (Math.random() - 0.5) * shake : 0;
        g.translate(ox + sx, oy + sy); g.scale(sc, sc);
        if (kind === 'rescue') drawRooms(g); else drawCupBack(g);
        drawGlass(g);
        drawBalls(g);
        if (kind === 'rescue') { drawMonster(g); drawPerson(g); }
        g.lineCap = 'round'; g.lineJoin = 'round';
        strokeWalls(g, WR * 2 + 3.4, OL);
        strokeWalls(g, WR * 2 - 0.4, '#e6f6ff');
        strokeWalls(g, 1.6, '#ffffff');
        if (kind === 'cup') drawCupFront(g);
        drawPins(g);
        drawParts(g);
        g.restore();
      }

      return {
        update, draw, down,
        resize() { layout(); },
        _pull: pullPin, _world: world, _level: L, _need: need,
      };
    },
  });
})();
