// Solvability check for 倒水分色: node tools/check_water.js [from=1] [to=60]
// Loads core.js + games/water.js, regenerates each level with the same seed the shell uses,
// then replays the solver's move list with the real pour rules and checks it ends sorted,
// using only the 2 starting empty tubes (no 加管 bonus).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = {
  console, Math, JSON, Date, Array, Object, Map, Set, Number, String, URLSearchParams,
  location: { search: '?mute', protocol: 'file:' },
  localStorage: { getItem: () => null, setItem() {} },
  navigator: {}, document: { getElementById() { return null; } },
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'core.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'games', 'water.js'), 'utf8'), sandbox);
const MG = sandbox.MG;
const def = MG.games.find((d) => d.id === 'water');
const CAP = def.CAP;

const from = parseInt(process.argv[2] || '1', 10), to = parseInt(process.argv[3] || '60', 10);
let fail = 0;
const t0 = Date.now();
for (let lv = from; lv <= to; lv++) {
  const id = 'water';
  const rng = MG.mulberry32(lv * 7919 + id.length * 104729 + id.charCodeAt(0));
  const L = def.gen(lv, rng);
  const tubes = L.tubes.map((t) => t.slice());
  let ok = !!L.sol && tubes.length === L.n + 2;
  const counts = {};
  for (const t of tubes) for (const c of t) counts[c] = (counts[c] || 0) + 1;
  for (const c in counts) if (counts[c] !== CAP) ok = false;
  if (ok) {
    for (const [i, j] of L.sol) {
      const s = tubes[i], d = tubes[j];
      if (!s.length || d.length >= CAP || (d.length && d[d.length - 1] !== s[s.length - 1])) { ok = false; break; }
      const top = s[s.length - 1];
      let run = 1;
      while (run < s.length && s[s.length - 1 - run] === top) run++;
      const amt = Math.min(run, CAP - d.length);
      for (let k = 0; k < amt; k++) d.push(s.pop());
    }
    ok = ok && tubes.every((t) => t.length === 0 || (t.length === CAP && t.every((c) => c === t[0])));
  }
  const hid = L.hidden.reduce((a, t) => a + t.filter(Boolean).length, 0);
  console.log((ok ? 'ok  ' : 'FAIL') + ' L' + String(lv).padStart(2) + '  colours=' + String(L.n).padStart(2) + '  tubes=' + tubes.length +
    '  hidden=' + String(hid).padStart(2) + '  solution=' + (L.sol ? L.sol.length : '-') + ' moves  tries=' + L.tries);
  if (!ok) fail++;
}
console.log(fail ? 'FAILED ' + fail + ' level(s)' : 'ALL ' + (to - from + 1) + ' LEVELS SOLVABLE (' + (Date.now() - t0) + ' ms)');
process.exit(fail ? 1 : 0);
