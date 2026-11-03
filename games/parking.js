// 泊車逃脫 — Car Parking Jam: tap a car, it drives in its arrow direction; clear the lot.
(function () {
  'use strict';
  const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];
  const ANG = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  const CAR_COLORS = ['#ff5d6c', '#4c9bff', '#4cd986', '#ffcc4d', '#b26bff', '#ff8f3d', '#3de0e0', '#ff7ac8', '#f2f2f7', '#5560c8'];

  // ---------- level model (shared with tools/check_parking.js) ----------
  function cellsOf(c) {
    const out = [];
    for (let i = 0; i < c.len; i++) out.push(c.h ? [c.x + i, c.y] : [c.x, c.y + i]);
    return out;
  }
  function frontCell(c) {
    if (c.dir === 0) return [c.x + c.len, c.y];
    if (c.dir === 2) return [c.x - 1, c.y];
    if (c.dir === 1) return [c.x, c.y + c.len];
    return [c.x, c.y - 1];
  }
  function buildGrid(cols, rows, obs, cars) {
    const grid = new Array(cols * rows).fill(-1);
    for (const o of obs) grid[o[1] * cols + o[0]] = -2;
    cars.forEach((c, i) => { if (!c.dead) for (const p of cellsOf(c)) grid[p[1] * cols + p[0]] = i; });
    return grid;
  }
  function probe(grid, cols, rows, c) {
    let [x, y] = frontCell(c);
    let gap = 0;
    while (x >= 0 && y >= 0 && x < cols && y < rows) {
      const v = grid[y * cols + x];
      if (v !== -1) return { free: false, gap, hit: v, hx: x, hy: y };
      gap++; x += DX[c.dir]; y += DY[c.dir];
    }
    return { free: true, gap };
  }
  // greedy removal in rounds; removing a car never blocks another, so greedy is exact
  function solve(L) {
    const cars = L.cars.map((c) => Object.assign({}, c, { dead: !!c.dead }));
    const grid = buildGrid(L.cols, L.rows, L.obs, cars);
    const order = [];
    let depth = 0;
    for (;;) {
      const free = [];
      cars.forEach((c, i) => { if (!c.dead && probe(grid, L.cols, L.rows, c).free) free.push(i); });
      if (!free.length) break;
      depth++;
      for (const i of free) {
        cars[i].dead = true; order.push(i);
        for (const p of cellsOf(cars[i])) grid[p[1] * L.cols + p[0]] = -1;
      }
    }
    const stuck = [];
    cars.forEach((c, i) => { if (!c.dead) stuck.push(i); });
    return { order, stuck, depth };
  }

  // diff 0 簡單 = original ladder; 1 普通 starts near old level 12; 2 困難 = full dense lots, many cones, deep chains
  function gen(level, rng, diff) {
    diff = diff || 0;
    const hard = diff === 2;
    level = diff === 1 ? Math.round(11 + level * 1.5) : hard ? 40 + level * 2 : level;
    const cols = Math.min(7, 4 + Math.floor((level + 1) / 4));
    const rows = Math.min(10, 5 + Math.floor(level / 3));
    const N = cols * rows;
    const density = hard ? 0.93 : Math.min(0.88, 0.42 + level * 0.035);
    const nObs = hard ? Math.min(6, 3 + Math.floor((level - 40) / 16)) : level < 6 ? 0 : Math.min(4, 1 + Math.floor((level - 6) / 6));
    const truckP = hard ? 0.34 : level < 3 ? 0 : Math.min(0.3, 0.08 + level * 0.012);
    const revP = level < 2 ? 0 : hard ? 0.4 : 0.3;
    const wantDepth = hard ? Math.min(12, 8 + Math.floor((level - 40) / 12)) : level < 3 ? 1 : Math.min(7, 2 + Math.floor(level / 4));
    let best = null, bestScore = -1;
    for (let tries = 0; tries < (hard ? 40 : 14); tries++) {
      const obs = [];
      for (let i = 0; i < nObs; i++) {
        const x = 1 + Math.floor(rng() * (cols - 2)), y = 1 + Math.floor(rng() * (rows - 2));
        if (!obs.some((o) => o[0] === x && o[1] === y)) obs.push([x, y]);
      }
      let cars = [];
      for (let round = 0; round < 6; round++) {
        let grid = buildGrid(cols, rows, obs, cars);
        let filled = grid.filter((v) => v !== -1).length - obs.length;
        let att = 0;
        while (filled < density * N && att++ < 500) {
          const len = rng() < truckP ? 3 : 2;
          const h = rng() < 0.5;
          const x = Math.floor(rng() * (h ? cols - len + 1 : cols));
          const y = Math.floor(rng() * (h ? rows : rows - len + 1));
          const c = { x, y, len, h, dir: h ? (rng() < 0.5 ? 0 : 2) : (rng() < 0.5 ? 1 : 3), rev: rng() < revP, color: CAR_COLORS[Math.floor(rng() * CAR_COLORS.length)] };
          if (cellsOf(c).some((p) => grid[p[1] * cols + p[0]] !== -1)) continue;
          cars.push(c);
          for (const p of cellsOf(c)) grid[p[1] * cols + p[0]] = cars.length - 1;
          filled += len;
        }
        const res = solve({ cols, rows, obs, cars });
        if (!res.stuck.length) break;
        const st = new Set(res.stuck);
        cars = cars.filter((c, i) => !st.has(i));
      }
      const res = solve({ cols, rows, obs, cars });
      if (res.stuck.length || !cars.length) continue;
      const fill = cars.reduce((s, c) => s + c.len, 0) / N;
      const score = Math.min(res.depth, wantDepth) * 2 + fill;
      if (score > bestScore) { bestScore = score; best = { cols, rows, obs, cars }; }
      if (res.depth >= wantDepth && fill >= density * 0.85) break;
    }
    if (!best) best = { cols, rows, obs: [], cars: [{ x: 0, y: 0, len: 2, h: true, dir: 2, rev: false, color: CAR_COLORS[0] }] };
    return best;
  }

  // ---------- path helpers ----------
  function roundCorners(pts, r) {
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const a = pts[i - 1], p = pts[i], b = pts[i + 1];
      const la = Math.hypot(p[0] - a[0], p[1] - a[1]) || 1, lb = Math.hypot(b[0] - p[0], b[1] - p[1]) || 1;
      const ra = Math.min(r, la / 2, lb / 2);
      const p1 = [p[0] - (p[0] - a[0]) / la * ra, p[1] - (p[1] - a[1]) / la * ra];
      const p2 = [p[0] + (b[0] - p[0]) / lb * ra, p[1] + (b[1] - p[1]) / lb * ra];
      for (let k = 0; k <= 10; k++) {
        const t = k / 10, u = 1 - t;
        out.push([u * u * p1[0] + 2 * u * t * p[0] + t * t * p2[0], u * u * p1[1] + 2 * u * t * p[1] + t * t * p2[1]]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  function makePath(pts) {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, cum, len: cum[cum.length - 1] };
  }
  function at(path, d, out) {
    const { pts, cum } = path;
    d = Math.max(0, Math.min(path.len, d));
    let i = 1;
    while (i < pts.length - 1 && cum[i] < d) i++;
    const seg = cum[i] - cum[i - 1] || 1, t = (d - cum[i - 1]) / seg;
    out[0] = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t;
    out[1] = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t;
    return out;
  }
  function lerpAng(a, b, t) {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
  }
  function newCanvas(w, h) {
    try {
      const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
    } catch (e) { return null; }
  }

  MG.register({
    id: 'parking', name: '泊車逃脫', icon: '🚗', color: '#4c9bff',
    gen, solve, cellsOf, probe, buildGrid,
    create(api) {
      const U = api.util;
      const L = gen(api.level, api.rng, api.diff || 0);
      const maxHearts = [3, 2, 1][api.diff || 0];
      const { cols, rows, obs } = L;
      const cars = L.cars.map((c, i) => Object.assign({}, c, { id: i, state: 'park', off: 0, t: 0, shake: 0, flash: 0, d: 0, v: 0, hit: false }));
      let grid = buildGrid(cols, rows, obs, cars);
      const obsShake = obs.map(() => 0);
      let hearts = maxHearts, shake = 0, endT = -1, endWin = false, time = 0, heartPop = 0, hintT = 0;
      const parts = [];
      let lay = null;
      const tmp = [0, 0], tmp2 = [0, 0];
      const dpr = Math.min(3, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
      const treeRng = MG.mulberry32(api.level * 31 + 7);
      const treeSeeds = [];
      for (let i = 0; i < 60; i++) treeSeeds.push([treeRng(), treeRng(), treeRng(), treeRng()]);

      function remaining() { return cars.filter((c) => c.state === 'park' || c.state === 'bump').length; }
      function setInfo() {
        if (api.level === 1 && !api.diff && remaining() === cars.length) api.info('點車子，它會照箭頭方向開走');
        else api.info('剩 ' + remaining() + ' 台車');
      }

      function layout() {
        const W = api.W, H = api.H, hud = 46;
        const cell = Math.min(W / (cols + 2.9), (H - hud - 8) / (rows + 2.9), 84);
        const road = cell * 0.9, curb = cell * 0.16;
        const lotW = cols * cell, lotH = rows * cell;
        const lotX = (W - lotW) / 2, lotY = hud + (H - hud - lotH) / 2;
        lay = {
          W, H, hud, cell, road, curb, lotX, lotY, lotW, lotH,
          top: lotY - curb - road / 2, bot: lotY + lotH + curb + road / 2,
          left: lotX - curb - road / 2, right: lotX + lotW + curb + road / 2,
        };
        buildBg();
        buildSprites();
      }

      // ---------- static background cache ----------
      function buildBg() {
        const { W, H } = lay;
        const cv = newCanvas(Math.round(W * dpr), Math.round(H * dpr));
        lay.bg = cv;
        if (!cv) return;
        const g = cv.getContext('2d');
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintBg(g);
      }
      function paintBg(g) {
        const { W, H, cell, road, curb, lotX, lotY, lotW, lotH } = lay;
        let gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, '#7fd36a'); gr.addColorStop(1, '#4fae4f');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(255,255,255,0.06)';
        for (let i = 0; i < 40; i++) {
          const s = treeSeeds[i % 60];
          g.beginPath(); g.ellipse(s[0] * W, s[1] * H, 10 + s[2] * 18, 4 + s[3] * 6, 0, 0, Math.PI * 2); g.fill();
        }
        // roads (full-length streets)
        const rT = lotY - curb - road, rB = lotY + lotH + curb, rL = lotX - curb - road, rR = lotX + lotW + curb;
        g.fillStyle = '#c9ccd6';
        g.fillRect(0, rT - 4, W, road + 8); g.fillRect(0, rB - 4, W, road + 8);
        g.fillRect(rL - 4, 0, road + 8, H); g.fillRect(rR - 4, 0, road + 8, H);
        g.fillStyle = '#545a68';
        g.fillRect(0, rT, W, road); g.fillRect(0, rB, W, road);
        g.fillRect(rL, 0, road, H); g.fillRect(rR, 0, road, H);
        g.strokeStyle = 'rgba(255,214,80,0.85)'; g.lineWidth = Math.max(2, cell * 0.05);
        g.setLineDash([cell * 0.3, cell * 0.25]);
        g.beginPath();
        g.moveTo(0, rT + road / 2); g.lineTo(W, rT + road / 2);
        g.moveTo(0, rB + road / 2); g.lineTo(W, rB + road / 2);
        g.moveTo(rL + road / 2, 0); g.lineTo(rL + road / 2, H);
        g.moveTo(rR + road / 2, 0); g.lineTo(rR + road / 2, H);
        g.stroke(); g.setLineDash([]);
        // curb + lot
        g.fillStyle = '#d9dce4';
        U.rr(g, lotX - curb, lotY - curb, lotW + curb * 2, lotH + curb * 2, curb * 1.4); g.fill();
        gr = g.createLinearGradient(0, lotY, 0, lotY + lotH);
        gr.addColorStop(0, '#6a7182'); gr.addColorStop(1, '#5a6070');
        g.fillStyle = gr;
        U.rr(g, lotX, lotY, lotW, lotH, curb); g.fill();
        // painted stall lines
        g.strokeStyle = 'rgba(255,255,255,0.32)'; g.lineWidth = Math.max(1.5, cell * 0.035);
        g.beginPath();
        for (let i = 1; i < cols; i++) { g.moveTo(lotX + i * cell, lotY + cell * 0.12); g.lineTo(lotX + i * cell, lotY + lotH - cell * 0.12); }
        for (let j = 1; j < rows; j++) for (let i = 0; i < cols; i++) {
          g.moveTo(lotX + i * cell + cell * 0.3, lotY + j * cell); g.lineTo(lotX + i * cell + cell * 0.7, lotY + j * cell);
        }
        g.stroke();
        // trees on grass
        for (let i = 0; i < 60; i++) {
          const s = treeSeeds[i];
          const x = s[0] * W, y = s[1] * H, r = cell * (0.22 + s[2] * 0.16);
          const inRoadH = (y + r > rT - 6 && y - r < rT + road + 6) || (y + r > rB - 6 && y - r < rB + road + 6);
          const inRoadV = (x + r > rL - 6 && x - r < rL + road + 6) || (x + r > rR - 6 && x - r < rR + road + 6);
          const inLot = x + r > lotX - curb && x - r < lotX + lotW + curb && y + r > lotY - curb && y - r < lotY + lotH + curb;
          if (inRoadH || inRoadV || inLot || y - r < lay.hud * 0.9) continue;
          g.fillStyle = 'rgba(0,0,0,0.18)';
          g.beginPath(); g.arc(x + r * 0.2, y + r * 0.3, r, 0, Math.PI * 2); g.fill();
          g.fillStyle = s[3] < 0.5 ? '#2f8f3e' : '#3a9e46';
          g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.18)';
          g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, r * 0.45, 0, Math.PI * 2); g.fill();
          if (s[2] > 0.7) {
            g.fillStyle = '#ff7ac8';
            g.beginPath(); g.arc(x + r * 0.35, y - r * 0.1, r * 0.13, 0, Math.PI * 2); g.fill();
          }
        }
      }

      // ---------- car sprites (nose to +x) ----------
      function buildSprites() {
        const { cell } = lay;
        for (const c of cars) {
          const Lp = c.len * cell - cell * 0.2, Wd = cell * 0.68;
          c.Lp = Lp; c.Wd = Wd;
          const pad = 4;
          const cv = newCanvas(Math.ceil((Lp + pad * 2) * dpr), Math.ceil((Wd + pad * 2) * dpr));
          c.spr = cv;
          if (!cv) continue;
          const g = cv.getContext('2d');
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          g.translate(Lp / 2 + pad, Wd / 2 + pad);
          paintCar(g, c, Lp, Wd);
        }
      }
      function paintCar(g, c, Lp, Wd) {
        const col = c.color, dark = U.shade(col, -0.35), light = U.shade(col, 0.35);
        const r = Wd * 0.36;
        // wheels
        g.fillStyle = '#23252c';
        const wl = Math.min(Lp * 0.2, Wd * 0.42), ww = Wd * 0.16;
        for (const wx of [Lp * 0.5 - Lp * 0.2, -Lp * 0.5 + Lp * 0.2]) for (const s of [-1, 1]) {
          U.rr(g, wx - wl / 2, s * (Wd / 2) - ww / 2 - s * 1, wl, ww, ww / 2); g.fill();
        }
        // body
        let gr = g.createLinearGradient(0, -Wd / 2, 0, Wd / 2);
        gr.addColorStop(0, light); gr.addColorStop(0.45, col); gr.addColorStop(1, dark);
        g.fillStyle = gr;
        U.rr(g, -Lp / 2, -Wd / 2 + 1, Lp, Wd - 2, r); g.fill();
        g.lineWidth = 1.5; g.strokeStyle = dark; g.stroke();
        const truck = c.len >= 3;
        if (truck) {
          // cargo box behind the cab
          const bx = -Lp / 2 + 2, bw = Lp * 0.62;
          g.fillStyle = U.shade(col, 0.55);
          U.rr(g, bx, -Wd / 2 + 3, bw, Wd - 6, r * 0.6); g.fill();
          g.strokeStyle = U.shade(col, -0.15); g.lineWidth = 1.2;
          g.beginPath();
          for (let i = 1; i < 5; i++) { g.moveTo(bx + bw * i / 5, -Wd / 2 + 6); g.lineTo(bx + bw * i / 5, Wd / 2 - 6); }
          g.stroke();
          // windshield
          const wx = Lp / 2 - Lp * 0.2;
          g.fillStyle = '#26364f';
          U.rr(g, wx - Lp * 0.07, -Wd * 0.36, Lp * 0.09, Wd * 0.72, 3); g.fill();
          g.fillStyle = 'rgba(160,220,255,0.55)';
          U.rr(g, wx - Lp * 0.055, -Wd * 0.3, Lp * 0.03, Wd * 0.4, 2); g.fill();
        } else {
          // windshield (front) and rear window, roof
          g.fillStyle = '#26364f';
          g.beginPath();
          g.moveTo(Lp * 0.16, -Wd * 0.38); g.lineTo(Lp * 0.3, -Wd * 0.32); g.lineTo(Lp * 0.3, Wd * 0.32); g.lineTo(Lp * 0.16, Wd * 0.38);
          g.closePath(); g.fill();
          g.beginPath();
          g.moveTo(-Lp * 0.24, -Wd * 0.36); g.lineTo(-Lp * 0.33, -Wd * 0.3); g.lineTo(-Lp * 0.33, Wd * 0.3); g.lineTo(-Lp * 0.24, Wd * 0.36);
          g.closePath(); g.fill();
          g.fillStyle = 'rgba(160,220,255,0.5)';
          g.beginPath(); g.moveTo(Lp * 0.2, -Wd * 0.3); g.lineTo(Lp * 0.25, -Wd * 0.27); g.lineTo(Lp * 0.25, -Wd * 0.05); g.lineTo(Lp * 0.2, -Wd * 0.05); g.closePath(); g.fill();
          gr = g.createLinearGradient(0, -Wd / 2, 0, Wd / 2);
          gr.addColorStop(0, U.shade(col, 0.5)); gr.addColorStop(1, U.shade(col, 0.05));
          g.fillStyle = gr;
          U.rr(g, -Lp * 0.24, -Wd * 0.36, Lp * 0.4, Wd * 0.72, Wd * 0.18); g.fill();
        }
        // lights
        g.fillStyle = '#fff6b0';
        g.beginPath(); g.ellipse(Lp / 2 - 3, -Wd * 0.3, 2.6, 3.4, 0, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.ellipse(Lp / 2 - 3, Wd * 0.3, 2.6, 3.4, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#ff3b4a';
        U.rr(g, -Lp / 2 + 1, -Wd * 0.38, 3, Wd * 0.18, 1.5); g.fill();
        U.rr(g, -Lp / 2 + 1, Wd * 0.2, 3, Wd * 0.18, 1.5); g.fill();
        // drive arrow (white with dark rim) on the roof
        const s = c.rev ? -1 : 1, ax = truck ? -Lp * 0.12 : -Lp * 0.04, al = Math.min(Lp * 0.36, Wd * 0.75), aw = Wd * 0.26;
        g.save(); g.translate(ax, 0); g.scale(s, 1);
        g.beginPath();
        g.moveTo(al / 2, 0); g.lineTo(al / 2 - aw * 1.1, -aw); g.lineTo(al / 2 - aw * 1.1, -aw * 0.4);
        g.lineTo(-al / 2, -aw * 0.4); g.lineTo(-al / 2, aw * 0.4); g.lineTo(al / 2 - aw * 1.1, aw * 0.4); g.lineTo(al / 2 - aw * 1.1, aw);
        g.closePath();
        g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,0.45)'; g.stroke();
        g.fillStyle = '#ffffff'; g.fill();
        g.restore();
      }

      // ---------- geometry ----------
      function carCenter(c, out) {
        const { cell, lotX, lotY } = lay;
        const w = c.h ? c.len : 1, h = c.h ? 1 : c.len;
        out[0] = lotX + (c.x + w / 2) * cell;
        out[1] = lotY + (c.y + h / 2) * cell;
        return out;
      }
      function exitPath(c) {
        const { W, H, left, right, top, bot, road } = lay;
        const p0 = carCenter(c, [0, 0]);
        const p1 = p0.slice();
        if (c.dir === 0) p1[0] = right; else if (c.dir === 2) p1[0] = left; else if (c.dir === 1) p1[1] = bot; else p1[1] = top;
        const m = lay.cell * 2;
        let p2;
        if (c.dir === 0 || c.dir === 2) p2 = [p1[0], p1[1] < H / 2 ? -m : H + m];
        else p2 = [p1[0] < W / 2 ? -m : W + m, p1[1]];
        // keep cars on the right-hand lane of the street
        const lane = road * 0.2;
        if (c.dir === 0 || c.dir === 2) { const sx = p2[1] < p1[1] ? 1 : -1; p1[0] += sx * lane; p2[0] = p1[0]; }
        else { const sy = p2[0] > p1[0] ? 1 : -1; p1[1] += sy * lane; p2[1] = p1[1]; }
        const pts = roundCorners([p0, p1, p2], road * 0.75);
        const path = makePath(pts);
        const straight = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
        const h1 = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
        return { path, c0: Math.max(0, straight - road * 0.75), c1: straight + road * 0.6, h1 };
      }

      function burst(x, y, n, colr, spd, life, size) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, v = spd * (0.4 + Math.random() * 0.8);
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life, size: size * (0.6 + Math.random() * 0.7), color: colr, grav: 0 });
        }
      }

      function tap(x, y) {
        if (api.ended || endT >= 0 || hearts <= 0) return;
        const { cell, lotX, lotY } = lay;
        let gx = Math.floor((x - lotX) / cell), gy = Math.floor((y - lotY) / cell);
        let id = -1;
        if (gx >= 0 && gy >= 0 && gx < cols && gy < rows) id = grid[gy * cols + gx];
        if (id < 0) {
          // forgiving: nearest car centre within 0.7 cell
          let best = cell * 0.75;
          for (const c of cars) {
            if (c.state !== 'park') continue;
            const p = carCenter(c, tmp);
            const dx = Math.abs(x - p[0]) - (c.h ? (c.len - 1) * cell / 2 : 0), dy = Math.abs(y - p[1]) - (c.h ? 0 : (c.len - 1) * cell / 2);
            const d = Math.hypot(Math.max(0, dx), Math.max(0, dy));
            if (d < best) { best = d; id = c.id; }
          }
        }
        if (id < 0) return;
        const c = cars[id];
        if (c.state !== 'park') return;
        c.flash = 1;
        const pr = probe(grid, cols, rows, c);
        if (pr.free) {
          api.sfx('pop');
          c.state = 'exit'; c.d = 0; c.v = lay.cell * 4; c.ex = exitPath(c);
          c.h0 = ANG[c.dir] + (c.rev ? Math.PI : 0);
          for (const p of cellsOf(c)) grid[p[1] * cols + p[0]] = -1;
          const p = carCenter(c, tmp);
          burst(p[0] - DX[c.dir] * c.Lp * 0.5, p[1] - DY[c.dir] * c.Lp * 0.5, 8, 'rgba(230,230,240,0.8)', 60, 0.5, 5);
          setInfo();
          if (!remaining()) endT = 0.9, endWin = true;
        } else {
          api.sfx('tap');
          c.state = 'bump'; c.t = 0; c.hit = false;
          c.reach = pr.gap * lay.cell + lay.cell * 0.12;
          c.blk = pr.hit; c.bx = pr.hx; c.by = pr.hy;
        }
      }

      layout();
      setInfo();

      return {
        update(dt) {
          time += dt;
          shake = Math.max(0, shake - dt * 3);
          heartPop = Math.max(0, heartPop - dt * 2.5);
          for (let i = 0; i < obsShake.length; i++) obsShake[i] = Math.max(0, obsShake[i] - dt * 2.5);
          for (const c of cars) {
            c.shake = Math.max(0, c.shake - dt * 2.5);
            c.flash = Math.max(0, c.flash - dt * 3);
            if (c.state === 'bump') {
              c.t += dt;
              const T1 = 0.08 + Math.min(0.2, c.reach / lay.cell * 0.05), T2 = T1 + 0.3;
              if (c.t < T1) { const k = c.t / T1; c.off = c.reach * k * k; }
              else {
                if (!c.hit) {
                  c.hit = true;
                  api.sfx('bad');
                  shake = 1; hearts--; heartPop = 1;
                  if (c.blk >= 0) cars[c.blk].shake = 1;
                  else {
                    const k = obs.findIndex((o) => o[0] === c.bx && o[1] === c.by);
                    if (k >= 0) obsShake[k] = 1;
                  }
                  const p = carCenter(c, tmp);
                  const hx = p[0] + DX[c.dir] * (c.Lp / 2 + c.reach), hy = p[1] + DY[c.dir] * (c.Lp / 2 + c.reach);
                  burst(hx, hy, 10, '#ffd34d', 160, 0.35, 3.5);
                  api.info(hearts > 0 ? '撞到了！剩 ' + hearts + ' 顆心' : '沒有心了');
                }
                const k = Math.min(1, (c.t - T1) / (T2 - T1));
                c.off = c.reach * (1 - U.easeOutCubic(k)) - Math.sin(k * Math.PI) * lay.cell * 0.06;
                if (c.t >= T2) {
                  c.off = 0; c.state = 'park';
                  if (hearts <= 0 && endT < 0) { endT = 0.25; endWin = false; }
                }
              }
            } else if (c.state === 'exit') {
              c.v = Math.min(lay.cell * 22, c.v + lay.cell * 40 * dt);
              c.d += c.v * dt;
              if (c.d >= c.ex.path.len) c.state = 'gone';
            }
          }
          for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue; }
            p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.grav * dt; p.vx *= 0.96; p.vy *= p.grav ? 1 : 0.96;
          }
          if (endT >= 0 && !api.ended) {
            endT -= dt;
            if (endT < 0) {
              if (endWin) {
                for (let i = 0; i < 70; i++) {
                  parts.push({ x: api.W * Math.random(), y: -10, vx: (Math.random() - 0.5) * 120, vy: 80 + Math.random() * 160, life: 2.2, max: 2.2, size: 4 + Math.random() * 3, color: CAR_COLORS[i % CAR_COLORS.length], grav: 120, conf: true });
                }
                api.win('停車場清空了！');
              } else api.lose('撞車太多次了');
            }
          }
        },
        draw(g) {
          if (!lay) return;
          if (api.W !== lay.W || api.H !== lay.H) layout();
          const { W, H, cell } = lay;
          g.fillStyle = '#4fae4f'; g.fillRect(0, 0, W, H);
          g.save();
          if (shake > 0) g.translate((Math.random() - 0.5) * 8 * shake, (Math.random() - 0.5) * 8 * shake);
          if (lay.bg && lay.bg.getContext) g.drawImage(lay.bg, 0, 0, W, H); else paintBg(g);
          // obstacles: traffic cones
          obs.forEach((o, i) => {
            const x = lay.lotX + (o[0] + 0.5) * cell + Math.sin(time * 60) * 3 * obsShake[i], y = lay.lotY + (o[1] + 0.5) * cell;
            const r = cell * 0.3;
            g.fillStyle = 'rgba(0,0,0,0.25)';
            g.beginPath(); g.ellipse(x + 2, y + 4, r, r * 0.7, 0, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#e8eaf0'; U.rr(g, x - r, y - r, r * 2, r * 2, r * 0.3); g.fill();
            g.fillStyle = '#ff7a1a';
            g.beginPath(); g.arc(x, y, r * 0.8, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#fff';
            g.beginPath(); g.arc(x, y, r * 0.5, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#ff7a1a';
            g.beginPath(); g.arc(x, y, r * 0.28, 0, Math.PI * 2); g.fill();
          });
          // cars: parked first, exiting on top
          for (let pass = 0; pass < 2; pass++) {
            for (const c of cars) {
              if (c.state === 'gone') continue;
              const exiting = c.state === 'exit';
              if ((pass === 1) !== exiting) continue;
              let x, y, a;
              if (exiting) {
                const ex = c.ex;
                at(ex.path, c.d, tmp);
                at(ex.path, c.d + 3, tmp2);
                const tang = Math.atan2(tmp2[1] - tmp[1], tmp2[0] - tmp[0]);
                x = tmp[0]; y = tmp[1];
                if (c.d < ex.c0) a = c.h0;
                else if (c.d > ex.c1) a = ex.h1;
                else a = lerpAng(c.h0, ex.h1, (c.d - ex.c0) / (ex.c1 - ex.c0));
                if (!c.rev && c.d < ex.c1 && c.d > ex.c0) a = tang;
              } else {
                carCenter(c, tmp);
                x = tmp[0] + DX[c.dir] * c.off; y = tmp[1] + DY[c.dir] * c.off;
                a = ANG[c.dir] + (c.rev ? Math.PI : 0);
                if (c.shake > 0) {
                  const s = Math.sin(time * 70) * c.shake * cell * 0.08;
                  x += c.h ? 0 : s; y += c.h ? s : 0;
                }
              }
              const pop = c.flash > 0.6 ? 1 + (c.flash - 0.6) * 0.15 : 1;
              g.save(); g.translate(x, y); g.rotate(a); g.scale(pop, pop);
              g.fillStyle = 'rgba(0,0,0,0.28)';
              U.rr(g, -c.Lp / 2 + 2, -c.Wd / 2 + 4, c.Lp, c.Wd, c.Wd * 0.36); g.fill();
              if (c.spr && c.spr.getContext) g.drawImage(c.spr, -c.Lp / 2 - 4, -c.Wd / 2 - 4, c.Lp + 8, c.Wd + 8);
              else paintCar(g, c, c.Lp, c.Wd);
              if (c.flash > 0) {
                g.fillStyle = 'rgba(255,255,255,' + (c.flash * 0.45).toFixed(3) + ')';
                U.rr(g, -c.Lp / 2, -c.Wd / 2, c.Lp, c.Wd, c.Wd * 0.36); g.fill();
              }
              g.restore();
            }
          }
          for (const p of parts) {
            const al = Math.max(0, p.life / p.max);
            g.globalAlpha = al;
            g.fillStyle = p.color;
            if (p.conf) { g.save(); g.translate(p.x, p.y); g.rotate(p.life * 6); g.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); g.restore(); }
            else { g.beginPath(); g.arc(p.x, p.y, p.size * (0.5 + al * 0.5), 0, Math.PI * 2); g.fill(); }
          }
          g.globalAlpha = 1;
          g.restore();
          // HUD: hearts
          g.fillStyle = 'rgba(0,0,0,0.22)';
          U.rr(g, 10, 8, 10 + maxHearts * 34, 32, 16); g.fill();
          for (let i = 0; i < maxHearts; i++) {
            const hx = 32 + i * 34, hy = 24;
            const s = (i === hearts && heartPop > 0) ? 1 + heartPop * 0.5 : 1;
            g.save(); g.translate(hx, hy); g.scale(s, s);
            drawHeart(g, 0, 0, 11, i < hearts ? '#ff4d6a' : 'rgba(255,255,255,0.3)');
            g.restore();
          }
          const left = remaining();
          g.fillStyle = 'rgba(0,0,0,0.22)';
          U.rr(g, W - 100, 8, 90, 32, 16); g.fill();
          U.text(g, '🚗 ' + left, W - 55, 25, 17, '#fff', 'center', 800);
        },
        down(x, y) { tap(x, y); },
        _test: {
          cellXY: (cx, cy) => [lay.lotX + (cx + 0.5) * lay.cell, lay.lotY + (cy + 0.5) * lay.cell],
          hearts: () => hearts, maxHearts,
        },
        resize() { layout(); },
      };
      function drawHeart(g, x, y, r, col) {
        g.fillStyle = col;
        g.beginPath();
        g.moveTo(x, y + r * 0.9);
        g.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.7, y - r * 1.2, x, y - r * 0.4);
        g.bezierCurveTo(x + r * 0.7, y - r * 1.2, x + r * 1.5, y - r * 0.1, x, y + r * 0.9);
        g.fill();
      }
    },
  });
})();
