// 疊高塔 — Stack: isometric slabs slide over the tower, tap to drop, overhang is sliced off.
(function () {
  'use strict';

  const HH = 0.22;          // slab thickness (world units; base slab is 1 x 1)
  const RANGE = 1.35;       // slide distance from the tower centre
  const PERFECT = 0.05;     // perfect-drop tolerance (world units)
  const GROW = 0.05;        // growth per perfect drop once the streak is >= 3
  const CO = Math.cos(Math.PI / 6), SI = 0.5;

  // diff: 0 簡單 (original), 1 普通, 2 困難; endless = 無盡 (no target, speed keeps ramping)
  function targetOf(level, diff, endless) {
    if (endless) return Infinity;
    if (diff === 1) return Math.min(60, 20 + 2 * (level - 1));
    if (diff === 2) return Math.min(70, 30 + 2 * (level - 1));
    return Math.min(50, 10 + 2 * (level - 1));
  }
  function speedOf(level, height, diff, endless) {
    if (endless) return Math.min(3.4, 1.7 + 0.015 * height);
    if (diff === 1) return Math.min(2.6, 1.6 + 0.03 * (level - 1) + 0.008 * height);
    if (diff === 2) return Math.min(3.0, 2.0 + 0.035 * (level - 1) + 0.01 * height);
    return Math.min(2.2, 1.15 + 0.022 * (level - 1) + 0.006 * height);
  }
  function perfectOf(diff, endless) { return endless ? 0.036 : diff === 1 ? 0.042 : diff === 2 ? 0.034 : PERFECT; }

  function hsl(h, s, l) { return 'hsl(' + ((h % 360 + 360) % 360).toFixed(0) + ',' + s + '%,' + l + '%)'; }
  const OL = '#2a1a14';   // cartoon outline colour (卡通 Q 版 style)

  MG.register({
    id: 'stack', name: '疊高塔', icon: '🏗️', color: '#b26bff',
    _targetOf: targetOf, _speedOf: speedOf, _perfectOf: perfectOf,
    endless: true,
    create(api) {
      const U = api.util;
      const diff = api.diff || 0, endless = !!api.endless;
      const target = targetOf(api.level, diff, endless);
      const tol = perfectOf(diff, endless);
      const hue0 = Math.floor(api.rng() * 360);
      const slabs = [];
      let s = 100, cx = 0, baseY = 0;
      let camY = 0, zoom = 1;
      let cur = null;
      let axis = 'x', dir = 1, streak = 0, placed = 0, slabId = 0;
      let time = 0, shake = 0, done = null, doneT = 0, scorePop = 0;
      const debris = [], rings = [], parts = [];

      function colorsFor(i) {
        const h = hue0 + i * 6;
        return { top: hsl(h, 85, 70), left: hsl(h, 72, 56), right: hsl(h, 64, 44), edge: hsl(h, 80, 80) };
      }
      function addSlab(x, z, w, d, y, i) {
        const c = colorsFor(i);
        slabs.push({ x, z, w, d, y, top: c.top, left: c.left, right: c.right, edge: c.edge, flash: 0 });
      }
      addSlab(0, 0, 1, 1, -HH, 0);

      function layout() {
        const W = api.W, H = api.H;
        s = Math.min(W * 0.29, H * 0.17);
        cx = W / 2; baseY = H * 0.62;
      }
      layout();

      function topSlab() { return slabs[slabs.length - 1]; }
      function topY() { return slabs.length * HH - HH; }

      function spawn() {
        const t = topSlab();
        axis = (placed % 2 === 0) ? 'x' : 'z';
        dir = 1;
        const start = -RANGE;
        cur = { x: t.x, z: t.z, w: t.w, d: t.d, y: topY(), id: ++slabId, col: colorsFor(slabs.length) };
        if (axis === 'x') cur.x = t.x + start; else cur.z = t.z + start;
        cur.speed = speedOf(api.level, placed, diff, endless);
      }
      spawn();

      function info() {
        if (endless) api.info('無盡模式　高度 ' + placed + '　最高 ' + Math.max(api.best || 0, placed));
        else if (!diff && api.level === 1 && placed < 2) api.info('看準時機點一下，放下方塊！');
        else api.info('高度 ' + placed + ' / ' + target + (streak >= 2 ? '　連續完美 ×' + streak : ''));
      }
      info();

      // time until the moving slab's centre lines up with the tower (for the test bot)
      function aimTime() {
        if (!cur) return 0;
        const t = topSlab();
        const p = axis === 'x' ? cur.x - t.x : cur.z - t.z;
        if (dir > 0) return p <= 0 ? -p / cur.speed : ((RANGE - p) + RANGE) / cur.speed;
        return p >= 0 ? p / cur.speed : ((p + RANGE) + RANGE) / cur.speed;
      }

      function burst(x, y, n, col, spd) {
        for (let i = 0; i < n && parts.length < 260; i++) {
          const a = Math.random() * Math.PI * 2, v = spd * (0.3 + Math.random());
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spd * 0.6, life: 1, max: 1, col, sz: 2 + Math.random() * 3, conf: false, rot: 0 });
        }
      }
      function confetti() {
        const pal = U.PALETTE;
        for (let i = 0; i < 110 && parts.length < 360; i++) {
          parts.push({ x: api.W * Math.random(), y: -10 - Math.random() * 80, vx: (Math.random() - 0.5) * 80, vy: 80 + Math.random() * 160, life: 2.6, max: 2.6, col: pal[i % 8], sz: 3 + Math.random() * 3, conf: true, rot: Math.random() * 6 });
        }
      }

      function drop() {
        if (!cur || done) return;
        const t = topSlab();
        const isX = axis === 'x';
        const size = isX ? t.w : t.d;
        const delta = isX ? cur.x - t.x : cur.z - t.z;
        const ad = Math.abs(delta);
        const y = cur.y;
        if (ad <= tol) {
          streak++;
          let w = t.w, d = t.d;
          if (streak >= 3) { if (isX) w = Math.min(1, w + GROW); else d = Math.min(1, d + GROW); }
          addSlab(t.x, t.z, w, d, y, slabs.length);
          topSlab().flash = 1;
          rings.push({ x: t.x, z: t.z, w, d, y: y + HH, life: 0.6, grow: streak >= 3 });
          api.sfx(streak >= 3 ? 'good' : 'pop');
          const sp = proj(t.x, y + HH, t.z);
          burst(sp[0], sp[1], streak >= 3 ? 16 : 8, '#ffffff', 120);
        } else if (ad >= size) {
          debris.push({ x: cur.x, z: cur.z, w: cur.w, d: cur.d, y, vy: 0, rot: 0, vr: (Math.random() - 0.5) * 3, vx: isX ? Math.sign(delta) * 0.6 : 0, vz: isX ? 0 : Math.sign(delta) * 0.6, col: cur.col });
          cur = null;
          streak = 0; shake = 10;
          api.sfx('bad');
          done = 'lose'; doneT = 0;
          api.lose('疊到 ' + placed + ' 層');
          return;
        } else {
          streak = 0;
          const keep = size - ad;
          const c0 = (isX ? t.x : t.z) + delta / 2;
          const cut = ad;
          const debCenter = delta > 0 ? (isX ? t.x : t.z) + size / 2 + ad / 2 : (isX ? t.x : t.z) - size / 2 - ad / 2;
          if (isX) {
            addSlab(c0, t.z, keep, t.d, y, slabs.length);
            debris.push({ x: debCenter, z: t.z, w: cut, d: t.d, y, vy: 0, rot: 0, vr: Math.sign(delta) * (1.5 + Math.random() * 2), vx: Math.sign(delta) * 0.5, vz: 0, col: cur.col });
          } else {
            addSlab(t.x, c0, t.w, keep, y, slabs.length);
            debris.push({ x: t.x, z: debCenter, w: t.w, d: cut, y, vy: 0, rot: 0, vr: -Math.sign(delta) * (1.5 + Math.random() * 2), vx: 0, vz: Math.sign(delta) * 0.5, col: cur.col });
          }
          topSlab().flash = 0.5;
          api.sfx('drop');
          shake = Math.max(shake, 2);
        }
        placed++;
        if (api.score) api.score(placed);
        scorePop = 1;
        if (placed >= target) {
          cur = null; done = 'win'; doneT = 0;
          confetti();
          api.win('疊到 ' + placed + ' 層！');
          info();
          return;
        }
        spawn();
        info();
      }

      function update(dt) {
        time += dt;
        scorePop = Math.max(0, scorePop - dt * 4);
        shake = Math.max(0, shake - dt * 30);
        for (let i = slabs.length - 1; i >= Math.max(0, slabs.length - 4); i--) slabs[i].flash = Math.max(0, slabs[i].flash - dt * 2.5);
        for (let i = rings.length - 1; i >= 0; i--) { rings[i].life -= dt; if (rings[i].life <= 0) rings.splice(i, 1); }
        for (let i = debris.length - 1; i >= 0; i--) {
          const b = debris[i];
          b.vy -= 14 * dt; b.y += b.vy * dt; b.x += b.vx * dt; b.z += b.vz * dt; b.rot += b.vr * dt;
          if (b.y < camY - 12) debris.splice(i, 1);
        }
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i]; p.life -= dt;
          if (p.life <= 0) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
          if (p.conf) { p.x += p.vx * dt + Math.sin(time * 3 + p.rot) * 0.6; p.y += p.vy * dt; p.rot += dt * 5; }
          else { p.vy += 300 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
        }
        // camera
        const hTop = topY() + HH;
        const want = Math.max(0, hTop - (0.2 * api.H) / s);
        if (done) {
          doneT += dt;
          const fit = Math.min(1, (0.5 * api.H) / Math.max(0.01, (hTop + 1) * s));
          zoom += (fit - zoom) * Math.min(1, dt * 2.5);
          camY += (hTop * 0.42 - camY) * Math.min(1, dt * 2.5);
        } else {
          camY += (want - camY) * Math.min(1, dt * 4);
        }
        if (api.ended || !cur || done) return;
        const t = topSlab();
        const step = cur.speed * dt * dir;
        if (axis === 'x') {
          cur.x += step;
          if (cur.x - t.x > RANGE) { cur.x = t.x + RANGE; dir = -1; } else if (cur.x - t.x < -RANGE) { cur.x = t.x - RANGE; dir = 1; }
        } else {
          cur.z += step;
          if (cur.z - t.z > RANGE) { cur.z = t.z + RANGE; dir = -1; } else if (cur.z - t.z < -RANGE) { cur.z = t.z - RANGE; dir = 1; }
        }
      }

      // world -> screen
      const P = [0, 0];
      function proj(x, y, z) {
        const k = s * zoom;
        P[0] = cx + (x - z) * CO * k;
        P[1] = baseY + (x + z) * SI * k - (y - camY) * k;
        return P;
      }

      // cartoon slab: flat faces, thick dark outline, white gloss strip on the top face
      function box(g, x, z, w, d, y0, y1, top, left, right, edge, flash) {
        const x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2;
        // corners
        let p = proj(x0, y1, z0); const ax = p[0], ay = p[1];
        p = proj(x1, y1, z0); const bx = p[0], by = p[1];
        p = proj(x1, y1, z1); const cxp = p[0], cyp = p[1];
        p = proj(x0, y1, z1); const dx = p[0], dy = p[1];
        const hgt = (y1 - y0) * s * zoom;
        const lw = Math.max(1.5, Math.min(3.2, s * zoom * 0.026));
        g.lineJoin = 'round';
        // right face (x = x1)
        g.fillStyle = right;
        g.beginPath(); g.moveTo(bx, by); g.lineTo(cxp, cyp); g.lineTo(cxp, cyp + hgt); g.lineTo(bx, by + hgt); g.closePath(); g.fill();
        // left face (z = z1)
        g.fillStyle = left;
        g.beginPath(); g.moveTo(dx, dy); g.lineTo(cxp, cyp); g.lineTo(cxp, cyp + hgt); g.lineTo(dx, dy + hgt); g.closePath(); g.fill();
        // light band along the bottom of the side faces
        if (hgt > 8) {
          g.fillStyle = 'rgba(255,255,255,0.16)';
          g.beginPath(); g.moveTo(dx, dy + hgt * 0.62); g.lineTo(cxp, cyp + hgt * 0.62); g.lineTo(bx, by + hgt * 0.62);
          g.lineTo(bx, by + hgt * 0.78); g.lineTo(cxp, cyp + hgt * 0.78); g.lineTo(dx, dy + hgt * 0.78); g.closePath(); g.fill();
        }
        // top
        g.fillStyle = top;
        g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(cxp, cyp); g.lineTo(dx, dy); g.closePath(); g.fill();
        if (flash > 0) { g.fillStyle = 'rgba(255,255,255,' + (flash * 0.75).toFixed(3) + ')'; g.fill(); }
        // gloss strip near the back edges of the top
        if (edge) {
          const gx = (cxp - ax) * 0.16, gy = (cyp - ay) * 0.16;
          g.fillStyle = 'rgba(255,255,255,0.45)';
          g.beginPath(); g.moveTo(ax + gx * 0.5, ay + gy * 0.5); g.lineTo(ax + (bx - ax) * 0.55 + gx * 0.5, ay + (by - ay) * 0.55 + gy * 0.5);
          g.lineTo(ax + (bx - ax) * 0.55 + gx * 1.4, ay + (by - ay) * 0.55 + gy * 1.4); g.lineTo(ax + gx * 1.4, ay + gy * 1.4); g.closePath(); g.fill();
        }
        // outline: silhouette + inner edges
        g.strokeStyle = OL; g.lineWidth = lw;
        g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(bx, by + hgt); g.lineTo(cxp, cyp + hgt); g.lineTo(dx, dy + hgt); g.lineTo(dx, dy); g.closePath();
        g.moveTo(dx, dy); g.lineTo(cxp, cyp); g.lineTo(bx, by); g.moveTo(cxp, cyp); g.lineTo(cxp, cyp + hgt);
        g.stroke();
      }

      // ---------- background: sky that darkens to space as the tower climbs ----------
      let scene = null, sceneW = 0, cloudSpr = null, balloonSpr = null;
      function lerpCol(a, b, t) {
        const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
        const r = Math.round(((pa >> 16) & 255) + ((((pb >> 16) & 255) - ((pa >> 16) & 255)) * t));
        const gg = Math.round(((pa >> 8) & 255) + ((((pb >> 8) & 255) - ((pa >> 8) & 255)) * t));
        const bb = Math.round((pa & 255) + (((pb & 255) - (pa & 255)) * t));
        return 'rgb(' + r + ',' + gg + ',' + bb + ')';
      }
      const SKY = [[0, '#6cc4ff', '#d6f1ff'], [5, '#7f8cf0', '#ffc6a8'], [10, '#3b3a9a', '#b56fb8'], [15, '#160f3a', '#3c2a78']];
      function skyAt(alt, i) {
        if (alt <= SKY[0][0]) return SKY[0][i];
        for (let k = 1; k < SKY.length; k++) if (alt < SKY[k][0]) return lerpCol(SKY[k - 1][i], SKY[k][i], (alt - SKY[k - 1][0]) / (SKY[k][0] - SKY[k - 1][0]));
        return SKY[SKY.length - 1][i];
      }
      function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
      function buildScene() {
        const W = api.W, d = 2;
        sceneW = W;
        // cartoon cloud
        cloudSpr = mk(120 * d, 60 * d);
        let c = cloudSpr.getContext('2d'); c.scale(d, d);
        const puffs = [[30, 38, 16], [52, 28, 20], [76, 32, 17], [92, 40, 12], [58, 42, 16]];
        c.lineWidth = 6; c.strokeStyle = OL;
        for (const q of puffs) { c.beginPath(); c.arc(q[0], q[1], q[2], 0, 7); c.stroke(); }
        c.fillStyle = '#ffffff';
        for (const q of puffs) { c.beginPath(); c.arc(q[0], q[1], q[2], 0, 7); c.fill(); }
        c.fillStyle = '#dce9f7'; c.beginPath(); c.ellipse(60, 50, 34, 5, 0, 0, 7); c.fill();
        // hot-air balloon
        balloonSpr = mk(70 * d, 100 * d);
        c = balloonSpr.getContext('2d'); c.scale(d, d); c.lineWidth = 3; c.strokeStyle = OL; c.lineJoin = 'round';
        c.beginPath(); c.moveTo(24, 60); c.lineTo(29, 78); c.moveTo(46, 60); c.lineTo(41, 78); c.stroke();
        c.beginPath(); c.arc(35, 34, 28, Math.PI * 0.8, Math.PI * 2.2); c.lineTo(35, 66); c.closePath(); c.fillStyle = '#ff5d6c'; c.fill(); c.stroke();
        c.fillStyle = '#ffcc4d'; c.beginPath(); c.ellipse(35, 36, 10, 29, 0, 0, 7); c.fill();
        c.beginPath(); c.arc(35, 34, 28, Math.PI * 0.8, Math.PI * 2.2); c.lineTo(35, 66); c.closePath(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(22, 22, 5, 9, 0.5, 0, 7); c.fill();
        U.rr(c, 26, 76, 18, 13, 3); c.fillStyle = '#b07a4a'; c.fill(); c.stroke();
        // ground strip: hills, little houses, trees (drawn once, scrolls with the camera)
        scene = mk(W * d, 260 * d);
        c = scene.getContext('2d'); c.scale(d, d); c.lineJoin = 'round';
        const hill = (x, y, rx, ry, col) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, Math.PI, 0); c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke(); };
        hill(W * 0.15, 120, W * 0.32, 70, '#8fd36a'); hill(W * 0.85, 125, W * 0.35, 80, '#7cc75c'); hill(W * 0.5, 130, W * 0.3, 50, '#9ddc78');
        c.fillStyle = '#6cbf4e'; c.fillRect(0, 118, W, 142);
        c.lineWidth = 3; c.strokeStyle = OL; c.beginPath(); c.moveTo(0, 118); c.lineTo(W, 118); c.stroke();
        const house = (x, y, w, col, roof) => {
          c.lineWidth = 2.5; c.strokeStyle = OL;
          c.fillStyle = col; c.fillRect(x, y - w * 0.7, w, w * 0.7); c.strokeRect(x, y - w * 0.7, w, w * 0.7);
          c.beginPath(); c.moveTo(x - 4, y - w * 0.7); c.lineTo(x + w / 2, y - w * 1.15); c.lineTo(x + w + 4, y - w * 0.7); c.closePath(); c.fillStyle = roof; c.fill(); c.stroke();
          c.fillStyle = '#8fd6ff'; c.fillRect(x + w * 0.18, y - w * 0.5, w * 0.24, w * 0.22); c.strokeRect(x + w * 0.18, y - w * 0.5, w * 0.24, w * 0.22);
          c.fillStyle = '#a0623a'; c.fillRect(x + w * 0.58, y - w * 0.38, w * 0.22, w * 0.38); c.strokeRect(x + w * 0.58, y - w * 0.38, w * 0.22, w * 0.38);
        };
        const tree = (x, y, r) => {
          c.lineWidth = 2.5; c.strokeStyle = OL;
          c.fillStyle = '#8a5a3c'; c.fillRect(x - 3, y - r, 6, r); c.strokeRect(x - 3, y - r, 6, r);
          c.beginPath(); c.arc(x, y - r * 1.4, r * 0.8, 0, 7); c.fillStyle = '#3fae4a'; c.fill(); c.stroke();
          c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.arc(x - r * 0.3, y - r * 1.7, r * 0.25, 0, 7); c.fill();
        };
        house(W * 0.05, 140, 38, '#fff3d6', '#ff5d6c'); tree(W * 0.2, 150, 16); house(W * 0.72, 142, 44, '#e8eef8', '#4c9bff');
        tree(W * 0.9, 152, 18); tree(W * 0.62, 146, 12); house(W * 0.3, 175, 30, '#f0e0e8', '#ffcc4d');
        c.fillStyle = 'rgba(255,255,255,0.25)';
        for (let i = 0; i < 26; i++) { const x = (i * 97) % W, y = 190 + (i * 53) % 60; c.beginPath(); c.ellipse(x, y, 7, 2.5, 0, 0, 7); c.fill(); }
      }
      const CLOUDS = [[0.12, 1.2, 0.9], [0.75, 2.6, 0.7], [0.3, 4.2, 1.1], [0.85, 5.8, 0.8], [0.1, 7.5, 0.95], [0.6, 9.2, 0.75], [0.25, 11, 1], [0.8, 12.6, 0.85]];
      function drawBg(g) {
        const W = api.W, H = api.H;
        if (!scene || sceneW !== W) buildScene();
        const alt = camY;
        const gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, skyAt(alt + 3, 1)); gr.addColorStop(1, skyAt(alt, 2));
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        const k = s * zoom;
        // stars once we are high up
        const sa = U.clamp((alt - 8) / 5, 0, 1);
        if (sa > 0) {
          g.fillStyle = '#fff8c8';
          for (let i = 0; i < 40; i++) {
            const px = ((i * 71 + 17) % 100) / 100 * W;
            const py = ((((i * 43 + 29) % 100) / 100 * H + camY * k * 0.08) % H);
            g.globalAlpha = sa * (0.5 + 0.5 * Math.sin(time * 2 + i));
            const r = 1 + (i % 3) * 0.7;
            g.beginPath(); g.arc(px, py, r, 0, 7); g.fill();
          }
          g.globalAlpha = 1;
        }
        // balloon + clouds drift by at their own altitude (parallax)
        const by = baseY - (3.4 - camY * 0.6) * k * 0.6 * 1.6;
        if (by > -120 && by < H + 20) { const bx = W * 0.78 + Math.sin(time * 0.4) * 18; g.drawImage(balloonSpr, bx - 26, by - 38 + Math.sin(time * 1.3) * 4, 52, 74); }
        for (let i = 0; i < CLOUDS.length; i++) {
          const c = CLOUDS[i];
          const cy = baseY - (c[1] - camY * 0.6) * k * 0.6 * 1.6;
          if (cy < -60 || cy > H + 40) continue;
          const cw = 110 * c[2];
          const cx = ((c[0] * (W + cw) + time * (6 + i * 1.5)) % (W + cw)) - cw / 2;
          g.drawImage(cloudSpr, cx - cw / 2, cy - cw * 0.25, cw, cw * 0.5);
        }
        // ground strip
        const gy = baseY - 0.25 * k + camY * k * 0.6;
        if (gy < H) {
          g.drawImage(scene, 0, gy - 120, W, 260);
          if (gy + 140 < H) { g.fillStyle = '#6cbf4e'; g.fillRect(0, gy + 139, W, H - gy - 139); }
        }
      }

      // little Q builder riding the moving slab (cheers on a perfect, slumps when it falls)
      function drawBuilder(g, px, py, sz, mood) {
        g.save(); g.translate(px, py); const k = sz / 60; g.scale(k, k);
        g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = OL;
        const hop = mood === 1 ? -Math.abs(Math.sin(time * 9)) * 8 : 0;
        g.translate(0, hop);
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(0, 0, 16, 5, 0, 0, 7); g.fill();
        const legs = (x) => { g.beginPath(); g.ellipse(x, -7, 5, 8, 0, 0, 7); g.fillStyle = '#3a4a7a'; g.fill(); g.stroke(); };
        legs(-6); legs(6);
        U.rr(g, -13, -30, 26, 22, 8); g.fillStyle = '#ff8f3d'; g.fill(); g.stroke();
        g.fillStyle = '#ffe27a'; g.fillRect(-12, -22, 24, 4);
        const arm = mood === 1 ? -1 : mood === -1 ? 0.6 : 0.2 * Math.sin(time * 4);
        for (let sd = -1; sd <= 1; sd += 2) {
          g.save(); g.translate(sd * 13, -26); g.rotate(sd * (0.4 - arm * 2.2));
          g.beginPath(); g.ellipse(0, 7, 4.5, 8, 0, 0, 7); g.fillStyle = '#ff8f3d'; g.fill(); g.stroke();
          g.beginPath(); g.arc(0, 15, 4, 0, 7); g.fillStyle = '#ffd9b0'; g.fill(); g.stroke();
          g.restore();
        }
        g.beginPath(); g.ellipse(0, -48, 21, 19, 0, 0, 7); g.fillStyle = '#ffd9b0'; g.fill(); g.stroke();
        g.beginPath(); g.arc(0, -52, 21, Math.PI, 0); g.lineTo(26, -50); g.lineTo(-26, -50); g.closePath(); g.fillStyle = '#ffcc4d'; g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(-9, -63, 6, 3, -0.4, 0, 7); g.fill();
        if (mood === -1) {
          g.strokeStyle = OL; g.lineWidth = 2.5;
          g.beginPath(); g.moveTo(-11, -46); g.lineTo(-5, -42); g.moveTo(-5, -46); g.lineTo(-11, -42); g.moveTo(5, -46); g.lineTo(11, -42); g.moveTo(11, -46); g.lineTo(5, -42); g.stroke();
          g.beginPath(); g.arc(0, -33, 4, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
        } else {
          g.fillStyle = OL; g.beginPath(); g.ellipse(-7, -44, 3.2, 4.2, 0, 0, 7); g.ellipse(7, -44, 3.2, 4.2, 0, 0, 7); g.fill();
          g.fillStyle = '#fff'; g.beginPath(); g.arc(-6, -45.5, 1.3, 0, 7); g.arc(8, -45.5, 1.3, 0, 7); g.fill();
          g.fillStyle = 'rgba(255,110,120,0.5)'; g.beginPath(); g.ellipse(-13, -38, 3.5, 2.2, 0, 0, 7); g.ellipse(13, -38, 3.5, 2.2, 0, 0, 7); g.fill();
          g.strokeStyle = OL; g.lineWidth = 2.2;
          g.beginPath(); if (mood === 1) g.arc(0, -38, 4.5, 0.1, Math.PI - 0.1); else g.arc(0, -37, 3, 0.2, Math.PI - 0.2); g.stroke();
        }
        g.restore();
      }
      function outText(g, str, x, y, size, col, lw) {
        g.font = '900 ' + size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
        g.lineWidth = lw || Math.max(3, size * 0.16); g.strokeStyle = OL; g.strokeText(str, x, y);
        g.fillStyle = col; g.fillText(str, x, y);
      }

      function draw(g) {
        drawBg(g);
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        const t = topSlab();
        // debris behind the tower
        for (let i = 0; i < debris.length; i++) { const b = debris[i]; if (b.x + b.z < t.x + t.z) drawDebris(g, b); }
        // tower
        const k = s * zoom;
        for (let i = 0; i < slabs.length; i++) {
          const b = slabs[i];
          const sy = baseY - (b.y + HH - camY) * k;
          if (sy > api.H + 2 * k) continue;
          if (sy < -3 * k) continue;
          const y0 = i === 0 ? b.y - 12 : b.y;
          const fl = b.flash;
          box(g, b.x, b.z, b.w, b.d, y0, b.y + HH, b.top, b.left, b.right, b.edge, fl);
        }
        // target ghost slab
        if (!done) {
          const ty = target * HH;
          const sy = baseY - (ty - camY) * k;
          const hudBottom = api.H * 0.11 + 78;
          if (!endless && target - placed <= 6 && sy - 0.6 * k > hudBottom && sy < api.H) {
            const p0 = proj(-0.5, ty, -0.5); const ax = p0[0], ay = p0[1];
            const p1 = proj(0.5, ty, -0.5); const bx = p1[0], by = p1[1];
            const p2 = proj(0.5, ty, 0.5); const c2x = p2[0], c2y = p2[1];
            const p3 = proj(-0.5, ty, 0.5); const dx = p3[0], dy = p3[1];
            g.setLineDash(DASH); g.strokeStyle = 'rgba(255,255,255,' + (0.65 + 0.25 * Math.sin(time * 4)) + ')'; g.lineWidth = 3;
            g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(c2x, c2y); g.lineTo(dx, dy); g.closePath(); g.stroke();
            g.setLineDash(NODASH);
            outText(g, '🏁 ' + target, c2x + 28, c2y - 4, 14, '#fff');
          }
        }
        // moving slab
        if (cur) {
          const ty = cur.y + HH;
          box(g, cur.x, cur.z, cur.w, cur.d, cur.y, ty, cur.col.top, cur.col.left, cur.col.right, cur.col.edge);
          const bp = proj(cur.x, ty, cur.z);
          drawBuilder(g, bp[0], bp[1], s * zoom * 0.5, rings.length ? 1 : 0);
        } else if (done) {
          const tb = topSlab(), bp = proj(tb.x, tb.y + HH, tb.z);
          drawBuilder(g, bp[0], bp[1], s * zoom * 0.5, done === 'win' ? 1 : -1);
        }
        // rings
        for (let i = 0; i < rings.length; i++) {
          const r = rings[i], f = 1 - r.life / 0.6, e = 1 + f * 0.35;
          const w = r.w * e, d = r.d * e;
          const p0 = proj(r.x - w / 2, r.y, r.z - d / 2); const ax = p0[0], ay = p0[1];
          const p1 = proj(r.x + w / 2, r.y, r.z - d / 2); const bx = p1[0], by = p1[1];
          const p2 = proj(r.x + w / 2, r.y, r.z + d / 2); const c2x = p2[0], c2y = p2[1];
          const p3 = proj(r.x - w / 2, r.y, r.z + d / 2); const dx = p3[0], dy = p3[1];
          g.strokeStyle = 'rgba(255,255,255,' + (1 - f) + ')'; g.lineWidth = 3 * (1 - f) + 1;
          g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(c2x, c2y); g.lineTo(dx, dy); g.closePath(); g.stroke();
        }
        for (let i = 0; i < debris.length; i++) { const b = debris[i]; if (b.x + b.z >= t.x + t.z) drawDebris(g, b); }
        g.restore();
        // particles
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          g.globalAlpha = Math.min(1, p.life / p.max * 1.5);
          g.fillStyle = p.col;
          if (p.conf) { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillRect(-p.sz, -p.sz / 2, p.sz * 2, p.sz); g.restore(); }
          else { g.beginPath(); g.arc(p.x, p.y, p.sz, 0, Math.PI * 2); g.fill(); }
        }
        g.globalAlpha = 1;
        // score
        const sc = 1 + scorePop * 0.25;
        g.save(); g.translate(api.W / 2, api.H * 0.11); g.scale(sc, sc);
        outText(g, String(placed), 0, 0, 56, '#ffffff', 7);
        g.restore();
        outText(g, endless ? '最高 ' + Math.max(api.best || 0, placed) : '目標 ' + target, api.W / 2, api.H * 0.11 + 40, 16, '#fff7a8', 4);
        if (streak >= 2 && !done) {
          const a = 0.6 + 0.4 * Math.sin(time * 8);
          g.globalAlpha = a;
          outText(g, '完美 ×' + streak, api.W / 2, api.H * 0.11 + 64, 17, '#ffcc4d', 4);
          g.globalAlpha = 1;
        }
        if (!diff && !endless && api.level <= 2 && placed === 0 && !done) {
          const a = 0.55 + 0.45 * Math.sin(time * 5);
          g.globalAlpha = a;
          outText(g, '點擊螢幕放下', api.W / 2, api.H * 0.86, 19, '#fff', 4);
          g.globalAlpha = 1;
        }
      }

      function drawDebris(g, b) {
        const p = proj(b.x, b.y + HH / 2, b.z);
        const px = p[0], py = p[1];
        g.save();
        g.translate(px, py); g.rotate(b.rot * 0.35); g.translate(-px, -py);
        box(g, b.x, b.z, b.w, b.d, b.y, b.y + HH, b.col.top, b.col.left, b.col.right, null);
        g.restore();
      }

      const DASH = [6, 6], NODASH = [];

      return {
        update, draw,
        down() { if (!api.ended) drop(); },
        resize() { layout(); },
        _aimTime: aimTime,
        get _state() { return { placed, target, streak, top: topSlab(), cur, axis, dir, done }; },
      };
    },
  });
})();
