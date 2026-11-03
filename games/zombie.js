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
  const SHIRTS = ['#7a6aa8', '#b0715a', '#6a8fb0', '#a85a7a', '#5f8f6a', '#8a7f6a'];
  const SKINS = ['#9fdc78', '#8fd16a', '#a8e07e', '#93d86f'];
  const SKIN_DK = { '#9fdc78': '#7cbf58', '#8fd16a': '#6fb44e', '#a8e07e': '#86c45e', '#93d86f': '#72bb50' };
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
    const zs0 = 0.28 + Math.min(0.06, Le * 0.001), zm = [1, 1.6, 2.3][diff];
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
    if (diff > 0) {
      // on 普通/困難 a red gate never sits right in front of a blue one on the same side
      const gl = ev.filter((e) => e.type === 'gate');
      const blocks = (b, side) => gl.some((o) => o !== b && o.good && o.side === side && o.t > b.t - 0.01 && o.t < b.t + 4);
      for (const b of gl) {
        if (b.good || !blocks(b, b.side)) continue;
        if (!blocks(b, -b.side) && !gl.some((o) => o !== b && Math.abs(o.t - b.t) < 0.01 && o.side === -b.side)) b.side = -b.side;
        else b.drop = true;
      }
      for (let i = ev.length - 1; i >= 0; i--) if (ev[i].drop) ev.splice(i, 1);
    }
    const spread = 0.38 + Math.min(0.1, Le * 0.003);
    const spdBase = (4.3 + Math.min(1.6, Le * 0.03)) * [1, 1.08, 1.3][diff];
    const damp = Math.max([0.6, 0.72, 0.9][diff], 1 - Le * 0.008);
    for (let w = 0; w < waves; w++) {
      const tw = t0 + w * WL;
      const zs = zs0 * (1 + (zm - 1) * Math.min(1, w / 2));
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
        S.men.push({ u: fromU, z: 0, cd: (S.men.length * 0.137) % 0.3, flash: 0, pop: 0, bob: Math.random() * 6 });
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
            const gt = gs[j]; if (gt.dead && !(gt.deadT > 0)) continue;
            if (gt.z > z0 - 0.5 && gt.z <= b.z && gt.z < bz && Math.abs(b.u - gt.u) < GW) { bz = gt.z; bo = gt; isG = true; }
          }
          if (!bo) continue;
          if (isG && bo.dead) { b.on = false; continue; }
          if (isG) {
            bo.hp -= b.dmg; bo.flash = 0.06; bo.pop = Math.min(1, bo.pop + 0.25);
            if (hitSnd <= 0) { api.sfx('hit'); hitSnd = 0.08; }
            if (bo.hp <= 0) { bo.dead = true; bo.deadT = 0.35; grant(bo); }
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
          if (gt.dead) gt.deadT -= dt;
          if ((gt.dead && !(gt.deadT > 0)) || gt.z < -1.5) gs.splice(i, 1);
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

      // ---------- drawing (卡通 Q 版) ----------
      function buildCache() {
        const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
        const c = document.createElement('canvas');
        c.width = Math.ceil(W * dpr); c.height = Math.ceil(H * dpr);
        const x = c.getContext('2d');
        x.scale(dpr, dpr);
        x.lineJoin = 'round';
        const q = Math.max(0.55, Math.min(1.25, hy / 125));
        let gr = x.createLinearGradient(0, 0, 0, hy + 4);
        gr.addColorStop(0, '#3b1f2b'); gr.addColorStop(0.45, '#a8432c'); gr.addColorStop(0.8, '#f08a3c'); gr.addColorStop(1, '#f6b45a');
        x.fillStyle = gr; x.fillRect(0, 0, W, hy + 4);
        x.fillStyle = 'rgba(255,220,150,0.9)';
        x.beginPath(); x.arc(cx + W * 0.17, hy - 30 * q, 24 * q, 0, TAU); x.fill();
        const smokeX = [W * 0.14, W * 0.82, W * 0.47];
        for (let i = 0; i < 3; i++) {
          for (let k = 0; k < 8; k++) {
            x.fillStyle = 'rgba(40,25,30,' + (0.32 - k * 0.035) + ')';
            x.beginPath(); x.arc(smokeX[i] + k * 6 * q + Math.sin(k) * 7 * q, hy - 8 * q - k * 14 * q, (9 + k * 4) * q, 0, TAU); x.fill();
          }
        }
        const r = MG.mulberry32(99);
        x.fillStyle = '#7a3e3e';
        for (let bx = -10; bx < W + 10;) {
          const bw = (22 + r() * 30) * q, bh = (18 + r() * 26) * q;
          x.beginPath(); x.moveTo(bx, hy + 2); x.lineTo(bx, hy - bh); x.lineTo(bx + bw * 0.4, hy - bh - 6 * q); x.lineTo(bx + bw * 0.6, hy - bh + 4 * q); x.lineTo(bx + bw, hy - bh - 2 * q); x.lineTo(bx + bw, hy + 2); x.closePath(); x.fill();
          bx += bw + r() * 4;
        }
        const RC = ['#5a3b44', '#6b4550', '#563842', '#6e4a52'];
        const maxH = Math.max(30, hy - 52);
        for (let bx = -14, n = 0; bx < W + 10; n++) {
          const bw = (44 + r() * 46) * q;
          const bh = Math.min(maxH, (34 + r() * 66) * q);
          const near = Math.abs(bx + bw / 2 - cx) < W * 0.12;
          const h = near ? bh * 0.55 : bh;
          const y = hy - h;
          x.beginPath(); x.moveTo(bx, hy + 2); x.lineTo(bx, y + 8 * q); x.lineTo(bx + bw * 0.3, y); x.lineTo(bx + bw * 0.45, y + 14 * q); x.lineTo(bx + bw * 0.7, y + 4 * q); x.lineTo(bx + bw, y + 18 * q); x.lineTo(bx + bw, hy + 2); x.closePath();
          x.fillStyle = RC[n % 4]; x.fill(); x.lineWidth = 2.5 * q; x.strokeStyle = OL; x.stroke();
          for (let wy = y + 22 * q; wy < hy - 8 * q; wy += 16 * q) {
            for (let wx = bx + 7 * q; wx < bx + bw - 10 * q; wx += 13 * q) {
              const lit = r() < 0.16;
              x.fillStyle = lit ? '#ffcf6a' : 'rgba(0,0,0,0.42)';
              x.fillRect(wx, wy, 6 * q, 8 * q);
            }
          }
          bx += bw - 4 * q + r() * 10 * q;
        }
        gr = x.createLinearGradient(0, hy, 0, H);
        gr.addColorStop(0, '#9a6a52'); gr.addColorStop(1, '#6e4a3c');
        x.fillStyle = gr; x.fillRect(0, hy, W, H - hy);
        const sB = (H - hy) / (py - hy) * 1.05;
        const sF = 0.02;
        const quad = (u0, u1, col) => {
          x.fillStyle = col; x.beginPath();
          x.moveTo(cx + u0 * rw * sF, hy + (py - hy) * sF); x.lineTo(cx + u1 * rw * sF, hy + (py - hy) * sF);
          x.lineTo(cx + u1 * rw * sB, hy + (py - hy) * sB); x.lineTo(cx + u0 * rw * sB, hy + (py - hy) * sB); x.closePath(); x.fill();
        };
        const r2 = MG.mulberry32(5);
        for (let i = 0; i < 70; i++) {
          const yy = hy + 6 + r2() * (H - hy), s = (yy - hy) / (py - hy);
          const half = 1.14 * rw * s + 6;
          const xx = r2() * W;
          if (Math.abs(xx - cx) < half) continue;
          const sz = 2 + s * 5 * (0.5 + r2());
          x.fillStyle = r2() < 0.5 ? '#7a5644' : '#b08668';
          x.beginPath(); x.ellipse(xx, yy, sz * 1.4, sz, 0, 0, TAU); x.fill();
          x.lineWidth = Math.max(1, s * 1.6); x.strokeStyle = 'rgba(42,26,20,0.6)'; x.stroke();
        }
        x.strokeStyle = 'rgba(42,20,15,0.45)'; x.lineWidth = 1.5;
        for (let i = 0; i < 14; i++) {
          const yy = hy + 20 + r2() * (H - hy - 20), s = (yy - hy) / (py - hy);
          const xx = r2() < 0.5 ? cx - 1.2 * rw * s - 10 - r2() * 60 : cx + 1.2 * rw * s + 10 + r2() * 60;
          const k = 0.5 + s;
          x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx + 10 * k, yy + 5 * k); x.lineTo(xx + 7 * k, yy + 12 * k); x.lineTo(xx + 18 * k, yy + 16 * k); x.stroke();
        }
        quad(-1.13, 1.13, '#8f8076');
        gr = x.createLinearGradient(0, hy, 0, H);
        gr.addColorStop(0, '#3e3439'); gr.addColorStop(1, '#4d4248');
        quad(-1.0, 1.0, gr);
        x.lineWidth = 3; x.strokeStyle = OL; x.lineCap = 'round';
        x.beginPath();
        for (const u of [-1.13, -1.0, 1.0, 1.13]) {
          x.moveTo(cx + u * rw * sF, hy + (py - hy) * sF); x.lineTo(cx + u * rw * sB, hy + (py - hy) * sB);
        }
        x.stroke();
        gr = x.createLinearGradient(0, hy, 0, hy + (py - hy) * 0.2);
        gr.addColorStop(0, 'rgba(246,160,90,0.7)'); gr.addColorStop(1, 'rgba(246,160,90,0)');
        x.fillStyle = gr; x.fillRect(0, hy, W, (py - hy) * 0.2);
        x.fillStyle = OL; x.fillRect(0, hy - 1, W, 2);
        gr = x.createLinearGradient(0, py - 20, 0, H);
        gr.addColorStop(0, 'rgba(30,15,15,0)'); gr.addColorStop(1, 'rgba(30,15,15,0.3)');
        x.fillStyle = gr; x.fillRect(0, py - 20, W, H - py + 20);
        cache = c; cacheDpr = dpr;
      }

      function drawSmoke(g) {
        const q = Math.max(0.55, Math.min(1.25, hy / 125));
        for (let i = 0; i < 6; i++) {
          const t = (anim * 0.07 + i / 6) % 1;
          const bx = [W * 0.14, W * 0.82, W * 0.47][i % 3];
          g.globalAlpha = 0.22 * Math.sin(t * Math.PI);
          g.fillStyle = '#2e1c22';
          g.beginPath(); g.arc(bx + t * 34 * q + 8 * q, hy - 30 * q - t * (hy - 30 * q) * 0.9, (14 + t * 22) * q, 0, TAU); g.fill();
        }
        g.globalAlpha = 1;
      }

      function drawProp(g, type, x, y, k, side, ph) {
        g.save(); g.translate(x, y); g.scale(k, k);
        g.lineJoin = 'round'; g.strokeStyle = OL;
        g.fillStyle = 'rgba(0,0,0,0.28)';
        g.beginPath(); g.ellipse(0, 0, type === 0 ? 44 : 30, 8, 0, 0, TAU); g.fill();
        if (type === 0) {
          if (side > 0) g.scale(-1, 1);
          rrp(g, -36, -32, 72, 26, 8); fillStroke(g, '#6d7b86', 3);
          rrp(g, -22, -48, 42, 20, 7); fillStroke(g, '#5c6873', 3);
          g.fillStyle = 'rgba(20,20,30,0.7)'; rrp(g, -17, -44, 14, 11, 3); g.fill(); rrp(g, 1, -44, 14, 11, 3); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.25)'; rrp(g, -30, -29, 56, 5, 2.5); g.fill();
          ell(g, -20, -6, 9, 9, '#2d2d33', 3); ell(g, 20, -6, 9, 9, '#2d2d33', 3);
          ell(g, -20, -6, 3.5, 3.5, '#8a8f99', 0); ell(g, 20, -6, 3.5, 3.5, '#8a8f99', 0);
          const fc = ['#ff5a2a', '#ff9a3a', '#ffd25a'];
          for (let f = 0; f < 5; f++) {
            const fx = -18 + f * 9, fh = (24 + (f % 3) * 7) * (0.8 + 0.2 * Math.sin(anim * 13 + f * 2.1 + ph));
            g.fillStyle = fc[f % 3];
            g.beginPath(); g.moveTo(fx - 8, -46); g.quadraticCurveTo(fx + Math.sin(anim * 9 + f) * 3, -46 - fh * 1.6, fx + 8, -46); g.fill();
          }
        } else if (type === 1) {
          g.rotate(side * 0.12);
          rrp(g, -30, -28, 7, 28, 2); fillStroke(g, '#5a4a40', 2.5);
          rrp(g, 23, -28, 7, 28, 2); fillStroke(g, '#5a4a40', 2.5);
          rrp(g, -40, -40, 80, 18, 5); g.fillStyle = '#e8e2d0'; g.fill();
          g.fillStyle = '#e04a3c';
          for (let kx = -34; kx < 34; kx += 17) { g.beginPath(); g.moveTo(kx, -40); g.lineTo(kx + 9, -40); g.lineTo(kx + 2, -22); g.lineTo(kx - 7, -22); g.closePath(); g.fill(); }
          rrp(g, -40, -40, 80, 18, 5); g.lineWidth = 3; g.stroke();
        } else if (type === 2) {
          const sd = side > 0 ? -1 : 1;
          rrp(g, -3.5, -112, 7, 112, 3); fillStroke(g, '#55606e', 2.5);
          g.lineWidth = 7; g.lineCap = 'round'; g.strokeStyle = OL;
          g.beginPath(); g.moveTo(0, -108); g.quadraticCurveTo(sd * 6, -122, sd * 24, -112); g.stroke();
          g.lineWidth = 4; g.strokeStyle = '#55606e';
          g.beginPath(); g.moveTo(0, -108); g.quadraticCurveTo(sd * 6, -122, sd * 24, -112); g.stroke();
          const fl = Math.sin(anim * 23 + ph) > -0.7 ? 1 : 0.25;
          g.fillStyle = 'rgba(255,220,130,' + (0.25 * fl) + ')';
          g.beginPath(); g.arc(sd * 26, -104, 16, 0, TAU); g.fill();
          ell(g, sd * 26, -106, 8, 6, fl > 0.5 ? '#ffe9a0' : '#9a8a60', 2.5);
          rrp(g, -8, -6, 16, 6, 2); fillStroke(g, '#3d4250', 2);
        } else {
          ell(g, -12, -6, 15, 7, '#2d2d33', 2.5); ell(g, -12, -14, 15, 7, '#2d2d33', 2.5); ell(g, -12, -22, 15, 7, '#2d2d33', 2.5);
          ell(g, -12, -22, 7, 3, '#55555f', 0);
          g.beginPath(); g.moveTo(10, 0); g.lineTo(18, -30); g.lineTo(26, 0); g.closePath(); fillStroke(g, '#ff8a2a', 2.5);
          g.fillStyle = '#fffbe8'; g.beginPath(); g.moveTo(14, -15); g.lineTo(22, -15); g.lineTo(23.5, -10); g.lineTo(12.5, -10); g.closePath(); g.fill();
          rrp(g, 6, -3, 24, 4, 2); fillStroke(g, '#ff8a2a', 2);
        }
        g.restore();
      }

      const STAINS = [];
      { const r3 = MG.mulberry32(3); for (let i = 0; i < 18; i++) STAINS.push(r3() * 72, (r3() * 2 - 1) * 0.9, 0.6 + r3() * 1.2, r3() < 0.3 ? 1 : 0); }
      const CRACKS = [];
      { const r4 = MG.mulberry32(11); for (let i = 0; i < 12; i++) CRACKS.push(r4() * 72, (r4() * 2 - 1) * 0.8, 0.7 + r4() * 0.8, r4() < 0.5 ? 1 : -1); }
      const PROP_U = [1.34, 1.24, 1.1, 1.06];
      function roadDecor(g) {
        const scroll = S.T * GV;
        for (let i = 0; i < STAINS.length; i += 4) {
          let z = (STAINS[i] - scroll) % 72; if (z < 0) z += 72; z -= 4;
          if (z > ZF) continue;
          proj(STAINS[i + 1], z);
          g.fillStyle = STAINS[i + 3] ? 'rgba(130,25,25,0.28)' : 'rgba(0,0,0,0.16)';
          g.beginPath(); g.ellipse(PX, PY, (16 * STAINS[i + 2]) * PS + 2, (4.5 * STAINS[i + 2]) * PS + 1, 0, 0, TAU); g.fill();
        }
        g.strokeStyle = 'rgba(20,10,10,0.5)'; g.lineCap = 'round'; g.lineJoin = 'round';
        for (let i = 0; i < CRACKS.length; i += 4) {
          let z = (CRACKS[i] - scroll) % 72; if (z < 0) z += 72; z -= 4;
          if (z > ZF) continue;
          proj(CRACKS[i + 1], z);
          const k = PS * rw * 0.012 * CRACKS[i + 2], d = CRACKS[i + 3];
          g.lineWidth = 1 + PS * 1.4;
          g.beginPath(); g.moveTo(PX, PY); g.lineTo(PX + d * 14 * k, PY + 4 * k); g.lineTo(PX + d * 10 * k, PY + 10 * k); g.lineTo(PX + d * 26 * k, PY + 13 * k);
          g.moveTo(PX + d * 10 * k, PY + 10 * k); g.lineTo(PX + d * 4 * k, PY + 16 * k); g.stroke();
        }
        const off = (S.T * GV) % 5;
        g.fillStyle = 'rgba(255,214,120,0.75)';
        for (let k = 0; k < 14; k++) {
          const z0 = k * 5 - off, z1 = z0 + 2.2;
          if (z1 < -2 || z0 > ZF) continue;
          proj(-0.018, Math.max(-2, z0)); const ax = PX, ay = PY, as = PS;
          proj(-0.018, z1); const bx = PX, by = PY, bs = PS;
          g.beginPath();
          g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(bx + 0.036 * rw * bs, by); g.lineTo(ax + 0.036 * rw * as, ay); g.closePath(); g.fill();
        }
        const off2 = (S.T * GV) % 12;
        for (let k = 6; k >= 0; k--) {
          const z = k * 12 - off2 + 3;
          if (z < -1.5 || z > ZF) continue;
          for (let side = -1; side <= 1; side += 2) {
            const type = (Math.round((S.T * GV + z - 3) / 12) + (side > 0 ? 2 : 0)) & 3;
            proj(side * PROP_U[type], z);
            g.globalAlpha = z > ZF - 12 ? Math.max(0, (ZF - z) / 12) : 1;
            drawProp(g, type, PX, PY, PS * rw * (type === 0 ? 0.0095 : 0.008), side, k * 1.7 + side);
            g.globalAlpha = 1;
          }
        }
      }

      function drawZombie(g, z) {
        proj(z.u, z.z);
        const x = PX, y = PY, s = PS;
        const R = z.r * rw * s;
        const fade = z.z > ZF - 10 ? Math.max(0, (ZF + 2 - z.z) / 12) : 1;
        if (fade <= 0.01) return;
        g.globalAlpha = fade;
        const wk = Math.sin(anim * (z.boss ? 5 : 8) + z.ph);
        const k = R * 0.042;
        const bob = -Math.abs(wk) * 2.5;
        const skin = z.boss ? '#7fc25a' : z.skin;
        const dk = z.boss ? '#5f9a40' : (SKIN_DK[z.skin] || '#6fa84e');
        const shirt = z.boss ? '#6b3448' : z.shirt;
        g.save(); g.translate(x, y - 46 * k); g.scale(k, k);
        g.lineJoin = 'round';
        g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(0, 46, 27, 7, 0, 0, TAU); g.fill();
        ell(g, -9, 37 + wk * 3, 7, 10, '#4b3d5e', 3); ell(g, 9, 37 - wk * 3, 7, 10, '#4b3d5e', 3);
        g.translate(0, bob);
        rrp(g, -17, 4, 34, 32, 10); fillStroke(g, shirt, 3);
        g.fillStyle = 'rgba(0,0,0,0.25)';
        g.beginPath(); g.moveTo(-16, 28); g.lineTo(-10, 35); g.lineTo(-3, 28); g.lineTo(5, 35); g.lineTo(12, 28); g.lineTo(16, 34); g.lineTo(16, 26); g.lineTo(-16, 26); g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.18)'; rrp(g, -12, 8, 10, 14, 5); g.fill();
        if (z.boss) {
          g.fillStyle = '#e8dcc0'; g.strokeStyle = OL; g.lineWidth = 2.5;
          for (let sd = -1; sd <= 1; sd += 2) { g.beginPath(); g.moveTo(sd * 12, 6); g.lineTo(sd * 24, -6); g.lineTo(sd * 20, 10); g.closePath(); g.fill(); g.stroke(); }
        }
        ell(g, -24, 10 + wk * 4, 6, 13, dk, 3); ell(g, 24, 10 - wk * 4, 6, 13, dk, 3);
        if (z.boss) {
          g.fillStyle = '#f2e6c8'; g.strokeStyle = OL; g.lineWidth = 3;
          for (let sd = -1; sd <= 1; sd += 2) {
            g.beginPath(); g.moveTo(sd * 18, -34); g.quadraticCurveTo(sd * 44, -40, sd * 42, -66); g.quadraticCurveTo(sd * 34, -46, sd * 8, -42); g.closePath(); g.fill(); g.stroke();
          }
        }
        ell(g, 0, -18, 28, 26, skin, 3);
        g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.ellipse(-10, -32, 9, 5, -0.4, 0, TAU); g.fill();
        g.fillStyle = dk; g.beginPath(); g.arc(13, -28, 5, 0, TAU); g.arc(-17, -6, 3.5, 0, TAU); g.fill();
        g.strokeStyle = OL; g.lineWidth = 2; g.lineCap = 'round';
        g.beginPath(); g.moveTo(-4, -42); g.lineTo(4, -34); g.moveTo(-3, -36); g.lineTo(0, -41); g.moveTo(1, -35); g.lineTo(4, -40); g.stroke();
        if (z.tough) {
          g.beginPath(); g.arc(0, -24, 29, Math.PI, 0); g.lineTo(32, -20); g.lineTo(-32, -20); g.closePath(); fillStroke(g, '#8a909c', 3);
          g.fillStyle = 'rgba(255,255,255,0.3)'; rrp(g, -18, -44, 22, 6, 3); g.fill();
          g.fillStyle = '#5c6270'; rrp(g, -3, -52, 6, 30, 3); g.fill();
        }
        if (z.boss) {
          g.lineWidth = 3.5; g.strokeStyle = OL;
          g.beginPath(); g.moveTo(-20, -30); g.lineTo(-5, -24); g.moveTo(20, -30); g.lineTo(5, -24); g.stroke();
          ell(g, -10, -15, 8, 8, '#fff0b0', 2); ell(g, 10, -15, 8, 8, '#fff0b0', 2);
          g.fillStyle = '#ff2a2a'; g.beginPath(); g.arc(-9, -14, 4.5, 0, TAU); g.arc(9, -14, 4.5, 0, TAU); g.fill();
          g.fillStyle = OL; rrp(g, -11, -3, 22, 9, 4); g.fill();
          g.fillStyle = '#fff';
          g.beginPath(); g.moveTo(-8, -3); g.lineTo(-5, 3); g.lineTo(-2, -3); g.moveTo(2, -3); g.lineTo(5, 3); g.lineTo(8, -3); g.fill();
          g.beginPath(); g.moveTo(-17, -38); g.lineTo(-20, -60); g.lineTo(-9, -49); g.lineTo(0, -66); g.lineTo(9, -49); g.lineTo(20, -60); g.lineTo(17, -38); g.closePath(); fillStroke(g, '#ffcf3a', 3);
          g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.moveTo(-14, -42); g.lineTo(-15, -52); g.lineTo(-10, -46); g.closePath(); g.fill();
          ell(g, 0, -45, 3.5, 3.5, '#e0365a', 1.5); ell(g, -11, -43, 2.5, 2.5, '#4c9bff', 1.2); ell(g, 11, -43, 2.5, 2.5, '#4cd986', 1.2);
        } else {
          ell(g, -10, -16, 8, 9, '#fffbe8', 2); ell(g, 11, -16, 6, 7, '#fffbe8', 2);
          g.fillStyle = '#d13b3b'; g.beginPath(); g.arc(-9, -15, 3.5, 0, TAU); g.arc(11, -15, 2.5, 0, TAU); g.fill();
          g.fillStyle = '#fff'; g.beginPath(); g.arc(-10.5, -17, 1.3, 0, TAU); g.fill();
          g.fillStyle = OL; rrp(g, -8, -3, 16, 7, 3); g.fill();
          g.fillStyle = '#fff'; g.fillRect(-5, -3, 3, 3); g.fillRect(1, -3, 3, 3);
        }
        if (z.flash > 0) {
          g.globalAlpha = fade * 0.7;
          g.fillStyle = '#ffffff';
          g.beginPath(); g.ellipse(0, -18, 29, 27, 0, 0, TAU); g.fill();
          rrp(g, -18, 3, 36, 34, 10); g.fill();
          g.globalAlpha = fade;
        }
        g.restore();
        if (!z.boss && fade > 0.2) {
          const ts = Math.max(9, Math.min(18, R * 0.85 + 5));
          const txt = fmt(z.hp);
          g.font = '900 ' + ts + 'px ' + FONT;
          const tw = g.measureText(txt).width + ts * 0.9;
          const ty = y - (z.tough ? 102 : 92) * k + bob * k - ts * 0.7;
          rrp(g, x - tw / 2, ty - ts * 0.62, tw, ts * 1.24, ts * 0.62);
          g.fillStyle = 'rgba(42,26,20,0.82)'; g.fill();
          g.lineWidth = Math.max(1, ts * 0.1); g.strokeStyle = z.tough ? '#ffb04d' : 'rgba(255,255,255,0.5)'; g.stroke();
          otext(g, txt, x, ty + 1, ts, z.tough ? '#ffb04d' : '#ffffff', 'center', Math.max(2, ts * 0.2));
        }
        g.globalAlpha = 1;
      }

      function drawGate(g, gt) {
        if (gt.dead) return;
        proj(gt.u, gt.z);
        const x = PX, y = PY, s = PS;
        const fade = gt.z > ZF - 10 ? Math.max(0, (ZF + 2 - gt.z) / 12) : 1;
        if (fade <= 0.01) return;
        const pw = GW * rw * s, ph = 0.62 * rw * s;
        const pop = 1 + gt.pop * 0.06;
        const top = y - ph * pop;
        const col = gt.good ? '#4c9bff' : '#ff5a5a';
        const lw = Math.max(1, pw * 0.075);
        const pr = Math.max(2, pw * 0.09);
        const L = x - pw * pop, Wd = pw * 2 * pop, Hd = ph * pop * 0.86;
        g.globalAlpha = fade;
        g.lineJoin = 'round';
        g.fillStyle = 'rgba(0,0,0,0.28)';
        g.beginPath(); g.ellipse(x, y, pw * 1.1, 5 * s + 1, 0, 0, TAU); g.fill();
        g.globalAlpha = fade * 0.94;
        rrp(g, L, top, Wd, Hd, pw * 0.22); g.fillStyle = col; g.fill();
        g.globalAlpha = fade;
        g.fillStyle = gt.good ? 'rgba(20,60,160,0.25)' : 'rgba(140,20,30,0.25)';
        rrp(g, L, top + Hd * 0.62, Wd, Hd * 0.38, pw * 0.22); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.35)';
        rrp(g, L + pw * 0.15, top + Hd * 0.07, Wd - pw * 0.3, Hd * 0.26, Hd * 0.12); g.fill();
        if (gt.flash > 0) { g.fillStyle = 'rgba(255,255,255,0.5)'; rrp(g, L, top, Wd, Hd, pw * 0.22); g.fill(); }
        rrp(g, L, top, Wd, Hd, pw * 0.22); g.lineWidth = lw * 1.2; g.strokeStyle = OL; g.stroke();
        rrp(g, L - pr, top - pr, pr * 2, y - top + pr, pr); fillStroke(g, '#e8e2d0', lw);
        rrp(g, L + Wd - pr, top - pr, pr * 2, y - top + pr, pr); fillStroke(g, '#e8e2d0', lw);
        ell(g, L, top - pr * 1.2, pr * 1.2, pr * 1.2, gt.good ? '#ffd34a' : '#ff9a3a', lw * 0.8);
        ell(g, L + Wd, top - pr * 1.2, pr * 1.2, pr * 1.2, gt.good ? '#ffd34a' : '#ff9a3a', lw * 0.8);
        if (fade > 0.15) {
          const ls = Math.max(8, Math.min(17, pw * 0.25));
          otext(g, gt.icon + ' ' + gt.label, x, top + Hd * 0.27, ls, '#ffffff', 'center', Math.max(1.5, ls * 0.24));
          const ns = Math.max(10, Math.min(36, pw * 0.55));
          otext(g, fmt(Math.max(0, gt.hp)), x, top + Hd * 0.68, ns, gt.good ? '#ffffff' : '#fff0f0', 'center', Math.max(2, ns * 0.17));
        }
        g.globalAlpha = 1;
      }

      function drawMan(g, m, i) {
        proj(m.u, m.z);
        const x = PX, s = PS;
        const R = 0.085 * rw * s * (1 + m.pop * 0.5 * Math.sin(m.pop * Math.PI));
        const wph = anim * 11 + m.bob;
        const step = Math.sin(wph);
        const lift = Math.abs(Math.cos(wph)) * 2.5;
        const k = R * 0.035;
        const lead = i === 0;
        const uni = lead ? '#4f7fd0' : '#5f8a4a';
        const helm = lead ? '#3e6fd8' : '#4f7a3c';
        const wp = WPN[S.w];
        g.save(); g.translate(x, PY - 44 * k); g.scale(k, k);
        g.lineJoin = 'round'; g.lineCap = 'round';
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(0, 44, 22, 6, 0, 0, TAU); g.fill();
        ell(g, -9, 36 - Math.max(0, step) * 4, 7, 10, '#3a3f52', 3); ell(g, 9, 36 - Math.max(0, -step) * 4, 7, 10, '#3a3f52', 3);
        g.translate(0, -lift);
        ell(g, -20, 14, 6, 10, uni, 3);
        rrp(g, -18, 2, 36, 32, 11); fillStroke(g, uni, 3);
        rrp(g, -14, 6, 28, 19, 6); fillStroke(g, '#8a6a3a', 3);
        g.fillStyle = 'rgba(255,255,255,0.22)'; rrp(g, -11, 8, 22, 5, 2.5); g.fill();
        g.strokeStyle = OL; g.lineWidth = 2; g.beginPath(); g.moveTo(-14, 14); g.lineTo(14, 14); g.stroke();
        ell(g, -24, -16, 4.5, 6.5, '#f2c9a0', 2.5);
        ell(g, 0, -20, 26, 24, '#f2c9a0', 3);
        g.beginPath(); g.arc(0, -24, 27, Math.PI, 0); g.lineTo(29, -17); g.lineTo(-29, -17); g.closePath(); fillStroke(g, helm, 3);
        g.fillStyle = 'rgba(255,255,255,0.28)'; g.beginPath(); g.ellipse(-10, -40, 9, 4.5, -0.45, 0, TAU); g.fill();
        star(g, 0, -31, lead ? 9 : 7); fillStroke(g, '#ffd34a', 1.8);
        const L = 40 * wp.len, gtop = 16 - L;
        rrp(g, 13, gtop, 10, L, 3); fillStroke(g, wp.gun, 3);
        g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(15, gtop + 3, 2.5, L - 6);
        if (S.w >= 4 && S.w < 5) { rrp(g, 22, gtop + L * 0.45, 7, 12, 2); fillStroke(g, '#d9a43a', 2); }
        if (S.w === 5) { g.fillStyle = '#ffb6f7'; g.fillRect(16.5, gtop + 2, 3, L * 0.7); }
        ell(g, 19, 8, 6, 9, uni, 3);
        ell(g, 18, 0, 5.5, 5.5, '#f2c9a0', 2.5);
        if (m.flash > 0) {
          const fy = gtop - 9, fr = 9 + Math.random() * 5;
          star(g, 18, fy, fr); fillStroke(g, S.w === 5 ? '#ff9af0' : '#fff2a0', 2);
          g.fillStyle = '#ffffff'; g.beginPath(); g.arc(18, fy, fr * 0.3, 0, TAU); g.fill();
        }
        g.restore();
      }

      function drawBullets(g) {
        g.lineCap = 'round';
        for (let i = 0; i < bullets.length; i++) {
          const b = bullets[i]; if (!b.on) continue;
          const wp = WPN[b.w];
          proj(b.u, b.z); const x1 = PX, y1 = PY, s = PS;
          const tz = Math.max(-1, b.z - (b.w === 5 ? 4 : 1.5));
          proj(b.u0 + b.du * Math.min(Math.max(0, tz), FAN), tz); const x0 = PX, y0 = PY;
          const wd = (b.w === 5 ? 6 : 4.5) * s + 1.2;
          g.strokeStyle = OL; g.lineWidth = wd + 2.2;
          g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
          g.strokeStyle = wp.col; g.lineWidth = wd;
          g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        }
      }

      function pill(g, x, y, w, h) {
        rrp(g, x, y, w, h, h / 2); g.fillStyle = 'rgba(42,26,20,0.8)'; g.fill();
        g.lineWidth = 2; g.strokeStyle = 'rgba(255,214,150,0.35)'; g.stroke();
      }

      function drawHud(g) {
        const pad = 10;
        const wp = WPN[S.w];
        pill(g, pad, pad, 128, 34);
        otext(g, '🔫 ' + wp.name, pad + 12, pad + 17, 15, '#ffe27a', 'left', 3);
        pill(g, W - pad - 84, pad, 84, 34);
        otext(g, '👥 ×' + S.men.length, W - pad - 42, pad + 17, 16, '#ffffff', 'center', 3);
        const bw = Math.min(150, W - 260);
        if (ENDLESS) {
          const sw = Math.min(150, W - 240);
          if (sw > 60) {
            pill(g, cx - sw / 2, pad, sw, 34);
            otext(g, '💀 ' + S.kills, cx, pad + 11, 15, '#ffffff', 'center', 3);
            otext(g, '最高 ' + Math.max(api.best || 0, S.kills) + ' · 第 ' + (S.wave + 1) + ' 波', cx, pad + 26, 10, '#ffe27a', 'center', 2.5);
          }
        } else if (bw > 40) {
          const bx = cx - bw / 2, by = pad + 11;
          for (let w = 0; w < plan.waves; w++) {
            const sw = bw / plan.waves;
            rrp(g, bx + w * sw + 2, by, sw - 4, 12, 6);
            g.fillStyle = w < S.wave ? '#7dffa8' : w === S.wave ? '#ffe27a' : 'rgba(255,255,255,0.3)'; g.fill();
            g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
          }
        }
        const d = Math.round(dmg() * 10) / 10, rt = Math.round(rate() * 10) / 10;
        g.font = '800 11px ' + FONT; g.textAlign = 'left'; g.textBaseline = 'middle';
        g.lineWidth = 3; g.lineJoin = 'round'; g.strokeStyle = 'rgba(42,26,20,0.85)';
        g.strokeText('傷害 ' + d + ' · 射速 ' + rt + '/秒', pad + 6, pad + 46);
        g.fillStyle = '#fff3dc'; g.fillText('傷害 ' + d + ' · 射速 ' + rt + '/秒', pad + 6, pad + 46);
        const B = S.bossAlive;
        if (B && !B.dead) {
          const bw2 = W - 60, bx = 30, by = hy - 18;
          rrp(g, bx - 4, by - 4, bw2 + 8, 18, 9); g.fillStyle = 'rgba(42,26,20,0.85)'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
          rrp(g, bx, by, Math.max(4, bw2 * Math.max(0, B.hp) / B.max), 10, 5); g.fillStyle = '#ff5d6c'; g.fill();
          g.fillStyle = 'rgba(255,255,255,0.35)'; rrp(g, bx + 3, by + 1.5, Math.max(2, bw2 * Math.max(0, B.hp) / B.max - 6), 3, 1.5); g.fill();
          otext(g, '👑 BOSS ' + fmt(Math.max(0, B.hp)), cx, by - 13, 14, '#ffffff', 'center', 3.5);
        }
      }

      function draw(g) {
        if (!cache) buildCache();
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        g.fillStyle = '#6e4a3c'; g.fillRect(-20, -20, W + 40, H + 40);
        g.drawImage(cache, 0, 0, W, H);
        drawSmoke(g);
        roadDecor(g);
        order.length = 0;
        for (let i = 0; i < S.gates.length; i++) order.push(S.gates[i]);
        for (let i = 0; i < S.zs.length; i++) order.push(S.zs[i]);
        order.sort((a, b) => b.z - a.z);
        for (let i = 0; i < order.length; i++) { const o = order[i]; if (o.kind) drawGate(g, o); else drawZombie(g, o); }
        drawBullets(g);
        const nm = S.men.length;
        for (let r0 = 0; r0 < nm; r0 += 5) {
          for (let i = Math.min(nm, r0 + 5) - 1; i >= r0; i--) drawMan(g, S.men[i], i);
        }
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.5);
          g.fillStyle = p.col;
          if (p.sq) g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          else { g.beginPath(); g.arc(p.x, p.y, p.size / 2, 0, TAU); g.fill(); }
        }
        g.globalAlpha = 1;
        for (let i = 0; i < texts.length; i++) {
          const t = texts[i]; if (!t.on) continue;
          const k = t.t / t.max;
          g.globalAlpha = k > 0.6 ? (1 - k) / 0.4 : 1;
          const sc = k < 0.15 ? 0.6 + k / 0.15 * 0.6 : 1.2 - Math.min(0.2, (k - 0.15));
          otext(g, t.s, t.x, t.y, t.size * sc, t.col, 'center', Math.max(2.5, t.size * sc * 0.2));
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
          otext(g, b.text, cx, yy, sz, b.col, 'center', Math.max(3, sz * 0.2));
        }
        g.globalAlpha = 1;
        if (hintT > 0 && !api.ended) {
          g.globalAlpha = Math.min(1, hintT) * (0.6 + 0.4 * Math.sin(anim * 5));
          const hx = cx + Math.sin(anim * 2.5) * 50;
          U.text(g, '👆', hx, H - 34, 30, '#fff', 'center', 900);
          otext(g, '◀  拖曳移動  ▶', cx, H - 64, 15, '#ffffff', 'center', 3.5);
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
