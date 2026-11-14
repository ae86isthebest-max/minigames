// 海邊漁港 — map 2 of 開心農場鋪. Boats bring fish, process it, run the fish market and a dine-in seafood restaurant.
// Same style kit, controls and UI as the farm (logic adapted from main.js).
import * as THREE from 'three';
import * as K from './kit.js';
import * as P from './props.js';
import * as P2 from './props2.js';
import * as P3 from './props3.js';
import { Joystick } from './input.js';

const { C, G } = K;
const ITEMS = P3.ITEMS;
const itemMesh = P3.itemMesh;
// A pile of one item (crate, shelf, tray, cash pile): all copies are drawn as one instanced mesh per material,
// so a full shelf costs 2 draw calls instead of 48. set(n) shows the first n slots.
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _sc = new THREE.Vector3();
function itemStack(type, parent, slots) {
  const tpl = itemMesh(type), parts = [];
  tpl.updateMatrixWorld(true);
  tpl.traverse((o) => { if (o.isMesh) parts.push(o); });
  const g = new THREE.Group(); g.userData.dyn = true; parent.add(g);
  const ims = parts.map((o) => {
    const im = new THREE.InstancedMesh(o.geometry, o.material, slots.length);
    im.castShadow = o.castShadow; im.receiveShadow = o.receiveShadow; im.count = 0; im.frustumCulled = false; g.add(im);
    return im;
  });
  slots.forEach((sl, i) => {
    _e.set(sl.rx || 0, sl.ry || 0, 0); _q.setFromEuler(_e); _sc.setScalar(sl.s || 1); _m4.compose(sl.p, _q, _sc);
    ims.forEach((im, k) => im.setMatrixAt(i, _m4.clone().multiply(parts[k].matrixWorld)));
  });
  return { g, n: 0, max: slots.length, set(n) { n = Math.max(0, Math.min(this.max, n)); if (n !== this.n) { this.n = n; for (const im of ims) im.count = n; } } };
}
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const dist2 = (a, x, z) => Math.hypot(a.x - x, a.z - z);
const easeBack = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------- layout ----------
const SH_Z = -14.6;
const SHOP = { x0: -9.4, x1: 7.95, z0: -17.4, z1: -7.3 };
const REST = { x0: -23.6, x1: -11.2, z0: -18, z1: -6 };
const R_OUT = [-12.4, -4.9], R_IN = [-12.4, -7.2];
const LANES = [-22.9, -19.6, -16.4, -13.2];
const AISLES = [-14.05, -10.4, -7.2];
const T_POS = [[-14.8, -8.7], [-18.0, -8.7], [-21.2, -8.7], [-14.8, -12.1], [-18.0, -12.1], [-21.2, -12.1]];
const SINK = { x: -12.4, z: -15.8 };
const ENTRY = [11.6, -4.9], DOOR = [6.5, -6.0], DOOR_IN = [6.5, -8.4], HALL = [6.9, -12.2];
const SPAWN = [11.6, 13.5];
const D_SPAWN = [-12.4, 12.5];   // diners walk up the plank path from the west beach
const CRUISE = { x: 9.2, z: 27.5, dockX: 16.3 };
const LIGHT = { x: 17.4, z: -12.6 };
const CRATE_X = 12.4, PIER_X = 13.1;

// ---------- the unlock chain ----------
const DEFS = [
  { id: 'pier1', name: '釣魚碼頭', kind: 'pier', out: 'fish', pz: 2, zone: [10.8, 2], cost: { money: 40 }, req: [] },
  { id: 'seaweed', name: '海帶田', kind: 'crop', out: 'seaweed', plant: 'seaweed', grow: 6, pos: [6.6, 1.8], cost: { money: 30 }, req: [] },
  { id: 'shelfFish', name: '鮮魚冰櫃', kind: 'shelf', fridge: true, item: 'fish', pos: [4.4, SH_Z], cost: { money: 10 }, req: ['pier1'] },
  { id: 'shelfSeaweed', name: '海帶架', kind: 'shelf', item: 'seaweed', pos: [1.4, SH_Z], cost: { money: 15 }, req: ['seaweed'] },
  { id: 'cashier', name: '收銀員', kind: 'hire', role: 'cashier', zone: [6.6, -12.6], cost: { money: 80 }, any: ['shelfFish', 'shelfSeaweed'] },
  { id: 'iceMaker', name: '製冰機', kind: 'machine', mk: 'ice', in: 'fish', out: 'iced', iv: 3, pos: [8.2, 7.6], cost: { money: 200, fish: 6 }, req: ['cashier', 'pier1'] },
  { id: 'shelfIced', name: '冰鮮魚冰櫃', kind: 'shelf', fridge: true, item: 'iced', pos: [-1.6, SH_Z], cost: { money: 160 }, req: ['iceMaker'] },
  { id: 'fisher', name: '漁夫', kind: 'hire', role: 'fisher', zone: [10.0, -1.0], cost: { money: 180 }, req: ['shelfIced'] },
  { id: 'cat', name: '小貓', kind: 'pet', zone: [2.6, -11.6], cost: { money: 260, fish: 10 }, req: ['fisher'] },
  { id: 'shelver', name: '理貨員', kind: 'hire', role: 'shelver', zone: [1.6, -5.8], cost: { money: 320 }, req: ['cat'] },
  { id: 'warehouse', name: '倉庫', kind: 'store', pos: [11.2, -14.4], zone: [11.2, -10.6], cost: { money: 450 }, req: ['shelver'] },
  { id: 'cannery', name: '罐頭工廠', kind: 'machine', mk: 'can', in: 'fish', out: 'can', iv: 4, pos: [2.0, 7.6], cost: { money: 650, fish: 15 }, req: ['warehouse'] },
  { id: 'shelfCan', name: '罐頭架', kind: 'shelf', item: 'can', pos: [-4.6, SH_Z], cost: { money: 480 }, req: ['cannery'] },
  { id: 'restaurant', name: '海鮮餐廳', kind: 'restaurant', zone: [-12.4, -4.0], cost: { money: 1200, seaweed: 15 }, req: ['shelfCan'] },
  { id: 'grill', name: '烤魚爐', kind: 'machine', mk: 'grill', in: 'fish', out: 'grilled', iv: 3.5, pos: [-21.2, -15.6], cost: { money: 700, fish: 12 }, req: ['restaurant'] },
  { id: 'waiter', name: '服務生', kind: 'hire', role: 'waiter', zone: [-13.2, -10.4], cost: { money: 850 }, req: ['grill'] },
  { id: 'table2', name: '第 2 張餐桌', kind: 'table', ti: 1, pos: T_POS[1], cost: { money: 600 }, req: ['waiter'] },
  { id: 'pier2', name: '第二碼頭', kind: 'pier', out: 'fish', pz: 10, zone: [10.8, 10], cost: { money: 1600 }, req: ['table2'] },
  { id: 'paddy', name: '稻田', kind: 'crop', out: 'rice', plant: 'rice', grow: 7, pos: [-15.4, 1.8], cost: { money: 1300 }, req: ['pier2'] },
  { id: 'sushiBar', name: '壽司吧', kind: 'machine', mk: 'sushi', in: 'fish', in2: 'rice', out: 'sushi', iv: 3.5, pos: [-15.2, -15.6], cost: { money: 2200, seaweed: 20 }, req: ['paddy'] },
  { id: 'table3', name: '第 3 張餐桌', kind: 'table', ti: 2, pos: T_POS[2], cost: { money: 1500 }, req: ['sushiBar'] },
  { id: 'washer', name: '洗碗員', kind: 'hire', role: 'washer', zone: [-13.2, -13.0], cost: { money: 1900 }, req: ['table3'] },
  { id: 'dryRack', name: '曬魚架', kind: 'machine', mk: 'dry', in: 'fish', out: 'dried', iv: 5, pos: [-4.4, 7.6], cost: { money: 2600 }, req: ['washer'] },
  { id: 'shelfDried', name: '魚乾架', kind: 'shelf', item: 'dried', pos: [-7.6, SH_Z], cost: { money: 2000 }, req: ['dryRack'] },
  { id: 'shelver2', name: '理貨員', kind: 'hire', role: 'shelver', zone: [-2.4, -5.8], cost: { money: 2800 }, req: ['shelfDried'] },
  { id: 'table4', name: '第 4 張餐桌', kind: 'table', ti: 3, pos: T_POS[3], cost: { money: 3200 }, req: ['shelver2'] },
  { id: 'waiter2', name: '服務生', kind: 'hire', role: 'waiter', zone: [-22.9, -10.4], cost: { money: 3600 }, req: ['table4'] },
  { id: 'cruise', name: '郵輪碼頭', kind: 'cruise', zone: [CRUISE.x, CRUISE.z], cost: { money: 6500 }, req: ['waiter2'] },
  { id: 'fisher2', name: '漁夫', kind: 'hire', role: 'fisher', zone: [7.6, 11.8], cost: { money: 4500 }, req: ['cruise'] },
  { id: 'table5', name: '第 5 張餐桌', kind: 'table', ti: 4, pos: T_POS[4], cost: { money: 5500 }, req: ['fisher2'] },
  { id: 'pier3', name: '第三碼頭', kind: 'pier', out: 'fish', pz: 17, zone: [10.8, 17], cost: { money: 9000 }, req: ['table5'] },
  { id: 'table6', name: '第 6 張餐桌', kind: 'table', ti: 5, pos: T_POS[5], cost: { money: 8500 }, req: ['pier3'] },
  { id: 'shelver3', name: '理貨員', kind: 'hire', role: 'shelver', zone: [-6.4, -5.8], cost: { money: 10000 }, req: ['table6'] },
  { id: 'lighthouse', name: '點亮燈塔', kind: 'lighthouse', note: '漁船出海更快了', zone: [12.2, -8.6], cost: { money: 22000 }, req: ['shelver3'] },
  { id: 'aquarium', name: '水族館', kind: 'aquarium', note: '遊客變多了', pos: [-4, 20.5], zone: [-4, 16.6], cost: { money: 60000 }, req: ['lighthouse'] },
];
const DEF = Object.fromEntries(DEFS.map((d) => [d.id, d]));

const lv = (n, base, k) => Array.from({ length: n }, (_, i) => Math.round(base * Math.pow(k, i) / 10) * 10);
const UPS = {
  cap: { tab: 0, name: '背包容量', ic: 'fish', vals: [6, 10, 14, 18, 24, 30, 36, 44, 52], cost: [30, 80, 150, 260, 420, 700, 1100, 1700], fmt: (v) => v + ' 個' },
  speed: { tab: 0, name: '移動速度', ic: 'run', vals: [4.4, 5, 5.5, 6, 6.5, 7, 7.5], cost: [40, 100, 200, 380, 650, 1000], fmt: (v) => v.toFixed(1) },
  wcap: { tab: 1, name: '員工一次拿多少', ic: 'can', vals: [4, 6, 8, 11, 15, 20, 26], cost: [100, 220, 450, 800, 1400, 2400], fmt: (v) => v + ' 個' },
  wspeed: { tab: 1, name: '員工速度', ic: 'run', vals: [3.4, 3.9, 4.4, 5, 5.6, 6.2, 6.8], cost: [100, 220, 450, 800, 1400, 2400], fmt: (v) => v.toFixed(1) },
  boat: { tab: 2, name: '漁船出海時間', ic: 'boat', need: 'pier1', vals: [12, 10.5, 9, 7.5, 6.5, 5.5], cost: [80, 220, 500, 1000, 1900], fmt: (v) => v + ' 秒' },
  catch: { tab: 2, name: '每趟漁獲', ic: 'fish', need: 'pier1', vals: [3, 4, 5, 6, 7, 8], cost: [120, 320, 750, 1500, 2800], fmt: (v) => v + ' 條' },
  grow: { tab: 2, name: '海帶／稻子生長', ic: 'seaweed', need: 'seaweed', vals: [1, 1.25, 1.5, 1.8, 2.2, 2.6], cost: [100, 280, 600, 1200, 2200], fmt: (v) => '×' + v },
  mach: { tab: 2, name: '機器速度', ic: 'iced', need: 'iceMaker', vals: [1, 1.25, 1.5, 1.8, 2.2, 2.6], cost: [400, 900, 1800, 3200, 5500], fmt: (v) => '×' + v },
  price: { tab: 3, name: '商品售價', ic: 'money', need: 'cashier', vals: [1, 1.1, 1.2, 1.3, 1.4, 1.55, 1.7, 1.85, 2, 2.2, 2.4], cost: lv(10, 200, 1.6), fmt: (v) => '×' + v },
  shelfCap: { tab: 3, name: '貨架容量', ic: 'can', need: 'cashier', vals: [8, 12, 16, 20, 24], cost: [150, 400, 900, 1800], fmt: (v) => v + ' 個' },
  cust: { tab: 3, name: '客人數量', ic: 'run', need: 'cashier', vals: [1, 1.2, 1.4, 1.6, 1.8, 2], cost: [300, 700, 1400, 2600, 4500], fmt: (v) => '×' + v },
  eat: { tab: 3, name: '用餐速度', ic: 'sushi', need: 'restaurant', vals: [7, 6, 5, 4, 3.2, 2.5], cost: [300, 700, 1400, 2600, 4500], fmt: (v) => v + ' 秒吃完' },
  tip: { tab: 3, name: '餐廳小費', ic: 'money', need: 'restaurant', vals: [0, 2, 4, 7, 10, 15], cost: [400, 900, 1800, 3500, 6000], fmt: (v) => '+' + v },
  autoCash: { tab: 3, name: '自動收款', ic: 'money', need: 'waiter2', vals: [0, 1], cost: [6000], fmt: (v) => v ? '錢自動入袋' : '要自己收錢' },
};
const upVal = (k) => UPS[k].vals[state.up[k] || 0];

