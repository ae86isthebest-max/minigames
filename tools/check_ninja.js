// Winnability check for 切水果: node tools/check_ninja.js [levels=40]
// Loads core.js + games/ninja.js in the smoke.js sandbox. A bot watches the real flying objects each frame and
// swipes (down/move/up through the real handlers) across fruit along a direction that keeps clear of every bomb.
// 簡單/普通/困難 levels 1..N must be WON; a no-input player must LOSE every level (3 missed fruit);
// a careless swiper that cuts straight across the screen hits bombs on 困難. 無盡: bot survives ≥ 90 s, idle ends.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

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
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'ninja.js'), 'utf8'), sandbox, { filename: 'ninja.js' });
const MG = sandbox.MG;
const ID = 'ninja';
const def = MG.games.find((d) => d.id === ID);
function seedOf(lv, diff) { return lv * 7919 + ID.length * 104729 + ID.charCodeAt(0) + diff * 15485863; }
function mkApi(lv, diff, endless, seed) {
  const st = { ended: null, text: '', score: 0, info: '' };
  const api = {
    W, H, level: lv, rng: MG.mulberry32(seed === undefined ? seedOf(lv, diff) : seed), diff: endless ? 2 : diff, endless: !!endless, best: 0,
    score(n) { if (typeof n !== 'number' || !isFinite(n)) throw new Error('bad score ' + n); st.score = n; }, util: MG.util, sfx() {}, info(t) { st.info = t; },
    get ended() { return st.ended !== null; },
    win(t) { if (st.ended === null) { st.ended = 'win'; st.text = t; } }, lose(t) { if (st.ended === null) { st.ended = 'lose'; st.text = t; } },
  };
  return { api, st };
}
const LEVELS = parseInt(process.argv[2] || '40', 10);
const DN = ['簡單', '普通', '困難'];
const dt = 1 / 60;

function botFrame(inst) {
  const items = inst._items();
  const bombs = items.filter((i) => i.kind === 'bomb');
  for (const it of items) {
    if (it.kind !== 'fruit') continue;
    if (it.y > H - it.r - 4 || it.y < it.r + 4) continue;
    const L = it.r + 10;
    for (let k = 0; k < 12; k++) {
      const a = k * Math.PI / 12;
      const x0 = it.x - Math.cos(a) * L, y0 = it.y - Math.sin(a) * L, x1 = it.x + Math.cos(a) * L, y1 = it.y + Math.sin(a) * L;
      let safe = true;
      for (const b of bombs) {
        // bombs move during the frame too: keep a generous margin
        const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy;
        let t = ((b.x - x0) * dx + (b.y - y0) * dy) / l2; t = Math.max(0, Math.min(1, t));
        const qx = x0 + dx * t - b.x, qy = y0 + dy * t - b.y;
        if (qx * qx + qy * qy < (b.r + 12) * (b.r + 12)) { safe = false; break; }
      }
      if (!safe) continue;
      inst.down(x0, y0); inst.move(x1, y1); inst.up(x1, y1);
      return true;
    }
  }
  return false;
}

function run(lv, diff, mode, endless, maxSec, seed) {
  const { api, st } = mkApi(lv, diff, endless, seed);
  const inst = def.create(api);
  let f = 0;
  for (; f < maxSec * 60 && st.ended === null; f++) {
    if (mode === 'bot' && f % 3 === 0) botFrame(inst);
    if (mode === 'careless' && f % 20 === 0) { inst.down(0, H * 0.45); inst.move(W, H * 0.45); inst.up(W, H * 0.45); inst.down(0, H * 0.25); inst.move(W, H * 0.25); inst.up(W, H * 0.25); }
    inst.update(dt);
  }
  return { st, sec: f / 60, s: inst._state() };
}

let fails = 0;
const t0 = Date.now();
const summary = {};
for (const diff of [0, 1, 2]) {
  let wins = 0, idleLose = 0, carelessLose = 0, secs = 0;
  for (let lv = 1; lv <= LEVELS; lv++) {
    const b = run(lv, diff, 'bot', false, 400);
    const i = run(lv, diff, 'idle', false, 400);
    const c = run(lv, diff, 'careless', false, 400);
    const ok = b.st.ended === 'win' && i.st.ended === 'lose';
    if (b.st.ended === 'win') wins++;
    if (i.st.ended === 'lose') idleLose++;
    if (c.st.ended === 'lose') carelessLose++;
    secs += b.sec;
    if (!ok) fails++;
    if (!ok || lv <= 2 || lv % 10 === 0) console.log((ok ? 'ok  ' : 'FAIL ') + DN[diff] + ' L' + lv + ' target ' + b.s.target + ' bot ' + b.st.ended + ' in ' + b.sec.toFixed(1) + 's (missed ' + b.s.misses + ') | idle ' + i.st.ended + ' (' + i.sec.toFixed(1) + 's) | careless ' + c.st.ended + ' (' + c.st.text + ')');
  }
  summary[DN[diff]] = { botWins: wins + '/' + LEVELS, idleLoses: idleLose + '/' + LEVELS, carelessLoses: carelessLose + '/' + LEVELS, avgSec: (secs / LEVELS).toFixed(1) };
  if (diff === 2 && carelessLose < LEVELS * 0.9) { console.log('FAIL: careless swiping should lose on 困難'); fails++; }
}
for (let r = 0; r < 4; r++) {
  const b = run(1, 2, 'bot', true, 90, 999 + r * 31);
  const i = run(1, 2, 'idle', true, 300, 999 + r * 31);
  const ok = b.st.ended === null && i.st.ended === 'lose';
  if (!ok) fails++;
  console.log((ok ? 'ok  ' : 'FAIL ') + '無盡 run ' + r + ': bot ' + (b.st.ended || 'alive') + ' after ' + b.sec.toFixed(0) + 's score ' + b.s.score + ' | idle ' + i.st.ended + ' after ' + i.sec.toFixed(1) + 's');
}
console.log(JSON.stringify(summary));
console.log((fails ? 'FAILED ' + fails : 'ALL OK') + ' in ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
process.exit(fails ? 1 : 0);
