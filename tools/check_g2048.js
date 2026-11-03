// Winnability check for 2048: node tools/check_g2048.js [levels=40] [diff 0|1|2, or 3 = 無盡 only]
// Loads core.js + games/2048 in the smoke.js sandbox and plays every level with an expectimax bot (2 plies
// of player moves with the random spawn averaged in between) through the real game (_move = the swipe handler;
// some moves are sent as real down/up swipes). 簡單/普通/困難 levels 1..N must be WON (the move limit is
// enforced by the game). A random-swipe player must lose on 困難 (limit / stones). 無盡 is turn-based (no
// timer), so it is checked to end when the board locks up under random play, and the bot's score is reported.
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
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'g2048.js'), 'utf8'), sandbox, { filename: 'g2048.js' });
const MG = sandbox.MG;
const ID = 'g2048';
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
const ONLY = process.argv[3] !== undefined ? parseInt(process.argv[3], 10) : -1;
const DN = ['簡單', '普通', '困難'];
const LG = def._logic;

// ---------- expectimax bot (three 'personalities'; a level counts as winnable if one of them wins it) ----------
const PERSONAS = [{ w: [2.7, 1.0, 0.1, 0.6], deep: 4 }, { w: [2.7, 1.0, 0.1, 0.6], deep: 7 }, { w: [3.6, 1.6, 0.05, 1.2], deep: 6 }];
let BW = PERSONAS[0].w, DEEP = 4;
const LOG = {};
function lg(v) { return LOG[v] || (LOG[v] = Math.log2(v)); }
function heur(g, N) {
  let empty = 0, mono = 0, smooth = 0, maxv = 0, corner = 0;
  for (let i = 0; i < g.length; i++) { if (g[i] === 0) empty++; if (g[i] > maxv) maxv = g[i]; }
  for (let pass = 0; pass < 2; pass++) {
    for (let a = 0; a < N; a++) {
      let inc = 0, dec = 0, prev = -1;
      for (let b = 0; b < N; b++) {
        const i = pass ? b * N + a : a * N + b;
        const v = g[i];
        if (v <= 0) { if (v < 0) prev = -1; continue; }
        const l = lg(v);
        if (prev >= 0) {
          const pl = lg(prev);
          if (l > pl) inc += l - pl; else dec += pl - l;
          smooth -= Math.abs(l - pl);
        }
        prev = v;
      }
      mono -= Math.min(inc, dec);
    }
  }
  const cs = [0, N - 1, N * (N - 1), N * N - 1];
  for (const c of cs) if (g[c] === maxv) corner = 1;
  return empty * BW[0] + mono * BW[1] + smooth * BW[2] + corner * lg(maxv) * BW[3] + lg(maxv) * 0.5;
}
function chance(g, N, depth) {
  const empties = [];
  for (let i = 0; i < g.length; i++) if (g[i] === 0) empties.push(i);
  if (!empties.length) return heur(g, N) - 50;
  const step = Math.max(1, Math.floor(empties.length / 6));
  let sum = 0, cnt = 0;
  for (let k = 0; k < empties.length; k += step) {
    const i = empties[k];
    for (const [v, p] of [[2, 0.9], [4, 0.1]]) {
      g[i] = v;
      sum += p * maxNode(g, N, depth - 1);
      g[i] = 0;
    }
    cnt++;
  }
  return sum / cnt;
}
function maxNode(g, N, depth) {
  if (depth <= 0) return heur(g, N);
  let best = -1e9;
  for (let d = 0; d < 4; d++) {
    const r = LG.slide(g, N, d);
    if (!r.moved) continue;
    const v = chance(r.grid, N, depth) + Math.log2(1 + r.gain) * 0.2;
    if (v > best) best = v;
  }
  return best === -1e9 ? heur(g, N) - 200 : best;
}
function pick(g, N, depth) {
  let bd = -1, bv = -1e9;
  for (let d = 0; d < 4; d++) {
    const r = LG.slide(g, N, d);
    if (!r.moved) continue;
    const v = chance(r.grid, N, depth) + Math.log2(1 + r.gain) * 0.2;
    if (v > bv) { bv = v; bd = d; }
  }
  return bd;
}

