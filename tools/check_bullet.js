// Winnability check for 子彈反彈: node tools/check_bullet.js [from=1] [to=40] [-v]
// Loads core.js + games/bullet.js like smoke.js. For every level of 簡單/普通/困難 it searches aim angles
// itself (full circle in 0.002 rad steps, through the game's own ricochet/explosion/rope physics, depth-first
// over distinct outcomes for multi-bullet levels) until it finds a shot sequence that kills every enemy
// within the level's bullet count, then FIRES those shots through the real input (drag + release) and the
// real update loop and requires the 過關 result. Also reports how wide the winning aim window is and how
// often a naive player (aiming straight at each enemy) wins, as a difficulty indicator.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FROM = parseInt(process.argv[2] || '1', 10);
const TO = parseInt(process.argv[3] || '40', 10);
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
  console, Math, JSON, Date, Array, Object, Map, Set, Number, String, Proxy, Uint8ClampedArray, Uint8Array, Float32Array, Int32Array,
  setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0, cancelAnimationFrame() {},
  performance: { now: () => Date.now() }, localStorage: { getItem: () => null, setItem() {} },
  location: { search: '?mute', protocol: 'file:' }, URLSearchParams, navigator: {}, devicePixelRatio: 2,
  document: { getElementById: el, createElement: el, addEventListener() {} }, addEventListener() {},
};
sandbox.window = sandbox;
vm.createContext(sandbox);
const root = path.join(__dirname, '..');
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), sandbox, { filename: 'core.js' });
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'bullet.js'), 'utf8'), sandbox, { filename: 'bullet.js' });
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'bullet');

function makeApi(lv, mode) {
  const api = {
    W, H, level: lv, diff: mode, endless: false, best: 0, scoreV: 0,
    rng: MG.mulberry32(lv * 7919 + 'bullet'.length * 104729 + 'bullet'.charCodeAt(0) + mode * 15485863),
    util: MG.util, sfx() {}, info() {}, result: null, score(n) { api.scoreV = n; },
    get ended() { return api.result !== null; },
    win() { if (api.result === null) api.result = 'win'; }, lose() { if (api.result === null) api.result = 'lose'; },
  };
  return api;
}

const STEP = 0.002;
// own search: depth-first over distinct outcomes; returns [angles] or null
function search(K, room, st, n, maxB, out) {
  const wins = K.sweep(room, st, maxB, STEP);
  let best = null;
  for (const w of wins) if (!w.self && w.r.allDead && (!best || w.width > best.width)) best = w;
  if (best) { if (out && out.win === undefined) out.win = best.width; return [best.mid]; }
  if (n <= 1) return null;
  const seen = {};
  const cands = wins.filter((w) => !w.self && !w.r.noop && w.r.kills + (w.r.st ? 1 : 0) > 0 && !seen[w.key] && (seen[w.key] = true));
  cands.sort((a, b) => b.r.kills - a.r.kills || b.width - a.width);
  for (const c of cands.slice(0, 8)) {
    const rest = search(K, room, c.r.st, n - 1, maxB, null);
    if (rest) { if (out && out.win === undefined) out.win = c.width; return [c.mid].concat(rest); }
  }
  return null;
}

function fireAt(inst, a) {
  const S = inst._s, AR = inst._k.AR;
  const fx = W / 2, fy = H / 2, a0 = S.ang;
  inst.down(fx, fy);
  inst.move(fx + 60, fy + 60);
  const dx = (Math.cos(a) - Math.cos(a0)) * AR / 0.6, dy = (Math.sin(a) - Math.sin(a0)) * AR / 0.6;
  inst.move(fx + dx, fy + dy);
  inst.up(fx + dx, fy + dy);
}
function settle(inst, api) {
  const ctx = anyObj();
  for (let f = 0; f < 60 * 30 && api.result === null && inst._s.phase !== 'aim'; f++) { inst.update(1 / 60); if (f % 20 === 0) inst.draw(ctx); }
  for (let f = 0; f < 90 && api.result === null; f++) inst.update(1 / 60);
}

function play(lv, mode) {
  const api = makeApi(lv, mode);
  const inst = def.create(api);
  const K = inst._k, lvl = inst._lvl, room = inst._room;
  const info = {};
  let shots = 0;
  while (api.result === null && inst._s.bullets > 0) {
    const plan = search(K, room, inst._st, inst._s.bullets, lvl.maxB, shots === 0 ? info : null);
    if (!plan) break;
    fireAt(inst, plan[0]); shots++;
    if (inst._s.phase !== 'fly') throw new Error('shot did not fire');
    settle(inst, api);
  }
  return { result: api.result || 'stuck', shots, bullets: lvl.bullets, maxB: lvl.maxB, en: room.en.length, name: room.name, tpl: lvl.tpl, win: info.win || 0, fallback: !!lvl.fallback };
}
// naive player: aims straight at the chest of each living enemy in turn
function naive(lv, mode) {
  const api = makeApi(lv, mode);
  const inst = def.create(api);
  const room = inst._room;
  while (api.result === null && inst._s.bullets > 0) {
    const i = room.en.findIndex((e, j) => !inst._st.dead[j]);
    if (i < 0) break;
    const e = room.en[i];
    fireAt(inst, Math.atan2(e.y - 0.8 - (room.ag.y - 1.1), e.x - room.ag.x));
    settle(inst, api);
  }
  return api.result === 'win';
}

const NAMES = ['簡單', '普通', '困難'];
let bad = 0;
for (let mode = 0; mode < 3; mode++) {
  let fails = 0, naiveWins = 0, one = 0;
  const wins = [], names = new Set();
  for (let lv = FROM; lv <= TO; lv++) {
    const r = play(lv, mode);
    const nv = naive(lv, mode);
    if (nv) naiveWins++;
    if (r.result !== 'win' || r.fallback) fails++;
    if (r.bullets === 1) one++;
    wins.push(r.win); names.add(r.tpl);
    if (VERBOSE || r.result !== 'win' || r.fallback) {
      console.log(NAMES[mode] + ' L' + lv + ' [' + r.name + '] ' + r.result + ' in ' + r.shots + '/' + r.bullets + ' bullets, enemies=' + r.en +
        ', bounces<=' + r.maxB + ', first-shot window ' + (r.win * 180 / Math.PI).toFixed(2) + '°' + (nv ? ' (naive wins)' : '') + (r.fallback ? ' FALLBACK' : ''));
    }
  }
  const n = TO - FROM + 1;
  wins.sort((a, b) => a - b);
  console.log('bullet ' + NAMES[mode] + ' levels ' + FROM + '-' + TO + ': winning shots found + played ' + (n - fails) + '/' + n +
    ', designs used ' + names.size + (mode === 2 ? ', one-bullet levels ' + one + '/' + n : '') +
    ', median first-shot window ' + (wins[Math.floor(n / 2)] * 180 / Math.PI).toFixed(2) + '°, naive aim wins ' + naiveWins + '/' + n);
  bad += fails;
}
if (bad) { console.log('FAIL'); process.exit(1); }
console.log('OK');
