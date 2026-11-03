// 喪屍射門 — portrait road shooter: steer the squad, shoot zombies, shoot gates for upgrades.
(function () {
  'use strict';

  const WPN = [
    { name: '手槍', dmg: 1, rate: 2.4, pel: 1, spr: 0, pierce: 0, col: '#ffe27a', gun: '#9aa0ad', len: 0.9 },
    { name: '衝鋒槍', dmg: 1, rate: 5.5, pel: 1, spr: 0.003, pierce: 0, col: '#ffd04d', gun: '#3a3f4b', len: 1.25 },
    { name: '霰彈槍', dmg: 1, rate: 2.6, pel: 5, spr: 0.011, pierce: 0, col: '#ffb04d', gun: '#8a5a3c', len: 1.45 },
    { name: '步槍', dmg: 4, rate: 3.4, pel: 1, spr: 0, pierce: 1, col: '#9ef0ff', gun: '#55606e', len: 1.75 },
    { name: '機槍', dmg: 3, rate: 9, pel: 1, spr: 0.003, pierce: 0, col: '#ff9a4d', gun: '#2b2f38', len: 1.6 },
    { name: '雷射', dmg: 6, rate: 8, pel: 1, spr: 0, pierce: 3, col: '#ff5df0', gun: '#c45cff', len: 1.7 },
  ];
  const PEL_EFF = [1, 1, 2.3, 1.15, 1, 1.4];
  const ZF = 62;
  const DPT = 12;
  const BV = 80;
  const GV = 6.2;
  const SP = 0.085;
  const ROWZ = 0.75;
  const MAXN = 15;
  const GW = 0.29;
  const GU = 0.62;
  const FAN = 22;
  const COLS = [0, -1, 1, -2, 2];
  const SHIRTS = ['#5a6fa8', '#8a5a3c', '#7d4f8f', '#4f7a6a', '#a8604f', '#6b6b7a'];
  const SKINS = ['#86b86a', '#7aa860', '#93c27a', '#6f9e62'];

  function dpsModel(st) {
    const w = WPN[st.w];
    return 0.8 * Math.pow(st.n, 0.75) * w.dmg * st.dm * w.rate * st.rm * PEL_EFF[st.w];
  }
  function applyTo(st, kind, val) {
    if (kind === 'wpn') { if (val > st.w) st.w = val; else st.dm += 0.3; }
    else if (kind === 'men') { const room = MAXN - st.n; const add = Math.min(room, val); st.n += add; if (val > add) st.dm += 0.12 * (val - add); }
    else if (kind === 'rate') st.rm += val / 100;
    else if (kind === 'dmg') st.dm += val / 100;
    else if (kind === 'lose') st.n = Math.max(1, st.n - val);
    else if (kind === 'slow') st.rm = Math.max(0.5, st.rm - val / 100);
    else if (kind === 'weak') st.dm = Math.max(0.5, st.dm - val / 100);
  }
  function gateLabel(kind, val) {
    if (kind === 'wpn') return WPN[val].name;
    if (kind === 'men') return '+' + val + ' 幫手';
    if (kind === 'rate') return '射速 +' + val + '%';
    if (kind === 'dmg') return '傷害 +' + val + '%';
    if (kind === 'lose') return '−' + val + ' 幫手';
    if (kind === 'slow') return '射速 −' + val + '%';
    return '傷害 −' + val + '%';
  }
  function gateIcon(kind) {
    if (kind === 'wpn') return '🔫';
    if (kind === 'men' || kind === 'lose') return '👥';
    if (kind === 'rate' || kind === 'slow') return '⚡';
    return '💥';
  }
  function fmt(n) {
    n = Math.ceil(n);
    if (n < 1000) return String(n);
    if (n < 1e4) return (n / 1000).toFixed(1) + 'K';
    if (n < 1e6) return Math.round(n / 1000) + 'K';
    return (n / 1e6).toFixed(1) + 'M';
  }

  // Level generator: a DPS model tracks what the squad can do if it collects the good gates,
  // and zombie / gate HP are sized from it, so every level is beatable and upgrades scale with it.
  // diff: 0 簡單 (original tuning), 1 普通, 2 困難; endless = 無盡 (waves forever, boss every 5th wave)
  function genLevel(L, rng, diff, endless) {
    diff = diff || 0;
    const off = [0, 12, 30][diff];
    const Le = L + off;
    const hard = diff === 2;
    const BADHP = [1.4, 1.7, 2.2][diff];
    const waves = endless ? 150 : Math.min(6, 3 + Math.floor((L - 1) / 6) + (diff ? 1 : 0));
    const WL = endless ? 12 : 13 + Math.min(3.5, Le * 0.07) - [0, 1, 2.5][diff];
    const t0 = 2.2;
    const gs = (0.85 + Math.min(0.35, Le * 0.006)) * (hard ? 1.1 : 1);
    const zs = (0.28 + Math.min(0.06, Le * 0.001)) * [1, 1.3, 1.5][diff];
    const st = { n: 1, w: 0, rm: 1, dm: 1 };
    const tl = [[0, dpsModel(st)]];
    let tlI = 0;
    const dpsAt = (t) => {
      if (tlI > 0 && tl[tlI][0] > t) tlI = 0;
      while (tlI + 1 < tl.length && tl[tlI + 1][0] <= t) tlI++;
      return tl[tlI][1];
    };
    const ev = [];
    const gateEnd = t0 + (waves - 1) * WL + 1.5;
    const gap = 3.2 - Math.min(0.3, Le * 0.006);
    const G = Math.max(4, Math.floor((gateEnd - 0.3) / gap) + 1);
    const wu = endless ? 5 : Math.min(5, 2 + Math.floor(Le / 4));
    const wspan = endless ? 22 : G * 0.8;
    const wpos = {};
    for (let k = 0; k < wu; k++) wpos[Math.round(1 + k * (wspan - 1) / wu)] = k + 1;
    let side = rng() < 0.5 ? -1 : 1;
    for (let i = 0; i < G; i++) {
      const t = 0.3 + i * gap;
      const d = dpsAt(t + 1);
      let kind, val;
      if (i === 0) { kind = 'men'; val = 1; }
      else if (wpos[i]) { kind = 'wpn'; val = Math.max(st.w + 1, wpos[i]); if (val > 5) { kind = 'dmg'; val = 50; } }
      else {
        const r = rng();
        if (r < 0.42) { kind = 'men'; val = Le < 4 ? 1 + (rng() < 0.3 ? 1 : 0) : 1 + Math.floor(rng() * 3); }
        else if (r < 0.71) { kind = 'rate'; val = 20 + 10 * Math.floor(rng() * 3); }
        else { kind = 'dmg'; val = 25 + 5 * Math.floor(rng() * 5); }
      }
      const hp = Math.max(2, Math.round(d * gs * (0.85 + 0.3 * rng())));
      ev.push({ t, type: 'gate', side, kind, val, hp, good: true });
      const pairP = Le >= 3 ? 0.22 + Math.min(0.2, Le * 0.004) : 0;
      if (i > 0 && rng() < pairP) {
        let k2, v2, good2 = true;
        if (Le >= 5 && i > 2 && rng() < (hard ? 0.65 : 0.5)) {
          const rb = rng(); good2 = false;
          if (rb < 0.4) { k2 = 'lose'; v2 = 1 + Math.floor(rng() * 2); }
          else if (rb < 0.7) { k2 = 'slow'; v2 = 30; }
          else { k2 = 'weak'; v2 = 30; }
        } else {
          k2 = kind === 'men' ? 'rate' : 'men'; v2 = k2 === 'men' ? 1 + Math.floor(rng() * 2) : 30;
        }
        ev.push({ t, type: 'gate', side: -side, kind: k2, val: v2, hp: good2 ? Math.max(2, Math.round(d * gs)) : Math.max(8, Math.round(d * gs * BADHP)), good: good2 });
      } else if (Le >= 6 && i > 1 && rng() < 0.12 + Math.min(0.12, Le * 0.002)) {
        const bk = rng() < 0.5 ? 'lose' : 'weak';
        ev.push({ t: t + gap * 0.5, type: 'gate', side: rng() < 0.5 ? -1 : 1, kind: bk, val: bk === 'lose' ? 1 + Math.floor(rng() * 2) : 30, hp: Math.max(8, Math.round(d * gs * BADHP)), good: false });
      }
      applyTo(st, kind, val);
      tl.push([t + 6, dpsModel(st)]);
      side = rng() < 0.75 ? -side : side;
    }
    const spread = 0.38 + Math.min(0.1, Le * 0.003);
    const spdBase = (4.3 + Math.min(1.6, Le * 0.03)) * [1, 1.08, 1.3][diff];
    const damp = Math.max(0.6, 1 - Le * 0.008);
    for (let w = 0; w < waves; w++) {
      const tw = t0 + w * WL;
      const bossWave = endless ? w % 5 === 4 : w === waves - 1;
      const grow = endless ? 1 + 0.1 * w + 0.004 * w * w : 1;
      let nz = Math.min(endless ? 20 : 16 + [0, 2, 5][diff], Math.round(4 + 1.2 * (endless ? Math.min(w, 8) : w) + Le * 0.13));
      if (bossWave) nz = Math.max(3, Math.round(nz * 0.6));
      let k = 0;
      while (k < nz) {
        const ts = tw + (k / nz) * WL * (bossWave ? 0.5 : 0.8) + rng() * 0.6;
        const horde = (Le >= 2 && rng() < 0.3) ? 3 + Math.floor(rng() * Math.min(4, 1 + Le / 6)) : 1;
        const cu = (rng() * 2 - 1) * spread;
        for (let h = 0; h < horde && k < nz; h++, k++) {
          const tough = Le >= 4 && rng() < 0.12 + Math.min(0.12, Le * 0.003);
          const d = dpsAt(ts + 1.5) * damp;
          let hp = Math.max(1, Math.round(d * zs * (0.75 + 0.5 * rng()) * (tough ? 2.6 : 1) * (1 + 0.06 * (endless ? Math.min(w, 5) : w)) * grow));
          ev.push({ t: ts + h * 0.18, type: 'z', u: Math.max(-0.56, Math.min(0.56, cu + (h ? (rng() * 2 - 1) * 0.18 : 0))), hp, spd: spdBase * (tough ? 0.8 : 1) * (0.9 + 0.2 * rng()) * (endless ? 1 + Math.min(0.5, w * 0.01) : 1), r: tough ? 0.13 : 0.1, tough, wave: w });
        }
      }
      if (bossWave) {
        const tb = tw + WL * 0.25;
        const bhp = Math.max(25, Math.round(dpsAt(tb + 3) * damp * (4.2 + Math.min(2, Le * 0.03)) * (hard ? 1.2 : 1) * grow));
        ev.push({ t: tb, type: 'z', u: 0, hp: bhp, spd: 2.5 * (hard ? 1.15 : 1), r: 0.27, boss: true, wave: w });
      }
    }
    ev.sort((a, b) => a.t - b.t);
    return { ev, waves, WL, t0 };
  }

  MG.register({
    id: 'zombie', name: '喪屍射門', icon: '🧟', color: '#2f9e5a', endless: true,
    create(api) {
      const U = api.util, L = api.level, rng = api.rng;
      const DIFF = api.diff || 0, ENDLESS = !!api.endless;
      const plan = genLevel(L, rng, DIFF, ENDLESS);
      let W, H, cx, hy, py, rw, cache = null, cacheDpr = 1;
      function layout() {
        W = api.W; H = api.H; cx = W / 2;
        hy = Math.round(H * 0.17); py = Math.round(H * 0.8);
        rw = Math.min(W * 0.46, (py - hy) * 0.62);
        cache = null;
      }
      layout();
      let PX = 0, PY = 0, PS = 1;
      function proj(u, z) { const s = DPT / (DPT + z); PS = s; PX = cx + u * rw * s; PY = hy + (py - hy) * s; }

      const S = {
        T: 0, u: 0, tu: 0, w: 0, rm: 1, dm: 1, men: [], zs: [], gates: [], evI: 0, wave: 0,
        over: false, bossAlive: null, kills: 0,
      };
      let zid = 1, anim = 0, shake = 0, shootSnd = 0, hitSnd = 0, popSnd = 0, lastInfo = '', drag = null, hintT = L === 1 ? 6 : 2.5;
      const banners = [];
      function banner(text, col, size) { banners.push({ text, col, size: size || 34, t: 0 }); if (banners.length > 3) banners.shift(); }

      // pools
      const bullets = []; for (let i = 0; i < 700; i++) bullets.push({ on: false, u: 0, u0: 0, z: 0, du: 0, dmg: 0, pierce: 0, last: 0, w: 0 });
      let bCur = 0;
      const parts = []; for (let i = 0; i < 520; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 3, grav: 0, sq: false });
      let pCur = 0;
      const texts = []; for (let i = 0; i < 70; i++) texts.push({ on: false, x: 0, y: 0, t: 0, s: '', col: '#fff', size: 14, max: 0.8 });
      let tCur = 0;
      const order = [];

      function addPart(x, y, vx, vy, life, col, size, grav, sq) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size; p.grav = grav || 0; p.sq = !!sq;
      }
      function addText(x, y, s, col, size, max) {
        const t = texts[tCur]; tCur = (tCur + 1) % texts.length;
        t.on = true; t.x = x; t.y = y; t.s = s; t.col = col; t.size = size; t.t = 0; t.max = max || 0.8;
      }
      function burst(x, y, n, col, spd, size, grav) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, v = spd * (0.3 + Math.random() * 0.7);
          addPart(x, y, Math.cos(a) * v, Math.sin(a) * v - spd * 0.3, 0.4 + Math.random() * 0.5, col, size * (0.6 + Math.random() * 0.8), grav, Math.random() < 0.5);
        }
      }

      function addMan(fromU) {
        if (S.men.length >= MAXN) return false;
        S.men.push({ u: fromU, z: 0, cd: Math.random() * 0.3, flash: 0, pop: 0, bob: Math.random() * 6 });
        return true;
      }
      addMan(0);
      S.men[0].pop = 1;

      function halfWidth() {
        const cols = Math.min(5, S.men.length);
        return Math.ceil((cols - 1) / 2) * SP;
      }
      function slotU(i) { return COLS[i % 5] * SP; }
      function slotZ(i) { return -Math.floor(i / 5) * ROWZ; }

      function rate() { return WPN[S.w].rate * S.rm; }
      function dmg() { return WPN[S.w].dmg * S.dm; }

      function fire(m) {
        const wp = WPN[S.w];
        const d = dmg();
        for (let p = 0; p < wp.pel; p++) {
          const b = bullets[bCur]; bCur = (bCur + 1) % bullets.length;
          b.on = true; b.u = m.u; b.u0 = m.u; b.z = m.z + 0.4; b.dmg = d; b.pierce = wp.pierce; b.last = 0; b.w = S.w;
          b.du = wp.pel > 1 ? (p - (wp.pel - 1) / 2) * wp.spr + (rng() - 0.5) * wp.spr * 0.4 : (rng() - 0.5) * wp.spr * 2;
        }
        m.flash = 0.06;
        if (shootSnd <= 0) { api.sfx('shoot'); shootSnd = 0.09; }
      }

      function killMan(atU) {
        if (S.men.length === 0) return;
        let idx = 0;
        if (S.men.length > 1) {
          let best = 1e9;
          for (let i = 1; i < S.men.length; i++) { const d = Math.abs(S.men[i].u - atU); if (d < best) { best = d; idx = i; } }
        }
        const m = S.men[idx];
        proj(m.u, m.z);
        burst(PX, PY - 20 * PS, 18, '#ff4d5e', 220, 5, 500);
        addText(PX, PY - 50 * PS, idx === 0 ? '陣亡！' : '−1', '#ff4d5e', 22, 1);
        S.men.splice(idx, 1);
        shake = Math.max(shake, 10);
        api.sfx('bad');
        if (S.men.length === 0) { S.over = true; api.lose(ENDLESS ? '撐到第 ' + (S.wave + 1) + ' 波，擊殺 ' + S.kills + ' 隻' : '被喪屍攻破了！'); }
      }

      function spawn(e) {
        if (e.type === 'gate') {
          S.gates.push({ u: e.side * GU, z: ZF, hp: e.hp, max: e.hp, kind: e.kind, val: e.val, good: e.good, label: gateLabel(e.kind, e.val), icon: gateIcon(e.kind), flash: 0, pop: 0, dead: false });
          return;
        }
        const z = { id: zid++, u: e.u, z: ZF + 1, hp: e.hp, max: e.hp, spd: e.spd, r: e.r, boss: !!e.boss, tough: !!e.tough, flash: 0, kbv: 0, ph: Math.random() * 6, acc: 0, accT: 0, dead: false, wave: e.wave,
          skin: e.boss ? '#9b7fd1' : SKINS[(zid * 7) % SKINS.length], shirt: SHIRTS[(zid * 5) % SHIRTS.length] };
        S.zs.push(z);
        if (e.boss) { S.bossAlive = z; banner('BOSS 來襲！', '#ff4d5e', 40); shake = Math.max(shake, 8); api.sfx('bad'); }
        if (e.wave > S.wave) { S.wave = e.wave; if (!e.boss) banner('第 ' + (S.wave + 1) + ' 波', '#ffe27a', 34); }
      }

      function grant(gt) {
        proj(gt.u, gt.z);
        const x = PX, y = PY - GW * rw * PS;
        const col = gt.good ? '#4cc3ff' : '#ff4d5e';
        for (let i = 0; i < 34; i++) addPart(x + (Math.random() - 0.5) * GW * 2 * rw * PS, y + (Math.random() - 0.5) * 40 * PS, (Math.random() - 0.5) * 300, -Math.random() * 300, 0.6 + Math.random() * 0.5, i % 3 ? col : '#ffffff', 4 + Math.random() * 4, 600, true);
        const k = gt.kind, v = gt.val;
        if (k === 'wpn') {
          if (v > S.w) { S.w = v; banner(WPN[v].name + '！', '#ffe27a', 40); } else { S.dm += 0.3; banner('傷害 +30%', '#ffe27a', 34); }
        } else if (k === 'men') {
          let added = 0;
          for (let i = 0; i < v; i++) if (addMan(gt.u * 0.6)) added++;
          for (let i = S.men.length - added; i < S.men.length; i++) S.men[i].pop = 1;
          if (added < v) S.dm += 0.12 * (v - added);
          banner(added ? '+' + added + ' 幫手！' : '傷害提升！', '#7dffa8', 36);
        } else if (k === 'rate') { S.rm += v / 100; banner('射速 +' + v + '%', '#7de0ff', 34); }
        else if (k === 'dmg') { S.dm += v / 100; banner('傷害 +' + v + '%', '#ffb04d', 34); }
        else if (k === 'lose') {
          let n = v; while (n-- > 0 && S.men.length > 1) { const m = S.men.pop(); proj(m.u, m.z); burst(PX, PY - 15, 10, '#ff4d5e', 160, 4, 400); }
          banner('−' + v + ' 幫手…', '#ff6b7a', 34);
        } else if (k === 'slow') { S.rm = Math.max(0.5, S.rm - v / 100); banner('射速 −' + v + '%', '#ff6b7a', 34); }
        else if (k === 'weak') { S.dm = Math.max(0.5, S.dm - v / 100); banner('傷害 −' + v + '%', '#ff6b7a', 34); }
        api.sfx(gt.good ? 'good' : 'bad');
        if (!gt.good) shake = Math.max(shake, 8); else shake = Math.max(shake, 4);
      }

      function hitZombie(z, d) {
        z.hp -= d; z.flash = 0.07; z.acc += d;
        z.kbv = Math.min(z.spd * (z.boss ? 0.15 : 0.65), z.kbv + (z.boss ? 0.15 : 1.2) * (S.w >= 3 ? 1.6 : 1));
        if (hitSnd <= 0) { api.sfx('hit'); hitSnd = 0.07; }
        if (Math.random() < 0.35) { proj(z.u, z.z); addPart(PX + (Math.random() - 0.5) * 10 * PS, PY - z.r * rw * PS * 2.2, (Math.random() - 0.5) * 120, -Math.random() * 120, 0.35, '#5fbf3f', 3 * PS + 1, 300); }
        if (z.hp <= 0 && !z.dead) {
          z.dead = true; S.kills++; api.score(S.kills);
          proj(z.u, z.z);
          const R = z.r * rw * PS;
          burst(PX, PY - R * 1.8, z.boss ? 60 : 14, '#6fd14a', z.boss ? 420 : 200, z.boss ? 8 : 4 * PS + 2, 500);
          burst(PX, PY - R * 1.8, z.boss ? 30 : 6, z.shirt, z.boss ? 300 : 150, z.boss ? 7 : 3 * PS + 2, 500);
          if (z.acc > 0) { addText(PX, PY - R * 3.2, fmt(z.acc), '#ffffff', 13 + 8 * PS, 0.7); z.acc = 0; }
          if (z.boss) { S.bossAlive = null; shake = 18; banner('BOSS 擊倒！', '#7dffa8', 42); api.sfx('good'); }
          else { shake = Math.max(shake, 2.5); if (popSnd <= 0) { api.sfx('pop'); popSnd = 0.06; } }
        }
      }

      function updBullets(dt) {
        const zs = S.zs, gs = S.gates;
        for (let i = 0; i < bullets.length; i++) {
          const b = bullets[i]; if (!b.on) continue;
          const z0 = b.z; b.z += BV * dt; b.u = b.u0 + b.du * Math.min(Math.max(0, b.z), FAN);
          if (b.z > ZF + 3 || b.u < -1.4 || b.u > 1.4) { b.on = false; continue; }
          let bz = 1e9, bo = null, isG = false;
          for (let j = 0; j < zs.length; j++) {
            const z = zs[j]; if (z.dead || z.id === b.last) continue;
            if (z.z > z0 - 0.6 && z.z <= b.z + 0.2 && z.z < bz && Math.abs(b.u - z.u) < z.r + 0.025) { bz = z.z; bo = z; }
          }
          for (let j = 0; j < gs.length; j++) {
            const gt = gs[j]; if (gt.dead) continue;
            if (gt.z > z0 - 0.5 && gt.z <= b.z && gt.z < bz && Math.abs(b.u - gt.u) < GW) { bz = gt.z; bo = gt; isG = true; }
          }
          if (!bo) continue;
          if (isG) {
            bo.hp -= b.dmg; bo.flash = 0.06; bo.pop = Math.min(1, bo.pop + 0.25);
            if (hitSnd <= 0) { api.sfx('hit'); hitSnd = 0.08; }
            if (bo.hp <= 0) { bo.dead = true; grant(bo); }
            b.on = false;
          } else {
            hitZombie(bo, b.dmg);
            proj(b.u, bo.z);
            if (Math.random() < 0.5) addPart(PX, PY - bo.r * rw * PS * 1.8, (Math.random() - 0.5) * 80, -60, 0.12, '#fff6c0', 5 * PS + 2, 0, false);
            if (b.pierce > 0) { b.pierce--; b.last = bo.id; } else b.on = false;
          }
        }
      }

      function update(dt) {
        anim += dt;
        updFx(dt);
        if (api.ended || S.over) return;
        S.T += dt;
        shootSnd -= dt; hitSnd -= dt; popSnd -= dt; hintT -= dt;
        while (S.evI < plan.ev.length && plan.ev[S.evI].t <= S.T) spawn(plan.ev[S.evI++]);
        const hw = halfWidth();
        S.tu = U.clamp(S.tu, -0.93 + hw, 0.93 - hw);
        const du = S.tu - S.u, mv = 3.2 * dt;
        S.u += U.clamp(du * Math.min(1, 14 * dt), -mv, mv);
        const r = rate();
        for (let i = 0; i < S.men.length; i++) {
          const m = S.men[i];
          const tu = S.u + slotU(i), tz = slotZ(i);
          m.u += (tu - m.u) * Math.min(1, 16 * dt); m.z += (tz - m.z) * Math.min(1, 10 * dt);
          m.flash -= dt; if (m.pop > 0) m.pop = Math.max(0, m.pop - dt * 2.2);
          m.cd -= dt;
          let guard = 0;
          while (m.cd <= 0 && guard++ < 3) { m.cd += 1 / r; fire(m); }
          if (m.cd < 0) m.cd = 0;
        }
        updBullets(dt);
        const zs = S.zs;
        for (let i = zs.length - 1; i >= 0; i--) {
          const z = zs[i];
          if (z.dead) { zs.splice(i, 1); continue; }
          z.flash -= dt;
          z.z -= z.spd * dt; z.z += z.kbv * dt; z.kbv *= Math.exp(-6 * dt);
          if (z.z < 26 && !z.boss) z.u = U.clamp(z.u + U.clamp(S.u - z.u, -1, 1) * 0.1 * dt, -0.58, 0.58);
          z.accT -= dt;
          if (z.acc > 0 && z.accT <= 0) {
            proj(z.u, z.z);
            addText(PX + (Math.random() - 0.5) * 16, PY - z.r * rw * PS * 3.4, fmt(z.acc), z.boss ? '#ffe27a' : '#ffffff', 11 + 7 * PS + (z.boss ? 4 : 0), 0.6);
            z.acc = 0; z.accT = 0.16;
          }
          if (z.z <= 0.35) {
            if (z.boss) {
              while (S.men.length && !S.over) killMan(0);
              return;
            }
            z.dead = true;
            proj(z.u, 0.3); burst(PX, PY - 20, 16, '#6fd14a', 200, 5, 500);
            killMan(z.u);
            zs.splice(i, 1);
            if (S.over) return;
          }
        }
        const gs = S.gates;
        for (let i = gs.length - 1; i >= 0; i--) {
          const gt = gs[i];
          gt.z -= GV * dt; gt.flash -= dt; gt.pop = Math.max(0, gt.pop - dt * 3);
          if (gt.dead || gt.z < -1.5) gs.splice(i, 1);
        }
        const info = ENDLESS ? '無盡模式 · 第 ' + (S.wave + 1) + ' 波 · 每 5 波一隻 BOSS'
          : '第 ' + (S.wave + 1) + '/' + plan.waves + ' 波' + (L === 1 && DIFF === 0 && S.T < 12 ? ' · 拖曳左右移動，射爆藍色閘門拿升級' : ' · 擊殺 ' + S.kills);
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
        if (S.evI >= plan.ev.length && zs.length === 0 && ENDLESS) { S.over = true; api.lose('撐過全部 ' + plan.waves + ' 波！擊殺 ' + S.kills); return; }
        if (S.evI >= plan.ev.length && zs.length === 0) {
          S.over = true;
          for (let i = 0; i < 60; i++) addPart(Math.random() * W, -10, (Math.random() - 0.5) * 200, Math.random() * 200, 2 + Math.random(), U.PALETTE[i % 8], 6, 300, true);
          banner('全部清除！', '#7dffa8', 42);
          api.win('喪屍全滅！擊殺 ' + S.kills + ' 隻');
        }
      }

      function updFx(dt) {
        if (shake > 0) shake = Math.max(0, shake - dt * 40);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
          p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        }
        for (let i = 0; i < texts.length; i++) {
          const t = texts[i]; if (!t.on) continue;
          t.t += dt; t.y -= 40 * dt; if (t.t >= t.max) t.on = false;
        }
        for (let i = banners.length - 1; i >= 0; i--) { banners[i].t += dt; if (banners[i].t > 1.4) banners.splice(i, 1); }
      }

      // ---------- drawing ----------
      function buildCache() {
        const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
        const c = document.createElement('canvas');
        c.width = Math.ceil(W * dpr); c.height = Math.ceil(H * dpr);
        const x = c.getContext('2d');
        x.scale(dpr, dpr);
        let gr = x.createLinearGradient(0, 0, 0, hy + 10);
        gr.addColorStop(0, '#231a45'); gr.addColorStop(0.55, '#7a3a6a'); gr.addColorStop(1, '#ff9a5c');
        x.fillStyle = gr; x.fillRect(0, 0, W, hy + 2);
        gr = x.createRadialGradient(cx + W * 0.18, hy - 4, 4, cx + W * 0.18, hy - 4, W * 0.35);
        gr.addColorStop(0, 'rgba(255,220,140,0.9)'); gr.addColorStop(0.2, 'rgba(255,170,100,0.45)'); gr.addColorStop(1, 'rgba(255,140,90,0)');
        x.fillStyle = gr; x.fillRect(0, 0, W, hy + 2);
        x.fillStyle = '#ffd98a'; x.beginPath(); x.arc(cx + W * 0.18, hy - 6, Math.max(10, W * 0.05), 0, Math.PI * 2); x.fill();
        const r = MG.mulberry32(99);
        x.fillStyle = '#3a2350';
        for (let bx = -10; bx < W + 10;) {
          const bw = 18 + r() * 34, bh = 14 + r() * Math.min(70, hy * 0.6);
          x.fillRect(bx, hy - bh, bw, bh + 2);
          if (r() < 0.4) x.fillRect(bx + bw * 0.3, hy - bh - 10, 4, 10);
          bx += bw + r() * 6;
        }
        x.fillStyle = 'rgba(255,200,120,0.55)';
        const r2 = MG.mulberry32(7);
        for (let i = 0; i < 40; i++) { if (r2() < 0.5) x.fillRect(r2() * W, hy - 6 - r2() * 50, 3, 3); }
        gr = x.createLinearGradient(0, hy, 0, H);
        gr.addColorStop(0, '#3a4a2e'); gr.addColorStop(1, '#1f3a1c');
        x.fillStyle = gr; x.fillRect(0, hy, W, H - hy);
        const sB = (H - hy) / (py - hy);
        const sF = DPT / (DPT + ZF + 6);
        const quad = (u0, u1, col) => {
          x.fillStyle = col; x.beginPath();
          x.moveTo(cx + u0 * rw * sF, hy + (py - hy) * sF); x.lineTo(cx + u1 * rw * sF, hy + (py - hy) * sF);
          x.lineTo(cx + u1 * rw * sB, H); x.lineTo(cx + u0 * rw * sB, H); x.closePath(); x.fill();
        };
        quad(-1.22, 1.22, '#8d8478');
        quad(-1.05, 1.05, '#6d675f');
        gr = x.createLinearGradient(0, hy, 0, H);
        gr.addColorStop(0, '#3b3d48'); gr.addColorStop(1, '#55586a');
        x.fillStyle = gr;
        x.beginPath();
        x.moveTo(cx - rw * sF, hy + (py - hy) * sF); x.lineTo(cx + rw * sF, hy + (py - hy) * sF);
        x.lineTo(cx + rw * sB, H); x.lineTo(cx - rw * sB, H); x.closePath(); x.fill();
        quad(-1.0, -0.975, '#f2d14a'); quad(0.975, 1.0, '#f2d14a');
        gr = x.createLinearGradient(0, hy, 0, hy + (py - hy) * 0.22);
        gr.addColorStop(0, 'rgba(255,154,92,0.75)'); gr.addColorStop(1, 'rgba(255,154,92,0)');
        x.fillStyle = gr; x.fillRect(0, hy, W, (py - hy) * 0.22);
        gr = x.createLinearGradient(0, py - 20, 0, H);
        gr.addColorStop(0, 'rgba(20,20,40,0)'); gr.addColorStop(1, 'rgba(20,20,40,0.35)');
        x.fillStyle = gr; x.fillRect(0, py - 20, W, H - py + 20);
        cache = c; cacheDpr = dpr;
      }

      const STAINS = [];
      { const r3 = MG.mulberry32(3); for (let i = 0; i < 18; i++) STAINS.push(r3() * 72, (r3() * 2 - 1) * 0.9, 0.6 + r3() * 1.2, r3() < 0.3 ? 1 : 0); }
      function roadDecor(g) {
        const scroll = S.T * GV;
        for (let i = 0; i < STAINS.length; i += 4) {
          let z = (STAINS[i] - scroll) % 72; if (z < 0) z += 72; z -= 4;
          if (z > ZF) continue;
          proj(STAINS[i + 1], z);
          g.fillStyle = STAINS[i + 3] ? 'rgba(120,20,20,0.22)' : 'rgba(0,0,0,0.14)';
          g.beginPath(); g.ellipse(PX, PY, (16 * STAINS[i + 2]) * PS + 2, (4.5 * STAINS[i + 2]) * PS + 1, 0, 0, Math.PI * 2); g.fill();
        }
        const off = (S.T * GV) % 5;
        g.fillStyle = 'rgba(255,255,255,0.55)';
        for (let k = 0; k < 14; k++) {
          const z0 = k * 5 - off, z1 = z0 + 2.2;
          if (z1 < -2 || z0 > ZF) continue;
          for (let side = -1; side <= 1; side += 2) {
            const u = side * 0.34;
            proj(u - 0.012, Math.max(-2, z0)); const ax = PX, ay = PY, as = PS;
            proj(u - 0.012, z1); const bx = PX, by = PY, bs = PS;
            g.beginPath();
            g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(bx + 0.024 * rw * bs, by); g.lineTo(ax + 0.024 * rw * as, ay); g.closePath(); g.fill();
          }
        }
        const off2 = (S.T * GV) % 12;
        for (let k = 0; k < 7; k++) {
          const z = k * 12 - off2 + 3;
          if (z < -1.5 || z > ZF) continue;
          for (let side = -1; side <= 1; side += 2) {
            proj(side * 1.14, z);
            const s = PS, x = PX, y = PY, h = 1.3 * rw * s;
            g.globalAlpha = z > ZF - 12 ? Math.max(0, (ZF - z) / 12) : 1;
            g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(x, y, 8 * s + 1, 3 * s + 1, 0, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#3d4250'; g.fillRect(x - 2.5 * s - 0.5, y - h, 5 * s + 1, h);
            g.fillRect(x - (side > 0 ? 22 * s : 0), y - h, 22 * s + 1, 4 * s + 1);
            g.fillStyle = '#ffe9a0'; g.beginPath(); g.arc(x - side * 20 * s, y - h + 6 * s, 4 * s + 1, 0, Math.PI * 2); g.fill();
            if (k % 3 === 1) {
              proj(side * 1.32, z + 5); const bs = PS;
              g.fillStyle = '#c0392b'; U.rr(g, PX - 9 * bs, PY - 24 * bs, 18 * bs + 1, 24 * bs + 1, 3 * bs + 1); g.fill();
              g.fillStyle = '#e8e8f0'; g.fillRect(PX - 9 * bs, PY - 17 * bs, 18 * bs + 1, 3 * bs + 1);
            }
            g.globalAlpha = 1;
          }
        }
      }

      function drawZombie(g, z) {
        proj(z.u, z.z);
        const x = PX, y = PY, s = PS;
        const R = z.r * rw * s;
        const fade = z.z > ZF - 10 ? Math.max(0, (ZF + 2 - z.z) / 12) : 1;
        g.globalAlpha = fade;
        const wk = Math.sin(anim * (z.boss ? 5 : 8) + z.ph);
        g.fillStyle = 'rgba(0,0,0,0.3)';
        g.beginPath(); g.ellipse(x, y, R * 1.15, R * 0.35, 0, 0, Math.PI * 2); g.fill();
        const by = y - R * 0.15 - Math.abs(wk) * R * 0.08;
        g.fillStyle = '#3b3f52';
        U.rr(g, x - R * 0.55, by - R * 1.05 - wk * R * 0.12, R * 0.42, R * 1.05 + wk * R * 0.12, R * 0.16); g.fill();
        U.rr(g, x + R * 0.13, by - R * 1.05 + wk * R * 0.12, R * 0.42, R * 1.05 - wk * R * 0.12, R * 0.16); g.fill();
        g.fillStyle = z.shirt;
        U.rr(g, x - R * 0.78, by - R * 2.35, R * 1.56, R * 1.45, R * 0.42); g.fill();
        g.fillStyle = 'rgba(0,0,0,0.22)';
        g.beginPath(); g.moveTo(x - R * 0.3, by - R * 0.9); g.lineTo(x - R * 0.1, by - R * 1.3); g.lineTo(x + R * 0.1, by - R * 0.9); g.fill();
        g.fillRect(x - R * 0.78, by - R * 1.6, R * 1.56, R * 0.12);
        g.strokeStyle = z.skin; g.lineCap = 'round'; g.lineWidth = R * 0.36;
        g.beginPath();
        g.moveTo(x - R * 0.7, by - R * 2.1); g.lineTo(x - R * 0.95, by - R * 1.45 + wk * R * 0.15);
        g.moveTo(x + R * 0.7, by - R * 2.1); g.lineTo(x + R * 0.95, by - R * 1.45 - wk * R * 0.15);
        g.stroke();
        g.fillStyle = z.skin;
        g.beginPath(); g.arc(x - R * 0.95, by - R * 1.4 + wk * R * 0.15, R * 0.24, 0, Math.PI * 2); g.arc(x + R * 0.95, by - R * 1.4 - wk * R * 0.15, R * 0.24, 0, Math.PI * 2); g.fill();
        const hx = x + wk * R * 0.05, hyy = by - R * 2.75;
        g.beginPath(); g.arc(hx, hyy, R * 0.62, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(0,0,0,0.16)';
        g.beginPath(); g.arc(hx + R * 0.22, hyy - R * 0.25, R * 0.2, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.18)';
        g.beginPath(); g.arc(hx - R * 0.2, hyy - R * 0.3, R * 0.22, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#ff3b3b';
        g.beginPath(); g.arc(hx - R * 0.22, hyy - R * 0.02, R * 0.12, 0, Math.PI * 2); g.arc(hx + R * 0.22, hyy - R * 0.02, R * 0.12, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#2a1414';
        U.rr(g, hx - R * 0.25, hyy + R * 0.2, R * 0.5, R * 0.18, R * 0.08); g.fill();
        g.fillStyle = '#f2f0dc';
        g.fillRect(hx - R * 0.16, hyy + R * 0.2, R * 0.08, R * 0.08); g.fillRect(hx + R * 0.06, hyy + R * 0.2, R * 0.08, R * 0.08);
        if (z.boss) {
          g.fillStyle = '#f2e6c8';
          g.beginPath();
          g.moveTo(hx - R * 0.45, hyy - R * 0.4); g.lineTo(hx - R * 0.75, hyy - R * 1.0); g.lineTo(hx - R * 0.22, hyy - R * 0.55);
          g.moveTo(hx + R * 0.45, hyy - R * 0.4); g.lineTo(hx + R * 0.75, hyy - R * 1.0); g.lineTo(hx + R * 0.22, hyy - R * 0.55);
          g.fill();
          g.fillStyle = '#5a3a8a';
          g.beginPath(); g.arc(x - R * 0.8, by - R * 2.2, R * 0.3, 0, Math.PI * 2); g.arc(x + R * 0.8, by - R * 2.2, R * 0.3, 0, Math.PI * 2); g.fill();
        }
        if (z.tough) {
          g.fillStyle = '#7a7f8c';
          U.rr(g, hx - R * 0.6, hyy - R * 0.68, R * 1.2, R * 0.4, R * 0.15); g.fill();
        }
        if (z.flash > 0) {
          g.globalAlpha = fade * 0.75;
          g.fillStyle = '#ffffff';
          g.beginPath(); g.arc(hx, hyy, R * 0.66, 0, Math.PI * 2); g.fill();
          U.rr(g, x - R * 0.8, by - R * 2.37, R * 1.6, R * 1.5, R * 0.42); g.fill();
          g.globalAlpha = fade;
        }
        if (!z.boss && fade > 0.2) {
          const ts = Math.max(9, Math.min(18, R * 0.85 + 5));
          const txt = fmt(z.hp);
          const tw = ts * 0.62 * txt.length + 10;
          const ty = hyy - R * 0.62 - ts * 0.75;
          g.fillStyle = 'rgba(20,16,30,0.72)';
          U.rr(g, x - tw / 2, ty - ts * 0.62, tw, ts * 1.24, ts * 0.62); g.fill();
          U.text(g, txt, x, ty + 1, ts, z.tough ? '#ffb04d' : '#ffffff', 'center', 900);
        }
        g.globalAlpha = 1;
      }

      function drawGate(g, gt) {
        proj(gt.u, gt.z);
        const x = PX, y = PY, s = PS;
        const fade = gt.z > ZF - 10 ? Math.max(0, (ZF + 2 - gt.z) / 12) : 1;
        g.globalAlpha = fade;
        const pw = GW * rw * s, ph = 0.62 * rw * s;
        const pop = 1 + gt.pop * 0.06;
        const top = y - ph * pop;
        const base = gt.good ? '#2f8cff' : '#ff3b54';
        g.fillStyle = 'rgba(0,0,0,0.28)';
        g.beginPath(); g.ellipse(x, y, pw * 1.05, 5 * s + 1, 0, 0, Math.PI * 2); g.fill();
        const gr = g.createLinearGradient(0, top, 0, y);
        gr.addColorStop(0, gt.good ? 'rgba(90,180,255,0.85)' : 'rgba(255,100,120,0.85)');
        gr.addColorStop(1, gt.good ? 'rgba(40,110,230,0.55)' : 'rgba(210,40,70,0.55)');
        g.fillStyle = gr;
        g.fillRect(x - pw * pop, top, pw * 2 * pop, ph * pop);
        g.fillStyle = 'rgba(255,255,255,0.18)';
        g.fillRect(x - pw * pop, top, pw * 2 * pop, ph * 0.18);
        if (gt.flash > 0) { g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(x - pw * pop, top, pw * 2 * pop, ph * pop); }
        const pr = Math.max(2, 0.035 * rw * s);
        g.fillStyle = '#e9ecf5';
        U.rr(g, x - pw * pop - pr, top - pr, pr * 2, ph * pop + pr, pr); g.fill();
        U.rr(g, x + pw * pop - pr, top - pr, pr * 2, ph * pop + pr, pr); g.fill();
        g.fillStyle = U.shade(base, -0.35);
        U.rr(g, x - pw * pop - pr, top - pr * 2.2, pw * 2 * pop + pr * 2, pr * 2.2, pr); g.fill();
        if (fade > 0.15) {
          const ls = Math.max(8, Math.min(17, pw * 0.25));
          U.text(g, gt.icon + ' ' + gt.label, x, top + ph * 0.24, ls, '#ffffff', 'center', 900);
          const ns = Math.max(10, Math.min(36, pw * 0.55));
          g.lineWidth = Math.max(2, ns * 0.14); g.strokeStyle = U.shade(base, -0.5); g.lineJoin = 'round';
          g.font = '900 ' + ns + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          const txt = fmt(Math.max(0, gt.hp));
          g.strokeText(txt, x, top + ph * 0.64);
          g.fillStyle = '#ffffff'; g.fillText(txt, x, top + ph * 0.64);
        }
        g.globalAlpha = 1;
      }

      function drawMan(g, m, i) {
        proj(m.u, m.z);
        const x = PX, s = PS;
        const R = 0.085 * rw * s * (1 + m.pop * 0.5 * Math.sin(m.pop * Math.PI));
        const wph = anim * 11 + m.bob;
        const step = Math.sin(wph);
        const y0 = PY;
        const y = PY - Math.abs(Math.cos(wph)) * R * 0.12;
        g.fillStyle = 'rgba(0,0,0,0.3)';
        g.beginPath(); g.ellipse(x, y0, R * 0.75, R * 0.25, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#2c3a24';
        const la = Math.max(0, step) * R * 0.3, lb = Math.max(0, -step) * R * 0.3;
        U.rr(g, x - R * 0.42, y - R * 0.75 - la * 0.4, R * 0.32, R * 0.75 - la * 0.6, R * 0.1); g.fill();
        U.rr(g, x + R * 0.1, y - R * 0.75 - lb * 0.4, R * 0.32, R * 0.75 - lb * 0.6, R * 0.1); g.fill();
        g.fillStyle = '#1c2416';
        U.rr(g, x - R * 0.46, y - R * 0.18 - la, R * 0.4, R * 0.2, R * 0.08); g.fill();
        U.rr(g, x + R * 0.06, y - R * 0.18 - lb, R * 0.4, R * 0.2, R * 0.08); g.fill();
        g.fillStyle = i === 0 ? '#3e6fd8' : '#56753a';
        U.rr(g, x - R * 0.6, y - R * 1.75, R * 1.2, R * 1.1, R * 0.35); g.fill();
        g.fillStyle = i === 0 ? '#2b4f9e' : '#3e5a2a';
        U.rr(g, x - R * 0.38, y - R * 1.65, R * 0.76, R * 0.8, R * 0.18); g.fill();
        const wp = WPN[S.w];
        const gl = R * wp.len, gx = x + R * 0.38, gy = y - R * 1.35;
        g.fillStyle = wp.gun;
        U.rr(g, gx - R * 0.12, gy - gl, R * 0.24, gl, R * 0.08); g.fill();
        if (S.w >= 4) { g.fillStyle = '#d9a43a'; g.fillRect(gx - R * 0.26, gy - gl * 0.45, R * 0.14, R * 0.3); }
        if (S.w === 5) { g.fillStyle = '#ffb6f7'; g.fillRect(gx - R * 0.05, gy - gl, R * 0.1, gl * 0.7); }
        g.fillStyle = '#e8b98a';
        g.beginPath(); g.arc(gx, gy - R * 0.1, R * 0.17, 0, Math.PI * 2); g.fill();
        g.fillStyle = i === 0 ? '#4d86ff' : '#6b8c3e';
        g.beginPath(); g.arc(x, y - R * 2.0, R * 0.5, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.25)';
        g.beginPath(); g.arc(x - R * 0.15, y - R * 2.15, R * 0.2, 0, Math.PI * 2); g.fill();
        if (i === 0) U.text(g, '★', x, y - R * 2.0, R * 0.5, '#ffe27a', 'center', 900);
        if (m.flash > 0) {
          const fy = gy - gl - R * 0.25, fr = R * (0.35 + Math.random() * 0.2);
          g.fillStyle = S.w === 5 ? '#ff9af0' : '#fff2a0';
          g.beginPath();
          for (let k = 0; k < 8; k++) {
            const a = k * Math.PI / 4 - Math.PI / 2, rr = k % 2 ? fr * 0.45 : fr;
            if (k === 0) g.moveTo(gx + Math.cos(a) * rr, fy + Math.sin(a) * rr * 1.5); else g.lineTo(gx + Math.cos(a) * rr, fy + Math.sin(a) * rr * 1.5);
          }
          g.closePath(); g.fill();
        }
      }

      function drawBullets(g) {
        g.lineCap = 'round';
        for (let i = 0; i < bullets.length; i++) {
          const b = bullets[i]; if (!b.on) continue;
          const wp = WPN[b.w];
          proj(b.u, b.z); const x1 = PX, y1 = PY, s = PS;
          const tz = Math.max(-1, b.z - (b.w === 5 ? 4 : 1.8));
          proj(b.u0 + b.du * Math.min(Math.max(0, tz), FAN), tz); const x0 = PX, y0 = PY;
          g.strokeStyle = wp.col; g.globalAlpha = 0.35; g.lineWidth = (b.w === 5 ? 9 : 6) * s + 1;
          g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
          g.globalAlpha = 1; g.strokeStyle = '#fffbe8'; g.lineWidth = (b.w === 5 ? 3.5 : 2.4) * s + 0.6;
          g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        }
      }

      function drawHud(g) {
        const pad = 10;
        const wp = WPN[S.w];
        g.fillStyle = 'rgba(15,12,35,0.55)';
        U.rr(g, pad, pad, 128, 34, 17); g.fill();
        U.text(g, '🔫 ' + wp.name, pad + 12, pad + 17, 15, '#ffe27a', 'left', 900);
        g.fillStyle = 'rgba(15,12,35,0.55)';
        U.rr(g, W - pad - 84, pad, 84, 34, 17); g.fill();
        U.text(g, '👥 ×' + S.men.length, W - pad - 42, pad + 17, 16, '#ffffff', 'center', 900);
        const bw = Math.min(150, W - 260);
        if (ENDLESS) {
          g.fillStyle = 'rgba(15,12,35,0.55)';
          const sw = Math.min(150, W - 240);
          if (sw > 60) {
            U.rr(g, cx - sw / 2, pad, sw, 34, 17); g.fill();
            U.text(g, '💀 ' + S.kills, cx, pad + 11, 15, '#ffffff', 'center', 900);
            U.text(g, '最高 ' + Math.max(api.best || 0, S.kills) + ' · 第 ' + (S.wave + 1) + ' 波', cx, pad + 26, 10, '#ffe27a', 'center', 800);
          }
        } else if (bw > 40) {
          const bx = cx - bw / 2, by = pad + 12;
          for (let w = 0; w < plan.waves; w++) {
            const sw = bw / plan.waves;
            g.fillStyle = w < S.wave ? '#7dffa8' : w === S.wave ? '#ffe27a' : 'rgba(255,255,255,0.25)';
            U.rr(g, bx + w * sw + 2, by, sw - 4, 10, 5); g.fill();
          }
        }
        const d = Math.round(dmg() * 10) / 10, rt = Math.round(rate() * 10) / 10;
        U.text(g, '傷害 ' + d + ' · 射速 ' + rt + '/秒', pad + 6, pad + 46, 11, 'rgba(255,255,255,0.8)', 'left', 700);
        const B = S.bossAlive;
        if (B && !B.dead) {
          const bw2 = W - 60, bx = 30, by = hy - 18;
          g.fillStyle = 'rgba(20,10,20,0.7)'; U.rr(g, bx - 4, by - 4, bw2 + 8, 18, 9); g.fill();
          g.fillStyle = '#ff3b54'; U.rr(g, bx, by, Math.max(4, bw2 * Math.max(0, B.hp) / B.max), 10, 5); g.fill();
          U.text(g, '👹 BOSS ' + fmt(Math.max(0, B.hp)), cx, by - 12, 14, '#ffffff', 'center', 900);
        }
      }

      function draw(g) {
        if (!cache) buildCache();
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        g.fillStyle = '#1f3a1c'; g.fillRect(-20, -20, W + 40, H + 40);
        g.drawImage(cache, 0, 0, W, H);
        roadDecor(g);
        order.length = 0;
        for (let i = 0; i < S.gates.length; i++) order.push(S.gates[i]);
        for (let i = 0; i < S.zs.length; i++) order.push(S.zs[i]);
        order.sort((a, b) => b.z - a.z);
        for (let i = 0; i < order.length; i++) { const o = order[i]; if (o.kind) drawGate(g, o); else drawZombie(g, o); }
        drawBullets(g);
        for (let i = S.men.length - 1; i >= 0; i--) drawMan(g, S.men[i], i);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.5);
          g.fillStyle = p.col;
          if (p.sq) g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          else { g.beginPath(); g.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2); g.fill(); }
        }
        g.globalAlpha = 1;
        for (let i = 0; i < texts.length; i++) {
          const t = texts[i]; if (!t.on) continue;
          const k = t.t / t.max;
          g.globalAlpha = k > 0.6 ? (1 - k) / 0.4 : 1;
          const sc = k < 0.15 ? 0.6 + k / 0.15 * 0.6 : 1.2 - Math.min(0.2, (k - 0.15));
          g.font = '900 ' + (t.size * sc) + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 3; g.strokeStyle = 'rgba(30,10,20,0.8)'; g.strokeText(t.s, t.x, t.y);
          g.fillStyle = t.col; g.fillText(t.s, t.x, t.y);
        }
        g.globalAlpha = 1;
        g.restore();
        drawHud(g);
        for (let i = 0; i < banners.length; i++) {
          const b = banners[i];
          const k = Math.min(1, b.t / 0.35);
          const sc = U.easeOutBack(k);
          const a = b.t > 1.1 ? Math.max(0, 1 - (b.t - 1.1) / 0.3) : 1;
          g.globalAlpha = a;
          const sz = Math.min(b.size, W / 8) * sc;
          const yy = H * 0.36 + i * 46;
          g.font = '900 ' + sz + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 6; g.strokeStyle = 'rgba(20,10,30,0.85)'; g.lineJoin = 'round';
          g.strokeText(b.text, cx, yy);
          g.fillStyle = b.col; g.fillText(b.text, cx, yy);
        }
        g.globalAlpha = 1;
        if (hintT > 0 && !api.ended) {
          g.globalAlpha = Math.min(1, hintT) * (0.6 + 0.4 * Math.sin(anim * 5));
          const hx = cx + Math.sin(anim * 2.5) * 50;
          U.text(g, '👆', hx, H - 34, 30, '#fff', 'center', 900);
          U.text(g, '◀  拖曳移動  ▶', cx, H - 64, 15, '#ffffff', 'center', 900);
          g.globalAlpha = 1;
        }
      }

      function down(x) { if (api.ended) return; drag = { x0: x, u0: S.tu }; hintT = Math.min(hintT, 0.5); }
      function move(x) { if (!drag || api.ended) return; S.tu = drag.u0 + (x - drag.x0) / rw * 1.2; }
      function up() { drag = null; }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _s: S, _k: { ZF, GV, BV, GW, GU, SP, WPN, FAN, plan, rate, dmg, halfWidth, get rw() { return rw; } },
      };
    },
  });
})();
