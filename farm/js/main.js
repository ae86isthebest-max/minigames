// 開心農場鋪 — walk, carry, unlock, hire. Original game, art from the shared style kit.
import * as THREE from 'three';
import * as K from './kit.js';
import * as P from './props.js';
import { Joystick } from './input.js';

const { C, G } = K;
const ITEMS = P.ITEMS;
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const dist2 = (a, x, z) => Math.hypot(a.x - x, a.z - z);
const easeBack = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

// ---------- unlock chain ----------
const DEFS = [
  { id: 'coop', name: '雞舍', kind: 'producer', in: 'hay', out: 'egg', pos: [2, 1], cost: { hay: 5 } },
  { id: 'shelfEgg', name: '雞蛋架', kind: 'shelf', item: 'egg', pos: [-6.5, -14], zone: [-6.5, -12.3], cost: { wood: 4 } },
  { id: 'tomato', name: '番茄田', kind: 'crop', out: 'tomato', pos: [9, 1.2], cost: { money: 20 } },
  { id: 'shelfTomato', name: '番茄架', kind: 'shelf', item: 'tomato', pos: [-3.5, -14], zone: [-3.5, -12.3], cost: { money: 25, wood: 5 } },
  { id: 'cashier', name: '收銀員', kind: 'hire', role: 'cashier', zone: [7.2, -12.6], cost: { money: 60 } },
  { id: 'farmer', name: '農夫', kind: 'hire', role: 'farmer', zone: [-2, 1.5], cost: { money: 100 } },
  { id: 'corn', name: '玉米田', kind: 'crop', out: 'corn', pos: [9, 6.8], cost: { money: 120, wood: 8 } },
  { id: 'shelfCorn', name: '玉米架', kind: 'shelf', item: 'corn', pos: [-0.5, -14], zone: [-0.5, -12.3], cost: { money: 90 } },
  { id: 'dog', name: '小狗', kind: 'pet', zone: [-1, -4.6], cost: { money: 150, wood: 10 } },
  { id: 'shelver', name: '理貨員', kind: 'hire', role: 'shelver', zone: [1.5, -5], cost: { money: 180 } },
  { id: 'barn', name: '牛棚', kind: 'producer', in: 'hay', out: 'milk', pos: [-4.5, 10.2], cost: { money: 220, hay: 15, wood: 12 } },
  { id: 'shelfMilk', name: '牛奶架', kind: 'shelf', item: 'milk', pos: [2.5, -14], zone: [2.5, -12.3], cost: { money: 150 } },
  { id: 'dock', name: '貨運站', kind: 'dock', pos: [12.2, 6], zone: [12, 6], cost: { money: 300, wood: 20 } },
  { id: 'cat', name: '小貓', kind: 'pet', zone: [7.2, -9], cost: { money: 260 } },
  { id: 'coop2', name: '第二雞舍', kind: 'producer', in: 'hay', out: 'egg', pos: [2, 7.4], cost: { money: 350, wood: 15 } },
];
const DEF = Object.fromEntries(DEFS.map((d) => [d.id, d]));

const UPS = {
  cap: { tab: 0, name: '背包容量', icon: '🎒', vals: [6, 10, 14, 18, 24, 30], cost: [30, 80, 150, 250, 400], fmt: (v) => v + ' 個' },
  speed: { tab: 0, name: '移動速度', icon: '👟', vals: [4.4, 5, 5.6, 6.2, 6.8], cost: [40, 100, 180, 300], fmt: (v) => v.toFixed(1) },
  wcap: { tab: 1, name: '員工容量', icon: '📦', vals: [3, 5, 8, 12], cost: [80, 160, 300], fmt: (v) => v + ' 個' },
  wspeed: { tab: 1, name: '員工速度', icon: '⚡', vals: [3, 3.6, 4.2, 4.8], cost: [80, 160, 300], fmt: (v) => v.toFixed(1) },
  coop: { tab: 2, name: '雞生蛋速度', icon: '🐔', need: 'coop', vals: [3, 2.4, 1.8, 1.3], cost: [60, 150, 300], fmt: (v) => v + ' 秒一顆' },
  barn: { tab: 2, name: '牛奶速度', icon: '🐄', need: 'barn', vals: [5, 4, 3, 2.2], cost: [150, 300, 500], fmt: (v) => v + ' 秒一瓶' },
  dogR: { tab: 2, name: '小狗吸錢範圍', icon: '🐶', need: 'dog', vals: [3, 5, 7], cost: [120, 260], fmt: (v) => v + ' 格' },
};
const upVal = (k) => UPS[k].vals[state.up[k] || 0];

// ---------- save ----------
const SAVE = 'farm_save_v1';
const state = { money: 0, built: [], paid: {}, up: {}, stock: {}, sound: true };
try { Object.assign(state, JSON.parse(localStorage.getItem(SAVE) || '{}')); } catch (e) { /* fresh start */ }
if (params.has('fresh')) Object.assign(state, { money: 0, built: [], paid: {}, up: {}, stock: {} });
for (const k in UPS) state.up[k] = state.up[k] || 0;
const isBuilt = (id) => state.built.includes(id);
function save() {
  for (const id in stations) {
    const s = stations[id];
    if (s.kind === 'producer') state.stock[id] = { a: s.inN, b: s.outN };
    else if (s.kind === 'shelf') state.stock[id] = { a: s.n };
  }
  state.stock.pile = pile.value;
  try { localStorage.setItem(SAVE, JSON.stringify(state)); } catch (e) { /* storage off */ }
}

// ---------- sound ----------
let actx = null;
function sfx(kind) {
  if (!state.sound || params.has('mute')) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime;
    const tone = (f, d, type = 'sine', v = 0.12, at = 0) => {
      const o = actx.createOscillator(), gn = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t + at);
      gn.gain.setValueAtTime(v, t + at); gn.gain.exponentialRampToValueAtTime(0.001, t + at + d);
      o.connect(gn).connect(actx.destination); o.start(t + at); o.stop(t + at + d);
    };
    if (kind === 'pop') tone(660 + Math.random() * 120, 0.08, 'triangle', 0.08);
    else if (kind === 'drop') tone(420, 0.07, 'triangle', 0.07);
    else if (kind === 'coin') { tone(1180, 0.06, 'square', 0.04); tone(1580, 0.08, 'square', 0.04, 0.05); }
    else if (kind === 'chop') tone(180, 0.09, 'square', 0.06);
    else if (kind === 'unlock') [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.09, i * 0.08));
    else if (kind === 'buy') { tone(880, 0.08, 'triangle', 0.08); tone(1320, 0.12, 'triangle', 0.08, 0.07); }
  } catch (e) { /* no audio */ }
}

// ---------- renderer / scene ----------
const canvas = $('cv');
const renderer = K.makeRenderer(canvas);
const scene = new THREE.Scene();
scene.background = new THREE.Color(C.grass2);
const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 200);
const lights = K.makeLights(scene);
const joy = new Joystick(canvas, $('ui'));
joy.onStart = () => { if (actx && actx.state === 'suspended') actx.resume(); };

const colliders = [];
const box = (x0, z0, x1, z1) => colliders.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) });

