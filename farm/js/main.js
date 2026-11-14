// 開心農場鋪 v2 — walk, carry, unlock, hire, automate. Original game, art from the shared style kit.
import * as THREE from 'three';
import * as K from './kit.js';
import * as P from './props.js';
import * as P2 from './props2.js';
import { Joystick } from './input.js';

const { C, G } = K;
const ITEMS = P.ITEMS;
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const dist2 = (a, x, z) => Math.hypot(a.x - x, a.z - z);
const easeBack = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------- the long unlock chain (each opens after the previous one) ----------
const SH_Z = -14.6;
const DEFS = [
  { id: 'tomato', name: '番茄田', kind: 'crop', out: 'tomato', plant: 'tomato', grow: 6, pos: [8.2, 1.2], cost: { money: 30 }, req: [] },
  { id: 'coop', name: '雞舍', kind: 'producer', in: 'hay', out: 'egg', pos: [2, 1], cost: { money: 40 }, req: [] },
  { id: 'shelfTomato', name: '番茄架', kind: 'shelf', item: 'tomato', pos: [-1.6, SH_Z], cost: { money: 20 }, req: ['tomato'] },
  { id: 'shelfEgg', name: '雞蛋架', kind: 'shelf', item: 'egg', pos: [-4.6, SH_Z], cost: { money: 10 }, req: ['coop'] },
  { id: 'cashier', name: '收銀員', kind: 'hire', role: 'cashier', counter: 0, zone: [6.6, -12.6], cost: { money: 80 }, any: ['shelfTomato', 'shelfEgg'] },
  { id: 'corn', name: '玉米田', kind: 'crop', out: 'corn', plant: 'corn', grow: 8, pos: [9, 6.8], cost: { money: 160, wood: 10 }, req: ['cashier'] },
  { id: 'shelfCorn', name: '玉米架', kind: 'shelf', item: 'corn', pos: [1.4, SH_Z], cost: { money: 130 }, req: ['corn'] },
  { id: 'farmer', name: '農夫', kind: 'hire', role: 'farmer', zone: [-2, 1.6], cost: { money: 120 }, req: ['shelfCorn', 'coop'] },
  { id: 'dog', name: '小狗', kind: 'pet', zone: [-1, -4.6], cost: { money: 200, wood: 12 }, req: ['shelfCorn'] },
  { id: 'shelver', name: '理貨員', kind: 'hire', role: 'shelver', zone: [1.6, -5], cost: { money: 250 }, req: ['dog'] },
  { id: 'warehouse', name: '倉庫', kind: 'store', pos: [10.6, -14.2], zone: [10.6, -10.8], cost: { money: 350, wood: 20 }, req: ['shelver'] },
  { id: 'sprinkler', name: '自動灑水器', kind: 'sprinkler', zone: [11.6, 4], cost: { money: 320, wood: 15 } },
  { id: 'barn', name: '牛棚', kind: 'producer', in: 'hay', out: 'milk', pos: [-4.5, 10.2], cost: { money: 420, hay: 20, wood: 18 } },
  { id: 'shelfMilk', name: '牛奶雪櫃', kind: 'shelf', fridge: true, item: 'milk', pos: [4.4, SH_Z], cost: { money: 300 } },
  { id: 'market', name: '超級市場', kind: 'market', zone: [-12, -10], cost: { money: 1500, wood: 40 } },
  { id: 'juicer', name: '果汁機', kind: 'machine', mk: 'juicer', in: 'tomato', out: 'juice', iv: 3, pos: [5.5, -2.7], cost: { money: 700, wood: 20 } },
  { id: 'shelfJuice', name: '果汁雪櫃', kind: 'shelf', fridge: true, item: 'juice', pos: [-8.6, SH_Z], cost: { money: 500 } },
  { id: 'shelver2', name: '理貨員', kind: 'hire', role: 'shelver', zone: [-4.4, -5], cost: { money: 800 } },
  { id: 'soy', name: '黃豆田', kind: 'crop', out: 'soybean', plant: 'soy', grow: 9, pos: [-9.5, 18.5], cost: { money: 900, wood: 25 } },
  { id: 'soyMachine', name: '磨豆漿機', kind: 'machine', mk: 'soy', in: 'soybean', out: 'soymilk', iv: 3.5, pos: [-3, 18.6], cost: { money: 1100 } },
  { id: 'shelfSoy', name: '豆漿雪櫃', kind: 'shelf', fridge: true, item: 'soymilk', pos: [-11.6, SH_Z], cost: { money: 800 } },
  { id: 'dock', name: '貨運站', kind: 'dock', pos: [12.2, 6], zone: [12, 6], cost: { money: 1200, wood: 30 } },
  { id: 'counter2', name: '第二收銀台', kind: 'counter2', zone: [-16.5, -9.6], cost: { money: 1000 } },
  { id: 'cashier2', name: '收銀員', kind: 'hire', role: 'cashier', counter: 1, zone: [-18.4, -12.8], cost: { money: 1300 } },
  { id: 'cat', name: '小貓', kind: 'pet', zone: [2.6, -11.6], cost: { money: 1000 } },
  { id: 'parking', name: '停車場', kind: 'parking', zone: [21, -10], cost: { money: 2600, wood: 60 } },
  { id: 'wheat', name: '小麥田', kind: 'crop', out: 'wheat', plant: 'wheat', grow: 10, pos: [-9.5, 24.5], cost: { money: 2200 } },
  { id: 'oven', name: '麵包窯', kind: 'machine', mk: 'oven', in: 'wheat', out: 'bread', iv: 4, pos: [-3, 24.6], cost: { money: 3000, wood: 50 } },
  { id: 'shelfBread', name: '麵包架', kind: 'shelf', item: 'bread', pos: [-14.6, SH_Z], cost: { money: 2200 } },
  { id: 'farmer2', name: '農夫', kind: 'hire', role: 'farmer', zone: [-2, 14.6], cost: { money: 2400 } },
  { id: 'coop2', name: '第二雞舍', kind: 'producer', in: 'hay', out: 'egg', pos: [2, 7.4], cost: { money: 2600, wood: 40 } },
  { id: 'cheese', name: '起司坊', kind: 'machine', mk: 'cheese', in: 'milk', out: 'cheese', iv: 4.5, pos: [3.4, 12.8], cost: { money: 3800 } },
  { id: 'shelfCheese', name: '起司雪櫃', kind: 'shelf', fridge: true, item: 'cheese', pos: [-17.6, SH_Z], cost: { money: 2800 } },
  { id: 'shelver3', name: '理貨員', kind: 'hire', role: 'shelver', zone: [-8.6, -5], cost: { money: 3500 } },
  { id: 'orchard', name: '蘋果園', kind: 'crop', out: 'apple', plant: 'apple', grow: 12, pos: [8.5, 23.5], cost: { money: 4500, wood: 70 } },
  { id: 'shelfApple', name: '蘋果架', kind: 'shelf', item: 'apple', pos: [-11.6, -10.6], cost: { money: 3200 } },
  { id: 'helipad', name: '停機坪', kind: 'helipad', zone: [23.5, 6], cost: { money: 9000, wood: 120 } },
  { id: 'shelver4', name: '理貨員', kind: 'hire', role: 'shelver', zone: [-12.6, -5], cost: { money: 7000 } },
];
const DEF = Object.fromEntries(DEFS.map((d) => [d.id, d]));

const lv = (n, base, k) => Array.from({ length: n }, (_, i) => Math.round(base * Math.pow(k, i) / 10) * 10);
const UPS = {
  cap: { tab: 0, name: '背包容量', ic: 'hay', vals: [6, 10, 14, 18, 24, 30, 36, 44, 52], cost: [30, 80, 150, 260, 420, 700, 1100, 1700], fmt: (v) => v + ' 個' },
  speed: { tab: 0, name: '移動速度', ic: 'run', vals: [4.4, 5, 5.5, 6, 6.5, 7, 7.5], cost: [40, 100, 200, 380, 650, 1000], fmt: (v) => v.toFixed(1) },
  wcap: { tab: 1, name: '員工一次拿多少', ic: 'egg', vals: [4, 6, 8, 11, 15, 20, 26], cost: [100, 220, 450, 800, 1400, 2400], fmt: (v) => v + ' 個' },
  wspeed: { tab: 1, name: '員工速度', ic: 'run', vals: [3.4, 3.9, 4.4, 5, 5.6, 6.2, 6.8], cost: [100, 220, 450, 800, 1400, 2400], fmt: (v) => v.toFixed(1) },
  coop: { tab: 2, name: '雞生蛋速度', ic: 'egg', need: 'coop', vals: [3, 2.5, 2, 1.6, 1.3, 1.0], cost: [60, 160, 350, 700, 1300], fmt: (v) => v + ' 秒一顆' },
  barn: { tab: 2, name: '牛奶速度', ic: 'milk', need: 'barn', vals: [5, 4.2, 3.4, 2.7, 2.1, 1.6], cost: [150, 350, 700, 1300, 2400], fmt: (v) => v + ' 秒一瓶' },
  grow: { tab: 2, name: '作物生長速度', ic: 'tomato', need: 'tomato', vals: [1, 1.25, 1.5, 1.8, 2.2, 2.6], cost: [120, 300, 650, 1200, 2200], fmt: (v) => '×' + v },
  dogR: { tab: 2, name: '小狗吸錢範圍', ic: 'money', need: 'dog', vals: [3, 5, 7, 9], cost: [150, 400, 900], fmt: (v) => v + ' 格' },
  price: { tab: 3, name: '商品售價', ic: 'money', need: 'cashier', vals: [1, 1.1, 1.2, 1.3, 1.4, 1.55, 1.7, 1.85, 2, 2.2, 2.4], cost: lv(10, 200, 1.6), fmt: (v) => '×' + v },
  shelfCap: { tab: 3, name: '貨架容量', ic: 'egg', need: 'cashier', vals: [8, 12, 16, 20, 24], cost: [150, 400, 900, 1800], fmt: (v) => v + ' 個' },
  cust: { tab: 3, name: '客人數量', ic: 'run', need: 'cashier', vals: [1, 1.2, 1.4, 1.6, 1.8, 2], cost: [300, 700, 1400, 2600, 4500], fmt: (v) => '×' + v },
  mach: { tab: 3, name: '機器速度', ic: 'juice', need: 'juicer', vals: [1, 1.25, 1.5, 1.8, 2.2, 2.6], cost: [400, 900, 1800, 3200, 5500], fmt: (v) => '×' + v },
  autoCash: { tab: 3, name: '自動收款', ic: 'money', need: 'cashier2', vals: [0, 1], cost: [6000], fmt: (v) => v ? '錢自動入袋' : '要自己收錢' },
};
const upVal = (k) => UPS[k].vals[state.up[k] || 0];

// ---------- save ----------
const SAVE = 'farm_save_v2';
const state = { money: 50, built: [], paid: {}, up: {}, stock: {}, store: {}, piles: [0, 0], sound: true, earned: 0 };
try { Object.assign(state, JSON.parse(localStorage.getItem(SAVE) || '{}')); } catch (e) { /* fresh start */ }
if (params.has('fresh')) Object.assign(state, { money: 50, built: [], paid: {}, up: {}, stock: {}, store: {}, piles: [0, 0], earned: 0 });
state.store = state.store || {};
for (const k in UPS) state.up[k] = state.up[k] || 0;
const isBuilt = (id) => state.built.includes(id);
function save() {
  for (const id in stations) {
    const s = stations[id];
    if (s.kind === 'producer' || s.kind === 'machine') state.stock[id] = { a: s.inN, b: s.outN };
    else if (s.kind === 'shelf') state.stock[id] = { a: s.n };
  }
  state.piles = COUNTERS.map((c) => c.pile.value);
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
    else if (kind === 'vip') [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.22, 'sine', 0.08, i * 0.1));
  } catch (e) { /* no audio */ }
}

