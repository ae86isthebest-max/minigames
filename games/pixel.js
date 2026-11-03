// 像素射擊 — Pixel Flow style
(function () {
  'use strict';

  const SLOTS = 5;
  const PAL = {
    r: '#ff4d5e', o: '#ff9a3d', y: '#ffd23f', g: '#46d36f', G: '#1f8f4e', b: '#3d8bff', c: '#5fe3f0',
    p: '#ff7ac8', v: '#a66bff', w: '#f4f4fa', k: '#3a3352', n: '#9a6238', l: '#ffe2b8', s: '#ffc9a0', e: '#a3a9c2',
  };

  // hand-written bitmaps ('.' = empty)
  const PICS = [
    { name: '愛心', rows: ['.rr...rr.', 'rrrr.rrrr', 'rwwrrrrrr', 'rwrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....'] },
    { name: '星星', rows: ['....y....', '...yyy...', 'yyyyoyyyy', '.yyyyyyy.', '..yyoyy..', '..yyyyy..', '.yyy.yyy.', '.yy...yy.', 'y.......y'] },
    { name: '蘑菇', rows: ['...rrrr...', '.rrwwrrrr.', 'rrrwwrrwwr', 'rwrrrrrwwr', 'rrrrrrrrrr', '..ssssss..', '..skssks..', '..ssssss..', '...ssss...'] },
    { name: '貓咪', rows: ['.o.......o.', '.oo.....oo.', '.ooooooooo.', 'ooooooooooo', 'oowkoooowko', 'ooooopooooo', 'oowwwwwwwoo', '.owwwkwwwo.', '..ooooooo..'] },
    { name: '小魚', rows: ['.....bbbb...', '...bbbbbbb.b', '..bwkbbbbbbb', '.bbbbbbcbbb.', '.bbbbbbcbbb.', '..bbbbbbbbbb', '...bbbbbbb.b', '.....bbbb...'] },
    { name: '花朵', rows: ['.pp...pp.', 'pppp.pppp', 'pppyyyppp', '.pyyyyyp.', 'pppyyyppp', 'pppp.pppp', '.pp.g.pp.', '....g....', '..ggg.gg.', '....g....'] },
    { name: '房子', rows: ['.....r.....', '....rrr....', '...rrrrr...', '..rrrrrrr..', '.rrrrrrrrr.', 'rrrrrrrrrrr', '.lllllllll.', '.lccllnnll.', '.lccllnnll.', '.lllllnnll.'] },
    { name: '火箭', rows: ['...rr...', '..rrrr..', '..wwww..', '..wccw..', '..wccw..', '..wwww..', '..wwww..', '.rwwwwr.', 'rrwwwwrr', 'rr.oo.rr', '...oo...', '...yy...'] },
    { name: '蘋果', rows: ['.....ng...', '....ngg...', '.rrrnrrrr.', 'rrwrrrrrrr', 'rwrrrrrrrr', 'rrrrrrrrrr', 'rrrrrrrrrr', '.rrrrrrrr.', '.rrrrrrrr.', '..rr..rr..'] },
    { name: '冰淇淋', rows: ['..pppp..', '.pppppp.', 'pppwpppp', 'pppppppp', '.yyyyyy.', 'yyyyyyyy', '.nnnnnn.', '.nonnon.', '..nnnn..', '..nonn..', '...nn...', '...n....'] },
    { name: '櫻桃', rows: ['......gg..', '.....g.g..', '....g...g.', '...g....g.', '..g.....g.', '.rrr...rrr', 'rrwrr.rrwr', 'rrrrr.rrrr', 'rrrrr.rrrr', '.rrr...rr.'] },
    { name: '太陽', rows: ['.....o.....', '.o...o...o.', '..o.yyy.o..', '...yyyyy...', '..yyyyyyy..', 'ooyykyykyoo', '..yyyyyyy..', '...yyrry...', '..o.yyy.o..', '.o...o...o.', '.....o.....'] },
    { name: '小幽靈', rows: ['...wwww...', '.wwwwwwww.', 'wwwwwwwwww', 'wwkkwwkkww', 'wwkkwwkkww', 'wwwwwwwwww', 'wpwwwwwwpw', 'wwwwkkwwww', 'wwwwwwwwww', 'ww.ww.ww.w', 'w...w...w.'] },
    { name: '小樹', rows: ['....g....', '...ggg...', '..ggGgg..', '.ggggGgg.', '..gGggg..', '.ggggggg.', 'gggGggggg', '.ggggggg.', '....n....', '....n....', '...nnn...'] },
    { name: '汽車', rows: ['....rrrrr....', '...rccrccr...', '..rrccrccrr..', 'rrrrrrrrrrrrr', 'yrrrrrrrrrrrr', 'rrrrrrrrrrrrr', '..kk.....kk..', '..kk.....kk..'] },
    { name: '小鴨', rows: ['...yyy.....', '..yyyyy....', '..ykyyyoo..', '..yyyyy....', '...yyy.....', '.yyyyyyy..y', 'yyyyyyyyyyy', 'yyyyyyyyyy.', '.yyyyyyyy..', '..oo..oo...'] },
    { name: '雨傘', rows: ['.....v.....', '...vvvvv...', '..vvpvvpv..', '.vvpvvvpvv.', 'vvpvvvvvpvv', 'vvvvvvvvvvv', 'v.v.vkv.v.v', '.....k.....', '.....k.....', '..k..k.....', '...kk......'] },
    { name: '杯子蛋糕', rows: ['....r.....', '...ppp....', '..pppppp..', '.pppwpppp.', 'pppppppppp', '.pppppppp.', '.bcbcbcbc.', '.cbcbcbcb.', '..bcbcbc..', '..cbcbcb..', '...bbbb...'] },
    { name: '熊貓', rows: ['kk.......kk', 'kkwwwwwwwkk', '.wwwwwwwww.', 'wkkkwwwkkkw', 'wkwkwwwkwkw', 'wwwwwkwwwww', 'wwwwkkkwwww', '.wwwwwwwww.', '..wwwwwww..', '..kk...kk..'] },
    { name: '螃蟹', rows: ['rr.........rr', 'r.r.......r.r', '.rr..k.k..rr.', '..r..r.r..r..', '..rrrrrrrrr..', '.rrrrrrrrrrr.', 'rrrrrrrrrrrrr', '.r.r.....r.r.', 'r..r.....r..r'] },
    { name: '蝴蝶', rows: ['vv.......vv', 'vvvv...vvvv', 'vpvvv.vvvpv', 'vvvvvkvvvvv', '.vvvvkvvvv.', '.ppvvkvvpp.', 'pppp.k.pppp', 'ppp.....ppp', '.p.......p.'] },
    { name: '寶石', rows: ['...ccccc...', '..cwcccbc..', '.ccccccbbc.', 'bbbbbbbbbbb', '.bccccccbb.', '..bcccccb..', '...bcccb...', '....bcb....', '.....b.....'] },
    { name: '笑臉', rows: ['...yyyyy...', '..yyyyyyy..', '.yyyyyyyyy.', 'yykyyyyykyy', 'yykyyyyykyy', 'ypyyyyyyypy', 'yykyyyyykyy', 'yyykkkkkyyy', '.yyyyyyyyy.', '..yyyyyyy..', '...yyyyy...'] },
    { name: '月亮', rows: ['..yyy....', '.yyy.....', 'yyy......', 'yyy....w.', 'yyy...www', 'yyy....w.', 'yyyy.....', '.yyyyy..y', '..yyyyyyy', '...yyyyy.'] },
    { name: '西瓜', rows: ['grrrrrrrrrrg', 'gwrrkrrkrrwg', '.gwrrrrrrwg.', '.ggwrkrrwgg.', '..ggwwwwgg..', '...gggggg...'] },
    { name: '草莓', rows: ['.....gg.....', '...gGggGg...', '..rrgGGgrr..', '.rrrrggrrrr.', 'rryrrrrrryrr', 'rrrrryrrrrrr', 'rrryrrrryrrr', '.rrrrrrrrrr.', '.rryrrryrrr.', '..rrrrrrrr..', '...rryrrr...', '....rrrr....', '.....rr.....'] },
    { name: '青蛙', rows: ['..ggg...ggg..', '.gwkwg.gwkwg.', '.gwwwgggwwwg.', 'ggggggggggggg', 'gGgggggggggGg', 'ggrrrrrrrrrgg', 'gggrrrrrrrggg', '.ggggggggggg.', 'GG..gg.gg..GG', 'GGG.......GGG'] },
    { name: '機器人', rows: ['.....kk.....', '.....rr.....', '..eeeeeeee..', '..ewweewwe..', '..ebbeebbe..', '..eeeeeeee..', '..eekkkkee..', '..eeeeeeee..', '....eeee....', '.eeeeeeeeee.', 'ee.eeyyee.ee', 'ee.eeeeee.ee', '...ee..ee...'] },
  ];
  PICS.forEach((p) => { p.R = p.rows.length; p.C = p.rows[0].length; p.cells = p.rows.join('').replace(/\./g, '').length; });

  function shuffle(rng, a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // ---------- rules model (shared with tools/check_pixel.js) ----------
  // Lanes in the order a shooter meets them on one clockwise lap starting at the bottom-left corner:
  // left side (rows bottom->top), top (cols left->right), right (rows top->bottom), bottom (cols right->left)
  function makeLanes(R, C) {
    const side = [], idx = [];
    for (let r = R - 1; r >= 0; r--) { side.push(0); idx.push(r); }
    for (let c = 0; c < C; c++) { side.push(1); idx.push(c); }
    for (let r = 0; r < R; r++) { side.push(2); idx.push(r); }
    for (let c = C - 1; c >= 0; c--) { side.push(3); idx.push(c); }
    return { side, idx };
  }
  // first non-empty cell seen from that lane, if it has colour col; else -1
  function laneTarget(grid, R, C, side, i, col) {
    let k = -1;
    if (side === 0) { for (let c = 0; c < C; c++) if (grid[i * C + c] >= 0) { k = i * C + c; break; } }
    else if (side === 1) { for (let r = 0; r < R; r++) if (grid[r * C + i] >= 0) { k = r * C + i; break; } }
    else if (side === 2) { for (let c = C - 1; c >= 0; c--) if (grid[i * C + c] >= 0) { k = i * C + c; break; } }
    else { for (let r = R - 1; r >= 0; r--) if (grid[r * C + i] >= 0) { k = r * C + i; break; } }
    return k >= 0 && grid[k] === col ? k : -1;
  }
  // one full lap of a lone shooter; mutates grid, returns ammo left
  function runLap(grid, R, C, lanes, col, ammo) {
    for (let l = 0; l < lanes.side.length && ammo > 0; l++) {
      const k = laneTarget(grid, R, C, lanes.side[l], lanes.idx[l], col);
      if (k >= 0) { grid[k] = -1; ammo--; }
    }
    return ammo;
  }

  // diff 0 簡單 (original), 1 普通 (4 slots), 2 困難 (3 slots, big pictures, tiny ammo, misleading order)
  function params(lv, diff) {
    if (diff === 1) return { cols: lv <= 6 ? 3 : 4, pick: 'random', caps: [5, 8, 10, 12, 15, 20], big: Math.min(1, lv / 12), bigAll: 16, slots: 4 };
    if (diff === 2) return { cols: lv <= 5 ? 4 : 5, pick: 'small', caps: [5, 6, 8, 10, 12], big: Math.min(1, 0.5 + lv / 10), bigAll: 14, slots: 3 };
    return {
      cols: lv <= 3 ? 2 : lv <= 12 ? 3 : 4,
      pick: lv <= 5 ? 'greedy' : 'random',
      caps: lv <= 3 ? [99] : lv <= 10 ? [10, 15, 20, 25, 30] : [5, 8, 10, 12, 15, 20, 25],
      big: lv <= 20 ? 0 : Math.min(1, (lv - 18) / 14),
      bigAll: 34, slots: SLOTS,
    };
  }

  // picture + scale for a level; consecutive levels never repeat a picture inside the same pool
  function choosePic(lv, rng, diff) {
    if (lv === 1 && !diff) return { pic: PICS[0], scale: 1 };
    const order = PICS.slice().sort((a, b) => a.cells - b.cells || (a.name < b.name ? -1 : 1));
    const P = params(lv, diff);
    const big = rng() < P.big;
    let pool;
    if (big) pool = lv < P.bigAll ? order.filter((p) => p.cells <= 60) : order.filter((p) => Math.max(p.R, p.C) <= 13);
    else if (lv <= 8 && !diff) pool = order.slice(0, 12);
    else pool = order.slice(6);
    return { pic: pool[(lv * 5 + 3) % pool.length], scale: big ? 2 : 1 };
  }

  // Builds the level forwards: repeatedly pick a colour that can hit something right now and
  // give its shooter exactly as much ammo as it will use on one lap, so sending the shooters
  // in creation order clears the picture with no parking at all. Then deal them into columns
  // keeping that order (each next shooter is always at the front of its column).
  function gen(level, rng, diff) {
    diff = diff || 0;
    const P = params(level, diff);
    const ch0 = choosePic(level, rng, diff);
    const pic = ch0.pic, sc = ch0.scale;
    const R = pic.R * sc, C = pic.C * sc;
    const keys = [];
    const grid = new Int8Array(R * C).fill(-1);
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const ch = pic.rows[Math.floor(r / sc)][Math.floor(c / sc)];
      if (ch === '.') continue;
      let k = keys.indexOf(ch);
      if (k < 0) { keys.push(ch); k = keys.length - 1; }
      grid[r * C + c] = k;
    }
    const colors = keys.map((ch) => PAL[ch]);
    const lanes = makeLanes(R, C);
    const g = Int8Array.from(grid);
    let left = 0;
    for (let i = 0; i < g.length; i++) if (g[i] >= 0) left++;
    const total = left;
    const seq = [];
    const probe = new Int8Array(g.length);
    while (left > 0) {
      const hits = [];
      let best = -1, bh = 0, sum = 0;
      for (let c = 0; c < keys.length; c++) {
        probe.set(g);
        const h = 999 - runLap(probe, R, C, lanes, c, 999);
        hits.push(h); sum += h;
        if (h > bh) { bh = h; best = c; }
      }
      let pick = best;
      if (P.pick === 'random') {
        let x = rng() * sum;
        for (let c = 0; c < keys.length; c++) { x -= hits[c]; if (x < 0 && hits[c] > 0) { pick = c; break; } }
      } else if (P.pick === 'small') {
        let isum = 0, minH = 1;
        for (let c = 0; c < keys.length; c++) if (hits[c] >= 4) minH = 4;
        for (let c = 0; c < keys.length; c++) if (hits[c] >= minH) isum += 1 / hits[c];
        let x = rng() * isum;
        for (let c = 0; c < keys.length; c++) { if (hits[c] >= minH) { x -= 1 / hits[c]; if (x < 0) { pick = c; break; } } }
      }
      const cap = P.caps[Math.floor(rng() * P.caps.length)];
      const ammo = Math.min(hits[pick], cap);
      const rest = runLap(g, R, C, lanes, pick, ammo);
      if (rest !== 0) throw new Error('pixel gen: ammo not used');
      left -= ammo;
      seq.push({ c: pick, a: ammo });
    }
    const cols = [];
    for (let i = 0; i < P.cols; i++) cols.push([]);
    seq.forEach((s, i) => { s.id = i; cols[Math.floor(rng() * P.cols)].push(s); });
    for (let i = 0; i < P.cols; i++) if (!cols[i].length) {
      let big = 0;
      for (let j = 1; j < P.cols; j++) if (cols[j].length > cols[big].length) big = j;
      if (cols[big].length > 1) cols[i].push(cols[big].pop());
    }
    // keep creation order inside every column so the creation order is always playable
    for (const col of cols) col.sort((a, b) => a.id - b.id);
    return { pic, R, C, grid, colors, cols: cols.filter((c) => c.length), seq, total, lanes, slots: P.slots };
  }

  MG.register({
    id: 'pixel', name: '像素射擊', icon: '🎨', color: '#ff7ac8',
    gen, makeLanes, laneTarget, runLap, SLOTS, PICS, params,
    create(api) {
      const U = api.util;
      const LV = gen(api.level, api.rng, api.diff || 0);
      const NS = LV.slots;
      const R = LV.R, C = LV.C, colors = LV.colors, lanes = LV.lanes;
      const grid = Int8Array.from(LV.grid);
      const vis = new Uint8Array(R * C);
      for (let i = 0; i < grid.length; i++) vis[i] = grid[i] >= 0 ? 1 : 0;
      let left = LV.total;
      const columns = LV.cols.map((col) => col.map((s) => ({ c: s.c, ammo: s.a, st: 'col', x: 0, y: 0, dx: 0, dy: 0, s: 0, li: 0, t: 0, fx: 0, fy: 0, rec: 0, slot: -1, pop: 0, wait: false, flash: 0 })));
      const slots = [];
      for (let i = 0; i < NS; i++) slots.push(null);
      const belt = [], movers = [], dying = [], bullets = [], parts = [], pops = [];
      let time = 0, winT = -1, ended = false, shake = 0, lastShoot = 0, lastPop = 0;
      let cs = 20, px = 0, py = 0, m = 24, bx = 0, by = 0, bw = 0, bh = 0, PL = 0, slotY = 0, colTop = 0, colW = 80, sr = 15;
      const laneS = new Float32Array(lanes.side.length);
      let cache = null, dirty = true, bgc = null;
      const DASH = [10, 8];
      const speed = () => Math.max(260, PL / 3.4);

      function layout() {
        const W = api.W, H = api.H;
        m = Math.max(20, Math.min(30, W * 0.065));
        sr = m * 0.68;
        const edge = m + sr + 6;
        const maxW = W - 2 * edge, maxH = H * 0.55 - 2 * edge;
        cs = Math.max(4, Math.min(maxW / C, maxH / R, 30));
        const pw = C * cs, ph = R * cs;
        px = (W - pw) / 2; py = edge;
        bx = px - m; by = py - m; bw = pw + 2 * m; bh = ph + 2 * m;
        PL = 2 * bw + 2 * bh;
        for (let l = 0; l < lanes.side.length; l++) {
          const sd = lanes.side[l], i = lanes.idx[l];
          if (sd === 0) laneS[l] = by + bh - (py + (i + 0.5) * cs);
          else if (sd === 1) laneS[l] = bh + (px + (i + 0.5) * cs - bx);
          else if (sd === 2) laneS[l] = bh + bw + (py + (i + 0.5) * cs - by);
          else laneS[l] = 2 * bh + bw + (bx + bw - (px + (i + 0.5) * cs));
        }
        slotY = by + bh + 22 + Math.min(40, H * 0.05);
        colTop = slotY + 40;
        colW = Math.min(96, (W - 20) / columns.length);
        dirty = true; bgc = null;
        snapAll();
      }
      function pathPos(s, out) {
        if (s < bh) { out.x = bx; out.y = by + bh - s; out.d = 0; }
        else if (s < bh + bw) { out.x = bx + (s - bh); out.y = by; out.d = 1; }
        else if (s < 2 * bh + bw) { out.x = bx + bw; out.y = by + (s - bh - bw); out.d = 2; }
        else { out.x = bx + bw - Math.min(bw, s - 2 * bh - bw); out.y = by + bh; out.d = 3; }
        return out;
      }
      const PP = { x: 0, y: 0, d: 0 };
      function slotPos(i, out) { const gap = Math.min(66, (api.W - 30) / NS); out.x = api.W / 2 + (i - (NS - 1) / 2) * gap; out.y = slotY; return out; }
      function colPos(ci, k, out) {
        out.x = api.W / 2 + (ci - (columns.length - 1) / 2) * colW;
        out.y = colTop + sr * 1.5 + k * sr * 2.5;
        return out;
      }
      const TP = { x: 0, y: 0, d: 0 };
      function snapAll() {
        columns.forEach((col, ci) => col.forEach((s, k) => { colPos(ci, k, TP); s.x = TP.x; s.y = TP.y; }));
        slots.forEach((s, i) => { if (s && s.st === 'park') { slotPos(i, TP); s.x = TP.x; s.y = TP.y; } });
      }
      layout();

      function updInfo() {
        if (api.level === 1 && !api.diff) api.info('點下面的小砲手，牠會繞一圈打掉同色像素');
        else if (api.level === 1 && api.diff === 2 && left === LV.total) api.info('困難：等待區只有 3 格，順序很重要');
        else api.info(LV.pic.name + '・剩 ' + left + ' 格');
      }
      updInfo();

      function burst(x, y, col, n, spd, sz) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, v = spd * (0.3 + Math.random() * 0.7);
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spd * 0.2, life: 0, max: 0.35 + Math.random() * 0.35, c: col, s: sz * (0.5 + Math.random() * 0.6) });
        }
      }

      function entryBusy() {
        for (const b of belt) if (b.s < sr * 2.4) return true;
        return false;
      }
      function launch(s, fromX, fromY) {
        s.st = 'jump'; s.t = 0; s.fx = fromX; s.fy = fromY; s.wait = false;
        movers.push(s);
        api.sfx('tap');
      }

      function down(x, y) {
        if (api.ended || ended) return;
        // waiting slots
        for (let i = 0; i < NS; i++) {
          const s = slots[i];
          slotPos(i, TP);
          if (Math.abs(x - TP.x) < 30 && Math.abs(y - TP.y) < 30) {
            if (s && s.st === 'park') { slots[i] = null; s.slot = -1; launch(s, s.x, s.y); }
            return;
          }
        }
        // column fronts
        for (let ci = 0; ci < columns.length; ci++) {
          colPos(ci, 0, TP);
          if (Math.abs(x - TP.x) < colW / 2 && y > colTop - 10 && y < TP.y + sr * 2.6) {
            const col = columns[ci];
            if (!col.length) { api.sfx('bad'); return; }
            const s = col.shift();
            launch(s, s.x, s.y);
            return;
          }
          if (Math.abs(x - TP.x) < colW / 2 && y >= TP.y + sr * 2.6 && columns[ci].length > 1) {
            columns[ci][1].flash = 0.35; api.sfx('bad'); return;
          }
        }
      }

      function fire(s, k) {
        grid[k] = -1; left--; s.ammo--; s.rec = 1;
        const r = Math.floor(k / C), c = k % C;
        bullets.push({ x: s.x, y: s.y, sx: s.x, sy: s.y, tx: px + (c + 0.5) * cs, ty: py + (r + 0.5) * cs, t: 0, k, col: colors[s.c] });
        if (time - lastShoot > 0.045) { api.sfx('shoot'); lastShoot = time; }
      }

      function update(dt) {
        time += dt;
        if (shake > 0) shake = Math.max(0, shake - dt);
        // shooters moving to the belt entry
        for (let i = movers.length - 1; i >= 0; i--) {
          const s = movers[i];
          if (s.st === 'jump') {
            s.t = Math.min(1, s.t + dt / 0.32);
            const u = U.easeOutCubic(s.t);
            s.x = U.lerp(s.fx, bx, u); s.y = U.lerp(s.fy, by + bh, u) - Math.sin(s.t * Math.PI) * 50;
            if (s.t >= 1) {
              if (entryBusy()) { s.wait = true; continue; }
              s.st = 'belt'; s.s = 0; s.li = 0; s.wait = false;
              movers.splice(i, 1); belt.push(s);
            }
          } else if (s.st === 'toSlot') {
            s.t = Math.min(1, s.t + dt / 0.35);
            slotPos(s.slot, TP);
            const u = U.easeOutCubic(s.t);
            s.x = U.lerp(s.fx, TP.x, u); s.y = U.lerp(s.fy, TP.y, u) - Math.sin(s.t * Math.PI) * 40;
            if (s.t >= 1) { s.st = 'park'; s.pop = 1; movers.splice(i, 1); api.sfx('drop'); }
          }
        }
        // belt
        const v = speed();
        for (let i = belt.length - 1; i >= 0 && !ended; i--) {
          const s = belt[i];
          s.s += v * dt;
          while (s.li < laneS.length && laneS[s.li] <= s.s && s.ammo > 0) {
            const k = laneTarget(grid, R, C, lanes.side[s.li], lanes.idx[s.li], s.c);
            if (k >= 0) fire(s, k);
            s.li++;
          }
          pathPos(Math.min(s.s, PL - 0.01), PP);
          s.x = PP.x; s.y = PP.y; s.d = PP.d;
          if (s.ammo <= 0) {
            belt.splice(i, 1); s.st = 'dead'; s.t = 0; dying.push(s);
            burst(s.x, s.y, colors[s.c], 14, 150, 4); api.sfx('pop');
            continue;
          }
          if (s.s >= PL) {
            belt.splice(i, 1);
            const free = slots.indexOf(null);
            if (free < 0) {
              ended = true; shake = 0.4; s.st = 'lost'; dying.push(s); s.t = -10;
              api.sfx('bad');
              api.lose('等待區滿了！');
              break;
            }
            slots[free] = s; s.slot = free; s.st = 'toSlot'; s.t = 0; s.fx = s.x; s.fy = s.y;
            movers.push(s);
          }
        }
        // column shooters slide forward
        columns.forEach((col, ci) => col.forEach((s, k) => {
          colPos(ci, k, TP);
          s.x += (TP.x - s.x) * Math.min(1, dt * 12); s.y += (TP.y - s.y) * Math.min(1, dt * 12);
          if (s.flash > 0) s.flash = Math.max(0, s.flash - dt);
        }));
        for (const s of slots) if (s && s.pop > 0) s.pop = Math.max(0, s.pop - dt * 3);
        for (const s of belt) if (s.rec > 0) s.rec = Math.max(0, s.rec - dt * 8);
        for (let i = dying.length - 1; i >= 0; i--) { dying[i].t += dt; if (dying[i].t > 0.3) dying.splice(i, 1); }
        // bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          b.t += dt / 0.13;
          b.x = U.lerp(b.sx, b.tx, Math.min(1, b.t)); b.y = U.lerp(b.sy, b.ty, Math.min(1, b.t));
          if (b.t >= 1) {
            bullets.splice(i, 1);
            vis[b.k] = 0; dirty = true;
            pops.push({ x: b.tx, y: b.ty, col: b.col, t: 0 });
            burst(b.tx, b.ty, b.col, 6, 120, Math.max(2, cs * 0.22));
            if (time - lastPop > 0.06) { api.sfx('hit'); lastPop = time; }
          }
        }
        for (let i = pops.length - 1; i >= 0; i--) { pops[i].t += dt; if (pops[i].t > 0.25) pops.splice(i, 1); }
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 400 * dt;
          if (p.life > p.max) parts.splice(i, 1);
        }
        if (!ended && left === 0 && !bullets.length && winT < 0) {
          winT = 0;
          for (let i = 0; i < 100; i++) parts.push({ x: api.W * Math.random(), y: -10 - Math.random() * 60, vx: (Math.random() - 0.5) * 120, vy: 60 + Math.random() * 140, life: 0, max: 2.4, c: colors[i % colors.length], s: 3 + Math.random() * 3, conf: true, rot: Math.random() * 6 });
          api.sfx('good');
        }
        if (winT >= 0 && !ended) {
          const b = winT; winT += dt;
          if (b < 0.9 && winT >= 0.9) { ended = true; api.win('畫面清空了！'); }
        }
        updInfoThrottled(dt);
      }
      let infoT = 0, lastLeft = -1;
      function updInfoThrottled(dt) {
        infoT += dt;
        if (left !== lastLeft && infoT > 0.1) { infoT = 0; lastLeft = left; updInfo(); }
      }

      // ---------- drawing: 卡通 Q 版 toy art room ----------
      const OL = '#2a1a14';
      function makeCanvas(W, H) {
        const dpr = Math.min((typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1, 3);
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(W * dpr)); c.height = Math.max(1, Math.round(H * dpr));
        const g = c.getContext('2d');
        g.scale(dpr, dpr);
        return { c, g };
      }
      function stroked(g, str, x, y, size, col, align, lw) {
        g.font = '900 ' + size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
        g.textAlign = align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
        g.lineWidth = lw || Math.max(3, size * 0.22); g.strokeStyle = OL;
        g.strokeText(str, x, y); g.fillStyle = col; g.fillText(str, x, y);
      }
      function cloud(g, x, y, s) {
        g.beginPath();
        g.arc(x - 22 * s, y + 4 * s, 14 * s, Math.PI * 0.5, Math.PI * 1.5);
        g.arc(x - 6 * s, y - 8 * s, 16 * s, Math.PI, Math.PI * 1.9);
        g.arc(x + 14 * s, y - 2 * s, 13 * s, Math.PI * 1.2, Math.PI * 0.1);
        g.arc(x + 24 * s, y + 6 * s, 10 * s, Math.PI * 1.5, Math.PI * 0.5);
        g.closePath();
        g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
      }
      function buildBg() {
        const W = api.W, H = api.H;
        const o = makeCanvas(W, H), g = o.g;
        g.lineJoin = 'round';
        const floorY = slotY - sr * 1.25 - 20;
        // sky
        const gr = g.createLinearGradient(0, 0, 0, floorY);
        gr.addColorStop(0, '#7fd3ff'); gr.addColorStop(1, '#c9f0ff');
        g.fillStyle = gr; g.fillRect(0, 0, W, floorY);
        g.fillStyle = 'rgba(255,250,200,0.9)'; g.beginPath(); g.arc(W - 40, 40, 26, 0, Math.PI * 2); g.fill();
        g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
        cloud(g, 52, 30, 0.8); cloud(g, W * 0.62, floorY * 0.55, 0.7); cloud(g, W * 0.18, floorY * 0.78, 0.6);
        // hills
        g.beginPath(); g.moveTo(0, floorY);
        g.quadraticCurveTo(W * 0.22, floorY - 90, W * 0.5, floorY - 30);
        g.quadraticCurveTo(W * 0.78, floorY - 110, W, floorY - 40);
        g.lineTo(W, floorY); g.closePath();
        g.fillStyle = '#8fdc7a'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
        g.fillStyle = '#6cc65d';
        for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse((k + 0.5) * W / 6, floorY - 8, 10, 4, 0, 0, Math.PI * 2); g.fill(); }
        // play-mat floor
        const fl = g.createLinearGradient(0, floorY, 0, H);
        fl.addColorStop(0, '#ffcf8a'); fl.addColorStop(1, '#f3a764');
        g.fillStyle = fl; g.fillRect(0, floorY, W, H - floorY);
        g.strokeStyle = OL; g.lineWidth = 3;
        g.beginPath(); g.moveTo(0, floorY); g.lineTo(W, floorY); g.stroke();
        g.strokeStyle = 'rgba(160,80,30,0.3)'; g.lineWidth = 2;
        for (let x = 0; x < W; x += 44) { g.beginPath(); g.moveTo(x, floorY + 4); g.lineTo(x - 20, H); g.stroke(); }
        // conveyor belt track
        g.strokeStyle = 'rgba(42,26,20,0.3)'; g.lineWidth = m * 1.3 + 6;
        U.rr(g, bx, by + 5, bw, bh, m * 0.5); g.stroke();
        g.strokeStyle = OL; g.lineWidth = m * 1.3 + 6;
        U.rr(g, bx, by, bw, bh, m * 0.5); g.stroke();
        g.strokeStyle = '#6f7699'; g.lineWidth = m * 1.3;
        U.rr(g, bx, by, bw, bh, m * 0.5); g.stroke();
        g.strokeStyle = '#8f97bd'; g.lineWidth = m * 0.5;
        U.rr(g, bx, by, bw, bh, m * 0.5); g.stroke();
        // picture canvas with a wooden frame
        const fw = Math.max(5, m * 0.28);
        U.rr(g, px - fw, py - fw, C * cs + fw * 2, R * cs + fw * 2, 6);
        g.fillStyle = '#c98a52'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
        g.fillStyle = '#fffaf0'; g.fillRect(px, py, C * cs, R * cs);
        g.fillStyle = 'rgba(120,160,220,0.13)';
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if ((r + c) % 2 === 0) g.fillRect(px + c * cs, py + r * cs, cs, cs);
        g.strokeStyle = OL; g.lineWidth = 2; g.strokeRect(px, py, C * cs, R * cs);
        // entry pad
        g.beginPath(); g.arc(bx, by + bh, m * 0.42, 0, Math.PI * 2);
        g.fillStyle = '#ffd23f'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
        g.fillStyle = OL; g.beginPath(); g.moveTo(bx - m * 0.16, by + bh + m * 0.12); g.lineTo(bx + m * 0.16, by + bh + m * 0.12); g.lineTo(bx, by + bh - m * 0.18); g.closePath(); g.fill();
        // waiting slots: little cushions
        for (let i = 0; i < NS; i++) {
          slotPos(i, TP);
          g.beginPath(); g.ellipse(TP.x, TP.y + sr * 0.55, sr * 1.25, sr * 0.6, 0, 0, Math.PI * 2);
          g.fillStyle = '#ff9fb8'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
          g.beginPath(); g.ellipse(TP.x, TP.y + sr * 0.45, sr * 0.85, sr * 0.3, 0, 0, Math.PI * 2);
          g.fillStyle = 'rgba(255,255,255,0.45)'; g.fill();
        }
        // column lanes: toy trays
        columns.forEach((_, ci) => {
          colPos(ci, 0, TP);
          U.rr(g, TP.x - colW / 2 + 5, colTop, colW - 10, H - colTop + 20, 16);
          g.fillStyle = 'rgba(255,240,215,0.6)'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = 'rgba(42,26,20,0.55)'; g.stroke();
        });
        return o.c;
      }
      function buildCache() {
        if (!cache || cache.w !== api.W || cache.h !== api.H) { const o = makeCanvas(api.W, api.H); cache = { c: o.c, g: o.g, w: api.W, h: api.H }; }
        const g = cache.g;
        g.clearRect(0, 0, api.W, api.H);
        const gap = Math.max(0.5, cs * 0.05), rad = cs * 0.24;
        const ol = cs >= 9;
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
          const k = r * C + c;
          if (!vis[k]) continue;
          const col = colors[LV.grid[k]];
          const x = px + c * cs + gap, y = py + r * cs + gap, w = cs - gap * 2;
          U.rr(g, x, y, w, w, rad);
          g.fillStyle = U.shade(col, -0.25); g.fill();
          if (ol) { g.lineWidth = Math.max(1, cs * 0.07); g.strokeStyle = OL; g.stroke(); }
          g.fillStyle = col;
          U.rr(g, x + w * 0.06, y + w * 0.06, w * 0.88, w * 0.74, rad * 0.8); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.5)';
          U.rr(g, x + w * 0.18, y + w * 0.14, w * 0.36, w * 0.13, w * 0.06); g.fill();
        }
        dirty = false;
      }

      // cute round blob shooter: ears, big eyes, blush, cannon, ammo number on the belly
      function drawShooter(g, s, x, y, scale, ang) {
        const r = sr * scale;
        const col = colors[s.c];
        const lw = Math.max(1.8, r * 0.13);
        g.save();
        g.translate(x, y);
        g.lineJoin = 'round';
        g.strokeStyle = OL; g.lineWidth = lw;
        if (ang !== null) {
          g.save(); g.rotate(ang);
          const len = r * (1.3 - s.rec * 0.25);
          U.rr(g, 0, -r * 0.27, len, r * 0.54, r * 0.2);
          g.fillStyle = '#5a5f7a'; g.fill(); g.stroke();
          U.rr(g, len - r * 0.32, -r * 0.36, r * 0.36, r * 0.72, r * 0.14);
          g.fillStyle = col; g.fill(); g.stroke();
          if (s.rec > 0.5) {
            g.fillStyle = '#fff3a0'; g.beginPath(); g.arc(len + r * 0.3, 0, r * 0.32 * s.rec, 0, Math.PI * 2); g.fill();
            g.lineWidth = lw * 0.7; g.stroke(); g.lineWidth = lw;
          }
          g.restore();
        }
        g.fillStyle = 'rgba(0,0,0,0.22)';
        g.beginPath(); g.ellipse(0, r * 0.9, r * 0.85, r * 0.28, 0, 0, Math.PI * 2); g.fill();
        // ears
        g.fillStyle = col;
        for (const sx of [-1, 1]) {
          g.beginPath(); g.arc(sx * r * 0.62, -r * 0.66, r * 0.32, 0, Math.PI * 2); g.fill(); g.stroke();
          g.fillStyle = 'rgba(255,170,190,0.85)'; g.beginPath(); g.arc(sx * r * 0.62, -r * 0.66, r * 0.15, 0, Math.PI * 2); g.fill();
          g.fillStyle = col;
        }
        // body
        g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2);
        g.fillStyle = col; g.fill(); g.stroke();
        g.fillStyle = U.shade(col, -0.18);
        g.beginPath(); g.arc(0, 0, r - lw * 0.5, 0.2 * Math.PI, 0.8 * Math.PI); g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.45)';
        g.beginPath(); g.ellipse(-r * 0.42, -r * 0.48, r * 0.26, r * 0.14, -0.6, 0, Math.PI * 2); g.fill();
        // eyes
        for (const sx of [-1, 1]) {
          g.fillStyle = '#fff'; g.beginPath(); g.ellipse(sx * r * 0.36, -r * 0.22, r * 0.21, r * 0.25, 0, 0, Math.PI * 2); g.fill();
          g.lineWidth = lw * 0.6; g.stroke(); g.lineWidth = lw;
          g.fillStyle = OL; g.beginPath(); g.ellipse(sx * r * 0.38, -r * 0.2, r * 0.12, r * 0.16, 0, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#fff'; g.beginPath(); g.arc(sx * r * 0.38 - r * 0.04, -r * 0.26, r * 0.05, 0, Math.PI * 2); g.fill();
        }
        g.fillStyle = 'rgba(255,110,140,0.55)';
        g.beginPath(); g.ellipse(-r * 0.62, -r * 0.02, r * 0.13, r * 0.08, 0, 0, Math.PI * 2); g.ellipse(r * 0.62, -r * 0.02, r * 0.13, r * 0.08, 0, 0, Math.PI * 2); g.fill();
        // ammo number
        const fs = Math.round(r * (s.ammo >= 100 ? 0.6 : 0.78));
        g.font = '900 ' + fs + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = Math.max(2.5, r * 0.22); g.strokeStyle = OL;
        g.strokeText(String(s.ammo), 0, r * 0.38);
        g.fillStyle = '#fff';
        g.fillText(String(s.ammo), 0, r * 0.38);
        g.restore();
      }
      const DIRANG = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

      function draw(g) {
        const W = api.W, H = api.H;
        if (!bgc) bgc = buildBg();
        if (dirty) buildCache();
        g.save();
        if (shake > 0) g.translate(Math.sin(time * 70) * 6 * shake / 0.4, 0);
        g.drawImage(bgc, 0, 0, W, H);
        // moving belt chevrons
        g.strokeStyle = '#ffe27a'; g.lineWidth = 4; g.lineCap = 'butt';
        g.setLineDash(DASH); g.lineDashOffset = -time * speed() * 0.5;
        U.rr(g, bx, by, bw, bh, m * 0.5); g.stroke();
        g.setLineDash([]);
        g.drawImage(cache.c, 0, 0, W, H);
        for (const p of pops) {
          const u = p.t / 0.25, w = cs * (1 + u * 0.6);
          g.globalAlpha = 1 - u; g.fillStyle = '#fff';
          g.fillRect(p.x - w / 2, p.y - w / 2, w, w);
        }
        g.globalAlpha = 1;
        // columns
        for (let ci = 0; ci < columns.length; ci++) {
          const col = columns[ci];
          const nv = Math.min(col.length, Math.max(1, Math.floor((H - colTop - 8) / (sr * 2.5))));
          for (let k = nv - 1; k >= 0; k--) {
            const s = col[k];
            if (k === 0) {
              g.fillStyle = 'rgba(255,255,255,' + (0.35 + 0.15 * Math.sin(time * 5)).toFixed(3) + ')';
              g.beginPath(); g.arc(s.x, s.y, sr * 1.5, 0, Math.PI * 2); g.fill();
            }
            const ox = s.flash > 0 ? Math.sin(s.flash * 60) * 4 : 0;
            g.globalAlpha = k === 0 ? 1 : 0.85;
            drawShooter(g, s, s.x + ox, s.y, k === 0 ? 1.2 : 1, null);
          }
          g.globalAlpha = 1;
          if (col.length > nv) {
            colPos(ci, nv - 1, TP);
            stroked(g, '+' + (col.length - nv), TP.x + sr * 1.1, TP.y + sr * 0.9, 13, '#fff', 'center', 3);
          }
        }
        for (const s of slots) if (s && s.st === 'park') drawShooter(g, s, s.x, s.y, 1 + s.pop * 0.2, null);
        for (const s of belt) drawShooter(g, s, s.x, s.y, 1, DIRANG[s.d]);
        for (const s of movers) drawShooter(g, s, s.x, s.y, s.st === 'jump' ? 1.1 : 1, null);
        for (const s of dying) {
          if (s.t < 0) continue;
          g.globalAlpha = Math.max(0, 1 - s.t / 0.3);
          drawShooter(g, s, s.x, s.y, 1 + s.t * 2, null);
        }
        g.globalAlpha = 1;
        // bullets
        for (const b of bullets) {
          g.fillStyle = b.col;
          g.beginPath(); g.arc(b.x, b.y, Math.max(3, cs * 0.22), 0, Math.PI * 2); g.fill();
          g.strokeStyle = OL; g.lineWidth = 2; g.stroke();
        }
        for (const p of parts) {
          g.globalAlpha = Math.max(0, 1 - p.life / p.max);
          g.fillStyle = p.c;
          if (p.conf) { g.save(); g.translate(p.x, p.y); g.rotate(p.rot + p.life * 8); g.fillRect(-p.s, -p.s * 0.5, p.s * 2, p.s); g.restore(); }
          else g.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
        }
        g.globalAlpha = 1;
        // slot counter
        let used = 0;
        for (const s of slots) if (s) used++;
        stroked(g, '等待區 ' + used + '/' + NS, W - 10, slotY - sr * 1.25 - 9, 12, used >= NS - 1 ? '#ff8fa0' : '#fff', 'right', 3);
        g.restore();
      }

      function resize() { layout(); }
      const _test = { LV, columns, idle: () => !belt.length && !movers.length && !bullets.length, front(ci) { colPos(ci, 0, TP); return [TP.x, TP.y]; } };
      return { update, draw, down, resize, _test };
    },
  });
})();
