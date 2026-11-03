// Winnability check for 合成水果: a simple bot plays each level with the game's own physics
// (same generator, same rng drop sequence, fixed dt = 1/120, same drop cooldown) and must reach
// the level goal without losing. For each drop it tries several x positions in a cloned world,
// simulates ~1 s and keeps the best (merge points, low stack, same fruits together).
// Modes 簡單/普通/困難, levels 1-40 each. On 困難 a held fruit auto-drops after 5 s, so a
// player who does nothing (fruit keeps falling in the middle) is also simulated and must lose.
// node tools/check_fruit.js [from=1] [to=40]
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FROM = parseInt(process.argv[2] || '1', 10), TO = parseInt(process.argv[3] || '40', 10);
const el = () => ({ classList: { add() {}, remove() {}, toggle() {} }, style: {}, appendChild() {}, addEventListener() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 700 }), getContext: () => ({}) });
const sandbox = { console, Math, location: { search: '?mute', protocol: 'file:' }, URLSearchParams, navigator: {}, localStorage: { getItem: () => null, setItem() {} }, document: { getElementById: el, createElement: el, addEventListener() {} }, addEventListener() {}, performance: { now: () => 0 }, setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0, cancelAnimationFrame() {} };
sandbox.window = sandbox;
vm.createContext(sandbox);
const root = path.join(__dirname, '..');
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'fruit.js'), 'utf8'), sandbox);
const MG = sandbox.MG;
const F = MG.games.find((d) => d.id === 'fruit')._logic;

function clone(w) {
  return { fr: w.fr.map((f) => Object.assign({}, f)), score: w.score, maxT: w.maxT, overT: w.overT, lost: w.lost, nid: w.nid, events: [], k: w.k };
}
function run(w, steps) { for (let i = 0; i < steps && !w.lost; i++) { F.step(w, F.DT); w.events.length = 0; } }
function evaluate(w, before) {
  if (w.lost) return -1e9;
  let v = (w.score - before.score) * 2 + (w.maxT > before.maxT ? 30 : 0);
  let minTop = 9;
  for (const f of w.fr) minTop = Math.min(minTop, f.y - f.r);
  if (minTop < F.LINE + 0.35) v -= (F.LINE + 0.35 - minTop) * 160;
  if (minTop < F.LINE + 0.05) v -= 400;
  // neighbours: reward same / adjacent sizes touching, punish small fruit buried under big ones
  for (let i = 0; i < w.fr.length; i++) for (let j = i + 1; j < w.fr.length; j++) {
    const a = w.fr[i], b = w.fr[j];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d > a.r + b.r + 0.02) continue;
    const dt = Math.abs(a.t - b.t);
    v += dt === 0 ? 4 : dt === 1 ? 1.5 : -dt * 0.8;
    const top = a.y < b.y ? a : b, bot = a.y < b.y ? b : a;
    if (top.t > bot.t + 1) v -= (top.t - bot.t) * 1.2;
  }
  v -= w.fr.length * 0.6;
  return v;
}

function seedRng(lv, mode) { return MG.mulberry32(lv * 7919 + 'fruit'.length * 104729 + 'fruit'.charCodeAt(0) + mode * 15485863); }
// idle player: every fruit auto-drops in the middle after the hold limit
function playLazy(lv, mode) {
  const rng = seedRng(lv, mode);
  const d = F.genLevel(lv, rng, mode, false);
  const w = d.world;
  let cur = d.first, drops = 0;
  const per = Math.round((F.DROP_COOLDOWN + F.dropLimit(mode, false, 0)) / F.DT);
  while (drops < 900) {
    if (F.goalMet(d.goal, w)) return 'win';
    if (w.lost) return 'lose';
    F.addFruit(w, cur, 0.5, F.SPAWN_Y); drops++;
    cur = F.randType(rng);
    run(w, per);
  }
  return 'timeout';
}
function playLevel(lv, mode) {
  const rng = seedRng(lv, mode);
  const d = F.genLevel(lv, rng, mode, false);
  const w = d.world;
  let cur = d.first, next = d.next, drops = 0;
  const cdSteps = Math.round(F.DROP_COOLDOWN / F.DT);
  while (drops < 900) {
    if (F.goalMet(d.goal, w)) return { ok: true, drops, w, d };
    if (w.lost) return { ok: false, drops, w, d };
    const r = F.RAD[cur] * w.k;
    let best = null;
    const K = 15;
    for (let k = 0; k < K; k++) {
      const x = r + (1 - 2 * r) * k / (K - 1);
      const c = clone(w);
      F.addFruit(c, cur, x, F.SPAWN_Y);
      run(c, 130);
      const v = evaluate(c, w);
      if (!best || v > best.v) best = { v, x };
    }
    F.addFruit(w, cur, best.x, F.SPAWN_Y);
    drops++;
    cur = next; next = F.randType(rng);
    run(w, cdSteps);
    if (F.goalMet(d.goal, w)) return { ok: true, drops, w, d };
  }
  return { ok: false, drops, w, d };
}

let fails = 0;
const t0 = Date.now();
const MN = ['簡單', '普通', '困難'];
for (let mode = 0; mode < 3; mode++) {
  let mf = 0, dropsTot = 0, lazyWins = 0;
  for (let lv = FROM; lv <= TO; lv++) {
    const r = playLevel(lv, mode);
    const goal = r.d.goal.kind === 'fruit' ? 'make ' + F.NAMES[r.d.goal.t] : 'score ' + r.d.goal.target;
    let lazy = '';
    if (mode === 2) { lazy = playLazy(lv, mode); if (lazy === 'win') lazyWins++; lazy = ' | idle player: ' + lazy; }
    console.log(MN[mode] + ' L' + lv + ' ' + goal + ' -> ' + (r.ok ? 'WIN' : 'FAIL') + ' after ' + r.drops + ' drops (score ' + r.w.score + ', biggest ' + F.NAMES[Math.max(0, r.w.maxT)] + ', fruits ' + r.w.fr.length + ')' + lazy);
    if (!r.ok) { fails++; mf++; }
    dropsTot += r.drops;
  }
  if (mode === 2 && lazyWins) { fails += lazyWins; }
  console.log('== ' + MN[mode] + ': ' + (TO - FROM + 1 - mf) + '/' + (TO - FROM + 1) + ' won by bot, avg ' + (dropsTot / (TO - FROM + 1)).toFixed(0) + ' drops' + (mode === 2 ? ', idle player won ' + lazyWins : ''));
}
console.log(fails ? 'FAIL: ' + fails + ' problem(s)' : 'OK fruit: 簡單/普通/困難 levels ' + FROM + '-' + TO + ' all won by bot; idle player loses every 困難 level (' + ((Date.now() - t0) / 1000).toFixed(1) + 's)');
process.exit(fails ? 1 : 0);