// ---------- renderer / scene ----------
const canvas = $('cv');
const renderer = K.makeRenderer(canvas);
const scene = new THREE.Scene();
scene.background = new THREE.Color(C.grass2);
const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 220);
const lights = K.makeLights(scene);
const joy = new Joystick(canvas, $('ui'));
joy.onStart = () => { if (actx && actx.state === 'suspended') actx.resume(); };

const colliders = [];
const box = (x0, z0, x1, z1) => { const b = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) }; colliders.push(b); return b; };
function unbox(b) { const i = colliders.indexOf(b); if (i >= 0) colliders.splice(i, 1); }
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- item icons: each item's 3D model rendered once to a small picture ----------
const ICON = {};
function makeIcons() {
  try {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setSize(80, 80); r.outputColorSpace = THREE.SRGBColorSpace;
    const sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight('#fff6e6', '#c3e08a', 1.7));
    const d = new THREE.DirectionalLight('#fff1d6', 1.6); d.position.set(-2, 4, 3); sc.add(d);
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    for (const type of Object.keys(ITEMS)) {
      const m = P.itemMesh(type); sc.add(m);
      const bb = new THREE.Box3().setFromObject(m), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3()).length();
      cam.position.set(c.x + s * 0.9, c.y + s * 1.25, c.z + s * 1.7); cam.lookAt(c);
      r.render(sc, cam);
      ICON[type] = '<img class="ii" src="' + r.domElement.toDataURL() + '" alt="">';
      sc.remove(m);
    }
    r.dispose(); r.forceContextLoss();
  } catch (e) { /* fall back to emoji */ }
  for (const t in ITEMS) if (!ICON[t]) ICON[t] = '<span class="ic">' + ITEMS[t].icon + '</span>';
  ICON.run = '<span class="ic">👟</span>';
}
makeIcons();

// ---------- static world ----------
const standWall = { g: null, b: null };
let shopArea = null;
const shopDoor = { d: null, k: 0 };
const areas = [];
function makeArea(x0, z0, x1, z1, lamps, lx, lz) {
  const light = new THREE.PointLight('#ffe2a8', 0, 16, 1.6); light.position.set(lx, 3.2, lz); scene.add(light);
  const A = { x0, z0, x1, z1, light, lamps, k: 0 };
  areas.push(A);
  return A;
}
function buildWorld() {
  const D = new THREE.Group();
  K.add(D, K.mesh(G.plane(160, 160), C.grass, false, true), 4, 0, 6);
  const rnd = mulberry(7);
  for (let i = 0; i < 40; i++) {
    const r = 1.5 + rnd() * 3.5, p = K.mesh(G.circle(r, 9), rnd() < 0.5 ? C.grass2 : C.grass3, false, true);
    p.position.set(-34 + rnd() * 72, 0.004, -30 + rnd() * 70); p.scale.set(1, 1, 0.6 + rnd() * 0.6); p.rotation.y = rnd() * 3; D.add(p);
  }
  for (let z = -6; z <= 30; z += 1.15) {
    const t = K.mesh(G.rbox(1.0, 0.04, 0.95, 0.12, 2), (Math.round(z * 2) % 2) ? C.dirt : C.dirt2, false, true);
    t.position.set(-0.6 + Math.sin(z * 0.6) * 0.25, 0.02, z); t.rotation.y = Math.sin(z) * 0.15; D.add(t);
  }
  K.add(D, K.mesh(G.plane(4.2, 160), C.road, false, true), 15.5, 0.006, 0);
  for (let z = -70; z < 70; z += 3) K.add(D, K.mesh(G.plane(0.18, 1.4), C.roadLine, false, true), 15.5, 0.012, z);
  for (const x of [13.3, 17.7]) K.add(D, K.mesh(G.rbox(0.3, 0.12, 160, 0.05, 1), '#d5d9de', false, true), x, 0.06, 0);
  // the farm stand (becomes part of the supermarket later)
  K.add(D, K.mesh(G.rbox(14.4, 0.12, 10.4, 0.06, 2), C.floor, false, true), 0.6, 0.06, -12.2);
  K.add(D, K.mesh(G.rbox(14.2, 0.05, 0.6, 0.03, 1), C.floor2, false, true), 0.6, 0.125, -7.3);
  K.add(D, K.mesh(G.rbox(14.6, 1.5, 0.4, 0.08), C.wall), 0.5, 0.75, -17.6);
  K.add(D, K.mesh(G.rbox(14.7, 0.2, 0.46, 0.05), C.wallTrim), 0.5, 1.5, -17.6);
  for (const x of [-3, 3]) K.add(D, K.mesh(G.rbox(2.2, 0.8, 0.08, 0.06), '#bfe9ff'), x, 0.85, -17.38);
  standWall.g = K.add(scene, new THREE.Group());
  K.add(standWall.g, K.mesh(G.rbox(0.4, 1.5, 10.2, 0.08), C.wall), -6.8, 0.75, -12.3);
  K.add(standWall.g, K.mesh(G.rbox(0.46, 0.2, 10.3, 0.05), C.wallTrim), -6.8, 1.5, -12.3);
  box(-6.8, -17.8, 7.6, -17.4); standWall.b = box(-7.0, -17.5, -6.6, -7.2);
  // front wall (glass windows) with a door gap, and the east wall
  const wallPiece = (x0, x1, z) => {
    K.add(D, K.mesh(G.rbox(x1 - x0, 0.55, 0.3, 0.08), C.wall), (x0 + x1) / 2, 0.28, z);
    K.add(D, K.mesh(G.rbox(x1 - x0 - 0.1, 0.62, 0.12, 0.04), '#cfeeff'), (x0 + x1) / 2, 0.85, z);
    K.add(D, K.mesh(G.rbox(x1 - x0, 0.14, 0.32, 0.05), C.wallTrim), (x0 + x1) / 2, 1.2, z);
    box(x0, z - 0.2, x1, z + 0.2);
  };
  wallPiece(-6.8, 5.35, -7.3); wallPiece(7.65, 7.95, -7.3);
  K.add(D, K.mesh(G.rbox(0.4, 1.5, 10.4, 0.08), C.wall), 7.95, 0.75, -12.4);
  K.add(D, K.mesh(G.rbox(0.46, 0.2, 10.5, 0.05), C.wallTrim), 7.95, 1.5, -12.4);
  box(7.75, -17.6, 8.15, -7.2);
  const sign = K.add(D, new THREE.Group(), 3.6, 0, -6.2);
  K.add(sign, K.mesh(G.rbox(0.14, 1.6, 0.14, 0.04), C.woodDark), 0, 0.8, 0);
  const sb = P2.signBoard('農場小舖', 1.6, '#59c25b'); sb.position.set(0, 1.75, 0); sign.add(sb);
  for (const [x, z] of [[-6.1, -16.8], [7.0, -16.8]]) {
    const pot = K.add(D, new THREE.Group(), x, 0.12, z);
    K.add(pot, K.mesh(G.cyl(0.32, 0.24, 0.45, 10), C.roof), 0, 0.22, 0);
    K.add(pot, P.bush(0.35), 0, 0.4, 0);
  }
  // VIP carpet by the entrance
  // fences, trees, decoration
  for (const seg of [[-21, -4.5, -21, 32], [-21, 32, 12, 32], [-21, -4.5, -10.5, -4.5]]) D.add(P.fenceLine(...seg));
  box(-21.2, -4.5, -20.8, 32); box(-21, 31.8, 12, 32.2); box(-21, -4.65, -10.5, -4.35);
  for (let i = 0; i < 20; i++) { const t = P.tree(); t.g.position.set(-24 - rnd() * 6 + (i % 3), 0, -24 + i * 3.1); t.g.scale.setScalar(0.9 + rnd() * 0.5); D.add(t.g); }
  for (let i = 0; i < 16; i++) { const t = P.tree(); t.g.position.set(-20 + i * 3.1 + rnd(), 0, 35 + rnd() * 3); t.g.scale.setScalar(0.85 + rnd() * 0.4); D.add(t.g); }
  for (let i = 0; i < 12; i++) { const t = P.tree(); t.g.position.set(-22 + i * 3.4 + rnd(), 0, -21.5 - rnd() * 3); D.add(t.g); }
  for (let i = 0; i < 12; i++) { const t = P.tree(); t.g.position.set(31 + rnd() * 3, 0, -24 + i * 5 + rnd() * 2); D.add(t.g); }
  for (const [x, z, r] of [[11.5, -16, 0.6], [12, -2.5, 0.45], [-11.5, -5.2, 0.5], [6, 30.5, 0.55], [-9, 30.6, 0.5], [12, 15.5, 0.6], [-19.5, 12, 0.6], [-19.5, 2, 0.5]]) K.add(D, P.bush(r), x, 0, z);
  const fl = ['#ff7eb6', '#ffffff', '#ffd34a', '#a98bff', '#ff8a6b'];
  for (let i = 0; i < 70; i++) K.add(D, P.flower(fl[i % 5]), -20 + rnd() * 32, 0, -3.5 + rnd() * 35);
  for (const [x, z, s] of [[-19, 28, 0.45], [10.8, -1.5, 0.35], [-15, 14, 0.3], [11.5, 13, 0.4], [10, 30, 0.5]]) K.add(D, P.rock(s), x, 0, z);
  for (const z of [-14, -2, 10, 22]) K.add(D, P.lamp(), 13, 0, z);
  K.bake(D, scene);
  shopDoor.d = P2.slidingDoor(2.1); shopDoor.d.g.position.set(6.5, 0.1, -7.3); scene.add(shopDoor.d.g);
  const lamps = [];
  for (const x of [-4.5, 0.5, 5.5]) { const l = P2.wallLamp(); l.g.position.set(x, 1.35, -17.3); scene.add(l.g); lamps.push(l); }
  shopArea = makeArea(-6.8, -17.4, 7.9, -7.3, lamps, 0.5, -12);
}

// ---------- labels (DOM, projected) ----------
const labels = [];
const tmpV = new THREE.Vector3();
function label(cls, html, getPos) {
  const el = document.createElement('div'); el.className = 'lbl ' + cls; el.innerHTML = html;
  $('labels').appendChild(el);
  const L = { el, getPos, html, show: true, near: 0 };
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
    if (L.near && Math.hypot(tmpV.x - pp.x, tmpV.z - pp.z) > L.near) { L.el.style.display = 'none'; continue; }
    tmpV.project(camera);
    if (tmpV.z > 1 || tmpV.x < -1.3 || tmpV.x > 1.3 || tmpV.y < -1.3 || tmpV.y > 1.3) { L.el.style.display = 'none'; continue; }
    L.el.style.display = '';
    L.el.style.transform = 'translate(' + ((tmpV.x + 1) / 2 * w).toFixed(1) + 'px,' + ((1 - tmpV.y) / 2 * h).toFixed(1) + 'px) translate(-50%,-100%)';
  }
}
const badge = (type, n, max) => ICON[type] + n + '/' + max;
const costRow = (type, n) => '<div class="cost">' + ICON[type] + n + '</div>';

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
function restack(c) { let y = 0; for (const it of c.carry) { it.m.position.set(0, y, 0); it.y = y; y += ITEMS[it.type].h; } }
// spring-driven lean: the tower bends back when walking and wobbles when stopping
function swayStack(c, speed, dt) {
  const target = -Math.min(1, speed / 5);
  c.swv = (c.swv || 0) + ((target - (c.sw || 0)) * 60 - (c.swv || 0) * 9) * dt;
  c.sw = (c.sw || 0) + c.swv * dt;
  const n = c.carry.length;
  for (let i = 0; i < n; i++) {
    const it = c.carry[i], k = i / Math.max(6, n);
    it.m.position.z = c.sw * k * k * (0.35 + n * 0.03);
    it.m.rotation.x = c.sw * k * 0.25;
    if (it.pop > 0) { it.pop = Math.max(0, it.pop - dt * 5); const q = it.pop; it.m.scale.set(1 + q * 0.35, 1 - q * 0.3, 1 + q * 0.35); }
  }
}
function stackAdd(c, type) { const m = P.itemMesh(type); c.p.back.add(m); c.carry.push({ type, m, pop: 1 }); restack(c); }
function count(c, type) { let n = 0; for (const it of c.carry) if (it.type === type) n++; return n; }
function room(c) { return c.cap() - c.carry.length - c.incoming; }
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
function takeInto(c, type, from) {
  c.incoming++;
  fly(type, from, (o) => stackTop(c, o), 0.3, () => { c.incoming--; stackAdd(c, type); });
}

