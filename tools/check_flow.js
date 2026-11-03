// Solvability check for 一筆連線: node tools/check_flow.js [levels=60]
// Loads core.js + games/flow.js in the smoke.js sandbox. For 簡單/普通/困難 x levels it verifies the generated
// solution (pipes are orthogonal paths between each pair of dots, no overlaps, every cell covered, endpoints not
// adjacent), then DRAWS that solution through the real touch handlers (down/move/up on cell centres) and requires
// api.win. On 困難 a no-input player must lose to the timer, and connecting all pairs while leaving holes must not win.
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
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'flow.js'), 'utf8'), sandbox, { filename: 'flow.js' });
const MG = sandbox.MG;
const ID = 'flow';
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
const LEVELS = parseInt(process.argv[2] || '60', 10);
const DN = ['簡單', '普通', '困難'];
let fails = 0;
const t0 = Date.now();
function adj(a, b, N) { const ar = (a / N) | 0, ac = a % N, br = (b / N) | 0, bc = b % N; return Math.abs(ar - br) + Math.abs(ac - bc) === 1; }
for (const diff of [0, 1, 2]) {
  const sizes = {};
  for (let lv = 1; lv <= LEVELS; lv++) {
    const { api, st } = mkApi(lv, diff);
    const inst = def.create(api);
    const L = inst._level, N = L.N;
    sizes[N + 'x' + N + '/' + L.K] = (sizes[N + 'x' + N + '/' + L.K] || 0) + 1;
    // 1. structural proof
    const seen = new Uint8Array(N * N);
    let ok = true, why = '';
    L.solution.forEach((p, k) => {
      if (p[0] !== L.dots[k][0] || p[p.length - 1] !== L.dots[k][1]) { ok = false; why = 'endpoint'; }
      if (p.length < 3) { ok = false; why = 'short'; }
      if (adj(p[0], p[p.length - 1], N)) { ok = false; why = 'adjacent ends'; }
      for (let i = 0; i < p.length; i++) {
        if (seen[p[i]]) { ok = false; why = 'overlap'; }
        seen[p[i]] = 1;
        if (i && !adj(p[i - 1], p[i], N)) { ok = false; why = 'gap'; }
      }
    });
    if (seen.some((v) => !v)) { ok = false; why = 'uncovered'; }
    // 2. draw it through the real input handlers
    for (const p of L.solution) {
      const [x0, y0] = inst._center(p[0]);
      inst.down(x0, y0);
      for (let i = 1; i < p.length; i++) { const [x, y] = inst._center(p[i]); inst.move(x, y); }
      const [x1, y1] = inst._center(p[p.length - 1]);
      inst.up(x1, y1);
      inst.update(1 / 60);
    }
    if (st.ended !== 'win') { ok = false; why += ' not won by drawing (' + st.ended + ')'; }
    let extra = '';
    if (diff === 2) {
      const b = mkApi(lv, diff);
      const i2 = def.create(b.api);
      for (let f = 0; f < 60 * 400 && !b.st.ended; f++) i2.update(1 / 60);
      if (b.st.ended !== 'lose') { ok = false; why += ' idle did not lose'; }
      extra = ' | idle -> ' + b.st.ended;
    }
    // 3. direct links (connect each pair with a short L path where possible) must not win when holes remain
    {
      const c = mkApi(lv, diff);
      const i3 = def.create(c.api);
      for (const p of L.solution) {
        const a = p[0], z = p[p.length - 1];
        const [x0, y0] = i3._center(a); i3.down(x0, y0);
        const [x1, y1] = i3._center(z); i3.move(x1, y1); i3.up(x1, y1);
      }
      if (c.st.ended === 'win') { ok = false; why += ' shortcut win'; }
    }
    if (!ok) fails++;
    if (!ok || lv <= 3 || lv % 10 === 0) console.log((ok ? 'ok  ' : 'FAIL ') + DN[diff] + ' L' + lv + ' ' + N + 'x' + N + ' pairs ' + L.K + ' lens [' + L.solution.map((p) => p.length).join(',') + '] -> ' + st.ended + extra + (why ? ' ' + why : ''));
  }
  console.log(DN[diff] + ' sizes/pairs: ' + JSON.stringify(sizes));
}
console.log((fails ? 'FAILED ' + fails : 'ALL OK') + ' (' + LEVELS + ' levels x 3 modes) in ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
process.exit(fails ? 1 : 0);