// ---------- static world ----------
function buildWorld() {
  const ground = K.mesh(G.plane(140, 140), C.grass, false, true); scene.add(ground);
  const rnd = mulberry(7);
  for (let i = 0; i < 26; i++) {
    const r = 1.5 + rnd() * 3.5, p = K.mesh(G.circle(r, 9), rnd() < 0.5 ? C.grass2 : C.grass3, false, true);
    p.position.set(-30 + rnd() * 60, 0.004, -30 + rnd() * 60); p.scale.set(1, 1, 0.6 + rnd() * 0.6); p.rotation.y = rnd() * 3; scene.add(p);
  }
  // dirt path from shop down through the farm
  for (let z = -6; z <= 13; z += 1.15) {
    const t = K.mesh(G.rbox(1.0, 0.04, 0.95, 0.12, 2), (Math.round(z * 2) % 2) ? C.dirt : C.dirt2, false, true);
    t.position.set(-0.6 + Math.sin(z * 0.6) * 0.25, 0.02, z); t.rotation.y = Math.sin(z) * 0.15; scene.add(t);
  }
  // road along the east side
  K.add(scene, K.mesh(G.plane(4.2, 140), C.road, false, true), 15.5, 0.006, 0);
  for (let z = -60; z < 60; z += 3) K.add(scene, K.mesh(G.plane(0.18, 1.4), C.roadLine, false, true), 15.5, 0.012, z);
  for (const x of [13.3, 17.7]) K.add(scene, K.mesh(G.rbox(0.3, 0.12, 140, 0.05, 1), '#d5d9de', false, true), x, 0.06, 0);
  // shop: floor + two low walls (back and left) so the camera sees in
  K.add(scene, K.mesh(G.rbox(17, 0.12, 11, 0.06, 2), C.floor, false, true), -1, 0.06, -12);
  K.add(scene, K.mesh(G.rbox(16.4, 0.05, 0.6, 0.03, 1), C.floor2, false, true), -1, 0.125, -6.85);
  K.add(scene, K.mesh(G.rbox(17.4, 1.5, 0.4, 0.08), C.wall), -1, 0.75, -17.6);
  K.add(scene, K.mesh(G.rbox(17.5, 0.2, 0.46, 0.05), C.wallTrim), -1, 1.5, -17.6);
  K.add(scene, K.mesh(G.rbox(0.4, 1.5, 11, 0.08), C.wall), -9.7, 0.75, -12);
  K.add(scene, K.mesh(G.rbox(0.46, 0.2, 11.1, 0.05), C.wallTrim), -9.7, 1.5, -12);
  for (const x of [-6, 0, 5]) K.add(scene, K.mesh(G.rbox(2.2, 0.8, 0.08, 0.06), '#bfe9ff'), x, 0.85, -17.38);
  box(-9.5, -17.8, 7.5, -17.4); box(-9.9, -17.5, -9.5, -6.5);
  // shop sign post + plant pots
  const sign = K.add(scene, new THREE.Group(), 8.6, 0, -5.6);
  K.add(sign, K.mesh(G.rbox(0.14, 1.6, 0.14, 0.04), C.woodDark), 0, 0.8, 0);
  K.add(sign, K.mesh(G.rbox(1.6, 0.8, 0.12, 0.08), C.cream), 0, 1.7, 0);
  K.add(sign, K.mesh(G.rbox(1.35, 0.15, 0.13, 0.04), C.roof), 0, 1.92, 0);
  for (const [x, z] of [[-8.8, -16.8], [6.6, -16.8]]) {
    const pot = K.add(scene, new THREE.Group(), x, 0.12, z);
    K.add(pot, K.mesh(G.cyl(0.32, 0.24, 0.45, 10), C.roof), 0, 0.22, 0);
    K.add(pot, P.bush(0.35), 0, 0.4, 0);
  }
  // money mat beside the counter
  K.add(scene, K.mesh(G.rbox(1.3, 0.04, 1.3, 0.1), '#c9f0c2', false, true), PILE.x, 0.14, PILE.z);
  // fence around the farm
  for (const seg of [[-17, -4.5, -17, 14.5], [-17, 14.5, 12, 14.5], [-17, -4.5, -10.5, -4.5]]) scene.add(P.fenceLine(...seg));
  box(-17.2, -4.5, -16.8, 14.5); box(-17, 14.3, 12, 14.7);
  // trees outside the fence, bushes, flowers, rocks, lamps
  for (let i = 0; i < 18; i++) {
    const t = P.tree(); const a = i / 18 * Math.PI * 2;
    t.g.position.set(-22 - rnd() * 6 + (i % 3), 0, -22 + i * 2.8); t.g.scale.setScalar(0.9 + rnd() * 0.5); scene.add(t.g);
  }
  for (let i = 0; i < 12; i++) { const t = P.tree(); t.g.position.set(-18 + i * 3.1 + rnd(), 0, 17.5 + rnd() * 3); t.g.scale.setScalar(0.85 + rnd() * 0.4); scene.add(t.g); }
  for (let i = 0; i < 9; i++) { const t = P.tree(); t.g.position.set(-14 + i * 3 + rnd(), 0, -21 - rnd() * 3); scene.add(t.g); }
  for (let i = 0; i < 9; i++) { const t = P.tree(); t.g.position.set(20.5 + rnd() * 3, 0, -24 + i * 6 + rnd() * 2); scene.add(t.g); }
  for (const [x, z, r] of [[11.5, -16, 0.6], [12, -4, 0.45], [-11.5, -5.2, 0.5], [6, 13.4, 0.55], [-9, 13.3, 0.5], [12, 12.5, 0.6]]) K.add(scene, P.bush(r), x, 0, z);
  const fl = ['#ff7eb6', '#ffffff', '#ffd34a', '#a98bff', '#ff8a6b'];
  for (let i = 0; i < 40; i++) K.add(scene, P.flower(fl[i % 5]), -16 + rnd() * 28, 0, -3.5 + rnd() * 17.5);
  for (const [x, z, s] of [[-15, 12.5, 0.45], [10.8, -1.5, 0.35], [-10.5, 12.8, 0.3], [11.5, 9.5, 0.4]]) K.add(scene, P.rock(s), x, 0, z);
  for (const z of [-14, -2, 10]) K.add(scene, P.lamp(), 13, 0, z);
}
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- labels (DOM, projected) ----------
const labels = [];
const tmpV = new THREE.Vector3();
function label(cls, html, getPos) {
  const el = document.createElement('div'); el.className = 'lbl ' + cls; el.innerHTML = html;
  $('labels').appendChild(el);
  const L = { el, getPos, html, show: true };
  labels.push(L);
  return L;
}
function setLabel(L, html) { if (L.html !== html) { L.html = html; L.el.innerHTML = html; } }
function dropLabel(L) { L.el.remove(); const i = labels.indexOf(L); if (i >= 0) labels.splice(i, 1); }
function placeLabels() {
  const w = innerWidth, h = innerHeight, pp = player.p.root.position;
  for (const L of labels) {
    if (!L.show) { L.el.style.display = 'none'; continue; }
    L.getPos(tmpV);
    if (L.near && Math.hypot(tmpV.x - pp.x, tmpV.z - pp.z) > L.near) { L.el.style.display = 'none'; continue; } tmpV.project(camera);
    if (tmpV.z > 1 || tmpV.x < -1.3 || tmpV.x > 1.3 || tmpV.y < -1.3 || tmpV.y > 1.3) { L.el.style.display = 'none'; continue; }
    L.el.style.display = '';
    L.el.style.transform = 'translate(' + ((tmpV.x + 1) / 2 * w).toFixed(1) + 'px,' + ((1 - tmpV.y) / 2 * h).toFixed(1) + 'px) translate(-50%,-100%)';
  }
}
const badge = (icon, n, max) => '<span class="ic">' + icon + '</span>' + n + '/' + max;

// ---------- particles / floating text / flying items ----------
const puffs = [];
const puffGeo = G.sphere(0.12, 6, 5);
function puff(x, y, z, col = '#ffffff', n = 6, spread = 1) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(puffGeo, K.mat(col)); m.position.set(x, y, z); scene.add(m);
    const a = Math.random() * 6.28;
    puffs.push({ m, vx: Math.cos(a) * spread * (1 + Math.random()), vy: 1.5 + Math.random() * 2, vz: Math.sin(a) * spread * (1 + Math.random()), t: 0, life: 0.5 + Math.random() * 0.3 });
  }
}
function confetti(x, z) {
  const cols = [C.red, C.yellow, C.blue, C.pink, C.green, C.purple];
  for (let i = 0; i < 26; i++) puff(x, 1, z, cols[i % cols.length], 1, 2.2);
}
function floatText(text, pos3, cls = '') {
  const el = document.createElement('div'); el.className = 'ftxt ' + cls; el.textContent = text; $('labels').appendChild(el);
  const p = pos3.clone(); p.project(camera);
  el.style.left = ((p.x + 1) / 2 * innerWidth) + 'px'; el.style.top = ((1 - p.y) / 2 * innerHeight) + 'px';
  setTimeout(() => el.remove(), 900);
}
const flyers = [];
function fly(type, from, toFn, dur, done) {
  const m = P.itemMesh(type); m.position.copy(from); scene.add(m);
  flyers.push({ m, from: from.clone(), toFn, t: 0, dur, done });
}

// ---------- carriers (player and workers carry a stack on their back) ----------
function carrier(p) { return { p, carry: [], incoming: 0, xfer: 0, cap: () => 6 }; }
function stackTop(c, out) {
  let h = 0; for (const it of c.carry) h += ITEMS[it.type].h;
  c.p.back.getWorldPosition(out); out.y += h + 0.15; return out;
}
function restack(c) { let y = 0; for (const it of c.carry) { it.m.position.set(0, y, 0); y += ITEMS[it.type].h; } }
function stackAdd(c, type) { const m = P.itemMesh(type); c.p.back.add(m); c.carry.push({ type, m }); restack(c); }
function count(c, type) { let n = 0; for (const it of c.carry) if (it.type === type) n++; return n; }
function room(c) { return c.cap() - c.carry.length - c.incoming; }
// take one item of type off the carrier (topmost first) and fly it to toFn
function giveFrom(c, type, toFn, done) {
  for (let i = c.carry.length - 1; i >= 0; i--) {
    if (c.carry[i].type !== type) continue;
    const it = c.carry.splice(i, 1)[0];
    const from = new THREE.Vector3(); it.m.getWorldPosition(from);
    c.p.back.remove(it.m); restack(c);
    fly(type, from, toFn, 0.28, done);
    return true;
  }
  return false;
}
// fly one item from a world point into the carrier's stack
function takeInto(c, type, from) {
  c.incoming++;
  fly(type, from, (o) => stackTop(c, o), 0.3, () => { c.incoming--; stackAdd(c, type); });
}

