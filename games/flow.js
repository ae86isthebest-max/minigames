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

  // ---------- drawing helpers — v4 卡通 Q 版: cute outlined dots/pipes on a wooden board in a sunny garden ----------
  const OL = '#2a1a14';
  const FONT = 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
  function ink(g, lw) { g.lineWidth = lw; g.strokeStyle = OL; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
  function oText(g, s, x, y, size, col, align) {
    g.font = '900 ' + size + FONT; g.textAlign = align || 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.lineWidth = Math.max(2.5, size * 0.24); g.strokeStyle = OL; g.strokeText(s, x, y);
    g.fillStyle = col; g.fillText(s, x, y);
  }
  let bgCache = null, bgKey = '';
  function paintGarden(g, W, H) {
    const sk = g.createLinearGradient(0, 0, 0, H);
    sk.addColorStop(0, '#8fd8ff'); sk.addColorStop(0.22, '#d4f1ff'); sk.addColorStop(0.23, '#9ee08a'); sk.addColorStop(1, '#6cc46a');
    g.fillStyle = sk; g.fillRect(0, 0, W, H);
    // sun
    g.beginPath(); g.arc(W * 0.85, H * 0.09, 26, 0, 6.283); g.fillStyle = '#ffe27a'; g.fill(); ink(g, 3);
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(W * 0.85 - 9, H * 0.09 - 9, 7, 4, -0.6, 0, 6.283); g.fill();
    // far hills
    const hy = H * 0.2;
    for (let l = 0; l < 2; l++) {
      const top = hy + l * 26, amp = 34 - l * 8, n = 3 + l;
      const step = (W + 40) / n;
      g.beginPath(); g.moveTo(-20, H + 10); g.lineTo(-20, top);
      for (let i = 0; i < n; i++) { const x0 = -20 + i * step; g.quadraticCurveTo(x0 + step / 2, top - amp * (0.6 + 0.4 * Math.sin(i * 2.1 + l * 1.7)), x0 + step, top); }
      g.lineTo(W + 20, H + 10); g.closePath(); g.fillStyle = l ? '#7fd36f' : '#a9e28f'; g.fill(); ink(g, 3);
    }
    // picket fence
    const fy = hy + 50;
    g.beginPath(); g.rect(-5, fy + 10, W + 10, 6); g.rect(-5, fy + 24, W + 10, 6); g.fillStyle = '#fff6e0'; g.fill(); ink(g, 2.2);
    for (let x = 6; x < W; x += 22) {
      g.beginPath(); g.moveTo(x, fy + 40); g.lineTo(x, fy + 4); g.lineTo(x + 6, fy - 3); g.lineTo(x + 12, fy + 4); g.lineTo(x + 12, fy + 40); g.closePath();
      g.fillStyle = '#fffaf0'; g.fill(); ink(g, 2.2);
    }
    // flowers + bushes scattered on the lawn (behind the board, peeking at edges)
    const R = MG.mulberry32(77);
    for (let i = 0; i < 26; i++) {
      const x = R() * W, y = fy + 50 + R() * (H - fy - 40);
      if (R() < 0.35) {
        g.beginPath(); g.moveTo(x + 14, y); g.arc(x, y, 14, 0, 6.283); g.moveTo(x + 26, y + 4); g.arc(x + 14, y + 4, 12, 0, 6.283);
        g.fillStyle = '#4fae55'; g.lineWidth = 5; g.strokeStyle = OL; g.stroke(); g.fill();
      } else {
        const col = ['#ff7ac8', '#ffcc4d', '#ffffff', '#ff8f3d', '#b26bff'][i % 5];
        g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x, y + 16); ink(g, 2);
        for (let k = 0; k < 5; k++) { const a = k * 1.2566; g.beginPath(); g.arc(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 4, 0, 6.283); g.fillStyle = col; g.fill(); ink(g, 1.6); }
        g.beginPath(); g.arc(x, y, 3.2, 0, 6.283); g.fillStyle = '#ffe27a'; g.fill(); ink(g, 1.4);
      }
    }
  }
  function drawBackground(g, W, H, time) {
    const dpr = Math.min(3, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    const key = W + 'x' + H + '@' + dpr;
    if (key !== bgKey) {
      bgKey = key; bgCache = null;
      try {
        const cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(W * dpr)); cv.height = Math.max(1, Math.round(H * dpr));
        const c2 = cv.getContext('2d'); c2.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintGarden(c2, W, H); bgCache = cv;
      } catch (e) { bgCache = null; }
    }
    if (bgCache) g.drawImage(bgCache, 0, 0, W, H); else paintGarden(g, W, H);
    // drifting outlined clouds
    for (let i = 0; i < 3; i++) {
      const s = 12 + i * 4, x = ((i * 157 + time * (8 + i * 3)) % (W + 120)) - 60, y = H * (0.06 + i * 0.09);
      g.beginPath(); g.moveTo(x + s, y); g.arc(x, y, s, 0, 6.283); g.moveTo(x + s * 1.9, y + s * 0.35); g.arc(x + s * 1.05, y + s * 0.35, s * 0.85, 0, 6.283);
      g.moveTo(x - s * 0.3, y + s * 0.4); g.arc(x - s, y + s * 0.4, s * 0.7, 0, 6.283);
      g.lineWidth = 5; g.strokeStyle = 'rgba(42,26,20,0.5)'; g.lineJoin = 'round'; g.stroke(); g.fillStyle = '#ffffff'; g.fill();
    }
  }

  function drawDot(g, x, y, r, col, pulse, done) {
    // cute outlined blob with a face; happy ^ ^ eyes when its pair is connected
    const s = 1 + pulse * 0.25, R = r * s, lw = Math.max(2, r * 0.17);
    g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.ellipse(x, y + R * 0.8, R * 0.8, R * 0.25, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fillStyle = col; g.fill(); ink(g, lw);
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.beginPath(); g.arc(x, y, R * 0.92, 0.3, 2.85); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(x - R * 0.38, y - R * 0.45, R * 0.28, R * 0.15, -0.6, 0, Math.PI * 2); g.fill();
    if (r < 7) return;
    const ex = R * 0.32, ey = y - R * 0.08;
    if (done) {
      for (const e of [-1, 1]) { g.beginPath(); g.arc(x + e * ex, ey + R * 0.12, R * 0.15, Math.PI * 1.1, Math.PI * 1.9); ink(g, lw * 0.85); }
    } else {
      g.fillStyle = OL; g.beginPath(); g.ellipse(x - ex, ey, R * 0.12, R * 0.17, 0, 0, Math.PI * 2); g.ellipse(x + ex, ey, R * 0.12, R * 0.17, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x - ex - R * 0.04, ey - R * 0.07, R * 0.05, 0, Math.PI * 2); g.arc(x + ex - R * 0.04, ey - R * 0.07, R * 0.05, 0, Math.PI * 2); g.fill();
    }
    g.beginPath(); g.arc(x, y + R * 0.2, R * 0.16, 0.15, Math.PI - 0.15); g.fillStyle = done ? '#c2405a' : 'rgba(0,0,0,0)'; g.fill(); ink(g, lw * 0.7);
    g.fillStyle = 'rgba(255,110,140,0.5)'; g.beginPath(); g.ellipse(x - R * 0.58, y + R * 0.18, R * 0.13, R * 0.08, 0, 0, Math.PI * 2); g.ellipse(x + R * 0.58, y + R * 0.18, R * 0.13, R * 0.08, 0, 0, Math.PI * 2); g.fill();
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
        const BW = cell * N, fr = Math.max(4, Math.min(7, gx - 2));
        g.fillStyle = 'rgba(0,0,0,0.25)'; U.rr(g, gx - fr + 3, gy - fr + 6, BW + fr * 2, BW + fr * 2, 14); g.fill();
        U.rr(g, gx - fr, gy - fr, BW + fr * 2, BW + fr * 2, 14); g.fillStyle = '#c98a4e'; g.fill(); ink(g, 3.5);
        g.fillStyle = 'rgba(255,255,255,0.3)'; U.rr(g, gx - fr + 6, gy - fr + 2, BW + fr * 2 - 12, Math.max(2, fr * 0.4), 2); g.fill();
        U.rr(g, gx, gy, BW, BW, 6); g.fillStyle = '#fff4dc'; g.fill();
        g.fillStyle = '#f6e6c4';
        for (let i = 0; i < NN; i++) if ((((i / N) | 0) + (i % N)) & 1) g.fillRect(gx + (i % N) * cell, gy + ((i / N) | 0) * cell, cell, cell);
        // filled-cell tint
        for (let i = 0; i < NN; i++) {
          const k = owner[i];
          if (k < 0) continue;
          const isPipe = dotAt[i] < 0 || paths[k].length > 1;
          if (!isPipe) continue;
          const wave = won ? Math.max(0, 1 - Math.abs(winT * 2.2 - ((i % N) + ((i / N) | 0)) / N)) : 0;
          g.fillStyle = cols[k];
          g.globalAlpha = 0.28 + wave * 0.4;
          g.fillRect(gx + (i % N) * cell, gy + ((i / N) | 0) * cell, cell, cell);
        }
        g.globalAlpha = 1;
        // grid lines
        g.strokeStyle = 'rgba(120,80,40,0.22)'; g.lineWidth = 1;
        g.beginPath();
        for (let i = 1; i < N; i++) {
          g.moveTo(gx + i * cell + 0.5, gy); g.lineTo(gx + i * cell + 0.5, gy + cell * N);
          g.moveTo(gx, gy + i * cell + 0.5); g.lineTo(gx + cell * N, gy + i * cell + 0.5);
        }
        g.stroke();
        U.rr(g, gx, gy, cell * N, cell * N, 6); ink(g, 2.5);
        // pipes
        g.lineCap = 'round'; g.lineJoin = 'round';
        for (let k = 0; k < K; k++) {
          const p = paths[k];
          if (p.length < 2) continue;
          g.strokeStyle = OL; g.lineWidth = cell * 0.34 + Math.max(4, cell * 0.1);
          g.beginPath();
          for (let i = 0; i < p.length; i++) { const [x, y] = center(p[i]); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
          g.stroke();
          g.strokeStyle = cols[k]; g.lineWidth = cell * 0.34;
          g.beginPath();
          for (let i = 0; i < p.length; i++) { const [x, y] = center(p[i]); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
          g.stroke();
          g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = cell * 0.08;
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
          g.fillStyle = cols[drag.k]; g.globalAlpha = 0.3;
          g.beginPath(); g.arc(pointer[0], pointer[1], Math.max(26, cell * 0.9), 0, Math.PI * 2); g.fill();
          g.globalAlpha = 0.6; ink(g, 3);
          g.globalAlpha = 1;
        }
        // level-1 hint: pulsing ring on the first dot
        if (!diff && api.level === 1 && stats().conn === 0 && !drag) {
          const [x, y] = center(lvl.dots[0][0]);
          const t = (time * 1.3) % 1;
          g.globalAlpha = 1 - t;
          g.beginPath(); g.arc(x, y, cell * 0.4 + t * cell * 0.5, 0, Math.PI * 2); ink(g, 6); g.strokeStyle = '#ffe27a'; g.lineWidth = 3; g.stroke();
          g.globalAlpha = 1;
          U.text(g, '👆', x + cell * 0.25, y + cell * 0.45 + Math.sin(time * 6) * 3, 24, '#fff');
        }
        g.restore();
        // particles
        for (const q of parts) {
          g.globalAlpha = Math.max(0, q.life / q.max);
          g.fillStyle = q.col;
          if (q.conf) { g.save(); g.translate(q.x, q.y); g.rotate(q.rot + q.life * 7); g.beginPath(); g.rect(-q.s, -q.s / 2, q.s * 2, q.s); g.fill(); ink(g, 1.2); g.restore(); }
          else { g.beginPath(); g.arc(q.x, q.y, q.s, 0, Math.PI * 2); g.fill(); }
        }
        g.globalAlpha = 1;
        // HUD
        const s = stats();
        g.fillStyle = 'rgba(42,26,20,0.72)';
        U.rr(g, 8, 8, 104, 28, 14); g.fill(); U.rr(g, W - 112, 8, 104, 28, 14); g.fill(); U.rr(g, W / 2 - 30, 10, 60, 24, 12); g.fill();
        U.text(g, '連線 ' + s.conn + '/' + K, 60, 22, 15, '#fff', 'center', 900);
        U.text(g, '填滿 ' + Math.floor(s.fill * 100 / NN) + '%', W - 60, 22, 15, s.fill === NN ? '#7dffa0' : '#fff', 'center', 900);
        U.text(g, N + '×' + N, W / 2, 22, 13, '#ffe27a', 'center', 900);
        if (timeMax > 0) {
          const p = timeLeft / timeMax;
          g.fillStyle = 'rgba(42,26,20,0.4)'; U.rr(g, 16, 40, W - 32, 9, 4.5); g.fill();
          g.fillStyle = p < 0.25 ? '#ff5d6c' : p < 0.5 ? '#ffcc4d' : '#4cd986';
          if (p > 0) { U.rr(g, 16, 40, Math.max(9, (W - 32) * p), 9, 4.5); g.fill(); }
          U.rr(g, 16, 40, W - 32, 9, 4.5); ink(g, 2.2);
          if (p < 0.25 && !api.ended) oText(g, Math.ceil(timeLeft) + 's', W / 2, 44.5, 12, '#ffd1d6');
        }
        if (hints > 0 || diff < 2) {
          const b = hintBtn, on = hints > 0 && !won;
          g.fillStyle = 'rgba(0,0,0,0.25)'; U.rr(g, b.x + 2, b.y + 4, b.w, b.h, 23); g.fill();
          U.rr(g, b.x, b.y, b.w, b.h, 23); g.fillStyle = on ? '#ffcc4d' : '#c9c1b4'; g.fill(); ink(g, 3.5);
          g.fillStyle = 'rgba(255,255,255,0.4)'; U.rr(g, b.x + 12, b.y + 5, b.w - 24, 11, 5.5); g.fill();
          g.font = '900 16' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
          g.lineWidth = 4; g.strokeStyle = OL; g.strokeText('💡 提示 ×' + hints, b.x + b.w / 2, b.y + b.h / 2 + 1);
          g.fillStyle = on ? '#ffffff' : '#ece6dc'; g.fillText('💡 提示 ×' + hints, b.x + b.w / 2, b.y + b.h / 2 + 1);
        }
        if (msgT > 0) {
          g.globalAlpha = Math.min(1, msgT * 2);
          U.rr(g, W / 2 - 100, gy + cell * N / 2 - 22, 200, 44, 22); g.fillStyle = 'rgba(42,26,20,0.9)'; g.fill(); ink(g, 3);
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
