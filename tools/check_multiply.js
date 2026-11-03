// Winnability check for 倍增彈珠: node tools/check_multiply.js [levels=40] [diff]
// Loads core.js + games/multiply.js in the smoke.js sandbox and plays every level through the real game
// code (full physics): a bot opens each hopper at the release time the level's own evaluator marks as
// best → must WIN. On 困難 the bot also opens every hopper at its worst moment → should LOSE (counted),
// and a no-input player (hoppers auto-open when the timer runs out) is reported.
// 無盡: the bot must clear several stages; a no-input player must eventually fail.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const LEVELS = parseInt(process.argv[2] || '40', 10);
// diff argument: 0/1/2 = only that difficulty, 3 = only 無盡
const ONLY_DIFF = process.argv[3] !== undefined ? parseInt(process.argv[3], 10) : -1;

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
  console, Math, JSON, Date, Array, Object, Map, Set, Number, String, Proxy, Uint8ClampedArray, Float32Array, Float64Array, Int32Array, Int16Array, Int8Array, Uint8Array,
  setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0, cancelAnimationFrame() {},
  performance: { now: () => Date.now() }, localStorage: { getItem: () => null, setItem() {} },
  location: { search: '?mute', protocol: 'file:' }, URLSearchParams, navigator: {}, devicePixelRatio: 2,
  document: { getElementById: el, createElement: el, addEventListener() {} }, addEventListener() {},
};
sandbox.window = sandbox;
vm.createContext(sandbox);
const root = path.join(__dirname, '..');
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), sandbox, { filename: 'core.js' });
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'multiply.js'), 'utf8'), sandbox, { filename: 'multiply.js' });
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'multiply');
const ID = 'multiply';
function seedOf(lv, diff) { return lv * 7919 + ID.length * 104729 + ID.charCodeAt(0) + diff * 15485863; }

function mkApi(lv, diff, endless, seed) {
  const st = { ended: null, text: '', score: 0 };
  const api = {
    W, H, level: lv, rng: MG.mulberry32(seed), diff: endless ? 2 : diff, endless, best: 0,
    score(n) { st.score = n; }, util: MG.util, sfx() {}, info() {},
    get ended() { return st.ended !== null; },
    win(t) { if (st.ended === null) { st.ended = 'win'; st.text = t; } }, lose(t) { if (st.ended === null) { st.ended = 'lose'; st.text = t; } },
  };
  return { api, st };
}

// mode: 'best' | 'worst' | 'idle'; shift moves every release by that many 0.075 s slots
function play(inst, st, mode, maxSec, shift) {
  const dt = 1 / 60;
  let stage = inst._stage(), opened = null, plan = null, frames = 0;
  const reset = () => {
    plan = inst._plan();
    opened = plan.best.map(() => false);
  };
  reset();
  while (st.ended === null && frames < maxSec * 60) {
    if (inst._stage() !== stage) { stage = inst._stage(); reset(); }
    if (mode !== 'idle') {
      const times = mode === 'best' ? plan.best : plan.worst;
      const t = inst._simT();
      for (let h = 0; h < times.length; h++) {
        if (opened[h]) continue;
        let T = times[h] + (shift || 0) * 0.075; if (T < 0.3) T += 6;
        if (t + 1e-9 >= T) { inst._toggle(h); opened[h] = true; }
      }
    }
    inst.update(dt); frames++;
  }
  return frames / 60;
}

