// Winnability check for 泡泡龍: node tools/check_bubble.js [from=1] [to=60] [-v]
// Loads core.js + games/bubble.js like smoke.js. For every level a bot plays through the REAL game
// (down/move/up inputs, update(1/60) until the shot has landed). Each turn it tries every aim angle
// (0.006 rad steps) with and without swapping, using the game's own trace/place/advance on a cloned
// board, and picks the best by a greedy score plus a one-step look-ahead with the next bubble.
// Modes 簡單 (levels 1..to), 普通/困難 (1-40). Also: a no-input player (normal/hard auto-fire timer)
// must lose every 困難 level, and in 無盡 both runs end with the bot lasting far longer.
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
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'bubble.js'), 'utf8'), sandbox, { filename: 'bubble.js' });
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'bubble');

function makeApi(lv, mode, seed) {
  const api = {
    W, H, level: mode === 3 ? 1 : lv, diff: mode === 3 ? 2 : mode, endless: mode === 3, best: 0, scoreV: 0,
    rng: MG.mulberry32(seed !== undefined ? seed : lv * 7919 + 'bubble'.length * 104729 + 'bubble'.charCodeAt(0) + mode * 15485863),
    util: MG.util, sfx() {}, info() {}, result: null, score(n) { api.scoreV = n; },
    get ended() { return api.result !== null; },
    win() { if (api.result === null) api.result = 'win'; }, lose() { if (api.result === null) api.result = 'lose'; },
  };
  return api;
}

let VAR = 0;
function evalState(K, st, res) {
  if (st.result === 'win') return 1e9;
  if (st.result === 'lose') return -1e9;
  const lr = K.lowestRow(st) + st.drop;
  const n = K.count(st);
  let v = (res.pop.length + res.boom.length) / 3 * 60 + res.fall.length / 3 * 90 - n * (VAR === 2 || VAR === 4 ? 12 : 6) - Math.max(0, lr - 6) * Math.max(0, lr - 6) * (VAR === 1 || VAR === 3 ? 60 : 25);
  return v;
}
const NB = [];
function candidates(K, st, step) {
  // unique landing cells over a fine sweep of angles
  const seen = new Map(), tr = {};
  for (let a = K.AMIN; a <= Math.PI - K.AMIN + 1e-9; a += step) {
    K.trace(st, a, null, tr);
    if (tr.r < 0) continue;
    const key = tr.r * 16 + tr.c;
    if (!seen.has(key)) seen.set(key, { a, r: tr.r, c: tr.c, n: 1 });
    else { const o = seen.get(key); o.n++; if (o.n === 3) o.a = a; }
  }
  return [...seen.values()];
}
function simulate(K, st, cand, k) {
  const s2 = K.cloneState(st);
  const res = { pop: [], fall: [], boom: [] };
  K.place(s2, cand.r, cand.c, k, res);
  const adj = (() => {
    if (res.pop.length) return 0;
    K.nbrs(s2, cand.r, cand.c, NB); let m = 0;
    for (let i = 0; i < 12; i += 2) if (K.get(s2, NB[i], NB[i + 1]) === k) m++;
    return m;
  })();
  K.advance(s2);
  return { s2, v: evalState(K, s2, res) + adj * 18 };
}
function choose(K, st) {
  let best = null;
  for (let swap = 0; swap < 2; swap++) {
    const base = K.cloneState(st);
    if (swap) { const t = base.cur; base.cur = base.nxt; base.nxt = t; }
    const cands = candidates(K, base, 0.006);
    const scored = cands.map((c) => Object.assign(simulate(K, base, c, base.cur), { c, swap }));
    scored.sort((a, b) => b.v - a.v);
    for (const s of scored.slice(0, VAR >= 3 ? 14 : VAR ? 9 : 5)) {
      let v = s.v;
      if (s.s2.result === null) {
        let b2 = -1e12;
        for (let sw2 = 0; sw2 < (VAR >= 3 ? 2 : 1); sw2++) {
          const s3 = sw2 ? K.cloneState(s.s2) : s.s2;
          if (sw2) { const t = s3.cur; s3.cur = s3.nxt; s3.nxt = t; }
          const c2 = candidates(K, s3, VAR >= 3 ? 0.008 : 0.014);
          for (const c of c2) { const z = simulate(K, s3, c, s3.cur); if (z.v > b2) b2 = z.v; }
        }
        v = v * 0.5 + b2 * 0.5;
      }
      if (!best || v > best.v) best = { v, a: s.c.a, swap };
    }
  }
  return best;
}

