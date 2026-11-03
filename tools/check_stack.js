// Winnability check for 疊高塔: node tools/check_stack.js [levels=40] [trials=20] [diff]
// Loads the real game (same stub sandbox as smoke.js). For 簡單/普通/困難 a bot taps when the sliding
// slab lines up with the tower plus a random human-like timing error of ±ERR ms (= ±speed*err world
// units, printed in px at iPhone scale). Each level must be won in at least MIN_RATE of the trials.
// 無盡: the same bots play endless runs; every run must end with api.lose and report its score.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const LEVELS = parseInt(process.argv[2] || '40', 10);
const TRIALS = parseInt(process.argv[3] || '20', 10);
const ONLY_DIFF = process.argv[4] !== undefined ? parseInt(process.argv[4], 10) : -1;
// bot timing error and required win rate per mode: 簡單 casual player, 普通 attentive, 困難 skilled & focused
const ERR = [40, 30, 22];
const MIN_RATE = [0.6, 0.5, 0.3];
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

function run(lv, botRng, diff, endless, errMs) {
  let ended = null, score = -1;
  const api = {
    W, H, level: lv, rng: MG.mulberry32(endless ? 12345 + lv : lv * 7919 + 'stack'.length * 104729 + 'stack'.charCodeAt(0) + diff * 15485863),
    diff, endless, best: 0, score(n) { score = n; },
    util: MG.util, sfx() {}, info() {},
    get ended() { return ended !== null; },
    win() { if (ended === null) ended = 'win'; }, lose() { if (ended === null) ended = 'lose'; },
  };
  const inst = def.create(api);
  const dt = 1 / 240;
  let lastId = -1, tapAt = Infinity, now = 0, perfect = 0;
  for (let f = 0; f < 240 * 900 && !ended; f++) {
    const st = inst._state;
    if (st.cur && st.cur.id !== lastId) {
      lastId = st.cur.id;
      const react = 0.25;
      let aim = inst._aimTime();
      while (aim < react) aim += (4 * 1.35) / st.cur.speed;
      tapAt = now + aim + (botRng() * 2 - 1) * errMs / 1000;
    }
    if (now >= tapAt) {
      tapAt = Infinity;
      const before = inst._state.streak;
      inst.down(0, 0);
      if (inst._state.streak > before) perfect++;
    }
    inst.update(dt); now += dt;
  }
  return { ended, placed: inst._state.placed, perfect, score };
}

let fails = 0;
const DIFFS = ONLY_DIFF >= 0 ? [ONLY_DIFF] : [0, 1, 2];
for (const diff of DIFFS) {
  let minRate = 1;
  for (let lv = 1; lv <= LEVELS; lv++) {
    const r = MG.mulberry32(lv * 31337 + diff);
    let wins = 0, perf = 0, drops = 0;
    for (let t = 0; t < TRIALS; t++) {
      const o = run(lv, r, diff, false, ERR[diff]);
      if (o.ended === 'win') wins++;
      if (o.score !== o.placed) { fails++; console.log('FAIL score not reported'); }
      perf += o.perfect; drops += o.placed;
    }
    const rate = wins / TRIALS;
    minRate = Math.min(minRate, rate);
    const sp = def._speedOf(lv, 0, diff);
    const errPx = sp * ERR[diff] / 1000 * PX;
    const ok = rate >= MIN_RATE[diff];
    if (!ok) fails++;
    if (!ok || lv <= 2 || lv % 10 === 0) {
      console.log((ok ? 'ok  ' : 'FAIL') + ' ' + DNAME[diff] + ' L' + lv + ' target ' + def._targetOf(lv, diff) + ' speed ' + sp.toFixed(2) + ' perfect±' + (def._perfectOf(diff) * PX).toFixed(1) + 'px (bot err ±' + errPx.toFixed(1) + 'px)  bot wins ' + wins + '/' + TRIALS + '  perfect ' + Math.round(100 * perf / Math.max(1, drops)) + '%');
    }
  }
  console.log('  ' + DNAME[diff] + ': lowest bot win rate ' + Math.round(minRate * 100) + '% (need >= ' + MIN_RATE[diff] * 100 + '%, bot ±' + ERR[diff] + 'ms)');
}
// endless
const er = MG.mulberry32(777);
for (const e of ERR) {
  const scores = [];
  for (let t = 0; t < 8; t++) {
    const o = run(1, er, 2, true, e);
    if (o.ended !== 'lose' || o.score !== o.placed) { fails++; console.log('FAIL endless run did not end with lose/score', o); }
    scores.push(o.placed);
  }
  console.log('  無盡 bot ±' + e + 'ms scores: ' + scores.join(', '));
}
console.log((fails ? 'FAILED ' + fails : 'ALL OK') + ': ' + DIFFS.map((d) => DNAME[d]).join('/') + ' levels 1-' + LEVELS + ', ' + TRIALS + ' bot runs each; 無盡 runs end in a loss with score reported');
process.exit(fails ? 1 : 0);
