// Winnability check for 蛇吃方塊: node tools/check_snake.js [from=1] [to=60] [-v]
// Loads core.js + games/snake.js like smoke.js and plays every level through the REAL game
// (one finger held down, horizontal drags, update(1/60)). The bot uses the game's own route planner:
// a dynamic programme over every pickup line / block row (lane x length, respecting walls and the
// time needed to change lanes) that maximises the snake length; it re-plans after every event.
// Pass = bot reaches the finish on 簡單 1..to, 普通/困難 1-40; a no-input snake loses every 困難 level;
// in 無盡 the no-input run ends and the bot survives at least 4x longer.
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
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'snake.js'), 'utf8'), sandbox, { filename: 'snake.js' });
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'snake');

function makeApi(lv, mode, seed) {
  const api = {
    W, H, level: mode === 3 ? 1 : lv, diff: mode === 3 ? 2 : mode, endless: mode === 3, best: 0, scoreV: 0,
    rng: MG.mulberry32(seed !== undefined ? seed : lv * 7919 + 'snake'.length * 104729 + 'snake'.charCodeAt(0) + mode * 15485863),
    util: MG.util, sfx() {}, info() {}, result: null, score(n) { api.scoreV = n; },
    get ended() { return api.result !== null; },
    win() { if (api.result === null) api.result = 'win'; }, lose() { if (api.result === null) api.result = 'lose'; },
  };
  return api;
}

function run(lv, mode, useBot, seed, maxT) {
  const api = makeApi(lv, mode, seed);
  const inst = def.create(api);
  const ctx = anyObj();
  const S = inst._s, plan = inst._plan, K = inst._k;
  const evs = plan.events;
  const fy = H * 0.8;
  if (useBot) inst.down(W / 2, fy);
  let i0 = 0, lanes = useBot ? K.route(plan, 0, 2, S.len, null) : [], planned = evs.length;
  const passed = (e) => (e.t === 'row' ? S.y > e.y - K.HR + 0.1 : S.y > e.y + 0.05);
  let f = 0;
  const maxF = 60 * (maxT || 900);
  for (; f < maxF && api.result === null; f++) {
    if (useBot) {
      let ch = false;
      while (i0 < evs.length && passed(evs[i0])) { i0++; ch = true; }
      if (ch || evs.length !== planned) {
        planned = evs.length;
        const lane = Math.max(0, Math.min(4, Math.floor(S.x)));
        lanes = K.route(plan, i0, lane, S.len, i0 > 0 ? evs[i0 - 1] : null);
      }
      const prev = i0 > 0 ? evs[i0 - 1] : null;
      let tl = lanes.length ? lanes[0] : Math.floor(S.x);
      if (prev && prev.t === 'row' && S.y < prev.y + K.BH + K.HR + 0.05) tl = Math.floor(S.x);
      inst.move(W / 2 + (tl + 0.5 - 2.5) * K.lw / 1.15, fy);
    }
    inst.update(1 / 60);
    if (f % 60 === 0) inst.draw(ctx);
  }
  return { result: api.result || 'timeout', t: f / 60, len: S.len, dist: S.y, score: api.scoreV, rows: plan.rows };
}

const NAMES = ['簡單', '普通', '困難'];
let bad = 0;
for (let mode = 0; mode < 3; mode++) {
  let fails = 0, idleWins = 0;
  const lens = [], times = [];
  const to = mode === 0 ? Math.max(TO, 40) : 40;
  for (let lv = FROM; lv <= to; lv++) {
    const b = run(lv, mode, true);
    const z = run(lv, mode, false);
    lens.push(b.len); times.push(b.t);
    if (b.result !== 'win') fails++;
    if (mode === 2 && z.result !== 'lose') idleWins++;
    if (VERBOSE || b.result !== 'win' || (mode === 2 && z.result !== 'lose')) {
      console.log(NAMES[mode] + ' L' + lv + ' bot=' + b.result + ' t=' + b.t.toFixed(1) + 's len=' + b.len + ' dist=' + b.dist.toFixed(0) + ' rows=' + b.rows +
        ' | no-input=' + z.result + ' at ' + z.dist.toFixed(0));
    }
  }
  const n = to - FROM + 1;
  console.log('snake ' + NAMES[mode] + ' levels ' + FROM + '-' + to + ': bot wins ' + (n - fails) + '/' + n +
    (mode === 2 ? ', no-input loses ' + (n - idleWins) + '/' + n : '') + ', finish length ' + Math.min(...lens) + '-' + Math.max(...lens) +
    ', time ' + Math.min(...times).toFixed(0) + '-' + Math.max(...times).toFixed(0) + 's');
  bad += fails + idleWins;
}
for (let k = 0; k < 3; k++) {
  const seed = 1000 + k * 777;
  const b = run(1, 3, true, seed, 300), z = run(1, 3, false, seed);
  console.log('snake 無盡 seed ' + seed + ': bot ' + b.result + ' after ' + b.t.toFixed(0) + 's dist ' + b.dist.toFixed(0) + ' score=' + b.score +
    ' | no-input ' + z.result + ' after ' + z.t.toFixed(0) + 's score=' + z.score);
  if (z.result !== 'lose' || b.t < z.t * 4) bad++;
}
if (bad) { console.log('FAIL'); process.exit(1); }
console.log('OK');
