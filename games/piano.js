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

  // ---------- art (swap-friendly) ----------
  function drawBackground(g, W, H, cw, th, pos, U) {
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#f4f6ff'); gr.addColorStop(1, '#ffffff');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = '#d8dcea';
    for (let c = 1; c < COLS; c++) g.fillRect(Math.round(c * cw) - 0.5, 0, 1, H);
    g.fillStyle = 'rgba(200,205,225,0.5)';
    const off = (pos % 1) * th;
    for (let y = H + off; y > -th; y -= th) g.fillRect(0, Math.round(y) - 0.5, W, 1);
  }
  function drawTile(g, x, y, w, h, state, U, t) {
    // state: 0 pending, 1 tapped (fade t 0..1), 2 missed/wrong flash
    const m = 1.5;
    if (state === 1) {
      const a = Math.max(0, 1 - t * 1.6);
      g.fillStyle = 'rgba(190,196,214,' + (0.55 + 0.45 * a) + ')';
      U.rr(g, x + m, y + m, w - m * 2, h - m * 2, 5); g.fill();
      return;
    }
    if (state === 2) {
      g.fillStyle = Math.floor(t * 8) % 2 ? '#ff4d5e' : '#ff8a96';
      U.rr(g, x + m, y + m, w - m * 2, h - m * 2, 5); g.fill();
      return;
    }
    const gr = g.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, '#2c3150'); gr.addColorStop(1, '#0d0f1c');
    g.fillStyle = gr; U.rr(g, x + m, y + m, w - m * 2, h - m * 2, 5); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.12)'; U.rr(g, x + m + 4, y + m + 3, w - m * 2 - 8, 4, 2); g.fill();
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
        drawBackground(g, W, H, cw, th, S.pos, U);
        // start strip
        const sy0 = H - (0 - S.pos) * th;
        if (sy0 > 0) {
          g.fillStyle = 'rgba(255,214,90,0.35)'; g.fillRect(0, sy0 - th, W, th);
        }
        // finish line
        if (!ENDLESS) {
          const fy = H - (G.p - S.pos) * th;
          if (G.rows >= T.goal && fy > -20 && fy < H) {
            for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#222' : '#fff'; g.fillRect(i * W / 16, fy - 6, W / 16, 6); }
            U.text(g, '終點', W / 2, fy - 24, 18, '#5560c8', 'center', 900);
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
              U.text(g, '開始', x + cw / 2, yt + h / 2 - 8, Math.min(26, cw * 0.28), '#ffffff', 'center', 900);
              if (!S.started && S.wait < 2.6) {
                g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 3;
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
          g.strokeStyle = 'rgba(85,96,200,' + (0.6 * (1 - r.t / 0.4)) + ')'; g.lineWidth = 3;
          g.beginPath(); g.arc(r.x, r.y, 10 + r.t * 140, 0, 6.283); g.stroke();
        }
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.5);
          if (p.ch) U.text(g, p.ch, p.x, p.y, p.size, p.col, 'center', 900);
          else { g.fillStyle = p.col; g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); }
        }
        g.globalAlpha = 1;
        g.restore();
        drawHud(g);
      }
      function drawHoldTile(g, tl, x, yt, h) {
        const m = 1.5;
        const gr = g.createLinearGradient(0, yt, 0, yt + h);
        gr.addColorStop(0, '#20264a'); gr.addColorStop(1, '#0d0f1c');
        g.fillStyle = tl.done && tl.hp >= 1 ? 'rgba(190,196,214,0.8)' : gr;
        U.rr(g, x + m, yt + m, cw - m * 2, h - m * 2, 6); g.fill();
        g.fillStyle = 'rgba(120,200,255,0.35)'; g.fillRect(x + cw / 2 - 1.5, yt + 12, 3, h - 36);
        if (tl.done) {
          const fh = Math.max(8, h * tl.hp);
          if (S.holdTile === tl) {
            const g2 = g.createLinearGradient(0, yt + h - fh, 0, yt + h);
            g2.addColorStop(0, '#7ff0f0'); g2.addColorStop(1, '#4c9bff');
            g.fillStyle = g2;
          } else g.fillStyle = 'rgba(76,155,255,0.55)';
          U.rr(g, x + m + 3, yt + h - fh, cw - m * 2 - 6, fh - m, 5); g.fill();
          if (S.holdTile === tl) { g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(x + m + 3, yt + h - fh, cw - m * 2 - 6, 3); }
        }
        g.fillStyle = tl.done ? '#7ff0f0' : '#ffffff';
        g.beginPath(); g.arc(x + cw / 2, yt + h - 20, 7, 0, 6.283); g.fill();
        if (!tl.done) { g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 2; g.beginPath(); g.arc(x + cw / 2, yt + h - 20, 12 + Math.sin(anim * 6) * 2, 0, 6.283); g.stroke(); }
      }
      function drawHud(g) {
        const sz = Math.min(48, W * 0.12);
        g.font = '900 ' + sz + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.lineJoin = 'round';
        g.strokeText(String(S.count), W / 2, 38); g.fillStyle = '#ff4d5e'; g.fillText(String(S.count), W / 2, 38);
        if (ENDLESS) U.text(g, '最高 ' + Math.max(S.best, S.count), W / 2, 72, 13, '#5560c8', 'center', 900);
        else {
          const bw = Math.min(200, W - 80), bx = (W - bw) / 2, by = 66;
          g.fillStyle = 'rgba(85,96,200,0.18)'; U.rr(g, bx, by, bw, 8, 4); g.fill();
          g.fillStyle = '#5560c8'; U.rr(g, bx, by, Math.max(8, bw * Math.min(1, S.count / T.goal)), 8, 4); g.fill();
        }
        if (S.started && !S.dead) U.text(g, '×' + (S.v / T.v0).toFixed(1), W - 12, 20, 12, 'rgba(85,96,200,0.8)', 'right', 900);
        if (banner) {
          const k = Math.min(1, banner.t / 0.3);
          g.globalAlpha = banner.t > 1.2 ? Math.max(0, 1 - (banner.t - 1.2) / 0.4) : 1;
          const s2 = Math.min(40, W / 9) * U.easeOutBack(k);
          g.font = '900 ' + Math.max(1, s2) + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.lineWidth = 7; g.strokeStyle = 'rgba(255,255,255,0.95)';
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
