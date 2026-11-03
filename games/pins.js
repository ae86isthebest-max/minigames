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

  // ---------- sprites ----------
  function makeSprite(fill, kind) {
    const S = 36;
    let cv = null;
    try { cv = document.createElement('canvas'); cv.width = S; cv.height = S; } catch (e) { return null; }
    const g = cv.getContext('2d'); if (!g) return null;
    const c = S / 2, r = S / 2 - 1;
    const gr = g.createRadialGradient(c - r * 0.35, c - r * 0.4, r * 0.1, c, c, r);
    if (kind === 'lava') { gr.addColorStop(0, '#fff3a0'); gr.addColorStop(0.35, '#ff8a1c'); gr.addColorStop(0.8, '#e0240f'); gr.addColorStop(1, '#7a0c05'); }
    else if (kind === 'water') { gr.addColorStop(0, '#e9fbff'); gr.addColorStop(0.4, '#6fd0ff'); gr.addColorStop(1, '#1e6fd9'); }
    else if (kind === 'stone') { gr.addColorStop(0, '#b9b4ad'); gr.addColorStop(0.6, '#6f6a64'); gr.addColorStop(1, '#3f3b37'); }
    else if (kind === 'dead') { gr.addColorStop(0, '#6a6a72'); gr.addColorStop(0.5, '#26262c'); gr.addColorStop(1, '#0b0b0e'); }
    else if (kind === 'rock') { gr.addColorStop(0, '#d9a877'); gr.addColorStop(0.55, '#8a5a3c'); gr.addColorStop(1, '#4a2d1b'); }
    else if (kind === 'grey') { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#c9ccd6'); gr.addColorStop(1, '#8b8f9c'); }
    else { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.28, MG.util.shade(fill, 0.35)); gr.addColorStop(0.75, fill); gr.addColorStop(1, MG.util.shade(fill, -0.35)); }
    g.fillStyle = gr;
    g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.fill();
    if (kind === 'stone' || kind === 'rock') {
      g.fillStyle = 'rgba(0,0,0,0.22)';
      g.beginPath(); g.arc(c + 5, c + 4, 3, 0, 7); g.arc(c - 6, c + 6, 2, 0, 7); g.arc(c + 2, c - 7, 2.2, 0, 7); g.fill();
    }
    g.fillStyle = 'rgba(255,255,255,0.75)';
    g.beginPath(); g.ellipse(c - r * 0.35, c - r * 0.42, r * 0.28, r * 0.17, -0.6, 0, Math.PI * 2); g.fill();
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

      // ---------- drawing ----------
      function drawBg(g) {
        const W = api.W, H = api.H;
        const gr = g.createLinearGradient(0, 0, 0, H);
        if (kind === 'rescue') { gr.addColorStop(0, '#ffe6c7'); gr.addColorStop(1, '#f6b98a'); }
        else { gr.addColorStop(0, '#d9f3ff'); gr.addColorStop(1, '#fbe3f4'); }
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(255,255,255,0.35)';
        for (let i = 0; i < 14; i++) {
          const x = ((i * 97 + 31) % 100) / 100 * W, y = ((i * 57 + 13) % 100) / 100 * H, r = 8 + (i * 13) % 26;
          g.beginPath(); g.arc(x, y + Math.sin(time * 0.6 + i) * 6, r, 0, Math.PI * 2); g.fill();
        }
      }

      function drawGlass(g) {
        for (let i = 0; i < L.glass.length; i++) {
          const q = L.glass[i];
          if (q[4]) {
            g.fillStyle = 'rgba(255,255,255,0.28)';
            g.beginPath();
            const a = L.mirror ? WW - 40 : 40, b = L.mirror ? WW - 105 : 105, c2 = L.mirror ? WW - 195 : 195, d = L.mirror ? WW - 260 : 260;
            g.moveTo(a, 205); g.lineTo(d, 205); g.lineTo(c2, 268); g.lineTo(b, 268); g.closePath(); g.fill();
            continue;
          }
          g.fillStyle = 'rgba(255,255,255,0.32)';
          U.rr(g, q[0], q[1], q[2] - q[0], q[3] - q[1], 10); g.fill();
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
        gr.addColorStop(0, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(180,220,255,0.45)');
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
        g.fillStyle = ok ? 'rgba(46,190,100,0.9)' : 'rgba(40,50,90,0.72)';
        U.rr(g, -40, -13, 80, 26, 13); g.fill();
        const total = world.initialColorable;
        U.text(g, Math.min(s.cupColored, total) + ' / ' + total, 0, 1, 14, '#fff', 'center', 900);
        g.restore();
        const p = Math.min(1, s.cupColored / total), pn = need / total;
        g.fillStyle = 'rgba(255,255,255,0.5)'; U.rr(g, cx - 50, c.y1 - 6, 100, 5, 2.5); g.fill();
        if (p > 0) { g.fillStyle = ok ? '#38d27a' : '#ffb21e'; U.rr(g, cx - 50, c.y1 - 6, 100 * p, 5, 2.5); g.fill(); }
        g.fillStyle = '#d6334a'; g.fillRect(cx - 50 + 100 * pn - 1, c.y1 - 9, 2, 11);
        U.text(g, '★', cx - 50 + 100 * pn, c.y1 - 13, 7, ok ? '#38d27a' : '#d6334a');
        g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(c.xt0 + 6, c.y0 + 10); g.lineTo(c.xb0 + 4, c.y1 - 12); g.stroke();
      }

      function drawRooms(g) {
        const a = L.mirror ? WW - 276 : 24;
        const gr = g.createLinearGradient(0, 322, 0, 482);
        gr.addColorStop(0, '#fff4df'); gr.addColorStop(1, '#f1cf9f');
        g.fillStyle = gr; g.fillRect(a, 322, 252, 160);
        g.fillStyle = '#c98b52'; g.fillRect(a - 4, 480, 260, 12);
        g.fillStyle = '#a86c39'; g.fillRect(a - 4, 490, 260, 6);
        g.fillStyle = 'rgba(160,100,60,0.18)';
        for (let i = 0; i < 6; i++) g.fillRect(a + 10 + i * 42, 340, 22, 30);
      }

      function drawPerson(g) {
        const e = person; if (!e) return;
        let x = e.x, y = e.y;
        const scared = monster && monster.alive;
        const bob = Math.sin(time * (scared ? 14 : 4)) * (scared ? 1 : 1.5);
        g.save(); g.translate(x, y + bob);
        if (!e.alive) g.globalAlpha = 0.85;
        g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(0, 24, 16, 4, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = e.alive ? '#3d7bff' : '#333';
        U.rr(g, -10, 2, 20, 20, 7); g.fill();
        g.fillStyle = e.alive ? '#2a3a66' : '#222';
        g.fillRect(-8, 18, 6, 6); g.fillRect(2, 18, 6, 6);
        g.strokeStyle = e.alive ? '#ffd2b0' : '#333'; g.lineWidth = 4; g.lineCap = 'round';
        const up = (scared || personHappy) ? -10 : 4;
        g.beginPath(); g.moveTo(-9, 6); g.lineTo(-16, up); g.moveTo(9, 6); g.lineTo(16, up); g.stroke();
        g.fillStyle = e.alive ? '#ffd2b0' : '#3a3a3a';
        g.beginPath(); g.arc(0, -8, 12, 0, Math.PI * 2); g.fill();
        g.fillStyle = e.alive ? '#5a3418' : '#111';
        g.beginPath(); g.arc(0, -11, 12, Math.PI * 1.05, Math.PI * 1.95); g.fill();
        g.fillStyle = '#222';
        if (!e.alive) { U.text(g, '×', -4, -8, 8, '#eee'); U.text(g, '×', 4, -8, 8, '#eee'); }
        else {
          g.beginPath(); g.arc(-4, -8, 1.6, 0, 7); g.arc(4, -8, 1.6, 0, 7); g.fill();
          g.strokeStyle = '#222'; g.lineWidth = 1.4;
          g.beginPath();
          if (scared) g.arc(0, -1, 2.6, 0, Math.PI * 2);
          else g.arc(0, -4, 3.5, 0.15 * Math.PI, 0.85 * Math.PI);
          g.stroke();
          if (scared) { g.fillStyle = '#7fd3ff'; g.beginPath(); g.ellipse(10, -14, 1.6, 2.6, 0, 0, 7); g.fill(); }
        }
        g.restore();
        if (personHappy && e.alive) {
          for (let i = 0; i < 3; i++) {
            const t = (time * 0.8 + i / 3) % 1;
            g.globalAlpha = 1 - t;
            U.text(g, '♥', e.x - 12 + i * 12, e.y - 30 - t * 26, 10, '#ff4f7b');
          }
          g.globalAlpha = 1;
        }
      }

      function drawMonster(g) {
        const e = monster; if (!e) return;
        if (!e.alive) {
          if (monsterDeadT < 0.6) {
            g.globalAlpha = 1 - monsterDeadT / 0.6;
            g.fillStyle = '#b37cff'; g.beginPath(); g.arc(e.x, e.y + monsterDeadT * 10, e.r * (1 - monsterDeadT), 0, Math.PI * 2); g.fill();
            g.globalAlpha = 1;
          }
          return;
        }
        let x = e.x, y = e.y;
        if (monsterAttack > 0) { const t = Math.min(1, monsterAttack / 0.5); x = U.lerp(e.x, person.x + (e.x > person.x ? 26 : -26), t * t); }
        const sq = 1 + Math.sin(time * 5) * 0.04 + (monsterHitFlash > 0 ? 0.12 : 0);
        g.save(); g.translate(x + (monsterHitFlash > 0 ? Math.sin(time * 80) * 2 : 0), y + 4); g.scale(1 / sq, sq);
        g.fillStyle = 'rgba(0,0,0,0.2)'; g.beginPath(); g.ellipse(0, e.r - 2, e.r, 5, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#7a3fd6';
        g.beginPath(); g.moveTo(-14, -16); g.lineTo(-22, -32); g.lineTo(-6, -20); g.fill();
        g.beginPath(); g.moveTo(14, -16); g.lineTo(22, -32); g.lineTo(6, -20); g.fill();
        const gr = g.createRadialGradient(-6, -10, 3, 0, 0, e.r + 4);
        gr.addColorStop(0, monsterHitFlash > 0 ? '#ffffff' : '#c99bff'); gr.addColorStop(1, monsterHitFlash > 0 ? '#ffd0d0' : '#6a2fc2');
        g.fillStyle = gr;
        g.beginPath(); g.arc(0, 0, e.r, Math.PI, 0); g.lineTo(e.r, e.r - 4);
        for (let i = 0; i < 4; i++) { g.lineTo(e.r - (i + 0.5) * e.r / 2, e.r - 10); g.lineTo(e.r - (i + 1) * e.r / 2, e.r - 4); }
        g.closePath(); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(-8, -5, 6, 0, 7); g.arc(8, -5, 6, 0, 7); g.fill();
        g.fillStyle = '#d0021b'; g.beginPath(); g.arc(-7, -4, 2.8, 0, 7); g.arc(7, -4, 2.8, 0, 7); g.fill();
        g.fillStyle = '#3a0d5c'; U.rr(g, -10, 4, 20, 8, 3); g.fill();
        g.fillStyle = '#fff';
        g.beginPath(); g.moveTo(-8, 4); g.lineTo(-5, 9); g.lineTo(-2, 4); g.moveTo(2, 4); g.lineTo(5, 9); g.lineTo(8, 4); g.fill();
        g.restore();
        const hpw = 34;
        g.fillStyle = 'rgba(0,0,0,0.35)'; U.rr(g, e.x - hpw / 2, e.y - e.r - 20, hpw, 5, 2.5); g.fill();
        g.fillStyle = '#ff4f5e'; U.rr(g, e.x - hpw / 2, e.y - e.r - 20, hpw * Math.max(0, 1 - e.hits / e.hp), 5, 2.5); g.fill();
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
          const r = RAD[i];
          if (sp) g.drawImage(sp, X[i] - r, Y[i] - r, r * 2, r * 2);
          else { g.fillStyle = '#888'; g.beginPath(); g.arc(X[i], Y[i], r, 0, 7); g.fill(); }
        }
      }

      function drawPins(g) {
        for (let i = 0; i < pins.length; i++) {
          const p = pins[i]; if (p.gone) continue;
          const ox2 = p.ux * p.off, oy2 = p.uy * p.off;
          const ax = p.ax + ox2, ay = p.ay + oy2, bx = p.bx + ox2, by = p.by + oy2;
          g.globalAlpha = p.t > 0.7 ? Math.max(0, 1 - (p.t - 0.7) / 0.3) : 1;
          g.lineCap = 'round';
          g.strokeStyle = '#a8740a'; g.lineWidth = PR * 2 + 2.2;
          g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
          g.strokeStyle = '#ffd34d'; g.lineWidth = PR * 2;
          g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
          g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 1.2;
          const nx = -p.uy, ny = p.ux, sgn = ny > 0 ? -1 : 1;
          g.beginPath(); g.moveTo(ax + nx * 1.4 * sgn, ay + ny * 1.4 * sgn); g.lineTo(bx + nx * 1.4 * sgn, by + ny * 1.4 * sgn); g.stroke();
          const hx = bx + p.ux * 8, hy = by + p.uy * 8;
          g.strokeStyle = '#a8740a'; g.lineWidth = 6.5;
          g.beginPath(); g.arc(hx, hy, 8, 0, Math.PI * 2); g.stroke();
          g.strokeStyle = '#ffd34d'; g.lineWidth = 4.2;
          g.beginPath(); g.arc(hx, hy, 8, 0, Math.PI * 2); g.stroke();
          g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1.3;
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
        strokeWalls(g, WR * 2 + 2.5, '#7f8fb8');
        strokeWalls(g, WR * 2 - 0.5, '#eef4ff');
        strokeWalls(g, 1.4, '#ffffff');
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