let fails = 0;
const DN = ['簡單', '普通', '困難'];
const t0 = Date.now();
const diffs = ONLY_DIFF >= 3 ? [] : ONLY_DIFF >= 0 ? [ONLY_DIFF] : [0, 1, 2];
const summary = {};
let maxCreate = 0;
for (const diff of diffs) {
  let triesSum = 0;
  let wins = 0, worstLoses = 0, idleLoses = 0, idleRuns = 0, ratioSum = 0;
  for (let lv = 1; lv <= LEVELS; lv++) {
    const a = mkApi(lv, diff, false, seedOf(lv, diff));
    const tc = Date.now();
    const inst = def.create(a.api);
    maxCreate = Math.max(maxCreate, Date.now() - tc);
    const plan = inst._plan(), target = inst._target();
    ratioSum += plan.bestSum / Math.max(1, plan.worstSum);
    play(inst, a.st, 'best', 120);
    let got = Math.floor(inst._collected()), tries = 1;
    // the bot retries with the releases nudged one slot later / earlier, like a player on a second attempt
    for (const sh of [1, -1, 2]) {
      if (a.st.ended === 'win') break;
      const r = mkApi(lv, diff, false, seedOf(lv, diff));
      const ir = def.create(r.api);
      play(ir, r.st, 'best', 120, sh);
      tries++;
      if (r.st.ended === 'win') { a.st.ended = 'win'; got = Math.floor(ir._collected()); }
    }
    triesSum += tries;
    const ok = a.st.ended === 'win';
    if (ok) wins++; else fails++;
    let line = (ok ? 'ok  ' : 'FAIL') + ' ' + DN[diff] + ' L' + lv + ' hoppers ' + plan.best.length + ' target ' + target +
      ' (est best ' + Math.round(plan.bestSum) + ' worst ' + Math.round(plan.worstSum) + ') bot ' + got + ' -> ' + a.st.ended + (tries > 1 ? ' (try ' + tries + ')' : '');
    if (diff === 2) {
      const b = mkApi(lv, diff, false, seedOf(lv, diff));
      const i2 = def.create(b.api);
      play(i2, b.st, 'worst', 120);
      if (b.st.ended === 'lose') worstLoses++;
      line += ' | bad timing ' + Math.floor(i2._collected()) + ' -> ' + b.st.ended;
      const c = mkApi(lv, diff, false, seedOf(lv, diff));
      const i3 = def.create(c.api);
      play(i3, c.st, 'idle', 120);
      idleRuns++;
      if (c.st.ended === 'lose') idleLoses++;
      line += ' | idle ' + Math.floor(i3._collected()) + ' -> ' + c.st.ended;
    }
    console.log(line);
  }
  summary[DN[diff]] = { avgTries: (triesSum / LEVELS).toFixed(2), wins, worstLoses, idleLoses, idleRuns, avgRatio: (ratioSum / LEVELS).toFixed(2) };
  if (diff === 2 && worstLoses < LEVELS * 0.7) { console.log('FAIL: bad timing should lose on most 困難 levels (' + worstLoses + '/' + LEVELS + ')'); fails++; }
}

if (ONLY_DIFF < 0 || ONLY_DIFF === 3) {
  // endless: bot clears stages, idle eventually fails
  let minStages = 99;
  for (let run = 0; run < 5; run++) {
    const a = mkApi(1, 2, true, 1234 + run * 77);
    const inst = def.create(a.api);
    const dt = 1 / 60;
    let frames = 0, stage = 1, opened = null, plan = null;
    const reset = () => { plan = inst._plan(); opened = plan.best.map(() => false); };
    reset();
    while (a.st.ended === null && inst._stage() <= 8 && frames < 60 * 600) {
      if (inst._stage() !== stage) { stage = inst._stage(); reset(); }
      const t = inst._simT();
      for (let h = 0; h < plan.best.length; h++) {
        if (opened[h]) continue;
        let T = plan.best[h]; if (T < 0.3) T += 6;
        if (t + 1e-9 >= T) { inst._toggle(h); opened[h] = true; }
      }
      inst.update(dt); frames++;
    }
    const reachedStage = inst._stage();
    minStages = Math.min(minStages, reachedStage);
    console.log('無盡 bot run ' + run + ': reached stage ' + reachedStage + ' score ' + a.st.score + ' (' + (a.st.ended || 'still going') + ')');
    const b = mkApi(1, 2, true, 1234 + run * 77);
    const i2 = def.create(b.api);
    play(i2, b.st, 'idle', 900);
    console.log('無盡 idle run ' + run + ': ' + (b.st.ended || 'NOT ENDED') + ' at stage ' + i2._stage() + ' score ' + b.st.score);
    if (b.st.ended !== 'lose') fails++;
  }
  if (minStages < 5) { console.log('FAIL: endless bot should clear at least 4 stages in every run'); fails++; }
}
console.log(JSON.stringify(summary));
console.log('slowest level setup (ghost evaluation) ' + maxCreate + ' ms');
console.log((fails ? 'FAILED ' + fails : 'ALL OK') + ' in ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
process.exit(fails ? 1 : 0);
