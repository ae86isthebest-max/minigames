// Winnability check for 喪屍射門: node tools/check_zombie.js [from=1] [to=60]
// Loads core.js + games/zombie.js like smoke.js, then for every level runs
//  (a) a simple bot that steers the squad (threat-first, then upgrade gates), fixed dt 1/60
//  (b) a "do nothing" run (no input at all)
// Pass = bot wins every level, and doing nothing loses every level.
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
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'zombie.js'), 'utf8'), sandbox, { filename: 'zombie.js' });
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'zombie');

function makeApi(lv) {
  const api = {
    W, H, level: lv, rng: MG.mulberry32(lv * 7919 + 'zombie'.length * 104729 + 'zombie'.charCodeAt(0)),
    util: MG.util, sfx() {}, info() {}, result: null,
    get ended() { return api.result !== null; },
    win() { if (api.result === null) api.result = 'win'; }, lose() { if (api.result === null) api.result = 'lose'; },
  };
  return api;
}

const COLS = [0, -1, 1, -2, 2];
function botStep(inst) {
  const s = inst._s, k = inst._k;
  const n = s.men.length, wp = k.WPN[s.w];
  const per = k.dmg() * k.rate() * (wp.pel > 1 ? wp.pel * 0.45 : 1);
  const hw = k.halfWidth();
  const alignedFor = (r) => {
    let c = 0;
    for (let i = 0; i < n; i++) if (Math.abs(COLS[i % 5] * k.SP) < r + 0.02) c++;
    return Math.max(1, c);
  };
  let urgent = null, minSlack = 1e9, work = 0;
  for (const z of s.zs) {
    if (z.dead) continue;
    const dps = per * alignedFor(z.r) * (z.pierceBonus || 1);
    const need = z.hp / dps + Math.abs(z.u - s.u) / 2.6 + z.z / k.BV + 0.15;
    const arrive = z.z / Math.max(0.5, z.spd);
    work += z.hp / dps;
    const slack = arrive - need - work * 0.35;
    if (slack < minSlack) { minSlack = slack; urgent = z; }
  }
  let tu = null, tz = 1e9;
  if (urgent && minSlack < 2.2) { tu = urgent.u; tz = urgent.z; }
  if (tu === null) {
    let best = null, bestZ = 1e9;
    for (const gt of s.gates) {
      if (gt.dead || !gt.good || gt.z < 6) continue;
      const tNeed = gt.hp / (per * n) + Math.abs(gt.u - s.u) / 2.6 + 0.3;
      const tHave = (gt.z - 3) / k.GV;
      if (tNeed > tHave) continue;
      if (urgent && minSlack < tNeed + 1.5) continue;
      const val = gt.z - (gt.kind === 'wpn' ? 30 : gt.kind === 'men' ? 12 : 0);
      if (val < bestZ) { bestZ = val; best = gt; }
    }
    if (inst._commit && !inst._commit.dead && inst._commit.z > 2 && !(urgent && minSlack < 0.8)) best = inst._commit;
    inst._commit = best;
    if (best) {
      const m = Math.max(0, k.GW - hw - 0.03);
      tu = best.u > 0 ? best.u - m : best.u + m; tz = best.z;
    }
  }
  if (tu === null) {
    let near = null;
    for (const z of s.zs) if (!z.dead && (!near || z.z < near.z)) near = z;
    tu = near ? near.u : 0; tz = near ? near.z : 1e9;
  }
  for (const gt of s.gates) {
    if (urgent && minSlack < 0.6) break;
    if (gt.dead || gt.good || gt.z < 1 || gt.z > k.ZF || gt.z > tz + 1) continue;
    const fan = (wp.pel > 1 ? (wp.pel - 1) / 2 * wp.spr * 1.2 : wp.spr) * k.FAN;
    const edge = Math.abs(gt.u) - k.GW - hw - 0.04 - fan;
    if (gt.u > 0 && tu > edge) tu = edge;
    if (gt.u < 0 && tu < -edge) tu = -edge;
  }
  return tu;
}

function run(lv, useBot) {
  const api = makeApi(lv);
  const inst = def.create(api);
  const ctx = anyObj();
  const rw = inst._k.rw;
  let x0 = W / 2;
  if (useBot) inst.down(x0, H * 0.7);
  const dt = 1 / 60;
  let f = 0;
  for (; f < 60 * 300 && api.result === null; f++) {
    if (useBot) {
      const tu = botStep(inst);
      inst.move(x0 + (tu - 0) * rw / 1.2, H * 0.7);
    }
    inst.update(dt);
    if (f % 30 === 0) inst.draw(ctx);
  }
  const s = inst._s;
  return { result: api.result || 'timeout', t: f / 60, men: s.men.length, w: s.w, kills: s.kills, waves: inst._k.plan.waves };
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
    console.log('L' + lv + ' bot=' + b.result + ' t=' + b.t.toFixed(1) + 's men=' + b.men + ' wpn=' + b.w + ' kills=' + b.kills + ' waves=' + b.waves +
      ' | nothing=' + z.result + ' at ' + z.t.toFixed(1) + 's');
  }
}
console.log('zombie levels ' + FROM + '-' + TO + ': bot wins ' + (TO - FROM + 1 - fails) + '/' + (TO - FROM + 1) +
  ', do-nothing loses ' + (TO - FROM + 1 - nothingWins) + '/' + (TO - FROM + 1) +
  ', level time ' + Math.min(...times).toFixed(0) + '-' + Math.max(...times).toFixed(0) + 's');
if (fails || nothingWins) { console.log('FAIL'); process.exit(1); }
console.log('OK');
