// 圈地大作戰 — Paper.io: your blob never stops; swipe to turn. Leaving your land draws a trail, coming back
// claims everything the loop encloses. Touch anyone's trail to kill them; if anyone touches yours, you're out.
(function () {
  'use strict';
  const U = MG.util;
  const FONT = '-apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
  const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];   // 0 right, 1 down, 2 left, 3 up
  const COLS = ['#3de0e0', '#ff5d6c', '#ffcc4d', '#b26bff', '#4cd986', '#ff8f3d', '#ff7ac8', '#4c9bff', '#8a5a3c'];
  const NAMES = ['你', '紅莓', '檸檬', '葡萄', '薄荷', '橘子', '桃桃', '藍莓', '可可'];

  // ---------- drawing (卡通 Q 版: thick outlines, chibi heads, meadow island in a cartoon sea) ----------
  const OL = '#2a1a14';
  let grassPat = null, grassCs = 0, grassCtx = null;
  function grassPattern(g, cs) {
    if (grassPat && grassCs === cs && grassCtx === g) return grassPat;
    const c = document.createElement('canvas');
    const n = Math.max(2, Math.round(cs * 2));
    c.width = n; c.height = n;
    const x = c.getContext('2d');
    x.fillStyle = '#b8e88a'; x.fillRect(0, 0, n, n);
    x.fillStyle = '#a8de78'; x.fillRect(0, 0, n / 2, n / 2); x.fillRect(n / 2, n / 2, n / 2, n / 2);
    x.strokeStyle = 'rgba(60,120,40,0.35)'; x.lineWidth = 1.2;
    x.beginPath(); x.moveTo(n * 0.7, n * 0.3); x.lineTo(n * 0.68, n * 0.2); x.moveTo(n * 0.74, n * 0.3); x.lineTo(n * 0.77, n * 0.21); x.stroke();
    grassPat = g.createPattern(c, 'repeat'); grassCs = cs; grassCtx = g;
    return grassPat;
  }
  function drawBackground(g, W, H, ox, oy, cs, GW, GH, t) {
    // cartoon sea with drifting wave marks
    g.fillStyle = '#5cc8f0'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 3; g.lineCap = 'round';
    const sp = 70, offx = ((ox * 0.5 + t * 8) % sp + sp) % sp, offy = ((oy * 0.5) % sp + sp) % sp;
    g.beginPath();
    for (let y = -sp + offy; y < H + sp; y += sp) for (let x = -sp + offx + ((Math.round((y - offy) / sp) & 1) ? sp / 2 : 0); x < W + sp; x += sp) {
      g.moveTo(x - 10, y); g.quadraticCurveTo(x - 5, y - 5, x, y); g.quadraticCurveTo(x + 5, y - 5, x + 10, y);
    }
    g.stroke();
    const bx = ox, by = oy, bw = GW * cs, bh = GH * cs;
    // sandy beach rim + shadow, then the meadow board
    g.fillStyle = 'rgba(20,60,90,0.3)'; U.rr(g, bx - 10, by - 4, bw + 20, bh + 22, 16); g.fill();
    U.rr(g, bx - 12, by - 12, bw + 24, bh + 24, 16); g.fillStyle = '#ffe2a0'; g.fill(); g.lineWidth = 4; g.strokeStyle = OL; g.stroke();
    g.save(); g.translate(ox, oy); g.fillStyle = grassPattern(g, cs); g.fillRect(0, 0, bw, bh); g.restore();
    g.lineWidth = 3; g.strokeStyle = OL; g.strokeRect(bx, by, bw, bh);
  }
  // chibi player: big round head with coloured hood, tiny body, eyes look where it is heading
  function drawHead(g, e, x, y, cs, t) {
    const s = cs * 1.55;
    const sq = 1 + Math.sin(t * 14 + e.id) * 0.04;
    const lw = Math.max(1.8, s * 0.1);
    g.lineWidth = lw; g.strokeStyle = OL; g.lineJoin = 'round';
    g.fillStyle = 'rgba(42,26,20,0.3)'; g.beginPath(); g.ellipse(x + 1, y + s * 0.5, s * 0.5, s * 0.17, 0, 0, 6.283); g.fill();
    // body + feet
    const step = Math.sin(t * 16 + e.id) * s * 0.06;
    g.fillStyle = U.shade(e.col, -0.35);
    g.beginPath(); g.ellipse(x - s * 0.15, y + s * 0.42 + step, s * 0.12, s * 0.09, 0, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(x + s * 0.15, y + s * 0.42 - step, s * 0.12, s * 0.09, 0, 0, 6.283); g.fill(); g.stroke();
    U.rr(g, x - s * 0.26, y + s * 0.05, s * 0.52, s * 0.36, s * 0.14); g.fillStyle = e.col; g.fill(); g.stroke();
    // head (hood in player colour, face in skin)
    const hx = x, hy = y - s * 0.12;
    g.beginPath(); g.ellipse(hx, hy, s * 0.5 * sq, s * 0.46 / sq, 0, 0, 6.283); g.fillStyle = e.col; g.fill(); g.stroke();
    g.beginPath(); g.ellipse(hx, hy + s * 0.06, s * 0.36, s * 0.3, 0, 0, 6.283); g.fillStyle = '#ffe0bd'; g.fill(); g.lineWidth = lw * 0.7; g.stroke();
    // little ears on the hood
    g.lineWidth = lw;
    for (let sd = -1; sd <= 1; sd += 2) { g.beginPath(); g.ellipse(hx + sd * s * 0.32, hy - s * 0.4, s * 0.12, s * 0.14, sd * 0.4, 0, 6.283); g.fillStyle = e.col; g.fill(); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(hx - s * 0.22, hy - s * 0.3, s * 0.1, s * 0.05, -0.5, 0, 6.283); g.fill();
    const ex = DX[e.dir] * s * 0.07, ey = DY[e.dir] * s * 0.05;
    g.fillStyle = OL;
    g.beginPath(); g.ellipse(hx - s * 0.13 + ex, hy + s * 0.04 + ey, s * 0.06, s * 0.08, 0, 0, 6.283); g.ellipse(hx + s * 0.13 + ex, hy + s * 0.04 + ey, s * 0.06, s * 0.08, 0, 0, 6.283); g.fill();
    g.fillStyle = '#fff';
    g.beginPath(); g.arc(hx - s * 0.11 + ex, hy + s * 0.01 + ey, s * 0.025, 0, 6.283); g.arc(hx + s * 0.15 + ex, hy + s * 0.01 + ey, s * 0.025, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(255,100,120,0.5)';
    g.beginPath(); g.ellipse(hx - s * 0.24, hy + s * 0.16, s * 0.06, s * 0.035, 0, 0, 6.283); g.ellipse(hx + s * 0.24, hy + s * 0.16, s * 0.06, s * 0.035, 0, 0, 6.283); g.fill();
  }
  function olText(g, str, x, y, size, col, lw, align) {
    g.font = '900 ' + size + 'px ' + FONT; g.textAlign = align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = lw || Math.max(3, size * 0.22); g.strokeStyle = OL; g.strokeText(str, x, y);
    g.fillStyle = col; g.fillText(str, x, y);
  }

  function params(L, diff, endless) {
    if (endless) return { GW: 44, GH: 54, ais: 4, aspd: 0.9, smart: 2, time: 0, target: 1, pspd: 6.6, lives: 1 };
    const lv = L - 1;
    return [
      { GW: 34, GH: 42, ais: 2 + (L >= 10 ? 1 : 0), aspd: 0.8, smart: 0, time: 240, target: Math.min(0.28, 0.14 + lv * 0.005), pspd: 6.2, lives: 3 },
      { GW: 40, GH: 50, ais: 4 + (L >= 15 ? 1 : 0), aspd: 0.9, smart: 1, time: 200, target: Math.min(0.25, 0.15 + lv * 0.003), pspd: 6.6, lives: 2 },
      { GW: 44, GH: 54, ais: 5 + (L >= 10 ? 1 : 0) + (L >= 25 ? 1 : 0), aspd: 0.92, smart: 2, time: 180, target: Math.min(0.22, 0.13 + lv * 0.0025), pspd: 7, lives: 2 },
    ][diff];
  }

  MG.register({
    id: 'paper', name: '圈地大作戰', icon: '🟦', color: '#3de0e0', endless: true,
    create(api) {
      const L = api.level, DIFF = api.diff || 0, ENDLESS = !!api.endless, rng = api.rng;
      const P = params(L, DIFF, ENDLESS);
      const GW = P.GW, GH = P.GH, N = GW * GH;
      const owner = new Int8Array(N), trail = new Int8Array(N);
      const seen = new Uint8Array(N), queue = new Int32Array(N), prev = new Int32Array(N), dist = new Int32Array(N);
      const counts = new Int32Array(12);
      let W = api.W, H = api.H, cs = 20;
      function layout() { W = api.W; H = api.H; cs = Math.max(12, Math.min(28, Math.min(W, H * 0.62) / 19)); }
      layout();

      const S = { T: 0, ents: [], me: null, over: false, kills: 0, maxPct: 0, timeLeft: P.time, joinT: 30, score: 0, lives: P.lives };
      let anim = 0, shake = 0, lastInfo = '', hintT = 5, swipe = null, cam = { x: 0, y: 0 }, flash = 0;
      const banners = [];
      function banner(text, col, size) { banners.push({ text, col, size: size || 34, t: 0 }); if (banners.length > 3) banners.shift(); }
      const parts = []; for (let i = 0; i < 260; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 3 });
      let pCur = 0;
      const texts = []; for (let i = 0; i < 30; i++) texts.push({ on: false, x: 0, y: 0, t: 0, s: '', col: '#fff', size: 14, max: 0.8 });
      let tCur = 0;
      const fades = [];
      function addPart(x, y, vx, vy, life, col, size) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size;
      }
      function addText(x, y, s, col, size, max) {
        const t = texts[tCur]; tCur = (tCur + 1) % texts.length;
        t.on = true; t.x = x; t.y = y; t.s = s; t.col = col; t.size = size; t.t = 0; t.max = max || 0.9;
      }

      // ---------- entities ----------
      function spawnAt(e, cx, cy) {
        e.x = cx; e.y = cy; e.prog = 0; e.alive = true; e.trail = []; e.out = 0; e.phase = 0; e.want = -1; e.pop = 1;
        for (let y = cy - 2; y <= cy + 2; y++) for (let x = cx - 2; x <= cx + 2; x++) {
          const i = y * GW + x;
          if (Math.abs(x - cx) + Math.abs(y - cy) <= 3) owner[i] = e.id;
        }
        e.dir = Math.floor(rng() * 4);
        recount();
      }
      function freeSpot() {
        for (let k = 0; k < 40; k++) {
          const cx = 4 + Math.floor(rng() * (GW - 8)), cy = 4 + Math.floor(rng() * (GH - 8));
          let ok = true;
          for (let y = cy - 3; y <= cy + 3 && ok; y++) for (let x = cx - 3; x <= cx + 3; x++) { const i = y * GW + x; if (owner[i] || trail[i]) { ok = false; break; } }
          if (!ok) continue;
          let near = 1e9;
          for (let j = 0; j < S.ents.length; j++) { const o = S.ents[j]; if (!o.alive) continue; near = Math.min(near, Math.abs(cx - o.x) + Math.abs(cy - o.y) + (o.me ? -6 : 0)); }
          if (near >= (k < 30 ? 12 : 7)) return [cx, cy];
        }
        return null;
      }
      function newEnt(id, isMe) {
        return { id, col: COLS[(id - 1) % COLS.length], name: NAMES[(id - 1) % NAMES.length], me: !!isMe, x: 0, y: 0, dir: 0, prog: 0, spd: 1, alive: false,
          trail: [], out: 0, phase: 0, want: -1, kills: 0, near: 99, shield: 0, respawn: 0, pop: 0, budget: 10, l1: 4, l2: 3, side: 1, d0: 0, arrived: false };
      }
      S.me = newEnt(1, true); S.me.spd = P.pspd;
      S.ents.push(S.me);
      spawnAt(S.me, Math.floor(GW / 2), Math.floor(GH / 2));
      S.me.dir = 3;
      for (let i = 0; i < P.ais; i++) addAi();
      function addAi() {
        const id = S.ents.length + 1;
        if (id > 9) return;
        const e = newEnt(id, false);
        e.spd = P.pspd * P.aspd * (0.94 + 0.08 * rng());
        const sp = freeSpot();
        S.ents.push(e);
        if (sp) spawnAt(e, sp[0], sp[1]); else { e.alive = false; e.respawn = 2; }
      }
      cam.x = S.me.x; cam.y = S.me.y;

      function recount() {
        counts.fill(0);
        for (let i = 0; i < N; i++) if (owner[i] > 0) counts[owner[i]]++;
      }

      // fill everything enclosed by e's land
      function claim(e) {
        const id = e.id;
        let gained = 0;
        for (let k = 0; k < e.trail.length; k++) { const i = e.trail[k]; if (trail[i] === id) trail[i] = 0; if (owner[i] !== id) { owner[i] = id; gained++; } }
        e.trail.length = 0;
        seen.fill(0);
        let qh = 0, qt = 0;
        for (let x = 0; x < GW; x++) {
          const a = x, b = (GH - 1) * GW + x;
          if (owner[a] !== id && !seen[a]) { seen[a] = 1; queue[qt++] = a; }
          if (owner[b] !== id && !seen[b]) { seen[b] = 1; queue[qt++] = b; }
        }
        for (let y = 0; y < GH; y++) {
          const a = y * GW, b = y * GW + GW - 1;
          if (owner[a] !== id && !seen[a]) { seen[a] = 1; queue[qt++] = a; }
          if (owner[b] !== id && !seen[b]) { seen[b] = 1; queue[qt++] = b; }
        }
        while (qh < qt) {
          const i = queue[qh++], x = i % GW, y = (i - x) / GW;
          for (let d = 0; d < 4; d++) {
            const nx = x + DX[d], ny = y + DY[d];
            if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
            const j = ny * GW + nx;
            if (seen[j] || owner[j] === id) continue;
            seen[j] = 1; queue[qt++] = j;
          }
        }
        let sx = 0, sy = 0, sn = 0;
        for (let i = 0; i < N; i++) {
          if (!seen[i] && owner[i] !== id) {
            owner[i] = id; gained++;
            if (e.me && (sn++ % 7) === 0 && sn < 280) { const x = i % GW, y = (i - x) / GW; sx += x; sy += y; addPart(x + 0.5, y + 0.5, (Math.random() - 0.5) * 5, -Math.random() * 6, 0.6 + Math.random() * 0.4, Math.random() < 0.5 ? e.col : '#ffffff', 0.35); }
          }
        }
        recount();
        for (let k = 0; k < S.ents.length; k++) {
          const o = S.ents[k];
          if (o !== e && o.alive && counts[o.id] === 0) kill(o, e, '地盤被吃光');
        }
        if (e.me && gained > 0) {
          const pct = gained / N * 100;
          addText(e.x + 0.5, e.y - 1, '+' + pct.toFixed(1) + '%', '#ffffff', pct > 3 ? 24 : 18, 1.1);
          api.sfx(pct > 3 ? 'win' : 'good');
          if (pct > 3) shake = Math.max(shake, 6);
          e.pop = 1;
        }
        return gained;
      }

      function loseLife(v) {
        S.lives--;
        const cells = [];
        for (let k = 0; k < v.trail.length; k++) { const i = v.trail[k]; if (trail[i] === v.id) { trail[i] = 0; cells.push(i); } }
        v.trail.length = 0;
        fades.push({ cells, col: v.col, t: 0 });
        const hx = v.x + 0.5, hy = v.y + 0.5;
        for (let k = 0; k < 20; k++) { const a = Math.random() * 6.283, sp = 2 + Math.random() * 5; addPart(hx, hy, Math.cos(a) * sp, Math.sin(a) * sp, 0.6, k % 2 ? v.col : '#ff5d6c', 0.4); }
        let bi = -1, bd = 1e9;
        for (let i = 0; i < N; i++) if (owner[i] === v.id) { const x = i % GW, y = (i - x) / GW, d = Math.abs(x - v.x) + Math.abs(y - v.y); if (d < bd) { bd = d; bi = i; } }
        if (bi >= 0) { v.x = bi % GW; v.y = (bi - v.x) / GW; v.prog = 0; v.out = 0; v.phase = 0; v.want = -1; }
        else { const sp = freeSpot() || [Math.floor(GW / 2), Math.floor(GH / 2)]; spawnAt(v, sp[0], sp[1]); }
        v.shield = 2.5; v.pop = 1;
        shake = 10; flash = 0.35; api.sfx('bad');
        banner(S.lives > 1 ? '剩下 ' + S.lives + ' 條命' : '最後一條命！', '#ff8a95', 34);
      }
      function kill(v, killer, why) {
        if (!v.alive) return;
        if (v.me && killer && v.shield > 0) return;
        if (v.me && S.lives > 1) { loseLife(v); return; }
        v.alive = false; v.respawn = 3.5;
        const cells = [];
        for (let i = 0; i < N; i++) if (owner[i] === v.id) { owner[i] = 0; cells.push(i); }
        for (let k = 0; k < v.trail.length; k++) { const i = v.trail[k]; if (trail[i] === v.id) { trail[i] = 0; cells.push(i); } }
        v.trail.length = 0;
        fades.push({ cells, col: v.col, t: 0 });
        recount();
        const hx = v.x + 0.5 + DX[v.dir] * v.prog, hy = v.y + 0.5 + DY[v.dir] * v.prog;
        for (let k = 0; k < 26; k++) { const a = Math.random() * 6.283, s = 2 + Math.random() * 6; addPart(hx, hy, Math.cos(a) * s, Math.sin(a) * s, 0.7, k % 2 ? v.col : '#ffffff', 0.4); }
        if (killer && killer !== v) killer.kills++;
        if (v.me) {
          S.over = true; shake = 14; flash = 0.5;
          api.sfx('bad');
          const pct = (S.maxPct * 100).toFixed(1);
          api.lose(ENDLESS ? '最高佔地 ' + pct + '%，擊殺 ' + S.kills : (why || '被切斷了！'));
          return;
        }
        if (killer && killer.me) {
          S.kills++; updScore();
          banner('擊殺 ' + v.name + '！', '#7dffa8', 34); api.sfx('good'); shake = Math.max(shake, 7);
        } else if (Math.abs(v.x - S.me.x) + Math.abs(v.y - S.me.y) < 16) api.sfx('pop');
      }
      function updScore() { S.score = Math.floor(S.maxPct * 1000) + S.kills * 100; api.score(S.score); }

      // ---------- AI ----------
      function inB(x, y) { return x >= 0 && y >= 0 && x < GW && y < GH; }
      // BFS from e's cell avoiding e's own trail; goal(i) -> first-step dir, sets lastDist
      let lastDist = 0, lastGoal = -1;
      let danger = null;
      const dangerMap = new Uint8Array(N);
      function bfs(e, goal, maxD) {
        const s = e.y * GW + e.x;
        seen.fill(0);
        let qh = 0, qt = 0;
        queue[qt++] = s; seen[s] = 1; prev[s] = -1; dist[s] = 0;
        const off = Math.floor(rng() * 4);
        while (qh < qt) {
          const i = queue[qh++];
          if (i !== s && goal(i)) {
            lastDist = dist[i]; lastGoal = i;
            let c = i; while (prev[c] !== s) c = prev[c];
            const cx = c % GW, cy = (c - cx) / GW;
            for (let d = 0; d < 4; d++) if (e.x + DX[d] === cx && e.y + DY[d] === cy) return d;
            return -1;
          }
          if (dist[i] >= maxD) continue;
          const x = i % GW, y = (i - x) / GW;
          for (let k = 0; k < 4; k++) {
            const d = (k + off) % 4;
            if (i === s && d === (e.dir + 2) % 4) continue;
            const nx = x + DX[d], ny = y + DY[d];
            if (!inB(nx, ny)) continue;
            const j = ny * GW + nx;
            if (seen[j] || trail[j] === e.id || (danger && danger[j])) continue;
            seen[j] = 1; prev[j] = i; dist[j] = dist[i] + 1; queue[qt++] = j;
          }
        }
        lastDist = 1e9; lastGoal = -1;
        return -1;
      }
      function safeDirs(e) {
        const out = [];
        for (let d = 0; d < 4; d++) {
          if (d === (e.dir + 2) % 4) continue;
          const nx = e.x + DX[d], ny = e.y + DY[d];
          if (!inB(nx, ny) || trail[ny * GW + nx] === e.id) continue;
          out.push(d);
        }
        return out;
      }
      function threatDist(e) {
        let best = 1e9;
        for (let k = 0; k < S.ents.length; k++) {
          const o = S.ents[k]; if (o === e || !o.alive) continue;
          let d = Math.abs(o.x - e.x) + Math.abs(o.y - e.y);
          for (let t = 0; t < e.trail.length; t++) { const i = e.trail[t], x = i % GW, y = (i - x) / GW; const dd = Math.abs(o.x - x) + Math.abs(o.y - y); if (dd < d) d = dd; }
          if (d < best) best = d;
        }
        return best;
      }
      // decide e's next direction (AIs and the check bot); smart: 0 naive, 1 careful, 2 careful + hunts, 3 bot
      function decide(e, smart) {
        const id = e.id, here = e.y * GW + e.x;
        const opts = safeDirs(e);
        if (!opts.length) return e.dir;
        // hunt: an enemy trail cell close by
        if (smart >= 2) {
          const d = bfs(e, (i) => trail[i] > 0 && trail[i] !== id, smart >= 3 ? 7 : 4);
          if (d >= 0) {
            const victim = trail[lastGoal];
            let vHome = 1e9, vHead = 0;
            for (let k = 0; k < S.ents.length; k++) { const o = S.ents[k]; if (o.id === victim) { vHome = o.trail.length > 0 ? Math.min(o.trail.length, 8) : 0; vHead = Math.abs(o.x - e.x) + Math.abs(o.y - e.y); } }
            if (smart >= 3) { if (lastDist <= 1 || (e.trail.length === 0 && lastDist <= 5 && vHead > lastDist + 3)) return d; }
            else if (e.trail.length < 6 || lastDist <= 3 || vHome > lastDist) return d;
          }
        }
        if (owner[here] === id) {
          e.out = 0; e.phase = 0;
          // an enemy lurking right outside: patrol inside your land until it leaves
          if (smart >= 2) {
            let nx = 0, ny = 0, near = 1e9;
            for (let k = 0; k < S.ents.length; k++) {
              const o = S.ents[k]; if (o === e || !o.alive) continue;
              const d = Math.abs(o.x - e.x) + Math.abs(o.y - e.y);
              if (d < near) { near = d; nx = o.x; ny = o.y; }
            }
            e.near = near;
            if (near <= (smart >= 3 ? 6 : 5)) {
              let best = -1, bs = -1e9;
              for (let k = 0; k < opts.length; k++) {
                const d = opts[k], cx = e.x + DX[d], cy = e.y + DY[d];
                let ownN = 0;
                for (let q = 0; q < 4; q++) { const ax = cx + DX[q], ay = cy + DY[q]; if (inB(ax, ay) && owner[ay * GW + ax] === id) ownN++; }
                const sc = (owner[cy * GW + cx] === id ? 100 : 0) + (Math.abs(cx - nx) + Math.abs(cy - ny)) * 3 + ownN;
                if (sc > bs) { bs = sc; best = d; }
              }
              if (bs >= 100 || smart >= 3) return best;
            }
          }
          // inside: head for the nearest unclaimed edge, then start a loop
          let d = smart < 3 ? bfs(e, (i) => owner[i] === 0, 14) : -1;
          if (d < 0) d = bfs(e, (i) => owner[i] !== id, 60);
          if (d >= 0) {
            const big = counts[id] / N;
            e.budget = Math.round((smart >= 3 ? 8 : 7) + rng() * (smart >= 3 ? 10 : 12) + big * 30);
            if (smart === 0) e.budget += 4;
            if (smart >= 3) e.budget = Math.max(5, Math.min(e.budget, Math.floor(e.near * 1.4)));
            e.l1 = Math.max(2, Math.round(e.budget * (0.35 + rng() * 0.15)));
            e.l2 = Math.max(2, Math.round(e.budget * (0.3 + rng() * 0.2)));
            e.side = rng() < 0.5 ? 1 : 3;
            e.d0 = d;
            return d;
          }
          return opts[0];
        }
        // outside own land
        e.out++;
        let toHome = -1;
        if (smart >= 3) {
          // prefer a way home that keeps away from enemy heads
          dangerMap.fill(0);
          for (let k = 0; k < S.ents.length; k++) {
            const o = S.ents[k]; if (o === e || !o.alive) continue;
            for (let yy = o.y - 2; yy <= o.y + 2; yy++) for (let xx = o.x - 2; xx <= o.x + 2; xx++) if (inB(xx, yy) && Math.abs(xx - o.x) + Math.abs(yy - o.y) <= 2) dangerMap[yy * GW + xx] = 1;
          }
          danger = dangerMap; toHome = bfs(e, (i) => owner[i] === id, 200); danger = null;
        }
        if (toHome < 0) toHome = bfs(e, (i) => owner[i] === id, 200);
        const homeD = lastDist;
        let goHome = e.phase >= 2 || e.out >= e.budget;
        if (smart >= 1) {
          const th = threatDist(e);
          const margin = smart >= 3 ? 4 : smart >= 2 ? 2 : 1;
          if (th <= homeD + margin) goHome = true;
        }
        if (goHome && toHome >= 0) { e.phase = 2; return toHome; }
        let want;
        if (e.phase === 0) {
          want = e.d0;
          if (e.out >= e.l1) {
            e.phase = 1;
            if (smart >= 3) {
              // turn away from the nearest enemy
              let nx = 0, ny = 0, nd = 1e9;
              for (let k = 0; k < S.ents.length; k++) { const o = S.ents[k]; if (o === e || !o.alive) continue; const dd = Math.abs(o.x - e.x) + Math.abs(o.y - e.y); if (dd < nd) { nd = dd; nx = o.x; ny = o.y; } }
              const a = (e.d0 + 1) % 4, b2 = (e.d0 + 3) % 4;
              const da = Math.abs(e.x + DX[a] * 3 - nx) + Math.abs(e.y + DY[a] * 3 - ny), db = Math.abs(e.x + DX[b2] * 3 - nx) + Math.abs(e.y + DY[b2] * 3 - ny);
              e.side = da >= db ? 1 : 3;
            }
            want = (e.d0 + e.side) % 4;
          }
        }
        else { want = (e.d0 + e.side) % 4; if (e.out >= e.l1 + e.l2) { e.phase = 2; return toHome >= 0 ? toHome : opts[0]; } }
        if (opts.indexOf(want) >= 0) return want;
        // blocked (wall / own trail): turn the other way round
        e.side = e.side === 1 ? 3 : 1;
        const alt = (e.dir + e.side) % 4;
        if (opts.indexOf(alt) >= 0) return alt;
        return toHome >= 0 ? toHome : opts[0];
      }

      // ---------- movement ----------
      function arrive(e) {
        const i = e.y * GW + e.x;
        // run into someone's trail
        const t = trail[i];
        if (t > 0) {
          if (t === e.id) { kill(e, null, '撞到自己的線了！'); return; }
          const v = S.ents[t - 1];
          if (v && v.alive) kill(v, e);
        }
        if (!e.alive) return;
        // head-on: two heads in the same cell
        for (let k = 0; k < S.ents.length; k++) {
          const o = S.ents[k]; if (o === e || !o.alive || o.x !== e.x || o.y !== e.y) continue;
          const eHome = owner[i] === e.id, oHome = owner[i] === o.id;
          if (eHome && !oHome) kill(o, e);
          else if (oHome && !eHome) { kill(e, o, '正面相撞！'); return; }
          else if (o.trail.length >= e.trail.length) kill(o, e);
          else { kill(e, o, '正面相撞！'); return; }
        }
        if (owner[i] === e.id) { if (e.trail.length) claim(e); }
        else { trail[i] = e.id; e.trail.push(i); }
      }
      function turnFor(e) {
        let d = e.dir;
        if (e.me) { if (e.want >= 0 && e.want !== (e.dir + 2) % 4) d = e.want; e.want = -1; }
        else d = decide(e, P.smart);
        let nx = e.x + DX[d], ny = e.y + DY[d];
        if (!inB(nx, ny)) {
          // slide along the wall: prefer the turn that doesn't hit your own trail
          const r = (d + 1) % 4, l = (d + 3) % 4;
          const okR = inB(e.x + DX[r], e.y + DY[r]), okL = inB(e.x + DX[l], e.y + DY[l]);
          const tR = okR && trail[(e.y + DY[r]) * GW + e.x + DX[r]] !== e.id;
          const tL = okL && trail[(e.y + DY[l]) * GW + e.x + DX[l]] !== e.id;
          d = tR ? r : tL ? l : okR ? r : l;
        }
        e.dir = d;
      }
      function step(e, dt) {
        e.prog += e.spd * dt;
        e.arrived = false;
        let guard = 0;
        while (e.prog >= 1 && e.alive && guard++ < 3) {
          e.prog -= 1;
          e.x += DX[e.dir]; e.y += DY[e.dir];
          arrive(e);
          if (!e.alive) return;
          turnFor(e);
          e.arrived = true;
        }
      }

      function update(dt) {
        anim += dt;
        updFx(dt);
        const me = S.me;
        const hx = me.x + 0.5 + DX[me.dir] * me.prog, hy = me.y + 0.5 + DY[me.dir] * me.prog;
        cam.x += (hx - cam.x) * Math.min(1, dt * 10); cam.y += (hy - cam.y) * Math.min(1, dt * 10);
        if (api.ended || S.over) return;
        S.T += dt; hintT -= dt;
        if (!ENDLESS) S.timeLeft -= dt;
        for (let k = 0; k < S.ents.length; k++) {
          const e = S.ents[k];
          if (e.pop > 0) e.pop = Math.max(0, e.pop - dt * 3);
          if (e.shield > 0) e.shield -= dt;
          if (!e.alive) {
            if (e.me) continue;
            e.respawn -= dt;
            if (e.respawn <= 0) { const sp = freeSpot(); if (sp) spawnAt(e, sp[0], sp[1]); else e.respawn = 1; }
            continue;
          }
          step(e, dt);
          if (S.over) return;
        }
        if (ENDLESS) {
          S.joinT -= dt;
          if (S.joinT <= 0) { S.joinT = 30; if (S.ents.length < 9) { addAi(); banner('新對手加入！', '#ffcc4d', 30); } for (let k = 1; k < S.ents.length; k++) S.ents[k].spd = Math.min(P.pspd * 1.05, S.ents[k].spd * 1.03); }
        }
        const pct = counts[1] / N;
        if (pct > S.maxPct) { S.maxPct = pct; updScore(); }
        if (!ENDLESS && pct >= P.target) {
          S.over = true;
          for (let i = 0; i < 70; i++) addPart(cam.x + (Math.random() - 0.5) * 16, cam.y - 10, (Math.random() - 0.5) * 10, Math.random() * 8, 2, U.PALETTE[i % 8], 0.45);
          banner('領土達標！', '#7dffa8', 42);
          api.win('佔領了 ' + (pct * 100).toFixed(1) + '% 的地圖！');
          return;
        }
        if (!ENDLESS && S.timeLeft <= 0) {
          S.timeLeft = 0; S.over = true;
          banner('時間到！', '#ff5d6c', 40);
          api.lose('時間到！佔地 ' + (pct * 100).toFixed(1) + '%（目標 ' + Math.round(P.target * 100) + '%）');
          return;
        }
        let info;
        if (L === 1 && DIFF === 0 && S.T < 14 && !ENDLESS) info = '滑動轉彎：出去畫線，回到自己的地就能圈地！';
        else if (ENDLESS) info = '無盡模式 · 擊殺 ' + S.kills + ' · 每 30 秒加入新對手';
        else info = '佔領 ' + Math.round(P.target * 100) + '% 的地圖 · 別讓人碰到你的線';
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
      }
      function updFx(dt) {
        if (shake > 0) shake = Math.max(0, shake - dt * 30);
        if (flash > 0) flash -= dt;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
          p.vy += 14 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        }
        for (let i = 0; i < texts.length; i++) { const t = texts[i]; if (!t.on) continue; t.t += dt; t.y -= 1.6 * dt; if (t.t >= t.max) t.on = false; }
        for (let i = fades.length - 1; i >= 0; i--) { fades[i].t += dt; if (fades[i].t > 0.7) fades.splice(i, 1); }
        for (let i = banners.length - 1; i >= 0; i--) { banners[i].t += dt; if (banners[i].t > 1.5) banners.splice(i, 1); }
      }

      // ---------- draw ----------
      function draw(g) {
        const sx = (Math.random() - 0.5) * shake, sy = (Math.random() - 0.5) * shake;
        const viewTop = 54;
        // camera: follow the player but keep the island filling the view (≤ 40px of sea);
        // centre the board on an axis where it is smaller than the view
        const SEA = 40, bwPx = GW * cs, bhPx = GH * cs, vh = H - viewTop;
        let cx0 = W / 2 - cam.x * cs, cy0 = viewTop + vh * 0.5 - cam.y * cs;
        if (bwPx + SEA * 2 <= W) cx0 = (W - bwPx) / 2; else cx0 = U.clamp(cx0, W - bwPx - SEA, SEA);
        if (bhPx + SEA * 2 <= vh) cy0 = viewTop + (vh - bhPx) / 2; else cy0 = U.clamp(cy0, viewTop + vh - bhPx - SEA, viewTop + SEA);
        const ox = Math.round(cx0 + sx), oy = Math.round(cy0 + sy);
        drawBackground(g, W, H, ox, oy, cs, GW, GH, anim);
        const c0 = Math.max(0, Math.floor(-ox / cs) - 1), c1 = Math.min(GW - 1, Math.ceil((W - ox) / cs) + 1);
        const r0 = Math.max(0, Math.floor(-oy / cs) - 1), r1 = Math.min(GH - 1, Math.ceil((H - oy) / cs) + 1);
        const ext = Math.max(3, cs * 0.22);
        // territory: run-length rows, with a darker "side" under each owned run that has a different cell below
        for (let r = r0; r <= r1; r++) {
          let c = c0;
          while (c <= c1) {
            const o = owner[r * GW + c];
            let e = c; while (e + 1 <= c1 && owner[r * GW + e + 1] === o) e++;
            if (o > 0) {
              const col = COLS[(o - 1) % COLS.length];
              g.fillStyle = col; g.fillRect(ox + c * cs, oy + r * cs, (e - c + 1) * cs + 0.5, cs + 0.5);
              g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(ox + c * cs, oy + r * cs, (e - c + 1) * cs + 0.5, cs * 0.18);
            }
            c = e + 1;
          }
          for (let c2 = c0; c2 <= c1; c2++) {
            const o = owner[r * GW + c2]; if (!o) continue;
            const below = r + 1 < GH ? owner[(r + 1) * GW + c2] : 0;
            if (below !== o) { g.fillStyle = U.shade(COLS[(o - 1) % COLS.length], -0.35); g.fillRect(ox + c2 * cs, oy + (r + 1) * cs, cs + 0.5, ext); }
          }
        }
        // thick cartoon outline around every territory
        g.beginPath();
        for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
          const o = owner[r * GW + c]; if (!o) continue;
          const x = ox + c * cs, y = oy + r * cs;
          if (r === 0 || owner[(r - 1) * GW + c] !== o) { g.moveTo(x, y); g.lineTo(x + cs, y); }
          if (r === GH - 1 || owner[(r + 1) * GW + c] !== o) { const yb = y + cs + (r === GH - 1 || owner[(r + 1) * GW + c] === 0 ? ext : 0); g.moveTo(x, yb); g.lineTo(x + cs, yb); }
          if (c === 0 || owner[r * GW + c - 1] !== o) { g.moveTo(x, y); g.lineTo(x, y + cs); }
          if (c === GW - 1 || owner[r * GW + c + 1] !== o) { g.moveTo(x + cs, y); g.lineTo(x + cs, y + cs); }
        }
        g.strokeStyle = OL; g.lineWidth = Math.max(2, cs * 0.12); g.lineCap = 'round'; g.stroke();
        for (let k = 0; k < fades.length; k++) {
          const f = fades[k];
          g.globalAlpha = Math.max(0, 1 - f.t / 0.7) * 0.8; g.fillStyle = f.col;
          for (let j = 0; j < f.cells.length; j++) {
            const i = f.cells[j], x = i % GW, y = (i - x) / GW;
            if (x < c0 || x > c1 || y < r0 || y > r1) continue;
            const s = cs * (1 - f.t * 0.6);
            g.fillRect(ox + x * cs + (cs - s) / 2, oy + y * cs + (cs - s) / 2, s, s);
          }
        }
        g.globalAlpha = 1;
        // trails
        for (let k = 0; k < S.ents.length; k++) {
          const e = S.ents[k]; if (!e.alive || !e.trail.length) continue;
          // the trail is a contiguous path of cells: draw it as one outlined ribbon up to the head
          g.beginPath();
          for (let j = 0; j < e.trail.length; j++) {
            const i = e.trail[j], x = i % GW, y = (i - x) / GW;
            if (j === 0) g.moveTo(ox + (x + 0.5) * cs, oy + (y + 0.5) * cs); else g.lineTo(ox + (x + 0.5) * cs, oy + (y + 0.5) * cs);
          }
          g.lineTo(ox + (e.x + 0.5 + DX[e.dir] * e.prog) * cs, oy + (e.y + 0.5 + DY[e.dir] * e.prog) * cs);
          g.lineCap = 'round'; g.lineJoin = 'round';
          g.strokeStyle = OL; g.lineWidth = cs * 0.62 + 4; g.stroke();
          g.strokeStyle = U.shade(e.col, 0.3); g.lineWidth = cs * 0.62; g.stroke();
          g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = Math.max(1.5, cs * 0.12); g.setLineDash([cs * 0.3, cs * 0.5]); g.stroke(); g.setLineDash([]);
        }
        // heads
        for (let k = S.ents.length - 1; k >= 0; k--) {
          const e = S.ents[k]; if (!e.alive) continue;
          const x = ox + (e.x + 0.5 + DX[e.dir] * e.prog) * cs, y = oy + (e.y + 0.5 + DY[e.dir] * e.prog) * cs;
          if (x < -cs * 2 || x > W + cs * 2 || y < -cs * 2 || y > H + cs * 2) continue;
          const sc = 1 + e.pop * 0.25;
          if (e.shield > 0) {
            g.strokeStyle = 'rgba(255,255,255,' + (0.5 + 0.4 * Math.sin(anim * 12)) + ')'; g.lineWidth = 3;
            g.beginPath(); g.arc(x, y, cs * 0.95, 0, 6.283); g.stroke();
          }
          g.globalAlpha = e.shield > 0 && Math.sin(anim * 20) > 0.3 ? 0.55 : 1;
          g.save(); g.translate(x, y); g.scale(sc, sc);
          drawHead(g, e, 0, 0, cs, anim);
          g.restore(); g.globalAlpha = 1;
          olText(g, e.name, x, y - cs * 1.6, Math.max(11, cs * 0.6), e.me ? '#ffffff' : U.shade(e.col, 0.35), 3);
        }
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.5); g.fillStyle = p.col;
          const s = p.size * cs;
          g.fillRect(ox + p.x * cs - s / 2, oy + p.y * cs - s / 2, s, s);
        }
        g.globalAlpha = 1;
        for (let i = 0; i < texts.length; i++) {
          const t = texts[i]; if (!t.on) continue;
          const k = t.t / t.max;
          g.globalAlpha = k > 0.6 ? (1 - k) / 0.4 : 1;
          olText(g, t.s, ox + t.x * cs, oy + t.y * cs, t.size, t.col, 5);
        }
        g.globalAlpha = 1;
        // off-screen enemy arrows
        for (let k = 1; k < S.ents.length; k++) {
          const e = S.ents[k]; if (!e.alive) continue;
          const x = ox + (e.x + 0.5) * cs, y = oy + (e.y + 0.5) * cs;
          if (x > 0 && x < W && y > viewTop && y < H) continue;
          const a = Math.atan2(y - H / 2, x - W / 2);
          const ex = U.clamp(x, 16, W - 16), ey = U.clamp(y, viewTop + 16, H - 16);
          g.save(); g.translate(ex, ey); g.rotate(a);
          g.fillStyle = e.col; g.globalAlpha = e.trail.length ? 1 : 0.6;
          g.beginPath(); g.moveTo(11, 0); g.lineTo(-7, -8); g.lineTo(-7, 8); g.closePath(); g.fill();
          g.lineWidth = 2.5; g.strokeStyle = OL; g.lineJoin = 'round'; g.stroke();
          g.restore(); g.globalAlpha = 1;
        }
        if (flash > 0) { g.fillStyle = 'rgba(255,60,80,' + flash * 0.6 + ')'; g.fillRect(0, 0, W, H); }
        drawHud(g, viewTop);
        for (let i = 0; i < banners.length; i++) {
          const b = banners[i];
          const k = Math.min(1, b.t / 0.35), s = U.easeOutBack(k);
          g.globalAlpha = b.t > 1.2 ? Math.max(0, 1 - (b.t - 1.2) / 0.3) : 1;
          const fs = Math.min(b.size, W / 9) * s;
          olText(g, b.text, W / 2, H * 0.3 + i * 46, fs, b.col, 7);
        }
        g.globalAlpha = 1;
        if (hintT > 0 && !api.ended) {
          g.globalAlpha = Math.min(1, hintT) * (0.6 + 0.4 * Math.sin(anim * 5));
          const k = (anim % 2) / 2;
          U.text(g, '👆', W / 2 - 50 + k * 100, H * 0.78, 30, '#fff');
          olText(g, '上下左右滑動轉彎', W / 2, H * 0.78 + 40, 17, '#ffffff', 4);
          g.globalAlpha = 1;
        }
      }
      function drawHud(g, top) {
        g.fillStyle = '#fff4dc'; g.fillRect(0, 0, W, top);
        g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(0, 0, W, 5);
        g.strokeStyle = OL; g.lineWidth = 3; g.beginPath(); g.moveTo(0, top - 1.5); g.lineTo(W, top - 1.5); g.stroke();
        const pct = counts[1] / N;
        const bw = Math.min(W - 150, 220), bx = 12, by = 9;
        U.rr(g, bx, by, bw, 18, 9); g.fillStyle = '#e8d6b8'; g.fill();
        g.fillStyle = COLS[0]; U.rr(g, bx, by, Math.max(9, bw * Math.min(1, ENDLESS ? pct / 0.5 : pct / P.target)), 18, 9); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.45)'; U.rr(g, bx + 4, by + 3, Math.max(1, bw * Math.min(1, ENDLESS ? pct / 0.5 : pct / P.target) - 8), 4, 2); g.fill();
        U.rr(g, bx, by, bw, 18, 9); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
        olText(g, (pct * 100).toFixed(1) + '%' + (ENDLESS ? '' : ' / ' + Math.round(P.target * 100) + '%'), bx + bw / 2, by + 9.5, 12, '#ffffff', 3);
        if (ENDLESS) U.text(g, '分數 ' + S.score + ' · 最高 ' + Math.max(api.best || 0, S.score) + ' · 擊殺 ' + S.kills, bx, by + 33, 12, '#8a4a10', 'left', 900);
        else {
          const tl = Math.max(0, Math.ceil(S.timeLeft));
          const urgent = S.timeLeft < 15;
          U.text(g, '⏱ ' + Math.floor(tl / 60) + ':' + String(tl % 60).padStart(2, '0') + '　' + '❤️'.repeat(Math.max(0, S.lives)) + '　擊殺 ' + S.kills, bx, by + 33, 12, urgent ? '#e0303f' : '#4a2a14', 'left', 900);
        }
        // mini leaderboard
        const order = S.ents.filter((e) => e.alive).sort((a, b) => counts[b.id] - counts[a.id]).slice(0, 3);
        for (let i = 0; i < order.length; i++) {
          const e = order[i];
          const y = 9 + i * 14, x = W - 118;
          g.fillStyle = e.col; U.rr(g, x, y, 10, 10, 3); g.fill(); g.lineWidth = 1.5; g.strokeStyle = OL; g.stroke();
          U.text(g, (i + 1) + '. ' + e.name, x + 15, y + 5.5, 11, e.me ? '#1f9a50' : '#4a2a14', 'left', 900);
          U.text(g, (counts[e.id] / N * 100).toFixed(1) + '%', W - 10, y + 5.5, 11, '#4a2a14', 'right', 800);
        }
      }

      // ---------- input: swipe to turn ----------
      function setWant(d) {
        const e = S.me;
        if (!e.alive || d === (e.dir + 2) % 4 || d === e.dir) { if (d === e.dir) e.want = -1; return; }
        // early in a cell: turn right away so steering feels instant
        if (e.prog < 0.35 && inB(e.x + DX[d], e.y + DY[d])) { e.dir = d; e.want = -1; }
        else e.want = d;
        api.sfx('tap');
      }
      function down(x, y) { if (api.ended || S.over) return; swipe = { x, y }; hintT = Math.min(hintT, 0.3); }
      function move(x, y) {
        if (!swipe || api.ended) return;
        const dx = x - swipe.x, dy = y - swipe.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) return;
        setWant(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 0 : 2) : (dy > 0 ? 1 : 3));
        swipe.x = x; swipe.y = y;
      }
      function up() { swipe = null; }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _s: S, _k: { P, decide, counts, N, GW, GH, owner, trail, DX, DY },
      };
    },
  });
})();