// ---------- player ----------
const player = carrier(K.person({ body: '#ff7f6e', hat: 'straw' }));
player.cap = () => upVal('cap');
player.p.root.position.set(5.0, 0, -2.0);
scene.add(player.p.root);
const axe = new THREE.Group();
K.add(axe, K.mesh(G.rbox(0.06, 0.5, 0.06, 0.02), C.woodDark), 0, -0.25, 0.1);
K.add(axe, K.mesh(G.rbox(0.05, 0.18, 0.22, 0.03), C.grey), 0, -0.46, 0.2);
player.p.arms[1].add(axe); axe.visible = false;
const pVel = new THREE.Vector3();
let pFace = 0;

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
  for (const [x, z] of [[-13.2, -2.6], [-14.6, 0.8], [-12.6, 3.6], [-14.4, 6.6], [-12.9, 9.6], [-15.5, 12.6], [-13.4, 14.8]]) {
    const t = P.tree(); t.g.position.set(x, 0, z); scene.add(t.g);
    trees.push({ ...t, x, z, hp: 3, dead: false, t: 0, shake: 0 });
    box(x - 0.35, z - 0.35, x + 0.35, z + 0.35);
  }
}

// ---------- counters (two cash desks once the supermarket grows) ----------
const COUNTERS = [
  { x: 4.6, z: -9.9, serve: { x: 4.6, z: -11.3 }, pile: { x: 7.0, z: -10.2, value: 0 }, on: false },
  { x: -16.5, z: -9.9, serve: { x: -16.5, z: -11.3 }, pile: { x: -14.4, z: -10.2, value: 0 }, on: false },
];
const VIP = { x: 10.6, z: -7.6 };
function buildCounter(i, instant) {
  const c = COUNTERS[i]; c.on = true;
  const g = P.counter(); g.position.set(c.x, 0.12, c.z); scene.add(g);
  box(c.x - 1.45, c.z - 0.55, c.x + 1.45, c.z + 0.55);
  K.add(scene, K.mesh(G.rbox(1.3, 0.04, 1.3, 0.1), '#c9f0c2', false, true), c.pile.x, 0.14, c.pile.z);
  c.pile.grp = K.add(scene, new THREE.Group(), c.pile.x, 0.16, c.pile.z);
  c.pile.vis = [];
  for (let k = 0; k < 40; k++) {
    const m = P.itemMesh('money'); const col = k % 4, row = Math.floor(k / 4) % 2, lay = Math.floor(k / 8);
    m.position.set(-0.3 + (col % 2) * 0.48, lay * 0.07, -0.32 + row * 0.34 + Math.floor(col / 2) * 0.32 - 0.15);
    m.rotation.y = (k * 0.37) % 0.3; m.visible = false; c.pile.grp.add(m); c.pile.vis.push(m);
  }
  c.pile.label = label('badge money', '', (o) => o.set(c.pile.x, 1.2, c.pile.z));
  c.pile.value = state.piles[i] || 0; setPile(c);
  if (!instant) popIn(g);
}
function setPile(c) {
  const p = c.pile, n = p.value > 0 ? Math.min(40, Math.ceil(p.value / 6)) : 0;
  p.vis.forEach((m, i) => { m.visible = i < n; });
  p.label.show = p.value > 0;
  setLabel(p.label, ICON.money + fmtMoney(p.value));
}
function fmtMoney(v) { return v >= 100000 ? (v / 1000).toFixed(0) + 'K' : v >= 10000 ? (v / 1000).toFixed(1) + 'K' : String(v); }

// ---------- stations ----------
const stations = {};
const pops = [];
const later = [];
function popIn(obj) { obj.scale.setScalar(0.01); pops.push({ obj, t: 0 }); }
const sprinklers = [];
const PLANTS = { tomato: P.tomatoPlant, corn: P.cornPlant, soy: P2.soyPlant, wheat: P2.wheatPlant, apple: P2.appleTree };
const CROP_LAYOUT = {
  tomato: { w: 3.2, d: 2.4, spots: [[-0.8, -0.55], [0.8, -0.55], [-0.8, 0.55], [0.8, 0.55]] },
  corn: { w: 3.2, d: 2.8, spots: [[-1, -0.7], [0, -0.7], [1, -0.7], [-1, 0.7], [0, 0.7], [1, 0.7]] },
  soy: { w: 3.4, d: 2.6, spots: [[-1.1, -0.6], [0, -0.6], [1.1, -0.6], [-1.1, 0.6], [0, 0.6], [1.1, 0.6]] },
  wheat: { w: 3.4, d: 2.6, spots: [[-1.1, -0.6], [-0.37, -0.6], [0.37, -0.6], [1.1, -0.6], [-1.1, 0.6], [-0.37, 0.6], [0.37, 0.6], [1.1, 0.6]] },
  apple: { w: 5.6, d: 3.8, spots: [[-1.9, -0.95], [0, -0.95], [1.9, -0.95], [-1.9, 0.95], [0, 0.95], [1.9, 0.95]] },
};