// ---------- player ----------
const player = carrier(K.person({ body: '#ff7f6e', hat: 'straw' }));
player.cap = () => upVal('cap');
player.p.root.position.set(0, 0, -3);
scene.add(player.p.root);
const axe = new THREE.Group();
K.add(axe, K.mesh(G.rbox(0.06, 0.5, 0.06, 0.02), C.woodDark), 0, -0.25, 0.1);
K.add(axe, K.mesh(G.rbox(0.05, 0.18, 0.22, 0.03), C.grey), 0, -0.46, 0.2);
player.p.arms[1].add(axe); axe.visible = false;
let pVel = new THREE.Vector3(), pFace = 0;

// ---------- resource nodes ----------
const tufts = [];
function buildField() {
  for (let ix = 0; ix < 5; ix++) for (let iz = 0; iz < 5; iz++) {
    const t = P.tuft(); const x = -7.6 + ix * 1.05 + (iz % 2) * 0.3, z = -0.2 + iz * 1.0;
    t.g.position.set(x, 0, z); t.g.rotation.y = (ix * 7 + iz * 3) % 6; scene.add(t.g);
    tufts.push({ ...t, x, z, grown: true, t: 0, res: null });
  }
  K.add(scene, K.mesh(G.circle(3.4, 10), '#a9d957', false, true), -5.3, 0.006, 1.9).scale.set(1.15, 1, 1);
}
const trees = [];
function buildTrees() {
  for (const [x, z] of [[-13.2, -2.6], [-14.6, 0.8], [-12.6, 3.6], [-14.4, 6.6], [-12.9, 9.6]]) {
    const t = P.tree(); t.g.position.set(x, 0, z); scene.add(t.g);
    trees.push({ ...t, x, z, hp: 3, dead: false, t: 0, shake: 0 });
    colliders.push({ x0: x - 0.35, x1: x + 0.35, z0: z - 0.35, z1: z + 0.35 });
  }
}

// ---------- stations ----------
const stations = {};
const PILE = { x: 7.1, z: -10.4 };
const SERVE = { x: 4.5, z: -11.9 };
const pile = { value: 0, vis: [], grp: null };
function buildCounterArea() {
  const c = P.counter(); c.position.set(4.5, 0.12, -10.5); scene.add(c); box(3.0, -11.05, 6.0, -9.95);
  pile.grp = K.add(scene, new THREE.Group(), PILE.x, 0.16, PILE.z);
  for (let i = 0; i < 40; i++) {
    const m = P.itemMesh('money'); const col = i % 4, row = Math.floor(i / 4) % 2, lay = Math.floor(i / 8);
    m.position.set(-0.3 + (col % 2) * 0.48, lay * 0.07, -0.32 + row * 0.34 + Math.floor(col / 2) * 0.32 - 0.15);
    m.rotation.y = (i * 0.37) % 0.3; m.visible = false; pile.grp.add(m); pile.vis.push(m);
  }
  pile.label = label('badge money', '', (o) => o.set(PILE.x, 1.2, PILE.z));
}
function setPile() {
  const n = pile.value > 0 ? Math.min(40, Math.ceil(pile.value / 4)) : 0;
  pile.vis.forEach((m, i) => { m.visible = i < n; });
  pile.label.show = pile.value > 0;
  setLabel(pile.label, '💵 ' + pile.value);
}

function popIn(obj) { obj.scale.setScalar(0.01); pops.push({ obj, t: 0 }); }
const pops = [];
const later = [];

function build(def, instant) {
  const id = def.id;
  if (!state.built.includes(id)) state.built.push(id);
  let s = { id, def, kind: def.kind };
  stations[id] = s;
  if (def.kind === 'producer') {
    const isBarn = def.out === 'milk';
    const b = isBarn ? P.barn() : P.coop();
    b.g.position.set(def.pos[0], 0, def.pos[1]); scene.add(b.g);
    const tw = b.trough.getWorldPosition(new THREE.Vector3()), nw = b.nest.getWorldPosition(new THREE.Vector3());
    Object.assign(s, { g: b.g, trough: tw, nest: nw, inN: 0, outN: 0, inMax: 10, outMax: 12, timer: 0, inVis: [], outVis: [], animals: [] });
    for (let i = 0; i < 10; i++) { const m = P.itemMesh('hay'); m.scale.setScalar(0.62); m.position.set(-0.4 + (i % 5) * 0.2, 0.3 + Math.floor(i / 5) * 0.17, (Math.floor(i / 5) % 2) * 0.08 - 0.04); m.visible = false; b.trough.add(m); s.inVis.push(m); }
    for (let i = 0; i < 12; i++) { const m = P.itemMesh(def.out); m.scale.setScalar(0.85); m.position.set(-0.3 + (i % 4) * 0.2, 0.22 + Math.floor(i / 8) * 0.22, -0.18 + (Math.floor(i / 4) % 2) * 0.3); m.visible = false; b.nest.add(m); s.outVis.push(m); }
    if (isBarn) {
      const c = P.cow(); c.g.position.set(def.pos[0] - 0.6, 0, def.pos[1] + 0.9); scene.add(c.g); s.animals.push({ ...c, home: [def.pos[0], def.pos[1] + 0.9], rx: 1.0, rz: 0.4, t: Math.random() * 5, tx: 0, tz: 0 });
      box(def.pos[0] - 1.5, def.pos[1] - 2, def.pos[0] + 1.5, def.pos[1] + 0.2);
    } else {
      for (let i = 0; i < 3; i++) { const c = P.chicken(); c.g.position.set(def.pos[0] - 0.6 + i * 0.6, 0, def.pos[1] + 0.7); scene.add(c.g); s.animals.push({ ...c, home: [def.pos[0], def.pos[1] + 0.75], rx: 0.95, rz: 0.4, t: Math.random() * 5, tx: 0, tz: 0 }); }
      box(def.pos[0] - 1.2, def.pos[1] - 1.45, def.pos[0] + 1.2, def.pos[1] + 0.25);
    }
    const st = state.stock[id]; if (st) { s.inN = st.a || 0; s.outN = st.b || 0; }
    s.inLabel = label('badge', '', (o) => o.copy(tw).setY(1.0)); s.inLabel.near = 5;
    s.outLabel = label('badge', '', (o) => o.copy(nw).setY(0.95)); s.outLabel.near = 5;
    if (!instant) popIn(b.g);
  } else if (def.kind === 'crop') {
    const corn = def.out === 'corn';
    const g = new THREE.Group(); g.position.set(def.pos[0], 0, def.pos[1]); scene.add(g);
    g.add(P.plot(3.2, corn ? 2.8 : 2.4));
    s.plants = [];
    const spots = corn ? [[-1, -0.7], [0, -0.7], [1, -0.7], [-1, 0.7], [0, 0.7], [1, 0.7]] : [[-0.8, -0.55], [0.8, -0.55], [-0.8, 0.55], [0.8, 0.55]];
    for (const [x, z] of spots) {
      const pl = corn ? P.cornPlant() : P.tomatoPlant(); pl.g.position.set(x, 0.2, z); g.add(pl.g);
      s.plants.push({ ...pl, x: def.pos[0] + x, z: def.pos[1] + z, ripe: true, t: 0, res: null });
    }
    s.grow = corn ? 8 : 6; s.g = g;
    if (!instant) popIn(g);
  } else if (def.kind === 'shelf') {
    const sh = P.shelf(); sh.g.position.set(def.pos[0], 0.12, def.pos[1]); scene.add(sh.g);
    Object.assign(s, { g: sh.g, n: 0, max: 8, vis: [], item: def.item, front: V3(def.pos[0], 0, def.pos[1] + 1.25) });
    for (const sp of sh.slots) { const m = P.itemMesh(def.item); m.position.copy(sp); m.visible = false; sh.g.add(m); s.vis.push(m); }
    const ic = P.itemMesh(def.item); ic.scale.setScalar(0.9); ic.position.set(0, 1.12, -0.38); sh.g.add(ic);
    const st = state.stock[id]; if (st) s.n = st.a || 0;
    s.label = label('badge', '', (o) => o.set(def.pos[0], 1.95, def.pos[1]));
    box(def.pos[0] - 0.85, def.pos[1] - 0.5, def.pos[0] + 0.85, def.pos[1] + 0.5);
    if (!instant) popIn(sh.g);
  } else if (def.kind === 'hire') {
    const w = makeWorker(def.role, def.zone);
    s.worker = w;
  } else if (def.kind === 'pet') {
    if (id === 'dog') { const d = P.dog(); d.g.position.set(def.zone[0], 0, def.zone[1]); scene.add(d.g); pets.dog = { ...d, ph: 0 }; if (!instant) popIn(d.g); }
    else { const c = P.cat(); c.g.position.set(6.3, 1.12, -10.6); c.g.rotation.y = -0.6; scene.add(c.g); pets.cat = { ...c, ph: 0 }; if (!instant) popIn(c.g); }
  } else if (def.kind === 'dock') {
    const g = new THREE.Group(); g.position.set(def.pos[0], 0, def.pos[1]); scene.add(g);
    K.add(g, K.mesh(G.rbox(2.2, 0.35, 3.2, 0.08), C.woodLight), 0, 0.17, 0);
    for (const z of [-1.4, 1.4]) K.add(g, K.mesh(G.rbox(0.18, 1.1, 0.18, 0.05), C.woodDark), -0.95, 0.55, z);
    K.add(g, K.mesh(G.rbox(0.12, 0.7, 2.9, 0.05), C.roof), -0.95, 1.1, 0);
    s.g = g; truck.ready = true;
    if (!instant) popIn(g);
  }
  if (!instant) { confetti(...(def.pos || def.zone)); sfx('unlock'); }
  refreshZones();
  save();
}

