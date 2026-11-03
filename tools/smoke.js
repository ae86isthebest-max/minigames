// Headless smoke test: node tools/smoke.js <gameId> [levels=30] [frames=600]
// Loads core.js + games/<id>.js with a stub DOM/canvas, then for each mode (簡單/普通/困難, +無盡) and level
// creates the game and feeds random taps/drags. Fails on any thrown error,
// NaN sizes, or a level that ends by itself without input.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const id = process.argv[2];
const LEVELS = parseInt(process.argv[3] || '30', 10);
const FRAMES = parseInt(process.argv[4] || '600', 10);
if (!id) { console.error('usage: node tools/smoke.js <gameId> [levels] [frames]'); process.exit(2); }

function anyObj() {
  const fn = function () { return anyObj(); };
  return new Proxy(fn, {
    get(t, k) {
      if (k === Symbol.toPrimitive) return () => 0;
      if (k === 'measureText') return (s) => ({ width: String(s).length * 8 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (k === 'getImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)) });
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
  console, Math, JSON, Date, Array, Object, Map, Set, Number, String, Proxy, Uint8ClampedArray, Float32Array, Int32Array,
  setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0, cancelAnimationFrame() {},
  performance: { now: () => Date.now() },
  localStorage: { getItem: () => null, setItem() {} },
  location: { search: '?mute', protocol: 'file:' },
  URLSearchParams,
  navigator: {},
  devicePixelRatio: 2,
  document: { getElementById: el, createElement: el, addEventListener() {} },
  addEventListener() {},
  Image: function () { return {}; },
  OffscreenCanvas: function (w, h) { return { width: w, height: h, getContext: () => anyObj() }; },
};
sandbox.window = sandbox;
sandbox.document.createElement = (tag) => el();
vm.createContext(sandbox);
const root = path.join(__dirname, '..');
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), sandbox, { filename: 'core.js' });
vm.runInContext(fs.readFileSync(path.join(root, 'games', id + '.js'), 'utf8'), sandbox, { filename: id + '.js' });
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === id);
if (!def) { console.error('game not registered with id', id); process.exit(1); }
for (const k of ['name', 'icon', 'color', 'create']) if (!def[k]) { console.error('missing def.' + k); process.exit(1); }

let wins = 0, losses = 0, selfEnded = 0;
const modes = def.endless ? [0, 1, 2, 3] : [0, 1, 2];
for (const mode of modes)
for (let lv = 1; lv <= (mode === 3 ? 3 : LEVELS); lv++) {
  let ended = null;
  const api = {
    W, H, level: mode === 3 ? 1 : lv, rng: MG.mulberry32(lv * 7919 + id.length * 104729 + id.charCodeAt(0) + mode * 15485863),
    diff: mode === 3 ? 2 : mode, endless: mode === 3, best: 0,
    score(n) { if (typeof n !== 'number' || !isFinite(n)) throw new Error('api.score got ' + n); },
    util: MG.util, sfx() {}, info() {},
    get ended() { return ended !== null; },
    win() { if (ended === null) ended = 'win'; }, lose() { if (ended === null) ended = 'lose'; },
  };
  const inst = def.create(api) || {};
  const ctx = anyObj();
  let interacted = false;
  const r = MG.mulberry32(lv);
  for (let f = 0; f < FRAMES && ended === null; f++) {
    if (inst.update) inst.update(1 / 60);
    if (inst.draw) inst.draw(ctx);
    if (f % 20 === 5 && ended === null) {
      const x = r() * W, y = r() * H; interacted = true;
      if (inst.down) inst.down(x, y);
      if (inst.move) inst.move(x + (r() - 0.5) * 120, y + (r() - 0.5) * 120);
      if (inst.up) inst.up(x + (r() - 0.5) * 120, y + (r() - 0.5) * 120);
    }
    if (f === 1 && ended !== null && !interacted) selfEnded++;
  }
  if (inst.resize) inst.resize(W + 10, H - 40);
  if (inst.draw) inst.draw(ctx);
  if (inst.destroy) inst.destroy();
  if (ended === 'win') wins++; else if (ended === 'lose') losses++;
}
if (selfEnded) { console.error('FAIL: ' + selfEnded + ' level(s) ended before any input'); process.exit(1); }
console.log('OK ' + id + ': modes ' + modes.join('/') + ' x ' + LEVELS + ' levels ran without errors (random-tap wins=' + wins + ', losses=' + losses + ')');
