// 倍增彈珠 — Multiply balls: open the hoppers at the right moment so the balls rain through ×N gates.
(function () {
  'use strict';

  // ---------- world constants (world = 300 x 540, scaled to fit) ----------
  const WW = 300, WH = 540;
  const BR = 4.4;                 // ball radius
  const WALL_R = 3;               // half thickness of walls
  const HSTEP = 1 / 120;          // fixed physics step
  const GRAV = 640;               // px/s^2
  const VMAX = 400 * HSTEP;       // per-step displacement cap
  const VMAX2 = VMAX * VMAX;
  const PERIOD = 6;               // every moving thing repeats every PERIOD seconds
  const EMIT = 9 / 120;           // one ball every 0.075 s from an open hopper
  const NS = Math.round(PERIOD / EMIT);   // 80 phase samples
  const FY = 424, BY = 482, BOT = 532;    // funnel top, basket rim, basket bottom
  const NOZ_Y = 103;
  const BH = 26;                  // block height (chunky gates)
  const CAP = 800, GHOST_CAP = 12;
  const HOLE_R = 46, HOLE_CORE = 9, HOLE_PULL = 2600;
  const BAND = 20, NBND = Math.ceil((WH + 60) / BAND);
  const COLORS = ['#ff4f7b', '#ffb21e', '#3ad07a', '#4c9bff', '#b45cff', '#ff7a2f', '#2fd6d6'];

  const KIND = {
    m2: { op: 'mul', n: 2, label: '×2', c1: '#5fe08f', c2: '#1f9e55' },
    m3: { op: 'mul', n: 3, label: '×3', c1: '#47dcd6', c2: '#158a96' },
    m5: { op: 'mul', n: 5, label: '×5', c1: '#6fb2ff', c2: '#2a5fd0' },
    m10: { op: 'mul', n: 10, label: '×10', c1: '#c784ff', c2: '#7a2fd0' },
    m20: { op: 'mul', n: 20, label: '×20', c1: '#ffe066', c2: '#ff8a00' },
    d2: { op: 'div', n: 2, label: '÷2', c1: '#ff7b86', c2: '#c8283b' },
    k0: { op: 'kill', n: 0, label: '×0', c1: '#5b5f78', c2: '#1f2135' },
  };

  // ---------- drawing helpers (卡通 Q 版: thick dark outlines, flat fills, gloss strips) ----------
  const OL = '#2a1a14';
  function olStroke(g, lw) { g.lineWidth = lw; g.strokeStyle = OL; g.lineJoin = 'round'; g.stroke(); }
  function otext(g, str, x, y, size, color, align) {
    g.font = '900 ' + size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
    g.textAlign = align || 'center'; g.textBaseline = 'middle';
    g.lineWidth = Math.max(2, size * 0.24); g.strokeStyle = OL; g.lineJoin = 'round';
    g.strokeText(str, x, y); g.fillStyle = color; g.fillText(str, x, y);
  }
  const spriteCache = {};
  function ballSprite(col) {
    if (spriteCache[col] !== undefined) return spriteCache[col];
    let cv = null;
    try {
      cv = document.createElement('canvas'); cv.width = 28; cv.height = 28;
      const g = cv.getContext('2d');
      const c = 14, r = 11.5;
      g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.fillStyle = col; g.fill();
      g.save(); g.clip();
      g.globalAlpha = 0.5; g.fillStyle = MG.util.shade(col, -0.32);
      g.beginPath(); g.arc(c + 4, c + 5, r, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      g.fillStyle = col; g.beginPath(); g.arc(c - 1.5, c - 1.5, r * 0.78, 0, Math.PI * 2); g.fill();
      g.restore();
      g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.lineWidth = 3.4; g.strokeStyle = OL; g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.9)';
      g.beginPath(); g.ellipse(c - 4, c - 4.5, 3.4, 2.1, -0.6, 0, Math.PI * 2); g.fill();
    } catch (e) { cv = null; }
    spriteCache[col] = cv;
    return cv;
  }

  // carnival night backdrop: cached sky + tents + bunting; live spotlight beams and twinkles on top
  let bgCv = null, bgW = 0, bgH = 0;
  function paintBackground(g, W, H) {
    let gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#2c1a5e'); gr.addColorStop(0.5, '#6a2c9e'); gr.addColorStop(0.85, '#d2488a'); gr.addColorStop(1, '#ff8a6a');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // carnival tents + ferris wheel silhouettes along the bottom
    const base = H * 0.9;
    const tent = (cx, w, h, c1, c2) => {
      g.save();
      g.beginPath(); g.moveTo(cx - w / 2, base); g.lineTo(cx - w / 2, base - h * 0.45); g.quadraticCurveTo(cx - w * 0.2, base - h * 0.6, cx, base - h); g.quadraticCurveTo(cx + w * 0.2, base - h * 0.6, cx + w / 2, base - h * 0.45); g.lineTo(cx + w / 2, base); g.closePath();
      g.fillStyle = c1; g.fill();
      g.clip();
      g.fillStyle = c2;
      for (let k = -4; k < 5; k += 2) { g.beginPath(); g.moveTo(cx, base - h); g.lineTo(cx + k * w / 8, base); g.lineTo(cx + (k + 1) * w / 8, base); g.closePath(); g.fill(); }
      g.restore();
      g.beginPath(); g.moveTo(cx - w / 2, base); g.lineTo(cx - w / 2, base - h * 0.45); g.quadraticCurveTo(cx - w * 0.2, base - h * 0.6, cx, base - h); g.quadraticCurveTo(cx + w * 0.2, base - h * 0.6, cx + w / 2, base - h * 0.45); g.lineTo(cx + w / 2, base);
      olStroke(g, 2.5);
      g.beginPath(); g.moveTo(cx, base - h); g.lineTo(cx, base - h - 12); olStroke(g, 2);
      g.beginPath(); g.moveTo(cx, base - h - 12); g.lineTo(cx + 10, base - h - 8); g.lineTo(cx, base - h - 5); g.closePath(); g.fillStyle = '#ffd34d'; g.fill(); olStroke(g, 1.5);
    };
    // ferris wheel
    const fx = W * 0.8, fy = base - 70, fr = 52;
    g.strokeStyle = 'rgba(42,26,20,0.75)'; g.lineWidth = 3;
    g.beginPath(); g.arc(fx, fy, fr, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1.5;
    g.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.moveTo(fx, fy); g.lineTo(fx + Math.cos(a) * fr, fy + Math.sin(a) * fr); } g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(fx - 30, base); g.lineTo(fx, fy); g.lineTo(fx + 30, base); g.stroke();
    const cabC = ['#ff6b8a', '#ffd34d', '#4cc3ff', '#8be06b'];
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4;
      U_rr(g, fx + Math.cos(a) * fr - 6, fy + Math.sin(a) * fr - 2, 12, 10, 3); g.fillStyle = cabC[k % 4]; g.fill(); olStroke(g, 1.8);
    }
    tent(W * 0.18, 96, 82, '#ff5a6e', '#fff3e0');
    tent(W * 0.48, 70, 60, '#4c9bff', '#fff3e0');
    // ground strip
    g.fillStyle = '#5a2a6e'; g.fillRect(0, base, W, H - base);
    g.fillStyle = OL; g.fillRect(0, base - 1.5, W, 3);
    // bunting across the top
    const cols = ['#ff5a6e', '#ffd34d', '#4cc3ff', '#8be06b', '#b98cff'];
    g.strokeStyle = OL; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(0, 8); g.quadraticCurveTo(W / 2, 30, W, 8); g.stroke();
    for (let i = 0, x = 8; x < W; x += 22, i++) {
      const t = x / W, y = 8 + 4 * t * (1 - t) * 22;
      g.beginPath(); g.moveTo(x - 7, y); g.lineTo(x + 7, y); g.lineTo(x, y + 13); g.closePath();
      g.fillStyle = cols[i % cols.length]; g.fill(); olStroke(g, 1.5);
    }
    // depth wash
    g.fillStyle = 'rgba(40,16,80,0.28)'; g.fillRect(0, 0, W, H);
  }
  function U_rr(g, x, y, w, h, r) { MG.util.rr(g, x, y, w, h, r); }
  function drawBackground(g, W, H, time) {
    if (!bgCv || bgW !== W || bgH !== H) {
      bgW = W; bgH = H;
      const dpr = Math.min(3, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
      try { bgCv = document.createElement('canvas'); bgCv.width = Math.round(W * dpr); bgCv.height = Math.round(H * dpr); } catch (e) { bgCv = null; }
      if (bgCv && bgCv.getContext) { const c2 = bgCv.getContext('2d'); c2.setTransform(dpr, 0, 0, dpr, 0, 0); paintBackground(c2, W, H); }
    }
    if (bgCv && bgCv.getContext) g.drawImage(bgCv, 0, 0, W, H); else paintBackground(g, W, H);
    // sweeping spotlight beams
    for (let i = 0; i < 2; i++) {
      const bx = i ? W * 0.85 : W * 0.15, a = Math.sin(time * 0.6 + i * 2.2) * 0.45 + (i ? -0.25 : 0.25);
      g.save(); g.translate(bx, H); g.rotate(a);
      g.fillStyle = i ? 'rgba(255,220,120,0.07)' : 'rgba(140,220,255,0.07)';
      g.beginPath(); g.moveTo(-8, 0); g.lineTo(-70, -H * 1.1); g.lineTo(70, -H * 1.1); g.lineTo(8, 0); g.closePath(); g.fill();
      g.restore();
    }
    // twinkling stars
    for (let i = 0; i < 14; i++) {
      const x = ((i * 97 + 31) % 100) / 100 * W, y = ((i * 57 + 13) % 100) / 100 * H * 0.75;
      const tw = 0.5 + 0.5 * Math.sin(time * 2.5 + i * 1.7);
      const s = 2 + (i % 3) + tw * 1.5;
      g.fillStyle = 'rgba(255,245,200,' + (0.35 + tw * 0.5).toFixed(3) + ')';
      g.beginPath(); g.moveTo(x, y - s * 1.6); g.lineTo(x + s * 0.4, y - s * 0.4); g.lineTo(x + s * 1.6, y); g.lineTo(x + s * 0.4, y + s * 0.4);
      g.lineTo(x, y + s * 1.6); g.lineTo(x - s * 0.4, y + s * 0.4); g.lineTo(x - s * 1.6, y); g.lineTo(x - s * 0.4, y - s * 0.4); g.closePath(); g.fill();
    }
  }

  function drawBlock(g, U, b, x, cnt, flash, time) {
    // chunky outlined gate block: darker 3D lip, flat top colour, white gloss strip, bold stroked label
    const k = KIND[b.kind];
    const w = b.w, h = BH, rad = 10;
    const s = 1 + flash * 0.12;
    g.save(); g.translate(x, b.y + h / 2); g.scale(s, s);
    // glow for the big ones
    if (b.kind === 'm20' || b.kind === 'm10') {
      const p = 0.5 + 0.5 * Math.sin(time * 4 + x * 0.05);
      g.fillStyle = b.kind === 'm20' ? 'rgba(255,215,60,' + (0.25 + p * 0.2 + flash * 0.3) + ')' : 'rgba(200,130,255,' + (0.18 + p * 0.14 + flash * 0.3) + ')';
      U.rr(g, -w / 2 - 7, -h / 2 - 7, w + 14, h + 14, rad + 7); g.fill();
    }
    g.fillStyle = 'rgba(0,0,0,0.3)'; U.rr(g, -w / 2 + 2, -h / 2 + 7, w, h, rad); g.fill();
    U.rr(g, -w / 2, -h / 2 + 4, w, h, rad); g.fillStyle = MG.util.shade(k.c2, -0.2); g.fill(); olStroke(g, 2.6);
    U.rr(g, -w / 2, -h / 2, w, h, rad); g.fillStyle = k.c1; g.fill();
    g.save(); U.rr(g, -w / 2, -h / 2, w, h, rad); g.clip();
    g.fillStyle = k.c2; g.globalAlpha = 0.45; g.fillRect(-w / 2, h * 0.18, w, h); g.globalAlpha = 1;
    if (b.kind === 'm20' || b.kind === 'm10') {
      const sx = ((time * 0.8) % 1.8 - 0.4) * w - w / 2;
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.beginPath(); g.moveTo(sx, -h / 2); g.lineTo(sx + 12, -h / 2); g.lineTo(sx + 2, h / 2); g.lineTo(sx - 10, h / 2); g.closePath(); g.fill();
    }
    g.restore();
    U.rr(g, -w / 2, -h / 2, w, h, rad); olStroke(g, 2.6);
    g.fillStyle = 'rgba(255,255,255,0.5)'; U.rr(g, -w / 2 + 6, -h / 2 + 3.5, w - 12, h * 0.22, 3); g.fill();
    if (b.kind === 'd2') {
      g.strokeStyle = 'rgba(60,0,10,0.7)'; g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(-w * 0.32, -h / 2); g.lineTo(-w * 0.25, -2); g.lineTo(-w * 0.33, 4); g.lineTo(-w * 0.27, h / 2);
      g.moveTo(w * 0.3, -h / 2); g.lineTo(w * 0.36, 0); g.lineTo(w * 0.29, h / 2); g.stroke();
    }
    if (flash > 0) { g.fillStyle = 'rgba(255,255,255,' + flash * 0.55 + ')'; U.rr(g, -w / 2, -h / 2, w, h, rad); g.fill(); }
    const fs = 19;
    if (b.kind === 'k0') {
      U.text(g, '💀', -w / 2 + 14, 1, 15, '#fff');
      otext(g, '×0', 7, 1, fs, '#ff5d6c');
    } else {
      otext(g, k.label, 0, 1, fs, b.kind === 'm20' ? '#fff7c2' : '#ffffff');
    }
    g.restore();
  }

  function drawHole(g, x, y, time) {
    const gr = g.createRadialGradient(x, y, 2, x, y, HOLE_R);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.2, 'rgba(20,0,40,0.95)');
    gr.addColorStop(0.5, 'rgba(110,40,200,0.35)'); gr.addColorStop(1, 'rgba(110,40,200,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, HOLE_R, 0, Math.PI * 2); g.fill();
    g.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const a = -time * 3 + i * 2.094;
      g.strokeStyle = OL; g.lineWidth = 4;
      g.beginPath(); g.arc(x, y, 14 + i * 5, a, a + 1.6); g.stroke();
      g.strokeStyle = ['#ff7ae0', '#c58bff', '#7d8bff'][i]; g.lineWidth = 2;
      g.beginPath(); g.arc(x, y, 14 + i * 5, a, a + 1.6); g.stroke();
    }
    g.fillStyle = '#120420'; g.beginPath(); g.arc(x, y, HOLE_CORE, 0, Math.PI * 2); g.fill();
    g.lineWidth = 2.5; g.strokeStyle = '#ff7ae0'; g.stroke();
    g.lineWidth = 1.2; g.strokeStyle = OL; g.beginPath(); g.arc(x, y, HOLE_CORE + 1.8, 0, Math.PI * 2); g.stroke();
  }

  function drawPaddle(g, ax, ay, bx, by, cx, cy) {
    g.lineCap = 'round';
    g.strokeStyle = OL; g.lineWidth = 9.5;
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
    g.strokeStyle = '#ffa53c'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(ax, ay - 1.2); g.lineTo(bx, by - 1.2); g.stroke();
    g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(cx, cy, 4.2, 0, Math.PI * 2); g.fill(); olStroke(g, 1.6);
    g.fillStyle = '#c0661c'; g.beginPath(); g.arc(cx, cy, 1.8, 0, Math.PI * 2); g.fill();
  }

  function drawHopper(g, U, h, jw, time, hint) {
    // cartoon candy jar: outlined glass, coloured lid with a cute face, golden gate
    const x = h.x, top = 24, bot = 84;
    const bounce = h.bounce > 0 ? Math.sin(h.bounce * 18) * h.bounce * 3 : 0;
    g.save(); g.translate(x, 0);
    g.translate(0, bounce);
    g.fillStyle = 'rgba(0,0,0,0.2)'; U.rr(g, -jw / 2 + 2, top + 5, jw, bot - top, 12); g.fill();
    const jarPath = () => {
      g.beginPath();
      g.moveTo(-jw / 2, top + 10); g.lineTo(-jw / 2, bot); g.lineTo(-8, bot + 12); g.lineTo(-8, 98);
      g.lineTo(8, 98); g.lineTo(8, bot + 12); g.lineTo(jw / 2, bot); g.lineTo(jw / 2, top + 10);
      g.quadraticCurveTo(jw / 2, top, jw / 2 - 10, top); g.lineTo(-jw / 2 + 10, top); g.quadraticCurveTo(-jw / 2, top, -jw / 2, top + 10);
      g.closePath();
    };
    jarPath(); g.fillStyle = 'rgba(225,240,255,0.32)'; g.fill();
    // balls inside
    const sp = ballSprite(h.col);
    const per = Math.max(3, Math.floor((jw - 8) / (BR * 2 + 1.2)));
    const dx = BR * 2 + 1.2;
    for (let k = 0; k < h.left; k++) {
      const row = Math.floor(k / per), col = k % per;
      const off = (row & 1) ? dx / 2 : 0;
      const bx = -((per - 1) * dx) / 2 + col * dx + off - ((row & 1) ? dx / 4 : 0);
      const by = bot - 2 - BR - row * (BR * 1.8);
      if (by < top + 4) break;
      if (sp) g.drawImage(sp, bx - BR * 1.1, by - BR * 1.1, BR * 2.2, BR * 2.2);
    }
    jarPath();
    if (h.open) { g.strokeStyle = 'rgba(255,246,176,0.9)'; g.lineWidth = 6; g.lineJoin = 'round'; g.stroke(); }
    olStroke(g, 2.6);
    g.fillStyle = 'rgba(255,255,255,0.55)'; U.rr(g, -jw / 2 + 5, top + 8, 4, bot - top - 16, 2); g.fill();
    // lid in the jar colour
    U.rr(g, -jw / 2 + 4, top - 6, jw - 8, 10, 5); g.fillStyle = h.col; g.fill(); olStroke(g, 2.2);
    U.rr(g, -jw / 2 + 8, top - 4.5, jw - 16, 3, 1.5); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fill();
    // gate
    const gx = h.gate * 22;
    g.lineCap = 'round';
    g.strokeStyle = OL; g.lineWidth = 8.5;
    g.beginPath(); g.moveTo(-12 + gx, 99); g.lineTo(12 + gx, 99); g.stroke();
    g.strokeStyle = '#ffd34d'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(-12 + gx, 99); g.lineTo(12 + gx, 99); g.stroke();
    g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(14 + gx, 99, 4.8, 0, Math.PI * 2); g.fill(); olStroke(g, 1.8);
    // count badge
    U.rr(g, -16, top - 9, 32, 16, 8);
    g.fillStyle = h.left > 0 ? '#3a2466' : '#6e6680'; g.fill(); olStroke(g, 2);
    otext(g, String(h.left), 0, top - 0.5, 11, '#ffffff');
    if (h.locked && h.left > 0) U.text(g, '⏱', jw / 2 - 6, top + 8, 9, '#fff');
    g.restore();
    if (hint) {
      const t = (time * 1.4) % 1;
      g.strokeStyle = 'rgba(255,240,120,' + (1 - t) + ')'; g.lineWidth = 2.5;
      g.beginPath(); g.arc(x, 60, 16 + t * 20, 0, Math.PI * 2); g.stroke();
      U.text(g, '👆', x + 10, 78 + Math.sin(time * 6) * 3, 20, '#fff');
    }
  }

  function drawBasket(g, U, L, shown, target, bounce, time, reached, rolling) {
    // chunky outlined prize bucket with a stroked counter
    const x0 = L.bx0 - 4, x1 = L.bx1 + 4, y0 = BY - 2, y1 = BOT;
    const inset = 10;
    const body = () => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.lineTo(x1 - inset, y1); g.lineTo(x0 + inset, y1); g.closePath(); };
    g.save();
    g.fillStyle = 'rgba(0,0,0,0.28)';
    g.beginPath(); g.moveTo(x0 + 2, y0 + 5); g.lineTo(x1 + 2, y0 + 5); g.lineTo(x1 - inset + 2, y1 + 5); g.lineTo(x0 + inset + 2, y1 + 5); g.closePath(); g.fill();
    body(); g.fillStyle = reached ? '#4fd685' : '#ffb93a'; g.fill();
    g.save(); body(); g.clip();
    g.fillStyle = reached ? '#2aa85e' : '#ec8a1e'; g.fillRect(x0, y0 + (y1 - y0) * 0.55, x1 - x0, y1 - y0);
    // stripes
    g.fillStyle = 'rgba(255,255,255,0.18)';
    for (let i = 0; i < 6; i++) { const xx = x0 + (x1 - x0) * (i + 0.25) / 6; g.beginPath(); g.moveTo(xx, y0); g.lineTo(xx + 10, y0); g.lineTo(xx + 10 + (150 - xx) * 0.07, y1); g.lineTo(xx + (150 - xx) * 0.07, y1); g.closePath(); g.fill(); }
    // fill level
    const p = target > 0 ? Math.min(1, shown / target) : 0;
    if (p > 0) {
      const fy = y1 - (y1 - y0 - 4) * p;
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.beginPath(); g.moveTo(x0 - 5, y1 + 2);
      for (let xx = x0 - 5; xx <= x1 + 5; xx += 8) g.lineTo(xx, fy + Math.sin(xx * 0.12 + time * 5) * 1.8);
      g.lineTo(x1 + 5, y1 + 2); g.closePath(); g.fill();
    }
    g.restore();
    body(); olStroke(g, 3);
    // rim
    U.rr(g, x0 - 4, y0 - 4, x1 - x0 + 8, 8, 4); g.fillStyle = reached ? '#8af0b0' : '#ffe08a'; g.fill(); olStroke(g, 2.4);
    g.fillStyle = 'rgba(255,255,255,0.6)'; U.rr(g, x0, y0 - 2.5, x1 - x0, 2.2, 1); g.fill();
    const cx = (L.bx0 + L.bx1) / 2, s = 1 + bounce * 0.15 + rolling * 0.35;
    g.translate(cx, (y0 + y1) / 2 - 2 - rolling * 10); g.scale(s, s);
    const txt = String(Math.floor(shown));
    const fs = txt.length > 5 ? 24 : 30;
    otext(g, txt, 0, 0, fs, rolling > 0.3 ? '#fff6a0' : '#ffffff');
    g.restore();
    otext(g, '目標 ' + (target || '…'), cx, y1 + 4, 9.5, '#ffffff');
  }

  // ---------- level generation ----------
  function tierOf(diff, lv) { return diff === 0 ? lv : diff === 1 ? 12 + lv * 1.3 : 30 + lv * 1.6; }

  function genLevel(rng, diff, lv, stage) {
    const t = stage ? 32 + stage * 2.4 : tierOf(diff, lv);
    const R = (a, b) => a + rng() * (b - a);
    const RI = (a, b) => Math.floor(a + rng() * (b - a + 1));
    const pick = (arr) => arr[Math.floor(rng() * arr.length)];
    const L = { t, blocks: [], pegs: [], walls: [], paddles: [], holes: [], hoppers: [], rails: [], drains: [], vees: [] };
    const nh = t < 3 ? 2 : t < 10 ? RI(2, 3) : t < 26 ? 3 : RI(3, 4);
    const cols = COLORS.slice();
    for (let i = cols.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const q = cols[i]; cols[i] = cols[j]; cols[j] = q; }
    for (let i = 0; i < nh; i++) {
      const n = Math.max(5, Math.round(14 - t / 7 + R(-1.5, 1.5)));
      L.hoppers.push({ x: (i + 0.5) * WW / nh, n, col: i });
    }
    L.colors = cols;
    L.jw = Math.min(64, WW / nh - 14);
    const nr = t < 3 ? 2 : t < 12 ? 3 : t < 30 ? 4 : (t > 40 && rng() < 0.5) ? 5 : 4;
    const y0 = nr === 2 ? 175 : 150, y1 = nr === 2 ? 320 : 382;
    const rowsY = [];
    for (let r = 0; r < nr; r++) rowsY.push(Math.round(y0 + (y1 - y0) * r / (nr - 1)));
    // at most one ×20 and two big gates per level: stacked jackpots make the outcome a lottery
    let n20 = 0, nBig = 0;
    const bigGood = () => {
      let k = t < 3 ? 'm5' : t < 8 ? pick(['m5', 'm10']) : t < 20 ? pick(['m10', 'm10', 'm5']) : pick(['m10', 'm20', 'm20']);
      if (k === 'm20' && n20 >= 1) k = 'm10';
      if (k !== 'm5' && nBig >= 2) k = 'm5';
      if (k === 'm20') n20++;
      if (k !== 'm5') nBig++;
      return k;
    };
    const smallGood = () => (t < 5 ? 'm2' : pick(['m2', 'm3', 'm3']));
    const speedK = () => (t < 6 ? 1 : t < 22 ? pick([1, 1, 2]) : t < 40 ? pick([1, 2, 2]) : pick([2, 2, 3]));
    const addBlock = (kind, x, y, w, mv) => {
      const b = { kind, x, y, w, mv: mv || null };
      L.blocks.push(b);
      if (mv) L.rails.push([mv.xa - w / 2 + 4, mv.xb + w / 2 - 4, y + BH / 2]);
      return b;
    };
    const mover = (kind, y, w, k, dw) => {
      const xa = 12 + w / 2, xb = WW - 12 - w / 2;
      return addBlock(kind, (xa + xb) / 2, y, w, { xa, xb, per: PERIOD / k, ph: rng(), dw });
    };
    const statics = (y, count, kinds) => {
      const slot = WW / count;
      for (let i = 0; i < count; i++) {
        const w = R(52, 64);
        const x = slot * (i + 0.5) + R(-slot * 0.18, slot * 0.18);
        addBlock(kinds[i], Math.max(12 + w / 2, Math.min(WW - 12 - w / 2, x)), y, w, null);
      }
    };
    // row plan: at least one mover; more movers + traps with tier
    const plan = [];
    plan.push('mover');
    if (t >= 8) plan.push(rng() < 0.5 ? 'mover' : 'statics');
    if (t >= 12) plan.push('trap');
    while (plan.length < nr) plan.push(plan.length % 2 ? 'statics' : 'mover');
    while (plan.length > nr) plan.pop();
    for (let i = plan.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const q = plan[i]; plan[i] = plan[j]; plan[j] = q; }
    const moverW = () => (t < 4 ? 86 : t < 15 ? R(72, 82) : t < 35 ? R(62, 72) : R(54, 64));
    for (let r = 0; r < nr; r++) {
      const y = rowsY[r], p = plan[r];
      if (p === 'mover') {
        mover(bigGood(), y, moverW(), speedK(), t < 10 ? R(0.2, 0.4) : rng() < 0.5 ? R(0.1, 0.35) : 0);
      } else if (p === 'statics') {
        const count = t < 3 ? 2 : RI(2, 3);
        const kinds = [];
        for (let i = 0; i < count; i++) kinds.push(smallGood());
        if (t >= 10 && rng() < 0.45) kinds[RI(0, count - 1)] = 'd2';
        else if (t >= 16 && rng() < 0.4) kinds[RI(0, count - 1)] = 'k0';
        statics(y, count, kinds);
      } else {
        const bad = t >= 16 && rng() < 0.5 ? 'k0' : 'd2';
        const w = R(56, 70);
        mover(bad, y, w, pick([1, 2]), rng() < 0.5 ? R(0.1, 0.3) : 0);
        if (rng() < 0.6) {
          const gw = R(48, 56);
          addBlock(pick(['m3', 'm5']), rng() < 0.5 ? 12 + gw / 2 : WW - 12 - gw / 2, y, gw, null);
        }
      }
    }
    // chaos items in the gaps between rows (one per gap)
    const gaps = [];
    for (let r = 0; r < nr - 1; r++) gaps.push([rowsY[r] + BH, rowsY[r + 1]]);
    gaps.push([rowsY[nr - 1] + BH, FY - 6]);
    let holes = t >= 22 ? (t > 44 ? 2 : (rng() < 0.6 ? 1 : 0)) : 0;
    for (let gi = 0; gi < gaps.length; gi++) {
      const a = gaps[gi][0], b = gaps[gi][1], mid = (a + b) / 2, room = b - a;
      const roll = rng();
      if (holes > 0 && gi < gaps.length - 1 && room > 50 && roll < 0.7) {
        holes--;
        const hx = R(70, 230);
        const mv = t >= 30 && rng() < 0.6 ? { xa: 60, xb: 240, per: PERIOD / pick([1, 2]), ph: rng(), dw: R(0, 0.3) } : null;
        L.holes.push({ x: hx, y: mid, mv });
        continue;
      }
      if (t >= 8 && roll < 0.35 && room > 46) {
        const len = Math.min(48, room - 10);
        L.paddles.push({ cx: R(60, 240), cy: mid, len, w: (2 * Math.PI * pick([1, 2])) / PERIOD * (rng() < 0.5 ? -1 : 1), a0: rng() * Math.PI });
        continue;
      }
      if (t >= 6 && roll < 0.55 && room > 40) {
        const vx = R(70, 230), vw = R(24, 34);
        L.walls.push([vx - vw - 14, mid - 12, vx - vw / 2 + 2, mid + 6], [vx + vw + 14, mid - 12, vx + vw / 2 - 2, mid + 6]);
        L.vees.push(L.walls.length - 2, L.walls.length - 1);
        continue;
      }
      if (t >= 2) {
        // staggered peg field across the gap
        const rowsP = room > 44 ? 2 : 1, n = RI(5, 7);
        for (let pr = 0; pr < rowsP; pr++) {
          const py = rowsP === 1 ? mid : mid + (pr ? 1 : -1) * room * 0.2, off = (pr + (rng() < 0.5 ? 0 : 1)) % 2 ? 0.5 : 0;
          for (let k = 0; k < n; k++) if (rng() < 0.8) L.pegs.push([WW * (k + 0.5 + off) / (n + 0.5) + R(-4, 4), py + R(-3, 3), 3.5]);
        }
      }
    }
    if (t >= 2) {
      const n = RI(3, 5);
      for (let k = 0; k < n; k++) L.pegs.push([R(24, 276), R(120, rowsY[0] - 12), 3.5]);
    }
    // walls, funnel, basket, drains
    const bw = 120;
    L.bx0 = WW / 2 - bw / 2; L.bx1 = WW / 2 + bw / 2;
    L.walls.push([0, 0, 0, FY], [WW, 0, WW, FY]);
    const drainL = t >= 26 && rng() < 0.55, drainR = t >= 40 ? rng() < 0.8 : (t >= 26 && !drainL && rng() < 0.5);
    const funnel = (sx, ex, drain) => {
      const P = (u) => [sx + (ex - sx) * u, FY + (BY - FY) * u];
      if (!drain) { const a = P(0), b = P(1); L.walls.push([a[0], a[1], b[0], b[1]]); return; }
      const u0 = R(0.25, 0.4), u1 = u0 + 0.3;
      const a = P(0), b = P(u0), c = P(u1), d = P(1);
      L.walls.push([a[0], a[1], b[0], b[1]], [c[0], c[1], d[0], d[1]]);
      L.drains.push([b[0], b[1], c[0], c[1]]);
    };
    funnel(0, L.bx0, drainL);
    funnel(WW, L.bx1, drainR);
    L.walls.push([L.bx0, BY, L.bx0, BY + 40], [L.bx1, BY, L.bx1, BY + 40]);
    L.timer = stage ? 14 : diff === 0 ? 0 : diff === 1 ? 24 : 14;
    L.topY = rowsY[0] - 4;
    return L;
  }

  function blockX(m, t, x) {
    if (!m) return x;
    const u = (t / m.per + m.ph) % 1;
    const d = m.dw / 2;
    let s;
    if (u < d) s = 0;
    else if (u < 0.5) { const q = (u - d) / (0.5 - d); s = q * q * (3 - 2 * q); }
    else if (u < 0.5 + d) s = 1;
    else { const q = (u - 0.5 - d) / (0.5 - d); s = 1 - q * q * (3 - 2 * q); }
    return m.xa + (m.xb - m.xa) * s;
  }

  // ---------- ball simulation (no ball-ball collisions: every ball is independent) ----------
  function makeSim(L, cap, ghost) {
    const X = new Float64Array(cap), Y = new Float64Array(cap), PX = new Float64Array(cap), PY = new Float64Array(cap);
    const WT = new Float64Array(cap), AG = new Float32Array(cap), MK = new Int32Array(cap), CO = new Uint8Array(cap);
    const nB = L.blocks.length, nP = L.paddles.length, nH = L.holes.length;
    const bx = new Float64Array(nB), bAlive = new Uint8Array(nB), bCnt = new Float64Array(nB), bTog = new Uint8Array(nB);
    const pax = new Float64Array(nP), pay = new Float64Array(nP), pbx = new Float64Array(nP), pby = new Float64Array(nP);
    const hx = new Float64Array(nH);
    const mk = () => { const a = []; for (let i = 0; i < NBND; i++) a.push([]); return a; };
    const bandSeg = mk(), bandPeg = mk(), bandBlk = mk(), bandPad = mk(), bandHole = mk();
    const addBand = (arr, ya, yb, idx) => {
      const a = Math.max(0, Math.floor(ya / BAND)), z = Math.min(NBND - 1, Math.floor(yb / BAND));
      for (let k = a; k <= z; k++) arr[k].push(idx);
    };
    L.walls.forEach((w, i) => addBand(bandSeg, Math.min(w[1], w[3]) - 10, Math.max(w[1], w[3]) + 10, i));
    L.pegs.forEach((p, i) => addBand(bandPeg, p[1] - p[2] - 8, p[1] + p[2] + 8, i));
    L.blocks.forEach((b, i) => addBand(bandBlk, b.y - 6, b.y + BH + 6, i));
    L.paddles.forEach((p, i) => addBand(bandPad, p.cy - p.len / 2 - 10, p.cy + p.len / 2 + 10, i));
    L.holes.forEach((h, i) => addBand(bandHole, h.y - HOLE_R - 4, h.y + HOLE_R + 4, i));
    const S = { n: 0, t: 0, collected: 0, lost: 0, eaten: 0, X, Y, WT, CO, bx, bAlive, bCnt, pax, pay, pbx, pby, hx, cb: null };

    function positions() {
      const t = S.t;
      for (let k = 0; k < nB; k++) bx[k] = blockX(L.blocks[k].mv, t, L.blocks[k].x);
      for (let k = 0; k < nP; k++) {
        const p = L.paddles[k], a = p.a0 + p.w * t, c = Math.cos(a) * p.len / 2, s = Math.sin(a) * p.len / 2;
        pax[k] = p.cx - c; pay[k] = p.cy - s; pbx[k] = p.cx + c; pby[k] = p.cy + s;
      }
      for (let k = 0; k < nH; k++) hx[k] = blockX(L.holes[k].mv, t, L.holes[k].x);
    }
    S.positions = positions;
    S.reset = function (t0) {
      S.n = 0; S.t = t0 || 0; S.collected = 0; S.lost = 0; S.eaten = 0;
      for (let k = 0; k < nB; k++) { bAlive[k] = 1; bTog[k] = 0; }
      positions();
    };
    S.spawn = function (x, y, vx, vy, w, col, m) {
      if (S.n >= cap) return -1;
      const i = S.n++;
      X[i] = x; Y[i] = y; PX[i] = x - vx * HSTEP; PY[i] = y - vy * HSTEP;
      WT[i] = w; CO[i] = col; MK[i] = m; AG[i] = 0;
      return i;
    };

    // push ball i out of a capsule (a-b, radius rad); omega/cx/cy give a rotating surface
    function collide(i, ax, ay, bx2, by2, rad, e, omega, cx, cy) {
      const x = X[i], y = Y[i], r = BR + rad;
      if (x < Math.min(ax, bx2) - r || x > Math.max(ax, bx2) + r) return;
      if (y < Math.min(ay, by2) - r || y > Math.max(ay, by2) + r) return;
      const dx = bx2 - ax, dy = by2 - ay, l2 = dx * dx + dy * dy;
      let u = l2 > 0 ? ((x - ax) * dx + (y - ay) * dy) / l2 : 0;
      if (u < 0) u = 0; else if (u > 1) u = 1;
      const qx = ax + u * dx, qy = ay + u * dy;
      let ex = x - qx, ey = y - qy;
      const d2 = ex * ex + ey * ey;
      if (d2 >= r * r) return;
      let d = Math.sqrt(d2);
      if (d < 1e-6) { ex = 0; ey = -1; d = 1; }
      const nx = ex / d, ny = ey / d, pen = r - (d2 < 1e-12 ? 0 : d);
      let vx = x - PX[i], vy = y - PY[i];
      let svx = 0, svy = 0;
      if (omega) { svx = -omega * (qy - cy) * HSTEP; svy = omega * (qx - cx) * HSTEP; }
      vx -= svx; vy -= svy;
      const vn = vx * nx + vy * ny;
      if (vn < 0) {
        let tx = vx - vn * nx, ty = vy - vn * ny;
        tx *= 0.985; ty *= 0.985;
        vx = tx - vn * e * nx; vy = ty - vn * e * ny;
      }
      vx += svx; vy += svy;
      X[i] = x + nx * pen; Y[i] = y + ny * pen;
      PX[i] = X[i] - vx; PY[i] = Y[i] - vy;
    }

    function trigger(i, k) {
      const b = L.blocks[k], kd = KIND[b.kind];
      if (kd.op === 'mul') {
        const N = kd.n;
        let kk = Math.min(N, cap - S.n + 1); if (kk < 1) kk = 1;
        const w = WT[i] * N / kk;
        const vx0 = (X[i] - PX[i]) / HSTEP, vy0 = (Y[i] - PY[i]) / HSTEP;
        const spread = Math.min(230, 70 + N * 8);
        const off = Math.min(b.w * 0.4, kk * 1.3);
        const x0 = X[i], y0 = b.y + BH + 1;
        for (let j = kk - 1; j >= 0; j--) {
          const f = kk > 1 ? j / (kk - 1) - 0.5 : 0;
          const nvx = vx0 * 0.35 + f * spread * 2, nvy = Math.max(60, vy0 * 0.6);
          if (j === 0) {
            X[i] = x0 + f * off * 2; Y[i] = y0; PX[i] = X[i] - nvx * HSTEP; PY[i] = y0 - nvy * HSTEP; WT[i] = w;
          } else S.spawn(x0 + f * off * 2, y0, nvx, nvy, w, CO[i], MK[i]);
        }
        if (S.cb) S.cb.mul(k, x0, y0, N);
        return false;
      }
      if (kd.op === 'div') {
        if (ghost) { WT[i] *= 0.5; return false; }
        if (S.cb) S.cb.bad(k, X[i], Y[i]);
        if (WT[i] > 1.0001) { WT[i] *= 0.5; return false; }
        bTog[k] ^= 1;
        return bTog[k] === 1;
      }
      // kill block (×0): every ball that touches it is gone
      if (S.cb) S.cb.bad(k, X[i], Y[i]);
      return true;
    }

    S.step = function () {
      S.t += HSTEP; positions();
      const gs = GRAV * HSTEP * HSTEP;
      const end = S.n;
      let dead = 0;
      for (let i = 0; i < end; i++) {
        let x = X[i], y = Y[i];
        let vx = (x - PX[i]) * 0.9995, vy = (y - PY[i]) * 0.9995 + gs;
        const sp = vx * vx + vy * vy;
        if (sp > VMAX2) { const s = VMAX / Math.sqrt(sp); vx *= s; vy *= s; }
        const oy = y;
        PX[i] = x; PY[i] = y; x += vx; y += vy; X[i] = x; Y[i] = y;
        AG[i] += HSTEP;
        if (y >= BY && oy < BY && x > L.bx0 && x < L.bx1) {
          S.collected += WT[i];
          if (S.cb) S.cb.collect(WT[i], x);
          WT[i] = -1; dead++; continue;
        }
        if (y > WH + 30 || AG[i] > 16 || x < -20 || x > WW + 20) { S.lost += WT[i]; WT[i] = -1; dead++; continue; }
        let band = (y / BAND) | 0; if (band < 0) band = 0; else if (band >= NBND) band = NBND - 1;
        let arr = bandSeg[band];
        for (let q = 0; q < arr.length; q++) { const w = L.walls[arr[q]]; collide(i, w[0], w[1], w[2], w[3], WALL_R, 0.35, 0, 0, 0); }
        arr = bandPeg[band];
        for (let q = 0; q < arr.length; q++) { const p = L.pegs[arr[q]]; collide(i, p[0], p[1], p[0], p[1], p[2], 0.55, 0, 0, 0); }
        arr = bandPad[band];
        for (let q = 0; q < arr.length; q++) { const k = arr[q], p = L.paddles[k]; collide(i, pax[k], pay[k], pbx[k], pby[k], 3, 0.45, p.w, p.cx, p.cy); }
        arr = bandHole[band];
        let eaten = false;
        for (let q = 0; q < arr.length; q++) {
          const k = arr[q], hy = L.holes[k].y;
          const dx = hx[k] - X[i], dy = hy - Y[i], d2 = dx * dx + dy * dy;
          if (d2 < HOLE_R * HOLE_R) {
            const d = Math.sqrt(d2);
            if (d < HOLE_CORE) { eaten = true; break; }
            const a = (HOLE_PULL * (1 - d / HOLE_R) + 120) * HSTEP * HSTEP;
            X[i] += dx / d * a; Y[i] += dy / d * a;
          }
        }
        if (eaten) { S.eaten += WT[i]; if (S.cb) S.cb.eat(X[i], Y[i]); WT[i] = -1; dead++; continue; }
        arr = bandBlk[band];
        for (let q = 0; q < arr.length; q++) {
          const k = arr[q];
          if (!bAlive[k]) continue;
          const bit = 1 << k;
          if (MK[i] & bit) continue;
          const b = L.blocks[k];
          if (Y[i] >= b.y && Y[i] <= b.y + BH && Math.abs(X[i] - bx[k]) <= b.w / 2) {
            MK[i] |= bit;
            if (trigger(i, k)) { WT[i] = -1; dead++; break; }
          }
        }
      }
      if (dead) {
        let w = 0;
        for (let i = 0; i < S.n; i++) {
          if (WT[i] < 0) continue;
          if (w !== i) { X[w] = X[i]; Y[w] = Y[i]; PX[w] = PX[i]; PY[w] = PY[i]; WT[w] = WT[i]; AG[w] = AG[i]; MK[w] = MK[i]; CO[w] = CO[i]; }
          w++;
        }
        S.n = w;
      }
    };
    S.reset(0);
    return S;
  }

  function jitterOf(k) { return (((k * 5) % 7) - 3) * 0.35; }

  // ---------- evaluation: yield of one ball per hopper per phase, then best/worst release times ----------
  // Runs incrementally (a few traces per frame) so a level never stalls the frame; work(Infinity) = all now.
  const JIT = 2, EVAL_PER_FRAME = 10;
  function makeEvaluator(L) {
    const sim = makeSim(L, GHOST_CAP, true);
    const Yd = L.hoppers.map(() => new Float64Array(NS));
    let h = 0, j = 0, q = 0, done = false;
    const ev = { result: null };
    ev.work = function (maxTraces) {
      let n = 0;
      while (!done && n < maxTraces) {
        sim.reset(j * EMIT);
        sim.spawn(L.hoppers[h].x + jitterOf(q * 2), NOZ_Y, 0, 60, 1, h, 0);
        const tEnd = j * EMIT + 12;
        while (sim.n > 0 && sim.t < tEnd) sim.step();
        Yd[h][j] += sim.collected / JIT;
        n++;
        if (++q >= JIT) { q = 0; if (++j >= NS) { j = 0; if (++h >= L.hoppers.length) done = true; } }
      }
      if (done && !ev.result) ev.result = summarize(L, Yd);
      return done;
    };
    return ev;
  }
  function summarize(L, Yd) {
    const best = [], worst = [], bestPer = [];
    let bestSum = 0, worstSum = 0;
    for (let h = 0; h < L.hoppers.length; h++) {
      const n = L.hoppers[h].n, arr = Yd[h];
      const win = new Float64Array(NS);
      for (let j = 0; j < NS; j++) {
        let s = 0;
        for (let k = 0; k < n; k++) s += arr[(j + k) % NS];
        win[j] = s;
      }
      // smooth over ±1 release slot: a human cannot time to 1/100 s, and it tames sampling noise
      let bv = -1, bj = 0, wv = Infinity, wj = 0;
      for (let j = 0; j < NS; j++) {
        const s = (win[(j + NS - 1) % NS] + win[j] * 2 + win[(j + 1) % NS]) / 4;
        if (s > bv) { bv = s; bj = j; }
        if (s < wv) { wv = s; wj = j; }
      }
      best.push(bj * EMIT); worst.push(wj * EMIT); bestPer.push(bv);
      bestSum += bv; worstSum += wv;
    }
    return { best, worst, bestPer, bestSum, worstSum };
  }

  // target from the evaluation: 簡單 lenient, 困難 needs near-best timing on every hopper
  function setTarget(L, diff, lv, stage) {
    const ev = L.ev.result;
    let f, capF;
    if (stage) { f = Math.min(0.7, 0.54 + stage * 0.01); capF = Math.min(0.6, 0.5 + stage * 0.006); }
    else if (diff === 0) { f = lv === 1 ? 0.15 : 0.3; capF = 0.5; }
    else if (diff === 1) { f = 0.5; capF = 0.58; }
    else { f = 0.7; capF = 0.6; }
    let target = ev.worstSum + (ev.bestSum - ev.worstSum) * f;
    target = Math.min(target, ev.bestSum * capF);
    const nBalls = L.hoppers.reduce((s, h) => s + h.n, 0);
    target = Math.max(Math.min(nBalls, Math.floor(ev.bestSum * 0.45)), Math.round(target));
    if (target >= 100) target = Math.round(target / 5) * 5;
    L.target = Math.max(1, target);
    L.plan = ev;
  }

  function makeStage(rng, diff, lv, stage) {
    const L = genLevel(rng, diff, lv, stage);
    L.ev = makeEvaluator(L);
    L.target = 0; L.plan = null;
    L.evalStep = function (n) {
      if (L.plan) return true;
      if (L.ev.work(n)) { setTarget(L, diff, lv, stage); return true; }
      return false;
    };
    return L;
  }

  MG.register({
    id: 'multiply', name: '倍增彈珠', icon: '✖️', color: '#ffcc4d', endless: true,
    _genLevel: genLevel, _makeStage: makeStage, _makeSim: makeSim,
    create(api) {
      const U = api.util;
      const diff = api.diff || 0, endless = !!api.endless;
      let stage = endless ? 1 : 0;
      let L = null, sim = null, hoppers = [];
      let sc = 1, ox = 0, oy = 0;
      let acc = 0, time = 0, shake = 0, cntBounce = 0, shown = 0, timeLeft = 0, rollT = 0;
      let reached = false, endT = -1, stageClearT = -1, total = 0, banner = null;
      let sfxT = 0, badT = 0, eatT = 0, colT = 0, touched = false;
      const parts = [], pops = [];
      let flashes = null;

      function layout() {
        const W = api.W, H = api.H;
        sc = Math.min(W / WW, H / (WH + 4));
        ox = (W - WW * sc) / 2; oy = (H - WH * sc) / 2 + 2;
      }
      layout();

      function puff(x, y, color, n, spd, life, size) {
        for (let i = 0; i < n && parts.length < 320; i++) {
          const a = Math.random() * Math.PI * 2, v = spd * (0.4 + Math.random() * 0.8);
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spd * 0.3, life, max: life, color, size: size * (0.6 + Math.random() * 0.7), g: 0 });
        }
      }
      function confetti() {
        for (let i = 0; i < 80 && parts.length < 400; i++) {
          parts.push({ x: WW / 2 + (Math.random() - 0.5) * 80, y: BY - 20, vx: (Math.random() - 0.5) * 380, vy: -220 - Math.random() * 360, life: 1.8, max: 1.8, color: COLORS[i % COLORS.length], size: 2.5 + Math.random() * 2.5, g: 600, rot: Math.random() * 6, conf: true });
        }
      }
      function popText(x, y, txt, col, size) {
        if (pops.length > 36) pops.shift();
        pops.push({ x, y, txt, col, size, life: 0.9, max: 0.9 });
      }

      const cb = {
        mul(k, x, y, N) {
          flashes[k] = 1;
          if (sfxT <= 0) { api.sfx(N >= 10 ? 'good' : 'pop'); sfxT = 0.07; }
          const b = L.blocks[k];
          if (!b._popT || time - b._popT > 0.18) { b._popT = time; popText(x, y - 6, KIND[b.kind].label, KIND[b.kind].c1, N >= 20 ? 20 : N >= 10 ? 17 : 14); }
          if (N >= 20) { shake = Math.max(shake, 6); puff(x, y, '#fff2a8', 6, 120, 0.45, 2.4); }
          else if (N >= 10) { shake = Math.max(shake, 2.5); puff(x, y, '#e2c4ff', 3, 90, 0.35, 2); }
        },
        bad(k, x, y) {
          flashes[k] = 1;
          if (badT <= 0) { api.sfx('bad'); badT = 0.18; puff(x, y, 'rgba(60,20,30,0.8)', 4, 60, 0.4, 2.4); }
        },
        pop(k) {
          const b = L.blocks[k];
          puff(sim.bx[k], b.y + BH / 2, '#c9c9d9', 14, 110, 0.6, 3);
          api.sfx('pop');
        },
        eat(x, y) {
          if (eatT <= 0) { api.sfx('hit'); eatT = 0.12; puff(x, y, 'rgba(150,80,255,0.8)', 3, 40, 0.4, 2); }
        },
        collect(w, x) {
          if (colT <= 0) { cntBounce = 1; colT = 0.05; puff(x, BY, '#fff8c4', 2, 60, 0.35, 1.8); }
        },
      };

      let nextL = null;
      function setupStage(pre) {
        L = pre || makeStage(api.rng, diff, api.level, endless ? stage : 0);
        L.evalStep(EVAL_PER_FRAME);
        sim = makeSim(L, CAP, false);
        sim.cb = cb;
        flashes = new Float32Array(L.blocks.length);
        hoppers = L.hoppers.map((h, i) => ({ x: h.x, left: h.n, n: h.n, col: L.colors[i % L.colors.length], ci: i, open: false, gate: 0, nextEmit: 0, emitted: 0, bounce: 0, locked: false }));
        sim.cb = cb;
        timeLeft = L.timer;
        reached = false; endT = -1; stageClearT = -1; shown = 0; acc = 0; touched = false;
        setInfo();
      }
      function colorIdx(h) { return h.ci; }

      function setInfo() {
        if (!L.plan) api.info('計算目標中…');
        else if (endless) api.info('無盡 第 ' + stage + ' 關・目標 ' + L.target + ' 顆');
        else if (!diff && api.level === 1 && !touched) api.info('點上方球罐放球，等 ×5 移到下面再放！');
        else if (!diff && api.level <= 3) api.info('目標 ' + L.target + ' 顆・再點球罐可關上');
        else api.info('目標 ' + L.target + ' 顆・抓準時機放球' + (L.timer ? '・時間到會自動放' : ''));
      }

      function scoreNow() { return Math.floor(total + sim.collected + 1e-6); }

      setupStage();
      if (endless) api.score(0);

      function toggle(i) {
        const h = hoppers[i];
        if (!h || api.ended || endT >= 0 || stageClearT >= 0) return false;
        if (h.left <= 0 || h.locked) { h.bounce = 0.4; api.sfx('bad'); return false; }
        touched = true;
        h.open = !h.open;
        h.bounce = 0.35;
        if (h.open) { h.nextEmit = sim.t; api.sfx('pop'); } else api.sfx('tap');
        setInfo();
        return true;
      }

      function emitStep() {
        for (let i = 0; i < hoppers.length; i++) {
          const h = hoppers[i];
          if (!h.open || h.left <= 0) continue;
          while (h.left > 0 && h.nextEmit <= sim.t + 1e-9) {
            if (sim.spawn(h.x + jitterOf(h.emitted), NOZ_Y, 0, 60, 1, colorIdx(h), 0) < 0) break;
            h.left--; h.emitted++; h.nextEmit += EMIT;
          }
          if (h.left <= 0) h.open = false;
        }
      }

      function checkEnd(dt) {
        if (!L.plan) return;
        const allEmpty = hoppers.every((h) => h.left <= 0);
        const busy = hoppers.some((h) => h.open && h.left > 0) || sim.n > 0;
        if (!reached && sim.collected >= L.target) {
          reached = true; api.sfx('good'); confetti();
          popText(WW / 2, BY - 50, '達標！', '#fff36b', 26);
        }
        if (endless) {
          if (stageClearT >= 0) {
            stageClearT += dt;
            if (!nextL) nextL = makeStage(api.rng, diff, api.level, stage + 1);
            else nextL.evalStep(EVAL_PER_FRAME);
            if (stageClearT > 1.3) { total += sim.collected; stage++; setupStage(nextL); nextL = null; api.score(Math.floor(total)); }
            return;
          }
          if (allEmpty && !busy) {
            if (sim.collected >= L.target) { stageClearT = 0; banner = { txt: '第 ' + stage + ' 關 過關！', t: 0 }; api.sfx('win'); }
            else { api.score(scoreNow()); api.lose('第 ' + stage + ' 關只收集到 ' + Math.floor(sim.collected) + ' / ' + L.target); }
          }
          return;
        }
        if (endT >= 0) { endT += dt; if (endT > 0.6) api.win('收集了 ' + Math.floor(sim.collected) + ' 顆！'); return; }
        if (reached && !busy) { endT = 0; return; }
        if (allEmpty && !busy) api.lose('只收集到 ' + Math.floor(sim.collected) + ' / ' + L.target + ' 顆');
      }

      function update(dt) {
        time += dt;
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i]; p.life -= dt;
          if (p.life <= 0) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
          p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.98; if (!p.g) p.vy *= 0.97;
        }
        for (let i = pops.length - 1; i >= 0; i--) { pops[i].life -= dt; pops[i].y -= dt * 30; if (pops[i].life <= 0) pops.splice(i, 1); }
        shake = Math.max(0, shake - dt * 25);
        cntBounce = Math.max(0, cntBounce - dt * 5);
        sfxT -= dt; badT -= dt; eatT -= dt; colT -= dt;
        for (let i = 0; i < flashes.length; i++) if (flashes[i] > 0) flashes[i] = Math.max(0, flashes[i] - dt * 5);
        for (const h of hoppers) { h.bounce = Math.max(0, h.bounce - dt); h.gate += ((h.open || h.left <= 0 ? 1 : 0) - h.gate) * Math.min(1, dt * 14); }
        if (banner) { banner.t += dt; if (banner.t > 1.6) banner = null; }
        const target = sim.collected;
        shown += (target - shown) * Math.min(1, dt * 9);
        if (Math.abs(target - shown) < 0.5) shown = target;
        rollT += ((target - shown > 0.5 ? 1 : 0) - rollT) * Math.min(1, dt * 6);
        if (api.ended) return;
        if (!L.plan && L.evalStep(EVAL_PER_FRAME)) setInfo();
        if (timeLeft > 0 && stageClearT < 0) {
          timeLeft -= dt;
          if (timeLeft <= 0) {
            let any = false;
            for (const h of hoppers) if (h.left > 0) { if (!h.open) h.nextEmit = sim.t; h.open = true; h.locked = true; any = true; }
            if (any) { api.sfx('bad'); popText(WW / 2, 112, '時間到！自動放球', '#ffd1d6', 14); }
          }
        }
        acc += dt;
        let steps = 0;
        while (acc >= HSTEP && steps < 8) { emitStep(); sim.step(); acc -= HSTEP; steps++; }
        if (steps >= 8) acc = 0;
        if (endless) api.score(scoreNow());
        else api.score(Math.floor(sim.collected));
        checkEnd(dt);
      }

      function down(x, y) {
        if (api.ended) return;
        const wx = (x - ox) / sc, wy = (y - oy) / sc;
        const half = Math.max(L.jw / 2 + 4, 24 / sc);
        let best = -1, bd = 1e9;
        for (let i = 0; i < hoppers.length; i++) {
          const h = hoppers[i];
          if (Math.abs(wx - h.x) <= half && wy >= 6 && wy <= 128) {
            const d = Math.abs(wx - h.x);
            if (d < bd) { bd = d; best = i; }
          }
        }
        if (best >= 0) toggle(best);
        else puff(wx, wy, 'rgba(255,255,255,0.8)', 4, 40, 0.3, 1.8);
      }

      // ---------- drawing ----------
      function drawStatic(g) {
        // board panel
        U.rr(g, 0, 108, WW, FY - 100, 12);
        g.fillStyle = 'rgba(255,255,255,0.1)'; g.fill();
        g.strokeStyle = 'rgba(42,26,20,0.45)'; g.lineWidth = 2; g.stroke();
        // rails for moving things
        g.lineCap = 'round';
        for (const r of L.rails) {
          g.strokeStyle = OL; g.lineWidth = 13;
          g.beginPath(); g.moveTo(r[0], r[2]); g.lineTo(r[1], r[2]); g.stroke();
          g.strokeStyle = '#3a2466'; g.lineWidth = 9.5;
          g.beginPath(); g.moveTo(r[0], r[2]); g.lineTo(r[1], r[2]); g.stroke();
          g.strokeStyle = 'rgba(210,190,255,0.55)'; g.lineWidth = 1.6;
          g.beginPath(); g.moveTo(r[0], r[2] - 3.5); g.lineTo(r[1], r[2] - 3.5); g.moveTo(r[0], r[2] + 3.5); g.lineTo(r[1], r[2] + 3.5); g.stroke();
          g.strokeStyle = 'rgba(210,190,255,0.25)'; g.lineWidth = 1;
          g.beginPath();
          for (let x = r[0] + 6; x < r[1]; x += 10) { g.moveTo(x, r[2] - 3.5); g.lineTo(x, r[2] + 3.5); }
          g.stroke();
          for (const ex of [r[0], r[1]]) {
            g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(ex, r[2], 4.8, 0, Math.PI * 2); g.fill(); olStroke(g, 1.8);
            g.fillStyle = '#5a3a9e'; g.beginPath(); g.arc(ex, r[2], 2, 0, Math.PI * 2); g.fill();
          }
        }
        // aim guides under each nozzle (not on 困難)
        if (diff < 2 && !endless) {
          g.strokeStyle = 'rgba(255,255,255,0.13)'; g.lineWidth = 1.5;
          if (g.setLineDash) g.setLineDash([4, 6]);
          for (const h of hoppers) { g.beginPath(); g.moveTo(h.x, 112); g.lineTo(h.x, L.topY); g.stroke(); }
          if (g.setLineDash) g.setLineDash([]);
        }
        // drains
        for (const d of L.drains) {
          g.fillStyle = 'rgba(10,0,20,0.8)';
          g.beginPath(); g.moveTo(d[0], d[1]); g.lineTo(d[2], d[3]); g.lineTo(d[2], WH); g.lineTo(d[0], WH); g.closePath(); g.fill();
          otext(g, '✕', (d[0] + d[2]) / 2, (d[1] + d[3]) / 2 + 16, 12, '#ff6b7a');
        }
        // walls
        g.lineJoin = 'round';
        const strokeW = (w, col) => {
          g.strokeStyle = col; g.lineWidth = w; g.beginPath();
          for (const q of L.walls) { g.moveTo(q[0], q[1]); g.lineTo(q[2], q[3]); }
          g.stroke();
        };
        g.lineCap = 'round';
        strokeW(WALL_R * 2 + 3.2, OL);
        strokeW(WALL_R * 2 - 0.4, '#f1ecff');
        strokeW(1.4, '#ffffff');
        // pegs
        for (const p of L.pegs) {
          g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.arc(p[0] + 1, p[1] + 1.5, p[2], 0, Math.PI * 2); g.fill();
          g.fillStyle = '#fff4c8'; g.beginPath(); g.arc(p[0], p[1], p[2], 0, Math.PI * 2); g.fill(); olStroke(g, 1.8);
          g.fillStyle = '#ffffff'; g.beginPath(); g.arc(p[0] - p[2] * 0.3, p[1] - p[2] * 0.3, p[2] * 0.35, 0, Math.PI * 2); g.fill();
        }
      }

      function drawBalls(g) {
        const X = sim.X, Y = sim.Y, WTa = sim.WT, CO = sim.CO;
        const sprites = [];
        for (let i = 0; i < hoppers.length; i++) sprites.push(ballSprite(hoppers[i].col));
        for (let i = 0; i < sim.n; i++) {
          const sp = sprites[CO[i]] || sprites[0];
          const w = WTa[i];
          const r = w > 1.5 ? BR * (1 + Math.min(0.7, Math.log(w) * 0.18)) : BR;
          if (sp) g.drawImage(sp, X[i] - r, Y[i] - r, r * 2, r * 2);
          else { g.fillStyle = '#fff'; g.beginPath(); g.arc(X[i], Y[i], r, 0, 7); g.fill(); }
        }
      }

      function drawParts(g) {
        for (const p of parts) {
          g.globalAlpha = Math.max(0, p.life / p.max);
          g.fillStyle = p.color;
          if (p.conf) { g.save(); g.translate(p.x, p.y); g.rotate(p.rot + p.life * 8); g.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size); g.restore(); }
          else { g.beginPath(); g.arc(p.x, p.y, p.size, 0, Math.PI * 2); g.fill(); }
        }
        g.globalAlpha = 1;
        for (const p of pops) {
          const t = 1 - p.life / p.max;
          const s = t < 0.15 ? 0.6 + t / 0.15 * 0.6 : 1.2 - Math.min(0.2, (t - 0.15));
          g.globalAlpha = Math.min(1, p.life / p.max * 2);
          g.save(); g.translate(p.x, p.y); g.scale(s, s);
          otext(g, p.txt, 0, 0, p.size, p.col);
          g.restore();
        }
        g.globalAlpha = 1;
      }

      function drawHud(g) {
        if (endless) {
          otext(g, '分數 ' + scoreNow(), 6, 9, 10, '#ffffff', 'left');
          otext(g, '最高 ' + Math.max(api.best || 0, scoreNow()), WW - 6, 9, 10, '#ffe9b0', 'right');
          otext(g, '第 ' + stage + ' 關', WW / 2, 9, 10, '#ffe27a');
        }
        if (L.timer > 0) {
          const p = Math.max(0, timeLeft / L.timer);
          U.rr(g, 40, 110, WW - 80, 7, 3.5); g.fillStyle = '#3a2466'; g.fill(); olStroke(g, 1.8);
          if (p > 0) { g.fillStyle = p < 0.3 ? '#ff5d6c' : '#ffd34d'; U.rr(g, 41, 111, (WW - 82) * p, 5, 2.5); g.fill(); }
        }
        if (banner) {
          const t = banner.t, s = t < 0.25 ? U.easeOutBack(t / 0.25) : 1;
          g.globalAlpha = t > 1.2 ? Math.max(0, 1 - (t - 1.2) / 0.4) : 1;
          g.save(); g.translate(WW / 2, 250); g.scale(s, s);
          U.rr(g, -95, -22, 190, 44, 22); g.fillStyle = '#ff5a8a'; g.fill(); olStroke(g, 3);
          U.rr(g, -85, -18, 170, 10, 5); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fill();
          otext(g, banner.txt, 0, 1, 20, '#fff36b');
          g.restore(); g.globalAlpha = 1;
        }
      }

      function draw(g) {
        drawBackground(g, api.W, api.H, time);
        g.save();
        const sx = shake > 0 ? (Math.random() - 0.5) * shake : 0, sy = shake > 0 ? (Math.random() - 0.5) * shake : 0;
        g.translate(ox + sx, oy + sy); g.scale(sc, sc);
        drawStatic(g);
        for (let k = 0; k < L.holes.length; k++) drawHole(g, sim.hx[k], L.holes[k].y, time);
        for (let k = 0; k < L.blocks.length; k++) {
          if (!sim.bAlive[k]) continue;
          drawBlock(g, U, L.blocks[k], sim.bx[k], sim.bCnt[k], flashes[k], time);
        }
        for (let k = 0; k < L.paddles.length; k++) drawPaddle(g, sim.pax[k], sim.pay[k], sim.pbx[k], sim.pby[k], L.paddles[k].cx, L.paddles[k].cy);
        drawBalls(g);
        const hintOn = !diff && !endless && api.level <= 2 && !touched;
        for (let i = 0; i < hoppers.length; i++) drawHopper(g, U, hoppers[i], L.jw, time, hintOn && i === 0);
        drawBasket(g, U, L, shown, L.plan ? L.target : 0, cntBounce, time, reached, rollT);
        drawParts(g);
        drawHud(g);
        g.restore();
      }

      return {
        update, draw, down,
        resize() { layout(); },
        _toggle: toggle,
        _simT: () => sim.t,
        _plan: () => { L.evalStep(Infinity); setInfo(); return L.plan; },
        _target: () => L.target,
        _collected: () => sim.collected,
        _stage: () => stage,
        _hoppers: () => hoppers,
        _sim: () => sim,
      };
    },
  });
})();
