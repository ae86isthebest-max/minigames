// 別踩白塊 — Piano Tiles: tap the black tiles in order before they leave the screen, never the white.
(function () {
  'use strict';

  const COLS = 4;
  const MELODIES = [
    { name: '歡樂頌', n: [64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62, 64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 62, 60, 60, 62, 62, 64, 60, 62, 64, 65, 64, 60, 62, 64, 65, 64, 62, 60, 62, 55] },
    { name: '小星星', n: [60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60, 67, 67, 65, 65, 64, 64, 62, 67, 67, 65, 65, 64, 64, 62, 60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60] },
    { name: '卡農', n: [78, 76, 74, 73, 71, 69, 71, 73, 74, 73, 71, 69, 67, 66, 67, 64, 62, 66, 69, 67, 66, 62, 66, 64, 62, 59, 62, 69, 67, 71, 69, 67] },
    { name: '給愛麗絲', n: [76, 75, 76, 75, 76, 71, 74, 72, 69, 60, 64, 69, 71, 64, 68, 71, 72, 64, 76, 75, 76, 75, 76, 71, 74, 72, 69, 60, 64, 69, 71, 64, 72, 71, 69] },
  ];

  // ---------- tiny piano synth (respects the shell's mute button) ----------
  let AC = null;
  function soundOn() {
    try {
      if (typeof location !== 'undefined' && /(^|[?&])mute/.test(location.search || '')) return false;
      const b = typeof document !== 'undefined' && document.getElementById ? document.getElementById('muteBtn') : null;
      if (b && b.textContent === '🔇') return false;
      return true;
    } catch (e) { return false; }
  }
  function note(midi, dur, vol) {
    if (!soundOn()) return;
    try {
      const Ctx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (!Ctx) return;
      if (!AC) AC = new Ctx();
      if (AC.state === 'suspended') AC.resume();
      const t0 = AC.currentTime, f = 440 * Math.pow(2, (midi - 69) / 12);
      const gn = AC.createGain(), lp = AC.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(Math.min(6000, f * 6), t0); lp.frequency.exponentialRampToValueAtTime(Math.max(300, f * 1.5), t0 + dur);
      gn.gain.setValueAtTime(0.0001, t0);
      gn.gain.exponentialRampToValueAtTime(vol, t0 + 0.006);
      gn.gain.exponentialRampToValueAtTime(vol * 0.35, t0 + 0.18);
      gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      lp.connect(gn); gn.connect(AC.destination);
      const types = ['triangle', 'sine', 'sine'], mul = [1, 2, 3], vols = [1, 0.35, 0.12];
      for (let i = 0; i < 3; i++) {
        const o = AC.createOscillator(), og = AC.createGain();
        o.type = types[i]; o.frequency.setValueAtTime(f * mul[i], t0);
        og.gain.setValueAtTime(vols[i], t0);
        o.connect(og); og.connect(lp);
        o.start(t0); o.stop(t0 + dur + 0.05);
      }
    } catch (e) {}
  }

  // ---------- difficulty ----------
  function tune(d, L, endless) {
    const Le = Math.min(L - 1, 50);
    if (endless) return { v0: 4.2, acc: 0.01, vmax: 8.2, hold: 0.16, dbl: 0.08, goal: 0 };
    if (d === 0) return { v0: Math.min(3.0, 2.0 + Le * 0.025), acc: 0.012, vmax: Math.min(4.4, 3.2 + Le * 0.03), hold: 0, dbl: 0, goal: Math.min(120, 30 + Le * 3) };
    if (d === 1) return { v0: Math.min(4.2, 3.2 + Le * 0.025), acc: 0.015, vmax: Math.min(6.2, 4.8 + Le * 0.035), hold: Math.min(0.16, 0.08 + Le * 0.002), dbl: L >= 6 ? 0.04 : 0, goal: Math.min(160, 50 + Le * 4) };
    return { v0: Math.min(5.6, 4.6 + Le * 0.025), acc: 0.018, vmax: Math.min(7.6, 6.4 + Le * 0.03), hold: Math.min(0.2, 0.14 + Le * 0.002), dbl: Math.min(0.12, 0.08 + Le * 0.002), goal: Math.min(220, 70 + Le * 5) };
  }

  // ---------- art (swap-friendly) — v4 卡通 Q 版: cartoon keys on an illustrated concert stage ----------
  const OL = '#2a1a14';
  const FONT = 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
  function ink(g, lw) { g.lineWidth = lw; g.strokeStyle = OL; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
  function oText(g, s, x, y, size, col, align) {
    g.font = '900 ' + size + FONT; g.textAlign = align || 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.lineWidth = Math.max(2.5, size * 0.22); g.strokeStyle = OL; g.strokeText(s, x, y);
    g.fillStyle = col; g.fillText(s, x, y);
  }
  let stageCache = null, stageKey = '';
  function paintStage(g, W, H, U) {
    // back wall
    const wall = g.createLinearGradient(0, 0, 0, H);
    wall.addColorStop(0, '#3a1636'); wall.addColorStop(0.6, '#5a2448'); wall.addColorStop(1, '#3a1636');
    g.fillStyle = wall; g.fillRect(0, 0, W, H);
    // wall panels
    g.strokeStyle = 'rgba(255,200,230,0.12)'; g.lineWidth = 2;
    for (let x = W * 0.12; x < W * 0.9; x += W * 0.19) { U.rr(g, x, H * 0.16, W * 0.15, H * 0.5, 10); g.stroke(); }
    // wooden stage floor
    const fy = H * 0.8;
    g.fillStyle = '#c98a4e'; g.fillRect(0, fy, W, H - fy);
    g.strokeStyle = 'rgba(90,45,20,0.45)'; g.lineWidth = 2;
    for (let i = 1; i < 6; i++) { const y = fy + (H - fy) * (i / 6) * (i / 6) * 1.0; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(W / 2 + i * W * 0.06, fy); g.lineTo(W / 2 + i * W * 0.2, H); g.stroke(); }
    g.beginPath(); g.moveTo(0, fy); g.lineTo(W, fy); ink(g, 3);
    // cartoon grand piano at the back of the stage
    const px = W * 0.5, py = fy, s = Math.min(W, H) / 390;
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(px, py + 4 * s, 90 * s, 10 * s, 0, 0, 6.283); g.fill();
    g.beginPath(); g.rect(px - 62 * s, py - 46 * s, 7 * s, 46 * s); g.rect(px + 50 * s, py - 46 * s, 7 * s, 46 * s); g.fillStyle = '#1e1a2a'; g.fill(); ink(g, 2.5);
    g.beginPath(); g.moveTo(px - 75 * s, py - 46 * s); g.lineTo(px + 40 * s, py - 46 * s); g.quadraticCurveTo(px + 80 * s, py - 46 * s, px + 78 * s, py - 66 * s);
    g.lineTo(px - 75 * s, py - 66 * s); g.closePath(); g.fillStyle = '#26203a'; g.fill(); ink(g, 3);
    g.beginPath(); g.moveTo(px - 70 * s, py - 66 * s); g.lineTo(px + 60 * s, py - 130 * s); g.lineTo(px + 66 * s, py - 122 * s); g.lineTo(px - 60 * s, py - 66 * s); g.closePath();
    g.fillStyle = '#322a4a'; g.fill(); ink(g, 3);
    g.beginPath(); g.moveTo(px + 20 * s, py - 66 * s); g.lineTo(px + 50 * s, py - 112 * s); ink(g, 2);
    g.beginPath(); g.rect(px - 75 * s, py - 58 * s, 52 * s, 9 * s); g.fillStyle = '#fffaf0'; g.fill(); ink(g, 2);
    g.fillStyle = OL; for (let k = 0; k < 6; k++) g.fillRect(px - 70 * s + k * 8 * s, py - 58 * s, 3.5 * s, 5 * s);
    g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(px - 60 * s, py - 64 * s, 90 * s, 3 * s);
    // side curtains with folds
    const cwid = W * 0.13;
    for (const side of [0, 1]) {
      const x0 = side ? W - cwid : 0, dir = side ? -1 : 1;
      g.beginPath(); g.moveTo(side ? W : 0, 0); g.lineTo(x0 + (side ? 0 : cwid), 0);
      g.quadraticCurveTo(x0 + (side ? 0 : cwid) - dir * cwid * 0.15, H * 0.5, x0 + (side ? 0 : cwid) - dir * cwid * 0.55, H * 0.82);
      g.lineTo(side ? W : 0, H * 0.84); g.closePath();
      g.fillStyle = '#c8283c'; g.fill(); ink(g, 3);
      g.strokeStyle = 'rgba(90,10,25,0.55)'; g.lineWidth = 3;
      for (let k = 1; k < 3; k++) { const fx = (side ? W : 0) + dir * cwid * k * 0.3; g.beginPath(); g.moveTo(fx, 0); g.quadraticCurveTo(fx + dir * 4, H * 0.45, fx - dir * cwid * 0.1 * k, H * 0.8); g.stroke(); }
      g.fillStyle = '#ffcc4d'; g.beginPath(); g.ellipse(x0 + (side ? cwid * 0.35 : cwid * 0.65), H * 0.5, 9, 5, 0, 0, 6.283); g.fill(); ink(g, 2);
    }
    // top valance (scalloped) + gold fringe
    const vh = H * 0.075, n = 7, sw = W / n;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, vh);
    for (let i = n - 1; i >= 0; i--) g.quadraticCurveTo(i * sw + sw / 2, vh + sw * 0.45, i * sw, vh);
    g.closePath(); g.fillStyle = '#d9344a'; g.fill(); ink(g, 3);
    g.strokeStyle = '#ffcc4d'; g.lineWidth = 3;
    g.beginPath(); for (let i = 0; i < n; i++) { g.moveTo(i * sw + 4, vh + 3); g.quadraticCurveTo(i * sw + sw / 2, vh + sw * 0.45 - 4, i * sw + sw - 4, vh + 3); } g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, vh * 0.25, W, vh * 0.18);
    // footlights
    for (let i = 0; i < 9; i++) {
      const lx = W * (0.08 + i * 0.105), ly = fy + 6;
      g.fillStyle = 'rgba(255,230,140,0.35)'; g.beginPath(); g.arc(lx, ly, 9, 0, 6.283); g.fill();
      g.beginPath(); g.arc(lx, ly, 4.5, 0, 6.283); g.fillStyle = '#ffe27a'; g.fill(); ink(g, 1.8);
    }
  }
  function drawBackground(g, W, H, cw, th, pos, U, t) {
    const dpr = Math.min(3, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    const key = W + 'x' + H + '@' + dpr;
    if (key !== stageKey) {
      stageKey = key; stageCache = null;
      try {
        const cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(W * dpr)); cv.height = Math.max(1, Math.round(H * dpr));
        const c2 = cv.getContext('2d');
        c2.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintStage(c2, W, H, U);
        stageCache = cv;
      } catch (e) { stageCache = null; }
    }
    if (stageCache) g.drawImage(stageCache, 0, 0, W, H); else paintStage(g, W, H, U);
    // swaying spotlight beams
    for (let i = 0; i < 2; i++) {
      const sx0 = i ? W * 0.82 : W * 0.18, sw = Math.sin(t * 0.6 + i * 2) * W * 0.12;
      g.fillStyle = 'rgba(255,240,190,0.13)';
      g.beginPath(); g.moveTo(sx0 - 10, 0); g.lineTo(sx0 + 10, 0); g.lineTo(W / 2 + sw + W * 0.2, H); g.lineTo(W / 2 + sw - W * 0.2, H); g.closePath(); g.fill();
    }
    // ivory lanes (the "white tiles") over the stage
    g.fillStyle = 'rgba(255,249,236,0.58)'; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(42,26,20,0.5)';
    for (let c = 1; c < COLS; c++) g.fillRect(Math.round(c * cw) - 1.25, 0, 2.5, H);
    g.fillStyle = 'rgba(42,26,20,0.16)';
    const off = (pos % 1) * th;
    for (let y = H + off; y > -th; y -= th) g.fillRect(0, Math.round(y) - 1, W, 2);
  }
  function drawTile(g, x, y, w, h, state, U, t) {
    // state: 0 pending, 1 tapped (fade t 0..1), 2 missed/wrong flash
    const m = 3, r = 10, lw = 3;
    if (state === 1) {
      const a = Math.max(0, 1 - t * 1.6);
      g.globalAlpha *= 0.55 + 0.45 * a;
      U.rr(g, x + m, y + m, w - m * 2, h - m * 2, r); g.fillStyle = '#c9c3d8'; g.fill();
      g.fillStyle = 'rgba(255,255,255,0.45)'; U.rr(g, x + m + 6, y + m + 5, w - m * 2 - 12, 7, 3.5); g.fill();
      U.rr(g, x + m, y + m, w - m * 2, h - m * 2, r); ink(g, 2);
      g.globalAlpha = 1;
      return;
    }
    if (state === 2) {
      U.rr(g, x + m, y + m, w - m * 2, h - m * 2, r); g.fillStyle = Math.floor(t * 8) % 2 ? '#ff4d5e' : '#ff8a96'; g.fill(); ink(g, lw);
      const k = Math.min(16, w * 0.16);
      g.beginPath(); g.moveTo(x + w / 2 - k, y + h / 2 - k); g.lineTo(x + w / 2 + k, y + h / 2 + k); g.moveTo(x + w / 2 + k, y + h / 2 - k); g.lineTo(x + w / 2 - k, y + h / 2 + k);
      ink(g, 9); g.lineWidth = 4.5; g.strokeStyle = '#ffffff'; g.stroke();
      return;
    }
    // chunky cartoon key: dark body, bottom lip, gloss strip, thick outline
    U.rr(g, x + m, y + m, w - m * 2, h - m * 2, r); g.fillStyle = '#1c1830'; g.fill();
    U.rr(g, x + m, y + m, w - m * 2, h - m * 2 - 8, r); g.fillStyle = '#3a3560'; g.fill();
    g.fillStyle = 'rgba(255,255,255,0.28)'; U.rr(g, x + m + 7, y + m + 6, w - m * 2 - 14, 8, 4); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.12)'; U.rr(g, x + m + 7, y + m + 18, 6, Math.max(4, h - m * 2 - 40), 3); g.fill();
    U.rr(g, x + m, y + m, w - m * 2, h - m * 2, r); ink(g, lw);
    if (h > 60) U.text(g, '♪', x + w / 2, y + h - 30, Math.min(22, w * 0.24), 'rgba(255,255,255,0.22)', 'center', 900);
  }

  MG.register({
    id: 'piano', name: '別踩白塊', icon: '🎹', color: '#5560c8', endless: true,
    create(api) {
      const U = api.util, L = api.level, rng = api.rng, DIFF = api.diff || 0, ENDLESS = !!api.endless;
      const T = tune(DIFF, L, ENDLESS);
      const MEL = MELODIES[(L - 1 + DIFF + (ENDLESS ? Math.floor(rng() * 4) : 0)) % MELODIES.length];
      let W, H, cw, th;
      function layout() { W = api.W; H = api.H; cw = W / COLS; th = Math.max(60, H / 4); }
      layout();

      // ---------- tiles (lazy) ----------
      const tiles = [];
      const G = { p: 1, prev: -1, n: 0, rows: 0, lastDbl: -9 };
      function genRow() {
        const p = G.p;
        let c = Math.floor(rng() * COLS);
        if (c === G.prev && rng() < 0.75) c = (c + 1 + Math.floor(rng() * (COLS - 1))) % COLS;
        if (G.rows === 0) {
          tiles.push({ c, p, len: 1, done: false, t: 0, hold: false, hp: 0, start: true, row: G.rows, mi: 0 });
          G.prev = c; G.p += 1; G.rows++; return;
        }
        const r = rng();
        if (G.rows > 3 && r < T.hold) {
          const len = 2 + (rng() < 0.4 ? 1 : 0);
          tiles.push({ c, p, len, done: false, t: 0, hold: true, hp: 0, row: G.rows, mi: 0 });
          G.prev = c; G.p += len;
        } else if (G.rows > 3 && r < T.hold + T.dbl && G.rows - G.lastDbl >= 4) {
          G.lastDbl = G.rows;
          let c2 = (c + 1 + Math.floor(rng() * (COLS - 1))) % COLS;
          tiles.push({ c, p, len: 1, done: false, t: 0, hold: false, hp: 0, row: G.rows, mi: 0 });
          tiles.push({ c: c2, p, len: 1, done: false, t: 0, hold: false, hp: 0, row: G.rows, mi: 1 });
          G.prev = c2; G.p += 1;
        } else {
          tiles.push({ c, p, len: 1, done: false, t: 0, hold: false, hp: 0, row: G.rows, mi: 0 });
          G.prev = c; G.p += 1;
        }
        G.rows++;
      }
      function ensureGen(upto) { let guard = 0; while (G.p < upto && guard++ < 50) { if (!ENDLESS && G.rows >= T.goal) break; genRow(); } }
      ensureGen(8);

      // ---------- state ----------
      const S = {
        pos: 0, v: 0, started: false, wait: 2.6, count: 0, rowsDone: 0, mel: 0, dead: false, deadT: 0, won: false,
        holdTile: null, back: 0, wrong: null, best: api.best || 0,
      };
      let anim = 0, lastInfo = '', banner = null, shake = 0;
      const parts = []; for (let i = 0; i < 160; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 3, grav: 0, ch: '' });
      let pCur = 0;
      const ripples = []; for (let i = 0; i < 8; i++) ripples.push({ on: false, x: 0, y: 0, t: 0 });
      let rI = 0;
      function addPart(x, y, vx, vy, life, col, size, grav, ch) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size; p.grav = grav || 0; p.ch = ch || '';
      }

      function tileY(tl) { return H - (tl.p - S.pos) * th; }
      function nextRowTiles() {
        let minP = Infinity;
        for (let i = 0; i < tiles.length; i++) { const tl = tiles[i]; if (!tl.done && tl.p < minP) minP = tl.p; }
        return minP;
      }
      function playNote(tl) {
        const m = MEL.n[S.mel % MEL.n.length];
        if (tl.mi === 0) S.mel++;
        const midi = tl.mi === 1 ? m - 4 : m;
        note(midi, tl.hold ? 1.6 : 1.1, tl.mi === 1 ? 0.12 : 0.2);
      }

      // ---------- input ----------
      function down(x, y) {
        if (api.ended || S.dead) return;
        const c = U.clamp(Math.floor(x / cw), 0, COLS - 1);
        const minP = nextRowTiles();
        let hit = null, any = null;
        for (let i = 0; i < tiles.length; i++) {
          const tl = tiles[i];
          if (tl.c !== c) continue;
          const yb = tileY(tl), yt = yb - tl.len * th;
          if (y < yt - 12 || y > yb + 12) continue;
          any = tl;
          if (!tl.done && tl.p === minP) { hit = tl; break; }
        }
        if (hit) {
          hit.done = true; hit.t = 0;
          if (!S.started) { S.started = true; S.wait = 0; }
          S.count++; api.score(S.count);
          playNote(hit);
          if (hit.hold) { S.holdTile = hit; hit.hp = 0; hit.fy = U.clamp(y, tileY(hit) - hit.len * th + 4, tileY(hit)); }
          const r = ripples[rI]; rI = (rI + 1) % ripples.length; r.on = true; r.x = x; r.y = y; r.t = 0;
          const cxx = (hit.c + 0.5) * cw, cyy = tileY(hit) - th * 0.5;
          for (let k = 0; k < 4; k++) addPart(cxx + (Math.random() - 0.5) * cw * 0.6, cyy, (Math.random() - 0.5) * 120, -60 - Math.random() * 120, 0.5, '#2c3150', 4 + Math.random() * 3, 400);
          if (S.count % 10 === 0) addPart(cxx, cyy - 20, 0, -70, 0.9, '#5560c8', 22, 0, '♪');
          if (!ENDLESS && S.count >= T.goal) return winNow();
          return;
        }
        if (any) return;
        // white tile
        S.wrong = { c, t: 0, row: Math.floor((H - y) / th + S.pos) };
        lose('踩到白塊了！');
      }
      function move() {}
      function up() {
        if (S.holdTile) { finishHold(); }
      }
      function finishHold() {
        const tl = S.holdTile; S.holdTile = null;
        if (tl && tl.hp > 0.95) {
          addPart((tl.c + 0.5) * cw, tileY(tl) - tl.len * th, 0, -60, 0.8, '#3de0e0', 20, 0, '♫');
        }
      }

      // ---------- simulation ----------
      function lose(msg) {
        if (S.dead) return;
        S.dead = true; shake = 10;
        api.sfx('bad');
        banner = { text: msg, t: 0, col: '#ff4d5e' };
        api.score(S.count);
        api.lose(msg === '踩到白塊了！' ? '踩到白塊了…' : '漏掉黑塊了…');
      }
      function winNow() {
        S.won = true;
        for (let i = 0; i < 90; i++) addPart(Math.random() * W, -10, (Math.random() - 0.5) * 220, Math.random() * 200, 2.2 + Math.random(), U.PALETTE[i % 9], 7, 260);
        banner = { text: '完美演奏！', t: 0, col: '#5560c8' };
        api.win(MEL.name + ' · ' + T.goal + ' 塊全部彈完！');
      }
      function update(dt) {
        dt = Math.max(0, dt || 0);
        anim += dt;
        updFx(dt);
        if (S.dead) {
          S.deadT += dt;
          if (S.back > 0) { const st = Math.min(S.back, dt * 4); S.pos -= st; S.back -= st; }
          return;
        }
        if (api.ended) return;
        if (!S.started) {
          S.wait -= dt;
          if (lastInfo !== 'wait') { lastInfo = 'wait'; api.info('點最下面的黑塊開始 · 只踩黑塊，別踩白塊'); }
          if (S.wait <= 0) S.started = true;
          else return;
        }
        S.v = Math.min(T.vmax, T.v0 + T.acc * S.count);
        S.pos += S.v * dt;
        ensureGen(S.pos + 7);
        if (S.holdTile) {
          const tl = S.holdTile;
          tl.hp = U.clamp((tileY(tl) - tl.fy) / (tl.len * th), 0, 1);
          if (Math.random() < 0.5) addPart((tl.c + 0.5) * cw + (Math.random() - 0.5) * cw * 0.4, tileY(tl) - tl.hp * tl.len * th, (Math.random() - 0.5) * 40, -40 - Math.random() * 60, 0.4, '#7ff0f0', 3, 0);
          if (tl.hp >= 1) finishHold();
        }
        // miss check: lowest pending tile left the screen
        const minP = nextRowTiles();
        if (minP < Infinity) {
          const yb = H - (minP - S.pos) * th;
          if (yb > H + th * 0.3) {
            for (let i = 0; i < tiles.length; i++) if (!tiles[i].done && tiles[i].p === minP) tiles[i].miss = true;
            S.back = (yb - H + th * 0.6) / th;
            return lose('漏掉了！');
          }
        }
        while (tiles.length && tiles[0].done && tileY(tiles[0]) - tiles[0].len * th > H + th) tiles.shift();
        const info = ENDLESS ? '已彈 ' + S.count + ' 塊 · ' + MEL.name : '進度 ' + S.count + ' / ' + T.goal + ' · ' + MEL.name;
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
      }
      function updFx(dt) {
        shake = Math.max(0, shake - dt * 30);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
          p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        }
        for (let i = 0; i < tiles.length; i++) if (tiles[i].done) tiles[i].t += dt;
        for (let i = 0; i < ripples.length; i++) { const r = ripples[i]; if (!r.on) continue; r.t += dt; if (r.t > 0.4) r.on = false; }
        if (S.wrong) S.wrong.t += dt;
        if (banner) { banner.t += dt; if (banner.t > 1.6) banner = null; }
      }

      // ---------- drawing ----------
      function draw(g) {
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        drawBackground(g, W, H, cw, th, S.pos, U, anim);
        // start strip
        const sy0 = H - (0 - S.pos) * th;
        if (sy0 > 0) {
          g.fillStyle = 'rgba(255,214,90,0.4)'; g.fillRect(0, sy0 - th, W, th);
          g.beginPath(); g.moveTo(0, sy0 - th); g.lineTo(W, sy0 - th); ink(g, 2.5);
        }
        // finish line
        if (!ENDLESS) {
          const fy = H - (G.p - S.pos) * th;
          if (G.rows >= T.goal && fy > -20 && fy < H) {
            for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? OL : '#fff'; g.fillRect(i * W / 16, fy - 10, W / 16, 5); g.fillStyle = i % 2 ? '#fff' : OL; g.fillRect(i * W / 16, fy - 5, W / 16, 5); }
            g.beginPath(); g.rect(-4, fy - 10, W + 8, 10); ink(g, 2.5);
            U.rr(g, W / 2 - 40, fy - 40, 80, 26, 13); g.fillStyle = '#ffcc4d'; g.fill(); ink(g, 3);
            oText(g, '終點', W / 2, fy - 27, 16, '#ffffff');
          }
        }
        for (let i = 0; i < tiles.length; i++) {
          const tl = tiles[i];
          const yb = tileY(tl), h = tl.len * th, yt = yb - h;
          if (yb < 0 || yt > H) continue;
          const x = tl.c * cw;
          if (tl.miss) { drawTile(g, x, yt, cw, h, 2, U, S.deadT); continue; }
          if (tl.hold) drawHoldTile(g, tl, x, yt, h);
          else {
            if (tl.done) {
              const k = Math.min(1, tl.t / 0.12);
              drawTile(g, x, yt, cw, h, 1, U, tl.t);
              if (k < 1) { g.globalAlpha = 1 - k; g.save(); g.translate(x + cw / 2, yt + h / 2); g.scale(1 - k * 0.15, 1 - k * 0.15); drawTile(g, -cw / 2, -h / 2, cw, h, 0, U, 0); g.restore(); g.globalAlpha = 1; }
            } else drawTile(g, x, yt, cw, h, 0, U, 0);
            if (tl.start && !tl.done) {
              oText(g, '開始', x + cw / 2, yt + h / 2 - 8, Math.min(26, cw * 0.28), '#ffe27a');
              if (!S.started && S.wait < 2.6) {
                g.beginPath(); g.arc(x + cw / 2, yt + h / 2 + 22, 12, 0, 6.283); g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,0.35)'; g.stroke();
                g.strokeStyle = '#ffe27a'; g.lineWidth = 3;
                g.beginPath(); g.arc(x + cw / 2, yt + h / 2 + 22, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, S.wait / 2.6)); g.stroke();
              }
            }
          }
        }
        if (S.wrong) {
          const w = S.wrong;
          const yb = H - (w.row - S.pos) * th;
          drawTile(g, w.c * cw, yb - th, cw, th, 2, U, w.t);
        }
        for (let i = 0; i < ripples.length; i++) {
          const r = ripples[i]; if (!r.on) continue;
          g.globalAlpha = 0.8 * (1 - r.t / 0.4);
          g.beginPath(); g.arc(r.x, r.y, 10 + r.t * 140, 0, 6.283); ink(g, 5); g.lineWidth = 2.5; g.strokeStyle = '#ffe27a'; g.stroke();
          g.globalAlpha = 1;
        }
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.5);
          if (p.ch) oText(g, p.ch, p.x, p.y, p.size, p.col);
          else { g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, p.size * 0.6, 0, 6.283); g.fill(); }
        }
        g.globalAlpha = 1;
        g.restore();
        drawHud(g);
      }
      function drawHoldTile(g, tl, x, yt, h) {
        const m = 3, r = 12;
        const full = tl.done && tl.hp >= 1;
        U.rr(g, x + m, yt + m, cw - m * 2, h - m * 2, r); g.fillStyle = full ? '#c9c3d8' : '#1c1830'; g.fill();
        if (!full) { U.rr(g, x + m, yt + m, cw - m * 2, h - m * 2 - 8, r); g.fillStyle = '#2f3a6a'; g.fill(); }
        g.fillStyle = 'rgba(255,255,255,0.28)'; U.rr(g, x + m + 7, yt + m + 6, cw - m * 2 - 14, 8, 4); g.fill();
        g.fillStyle = 'rgba(127,240,240,0.45)'; U.rr(g, x + cw / 2 - 3, yt + 22, 6, Math.max(6, h - 52), 3); g.fill();
        if (tl.done) {
          const fh = Math.max(10, h * tl.hp);
          if (S.holdTile === tl) {
            const g2 = g.createLinearGradient(0, yt + h - fh, 0, yt + h);
            g2.addColorStop(0, '#7ff0f0'); g2.addColorStop(1, '#4c9bff');
            g.fillStyle = g2;
          } else g.fillStyle = 'rgba(76,155,255,0.6)';
          U.rr(g, x + m + 4, yt + h - fh, cw - m * 2 - 8, fh - m - 2, 8); g.fill();
          if (S.holdTile === tl) { g.fillStyle = 'rgba(255,255,255,0.9)'; U.rr(g, x + m + 8, yt + h - fh + 3, cw - m * 2 - 16, 4, 2); g.fill(); }
        }
        U.rr(g, x + m, yt + m, cw - m * 2, h - m * 2, r); ink(g, 3);
        g.beginPath(); g.arc(x + cw / 2, yt + h - 22, 8, 0, 6.283); g.fillStyle = tl.done ? '#7ff0f0' : '#ffffff'; g.fill(); ink(g, 2.5);
        if (!tl.done) { g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2.5; g.beginPath(); g.arc(x + cw / 2, yt + h - 22, 13 + Math.sin(anim * 6) * 2, 0, 6.283); g.stroke(); }
      }
      function drawHud(g) {
        const sz = Math.min(48, W * 0.12);
        g.font = '900 ' + sz + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = 8; g.strokeStyle = OL; g.lineJoin = 'round';
        g.strokeText(String(S.count), W / 2, 40); g.fillStyle = '#ff5d6c'; g.fillText(String(S.count), W / 2, 40);
        if (ENDLESS) {
          g.fillStyle = 'rgba(42,26,20,0.72)'; U.rr(g, W / 2 - 50, 64, 100, 22, 11); g.fill();
          U.text(g, '最高 ' + Math.max(S.best, S.count), W / 2, 75, 13, '#ffffff', 'center', 900);
        } else {
          const bw = Math.min(200, W - 80), bx = (W - bw) / 2, by = 68;
          g.fillStyle = 'rgba(42,26,20,0.35)'; U.rr(g, bx, by, bw, 11, 5.5); g.fill();
          g.fillStyle = '#ffcc4d'; U.rr(g, bx, by, Math.max(11, bw * Math.min(1, S.count / T.goal)), 11, 5.5); g.fill();
          U.rr(g, bx, by, bw, 11, 5.5); ink(g, 2.5);
        }
        if (S.started && !S.dead) {
          g.fillStyle = 'rgba(42,26,20,0.72)'; U.rr(g, W - 58, 10, 48, 22, 11); g.fill();
          U.text(g, '×' + (S.v / T.v0).toFixed(1), W - 34, 21, 12, '#ffe27a', 'center', 900);
        }
        if (banner) {
          const k = Math.min(1, banner.t / 0.3);
          g.globalAlpha = banner.t > 1.2 ? Math.max(0, 1 - (banner.t - 1.2) / 0.4) : 1;
          const s2 = Math.min(40, W / 9) * U.easeOutBack(k);
          g.font = '900 ' + Math.max(1, s2) + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.lineWidth = 8; g.strokeStyle = OL;
          g.strokeText(banner.text, W / 2, H * 0.32); g.fillStyle = banner.col; g.fillText(banner.text, W / 2, H * 0.32);
          g.globalAlpha = 1;
        }
      }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _s: S, _k: { tiles, nextRowTiles, tileY, get th() { return th; }, get cw() { return cw; }, T },
      };
    },
  });
})();
