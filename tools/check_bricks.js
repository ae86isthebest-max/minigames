// Winnability check for 彈珠打磚: node tools/check_bricks.js [from=1] [to=60] [-v]
// Loads core.js + games/bricks.js like smoke.js and plays every level with fixed dt 1/60.
//  (a) bot: each turn it traces 60 candidate angles with a single ghost ball through the real
//      collision code (bricks it would break become passable), scores damage weighted toward
//      low rows + "+1" pickups, then plays the full turn for the 6 best candidates from a
//      snapshot (same simulation) and fires the angle that leaves the safest board.
//  (b) lazy baseline: always fires (almost) straight up. Bricks is turn-based, so literally
//      doing nothing never ends the level; the lazy shooter must lose instead.
// Modes 簡單/普通/困難 (levels 1-40, 簡單 up to [to]); 無盡 with 2 fixed seeds, where a player who never
// touches the screen is auto-fired every 12 s and must lose, and the bot must survive 3x as many turns.
// Pass = bot wins every level of every difficulty and the lazy shooter loses every 困難 level.
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
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'bricks.js'), 'utf8'), sandbox, { filename: 'bricks.js' });
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'bricks');

function makeApi(lv, mode, seed) {
  mode = mode || 0;
  const api = {
    W, H, level: mode === 3 ? 1 : lv, diff: mode === 3 ? 2 : mode, endless: mode === 3, best: 0, scoreV: 0,
    rng: MG.mulberry32(seed !== undefined ? seed : lv * 7919 + 'bricks'.length * 104729 + 'bricks'.charCodeAt(0) + mode * 15485863),
    score(n) { if (!api.sim) api.scoreV = n; },
    util: MG.util, sfx() {}, info() {}, result: null, sim: false, simResult: null,
    get ended() { return api.sim ? api.simResult !== null : api.result !== null; },
    win() { if (api.sim) { api.simResult = 'win'; return; } if (api.result === null) api.result = 'win'; },
    lose() { if (api.sim) { api.simResult = 'lose'; return; } if (api.result === null) api.result = 'lose'; },
  };
  return api;
}

function shoot(inst, a) {
  const sx = W / 2, sy = 300;
  inst.down(sx, sy);
  inst.move(sx - Math.cos(a) * 60, sy + Math.sin(a) * 60);
  inst.up(sx - Math.cos(a) * 100, sy + Math.sin(a) * 100);
}

// full-turn look-ahead on the best ghost candidates (same simulation, restored from a snapshot)
function lookahead(inst, api, cands) {
  const s = inst._s, snap = inst._save();
  let best = cands[0], bv = -Infinity;
  api.sim = true;
  for (const a of cands) {
    inst._load(snap); api.simResult = null;
    shoot(inst, a);
    for (let f = 0; f < 60 * 120 && s.phase !== 'aim' && api.simResult === null; f++) inst.update(1 / 60);
    let v;
    if (api.simResult === 'win') v = 1e12;
    else if (api.simResult === 'lose') v = -1e12;
    else {
      v = s.n * 20;
      let low = 0;
      for (const b of s.bricks) if (!b.dead) { v -= b.hp * Math.pow(1.6, b.r); low = Math.max(low, b.r); }
      v -= Math.pow(4, Math.max(0, low - 5)) * 50;
    }
    if (v > bv) { bv = v; best = a; }
  }
  inst._load(snap); api.sim = false; api.simResult = null;
  return best;
}