// small repeatable unlocks next to a building
const GROW = {
  pier1: { start: 1, max: 3, cost: [120, 450], what: '＋1 艘漁船' },
  pier2: { start: 1, max: 3, cost: [1800, 3500], what: '＋1 艘漁船' },
  pier3: { start: 1, max: 3, cost: [9000, 15000], what: '＋1 艘漁船' },
  seaweed: { start: 3, max: 6, cost: [25, 60, 120], what: '＋1 株海帶' },
  paddy: { start: 4, max: 8, cost: [700, 1000, 1400, 1900], what: '＋1 叢稻子' },
};
const lvlOf = (id) => state.lvl[id] || GROW[id].start;

// ---------- save ----------
const SAVE = 'harbor_save_v1';
const blank = () => ({ money: 50, built: [], paid: {}, up: {}, stock: {}, store: {}, lvl: {}, piles: [0], tpiles: {}, earned: 0 });
const state = Object.assign(blank(), { sound: true });
try { Object.assign(state, JSON.parse(localStorage.getItem(SAVE) || '{}')); } catch (e) { /* fresh start */ }
if (params.has('fresh')) Object.assign(state, blank());
for (const k of ['store', 'lvl', 'tpiles', 'stock', 'paid', 'up']) state[k] = state[k] || {};
for (const k in UPS) state.up[k] = state.up[k] || 0;
const isBuilt = (id) => state.built.includes(id);
function save() {
  for (const id in stations) {
    const s = stations[id];
    if (s.kind === 'machine') state.stock[id] = { a: s.inN, b: s.outN, c: s.inN2 || 0 };
    else if (s.kind === 'pier') state.stock[id] = { b: s.outN };
    else if (s.kind === 'shelf') state.stock[id] = { a: s.n };
  }
  state.piles = COUNTERS.map((c) => c.pile.value);
  for (const t of tables) state.tpiles[t.i] = t.pile.value;
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
    else if (kind === 'splash') tone(240, 0.12, 'sine', 0.06);
    else if (kind === 'unlock') [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.09, i * 0.08));
    else if (kind === 'buy') { tone(880, 0.08, 'triangle', 0.08); tone(1320, 0.12, 'triangle', 0.08, 0.07); }
    else if (kind === 'vip') [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.22, 'sine', 0.08, i * 0.1));
  } catch (e) { /* no audio */ }
}

// ---------- renderer / scene ----------
const canvas = $('cv');
const renderer = K.makeRenderer(canvas);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#f3e2b5');
const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 220);
const lights = K.makeLights(scene);
lights.hemi.groundColor.set('#e8d29c');
const joy = new Joystick(canvas, $('ui'));
joy.onStart = () => { if (actx && actx.state === 'suspended') actx.resume(); };

const colliders = [];
const box = (x0, z0, x1, z1) => { const b = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) }; colliders.push(b); return b; };
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- item icons: each item's 3D model rendered once to a small picture ----------
const ICON = {};
function makeIcons() {
  try {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setSize(80, 80); r.outputColorSpace = THREE.SRGBColorSpace;
    const sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight('#fff6e6', '#e8d29c', 1.7));
    const d = new THREE.DirectionalLight('#fff1d6', 1.6); d.position.set(-2, 4, 3); sc.add(d);
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    for (const type of Object.keys(ITEMS)) {
      const m = itemMesh(type); sc.add(m);
      const bb = new THREE.Box3().setFromObject(m), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3()).length();
      cam.position.set(c.x + s * 0.5, c.y + s * 1.6, c.z + s * 1.5); cam.lookAt(c);
      r.render(sc, cam);
      ICON[type] = '<img class="ii" src="' + r.domElement.toDataURL() + '" alt="">';
      sc.remove(m);
    }
    r.dispose(); r.forceContextLoss();
  } catch (e) { /* fall back to emoji */ }
  for (const t in ITEMS) if (!ICON[t]) ICON[t] = '<span class="ic">' + ITEMS[t].icon + '</span>';
  ICON.run = '<span class="ic">👟</span>';
  ICON.boat = '<span class="ic">⛵</span>';
}
makeIcons();

// ---------- static world ----------
const shopDoor = { d: null, k: 0 };
const areas = [];
let shopArea = null;
function makeArea(x0, z0, x1, z1, lamps, lx, lz) {
  const light = new THREE.PointLight('#ffe2a8', 0, 18, 1.6); light.position.set(lx, 3.2, lz); scene.add(light);
  const A = { x0, z0, x1, z1, light, lamps, k: 0 };
  areas.push(A);
  return A;
}
const waves = [];
let foam = null;
const gulls = [];
let lightObj = null;
function buildWorld() {
  const D = new THREE.Group();
  const rnd = mulberry(11);
  // sand, wet sand, shallow and deep sea
  K.add(D, K.mesh(G.plane(100, 150), '#f6e2b0', false, true), -36.4, 0, 6);
  for (let i = 0; i < 46; i++) {
    const r = 1.2 + rnd() * 3, p = K.mesh(G.circle(r, 20), rnd() < 0.5 ? '#f1d8a0' : '#fbecc8', false, true);
    p.position.set(-30 + rnd() * 42, 0.003, -26 + rnd() * 60); p.scale.set(1, 1, 0.6 + rnd() * 0.6); p.rotation.y = rnd() * 3; D.add(p);
  }
  K.add(D, K.mesh(G.plane(1.8, 150), '#ead095', false, true), 12.9, 0.004, 6);
  K.add(D, K.mesh(G.plane(2.4, 150), '#86e0dc', false, true), 14.6, 0.008, 6);
  K.add(D, K.mesh(G.plane(90, 150), '#4cc3d6', false, true), 60.7, 0.006, 6);
  for (let z = -60; z < 75; z += 0.75) K.add(D, K.mesh(G.circle(0.34 + rnd() * 0.18, 12), '#ffffff', false, true), 13.45 + rnd() * 0.2, 0.01, z);
  // boardwalks: in front of the market and along the shore
  for (let x = -12.6; x < 11.0; x += 0.62) K.add(D, K.mesh(G.rbox(0.56, 0.06, 1.5, 0.03, 1), (Math.round(x / 0.62) % 2) ? '#e3ad74' : '#d9a066', false, true), x, 0.03, -4.9);
  for (let z = -4.0; z < 14; z += 0.62) K.add(D, K.mesh(G.rbox(1.3, 0.06, 0.56, 0.03, 1), (Math.round(z / 0.62) % 2) ? '#e3ad74' : '#d9a066', false, true), -12.4, 0.03, z);
  for (let z = -5.6; z < 31; z += 0.62) K.add(D, K.mesh(G.rbox(1.5, 0.06, 0.56, 0.03, 1), (Math.round(z / 0.62) % 2) ? '#e3ad74' : '#d9a066', false, true), 11.6, 0.03, z);
  // fish market shell
  const cx = (SHOP.x0 + SHOP.x1) / 2, w = SHOP.x1 - SHOP.x0 + 0.4;
  K.add(D, K.mesh(G.rbox(w, 0.12, 10.4, 0.06, 2), '#e3f1f6', false, true), cx, 0.06, -12.2);
  for (let x = SHOP.x0; x < SHOP.x1 - 0.8; x += 1.6) for (let z = -17.2; z < -8; z += 1.6) if ((Math.round(x / 1.6) + Math.round(z / 1.6)) % 2 === 0) K.add(D, K.mesh(G.plane(1.58, 1.58), '#cbe5ef', false, true), x + 0.8, 0.125, z + 0.8);
  K.add(D, K.mesh(G.rbox(w, 0.05, 0.6, 0.03, 1), '#cbe5ef', false, true), cx, 0.125, -7.3);
  K.add(D, K.mesh(G.rbox(w, 2.0, 0.4, 0.08), C.white), cx, 1.0, -17.6);
  K.add(D, K.mesh(G.rbox(w + 0.1, 0.22, 0.46, 0.05), '#5aa9ff'), cx, 2.0, -17.6);
  K.add(D, K.mesh(G.rbox(w + 0.05, 0.16, 0.44, 0.04), '#8fd1c4'), cx, 0.5, -17.6);
  for (const x of [-6.5, -1, 4.5]) K.add(D, K.mesh(G.rbox(2.4, 0.8, 0.08, 0.06), '#bfe9ff'), x, 1.25, -17.38);
  for (const x of [SHOP.x0 - 0.2, SHOP.x1]) {
    K.add(D, K.mesh(G.rbox(0.4, 2.0, 10.4, 0.08), C.white), x, 1.0, -12.4);
    K.add(D, K.mesh(G.rbox(0.46, 0.22, 10.5, 0.05), '#5aa9ff'), x, 2.0, -12.4);
  }
  box(SHOP.x0 - 0.4, -17.8, SHOP.x1 + 0.2, -17.4); box(SHOP.x0 - 0.4, -17.6, SHOP.x0, -7.2); box(SHOP.x1 - 0.2, -17.6, SHOP.x1 + 0.2, -7.2);
  const wallPiece = (x0, x1, z) => {
    K.add(D, K.mesh(G.rbox(x1 - x0, 0.55, 0.3, 0.08), C.white), (x0 + x1) / 2, 0.28, z);
    K.add(D, K.mesh(G.rbox(x1 - x0 - 0.1, 0.62, 0.12, 0.04), '#cfeeff'), (x0 + x1) / 2, 0.85, z);
    K.add(D, K.mesh(G.rbox(x1 - x0, 0.14, 0.32, 0.05), '#5aa9ff'), (x0 + x1) / 2, 1.2, z);
    box(x0, z - 0.2, x1, z + 0.2);
  };
  wallPiece(SHOP.x0 - 0.4, 5.35, -7.3); wallPiece(7.65, SHOP.x1 + 0.2, -7.3);
  const sign = P2.signBoard('漁港市場', 4, '#4f9cf0'); sign.position.set(cx, 2.75, -17.55); D.add(sign);
  for (const [x, z] of [[SHOP.x0 + 0.6, -16.8], [7.2, -16.8]]) {
    const b = K.add(D, P3.barrel(), x, 0.12, z);
    K.add(b, K.mesh(G.sphere(0.26, 8, 6), '#8fd1c4'), 0, 0.72, 0).scale.set(1, 0.5, 1);
  }
  // decoration: palms, rocks, umbrellas, buoys, barrels, lamps
  const palmAt = (x, z, s, solid) => { const p = P3.palm(2.6 + rnd() * 1.2, 0.2 + rnd() * 0.5); p.position.set(x, 0, z); p.rotation.y = rnd() * 6; p.scale.setScalar(s); D.add(p); if (solid) box(x - 0.25, z - 0.25, x + 0.25, z + 0.25); };
  for (let i = 0; i < 12; i++) palmAt(-24 + i * 3.4 + rnd(), -20.5 - rnd() * 2.5, 0.9 + rnd() * 0.3, false);
  for (let i = 0; i < 14; i++) palmAt(-26.5 - rnd() * 3, -18 + i * 3.6 + rnd(), 0.9 + rnd() * 0.3, false);
  for (let i = 0; i < 10; i++) palmAt(-22 + i * 4 + rnd(), 33 + rnd() * 2, 0.9 + rnd() * 0.3, false);
  for (const [x, z] of [[-8, -2.2], [8.9, -2.3], [-20.5, -3.2], [-9.5, 14], [7.5, 14.5], [-19.5, 9], [-21.5, 20], [8.5, 22], [-13.5, 27.5], [3, 30]]) palmAt(x, z, 1, true);
  for (const [x, z, s] of [[-20.5, 13.5, 0.55], [-12, 12, 0.4], [9.8, 18.5, 0.45], [-22, 27, 0.6], [4.6, -2.6, 0.35], [14.4, -16, 0.8], [14.2, 30, 0.7]]) {
    const r = P.rock(s); r.position.set(x, 0, z); D.add(r);
    if (x < 12.9) box(x - s * 0.8, z - s * 0.7, x + s * 0.8, z + s * 0.7);
  }
  const umb = [['#ff5a4e', '#ffffff'], ['#5aa9ff', '#ffffff'], ['#ffd34a', '#ff8a6b'], ['#59c25b', '#ffffff'], ['#ff7eb6', '#ffffff']];
  for (let i = 0; i < 6; i++) {
    const x = -12 + i * 3.6 + rnd(), z = 26 + (i % 2) * 2.4 + rnd();
    const u = P3.umbrella(...umb[i % umb.length]); u.position.set(x, 0, z); D.add(u); box(x - 0.15, z - 0.15, x + 0.15, z + 0.15);
    const tw = P3.towel(umb[(i + 2) % umb.length][0]); tw.position.set(x + 0.9, 0, z + 0.4); tw.rotation.y = 0.3 - rnd() * 0.6; D.add(tw);
  }
  K.add(D, P3.beachBall(), -1.5, 0, 24.5);
  K.add(D, P3.beachBall(), 6.8, 0, 27.5);
  for (const [x, z, c] of [[17, -3, '#ff5a4e'], [22.5, 6, '#ffd34a'], [17.5, 14, '#ff5a4e'], [22, 21.5, '#ffd34a'], [26, -4, '#ff5a4e'], [28, 12, '#ffd34a']]) K.add(D, P3.buoy(c), x, 0, z);
  for (const [x, z] of [[10.2, -2.6], [10.2, 15.6], [12.6, 7.4]]) { K.add(D, P3.barrel(), x, 0, z); box(x - 0.32, z - 0.32, x + 0.32, z + 0.32); }
  for (const z of [-2, 6, 14, 22, 29]) { K.add(D, P.lamp(), 12.6, 0, z); box(12.5, z - 0.1, 12.7, z + 0.1); }
  K.add(D, P.lamp(), -11.0, 0, -4.0);
  for (const [x, z, r] of [[-1.2, 12.6, 0], [-8.4, 4.4, 1.57]]) { const n = P3.netRack(); n.position.set(x, 0, z); n.rotation.y = r; D.add(n); box(x - (r ? 0.3 : 1.3), z - (r ? 1.3 : 0.3), x + (r ? 0.3 : 1.3), z + (r ? 1.3 : 0.3)); }
  for (const [x, z] of [[5.4, 12.4], [-7.6, 11.6], [10.0, -7.8]]) { K.add(D, P3.crateStack(), x, 0, z); box(x - 0.75, z - 0.55, x + 0.75, z + 0.55); }
  for (const [x, z] of [[-10.4, 6.8], [4.6, 4.6]]) { K.add(D, P3.lifeRingStand(), x, 0, z); box(x - 0.15, z - 0.15, x + 0.15, z + 0.15); }
  K.bake(D, scene);
  // the market's sliding door and lamps
  shopDoor.d = P2.slidingDoor(2.1); shopDoor.d.g.position.set(6.5, 0.1, -7.3); scene.add(shopDoor.d.g);
  const lamps = [];
  for (const x of [-6.5, -1, 4.5]) { const l = P2.wallLamp(); l.g.position.set(x, 1.75, -17.3); scene.add(l.g); lamps.push(l); }
  shopArea = makeArea(SHOP.x0, SHOP.z0, SHOP.x1, SHOP.z1, lamps, -0.7, -12);
  // lighthouse on its rock island (lit later)
  lightObj = P3.lighthouse(); lightObj.g.position.set(LIGHT.x, 0, LIGHT.z); scene.add(lightObj.g); K.bakeStatic(lightObj.g);
  // gentle waves rolling in to the shore
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(G.plane(0.4, 150), new THREE.MeshBasicMaterial({ color: '#dffbff', transparent: true, opacity: 0, depthWrite: false }));
    m.position.set(26, 0.014, 6); m.renderOrder = 1; scene.add(m);
    waves.push({ m, ph: i / 7 });
  }
  foam = new THREE.Mesh(G.plane(0.7, 150), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.4, depthWrite: false }));
  foam.position.set(13.7, 0.015, 6); foam.renderOrder = 1; scene.add(foam);
  for (const [cx2, cz, r, h, sp] of [[15, -1, 5, 3.4, 0.5], [18, 12, 6, 3.8, -0.4], [4, -1, 7, 4.2, 0.35], [-14, -11, 6, 3.9, -0.45], [0, 21, 8, 3.6, 0.3]]) {
    const gl = P3.gull(); gl.g.scale.setScalar(0.85); scene.add(gl.g); gulls.push({ ...gl, cx: cx2, cz, r, h, sp, ph: rnd() * 6 });
  }
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
let simming = false;
function floatText(text, pos3, cls = '') {
  if (simming) return;
  const el = document.createElement('div'); el.className = 'ftxt ' + cls; el.textContent = text; $('labels').appendChild(el);
  const p = pos3.clone(); p.project(camera);
  el.style.left = ((p.x + 1) / 2 * innerWidth) + 'px'; el.style.top = ((1 - p.y) / 2 * innerHeight) + 'px';
  setTimeout(() => el.remove(), 900);
}
const flyers = [];
function fly(type, from, toFn, dur, done) {
  const m = itemMesh(type); m.position.copy(from); scene.add(m);
  flyers.push({ m, from: from.clone(), toFn, t: 0, dur, done });
}