function build(def, instant) {
  const id = def.id;
  if (!state.built.includes(id)) state.built.push(id);
  const s = { id, def, kind: def.kind };
  stations[id] = s;
  const pos = def.pos || def.zone;
  if (def.kind === 'producer') {
    const isBarn = def.out === 'milk';
    const b = isBarn ? P.barn() : P.coop();
    b.g.position.set(pos[0], 0, pos[1]); scene.add(b.g);
    const tw = b.trough.getWorldPosition(new THREE.Vector3()), nw = b.nest.getWorldPosition(new THREE.Vector3());
    Object.assign(s, { g: b.g, inPt: tw, outPt: nw, inN: 0, outN: 0, inMax: 10, outMax: 12, timer: 0, inVis: [], outVis: [], animals: [] });
    for (let i = 0; i < 10; i++) { const m = P.itemMesh('hay'); m.scale.setScalar(0.62); m.position.set(-0.4 + (i % 5) * 0.2, 0.3 + Math.floor(i / 5) * 0.17, (Math.floor(i / 5) % 2) * 0.08 - 0.04); m.visible = false; b.trough.add(m); s.inVis.push(m); }
    for (let i = 0; i < 12; i++) { const m = P.itemMesh(def.out); m.scale.setScalar(0.85); m.position.set(-0.3 + (i % 4) * 0.2, 0.22 + Math.floor(i / 8) * 0.22, -0.18 + (Math.floor(i / 4) % 2) * 0.3); m.visible = false; b.nest.add(m); s.outVis.push(m); }
    if (isBarn) {
      const c = P.cow(); c.g.position.set(pos[0] - 0.6, 0, pos[1] + 0.9); scene.add(c.g); s.animals.push({ ...c, home: [pos[0], pos[1] + 0.9], rx: 1.0, rz: 0.4, t: Math.random() * 5, tx: 0, tz: 0 });
      box(pos[0] - 1.5, pos[1] - 2, pos[0] + 1.5, pos[1] + 0.2); penBoxes(pos[0], pos[1] + 0.9, 3.0, 1.8);
    } else {
      for (let i = 0; i < 3; i++) { const c = P.chicken(); c.g.position.set(pos[0] - 0.6 + i * 0.6, 0, pos[1] + 0.7); scene.add(c.g); s.animals.push({ ...c, home: [pos[0], pos[1] + 0.75], rx: 0.95, rz: 0.4, t: Math.random() * 5, tx: 0, tz: 0 }); }
      box(pos[0] - 1.2, pos[1] - 1.45, pos[0] + 1.2, pos[1] + 0.25); penBoxes(pos[0], pos[1] + 0.6, 2.4, 1.4);
    }
    const st = state.stock[id]; if (st) { s.inN = st.a || 0; s.outN = st.b || 0; }
    s.inLabel = label('badge', '', (o) => o.copy(tw).setY(1.0)); s.inLabel.near = 0;
    s.outLabel = label('badge', '', (o) => o.copy(nw).setY(0.95)); s.outLabel.near = 0;
    if (!instant) popIn(b.g);
  } else if (def.kind === 'machine') {
    const m = P2.machine(def.mk);
    m.g.position.set(pos[0], 0, pos[1]); scene.add(m.g);
    const tw = m.inTray.getWorldPosition(new THREE.Vector3()), nw = m.outTray.getWorldPosition(new THREE.Vector3());
    Object.assign(s, { g: m.g, spin: m.spin, inPt: tw, outPt: nw, inN: 0, outN: 0, inMax: 12, outMax: 12, timer: 0, inVis: [], outVis: [] });
    for (let i = 0; i < 12; i++) { const it = P.itemMesh(def.in); it.scale.setScalar(0.75); it.position.set(-0.3 + (i % 4) * 0.2, 0.25 + Math.floor(i / 8) * 0.2, -0.18 + (Math.floor(i / 4) % 2) * 0.3); it.visible = false; m.inTray.add(it); s.inVis.push(it); }
    for (let i = 0; i < 12; i++) { const it = P.itemMesh(def.out); it.scale.setScalar(0.75); it.position.set(-0.3 + (i % 4) * 0.2, 0.25 + Math.floor(i / 8) * 0.28, -0.18 + (Math.floor(i / 4) % 2) * 0.3); it.visible = false; m.outTray.add(it); s.outVis.push(it); }
    box(pos[0] - 0.85, pos[1] - 0.8, pos[0] + 0.85, pos[1] + 0.4);
    const st = state.stock[id]; if (st) { s.inN = st.a || 0; s.outN = st.b || 0; }
    s.inLabel = label('badge', '', (o) => o.copy(tw).setY(0.95)); s.inLabel.near = 0;
    s.outLabel = label('badge', '', (o) => o.copy(nw).setY(0.95)); s.outLabel.near = 0;
    if (!instant) popIn(m.g);
  } else if (def.kind === 'crop') {
    const L = CROP_LAYOUT[def.plant];
    const g = new THREE.Group(); g.position.set(pos[0], 0, pos[1]); scene.add(g);
    if (def.plant === 'apple') K.add(g, K.mesh(G.rbox(L.w, 0.08, L.d, 0.2), '#9fd25a', false, true), 0, 0.04, 0);
    else g.add(P.plot(L.w, L.d));
    s.plants = [];
    for (const [x, z] of L.spots) {
      const pl = PLANTS[def.plant](); pl.g.position.set(x, def.plant === 'apple' ? 0 : 0.2, z); g.add(pl.g);
      s.plants.push({ ...pl, x: pos[0] + x, z: pos[1] + z, ripe: true, t: 0, res: null });
      if (def.plant === 'apple') box(pos[0] + x - 0.25, pos[1] + z - 0.25, pos[0] + x + 0.25, pos[1] + z + 0.25);
    }
    s.grow = def.grow; s.g = g; s.w = L.w; s.d = L.d;
    if (isBuilt('sprinkler')) addSprinkler(s);
    if (!instant) popIn(g);
  } else if (def.kind === 'shelf') {
    const sh = def.fridge ? P2.fridge() : P.shelf(); sh.g.position.set(pos[0], 0.12, pos[1]); scene.add(sh.g);
    Object.assign(s, { g: sh.g, n: 0, vis: [], item: def.item, front: V3(pos[0], 0, pos[1] + 1.25), door: sh.door || null, dk: 0 });
    const ih = ITEMS[def.item].h * 0.95;
    for (let i = 0; i < 24; i++) { const m = P.itemMesh(def.item); m.position.copy(sh.slots[i % 8]); m.position.y += Math.floor(i / 8) * ih; m.rotation.y = (i % 3) * 0.2 - 0.2; m.visible = false; sh.g.add(m); s.vis.push(m); }
    if (!def.fridge) { const ic = P.itemMesh(def.item); ic.scale.setScalar(0.9); ic.position.set(0, 1.12, -0.38); sh.g.add(ic); }
    const st = state.stock[id]; if (st) s.n = st.a || 0;
    s.label = label('badge big', '', (o) => o.set(pos[0], def.fridge ? 1.6 : 1.95, pos[1]));
    box(pos[0] - 0.85, pos[1] - 0.5, pos[0] + 0.85, pos[1] + 0.5);
    if (!instant) popIn(sh.g);
  } else if (def.kind === 'hire') {
    s.worker = makeWorker(def.role, def.zone, def.counter || 0, !instant);
  } else if (def.kind === 'pet') {
    if (id === 'dog') { const d = P.dog(); d.g.position.set(pos[0], 0, pos[1]); scene.add(d.g); pets.dog = { ...d, ph: 0 }; if (!instant) popIn(d.g); }
    else { const c = P.cat(); c.g.position.set(5.6, 1.12, -10.1); c.g.rotation.y = -0.6; scene.add(c.g); pets.cat = { ...c, ph: 0 }; if (!instant) popIn(c.g); }
  } else if (def.kind === 'sprinkler') {
    for (const st of Object.values(stations)) if (st.kind === 'crop') addSprinkler(st);
  } else if (def.kind === 'market') {
    buildMarket(instant);
  } else if (def.kind === 'counter2') {
    buildCounter(1, instant);
  } else if (def.kind === 'dock') {
    const g = new THREE.Group(); g.position.set(pos[0], 0, pos[1]); scene.add(g);
    K.add(g, K.mesh(G.rbox(2.2, 0.35, 3.2, 0.08), C.woodLight), 0, 0.17, 0);
    for (const z of [-1.4, 1.4]) K.add(g, K.mesh(G.rbox(0.18, 1.1, 0.18, 0.05), C.woodDark), -0.95, 0.55, z);
    K.add(g, K.mesh(G.rbox(0.12, 0.7, 2.9, 0.05), C.roof), -0.95, 1.1, 0);
    truck.ready = true;
    if (!instant) popIn(g);
  } else if (def.kind === 'store') {
    const wh = P2.warehouse(); wh.g.position.set(pos[0], 0, pos[1]); scene.add(wh.g);
    box(pos[0] - 2.15, pos[1] - 1.85, pos[0] + 2.15, pos[1] + 1.85);
    const depPt = V3(pos[0] - 1.1, 0, pos[1] + 3.0), outPt = V3(pos[0] + 1.1, 0, pos[1] + 3.0);
    const dp = P2.pad('#59c25b'); dp.position.copy(depPt); scene.add(dp);
    const wp = P2.pad('#ff9f43'); wp.position.copy(outPt); scene.add(wp);
    Object.assign(s, { g: wh.g, door: wh.door, depPt, outPt, k: 0 });
    s.depLabel = label('badge pad', '存入', (o) => o.copy(depPt).setY(0.7)); s.depLabel.near = 7;
    s.wdLabel = label('badge pad', '取出', (o) => o.copy(outPt).setY(0.7)); s.wdLabel.near = 7;
    s.label = label('store', '', (o) => o.set(pos[0], 3.9, pos[1] + 1));
    const lamp = P2.wallLamp(); lamp.g.position.set(pos[0], 2.75, pos[1] + 1.95); scene.add(lamp.g);
    makeArea(pos[0] - 2.6, pos[1] - 2, pos[0] + 2.6, pos[1] + 4, [lamp], pos[0], pos[1] + 2.6);
    if (!instant) popIn(wh.g);
  } else if (def.kind === 'parking') {
    buildParking(instant);
  } else if (def.kind === 'helipad') {
    const g = P2.helipad(); g.position.set(HELI.x, 0, HELI.z); scene.add(g);
    heli.ready = true;
    if (!instant) popIn(g);
  }
  if (!instant) { confetti(pos[0], pos[1]); sfx('unlock'); toast('🎉 ' + def.name + ' 完成！'); }
  refreshZones();
  save();
}
// the three fenced sides of an animal pen are solid
function penBoxes(cx, cz, w, d) {
  box(cx - w / 2 - 0.15, cz + d / 2 - 0.15, cx + w / 2 + 0.15, cz + d / 2 + 0.15);
  box(cx - w / 2 - 0.15, cz - d / 2, cx - w / 2 + 0.15, cz + d / 2);
  box(cx + w / 2 - 0.15, cz - d / 2, cx + w / 2 + 0.15, cz + d / 2);
}
function addSprinkler(s) {
  for (const [dx, dz] of [[-s.w / 2 - 0.15, -s.d / 2 - 0.15], [s.w / 2 + 0.15, s.d / 2 + 0.15]]) {
    const sp = P2.sprinkler(); sp.g.position.set(s.def.pos[0] + dx, 0, s.def.pos[1] + dz); scene.add(sp.g);
    sprinklers.push({ ...sp, ph: Math.random() * 6 });
  }
}
function buildMarket(instant) {
  const g = K.add(scene, new THREE.Group());
  K.add(g, K.mesh(G.rbox(14.4, 0.12, 10.4, 0.06, 2), C.floor, false, true), -13.6, 0.06, -12.2);
  K.add(g, K.mesh(G.rbox(14.2, 0.05, 0.6, 0.03, 1), C.floor2, false, true), -13.6, 0.125, -7.3);
  for (let x = -20; x < -6.6; x += 1.6) for (let z = -16.6; z < -7.6; z += 1.6) if ((Math.round(x / 1.6) + Math.round(z / 1.6)) % 2 === 0) K.add(g, K.mesh(G.plane(1.58, 1.58), C.floor2, false, true), x + 0.8, 0.125, z + 0.8);
  K.add(g, K.mesh(G.rbox(14.4, 2.2, 0.4, 0.08), C.wall), -13.6, 1.1, -17.6);
  K.add(g, K.mesh(G.rbox(14.5, 0.2, 0.46, 0.05), C.wallTrim), -13.6, 2.2, -17.6);
  K.add(g, K.mesh(G.rbox(0.4, 2.2, 10.2, 0.08), C.wall), -20.8, 1.1, -12.3);
  K.add(g, K.mesh(G.rbox(0.46, 0.2, 10.3, 0.05), C.wallTrim), -20.8, 2.2, -12.3);
  for (const x of [-18, -13.5, -9]) K.add(g, K.mesh(G.rbox(2.6, 1.0, 0.08, 0.06), '#bfe9ff'), x, 1.2, -17.38);
  const sign = P2.signBoard('超級市場', 5, '#ff8a6b'); sign.position.set(-13.6, 3.0, -17.5); g.add(sign);
  box(-21, -17.8, -6.6, -17.4); box(-21, -17.5, -20.6, -7.2);
  K.add(g, K.mesh(G.rbox(14.2, 0.55, 0.3, 0.08), C.wall), -13.75, 0.28, -7.3);
  K.add(g, K.mesh(G.rbox(14.1, 0.62, 0.12, 0.04), '#cfeeff'), -13.75, 0.85, -7.3);
  K.add(g, K.mesh(G.rbox(14.2, 0.14, 0.32, 0.05), C.wallTrim), -13.75, 1.2, -7.3);
  box(-21, -7.5, -6.6, -7.1);
  for (const x of [-18, -13.5, -9]) { const l = P2.wallLamp(); l.g.position.set(x, 1.9, -17.3); scene.add(l.g); shopArea.lamps.push(l); }
  K.add(g, K.mesh(G.circle(1.1, 24), '#ff8fb1', false, true), VIP.x, 0.02, VIP.z);
  K.add(g, K.mesh(G.circle(0.85, 24), '#ffd1e0', false, true), VIP.x, 0.025, VIP.z);
  shopArea.x0 = -20.8; shopArea.light.position.x = -6.5; shopArea.light.distance = 26;
  if (standWall.g) { scene.remove(standWall.g); standWall.g = null; unbox(standWall.b); }
  if (!instant) popIn(g);
}
function buildParking(instant) {
  const g = K.add(scene, new THREE.Group(), 23.6, 0, -10);
  K.add(g, K.mesh(G.rbox(10, 0.08, 12.4, 0.2), '#9aa1ab', false, true), 0, 0.04, 0);
  for (let i = 0; i < 5; i++) for (const z of [-3.6, 3.6]) K.add(g, K.mesh(G.plane(0.14, 3.2), '#ffffff', false, true), -4 + i * 2, 0.09, z);
  K.add(g, K.mesh(G.plane(9.6, 0.14), '#ffde59', false, true), 0, 0.09, 0);
  park.ready = true;
  if (!instant) popIn(g);
}

