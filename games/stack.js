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
        return { top: hsl(h, 70, 66), left: hsl(h, 62, 50), right: hsl(h, 60, 41), edge: hsl(h, 80, 80) };
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

      function box(g, x, z, w, d, y0, y1, top, left, right, edge, flash) {
        const x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2;
        // corners
        let p = proj(x0, y1, z0); const ax = p[0], ay = p[1];
        p = proj(x1, y1, z0); const bx = p[0], by = p[1];
        p = proj(x1, y1, z1); const cxp = p[0], cyp = p[1];
        p = proj(x0, y1, z1); const dx = p[0], dy = p[1];
        const hgt = (y1 - y0) * s * zoom;
        // right face (x = x1)
        g.fillStyle = right;
        g.beginPath(); g.moveTo(bx, by); g.lineTo(cxp, cyp); g.lineTo(cxp, cyp + hgt); g.lineTo(bx, by + hgt); g.closePath(); g.fill();
        // left face (z = z1)
        g.fillStyle = left;
        g.beginPath(); g.moveTo(dx, dy); g.lineTo(cxp, cyp); g.lineTo(cxp, cyp + hgt); g.lineTo(dx, dy + hgt); g.closePath(); g.fill();
        // top
        g.fillStyle = top;
        g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(cxp, cyp); g.lineTo(dx, dy); g.closePath(); g.fill();
        if (flash > 0) { g.fillStyle = 'rgba(255,255,255,' + (flash * 0.75).toFixed(3) + ')'; g.fill(); }
        if (edge) {
          g.strokeStyle = edge; g.lineWidth = 1;
          g.beginPath(); g.moveTo(dx, dy); g.lineTo(ax, ay); g.lineTo(bx, by); g.stroke();
        }
      }

      function drawBg(g) {
        const W = api.W, H = api.H;
        const hgt = topY();
        const h1 = hue0 + 200 + hgt * 9, h2 = hue0 + 160 + hgt * 9;
        const gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, hsl(h1, 55, 78));
        gr.addColorStop(1, hsl(h2, 50, 58));
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(255,255,255,0.18)';
        for (let i = 0; i < 18; i++) {
          const px = ((i * 71 + 17) % 100) / 100 * W;
          const py = (((i * 43 + 29) % 100) / 100 * H + camY * s * 0.25 * (1 + (i % 3) * 0.4)) % (H + 20) - 10;
          const r = 1 + (i % 4);
          g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill();
        }
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
            g.setLineDash(DASH); g.strokeStyle = 'rgba(255,255,255,' + (0.45 + 0.25 * Math.sin(time * 4)) + ')'; g.lineWidth = 2;
            g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(c2x, c2y); g.lineTo(dx, dy); g.closePath(); g.stroke();
            g.setLineDash(NODASH);
            U.text(g, '🏁 ' + target, c2x + 26, c2y - 4, 13, '#fff');
          }
        }
        // moving slab
        if (cur) {
          const ty = cur.y + HH;
          box(g, cur.x, cur.z, cur.w, cur.d, cur.y, ty, cur.col.top, cur.col.left, cur.col.right, cur.col.edge);
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
        g.shadowColor = 'rgba(0,0,0,0.18)'; g.shadowBlur = 6;
        U.text(g, String(placed), 0, 0, 54, '#ffffff', 'center', 900);
        g.restore();
        U.text(g, endless ? '最高 ' + Math.max(api.best || 0, placed) : '目標 ' + target, api.W / 2, api.H * 0.11 + 38, 15, 'rgba(255,255,255,0.9)', 'center', 700);
        if (streak >= 2 && !done) {
          const a = 0.6 + 0.4 * Math.sin(time * 8);
          g.globalAlpha = a;
          U.text(g, '完美 ×' + streak, api.W / 2, api.H * 0.11 + 62, 16, '#fff7a8', 'center', 900);
          g.globalAlpha = 1;
        }
        if (!diff && !endless && api.level <= 2 && placed === 0 && !done) {
          const a = 0.55 + 0.45 * Math.sin(time * 5);
          g.globalAlpha = a;
          U.text(g, '點擊螢幕放下', api.W / 2, api.H * 0.86, 18, '#fff', 'center', 800);
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
