// 擰螺絲 — Screw Jam
(function () {
  'use strict';

  const BW = 10, BH = 12;
  const HR = 0.42;
  const BUF = 5;
  const SCOLS = ['#ff4d5e', '#3d8bff', '#3ed67a', '#ffcc33', '#b26bff', '#ff8f3d', '#2fd8e0', '#ff7ac8'];
  const PCOLS = ['#f6c886', '#9ad0ff', '#c7a8ff', '#a6e3a1', '#ffb4c4', '#ffe28a', '#9fe7e0', '#f0b27a', '#d0d6e6', '#b8f0c8'];

  // diff 0 簡單 (original), 1 普通, 2 困難 (3-hole buffer, no booster)
  const ALLK = ['bar', 'rect', 'circle', 'L', 'bar'];
  function params(lv, diff) {
    if (diff === 1) return { plates: Math.min(18, 7 + Math.floor(lv * 0.4)), colors: Math.min(8, 5 + Math.floor(lv / 6)), simCap: 4, buf: 4, boost: true, kinds: ALLK };
    if (diff === 2) return { plates: Math.min(22, 11 + Math.floor(lv * 0.4)), colors: lv < 4 ? 7 : 8, simCap: 3, buf: 3, boost: false, kinds: ALLK };
    return {
      buf: BUF, boost: true,
      plates: Math.min(18, 2 + Math.floor((lv - 1) * 0.42)),
      colors: Math.min(8, 2 + Math.floor((lv - 1) / 4)),
      simCap: lv <= 8 ? 3 : lv <= 20 ? 4 : 5,
      kinds: lv <= 2 ? ['bar', 'rect'] : lv <= 5 ? ['bar', 'rect', 'circle'] : ['bar', 'rect', 'circle', 'L', 'bar'],
    };
  }

  function shuffle(rng, a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // ---------- shapes (local units, centred) ----------
  function makeShape(rng, kind) {
    const T = 1.6, Z = 1.3;
    if (kind === 'bar') {
      const len = Math.min(9.4, (4 + rng() * 4.2) * Z);
      const holes = [[-len / 2 + T / 2, 0], [len / 2 - T / 2, 0]];
      if (len > 8 && rng() < 0.5) holes.push([0, 0]);
      return { kind, rad: T / 2, rects: [[-len / 2, -T / 2, len / 2, T / 2]], poly: [-len / 2, -T / 2, len / 2, -T / 2, len / 2, T / 2, -len / 2, T / 2], holes };
    }
    if (kind === 'rect') {
      const w = (2.7 + rng() * 2.4) * Z, h = (2.5 + rng() * 2.1) * Z, i = 0.78;
      let holes = [[-w / 2 + i, -h / 2 + i], [w / 2 - i, -h / 2 + i], [w / 2 - i, h / 2 - i], [-w / 2 + i, h / 2 - i]];
      if (rng() < 0.35) holes = rng() < 0.5 ? [holes[0], holes[2]] : [holes[1], holes[3]];
      return { kind, rad: 0.55, rects: [[-w / 2, -h / 2, w / 2, h / 2]], poly: [-w / 2, -h / 2, w / 2, -h / 2, w / 2, h / 2, -w / 2, h / 2], holes };
    }
    if (kind === 'L') {
      const a = (3.2 + rng() * 2.4) * Z, b = (3.2 + rng() * 2.4) * Z, ox = -a / 2, oy = -b / 2;
      return {
        kind, rad: 0.6,
        rects: [[ox, oy, ox + a, oy + T], [ox, oy, ox + T, oy + b]],
        poly: [ox, oy, ox + a, oy, ox + a, oy + T, ox + T, oy + T, ox + T, oy + b, ox, oy + b],
        holes: [[ox + a - T / 2, oy + T / 2], [ox + T / 2, oy + b - T / 2], [ox + T / 2, oy + T / 2]],
      };
    }
    const r = (1.3 + rng() * 1.0) * Z;
    let holes = [[0, 0]];
    if (r > 2.2) {
      const n = rng() < 0.5 ? 2 : 3, a0 = rng() * Math.PI * 2;
      holes = [];
      for (let k = 0; k < n; k++) holes.push([Math.cos(a0 + k * Math.PI * 2 / n) * (r - 0.8), Math.sin(a0 + k * Math.PI * 2 / n) * (r - 0.8)]);
    }
    return { kind: 'circle', r, rad: r, rects: [], poly: [], holes };
  }

  function plateDist(p, x, y) {
    const dx = x - p.x, dy = y - p.y, c = Math.cos(p.ang), s = Math.sin(p.ang);
    const lx = dx * c + dy * s, ly = -dx * s + dy * c;
    if (p.kind === 'circle') return Math.max(0, Math.hypot(lx, ly) - p.r);
    let best = 1e9;
    const rd = p.rad;
    for (const r of p.rects) {
      const ex = Math.max(r[0] + rd - lx, 0, lx - (r[2] - rd)), ey = Math.max(r[1] + rd - ly, 0, ly - (r[3] - rd));
      best = Math.min(best, Math.max(0, Math.hypot(ex, ey) - rd));
    }
    return best;
  }

  // ---------- rules model (shared by game, generator and tools/check_screw.js) ----------
  function newState(L, bufCap) {
    const buf = [];
    for (let i = 0; i < bufCap; i++) buf.push(-1);
    return {
      alive: L.plates.map(() => true),
      left: L.plates.map((p) => p.n),
      on: L.screws.map(() => true),
      boxes: [null, null], buf, qi: 0, queue: L.queue ? L.queue.slice() : [], chooser: null, done: 0,
    };
  }
  function coveredBy(L, st, si) {
    const s = L.screws[si];
    for (let q = L.plates.length - 1; q > s.p; q--) {
      if (st.alive[q] && plateDist(L.plates[q], s.x, s.y) < HR * 0.9) return q;
    }
    return -1;
  }
  function openBox(L, st, slot, ev) {
    const col = st.chooser ? st.chooser(st) : (st.qi < st.queue.length ? st.queue[st.qi++] : -1);
    if (col < 0) { st.boxes[slot] = null; return; }
    const b = { col, n: 0 };
    st.boxes[slot] = b;
    if (ev) ev.push({ t: 'boxnew', slot, col });
    for (let i = 0; i < st.buf.length && b.n < 3; i++) {
      const s = st.buf[i];
      if (s >= 0 && L.screws[s].col === col) {
        st.buf[i] = -1; b.n++;
        if (ev) ev.push({ t: 'bufbox', s, i, slot, k: b.n - 1 });
      }
    }
    if (b.n === 3) closeBox(L, st, slot, ev);
  }
  function closeBox(L, st, slot, ev) {
    st.done++;
    if (ev) ev.push({ t: 'boxdone', slot });
    st.boxes[slot] = null;
    openBox(L, st, slot, ev);
  }
  function startBoxes(L, st, ev) { openBox(L, st, 0, ev); openBox(L, st, 1, ev); }
  function tap(L, st, si, ev) {
    if (!st.on[si]) return 'gone';
    if (coveredBy(L, st, si) >= 0) return 'covered';
    const col = L.screws[si].col;
    let slot = -1, bi = -1;
    for (let k = 0; k < 2; k++) { const b = st.boxes[k]; if (b && b.col === col && b.n < 3) { slot = k; break; } }
    if (slot < 0) { bi = st.buf.indexOf(-1); if (bi < 0) return 'lose'; }
    st.on[si] = false;
    const p = L.screws[si].p;
    st.left[p]--;
    if (ev) ev.push({ t: 'unscrew', s: si });
    if (st.left[p] === 0) { st.alive[p] = false; if (ev) ev.push({ t: 'fall', p }); }
    if (slot >= 0) {
      const b = st.boxes[slot];
      b.n++;
      if (ev) ev.push({ t: 'box', s: si, slot, k: b.n - 1 });
      if (b.n === 3) closeBox(L, st, slot, ev);
    } else {
      st.buf[bi] = si;
      if (ev) ev.push({ t: 'buf', s: si, i: bi });
    }
    return 'ok';
  }
  function isWon(L, st) { return st.done * 3 === L.screws.length; }

  // A simple greedy player. knowsQueue=false means it only sees the active boxes (like a human).
  function greedyPick(L, st) {
    let best = -1, bestScore = -1e9;
    const bufCnt = {};
    for (const s of st.buf) if (s >= 0) bufCnt[L.screws[s].col] = (bufCnt[L.screws[s].col] || 0) + 1;
    for (let si = 0; si < L.screws.length; si++) {
      if (!st.on[si] || coveredBy(L, st, si) >= 0) continue;
      const sc = L.screws[si];
      let score = sc.p * 0.5 + (st.left[sc.p] === 1 ? 8 : 0);
      let fits = false;
      for (const b of st.boxes) if (b && b.col === sc.col && b.n < 3) fits = true;
      if (fits) score += 1000;
      else score += (bufCnt[sc.col] ? 3 : 0) - (bufCnt[sc.col] >= 2 ? 0 : 0);
      if (score > bestScore) { bestScore = score; best = si; }
    }
    return best;
  }

  function placePlates(rng, P) {
    const plates = [], pts = [];
    let fails = 0;
    while (plates.length < P.plates && fails < 400) {
      const kind = P.kinds[Math.floor(rng() * P.kinds.length)];
      const sh = makeShape(rng, kind);
      const ang = kind === 'circle' ? 0 : Math.floor(rng() * 12) * Math.PI / 12;
      const c = Math.cos(ang), s = Math.sin(ang);
      let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
      if (kind === 'circle') { minx = miny = -sh.r; maxx = maxy = sh.r; }
      else {
        for (let k = 0; k < sh.poly.length; k += 2) {
          const x = sh.poly[k] * c - sh.poly[k + 1] * s, y = sh.poly[k] * s + sh.poly[k + 1] * c;
          minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y);
        }
      }
      const xa = 0.25 - minx, xb = BW - 0.25 - maxx, ya = 0.25 - miny, yb = BH - 0.25 - maxy;
      if (xa > xb || ya > yb) { fails++; continue; }
      const cx = (xa + xb) / 2, cy = (ya + yb) / 2;
      const x = cx + (rng() - 0.5) * (xb - xa) * 0.9, y = cy + (rng() - 0.5) * (yb - ya) * 0.9;
      const plate = Object.assign(sh, { x, y, ang });
      const hw = sh.holes.map((h) => [x + h[0] * c - h[1] * s, y + h[0] * s + h[1] * c]);
      let ok = true;
      for (const h of hw) for (const q of pts) if (Math.hypot(h[0] - q[0], h[1] - q[1]) < 1.08) ok = false;
      if (ok && plates.length > 0 && fails < 300) {
        let cov = 0;
        for (const q of pts) if (plateDist(plate, q[0], q[1]) < HR * 0.9) cov++;
        if (cov === 0 || cov > 6) ok = false;
      }
      if (!ok) { fails++; continue; }
      plate.hw = hw;
      plates.push(plate);
      for (const h of hw) pts.push(h);
    }
    return plates;
  }

  function gen(level, rng, diff) {
    diff = diff || 0;
    const P = params(level, diff);
    for (let attempt = 0; attempt < 400; attempt++) {
      const simCap = attempt < 40 ? P.simCap : P.buf;
      const plates = placePlates(rng, P);
      let N = plates.reduce((a, p) => a + p.hw.length, 0);
      while (N % 3 !== 0 || N < 6) {
        if (N < 6) break;
        const cands = plates.filter((p) => p.hw.length > 1);
        if (!cands.length) break;
        const p = cands[Math.floor(rng() * cands.length)];
        const k = Math.floor(rng() * p.hw.length);
        p.hw.splice(k, 1); p.holes.splice(k, 1);
        N--;
      }
      if (N % 3 !== 0 || N < 6) continue;
      const B = N / 3;
      const nc = Math.min(P.colors, B, SCOLS.length);
      const pal = shuffle(rng, SCOLS.map((_, i) => i)).slice(0, nc);
      const boxes = [];
      for (let c = 0; c < nc; c++) boxes.push(c);
      while (boxes.length < B) boxes.push(Math.floor(rng() * nc));
      const cols = [];
      for (const b of boxes) cols.push(b, b, b);
      shuffle(rng, cols);
      const screws = [];
      let ci = 0;
      plates.forEach((p, pi) => {
        p.n = p.hw.length;
        p.col = PCOLS[Math.floor(rng() * PCOLS.length)];
        for (const h of p.hw) screws.push({ p: pi, x: h[0], y: h[1], col: cols[ci++] });
      });
      const L = { plates, screws, nc, pal, queue: null, sol: null };
      // simulate a player and build the box colour queue so that this play wins
      const rem = new Array(nc).fill(0);
      for (const b of boxes) rem[b]++;
      const st = newState(L, simCap);
      const queue = [];
      const noise = 0.5 + Math.min(4, level * 0.08);
      st.chooser = (s) => {
        let best = -1, bs = -1e9;
        const bc = new Array(nc).fill(0), ex = new Array(nc).fill(0);
        for (const b of s.buf) if (b >= 0) bc[screws[b].col]++;
        for (let i = 0; i < screws.length; i++) if (s.on[i] && coveredBy(L, s, i) < 0) ex[screws[i].col]++;
        for (let c = 0; c < nc; c++) {
          if (rem[c] <= 0) continue;
          let sc = bc[c] * 10 + ex[c] * 2 + rng() * noise;
          for (const b of s.boxes) if (b && b.col === c) sc -= 4;
          if (sc > bs) { bs = sc; best = c; }
        }
        if (best >= 0) { rem[best]--; queue.push(best); }
        return best;
      };
      startBoxes(L, st, null);
      const sol = [];
      let res = 'ok';
      while (!isWon(L, st)) {
        const si = greedyPick(L, st);
        if (si < 0) { res = 'stuck'; break; }
        res = tap(L, st, si, null);
        if (res !== 'ok') break;
        sol.push(si);
      }
      if (!isWon(L, st)) continue;
      L.queue = queue; L.sol = sol; L.simCap = simCap; L.attempts = attempt + 1; L.buf = P.buf; L.boost = P.boost;
      return L;
    }
    return null;
  }

  MG.register({
    id: 'screw', name: '擰螺絲', icon: '🔩', color: '#ffcc4d',
    gen, newState, tap, startBoxes, isWon, greedyPick, coveredBy, BUF,
    create(api) {
      const U = api.util;
      const L = gen(api.level, api.rng, api.diff || 0);
      const st = newState(L, L.buf);
      const total = L.screws.length;
      const colOf = (c) => SCOLS[L.pal[c]];
      let time = 0, winT = -1, shake = 0, boostUsed = false, trayShake = 0, ended = false;
      let s = 30, bx0 = 0, by0 = 0, boxY = 0, boxH = 62, boxW = 140, trayY = 0, trayH = 54;
      const boostBtn = { x: 0, y: 0, w: 0, h: 0, p: 0 };
      const drawnBoxes = [];
      const vboxes = [], active = [null, null], vscrews = [], parts = [], falling = [];
      const pf = L.plates.map(() => ({ flash: 0, wob: 0 }));
      const sAnim = L.screws.map(() => ({ shake: 0, rot: Math.random() * 6 }));
      let bgc = null;

      function layout() {
        const W = api.W, H = api.H;
        boxY = 10; boxH = Math.min(66, H * 0.09);
        boxW = Math.min(170, (W - 40) / 2);
        trayY = boxY + boxH + 14; trayH = 54;
        const top = trayY + trayH + 14, bottom = L.boost ? 76 : 14;
        s = Math.min((W - 20) / BW, (H - top - bottom) / BH);
        bx0 = (W - BW * s) / 2; by0 = top + (H - top - bottom - BH * s) / 2;
        boostBtn.w = 150; boostBtn.h = 50; boostBtn.x = W / 2 - 75; boostBtn.y = H - 62;
        bgc = null;
      }
      layout();

      function slotX(slot) { return api.W / 2 + (slot === 0 ? -1 : 1) * (boxW / 2 + 8); }
      function vboxPos(vb, out) {
        let x = slotX(vb.slot), y = boxY + boxH / 2, sc = 1, al = 1;
        if (vb.delay > 0) x += api.W;
        else if (vb.inT < 1) x += (1 - U.easeOutBack(vb.inT)) * api.W * 0.7;
        if (vb.pop > 0) sc = 1 + Math.sin(vb.pop * Math.PI) * 0.1;
        if (vb.outT > 0) { const u = Math.min(1, vb.outT); y -= u * u * (boxH + 60); sc = 1 + u * 0.15; al = 1 - u; }
        out.x = x; out.y = y; out.sc = sc; out.al = al;
        return out;
      }
      const VP = { x: 0, y: 0, sc: 1, al: 1 };
      function holeX(k) { return (k - 1) * boxW * 0.28; }
      function trayHole(i, out) {
        const n = st.buf.length, gap = Math.min(52, (api.W - 40) / n);
        out.x = api.W / 2 + (i - (n - 1) / 2) * gap; out.y = trayY + trayH / 2;
        return out;
      }
      const TP = { x: 0, y: 0 };
      function screwPx(i, out) { const sc = L.screws[i]; out.x = bx0 + sc.x * s; out.y = by0 + sc.y * s; return out; }

      function newVbox(slot, col, delay) {
        const vb = { slot, col, delay, inT: 0, outT: 0, lid: -1, pending: 0, complete: false, landed: 0, pop: 0 };
        vboxes.push(vb); active[slot] = vb;
        return vb;
      }
      function targetPos(v, out) {
        if (v.tgt.kind === 'buf') return trayHole(v.tgt.i, out);
        vboxPos(v.tgt.vb, VP);
        out.x = VP.x + holeX(v.tgt.k) * VP.sc; out.y = VP.y + boxH * 0.12 * VP.sc;
        return out;
      }

      function updInfo() {
        if (api.level === 1 && !api.diff) api.info('點沒被擋住的螺絲，收進同色盒子');
        else if (api.level === 1 && api.diff === 2) api.info('困難：暫存只有 3 格，沒有道具');
        else api.info('剩 ' + (total - st.done * 3 - st.buf.filter((b) => b >= 0).length) + ' 顆螺絲在板上');
      }

      // initial boxes
      const ev0 = [];
      startBoxes(L, st, ev0);
      for (const e of ev0) if (e.t === 'boxnew') { const vb = newVbox(e.slot, e.col, 0); vb.inT = 1; vb.pop = 1; }
      updInfo();

      function burst(x, y, col, n, spd, star) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, v = spd * (0.3 + Math.random() * 0.7);
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spd * 0.3, life: 0, max: 0.45 + Math.random() * 0.4, c: col, s: 2 + Math.random() * 3, star });
        }
      }

      function handleEvents(ev) {
        for (const e of ev) {
          if (e.t === 'unscrew') {
            const p = screwPx(e.s, TP);
            vscrews.push({ id: e.s, col: colOf(L.screws[e.s].col), x: p.x, y: p.y, sx: p.x, sy: p.y, t: 0, ph: 0, delay: 0, tgt: null, rot: sAnim[e.s].rot });
            pf[L.screws[e.s].p].wob = 0.3;
          } else if (e.t === 'box') {
            const v = vscrews.find((q) => q.id === e.s);
            v.tgt = { kind: 'box', vb: active[e.slot], k: e.k };
            active[e.slot].pending++;
          } else if (e.t === 'buf') {
            const v = vscrews.find((q) => q.id === e.s);
            v.tgt = { kind: 'buf', i: e.i };
          } else if (e.t === 'boxdone') {
            active[e.slot].complete = true;
          } else if (e.t === 'boxnew') {
            const old = active[e.slot];
            newVbox(e.slot, e.col, old && old.complete ? 0.85 : 0);
          } else if (e.t === 'bufbox') {
            const v = vscrews.find((q) => q.id === e.s);
            if (v) {
              v.sx = v.x; v.sy = v.y; v.t = 0; v.ph = 1; v.delay = 0.95 + e.k * 0.08;
              v.tgt = { kind: 'box', vb: active[e.slot], k: e.k };
              active[e.slot].pending++;
            }
          } else if (e.t === 'fall') {
            const p = L.plates[e.p];
            falling.push({ p: e.p, x: p.x, y: p.y, a: p.ang, vx: (Math.random() - 0.5) * 3, vy: -3 - Math.random() * 2, va: (Math.random() - 0.5) * 4, t: 0 });
            api.sfx('drop');
          }
        }
      }

      function pickScrew(x, y) {
        const rad = Math.max(24, HR * s * 1.5);
        let bu = -1, du = 1e9, bc = -1, dc = 1e9;
        for (let i = 0; i < L.screws.length; i++) {
          if (!st.on[i]) continue;
          screwPx(i, TP);
          const d = Math.hypot(TP.x - x, TP.y - y);
          if (d > rad) continue;
          if (coveredBy(L, st, i) < 0) { if (d < du) { du = d; bu = i; } }
          else if (d < dc) { dc = d; bc = i; }
        }
        if (bu >= 0 && du <= dc + 8) return bu;
        return bc;
      }

      function down(x, y) {
        if (api.ended || ended) return;
        if (L.boost && x >= boostBtn.x && x <= boostBtn.x + boostBtn.w && y >= boostBtn.y - 4 && y <= boostBtn.y + boostBtn.h + 4) {
          if (boostUsed) { boostBtn.p = -1; api.sfx('bad'); return; }
          boostUsed = true; st.buf.push(-1); boostBtn.p = 1; api.sfx('good');
          trayHole(st.buf.length - 1, TP); burst(TP.x, TP.y, '#fff3a0', 14, 120, true);
          return;
        }
        const i = pickScrew(x, y);
        if (i < 0) return;
        const ev = [];
        const r = tap(L, st, i, ev);
        if (r === 'covered') {
          sAnim[i].shake = 0.35;
          const q = coveredBy(L, st, i);
          if (q >= 0) pf[q].flash = 0.5;
          api.sfx('bad');
          return;
        }
        if (r === 'lose') {
          sAnim[i].shake = 0.5; trayShake = 0.5; shake = 0.3;
          api.sfx('bad');
          ended = true;
          api.lose('暫存區滿了！');
          return;
        }
        if (r !== 'ok') return;
        api.sfx('tap');
        handleEvents(ev);
        updInfo();
        if (isWon(L, st)) winT = 0;
      }

      function update(dt) {
        time += dt;
        if (shake > 0) shake = Math.max(0, shake - dt);
        if (trayShake > 0) trayShake = Math.max(0, trayShake - dt);
        for (const a of sAnim) if (a.shake > 0) a.shake = Math.max(0, a.shake - dt);
        for (const p of pf) { if (p.flash > 0) p.flash = Math.max(0, p.flash - dt); if (p.wob > 0) p.wob = Math.max(0, p.wob - dt); }
        if (boostBtn.p) boostBtn.p = Math.abs(boostBtn.p) < 0.05 ? 0 : boostBtn.p * Math.pow(0.002, dt);
        // boxes
        for (let i = vboxes.length - 1; i >= 0; i--) {
          const vb = vboxes[i];
          if (vb.delay > 0) { vb.delay -= dt; if (vb.delay <= 0) { vb.delay = 0; api.sfx('pop'); } continue; }
          if (vb.inT < 1) vb.inT = Math.min(1, vb.inT + dt * 2.6);
          if (vb.pop > 0) vb.pop = Math.max(0, vb.pop - dt * 2.5);
          if (vb.complete && vb.landed >= 3 && vb.lid < 0) {
            vb.lid = 0; api.sfx('good');
            vboxPos(vb, VP); burst(VP.x, VP.y, vb.col === undefined ? '#fff' : colOf(vb.col), 16, 170, true); burst(VP.x, VP.y, '#fff6b0', 8, 120, true);
          }
          if (vb.lid >= 0 && vb.lid < 1) vb.lid = Math.min(1, vb.lid + dt * 4);
          if (vb.lid >= 1) vb.outT += dt * 2.2;
          if (vb.outT >= 1) {
            vboxes.splice(i, 1);
            for (let k = vscrews.length - 1; k >= 0; k--) if (vscrews[k].tgt && vscrews[k].tgt.vb === vb) vscrews.splice(k, 1);
          }
        }
        // screws
        for (const v of vscrews) {
          if (v.delay > 0) { v.delay -= dt; continue; }
          if (v.ph === 0) {
            v.t += dt / 0.2; v.rot += dt * 30;
            if (v.t >= 1) { v.t = 0; v.ph = 1; }
          } else if (v.ph === 1) {
            if (!v.tgt) continue;
            if (v.tgt.kind === 'box' && v.tgt.vb.delay > 0) continue;
            v.t = Math.min(1, v.t + dt / 0.36); v.rot += dt * 14;
            targetPos(v, TP);
            const u = U.easeOutCubic(v.t);
            v.x = U.lerp(v.sx, TP.x, u); v.y = U.lerp(v.sy, TP.y, u) - Math.sin(v.t * Math.PI) * 50;
            if (v.t >= 1) {
              v.ph = 2; v.t = 0;
              if (v.tgt.kind === 'box') { v.tgt.vb.landed++; v.tgt.vb.pending--; api.sfx('pop'); }
              else api.sfx('drop');
              burst(TP.x, TP.y, v.col, 5, 70, false);
            }
          } else {
            targetPos(v, TP); v.x = TP.x; v.y = TP.y;
            v.t += dt;
          }
        }
        for (const f of falling) { f.t += dt; f.vy += 30 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.a += f.va * dt; }
        for (let i = falling.length - 1; i >= 0; i--) if (falling[i].t > 2.5) falling.splice(i, 1);
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt;
          if (p.life > p.max) parts.splice(i, 1);
        }
        if (winT >= 0 && !ended) {
          const b = winT;
          winT += dt;
          if (b < 1.2 && winT >= 1.2) {
            for (let i = 0; i < 90; i++) parts.push({ x: api.W * Math.random(), y: -10 - Math.random() * 60, vx: (Math.random() - 0.5) * 120, vy: 60 + Math.random() * 140, life: 0, max: 2.4, c: SCOLS[i % SCOLS.length], s: 3 + Math.random() * 3, conf: true, rot: Math.random() * 6 });
          }
          if (b < 1.6 && winT >= 1.6) { ended = true; api.win('螺絲全部收好了！'); }
        }
      }

      // ---------- drawing: 卡通 Q 版 toy workshop ----------
      const OL = '#2a1a14';
      function stroked(g, str, x, y, size, col, lw) {
        g.font = '900 ' + size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
        g.lineWidth = lw || Math.max(3, size * 0.22); g.strokeStyle = OL;
        g.strokeText(str, x, y); g.fillStyle = col; g.fillText(str, x, y);
      }
      function wrench(g, x, y, a, len, col) {
        g.save(); g.translate(x, y); g.rotate(a);
        g.fillStyle = col; g.strokeStyle = OL; g.lineWidth = 2.5; g.lineJoin = 'round';
        U.rr(g, -5, 0, 10, len, 5); g.fill(); g.stroke();
        g.beginPath(); g.arc(0, 0, 11, 0, Math.PI * 2); g.fill(); g.stroke();
        g.fillStyle = '#8a5a3c'; U.rr(g, -4, -14, 8, 12, 2); g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.5)'; U.rr(g, -2.5, 6, 2.5, len - 12, 1.2); g.fill();
        g.restore();
      }
      function hammer(g, x, y, a, len) {
        g.save(); g.translate(x, y); g.rotate(a);
        g.fillStyle = '#e0a060'; g.strokeStyle = OL; g.lineWidth = 2.5; g.lineJoin = 'round';
        U.rr(g, -4.5, 0, 9, len, 4); g.fill(); g.stroke();
        g.fillStyle = '#ff5d6c'; U.rr(g, -16, -10, 32, 16, 5); g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.45)'; U.rr(g, -12, -7, 20, 4, 2); g.fill();
        g.restore();
      }
      function buildBg() {
        const W = api.W, H = api.H;
        const dpr = Math.min((typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1, 3);
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(W * dpr)); c.height = Math.max(1, Math.round(H * dpr));
        const g = c.getContext('2d');
        g.scale(dpr, dpr);
        g.lineJoin = 'round';
        // workshop wall: warm planks
        const bg = g.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#ffcf8a'); bg.addColorStop(1, '#f2a65e');
        g.fillStyle = bg; g.fillRect(0, 0, W, H);
        g.strokeStyle = 'rgba(150,80,30,0.35)'; g.lineWidth = 2;
        for (let y = 26; y < H; y += 34) {
          g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
          const off = (y / 34 % 2) * 60;
          for (let x = off + 30; x < W; x += 120) { g.beginPath(); g.moveTo(x, y - 34); g.lineTo(x, y); g.stroke(); }
        }
        g.fillStyle = 'rgba(150,80,30,0.25)';
        for (let i = 0; i < 18; i++) { g.beginPath(); g.ellipse((i * 131) % W, (i * 89) % H + 10, 5, 2, 0, 0, Math.PI * 2); g.fill(); }
        // window strip of sunshine behind the boxes
        g.fillStyle = 'rgba(255,255,255,0.25)';
        g.beginPath(); g.moveTo(W * 0.15, 0); g.lineTo(W * 0.32, 0); g.lineTo(W * 0.12, H * 0.3); g.lineTo(-W * 0.05, H * 0.3); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(W * 0.4, 0); g.lineTo(W * 0.47, 0); g.lineTo(W * 0.27, H * 0.3); g.lineTo(W * 0.2, H * 0.3); g.closePath(); g.fill();
        // board panel: chunky pegboard
        const px = bx0 - 8, py = by0 - 8, pw = BW * s + 16, ph = BH * s + 16;
        g.fillStyle = 'rgba(90,40,10,0.35)';
        U.rr(g, px + 2, py + 8, pw, ph, 22); g.fill();
        U.rr(g, px, py, pw, ph, 22);
        g.fillStyle = '#ffc24a'; g.fill();
        g.lineWidth = 3.5; g.strokeStyle = OL; g.stroke();
        U.rr(g, px + 7, py + 7, pw - 14, ph - 14, 16);
        g.fillStyle = '#5a73a8'; g.fill();
        g.lineWidth = 2; g.strokeStyle = 'rgba(42,26,20,0.5)'; g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.55)';
        U.rr(g, px + 18, py + 2.5, pw - 36, 3.5, 2); g.fill();
        g.fillStyle = 'rgba(25,30,60,0.4)';
        for (let yy = 0.5; yy < BH; yy += 1) for (let xx = 0.5; xx < BW; xx += 1) {
          g.beginPath(); g.arc(bx0 + xx * s, by0 + yy * s, Math.max(1.6, s * 0.075), 0, Math.PI * 2); g.fill();
        }
        // corner bolts
        for (const [cx, cy] of [[px + 14, py + 14], [px + pw - 14, py + 14], [px + 14, py + ph - 14], [px + pw - 14, py + ph - 14]]) {
          g.beginPath(); g.arc(cx, cy, 6, 0, Math.PI * 2); g.fillStyle = '#e8ecf5'; g.fill(); g.lineWidth = 2; g.strokeStyle = OL; g.stroke();
          g.beginPath(); g.moveTo(cx - 3, cy); g.lineTo(cx + 3, cy); g.stroke();
        }
        // tools hanging on the wall at the bottom corners (visible under the board when there is space)
        const below = H - (py + ph);
        if (below > 70) {
          wrench(g, 34, H - below + 22, -0.5, Math.min(60, below - 30), '#9aa7c0');
          hammer(g, W - 36, H - below + 24, 0.45, Math.min(52, below - 30));
        }
        return c;
      }

      function platePath(g, p) {
        if (p.kind === 'circle') { g.beginPath(); g.arc(0, 0, p.r * s, 0, Math.PI * 2); return; }
        const pts = p.poly, n = pts.length / 2, r = p.rad * s * 0.9;
        g.beginPath();
        const lx = pts[(n - 1) * 2] * s, ly = pts[(n - 1) * 2 + 1] * s, fx = pts[0] * s, fy = pts[1] * s;
        g.moveTo((lx + fx) / 2, (ly + fy) / 2);
        for (let k = 0; k < n; k++) {
          const ax = pts[k * 2] * s, ay = pts[k * 2 + 1] * s;
          const j = (k + 1) % n;
          const bx = pts[j * 2] * s, by = pts[j * 2 + 1] * s;
          g.arcTo(ax, ay, (ax + bx) / 2, (ay + by) / 2, r);
        }
        g.closePath();
      }

      function drawPlate(g, pi, x, y, a, alpha) {
        const p = L.plates[pi];
        const fx = pf[pi];
        g.save();
        let wob = fx.wob > 0 ? Math.sin(fx.wob * 40) * 0.02 * (fx.wob / 0.3) : 0;
        g.translate(bx0 + x * s, by0 + y * s);
        g.rotate(a + wob);
        g.globalAlpha = alpha;
        g.lineJoin = 'round';
        g.save(); g.translate(2, 6); platePath(g, p); g.fillStyle = 'rgba(30,40,70,0.22)'; g.fill(); g.restore();
        platePath(g, p);
        g.globalAlpha = alpha * 0.78;
        g.fillStyle = p.col; g.fill();
        g.globalAlpha = alpha;
        // inner lighter rim = toy plastic bevel
        g.save(); platePath(g, p); g.clip();
        g.lineWidth = Math.max(5, s * 0.28); g.strokeStyle = 'rgba(255,255,255,0.32)';
        g.translate(-1.5, -2); platePath(g, p); g.stroke();
        g.restore();
        platePath(g, p);
        g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
        if (fx.flash > 0) { g.lineWidth = 5; g.strokeStyle = 'rgba(255,60,80,' + Math.min(1, fx.flash * 2).toFixed(2) + ')'; g.stroke(); }
        for (const h of p.holes) {
          g.beginPath(); g.arc(h[0] * s, h[1] * s, HR * s * 1.1, 0, Math.PI * 2);
          g.fillStyle = 'rgba(42,26,20,0.45)'; g.fill();
          g.lineWidth = 2; g.strokeStyle = OL; g.stroke();
        }
        g.restore();
      }

      function drawScrew(g, x, y, col, rot, lift, sc) {
        const r = HR * s * (sc || 1);
        const lw = Math.max(2, Math.min(3, r * 0.22));
        if (lift > 0) {
          g.fillStyle = 'rgba(0,0,0,0.22)';
          g.beginPath(); g.ellipse(x + 2, y + 4 + lift * 6, r * 0.9, r * 0.6, 0, 0, Math.PI * 2); g.fill();
          const sh = r * 1.2 * lift + 2;
          U.rr(g, x - r * 0.34, y - lift * 4, r * 0.68, sh, r * 0.15);
          g.fillStyle = '#d6d9e6'; g.fill(); g.lineWidth = lw * 0.8; g.strokeStyle = OL; g.stroke();
          g.strokeStyle = 'rgba(42,26,20,0.55)'; g.lineWidth = 1.5;
          for (let k = 0; k < 3; k++) { const yy = y - lift * 4 + k * r * 0.4 * lift + ((rot * 3) % 1) * 3 + 2; g.beginPath(); g.moveTo(x - r * 0.34, yy); g.lineTo(x + r * 0.34, yy + 2); g.stroke(); }
          y -= lift * r * 1.1;
        } else {
          g.fillStyle = 'rgba(0,0,0,0.25)';
          g.beginPath(); g.arc(x + 1.5, y + 3, r, 0, Math.PI * 2); g.fill();
        }
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
        g.fillStyle = col; g.fill();
        g.lineWidth = lw; g.strokeStyle = OL; g.stroke();
        g.fillStyle = U.shade(col, -0.2);
        g.beginPath(); g.arc(x, y, r - lw * 0.5, 0.15 * Math.PI, 0.85 * Math.PI); g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.55)';
        g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.38, r * 0.3, r * 0.18, -0.6, 0, Math.PI * 2); g.fill();
        const c = Math.cos(rot) * r * 0.5, sn = Math.sin(rot) * r * 0.5;
        g.lineCap = 'round';
        g.strokeStyle = OL; g.lineWidth = Math.max(2.5, r * 0.26);
        g.beginPath(); g.moveTo(x - c, y - sn); g.lineTo(x + c, y + sn); g.moveTo(x + sn, y - c); g.lineTo(x - sn, y + c); g.stroke();
      }

      function drawBox(g, vb) {
        vboxPos(vb, VP);
        if (VP.x > api.W + boxW) return;
        if (VP.al > 0.5) drawnBoxes.push(VP.x - boxW / 2 * VP.sc, VP.y - boxH / 2 * VP.sc, boxW * VP.sc, boxH * VP.sc);
        const col = colOf(vb.col);
        g.save();
        g.globalAlpha = VP.al;
        g.translate(VP.x, VP.y); g.scale(VP.sc, VP.sc);
        g.lineJoin = 'round';
        const w = boxW, h = boxH;
        // handle
        g.lineWidth = 7; g.strokeStyle = OL; g.lineCap = 'round';
        g.beginPath(); g.moveTo(-w * 0.18, -h / 2 + 2); g.lineTo(-w * 0.14, -h / 2 - 7); g.lineTo(w * 0.14, -h / 2 - 7); g.lineTo(w * 0.18, -h / 2 + 2); g.stroke();
        g.lineWidth = 3.5; g.strokeStyle = U.shade(col, -0.25); g.stroke();
        U.rr(g, -w / 2, -h / 2 + 5, w, h, 14);
        g.fillStyle = U.shade(col, -0.4); g.fill();
        g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
        U.rr(g, -w / 2, -h / 2, w, h, 14);
        g.fillStyle = col; g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.4)';
        U.rr(g, -w / 2 + 10, -h / 2 + 5, w - 20, Math.max(4, h * 0.13), 4); g.fill();
        for (let k = 0; k < 3; k++) {
          g.beginPath(); g.arc(holeX(k), h * 0.12, HR * s * 1.15, 0, Math.PI * 2);
          g.fillStyle = 'rgba(42,26,20,0.55)'; g.fill();
          g.lineWidth = 2; g.strokeStyle = OL; g.stroke();
        }
        g.restore();
      }
      function drawLid(g, vb) {
        if (vb.lid < 0) return;
        vboxPos(vb, VP);
        const col = colOf(vb.col);
        g.save();
        g.globalAlpha = VP.al;
        g.translate(VP.x, VP.y); g.scale(VP.sc, VP.sc);
        g.lineJoin = 'round';
        const w = boxW + 6, h = boxH * 0.62;
        const u = U.easeOutBack(vb.lid);
        const y = -boxH / 2 - 4 - (1 - u) * 40;
        U.rr(g, -w / 2, y, w, h, 12);
        g.fillStyle = U.shade(col, 0.2); g.fill();
        g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.45)';
        U.rr(g, -w / 2 + 10, y + 4, w - 20, h * 0.18, 3); g.fill();
        stroked(g, '✓', 0, y + h / 2 + 1, h * 0.62, '#fff', 4);
        g.restore();
      }

      function draw(g) {
        const W = api.W, H = api.H;
        if (!bgc) bgc = buildBg();
        drawnBoxes.length = 0;
        g.save();
        if (shake > 0) g.translate(Math.sin(time * 70) * 6 * shake / 0.3, 0);
        g.drawImage(bgc, 0, 0, W, H);
        // tray
        const n = st.buf.length, gap = Math.min(52, (W - 40) / n);
        const tw = gap * n + 16;
        let full = 0;
        for (const b of st.buf) if (b >= 0) full++;
        const tx = W / 2 - tw / 2 + (trayShake > 0 ? Math.sin(time * 70) * 6 * trayShake / 0.5 : 0);
        g.lineJoin = 'round';
        const danger = full >= n - 1 ? 0.5 + 0.5 * Math.sin(time * 8) : 0;
        U.rr(g, tx, trayY + 5, tw, trayH, trayH / 2);
        g.fillStyle = danger ? '#7a2a3e' : '#5a5f7a'; g.fill();
        g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
        U.rr(g, tx, trayY, tw, trayH, trayH / 2);
        g.fillStyle = danger ? U.shade('#ff6b81', -0.3 * (1 - danger)) : '#a9b0cc'; g.fill();
        g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.45)';
        U.rr(g, tx + trayH * 0.4, trayY + 4, tw - trayH * 0.8, 5, 2.5); g.fill();
        for (let i = 0; i < n; i++) {
          trayHole(i, TP);
          g.beginPath(); g.arc(TP.x, TP.y, HR * s * 1.15, 0, Math.PI * 2);
          g.fillStyle = 'rgba(42,26,20,0.6)'; g.fill();
          g.lineWidth = 2; g.strokeStyle = OL; g.stroke();
        }
        // boxes
        for (const vb of vboxes) drawBox(g, vb);
        // plates and their screws, bottom to top
        for (let pi = 0; pi < L.plates.length; pi++) {
          if (!st.alive[pi]) continue;
          const p = L.plates[pi];
          drawPlate(g, pi, p.x, p.y, p.ang, 1);
          for (let si = 0; si < L.screws.length; si++) {
            const sc = L.screws[si];
            if (sc.p !== pi || !st.on[si]) continue;
            screwPx(si, TP);
            const a = sAnim[si];
            const ox = a.shake > 0 ? Math.sin(a.shake * 70) * 4 * (a.shake / 0.35) : 0;
            drawScrew(g, TP.x + ox, TP.y, colOf(sc.col), a.rot, 0, 1);
          }
        }
        for (const f of falling) {
          g.save();
          g.globalAlpha = Math.max(0, 1 - f.t / 2.5);
          drawPlate(g, f.p, f.x, f.y, f.a, Math.max(0, 1 - f.t / 2.5));
          g.restore();
        }
        // flying / parked screws
        for (const v of vscrews) {
          if (v.tgt && v.tgt.kind === 'box') { vboxPos(v.tgt.vb, VP); if (VP.al < 1 && v.ph === 2) { g.globalAlpha = VP.al; } }
          if (v.ph === 0) drawScrew(g, v.x, v.y, v.col, v.rot, U.easeOutCubic(v.t), 1 + v.t * 0.15);
          else if (v.ph === 1) drawScrew(g, v.x, v.y, v.col, v.rot, v.delay > 0 ? 0 : 0.3, 1.15 - 0.15 * v.t);
          else {
            const sc = v.tgt.kind === 'box' ? VP.sc * (1 + Math.max(0, 0.25 - v.t) * 0.8) : 1 + Math.max(0, 0.25 - v.t) * 0.8;
            drawScrew(g, v.x, v.y, v.col, v.rot, 0, sc);
          }
          g.globalAlpha = 1;
        }
        for (const vb of vboxes) drawLid(g, vb);
        for (const p of parts) {
          g.globalAlpha = Math.max(0, 1 - p.life / p.max);
          g.fillStyle = p.c;
          if (p.conf) { g.save(); g.translate(p.x, p.y); g.rotate(p.rot + p.life * 8); g.fillRect(-p.s, -p.s * 0.5, p.s * 2, p.s); g.restore(); }
          else if (p.star) {
            const r = p.s;
            g.beginPath();
            g.moveTo(p.x, p.y - r * 1.8); g.lineTo(p.x + r * 0.45, p.y - r * 0.45); g.lineTo(p.x + r * 1.8, p.y);
            g.lineTo(p.x + r * 0.45, p.y + r * 0.45); g.lineTo(p.x, p.y + r * 1.8); g.lineTo(p.x - r * 0.45, p.y + r * 0.45);
            g.lineTo(p.x - r * 1.8, p.y); g.lineTo(p.x - r * 0.45, p.y - r * 0.45); g.closePath(); g.fill();
            g.lineWidth = 1.2; g.strokeStyle = OL; g.stroke();
          } else { g.beginPath(); g.arc(p.x, p.y, p.s, 0, Math.PI * 2); g.fill(); }
        }
        g.globalAlpha = 1;
        if (L.boost) drawBoost(g);
        g.restore();
      }

      function drawBoost(g) {
        const b = boostBtn;
        const bs = 1 + (b.p > 0 ? b.p * 0.08 : 0), bo = b.p < 0 ? Math.sin(time * 50) * 4 * -b.p : 0;
        g.save();
        g.translate(b.x + b.w / 2 + bo, b.y + b.h / 2); g.scale(bs, bs);
        g.lineJoin = 'round';
        const c1 = boostUsed ? '#9a8f94' : '#ff9f1a';
        U.rr(g, -b.w / 2, -b.h / 2 + 5, b.w, b.h, b.h / 2);
        g.fillStyle = U.shade(c1, -0.35); g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
        U.rr(g, -b.w / 2, -b.h / 2, b.w, b.h, b.h / 2);
        g.fillStyle = c1; g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.35)'; U.rr(g, -b.w / 2 + 12, -b.h / 2 + 5, b.w - 24, b.h * 0.28, b.h * 0.14); g.fill();
        stroked(g, '＋1 暫存格', 0, 2, 18, boostUsed ? '#e4dde0' : '#fff', 4);
        g.restore();
      }

      function resize() { layout(); }
      const _test = { L, tap(i) { screwPx(i, TP); return [TP.x, TP.y]; }, drawnBoxes, activeCount: () => st.boxes.filter(Boolean).length };
      return { update, draw, down, resize, _test };
    },
  });
})();
