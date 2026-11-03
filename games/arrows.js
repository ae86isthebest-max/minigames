// 箭頭解謎 — arrow puzzle: tap a snake-like arrow, it slides out head-first; clear the board.
(function () {
  'use strict';
  const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];
  const NEON = ['#ff5d8f', '#4cc3ff', '#5dff9e', '#ffd84d', '#c58bff', '#ff9a4d', '#3df0e0', '#ff7ae0', '#9dff5d', '#7d8bff'];

  // ---------- level model (shared with tools/check_arrows.js) ----------
  // piece: { cells: [[x,y]...] tail..head, dir }
  function dirOf(a, b) {
    for (let d = 0; d < 4; d++) if (a[0] + DX[d] === b[0] && a[1] + DY[d] === b[1]) return d;
    return -1;
  }
  function rayHitsSelf(p) {
    const h = p.cells[p.cells.length - 1];
    let x = h[0] + DX[p.dir], y = h[1] + DY[p.dir];
    for (let k = 0; k < 40; k++, x += DX[p.dir], y += DY[p.dir]) {
      if (p.cells.some((c) => c[0] === x && c[1] === y)) return true;
    }
    return false;
  }
  function buildGrid(L) {
    const g = new Array(L.cols * L.rows).fill(-1);
    L.pieces.forEach((p, i) => { if (!p.dead) for (const c of p.cells) g[c[1] * L.cols + c[0]] = i; });
    return g;
  }
  function probe(grid, cols, rows, p) {
    const h = p.cells[p.cells.length - 1];
    let x = h[0] + DX[p.dir], y = h[1] + DY[p.dir], gap = 0;
    while (x >= 0 && y >= 0 && x < cols && y < rows) {
      const v = grid[y * cols + x];
      if (v !== -1) return { free: false, gap, hit: v };
      gap++; x += DX[p.dir]; y += DY[p.dir];
    }
    return { free: true, gap };
  }
  function solve(L) {
    const pcs = L.pieces.map((p) => ({ cells: p.cells, dir: p.dir, dead: false }));
    const grid = buildGrid({ cols: L.cols, rows: L.rows, pieces: pcs });
    let depth = 0;
    const order = [];
    for (;;) {
      const free = [];
      pcs.forEach((p, i) => { if (!p.dead && probe(grid, L.cols, L.rows, p).free) free.push(i); });
      if (!free.length) break;
      depth++;
      for (const i of free) { pcs[i].dead = true; order.push(i); for (const c of pcs[i].cells) grid[c[1] * L.cols + c[0]] = -1; }
    }
    const stuck = [];
    pcs.forEach((p, i) => { if (!p.dead) stuck.push(i); });
    return { order, stuck, depth };
  }

  function params(level) {
    if (level === 1) return { cols: 3, rows: 3, minL: 2, maxL: 3 };
    if (level === 2) return { cols: 4, rows: 4, minL: 2, maxL: 3 };
    const cols = Math.min(9, 3 + Math.ceil(level / 4));
    const rows = Math.min(13, cols + Math.min(4, Math.floor(level / 5)));
    return { cols, rows, minL: 2, maxL: Math.min(6, 3 + Math.floor(level / 6)) };
  }

  function gen(level, rng) {
    const P = params(level);
    const { cols, rows } = P;
    const N = cols * rows;
    const wantDepth = level < 3 ? 1 : Math.min(12, 2 + Math.floor(level / 3));
    let best = null, bestScore = -1;
    for (let tries = 0; tries < 10; tries++) {
      let pieces = [];
      for (let round = 0; round < 5; round++) {
        const grid = buildGrid({ cols, rows, pieces });
        const order = [];
        for (let i = 0; i < N; i++) order.push(i);
        for (let i = N - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = order[i]; order[i] = order[j]; order[j] = t; }
        for (const s of order) {
          if (grid[s] !== -1) continue;
          const target = P.minL + Math.floor(rng() * (P.maxL - P.minL + 1));
          const path = [[s % cols, Math.floor(s / cols)]];
          grid[s] = -3;
          let lastDir = Math.floor(rng() * 4);
          while (path.length < target) {
            const c = path[path.length - 1];
            const opts = [];
            for (let d = 0; d < 4; d++) {
              const x = c[0] + DX[d], y = c[1] + DY[d];
              if (x < 0 || y < 0 || x >= cols || y >= rows || grid[y * cols + x] !== -1) continue;
              opts.push(d);
              if (d === lastDir && rng() < 0.45) opts.push(d, d);
            }
            if (!opts.length) break;
            const d = opts[Math.floor(rng() * opts.length)];
            lastDir = d;
            const nx = c[0] + DX[d], ny = c[1] + DY[d];
            grid[ny * cols + nx] = -3;
            path.push([nx, ny]);
          }
          // choose which end is the head, and the head direction
          const cands = [];
          if (path.length === 1) {
            for (let d = 0; d < 4; d++) cands.push({ cells: path.slice(), dir: d });
          } else {
            const n = path.length;
            cands.push({ cells: path.slice(), dir: dirOf(path[n - 2], path[n - 1]) });
            const rev = path.slice().reverse();
            cands.push({ cells: rev, dir: dirOf(rev[n - 2], rev[n - 1]) });
          }
          const okC = cands.filter((p) => !rayHitsSelf(p));
          if (!okC.length) { for (const c of path) grid[c[1] * cols + c[0]] = -1; continue; }
          const pc = okC[Math.floor(rng() * okC.length)];
          pieces.push(pc);
          for (const c of pc.cells) grid[c[1] * cols + c[0]] = pieces.length - 1;
        }
        // prune: flip or delete stuck pieces one at a time until solvable
        for (let guard = 0; guard < 200; guard++) {
          const res = solve({ cols, rows, pieces });
          if (!res.stuck.length) break;
          const k = res.stuck[Math.floor(rng() * res.stuck.length)];
          const p = pieces[k];
          const n = p.cells.length;
          if (!p.flipped && n > 1) {
            const rev = p.cells.slice().reverse();
            const np = { cells: rev, dir: dirOf(rev[n - 2], rev[n - 1]), flipped: true };
            if (!rayHitsSelf(np)) { pieces[k] = np; continue; }
          }
          pieces.splice(k, 1);
        }
      }
      const res = solve({ cols, rows, pieces });
      if (res.stuck.length || !pieces.length) continue;
      const fill = pieces.reduce((s, p) => s + p.cells.length, 0) / N;
      const score = Math.min(res.depth, wantDepth) * 2 + fill * 3;
      if (score > bestScore) { bestScore = score; best = { cols, rows, pieces: pieces.map((p) => ({ cells: p.cells, dir: p.dir })) }; }
      if (res.depth >= wantDepth && fill > 0.9) break;
    }
    if (!best) best = { cols, rows, pieces: [{ cells: [[0, 0]], dir: 2 }] };
    return best;
  }

  MG.register({
    id: 'arrows', name: '箭頭解謎', icon: '➡️', color: '#b26bff',
    gen, solve, probe, buildGrid,
    create(api) {
      const U = api.util;
      const L = gen(api.level, api.rng);
      const { cols, rows } = L;
      const cr = MG.mulberry32(api.level * 977 + 3);
      const pcs = L.pieces.map((p, i) => {
        const n = p.cells.length;
        const track = p.cells.map((c) => [c[0], c[1]]);
        const h = p.cells[n - 1];
        for (let k = 1; k <= Math.max(cols, rows) + n + 2; k++) track.push([h[0] + DX[p.dir] * k, h[1] + DY[p.dir] * k]);
        return { id: i, cells: p.cells, dir: p.dir, n, track, color: NEON[Math.floor(cr() * NEON.length)], state: 'idle', s: 0, v: 0, t: 0, flash: 0, shake: 0, hit: false, reach: 0, blk: -1 };
      });
      const grid = buildGrid({ cols, rows, pieces: pcs });
      // recolour so touching pieces never share a colour
      for (const p of pcs) {
        const used = new Set();
        for (const c of p.cells) for (let d = 0; d < 4; d++) {
          const x = c[0] + DX[d], y = c[1] + DY[d];
          if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
          const o = grid[y * cols + x];
          if (o >= 0 && o !== p.id && o < p.id) used.add(pcs[o].color);
        }
        if (used.has(p.color)) {
          const free = NEON.filter((c) => !used.has(c));
          if (free.length) p.color = free[Math.floor(cr() * free.length)];
        }
      }
      let hearts = 3, heartPop = 0, shake = 0, time = 0, endT = -1, endWin = false;
      const parts = [];
      let lay = null;
      const dpr = Math.min(3, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
      const pt = [0, 0];

      function remaining() { return pcs.filter((p) => p.state === 'idle' || p.state === 'bump').length; }
      function setInfo() {
        if (api.level === 1 && remaining() === pcs.length) api.info('點箭頭，它會往箭頭方向滑出去');
        else api.info('剩 ' + remaining() + ' 條箭頭');
      }

      function layout() {
        const W = api.W, H = api.H, hud = 50;
        const cell = Math.min((W - 28) / cols, (H - hud - 20) / rows, 72);
        const bw = cols * cell, bh = rows * cell;
        lay = { W, H, hud, cell, bx: (W - bw) / 2, by: hud + (H - hud - bh) / 2, bw, bh };
        let cv = null;
        try { cv = document.createElement('canvas'); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); } catch (e) { cv = null; }
        lay.bg = cv;
        if (cv && cv.getContext) {
          const g = cv.getContext('2d');
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          paintBg(g);
        }
      }
      function paintBg(g) {
        const { W, H, cell, bx, by, bw, bh } = lay;
        let gr = g.createLinearGradient(0, 0, W, H);
        gr.addColorStop(0, '#1c1640'); gr.addColorStop(0.5, '#151b3a'); gr.addColorStop(1, '#0e2236');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        gr = g.createRadialGradient(W * 0.5, H * 0.35, 10, W * 0.5, H * 0.35, Math.max(W, H) * 0.7);
        gr.addColorStop(0, 'rgba(178,107,255,0.18)'); gr.addColorStop(1, 'rgba(178,107,255,0)');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        const pad = cell * 0.22;
        g.fillStyle = 'rgba(0,0,0,0.35)';
        U.rr(g, bx - pad + 3, by - pad + 6, bw + pad * 2, bh + pad * 2, cell * 0.4); g.fill();
        gr = g.createLinearGradient(0, by, 0, by + bh);
        gr.addColorStop(0, '#1d2340'); gr.addColorStop(1, '#141a30');
        g.fillStyle = gr;
        U.rr(g, bx - pad, by - pad, bw + pad * 2, bh + pad * 2, cell * 0.4); g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 2; g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.13)';
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          g.beginPath(); g.arc(bx + (x + 0.5) * cell, by + (y + 0.5) * cell, Math.max(1.5, cell * 0.045), 0, Math.PI * 2); g.fill();
        }
      }

      // position on a piece's track at parameter t (cells), in px
      function trackAt(p, t, out) {
        const tr = p.track, i = Math.max(0, Math.min(tr.length - 2, Math.floor(t))), f = t - i;
        const a = tr[i], b = tr[i + 1];
        out[0] = lay.bx + (a[0] + (b[0] - a[0]) * f + 0.5) * lay.cell;
        out[1] = lay.by + (a[1] + (b[1] - a[1]) * f + 0.5) * lay.cell;
        return out;
      }
      function piecePath(g, p) {
        const t0 = p.s, t1 = p.s + p.n - 1;
        trackAt(p, t0, pt);
        g.beginPath(); g.moveTo(pt[0], pt[1]);
        for (let k = Math.floor(t0) + 1; k < t1; k++) { trackAt(p, k, pt); g.lineTo(pt[0], pt[1]); }
        trackAt(p, t1, pt); g.lineTo(pt[0], pt[1]);
      }
      function headInfo(p) {
        const t1 = p.s + p.n - 1;
        trackAt(p, t1, pt);
        const hx = pt[0], hy = pt[1];
        let d = p.dir;
        if (t1 < p.n - 1) {
          const i = Math.floor(t1);
          d = dirOf(p.track[i], p.track[i + 1]);
        }
        return [hx, hy, d];
      }

      function burst(x, y, n, col, spd, life, size) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, v = spd * (0.3 + Math.random() * 0.9);
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life, size: size * (0.5 + Math.random() * 0.8), color: col, grav: 0 });
        }
      }

      function tap(x, y) {
        if (api.ended || endT >= 0 || hearts <= 0) return;
        const { cell, bx, by } = lay;
        const gx = Math.floor((x - bx) / cell), gy = Math.floor((y - by) / cell);
        let id = -1;
        if (gx >= 0 && gy >= 0 && gx < cols && gy < rows) id = grid[gy * cols + gx];
        if (id < 0) {
          let best = cell * 0.7;
          for (const p of pcs) {
            if (p.state !== 'idle') continue;
            for (const c of p.cells) {
              const d = Math.hypot(x - (bx + (c[0] + 0.5) * cell), y - (by + (c[1] + 0.5) * cell));
              if (d < best) { best = d; id = p.id; }
            }
          }
        }
        if (id < 0) return;
        const p = pcs[id];
        if (p.state !== 'idle') return;
        p.flash = 1;
        const pr = probe(grid, cols, rows, p);
        if (pr.free) {
          api.sfx('pop');
          p.state = 'exit'; p.v = 7; p.s = 0;
          for (const c of p.cells) grid[c[1] * cols + c[0]] = -1;
          setInfo();
          if (!remaining()) { endT = 0.8; endWin = true; }
        } else {
          api.sfx('tap');
          p.state = 'bump'; p.t = 0; p.hit = false; p.reach = pr.gap + 0.32; p.blk = pr.hit;
        }
      }

      layout();
      setInfo();

      return {
        update(dt) {
          time += dt;
          shake = Math.max(0, shake - dt * 3);
          heartPop = Math.max(0, heartPop - dt * 2.5);
          for (const p of pcs) {
            p.flash = Math.max(0, p.flash - dt * 2.2);
            p.shake = Math.max(0, p.shake - dt * 2.5);
            if (p.state === 'exit') {
              p.v = Math.min(34, p.v + 70 * dt);
              p.s += p.v * dt;
              const tail = p.track[Math.min(p.track.length - 1, Math.floor(p.s))];
              if (tail[0] < -1 || tail[1] < -1 || tail[0] > cols || tail[1] > rows || p.s >= p.track.length - p.n) {
                p.state = 'gone';
              }
            } else if (p.state === 'bump') {
              p.t += dt;
              const T1 = 0.06 + Math.min(0.2, p.reach * 0.035), T2 = T1 + 0.3;
              if (p.t < T1) { const k = p.t / T1; p.s = p.reach * k * k; }
              else {
                if (!p.hit) {
                  p.hit = true;
                  api.sfx('bad');
                  hearts--; heartPop = 1; shake = 1;
                  if (p.blk >= 0) { pcs[p.blk].shake = 1; pcs[p.blk].flash = 0.6; }
                  const hi = headInfo(p);
                  burst(hi[0], hi[1], 12, '#ff5d6c', 150, 0.4, 3.5);
                  api.info(hearts > 0 ? '撞到了！剩 ' + hearts + ' 顆心' : '沒有心了');
                }
                const k = Math.min(1, (p.t - T1) / (T2 - T1));
                p.s = p.reach * (1 - U.easeOutCubic(k));
                if (p.t >= T2) {
                  p.s = 0; p.state = 'idle';
                  if (hearts <= 0 && endT < 0) { endT = 0.25; endWin = false; }
                }
              }
            }
          }
          for (let i = parts.length - 1; i >= 0; i--) {
            const q = parts[i];
            q.life -= dt; if (q.life <= 0) { parts.splice(i, 1); continue; }
            q.x += q.vx * dt; q.y += q.vy * dt; q.vy += q.grav * dt;
            if (!q.grav) { q.vx *= 0.95; q.vy *= 0.95; }
          }
          if (endT >= 0 && !api.ended) {
            endT -= dt;
            if (endT < 0) {
              if (endWin) {
                for (let i = 0; i < 80; i++) {
                  parts.push({ x: api.W * Math.random(), y: -10, vx: (Math.random() - 0.5) * 120, vy: 80 + Math.random() * 160, life: 2.4, max: 2.4, size: 4 + Math.random() * 3, color: NEON[i % NEON.length], grav: 120, conf: true });
                }
                api.win('全部清空！');
              } else api.lose('撞太多次了');
            }
          }
        },
        draw(g) {
          if (!lay) return;
          const { W, H, cell, bx, by, bw, bh } = lay;
          g.fillStyle = '#151b3a'; g.fillRect(0, 0, W, H);
          g.save();
          if (shake > 0) g.translate((Math.random() - 0.5) * 8 * shake, (Math.random() - 0.5) * 8 * shake);
          if (lay.bg && lay.bg.getContext) g.drawImage(lay.bg, 0, 0, W, H); else paintBg(g);
          g.lineCap = 'round'; g.lineJoin = 'round';
          const lw = cell * 0.2;
          for (let pass = 0; pass < 2; pass++) {
            for (const p of pcs) {
              if (p.state === 'gone') continue;
              if ((p.state === 'exit') !== (pass === 1)) continue;
              g.save();
              if (p.shake > 0) {
                const s = Math.sin(time * 70) * p.shake * cell * 0.07;
                g.translate(DY[p.dir] !== 0 ? s : 0, DX[p.dir] !== 0 ? s : 0);
              }
              let alpha = 1;
              if (p.state === 'exit') {
                const hi = headInfo(p);
                const out = Math.max(bx - hi[0], hi[0] - (bx + bw), by - hi[1], hi[1] - (by + bh)) / cell;
                alpha = Math.max(0, Math.min(1, 1 - (out - p.n * 0.6) / 4));
              }
              g.globalAlpha = alpha;
              const fl = p.flash;
              const col = p.color;
              piecePath(g, p);
              g.strokeStyle = col; g.globalAlpha = alpha * (0.18 + fl * 0.25); g.lineWidth = lw * 2.6; g.stroke();
              g.globalAlpha = alpha;
              g.strokeStyle = fl > 0 ? U.shade(col, fl * 0.6) : col; g.lineWidth = lw; g.stroke();
              g.strokeStyle = 'rgba(255,255,255,' + (0.35 + fl * 0.5).toFixed(3) + ')'; g.lineWidth = lw * 0.32; g.stroke();
              // tail cap dot
              trackAt(p, p.s, pt);
              g.fillStyle = U.shade(col, -0.2);
              g.beginPath(); g.arc(pt[0], pt[1], lw * 0.62, 0, Math.PI * 2); g.fill();
              // arrow head
              const hi = headInfo(p);
              const a = Math.atan2(DY[hi[2]], DX[hi[2]]);
              const hs = cell * 0.3 * (1 + fl * 0.25);
              g.save(); g.translate(hi[0], hi[1]); g.rotate(a);
              g.fillStyle = col; g.globalAlpha = alpha * 0.25;
              g.beginPath(); g.moveTo(hs * 1.35, 0); g.lineTo(-hs * 0.55, -hs * 1.15); g.lineTo(-hs * 0.55, hs * 1.15); g.closePath(); g.fill();
              g.globalAlpha = alpha;
              g.beginPath(); g.moveTo(hs * 1.05, 0); g.lineTo(-hs * 0.4, -hs * 0.85); g.lineTo(-hs * 0.15, 0); g.lineTo(-hs * 0.4, hs * 0.85); g.closePath();
              g.fillStyle = fl > 0 ? '#ffffff' : U.shade(col, 0.35); g.fill();
              g.restore();
              g.restore();
            }
          }
          g.globalAlpha = 1;
          for (const q of parts) {
            const al = Math.max(0, q.life / q.max);
            g.globalAlpha = al; g.fillStyle = q.color;
            if (q.conf) { g.save(); g.translate(q.x, q.y); g.rotate(q.life * 6); g.fillRect(-q.size / 2, -q.size / 4, q.size, q.size / 2); g.restore(); }
            else { g.beginPath(); g.arc(q.x, q.y, q.size * (0.5 + al * 0.5), 0, Math.PI * 2); g.fill(); }
          }
          g.globalAlpha = 1;
          g.restore();
          // HUD
          g.fillStyle = 'rgba(255,255,255,0.08)';
          U.rr(g, 10, 9, 112, 32, 16); g.fill();
          for (let i = 0; i < 3; i++) {
            const hx = 32 + i * 34, hy = 25;
            const s = (i === hearts && heartPop > 0) ? 1 + heartPop * 0.5 : 1;
            g.save(); g.translate(hx, hy); g.scale(s, s);
            drawHeart(g, 0, 0, 11, i < hearts ? '#ff4d7a' : 'rgba(255,255,255,0.22)');
            g.restore();
          }
          g.fillStyle = 'rgba(255,255,255,0.08)';
          U.rr(g, W - 100, 9, 90, 32, 16); g.fill();
          U.text(g, '➜ ' + remaining(), W - 55, 26, 17, '#e9e4ff', 'center', 800);
        },
        down(x, y) { tap(x, y); },
        _test: {
          cellXY: (cx, cy) => [lay.bx + (cx + 0.5) * lay.cell, lay.by + (cy + 0.5) * lay.cell],
          hearts: () => hearts,
        },
        resize() { layout(); },
      };
      function drawHeart(g, x, y, r, col) {
        g.fillStyle = col;
        g.beginPath();
        g.moveTo(x, y + r * 0.9);
        g.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.7, y - r * 1.2, x, y - r * 0.4);
        g.bezierCurveTo(x + r * 0.7, y - r * 1.2, x + r * 1.5, y - r * 0.1, x, y + r * 0.9);
        g.fill();
      }
    },
  });
})();
