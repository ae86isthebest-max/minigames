// Winnability check for 巴士逃脫: node tools/check_bus.js [levels=60]
// For every level (same seeded rng as the shell):
//  1. independent model check: buses inside the lot without overlap, the generator's exit
//     order is legal (each bus's path to the lot edge clear when tapped), passengers per
//     colour == seats per colour, and the queue is served with the level's bay count when
//     buses are sent in that order (front passenger boards the earliest-arrived bus of its
//     colour; lose if all bays are full and nobody can board).
//  2. live play: the real game instance (stub canvas, like smoke.js) is played by tapping
//     the buses in that order whenever a bay is free; it must reach api.win().
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const N = parseInt(process.argv[2] || '40', 10);
const MODE_NAMES = ['簡單', '普通', '困難'];
const id = 'bus';

function anyObj() {
  const fn = function () { return anyObj(); };
  return new Proxy(fn, {
    get(t, k) {
      if (k === Symbol.toPrimitive) return () => 0;
      if (k === 'measureText') return (s) => ({ width: String(s).length * 8 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (k in t) return t[k];
      return anyObj();
    },
    set(t, k, v) { t[k] = v; return true; },
    apply() { return anyObj(); },
  });
}
const W = 390, H = 700;
const sb = {
  console, Math, JSON, Date, Array, Object, Map, Set, Number, String, Proxy, URLSearchParams,
  location: { search: '?mute', protocol: 'file:' }, localStorage: { getItem: () => null, setItem() {} },
  navigator: {}, devicePixelRatio: 2,
  document: { getElementById: () => null, createElement: () => ({ width: 0, height: 0, getContext: () => anyObj() }) },
};
sb.window = sb; vm.createContext(sb);
const root = path.join(__dirname, '..');
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), sb);
vm.runInContext(fs.readFileSync(path.join(root, 'games', id + '.js'), 'utf8'), sb);
const MG = sb.MG, def = MG.games.find((d) => d.id === id);
const D = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const seed = (lv, mode) => MG.mulberry32(lv * 7919 + id.length * 104729 + id.charCodeAt(0) + mode * 15485863);

function modelCheck(L) {
  const { cols, rows, buses, queue, order } = L;
  const cells = (b) => { const o = []; for (let k = 0; k < b.len; k++) o.push(b.h ? [b.x + k, b.y] : [b.x, b.y + k]); return o; };
  const occ = new Array(cols * rows).fill(-1);
  for (let i = 0; i < buses.length; i++) {
    const b = buses[i];
    if ((b.dir % 2 === 0) !== b.h) return 'direction not along bus';
    for (const [x, y] of cells(b)) {
      if (x < 0 || y < 0 || x >= cols || y >= rows || occ[y * cols + x] !== -1) return 'overlap/outside';
      occ[y * cols + x] = i;
    }
  }
  if (order.length !== buses.length || new Set(order).size !== buses.length) return 'order not a permutation';
  for (const i of order) {
    const b = buses[i];
    let x = b.dir === 0 ? b.x + b.len : b.dir === 2 ? b.x - 1 : b.x;
    let y = b.dir === 1 ? b.y + b.len : b.dir === 3 ? b.y - 1 : b.y;
    while (x >= 0 && y >= 0 && x < cols && y < rows) {
      if (occ[y * cols + x] !== -1) return 'exit order blocked at bus ' + i;
      x += D[b.dir][0]; y += D[b.dir][1];
    }
    for (const [cx, cy] of cells(b)) occ[cy * cols + cx] = -1;
  }
  const need = {}, seats = {};
  for (const c of queue) need[c] = (need[c] || 0) + 1;
  for (const b of buses) seats[b.color] = (seats[b.color] || 0) + b.cap;
  for (const k of new Set([...Object.keys(need), ...Object.keys(seats)])) if (need[k] !== seats[k]) return 'colour ' + k + ' passengers != seats';
  // queue simulation with the level's bays
  const rem = buses.map((b) => b.cap);
  const bays = [];
  let next = 0;
  for (const c of queue) {
    while (bays.length < L.bays && next < order.length) bays.push(order[next++]);
    const t = bays.find((i) => buses[i].color === c && rem[i] > 0);
    if (t === undefined) return 'queue stuck';
    if (--rem[t] === 0) bays.splice(bays.indexOf(t), 1);
  }
  return '';
}

function livePlay(lv, mode, L, idle) {
  let ended = null;
  const api = {
    W, H, level: lv, diff: mode, endless: false, best: 0, score() {}, rng: seed(lv, mode), util: MG.util, sfx() {}, info() {},
    get ended() { return ended !== null; },
    win() { if (ended === null) ended = 'win'; }, lose() { if (ended === null) ended = 'lose'; },
  };
  const inst = def.create(api);
  const ctx = anyObj();
  let next = 0, t = 0;
  for (let f = 0; f < 60 * 600 && ended === null; f++) {
    inst.update(1 / 60);
    if (f % 30 === 0) inst.draw(ctx);
    t += 1 / 60;
    if (!idle && next < L.order.length && t > 0.12) {
      const i = L.order[next], b = L.buses[i];
      const [x, y] = inst._test.cellXY(b.x, b.y);
      inst.down(x, y);
      t = 0;
      if (inst._test.busState(i) !== 'lot') next++;
    }
  }
  return ended || 'timeout';
}

let fail = 0;
for (let mode = 0; mode < 3; mode++)
for (let lv = 1; lv <= N; lv++) {
  const L = def.gen(lv, seed(lv, mode), mode);
  const err = modelCheck(L);
  const live = livePlay(lv, mode, L, false);
  // 困難 has a countdown: a player who never taps must lose
  const idle = mode === 2 ? livePlay(lv, mode, L, true) : '-';
  const ok = !err && live === 'win' && (mode !== 2 || idle === 'lose');
  if (!ok) fail++;
  const nLong = L.buses.filter((b) => b.len === 3).length;
  console.log((ok ? 'ok  ' : 'FAIL ' + (err || live)) + ' ' + MODE_NAMES[mode] + ' L' + lv + ' lot ' + L.cols + 'x' + L.rows + ' buses=' + L.buses.length +
    ' (long ' + nLong + ') colours=' + new Set(L.buses.map((b) => b.color)).size + ' bays=' + L.bays + ' passengers=' + L.queue.length + ' hidden=' + L.buses.filter((b) => b.hidden).length + (L.timeLimit ? ' time=' + L.timeLimit + 's' : '') + ' live=' + live + (mode === 2 ? ' idle=' + idle : ''));
}
console.log(fail ? 'FAIL: ' + fail + ' level(s)' : 'OK bus: 簡單/普通/困難 levels 1-' + N + ' winnable (model + live play); 困難 idle player loses');
process.exit(fail ? 1 : 0);
