// Winnability check for 擰螺絲: node tools/check_screw.js [from=1] [to=60]
// Regenerates every level with the shell's seed, then replays the generator's winning tap list
// against the real rules (fixed box-colour queue, 5-hole buffer, no booster) and requires a win.
// Also runs a queue-blind greedy player (only sees the 2 active boxes) for information.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = {
  console, Math, JSON, Date, Array, Object, Map, Set, Number, String, URLSearchParams,
  location: { search: '?mute', protocol: 'file:' },
  localStorage: { getItem: () => null, setItem() {} },
  navigator: {}, devicePixelRatio: 3,
  document: { getElementById() { return null; }, createElement() { return { width: 0, height: 0, getContext: () => stubCtx() }; } },
};
function stubCtx() {
  return new Proxy({}, {
    get(t, k) {
      if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (k === 'measureText') return (str) => ({ width: String(str).length * 8 });
      if (k in t) return t[k];
      return () => {};
    },
    set(t, k, v) { t[k] = v; return true; },
  });
}
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'screw.js'), 'utf8'), sandbox);
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'screw');

const from = parseInt(process.argv[2] || '1', 10), to = parseInt(process.argv[3] || '60', 10);
let fail = 0, greedyWins = 0;
const t0 = Date.now();
for (let lv = from; lv <= to; lv++) {
  const id = 'screw';
  const rng = MG.mulberry32(lv * 7919 + id.length * 104729 + id.charCodeAt(0));
  const L = def.gen(lv, rng);
  let ok = !!L, why = '';
  if (ok) {
    const per = {};
    for (const s of L.screws) per[s.col] = (per[s.col] || 0) + 1;
    const q = {};
    for (const c of L.queue) q[c] = (q[c] || 0) + 1;
    for (const c in per) if (per[c] !== 3 * (q[c] || 0)) { ok = false; why = 'queue/colour mismatch'; }
    if (L.queue.length * 3 !== L.screws.length) { ok = false; why = 'queue length'; }
    for (const p of L.plates) if (!(p.n >= 1)) { ok = false; why = 'plate without screw'; }
  }
  if (ok) {
    const st = def.newState(L, def.BUF);
    def.startBoxes(L, st, null);
    let maxBuf = 0;
    for (const si of L.sol) {
      const r = def.tap(L, st, si, null);
      if (r !== 'ok') { ok = false; why = 'replay ' + r; break; }
      maxBuf = Math.max(maxBuf, st.buf.filter((b) => b >= 0).length);
    }
    if (ok && !def.isWon(L, st)) { ok = false; why = 'not won'; }
    L.maxBuf = maxBuf;
  }
  let gw = false;
  if (L) {
    const st = def.newState(L, def.BUF);
    def.startBoxes(L, st, null);
    for (let k = 0; k < 500 && !def.isWon(L, st); k++) {
      const si = def.greedyPick(L, st);
      if (si < 0 || def.tap(L, st, si, null) !== 'ok') break;
    }
    gw = def.isWon(L, st);
    if (gw) greedyWins++;
  }
  console.log((ok ? 'ok  ' : 'FAIL') + ' L' + String(lv).padStart(2) +
    (L ? '  plates=' + String(L.plates.length).padStart(2) + '  screws=' + String(L.screws.length).padStart(2) + '  colours=' + L.nc +
      '  boxes=' + String(L.queue.length).padStart(2) + '  maxBuffer=' + L.maxBuf + '/5  blindGreedy=' + (gw ? 'win ' : 'lose') + '  attempts=' + L.attempts : '') + (why ? '  ' + why : ''));
  if (!ok) fail++;
}
// Visual layout check: the active colour boxes must be drawn, fully inside the canvas,
// on the very first frame and after 3 s of play, for phone / iPad / landscape canvases.
let boxFail = 0;
for (const [W, H] of [[375, 690], [390, 700], [360, 600], [768, 1000], [1024, 700]]) {
  for (let lv = from; lv <= to; lv++) {
    const id = 'screw';
    const api = {
      W, H, level: lv, rng: MG.mulberry32(lv * 7919 + id.length * 104729 + id.charCodeAt(0)), util: MG.util,
      sfx() {}, info() {}, get ended() { return false; }, win() {}, lose() {},
    };
    const inst = def.create(api), T = inst._test, g = stubCtx();
    for (const frames of [0, 180]) {
      for (let f = 0; f < frames; f++) { inst.update(1 / 60); inst.draw(g); }
      inst.draw(g);
      const want = T.activeCount(), got = T.drawnBoxes.length / 4;
      let bad = got !== want || want < 1 ? 'drew ' + got + ' of ' + want + ' boxes' : '';
      for (let k = 0; k < T.drawnBoxes.length && !bad; k += 4) {
        const [x, y, w, h] = T.drawnBoxes.slice(k, k + 4);
        if (x < 0 || y < 0 || x + w > W || y + h > H) bad = 'box ' + (k / 4) + ' off-canvas at ' + [x, y, w, h].map(Math.round).join(',');
      }
      if (bad) { boxFail++; if (boxFail < 10) console.log('FAIL boxes ' + W + 'x' + H + ' L' + lv + ' frame ' + frames + ': ' + bad); }
    }
  }
}
console.log(boxFail ? 'FAILED box drawing in ' + boxFail + ' case(s)' : 'boxes drawn inside the canvas on frame 0 and after 3 s for 5 canvas sizes x ' + (to - from + 1) + ' levels');
fail += boxFail;
console.log('queue-blind greedy player wins ' + greedyWins + '/' + (to - from + 1));
console.log(fail ? 'FAILED ' + fail + ' level(s)' : 'ALL ' + (to - from + 1) + ' LEVELS WINNABLE (' + (Date.now() - t0) + ' ms)');
process.exit(fail ? 1 : 0);