// ---------- carriers (player and workers carry a stack on their back) ----------
function carrier(p) { return { p, carry: [], incoming: 0, xfer: 0, cap: () => 6 }; }
function stackTop(c, out) {
  let h = 0; for (const it of c.carry) h += ITEMS[it.type].h;
  c.p.back.getWorldPosition(out); out.y += h + 0.15; return out;
}
function restack(c) { let y = 0; for (const it of c.carry) { it.m.position.set(0, y, 0); it.y = y; y += ITEMS[it.type].h; } }
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
function stackAdd(c, type) { const m = itemMesh(type); m.rotation.y = Math.PI / 2; c.p.back.add(m); c.carry.push({ type, m, pop: 1 }); restack(c); }
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
player.p.root.position.set(9.4, 0, 4.2);
scene.add(player.p.root);
const pVel = new THREE.Vector3();
let pFace = 0;
const legsOf = (p) => p.rig.children.filter((o) => o.isGroup && Math.abs(o.position.y - 0.36) < 1e-3);

// ---------- cash counter ----------
const COUNTERS = [{ x: 4.6, z: -9.9, serve: { x: 4.6, z: -11.3 }, pile: { x: 7.0, z: -10.2, value: 0 }, on: false }];
function buildCounter(i) {
  const c = COUNTERS[i]; c.on = true;
  const g = P.counter(); g.position.set(c.x, 0.12, c.z); scene.add(g); K.bakeStatic(g);
  box(c.x - 1.45, c.z - 0.55, c.x + 1.45, c.z + 0.55);
  K.add(scene, K.mesh(G.rbox(1.3, 0.04, 1.3, 0.1), '#c9f0c2', false, true), c.pile.x, 0.14, c.pile.z);
  c.pile.grp = K.add(scene, new THREE.Group(), c.pile.x, 0.16, c.pile.z);
  const slots = [];
  for (let k = 0; k < 40; k++) {
    const col = k % 4, row = Math.floor(k / 4) % 2, lay = Math.floor(k / 8);
    slots.push({ p: V3(-0.3 + (col % 2) * 0.48, lay * 0.07, -0.32 + row * 0.34 + Math.floor(col / 2) * 0.32 - 0.15), ry: (k * 0.37) % 0.3 });
  }
  c.pile.stack = itemStack('money', c.pile.grp, slots);
  c.pile.label = label('badge money', '', (o) => o.set(c.pile.x, 1.2, c.pile.z));
  c.pile.value = state.piles[i] || 0; setPile(c);
}
function setPile(c) {
  const p = c.pile, n = p.value > 0 ? Math.min(40, Math.ceil(p.value / 6)) : 0;
  p.stack.set(n);
  p.label.show = p.value > 0;
  setLabel(p.label, ICON.money + fmtMoney(p.value));
}
function fmtMoney(v) { return v >= 100000 ? (v / 1000).toFixed(0) + 'K' : v >= 10000 ? (v / 1000).toFixed(1) + 'K' : String(v); }

// ---------- stations ----------
const stations = {};
const pops = [];
const later = [];
function popIn(obj) { obj.scale.setScalar(0.01); pops.push({ obj, t: 0 }); }
const PLANTS = { seaweed: P3.seaweedPlant, rice: P3.ricePlant };
const CROP_LAYOUT = {
  seaweed: { w: 3.6, d: 2.8, y: 0.17, spots: [[-1.1, -0.6], [0, -0.6], [1.1, -0.6], [-1.1, 0.6], [0, 0.6], [1.1, 0.6]] },
  rice: { w: 3.6, d: 2.8, y: 0.21, spots: [[-1.2, -0.6], [-0.4, -0.6], [0.4, -0.6], [1.2, -0.6], [-1.2, 0.6], [-0.4, 0.6], [0.4, 0.6], [1.2, 0.6]] },
};
const BOAT_COLS = ['#ff6b5a', '#5aa9ff', '#59c25b', '#ffb347'];
const sink = { g: null, n: 0, stack: null, t: 0 };
const rest = { ready: false };
const cruise = { ready: false, st: 'away', t: 50, ship: null, group: [], order: null, value: 0, label: null };
const tables = [];
const pets = {};
const stats = { meals: 0, angry: 0, sales: 0, cruise: 0 };

function build(def, instant) {
  const id = def.id;
  if (!state.built.includes(id)) state.built.push(id);
  const s = { id, def, kind: def.kind };
  stations[id] = s;
  const pos = def.pos || def.zone;
  if (def.kind === 'pier') {
    const pz = def.pz, g = new THREE.Group(); scene.add(g);
    const pr = P3.pier(7.5); pr.position.set(PIER_X, 0, pz); g.add(pr);
    const cr = P3.crate(); cr.position.set(CRATE_X, 0, pz); g.add(cr);
    const outPt = V3(CRATE_X, 0, pz);
    Object.assign(s, { g, outPt, outN: 0, outMax: 20, pend: 0, boats: [] });
    const slots = [];
    for (let i = 0; i < 20; i++) slots.push({ p: V3(-0.48 + (i % 5) * 0.24, 0.31 + Math.floor(i / 10) * 0.09, -0.2 + (Math.floor(i / 5) % 2) * 0.4), ry: Math.PI / 2 + ((i * 0.7) % 0.5) - 0.25, s: 0.9 });
    s.outStack = itemStack('fish', cr, slots);
    box(CRATE_X - 0.68, pz - 0.5, CRATE_X + 0.68, pz + 0.5);
    const idx = DEFS.filter((d) => d.kind === 'pier').indexOf(def);
    [[15.7, pz + 1.75], [15.7, pz - 1.75], [22.3, pz]].forEach(([mx, mz], i) => {
      const b = P3.boat(BOAT_COLS[(i + idx) % BOAT_COLS.length]);
      b.g.position.set(mx, 0, mz); b.g.rotation.y = Math.PI; scene.add(b.g);
      b.catchBox.visible = false; b.flag.visible = false;
      s.boats.push({ ...b, mx, mz, x: mx, st: 'dock', t: rand(0, 1.5) + i * 1.3, cargo: 0 });
    });
    const st = state.stock[id]; if (st) s.outN = Math.min(s.outMax, st.b || 0);
    if (!instant) { s.outN = 4; const b = s.boats[0]; b.st = 'back'; b.x = b.mx + 7; b.cargo = upVal('catch'); }
    applyGrow(s);
    s.outLabel = label('badge', '', (o) => o.set(CRATE_X, 1.0, pz));
    if (!instant) popIn(g);
  } else if (def.kind === 'machine') {
    const m = P3.machine(def.mk);
    m.g.position.set(pos[0], def.pos[1] < -12 && pos[0] < -11 ? 0.12 : 0, pos[1]); scene.add(m.g);
    const tw = m.inTray.getWorldPosition(new THREE.Vector3()), nw = m.outTray.getWorldPosition(new THREE.Vector3());
    const t2 = m.in2Tray ? m.in2Tray.getWorldPosition(new THREE.Vector3()) : null;
    Object.assign(s, { g: m.g, spin: m.spin, inPt: tw, in2Pt: t2, outPt: nw, inN: 0, inN2: 0, outN: 0, inMax: 12, outMax: 12, timer: 0 });
    const fill = (tray, type, dy) => {
      const slots = [];
      for (let i = 0; i < 12; i++) slots.push({ p: V3(-0.3 + (i % 4) * 0.2, 0.25 + Math.floor(i / 8) * dy, -0.18 + (Math.floor(i / 4) % 2) * 0.3), ry: Math.PI / 2, s: 0.7 });
      return itemStack(type, tray, slots);
    };
    s.inStack = fill(m.inTray, def.in, 0.18); s.outStack = fill(m.outTray, def.out, 0.2);
    if (m.in2Tray) s.in2Stack = fill(m.in2Tray, def.in2, 0.24);
    box(pos[0] - 0.85, pos[1] - 0.8, pos[0] + 0.85, pos[1] + 0.4);
    const st = state.stock[id]; if (st) { s.inN = st.a || 0; s.outN = st.b || 0; s.inN2 = st.c || 0; }
    s.inLabel = label('badge', '', (o) => o.copy(tw).setY(0.95));
    s.outLabel = label('badge', '', (o) => o.copy(nw).setY(0.95));
    if (t2) s.in2Label = label('badge', '', (o) => o.copy(t2).setY(1.45));
    if (!instant) popIn(m.g);
  } else if (def.kind === 'crop') {
    const L = CROP_LAYOUT[def.plant];
    const g = new THREE.Group(); g.position.set(pos[0], 0, pos[1]); scene.add(g);
    g.add(def.plant === 'seaweed' ? P3.pool(L.w, L.d) : P3.paddy(L.w, L.d));
    s.plants = [];
    for (const [x, z] of L.spots) {
      const pl = PLANTS[def.plant](); pl.g.position.set(x, L.y, z); pl.g.userData.dyn = true; pl.fruit.userData.dyn = true; g.add(pl.g); K.bakeStatic(pl.g); K.bakeStatic(pl.fruit);
      s.plants.push({ ...pl, x: pos[0] + x, z: pos[1] + z, ripe: true, t: 0, res: null, ph: Math.random() * 6 });
    }
    s.grow = def.grow; s.g = g; s.w = L.w; s.d = L.d;
    applyGrow(s);
    if (!instant) popIn(g);
  } else if (def.kind === 'shelf') {
    const sh = def.fridge ? P2.fridge() : P.shelf(); sh.g.position.set(pos[0], 0.12, pos[1]); scene.add(sh.g);
    Object.assign(s, { g: sh.g, n: 0, item: def.item, front: V3(pos[0], 0, pos[1] + 1.25), door: sh.door || null, dk: 0 });
    const ih = ITEMS[def.item].h * 0.95, slots = [];
    for (let i = 0; i < 24; i++) slots.push({ p: sh.slots[i % 8].clone().setY(sh.slots[i % 8].y + Math.floor(i / 8) * ih), ry: Math.PI / 2 + (i % 3) * 0.2 - 0.2, s: def.item === 'iced' ? 0.85 : 1 });
    s.stack = itemStack(def.item, sh.g, slots);
    if (!def.fridge) { const ic = itemMesh(def.item); ic.scale.setScalar(0.9); ic.position.set(0, 1.12, -0.38); ic.rotation.x = 0.5; ic.userData.dyn = true; sh.g.add(ic); }
    const st = state.stock[id]; if (st) s.n = st.a || 0;
    s.label = label('badge big', '', (o) => o.set(pos[0], def.fridge ? 1.6 : 1.95, pos[1]));
    box(pos[0] - 0.85, pos[1] - 0.5, pos[0] + 0.85, pos[1] + 0.5);
    if (!instant) popIn(sh.g);
  } else if (def.kind === 'hire') {
    s.worker = makeWorker(def.role, def.zone, !instant);
  } else if (def.kind === 'pet') {
    const c = P.cat(); c.g.position.set(5.6, 1.12, -10.1); c.g.rotation.y = -0.6; scene.add(c.g); pets.cat = { ...c, ph: 0 }; if (!instant) popIn(c.g);
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
  } else if (def.kind === 'restaurant') {
    buildRestaurant(instant);
    buildTable(0, instant);
  } else if (def.kind === 'table') {
    buildTable(def.ti, instant);
  } else if (def.kind === 'cruise') {
    buildCruise(instant);
  } else if (def.kind === 'lighthouse') {
    lightObj.lamp.material = new THREE.MeshBasicMaterial({ color: '#fff3a6' });
    lightObj.beam.visible = true;
  } else if (def.kind === 'aquarium') {
    const g = P3.aquarium(); g.position.set(pos[0], 0, pos[1]); scene.add(g); s.g = g;
    box(pos[0] - 3.2, pos[1] - 2.1, pos[0] + 3.2, pos[1] + 2.1);
    if (!instant) popIn(g);
  }
  if (s.g && s.g.isObject3D) K.bakeStatic(s.g);
  const fx = def.kind === 'pier' ? def.zone : def.kind === 'lighthouse' ? [LIGHT.x, LIGHT.z] : pos;
  if (!instant) { confetti(fx[0], fx[1]); sfx('unlock'); toast('🎉 ' + def.name + ' 完成！' + (def.note ? def.note : '')); }
  refreshZones();
  save();
}
function applyGrow(s) {
  const id = s.id; if (!GROW[id]) return;
  const n = lvlOf(id);
  if (s.boats) s.boats.forEach((b, i) => { const on = i < n; if (on && !b.g.visible) popIn(b.g); b.g.visible = on; });
  const fresh = s.plants && !s.plants.some((q) => q.active);
  if (s.plants) s.plants.forEach((pl, i) => {
    const on = i < n;
    if (on && !pl.active) { pl.g.visible = true; pl.ripe = fresh; pl.t = 0; pl.fruit.visible = fresh; pl.fruit.scale.setScalar(1); if (!fresh) popIn(pl.g); }
    if (!on) { pl.g.visible = false; pl.ripe = false; }
    pl.active = on;
  });
}

