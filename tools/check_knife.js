// Winnability check for 擲飛刀: node tools/check_knife.js [from=1] [to=60] [-v]
// Loads core.js + games/knife.js like smoke.js and plays every stage through the REAL game (taps,
// update(1/60)). The rotation is closed-form, so the bot predicts exactly where a knife thrown now
// will land (rotation at t + flight time) and only taps when that spot is clear of every stuck knife.
// Pass = bot clears 簡單 1..to and 普通/困難 1-40 (bosses every 5th); a no-input player loses every 困難
// stage (time limit); in 無盡 the no-input run ends and the bot clears at least 10 stages.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FROM = parseInt(process.argv[2] || '1', 10);
const TO = parseInt(process.argv[3] || '60', 10);
const VERBOSE = process.argv.includes('-v');

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
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'knife.js'), 'utf8'), sandbox, { filename: 'knife.js' });
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'knife');

function makeApi(lv, mode, seed) {
  const api = {
    W, H, level: mode === 3 ? 1 : lv, diff: mode === 3 ? 2 : mode, endless: mode === 3, best: 0, scoreV: 0,
    rng: MG.mulberry32(seed !== undefined ? seed : lv * 7919 + 'knife'.length * 104729 + 'knife'.charCodeAt(0) + mode * 15485863),
    util: MG.util, sfx() {}, info() {}, result: null, score(n) { api.scoreV = n; },
    get ended() { return api.result !== null; },
    win() { if (api.result === null) api.result = 'win'; }, lose() { if (api.result === null) api.result = 'lose'; },
  };
  return api;
}

function run(lv, mode, useBot, seed, maxStages) {
  const api = makeApi(lv, mode, seed);
  const inst = def.create(api);
  const ctx = anyObj();
  const S = inst._s, K = inst._k;
  let f = 0, maxWait = 0, wait = 0;
  const maxF = 60 * 60 * 20;
  for (; f < maxF && api.result === null; f++) {
    if (useBot && K.canThrow() && (!maxStages || S.stages < maxStages)) {
      const st = inst._st;
      const a = K.landAngle(st, S.t + K.FT);
      let ok = true;
      for (const k of S.stuck) if (K.adist(k.a, a) < K.KW + 0.03) { ok = false; break; }
      if (ok) { inst.down(W / 2, H * 0.8); wait = 0; } else { wait++; maxWait = Math.max(maxWait, wait); }
    }
    inst.update(1 / 60);
    if (f % 30 === 0) inst.draw(ctx);
  }
  return { result: api.result || 'timeout', t: f / 60, stages: S.stages, score: api.scoreV, knives: S.knivesTotal, apples: S.applesHit, maxWait: maxWait / 60 };
}

const NAMES = ['簡單', '普通', '困難'];
let bad = 0;
for (let mode = 0; mode < 3; mode++) {
  let fails = 0, idleWins = 0, apples = 0, mw = 0;
  const to = mode === 0 ? Math.max(TO, 40) : 40;
  for (let lv = FROM; lv <= to; lv++) {
    const b = run(lv, mode, true);
    const z = mode === 2 ? run(lv, mode, false) : null;
    if (b.result !== 'win') fails++;
    if (z && z.result !== 'lose') idleWins++;
    apples += b.apples; mw = Math.max(mw, b.maxWait);
    if (VERBOSE || b.result !== 'win' || (z && z.result !== 'lose')) {
      console.log(NAMES[mode] + ' L' + lv + (lv % 5 ? '' : ' (boss)') + ' bot=' + b.result + ' t=' + b.t.toFixed(1) + 's knives=' + b.knives + ' apples=' + b.apples +
        ' longest wait=' + b.maxWait.toFixed(2) + 's' + (z ? ' | no-input=' + z.result + ' at ' + z.t.toFixed(1) + 's' : ''));
    }
  }
  const n = to - FROM + 1;
  console.log('knife ' + NAMES[mode] + ' stages ' + FROM + '-' + to + ': bot clears ' + (n - fails) + '/' + n +
    (mode === 2 ? ', no-input loses ' + (n - idleWins) + '/' + n : '') + ', longest safe-wait ' + mw.toFixed(2) + 's');
  bad += fails + idleWins;
}
for (let k = 0; k < 3; k++) {
  const seed = 1000 + k * 777;
  const b = run(1, 3, true, seed, 30), z = run(1, 3, false, seed);
  console.log('knife 無盡 seed ' + seed + ': bot ' + b.result + ' after ' + b.stages + ' stages score=' + b.score +
    ' | no-input ' + z.result + ' after ' + z.t.toFixed(0) + 's score=' + z.score);
  if (z.result !== 'lose' || b.stages < 10) bad++;
}
if (bad) { console.log('FAIL'); process.exit(1); }
console.log('OK');
