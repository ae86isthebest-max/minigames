// 蛇吃方塊 — Snake vs Block: the ball-snake runs up by itself, drag to steer. Number blocks cost that many
// balls (the block counts down while you push), numbered balls make you longer, walls block sideways moves.
// Length 0 = lose. Levels: reach the finish line. 無盡: score = distance + block points smashed.
(function () {
  'use strict';

  const LANES = 5;
  const HR = 0.22;           // head radius (lane = 1 unit)
  const BH = 0.92;           // block height
  const SEG = 0.4;           // body spacing
  const HS = 16;             // max sideways speed (lanes / s)
  const HS_PLAN = 9;         // speed the solvability planner assumes (safety margin)
  const HUES = ['#4cd986', '#3de0e0', '#4c9bff', '#5560c8', '#b26bff', '#ff7ac8', '#ff8f3d', '#ff5d6c'];

  // ---------- art: 卡通 Q 版 (thick outlines, cartoon snake with a face, garden track) ----------
  const OL = '#2a1a14';
  function U_otext(g, str, x, y, size, col, lw, align) {
    g.font = '900 ' + size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
    g.textAlign = align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = lw || 4; g.strokeStyle = OL; g.strokeText(str, x, y);
    g.fillStyle = col; g.fillText(str, x, y);
  }
  let bgTile = null, bgKey = '';
  // one scrolling garden tile (4 lanes tall): checker grass lanes, flowers, pebbles, hedges on the sides
  function buildTile(W, ox, lw, U) {
    const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    const T = Math.round(lw * 4);
    const c = document.createElement('canvas');
    c.width = Math.ceil(W * dpr); c.height = Math.ceil(T * dpr);
    const x = c.getContext('2d'); x.scale(dpr, dpr);
    const tw = LANES * lw;
    // hedges
    x.fillStyle = '#3f9a4a'; x.fillRect(0, 0, W, T);
    for (let k = 0; k < 4; k++) for (const side of [0, 1]) {
      const bx = side ? ox + tw + 6 : ox - 6, by = k * lw + lw * 0.5;
      x.beginPath(); x.arc(bx, by, lw * 0.42, 0, 6.283); x.fillStyle = '#4fb85a'; x.fill(); x.lineWidth = 2.5; x.strokeStyle = OL; x.stroke();
      x.fillStyle = 'rgba(255,255,255,0.25)'; x.beginPath(); x.arc(bx - lw * 0.12, by - lw * 0.14, lw * 0.12, 0, 6.283); x.fill();
      if ((k + side) % 2 === 0) { x.beginPath(); x.arc(bx + (side ? 4 : -4), by + lw * 0.1, 4, 0, 6.283); x.fillStyle = '#ff7ab0'; x.fill(); x.lineWidth = 1.5; x.stroke(); }
    }
    // checker grass lanes
    for (let j = 0; j < 4; j++) for (let i = 0; i < LANES; i++) {
      x.fillStyle = (i + j) % 2 ? '#8fdc6a' : '#a2e57a';
      x.fillRect(ox + i * lw, j * lw, lw, lw);
    }
    // tufts, flowers, pebbles (fixed pattern so it scrolls seamlessly)
    for (let k = 0; k < 14; k++) {
      const px = ox + ((k * 0.37 + 0.13) % 1) * tw, py = ((k * 0.61 + 0.07) % 1) * T;
      if (k % 3 === 0) { x.strokeStyle = '#5fb04a'; x.lineWidth = 2; x.lineCap = 'round'; x.beginPath(); x.moveTo(px - 4, py); x.lineTo(px - 2, py - 7); x.moveTo(px, py); x.lineTo(px + 1, py - 9); x.moveTo(px + 4, py); x.lineTo(px + 3, py - 6); x.stroke(); x.lineCap = 'butt'; }
      else if (k % 3 === 1) { x.fillStyle = 'rgba(255,255,255,0.75)'; for (let a = 0; a < 5; a++) { x.beginPath(); x.arc(px + Math.cos(a * 1.257) * 3, py + Math.sin(a * 1.257) * 3, 2.2, 0, 6.283); x.fill(); } x.fillStyle = '#ffd34a'; x.beginPath(); x.arc(px, py, 1.8, 0, 6.283); x.fill(); }
      else { x.beginPath(); x.ellipse(px, py, 4, 3, 0, 0, 6.283); x.fillStyle = '#c9c2b0'; x.fill(); x.lineWidth = 1.2; x.strokeStyle = 'rgba(42,26,20,0.5)'; x.stroke(); }
    }
    // track edges
    x.fillStyle = OL; x.fillRect(ox - 3, 0, 3, T); x.fillRect(ox + tw, 0, 3, T);
    x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(ox, 0, 2, T); x.fillRect(ox + tw - 2, 0, 2, T);
    bgTile = { c, T };
  }
  function drawBackground(g, W, H, ox, lw, scroll, U) {
    const key = W + ',' + ox + ',' + lw;
    if (!bgTile || bgKey !== key) { bgKey = key; buildTile(W, ox, lw, U); }
    const T = bgTile.T, off = ((scroll * lw) % T + T) % T;
    for (let y = off - T; y < H; y += T) g.drawImage(bgTile.c, 0, y, W, T);
  }
  // golden food orb (pickups)
  function drawSnakeBall(g, x, y, r, head) {
    g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fillStyle = '#ffcc4d'; g.fill();
    g.fillStyle = '#f0a43a'; g.beginPath(); g.arc(x + r * 0.12, y + r * 0.15, r * 0.8, 0, Math.PI); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(x - r * 0.32, y - r * 0.35, r * 0.28, r * 0.17, -0.6, 0, 6.283); g.fill();
    g.beginPath(); g.arc(x, y, r, 0, 6.283); g.lineWidth = Math.max(2, r * 0.22); g.strokeStyle = OL; g.stroke();
  }
  // cartoon snake: one outlined tube of body balls, spots, big-eyed head with a flicking tongue
  function drawHero(g, segs, n, lenShown, sx, sy, r, t) {
    const lw = Math.max(2.2, r * 0.17), BODY = '#7ed957', DARK = '#5bb53e';
    const rad = (i) => r * (0.92 - Math.min(0.28, i * 0.012));
    // the balls are joined into one smooth body tube: all outlines first, then all fills
    const tube = (col, extra) => {
      if (n < 2) return;
      g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(sx, sy);
      for (let i = 1; i < n; i++) g.lineTo(segs[i * 2], segs[i * 2 + 1]);
      g.strokeStyle = col; g.lineWidth = rad(n - 1) * 1.7 + extra; g.stroke();
      g.lineCap = 'butt';
    };
    tube(OL, lw * 2);
    g.fillStyle = OL;
    for (let i = n - 1; i >= 1; i--) { g.beginPath(); g.arc(segs[i * 2], segs[i * 2 + 1], rad(i) + lw, 0, 6.283); g.fill(); }
    tube(BODY, 0);
    for (let i = n - 1; i >= 1; i--) {
      const x = segs[i * 2], y = segs[i * 2 + 1], rr = rad(i);
      g.fillStyle = BODY; g.beginPath(); g.arc(x, y, rr, 0, 6.283); g.fill();
      if (i % 2 === 0) { g.fillStyle = DARK; g.beginPath(); g.ellipse(x, y, rr * 0.55, rr * 0.4, 0, 0, 6.283); g.fill(); }
      else { g.fillStyle = '#ffe680'; g.beginPath(); g.arc(x - rr * 0.3, y - rr * 0.15, rr * 0.18, 0, 6.283); g.arc(x + rr * 0.32, y + rr * 0.1, rr * 0.14, 0, 6.283); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.ellipse(x - rr * 0.4, y - rr * 0.35, rr * 0.22, rr * 0.12, -0.6, 0, 6.283); g.fill();
    }
    // tongue (flicks out every ~1.4 s)
    const R = r * 1.3, flick = (t % 1.4) < 0.35;
    if (flick) {
      const L = R * (0.55 + 0.25 * Math.sin(t * 40));
      g.strokeStyle = OL; g.lineWidth = Math.max(4, R * 0.2); g.lineCap = 'round';
      g.beginPath(); g.moveTo(sx, sy - R * 0.8); g.lineTo(sx, sy - R * 0.8 - L); g.stroke();
      g.strokeStyle = '#ff4d6a'; g.lineWidth = Math.max(2, R * 0.1);
      g.beginPath(); g.moveTo(sx, sy - R * 0.8); g.lineTo(sx, sy - R * 0.8 - L); g.moveTo(sx, sy - R * 0.8 - L); g.lineTo(sx - R * 0.14, sy - R * 0.95 - L);
      g.moveTo(sx, sy - R * 0.8 - L); g.lineTo(sx + R * 0.14, sy - R * 0.95 - L); g.stroke(); g.lineCap = 'butt';
    }
    // head
    g.beginPath(); g.ellipse(sx, sy, R * 1.12, R, 0, 0, 6.283); g.fillStyle = BODY; g.fill();
    g.lineWidth = lw; g.strokeStyle = OL; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(sx - R * 0.5, sy - R * 0.5, R * 0.28, R * 0.14, -0.5, 0, 6.283); g.fill();
    const blink = (t % 3.4) > 3.25;
    for (let i = -1; i <= 1; i += 2) {
      const ex = sx + i * R * 0.45, ey = sy - R * 0.2;
      if (blink) { g.strokeStyle = OL; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(ex - R * 0.22, ey); g.lineTo(ex + R * 0.22, ey); g.stroke(); g.lineCap = 'butt'; continue; }
      g.beginPath(); g.ellipse(ex, ey, R * 0.3, R * 0.34, 0, 0, 6.283); g.fillStyle = '#fffbe8'; g.fill(); g.lineWidth = lw * 0.8; g.strokeStyle = OL; g.stroke();
      g.fillStyle = OL; g.beginPath(); g.arc(ex + i * R * 0.04, ey - R * 0.06, R * 0.17, 0, 6.283); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(ex + i * R * 0.04 - R * 0.06, ey - R * 0.13, R * 0.065, 0, 6.283); g.fill();
    }
    g.fillStyle = 'rgba(255,110,140,0.55)';
    g.beginPath(); g.ellipse(sx - R * 0.8, sy + R * 0.3, R * 0.17, R * 0.1, 0, 0, 6.283); g.ellipse(sx + R * 0.8, sy + R * 0.3, R * 0.17, R * 0.1, 0, 0, 6.283); g.fill();
    g.strokeStyle = OL; g.lineWidth = lw * 0.8; g.lineCap = 'round';
    g.beginPath(); g.arc(sx, sy + R * 0.32, R * 0.2, 0.25, Math.PI - 0.25); g.stroke(); g.lineCap = 'butt';
  }
  // chunky jelly block with a big outlined number
  function drawBlock(g, x, y, w, h, v, col, pulse, U) {
    const s = 1 + pulse * 0.06;
    const cx = x + w / 2, cy = y + h / 2;
    const ww = w * s, hh = h * s, rad = w * 0.18, lw = Math.max(2.5, w * 0.04);
    const x0 = cx - ww / 2, y0 = cy - hh / 2;
    g.fillStyle = 'rgba(0,0,0,0.2)'; U.rr(g, x0 + 3, y0 + 6, ww, hh, rad); g.fill();
    U.rr(g, x0, y0, ww, hh, rad); g.fillStyle = U.shade(col, -0.28); g.fill();
    U.rr(g, x0, y0, ww, hh - Math.max(4, hh * 0.1), rad); g.fillStyle = col; g.fill();
    g.fillStyle = 'rgba(255,255,255,0.45)'; U.rr(g, x0 + ww * 0.1, y0 + hh * 0.08, ww * 0.8, hh * 0.16, hh * 0.08); g.fill();
    U.rr(g, x0, y0, ww, hh, rad); g.lineWidth = lw; g.strokeStyle = OL; g.stroke();
    const fs = Math.min(w * 0.44, w * 1.6 / Math.max(2, String(v).length));
    U_otext(g, String(v), cx, cy + 1, Math.round(fs), '#ffffff', Math.max(3, fs * 0.16));
  }

  // ---------- level plan ----------
  // events: {t:'ball', y, v:[5]} | {t:'row', y, v:[5]} ; walls: {b (1..4), y0, y1}
  function blocksWall(walls, l1, l2, yA, yB) {
    // first y (>= yA) at which a wall between lanes l1/l2 starts that overlaps [yA, yB], or Infinity
    const lo = Math.min(l1, l2), hi = Math.max(l1, l2);
    let first = Infinity;
    if (lo === hi) return first;
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      if (w.b <= lo || w.b > hi) continue;
      if (w.y1 + HR < yA || w.y0 - HR > yB) continue;
      first = Math.min(first, w.y0 - HR);
    }
    return first;
  }
  function clearY(ev) { return ev ? (ev.t === 'row' ? ev.y + BH + HR + 0.05 : ev.y) : -1e9; }
  function arriveY(ev) { return ev.t === 'row' ? ev.y - HR - 0.05 : ev.y; }
  function canMove(plan, prev, ev, l1, l2) {
    if (l1 === l2) return true;
    const yA = clearY(prev), yB = arriveY(ev);
    const travel = Math.abs(l1 - l2) / HS_PLAN * plan.V + 0.15;
    if (yB - yA < travel) return false;
    return blocksWall(plan.walls, l1, l2, yA, yB) - yA >= travel;
  }
  // apply one event to a per-lane best-length array (−1 = dead)
  function dpStep(plan, prev, ev, best, out) {
    for (let l = 0; l < LANES; l++) {
      let b = -1;
      for (let k = 0; k < LANES; k++) if (best[k] > 0 && best[k] > b && canMove(plan, prev, ev, k, l)) b = best[k];
      if (b > 0) {
        if (ev.t === 'ball') b += ev.v[l];
        else if (ev.v[l]) b = b > ev.v[l] ? b - ev.v[l] : -1;
      }
      out[l] = b;
    }
    return out;
  }

  function makePlan(L, diff, endless, rng) {
    const Le = endless ? 30 : L + [0, 12, 30][diff];
    const plan = {
      V: Math.min(7.5, 4.2 + Math.min(1.5, Le * 0.03) + [0, 0.4, 0.9][diff]),
      start: [6, 5, 4][diff] + (endless ? 2 : 0),
      dist: endless ? Infinity : Math.min(320, [90, 130, 150][diff] + L * 4),
      events: [], walls: [], y: 7, best: null, lazy: 0, rows: 0, Le, diff, endless, rng,
    };
    plan.best = [plan.start, plan.start, plan.start, plan.start, plan.start];
    plan.lazy = plan.start;
    if (!endless) while (plan.y < plan.dist - 4) addSection(plan);
    return plan;
  }
  function lastEv(plan) { return plan.events.length ? plan.events[plan.events.length - 1] : null; }
  function pushEv(plan, ev) {
    const nb = [0, 0, 0, 0, 0];
    dpStep(plan, lastEv(plan), ev, plan.best, nb);
    plan.best = nb;
    if (plan.lazy > 0) {
      if (ev.t === 'ball') plan.lazy += ev.v[2];
      else if (ev.v[2]) plan.lazy = plan.lazy > ev.v[2] ? plan.lazy - ev.v[2] : 0;
    }
    plan.events.push(ev);
  }
  function ri(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }

  function addSection(plan) {
    const rng = plan.rng, d = plan.diff;
    const Le = plan.endless ? 30 + plan.y / 12 : plan.Le;
    if (plan.endless) plan.V = Math.min(8.5, 6 + plan.y / 400);
    let y = plan.y;
    const M0 = Math.max(...plan.best);
    // pickups (fewer and smaller on harder modes)
    const lines = rng() < [0.9, 0.75, 0.62][d] ? ri(rng, 1, 2) : 0;
    const bmax = [5, 4, 3][d] + (M0 < 6 ? 1 : 0);
    for (let i = 0; i < lines; i++) {
      const v = [0, 0, 0, 0, 0], n = ri(rng, 1, d === 2 ? 2 : 3);
      for (let k = 0; k < n; k++) v[ri(rng, 0, 4)] = ri(rng, 1, bmax);
      pushEv(plan, { t: 'ball', y, v });
      y += 1.7 + rng() * 1.2;
    }
    // optional wall corridor in front of the row
    const walled = Le > 3 && rng() < Math.min(0.55, 0.15 + Le * 0.01);
    let rowY = y + 1;
    if (walled) {
      const zl = 2.4 + rng() * 2.2;
      rowY = y + zl;
      const nw = Le > 20 && rng() < 0.5 ? 2 : 1;
      const used = [];
      for (let k = 0; k < nw; k++) {
        let b = ri(rng, 1, 4); if (used.indexOf(b) >= 0) b = b === 4 ? 1 : b + 1;
        used.push(b);
        plan.walls.push({ b, y0: rowY - zl, y1: rowY + BH });
      }
      if (rng() < 0.6) {
        const v = [0, 0, 0, 0, 0]; v[ri(rng, 0, 4)] = ri(rng, 1, bmax);
        pushEv(plan, { t: 'ball', y: rowY - zl * 0.45, v });
      }
    }
    // the block row, sized so that the best route keeps at least `keep` balls
    const prev = lastEv(plan), B = [0, 0, 0, 0, 0];
    const probe = { t: 'ball', y: rowY - HR - 0.05, v: [0, 0, 0, 0, 0] };
    dpStep(plan, prev, probe, plan.best, B);
    const M = Math.max(...B);
    const v = [0, 0, 0, 0, 0];
    const full = rng() < [0.45, 0.55, 0.65][d] || plan.rows < 1;
    const keep = Math.max([4, 3, 2][d], Math.ceil(M * [0.55, 0.4, 0.22][d]));
    const hi = Math.max(3, Math.round(M * [1.3, 1.6, 1.9][d] + 2));
    if (full) {
      const okL = []; for (let l = 0; l < LANES; l++) if (B[l] >= M - 1 && B[l] > 1) okL.push(l);
      let cl = okL.length ? okL[ri(rng, 0, okL.length - 1)] : B.indexOf(M);
      if (d === 2 && plan.lazy > 0 && cl === 2 && okL.length > 1) cl = okL[(okL.indexOf(2) + 1) % okL.length];
      for (let l = 0; l < LANES; l++) v[l] = ri(rng, 1, hi);
      v[cl] = Math.max(1, Math.min(v[cl], ri(rng, 1, Math.max(1, B[cl] - keep))));
      if (B[cl] - v[cl] < 1) v[cl] = Math.max(1, B[cl] - 1);
    } else {
      const nb = ri(rng, 2, d === 2 ? 4 : 3);
      const lanes = [0, 1, 2, 3, 4]; for (let i = 4; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = lanes[i]; lanes[i] = lanes[j]; lanes[j] = t; }
      for (let i = 0; i < nb; i++) v[lanes[i]] = ri(rng, 1, hi);
    }
    // 困難: a player who never steers must not survive
    if (d === 2 && plan.lazy > 0 && plan.rows >= 2) {
      let alt = -1; for (let l = 0; l < LANES; l++) if (l !== 2 && B[l] - v[l] >= 1 && (alt < 0 || B[l] - v[l] > B[alt] - v[alt])) alt = l;
      if (alt >= 0) v[2] = Math.max(v[2], plan.lazy + ri(rng, 0, 3));
    }
    // safety: never let every lane kill the best route
    let bestAfter = -1;
    for (let l = 0; l < LANES; l++) if (B[l] > 0 && B[l] - v[l] > bestAfter) bestAfter = B[l] - v[l];
    if (bestAfter < 1) { const l = B.indexOf(M); v[l] = Math.max(0, M - Math.max(1, keep)); }
    pushEv(plan, { t: 'row', y: rowY, v });
    plan.rows++;
    plan.y = rowY + BH + 2.8 + rng() * 2.2;
  }

  // full-route planner (shared with tools/check_snake.js): best lane per event from (lane, len) at event index i
  function route(plan, i0, lane, len, prevEv) {
    const evs = plan.events, n = evs.length - i0;
    if (n <= 0) return [];
    const best = [], from = [];
    let cur = [-1, -1, -1, -1, -1]; cur[lane] = len;
    let prev = prevEv;
    for (let i = 0; i < n; i++) {
      const ev = evs[i0 + i], nb = [-1, -1, -1, -1, -1], fr = [0, 0, 0, 0, 0];
      for (let l = 0; l < LANES; l++) {
        let b = -1, bk = -1;
        for (let k = 0; k < LANES; k++) if (cur[k] > 0 && cur[k] > b && canMove(plan, prev, ev, k, l)) { b = cur[k]; bk = k; }
        if (b > 0) { if (ev.t === 'ball') b += ev.v[l]; else if (ev.v[l]) b = b > ev.v[l] ? b - ev.v[l] : -1; }
        nb[l] = b; fr[l] = bk;
      }
      best.push(nb); from.push(fr); cur = nb; prev = ev;
    }
    let l = 0; for (let k = 1; k < LANES; k++) if (cur[k] > cur[l]) l = k;
    const lanes = new Array(n);
    for (let i = n - 1; i >= 0; i--) { lanes[i] = l; l = from[i][l]; }
    return lanes;
  }

  MG.register({
    id: 'snake', name: '蛇吃方塊', icon: '🐍', color: '#4cd986', endless: true,
    create(api) {
      const U = api.util, L = api.level, DIFF = api.diff || 0, ENDLESS = !!api.endless;
      const plan = makePlan(L, DIFF, ENDLESS, api.rng);
      if (ENDLESS) while (plan.y < 40) addSection(plan);
      let W, H, lw, ox, headSY;
      function layout() {
        W = api.W; H = api.H;
        lw = Math.max(20, Math.min((W - 16) / LANES, 92));
        ox = (W - lw * LANES) / 2;
        headSY = H * 0.72;
      }
      layout();

      const S = {
        x: 2.5, y: 0, tx: 2.5, len: plan.start, push: null, pushT: 0, dist: 0, smashed: 0, over: false, won: false,
        trail: [2.5, 0], drag: null, evI: 0, rowI: 0, start: 0.8, stopT: 0,
      };
      const rows = plan.events.filter((e) => e.t === 'row');
      const balls = [];
      function syncLists() {
        rows.length = 0; balls.length = 0;
        for (const e of plan.events) {
          if (e.t === 'row') { if (!e.cells) e.cells = e.v.map((v) => (v ? { v, max: v, dead: false, pulse: 0, flash: 0 } : null)); rows.push(e); }
          else { if (!e.items) e.items = e.v.map((v) => (v ? { v, taken: false } : null)); balls.push(e); }
        }
      }
      syncLists();
      const parts = []; for (let i = 0; i < 260; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 3 });
      let pCur = 0, anim = 0, shake = 0, lastInfo = '', banner = null, lastScore = -1, flash = 0;
      const floats = [];
      const segs = new Float32Array(2 * 64);
      let hintT = L === 1 && DIFF === 0 && !ENDLESS ? 6 : 0;

      function addPart(x, y, vx, vy, life, col, size) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size;
      }
      const SX = (x) => ox + x * lw;
      const SYw = (y) => headSY - (y - S.y) * lw;
      function score() { return Math.floor(S.dist) + S.smashed; }
      function blockCol(v) {
        const k = U.clamp(v / Math.max(1, S.len), 0, 1.4) / 1.4;
        return HUES[Math.min(HUES.length - 1, Math.floor(k * HUES.length))];
      }

      // ---------- physics ----------
      function overlapX(x, l) { return x + HR * 0.85 > l + 0.04 && x - HR * 0.85 < l + 0.96; }
      function rowsNear(cb) {
        while (S.rowI < rows.length && rows[S.rowI].y + BH < S.y - 2) S.rowI++;
        for (let i = S.rowI; i < rows.length; i++) { const r = rows[i]; if (r.y > S.y + 2) break; cb(r); }
      }
      function sideways(h) {
        let nx = S.x + U.clamp(S.tx - S.x, -HS * h, HS * h);
        nx = U.clamp(nx, HR, LANES - HR);
        // blocks in a row the head overlaps vertically
        rowsNear((r) => {
          if (!(S.y + HR > r.y - 0.001 && S.y - HR < r.y + BH)) return;
          for (let l = 0; l < LANES; l++) {
            const c = r.cells[l]; if (!c || c.dead) continue;
            if (!overlapX(nx, l)) continue;
            if (nx > S.x) nx = Math.min(nx, l + 0.04 - HR * 0.85 - 1e-4); else nx = Math.max(nx, l + 0.96 + HR * 0.85 + 1e-4);
          }
        });
        for (const w of plan.walls) {
          if (w.y1 + HR < S.y || w.y0 - HR > S.y) continue;
          if (S.x <= w.b && nx > w.b - HR - 0.03) nx = Math.min(nx, w.b - HR - 0.03);
          if (S.x >= w.b && nx < w.b + HR + 0.03) nx = Math.max(nx, w.b + HR + 0.03);
        }
        S.x = nx;
      }
      function forward(h) {
        if (S.push) return;
        let ny = S.y + plan.V * h;
        let hit = null;
        rowsNear((r) => {
          if (hit || ny + HR < r.y || S.y + HR > r.y + 0.05) return;
          let best = null, bo = 0;
          for (let l = 0; l < LANES; l++) {
            const c = r.cells[l]; if (!c || c.dead || !overlapX(S.x, l)) continue;
            const o = Math.min(S.x + HR, l + 1) - Math.max(S.x - HR, l);
            if (o > bo) { bo = o; best = l; }
          }
          if (best !== null) hit = { r, l: best };
        });
        // keep clear of a wall's lower end
        for (const w of plan.walls) {
          if (ny + HR < w.y0 || S.y + HR > w.y0 + 0.05) continue;
          if (Math.abs(S.x - w.b) < HR + 0.03) S.x = S.x < w.b ? w.b - HR - 0.03 : w.b + HR + 0.03;
        }
        if (hit) {
          ny = hit.r.y - HR;
          S.push = hit; S.pushT = 0.12;
          api.sfx('hit');
        }
        S.dist += ny - S.y;
        S.y = ny;
      }
      function pushing(h) {
        const p = S.push; if (!p) return;
        const c = p.r.cells[p.l];
        if (c.dead || !overlapX(S.x, p.l)) { S.push = null; return; }
        S.pushT -= h;
        const iv = 1 / Math.min(32, 11 + c.max * 0.6);
        while (S.pushT <= 0 && !c.dead && S.len > 0) {
          S.pushT += iv;
          c.v--; S.len--; S.smashed++; c.pulse = 1; c.flash = 0.06;
          const px = SX(p.l + 0.5), py = SYw(p.r.y);
          for (let i = 0; i < 3; i++) addPart(px + (Math.random() - 0.5) * lw * 0.6, py, (Math.random() - 0.5) * 160, 40 + Math.random() * 140, 0.35, '#ffcc4d', 4);
          api.sfx('tap');
          shake = Math.max(shake, 2);
          if (c.v <= 0) {
            c.dead = true; S.push = null;
            const col = blockCol(c.max);
            for (let i = 0; i < 16; i++) addPart(px + (Math.random() - 0.5) * lw * 0.8, py - lw * 0.4 + (Math.random() - 0.5) * lw * 0.8, (Math.random() - 0.5) * 380, (Math.random() - 0.8) * 320, 0.6, i % 3 ? col : '#ffffff', 5 + Math.random() * 5);
            api.sfx('pop'); shake = Math.max(shake, 5);
            if (c.max >= 10) floats.push({ x: px, y: py - lw * 0.5, t: 0, text: '💥 ' + c.max, col: '#ffe27a' });
          }
          if (S.len <= 0) { S.len = 0; dieNow(); return; }
        }
      }
      function pickups() {
        for (const e of balls) {
          if (e.y < S.y - 1 || e.y > S.y + 1) continue;
          for (let l = 0; l < LANES; l++) {
            const it = e.items[l]; if (!it || it.taken) continue;
            const dx = S.x - (l + 0.5), dy = S.y - e.y;
            if (dx * dx + dy * dy < (HR + 0.3) * (HR + 0.3)) {
              it.taken = true; S.len += it.v;
              api.sfx('good');
              const px = SX(l + 0.5), py = SYw(e.y);
              floats.push({ x: px, y: py, t: 0, text: '+' + it.v, col: '#7dffa8' });
              for (let i = 0; i < 8; i++) addPart(px, py, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, 0.45, '#ffcc4d', 4);
            }
          }
        }
      }
      function recordTrail() {
        const n = S.trail.length;
        const lx = S.trail[n - 2], ly = S.trail[n - 1];
        if (Math.hypot(S.x - lx, S.y - ly) >= 0.06) {
          S.trail.push(S.x, S.y);
          const need = Math.ceil((Math.min(S.len, 60) + 2) * SEG / 0.06) * 2 + 8;
          if (S.trail.length > need * 2) S.trail.splice(0, S.trail.length - need);
        }
      }
      function dieNow() {
        S.over = true; shake = 14; flash = 0.35;
        for (let i = 0; i < 30; i++) { const a = Math.random() * 6.283, v = 80 + Math.random() * 260; addPart(SX(S.x), headSY, Math.cos(a) * v, Math.sin(a) * v, 0.8, i % 2 ? '#ffcc4d' : '#ff5d6c', 6); }
        api.score(score());
        api.lose(ENDLESS ? '蛇沒了！跑了 ' + Math.floor(S.dist) + ' 格' : '蛇的長度歸零了！');
      }
      function winNow() {
        S.over = true; S.won = true;
        for (let i = 0; i < 90; i++) addPart(Math.random() * W, -10, (Math.random() - 0.5) * 200, Math.random() * 200, 2 + Math.random(), U.PALETTE[i % 9], 7);
        banner = { text: '抵達終點！', t: 0, col: '#7dffa8' };
        api.score(score());
        api.win('剩下 ' + S.len + ' 節抵達終點！');
      }

      function update(dt) {
        anim += dt;
        shake = Math.max(0, shake - dt * 30);
        flash = Math.max(0, flash - dt);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
          p.vy += 600 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        }
        for (let i = floats.length - 1; i >= 0; i--) { floats[i].t += dt; if (floats[i].t > 0.9) floats.splice(i, 1); }
        if (banner) { banner.t += dt; if (banner.t > 1.4) banner = null; }
        for (let i = S.rowI; i < rows.length && rows[i].y < S.y + 30; i++) for (const c of rows[i].cells) if (c) { c.pulse = Math.max(0, c.pulse - dt * 8); c.flash -= dt; }
        hintT -= dt;
        if (api.ended || S.over) return;
        if (S.start > 0) { S.start -= dt; return; }
        let left = dt;
        while (left > 1e-6 && !S.over) {
          const h = Math.min(left, 1 / 120); left -= h;
          sideways(h);
          pushing(h);
          if (S.over) break;
          forward(h);
          pickups();
          recordTrail();
          if (!ENDLESS && S.y >= plan.dist) { winNow(); break; }
        }
        if (ENDLESS) {
          while (plan.y < S.y + 40) { const n0 = plan.events.length; addSection(plan); for (let i = n0; i < plan.events.length; i++) { const e = plan.events[i]; if (e.t === 'row') { e.cells = e.v.map((v) => (v ? { v, max: v, dead: false, pulse: 0, flash: 0 } : null)); rows.push(e); } else { e.items = e.v.map((v) => (v ? { v, taken: false } : null)); balls.push(e); } } }
          while (balls.length && balls[0].y < S.y - 20) balls.shift();
          if (S.rowI > 50) { rows.splice(0, S.rowI - 5); S.rowI = 5; }
          while (plan.walls.length && plan.walls[0].y1 < S.y - 20) plan.walls.shift();
        }
        const sc = score();
        if (sc !== lastScore) { lastScore = sc; api.score(sc); }
        let info;
        if (L === 1 && DIFF === 0 && !ENDLESS && S.y < 25) info = '左右拖曳控制蛇，數字方塊會扣掉蛇的長度';
        else if (ENDLESS) info = '無盡：一直跑下去 · 分數 = 距離 + 撞碎的方塊';
        else info = '長度 ' + S.len + ' · 距離終點 ' + Math.max(0, Math.ceil(plan.dist - S.y)) + ' 格';
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
      }

      // ---------- drawing ----------
      function bodyPoints() {
        // walk back along the trail and place segments every SEG
        const n = Math.min(S.len, 30);
        segs[0] = S.x; segs[1] = S.y;
        let k = 1, need = SEG, i = S.trail.length - 2;
        let px = S.x, py = S.y;
        while (k < n && i >= 0) {
          const qx = S.trail[i], qy = S.trail[i + 1];
          const d = Math.hypot(px - qx, py - qy);
          if (d >= need) { const t = need / d; px += (qx - px) * t; py += (qy - py) * t; segs[k * 2] = px; segs[k * 2 + 1] = py; k++; need = SEG; }
          else { need -= d; px = qx; py = qy; i -= 2; }
        }
        while (k < n) { segs[k * 2] = segs[k * 2 - 2]; segs[k * 2 + 1] = segs[k * 2 - 1] - SEG; k++; }
        for (let j = 0; j < n; j++) { segs[j * 2] = SX(segs[j * 2]); segs[j * 2 + 1] = SYw(segs[j * 2 + 1]); }
        return n;
      }
      function draw(g) {
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        drawBackground(g, W, H, ox, lw, S.y, U);
        const yTop = S.y + headSY / lw + 1.5, yBot = S.y - (H - headSY) / lw - 1.5;
        // finish line
        if (!ENDLESS && plan.dist < yTop) {
          const fy = SYw(plan.dist), sq = lw / 4;
          for (let i = 0; i < LANES * 4; i++) for (let j = 0; j < 2; j++) {
            g.fillStyle = (i + j) % 2 ? '#ffffff' : '#2a1a14'; g.fillRect(ox + i * sq, fy - sq * (j + 1), sq, sq);
          }
          g.lineWidth = 3; g.strokeStyle = OL; g.strokeRect(ox, fy - sq * 2, LANES * lw, sq * 2);
          U.rr(g, W / 2 - 52, fy - sq * 2 - 32, 104, 30, 15); g.fillStyle = '#ff5d6c'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
          U_otext(g, '🏁 終點', W / 2, fy - sq * 2 - 17, 17, '#ffffff', 4);
        }
        // walls
        for (const w of plan.walls) {
          if (w.y1 < yBot || w.y0 > yTop) continue;
          const x = SX(w.b), y0 = SYw(w.y1), y1 = SYw(w.y0);
          g.fillStyle = 'rgba(0,0,0,0.18)'; U.rr(g, x - 3, y0 + 5, 10, y1 - y0, 5); g.fill();
          U.rr(g, x - 5, y0, 10, y1 - y0, 5); g.fillStyle = '#d99a55'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
          g.fillStyle = 'rgba(255,240,200,0.6)'; g.fillRect(x - 3, y0 + 4, 2, Math.max(0, y1 - y0 - 8));
          for (let py = y0 + 6; py < y1 - 4; py += lw * 0.5) { U.rr(g, x - 7, py, 14, 8, 3); g.fillStyle = '#b8743a'; g.fill(); g.lineWidth = 2; g.strokeStyle = OL; g.stroke(); }
        }
        // pickups
        for (const e of balls) {
          if (e.y < yBot || e.y > yTop) continue;
          for (let l = 0; l < LANES; l++) {
            const it = e.items[l]; if (!it || it.taken) continue;
            const x = SX(l + 0.5), y = SYw(e.y) + Math.sin(anim * 4 + l) * 2;
            drawSnakeBall(g, x, y, lw * 0.17, false);
            U_otext(g, String(it.v), x, y - lw * 0.36, Math.round(Math.max(12, lw * 0.24)), '#ffffff', 3.5);
          }
        }
        // blocks
        for (let i = S.rowI; i < rows.length; i++) {
          const r = rows[i]; if (r.y > yTop) break; if (r.y + BH < yBot) continue;
          const ys = SYw(r.y + BH);
          for (let l = 0; l < LANES; l++) {
            const c = r.cells[l]; if (!c || c.dead) continue;
            const shk = S.push && S.push.r === r && S.push.l === l ? (Math.random() - 0.5) * 3 : 0;
            drawBlock(g, SX(l) + 0.04 * lw + shk, ys, lw * 0.92, BH * lw, c.v, blockCol(c.v), c.pulse, U);
            if (c.flash > 0) { g.fillStyle = 'rgba(255,255,255,0.45)'; U.rr(g, SX(l) + 0.04 * lw, ys, lw * 0.92, BH * lw, lw * 0.16); g.fill(); }
          }
        }
        // snake
        if (S.len > 0 || !S.over) {
          const n = bodyPoints();
          drawHero(g, segs, n, S.len, SX(S.x), headSY, lw * HR, anim);
          const tx = SX(S.x), ty = headSY - lw * 0.5;
          U_otext(g, String(S.len), tx, ty, Math.round(Math.max(15, lw * 0.27)), '#ffffff', 4);
        }
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.6); g.fillStyle = p.col;
          g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        g.globalAlpha = 1;
        for (const f of floats) { g.globalAlpha = 1 - f.t / 0.9; U_otext(g, f.text, f.x, f.y - f.t * 40, 19, f.col, 4); }
        g.globalAlpha = 1;
        g.restore();
        if (flash > 0) { g.fillStyle = 'rgba(255,60,80,' + flash + ')'; g.fillRect(0, 0, W, H); }
        // HUD
        g.fillStyle = 'rgba(42,26,20,0.8)'; U.rr(g, 8, 6, W - 16, 34, 17); g.fill();
        U_otext(g, '🐍 ' + S.len, 20, 23, 17, '#ffcc4d', 3, 'left');
        if (ENDLESS) {
          U_otext(g, '分數 ' + score(), W / 2, 23, 16, '#ffffff', 3);
          U_otext(g, '最高 ' + Math.max(api.best || 0, score()), W - 20, 23, 14, '#ffe27a', 3, 'right');
        } else {
          const k = U.clamp(S.y / plan.dist, 0, 1), bx = W * 0.36, bw = W * 0.56;
          g.fillStyle = 'rgba(255,255,255,0.18)'; U.rr(g, bx, 17, bw, 12, 6); g.fill();
          g.fillStyle = '#7ed957'; U.rr(g, bx, 17, Math.max(12, bw * k), 12, 6); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.45)'; U.rr(g, bx + 3, 19, Math.max(6, bw * k - 6), 3, 1.5); g.fill();
          g.lineWidth = 2; g.strokeStyle = '#000'; U.rr(g, bx, 17, bw, 12, 6); g.stroke();
          U.text(g, '🏁', bx + bw + 4, 23, 13, '#fff', 'left', 800);
        }
        if (S.start > 0 && !S.over) {
          g.globalAlpha = Math.min(1, S.start * 2);
          U_otext(g, '準備！', W / 2, H * 0.45, 36, '#ffffff', 6);
          g.globalAlpha = 1;
        }
        if (hintT > 0 && !S.drag) {
          g.globalAlpha = Math.min(1, hintT) * (0.6 + 0.4 * Math.sin(anim * 5));
          const k = Math.sin(anim * 2.5);
          U.text(g, '👆', W / 2 + k * lw * 1.2, headSY + lw * 1.4, 34, '#fff', 'center', 900);
          U_otext(g, '← 拖曳 →', W / 2, headSY + lw * 2.3, 17, '#ffffff', 4);
          g.globalAlpha = 1;
        }
        if (banner) {
          const k = Math.min(1, banner.t / 0.3);
          g.globalAlpha = banner.t > 1.1 ? Math.max(0, 1 - (banner.t - 1.1) / 0.3) : 1;
          const sz = Math.min(40, W / 9) * U.easeOutBack(k);
          g.font = '900 ' + sz + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 7; g.strokeStyle = OL; g.lineJoin = 'round';
          g.strokeText(banner.text, W / 2, H * 0.4); g.fillStyle = banner.col; g.fillText(banner.text, W / 2, H * 0.4);
          g.globalAlpha = 1;
        }
      }

      // ---------- input: relative horizontal drag ----------
      function down(x) {
        if (api.ended || S.over) return;
        S.drag = { fx: x, hx: S.tx };
        hintT = 0;
      }
      function move(x) {
        if (!S.drag || S.over) return;
        S.tx = U.clamp(S.drag.hx + (x - S.drag.fx) / lw * 1.15, HR, LANES - HR);
      }
      function up(x) { move(x); S.drag = null; }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _s: S, _plan: plan,
        _k: { route, canMove, LANES, get lw() { return lw; }, HR, BH, rows, balls },
      };
    },
  });
})();