// ---------- zones ----------
const zones = {};
const dashTex = K.dashTexture();
const dashMat = new THREE.MeshBasicMaterial({ map: dashTex, transparent: true, depthWrite: false });
const fillMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false });
function zonePos(def) { return def.zone || def.pos; }
function refreshZones() {
  for (const def of DEFS) {
    if (isBuilt(def.id)) { if (zones[def.id]) killZone(def.id); continue; }
    const i = DEFS.indexOf(def);
    const open = i === 0 || isBuilt(DEFS[i - 1].id);
    if (open && !zones[def.id]) makeZone(def);
  }
}
function makeZone(def) {
  const [x, z] = zonePos(def);
  const g = new THREE.Group(); g.position.set(x, 0.03, z); scene.add(g);
  const ring = new THREE.Mesh(G.plane(2.4, 2.4), dashMat); ring.renderOrder = 2; g.add(ring);
  const fill = new THREE.Mesh(G.plane(1.9, 1.9), fillMat); fill.renderOrder = 2; fill.position.y = 0.005; fill.scale.set(1, 1, 0.001); g.add(fill);
  const paid = state.paid[def.id] || {};
  const z0 = { def, g, fill, x, z, paid, total: Object.values(def.cost).reduce((a, b) => a + b, 0), tick: 0 };
  z0.label = label('zone', '', (o) => o.set(x, 0.4, z + 0.2));
  zones[def.id] = z0;
  updateZoneLabel(z0);
  popIn(g);
}
function killZone(id) { const z = zones[id]; scene.remove(z.g); dropLabel(z.label); delete zones[id]; }
function left(z, k) { return z.def.cost[k] - (z.paid[k] || 0); }
function updateZoneLabel(z) {
  let rows = '';
  for (const k in z.def.cost) {
    const l = left(z, k); if (l <= 0) continue;
    rows += '<div class="cost"><span class="ic">' + (k === 'money' ? '💵' : ITEMS[k].icon) + '</span>' + l + '</div>';
  }
  setLabel(z.label, '<div class="zn">' + z.def.name + '</div>' + rows);
  let paidSum = 0; for (const k in z.def.cost) paidSum += Math.min(z.def.cost[k], z.paid[k] || 0);
  z.fill.scale.set(1, 1, Math.max(0.001, paidSum / z.total));
  z.fill.position.z = 0.95 * (1 - paidSum / z.total);
}
function payZones(dt) {
  for (const id in zones) {
    const z = zones[id];
    if (dist2(player.p.root.position, z.x, z.z) > 1.35) { z.tick = 0; continue; }
    z.tick -= dt; if (z.tick > 0) continue;
    z.tick = 0.06;
    let moved = false;
    for (const k in z.def.cost) {
      const l = left(z, k); if (l <= 0) continue;
      if (k === 'money') {
        const chunk = Math.min(l, state.money, Math.max(1, Math.ceil(z.def.cost.money / 24)));
        if (chunk > 0) {
          state.money -= chunk; z.paid.money = (z.paid.money || 0) + chunk; moved = true;
          fly('money', V3(player.p.root.position.x, 1.6, player.p.root.position.z), (o) => o.set(z.x, 0.3, z.z), 0.25, null);
        }
      } else if (count(player, k) > 0) {
        z.paid[k] = (z.paid[k] || 0) + 1; moved = true;
        giveFrom(player, k, (o) => o.set(z.x, 0.3, z.z), null);
      }
    }
    if (moved) {
      state.paid[id] = z.paid; sfx('drop'); updateZoneLabel(z); updateMoney();
      let done = true; for (const k in z.def.cost) if (left(z, k) > 0) done = false;
      if (done) { delete state.paid[id]; const d = z.def; later.push({ t: 0.3, fn: () => build(d) }); killZone(id); }
    }
  }
}

// ---------- workers ----------
const workers = [];
function makeWorker(role, at) {
  const look = role === 'cashier' ? { body: '#b48cff', hat: 'bun', hatColor: '#7a4fd6', apron: C.white }
    : role === 'farmer' ? { body: '#7fcf6a', hat: 'straw' } : { body: '#5aa9ff', hat: 'cap', hatColor: '#ffd34a', apron: '#ffd34a' };
  const p = K.person(look);
  p.root.position.set(at[0], 0, at[1]); scene.add(p.root); popIn(p.root);
  const w = carrier(p);
  Object.assign(w, { role, state: 'idle', target: null, wait: 0, face: 0, moving: 0 });
  w.cap = () => upVal('wcap');
  workers.push(w);
  return w;
}
function walkTo(w, x, z, dt, speed) {
  const pos = w.p.root.position, dx = x - pos.x, dz = z - pos.z, d = Math.hypot(dx, dz);
  if (d < 0.08) { w.moving = 0; return true; }
  const st = Math.min(d, speed * dt);
  pos.x += dx / d * st; pos.z += dz / d * st;
  w.face = Math.atan2(dx, dz); w.moving = 1;
  return d < 0.1;
}
function turn(p, face, dt) {
  let r = p.root.rotation.y, diff = face - r;
  while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
  p.root.rotation.y = r + diff * Math.min(1, dt * 12);
}
function producersBy(inType) { return Object.values(stations).filter((s) => s.kind === 'producer' && s.def.in === inType); }
function updateWorker(w, dt) {
  const sp = upVal('wspeed');
  w.moving = 0;
  if (w.role === 'cashier') {
    if (walkTo(w, SERVE.x, SERVE.z, dt, sp)) w.face = 0;
  } else if (w.role === 'farmer') {
    const prods = producersBy('hay').filter((s) => s.inN + (s.pend || 0) < s.inMax);
    if (count(w, 'hay') > 0 && (room(w) <= 0 || !tufts.some((t) => t.grown && !t.res) || w.state === 'deliver')) {
      w.state = 'deliver';
      const s = prods.sort((a, b) => a.inN - b.inN)[0];
      if (!s) { w.state = 'idle'; return; }
      if (walkTo(w, s.trough.x - 0.6, s.trough.z + 0.9, dt, sp) || dist2(w.p.root.position, s.trough.x, s.trough.z) < 1.3) {
        w.xfer -= dt;
        if (w.xfer <= 0 && count(w, 'hay') > 0 && s.inN + (s.pend || 0) < s.inMax) {
          w.xfer = 0.12; s.pend = (s.pend || 0) + 1;
          giveFrom(w, 'hay', (o) => o.copy(s.trough).setY(0.4), () => { s.pend--; s.inN = Math.min(s.inMax, s.inN + 1); });
        }
        if (count(w, 'hay') === 0) w.state = 'idle';
      }
    } else if (prods.length && room(w) > 0) {
      w.state = 'harvest';
      if (!w.target || !w.target.grown || w.target.res !== w) {
        if (w.target && w.target.res === w) w.target.res = null;
        let best = null, bd = 1e9;
        for (const t of tufts) if (t.grown && !t.res) { const d = dist2(w.p.root.position, t.x, t.z); if (d < bd) { bd = d; best = t; } }
        w.target = best; if (best) best.res = w;
      }
      const t = w.target;
      if (t && walkTo(w, t.x, t.z + 0.3, dt, sp)) { cutTuft(t, w); w.target = null; }
      if (!t && count(w, 'hay') > 0) w.state = 'deliver';
    } else idleWander(w, dt, -4.5, 3.6);
  } else if (w.role === 'shelver') {
    // collect a full load first, then deliver it
    if (w.carry.length && !w.job && !w.incoming) {
      const type = w.carry[0].type, s = shelfFor(type);
      if (!s) { idleWander(w, dt, 0, -8); return; }
      if (walkTo(w, s.front.x + 0.5, s.front.z, dt, sp) || dist2(w.p.root.position, s.front.x, s.front.z) < 1.2) {
        w.xfer -= dt;
        if (w.xfer <= 0 && s.n + (s.pend || 0) < s.max) {
          w.xfer = 0.12; s.pend = (s.pend || 0) + 1;
          giveFrom(w, type, (o) => o.copy(s.front).setZ(s.front.z - 1.25).setY(0.8), () => { s.pend--; s.n = Math.min(s.max, s.n + 1); });
        }
      }
      return;
    }
    // pick the emptiest shelf whose product is ready somewhere
    if (!w.job) {
      // most-wanted shelf first: waiting customers, then emptiest
      const want = (it) => customers.filter((c) => c.st === 'shop' && c.item === it).length;
      const shelves = Object.values(stations).filter((s) => s.kind === 'shelf' && s.n + (s.pend || 0) < s.max - 1)
        .map((s) => ({ s, k: want(s.item) * 10 - s.n + Math.random() * 2 })).sort((a, b) => b.k - a.k).map((o) => o.s);
      for (const sh of shelves) {
        const src = sourceFor(sh.item);
        if (src) { w.job = { item: sh.item, src }; break; }
      }
    }
    if (!w.job) { idleWander(w, dt, 0.5, -3.5); return; }
    const { src } = w.job;
    if (src.kind === 'producer') {
      if (walkTo(w, src.nest.x + 0.4, src.nest.z + 0.9, dt, sp) || dist2(w.p.root.position, src.nest.x, src.nest.z) < 1.3) {
        w.xfer -= dt;
        if (w.xfer <= 0 && src.outN > 0 && room(w) > 0) { w.xfer = 0.1; src.outN--; takeInto(w, src.def.out, V3(src.nest.x, 0.4, src.nest.z)); }
        if (src.outN <= 0 || room(w) <= 0) w.job = null;
      }
    } else {
      let pl = w.job.plant;
      if (!pl || !pl.ripe) { pl = src.plants.find((q) => q.ripe && (!q.res || q.res === w)); w.job.plant = pl; if (pl) pl.res = w; }
      if (!pl || room(w) <= 0) { if (pl && pl.res === w) pl.res = null; w.job = null; return; }
      if (walkTo(w, pl.x, pl.z + 0.7, dt, sp)) { pickPlant(src, pl, w); w.job.plant = null; }
    }
  }
}
function idleWander(w, dt, cx, cz) {
  w.wait -= dt;
  if (!w.wp || w.wait <= 0) { w.wp = [cx + (Math.random() - 0.5) * 3, cz + (Math.random() - 0.5) * 2]; w.wait = 2 + Math.random() * 2; }
  walkTo(w, w.wp[0], w.wp[1], dt, 1.6);
}
function shelfFor(type) {
  return Object.values(stations).find((s) => s.kind === 'shelf' && s.item === type && s.n + (s.pend || 0) < s.max) || null;
}
function sourceFor(item) {
  for (const s of Object.values(stations)) {
    if (s.kind === 'producer' && s.def.out === item && s.outN > 0) return s;
    if (s.kind === 'crop' && s.def.out === item && s.plants.some((p) => p.ripe && !p.res)) return s;
  }
  return null;
}

