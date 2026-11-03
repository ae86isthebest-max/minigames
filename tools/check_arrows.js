// Solvability check for 箭頭解謎: node tools/check_arrows.js [levels=60]
// Loads core.js + games/arrows.js, regenerates each level with the shell's seeded rng,
// validates every piece (connected path, no overlap, head direction, head ray not through
// itself) and clears the board with an independent greedy solver (a piece may leave when
// every cell in its head's straight line to the edge is empty).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const N = parseInt(process.argv[2] || '40', 10);
const MODE_NAMES = ['簡單', '普通', '困難'];
const seedOf = (lv, mode) => lv * 7919 + id.length * 104729 + id.charCodeAt(0) + mode * 15485863;
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
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'arrows.js'), 'utf8'), sb);
const MG = sb.MG, id = 'arrows', def = MG.games.find((d) => d.id === id);
const D = [[1, 0], [0, 1], [-1, 0], [0, -1]];

// live play: tap the real game instance in the solver's order; must win with all 3 hearts
function livePlay(lv, mode, taps) {
  let ended = null;
  const api = {
    W: 390, H: 700, level: lv, diff: mode, endless: false, best: 0, score() {}, rng: MG.mulberry32(seedOf(lv, mode)), util: MG.util, sfx() {}, info() {},
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
  return ended === 'win' && inst._test.hearts() === inst._test.maxHearts ? 'win' : (ended || 'timeout');
}
let fail = 0;
for (let mode = 0; mode < 3; mode++)
for (let lv = 1; lv <= N; lv++) {
  const rng = MG.mulberry32(seedOf(lv, mode));
  const L = def.gen(lv, rng, mode);
  const { cols, rows, pieces } = L;
  const occ = new Array(cols * rows).fill(-1);
  let bad = '';
  pieces.forEach((p, i) => {
    const n = p.cells.length;
    if (n < 1 || n > 6) bad = 'length';
    p.cells.forEach((c, k) => {
      if (c[0] < 0 || c[1] < 0 || c[0] >= cols || c[1] >= rows) bad = 'out of board';
      else if (occ[c[1] * cols + c[0]] !== -1) bad = 'overlap'; else occ[c[1] * cols + c[0]] = i;
      if (k > 0 && Math.abs(c[0] - p.cells[k - 1][0]) + Math.abs(c[1] - p.cells[k - 1][1]) !== 1) bad = 'not connected';
    });
    if (n > 1) {
      const a = p.cells[n - 2], b = p.cells[n - 1];
      if (b[0] - a[0] !== D[p.dir][0] || b[1] - a[1] !== D[p.dir][1]) bad = 'head direction';
    }
  });
  const left = new Set(pieces.map((p, i) => i));
  let rounds = 0;
  const taps = [];
  for (;;) {
    const free = [...left].filter((i) => {
      const p = pieces[i], h = p.cells[p.cells.length - 1];
      let x = h[0] + D[p.dir][0], y = h[1] + D[p.dir][1];
      while (x >= 0 && y >= 0 && x < cols && y < rows) {
        if (occ[y * cols + x] !== -1) return false;
        x += D[p.dir][0]; y += D[p.dir][1];
      }
      return true;
    });
    if (!free.length) break;
    rounds++;
    for (const i of free) { taps.push(pieces[i].cells[0]); for (const c of pieces[i].cells) occ[c[1] * cols + c[0]] = -1; left.delete(i); }
  }
  const fill = pieces.reduce((s, p) => s + p.cells.length, 0) / (cols * rows);
  const live = livePlay(lv, mode, taps);
  const ok = !bad && left.size === 0 && pieces.length > 0 && live === 'win';
  if (!ok) fail++;
  const lens = pieces.map((p) => p.cells.length);
  console.log((ok ? 'ok  ' : 'FAIL ' + bad) + ' ' + MODE_NAMES[mode] + ' L' + lv + ' ' + cols + 'x' + rows + ' pieces=' + pieces.length +
    ' len=' + Math.min(...lens) + '-' + Math.max(...lens) + ' fill=' + Math.round(fill * 100) + '% depth=' + rounds + ' live=' + live);
}
console.log(fail ? 'FAIL: ' + fail + ' bad level(s)' : 'OK arrows: 簡單/普通/困難 levels 1-' + N + ' all solvable (solver + live play)');
process.exit(fail ? 1 : 0);
