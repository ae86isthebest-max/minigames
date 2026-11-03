// Solvability check for 解繩結: node tools/check_tangle.js [levels=40]
// For every level of 簡單/普通/困難: the generator keeps the original planar embedding; we verify it has zero
// crossings (and no peg lying on a foreign rope), the graph is connected with every node of
// degree >= 2, and the scrambled start has > 0 crossings. Then we play the real game: drag every
// peg to its embedding position with down/move/up and require the game to declare a win.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const LEVELS = parseInt(process.argv[2] || '40', 10);
const DNAME = ['簡單', '普通', '困難'];

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
const el = () => ({
  classList: { add() {}, remove() {}, toggle() {} }, style: {}, textContent: '', innerHTML: '',
  appendChild() {}, addEventListener() {}, setPointerCapture() {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: W, height: H }),
  getContext: () => anyObj(), width: W, height: H,
});
const sandbox = {
  console, Math, JSON, Date, Array, Object, Map, Set, Number, String, Proxy, Uint8ClampedArray, Uint8Array, Float32Array, Int32Array,
  setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0, cancelAnimationFrame() {},
  performance: { now: () => Date.now() }, localStorage: { getItem: () => null, setItem() {} },
  location: { search: '?mute', protocol: 'file:' }, URLSearchParams, navigator: {}, devicePixelRatio: 2,
  document: { getElementById: el, createElement: el, addEventListener() {} }, addEventListener() {},
};
sandbox.window = sandbox;
vm.createContext(sandbox);
const root = path.join(__dirname, '..');
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), sandbox, { filename: 'core.js' });
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'tangle.js'), 'utf8'), sandbox, { filename: 'tangle.js' });
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'tangle');

// independent crossing test (re-implemented, not the game's)
function properCross(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const d1 = o(c, d, a), d2 = o(c, d, b), d3 = o(a, b, c), d4 = o(a, b, d);
  return d1 * d2 < 0 && d3 * d4 < 0;
}
function crossings(X, Y, edges) {
  let c = 0;
  for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) {
    const [a, b] = edges[i], [p, q] = edges[j];
    if (a === p || a === q || b === p || b === q) continue;
    if (properCross([X[a], Y[a]], [X[b], Y[b]], [X[p], Y[p]], [X[q], Y[q]])) c++;
  }
  return c;
}

let fails = 0;
const rows = [];
for (const diff of [0, 1, 2])
for (let lv = 1; lv <= LEVELS; lv++) {
  let ended = null;
  const api = {
    W, H, level: lv, rng: MG.mulberry32(lv * 7919 + 'tangle'.length * 104729 + 'tangle'.charCodeAt(0) + diff * 15485863),
    diff, endless: false, best: 0, score() {},
    util: MG.util, sfx() {}, info() {},
    get ended() { return ended !== null; },
    win() { if (ended === null) ended = 'win'; }, lose() { if (ended === null) ended = 'lose'; },
  };
  const inst = def.create(api);
  const G = inst._graph;
  const errs = [];
  const solC = crossings(G.solX, G.solY, G.edges);
  const solTouch = def._countCrossings(G.solX, G.solY, G.edges, null, def._TOUCH);
  const startC = crossings(G.startX, G.startY, G.edges);
  if (solC !== 0) errs.push('embedding has ' + solC + ' crossings');
  if (solTouch !== 0) errs.push('embedding has peg-on-rope contacts');
  if (inst._crossings <= 0) errs.push('start not tangled');
  const deg = new Array(G.n).fill(0); G.edges.forEach(([a, b]) => { deg[a]++; deg[b]++; });
  if (deg.some((d) => d < 2)) errs.push('node with degree < 2');
  const adj = deg.map(() => []); G.edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  const seen = new Set([0]); const st = [0];
  while (st.length) { const v = st.pop(); for (const w of adj[v]) if (!seen.has(w)) { seen.add(w); st.push(w); } }
  if (seen.size !== G.n) errs.push('graph not connected');
  if (G.edges.length > 3 * G.n - 6) errs.push('too many edges for a planar graph');
  // play: drag each peg to its embedding position
  for (let f = 0; f < 10; f++) inst.update(1 / 60);
  // place pegs in an order where a target spot never covers a peg that still has to be grabbed
  const todo = [];
  for (let i = 0; i < G.n; i++) todo.push(i);
  const near = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 30;
  let guard = 0;
  while (todo.length && !ended && inst._crossings > 0 && guard++ < 400) {
    let pick = -1;
    for (const i of todo) {
      const t = inst._toScreen(G.solX[i], G.solY[i]);
      if (todo.every((j) => j === i || !near(t, inst._pegScreen(j)))) { pick = i; break; }
    }
    if (pick < 0) pick = todo[0];
    const [px, py] = inst._pegScreen(pick);
    inst.down(px, py);
    if (inst._drag !== pick) { inst.up(px, py); errs.push('could not grab peg ' + pick); break; }
    const [tx, ty] = inst._toScreen(G.solX[pick], G.solY[pick]);
    inst.move((px + tx) / 2, (py + ty) / 2);
    inst.move(tx, ty);
    inst.up(tx, ty);
    todo.splice(todo.indexOf(pick), 1);
    for (let f = 0; f < 30; f++) inst.update(1 / 60);
  }
  for (let f = 0; f < 120 && !ended; f++) inst.update(1 / 60);
  if (ended !== 'win') errs.push('placing pegs on the embedding did not win (' + inst._crossings + ' crossings left)');
  if (errs.length) fails++;
  rows.push(DNAME[diff] + ' L' + lv + ' nodes ' + G.n + ' ropes ' + G.edges.length + ' start crossings ' + startC + (errs.length ? '  FAIL: ' + errs.join('; ') : '  ok'));
}
rows.forEach((r, i) => { if (r.includes('FAIL') || i % LEVELS < 2 || (i % LEVELS + 1) % 10 === 0) console.log(r); });
console.log((fails ? 'FAILED ' + fails : 'ALL OK') + ': 簡單/普通/困難 levels 1-' + LEVELS + ' planar embedding 0 crossings, scrambled start > 0, solved by real drags');
process.exit(fails ? 1 : 0);