// ---------- harvesting helpers ----------
function cutTuft(t, c) {
  if (!t.grown || room(c) <= 0) return false;
  t.grown = false; t.t = 0; t.res = null; t.tall.visible = false;
  puff(t.x, 0.4, t.z, '#cfe86b', 4, 0.6);
  takeInto(c, 'hay', V3(t.x, 0.5, t.z));
  if (c === player) sfx('pop');
  return true;
}
function pickPlant(s, pl, c) {
  if (!pl.ripe || room(c) <= 0) { pl.res = null; return; }
  pl.ripe = false; pl.t = 0; pl.res = null; pl.fruit.visible = false;
  takeInto(c, s.def.out, V3(pl.x, 0.8, pl.z));
  if (c === player) sfx('pop');
}

// ---------- customers ----------
const customers = [];
const QUEUE = (i) => [SERVE.x, -9.15 + i * 0.95];
const ENTRY = [14.2, -3.5], DOOR = [6.5, -6.2];
const CUST_COLS = ['#ff9f43', '#5ec8ff', '#ffd34a', '#ff7eb6', '#9fd86b', '#c69bff', '#ff8a6b', '#6fe3c8'];
let spawnT = 3;
function spawnCustomer() {
  const shelves = Object.values(stations).filter((s) => s.kind === 'shelf');
  if (!shelves.length) return;
  const sh = shelves[Math.floor(Math.random() * shelves.length)];
  const p = K.person({ body: CUST_COLS[Math.floor(Math.random() * CUST_COLS.length)], hat: Math.random() < 0.3 ? 'cap' : (Math.random() < 0.3 ? 'bun' : null), hatColor: CUST_COLS[Math.floor(Math.random() * 8)] });
  p.root.position.set(ENTRY[0], 0, ENTRY[1] + 4); scene.add(p.root);
  const need = 1 + Math.floor(Math.random() * Math.min(4, 1 + shelves.length));
  const c = { p, shelf: sh, item: sh.item, need, got: 0, st: 'in', path: [ENTRY, DOOR, [sh.front.x + (Math.random() - 0.5) * 0.8, sh.front.z + 0.35]], t: 0, face: 0, moving: 0, bag: null };
  c.label = label('bubble', '', (o) => { o.copy(c.p.root.position); o.y = 2.05; });
  customers.push(c);
}
function custTarget(c) { return c.path[0]; }
function updateCustomers(dt) {
  const shelfN = Object.values(stations).filter((s) => s.kind === 'shelf').length;
  if (shelfN) {
    spawnT -= dt * (events.market > 0 ? 2 : 1);
    if (spawnT <= 0 && customers.length < 3 + Math.round(shelfN * 1.5)) { spawnCustomer(); spawnT = Math.max(2.2, 7 - shelfN * 1.1) * (0.7 + Math.random() * 0.6); }
  }
  const served = (stations.cashier && dist2(stations.cashier.worker.p.root.position, SERVE.x, SERVE.z) < 0.6) || dist2(player.p.root.position, SERVE.x, SERVE.z) < 1.3;
  const queue = customers.filter((c) => c.st === 'queue' || c.st === 'toQueue').sort((a, b) => a.qi - b.qi);
  queue.forEach((c, i) => { c.qi = i; });
  for (let i = customers.length - 1; i >= 0; i--) {
    const c = customers[i];
    c.moving = 0;
    if (c.path.length) {
      const [tx, tz] = c.path[0];
      const dx = tx - c.p.root.position.x, dz = tz - c.p.root.position.z, d = Math.hypot(dx, dz);
      if (d < 0.1) c.path.shift();
      else { const s = Math.min(d, 2.6 * dt); c.p.root.position.x += dx / d * s; c.p.root.position.z += dz / d * s; c.face = Math.atan2(dx, dz); c.moving = 1; }
    }
    if (c.st === 'in' && !c.path.length) { c.st = 'shop'; c.face = Math.PI; c.t = 0.4; c.patience = 32; }
    if (c.st === 'shop') {
      c.t -= dt; c.patience -= dt;
      if (c.patience <= 0 && c.got < c.need) {
        // gave up waiting: pay for what they have, or walk out unhappy
        if (c.got > 0) c.need = c.got;
        else { c.st = 'leave'; c.label.show = false; c.path = [DOOR, ENTRY, [ENTRY[0], ENTRY[1] + 14]]; floatText('😞', V3(c.p.root.position.x, 2.2, c.p.root.position.z)); }
      }
      if (c.t <= 0 && c.shelf.n > 0) {
        c.t = 0.4; c.shelf.n--; c.got++;
        fly(c.item, V3(c.shelf.def.pos[0], 0.8, c.shelf.def.pos[1]), (o) => { o.copy(c.p.root.position); o.y = 1.2; }, 0.25, null);
      }
      if (c.st === 'shop' && c.got >= c.need) { c.st = 'toQueue'; c.qi = 99; c.path = [[c.p.root.position.x, -9.3]]; }
    }
    if (c.st === 'toQueue' || c.st === 'queue') {
      const [qx, qz] = QUEUE(c.qi);
      if (!c.path.length) {
        const pos = c.p.root.position, dx = qx - pos.x, dz = qz - pos.z, d = Math.hypot(dx, dz);
        if (d > 0.08) { const s = Math.min(d, 2.6 * dt); pos.x += dx / d * s; pos.z += dz / d * s; c.face = Math.atan2(dx, dz); c.moving = 1; }
        else { c.st = 'queue'; c.face = Math.PI; }
      }
      if (c.st === 'queue' && c.qi === 0) {
        c.t = (c.t > 0 ? c.t : 0) + (served ? dt : 0);
        if (c.t > 0.55) pay(c);
      }
    }
    if (c.st === 'leave' && !c.path.length) { scene.remove(c.p.root); dropLabel(c.label); customers.splice(i, 1); continue; }
    turn(c.p, c.face, dt); c.p.anim(dt, c.moving);
    if (c.st === 'shop' || c.st === 'in') setLabel(c.label, badge(ITEMS[c.item].icon, c.got, c.need));
    else if (c.st === 'leave') c.label.show = false;
    else setLabel(c.label, '<span class="ic">💵</span>');
  }
}
function pay(c) {
  const tip = pets.cat ? 1 : 0;
  const v = c.got * ITEMS[c.item].price + tip;
  pile.value += v; setPile(); sfx('coin');
  floatText('+' + v, V3(PILE.x, 1.6, PILE.z), 'money');
  c.st = 'leave'; c.label.show = false;
  const bag = new THREE.Group(); K.add(bag, K.mesh(G.rbox(0.36, 0.38, 0.24, 0.06), '#f5d9a8'), 0, 0.1, 0); c.p.front.add(bag);
  c.path = [[c.p.root.position.x + 1.6, -8.2], DOOR, ENTRY, [ENTRY[0], ENTRY[1] + 14]];
}

