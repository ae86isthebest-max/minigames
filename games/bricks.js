// 彈珠打磚 — Balls Bricks Breaker: pull back to aim, fire a stream of balls, clear every brick.
(function () {
  'use strict';

  const C = 7;
  const ROWS = 10;
  const SPEED = 15;
  const GAP = 0.05;
  const HUES = ['#4cd986', '#3de0e0', '#4c9bff', '#5560c8', '#b26bff', '#ff7ac8', '#ff5d6c', '#ff8f3d', '#ffcc4d'];
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

  // diff: 0 簡單 (original), 1 普通, 2 困難; endless: rows are made on demand forever, numbers keep growing
  function genLevel(L0, rng, diff, endless) {
    diff = diff || 0;
    const L = endless ? 30 : L0 + [0, 12, 30][diff];
    const R = endless ? Infinity : Math.min(26, 5 + Math.floor(L * 0.35));
    const init = endless ? 4 : Math.min(R, (L >= 25 ? 4 : 3) + (diff === 2 ? 1 : 0));
    const N0 = endless ? 8 : 2 + Math.floor(Math.floor(L / 3) * [1, 0.9, 0.8][diff]);
    const fBase = (0.75 + Math.min(0.4, L * 0.007)) * [1, 1.1, 1.17][diff];
    const pickP = [0.85, 0.8, 0.72][diff];
    function makeRow(k) {
      const Lk = endless ? L + k * 0.6 : L;
      const f = endless ? fBase + k * 0.035 : fBase;
      const row = new Array(C).fill(null);
      const nb = Math.min(C - 1, 2 + Math.floor(rng() * (3 + Math.min(2, Lk / 15))));
      const cols = [0, 1, 2, 3, 4, 5, 6];
      for (let i = cols.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = cols[i]; cols[i] = cols[j]; cols[j] = t; }
      const balls = N0 + 0.65 * k;
      const tough = Lk >= 10 && rng() < 0.12;
      for (let i = 0; i < nb; i++) {
        let hp = Math.max(1, Math.round(balls * f * (0.6 + rng() * 0.8) * (tough ? 1.6 : 1)));
        let type = 'sq', ori = 0;
        const r = rng();
        if (Lk >= 8 && r < 0.06) type = 'bomb';
        else if (Lk >= 4 && r < 0.2) { type = 'tri'; ori = Math.floor(rng() * 4); }
        if (type === 'bomb') hp = Math.max(1, Math.round(hp * 0.6));
        row[cols[i]] = { hp, type, ori };
      }
      if (rng() < pickP || k < 3) row[cols[nb]] = { pick: true };
      return row;
    }
    const rows = [];
    if (!endless) for (let k = 0; k < R; k++) rows.push(makeRow(k));
    return { rows, init, N0, R, row(k) { while (rows.length <= k) rows.push(makeRow(rows.length)); return rows[k]; } };
  }

  MG.register({
    id: 'bricks', name: '彈珠打磚', icon: '🎱', color: '#ff5d6c', endless: true,
    create(api) {
      const U = api.util, L = api.level, rng = api.rng;
      const DIFF = api.diff || 0, ENDLESS = !!api.endless;
      const lv = genLevel(L, rng, DIFF, ENDLESS);
      const AIM_LIMIT = 12;
      let aimT = 0, survived = 0;
      let W, H, cs, x0, x1, y0, floorY, rb, cache = null;
      function layout() {
        W = api.W; H = api.H;
        cs = Math.max(8, Math.min((W - 20) / C, (H - 50 - 62) / (ROWS + 1)));
        x0 = (W - cs * C) / 2; x1 = x0 + cs * C;
        y0 = 50; floorY = y0 + (ROWS + 1) * cs;
        rb = cs * 0.12;
        cache = null;
      }
      layout();

      const S = {
        phase: 'aim', bricks: [], picks: [], grid: [], next: 0, n: lv.N0, gained: 0,
        lx: (x0 + x1) / 2, nx: null, balls: [], launched: 0, launchT: 0, dir: [0, -1], turnT: 0, speed: 1, fast: false,
        shiftT: 0, aim: null, over: false, turns: 0,
      };
      const parts = []; for (let i = 0; i < 300; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 4 });
      let pCur = 0, anim = 0, shake = 0, lastInfo = '', hintT = L === 1 ? 6 : 0, banner = null, hitSnd = 0;
      const btnFast = { x: 0, y: 0, w: 52, h: 46 }, btnBack = { x: 0, y: 0, w: 52, h: 46 };

      function addPart(x, y, vx, vy, life, col, size) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size;
      }

      // ---------- grid / geometry ----------
      for (let r = 0; r < ROWS + 3; r++) { S.grid.push(new Array(C).fill(null)); }
      const pgrid = []; for (let r = 0; r < ROWS + 3; r++) pgrid.push(new Array(C).fill(null));

      function polyFor(b) {
        const g = GAP * cs;
        const ax = x0 + b.c * cs + g, ay = y0 + b.r * cs + g, bx = x0 + (b.c + 1) * cs - g, by = y0 + (b.r + 1) * cs - g;
        if (b.type !== 'tri') { b.px = [ax, bx, bx, ax]; b.py = [ay, ay, by, by]; return; }
        if (b.ori === 0) { b.px = [ax, bx, ax]; b.py = [ay, by, by]; }
        else if (b.ori === 1) { b.px = [bx, bx, ax]; b.py = [ay, by, by]; }
        else if (b.ori === 2) { b.px = [ax, bx, ax]; b.py = [ay, ay, by]; }
        else { b.px = [ax, bx, bx]; b.py = [ay, ay, by]; }
      }
      function place(row, r) {
        for (let c = 0; c < C; c++) {
          const cell = row[c]; if (!cell) continue;
          if (cell.pick) { const p = { r, c, taken: false, t: 0 }; S.picks.push(p); pgrid[r][c] = p; continue; }
          const b = { r, c, hp: cell.hp, max: cell.hp, type: cell.type, ori: cell.ori, flash: 0, pop: 0, slide: 0, px: null, py: null, dead: false };
          polyFor(b); S.bricks.push(b); S.grid[r][c] = b;
        }
      }
      for (let i = 0; i < lv.init; i++) place(lv.row(i), lv.init - 1 - i);
      S.next = lv.init;

      // circle vs convex polygon: returns penetration depth (>0) and writes normal into NX/NY
      let NX = 0, NY = 0;
      function circlePoly(cx, cy, r, px, py) {
        const n = px.length;
        let inside = true, minD = 1e9, mnx = 0, mny = 0;
        let bestD2 = 1e18, qx = 0, qy = 0;
        let area = 0;
        for (let i = 0; i < n; i++) { const j = (i + 1) % n; area += px[i] * py[j] - px[j] * py[i]; }
        const sgn = area > 0 ? 1 : -1;
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          const ex = px[j] - px[i], ey = py[j] - py[i];
          const len = Math.hypot(ex, ey);
          const onx = sgn * ey / len, ony = -sgn * ex / len;
          const d = (cx - px[i]) * onx + (cy - py[i]) * ony;
          if (d > 0) inside = false;
          if (-d < minD) { minD = -d; mnx = onx; mny = ony; }
          let t = ((cx - px[i]) * ex + (cy - py[i]) * ey) / (len * len);
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const sx = px[i] + ex * t, sy = py[i] + ey * t;
          const d2 = (cx - sx) * (cx - sx) + (cy - sy) * (cy - sy);
          if (d2 < bestD2) { bestD2 = d2; qx = sx; qy = sy; }
        }
        if (inside) { NX = mnx; NY = mny; return r + minD; }
        const dist = Math.sqrt(bestD2);
        if (dist >= r) return 0;
        if (dist < 1e-6) { NX = mnx; NY = mny; return r; }
        NX = (cx - qx) / dist; NY = (cy - qy) / dist;
        return r - dist;
      }

      // one physics substep for a moving circle; returns hit brick or null (hit=true when damage applies)
      function collide(o, real) {
        let hitAny = null;
        for (let it = 0; it < 3; it++) {
          const col = Math.floor((o.x - x0) / cs), row = Math.floor((o.y - y0) / cs);
          let best = 0, bb = null, bnx = 0, bny = 0;
          for (let r = row - 1; r <= row + 1; r++) {
            if (r < 0 || r >= S.grid.length) continue;
            const gr = S.grid[r];
            for (let c = col - 1; c <= col + 1; c++) {
              if (c < 0 || c >= C) continue;
              const b = gr[c]; if (!b || b.dead) continue;
              const pen = circlePoly(o.x, o.y, rb, b.px, b.py);
              if (pen > best) { best = pen; bb = b; bnx = NX; bny = NY; }
            }
          }
          if (!bb) break;
          o.x += bnx * (best + 0.01); o.y += bny * (best + 0.01);
          const vn = o.vx * bnx + o.vy * bny;
          if (vn < 0) {
            o.vx -= 2 * vn * bnx; o.vy -= 2 * vn * bny;
            if (real) damage(bb, 1, o.x - bnx * rb, o.y - bny * rb);
            hitAny = bb;
          }
        }
        return hitAny;
      }
      function walls(o) {
        let hit = false;
        if (o.x < x0 + rb) { o.x = x0 + rb; if (o.vx < 0) o.vx = -o.vx; hit = true; }
        if (o.x > x1 - rb) { o.x = x1 - rb; if (o.vx > 0) o.vx = -o.vx; hit = true; }
        if (o.y < y0 + rb) { o.y = y0 + rb; if (o.vy < 0) o.vy = -o.vy; hit = true; }
        return hit;
      }
      function unstick(o) {
        const sp = Math.hypot(o.vx, o.vy) || 1;
        if (Math.abs(o.vy) < sp * 0.12) {
          o.vy = (o.vy >= 0 ? 1 : -1) * sp * 0.12;
          const k = sp / Math.hypot(o.vx, o.vy); o.vx *= k; o.vy *= k;
        }
      }

      function damage(b, d, hx, hy) {
        if (b.dead) return;
        b.hp -= d; b.flash = 0.08; b.pop = 1;
        if (hitSnd <= 0) { api.sfx('hit'); hitSnd = 0.05; }
        if (Math.random() < 0.4) addPart(hx, hy, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120, 0.25, '#ffffff', 3);
        if (b.hp <= 0) kill(b);
      }
      function kill(b) {
        if (b.dead) return;
        b.dead = true; S.grid[b.r][b.c] = null;
        const col = brickColor(b);
        const cx = x0 + (b.c + 0.5) * cs, cy = y0 + (b.r + 0.5) * cs;
        for (let i = 0; i < 14; i++) addPart(cx + (Math.random() - 0.5) * cs * 0.6, cy + (Math.random() - 0.5) * cs * 0.6, (Math.random() - 0.5) * 320, (Math.random() - 0.7) * 320, 0.5 + Math.random() * 0.4, i % 3 ? col : '#ffffff', 4 + Math.random() * 5);
        api.sfx('pop');
        shake = Math.max(shake, 2.5);
        if (b.type === 'bomb') {
          shake = 9; api.sfx('drop');
          banner = { text: '💥 爆炸！', t: 0, col: '#ffcc4d' };
          for (let i = 0; i < 30; i++) { const a = Math.random() * 6.283, v = 100 + Math.random() * 300; addPart(cx, cy, Math.cos(a) * v, Math.sin(a) * v, 0.6, i % 2 ? '#ff8f3d' : '#ffcc4d', 6); }
          for (let r = b.r - 1; r <= b.r + 1; r++) for (let c = b.c - 1; c <= b.c + 1; c++) {
            if (r < 0 || c < 0 || c >= C || r >= S.grid.length) continue;
            const o = S.grid[r][c]; if (o && !o.dead) damage(o, b.max, x0 + (c + 0.5) * cs, y0 + (r + 0.5) * cs);
          }
        }
      }

      function pickCheck(o) {
        const col = Math.floor((o.x - x0) / cs), row = Math.floor((o.y - y0) / cs);
        if (row < 0 || row >= pgrid.length || col < 0 || col >= C) return;
        const p = pgrid[row][col];
        if (!p || p.taken) return;
        const cx = x0 + (col + 0.5) * cs, cy = y0 + (row + 0.5) * cs;
        if ((o.x - cx) * (o.x - cx) + (o.y - cy) * (o.y - cy) < (rb + cs * 0.24) * (rb + cs * 0.24)) {
          p.taken = true; pgrid[row][col] = null; S.gained++;
          api.sfx('good');
          for (let i = 0; i < 10; i++) addPart(cx, cy, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, 0.5, '#4cd986', 5);
        }
      }

      function brickColor(b) {
        if (b.type === 'bomb') return '#3a3f52';
        const k = Math.min(1, Math.log(b.max + 1) / Math.log(lv.N0 * 3.5 + 12));
        return HUES[Math.min(HUES.length - 1, Math.floor(k * HUES.length))];
      }

      function aliveCount() { let n = 0; for (const b of S.bricks) if (!b.dead) n++; return n; }

      // ---------- turn flow ----------
      function fire(dx, dy) {
        const len = Math.hypot(dx, dy);
        S.dir = [dx / len, dy / len];
        S.phase = 'fly'; S.launched = 0; S.launchT = 0; S.turnT = 0; S.speed = 1; S.fast = false; S.nx = null; S.gained = 0;
        S.balls.length = 0; S.turns++;
        api.sfx('shoot');
      }
      function stepBalls(dt) {
        const sp = SPEED * cs;
        S.launchT -= dt;
        while (S.launched < S.n && S.launchT <= 0) {
          S.balls.push({ x: S.lx, y: floorY - rb - 0.5, vx: S.dir[0] * sp, vy: S.dir[1] * sp, st: 'fly', px: S.lx, py: floorY - rb });
          S.launched++; S.launchT += 0.065;
        }
        if (S.launched >= S.n) S.launchT = 0;
        const maxStep = rb * 0.5;
        for (const o of S.balls) {
          if (o.st === 'done') continue;
          o.px = o.x; o.py = o.y;
          if (o.st === 'back' || o.st === 'home') {
            const tx = S.nx === null ? S.lx : S.nx, ty = floorY - rb;
            const dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy), mv = sp * 1.6 * dt;
            if (d <= mv) { o.x = tx; o.y = ty; o.st = 'done'; } else { o.x += dx / d * mv; o.y += dy / d * mv; }
            continue;
          }
          const dist = sp * dt;
          const n = Math.max(1, Math.ceil(dist / maxStep));
          const h = dt / n;
          for (let s = 0; s < n; s++) {
            o.x += o.vx * h; o.y += o.vy * h;
            const w = walls(o);
            const b = collide(o, true);
            if (w || b) unstick(o);
            pickCheck(o);
            if (o.y >= floorY - rb && o.vy > 0) {
              o.y = floorY - rb;
              if (S.nx === null) S.nx = U.clamp(o.x, x0 + rb, x1 - rb);
              o.st = 'home';
              break;
            }
          }
        }
        let flying = S.launched < S.n;
        for (const o of S.balls) if (o.st !== 'done') { flying = true; break; }
        if (aliveCount() === 0 && S.next >= lv.R && !S.over) { winNow(); return; }
        if (!flying) endTurn();
      }
      function recall() {
        if (S.phase !== 'fly') return;
        for (const o of S.balls) if (o.st === 'fly') o.st = 'back';
        S.launched = S.n;
        api.sfx('pour');
      }
      function endTurn() {
        S.lx = S.nx === null ? S.lx : S.nx;
        if (S.gained) { S.n += S.gained; banner = { text: '+' + S.gained + ' 顆球', t: 0, col: '#7dffa8' }; }
        S.gained = 0;
        S.phase = 'shift'; S.shiftT = 0;
        let guard = 0;
        do {
          shiftDown();
          guard++;
        } while (aliveCount() === 0 && S.next < lv.R && guard < 30);
        for (const b of S.bricks) if (!b.dead && b.r >= ROWS) { lose(); return; }
        if (ENDLESS) { survived++; api.score(survived); }
      }
      function shiftDown() {
        for (let r = S.grid.length - 1; r >= 0; r--) for (let c = 0; c < C; c++) { S.grid[r][c] = null; pgrid[r][c] = null; }
        for (const b of S.bricks) { if (b.dead) continue; b.r++; b.slide = 1; if (b.r < S.grid.length) { S.grid[b.r][b.c] = b; polyFor(b); } }
        for (const p of S.picks) { if (p.taken) continue; p.r++; p.t = 1; if (p.r >= ROWS) { p.taken = true; continue; } pgrid[p.r][p.c] = p; }
        if (S.next < lv.R) {
          place(lv.row(S.next), 0); S.next++;
          for (let c = 0; c < C; c++) { const b = S.grid[0][c]; if (b) b.slide = 1; const p = pgrid[0][c]; if (p) p.t = 1; }
        }
        for (let i = S.bricks.length - 1; i >= 0; i--) if (S.bricks[i].dead) S.bricks.splice(i, 1);
        for (let i = S.picks.length - 1; i >= 0; i--) if (S.picks[i].taken) S.picks.splice(i, 1);
      }
      function lose() {
        S.over = true; S.phase = 'over'; shake = 12;
        api.lose(ENDLESS ? '撐了 ' + survived + ' 回合！' : '磚塊碰到底線了！');
      }
      function winNow() {
        S.over = true; S.phase = 'over';
        for (let i = 0; i < 80; i++) addPart(Math.random() * W, -10, (Math.random() - 0.5) * 200, Math.random() * 200, 2 + Math.random(), U.PALETTE[i % 9], 7);
        banner = { text: '全部清除！', t: 0, col: '#7dffa8' };
        api.win('用了 ' + S.turns + ' 回合清光磚塊！');
      }

      function update(dt) {
        anim += dt;
        shake = Math.max(0, shake - dt * 30);
        hitSnd -= dt;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
          p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        }
        for (const b of S.bricks) { b.flash -= dt; b.pop = Math.max(0, b.pop - dt * 6); b.slide = Math.max(0, b.slide - dt * 4); }
        for (const p of S.picks) p.t = Math.max(0, p.t - dt * 4);
        if (banner) { banner.t += dt; if (banner.t > 1.3) banner = null; }
        if (api.ended || S.over) return;
        hintT -= dt;
        if (S.phase === 'fly') {
          S.turnT += dt;
          if (S.turnT > 8) S.speed = Math.max(S.speed, 2);
          if (S.turnT > 16) S.speed = Math.max(S.speed, 3.5);
          let left = dt * S.speed;
          while (left > 1e-6 && S.phase === 'fly') { const h = Math.min(left, 1 / 60); stepBalls(h); left -= h; }
        } else if (S.phase === 'shift') {
          S.shiftT += dt;
          if (S.shiftT > 0.25) { S.phase = 'aim'; aimT = 0; }
        } else if (S.phase === 'aim' && ENDLESS) {
          aimT += dt;
          if (aimT >= AIM_LIMIT) {
            const a = S.aim; S.aim = null;
            if (a && a.ok) fire(a.dx, a.dy); else fire(Math.cos(1.45), -Math.sin(1.45));
          }
        }
        const info = ENDLESS ? '無盡模式 · 每回合 ' + AIM_LIMIT + ' 秒內要發射 · 彈珠 ×' + S.n : L === 1 && DIFF === 0 && S.turns < 2 ? '往後拉瞄準，放手發射全部彈珠' : '彈珠 ×' + S.n + ' · 剩 ' + (lv.R - S.next) + ' 排未出現';
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
      }

      // ---------- aim preview ----------
      const ghost = { x: 0, y: 0, vx: 0, vy: 0 };
      const dots = [];
      function trace(dx, dy, maxLen, bounces) {
        dots.length = 0;
        const len = Math.hypot(dx, dy);
        ghost.x = S.lx; ghost.y = floorY - rb - 0.5; ghost.vx = dx / len; ghost.vy = dy / len;
        let travelled = 0, since = 0, b = 0;
        const step = rb * 0.5;
        while (travelled < maxLen && dots.length < 400) {
          ghost.x += ghost.vx * step; ghost.y += ghost.vy * step; travelled += step; since += step;
          const w = walls(ghost);
          const hb = collide(ghost, false);
          if (w || hb) { b++; if (b > bounces) break; }
          if (ghost.y > floorY - rb) break;
          if (since >= cs * 0.32) { since = 0; dots.push(ghost.x, ghost.y); }
        }
      }

      // ---------- drawing (卡通 Q 版: toy-block playroom) ----------
      function buildCache() {
        const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
        const c = document.createElement('canvas');
        c.width = Math.ceil(W * dpr); c.height = Math.ceil(H * dpr);
        const x = c.getContext('2d'); x.scale(dpr, dpr);
        x.lineJoin = 'round'; x.lineCap = 'round';
        let gr = x.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, '#7b6fd6'); gr.addColorStop(1, '#4d3f9e');
        x.fillStyle = gr; x.fillRect(0, 0, W, H);
        x.fillStyle = 'rgba(255,255,255,0.06)';
        for (let sx = -H; sx < W; sx += 44) { x.beginPath(); x.moveTo(sx, H); x.lineTo(sx + H, 0); x.lineTo(sx + H + 20, 0); x.lineTo(sx + 20, H); x.closePath(); x.fill(); }
        const r = MG.mulberry32(21);
        for (let i = 0; i < 14; i++) {
          const sx = r() * W, sy = r() * H, sr = 4 + r() * 6;
          star(x, sx, sy, sr); x.fillStyle = 'rgba(255,230,140,0.55)'; x.fill();
        }
        const fx = x0 - 9, fy = y0 - 9, fw = x1 - x0 + 18, fh = floorY - y0 + 18;
        x.fillStyle = 'rgba(0,0,0,0.25)'; rrp(x, fx + 3, fy + 6, fw, fh, 18); x.fill();
        rrp(x, fx, fy, fw, fh, 18); fillStroke(x, '#e09a4f', 3);
        x.fillStyle = 'rgba(255,255,255,0.35)'; rrp(x, fx + 10, fy + 2.5, fw - 20, 3.5, 1.75); x.fill();
        x.strokeStyle = 'rgba(140,80,30,0.35)'; x.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) { const yy = fy + 14 + i * (fh - 28) / 5; x.beginPath(); x.moveTo(fx + 2.5, yy); x.lineTo(fx + 6, yy + 6); x.moveTo(fx + fw - 2.5, yy); x.lineTo(fx + fw - 6, yy + 6); x.stroke(); }
        gr = x.createLinearGradient(0, y0, 0, floorY);
        gr.addColorStop(0, '#2c4a7e'); gr.addColorStop(1, '#223a66');
        rrp(x, x0 - 2, y0 - 2, x1 - x0 + 4, floorY - y0 + 4, 12); x.fillStyle = gr; x.fill();
        x.lineWidth = 3; x.strokeStyle = OL; x.stroke();
        x.fillStyle = 'rgba(255,255,255,0.05)';
        for (let rr = 0; rr <= ROWS; rr++) for (let cc = 0; cc < C; cc++) { x.beginPath(); x.arc(x0 + (cc + 0.5) * cs, y0 + (rr + 0.5) * cs, cs * 0.07, 0, TAU); x.fill(); }
        x.strokeStyle = 'rgba(255,93,108,0.75)'; x.setLineDash([8, 6]); x.lineWidth = 2.5;
        x.beginPath(); x.moveTo(x0 + 4, y0 + ROWS * cs); x.lineTo(x1 - 4, y0 + ROWS * cs); x.stroke();
        x.setLineDash([]);
        x.fillStyle = '#ffcc4d'; x.fillRect(x0, floorY - 3, x1 - x0, 3);
        cache = c;
      }

      function drawBrick(g, b) {
        const col = brickColor(b);
        const sc = 1 + b.pop * 0.08;
        const dy = -b.slide * cs;
        const cx = x0 + (b.c + 0.5) * cs, cy = y0 + (b.r + 0.5) * cs + dy;
        const danger = b.r >= ROWS - 1;
        const lw = Math.max(1.5, Math.min(3, cs * 0.055));
        g.save(); g.translate(cx, cy); g.scale(sc, sc); g.translate(-cx, -cy + 0);
        g.lineJoin = 'round';
        const isTri = b.type === 'tri';
        const shape = () => {
          if (!isTri) { rrp(g, b.px[0], b.py[0] + dy, b.px[1] - b.px[0], b.py[2] - b.py[0], cs * 0.16); return; }
          g.beginPath();
          for (let i = 0; i < b.px.length; i++) { const yy = b.py[i] + dy; if (i === 0) g.moveTo(b.px[i], yy); else g.lineTo(b.px[i], yy); }
          g.closePath();
        };
        shape(); g.fillStyle = col; g.fill();
        if (!isTri) {
          const bx = b.px[0], by = b.py[0] + dy, bw = b.px[1] - b.px[0], bh = b.py[2] - b.py[0];
          g.fillStyle = 'rgba(0,0,0,0.18)'; rrp(g, bx, by + bh * 0.72, bw, bh * 0.28, cs * 0.14); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.4)'; rrp(g, bx + bw * 0.14, by + bh * 0.1, bw * 0.72, bh * 0.16, bh * 0.08); g.fill();
        } else {
          g.fillStyle = 'rgba(255,255,255,0.3)';
          const mx = (b.px[0] + b.px[1] + b.px[2]) / 3, my = (b.py[0] + b.py[1] + b.py[2]) / 3 + dy;
          g.beginPath(); g.arc(mx - cs * 0.1, my - cs * 0.1, cs * 0.06, 0, TAU); g.fill();
        }
        if (b.flash > 0) { shape(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fill(); }
        shape(); g.lineWidth = lw; g.strokeStyle = danger && Math.sin(anim * 10) > 0 ? '#ff2d45' : OL; g.stroke();
        let tx = cx, ty = cy;
        if (isTri) {
          tx = (b.px[0] + b.px[1] + b.px[2]) / 3; ty = (b.py[0] + b.py[1] + b.py[2]) / 3 + dy;
        }
        if (b.type === 'bomb') U.text(g, '💣', cx, cy - cs * 0.14, cs * 0.34, '#fff', 'center', 900);
        const fs = Math.min(cs * (isTri ? 0.3 : 0.4), cs * 1.6 / Math.max(2, String(b.hp).length));
        otext(g, String(b.hp), tx, ty + (b.type === 'bomb' ? cs * 0.2 : 1), fs, '#ffffff', 'center', Math.max(2, fs * 0.22));
        g.restore();
      }

      function btn(g, b, label, on) {
        g.fillStyle = 'rgba(0,0,0,0.25)'; rrp(g, b.x, b.y + 3, b.w, b.h, 14); g.fill();
        rrp(g, b.x, b.y, b.w, b.h, 14); fillStroke(g, on ? '#ffcc4d' : '#6a8fe0', 3);
        g.fillStyle = 'rgba(255,255,255,0.35)'; rrp(g, b.x + 7, b.y + 4, b.w - 14, 8, 4); g.fill();
        otext(g, label, b.x + b.w / 2, b.y + b.h / 2 + 1, 20, '#ffffff', 'center', 3.5);
      }

      function ball(g, x, y, r, col) {
        g.beginPath(); g.arc(x, y, r, 0, TAU); fillStroke(g, col, Math.max(1, r * 0.32));
        g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(x - r * 0.32, y - r * 0.32, r * 0.3, 0, TAU); g.fill();
      }

      function draw(g) {
        if (!cache) buildCache();
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        g.drawImage(cache, 0, 0, W, H);
        for (const p of S.picks) {
          if (p.taken) continue;
          const cx = x0 + (p.c + 0.5) * cs, cy = y0 + (p.r + 0.5) * cs - p.t * cs;
          const pr = cs * (0.2 + 0.03 * Math.sin(anim * 6 + p.c));
          g.beginPath(); g.arc(cx, cy, pr, 0, TAU); fillStroke(g, '#4cd986', 2.5);
          g.beginPath(); g.arc(cx, cy, pr * 0.72, 0, TAU); g.fillStyle = '#2fae63'; g.fill();
          g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(cx - pr * 0.4, cy - pr * 0.4, pr * 0.22, 0, TAU); g.fill();
          otext(g, '+1', cx, cy + 1, cs * 0.21, '#ffffff', 'center', Math.max(2, cs * 0.05));
        }
        for (const b of S.bricks) if (!b.dead) drawBrick(g, b);
        if (S.phase === 'aim' && S.aim && S.aim.ok) {
          trace(S.aim.dx, S.aim.dy, (floorY - y0) * 1.6, 1);
          for (let i = 0; i < dots.length; i += 2) {
            const k = 1 - i / dots.length;
            g.globalAlpha = 0.4 + 0.6 * k;
            const dr = Math.max(1.8, rb * 0.6 * (0.5 + k * 0.5));
            g.beginPath(); g.arc(dots[i], dots[i + 1], dr, 0, TAU); fillStroke(g, '#ffffff', 1.5);
          }
          g.globalAlpha = 1;
        }
        for (const o of S.balls) {
          if (o.st === 'done') continue;
          g.fillStyle = 'rgba(255,240,180,0.35)';
          g.beginPath(); g.arc(o.px, o.py, rb * 0.9, 0, TAU); g.fill();
          ball(g, o.x, o.y, rb, '#ffffff');
        }
        const showN = S.phase === 'fly' ? S.n - S.launched : S.n;
        const homeX = S.phase === 'fly' && S.nx !== null ? S.nx : S.lx;
        if (showN > 0 || S.phase !== 'fly') {
          const lx = S.lx;
          ball(g, lx, floorY - rb * 1.15, rb * 1.15, '#ffffff');
          otext(g, '×' + Math.max(0, showN), U.clamp(lx, x0 + 18, x1 - 18), floorY - rb * 2 - 12, 15, '#ffffff', 'center', 3);
        }
        if (S.phase === 'fly' && S.nx !== null) {
          let home = 0; for (const o of S.balls) if (o.st === 'done') home++;
          ball(g, homeX, floorY - rb, rb, '#cfd6ff');
          if (home > 1) otext(g, '×' + home, U.clamp(homeX, x0 + 18, x1 - 18), floorY - rb * 2 - 12, 13, '#cfd6ff', 'center', 3);
        }
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.6); g.fillStyle = p.col;
          g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        g.globalAlpha = 1;
        g.restore();
        otext(g, '🎱 ×' + S.n, x0 + 4, 24, 17, '#ffffff', 'left', 3);
        if (ENDLESS) {
          otext(g, '回合 ' + survived, W / 2, 17, 16, '#ffffff', 'center', 3);
          otext(g, '最高 ' + Math.max(api.best || 0, survived), W / 2, 35, 11, '#ffe27a', 'center', 2.5);
          otext(g, '∞', x1 - 4, 24, 20, '#ffffff', 'right', 3);
          if (S.phase === 'aim' && aimT > AIM_LIMIT - 5 && !S.over) {
            const left = Math.max(0, AIM_LIMIT - aimT);
            g.lineCap = 'round';
            g.strokeStyle = OL; g.lineWidth = 7;
            g.beginPath(); g.arc(S.lx, floorY - rb, rb * 3.2, -Math.PI / 2, -Math.PI / 2 + 6.283 * left / 5); g.stroke();
            g.strokeStyle = left < 2 ? '#ff5d6c' : '#ffcc4d'; g.lineWidth = 4;
            g.beginPath(); g.arc(S.lx, floorY - rb, rb * 3.2, -Math.PI / 2, -Math.PI / 2 + 6.283 * left / 5); g.stroke();
            otext(g, String(Math.ceil(left)), S.lx, floorY - rb * 6.5, 16, left < 2 ? '#ff5d6c' : '#ffcc4d', 'center', 3);
          }
        } else otext(g, '剩 ' + (lv.R - S.next) + ' 排', x1 - 4, 24, 15, '#ffffff', 'right', 3);
        const by = Math.min(H - 50, floorY + 6);
        btnFast.x = x0; btnFast.y = by; btnBack.x = x1 - btnBack.w; btnBack.y = by;
        if (S.phase === 'fly' && S.turnT > 2.5) btn(g, btnFast, S.speed > 1 ? '⏩×' + S.speed : '⏩', S.fast);
        if (S.phase === 'fly' && S.turnT > 1) btn(g, btnBack, '⤓', false);
        if (banner) {
          const k = Math.min(1, banner.t / 0.3);
          g.globalAlpha = banner.t > 1 ? Math.max(0, 1 - (banner.t - 1) / 0.3) : 1;
          const sz = Math.min(40, W / 9) * U.easeOutBack(k);
          otext(g, banner.text, W / 2, H * 0.45, sz, banner.col, 'center', 6);
          g.globalAlpha = 1;
        }
        if (hintT > 0 && S.phase === 'aim' && !S.aim) {
          g.globalAlpha = Math.min(1, hintT) * (0.6 + 0.4 * Math.sin(anim * 5));
          const k = (anim * 0.8) % 1;
          U.text(g, '👆', W / 2 + k * 30, floorY - cs * 3 + k * cs * 1.6, 34, '#fff', 'center', 900);
          otext(g, '往後拉 · 放手發射', W / 2, floorY - cs * 4.2, 17, '#ffffff', 'center', 3.5);
          g.globalAlpha = 1;
        }
      }

      function inBtn(b, x, y) { return x >= b.x - 4 && x <= b.x + b.w + 4 && y >= b.y - 4 && y <= b.y + b.h + 4; }
      function down(x, y) {
        if (api.ended || S.over) return;
        if (S.phase === 'fly') {
          if (S.turnT > 2.5 && inBtn(btnFast, x, y)) { S.fast = true; S.speed = Math.max(S.speed, 2.5); api.sfx('tap'); return; }
          if (S.turnT > 1 && inBtn(btnBack, x, y)) { recall(); return; }
          return;
        }
        if (S.phase !== 'aim') return;
        S.aim = { sx: x, sy: y, dx: 0, dy: 0, ok: false };
        hintT = 0;
      }
      function setAim(x, y) {
        const a = S.aim; if (!a) return;
        let dx = a.sx - x, dy = a.sy - y;
        const len = Math.hypot(dx, dy);
        a.ok = len > 14 && dy < 0;
        if (!a.ok) return;
        const ang = Math.atan2(-dy, dx);
        const cl = U.clamp(ang, 0.14, Math.PI - 0.14);
        a.dx = Math.cos(cl); a.dy = -Math.sin(cl);
      }
      function move(x, y) { if (S.phase === 'aim' && S.aim) setAim(x, y); }
      function up(x, y) {
        if (S.phase !== 'aim' || !S.aim) return;
        setAim(x, y);
        const a = S.aim; S.aim = null;
        if (a.ok) fire(a.dx, a.dy);
      }

      // test hooks (tools/check_bricks.js): snapshot / restore the turn state for look-ahead
      function save() {
        return { n: S.n, lx: S.lx, next: S.next, turns: S.turns, survived,
          bricks: S.bricks.filter((b) => !b.dead).map((b) => ({ r: b.r, c: b.c, hp: b.hp, max: b.max, type: b.type, ori: b.ori })),
          picks: S.picks.filter((p) => !p.taken).map((p) => ({ r: p.r, c: p.c })) };
      }
      function load(z) {
        for (let r = 0; r < S.grid.length; r++) for (let c = 0; c < C; c++) { S.grid[r][c] = null; pgrid[r][c] = null; }
        S.bricks.length = 0; S.picks.length = 0;
        for (const q of z.bricks) { const b = { r: q.r, c: q.c, hp: q.hp, max: q.max, type: q.type, ori: q.ori, flash: 0, pop: 0, slide: 0, px: null, py: null, dead: false }; polyFor(b); S.bricks.push(b); S.grid[b.r][b.c] = b; }
        for (const q of z.picks) { const p = { r: q.r, c: q.c, taken: false, t: 0 }; S.picks.push(p); pgrid[p.r][p.c] = p; }
        S.n = z.n; S.lx = z.lx; S.next = z.next; S.turns = z.turns; survived = z.survived; aimT = 0;
        S.phase = 'aim'; S.balls.length = 0; S.over = false; S.aim = null; S.nx = null; S.gained = 0;
      }

      return {
        update, draw, down, move, up,
        resize() {
          const ox0 = x0, ocs = cs, ofl = floorY;
          layout();
          S.lx = x0 + (S.lx - ox0) / ocs * cs;
          if (S.nx !== null) S.nx = x0 + (S.nx - ox0) / ocs * cs;
          for (const b of S.bricks) polyFor(b);
          for (const o of S.balls) { o.x = x0 + (o.x - ox0) / ocs * cs; o.y = floorY - (ofl - o.y) / ocs * cs; o.vx *= cs / ocs; o.vy *= cs / ocs; o.px = o.x; o.py = o.y; }
        },
        _s: S, _save: save, _load: load, _k: { lv, trace, dots, ROWS, C, get cs() { return cs; }, get floorY() { return floorY; }, get x0() { return x0; }, get y0() { return y0; }, btnFast, collideGhost: collide, walls, pgrid },
      };
    },
  });
})();
