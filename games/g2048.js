// 2048 — slide and merge number tiles. Levels: reach a target tile; 普通/困難 add stone cells and a move limit.
(function () {
  'use strict';

  const TILE = {
    2: ['#fff6e6', '#f3e1c4', '#6b5440'], 4: ['#ffe9c2', '#f2cf94', '#6b5440'], 8: ['#ffbe73', '#ff9a3c', '#fff'],
    16: ['#ff9a68', '#ff6f3c', '#fff'], 32: ['#ff7a7a', '#f2484f', '#fff'], 64: ['#ff5c8a', '#e02a5c', '#fff'],
    128: ['#ffe06b', '#f7c21e', '#fff'], 256: ['#ffd23f', '#f2a900', '#fff'], 512: ['#a8ec6a', '#5cc23a', '#fff'],
    1024: ['#58e0b5', '#1fae86', '#fff'], 2048: ['#6fb2ff', '#2f6fe0', '#fff'], 4096: ['#b58cff', '#7a44e8', '#fff'],
  };
  const BIG = ['#4a3f7a', '#2b2350', '#fff'];
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];   // up, right, down, left (dx, dy)

  // ---------- pure logic (shared with tools/check_g2048.js) ----------
  // grid: Int32Array N*N, 0 empty, -1 stone, else tile value
  function lines(N, dir) {
    const out = [];
    const [dx, dy] = DIRS[dir];
    for (let k = 0; k < N; k++) {
      const line = [];
      for (let s = 0; s < N; s++) {
        // walk from the wall the tiles move toward
        let x, y;
        if (dx === 1) { x = N - 1 - s; y = k; } else if (dx === -1) { x = s; y = k; }
        else if (dy === 1) { x = k; y = N - 1 - s; } else { x = k; y = s; }
        line.push(y * N + x);
      }
      out.push(line);
    }
    return out;
  }
  const LINE_CACHE = {};
  function linesOf(N, dir) { const k = N * 4 + dir; return LINE_CACHE[k] || (LINE_CACHE[k] = lines(N, dir)); }

  // slide values; returns { grid, moved, gain } (gain = merge sum) — optionally records moves for animation
  function slide(grid, N, dir, rec) {
    const g = Int32Array.from(grid);
    let moved = false, gain = 0;
    for (const line of linesOf(N, dir)) {
      let seg = 0;
      while (seg < line.length) {
        if (g[line[seg]] === -1) { seg++; continue; }
        let end = seg;
        while (end < line.length && g[line[end]] !== -1) end++;
        // compact [seg, end)
        let w = seg, lastMergeable = -1;
        for (let r = seg; r < end; r++) {
          const v = g[line[r]];
          if (!v) continue;
          g[line[r]] = 0;
          if (lastMergeable >= 0 && g[line[lastMergeable]] === v) {
            g[line[lastMergeable]] = v * 2; gain += v * 2;
            if (rec) rec.push([line[r], line[lastMergeable], 1]);
            lastMergeable = -1; moved = true;
          } else {
            g[line[w]] = v;
            if (rec) rec.push([line[r], line[w], 0]);
            if (w !== r) moved = true;
            lastMergeable = w; w++;
          }
        }
        seg = end;
      }
    }
    return { grid: g, moved, gain };
  }
  function canMove(grid, N) {
    for (let d = 0; d < 4; d++) if (slide(grid, N, d).moved) return true;
    return false;
  }
  function maxTile(grid) { let m = 0; for (let i = 0; i < grid.length; i++) if (grid[i] > m) m = grid[i]; return m; }

  // ---------- level parameters ----------
  // N size, stones, target tile, move limit (0 = none), seed tiles placed at start
  function levelOf(diff, lv, endless) {
    if (endless) return { N: 4, stones: 0, target: 0, limit: 0, seed: [] };
    if (diff === 0) {
      if (lv === 1) return { N: 4, stones: 0, target: 64, limit: 0, seed: [] };
      if (lv === 2) return { N: 4, stones: 0, target: 128, limit: 0, seed: [] };
      if (lv <= 5) return { N: 4, stones: 0, target: 256, limit: 0, seed: [] };
      if (lv <= 15) return { N: 4, stones: 0, target: 512, limit: 0, seed: lv % 2 ? [] : [64] };
      return { N: 4, stones: 0, target: 1024, limit: 0, seed: [256, 128, 64] };
    }
    if (diff === 1) {
      if (lv <= 12) return { N: 5, stones: 3, target: 512, limit: 400, seed: [] };
      if (lv <= 24) return { N: 4, stones: 1, target: 256, limit: 200, seed: [] };
      return { N: 4, stones: 1, target: 512, limit: 380, seed: [] };
    }
    if (lv <= 10) return { N: 4, stones: 1, target: 256, limit: 175, seed: [] };
    if (lv <= 25) return { N: 4, stones: 1, target: 512, limit: 340, seed: [] };
    return { N: 4, stones: 2, target: 256, limit: 185, seed: [] };
  }

  function setupGrid(P, rng) {
    const N = P.N, g = new Int32Array(N * N);
    // stones: never all in one line, keep at least the board connected
    let tries = 0;
    for (let s = 0; s < P.stones && tries < 200; tries++) {
      const i = Math.floor(rng() * N * N);
      if (g[i]) continue;
      const r = (i / N) | 0, c = i % N;
      let rowCnt = 0, colCnt = 0;
      for (let k = 0; k < N; k++) { if (g[r * N + k] === -1) rowCnt++; if (g[k * N + c] === -1) colCnt++; }
      if (rowCnt >= 1 || colCnt >= 1) continue;
      g[i] = -1; s++;
    }
    // seed tiles in a corner snake (gives later levels a running start)
    const snake = [];
    for (let r = N - 1; r >= 0; r--) for (let c = 0; c < N; c++) snake.push(r * N + ((N - 1 - r) % 2 ? N - 1 - c : c));
    let k = 0;
    for (const v of P.seed) { while (k < snake.length && g[snake[k]]) k++; if (k < snake.length) g[snake[k++]] = v; }
    return g;
  }
  function spawnInto(g, rng) {
    let n = 0;
    for (let i = 0; i < g.length; i++) if (!g[i]) n++;
    if (!n) return -1;
    let pick = Math.floor(rng() * n);
    const v = rng() < 0.9 ? 2 : 4;
    for (let i = 0; i < g.length; i++) if (!g[i] && pick-- === 0) { g[i] = v; return i; }
    return -1;
  }

  // ---------- drawing (swap for a restyle) ----------
  function drawBackground(g, W, H, time) {
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#ffe7c7'); gr.addColorStop(1, '#ffc9a3');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 12; i++) {
      const x = ((i * 83 + 11) % 100) / 100 * W, y = ((i * 47 + 23) % 100) / 100 * H, s = 14 + (i * 7) % 20;
      MG.util.rr(g, x - s / 2, y - s / 2 + Math.sin(time * 0.6 + i) * 6, s, s, s * 0.25); g.fill();
    }
  }
  function drawTile(g, U, x, y, s, v, scale) {
    const c = TILE[v] || BIG;
    const r = s * 0.16;
    g.save(); g.translate(x + s / 2, y + s / 2); g.scale(scale, scale);
    g.fillStyle = 'rgba(120,70,30,0.25)'; U.rr(g, -s / 2, -s / 2 + s * 0.06, s, s, r); g.fill();
    const gr = g.createLinearGradient(0, -s / 2, 0, s / 2);
    gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]);
    g.fillStyle = gr; U.rr(g, -s / 2, -s / 2, s, s, r); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)'; U.rr(g, -s / 2 + s * 0.08, -s / 2 + s * 0.06, s * 0.84, s * 0.16, s * 0.08); g.fill();
    if (v >= 128) { g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = Math.max(1.5, s * 0.03); U.rr(g, -s / 2 + 1, -s / 2 + 1, s - 2, s - 2, r); g.stroke(); }
    const str = String(v), digits = str.length;
    const fs = s * (digits <= 2 ? 0.46 : digits === 3 ? 0.38 : digits === 4 ? 0.3 : 0.24);
    if (c[2] === '#fff') U.text(g, str, 1, 2, fs, 'rgba(0,0,0,0.18)', 'center', 900);
    U.text(g, str, 0, 1, fs, c[2], 'center', 900);
    g.restore();
  }
  function drawStone(g, U, x, y, s) {
    const gr = g.createLinearGradient(x, y, x + s, y + s);
    gr.addColorStop(0, '#a7a2a8'); gr.addColorStop(1, '#5d5761');
    g.fillStyle = 'rgba(0,0,0,0.25)'; U.rr(g, x, y + s * 0.06, s, s, s * 0.16); g.fill();
    g.fillStyle = gr; U.rr(g, x, y, s, s, s * 0.16); g.fill();
    g.strokeStyle = 'rgba(30,25,35,0.5)'; g.lineWidth = Math.max(1.5, s * 0.03);
    g.beginPath(); g.moveTo(x + s * 0.3, y + s * 0.15); g.lineTo(x + s * 0.45, y + s * 0.45); g.lineTo(x + s * 0.3, y + s * 0.7);
    g.moveTo(x + s * 0.45, y + s * 0.45); g.lineTo(x + s * 0.75, y + s * 0.55); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.25)'; U.rr(g, x + s * 0.1, y + s * 0.08, s * 0.5, s * 0.12, s * 0.06); g.fill();
  }

  MG.register({
    id: 'g2048', name: '2048', icon: '🔢', color: '#ffcc4d', endless: true,
    _logic: { slide, canMove, maxTile, levelOf, setupGrid, spawnInto },
    create(api) {
      const U = api.util;
      const diff = api.diff || 0, endless = !!api.endless, rng = api.rng;
      const P = levelOf(diff, api.level, endless);
      const N = P.N;
      let grid = setupGrid(P, rng);
      // display tiles: {id, v, x, y, fx, fy (from), t (0..1 slide), born, pop, dying}
      let tiles = [];
      let nid = 1;
      const tileAt = new Array(N * N).fill(null);
      for (let i = 0; i < N * N; i++) if (grid[i] > 0) { const t = { id: nid++, v: grid[i], i, from: i, t: 1, born: 1, pop: 0, dying: false }; tiles.push(t); tileAt[i] = t; }
      function addSpawn() {
        const i = spawnInto(grid, rng);
        if (i >= 0) { const t = { id: nid++, v: grid[i], i, from: i, t: 1, born: 0, pop: 0, dying: false }; tiles.push(t); tileAt[i] = t; }
      }
      addSpawn(); addSpawn();
      let score = 0, moves = 0, time = 0, anim = 1, shake = 0, ending = null, best = maxTile(grid), bump = 0;
      let start = null, swiped = false;
      const parts = [], pops = [];
      let cell = 60, gap = 8, bx = 0, by = 0, boardS = 0;

      function layout() {
        const W = api.W, H = api.H;
        const top = 96, bottom = 30;
        boardS = Math.floor(Math.min(W - 24, H - top - bottom, 520));
        gap = Math.max(6, Math.round(boardS * 0.025));
        cell = (boardS - gap * (N + 1)) / N;
        bx = Math.round((W - boardS) / 2);
        by = Math.round(top + (H - top - bottom - boardS) / 2);
      }
      layout();
      function cellXY(i) { return [bx + gap + (i % N) * (cell + gap), by + gap + ((i / N) | 0) * (cell + gap)]; }

      function setInfo() {
        if (endless) api.info('無盡模式・合併越多分數越高');
        else if (!diff && api.level === 1 && moves === 0) api.info('上下左右滑動，相同數字會合併！');
        else api.info('合出 ' + P.target + (P.limit ? '・剩 ' + (P.limit - moves) + ' 步' : '') + (P.stones ? '・石塊擋路' : ''));
      }
      setInfo();
      api.score(0);

      function burst(i, col) {
        const [x, y] = cellXY(i);
        for (let k = 0; k < 10 && parts.length < 200; k++) {
          const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 140;
          parts.push({ x: x + cell / 2, y: y + cell / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5, max: 0.5, col, s: 2 + Math.random() * 3 });
        }
      }

      function doMove(dir) {
        if (api.ended || ending) return false;
        // finish running animation instantly
        tiles = tiles.filter((t) => !t.dying);
        for (const t of tiles) { t.t = 1; t.born = 1; }
        const rec = [];
        const res = slide(grid, N, dir, rec);
        if (!res.moved) { shake = 0.18; api.sfx('bad'); return false; }
        const old = tileAt.slice();
        tileAt.fill(null);
        const mergedInto = {};
        for (const [from, to, merge] of rec) {
          const t = old[from];
          t.from = from; t.i = to; t.t = 0;
          if (merge) { t.dying = true; mergedInto[to] = true; }
          else tileAt[to] = t;
        }
        grid = res.grid;
        let maxNew = 0;
        for (const k in mergedInto) {
          const i = +k, t = tileAt[i];
          t.v = grid[i]; t.pop = 1; t.popDelay = 1;
          maxNew = Math.max(maxNew, t.v);
          burst(i, (TILE[t.v] || BIG)[1]);
        }
        score += res.gain; moves++;
        api.score(score);
        if (res.gain) {
          api.sfx(maxNew >= 128 ? 'good' : 'pop');
          if (maxNew >= 256) shake = Math.max(shake, 0.12);
          const [x, y] = cellXY(+Object.keys(mergedInto)[0]);
          if (pops.length > 8) pops.shift();
          pops.push({ x: bx + boardS / 2, y: by - 14, txt: '+' + res.gain, life: 0.8 });
        } else api.sfx('tap');
        addSpawn();
        anim = 0;
        const m = maxTile(grid);
        if (m > best) { best = m; bump = 1; }
        setInfo();
        if (!endless && m >= P.target) { ending = { won: true, t: 0 }; }
        else if (!canMove(grid, N)) ending = { won: false, t: 0, text: '沒有可以移動的方向了' };
        else if (P.limit && moves >= P.limit) ending = { won: false, t: 0, text: '步數用完了（最大 ' + m + '）' };
        return true;
      }

      function down(x, y) { start = [x, y]; swiped = false; }
      function tryDir(x, y, minD) {
        if (!start || swiped) return;
        const dx = x - start[0], dy = y - start[1];
        if (Math.max(Math.abs(dx), Math.abs(dy)) < minD) return;
        swiped = true;
        if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 1 : 3); else doMove(dy > 0 ? 2 : 0);
      }
      function move(x, y) { tryDir(x, y, 34); }
      function up(x, y) { tryDir(x, y, 18); start = null; }

      function update(dt) {
        time += dt;
        anim = Math.min(1, anim + dt / 0.11);
        for (const t of tiles) {
          if (t.t < 1) t.t = Math.min(1, t.t + dt / 0.11);
          if (t.born < 1 && anim >= 1) t.born = Math.min(1, t.born + dt / 0.16);
          if (t.pop > 0 && t.t >= 1) t.pop = Math.max(0, t.pop - dt / 0.22);
        }
        if (anim >= 1 && tiles.some((t) => t.dying)) tiles = tiles.filter((t) => !t.dying);
        shake = Math.max(0, shake - dt);
        bump = Math.max(0, bump - dt * 3);
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i]; p.life -= dt;
          if (p.life <= 0) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
          p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92;
        }
        for (let i = pops.length - 1; i >= 0; i--) { pops[i].life -= dt; pops[i].y -= dt * 30; if (pops[i].life <= 0) pops.splice(i, 1); }
        if (ending && !api.ended) {
          ending.t += dt;
          if (ending.t > 0.45) {
            if (ending.won) api.win('合出了 ' + P.target + '！');
            else api.lose(endless ? '沒有可以移動的方向了' : ending.text);
          }
        }
      }

      function draw(g) {
        const W = api.W, H = api.H;
        drawBackground(g, W, H, time);
        // header cards
        const cw = Math.min(110, (W - 48) / 3);
        const card = (x, label, val, col) => {
          g.fillStyle = 'rgba(120,70,40,0.18)'; U.rr(g, x, 16, cw, 54, 14); g.fill();
          g.fillStyle = '#8a5a3c'; U.rr(g, x, 12, cw, 54, 14); g.fill();
          U.text(g, label, x + cw / 2, 26, 11, 'rgba(255,240,220,0.85)', 'center', 800);
          U.text(g, String(val), x + cw / 2, 47, val > 99999 ? 15 : 19, col || '#fff', 'center', 900);
        };
        const x0 = (W - cw * 3 - 16) / 2;
        card(x0, '分數', score);
        if (endless) card(x0 + cw + 8, '最高', Math.max(api.best || 0, score), '#ffe08a');
        else card(x0 + cw + 8, '目標', P.target, '#ffe08a');
        if (P.limit) card(x0 + (cw + 8) * 2, '剩餘步數', P.limit - moves, P.limit - moves <= 20 ? '#ff9aa4' : '#fff');
        else card(x0 + (cw + 8) * 2, '最大', best, '#c6ffb0');
        // board
        const sx = shake > 0 ? Math.sin(time * 90) * shake * 30 : 0;
        g.save(); g.translate(sx, 0);
        g.fillStyle = 'rgba(120,70,40,0.25)'; U.rr(g, bx, by + 6, boardS, boardS, 16); g.fill();
        g.fillStyle = '#b98b68'; U.rr(g, bx, by, boardS, boardS, 16); g.fill();
        for (let i = 0; i < N * N; i++) {
          const [x, y] = cellXY(i);
          if (grid[i] === -1) continue;
          g.fillStyle = 'rgba(255,240,225,0.35)'; U.rr(g, x, y, cell, cell, cell * 0.16); g.fill();
        }
        for (let i = 0; i < N * N; i++) if (grid[i] === -1) { const [x, y] = cellXY(i); drawStone(g, U, x, y, cell); }
        const ease = (t) => 1 - Math.pow(1 - t, 3);
        const drawT = (t) => {
          const [ax, ay] = cellXY(t.from), [zx, zy] = cellXY(t.i);
          const e = ease(t.t);
          const x = ax + (zx - ax) * e, y = ay + (zy - ay) * e;
          let s = 1;
          if (t.born < 1) s = t.born <= 0 ? 0 : U.easeOutBack(t.born);
          if (t.pop > 0 && t.t >= 1) s = 1 + Math.sin(t.pop * Math.PI) * 0.18;
          if (s <= 0.01) return;
          const v = t.pop > 0 && t.t < 1 ? t.v / 2 : t.v;
          drawTile(g, U, x, y, cell, v, s);
        };
        for (const t of tiles) if (t.dying) drawT(t);
        for (const t of tiles) if (!t.dying) drawT(t);
        g.restore();
        for (const p of parts) { g.globalAlpha = Math.max(0, p.life / p.max); g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, p.s, 0, Math.PI * 2); g.fill(); }
        g.globalAlpha = 1;
        for (const p of pops) { g.globalAlpha = Math.min(1, p.life * 2); U.text(g, p.txt, p.x, p.y, 16, '#c0562a', 'center', 900); }
        g.globalAlpha = 1;
        if (!diff && !endless && api.level === 1 && moves < 2) {
          const t = (time * 1.2) % 1;
          g.globalAlpha = 1 - t;
          U.text(g, '👉', bx + boardS * (0.3 + t * 0.4), by + boardS + 2 > H - 20 ? by + boardS - 30 : by + boardS + 14, 24, '#fff');
          g.globalAlpha = 1;
        }
        if (ending && ending.won) {
          g.globalAlpha = Math.min(1, ending.t * 3) * 0.9;
          g.fillStyle = 'rgba(255,230,120,0.35)'; U.rr(g, bx, by, boardS, boardS, 16); g.fill();
          U.text(g, P.target + '！', bx + boardS / 2, by + boardS / 2, Math.min(64, boardS * 0.18), '#fff', 'center', 900);
          g.globalAlpha = 1;
        }
      }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _grid: () => grid, _move: doMove, _P: P, _moves: () => moves, _score: () => score,
      };
    },
  });
})();