// ---------- restaurant ----------
let restArea = null;
function buildRestaurant(instant) {
  const g = K.add(scene, new THREE.Group());
  const cx = (REST.x0 + REST.x1) / 2, w = REST.x1 - REST.x0, d = REST.z1 - REST.z0;
  K.add(g, K.mesh(G.rbox(w, 0.12, d, 0.06, 2), '#e8b67c', false, true), cx, 0.06, (REST.z0 + REST.z1) / 2);
  for (let x = REST.x0 + 0.3; x < REST.x1 - 0.1; x += 0.6) K.add(g, K.mesh(G.rbox(0.03, 0.02, d - 0.3, 0.01), '#cf9a62', false, true), x, 0.125, (REST.z0 + REST.z1) / 2);
  K.add(g, K.mesh(G.rbox(w - 0.4, 0.03, 2.6, 0.02, 1), '#e3f1f6', false, true), cx, 0.135, -16.35);
  for (let x = REST.x0 + 0.4; x < REST.x1 - 0.6; x += 0.8) K.add(g, K.mesh(G.plane(0.38, 2.5), '#cbe5ef', false, true), x + 0.2, 0.152, -16.35);
  K.add(g, K.mesh(G.rbox(w, 2.2, 0.4, 0.08), C.white), cx, 1.1, -17.8);
  K.add(g, K.mesh(G.rbox(w + 0.06, 0.3, 0.44, 0.04), '#8fd1c4'), cx, 0.75, -17.8);
  K.add(g, K.mesh(G.rbox(w + 0.1, 0.22, 0.46, 0.05), '#ff8a6b'), cx, 2.2, -17.8);
  const sign = P2.signBoard('海鮮餐廳', 4, '#ff8a6b'); sign.position.set(cx, 2.9, -17.7); g.add(sign);
  for (const [x0, z0, x1, z1] of [[REST.x0, REST.z1, -13.3, REST.z1], [REST.x0, REST.z1, REST.x0, -17.6], [REST.x1, REST.z1, REST.x1, -17.6]]) g.add(P3.railLine(x0, z0, x1, z1));
  box(REST.x0 - 0.15, REST.z1 - 0.15, -13.2, REST.z1 + 0.15);
  box(REST.x0 - 0.15, -17.8, REST.x0 + 0.15, REST.z1);
  box(REST.x1 - 0.15, -17.8, REST.x1 + 0.15, REST.z1);
  box(REST.x0, -18.1, REST.x1, -17.6);
  for (const [x, c] of [[REST.x0, '#ff6b5a'], [-18.4, '#ffd34a'], [-13.3, '#ff6b5a'], [REST.x1, '#ffd34a']]) K.add(g, P3.lantern(c), x, 0, REST.z1);
  const sk = P3.sink(); sk.position.set(SINK.x, 0.12, SINK.z); g.add(sk);
  sink.g = K.add(scene, new THREE.Group(), SINK.x, 0.12, SINK.z);
  const slots = [];
  for (let i = 0; i < 10; i++) slots.push({ p: V3(-0.2 + (i % 2) * 0.4, 0.82 + Math.floor(i / 2) * 0.06, 0.05) });
  sink.stack = itemStack('plate', sink.g, slots);
  box(SINK.x - 0.55, SINK.z - 0.45, SINK.x + 0.55, SINK.z + 0.45);
  K.bakeStatic(g);
  const lamps = [];
  for (const x of [-21.5, -17.4, -13.3]) { const l = P2.wallLamp(); l.g.position.set(x, 1.85, -17.5); scene.add(l.g); lamps.push(l); }
  restArea = makeArea(REST.x0, REST.z0, REST.x1, REST.z1, lamps, cx, -12);
  rest.ready = true;
  if (!instant) popIn(g);
}
function buildTable(i, instant) {
  if (tables.some((t) => t.i === i)) return;
  const [x, z] = T_POS[i];
  const tb = P3.diningTable(); tb.g.position.set(x, 0.12, z); scene.add(tb.g);
  const t = { i, x, z, g: tb.g, st: 'free', seats: [], pile: { value: state.tpiles[i] || 0, vis: [] }, patience: 0, claim: null, t: 0, arrived: 0 };
  for (const sd of tb.seats) {
    const seat = { wx: x + sd.x, wz: z + sd.z, face: sd.face, dish: null, got: false, eaten: false, diner: null, claim: null, vis: {} };
    for (const type of ['sushi', 'grilled', 'plate']) {
      const m = itemMesh(type); m.position.copy(sd.dish); m.visible = false; m.userData.dyn = true; tb.g.add(m); seat.vis[type] = m;
    }
    t.seats.push(seat);
  }
  for (let k = 0; k < 4; k++) { const m = itemMesh('money'); m.scale.setScalar(0.8); m.position.set(0.36, 0.83 + k * 0.05, (k % 2) * 0.06 - 0.03); m.rotation.y = Math.PI / 2 + k * 0.2; m.visible = false; m.userData.dyn = true; tb.g.add(m); t.pile.vis.push(m); }
  K.bakeStatic(tb.g);
  box(x - 0.66, z - 0.66, x + 0.66, z + 0.66);
  t.label = label('bubble order', '', (o) => o.set(x, 2.15, z)); t.label.show = false;
  t.pile.label = label('badge money', '', (o) => o.set(x + 0.7, 1.15, z + 0.3));
  setTablePile(t);
  tables.push(t);
  if (!instant) popIn(tb.g);
}
function setTablePile(t) {
  const p = t.pile, n = p.value > 0 ? Math.min(4, Math.ceil(p.value / 15)) : 0;
  p.vis.forEach((m, i) => { m.visible = i < n; });
  p.label.show = p.value > 0;
  setLabel(p.label, ICON.money + fmtMoney(p.value));
}

// ---------- cruise terminal ----------
function buildCruise(instant) {
  const g = K.add(scene, new THREE.Group());
  const pr = P3.pier(CRUISE.dockX - 1.7 - PIER_X, 2.6); pr.position.set(PIER_X, 0, CRUISE.z); g.add(pr);
  K.add(g, K.mesh(G.circle(1.9, 28), '#ff8fb1', false, true), CRUISE.x, 0.035, CRUISE.z);
  K.add(g, K.mesh(G.circle(1.55, 28), '#ffd1e0', false, true), CRUISE.x, 0.04, CRUISE.z);
  for (const s of [-1, 1]) { K.add(g, K.mesh(G.cyl(0.08, 0.1, 1.0, 8), '#ffd34a'), CRUISE.x + 2.2, 0.5, CRUISE.z + s * 1.4); box(CRUISE.x + 2.1, CRUISE.z + s * 1.4 - 0.1, CRUISE.x + 2.3, CRUISE.z + s * 1.4 + 0.1); }
  const sb = P2.signBoard('郵輪碼頭', 2.4, '#5aa9ff'); sb.scale.setScalar(0.7); sb.position.set(CRUISE.x + 2.2, 1.35, CRUISE.z); sb.rotation.y = -Math.PI / 2; g.add(sb);
  K.bakeStatic(g);
  cruise.ready = true;
  if (!instant) popIn(g);
}

// ---------- zones ----------
const zones = {};
const dashTex = K.dashTexture();
const dashMat = new THREE.MeshBasicMaterial({ map: dashTex, transparent: true, depthWrite: false });
const fillMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false });
function refreshZones() {
  for (const def of DEFS) {
    if (isBuilt(def.id)) { if (zones[def.id]) killZone(def.id); continue; }
    const open = def.req ? def.req.every(isBuilt) : def.any.some(isBuilt);
    if (open && !zones[def.id]) makeZone(def);
  }
  for (const key in GROW) if (zones['g_' + key] && lvlOf(key) >= GROW[key].max) killZone('g_' + key);
  for (const def of growDefs()) {
    const z = zones[def.id];
    if (z && z.def.lv !== def.lv) killZone(def.id);
    if (!zones[def.id]) makeZone(def);
  }
}
function frontOf(def) {
  if (def.kind === 'pier') return [10.4, def.pz + 2.6];
  if (def.kind === 'crop') return [def.pos[0], def.pos[1] + CROP_LAYOUT[def.plant].d / 2 + 1.5];
  if (def.kind === 'machine' || def.kind === 'shelf' || def.kind === 'table') return [def.pos[0], def.pos[1] + 1.7];
  return def.zone || def.pos;
}
function zoneSpot(def) { return def.zone || frontOf(def); }
function growDefs() {
  const out = [];
  for (const key in GROW) {
    const g = GROW[key], n = lvlOf(key);
    if (n >= g.max || !isBuilt(key)) continue;
    out.push({ id: 'g_' + key, name: g.what, kind: 'grow', target: key, lv: n, zone: frontOf(DEF[key]), cost: { money: g.cost[Math.min(n - g.start, g.cost.length - 1)] } });
  }
  return out;
}
function grow(def) {
  state.lvl[def.target] = lvlOf(def.target) + 1;
  applyGrow(stations[def.target]);
  confetti(def.zone[0], def.zone[1]); sfx('unlock'); toast('🎉 ' + def.name + '！');
  refreshZones(); save();
}
function makeZone(def) {
  const [x, z] = zoneSpot(def);
  const g = new THREE.Group(); g.position.set(x, def.kind === 'machine' && x < -11 ? 0.15 : 0.03, z); scene.add(g);
  if (z < -6 && x > REST.x0 && x < REST.x1) g.position.y = 0.15;
  if (z < -7.3 && x > SHOP.x0 && x < SHOP.x1) g.position.y = 0.15;
  const ring = new THREE.Mesh(G.plane(2.4, 2.4), dashMat); ring.renderOrder = 2; g.add(ring);
  const fill = new THREE.Mesh(G.plane(1.9, 1.9), fillMat); fill.renderOrder = 2; fill.position.y = 0.005; fill.scale.set(1, 1, 0.001); g.add(fill);
  if (def.kind === 'hire') g.add(P2.ghostPerson());
  const paid = state.paid[def.id] || {};
  const z0 = { def, g, fill, x, z, paid, total: Object.values(def.cost).reduce((a, b) => a + b, 0), tick: 0, armed: dist2(player.p.root.position, x, z) > 1.5 };
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
    if (dist2(player.p.root.position, z.x, z.z) > 1.35) { z.tick = 0; z.armed = true; continue; }
    if (!z.armed) continue;
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
      if (done) { delete state.paid[id]; const d = z.def; later.push({ t: 0.3, fn: () => (d.kind === 'grow' ? grow(d) : build(d)) }); killZone(id); }
    }
  }
}

