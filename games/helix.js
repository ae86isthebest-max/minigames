// 螺旋跳塔 — Helix Jump: drag to spin the tower, drop the bouncing ball through the gaps, avoid red.
(function () {
  'use strict';

  const N = 12;
  const SIG = Math.PI * 2 / N;
  const D = 3.0;
  const RO = 3.0;
  const RI = 0.85;
  const RB = 1.95;
  const BR = 0.36;
  const THK = 0.5;
  const EL = 0.42;
  const GRAV = 38;
  const BOUNCE = 12;
  const VMAX = 22;
  const BALL_A = Math.PI / 2;
  const THEMES = [
    { bg0: '#7fd6ff', bg1: '#c8a8ff', ring: '#ffd166', side: '#e0a93a', pole: '#fff4dc', ball: '#ff5d8f' },
    { bg0: '#ffb38a', bg1: '#ff7aa8', ring: '#7be0c3', side: '#4fb89a', pole: '#fff0f4', ball: '#5a7bff' },
    { bg0: '#8ef0b0', bg1: '#4cb8ff', ring: '#c39bff', side: '#9a6ee0', pole: '#f2fff6', ball: '#ff8f3d' },
    { bg0: '#ffe08a', bg1: '#ff9a5a', ring: '#5ac8ff', side: '#3399d6', pole: '#fffaf0', ball: '#e94dff' },
    { bg0: '#b6a8ff', bg1: '#ff9ad5', ring: '#a5f06b', side: '#76c43e', pole: '#fbf6ff', ball: '#ff4d6d' },
  ];

  function norm(a) { a %= Math.PI * 2; return a < 0 ? a + Math.PI * 2 : a; }

  // ---------- difficulty ----------
  function tune(d, L, endless) {
    const Le = Math.min(L - 1, 50);
    if (endless) return { rings: 0, gap: [2, 1], g1: 0.35, red: [3, 6], mover: 0.35, fuse: 4.2 };
    if (d === 0) return { rings: Math.min(50, 18 + Math.floor(Le * 0.8)), gap: [3, 2], g1: Math.min(0.4, Le * 0.02), red: [L >= 2 ? 1 : 0, Math.min(3, Math.floor((L + 1) / 3))], mover: L >= 8 ? Math.min(0.15, (L - 7) * 0.01) : 0, fuse: 0 };
    if (d === 1) return { rings: Math.min(60, 26 + Math.floor(Le * 0.8)), gap: [2, 2], g1: 0.25, red: [2, Math.min(5, 3 + Math.floor(Le / 10))], mover: Math.min(0.3, 0.12 + Le * 0.004), fuse: 0 };
    return { rings: Math.min(70, 34 + Math.floor(Le * 0.8)), gap: [2, 1], g1: Math.min(0.55, 0.35 + Le * 0.005), red: [3, Math.min(7, 5 + Math.floor(Le / 12))], mover: Math.min(0.5, 0.3 + Le * 0.005), fuse: Math.max(2.8, 4.2 - Le * 0.03) };
  }

  // ---------- art (swap-friendly) ----------
  function drawBackground(g, W, H, th, t, U) {
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, th.bg0); gr.addColorStop(1, th.bg1);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i < 7; i++) {
      const x = (i * 97 + 40) % W, y = ((i * 173 + 80 - t * (8 + i * 3)) % (H + 120) + H + 120) % (H + 120) - 60;
      g.beginPath(); g.arc(x, y, 18 + (i % 3) * 14, 0, 6.283); g.fill();
    }
  }
  function drawBall(g, x, y, r, col, sq, fire, t) {
    if (fire) {
      const gr = g.createRadialGradient(x, y, r * 0.3, x, y, r * 2.4);
      gr.addColorStop(0, 'rgba(255,220,90,0.8)'); gr.addColorStop(0.5, 'rgba(255,120,40,0.35)'); gr.addColorStop(1, 'rgba(255,80,20,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 2.4, 0, 6.283); g.fill();
    }
    g.save(); g.translate(x, y + r * (1 - sq)); g.scale(1 + (1 - sq) * 0.6, sq);
    const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, fire ? '#ffd23f' : col); gr.addColorStop(1, fire ? '#ff5a1f' : col);
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(-r * 0.35, -r * 0.42, r * 0.28, r * 0.18, -0.5, 0, 6.283); g.fill();
    g.restore();
  }

  MG.register({
    id: 'helix', name: '螺旋跳塔', icon: '🌀', color: '#ff5d6c', endless: true,
    create(api) {
      const U = api.util, L = api.level, rng = api.rng, DIFF = api.diff || 0, ENDLESS = !!api.endless;
      const T = tune(DIFF, L, ENDLESS);
      const TH = THEMES[(L - 1 + DIFF * 2 + (ENDLESS ? 3 : 0)) % THEMES.length];
      let W, H, cx, s, top0;
      function layout() {
        W = api.W; H = api.H; cx = W / 2;
        s = Math.min(W * 0.41, H * 0.26) / RO;
        top0 = H * 0.34;
      }
      layout();

      // ---------- generation ----------
      const rings = [];
      let genN = 0;
      function ringSafeAt(r, a, t) {
        const idx = Math.floor(norm(a - r.off) / SIG);
        if (r.segs[idx] === 2) return false;
        if (r.mv && r.segs[idx] === 0) {
          if (t === undefined) { if ((idx - r.mv.lo + N) % N <= r.mv.hi - r.mv.lo) return false; }
          else if (Math.abs(norm(a - r.off - moverAng(r, t) + Math.PI) - Math.PI) < SIG * 0.5 + 0.18) return false;
        }
        return true;
      }
      function moverAng(r, t) {
        const m = r.mv;
        return ((m.lo + m.hi + 1) / 2) * SIG + Math.sin(t * m.w + m.ph) * ((m.hi - m.lo) / 2) * SIG;
      }
      function makeRing(i, prev, last) {
        const y = i * D;
        if (last) return { y, off: 0, segs: new Array(N).fill(0), last: true, mv: null, passed: false, pt: 0, splats: [] };
        const Lx = ENDLESS ? Math.min(1, i / 120) : 0;
        for (let tries = 0; tries < 30; tries++) {
          const segs = new Array(N).fill(0);
          const off = rng() * Math.PI * 2;
          const gw = rng() < (ENDLESS ? T.g1 + Lx * 0.3 : T.g1) ? T.gap[1] : T.gap[0];
          const g0 = Math.floor(rng() * N);
          for (let k = 0; k < gw; k++) segs[(g0 + k) % N] = 1;
          if (gw >= 2 && DIFF === 0 && rng() < 0.3) { const g2 = (g0 + 6) % N; segs[g2] = 1; }
          let nRed = 0;
          if (i > 0) {
            const lo = T.red[0], hi = Math.max(T.red[0], T.red[1] + (ENDLESS ? Math.floor(Lx * 2) : 0));
            nRed = i < 2 && L <= 2 && !ENDLESS ? 0 : lo + Math.floor(rng() * (hi - lo + 1));
          }
          for (let k = 0; k < nRed; k++) {
            const j = Math.floor(rng() * N);
            if (segs[j] === 0) segs[j] = 2;
          }
          let mv = null;
          if (i > 1 && rng() < (ENDLESS ? T.mover + Lx * 0.2 : T.mover)) {
            let bestLo = -1, bestLen = 0;
            for (let st = 0; st < N; st++) {
              if (segs[st] !== 0 || segs[(st + N - 1) % N] === 0) continue;
              let len = 0; while (len < N && segs[(st + len) % N] === 0) len++;
              if (len > bestLen) { bestLen = len; bestLo = st; }
            }
            if (bestLen >= 3) {
              const lo = bestLo, hi = bestLo + Math.min(bestLen, 5) - 1;
              mv = { lo, hi, w: 1.5 + rng() * (DIFF === 2 ? 1.6 : 0.9), ph: rng() * 6.283 };
            }
          }
          const r = { y, off, segs, last: false, mv, passed: false, pt: 0, splats: [] };
          // remap mover indices to plain segment indexes (wrapping allowed)
          if (prev && !prev.last) {
            let ok = false;
            for (let j = 0; j < N && !ok; j++) {
              if (prev.segs[j] !== 1) continue;
              for (let q = -0.3; q <= 0.31; q += 0.15) {
                const a = prev.off + (j + 0.5 + q) * SIG;
                if (ringSafeAt(r, a)) { ok = true; break; }
              }
            }
            if (!ok) continue;
          } else if (i === 0) {
            // first ring: the ball starts above solid ground
            const idx = Math.floor(norm(BALL_A - off) / SIG);
            if (segs[idx] !== 0) continue;
          }
          return r;
        }
        const segs = new Array(N).fill(0); segs[0] = 1; segs[1] = 1;
        return { y, off: prev ? prev.off : 0, segs, last: false, mv: null, passed: false, pt: 0, splats: [] };
      }
      function genMore(upto) {
        while (genN < upto) {
          const last = !ENDLESS && genN === T.rings;
          rings.push(makeRing(genN, rings.length ? rings[rings.length - 1] : null, last));
          genN++;
          if (last) { genN = 1e9; break; }
        }
      }
      genMore(ENDLESS ? 14 : T.rings + 1);

      // ---------- state ----------
      const S = {
        t: 0, rot: 0, y: -1.6, vy: 0, combo: 0, fire: false, passed: 0, sq: 1, camY: 0, dead: false, won: false,
        fuse: T.fuse ? T.fuse + 1.5 : 0, fuseMax: T.fuse, bounces: 0, endT: 0,
      };
      S.camY = S.y - 1.0;
      let shake = 0, anim = 0, lastInfo = '', hintT = L === 1 && DIFF === 0 && !ENDLESS ? 6 : 0, banner = null, drag = null;
      const total = ENDLESS ? 0 : T.rings;
      const parts = []; for (let i = 0; i < 260; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 3, grav: 0, rot: 0, vr: 0, w: 0 });
      let pCur = 0;
      const trail = []; for (let i = 0; i < 8; i++) trail.push({ x: 0, y: 0 });
      let trailI = 0, trailT = 0;
      const pops = []; for (let i = 0; i < 12; i++) pops.push({ on: false, x: 0, y: 0, t: 0, s: '' });
      let popI = 0;
      function addPart(x, y, vx, vy, life, col, size, grav, w) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size; p.grav = grav || 0; p.rot = Math.random() * 6; p.vr = (Math.random() - 0.5) * 12; p.w = w || 0;
      }
      function addPop(x, y, txt) { const p = pops[popI]; popI = (popI + 1) % pops.length; p.on = true; p.x = x; p.y = y; p.t = 0; p.s = txt; }

      function sy(y) { return top0 + (y - S.camY) * s * 0.9; }
      function nextRingIdx() {
        for (let i = 0; i < rings.length; i++) if (!rings[i].passed && rings[i].y > S.y - 1e-6) return i;
        return -1;
      }
      function segAt(r, rot, t) {
        const a = norm(BALL_A - rot - r.off);
        const idx = Math.floor(a / SIG);
        let v = r.segs[idx];
        if (v === 0 && r.mv) {
          const ma = moverAng(r, t);
          if (Math.abs(norm(a - ma + Math.PI) - Math.PI) < SIG * 0.5 + 0.12) v = 3;
        }
        return v;
      }

      // ---------- input ----------
      function down(x) { if (api.ended) return; drag = { x }; hintT = Math.min(hintT, 0.4); }
      function move(x) {
        if (!drag || api.ended || S.dead) return;
        S.rot += (x - drag.x) * 6.2 / Math.max(260, W);
        drag.x = x;
      }
      function up() { drag = null; }

      // ---------- simulation ----------
      function ringPassed(r, smashed) {
        r.passed = true; r.pt = 0; r.smashed = !!smashed;
        S.passed++; api.score(S.passed);
        if (S.fuseMax) S.fuse = S.fuseMax;
        const y = sy(r.y);
        if (smashed) {
          for (let k = 0; k < 26; k++) {
            const a = Math.random() * 6.283;
            addPart(cx + Math.cos(a) * RB * s, y + Math.sin(a) * RB * s * EL, Math.cos(a) * (150 + Math.random() * 200), Math.sin(a) * 80 - 120 - Math.random() * 120, 0.9, k % 3 ? TH.ring : '#ff9a3d', 10 + Math.random() * 10, 700, 1);
          }
          shake = Math.max(shake, 9);
          api.sfx('hit');
        } else api.sfx('pop');
        addPop(cx + RB * s * 0.9, y - 10, S.combo >= 2 ? '+' + S.combo : '+1');
      }
      function update(dt) {
        dt = Math.max(0, dt || 0);
        anim += dt;
        updFx(dt);
        if (S.dead || api.ended) {
          S.endT += dt;
          if (S.won) S.rot += dt * 1.2;
          return;
        }
        S.t += dt; hintT -= dt;
        if (S.fuseMax) {
          S.fuse -= dt;
          if (S.fuse <= 0) { S.fuse = 0; return lose('太慢了！'); }
        }
        if (ENDLESS) { while (genN < S.passed + 14) { rings.push(makeRing(genN, rings[rings.length - 1], false)); genN++; } }
        const y0 = S.y;
        S.vy = Math.min(VMAX, S.vy + GRAV * dt);
        S.y += S.vy * dt;
        S.sq += (1 - S.sq) * Math.min(1, dt * 14);
        // ring crossings
        for (let i = 0; i < rings.length; i++) {
          const r = rings[i];
          if (r.passed) continue;
          const top = r.y - BR;
          if (y0 > top + 1e-6) continue;
          if (S.y < top) break;
          if (S.vy <= 0) break;
          const v = segAt(r, S.rot, S.t);
          if (r.last) {
            S.y = top; S.vy = -BOUNCE * 0.8; S.sq = 0.6;
            return winNow();
          }
          if (v === 1) { S.combo++; if (S.combo >= 3 && !S.fire) { S.fire = true; banner = { text: '火球！', t: 0, col: '#ffb03a' }; } ringPassed(r, false); continue; }
          if (S.fire) { S.y = top; S.vy = -BOUNCE; S.sq = 0.55; S.fire = false; S.combo = 0; ringPassed(r, true); break; }
          if (v === 2 || v === 3) { S.y = top; S.sq = 0.5; return lose('碰到紅色了！'); }
          S.y = top; S.vy = -BOUNCE; S.sq = 0.55; S.combo = 0; S.bounces++;
          const a = norm(BALL_A - S.rot - r.off);
          if (r.splats.length > 5) r.splats.shift();
          r.splats.push({ a: a + (Math.random() - 0.5) * 0.15, r: 0.7 + Math.random() * 0.3 });
          const by = sy(top) + RB * s * EL + BR * s;
          for (let k = 0; k < 6; k++) addPart(cx + (Math.random() - 0.5) * 20, by, (Math.random() - 0.5) * 160, -40 - Math.random() * 120, 0.4, TH.ball, 4 + Math.random() * 3, 500);
          api.sfx('tap');
          break;
        }
        // camera only goes down
        const want = S.y - 1.0;
        if (want > S.camY) S.camY += (want - S.camY) * Math.min(1, dt * 9);
        // trail
        trailT -= dt;
        if (trailT <= 0) { trailT = 0.03; const tp = trail[trailI]; trailI = (trailI + 1) % trail.length; tp.x = cx; tp.y = S.y; }
        if (S.fire && Math.random() < 0.7) {
          const by = sy(S.y) + RB * s * EL;
          addPart(cx + (Math.random() - 0.5) * BR * s, by, (Math.random() - 0.5) * 40, -60 - Math.random() * 60, 0.35, Math.random() < 0.5 ? '#ffd23f' : '#ff6a1f', 4 + Math.random() * 4, -100);
        }
        let info;
        if (hintT > 0) info = '左右拖曳轉動高塔 · 從缺口落下，別碰紅色';
        else if (ENDLESS) info = '已穿過 ' + S.passed + ' 層';
        else info = '進度 ' + S.passed + ' / ' + total + ' 層';
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
      }
      function lose(msg) {
        S.dead = true; shake = 14; api.sfx('bad');
        const by = sy(S.y) + RB * s * EL;
        for (let k = 0; k < 16; k++) addPart(cx, by, (Math.random() - 0.5) * 300, -Math.random() * 260, 0.7, k % 2 ? TH.ball : '#ffffff', 5, 600);
        banner = { text: msg, t: 0, col: '#ff6b7a' };
        api.score(S.passed);
        api.lose(msg === '太慢了！' ? '時間到了…' : '撞上紅色區塊…');
      }
      function winNow() {
        S.won = true; S.passed = total; api.score(S.passed);
        for (let i = 0; i < 90; i++) addPart(Math.random() * W, -10, (Math.random() - 0.5) * 220, Math.random() * 200, 2.2 + Math.random(), U.PALETTE[i % 9], 7, 260);
        banner = { text: '完美！', t: 0, col: '#ffffff' };
        api.sfx('good');
        api.win('穿過 ' + total + ' 層，抵達塔底！');
      }
      function updFx(dt) {
        shake = Math.max(0, shake - dt * 35);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
          p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        }
        for (const r of rings) if (r.passed && r.pt < 1) r.pt = Math.min(1, r.pt + dt * 2.6);
        for (let i = 0; i < pops.length; i++) { const p = pops[i]; if (!p.on) continue; p.t += dt; p.y -= 40 * dt; if (p.t > 0.8) p.on = false; }
        if (banner) { banner.t += dt; if (banner.t > 1.3) banner = null; }
        // forget rings far above
        while (rings.length > 2 && rings[0].passed && rings[0].pt >= 1 && sy(rings[0].y) < -200) rings.shift();
      }

      // ---------- drawing ----------
      function segPath(g, ycen, a0, a1, rIn, rOut, dy) {
        const st = 4;
        g.beginPath();
        for (let k = 0; k <= st; k++) { const a = a0 + (a1 - a0) * k / st; g.lineTo(cx + Math.cos(a) * rOut * s, ycen + dy + Math.sin(a) * rOut * s * EL); }
        for (let k = st; k >= 0; k--) { const a = a0 + (a1 - a0) * k / st; g.lineTo(cx + Math.cos(a) * rIn * s, ycen + dy + Math.sin(a) * rIn * s * EL); }
        g.closePath();
      }
      function bandPath(g, ycen, a0, a1, rr, h) {
        const st = 4;
        g.beginPath();
        for (let k = 0; k <= st; k++) { const a = a0 + (a1 - a0) * k / st; g.lineTo(cx + Math.cos(a) * rr * s, ycen + Math.sin(a) * rr * s * EL); }
        for (let k = st; k >= 0; k--) { const a = a0 + (a1 - a0) * k / st; g.lineTo(cx + Math.cos(a) * rr * s, ycen + h + Math.sin(a) * rr * s * EL); }
        g.closePath();
      }
      function segCol(r, v, side) {
        if (r.last) return side ? '#d9a400' : '#ffd23f';
        if (v === 2 || v === 3) return side ? '#b81f35' : '#ff3b55';
        return side ? TH.side : TH.ring;
      }
      function drawRingHalf(g, r, front) {
        const yc = sy(r.y);
        const h = THK * s * 0.9;
        const base = S.rot + r.off;
        for (let j = 0; j < N; j++) {
          const v = r.segs[j];
          if (v === 1) continue;
          const a0 = base + j * SIG, a1 = a0 + SIG;
          const isFront = Math.sin((a0 + a1) / 2) > 0;
          if (isFront !== front) continue;
          if (front) { g.fillStyle = segCol(r, v, true); bandPath(g, yc, a0, a1, RO, h); g.fill(); }
          g.fillStyle = segCol(r, v, false); segPath(g, yc, a0, a1, RI, RO, 0); g.fill();
          if (v === 2) {
            g.fillStyle = 'rgba(255,255,255,0.22)'; segPath(g, yc, a0 + SIG * 0.1, a1 - SIG * 0.1, RO * 0.82, RO * 0.94, 0); g.fill();
          }
        }
        // moving red block
        if (r.mv) {
          const ma = moverAng(r, S.t);
          const a0 = base + ma - SIG * 0.5, a1 = a0 + SIG;
          if ((Math.sin(a0 + SIG / 2) > 0) === front) {
            const lift = 0.22 * s;
            if (front) { g.fillStyle = '#9a1428'; bandPath(g, yc - lift, a0, a1, RO * 0.98, h + lift); g.fill(); }
            g.fillStyle = '#ff2e4d'; segPath(g, yc - lift, a0, a1, RI + 0.1, RO * 0.98, 0); g.fill();
            g.fillStyle = 'rgba(255,255,255,' + (0.25 + 0.2 * Math.sin(anim * 10)) + ')'; segPath(g, yc - lift, a0 + 0.06, a1 - 0.06, RO * 0.75, RO * 0.9, 0); g.fill();
          }
        }
        for (let i = 0; i < r.splats.length; i++) {
          const sp = r.splats[i];
          const a = base + sp.a;
          if ((Math.sin(a) > 0) !== front) continue;
          g.fillStyle = U.shade(TH.ball, -0.1); g.globalAlpha = 0.75;
          g.beginPath(); g.ellipse(cx + Math.cos(a) * RB * s, yc + Math.sin(a) * RB * s * EL, BR * s * 0.9 * sp.r, BR * s * 0.4 * sp.r, 0, 0, 6.283); g.fill();
          g.globalAlpha = 1;
        }
      }
      function drawPole(g, y0, y1) {
        if (y1 <= y0) return;
        const pr = RI * s * 0.98;
        const gr = g.createLinearGradient(cx - pr, 0, cx + pr, 0);
        gr.addColorStop(0, U.shade(TH.pole, -0.18)); gr.addColorStop(0.35, TH.pole); gr.addColorStop(1, U.shade(TH.pole, -0.32));
        g.fillStyle = gr; g.fillRect(cx - pr, y0, pr * 2, y1 - y0);
      }
      function drawBallNow(g) {
        if (S.dead && S.endT > 0.05) {
          // splat remains
          const by = sy(S.y) + RB * s * EL + BR * s;
          g.fillStyle = TH.ball; g.beginPath(); g.ellipse(cx, by - BR * s * 0.2, BR * s * 1.4, BR * s * 0.45, 0, 0, 6.283); g.fill();
          return;
        }
        const bx = cx, by = sy(S.y) + RB * s * EL;
        for (let k = 1; k <= trail.length; k++) {
          const tp = trail[(trailI - k + trail.length * 2) % trail.length];
          const ty = sy(tp.y) + RB * s * EL;
          if (ty >= by - 2) continue;
          g.globalAlpha = 0.18 * (1 - k / trail.length);
          g.fillStyle = S.fire ? '#ffb03a' : TH.ball;
          g.beginPath(); g.arc(bx, ty, BR * s * (1 - k * 0.06), 0, 6.283); g.fill();
        }
        g.globalAlpha = 1;
        drawBall(g, bx, by, BR * s, TH.ball, S.sq, S.fire, anim);
      }
      function draw(g) {
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        drawBackground(g, W, H, TH, anim, U);
        const nb = nextRingIdx();
        // visible range
        let lo = 0, hi = rings.length - 1;
        while (lo < rings.length && sy(rings[lo].y) < -RO * s * EL - 40 && !(rings[lo].passed && rings[lo].pt < 1)) lo++;
        while (hi > 0 && sy(rings[hi].y) > H + RO * s * EL + 40) hi--;
        // pole below the lowest visible ring
        const lowY = hi >= 0 && hi < rings.length ? sy(rings[hi].y) : H;
        if (!(rings[hi] && rings[hi].last)) drawPole(g, lowY, H + 20);
        let ballDrawn = false;
        for (let i = hi; i >= lo; i--) {
          const r = rings[i];
          if (r.passed && r.pt >= 1) {
            if (!ballDrawn && i === nb - 1) { drawBallNow(g); ballDrawn = true; }
            const above = i > 0 ? sy(rings[i - 1].y) : -20;
            drawPole(g, Math.max(-20, above), sy(r.y) + 1);
            continue;
          }
          if (r.passed) {
            const t = r.pt;
            g.save(); g.globalAlpha = 1 - t;
            const yc = sy(r.y);
            g.translate(cx, yc); g.scale(1 + t * 0.9, 1 + t * 0.9); g.translate(-cx, -yc);
            if (!r.smashed) { drawRingHalf(g, r, false); drawRingHalf(g, r, true); }
            g.restore();
            const above = i > 0 ? sy(rings[i - 1].y) : -20;
            drawPole(g, Math.max(-20, above), yc + 1);
            if (!ballDrawn && i === nb - 1) { drawBallNow(g); ballDrawn = true; }
            continue;
          }
          const above = i > 0 ? sy(rings[i - 1].y) : -20;
          if (r.last) {
            const yc = sy(r.y);
            const gr = g.createLinearGradient(cx - RO * s, 0, cx + RO * s, 0);
            gr.addColorStop(0, '#e0a800'); gr.addColorStop(0.4, '#ffd23f'); gr.addColorStop(1, '#b88a00');
            g.fillStyle = gr; g.fillRect(cx - RO * s, yc, RO * s * 2, H - yc + 30);
            g.fillStyle = '#ffd23f'; g.beginPath(); g.ellipse(cx, yc, RO * s, RO * s * EL, 0, 0, 6.283); g.fill();
            g.fillStyle = '#ffe680'; g.beginPath(); g.ellipse(cx, yc, RO * s * 0.9, RO * s * EL * 0.9, 0, 0, 6.283); g.fill();
            drawPole(g, Math.max(-20, above), yc);
            g.fillStyle = U.shade(TH.pole, -0.3); g.beginPath(); g.ellipse(cx, yc, RI * s, RI * s * EL, 0, 0, 6.283); g.fill();
            U.text(g, '終點', cx, yc + RO * s * EL * 0.62, Math.max(12, s * 0.6), '#b07a00', 'center', 900);
          } else {
            drawRingHalf(g, r, false);
            drawPole(g, Math.max(-20, above), sy(r.y) + RI * s * EL);
            drawRingHalf(g, r, true);
          }
          if (!ballDrawn && i === nb) { drawBallNow(g); ballDrawn = true; }
        }
        if (!ballDrawn) drawBallNow(g);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.5); g.fillStyle = p.col;
          if (p.w) {
            g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
            g.fillRect(-p.size / 2, -p.size * 0.25, p.size, p.size * 0.5); g.restore();
          } else g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        g.globalAlpha = 1;
        for (let i = 0; i < pops.length; i++) {
          const p = pops[i]; if (!p.on) continue;
          g.globalAlpha = p.t > 0.5 ? Math.max(0, (0.8 - p.t) / 0.3) : 1;
          U.text(g, p.s, p.x, p.y, 22 * (p.t < 0.1 ? 0.6 + p.t * 4 : 1), '#ffffff', 'center', 900);
        }
        g.globalAlpha = 1;
        g.restore();
        drawHud(g);
      }
      function outlined(g, txt, x, y, size) {
        g.font = '900 ' + size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = Math.max(4, size * 0.16); g.strokeStyle = 'rgba(40,30,80,0.45)'; g.lineJoin = 'round';
        g.strokeText(txt, x, y); g.fillStyle = '#ffffff'; g.fillText(txt, x, y);
      }
      function drawHud(g) {
        const pad = 12;
        if (ENDLESS) {
          outlined(g, String(S.passed), cx, pad + 28, 42);
          U.text(g, '最高 ' + Math.max(api.best || 0, S.passed), cx, pad + 56, 13, 'rgba(255,255,255,0.85)', 'center', 800);
        } else {
          const bw = Math.min(220, W - 120), bx = cx - bw / 2, by = pad + 10;
          g.fillStyle = 'rgba(255,255,255,0.35)'; U.rr(g, bx, by, bw, 12, 6); g.fill();
          g.fillStyle = TH.ball; U.rr(g, bx, by, Math.max(12, bw * Math.min(1, S.passed / total)), 12, 6); g.fill();
          for (let k = 0; k < 2; k++) {
            const x = k ? bx + bw + 16 : bx - 16;
            g.fillStyle = k ? 'rgba(255,255,255,0.9)' : TH.ball; g.beginPath(); g.arc(x, by + 6, 14, 0, 6.283); g.fill();
            U.text(g, String(L + k), x, by + 7, 13, k ? TH.ball : '#ffffff', 'center', 900);
          }
          outlined(g, String(S.passed), cx, by + 42, 30);
        }
        if (S.fuseMax) {
          const bw = Math.min(200, W - 80), bx = cx - bw / 2, by = H - pad - 14;
          const f = U.clamp(S.fuse / S.fuseMax, 0, 1);
          g.fillStyle = 'rgba(0,0,0,0.25)'; U.rr(g, bx, by, bw, 10, 5); g.fill();
          g.fillStyle = f < 0.3 ? (Math.floor(anim * 8) % 2 ? '#ff3b55' : '#ffcc4d') : '#ffffff';
          U.rr(g, bx, by, Math.max(10, bw * f), 10, 5); g.fill();
          U.text(g, '⏱', bx - 14, by + 5, 14, '#fff', 'center', 900);
        }
        if (S.combo >= 2 && !S.dead) U.text(g, '連穿 ×' + S.combo, cx, H * 0.2 + 30, 18, S.fire ? '#ffd23f' : '#ffffff', 'center', 900);
        if (banner) {
          const k = Math.min(1, banner.t / 0.3);
          g.globalAlpha = banner.t > 0.9 ? Math.max(0, 1 - (banner.t - 0.9) / 0.4) : 1;
          const sz = Math.min(44, W / 8) * U.easeOutBack(k);
          g.font = '900 ' + Math.max(1, sz) + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 7; g.strokeStyle = 'rgba(40,20,60,0.7)'; g.lineJoin = 'round';
          g.strokeText(banner.text, cx, H * 0.2); g.fillStyle = banner.col; g.fillText(banner.text, cx, H * 0.2);
          g.globalAlpha = 1;
        }
        if (hintT > 0 && !api.ended) {
          g.globalAlpha = Math.min(1, hintT);
          U.text(g, '👆', cx + Math.sin(anim * 2.5) * 70, H * 0.8, 34, '#fff', 'center', 900);
          U.text(g, '◀  拖曳轉動  ▶', cx, H * 0.8 - 44, 18, '#ffffff', 'center', 900);
          g.globalAlpha = 1;
        }
      }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _s: S, _k: { rings, segAt, nextRingIdx, BR, GRAV, BOUNCE, VMAX, get W() { return W; } },
      };
    },
  });
})();
