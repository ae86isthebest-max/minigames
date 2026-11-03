// Winnability check for 圈地大作戰: node tools/check_paper.js [from=1] [to=60] [-v]
// Loads core.js + games/paper.js like smoke.js and plays every level with fixed dt 1/30.
//  (a) a bot that steers through the real swipe input (down/move/up): each time the blob reaches a cell
//      it asks the same planner the AI opponents use (loop out and back, return early when an enemy gets
//      close to its trail, cut enemy trails within reach) and swipes that way;
//  (b) "do nothing" (no input: the blob runs straight, slides along the wall and crosses its own trail).
// Pass = bot wins 簡單 1-[to] and 普通/困難 1-40, doing nothing loses every level,
// and in 無盡 both runs end with the bot scoring far more than no input.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ID = 'paper';
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
  console, Math, JSON, Date, Array, Object, Map, Set, Number, String, Proxy, Uint8ClampedArray, Float32Array, Int32Array, Int8Array, Int16Array, Uint8Array, Uint16Array,
  setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0, cancelAnimationFrame() {},
  performance: { now: () => Date.now() }, localStorage: { getItem: () => null, setItem() {} },
  location: { search: '?mute', protocol: 'file:' }, URLSearchParams, navigator: {}, devicePixelRatio: 2,
  document: { getElementById: el, createElement: el, addEventListener() {} }, addEventListener() {},
};
sandbox.window = sandbox;
vm.createContext(sandbox);
const root = path.join(__dirname, '..');
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), sandbox, { filename: 'core.js' });
vm.runInContext(fs.readFileSync(path.join(root, 'games', ID + '.js'), 'utf8'), sandbox, { filename: ID + '.js' });
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === ID);

function makeApi(lv, mode, seed) {
  const api = {
    W, H, level: mode === 3 ? 1 : lv, diff: mode === 3 ? 2 : mode, endless: mode === 3, best: 0, scoreV: 0,
    rng: MG.mulberry32(seed !== undefined ? seed : lv * 7919 + ID.length * 104729 + ID.charCodeAt(0) + mode * 15485863),
    util: MG.util, sfx() {}, info() {}, result: null, score(n) { api.scoreV = n; },
    get ended() { return api.result !== null; },
    win() { if (api.result === null) api.result = 'win'; }, lose() { if (api.result === null) api.result = 'lose'; },
  };
  return api;
}


function run(lv, useBot, mode, seed) {
  const api = makeApi(lv, mode, seed);
  const inst = def.create(api);
  const ctx = anyObj();
  const dt = 1 / 30;
  let f = 0;
  const maxF = mode === 3 ? 30 * 1800 : 30 * 400;
  const SW = [[40, 0], [0, 40], [-40, 0], [0, -40]];
  for (; f < maxF && api.result === null; f++) {
    inst.update(dt);
    const me = inst._s.me;
    if (useBot && api.result === null && me.alive && me.arrived) {
      const d = inst._k.decide(me, 3);
      if (d !== me.dir) { inst.down(W / 2, H / 2); inst.move(W / 2 + SW[d][0], H / 2 + SW[d][1]); inst.up(W / 2 + SW[d][0], H / 2 + SW[d][1]); }
    }
    if (f % 60 === 0) inst.draw(ctx);
  }
  const s = inst._s;
  return { result: api.result || 'timeout', t: f / 30, pct: Math.round(inst._k.counts[1] / inst._k.N * 1000) / 10, target: Math.round(inst._k.P.target * 100), kills: s.kills, score: api.scoreV };
}

const NAMES = ['簡單', '普通', '困難'];
let bad = 0;
for (let mode = 0; mode < 3; mode++) {
  let fails = 0, nothingWins = 0;
  const times = [];
  const to = mode === 0 ? Math.max(TO, 40) : 40;
  for (let lv = FROM; lv <= to; lv++) {
    const b = run(lv, true, mode);
    const z = run(lv, false, mode);
    times.push(b.t);
    if (b.result !== 'win') fails++;
    if (z.result !== 'lose') nothingWins++;
    if (VERBOSE || b.result !== 'win' || z.result !== 'lose') {
      console.log(NAMES[mode] + ' L' + lv + ' bot=' + b.result + ' t=' + b.t.toFixed(0) + 's own ' + b.pct + '%/' + b.target + '% kills=' + b.kills +
        ' | nothing=' + z.result + ' (' + z.t.toFixed(0) + 's)');
    }
  }
  const n = to - FROM + 1;
  console.log(ID + ' ' + NAMES[mode] + ' levels ' + FROM + '-' + to + ': bot wins ' + (n - fails) + '/' + n + ', do-nothing loses ' + (n - nothingWins) + '/' + n +
    ', bot time ' + Math.min(...times).toFixed(0) + '-' + Math.max(...times).toFixed(0) + 's');
  bad += fails + nothingWins;
}
for (let k = 0; k < 3; k++) {
  const seed = 1000 + k * 777;
  const b = run(1, true, 3, seed), z = run(1, false, 3, seed);
  console.log(ID + ' 無盡 seed ' + seed + ': bot ' + b.result + ' after ' + b.t.toFixed(0) + 's score ' + b.score + ' (kills ' + b.kills + ')' +
    ' | no-input ' + z.result + ' after ' + z.t.toFixed(0) + 's score ' + z.score);
  if (z.result !== 'lose' || b.result === null || b.score < z.score * 3 + 100) bad++;
}
if (bad) { console.log('FAIL'); process.exit(1); }
console.log('OK');