// ---------- routing: market door, restaurant gate and aisles ----------
const inShop = (x, z) => z < SHOP.z1 && z > SHOP.z0 - 0.4 && x > SHOP.x0 && x < SHOP.x1;
const inRest = (x, z) => rest.ready && z < REST.z1 && z > REST.z0 && x > REST.x0 && x < REST.x1;
const areaOf = (x, z) => (inShop(x, z) ? 'shop' : inRest(x, z) ? 'rest' : 'out');
function nearestOf(list, v) { let b = list[0]; for (const l of list) if (Math.abs(l - v) < Math.abs(b - v)) b = l; return b; }
// inside the restaurant: walk along clear lanes between the tables
function rPath(fx, fz, tx, tz) {
  const a0 = nearestOf(LANES, fx), a1 = nearestOf(LANES, tx), pts = [[a0, fz]];
  if (a0 !== a1) { const L = nearestOf(AISLES, (fz + tz) / 2); pts.push([a0, L], [a1, L]); }
  pts.push([a1, tz], [tx, tz]);
  return pts;
}
function routeFor(fx, fz, tx, tz) {
  const a = areaOf(fx, fz), b = areaOf(tx, tz), r = [];
  if (a === b) { if (a === 'rest') r.push(...rPath(fx, fz, tx, tz)); else r.push([tx, tz]); return r; }
  if (a === 'shop') r.push(HALL, DOOR_IN, DOOR);
  else if (a === 'rest') r.push(...rPath(fx, fz, R_IN[0], R_IN[1]), R_OUT);
  if (b === 'shop') r.push(DOOR, DOOR_IN, HALL, [tx, tz]);
  else if (b === 'rest') r.push(R_OUT, R_IN, ...rPath(R_IN[0], R_IN[1], tx, tz));
  else r.push([tx, tz]);
  return r;
}

