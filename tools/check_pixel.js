// Winnability check for 像素射擊: node tools/check_pixel.js [from=1] [to=60]
// 1) validates every bitmap, 2) regenerates each level with the shell's seed, checks that
// ammo per colour == cells per colour, 3) plays the generator's order (always a column front)
// one shooter at a time with the real lane rules and requires the picture to be cleared with
// zero parking, 4) runs a solution-blind greedy player with the 5 waiting slots for information.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = {
  console, Math, JSON, Date, Array, Object, Map, Set, Number, String, URLSearchParams, Int8Array, Uint8Array, Float32Array,
  location: { search: '?mute', protocol: 'file:' },
  localStorage: { getItem: () => null, setItem() {} },
  navigator: {}, document: { getElementById() { return null; } },
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'pixel.js'), 'utf8'), sandbox);
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'pixel');

let fail = 0;
if (def.PICS.length < 20) { console.log('FAIL: only ' + def.PICS.length + ' bitmaps'); fail++; }
for (const p of def.PICS) {
  if (!p.rows.every((r) => r.length === p.C)) { console.log('FAIL bitmap ' + p.name + ' has ragged rows'); fail++; }
}
console.log(def.PICS.length + ' bitmaps: ' + def.PICS.map((p) => p.name + ' ' + p.C + 'x' + p.R).join(', '));

function greedyPlay(L) {
  const grid = Int8Array.from(L.grid);
  const cols = L.cols.map((c) => c.map((s) => ({ c: s.c, a: s.a })));
  const slots = [];
  let left = L.total;
  const probe = new Int8Array(grid.length);
  for (let step = 0; step < 2000 && left > 0; step++) {
    const opts = [];
    cols.forEach((c, ci) => { if (c.length) opts.push({ from: 'col', i: ci, s: c[0] }); });
    slots.forEach((s, si) => opts.push({ from: 'slot', i: si, s }));
    let best = null, bs = -1e9;
    for (const o of opts) {
      probe.set(grid);
      const rest = def.runLap(probe, L.R, L.C, L.lanes, o.s.c, o.s.a);
      const used = o.s.a - rest;
      const canPark = rest === 0 || slots.length - (o.from === 'slot' ? 1 : 0) < def.SLOTS;
      if (!canPark) continue;
      const sc = used * 2 + (rest === 0 ? 100 : 0) - (used === 0 ? 1000 : 0);
      if (sc > bs) { bs = sc; best = o; }
    }
    if (!best || bs <= -1000 + 1e-9 && best.s.a - 0 === best.s.a && bs < -500) return false;
    if (best.from === 'col') cols[best.i].shift(); else slots.splice(best.i, 1);
    const rest = def.runLap(grid, L.R, L.C, L.lanes, best.s.c, best.s.a);
    left -= best.s.a - rest;
    best.s.a = rest;
    if (rest > 0) { if (slots.length >= def.SLOTS) return false; slots.push(best.s); }
  }
  return left === 0;
}

const from = parseInt(process.argv[2] || '1', 10), to = parseInt(process.argv[3] || '60', 10);
let gwins = 0;
const t0 = Date.now();
for (let lv = from; lv <= to; lv++) {
  const id = 'pixel';
  const rng = MG.mulberry32(lv * 7919 + id.length * 104729 + id.charCodeAt(0));
  const L = def.gen(lv, rng);
  let ok = true, why = '';
  const cells = {}, ammo = {};
  for (const v of L.grid) if (v >= 0) cells[v] = (cells[v] || 0) + 1;
  let shooters = 0;
  for (const c of L.cols) for (const s of c) { ammo[s.c] = (ammo[s.c] || 0) + s.a; shooters++; if (!(s.a >= 1)) { ok = false; why = 'zero-ammo shooter'; } }
  for (const k in cells) if (cells[k] !== ammo[k]) { ok = false; why = 'ammo != cells for colour ' + k; }
  // replay generator order
  const grid = Int8Array.from(L.grid);
  const cols = L.cols.map((c) => c.slice());
  for (const s of L.seq) {
    const ci = cols.findIndex((c) => c.length && c[0] === s);
    if (ci < 0) { ok = false; why = 'shooter ' + s.id + ' not at a column front'; break; }
    cols[ci].shift();
    const rest = def.runLap(grid, L.R, L.C, L.lanes, s.c, s.a);
    if (rest !== 0) { ok = false; why = 'shooter ' + s.id + ' had to park'; break; }
  }
  if (ok && grid.some((v) => v >= 0)) { ok = false; why = 'picture not cleared'; }
  const gw = greedyPlay(L);
  if (gw) gwins++;
  console.log((ok ? 'ok  ' : 'FAIL') + ' L' + String(lv).padStart(2) + '  ' + (L.pic.name + '      ').slice(0, 5) + ' ' + L.C + 'x' + L.R +
    '  cells=' + String(L.total).padStart(3) + '  colours=' + L.colors.length + '  shooters=' + String(shooters).padStart(2) +
    '  columns=' + L.cols.length + '  blindGreedy=' + (gw ? 'win' : 'lose') + (why ? '  ' + why : ''));
  if (!ok) fail++;
}
console.log('solution-blind greedy player wins ' + gwins + '/' + (to - from + 1));
console.log(fail ? 'FAILED ' + fail : 'ALL ' + (to - from + 1) + ' LEVELS WINNABLE (' + (Date.now() - t0) + ' ms)');
process.exit(fail ? 1 : 0);
