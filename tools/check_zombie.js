// Winnability check for 喪屍射門: node tools/check_zombie.js [from=1] [to=60]
// Loads core.js + games/zombie.js like smoke.js, then for every level runs
//  (a) a simple bot that steers the squad (threat-first, then upgrade gates), fixed dt 1/60
//  (b) a "do nothing" run (no input at all)
// Modes 簡單/普通/困難 (levels 1-40, 簡單 up to [to]) and 無盡 (3 clock-like seeds).
// Pass = bot wins every level of every difficulty, doing nothing loses every 困難 level,
// and in 無盡 both runs end, with the bot lasting at least 4x longer than no input.
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

function makeApi(lv, mode, seed) {
  mode = mode || 0;
  const api = {
    W, H, level: mode === 3 ? 1 : lv, diff: mode === 3 ? 2 : mode, endless: mode === 3, best: 0, scoreV: 0,
    rng: MG.mulberry32(seed !== undefined ? seed : lv * 7919 + 'zombie'.length * 104729 + 'zombie'.charCodeAt(0) + mode * 15485863),
    util: MG.util, sfx() {}, info() {}, result: null, score(n) { api.scoreV = n; },
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
      if (s.gates.some((o) => !o.dead && !o.good && o.u * gt.u > 0 && o.z > gt.z && o.z < gt.z + 30 && wp.pel > 1)) continue;
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
  // keep the squad's bullet spread off red gates that are nearer than the target
  const fan = (wp.pel > 1 ? (wp.pel - 1) / 2 * wp.spr * 1.2 : wp.spr) * k.FAN;
  const bads = s.gates.filter((gt) => !gt.dead && !gt.good && gt.z >= 1 && gt.z <= k.ZF && gt.z <= tz + 1);
  if (bads.length) {
    const cost = (u) => {
      let c = 0;
      for (const gt of bads) { const ov = Math.min(u + hw + fan, gt.u + k.GW + 0.04) - Math.max(u - hw - fan, gt.u - k.GW - 0.04); if (ov > 0) c += ov; }
      return c;
    };
    let bu = tu, bc = cost(tu) * 100;
    for (let u = -0.8; u <= 0.8; u += 0.02) { const c = cost(u) * 100 + Math.abs(u - tu); if (c < bc) { bc = c; bu = u; } }
    tu = bu;
  }
  return tu;
}

function run(lv, useBot, mode, seed) {
  const api = makeApi(lv, mode, seed);
  const inst = def.create(api);
  const ctx = anyObj();
  const rw = inst._k.rw;
  const x0 = W / 2;
  if (useBot) inst.down(x0, H * 0.7);
  const dt = 1 / 60;
  let f = 0;
  const maxF = mode === 3 ? 60 * 3600 : 60 * 300;
  for (; f < maxF && api.result === null; f++) {
    if (useBot) inst.move(x0 + botStep(inst) * rw / 1.2, H * 0.7);
    inst.update(dt);
    if (f % 30 === 0) inst.draw(ctx);
  }
  const s = inst._s;
  return { result: api.result || 'timeout', t: f / 60, men: s.men.length, w: s.w, kills: s.kills, wave: s.wave + 1, waves: inst._k.plan.waves, score: api.scoreV };
}

const NAMES = ['簡單', '普通', '困難'];
let bad = 0;
for (let mode = 0; mode < 3; mode++) {
  let fails = 0, nothingWins = 0;
  const times = [];
  const to = mode === 0 ? Math.max(TO, 40) : 40;
  for (let lv = FROM; lv <= to; lv++) {
    const b = run(lv, true, mode);
    const z = run(lv, false, mode);
    times.push(b.t);
    if (b.result !== 'win') fails++;
    if (z.result !== 'lose') nothingWins++;
    if (VERBOSE || b.result !== 'win' || (mode === 2 && z.result !== 'lose')) {
      console.log(NAMES[mode] + ' L' + lv + ' bot=' + b.result + ' t=' + b.t.toFixed(1) + 's men=' + b.men + ' wpn=' + b.w + ' kills=' + b.kills + ' waves=' + b.waves +
        ' | nothing=' + z.result + ' at ' + z.t.toFixed(1) + 's');
    }
  }
  const n = to - FROM + 1;
  console.log('zombie ' + NAMES[mode] + ' levels ' + FROM + '-' + to + ': bot wins ' + (n - fails) + '/' + n +
    ', do-nothing loses ' + (n - nothingWins) + '/' + n + ', level time ' + Math.min(...times).toFixed(0) + '-' + Math.max(...times).toFixed(0) + 's');
  bad += fails + (mode === 2 ? nothingWins : 0);
}
for (let k = 0; k < 3; k++) {
  const seed = 1000 + k * 777;
  const b = run(1, true, 3, seed), z = run(1, false, 3, seed);
  console.log('zombie 無盡 seed ' + seed + ': bot ' + b.result + ' after ' + b.t.toFixed(0) + 's wave ' + b.wave + ' score(kills)=' + b.score +
    ' | no-input ' + z.result + ' after ' + z.t.toFixed(0) + 's score=' + z.score);
  if (z.result !== 'lose' || b.result !== 'lose' || b.t < z.t * 4) bad++;
}
if (bad) { console.log('FAIL'); process.exit(1); }
console.log('OK');
