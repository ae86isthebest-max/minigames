// 跳跳樂 — Doodle Jump: auto-bounce up the platforms, hold left / right to steer, wrap at the edges.
(function () {
  'use strict';

  const WW = 390;
  const GRAV = 1500;
  const JUMP = 780;
  const SPRING = 1300;
  const STOMP = 860;
  const VX = 360;
  const HW = 15;
  const PH = 14;
  const MR = 24;
  const HR = 30;
  const MAXH = JUMP * JUMP / (2 * GRAV);

  function wrapD(a, b) { let d = (b - a) % WW; if (d > WW / 2) d -= WW; if (d < -WW / 2) d += WW; return d; }
  function wrapX(x) { x %= WW; return x < 0 ? x + WW : x; }

  // ---------- difficulty ----------
  function tune(d, L, endless) {
    const Le = Math.min(L - 1, 45);
    if (endless) return { g0: 80, g1: 125, gUp: 50, pw: 60, mov: 0.3, movUp: 0.25, spd: 70, once: 0.08, brk: 0.35, spring: 0.06, mon: 0.12, hole: 0.06, help: 0, goal: 0 };
    if (d === 0) return { g0: 45 + Le * 0.6, g1: Math.min(135, 92 + Le * 1.2), gUp: 15, pw: 72, mov: Math.min(0.25, 0.04 + Le * 0.006), movUp: 0.05, spd: 45 + Le, once: 0, brk: L >= 2 ? 0.2 : 0, spring: 0.08, mon: 0, hole: 0, help: 0.55, goal: Math.min(800, 250 + Le * 20) };
    if (d === 1) return { g0: 70 + Le * 0.5, g1: Math.min(158, 138 + Le * 0.6), gUp: 12, pw: 64, mov: Math.min(0.42, 0.25 + Le * 0.005), movUp: 0.1, spd: 70 + Le * 0.8, once: 0.05, brk: 0.35, spring: 0.06, mon: Math.min(0.12, 0.06 + Le * 0.002), hole: 0, help: 0, goal: Math.min(1000, 350 + Le * 25) };
    return { g0: 95 + Le * 0.4, g1: Math.min(172, 160 + Le * 0.4), gUp: 6, pw: 56, mov: Math.min(0.6, 0.45 + Le * 0.004), movUp: 0.1, spd: 95 + Le, once: 0.16, brk: 0.45, spring: 0.05, mon: Math.min(0.2, 0.13 + Le * 0.002), hole: Math.min(0.12, 0.07 + Le * 0.002), help: 0, goal: Math.min(1300, 450 + Le * 30) };
  }

  // ---------- art (swap-friendly) ----------
  function skyCols(h) {
    const k = Math.min(1, h / 9000);
    const a = [[150, 220, 255], [255, 190, 210], [120, 90, 200], [30, 24, 70]];
    const b = [[220, 245, 255], [255, 230, 190], [255, 150, 190], [90, 60, 150]];
    const i = Math.min(2, Math.floor(k * 3)), f = k * 3 - i;
    const mix = (p, q) => 'rgb(' + Math.round(p[0] + (q[0] - p[0]) * f) + ',' + Math.round(p[1] + (q[1] - p[1]) * f) + ',' + Math.round(p[2] + (q[2] - p[2]) * f) + ')';
    return [mix(a[i], a[i + 1]), mix(b[i], b[i + 1]), k];
  }
  function drawBackground(g, W, H, camY, sc, t) {
    const c = skyCols(camY);
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (c[2] > 0.5) {
      g.fillStyle = 'rgba(255,255,255,' + Math.min(0.9, (c[2] - 0.5) * 2) + ')';
      for (let i = 0; i < 40; i++) {
        const x = (i * 137.5) % W, y = ((i * 89 + camY * sc * 0.1) % H + H) % H;
        g.fillRect(x, y, 2, 2);
      }
    }
    g.fillStyle = 'rgba(255,255,255,' + (0.55 - c[2] * 0.4) + ')';
    for (let i = 0; i < 6; i++) {
      const x = ((i * 151 + t * (6 + i * 2)) % (W + 160)) - 80;
      const y = ((i * 211 + camY * sc * 0.3) % (H + 120) + H + 120) % (H + 120) - 60;
      const s = 18 + (i % 3) * 8;
      g.beginPath(); g.arc(x, y, s, 0, 6.283); g.arc(x + s, y + 4, s * 0.8, 0, 6.283); g.arc(x - s, y + 5, s * 0.7, 0, 6.283); g.fill();
    }
  }
  function drawPlatform(g, x, y, w, h, p, U, t) {
    let c1 = '#5fe08a', c2 = '#2fae5a';
    if (p.type === 'move') { c1 = '#6ac6ff'; c2 = '#2f8ad6'; }
    else if (p.type === 'brk') { c1 = '#c99260'; c2 = '#8a5a3c'; }
    else if (p.type === 'once') { c1 = '#ffffff'; c2 = '#c8d4e8'; }
    g.fillStyle = 'rgba(0,0,0,0.15)'; U.rr(g, x - w / 2 + 2, y + 4, w, h, h / 2); g.fill();
    const gr = g.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, c1); gr.addColorStop(1, c2);
    g.fillStyle = gr; U.rr(g, x - w / 2, y, w, h, h / 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.45)'; U.rr(g, x - w / 2 + 4, y + 2, w - 8, h * 0.3, h * 0.15); g.fill();
    if (p.type === 'start') U.text(g, '起跳台', x, y + h / 2 + 1, Math.max(9, h * 0.75), '#1f6a3a', 'center', 900);
    if (p.hits) {
      g.strokeStyle = 'rgba(30,40,40,0.75)'; g.lineWidth = 1.5;
      for (let i = 0; i < (p.hits || 0); i++) { const cx0 = x - w * 0.3 + i * w * 0.3; g.beginPath(); g.moveTo(cx0, y); g.lineTo(cx0 + 5, y + h * 0.5); g.lineTo(cx0 - 2, y + h); g.stroke(); }
    }
    if (p.type === 'brk') {
      g.strokeStyle = '#5a3a20'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 2, y + h * 0.5); g.lineTo(x - 3, y + h); g.stroke();
    }
    if (p.type === 'once') { g.strokeStyle = '#9fb0cc'; g.setLineDash && g.setLineDash([4, 3]); g.lineWidth = 1.5; U.rr(g, x - w / 2, y, w, h, h / 2); g.stroke(); g.setLineDash && g.setLineDash([]); }
    if (p.type === 'move') { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x - w / 2 + 6, y + h / 2); g.lineTo(x - w / 2 + 11, y + 3); g.lineTo(x - w / 2 + 11, y + h - 3); g.fill(); g.beginPath(); g.moveTo(x + w / 2 - 6, y + h / 2); g.lineTo(x + w / 2 - 11, y + 3); g.lineTo(x + w / 2 - 11, y + h - 3); g.fill(); }
  }
  function drawSpring(g, x, y, sc, k) {
    const h = (12 + k * 10) * sc, w = 18 * sc;
    g.strokeStyle = '#9aa0ad'; g.lineWidth = 2.5 * sc;
    g.beginPath();
    for (let i = 0; i <= 4; i++) g.lineTo(x + (i % 2 ? w / 2 : -w / 2) * 0.8, y - h * i / 4);
    g.stroke();
    g.fillStyle = '#ff5d6c'; g.fillRect(x - w / 2, y - h - 4 * sc, w, 5 * sc);
    g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(x - w / 2 + 2, y - h - 4 * sc, w * 0.4, 2 * sc);
  }
  function drawHero(g, x, y, sc, face, sq, t, dead) {
    // x,y = feet centre (screen), cute green jumper
    const r = 21 * sc;
    const sx = 1 + (1 - sq) * 0.5, syy = sq;
    g.save(); g.translate(x, y); g.scale(sx, syy);
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.beginPath(); g.ellipse(0, 0, r * 0.8, r * 0.18, 0, 0, 6.283); g.fill();
    // legs
    g.fillStyle = '#2f9e5a';
    g.beginPath(); g.ellipse(-r * 0.45, -r * 0.2, r * 0.32, r * 0.22, 0, 0, 6.283); g.fill();
    g.beginPath(); g.ellipse(r * 0.45, -r * 0.2, r * 0.32, r * 0.22, 0, 0, 6.283); g.fill();
    // ears
    g.fillStyle = '#4cd986';
    g.beginPath(); g.ellipse(-r * 0.45, -r * 2.05, r * 0.18, r * 0.42, -0.25, 0, 6.283); g.fill();
    g.beginPath(); g.ellipse(r * 0.45, -r * 2.05, r * 0.18, r * 0.42, 0.25, 0, 6.283); g.fill();
    g.fillStyle = '#ffb3c8';
    g.beginPath(); g.ellipse(-r * 0.45, -r * 2.0, r * 0.08, r * 0.26, -0.25, 0, 6.283); g.fill();
    g.beginPath(); g.ellipse(r * 0.45, -r * 2.0, r * 0.08, r * 0.26, 0.25, 0, 6.283); g.fill();
    // body
    const gr = g.createRadialGradient(-r * 0.3, -r * 1.35, r * 0.2, 0, -r, r * 1.2);
    gr.addColorStop(0, '#9af5b8'); gr.addColorStop(1, '#3cc472');
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, -r, r, r * 1.05, 0, 0, 6.283); g.fill();
    g.fillStyle = '#e8ffe8'; g.beginPath(); g.ellipse(0, -r * 0.7, r * 0.6, r * 0.55, 0, 0, 6.283); g.fill();
    // face
    const fx = face * r * 0.18;
    if (dead) {
      g.strokeStyle = '#1a3a2a'; g.lineWidth = 2 * sc;
      for (const ex of [-0.35, 0.35]) { g.beginPath(); g.moveTo(fx + ex * r - 4 * sc, -r * 1.45 - 4 * sc); g.lineTo(fx + ex * r + 4 * sc, -r * 1.45 + 4 * sc); g.moveTo(fx + ex * r + 4 * sc, -r * 1.45 - 4 * sc); g.lineTo(fx + ex * r - 4 * sc, -r * 1.45 + 4 * sc); g.stroke(); }
    } else {
      g.fillStyle = '#ffffff';
      g.beginPath(); g.ellipse(fx - r * 0.33, -r * 1.42, r * 0.22, r * 0.26, 0, 0, 6.283); g.ellipse(fx + r * 0.33, -r * 1.42, r * 0.22, r * 0.26, 0, 0, 6.283); g.fill();
      g.fillStyle = '#1a2a3a';
      g.beginPath(); g.arc(fx - r * 0.3 + face * r * 0.06, -r * 1.4, r * 0.11, 0, 6.283); g.arc(fx + r * 0.36 + face * r * 0.06, -r * 1.4, r * 0.11, 0, 6.283); g.fill();
      g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(fx - r * 0.33, -r * 1.48, r * 0.04, 0, 6.283); g.arc(fx + r * 0.33, -r * 1.48, r * 0.04, 0, 6.283); g.fill();
    }
    g.fillStyle = '#ff7a9a'; g.globalAlpha = 0.5;
    g.beginPath(); g.ellipse(fx - r * 0.62, -r * 1.12, r * 0.13, r * 0.08, 0, 0, 6.283); g.ellipse(fx + r * 0.62, -r * 1.12, r * 0.13, r * 0.08, 0, 0, 6.283); g.fill();
    g.globalAlpha = 1;
    g.fillStyle = '#1a3a2a'; g.beginPath(); g.ellipse(fx, -r * 1.12, r * 0.12, r * 0.07, 0, 0, 6.283); g.fill();
    g.restore();
  }
  function drawEnemy(g, x, y, sc, t) {
    // x,y = centre
    const r = MR * sc, wob = Math.sin(t * 6) * 0.08;
    g.save(); g.translate(x, y); g.scale(1 + wob, 1 - wob);
    g.fillStyle = '#7a3ad6';
    for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283 + t; g.beginPath(); g.arc(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85, r * 0.3, 0, 6.283); g.fill(); }
    const gr = g.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    gr.addColorStop(0, '#c58aff'); gr.addColorStop(1, '#8a4ae0');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 0.9, 0, 6.283); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(-r * 0.32, -r * 0.2, r * 0.26, 0, 6.283); g.arc(r * 0.32, -r * 0.2, r * 0.26, 0, 6.283); g.fill();
    g.fillStyle = '#2a0a3a'; g.beginPath(); g.arc(-r * 0.28, -r * 0.15, r * 0.12, 0, 6.283); g.arc(r * 0.28, -r * 0.15, r * 0.12, 0, 6.283); g.fill();
    g.strokeStyle = '#2a0a3a'; g.lineWidth = 2 * sc;
    g.beginPath(); g.moveTo(-r * 0.55, -r * 0.55); g.lineTo(-r * 0.15, -r * 0.4); g.moveTo(r * 0.55, -r * 0.55); g.lineTo(r * 0.15, -r * 0.4); g.stroke();
    g.fillStyle = '#2a0a3a'; g.beginPath(); g.ellipse(0, r * 0.35, r * 0.4, r * 0.2, 0, 0, 3.1416); g.fill();
    g.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) { const tx = -r * 0.3 + i * r * 0.2; g.beginPath(); g.moveTo(tx, r * 0.35); g.lineTo(tx + r * 0.1, r * 0.35); g.lineTo(tx + r * 0.05, r * 0.47); g.fill(); }
    g.restore();
  }
  function drawHole(g, x, y, sc, t) {
    const r = HR * sc;
    const gr = g.createRadialGradient(x, y, 2, x, y, r * 1.4);
    gr.addColorStop(0, '#000000'); gr.addColorStop(0.55, '#1a0a2a'); gr.addColorStop(0.8, 'rgba(120,60,200,0.6)'); gr.addColorStop(1, 'rgba(120,60,200,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 1.4, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(200,150,255,0.6)'; g.lineWidth = 2 * sc;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x, y, r * (0.45 + i * 0.25), t * (3 - i) + i * 2, t * (3 - i) + i * 2 + 2.2); g.stroke(); }
  }

  MG.register({
    id: 'jumper', name: '跳跳樂', icon: '🦘', color: '#4cd986', endless: true,
    create(api) {
      const U = api.util, L = api.level, rng = api.rng, DIFF = api.diff || 0, ENDLESS = !!api.endless;
      const T = tune(DIFF, L, ENDLESS);
      const GOAL = T.goal * 10;
      let W, H, sc, VH;
      function layout() { W = api.W; H = api.H; sc = W / WW; VH = H / sc; }
      layout();

      // ---------- generation (lazy) ----------
      const plats = [], mons = [], holes = [];
      const chain = [];
      const G = { y: 0, x: WW / 2, n: 0, noMon: 0, lastHaz: -999, prev: null };
      function platX(p, t) { return p.mv ? wrapX(p.mv.cx + Math.sin(t * p.mv.w + p.mv.ph) * p.mv.amp) : p.x; }
      function gapAt(y) {
        const k = ENDLESS ? Math.min(1, y / 40000) : Math.min(1, y / Math.max(1, GOAL));
        return [T.g0 + k * T.gUp * 0.5, Math.min(ENDLESS ? 172 : T.g1 + k * T.gUp, 175)];
      }
      function arcHit(a0, a1, b0, b1, mx, margin) {
        // does the shortest move from [a0,a1] to [b0,b1] pass within margin of mx?
        for (let i = 0; i <= 4; i++) {
          const a = a0 + (a1 - a0) * i / 4;
          for (let j = 0; j <= 4; j++) {
            const b = b0 + (b1 - b0) * j / 4;
            const d = wrapD(a, b), e = wrapD(a, mx);
            const lo = Math.min(0, d) - margin, hi = Math.max(0, d) + margin;
            if ((e >= lo && e <= hi) || (e + WW >= lo && e + WW <= hi) || (e - WW >= lo && e - WW <= hi)) return true;
          }
        }
        return false;
      }
      function rangeOf(p) { return p.mv ? [p.mv.cx - p.mv.amp, p.mv.cx + p.mv.amp] : [p.x, p.x]; }
      function placeHazard(kind, yLo, yHi) {
        const r = kind === 'mon' ? MR : HR;
        for (let tries = 0; tries < 12; tries++) {
          const mx = 30 + rng() * (WW - 60), my = yLo + 40 + rng() * Math.max(1, yHi - yLo - 80);
          let ok = true;
          for (let i = chain.length - 1; i >= 1 && ok; i--) {
            const A = chain[i - 1], B = chain[i];
            if (B.y < my - r - 80) break;
            const top = A.y + (A.spring ? SPRING * SPRING / (2 * GRAV) : MAXH) + 60;
            if (A.y > my + r + 60 || top < my - r - 60) continue;
            const ra = rangeOf(A), rb = rangeOf(B);
            if (arcHit(ra[0], ra[1], rb[0], rb[1], mx, r + HW + 30 + Math.max(A.w, B.w) / 2)) ok = false;
          }
          if (ok) {
            if (kind === 'mon') mons.push({ x: mx, y: my, x0: mx, ph: rng() * 6.28, dead: false, dt: 0 });
            else holes.push({ x: mx, y: my });
            return true;
          }
        }
        return false;
      }
      function addPlat(p) { plats.push(p); return p; }
      function genOne() {
        if (G.n === 0) {
          const p = addPlat({ x: WW / 2, y: 0, w: 120, type: 'start', mv: null, spring: null, chain: true, gone: false, bt: 0, hits: 0 });
          chain.push(p); G.n++; G.prev = p; return;
        }
        const gr = gapAt(G.y);
        const dy = gr[0] + rng() * (gr[1] - gr[0]);
        const y = G.y + dy;
        const k = ENDLESS ? Math.min(1, y / 40000) : Math.min(1, y / Math.max(1, GOAL));
        let x = 40 + rng() * (WW - 80);
        const w = T.pw - k * 6;
        let type = 'norm', mv = null, spring = null;
        if (G.n > 2 && rng() < T.mov + k * T.movUp) {
          type = 'move';
          const amp = 40 + rng() * 70;
          mv = { cx: x, amp, w: (T.spd + k * 30) / amp * (0.8 + rng() * 0.4), ph: rng() * 6.283 };
        } else if (G.n > 3 && rng() < T.once) type = 'once';
        if (type !== 'once' && G.n > 2 && rng() < T.spring && dy < 140) spring = (rng() - 0.5) * (w - 24);
        const p = addPlat({ x, y, w, type, mv, spring, chain: true, gone: false, bt: 0 });
        chain.push(p);
        if (spring !== null) G.noMon = y + SPRING * SPRING / (2 * GRAV) + 120;
        // decoys between this and the previous chain platform
        if (rng() < T.brk && dy > 50) addPlat({ x: 40 + rng() * (WW - 80), y: G.y + dy * (0.35 + rng() * 0.3), w: w, type: 'brk', mv: null, spring: null, chain: false, gone: false, bt: 0 });
        if (rng() < T.help) addPlat({ x: 40 + rng() * (WW - 80), y: G.y + dy * (0.4 + rng() * 0.3), w: w, type: 'norm', mv: null, spring: null, chain: false, gone: false, bt: 0 });
        // hazards
        if (G.n > 6 && y > G.noMon && y - G.lastHaz > 380) {
          if (rng() < T.mon + k * 0.05) { if (placeHazard('mon', Math.max(G.y, G.noMon), y + 120)) G.lastHaz = y; }
          else if (rng() < T.hole) { if (placeHazard('hole', Math.max(G.y, G.noMon), y + 120)) G.lastHaz = y; }
        }
        G.y = y; G.prev = p; G.n++;
      }
      function ensureGen(top) { let guard = 0; while (G.y < top && guard++ < 200) { if (!ENDLESS && G.y > GOAL + VH) break; genOne(); } }
      ensureGen(VH * 2);

      // ---------- state ----------
      const S = { onP: null, same: 0, t: 0, x: WW / 2, y: PH, vx: 0, vy: JUMP, dir: 0, face: 1, camY: 0, maxY: 0, sq: 1, dead: false, deadT: 0, won: false, lastLand: 0, score: 0, why: '' };
      let shake = 0, anim = 0, lastInfo = '', hintT = L === 1 && DIFF === 0 && !ENDLESS ? 6 : 0, banner = null, holdX = -1;
      const parts = []; for (let i = 0; i < 200; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 3, grav: 0 });
      let pCur = 0;
      const pops = []; for (let i = 0; i < 8; i++) pops.push({ on: false, x: 0, y: 0, t: 0, s: '', col: '#fff' });
      let popI = 0;
      function addPart(x, y, vx, vy, life, col, size, grav) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size; p.grav = grav || 0;
      }
      function addPop(x, y, s, col) { const p = pops[popI]; popI = (popI + 1) % pops.length; p.on = true; p.x = x; p.y = y; p.t = 0; p.s = s; p.col = col; }
      function sx(x) { return x * sc; }
      function syy(y) { return H - (y - S.camY) * sc; }

      // ---------- input ----------
      function steer(x) { holdX = x; const c = W / 2; S.dir = U.clamp((x - c) / (W * 0.16), -1, 1); hintT = Math.min(hintT, 0.4); }
      function down(x) { if (api.ended) return; steer(x); }
      function move(x) { if (api.ended || holdX < 0) return; steer(x); }
      function up() { S.dir = 0; holdX = -1; }

      // ---------- simulation ----------
      function die(why) {
        if (S.dead) return;
        S.dead = true; S.why = why; shake = 12;
        api.sfx('bad');
        reportScore();
        api.lose(why);
      }
      function reportScore() { const sc2 = Math.floor(S.maxY / 10); if (sc2 !== S.score) { S.score = sc2; api.score(sc2); } }
      function update(dt) {
        dt = Math.max(0, dt || 0);
        anim += dt;
        updFx(dt);
        if (S.dead) {
          S.deadT += dt;
          if (S.why === 'hole') { S.sq = Math.max(0.05, S.sq - dt * 2); return; }
          S.vy -= GRAV * dt; S.y += S.vy * dt;
          return;
        }
        if (api.ended) { S.vy -= GRAV * dt; S.y += S.vy * dt; if (S.y < S.lastLand) { S.y = S.lastLand; S.vy = JUMP * 0.6; } return; }
        S.t += dt; hintT -= dt;
        const tv = S.dir * VX;
        S.vx += (tv - S.vx) * Math.min(1, dt * 12);
        if (Math.abs(S.dir) > 0.1) S.face = S.dir > 0 ? 1 : -1;
        S.x = wrapX(S.x + S.vx * dt);
        const y0 = S.y;
        S.vy -= GRAV * dt;
        S.y += S.vy * dt;
        S.sq += (1 - S.sq) * Math.min(1, dt * 10);
        // platforms (only when falling)
        if (S.vy < 0) {
          let best = null;
          for (let i = 0; i < plats.length; i++) {
            const p = plats[i];
            if (p.gone || p.y > y0 + 0.01 || p.y < S.y) continue;
            const px = platX(p, S.t);
            if (Math.abs(wrapD(px, S.x)) > p.w / 2 + HW) continue;
            if (!best || p.y > best.y) best = p;
          }
          if (best) {
            const p = best, px = platX(p, S.t);
            if (p.type === 'brk') {
              p.gone = true; p.bt = 0.001; api.sfx('drop');
              for (let k = 0; k < 6; k++) addPart(sx(px) + (Math.random() - 0.5) * p.w * sc, syy(p.y), (Math.random() - 0.5) * 80, 40 + Math.random() * 80, 0.6, '#a8764a', 5, 600);
            } else {
              S.y = p.y; S.lastLand = p.y;
              const onSpring = p.spring !== null && Math.abs(wrapD(px + p.spring, S.x)) < 16;
              S.vy = onSpring ? SPRING : JUMP; S.sq = 0.6;
              if (onSpring) { p.sbt = 1; api.sfx('good'); addPop(sx(S.x), syy(S.y) - 60, '彈！', '#ff5d6c'); }
              else api.sfx('tap');
              for (let k = 0; k < 5; k++) addPart(sx(S.x) + (Math.random() - 0.5) * 30, syy(p.y), (Math.random() - 0.5) * 120, -30 - Math.random() * 50, 0.35, '#ffffff', 4, 200);
              if (p.type === 'once') { p.gone = true; p.bt = 0.001; }
              if (p === S.onP) S.same++; else { S.onP = p; S.same = 1; }
              if (p.type === 'start' || DIFF === 2) p.hits = S.same - 1;
              if ((p.type === 'start' && S.same >= 3) || (DIFF === 2 && S.same >= 3 && !p.gone)) { p.gone = true; p.bt = 0.001; api.sfx('drop'); }
            }
          }
        }
        // monsters / holes
        for (let i = 0; i < mons.length; i++) {
          const m = mons[i];
          if (m.dead) { m.dt += dt; continue; }
          m.x = wrapX(m.x0 + Math.sin(S.t * 1.6 + m.ph) * 10);
          const dx = Math.abs(wrapD(m.x, S.x));
          if (dx > MR + 30 || Math.abs(m.y - S.y) > 80) continue;
          if (S.vy < 0 && S.y > m.y && S.y < m.y + MR + 8 && dx < MR + 10) {
            m.dead = true; m.dt = 0; S.vy = STOMP; S.sq = 0.55; shake = 6; api.sfx('hit');
            addPop(sx(m.x), syy(m.y) - 30, '踩扁！', '#c58aff');
            for (let k = 0; k < 12; k++) addPart(sx(m.x), syy(m.y), (Math.random() - 0.5) * 260, -Math.random() * 220, 0.6, k % 2 ? '#c58aff' : '#ffffff', 5, 500);
            continue;
          }
          const dy = (S.y + 19) - m.y;
          if (dx * dx + dy * dy < (MR + 15) * (MR + 15)) { S.vy = Math.min(S.vy, 0); return die('被怪物抓到了…'); }
        }
        for (let i = 0; i < holes.length; i++) {
          const h = holes[i];
          const dx = wrapD(h.x, S.x), dy = (S.y + 19) - h.y;
          if (dx * dx + dy * dy < (HR + 12) * (HR + 12)) { S.x = h.x; S.y = h.y - 19; die('被黑洞吸走了…'); S.why = 'hole'; return; }
        }
        if (S.y > S.maxY) S.maxY = S.y;
        // camera follows up only
        const want = S.y - VH * 0.45;
        if (want > S.camY) S.camY += (want - S.camY) * Math.min(1, dt * 10);
        ensureGen(S.camY + VH * 2);
        // trim
        while (plats.length > 4 && plats[0].y < S.camY - 200) plats.shift();
        while (mons.length && mons[0].y < S.camY - 200) mons.shift();
        while (holes.length && holes[0].y < S.camY - 200) holes.shift();
        while (chain.length > 4 && chain[0].y < S.camY - 600) chain.shift();
        reportScore();
        if (S.y < S.camY - 40) return die('掉下去了…');
        if (!ENDLESS && S.maxY >= GOAL) {
          S.won = true;
          for (let i = 0; i < 80; i++) addPart(Math.random() * W, -10, (Math.random() - 0.5) * 220, Math.random() * 200, 2 + Math.random(), U.PALETTE[i % 9], 6, 260);
          banner = { text: '登頂！', t: 0, col: '#ffe27a' };
          api.sfx('good');
          api.win('跳到 ' + T.goal + ' 公尺高！');
          return;
        }
        let info;
        if (hintT > 0) info = '按住左邊或右邊移動 · 穿越畫面邊緣會繞到另一側';
        else if (ENDLESS) info = '高度 ' + Math.floor(S.maxY / 10) + ' 公尺';
        else info = '高度 ' + Math.floor(S.maxY / 10) + ' / ' + T.goal + ' 公尺';
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
      }
      function updFx(dt) {
        shake = Math.max(0, shake - dt * 30);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
          p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        }
        for (let i = 0; i < plats.length; i++) { const p = plats[i]; if (p.gone && p.bt > 0 && p.bt < 1) p.bt = Math.min(1, p.bt + dt * 2); if (p.sbt) p.sbt = Math.max(0, p.sbt - dt * 4); }
        for (let i = 0; i < pops.length; i++) { const p = pops[i]; if (!p.on) continue; p.t += dt; p.y -= 40 * dt; if (p.t > 0.8) p.on = false; }
        if (banner) { banner.t += dt; if (banner.t > 1.4) banner = null; }
      }

      // ---------- drawing ----------
      function drawWrapped(x, w, fn) {
        fn(x);
        if (x - w < 0) fn(x + W);
        if (x + w > W) fn(x - W);
      }
      function draw(g) {
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        drawBackground(g, W, H, S.camY, sc, anim);
        if (!ENDLESS && GOAL - S.camY < VH + 50) {
          const y = syy(GOAL);
          g.fillStyle = 'rgba(255,214,80,0.35)'; g.fillRect(0, y - 6, W, 12);
          for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#222' : '#fff'; g.fillRect(i * W / 16, y - 3, W / 16, 6); }
          U.text(g, '終點 ' + T.goal + ' m', W / 2, y - 18, 16, '#ffffff', 'center', 900);
        }
        for (let i = 0; i < plats.length; i++) {
          const p = plats[i];
          const y = syy(p.y);
          if (y < -30 || y > H + 30) continue;
          const px = sx(platX(p, S.t)), w = p.w * sc, h = PH * sc;
          if (p.gone) {
            if (p.bt >= 1 || p.bt === 0) continue;
            const t = p.bt;
            g.globalAlpha = 1 - t;
            if (p.type === 'brk') {
              for (let k = -1; k <= 1; k += 2) {
                g.save(); g.translate(px + k * w * 0.25 + k * t * 20, y + t * t * 120); g.rotate(k * t * 0.8);
                drawPlatform(g, 0, 0, w / 2, h, p, U, anim); g.restore();
              }
            } else { g.save(); g.translate(px, y); g.scale(1 + t * 0.4, 1 + t * 0.4); drawPlatform(g, 0, 0, w, h, p, U, anim); g.restore(); }
            g.globalAlpha = 1;
            continue;
          }
          drawWrapped(px, w / 2, (xx) => {
            drawPlatform(g, xx, y, w, h, p, U, anim);
            if (p.spring !== null) drawSpring(g, xx + p.spring * sc, y, sc, p.sbt || 0);
          });
        }
        for (let i = 0; i < holes.length; i++) { const h = holes[i]; const y = syy(h.y); if (y > -60 && y < H + 60) drawWrapped(sx(h.x), HR * sc * 1.4, (xx) => drawHole(g, xx, y, sc, anim)); }
        for (let i = 0; i < mons.length; i++) {
          const m = mons[i]; const y = syy(m.y);
          if (y < -60 || y > H + 60) continue;
          if (m.dead) {
            if (m.dt > 1) continue;
            g.globalAlpha = 1 - m.dt;
            g.save(); g.translate(sx(m.x), y + m.dt * m.dt * 400); g.scale(1, 0.4); drawEnemy(g, 0, 0, sc, anim); g.restore();
            g.globalAlpha = 1; continue;
          }
          drawWrapped(sx(m.x), MR * sc * 1.2, (xx) => drawEnemy(g, xx, y, sc, anim));
        }
        // hero
        const hy = syy(S.y);
        const dead = S.dead && S.why !== 'hole';
        if (S.dead && S.why === 'hole') {
          g.save(); g.translate(sx(S.x), hy - 19 * sc); g.rotate(S.deadT * 12); g.scale(S.sq, S.sq); g.translate(-sx(S.x), -(hy - 19 * sc));
          drawHero(g, sx(S.x), hy, sc, S.face, 1, anim, true); g.restore();
        } else drawWrapped(sx(S.x), 22 * sc, (xx) => drawHero(g, xx, hy, sc, S.face, S.sq, anim, dead));
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.5); g.fillStyle = p.col;
          g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        g.globalAlpha = 1;
        for (let i = 0; i < pops.length; i++) {
          const p = pops[i]; if (!p.on) continue;
          g.globalAlpha = p.t > 0.5 ? Math.max(0, (0.8 - p.t) / 0.3) : 1;
          U.text(g, p.s, p.x, p.y, 20, p.col, 'center', 900);
        }
        g.globalAlpha = 1;
        g.restore();
        drawHud(g);
      }
      function drawHud(g) {
        const pad = 10;
        const m = Math.floor(S.maxY / 10);
        g.fillStyle = 'rgba(20,40,60,0.35)'; U.rr(g, pad, pad, 104, 30, 15); g.fill();
        U.text(g, m + ' m', pad + 52, pad + 16, 17, '#ffffff', 'center', 900);
        if (ENDLESS) {
          U.text(g, '最高 ' + Math.max(api.best || 0, m), W - pad - 4, pad + 16, 14, '#ffffff', 'right', 900);
        } else {
          const bh = Math.min(220, H * 0.35), bx = W - pad - 10, by = pad + 26;
          g.fillStyle = 'rgba(20,40,60,0.3)'; U.rr(g, bx, by, 10, bh, 5); g.fill();
          const f = Math.min(1, S.maxY / GOAL);
          g.fillStyle = '#4cd986'; U.rr(g, bx, by + bh * (1 - f), 10, Math.max(10, bh * f), 5); g.fill();
          U.text(g, '🏁', bx + 5, by - 12, 13, '#fff', 'center', 900);
        }
        if (holdX >= 0 && !api.ended) {
          const left = S.dir < 0;
          g.fillStyle = 'rgba(255,255,255,0.12)';
          g.fillRect(left ? 0 : W / 2, 0, W / 2, H);
          U.text(g, left ? '◀' : '▶', left ? 26 : W - 26, H - 40, 26, 'rgba(255,255,255,0.7)', 'center', 900);
        }
        if (banner) {
          const k = Math.min(1, banner.t / 0.3);
          g.globalAlpha = banner.t > 1 ? Math.max(0, 1 - (banner.t - 1) / 0.4) : 1;
          const sz = Math.min(44, W / 8) * U.easeOutBack(k);
          g.font = '900 ' + Math.max(1, sz) + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 7; g.strokeStyle = 'rgba(20,40,60,0.7)'; g.lineJoin = 'round';
          g.strokeText(banner.text, W / 2, H * 0.3); g.fillStyle = banner.col; g.fillText(banner.text, W / 2, H * 0.3);
          g.globalAlpha = 1;
        }
        if (hintT > 0 && !api.ended) {
          g.globalAlpha = Math.min(1, hintT) * (0.6 + 0.4 * Math.sin(anim * 5));
          U.text(g, '👈 按住左邊', W * 0.25, H * 0.78, 17, '#ffffff', 'center', 900);
          U.text(g, '按住右邊 👉', W * 0.75, H * 0.78, 17, '#ffffff', 'center', 900);
          g.globalAlpha = 1;
        }
      }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _s: S, _k: { plats, chain, mons, holes, platX, wrapD, GRAV, JUMP, SPRING, VX, HW, GOAL, get W() { return W; } },
      };
    },
  });
})();
