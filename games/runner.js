// 神廟跑酷 — Temple Run / Subway Surfers style 3-lane runner: swipe to change lane, jump, slide.
(function () {
  'use strict';

  const LANE = 1.25;
  const TW = 1.95;
  const CAMD = 5.2;
  const CAMH = 2.9;
  const FAR = 72;
  const JV = 8;
  const GRAV = 26;
  const SLIDE_T = 0.7;
  const FFV = -17;
  const PH = 1.7;
  const PHS = 0.62;
  const PW = 0.3;
  const PD = 0.3;
  const OBW = 0.48;
  const LOWH = 0.55;
  const BAR0 = 1.0;
  const BAR1 = 1.55;
  const WALLH = 2.2;
  const TRAINH = 2.1;
  const GAPL = 2.4;
  const LANE_V = 11;
  const MAG_T = 8;
  const SHIELD_T = 12;

  // ---------- difficulty ----------
  function tune(d, L, endless) {
    const Le = Math.min(L - 1, 45);
    if (endless) return { v0: 12, v1: 24, ramp: 2600, rt0: 0.66, rt1: 0.82, rtMin: 0.5, pBlock: 0.85, pAct: 0.55, pTrain: 0.28, pGap: 0.1, pPow: 0.07, goal: 0 };
    if (d === 0) return {
      v0: 8 + Le * 0.05, v1: Math.min(14, 11 + Le * 0.08), rt0: Math.max(0.9, 1.25 - Le * 0.008), rt1: Math.max(1.05, 1.5 - Le * 0.008), rtMin: 0.9,
      pBlock: Math.min(0.62, 0.38 + Le * 0.007), pAct: Math.min(0.45, 0.22 + Le * 0.006), pTrain: L >= 4 ? Math.min(0.15, 0.05 + Le * 0.003) : 0,
      pGap: L >= 2 ? 0.05 : 0, pPow: 0.08, goal: Math.min(1000, 300 + Le * 20),
    };
    if (d === 1) return {
      v0: 10.5 + Le * 0.07, v1: Math.min(18.5, 14.5 + Le * 0.1), rt0: Math.max(0.68, 0.85 - Le * 0.005), rt1: Math.max(0.8, 1.05 - Le * 0.005), rtMin: 0.66,
      pBlock: Math.min(0.85, 0.68 + Le * 0.005), pAct: Math.min(0.6, 0.45 + Le * 0.004), pTrain: Math.min(0.3, 0.18 + Le * 0.003), pGap: 0.08, pPow: 0.07,
      goal: Math.min(1400, 500 + Le * 22),
    };
    return {
      v0: 13 + Le * 0.08, v1: Math.min(22.5, 18 + Le * 0.1), rt0: Math.max(0.52, 0.64 - Le * 0.003), rt1: Math.max(0.62, 0.78 - Le * 0.004), rtMin: 0.5,
      pBlock: Math.min(0.95, 0.88 + Le * 0.003), pAct: Math.min(0.7, 0.58 + Le * 0.003), pTrain: Math.min(0.4, 0.28 + Le * 0.003), pGap: 0.1, pPow: 0.06,
      goal: Math.min(1900, 700 + Le * 28),
    };
  }

  // ---- 卡通 Q 版 drawing helpers (thick dark outline, flat fills) ----
  const OL = '#2a1a14';
  const TAU = Math.PI * 2;
  const FONT = '-apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
  function rrp(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function fillStroke(g, fill, lw) { g.fillStyle = fill; g.fill(); if (lw > 0) { g.lineWidth = lw; g.strokeStyle = OL; g.stroke(); } }
  function ell(g, x, y, rx, ry, fill, lw) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); fillStroke(g, fill, lw); }
  function star(g, x, y, r) {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r * 0.45 : r;
      if (i) g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); else g.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    }
    g.closePath();
  }
  function otext(g, s, x, y, size, col, align, lw) {
    g.font = '900 ' + size + 'px ' + FONT; g.textAlign = align || 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.lineWidth = lw || Math.max(2, size * 0.2); g.strokeStyle = OL;
    g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y);
  }

  // ---------- art (swap-friendly, 卡通 Q 版: jungle temple) ----------
  let bgCache = null, bgKey = '';
  function buildBg(W, H, hy, M) {
    const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    const c = document.createElement('canvas');
    const CW = W + 2 * M;
    c.width = Math.ceil(CW * dpr); c.height = Math.ceil(H * dpr);
    const x = c.getContext('2d'); x.scale(dpr, dpr);
    x.lineJoin = 'round'; x.lineCap = 'round';
    const s = H / 700, mx = M + W / 2;
    let gr = x.createLinearGradient(0, 0, 0, hy);
    gr.addColorStop(0, '#6cc8f0'); gr.addColorStop(0.6, '#bfeaf2'); gr.addColorStop(1, '#fff0b8');
    x.fillStyle = gr; x.fillRect(0, 0, CW, hy + 2);
    const sy = hy * 0.5, sr = Math.max(14, hy * 0.11);
    x.fillStyle = 'rgba(255,245,170,0.4)'; x.beginPath(); x.arc(mx, sy, sr * 1.8, 0, TAU); x.fill();
    ell(x, mx, sy, sr, sr, '#fff3a0', 3);
    const r = MG.mulberry32(17);
    for (let i = 0; i < 4; i++) {
      const ccx = r() * CW, ccy = hy * (0.15 + r() * 0.3), cs = (10 + r() * 10) * s;
      x.beginPath(); x.arc(ccx - cs, ccy + 3 * s, cs * 0.7, Math.PI * 0.5, Math.PI * 1.5); x.arc(ccx, ccy, cs, Math.PI, 0); x.arc(ccx + cs, ccy + 3 * s, cs * 0.75, Math.PI * 1.5, Math.PI * 0.5); x.closePath();
      fillStroke(x, '#ffffff', 2.5);
    }
    x.beginPath(); x.moveTo(0, hy);
    for (let i = 0; i <= 12; i++) { const xx = i / 12 * CW; x.lineTo(xx, hy - (26 + 26 * Math.abs(Math.sin(i * 1.7 + 0.4))) * s); }
    x.lineTo(CW, hy); x.closePath(); fillStroke(x, '#8cc9a0', 2.5);
    const tiers = 5;
    for (let i = 0; i < tiers; i++) {
      const w = (96 - i * 16) * s, h = 13 * s, ty = hy - 10 * s - (i + 1) * h;
      rrp(x, mx - w / 2, ty, w, h + 1, 2 * s); fillStroke(x, i % 2 ? '#d2a86e' : '#c49460', 2.5);
      x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(mx - w / 2 + 3 * s, ty + 2 * s, w - 6 * s, 2.5 * s);
    }
    const topY = hy - 10 * s - tiers * 13 * s;
    rrp(x, mx - 13 * s, topY - 20 * s, 26 * s, 21 * s, 3 * s); fillStroke(x, '#b07e4c', 2.5);
    x.beginPath(); x.moveTo(mx - 17 * s, topY - 19 * s); x.lineTo(mx, topY - 32 * s); x.lineTo(mx + 17 * s, topY - 19 * s); x.closePath(); fillStroke(x, '#8a5a3c', 2.5);
    rrp(x, mx - 5 * s, topY - 14 * s, 10 * s, 14 * s, 5 * s); fillStroke(x, '#3a2412', 2);
    for (let i = 0; i < 26; i++) {
      const bx = (i / 25) * CW + (r() - 0.5) * 16 * s, br = (12 + r() * 14) * s;
      if (Math.abs(bx - mx) < 50 * s) continue;
      x.beginPath(); x.arc(bx, hy - br * 0.35, br, Math.PI, 0); x.closePath(); fillStroke(x, i % 2 ? '#3f9a4a' : '#4aa852', 2.5);
    }
    const tree = (tx, ty, ts) => {
      rrp(x, tx - 6 * ts, ty - 10 * ts, 12 * ts, 80 * ts, 5 * ts); fillStroke(x, '#8a5a3c', 2.5);
      ell(x, tx - 20 * ts, ty - 10 * ts, 26 * ts, 20 * ts, '#2f8a3e', 2.5);
      ell(x, tx + 22 * ts, ty - 6 * ts, 24 * ts, 18 * ts, '#2f8a3e', 2.5);
      ell(x, tx, ty - 26 * ts, 28 * ts, 22 * ts, '#3aa04a', 2.5);
      x.fillStyle = 'rgba(255,255,255,0.22)'; x.beginPath(); x.ellipse(tx - 8 * ts, ty - 36 * ts, 10 * ts, 5 * ts, -0.4, 0, TAU); x.fill();
    };
    tree(M + W * 0.06, hy - 40 * s, 1.1 * s);
    tree(M + W * 0.95, hy - 46 * s, 1.2 * s);
    tree(M - W * 0.15, hy - 34 * s, 1.0 * s);
    tree(M + W * 1.15, hy - 30 * s, 1.0 * s);
    gr = x.createLinearGradient(0, hy, 0, H);
    gr.addColorStop(0, '#5fb35a'); gr.addColorStop(1, '#2f7a34');
    x.fillStyle = gr; x.fillRect(0, hy, CW, H - hy);
    x.fillStyle = OL; x.fillRect(0, hy - 1, CW, 2);
    for (let i = 0; i < 40; i++) {
      const yy = hy + 8 + Math.pow(r(), 1.3) * (H - hy), xx = r() * CW, k = 0.4 + (yy - hy) / (H - hy) * 1.4;
      const col = r() < 0.5 ? '#3f9a4a' : '#6fc060';
      x.beginPath(); x.arc(xx - 8 * k * s, yy, 7 * k * s, Math.PI, 0); x.arc(xx, yy - 3 * k * s, 9 * k * s, Math.PI, 0); x.arc(xx + 8 * k * s, yy, 7 * k * s, Math.PI, 0); x.closePath();
      fillStroke(x, col, Math.max(1, 1.3 * k));
    }
    return c;
  }
  function drawBackground(g, W, H, hy, t, bend, U) {
    const M = Math.round(W * 0.3);
    const key = W + 'x' + H + 'x' + Math.round(hy);
    if (key !== bgKey || !bgCache) { bgKey = key; bgCache = buildBg(W, H, hy, M); }
    g.fillStyle = '#2f7a34'; g.fillRect(0, 0, W, H);
    g.drawImage(bgCache, -M - bend * W * 0.25, 0, W + 2 * M, H);
  }

  function drawHero(g, x, y, k, st, U) {
    // x,y = feet on screen, k = px per world unit; back view chibi explorer
    const s = k;
    const lw = Math.max(1.2, Math.min(3.5, 0.045 * s));
    const run = st.run, sl = st.slide, air = st.air;
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.beginPath(); g.ellipse(x, st.shadowY, 0.34 * s * st.shadowK, 0.1 * s * st.shadowK, 0, 0, TAU); g.fill();
    if (st.hurt > 0 && Math.floor(st.hurt * 20) % 2 === 0) g.globalAlpha = 0.5;
    g.lineJoin = 'round'; g.lineCap = 'round';
    if (sl) {
      const r = 0.4 * s, cy = y - r;
      g.save(); g.translate(x, cy); g.rotate(st.roll);
      ell(g, 0, 0, r, r, '#d9b47c', lw);
      g.beginPath(); g.arc(0, 0, r, 3.4, 5.6); g.lineTo(0, 0); g.closePath(); fillStroke(g, '#c9553a', lw);
      ell(g, 0, -r * 0.6, r * 0.8, r * 0.28, '#7a5530', lw);
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(-r * 0.35, r * 0.2, r * 0.2, 0, TAU); g.fill();
      g.restore();
      g.globalAlpha = 1;
      return;
    }
    const sw = air ? 0 : Math.sin(run);
    const l1 = air ? 0.16 : Math.max(0, sw) * 0.22, l2 = air ? 0.16 : Math.max(0, -sw) * 0.22;
    ell(g, x - 0.13 * s, y - (0.2 + l1) * s, 0.1 * s, 0.17 * s, '#6b4a2e', lw);
    ell(g, x + 0.13 * s, y - (0.2 + l2) * s, 0.1 * s, 0.17 * s, '#6b4a2e', lw);
    ell(g, x - 0.13 * s, y - (0.06 + l1) * s, 0.12 * s, 0.07 * s, '#3a2a1e', lw);
    ell(g, x + 0.13 * s, y - (0.06 + l2) * s, 0.12 * s, 0.07 * s, '#3a2a1e', lw);
    const ay1 = air ? 0.98 : 0.6 + sw * 0.07, ay2 = air ? 0.98 : 0.6 - sw * 0.07;
    ell(g, x - 0.34 * s, y - ay1 * s, 0.09 * s, 0.15 * s, '#e8b48a', lw);
    ell(g, x + 0.34 * s, y - ay2 * s, 0.09 * s, 0.15 * s, '#e8b48a', lw);
    rrp(g, x - 0.3 * s, y - 0.92 * s, 0.6 * s, 0.6 * s, 0.18 * s); fillStroke(g, '#d9b47c', lw);
    rrp(g, x - 0.22 * s, y - 0.86 * s, 0.44 * s, 0.44 * s, 0.1 * s); fillStroke(g, '#c9553a', lw);
    g.strokeStyle = OL; g.lineWidth = lw * 0.8;
    g.beginPath(); g.moveTo(x - 0.22 * s, y - 0.68 * s); g.lineTo(x + 0.22 * s, y - 0.68 * s); g.stroke();
    ell(g, x, y - 0.6 * s, 0.05 * s, 0.05 * s, '#ffd34a', lw * 0.6);
    g.fillStyle = 'rgba(255,255,255,0.3)'; rrp(g, x - 0.17 * s, y - 0.83 * s, 0.12 * s, 0.1 * s, 0.05 * s); g.fill();
    ell(g, x - 0.34 * s, y - 1.2 * s, 0.07 * s, 0.1 * s, '#e8b48a', lw);
    ell(g, x + 0.34 * s, y - 1.2 * s, 0.07 * s, 0.1 * s, '#e8b48a', lw);
    ell(g, x, y - 1.22 * s, 0.36 * s, 0.33 * s, '#5a3a20', lw);
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.ellipse(x - 0.12 * s, y - 1.3 * s, 0.1 * s, 0.05 * s, -0.4, 0, TAU); g.fill();
    ell(g, x, y - 1.44 * s, 0.56 * s, 0.13 * s, '#7a5530', lw);
    rrp(g, x - 0.25 * s, y - 1.8 * s, 0.5 * s, 0.38 * s, 0.14 * s); fillStroke(g, '#8a6038', lw);
    g.fillStyle = '#3a2412'; g.fillRect(x - 0.25 * s + lw / 2, y - 1.55 * s, 0.5 * s - lw, 0.07 * s);
    g.fillStyle = 'rgba(255,255,255,0.25)'; rrp(g, x - 0.18 * s, y - 1.75 * s, 0.14 * s, 0.06 * s, 0.03 * s); g.fill();
    g.globalAlpha = 1;
  }

  function drawCoin(g, x, y, r, spin) {
    const w = Math.max(0.15, Math.abs(Math.cos(spin)));
    const lw = Math.max(1, Math.min(2.5, r * 0.18));
    g.beginPath(); g.ellipse(x, y, r * w + 1, r, 0, 0, TAU); fillStroke(g, '#e8a618', lw);
    g.fillStyle = '#ffd23f'; g.beginPath(); g.ellipse(x, y, r * w * 0.72, r * 0.72, 0, 0, TAU); g.fill();
    g.fillStyle = '#fff3a8'; g.beginPath(); g.ellipse(x - r * w * 0.25, y - r * 0.3, r * w * 0.2, r * 0.22, 0, 0, TAU); g.fill();
  }

  MG.register({
    id: 'runner', name: '神廟跑酷', icon: '🏃‍♂️', color: '#ff8f3d', endless: true,
    create(api) {
      const U = api.util, L = api.level, rng = api.rng, DIFF = api.diff || 0, ENDLESS = !!api.endless;
      const T = tune(DIFF, L, ENDLESS);
      const GOAL = T.goal;
      let W, H, cx, hy, F, CH = CAMH;
      function layout() {
        W = api.W; H = api.H; cx = W / 2;
        F = Math.min(W * 1.1, H * 0.85);
        CH = U.clamp((H * 0.44) / F * CAMD, 2.4, 4.6);
        hy = H * 0.8 - (CH / CAMD) * F;
      }
      layout();

      function speedAt(d) {
        if (ENDLESS) return Math.min(T.v1, T.v0 + d * (T.v1 - T.v0) / T.ramp) + Math.max(0, d - T.ramp) * 0.0004;
        return T.v0 + (T.v1 - T.v0) * Math.min(1, d / GOAL);
      }
      function rowTime(z) {
        if (ENDLESS) { const f = Math.max(0, 1 - z / 3000); return Math.max(T.rtMin, T.rt0 * (0.8 + 0.2 * f) + rng() * (T.rt1 - T.rt0)); }
        return T.rt0 + rng() * (T.rt1 - T.rt0);
      }

      // ---------- level generation (lazy, deterministic) ----------
      const obs = [], coins = [], pows = [], rows = [];
      const trains = [null, null, null];
      const G = { z: ENDLESS ? 30 : 26 + (DIFF === 0 ? 6 : 0), safe: 1, n: 0, lastJump: -99, prevEnd: 4 };
      function laneX(l) { return (l - 1) * LANE; }
      function addCoinsLine(l, z0, z1) {
        for (let z = z0; z <= z1; z += 1.35) coins.push({ x: laneX(l), y: 0.55, z, got: false, ft: 0, fx: 0, fy: 0 });
      }
      function genRow() {
        const z = G.z, v = speedAt(z);
        const spacing = Math.max(6.5, v * rowTime(z));
        const tr = [false, false, false];
        for (let l = 0; l < 3; l++) if (trains[l] && trains[l].last >= G.n) tr[l] = true;
        const anyTrain = tr[0] || tr[1] || tr[2];
        if (!ENDLESS && z > GOAL + 20) { G.z = 1e9; return; }
        if (G.n > 1 && !anyTrain && rng() < T.pGap && z - G.lastJump >= 0.9 * v) {
          obs.push({ type: 'gap', lane: -1, z, z1: z + GAPL, hit: false });
          rows.push({ z, end: z + GAPL, safe: G.safe, act: 'gap' });
          for (let i = 0; i < 5; i++) { const zz = z - 1.6 + i * 1.4; const u = (zz - (z - 2.2)) / 6.8; coins.push({ x: laneX(G.safe), y: 0.55 + 4.2 * u * (1 - u) * 1.3, z: zz, got: false, ft: 0, fx: 0, fy: 0 }); }
          G.lastJump = z; G.prevEnd = z + GAPL; G.z = z + GAPL + spacing; G.n++;
          return;
        }
        const cand = [], wts = [];
        for (let s = 0; s < 3; s++) {
          if (tr[s]) continue;
          const d = Math.abs(s - G.safe);
          if (d === 2 && DIFF === 0) continue;
          let ok = true;
          for (let l = Math.min(s, G.safe); l <= Math.max(s, G.safe); l++) if (trains[l] && trains[l].first <= G.n - 1 && trains[l].last >= G.n) ok = false;
          if (!ok) continue;
          cand.push(s); wts.push(d === 0 ? 1 : d === 1 ? 1.3 : 0.35);
        }
        let s = G.safe;
        if (cand.length) {
          let tot = 0; for (const w of wts) tot += w;
          let r = rng() * tot;
          for (let i = 0; i < cand.length; i++) { r -= wts[i]; if (r <= 0) { s = cand[i]; break; } }
        }
        let act = 'none';
        if (G.n > 0 && rng() < T.pAct) {
          act = (z - G.lastJump >= 0.9 * v && rng() < 0.55) ? 'low' : 'high';
        }
        let end = z + 0.6;
        if (act === 'low') { obs.push({ type: 'low', lane: s, z, z1: z + 0.5, hit: false }); G.lastJump = z; }
        else if (act === 'high') obs.push({ type: 'high', lane: s, z, z1: z + 0.4, hit: false });
        let trainCount = (tr[0] ? 1 : 0) + (tr[1] ? 1 : 0) + (tr[2] ? 1 : 0);
        let blocked = 0;
        for (let l = 0; l < 3; l++) {
          if (l === s) continue;
          if (tr[l]) { trains[l].obj.z1 = z + 1.0; end = Math.max(end, z + 1.0); continue; }
          if (G.n === 0 && l !== 1) continue;
          const pb = G.n === 0 ? 1 : T.pBlock;
          if (DIFF === 0 && L < 6 && blocked >= 1 && act !== 'none') continue;
          if (rng() >= pb) continue;
          blocked++;
          const r = rng();
          if (G.n > 1 && trainCount < 2 && r < T.pTrain) {
            const k = 2 + Math.floor(rng() * 3);
            const o = { type: 'train', lane: l, z: z - 0.2, z1: z + 1.0, hit: false, cars: 0 };
            obs.push(o); trains[l] = { first: G.n, last: G.n + k - 1, obj: o }; trainCount++;
            end = Math.max(end, z + 1.0);
          } else {
            const q = rng();
            const type = q < 0.4 ? 'wall' : q < 0.7 ? 'low' : 'high';
            obs.push({ type, lane: l, z, z1: z + (type === 'wall' ? 0.7 : type === 'low' ? 0.5 : 0.4), hit: false });
          }
        }
        rows.push({ z, end, safe: s, act });
        // coins guide the safe line
        if (rng() < 0.7) {
          const a = G.prevEnd + 1.6, b = z - 1.8;
          if (b > a) addCoinsLine(s, a + rng() * 0.6, b);
        }
        if (act === 'low') for (let i = 0; i < 3; i++) coins.push({ x: laneX(s), y: 1.3 + (i === 1 ? 0.25 : 0), z: z - 1.3 + i * 1.3, got: false, ft: 0, fx: 0, fy: 0 });
        if (act === 'high') coins.push({ x: laneX(s), y: 0.4, z: z + 0.2, got: false, ft: 0, fx: 0, fy: 0 });
        if (G.n > 2 && rng() < T.pPow) {
          const pz = (G.prevEnd + z) / 2;
          if (z - G.prevEnd > 5) pows.push({ kind: rng() < 0.5 ? 'mag' : 'shield', x: laneX(s), z: pz, got: false });
        }
        G.safe = s; G.prevEnd = end; G.z = z + spacing; G.n++;
      }

      // ---------- state ----------
      const S = {
        t: 0, z: 0, x: 0, lane: 1, y: 0, vy: 0, slide: 0, slideQ: false, jumpBuf: 0, run: 0, roll: 0,
        coins: 0, dist: 0, v: T.v0, dead: false, fall: false, won: false, endT: 0,
        mag: 0, shield: 0, hurt: 0, bend: 0, bendT: 0, camY: CH, camX: 0, score: 0,
      };
      let shake = 0, anim = 0, lastInfo = '', hintT = L === 1 && DIFF === 0 && !ENDLESS ? 7 : 0, banner = null, dustT = 0;
      let gest = null;
      const parts = []; for (let i = 0; i < 260; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 3, grav: 0 });
      let pCur = 0;
      const lines = []; for (let i = 0; i < 26; i++) lines.push({ a: Math.random() * 6.283, r: Math.random(), sp: 0.6 + Math.random() });
      const dl = [];
      function addPart(x, y, vx, vy, life, col, size, grav) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size; p.grav = grav || 0;
      }
      function ensureGen() { let guard = 0; while (G.z < S.z + FAR + 10 && guard++ < 50) genRow(); }
      ensureGen();

      // ---------- projection ----------
      let PX = 0, PY = 0, PK = 0, PDp = 0;
      function proj(x, y, z) {
        let d = z - (S.z - CAMD);
        PDp = d;
        if (d < 0.35) d = 0.35;
        const b = S.bend * Math.max(0, d * d - CAMD * CAMD) * 0.0022;
        PK = F / d; PX = cx + (x + b - S.camX) * PK; PY = hy + (S.camY - y) * PK;
      }

      // ---------- input ----------
      function act(kind) {
        if (api.ended || S.dead) return;
        hintT = Math.min(hintT, 0.5);
        const grounded = S.y <= 0.0001 && S.vy <= 0;
        if (kind === 'L' || kind === 'R') {
          const nl = U.clamp(S.lane + (kind === 'L' ? -1 : 1), 0, 2);
          if (nl === S.lane) { shake = Math.max(shake, 3); api.sfx('bad'); return; }
          S.lane = nl; api.sfx('tap');
        } else if (kind === 'U') {
          if (grounded && !S.fall) { S.vy = JV; S.slide = 0; S.slideQ = false; api.sfx('drop'); puff(6); }
          else S.jumpBuf = 0.18;
        } else if (kind === 'D') {
          if (grounded) { S.slide = SLIDE_T; api.sfx('pour'); puff(5); }
          else { S.vy = Math.min(S.vy, FFV); S.slideQ = true; S.jumpBuf = 0; api.sfx('tap'); }
        }
      }
      function puff(n) {
        proj(S.x, 0, S.z);
        for (let i = 0; i < n; i++) addPart(PX + (Math.random() - 0.5) * PK * 0.6, PY, (Math.random() - 0.5) * 120, -20 - Math.random() * 60, 0.45, i % 2 ? '#e8d2a8' : '#c9a878', 3 + Math.random() * 4, 60);
      }
      function down(x, y) { gest = { x, y, done: false }; }
      function move(x, y) {
        if (!gest) return;
        const dx = x - gest.x, dy = y - gest.y, th = Math.max(26, Math.min(W, H) * 0.06);
        if (Math.abs(dx) < th && Math.abs(dy) < th) return;
        if (Math.abs(dx) > Math.abs(dy)) act(dx < 0 ? 'L' : 'R'); else act(dy < 0 ? 'U' : 'D');
        gest.x = x; gest.y = y; gest.done = true;
      }
      function up(x, y) { if (gest && !gest.done) move(x, y); gest = null; }

      // ---------- simulation ----------
      function die(msg, o) {
        if (S.dead) return;
        S.dead = true; shake = 16; S.hurt = 0;
        api.sfx('hit'); api.sfx('bad');
        proj(S.x, 1, S.z);
        for (let i = 0; i < 18; i++) addPart(PX, PY, (Math.random() - 0.5) * 360, -Math.random() * 300, 0.8, i % 3 ? '#ffd88a' : '#ff6b4a', 4 + Math.random() * 4, 600);
        banner = { text: o === 'gap' ? '掉下去了！' : '撞到了！', t: 0, col: '#ff6b7a' };
        reportScore();
        api.lose(msg);
      }
      function reportScore() { const sc = Math.floor(S.dist) + S.coins; if (sc !== S.score) { S.score = sc; api.score(sc); } }
      function shieldHit(o) {
        S.shield = 0; S.hurt = 1.0; shake = 10; api.sfx('hit');
        if (o) o.hit = true;
        proj(laneX(o && o.lane >= 0 ? o.lane : S.lane), 0.8, S.z + 0.5);
        for (let i = 0; i < 20; i++) addPart(PX, PY, (Math.random() - 0.5) * 420, -Math.random() * 320, 0.7, i % 2 ? '#7ad8ff' : '#ffffff', 4 + Math.random() * 3, 500);
        banner = { text: '護盾抵擋！', t: 0, col: '#7ad8ff' };
      }

      function update(dt) {
        dt = Math.max(0, dt || 0);
        anim += dt;
        updFx(dt);
        if (S.dead) {
          S.endT += dt;
          if (S.fall) { S.vy -= GRAV * dt; S.y += S.vy * dt; S.z += S.v * 0.3 * dt; }
          return;
        }
        if (api.ended) {
          S.endT += dt;
          S.v = Math.max(0, S.v - dt * 14);
          S.z += S.v * dt; S.run += dt * S.v * 1.2;
          return;
        }
        S.t += dt; hintT -= dt;
        S.v = speedAt(S.dist);
        const z0 = S.z;
        S.dist += S.v * dt; S.z = S.dist;
        S.run += dt * (6 + S.v * 0.55);
        ensureGen();
        // cosmetic bend
        S.bendT += dt * 0.18;
        S.bend = Math.sin(S.bendT) * 0.55 + Math.sin(S.bendT * 2.3 + 1) * 0.2;
        // lane movement
        const tx = laneX(S.lane);
        S.x += U.clamp(tx - S.x, -LANE_V * dt, LANE_V * dt);
        // vertical
        let overGap = null;
        for (let i = 0; i < obs.length; i++) {
          const o = obs[i]; if (o.z > S.z + 1) break;
          if (o.type === 'gap' && S.z - 0.15 >= o.z && S.z + 0.15 <= o.z1) { overGap = o; break; }
        }
        if (S.y > 0 || S.vy > 0 || S.fall) {
          S.vy -= GRAV * dt; S.y += S.vy * dt;
          if (S.y <= 0 && !overGap && !S.fall) {
            S.y = 0; S.vy = 0; puff(4);
            if (S.jumpBuf > 0) { S.vy = JV; S.jumpBuf = 0; api.sfx('drop'); }
            else if (S.slideQ) { S.slide = SLIDE_T; api.sfx('pour'); }
            S.slideQ = false;
          }
        }
        if (overGap && S.y <= 0) {
          if (S.shield > 0 && !S.fall) { shieldHit(overGap); S.y = 0.01; S.vy = JV * 1.05; }
          else { S.fall = true; S.slide = 0; }
        }
        if (S.fall && S.y < -0.6) return die('掉進深淵了…', 'gap');
        S.jumpBuf = Math.max(0, S.jumpBuf - dt);
        if (S.slide > 0) { S.slide -= dt; S.roll += dt * 14; if (S.slide <= 0) S.slide = 0; }
        if (S.hurt > 0) S.hurt = Math.max(0, S.hurt - dt);
        if (S.mag > 0) S.mag = Math.max(0, S.mag - dt);
        if (S.shield > 0) S.shield = Math.max(0, S.shield - dt);
        // collisions
        const top = S.y + (S.slide > 0 ? PHS : PH);
        for (let i = 0; i < obs.length; i++) {
          const o = obs[i];
          if (o.z > S.z + PD + 1) break;
          if (o.z > S.z + PD) continue;
          if (o.hit || o.type === 'gap' || o.z1 < z0 - PD) continue;
          if (Math.abs(S.x - laneX(o.lane)) >= OBW + PW) continue;
          let hit = false;
          if (o.type === 'low') hit = S.y < LOWH;
          else if (o.type === 'high') hit = top > BAR0 && S.y < BAR1;
          else if (o.type === 'wall') hit = S.y < WALLH;
          else if (o.type === 'train') hit = S.y < TRAINH;
          if (!hit) continue;
          if (S.hurt > 0) continue;
          if (S.shield > 0) { shieldHit(o); continue; }
          return die(o.type === 'train' ? '撞上礦車了…' : o.type === 'wall' ? '撞上石牆了…' : o.type === 'low' ? '被柵欄絆倒了…' : '撞到橫木了…', o.type);
        }
        // coins
        for (let i = 0; i < coins.length; i++) {
          const c = coins[i];
          if (c.z > S.z + 14) break;
          if (c.got) { if (c.ft < 1) c.ft += dt * 4; continue; }
          if (c.z < S.z - 2) continue;
          const dz = c.z - S.z;
          if (S.mag > 0 && dz < 11 && dz > -1) { c.x += (S.x - c.x) * Math.min(1, dt * 9); c.y += (S.y + 0.9 - c.y) * Math.min(1, dt * 9); c.z -= Math.max(0, dz) * dt * 6; }
          if (Math.abs(c.z - S.z) < 0.75 && Math.abs(c.x - S.x) < 0.6 && c.y > S.y - 0.3 && c.y < top + 0.3) {
            c.got = true; c.ft = 0; S.coins++;
            proj(c.x, c.y, c.z); c.fx = PX; c.fy = PY;
            for (let k = 0; k < 4; k++) addPart(PX, PY, (Math.random() - 0.5) * 160, -Math.random() * 160, 0.4, k % 2 ? '#fff6b0' : '#ffd23f', 3, 300);
            if (S.coins % 3 === 0) api.sfx('pop');
          }
        }
        for (let i = 0; i < pows.length; i++) {
          const p = pows[i];
          if (p.got || Math.abs(p.z - S.z) > 0.8 || Math.abs(p.x - S.x) > 0.7) continue;
          p.got = true;
          if (p.kind === 'mag') { S.mag = MAG_T; banner = { text: '磁鐵！', t: 0, col: '#ff7ac8' }; }
          else { S.shield = SHIELD_T; banner = { text: '護盾！', t: 0, col: '#7ad8ff' }; }
          api.sfx('good');
          proj(p.x, 0.9, p.z);
          for (let k = 0; k < 14; k++) addPart(PX, PY, (Math.random() - 0.5) * 300, -Math.random() * 260, 0.6, k % 2 ? '#ffffff' : (p.kind === 'mag' ? '#ff7ac8' : '#7ad8ff'), 4, 300);
        }
        // trim old
        while (obs.length && obs[0].z1 < S.z - CAMD - 2) obs.shift();
        while (coins.length && coins[0].z < S.z - CAMD - 2 && (coins[0].got ? coins[0].ft >= 1 : true)) coins.shift();
        while (pows.length && pows[0].z < S.z - CAMD - 2) pows.shift();
        while (rows.length && rows[0].end < S.z - CAMD - 4) rows.shift();
        // dust
        dustT -= dt;
        if (dustT <= 0 && S.y <= 0 && !S.fall) {
          dustT = 0.06;
          proj(S.x, 0, S.z - 0.2);
          addPart(PX + (Math.random() - 0.5) * PK * 0.4, PY, (Math.random() - 0.5) * 50, -10 - Math.random() * 30, 0.35, '#d9bf90', 2 + Math.random() * 3, -20);
        }
        // camera
        S.camX += (S.x * 0.55 - S.camX) * Math.min(1, dt * 8);
        const bob = S.y <= 0 && S.slide <= 0 ? Math.abs(Math.sin(S.run)) * 0.06 : 0;
        S.camY += (CH + S.y * 0.35 - (S.slide > 0 ? 0.25 : 0) + bob - S.camY) * Math.min(1, dt * 10);
        reportScore();
        if (!ENDLESS && S.dist >= GOAL) {
          S.won = true;
          for (let i = 0; i < 80; i++) addPart(Math.random() * W, -10, (Math.random() - 0.5) * 220, Math.random() * 200, 2 + Math.random(), U.PALETTE[i % 9], 6, 260);
          banner = { text: '抵達終點！', t: 0, col: '#ffe27a' };
          api.sfx('good');
          api.win('跑了 ' + GOAL + ' 公尺 · 金幣 ' + S.coins);
          return;
        }
        let info;
        if (hintT > 0) info = '左右滑換跑道 · 上滑跳躍 · 下滑翻滾';
        else if (ENDLESS) info = '距離 ' + Math.floor(S.dist) + ' 公尺 · 金幣 ' + S.coins;
        else info = '距離 ' + Math.floor(S.dist) + ' / ' + GOAL + ' 公尺 · 金幣 ' + S.coins;
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
      }

      function updFx(dt) {
        shake = Math.max(0, shake - dt * 35);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
          p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        }
        if (banner) { banner.t += dt; if (banner.t > 1.4) banner = null; }
      }

      // ---------- drawing (卡通 Q 版) ----------
      function quad(g, x0, x1, z0, z1, y, col) {
        proj(x0, y, z0); const ax = PX, ay = PY;
        proj(x1, y, z0); const bx = PX;
        proj(x1, y, z1); const cxx = PX, cy = PY;
        proj(x0, y, z1); const dx = PX;
        g.fillStyle = col; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, ay); g.lineTo(cxx, cy); g.lineTo(dx, cy); g.closePath(); g.fill();
      }
      function wallQuad(g, x, y0, y1, z0, z1, col) {
        proj(x, y0, z0); const ax = PX, ay = PY;
        proj(x, y1, z0); const by = PY;
        proj(x, y1, z1); const cxx = PX, cy = PY;
        proj(x, y0, z1); const dy = PY;
        g.fillStyle = col; g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax, by); g.lineTo(cxx, cy); g.lineTo(cxx, dy); g.closePath(); g.fill();
      }
      function box(g, x0, x1, y0, y1, z0, z1, cTop, cFront, cSide) {
        const zn = Math.max(z0, S.z - CAMD + 0.5);
        if (z1 <= zn) return;
        proj(x0, y1, zn);
        const lw = Math.max(1, Math.min(3, PK * 0.03));
        g.lineJoin = 'round';
        if (S.camX < x0) { wallQuad(g, x0, y0, y1, zn, z1, cSide); g.lineWidth = lw; g.strokeStyle = OL; g.stroke(); }
        if (S.camX > x1) { wallQuad(g, x1, y0, y1, zn, z1, cSide); g.lineWidth = lw; g.strokeStyle = OL; g.stroke(); }
        if (S.camY > y1) { quad(g, x0, x1, zn, z1, y1, cTop); g.lineWidth = lw; g.strokeStyle = OL; g.stroke(); }
        proj(x0, y1, zn); const ax = PX, ay = PY;
        proj(x1, y0, zn);
        g.fillStyle = cFront; g.fillRect(ax, ay, PX - ax, PY - ay);
        g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(ax + lw, ay + lw, Math.max(0, PX - ax - 2 * lw), (PY - ay) * 0.1);
        g.lineWidth = lw; g.strokeStyle = OL; g.strokeRect(ax, ay, PX - ax, PY - ay);
      }

      const EDGE_X = [-TW - 0.6, -TW, -TW, TW, TW, TW + 0.6];
      const EDGE_Y = [0.9, 0.9, 0, 0, 0.9, 0.9];
      function drawTrack(g) {
        const near = S.z - CAMD + 0.6, far = S.z + FAR;
        const t0 = Math.floor(near / 2) * 2;
        for (let z = Math.floor(far / 2) * 2; z >= t0; z -= 2) {
          const za = Math.max(z, near), zb = Math.min(z + 2, far);
          if (zb <= za) continue;
          const odd = (Math.floor(z / 2) % 2) !== 0;
          quad(g, -TW - 0.6, -TW, za, zb, 0.9, odd ? '#7fc06a' : '#72b45e');
          quad(g, TW, TW + 0.6, za, zb, 0.9, odd ? '#7fc06a' : '#72b45e');
          quad(g, -TW, TW, za, zb, 0, odd ? '#ecc994' : '#e0bb84');
          quad(g, -TW + 0.05, -LANE / 2 - 0.03, za, zb, 0.001, odd ? '#f2d3a2' : '#e6c592');
          quad(g, LANE / 2 + 0.03, TW - 0.05, za, zb, 0.001, odd ? '#f2d3a2' : '#e6c592');
          quad(g, -LANE / 2 - 0.03, -LANE / 2 + 0.03, za, zb, 0.002, '#b98c5e');
          quad(g, LANE / 2 - 0.03, LANE / 2 + 0.03, za, zb, 0.002, '#b98c5e');
          wallQuad(g, -TW, 0, 0.9, za, zb, odd ? '#c49460' : '#b8895a');
          wallQuad(g, TW, 0, 0.9, za, zb, odd ? '#c49460' : '#b8895a');
        }
        g.strokeStyle = 'rgba(90,55,30,0.35)'; g.lineWidth = 1.2;
        g.beginPath();
        for (let z = Math.floor(far / 2) * 2; z >= t0 + 2; z -= 2) {
          if (z <= near) continue;
          proj(-TW, 0, z); g.moveTo(PX, PY); proj(TW, 0, z); g.lineTo(PX, PY);
          proj(-TW, 0, z); const wx = PX, wy = PY; proj(-TW, 0.9, z); g.moveTo(wx, wy); g.lineTo(PX, PY);
          proj(TW, 0, z); const vx = PX, vy = PY; proj(TW, 0.9, z); g.moveTo(vx, vy); g.lineTo(PX, PY);
        }
        g.stroke();
        for (let i = 0; i < obs.length; i++) {
          const o = obs[i];
          if (o.type !== 'gap' || o.z > far || o.z1 < near) continue;
          const za = Math.max(o.z, near);
          quad(g, -TW, TW, za, o.z1, 0.002, '#2a1608');
          proj(-TW, 0, o.z1); const ax = PX, ay = PY;
          proj(TW, -1.2, o.z1);
          const gr = g.createLinearGradient(0, ay, 0, PY);
          gr.addColorStop(0, '#8a5a3c'); gr.addColorStop(1, '#2a1608');
          g.fillStyle = gr; g.fillRect(ax, ay, PX - ax, PY - ay);
          g.lineWidth = Math.max(1.5, Math.min(3, PK * 0.03)); g.strokeStyle = OL;
          g.beginPath(); g.moveTo(ax, ay); g.lineTo(PX, ay); g.stroke();
          wallQuad(g, -TW, -1.2, 0.002, za, o.z1, '#1a0c04');
          wallQuad(g, TW, -1.2, 0.002, za, o.z1, '#1a0c04');
          if (o.z > near) {
            proj(-TW, 0, o.z); const bx0 = PX, by0 = PY; proj(TW, 0, o.z);
            g.lineWidth = Math.max(1.5, Math.min(3, PK * 0.03)); g.strokeStyle = OL;
            g.beginPath(); g.moveTo(bx0, by0); g.lineTo(PX, PY); g.stroke();
          }
        }
        g.strokeStyle = OL; g.lineWidth = 2.5; g.lineJoin = 'round'; g.lineCap = 'round';
        g.beginPath();
        for (let e = 0; e < 6; e++) {
          let first = true;
          for (let z = far; z >= near; z -= 2) {
            proj(EDGE_X[e], EDGE_Y[e], z);
            if (first) { g.moveTo(PX, PY); first = false; } else g.lineTo(PX, PY);
          }
          proj(EDGE_X[e], EDGE_Y[e], near); g.lineTo(PX, PY);
        }
        g.stroke();
        // torches on the side walls
        const tz0 = Math.ceil(near / 9) * 9;
        for (let z = Math.floor(far / 9) * 9; z >= tz0; z -= 9) {
          for (let side = -1; side <= 1; side += 2) {
            proj(side * (TW + 0.1), 1.25, z); if (PDp < 0.8) continue;
            const k = PK, tl = Math.max(0.8, Math.min(2.5, 0.03 * k));
            rrp(g, PX - 0.06 * k, PY, 0.12 * k, 0.42 * k, 0.04 * k); fillStroke(g, '#8a5a3c', tl);
            const fl = 0.85 + 0.15 * Math.sin(anim * 17 + z);
            g.fillStyle = 'rgba(255,170,60,0.25)'; g.beginPath(); g.arc(PX, PY - 0.05 * k, 0.42 * k * fl, 0, TAU); g.fill();
            g.beginPath(); g.moveTo(PX - 0.11 * k, PY); g.quadraticCurveTo(PX - 0.12 * k, PY - 0.2 * k * fl, PX, PY - 0.32 * k * fl); g.quadraticCurveTo(PX + 0.12 * k, PY - 0.2 * k * fl, PX + 0.11 * k, PY); g.closePath();
            fillStroke(g, '#ff9a3a', tl);
            g.fillStyle = '#fff2a8'; g.beginPath(); g.ellipse(PX, PY - 0.07 * k, 0.05 * k, 0.09 * k, 0, 0, TAU); g.fill();
          }
        }
        if (!ENDLESS && GOAL - S.z < FAR && GOAL > near) {
          for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) quad(g, -TW + i * TW / 4, -TW + (i + 1) * TW / 4, GOAL + j * 0.5, GOAL + (j + 1) * 0.5, 0.004, (i + j) % 2 ? '#2a1a14' : '#fff');
          proj(-TW, 3.2, GOAL); const ax = PX, ay = PY;
          proj(TW, 2.6, GOAL);
          if (PDp > 0.8) {
            const lw = Math.max(1.5, Math.min(3.5, (PY - ay) * 0.08));
            rrp(g, ax, ay, PX - ax, PY - ay, 6); fillStroke(g, '#ffcc4d', lw);
            g.fillStyle = 'rgba(255,255,255,0.4)'; rrp(g, ax + lw * 2, ay + lw * 1.5, PX - ax - lw * 4, (PY - ay) * 0.2, 3); g.fill();
            const ts = Math.max(9, Math.min(40, (PY - ay) * 0.75));
            otext(g, '終點', (ax + PX) / 2, (ay + PY) / 2, ts, '#ffffff', 'center', Math.max(2, ts * 0.2));
          }
        }
      }

      function drawObstacle(g, o) {
        const x = laneX(o.lane);
        if (o.hit) return;
        if (o.type === 'low') {
          box(g, x - OBW, x + OBW, 0, LOWH, o.z, o.z1, '#e0ad66', '#b8743a', '#8a4f20');
          proj(x - OBW, LOWH * 0.75, Math.max(o.z, S.z - CAMD + 0.5)); const ax = PX, ay = PY;
          proj(x + OBW, LOWH * 0.45, Math.max(o.z, S.z - CAMD + 0.5));
          if (PDp > 0.5) {
            const w = PX - ax, n = 4;
            g.lineJoin = 'round'; g.lineWidth = Math.max(1, Math.min(2.5, PK * 0.025));
            for (let i = 0; i < n; i++) { g.beginPath(); g.moveTo(ax + w * i / n, PY); g.lineTo(ax + w * (i + 0.5) / n, ay); g.lineTo(ax + w * (i + 1) / n, PY); g.closePath(); fillStroke(g, '#ffd23f', g.lineWidth); }
          }
        } else if (o.type === 'high') {
          box(g, x - OBW, x - OBW + 0.12, 0, BAR1, o.z, o.z1, '#8a6038', '#6b4a2e', '#4a2e18');
          box(g, x + OBW - 0.12, x + OBW, 0, BAR1, o.z, o.z1, '#8a6038', '#6b4a2e', '#4a2e18');
          box(g, x - OBW - 0.05, x + OBW + 0.05, BAR0, BAR1, o.z, o.z1, '#ff8a6a', '#e0473a', '#a8302a');
          proj(x - OBW, BAR1, Math.max(o.z, S.z - CAMD + 0.5)); const ax = PX, ay = PY;
          proj(x + OBW, BAR0, Math.max(o.z, S.z - CAMD + 0.5));
          if (PDp > 0.5) {
            const w = PX - ax, lw = Math.max(1, Math.min(3, PK * 0.03)); g.fillStyle = '#ffffff';
            for (let i = 0; i < 3; i++) g.fillRect(ax + w * (0.12 + i * 0.3), ay + lw / 2, w * 0.14, PY - ay - lw);
          }
        } else if (o.type === 'wall') {
          box(g, x - OBW, x + OBW, 0, WALLH, o.z, o.z1, '#c9bfae', '#a89c88', '#7a7062');
          proj(x, WALLH * 0.55, Math.max(o.z, S.z - CAMD + 0.5));
          if (PDp > 0.5) {
            const k = PK, lw = Math.max(1, Math.min(3, k * 0.03));
            g.strokeStyle = 'rgba(42,26,20,0.45)'; g.lineWidth = lw * 0.7;
            g.beginPath(); g.moveTo(PX - 0.47 * k, PY - 0.6 * k); g.lineTo(PX + 0.47 * k, PY - 0.6 * k); g.moveTo(PX - 0.47 * k, PY + 0.45 * k); g.lineTo(PX + 0.47 * k, PY + 0.45 * k); g.stroke();
            rrp(g, PX - 0.34 * k, PY - 0.28 * k, 0.24 * k, 0.18 * k, 0.06 * k); fillStroke(g, '#5e554a', lw);
            rrp(g, PX + 0.1 * k, PY - 0.28 * k, 0.24 * k, 0.18 * k, 0.06 * k); fillStroke(g, '#5e554a', lw);
            g.globalAlpha = 0.6 + 0.4 * Math.sin(anim * 6 + o.z);
            ell(g, PX - 0.22 * k, PY - 0.19 * k, 0.07 * k, 0.05 * k, '#ff6a3a', 0); ell(g, PX + 0.22 * k, PY - 0.19 * k, 0.07 * k, 0.05 * k, '#ff6a3a', 0);
            g.globalAlpha = 1;
            rrp(g, PX - 0.24 * k, PY + 0.1 * k, 0.48 * k, 0.16 * k, 0.05 * k); fillStroke(g, '#5e554a', lw);
            g.fillStyle = '#f2ead8';
            for (let t = 0; t < 4; t++) g.fillRect(PX - 0.2 * k + t * 0.11 * k, PY + 0.1 * k + lw / 2, 0.07 * k, 0.06 * k);
          }
        } else if (o.type === 'train') {
          box(g, x - OBW, x + OBW, 0.15, TRAINH, o.z, o.z1, '#6a5f56', '#c0553a', '#8a3a28');
          const zn = Math.max(o.z, S.z - CAMD + 0.5);
          if (o.z1 > zn) quad(g, x - OBW + 0.08, x + OBW - 0.08, zn, o.z1 - 0.1, TRAINH + 0.01, '#3a3430');
          proj(x - OBW, TRAINH, zn); const ax = PX, ay = PY;
          proj(x + OBW, 0.15, zn);
          if (PDp > 0.5 && o.z >= S.z - CAMD + 0.5) {
            const w = PX - ax, h = PY - ay, lw = Math.max(1, Math.min(3, PK * 0.03));
            rrp(g, ax + w * 0.1, ay + h * 0.12, w * 0.8, h * 0.3, w * 0.06); fillStroke(g, '#4a2a1e', lw);
            g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(ax + w * 0.15, ay + h * 0.15, w * 0.25, h * 0.05);
            g.globalAlpha = 0.75 + 0.25 * Math.sin(anim * 8);
            ell(g, ax + w * 0.25, ay + h * 0.62, w * 0.1, w * 0.1, '#ffe680', lw);
            ell(g, ax + w * 0.75, ay + h * 0.62, w * 0.1, w * 0.1, '#ffe680', lw);
            g.globalAlpha = 1;
            g.fillStyle = '#e8e2d0'; g.fillRect(ax + lw / 2, ay + h * 0.84, w - lw, h * 0.07);
          }
          for (let zz = Math.ceil((o.z + 0.4) / 3) * 3; zz < o.z1 - 0.3; zz += 3) {
            if (zz < S.z - CAMD + 0.6) continue;
            const sx = S.camX < x - OBW ? x - OBW : S.camX > x + OBW ? x + OBW : null;
            if (sx === null) continue;
            proj(sx, 0.15, zz); const wx = PX, wy = PY, k = PK;
            proj(sx, TRAINH, zz);
            g.strokeStyle = OL; g.lineWidth = Math.max(1, 0.04 * k);
            g.beginPath(); g.moveTo(wx, wy); g.lineTo(PX, PY); g.stroke();
            ell(g, wx, wy, 0.18 * k, 0.18 * k, '#2d2d33', Math.max(1, Math.min(2.5, 0.03 * k)));
          }
        }
      }

      function drawPow(g, p) {
        if (p.got) return;
        proj(p.x, 0.9 + Math.sin(anim * 3 + p.z) * 0.12, p.z); if (PDp < 0.6) return;
        const r = 0.36 * PK, lw = Math.max(1, Math.min(3, r * 0.12));
        const col = p.kind === 'mag' ? '#ff7ac8' : '#5ac8ff';
        g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(PX, PY, r * 1.35, 0, TAU); g.fill();
        ell(g, PX, PY, r, r, col, lw);
        g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(PX - r * 0.35, PY - r * 0.4, r * 0.3, r * 0.18, -0.5, 0, TAU); g.fill();
        U.text(g, p.kind === 'mag' ? '🧲' : '🛡️', PX, PY + 1, Math.max(8, r * 1.1), '#fff', 'center', 900);
      }

      function zOf(o) { return o.type === 'train' && o.z < S.z ? o.z1 : o.z; }

      function draw(g) {
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        drawBackground(g, W, H, hy, anim, S.bend, U);
        drawTrack(g);
        dl.length = 0;
        const zmin = S.z - CAMD + 0.5, zmax = S.z + FAR;
        for (let i = 0; i < obs.length; i++) { const o = obs[i]; if (o.type !== 'gap' && o.z1 > zmin && o.z < zmax) dl.push(o); }
        for (let i = 0; i < coins.length; i++) { const c = coins[i]; if (!c.got && c.z > zmin && c.z < zmax) dl.push(c); }
        for (let i = 0; i < pows.length; i++) { const p = pows[i]; if (!p.got && p.z > zmin && p.z < zmax) dl.push(p); }
        dl.sort((a, b) => zOf(b) - zOf(a));
        let heroDone = false;
        for (let i = 0; i < dl.length; i++) {
          const o = dl[i];
          if (!heroDone && zOf(o) < S.z) { drawPlayer(g); heroDone = true; }
          if (o.kind) drawPow(g, o);
          else if (o.ft !== undefined) {
            proj(o.x, o.y + Math.sin(anim * 4 + o.z) * 0.05, o.z); if (PDp < 0.6) continue;
            drawCoin(g, PX, PY, 0.22 * PK, anim * 5 + o.z * 0.7);
            if (((anim * 3 + o.z) % 4) < 0.25) { g.fillStyle = '#ffffff'; star(g, PX + 0.12 * PK, PY - 0.12 * PK, 0.09 * PK); g.fill(); }
          } else drawObstacle(g, o);
        }
        if (!heroDone) drawPlayer(g);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.5); g.fillStyle = p.col;
          g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        g.globalAlpha = 1;
        for (let i = 0; i < coins.length; i++) {
          const c = coins[i]; if (!c.got || c.ft >= 1) continue;
          const t = U.easeOutCubic(Math.min(1, c.ft));
          drawCoin(g, U.lerp(c.fx, 30, t), U.lerp(c.fy, 58, t), 7 * (1 - t * 0.3), anim * 9);
        }
        drawSpeedLines(g);
        g.restore();
        drawHud(g);
      }

      function drawPlayer(g) {
        proj(S.x, Math.max(-3, S.y), S.z);
        const fx = PX, fy = PY, k = PK;
        proj(S.x, 0, S.z);
        const st = heroSt;
        st.run = S.run; st.slide = S.slide > 0 && !S.dead; st.air = S.y > 0.05; st.roll = S.roll; st.hurt = S.hurt;
        st.shadowY = PY; st.shadowK = S.fall ? 0 : Math.max(0.3, 1 - S.y * 0.35);
        if (S.dead && !S.fall) {
          g.save(); g.translate(fx, fy); g.rotate(-Math.min(1.3, S.endT * 6)); g.translate(-fx, -fy);
          drawHero(g, fx, fy, k, st, U); g.restore();
        } else drawHero(g, fx, fy, k, st, U);
        if (S.shield > 0) {
          g.globalAlpha = S.shield < 2 ? 0.3 + 0.3 * Math.sin(anim * 20) : 0.45;
          g.fillStyle = 'rgba(140,220,255,0.35)';
          g.beginPath(); g.arc(fx, fy - 0.9 * k, 1.15 * k, 0, TAU); g.fill();
          g.lineWidth = Math.max(2, 0.05 * k); g.strokeStyle = '#e8fbff'; g.stroke();
          g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(fx - 0.5 * k, fy - 1.5 * k, 0.25 * k, 0.12 * k, -0.6, 0, TAU); g.fill();
          g.globalAlpha = 1;
        }
        if (S.mag > 0) {
          g.strokeStyle = 'rgba(255,122,200,' + (0.35 + 0.25 * Math.sin(anim * 12)) + ')'; g.lineWidth = 2.5;
          const r = (0.8 + (anim * 2 % 1) * 1.2) * k;
          g.beginPath(); g.ellipse(fx, fy - 0.2 * k, r, r * 0.3, 0, 0, TAU); g.stroke();
        }
      }
      const heroSt = { run: 0, slide: false, air: false, roll: 0, hurt: 0, shadowY: 0, shadowK: 1 };

      function drawSpeedLines(g) {
        const f = U.clamp((S.v - 10) / 12, 0, 1);
        if (f <= 0.02 || S.dead) return;
        const vx = cx, vy = hy;
        const R = Math.hypot(W, H);
        g.strokeStyle = 'rgba(255,255,255,' + (0.12 + 0.25 * f) + ')';
        g.lineWidth = 1.5;
        g.beginPath();
        for (let i = 0; i < lines.length; i++) {
          const l = lines[i];
          const ph = (anim * l.sp * (1 + f * 2) + l.r) % 1;
          const r0 = R * (0.35 + ph * 0.6), r1 = r0 + R * (0.06 + 0.12 * f);
          const ca = Math.cos(l.a), sa = Math.sin(l.a);
          g.moveTo(vx + ca * r0, vy + sa * r0 * 0.9); g.lineTo(vx + ca * r1, vy + sa * r1 * 0.9);
        }
        g.stroke();
      }

      function pill(g, x, y, w, h, txt, col, size) {
        rrp(g, x, y, w, h, h / 2); g.fillStyle = 'rgba(42,26,20,0.72)'; g.fill();
        g.lineWidth = 2; g.strokeStyle = 'rgba(255,230,170,0.4)'; g.stroke();
        otext(g, txt, x + w / 2, y + h / 2 + 1, size, col, 'center', 3);
      }
      function drawHud(g) {
        const pad = 10;
        rrp(g, pad, pad + 32, 92, 30, 15); g.fillStyle = 'rgba(42,26,20,0.72)'; g.fill();
        g.lineWidth = 2; g.strokeStyle = 'rgba(255,230,170,0.4)'; g.stroke();
        drawCoin(g, pad + 18, pad + 47, 9, anim * 4);
        otext(g, String(S.coins), pad + 58, pad + 48, 17, '#ffe27a', 'center', 3);
        pill(g, pad, pad, 92, 28, Math.floor(S.dist) + ' m', '#ffffff', 16);
        if (ENDLESS) {
          const sc = Math.floor(S.dist) + S.coins;
          otext(g, String(sc), W - pad - 4, pad + 16, 24, '#ffffff', 'right', 4);
          otext(g, '最高 ' + Math.max(api.best || 0, sc), W - pad - 4, pad + 40, 12, '#ffe27a', 'right', 3);
        } else {
          const bw = Math.min(170, W - 150), bx = W - pad - bw, by = pad + 8;
          rrp(g, bx, by, bw, 13, 6.5); g.fillStyle = 'rgba(42,26,20,0.5)'; g.fill();
          rrp(g, bx, by, Math.max(13, bw * Math.min(1, S.dist / GOAL)), 13, 6.5); g.fillStyle = '#ffcc4d'; g.fill();
          g.fillStyle = 'rgba(255,255,255,0.5)'; rrp(g, bx + 4, by + 2.5, Math.max(5, bw * Math.min(1, S.dist / GOAL) - 8), 3, 1.5); g.fill();
          rrp(g, bx, by, bw, 13, 6.5); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
          U.text(g, '🏁', bx + bw - 2, by + 24, 13, '#fff', 'center', 900);
        }
        let px = pad;
        if (S.mag > 0) { pill(g, px, pad + 68, 64, 24, '🧲 ' + Math.ceil(S.mag), '#ffd0ea', 13); px += 70; }
        if (S.shield > 0) pill(g, px, pad + 68, 64, 24, '🛡️ ' + Math.ceil(S.shield), '#c8f0ff', 13);
        if (banner) {
          const k = Math.min(1, banner.t / 0.3);
          g.globalAlpha = banner.t > 1 ? Math.max(0, 1 - (banner.t - 1) / 0.4) : 1;
          const sz = Math.min(42, W / 8) * U.easeOutBack(k);
          otext(g, banner.text, cx, H * 0.3, Math.max(1, sz), banner.col, 'center', 7);
          g.globalAlpha = 1;
        }
        if (hintT > 0 && !api.ended) {
          g.globalAlpha = Math.min(1, hintT);
          const ph = (anim * 0.8) % 4, k = (anim * 0.8 % 1);
          const dirs = [[-1, 0, '換道'], [1, 0, '換道'], [0, -1, '跳躍'], [0, 1, '翻滾']];
          const d = dirs[Math.floor(ph)];
          const hx = cx + d[0] * 60 * k, hyy = H * 0.62 + d[1] * 50 * k;
          U.text(g, '👆', hx, hyy, 34, '#fff', 'center', 900);
          otext(g, d[2], cx, H * 0.62 - 70, 20, '#ffffff', 'center', 4);
          g.globalAlpha = 1;
        }
      }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _s: S, _k: { rows, obs, act, laneX, speedAt, GOAL, LANE, JV, GRAV, PD, OBW, PW, LOWH, BAR0, SLIDE_T },
      };
    },
  });
})();