// ---------- workers ----------
const workers = [];
const LOOKS = {
  cashier: { body: '#b48cff', hat: 'bun', hatColor: '#7a4fd6', apron: C.white },
  fisher: { body: '#ffd34a', hat: 'cap', hatColor: '#ff6b5a', legs: '#4f8fe8' },
  shelver: { body: '#5aa9ff', hat: 'cap', hatColor: '#ffd34a', apron: '#ffd34a' },
  waiter: { body: '#fbfaf5', hat: 'bun', hatColor: '#5b3a2c', apron: '#4a4f5a', legs: '#4a4f5a' },
  washer: { body: '#7fd6c9', hat: 'cap', hatColor: '#ffffff', apron: '#5aa9ff' },
};
function makeWorker(role, at, pop) {
  const p = K.person(LOOKS[role]);
  p.root.position.set(at[0], 0, at[1]); scene.add(p.root); if (pop) popIn(p.root);
  const w = carrier(p);
  Object.assign(w, { role, job: null, wait: 0, face: 0, moving: 0 });
  w.cap = () => upVal('wcap');
  workers.push(w);
  return w;
}
function go(w, x, z, dt, speed) {
  const key = x.toFixed(2) + ',' + z.toFixed(2);
  if (w.routeKey !== key) { w.routeKey = key; const p = w.p.root.position; w.route = routeFor(p.x, p.z, x, z); }
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
  if (!w.wp || w.wait <= 0) { w.wp = [cx + (Math.random() - 0.5) * 2.4, cz + (Math.random() - 0.5) * 1.6]; w.wait = 2 + Math.random() * 2; }
  go(w, w.wp[0], w.wp[1], dt, 1.6);
}
const STORE_CAP = 200;
const storeTotal = () => Object.values(state.store).reduce((a, b) => a + b, 0);
const srcCount = (src, item) => src.kind === 'store' ? (state.store[item] || 0) : src.outN;
function srcTake(src, item) { if (src.kind === 'store') state.store[item]--; else src.outN--; }
const machIns = (m) => (m.def.in2 ? [m.def.in, m.def.in2] : [m.def.in]);
const inCount = (m, item) => (item === m.def.in2 ? m.inN2 : m.inN);
const inPend = (m, item) => (item === m.def.in2 ? (m.pend2 || 0) : (m.pend || 0));
function sourceFor(item, w) {
  let best = null, bd = 1e9;
  for (const s of Object.values(stations)) {
    let ok = false;
    if ((s.kind === 'pier' || s.kind === 'machine') && s.def.out === item && s.outN > 0) ok = true;
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
  const only = w.role === 'fisher' ? 'fish' : null;
  const want = (it) => customers.filter((c) => c.st === 'shop' && c.item === it).length;
  let best = null;
  const cap = upVal('shelfCap');
  for (const s of listOf('shelf')) {
    if (only && s.item !== only) continue;
    const space = cap - s.n - (s.pend || 0); if (space < 2) continue;
    const src = sourceFor(s.item, w); if (!src) continue;
    const taken = workers.some((o) => o !== w && o.job && o.job.dst === s);
    const k = want(s.item) * 8 + space + Math.random() * 2 - (taken ? 12 : 0);
    if (!best || k > best.k) best = { k, dst: s, src, item: s.item };
  }
  for (const m of listOf('machine')) for (const item of machIns(m)) {
    if (only && item !== only) continue;
    const space = m.inMax - inCount(m, item) - inPend(m, item); if (space < 3) continue;
    const src = sourceFor(item, w); if (!src) continue;
    const taken = workers.some((o) => o !== w && o.job && o.job.dst === m && o.job.item === item);
    const dish = m.def.out === 'sushi' || m.def.out === 'grilled';
    const k = space * 0.9 + (inCount(m, item) === 0 ? 5 : 0) + (dish && demandFor(m.def.out) ? 6 : 0) + Math.random() * 2 - (taken ? 12 : 0);
    if (!best || k > best.k) best = { k, dst: m, src, item };
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
    giveFrom(c, item, (o) => o.set(dst.def.pos[0], 0.9, dst.def.pos[1]), () => { dst.pend--; dst.n++; });
  } else if (dst.kind === 'machine') {
    const two = item === dst.def.in2;
    if (inCount(dst, item) + inPend(dst, item) >= dst.inMax) return;
    c.xfer = 0.1;
    if (two) dst.pend2 = (dst.pend2 || 0) + 1; else dst.pend = (dst.pend || 0) + 1;
    const pt = two ? dst.in2Pt : dst.inPt;
    giveFrom(c, item, (o) => o.copy(pt).setY(0.4), () => {
      if (two) { dst.pend2--; dst.inN2 = Math.min(dst.inMax, dst.inN2 + 1); } else { dst.pend--; dst.inN = Math.min(dst.inMax, dst.inN + 1); }
    });
  }
  if (c === player) sfx('drop');
}
function dstPoint(dst, item) {
  if (dst.kind === 'shelf') return dst.front;
  if (dst.kind === 'store') return dst.depPt;
  const pt = item === dst.def.in2 ? dst.in2Pt : dst.inPt;
  return V3(pt.x, 0, pt.z + 0.9);
}
function isFull(dst, item) {
  if (dst.kind === 'shelf') return dst.n + (dst.pend || 0) >= upVal('shelfCap');
  if (dst.kind === 'store') return storeTotal() >= STORE_CAP;
  return inCount(dst, item) + inPend(dst, item) >= dst.inMax;
}
function updateWorker(w, dt) {
  const sp = upVal('wspeed');
  w.moving = 0;
  if (w.role === 'cashier') { const c = COUNTERS[0]; if (walkTo(w, c.serve.x, c.serve.z, dt, sp)) w.face = 0; return; }
  if (w.role === 'waiter') { updateWaiter(w, dt, sp); return; }
  if (w.role === 'washer') { updateWasher(w, dt, sp); return; }
  // fisher (fish only) and shelver: fetch a full load from a source, then deliver it to a shelf or a machine
  const home = w.role === 'fisher' ? [10.0, 4.8] : [0, -4.4];
  if (!w.job) {
    if (w.carry.length && !w.incoming) {
      const type = w.carry[w.carry.length - 1].type;
      const dst = listOf('shelf').find((s) => s.item === type && !isFull(s, type)) || listOf('machine').find((m) => machIns(m).includes(type) && !isFull(m, type)) || (stations.warehouse && storeTotal() < STORE_CAP ? stations.warehouse : null);
      if (dst) w.job = { dst, item: type, phase: 'put' };
      else { w.hold = (w.hold || 0) + dt; if (w.hold > 8) { w.hold = 0; w.carry.splice(0).forEach((it) => w.p.back.remove(it.m)); } idleWander(w, dt, home[0], home[1]); return; }
    } else if (!w.incoming) w.job = pickJob(w);
    if (!w.job) { idleWander(w, dt, home[0], home[1]); return; }
  }
  const j = w.job;
  if (j.phase === 'get') {
    const src = j.src;
    if (room(w) <= 0) { j.phase = 'put'; return; }
    if (src.kind === 'crop') {
      let pl = j.plant;
      if (!pl || !pl.ripe || (pl.res && pl.res !== w)) { pl = src.plants.find((q) => q.ripe && (!q.res || q.res === w)); j.plant = pl; if (pl) pl.res = w; }
      if (!pl) { j.phase = count(w, j.item) ? 'put' : 'done'; }
      else if (go(w, pl.x, pl.z + 0.7, dt, sp)) { pickPlant(src, pl, w); j.plant = null; }
    } else {
      const sx = src.kind === 'store' ? src.outPt.x : src.outPt.x + 0.3, sz = src.kind === 'store' ? src.outPt.z : src.outPt.z + (src.kind === 'pier' ? 0 : 0.9);
      const gx = src.kind === 'pier' ? src.outPt.x - 1.1 : sx;
      if (go(w, gx, sz, dt, sp) || dist2(w.p.root.position, src.outPt.x, src.outPt.z) < 1.3) {
        w.xfer -= dt;
        if (w.xfer <= 0 && srcCount(src, j.item) > 0 && room(w) > 0) { w.xfer = 0.1; srcTake(src, j.item); takeInto(w, j.item, V3(src.outPt.x, 0.4, src.outPt.z)); }
        if ((srcCount(src, j.item) <= 0 || room(w) <= 0) && !w.incoming) j.phase = count(w, j.item) ? 'put' : 'done';
      }
    }
  } else if (j.phase === 'put') {
    if (!w.incoming) {
      const p = dstPoint(j.dst, j.item);
      if (go(w, p.x + 0.4, p.z, dt, sp) || dist2(w.p.root.position, p.x, p.z) < 1.1) {
        depositTo(w, j.dst, j.item, dt);
        if (count(w, j.item) === 0 || isFull(j.dst, j.item)) j.phase = 'done';
      }
    }
  }
  if (j.phase === 'done') { if (j.plant && j.plant.res === w) j.plant.res = null; w.job = null; }
}

// waiter: take dishes from the grill / sushi bar to the tables that ordered them
function seatOk(t, s, type) { return t.st === 'wait' && s.diner && s.dish === type && !s.got; }
function demandFor(type) { let n = 0; for (const t of tables) for (const s of t.seats) if (seatOk(t, s, type)) n++; return n; }
function dishSource(type, w) {
  let best = null, bd = 1e9;
  for (const s of Object.values(stations)) {
    const ok = (s.kind === 'machine' && s.def.out === type && s.outN > 0) || (s.kind === 'store' && (state.store[type] || 0) > 0);
    if (!ok) continue;
    const d = dist2(w.p.root.position, s.outPt.x, s.outPt.z);
    if (d < bd) { bd = d; best = s; }
  }
  return best;
}
const laneSpot = (t) => [t.x + 1.6, t.z];
function giveDish(c, t, s) {
  s.got = true; s.claim = null;
  const to = s.vis[s.dish].getWorldPosition(new THREE.Vector3());
  const seatRef = s, tRef = t;
  giveFrom(c, s.dish, (o) => o.copy(to), () => { if (tRef.st === 'wait' || tRef.st === 'eat') seatRef.vis[seatRef.dish].visible = true; });
  if (c === player) sfx('drop');
}
function updateWaiter(w, dt, sp) {
  if (w.incoming) return;
  if (w.carry.length) {
    const type = w.carry[w.carry.length - 1].type;
    let tg = w.tg;
    if (tg && !(seatOk(tg.t, tg.s, type) && (!tg.s.claim || tg.s.claim === w))) tg = null;
    if (!tg) {
      let bd = 1e9;
      for (const t of tables) for (const s of t.seats) if (seatOk(t, s, type) && (!s.claim || s.claim === w)) { const d = dist2(w.p.root.position, t.x, t.z) - (s.claim === w ? 50 : 0); if (d < bd) { bd = d; tg = { t, s }; } }
      if (tg) tg.s.claim = w;
    }
    w.tg = tg;
    if (!tg) {
      // nobody wants it any more: put it back on the counter it came from
      w.hold = (w.hold || 0) + dt;
      if (w.hold < 4) { idleWander(w, dt, -12.6, -11.0); return; }
      const back = listOf('machine').find((m) => m.def.out === type && m.outN < m.outMax) || stations.warehouse;
      if (!back) { w.carry.splice(0).forEach((it) => w.p.back.remove(it.m)); w.hold = 0; return; }
      const pt = back.kind === 'store' ? back.depPt : V3(back.outPt.x, 0, back.outPt.z + 0.9);
      if (go(w, pt.x, pt.z, dt, sp)) {
        w.xfer -= dt;
        if (w.xfer <= 0) {
          w.xfer = 0.1;
          if (back.kind === 'store') giveFrom(w, type, (o) => o.copy(back.depPt).setY(0.8), () => { state.store[type] = (state.store[type] || 0) + 1; });
          else giveFrom(w, type, (o) => o.copy(back.outPt).setY(0.4), () => { back.outN = Math.min(back.outMax, back.outN + 1); });
        }
      }
      if (!w.carry.length) w.hold = 0;
      return;
    }
    w.hold = 0;
    const [ax, az] = laneSpot(tg.t);
    if (go(w, ax, az, dt, sp) || (dist2(w.p.root.position, tg.t.x, tg.t.z) < 1.75 && areaOf(w.p.root.position.x, w.p.root.position.z) === 'rest')) {
      w.xfer -= dt;
      if (w.xfer <= 0) { w.xfer = 0.15; giveDish(w, tg.t, tg.s); w.tg = null; }
    }
    return;
  }
  // empty handed: choose the dish most wanted that can be fetched, and claim those seats
  if (!w.job) {
    let bestType = null, bestN = 0;
    for (const type of ['sushi', 'grilled']) {
      let n = 0; for (const t of tables) for (const s of t.seats) if (seatOk(t, s, type) && !s.claim) n++;
      if (n > bestN && dishSource(type, w)) { bestN = n; bestType = type; }
    }
    if (bestType) {
      let k = 0;
      for (const t of tables) for (const s of t.seats) if (k < w.cap() && seatOk(t, s, bestType) && !s.claim) { s.claim = w; k++; }
      w.job = { item: bestType, src: dishSource(bestType, w) };
    }
  }
  const j = w.job;
  if (!j) { idleWander(w, dt, -12.6, -11.0); return; }
  const mine = () => { let n = 0; for (const t of tables) for (const s of t.seats) if (s.claim === w && seatOk(t, s, j.item)) n++; return n; };
  const src = j.src;
  if (!mine() || srcCount(src, j.item) <= 0) {
    for (const t of tables) for (const s of t.seats) if (s.claim === w) s.claim = null;
    w.job = null; return;
  }
  const pt = src.kind === 'store' ? src.outPt : V3(src.outPt.x, 0, src.outPt.z + 0.9);
  if (go(w, pt.x, pt.z, dt, sp)) {
    w.xfer -= dt;
    if (w.xfer <= 0 && w.carry.length + w.incoming < mine() && room(w) > 0 && srcCount(src, j.item) > 0) { w.xfer = 0.1; srcTake(src, j.item); takeInto(w, j.item, V3(src.outPt.x, 0.4, src.outPt.z)); }
    if (w.carry.length + w.incoming >= mine() || srcCount(src, j.item) <= 0 || room(w) <= 0) { if (!w.incoming && w.carry.length) w.job = null; }
  }
}
// washer: clear dirty tables and carry the plates to the sink
function updateWasher(w, dt, sp) {
  if (w.incoming) return;
  if (w.tg && (w.tg.st !== 'dirty' || w.tg.claim !== w)) w.tg = null;
  if (!w.tg && room(w) >= 2) {
    let bd = 1e9, best = null;
    for (const t of tables) if (t.st === 'dirty' && !t.claim) { const d = dist2(w.p.root.position, t.x, t.z); if (d < bd) { bd = d; best = t; } }
    if (best) { best.claim = w; w.tg = best; }
  }
  if (w.tg) {
    const [ax, az] = laneSpot(w.tg);
    if (go(w, ax, az, dt, sp)) { clearTable(w.tg, w); w.tg = null; }
    return;
  }
  if (count(w, 'plate') > 0) {
    if (go(w, SINK.x - 0.9, SINK.z + 1.0, dt, sp)) {
      w.xfer -= dt;
      if (w.xfer <= 0) { w.xfer = 0.08; giveFrom(w, 'plate', (o) => o.set(SINK.x, 1.0, SINK.z), () => { sink.n++; }); }
    }
    return;
  }
  idleWander(w, dt, -12.6, -13.4);
}
function clearTable(t, c) {
  if (t.st !== 'dirty') return;
  for (const s of t.seats) {
    if (!s.vis.plate.visible) continue;
    s.vis.plate.visible = false;
    const from = s.vis.plate.getWorldPosition(new THREE.Vector3());
    if (c === player) fly('plate', from, (o) => o.set(SINK.x, 1.0, SINK.z), 0.45, () => { sink.n++; });
    else takeInto(c, 'plate', from);
  }
  t.st = 'free'; t.claim = null;
  if (c === player) sfx('pop');
}

// ---------- harvesting helper ----------
function pickPlant(s, pl, c) {
  if (!pl.ripe || room(c) <= 0) { pl.res = null; return; }
  pl.ripe = false; pl.t = 0; pl.res = null; pl.fruit.visible = false;
  takeInto(c, s.def.out, V3(pl.x, 0.6, pl.z));
  if (c === player) sfx('pop');
}

// ---------- market customers ----------
const customers = [];
const CUST_COLS = ['#ff9f43', '#5ec8ff', '#ffd34a', '#ff7eb6', '#9fd86b', '#c69bff', '#ff8a6b', '#6fe3c8'];
const queueAt = (i) => [COUNTERS[0].x - i * 0.95, COUNTERS[0].z + 1.4];
let spawnT = 3;
function customerLook() { return { body: pick(CUST_COLS), hat: Math.random() < 0.3 ? 'cap' : (Math.random() < 0.3 ? 'bun' : null), hatColor: pick(CUST_COLS) }; }
const crowd = () => upVal('cust') * (events.tour > 0 ? 2 : 1) * (isBuilt('aquarium') ? 1.5 : 1);
function spawnCustomer() {
  const shelves = listOf('shelf');
  if (!shelves.length) return null;
  const sh = pick(shelves);
  const p = K.person(customerLook());
  p.root.position.set(SPAWN[0], 0, SPAWN[1]); scene.add(p.root);
  const need = 1 + Math.floor(Math.random() * Math.min(4, 1 + shelves.length));
  const path = [ENTRY, DOOR, DOOR_IN, HALL, [sh.front.x + rand(-0.75, 0.75), sh.front.z + rand(0.2, 1.1)]];
  const c = { p, shelf: sh, item: sh.item, need, got: 0, st: 'in', path, t: 0, face: 0, moving: 0, qi: 99 };
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
function updateCustomers(dt) {
  const shelfN = listOf('shelf').length;
  if (shelfN) {
    spawnT -= dt * crowd();
    const maxC = 3 + Math.round(shelfN * 1.5);
    if (spawnT <= 0 && customers.length < maxC) { spawnCustomer(); spawnT = Math.max(1.6, 7 - shelfN * 0.7) * (0.7 + Math.random() * 0.6); }
  }
  const c0 = COUNTERS[0];
  const served = workers.some((w) => w.role === 'cashier' && dist2(w.p.root.position, c0.serve.x, c0.serve.z) < 0.6) || dist2(player.p.root.position, c0.serve.x, c0.serve.z) < 1.3;
  customers.filter((c) => c.st === 'queue' || c.st === 'toQueue').sort((a, b) => a.qi - b.qi).forEach((c, i) => { c.qi = i; });
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
        c.st = 'toQueue'; c.qi = 99;
        c.path = [[c.p.root.position.x, -12.1], [2.4, -12.1], [2.4, -8.5]];
      }
    } else if (c.st === 'toQueue' || c.st === 'queue') {
      if (stepPath(c, dt, 2.6)) {
        const [qx, qz] = queueAt(c.qi);
        const pos = c.p.root.position, dx = qx - pos.x, dz = qz - pos.z, d = Math.hypot(dx, dz);
        if (d > 0.08) { const s = Math.min(d, 2.6 * dt); pos.x += dx / d * s; pos.z += dz / d * s; c.face = Math.atan2(dx, dz); c.moving = 1; }
        else { c.st = 'queue'; c.face = Math.PI; }
      }
      if (c.st === 'queue' && c.qi === 0) {
        c.t = (c.t > 0 ? c.t : 0) + (served ? dt : 0);
        if (c.t > 0.5) pay(c);
      }
    } else if (c.st === 'leave') {
      if (stepPath(c, dt, 2.8)) { scene.remove(c.p.root); dropLabel(c.label); customers.splice(i, 1); continue; }
    }
    c.p.root.position.y = inShop(c.p.root.position.x, c.p.root.position.z) ? 0.12 : 0;
    turn(c.p, c.face, dt); c.p.anim(dt, c.moving);
    if (c.st === 'shop' || c.st === 'in') setLabel(c.label, badge(c.item, c.got, c.need));
    else if (c.st !== 'leave') setLabel(c.label, ICON.money);
  }
}
function leaveShop(c) {
  c.st = 'leave'; c.label.show = false;
  c.path = [[c.p.root.position.x, -8.6], DOOR_IN, DOOR, ENTRY, [SPAWN[0], SPAWN[1] + 1]];
}
function pay(c) {
  const v = Math.round(c.got * ITEMS[c.item].price * upVal('price')) + (pets.cat ? 1 : 0);
  const k = COUNTERS[0]; stats.sales++;
  k.pile.value += v; setPile(k); sfx('coin');
  floatText('+' + v, V3(k.pile.x, 1.6, k.pile.z), 'money');
  const bag = new THREE.Group(); K.add(bag, K.mesh(G.rbox(0.36, 0.38, 0.24, 0.06), '#cfe9ff'), 0, 0.1, 0); c.p.front.add(bag);
  leaveShop(c);
}

