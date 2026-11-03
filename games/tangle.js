// 解繩結 — Untangle: drag pegs until no ropes cross (planar graph puzzle).
(function () {
  'use strict';

  // diff: 0 簡單 (original ramp 6→30), 1 普通 (12→36, denser), 2 困難 (18→40, densest)
  function nodesFor(level, diff) {
    if (diff === 1) return Math.min(36, 12 + Math.round((level - 1) * 0.6));
    if (diff === 2) return Math.min(40, 18 + Math.round((level - 1) * 0.75));
    return Math.min(30, Math.round(6 + (level - 1) * 0.45));
  }
  function densityOf(level, diff) {
    if (diff === 1) return Math.min(2.3, 1.7 + level * 0.03);
    if (diff === 2) return Math.min(2.45, 2.0 + level * 0.03);
    return Math.min(2.1, 1.3 + level * 0.025);
  }

  // proper segment intersection (shared endpoints don't count)
  function cross(ax, ay, bx, by, cx, cy, dx, dy) {
    const d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);
    const d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
    const d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    const d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
    return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
  }
  function segPointDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
  }

  // count crossings for positions xs/ys (normalised 0..1) and edges; flags[] per edge (optional)
  // touch = how close a foreign peg may come to a rope (normalised units)
  function countCrossings(xs, ys, edges, flags, touch) {
    let c = 0;
    if (flags) flags.fill(0);
    for (let i = 0; i < edges.length; i++) {
      const a = edges[i][0], b = edges[i][1];
      for (let j = i + 1; j < edges.length; j++) {
        const p = edges[j][0], q = edges[j][1];
        if (p === a || p === b || q === a || q === b) continue;
        if (cross(xs[a], ys[a], xs[b], ys[b], xs[p], ys[p], xs[q], ys[q])) { c++; if (flags) { flags[i] = 1; flags[j] = 1; } }
      }
      if (touch > 0) {
        for (let k = 0; k < xs.length; k++) {
          if (k === a || k === b) continue;
          if (segPointDist(xs[k], ys[k], xs[a], ys[a], xs[b], ys[b]) < touch) { c++; if (flags) flags[i] = 1; }
        }
      }
    }
    return c;
  }

  const TOUCH = 0.035;

  // Planar generator: random well-spaced points, greedy shortest-edge triangulation (never adds a
  // crossing edge, never passes close to a foreign point), then thin edges out keeping the graph
  // connected and every node at degree >= 2. The original point set is kept as the proof layout.
  function generate(level, rng, diff) {
    diff = diff || 0;
    const want0 = nodesFor(level, diff);
    const xs = [], ys = [];
    const minD = want0 <= 30 ? Math.max(0.1, 0.42 / Math.sqrt(want0)) : 0.088;
    let guard = 0;
    while (xs.length < want0 && guard++ < 40000) {
      const x = 0.06 + rng() * 0.88, y = 0.06 + rng() * 0.88;
      let ok = true;
      for (let i = 0; i < xs.length; i++) if (Math.hypot(x - xs[i], y - ys[i]) < minD) { ok = false; break; }
      if (ok) { xs.push(x); ys.push(y); }
    }
    const n = xs.length;
    const pairs = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j, Math.hypot(xs[i] - xs[j], ys[i] - ys[j])]);
    pairs.sort((a, b) => a[2] - b[2]);
    const edges = [];
    for (const [a, b] of pairs) {
      let ok = true;
      for (const e of edges) {
        if (e[0] === a || e[0] === b || e[1] === a || e[1] === b) continue;
        if (cross(xs[a], ys[a], xs[b], ys[b], xs[e[0]], ys[e[0]], xs[e[1]], ys[e[1]])) { ok = false; break; }
      }
      if (!ok) continue;
      for (let k = 0; k < n && ok; k++) {
        if (k === a || k === b) continue;
        if (segPointDist(xs[k], ys[k], xs[a], ys[a], xs[b], ys[b]) < TOUCH * 1.6) ok = false;
      }
      if (ok) edges.push([a, b]);
    }
    // thin out: density rises with level (≈1.35n edges early → ≈2.1n later)
    const want = Math.round(n * densityOf(level, diff));
    const deg = new Array(n).fill(0);
    edges.forEach((e) => { deg[e[0]]++; deg[e[1]]++; });
    const order = edges.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = order[i]; order[i] = order[j]; order[j] = t; }
    const alive = edges.map(() => true);
    let count = edges.length;
    function connected() {
      const seen = new Array(n).fill(false), st = [0]; seen[0] = true; let c = 1;
      while (st.length) {
        const v = st.pop();
        for (let i = 0; i < edges.length; i++) {
          if (!alive[i]) continue;
          const e = edges[i]; let w = -1;
          if (e[0] === v) w = e[1]; else if (e[1] === v) w = e[0];
          if (w >= 0 && !seen[w]) { seen[w] = true; c++; st.push(w); }
        }
      }
      return c === n;
    }
    for (const i of order) {
      if (count <= want) break;
      const e = edges[i];
      if (deg[e[0]] <= 2 || deg[e[1]] <= 2) continue;
      alive[i] = false;
      if (!connected()) { alive[i] = true; continue; }
      deg[e[0]]--; deg[e[1]]--; count--;
    }
    const finalEdges = edges.filter((_, i) => alive[i]);
    // scramble onto a circle in random order until there are plenty of crossings
    const perm = [];
    for (let i = 0; i < n; i++) perm.push(i);
    let sx = null, sy = null, best = -1, bestScore = 1e9;
    const lo = diff ? Math.max(4, Math.round(n * 0.9)) : level === 1 ? 2 : level === 2 ? 3 : Math.max(4, Math.round(n * 0.6));
    const hi = !diff && level === 1 ? 3 : !diff && level === 2 ? 5 : 1e9;
    for (let tries = 0; tries < 60; tries++) {
      for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
      const cx = [], cy = [];
      const rot = rng() * Math.PI * 2;
      for (let i = 0; i < n; i++) {
        const a = rot + (perm[i] / n) * Math.PI * 2;
        cx[i] = 0.5 + Math.cos(a) * 0.42; cy[i] = 0.5 + Math.sin(a) * 0.42;
      }
      const c = countCrossings(cx, cy, finalEdges, null, TOUCH);
      const score = c < 1 ? 1e8 : c < lo ? lo - c : c > hi ? c - hi : 0;
      if (score < bestScore) { bestScore = score; best = c; sx = cx; sy = cy; }
      if (score === 0) break;
    }
    return { n, edges: finalEdges, solX: xs, solY: ys, startX: sx, startY: sy, startCross: best };
  }

  const OL = '#2a1a14';   // cartoon outline colour (卡通 Q 版 style)
  const ROPE = ['#ff6b6b', '#ffb84d', '#ffe066', '#69db7c', '#4dabf7', '#9775fa', '#f783ac', '#38d9a9'];

  MG.register({
    id: 'tangle', name: '解繩結', icon: '🪢', color: '#ff7ac8',
    _generate: generate, _countCrossings: countCrossings, _TOUCH: TOUCH, _nodesFor: nodesFor,
    create(api) {
      const U = api.util;
      const G = generate(api.level, api.rng, api.diff || 0);
      const n = G.n, edges = G.edges;
      const xs = G.startX.slice(), ys = G.startY.slice();   // logical (normalised) positions
      const dxs = xs.slice(), dys = ys.slice();              // displayed (smoothed) positions
      const flags = new Uint8Array(edges.length);
      const prevFlags = new Uint8Array(edges.length);
      const flash = new Float32Array(edges.length);
      const pegCol = [];
      for (let i = 0; i < n; i++) pegCol.push(ROPE[i % ROPE.length]);
      let crossings = countCrossings(xs, ys, edges, flags, TOUCH);
      prevFlags.set(flags);
      let ax = 0, ay = 0, aw = 1, ah = 1, pegR = 14;
      let drag = -1, grabDX = 0, grabDY = 0, moves = 0;
      let time = 0, won = false, winT = 0, pulse = new Float32Array(n);
      const parts = [];
      let bgCache = null, bgW = 0, bgH = 0;

      function layout() {
        const W = api.W, H = api.H;
        const side = Math.min(W - 36, H - 120);
        aw = side; ah = Math.min(H - 110, side * 1.25);
        ax = (W - aw) / 2; ay = (H - ah) / 2 + 22;
        pegR = Math.max(12, Math.min(18, side / (n > 20 ? 26 : 20)));
      }
      layout();
      const SX = (x) => ax + x * aw, SY = (y) => ay + y * ah;

      function info() {
        if (won) { api.info('解開了！'); return; }
        if (!api.diff && api.level === 1 && moves === 0) api.info('拖動釘子，讓所有繩子不再交叉');
        else api.info('交叉 ' + crossings + '　節點 ' + n);
      }
      info();

      function recount() {
        prevFlags.set(flags);
        crossings = countCrossings(xs, ys, edges, flags, TOUCH);
        for (let i = 0; i < edges.length; i++) if (prevFlags[i] && !flags[i]) flash[i] = 1;
      }

      function celebrate() {
        won = true; winT = 0;
        api.sfx('good');
        for (let i = 0; i < 120 && parts.length < 300; i++) {
          parts.push({ x: api.W / 2, y: api.H * 0.45, vx: (Math.random() - 0.5) * 520, vy: -150 - Math.random() * 420, life: 2, max: 2, col: ROPE[i % ROPE.length], sz: 3 + Math.random() * 3, rot: Math.random() * 6, conf: true });
        }
        for (let i = 0; i < n; i++) pulse[i] = 1 + i * 0.03;
        info();
      }

      function down(x, y) {
        if (api.ended || won) return;
        let best = -1, bd = Math.max(26, pegR + 12);
        for (let i = 0; i < n; i++) {
          const d = Math.hypot(x - SX(dxs[i]), y - SY(dys[i]));
          if (d < bd) { bd = d; best = i; }
        }
        if (best >= 0) {
          drag = best; grabDX = SX(xs[best]) - x; grabDY = SY(ys[best]) - y;
          pulse[best] = 1; api.sfx('tap');
        }
      }
      function move(x, y) {
        if (drag < 0 || won) return;
        const nx = (x + grabDX - ax) / aw, ny = (y + grabDY - ay) / ah;
        const mx = pegR / aw, my = pegR / ah;
        xs[drag] = U.clamp(nx, mx * 0.5, 1 - mx * 0.5);
        ys[drag] = U.clamp(ny, my * 0.5, 1 - my * 0.5);
        const before = crossings;
        recount();
        if (crossings < before) api.sfx('pop');
      }
      function up() {
        if (drag < 0) return;
        drag = -1; moves++;
        api.sfx('drop');
        if (crossings === 0 && !won) celebrate();
        info();
      }

      function update(dt) {
        time += dt;
        const k = Math.min(1, dt * 22);
        for (let i = 0; i < n; i++) {
          dxs[i] += (xs[i] - dxs[i]) * k; dys[i] += (ys[i] - dys[i]) * k;
          if (pulse[i] > 0) pulse[i] = Math.max(0, pulse[i] - dt * 2.5);
        }
        for (let i = 0; i < edges.length; i++) if (flash[i] > 0) flash[i] = Math.max(0, flash[i] - dt * 2);
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i]; p.life -= dt;
          if (p.life <= 0) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
          p.vy += 520 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.99; p.rot += dt * 6;
        }
        if (won && !api.ended) { winT += dt; if (winT > 1.1) api.win('用了 ' + moves + ' 步'); }
        if (!won) info();
      }

      function drawBg(g) {
        const W = api.W, H = api.H;
        if (!bgCache || bgW !== W || bgH !== H) {
          bgW = W; bgH = H;
          try { bgCache = document.createElement('canvas'); } catch (e) { bgCache = null; }
          if (bgCache && bgCache.getContext) {
            const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
            bgCache.width = Math.round(W * dpr); bgCache.height = Math.round(H * dpr);
            const c = bgCache.getContext('2d');
            c.setTransform(dpr, 0, 0, dpr, 0, 0);
            paintBg(c, W, H);
          }
        }
        if (bgCache && bgCache.getContext) g.drawImage(bgCache, 0, 0, W, H);
        else paintBg(g, W, H);
      }
      function paintBg(c, W, H) {
        c.lineJoin = 'round';
        // cosy playroom: striped wallpaper, a window, wooden floor
        c.fillStyle = '#ffe9c7'; c.fillRect(0, 0, W, H);
        c.fillStyle = '#ffdcb0';
        for (let x = 0; x < W; x += 36) c.fillRect(x, 0, 18, H);
        c.fillStyle = 'rgba(255,140,120,0.35)';
        for (let x = 9; x < W; x += 36) for (let y = 20; y < H; y += 46) { c.beginPath(); c.arc(x + 18, y + (x % 72 ? 23 : 0), 3, 0, 7); c.fill(); }
        const fy = H * 0.86;
        c.fillStyle = '#c98a52'; c.fillRect(0, fy, W, H - fy);
        c.strokeStyle = OL; c.lineWidth = 3; c.beginPath(); c.moveTo(0, fy); c.lineTo(W, fy); c.stroke();
        c.lineWidth = 2; c.strokeStyle = 'rgba(42,26,20,0.45)';
        for (let x = 0; x < W + 60; x += 58) { c.beginPath(); c.moveTo(x, fy); c.lineTo(x - 30, H); c.stroke(); }
        c.fillStyle = '#e8b27a'; c.fillRect(0, fy - 10, W, 10); c.strokeStyle = OL; c.lineWidth = 2.5; c.strokeRect(-4, fy - 10, W + 8, 10);
        // window peeking above the board
        const wx = W * 0.62, ww = Math.min(110, W * 0.3), wy = 8, wh = Math.max(0, ay - 36);
        if (wh > 30) {
          U.rr(c, wx, wy, ww, wh, 8); c.fillStyle = '#9fdcff'; c.fill(); c.lineWidth = 4; c.strokeStyle = OL; c.stroke();
          c.fillStyle = '#fff'; c.beginPath(); c.arc(wx + ww * 0.3, wy + wh * 0.55, 9, 0, 7); c.arc(wx + ww * 0.42, wy + wh * 0.45, 11, 0, 7); c.arc(wx + ww * 0.55, wy + wh * 0.58, 8, 0, 7); c.fill();
          c.lineWidth = 3; c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.stroke();
        }
        // wooden board with thick outline and brass nails
        const bx = ax - 12, by = ay - 12, bw = aw + 24, bh = ah + 24;
        c.fillStyle = 'rgba(42,26,20,0.3)'; U.rr(c, bx + 4, by + 8, bw, bh, 22); c.fill();
        U.rr(c, bx - 6, by - 6, bw + 12, bh + 12, 26); c.fillStyle = '#b8743c'; c.fill(); c.lineWidth = 4; c.strokeStyle = OL; c.stroke();
        U.rr(c, bx, by, bw, bh, 20); c.fillStyle = '#f6d9a8'; c.fill(); c.lineWidth = 3; c.stroke();
        c.strokeStyle = 'rgba(160,100,50,0.22)'; c.lineWidth = 2;
        for (let i = 0; i < 16; i++) {
          const yy = by + 14 + i * (bh - 28) / 15;
          c.beginPath(); c.moveTo(bx + 10, yy);
          c.bezierCurveTo(bx + bw * 0.3, yy + 5 * Math.sin(i), bx + bw * 0.6, yy - 6 * Math.cos(i * 1.7), bx + bw - 10, yy + 2);
          c.stroke();
        }
        c.fillStyle = 'rgba(255,255,255,0.4)'; U.rr(c, bx + 10, by + 6, bw - 20, 8, 4); c.fill();
        const nail = (x, y) => { c.beginPath(); c.arc(x, y, 5, 0, 7); c.fillStyle = '#ffcc4d'; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke(); c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(x - 1.5, y - 1.5, 1.6, 0, 7); c.fill(); };
        nail(bx + 2, by + 2); nail(bx + bw - 2, by + 2); nail(bx + 2, by + bh - 2); nail(bx + bw - 2, by + bh - 2);
      }

      const DASH = [5, 7];
      const NODASH = [];
      function rope(g, i) {
        const e = edges[i];
        const x1 = SX(dxs[e[0]]), y1 = SY(dys[e[0]]), x2 = SX(dxs[e[1]]), y2 = SY(dys[e[1]]);
        const len = Math.hypot(x2 - x1, y2 - y1);
        const sag = won ? 0 : Math.min(14, len * 0.05) * (1 + 0.08 * Math.sin(time * 2 + i));
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag;
        const bad = flags[i] === 1;
        const base = won ? '#5ee08f' : (bad ? '#ff5d6c' : '#5ad48a');
        const lw = Math.max(5, pegR * 0.5);
        g.lineCap = 'round';
        g.strokeStyle = 'rgba(42,26,20,0.22)'; g.lineWidth = lw + 3;
        g.beginPath(); g.moveTo(x1 + 2, y1 + 6); g.quadraticCurveTo(mx + 2, my + 6, x2 + 2, y2 + 6); g.stroke();
        g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx, my, x2, y2);
        g.strokeStyle = OL; g.lineWidth = lw + 5; g.stroke();
        g.strokeStyle = base; g.lineWidth = lw; g.stroke();
        // twisted-rope stripes
        g.strokeStyle = U.shade(base, -0.25); g.lineWidth = lw * 0.55;
        g.setLineDash(DASH); g.lineDashOffset = i * 3; g.stroke();
        g.setLineDash(NODASH);
        g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = Math.max(1.5, lw * 0.22);
        g.beginPath(); g.moveTo(x1, y1 - lw * 0.22); g.quadraticCurveTo(mx, my - lw * 0.22, x2, y2 - lw * 0.22); g.stroke();
        if (flash[i] > 0) {
          g.strokeStyle = 'rgba(255,255,255,' + (flash[i] * 0.8).toFixed(3) + ')'; g.lineWidth = lw + 6 * flash[i];
          g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx, my, x2, y2); g.stroke();
        }
      }

      // pegs are little Q critters: worried while any of their ropes cross, smiling once free
      const nodeBad = new Uint8Array(n);
      function peg(g, i) {
        const x = SX(dxs[i]), y0 = SY(dys[i]);
        const lift = i === drag ? 1 : 0;
        const r = pegR * (1 + lift * 0.18 + pulse[i] * 0.15 * Math.sin(pulse[i] * 10));
        const y = y0 - lift * 5;
        g.fillStyle = 'rgba(42,26,20,' + (0.25 + lift * 0.1) + ')';
        g.beginPath(); g.ellipse(x + 2 + lift * 4, y0 + r * 0.55 + lift * 8, r * 0.95, r * 0.4, 0, 0, 7); g.fill();
        const c = pegCol[i];
        const lw = Math.max(2, r * 0.17);
        g.lineWidth = lw; g.strokeStyle = OL; g.lineJoin = 'round';
        // ears
        for (let sd = -1; sd <= 1; sd += 2) {
          g.beginPath(); g.ellipse(x + sd * r * 0.62, y - r * 0.78, r * 0.3, r * 0.36, sd * 0.4, 0, 7); g.fillStyle = c; g.fill(); g.stroke();
        }
        g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = c; g.fill(); g.stroke();
        g.fillStyle = U.shade(c, 0.45); g.beginPath(); g.ellipse(x, y + r * 0.38, r * 0.55, r * 0.38, 0, 0, 7); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(x - r * 0.42, y - r * 0.48, r * 0.24, r * 0.13, -0.6, 0, 7); g.fill();
        const sad = !won && nodeBad[i];
        const ex = r * 0.36, ey = y - r * 0.08, es = r * 0.2;
        g.fillStyle = OL;
        g.beginPath(); g.ellipse(x - ex, ey, es * 0.8, es, 0, 0, 7); g.ellipse(x + ex, ey, es * 0.8, es, 0, 0, 7); g.fill();
        g.fillStyle = '#fff';
        g.beginPath(); g.arc(x - ex + es * 0.25, ey - es * 0.35, es * 0.35, 0, 7); g.arc(x + ex + es * 0.25, ey - es * 0.35, es * 0.35, 0, 7); g.fill();
        g.fillStyle = 'rgba(255,90,110,0.55)'; g.beginPath(); g.ellipse(x - r * 0.62, y + r * 0.22, r * 0.16, r * 0.1, 0, 0, 7); g.ellipse(x + r * 0.62, y + r * 0.22, r * 0.16, r * 0.1, 0, 0, 7); g.fill();
        g.strokeStyle = OL; g.lineWidth = Math.max(1.2, r * 0.1); g.lineCap = 'round';
        g.beginPath();
        if (sad) g.arc(x, y + r * 0.42, r * 0.16, Math.PI * 1.15, Math.PI * 1.85);
        else g.arc(x, y + r * 0.2, r * 0.18, 0.15 * Math.PI, 0.85 * Math.PI);
        g.stroke();
        if (sad && r > 13) { g.fillStyle = '#7fd0ff'; g.beginPath(); g.ellipse(x + r * 0.85, y - r * 0.35, r * 0.1, r * 0.16, 0, 0, 7); g.fill(); }
      }

      function draw(g) {
        drawBg(g);
        nodeBad.fill(0);
        for (let i = 0; i < edges.length; i++) if (flags[i]) { nodeBad[edges[i][0]] = 1; nodeBad[edges[i][1]] = 1; }
        for (let i = 0; i < edges.length; i++) if (!flags[i]) rope(g, i);
        for (let i = 0; i < edges.length; i++) if (flags[i]) rope(g, i);
        for (let i = 0; i < n; i++) if (i !== drag) peg(g, i);
        if (drag >= 0) peg(g, drag);
        // header counter
        const ok = crossings === 0;
        U.rr(g, api.W / 2 - 66, 9, 132, 36, 18); g.fillStyle = ok ? '#4cd986' : '#fff6e6'; g.fill();
        g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.45)'; U.rr(g, api.W / 2 - 56, 13, 112, 9, 4.5); g.fill();
        g.font = '900 17px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = OL;
        const lbl = ok ? '全部解開！' : '交叉 ' + crossings;
        g.strokeText(lbl, api.W / 2, 28); g.fillStyle = ok ? '#fff' : '#ff5d6c'; g.fillText(lbl, api.W / 2, 28);
        if (!api.diff && api.level === 1 && moves === 0 && !won) {
          const t = (time % 2) / 2;
          const i0 = edges[0][0];
          const px = SX(dxs[i0]), py = SY(dys[i0]);
          g.globalAlpha = 0.9;
          U.text(g, '👆', px + 16 + Math.sin(t * Math.PI * 2) * 18, py + 24, 26, '#fff');
          g.globalAlpha = 1;
        }
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          g.globalAlpha = Math.min(1, p.life / p.max * 1.5);
          g.fillStyle = p.col;
          g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillRect(-p.sz, -p.sz / 2, p.sz * 2, p.sz); g.restore();
        }
        g.globalAlpha = 1;
      }

      return {
        update, draw, down, move, up,
        resize() { layout(); bgCache = null; },
        _graph: G,
        _pegScreen(i) { return [SX(dxs[i]), SY(dys[i])]; },
        _toScreen(x, y) { return [SX(x), SY(y)]; },
        get _drag() { return drag; },
        get _crossings() { return crossings; },
      };
    },
  });
})();
