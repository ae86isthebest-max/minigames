// Winnability check for 割草倖存者: node tools/check_survivor.js [from=1] [to=60] [-v]
// Loads core.js + games/survivor.js like smoke.js and plays every level with fixed dt 1/30 through the real
// input (joystick drag + tapping level-up cards):
//  (a) a kiting bot: each frame scores 16 directions by enemy pressure around the point it would move to,
//      leans toward gems/chests/food when it is safe, and picks upgrades by a fixed priority list;
//  (b) "do nothing" (never touches the screen; level-up cards auto-pick after 8 s).
// Pass = bot survives 簡單 1-[to] and 普通/困難 1-40, standing still dies on every 困難 level,
// and in 無盡 both runs end with the bot surviving far longer.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ID = 'survivor';
const FROM = parseInt(process.argv[2] || '1', 10);
const TO = parseInt(process.argv[3] || '60', 10);
const VERBOSE = process.argv.includes('-v');
let TRACE = false;

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
  console, Math, JSON, Date, Array, Object, Map, Set, Number, String, Proxy, Uint8ClampedArray, Float32Array, Int32Array, Int8Array, Int16Array, Uint8Array, Uint16Array,
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
    W, H, level: mode === 3 ? 1 : lv, diff: mode === 3 ? 2 : mode, endless: mode === 3, best: 0, scoreV: 0,
    rng: MG.mulberry32(seed !== undefined ? seed : lv * 7919 + ID.length * 104729 + ID.charCodeAt(0) + mode * 15485863),
    util: MG.util, sfx() {}, info() {}, result: null, score(n) { api.scoreV = n; },
    get ended() { return api.result !== null; },
    win() { if (api.result === null) api.result = 'win'; }, lose() { if (api.result === null) api.result = 'lose'; },
  };
  return api;
}


const NX = new Float64Array(800), NY = new Float64Array(800), NR = new Float64Array(800), NW = new Float64Array(800);
const PRIO = ['garlic', 'orbit', 'bolt', 'lightning', 'fire', 'boomer', 'maxhp', 'speed', 'regen', 'might', 'magnet', 'haste', 'heal'];
function run(lv, useBot, mode, seed) {
  const api = makeApi(lv, mode, seed);
  const inst = def.create(api);
  const ctx = anyObj();
  const dt = 1 / 30;
  const s = inst._s, k = inst._k;
  let f = 0, joy = false, pdx = 0, pdy = 0;
  const maxF = mode === 3 ? 30 * 2400 : 30 * 1500;
  const DX = [], DY = [];
  for (let a = 0; a < 16; a++) { DX.push(Math.cos(a * Math.PI / 8)); DY.push(Math.sin(a * Math.PI / 8)); }
  const cx = W / 2, cy = H * 0.6;
  for (; f < maxF && api.result === null; f++) {
    if (useBot) {
      if (s.choosing) {
        if (joy) { inst.up(cx, cy); joy = false; }
        if (s.chooseT > 0.4) {
          let best = 0, bp = 1e9;
          s.choosing.forEach((key, i) => { const p = PRIO.indexOf(key); if (p >= 0 && p < bp) { bp = p; best = i; } });
          const r = k.cardRects()[best];
          inst.down(r.x + r.w / 2, r.y + r.h / 2); inst.up(r.x + r.w / 2, r.y + r.h / 2);
        }
      } else {
        // score 16 directions
        let bd = -1, bs = 1e18;
        const hx = s.hx, hy = s.hy;
        let tx = 0, ty = 0, tw = 0;
        for (const c of s.chests) { const d = Math.hypot(c.x - hx, c.y - hy); if (d < 400) { tx += (c.x - hx) / d * 3; ty += (c.y - hy) / d * 3; tw += 3; } }
        for (const c of s.heals) { const d = Math.hypot(c.x - hx, c.y - hy); if (d < 350 && s.hp < s.maxhp * 0.8) { tx += (c.x - hx) / d * 3; ty += (c.y - hy) / d * 3; tw += 3; } }
        let gn = 0;
        for (let i = 0; i < k.MAXG && gn < 40; i++) { if (!k.gon[i]) continue; const d = Math.hypot(k.gx[i] - hx, k.gy[i] - hy); if (d < 260) { tx += (k.gx[i] - hx) / (d + 20); ty += (k.gy[i] - hy) / (d + 20); tw += 0.4; gn++; } }
        const tl = Math.hypot(tx, ty) || 1;
        let m = 0, here = 0;
        for (let i = 0; i < k.MAXE; i++) {
          if (!k.eon[i]) continue;
          const ex = k.ex[i], ey = k.ey[i];
          if (Math.abs(ex - hx) > 300 || Math.abs(ey - hy) > 300) continue;
          NX[m] = ex; NY[m] = ey; NR[m] = k.er[i]; NW[m] = (i === k.boss ? 6 : k.eelite[i] ? 3 : 1) * (k.er[i] / 12); m++;
          const d0 = Math.sqrt((ex - hx) ** 2 + (ey - hy) ** 2) - k.er[i];
          here += NW[m - 1] / (Math.max(4, d0) ** 2);
        }
        const greed = here * 4000 < 1.2 ? 1.6 : 0.4;
        for (let a = 0; a < 16; a++) {
          const px = hx + DX[a] * 60, py = hy + DY[a] * 60, qx = hx + DX[a] * 130, qy = hy + DY[a] * 130;
          let danger = 0;
          for (let j = 0; j < m; j++) {
            const d1 = Math.sqrt((NX[j] - px) ** 2 + (NY[j] - py) ** 2) - NR[j], d2 = Math.sqrt((NX[j] - qx) ** 2 + (NY[j] - qy) ** 2) - NR[j];
            danger += NW[j] * (1 / (Math.max(4, d1) ** 2) + 0.5 / (Math.max(4, d2) ** 2));
          }
          const pull = tw ? (DX[a] * tx + DY[a] * ty) / tl * Math.min(1, tw / 3) : 0;
          const keep = DX[a] * pdx + DY[a] * pdy;
          const sc = danger * 4000 - pull * greed - keep * 0.25;
          if (sc < bs) { bs = sc; bd = a; }
        }
        pdx = DX[bd]; pdy = DY[bd];
        if (!joy) { inst.down(cx, cy); joy = true; }
        inst.move(cx + pdx * 50, cy + pdy * 50);
      }
    }
    inst.update(dt);
    if (f % 90 === 0) inst.draw(ctx);
    if (TRACE && f % 300 === 0) console.log('t' + s.T.toFixed(0), 'hp' + Math.round(s.hp), 'Lv' + s.lvl, 'k' + s.kills, 'n' + k.count, JSON.stringify(s.items), 'boss' + k.boss);
  }
  return { result: api.result || 'timeout', t: s.T, dur: k.P.dur, lvl: s.lvl, kills: s.kills, hp: Math.round(s.hp), score: api.scoreV };
}