// ---------- restaurant diners ----------
const diners = [];
let dinerT = 4;
function menu() { const m = []; if (isBuilt('grill')) m.push('grilled'); if (isBuilt('sushiBar')) m.push('sushi'); return m; }
function spawnGroup(t) {
  const mn = menu(), n = Math.random() < 0.55 ? 2 : 1;
  t.st = 'coming'; t.arrived = 0; t.size = n; t.patience = 90;
  const order = [0, 1].sort(() => Math.random() - 0.5).slice(0, n);
  for (const si of order) {
    const s = t.seats[si];
    const p = K.person(customerLook());
    p.root.position.set(D_SPAWN[0] - 0.4 + Math.random() * 0.8, 0, D_SPAWN[1] + Math.random() * 1.5);
    scene.add(p.root);
    const d = { p, legs: legsOf(p), t, s, st: 'in', face: 0, moving: 0, path: [[D_SPAWN[0], 0], R_OUT, R_IN, ...rPath(R_IN[0], R_IN[1], s.wx, s.wz)] };
    s.diner = d; s.dish = pick(mn); s.got = false; s.claim = null; s.eaten = false;
    diners.push(d);
  }
}
function leaveTable(d) {
  d.st = 'leave'; d.p.root.position.y = 0;
  const pos = d.p.root.position;
  d.path = [...rPath(pos.x, pos.z, R_IN[0], R_IN[1]), R_OUT, [D_SPAWN[0], D_SPAWN[1] + 1.5]];
  d.s.diner = null;
}
function updateDiners(dt, T) {
  const mn = menu();
  if (rest.ready && mn.length) {
    const free = tables.filter((t) => t.st === 'free');
    if (free.length) {
      dinerT -= dt * crowd() * (events.tour > 0 ? 0.75 : 1);
      if (dinerT <= 0) { spawnGroup(pick(free)); dinerT = Math.max(3, 11 - tables.length * 1.2) * rand(0.7, 1.3); }
    }
  }
  for (let i = diners.length - 1; i >= 0; i--) {
    const d = diners[i];
    d.moving = 0;
    if (d.st === 'in') {
      if (stepPath(d, dt, 2.7)) { d.st = 'sit'; d.face = d.s.face; d.t.arrived++; d.p.root.position.set(d.s.wx, 0.18, d.s.wz); }
    } else if (d.st === 'leave') {
      if (stepPath(d, dt, 2.8)) { scene.remove(d.p.root); diners.splice(i, 1); continue; }
    }
    if (d.st !== 'sit') d.p.root.position.y = inRest(d.p.root.position.x, d.p.root.position.z) ? 0.12 : 0;
    turn(d.p, d.face, dt); d.p.anim(dt, d.moving);
    if (d.st === 'sit') {
      for (const l of d.legs) l.rotation.x = -1.35;
      if (d.t.st === 'eat') { d.p.arms[1].rotation.x = -1.1 + Math.sin(T * 10 + i) * 0.35; d.p.arms[0].rotation.x = -0.6; d.p.rig.rotation.x = 0.12 + Math.sin(T * 5 + i) * 0.05; }
      else d.p.rig.rotation.x = 0;
    }
  }
  for (const t of tables) {
    if (t.st === 'coming' && t.arrived >= t.size) t.st = 'wait';
    if (t.st === 'wait') {
      t.patience -= dt;
      const want = t.seats.filter((s) => s.diner && !s.got);
      if (!want.length && t.seats.every((s) => !s.diner || s.vis[s.dish].visible)) { t.st = 'eat'; t.t = upVal('eat'); }
      else if (t.patience <= 0) finishTable(t, true);
      setLabel(t.label, want.map((s) => ICON[s.dish]).join('') + (t.patience < 20 ? '⏳' : ''));
      t.label.el.classList.toggle('late', t.patience < 20);
      t.label.show = want.length > 0;
    } else if (t.st === 'eat') {
      t.t -= dt;
      t.label.show = true; setLabel(t.label, '😋');
      if (t.t <= 0) finishTable(t, false);
    } else if (t.st === 'dirty') {
      t.label.show = true; setLabel(t.label, ICON.plate + '待清理');
    } else t.label.show = false;
  }
}
function finishTable(t, angry) {
  let v = 0, plates = 0;
  for (const s of t.seats) {
    if (!s.diner) continue;
    if (s.vis[s.dish] && s.vis[s.dish].visible) { v += ITEMS[s.dish].price; s.vis[s.dish].visible = false; s.vis.plate.visible = true; plates++; }
    s.claim = null;
    const d = s.diner;
    if (angry) { stats.angry++; floatText('😞', V3(d.p.root.position.x, 2.2, d.p.root.position.z)); } else stats.meals++;
    leaveTable(d);
  }
  t.label.el.classList.remove('late');
  if (v > 0) {
    v = Math.round(v * upVal('price')) + upVal('tip');
    if (state.up.autoCash > 0) addMoney(v); else { t.pile.value += v; setTablePile(t); }
    floatText('+' + v, V3(t.x, 1.6, t.z), 'money'); sfx('coin');
  }
  t.st = plates ? 'dirty' : 'free'; t.claim = null;
}

// ---------- special orders ----------
function sellables() {
  const s = listOf('shelf').map((x) => x.item);
  for (const m of listOf('machine')) if (m.def.out === 'sushi' || m.def.out === 'grilled') s.push(m.def.out);
  return s;
}
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
  for (const k in order) if (order[k] > 0 && count(player, k) > 0) { order[k]--; st.xfer = 0.08; sfx('drop'); giveFrom(player, k, dropFn, null); return; }
}
function bonusToPlayer(v, at) {
  floatText('+' + fmtMoney(v), at, 'money big'); sfx('vip');
  const n = 8;
  for (let i = 0; i < n; i++) {
    const share = i < n - 1 ? Math.floor(v / n) : v - Math.floor(v / n) * (n - 1);
    later.push({ t: i * 0.06, fn: () => fly('money', at.clone().setY(1), (o) => { o.copy(player.p.root.position); o.y = 1.6; }, 0.35, () => { addMoney(share); sfx('coin'); }) });
  }
}
function tourist() { return K.person({ body: pick(['#ff7eb6', '#5ec8ff', '#ffd34a', '#9fd86b', '#ff9f43']), hat: Math.random() < 0.6 ? 'straw' : 'cap', hatColor: pick(CUST_COLS) }); }
function updateCruise(dt) {
  if (!cruise.ready) return;
  if (!cruise.ship) {
    cruise.ship = P3.cruiseShip(); K.bakeStatic(cruise.ship); cruise.ship.position.set(34, 0, 80); cruise.ship.visible = false; scene.add(cruise.ship);
    cruise.label = label('zone order', '', (o) => o.set(CRUISE.x - 0.3, 0.3, CRUISE.z - 2.1)); cruise.label.show = false;
  }
  const sh = cruise.ship;
  cruise.t -= dt;
  const sail = (tx, tz, sp) => {
    const dx = tx - sh.position.x, dz = tz - sh.position.z, d = Math.hypot(dx, dz);
    if (d < 0.05) return true;
    const s = Math.min(d, sp * dt); sh.position.x += dx / d * s; sh.position.z += dz / d * s;
    let diff = Math.atan2(-dx, -dz) - sh.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
    sh.rotation.y += diff * Math.min(1, dt * 1.2); return false;
  };
  if (cruise.st === 'away' && cruise.t <= 0) {
    const late = state.built.length > 30;
    cruise.order = makeOrder(3, late ? 6 : 4, late ? 12 : 8); cruise.value = orderValue(cruise.order, 6) + 300;
    cruise.st = 'come'; sh.visible = true; sh.position.set(34, 0, 80); sh.rotation.y = Math.atan2(7, 54);
    toast('🛳️ 郵輪靠岸！遊客團要訂大單');
  }
  if (cruise.st === 'come' && sail(CRUISE.dockX, CRUISE.z, 9)) {
    cruise.st = 'land';
    for (let i = 0; i < 5; i++) {
      const p = tourist(); p.root.position.set(CRUISE.dockX - 1.9, 0, CRUISE.z + (i - 2) * 0.3); scene.add(p.root);
      const a = Math.PI * (0.35 + i * 0.32);
      cruise.group.push({ p, face: 0, moving: 0, path: [[13.0, CRUISE.z + (i - 2) * 0.35], [CRUISE.x + Math.cos(a) * 1.5, CRUISE.z - Math.sin(a) * 1.5 + 0.2]], delay: i * 0.5 });
    }
  }
  let walking = 0;
  for (const g of cruise.group) {
    g.moving = 0; g.delay -= dt;
    if (g.delay <= 0 && g.path.length) { stepPath(g, dt, 2.6); walking++; }
    else if (!g.path.length) g.face = Math.atan2(CRUISE.x - g.p.root.position.x, CRUISE.z - g.p.root.position.z);
    turn(g.p, g.face, dt); g.p.anim(dt, g.moving);
  }
  if (cruise.st === 'land' && !walking && cruise.group.every((g) => !g.path.length)) { cruise.st = 'wait'; cruise.t = 150; cruise.label.show = true; }
  if (cruise.st === 'wait') {
    setLabel(cruise.label, '<div class="zn">🛳️ 遊客團 ' + Math.ceil(cruise.t) + '秒</div>' + orderRows(cruise.order) + '<div class="rew">' + ICON.money + fmtMoney(cruise.value) + '</div>');
    if (dist2(player.p.root.position, CRUISE.x, CRUISE.z) < 2.2) feedOrder(cruise.order, (o) => o.set(CRUISE.x, 1.0, CRUISE.z), dt, cruise);
    const done = orderDone(cruise.order);
    if (done) { stats.cruise++; bonusToPlayer(cruise.value, V3(CRUISE.x, 2, CRUISE.z)); confetti(CRUISE.x, CRUISE.z); }
    else if (cruise.t <= 0) toast('遊客團回船上了…');
    if (done || cruise.t <= 0) {
      cruise.st = 'board'; cruise.label.show = false;
      cruise.group.forEach((g, i) => { g.delay = i * 0.3; g.path = [[13.0, CRUISE.z], [CRUISE.dockX - 1.9, CRUISE.z]]; });
    }
  }
  if (cruise.st === 'board' && cruise.group.every((g) => !g.path.length)) {
    cruise.group.forEach((g) => scene.remove(g.p.root)); cruise.group = []; cruise.st = 'leave';
  }
  // leave in two legs: swing out to sea, then head north past the piers' far ends
  if (cruise.st === 'leave' && !cruise.leg && sail(27, 14, 6)) cruise.leg = true;
  else if (cruise.st === 'leave' && cruise.leg && sail(33, -80, 9)) { cruise.leg = false; cruise.st = 'away'; cruise.t = rand(150, 220); sh.visible = false; }
}

const events = { contest: 0, tour: 0, next: 80 };
let eventLabel = null;
function updateEvents(dt) {
  events.contest = Math.max(0, events.contest - dt);
  events.tour = Math.max(0, events.tour - dt);
  if (isBuilt('iceMaker')) {
    events.next -= dt;
    if (events.next <= 0) {
      events.next = rand(100, 160);
      if (Math.random() < 0.6) { events.contest = 40; toast('🎣 釣魚比賽！漁獲加倍 40 秒'); }
      else { events.tour = 40; toast('📸 觀光日！客人變多了'); }
    }
  }
  if (!eventLabel) { eventLabel = label('event', '', (o) => o.set(CRATE_X, 2.3, 2)); eventLabel.show = false; }
  eventLabel.show = events.contest > 0 && isBuilt('pier1');
  if (eventLabel.show) setLabel(eventLabel, '🎣 漁獲加倍 ' + Math.ceil(events.contest) + '秒');
}
let toastT = 0;
function toast(msg) { if (simming) return; const el = $('toast'); el.textContent = msg; el.classList.add('on'); toastT = 2.6; }

