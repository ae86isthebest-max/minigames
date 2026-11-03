// Winnability check for 合成守城: node tools/check_merge.js [from=1] [to=60] [-v]
// Loads core.js + games/merge.js like smoke.js and plays every level with fixed dt 1/30 through the
// real input handlers (down/move/up on the buy button and slots):
//  (a) a greedy bot: every 0.3 s merge the highest identical pair, otherwise buy if affordable
//  (b) "do nothing" (no input at all)
// Pass = bot wins 簡單 1-[to] and 普通/困難 1-40, doing nothing loses every 困難 level,
// and in 無盡 both runs end, the bot lasting much longer than no input.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ID = 'merge';
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

function botStep(inst) {
  const s = inst._s, k = inst._k;
  let bi = -1, bj = -1, bt = -1;
  for (let i = 0; i < k.NS; i++) {
    const a = s.units[i]; if (!a || a.tier >= k.MAXT) continue;
    for (let j = i + 1; j < k.NS; j++) {
      const b = s.units[j];
      if (b && b.tier === a.tier && a.tier > bt) { bt = a.tier; bi = i; bj = j; }
    }
  }
  if (bi >= 0) {
    const [x0, y0] = k.slotXY(bi), [x1, y1] = k.slotXY(bj);
    inst.down(x0, y0); inst.move(x1, y1); inst.up(x1, y1);
    return;
  }
  if (s.coins >= k.cost() && s.units.some((u) => !u)) {
    const b = k.btn;
    inst.down(b.x + b.w / 2, b.y + b.h / 2); inst.up(b.x + b.w / 2, b.y + b.h / 2);
  }
}

function run(lv, useBot, mode, seed) {
  const api = makeApi(lv, mode, seed);
  const inst = def.create(api);
  const ctx = anyObj();
  const dt = 1 / 30;
  let f = 0;
  const maxF = mode === 3 ? 30 * 7200 : 30 * 900;
  for (; f < maxF && api.result === null; f++) {
    if (useBot && f % 9 === 0) botStep(inst);
    inst.update(dt);
    if (f % 60 === 0) inst.draw(ctx);
  }
  const s = inst._s;
  return { result: api.result || 'timeout', t: f / 30, wave: s.wave, waves: inst._k.P.waves, wall: Math.round(s.wallHp), top: s.bestTier + 1, score: api.scoreV };
}

const NAMES = ['簡單', '普通', '困難'];
let bad = 0;
for (let mode = 0; mode < 3; mode++) {
  let fails = 0, nothingWins = 0, minWall = 1e9;
  const times = [];
  const to = mode === 0 ? Math.max(TO, 40) : 40;
  for (let lv = FROM; lv <= to; lv++) {
    const b = run(lv, true, mode);
    const z = run(lv, false, mode);
    times.push(b.t);
    if (b.result === 'win') minWall = Math.min(minWall, b.wall);
    if (b.result !== 'win') fails++;
    if (z.result !== 'lose') nothingWins++;
    if (VERBOSE || b.result !== 'win' || (mode === 2 && z.result !== 'lose')) {
      console.log(NAMES[mode] + ' L' + lv + ' bot=' + b.result + ' t=' + b.t.toFixed(0) + 's wave ' + b.wave + '/' + b.waves + ' wall=' + b.wall + ' topTier=' + b.top +
        ' | nothing=' + z.result + ' at wave ' + z.wave + ' (' + z.t.toFixed(0) + 's)');
    }
  }
  const n = to - FROM + 1;
  console.log(ID + ' ' + NAMES[mode] + ' levels ' + FROM + '-' + to + ': bot wins ' + (n - fails) + '/' + n +
    ', do-nothing loses ' + (n - nothingWins) + '/' + n + ', level time ' + Math.min(...times).toFixed(0) + '-' + Math.max(...times).toFixed(0) + 's, closest wall left ' + minWall);
  bad += fails + (mode === 2 ? nothingWins : 0);
}
for (let k = 0; k < 3; k++) {
  const seed = 1000 + k * 777;
  const b = run(1, true, 3, seed), z = run(1, false, 3, seed);
  console.log(ID + ' 無盡 seed ' + seed + ': bot ' + b.result + ' at wave ' + b.wave + ' (' + b.t.toFixed(0) + 's, score ' + b.score + ', top tier ' + b.top + ')' +
    ' | no-input ' + z.result + ' at wave ' + z.wave + ' (' + z.t.toFixed(0) + 's)');
  if (z.result !== 'lose' || b.result !== 'lose' || b.wave < z.wave + 5) bad++;
}
if (bad) { console.log('FAIL'); process.exit(1); }
console.log('OK');
