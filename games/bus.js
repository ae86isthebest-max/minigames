// 巴士逃脫 — Bus Escape: tap buses out of the jammed lot to the station bays; passengers board by colour.
(function () {
  'use strict';
  const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];
  const ANG = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  const COLORS = ['#ff4f5e', '#3d8bff', '#3fcf6f', '#ffc63a', '#a35cff', '#ff8a2a', '#22d3d3', '#ff6fc0'];

  // ---------- level model (shared with tools/check_bus.js) ----------
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
  function buildGrid(cols, rows, buses) {
    const grid = new Array(cols * rows).fill(-1);
    buses.forEach((c, i) => { if (!c.dead) for (const p of cellsOf(c)) grid[p[1] * cols + p[0]] = i; });
    return grid;
  }
  function probe(grid, cols, rows, c) {
    let [x, y] = frontCell(c);
    let gap = 0;
    while (x >= 0 && y >= 0 && x < cols && y < rows) {
      const v = grid[y * cols + x];
      if (v !== -1) return { free: false, gap, hit: v };
      gap++; x += DX[c.dir]; y += DY[c.dir];
    }
    return { free: true, gap };
  }
  // random greedy exit order (removing a bus never blocks another, so any greedy run is exact)
  function exitOrder(cols, rows, buses, rng) {
    const bs = buses.map((b) => Object.assign({}, b, { dead: false }));
    const grid = buildGrid(cols, rows, bs);
    const order = [];
    let depth = 0;
    for (;;) {
      const free = [];
      bs.forEach((b, i) => { if (!b.dead && probe(grid, cols, rows, b).free) free.push(i); });
      if (!free.length) break;
      depth++;
      if (rng) {
        const i = free[Math.floor(rng() * free.length)];
        bs[i].dead = true; order.push(i);
        for (const p of cellsOf(bs[i])) grid[p[1] * cols + p[0]] = -1;
      } else {
        for (const i of free) { bs[i].dead = true; order.push(i); for (const p of cellsOf(bs[i])) grid[p[1] * cols + p[0]] = -1; }
      }
    }
    return { order, ok: order.length === buses.length, depth };
  }

  // diff 0 簡單 (original ladder), 1 普通 (starts around old level 12), 2 困難 (big lots, 8 colours,
  // only 4 bays with zero slack, hidden-colour buses, a countdown)
  function params(level, diff) {
    if (diff === 1) {
      const e = Math.round(11 + level * 1.5);
      return {
        cols: Math.min(7, 4 + Math.floor(e / 4)), rows: Math.min(8, 4 + Math.floor(e / 3)),
        nC: Math.min(COLORS.length, 5 + Math.floor(level / 6)), bays: 4, win: level < 6 ? 3 : 4,
        density: Math.min(0.88, 0.5 + e * 0.03), maxBus: 99, longP: 0.35, hidden: 0,
        wantDepth: Math.min(7, 4 + Math.floor(level / 8)), time: 0,
      };
    }
    if (diff === 2) {
      return {
        cols: 7, rows: Math.min(9, 8 + Math.floor(level / 8)), nC: COLORS.length, bays: 4, win: level < 10 ? 3 : 4,
        density: 0.9, maxBus: 99, longP: 0.38, hidden: Math.min(0.5, 0.25 + level * 0.01),
        wantDepth: Math.min(9, 6 + Math.floor(level / 8)), time: 1,
      };
    }
    return {
      hidden: 0, time: 0, wantDepth: Math.min(6, 1 + Math.floor(level / 3)),
      cols: Math.min(7, 4 + Math.floor(level / 4)),
      rows: Math.min(8, 4 + Math.floor(level / 3)),
      nC: level === 1 ? 2 : Math.min(COLORS.length, 3 + Math.floor(level / 4)),
      bays: level < 12 ? 4 : 5,
      win: level === 1 ? 1 : level < 5 ? 2 : level < 12 ? 3 : level < 25 ? 4 : 5,
      density: Math.min(0.86, 0.5 + level * 0.03),
      maxBus: level === 1 ? 3 : level === 2 ? 5 : level === 3 ? 7 : 99,
      longP: level < 3 ? 0.2 : 0.35,
    };
  }

  function gen(level, rng, diff) {
    const P = params(level, diff || 0);
    const { cols, rows } = P;
    const N = cols * rows;
    let buses = [];
    let bestDepth = -1, best = null;
    for (let tries = 0; tries < 8; tries++) {
      buses = [];
      for (let round = 0; round < 6; round++) {
        const grid = buildGrid(cols, rows, buses);
        let filled = buses.reduce((s, b) => s + b.len, 0), att = 0;
        while (filled < P.density * N && buses.length < P.maxBus && att++ < 500) {
          const len = rng() < P.longP ? 3 : 2;
          const h = rng() < 0.5;
          const x = Math.floor(rng() * (h ? cols - len + 1 : cols));
          const y = Math.floor(rng() * (h ? rows : rows - len + 1));
          const b = { x, y, len, h, dir: h ? (rng() < 0.5 ? 0 : 2) : (rng() < 0.5 ? 1 : 3) };
          if (cellsOf(b).some((p) => grid[p[1] * cols + p[0]] !== -1)) continue;
          buses.push(b);
          for (const p of cellsOf(b)) grid[p[1] * cols + p[0]] = buses.length - 1;
          filled += len;
        }
        // prune buses that can never leave
        const res = exitOrder(cols, rows, buses, null);
        if (res.ok) break;
        const gone = new Set(res.order);
        buses = buses.filter((b, i) => gone.has(i));
      }
      const res = exitOrder(cols, rows, buses, null);
      if (!res.ok || !buses.length) continue;
      if (res.depth > bestDepth) { bestDepth = res.depth; best = buses; }
      if (res.depth >= P.wantDepth) break;
    }
    buses = best || [{ x: 0, y: 0, len: 2, h: true, dir: 2 }];
    // colours: every colour used at least once (when possible), rest random
    const nC = Math.min(P.nC, buses.length);
    const cols4 = [];
    for (let i = 0; i < buses.length; i++) cols4.push(i < nC ? i : Math.floor(rng() * nC));
    for (let i = cols4.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = cols4[i]; cols4[i] = cols4[j]; cols4[j] = t; }
    buses.forEach((b, i) => { b.color = cols4[i]; b.cap = b.len === 3 ? 6 : 4; b.hidden = rng() < P.hidden; });
    // a valid exit order, then a passenger queue that this order serves with `win` bays
    const order = exitOrder(cols, rows, buses, rng).order;
    const rem = buses.map((b) => b.cap);
    const active = [];
    const queue = [];
    let next = 0;
    const k = Math.min(P.win, P.bays);
    for (;;) {
      while (active.length < k && next < order.length) active.push(order[next++]);
      if (!active.length) break;
      const pick = active[Math.floor(rng() * active.length)];
      const c = buses[pick].color;
      const tgt = active.find((i) => buses[i].color === c && rem[i] > 0);
      queue.push(c);
      rem[tgt]--;
      if (rem[tgt] === 0) active.splice(active.indexOf(tgt), 1);
    }
    return { cols, rows, buses, queue, bays: P.bays, order, nC, timeLimit: P.time ? Math.round(30 + queue.length * 1.3) : 0 };
  }

  // ---------- path helpers ----------
  function roundCorners(pts, r) {
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const a = pts[i - 1], p = pts[i], b = pts[i + 1];
      const la = Math.hypot(p[0] - a[0], p[1] - a[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
      if (la < 0.5 || lb < 0.5) { out.push(p); continue; }
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

  MG.register({
    id: 'bus', name: '巴士逃脫', icon: '🚌', color: '#ff8f3d',
    gen, exitOrder, cellsOf, probe, buildGrid,
    create(api) {
      const U = api.util;
      const LV = gen(api.level, api.rng, api.diff || 0);
      const { cols, rows } = LV;
      const NB = LV.bays;
      const buses = LV.buses.map((b, i) => Object.assign({}, b, {
        id: i, col: COLORS[b.color], state: 'lot', off: 0, t: 0, shake: 0, flash: 0, d: 0, v: 0,
        filled: 0, incoming: 0, rank: -1, bay: -1, hit: false, wait: 0,
      }));
      const grid = buildGrid(cols, rows, buses);
      const queue = LV.queue.slice();
      const total = queue.length;
      const bays = [];
      for (let i = 0; i < NB; i++) bays.push({ bus: -1, flash: 0 });
      const walkers = [];
      const parts = [];
      const timeLimit = LV.timeLimit || 0;
      let timeLeft = timeLimit, lastSec = -1;
      let rankN = 0, boardCD = 0.3, qShift = 0, time = 0, shake = 0, endT = -1, endWin = false, fullFlash = 0, delivered = 0;
      let lay = null;
      const dpr = Math.min(3, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
      const tmp = [0, 0], tmp2 = [0, 0];

      function setInfo() {
        if (api.level === 1 && !api.diff && delivered === 0 && rankN === 0) api.info('點巴士開到車站，同色乘客會自動上車');
        else api.info('乘客 ' + delivered + ' / ' + total + (timeLimit ? '　⏱ ' + Math.ceil(timeLeft) + ' 秒' : ''));
      }

      // ---------- layout ----------
      function layout() {
        const W = api.W, H = api.H;
        const qH = 64;
        const bayW = Math.min(86, (W - 20) / NB, H * 0.12);
        const bayLen = bayW * 1.32;
        const bayY0 = qH + 6;
        const bayCy = bayY0 + bayLen / 2;
        const road = Math.max(28, Math.min(44, W * 0.085));
        const T = bayY0 + bayLen + road / 2;
        const gap = 10;
        const lotTop = T + road / 2 + gap;
        const availH = H - lotTop - road - gap - 6;
        const cell = Math.max(10, Math.min((W - 2 * (road + gap + 6)) / cols, availH / rows, 66));
        const lotW = cols * cell, lotH = rows * cell;
        const lotX = (W - lotW) / 2, lotY = lotTop + Math.max(0, (availH - lotH) / 2);
        const bx0 = (W - NB * bayW) / 2;
        const bayX = [];
        for (let i = 0; i < NB; i++) bayX.push(bx0 + (i + 0.5) * bayW);
        const L = Math.max(road / 2, Math.min(lotX - gap - road / 2, bayX[0])), R = Math.min(W - road / 2, Math.max(lotX + lotW + gap + road / 2, bayX[NB - 1]));
        const B = lotY + lotH + gap + road / 2;
        lay = { W, H, qH, bayW, bayLen, bayY0, bayCy, road, T, gap, cell, lotX, lotY, lotW, lotH, bayX, L, R, B };
        lay.sp = Math.max(26, Math.min(42, (W - 84) / 9));
        lay.ps = Math.min(2, lay.sp / 18.5);
        for (const b of buses) {
          b.lotLp = b.len * cell - cell * 0.16; b.lotWd = cell * 0.72;
          b.bayLp = b.len === 3 ? bayLen * 0.92 : bayLen * 0.7; b.bayWd = bayW * 0.56;
        }
        let cv = null;
        try { cv = document.createElement('canvas'); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); } catch (e) { cv = null; }
        lay.bg = cv;
        if (cv && cv.getContext) { const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); paintBg(g); }
      }

      // ---------- cartoon helpers (卡通 Q 版) ----------
      const OL = '#2a1a14';
      function olStroke(g, lw) { g.lineWidth = lw; g.strokeStyle = OL; g.lineJoin = 'round'; g.stroke(); }
      function blob(g, x, y, rx, ry, fill, lw) {
        g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = fill; g.fill();
        if (lw !== 0) olStroke(g, lw || 2);
      }
      function otext(g, str, x, y, size, color) {
        g.font = '900 ' + size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = Math.max(2.5, size * 0.22); g.strokeStyle = OL; g.lineJoin = 'round';
        g.strokeText(str, x, y); g.fillStyle = color; g.fillText(str, x, y);
      }

      function paintBg(g) {
        const { W, H, qH, bayW, bayLen, bayY0, road, T, L, R, B, lotX, lotY, lotW, lotH, cell, bayX, gap } = lay;
        // grass meadow with little tufts
        let gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, '#9ee27a'); gr.addColorStop(1, '#6cc35c');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        const tr = MG.mulberry32(api.level * 13 + 5);
        g.fillStyle = 'rgba(40,110,40,0.22)';
        for (let i = 0; i < 70; i++) {
          const x = tr() * W, y = T + tr() * (H - T);
          g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x - 1, y - 6); g.lineTo(x, y); g.lineTo(x + 2, y - 5); g.lineTo(x + 3, y); g.fill();
        }
        // station platform: cream tiles
        gr = g.createLinearGradient(0, 0, 0, qH);
        gr.addColorStop(0, '#fff6e2'); gr.addColorStop(1, '#f4ddb6');
        g.fillStyle = gr; g.fillRect(0, 0, W, qH);
        g.strokeStyle = 'rgba(160,110,60,0.2)'; g.lineWidth = 1.5;
        g.beginPath();
        for (let x = 13; x < W; x += 26) { g.moveTo(x, 12); g.lineTo(x, qH - 6); }
        g.moveTo(0, qH * 0.62); g.lineTo(W, qH * 0.62);
        g.stroke();
        // platform edge (yellow safety strip)
        g.fillStyle = '#c9a678'; g.fillRect(0, qH - 7, W, 7);
        g.fillStyle = '#ffd34d'; g.fillRect(0, qH - 5, W, 3);
        g.fillStyle = OL; g.fillRect(0, qH - 1, W, 2);
        // bay apron
        g.fillStyle = '#585e70';
        g.fillRect(0, bayY0 - 2, W, bayLen + 4);
        for (let i = 0; i < NB; i++) {
          const x = bayX[i] - bayW / 2;
          U.rr(g, x + 5, bayY0 + 4, bayW - 10, bayLen - 8, 8);
          g.fillStyle = 'rgba(255,255,255,0.06)'; g.fill();
          g.setLineDash([6, 5]); g.lineWidth = 2; g.strokeStyle = 'rgba(255,214,90,0.5)'; g.stroke(); g.setLineDash([]);
          g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.lineCap = 'round';
          g.beginPath();
          g.moveTo(x + 2, bayY0 + bayLen - 3); g.lineTo(x + 2, bayY0 + 3);
          g.moveTo(x + bayW - 2, bayY0 + 3); g.lineTo(x + bayW - 2, bayY0 + bayLen - 3);
          g.stroke(); g.lineCap = 'butt';
          U.text(g, String(i + 1), bayX[i], bayY0 + bayLen * 0.5, Math.min(26, bayW * 0.34), 'rgba(255,255,255,0.16)', 'center', 900);
        }
        // ring road: dark outline, light curb, asphalt, yellow dashes
        const roadRects = (e) => {
          g.fillRect(0, T - road / 2 - e, W, road + e * 2);
          g.fillRect(L - road / 2 - e, T, road + e * 2, B - T + road / 2 + e);
          g.fillRect(R - road / 2 - e, T, road + e * 2, B - T + road / 2 + e);
          g.fillRect(L - road / 2 - e, B - road / 2 - e, R - L + road + e * 2, road + e * 2);
        };
        g.fillStyle = OL; roadRects(5);
        g.fillStyle = '#eef0e6'; roadRects(3);
        g.fillStyle = '#4c5163'; roadRects(0);
        g.strokeStyle = '#ffe07a'; g.lineWidth = 2.5; g.setLineDash([10, 9]); g.lineCap = 'round';
        g.beginPath();
        g.moveTo(0, T); g.lineTo(W, T);
        g.moveTo(L, T); g.lineTo(L, B); g.lineTo(R, B); g.lineTo(R, T);
        g.stroke(); g.setLineDash([]); g.lineCap = 'butt';
        // lot: chunky outlined parking pad
        const pad = gap * 0.5;
        g.fillStyle = 'rgba(0,0,0,0.2)';
        U.rr(g, lotX - pad + 3, lotY - pad + 5, lotW + pad * 2, lotH + pad * 2, 14); g.fill();
        g.fillStyle = '#e9e3cf';
        U.rr(g, lotX - pad, lotY - pad, lotW + pad * 2, lotH + pad * 2, 14); g.fill(); olStroke(g, 3);
        gr = g.createLinearGradient(0, lotY, 0, lotY + lotH);
        gr.addColorStop(0, '#6a7086'); gr.addColorStop(1, '#585e73');
        g.fillStyle = gr;
        U.rr(g, lotX, lotY, lotW, lotH, 9); g.fill(); olStroke(g, 2);
        // bushes, trees and flowers outside the roads
        for (let i = 0; i < 46; i++) {
          const x = tr() * W, y = T + road / 2 + tr() * (H - T - road / 2), r = 7 + tr() * 9, kind = tr();
          const onRoad = (Math.abs(x - L) < road / 2 + r + 6 || Math.abs(x - R) < road / 2 + r + 6) ||
            (Math.abs(y - B) < road / 2 + r + 6 && x > L - road && x < R + road) || (y - r < T + road / 2 + 6);
          const inLot = x + r > lotX - gap && x - r < lotX + lotW + gap && y + r > lotY - gap && y - r < lotY + lotH + gap;
          if (onRoad || inLot) continue;
          if (kind < 0.25) {
            const pc = ['#ff7aa8', '#ffd34d', '#ffffff', '#b98cff'][Math.floor(tr() * 4)];
            for (let k = 0; k < 5; k++) { const a = k * 1.2566; blob(g, x + Math.cos(a) * 3.2, y + Math.sin(a) * 3.2, 2.6, 2.6, pc, 1.2); }
            blob(g, x, y, 2, 2, '#ff9a3a', 1.2);
            continue;
          }
          g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(x + 2, y + r * 0.8, r * 1.05, r * 0.45, 0, 0, Math.PI * 2); g.fill();
          if (kind < 0.6) {
            // round bush: three puffs, outlined as one shape
            const puffs = (e) => {
              g.beginPath();
              g.moveTo(x - r * 0.55 + r * 0.65 - e, y + r * 0.15); g.arc(x - r * 0.55, y + r * 0.15, r * 0.65 - e, 0, Math.PI * 2);
              g.moveTo(x + r * 0.55 + r * 0.65 - e, y + r * 0.15); g.arc(x + r * 0.55, y + r * 0.15, r * 0.65 - e, 0, Math.PI * 2);
              g.moveTo(x + r * 0.8 - e, y - r * 0.2); g.arc(x, y - r * 0.2, r * 0.8 - e, 0, Math.PI * 2);
            };
            puffs(0); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
            g.fillStyle = '#3fa64a'; puffs(0); g.fill();
            g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.ellipse(x - r * 0.2, y - r * 0.5, r * 0.32, r * 0.18, -0.4, 0, Math.PI * 2); g.fill();
          } else {
            // tree crown from above
            blob(g, x, y, r * 1.05, r, '#2f9444', 2.5);
            blob(g, x - r * 0.25, y - r * 0.2, r * 0.55, r * 0.5, '#55bf55', 0);
            g.fillStyle = 'rgba(255,255,255,0.32)'; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.4, r * 0.25, r * 0.14, -0.4, 0, Math.PI * 2); g.fill();
          }
        }
      }

      // ---------- geometry ----------
      function lotCenter(b, out) {
        const { cell, lotX, lotY } = lay;
        const w = b.h ? b.len : 1, h = b.h ? 1 : b.len;
        out[0] = lotX + (b.x + w / 2) * cell; out[1] = lotY + (b.y + h / 2) * cell;
        return out;
      }
      function ringPos(x, y, side) {
        const { L, R, T, B } = lay, w = R - L, h = B - T;
        if (side === 0) return x - L;
        if (side === 1) return w + (y - T);
        if (side === 2) return w + h + (R - x);
        return 2 * w + h + (B - y);
      }
      function drivePath(b) {
        const { L, R, T, B, road } = lay;
        const p0 = lotCenter(b, [0, 0]);
        const E = p0.slice();
        let side;
        if (b.dir === 3) { E[1] = T; side = 0; } else if (b.dir === 0) { E[0] = R; side = 1; } else if (b.dir === 1) { E[1] = B; side = 2; } else { E[0] = L; side = 3; }
        const bx = lay.bayX[b.bay];
        const w = R - L, h = B - T, P = 2 * (w + h);
        const pE = ringPos(E[0], E[1], side), pT = ringPos(bx, T, 0);
        const corners = [[L, T, 0], [R, T, w], [R, B, w + h], [L, B, 2 * w + h]];
        const mod = (v) => ((v % P) + P) % P;
        const cw = mod(pT - pE), ccw = mod(pE - pT);
        const pts = [p0, E];
        if (cw <= ccw) {
          corners.map((c) => [c, mod(c[2] - pE)]).filter((c) => c[1] > 0.5 && c[1] < cw - 0.5).sort((a, b2) => a[1] - b2[1]).forEach((c) => pts.push([c[0][0], c[0][1]]));
        } else {
          corners.map((c) => [c, mod(pE - c[2])]).filter((c) => c[1] > 0.5 && c[1] < ccw - 0.5).sort((a, b2) => a[1] - b2[1]).forEach((c) => pts.push([c[0][0], c[0][1]]));
        }
        pts.push([bx, T]);
        pts.push([bx, lay.bayCy]);
        const clean = [pts[0]];
        for (let i = 1; i < pts.length; i++) {
          const q = clean[clean.length - 1];
          if (Math.hypot(pts[i][0] - q[0], pts[i][1] - q[1]) > 0.5) clean.push(pts[i]);
        }
        return makePath(roundCorners(clean, road * 0.8));
      }
      function leavePath(b) {
        const { T, road, W } = lay;
        const bx = lay.bayX[b.lastBay];
        const p0 = [bx, lay.bayCy], p1 = [bx, T + road * 0.18], p2 = [W + 160, T + road * 0.18];
        const path = makePath(roundCorners([p0, p1, p2], road * 0.7));
        const straight = p1[1] - p0[1];
        return { path, c0: Math.max(0, straight - road * 0.7), c1: straight + road * 0.4 };
      }
      function seatLocal(b, i, Lp, Wd, out) {
        const n = b.cap / 2, col = Math.floor(i / 2), row = i % 2;
        const span = Lp * 0.6, x0 = -Lp / 2 + Lp * 0.1;
        out[0] = x0 + (n - 1 - col + 0.5) * span / n;
        out[1] = (row ? 1 : -1) * Wd * 0.19;
        return out;
      }

      // ---------- drawing ----------
      function drawBus(g, b, x, y, a, Lp, Wd, inLot) {
        // chubby cartoon bus seen from above, nose at +x: thick outline, big windshield eyes, gloss strip
        const masked = b.hidden && !b.revealed;
        const col = masked ? '#9aa0b0' : b.col, dark = U.shade(col, -0.3), light = U.shade(col, 0.35);
        const lw = Math.max(1.6, Math.min(3.2, Wd * 0.075));
        const rad = Wd * 0.3;
        g.save(); g.translate(x, y); g.rotate(a);
        g.fillStyle = 'rgba(0,0,0,0.25)';
        U.rr(g, -Lp / 2 + 2, -Wd / 2 + 4, Lp, Wd, rad); g.fill();
        // open-top bus: painted rim around a floor with rows of seats (backrests face the rear)
        U.rr(g, -Lp / 2, -Wd / 2, Lp, Wd, rad);
        g.fillStyle = col; g.fill(); olStroke(g, lw);
        const rim = Wd * 0.1;
        U.rr(g, -Lp / 2 + rim, -Wd / 2 + rim, Lp - Lp * 0.17 - rim, Wd - rim * 2, rad * 0.6);
        g.fillStyle = masked ? '#d9dbe2' : U.shade(col, 0.72); g.fill();
        g.fillStyle = dark; g.fillRect(-Lp / 2 + rim, -Wd / 2 + rim, Lp - Lp * 0.17 - rim, Wd * 0.04);
        // windshield at the nose
        const wsx = Lp / 2 - Lp * 0.15, wsw = Lp * 0.09;
        U.rr(g, wsx, -Wd * 0.38, wsw, Wd * 0.76, Wd * 0.1);
        g.fillStyle = '#2c3e55'; g.fill();
        g.fillStyle = '#5d7ea3'; U.rr(g, wsx + wsw * 0.25, -Wd * 0.32, wsw * 0.3, Wd * 0.22, wsw * 0.15); g.fill();
        // headlights + tail lights
        const hr = Math.max(1.4, Wd * 0.07);
        g.fillStyle = '#fff4c2';
        g.beginPath(); g.arc(Lp / 2 - hr * 0.9, -Wd * 0.38, hr, 0, Math.PI * 2); g.arc(Lp / 2 - hr * 0.9, Wd * 0.38, hr, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#d92b3a';
        U.rr(g, -Lp / 2 + 1, -Wd * 0.4, 3, Wd * 0.14, 1.5); g.fill();
        U.rr(g, -Lp / 2 + 1, Wd * 0.26, 3, Wd * 0.14, 1.5); g.fill();
        // seats: cushion + backrest; a seated passenger shows head and shoulders
        const cw = Lp * 0.6 / (b.cap / 2), sh = Wd * 0.3;
        const seatCol = masked ? '#7d8392' : U.shade(col, -0.45), backCol = '#1a1a1e';
        for (let i = 0; i < b.cap; i++) {
          seatLocal(b, i, Lp, Wd, tmp2);
          const sx = tmp2[0], sy = tmp2[1];
          U.rr(g, sx - cw * 0.3, sy - sh / 2, cw * 0.58, sh, Math.min(cw, sh) * 0.2);
          g.fillStyle = seatCol; g.fill();
          U.rr(g, sx - cw * 0.46, sy - sh * 0.6, cw * 0.22, sh * 1.2, cw * 0.1);
          g.fillStyle = backCol; g.fill();
          if (i < b.filled && !masked) {
            const r = Math.min(cw * 0.3, sh * 0.42);
            U.rr(g, sx - r * 0.7, sy - r * 1.15, r * 1.3, r * 2.3, r * 0.6);
            g.fillStyle = U.shade(col, 0.25); g.fill();
            g.fillStyle = '#3b2a20'; g.beginPath(); g.arc(sx, sy, r * 0.72, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#f0c9a0'; g.beginPath(); g.arc(sx + r * 0.25, sy, r * 0.42, 0, Math.PI * 2); g.fill();
          }
        }
        if (inLot) {
          // white direction arrow on the roof, pointing at the nose
          const al = masked ? Math.min(Lp * 0.34, Wd * 0.9) : Math.min(Lp * 0.42, Wd * 1.1), aw = Wd * 0.17, ax = masked ? Lp * 0.2 : Lp * 0.06;
          g.beginPath();
          g.moveTo(ax + al / 2, 0); g.lineTo(ax + al / 2 - aw * 1.2, -aw); g.lineTo(ax + al / 2 - aw * 1.2, -aw * 0.38);
          g.lineTo(ax - al / 2, -aw * 0.38); g.lineTo(ax - al / 2, aw * 0.38); g.lineTo(ax + al / 2 - aw * 1.2, aw * 0.38); g.lineTo(ax + al / 2 - aw * 1.2, aw);
          g.closePath();
          g.lineJoin = 'round'; g.lineWidth = lw * 1.3; g.strokeStyle = masked ? '#3a3150' : U.shade(col, -0.45); g.stroke();
          g.fillStyle = '#ffffff'; g.fill();
        }
        if (masked) {
          // round "?" badge on the rear half of the roof, clear of the arrow
          const br = Math.min(Wd * 0.34, Lp * 0.17), bx = -Lp * 0.24;
          blob(g, bx, 0, br, br, '#3a3150', lw * 0.8);
          g.save(); g.translate(bx, 0); g.rotate(-a);
          otext(g, '?', 0, 1, Math.max(10, br * 1.45), '#ffffff');
          g.restore();
        }
        if (b.flash > 0) {
          g.fillStyle = 'rgba(255,255,255,' + (b.flash * 0.5).toFixed(3) + ')';
          U.rr(g, -Lp / 2, -Wd / 2, Lp, Wd, rad); g.fill();
        }
        g.restore();
      }
      function drawPerson(g, x, y, s, col, step) {
        // simple standing passenger: small head, coat in the bus colour, two legs
        const sw = Math.sin(step) * 1.4 * s;
        g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(x, y + 9.5 * s, 4.5 * s, 1.4 * s, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#2f3440';
        U.rr(g, x - 2.6 * s + sw * 0.4, y + 2.5 * s, 2.2 * s, 7 * s, 1 * s); g.fill();
        U.rr(g, x + 0.4 * s - sw * 0.4, y + 2.5 * s, 2.2 * s, 7 * s, 1 * s); g.fill();
        U.rr(g, x - 3.6 * s, y - 5 * s, 7.2 * s, 9 * s, 2.6 * s);
        g.fillStyle = col; g.fill();
        g.fillStyle = U.shade(col, -0.25); U.rr(g, x + 1.2 * s, y - 4.6 * s, 2.2 * s, 8.4 * s, 1.1 * s); g.fill();
        g.fillStyle = '#f0c9a0'; g.beginPath(); g.arc(x, y - 8.2 * s, 3 * s, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#3b2a20'; g.beginPath(); g.arc(x, y - 8.9 * s, 3.1 * s, Math.PI * 1.05, Math.PI * 1.95); g.fill();
      }
      function burst(x, y, n, colr, spd, life, size) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, v = spd * (0.3 + Math.random() * 0.9);
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life, size: size * (0.6 + Math.random() * 0.7), color: colr, grav: 0 });
        }
      }

      // ---------- game logic ----------
      function freeBay() {
        for (let i = 0; i < NB; i++) if (bays[i].bus < 0) return i;
        return -1;
      }
      function candidateFor(c) {
        let best = null;
        for (const b of buses) {
          if (b.color !== c || (b.state !== 'drive' && b.state !== 'bay')) continue;
          if (b.filled + b.incoming >= b.cap) continue;
          if (!best || b.rank < best.rank) best = b;
        }
        return best;
      }
      function tap(x, y) {
        if (api.ended || endT >= 0) return;
        const { cell, lotX, lotY } = lay;
        const gx = Math.floor((x - lotX) / cell), gy = Math.floor((y - lotY) / cell);
        let id = -1;
        if (gx >= 0 && gy >= 0 && gx < cols && gy < rows) id = grid[gy * cols + gx];
        if (id < 0) {
          let best = cell * 0.7;
          for (const b of buses) {
            if (b.state !== 'lot') continue;
            for (const p of cellsOf(b)) {
              const d = Math.hypot(x - (lotX + (p[0] + 0.5) * cell), y - (lotY + (p[1] + 0.5) * cell));
              if (d < best) { best = d; id = b.id; }
            }
          }
        }
        if (id < 0) return;
        const b = buses[id];
        if (b.state !== 'lot') return;
        b.flash = 1;
        const pr = probe(grid, cols, rows, b);
        if (!pr.free) {
          api.sfx('tap');
          b.state = 'bump'; b.t = 0; b.hit = false;
          b.reach = pr.gap * cell + cell * 0.1; b.blk = pr.hit;
          return;
        }
        const bi = freeBay();
        if (bi < 0) {
          api.sfx('bad');
          b.shake = 1; fullFlash = 1;
          for (const bb of bays) bb.flash = 1;
          api.info('車站滿了！等巴士載滿開走');
          return;
        }
        api.sfx('pop');
        if (b.hidden && !b.revealed) {
          b.revealed = true;
          lotCenter(b, tmp);
          burst(tmp[0], tmp[1], 16, b.col, 160, 0.55, 4.5);
        }
        bays[bi].bus = b.id;
        b.bay = bi; b.lastBay = bi; b.rank = rankN++;
        b.state = 'drive'; b.d = 0; b.v = 120; b.path = drivePath(b);
        for (const p of cellsOf(b)) grid[p[1] * cols + p[0]] = -1;
        lotCenter(b, tmp);
        burst(tmp[0] - DX[b.dir] * b.lotLp / 2, tmp[1] - DY[b.dir] * b.lotLp / 2, 8, 'rgba(235,235,245,0.85)', 60, 0.5, 5);
        setInfo();
      }

      function busWorld(b, out) {
        // current world position + angle + size of a bus (for drawing and walker targets)
        let x, y, a, Lp, Wd;
        if (b.state === 'lot' || b.state === 'bump') {
          lotCenter(b, out);
          x = out[0] + DX[b.dir] * b.off; y = out[1] + DY[b.dir] * b.off; a = ANG[b.dir]; Lp = b.lotLp; Wd = b.lotWd;
          if (b.shake > 0) { const s = Math.sin(time * 70) * b.shake * lay.cell * 0.07; if (b.h) y += s; else x += s; }
        } else if (b.state === 'drive') {
          at(b.path, b.d, tmp); at(b.path, b.d + 4, tmp2);
          x = tmp[0]; y = tmp[1];
          a = b.d >= b.path.len - 4 ? -Math.PI / 2 : Math.atan2(tmp2[1] - tmp[1], tmp2[0] - tmp[0]);
          const k = U.clamp(b.d / b.path.len, 0, 1), e = k * k * (3 - 2 * k);
          Lp = U.lerp(b.lotLp, b.bayLp, e); Wd = U.lerp(b.lotWd, b.bayWd, e);
        } else if (b.state === 'bay') {
          x = lay.bayX[b.bay]; y = lay.bayCy + Math.sin(Math.min(1, b.t * 3) * Math.PI) * -3; a = -Math.PI / 2; Lp = b.bayLp; Wd = b.bayWd;
          if (b.shake > 0) x += Math.sin(time * 70) * b.shake * 3;
        } else {
          const lp = b.lp;
          at(lp.path, b.d, tmp);
          x = tmp[0]; y = tmp[1];
          if (b.d < lp.c0) a = -Math.PI / 2;
          else if (b.d > lp.c1) a = 0;
          else a = lerpAng(-Math.PI / 2, 0, (b.d - lp.c0) / (lp.c1 - lp.c0));
          Lp = b.bayLp; Wd = b.bayWd;
        }
        out[0] = x; out[1] = y; out[2] = a; out[3] = Lp; out[4] = Wd;
        return out;
      }

      const bw = [0, 0, 0, 0, 0];
      function update(dt) {
        time += dt;
        shake = Math.max(0, shake - dt * 3);
        fullFlash = Math.max(0, fullFlash - dt * 2);
        qShift = Math.max(0, qShift - dt * lay.sp * 9);
        for (const bb of bays) bb.flash = Math.max(0, bb.flash - dt * 2);
        for (const b of buses) {
          b.flash = Math.max(0, b.flash - dt * 3);
          b.shake = Math.max(0, b.shake - dt * 2.5);
          if (b.state === 'bump') {
            b.t += dt;
            const T1 = 0.08 + Math.min(0.2, b.reach / lay.cell * 0.05), T2 = T1 + 0.32;
            if (b.t < T1) { const k = b.t / T1; b.off = b.reach * k * k; }
            else {
              if (!b.hit) {
                b.hit = true; api.sfx('bad'); shake = 0.7;
                if (b.blk >= 0) buses[b.blk].shake = 1;
                lotCenter(b, tmp);
                burst(tmp[0] + DX[b.dir] * (b.lotLp / 2 + b.reach), tmp[1] + DY[b.dir] * (b.lotLp / 2 + b.reach), 9, '#ffd34d', 150, 0.35, 3.5);
              }
              const k = Math.min(1, (b.t - T1) / (T2 - T1));
              b.off = b.reach * (1 - U.easeOutCubic(k)) - Math.sin(k * Math.PI) * lay.cell * 0.05;
              if (b.t >= T2) { b.off = 0; b.state = 'lot'; }
            }
          } else if (b.state === 'drive') {
            const remain = b.path.len - b.d;
            const vmax = Math.max(lay.W, 500) * 2.2;
            b.v = remain < 90 ? Math.max(160, Math.min(b.v, remain * 6)) : Math.min(vmax, b.v + vmax * 2.2 * dt);
            b.d += b.v * dt;
            if (b.d >= b.path.len) { b.d = b.path.len; b.state = 'bay'; b.t = 0; api.sfx('drop'); boardCD = Math.min(boardCD, 0.15); }
          } else if (b.state === 'bay') {
            b.t += dt;
            if (b.filled >= b.cap && b.incoming === 0) {
              b.wait += dt;
              if (b.wait > 0.35) {
                b.state = 'leave'; b.d = 0; b.v = 60; b.lp = leavePath(b); api.sfx('good');
                burst(lay.bayX[b.bay], lay.bayCy, 14, b.col, 140, 0.6, 4);
              }
            }
          } else if (b.state === 'leave') {
            const reversing = b.d < b.lp.c0;
            b.v = reversing ? Math.min(260, b.v + 900 * dt) : Math.min(1100, b.v + 1800 * dt);
            b.d += b.v * dt;
            if (b.bay >= 0 && b.d > b.lp.c0) { bays[b.bay].bus = -1; b.bay = -1; }
            if (b.d >= b.lp.path.len) b.state = 'gone';
          }
        }
        // boarding: front passenger walks to the earliest-arrived bus of its colour
        boardCD -= dt;
        if (boardCD <= 0 && queue.length && endT < 0) {
          const c = queue[0];
          const b = candidateFor(c);
          if (b && b.state === 'bay' && b.t > 0.15) {
            queue.shift();
            const seat = b.filled + b.incoming;
            b.incoming++;
            walkers.push({ x0: lay.sp * 1.2 + qShift, y0: lay.qH * 0.56, bus: b, seat, t: 0, color: c });
            qShift += lay.sp;
            boardCD = 0.11;
            api.sfx('tap');
          } else boardCD = 0.05;
        }
        for (let i = walkers.length - 1; i >= 0; i--) {
          const w = walkers[i];
          w.t += dt / 0.3;
          if (w.t >= 1) {
            const b = w.bus;
            b.incoming--; b.filled++; delivered++;
            busWorld(b, bw);
            burst(bw[0], bw[1], 4, U.shade(COLORS[w.color], 0.3), 50, 0.3, 3);
            walkers.splice(i, 1);
            setInfo();
          }
        }
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue; }
          p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.grav * dt;
          if (!p.grav) { p.vx *= 0.95; p.vy *= 0.95; }
        }
        // end conditions
        if (timeLimit && endT < 0 && !api.ended) {
          timeLeft = Math.max(0, timeLeft - dt);
          const sec = Math.ceil(timeLeft);
          if (sec !== lastSec) {
            lastSec = sec; setInfo();
            if (sec <= 10 && sec > 0) api.sfx('tap');
          }
          if (timeLeft <= 0) { endT = 0.4; endWin = false; api.info('時間到了！'); }
        }
        if (endT < 0 && !api.ended) {
          if (!queue.length && !walkers.length) {
            if (buses.every((b) => b.state === 'leave' || b.state === 'gone')) { endT = 0.9; endWin = true; }
          } else if (queue.length && !walkers.length) {
            const busy = buses.some((b) => b.state === 'drive' || b.state === 'leave' || b.state === 'bump' || (b.state === 'bay' && b.filled >= b.cap));
            const allFull = bays.every((bb) => bb.bus >= 0 && buses[bb.bus].state === 'bay');
            if (!busy && allFull && !candidateFor(queue[0])) {
              endT = 0.6; endWin = false;
              for (const bb of bays) bb.flash = 1;
              api.info('車站塞滿了，沒有對應顏色的巴士');
            }
          }
        }
        if (endT >= 0 && !api.ended) {
          endT -= dt;
          if (endT < 0) {
            if (endWin) {
              for (let i = 0; i < 80; i++) {
                parts.push({ x: api.W * Math.random(), y: -10, vx: (Math.random() - 0.5) * 120, vy: 80 + Math.random() * 160, life: 2.4, max: 2.4, size: 4 + Math.random() * 3, color: COLORS[i % COLORS.length], grav: 120, conf: true });
              }
              api.win('所有乘客都上車了！');
            } else api.lose(timeLimit && timeLeft <= 0 ? '時間到了' : '車站塞滿了');
          }
        }
      }

      function draw(g) {
        if (api.W !== lay.W || api.H !== lay.H) relayout();
        const { W, H, qH, sp, bayW, bayLen, bayY0 } = lay;
        g.fillStyle = '#6cc463'; g.fillRect(0, 0, W, H);
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * 6 * shake, (Math.random() - 0.5) * 6 * shake);
        if (lay.bg && lay.bg.getContext) g.drawImage(lay.bg, 0, 0, W, H); else paintBg(g);
        // bay warning flash
        for (let i = 0; i < NB; i++) {
          if (bays[i].flash > 0) {
            g.fillStyle = 'rgba(255,60,60,' + (bays[i].flash * 0.35).toFixed(3) + ')';
            g.fillRect(lay.bayX[i] - bayW / 2 + 3, bayY0 + 3, bayW - 6, bayLen - 6);
          }
        }
        // lot buses, then buses on the road / in bays
        for (const b of buses) {
          if (b.state !== 'lot' && b.state !== 'bump') continue;
          busWorld(b, bw);
          drawBus(g, b, bw[0], bw[1], bw[2], bw[3], bw[4], true);
        }
        for (const b of buses) {
          if (b.state !== 'bay') continue;
          busWorld(b, bw);
          drawBus(g, b, bw[0], bw[1], bw[2], bw[3], bw[4], false);
          if (b.filled >= b.cap) otext(g, '滿', bw[0], bw[1] - bw[3] * 0.62, 14, '#ffe35a');
        }
        for (const b of buses) {
          if (b.state !== 'drive' && b.state !== 'leave') continue;
          busWorld(b, bw);
          drawBus(g, b, bw[0], bw[1], bw[2], bw[3], bw[4], false);
        }
        // walkers
        for (const w of walkers) {
          const b = w.bus;
          busWorld(b, bw);
          seatLocal(b, w.seat, bw[3], bw[4], tmp);
          const ca = Math.cos(bw[2]), sa = Math.sin(bw[2]);
          const tx = bw[0] + tmp[0] * ca - tmp[1] * sa, ty = bw[1] + tmp[0] * sa + tmp[1] * ca;
          const k = U.easeOutCubic(Math.min(1, w.t));
          const x = U.lerp(w.x0, tx, k), y = U.lerp(w.y0, ty, k) - Math.sin(k * Math.PI) * 14;
          drawPerson(g, x, y, lay.ps * (1 - k * 0.6), COLORS[w.color], time * 18);
        }
        // queue
        const vis = Math.min(10, Math.max(4, Math.floor((W - 70) / sp)));
        const qy = qH * 0.56;
        for (let i = Math.min(queue.length, vis) - 1; i >= 0; i--) {
          const x = sp * 1.2 + i * sp + qShift;
          const moving = qShift > 0.5;
          drawPerson(g, x, qy, lay.ps, COLORS[queue[i]], moving ? time * 16 + i : 0);
        }
        if (queue.length) {
          const bob = Math.sin(time * 6) * 2;
          const fx = sp * 1.2 + qShift;
          g.fillStyle = '#ffe35a';
          g.beginPath(); g.moveTo(fx - 6, 9 + bob); g.lineTo(fx + 6, 9 + bob); g.lineTo(fx, 17 + bob); g.closePath(); g.fill();
          g.lineWidth = 2; g.strokeStyle = OL; g.lineJoin = 'round'; g.stroke();
        }
        U.rr(g, W - 58, qy - 13, 50, 26, 13);
        g.fillStyle = '#ffb547'; g.fill(); olStroke(g, 2.5);
        U.rr(g, W - 53, qy - 10, 40, 7, 3.5); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fill();
        otext(g, String(queue.length), W - 33, qy + 1, 16, '#ffffff');
        for (const p of parts) {
          const al = Math.max(0, p.life / p.max);
          g.globalAlpha = al; g.fillStyle = p.color;
          if (p.conf) { g.save(); g.translate(p.x, p.y); g.rotate(p.life * 6); g.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); g.restore(); }
          else { g.beginPath(); g.arc(p.x, p.y, p.size * (0.5 + al * 0.5), 0, Math.PI * 2); g.fill(); }
        }
        g.globalAlpha = 1;
        g.restore();
        if (timeLimit) {
          const k = timeLeft / timeLimit, low = timeLeft < 15;
          g.fillStyle = OL; g.fillRect(0, 0, W, 8);
          g.fillStyle = low ? (Math.sin(time * 14) > 0 ? '#ff2d3d' : '#ffd34d') : '#3fcf6f';
          g.fillRect(0, 0, W * k, 6);
          g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(0, 1, W * k, 2);
        }
        if (fullFlash > 0) { g.globalAlpha = Math.min(1, fullFlash * 1.5); otext(g, '車站滿了！', W / 2, bayY0 + bayLen / 2, 24, '#ffffff'); g.globalAlpha = 1; }
      }

      function relayout() {
        layout();
        for (const b of buses) {
          if (b.state === 'drive') { const k = b.d / (b.path.len || 1); b.path = drivePath(b); b.d = k * b.path.len; }
          if (b.state === 'leave') { const k = b.d / (b.lp.path.len || 1); b.lp = leavePath(b); b.d = k * b.lp.path.len; }
        }
      }

      layout();
      setInfo();
      return {
        update,
        draw,
        down(x, y) { tap(x, y); },
        _test: {
          cellXY: (cx, cy) => [lay.lotX + (cx + 0.5) * lay.cell, lay.lotY + (cy + 0.5) * lay.cell],
          busState: (i) => buses[i].state,
        },
        resize() { relayout(); },
      };
    },
  });
})();
