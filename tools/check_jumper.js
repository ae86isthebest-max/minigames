// Winnability check for 跳跳樂: node tools/check_jumper.js [from=1] [to=40] [-v]
// Loads core.js + games/jumper.js like smoke.js and plays every level of 簡單/普通/困難 at dt 1/60 with
//  (a) a bot that only holds left / right / centre (down/move) like a thumb: it climbs the generator's guaranteed
//      platform chain, picking the next chain platform it can still reach before falling past it;
//  (b) "do nothing" (no input at all).
// Pass = bot wins every level, doing nothing loses every 困難 level (worn platforms crumble), and in 無盡 the bot survives 90 s
// while a no-input run ends.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FROM = parseInt(process.argv[2] || '1', 10);
const TO = parseInt(process.argv[3] || '40', 10);
const VERBOSE = process.argv.includes('-v');
const ID = 'jumper';

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

function fallTime(y, vy, g, ty) {
  const a = -g / 2, b = vy, c = y - ty;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return -1;
  return (-b - Math.sqrt(disc)) / (2 * a);
}
let lastIdx = 0;
function bot(inst) {
  const S = inst._s, K = inst._k;
  const ch = K.chain;
  let tgt = null;
  const apex = S.vy > 0 ? S.y + S.vy * S.vy / (2 * K.GRAV) : S.y;
  const flying = apex - S.lastLand > K.JUMP * K.JUMP / (2 * K.GRAV) + 30;
  let bestY = -1e9;
  for (let i = 0; i < ch.length; i++) {
    const p = ch[i];
    if (p.gone || p.y <= S.lastLand + 1 || p.y > apex - 4) continue;
    const t = fallTime(S.y, S.vy, K.GRAV, p.y);
    if (t <= 0) continue;
    const px = K.platX(p, S.t + t);
    const need = Math.abs(K.wrapD(S.x, px)) - p.w / 2 + 6;
    const ok = need <= 0 || need / K.VX + 0.08 <= t;
    if (!flying) { if (!tgt) tgt = { p, px }; break; }
    if (ok && p.y > bestY) { bestY = p.y; tgt = { p, px }; }
  }
  if (!tgt) {
    for (let i = 0; i < ch.length; i++) { const p = ch[i]; if (!p.gone && p.y > S.lastLand + 1) { const t = Math.max(0.05, fallTime(S.y, S.vy, K.GRAV, p.y)); tgt = { p, px: K.platX(p, S.t + t) }; break; } }
  }
  if (!tgt) return 0;
  const t = fallTime(S.y, S.vy, K.GRAV, tgt.p.y);
  const px = t > 0 ? K.platX(tgt.p, S.t + t) : tgt.px;
  const d = K.wrapD(S.x, px);
  // only start the final approach early enough; stay centred over the platform
  return Math.max(-1, Math.min(1, d / 18 - S.vx / K.VX * 0.25));
}

function run(lv, mode, useBot, maxT, seed) {
  const api = makeApi(lv, mode, seed);
  const inst = def.create(api);
  const ctx = anyObj();
  let f = 0;
  const Wc = inst._k.W;
  if (useBot) inst.down(Wc / 2, 400);
  for (; f < 60 * maxT && api.result === null; f++) {
    if (useBot) { const d = bot(inst); inst.move(Wc / 2 + d * Wc * 0.16, 400); }
    inst.update(1 / 60);
    if (f % 45 === 0) inst.draw(ctx);
  }
  return { result: api.result || 'timeout', text: api.text, t: f / 60, h: Math.floor(inst._s.maxY / 10), goal: inst._k.GOAL / 10, sc: api.sc };
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
    if (z.result !== 'lose' && mode === 2) { nothingWins++; mn++; }
    if (VERBOSE || b.result !== 'win' || (z.result !== 'lose' && mode === 2)) {
      console.log(names[mode] + ' L' + lv + ' bot=' + b.result + ' (' + b.text + ') t=' + b.t.toFixed(1) + 's h=' + b.h + '/' + b.goal +
        ' | nothing=' + z.result + ' h=' + z.h + ' t=' + z.t.toFixed(1));
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
    ' height=' + b.h + ' | nothing ends at ' + z.t.toFixed(1) + 's (' + z.result + ')');
}
if (fails || nothingWins || endFail) { console.log('FAIL'); process.exit(1); }
console.log('OK');
