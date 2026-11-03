// 切水果 — Fruit Ninja: swipe to slice the tossed fruit, never the bombs.
(function () {
  'use strict';

  // ---------- fruit look-up (swap these + drawFruitBody/drawBomb for a restyle) ----------
  // r = radius factor, skin = [light, mid, dark], flesh = [centre, edge], juice = splash colour
  const FRUITS = [
    { name: 'melon', r: 1.3, skin: ['#7fe07a', '#2f9e3a', '#14561d'], flesh: ['#ff6a6a', '#e8283c'], rind: '#e9ffd8', juice: '#ff4b5c', seeds: '#2a1a12', stripes: true },
    { name: 'orange', r: 0.95, skin: ['#ffd27a', '#ff9a1c', '#d2620a'], flesh: ['#ffd08a', '#ff9a2e'], rind: '#fff3d6', juice: '#ffa62e', segments: true },
    { name: 'apple', r: 0.95, skin: ['#ff9a9a', '#e8283c', '#8f0f1d'], flesh: ['#fff8dc', '#f3e2a6'], rind: '#fff', juice: '#fff3b0', stem: true, seeds: '#5a3418' },
    { name: 'kiwi', r: 0.85, skin: ['#c7a07a', '#8a5a3c', '#5a3820'], flesh: ['#e9ffb0', '#6cc23a'], rind: '#cfe89a', juice: '#9be25a', seeds: '#1a1a1a', ring: true },
    { name: 'peach', r: 0.95, skin: ['#ffd9b0', '#ff9a7a', '#e0605a'], flesh: ['#ffe28a', '#ffb43c'], rind: '#fff1c4', juice: '#ffc04a', stem: true },
    { name: 'plum', r: 0.78, skin: ['#d79bff', '#8a2be2', '#4a1080'], flesh: ['#fff1a8', '#ffd24a'], rind: '#fff6d0', juice: '#c06bff' },
    { name: 'lime', r: 0.8, skin: ['#d6ff8a', '#6cd23a', '#2f8a1a'], flesh: ['#f2ffc4', '#b8f06a'], rind: '#f6ffe6', juice: '#b8f06a', segments: true },
  ];

  function drawFruitBody(g, f, r) {
    const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
    gr.addColorStop(0, f.skin[0]); gr.addColorStop(0.55, f.skin[1]); gr.addColorStop(1, f.skin[2]);
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
    if (f.stripes) {
      g.strokeStyle = 'rgba(10,60,15,0.55)'; g.lineWidth = r * 0.13;
      for (let i = -2; i <= 2; i++) {
        g.beginPath(); g.ellipse(i * r * 0.36, 0, r * 0.12, r * 0.95 - Math.abs(i) * r * 0.12, 0, 0, Math.PI * 2); g.stroke();
      }
    }
    if (f.name === 'orange' || f.name === 'lime') {
      g.fillStyle = 'rgba(0,0,0,0.08)';
      for (let i = 0; i < 14; i++) { const a = i * 2.4, d = r * (0.25 + (i % 4) * 0.17); g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, r * 0.05, 0, 7); g.fill(); }
    }
    if (f.name === 'kiwi') {
      g.strokeStyle = 'rgba(60,30,10,0.35)'; g.lineWidth = 1;
      for (let i = 0; i < 18; i++) { const a = i * 0.35; g.beginPath(); g.moveTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5); g.lineTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95); g.stroke(); }
    }
    if (f.stem) {
      g.strokeStyle = '#5a3418'; g.lineWidth = r * 0.12; g.lineCap = 'round';
      g.beginPath(); g.moveTo(0, -r * 0.85); g.quadraticCurveTo(r * 0.05, -r * 1.15, r * 0.18, -r * 1.25); g.stroke();
      g.fillStyle = '#3fbf4a';
      g.beginPath(); g.ellipse(r * 0.38, -r * 1.05, r * 0.28, r * 0.13, -0.5, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.beginPath(); g.ellipse(-r * 0.38, -r * 0.42, r * 0.26, r * 0.15, -0.6, 0, Math.PI * 2); g.fill();
  }

  // the cut face seen at an angle (centred on the cut line, local x = along the cut)
  function drawFlesh(g, f, r) {
    g.fillStyle = f.rind;
    g.beginPath(); g.ellipse(0, 0, r * 0.97, r * 0.36, 0, 0, Math.PI * 2); g.fill();
    const gr = g.createRadialGradient(0, 0, r * 0.05, 0, 0, r * 0.9);
    gr.addColorStop(0, f.flesh[0]); gr.addColorStop(1, f.flesh[1]);
    g.fillStyle = gr;
    g.beginPath(); g.ellipse(0, 0, r * 0.86, r * 0.29, 0, 0, Math.PI * 2); g.fill();
    if (f.segments) {
      g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1;
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.26); g.stroke(); }
    }
    if (f.ring) { g.fillStyle = '#fffbe0'; g.beginPath(); g.ellipse(0, 0, r * 0.22, r * 0.08, 0, 0, Math.PI * 2); g.fill(); }
    if (f.seeds) {
      g.fillStyle = f.seeds;
      const n = f.ring ? 12 : 6;
      for (let i = 0; i < n; i++) {
        const a = i * Math.PI * 2 / n, d = f.ring ? 0.42 : 0.5;
        g.beginPath(); g.ellipse(Math.cos(a) * r * d, Math.sin(a) * r * d * 0.33, r * 0.05, r * 0.03, 0, 0, Math.PI * 2); g.fill();
      }
    }
  }

  function drawBomb(g, r, time) {
    const glow = 0.5 + 0.5 * Math.sin(time * 14);
    g.fillStyle = 'rgba(255,40,40,' + (0.18 + glow * 0.18) + ')';
    g.beginPath(); g.arc(0, 0, r * 1.45, 0, Math.PI * 2); g.fill();
    const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
    gr.addColorStop(0, '#6b6b7a'); gr.addColorStop(0.5, '#25252e'); gr.addColorStop(1, '#050508');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#3a3a46'; g.fillRect(-r * 0.22, -r * 1.12, r * 0.44, r * 0.3);
    g.strokeStyle = '#c8a26a'; g.lineWidth = r * 0.1; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, -r * 1.1); g.quadraticCurveTo(r * 0.3, -r * 1.5, r * 0.5, -r * 1.35); g.stroke();
    g.fillStyle = glow > 0.5 ? '#fff6a0' : '#ff9a1c';
    g.beginPath(); g.arc(r * 0.52, -r * 1.36, r * (0.12 + glow * 0.1), 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,60,60,0.9)'; g.lineWidth = r * 0.12;
    g.beginPath(); g.moveTo(-r * 0.3, -r * 0.3); g.lineTo(r * 0.3, r * 0.3); g.moveTo(r * 0.3, -r * 0.3); g.lineTo(-r * 0.3, r * 0.3); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.45)';
    g.beginPath(); g.ellipse(-r * 0.4, -r * 0.42, r * 0.22, r * 0.12, -0.6, 0, Math.PI * 2); g.fill();
  }

  function drawBackground(g, W, H, time) {
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#5a3a22'); gr.addColorStop(1, '#2e1c10');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // wooden planks
    const pw = Math.max(60, W / 5);
    for (let i = 0; i * pw < W + pw; i++) {
      g.fillStyle = i % 2 ? 'rgba(255,220,170,0.05)' : 'rgba(0,0,0,0.08)';
      g.fillRect(i * pw, 0, pw, H);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(i * pw - 1, 0, 2, H);
      g.strokeStyle = 'rgba(255,220,170,0.06)'; g.lineWidth = 1.5;
      for (let k = 0; k < 4; k++) {
        const y0 = ((i * 137 + k * 211) % 100) / 100 * H;
        g.beginPath(); g.ellipse(i * pw + pw * 0.5, y0, pw * 0.25, 10 + k * 4, 0, 0, Math.PI * 2); g.stroke();
      }
    }
    const vg = g.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.2, W / 2, H * 0.45, Math.max(W, H) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
  }

  // ---------- difficulty ----------
  function params(diff, lv, endless) {
    if (endless) return { g: 1.55, gap: 1.1, wmin: 1, wmax: 3, bomb: 0.12, target: Infinity };
    if (diff === 0) return { g: 1.2, gap: Math.max(0.95, 1.6 - lv * 0.03), wmin: 1, wmax: lv < 4 ? 2 : 3, bomb: lv < 3 ? 0 : Math.min(0.12, 0.05 + lv * 0.003), target: Math.min(60, 8 + lv * 2) };
    if (diff === 1) return { g: 1.6, gap: Math.max(0.7, 1.15 - lv * 0.012), wmin: 2, wmax: lv < 10 ? 4 : 5, bomb: Math.min(0.22, 0.15 + lv * 0.002), target: Math.min(90, 22 + lv * 2) };
    return { g: 2.05, gap: Math.max(0.55, 0.85 - lv * 0.008), wmin: 3, wmax: lv < 12 ? 5 : 6, bomb: Math.min(0.32, 0.25 + lv * 0.002), target: Math.min(120, 32 + lv * 2) };
  }

  MG.register({
    id: 'ninja', name: '切水果', icon: '🍉', color: '#2f9e5a', endless: true,
    _params: params,
    create(api) {
      const U = api.util;
      const diff = api.diff || 0, endless = !!api.endless, rng = api.rng;
      const P = params(diff, api.level, endless);
      let W = api.W, H = api.H, R0 = 26;
      const items = [];          // fruits + bombs in flight
      const halves = [], parts = [], splats = [], pops = [], trail = [];
      let time = 0, spawnT = 0.7, sliced = 0, score = 0, misses = 0, shake = 0, flash = 0;
      let swipe = null, last = null, comboT = 0, comboN = 0, comboX = 0, comboY = 0;
      let ending = null, waves = 0, nextId = 1;
      const sprites = {};

      function layout() { W = api.W; H = api.H; R0 = Math.max(18, Math.min(34, Math.min(W, H * 0.6) * 0.07)); for (const k in sprites) delete sprites[k]; }
      layout();

      function sprite(fi) {
        const f = FRUITS[fi], r = R0 * f.r, key = fi + '_' + Math.round(r);
        if (sprites[key] !== undefined) return sprites[key];
        let cv = null;
        try {
          const S = Math.ceil(r * 2.8) * 2;
          cv = document.createElement('canvas'); cv.width = S; cv.height = S;
          const c = cv.getContext('2d');
          c.scale(2, 2); c.translate(S / 4, S / 4);
          drawFruitBody(c, f, r);
          cv._half = S / 4;
        } catch (e) { cv = null; }
        sprites[key] = cv;
        return cv;
      }
      function blitFruit(g, fi, r) {
        const sp = sprite(fi);
        if (sp && sp._half) g.drawImage(sp, -sp._half, -sp._half, sp._half * 2, sp._half * 2);
        else drawFruitBody(g, FRUITS[fi], r);
      }

      function setInfo() {
        if (endless) api.info('無盡模式・漏接 3 個或切到炸彈就結束');
        else if (!diff && api.level === 1 && sliced === 0) api.info('用手指劃過水果把它切開！');
        else api.info('切 ' + sliced + ' / ' + P.target + ' 個' + (P.bomb > 0 ? '・別碰炸彈' : ''));
      }
      setInfo();
      api.score(0);

      function toss(kind, fi, x, apexH, vxBias) {
        const g = P.g * H;
        const r = kind === 'bomb' ? R0 * 0.95 : R0 * FRUITS[fi].r;
        const vy = -Math.sqrt(2 * g * apexH);
        const tUp = -vy / g;
        const targetX = W * (0.2 + rng() * 0.6);
        const vx = (targetX - x) / (tUp * 2) * (0.6 + rng() * 0.6) + vxBias;
        items.push({ id: nextId++, kind, fi, x, y: H + r + 4, vx, vy, r, rot: rng() * 6, vr: (rng() - 0.5) * 6, seen: false });
      }

      function wave() {
        waves++;
        const ramp = endless ? Math.min(1, time / 150) : 0;
        const wmax = endless ? Math.round(P.wmax + ramp * 3) : P.wmax;
        let n = P.wmin + Math.floor(rng() * (wmax - P.wmin + 1));
        if (!endless && !diff && api.level === 1 && waves <= 2) n = 1;
        const bombP = endless ? Math.min(0.3, P.bomb + ramp * 0.18) : P.bomb;
        const burst = n >= 3 && rng() < 0.4;
        for (let i = 0; i < n; i++) {
          const isBomb = rng() < bombP && !(i === 0 && n === 1 && waves < 3);
          const x = W * (0.12 + rng() * 0.76);
          const apex = H * (0.5 + rng() * 0.32);
          const delay = burst ? 0 : i * (0.12 + rng() * 0.18);
          const fi = Math.floor(rng() * FRUITS.length);
          queue.push({ t: time + delay, kind: isBomb ? 'bomb' : 'fruit', fi, x, apex, bias: (rng() - 0.5) * 30 });
        }
      }
      const queue = [];

      function popText(x, y, txt, col, size) { if (pops.length > 20) pops.shift(); pops.push({ x, y, txt, col, size, life: 0.9, max: 0.9 }); }

      function sliceFruit(it, dx, dy) {
        const f = FRUITS[it.fi];
        const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
        const ang = Math.atan2(uy, ux);
        const nx = -uy, ny = ux, sp = 70 + Math.random() * 40;
        halves.push({ fi: it.fi, x: it.x, y: it.y, vx: it.vx * 0.7 - nx * sp, vy: it.vy * 0.4 - ny * sp - 60, ang, rot: it.rot, vr: 3 + Math.random() * 3, side: 0, r: it.r, life: 2.2 });
        halves.push({ fi: it.fi, x: it.x, y: it.y, vx: it.vx * 0.7 + nx * sp, vy: it.vy * 0.4 + ny * sp - 60, ang, rot: it.rot, vr: -3 - Math.random() * 3, side: 1, r: it.r, life: 2.2 });
        for (let i = 0; i < 16 && parts.length < 300; i++) {
          const a = ang + (Math.random() - 0.5) * 1.2 + (i & 1 ? Math.PI : 0) + Math.PI / 2, v = 60 + Math.random() * 220;
          parts.push({ x: it.x, y: it.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: 0.6, max: 0.6, col: i % 3 ? f.juice : f.flesh[0], s: 2 + Math.random() * 3.5, g: 500 });
        }
        if (splats.length > 14) splats.shift();
        splats.push({ x: it.x, y: it.y, r: it.r * (1.2 + Math.random() * 0.5), col: f.juice, life: 2.2, max: 2.2, seed: Math.random() * 10 });
        sliced++; score++;
        comboN++; comboT = 0.22; comboX = it.x; comboY = it.y;
        api.sfx('pop');
        if (!endless && sliced >= P.target && !ending) { ending = { won: true, t: 0 }; api.sfx('good'); popText(W / 2, H * 0.4, '過關！', '#fff36b', 34); }
        api.score(score);
        setInfo();
      }

      function blowUp(it) {
        flash = 1; shake = 18;
        for (let i = 0; i < 50 && parts.length < 400; i++) {
          const a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 380;
          parts.push({ x: it.x, y: it.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.9, max: 0.9, col: i % 2 ? '#ffcf3a' : '#ff5a2a', s: 3 + Math.random() * 4, g: 0 });
        }
        api.sfx('lose');
        ending = { won: false, t: 0, text: '切到炸彈了！' };
        api.lose(endless ? '切到炸彈了！' : '切到炸彈了！');
      }

      function miss(it) {
        misses++;
        shake = Math.max(shake, 5);
        api.sfx('bad');
        popText(Math.max(30, Math.min(W - 30, it.x)), H - 30, '✕', '#ff4d5e', 30);
        if (misses >= 3 && !ending) { ending = { won: false, t: 0 }; api.lose(endless ? '漏接 3 個水果' : '漏接了 3 個水果'); }
      }

      function segHits(x0, y0, x1, y1, cx, cy, r) {
        const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy;
        let t = l2 > 0 ? ((cx - x0) * dx + (cy - y0) * dy) / l2 : 0;
        t = Math.max(0, Math.min(1, t));
        const qx = x0 + dx * t - cx, qy = y0 + dy * t - cy;
        return qx * qx + qy * qy <= r * r;
      }

      function cut(x0, y0, x1, y1) {
        const len = Math.hypot(x1 - x0, y1 - y0);
        if (len < 5) return;
        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i];
          if (!segHits(x0, y0, x1, y1, it.x, it.y, it.r * (it.kind === 'bomb' ? 0.85 : 1.05))) continue;
          items.splice(i, 1);
          if (it.kind === 'bomb') { blowUp(it); return; }
          sliceFruit(it, x1 - x0, y1 - y0);
        }
      }

      function down(x, y) {
        if (api.ended || ending) return;
        swipe = true; last = [x, y];
        trail.length = 0; trail.push({ x, y, t: time });
      }
      function move(x, y) {
        if (!swipe || api.ended) return;
        cut(last[0], last[1], x, y);
        last = [x, y];
        trail.push({ x, y, t: time });
        if (trail.length > 24) trail.shift();
      }
      function up(x, y) {
        if (swipe && !api.ended) { cut(last[0], last[1], x, y); trail.push({ x, y, t: time }); }
        swipe = false;
      }

      function update(dt) {
        time += dt;
        shake = Math.max(0, shake - dt * 40); flash = Math.max(0, flash - dt * 1.6);
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i]; p.life -= dt;
          if (p.life <= 0) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
          p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.97;
        }
        for (let i = splats.length - 1; i >= 0; i--) { splats[i].life -= dt; if (splats[i].life <= 0) splats.splice(i, 1); }
        for (let i = pops.length - 1; i >= 0; i--) { pops[i].life -= dt; pops[i].y -= dt * 30; if (pops[i].life <= 0) pops.splice(i, 1); }
        while (trail.length && time - trail[0].t > 0.16) trail.shift();
        const gpx = P.g * H;
        for (let i = halves.length - 1; i >= 0; i--) {
          const h = halves[i];
          h.vy += gpx * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.rot += h.vr * dt; h.life -= dt;
          if (h.life <= 0 || h.y > H + 80) halves.splice(i, 1);
        }
        if (comboT > 0) {
          comboT -= dt;
          if (comboT <= 0) {
            if (comboN >= 3) {
              const bonus = comboN;
              score += bonus;
              popText(comboX, comboY - 30, comboN + ' 連擊！+' + bonus, '#ffe14a', 22);
              api.sfx('good'); shake = Math.max(shake, 4);
              api.score(score);
            }
            comboN = 0;
          }
        }
        if (ending) {
          ending.t += dt;
          if (ending.won && ending.t > 0.5) api.win('切了 ' + sliced + ' 個水果！');
        }
        if (api.ended) return;
        // spawning
        if (!ending || ending.won) {
          spawnT -= dt;
          if (spawnT <= 0 && !ending) {
            wave();
            const ramp = endless ? Math.min(1, time / 150) : 0;
            spawnT = (endless ? P.gap - ramp * 0.5 : P.gap) * (0.85 + rng() * 0.3);
          }
          for (let i = queue.length - 1; i >= 0; i--) {
            if (queue[i].t <= time) { const q = queue[i]; queue.splice(i, 1); if (!ending) toss(q.kind, q.fi, q.x, q.apex, q.bias); }
          }
        }
        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i];
          it.vy += gpx * dt; it.x += it.vx * dt; it.y += it.vy * dt; it.rot += it.vr * dt;
          if (it.x < it.r && it.vx < 0) it.vx = -it.vx * 0.6;
          if (it.x > W - it.r && it.vx > 0) it.vx = -it.vx * 0.6;
          if (it.y < H - it.r) it.seen = true;
          if (it.seen && it.vy > 0 && it.y > H + it.r + 6) {
            items.splice(i, 1);
            if (it.kind === 'fruit' && !ending) miss(it);
          }
        }
      }

      function draw(g) {
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        drawBackground(g, W, H, time);
        for (const s of splats) {
          g.globalAlpha = Math.max(0, s.life / s.max) * 0.55;
          g.fillStyle = s.col;
          g.beginPath();
          for (let k = 0; k < 10; k++) {
            const a = k / 10 * Math.PI * 2, rr = s.r * (0.7 + 0.35 * Math.sin(s.seed + k * 2.3));
            if (k) g.lineTo(s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr); else g.moveTo(s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr);
          }
          g.closePath(); g.fill();
          g.beginPath(); g.arc(s.x + s.r * 1.1, s.y + s.r * 0.4, s.r * 0.18, 0, Math.PI * 2); g.arc(s.x - s.r * 0.9, s.y - s.r * 0.7, s.r * 0.12, 0, Math.PI * 2); g.fill();
        }
        g.globalAlpha = 1;
        // halves
        for (const h of halves) {
          const r = h.r;
          g.save(); g.translate(h.x, h.y); g.rotate(h.ang + h.rot * 0.25);
          g.globalAlpha = Math.min(1, h.life * 2);
          g.save();
          g.beginPath();
          if (h.side === 0) g.rect(-r * 1.6, -r * 1.6, r * 3.2, r * 1.6); else g.rect(-r * 1.6, 0, r * 3.2, r * 1.6);
          g.clip();
          g.rotate(-h.ang + h.rot);
          blitFruit(g, h.fi, r);
          g.restore();
          drawFlesh(g, FRUITS[h.fi], r);
          g.restore();
        }
        g.globalAlpha = 1;
        // whole fruit + bombs
        for (const it of items) {
          g.save(); g.translate(it.x, it.y);
          g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(it.r * 0.15, it.r * 0.25, it.r * 0.95, it.r * 0.9, 0, 0, Math.PI * 2); g.fill();
          g.rotate(it.rot);
          if (it.kind === 'bomb') drawBomb(g, it.r, time); else blitFruit(g, it.fi, it.r);
          g.restore();
        }
        // particles
        for (const p of parts) {
          g.globalAlpha = Math.max(0, p.life / p.max);
          g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, p.s, 0, Math.PI * 2); g.fill();
        }
        g.globalAlpha = 1;
        // blade trail
        if (trail.length > 1) {
          for (let pass = 0; pass < 2; pass++) {
            g.fillStyle = pass ? '#ffffff' : 'rgba(120,220,255,0.55)';
            const wmax = pass ? 4 : 9;
            g.beginPath();
            const n = trail.length;
            for (let i = 0; i < n; i++) {
              const a = trail[Math.max(0, i - 1)], b = trail[Math.min(n - 1, i + 1)];
              const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
              const w = wmax * (i / (n - 1));
              const px = trail[i].x - dy / l * w, py = trail[i].y + dx / l * w;
              if (i) g.lineTo(px, py); else g.moveTo(px, py);
            }
            for (let i = n - 1; i >= 0; i--) {
              const a = trail[Math.max(0, i - 1)], b = trail[Math.min(n - 1, i + 1)];
              const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
              const w = wmax * (i / (n - 1));
              g.lineTo(trail[i].x + dy / l * w, trail[i].y - dx / l * w);
            }
            g.closePath(); g.fill();
          }
        }
        // pops
        for (const p of pops) {
          const t = 1 - p.life / p.max, s = t < 0.15 ? 0.5 + t / 0.15 * 0.7 : 1.2 - Math.min(0.2, t - 0.15);
          g.globalAlpha = Math.min(1, p.life / p.max * 2);
          g.save(); g.translate(p.x, p.y); g.scale(s, s);
          U.text(g, p.txt, 2, 2, p.size, 'rgba(0,0,0,0.45)', 'center', 900);
          U.text(g, p.txt, 0, 0, p.size, p.col, 'center', 900);
          g.restore();
        }
        g.globalAlpha = 1;
        g.restore();
        if (flash > 0) { g.fillStyle = 'rgba(255,255,240,' + Math.min(1, flash) + ')'; g.fillRect(0, 0, W, H); }
        // HUD
        U.text(g, '🍉', 26, 30, 24, '#fff');
        U.text(g, String(score), 46, 31, 28, '#ffe14a', 'left', 900);
        if (endless) U.text(g, '最高 ' + Math.max(api.best || 0, score), 46, 56, 13, 'rgba(255,255,255,0.8)', 'left', 800);
        else {
          const p = Math.min(1, sliced / P.target);
          g.fillStyle = 'rgba(0,0,0,0.35)'; U.rr(g, 16, 52, 120, 8, 4); g.fill();
          g.fillStyle = '#4cd986'; if (p > 0) { U.rr(g, 16, 52, 120 * p, 8, 4); g.fill(); }
          U.text(g, sliced + '/' + P.target, 142, 56, 12, '#fff', 'left', 800);
        }
        for (let i = 0; i < 3; i++) {
          const lost = i < misses;
          U.text(g, '✕', W - 24 - (2 - i) * 28, 30, lost ? 28 : 22, lost ? '#ff3b4e' : 'rgba(255,255,255,0.3)', 'center', 900);
        }
        if (!endless && !diff && api.level === 1 && sliced === 0 && items.length) {
          const it = items[0];
          const t = (time * 1.6) % 1;
          U.text(g, '👆', it.x - it.r * 1.6 + t * it.r * 3.2, it.y + it.r * 1.2, 26, '#fff');
        }
      }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _items: () => items, _state: () => ({ sliced, score, misses, target: P.target }),
      };
    },
  });
})();
