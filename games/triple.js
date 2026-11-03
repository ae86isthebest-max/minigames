// 三個消除 — Tile Match / Triple Tile.
(function () {
  'use strict';
  const ICONS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🍍', '🥝', '🍉', '🍋', '🐶', '🐱', '🐼', '🐰', '🐸', '🐥', '🦊', '🐻', '🍩', '🍰', '🍭', '🧁', '🍪', '🍬'];
  const TRAY = 7;

  // ---------- pure level logic (shared with tools/check_triple.js) ----------
  function overlaps(a, b) { return Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2; }
  function computeAbove(tiles) {
    return tiles.map((t, i) => {
      const o = [];
      tiles.forEach((u, j) => { if (j !== i && u.z > t.z && overlaps(t, u)) o.push(j); });
      return o;
    });
  }
  // diff: 0 簡單 (original), 1 普通, 2 困難
  function config(lvIn, diff) {
    diff = diff || 0;
    const lv = diff === 0 ? lvIn : diff === 1 ? lvIn + 12 : lvIn + 30;
    const cf = baseConfig(lv);
    if (diff === 1) cf.kinds = Math.min(18, cf.kinds + 1);
    if (diff === 2) {
      cf.kinds = Math.min(22, cf.kinds + 4);
      cf.trayLimit = 5;
      cf.stackDepth = Math.min(9, cf.stackDepth + 2);
      cf.groups = Math.min(45, cf.groups + 3);
    }
    cf.timeLimit = diff === 2 ? Math.round(cf.groups * 3 * 1.35 + 20) : 0;
    cf.boosters = diff === 2 ? [0, 1] : [0, 1, 2];
    cf.hideDeep = diff === 2;
    return cf;
  }
  function baseConfig(lv) {
    const groups = lv === 1 ? 3 : lv === 2 ? 5 : Math.min(40, 4 + Math.round(lv * 0.7));
    const stackDepth = lv >= 10 ? Math.min(7, 2 + Math.floor((lv - 10) / 8)) : 0;
    const C = lv <= 2 ? 4 : lv < 6 ? 5 : lv < 14 ? 6 : 7;
    const R = lv <= 2 ? 4 : lv < 6 ? 5 : stackDepth ? 5 : 6;
    const layers = lv <= 2 ? 2 : lv < 6 ? 3 : Math.min(8, 3 + Math.floor(lv / 8));
    const kinds = Math.min(16, 3 + Math.floor(lv / 2.5));
    const trayLimit = lv < 4 ? 2 : lv < 20 ? 3 : lv < 45 ? 4 : 5;
    return { groups, C, R, kinds, trayLimit, stackDepth, layers };
  }
  function shuffle(rng, a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function genLevel(lv, rng, diff) {
    const cf = config(lv, diff);
    const N = cf.groups * 3;
    const tiles = [];
    let need = N - cf.stackDepth * 2;
    const maxX = cf.C * 2 - 2, maxY = cf.R * 2 - 2;
    const boardN = need;
    for (let k = 0; k < 30 && need > 0; k++) {
      const off = k % 2;
      const shrink = Math.min(Math.floor(k / 4), Math.floor((cf.R - 3) / 2));
      const units = [];
      for (let y = off + shrink * 2; y <= maxY - off - shrink * 2; y += 2) {
        for (let x = off + shrink * 2; x <= maxX / 2; x += 2) {
          const mx = maxX - x;
          const cells = mx === x ? [{ x, y }] : [{ x, y }, { x: mx, y }];
          const ok = cells.every((c) => k === 0 || tiles.some((p) => p.z === k - 1 && overlaps(c, p)) || (k > 1 && tiles.some((p) => p.z < k && overlaps(c, p))));
          if (ok) units.push(cells);
        }
      }
      if (!units.length) continue;
      shuffle(rng, units);
      const capAll = units.reduce((s, u) => s + u.length, 0);
      const share = Math.ceil(boardN / cf.layers * (k === 0 ? 1.25 : 1));
      let cap = Math.max(1, Math.min(Math.round(capAll * 0.9), k >= cf.layers - 1 ? need : share));
      const layer = [];
      for (const u of units) {
        if (need <= 0 || cap <= 0) break;
        const take = u.length <= need ? u : u.slice(0, need);
        take.forEach((c) => { layer.push({ x: c.x, y: c.y, z: k }); });
        need -= take.length; cap -= take.length;
      }
      layer.forEach((t) => tiles.push(t));
    }
    while (need > 0) { tiles.push({ x: (tiles.length % (cf.C)) * 2, y: 0, z: 40 + tiles.length }); need--; }
    const boardH = maxY + 2;
    for (let s = 0; s < 2; s++) {
      for (let i = 0; i < cf.stackDepth; i++) {
        const x = s === 0 ? 0.3 + i * 0.3 : maxX - 0.3 - i * 0.3;
        tiles.push({ x, y: boardH + 0.7, z: i, stack: 1 });
      }
    }
    // witness removal order: always remove some currently-uncovered tile
    const above = computeAbove(tiles);
    const alive = tiles.map(() => true);
    const order = [];
    for (let step = 0; step < tiles.length; step++) {
      const free = [];
      for (let i = 0; i < tiles.length; i++) if (alive[i] && !above[i].some((j) => alive[j])) free.push(i);
      const pick = free[Math.floor(rng() * free.length)];
      alive[pick] = false; order.push(pick);
    }
    // assign icons along the order, simulating the 7-slot tray (occupancy kept <= trayLimit)
    const kinds = shuffle(rng, ICONS.slice()).slice(0, cf.kinds);
    let kindPtr = 0;
    const kindBag = [];
    const nextKind = () => {
      if (!kindBag.length) { shuffle(rng, kinds.slice()).forEach((k) => kindBag.push(k)); }
      kindPtr++;
      return kindBag.pop();
    };
    const open = [];
    let traySize = 0, remaining = order.length;
    order.forEach((ti) => {
      const openNeed = open.reduce((s, gr) => s + (3 - gr.n), 0);
      let joinIdx = -1;
      const mustJoin = remaining <= openNeed || traySize + 1 > cf.trayLimit;
      if (open.length && mustJoin) {
        joinIdx = 0;
        open.forEach((gr, k) => { if (gr.n > open[joinIdx].n) joinIdx = k; });
      } else if (open.length && rng() < 0.55) joinIdx = Math.floor(rng() * open.length);
      if (joinIdx < 0) {
        const icon = nextKind();
        open.push({ icon, n: 1 });
        traySize++;
        tiles[ti].icon = icon;
      } else {
        const gr = open[joinIdx];
        gr.n++; traySize++;
        tiles[ti].icon = gr.icon;
        if (gr.n === 3) { open.splice(joinIdx, 1); traySize -= 3; }
      }
      remaining--;
    });
    return { tiles, order, cf, boardW: maxX + 2, boardH: boardH + (cf.stackDepth ? 2.9 : 0) };
  }
  // play a sequence of taps with full game rules; returns {ok, maxTray, reason}
  function simulate(tiles, seq) {
    const above = computeAbove(tiles);
    const alive = tiles.map(() => true);
    const tray = [];
    let maxTray = 0;
    for (const i of seq) {
      if (!alive[i]) return { ok: false, reason: 'tile already taken' };
      if (above[i].some((j) => alive[j])) return { ok: false, reason: 'tile covered' };
      alive[i] = false;
      tray.push(tiles[i].icon);
      const same = tray.filter((c) => c === tiles[i].icon).length;
      if (same >= 3) { let n = 0; for (let k = tray.length - 1; k >= 0 && n < 3; k--) if (tray[k] === tiles[i].icon) { tray.splice(k, 1); n++; } }
      maxTray = Math.max(maxTray, tray.length);
      if (tray.length >= TRAY) return { ok: false, reason: 'tray full', maxTray };
    }
    const ok = alive.every((a) => !a) && tray.length === 0;
    return { ok, maxTray, reason: ok ? '' : 'not cleared' };
  }
  const LOGIC = { ICONS, TRAY, config, genLevel, computeAbove, simulate, overlaps };

  const DPR = () => Math.min(3, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
  function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }

  MG.register({
    id: 'triple', name: '三個消除', icon: '🧺', color: '#ff8f3d',
    _logic: LOGIC,
    create(api) {
      const U = api.util;
      const lvd = genLevel(api.level, api.rng, api.diff);
      const cf = lvd.cf;
      let timeLeft = cf.timeLimit;
      const tiles = lvd.tiles.map((t, i) => ({ x: t.x, y: t.y, z: t.z, icon: t.icon, alive: true, i, flip: 0, ret: -1, rx: 0, ry: 0, shake: 0 }));
      const above = computeAbove(lvd.tiles);
      const drawOrder = tiles.slice().sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);
      const tray = [];
      const shelf = [];
      const BN = ['撤銷', '移出', '洗牌'];
      const boosters = cf.boosters.map((k) => ({ name: BN[k], used: false, kind: k }));
      let lastMove = null;
      let time = 0, ended = false, endT = -1, endWin = false, shake = 0;
      const parts = [];
      let L = {};
      let spr = {}, sprDark = {}, bg = null;
      let boardLeft = tiles.length;
      let hint = api.level === 1 && api.diff === 0 ? 0 : -1;
      const covered = new Uint8Array(tiles.length);
      function refreshCover() {
        for (let i = 0; i < tiles.length; i++) {
          let n = 0;
          for (const j of above[i]) if (tiles[j].alive) n++;
          covered[i] = n === 0 ? 0 : n >= 2 && cf.hideDeep ? 2 : 1;
        }
      }
      refreshCover();

      if (api.level === 1 && api.diff === 0) api.info('點擊沒被蓋住的圖塊，湊齊 3 個相同就會消除');
      else if (cf.timeLimit) api.info('限時 ' + cf.timeLimit + ' 秒 · 壓在深處的圖塊看不見');
      else api.info('清空所有圖塊即過關 · 收集欄滿 7 格就失敗');

      function layout() {
        const W = api.W, H = api.H;
        const ss = Math.floor(Math.min((W - 36) / TRAY, 58));
        const boostH = Math.max(66, ss * 1.25);
        const trayH = ss * 1.32;
        const trayY = H - boostH - trayH - 6;
        const shelfH = ss * 1.1;
        const shelfY = trayY - shelfH - 4;
        const top = 44;
        const availH = shelfY - top - 8;
        const bw = lvd.boardW / 2, bh = lvd.boardH / 2;
        const thick = 0.13;
        let ts = Math.min((W - 24) / bw, availH / (bh * 1.12 + thick + 0.1), 78);
        ts = Math.floor(ts);
        const th = Math.round(ts * 1.12);
        const bx = Math.round((W - bw * ts) / 2);
        const by = Math.round(top + (availH - (bh * th + ts * thick)) / 2);
        L = { W, H, ss, boostH, trayH, trayY, shelfY, shelfH, ts, th, thick: Math.round(ts * thick), bx, by };
        buildSprites();
        buildBg();
      }
      function tileSprite(icon, w, h, thick, dark) {
        const d = DPR();
        const cv = makeCanvas((w + 4) * d, (h + thick + 6) * d);
        const g = cv.getContext('2d');
        g.scale(d, d);
        g.translate(2, 2);
        const r = w * 0.17;
        g.fillStyle = 'rgba(80,40,10,0.28)'; U.rr(g, 1, 3, w, h + thick, r); g.fill();
        g.fillStyle = '#b8935a'; U.rr(g, 0, thick * 0.6, w, h + thick * 0.4, r); g.fill();
        g.fillStyle = '#d9bb83'; U.rr(g, 0, thick * 0.3, w, h + thick * 0.2, r); g.fill();
        const gr = g.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, '#fffdf5'); gr.addColorStop(1, '#f4e6c8');
        g.fillStyle = gr; U.rr(g, 0, 0, w, h, r); g.fill();
        g.strokeStyle = '#e2c995'; g.lineWidth = Math.max(1, w * 0.025); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.8)'; U.rr(g, w * 0.12, h * 0.06, w * 0.76, h * 0.07, h * 0.035); g.fill();
        g.font = Math.round(w * 0.62) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        if (icon === '?') { g.font = '900 ' + Math.round(w * 0.5) + 'px sans-serif'; g.fillStyle = '#b08850'; }
        g.fillText(icon, w / 2, h * 0.54);
        if (dark) { g.fillStyle = 'rgba(40,25,10,0.5)'; U.rr(g, 0, 0, w, h + thick, r); g.fill(); }
        return cv;
      }
      function buildSprites() {
        spr = {}; sprDark = {};
        const icons = {};
        tiles.forEach((t) => { icons[t.icon] = 1; });
        Object.keys(icons).forEach((ic) => {
          spr[ic] = tileSprite(ic, L.ts, L.th, L.thick, false);
          sprDark[ic] = tileSprite(ic, L.ts, L.th, L.thick, true);
        });
        sprDark['?'] = tileSprite('?', L.ts, L.th, L.thick, true);
      }
      function buildBg() {
        const d = DPR();
        bg = makeCanvas(L.W * d, L.H * d);
        const g = bg.getContext('2d');
        g.scale(d, d);
        const gr = g.createLinearGradient(0, 0, 0, L.H);
        gr.addColorStop(0, '#ffd88a'); gr.addColorStop(0.5, '#ffb46a'); gr.addColorStop(1, '#f2894e');
        g.fillStyle = gr; g.fillRect(0, 0, L.W, L.H);
        const rr = api.rng;
        g.fillStyle = '#fff';
        for (let k = 0; k < 18; k++) {
          g.globalAlpha = 0.06 + ((k * 37) % 10) / 100;
          const x = ((k * 97) % 100) / 100 * L.W, y = ((k * 53) % 100) / 100 * L.H, r = 20 + ((k * 31) % 60);
          g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
        }
        void rr;
        g.globalAlpha = 1;
        // tray
        const tw = L.ss * TRAY + 16, tx = (L.W - tw) / 2;
        g.fillStyle = 'rgba(90,40,10,0.3)'; U.rr(g, tx, L.trayY + 5, tw, L.trayH, 16); g.fill();
        const tg = g.createLinearGradient(0, L.trayY, 0, L.trayY + L.trayH);
        tg.addColorStop(0, '#a8643a'); tg.addColorStop(1, '#7b4122');
        g.fillStyle = tg; U.rr(g, tx, L.trayY, tw, L.trayH, 16); g.fill();
        g.strokeStyle = '#d99a62'; g.lineWidth = 2.5; g.stroke();
        for (let i = 0; i < TRAY; i++) {
          g.fillStyle = '#5e2f17';
          U.rr(g, tx + 8 + i * L.ss + 2, L.trayY + (L.trayH - L.ss * 1.12) / 2 - 1, L.ss - 4, L.ss * 1.12, L.ss * 0.16); g.fill();
        }
      }
      layout();

      function tileXY(t) { return [L.bx + t.x * L.ts / 2, L.by + t.y * L.th / 2]; }
      function slotPos(i, n) {
        const tw = L.ss * TRAY, tx = (L.W - tw) / 2;
        const step = n > TRAY ? tw / n : L.ss;
        const w = L.ss - 4, h = Math.round(w * 1.12);
        return [tx + i * step + 2, L.trayY + (L.trayH - h) / 2 - 3, w, h];
      }
      function shelfPos(i) {
        const w = L.ss - 4, h = Math.round(w * 1.12);
        const x0 = L.W / 2 - 1.5 * L.ss;
        return [x0 + i * L.ss + 2, L.shelfY + (L.shelfH - h) / 2, w, h];
      }
      function boosterPos(i) {
        const r = Math.min(26, L.boostH * 0.36);
        return [L.W / 2 + (i - (boosters.length - 1) / 2) * Math.min(110, L.W * 0.28), L.H - L.boostH / 2 - 12, r];
      }

      function liveCount() { return tray.filter((e) => !e.m).length; }
      function addToTray(icon, fx, fy, fw, fh, src) {
        let at = tray.length;
        for (let k = tray.length - 1; k >= 0; k--) if (tray[k].icon === icon && !tray[k].m) { at = k + 1; break; }
        const e = { icon, fx, fy, fw, fh, t: 0, x: fx, y: fy, w: fw, h: fh, m: 0, mt: 0, src };
        tray.splice(at, 0, e);
        const same = tray.filter((q) => q.icon === icon && !q.m);
        let matched = false;
        if (same.length >= 3) { same.slice(0, 3).forEach((q) => { q.m = 1; }); matched = true; }
        lastMove = matched ? null : e;
        if (!matched && liveCount() >= TRAY) { endT = 0; endWin = false; }
        api.sfx('tap');
      }

      function tapTile(t) {
        const [x, y] = tileXY(t);
        t.alive = false; boardLeft--;
        refreshCover();
        addToTray(t.icon, x, y, L.ts, L.th, { tile: t });
        hint = -1;
      }
      function burst(x, y, n, colors) {
        for (let k = 0; k < n; k++) {
          if (parts.length > 300) parts.shift();
          const a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 260;
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, t: 0, life: 0.5 + Math.random() * 0.4, c: colors[k % colors.length], s: 3 + Math.random() * 5, star: k % 3 === 0 });
        }
      }

      function update(dt) {
        time += dt;
        if (shake > 0) shake = Math.max(0, shake - dt);
        if (hint >= 0) hint += dt;
        tiles.forEach((t) => {
          if (t.flip > 0) t.flip = Math.max(0, t.flip - dt * 2.2);
          if (t.shake > 0) t.shake = Math.max(0, t.shake - dt);
          if (t.ret >= 0) { t.ret += dt / 0.28; if (t.ret >= 1) t.ret = -1; }
        });
        const n = tray.length;
        tray.forEach((e, i) => {
          const [sx, sy, sw, sh] = slotPos(i, n);
          if (e.t < 1) {
            e.t = Math.min(1, e.t + dt / 0.3);
            const k = U.easeOutCubic(e.t);
            const mx = (e.fx + sx) / 2, my = Math.min(e.fy, sy) - 60;
            const a = (1 - k) * (1 - k), b = 2 * (1 - k) * k, c = k * k;
            e.x = a * e.fx + b * mx + c * sx; e.y = a * e.fy + b * my + c * sy;
            e.w = U.lerp(e.fw, sw, k); e.h = U.lerp(e.fh, sh, k);
          } else {
            const f = Math.min(1, dt * 16);
            e.x += (sx - e.x) * f; e.y += (sy - e.y) * f; e.w = sw; e.h = sh;
          }
        });
        // matches: once the three have landed, merge into the middle and pop
        const groups = {};
        tray.forEach((e) => { if (e.m) (groups[e.icon] = groups[e.icon] || []).push(e); });
        Object.keys(groups).forEach((ic) => {
          const gq = groups[ic];
          if (!gq.every((e) => e.t >= 1)) return;
          gq.forEach((e) => { e.mt += dt; });
          if (gq[0].mt > 0.26) {
            const mid = gq[Math.min(1, gq.length - 1)];
            burst(mid.x + mid.w / 2, mid.y + mid.h / 2, 18, ['#ffe066', '#fff', '#ff8fb1', '#7ee0ff']);
            api.sfx('pop');
            gq.forEach((e) => { const k = tray.indexOf(e); if (k >= 0) tray.splice(k, 1); });
          }
        });
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i]; p.t += dt; p.vy += 600 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.t > p.life) parts.splice(i, 1);
        }
        shelf.forEach((e) => { const f = Math.min(1, dt * 12); e.t = Math.min(1, e.t + dt * 4); e.x += (e.tx - e.x) * f; e.y += (e.ty - e.y) * f; e.w += (e.tw - e.w) * f; e.h += (e.th - e.h) * f; });
        if (!ended && cf.timeLimit && endT < 0) {
          timeLeft -= dt;
          if (timeLeft <= 0) { timeLeft = 0; ended = true; shake = 0.3; api.sfx('bad'); api.lose('時間到了'); }
        }
        if (!ended) {
          if (endT >= 0 && !endWin && tray.every((e) => e.t >= 1)) {
            endT += dt;
            if (endT === dt) { shake = 0.3; api.sfx('bad'); }
            if (endT > 1.1) { ended = true; api.lose('收集欄滿了'); }
          }
          if (endT < 0 && boardLeft === 0 && tray.length === 0 && shelf.length === 0) {
            endT = 0; endWin = true;
            for (let k = 0; k < 70; k++) burst(L.W * Math.random(), L.H * 0.35 * Math.random() + 40, 1, ['#ff5d6c', '#ffd23a', '#4cd986', '#4c9bff', '#ff7ac8']);
          }
          if (endWin && endT >= 0) { endT += dt; if (endT > 0.4) { ended = true; api.win('全部清空！'); } }
        }
      }

      function drawTile(g, icon, x, y, w, h, dark, sc) {
        const s = dark ? sprDark[icon] : spr[icon];
        const k = w / L.ts;
        const dw = (L.ts + 4) * k, dh = (L.th + L.thick + 6) * k;
        if (sc && sc !== 1) {
          g.save(); g.translate(x + w / 2, y + h / 2); g.scale(sc, sc);
          g.drawImage(s, -w / 2 - 2 * k, -h / 2 - 2 * k, dw, dh); g.restore();
        } else g.drawImage(s, x - 2 * k, y - 2 * k, dw, dh);
      }
      function drawBoosterIcon(g, i, x, y, r, on) {
        g.save(); g.translate(x, y);
        g.strokeStyle = on ? '#fff' : '#d8d0c8'; g.fillStyle = g.strokeStyle; g.lineWidth = r * 0.16; g.lineCap = 'round'; g.lineJoin = 'round';
        if (i === 0) {
          g.beginPath(); g.arc(r * 0.05, r * 0.08, r * 0.38, Math.PI * 1.05, Math.PI * 2.35); g.stroke();
          g.beginPath(); g.moveTo(-r * 0.5, -r * 0.32); g.lineTo(-r * 0.36, r * 0.06); g.lineTo(-r * 0.02, -r * 0.14); g.closePath(); g.fill();
        } else if (i === 1) {
          for (let k = 0; k < 3; k++) { U.rr(g, -r * 0.48 + k * r * 0.34, r * 0.12, r * 0.28, r * 0.32, r * 0.06); g.fill(); }
          g.beginPath(); g.moveTo(0, r * 0.02); g.lineTo(0, -r * 0.48); g.stroke();
          g.beginPath(); g.moveTo(-r * 0.2, -r * 0.3); g.lineTo(0, -r * 0.5); g.lineTo(r * 0.2, -r * 0.3); g.stroke();
        } else {
          g.beginPath(); g.moveTo(-r * 0.5, -r * 0.25); g.bezierCurveTo(-r * 0.05, -r * 0.25, r * 0.05, r * 0.25, r * 0.45, r * 0.25); g.stroke();
          g.beginPath(); g.moveTo(-r * 0.5, r * 0.25); g.bezierCurveTo(-r * 0.05, r * 0.25, r * 0.05, -r * 0.25, r * 0.45, -r * 0.25); g.stroke();
          g.beginPath(); g.moveTo(r * 0.3, -r * 0.4); g.lineTo(r * 0.5, -r * 0.25); g.lineTo(r * 0.3, -r * 0.1); g.stroke();
          g.beginPath(); g.moveTo(r * 0.3, r * 0.1); g.lineTo(r * 0.5, r * 0.25); g.lineTo(r * 0.3, r * 0.4); g.stroke();
        }
        g.restore();
      }

      function draw(g) {
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake * 30, (Math.random() - 0.5) * shake * 16);
        g.drawImage(bg, 0, 0, L.W, L.H);
        // remaining pill
        const pillW = 112;
        g.fillStyle = 'rgba(120,50,10,0.28)'; U.rr(g, L.W / 2 - pillW / 2, 8, pillW, 28, 14); g.fill();
        U.text(g, '剩餘 ' + (boardLeft + shelf.length) + ' 張', L.W / 2, 22, 15, '#fff', 'center', 800);
        if (cf.timeLimit) {
          const tl = Math.max(0, Math.ceil(timeLeft));
          const low = tl <= 15;
          const tx = L.W - 62;
          g.fillStyle = low ? 'rgba(220,30,40,' + (0.6 + 0.3 * Math.sin(time * 10)) + ')' : 'rgba(120,50,10,0.28)';
          U.rr(g, tx - 44, 8, 88, 28, 14); g.fill();
          U.text(g, '⏱ ' + Math.floor(tl / 60) + ':' + String(tl % 60).padStart(2, '0'), tx, 22, 15, '#fff', 'center', 800);
        }
        // board
        for (const t of drawOrder) {
          if (!t.alive) continue;
          let [x, y] = tileXY(t);
          if (t.shake > 0) x += Math.sin(t.shake * 60) * 5 * t.shake / 0.3;
          if (t.ret >= 0) { const k = U.easeOutCubic(t.ret); x = U.lerp(t.rx, x, k); y = U.lerp(t.ry, y, k); }
          const dark = covered[t.i] > 0;
          const ic = covered[t.i] === 2 ? '?' : t.icon;
          if (t.flip > 0) {
            const sx = Math.abs(Math.cos((1 - t.flip) * Math.PI * 2));
            g.save(); g.translate(x + L.ts / 2, y + L.th / 2); g.scale(Math.max(0.05, sx), 1);
            drawTile(g, ic, -L.ts / 2, -L.th / 2, L.ts, L.th, dark, 1); g.restore();
          } else drawTile(g, ic, x, y, L.ts, L.th, dark, 1);
        }
        // level-1 hint ring on a free tile
        if (hint >= 0 && hint < 8) {
          const t = drawOrder.slice().reverse().find((q) => q.alive && !covered[q.i]);
          if (t) {
            const [x, y] = tileXY(t);
            g.strokeStyle = 'rgba(255,255,255,' + (0.5 + 0.5 * Math.sin(time * 6)) + ')'; g.lineWidth = 4;
            U.rr(g, x - 3, y - 3, L.ts + 6, L.th + 6, L.ts * 0.2); g.stroke();
          }
        }
        // shelf
        if (shelf.length) {
          g.fillStyle = 'rgba(120,60,20,0.22)'; U.rr(g, L.W / 2 - 1.5 * L.ss - 6, L.shelfY - 2, 3 * L.ss + 12, L.shelfH + 4, 12); g.fill();
        }
        shelf.forEach((e) => drawTile(g, e.icon, e.x, e.y, e.w, e.h, false, 1));
        // tray
        const full = liveCount() >= TRAY - 1;
        if (full) {
          g.strokeStyle = 'rgba(255,60,60,' + (0.45 + 0.45 * Math.sin(time * 10)) + ')'; g.lineWidth = 4;
          const tw = L.ss * TRAY + 16; U.rr(g, (L.W - tw) / 2 - 2, L.trayY - 2, tw + 4, L.trayH + 4, 18); g.stroke();
        }
        tray.forEach((e) => {
          let sc = 1, x = e.x, y = e.y;
          if (e.m && e.mt > 0) {
            const gq = tray.filter((q) => q.m && q.icon === e.icon);
            const mid = gq[Math.min(1, gq.length - 1)];
            const k = Math.min(1, e.mt / 0.14);
            x = U.lerp(e.x, mid.x, U.easeOutCubic(k)); y = U.lerp(e.y, mid.y, U.easeOutCubic(k));
            sc = e.mt < 0.14 ? 1 + e.mt : Math.max(0.05, 1.14 - (e.mt - 0.14) * 9);
          }
          drawTile(g, e.icon, x, y, e.w, e.h, false, sc);
        });
        // boosters
        boosters.forEach((b, i) => {
          const [x, y, r] = boosterPos(i);
          const on = !b.used;
          g.fillStyle = 'rgba(80,30,0,0.3)'; g.beginPath(); g.arc(x, y + 4, r, 0, Math.PI * 2); g.fill();
          const gr = g.createLinearGradient(0, y - r, 0, y + r);
          if (on) { gr.addColorStop(0, ['#5ec8ff', '#7ee07a', '#c58bff'][b.kind]); gr.addColorStop(1, ['#2a83e0', '#2fa64a', '#8a4fe0'][b.kind]); }
          else { gr.addColorStop(0, '#c9bfb5'); gr.addColorStop(1, '#9d938a'); }
          g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
          g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 2.5; g.stroke();
          drawBoosterIcon(g, b.kind, x, y - 1, r, on);
          U.text(g, b.name, x, y + r + 10, 12, '#5a2a0a', 'center', 800);
          g.fillStyle = on ? '#ff4d5e' : '#8a8078'; g.beginPath(); g.arc(x + r * 0.75, y - r * 0.75, 9, 0, Math.PI * 2); g.fill();
          U.text(g, on ? '1' : '0', x + r * 0.75, y - r * 0.75 + 0.5, 11, '#fff', 'center', 900);
        });
        // particles
        for (const p of parts) {
          g.globalAlpha = Math.max(0, 1 - p.t / p.life);
          g.fillStyle = p.c;
          if (p.star) {
            g.save(); g.translate(p.x, p.y); g.rotate(p.t * 6); g.beginPath();
            for (let k = 0; k < 10; k++) { const rr = k % 2 ? p.s * 0.45 : p.s * 1.2; g.lineTo(Math.cos(k * Math.PI / 5) * rr, Math.sin(k * Math.PI / 5) * rr); }
            g.closePath(); g.fill(); g.restore();
          } else { g.beginPath(); g.arc(p.x, p.y, p.s * 0.5, 0, Math.PI * 2); g.fill(); }
        }
        g.globalAlpha = 1;
        g.restore();
      }

      function hitBooster(x, y) {
        for (let i = 0; i < boosters.length; i++) { const [bx, by, r] = boosterPos(i); if (Math.hypot(x - bx, y - by) < Math.max(r + 8, 26)) return i; }
        return -1;
      }
      function useBooster(bi) {
        const b = boosters[bi];
        const i = b.kind;
        if (b.used) { api.sfx('bad'); return; }
        if (i === 0) {
          const e = lastMove;
          if (!e || tray.indexOf(e) < 0 || e.m || !e.src) { api.sfx('bad'); return; }
          tray.splice(tray.indexOf(e), 1);
          if (e.src.tile) {
            const t = e.src.tile; t.alive = true; boardLeft++; t.ret = 0; t.rx = e.x; t.ry = e.y; refreshCover();
          } else {
            const k = shelf.length;
            const [sx, sy, sw, sh] = shelfPos(k);
            shelf.push({ icon: e.icon, x: e.x, y: e.y, w: e.w, h: e.h, tx: sx, ty: sy, tw: sw, th: sh, t: 0 });
          }
          lastMove = null;
        } else if (i === 1) {
          const live = tray.filter((e) => !e.m);
          if (!live.length || shelf.length) { api.sfx('bad'); return; }
          live.slice(0, 3).forEach((e) => {
            tray.splice(tray.indexOf(e), 1);
            const [sx, sy, sw, sh] = shelfPos(shelf.length);
            shelf.push({ icon: e.icon, x: e.x, y: e.y, w: e.w, h: e.h, tx: sx, ty: sy, tw: sw, th: sh, t: 0 });
          });
          lastMove = null;
        } else {
          const alive = tiles.filter((t) => t.alive);
          if (alive.length < 2) { api.sfx('bad'); return; }
          const icons = alive.map((t) => t.icon);
          for (let k = icons.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); const tmp = icons[k]; icons[k] = icons[j]; icons[j] = tmp; }
          alive.forEach((t, k) => { t.icon = icons[k]; t.flip = 1; });
        }
        b.used = true;
        api.sfx('good');
        if (endT >= 0 && !endWin && liveCount() < TRAY) endT = -1;
      }

      function down(x, y) {
        if (api.ended || ended || (endT >= 0 && endWin)) return;
        const bi = hitBooster(x, y);
        if (bi >= 0) { useBooster(bi); return; }
        if (endT >= 0) return;
        for (let k = shelf.length - 1; k >= 0; k--) {
          const e = shelf[k];
          if (x >= e.tx - 3 && x <= e.tx + e.tw + 3 && y >= e.ty - 3 && y <= e.ty + e.th + 3) {
            shelf.splice(k, 1);
            shelf.forEach((q, j) => { const p = shelfPos(j); q.tx = p[0]; q.ty = p[1]; });
            addToTray(e.icon, e.x, e.y, e.w, e.h, { shelf: true });
            return;
          }
        }
        for (let k = drawOrder.length - 1; k >= 0; k--) {
          const t = drawOrder[k];
          if (!t.alive || t.ret >= 0) continue;
          const [tx, ty] = tileXY(t);
          if (x >= tx && x <= tx + L.ts && y >= ty && y <= ty + L.th + L.thick) {
            if (covered[t.i]) { t.shake = 0.3; api.sfx('bad'); return; }
            tapTile(t);
            return;
          }
        }
      }

      return {
        update, draw, down,
        resize() {
          layout();
          shelf.forEach((q, j) => { const p = shelfPos(j); q.tx = p[0]; q.ty = p[1]; q.tw = p[2]; q.th = p[3]; });
        },
      };
    },
  });
})();
