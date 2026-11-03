// 人群跑酷 — Count Masters style runner: steer the crowd through gates, dodge traps, beat the army.
(function () {
  'use strict';

  const RW = 3.2;
  const V = 9;
  const VIS = 120;
  const SPC = 0.165;
  const CAMD = 8;
  const CAMH = 6;
  const STEPS = 20;
  const SD = 1.15;
  const SH = 0.42;
  const GOLD = 2.39996323;
  const STEP_COLS = ['#ff5d6c', '#ff8f3d', '#ffcc4d', '#4cd986', '#3de0e0', '#4c9bff', '#5560c8', '#b26bff', '#ff7ac8'];

  function sawX(e, t) { return e.x0 === e.x1 ? e.x0 : (e.x0 + e.x1) / 2 + (e.x1 - e.x0) / 2 * Math.sin(t * 6.283 / e.per + e.ph); }
  function applyOp(op, c) {
    if (op.k === '+') return c + op.v;
    if (op.k === '×') return c * op.v;
    if (op.k === '−') return Math.max(0, c - op.v);
    return Math.floor(c / op.v);
  }
  function opText(op) { return op.k + op.v; }
  function nice(v) { if (v > 50) return Math.round(v / 5) * 5; return Math.round(v); }

  function genTrack(L, rng) {
    const els = [];
    let z = 18, c = 1;
    const nSeg = Math.min(26, 6 + Math.floor(L * 0.33));
    let last = '';
    function mkGate() {
      let a, b;
      const goodAdd = () => ({ k: '+', v: Math.max(3, nice(c * (c > 400 ? 0.15 + rng() * 0.25 : 0.35 + rng() * 0.75) + 2 + rng() * 6)), good: true });
      const goodMul = () => (c < 4 || c > 400) ? goodAdd() : { k: '×', v: (c < 25 && rng() < 0.35) ? 3 : 2, good: true };
      const bad = () => (rng() < 0.55 || c < 6) ? { k: '−', v: Math.max(1, Math.min(c - 1, nice(c * (0.3 + rng() * 0.4)))), good: false } : { k: '÷', v: 2, good: false };
      if (c < 3 || L <= 2 || rng() < 0.55 - Math.min(0.25, L * 0.005)) { a = goodAdd(); b = c >= 4 ? goodMul() : goodAdd(); }
      else { a = rng() < 0.5 ? goodAdd() : goodMul(); b = bad(); }
      if (a.k === '+' && b.k === '+' && a.v === b.v) b.v += 4;
      const ops = rng() < 0.5 ? [a, b] : [b, a];
      return { type: 'gate', z, ops, used: false, side: 0, flash: 0 };
    }
    function mkObst(fs) {
      const kinds = ['spike'];
      if (L >= 2) kinds.push('saw');
      if (L >= 3) kinds.push('gap');
      if (L >= 5) kinds.push('msaw');
      const kind = kinds[Math.floor(rng() * kinds.length)];
      const side = fs || (rng() < 0.5 ? -1 : 1);
      if (kind === 'spike') {
        const r = rng();
        if (r < 0.35 && !fs) return { type: 'spike', z, xa: -1.1, xb: 1.1, d: 0.7 };
        const w = 2.4 + rng() * 0.8;
        return side < 0 ? { type: 'spike', z, xa: -RW, xb: -RW + w, d: 0.7 } : { type: 'spike', z, xa: RW - w, xb: RW, d: 0.7 };
      }
      if (kind === 'gap') {
        const w = 2.8 + rng() * 0.9, len = 3 + rng() * 2;
        if (rng() < 0.3 && !fs) return { type: 'gap', z, z1: z + len, xa: -1.2, xb: 1.2 };
        return side < 0 ? { type: 'gap', z, z1: z + len, xa: -RW - 0.5, xb: -RW + w } : { type: 'gap', z, z1: z + len, xa: RW - w, xb: RW + 0.5 };
      }
      if (kind === 'saw') {
        const x = (rng() < 0.4 && !fs) ? 0 : side * (1.3 + rng() * 0.8);
        return { type: 'saw', z, x0: x, x1: x, sx: x, r: 0.85, per: 1, ph: 0, rot: 0 };
      }
      const lane = fs || (Math.floor(rng() * 3) - 1);
      const xa = lane === 0 ? -1.4 : lane < 0 ? -2.4 : 0.2, xb = lane === 0 ? 1.4 : lane < 0 ? -0.2 : 2.4;
      return { type: 'saw', z, x0: xa, x1: xb, sx: (xa + xb) / 2, r: 0.8, per: 2.4 + rng() * 1.2, ph: rng() * 6.28, rot: 0 };
    }
    for (let i = 0; i < nSeg; i++) {
      let type;
      if (i === 0) type = 'gate';
      else {
        const r = rng();
        type = r < 0.42 ? 'gate' : r < 0.74 ? 'obst' : 'enemy';
        if (type === 'enemy' && (last === 'enemy' || i < 2 || c < 8)) type = 'gate';
        if (type === 'obst' && last === 'obst' && rng() < 0.6) type = 'gate';
        if (type !== 'gate' && c < 10 + L * 3 && rng() < 0.5) type = 'gate';
      }
      if (type === 'gate') {
        const g = mkGate();
        els.push(g);
        c = Math.max(applyOp(g.ops[0], c), applyOp(g.ops[1], c));
      } else if (type === 'obst') {
        els.push(mkObst());
        if (L >= 8 && rng() < 0.3) {
          const o = els[els.length - 1];
          const cen = o.type === 'saw' ? (o.x0 + o.x1) / 2 : (o.xa + o.xb) / 2;
          if (Math.abs(cen) > 0.5) { z += 6; els.push(mkObst(cen < 0 ? -1 : 1)); }
        }
        c = Math.max(1, Math.round(c * 0.92));
      } else {
        const n = Math.max(2, Math.round(c * (0.22 + Math.min(0.2, L * 0.004)) * (0.8 + 0.4 * rng())));
        els.push({ type: 'enemy', z: z + 2, x: (rng() * 2 - 1) * 1.2, n, n0: n, mem: [], fight: false, done: false });
        c -= n;
      }
      last = type;
      z += 15 + rng() * 4;
    }
    const zFin = z + 2;
    const fa = 0.5 + Math.min(0.28, L * 0.005);
    const army = Math.max(3, Math.round(c * fa));
    // make sure the lazy "run straight down the middle" route is not enough to win
    function lazy() {
      let n = 1;
      for (const e of els) {
        if (e.type === 'gate') n = applyOp(e.ops[1], n);
        else if (e.type === 'enemy') n -= e.n0;
        else if (e.type === 'spike' || e.type === 'gap') { if (e.xa < 0.3 && e.xb > -0.3) n = Math.floor(n * 0.35); }
        else if (e.type === 'saw' && e.x0 < 0.5 && e.x1 > -0.5) n = Math.floor(n * 0.6);
        if (n <= 0) return 0;
      }
      return n;
    }
    let guard = 0;
    while (lazy() > army * 0.6 && guard++ < 40) {
      let n = 1, swapped = false;
      for (const e of els) {
        if (e.type !== 'gate') continue;
        if (applyOp(e.ops[1], n) > applyOp(e.ops[0], n)) { e.ops.reverse(); swapped = true; break; }
        n = applyOp(e.ops[1], n);
      }
      if (!swapped) break;
    }
    return { els, zFin, army, best: c };
  }

  MG.register({
    id: 'crowd', name: '人群跑酷', icon: '🏃', color: '#4c9bff',
    create(api) {
      const U = api.util, L = api.level, rng = api.rng;
      const T = genTrack(L, rng);
      let W, H, cx, hy, F, cache = null;
      function layout() {
        W = api.W; H = api.H; cx = W / 2;
        F = Math.min(H * 0.6, W * 1.08);
        hy = H * 0.77 - (CAMH / CAMD) * F;
        cache = null;
      }
      layout();

      const S = {
        t: 0, z: 0, x: 0, tx: 0, y: 0, count: 1, phase: 'run', mem: [], stay: [], enemy: null, fightT: 0,
        armyN: T.army, armyMem: [], step: 0, stepCost: Math.max(1, Math.ceil(T.army / 12)), doneT: 0, camD: CAMD, camY: CAMH, over: false,
      };
      let anim = 0, drag = null, shake = 0, lastInfo = '', countPop = 0, hintT = L === 1 ? 5 : 2;
      const zStair = T.zFin + 11;
      const armyZ = T.zFin + 5;

      const parts = []; for (let i = 0; i < 400; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 3, grav: 0 });
      let pCur = 0;
      const texts = []; for (let i = 0; i < 30; i++) texts.push({ on: false, x: 0, y: 0, t: 0, s: '', col: '#fff', size: 20 });
      let tCur = 0;
      const dl = [];

      function addPart(x, y, vx, vy, life, col, size, grav) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size; p.grav = grav || 0;
      }
      function addText(x, y, s, col, size) {
        const t = texts[tCur]; tCur = (tCur + 1) % texts.length;
        t.on = true; t.x = x; t.y = y; t.s = s; t.col = col; t.size = size; t.t = 0;
      }

      let PX = 0, PY = 0, PK = 0, PD = 0;
      function proj(x, y, z) {
        const d = z - (S.z - S.camD); PD = d;
        const dd = Math.max(0.3, d);
        PK = F / dd; PX = cx + (x - S.x * 0.35) * PK; PY = hy + (S.camY - y) * PK;
      }

      const SLX = new Float32Array(VIS + 1), SLZ = new Float32Array(VIS + 1);
      for (let i = 0; i <= VIS; i++) { const r = SPC * Math.sqrt(i + 0.5), a = i * GOLD; SLX[i] = Math.cos(a) * r; SLZ[i] = Math.sin(a) * r * 0.85; }
      function blobR(n) { return SPC * Math.sqrt(Math.max(1, Math.min(n, VIS)) + 0.5); }

      function newMem(x, dz, pop) {
        return { x, dz, y: 0, ph: Math.random() * 6.28, pop: pop ? 1 : 0, sx: 0, sz: 0 };
      }
      S.mem.push(newMem(0, 0, false));

      function syncVisible(pref) {
        const want = Math.min(S.count, VIS);
        while (S.mem.length < want) {
          const m = newMem(S.x + (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, true);
          S.mem.push(m);
        }
        while (S.mem.length > want) {
          let idx = S.mem.length - 1;
          if (pref === 'front') { let b = -1e9; for (let i = 0; i < S.mem.length; i++) if (S.mem[i].dz > b) { b = S.mem[i].dz; idx = i; } }
          const m = S.mem[idx];
          proj(m.x, 0.3, S.z + m.dz);
          poof(PX, PY, '#4c9bff', PK);
          S.mem.splice(idx, 1);
        }
      }
      function poof(x, y, col, k) {
        for (let i = 0; i < 4; i++) addPart(x, y - k * 0.3, (Math.random() - 0.5) * 140, -Math.random() * 160, 0.45, i % 2 ? col : '#ffffff', Math.max(2, k * 0.09), 380);
      }

      function enemyMem(e, n, R0) {
        e.mem.length = 0;
        const v = Math.min(n, VIS);
        for (let i = 0; i < v; i++) e.mem.push({ x: SLX[i], dz: SLZ[i], ph: Math.random() * 6.28 });
      }
      for (const e of T.els) if (e.type === 'enemy') enemyMem(e, e.n);
      const army = { n: T.army, mem: [], x: 0 };
      enemyMem(army, T.army);
      const armyRef = { type: 'army', z: armyZ };

      function hazardKill(m, X, Z) {
        for (let i = 0; i < T.els.length; i++) {
          const e = T.els[i];
          if (e.z > Z + 1.5) break;
          if (e.type === 'spike') { if (Z >= e.z && Z <= e.z + e.d && X >= e.xa - 0.1 && X <= e.xb + 0.1) return 'cut'; }
          else if (e.type === 'gap') { if (Z >= e.z && Z <= e.z1 && X >= e.xa && X <= e.xb) return 'fall'; }
          else if (e.type === 'saw') {
            const dx = X - e.sx, dzz = Z - e.z;
            if (dx * dx + dzz * dzz < (e.r + 0.12) * (e.r + 0.12)) return 'cut';
          }
        }
        return null;
      }

      function update(dt) {
        anim += dt;
        updFx(dt);
        for (const e of T.els) if (e.type === 'saw') e.rot += dt * 12;
        if (api.ended || S.over) {
          if (S.phase === 'done') S.doneT += dt;
          return;
        }
        hintT -= dt; countPop = Math.max(0, countPop - dt * 3);
        S.t += dt;
        for (const e of T.els) if (e.type === 'saw') e.sx = sawX(e, S.t);
        const n0 = S.count;
        const R = blobR(S.count);
        const lim = RW - 0.25;
        S.tx = U.clamp(S.tx, -lim, lim);
        if (S.phase === 'run' || S.phase === 'fight') S.x += U.clamp(S.tx - S.x, -9 * dt, 9 * dt);
        let fwd = 0;
        if (S.phase === 'run') fwd = V;
        else if (S.phase === 'climb') fwd = 4.5;
        else if (S.phase === 'toStair') fwd = 7;
        S.z += fwd * dt;
        if (S.phase === 'climb' || S.phase === 'toStair' || S.phase === 'final') S.x += (0 - S.x) * Math.min(1, dt * 3);
        const tgtCam = (S.phase === 'final' || S.phase === 'toStair' || S.phase === 'climb' || S.phase === 'done') ? 11 : CAMD;
        S.camD += (tgtCam - S.camD) * Math.min(1, dt * 2);
        let cy = 0;
        if (S.z > zStair) cy = Math.min(STEPS, Math.floor((S.z - zStair) / SD) + 1) * SH;
        S.y += (cy - S.y) * Math.min(1, dt * 10);
        S.camY += (S.y + CAMH - S.camY) * Math.min(1, dt * 4);

        // members follow their slots
        const before = S.mem.length;
        let killed = 0;
        for (let i = S.mem.length - 1; i >= 0; i--) {
          const m = S.mem[i];
          const tx = U.clamp(S.x + SLX[i], -RW + 0.15, RW - 0.15), tz = SLZ[i];
          const k = Math.min(1, dt * 7);
          m.x += (tx - m.x) * k; m.dz += (tz - m.dz) * k;
          if (m.pop > 0) m.pop = Math.max(0, m.pop - dt * 3);
          if (S.phase === 'run') {
            const why = hazardKill(m, m.x, S.z + m.dz);
            if (why) {
              proj(m.x, 0.3, S.z + m.dz);
              if (why === 'fall') { for (let p = 0; p < 3; p++) addPart(PX, PY, (Math.random() - 0.5) * 60, 80 + Math.random() * 60, 0.6, '#4c9bff', Math.max(2, PK * 0.12), 500); }
              else { for (let p = 0; p < 5; p++) addPart(PX, PY - PK * 0.3, (Math.random() - 0.5) * 220, -Math.random() * 220, 0.5, p % 2 ? '#4c9bff' : '#ff4d5e', Math.max(2, PK * 0.1), 500); }
              S.mem.splice(i, 1); killed++;
            }
          }
        }
        if (killed) {
          S.count = S.mem.length === 0 ? 0 : Math.round(S.count * S.mem.length / before);
          shake = Math.max(shake, 4);
          api.sfx('hit');
          if (S.count <= 0) return die('全軍覆沒…');
        }

        if (S.phase === 'run') {
          for (const e of T.els) {
            if (e.type === 'gate' && !e.used && S.z >= e.z) {
              e.used = true; e.side = S.x < 0 ? 0 : 1; e.flash = 1;
              const op = e.ops[e.side];
              const nc = Math.min(99999, applyOp(op, S.count));
              const diff = nc - S.count;
              S.count = nc; countPop = 1;
              proj(S.x, 1.6, S.z + 1);
              addText(PX, PY - 30, (diff >= 0 ? '+' : '') + diff, op.good ? '#7dffa8' : '#ff6b7a', 30);
              api.sfx(op.good ? 'good' : 'bad');
              if (!op.good) shake = Math.max(shake, 6);
              if (S.count <= 0) return die('人數歸零了…');
            }
            if (e.type === 'enemy' && !e.done) {
              const dist = e.z - S.z;
              if (dist < 16 && dist > -2) {
                e.x += U.clamp(S.x - e.x, -3 * dt, 3 * dt);
                if (!e.fight) e.z -= 3 * dt;
              }
              const Re = blobR(e.n);
              if (!e.fight && dist < R * 0.85 + Re * 0.85 + 0.4) { e.fight = true; S.enemy = e; S.phase = 'fight'; S.fightT = 0; api.sfx('hit'); }
            }
          }
          if (S.z >= armyZ - blobR(army.n) - R - 0.5) { S.phase = 'final'; S.fightT = 0; api.sfx('hit'); shake = 6; }
        }
        if (S.phase === 'fight' || S.phase === 'final') {
          const e = S.phase === 'fight' ? S.enemy : army;
          S.fightT += dt;
          if (S.phase === 'fight') {
            const gap = e.z - S.z - 0.3;
            if (gap > 0.6) e.z -= dt * 4;
          }
          const every = S.phase === 'final' ? 0.045 : 0.035;
          while (S.fightT >= every && e.n > 0 && S.count > 0) {
            S.fightT -= every;
            const k = Math.max(1, Math.ceil(Math.min(S.count, e.n) / (S.phase === 'final' ? 40 : 22)));
            const kk = Math.min(k, S.count, e.n);
            S.count -= kk; e.n -= kk;
            syncVisible('front');
            const want = Math.min(e.n, VIS);
            while (e.mem.length > want) {
              let idx = 0, b = 1e9;
              for (let i = 0; i < e.mem.length; i++) if (e.mem[i].dz < b) { b = e.mem[i].dz; idx = i; }
              const m = e.mem[idx];
              proj(e.x + m.x, 0.3, e.z + m.dz); poof(PX, PY, '#ff4d5e', PK);
              e.mem.splice(idx, 1);
            }
            if (Math.random() < 0.3) api.sfx('pop');
            shake = Math.max(shake, 2);
          }
          if (S.count <= 0) return die(S.phase === 'final' ? '敵軍太多了…' : '被敵人消滅了…');
          if (e.n <= 0) {
            e.done = true; e.mem.length = 0;
            if (S.phase === 'fight') { S.phase = 'run'; S.enemy = null; }
            else { S.phase = 'toStair'; api.sfx('good'); banner = { text: '勝利！', t: 0, col: '#7dffa8' }; }
          }
        }
        if (S.phase === 'toStair' && S.z >= zStair - 0.5) S.phase = 'climb';
        if (S.phase === 'climb') {
          const stepIdx = Math.floor((S.z - zStair) / SD) + 1;
          if (stepIdx > S.step) {
            if (S.step >= STEPS || S.count < S.stepCost) { finishClimb(); }
            else {
              S.step++;
              const per = S.count / Math.max(1, S.mem.length);
              const leave = Math.max(1, Math.min(S.mem.length, Math.round(S.stepCost / per)));
              S.count -= S.stepCost;
              const sz = zStair + (S.step - 0.5) * SD;
              for (let j = 0; j < leave; j++) {
                const m = S.mem.pop(); if (!m) break;
                S.stay.push({ x: (j - (leave - 1) / 2) * Math.min(0.45, 4 / leave), z: sz + (Math.random() - 0.5) * 0.3, y: S.step * SH, ph: Math.random() * 6 });
              }
              syncVisible();
              api.sfx('tap');
              if (S.count <= 0 || S.step >= STEPS) finishClimb();
            }
          }
        }
        if (S.phase === 'run' || S.phase === 'fight') syncVisible();
        if (S.count !== n0) countPop = 1;
        const prog = Math.min(100, Math.round(S.z / T.zFin * 100));
        const info = L === 1 && S.z < 40 ? '拖曳左右轉向 · 穿過藍色閘門增加人數' : '人數 ' + S.count + ' · 敵軍 ' + army.n + ' · 進度 ' + prog + '%';
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
      }
      let banner = null;

      function die(msg) {
        S.over = true; S.phase = 'dead';
        shake = 10; api.sfx('bad');
        api.lose(msg);
      }
      function finishClimb() {
        S.phase = 'done'; S.over = true;
        for (let i = 0; i < 90; i++) addPart(Math.random() * W, -10, (Math.random() - 0.5) * 220, Math.random() * 200, 2.2 + Math.random(), U.PALETTE[i % 9], 7, 260);
        banner = { text: S.step > 0 ? '第 ' + S.step + ' 階！' : '過關！', t: 0, col: '#ffe27a' };
        api.win(S.step > 0 ? '登上第 ' + S.step + ' 階 · ×' + (1 + S.step * 0.1).toFixed(1) : '成功擊敗敵軍！');
      }

      function updFx(dt) {
        shake = Math.max(0, shake - dt * 30);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
          p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        }
        for (let i = 0; i < texts.length; i++) { const t = texts[i]; if (!t.on) continue; t.t += dt; t.y -= 50 * dt; if (t.t > 0.9) t.on = false; }
        for (const e of T.els) if (e.type === 'gate' && e.flash > 0) e.flash = Math.max(0, e.flash - dt * 1.5);
        if (banner) { banner.t += dt; if (banner.t > 1.6) banner = null; }
      }

      // ---------- drawing ----------
      function buildCache() {
        const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
        const c = document.createElement('canvas');
        c.width = Math.ceil(W * dpr); c.height = Math.ceil(H * dpr);
        const x = c.getContext('2d'); x.scale(dpr, dpr);
        let gr = x.createLinearGradient(0, 0, 0, hy);
        gr.addColorStop(0, '#5ec2ff'); gr.addColorStop(1, '#d8f3ff');
        x.fillStyle = gr; x.fillRect(0, 0, W, Math.max(1, hy + 1));
        const r = MG.mulberry32(5);
        x.fillStyle = 'rgba(255,255,255,0.85)';
        for (let i = 0; i < 6; i++) {
          const ccx = r() * W, ccy = hy * (0.2 + r() * 0.6), s = 14 + r() * 22;
          x.beginPath(); x.arc(ccx, ccy, s, 0, 7); x.arc(ccx + s, ccy + 4, s * 0.8, 0, 7); x.arc(ccx - s, ccy + 5, s * 0.7, 0, 7); x.fill();
        }
        gr = x.createLinearGradient(0, hy, 0, H);
        gr.addColorStop(0, '#9edcff'); gr.addColorStop(0.15, '#47aef0'); gr.addColorStop(1, '#1c64b8');
        x.fillStyle = gr; x.fillRect(0, hy, W, H - hy);
        x.fillStyle = 'rgba(255,255,255,0.35)';
        for (let i = 0; i < 50; i++) { const yy = hy + Math.pow(r(), 1.6) * (H - hy); x.fillRect(r() * W, yy, 6 + (yy - hy) * 0.08, 1.5); }
        cache = c;
      }

      function quad(g, xa, xb, z0, z1, y, col) {
        proj(xa, y, z0); const ax = PX, ay = PY; const bx0 = cx + (xb - S.x * 0.35) * PK;
        proj(xa, y, z1); const cx1 = PX, cy1 = PY; const dx1 = cx + (xb - S.x * 0.35) * PK;
        g.fillStyle = col; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx0, ay); g.lineTo(dx1, cy1); g.lineTo(cx1, cy1); g.closePath(); g.fill();
      }

      function drawRoad(g) {
        const near = S.z - S.camD + 0.8, far = Math.min(S.z + 75, zStair);
        const z0 = Math.max(near, -20);
        quad(g, -RW - 0.25, RW + 0.25, z0, far, -0.02, '#b48cff');
        const t0 = Math.floor(z0 / 2) * 2;
        for (let z = t0; z < far; z += 2) {
          const za = Math.max(z, z0), zb = Math.min(z + 2, far);
          if (zb <= za) continue;
          quad(g, -RW, RW, za, zb, 0, (Math.floor(z / 2) % 2) ? '#f3ecff' : '#e3d6ff');
        }
        quad(g, -RW - 0.25, -RW, z0, far, 0.02, '#8a63e0');
        quad(g, RW, RW + 0.25, z0, far, 0.02, '#8a63e0');
        if (T.zFin > z0 && T.zFin < far + 2) {
          for (let i = 0; i < 12; i++) for (let j = 0; j < 2; j++) quad(g, -RW + i * RW / 6, -RW + (i + 1) * RW / 6, T.zFin + j * 0.5, T.zFin + (j + 1) * 0.5, 0.01, (i + j) % 2 ? '#222' : '#fff');
        }
        for (const e of T.els) {
          if (e.type !== 'gap') continue;
          if (e.z1 < z0 || e.z > far) continue;
          const za = Math.max(e.z, z0);
          const xa = Math.max(e.xa, -RW - 0.25), xb = Math.min(e.xb, RW + 0.25);
          quad(g, xa, xb, za, e.z1, 0.01, '#123a7a');
          proj(xa, 0, e.z1); const ax = PX, ay = PY; const bx = cx + (xb - S.x * 0.35) * PK;
          proj(xa, -0.8, e.z1);
          g.fillStyle = '#2a5fb0'; g.fillRect(ax, ay, bx - ax, Math.max(1, PY - ay));
        }
      }

      function drawStairs(g) {
        if (zStair - S.z > 80) return;
        for (let i = STEPS; i >= 1; i--) {
          const z0 = zStair + (i - 1) * SD, z1 = z0 + SD;
          if (z0 - (S.z - S.camD) < 0.8) continue;
          const y = i * SH, col = STEP_COLS[(i - 1) % STEP_COLS.length];
          const w = RW * 0.85;
          quad(g, -w, w, z0, z1, y, U.shade(col, 0.35));
          proj(-w, y, z0); const ax = PX, ay = PY; const bx = cx + (w - S.x * 0.35) * PK;
          proj(-w, y - SH, z0);
          g.fillStyle = col; g.fillRect(ax, ay, bx - ax, PY - ay + 1);
          if (PK > 6) U.text(g, '×' + (1 + i * 0.1).toFixed(1), (ax + bx) / 2, (ay + PY) / 2, Math.min(22, Math.max(8, PK * 0.3)), '#ffffff', 'center', 900);
        }
      }

      function figure(g, x, y, k, col, ph, run, facing, pop) {
        const s = k * (1 + pop * 0.6);
        const h = 0.62 * s, sw = Math.sin(ph) * (run ? 1 : 0.2);
        g.fillStyle = 'rgba(0,0,0,0.18)';
        g.beginPath(); g.ellipse(x, y, 0.17 * s, 0.06 * s, 0, 0, 6.283); g.fill();
        g.strokeStyle = U.shade(col, -0.3); g.lineWidth = Math.max(1, 0.075 * s); g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x - 0.04 * s, y - h * 0.42); g.lineTo(x - 0.06 * s - sw * 0.07 * s, y - Math.max(0, sw) * 0.05 * s);
        g.moveTo(x + 0.04 * s, y - h * 0.42); g.lineTo(x + 0.06 * s + sw * 0.07 * s, y + Math.min(0, sw) * 0.05 * s);
        g.stroke();
        g.fillStyle = col;
        U.rr(g, x - 0.1 * s, y - h * 0.82, 0.2 * s, h * 0.45, 0.08 * s); g.fill();
        g.beginPath(); g.arc(x, y - h * 0.95, 0.105 * s, 0, 6.283); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.35)';
        g.beginPath(); g.arc(x - 0.035 * s, y - h * 0.99, 0.04 * s, 0, 6.283); g.fill();
        if (facing && s > 18) {
          g.fillStyle = '#2a1020';
          g.fillRect(x - 0.05 * s, y - h * 0.97, 0.025 * s, 0.03 * s); g.fillRect(x + 0.025 * s, y - h * 0.97, 0.025 * s, 0.03 * s);
        }
      }

      function drawGate(g, e) {
        for (let side = 0; side < 2; side++) {
          const op = e.ops[side];
          const xa = side ? 0.08 : -RW, xb = side ? RW : -0.08;
          proj(xa, 2.0, e.z); const ax = PX, ay = PY, k = PK;
          if (PD < 0.6) continue;
          const bx = cx + (xb - S.x * 0.35) * k;
          proj(xa, 0, e.z); const by = PY;
          let alpha = 1;
          if (e.used) alpha = e.side === side ? e.flash : 0.35 * e.flash;
          if (alpha <= 0.01) continue;
          g.globalAlpha = alpha;
          const col = op.good ? '#2f8cff' : '#ff3b54';
          const gr = g.createLinearGradient(0, ay, 0, by);
          gr.addColorStop(0, op.good ? 'rgba(110,190,255,0.85)' : 'rgba(255,120,140,0.85)');
          gr.addColorStop(1, op.good ? 'rgba(40,120,240,0.45)' : 'rgba(220,40,70,0.45)');
          g.fillStyle = gr; g.fillRect(ax, ay, bx - ax, by - ay);
          g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(ax, ay, bx - ax, (by - ay) * 0.12);
          g.fillStyle = U.shade(col, -0.25);
          const pw = Math.max(2, 0.12 * k);
          g.fillRect(ax - pw / 2, ay - pw, pw, by - ay + pw); g.fillRect(bx - pw / 2, ay - pw, pw, by - ay + pw);
          g.fillRect(ax - pw / 2, ay - pw, bx - ax + pw, pw);
          const ts = Math.min(56, Math.max(9, 0.75 * k));
          g.font = '900 ' + ts + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = Math.max(2, ts * 0.12); g.strokeStyle = U.shade(col, -0.5); g.lineJoin = 'round';
          g.strokeText(opText(op), (ax + bx) / 2, (ay + by) / 2);
          g.fillStyle = '#fff'; g.fillText(opText(op), (ax + bx) / 2, (ay + by) / 2);
          g.globalAlpha = 1;
        }
      }

      function drawSaw(g, e) {
        if (e.x0 !== e.x1) {
          quad(g, e.x0 - 0.2, e.x1 + 0.2, e.z - 0.12, e.z + 0.12, 0.012, '#6b5a8a');
        }
        proj(e.sx, e.r * 0.85, e.z);
        if (PD < 0.6) return;
        const x = PX, y = PY, R = e.r * PK;
        g.fillStyle = 'rgba(0,0,0,0.2)';
        proj(e.sx, 0, e.z);
        g.beginPath(); g.ellipse(x, PY, R * 0.9, R * 0.18, 0, 0, 6.283); g.fill();
        g.save(); g.translate(x, y); g.rotate(e.rot);
        g.fillStyle = '#c9d1de';
        g.beginPath();
        for (let i = 0; i < 24; i++) {
          const a = i / 24 * 6.283, rr = i % 2 ? R * 0.84 : R;
          if (i === 0) g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        g.closePath(); g.fill();
        g.fillStyle = '#8d97a8'; g.beginPath(); g.arc(0, 0, R * 0.62, 0, 6.283); g.fill();
        g.fillStyle = '#e8edf5'; g.beginPath(); g.arc(-R * 0.2, -R * 0.2, R * 0.22, 0, 6.283); g.fill();
        g.fillStyle = '#ff4d5e'; g.beginPath(); g.arc(0, 0, R * 0.16, 0, 6.283); g.fill();
        g.restore();
      }

      function drawSpike(g, e) {
        quad(g, e.xa, e.xb, e.z, e.z + e.d, 0.015, '#5b5f6e');
        const n = Math.max(2, Math.round((e.xb - e.xa) / 0.35));
        for (let row = 1; row >= 0; row--) {
          const z = e.z + 0.18 + row * 0.35;
          for (let i = 0; i < n; i++) {
            const x = e.xa + (i + 0.5) * (e.xb - e.xa) / n;
            proj(x, 0, z); if (PD < 0.6) continue;
            const bx = PX, by = PY, k = PK;
            g.fillStyle = '#d3d9e4';
            g.beginPath(); g.moveTo(bx - 0.14 * k, by); g.lineTo(bx, by - 0.5 * k); g.lineTo(bx + 0.14 * k, by); g.closePath(); g.fill();
            g.fillStyle = '#8d97a8';
            g.beginPath(); g.moveTo(bx, by); g.lineTo(bx, by - 0.5 * k); g.lineTo(bx + 0.14 * k, by); g.closePath(); g.fill();
          }
        }
      }

      function bubble(g, x, y, txt, col, sc) {
        const s = 17 * sc;
        g.font = '900 ' + s + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
        const w = Math.max(s * 1.8, g.measureText(txt).width + s);
        g.fillStyle = col; U.rr(g, x - w / 2, y - s * 0.75, w, s * 1.5, s * 0.75); g.fill();
        g.beginPath(); g.moveTo(x - s * 0.3, y + s * 0.7); g.lineTo(x + s * 0.3, y + s * 0.7); g.lineTo(x, y + s * 1.1); g.fill();
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(txt, x, y + 1);
      }

      function draw(g) {
        if (!cache) buildCache();
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        g.drawImage(cache, 0, 0, W, H);
        drawRoad(g);
        drawStairs(g);
        // depth-sorted scene objects
        dl.length = 0;
        const zmin = S.z - S.camD + 0.6, zmax = S.z + 75;
        for (const e of T.els) if (e.z > zmin - 1 && e.z < zmax && e.type !== 'gap') dl.push(e);
        for (let i = 0; i < S.mem.length; i++) dl.push(S.mem[i]);
        for (let i = 0; i < S.stay.length; i++) dl.push(S.stay[i]);
        if (army.n > 0 && armyZ - S.z < 75) dl.push(armyRef);
        dl.sort((a, b) => zOf(b) - zOf(a));
        const cRun = S.phase === 'run' || S.phase === 'toStair' || S.phase === 'climb';
        for (let i = 0; i < dl.length; i++) {
          const o = dl[i];
          if (o.type === 'gate') drawGate(g, o);
          else if (o.type === 'saw') drawSaw(g, o);
          else if (o.type === 'spike') drawSpike(g, o);
          else if (o.type === 'enemy') drawGroup(g, o, o.x, o.z, 0, true);
          else if (o.type === 'army') drawGroup(g, army, 0, armyZ, 0, true);
          else if (o.dz !== undefined) {
            const yy = S.phase === 'climb' || S.phase === 'done' ? stairY(S.z + o.dz) : 0;
            proj(o.x, yy, S.z + o.dz); if (PD < 0.5) continue;
            figure(g, PX, PY, PK, '#3d8bff', anim * 14 + o.ph, cRun, false, o.pop);
          } else {
            proj(o.x, o.y, o.z); if (PD < 0.5) continue;
            figure(g, PX, PY, PK, '#3d8bff', o.ph, false, false, 0);
          }
        }
        if (S.mem.length) {
          proj(S.x, 1.25 + S.y, S.z + 0.2);
          bubble(g, PX, Math.max(30, PY - blobR(S.count) * PK * 0.2), String(S.count), '#2f7cf0', 1 + countPop * 0.25);
        }
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.5); g.fillStyle = p.col;
          g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        g.globalAlpha = 1;
        for (let i = 0; i < texts.length; i++) {
          const t = texts[i]; if (!t.on) continue;
          g.globalAlpha = t.t > 0.6 ? (0.9 - t.t) / 0.3 : 1;
          const sc = t.t < 0.12 ? 0.5 + t.t / 0.12 * 0.7 : 1.2;
          g.font = '900 ' + t.size * sc + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 5; g.strokeStyle = 'rgba(20,20,60,0.8)'; g.lineJoin = 'round'; g.strokeText(t.s, t.x, t.y);
          g.fillStyle = t.col; g.fillText(t.s, t.x, t.y);
        }
        g.globalAlpha = 1;
        g.restore();
        // HUD: progress bar
        const bw = Math.min(260, W - 40), bx = (W - bw) / 2, by = 14;
        g.fillStyle = 'rgba(30,30,80,0.35)'; U.rr(g, bx, by, bw, 12, 6); g.fill();
        g.fillStyle = '#ffffff'; U.rr(g, bx, by, Math.max(12, bw * Math.min(1, S.z / T.zFin)), 12, 6); g.fill();
        U.text(g, '🏁', bx + bw + 12, by + 6, 16, '#fff', 'center', 900);
        U.text(g, '🏃', bx - 12, by + 6, 15, '#fff', 'center', 900);
        if (banner) {
          const k = Math.min(1, banner.t / 0.35);
          g.globalAlpha = banner.t > 1.2 ? Math.max(0, 1 - (banner.t - 1.2) / 0.4) : 1;
          const sz = Math.min(46, W / 7) * U.easeOutBack(k);
          g.font = '900 ' + sz + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 7; g.strokeStyle = 'rgba(20,20,60,0.85)'; g.lineJoin = 'round';
          g.strokeText(banner.text, cx, H * 0.3); g.fillStyle = banner.col; g.fillText(banner.text, cx, H * 0.3);
          g.globalAlpha = 1;
        }
        if (hintT > 0 && !api.ended) {
          g.globalAlpha = Math.min(1, hintT) * (0.6 + 0.4 * Math.sin(anim * 5));
          U.text(g, '👆', cx + Math.sin(anim * 2.5) * 60, H - 40, 32, '#fff', 'center', 900);
          U.text(g, '◀  拖曳轉向  ▶', cx, H - 74, 16, '#ffffff', 'center', 900);
          g.globalAlpha = 1;
        }
      }
      function zOf(o) {
        if (o.type) return o.type === 'spike' ? o.z + o.d : o.z;
        if (o.dz !== undefined) return S.z + o.dz;
        return o.z;
      }
      function stairY(z) {
        if (z < zStair) return 0;
        return Math.min(STEPS, Math.floor((z - zStair) / SD) + 1) * SH;
      }

      function drawGroup(g, e, ex, ez, ey, red) {
        if (!e.mem.length) return;
        for (let i = e.mem.length - 1; i >= 0; i--) {
          const m = e.mem[i];
          proj(ex + m.x, ey, ez + m.dz); if (PD < 0.5) continue;
          figure(g, PX, PY, PK, '#ff4d5e', anim * 10 + m.ph, S.phase === 'fight' || S.phase === 'final', true, 0);
        }
        proj(ex, 1.25, ez + 0.2);
        if (PD > 0.5) bubble(g, PX, Math.max(30, PY - blobR(e.n) * PK * 0.2), String(e.n), '#e8364a', 0.9);
      }

      function down(x) { if (api.ended) return; drag = { x0: x, t0: S.tx }; hintT = Math.min(hintT, 0.4); }
      function move(x) { if (!drag || api.ended) return; S.tx = drag.t0 + (x - drag.x0) / (F / CAMD) * 1.1; }
      function up() { drag = null; }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _s: S, _k: { T, RW, V, blobR, army, applyOp, sawX, get pxPerUnit() { return F / CAMD; } },
      };
    },
  });
})();
