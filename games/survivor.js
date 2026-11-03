// 割草倖存者 — Vampire-Survivors style: drag anywhere for a virtual joystick, weapons fire on their own.
// Swarms grow every second; kill them for XP gems, level up and pick 1 of 3 upgrades. Survive the timer.
(function () {
  'use strict';
  const U = MG.util;
  const FONT = '-apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
  const MAXE = 640, MAXG = 360, MAXB = 160;
  const CELL = 40, GN = 40;          // spatial grid: GN x GN cells of CELL world px around the hero
  const HERO_R = 12;

  // ---------- enemy types ----------
  const ETYPES = [
    { name: 'slime', hp: 1, spd: 40, r: 11, dmg: 6, xp: 1, col: '#6fd14a' },
    { name: 'bat', hp: 0.6, spd: 66, r: 9, dmg: 4, xp: 1, col: '#8a5ad8' },
    { name: 'skull', hp: 2.4, spd: 46, r: 12, dmg: 8, xp: 2, col: '#e8e4d8' },
    { name: 'ghost', hp: 1.8, spd: 56, r: 12, dmg: 7, xp: 2, col: '#9ad8ff' },
    { name: 'golem', hp: 7, spd: 32, r: 17, dmg: 13, xp: 4, col: '#a0785a' },
  ];
  // ---------- upgrades ----------
  const ITEMS = {
    bolt: { name: '魔法彈', icon: '🔮', weapon: true, desc: ['自動射向最近的敵人', '傷害提升', '多一發', '穿透 +1', '多一發、射更快'] },
    orbit: { name: '旋轉刀刃', icon: '🌀', weapon: true, desc: ['刀刃環繞身邊', '多一把刀刃', '傷害提升', '多一把、轉更快', '多一把刀刃'] },
    lightning: { name: '閃電', icon: '⚡', weapon: true, desc: ['隨機劈中敵人', '多劈一道', '傷害提升', '多劈一道', '更頻繁'] },
    fire: { name: '火球', icon: '🔥', weapon: true, desc: ['爆炸範圍傷害', '爆炸變大', '傷害提升', '多一顆', '爆炸更大'] },
    garlic: { name: '大蒜光環', icon: '🧄', weapon: true, desc: ['持續傷害並擊退', '範圍變大', '傷害提升', '範圍變大', '傷害大增'] },
    boomer: { name: '迴力鏢', icon: '🪃', weapon: true, desc: ['來回穿透敵人', '傷害提升', '多一支', '飛更遠', '多一支'] },
    speed: { name: '疾風靴', icon: '👟', desc: ['移動速度 +12%'] },
    maxhp: { name: '強壯', icon: '❤️', desc: ['最大生命 +25 並回血'] },
    might: { name: '力量', icon: '💪', desc: ['所有傷害 +15%'] },
    haste: { name: '急速', icon: '⏳', desc: ['武器冷卻 -8%'] },
    magnet: { name: '磁鐵', icon: '🧲', desc: ['拾取範圍 +40%'] },
    regen: { name: '再生', icon: '💚', desc: ['每秒回血 +0.7'] },
  };
  const WEAPONS = ['bolt', 'orbit', 'lightning', 'fire', 'garlic', 'boomer'];
  const PASSIVES = ['speed', 'maxhp', 'might', 'haste', 'magnet', 'regen'];
  const MAXLV = 5;

  // ---------- art: hero / enemies / ground (cached sprites) ----------
  function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function drawEnemyShape(g, t, r, flash) {
    const T = ETYPES[t];
    const col = flash ? '#ffffff' : T.col;
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(0, r * 0.85, r * 0.9, r * 0.32, 0, 0, 6.283); g.fill();
    if (t === 0) {
      const gr = g.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r * 1.2);
      gr.addColorStop(0, flash ? '#fff' : U.shade(col, 0.35)); gr.addColorStop(1, flash ? '#ddd' : U.shade(col, -0.25));
      g.fillStyle = gr; g.beginPath(); g.ellipse(0, r * 0.1, r, r * 0.85, 0, 0, 6.283); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(-r * 0.35, -r * 0.3, r * 0.22, r * 0.13, -0.5, 0, 6.283); g.fill();
    } else if (t === 1) {
      g.fillStyle = flash ? '#eee' : U.shade(col, -0.2);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-r * 1.5, -r * 1.1, -r * 2, r * 0.1); g.quadraticCurveTo(-r * 1.2, -r * 0.1, 0, r * 0.4);
      g.moveTo(0, 0); g.quadraticCurveTo(r * 1.5, -r * 1.1, r * 2, r * 0.1); g.quadraticCurveTo(r * 1.2, -r * 0.1, 0, r * 0.4); g.fill();
      g.fillStyle = col; g.beginPath(); g.arc(0, 0, r * 0.75, 0, 6.283); g.fill();
      g.beginPath(); g.moveTo(-r * 0.5, -r * 0.4); g.lineTo(-r * 0.35, -r * 1.05); g.lineTo(-r * 0.1, -r * 0.6); g.moveTo(r * 0.5, -r * 0.4); g.lineTo(r * 0.35, -r * 1.05); g.lineTo(r * 0.1, -r * 0.6); g.fill();
    } else if (t === 2) {
      g.fillStyle = col; g.beginPath(); g.arc(0, -r * 0.15, r * 0.85, 0, 6.283); g.fill();
      g.fillRect(-r * 0.5, r * 0.4, r, r * 0.45);
      if (!flash) { g.fillStyle = '#2a2030'; g.beginPath(); g.arc(-r * 0.32, -r * 0.15, r * 0.24, 0, 6.283); g.arc(r * 0.32, -r * 0.15, r * 0.24, 0, 6.283); g.fill();
        g.fillStyle = '#ff4d4d'; g.beginPath(); g.arc(-r * 0.32, -r * 0.12, r * 0.09, 0, 6.283); g.arc(r * 0.32, -r * 0.12, r * 0.09, 0, 6.283); g.fill();
        g.fillStyle = '#2a2030'; for (let i = -1; i <= 1; i++) g.fillRect(i * r * 0.25 - r * 0.06, r * 0.45, r * 0.12, r * 0.3); }
    } else if (t === 3) {
      g.globalAlpha *= 0.85;
      g.fillStyle = col; g.beginPath(); g.arc(0, -r * 0.2, r * 0.85, Math.PI, 0);
      g.lineTo(r * 0.85, r * 0.7); for (let i = 0; i < 4; i++) g.lineTo(r * 0.85 - (i + 0.5) * r * 0.425, r * (i % 2 ? 0.7 : 0.4)); g.lineTo(-r * 0.85, r * 0.7); g.closePath(); g.fill();
      if (!flash) { g.fillStyle = '#1a2a4a'; g.beginPath(); g.ellipse(-r * 0.3, -r * 0.25, r * 0.14, r * 0.22, 0, 0, 6.283); g.ellipse(r * 0.3, -r * 0.25, r * 0.14, r * 0.22, 0, 0, 6.283); g.fill(); }
    } else {
      g.fillStyle = flash ? '#fff' : U.shade(col, -0.2); g.fillRect(-r * 0.7, r * 0.2, r * 0.45, r * 0.6); g.fillRect(r * 0.25, r * 0.2, r * 0.45, r * 0.6);
      const gr = g.createLinearGradient(-r, -r, r, r);
      gr.addColorStop(0, flash ? '#fff' : U.shade(col, 0.2)); gr.addColorStop(1, flash ? '#ddd' : U.shade(col, -0.3));
      g.fillStyle = gr; U.rr(g, -r * 0.95, -r * 0.9, r * 1.9, r * 1.35, r * 0.35); g.fill();
      if (!flash) { g.fillStyle = '#ffcc4d'; g.beginPath(); g.arc(-r * 0.35, -r * 0.4, r * 0.13, 0, 6.283); g.arc(r * 0.35, -r * 0.4, r * 0.13, 0, 6.283); g.fill();
        g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(-r * 0.6, -r * 0.05, r * 1.2, r * 0.12); }
    }
    if (!flash && (t === 0 || t === 1)) {
      g.fillStyle = '#fff'; g.beginPath(); g.arc(-r * 0.28, -r * 0.08, r * 0.2, 0, 6.283); g.arc(r * 0.28, -r * 0.08, r * 0.2, 0, 6.283); g.fill();
      g.fillStyle = '#1a1020'; g.beginPath(); g.arc(-r * 0.25, -r * 0.03, r * 0.1, 0, 6.283); g.arc(r * 0.25, -r * 0.03, r * 0.1, 0, 6.283); g.fill();
    }
  }
  function buildEnemySprites() {
    const out = [];
    for (let t = 0; t < ETYPES.length; t++) {
      const r = ETYPES[t].r, S = 2, size = Math.ceil(r * 4.4) * S;
      const pair = [];
      for (let f = 0; f < 2; f++) {
        const c = makeCanvas(size, size), g = c.getContext('2d');
        g.scale(S, S); g.translate(size / S / 2, size / S / 2);
        drawEnemyShape(g, t, r, f === 1);
        pair.push(c);
      }
      out.push({ img: pair[0], flash: pair[1], size: size / S });
    }
    return out;
  }
  function drawBoss(g, x, y, r, t, flash) {
    const wob = Math.sin(t * 4) * r * 0.04;
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(x, y + r * 0.9, r, r * 0.3, 0, 0, 6.283); g.fill();
    g.fillStyle = flash ? '#fff' : '#5a1a2a';
    g.beginPath(); g.moveTo(x - r * 0.9, y - r * 0.2); g.quadraticCurveTo(x - r * 2.0, y - r * 1.2 + wob, x - r * 1.9, y + r * 0.3); g.quadraticCurveTo(x - r * 1.3, y, x - r * 0.8, y + r * 0.3); g.fill();
    g.beginPath(); g.moveTo(x + r * 0.9, y - r * 0.2); g.quadraticCurveTo(x + r * 2.0, y - r * 1.2 + wob, x + r * 1.9, y + r * 0.3); g.quadraticCurveTo(x + r * 1.3, y, x + r * 0.8, y + r * 0.3); g.fill();
    const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r * 1.1);
    gr.addColorStop(0, flash ? '#fff' : '#d8404a'); gr.addColorStop(1, flash ? '#ddd' : '#7a1a2a');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    g.fillStyle = '#f2e6c8';
    g.beginPath(); g.moveTo(x - r * 0.5, y - r * 0.7); g.lineTo(x - r * 0.85, y - r * 1.4); g.lineTo(x - r * 0.2, y - r * 0.9);
    g.moveTo(x + r * 0.5, y - r * 0.7); g.lineTo(x + r * 0.85, y - r * 1.4); g.lineTo(x + r * 0.2, y - r * 0.9); g.fill();
    g.fillStyle = '#ffe27a'; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.15, r * 0.16, 0, 6.283); g.arc(x + r * 0.35, y - r * 0.15, r * 0.16, 0, 6.283); g.fill();
    g.fillStyle = '#2a0a10'; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.12, r * 0.07, 0, 6.283); g.arc(x + r * 0.35, y - r * 0.12, r * 0.07, 0, 6.283); g.fill();
    g.fillStyle = '#2a0a10'; U.rr(g, x - r * 0.4, y + r * 0.3, r * 0.8, r * 0.25, r * 0.1); g.fill();
    g.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x - r * 0.35 + i * r * 0.2, y + r * 0.3); g.lineTo(x - r * 0.28 + i * r * 0.2, y + r * 0.45); g.lineTo(x - r * 0.21 + i * r * 0.2, y + r * 0.3); g.fill(); }
  }
  function drawHero(g, x, y, t, face, moving, hurt) {
    const bob = moving ? Math.abs(Math.sin(t * 12)) * 2.5 : Math.sin(t * 3) * 0.8;
    const r = HERO_R;
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(x, y + r * 1.0, r * 0.95, r * 0.32, 0, 0, 6.283); g.fill();
    const step = moving ? Math.sin(t * 12) * 3 : 0;
    g.fillStyle = '#3a3048'; U.rr(g, x - 7, y + 3 + step * 0.3, 5, 9 - step * 0.3, 2); g.fill(); U.rr(g, x + 2, y + 3 - step * 0.3, 5, 9 + step * 0.3, 2); g.fill();
    // cape
    g.fillStyle = '#c8304f';
    g.beginPath(); g.moveTo(x - 8, y - 8 - bob); g.quadraticCurveTo(x - 13 * face - 2, y + 4 - bob, x - 10 * face, y + 10 - bob + Math.sin(t * 10) * 2); g.lineTo(x + 6, y + 6 - bob); g.closePath(); g.fill();
    const gr = g.createLinearGradient(x, y - 10, x, y + 6);
    gr.addColorStop(0, hurt ? '#ffffff' : '#7d8cff'); gr.addColorStop(1, hurt ? '#ffd0d0' : '#4a58c8');
    g.fillStyle = gr; U.rr(g, x - 9, y - 9 - bob, 18, 15, 6); g.fill();
    g.fillStyle = '#ffcc4d'; g.fillRect(x - 9, y - 1 - bob, 18, 2.5);
    g.fillStyle = '#ffd9b0'; g.beginPath(); g.arc(x, y - 15 - bob, 8, 0, 6.283); g.fill();
    g.fillStyle = '#5a3a2a'; g.beginPath(); g.arc(x, y - 17 - bob, 8.3, Math.PI * 1.05, Math.PI * 1.95); g.fill();
    g.fillStyle = '#c8d0e4'; g.beginPath(); g.arc(x, y - 18 - bob, 8.6, Math.PI, 0); g.fill();
    g.fillStyle = '#ffcc4d'; g.fillRect(x - 1, y - 28 - bob, 2, 4);
    g.fillStyle = '#1a1030'; g.beginPath(); g.arc(x - 3 + face * 1.5, y - 14 - bob, 1.3, 0, 6.283); g.arc(x + 3 + face * 1.5, y - 14 - bob, 1.3, 0, 6.283); g.fill();
    g.strokeStyle = '#e8ecf5'; g.lineWidth = 2.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x + 9 * face, y - 2 - bob); g.lineTo(x + 15 * face, y - 14 - bob); g.stroke();
    g.fillStyle = '#ffcc4d'; g.fillRect(x + 7 * face - 2, y - 3 - bob, 4, 2.5);
  }
  function buildGroundTile() {
    const S = 256, c = makeCanvas(S, S), g = c.getContext('2d');
    g.fillStyle = '#5fa04a'; g.fillRect(0, 0, S, S);
    const r = MG.mulberry32(77);
    for (let i = 0; i < 26; i++) { g.fillStyle = r() < 0.5 ? 'rgba(80,150,60,0.6)' : 'rgba(110,180,80,0.5)'; g.beginPath(); g.ellipse(r() * S, r() * S, 10 + r() * 26, 6 + r() * 14, r() * 3, 0, 6.283); g.fill(); }
    g.strokeStyle = 'rgba(40,100,40,0.7)'; g.lineWidth = 1.6;
    for (let i = 0; i < 40; i++) { const x = r() * S, y = r() * S; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y - 6); g.moveTo(x, y); g.lineTo(x + 1, y - 7); g.moveTo(x, y); g.lineTo(x + 3, y - 5); g.stroke(); }
    for (let i = 0; i < 10; i++) {
      const x = 8 + r() * (S - 16), y = 8 + r() * (S - 16);
      g.fillStyle = ['#ff7ac8', '#ffe27a', '#ffffff', '#9ad8ff'][Math.floor(r() * 4)];
      for (let p = 0; p < 5; p++) { const a = p * 1.2566; g.beginPath(); g.arc(x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6, 2, 0, 6.283); g.fill(); }
      g.fillStyle = '#ffcc4d'; g.beginPath(); g.arc(x, y, 1.5, 0, 6.283); g.fill();
    }
    for (let i = 0; i < 3; i++) { const x = r() * S, y = r() * S; g.fillStyle = '#8a8f9c'; g.beginPath(); g.ellipse(x, y, 6, 4, 0, 0, 6.283); g.fill(); g.fillStyle = '#b4b9c4'; g.beginPath(); g.ellipse(x - 1, y - 1, 4, 2.4, 0, 0, 6.283); g.fill(); }
    return c;
  }

  function params(L, diff, endless) {
    const lv = L - 1;
    if (endless) return { dur: 1e9, dens: 1.25, hp: 1.15, spd: 1.08, ramp: 1, bossAt: [60] };
    return [
      { dur: Math.min(150, 60 + lv * 5), dens: 0.6 + Math.min(0.5, lv * 0.02), hp: 0.8 + Math.min(0.3, lv * 0.01), spd: 0.95, ramp: 0.7 },
      { dur: Math.min(210, 90 + lv * 5), dens: 1.25 + Math.min(0.6, lv * 0.02), hp: 0.95 + Math.min(0.4, lv * 0.012), spd: 1.06, ramp: 0.85 },
      { dur: Math.min(240, 120 + lv * 4), dens: 2.25 + Math.min(0.5, lv * 0.015), hp: 1.1 + Math.min(0.5, lv * 0.012), spd: 1.2, ramp: 1 },
    ][diff];
  }

  MG.register({
    id: 'survivor', name: '割草倖存者', icon: '⚔️', color: '#b26bff', endless: true,
    create(api) {
      const L = api.level, DIFF = api.diff || 0, ENDLESS = !!api.endless, rng = api.rng;
      const P = params(L, DIFF, ENDLESS);
      let W = api.W, H = api.H, sc = 1;
      function layout() { W = api.W; H = api.H; sc = U.clamp(Math.min(W / 390, H / 700), 0.8, 1.5); }
      layout();
      let sprites = null, tile = null, tilePat = null;

      // enemies (structure of arrays)
      const ex = new Float32Array(MAXE), ey = new Float32Array(MAXE), ekx = new Float32Array(MAXE), eky = new Float32Array(MAXE);
      const ehp = new Float32Array(MAXE), emax = new Float32Array(MAXE), espd = new Float32Array(MAXE), er = new Float32Array(MAXE), edmg = new Float32Array(MAXE);
      const etype = new Uint8Array(MAXE), eon = new Uint8Array(MAXE), eelite = new Uint8Array(MAXE), eflash = new Float32Array(MAXE);
      const eorb = new Float32Array(MAXE), eaura = new Float32Array(MAXE), eboom = new Float32Array(MAXE);
      let eCount = 0;
      const free = []; for (let i = MAXE - 1; i >= 0; i--) free.push(i);
      // spatial grid
      const head = new Int32Array(GN * GN), next = new Int32Array(MAXE);
      let gox = 0, goy = 0;
      // gems
      const gx = new Float32Array(MAXG), gy = new Float32Array(MAXG), gv = new Float32Array(MAXG), gon = new Uint8Array(MAXG), gfly = new Uint8Array(MAXG), gk = new Uint8Array(MAXG);
      let gCur = 0;
      // projectiles
      const bx = new Float32Array(MAXB), by = new Float32Array(MAXB), bvx = new Float32Array(MAXB), bvy = new Float32Array(MAXB), bdmg = new Float32Array(MAXB),
        blife = new Float32Array(MAXB), bpierce = new Int8Array(MAXB), bkind = new Uint8Array(MAXB), bon = new Uint8Array(MAXB), bt = new Float32Array(MAXB), bhit = new Int32Array(MAXB * 4);
      let bCur = 0;

      const S = {
        T: 0, hx: 0, hy: 0, hp: 100, maxhp: 100, iframe: 0, xp: 0, lvl: 1, need: 5, kills: 0, over: false, face: 1, moving: false,
        items: { bolt: 1 }, pendingUps: 0, choosing: null, chooseT: 0, spawnAcc: 0, boss: -1, bossDone: false, nextElite: 40, bossT: 0,
        regenAcc: 0, orbA: 0, cds: {}, won: false, chests: [], heals: [],
      };
      let anim = 0, shake = 0, lastInfo = '', joy = null, hintT = 5, hurtT = 0, pickSnd = 0, hitSnd = 0, flash = 0;
      const banners = [];
      function banner(text, col, size) { banners.push({ text, col, size: size || 34, t: 0 }); if (banners.length > 3) banners.shift(); }
      const parts = []; for (let i = 0; i < 300; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 3 });
      let pCur = 0;
      const texts = []; for (let i = 0; i < 50; i++) texts.push({ on: false, x: 0, y: 0, t: 0, s: '', col: '#fff', size: 12, max: 0.6 });
      let tCur = 0;
      const bolts = []; for (let i = 0; i < 16; i++) bolts.push({ on: false, x: 0, y: 0, t: 0 });
      const booms = []; for (let i = 0; i < 16; i++) booms.push({ on: false, x: 0, y: 0, r: 0, t: 0 });
      function addPart(x, y, vx, vy, life, col, size) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size;
      }
      function addText(x, y, s, col, size) {
        const t = texts[tCur]; tCur = (tCur + 1) % texts.length;
        t.on = true; t.x = x; t.y = y; t.s = s; t.col = col; t.size = size; t.t = 0; t.max = 0.55;
      }

      // ---------- stats ----------
      function lv(k) { return S.items[k] || 0; }
      function might() { return 1 + 0.15 * lv('might'); }
      function haste() { return 1 - 0.08 * lv('haste'); }
      function heroSpd() { return 128 * (1 + 0.12 * lv('speed')); }
      function pickR() { return 64 * (1 + 0.4 * lv('magnet')); }
      function needFor(l) { return Math.floor(4 + 2.5 * (l - 1) + 0.06 * l * l); }
      function viewR() { return Math.hypot(W, H) / 2 / sc + 40; }

      // ---------- spawning ----------
      function spawnEnemy(t, x, y, elite) {
        if (!free.length) return -1;
        const i = free.pop();
        const T = ETYPES[t];
        const time = S.T;
        const grow = 1 + time / 90 * P.ramp + (ENDLESS ? Math.pow(time / 150, 2) : 0);
        eon[i] = 1; etype[i] = t; eelite[i] = elite ? 1 : 0;
        ex[i] = x; ey[i] = y; ekx[i] = 0; eky[i] = 0;
        ehp[i] = emax[i] = T.hp * 10 * P.hp * grow * (elite ? 14 : 1);
        espd[i] = T.spd * P.spd * (ENDLESS ? 1 + time / 300 : 1 + Math.min(0.3, time / 400)) * (elite ? 0.85 : 1) * (0.92 + rng() * 0.16);
        er[i] = T.r * (elite ? 1.7 : 1); edmg[i] = T.dmg * (1 + time / 200) * (elite ? 1.6 : 1);
        eflash[i] = 0; eorb[i] = 0; eaura[i] = 0; eboom[i] = 0;
        eCount++;
        return i;
      }
      function spawnBoss() {
        const a = rng() * 6.283, R = viewR();
        const i = spawnEnemy(4, S.hx + Math.cos(a) * R, S.hy + Math.sin(a) * R, true);
        if (i < 0) return;
        ehp[i] = emax[i] = 10 * P.hp * (ENDLESS ? 160 + S.T * 3 : 150 + S.T * 2.2) * (1 + DIFF * 0.3);
        er[i] = 34; espd[i] = 44 * P.spd; edmg[i] = 22 * (1 + S.T / 200);
        S.boss = i;
        banner('BOSS 出現！', '#ff5d6c', 40); shake = 10; api.sfx('bad');
      }
      function typeAt(time) {
        const r = rng();
        const f = time / 60;
        if (f > 2.2 && r < 0.12) return 4;
        if (f > 1.4 && r < 0.3) return 3;
        if (f > 0.7 && r < 0.45) return 2;
        if (f > 0.25 && r < 0.6) return 1;
        return 0;
      }
      function spawnTick(dt) {
        const t = S.T;
        const rate = P.dens * (1.0 + t * 0.04 + (t > 60 ? (t - 60) * 0.025 : 0)) * (ENDLESS ? 1 + t / 240 : 1);
        S.spawnAcc += rate * dt;
        const R = viewR();
        while (S.spawnAcc >= 1) {
          S.spawnAcc -= 1;
          if (eCount >= MAXE - 20) { S.spawnAcc = 0; break; }
          const pack = t > 20 && rng() < 0.08;
          const a = rng() * 6.283;
          const ty = typeAt(t);
          const n = pack ? 5 + Math.floor(rng() * 5) : 1;
          for (let k = 0; k < n; k++) spawnEnemy(pack ? 1 : ty, S.hx + Math.cos(a) * R + (rng() - 0.5) * 50, S.hy + Math.sin(a) * R + (rng() - 0.5) * 50, false);
        }
        if (t >= S.nextElite) {
          S.nextElite += ENDLESS ? 35 : 45 - DIFF * 5;
          const a = rng() * 6.283;
          spawnEnemy(Math.min(4, 2 + Math.floor(rng() * 3)), S.hx + Math.cos(a) * R, S.hy + Math.sin(a) * R, true);
          banner('精英怪來了！', '#ffcc4d', 30);
        }
        if (!ENDLESS && !S.bossDone && S.boss < 0 && t >= P.dur * 0.6) { S.bossDone = true; spawnBoss(); }
        if (ENDLESS && t >= S.bossT + 60) { S.bossT += 60; spawnBoss(); }
      }

      // ---------- grid ----------
      function buildGrid() {
        head.fill(-1);
        gox = S.hx - GN * CELL / 2; goy = S.hy - GN * CELL / 2;
        for (let i = 0; i < MAXE; i++) {
          if (!eon[i]) continue;
          let cx = Math.floor((ex[i] - gox) / CELL), cy = Math.floor((ey[i] - goy) / CELL);
          if (cx < 0) cx = 0; else if (cx >= GN) cx = GN - 1;
          if (cy < 0) cy = 0; else if (cy >= GN) cy = GN - 1;
          const c = cy * GN + cx;
          next[i] = head[c]; head[c] = i;
        }
      }
      // call fn(i) for enemies whose grid cell is within radius rad of (x,y)
      function query(x, y, rad, fn) {
        const c0 = Math.max(0, Math.floor((x - rad - gox) / CELL)), c1 = Math.min(GN - 1, Math.floor((x + rad - gox) / CELL));
        const r0 = Math.max(0, Math.floor((y - rad - goy) / CELL)), r1 = Math.min(GN - 1, Math.floor((y + rad - goy) / CELL));
        for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
          let i = head[r * GN + c];
          while (i >= 0) { const nx = next[i]; if (eon[i] && fn(i) === true) return; i = nx; }
        }
      }

      // collect enemy indices near (x,y) into nb (no allocation); returns the count
      const nb = new Int32Array(MAXE);
      function gather(x, y, rad, max) {
        const c0 = Math.max(0, Math.floor((x - rad - gox) / CELL)), c1 = Math.min(GN - 1, Math.floor((x + rad - gox) / CELL));
        const r0 = Math.max(0, Math.floor((y - rad - goy) / CELL)), r1 = Math.min(GN - 1, Math.floor((y + rad - goy) / CELL));
        let n = 0;
        for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
          let i = head[r * GN + c];
          while (i >= 0) { if (eon[i]) { nb[n++] = i; if (n >= max) return n; } i = next[i]; }
        }
        return n;
      }

      // ---------- damage / death ----------
      function hurtEnemy(i, d, kx, ky, kb) {
        if (!eon[i]) return;
        ehp[i] -= d; eflash[i] = 0.08;
        const res = i === S.boss ? 0.1 : eelite[i] ? 0.35 : 1;
        ekx[i] += kx * kb * res; eky[i] += ky * kb * res;
        if (hitSnd <= 0) { api.sfx('hit'); hitSnd = 0.08; }
        if (Math.random() < 0.18 || d > 40) addText(ex[i] + (Math.random() - 0.5) * 10, ey[i] - er[i] - 4, String(Math.round(d)), d > 40 ? '#ffe27a' : '#ffffff', d > 40 ? 15 : 12);
        if (ehp[i] <= 0) killEnemy(i);
      }
      function killEnemy(i) {
        eon[i] = 0; free.push(i); eCount--; S.kills++;
        const T = ETYPES[etype[i]];
        const n = eelite[i] ? 10 : 5;
        for (let k = 0; k < n; k++) { const a = Math.random() * 6.283, s = 40 + Math.random() * 90; addPart(ex[i], ey[i], Math.cos(a) * s, Math.sin(a) * s, 0.35, T.col, eelite[i] ? 5 : 3.5); }
        if (i === S.boss) {
          S.boss = -1; shake = 16; banner('擊敗 BOSS！', '#7dffa8', 40); api.sfx('win');
          for (let k = 0; k < 12; k++) dropGem(ex[i] + (Math.random() - 0.5) * 60, ey[i] + (Math.random() - 0.5) * 60, 10, 2);
          S.chests.push({ x: ex[i], y: ey[i], t: 0 });
          S.heals.push({ x: ex[i] + 20, y: ey[i], t: 0 });
        } else if (eelite[i]) {
          S.chests.push({ x: ex[i], y: ey[i], t: 0 });
          dropGem(ex[i], ey[i], T.xp * 10, 2);
        } else {
          const xv = Math.round(T.xp * (1 + S.T / 120));
          dropGem(ex[i], ey[i], xv, xv >= 10 ? 2 : xv >= 3 ? 1 : 0);
          if ((S.kills * 7919) % 97 === 0) S.heals.push({ x: ex[i], y: ey[i], t: 0 });
        }
        if (ENDLESS) api.score(Math.floor(S.T));
      }
      function dropGem(x, y, v, kind) {
        for (let k = 0; k < MAXG; k++) {
          const i = (gCur + k) % MAXG;
          if (!gon[i]) { gon[i] = 1; gx[i] = x; gy[i] = y; gv[i] = v; gfly[i] = 0; gk[i] = kind; gCur = (i + 1) % MAXG; return; }
        }
        // pool full: merge into the oldest gem
        const i = gCur; gv[i] += v; if (gv[i] >= 10) gk[i] = 2; else if (gv[i] >= 4) gk[i] = 1;
        gCur = (gCur + 1) % MAXG;
      }

      // ---------- weapons ----------
      function nearest(maxR) {
        let best = -1, bd = maxR * maxR;
        query(S.hx, S.hy, maxR, (i) => { const dx = ex[i] - S.hx, dy = ey[i] - S.hy, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } });
        return best;
      }
      function shoot(kind, x, y, vx, vy, dmg, life, pierce) {
        for (let k = 0; k < MAXB; k++) {
          const i = (bCur + k) % MAXB;
          if (!bon[i]) {
            bon[i] = 1; bkind[i] = kind; bx[i] = x; by[i] = y; bvx[i] = vx; bvy[i] = vy; bdmg[i] = dmg; blife[i] = life; bpierce[i] = pierce; bt[i] = 0;
            bhit[i * 4] = bhit[i * 4 + 1] = bhit[i * 4 + 2] = bhit[i * 4 + 3] = -1;
            bCur = (i + 1) % MAXB; return i;
          }
        }
        return -1;
      }
      function cdReady(k, base, dt) {
        S.cds[k] = (S.cds[k] || 0) - dt;
        if (S.cds[k] > 0) return false;
        S.cds[k] += base * haste();
        if (S.cds[k] < 0) S.cds[k] = 0;
        return true;
      }
      function weapons(dt) {
        const M = might();
        // magic bolt
        const lb = lv('bolt');
        if (lb && cdReady('bolt', [0, 0.6, 0.55, 0.5, 0.45, 0.4][lb], dt)) {
          const n = [0, 1, 1, 2, 2, 3][lb], dmg = [0, 15, 20, 20, 24, 28][lb] * M, pierce = [0, 0, 0, 0, 1, 1][lb] + (lb >= 4 ? 1 : 0);
          const t = nearest(viewR());
          let ang = t >= 0 ? Math.atan2(ey[t] - S.hy, ex[t] - S.hx) : (S.face > 0 ? 0 : Math.PI);
          for (let k = 0; k < n; k++) { const a = ang + (k - (n - 1) / 2) * 0.16; shoot(0, S.hx, S.hy - 6, Math.cos(a) * 400, Math.sin(a) * 400, dmg, 1.4, pierce); }
          api.sfx('shoot');
        }
        // fireball
        const lf = lv('fire');
        if (lf && cdReady('fire', 1.5, dt)) {
          const n = lf >= 4 ? 2 : 1;
          for (let k = 0; k < n; k++) {
            let a;
            const t = nearest(viewR());
            if (t >= 0 && k === 0) a = Math.atan2(ey[t] - S.hy, ex[t] - S.hx); else a = rng() * 6.283;
            shoot(1, S.hx, S.hy - 6, Math.cos(a) * 260, Math.sin(a) * 260, (20 + lf * 8) * M, 1.6, 0);
          }
        }
        // boomerang
        const lr = lv('boomer');
        if (lr && cdReady('boomer', 1.5, dt)) {
          const n = 1 + (lr >= 3 ? 1 : 0) + (lr >= 5 ? 1 : 0);
          const t = nearest(viewR());
          const base = t >= 0 ? Math.atan2(ey[t] - S.hy, ex[t] - S.hx) : rng() * 6.283;
          const sp = lr >= 4 ? 380 : 320;
          for (let k = 0; k < n; k++) { const a = base + k * 6.283 / n; shoot(2, S.hx, S.hy, Math.cos(a) * sp, Math.sin(a) * sp, (13 + lr * 5) * M, 2.0, 99); }
        }
        // lightning
        const ll = lv('lightning');
        if (ll && cdReady('lightning', ll >= 5 ? 0.9 : 1.4, dt)) {
          const n = 1 + (ll >= 2 ? 1 : 0) + (ll >= 4 ? 1 : 0);
          const R = viewR() * 0.8;
          for (let k = 0; k < n; k++) {
            const cand = [];
            query(S.hx, S.hy, R, (i) => { if (cand.length < 40) cand.push(i); });
            if (!cand.length) break;
            const i = cand[Math.floor(rng() * cand.length)];
            const x = ex[i], y = ey[i], dmg = (24 + ll * 9) * M;
            query(x, y, 34, (j) => { const dx = ex[j] - x, dy = ey[j] - y; if (dx * dx + dy * dy < 34 * 34) hurtEnemy(j, dmg, 0, 0, 0); });
            const b = bolts.find((o) => !o.on); if (b) { b.on = true; b.x = x; b.y = y; b.t = 0; }
          }
          api.sfx('pop'); shake = Math.max(shake, 2);
        }
        // orbiting blades
        const lo = lv('orbit');
        if (lo) {
          const n = [0, 2, 3, 3, 4, 5][lo], rad = 62, spd = lo >= 4 ? 4.4 : 3.4, dmg = (lo >= 3 ? 14 : 10) * M;
          S.orbA += spd * dt;
          for (let k = 0; k < n; k++) {
            const a = S.orbA + k * 6.283 / n, x = S.hx + Math.cos(a) * rad, y = S.hy + Math.sin(a) * rad;
            query(x, y, 30, (i) => {
              if (eorb[i] > S.T) return;
              const dx = ex[i] - x, dy = ey[i] - y, rr = er[i] + 11;
              if (dx * dx + dy * dy < rr * rr) { eorb[i] = S.T + 0.4; hurtEnemy(i, dmg, Math.cos(a), Math.sin(a), 140); }
            });
          }
        }
        // garlic aura
        const lg = lv('garlic');
        if (lg) {
          const rad = 54 + [0, 0, 14, 14, 28, 28][lg], dmg = [0, 5, 5, 8, 8, 13][lg] * M;
          query(S.hx, S.hy, rad + 20, (i) => {
            if (eaura[i] > S.T) return;
            const dx = ex[i] - S.hx, dy = ey[i] - S.hy, d = Math.hypot(dx, dy) || 1;
            if (d < rad + er[i]) { eaura[i] = S.T + 0.45; hurtEnemy(i, dmg, dx / d, dy / d, 90); }
          });
        }
      }
      function updBullets(dt) {
        for (let b = 0; b < MAXB; b++) {
          if (!bon[b]) continue;
          bt[b] += dt; blife[b] -= dt;
          if (bkind[b] === 2) {
            // boomerang: decelerate, then fly back to the hero
            const back = bt[b] > 0.55;
            if (back) {
              const dx = S.hx - bx[b], dy = S.hy - by[b], d = Math.hypot(dx, dy) || 1;
              const sp = Math.min(520, Math.hypot(bvx[b], bvy[b]) + 900 * dt);
              bvx[b] = dx / d * sp; bvy[b] = dy / d * sp;
              if (d < 16) { bon[b] = 0; continue; }
            } else { bvx[b] *= Math.exp(-2.2 * dt); bvy[b] *= Math.exp(-2.2 * dt); }
          }
          bx[b] += bvx[b] * dt; by[b] += bvy[b] * dt;
          if (blife[b] <= 0) { if (bkind[b] === 1) explode(b); bon[b] = 0; continue; }
          const x = bx[b], y = by[b];
          let hitOne = false;
          const n = gather(x, y, 40, 64);
          const vl = Math.hypot(bvx[b], bvy[b]) || 1, ux = bvx[b] / vl, uy = bvy[b] / vl;
          for (let q = 0; q < n; q++) {
            const i = nb[q];
            if (!eon[i]) continue;
            const dx = ex[i] - x, dy = ey[i] - y, rr = er[i] + (bkind[b] === 2 ? 12 : 6);
            if (dx * dx + dy * dy >= rr * rr) continue;
            if (bkind[b] === 1) { hitOne = true; break; }
            if (bkind[b] === 2) {
              if (eboom[i] > S.T) continue;
              eboom[i] = S.T + 0.3;
              hurtEnemy(i, bdmg[b], ux, uy, 60);
              continue;
            }
            let seenB = false;
            for (let k = 0; k < 4; k++) if (bhit[b * 4 + k] === i) seenB = true;
            if (seenB) continue;
            hurtEnemy(i, bdmg[b], ux, uy, 110);
            if (bpierce[b] > 0) { bpierce[b]--; for (let k = 0; k < 4; k++) if (bhit[b * 4 + k] < 0) { bhit[b * 4 + k] = i; break; } }
            else { bon[b] = 0; break; }
          }
          if (hitOne) { explode(b); bon[b] = 0; }
        }
      }
      function explode(b) {
        const x = bx[b], y = by[b], lf = lv('fire');
        const R = 46 + (lf >= 2 ? 14 : 0) + (lf >= 5 ? 18 : 0);
        query(x, y, R + 20, (i) => { const dx = ex[i] - x, dy = ey[i] - y, d = Math.hypot(dx, dy) || 1; if (d < R + er[i]) hurtEnemy(i, bdmg[b], dx / d, dy / d, 120); });
        const o = booms.find((q) => !q.on); if (o) { o.on = true; o.x = x; o.y = y; o.r = R; o.t = 0; }
        for (let k = 0; k < 10; k++) { const a = Math.random() * 6.283, s = 60 + Math.random() * 120; addPart(x, y, Math.cos(a) * s, Math.sin(a) * s, 0.4, k % 2 ? '#ffb04d' : '#ff5d3d', 4); }
        shake = Math.max(shake, 3);
      }

      // ---------- level up ----------
      function rollChoices() {
        const pool = [];
        const ownedW = WEAPONS.filter((k) => lv(k) > 0).length;
        for (const k of WEAPONS) { const l = lv(k); if (l > 0 && l < MAXLV) pool.push(k); else if (!l && ownedW < 6) pool.push(k); }
        for (const k of PASSIVES) if (lv(k) < MAXLV) pool.push(k);
        U.shuffle(rng, pool);
        const pick = pool.slice(0, 3);
        // always offer at least one weapon while there are weapons left to get
        if (pick.length === 3 && !pick.some((k) => ITEMS[k].weapon)) {
          const w = pool.find((k) => ITEMS[k].weapon);
          if (w) pick[2] = w;
        }
        if (!pick.length) pick.push('heal');
        return pick;
      }
      function openChoice() {
        const ch = rollChoices();
        if (ch[0] === 'heal') {
          // everything is maxed: no pause, just a free heal
          S.pendingUps = 0; S.hp = Math.min(S.maxhp, S.hp + 30);
          addText(S.hx, S.hy - 34, '+30', '#7dffa8', 16);
          return;
        }
        S.choosing = ch; S.chooseT = 0;
        joy = null;
        api.sfx('good');
      }
      function choose(k) {
        if (!S.choosing) return;
        const key = S.choosing[k]; if (!key) return;
        if (key === 'heal') S.hp = S.maxhp;
        else {
          S.items[key] = (S.items[key] || 0) + 1;
          if (key === 'maxhp') { S.maxhp += 25; S.hp = Math.min(S.maxhp, S.hp + 25); }
        }
        S.choosing = null;
        api.sfx('tap');
        for (let i = 0; i < 16; i++) { const a = Math.random() * 6.283; addPart(S.hx, S.hy - 10, Math.cos(a) * 140, Math.sin(a) * 140, 0.5, '#ffe27a', 4); }
        S.pendingUps--;
        if (S.pendingUps > 0) openChoice();
      }
      function cardRects() {
        const n = S.choosing ? S.choosing.length : 0;
        const cw = Math.min(W - 40, 330), ch = Math.min(84, (H - 220) / 3.4);
        const x = (W - cw) / 2, y0 = H * 0.5 - (n * (ch + 12)) / 2 + 20;
        const out = [];
        for (let k = 0; k < n; k++) out.push({ x, y: y0 + k * (ch + 12), w: cw, h: ch });
        return out;
      }

      // ---------- main update ----------
      function update(dt) {
        anim += dt;
        updFx(dt);
        if (api.ended || S.over) return;
        if (S.choosing) {
          S.chooseT += dt;
          if (S.chooseT >= 8) choose(0);
          return;
        }
        S.T += dt; hintT -= dt; pickSnd -= dt; hitSnd -= dt;
        if (S.iframe > 0) S.iframe -= dt;
        if (hurtT > 0) hurtT -= dt;
        // hero movement
        let mx = 0, my = 0;
        if (joy && joy.on) { const d = Math.hypot(joy.dx, joy.dy); if (d > 4) { const m = Math.min(1, d / 50); mx = joy.dx / d * m; my = joy.dy / d * m; } }
        S.moving = mx !== 0 || my !== 0;
        if (Math.abs(mx) > 0.1) S.face = mx > 0 ? 1 : -1;
        const hs = heroSpd();
        S.hx += mx * hs * dt; S.hy += my * hs * dt;
        // regen
        const rg = lv('regen');
        if (rg && S.hp < S.maxhp) S.hp = Math.min(S.maxhp, S.hp + 0.7 * rg * dt);
        spawnTick(dt);
        buildGrid();
        // enemies: chase, separate, knockback, hit hero
        const R = viewR();
        for (let i = 0; i < MAXE; i++) {
          if (!eon[i]) continue;
          let dx = S.hx - ex[i], dy = S.hy - ey[i];
          const d = Math.hypot(dx, dy) || 1;
          if (d > R * 1.7 && i !== S.boss) {
            // too far behind: re-enter ahead of the hero
            const a = Math.atan2(my || (rng() - 0.5), mx || (rng() - 0.5)) + (rng() - 0.5) * 1.6;
            ex[i] = S.hx + Math.cos(a) * R; ey[i] = S.hy + Math.sin(a) * R;
            continue;
          }
          const sp = espd[i] * (etype[i] === 1 ? 1 + 0.25 * Math.sin(S.T * 6 + i) : 1);
          ex[i] += (dx / d * sp + ekx[i]) * dt; ey[i] += (dy / d * sp + eky[i]) * dt;
          const kd = Math.exp(-8 * dt); ekx[i] *= kd; eky[i] *= kd;
          if (eflash[i] > 0) eflash[i] -= dt;
          if (d < er[i] + HERO_R && S.iframe <= 0) {
            S.hp -= edmg[i]; S.iframe = 0.5; hurtT = 0.25; shake = Math.max(shake, 5);
            api.sfx('bad');
            addText(S.hx, S.hy - 34, '-' + Math.round(edmg[i]), '#ff5d6c', 15);
            if (S.hp <= 0) { die(); return; }
          }
        }
        // light separation (every other frame) so swarms spread instead of stacking
        if ((Math.floor(S.T * 60) & 1) === 0) {
          for (let i = 0; i < MAXE; i++) {
            if (!eon[i]) continue;
            const xi = ex[i], yi = ey[i], ri = er[i];
            const n = gather(xi, yi, 24, 8);
            for (let q = 0; q < n; q++) {
              const j = nb[q]; if (j === i) continue;
              const dx = ex[j] - xi, dy = ey[j] - yi, rr = (ri + er[j]) * 0.8, d2 = dx * dx + dy * dy;
              if (d2 < rr * rr && d2 > 0.01) {
                const d = Math.sqrt(d2), push = (rr - d) * 0.25;
                ex[j] += dx / d * push; ey[j] += dy / d * push; ex[i] -= dx / d * push; ey[i] -= dy / d * push;
              }
            }
          }
        }
        weapons(dt);
        updBullets(dt);
        // gems
        const pr = pickR();
        for (let i = 0; i < MAXG; i++) {
          if (!gon[i]) continue;
          const dx = S.hx - gx[i], dy = S.hy - gy[i], d = Math.hypot(dx, dy);
          if (!gfly[i] && d < pr) gfly[i] = 1;
          if (gfly[i]) {
            const sp = 320 + (pr - Math.min(pr, d)) * 4;
            gx[i] += dx / (d || 1) * sp * dt; gy[i] += dy / (d || 1) * sp * dt;
            if (d < 14) {
              gon[i] = 0; S.xp += gv[i];
              if (pickSnd <= 0) { api.sfx('tap'); pickSnd = 0.06; }
            }
          } else if (d < pr * 2.2) { gx[i] += dx / (d || 1) * 45 * dt; gy[i] += dy / (d || 1) * 45 * dt; }
          else if (d > R * 2.2) gon[i] = 0;
        }
        for (let k = S.chests.length - 1; k >= 0; k--) {
          const c = S.chests[k]; c.t += dt;
          if (Math.hypot(c.x - S.hx, c.y - S.hy) < 26) { S.chests.splice(k, 1); S.pendingUps++; banner('寶箱！', '#ffe27a', 34); api.sfx('win'); }
        }
        for (let k = S.heals.length - 1; k >= 0; k--) {
          const c = S.heals[k]; c.t += dt;
          if (Math.hypot(c.x - S.hx, c.y - S.hy) < 24) { S.heals.splice(k, 1); S.hp = Math.min(S.maxhp, S.hp + 30); addText(S.hx, S.hy - 34, '+30', '#7dffa8', 16); api.sfx('good'); }
        }
        while (S.xp >= S.need) { S.xp -= S.need; S.lvl++; S.need = needFor(S.lvl); S.pendingUps++; }
        if (S.pendingUps > 0 && !S.choosing) { openChoice(); if (S.choosing) banner('升級！Lv.' + S.lvl, '#7dffa8', 34); }
        if (ENDLESS) api.score(Math.floor(S.T));
        if (!ENDLESS && S.T >= P.dur) {
          S.over = true; S.won = true;
          for (let i = 0; i < MAXE; i++) if (eon[i]) { for (let k = 0; k < 3; k++) addPart(ex[i], ey[i], (Math.random() - 0.5) * 120, -Math.random() * 120, 0.6, ETYPES[etype[i]].col, 4); eon[i] = 0; }
          for (let i = 0; i < 60; i++) addPart(S.hx + (Math.random() - 0.5) * 300, S.hy - 250, (Math.random() - 0.5) * 200, Math.random() * 200, 2, U.PALETTE[i % 8], 6);
          banner('撐過去了！', '#7dffa8', 42);
          api.win('存活 ' + fmtT(P.dur) + '，擊殺 ' + S.kills);
          return;
        }
        let info;
        if (L === 1 && DIFF === 0 && S.T < 12 && !ENDLESS) info = '按住任何地方拖曳移動，武器會自動攻擊！';
        else if (ENDLESS) info = '無盡模式 · 每 60 秒一隻 BOSS';
        else info = '撐過 ' + fmtT(P.dur) + ' · Lv.' + S.lvl + ' · 擊殺 ' + S.kills;
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
      }
      function die() {
        S.hp = 0; S.over = true; shake = 18; flash = 0.6;
        for (let k = 0; k < 40; k++) { const a = Math.random() * 6.283, s = 60 + Math.random() * 180; addPart(S.hx, S.hy, Math.cos(a) * s, Math.sin(a) * s, 0.8, k % 2 ? '#ff5d6c' : '#7d8cff', 5); }
        banner('倒下了…', '#ff5d6c', 40);
        api.lose(ENDLESS ? '存活 ' + fmtT(S.T) + '，擊殺 ' + S.kills : '撐了 ' + fmtT(S.T) + ' / ' + fmtT(P.dur));
      }
      function fmtT(t) { t = Math.floor(t); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); }
      function updFx(dt) {
        if (shake > 0) shake = Math.max(0, shake - dt * 30);
        if (flash > 0) flash -= dt;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
          p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96;
        }
        for (let i = 0; i < texts.length; i++) { const t = texts[i]; if (!t.on) continue; t.t += dt; t.y -= 40 * dt; if (t.t >= t.max) t.on = false; }
        for (let i = 0; i < bolts.length; i++) { const b = bolts[i]; if (b.on) { b.t += dt; if (b.t > 0.25) b.on = false; } }
        for (let i = 0; i < booms.length; i++) { const b = booms[i]; if (b.on) { b.t += dt; if (b.t > 0.3) b.on = false; } }
        for (let i = banners.length - 1; i >= 0; i--) { banners[i].t += dt; if (banners[i].t > 1.5) banners.splice(i, 1); }
      }

      // ---------- draw ----------
      function draw(g) {
        if (!sprites) { sprites = buildEnemySprites(); tile = buildGroundTile(); tilePat = null; }
        const shx = (Math.random() - 0.5) * shake, shy = (Math.random() - 0.5) * shake;
        const cx = W / 2, cy = H / 2 + 10;
        g.save();
        g.translate(cx + shx, cy + shy); g.scale(sc, sc); g.translate(-S.hx, -S.hy);
        const vw = W / sc / 2 + 40, vh = H / sc / 2 + 40;
        const x0 = S.hx - vw, y0 = S.hy - vh;
        // ground
        if (!tilePat) tilePat = g.createPattern(tile, 'repeat');
        g.fillStyle = tilePat || '#5fa04a';
        g.fillRect(x0, y0, vw * 2, vh * 2);
        // garlic aura
        const lg = lv('garlic');
        if (lg) {
          const rad = 54 + [0, 0, 14, 14, 28, 28][lg];
          const gr = g.createRadialGradient(S.hx, S.hy, rad * 0.3, S.hx, S.hy, rad);
          gr.addColorStop(0, 'rgba(255,240,200,0.05)'); gr.addColorStop(1, 'rgba(255,230,160,' + (0.22 + 0.06 * Math.sin(anim * 6)) + ')');
          g.fillStyle = gr; g.beginPath(); g.arc(S.hx, S.hy, rad, 0, 6.283); g.fill();
          g.strokeStyle = 'rgba(255,240,180,0.5)'; g.lineWidth = 2; g.stroke();
        }
        // gems
        for (let i = 0; i < MAXG; i++) {
          if (!gon[i]) continue;
          const x = gx[i], y = gy[i];
          if (x < x0 || x > x0 + vw * 2 || y < y0 || y > y0 + vh * 2) continue;
          const k = gk[i], s = k === 2 ? 7 : k === 1 ? 5.5 : 4.5;
          g.fillStyle = k === 2 ? '#ff5d6c' : k === 1 ? '#4cd986' : '#4c9bff';
          g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.7, y); g.lineTo(x, y + s); g.lineTo(x - s * 0.7, y); g.closePath(); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.3, y - s * 0.2); g.lineTo(x - s * 0.2, y - s * 0.1); g.closePath(); g.fill();
        }
        for (const c of S.chests) {
          const b = Math.abs(Math.sin(anim * 4)) * 3;
          g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(c.x, c.y + 9, 12, 4, 0, 0, 6.283); g.fill();
          g.fillStyle = '#a0603a'; U.rr(g, c.x - 11, c.y - 6 - b, 22, 15, 3); g.fill();
          g.fillStyle = '#c87a4a'; U.rr(g, c.x - 11, c.y - 12 - b, 22, 8, 4); g.fill();
          g.fillStyle = '#ffcc4d'; g.fillRect(c.x - 2, c.y - 8 - b, 4, 7); g.fillRect(c.x - 11, c.y - 5 - b, 22, 2);
          g.globalAlpha = 0.4 + 0.3 * Math.sin(anim * 6); g.fillStyle = '#fff3a0'; g.beginPath(); g.arc(c.x, c.y - 4 - b, 18, 0, 6.283); g.fill(); g.globalAlpha = 1;
        }
        for (const c of S.heals) U.text(g, '🍗', c.x, c.y - Math.abs(Math.sin(anim * 4)) * 3, 18, '#fff');
        // enemies
        for (let i = 0; i < MAXE; i++) {
          if (!eon[i]) continue;
          const x = ex[i], y = ey[i];
          if (x < x0 - 40 || x > x0 + vw * 2 + 40 || y < y0 - 40 || y > y0 + vh * 2 + 40) continue;
          if (i === S.boss) { drawBoss(g, x, y, er[i], anim, eflash[i] > 0); continue; }
          const t = etype[i], sp = sprites[t];
          const k = eelite[i] ? 1.7 : 1;
          const s = sp.size * k;
          const bob = t === 1 ? Math.sin(anim * 14 + i) * 2 : Math.abs(Math.sin(anim * 8 + i)) * -1.5;
          if (eelite[i]) {
            g.fillStyle = 'rgba(255,200,60,' + (0.25 + 0.15 * Math.sin(anim * 8)) + ')';
            g.beginPath(); g.arc(x, y, er[i] * 1.35, 0, 6.283); g.fill();
          }
          g.drawImage(eflash[i] > 0 ? sp.flash : sp.img, x - s / 2, y - s / 2 + bob, s, s);
          if (eelite[i]) {
            const bw = er[i] * 2;
            g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x - bw / 2, y - er[i] - 9, bw, 4);
            g.fillStyle = '#ffcc4d'; g.fillRect(x - bw / 2, y - er[i] - 9, bw * Math.max(0, ehp[i] / emax[i]), 4);
          }
        }
        // projectiles
        for (let b = 0; b < MAXB; b++) {
          if (!bon[b]) continue;
          const x = bx[b], y = by[b];
          if (bkind[b] === 0) {
            g.fillStyle = 'rgba(190,140,255,0.45)'; g.beginPath(); g.arc(x - bvx[b] * 0.02, y - bvy[b] * 0.02, 7, 0, 6.283); g.fill();
            g.fillStyle = '#d8b8ff'; g.beginPath(); g.arc(x, y, 5, 0, 6.283); g.fill();
            g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 2.4, 0, 6.283); g.fill();
          } else if (bkind[b] === 1) {
            g.fillStyle = 'rgba(255,120,40,0.4)'; g.beginPath(); g.arc(x - bvx[b] * 0.03, y - bvy[b] * 0.03, 10, 0, 6.283); g.fill();
            g.fillStyle = '#ff7a2a'; g.beginPath(); g.arc(x, y, 7.5, 0, 6.283); g.fill();
            g.fillStyle = '#ffe27a'; g.beginPath(); g.arc(x - 1.5, y - 1.5, 3.5, 0, 6.283); g.fill();
          } else {
            g.save(); g.translate(x, y); g.rotate(bt[b] * 18);
            g.fillStyle = '#c8904a';
            g.beginPath(); g.moveTo(-11, -3); g.quadraticCurveTo(0, -12, 11, -3); g.lineTo(9, 1); g.quadraticCurveTo(0, -6, -9, 1); g.closePath(); g.fill();
            g.restore();
          }
        }
        // orbit blades
        const lo = lv('orbit');
        if (lo) {
          const n = [0, 2, 3, 3, 4, 5][lo];
          for (let k = 0; k < n; k++) {
            const a = S.orbA + k * 6.283 / n, x = S.hx + Math.cos(a) * 62, y = S.hy + Math.sin(a) * 62;
            g.save(); g.translate(x, y); g.rotate(a + anim * 12);
            g.fillStyle = 'rgba(180,220,255,0.35)'; g.beginPath(); g.arc(0, 0, 12, 0, 6.283); g.fill();
            g.fillStyle = '#e8f0ff';
            for (let q = 0; q < 3; q++) { g.rotate(2.094); g.beginPath(); g.moveTo(0, 0); g.lineTo(11, -3); g.lineTo(9, 3); g.closePath(); g.fill(); }
            g.fillStyle = '#7d8cff'; g.beginPath(); g.arc(0, 0, 3, 0, 6.283); g.fill();
            g.restore();
          }
        }
        // hero
        if (!(S.iframe > 0 && Math.sin(anim * 40) > 0.4) || S.over) drawHero(g, S.hx, S.hy, anim, S.face, S.moving, hurtT > 0);
        // hp bar under the hero
        g.fillStyle = 'rgba(0,0,0,0.5)'; U.rr(g, S.hx - 16, S.hy + 16, 32, 5, 2.5); g.fill();
        g.fillStyle = S.hp / S.maxhp > 0.35 ? '#7dff8a' : '#ff5d6c'; U.rr(g, S.hx - 16, S.hy + 16, Math.max(2, 32 * Math.max(0, S.hp) / S.maxhp), 5, 2.5); g.fill();
        // lightning & explosions
        for (const b of bolts) {
          if (!b.on) continue;
          g.globalAlpha = 1 - b.t / 0.25;
          g.strokeStyle = '#fff6a0'; g.lineWidth = 4; g.lineJoin = 'round';
          g.beginPath(); g.moveTo(b.x + 10, b.y - 260);
          for (let k = 1; k < 6; k++) g.lineTo(b.x + (Math.random() - 0.5) * 26, b.y - 260 + k * 52);
          g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; g.stroke();
          g.fillStyle = 'rgba(255,250,200,0.5)'; g.beginPath(); g.arc(b.x, b.y, 30, 0, 6.283); g.fill();
        }
        g.globalAlpha = 1;
        for (const o of booms) {
          if (!o.on) continue;
          const k = o.t / 0.3;
          g.globalAlpha = 1 - k; g.fillStyle = '#ffb04d'; g.beginPath(); g.arc(o.x, o.y, o.r * (0.5 + k * 0.6), 0, 6.283); g.fill();
          g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(o.x, o.y, o.r * 0.4 * (1 - k), 0, 6.283); g.fill();
        }
        g.globalAlpha = 1;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.6); g.fillStyle = p.col;
          g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        g.globalAlpha = 1;
        g.font = '900 13px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle';
        for (let i = 0; i < texts.length; i++) {
          const t = texts[i]; if (!t.on) continue;
          g.globalAlpha = 1 - t.t / t.max;
          g.font = '900 ' + t.size + 'px ' + FONT;
          g.lineWidth = 3; g.strokeStyle = 'rgba(20,10,30,0.8)'; g.strokeText(t.s, t.x, t.y); g.fillStyle = t.col; g.fillText(t.s, t.x, t.y);
        }
        g.globalAlpha = 1;
        g.restore();
        // boss arrow when off-screen
        if (S.boss >= 0 && eon[S.boss]) {
          const px = cx + (ex[S.boss] - S.hx) * sc, py = cy + (ey[S.boss] - S.hy) * sc;
          if (px < 0 || px > W || py < 0 || py > H) {
            const a = Math.atan2(py - cy, px - cx);
            g.save(); g.translate(U.clamp(px, 20, W - 20), U.clamp(py, 70, H - 20)); g.rotate(a);
            g.fillStyle = '#ff5d6c'; g.beginPath(); g.moveTo(14, 0); g.lineTo(-8, -10); g.lineTo(-8, 10); g.closePath(); g.fill();
            g.restore();
          }
        }
        if (flash > 0) { g.fillStyle = 'rgba(255,40,60,' + flash * 0.5 + ')'; g.fillRect(0, 0, W, H); }
        if (hurtT > 0) {
          const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.7);
          gr.addColorStop(0, 'rgba(255,0,0,0)'); gr.addColorStop(1, 'rgba(255,0,40,' + hurtT * 1.2 + ')');
          g.fillStyle = gr; g.fillRect(0, 0, W, H);
        }
        drawHud(g);
        if (joy && joy.on && !S.choosing) {
          g.globalAlpha = 0.35; g.strokeStyle = '#fff'; g.lineWidth = 3;
          g.beginPath(); g.arc(joy.x0, joy.y0, 50, 0, 6.283); g.stroke();
          const d = Math.hypot(joy.dx, joy.dy) || 1, m = Math.min(1, d / 50);
          g.fillStyle = '#fff'; g.beginPath(); g.arc(joy.x0 + joy.dx / d * m * 50, joy.y0 + joy.dy / d * m * 50, 20, 0, 6.283); g.fill();
          g.globalAlpha = 1;
        }
        for (let i = 0; i < banners.length; i++) {
          const b = banners[i];
          const k = Math.min(1, b.t / 0.35), s = U.easeOutBack(k);
          g.globalAlpha = b.t > 1.2 ? Math.max(0, 1 - (b.t - 1.2) / 0.3) : 1;
          const fs = Math.min(b.size, W / 9) * s;
          g.font = '900 ' + fs + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 6; g.lineJoin = 'round'; g.strokeStyle = 'rgba(20,10,30,0.85)';
          g.strokeText(b.text, W / 2, H * 0.24 + i * 44); g.fillStyle = b.col; g.fillText(b.text, W / 2, H * 0.24 + i * 44);
        }
        g.globalAlpha = 1;
        if (S.choosing) drawChoice(g);
        if (hintT > 0 && !api.ended && !(joy && joy.on) && !S.choosing) {
          g.globalAlpha = Math.min(1, hintT) * (0.6 + 0.4 * Math.sin(anim * 5));
          U.text(g, '👆', W / 2 + Math.cos(anim * 2) * 40, H * 0.75 + Math.sin(anim * 2) * 25, 30, '#fff');
          U.text(g, '按住拖曳移動', W / 2, H * 0.75 + 56, 16, '#fff', 'center', 900);
          g.globalAlpha = 1;
        }
      }
      function drawHud(g) {
        // xp bar
        g.fillStyle = 'rgba(15,12,35,0.75)'; g.fillRect(0, 0, W, 18);
        const gr = g.createLinearGradient(0, 0, W, 0);
        gr.addColorStop(0, '#4c9bff'); gr.addColorStop(1, '#b26bff');
        g.fillStyle = gr; g.fillRect(0, 2, W * Math.min(1, S.xp / S.need), 14);
        U.text(g, 'Lv.' + S.lvl, W - 8, 9.5, 12, '#fff', 'right', 900);
        // timer
        const tStr = ENDLESS ? fmtT(S.T) : fmtT(Math.max(0, P.dur - S.T));
        g.fillStyle = 'rgba(15,12,35,0.55)'; U.rr(g, W / 2 - 46, 22, 92, 28, 14); g.fill();
        U.text(g, (ENDLESS ? '⏱ ' : '⏳ ') + tStr, W / 2, 36.5, 16, !ENDLESS && P.dur - S.T < 10 ? '#7dffa8' : '#fff', 'center', 900);
        g.fillStyle = 'rgba(15,12,35,0.55)'; U.rr(g, 8, 22, 84, 28, 14); g.fill();
        U.text(g, '💀 ' + S.kills, 18, 36.5, 13, '#fff', 'left', 900);
        g.fillStyle = 'rgba(15,12,35,0.55)'; U.rr(g, W - 92, 22, 84, 28, 14); g.fill();
        if (ENDLESS) U.text(g, '最高 ' + fmtT(Math.max(api.best || 0, S.T)), W - 50, 36.5, 12, '#ffe27a', 'center', 900);
        else U.text(g, '❤️ ' + Math.max(0, Math.ceil(S.hp)), W - 50, 36.5, 13, '#fff', 'center', 900);
        // owned items
        let x = 10;
        for (const k of WEAPONS.concat(PASSIVES)) {
          const l = lv(k); if (!l) continue;
          g.fillStyle = ITEMS[k].weapon ? 'rgba(80,60,140,0.7)' : 'rgba(40,90,70,0.7)'; U.rr(g, x, 56, 26, 26, 7); g.fill();
          U.text(g, ITEMS[k].icon, x + 13, 68, 14, '#fff');
          U.text(g, String(l), x + 22, 78, 9, '#ffe27a', 'center', 900);
          x += 29;
          if (x > W - 30) break;
        }
        if (S.boss >= 0 && eon[S.boss]) {
          const bw = W - 60;
          g.fillStyle = 'rgba(20,10,20,0.7)'; U.rr(g, 26, H - 34, bw + 8, 18, 9); g.fill();
          g.fillStyle = '#ff3b54'; U.rr(g, 30, H - 30, Math.max(4, bw * ehp[S.boss] / emax[S.boss]), 10, 5); g.fill();
          U.text(g, '👹 BOSS', W / 2, H - 44, 13, '#fff', 'center', 900);
        }
      }
      function drawChoice(g) {
        g.fillStyle = 'rgba(10,8,30,0.72)'; g.fillRect(0, 0, W, H);
        const rects = cardRects();
        const t = S.chooseT;
        U.text(g, '升級！選一個', W / 2, rects[0].y - 34, 26, '#ffe27a', 'center', 900);
        for (let k = 0; k < rects.length; k++) {
          const r = rects[k], key = S.choosing[k];
          const a = U.easeOutBack(Math.min(1, Math.max(0, (t - k * 0.06) / 0.3)));
          g.save(); g.translate(r.x + r.w / 2, r.y + r.h / 2); g.scale(a, a); g.translate(-r.x - r.w / 2, -r.y - r.h / 2);
          const it = ITEMS[key] || { name: '回滿血', icon: '🍗', desc: ['生命全滿'] };
          const cur = lv(key), isNew = !cur && it.weapon;
          const grd = g.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
          grd.addColorStop(0, it.weapon ? '#4a3a8a' : '#2a5a4a'); grd.addColorStop(1, it.weapon ? '#2e2458' : '#1a3a30');
          g.fillStyle = 'rgba(0,0,0,0.35)'; U.rr(g, r.x, r.y + 4, r.w, r.h, 16); g.fill();
          g.fillStyle = grd; U.rr(g, r.x, r.y, r.w, r.h, 16); g.fill();
          g.strokeStyle = isNew ? '#ffe27a' : 'rgba(255,255,255,0.35)'; g.lineWidth = 2.5; U.rr(g, r.x, r.y, r.w, r.h, 16); g.stroke();
          g.fillStyle = 'rgba(255,255,255,0.1)'; U.rr(g, r.x + 10, r.y + 10, r.h - 20, r.h - 20, 12); g.fill();
          U.text(g, it.icon, r.x + r.h / 2, r.y + r.h / 2 + 1, Math.min(34, r.h * 0.45), '#fff');
          U.text(g, it.name, r.x + r.h + 4, r.y + r.h * 0.34, Math.min(19, r.h * 0.24), '#ffffff', 'left', 900);
          U.text(g, isNew ? '新武器！' : 'Lv.' + cur + ' → ' + (cur + 1), r.x + r.w - 14, r.y + r.h * 0.34, 12, isNew ? '#ffe27a' : '#9ad8ff', 'right', 900);
          const desc = it.desc[Math.min(it.desc.length - 1, it.weapon ? cur : 0)];
          U.text(g, desc, r.x + r.h + 4, r.y + r.h * 0.68, Math.min(14, r.h * 0.18), 'rgba(255,255,255,0.85)', 'left', 700);
          g.restore();
        }
        const last = rects[rects.length - 1];
        const f = Math.max(0, 1 - t / 8);
        g.fillStyle = 'rgba(255,255,255,0.2)'; U.rr(g, W / 2 - 80, last.y + last.h + 18, 160, 6, 3); g.fill();
        g.fillStyle = '#ffe27a'; U.rr(g, W / 2 - 80, last.y + last.h + 18, 160 * f, 6, 3); g.fill();
        U.text(g, Math.ceil(8 - t) + ' 秒後自動選第一個', W / 2, last.y + last.h + 36, 12, 'rgba(255,255,255,0.7)', 'center', 700);
      }

      // ---------- input ----------
      function down(x, y) {
        if (api.ended || S.over) return;
        if (S.choosing) {
          if (S.chooseT < 0.35) return;
          const rects = cardRects();
          for (let k = 0; k < rects.length; k++) { const r = rects[k]; if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) { choose(k); return; } }
          return;
        }
        joy = { on: true, x0: x, y0: y, dx: 0, dy: 0 }; hintT = Math.min(hintT, 0.3);
      }
      function move(x, y) {
        if (!joy || S.choosing) return;
        joy.dx = x - joy.x0; joy.dy = y - joy.y0;
        const d = Math.hypot(joy.dx, joy.dy);
        if (d > 80) { joy.x0 = x - joy.dx / d * 80; joy.y0 = y - joy.dy / d * 80; joy.dx = x - joy.x0; joy.dy = y - joy.y0; }
      }
      function up() { joy = null; }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _s: S, _k: { P, cardRects, ex, ey, eon, er, etype, eelite, gx, gy, gon, MAXE, MAXG, lv, get boss() { return S.boss; }, get count() { return eCount; }, heroSpd },
      };
    },
  });
})();