function run(lv, mode, useBot, seed, maxShots, variant) {
  VAR = variant || 0;
  const api = makeApi(lv, mode, seed);
  const inst = def.create(api);
  const ctx = anyObj();
  const K = inst._k, S = inst._s, st = inst._st;
  let f = 0;
  const maxF = 60 * 60 * 30;
  for (; f < maxF && api.result === null; f++) {
    if (useBot && S.phase === 'aim' && S.intro >= 1 && (!maxShots || st.shots < maxShots)) {
      const b = choose(K, st);
      if (b.swap) { const sp = K.swapPos(); inst.down(sp.x, sp.y); inst.up(sp.x, sp.y); }
      const sx = K.PX(K.SX), sy = K.PY(K.SY);
      const x = sx + Math.cos(b.a) * 200, y = sy - Math.sin(b.a) * 200;
      inst.down(x, y); inst.move(x, y); inst.up(x, y);
      if (S.phase !== 'fly') throw new Error('bot shot did not fire');
    }
    inst.update(1 / 60);
    if (f % 120 === 0) inst.draw(ctx);
  }
  return { result: api.result || 'timeout', shots: st.shots, score: st.score, t: f / 60 };
}

const NAMES = ['簡單', '普通', '困難'];
let bad = 0;
for (let mode = 0; mode < 3; mode++) {
  let fails = 0, idleWins = 0, sh = [];
  const to = mode === 0 ? Math.max(TO, 40) : 40;
  for (let lv = FROM; lv <= to; lv++) {
    let b = run(lv, mode, true);
    for (let v = 1; v <= 4 && b.result !== 'win'; v++) { const b2 = run(lv, mode, true, undefined, 0, v); if (VERBOSE) console.log('  retry variant ' + v + ': ' + b2.result); b = b2; }
    sh.push(b.shots);
    if (b.result !== 'win') fails++;
    let z = null;
    if (mode === 2) { z = run(lv, mode, false); if (z.result !== 'lose') idleWins++; }
    if (VERBOSE || b.result !== 'win' || (z && z.result !== 'lose')) {
      console.log(NAMES[mode] + ' L' + lv + ' bot=' + b.result + ' shots=' + b.shots + (z ? ' | no-input=' + z.result + ' after ' + z.t.toFixed(0) + 's' : ''));
    }
  }
  const n = to - FROM + 1;
  console.log('bubble ' + NAMES[mode] + ' levels ' + FROM + '-' + to + ': bot wins ' + (n - fails) + '/' + n +
    (mode === 2 ? ', no-input loses ' + (n - idleWins) + '/' + n : '') + ', shots ' + Math.min(...sh) + '-' + Math.max(...sh));
  bad += fails + idleWins;
}
for (let k = 0; k < 3; k++) {
  const seed = 1000 + k * 777;
  const b = run(1, 3, true, seed, 150), z = run(1, 3, false, seed);
  console.log('bubble 無盡 seed ' + seed + ': bot ' + b.result + ' after ' + b.shots + ' shots score=' + b.score +
    ' | no-input ' + z.result + ' after ' + z.shots + ' shots score=' + z.score);
  if (z.result !== 'lose' || b.shots < z.shots * 4) bad++;
}
if (bad) { console.log('FAIL'); process.exit(1); }
console.log('OK');
