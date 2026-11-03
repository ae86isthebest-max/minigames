// 一筆連線 — Flow Free: connect every pair of coloured dots with pipes that fill the whole grid.
(function () {
  'use strict';

  const COLORS = ['#ff3a3a', '#2f7bff', '#22c24a', '#ffe02e', '#ff8c1a', '#2ee6e6', '#ff3bd4', '#b4472a',
    '#9b4dff', '#f2f2f2', '#9a9aa8', '#a6ff3c', '#d8b48a', '#3a4ad0'];

  // ---------- level generation: random Hamiltonian path (backbite) cut into pairs ----------
  function sizeOf(diff, lv) {
    if (diff === 0) {
      if (lv <= 2) return [4, 3];
      if (lv <= 5) return [5, lv <= 3 ? 5 : 4];
      if (lv <= 10) return [6, lv <= 7 ? 6 : 5];
      if (lv <= 18) return [7, lv <= 13 ? 7 : 6];
      if (lv <= 30) return [8, lv <= 24 ? 8 : 7];
      return [9, 8];
    }
    if (diff === 1) {
      if (lv <= 4) return [7, 6];
      if (lv <= 12) return [8, lv <= 8 ? 7 : 6];
      if (lv <= 24) return [9, lv <= 18 ? 8 : 7];
      return [10, 8];
    }
    if (lv <= 8) return [9, lv <= 3 ? 8 : 7];
    return [10, lv <= 20 ? 8 : 7];
  }

  function hamiltonian(N, rng) {
    const n = N * N;
    const p = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) p.push(r * N + ((r & 1) ? N - 1 - c : c));
    const pos = new Int32Array(n);
    const fix = () => { for (let i = 0; i < n; i++) pos[p[i]] = i; };
    fix();
    const nb = [];
    const moves = n * 30;
    for (let m = 0; m < moves; m++) {
      if (rng() < 0.5) p.reverse(), fix();
      const h = p[0], hr = (h / N) | 0, hc = h % N;
      nb.length = 0;
      if (hr > 0) nb.push(h - N); if (hr < N - 1) nb.push(h + N);
      if (hc > 0) nb.push(h - 1); if (hc < N - 1) nb.push(h + 1);
      const v = nb[Math.floor(rng() * nb.length)];
      const i = pos[v];
      if (i <= 1) continue;
      // reverse prefix p[0..i-1]
      for (let a = 0, b = i - 1; a < b; a++, b--) { const t = p[a]; p[a] = p[b]; p[b] = t; }
      for (let k = 0; k < i; k++) pos[p[k]] = k;
    }
    return p;
  }

  function adjacent(a, b, N) {
    const ar = (a / N) | 0, ac = a % N, br = (b / N) | 0, bc = b % N;
    return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
  }

  function genLevel(rng, diff, lv) {
    const [N, K] = sizeOf(diff, lv);
    const minLen = diff === 2 ? 4 : 3;
    for (let attempt = 0; attempt < 400; attempt++) {
      const p = hamiltonian(N, rng);
      const n = N * N;
      // random lengths ≥ minLen summing to n, varied (some long snakes, some short)
      const w = [];
      for (let k = 0; k < K; k++) w.push(0.35 + rng() * rng() * 2.2);
      const ws = w.reduce((a, b) => a + b, 0);
      const extra = n - K * minLen;
      const lens = w.map((x) => minLen + Math.floor(extra * x / ws));
      let left = n - lens.reduce((a, b) => a + b, 0);
      for (let k = 0; left > 0; k = (k + 1) % K) { lens[k]++; left--; }
      const sol = [];
      let at = 0, ok = true;
      for (let k = 0; k < K; k++) {
        const seg = p.slice(at, at + lens[k]);
        at += lens[k];
        if (adjacent(seg[0], seg[seg.length - 1], N)) { ok = false; break; }
        sol.push(seg);
      }
      if (!ok) continue;
      // reject segments that run straight along a single row/col of length ≥ N (too obvious)
      const order = sol.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = order[i]; order[i] = order[j]; order[j] = t; }
      const solution = order.map((i) => sol[i]);
      return { N, K, solution, dots: solution.map((s) => [s[0], s[s.length - 1]]) };
    }
    // fallback (never expected): plain cut without the adjacency rule
    const p = hamiltonian(N, rng), per = Math.floor(N * N / K), solution = [];
    for (let k = 0; k < K; k++) solution.push(p.slice(k * per, k === K - 1 ? N * N : (k + 1) * per));
    return { N, K, solution, dots: solution.map((s) => [s[0], s[s.length - 1]]) };
  }

  // ---------- drawing helpers (swap these for a restyle) ----------
  function drawBackground(g, W, H, time) {
    const gr = g.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, '#1d1640'); gr.addColorStop(1, '#3b1747');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 10; i++) {
      const x = ((i * 89 + 17) % 100) / 100 * W, y = ((i * 41 + 29) % 100) / 100 * H;
      g.fillStyle = COLORS[i % COLORS.length];
      g.globalAlpha = 0.05;
      g.beginPath(); g.arc(x + Math.sin(time * 0.3 + i) * 10, y, 30 + (i * 17) % 40, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
  }

  function drawDot(g, x, y, r, col, pulse, done) {
    const s = 1 + pulse * 0.25;
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.beginPath(); g.arc(x, y + r * 0.12, r * s, 0, Math.PI * 2); g.fill();
    const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * s);
    gr.addColorStop(0, MG.util.shade(col, 0.5)); gr.addColorStop(0.6, col); gr.addColorStop(1, MG.util.shade(col, -0.3));
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * s, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.38, r * 0.3, r * 0.17, -0.5, 0, Math.PI * 2); g.fill();
    if (done) {
      g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = Math.max(1.5, r * 0.12);
      g.beginPath(); g.arc(x, y, r * s * 0.42, 0, Math.PI * 2); g.stroke();
    }
  }

  MG.register({
    id: 'flow', name: '一筆連線', icon: '🔗', color: '#ff7ac8',
    _genLevel: genLevel,
    create(api) {
      const U = api.util;
      const diff = api.diff || 0;
      const lvl = genLevel(api.rng, diff, api.level);
      const N = lvl.N, K = lvl.K, NN = N * N;
      const cols = COLORS.slice(0, Math.max(K, 1));
      // shuffle colours with the level rng so levels look different
      for (let i = cols.length - 1; i > 0; i--) { const j = Math.floor(api.rng() * (i + 1)); const t = cols[i]; cols[i] = cols[j]; cols[j] = t; }
      const dotAt = new Int16Array(NN).fill(-1);
      lvl.dots.forEach((d, k) => { dotAt[d[0]] = k; dotAt[d[1]] = k; });
      let paths = [];
      for (let k = 0; k < K; k++) paths.push([]);
      const owner = new Int16Array(NN);
      let drag = null;          // { k, snap }
      let time = 0, won = false, winT = 0, shake = 0, hints = diff === 0 ? 3 : diff === 1 ? 1 : 0;
      let timeLeft = diff === 2 ? Math.round(NN * (api.level <= 8 ? 1.05 : 0.95) + 15) : 0;
      const timeMax = timeLeft;
      const pulse = new Float32Array(K);
      const parts = [];
      let cell = 40, gx = 0, gy = 0, pointer = null, msgT = 0, msg = '';
      let hintBtn = null;

      function layout() {
        const W = api.W, H = api.H;
        const top = 56, bottom = 74;
        cell = Math.floor(Math.min((W - 20) / N, (H - top - bottom) / N));
        gx = Math.round((W - cell * N) / 2);
        gy = Math.round(top + (H - top - bottom - cell * N) / 2);
        hintBtn = { x: W / 2 - 70, y: Math.min(H - 60, gy + cell * N + 14), w: 140, h: 46 };
      }
      layout();

      function rebuildOwner() {
        owner.fill(-1);
        for (let k = 0; k < K; k++) for (const c of paths[k]) owner[c] = k;
        for (let i = 0; i < NN; i++) if (dotAt[i] >= 0) owner[i] = dotAt[i];
      }
      rebuildOwner();

      function complete(k) {
        const p = paths[k];
        if (p.length < 2) return false;
        const d = lvl.dots[k];
        return (p[0] === d[0] && p[p.length - 1] === d[1]) || (p[0] === d[1] && p[p.length - 1] === d[0]);
      }
      function stats() {
        let c = 0;
        for (let k = 0; k < K; k++) if (complete(k)) c++;
        let f = 0;
        for (let i = 0; i < NN; i++) if (owner[i] >= 0) f++;
        return { conn: c, fill: f };
      }
      function setInfo() {
        const s = stats();
        if (!diff && api.level === 1 && s.conn === 0) api.info('從圓點拖到同色圓點，填滿所有格子！');
        else api.info('連線 ' + s.conn + '/' + K + '・填滿 ' + Math.floor(s.fill * 100 / NN) + '%');
      }
      setInfo();

      function cellAt(x, y) {
        const c = Math.floor((x - gx) / cell), r = Math.floor((y - gy) / cell);
        if (c < 0 || r < 0 || c >= N || r >= N) return -1;
        return r * N + c;
      }
      function center(i) { return [gx + (i % N + 0.5) * cell, gy + (((i / N) | 0) + 0.5) * cell]; }

      function burst(i, col, n) {
        const [x, y] = center(i);
        for (let q = 0; q < n && parts.length < 300; q++) {
          const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 120;
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.6, max: 0.6, col, s: 2 + Math.random() * 3 });
        }
      }
      function confetti() {
        for (let q = 0; q < 120; q++) {
          parts.push({ x: api.W / 2 + (Math.random() - 0.5) * 120, y: api.H * 0.45, vx: (Math.random() - 0.5) * 520, vy: -250 - Math.random() * 380, life: 2, max: 2, col: cols[q % cols.length], s: 3 + Math.random() * 3, g: 650, conf: true, rot: Math.random() * 6 });
        }
      }

      // apply the dragged path, cutting any other pipe it crosses (restored if you back off — like Flow)
      function applyDrag() {
        const k = drag.k, cur = paths[k];
        const inCur = new Uint8Array(NN);
        for (const c of cur) inCur[c] = 1;
        for (let o = 0; o < K; o++) {
          if (o === k) continue;
          const sp = drag.snap[o];
          let cut = sp.length;
          for (let i = 0; i < sp.length; i++) if (inCur[sp[i]]) { cut = i; break; }
          paths[o] = cut < sp.length ? sp.slice(0, cut) : sp.slice();
          if (paths[o].length === 1) paths[o] = paths[o].slice();
        }
        rebuildOwner();
      }

      function startAt(i) {
        if (i < 0) return false;
        let k = dotAt[i];
        if (k >= 0) {
          drag = { k, snap: paths.map((p) => p.slice()) };
          const p = paths[k];
          if (p.length && (p[0] === i)) paths[k] = [i];
          else if (p.length && p[p.length - 1] === i && !complete(k)) { /* continue from the end */ }
          else paths[k] = [i];
          if (paths[k].length === 0) paths[k] = [i];
          api.sfx('tap');
          applyDrag();
          return true;
        }
        k = owner[i];
        if (k >= 0) {
          const p = paths[k], idx = p.indexOf(i);
          if (idx >= 0) {
            drag = { k, snap: paths.map((q) => q.slice()) };
            paths[k] = p.slice(0, idx + 1);
            api.sfx('tap');
            applyDrag();
            return true;
          }
        }
        return false;
      }

      function stepTo(i) {
        const k = drag.k, p = paths[k];
        const head = p[p.length - 1];
        if (i === head) return true;
        if (!adjacent(i, head, N)) return false;
        const idx = p.indexOf(i);
        if (idx >= 0) { paths[k] = p.slice(0, idx + 1); applyDrag(); return true; }
        if (complete(k)) return false;
        const d = dotAt[i];
        if (d >= 0 && d !== k) { shakeCell(i); return false; }
        p.push(i);
        applyDrag();
        if (d === k) {
          pulse[k] = 1; burst(i, cols[k], 14); api.sfx('good');
        } else api.sfx('pop');
        return true;
      }
      function shakeCell() { if (shake <= 0) { shake = 0.25; api.sfx('bad'); } }

      // walk from the head toward cell i through orthogonal steps (fast swipes skip cells)
      function dragTo(x, y) {
        if (!drag) return;
        const target = cellAt(x, y);
        if (target < 0) return;
        let guard = 0;
        while (guard++ < NN) {
          const p = paths[drag.k], head = p[p.length - 1];
          if (head === target) break;
          const hr = (head / N) | 0, hc = head % N, tr = (target / N) | 0, tc = target % N;
          let next;
          if (Math.abs(tr - hr) > Math.abs(tc - hc)) next = head + (tr > hr ? N : -N);
          else next = head + (tc > hc ? 1 : -1);
          if (!stepTo(next)) break;
        }
      }

      function checkWin() {
        if (won) return;
        const s = stats();
        if (s.conn === K && s.fill === NN) {
          won = true; winT = 0; confetti();
          api.info('完美！全部連通並填滿');
          api.win('完美連線！');
        } else if (s.conn === K) {
          msg = '還有空格沒填滿！'; msgT = 1.6; api.sfx('bad');
        }
      }

      function useHint() {
        if (hints <= 0) { shake = 0.25; api.sfx('bad'); return; }
        let pick = -1;
        for (let k = 0; k < K; k++) {
          const sol = lvl.solution[k], p = paths[k];
          const same = p.length === sol.length && (p.every((c, i) => c === sol[i]) || p.every((c, i) => c === sol[sol.length - 1 - i]));
          if (!same) { pick = k; break; }
        }
        if (pick < 0) return;
        hints--;
        drag = { k: pick, snap: paths.map((p) => p.slice()) };
        paths[pick] = lvl.solution[pick].slice();
        applyDrag();
        drag = null;
        pulse[pick] = 1;
        for (const c of lvl.solution[pick]) if (Math.random() < 0.35) burst(c, cols[pick], 2);
        api.sfx('good');
        setInfo();
        checkWin();
      }

      function down(x, y) {
        if (api.ended || won) return;
        pointer = [x, y];
        if (hintBtn && hints > 0 && x >= hintBtn.x && x <= hintBtn.x + hintBtn.w && y >= hintBtn.y && y <= hintBtn.y + hintBtn.h) { useHint(); return; }
        if (!startAt(cellAt(x, y))) pointer = null;
      }
      function move(x, y) {
        if (!drag || api.ended) return;
        pointer = [x, y];
        dragTo(x, y);
        setInfo();
      }
      function up() {
        pointer = null;
        if (!drag) return;
        const p = paths[drag.k];
        if (p.length === 1 && dotAt[p[0]] >= 0) paths[drag.k] = [];
        drag = null;
        rebuildOwner();
        setInfo();
        checkWin();
      }

      function update(dt) {
        time += dt;
        for (let k = 0; k < K; k++) pulse[k] = Math.max(0, pulse[k] - dt * 3);
        shake = Math.max(0, shake - dt);
        msgT = Math.max(0, msgT - dt);
        if (won) winT += dt;
        for (let i = parts.length - 1; i >= 0; i--) {
          const q = parts[i]; q.life -= dt;
          if (q.life <= 0) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
          q.vy += (q.g || 0) * dt; q.x += q.vx * dt; q.y += q.vy * dt; if (!q.g) { q.vx *= 0.93; q.vy *= 0.93; }
        }
        if (api.ended) return;
        if (timeMax > 0) {
          timeLeft -= dt;
          if (timeLeft <= 0) { timeLeft = 0; drag = null; api.lose('時間到！'); }
        }
      }

      function draw(g) {
        const W = api.W, H = api.H;
        drawBackground(g, W, H, time);
        const sx = shake > 0 ? Math.sin(time * 70) * shake * 14 : 0;
        g.save(); g.translate(sx, 0);
        // board
        g.fillStyle = 'rgba(0,0,0,0.35)';
        U.rr(g, gx - 6, gy - 6, cell * N + 12, cell * N + 12, 12); g.fill();
        g.fillStyle = '#0d0b1c';
        U.rr(g, gx, gy, cell * N, cell * N, 6); g.fill();
        // filled-cell tint
        for (let i = 0; i < NN; i++) {
          const k = owner[i];
          if (k < 0) continue;
          const isPipe = dotAt[i] < 0 || paths[k].length > 1;
          if (!isPipe) continue;
          const wave = won ? Math.max(0, 1 - Math.abs(winT * 2.2 - ((i % N) + ((i / N) | 0)) / N)) : 0;
          g.fillStyle = cols[k];
          g.globalAlpha = 0.2 + wave * 0.35;
          g.fillRect(gx + (i % N) * cell, gy + ((i / N) | 0) * cell, cell, cell);
        }
        g.globalAlpha = 1;
        // grid lines
        g.strokeStyle = 'rgba(255,255,255,0.16)'; g.lineWidth = 1;
        g.beginPath();
        for (let i = 1; i < N; i++) {
          g.moveTo(gx + i * cell + 0.5, gy); g.lineTo(gx + i * cell + 0.5, gy + cell * N);
          g.moveTo(gx, gy + i * cell + 0.5); g.lineTo(gx + cell * N, gy + i * cell + 0.5);
        }
        g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1.5;
        U.rr(g, gx, gy, cell * N, cell * N, 6); g.stroke();
        // pipes
        g.lineCap = 'round'; g.lineJoin = 'round';
        for (let k = 0; k < K; k++) {
          const p = paths[k];
          if (p.length < 2) continue;
          g.strokeStyle = MG.util.shade(cols[k], -0.35); g.lineWidth = cell * 0.4;
          g.beginPath();
          for (let i = 0; i < p.length; i++) { const [x, y] = center(p[i]); if (i) g.lineTo(x, y + 1.5); else g.moveTo(x, y + 1.5); }
          g.stroke();
          g.strokeStyle = cols[k]; g.lineWidth = cell * 0.34;
          g.beginPath();
          for (let i = 0; i < p.length; i++) { const [x, y] = center(p[i]); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
          g.stroke();
          g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = cell * 0.08;
          g.beginPath();
          for (let i = 0; i < p.length; i++) { const [x, y] = center(p[i]); if (i) g.lineTo(x - cell * 0.05, y - cell * 0.06); else g.moveTo(x - cell * 0.05, y - cell * 0.06); }
          g.stroke();
        }
        // dots
        for (let k = 0; k < K; k++) {
          const d = lvl.dots[k], done = complete(k);
          for (const c of d) { const [x, y] = center(c); drawDot(g, x, y, cell * 0.34, cols[k], pulse[k], done); }
        }
        // finger glow while dragging
        if (drag && pointer) {
          g.fillStyle = cols[drag.k]; g.globalAlpha = 0.28;
          g.beginPath(); g.arc(pointer[0], pointer[1], Math.max(26, cell * 0.9), 0, Math.PI * 2); g.fill();
          g.globalAlpha = 1;
        }
        // level-1 hint: pulsing ring on the first dot
        if (!diff && api.level === 1 && stats().conn === 0 && !drag) {
          const [x, y] = center(lvl.dots[0][0]);
          const t = (time * 1.3) % 1;
          g.strokeStyle = 'rgba(255,255,255,' + (1 - t) + ')'; g.lineWidth = 3;
          g.beginPath(); g.arc(x, y, cell * 0.4 + t * cell * 0.5, 0, Math.PI * 2); g.stroke();
          U.text(g, '👆', x + cell * 0.25, y + cell * 0.45 + Math.sin(time * 6) * 3, 24, '#fff');
        }
        g.restore();
        // particles
        for (const q of parts) {
          g.globalAlpha = Math.max(0, q.life / q.max);
          g.fillStyle = q.col;
          if (q.conf) { g.save(); g.translate(q.x, q.y); g.rotate(q.rot + q.life * 7); g.fillRect(-q.s, -q.s / 2, q.s * 2, q.s); g.restore(); }
          else { g.beginPath(); g.arc(q.x, q.y, q.s, 0, Math.PI * 2); g.fill(); }
        }
        g.globalAlpha = 1;
        // HUD
        const s = stats();
        U.text(g, '連線 ' + s.conn + '/' + K, 16, 22, 15, '#fff', 'left', 900);
        U.text(g, '填滿 ' + Math.floor(s.fill * 100 / NN) + '%', W - 16, 22, 15, s.fill === NN ? '#7dffa0' : '#fff', 'right', 900);
        U.text(g, N + '×' + N, W / 2, 22, 13, 'rgba(255,255,255,0.6)', 'center', 800);
        if (timeMax > 0) {
          const p = timeLeft / timeMax;
          g.fillStyle = 'rgba(255,255,255,0.15)'; U.rr(g, 16, 38, W - 32, 7, 3.5); g.fill();
          g.fillStyle = p < 0.25 ? '#ff5d6c' : p < 0.5 ? '#ffcc4d' : '#4cd986';
          if (p > 0) { U.rr(g, 16, 38, (W - 32) * p, 7, 3.5); g.fill(); }
          if (p < 0.25 && !api.ended) U.text(g, Math.ceil(timeLeft) + 's', W / 2, 52, 11, '#ffb0b8', 'center', 900);
        }
        if (hints > 0 || diff < 2) {
          const b = hintBtn, on = hints > 0 && !won;
          g.fillStyle = on ? 'rgba(255,214,90,0.95)' : 'rgba(255,255,255,0.12)';
          U.rr(g, b.x, b.y, b.w, b.h, 23); g.fill();
          U.text(g, '💡 提示 ×' + hints, b.x + b.w / 2, b.y + b.h / 2 + 1, 16, on ? '#3a2600' : 'rgba(255,255,255,0.45)', 'center', 900);
        }
        if (msgT > 0) {
          g.globalAlpha = Math.min(1, msgT * 2);
          g.fillStyle = 'rgba(20,10,40,0.85)'; U.rr(g, W / 2 - 100, gy + cell * N / 2 - 22, 200, 44, 22); g.fill();
          U.text(g, msg, W / 2, gy + cell * N / 2, 16, '#ffd1d6', 'center', 900);
          g.globalAlpha = 1;
        }
      }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _level: lvl, _center: center, _paths: () => paths,
      };
    },
  });
})();
