// Solvability check for 泊車逃脫: node tools/check_parking.js [levels=60]
// Loads core.js + games/parking.js (like smoke.js), regenerates each level with the
// same seeded rng the shell uses, then plays it with an independent greedy solver:
// tap any car whose straight path to the lot edge is clear, until the lot is empty.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const N = parseInt(process.argv[2] || '60', 10);
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
const sb = {
  console, Math, JSON, Date, Array, Object, Map, Set, Number, String, Proxy, URLSearchParams,
  location: { search: '?mute', protocol: 'file:' }, localStorage: { getItem: () => null, setItem() {} },
  navigator: {}, devicePixelRatio: 2,
  document: { getElementById: () => null, createElement: () => ({ width: 0, height: 0, getContext: () => anyObj() }) },
};
sb.window = sb; vm.createContext(sb);
const root = path.join(__dirname, '..');
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), sb);
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'parking.js'), 'utf8'), sb);
const MG = sb.MG, id = 'parking', def = MG.games.find((d) => d.id === id);
const D = [[1, 0], [0, 1], [-1, 0], [0, -1]];

// live play: tap the real game instance in the solver's order; must win with all 3 hearts
function livePlay(lv, taps) {
  let ended = null;
  const api = {
    W: 390, H: 700, level: lv, rng: MG.mulberry32(lv * 7919 + id.length * 104729 + id.charCodeAt(0)), util: MG.util, sfx() {}, info() {},
    get ended() { return ended !== null; },
    win() { if (ended === null) ended = 'win'; }, lose() { if (ended === null) ended = 'lose'; },
  };
  const inst = def.create(api);
  const ctx = anyObj();
  let k = 0;
  for (let f = 0; f < 60 * 120 && ended === null; f++) {
    inst.update(1 / 60);
    if (f % 30 === 0) inst.draw(ctx);
    if (f % 6 === 0 && k < taps.length) { const [x, y] = inst._test.cellXY(taps[k][0], taps[k][1]); inst.down(x, y); k++; }
  }
  return ended === 'win' && inst._test.hearts() === 3 ? 'win' : (ended || 'timeout');
}
let fail = 0;
for (let lv = 1; lv <= N; lv++) {
  const rng = MG.mulberry32(lv * 7919 + id.length * 104729 + id.charCodeAt(0));
  const L = def.gen(lv, rng);
  const { cols, rows } = L;
  const occ = new Array(cols * rows).fill(-1);
  const cellList = (c) => { const o = []; for (let k = 0; k < c.len; k++) o.push(c.h ? [c.x + k, c.y] : [c.x, c.y + k]); return o; };
  let bad = false;
  for (const o of L.obs) occ[o[1] * cols + o[0]] = -2;
  L.cars.forEach((c, i) => {
    if ((c.dir % 2 === 0) !== c.h) bad = true;
    for (const [x, y] of cellList(c)) { if (x < 0 || y < 0 || x >= cols || y >= rows || occ[y * cols + x] !== -1) bad = true; else occ[y * cols + x] = i; }
  });
  const left = new Set(L.cars.map((c, i) => i));
  let rounds = 0;
  const taps = [];
  for (;;) {
    const free = [...left].filter((i) => {
      const c = L.cars[i];
      let x = c.dir === 0 ? c.x + c.len : c.dir === 2 ? c.x - 1 : c.x;
      let y = c.dir === 1 ? c.y + c.len : c.dir === 3 ? c.y - 1 : c.y;
      while (x >= 0 && y >= 0 && x < cols && y < rows) {
        if (occ[y * cols + x] !== -1) return false;
        x += D[c.dir][0]; y += D[c.dir][1];
      }
      return true;
    });
    if (!free.length) break;
    rounds++;
    for (const i of free) { taps.push([L.cars[i].x, L.cars[i].y]); for (const [x, y] of cellList(L.cars[i])) occ[y * cols + x] = -1; left.delete(i); }
  }
  const fill = L.cars.reduce((s, c) => s + c.len, 0) / (cols * rows);
  const live = livePlay(lv, taps);
  const ok = !bad && left.size === 0 && L.cars.length > 0 && live === 'win';
  if (!ok) fail++;
  console.log((ok ? 'ok  ' : 'FAIL') + ' L' + lv + ' ' + cols + 'x' + rows + ' cars=' + L.cars.length +
    ' trucks=' + L.cars.filter((c) => c.len === 3).length + ' cones=' + L.obs.length +
    ' fill=' + Math.round(fill * 100) + '% depth=' + rounds + ' live=' + live);
}
console.log(fail ? 'FAIL: ' + fail + ' unsolvable level(s)' : 'OK parking: levels 1-' + N + ' all solvable (solver + live play)');
process.exit(fail ? 1 : 0);