// ---------- pets ----------
const pets = {};
function updatePets(dt, t) {
  if (pets.dog) {
    const d = pets.dog, pp = player.p.root.position, back = V3(pp.x - Math.sin(pFace) * 1.2 + 0.6, 0, pp.z - Math.cos(pFace) * 1.2);
    const dx = back.x - d.g.position.x, dz = back.z - d.g.position.z, dd = Math.hypot(dx, dz);
    const mv = dd > 0.3 ? Math.min(dd, (dd > 3 ? 9 : 5.5) * dt) : 0;
    if (mv) { d.g.position.x += dx / dd * mv; d.g.position.z += dz / dd * mv; d.g.rotation.y = Math.atan2(dx, dz); }
    d.ph += dt * (mv ? 14 : 4);
    d.b.position.y = mv ? Math.abs(Math.sin(d.ph)) * 0.08 : 0;
    d.tail.rotation.z = Math.sin(t * 12) * 0.5;
  }
  if (pets.cat) { pets.cat.tail.rotation.z = Math.sin(t * 2.5) * 0.4; pets.cat.b.scale.y = 1 + Math.sin(t * 2) * 0.02; }
}

// ---------- truck orders & events ----------
const truck = { ready: false, st: 'away', t: 25, g: null, order: null, label: null, z: -40 };
const DOCK = { x: 14.6, z: 6, drop: [12.9, 6] };
function updateTruck(dt) {
  if (!truck.ready) return;
  if (!truck.g) {
    const tr = P.truck(); truck.g = tr.g; truck.bed = tr.bed; truck.g.position.set(DOCK.x, 0, -45); scene.add(truck.g); truck.g.visible = false;
    truck.label = label('zone order', '', (o) => o.set(DOCK.drop[0], 0.4, DOCK.drop[1] + 0.2)); truck.label.show = false;
  }
  truck.t -= dt;
  if (truck.st === 'away' && truck.t <= 0) {
    const items = Object.values(stations).filter((s) => s.kind === 'shelf').map((s) => s.item);
    const order = {};
    const n = Math.min(items.length, 1 + Math.floor(Math.random() * 2));
    for (let i = 0; i < n; i++) { const it = items[Math.floor(Math.random() * items.length)]; order[it] = (order[it] || 0) + 3 + Math.floor(Math.random() * 5); }
    truck.order = order; truck.st = 'come'; truck.g.visible = true; truck.g.position.z = -45; truck.g.rotation.y = 0;
  }
  if (truck.st === 'come') {
    truck.g.position.z += Math.min(DOCK.z - truck.g.position.z, 12 * dt);
    if (DOCK.z - truck.g.position.z < 0.05) { truck.st = 'wait'; truck.t = 90; truck.label.show = true; toast('🚚 訂單卡車到了！'); }
  }
  if (truck.st === 'wait') {
    let rows = '', done = true;
    for (const k in truck.order) { if (truck.order[k] > 0) { done = false; rows += '<div class="cost"><span class="ic">' + ITEMS[k].icon + '</span>' + truck.order[k] + '</div>'; } }
    setLabel(truck.label, '<div class="zn">訂單 ' + Math.ceil(truck.t) + '秒</div>' + rows);
    if (dist2(player.p.root.position, DOCK.drop[0], DOCK.drop[1]) < 1.5) {
      truck.xfer = (truck.xfer || 0) - dt;
      if (truck.xfer <= 0) for (const k in truck.order) if (truck.order[k] > 0 && count(player, k) > 0) {
        truck.order[k]--; truck.xfer = 0.08; sfx('drop');
        giveFrom(player, k, (o) => { truck.bed.getWorldPosition(o); o.y += 0.2; }, null); break;
      }
    }
    if (done) {
      const bonus = Math.round(truck.value || 0);
      pile.value += bonus; setPile(); floatText('+' + bonus, V3(PILE.x, 1.6, PILE.z), 'money'); sfx('unlock'); toast('訂單完成！獎金 💵' + bonus);
      truck.st = 'leave'; truck.label.show = false;
    } else if (truck.t <= 0) { truck.st = 'leave'; truck.label.show = false; toast('卡車開走了…'); }
  }
  if (truck.st === 'come' && !truck.value) {
    truck.value = 0; for (const k in truck.order) truck.value += truck.order[k] * ITEMS[k].price * 3;
  }
  if (truck.st === 'leave') {
    truck.g.position.z += 12 * dt;
    if (truck.g.position.z > 45) { truck.st = 'away'; truck.t = 60 + Math.random() * 40; truck.g.visible = false; truck.value = 0; }
  }
}
const events = { market: 0, rain: 0, next: 90 };
let rainObj = null;
function updateEvents(dt) {
  events.market = Math.max(0, events.market - dt);
  events.rain = Math.max(0, events.rain - dt);
  if (isBuilt('corn')) {
    events.next -= dt;
    if (events.next <= 0) {
      events.next = 100 + Math.random() * 60;
      if (Math.random() < 0.5 && isBuilt('shelfCorn')) { events.market = 40; toast('🎪 市集日！客人變多了'); }
      else { events.rain = 30; toast('🌧️ 下雨了，作物長得更快'); }
    }
  }
  if (events.rain > 0 && !rainObj) {
    const n = 220, pos = new Float32Array(n * 6);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    rainObj = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55 }));
    rainObj.userData.d = Array.from({ length: n }, () => [Math.random() * 30 - 15, Math.random() * 14, Math.random() * 30 - 15]);
    scene.add(rainObj);
  }
  if (rainObj) {
    const pp = player.p.root.position, a = rainObj.geometry.attributes.position.array;
    rainObj.userData.d.forEach((d, i) => {
      d[1] -= dt * 18; if (d[1] < 0) d[1] += 14;
      a.set([pp.x + d[0], d[1], pp.z + d[2], pp.x + d[0] - 0.1, d[1] + 0.5, pp.z + d[2]], i * 6);
    });
    rainObj.geometry.attributes.position.needsUpdate = true;
    if (events.rain <= 0) { scene.remove(rainObj); rainObj = null; }
  }
}
let toastT = 0;
function toast(msg) { const el = $('toast'); el.textContent = msg; el.classList.add('on'); toastT = 2.6; }

// ---------- guide arrow ----------
const guide = new THREE.Group();
K.add(guide, K.mesh(G.cone(0.32, 0.55, 12), '#ffde59'), 0, 0, 0).rotation.x = Math.PI;
K.add(guide, K.mesh(G.cyl(0.13, 0.13, 0.45, 10), '#ffde59'), 0, 0.45, 0);
scene.add(guide);
const pointer = new THREE.Mesh(G.cone(0.28, 0.6, 3), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85 }));
pointer.rotation.x = -Math.PI / 2; const pointerG = new THREE.Group(); pointerG.add(pointer); pointer.position.z = 1.5; scene.add(pointerG);
function guideTarget() {
  const pp = player.p.root.position;
  const waiting = customers.some((c) => c.st === 'queue' && c.qi === 0);
  if (waiting && !stations.cashier && dist2(pp, SERVE.x, SERVE.z) > 1.3 && state.built.length < 6) return [SERVE.x, SERVE.z];
  if (pile.value > 0 && state.built.length < 5 && dist2(pp, PILE.x, PILE.z) > 1.5 && !Object.values(zones).some((z) => affordable(z))) return [PILE.x, PILE.z];
  const next = DEFS.find((d) => zones[d.id]);
  if (!next) return null;
  const z = zones[next.id];
  if (affordable(z)) return [z.x, z.z];
  if (!isBuilt('coop') && count(player, 'hay') < left(z, 'hay')) { const t = nearest(tufts.filter((q) => q.grown)); return t ? [t.x, t.z] : null; }
  if (next.cost.wood && left(z, 'wood') > count(player, 'wood') && state.built.length < 4) { const t = nearest(trees.filter((q) => !q.dead)); return t ? [t.x + 1, t.z] : null; }
  if (!isBuilt('shelfTomato') && isBuilt('shelfEgg')) {
    const coop = stations.coop;
    if (coop && coop.outN > 2 && count(player, 'egg') === 0 && room(player) > 0) return [coop.nest.x, coop.nest.z];
    if (count(player, 'egg') > 0) return [stations.shelfEgg.front.x, stations.shelfEgg.front.z];
    if (coop && coop.inN < 3) return count(player, 'hay') ? [coop.trough.x, coop.trough.z] : [tufts[12].x, tufts[12].z];
  }
  return null;
}
function nearest(list) {
  const pp = player.p.root.position; let best = null, bd = 1e9;
  for (const q of list) { const d = dist2(pp, q.x, q.z); if (d < bd) { bd = d; best = q; } }
  return best;
}
function affordable(z) {
  for (const k in z.def.cost) { const l = left(z, k); if (l <= 0) continue; if (k === 'money' ? state.money < l : count(player, k) < l) return false; }
  return true;
}

