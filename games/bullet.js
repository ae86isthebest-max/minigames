// 子彈反彈 — Mr Bullet-style ricochet puzzle: drag to aim (laser sight), release to fire. Bullets
// ricochet off concrete and steel, pass through enemies and glass, stop in wood, blow up barrels and
// cut ropes. Kill every enemy with the bullets you have. Slow motion on the final kill.
(function () {
  'use strict';

  const RW = 10, RH = 15;           // room size (units)
  const VB = 24;                    // bullet speed (units / s)
  const GRAV = 40;                  // fall acceleration for weights
  const ER = 2.3;                   // explosion radius
  const EW = 0.35, EH = 1.5;        // enemy half-width / height
  const STEP = 0.003;               // solver angle step
  const TAU = Math.PI * 2;

  // ---------- art: 卡通 Q 版 (thick outlines, chibi agent + chibi bad guys) ----------
  const OL = '#2a1a14';
  function U_lcg(seed) { let a = seed; return () => { a = (a * 9301 + 49297) % 233280; return a / 233280; }; }
  function U_blob(g, x, y, rx, ry, fill, lw) {
    g.beginPath(); g.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, TAU);
    g.fillStyle = fill; g.fill(); g.lineWidth = lw; g.strokeStyle = OL; g.stroke();
  }
  function U_limb(g, x1, y1, x2, y2, w, col, lw) {
    g.lineCap = 'round';
    g.strokeStyle = OL; g.lineWidth = w + lw * 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.lineCap = 'butt';
  }
  function U_otext(g, str, x, y, size, col, lw) {
    g.font = '900 ' + size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = lw || 4; g.strokeStyle = OL; g.strokeText(str, x, y);
    g.fillStyle = col; g.fillText(str, x, y);
  }
  function drawBackground(x, W, H, ox, oy, s, U) {
    const R = U_lcg(23);
    const rw = RW * s, rh = RH * s;
    // night city sky
    let gr = x.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#1c1840'); gr.addColorStop(0.5, '#3a2c6b'); gr.addColorStop(1, '#5c3a72');
    x.fillStyle = gr; x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(255,255,230,0.8)';
    for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(R() * W, R() * H, 0.6 + R() * 1.2, 0, TAU); x.fill(); }
    x.fillStyle = 'rgba(255,240,190,0.95)'; x.beginPath(); x.arc(W * 0.84, Math.max(26, oy * 0.45), 16, 0, TAU); x.fill();
    x.fillStyle = 'rgba(220,200,150,0.6)'; x.beginPath(); x.arc(W * 0.84 - 5, Math.max(26, oy * 0.45) - 3, 4, 0, TAU); x.fill();
    // skyline: building tops peeking over the cut-away room
    for (let bx = -10; bx < W; ) {
      const bw = 34 + R() * 46, top = oy - 18 - R() * 50;
      x.beginPath(); x.rect(bx, top, bw, H - top);
      x.fillStyle = ['#2d2550', '#352a5e', '#3f3168'][Math.floor(R() * 3)]; x.fill();
      x.lineWidth = 2.5; x.strokeStyle = OL; x.stroke();
      if (R() < 0.4) { x.fillStyle = OL; x.fillRect(bx + bw * 0.4, top - 10, 3, 10); }
      for (let wy = top + 8; wy < oy - 6; wy += 13) for (let wx = bx + 6; wx < bx + bw - 9; wx += 11) {
        x.fillStyle = R() < 0.3 ? '#ffcf6a' : 'rgba(0,0,0,0.35)'; x.fillRect(wx, wy, 6, 7);
      }
      bx += bw + 2;
    }
    // street below the building
    const fy = oy + rh;
    x.fillStyle = '#3b3550'; x.fillRect(0, fy, W, H - fy);
    x.fillStyle = 'rgba(255,214,120,0.5)';
    for (let k = 10; k < W; k += 46) x.fillRect(k, fy + Math.min(40, (H - fy) * 0.6), 22, 4);
    // building shell (thick brick frame around the room)
    const fw = Math.max(5, Math.min(ox, 9));
    U.rr(x, ox - fw, oy - fw, rw + fw * 2, rh + fw * 2, 10);
    x.fillStyle = '#9a4f3c'; x.fill(); x.lineWidth = 3; x.strokeStyle = OL; x.stroke();
    // wallpaper
    gr = x.createLinearGradient(0, oy, 0, oy + rh);
    gr.addColorStop(0, '#fbe9c8'); gr.addColorStop(1, '#f0d3a4');
    x.fillStyle = gr; x.fillRect(ox, oy, rw, rh);
    x.fillStyle = 'rgba(255,255,255,0.22)';
    for (let k = 0; k < RW; k += 1) x.fillRect(ox + k * s, oy, s * 0.42, rh);
    x.fillStyle = 'rgba(214,150,95,0.18)';
    for (let r = 0; r < RH; r += 1) for (let c = (r % 2) * 0.5 + 0.25; c < RW; c += 1) {
      x.beginPath(); x.moveTo(ox + c * s, oy + (r + 0.35) * s); x.lineTo(ox + (c + 0.08) * s, oy + (r + 0.5) * s);
      x.lineTo(ox + c * s, oy + (r + 0.65) * s); x.lineTo(ox + (c - 0.08) * s, oy + (r + 0.5) * s); x.fill();
    }
    // faded wall decor (background only, kept low-contrast so it never reads as cover)
    x.globalAlpha = 0.3;
    const deco = [[1.2, 2.2, 1.6, 1.2, '#7ab0e0'], [7.2, 6.6, 1.3, 1.6, '#e08a7a'], [3.6, 11.4, 1.4, 1.0, '#8ccf7a']];
    for (const d of deco) {
      U.rr(x, ox + d[0] * s, oy + d[1] * s, d[2] * s, d[3] * s, 4); x.fillStyle = '#b07a43'; x.fill();
      x.lineWidth = 2; x.strokeStyle = OL; x.stroke();
      x.fillStyle = d[4]; x.fillRect(ox + (d[0] + 0.15) * s, oy + (d[1] + 0.15) * s, (d[2] - 0.3) * s, (d[3] - 0.3) * s);
    }
    x.beginPath(); x.arc(ox + 5 * s, oy + 1.4 * s, s * 0.55, 0, TAU); x.fillStyle = '#fffbe8'; x.fill(); x.lineWidth = 2; x.strokeStyle = OL; x.stroke();
    x.beginPath(); x.moveTo(ox + 5 * s, oy + 1.4 * s); x.lineTo(ox + 5 * s, oy + 1.05 * s); x.moveTo(ox + 5 * s, oy + 1.4 * s); x.lineTo(ox + 5.25 * s, oy + 1.5 * s); x.stroke();
    x.globalAlpha = 1;
    // crown moulding + skirting board
    x.fillStyle = '#c98f5a'; x.fillRect(ox, oy, rw, Math.max(4, s * 0.14));
    x.fillStyle = 'rgba(42,26,20,0.35)'; x.fillRect(ox, oy + Math.max(4, s * 0.14), rw, 2);
    x.fillStyle = '#b8794a'; x.fillRect(ox, fy - s * 0.3, rw, s * 0.3);
    x.fillStyle = 'rgba(255,230,190,0.35)'; x.fillRect(ox, fy - s * 0.3, rw, 2);
    x.fillStyle = OL; x.fillRect(ox, fy - s * 0.3 - 1, rw, 2);
    // soft vignette
    gr = x.createRadialGradient(ox + rw / 2, oy + rh * 0.4, s, ox + rw / 2, oy + rh * 0.5, rh * 0.75);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(90,40,10,0.18)');
    x.fillStyle = gr; x.fillRect(ox, oy, rw, rh);
    x.lineWidth = 3; x.strokeStyle = OL; x.strokeRect(ox, oy, rw, rh);
  }
  function drawWall(g, x, y, w, h, U) {
    const r = Math.min(6, w / 2, h / 2);
    U_rr(g, x, y, w, h, r); g.fillStyle = '#a9b2c9'; g.fill();
    g.save(); g.clip();
    g.strokeStyle = 'rgba(55,60,90,0.22)'; g.lineWidth = 1.5;
    const bh = 12, bw = 24;
    for (let row = 0, yy = y + bh; yy < y + h; row++, yy += bh) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); }
    for (let row = 0, yy = y; yy < y + h; row++, yy += bh) for (let xx = x + (row % 2 ? bw / 2 : bw); xx < x + w; xx += bw) { g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, yy + bh); g.stroke(); }
    g.fillStyle = 'rgba(30,30,60,0.15)'; g.fillRect(x, y + h * 0.72, w, h * 0.28);
    g.restore();
    if (w > 9 && h > 9) { U_rr(g, x + 3, y + 3, w - 6, Math.min(5, h * 0.22), 2.5); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fill(); }
    U_rr(g, x, y, w, h, r); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
  }
  function drawSteel(g, x1, y1, x2, y2, th, t) {
    g.lineCap = 'round';
    g.strokeStyle = OL; g.lineWidth = th + 5; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.strokeStyle = '#8fb4e0'; g.lineWidth = th; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    const l = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / l, ny = (x2 - x1) / l, o = th * 0.22;
    g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = Math.max(1.5, th * 0.25);
    g.beginPath(); g.moveTo(x1 - nx * o, y1 - ny * o); g.lineTo(x2 - nx * o, y2 - ny * o); g.stroke();
    const k = 0.5 + 0.45 * Math.sin(t * 1.5);
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(x1 + (x2 - x1) * k, y1 + (y2 - y1) * k, th * 0.35, 0, TAU); g.fill();
    g.fillStyle = OL;
    for (let q = 0.15; q < 1; q += 0.35) { g.beginPath(); g.arc(x1 + (x2 - x1) * q, y1 + (y2 - y1) * q, th * 0.17, 0, TAU); g.fill(); }
    g.lineCap = 'butt';
  }
  function drawWood(g, x, y, w, h) {
    const r = Math.min(4, w / 3, h / 3);
    U_rr(g, x, y, w, h, r); g.fillStyle = '#e0a15c'; g.fill();
    g.strokeStyle = '#a8692f'; g.lineWidth = 2; g.beginPath();
    if (w > h * 0.6 && h > w * 0.6) {
      const m = Math.min(w, h) * 0.16;
      g.rect(x + m, y + m, w - m * 2, h - m * 2); g.moveTo(x + m, y + m); g.lineTo(x + w - m, y + h - m);
    } else if (w >= h) { for (let k = h / 3; k < h - 1; k += h / 3) { g.moveTo(x + 2, y + k); g.lineTo(x + w - 2, y + k); } }
    else { for (let k = w / 3; k < w - 1; k += w / 3) { g.moveTo(x + k, y + 2); g.lineTo(x + k, y + h - 2); } }
    g.stroke();
    if (w > 8 && h > 8) { g.fillStyle = 'rgba(255,240,200,0.45)'; U_rr(g, x + 3, y + 3, w - 6, Math.min(4, h / 5), 2); g.fill(); }
    U_rr(g, x, y, w, h, r); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
  }
  function drawGlass(g, x, y, w, h, t) {
    U_rr(g, x, y, w, h, Math.min(3, w / 2, h / 2)); g.fillStyle = 'rgba(160,225,255,0.55)'; g.fill();
    g.lineWidth = 2; g.strokeStyle = '#2b5f80'; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1.8; g.lineCap = 'round';
    g.beginPath();
    if (h > w) { g.moveTo(x + w * 0.3, y + h * 0.12); g.lineTo(x + w * 0.7, y + h * 0.24); g.moveTo(x + w * 0.3, y + h * 0.3); g.lineTo(x + w * 0.55, y + h * 0.37); }
    else { g.moveTo(x + w * 0.1, y + h * 0.3); g.lineTo(x + w * 0.2, y + h * 0.7); g.moveTo(x + w * 0.26, y + h * 0.3); g.lineTo(x + w * 0.31, y + h * 0.55); }
    g.stroke(); g.lineCap = 'butt';
  }
  function drawBarrel(g, cx, by, s, t) {
    const w = 0.7 * s, h = 0.9 * s, x = cx - w / 2, y = by - h, lw = Math.max(1.8, s * 0.07);
    U_rr(g, x, y, w, h, w * 0.28); g.fillStyle = '#e8463c'; g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)'; U_rr(g, x + w * 0.14, y + h * 0.1, w * 0.14, h * 0.6, w * 0.07); g.fill();
    g.fillStyle = '#a82a2a'; g.fillRect(x, y + h * 0.18, w, h * 0.07); g.fillRect(x, y + h * 0.75, w, h * 0.07);
    U_rr(g, x, y, w, h, w * 0.28); g.lineWidth = lw; g.strokeStyle = OL; g.stroke();
    // hazard sign
    const sx = cx, sy = y + h * 0.5, r = w * 0.28;
    g.beginPath(); g.moveTo(sx, sy - r); g.lineTo(sx + r, sy + r * 0.75); g.lineTo(sx - r, sy + r * 0.75); g.closePath();
    g.fillStyle = '#ffd34a'; g.fill(); g.lineWidth = lw * 0.7; g.strokeStyle = OL; g.lineJoin = 'round'; g.stroke();
    g.fillStyle = OL; g.fillRect(sx - r * 0.09, sy - r * 0.4, r * 0.18, r * 0.65); g.beginPath(); g.arc(sx, sy + r * 0.48, r * 0.1, 0, TAU); g.fill();
    // lid + fuse spark
    U_blob(g, cx, y + 1, w * 0.22, h * 0.05, '#c23333', lw * 0.7);
    if (Math.sin(t * 6) > 0.3) { g.fillStyle = '#ffe27a'; g.beginPath(); g.arc(cx + w * 0.12, y - 3, 3.2, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(cx + w * 0.12, y - 3, 1.3, 0, TAU); g.fill(); }
  }
  function drawWeight(g, x, y, w, h) {
    g.beginPath(); g.moveTo(x + w * 0.2, y); g.lineTo(x + w * 0.8, y); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath();
    g.fillStyle = '#5b6178'; g.fill();
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.beginPath(); g.moveTo(x + w * 0.24, y + h * 0.1); g.lineTo(x + w * 0.42, y + h * 0.1); g.lineTo(x + w * 0.3, y + h * 0.9); g.lineTo(x + w * 0.12, y + h * 0.9); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x + w * 0.2, y); g.lineTo(x + w * 0.8, y); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath();
    g.lineWidth = 3; g.lineJoin = 'round'; g.strokeStyle = OL; g.stroke();
    U_otext(g, '1T', x + w / 2, y + h * 0.58, Math.round(h * 0.42), '#ffd34a', 3);
    g.strokeStyle = OL; g.lineWidth = 5; g.beginPath(); g.arc(x + w / 2, y - 3, 5, Math.PI, TAU); g.stroke();
    g.strokeStyle = '#9aa3b8'; g.lineWidth = 2.5; g.beginPath(); g.arc(x + w / 2, y - 3, 5, Math.PI, TAU); g.stroke();
  }
  function drawEnemy(g, x, y, s, d, t) {
    // x, y = feet in px; d = death anim {k, rot, flat}; chibi bad guy in a black suit + shades
    g.save();
    g.translate(x, y);
    if (d) { g.rotate(d.rot); g.scale(1, d.flat); }
    const b = d ? 0 : Math.sin(t * 2 + x) * s * 0.025, lw = Math.max(1.6, s * 0.065);
    if (!d) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.ellipse(0, 0, s * 0.4, s * 0.08, 0, 0, TAU); g.fill(); }
    U_blob(g, -s * 0.12, -s * 0.16, s * 0.1, s * 0.14, '#2b2b38', lw);
    U_blob(g, s * 0.12, -s * 0.16, s * 0.1, s * 0.14, '#2b2b38', lw);
    U_blob(g, -s * 0.14, -s * 0.04, s * 0.13, s * 0.06, '#121218', lw);
    U_blob(g, s * 0.14, -s * 0.04, s * 0.13, s * 0.06, '#121218', lw);
    U_blob(g, -s * 0.31, -s * 0.46 + b, s * 0.09, s * 0.16, '#30323f', lw);
    U_blob(g, s * 0.31, -s * 0.46 + b, s * 0.09, s * 0.16, '#30323f', lw);
    U_blob(g, -s * 0.33, -s * 0.31 + b, s * 0.065, s * 0.065, '#ffd9b5', lw * 0.8);
    U_blob(g, s * 0.33, -s * 0.31 + b, s * 0.065, s * 0.065, '#ffd9b5', lw * 0.8);
    U_rr(g, -s * 0.27, -s * 0.72 + b, s * 0.54, s * 0.5, s * 0.15); g.fillStyle = '#30323f'; g.fill(); g.lineWidth = lw; g.strokeStyle = OL; g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-s * 0.11, -s * 0.71 + b); g.lineTo(s * 0.11, -s * 0.71 + b); g.lineTo(0, -s * 0.5 + b); g.closePath(); g.fill();
    g.fillStyle = '#e8463c'; g.beginPath(); g.moveTo(0, -s * 0.68 + b); g.lineTo(s * 0.05, -s * 0.6 + b); g.lineTo(0, -s * 0.44 + b); g.lineTo(-s * 0.05, -s * 0.6 + b); g.closePath(); g.fill();
    g.lineWidth = lw * 0.6; g.strokeStyle = OL; g.stroke();
    // big head
    U_blob(g, 0, -s * 1.07 + b, s * 0.37, s * 0.34, '#ffd9b5', lw);
    g.beginPath(); g.ellipse(0, -s * 1.13 + b, s * 0.38, s * 0.29, 0, Math.PI * 1.02, TAU * 0.99); g.closePath();
    g.fillStyle = '#1e1e28'; g.fill(); g.lineWidth = lw; g.strokeStyle = OL; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.ellipse(-s * 0.12, -s * 1.31 + b, s * 0.1, s * 0.04, -0.3, 0, TAU); g.fill();
    if (d) {
      g.strokeStyle = OL; g.lineWidth = Math.max(1.8, s * 0.05); g.lineCap = 'round';
      for (let i = -1; i <= 1; i += 2) { const ex = i * s * 0.13, ey = -s * 1.04; g.beginPath(); g.moveTo(ex - s * 0.05, ey - s * 0.05); g.lineTo(ex + s * 0.05, ey + s * 0.05); g.moveTo(ex + s * 0.05, ey - s * 0.05); g.lineTo(ex - s * 0.05, ey + s * 0.05); g.stroke(); }
      g.beginPath(); g.arc(0, -s * 0.85, s * 0.06, 0, TAU); g.fillStyle = OL; g.fill();
      g.lineCap = 'butt';
    } else {
      // shades + angry brows + frown
      U_rr(g, -s * 0.29, -s * 1.1 + b, s * 0.26, s * 0.13, s * 0.06); g.fillStyle = '#16161e'; g.fill(); g.lineWidth = lw * 0.7; g.strokeStyle = OL; g.stroke();
      U_rr(g, s * 0.03, -s * 1.1 + b, s * 0.26, s * 0.13, s * 0.06); g.fill(); g.stroke();
      g.fillRect(-s * 0.04, -s * 1.08 + b, s * 0.08, s * 0.03);
      g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(-s * 0.24, -s * 1.08 + b, s * 0.06, s * 0.03); g.fillRect(s * 0.08, -s * 1.08 + b, s * 0.06, s * 0.03);
      g.strokeStyle = OL; g.lineWidth = lw; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-s * 0.26, -s * 1.19 + b); g.lineTo(-s * 0.06, -s * 1.13 + b); g.moveTo(s * 0.26, -s * 1.19 + b); g.lineTo(s * 0.06, -s * 1.13 + b); g.stroke();
      g.beginPath(); g.arc(0, -s * 0.86 + b, s * 0.08, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      g.lineCap = 'butt';
    }
    g.restore();
  }
  function drawHero(g, x, y, s, ang, t, recoil) {
    // x, y = feet in px; ang = aim angle (rad, screen space); chibi secret agent
    const face = Math.cos(ang) >= 0 ? 1 : -1, lw = Math.max(1.6, s * 0.065);
    const ca = Math.cos(ang), sa = Math.sin(ang);
    g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.ellipse(x, y, s * 0.4, s * 0.08, 0, 0, TAU); g.fill();
    U_blob(g, x - s * 0.12, y - s * 0.16, s * 0.1, s * 0.14, '#24304f', lw);
    U_blob(g, x + s * 0.12, y - s * 0.16, s * 0.1, s * 0.14, '#24304f', lw);
    U_blob(g, x - s * 0.14, y - s * 0.04, s * 0.13, s * 0.06, '#5a3420', lw);
    U_blob(g, x + s * 0.14, y - s * 0.04, s * 0.13, s * 0.06, '#5a3420', lw);
    // free arm (behind)
    U_blob(g, x - face * s * 0.31, y - s * 0.46, s * 0.09, s * 0.16, '#3f6fd8', lw);
    U_rr(g, x - s * 0.27, y - s * 0.72, s * 0.54, s * 0.5, s * 0.15); g.fillStyle = '#3f6fd8'; g.fill(); g.lineWidth = lw; g.strokeStyle = OL; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.3)'; U_rr(g, x - s * 0.2, y - s * 0.68, s * 0.12, s * 0.3, s * 0.06); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x - s * 0.11, y - s * 0.71); g.lineTo(x + s * 0.11, y - s * 0.71); g.lineTo(x, y - s * 0.5); g.closePath(); g.fill();
    g.fillStyle = '#1e1e28'; g.beginPath(); g.moveTo(x, y - s * 0.68); g.lineTo(x + s * 0.05, y - s * 0.6); g.lineTo(x, y - s * 0.46); g.lineTo(x - s * 0.05, y - s * 0.6); g.closePath(); g.fill();
    // gun arm sits behind the head; hand + pistol drawn on top below
    const sx = x, sy = y - s * 1.1, reach = 0.44 - recoil * 0.12;
    const hdx = sx + ca * s * reach, hdy = sy + sa * s * reach;
    U_limb(g, x + face * s * 0.18, y - s * 0.62, hdx, hdy, s * 0.15, '#3f6fd8', lw);
    // big head
    const hx = x, hy = y - s * 1.07;
    U_blob(g, hx, hy, s * 0.37, s * 0.34, '#ffd9b5', lw);
    g.beginPath(); g.ellipse(hx, hy - s * 0.07, s * 0.39, s * 0.3, 0, Math.PI * 1.02, TAU * 0.99); g.closePath();
    g.fillStyle = '#6b3a1f'; g.fill(); g.lineWidth = lw; g.strokeStyle = OL; g.stroke();
    g.beginPath(); g.moveTo(hx + face * s * 0.05, hy - s * 0.3); g.quadraticCurveTo(hx + face * s * 0.38, hy - s * 0.32, hx + face * s * 0.36, hy - s * 0.08);
    g.quadraticCurveTo(hx + face * s * 0.2, hy - s * 0.2, hx + face * s * 0.05, hy - s * 0.3); g.fillStyle = '#6b3a1f'; g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.ellipse(hx - face * s * 0.12, hy - s * 0.27, s * 0.1, s * 0.04, -0.3 * face, 0, TAU); g.fill();
    // big round eyes looking down the sights
    for (let i = -1; i <= 1; i += 2) {
      const ex = hx + face * s * 0.06 + i * s * 0.13, ey = hy + s * 0.02;
      U_blob(g, ex, ey, s * 0.075, s * 0.095, '#fffbe8', lw * 0.6);
      g.fillStyle = '#2a1a14'; g.beginPath(); g.arc(ex + ca * s * 0.025, ey + sa * s * 0.03, s * 0.05, 0, TAU); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(ex + ca * s * 0.025 - s * 0.018, ey + sa * s * 0.03 - s * 0.02, s * 0.018, 0, TAU); g.fill();
    }
    g.fillStyle = 'rgba(255,120,120,0.45)'; g.beginPath(); g.ellipse(hx + face * s * 0.27, hy + s * 0.13, s * 0.05, s * 0.03, 0, 0, TAU); g.fill();
    g.strokeStyle = OL; g.lineWidth = lw * 0.8; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx + face * s * 0.02, hy + s * 0.2); g.lineTo(hx + face * s * 0.14, hy + s * 0.18); g.stroke(); g.lineCap = 'butt';
    // earpiece
    g.strokeStyle = OL; g.lineWidth = Math.max(1.2, s * 0.03); g.beginPath(); g.moveTo(hx - face * s * 0.34, hy + s * 0.02); g.quadraticCurveTo(hx - face * s * 0.36, hy + s * 0.24, hx - face * s * 0.2, hy + s * 0.27); g.stroke();
    // gun arm: shoulder -> hand (hand sits on the aim ray so the muzzle matches the real bullet start)
    g.save(); g.translate(hdx, hdy); g.rotate(ang); g.scale(1, face);
    U_rr(g, -s * 0.04, -s * 0.1, s * 0.25, s * 0.1, s * 0.03); g.fillStyle = '#3a3a48'; g.fill(); g.lineWidth = lw * 0.8; g.strokeStyle = OL; g.stroke();
    U_rr(g, -s * 0.02, -s * 0.03, s * 0.07, s * 0.14, s * 0.025); g.fillStyle = '#2a2a33'; g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(-s * 0.01, -s * 0.085, s * 0.18, s * 0.02);
    g.restore();
    U_blob(g, hdx, hdy, s * 0.075, s * 0.075, '#ffd9b5', lw * 0.8);
  }
  function U_rr(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  // ---------- hand-designed rooms (10 x 15, y down, floor at 15) ----------
  // A: agent [x, feetY]; E: enemies [x, feetY]; W: concrete [x,y,w,h]; S: steel [x1,y1,x2,y2];
  // D: wood [x,y,w,h]; G: glass [x,y,w,h]; B: barrels [x, feetY]; H: weights [x, anchorY, rope, w, h]
  const TPL = [
    { n: '第一槍', A: [1.5, 15], E: [[8.3, 15]], D: [[5.6, 14.2, 0.8, 0.8]] },
    { n: '越牆', A: [1.5, 15], E: [[8.2, 15]], W: [[4.6, 8.5, 0.8, 6.5]] },
    { n: '上下層', A: [1.5, 15], E: [[8, 9], [8.6, 15]], W: [[4.5, 9, 5.5, 0.5]] },
    { n: '炸藥桶', A: [1.2, 15], E: [[6, 15], [8, 15], [9.3, 15]], D: [[3.8, 12.6, 0.9, 2.4]], B: [[7, 15]] },
    { n: '吊錘', A: [1.5, 15], E: [[7.2, 15], [8.3, 15]], W: [[5.2, 6, 0.5, 9]], H: [[7.75, 0, 4, 1.9, 1.2]] },
    { n: '鋼板轉角', A: [1.5, 15], E: [[7.5, 5], [8.6, 15]], W: [[3.5, 5, 6.5, 0.5], [5.5, 9, 0.6, 6]], S: [[0.3, 3.6, 2.4, 1.5]] },
    { n: '玻璃地板', A: [1.2, 9], E: [[6.4, 9], [7.8, 9]], W: [[0, 9, 2.8, 0.5], [4.2, 9, 0.3, 6], [9, 9, 0.3, 6]], G: [[4.5, 9, 4.5, 0.25]], D: [[5.0, 7.2, 0.6, 1.8]] },
    { n: '中央高台', A: [5, 9], E: [[1.2, 15], [8.8, 15], [8.5, 4]], W: [[4.3, 9, 1.4, 6], [7, 4, 3, 0.4]] },
    { n: '深井', A: [1.2, 5], E: [[8.6, 15], [3, 15]], W: [[0, 5, 5.5, 0.5], [7, 8.5, 0.4, 6.5]] },
    { n: '書架', A: [8.6, 15], E: [[2, 4.5], [8, 8.5], [2.2, 12]], W: [[0, 4.5, 5.5, 0.4], [4.5, 8.5, 5.5, 0.4], [0, 12, 5.5, 0.4]] },
    { n: '連環桶', A: [1.2, 15], E: [[5.3, 15], [7.3, 15], [9.3, 15]], D: [[2.8, 12.4, 0.7, 2.6]], B: [[4.3, 15], [6.3, 15], [8.3, 15]] },
    { n: '屋頂', A: [1.2, 15], E: [[6, 10], [8.5, 10], [9, 15]], W: [[2.5, 10, 7.5, 0.5]], S: [[0.4, 7.6, 1.9, 6.0]] },
    { n: '木頭碉堡', A: [1.5, 15], E: [[7, 15], [8.4, 15]], D: [[5.5, 11, 3.3, 0.5], [5.5, 11.5, 0.5, 3.5]] },
    { n: '雙吊錘', A: [5, 15], E: [[1.5, 15], [8.5, 15]], W: [[3, 9, 0.4, 6], [6.6, 9, 0.4, 6]], H: [[1.5, 0, 4.5, 1.7, 1.2], [8.5, 0, 4.5, 1.7, 1.2]] },
    { n: '高台狙擊', A: [1.2, 3.5], E: [[6, 15], [9.2, 15], [3.6, 15]], W: [[0, 3.5, 3.2, 0.5], [4.5, 14, 0.5, 1], [7.5, 14, 0.5, 1]] },
    { n: '隔間', A: [1.2, 15], E: [[5, 15], [8.5, 15], [8.8, 3]], W: [[3.3, 0, 0.4, 10.5], [6.6, 6, 0.4, 9], [7.6, 3, 2.4, 0.4]] },
    { n: 'V字鋼板', A: [5, 15], E: [[1.2, 3], [8.8, 3]], W: [[0, 3, 2.5, 0.4], [7.5, 3, 2.5, 0.4]], S: [[0.4, 9, 2.4, 6.4], [9.6, 9, 7.6, 6.4]] },
    { n: '玻璃牆', A: [1.2, 15], E: [[5.4, 15], [8.4, 15], [8, 9]], W: [[4, 9, 6, 0.4]], G: [[4, 9.4, 0.25, 5.6], [6.8, 9.4, 0.25, 5.6]] },
    { n: '桶與吊錘', A: [1.2, 15], E: [[4.8, 15], [7.2, 15], [8.8, 8]], W: [[3, 10, 0.4, 5], [7.5, 8, 2.5, 0.4]], H: [[6, 0, 5, 1.6, 1.2]], B: [[6, 15]] },
    { n: '斜坡', A: [1.2, 15], E: [[8.6, 15], [4.6, 6]], W: [[6.8, 11, 0.4, 4], [3.5, 6, 2.5, 0.4]], S: [[2.6, 15, 4.6, 13.2]] },
    { n: '雙塔', A: [5, 15], E: [[1.75, 9], [8.25, 9], [5, 4.5]], W: [[1, 9, 1.5, 6], [7.5, 9, 1.5, 6], [3.8, 4.5, 2.4, 0.4]] },
    { n: '樓梯', A: [1.2, 15], E: [[4, 13], [6, 11], [8.3, 9]], W: [[3, 13, 7, 2], [5, 11, 5, 2], [7, 9, 3, 2], [0, 5, 4, 0.4]], B: [[9.4, 9]] },
    { n: '地下室', A: [8.6, 4], E: [[2, 10], [4.2, 10], [2, 15], [5, 15]], W: [[6.5, 4, 3.5, 0.4], [0, 10, 7, 0.4]], G: [[7, 10, 3, 0.25]] },
    { n: '鋼鐵走廊', A: [1.2, 15], E: [[8.8, 15], [8.8, 7.5], [6.2, 7.5]], W: [[0, 7.5, 3.5, 0.4], [5, 7.5, 5, 0.4], [6.5, 11.5, 0.4, 3.5]], S: [[3, 2, 6, 4.5]] },
  ];

  // ---------- room model ----------
  function buildRoom(t, mirror) {
    const mx = (x) => (mirror ? RW - x : x);
    const room = { els: [], en: [], ag: null, name: t.n };
    // every element has the same fields (keeps the hot loops monomorphic)
    const mk = (type, x0, y0, x1, y1, ax, ay, bx, by, cx, rope) => ({ type, x0, y0, x1, y1, ax, ay, bx, by, cx, rope });
    const rect = (type, a) => { const x = mirror ? RW - a[0] - a[2] : a[0]; room.els.push(mk(type, x, a[1], x + a[2], a[1] + a[3], 0, 0, 0, 0, x + a[2] / 2, 0)); };
    (t.W || []).forEach((a) => rect('wall', a));
    (t.D || []).forEach((a) => rect('wood', a));
    (t.G || []).forEach((a) => rect('glass', a));
    (t.S || []).forEach((a) => room.els.push(mk('steel', Math.min(mx(a[0]), mx(a[2])), Math.min(a[1], a[3]), Math.max(mx(a[0]), mx(a[2])), Math.max(a[1], a[3]), mx(a[0]), a[1], mx(a[2]), a[3], 0, 0)));
    (t.B || []).forEach((a) => room.els.push(mk('barrel', mx(a[0]) - 0.35, a[1] - 0.9, mx(a[0]) + 0.35, a[1], 0, 0, 0, 0, mx(a[0]), 0)));
    (t.H || []).forEach((a) => { const cx = mx(a[0]); room.els.push(mk('weight', cx - a[3] / 2, a[1] + a[2], cx + a[3] / 2, a[1] + a[2] + a[4], 0, a[1], 0, 0, cx, a[2])); });
    t.E.forEach((a) => room.en.push({ x: mx(a[0]), y: a[1] }));
    room.ag = { x: mx(t.A[0]), y: t.A[1] };
    return finishRoom(room);
  }
  function finishRoom(room) {
    // which glass panes each enemy stands on; where it lands if its floor breaks
    for (const e of room.en) {
      e.glass = -1;
      room.els.forEach((el, i) => { if (el.type === 'glass' && Math.abs(el.y0 - e.y) < 0.06 && e.x + 0.25 > el.x0 && e.x - 0.25 < el.x1) e.glass = i; });
      e.ground = groundBelow(room, e.x, e.y + 0.3, true);
    }
    return room;
  }
  function groundBelow(room, x, y, skipGlass) {
    let best = RH;
    for (const el of room.els) {
      if (el.type === 'steel' || el.type === 'weight' || (skipGlass && el.type === 'glass')) continue;
      if (x + 0.2 > el.x0 && x - 0.2 < el.x1 && el.y0 >= y - 0.01 && el.y0 < best) best = el.y0;
    }
    return best;
  }
  function solidAt(room, x, y) {
    for (const el of room.els) {
      if (el.type === 'steel' || el.type === 'glass') continue;
      if (x > el.x0 && x < el.x1 && y > el.y0 && y < el.y1) return true;
    }
    return false;
  }
  function overlapsSolid(room, x0, y0, x1, y1) {
    if (x0 < 0.05 || x1 > RW - 0.05 || y0 < 0.05 || y1 > RH + 1e-6) return true;
    for (const el of room.els) {
      if (el.type === 'steel') {
        const n = 6; for (let k = 0; k <= n; k++) { const px = el.ax + (el.bx - el.ax) * k / n, py = el.ay + (el.by - el.ay) * k / n; if (px > x0 - 0.1 && px < x1 + 0.1 && py > y0 - 0.1 && py < y1 + 0.1) return true; }
        continue;
      }
      if (el.type === 'weight') { if (x1 > el.x0 && x0 < el.x1 && y1 > el.ay && y0 < el.y1) return true; continue; }
      if (x1 > el.x0 && x0 < el.x1 && y1 > el.y0 + 1e-6 && y0 < el.y1 - 1e-6) return true;
    }
    return false;
  }
  function freshState(room) {
    return { dead: new Uint8Array(room.en.length), gone: new Uint8Array(room.els.length), cut: new Uint8Array(room.els.length), drop: new Float32Array(room.els.length) };
  }
  function cloneState(s) { return { dead: s.dead.slice(), gone: s.gone.slice(), cut: s.cut.slice(), drop: s.drop.slice() }; }
  function muzzle(room, ang) { const sx = room.ag.x, sy = room.ag.y - 1.1; return [sx + Math.cos(ang) * 0.62, sy + Math.sin(ang) * 0.62]; }

  // ---------- ray geometry ----------
  let NX = 0, NY = 0;
  function rayRect(px, py, dx, dy, x0, y0, x1, y1) {
    let tmin = -Infinity, tmax = Infinity, nx = 0, ny = 0;
    if (Math.abs(dx) < 1e-12) { if (px <= x0 || px >= x1) return Infinity; }
    else {
      let t1 = (x0 - px) / dx, t2 = (x1 - px) / dx, n = -1;
      if (t1 > t2) { const q = t1; t1 = t2; t2 = q; n = 1; }
      if (t1 > tmin) { tmin = t1; nx = n; ny = 0; }
      if (t2 < tmax) tmax = t2;
    }
    if (Math.abs(dy) < 1e-12) { if (py <= y0 || py >= y1) return Infinity; }
    else {
      let t1 = (y0 - py) / dy, t2 = (y1 - py) / dy, n = -1;
      if (t1 > t2) { const q = t1; t1 = t2; t2 = q; n = 1; }
      if (t1 > tmin) { tmin = t1; nx = 0; ny = n; }
      if (t2 < tmax) tmax = t2;
    }
    if (tmax < tmin || tmin <= 1e-7) return Infinity;
    NX = nx; NY = ny;
    return tmin;
  }
  // pass-through test (ray may start inside): returns entry t (>= 0) or Infinity
  function rayRectAny(px, py, dx, dy, x0, y0, x1, y1, tHit) {
    let tmin = 0, tmax = tHit;
    if (Math.abs(dx) < 1e-12) { if (px <= x0 || px >= x1) return Infinity; }
    else { let t1 = (x0 - px) / dx, t2 = (x1 - px) / dx; if (t1 > t2) { const q = t1; t1 = t2; t2 = q; } tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); }
    if (Math.abs(dy) < 1e-12) { if (py <= y0 || py >= y1) return Infinity; }
    else { let t1 = (y0 - py) / dy, t2 = (y1 - py) / dy; if (t1 > t2) { const q = t1; t1 = t2; t2 = q; } tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); }
    return tmax >= tmin ? tmin : Infinity;
  }
  function raySeg(px, py, dx, dy, ax, ay, bx, by) {
    const ex = bx - ax, ey = by - ay;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-12) return Infinity;
    const t = ((ax - px) * ey - (ay - py) * ex) / den;
    const u = ((ax - px) * dy - (ay - py) * dx) / den;
    if (t <= 1e-7 || u < 0 || u > 1) return Infinity;
    const len = Math.hypot(ex, ey);
    let nx = -ey / len, ny = ex / len;
    if (nx * dx + ny * dy > 0) { nx = -nx; ny = -ny; }
    NX = nx; NY = ny;
    return t;
  }

  // ---------- one shot: path + every consequence (pure; shared by the game, solver and check) ----------
  const NOOP = { noop: true, self: false, allDead: false, kills: 0 };
  function simulate(room, st0, ang, maxB, light) {
    const s = st0;
    const ev = [];
    const out = { path: [], ev: [], st: null, self: false, kills: 0, endT: 0, bounces: 0 };
    let dx = Math.cos(ang), dy = Math.sin(ang);
    let px = room.ag.x + dx * 0.62, py = room.ag.y - 1.1 + dy * 0.62;
    out.path.push(px, py);
    // muzzle buried in something solid: the shot dies at once
    if (solidAt(room, px, py) || px <= 0 || px >= RW || py <= 0 || py >= RH) { out.path.push(px, py); return finish(room, out, ev, st0, light); }
    let dist = 0, bounces = 0;
    for (let seg = 0; seg < 24; seg++) {
      let tHit = Infinity, kind = 'wall', idx = -1, nx = 0, ny = 0;
      // room shell
      if (dx > 0) { const t = (RW - px) / dx; if (t < tHit) { tHit = t; nx = -1; ny = 0; } } else if (dx < 0) { const t = -px / dx; if (t < tHit) { tHit = t; nx = 1; ny = 0; } }
      if (dy > 0) { const t = (RH - py) / dy; if (t < tHit) { tHit = t; nx = 0; ny = -1; } } else if (dy < 0) { const t = -py / dy; if (t < tHit) { tHit = t; nx = 0; ny = 1; } }
      for (let i = 0; i < room.els.length; i++) {
        if (s.gone[i]) continue;
        const el = room.els[i];
        let t;
        if (el.type === 'steel') t = raySeg(px, py, dx, dy, el.ax, el.ay, el.bx, el.by);
        else if (el.type === 'glass') continue;
        else if (el.type === 'weight') t = rayRect(px, py, dx, dy, el.x0, el.y0 + s.drop[i], el.x1, el.y1 + s.drop[i]);
        else t = rayRect(px, py, dx, dy, el.x0, el.y0, el.x1, el.y1);
        if (t < tHit) { tHit = t; nx = NX; ny = NY; idx = i; kind = el.type === 'steel' || el.type === 'wall' ? 'wall' : el.type; }
      }
      if (seg > 0) {
        const a = room.ag, t = rayRect(px, py, dx, dy, a.x - EW, a.y - EH, a.x + EW, a.y);
        if (t < tHit) { tHit = t; kind = 'self'; idx = -1; }
      }
      // pass-through things on this segment
      for (let i = 0; i < room.en.length; i++) {
        if (s.dead[i]) continue;
        const e = room.en[i], t = rayRectAny(px, py, dx, dy, e.x - EW, e.y - EH, e.x + EW, e.y, tHit);
        if (t < tHit) ev.push({ t: (dist + t) / VB, k: 'kill', i, how: 'shot', dir: dx >= 0 ? 1 : -1 });
      }
      for (let i = 0; i < room.els.length; i++) {
        if (s.gone[i]) continue;
        const el = room.els[i];
        if (el.type === 'glass') {
          const t = rayRectAny(px, py, dx, dy, el.x0, el.y0, el.x1, el.y1, tHit);
          if (t < tHit) ev.push({ t: (dist + t) / VB, k: 'glass', i });
        } else if (el.type === 'weight' && !s.cut[i] && Math.abs(dx) > 1e-9) {
          const t = (el.cx - px) / dx;
          if (t > 1e-7 && t < tHit) { const yy = py + dy * t; if (yy > el.ay + 0.05 && yy < el.ay + el.rope) ev.push({ t: (dist + t) / VB, k: 'cut', i }); }
        }
      }
      const hx = px + dx * tHit, hy = py + dy * tHit;
      dist += tHit;
      out.path.push(hx, hy);
      if (kind === 'wall') {
        bounces++;
        if (bounces > maxB) { ev.push({ t: dist / VB, k: 'fizzle' }); break; }
        ev.push({ t: dist / VB, k: 'ping', x: hx, y: hy });
        const dn = dx * nx + dy * ny;
        dx -= 2 * dn * nx; dy -= 2 * dn * ny;
        px = hx + nx * 1e-5; py = hy + ny * 1e-5;
        continue;
      }
      if (kind === 'barrel') ev.push({ t: dist / VB, k: 'boom', i: idx });
      else if (kind === 'self') { ev.push({ t: dist / VB, k: 'self' }); out.self = true; }
      else ev.push({ t: dist / VB, k: 'thud', x: hx, y: hy, i: idx });
      break;
    }
    out.bounces = bounces;
    out.travel = dist / VB;
    return finish(room, out, ev, st0, light);
  }
  function finish(room, out, ev, st0, light) {
    if (light) {
      let c = false;
      for (let i = 0; i < ev.length; i++) { const k = ev[i].k; if (k === 'kill' || k === 'glass' || k === 'cut' || k === 'boom' || k === 'self') { c = true; break; } }
      if (!c) return NOOP;
    }
    const s = cloneState(st0);
    out.st = s;
    if (out.travel === undefined) out.travel = 0;
    // process in time order; consequences add new events
    const q = ev.slice().sort((a, b) => a.t - b.t);
    while (q.length) {
      let bi = 0; for (let i = 1; i < q.length; i++) if (q[i].t < q[bi].t) bi = i;
      const e = q.splice(bi, 1)[0];
      if (e.k === 'kill') {
        if (s.dead[e.i]) continue;
        s.dead[e.i] = 1; out.kills++; out.ev.push(e);
      } else if (e.k === 'glass') {
        if (s.gone[e.i]) continue;
        s.gone[e.i] = 1; out.ev.push(e);
        room.en.forEach((en, j) => { if (en.glass === e.i && !s.dead[j]) q.push({ t: e.t + 0.45, k: 'kill', i: j, how: 'fall' }); });
      } else if (e.k === 'cut') {
        if (s.cut[e.i] || s.gone[e.i]) continue;
        s.cut[e.i] = 1; out.ev.push(e);
        dropWeight(room, s, e.i, e.t, q, out);
      } else if (e.k === 'boom') {
        if (s.gone[e.i]) continue;
        s.gone[e.i] = 1; out.ev.push(e);
        const b = room.els[e.i], cx = b.cx, cy = b.y1 - 0.45;
        room.en.forEach((en, j) => { if (!s.dead[j] && Math.hypot(en.x - cx, en.y - 0.75 - cy) <= ER + 0.35) q.push({ t: e.t, k: 'kill', i: j, how: 'boom', dir: en.x >= cx ? 1 : -1 }); });
        room.els.forEach((el, j) => {
          if (s.gone[j] || j === e.i) return;
          if (el.type === 'barrel') { if (Math.hypot(el.cx - cx, el.y1 - 0.45 - cy) <= ER + 0.4) q.push({ t: e.t + 0.12, k: 'boom', i: j }); return; }
          if (el.type === 'weight') {
            if (!s.cut[j] && Math.abs(el.cx - cx) <= ER && el.ay + el.rope > cy - ER) q.push({ t: e.t, k: 'cut', i: j });
            return;
          }
          if (el.type !== 'wood' && el.type !== 'glass') return;
          const qx = Math.max(el.x0, Math.min(cx, el.x1)), qy = Math.max(el.y0, Math.min(cy, el.y1));
          if (Math.hypot(qx - cx, qy - cy) <= ER) {
            if (el.type === 'glass') q.push({ t: e.t, k: 'glass', i: j });
            else { s.gone[j] = 1; out.ev.push({ t: e.t, k: 'smash', i: j }); }
          }
        });
      } else if (e.k === 'land') {
        out.ev.push(e);
        if (e.barrel >= 0) q.push({ t: e.t, k: 'boom', i: e.barrel });
      } else out.ev.push(e);
    }
    let endT = out.travel;
    for (const e of out.ev) endT = Math.max(endT, e.t);
    out.endT = endT;
    out.allDead = s.dead.every((v) => v);
    return out;
  }
  function dropWeight(room, s, wi, t0, q, out) {
    const w = room.els[wi];
    const yb = w.y1 + s.drop[wi];
    let land = RH, barrel = -1;
    room.els.forEach((el, j) => {
      if (j === wi || s.gone[j] || el.type === 'steel' || el.type === 'glass') return;
      const top = el.type === 'weight' ? el.y0 + s.drop[j] : el.y0;
      if (w.x1 - 0.05 > el.x0 && w.x0 + 0.05 < el.x1 && top >= yb - 0.01 && top < land) { land = top; barrel = el.type === 'barrel' ? j : -1; }
    });
    room.els.forEach((el, j) => {
      if (el.type !== 'glass' || s.gone[j]) return;
      if (w.x1 - 0.05 > el.x0 && w.x0 + 0.05 < el.x1 && el.y0 >= yb - 0.01 && el.y0 < land) q.push({ t: t0 + Math.sqrt(2 * (el.y0 - yb) / GRAV), k: 'glass', i: j });
    });
    room.en.forEach((en, j) => {
      if (s.dead[j]) return;
      const top = en.y - EH;
      if (en.x + EW > w.x0 + 0.05 && en.x - EW < w.x1 - 0.05 && en.y > yb + 0.01 && top < land + 0.01) {
        q.push({ t: t0 + Math.sqrt(2 * Math.max(0, top - yb) / GRAV), k: 'kill', i: j, how: 'crush' });
      }
    });
    const dy = land - yb;
    s.drop[wi] += dy;
    q.push({ t: t0 + Math.sqrt(2 * Math.max(0, dy) / GRAV), k: 'land', i: wi, dy, barrel });
  }

  // ---------- solver: does some sequence of <= n shots kill everybody? ----------
  let SIMS = 0;
  function sweep(room, st, maxB, step) {
    step = step || STEP;
    const wins = [];
    let cur = null;
    SIMS += Math.ceil(TAU / step);
    const base = keyOf(st);
    for (let a = -Math.PI; a < Math.PI; a += step) {
      const r = simulate(room, st, a, maxB, true);
      const key = r.noop ? base : r.self ? 'self' : keyOf(r.st);
      if (cur && cur.key === key) { cur.a1 = a; cur.n++; continue; }
      cur = { key, a0: a, a1: a, n: 1, r, self: r.self };
      wins.push(cur);
    }
    // merge the wrap-around window
    if (wins.length > 1 && wins[0].key === wins[wins.length - 1].key) { const l = wins.pop(); wins[0].n += l.n; wins[0].a0 = l.a0 - TAU; }
    for (const w of wins) {
      w.mid = w.a0 + Math.floor(w.n / 2) * step;
      w.r = simulate(room, st, w.mid, maxB);
      w.width = w.n * step;
    }
    return wins;
  }
  function keyOf(s) {
    let k = '';
    for (let i = 0; i < s.dead.length; i++) k += s.dead[i];
    k += '|';
    for (let i = 0; i < s.gone.length; i++) k += s.gone[i] + s.cut[i] * 2;
    return k;
  }
  function solve(room, st, n, maxB, minW, info, step) {
    const wins = sweep(room, st, maxB, step || STEP);
    let best = null;
    for (const w of wins) if (!w.self && w.r.allDead && w.width >= minW && (!best || w.width > best.width)) best = w;
    if (info) { info.maxWin = 0; for (const w of wins) if (!w.self && w.r.allDead && w.width > info.maxWin) info.maxWin = w.width; }
    if (best) return [best.mid];
    if (n <= 1) return null;
    const base = keyOf(st);
    const seen = {};
    const cands = wins.filter((w) => !w.self && w.width >= minW && w.key !== base && !seen[w.key] && (seen[w.key] = true));
    cands.sort((a, b) => b.r.kills - a.r.kills || b.width - a.width);
    for (const c of cands.slice(0, 4)) {
      if (SIMS > SIM_BUDGET) return null;
      const rest = solve(room, c.r.st, n - 1, maxB, minW, null, step);
      if (rest) return [c.mid].concat(rest);
    }
    return null;
  }

  // ---------- level generation ----------
  function variant(t, rng, extras, jitter) {
    const room = buildRoom(t, rng() < 0.5);
    if (jitter) {
      for (const e of room.en) {
        const ox = e.x, dx = (rng() - 0.5) * 1.2;
        e.x = Math.max(0.6, Math.min(RW - 0.6, ox + dx));
        const ok = groundBelow(room, e.x, e.y - 0.05, false) <= e.y + 0.01 && !overlapsSolid(room, e.x - EW, e.y - EH, e.x + EW, e.y - 0.01) &&
          Math.abs(e.x - room.ag.x) > 1.4 && room.en.every((o) => o === e || Math.abs(o.x - e.x) > 0.8 || Math.abs(o.y - e.y) > 0.5);
        if (!ok) e.x = ox;
      }
    }
    // extra enemies on random free floor/ledge spots
    for (let k = 0, guard = 0; k < extras && guard < 80; guard++) {
      const tops = [{ x0: 0, x1: RW, y: RH }];
      for (const el of room.els) if ((el.type === 'wall' || el.type === 'wood') && el.x1 - el.x0 >= 0.9) tops.push({ x0: el.x0, x1: el.x1, y: el.y0 });
      const tp = tops[Math.floor(rng() * tops.length)];
      const x = tp.x0 + 0.45 + rng() * Math.max(0, tp.x1 - tp.x0 - 0.9), y = tp.y;
      if (y - EH < 0.3) continue;
      if (overlapsSolid(room, x - EW, y - EH, x + EW, y - 0.01)) continue;
      if (Math.hypot(x - room.ag.x, y - room.ag.y) < 2.5) continue;
      if (room.en.some((o) => Math.abs(o.x - x) < 0.85 && Math.abs(o.y - y) < 1.4)) continue;
      room.en.push({ x, y }); k++;
    }
    return finishRoom(room);
  }
  let SIM_BUDGET = Infinity;
  function makeLevel(L, diff, rng) {
    const N = TPL.length;
    // the tutorial room (0) only appears early on 簡單
    const idx0 = L <= N && !(diff && (L - 1 + [0, 3, 6][diff]) % N === 0) ? (L - 1 + [0, 3, 6][diff]) % N : 1 + Math.floor(rng() * (N - 1));
    // if a room cannot be made fair at this difficulty, move on to the next design
    for (let k = 0; k < N; k++) {
      SIMS = 0; SIM_BUDGET = 30000;
      const id = (idx0 + k * 7) % N;
      if (id === 0 && diff) continue;
      const r = makeFrom(id, L, diff, rng);
      SIM_BUDGET = Infinity;
      if (r) return r;
    }
    const room = buildRoom(TPL[0], false);
    return { room, bullets: 3, maxB: 5, tpl: 0, fallback: true };
  }
  function makeFrom(idx, L, diff, rng) {
    const t = TPL[idx];
    const maxB = [5, 4, 3][diff];
    const minW = [0.02, 0.012, 0.007][diff];
    const step = minW / 2.2;
    const over = () => SIMS > SIM_BUDGET;
    if (diff === 0) {
      for (let tries = 0; tries < 8 && !over(); tries++) {
        const room = variant(t, rng, L >= 6 && tries < 6 && rng() < 0.5 ? 1 : 0, L >= 3 && tries < 6);
        if (solve(room, freshState(room), 3, maxB, minW, null, step)) return { room, bullets: 3, maxB, tpl: idx };
      }
    } else if (diff === 1) {
      for (let tries = 0; tries < 8 && !over(); tries++) {
        const room = variant(t, rng, tries < 6 ? 1 : 0, tries < 6);
        if (solve(room, freshState(room), 2, maxB, minW, null, step)) return { room, bullets: 2, maxB, tpl: idx };
      }
    } else {
      // 困難: one bullet whenever a variant allows it (prefer the tightest such room), else two
      let pick = null;
      for (let tries = 0; tries < 8 && !over(); tries++) {
        const room = variant(t, rng, tries < 4 ? 2 : tries < 7 ? 1 : 0, tries < 7);
        const info = {};
        if (solve(room, freshState(room), 1, maxB, minW, info, step) && (!pick || info.maxWin < pick.w || room.en.length > pick.room.en.length)) pick = { room, w: info.maxWin };
        if (pick && tries >= 3) break;
      }
      if (pick) return { room: pick.room, bullets: 1, maxB, tpl: idx };
      for (let tries = 0; tries < 6 && !over(); tries++) {
        const room = variant(t, rng, tries < 3 ? 1 : 0, tries < 4);
        if (solve(room, freshState(room), 2, maxB, minW, null, step)) return { room, bullets: 2, maxB, tpl: idx };
      }
    }
    return null;
  }

  MG.register({
    id: 'bullet', name: '子彈反彈', icon: '🔫', color: '#ff8f3d',
    create(api) {
      const U = api.util, L = api.level, DIFF = api.diff || 0;
      const lvl = makeLevel(L, DIFF, api.rng);
      const room = lvl.room;
      let st = freshState(room);
      let W, H, s, ox, oy, cache = null;
      function layout() {
        W = api.W; H = api.H;
        s = Math.max(10, Math.min((W - 14) / RW, (H - 62) / RH));
        ox = (W - RW * s) / 2; oy = 52 + Math.max(0, (H - 58 - RH * s) / 2);
        cache = null;
      }
      layout();
      const PX = (x) => ox + x * s, PY = (y) => oy + y * s;

      const firstE = room.en[0];
      const S = {
        phase: 'aim', ang: Math.atan2(firstE.y - 0.8 - (room.ag.y - 1.1), firstE.x - room.ag.x), bullets: lvl.bullets, drag: null,
        shot: null, simT: 0, tscale: 1, zoom: 0, zx: 0, zy: 0, recoil: 0, over: false, shots: 0, endT: 0,
      };
      const deaths = room.en.map(() => null);
      const weights = room.els.map((el) => (el.type === 'weight' ? { y: 0, vy: 0, falling: false, target: 0 } : null));
      const shards = [];
      const parts = []; for (let i = 0; i < 260; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 3 });
      let pCur = 0, anim = 0, shake = 0, lastInfo = '', banner = null, flash = 0, flashCol = '255,255,255', booms = [];
      let hintT = L === 1 && DIFF === 0 ? 6 : 0;

      function addPart(x, y, vx, vy, life, col, size) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size;
      }
      function aliveCount() { let n = 0; for (let i = 0; i < room.en.length; i++) if (!st.dead[i]) n++; return n; }

      // ---------- shooting ----------
      function fire(ang) {
        if (S.phase !== 'aim' || S.over || S.bullets <= 0) return;
        S.ang = ang;
        const r = simulate(room, st, ang, lvl.maxB);
        S.shot = { r, evI: 0, finalT: -1 };
        // the event that finishes the last enemy gets the slow motion
        if (r.allDead) { let ft = -1, fi = 0; for (const e of r.ev) if (e.k === 'kill' && e.t >= ft) { ft = e.t; fi = e.i; } S.shot.finalT = ft; S.shot.finalI = fi; }
        S.phase = 'fly'; S.simT = 0; S.bullets--; S.shots++; S.recoil = 1; S.endT = r.endT;
        api.sfx('shoot'); shake = Math.max(shake, 3);
        const [mx, my] = muzzle(room, ang);
        for (let i = 0; i < 8; i++) addPart(PX(mx), PY(my), Math.cos(ang) * 200 + (Math.random() - 0.5) * 120, Math.sin(ang) * 200 + (Math.random() - 0.5) * 120, 0.25, i % 2 ? '#ffcc4d' : '#ffffff', 4);
        hintT = 0;
      }
      function bulletPos(r, t, out) {
        let d = t * VB;
        const p = r.path;
        for (let i = 2; i < p.length; i += 2) {
          const sl = Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]);
          if (d <= sl) { const k = sl ? d / sl : 1; out[0] = p[i - 2] + (p[i] - p[i - 2]) * k; out[1] = p[i - 1] + (p[i + 1] - p[i - 1]) * k; out[2] = i; return true; }
          d -= sl;
        }
        out[0] = p[p.length - 2]; out[1] = p[p.length - 1]; out[2] = p.length;
        return false;
      }
      function applyEvent(e) {
        if (e.k === 'kill') {
          const en = room.en[e.i];
          st.dead[e.i] = 1;
          const dir = e.dir || (Math.random() < 0.5 ? -1 : 1);
          deaths[e.i] = { t: 0, how: e.how, dir, rot: 0, flat: 1, x: en.x, y: en.y, vx: e.how === 'boom' ? dir * 6 : e.how === 'shot' ? dir * 2.5 : 0, vy: e.how === 'fall' ? 0 : e.how === 'boom' ? -7 : -3, ground: e.how === 'fall' ? en.ground : en.y };
          api.sfx('hit');
          shake = Math.max(shake, 5);
          for (let k = 0; k < 12; k++) addPart(PX(en.x), PY(en.y - 1), (Math.random() - 0.5) * 260, (Math.random() - 0.9) * 260, 0.6, k % 3 ? '#ff5d6c' : '#ffcc4d', 4 + Math.random() * 3);
          if (aliveCount() === 0) banner = { text: '全部解決！', t: 0, col: '#7dffa8' };
        } else if (e.k === 'glass') {
          st.gone[e.i] = 1;
          const el = room.els[e.i];
          api.sfx('pop');
          for (let k = 0; k < 18; k++) shards.push({ x: el.x0 + Math.random() * (el.x1 - el.x0), y: el.y0 + Math.random() * (el.y1 - el.y0), vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 12, t: 0 });
        } else if (e.k === 'cut') {
          st.cut[e.i] = 1;
          const w = weights[e.i]; w.falling = true; w.vy = 0; w.target = 1e9;
          for (const q of S.shot.r.ev) if (q.k === 'land' && q.i === e.i) w.target = w.y + q.dy;
          api.sfx('tap');
        } else if (e.k === 'land') {
          const w = weights[e.i]; w.falling = false; w.y = w.target < 1e8 ? w.target : w.y + e.dy;
          api.sfx('drop'); shake = Math.max(shake, 9);
          const el = room.els[e.i];
          for (let k = 0; k < 14; k++) addPart(PX(el.cx + (Math.random() - 0.5) * (el.x1 - el.x0)), PY(el.y1 + w.y), (Math.random() - 0.5) * 300, -Math.random() * 200, 0.6, '#c8b090', 5);
        } else if (e.k === 'boom') {
          st.gone[e.i] = 1;
          const el = room.els[e.i];
          booms.push({ x: el.cx, y: el.y1 - 0.45, t: 0 });
          api.sfx('drop'); api.sfx('pop'); shake = Math.max(shake, 16); flash = 0.35; flashCol = '255,200,120';
          for (let k = 0; k < 36; k++) { const a = Math.random() * TAU, v = 100 + Math.random() * 380; addPart(PX(el.cx), PY(el.y1 - 0.45), Math.cos(a) * v, Math.sin(a) * v, 0.7, k % 3 ? '#ff8f3d' : '#ffcc4d', 5 + Math.random() * 6); }
        } else if (e.k === 'smash') {
          st.gone[e.i] = 1;
          const el = room.els[e.i];
          for (let k = 0; k < 14; k++) addPart(PX(el.x0 + Math.random() * (el.x1 - el.x0)), PY(el.y0 + Math.random() * (el.y1 - el.y0)), (Math.random() - 0.5) * 300, -Math.random() * 260, 0.7, '#b07a43', 6);
        } else if (e.k === 'ping') {
          api.sfx('tap');
          for (let k = 0; k < 6; k++) addPart(PX(e.x), PY(e.y), (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, 0.3, '#fff6a8', 3);
        } else if (e.k === 'thud') {
          api.sfx('hit');
          for (let k = 0; k < 6; k++) addPart(PX(e.x), PY(e.y), (Math.random() - 0.5) * 140, (Math.random() - 0.5) * 140, 0.4, '#8a5a3c', 4);
        } else if (e.k === 'self') {
          flash = 0.5; flashCol = '255,60,80'; shake = 14; api.sfx('bad');
        }
      }
      function shotDone() {
        const r = S.shot.r;
        st = cloneState(r.st);
        for (let i = 0; i < weights.length; i++) if (weights[i]) { weights[i].y = st.drop[i]; weights[i].falling = false; }
        S.shot = null; S.tscale = 1;
        if (r.self) { S.over = true; banner = { text: '打中自己了！', t: 0, col: '#ff6b6b' }; api.lose('子彈彈回來打中自己了！'); return; }
        if (aliveCount() === 0) {
          S.over = true;
          for (let i = 0; i < 80; i++) addPart(Math.random() * W, -10, (Math.random() - 0.5) * 200, Math.random() * 200, 2 + Math.random(), U.PALETTE[i % 9], 7);
          api.win(S.shots === 1 ? '一槍解決！' : '用 ' + S.shots + ' 發子彈解決！');
          return;
        }
        if (S.bullets <= 0) { S.over = true; banner = { text: '子彈用完了', t: 0, col: '#ff6b6b' }; api.sfx('bad'); api.lose('還剩 ' + aliveCount() + ' 個敵人…'); return; }
        S.phase = 'aim';
      }

      // ---------- update ----------
      const BP = [0, 0, 0];
      function update(dt) {
        anim += dt;
        shake = Math.max(0, shake - dt * 30);
        flash = Math.max(0, flash - dt * 1.5);
        S.recoil = Math.max(0, S.recoil - dt * 6);
        let gdt = dt * S.tscale;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= gdt; if (p.life <= 0) { p.on = false; continue; }
          p.vy += 700 * gdt; p.x += p.vx * gdt; p.y += p.vy * gdt;
        }
        for (let i = shards.length - 1; i >= 0; i--) { const q = shards[i]; q.t += gdt; q.vy += 30 * gdt; q.x += q.vx * gdt; q.y += q.vy * gdt; q.r += q.vr * gdt; if (q.t > 1.5 || q.y > RH) shards.splice(i, 1); }
        for (let i = booms.length - 1; i >= 0; i--) { booms[i].t += gdt; if (booms[i].t > 0.6) booms.splice(i, 1); }
        for (let i = 0; i < deaths.length; i++) {
          const d = deaths[i]; if (!d) continue;
          d.t += gdt;
          if (d.how === 'crush') { d.flat = Math.max(0.18, 1 - d.t * 8); continue; }
          if (d.y < d.ground || d.vy < 0) {
            d.vy += 30 * gdt; d.x += d.vx * gdt; d.y += d.vy * gdt;
            d.x = Math.max(0.5, Math.min(RW - 0.5, d.x));
            if (d.y >= d.ground && d.vy > 0) { d.y = d.ground; d.vy = 0; d.vx *= 0.3; }
          } else d.vx *= 0.9;
          d.rot = U.lerp(d.rot, d.dir * Math.PI / 2, Math.min(1, gdt * 7));
        }
        for (let i = 0; i < weights.length; i++) {
          const w = weights[i]; if (!w || !w.falling) continue;
          w.vy += GRAV * gdt; w.y = Math.min(w.target, w.y + w.vy * gdt);
        }
        if (banner) { banner.t += dt; if (banner.t > 1.4) banner = null; }
        hintT -= dt;
        if (api.ended || S.over) { S.zoom = Math.max(0, S.zoom - dt * 2); return; }
        if (S.phase === 'fly' && S.shot) {
          const sh = S.shot;
          // slow motion around the final kill
          let target = 1;
          if (sh.finalT >= 0 && S.simT > sh.finalT - 0.3 && S.simT < sh.finalT + 0.25) target = 0.18;
          S.tscale = U.lerp(S.tscale, target, Math.min(1, dt * 12));
          if (target < 1) { S.zoom = Math.min(1, S.zoom + dt * 3); const fe = room.en[sh.finalI]; S.zx = fe.x; S.zy = fe.y - 0.9; }
          else S.zoom = Math.max(0, S.zoom - dt * 2);
          S.simT += dt * S.tscale;
          while (sh.evI < sh.r.ev.length && sh.r.ev[sh.evI].t <= S.simT) applyEvent(sh.r.ev[sh.evI++]);
          if (S.simT > S.endT + 0.45) shotDone();
        } else S.zoom = Math.max(0, S.zoom - dt * 2);
        let info;
        if (L === 1 && DIFF === 0) info = '拖曳瞄準紅外線，放開開槍';
        else info = '子彈 ' + S.bullets + ' · 敵人 ' + aliveCount() + ' · 最多反彈 ' + lvl.maxB + ' 次';
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
      }

      // ---------- drawing ----------
      function buildCache() {
        const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
        const c = document.createElement('canvas');
        c.width = Math.ceil(W * dpr); c.height = Math.ceil(H * dpr);
        const x = c.getContext('2d'); x.scale(dpr, dpr);
        drawBackground(x, W, H, ox, oy, s, U);
        cache = c;
      }
      function draw(g) {
        if (!cache) buildCache();
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        if (S.zoom > 0) {
          const z = 1 + 0.35 * U.easeOutCubic(S.zoom), fx = PX(S.zx), fy = PY(S.zy);
          g.translate(fx, fy); g.scale(z, z); g.translate(-fx, -fy);
        }
        g.drawImage(cache, 0, 0, W, H);
        // floor & ceiling trims
        g.fillStyle = OL; g.fillRect(ox, PY(RH) - 3, RW * s, 3);
        // elements
        for (let i = 0; i < room.els.length; i++) {
          const el = room.els[i];
          if (el.type === 'steel') { drawSteel(g, PX(el.ax), PY(el.ay), PX(el.bx), PY(el.by), Math.max(4, s * 0.2), anim); continue; }
          if (el.type === 'weight') {
            const w = weights[i], dy = w.y;
            if (!st.cut[i] && !(S.shot && w.falling)) {
              g.strokeStyle = OL; g.lineWidth = Math.max(2, s * 0.07) + 3;
              g.beginPath(); g.moveTo(PX(el.cx), PY(el.ay)); g.lineTo(PX(el.cx), PY(el.y0)); g.stroke();
              g.strokeStyle = '#d9a35e'; g.lineWidth = Math.max(2, s * 0.07); g.setLineDash([4, 3]);
              g.beginPath(); g.moveTo(PX(el.cx), PY(el.ay)); g.lineTo(PX(el.cx), PY(el.y0)); g.stroke(); g.setLineDash([]);
              U_rr(g, PX(el.cx) - s * 0.3, PY(el.ay), s * 0.6, s * 0.18, 3); g.fillStyle = '#6b7190'; g.fill(); g.lineWidth = 2; g.strokeStyle = OL; g.stroke();
            } else {
              g.strokeStyle = '#d9a35e'; g.lineWidth = Math.max(2, s * 0.07);
              g.beginPath(); g.moveTo(PX(el.cx), PY(el.ay)); g.lineTo(PX(el.cx) + Math.sin(anim * 5) * 3, PY(el.ay + el.rope * 0.45)); g.stroke();
            }
            drawWeight(g, PX(el.x0), PY(el.y0 + dy), (el.x1 - el.x0) * s, (el.y1 - el.y0) * s);
            continue;
          }
          if (st.gone[i]) continue;
          const x = PX(el.x0), y = PY(el.y0), w = (el.x1 - el.x0) * s, h = (el.y1 - el.y0) * s;
          if (el.type === 'wall') drawWall(g, x, y, w, h, U);
          else if (el.type === 'wood') drawWood(g, x, y, w, h);
          else if (el.type === 'glass') drawGlass(g, x, y, w, h, anim);
          else if (el.type === 'barrel') drawBarrel(g, PX(el.cx), PY(el.y1), s, anim);
        }
        for (const q of shards) {
          g.save(); g.translate(PX(q.x), PY(q.y)); g.rotate(q.r);
          g.fillStyle = 'rgba(190,240,255,' + Math.max(0, 1 - q.t / 1.5) + ')';
          g.beginPath(); g.moveTo(0, -s * 0.12); g.lineTo(s * 0.1, s * 0.08); g.lineTo(-s * 0.08, s * 0.06); g.fill();
          g.restore();
        }
        // enemies
        for (let i = 0; i < room.en.length; i++) {
          const e = room.en[i], d = deaths[i];
          if (d) drawEnemy(g, PX(d.x), PY(d.y), s, d, anim);
          else drawEnemy(g, PX(e.x), PY(e.y), s, null, anim);
        }
        // laser sight
        if (S.phase === 'aim' && !S.over) drawLaser(g);
        drawHero(g, PX(room.ag.x), PY(room.ag.y), s, S.ang, anim, S.recoil);
        // bullet + trail
        if (S.shot) {
          const r = S.shot.r;
          if (bulletPos(r, S.simT, BP)) {
            const seg = BP[2];
            g.strokeStyle = 'rgba(255,230,150,0.55)'; g.lineWidth = Math.max(2, s * 0.08); g.lineCap = 'round';
            g.beginPath();
            const tail = Math.max(0, S.simT - 0.12);
            const T0 = [0, 0, 0]; bulletPos(r, tail, T0);
            g.moveTo(PX(T0[0]), PY(T0[1]));
            for (let i = T0[2]; i < seg; i += 2) g.lineTo(PX(r.path[i]), PY(r.path[i + 1]));
            g.lineTo(PX(BP[0]), PY(BP[1])); g.stroke(); g.lineCap = 'butt';
            g.fillStyle = '#fff6b8'; g.beginPath(); g.arc(PX(BP[0]), PY(BP[1]), Math.max(2.5, s * 0.11), 0, TAU); g.fill();
            g.fillStyle = 'rgba(255,204,77,0.35)'; g.beginPath(); g.arc(PX(BP[0]), PY(BP[1]), Math.max(5, s * 0.25), 0, TAU); g.fill();
          }
        }
        for (const b of booms) {
          const k = b.t / 0.6;
          const gr = g.createRadialGradient(PX(b.x), PY(b.y), 0, PX(b.x), PY(b.y), ER * s * (0.4 + k * 0.7));
          gr.addColorStop(0, 'rgba(255,255,220,' + (1 - k) + ')'); gr.addColorStop(0.4, 'rgba(255,170,60,' + (0.9 - k * 0.9) + ')'); gr.addColorStop(1, 'rgba(255,80,40,0)');
          g.fillStyle = gr; g.beginPath(); g.arc(PX(b.x), PY(b.y), ER * s * (0.4 + k * 0.7), 0, TAU); g.fill();
        }
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.6); g.fillStyle = p.col;
          g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        g.globalAlpha = 1;
        g.restore();
        if (S.tscale < 0.9) {
          const k = 1 - S.tscale;
          const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.7);
          gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,0,20,' + 0.55 * k + ')');
          g.fillStyle = gr; g.fillRect(0, 0, W, H);
          g.globalAlpha = k; U_otext(g, '慢 動 作', W / 2, oy + 24, 17, '#ffe27a', 4); g.globalAlpha = 1;
        }
        if (flash > 0) { g.fillStyle = 'rgba(' + flashCol + ',' + Math.min(0.6, flash) + ')'; g.fillRect(0, 0, W, H); }
        drawHud(g);
      }
      function drawLaser(g) {
        // trace with a throwaway state: same geometry as a real shot, no consequences
        const r = simulate(room, st, S.ang, 3);
        const p = r.path;
        const segs = DIFF === 0 ? 2 : 1;
        const stub = DIFF === 1 ? 1.4 : 0;
        const a = S.drag ? 0.9 : 0.45;
        g.lineCap = 'round';
        for (let i = 2; i < p.length && i / 2 <= segs + (stub ? 1 : 0); i += 2) {
          let x0 = p[i - 2], y0 = p[i - 1], x1 = p[i], y1 = p[i + 1];
          const isStub = i / 2 > segs;
          if (isStub) { const l = Math.hypot(x1 - x0, y1 - y0) || 1; const k = Math.min(1, stub / l); x1 = x0 + (x1 - x0) * k; y1 = y0 + (y1 - y0) * k; }
          g.strokeStyle = 'rgba(255,40,60,' + a * 0.35 + ')'; g.lineWidth = 5;
          g.beginPath(); g.moveTo(PX(x0), PY(y0)); g.lineTo(PX(x1), PY(y1)); g.stroke();
          g.strokeStyle = 'rgba(255,70,80,' + a + ')'; g.lineWidth = 1.6;
          if (i > 2) g.setLineDash([6, 5]);
          g.beginPath(); g.moveTo(PX(x0), PY(y0)); g.lineTo(PX(x1), PY(y1)); g.stroke();
          g.setLineDash([]);
          if (!isStub) { g.fillStyle = 'rgba(255,90,100,' + a + ')'; g.beginPath(); g.arc(PX(x1), PY(y1), 3, 0, TAU); g.fill(); }
        }
        g.lineCap = 'butt';
      }
      function drawHud(g) {
        g.fillStyle = 'rgba(42,26,20,0.8)'; U.rr(g, 8, 6, W - 16, 36, 18); g.fill();
        g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,0.15)'; g.stroke();
        for (let i = 0; i < lvl.bullets; i++) {
          const x = 24 + i * 18, y = 24, on = i < S.bullets;
          g.globalAlpha = on ? 1 : 0.3;
          g.fillStyle = '#e08a3a'; g.beginPath(); g.moveTo(x - 4, y - 4); g.quadraticCurveTo(x, y - 15, x + 4, y - 4); g.closePath(); g.fill();
          g.lineWidth = 1.5; g.strokeStyle = '#000'; g.stroke();
          U.rr(g, x - 4.5, y - 5, 9, 15, 2); g.fillStyle = '#ffcc4d'; g.fill(); g.stroke();
          g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(x - 3, y - 3, 2, 10);
          g.globalAlpha = 1;
        }
        const n = room.en.length;
        for (let i = 0; i < n; i++) {
          const x = W - 24 - i * 22, y = 24, dead = st.dead[n - 1 - i];
          g.globalAlpha = dead ? 0.45 : 1;
          U_blob(g, x, y, 8, 7.5, '#ffd9b5', 1.5);
          g.beginPath(); g.ellipse(x, y - 2, 8.3, 6, 0, Math.PI * 1.02, TAU * 0.99); g.closePath(); g.fillStyle = '#1e1e28'; g.fill();
          g.fillStyle = '#16161e'; g.fillRect(x - 6, y - 1, 12, 3);
          g.globalAlpha = 1;
          if (dead) U_otext(g, '✖', x, y + 1, 15, '#ff5d6c', 3);
        }
        U_otext(g, room.name, W / 2, 24, 14, '#ffffff', 3);
        if (banner) {
          const k = Math.min(1, banner.t / 0.3);
          g.globalAlpha = banner.t > 1.1 ? Math.max(0, 1 - (banner.t - 1.1) / 0.3) : 1;
          const sz = Math.min(38, W / 10) * U.easeOutBack(k);
          g.font = '900 ' + sz + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 7; g.strokeStyle = OL; g.lineJoin = 'round';
          g.strokeText(banner.text, W / 2, H * 0.3); g.fillStyle = banner.col; g.fillText(banner.text, W / 2, H * 0.3);
          g.globalAlpha = 1;
        }
        if (hintT > 0 && !S.drag && S.phase === 'aim') {
          g.globalAlpha = Math.min(1, hintT) * (0.6 + 0.4 * Math.sin(anim * 5));
          const k = Math.sin(anim * 2);
          U.text(g, '👆', W / 2 + k * 40, PY(room.ag.y) - s * 4, 32, '#fff', 'center', 900);
          U_otext(g, '拖曳瞄準 · 放開開槍', W / 2, PY(room.ag.y) - s * 5.6, 17, '#ffffff', 4);
          g.globalAlpha = 1;
        }
      }

      // ---------- input: relative drag moves the aim point (fine control), release fires ----------
      const AR = 150;
      function down(x, y) {
        if (api.ended || S.over || S.phase !== 'aim') return;
        S.drag = { fx: x, fy: y, a0: S.ang, moved: 0, t: anim };
        hintT = 0;
        api.sfx('tap');
      }
      function move(x, y) {
        const d = S.drag; if (!d || S.phase !== 'aim') return;
        const vx = Math.cos(d.a0) * AR + (x - d.fx) * 0.6, vy = Math.sin(d.a0) * AR + (y - d.fy) * 0.6;
        if (Math.hypot(vx, vy) > 8) S.ang = Math.atan2(vy, vx);
        d.moved = Math.max(d.moved, Math.hypot(x - d.fx, y - d.fy));
      }
      function up(x, y) {
        const d = S.drag; if (!d) return;
        move(x, y);
        S.drag = null;
        if (S.phase !== 'aim' || api.ended || S.over) return;
        if (d.moved > 6 || anim - d.t > 0.35) fire(S.ang);
      }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _s: S, _room: room, _lvl: lvl, get _st() { return st; },
        _k: { simulate, solve, sweep, freshState, cloneState, TPL, buildRoom, AR, STEP, makeLevel },
      };
    },
  });
})();
