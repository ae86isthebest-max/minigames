// 合成水果 — Suika / 合成大西瓜 style merge-drop game.
(function () {
  'use strict';
  // ---------- world constants (container inner width = 1) ----------
  const NAMES = ['櫻桃', '草莓', '葡萄', '柳橙', '柿子', '蘋果', '梨子', '桃子', '鳳梨', '哈密瓜', '西瓜'];
  const RAD = [0.042, 0.054, 0.068, 0.082, 0.098, 0.116, 0.134, 0.154, 0.178, 0.206, 0.245];
  const COL = ['#e8283c', '#ff4b5c', '#9450d8', '#ff9f1c', '#ff7418', '#f23b3b', '#cfe05a', '#ffa0b4', '#ffcd3c', '#a6e264', '#3aa845'];
  const HC = 1.42;
  const LINE = 0.1;
  const SPAWN_Y = -0.13;
  const G = 3.2;
  const DT = 1 / 120;
  const ITER = 5;
  const DROP_COOLDOWN = 0.55;
  const SPAWN_W = [0.3, 0.27, 0.21, 0.14, 0.08];

  // ---------- pure physics (shared with tools/check_fruit.js) ----------
  function newWorld() { return { fr: [], score: 0, maxT: -1, overT: 0, lost: false, nid: 1, events: [] }; }
  function addFruit(w, t, x, y) {
    const r = RAD[t];
    const f = { id: w.nid++, t, x: Math.min(1 - r, Math.max(r, x)), y, px: 0, py: 0, vx: 0, vy: 0, r, age: 0, ang: 0, av: 0, pop: 0, contact: 0 };
    w.fr.push(f);
    return f;
  }
  function randType(rng) {
    let v = rng();
    for (let i = 0; i < SPAWN_W.length; i++) { v -= SPAWN_W[i]; if (v <= 0) return i; }
    return 0;
  }
  function mergePts(t) { return ((t + 1) * (t + 2)) / 2; }
  function step(w, dt) {
    const fr = w.fr, n = fr.length;
    for (let i = 0; i < n; i++) {
      const f = fr[i];
      const R = RAD[f.t];
      if (f.r < R) f.r = Math.min(R, f.r + R * dt / 0.12);
      f.vy += G * dt;
      f.px = f.x; f.py = f.y;
      f.x += f.vx * dt; f.y += f.vy * dt;
      f.age += dt; f.contact = 0;
    }
    fr.sort((a, b) => a.x - b.x);
    let maxR = 0; for (let i = 0; i < n; i++) if (fr[i].r > maxR) maxR = fr[i].r;
    for (let it = 0; it < ITER; it++) {
      for (let i = 0; i < n; i++) {
        const a = fr[i];
        for (let j = i + 1; j < n; j++) {
          const b = fr[j];
          const dx = b.x - a.x;
          if (dx > a.r + maxR) break;
          const dy = b.y - a.y, rs = a.r + b.r;
          const d2 = dx * dx + dy * dy;
          if (d2 >= rs * rs) continue;
          const d = Math.sqrt(d2) || 1e-6;
          const ov = (rs - d) * 0.9;
          const nx = d2 > 0 ? dx / d : 0, ny = d2 > 0 ? dy / d : 1;
          const ma = a.r * a.r, mb = b.r * b.r, tot = ma + mb;
          const ka = mb / tot, kb = ma / tot;
          a.x -= nx * ov * ka; a.y -= ny * ov * ka;
          b.x += nx * ov * kb; b.y += ny * ov * kb;
          a.contact = 1; b.contact = 1;
        }
      }
      for (let i = 0; i < n; i++) {
        const f = fr[i];
        if (f.x < f.r) { f.x = f.r; f.contact = 1; }
        if (f.x > 1 - f.r) { f.x = 1 - f.r; f.contact = 1; }
        if (f.y > HC - f.r) { f.y = HC - f.r; f.contact = 2; }
      }
    }
    for (let i = 0; i < n; i++) {
      const f = fr[i];
      let vx = (f.x - f.px) / dt, vy = (f.y - f.py) / dt;
      if (f.contact) { vx *= 1 - 2.2 * dt; vy *= 1 - 1.2 * dt; }
      const sp = Math.hypot(vx, vy);
      if (sp > 4) { vx *= 4 / sp; vy *= 4 / sp; }
      f.vx = vx; f.vy = vy;
      if (f.contact) f.av += ((vx / f.r) * 0.8 - f.av) * Math.min(1, dt * 10);
      else f.av *= 1 - dt;
      f.ang += f.av * dt;
      if (f.pop > 0) f.pop = Math.max(0, f.pop - dt);
    }
    // merges
    for (let i = 0; i < fr.length; i++) {
      const a = fr[i];
      if (a.dead) continue;
      for (let j = i + 1; j < fr.length; j++) {
        const b = fr[j];
        if (b.dead || b.t !== a.t) continue;
        const dx = b.x - a.x;
        if (dx > a.r + b.r + 0.01) break;
        const dy = b.y - a.y, rs = a.r + b.r + 0.004;
        if (dx * dx + dy * dy > rs * rs) continue;
        a.dead = b.dead = true;
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        if (a.t === RAD.length - 1) {
          w.score += 100;
          w.events.push({ type: 'melon', x: mx, y: my, t: a.t, pts: 100 });
        } else {
          const nt = a.t + 1;
          const pts = mergePts(nt);
          w.score += pts;
          const nf = addFruit(w, nt, mx, my);
          if (nt > w.maxT) w.maxT = nt;
          nf.r = Math.max(a.r, b.r);
          nf.vx = (a.vx + b.vx) / 2; nf.vy = (a.vy + b.vy) / 2 - 0.3;
          nf.px = nf.x; nf.py = nf.y;
          nf.age = 0.5; nf.pop = 0.3; nf.ang = (a.ang + b.ang) / 2;
          w.events.push({ type: 'merge', x: mx, y: my, t: nt, pts });
        }
        break;
      }
    }
    if (w.events.length) w.fr = w.fr.filter((f) => !f.dead);
    // danger line
    let over = false;
    for (const f of w.fr) if (f.age > 1.1 && f.y - f.r < LINE) { over = true; break; }
    w.overT = over ? w.overT + dt : 0;
    if (w.overT > 2) w.lost = true;
  }
  function goalFor(lv) {
    if (lv === 1) return { kind: 'fruit', t: 3 };
    if (lv % 3 === 2) return { kind: 'score', target: Math.round((60 + lv * 26 + Math.pow(lv, 1.5) * 1.6) / 10) * 10 };
    return { kind: 'fruit', t: Math.min(9, 3 + Math.floor(lv / 5)) };
  }
  function prefillCount(lv) { return lv >= 12 ? Math.min(10, 2 + Math.floor((lv - 12) / 5)) : 0; }
  // builds the starting world (pre-placed fruits settle deterministically)
  function genLevel(lv, rng) {
    const w = newWorld();
    const n = prefillCount(lv);
    for (let k = 0; k < n; k++) {
      const t = Math.floor(rng() * 5) + (rng() < 0.3 ? 1 : 0);
      const f = addFruit(w, t, 0.1 + rng() * 0.8, HC - 0.1 - rng() * 0.4);
      f.age = 2;
    }
    for (let s = 0; s < 360; s++) step(w, DT);
    w.events.length = 0; w.score = 0; w.overT = 0; w.lost = false;
    w.maxT = -1;
    w.fr.forEach((f) => { f.age = 2; f.vx = 0; f.vy = 0; f.av = 0; });
    return { world: w, goal: goalFor(lv), first: randType(rng), next: randType(rng) };
  }
  function goalMet(goal, w) { return goal.kind === 'fruit' ? w.maxT >= goal.t : w.score >= goal.target; }
  const LOGIC = { NAMES, RAD, HC, LINE, SPAWN_Y, DT, DROP_COOLDOWN, newWorld, addFruit, randType, step, goalFor, genLevel, goalMet, mergePts };

  // ---------- drawing ----------
  const DPR = () => Math.min(3, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
  function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  function shade(U, c, a) { return U.shade(c, a); }
  function hash(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  function drawFruit(U, g, t, r) {
    const base = COL[t];
    const leaf = (x, y, ang, len, col) => {
      g.save(); g.translate(x, y); g.rotate(ang);
      g.fillStyle = col || '#4cbf4a';
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.5, -len * 0.38, len, 0); g.quadraticCurveTo(len * 0.5, len * 0.38, 0, 0); g.fill();
      g.strokeStyle = 'rgba(30,90,30,0.5)'; g.lineWidth = Math.max(0.6, len * 0.05);
      g.beginPath(); g.moveTo(len * 0.1, 0); g.lineTo(len * 0.85, 0); g.stroke();
      g.restore();
    };
    const stem = (x1, y1, x2, y2, w) => {
      g.strokeStyle = '#7a4a24'; g.lineWidth = w; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo((x1 + x2) / 2 + r * 0.12, (y1 + y2) / 2, x2, y2); g.stroke();
    };
    // shadow under the body
    g.fillStyle = 'rgba(0,0,0,0.12)';
    g.beginPath(); g.ellipse(0, r * 0.08, r * 1.0, r * 1.0, 0, 0, Math.PI * 2); g.fill();
    // body
    const bodyPath = () => { g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); };
    const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.05);
    gr.addColorStop(0, shade(U, base, 0.45)); gr.addColorStop(0.55, base); gr.addColorStop(1, shade(U, base, -0.3));
    g.fillStyle = gr; bodyPath(); g.fill();
    g.save(); bodyPath(); g.clip();
    if (t === 1) {
      g.fillStyle = '#ffe17a';
      for (let k = 0; k < 16; k++) {
        const a = hash(k) * Math.PI * 2, d = 0.25 + hash(k + 40) * 0.65;
        const x = Math.cos(a) * d * r, y = Math.sin(a) * d * r * 0.9 + r * 0.1;
        if (y < -r * 0.45) continue;
        g.beginPath(); g.ellipse(x, y, r * 0.045, r * 0.07, 0, 0, Math.PI * 2); g.fill();
      }
    } else if (t === 2) {
      const pts = [[0, -0.55], [-0.48, -0.22], [0.48, -0.22], [0, 0.08], [-0.5, 0.38], [0.5, 0.38], [0, 0.66], [-0.2, -0.85], [0.25, -0.86]];
      pts.forEach((p) => {
        const gx = p[0] * r, gy = p[1] * r, rr = r * 0.4;
        const g2 = g.createRadialGradient(gx - rr * 0.35, gy - rr * 0.35, rr * 0.1, gx, gy, rr);
        g2.addColorStop(0, '#d7a6ff'); g2.addColorStop(0.6, '#9450d8'); g2.addColorStop(1, '#5a2496');
        g.fillStyle = g2; g.beginPath(); g.arc(gx, gy, rr, 0, Math.PI * 2); g.fill();
      });
    } else if (t === 3 || t === 4) {
      g.fillStyle = 'rgba(160,70,0,0.18)';
      for (let k = 0; k < 26; k++) {
        const a = hash(k + 7) * Math.PI * 2, d = hash(k + 77) * 0.95;
        g.beginPath(); g.arc(Math.cos(a) * d * r, Math.sin(a) * d * r, r * 0.025, 0, Math.PI * 2); g.fill();
      }
    } else if (t === 6) {
      g.fillStyle = 'rgba(140,110,30,0.3)';
      for (let k = 0; k < 22; k++) {
        const a = hash(k + 3) * Math.PI * 2, d = hash(k + 33) * 0.9;
        g.beginPath(); g.arc(Math.cos(a) * d * r, Math.sin(a) * d * r, r * 0.022, 0, Math.PI * 2); g.fill();
      }
    } else if (t === 7) {
      const g2 = g.createLinearGradient(0, -r, 0, r);
      g2.addColorStop(0, 'rgba(255,240,200,0.55)'); g2.addColorStop(1, 'rgba(255,90,130,0.25)');
      g.fillStyle = g2; g.fillRect(-r, -r, 2 * r, 2 * r);
      g.strokeStyle = 'rgba(210,70,110,0.45)'; g.lineWidth = r * 0.05;
      g.beginPath(); g.moveTo(r * 0.05, -r); g.bezierCurveTo(-r * 0.45, -r * 0.5, -r * 0.4, r * 0.3, -r * 0.1, r * 0.95); g.stroke();
    } else if (t === 8) {
      g.strokeStyle = 'rgba(170,100,10,0.55)'; g.lineWidth = r * 0.035;
      for (let k = -6; k <= 6; k++) {
        g.beginPath(); g.moveTo(k * r * 0.32 - r, -r); g.lineTo(k * r * 0.32 + r, r); g.stroke();
        g.beginPath(); g.moveTo(k * r * 0.32 + r, -r); g.lineTo(k * r * 0.32 - r, r); g.stroke();
      }
      g.fillStyle = 'rgba(150,80,0,0.5)';
      for (let a = -6; a <= 6; a++) for (let b = -4; b <= 4; b++) {
        const x = a * r * 0.16 + (b % 2 ? r * 0.08 : 0), y = b * r * 0.32;
        if (x * x + y * y < r * r) { g.beginPath(); g.arc(x, y, r * 0.025, 0, Math.PI * 2); g.fill(); }
      }
    } else if (t === 9) {
      g.strokeStyle = 'rgba(245,255,225,0.75)'; g.lineWidth = r * 0.025;
      for (let k = 0; k < 18; k++) {
        const a = hash(k + 11) * Math.PI * 2, d = hash(k + 111) * 0.8;
        const x = Math.cos(a) * d * r, y = Math.sin(a) * d * r;
        g.beginPath(); g.moveTo(x, y);
        g.bezierCurveTo(x + r * 0.2, y - r * 0.1, x + r * 0.15, y + r * 0.25, x + r * (0.25 - hash(k) * 0.5), y + r * 0.35); g.stroke();
      }
    } else if (t === 10) {
      g.fillStyle = '#1f6e2a';
      for (let k = -3; k <= 3; k++) {
        g.beginPath();
        const cx = k * r * 0.34;
        g.moveTo(cx, -r * 1.1);
        for (let s = 0; s <= 10; s++) { const y = -r * 1.1 + s * r * 0.22; g.lineTo(cx + (s % 2 ? r * 0.07 : -r * 0.04) * (1 - Math.abs(k) * 0.1), y); }
        for (let s = 10; s >= 0; s--) { const y = -r * 1.1 + s * r * 0.22; g.lineTo(cx + r * 0.1 + (s % 2 ? r * 0.07 : -r * 0.04), y); }
        g.closePath(); g.fill();
      }
    }
    // shading rim
    const rim = g.createRadialGradient(0, 0, r * 0.7, 0, 0, r);
    rim.addColorStop(0, 'rgba(0,0,0,0)'); rim.addColorStop(1, 'rgba(0,0,0,0.18)');
    g.fillStyle = rim; g.fillRect(-r, -r, 2 * r, 2 * r);
    g.restore();
    g.strokeStyle = shade(U, base, -0.45); g.lineWidth = Math.max(1, r * 0.04);
    bodyPath(); g.stroke();
    // tops
    if (t === 0) { stem(r * 0.05, -r * 0.85, r * 0.42, -r * 1.38, r * 0.12); leaf(r * 0.4, -r * 1.32, -0.3, r * 0.6); }
    else if (t === 1 || t === 4) {
      g.fillStyle = t === 1 ? '#3fb34f' : '#2f7a33';
      const n = t === 1 ? 5 : 4, yy = -r * 0.86;
      g.beginPath();
      for (let k = 0; k < n * 2; k++) {
        const a = -Math.PI / 2 + k * Math.PI / n;
        const rr = k % 2 ? r * 0.14 : r * (t === 1 ? 0.48 : 0.42);
        g.lineTo(Math.cos(a) * rr, yy + Math.sin(a) * rr * 0.55);
      }
      g.closePath(); g.fill();
      stem(0, yy, r * 0.05, yy - r * 0.22, r * 0.09);
    } else if (t === 2) { stem(0, -r * 0.95, r * 0.12, -r * 1.3, r * 0.1); leaf(r * 0.08, -r * 1.2, -0.7, r * 0.5); }
    else if (t === 3) { leaf(r * 0.02, -r * 0.92, -0.5, r * 0.45); g.fillStyle = shade(U, base, -0.35); g.beginPath(); g.arc(0, -r * 0.9, r * 0.05, 0, Math.PI * 2); g.fill(); }
    else if (t === 5 || t === 6) { stem(0, -r * 0.82, r * 0.06, -r * 1.22, r * 0.09); leaf(r * 0.06, -r * 1.08, -0.45, r * 0.5); }
    else if (t === 7) { leaf(-r * 0.02, -r * 0.92, -2.6, r * 0.5); leaf(r * 0.02, -r * 0.92, -0.45, r * 0.55); }
    else if (t === 8) {
      for (let k = -2; k <= 2; k++) {
        g.save(); g.translate(k * r * 0.12, -r * 0.82); g.rotate(k * 0.35);
        g.fillStyle = k % 2 ? '#2e9440' : '#47b34f';
        g.beginPath(); g.moveTo(-r * 0.11, 0); g.quadraticCurveTo(-r * 0.05, -r * 0.4, 0, -r * (0.55 - Math.abs(k) * 0.07)); g.quadraticCurveTo(r * 0.05, -r * 0.4, r * 0.11, 0); g.closePath(); g.fill();
        g.restore();
      }
    } else if (t === 9) { stem(-r * 0.1, -r * 0.92, r * 0.1, -r * 1.06, r * 0.07); }
    // face
    const ey = t === 2 ? r * 0.02 : r * 0.06, ex = r * 0.3, es = Math.max(1.2, r * 0.095);
    g.fillStyle = '#3b1f1a';
    g.beginPath(); g.ellipse(-ex, ey, es * 0.85, es, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(ex, ey, es * 0.85, es, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff';
    g.beginPath(); g.arc(-ex + es * 0.3, ey - es * 0.35, es * 0.35, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(ex + es * 0.3, ey - es * 0.35, es * 0.35, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,110,140,0.5)';
    g.beginPath(); g.ellipse(-r * 0.5, r * 0.27, r * 0.14, r * 0.09, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(r * 0.5, r * 0.27, r * 0.14, r * 0.09, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#3b1f1a'; g.lineWidth = Math.max(1, r * 0.05); g.lineCap = 'round';
    g.beginPath(); g.arc(0, r * 0.2, r * 0.11, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    // gloss
    g.fillStyle = 'rgba(255,255,255,0.5)';
    g.beginPath(); g.ellipse(-r * 0.42, -r * 0.48, r * 0.2, r * 0.11, -0.7, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(-r * 0.18, -r * 0.66, r * 0.05, 0, Math.PI * 2); g.fill();
  }

  MG.register({
    id: 'fruit', name: '合成水果', icon: '🍉', color: '#2f9e5a',
    _logic: LOGIC,
    create(api) {
      const U = api.util;
      const lvd = genLevel(api.level, api.rng);
      const w = lvd.world;
      const goal = lvd.goal;
      let cur = lvd.first, next = lvd.next;
      let aimX = 0.5, dispX = 0.5, cooldown = 0.25, holding = false;
      let acc = 0, time = 0, ended = false, endT = -1, endWin = false, shake = 0;
      let curPop = 0, pending = false;
      let shownScore = 0;
      const parts = [], rings = [], texts = [];
      let L = {}, spr = [], bg = null;
      let hint = api.level === 1 ? 0 : -1;

      if (api.level === 1) api.info('左右拖曳瞄準，放開投下；相同水果相碰會合成');
      else if (goal.kind === 'fruit') api.info('目標：合成' + NAMES[goal.t]);
      else api.info('目標：得到 ' + goal.target + ' 分');

      function layout() {
        const W = api.W, H = api.H;
        const hud = 62, evo = 34;
        const S = Math.floor(Math.min(W - 36, 520, (H - hud - evo - 18) / (HC + 0.3)));
        const ox = Math.round((W - S) / 2);
        const oy = Math.round(hud + 0.27 * S + Math.max(0, (H - hud - evo - 18 - S * (HC + 0.3)) * 0.4));
        L = { W, H, S, ox, oy, hud, evo };
        const d = DPR();
        spr = RAD.map((r, t) => {
          const rp = r * S, size = rp * 2.9;
          const cv = makeCanvas(size * d, size * d);
          const g = cv.getContext('2d');
          g.scale(d, d); g.translate(size / 2, size / 2);
          drawFruit(U, g, t, rp);
          return { cv, size };
        });
        buildBg();
      }
      function buildBg() {
        const d = DPR();
        bg = makeCanvas(L.W * d, L.H * d);
        const g = bg.getContext('2d');
        g.scale(d, d);
        const gr = g.createLinearGradient(0, 0, 0, L.H);
        gr.addColorStop(0, '#c9f2b5'); gr.addColorStop(0.6, '#9fe08e'); gr.addColorStop(1, '#6fc46d');
        g.fillStyle = gr; g.fillRect(0, 0, L.W, L.H);
        g.fillStyle = 'rgba(255,255,255,0.22)';
        for (let y = 0; y < L.H; y += 34) for (let x = (y / 34) % 2 ? 17 : 0; x < L.W; x += 34) { g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill(); }
        const { ox, oy, S } = L;
        const ch = HC * S, wall = Math.max(8, S * 0.03);
        g.fillStyle = 'rgba(30,80,30,0.25)'; U.rr(g, ox - wall, oy - wall * 0.2 + 8, S + wall * 2, ch + wall * 1.2, wall * 1.6); g.fill();
        const wg = g.createLinearGradient(ox - wall, 0, ox + S + wall, 0);
        wg.addColorStop(0, '#d79a52'); wg.addColorStop(0.5, '#f2c27e'); wg.addColorStop(1, '#c4843f');
        g.fillStyle = wg; U.rr(g, ox - wall, oy - wall * 0.2, S + wall * 2, ch + wall * 1.2, wall * 1.6); g.fill();
        const ig = g.createLinearGradient(0, oy, 0, oy + ch);
        ig.addColorStop(0, '#fff8e6'); ig.addColorStop(1, '#ffe7b8');
        g.fillStyle = ig; U.rr(g, ox, oy, S, ch, wall); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(ox + S * 0.05, oy + 6, S * 0.04, ch - 20);
        g.fillStyle = 'rgba(200,140,60,0.25)'; g.fillRect(ox, oy + ch - S * 0.03, S, S * 0.03);
        // evolution row
        const n = RAD.length, ey = L.H - L.evo / 2 - 4, step = Math.min(30, (L.W - 30) / n);
        g.fillStyle = 'rgba(255,255,255,0.35)'; U.rr(g, L.W / 2 - step * n / 2 - 8, ey - 15, step * n + 16, 30, 15); g.fill();
      }
      layout();

      function toPx(x, y) { return [L.ox + x * L.S, L.oy + y * L.S]; }
      function drawSpr(g, t, x, y, scale, ang) {
        const s = spr[t];
        const sz = s.size * scale;
        if (ang) { g.save(); g.translate(x, y); g.rotate(ang); g.drawImage(s.cv, -sz / 2, -sz / 2, sz, sz); g.restore(); }
        else g.drawImage(s.cv, x - sz / 2, y - sz / 2, sz, sz);
      }

      function juice(x, y, t, big) {
        const c = COL[t];
        const n = big ? 26 : 14;
        for (let k = 0; k < n; k++) {
          if (parts.length > 300) parts.shift();
          const a = Math.random() * Math.PI * 2, v = (60 + Math.random() * 220) * (big ? 1.4 : 1);
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, t: 0, life: 0.45 + Math.random() * 0.4, c: k % 4 === 0 ? '#ffffff' : c, s: 2 + Math.random() * 4 });
        }
        rings.push({ x, y, r: RAD[Math.min(t, RAD.length - 1)] * L.S, t: 0, c });
      }

      function drop() {
        if (ended || endT >= 0) return;
        if (cooldown > 0) { pending = true; return; }
        pending = false;
        const r = RAD[cur];
        addFruit(w, cur, U.clamp(aimX, r, 1 - r), SPAWN_Y);
        api.sfx('drop');
        cur = next; next = randType(api.rng);
        cooldown = DROP_COOLDOWN; curPop = 0;
        hint = -1;
      }

      function update(dt) {
        time += dt;
        if (shake > 0) shake = Math.max(0, shake - dt);
        if (hint >= 0) hint += dt;
        shownScore += (w.score - shownScore) * Math.min(1, dt * 10);
        if (!ended && endT < 0) {
          if (cooldown > 0) { cooldown -= dt; if (cooldown <= 0 && pending) drop(); }
          curPop = Math.min(1, curPop + dt * 4);
          acc += dt;
          let steps = 0;
          while (acc >= DT && steps < 8) { step(w, DT); acc -= DT; steps++; }
          if (steps >= 8) acc = 0;
          for (const e of w.events) {
            const [x, y] = toPx(e.x, e.y);
            juice(x, y, e.t, e.t >= 6 || e.type === 'melon');
            texts.push({ str: '+' + e.pts, x, y, t: 0 });
            if (e.t >= 5) { shake = Math.min(0.3, 0.05 * (e.t - 3)); api.sfx('good'); } else api.sfx('pop');
            if (e.type === 'merge' && goal.kind === 'fruit' && e.t === goal.t) texts.push({ str: NAMES[e.t] + '！', x: L.W / 2, y: L.oy + L.S * 0.5, t: 0, big: 1 });
          }
          w.events.length = 0;
          if (goalMet(goal, w)) {
            endT = 0; endWin = true;
            for (let k = 0; k < 50; k++) juice(L.W * Math.random(), L.oy + Math.random() * L.S * 0.6, Math.floor(Math.random() * 11), false);
          } else if (w.lost) { endT = 0; endWin = false; shake = 0.3; api.sfx('bad'); }
        } else if (endT >= 0 && !ended) {
          endT += dt;
          if (endT > 0.8) { ended = true; if (endWin) api.win(goal.kind === 'fruit' ? '成功合成' + NAMES[goal.t] + '！' : '得分 ' + w.score + '！'); else api.lose('水果超過警戒線了'); }
        }
        dispX += (aimX - dispX) * Math.min(1, dt * 18);
        for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.t += dt; p.vy += 700 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.t > p.life) parts.splice(i, 1); }
        for (let i = rings.length - 1; i >= 0; i--) { rings[i].t += dt; if (rings[i].t > 0.4) rings.splice(i, 1); }
        for (let i = texts.length - 1; i >= 0; i--) { texts[i].t += dt; if (texts[i].t > 1) texts.splice(i, 1); }
      }

      function draw(g) {
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake * 24, (Math.random() - 0.5) * shake * 24);
        g.drawImage(bg, 0, 0, L.W, L.H);
        const { ox, oy, S } = L;
        // HUD: score (left), goal (center), next (right)
        const hy = 30;
        g.fillStyle = 'rgba(255,255,255,0.55)'; U.rr(g, 10, hy - 22, 92, 44, 14); g.fill();
        U.text(g, '分數', 56, hy - 9, 11, '#3f7d38', 'center', 800);
        U.text(g, String(Math.round(shownScore)), 56, hy + 9, 19, '#2c5a27', 'center', 900);
        const gw = Math.min(150, L.W - 230);
        g.fillStyle = 'rgba(255,255,255,0.75)'; U.rr(g, L.W / 2 - gw / 2, hy - 22, gw, 44, 14); g.fill();
        if (goal.kind === 'fruit') {
          const sc = 15 / (RAD[goal.t] * S);
          drawSpr(g, goal.t, L.W / 2 - gw / 2 + 24, hy + 2, sc, 0);
          U.text(g, '目標', L.W / 2 + 12, hy - 9, 11, '#a0602a', 'center', 800);
          U.text(g, NAMES[goal.t], L.W / 2 + 12, hy + 9, 16, '#8a3d10', 'center', 900);
        } else {
          U.text(g, '目標分數', L.W / 2, hy - 9, 11, '#a0602a', 'center', 800);
          U.text(g, String(goal.target), L.W / 2, hy + 9, 17, '#8a3d10', 'center', 900);
        }
        g.fillStyle = 'rgba(255,255,255,0.55)'; U.rr(g, L.W - 102, hy - 22, 92, 44, 14); g.fill();
        U.text(g, '下一個', L.W - 74, hy, 12, '#3f7d38', 'center', 800);
        drawSpr(g, next, L.W - 32, hy + 2, Math.min(1, 15 / (RAD[next] * S)), 0);
        // danger line
        const ly = oy + LINE * S;
        const warn = w.overT > 0;
        g.strokeStyle = warn ? 'rgba(255,40,40,' + (0.55 + 0.45 * Math.sin(time * 16)) + ')' : 'rgba(230,90,70,0.35)';
        g.lineWidth = warn ? 3 : 2;
        g.setLineDash([10, 8]); g.beginPath(); g.moveTo(ox + 4, ly); g.lineTo(ox + S - 4, ly); g.stroke(); g.setLineDash([]);
        // aim guide + hanging fruit
        if (endT < 0) {
          const r = RAD[cur];
          const ax = ox + U.clamp(dispX, r, 1 - r) * S;
          g.strokeStyle = 'rgba(255,255,255,' + (holding ? 0.85 : 0.5) + ')'; g.lineWidth = 2;
          g.setLineDash([6, 8]); g.beginPath(); g.moveTo(ax, oy + SPAWN_Y * S + r * S); g.lineTo(ax, oy + HC * S - 4); g.stroke(); g.setLineDash([]);
          if (cooldown <= 0.3) {
            const sc = cooldown > 0 ? 0.6 : U.easeOutBack(Math.min(1, curPop));
            drawSpr(g, cur, ax, oy + SPAWN_Y * S + Math.sin(time * 3) * 2, Math.max(0.05, sc), 0);
          }
        }
        // fruits
        for (const f of w.fr) {
          const [x, y] = toPx(f.x, f.y);
          const sc = (f.r / RAD[f.t]) * (f.pop > 0 ? 1 + Math.sin((1 - f.pop / 0.3) * Math.PI) * 0.12 : 1);
          drawSpr(g, f.t, x, y, sc, f.ang);
        }
        // rings, particles, texts
        for (const r of rings) {
          const k = r.t / 0.4;
          g.globalAlpha = 1 - k; g.strokeStyle = r.c; g.lineWidth = 4 * (1 - k) + 1;
          g.beginPath(); g.arc(r.x, r.y, r.r * (1 + k * 0.8), 0, Math.PI * 2); g.stroke();
        }
        for (const p of parts) {
          g.globalAlpha = Math.max(0, 1 - p.t / p.life); g.fillStyle = p.c;
          g.beginPath(); g.arc(p.x, p.y, p.s, 0, Math.PI * 2); g.fill();
        }
        g.globalAlpha = 1;
        for (const t of texts) {
          const k = t.t;
          g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
          const size = t.big ? 34 : 18;
          const sc = t.big ? U.easeOutBack(Math.min(1, k / 0.25)) : 1;
          g.save(); g.translate(t.x, t.y - k * (t.big ? 20 : 36)); g.scale(sc, sc);
          g.font = '900 ' + size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 5; g.strokeStyle = 'rgba(80,40,10,0.7)'; g.lineJoin = 'round'; g.strokeText(t.str, 0, 0);
          U.text(g, t.str, 0, 0, size, t.big ? '#fff36b' : '#fff', 'center', 900);
          g.restore();
        }
        g.globalAlpha = 1;
        // evolution chain
        const n = RAD.length, ey = L.H - L.evo / 2 - 4, stp = Math.min(30, (L.W - 30) / n);
        for (let t = 0; t < n; t++) {
          const x = L.W / 2 - stp * n / 2 + stp * (t + 0.5);
          const reached = t <= w.maxT;
          g.globalAlpha = reached ? 1 : 0.45;
          drawSpr(g, t, x, ey, (stp * 0.4) / (RAD[t] * S), 0);
          if (goal.kind === 'fruit' && t === goal.t) {
            g.globalAlpha = 1; g.strokeStyle = '#ff5a3c'; g.lineWidth = 2.5;
            g.beginPath(); g.arc(x, ey, stp * 0.5, 0, Math.PI * 2); g.stroke();
          }
        }
        g.globalAlpha = 1;
        // level-1 swipe hint
        if (hint >= 0 && hint < 7) {
          const k = (Math.sin(hint * 2.2) + 1) / 2;
          const hx = ox + S * (0.25 + 0.5 * k), hy2 = oy + S * 0.35;
          g.globalAlpha = 0.85; g.fillStyle = '#fff';
          g.beginPath(); g.arc(hx, hy2, 13, 0, Math.PI * 2); g.fill();
          g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 3; g.beginPath(); g.arc(hx, hy2, 21, 0, Math.PI * 2); g.stroke();
          g.globalAlpha = 1;
        }
        if (w.overT > 0 && endT < 0) U.text(g, '危險！' + Math.max(0, 2 - w.overT).toFixed(1), L.W / 2, ly - 16, 16, '#ff3030', 'center', 900);
        g.restore();
      }

      function setAim(x) { aimX = U.clamp((x - L.ox) / L.S, 0, 1); }
      return {
        update, draw,
        down(x) { if (api.ended || endT >= 0) return; holding = true; setAim(x); },
        move(x) { if (holding) setAim(x); },
        up(x) { if (!holding) return; holding = false; setAim(x); drop(); },
        resize() { layout(); },
      };
    },
  });
})();