// ---------- UI ----------
let shownMoney = -1;
function updateMoney() { if (shownMoney !== state.money) { shownMoney = state.money; $('moneyN').textContent = state.money; } }
function openPanel(kind) {
  const P0 = $('panel'), body = $('pBody');
  P0.classList.remove('hidden');
  $('pTabs').innerHTML = ''; body.innerHTML = '';
  if (kind === 'up') {
    $('pTitle').textContent = '升級';
    const tabs = ['角色', '員工', '動物'];
    const show = (ti) => {
      [...$('pTabs').children].forEach((b, i) => b.classList.toggle('on', i === ti));
      body.innerHTML = '';
      const anyHire = workers.length > 0;
      if (ti === 1 && !anyHire) { body.innerHTML = '<div class="empty">解鎖第一位員工後開放</div>'; return; }
      for (const k in UPS) {
        const u = UPS[k]; if (u.tab !== ti) continue;
        if (u.need && !isBuilt(u.need)) { body.insertAdjacentHTML('beforeend', '<div class="row locked"><span class="ricon">' + u.icon + '</span><div class="rmid"><b>？？？</b><small>解鎖' + DEF[u.need].name + '後開放</small></div></div>'); continue; }
        const lv = state.up[k], max = lv >= u.cost.length;
        const row = document.createElement('div'); row.className = 'row';
        row.innerHTML = '<span class="ricon">' + u.icon + '</span><div class="rmid"><b>' + u.name + '</b><small>等級 ' + (lv + 1) + ' · ' + u.fmt(u.vals[lv]) + (max ? '' : ' → ' + u.fmt(u.vals[lv + 1])) + '</small><div class="pips">' + u.vals.map((_, i) => '<i class="' + (i <= lv ? 'on' : '') + '"></i>').join('') + '</div></div>';
        const b = document.createElement('button'); b.className = 'buy' + (max ? ' max' : (state.money < u.cost[lv] ? ' poor' : ''));
        b.innerHTML = max ? '已滿級' : '💵 ' + u.cost[lv];
        b.onclick = () => {
          if (max || state.money < u.cost[lv]) { sfx('drop'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 300); return; }
          state.money -= u.cost[lv]; state.up[k]++; sfx('buy'); updateMoney(); save(); show(ti);
        };
        row.appendChild(b); body.appendChild(row);
      }
    };
    tabs.forEach((t, i) => { const b = document.createElement('button'); b.textContent = t; b.onclick = () => show(i); $('pTabs').appendChild(b); });
    show(0);
  } else if (kind === 'inv') {
    $('pTitle').textContent = '倉庫';
    const carry = {}; for (const it of player.carry) carry[it.type] = (carry[it.type] || 0) + 1;
    let h = '<div class="sec">背包 ' + player.carry.length + '/' + player.cap() + '</div><div class="chips">';
    h += Object.keys(carry).length ? Object.keys(carry).map((k) => '<span class="chip">' + ITEMS[k].icon + ' ' + carry[k] + '</span>').join('') : '<span class="empty">空空的</span>';
    h += '</div><div class="sec">貨架</div><div class="chips">';
    const sh = Object.values(stations).filter((s) => s.kind === 'shelf');
    h += sh.length ? sh.map((s) => '<span class="chip">' + ITEMS[s.item].icon + ' ' + s.n + '/' + s.max + '</span>').join('') : '<span class="empty">還沒有貨架</span>';
    h += '</div><div class="sec">農場</div><div class="chips">';
    for (const s of Object.values(stations)) if (s.kind === 'producer') h += '<span class="chip">' + s.def.name + ' 🌾' + s.inN + ' · ' + ITEMS[s.def.out].icon + s.outN + '</span>';
    h += '<span class="chip">收銀台 💵' + pile.value + '</span></div>';
    body.innerHTML = h;
  } else if (kind === 'set') {
    $('pTitle').textContent = '設定';
    body.innerHTML = '<div class="row"><span class="ricon">🔊</span><div class="rmid"><b>聲音</b></div><button class="buy" id="sSnd">' + (state.sound ? '開' : '關') + '</button></div>' +
      '<div class="row"><span class="ricon">🔄</span><div class="rmid"><b>重新開始</b><small>清除所有進度</small></div><button class="buy poor" id="sReset">重來</button></div>';
    $('sSnd').onclick = () => { state.sound = !state.sound; save(); openPanel('set'); };
    let armed = false;
    $('sReset').onclick = (e) => {
      if (!armed) { armed = true; e.target.textContent = '確定？'; return; }
      localStorage.removeItem(SAVE); location.reload();
    };
  }
}
$('pClose').onclick = () => $('panel').classList.add('hidden');
$('panel').addEventListener('pointerdown', (e) => { if (e.target === $('panel')) $('panel').classList.add('hidden'); });
$('bUp').onclick = () => openPanel('up');
$('bInv').onclick = () => openPanel('inv');
$('bSet').onclick = () => openPanel('set');

// ---------- per-frame interactions for the player ----------
function playerInteract(dt) {
  const pp = player.p.root.position;
  // grass
  for (const t of tufts) if (t.grown && !t.res && dist2(pp, t.x, t.z) < 0.8) cutTuft(t, player);
  // crops
  for (const s of Object.values(stations)) if (s.kind === 'crop') for (const pl of s.plants) if (pl.ripe && !pl.res && dist2(pp, pl.x, pl.z) < 1.0) pickPlant(s, pl, player);
  // trees
  let chopping = false;
  for (const tr of trees) {
    if (tr.dead || dist2(pp, tr.x, tr.z) > 1.55 || room(player) <= 0) continue;
    chopping = true;
    tr.chop = (tr.chop || 0) + dt;
    pFace = Math.atan2(tr.x - pp.x, tr.z - pp.z);
    if (tr.chop > 0.42) {
      tr.chop = 0; tr.hp--; tr.shake = 1; sfx('chop');
      puff(tr.x, 0.9, tr.z, C.woodLight, 3, 0.6);
      takeInto(player, 'wood', V3(tr.x, 0.9, tr.z));
      if (tr.hp <= 0) { tr.dead = true; tr.t = 0; tr.trunk.visible = false; tr.crown.visible = false; tr.stump.visible = true; puff(tr.x, 1.4, tr.z, '#6fcd5f', 10, 1.4); }
    }
    break;
  }
  axe.visible = chopping;
  axe.rotation.x = chopping ? -1.2 + Math.sin(performance.now() / 70) * 0.9 : 0;
  // stations
  player.xfer -= dt;
  for (const s of Object.values(stations)) {
    if (s.kind === 'producer') {
      if (player.xfer <= 0 && dist2(pp, s.trough.x, s.trough.z) < 1.5 && count(player, 'hay') > 0 && s.inN + (s.pend || 0) < s.inMax) {
        player.xfer = 0.08; s.pend = (s.pend || 0) + 1; sfx('drop');
        giveFrom(player, 'hay', (o) => o.copy(s.trough).setY(0.4), () => { s.pend--; s.inN = Math.min(s.inMax, s.inN + 1); });
      }
      if (player.xfer <= 0 && dist2(pp, s.nest.x, s.nest.z) < 1.5 && s.outN > 0 && room(player) > 0) {
        player.xfer = 0.08; s.outN--; sfx('pop'); takeInto(player, s.def.out, V3(s.nest.x, 0.4, s.nest.z));
      }
    } else if (s.kind === 'shelf') {
      if (player.xfer <= 0 && dist2(pp, s.front.x, s.front.z - 0.6) < 1.7 && count(player, s.item) > 0 && s.n + (s.pend || 0) < s.max) {
        player.xfer = 0.08; s.pend = (s.pend || 0) + 1; sfx('drop');
        giveFrom(player, s.item, (o) => o.set(s.def.pos[0], 0.9, s.def.pos[1]), () => { s.pend--; s.n = Math.min(s.max, s.n + 1); });
      }
    }
  }
  // cash pile (the dog pulls it in from further away)
  const reach = pets.dog ? 1.6 + upVal('dogR') : 1.6;
  if (pile.value > 0 && dist2(pp, PILE.x, PILE.z) < reach) {
    pile.tick = (pile.tick || 0) - dt;
    if (pile.tick <= 0) {
      pile.tick = 0.04;
      const chunk = Math.max(1, Math.ceil(pile.value / 12));
      pile.value -= chunk; setPile();
      fly('money', V3(PILE.x, 0.4, PILE.z), (o) => { o.copy(player.p.root.position); o.y = 1.6; }, 0.22, () => { state.money += chunk; updateMoney(); sfx('coin'); });
    }
  }
}

