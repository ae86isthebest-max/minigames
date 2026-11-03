// Winnability check for 三個消除. For each level it regenerates the layout with the game's own
// generator and replays the generator's witness order under full game rules (7-slot tray, only
// uncovered tiles, no boosters) — that order must clear the board. Also reports how a naive
// greedy player does (difficulty indicator) and the tile size on a 390x700 phone canvas.
// Modes 簡單/普通/困難, levels 1-40 each. On 困難 a timer runs, so a player who does nothing loses.
// node tools/check_triple.js [from=1] [to=40]
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FROM = parseInt(process.argv[2] || '1', 10), TO = parseInt(process.argv[3] || '40', 10);
const el = () => ({ classList: { add() {}, remove() {}, toggle() {} }, style: {}, appendChild() {}, addEventListener() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 700 }), getContext: () => ({}) });
const sandbox = { console, Math, location: { search: '?mute', protocol: 'file:' }, URLSearchParams, navigator: {}, localStorage: { getItem: () => null, setItem() {} }, document: { getElementById: el, createElement: el, addEventListener() {} }, addEventListener() {}, performance: { now: () => 0 }, setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0, cancelAnimationFrame() {} };
sandbox.window = sandbox;
vm.createContext(sandbox);
const root = path.join(__dirname, '..');
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'triple.js'), 'utf8'), sandbox);
const MG = sandbox.MG;
const Lg = MG.games.find((d) => d.id === 'triple')._logic;

function greedy(tiles) {
  const above = Lg.computeAbove(tiles);
  const alive = tiles.map(() => true);
  const tray = [];
  for (;;) {
    const free = [];
    for (let i = 0; i < tiles.length; i++) if (alive[i] && !above[i].some((j) => alive[j])) free.push(i);
    if (!free.length) return tray.length === 0;
    let best = -1, bv = -1e9;
    for (const i of free) {
      const c = tray.filter((x) => x === tiles[i].icon).length;
      const unc = tiles.filter((u, j) => alive[j] && above[j].includes(i)).length;
      const v = c * 100 + unc;
      if (v > bv) { bv = v; best = i; }
    }
    alive[best] = false; tray.push(tiles[best].icon);
    const ic = tiles[best].icon;
    if (tray.filter((x) => x === ic).length === 3) for (let k = tray.length - 1; k >= 0; k--) if (tray[k] === ic) tray.splice(k, 1);
    if (tray.length >= 7) return false;
  }
}

let fails = 0, gw = 0;
const MN = ['簡單', '普通', '困難'];
for (let mode = 0; mode < 3; mode++) {
let mgw = 0;
for (let lv = FROM; lv <= TO; lv++) {
  const rng = MG.mulberry32(lv * 7919 + 'triple'.length * 104729 + 'triple'.charCodeAt(0) + mode * 15485863);
  const d = Lg.genLevel(lv, rng, mode);
  const counts = {};
  d.tiles.forEach((t) => { counts[t.icon] = (counts[t.icon] || 0) + 1; });
  const bad3 = Object.keys(counts).filter((k) => counts[k] % 3);
  const sim = Lg.simulate(d.tiles, d.order);
  const layers = 1 + Math.max(...d.tiles.filter((t) => !t.stack).map((t) => t.z));
  // same tile-size formula as the game layout for a 390x700 canvas
  const W = 390, H = 700, ss = Math.floor(Math.min((W - 36) / 7, 58)), boostH = Math.max(66, ss * 1.25);
  const trayY = H - boostH - ss * 1.32 - 6, shelfY = trayY - ss * 1.1 - 4, availH = shelfY - 44 - 8;
  const ts = Math.floor(Math.min((W - 24) / (d.boardW / 2), availH / (d.boardH / 2 * 1.12 + 0.23), 78));
  const g = greedy(d.tiles);
  if (g) { gw++; mgw++; }
  const lazyLoses = mode < 2 || d.cf.timeLimit > 0;
  const ok = sim.ok && !bad3.length && ts >= 36 && lazyLoses;
  if (!ok) fails++;
  console.log(MN[mode] + ' L' + lv + ': ' + d.tiles.length + ' tiles, ' + Object.keys(counts).length + ' icons, ' + layers + ' layers' + (d.cf.stackDepth ? ', stacks 2x' + d.cf.stackDepth : '') + ', tile ' + ts + 'px -> witness ' + (sim.ok ? 'WIN (max tray ' + sim.maxTray + ')' : 'FAIL ' + sim.reason) + (bad3.length ? ' BAD COUNTS' : '') + ' | greedy ' + (g ? 'win' : 'lose') + (d.cf.timeLimit ? ' | timer ' + d.cf.timeLimit + 's' : '') + ' | boosters ' + d.cf.boosters.length);
}
console.log('== ' + MN[mode] + ': naive greedy wins ' + mgw + '/' + (TO - FROM + 1));
}
console.log(fails ? 'FAIL: ' + fails + ' level(s)' : 'OK triple: 簡單/普通/困難 levels ' + FROM + '-' + TO + ' all winnable without boosters; 困難 has a timer (idle player loses)');
process.exit(fails ? 1 : 0);
