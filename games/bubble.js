// 泡泡龍 — Bubble Shooter: drag to aim (wall-bounce preview), release to shoot, 3+ same colour pop,
// cut-off bubbles fall. Ceiling drops every N shots. 無盡: new rows keep pushing in from the top.
(function () {
  'use strict';

  // ---------- board constants (board units: bubble radius = 1) ----------
  const COLS = 9;
  const S3 = Math.sqrt(3);
  const DEATH = 13;                       // a bubble whose row (incl. ceiling drop) reaches this = lose
  const SX = COLS, SY = 1 + (DEATH + 0.75) * S3;
  const BW = COLS * 2, BH = SY + 1.9;
  const STONE = 8, BOMB = 9, RAIN = 10;
  const COLORS = ['#000000', '#ff5d6c', '#4c9bff', '#4cd986', '#ffcc4d', '#b26bff', '#ff8f3d', '#3de0e0'];
  const HIT = 1.62;
  const SPEED = 46;
  const AMIN = 0.13;

  // ---------- art: 卡通 Q 版 (thick outlines, flat fills + one highlight) ----------
  const OL = '#2a1a14';
  function U_blob(g, x, y, rx, ry, fill, lw) {
    g.beginPath(); g.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, 6.283);
    g.fillStyle = fill; g.fill(); g.lineWidth = lw; g.strokeStyle = OL; g.stroke();
  }
  function U_otext(g, str, x, y, size, col, lw, align) {
    g.font = '900 ' + size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
    g.textAlign = align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = lw || 4; g.strokeStyle = OL; g.strokeText(str, x, y);
    g.fillStyle = col; g.fillText(str, x, y);
  }
  function U_cloud(x, cx, cy, s) {
    x.beginPath();
    x.arc(cx - s * 0.9, cy + s * 0.15, s * 0.55, Math.PI * 0.5, Math.PI * 1.5);
    x.arc(cx - s * 0.35, cy - s * 0.3, s * 0.6, Math.PI, Math.PI * 1.9);
    x.arc(cx + s * 0.45, cy - s * 0.15, s * 0.55, Math.PI * 1.2, Math.PI * 2.1);
    x.arc(cx + s * 0.95, cy + s * 0.2, s * 0.5, Math.PI * 1.5, Math.PI * 0.5);
    x.closePath();
    x.fillStyle = '#ffffff'; x.fill(); x.lineWidth = 2.5; x.strokeStyle = OL; x.stroke();
    x.fillStyle = 'rgba(160,190,240,0.35)'; x.beginPath(); x.ellipse(cx, cy + s * 0.45, s * 1.2, s * 0.18, 0, 0, 6.283); x.fill();
  }
  // sunny dragon valley: sky, sun, outlined clouds, layered hills with a little castle, meadow
  function drawBackground(x, W, H, U, ox, oy, u) {
    let gr = x.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#5fb8ff'); gr.addColorStop(0.55, '#a9dcff'); gr.addColorStop(1, '#ffe2f0');
    x.fillStyle = gr; x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(255,240,170,0.35)'; x.beginPath(); x.arc(W * 0.16, H * 0.12, 54, 0, 6.283); x.fill();
    U_blobX(x, W * 0.16, H * 0.12, 30, '#ffe066');
    U_cloud(x, W * 0.72, H * 0.1, 26); U_cloud(x, W * 0.3, H * 0.3, 20); U_cloud(x, W * 0.85, H * 0.42, 22); U_cloud(x, W * 0.12, H * 0.55, 18);
    const gy = H * 0.72;
    x.beginPath(); x.moveTo(0, H); x.lineTo(0, gy);
    x.quadraticCurveTo(W * 0.2, gy - 70, W * 0.42, gy - 10); x.quadraticCurveTo(W * 0.66, gy - 80, W, gy - 20); x.lineTo(W, H); x.closePath();
    x.fillStyle = '#9fdc8a'; x.fill(); x.lineWidth = 3; x.strokeStyle = OL; x.stroke();
    // castle on the far hill
    const cx = W * 0.66, cyy = gy - 58;
    x.lineWidth = 2.5; x.strokeStyle = OL;
    x.fillStyle = '#f3e3ff'; x.fillRect(cx - 22, cyy - 18, 44, 30); x.strokeRect(cx - 22, cyy - 18, 44, 30);
    for (const tx of [-24, 18]) {
      x.fillStyle = '#f3e3ff'; x.fillRect(cx + tx, cyy - 34, 12, 46); x.strokeRect(cx + tx, cyy - 34, 12, 46);
      x.fillStyle = '#ff7ab0'; x.beginPath(); x.moveTo(cx + tx - 3, cyy - 34); x.lineTo(cx + tx + 6, cyy - 52); x.lineTo(cx + tx + 15, cyy - 34); x.closePath(); x.fill(); x.stroke();
    }
    x.fillStyle = OL; x.beginPath(); x.arc(cx, cyy + 12, 7, Math.PI, 0); x.fill(); x.fillRect(cx - 7, cyy + 4, 14, 8);
    x.beginPath(); x.moveTo(0, H); x.lineTo(0, gy + 40);
    x.quadraticCurveTo(W * 0.35, gy - 5, W * 0.6, gy + 30); x.quadraticCurveTo(W * 0.82, gy + 50, W, gy + 20); x.lineTo(W, H); x.closePath();
    x.fillStyle = '#6fcf6a'; x.fill(); x.lineWidth = 3; x.strokeStyle = OL; x.stroke();
    // flowers + grass tufts
    const fl = ['#ff7ac8', '#ffe066', '#ffffff', '#b26bff'];
    for (let i = 0; i < 18; i++) {
      const fx = (i * 97 + 23) % W, fy = gy + 60 + ((i * 53) % Math.max(20, H - gy - 70));
      if (i % 2) { x.strokeStyle = '#3f9a45'; x.lineWidth = 2; x.beginPath(); x.moveTo(fx - 4, fy); x.lineTo(fx - 2, fy - 7); x.moveTo(fx, fy); x.lineTo(fx + 1, fy - 9); x.moveTo(fx + 4, fy); x.lineTo(fx + 3, fy - 6); x.stroke(); }
      else { U_blobX(x, fx, fy, 4, fl[i % 4]); x.fillStyle = '#ffcc4d'; x.beginPath(); x.arc(fx, fy, 1.6, 0, 6.283); x.fill(); }
    }
  }
  function U_blobX(x, cx, cy, r, fill) {
    x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.fillStyle = fill; x.fill(); x.lineWidth = 2; x.strokeStyle = OL; x.stroke();
  }
  function drawBubbleArt(x, cx, cy, r, k, U) {
    const R0 = r * 0.9, lw = Math.max(1.5, r * 0.13);
    const ring = () => { x.beginPath(); x.arc(cx, cy, R0, 0, 6.283); x.lineWidth = lw; x.strokeStyle = OL; x.stroke(); };
    const shadeIn = (col) => {
      x.save(); x.beginPath(); x.arc(cx, cy, R0, 0, 6.283); x.clip();
      x.fillStyle = U.shade(col, -0.25); x.fillRect(cx - r, cy - r, r * 2, r * 2);
      x.fillStyle = col; x.beginPath(); x.arc(cx - r * 0.12, cy - r * 0.15, R0 * 0.93, 0, 6.283); x.fill();
      x.restore();
    };
    const gloss = () => {
      x.fillStyle = 'rgba(255,255,255,0.85)'; x.beginPath(); x.ellipse(cx - r * 0.34, cy - r * 0.38, r * 0.26, r * 0.15, -0.6, 0, 6.283); x.fill();
      x.beginPath(); x.arc(cx + r * 0.05, cy - r * 0.6, r * 0.07, 0, 6.283); x.fill();
    };
    if (k === STONE) {
      shadeIn('#a7acbc');
      x.strokeStyle = OL; x.lineWidth = Math.max(1, r * 0.09); x.lineCap = 'round';
      x.beginPath(); x.moveTo(cx - r * 0.5, cy - r * 0.15); x.lineTo(cx - r * 0.1, cy + r * 0.08); x.lineTo(cx + r * 0.05, cy + r * 0.5);
      x.moveTo(cx - r * 0.1, cy + r * 0.08); x.lineTo(cx + r * 0.45, cy - r * 0.12); x.stroke(); x.lineCap = 'butt';
      x.fillStyle = 'rgba(255,255,255,0.45)'; x.beginPath(); x.ellipse(cx - r * 0.34, cy - r * 0.42, r * 0.24, r * 0.12, -0.6, 0, 6.283); x.fill();
      ring(); return;
    }
    if (k === BOMB) {
      x.beginPath(); x.moveTo(cx, cy - r * 0.86); x.quadraticCurveTo(cx + r * 0.32, cy - r * 1.1, cx + r * 0.5, cy - r * 0.95);
      x.strokeStyle = OL; x.lineWidth = Math.max(2, r * 0.2); x.stroke(); x.strokeStyle = '#c9a160'; x.lineWidth = Math.max(1, r * 0.1); x.stroke();
      shadeIn('#3a3d52');
      x.fillStyle = '#c9a160'; x.fillRect(cx - r * 0.22, cy - r * 0.98, r * 0.44, r * 0.22);
      x.lineWidth = lw * 0.7; x.strokeStyle = OL; x.strokeRect(cx - r * 0.22, cy - r * 0.98, r * 0.44, r * 0.22);
      gloss(); ring();
      U_otext(x, '!', cx, cy + r * 0.14, Math.round(r * 0.85), '#ff5d6c', Math.max(2, r * 0.18));
      return;
    }
    if (k === RAIN) {
      for (let i = 0; i < 6; i++) {
        x.fillStyle = COLORS[1 + i];
        x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, R0, i * 1.0472 - 1.57, (i + 1) * 1.0472 - 1.57); x.closePath(); x.fill();
      }
      gloss(); ring();
      U_otext(x, '★', cx, cy + r * 0.06, Math.round(r * 0.95), '#ffffff', Math.max(2, r * 0.16));
      return;
    }
    shadeIn(COLORS[k] || '#ffffff');
    gloss(); ring();
  }
  // chibi baby dragon next to the launcher
  function drawHero(g, x, y, s, mood, t, U) {
    const bob = Math.sin(t * 3) * s * 0.04 + (mood === 'happy' ? -Math.abs(Math.sin(t * 14)) * s * 0.12 : 0);
    y += bob;
    const lw = Math.max(1.8, s * 0.055), GR = '#5fd17f', GL = '#8ae8a2';
    g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.ellipse(x, y + s * 0.56 - bob, s * 0.5, s * 0.11, 0, 0, 6.283); g.fill();
    // tail with a spiky tip
    g.beginPath(); g.moveTo(x + s * 0.25, y + s * 0.42); g.quadraticCurveTo(x + s * 0.7, y + s * 0.55, x + s * 0.72, y + s * 0.15);
    g.lineTo(x + s * 0.6, y + s * 0.28); g.quadraticCurveTo(x + s * 0.5, y + s * 0.36, x + s * 0.25, y + s * 0.26); g.closePath();
    g.fillStyle = GR; g.fill(); g.lineWidth = lw; g.lineJoin = 'round'; g.strokeStyle = OL; g.stroke();
    g.beginPath(); g.moveTo(x + s * 0.64, y + s * 0.2); g.lineTo(x + s * 0.8, y + s * 0.02); g.lineTo(x + s * 0.76, y + s * 0.26); g.closePath();
    g.fillStyle = '#ffd34d'; g.fill(); g.stroke();
    // wings
    for (let i = -1; i <= 1; i += 2) {
      const fl = Math.sin(t * 6) * s * 0.04;
      g.beginPath(); g.moveTo(x + i * s * 0.22, y + s * 0.02); g.quadraticCurveTo(x + i * s * 0.62, y - s * 0.22 - fl, x + i * s * 0.58, y + s * 0.18);
      g.quadraticCurveTo(x + i * s * 0.44, y + s * 0.1, x + i * s * 0.3, y + s * 0.24); g.closePath();
      g.fillStyle = '#b48cff'; g.fill(); g.lineWidth = lw; g.strokeStyle = OL; g.stroke();
    }
    // feet + body + belly
    U_blob(g, x - s * 0.17, y + s * 0.5, s * 0.13, s * 0.08, GR, lw);
    U_blob(g, x + s * 0.17, y + s * 0.5, s * 0.13, s * 0.08, GR, lw);
    U_blob(g, x, y + s * 0.24, s * 0.34, s * 0.3, GR, lw);
    U_blob(g, x, y + s * 0.3, s * 0.2, s * 0.19, '#fff1bf', lw * 0.7);
    g.strokeStyle = 'rgba(200,150,60,0.6)'; g.lineWidth = Math.max(1, s * 0.025);
    g.beginPath(); g.moveTo(x - s * 0.13, y + s * 0.25); g.lineTo(x + s * 0.13, y + s * 0.25); g.moveTo(x - s * 0.15, y + s * 0.34); g.lineTo(x + s * 0.15, y + s * 0.34); g.stroke();
    U_blob(g, x - s * 0.28, y + s * 0.26, s * 0.08, s * 0.1, GR, lw);
    U_blob(g, x + s * 0.28, y + s * 0.26, s * 0.08, s * 0.1, GR, lw);
    // horns (behind the head)
    for (let i = -1; i <= 1; i += 2) {
      g.beginPath(); g.moveTo(x + i * s * 0.12, y - s * 0.44); g.quadraticCurveTo(x + i * s * 0.3, y - s * 0.66, x + i * s * 0.32, y - s * 0.72);
      g.quadraticCurveTo(x + i * s * 0.34, y - s * 0.52, x + i * s * 0.3, y - s * 0.4); g.closePath();
      g.fillStyle = '#ffd34d'; g.fill(); g.lineWidth = lw; g.strokeStyle = OL; g.stroke();
    }
    // big head
    U_blob(g, x, y - s * 0.17, s * 0.42, s * 0.35, GR, lw);
    g.fillStyle = GL; g.beginPath(); g.ellipse(x - s * 0.16, y - s * 0.34, s * 0.14, s * 0.07, -0.4, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(x - s * 0.18, y - s * 0.36, s * 0.07, s * 0.03, -0.4, 0, 6.283); g.fill();
    // snout
    U_blob(g, x, y - s * 0.02, s * 0.17, s * 0.1, '#a5f0b8', lw * 0.8);
    g.fillStyle = OL; g.beginPath(); g.arc(x - s * 0.06, y - s * 0.04, s * 0.02, 0, 6.283); g.arc(x + s * 0.06, y - s * 0.04, s * 0.02, 0, 6.283); g.fill();
    const blink = (t % 3.2) > 3.05;
    for (let i = -1; i <= 1; i += 2) {
      const ex = x + i * s * 0.17, ey = y - s * 0.21;
      if (blink) {
        g.strokeStyle = OL; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(ex - s * 0.07, ey); g.lineTo(ex + s * 0.07, ey); g.stroke(); g.lineCap = 'butt';
      } else {
        U_blob(g, ex, ey, s * 0.1, s * 0.12, '#fffbe8', lw * 0.7);
        g.fillStyle = OL; g.beginPath(); g.arc(ex + s * 0.015, ey + (mood === 'worried' ? -s * 0.03 : s * 0.015), s * 0.065, 0, 6.283); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - s * 0.01, ey - s * 0.02, s * 0.025, 0, 6.283); g.fill();
      }
      if (mood === 'worried') {
        g.strokeStyle = OL; g.lineWidth = lw * 0.8; g.lineCap = 'round';
        g.beginPath(); g.moveTo(ex - i * s * 0.08, ey - s * 0.17); g.lineTo(ex + i * s * 0.06, ey - s * 0.21); g.stroke(); g.lineCap = 'butt';
      }
    }
    g.fillStyle = 'rgba(255,120,150,0.5)';
    g.beginPath(); g.ellipse(x - s * 0.3, y - s * 0.06, s * 0.06, s * 0.04, 0, 0, 6.283); g.ellipse(x + s * 0.3, y - s * 0.06, s * 0.06, s * 0.04, 0, 0, 6.283); g.fill();
    g.strokeStyle = OL; g.lineWidth = lw * 0.8; g.lineCap = 'round'; g.beginPath();
    if (mood === 'worried') { g.moveTo(x - s * 0.07, y + s * 0.1); g.quadraticCurveTo(x, y + s * 0.06, x + s * 0.07, y + s * 0.1); }
    else { g.moveTo(x - s * 0.08, y + s * 0.07); g.quadraticCurveTo(x, y + (mood === 'happy' ? s * 0.16 : s * 0.11), x + s * 0.08, y + s * 0.07); }
    g.stroke(); g.lineCap = 'butt';
  }

  // ---------- seeded rng with savable state ----------
  function rnd(st) {
    const a = st.seed = (st.seed + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // ---------- pure board logic (shared by the game and tools/check_bubble.js) ----------
  function isShort(st, r) { return ((r + st.par) & 1) === 1; }
  function widthOf(st, r) { return isShort(st, r) ? COLS - 1 : COLS; }
  function cxOf(st, r, c) { return 1 + 2 * c + (isShort(st, r) ? 1 : 0); }
  function cyOf(st, r) { return 1 + (r + st.drop) * S3; }
  function get(st, r, c) {
    if (r < 0 || c < 0 || c >= widthOf(st, r)) return -1;
    if (r >= st.g.length) return 0;
    return st.g[r][c];
  }
  function nbrs(st, r, c, out) {
    out.length = 0;
    const a = isShort(st, r) ? c : c - 1;
    out.push(r, c - 1, r, c + 1, r - 1, a, r - 1, a + 1, r + 1, a, r + 1, a + 1);
    return out;
  }
  function lowestRow(st) {
    for (let r = st.g.length - 1; r >= 0; r--) { const row = st.g[r]; for (let c = 0; c < COLS; c++) if (row[c]) return r; }
    return -1;
  }
  function trimRows(st) {
    while (st.g.length && !st.g[st.g.length - 1].some((v) => v)) st.g.pop();
  }
  function count(st) { let n = 0; for (const row of st.g) for (let c = 0; c < COLS; c++) if (row[c]) n++; return n; }

  const NB = [];
  // traces a shot; returns {x, y, r, c}; fills pts with [x, y, x, y ...] (start, bounces, end)
  function trace(st, ang, pts, out) {
    let x = SX, y = SY, vx = Math.cos(ang), vy = -Math.sin(ang);
    if (pts) { pts.length = 0; pts.push(x, y); }
    const step = 0.18, top = cyOf(st, 0);
    let hit = false;
    for (let i = 0; i < 3000; i++) {
      x += vx * step; y += vy * step;
      if (x < 1) { const bx = 1, by = y - vy * (1 - x) / vx; x = 2 - x; vx = -vx; if (pts) pts.push(bx, by); }
      else if (x > BW - 1) { const bx = BW - 1, by = y - vy * (x - (BW - 1)) / vx; x = 2 * (BW - 1) - x; vx = -vx; if (pts) pts.push(bx, by); }
      if (y <= top) { y = top; hit = true; break; }
      const rr = Math.round((y - 1) / S3 - st.drop);
      for (let r = rr - 1; r <= rr + 1 && !hit; r++) {
        if (r < 0 || r >= st.g.length) continue;
        const cc = Math.round((x - 1 - (isShort(st, r) ? 1 : 0)) / 2);
        const row = st.g[r], w = widthOf(st, r);
        for (let c = cc - 1; c <= cc + 1; c++) {
          if (c < 0 || c >= w || !row[c]) continue;
          const dx = x - cxOf(st, r, c), dy = y - cyOf(st, r);
          if (dx * dx + dy * dy < HIT * HIT) { hit = true; break; }
        }
      }
      if (hit) break;
    }
    if (pts) pts.push(x, y);
    // snap to the nearest free cell that is attached (row 0 or touching a bubble)
    const rr = Math.round((y - 1) / S3 - st.drop);
    let best = 1e9, br = -1, bc = -1;
    for (let r = Math.max(0, rr - 1); r <= rr + 1; r++) {
      const w = widthOf(st, r);
      for (let c = 0; c < w; c++) {
        if (get(st, r, c) !== 0) continue;
        const dx = x - cxOf(st, r, c), dy = y - cyOf(st, r), d = dx * dx + dy * dy;
        if (d >= best || d > 9) continue;
        let ok = r === 0;
        if (!ok) { nbrs(st, r, c, NB); for (let i = 0; i < 12; i += 2) if (get(st, NB[i], NB[i + 1]) > 0) { ok = true; break; } }
        if (ok) { best = d; br = r; bc = c; }
      }
    }
    if (br < 0) {
      for (let r = 0; r <= st.g.length; r++) {
        const w = widthOf(st, r);
        for (let c = 0; c < w; c++) {
          if (get(st, r, c) !== 0) continue;
          let ok = r === 0;
          if (!ok) { nbrs(st, r, c, NB); for (let i = 0; i < 12; i += 2) if (get(st, NB[i], NB[i + 1]) > 0) { ok = true; break; } }
          if (!ok) continue;
          const dx = x - cxOf(st, r, c), dy = y - cyOf(st, r), d = dx * dx + dy * dy;
          if (d < best) { best = d; br = r; bc = c; }
        }
      }
    }
    out = out || {};
    out.x = x; out.y = y; out.r = br; out.c = bc;
    return out;
  }

  // puts colour k at (r, c), pops / explodes / drops; res.pop, res.boom, res.fall = [r, c, k ...]
  function place(st, r, c, k, res) {
    res.pop.length = 0; res.fall.length = 0; res.boom.length = 0; res.bombs = 0;
    while (st.g.length <= r) st.g.push(new Array(COLS).fill(0));
    st.g[r][c] = k;
    const R = st.g.length, mark = new Uint8Array(R * COLS);
    const stack = [r, c];
    mark[r * COLS + c] = 1;
    const grp = [];
    while (stack.length) {
      const cc = stack.pop(), rr = stack.pop();
      grp.push(rr, cc);
      nbrs(st, rr, cc, NB);
      for (let i = 0; i < 12; i += 2) {
        const nr = NB[i], nc = NB[i + 1], v = get(st, nr, nc);
        if (v <= 0 || nr >= R) continue;
        if ((v === k || v === RAIN) && !mark[nr * COLS + nc]) { mark[nr * COLS + nc] = 1; stack.push(nr, nc); }
      }
    }
    const bombQ = [];
    const nearBomb = (rr, cc) => {
      nbrs(st, rr, cc, NB);
      for (let i = 0; i < 12; i += 2) if (get(st, NB[i], NB[i + 1]) === BOMB) bombQ.push(NB[i], NB[i + 1]);
    };
    nearBomb(r, c);
    if (grp.length >= 6) {
      for (let i = 0; i < grp.length; i += 2) {
        const rr = grp[i], cc = grp[i + 1];
        res.pop.push(rr, cc, st.g[rr][cc]); st.g[rr][cc] = 0;
      }
      for (let i = 0; i < grp.length; i += 2) nearBomb(grp[i], grp[i + 1]);
    }
    while (bombQ.length) {
      const bc = bombQ.pop(), br = bombQ.pop();
      if (get(st, br, bc) !== BOMB) continue;
      res.bombs++;
      st.g[br][bc] = 0; res.boom.push(br, bc, BOMB);
      const bx = cxOf(st, br, bc), by = cyOf(st, br);
      for (let rr = Math.max(0, br - 2); rr <= Math.min(st.g.length - 1, br + 2); rr++) {
        const w = widthOf(st, rr);
        for (let cc = 0; cc < w; cc++) {
          const v = st.g[rr][cc]; if (!v) continue;
          const dx = cxOf(st, rr, cc) - bx, dy = cyOf(st, rr) - by;
          if (dx * dx + dy * dy > 4.1 * 4.1) continue;
          if (v === BOMB) { bombQ.push(rr, cc); continue; }
          st.g[rr][cc] = 0; res.boom.push(rr, cc, v);
        }
      }
    }
    // anything not hanging from the ceiling falls
    if (res.pop.length || res.boom.length) {
      mark.fill(0);
      const q = [];
      for (let cc = 0; cc < COLS; cc++) if (st.g.length && st.g[0][cc]) { mark[cc] = 1; q.push(0, cc); }
      while (q.length) {
        const cc = q.pop(), rr = q.pop();
        nbrs(st, rr, cc, NB);
        for (let i = 0; i < 12; i += 2) {
          const nr = NB[i], nc = NB[i + 1];
          if (nr < 0 || nr >= R || get(st, nr, nc) <= 0 || mark[nr * COLS + nc]) continue;
          mark[nr * COLS + nc] = 1; q.push(nr, nc);
        }
      }
      for (let rr = 0; rr < st.g.length; rr++) for (let cc = 0; cc < COLS; cc++) {
        const v = st.g[rr][cc];
        if (v && !mark[rr * COLS + cc]) { res.fall.push(rr, cc, v); st.g[rr][cc] = 0; }
      }
    }
    trimRows(st);
    const np = res.pop.length / 3 + res.boom.length / 3, nf = res.fall.length / 3;
    res.gain = np * 10 + (nf ? Math.round(20 * nf * (1 + nf / 6)) : 0);
    st.score += res.gain;
    return res;
  }

  function presentColours(st, out) {
    out.length = 0;
    for (const row of st.g) for (let c = 0; c < COLS; c++) { const v = row[c]; if (v >= 1 && v <= 7 && out.indexOf(v) < 0) out.push(v); }
    out.sort((a, b) => a - b);
    return out;
  }
  const PC = [];
  function pickColour(st) {
    presentColours(st, PC);
    if (!PC.length) return 1 + Math.floor(rnd(st) * st.ncol);
    return PC[Math.floor(rnd(st) * PC.length)];
  }
  function fixColours(st) {
    presentColours(st, PC);
    if (!PC.length) return;
    if (PC.indexOf(st.cur) < 0) st.cur = pickColour(st);
    if (PC.indexOf(st.nxt) < 0) st.nxt = pickColour(st);
  }

  // one new row from the top (無盡)
  function pushRow(st) {
    st.par ^= 1;
    const w = widthOf(st, 0), row = new Array(COLS).fill(0);
    const nc = Math.min(6, st.ncol + Math.floor(st.pushes / 10));
    for (let c = 0; c < w; c++) {
      let v;
      if (c > 0 && rnd(st) < 0.45) v = row[c - 1];
      else if (st.g.length && rnd(st) < 0.35) { const b = st.g[0][Math.min(COLS - 1, c)]; v = b >= 1 && b <= 7 ? b : 0; }
      if (!v) v = 1 + Math.floor(rnd(st) * nc);
      const sp = rnd(st);
      if (st.pushes > 6 && sp < 0.025) v = BOMB;
      else if (st.pushes > 12 && sp < 0.06) v = STONE;
      else if (st.pushes > 18 && sp < 0.075) v = RAIN;
      row[c] = v;
    }
    st.g.unshift(row);
    st.pushes++;
  }

  // after a shot has been placed: next bubble, ceiling drop / new row, end check
  function advance(st) {
    st.shots++;
    st.cur = st.nxt; st.nxt = pickColour(st);
    let dropped = 0;
    if (st.endless) {
      if (!count(st)) { pushRow(st); pushRow(st); dropped = 2; }
      const every = Math.max(3, st.dropEvery - Math.floor(st.shots / 30));
      st.sinceDrop++;
      if (st.sinceDrop >= every) { st.sinceDrop = 0; pushRow(st); dropped++; }
    } else {
      st.sinceDrop++;
      if (st.sinceDrop >= st.dropEvery && count(st)) { st.sinceDrop = 0; st.drop++; dropped = 1; }
    }
    fixColours(st);
    const lr = lowestRow(st);
    if (lr >= 0 && lr + st.drop >= DEATH) st.result = 'lose';
    else if (!st.endless && lr < 0) st.result = 'win';
    return dropped;
  }

  function dropEveryFor(st) { return st.endless ? Math.max(3, st.dropEvery - Math.floor(st.shots / 30)) : st.dropEvery; }

  // ---------- level generation ----------
  function genLevel(L, diff, endless, rng) {
    const Le = endless ? 30 : L + [0, 11, 27][diff];
    const ncol = Math.min(6, 3 + (Le >= 6 ? 1 : 0) + (Le >= 17 ? 1 : 0) + (Le >= 34 ? 1 : 0));
    const rows = endless ? 6 : Math.min(8, 4 + Math.floor(Le / 6));
    const dropEvery = endless ? 6 : Math.max(5, 9 - Math.floor(Le / 9));
    const timer = endless ? 7 : [0, 12, 7][diff];
    const st = { g: [], par: 0, drop: 0, shots: 0, sinceDrop: 0, cur: 1, nxt: 1, seed: Math.floor(rng() * 2147483647), score: 0,
      ncol, dropEvery, timer, endless: !!endless, pushes: 0, result: null };
    const pattern = endless || Le < 4 ? 0 : Math.floor(rng() * 5);
    const pc = Le < 6 ? 0.62 : Math.max(0.3, 0.55 - Le * 0.004);
    for (let r = 0; r < rows; r++) {
      const row = new Array(COLS).fill(0), w = widthOf(st, r);
      for (let c = 0; c < w; c++) {
        if (pattern === 1 && r >= 2 && (r + c) % 4 === 0 && r < rows - 1) continue;
        if (pattern === 2 && r >= rows - 3 && (c < r - rows + 4 || c >= w - (r - rows + 4))) continue;
        if (pattern === 3 && r >= 2 && Math.abs(c - (w - 1) / 2) < 1 && r > rows - 4) continue;
        if (r === rows - 1 && rng() < 0.25) continue;
        let v = 0;
        if (pattern === 4) v = 1 + ((Math.floor(c / 2) + Math.floor(r / 2)) % ncol);
        else if (c > 0 && row[c - 1] && rng() < pc) v = row[c - 1];
        else if (r > 0 && rng() < pc * 0.8) { const up = st.g[r - 1][Math.min(widthOf(st, r - 1) - 1, c)]; if (up >= 1 && up <= 7) v = up; }
        if (!v) v = 1 + Math.floor(rng() * ncol);
        row[c] = v;
      }
      st.g.push(row);
    }
    // specials (never in row 0, so the board can always be emptied)
    const spec = (kind, n) => {
      for (let i = 0, guard = 0; i < n && guard < 200; guard++) {
        const r = 1 + Math.floor(rng() * (st.g.length - 1)), c = Math.floor(rng() * widthOf(st, r));
        const v = st.g[r][c];
        if (v >= 1 && v <= 7) { st.g[r][c] = kind; i++; }
      }
    };
    if (!endless) {
      if (Le >= 8) spec(BOMB, 1 + (Le >= 26 ? 1 : 0));
      if (Le >= 12) spec(STONE, Math.min(6, Math.floor((Le - 4) / 8)));
      if (Le >= 18) spec(RAIN, 1 + (Le >= 40 ? 1 : 0));
    }
    // drop anything that does not hang from the top
    removeFloating(st);
    st.cur = pickColour(st); st.nxt = pickColour(st);
    return st;
  }
  function removeFloating(st) {
    const R = st.g.length, mark = new Uint8Array(R * COLS), q = [];
    for (let c = 0; c < COLS; c++) if (R && st.g[0][c]) { mark[c] = 1; q.push(0, c); }
    while (q.length) {
      const cc = q.pop(), rr = q.pop();
      nbrs(st, rr, cc, NB);
      for (let i = 0; i < 12; i += 2) {
        const nr = NB[i], nc = NB[i + 1];
        if (nr < 0 || nr >= R || get(st, nr, nc) <= 0 || mark[nr * COLS + nc]) continue;
        mark[nr * COLS + nc] = 1; q.push(nr, nc);
      }
    }
    for (let r = 0; r < R; r++) for (let c = 0; c < COLS; c++) if (st.g[r][c] && !mark[r * COLS + c]) st.g[r][c] = 0;
    trimRows(st);
  }
  function cloneState(st) {
    const o = Object.assign({}, st);
    o.g = st.g.map((r) => r.slice());
    return o;
  }

  MG.register({
    id: 'bubble', name: '泡泡龍', icon: '🫧', color: '#4c9bff', endless: true,
    create(api) {
      const U = api.util, L = api.level, DIFF = api.diff || 0, ENDLESS = !!api.endless;
      const st = genLevel(L, DIFF, ENDLESS, api.rng);
      let W, H, u, ox, oy, cache = null, sprites = {}, spriteU = 0;
      function layout() {
        W = api.W; H = api.H;
        u = Math.max(4, Math.min((W - 12) / BW, (H - 64) / BH));
        ox = (W - BW * u) / 2;
        oy = 48 + Math.max(0, (H - 56 - BH * u) / 2);
        cache = null;
      }
      layout();
      const PX = (x) => ox + x * u, PY = (y) => oy + y * u;

      const S = { phase: 'aim', aim: null, ang: Math.PI / 2, shot: null, timer: st.timer, over: false, intro: 0,
        dropAnim: 0, mood: 'idle', moodT: 0, swapT: 0, kick: 0, combo: 0 };
      const res = { pop: [], fall: [], boom: [] };
      const fx = [];           // popping / falling bubbles
      const parts = []; for (let i = 0; i < 220; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 3 });
      let pCur = 0, anim = 0, shake = 0, lastInfo = '', banner = null, flash = 0;
      const floats = [];
      const pts = [], tr = {};
      let hintT = L === 1 && DIFF === 0 && !ENDLESS ? 7 : 0;
      api.score(0);

      function addPart(x, y, vx, vy, life, col, size) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size;
      }
      function colOf(k) { return k === STONE ? '#9aa0b0' : k === BOMB ? '#ffcc4d' : k === RAIN ? '#ffffff' : COLORS[k]; }

      // ---------- shooting ----------
      function fire(ang) {
        if (S.phase !== 'aim' || S.over) return;
        S.ang = ang;
        trace(st, ang, pts, tr);
        const path = pts.slice();
        let len = 0; for (let i = 2; i < path.length; i += 2) len += Math.hypot(path[i] - path[i - 2], path[i + 1] - path[i - 1]);
        S.shot = { path, len, d: 0, k: st.cur, r: tr.r, c: tr.c, x: SX, y: SY, settle: 0 };
        S.phase = 'fly'; S.kick = 1; S.aim = null; hintT = 0;
        api.sfx('shoot');
      }
      function stepShot(dt) {
        const s = S.shot;
        if (s.settle > 0) {
          s.settle += dt;
          const tx = cxOf(st, s.r, s.c), ty = cyOf(st, s.r), k = Math.min(1, s.settle / 0.07);
          s.x = U.lerp(s.fx, tx, k); s.y = U.lerp(s.fy, ty, k);
          if (k >= 1) land();
          return;
        }
        s.d += SPEED * dt;
        let d = s.d, i = 2;
        for (; i < s.path.length; i += 2) {
          const sl = Math.hypot(s.path[i] - s.path[i - 2], s.path[i + 1] - s.path[i - 1]);
          if (d <= sl) { const t = sl ? d / sl : 1; s.x = U.lerp(s.path[i - 2], s.path[i], t); s.y = U.lerp(s.path[i - 1], s.path[i + 1], t); break; }
          d -= sl;
        }
        if (i >= s.path.length) {
          s.x = s.path[s.path.length - 2]; s.y = s.path[s.path.length - 1];
          s.fx = s.x; s.fy = s.y; s.settle = 1e-6;
        } else if (i > 2 && !s.bounced) { s.bounced = true; api.sfx('tap'); }
      }
      function land() {
        const s = S.shot; S.shot = null;
        place(st, s.r, s.c, s.k, res);
        const sx = PX(cxOf(st, s.r, s.c)), sy = PY(cyOf(st, s.r));
        const np = res.pop.length / 3, nb = res.boom.length / 3, nf = res.fall.length / 3;
        for (let i = 0; i < res.pop.length; i += 3) addFx(res.pop[i], res.pop[i + 1], res.pop[i + 2], 'pop', i / 3 * 0.035);
        for (let i = 0; i < res.boom.length; i += 3) addFx(res.boom[i], res.boom[i + 1], res.boom[i + 2], 'pop', 0.02 * Math.random());
        for (let i = 0; i < res.fall.length; i += 3) addFx(res.fall[i], res.fall[i + 1], res.fall[i + 2], 'fall', 0.08 + Math.random() * 0.1);
        if (np || nb) {
          S.combo++;
          api.sfx('pop');
          shake = Math.max(shake, nb ? 10 : 3 + Math.min(5, np));
          S.mood = 'happy'; S.moodT = 1.2;
          if (nb) { banner = { text: '💥 轟！', t: 0, col: '#ffcc4d' }; api.sfx('drop'); flash = 0.25; }
          if (nf >= 3) { banner = { text: nf >= 8 ? '大崩落！+' + res.gain : '掉落 ×' + nf, t: 0, col: '#7dffa8' }; api.sfx('good'); }
          floats.push({ x: sx, y: sy, t: 0, text: '+' + res.gain });
        } else {
          S.combo = 0;
          api.sfx('drop');
          bumpAround(s.r, s.c);
        }
        api.score(st.score);
        const dropped = advance(st);
        if (dropped) {
          S.dropAnim = dropped * S3; shake = Math.max(shake, 5); api.sfx('hit');
          if (!ENDLESS) banner = { text: '⬇ 天花板下降', t: 0, col: '#ff9db0' };
        }
        S.timer = st.timer;
        if (st.result === 'win') { winNow(); return; }
        if (st.result === 'lose') { loseNow(); return; }
        S.phase = 'aim';
      }
      const bump = new Map();
      function bumpAround(r, c) {
        const nb = []; nbrs(st, r, c, nb);
        for (let i = 0; i < 12; i += 2) if (get(st, nb[i], nb[i + 1]) > 0) bump.set(nb[i] * 16 + nb[i + 1], { t: 0.25, dx: cxOf(st, nb[i], nb[i + 1]) - cxOf(st, r, c), dy: cyOf(st, nb[i]) - cyOf(st, r) });
      }
      function addFx(r, c, k, kind, delay) {
        const x = cxOf(st, r, c), y = cyOf(st, r);
        fx.push({ x, y, k, kind, t: -delay, vx: (Math.random() - 0.5) * 6, vy: kind === 'fall' ? -4 - Math.random() * 4 : 0, rot: 0 });
      }
      function winNow() {
        S.over = true; S.phase = 'over';
        for (let i = 0; i < 90; i++) addPart(Math.random() * W, -10, (Math.random() - 0.5) * 200, Math.random() * 200, 2 + Math.random(), COLORS[1 + (i % 7)], 7);
        banner = { text: '全部清除！', t: 0, col: '#7dffa8' };
        S.mood = 'happy'; S.moodT = 9;
        api.win('用了 ' + st.shots + ' 發清空泡泡！');
      }
      function loseNow() {
        S.over = true; S.phase = 'over'; shake = 14; flash = 0.4; S.mood = 'worried'; S.moodT = 99;
        api.sfx('bad');
        api.lose(ENDLESS ? '泡泡壓到底線了！' : '泡泡碰到底線了！');
      }

      // ---------- update ----------
      function update(dt) {
        anim += dt;
        shake = Math.max(0, shake - dt * 30);
        flash = Math.max(0, flash - dt);
        S.intro = Math.min(1, S.intro + dt * 1.6);
        S.dropAnim = Math.max(0, S.dropAnim - dt * S3 * 4);
        S.kick = Math.max(0, S.kick - dt * 6);
        S.swapT = Math.max(0, S.swapT - dt * 5);
        S.moodT -= dt; if (S.moodT <= 0) S.mood = 'idle';
        for (const [key, b] of bump) { b.t -= dt; if (b.t <= 0) bump.delete(key); }
        for (let i = fx.length - 1; i >= 0; i--) {
          const f = fx[i]; f.t += dt;
          if (f.t < 0) continue;
          if (f.kind === 'pop') {
            if (!f.burst) {
              f.burst = true;
              const px = PX(f.x), py = PY(f.y);
              for (let j = 0; j < 7; j++) { const a = Math.random() * 6.283, v = 60 + Math.random() * 160; addPart(px, py, Math.cos(a) * v, Math.sin(a) * v - 60, 0.45 + Math.random() * 0.3, colOf(f.k), 3 + Math.random() * 4); }
            }
            if (f.t > 0.18) fx.splice(i, 1);
          } else {
            f.vy += 60 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += dt * 4;
            f.vx *= 0.99;
            if (f.x < 1 || f.x > BW - 1) f.vx = -f.vx;
            if (f.y > SY + 1) {
              const px = PX(f.x), py = PY(SY + 1);
              for (let j = 0; j < 5; j++) addPart(px, py, (Math.random() - 0.5) * 160, -80 - Math.random() * 160, 0.5, colOf(f.k), 4);
              fx.splice(i, 1);
            }
          }
        }
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
          p.vy += 520 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        }
        for (let i = floats.length - 1; i >= 0; i--) { floats[i].t += dt; if (floats[i].t > 1) floats.splice(i, 1); }
        if (banner) { banner.t += dt; if (banner.t > 1.3) banner = null; }
        hintT -= dt;
        if (api.ended || S.over) return;
        if (S.phase === 'fly' && S.shot) {
          let left = dt;
          while (left > 1e-6 && S.shot) { const h = Math.min(left, 1 / 120); stepShot(h); left -= h; }
        } else if (S.phase === 'aim' && st.timer && S.intro >= 1) {
          S.timer -= dt;
          if (S.timer <= 0) { const a = S.aim && S.aim.ok ? S.aim.ang : S.ang; fire(a); }
        }
        let info;
        if (ENDLESS) info = '無盡：泡泡會一直往下長 · 撐越久分數越高';
        else if (L === 1 && DIFF === 0 && st.shots < 3) info = '拖曳瞄準、放開發射，3 顆同色就消除';
        else info = '剩 ' + count(st) + ' 顆 · 再 ' + (dropEveryFor(st) - st.sinceDrop) + ' 發天花板下降';
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
      }

      // ---------- drawing ----------
      function buildCache() {
        const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
        const c = document.createElement('canvas');
        c.width = Math.ceil(W * dpr); c.height = Math.ceil(H * dpr);
        const x = c.getContext('2d'); x.scale(dpr, dpr);
        drawBackground(x, W, H, U, ox, oy, u);
        x.fillStyle = 'rgba(255,255,255,0.32)';
        U.rr(x, ox - 5, oy - 5, BW * u + 10, (SY + 1.5) * u + 10, 16); x.fill();
        x.strokeStyle = OL; x.lineWidth = 3;
        U.rr(x, ox - 5, oy - 5, BW * u + 10, (SY + 1.5) * u + 10, 16); x.stroke();
        x.strokeStyle = 'rgba(255,255,255,0.7)'; x.lineWidth = 2;
        U.rr(x, ox - 1, oy - 1, BW * u + 2, (SY + 1.5) * u + 2, 13); x.stroke();
        cache = c;
        if (spriteU !== u) {
          spriteU = u; sprites = {};
          for (let k = 1; k <= 10; k++) {
            const sc = document.createElement('canvas'), sz = Math.ceil(u * 2.4 * dpr);
            sc.width = sz; sc.height = sz;
            const sx = sc.getContext('2d'); sx.scale(dpr, dpr);
            drawBubbleArt(sx, u * 1.2, u * 1.2, u, k, U);
            sprites[k] = sc;
          }
        }
      }
      function bubble(g, x, y, k, sc) {
        const sp = sprites[k];
        const s = u * 2.4 * (sc || 1);
        if (sp) g.drawImage(sp, x - s / 2, y - s / 2, s, s);
      }

      function draw(g) {
        if (!cache) buildCache();
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        g.drawImage(cache, 0, 0, W, H);
        const dOff = -S.dropAnim;
        // ceiling plate
        const ceilY = PY(st.drop * S3 + dOff);
        const cy0 = Math.max(oy - 4, ceilY);
        if (!ENDLESS && cy0 > oy) {
          const gr = g.createLinearGradient(0, oy, 0, cy0);
          gr.addColorStop(0, '#9a6a3c'); gr.addColorStop(1, '#c98f5a');
          g.fillStyle = gr; g.fillRect(ox, oy - 4, BW * u, cy0 - oy + 4);
          g.strokeStyle = 'rgba(42,26,20,0.45)'; g.lineWidth = 2;
          for (let yy = oy + u * 0.8; yy < cy0 - 2; yy += u * 0.8) { g.beginPath(); g.moveTo(ox, yy); g.lineTo(ox + BW * u, yy); g.stroke(); }
        }
        U.rr(g, ox - 2, cy0 - 6, BW * u + 4, 8, 4); g.fillStyle = '#ffd34a'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(ox + 3, cy0 - 4, BW * u - 6, 2);
        g.fillStyle = OL;
        for (let i = 0; i < COLS; i++) { g.beginPath(); g.arc(ox + (i * 2 + 1) * u, cy0 - 2, 1.8, 0, 6.283); g.fill(); }
        // death line
        const danger = lowestRow(st) + st.drop >= DEATH - 2;
        const dly = PY(1 + (DEATH - 0.5) * S3);
        g.strokeStyle = danger ? (Math.sin(anim * 12) > 0 ? '#ff2d45' : 'rgba(255,93,108,0.5)') : 'rgba(230,60,80,0.6)';
        g.setLineDash([8, 6]); g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(ox, dly); g.lineTo(ox + BW * u, dly); g.stroke(); g.setLineDash([]);
        // bubbles
        for (let r = 0; r < st.g.length; r++) {
          const row = st.g[r], w = widthOf(st, r);
          const ik = U.clamp(S.intro * 1.8 - (st.g.length - r) * 0.06, 0, 1);
          const yy = PY(cyOf(st, r) + dOff) - (1 - U.easeOutCubic(ik)) * H * 0.6;
          for (let c = 0; c < w; c++) {
            const v = row[c]; if (!v) continue;
            let x = PX(cxOf(st, r, c)), y = yy;
            const b = bump.get(r * 16 + c);
            if (b) { const k = Math.sin(b.t / 0.25 * Math.PI) * 0.12 * u; const dl = Math.hypot(b.dx, b.dy) || 1; x += b.dx / dl * k; y += b.dy / dl * k; }
            bubble(g, x, y, v, 1);
            if (v === BOMB) {
              const fxp = x + u * 0.5, fyp = y - u * 0.95;
              g.fillStyle = Math.sin(anim * 20 + c) > 0 ? '#fff6a8' : '#ff8f3d';
              g.beginPath(); g.arc(fxp, fyp, u * 0.16 + Math.random() * u * 0.06, 0, 6.283); g.fill();
            }
          }
        }
        if (danger && !S.over) { g.fillStyle = 'rgba(255,40,60,' + (0.06 + 0.05 * Math.sin(anim * 8)) + ')'; g.fillRect(ox, dly - 3 * u, BW * u, 3 * u); }
        // aim preview
        if (S.phase === 'aim' && S.aim && S.aim.ok && !S.over) {
          trace(st, S.aim.ang, pts, tr);
          const maxB = DIFF === 0 ? 9 : DIFF === 1 ? 2 : 1;
          const capLen = DIFF === 2 ? 15 : 1e9;
          let tot = 0, nb = 0;
          const col = colOf(st.cur);
          g.fillStyle = col; g.strokeStyle = OL; g.lineWidth = 1.5;
          for (let i = 2; i < pts.length; i += 2) {
            const ax = pts[i - 2], ay = pts[i - 1], bx = pts[i], by = pts[i + 1];
            const sl = Math.hypot(bx - ax, by - ay);
            for (let d = (0.9 - (anim * 3) % 0.9); d < sl; d += 0.9) {
              if (tot + d > capLen) break;
              const t = d / sl, k = 1 - Math.min(1, (tot + d) / 40);
              g.globalAlpha = 0.35 + 0.65 * k;
              g.beginPath(); g.arc(PX(ax + (bx - ax) * t), PY(ay + (by - ay) * t), Math.max(2.2, u * 0.19), 0, 6.283); g.fill(); g.stroke();
            }
            tot += sl;
            if (i < pts.length - 2) { nb++; if (nb >= maxB) break; }
            if (tot > capLen) break;
          }
          g.globalAlpha = 1;
          if (DIFF === 0 && tr.r >= 0) {
            g.globalAlpha = 0.45 + 0.15 * Math.sin(anim * 8);
            g.strokeStyle = OL; g.lineWidth = 2.5; g.setLineDash([4, 3]);
            g.beginPath(); g.arc(PX(cxOf(st, tr.r, tr.c)), PY(cyOf(st, tr.r)), u * 0.9, 0, 6.283); g.stroke(); g.setLineDash([]);
            g.globalAlpha = 1;
          }
        }
        // shot in flight
        if (S.shot) {
          const s = S.shot;
          g.globalAlpha = 0.3; bubble(g, PX(s.x - Math.cos(S.ang) * 0.6), PY(s.y + Math.sin(S.ang) * 0.6), s.k, 0.8); g.globalAlpha = 1;
          bubble(g, PX(s.x), PY(s.y), s.k, 1);
        }
        // pops & falls
        for (const f of fx) {
          if (f.t < 0) { bubble(g, PX(f.x), PY(f.y + dOff), f.k, 1); continue; }
          if (f.kind === 'pop') {
            const k = f.t / 0.18;
            g.globalAlpha = 1 - k; bubble(g, PX(f.x), PY(f.y), f.k, 1 + k * 0.5); g.globalAlpha = 1;
            g.strokeStyle = 'rgba(255,255,255,' + (1 - k) + ')'; g.lineWidth = 2;
            g.beginPath(); g.arc(PX(f.x), PY(f.y), u * (1 + k * 0.9), 0, 6.283); g.stroke();
          } else bubble(g, PX(f.x), PY(f.y), f.k, 1);
        }
        drawLauncher(g);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.6); g.fillStyle = p.col;
          g.beginPath(); g.arc(p.x, p.y, p.size / 2, 0, 6.283); g.fill();
        }
        g.globalAlpha = 1;
        for (const f of floats) {
          g.globalAlpha = 1 - f.t;
          U_otext(g, f.text, f.x, f.y - 30 * f.t - 10, 19, '#ffe27a', 4);
        }
        g.globalAlpha = 1;
        g.restore();
        if (flash > 0) { g.fillStyle = 'rgba(255,240,200,' + flash * 0.8 + ')'; g.fillRect(0, 0, W, H); }
        drawHud(g);
      }

      function swapPos() { return { x: PX(SX - 4.6), y: PY(SY + 0.35), r: Math.max(24, u * 1.25) }; }
      function drawLauncher(g) {
        const x = PX(SX), y = PY(SY);
        const a = S.aim && S.aim.ok ? S.aim.ang : S.ang;
        // base
        // barrel (behind the base)
        g.save(); g.translate(x, y); g.rotate(-a + Math.PI / 2);
        const kick = S.kick * u * 0.35;
        U.rr(g, -u * 0.55, -u * 2.6 + kick, u * 1.1, u * 2.2, u * 0.35); g.fillStyle = '#ff9ec4'; g.fill();
        g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.55)'; U.rr(g, -u * 0.38, -u * 2.35 + kick, u * 0.22, u * 1.6, u * 0.11); g.fill();
        U.rr(g, -u * 0.65, -u * 2.75 + kick, u * 1.3, u * 0.42, u * 0.2); g.fillStyle = '#ffd34a'; g.fill(); g.stroke();
        g.restore();
        // base: chunky purple mound with gold studs
        g.beginPath(); g.ellipse(x, y + u * 0.9, u * 2.2, u * 0.95, 0, Math.PI, 0); g.closePath();
        g.fillStyle = '#8a64d6'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(x - u * 0.9, y + u * 0.45, u * 0.6, u * 0.18, -0.3, 0, 6.283); g.fill();
        for (let i = -2; i <= 2; i++) { g.beginPath(); g.arc(x + i * u * 0.85, y + u * 0.7 - (2 - Math.abs(i)) * u * 0.08, u * 0.12, 0, 6.283); g.fillStyle = '#ffd34a'; g.fill(); g.lineWidth = 1.5; g.stroke(); }
        // timer ring (普通 / 困難 / 無盡)
        if (st.timer && S.phase === 'aim' && !S.over) {
          const k = Math.max(0, S.timer / st.timer);
          g.lineWidth = 7; g.strokeStyle = OL;
          g.beginPath(); g.arc(x, y, u * 1.55, 0, 6.283); g.stroke();
          g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,0.5)';
          g.beginPath(); g.arc(x, y, u * 1.55, 0, 6.283); g.stroke();
          g.strokeStyle = k < 0.3 ? (Math.sin(anim * 18) > 0 ? '#ff2d45' : '#ffcc4d') : '#7dffa8';
          g.beginPath(); g.arc(x, y, u * 1.55, -Math.PI / 2, -Math.PI / 2 + k * 6.283); g.stroke();
        }
        if (S.phase === 'aim' && !S.over) bubble(g, x, y, st.cur, 1 - S.swapT * 0.3);
        // next bubble (tap to swap)
        const sp = swapPos();
        g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.arc(sp.x, sp.y, sp.r, 0, 6.283); g.fill();
        g.strokeStyle = OL; g.lineWidth = 3; g.stroke();
        bubble(g, sp.x, sp.y, st.nxt, 0.72 + S.swapT * 0.3);
        U_otext(g, '⇄ 換', sp.x, sp.y + sp.r + 9, 12, '#ffffff', 3);
        drawHero(g, PX(SX + 5), PY(SY + 0.05), u * 2.5, S.over && st.result === 'lose' ? 'worried' : (lowestRow(st) + st.drop >= DEATH - 2 ? 'worried' : S.mood), anim, U);
        if (hintT > 0 && S.phase === 'aim' && !S.aim) {
          g.globalAlpha = Math.min(1, hintT) * (0.6 + 0.4 * Math.sin(anim * 5));
          const k = (anim * 0.7) % 1;
          U.text(g, '👆', x - u * 3 + k * u * 6, y - u * 6 - k * u * 2, 34, '#fff', 'center', 900);
          U_otext(g, '拖曳瞄準 · 放開發射', x, y - u * 9, 18, '#ffffff', 4);
          g.globalAlpha = 1;
        }
      }

      function drawHud(g) {
        const left = ENDLESS ? '分數 ' + st.score : '🫧 ' + count(st);
        U_otext(g, left, ox + 4, 24, 17, '#ffffff', 4, 'left');
        if (ENDLESS) U_otext(g, '最高 ' + Math.max(api.best || 0, st.score), W / 2, 24, 15, '#ffe27a', 4);
        else U_otext(g, '分數 ' + st.score, W / 2, 24, 15, '#ffffff', 4);
        // shots until the ceiling drops
        const every = dropEveryFor(st), leftN = every - st.sinceDrop;
        const bx = ox + BW * u - 4;
        U_otext(g, '⬇', bx - every * 11 - 8, 24, 14, leftN <= 1 ? '#ff5d6c' : '#ffffff', 3);
        g.lineWidth = 1.5; g.strokeStyle = OL;
        for (let i = 0; i < every; i++) {
          g.fillStyle = i < leftN ? (leftN <= 1 ? '#ff5d6c' : '#ffffff') : 'rgba(42,26,20,0.25)';
          g.beginPath(); g.arc(bx - (every - 1 - i) * 11 - 2, 24, 4, 0, 6.283); g.fill(); g.stroke();
        }
        if (banner) {
          const k = Math.min(1, banner.t / 0.3);
          g.globalAlpha = banner.t > 1 ? Math.max(0, 1 - (banner.t - 1) / 0.3) : 1;
          const sz = Math.min(38, W / 10) * U.easeOutBack(k);
          g.font = '900 ' + sz + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 7; g.strokeStyle = OL; g.lineJoin = 'round';
          g.strokeText(banner.text, W / 2, H * 0.42); g.fillStyle = banner.col; g.fillText(banner.text, W / 2, H * 0.42);
          g.globalAlpha = 1;
        }
      }

      // ---------- input ----------
      function setAim(x, y) {
        const a = S.aim; if (!a) return;
        const sx = PX(SX), sy = PY(SY);
        let ang = Math.atan2(sy - y, x - sx);
        if (ang < 0) ang = ang < -Math.PI / 2 ? Math.PI - AMIN : AMIN;
        a.ang = U.clamp(ang, AMIN, Math.PI - AMIN);
        a.ok = Math.hypot(x - sx, y - sy) > u * 0.8;
        a.cancel = y > sy + u * 1.4;
      }
      function down(x, y) {
        if (api.ended || S.over || S.phase !== 'aim') return;
        const sp = swapPos();
        if (Math.hypot(x - sp.x, y - sp.y) < sp.r + 6) {
          const t = st.cur; st.cur = st.nxt; st.nxt = t; S.swapT = 1; api.sfx('tap'); return;
        }
        S.aim = { ang: S.ang, ok: false, cancel: false };
        setAim(x, y); hintT = 0;
      }
      function move(x, y) { if (S.aim) setAim(x, y); }
      function up(x, y) {
        if (!S.aim) return;
        setAim(x, y);
        const a = S.aim; S.aim = null;
        if (S.phase !== 'aim' || api.ended || S.over) return;
        if (a.ok && !a.cancel) fire(a.ang);
      }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _s: S, _st: st,
        _k: { trace, place, advance, cloneState, count, lowestRow, nbrs, get, cxOf, cyOf, widthOf,
          SX, SY, DEATH, COLS, STONE, BOMB, RAIN, AMIN, get u() { return u; }, PX, PY, swapPos },
      };
    },
  });
})();
