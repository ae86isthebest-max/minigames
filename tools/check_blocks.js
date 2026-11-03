// Winnability check for 方塊消除: a simple bot plays each level with the game's own
// logic (same generator, same rng order, same scoring) and must reach the goal.
// node tools/check_blocks.js [from=1] [to=60]
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FROM = parseInt(process.argv[2] || '1', 10), TO = parseInt(process.argv[3] || '60', 10);
const el = () => ({ classList: { add() {}, remove() {}, toggle() {} }, style: {}, appendChild() {}, addEventListener() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 700 }), getContext: () => ({}) });
const sandbox = { console, Math, location: { search: '?mute', protocol: 'file:' }, URLSearchParams, navigator: {}, localStorage: { getItem: () => null, setItem() {} }, document: { getElementById: el, createElement: el, addEventListener() {} }, addEventListener() {}, performance: { now: () => 0 }, setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0, cancelAnimationFrame() {} };
sandbox.window = sandbox;
vm.createContext(sandbox);
const root = path.join(__dirname, '..');
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'blocks.js'), 'utf8'), sandbox);
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'blocks');
const Lg = def._logic;
const { N, SHAPES } = Lg;

function playLevel(lv) {
  const rng = MG.mulberry32(lv * 7919 + 'blocks'.length * 104729 + 'blocks'.charCodeAt(0));
  const d = Lg.genLevel(lv, rng);
  const b = d.board.slice(), gems = d.gems.slice();
  let gemsLeft = d.gemsNeed, score = 0, combo = 0, since = 0, moves = 0;
  const won = () => (d.type === 'gems' ? gemsLeft <= 0 : score >= d.target);
  while (moves < 6000) {
    const t = Lg.genTriplet(b, rng);
    rng(); rng(); rng();
    // choose the best order with greedy placement
    let best = null;
    for (const p of Lg.PERMS) {
      const tb = b.slice(), tg = gems.slice();
      let v = 0, ok = true; const plan = [];
      for (const k of p) {
        const s = SHAPES[t[k]];
        const bp = Lg.bestPlacement(tb, s, tg);
        if (!bp) { ok = false; break; }
        const r = Lg.placeAndClear(tb, s, bp.r, bp.c, 1, tg);
        v += r.lines * 14 + r.gemsGot * 30;
        plan.push([k, bp.r, bp.c]);
      }
      if (!ok) continue;
      v += Lg.evalBoard(tb);
      if (!best || v > best.v) best = { v, plan };
    }
    if (!best) return { ok: false, score, moves, gemsLeft, d };
    for (const [k, r, c] of best.plan) {
      const s = SHAPES[t[k]];
      if (!Lg.fits(b, s, r, c)) throw new Error('plan invalid');
      const res = Lg.placeAndClear(b, s, r, c, 1 + k, gems);
      moves++;
      score += s.n;
      if (res.lines) { combo++; since = 0; score += Lg.clearPoints(res.lines, combo); gemsLeft -= res.gemsGot; if (b.every((x) => !x)) score += 300; }
      else { since++; if (since >= 3) combo = 0; }
      if (won()) return { ok: true, score, moves, gemsLeft, d };
    }
  }
  return { ok: false, score, moves, gemsLeft, d };
}

let fails = 0;
const t0 = Date.now();
for (let lv = FROM; lv <= TO; lv++) {
  const r = playLevel(lv);
  const goal = r.d.type === 'gems' ? 'gems ' + r.d.gemsNeed : 'score ' + r.d.target;
  const pre = r.d.board.filter((x) => x).length;
  console.log('L' + lv + ' ' + goal + (pre ? ' prefill ' + pre : '') + ' -> ' + (r.ok ? 'WIN' : 'FAIL') + ' in ' + r.moves + ' pieces (score ' + r.score + ')');
  if (!r.ok) fails++;
}
console.log(fails ? 'FAIL: ' + fails + ' level(s) not won' : 'OK blocks: levels ' + FROM + '-' + TO + ' all won by bot (' + ((Date.now() - t0) / 1000).toFixed(1) + 's)');
process.exit(fails ? 1 : 0);