// ---------- simulation ----------
function updateWorld(dt, t) {
  for (const tf of tufts) if (!tf.grown) {
    tf.t += dt;
    if (tf.t > 7) { tf.grown = true; tf.tall.visible = true; tf.tall.scale.setScalar(0.01); pops.push({ obj: tf.tall, t: 0 }); }
  }
  for (const tr of trees) {
    if (tr.shake > 0) { tr.shake = Math.max(0, tr.shake - dt * 4); tr.crown.rotation.z = Math.sin(tr.shake * 20) * 0.08 * tr.shake; }
    if (tr.dead) { tr.t += dt; if (tr.t > 14) { tr.dead = false; tr.hp = 3; tr.trunk.visible = true; tr.crown.visible = true; tr.stump.visible = false; tr.g.scale.setScalar(0.01); pops.push({ obj: tr.g, t: 0 }); } }
  }
  for (const s of Object.values(stations)) {
    if (s.kind === 'producer') {
      const iv = s.def.out === 'milk' ? upVal('barn') : upVal('coop');
      if (s.inN > 0 && s.outN < s.outMax) {
        s.timer += dt;
        if (s.timer >= iv) { s.timer = 0; s.inN--; s.outN++; puff(s.nest.x, 0.5, s.nest.z, '#fff4c9', 3, 0.4); }
      }
      s.inVis.forEach((m, i) => { m.visible = i < s.inN; });
      s.outVis.forEach((m, i) => { m.visible = i < s.outN; });
      setLabel(s.inLabel, badge('🌾', s.inN, s.inMax)); setLabel(s.outLabel, badge(ITEMS[s.def.out].icon, s.outN, s.outMax));
      for (const a of s.animals) {
        a.t -= dt;
        if (a.t <= 0) { a.t = 1.5 + Math.random() * 3; a.tx = a.home[0] + (Math.random() - 0.5) * 2 * a.rx; a.tz = a.home[1] + (Math.random() - 0.5) * 2 * a.rz; }
        const dx = a.tx - a.g.position.x, dz = a.tz - a.g.position.z, d = Math.hypot(dx, dz);
        if (d > 0.05) { const st = Math.min(d, 0.7 * dt); a.g.position.x += dx / d * st; a.g.position.z += dz / d * st; a.g.rotation.y = Math.atan2(dx, dz); a.b.position.y = Math.abs(Math.sin(t * 12)) * 0.04; }
        else { a.b.rotation.x = s.inN > 0 ? Math.max(0, Math.sin(t * 3 + a.home[0])) * 0.3 : 0; a.b.position.y = 0; }
      }
    } else if (s.kind === 'crop') {
      const k = events.rain > 0 ? 2 : 1;
      for (const pl of s.plants) {
        if (!pl.ripe) {
          pl.t += dt * k;
          pl.fruit.visible = pl.t > s.grow * 0.35;
          pl.fruit.scale.setScalar(Math.min(1, pl.t / s.grow));
          if (pl.t >= s.grow) { pl.ripe = true; pl.fruit.scale.setScalar(1); pops.push({ obj: pl.fruit, t: 0.5 }); }
        }
      }
    } else if (s.kind === 'shelf') {
      s.vis.forEach((m, i) => { m.visible = i < s.n; });
      setLabel(s.label, badge(ITEMS[s.item].icon, s.n, s.max));
    }
  }
}

function movePlayer(dt) {
  const j = joy.read();
  const sp = upVal('speed');
  const tvx = j.x * sp, tvz = j.y * sp;
  pVel.x += (tvx - pVel.x) * Math.min(1, dt * 14); pVel.z += (tvz - pVel.z) * Math.min(1, dt * 14);
  const pos = player.p.root.position;
  pos.x += pVel.x * dt; pos.z += pVel.z * dt;
  // push out of solid things
  const r = 0.42;
  for (const b of colliders) {
    const cx = Math.max(b.x0, Math.min(pos.x, b.x1)), cz = Math.max(b.z0, Math.min(pos.z, b.z1));
    const dx = pos.x - cx, dz = pos.z - cz, d = Math.hypot(dx, dz);
    if (d < r) {
      if (d > 1e-4) { pos.x = cx + dx / d * r; pos.z = cz + dz / d * r; }
      else { const ex = Math.min(pos.x - b.x0, b.x1 - pos.x), ez = Math.min(pos.z - b.z0, b.z1 - pos.z); if (ex < ez) pos.x = pos.x - b.x0 < b.x1 - pos.x ? b.x0 - r : b.x1 + r; else pos.z = pos.z - b.z0 < b.z1 - pos.z ? b.z0 - r : b.z1 + r; }
    }
  }
  pos.x = Math.max(-16.4, Math.min(12.8, pos.x)); pos.z = Math.max(-17, Math.min(13.8, pos.z));
  const spd = Math.hypot(pVel.x, pVel.z);
  if (spd > 0.3) pFace = Math.atan2(pVel.x, pVel.z);
  turn(player.p, pFace, dt);
  player.p.anim(dt, Math.min(1, spd / 4));
  player.p.back.rotation.x = -Math.min(0.25, spd * 0.03);
}

// ---------- camera ----------
const camPos = new THREE.Vector3();
let camDist = 20;
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < h ? 50 : 36;
  const hf = Math.atan(Math.tan(camera.fov * Math.PI / 360) * camera.aspect);
  camDist = w < h ? Math.min(24, Math.max(16, 5.4 / Math.tan(hf))) : Math.max(22, Math.min(28, 22 * 1280 / Math.max(900, w) + 4));
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
function updateCamera(dt, snap) {
  const pp = player.p.root.position;
  const tx = pp.x, tz = pp.z + camDist * 0.6, ty = camDist * 0.8;
  if (snap) camPos.set(tx, ty, tz); else camPos.lerp(V3(tx, ty, tz), Math.min(1, dt * 6));
  camera.position.copy(camPos);
  camera.lookAt(camPos.x, 0, camPos.z - camDist * 0.6);
  lights.follow(pp.x, pp.z);
}

// ---------- boot ----------
buildWorld();
buildField();
buildTrees();
buildCounterArea();
for (const def of DEFS) if (isBuilt(def.id)) build(def, true);
pile.value = state.stock.pile || 0; setPile();
refreshZones();
resize(); updateCamera(0, true); updateMoney();

let last = performance.now(), saveT = 0, T = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
  step(dt);
  updateCamera(dt);
  renderer.render(scene, camera);
  placeLabels();
  saveT += dt; if (saveT > 4) { saveT = 0; save(); }
}
function step(dt) {
  T += dt;
  for (let i = later.length - 1; i >= 0; i--) { later[i].t -= dt; if (later[i].t <= 0) { const f = later[i].fn; later.splice(i, 1); f(); } }
  movePlayer(dt);
  playerInteract(dt);
  payZones(dt);
  updateWorld(dt, T);
  for (const w of workers) { updateWorker(w, dt); turn(w.p, w.face, dt); w.p.anim(dt, w.moving); }
  updateCustomers(dt);
  updatePets(dt, T);
  updateTruck(dt);
  updateEvents(dt);
  // flyers
  for (let i = flyers.length - 1; i >= 0; i--) {
    const f = flyers[i]; f.t += dt / f.dur;
    const to = tmpV.set(0, 0, 0); f.toFn(to);
    const k = Math.min(1, f.t);
    f.m.position.lerpVectors(f.from, to, k); f.m.position.y += Math.sin(k * Math.PI) * 1.1;
    f.m.rotation.y += dt * 8;
    if (f.t >= 1) { scene.remove(f.m); flyers.splice(i, 1); if (f.done) f.done(); }
  }
  for (let i = puffs.length - 1; i >= 0; i--) {
    const p = puffs[i]; p.t += dt;
    p.vy -= 9 * dt; p.m.position.x += p.vx * dt; p.m.position.y = Math.max(0.05, p.m.position.y + p.vy * dt); p.m.position.z += p.vz * dt;
    p.m.scale.setScalar(Math.max(0.01, 1 - p.t / p.life));
    if (p.t >= p.life) { scene.remove(p.m); puffs.splice(i, 1); }
  }
  for (let i = pops.length - 1; i >= 0; i--) {
    const p = pops[i]; p.t += dt / 0.45;
    p.obj.scale.setScalar(Math.max(0.01, easeBack(Math.min(1, p.t))));
    if (p.t >= 1) { p.obj.scale.setScalar(1); pops.splice(i, 1); }
  }
  for (const id in zones) { const z = zones[id]; z.g.children[0].material.opacity = 0.75 + Math.sin(T * 4) * 0.25; }
  // guide
  const gt = guideTarget();
  guide.visible = !!gt;
  if (gt) { guide.position.set(gt[0], 2.2 + Math.abs(Math.sin(T * 4)) * 0.45, gt[1]); guide.rotation.y += dt * 2; }
  const pp = player.p.root.position;
  pointerG.visible = !!gt && dist2(pp, gt[0], gt[1]) > 5;
  if (gt) { pointerG.position.set(pp.x, 0.05, pp.z); pointerG.rotation.y = Math.atan2(gt[0] - pp.x, gt[1] - pp.z); }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('on'); }
}
requestAnimationFrame(frame);
addEventListener('visibilitychange', () => { if (document.hidden) save(); });
addEventListener('pagehide', save);

// test hooks
window.__farm = {
  state, stations, player, zones, customers, workers, truck, events, DEFS,
  give(type, n) { for (let i = 0; i < n && room(player) > 0; i++) stackAdd(player, type); },
  cash(n) { state.money += n; updateMoney(); },
  tp(x, z) { player.p.root.position.set(x, 0, z); updateCamera(0, true); },
  build(id) { if (zones[id]) killZone(id); build(DEF[id]); },
  sim(sec) { for (let i = 0; i < sec * 30; i++) step(1 / 30); },
  guide, guideTarget,
  pile,
};