function play(lv, diff, mode, endless, seed, maxMoves) {
  const { api, st } = mkApi(lv, diff, endless, seed);
  const inst = def.create(api);
  const P = inst._P;
  const rr = MG.mulberry32(lv * 31 + diff);
  let n = 0;
  while (st.ended === null && n < (maxMoves || 20000)) {
    let d;
    if (mode === 'bot') {
      const g = inst._grid();
      let empties = 0; for (let i = 0; i < g.length; i++) if (!g[i]) empties++;
      d = pick(Int32Array.from(g), P.N, empties <= DEEP ? 3 : 2);
      if (d < 0) d = 0;
    } else d = Math.floor(rr() * 4);
    if (n % 7 === 3) {
      // send through the real swipe handlers
      const cx = 195, cy = 400, D = [[0, -60], [60, 0], [0, 60], [-60, 0]][d];
      inst.down(cx, cy); inst.move(cx + D[0] * 0.3, cy + D[1] * 0.3); inst.up(cx + D[0], cy + D[1]);
    } else inst._move(d);
    for (let f = 0; f < 3; f++) inst.update(1 / 60);
    n++;
  }
  for (let f = 0; f < 60 && st.ended === null; f++) inst.update(1 / 60);
  return { st, moves: inst._moves(), max: LG.maxTile(inst._grid()), P, score: inst._score() };
}

let fails = 0;
const t0 = Date.now();
const summary = {};
for (const diff of (ONLY >= 3 ? [] : ONLY >= 0 ? [ONLY] : [0, 1, 2])) {
  let wins = 0, randLose = 0, worstSlack = 1e9;
  for (let lv = 1; lv <= LEVELS; lv++) {
    let b = null, persona = 0;
    for (; persona < PERSONAS.length; persona++) {
      BW = PERSONAS[persona].w; DEEP = PERSONAS[persona].deep;
      b = play(lv, diff, 'bot', false);
      if (b.st.ended === 'win') break;
    }
    BW = PERSONAS[0].w; DEEP = 4;
    const r = play(lv, diff, 'random', false);
    const ok = b.st.ended === 'win';
    if (ok) wins++; else fails++;
    if (r.st.ended === 'lose') randLose++;
    if (b.P.limit && ok) worstSlack = Math.min(worstSlack, b.P.limit - b.moves);
    if (!ok || lv <= 2 || lv % 5 === 0) console.log((ok ? 'ok  ' : 'FAIL ') + DN[diff] + ' L' + lv + ' ' + b.P.N + 'x' + b.P.N + ' stones ' + b.P.stones + ' target ' + b.P.target + (b.P.limit ? ' limit ' + b.P.limit : '') + ' -> bot ' + b.st.ended + ' in ' + b.moves + ' moves (max ' + b.max + (persona ? ', bot #' + (persona + 1) : '') + ') | random ' + r.st.ended + ' (max ' + r.max + ')');
  }
  summary[DN[diff]] = { botWins: wins + '/' + LEVELS, randomLoses: randLose + '/' + LEVELS, tightestMoveSlack: worstSlack === 1e9 ? '-' : worstSlack };
  if (diff === 2 && randLose < LEVELS) { console.log('FAIL: random swiping should lose every 困難 level'); fails++; }
}
if (ONLY < 0 || ONLY === 3) {
  for (let r = 0; r < 2; r++) {
    const rnd = play(1, 2, 'random', true, 4242 + r);
    const ok = rnd.st.ended === 'lose';
    if (!ok) fails++;
    console.log((ok ? 'ok  ' : 'FAIL ') + '無盡 random player ends after ' + rnd.moves + ' moves, score ' + rnd.score + ' (' + rnd.st.ended + ')');
  }
  const b = play(1, 2, 'bot', true, 777, 900);
  console.log('無盡 bot: ' + b.moves + ' moves, score ' + b.score + ', max tile ' + b.max + ' (' + (b.st.ended || 'still going') + ')');
}
console.log(JSON.stringify(summary));
console.log((fails ? 'FAILED ' + fails : 'ALL OK') + ' in ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
process.exit(fails ? 1 : 0);