function score(inst, ang) {
  const s = inst._s, k = inst._k;
  const cs = k.cs, rb = cs * 0.12, floorY = k.floorY;
  const o = { x: s.lx, y: floorY - rb - 0.5, vx: Math.cos(ang), vy: -Math.sin(ang) };
  const vhp = new Map();
  const killed = [];
  const picked = new Set();
  let sc = 0, travel = 0;
  const maxLen = (floorY - k.y0) * 9, step = rb * 0.5;
  while (travel < maxLen) {
    o.x += o.vx * step; o.y += o.vy * step; travel += step;
    k.walls(o);
    const b = k.collideGhost(o, false);
    if (b) {
      const hp = vhp.has(b) ? vhp.get(b) : b.hp;
      const w = Math.pow(1.4, b.r);
      const d = Math.max(1, Math.ceil(s.n * 0.5));
      sc += Math.min(d, hp) * w;
      if (hp - d <= 0) { sc += 4 * w; b.dead = true; killed.push(b); } else vhp.set(b, hp - d);
    }
    const col = Math.floor((o.x - k.x0) / cs), row = Math.floor((o.y - k.y0) / cs);
    if (row >= 0 && row < k.pgrid.length && col >= 0 && col < k.C) {
      const p = k.pgrid[row][col];
      if (p && !p.taken && !picked.has(p)) { picked.add(p); sc += 3 * Math.max(2, s.n * 0.3); }
    }
    if (o.y >= floorY - rb && o.vy > 0) break;
  }
  for (const b of killed) b.dead = false;
  return sc;
}

function bestAngle(inst, api) {
  const list = [];
  for (let i = 0; i < 60; i++) {
    const a = 0.15 + (Math.PI - 0.3) * (i + 0.5) / 60;
    list.push([score(inst, a), a]);
  }
  list.sort((p, q) => q[0] - p[0]);
  const cands = [];
  for (const [, a] of list) { if (cands.every((c) => Math.abs(c - a) > 0.08)) cands.push(a); if (cands.length >= 6) break; }
  return lookahead(inst, api, cands);
}

function run(lv, mode, diff, seed) {
  const api = makeApi(lv, diff, seed);
  const inst = def.create(api);
  const ctx = anyObj();
  const s = inst._s;
  let f = 0;
  const maxF = diff === 3 ? 60 * 4000 : 60 * 1500;
  for (; f < maxF && api.result === null; f++) {
    if (s.phase === 'aim' && mode !== 'none') {
      const a = mode === 'bot' ? bestAngle(inst, api) : 1.45;
      shoot(inst, a);
      if (s.phase !== 'fly') throw new Error('shot did not fire on level ' + lv);
    }
    inst.update(1 / 60);
    if (f % 60 === 0) inst.draw(ctx);
  }
  return { result: api.result || 'timeout', turns: s.turns, balls: s.n, rows: inst._k.lv.R, score: api.scoreV, t: f / 60 };
}

const NAMES = ['簡單', '普通', '困難'];
let bad = 0;
for (let diff = 0; diff < 3; diff++) {
  let fails = 0, lazyLoses = 0;
  const to = diff === 0 ? Math.max(TO, 40) : 40;
  for (let lv = FROM; lv <= to; lv++) {
    const b = run(lv, 'bot', diff);
    const z = run(lv, 'lazy', diff);
    if (b.result !== 'win') fails++;
    if (z.result === 'lose') lazyLoses++;
    if (VERBOSE || b.result !== 'win' || (diff === 2 && z.result !== 'lose')) {
      console.log(NAMES[diff] + ' L' + lv + ' bot=' + b.result + ' turns=' + b.turns + ' rows=' + b.rows + ' balls=' + b.balls + ' | lazy=' + z.result + ' turns=' + z.turns);
    }
  }
  const N = to - FROM + 1;
  console.log('bricks ' + NAMES[diff] + ' levels ' + FROM + '-' + to + ': bot wins ' + (N - fails) + '/' + N + ', straight-up lazy shooter loses ' + lazyLoses + '/' + N);
  bad += fails + (diff === 2 ? N - lazyLoses : 0);
}
for (let k = 0; k < 2; k++) {
  const seed = 1000 + k * 777;
  const b = run(1, 'bot', 3, seed), z = run(1, 'none', 3, seed);
  console.log('bricks 無盡 seed ' + seed + ': bot ' + b.result + ' score(turns survived)=' + b.score + ' | no-input (auto-fire after 12 s) ' + z.result + ' after ' + z.t.toFixed(0) + 's score=' + z.score);
  if (z.result !== 'lose' || b.result !== 'lose' || b.score < z.score * 3) bad++;
}
if (bad) { console.log('FAIL'); process.exit(1); }
console.log('OK');
