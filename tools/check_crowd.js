// Winnability check for 人群跑酷: node tools/check_crowd.js [from=1] [to=60] [-v]
// Loads core.js + games/crowd.js like smoke.js and plays every level with fixed dt 1/60:
//  (a) a simple bot: picks the better gate of each pair, steers the blob to the side of
//      traps with the least overlap (predicting moving saws), otherwise stays put
//  (b) "do nothing" (no input at all: runs straight down the middle)
// Pass = bot wins every level and doing nothing loses every level.
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
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'crowd.js'), 'utf8'), sandbox, { filename: 'crowd.js' });
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'crowd');

function makeApi(lv) {
  const api = {
    W, H, level: lv, rng: MG.mulberry32(lv * 7919 + 'crowd'.length * 104729 + 'crowd'.charCodeAt(0)),
    util: MG.util, sfx() {}, info() {}, result: null, text: '',
    get ended() { return api.result !== null; },
    win(t) { if (api.result === null) { api.result = 'win'; api.text = t; } }, lose(t) { if (api.result === null) { api.result = 'lose'; api.text = t; } },
  };
  return api;
}

function overlap(a0, a1, b0, b1) { return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0)); }

function botTarget(inst) {
  const s = inst._s, k = inst._k, RW = k.RW;
  const R = k.blobR(s.count);
  const hz = [];
  let gate = null;
  for (const e of k.T.els) {
    const dz = e.z - s.z;
    if (e.type === 'gate') { if (!e.used && dz > -0.5 && dz < 24 && !gate) gate = e; continue; }
    const zEnd = e.type === 'gap' ? e.z1 : e.type === 'spike' ? e.z + e.d : e.z;
    if (zEnd < s.z - R - 0.3 || dz > 16) continue;
    if (gate && gate.z - s.z < 10 && e.z > gate.z + 1) continue;
    hz.push(e);
  }
  let best = s.x, bestC = 1e9;
  for (let x = -RW + 0.25; x <= RW - 0.25 + 1e-6; x += 0.05) {
    const b0 = Math.max(-RW, x - R), b1 = Math.min(RW, x + R);
    const tMove = Math.abs(x - s.x) / 9 + 0.25;
    let c = Math.abs(x - s.x) * 0.6;
    for (const e of hz) {
      const w = 1 / (1 + Math.max(0, e.z - s.z) * 0.08);
      const soon = (e.z - s.z - R) / k.V < tMove;
      const a0 = soon ? Math.max(-RW, Math.min(x, s.x) - R) : b0, a1 = soon ? Math.min(RW, Math.max(x, s.x) + R) : b1;
      if (e.type === 'spike' || e.type === 'gap') c += overlap(a0, a1, e.xa - 0.3, e.xb + 0.3) / (a1 - a0) * 150 * w;
      else {
        const tArr = s.t + (e.z - s.z) / k.V;
        let lo = 1e9, hi = -1e9;
        for (let q = -1; q <= 1; q += 0.25) {
          const sx = k.sawX(e, tArr + q * (R / k.V + 0.2));
          lo = Math.min(lo, sx); hi = Math.max(hi, sx);
        }
        c += overlap(a0, a1, lo - e.r - 0.3, hi + e.r + 0.3) / (a1 - a0) * 150 * w;
      }
    }
    if (gate && (gate.z - s.z < 10 || !hz.some((e) => e.z < gate.z))) {
      const v0 = k.applyOp(gate.ops[0], s.count), v1 = k.applyOp(gate.ops[1], s.count);
      const side = x < 0 ? 0 : 1, vb = Math.max(v0, v1), vs = side ? v1 : v0;
      c += (vb - vs) / Math.max(1, vb) * 60 + (Math.abs(x) < 0.3 ? 5 : 0);
    }
    if (c < bestC - 1e-9) { bestC = c; best = x; }
  }
  return best;
}

function run(lv, useBot) {
  const api = makeApi(lv);
  const inst = def.create(api);
  const ctx = anyObj();
  const ppu = inst._k.pxPerUnit;
  const x0 = W / 2;
  if (useBot) inst.down(x0, H * 0.7);
  let f = 0;
  for (; f < 60 * 240 && api.result === null; f++) {
    if (useBot) inst.move(x0 + botTarget(inst) * ppu / 1.1, H * 0.7);
    inst.update(1 / 60);
    if (f % 30 === 0) inst.draw(ctx);
  }
  return { result: api.result || 'timeout', text: api.text, t: f / 60, army: inst._k.T.army, best: inst._k.T.best, count: inst._s.count, step: inst._s.step };
}

let fails = 0, nothingWins = 0;
const times = [];
for (let lv = FROM; lv <= TO; lv++) {
  const b = run(lv, true);
  const z = run(lv, false);
  times.push(b.t);
  if (b.result !== 'win') fails++;
  if (z.result !== 'lose') nothingWins++;
  if (VERBOSE || b.result !== 'win' || z.result !== 'lose') {
    console.log('L' + lv + ' bot=' + b.result + ' (' + b.text + ') t=' + b.t.toFixed(1) + 's army=' + b.army + ' planBest=' + b.best + ' step=' + b.step +
      ' | nothing=' + z.result + ' (' + z.text + ')');
  }
}
console.log('crowd levels ' + FROM + '-' + TO + ': bot wins ' + (TO - FROM + 1 - fails) + '/' + (TO - FROM + 1) +
  ', do-nothing loses ' + (TO - FROM + 1 - nothingWins) + '/' + (TO - FROM + 1) +
  ', level time ' + Math.min(...times).toFixed(0) + '-' + Math.max(...times).toFixed(0) + 's');
if (fails || nothingWins) { console.log('FAIL'); process.exit(1); }
console.log('OK');
