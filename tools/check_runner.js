// Winnability check for 神廟跑酷: node tools/check_runner.js [from=1] [to=40] [-v]
// Loads core.js + games/runner.js like smoke.js and plays every level of 簡單/普通/困難 at dt 1/60 with
//  (a) a bot that only uses swipes (act L/R/U/D): follows the guaranteed safe lane of each obstacle row,
//      jumps low barriers / gaps and slides under bars with human-like timing;
//  (b) "do nothing" (no input at all).
// Pass = bot wins every level, doing nothing loses on every 普通/困難 level, and in 無盡 the bot survives
// 90 s while a no-input run ends.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FROM = parseInt(process.argv[2] || '1', 10);
const TO = parseInt(process.argv[3] || '40', 10);
const VERBOSE = process.argv.includes('-v');
const ID = 'runner';

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
vm.runInContext(fs.readFileSync(path.join(root, 'games', ID + '.js'), 'utf8'), sandbox, { filename: ID + '.js' });
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === ID);

function makeApi(lv, mode, seed) {
  const api = {
    W, H, level: lv, diff: mode === 3 ? 2 : mode, endless: mode === 3, best: 0,
    rng: MG.mulberry32(seed !== undefined ? seed : lv * 7919 + ID.length * 104729 + ID.charCodeAt(0) + mode * 15485863),
    util: MG.util, sfx() {}, info() {}, result: null, text: '', sc: 0,
    score(n) { api.sc = n; },
    get ended() { return api.result !== null; },
    win(t) { if (api.result === null) { api.result = 'win'; api.text = t; } }, lose(t) { if (api.result === null) { api.result = 'lose'; api.text = t; } },
  };
  return api;
}

function bot(inst) {
  const S = inst._s, K = inst._k;
  const rows = K.rows;
  let r = null;
  for (let i = 0; i < rows.length; i++) if (S.z - K.PD <= rows[i].end) { r = rows[i]; break; }
  if (!r) return;
  // lanes: go to this row's safe lane once lateral movement settled
  if (S.lane !== r.safe && Math.abs(S.x - K.laneX(S.lane)) < 0.05) K.act(r.safe < S.lane ? 'L' : 'R');
  const v = S.v;
  const t = (r.z - (S.z + K.PD)) / v;
  const dur = (r.end - r.z + 2 * K.PD) / v;
  const grounded = S.y <= 0.0001 && S.vy <= 0;
  if (r.act === 'low' || r.act === 'gap') {
    const need = r.act === 'low' ? K.LOWH + 0.02 : 0.02;
    if (grounded) { if (t <= 0.17) K.act('U'); return; }
    // airborne: will we clear it on the current arc?
    let y = S.y, vy = S.vy, ok = true, tt = 0;
    const step = 1 / 120;
    while (tt < t + dur) { vy -= K.GRAV * step; y += vy * step; tt += step; if (tt >= t && y < need) { ok = false; break; } if (y <= 0 && tt < t) break; }
    if (ok) return;
    if (y <= 0 && tt < t) { if (t <= 0.17) K.act('U'); return; }
    if (S.vy > -16) K.act('D');
    if (t <= 0.12) K.act('U');
  } else if (r.act === 'high') {
    if (grounded) { if (t <= 0.15 && S.slide < t + dur) K.act('D'); return; }
    if (t <= 0.4 && S.vy > -16) K.act('D');
  }
}

function run(lv, mode, useBot, maxT, seed) {
  const api = makeApi(lv, mode, seed);
  const inst = def.create(api);
  const ctx = anyObj();
  let f = 0;
  for (; f < 60 * maxT && api.result === null; f++) {
    if (useBot) bot(inst);
    inst.update(1 / 60);
    if (f % 45 === 0) inst.draw(ctx);
  }
  return { result: api.result || 'timeout', text: api.text, t: f / 60, dist: Math.floor(inst._s.dist), coins: inst._s.coins, goal: inst._k.GOAL, sc: api.sc };
}

let fails = 0, nothingWins = 0;
const names = ['簡單', '普通', '困難'];
for (let mode = 0; mode < 3; mode++) {
  let mf = 0, mn = 0; const times = [];
  for (let lv = FROM; lv <= TO; lv++) {
    const b = run(lv, mode, true, 400);
    const z = run(lv, mode, false, 400);
    times.push(b.t);
    if (b.result !== 'win') { fails++; mf++; }
    if (z.result !== 'lose' && mode > 0) { nothingWins++; mn++; }
    if (VERBOSE || b.result !== 'win' || (z.result !== 'lose' && mode > 0)) {
      console.log(names[mode] + ' L' + lv + ' bot=' + b.result + ' (' + b.text + ') t=' + b.t.toFixed(1) + 's dist=' + b.dist + '/' + b.goal +
        ' | nothing=' + z.result + ' dist=' + z.dist + ' t=' + z.t.toFixed(1));
    }
  }
  console.log(names[mode] + ' levels ' + FROM + '-' + TO + ': bot wins ' + (TO - FROM + 1 - mf) + '/' + (TO - FROM + 1) +
    ', do-nothing loses ' + (TO - FROM + 1 - mn) + '/' + (TO - FROM + 1) + ', level time ' + Math.min(...times).toFixed(0) + '-' + Math.max(...times).toFixed(0) + 's');
}
let endFail = 0;
for (let s = 1; s <= 6; s++) {
  const b = run(1, 3, true, 90, s * 977);
  const z = run(1, 3, false, 90, s * 977);
  const ok = b.result === 'timeout' && z.result === 'lose';
  if (!ok) endFail++;
  console.log('無盡 seed ' + s + ': bot ' + (b.result === 'timeout' ? 'alive after 90s' : b.result + ' (' + b.text + ') at ' + b.t.toFixed(1) + 's') +
    ' dist=' + b.dist + ' score=' + b.sc + ' | nothing ends at ' + z.t.toFixed(1) + 's (' + z.result + ')');
}
if (fails || nothingWins || endFail) { console.log('FAIL'); process.exit(1); }
console.log('OK');
