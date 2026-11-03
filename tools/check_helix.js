// Winnability check for 螺旋跳塔: node tools/check_helix.js [from=1] [to=40] [-v]
// Loads core.js + games/helix.js like smoke.js and plays every level of 簡單/普通/困難 at dt 1/60 with
//  (a) a bot that only drags (down/move/up) at a human-like max spin speed of 8 rad/s: it predicts where the
//      ball lands on the next ring (incl. moving red blocks) and spins a gap (or a safe solid part) under it;
//  (b) "do nothing" (no input at all).
// Pass = bot wins every level; doing nothing loses on every 困難 level (fuse timer); in 無盡 the bot
// survives 90 s while a no-input run ends.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FROM = parseInt(process.argv[2] || '1', 10);
const TO = parseInt(process.argv[3] || '40', 10);
const VERBOSE = process.argv.includes('-v');
const ID = 'helix';

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

const ROTV = 8;
function landTime(y, vy, target, g, vmax) {
  let t = 0, yy = y, v = vy; const st = 1 / 240;
  while (yy < target && t < 3) { v = Math.min(vmax, v + g * st); yy += v * st; t += st; }
  return t;
}
function bot(inst, dt) {
  const S = inst._s, K = inst._k;
  const nb = K.nextRingIdx(); if (nb < 0) return 0;
  const R = K.rings[nb], R2 = K.rings[nb + 1];
  if (R.last) return 0;
  const tL = landTime(S.y, S.vy, R.y - K.BR, K.GRAV, K.VMAX);
  const vAt = Math.min(K.VMAX, Math.max(S.vy, 0) + K.GRAV * tL);
  let best = 0, bestC = 1e9;
  for (let k = -24; k <= 24; k++) {
    const d = k * Math.PI / 24;
    const lim = ROTV * Math.max(0, tL - 0.02);
    const rA = S.rot + Math.max(-lim, Math.min(lim, d));
    const v = K.segAt(R, rA, S.t + tL);
    let c = Math.abs(d) * 0.3;
    if (v === 2 || v === 3) { if (!S.fire) continue; c += 2; }
    else if (v === 1) {
      if (R2) {
        const t2 = landTime(R.y - K.BR, vAt, R2.y - K.BR, K.GRAV, K.VMAX);
        if (!R2.last) {
          const lim2 = ROTV * Math.max(0, t2 - 0.04);
          let c2 = 30;
          for (let q = -12; q <= 12; q++) {
            const e = q * Math.PI / 24;
            if (Math.abs(e) > lim2) continue;
            const v2 = K.segAt(R2, rA + e, S.t + tL + t2);
            const cc = (v2 === 1 ? -3 : (v2 === 2 || v2 === 3) ? 30 : 1) + Math.abs(e) * 0.5;
            if (cc < c2) c2 = cc;
          }
          c += c2;
        }
      }
    } else c += 10;
    if (c < bestC) { bestC = c; best = d; }
  }
  const cap = Math.min(ROTV * dt, Math.max(0, ROTV * (tL - 0.02)));
  const step = Math.max(-cap, Math.min(cap, best));
  return step;
}

function run(lv, mode, useBot, maxT, seed) {
  const api = makeApi(lv, mode, seed);
  const inst = def.create(api);
  const ctx = anyObj();
  let f = 0, px = 200;
  const k = inst._k.W / 6.2 * (Math.max(260, inst._k.W) / inst._k.W);
  if (useBot) inst.down(px, 400);
  for (; f < 60 * maxT && api.result === null; f++) {
    if (useBot) { const st = bot(inst, 1 / 60); px += st * k; inst.move(px, 400); }
    inst.update(1 / 60);
    if (f % 45 === 0) inst.draw(ctx);
  }
  return { result: api.result || 'timeout', text: api.text, t: f / 60, passed: inst._s.passed, total: inst._k.rings.length, sc: api.sc, bounces: inst._s.bounces };
}

let fails = 0, nothingWins = 0;
const names = ['簡單', '普通', '困難'];
for (let mode = 0; mode < 3; mode++) {
  let mf = 0, mn = 0; const times = [];
  for (let lv = FROM; lv <= TO; lv++) {
    const b = run(lv, mode, true, 300);
    const z = run(lv, mode, false, 60);
    times.push(b.t);
    if (b.result !== 'win') { fails++; mf++; }
    if (z.result !== 'lose' && mode === 2) { nothingWins++; mn++; }
    if (VERBOSE || b.result !== 'win' || (z.result !== 'lose' && mode === 2)) {
      console.log(names[mode] + ' L' + lv + ' bot=' + b.result + ' (' + b.text + ') t=' + b.t.toFixed(1) + 's passed=' + b.passed + ' bounces=' + b.bounces +
        ' | nothing=' + z.result + ' t=' + z.t.toFixed(1));
    }
  }
  console.log(names[mode] + ' levels ' + FROM + '-' + TO + ': bot wins ' + (TO - FROM + 1 - mf) + '/' + (TO - FROM + 1) +
    (mode === 2 ? ', do-nothing loses ' + (TO - FROM + 1 - mn) + '/' + (TO - FROM + 1) : '') + ', level time ' + Math.min(...times).toFixed(0) + '-' + Math.max(...times).toFixed(0) + 's');
}
let endFail = 0;
for (let s = 1; s <= 6; s++) {
  const b = run(1, 3, true, 90, s * 977);
  const z = run(1, 3, false, 90, s * 977);
  const ok = b.result === 'timeout' && z.result === 'lose';
  if (!ok) endFail++;
  console.log('無盡 seed ' + s + ': bot ' + (b.result === 'timeout' ? 'alive after 90s' : b.result + ' (' + b.text + ') at ' + b.t.toFixed(1) + 's') +
    ' rings=' + b.passed + ' | nothing ends at ' + z.t.toFixed(1) + 's (' + z.result + ')');
}
if (fails || nothingWins || endFail) { console.log('FAIL'); process.exit(1); }
console.log('OK');
