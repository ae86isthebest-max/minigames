// Winnability check for 疊高塔: node tools/check_stack.js [levels=60] [trials=20] [errMs=40]
// Loads the real game (same stub sandbox as smoke.js). A bot taps when the sliding slab lines up
// with the tower plus a random human-like timing error of ±errMs (that is ±speed*err world units,
// printed in px at the iPhone scale). Each level must be won in at least MIN_RATE of the trials.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const LEVELS = parseInt(process.argv[2] || '60', 10);
const TRIALS = parseInt(process.argv[3] || '20', 10);
const ERR_MS = parseFloat(process.argv[4] || '40');
const MIN_RATE = 0.6;

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
  console, Math, JSON, Date, Array, Object, Map, Set, Number, String, Proxy, Uint8ClampedArray, Float32Array, Int32Array,
  setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0, cancelAnimationFrame() {},
  performance: { now: () => Date.now() }, localStorage: { getItem: () => null, setItem() {} },
  location: { search: '?mute', protocol: 'file:' }, URLSearchParams, navigator: {}, devicePixelRatio: 2,
  document: { getElementById: el, createElement: el, addEventListener() {} }, addEventListener() {},
};
sandbox.window = sandbox;
vm.createContext(sandbox);
const root = path.join(__dirname, '..');
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), sandbox, { filename: 'core.js' });
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'stack.js'), 'utf8'), sandbox, { filename: 'stack.js' });
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'stack');
const PX = Math.min(W * 0.29, H * 0.17);

function run(lv, botRng) {
  let ended = null;
  const api = {
    W, H, level: lv, rng: MG.mulberry32(lv * 7919 + 'stack'.length * 104729 + 'stack'.charCodeAt(0)),
    util: MG.util, sfx() {}, info() {},
    get ended() { return ended !== null; },
    win() { if (ended === null) ended = 'win'; }, lose() { if (ended === null) ended = 'lose'; },
  };
  const inst = def.create(api);
  const dt = 1 / 240;
  let lastId = -1, tapAt = Infinity, now = 0, perfect = 0;
  for (let f = 0; f < 240 * 600 && !ended; f++) {
    const st = inst._state;
    if (st.cur && st.cur.id !== lastId) {
      lastId = st.cur.id;
      const react = 0.25;
      let aim = inst._aimTime();
      while (aim < react) aim += (4 * 1.35) / st.cur.speed;
      tapAt = now + aim + (botRng() * 2 - 1) * ERR_MS / 1000;
    }
    if (now >= tapAt) {
      tapAt = Infinity;
      const before = inst._state.streak;
      inst.down(0, 0);
      if (inst._state.streak > before) perfect++;
    }
    inst.update(dt); now += dt;
  }
  return { ended, placed: inst._state.placed, perfect };
}

let fails = 0;
for (let lv = 1; lv <= LEVELS; lv++) {
  const r = MG.mulberry32(lv * 31337);
  let wins = 0, best = 0, perf = 0, drops = 0;
  for (let t = 0; t < TRIALS; t++) {
    const o = run(lv, r);
    if (o.ended === 'win') wins++;
    best = Math.max(best, o.placed); perf += o.perfect; drops += o.placed;
  }
  const rate = wins / TRIALS;
  const sp = def._speedOf(lv, 0);
  const errPx = sp * ERR_MS / 1000 * PX;
  const ok = rate >= MIN_RATE;
  if (!ok) fails++;
  if (!ok || lv <= 3 || lv % 5 === 0) {
    console.log((ok ? 'ok  ' : 'FAIL') + ' L' + lv + ' target ' + def._targetOf(lv) + ' speed ' + sp.toFixed(2) + ' (bot err ±' + errPx.toFixed(1) + 'px)  bot wins ' + wins + '/' + TRIALS + '  perfect ' + Math.round(100 * perf / Math.max(1, drops)) + '%');
  }
}
console.log((fails ? 'FAILED ' + fails + ' level(s)' : 'ALL OK') + ': levels 1-' + LEVELS + ', ' + TRIALS + ' bot runs each, timing error ±' + ERR_MS + 'ms, need >= ' + (MIN_RATE * 100) + '% wins');
process.exit(fails ? 1 : 0);
