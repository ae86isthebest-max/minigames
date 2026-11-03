// 黑洞吞噬 — Hole.io: drag to steer a hole around a tilted top-down city; anything smaller than the hole
// tips over and sinks in, the hole grows. Eat X% of the city before the timer ends; rival holes on 普通/困難.
(function () {
  'use strict';
  const U = MG.util;
  const FONT = '-apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
  const TILT = 0.62;      // how much of an object's height shows on screen (slight 3/4 view)
  const R0 = 18;          // starting hole radius (world units)
  const GROW = 5;         // r^2 gained per mass unit eaten
  const BS = 250, RW = 66; // block size, road width

  // ---------- object kinds (footprint r decides what fits in the hole) ----------
  const KINDS = {
    cone: { r: 5, h: 10 }, person: { r: 6, h: 16 }, hydrant: { r: 6, h: 10 }, trash: { r: 7, h: 12 },
    lamp: { r: 6, h: 44 }, bush: { r: 10, h: 12 }, bench: { r: 11, h: 8 }, tree: { r: 14, h: 30 },
    car: { r: 20, h: 12 }, kiosk: { r: 22, h: 26 }, fountain: { r: 28, h: 10 }, bus: { r: 32, h: 18 },
    house: { r: 40, h: 34 }, shop: { r: 48, h: 40 }, building: { r: 58, h: 80 }, apartment: { r: 70, h: 110 }, tower: { r: 84, h: 150 },
  };
  function massOf(r) { return r * r * 0.04; }
  const SHIRTS = ['#ff5d6c', '#4c9bff', '#4cd986', '#ffcc4d', '#b26bff', '#ff8f3d', '#3de0e0', '#ff7ac8'];
  const CARS = ['#ff5d6c', '#4c9bff', '#ffcc4d', '#e8e8f0', '#4cd986', '#ff8f3d', '#3a3f4b'];
  const ROOFS = ['#d9534f', '#5a7fd8', '#e0a030', '#4caf7a', '#a05ad8', '#d97a3a'];
  const WALLS = ['#f4e6d0', '#e8eef8', '#fff3d6', '#f0e0e8', '#e0f0e4'];
  const NAMES = ['小藍', '阿紫', '橘子', '綠綠', '粉粉', '阿黃', '小黑'];
  const HCOL = ['#ff5d6c', '#4cd986', '#ff8f3d', '#ff7ac8', '#ffcc4d', '#3de0e0', '#b26bff'];

  // ---------- drawing: ground (toy-town: chunky outlined blocks, candy colours) ----------
  const OL = '#2a1a14';
  function drawGround(g, M, vx0, vy0, vx1, vy1, t) {
    g.fillStyle = '#7cd36a'; g.fillRect(vx0, vy0, vx1 - vx0, vy1 - vy0);
    g.fillStyle = '#6f7590'; g.fillRect(0, 0, M.WW, M.WH);
    g.lineJoin = 'round';
    // sidewalk ring of each block, then block surface
    for (let i = 0; i < M.blocks.length; i++) {
      const b = M.blocks[i];
      if (b.x + BS + 12 < vx0 || b.x - 12 > vx1 || b.y + BS + 12 < vy0 || b.y - 12 > vy1) continue;
      g.fillStyle = '#d9c8a8'; U.rr(g, b.x - 12, b.y - 8, BS + 24, BS + 24, 16); g.fill();
      U.rr(g, b.x - 12, b.y - 12, BS + 24, BS + 24, 16); g.fillStyle = '#f4e4c4'; g.fill(); g.lineWidth = 4; g.strokeStyle = OL; g.stroke();
      drawBlock(g, b);
    }
    // lane dashes
    g.fillStyle = '#ffe27a';
    for (let r = 0; r <= M.ny; r++) {
      const y = r * (BS + RW) + RW / 2;
      if (y < vy0 - 4 || y > vy1 + 4) continue;
      for (let x = Math.max(0, Math.floor(vx0 / 40) * 40); x < Math.min(M.WW, vx1); x += 40) { U.rr(g, x, y - 2.5, 20, 5, 2.5); g.fill(); }
    }
    for (let c = 0; c <= M.nx; c++) {
      const x = c * (BS + RW) + RW / 2;
      if (x < vx0 - 4 || x > vx1 + 4) continue;
      for (let y = Math.max(0, Math.floor(vy0 / 40) * 40); y < Math.min(M.WH, vy1); y += 40) { U.rr(g, x - 2.5, y, 5, 20, 2.5); g.fill(); }
    }
    // crosswalks at intersections
    g.fillStyle = '#ffffff';
    for (let c = 0; c <= M.nx; c++) for (let r = 0; r <= M.ny; r++) {
      const x = c * (BS + RW), y = r * (BS + RW);
      if (x + RW < vx0 || x > vx1 || y + RW < vy0 || y > vy1) continue;
      for (let k = 0; k < 5; k++) {
        if (r > 0) { U.rr(g, x + 8 + k * 11, y - 3, 7, 11, 2); g.fill(); }
        if (c > 0) { U.rr(g, x - 3, y + 8 + k * 11, 11, 7, 2); g.fill(); }
      }
    }
    // map border
    g.strokeStyle = OL; g.lineWidth = 8; g.strokeRect(-4, -4, M.WW + 8, M.WH + 8);
  }
  function drawBlock(g, b) {
    const x = b.x, y = b.y;
    g.lineWidth = 3; g.strokeStyle = OL;
    if (b.type === 'park') {
      U.rr(g, x, y, BS, BS, 12); g.fillStyle = '#86d65a'; g.fill(); g.stroke();
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(x + 12, y + BS * 0.3); g.quadraticCurveTo(x + BS * 0.5, y + BS * 0.75, x + BS - 12, y + BS * 0.55);
      g.strokeStyle = OL; g.lineWidth = 17; g.stroke(); g.strokeStyle = '#f2dca6'; g.lineWidth = 12; g.stroke();
      for (let i = 0; i < b.flowers.length; i += 3) { g.fillStyle = b.flowers[i + 2]; g.beginPath(); g.arc(x + b.flowers[i], y + b.flowers[i + 1], 3.2, 0, 6.283); g.fill(); }
    } else if (b.type === 'houses') {
      U.rr(g, x, y, BS, BS, 12); g.fillStyle = '#a2e070'; g.fill(); g.stroke();
      g.fillStyle = '#e8dcc4'; g.fillRect(x + BS / 2 - 10, y + 1.5, 20, BS - 3);
      g.lineWidth = 2; g.beginPath(); g.moveTo(x + BS / 2 - 10, y + 2); g.lineTo(x + BS / 2 - 10, y + BS - 2); g.moveTo(x + BS / 2 + 10, y + 2); g.lineTo(x + BS / 2 + 10, y + BS - 2); g.stroke();
    } else if (b.type === 'plaza') {
      U.rr(g, x, y, BS, BS, 12); g.fillStyle = '#f6e3c8'; g.fill();
      g.fillStyle = '#efd2ae';
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) & 1) g.fillRect(x + c * BS / 8, y + r * BS / 8, BS / 8, BS / 8);
      U.rr(g, x, y, BS, BS, 12); g.lineWidth = 3; g.stroke();
    } else if (b.type === 'parking') {
      U.rr(g, x, y, BS, BS, 12); g.fillStyle = '#8a90a6'; g.fill(); g.stroke();
      g.strokeStyle = '#ffffff'; g.lineWidth = 2.5; g.beginPath();
      for (let r = 0; r < 4; r++) for (let c = 0; c <= 5; c++) { const px = x + 20 + c * 42, py = y + 18 + r * 58; g.moveTo(px, py); g.lineTo(px, py + 44); }
      g.stroke();
    } else {
      U.rr(g, x, y, BS, BS, 12); g.fillStyle = '#b9c2d8'; g.fill(); g.stroke();
      U.rr(g, x + 14, y + 14, BS - 28, BS - 28, 8); g.fillStyle = '#c9d2e6'; g.fill();
    }
  }

  // ---------- drawing: objects (toy pseudo-3D with thick outlines, base at (0,0)) ----------
  function ol(g, w) { g.lineWidth = w || 2; g.strokeStyle = OL; g.stroke(); }
  function box(g, w, d, h, wall, roof, lw) {
    const hh = h * TILT;
    g.lineJoin = 'round';
    g.beginPath(); g.rect(-w / 2, d / 2 - hh, w, hh); g.fillStyle = U.shade(wall, -0.18); g.fill(); ol(g, lw);
    g.beginPath(); g.rect(-w / 2, -d / 2 - hh, w, d); g.fillStyle = roof; g.fill(); ol(g, lw);
  }
  function drawObject(g, o, t) {
    const k = o.kind;
    g.lineJoin = 'round'; g.lineCap = 'round';
    if (k !== 'lamp' && k !== 'fountain') {
      g.fillStyle = 'rgba(42,26,20,0.2)';
      g.beginPath(); g.ellipse(o.r * 0.25, o.r * 0.2, o.r * 1.0, o.r * 0.6, 0, 0, 6.283); g.fill();
    }
    if (k === 'cone') {
      g.beginPath(); g.moveTo(-5.5, 3); g.lineTo(5.5, 3); g.lineTo(0, -11); g.closePath(); g.fillStyle = '#ff7a2a'; g.fill(); ol(g, 1.6);
      g.fillStyle = '#fff'; g.fillRect(-3, -4.5, 6, 2.4);
    } else if (k === 'person') {
      // chibi townsfolk: big head, tiny body
      const bob = Math.abs(Math.sin(t * 8 + o.ph)) * 2;
      g.beginPath(); g.ellipse(-2.4, -2, 2, 3, 0, 0, 6.283); g.ellipse(2.4, -2, 2, 3, 0, 0, 6.283); g.fillStyle = '#3a3f5a'; g.fill(); ol(g, 1.2);
      U.rr(g, -4.5, -10 - bob, 9, 8, 3); g.fillStyle = o.col; g.fill(); ol(g, 1.3);
      g.beginPath(); g.arc(0, -15.5 - bob, 5.6, 0, 6.283); g.fillStyle = '#ffdcb8'; g.fill(); ol(g, 1.3);
      g.beginPath(); g.arc(0, -16.5 - bob, 5.6, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); g.fillStyle = o.hair; g.fill(); ol(g, 1.1);
      g.fillStyle = OL; g.beginPath(); g.arc(-2, -14.5 - bob, 0.95, 0, 6.283); g.arc(2, -14.5 - bob, 0.95, 0, 6.283); g.fill();
      g.fillStyle = 'rgba(255,110,120,0.55)'; g.beginPath(); g.arc(-3.6, -12.8 - bob, 1, 0, 6.283); g.arc(3.6, -12.8 - bob, 1, 0, 6.283); g.fill();
    } else if (k === 'hydrant') {
      U.rr(g, -4, -10, 8, 11, 3); g.fillStyle = '#ff4d4d'; g.fill(); ol(g, 1.5);
      g.beginPath(); g.arc(0, -10, 4, Math.PI, 0); g.closePath(); g.fillStyle = '#ff7a7a'; g.fill(); ol(g, 1.5);
      U.rr(g, -6.5, -7.5, 13, 3.2, 1.5); g.fillStyle = '#ffcc4d'; g.fill(); ol(g, 1.2);
    } else if (k === 'trash') {
      U.rr(g, -5, -11, 10, 12, 2.5); g.fillStyle = '#3fb07a'; g.fill(); ol(g, 1.5);
      g.beginPath(); g.ellipse(0, -11, 6, 2.6, 0, 0, 6.283); g.fillStyle = '#6fd6a0'; g.fill(); ol(g, 1.4);
    } else if (k === 'lamp') {
      g.fillStyle = 'rgba(42,26,20,0.2)'; g.beginPath(); g.ellipse(6, 2, 10, 3, 0, 0, 6.283); g.fill();
      g.beginPath(); g.rect(-1.8, -28, 3.6, 29); g.fillStyle = '#4a5a8a'; g.fill(); ol(g, 1.3);
      U.rr(g, -6.5, -33, 13, 6, 2.5); g.fillStyle = '#5a6a9a'; g.fill(); ol(g, 1.4);
      g.fillStyle = '#fff1a8'; g.beginPath(); g.ellipse(0, -27, 4.2, 1.8, 0, 0, 6.283); g.fill();
    } else if (k === 'bush') {
      g.beginPath(); g.arc(-4, -3, 6.5, 0, 6.283); g.arc(4, -3, 6.5, 0, 6.283); g.arc(0, -8, 7, 0, 6.283);
      g.lineWidth = 3.2; g.strokeStyle = OL; g.stroke(); g.fillStyle = '#3fae4a'; g.fill();
      g.fillStyle = '#6fd65a'; g.beginPath(); g.arc(-2, -9.5, 3.5, 0, 6.283); g.fill();
      if (o.col !== '#000') { g.fillStyle = o.col; g.beginPath(); g.arc(3, -6, 2, 0, 6.283); g.arc(-5, -4, 1.8, 0, 6.283); g.fill(); }
    } else if (k === 'bench') {
      g.fillStyle = '#5a4030'; g.fillRect(-9, -2, 2.4, 4); g.fillRect(7, -2, 2.4, 4);
      U.rr(g, -11.5, -6.5, 23, 4.5, 1.5); g.fillStyle = '#d8945a'; g.fill(); ol(g, 1.4);
      U.rr(g, -11.5, -11, 23, 3.6, 1.5); g.fillStyle = '#b8743c'; g.fill(); ol(g, 1.4);
    } else if (k === 'tree') {
      g.beginPath(); g.rect(-2.8, -12, 5.6, 13); g.fillStyle = '#9a6a40'; g.fill(); ol(g, 1.6);
      g.beginPath(); g.arc(0, -20, 13, 0, 6.283); g.fillStyle = '#3fae4a'; g.fill(); ol(g, 2.2);
      g.fillStyle = '#5cc85a'; g.beginPath(); g.arc(-3, -23, 8.5, 0, 6.283); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(-6, -27, 3.5, 2, -0.5, 0, 6.283); g.fill();
      if (o.col !== '#000') { g.fillStyle = o.col; g.beginPath(); g.arc(5, -18, 2.2, 0, 6.283); g.arc(-6, -15, 2.2, 0, 6.283); g.arc(2, -27, 2.2, 0, 6.283); g.fill(); }
    } else if (k === 'car' || k === 'bus') {
      const L = k === 'bus' ? 30 : 18, Wd = k === 'bus' ? 11 : 9, hh = (k === 'bus' ? 16 : 9) * TILT;
      g.save(); if (o.vert) g.rotate(Math.PI / 2);
      g.fillStyle = OL;
      U.rr(g, -L + 3, -Wd - 2, 8, 4, 1.5); g.fill(); U.rr(g, L - 11, -Wd - 2, 8, 4, 1.5); g.fill(); U.rr(g, -L + 3, Wd - 2, 8, 4, 1.5); g.fill(); U.rr(g, L - 11, Wd - 2, 8, 4, 1.5); g.fill();
      g.restore();
      if (o.vert) {
        g.beginPath(); g.rect(-Wd, L - hh, Wd * 2, hh); g.fillStyle = U.shade(o.col, -0.3); g.fill(); ol(g, 2);
        U.rr(g, -Wd, -L - hh, Wd * 2, L * 2, 6); g.fillStyle = o.col; g.fill(); ol(g, 2.2);
        U.rr(g, -Wd + 2.5, -L * 0.45 - hh, Wd * 2 - 5, L * 0.35, 2.5); g.fillStyle = '#a8e0ff'; g.fill(); ol(g, 1.5);
        if (k === 'bus') { for (let i = 0; i < 4; i++) { U.rr(g, -Wd + 2.5, -L * 0.05 + i * 7 - hh, Wd * 2 - 5, 4, 1.5); g.fillStyle = '#a8e0ff'; g.fill(); ol(g, 1.2); } }
      } else {
        g.beginPath(); g.rect(-L, Wd - hh, L * 2, hh); g.fillStyle = U.shade(o.col, -0.3); g.fill(); ol(g, 2);
        U.rr(g, -L, -Wd - hh, L * 2, Wd * 2, 6); g.fillStyle = o.col; g.fill(); ol(g, 2.2);
        U.rr(g, (o.dir > 0 ? L * 0.15 : -L * 0.5), -Wd + 2.5 - hh, L * 0.35, Wd * 2 - 5, 2.5); g.fillStyle = '#a8e0ff'; g.fill(); ol(g, 1.5);
        if (k === 'bus') { for (let i = 0; i < 4; i++) { U.rr(g, -L * 0.75 + i * 8, -Wd + 2.5 - hh, 5, Wd * 2 - 5, 1.5); g.fillStyle = '#a8e0ff'; g.fill(); ol(g, 1.2); } }
      }
      g.fillStyle = 'rgba(255,255,255,0.45)';
      if (o.vert) { U.rr(g, -Wd + 2.5, -L - hh + 2.5, 3, L * 2 - 5, 1.5); g.fill(); } else { U.rr(g, -L + 3, -Wd - hh + 2.5, L * 2 - 6, 3, 1.5); g.fill(); }
    } else if (k === 'kiosk') {
      box(g, 34, 26, 22, '#fff0dc', '#fff6e8', 2);
      const hh = 26 * TILT;
      for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#fff' : o.col; g.fillRect(-20 + i * 6.7, -16 - hh, 6.7, 12); }
      g.beginPath(); g.rect(-20, -16 - hh, 40, 12); ol(g, 2);
      g.fillStyle = U.shade(o.col, -0.2); g.fillRect(-20, -4 - hh, 40, 3);
    } else if (k === 'fountain') {
      g.beginPath(); g.arc(0, 0, 28, 0, 6.283); g.fillStyle = '#d8d0c4'; g.fill(); ol(g, 3);
      g.beginPath(); g.arc(0, 0, 22, 0, 6.283); g.fillStyle = '#6fd0ff'; g.fill(); ol(g, 2);
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(-6 + Math.sin(t * 2) * 3, -6, 5, 0, 6.283); g.fill();
      g.beginPath(); g.arc(0, -4, 7, 0, 6.283); g.fillStyle = '#efe8dc'; g.fill(); ol(g, 2);
      g.beginPath(); g.arc(0, -11 - Math.abs(Math.sin(t * 4)) * 4, 3.5, 0, 6.283); g.fillStyle = '#c8f0ff'; g.fill(); ol(g, 1.5);
    } else if (k === 'house') {
      box(g, 66, 52, 30, o.wall, o.wall, 2.5);
      const hh = 30 * TILT;
      g.beginPath(); g.moveTo(-38, -26 - hh + 6); g.lineTo(0, -26 - hh - 16); g.lineTo(38, -26 - hh + 6); g.lineTo(38, 26 - hh); g.lineTo(-38, 26 - hh); g.closePath();
      g.fillStyle = o.col; g.fill(); ol(g, 2.8);
      g.beginPath(); g.moveTo(-38, 26 - hh); g.lineTo(38, 26 - hh); g.lineTo(38, 20 - hh); g.lineTo(-38, 20 - hh); g.closePath(); g.fillStyle = U.shade(o.col, -0.22); g.fill(); ol(g, 2);
      g.beginPath(); g.moveTo(0, -26 - hh - 16); g.lineTo(0, 20 - hh); g.strokeStyle = 'rgba(42,26,20,0.35)'; g.lineWidth = 2; g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(-32, -22 - hh + 4); g.lineTo(-4, -22 - hh - 10); g.lineTo(-4, -16 - hh - 8); g.lineTo(-28, -14 - hh + 4); g.closePath(); g.fill();
      U.rr(g, -6, 26 - hh * 0.9, 12, hh * 0.9, 2); g.fillStyle = '#a0623a'; g.fill(); ol(g, 1.8);
      U.rr(g, -27, 26 - hh * 0.78, 13, 10, 2); g.fillStyle = '#a8e0ff'; g.fill(); ol(g, 1.8);
      U.rr(g, 14, 26 - hh * 0.78, 13, 10, 2); g.fillStyle = '#a8e0ff'; g.fill(); ol(g, 1.8);
    } else if (k === 'shop') {
      box(g, 84, 60, 40, o.wall, '#e6eaf2', 2.8);
      const hh = 40 * TILT;
      for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#fff' : o.col; g.fillRect(-42 + i * 12, 30 - hh, 12, 9); }
      g.beginPath(); g.moveTo(-42, 30 - hh); g.lineTo(42, 30 - hh); g.lineTo(42, 30 - hh + 9);
      for (let i = 7; i >= 0; i--) g.quadraticCurveTo(-42 + i * 12 + 6, 30 - hh + 14, -42 + i * 12, 30 - hh + 9);
      g.closePath(); ol(g, 2);
      U.rr(g, -34, 30 - hh * 0.52, 28, hh * 0.48, 3); g.fillStyle = '#a8e0ff'; g.fill(); ol(g, 2);
      U.rr(g, 6, 30 - hh * 0.52, 28, hh * 0.48, 3); g.fillStyle = '#a8e0ff'; g.fill(); ol(g, 2);
      U.rr(g, -36, -26 - hh, 20, 14, 3); g.fillStyle = '#c8cedc'; g.fill(); ol(g, 1.8);
      U.rr(g, 14, -22 - hh, 12, 10, 3); g.fillStyle = '#c8cedc'; g.fill(); ol(g, 1.8);
    } else if (k === 'building' || k === 'tower' || k === 'apartment') {
      const big = k === 'tower', mid = k === 'apartment';
      const w = big ? 150 : mid ? 124 : 102, d = big ? 120 : mid ? 100 : 84, h = big ? 150 : mid ? 110 : 80;
      box(g, w, d, h, o.wall, U.shade(o.wall, 0.15), 3.5);
      const hh = h * TILT;
      const cols = big ? 8 : mid ? 6 : 5, rows = big ? 9 : mid ? 7 : 5;
      g.lineWidth = 1.6; g.strokeStyle = OL;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const wx = -w / 2 + 8 + c * (w - 12) / cols, wy = d / 2 - hh + 6 + r * (hh - 10) / rows, ww = (w - 12) / cols - 5, wh = (hh - 10) / rows - 4;
        g.fillStyle = (r * 7 + c * 3) % 5 === 0 ? '#ffe27a' : '#8fd0ff';
        g.fillRect(wx, wy, ww, wh); g.strokeRect(wx, wy, ww, wh);
      }
      U.rr(g, -w / 2 + 12, -d / 2 - hh + 12, w * 0.3, d * 0.3, 4); g.fillStyle = U.shade(o.wall, -0.1); g.fill(); ol(g, 2.2);
      U.rr(g, w / 2 - 34, -d / 2 - hh + 10, 22, 16, 4); g.fillStyle = o.col; g.fill(); ol(g, 2.2);
      g.fillStyle = 'rgba(255,255,255,0.45)'; U.rr(g, -w / 2 + 6, -d / 2 - hh + 4, w - 12, 5, 2.5); g.fill();
      if (big) {
        g.strokeStyle = OL; g.lineWidth = 6; g.beginPath(); g.moveTo(0, -hh); g.lineTo(0, -hh - 30); g.stroke();
        g.strokeStyle = '#ff5d6c'; g.lineWidth = 3; g.stroke();
        g.beginPath(); g.arc(0, -hh - 30, 5, 0, 6.283); g.fillStyle = Math.sin(t * 4) > 0 ? '#ff5d6c' : '#7a2a30'; g.fill(); ol(g, 2);
      }
    }
  }

  // ---------- drawing: holes (cartoon pit with a swirl and a chunky outlined rim) ----------
  function drawHole(g, h, t, isMe) {
    const r = h.dr;
    g.fillStyle = '#1c1430'; g.beginPath(); g.arc(h.x, h.y, r, 0, 6.283); g.fill();
    g.fillStyle = '#0c0818'; g.beginPath(); g.arc(h.x, h.y + r * 0.12, r * 0.8, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(180,150,255,0.18)'; g.lineWidth = Math.max(1.5, r * 0.07); g.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      const a = t * (1.2 + k * 0.4) + k * 2.1;
      g.beginPath(); g.arc(h.x, h.y, r * (0.3 + k * 0.2), a, a + 1.8); g.stroke();
    }
  }
  function drawHoleRim(g, h, t, isMe) {
    const r = h.dr;
    const rw = Math.max(4, r * 0.12);
    g.lineWidth = rw + Math.max(3, r * 0.06) * 2; g.strokeStyle = OL; g.beginPath(); g.arc(h.x, h.y, r, 0, 6.283); g.stroke();
    g.lineWidth = rw; g.strokeStyle = h.col; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = Math.max(1.5, rw * 0.35); g.lineCap = 'round';
    g.beginPath(); g.arc(h.x, h.y, r, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
    if (isMe && h.pulse > 0) {
      g.strokeStyle = 'rgba(255,255,255,' + h.pulse * 0.7 + ')'; g.lineWidth = 4;
      g.beginPath(); g.arc(h.x, h.y, r * (1.08 + (1 - h.pulse) * 0.3), 0, 6.283); g.stroke();
    }
  }
  function olText(g, str, x, y, fs, col, lw) {
    g.font = '900 ' + fs + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = lw; g.strokeStyle = OL; g.strokeText(str, x, y); g.fillStyle = col; g.fillText(str, x, y);
  }
  function pill(g, x, y, w, h, r) {
    U.rr(g, x, y, w, h, r); g.fillStyle = 'rgba(255,244,220,0.95)'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
  }

  // ---------- map generation ----------
  function genMap(rng, rivals) {
    const nx = 4 + (rivals >= 3 ? 1 : 0), ny = 5 + (rivals >= 2 ? 1 : 0);
    const WW = nx * BS + (nx + 1) * RW, WH = ny * BS + (ny + 1) * RW;
    const blocks = [], objs = [];
    const add = (kind, x, y, extra) => {
      const K = KINDS[kind];
      const o = { kind, x, y, x0: x, y0: y, r: K.r, mass: massOf(K.r), state: 0, ft: 0, fx: 0, fy: 0, rot: 0, by: null, ph: rng() * 6.28, col: '#000', move: 0 };
      if (extra) for (const k in extra) o[k] = extra[k];
      objs.push(o); return o;
    };
    const pick = (arr) => arr[Math.floor(rng() * arr.length)];
    const center = [Math.floor(nx / 2), Math.floor(ny / 2)];
    for (let r = 0; r < ny; r++) for (let c = 0; c < nx; c++) {
      const x = RW + c * (BS + RW), y = RW + r * (BS + RW);
      const dc = Math.abs(c - center[0] + 0.5) + Math.abs(r - center[1]);
      let type;
      const q = rng();
      if (dc <= 1.5) type = q < 0.5 ? 'park' : q < 0.8 ? 'plaza' : 'houses';
      else type = q < 0.22 ? 'park' : q < 0.42 ? 'houses' : q < 0.58 ? 'parking' : q < 0.72 ? 'plaza' : 'city';
      const b = { x, y, type, flowers: [] };
      blocks.push(b);
      if (type === 'park') {
        for (let i = 0; i < 24; i++) b.flowers.push(10 + rng() * (BS - 20), 10 + rng() * (BS - 20), pick(['#ff7ac8', '#ffe27a', '#ffffff', '#ff9a4d']));
        if (rng() < 0.6) add('fountain', x + BS / 2, y + BS / 2);
        for (let i = 0; i < 9; i++) { const a = rng() * 6.28, d = 70 + rng() * 45; add('tree', x + BS / 2 + Math.cos(a) * d, y + BS / 2 + Math.sin(a) * d, { col: rng() < 0.3 ? pick(['#ff5d6c', '#ffcc4d']) : '#000' }); }
        for (let i = 0; i < 6; i++) add('bush', x + 16 + rng() * (BS - 32), y + 16 + rng() * (BS - 32), { col: rng() < 0.5 ? pick(['#ff7ac8', '#ffffff']) : '#000' });
        for (let i = 0; i < 3; i++) add('bench', x + 40 + rng() * (BS - 80), y + 40 + rng() * (BS - 80));
        for (let i = 0; i < 5; i++) add('person', x + 30 + rng() * (BS - 60), y + 30 + rng() * (BS - 60), { col: pick(SHIRTS), hair: pick(['#3a2a20', '#1a1a1a', '#c08a3a']), move: 18 + rng() * 22 });
        for (let i = 0; i < 2; i++) add('trash', x + 20 + rng() * (BS - 40), y + 20 + rng() * (BS - 40));
      } else if (type === 'houses') {
        for (let i = 0; i < 4; i++) {
          const hx = x + (i % 2 ? BS * 0.75 : BS * 0.25), hy = y + (i < 2 ? BS * 0.27 : BS * 0.73);
          add('house', hx, hy, { col: pick(ROOFS), wall: pick(WALLS) });
          add('bush', hx + (rng() - 0.5) * 60, hy + 44, { col: '#000' });
          if (rng() < 0.6) add('tree', hx + (i % 2 ? 46 : -46), hy - 30 + rng() * 40, { col: '#000' });
        }
        for (let i = 0; i < 3; i++) add('person', x + BS / 2 + (rng() - 0.5) * 16, y + 20 + rng() * (BS - 40), { col: pick(SHIRTS), hair: pick(['#3a2a20', '#1a1a1a', '#c08a3a']), move: 20 + rng() * 20, vert: true });
        add('trash', x + BS / 2 + 14, y + 12); add('hydrant', x + BS / 2 - 14, y + BS - 12);
      } else if (type === 'plaza') {
        add('kiosk', x + BS * 0.3, y + BS * 0.3, { col: pick(['#ff5d6c', '#4c9bff', '#4cd986']) });
        add('kiosk', x + BS * 0.72, y + BS * 0.66, { col: pick(['#ff5d6c', '#ffcc4d', '#b26bff']) });
        for (let i = 0; i < 4; i++) add('bench', x + 30 + rng() * (BS - 60), y + 30 + rng() * (BS - 60));
        for (let i = 0; i < 10; i++) add('person', x + 20 + rng() * (BS - 40), y + 20 + rng() * (BS - 40), { col: pick(SHIRTS), hair: pick(['#3a2a20', '#1a1a1a', '#c08a3a']), move: 15 + rng() * 25 });
        for (let i = 0; i < 4; i++) add('lamp', x + (i % 2 ? BS - 18 : 18), y + (i < 2 ? 18 : BS - 18));
        for (let i = 0; i < 4; i++) add('cone', x + 20 + rng() * (BS - 40), y + 20 + rng() * (BS - 40));
        add('tree', x + BS * 0.75, y + BS * 0.22, { col: '#000' }); add('tree', x + BS * 0.22, y + BS * 0.78, { col: '#000' });
      } else if (type === 'parking') {
        for (let r2 = 0; r2 < 4; r2++) for (let c2 = 0; c2 < 5; c2++) if (rng() < 0.6) add('car', x + 41 + c2 * 42, y + 40 + r2 * 58, { col: pick(CARS), vert: true });
        add('cone', x + 10, y + 10); add('cone', x + BS - 10, y + 10);
        if (rng() < 0.5) add('bus', x + BS / 2, y + BS - 16, { col: '#ffcc4d', vert: false, dir: 1 });
      } else {
        const q2 = rng();
        if (q2 < 0.3) add('tower', x + BS / 2, y + BS / 2 + 10, { col: pick(['#ff5d6c', '#4c9bff', '#ffcc4d']), wall: pick(['#c8d4e4', '#e4d8c8', '#d0e4dc']) });
        else if (q2 < 0.6) {
          add('apartment', x + BS * 0.42, y + BS * 0.45, { col: pick(['#4cd986', '#ff8f3d', '#4c9bff']), wall: pick(['#e8d8c8', '#d8e0ec', '#ecdce4']) });
          add('kiosk', x + BS * 0.82, y + BS * 0.82, { col: pick(['#ff5d6c', '#ffcc4d']) });
          add('tree', x + BS * 0.85, y + BS * 0.2, { col: '#000' });
        } else {
          add('building', x + BS * 0.3, y + BS * 0.32, { col: pick(['#ff5d6c', '#4c9bff']), wall: pick(['#c8d4e4', '#e4d8c8', '#d0e4dc']) });
          add('shop', x + BS * 0.68, y + BS * 0.74, { col: pick(['#ff5d6c', '#4cd986', '#ff8f3d']), wall: pick(WALLS) });
          add('tree', x + BS * 0.78, y + BS * 0.25, { col: '#000' });
        }
        for (let i = 0; i < 3; i++) add('person', x + 14 + rng() * (BS - 28), y + BS - 12, { col: pick(SHIRTS), hair: pick(['#3a2a20', '#1a1a1a']), move: 30 });
      }
    }
    // street furniture: lamps & hydrants on sidewalks, cones and moving cars on roads
    for (let r = 0; r <= ny; r++) {
      const ry = r * (BS + RW) + RW / 2;
      for (let x = 60; x < WW - 40; x += 110 + rng() * 60) {
        const side = rng() < 0.5 ? -1 : 1;
        if (rng() < 0.55) add('lamp', x, ry + side * (RW / 2 - 2));
        else if (rng() < 0.5) add('hydrant', x, ry + side * (RW / 2 - 3));
        else add('cone', x, ry + side * 12);
      }
      const nc = 1 + (rng() < 0.5 ? 1 : 0);
      for (let i = 0; i < nc; i++) {
        const dir = rng() < 0.5 ? -1 : 1;
        add(rng() < 0.18 ? 'bus' : 'car', rng() * WW, ry + dir * 14, { col: pick(CARS), vert: false, dir, drive: 40 + rng() * 30 });
      }
    }
    for (let c = 0; c <= nx; c++) {
      const rx = c * (BS + RW) + RW / 2;
      for (let y = 60; y < WH - 40; y += 120 + rng() * 60) {
        const side = rng() < 0.5 ? -1 : 1;
        if (rng() < 0.5) add('lamp', rx + side * (RW / 2 - 2), y); else add('cone', rx + side * 12, y);
      }
      if (rng() < 0.7) { const dir = rng() < 0.5 ? -1 : 1; add('car', rx - dir * 14, rng() * WH, { col: pick(CARS), vert: true, dir, drive: 40 + rng() * 30 }); }
    }
    for (const o of objs) if (o.kind === 'person' && !o.move) o.move = 20;
    let total = 0;
    for (const o of objs) total += o.mass;
    return { nx, ny, WW, WH, blocks, objs, total, start: [RW + center[0] * (BS + RW) - RW / 2, RW + center[1] * (BS + RW) - RW / 2] };
  }

  function params(L, diff, endless, round) {
    if (endless) {
      return { time: 70, target: Math.min(0.4, 0.2 + 0.03 * (round - 1)), rivals: Math.min(5, 1 + round), rspd: Math.min(0.98, 0.82 + 0.03 * round), smart: 1, rgrow: Math.min(1, 0.75 + 0.03 * round) };
    }
    const lv = L - 1;
    return [
      { time: 80, target: Math.min(0.42, 0.22 + lv * 0.006), rivals: 0, rspd: 0.8, smart: 0, rgrow: 1 },
      { time: 75, target: Math.min(0.32, 0.24 + lv * 0.0025), rivals: 2 + (L >= 12 ? 1 : 0), rspd: 0.8, smart: 0.4, rgrow: 0.75 },
      { time: 75, target: Math.min(0.28, 0.21 + lv * 0.002), rivals: 3 + (L >= 15 ? 1 : 0), rspd: 0.86, smart: 1, rgrow: 0.76 },
    ][diff];
  }

  MG.register({
    id: 'hole', name: '黑洞吞噬', icon: '🕳️', color: '#5560c8', endless: true,
    create(api) {
      const L = api.level, DIFF = api.diff || 0, ENDLESS = !!api.endless, rng = api.rng;
      let W = api.W, H = api.H;
      let round = 1, P, M;
      const S = { T: 0, timeLeft: 0, eaten: 0, score: 0, over: false, holes: [], me: null, roundEaten: 0, banT: 0 };
      let anim = 0, cam = { x: 0, y: 0, z: 1 }, shake = 0, lastInfo = '', joy = null, hintT = 5, popSnd = 0;
      const banners = [];
      function banner(text, col, size) { banners.push({ text, col, size: size || 34, t: 0 }); if (banners.length > 3) banners.shift(); }
      const parts = []; for (let i = 0; i < 260; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 3 });
      let pCur = 0;
      const texts = []; for (let i = 0; i < 40; i++) texts.push({ on: false, x: 0, y: 0, t: 0, s: '', col: '#fff', size: 14, max: 0.8 });
      let tCur = 0;
      function addPart(x, y, vx, vy, life, col, size) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size;
      }
      function addText(x, y, s, col, size, max) {
        const t = texts[tCur]; tCur = (tCur + 1) % texts.length;
        t.on = true; t.x = x; t.y = y; t.s = s; t.col = col; t.size = size; t.t = 0; t.max = max || 0.8;
      }

      function newHole(x, y, col, name, isMe) {
        return { x, y, r: R0, dr: R0, mass: 0, col, name, me: !!isMe, vx: 0, vy: 0, tx: x, ty: y, think: 0, tgt: null, dead: false, respawn: 0, pulse: 0, falling: 0, by: null, spd: 1, smart: 0, wander: 0, hunt: 0, chase: 0, bored: 0, grow: 1 };
      }
      function startRound() {
        P = params(L, DIFF, ENDLESS, round);
        M = genMap(rng, P.rivals);
        S.timeLeft = P.time; S.roundEaten = 0;
        S.holes.length = 0;
        S.me = newHole(M.start[0], M.start[1], '#7d8cff', '你', true);
        S.holes.push(S.me);
        const spots = [];
        for (let c = 0; c <= M.nx; c++) for (let r = 0; r <= M.ny; r++) spots.push([c * (BS + RW) + RW / 2, r * (BS + RW) + RW / 2]);
        spots.sort((a, b) => Math.hypot(b[0] - S.me.x, b[1] - S.me.y) - Math.hypot(a[0] - S.me.x, a[1] - S.me.y));
        for (let i = 0; i < P.rivals; i++) {
          const sp = spots[(i * 3) % Math.min(spots.length, 12)];
          const h = newHole(sp[0], sp[1], HCOL[i % HCOL.length], NAMES[i % NAMES.length], false);
          h.spd = P.rspd; h.smart = P.smart; h.grow = P.rgrow; h.think = i * 0.07;
          S.holes.push(h);
        }
        cam.x = S.me.x; cam.y = S.me.y; cam.z = zoomFor(S.me.r);
        if (round > 1) banner('第 ' + round + ' 回合', '#ffe27a', 36);
      }
      function zoomFor(r) { return Math.min(W, H * 0.75) / Math.max(330, r * 9.5); }
      function speedOf(h) {
        if (h.me) return 150 + h.r * 0.9;
        // rivals never outrun you, and slow down a little when they are far ahead of you
        return (150 + Math.min(h.r, S.me.r) * 0.9) * h.spd * (h.hunt ? 0.92 : 1) * U.clamp(S.me.r / h.r, 0.72, 1);
      }

      startRound();

      // ---------- AI (rivals, and the check bot via _k.aiSteer) ----------
      function aiThink(h) {
        const sm = h.me ? 1 : h.smart;
        let fx = 0, fy = 0, threat = false;
        for (let i = 0; i < S.holes.length; i++) {
          const o = S.holes[i]; if (o === h || o.dead || o.falling) continue;
          if (o.r <= h.r * 1.08) continue;
          const d = Math.hypot(o.x - h.x, o.y - h.y);
          if (d < o.r + h.r + (h.me ? 110 : 40)) {
            const w = 1 / Math.max(10, d - o.r);
            fx -= (o.x - h.x) / (d || 1) * w; fy -= (o.y - h.y) / (d || 1) * w; threat = true;
          }
        }
        if (threat && sm > 0.3) {
          // pick the escape direction (of 12) that keeps the most room from bigger holes
          let bx = 0, by = 0, bsc = -1e9;
          for (let k = 0; k < 12; k++) {
            const a = k * Math.PI / 6, ux = Math.cos(a), uy = Math.sin(a);
            const px = h.x + ux * 140, py = h.y + uy * 140;
            let sc = (fx * ux + fy * uy) * 2000;
            const ex = Math.min(px, M.WW - px), ey = Math.min(py, M.WH - py);
            if (ex < h.r || ey < h.r) sc -= 1e6;
            for (let i = 0; i < S.holes.length; i++) {
              const o = S.holes[i]; if (o === h || o.dead || o.r <= h.r * 1.08) continue;
              sc += Math.min(400, Math.hypot(o.x - px, o.y - py) - o.r);
            }
            if (sc > bsc) { bsc = sc; bx = px; by = py; }
          }
          h.tx = U.clamp(bx, 20, M.WW - 20); h.ty = U.clamp(by, 20, M.WH - 20); h.tgt = null;
          return;
        }
        h.hunt = 0;
        if (sm > 0.5 && h.bored <= 0) {
          for (let i = 0; i < S.holes.length; i++) {
            const o = S.holes[i]; if (o === h || o.dead || o.falling) continue;
            if (h.r > o.r * 1.2 && Math.hypot(o.x - h.x, o.y - h.y) < 150 + h.r * 2) {
              h.tx = o.x; h.ty = o.y; h.tgt = null; h.hunt = 1;
              h.chase += 0.25; if (h.chase > (h.me ? 2 : 3.5)) { h.bored = 5; h.chase = 0; }
              return;
            }
          }
        }
        h.chase = 0;
        if (h.tgt && h.tgt.state === 0 && h.tgt.r <= h.r * 0.95) { h.tx = h.tgt.x; h.ty = h.tgt.y; return; }
        let best = null, bs = 0;
        const lim = h.r * 0.95, R = h.me ? 500 + h.r * 8 : 220 + 380 * sm;
        for (let i = 0; i < M.objs.length; i++) {
          const o = M.objs[i]; if (o.state !== 0 || o.r > lim) continue;
          const d = Math.hypot(o.x - h.x, o.y - h.y);
          if (d > R) continue;
          let s = (o.mass + 0.6) / (d + 40 + h.r);
          if (sm > 0.3) {
            for (let k = 0; k < S.holes.length; k++) {
              const b = S.holes[k]; if (b === h || b.dead || b.r <= h.r * 1.08) continue;
              if (Math.hypot(b.x - o.x, b.y - o.y) < b.r + h.r + 70) { s *= 0.05; break; }
            }
          }
          if (s > bs) { bs = s; best = o; }
        }
        h.tgt = best;
        if (best) { h.tx = best.x; h.ty = best.y; }
        else { h.wander -= 1; if (h.wander <= 0) { h.wander = 8; h.tx = 60 + rng() * (M.WW - 120); h.ty = 60 + rng() * (M.WH - 120); } }
      }

      // ---------- simulation ----------
      function eatCheck(h) {
        const lim = h.r * 0.95;
        for (let i = 0; i < M.objs.length; i++) {
          const o = M.objs[i]; if (o.state !== 0 || o.r > lim) continue;
          const dx = o.x - h.x, dy = o.y - h.y, rr = h.r - o.r * 0.45;
          if (dx * dx + dy * dy < rr * rr) {
            o.state = 1; o.ft = 0; o.by = h; o.fx = o.x; o.fy = o.y; o.rot = (dx >= 0 ? 1 : -1) * (0.8 + Math.random() * 0.8);
            h.mass += o.mass;
            h.r = Math.sqrt(R0 * R0 + GROW * h.grow * h.mass);
            if (h.me) {
              S.eaten += o.mass; S.roundEaten += o.mass; S.score += o.mass;
              api.score(Math.floor(S.score));
              const big = o.r >= 20;
              if (popSnd <= 0 || big) { api.sfx(big ? 'good' : 'pop'); popSnd = 0.07; }
              if (big) { shake = Math.max(shake, Math.min(10, o.r * 0.12)); h.pulse = 1; }
              addText(o.x, o.y - o.r - 10, '+' + Math.max(1, Math.round(o.mass)), big ? '#ffe27a' : '#ffffff', big ? 20 : 14, 0.8);
            }
          }
        }
      }
      function holeVsHole() {
        for (let i = 0; i < S.holes.length; i++) {
          const a = S.holes[i]; if (a.dead || a.falling) continue;
          for (let j = 0; j < S.holes.length; j++) {
            const b = S.holes[j]; if (i === j || b.dead || b.falling) continue;
            if (a.r > b.r * 1.12) {
              const d = Math.hypot(a.x - b.x, a.y - b.y);
              if (d < a.r - b.r * 0.8) {
                b.falling = 0.001; b.by = a;
                const gain = b.mass * 0.5 + 8;
                a.mass += gain; a.r = Math.sqrt(R0 * R0 + GROW * a.grow * a.mass);
                shake = Math.max(shake, 8);
                if (a.me) { S.eaten += 0; S.score += gain; api.score(Math.floor(S.score)); banner('吞掉 ' + b.name + '！', '#7dffa8', 34); api.sfx('good'); a.pulse = 1; }
                if (b.me) { api.sfx('bad'); banner('被 ' + a.name + ' 吞了！', '#ff5d6c', 34); }
              }
            }
          }
        }
      }
      function moveHole(h, dt) {
        let dx, dy, mag;
        if (h.me) {
          if (joy && joy.on) { dx = joy.dx; dy = joy.dy; mag = Math.min(1, Math.hypot(dx, dy) / 46); }
          else { dx = 0; dy = 0; mag = 0; }
        } else { dx = h.tx - h.x; dy = h.ty - h.y; mag = Math.min(1, Math.hypot(dx, dy) / 6); }
        const n = Math.hypot(dx, dy) || 1;
        const sp = speedOf(h) * mag;
        const tvx = dx / n * sp, tvy = dy / n * sp;
        const k = Math.min(1, dt * 9);
        h.vx += (tvx - h.vx) * k; h.vy += (tvy - h.vy) * k;
        h.x = U.clamp(h.x + h.vx * dt, h.r * 0.5, M.WW - h.r * 0.5);
        h.y = U.clamp(h.y + h.vy * dt, h.r * 0.5, M.WH - h.r * 0.5);
      }

      function update(dt) {
        anim += dt;
        updFx(dt);
        // falling objects animate even after the end
        for (let i = 0; i < M.objs.length; i++) {
          const o = M.objs[i]; if (o.state !== 1) continue;
          o.ft += dt / 0.5;
          if (o.ft >= 1) { o.state = 2; if (o.by && o.by.me && o.r >= 14) for (let k = 0; k < 6; k++) addPart(o.by.x, o.by.y, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120, 0.4, o.col !== '#000' ? o.col : '#ffffff', 4); }
        }
        for (let i = 0; i < S.holes.length; i++) { const h = S.holes[i]; h.dr += (h.r - h.dr) * Math.min(1, dt * 5); if (h.pulse > 0) h.pulse = Math.max(0, h.pulse - dt * 2); }
        const me = S.me;
        const z = zoomFor(me.dr);
        cam.z += (z - cam.z) * Math.min(1, dt * 3);
        cam.x += (me.x - cam.x) * Math.min(1, dt * 8); cam.y += (me.y - cam.y) * Math.min(1, dt * 8);
        if (api.ended || S.over) return;
        S.T += dt; hintT -= dt; popSnd -= dt;
        S.timeLeft -= dt;
        // moving people & cars (deterministic in time)
        for (let i = 0; i < M.objs.length; i++) {
          const o = M.objs[i]; if (o.state !== 0) continue;
          if (o.drive) {
            if (o.vert) { o.y += o.dir * o.drive * dt; if (o.y < -40) o.y = M.WH + 40; if (o.y > M.WH + 40) o.y = -40; }
            else { o.x += o.dir * o.drive * dt; if (o.x < -40) o.x = M.WW + 40; if (o.x > M.WW + 40) o.x = -40; }
          } else if (o.kind === 'person') {
            const s = Math.sin(S.T * 0.6 + o.ph) * o.move;
            if (o.vert) o.y = o.y0 + s; else o.x = o.x0 + s;
          }
        }
        for (let i = 0; i < S.holes.length; i++) {
          const h = S.holes[i];
          if (h.dead) { if (!h.me) { h.respawn -= dt; if (h.respawn <= 0) respawnRival(h); } continue; }
          if (h.falling) {
            h.falling += dt / 0.6;
            if (h.by) { h.x += (h.by.x - h.x) * Math.min(1, dt * 8); h.y += (h.by.y - h.y) * Math.min(1, dt * 8); }
            if (h.falling >= 1) {
              h.dead = true; h.respawn = 6;
              if (h.me) { S.over = true; api.lose(ENDLESS ? '撐到第 ' + round + ' 回合，吞了 ' + Math.floor(S.score) : '被別的黑洞吞掉了！'); return; }
            }
            continue;
          }
          if (!h.me) { h.bored -= dt; h.think -= dt; if (h.think <= 0) { h.think = 0.25; aiThink(h); } }
          moveHole(h, dt);
          eatCheck(h);
        }
        holeVsHole();
        const pct = S.roundEaten / M.total;
        if (pct >= P.target) {
          if (ENDLESS) {
            banner('回合完成！', '#7dffa8', 40); api.sfx('win');
            for (let i = 0; i < 40; i++) addPart(me.x + (Math.random() - 0.5) * 200, me.y - 100, (Math.random() - 0.5) * 200, Math.random() * 200, 1.5, U.PALETTE[i % 8], 6);
            S.score += Math.round(S.timeLeft * 3); api.score(Math.floor(S.score));
            round++; startRound();
            return;
          }
          S.over = true;
          for (let i = 0; i < 70; i++) addPart(me.x + (Math.random() - 0.5) * 300, me.y - 200, (Math.random() - 0.5) * 240, Math.random() * 240, 2, U.PALETTE[i % 8], 7);
          banner('吞噬完成！', '#7dffa8', 42);
          api.win('吞掉了城市的 ' + Math.round(pct * 100) + '%！');
          return;
        }
        if (S.timeLeft <= 0) {
          S.timeLeft = 0; S.over = true;
          banner('時間到！', '#ff5d6c', 40);
          api.lose(ENDLESS ? '第 ' + round + ' 回合時間到，總共吞了 ' + Math.floor(S.score) : '時間到！只吞了 ' + Math.round(pct * 100) + '%（目標 ' + Math.round(P.target * 100) + '%）');
          return;
        }
        if (S.timeLeft < 10 && Math.floor(S.timeLeft + dt) !== Math.floor(S.timeLeft)) api.sfx('tap');
        let info;
        if (L === 1 && DIFF === 0 && S.T < 12 && !ENDLESS) info = '拖曳移動黑洞，吃掉比洞小的東西就會變大！';
        else if (ENDLESS) info = '無盡模式 · 第 ' + round + ' 回合 · 目標 ' + Math.round(P.target * 100) + '%';
        else info = '時限內吞掉城市的 ' + Math.round(P.target * 100) + '%' + (P.rivals ? ' · 小心更大的黑洞' : '');
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
      }
      function respawnRival(h) {
        let bx = 0, by = 0, bd = -1;
        for (let k = 0; k < 8; k++) {
          const x = RW / 2 + Math.floor(rng() * (M.nx + 1)) * (BS + RW), y = RW / 2 + Math.floor(rng() * (M.ny + 1)) * (BS + RW);
          const d = Math.hypot(x - S.me.x, y - S.me.y);
          if (d > bd) { bd = d; bx = x; by = y; }
        }
        h.x = bx; h.y = by; h.mass = 0; h.r = R0; h.dr = 2; h.dead = false; h.falling = 0; h.by = null; h.tgt = null; h.vx = 0; h.vy = 0;
      }
      function updFx(dt) {
        if (shake > 0) shake = Math.max(0, shake - dt * 30);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
          p.vy += 300 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        }
        for (let i = 0; i < texts.length; i++) { const t = texts[i]; if (!t.on) continue; t.t += dt; t.y -= 30 * dt; if (t.t >= t.max) t.on = false; }
        for (let i = banners.length - 1; i >= 0; i--) { banners[i].t += dt; if (banners[i].t > 1.5) banners.splice(i, 1); }
      }

      // ---------- draw ----------
      const vis = [];
      function draw(g) {
        const z = cam.z;
        const sx = (Math.random() - 0.5) * shake, sy = (Math.random() - 0.5) * shake;
        const vx0 = cam.x - W / 2 / z - 60, vy0 = cam.y - H / 2 / z - 60, vx1 = cam.x + W / 2 / z + 60, vy1 = cam.y + H / 2 / z + 160;
        g.save();
        g.fillStyle = '#7cd36a'; g.fillRect(0, 0, W, H);
        g.translate(W / 2 + sx, H / 2 + sy); g.scale(z, z); g.translate(-cam.x, -cam.y);
        drawGround(g, M, vx0, vy0, vx1, vy1, anim);
        for (let i = 0; i < S.holes.length; i++) { const h = S.holes[i]; if (!h.dead && !h.falling) drawHole(g, h, anim, h.me); }
        // objects falling into holes: clipped to their hole
        for (let i = 0; i < M.objs.length; i++) {
          const o = M.objs[i]; if (o.state !== 1 || !o.by) continue;
          const h = o.by, t = o.ft;
          if (o.x < vx0 || o.x > vx1 || o.y < vy0 || o.y > vy1) continue;
          g.save();
          g.beginPath(); g.arc(h.x, h.y, h.dr, 0, 6.283); g.clip();
          const e = t * t;
          const px = U.lerp(o.fx, h.x, Math.min(1, t * 1.4)), py = U.lerp(o.fy, h.y, Math.min(1, t * 1.4)) + e * h.dr * 0.9;
          g.translate(px, py); g.rotate(o.rot * Math.min(1, t * 2)); const s = 1 - t * 0.5; g.scale(s, s);
          g.globalAlpha = 1 - e * 0.6;
          drawObject(g, o, anim);
          g.restore();
        }
        for (let i = 0; i < S.holes.length; i++) { const h = S.holes[i]; if (!h.dead && !h.falling) drawHoleRim(g, h, anim, h.me); }
        // holes being swallowed
        for (let i = 0; i < S.holes.length; i++) {
          const h = S.holes[i]; if (!h.falling || h.dead) continue;
          const s = 1 - h.falling;
          g.globalAlpha = s; g.fillStyle = '#1c1430'; g.beginPath(); g.arc(h.x, h.y, h.dr * s, 0, 6.283); g.fill();
          g.strokeStyle = OL; g.lineWidth = 7; g.stroke(); g.strokeStyle = h.col; g.lineWidth = 4; g.stroke(); g.globalAlpha = 1;
        }
        // standing objects, back to front
        vis.length = 0;
        for (let i = 0; i < M.objs.length; i++) {
          const o = M.objs[i]; if (o.state !== 0) continue;
          if (o.x < vx0 - o.r || o.x > vx1 + o.r || o.y < vy0 - o.r || o.y > vy1 + 120) continue;
          vis.push(o);
        }
        vis.sort((a, b) => a.y - b.y);
        for (let i = 0; i < vis.length; i++) {
          const o = vis[i];
          g.save(); g.translate(o.x, o.y);
          // wobble when a hole slides under something too big
          for (let k = 0; k < S.holes.length; k++) {
            const h = S.holes[k]; if (h.dead) continue;
            const d = Math.hypot(o.x - h.x, o.y - h.y);
            if (d < h.r + o.r * 0.5 && o.r > h.r * 0.95) { g.rotate(Math.sin(anim * 25 + o.ph) * 0.04); break; }
          }
          drawObject(g, o, anim);
          g.restore();
        }
        // hole names
        for (let i = 0; i < S.holes.length; i++) {
          const h = S.holes[i]; if (h.dead || h.falling) continue;
          const fs = Math.max(11, 13 / z);
          const lbl = h.name + ' ' + Math.round(h.r);
          olText(g, lbl, h.x, h.y - h.dr - fs * 1.1, fs, h.me ? '#ffffff' : h.col, 4 / z);
        }
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.5); g.fillStyle = p.col;
          g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        g.globalAlpha = 1;
        for (let i = 0; i < texts.length; i++) {
          const t = texts[i]; if (!t.on) continue;
          const k = t.t / t.max;
          g.globalAlpha = k > 0.6 ? (1 - k) / 0.4 : 1;
          const fs = t.size / z;
          olText(g, t.s, t.x, t.y, fs, t.col, 4 / z);
        }
        g.globalAlpha = 1;
        g.restore();
        // off-screen rival arrows
        for (let i = 0; i < S.holes.length; i++) {
          const h = S.holes[i]; if (h.me || h.dead) continue;
          const px = W / 2 + (h.x - cam.x) * z, py = H / 2 + (h.y - cam.y) * z;
          if (px > 0 && px < W && py > 0 && py < H) continue;
          const a = Math.atan2(py - H / 2, px - W / 2);
          const ex = U.clamp(px, 22, W - 22), ey = U.clamp(py, 70, H - 22);
          g.save(); g.translate(ex, ey); g.rotate(a);
          g.fillStyle = h.r > S.me.r * 1.08 ? '#ff5d6c' : h.col;
          g.beginPath(); g.moveTo(13, 0); g.lineTo(-8, -9); g.lineTo(-8, 9); g.closePath(); g.fill();
          g.lineWidth = 2.5; g.lineJoin = 'round'; g.strokeStyle = OL; g.stroke();
          g.restore();
        }
        drawHud(g);
        if (joy && joy.on) {
          g.globalAlpha = 0.45; g.strokeStyle = OL; g.lineWidth = 6;
          g.beginPath(); g.arc(joy.x0, joy.y0, 46, 0, 6.283); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke();
          const m = Math.min(1, Math.hypot(joy.dx, joy.dy) / 46), n = Math.hypot(joy.dx, joy.dy) || 1;
          g.globalAlpha = 0.6; g.fillStyle = '#fff'; g.beginPath(); g.arc(joy.x0 + joy.dx / n * m * 46, joy.y0 + joy.dy / n * m * 46, 18, 0, 6.283); g.fill();
          g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
          g.globalAlpha = 1;
        }
        for (let i = 0; i < banners.length; i++) {
          const b = banners[i];
          const k = Math.min(1, b.t / 0.35), s = U.easeOutBack(k);
          g.globalAlpha = b.t > 1.2 ? Math.max(0, 1 - (b.t - 1.2) / 0.3) : 1;
          const fs = Math.min(b.size, W / 9) * s;
          olText(g, b.text, W / 2, H * 0.3 + i * 46, fs, b.col, 7);
        }
        g.globalAlpha = 1;
        if (hintT > 0 && !api.ended && !(joy && joy.on)) {
          g.globalAlpha = Math.min(1, hintT) * (0.6 + 0.4 * Math.sin(anim * 5));
          const hx = W / 2 + Math.cos(anim * 2) * 40, hy = H * 0.72 + Math.sin(anim * 2) * 30;
          U.text(g, '👆', hx, hy, 30, '#fff');
          olText(g, '按住拖曳移動', W / 2, H * 0.72 + 64, 17, '#fff', 4);
          g.globalAlpha = 1;
        }
      }
      function drawHud(g) {
        const pad = 8;
        const pct = Math.min(1, S.roundEaten / M.total / P.target);
        const bw = Math.min(W - 120, 260), bx = (W - bw) / 2, by = pad + 4;
        pill(g, bx - 4, by - 4, bw + 8, 26, 13);
        g.fillStyle = '#8f7dff'; U.rr(g, bx, by, Math.max(10, bw * pct), 18, 9); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.45)'; U.rr(g, bx + 4, by + 3, Math.max(2, bw * pct - 8), 4, 2); g.fill();
        olText(g, Math.floor(S.roundEaten / M.total * 100) + '% / ' + Math.round(P.target * 100) + '%', W / 2, by + 9.5, 12, '#fff', 3);
        // timer
        const tl = Math.max(0, Math.ceil(S.timeLeft));
        const urgent = S.timeLeft < 10;
        const tx = pad + 26, ty = pad + 26;
        g.beginPath(); g.arc(tx, ty, 24, 0, 6.283); g.fillStyle = 'rgba(255,244,220,0.95)'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
        g.strokeStyle = urgent ? '#ff5d6c' : '#ffb02e'; g.lineWidth = 5; g.lineCap = 'round';
        g.beginPath(); g.arc(tx, ty, 18, -Math.PI / 2, -Math.PI / 2 + 6.283 * Math.max(0, S.timeLeft / P.time)); g.stroke();
        const sc = urgent ? 1 + 0.15 * Math.max(0, Math.sin(anim * 10)) : 1;
        olText(g, String(tl), tx, ty + 1, 16 * sc, urgent ? '#ff8a95' : '#fff', 3.5);
        // size / score
        pill(g, W - pad - 58, pad + 4, 58, 40, 12);
        if (ENDLESS) {
          olText(g, String(Math.floor(S.score)), W - pad - 29, pad + 17, 14, '#fff', 3.5);
          U.text(g, '最高 ' + Math.max(api.best || 0, Math.floor(S.score)), W - pad - 29, pad + 34, 9, '#a0602a', 'center', 900);
        } else {
          U.text(g, '大小', W - pad - 29, pad + 15, 10, '#a0602a', 'center', 900);
          olText(g, String(Math.round(S.me.r)), W - pad - 29, pad + 31, 15, '#fff', 3.5);
        }
        if (ENDLESS) olText(g, '第 ' + round + ' 回合', W / 2, by + 34, 12, '#ffe27a', 3);
      }

      function down(x, y) { if (api.ended || S.over) return; joy = { on: true, x0: x, y0: y, dx: 0, dy: 0 }; hintT = Math.min(hintT, 0.3); }
      function move(x, y) {
        if (!joy) return;
        joy.dx = x - joy.x0; joy.dy = y - joy.y0;
        const d = Math.hypot(joy.dx, joy.dy);
        if (d > 70) { joy.x0 = x - joy.dx / d * 70; joy.y0 = y - joy.dy / d * 70; joy.dx = x - joy.x0; joy.dy = y - joy.y0; }
      }
      function up() { if (joy) joy.on = false; joy = null; }

      return {
        update, draw, down, move, up,
        resize() { W = api.W; H = api.H; },
        _s: S, _k: { get M() { return M; }, get P() { return P; }, aiThink, get round() { return round; } },
      };
    },
  });
})();