// ---------- zones ----------
const zones = {};
const dashTex = K.dashTexture();
const dashMat = new THREE.MeshBasicMaterial({ map: dashTex, transparent: true, depthWrite: false });
const fillMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false });
function refreshZones() {
  for (let i = 0; i < DEFS.length; i++) {
    const def = DEFS[i];
    if (isBuilt(def.id)) { if (zones[def.id]) killZone(def.id); continue; }
    const open = def.req ? def.req.every(isBuilt) : def.any ? def.any.some(isBuilt) : isBuilt(DEFS[i - 1].id);
    if (open && !zones[def.id]) makeZone(def);
  }
}
function zoneSpot(def) {
  if (def.zone) return def.zone;
  if (def.kind === 'shelf') return [def.pos[0], def.pos[1] + 1.7];
  return def.pos;
}
function makeZone(def) {
  const [x, z] = zoneSpot(def);
  const g = new THREE.Group(); g.position.set(x, 0.03, z); scene.add(g);
  const ring = new THREE.Mesh(G.plane(2.4, 2.4), dashMat); ring.renderOrder = 2; g.add(ring);
  const fill = new THREE.Mesh(G.plane(1.9, 1.9), fillMat); fill.renderOrder = 2; fill.position.y = 0.005; fill.scale.set(1, 1, 0.001); g.add(fill);
  if (def.kind === 'hire') g.add(P2.ghostPerson());
  const paid = state.paid[def.id] || {};
  const z0 = { def, g, fill, x, z, paid, total: Object.values(def.cost).reduce((a, b) => a + b, 0), tick: 0 };
  z0.label = label('zone', '', (o) => o.set(x, def.kind === 'hire' ? 2.0 : 0.4, z + 0.2));
  zones[def.id] = z0;
  updateZoneLabel(z0);
  popIn(g);
}
function killZone(id) { const z = zones[id]; scene.remove(z.g); dropLabel(z.label); delete zones[id]; }
function left(z, k) { return z.def.cost[k] - (z.paid[k] || 0); }
function updateZoneLabel(z) {
  let rows = '';
  for (const k in z.def.cost) { const l = left(z, k); if (l > 0) rows += costRow(k, fmtMoney(l)); }
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
function makeWorker(role, at, counter, pop) {
  const look = role === 'cashier' ? { body: '#b48cff', hat: 'bun', hatColor: '#7a4fd6', apron: C.white }
    : role === 'farmer' ? { body: '#7fcf6a', hat: 'straw' } : { body: '#5aa9ff', hat: 'cap', hatColor: '#ffd34a', apron: '#ffd34a' };
  const p = K.person(look);
  p.root.position.set(at[0], 0, at[1]); scene.add(p.root); if (pop) popIn(p.root);
  const w = carrier(p);
  Object.assign(w, { role, counter, job: null, wait: 0, face: 0, moving: 0 });
  w.cap = () => upVal('wcap');
  workers.push(w);
  return w;
}
function go(w, x, z, dt, speed) {
  const key = x.toFixed(2) + ',' + z.toFixed(2);
  if (w.routeKey !== key) {
    w.routeKey = key;
    const p = w.p.root.position, a = inShop(p.x, p.z), b = inShop(x, z);
    w.route = a && !b ? [HALL, DOOR_IN, DOOR] : !a && b ? [DOOR, DOOR_IN, HALL] : [];
    w.route.push([x, z]);
  }
  while (w.route.length > 1 && walkTo(w, w.route[0][0], w.route[0][1], dt, speed)) w.route.shift();
  if (w.route.length > 1) return false;
  return walkTo(w, x, z, dt, speed);
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
  const r = p.root.rotation.y; let diff = face - r;
  while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
  p.root.rotation.y = r + diff * Math.min(1, dt * 12);
}
const listOf = (kind) => Object.values(stations).filter((s) => s.kind === kind);
function idleWander(w, dt, cx, cz) {
  w.wait -= dt;
  if (!w.wp || w.wait <= 0) { w.wp = [cx + (Math.random() - 0.5) * 3, cz + (Math.random() - 0.5) * 2]; w.wait = 2 + Math.random() * 2; }
  go(w, w.wp[0], w.wp[1], dt, 1.6);
}
const STORE_CAP = 200;
const storeTotal = () => Object.values(state.store).reduce((a, b) => a + b, 0);
const srcCount = (src, item) => src.kind === 'store' ? (state.store[item] || 0) : src.outN;
function srcTake(src, item) { if (src.kind === 'store') state.store[item]--; else src.outN--; }
// the nearest output pile for an item (warehouse included), or a crop with ripe plants
function sourceFor(item, w) {
  let best = null, bd = 1e9;
  for (const s of Object.values(stations)) {
    let ok = false;
    if ((s.kind === 'producer' || s.kind === 'machine') && s.def.out === item && s.outN > 0) ok = true;
    if (s.kind === 'crop' && s.def.out === item && s.plants.some((p) => p.ripe && (!p.res || p.res === w))) ok = true;
    if (s.kind === 'store' && (state.store[item] || 0) > 0) ok = true;
    if (!ok) continue;
    const pt = s.outPt || V3(s.def.pos[0], 0, s.def.pos[1]);
    const d = dist2(w.p.root.position, pt.x, pt.z);
    if (d < bd) { bd = d; best = s; }
  }
  return best;
}
function pickJob(w) {
  const want = (it) => customers.filter((c) => c.st === 'shop' && c.item === it).length;
  let best = null;
  const cap = upVal('shelfCap');
  for (const s of listOf('shelf')) {
    const space = cap - s.n - (s.pend || 0); if (space < 2) continue;
    const src = sourceFor(s.item, w); if (!src) continue;
    const taken = workers.some((o) => o !== w && o.job && o.job.dst === s);
    const k = want(s.item) * 8 + space + Math.random() * 2 - (taken ? 12 : 0);
    if (!best || k > best.k) best = { k, dst: s, src, item: s.item };
  }
  for (const m of listOf('machine')) {
    const space = m.inMax - m.inN - (m.pend || 0); if (space < 3) continue;
    const src = sourceFor(m.def.in, w); if (!src) continue;
    const taken = workers.some((o) => o !== w && o.job && o.job.dst === m);
    const k = space * 0.9 + (m.inN === 0 ? 5 : 0) + Math.random() * 2 - (taken ? 12 : 0);
    if (!best || k > best.k) best = { k, dst: m, src, item: m.def.in };
  }
  return best ? { dst: best.dst, src: best.src, item: best.item, phase: 'get' } : null;
}
function depositTo(c, dst, item, dt) {
  c.xfer -= dt;
  if (c.xfer > 0 || count(c, item) <= 0) return;
  if (dst.kind === 'store') {
    if (storeTotal() + (dst.pend || 0) >= STORE_CAP) return;
    c.xfer = 0.06; dst.pend = (dst.pend || 0) + 1;
    giveFrom(c, item, (o) => o.set(dst.def.pos[0], 0.8, dst.def.pos[1] + 1.6), () => { dst.pend--; state.store[item] = (state.store[item] || 0) + 1; });
  } else if (dst.kind === 'shelf') {
    if (dst.n + (dst.pend || 0) >= upVal('shelfCap')) return;
    c.xfer = 0.1; dst.pend = (dst.pend || 0) + 1;
    giveFrom(c, item, (o) => o.set(dst.def.pos[0], 0.9, dst.def.pos[1]), () => { dst.pend--; dst.n++; const m = dst.vis[dst.n - 1]; if (m) pops.push({ obj: m, t: 0.35 }); });
  } else {
    if (dst.inN + (dst.pend || 0) >= dst.inMax) return;
    c.xfer = 0.1; dst.pend = (dst.pend || 0) + 1;
    giveFrom(c, item, (o) => o.copy(dst.inPt).setY(0.4), () => { dst.pend--; dst.inN = Math.min(dst.inMax, dst.inN + 1); });
  }
  if (c === player) sfx('drop');
}
function dstPoint(dst) { return dst.kind === 'shelf' ? dst.front : dst.kind === 'store' ? dst.depPt : V3(dst.inPt.x, 0, dst.inPt.z + 0.9); }
function updateWorker(w, dt) {
  const sp = upVal('wspeed');
  w.moving = 0;
  if (w.role === 'cashier') {
    const c = COUNTERS[w.counter];
    if (walkTo(w, c.serve.x, c.serve.z, dt, sp)) w.face = 0;
    return;
  }
  if (w.role === 'farmer') {
    const prods = listOf('producer').filter((s) => s.inN + (s.pend || 0) < s.inMax);
    const hay = count(w, 'hay');
    if (hay > 0 && (room(w) <= 0 || !tufts.some((t) => t.grown && !t.res) || w.job === 'deliver')) {
      w.job = 'deliver';
      const s = prods.sort((a, b) => a.inN - b.inN)[0];
      if (!s) { w.job = null; idleWander(w, dt, -4.5, 3.6); return; }
      if (walkTo(w, s.inPt.x - 0.6, s.inPt.z + 0.9, dt, sp) || dist2(w.p.root.position, s.inPt.x, s.inPt.z) < 1.3) depositTo(w, s, 'hay', dt);
      if (count(w, 'hay') === 0 && !w.incoming) w.job = null;
    } else if (prods.length && room(w) > 0) {
      if (!w.target || !w.target.grown || w.target.res !== w) {
        if (w.target && w.target.res === w) w.target.res = null;
        let best = null, bd = 1e9;
        for (const t of tufts) if (t.grown && !t.res) { const d = dist2(w.p.root.position, t.x, t.z); if (d < bd) { bd = d; best = t; } }
        w.target = best; if (best) best.res = w;
      }
      const t = w.target;
      if (t && walkTo(w, t.x, t.z + 0.3, dt, sp)) { cutTuft(t, w); w.target = null; }
      if (!t && hay > 0) w.job = 'deliver';
    } else idleWander(w, dt, -4.5, 3.6);
    return;
  }
  // shelver: fetch a full load from a source, then deliver it to a shelf or a machine
  if (!w.job) {
    if (w.carry.length && !w.incoming) {
      const type = w.carry[w.carry.length - 1].type;
      const dst = listOf('shelf').find((s) => s.item === type) || listOf('machine').find((m) => m.def.in === type) || (stations.warehouse && storeTotal() < STORE_CAP ? stations.warehouse : null);
      if (dst) w.job = { dst, item: type, phase: 'put' };
      else { w.carry.splice(0).forEach((it) => w.p.back.remove(it.m)); return; }
    } else if (!w.incoming) w.job = pickJob(w);
    if (!w.job) { idleWander(w, dt, -1, -4); return; }
  }
  const j = w.job;
  if (j.phase === 'get') {
    const src = j.src;
    if (room(w) <= 0) { j.phase = 'put'; return; }
    if (src.kind === 'crop') {
      let pl = j.plant;
      if (!pl || !pl.ripe || (pl.res && pl.res !== w)) { pl = src.plants.find((q) => q.ripe && (!q.res || q.res === w)); j.plant = pl; if (pl) pl.res = w; }
      if (!pl) { j.phase = count(w, j.item) ? 'put' : 'done'; return; }
      if (go(w, pl.x, pl.z + 0.7, dt, sp)) { pickPlant(src, pl, w); j.plant = null; }
    } else {
      if (go(w, src.outPt.x + 0.3, src.outPt.z + 0.9, dt, sp) || dist2(w.p.root.position, src.outPt.x, src.outPt.z) < 1.3) {
        w.xfer -= dt;
        if (w.xfer <= 0 && srcCount(src, j.item) > 0 && room(w) > 0) { w.xfer = 0.1; srcTake(src, j.item); takeInto(w, j.item, V3(src.outPt.x, 0.4, src.outPt.z)); }
        if ((srcCount(src, j.item) <= 0 || room(w) <= 0) && !w.incoming) j.phase = count(w, j.item) ? 'put' : 'done';
      }
    }
  } else if (j.phase === 'put') {
    if (w.incoming) return;
    const p = dstPoint(j.dst);
    if (go(w, p.x + 0.4, p.z, dt, sp) || dist2(w.p.root.position, p.x, p.z) < 1.1) {
      depositTo(w, j.dst, j.item, dt);
      const full = j.dst.kind === 'shelf' ? j.dst.n + (j.dst.pend || 0) >= upVal('shelfCap') : j.dst.kind === 'store' ? storeTotal() >= STORE_CAP : j.dst.inN + (j.dst.pend || 0) >= j.dst.inMax;
      if (count(w, j.item) === 0 || full) j.phase = 'done';
    }
  }
  if (j.phase === 'done') { if (j.plant && j.plant.res === w) j.plant.res = null; w.job = null; }
}

// ---------- harvesting helpers ----------
function cutTuft(t, c) {
  if (!t.grown || room(c) <= 0) return false;
  t.grown = false; t.t = 0; t.res = null; t.tall.visible = false;
  puff(t.x, 0.4, t.z, '#e8dc6b', 4, 0.6);
  takeInto(c, 'hay', V3(t.x, 0.5, t.z));
  if (c === player) sfx('pop');
  return true;
}
function pickPlant(s, pl, c) {
  if (!pl.ripe || room(c) <= 0) { pl.res = null; return; }
  pl.ripe = false; pl.t = 0; pl.res = null; pl.fruit.visible = false;
  takeInto(c, s.def.out, V3(pl.x, s.def.plant === 'apple' ? 1.4 : 0.8, pl.z));
  if (c === player) sfx('pop');
}

// ---------- customers ----------
const customers = [];
const ENTRY = [14.2, -3.5], DOOR = [6.5, -6.0], DOOR_IN = [6.5, -8.4], HALL = [6.9, -12.2];
const inShop = (x, z) => z < -7.3 && x > -21 && x < 7.9;
const CUST_COLS = ['#ff9f43', '#5ec8ff', '#ffd34a', '#ff7eb6', '#9fd86b', '#c69bff', '#ff8a6b', '#6fe3c8'];
const queueAt = (ci, i) => [COUNTERS[ci].x + (ci ? 1 : -1) * i * 0.95, COUNTERS[ci].z + 1.4];
let spawnT = 3;
function customerLook(isVip) {
  if (isVip) return { body: '#ffcf3a', hat: 'crown' };
  return { body: pick(CUST_COLS), hat: Math.random() < 0.3 ? 'cap' : (Math.random() < 0.3 ? 'bun' : null), hatColor: pick(CUST_COLS) };
}
function spawnCustomer(from) {
  const shelves = listOf('shelf');
  if (!shelves.length) return null;
  const sh = pick(shelves);
  const p = K.person(customerLook(false));
  const start = from || [ENTRY[0], ENTRY[1] + 4];
  p.root.position.set(start[0], 0, start[1]); scene.add(p.root);
  const need = 1 + Math.floor(Math.random() * Math.min(4, 1 + shelves.length)) + (park.ready ? Math.floor(Math.random() * 3) : 0);
  const path = from ? [[from[0], -10], [14.2, -10], ENTRY, DOOR, DOOR_IN, HALL] : [ENTRY, DOOR, DOOR_IN, HALL];
  path.push([sh.front.x + rand(-0.75, 0.75), sh.front.z + rand(0.2, 1.1)]);
  const c = { p, shelf: sh, item: sh.item, need, got: 0, st: 'in', path, t: 0, face: 0, moving: 0, ci: 0, qi: 99 };
  c.label = label('bubble', '', (o) => { o.copy(c.p.root.position); o.y = 2.05; });
  customers.push(c);
  return c;
}
function stepPath(c, dt, speed) {
  if (!c.path.length) return true;
  const [tx, tz] = c.path[0];
  const dx = tx - c.p.root.position.x, dz = tz - c.p.root.position.z, d = Math.hypot(dx, dz);
  if (d < 0.1) { c.path.shift(); return !c.path.length; }
  const s = Math.min(d, speed * dt); c.p.root.position.x += dx / d * s; c.p.root.position.z += dz / d * s; c.face = Math.atan2(dx, dz); c.moving = 1;
  return false;
}
function queueLen(ci) { return customers.filter((c) => c.ci === ci && (c.st === 'queue' || c.st === 'toQueue')).length; }
function updateCustomers(dt) {
  const shelfN = listOf('shelf').length;
  if (shelfN) {
    spawnT -= dt * upVal('cust') * (events.market > 0 ? 2 : 1) * (park.ready ? 1.5 : 1);
    const maxC = 3 + Math.round(shelfN * 1.5) + (park.ready ? 4 : 0);
    if (spawnT <= 0 && customers.length < maxC) {
      if (park.ready && Math.random() < 0.5) parkCar(); else spawnCustomer();
      spawnT = Math.max(1.6, 7 - shelfN * 0.7) * (0.7 + Math.random() * 0.6);
    }
  }
  const served = COUNTERS.map((c, i) => c.on && (workers.some((w) => w.role === 'cashier' && w.counter === i && dist2(w.p.root.position, c.serve.x, c.serve.z) < 0.6) || dist2(player.p.root.position, c.serve.x, c.serve.z) < 1.3));
  for (let ci = 0; ci < COUNTERS.length; ci++) {
    customers.filter((c) => c.ci === ci && (c.st === 'queue' || c.st === 'toQueue')).sort((a, b) => a.qi - b.qi).forEach((c, i) => { c.qi = i; });
  }
  for (let i = customers.length - 1; i >= 0; i--) {
    const c = customers[i];
    c.moving = 0;
    if (c.st === 'in') { if (stepPath(c, dt, 2.6)) { c.st = 'shop'; c.face = Math.PI; c.t = 0.4; c.patience = 32; } }
    else if (c.st === 'shop') {
      c.t -= dt; c.patience -= dt;
      if (c.t <= 0 && c.shelf.n > 0 && c.got < c.need) {
        c.t = 0.35; c.shelf.n--; c.got++;
        fly(c.item, V3(c.shelf.def.pos[0], 0.8, c.shelf.def.pos[1]), (o) => { o.copy(c.p.root.position); o.y = 1.2; }, 0.25, null);
      }
      if (c.patience <= 0 && c.got < c.need) {
        if (c.got > 0) c.need = c.got;
        else { leaveShop(c); floatText('😞', V3(c.p.root.position.x, 2.2, c.p.root.position.z)); }
      }
      if (c.st === 'shop' && c.got >= c.need) {
        c.ci = COUNTERS[1].on ? (queueLen(1) < queueLen(0) ? 1 : 0) : 0;
        const side = c.ci ? -14.4 : 2.4, pz = c.p.root.position.z;
        c.st = 'toQueue'; c.qi = 99;
        c.path = c.shelf.def.pos[1] < -12 ? [[c.p.root.position.x, -12.1], [side, -12.1], [side, -8.5]] : [[side, pz], [side, -8.5]];
      }
    } else if (c.st === 'toQueue' || c.st === 'queue') {
      if (stepPath(c, dt, 2.6)) {
        const [qx, qz] = queueAt(c.ci, c.qi);
        const pos = c.p.root.position, dx = qx - pos.x, dz = qz - pos.z, d = Math.hypot(dx, dz);
        if (d > 0.08) { const s = Math.min(d, 2.6 * dt); pos.x += dx / d * s; pos.z += dz / d * s; c.face = Math.atan2(dx, dz); c.moving = 1; }
        else { c.st = 'queue'; c.face = Math.PI; }
      }
      if (c.st === 'queue' && c.qi === 0) {
        c.t = (c.t > 0 ? c.t : 0) + (served[c.ci] ? dt : 0);
        if (c.t > 0.5) pay(c);
      }
    } else if (c.st === 'leave') {
      if (stepPath(c, dt, 2.8)) { scene.remove(c.p.root); dropLabel(c.label); customers.splice(i, 1); if (c.car) c.car.waiting = false; continue; }
    }
    turn(c.p, c.face, dt); c.p.anim(dt, c.moving);
    if (c.st === 'shop' || c.st === 'in') setLabel(c.label, badge(c.item, c.got, c.need));
    else if (c.st !== 'leave') setLabel(c.label, ICON.money);
  }
}
function leaveShop(c) {
  c.st = 'leave'; c.label.show = false;
  c.path = [[c.p.root.position.x, -8.6], DOOR_IN, DOOR, ENTRY];
  if (c.home) c.path.push([14.2, -10], [c.home[0], -10], c.home); else c.path.push([ENTRY[0], ENTRY[1] + 14]);
}
function pay(c) {
  const v = Math.round(c.got * ITEMS[c.item].price * upVal('price')) + (pets.cat ? 1 : 0);
  const k = COUNTERS[c.ci];
  k.pile.value += v; setPile(k); sfx('coin');
  floatText('+' + v, V3(k.pile.x, 1.6, k.pile.z), 'money');
  const bag = new THREE.Group(); K.add(bag, K.mesh(G.rbox(0.36, 0.38, 0.24, 0.06), '#f5d9a8'), 0, 0.1, 0); c.p.front.add(bag);
  leaveShop(c);
}

// ---------- parking lot: cars bring customers ----------
const park = { ready: false, cars: [], slots: [] };
for (let i = 0; i < 5; i++) for (const z of [-13.6, -6.4]) park.slots.push({ x: 19.6 + i * 2, z, used: false });
const CAR_COLS = ['#5aa9ff', '#ff7a66', '#ffd34a', '#7fcf6a', '#b48cff', '#ffffff', '#ff9fc4'];
function parkCar() {
  const slot = park.slots.find((s) => !s.used);
  if (!slot) { spawnCustomer(); return; }
  slot.used = true;
  const g = P2.car(pick(CAR_COLS)); g.position.set(14.8, 0, -50); scene.add(g);
  park.cars.push({ g, slot, st: 'come', path: [[14.8, -10.5], [slot.x, -10.5], [slot.x, slot.z]], t: 0, waiting: false });
}
function updateCars(dt) {
  for (let i = park.cars.length - 1; i >= 0; i--) {
    const car = park.cars[i], g = car.g;
    if (car.path.length) {
      const [tx, tz] = car.path[0];
      const dx = tx - g.position.x, dz = tz - g.position.z, d = Math.hypot(dx, dz);
      if (d < 0.15) car.path.shift();
      else { const s = Math.min(d, 9 * dt); g.position.x += dx / d * s; g.position.z += dz / d * s; g.rotation.y = Math.atan2(dx, dz); }
    } else if (car.st === 'come') {
      car.st = 'parked'; car.waiting = true;
      const c = spawnCustomer([car.slot.x, car.slot.z]);
      if (c) { c.home = [car.slot.x, car.slot.z]; c.car = car; } else car.waiting = false;
    } else if (car.st === 'parked' && !car.waiting) {
      car.t += dt;
      if (car.t > 1.2) { car.st = 'go'; car.path = [[car.slot.x, -10.5], [16.2, -10.5], [16.2, 60]]; }
    } else if (car.st === 'go') { scene.remove(g); car.slot.used = false; park.cars.splice(i, 1); }
  }
}

// ---------- pets ----------
const pets = {};
function updatePets(dt, t) {
  if (pets.dog) {
    const d = pets.dog, pp = player.p.root.position, back = V3(pp.x - Math.sin(pFace) * 1.2 + 0.6, 0, pp.z - Math.cos(pFace) * 1.2);
    const dx = back.x - d.g.position.x, dz = back.z - d.g.position.z, dd = Math.hypot(dx, dz);
    const mv = dd > 0.3 ? Math.min(dd, (dd > 3 ? 10 : 6) * dt) : 0;
    if (mv) { d.g.position.x += dx / dd * mv; d.g.position.z += dz / dd * mv; d.g.rotation.y = Math.atan2(dx, dz); }
    d.ph += dt * (mv ? 14 : 4);
    d.b.position.y = mv ? Math.abs(Math.sin(d.ph)) * 0.08 : 0;
    d.tail.rotation.z = Math.sin(t * 12) * 0.5;
  }
  if (pets.cat) { pets.cat.tail.rotation.z = Math.sin(t * 2.5) * 0.4; pets.cat.b.scale.y = 1 + Math.sin(t * 2) * 0.02; }
}

// ---------- special orders: VIP customers, truck, helicopter (only the player can hand these over) ----------
function sellables() { return listOf('shelf').map((s) => s.item); }
function makeOrder(types, lo, hi) {
  const items = sellables(), order = {};
  for (let i = 0; i < types && items.length; i++) { const it = pick(items); order[it] = (order[it] || 0) + Math.round(rand(lo, hi)); }
  return order;
}
function orderValue(order, mult) { let v = 0; for (const k in order) v += order[k] * ITEMS[k].price; return Math.round(v * upVal('price') * mult); }
function orderRows(order) { let r = ''; for (const k in order) if (order[k] > 0) r += costRow(k, order[k]); return r; }
function orderDone(order) { for (const k in order) if (order[k] > 0) return false; return true; }
function feedOrder(order, dropFn, dt, st) {
  st.xfer = (st.xfer || 0) - dt;
  if (st.xfer > 0) return;
  for (const k in order) if (order[k] > 0 && count(player, k) > 0) {
    order[k]--; st.xfer = 0.08; sfx('drop'); giveFrom(player, k, dropFn, null); return;
  }
}
function payBonus(v, at) {
  const k = COUNTERS[0]; k.pile.value += v; setPile(k);
  floatText('+' + fmtMoney(v), at, 'money big'); sfx('vip');
}

const vip = { t: 70, c: null };
function updateVip(dt) {
  if (!isBuilt('market')) return;
  if (!vip.c) {
    vip.t -= dt;
    if (vip.t <= 0) {
      const p = K.person(customerLook(true)); p.root.position.set(ENTRY[0], 0, ENTRY[1] + 4); scene.add(p.root);
      const late = state.built.length > 26;
      const order = makeOrder(late ? 3 : 2, late ? 5 : 3, late ? 9 : 6);
      vip.c = { p, order, value: orderValue(order, 5) + 40, st: 'in', path: [ENTRY, [VIP.x, VIP.z]], patience: 120, face: 0, moving: 0 };
      vip.c.label = label('zone order', '', (o) => o.set(VIP.x, 2.3, VIP.z));
      toast('⭐ 特別客人來了！要親手交貨');
    }
    return;
  }
  const c = vip.c; c.moving = 0;
  if (c.st === 'in' && stepPath(c, dt, 2.6)) { c.st = 'wait'; c.face = -Math.PI / 2; }
  if (c.st === 'wait') {
    c.patience -= dt;
    setLabel(c.label, '<div class="zn">⭐ 特別客人 ' + Math.ceil(c.patience) + '秒</div>' + orderRows(c.order) + '<div class="rew">' + ICON.money + fmtMoney(c.value) + '</div>');
    if (dist2(player.p.root.position, VIP.x, VIP.z) < 1.9) feedOrder(c.order, (o) => { o.copy(c.p.root.position); o.y = 1.3; }, dt, c);
    if (orderDone(c.order)) { payBonus(c.value, V3(VIP.x, 2, VIP.z)); confetti(VIP.x, VIP.z); c.st = 'leave'; c.label.show = false; c.path = [ENTRY, [ENTRY[0], ENTRY[1] + 14]]; }
    else if (c.patience <= 0) { c.st = 'leave'; c.label.show = false; c.path = [ENTRY, [ENTRY[0], ENTRY[1] + 14]]; toast('特別客人走了…'); }
  }
  if (c.st === 'leave' && stepPath(c, dt, 2.8)) { scene.remove(c.p.root); dropLabel(c.label); vip.c = null; vip.t = rand(70, 120); return; }
  turn(c.p, c.face, dt); c.p.anim(dt, c.moving);
}

const truck = { ready: false, st: 'away', t: 25, g: null };
const DOCK = { x: 14.6, z: 6, drop: [12.9, 6] };
function updateTruck(dt) {
  if (!truck.ready) return;
  if (!truck.g) {
    const tr = P.truck(); truck.g = tr.g; truck.bed = tr.bed; truck.g.position.set(DOCK.x, 0, -45); scene.add(truck.g); truck.g.visible = false;
    truck.label = label('zone order', '', (o) => o.set(DOCK.drop[0], 0.4, DOCK.drop[1] + 0.2)); truck.label.show = false;
  }
  truck.t -= dt;
  if (truck.st === 'away' && truck.t <= 0) {
    truck.order = makeOrder(2, 4, 9); truck.value = orderValue(truck.order, 3);
    truck.st = 'come'; truck.g.visible = true; truck.g.position.z = -45;
  }
  if (truck.st === 'come') {
    truck.g.position.z += Math.min(DOCK.z - truck.g.position.z, 12 * dt);
    if (DOCK.z - truck.g.position.z < 0.05) { truck.st = 'wait'; truck.t = 90; truck.label.show = true; toast('🚚 訂單卡車到了！'); }
  }
  if (truck.st === 'wait') {
    setLabel(truck.label, '<div class="zn">🚚 訂單 ' + Math.ceil(truck.t) + '秒</div>' + orderRows(truck.order) + '<div class="rew">' + ICON.money + fmtMoney(truck.value) + '</div>');
    if (dist2(player.p.root.position, DOCK.drop[0], DOCK.drop[1]) < 1.6) feedOrder(truck.order, (o) => { truck.bed.getWorldPosition(o); o.y += 0.2; }, dt, truck);
    if (orderDone(truck.order)) { payBonus(truck.value, V3(DOCK.drop[0], 1.6, DOCK.drop[1])); truck.st = 'leave'; truck.label.show = false; }
    else if (truck.t <= 0) { truck.st = 'leave'; truck.label.show = false; toast('卡車開走了…'); }
  }
  if (truck.st === 'leave') {
    truck.g.position.z += 12 * dt;
    if (truck.g.position.z > 50) { truck.st = 'away'; truck.t = rand(60, 100); truck.g.visible = false; }
  }
}

const HELI = { x: 23.5, z: 6, drop: [20.6, 6] };
const heli = { ready: false, st: 'away', t: 40, obj: null };
function updateHeli(dt) {
  if (!heli.ready) return;
  if (!heli.obj) {
    heli.obj = P2.heli(); heli.obj.g.position.set(HELI.x, 30, HELI.z); heli.obj.g.visible = false; scene.add(heli.obj.g);
    heli.label = label('zone order', '', (o) => o.set(HELI.drop[0], 0.4, HELI.drop[1])); heli.label.show = false;
  }
  const g = heli.obj.g;
  heli.t -= dt;
  if (heli.st !== 'away') heli.obj.rotor.rotation.y += dt * 25;
  if (heli.st === 'away' && heli.t <= 0) {
    heli.order = makeOrder(3, 6, 14); heli.value = orderValue(heli.order, 6) + 300;
    heli.st = 'come'; g.visible = true; g.position.y = 30; toast('🚁 直升機訂單來了！');
  }
  if (heli.st === 'come') { g.position.y = Math.max(0, g.position.y - 8 * dt); if (g.position.y <= 0) { heli.st = 'wait'; heli.t = 150; heli.label.show = true; } }
  if (heli.st === 'wait') {
    setLabel(heli.label, '<div class="zn">🚁 大訂單 ' + Math.ceil(heli.t) + '秒</div>' + orderRows(heli.order) + '<div class="rew">' + ICON.money + fmtMoney(heli.value) + '</div>');
    if (dist2(player.p.root.position, HELI.drop[0], HELI.drop[1]) < 1.7) feedOrder(heli.order, (o) => o.set(HELI.x, 1.2, HELI.z), dt, heli);
    if (orderDone(heli.order)) { payBonus(heli.value, V3(HELI.drop[0], 1.6, HELI.drop[1])); confetti(HELI.x, HELI.z); heli.st = 'leave'; heli.label.show = false; }
    else if (heli.t <= 0) { heli.st = 'leave'; heli.label.show = false; toast('直升機飛走了…'); }
  }
  if (heli.st === 'leave') { g.position.y += 8 * dt; if (g.position.y > 30) { heli.st = 'away'; heli.t = rand(150, 210); g.visible = false; } }
}

const events = { market: 0, rain: 0, next: 90 };
let rainObj = null;
function updateEvents(dt) {
  events.market = Math.max(0, events.market - dt);
  events.rain = Math.max(0, events.rain - dt);
  if (isBuilt('corn')) {
    events.next -= dt;
    if (events.next <= 0) {
      events.next = rand(100, 160);
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
K.add(guide, K.mesh(G.cone(0.48, 0.75, 12), '#ffd23f'), 0, 0, 0).rotation.x = Math.PI;
K.add(guide, K.mesh(G.cyl(0.2, 0.2, 0.6, 10), '#ffd23f'), 0, 0.62, 0);
scene.add(guide);
const pointer = new THREE.Mesh(G.cone(0.28, 0.6, 3), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85 }));
pointer.rotation.x = -Math.PI / 2; const pointerG = new THREE.Group(); pointerG.add(pointer); pointer.position.z = 1.5; scene.add(pointerG);
function nearest(list) {
  const pp = player.p.root.position; let best = null, bd = 1e9;
  for (const q of list) { const d = dist2(pp, q.x, q.z); if (d < bd) { bd = d; best = q; } }
  return best;
}
function affordable(z) {
  for (const k in z.def.cost) { const l = left(z, k); if (l <= 0) continue; if (k === 'money' ? state.money < l : count(player, k) < l) return false; }
  return true;
}
function guideTarget() { return null; }

// ---------- UI ----------
let shownMoney = -1;
function updateMoney() { if (shownMoney !== state.money) { shownMoney = state.money; $('moneyN').textContent = fmtMoney(state.money); } }
function openPanel(kind) {
  const P0 = $('panel'), body = $('pBody');
  P0.classList.remove('hidden');
  $('pTabs').innerHTML = ''; body.innerHTML = '';
  if (kind === 'up') {
    $('pTitle').textContent = '升級';
    const tabs = ['角色', '員工', '農場', '商店'];
    const show = (ti) => {
      openPanel.tab = ti;
      [...$('pTabs').children].forEach((b, i) => b.classList.toggle('on', i === ti));
      body.innerHTML = '';
      if (ti === 1 && !workers.length) { body.innerHTML = '<div class="empty">解鎖第一位員工後開放</div>'; return; }
      if (ti === 1) {
        const n = (r) => workers.filter((w) => w.role === r).length;
        body.insertAdjacentHTML('beforeend', '<div class="chips staff"><span class="chip">收銀員 ×' + n('cashier') + '</span><span class="chip">農夫 ×' + n('farmer') + '</span><span class="chip">理貨員 ×' + n('shelver') + '</span></div>');
      }
      for (const k in UPS) {
        const u = UPS[k]; if (u.tab !== ti) continue;
        if (u.need && !isBuilt(u.need)) { body.insertAdjacentHTML('beforeend', '<div class="row locked"><span class="ricon">' + ICON[u.ic] + '</span><div class="rmid"><b>？？？</b><small>解鎖' + DEF[u.need].name + '後開放</small></div></div>'); continue; }
        const lvl = state.up[k], max = lvl >= u.cost.length;
        const row = document.createElement('div'); row.className = 'row';
        row.innerHTML = '<span class="ricon">' + ICON[u.ic] + '</span><div class="rmid"><b>' + u.name + '</b><small>等級 ' + (lvl + 1) + ' · ' + u.fmt(u.vals[lvl]) + (max ? '' : ' → ' + u.fmt(u.vals[lvl + 1])) + '</small><div class="pips">' + u.vals.map((_, i) => '<i class="' + (i <= lvl ? 'on' : '') + '"></i>').join('') + '</div></div>';
        const b = document.createElement('button'); b.className = 'buy' + (max ? ' max' : (state.money < u.cost[lvl] ? ' poor' : ''));
        b.innerHTML = max ? '已滿級' : ICON.money + fmtMoney(u.cost[lvl]);
        b.onclick = () => {
          if (max || state.money < u.cost[lvl]) { sfx('drop'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 300); return; }
          state.money -= u.cost[lvl]; state.up[k]++; sfx('buy'); updateMoney(); save(); show(ti);
        };
        row.appendChild(b); body.appendChild(row);
      }
    };
    tabs.forEach((t, i) => { const b = document.createElement('button'); b.textContent = t; b.onclick = () => show(i); $('pTabs').appendChild(b); });
    show(openPanel.tab || 0);
  } else if (kind === 'inv') {
    $('pTitle').textContent = '倉庫';
    const carry = {}; for (const it of player.carry) carry[it.type] = (carry[it.type] || 0) + 1;
    let h = '<div class="sec">背包 ' + player.carry.length + '/' + player.cap() + '</div><div class="chips">';
    h += Object.keys(carry).length ? Object.keys(carry).map((k) => '<span class="chip">' + ICON[k] + carry[k] + '</span>').join('') : '<span class="empty">空空的</span>';
    h += '</div><div class="sec">貨架</div><div class="chips">';
    const sh = listOf('shelf');
    h += sh.length ? sh.map((s) => '<span class="chip">' + ICON[s.item] + s.n + '/' + upVal('shelfCap') + '</span>').join('') : '<span class="empty">還沒有貨架</span>';
    if (stations.warehouse) {
      h += '</div><div class="sec">倉庫 ' + storeTotal() + '/' + STORE_CAP + '</div><div class="chips">';
      const ks = Object.keys(state.store).filter((k) => state.store[k] > 0);
      h += ks.length ? ks.map((k) => '<span class="chip">' + ICON[k] + state.store[k] + '</span>').join('') : '<span class="empty">空空的</span>';
    }
    h += '</div><div class="sec">農場與機器</div><div class="chips">';
    for (const s of Object.values(stations)) if (s.kind === 'producer' || s.kind === 'machine') h += '<span class="chip">' + s.def.name + ' ' + ICON[s.def.in] + s.inN + ' → ' + ICON[s.def.out] + s.outN + '</span>';
    h += '</div><div class="sec">進度</div><div class="chips"><span class="chip">已解鎖 ' + state.built.length + '/' + DEFS.length + '</span><span class="chip">總收入 ' + ICON.money + fmtMoney(state.earned) + '</span></div>';
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
function addMoney(v) { state.money += v; state.earned += v; updateMoney(); }
function playerInteract(dt) {
  const pp = player.p.root.position;
  for (const t of tufts) if (t.grown && !t.res && dist2(pp, t.x, t.z) < 0.8) cutTuft(t, player);
  for (const s of listOf('crop')) for (const pl of s.plants) if (pl.ripe && !pl.res && dist2(pp, pl.x, pl.z) < (s.def.plant === 'apple' ? 1.3 : 1.0)) pickPlant(s, pl, player);
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
  player.xfer2 = (player.xfer2 || 0) - dt;
  for (const s of Object.values(stations)) {
    if (s.kind === 'producer' || s.kind === 'machine') {
      if (dist2(pp, s.inPt.x, s.inPt.z) < 1.5 && count(player, s.def.in) > 0) depositTo(player, s, s.def.in, dt);
      if (player.xfer2 <= 0 && dist2(pp, s.outPt.x, s.outPt.z) < 1.5 && s.outN > 0 && room(player) > 0) {
        player.xfer2 = 0.08; s.outN--; sfx('pop'); takeInto(player, s.def.out, V3(s.outPt.x, 0.4, s.outPt.z));
      }
    } else if (s.kind === 'shelf') {
      if (dist2(pp, s.front.x, s.front.z - 0.6) < 1.7 && count(player, s.item) > 0) depositTo(player, s, s.item, dt);
    }
  }
  const wh = stations.warehouse;
  if (wh) {
    if (dist2(pp, wh.depPt.x, wh.depPt.z) < 1.0 && player.carry.length) depositTo(player, wh, player.carry[player.carry.length - 1].type, dt);
    if (player.xfer2 <= 0 && dist2(pp, wh.outPt.x, wh.outPt.z) < 1.0 && room(player) > 0) {
      let best = null; for (const t in state.store) if (state.store[t] > 0 && (!best || state.store[t] > state.store[best])) best = t;
      if (best) { player.xfer2 = 0.08; state.store[best]--; sfx('pop'); takeInto(player, best, V3(wh.outPt.x, 0.5, wh.outPt.z)); }
    }
    const kinds = Object.keys(state.store).filter((k) => state.store[k] > 0).sort((a, b) => state.store[b] - state.store[a]);
    setLabel(wh.label, '<div class="zn">倉庫 ' + storeTotal() + '/' + STORE_CAP + '</div>' + (kinds.length ? '<div class="inv">' + kinds.map((k) => '<span>' + ICON[k] + state.store[k] + '</span>').join('') + '</div>' : '<div class="inv">空的</div>'));
  }
  const reach = pets.dog ? 1.6 + upVal('dogR') : 1.6;
  for (const k of COUNTERS) {
    if (!k.on || k.pile.value <= 0) continue;
    const auto = state.up.autoCash > 0, near = dist2(pp, k.pile.x, k.pile.z) <= reach;
    if (!auto && !near) continue;
    k.pile.tick = (k.pile.tick || 0) - dt;
    if (k.pile.tick > 0) continue;
    k.pile.tick = near ? 0.04 : 0.25;
    const chunk = Math.max(1, Math.ceil(k.pile.value / 12));
    k.pile.value -= chunk; setPile(k);
    if (!near) addMoney(chunk);
    else fly('money', V3(k.pile.x, 0.4, k.pile.z), (o) => { o.copy(player.p.root.position); o.y = 1.6; }, 0.22, () => { addMoney(chunk); sfx('coin'); });
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
  const growK = upVal('grow') * (isBuilt('sprinkler') ? 1.8 : 1) * (events.rain > 0 ? 2 : 1);
  const cap = upVal('shelfCap');
  for (const s of Object.values(stations)) {
    if (s.kind === 'producer' || s.kind === 'machine') {
      const iv = s.kind === 'machine' ? s.def.iv / upVal('mach') : s.def.out === 'milk' ? upVal('barn') : upVal('coop');
      const busy = s.inN > 0 && s.outN < s.outMax;
      if (busy) {
        s.timer += dt;
        if (s.timer >= iv) { s.timer = 0; s.inN--; s.outN++; puff(s.outPt.x, 0.5, s.outPt.z, '#fff4c9', 3, 0.4); }
      }
      if (s.spin) s.spin.rotation.y += dt * (busy ? 9 : 0);
      s.inVis.forEach((m, i) => { m.visible = i < s.inN; });
      s.outVis.forEach((m, i) => { m.visible = i < s.outN; });
      setLabel(s.inLabel, badge(s.def.in, s.inN, s.inMax)); setLabel(s.outLabel, badge(s.def.out, s.outN, s.outMax));
      if (s.animals) for (const a of s.animals) {
        a.t -= dt;
        if (a.t <= 0) { a.t = 1.5 + Math.random() * 3; a.tx = a.home[0] + (Math.random() - 0.5) * 2 * a.rx; a.tz = a.home[1] + (Math.random() - 0.5) * 2 * a.rz; }
        const dx = a.tx - a.g.position.x, dz = a.tz - a.g.position.z, d = Math.hypot(dx, dz);
        if (d > 0.05) { const st = Math.min(d, 0.7 * dt); a.g.position.x += dx / d * st; a.g.position.z += dz / d * st; a.g.rotation.y = Math.atan2(dx, dz); a.b.position.y = Math.abs(Math.sin(t * 12)) * 0.04; }
        else { a.b.rotation.x = s.inN > 0 ? Math.max(0, Math.sin(t * 3 + a.home[0])) * 0.3 : 0; a.b.position.y = 0; }
      }
    } else if (s.kind === 'crop') {
      for (const pl of s.plants) {
        if (!pl.ripe) {
          pl.t += dt * growK;
          pl.fruit.visible = pl.t > s.grow * 0.35;
          pl.fruit.scale.setScalar(Math.min(1, pl.t / s.grow));
          if (pl.t >= s.grow) { pl.ripe = true; pl.fruit.scale.setScalar(1); pops.push({ obj: pl.fruit, t: 0.5 }); }
        }
      }
    } else if (s.kind === 'shelf') {
      if (s.n > cap) s.n = cap;
      s.vis.forEach((m, i) => { m.visible = i < s.n; });
      setLabel(s.label, badge(s.item, s.n, cap));
    }
  }
  for (const sp of sprinklers) {
    sp.ph += dt * 3; sp.head.rotation.y = sp.ph;
    sp.drops.forEach((d, i) => {
      const k = ((sp.ph * 0.6 + i / 6) % 1), a = sp.ph + i * 1.05;
      d.position.set(Math.cos(a) * k * 1.6, 0.65 + Math.sin(k * Math.PI) * 0.6, Math.sin(a) * k * 1.6);
    });
  }
}

function movePlayer(dt) {
  const j = joy.read();
  const sp = upVal('speed');
  const tvx = j.x * sp, tvz = j.y * sp;
  pVel.x += (tvx - pVel.x) * Math.min(1, dt * 14); pVel.z += (tvz - pVel.z) * Math.min(1, dt * 14);
  const pos = player.p.root.position;
  pos.x += pVel.x * dt; pos.z += pVel.z * dt;
  const r = 0.42;
  for (const b of colliders) {
    const cx = Math.max(b.x0, Math.min(pos.x, b.x1)), cz = Math.max(b.z0, Math.min(pos.z, b.z1));
    const dx = pos.x - cx, dz = pos.z - cz, d = Math.hypot(dx, dz);
    if (d < r) {
      if (d > 1e-4) { pos.x = cx + dx / d * r; pos.z = cz + dz / d * r; }
      else { const ex = Math.min(pos.x - b.x0, b.x1 - pos.x), ez = Math.min(pos.z - b.z0, b.z1 - pos.z); if (ex < ez) pos.x = pos.x - b.x0 < b.x1 - pos.x ? b.x0 - r : b.x1 + r; else pos.z = pos.z - b.z0 < b.z1 - pos.z ? b.z0 - r : b.z1 + r; }
    }
  }
  pos.x = Math.max(-20.4, Math.min(28.5, pos.x)); pos.z = Math.max(-17, Math.min(31.4, pos.z));
  const spd = Math.hypot(pVel.x, pVel.z);
  if (spd > 0.3) pFace = Math.atan2(pVel.x, pVel.z);
  turn(player.p, pFace, dt);
  player.p.anim(dt, Math.min(1, spd / 4));
  player.p.back.rotation.x = -Math.min(0.12, spd * 0.015);
  swayStack(player, spd, dt);
}

// ---------- automatic doors and lights ----------
function someoneNear(x, z, r) {
  if (dist2(player.p.root.position, x, z) < r) return true;
  for (const c of customers) if (dist2(c.p.root.position, x, z) < r) return true;
  for (const w of workers) if (dist2(w.p.root.position, x, z) < r) return true;
  return false;
}
function updateDoorsAndLights(dt) {
  const ease = Math.min(1, dt * 7);
  if (shopDoor.d) { shopDoor.k += ((someoneNear(6.5, -7.3, 2.3) ? 1 : 0) - shopDoor.k) * ease; shopDoor.d.open(shopDoor.k); }
  const wh = stations.warehouse;
  if (wh) { wh.k += ((someoneNear(wh.def.pos[0], wh.def.pos[1] + 2.4, 2.8) ? 1 : 0) - wh.k) * ease; wh.door.position.y = wh.k * 1.85; }
  for (const sh of listOf('shelf')) {
    if (!sh.door) continue;
    sh.dk += ((someoneNear(sh.front.x, sh.front.z, 1.9) ? 1 : 0) - sh.dk) * ease;
    sh.door.open(sh.dk);
  }
  const pp = player.p.root.position;
  for (const A of areas) {
    const inside = pp.x > A.x0 && pp.x < A.x1 && pp.z > A.z0 && pp.z < A.z1;
    A.k += ((inside ? 1 : 0) - A.k) * Math.min(1, dt * 4);
    A.light.intensity = A.k * 26;
    const lit = A.k > 0.5;
    if (A.lit !== lit) { A.lit = lit; A.lamps.forEach((l) => l.lit(lit)); }
  }
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
buildCounter(0, true);
for (const def of DEFS) if (isBuilt(def.id)) build(def, true);
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
  for (const w of workers) { updateWorker(w, dt); turn(w.p, w.face, dt); w.p.anim(dt, w.moving); swayStack(w, w.moving ? upVal('wspeed') : 0, dt); }
  updateCustomers(dt);
  updateCars(dt);
  updatePets(dt, T);
  updateVip(dt);
  updateTruck(dt);
  updateHeli(dt);
  updateEvents(dt);
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
  dashMat.opacity = 0.75 + Math.sin(T * 4) * 0.25;
  updateDoorsAndLights(dt);
  const gt = guideTarget(), pp = player.p.root.position;
  guide.visible = !!gt && dist2(pp, gt[0], gt[1]) > 1.2;
  if (gt) { guide.position.set(gt[0], 2.4 + Math.abs(Math.sin(T * 4)) * 0.45, gt[1]); guide.rotation.y += dt * 2; }
  pointerG.visible = !!gt && dist2(pp, gt[0], gt[1]) > 5;
  if (gt) { pointerG.position.set(pp.x, 0.05, pp.z); pointerG.rotation.y = Math.atan2(gt[0] - pp.x, gt[1] - pp.z); }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('on'); }
}
requestAnimationFrame(frame);
addEventListener('visibilitychange', () => { if (document.hidden) save(); });
addEventListener('pagehide', save);

// test hooks
window.__farm = {
  state, stations, player, zones, customers, workers, truck, heli, vip, park, events, DEFS, COUNTERS,
  give(type, n) { for (let i = 0; i < n && room(player) > 0; i++) stackAdd(player, type); },
  cash(n) { state.money += n; updateMoney(); },
  tp(x, z) { player.p.root.position.set(x, 0, z); updateCamera(0, true); },
  build(id) { if (zones[id]) killZone(id); build(DEF[id]); },
  sim(sec) { for (let i = 0; i < sec * 30; i++) step(1 / 30); },
  guide, guideTarget,
  calls: () => renderer.info.render.calls,
  lineup(x, z) { Object.keys(ITEMS).forEach((t, i) => { const m = P.itemMesh(t); m.scale.setScalar(2); m.position.set(x + (i % 5) * 1.1, 0, z + Math.floor(i / 5) * 1.2); scene.add(m); }); },
};