// ---------- UI ----------
let shownMoney = -1;
function updateMoney() { if (shownMoney !== state.money) { shownMoney = state.money; $('moneyN').textContent = fmtMoney(state.money); } }
function openPanel(kind) {
  const P0 = $('panel'), body = $('pBody');
  P0.classList.remove('hidden');
  $('pTabs').innerHTML = ''; body.innerHTML = '';
  if (kind === 'up') {
    $('pTitle').textContent = '升級';
    const tabs = ['角色', '員工', '漁港', '商店'];
    const show = (ti) => {
      openPanel.tab = ti;
      [...$('pTabs').children].forEach((b, i) => b.classList.toggle('on', i === ti));
      body.innerHTML = '';
      if (ti === 1 && !workers.length) { body.innerHTML = '<div class="empty">解鎖第一位員工後開放</div>'; return; }
      if (ti === 1) {
        const n = (r) => workers.filter((w) => w.role === r).length;
        body.insertAdjacentHTML('beforeend', '<div class="chips staff">' + [['cashier', '收銀員'], ['fisher', '漁夫'], ['shelver', '理貨員'], ['waiter', '服務生'], ['washer', '洗碗員']].map(([r, nm]) => '<span class="chip">' + nm + ' ×' + n(r) + '</span>').join('') + '</div>');
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
    h += '</div><div class="sec">碼頭與機器</div><div class="chips">';
    for (const s of Object.values(stations)) {
      if (s.kind === 'pier') h += '<span class="chip">' + s.def.name + ' ' + ICON.boat + '×' + lvlOf(s.id) + ' ' + ICON.fish + s.outN + '</span>';
      if (s.kind === 'machine') h += '<span class="chip">' + s.def.name + ' ' + ICON[s.def.in] + s.inN + (s.def.in2 ? ' ' + ICON[s.def.in2] + s.inN2 : '') + ' → ' + ICON[s.def.out] + s.outN + '</span>';
    }
    if (tables.length) {
      const busy = tables.filter((t) => t.st === 'wait' || t.st === 'eat' || t.st === 'coming').length, dirty = tables.filter((t) => t.st === 'dirty').length;
      h += '</div><div class="sec">餐廳</div><div class="chips"><span class="chip">餐桌 ' + tables.length + '</span><span class="chip">用餐中 ' + busy + '</span><span class="chip">待清理 ' + dirty + '</span>';
    }
    h += '</div><div class="sec">進度</div><div class="chips"><span class="chip">已解鎖 ' + state.built.length + '/' + DEFS.length + '</span><span class="chip">總收入 ' + ICON.money + fmtMoney(state.earned) + '</span></div>';
    body.innerHTML = h;
  } else if (kind === 'map') {
    $('pTitle').textContent = '地圖';
    body.innerHTML = '<a class="mapcard" href="./index.html"><span class="mi" style="background:#c9f0a8">🌾</span><div><b>開心農場</b><small>回到農場</small></div></a>' +
      '<div class="mapcard here"><span class="mi" style="background:#bfe9ff">⚓</span><div><b>海邊漁港</b><small>你現在在這裡</small></div></div>' +
      '<div class="mapcard locked"><span class="mi" style="background:#e8e2d6">🌲</span><div><b>森林伐木場</b><small>之後推出</small></div></div>';
    body.querySelector('a.mapcard').addEventListener('click', () => save());
  } else if (kind === 'set') {
    $('pTitle').textContent = '設定';
    body.innerHTML = '<div class="row"><span class="ricon">🔊</span><div class="rmid"><b>聲音</b></div><button class="buy" id="sSnd">' + (state.sound ? '開' : '關') + '</button></div>' +
      '<div class="row"><span class="ricon">🔄</span><div class="rmid"><b>重新開始</b><small>清除漁港的所有進度</small></div><button class="buy poor" id="sReset">重來</button></div>';
    $('sSnd').onclick = () => { state.sound = !state.sound; save(); openPanel('set'); };
    let armed = false;
    $('sReset').onclick = (e) => {
      if (!armed) { armed = true; e.target.textContent = '確定？'; return; }
      resetting = true; localStorage.removeItem(SAVE); location.reload();
    };
  }
}
let resetting = false;
$('pClose').onclick = () => $('panel').classList.add('hidden');
$('panel').addEventListener('pointerdown', (e) => { if (e.target === $('panel')) $('panel').classList.add('hidden'); });
$('bUp').onclick = () => openPanel('up');
$('bInv').onclick = () => openPanel('inv');
$('bSet').onclick = () => openPanel('set');
$('bMap').onclick = () => openPanel('map');

// ---------- per-frame interactions for the player ----------
function addMoney(v) { state.money += v; state.earned += v; updateMoney(); }
function collectPile(pile, x, z, near, dt, onChange) {
  const auto = state.up.autoCash > 0;
  if (pile.value <= 0 || (!auto && !near)) return;
  pile.tick = (pile.tick || 0) - dt;
  if (pile.tick > 0) return;
  pile.tick = near ? 0.04 : 0.25;
  const chunk = Math.max(1, Math.ceil(pile.value / 12));
  pile.value -= chunk; onChange();
  if (!near) addMoney(chunk);
  else fly('money', V3(x, 0.9, z), (o) => { o.copy(player.p.root.position); o.y = 1.6; }, 0.22, () => { addMoney(chunk); sfx('coin'); });
}
function playerInteract(dt) {
  const pp = player.p.root.position;
  for (const s of listOf('crop')) for (const pl of s.plants) if (pl.ripe && !pl.res && dist2(pp, pl.x, pl.z) < 1.0) pickPlant(s, pl, player);
  player.xfer2 = (player.xfer2 || 0) - dt;
  for (const s of Object.values(stations)) {
    if (s.kind === 'machine') {
      if (dist2(pp, s.inPt.x, s.inPt.z) < 1.4 && count(player, s.def.in) > 0) depositTo(player, s, s.def.in, dt);
      if (s.in2Pt && dist2(pp, s.in2Pt.x, s.in2Pt.z) < 1.4 && count(player, s.def.in2) > 0) depositTo(player, s, s.def.in2, dt);
    }
    if ((s.kind === 'machine' || s.kind === 'pier') && player.xfer2 <= 0 && dist2(pp, s.outPt.x, s.outPt.z) < (s.kind === 'pier' ? 1.7 : 1.5) && s.outN > 0 && room(player) > 0) {
      player.xfer2 = 0.08; s.outN--; sfx('pop'); takeInto(player, s.def.out, V3(s.outPt.x, 0.4, s.outPt.z));
    }
    if (s.kind === 'shelf' && dist2(pp, s.front.x, s.front.z - 0.6) < 1.7 && count(player, s.item) > 0) depositTo(player, s, s.item, dt);
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
  // restaurant: serve, clear, collect
  player.xfer3 = (player.xfer3 || 0) - dt;
  for (const t of tables) {
    const d = dist2(pp, t.x, t.z);
    if (t.st === 'wait' && d < 1.9 && player.xfer3 <= 0) {
      for (const s of t.seats) if (s.diner && !s.got && count(player, s.dish) > 0) { player.xfer3 = 0.15; giveDish(player, t, s); break; }
    }
    if (t.st === 'dirty' && d < 1.7) clearTable(t, player);
    collectPile(t.pile, t.x, t.z, d < 1.9, dt, () => setTablePile(t));
  }
  const k = COUNTERS[0];
  if (k.on) collectPile(k.pile, k.pile.x, k.pile.z, dist2(pp, k.pile.x, k.pile.z) <= 1.6, dt, () => setPile(k));
}

// ---------- simulation ----------
function updateBoats(s, dt, T) {
  const n = lvlOf(s.id);
  const trip = upVal('boat') * (isBuilt('lighthouse') ? 0.7 : 1), far = 30, speed = far / (trip * 0.35);
  s.boats.forEach((b, i) => {
    if (i >= n) return;
    b.t += dt;
    if (b.st === 'dock') {
      b.x = b.mx; b.g.rotation.y = Math.PI;
      if (b.cargo > 0) {
        b.ut = (b.ut || 0) - dt;
        if (b.ut <= 0 && s.outN + s.pend < s.outMax) {
          b.ut = 0.14; b.cargo--; s.pend++;
          fly('fish', V3(b.x - 0.6, 0.8, b.mz), (o) => o.set(CRATE_X, 0.45, s.def.pz), 0.55, () => { s.pend--; s.outN = Math.min(s.outMax, s.outN + 1); });
          if (b.cargo <= 0) { b.catchBox.visible = false; b.t = 0; }
        }
      } else if (b.t > 1.2) { b.st = 'turn'; b.t = 0; }
    } else if (b.st === 'turn') {
      const k = Math.min(1, b.t / 1.1);
      b.g.rotation.y = Math.PI * (1 - k); b.x = b.mx + k * k * 0.8;
      if (k >= 1) b.st = 'out';
    } else if (b.st === 'out') {
      b.g.rotation.y = 0; b.x += speed * dt;
      if (b.x >= b.mx + far) { b.st = 'fish'; b.t = 0; b.g.rotation.y = Math.PI; }
    } else if (b.st === 'fish') {
      if (b.t > trip * 0.3) { b.st = 'back'; b.cargo = upVal('catch') * (events.contest > 0 ? 2 : 1); b.catchBox.visible = true; }
    } else if (b.st === 'back') {
      b.g.rotation.y = Math.PI; b.x -= speed * dt;
      if (b.x <= b.mx) { b.x = b.mx; b.st = 'dock'; b.t = 0; b.ut = 0.4; if (!simming && dist2(player.p.root.position, b.mx, b.mz) < 14) sfx('splash'); }
    }
    b.g.position.set(b.x, Math.sin(T * 2 + i * 1.7) * 0.04, b.mz);
    b.b.rotation.x = Math.sin(T * 1.6 + i) * 0.04; b.b.rotation.z = Math.sin(T * 1.3 + i * 2) * 0.03;
    b.flag.visible = events.contest > 0;
  });
}
function updateWorld(dt, T) {
  const growK = upVal('grow');
  const cap = upVal('shelfCap');
  for (const s of Object.values(stations)) {
    if (s.kind === 'pier') {
      updateBoats(s, dt, T);
      s.outStack.set(s.outN);
      setLabel(s.outLabel, badge('fish', s.outN, s.outMax));
    } else if (s.kind === 'machine') {
      const iv = s.def.iv / upVal('mach');
      const busy = s.inN > 0 && (!s.def.in2 || s.inN2 > 0) && s.outN < s.outMax;
      if (busy) {
        s.timer += dt;
        if (s.timer >= iv) { s.timer = 0; s.inN--; if (s.def.in2) s.inN2--; s.outN++; puff(s.outPt.x, 0.5, s.outPt.z, s.def.mk === 'grill' ? '#c9c9c9' : '#fff4c9', 3, 0.4); }
      }
      const ax = s.spin.userData.axis;
      if (ax === 'z') s.spin.rotation.z += dt * (busy ? 6 : 0);
      else if (ax === 'sway') s.spin.rotation.z = Math.sin(T * 2) * (busy ? 0.08 : 0.03);
      else if (ax === 'flip') { s.spin.rotation.x = busy ? Math.max(0, Math.sin(T * 4)) * 0.6 : 0; s.spin.position.y = 0.84 + (busy ? Math.max(0, Math.sin(T * 4)) * 0.12 : 0); }
      else s.spin.rotation.y += dt * (busy ? 7 : 0);
      s.inStack.set(s.inN); s.outStack.set(s.outN);
      if (s.in2Stack) s.in2Stack.set(s.inN2);
      setLabel(s.inLabel, badge(s.def.in, s.inN, s.inMax)); setLabel(s.outLabel, badge(s.def.out, s.outN, s.outMax));
      if (s.in2Label) setLabel(s.in2Label, badge(s.def.in2, s.inN2, s.inMax));
    } else if (s.kind === 'crop') {
      for (const pl of s.plants) {
        if (pl.active && !pl.ripe) {
          pl.t += dt * growK;
          pl.fruit.visible = pl.t > s.grow * 0.35;
          pl.fruit.scale.setScalar(Math.min(1, pl.t / s.grow));
          if (pl.t >= s.grow) { pl.ripe = true; pl.fruit.scale.setScalar(1); pops.push({ obj: pl.fruit, t: 0.5 }); }
        }
        if (s.def.plant === 'seaweed' && pl.fruit.visible && !simming) pl.fruit.rotation.z = Math.sin(T * 1.8 + pl.ph) * 0.12;
      }
    } else if (s.kind === 'shelf') {
      if (s.n > cap) s.n = cap;
      s.stack.set(s.n);
      setLabel(s.label, badge(s.item, s.n, cap));
    }
  }
  if (sink.g) {
    if (sink.n > 0) { sink.t += dt; if (sink.t > 1.3) { sink.t = 0; sink.n--; if (!simming) puff(SINK.x, 1.0, SINK.z, '#e8f7ff', 3, 0.3); } }
    sink.stack.set(sink.n);
  }
}
function updateScenery(dt, T) {
  for (const w of waves) {
    w.ph = (w.ph + dt * 0.07) % 1;
    const k = w.ph;
    w.m.position.x = 27 - k * 13.2;
    w.m.material.opacity = Math.sin(k * Math.PI) * 0.5;
    w.m.scale.x = 1 + k * 1.5;
  }
  if (foam) foam.material.opacity = 0.25 + Math.sin(T * 1.4) * 0.18;
  for (const g of gulls) {
    g.ph += dt * g.sp;
    const x = g.cx + Math.cos(g.ph) * g.r, z = g.cz + Math.sin(g.ph) * g.r;
    g.g.position.set(x, g.h + Math.sin(g.ph * 3) * 0.3, z);
    g.g.rotation.y = Math.atan2(-Math.sin(g.ph) * g.sp, Math.cos(g.ph) * g.sp);
    g.g.rotation.z = g.sp > 0 ? 0.25 : -0.25;
    const f = Math.sin(T * 9 + g.cx) * 0.5;
    g.wings[0].rotation.z = f; g.wings[1].rotation.z = -f;
  }
  if (isBuilt('lighthouse')) lightObj.beam.rotation.y += dt * 0.8;
  if (pets.cat) { pets.cat.tail.rotation.z = Math.sin(T * 2.5) * 0.4; pets.cat.b.scale.y = 1 + Math.sin(T * 2) * 0.02; }
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
  pos.x = Math.max(-23.2, Math.min(12.9, pos.x)); pos.z = Math.max(-17.0, Math.min(30.5, pos.z));
  // floor height inside the buildings
  pos.y = inShop(pos.x, pos.z) || inRest(pos.x, pos.z) ? 0.12 : 0;
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
buildCounter(0);
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
  for (const w of workers) { updateWorker(w, dt); turn(w.p, w.face, dt); w.p.anim(dt, w.moving); swayStack(w, w.moving ? upVal('wspeed') : 0, dt); w.p.root.position.y = inShop(w.p.root.position.x, w.p.root.position.z) || inRest(w.p.root.position.x, w.p.root.position.z) ? 0.12 : 0; }
  updateCustomers(dt);
  updateDiners(dt, T);
  updateCruise(dt);
  updateEvents(dt);
  updateScenery(dt, T);
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
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('on'); }
}
requestAnimationFrame(frame);
addEventListener('visibilitychange', () => { if (document.hidden && !resetting) save(); });
addEventListener('pagehide', () => { if (!resetting) save(); });

// test hooks
window.__harbor = {
  state, stations, player, zones, customers, diners, tables, workers, cruise, events, DEFS, COUNTERS, sink, stats, colliders,
  give(type, n) { for (let i = 0; i < n && room(player) > 0; i++) stackAdd(player, type); },
  cash(n) { state.money += n; updateMoney(); },
  tp(x, z) { player.p.root.position.set(x, 0, z); updateCamera(0, true); },
  build(id) { if (zones[id]) killZone(id); if (!stations[id]) build(DEF[id]); },
  sim(sec, quiet = true) { simming = quiet; try { for (let i = 0; i < sec * 30; i++) step(1 / 30); } finally { simming = false; } },
  calls: () => renderer.info.render.calls,
  lineup(x, z) { Object.keys(ITEMS).forEach((t, i) => { const m = itemMesh(t); m.scale.setScalar(2.2); m.position.set(x + (i % 5) * 1.3, 0, z + Math.floor(i / 5) * 1.4); scene.add(m); }); },
};
