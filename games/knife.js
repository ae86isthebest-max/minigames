// 擲飛刀 — Knife Hit: tap to throw a knife into the spinning log. Hitting a stuck knife = lose.
// Apples on the rim give bonus. Every 5th stage is a boss target. 無盡: stages forever.
(function () {
  'use strict';

  const KW = 0.2;          // angular width a stuck knife blocks (rad)
  const AW = 0.24;         // apple hit width
  const FT = 0.09;         // knife flight time (s)
  const TAU = Math.PI * 2;

  // ---------- art: 卡通 Q 版 (thick outlines, cartoon log / boss targets with faces) ----------
  const OL = '#2a1a14';
  function U_otext(g, str, x, y, size, col, lw, align) {
    g.font = '900 ' + size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
    g.textAlign = align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = lw || 4; g.strokeStyle = OL; g.strokeText(str, x, y);
    g.fillStyle = col; g.fillText(str, x, y);
  }
  function U_disc(x, cx, cy, r, fill, lw) {
    x.beginPath(); x.arc(cx, cy, Math.max(0.5, r), 0, TAU); x.fillStyle = fill; x.fill();
    if (lw) { x.lineWidth = lw; x.strokeStyle = OL; x.stroke(); }
  }
  function pine(x, px, by, h, col) {
    x.fillStyle = '#6b4226'; x.fillRect(px - h * 0.05, by - h * 0.2, h * 0.1, h * 0.2); x.lineWidth = 2; x.strokeStyle = OL; x.strokeRect(px - h * 0.05, by - h * 0.2, h * 0.1, h * 0.2);
    for (let k = 0; k < 3; k++) {
      const y0 = by - h * 0.15 - k * h * 0.26, w = h * (0.36 - k * 0.08);
      x.beginPath(); x.moveTo(px - w, y0); x.lineTo(px, y0 - h * 0.4); x.lineTo(px + w, y0); x.closePath();
      x.fillStyle = col; x.fill(); x.lineWidth = 2.5; x.lineJoin = 'round'; x.strokeStyle = OL; x.stroke();
    }
  }
  // dusk forest clearing (normal) / volcano arena (boss); the target hangs in front of a glowing sun
  function drawBackground(x, W, H, cx, cy, R, boss) {
    let gr = x.createLinearGradient(0, 0, 0, H * 0.7);
    if (boss) { gr.addColorStop(0, '#2a0f22'); gr.addColorStop(0.55, '#7a1f2e'); gr.addColorStop(1, '#e0542f'); }
    else { gr.addColorStop(0, '#3d3477'); gr.addColorStop(0.5, '#c8689a'); gr.addColorStop(1, '#ffbe7a'); }
    x.fillStyle = gr; x.fillRect(0, 0, W, H);
    // glow + sun behind the target
    gr = x.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 2.4);
    gr.addColorStop(0, boss ? 'rgba(255,120,80,0.45)' : 'rgba(255,240,180,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, W, H);
    U_disc(x, cx, cy, R * 1.32, boss ? '#ff7a4a' : '#ffe58a', 0);
    x.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 26; i++) { x.beginPath(); x.arc((i * 97 + 13) % W, (i * 41 + 7) % (H * 0.3), 0.8 + (i % 3) * 0.5, 0, TAU); x.fill(); }
    // far mountains
    const my = H * 0.6;
    x.beginPath(); x.moveTo(0, H);
    x.lineTo(0, my - 20); x.lineTo(W * 0.18, my - 90); x.lineTo(W * 0.32, my - 40); x.lineTo(W * 0.5, my - 110); x.lineTo(W * 0.68, my - 50); x.lineTo(W * 0.85, my - 100); x.lineTo(W, my - 30); x.lineTo(W, H); x.closePath();
    x.fillStyle = boss ? '#4a1a26' : '#6a5a9a'; x.fill(); x.lineWidth = 3; x.lineJoin = 'round'; x.strokeStyle = OL; x.stroke();
    if (boss) {
      // lava rivers down the peaks
      x.strokeStyle = '#ff9a3a'; x.lineWidth = 4; x.lineCap = 'round';
      x.beginPath(); x.moveTo(W * 0.5, my - 104); x.quadraticCurveTo(W * 0.47, my - 60, W * 0.52, my - 10); x.moveTo(W * 0.18, my - 84); x.quadraticCurveTo(W * 0.22, my - 50, W * 0.16, my - 5); x.stroke(); x.lineCap = 'butt';
    } else {
      x.fillStyle = '#ffffff';
      for (const p of [[0.18, 90], [0.5, 110], [0.85, 100]]) { x.beginPath(); x.moveTo(W * p[0], my - p[1]); x.lineTo(W * p[0] + 14, my - p[1] + 22); x.lineTo(W * p[0] - 14, my - p[1] + 22); x.closePath(); x.fill(); x.lineWidth = 2; x.stroke(); }
    }
    // tree line
    const ty = H * 0.72;
    for (let i = 0; i < 9; i++) {
      const px = (i + 0.3) * W / 8.5, h = 70 + ((i * 37) % 40);
      if (Math.abs(px - cx) < 30 && ty - h < cy + R) continue;
      pine(x, px, ty + 6, h, boss ? (i % 2 ? '#3a2430' : '#4a2c38') : (i % 2 ? '#3f8a4f' : '#4fa35c'));
    }
    // ground
    x.beginPath(); x.moveTo(0, ty); x.quadraticCurveTo(W * 0.5, ty - 18, W, ty); x.lineTo(W, H); x.lineTo(0, H); x.closePath();
    x.fillStyle = boss ? '#5a2a2a' : '#7fcf5a'; x.fill(); x.lineWidth = 3; x.strokeStyle = OL; x.stroke();
    if (boss) {
      x.strokeStyle = '#ff7a3a'; x.lineWidth = 3; x.lineCap = 'round';
      for (let i = 0; i < 6; i++) { const lx = (i * 71 + 30) % W, ly = ty + 30 + (i * 53) % Math.max(20, H - ty - 40); x.beginPath(); x.moveTo(lx, ly); x.lineTo(lx + 14, ly + 6); x.lineTo(lx + 10, ly + 16); x.stroke(); }
      x.lineCap = 'butt';
    } else {
      x.strokeStyle = '#4f9a3a'; x.lineWidth = 2; x.lineCap = 'round';
      for (let i = 0; i < 14; i++) { const gx = (i * 61 + 17) % W, gy = ty + 26 + (i * 47) % Math.max(20, H - ty - 30); x.beginPath(); x.moveTo(gx - 4, gy); x.lineTo(gx - 2, gy - 7); x.moveTo(gx, gy); x.lineTo(gx + 1, gy - 9); x.moveTo(gx + 4, gy); x.lineTo(gx + 3, gy - 6); x.stroke(); }
      x.lineCap = 'butt';
      // hay bale + practice post on the sides
      x.beginPath(); x.ellipse(W - 40, ty + 34, 26, 18, 0, 0, TAU); x.fillStyle = '#f2c94c'; x.fill(); x.lineWidth = 2.5; x.strokeStyle = OL; x.stroke();
      x.strokeStyle = 'rgba(160,110,20,0.6)'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(W - 40, ty + 34, 15, 10, 0, 0, TAU); x.stroke();
    }
  }
  // a cartoon face on the target (it spins with it)
  function face(x, R, angry, oy) {
    oy = oy || 0;
    const lw = Math.max(1.5, R * 0.035);
    for (let i = -1; i <= 1; i += 2) {
      const ex = i * R * 0.3, ey = -R * 0.1 + oy;
      x.beginPath(); x.ellipse(ex, ey, R * 0.15, R * 0.17, 0, 0, TAU); x.fillStyle = '#fffbe8'; x.fill(); x.lineWidth = lw; x.strokeStyle = OL; x.stroke();
      U_disc(x, ex + (angry ? -i * R * 0.03 : 0), ey + R * 0.03, R * 0.08, OL, 0);
      U_disc(x, ex - R * 0.03, ey - R * 0.02, R * 0.03, '#ffffff', 0);
      if (angry) { x.lineCap = 'round'; x.lineWidth = lw * 1.6; x.beginPath(); x.moveTo(ex + i * R * 0.18, ey - R * 0.26); x.lineTo(ex - i * R * 0.1, ey - R * 0.15); x.stroke(); x.lineCap = 'butt'; }
    }
    if (angry) {
      x.beginPath(); x.moveTo(-R * 0.25, R * 0.22 + oy); x.quadraticCurveTo(0, R * 0.12 + oy, R * 0.25, R * 0.22 + oy); x.quadraticCurveTo(0, R * 0.36 + oy, -R * 0.25, R * 0.22 + oy); x.closePath();
      x.fillStyle = OL; x.fill();
      x.fillStyle = '#ffffff';
      for (let k = -2; k <= 1; k++) { x.beginPath(); x.moveTo(k * R * 0.1 + R * 0.02, R * 0.19 + oy); x.lineTo(k * R * 0.1 + R * 0.07, R * 0.26 + oy); x.lineTo(k * R * 0.1 + R * 0.12, R * 0.19 + oy); x.closePath(); x.fill(); }
    } else {
      x.fillStyle = 'rgba(255,110,130,0.5)'; x.beginPath(); x.ellipse(-R * 0.5, R * 0.12 + oy, R * 0.1, R * 0.06, 0, 0, TAU); x.ellipse(R * 0.5, R * 0.12 + oy, R * 0.1, R * 0.06, 0, 0, TAU); x.fill();
      x.beginPath(); x.arc(0, R * 0.12 + oy, R * 0.12, 0.2, Math.PI - 0.2); x.lineWidth = lw * 1.2; x.lineCap = 'round'; x.strokeStyle = OL; x.stroke(); x.lineCap = 'butt';
    }
  }
  // the target face, drawn centred at (0,0) with radius R; kind: 0 log, 1 orange, 2 cheese, 3 tyre, 4 shield
  function drawTarget(x, kind, R, U) {
    const lw = Math.max(2.5, R * 0.045);
    if (kind === 1) {
      U_disc(x, 0, 0, R * 0.98, '#ff9a1f', lw);
      U_disc(x, 0, 0, R * 0.86, '#fff1c9', 0);
      for (let i = 0; i < 10; i++) {
        x.fillStyle = i % 2 ? '#ffb340' : '#ffa62b';
        x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, R * 0.8, i * TAU / 10 + 0.05, (i + 1) * TAU / 10 - 0.05); x.closePath(); x.fill();
      }
      x.fillStyle = 'rgba(255,255,255,0.35)'; x.beginPath(); x.ellipse(-R * 0.45, -R * 0.55, R * 0.25, R * 0.1, -0.6, 0, TAU); x.fill();
      face(x, R, true);
      return;
    }
    if (kind === 2) {
      U_disc(x, 0, 0, R * 0.98, '#ffd84d', lw);
      const holes = [[0.42, 0.5, 0.13], [-0.55, 0.38, 0.11], [0.62, -0.3, 0.1], [-0.15, 0.68, 0.09], [-0.6, -0.42, 0.09], [0.1, -0.7, 0.08]];
      for (const h of holes) { U_disc(x, h[0] * R, h[1] * R, h[2] * R, '#e0a614', lw * 0.6); }
      x.fillStyle = 'rgba(255,255,255,0.45)'; x.beginPath(); x.ellipse(-R * 0.35, -R * 0.62, R * 0.24, R * 0.09, -0.5, 0, TAU); x.fill();
      face(x, R, true);
      return;
    }
    if (kind === 3) {
      U_disc(x, 0, 0, R * 0.98, '#34343f', lw);
      x.strokeStyle = '#4c4c5c'; x.lineWidth = R * 0.08;
      for (let i = 0; i < 16; i++) { const a = i * TAU / 16; x.beginPath(); x.moveTo(Math.cos(a) * R * 0.72, Math.sin(a) * R * 0.72); x.lineTo(Math.cos(a + 0.15) * R * 0.93, Math.sin(a + 0.15) * R * 0.93); x.stroke(); }
      U_disc(x, 0, 0, R * 0.64, '#c8cede', lw);
      x.fillStyle = 'rgba(255,255,255,0.55)'; x.beginPath(); x.ellipse(-R * 0.25, -R * 0.4, R * 0.2, R * 0.08, -0.5, 0, TAU); x.fill();
      x.save(); x.scale(0.8, 0.8); face(x, R, true); x.restore();
      return;
    }
    if (kind === 4) {
      U_disc(x, 0, 0, R * 0.98, '#e0384c', lw);
      x.strokeStyle = OL; x.lineWidth = R * 0.14; x.beginPath(); x.arc(0, 0, R * 0.86, 0, TAU); x.stroke();
      x.strokeStyle = '#ffd34d'; x.lineWidth = R * 0.1; x.beginPath(); x.arc(0, 0, R * 0.86, 0, TAU); x.stroke();
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12; U_disc(x, Math.cos(a) * R * 0.86, Math.sin(a) * R * 0.86, R * 0.04, '#fff3b0', 0); }
      x.fillStyle = '#ffd34d'; x.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * TAU / 10, rr = (i % 2 ? R * 0.07 : R * 0.16); const px = Math.cos(a) * rr, py = Math.sin(a) * rr - R * 0.5; if (i) x.lineTo(px, py); else x.moveTo(px, py); }
      x.closePath(); x.fill(); x.lineWidth = lw * 0.6; x.strokeStyle = OL; x.stroke();
      x.fillStyle = 'rgba(255,255,255,0.3)'; x.beginPath(); x.ellipse(-R * 0.4, -R * 0.45, R * 0.18, R * 0.08, -0.6, 0, TAU); x.fill();
      face(x, R * 0.9, true, R * 0.08);
      return;
    }
    // wooden log: bark ring, tree rings, cute face
    U_disc(x, 0, 0, R * 0.98, '#8a5a32', lw);
    for (let i = 0; i < 18; i++) { const a = i * TAU / 18; U_disc(x, Math.cos(a) * R * 0.93, Math.sin(a) * R * 0.93, R * 0.045, '#6b4226', 0); }
    U_disc(x, 0, 0, R * 0.84, '#f2c27e', lw * 0.8);
    x.strokeStyle = 'rgba(176,110,50,0.55)'; x.lineWidth = Math.max(1.5, R * 0.025);
    for (let i = 1; i <= 4; i++) { x.beginPath(); x.arc(R * 0.02 * i, R * 0.02, R * 0.19 * i, 0, TAU); x.stroke(); }
    x.fillStyle = 'rgba(255,255,255,0.35)'; x.beginPath(); x.ellipse(-R * 0.38, -R * 0.55, R * 0.24, R * 0.09, -0.5, 0, TAU); x.fill();
    face(x, R, false);
  }
  // knife pointing up: tip at (0, -len/2)
  function drawKnife(g, len, glow) {
    const w = len * 0.13, lw = Math.max(1, len * 0.03);
    const tip = -len / 2, guard = len * 0.08, end = len / 2;
    g.lineJoin = 'round';
    g.beginPath(); g.moveTo(0, tip); g.lineTo(w * 0.55, tip + len * 0.12); g.lineTo(w * 0.5, guard); g.lineTo(-w * 0.5, guard); g.lineTo(-w * 0.5, tip + len * 0.18); g.closePath();
    g.fillStyle = '#dfe6f2'; g.fill(); g.lineWidth = lw; g.strokeStyle = OL; g.stroke();
    g.fillStyle = '#ffffff'; g.fillRect(-w * 0.28, tip + len * 0.2, w * 0.22, guard - tip - len * 0.24);
    U_rr(g, -w * 0.42, guard + len * 0.035, w * 0.84, end - guard - len * 0.035, w * 0.35); g.fillStyle = '#9a5a2e'; g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,220,170,0.45)'; g.fillRect(-w * 0.25, guard + len * 0.07, w * 0.14, (end - guard) * 0.7);
    U_rr(g, -w * 0.95, guard - len * 0.015, w * 1.9, len * 0.05, len * 0.02); g.fillStyle = '#ffcc4d'; g.fill(); g.stroke();
    g.beginPath(); g.arc(0, end - len * 0.03, w * 0.22, 0, TAU); g.fillStyle = '#ffcc4d'; g.fill(); g.lineWidth = lw * 0.7; g.stroke();
    if (glow) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(w * 0.15, tip + len * 0.12, w * 0.12, 0, TAU); g.fill(); }
  }
  function U_rr(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function drawApple(g, r) {
    const lw = Math.max(1.5, r * 0.16);
    g.strokeStyle = OL; g.lineWidth = Math.max(2, r * 0.18) + lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -r * 0.55); g.lineTo(r * 0.1, -r * 0.98); g.stroke();
    g.strokeStyle = '#7a4a22'; g.lineWidth = Math.max(1.5, r * 0.15); g.stroke(); g.lineCap = 'butt';
    g.beginPath(); g.arc(-r * 0.3, 0, r * 0.74, 0, TAU); g.arc(r * 0.3, 0, r * 0.74, 0, TAU);
    g.fillStyle = OL; g.save(); g.lineWidth = lw * 2; g.strokeStyle = OL; g.stroke(); g.restore();
    g.fillStyle = '#ff4d5e'; g.beginPath(); g.arc(-r * 0.3, 0, r * 0.74, 0, TAU); g.arc(r * 0.3, 0, r * 0.74, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.65)'; g.beginPath(); g.ellipse(-r * 0.45, -r * 0.25, r * 0.15, r * 0.26, 0.4, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(r * 0.38, -r * 0.88, r * 0.3, r * 0.14, -0.4, 0, TAU); g.fillStyle = '#5fd17f'; g.fill(); g.lineWidth = lw * 0.8; g.strokeStyle = OL; g.stroke();
  }

  // ---------- stage generation ----------
  function adist(a, b) { let d = Math.abs(((a - b) % TAU + TAU) % TAU); return d > Math.PI ? TAU - d : d; }
  function makeStage(stage, diff, endless, rng) {
    const boss = stage % 5 === 0;
    const Le = endless ? 26 + stage * 1.6 : stage + [0, 12, 30][diff];
    const s = Math.min(5.2, [1.5, 2.1, 2.7][endless ? 2 : diff] + Math.min(1.6, Le * 0.035)) * (boss ? 1.12 : 1);
    let type;
    if (boss) type = diff === 0 && !endless ? 2 : (rng() < 0.5 ? 3 : 4);
    else if (!endless && diff === 0) type = Le < 6 ? 0 : Le < 15 ? Math.floor(rng() * 2) : Math.floor(rng() * 3);
    else if (!endless && diff === 1) type = 1 + Math.floor(rng() * 3);
    else type = 2 + Math.floor(rng() * 3);
    const dir = rng() < 0.5 ? 1 : -1;
    const j = () => 0.8 + rng() * 0.4;
    let segs;
    if (type === 0) segs = [[10, s, s]];
    else if (type === 1) segs = [[1.2 * j(), s * 0.35, s * 1.35], [1.2 * j(), s * 1.35, s * 0.35]];
    else if (type === 2) segs = [[1.6 * j(), s, s], [0.35, s, -s], [1.6 * j(), -s, -s], [0.35, -s, s]];
    else if (type === 3) segs = [[1.0 * j(), s * 1.3, s * 1.3], [0.14, s * 1.3, 0], [0.45 * j(), 0, 0], [0.14, 0, -s * 1.6], [0.8 * j(), -s * 1.6, -s * 1.6], [0.2, -s * 1.6, s]];
    else {
      segs = [];
      let v = s;
      for (let i = 0; i < 6; i++) {
        const nv = (rng() < 0.5 ? -1 : 1) * s * (0.4 + rng() * 1.4);
        segs.push([0.12 + rng() * 0.12, v, nv]);
        segs.push([0.3 + rng() * 0.9, nv, nv]);
        v = nv;
      }
      segs.push([0.15, v, s]);
    }
    // closed-form rotation: angle(t) = cycles * cycleAngle + segment start + v0 u + (v1 - v0) u² / 2d
    const sg = []; let t = 0, a = 0;
    for (const q of segs) { const d = q[0], v0 = q[1] * dir, v1 = q[2] * dir; sg.push({ t, a, d, v0, v1 }); t += d; a += (v0 + v1) * d / 2; }
    const knives = boss ? Math.min(13, [7, 9, 10][endless ? 2 : diff] + Math.floor(Le / 12))
      : Math.min(12, [4, 6, 7][endless ? 2 : diff] + Math.floor(Le / 6));
    let pre = boss ? 2 + Math.min(4, Math.floor(Le / 10)) : (Le < 3 ? 0 : Math.min(5, Math.floor(rng() * (1 + Le / 10)) + (diff === 2 || endless ? 1 : 0)));
    pre = Math.min(pre, 16 - knives);
    const stuck = [];
    const base = rng() * TAU;
    for (let i = 0; i < pre; i++) {
      for (let tries = 0; tries < 40; tries++) {
        const ang = base + (i / pre) * TAU + (rng() - 0.5) * (TAU / pre) * 0.6;
        if (stuck.every((o) => adist(o, ang) > KW * 1.8)) { stuck.push(((ang % TAU) + TAU) % TAU); break; }
      }
    }
    const apples = [];
    const na = rng() < (boss ? 0.9 : 0.55) ? (boss || rng() < 0.3 ? 2 : 1) : 0;
    for (let i = 0; i < na; i++) {
      for (let tries = 0; tries < 40; tries++) {
        const ang = rng() * TAU;
        if (stuck.every((o) => adist(o, ang) > KW * 1.2) && apples.every((o) => adist(o, ang) > 0.6)) { apples.push(ang); break; }
      }
    }
    const kind = boss ? 1 + Math.floor(stage / 5 - 1) % 4 : 0;
    const timeLimit = endless || diff === 2 ? knives * 1.25 + 3.5 : 0;
    return { boss, segs: sg, P: t, CA: a, knives, stuck, apples, kind, timeLimit, Le };
  }
  function rotAt(st, t) {
    const k = Math.floor(t / st.P), tau = t - k * st.P;
    let seg = st.segs[0];
    for (let i = st.segs.length - 1; i >= 0; i--) if (st.segs[i].t <= tau) { seg = st.segs[i]; break; }
    const u = Math.min(seg.d, tau - seg.t);
    return k * st.CA + seg.a + seg.v0 * u + (seg.v1 - seg.v0) * u * u / (2 * seg.d);
  }
  // local angle (on the target) where a knife hitting at time t lands; knives hit at the bottom (screen angle π/2)
  function landAngle(st, t) { return (((Math.PI / 2 - rotAt(st, t)) % TAU) + TAU) % TAU; }

  MG.register({
    id: 'knife', name: '擲飛刀', icon: '🔪', color: '#8a5a3c', endless: true,
    create(api) {
      const U = api.util, L = api.level, DIFF = api.diff || 0, ENDLESS = !!api.endless;
      const rng = api.rng;
      let stageNo = ENDLESS ? 1 : L;
      let st = makeStage(stageNo, DIFF, ENDLESS, rng);
      let W, H, cx, cy, R, KL, throwY, cache = null, faceCache = null, faceKind = -1, faceR = 0;
      function layout() {
        W = api.W; H = api.H;
        R = Math.max(30, Math.min(W * 0.26, H * 0.16));
        cx = W / 2; cy = Math.max(R + 70, H * 0.33);
        KL = R * 0.95;
        throwY = H - Math.max(70, H * 0.13);
        cache = null; faceCache = null;
      }
      layout();

      const S = {
        t: 0, left: st.knives, stuck: st.stuck.map((a) => ({ a, pre: true, t: 1 })), apples: st.apples.map((a) => ({ a, hit: false })),
        fly: null, over: false, clearT: -1, hitT: 0, ready: 0.25, timeLeft: st.timeLimit, score: 0, knivesTotal: 0, applesHit: 0,
        stages: 0, introT: 1, bounce: null,
      };
      const parts = []; for (let i = 0; i < 240; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 3, rot: 0, vr: 0, kind: 0 });
      const debris = [];
      let pCur = 0, anim = 0, shake = 0, lastInfo = '', banner = null, flash = 0, flashCol = '255,255,255';
      let hintT = L === 1 && DIFF === 0 && !ENDLESS ? 5 : 0;
      if (st.boss) banner = { text: '⚔ 頭目登場！', t: 0, col: '#ff6b6b' };
      api.score(0);

      function addPart(x, y, vx, vy, life, col, size) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size;
      }
      function report() { api.score(ENDLESS ? S.knivesTotal + S.applesHit * 3 : S.knivesTotal); }

      // ---------- throwing ----------
      function canThrow() { return !S.over && !api.ended && S.clearT < 0 && !S.fly && S.left > 0 && S.ready <= 0 && S.introT <= 0.6; }
      function throwKnife() {
        if (!canThrow()) return false;
        S.fly = { t0: S.t, a: 0 };
        S.left--;
        api.sfx('shoot');
        hintT = 0;
        return true;
      }
      function land() {
        const a = landAngle(st, S.fly.t0 + FT);
        S.fly = null;
        for (const k of S.stuck) {
          if (adist(k.a, a) < KW) { fail(); return; }
        }
        S.stuck.push({ a, pre: false, t: 0 });
        S.knivesTotal++;
        S.hitT = 1; S.ready = 0.07;
        api.sfx('hit');
        shake = Math.max(shake, 2.5);
        for (let i = 0; i < 7; i++) addPart(cx + (Math.random() - 0.5) * 16, cy + R, (Math.random() - 0.5) * 220, 60 + Math.random() * 180, 0.5, i % 2 ? '#c8935a' : '#8a5a3c', 4 + Math.random() * 3);
        for (const ap of S.apples) {
          if (ap.hit || adist(ap.a, a) > AW) continue;
          ap.hit = true; S.applesHit++;
          api.sfx('good');
          const rot = rotAt(st, S.t), wa = ap.a + rot;
          const px = cx + Math.cos(wa) * (R + R * 0.14), py = cy + Math.sin(wa) * (R + R * 0.14);
          debris.push({ x: px - 6, y: py, vx: -150, vy: -240, r: 0, vr: -6, kind: 'apple', t: 0 });
          debris.push({ x: px + 6, y: py, vx: 150, vy: -240, r: 0, vr: 6, kind: 'apple', t: 0 });
          banner = { text: '🍎 +3', t: 0.2, col: '#ff8a8a' };
        }
        report();
        if (S.left === 0) clearStage();
      }
      function fail() {
        S.over = true; shake = 16; flash = 0.5; flashCol = '255,60,80';
        api.sfx('bad');
        S.bounce = { x: cx, y: cy + R + KL * 0.5, vx: (Math.random() < 0.5 ? -1 : 1) * 260, vy: 380, r: 0, vr: 14 };
        banner = { text: '鏘！', t: 0, col: '#ff6b6b' };
        report();
        api.lose(ENDLESS ? '撞到飛刀了！撐過 ' + S.stages + ' 關' : '飛刀撞在一起了！');
      }
      function clearStage() {
        S.clearT = 0;
        api.sfx('pop'); shake = 9; flash = 0.35; flashCol = '255,240,200';
        const rot = rotAt(st, S.t);
        for (let i = 0; i < 4; i++) {
          const a = rot + i * TAU / 4 + 0.4;
          debris.push({ x: cx, y: cy, vx: Math.cos(a) * 320, vy: Math.sin(a) * 320 - 160, r: a, vr: (Math.random() - 0.5) * 10, kind: 'chunk', t: 0, a0: a });
        }
        for (const k of S.stuck) {
          const a = k.a + rot;
          debris.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, vx: Math.cos(a) * (200 + Math.random() * 200), vy: Math.sin(a) * 260 - 200, r: a + Math.PI / 2, vr: (Math.random() - 0.5) * 16, kind: 'knife', t: 0 });
        }
        for (let i = 0; i < 30; i++) { const a = Math.random() * TAU, v = 100 + Math.random() * 320; addPart(cx, cy, Math.cos(a) * v, Math.sin(a) * v, 0.8, i % 2 ? '#e9b97a' : '#8a5a3c', 5 + Math.random() * 5); }
        S.stages++;
        if (!ENDLESS) {
          banner = { text: st.boss ? '頭目擊破！' : '過關！', t: 0, col: '#7dffa8' };
          for (let i = 0; i < 70; i++) addPart(Math.random() * W, -10, (Math.random() - 0.5) * 200, Math.random() * 200, 2 + Math.random(), U.PALETTE[i % 9], 7);
          S.over = true;
          api.win(S.applesHit ? '還切到 ' + S.applesHit + ' 顆蘋果！' : '全部命中！');
        } else banner = { text: st.boss ? '頭目擊破！' : '第 ' + (S.stages + 1) + ' 關', t: 0, col: st.boss ? '#ffcc4d' : '#7dffa8' };
      }
      function nextStage() {
        stageNo++;
        st = makeStage(stageNo, DIFF, ENDLESS, rng);
        S.t = 0; S.left = st.knives; S.stuck = st.stuck.map((a) => ({ a, pre: true, t: 1 })); S.apples = st.apples.map((a) => ({ a, hit: false }));
        S.clearT = -1; S.introT = 1; S.timeLeft = st.timeLimit; S.ready = 0.2;
        cache = null; faceCache = null;
        if (st.boss) banner = { text: '⚔ 頭目登場！', t: 0, col: '#ff6b6b' };
      }

      // ---------- update ----------
      function update(dt) {
        anim += dt;
        shake = Math.max(0, shake - dt * 30);
        flash = Math.max(0, flash - dt * 1.5);
        S.hitT = Math.max(0, S.hitT - dt * 7);
        S.introT = Math.max(0, S.introT - dt * 2.5);
        for (const k of S.stuck) k.t = Math.min(1, k.t + dt * 10);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
          p.vy += 700 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        }
        for (let i = debris.length - 1; i >= 0; i--) {
          const d = debris[i]; d.t += dt; d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.r += d.vr * dt;
          if (d.y > H + 80 || d.t > 3) debris.splice(i, 1);
        }
        if (S.bounce) { const b = S.bounce; b.vy += 900 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.r += b.vr * dt; }
        if (banner) { banner.t += dt; if (banner.t > 1.3) banner = null; }
        hintT -= dt;
        if (api.ended || S.over) return;
        if (S.clearT >= 0) {
          S.clearT += dt;
          if (S.clearT > 0.85 && ENDLESS) nextStage();
          return;
        }
        S.t += dt;
        S.ready -= dt;
        if (S.fly && S.t - S.fly.t0 >= FT) land();
        if (st.timeLimit && !S.over && S.clearT < 0 && S.introT <= 0.6) {
          S.timeLeft -= dt;
          if (S.timeLeft <= 0) {
            S.over = true; flash = 0.5; flashCol = '255,60,80'; shake = 8;
            banner = { text: '時間到！', t: 0, col: '#ff6b6b' };
            report();
            api.lose(ENDLESS ? '時間到！撐過 ' + S.stages + ' 關' : '時間到了！');
            return;
          }
        }
        let info;
        if (ENDLESS) info = '無盡：第 ' + (S.stages + 1) + ' 關' + (st.boss ? '（頭目）' : '') + ' · 分數 ' + (S.knivesTotal + S.applesHit * 3);
        else if (L === 1 && DIFF === 0) info = '點一下丟飛刀，別碰到已插著的刀';
        else info = (st.boss ? '頭目關！' : '') + '剩 ' + S.left + ' 把飛刀' + (st.apples.length ? ' · 🍎 切中有加分' : '');
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
      }

      // ---------- drawing ----------
      function buildCache() {
        const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
        const c = document.createElement('canvas');
        c.width = Math.ceil(W * dpr); c.height = Math.ceil(H * dpr);
        const x = c.getContext('2d'); x.scale(dpr, dpr);
        drawBackground(x, W, H, cx, cy, R, st.boss);
        cache = c;
      }
      function buildFace() {
        const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
        const c = document.createElement('canvas'), sz = Math.ceil(R * 2.1 * dpr);
        c.width = sz; c.height = sz;
        const x = c.getContext('2d'); x.scale(dpr, dpr); x.translate(R * 1.05, R * 1.05);
        drawTarget(x, st.kind, R, U);
        faceCache = c; faceKind = st.kind; faceR = R;
      }
      function draw(g) {
        if (!cache) buildCache();
        if (!faceCache || faceKind !== st.kind || faceR !== R) buildFace();
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        g.drawImage(cache, 0, 0, W, H);
        const rot = rotAt(st, S.t);
        const ty = cy - S.hitT * 7;
        const sc = S.introT > 0 ? U.easeOutBack(1 - S.introT) : 1;
        if (S.clearT < 0) {
          g.save(); g.translate(cx, ty); g.scale(sc, sc); g.rotate(rot);
          // stuck knives first (their blades hide under the face)
          for (const k of S.stuck) {
            g.save(); g.rotate(k.a + Math.PI / 2);
            const push = (1 - k.t) * KL * 0.2;
            g.translate(0, -(R + KL * 0.32 + push));
            g.rotate(Math.PI);
            drawKnife(g, KL, false);
            g.restore();
          }
          for (const ap of S.apples) {
            if (ap.hit) continue;
            g.save(); g.rotate(ap.a); g.translate(R + R * 0.12, 0); g.rotate(Math.PI / 2 + Math.sin(anim * 3) * 0.06);
            drawApple(g, R * 0.15);
            g.restore();
          }
          g.drawImage(faceCache, -R * 1.05, -R * 1.05, R * 2.1, R * 2.1);
          if (S.hitT > 0) { g.fillStyle = 'rgba(255,255,255,' + S.hitT * 0.25 + ')'; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill(); }
          g.restore();
        }
        for (const d of debris) {
          g.save(); g.translate(d.x, d.y); g.rotate(d.r);
          if (d.kind === 'knife') drawKnife(g, KL * 0.9, false);
          else if (d.kind === 'apple') { g.beginPath(); g.arc(0, 0, R * 0.13, -Math.PI / 2, Math.PI / 2); g.closePath(); g.fillStyle = '#ff4d5e'; g.fill(); g.lineWidth = 2; g.strokeStyle = OL; g.stroke(); g.fillStyle = '#fff3d6'; g.fillRect(-1, -R * 0.11, 3, R * 0.22); }
          else {
            g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R * 0.9, -0.75, 0.75); g.closePath();
            g.fillStyle = st.kind === 0 ? '#f2c27e' : st.kind === 1 ? '#ffa62b' : st.kind === 2 ? '#ffd84d' : st.kind === 3 ? '#3a3a46' : '#e0384c'; g.fill();
            g.strokeStyle = OL; g.lineWidth = 3; g.lineJoin = 'round'; g.stroke();
          }
          g.restore();
        }
        // flying / ready knife
        if (S.fly) {
          const k = Math.min(1, (S.t - S.fly.t0) / FT);
          const y = U.lerp(throwY, cy + R + KL * 0.5 - KL * 0.18, k);
          g.save(); g.translate(cx, y); drawKnife(g, KL, true); g.restore();
          g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(cx - 2, y + KL * 0.5, 4, (throwY - y) * 0.6);
        } else if (!S.over && S.left > 0 && S.clearT < 0) {
          const k = U.clamp(1 - S.ready / 0.07, 0, 1);
          g.save(); g.translate(cx, throwY + (1 - k) * 30); drawKnife(g, KL, true); g.restore();
        }
        if (S.bounce) { const b = S.bounce; g.save(); g.translate(b.x, b.y); g.rotate(b.r); drawKnife(g, KL, false); g.restore(); }
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.6); g.fillStyle = p.col;
          g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        g.globalAlpha = 1;
        g.restore();
        if (flash > 0) { g.fillStyle = 'rgba(' + flashCol + ',' + Math.min(0.6, flash) + ')'; g.fillRect(0, 0, W, H); }
        drawHud(g);
      }
      function drawHud(g) {
        // knives left (bottom-left column)
        const total = st.knives, ks = Math.min(22, (H * 0.3) / total);
        for (let i = 0; i < total; i++) {
          const y = H - 26 - i * ks;
          g.save(); g.translate(26, y); g.rotate(0);
          g.globalAlpha = i < S.left ? 1 : 0.22;
          drawKnife(g, ks * 1.15, false);
          g.restore();
        }
        g.globalAlpha = 1;
        // stage dots (5 per group, last = boss)
        const s0 = Math.floor((stageNo - 1) / 5) * 5;
        for (let i = 0; i < 5; i++) {
          const n = s0 + i + 1, x = W / 2 + (i - 2) * 22, y = 22;
          const done = n < stageNo || (n === stageNo && S.clearT >= 0);
          const col = n === stageNo ? '#ffffff' : done ? '#ffcc4d' : 'rgba(255,255,255,0.35)';
          if (i === 4) U_otext(g, '☠', x, y, 17, n === stageNo ? '#ff6b6b' : done ? '#ffcc4d' : '#d98a8a', 3);
          else { g.beginPath(); g.arc(x, y, n === stageNo ? 7 : 5.5, 0, TAU); g.fillStyle = col; g.fill(); g.lineWidth = 2; g.strokeStyle = OL; g.stroke(); }
        }
        if (ENDLESS) {
          U_otext(g, '分數 ' + (S.knivesTotal + S.applesHit * 3), 14, 22, 16, '#ffffff', 4, 'left');
          U_otext(g, '最高 ' + Math.max(api.best || 0, S.knivesTotal + S.applesHit * 3), W - 14, 22, 14, '#ffe27a', 4, 'right');
        } else {
          U_otext(g, '🔪 ' + S.left, 14, 22, 16, '#ffffff', 4, 'left');
          if (S.applesHit) U_otext(g, '🍎 ' + S.applesHit, W - 14, 22, 15, '#ff8a8a', 4, 'right');
        }
        if (st.timeLimit && !S.over && S.clearT < 0) {
          const k = U.clamp(S.timeLeft / st.timeLimit, 0, 1), bw = W * 0.5, bx = (W - bw) / 2, by = 39;
          g.fillStyle = 'rgba(42,26,20,0.5)'; U.rr(g, bx, by, bw, 10, 5); g.fill();
          g.fillStyle = k < 0.25 ? (Math.sin(anim * 16) > 0 ? '#ff2d45' : '#ffcc4d') : '#7dffa8';
          U.rr(g, bx, by, Math.max(10, bw * k), 10, 5); g.fill();
          g.lineWidth = 2; g.strokeStyle = OL; U.rr(g, bx, by, bw, 10, 5); g.stroke();
        }
        if (banner) {
          const k = Math.min(1, banner.t / 0.3);
          g.globalAlpha = banner.t > 1 ? Math.max(0, 1 - (banner.t - 1) / 0.3) : 1;
          const sz = Math.min(40, W / 9) * U.easeOutBack(k);
          g.font = '900 ' + sz + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 7; g.strokeStyle = OL; g.lineJoin = 'round';
          const by = cy + R + (throwY - cy - R) * 0.42;
          g.strokeText(banner.text, W / 2, by); g.fillStyle = banner.col; g.fillText(banner.text, W / 2, by);
          g.globalAlpha = 1;
        }
        if (hintT > 0 && !S.fly) {
          g.globalAlpha = Math.min(1, hintT) * (0.6 + 0.4 * Math.sin(anim * 6));
          U_otext(g, '👆 點一下丟出去', W / 2, throwY - KL * 0.9, 19, '#ffffff', 4);
          g.globalAlpha = 1;
        }
      }

      function down() {
        if (api.ended || S.over) return;
        if (!throwKnife() && !S.fly) api.sfx('tap');
      }

      return {
        update, draw, down,
        resize() { layout(); },
        _s: S, get _st() { return st; },
        _k: { rotAt, landAngle, adist, KW, AW, FT, canThrow, makeStage },
      };
    },
  });
})();