const NAMES = ['簡單', '普通', '困難'];
let bad = 0;
for (let mode = 0; mode < 3; mode++) {
  let fails = 0, nothingWins = 0, minHp = 1e9;
  const to = mode === 0 ? Math.max(TO, 40) : 40;
  for (let lv = FROM; lv <= to; lv++) {
    const b = run(lv, true, mode);
    const z = run(lv, false, mode);
    if (b.result === 'win') minHp = Math.min(minHp, b.hp);
    if (b.result !== 'win') fails++;
    if (z.result !== 'lose') nothingWins++;
    if (VERBOSE || b.result !== 'win' || (mode === 2 && z.result !== 'lose')) {
      console.log(NAMES[mode] + ' L' + lv + ' bot=' + b.result + ' at ' + b.t.toFixed(0) + '/' + b.dur + 's Lv' + b.lvl + ' kills=' + b.kills + ' hp=' + b.hp +
        ' | nothing=' + z.result + ' at ' + z.t.toFixed(0) + 's');
    }
  }
  const n = to - FROM + 1;
  console.log(ID + ' ' + NAMES[mode] + ' levels ' + FROM + '-' + to + ': bot survives ' + (n - fails) + '/' + n + ' (lowest hp left ' + minHp + '), do-nothing dies ' + (n - nothingWins) + '/' + n);
  bad += fails + (mode === 2 ? nothingWins : 0);
}
for (let k = 0; k < 3; k++) {
  const seed = 1000 + k * 777;
  const b = run(1, true, 3, seed), z = run(1, false, 3, seed);
  console.log(ID + ' 無盡 seed ' + seed + ': bot ' + b.result + ' after ' + b.t.toFixed(0) + 's (score ' + b.score + ', kills ' + b.kills + ', Lv' + b.lvl + ')' +
    ' | no-input ' + z.result + ' after ' + z.t.toFixed(0) + 's (score ' + z.score + ')');
  if (z.result !== 'lose' || b.result !== 'lose' || b.score < z.score * 3) bad++;
}
if (bad) { console.log('FAIL'); process.exit(1); }
console.log('OK');
