// Winnability check for 拔針救人: node tools/check_pins.js [levels=40] [diff 0|1|2] [level]
// Loads core.js + games/pins.js in the same stub sandbox as smoke.js, then for 簡單/普通/困難 x every level
// plays the template's intended pin order through the real game code (physics included) and
// requires a win; every "wrong" order listed for the template must end in a loss; on every
// non-tutorial level (3+) pulling any single pin alone must NOT win.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const LEVELS = parseInt(process.argv[2] || '40', 10);
const ONLY_DIFF = process.argv[3] !== undefined ? parseInt(process.argv[3], 10) : -1;
const ONLY = process.argv[4] ? parseInt(process.argv[4], 10) : 0;

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
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'pins.js'), 'utf8'), sandbox, { filename: 'pins.js' });
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'pins');

function seedOf(lv, diff) { return lv * 7919 + 'pins'.length * 104729 + 'pins'.charCodeAt(0) + diff * 15485863; }

function play(lv, order, diff) {
  let ended = null, text = '';
  const api = {
    W, H, level: lv, rng: MG.mulberry32(seedOf(lv, diff)), diff, endless: false, best: 0, score() {},
    util: MG.util, sfx() {}, info() {},
    get ended() { return ended !== null; },
    win(t) { if (ended === null) { ended = 'win'; text = t; } }, lose(t) { if (ended === null) { ended = 'lose'; text = t; } },
  };
  const inst = def.create(api);
  const dt = 1 / 60;
  let frames = 0;
  for (let f = 0; f < 30; f++) inst.update(dt);
  for (const p of order) {
    if (ended) break;
    inst._pull(p);
    let calm = 0;
    for (let f = 0; f < 360 && !ended; f++) {
      inst.update(dt); frames++;
      if (inst._world.maxSpeed() < 22) calm++; else calm = 0;
      if (calm > 25 && f > 40) break;
    }
  }
  for (let f = 0; f < 900 && !ended; f++) { inst.update(dt); frames++; }
  const s = inst._world.stats();
  const L = inst._level;
  return { ended: ended || 'none', text, tpl: L.tplIndex + 1, mirror: !!L.mirror, need: inst._need, cup: s.cupColored, colorable: s.colorable, monster: L.monster ? (L.monster.alive ? 'alive' : 'dead') : '-' };
}

function r0colorable(lv, diff) {
  const api = {
    W, H, level: lv, rng: MG.mulberry32(seedOf(lv, diff)),
    diff, endless: false, best: 0, score() {}, util: MG.util, sfx() {}, info() {}, ended: false, win() {}, lose() {},
  };
  return def.create(api)._world.initialColorable;
}

let fails = 0, wrongChecked = 0, singleChecked = 0;
const t0 = Date.now();
const DIFFS = ONLY_DIFF >= 0 ? [ONLY_DIFF] : [0, 1, 2];
const DNAME = ['簡單', '普通', '困難'];
for (const diff of DIFFS)
for (let lv = 1; lv <= LEVELS; lv++) {
  if (ONLY && lv !== ONLY) continue;
  const probe = def._makeLevel(lv, MG.mulberry32(seedOf(lv, diff)), diff);
  const tpl = probe.tpl;
  const r = play(lv, tpl.order, diff);
  const ok = r.ended === 'win' && (probe.kind !== 'cup' || r.cup <= r.colorable);
  if (!ok) fails++;
  let line = (ok ? 'ok  ' : 'FAIL') + ' ' + DNAME[diff] + ' L' + lv + ' tpl' + r.tpl + (r.mirror ? 'm' : ' ') + ' order[' + tpl.order + '] -> ' + r.ended + ' (' + (probe.kind === 'cup' ? r.cup + '/' + r.need : 'monster ' + r.monster) + ')';
  const idle = play(lv, [], diff);
  const idleOk = idle.ended === 'none' && (probe.kind !== 'cup' || idle.cup === 0) && idle.colorable === r0colorable(lv, diff);
  if (!idleOk) { fails++; line += ' | IDLE FAIL (' + idle.ended + ', cup ' + idle.cup + ')'; }
  if (!tpl.tutorial) {
    const singles = [];
    for (let i = 0; i < probe.pins.length; i++) {
      singles.push(play(lv, [i], diff).ended);
      singleChecked++;
    }
    const bad = singles.map((e, i) => (e === 'win' ? i : -1)).filter((i) => i >= 0);
    if (bad.length) { fails++; line += ' | SINGLE-PIN WIN FAIL pins ' + bad; }
    else line += ' | single pins: none wins';
  }
  for (const w of tpl.wrong || []) {
    const rw = play(lv, w, diff);
    wrongChecked++;
    const okw = rw.ended === 'lose';
    if (!okw) fails++;
    line += ' | wrong[' + w + '] -> ' + rw.ended + (okw ? '' : ' FAIL') + (probe.kind === 'cup' ? ' (' + rw.cup + '/' + rw.need + ')' : '');
  }
  console.log(line);
}
console.log((fails ? 'FAILED ' + fails : 'ALL OK') + ': ' + DIFFS.map((d) => DNAME[d]).join('/') + ' levels 1-' + LEVELS + ', ' + def._TPL.length + ' templates, ' + wrongChecked + ' wrong-order checks, ' + singleChecked + ' single-pin checks (none may win), cup counter <= total ('  + ((Date.now() - t0) / 1000).toFixed(1) + 's)');
process.exit(fails ? 1 : 0);
