// 森林小鎮 — map 3 of 開心農場鋪. Chop and replant the forest, saw and plane wood, build furniture, run the forest market
// and the furniture showroom, then build the town lot by lot until the clock tower festival.
// Same style kit, controls, UI and engine pieces as the harbour (logic adapted from harbor.js).
import * as THREE from 'three';
import * as K from './kit.js';
import * as P from './props.js';
import * as P2 from './props2.js';
import * as P3 from './props3.js';
import * as P5 from './props5.js';
import { Joystick } from './input.js';
import { createNav } from './nav.js';

const { C, G } = K;
const ITEMS = P5.ITEMS5;
const itemMesh = P5.itemMesh;
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
// The forest is a branch of the same game: it opens after 「開分店：森林小鎮」 is bought in the harbour.
{
  let open = false;
  try { open = JSON.parse(localStorage.getItem('farm_maps_v1') || '{}').forest === true; } catch (e) { /* storage off */ }
  if (!open && !params.has('test') && !params.has('fresh')) { location.replace('index.html'); throw new Error('forest not unlocked yet: back to the farm'); }
}
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const dist2 = (a, x, z) => Math.hypot(a.x - x, a.z - z);
const easeBack = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------- instanced piles (same as the harbour) ----------
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _sc = new THREE.Vector3();
function slotMatrix(sl, extra = 1) { _e.set(sl.rx || 0, sl.ry || 0, 0); _q.setFromEuler(_e); _sc.setScalar((sl.s || 1) * extra); return new THREE.Matrix4().compose(sl.p, _q, _sc); }
function templateParts(type, noOutline) {
  const tpl = itemMesh(type), parts = [];
  tpl.updateMatrixWorld(true);
  tpl.traverse((o) => { if (o.isMesh && !(noOutline && o.material.side === THREE.BackSide)) parts.push(o); });
  return parts;
}
function slotSphere(slots) {
  const c = new THREE.Vector3(); for (const sl of slots) c.add(sl.p); c.divideScalar(slots.length);
  let r = 0; for (const sl of slots) r = Math.max(r, c.distanceTo(sl.p));
  return new THREE.Sphere(c, r + 0.9);
}
function instGroup(parent, parts, n, slots) {
  const g = new THREE.Group(); g.userData.dyn = true; parent.add(g);
  const sphere = slotSphere(slots);
  return parts.map((o) => {
    const im = new THREE.InstancedMesh(o.geometry, o.material, n);
    im.castShadow = false; im.receiveShadow = o.receiveShadow; im.count = 0; im.visible = false;
    im.boundingSphere = sphere.clone(); im.frustumCulled = true; g.add(im);
    return im;
  });
}
function itemStack(type, parent, slots) {
  const parts = templateParts(type), ims = instGroup(parent, parts, slots.length, slots);
  slots.forEach((sl, i) => { const m = slotMatrix(sl, ITEMS[type].ss || 1); ims.forEach((im, k) => im.setMatrixAt(i, _m4.multiplyMatrices(m, parts[k].matrixWorld))); });
  return { n: 0, max: slots.length, set(n) { n = Math.max(0, Math.min(this.max, n)); if (n !== this.n) { this.n = n; for (const im of ims) { im.count = n; im.visible = n > 0; } } } };
}
function makeBin(parent, slots, max, noOutline) { return { parent, slots, max: Math.min(max, slots.length), list: [], stacks: {}, dirty: true, noOutline }; }
const binAdd = (b, t) => { b.list.push(t); b.dirty = true; };
function binTake(b, t) { const i = t ? b.list.lastIndexOf(t) : b.list.length - 1; if (i < 0) return null; b.dirty = true; return b.list.splice(i, 1)[0]; }
const binCount = (b, t) => { let n = 0; for (const x of b.list) if (x === t) n++; return n; };
const binRoom = (b) => b.max - b.list.length - (b.pend || 0);
function binRender(b) {
  if (!b.dirty) return; b.dirty = false;
  const sorted = [...b.list].sort(), byType = {};
  sorted.forEach((t, i) => { (byType[t] = byType[t] || []).push(i); });
  for (const t in b.stacks) if (!byType[t]) for (const im of b.stacks[t].ims) { im.count = 0; im.visible = false; }
  for (const t in byType) {
    let st = b.stacks[t];
    if (!st) { const parts = templateParts(t, b.noOutline); st = b.stacks[t] = { parts, ims: instGroup(b.parent, parts, b.slots.length, b.slots), mats: b.slots.map((sl) => slotMatrix(sl, ITEMS[t].ss || 1)) }; }
    const idx = byType[t];
    st.ims.forEach((im, k) => { idx.forEach((si, j) => im.setMatrixAt(j, _m4.multiplyMatrices(st.mats[si], st.parts[k].matrixWorld))); im.count = idx.length; im.visible = true; im.instanceMatrix.needsUpdate = true; });
  }
}
const traySlots = (n = 12) => { const s = []; for (let i = 0; i < n; i++) s.push({ p: V3(-0.3 + (i % 4) * 0.2, 0.25 + Math.floor(i / 8) * 0.2, -0.18 + (Math.floor(i / 4) % 2) * 0.3), ry: Math.PI / 2, s: 0.62 }); return s; };
const crateSlots = () => { const s = []; for (let i = 0; i < 24; i++) s.push({ p: V3(-0.48 + (i % 4) * 0.32, 0.31 + Math.floor(i / 8) * 0.14, -0.2 + (Math.floor(i / 4) % 2) * 0.4), ry: Math.PI / 2, s: 0.8 }); return s; };

// ---------- layout ----------
const SH_Z = -14.6;
const SHOP = { x0: -9.4, x1: 7.95, z0: -17.4, z1: -7.3 };
const SHOW = { x0: -23.6, x1: -11.2, z0: -18, z1: -6 };
const RIVER = { x0: 12.6, x1: 15.0 };
const BRIDGES = [-4.9, 18.0];
const SPAWN = [17.6, -4.9];   // townsfolk come over the main bridge
const SPAWN2 = [-25.2, -4.9];  // furniture buyers come down the forest road from the west
const START = [-1.5, 4.6];
const FLUME = { hop: [-5.2, 12.2], pad: [-5.2, 13.6], path: [[-5.2, 12.2], [6.4, 12.2], [7.95, 8.9]] };
const LOTS = {
  A: { x: 18.6, z: -12.0, pad: [21.8, -12.0] }, B: { x: 26.4, z: -12.0, pad: [23.2, -12.0] }, C: { x: 26.4, z: 1.5, pad: [23.2, 1.5] },
  D: { x: 18.6, z: 6.0, pad: [21.8, 6.0] }, E: { x: 26.4, z: 10.0, pad: [23.2, 10.0] }, F: { x: 18.6, z: 22.6, pad: [21.8, 22.6] }, G: { x: 26.4, z: 18.0, pad: [23.2, 18.0] },
};
const TRAIN = { stopX: 26, z: 28.6, spot: [20.6, 26.9] };
const P_POS = { chair: [-21.0, -15.4], table: [-17.4, -15.4], bed: [-13.8, -15.4], bookcase: [-21.0, -11.8], rocker: [-17.4, -11.8] };
const TREE_SPOTS = (() => {
  const s = [];
  for (const z of [2.0, 4.6, 7.2, 9.8]) for (const x of [-6.6, -9.0, -11.4, -13.8]) s.push([x, z]);
  s.sort((a, b) => Math.hypot(a[0] + 5.6, a[1] - 4) - Math.hypot(b[0] + 5.6, b[1] - 4));
  for (const z of [12.4, 15.0]) for (const x of [-6.6, -9.0, -11.4, -13.8]) s.push([x, z]);
  return s;
})();
const TREE_KIND = (i) => (i % 7 === 3 ? 'maple' : i % 4 === 2 ? 'oak' : 'pine');
const HIVES = [[-22.4, 3.2], [-22.4, 6.4], [-22.4, 9.6], [-20.0, 6.4]];

// ---------- the unlock chain ----------
const FURN = ['chair', 'table', 'bed', 'bookcase', 'rocker'];
const DEFS = [
  { id: 'logging', name: '伐木區', kind: 'logging', zone: [-3.3, 3.2], cost: { money: 40 }, req: [], start: true },
  { id: 'mushrooms', name: '蘑菇林', kind: 'crop', plant: 'mush', out: 'shiitake', rare: 'truffle', grow: 6, pos: [1.8, 2.2], cost: { money: 30 }, req: [], start: true },
  { id: 'shelfWood', name: '木材架', kind: 'shelf', items: ['pine', 'oak', 'maple', 'plank'], pos: [4.4, SH_Z], cost: { money: 10 }, req: ['logging'] },
  { id: 'shelfMush', name: '菇類架', kind: 'shelf', items: ['shiitake', 'truffle'], pos: [1.4, SH_Z], cost: { money: 15 }, req: ['mushrooms'] },
  { id: 'counter', name: '收銀台', kind: 'counter', zone: [4.6, -8.7], cost: { money: 0 }, any: ['shelfWood', 'shelfMush'] },
  { id: 'cashier', name: '收銀員', kind: 'hire', role: 'cashier', zone: [6.6, -12.6], cost: { money: 80 }, req: ['counter'] },
  { id: 'sawmill', name: '鋸木廠', kind: 'machine', mk: 'sawmill', ins: ['pine', 'oak', 'maple'], need: 1, out: 'plank', iv: 2.5, pos: [9.4, 7.8], cost: { money: 200, pine: 6 }, req: ['cashier', 'logging'] },
  { id: 'lumberjack', name: '伐木工', kind: 'hire', role: 'lumberjack', zone: [-5.2, 0.2], cost: { money: 180 }, req: ['sawmill'] },
  { id: 'squirrel', name: '小松鼠', kind: 'pet', zone: [2.6, -11.6], cost: { money: 260, pine: 10 }, req: ['lumberjack'] },
  { id: 'hauler', name: '搬運工', kind: 'hire', role: 'hauler', zone: [1.6, -5.8], cost: { money: 320 }, req: ['squirrel'] },
  { id: 'warehouse', name: '倉庫', kind: 'store', pos: [10.4, -14.4], zone: [10.4, -10.6], cost: { money: 450 }, req: ['hauler'] },
  { id: 'planter', name: '植樹員', kind: 'hire', role: 'planter', zone: [-5.6, -1.8], cost: { money: 500 }, req: ['warehouse'] },
  { id: 'planer', name: '刨木機', kind: 'machine', mk: 'planer', ins: ['plank'], need: 1, out: 'refined', iv: 2.4, pos: [9.4, 4.6], cost: { money: 650, plank: 15 }, req: ['planter'] },
  { id: 'shelfGoods', name: '雜貨架', kind: 'shelf', items: ['refined', 'candle'], pos: [-7.6, SH_Z], cost: { money: 480 }, req: ['planer'] },
  { id: 'showroom', name: '家具展示館', kind: 'showroom', zone: [-12.7, -4.0], cost: { money: 1200, plank: 20 }, req: ['shelfGoods'] },
  { id: 'chairBench', name: '椅子工作台', kind: 'machine', mk: 'bench', ins: ['refined'], need: 1, out: 'chair', iv: 4, pos: [-7.2, 21.6], cost: { money: 700, refined: 10 }, req: ['showroom'] },
  { id: 'platChair', name: '椅子展示台', kind: 'platform', items: ['chair', 'chair_r'], pos: P_POS.chair, cost: { money: 500 }, req: ['chairBench'] },
  { id: 'clerk', name: '店員', kind: 'hire', role: 'clerk', zone: [-14.6, -10.8], cost: { money: 850 }, req: ['platChair'] },
  { id: 'flume', name: '河道運木', kind: 'flume', zone: [-5.2, 14.4], cost: { money: 1500 }, req: ['clerk'] },
  { id: 'tableBench', name: '桌子工作台', kind: 'machine', mk: 'bench', ins: ['refined'], need: 2, out: 'table', iv: 5, pos: [-3.0, 21.6], cost: { money: 1800 }, req: ['flume'] },
  { id: 'platTable', name: '桌子展示台', kind: 'platform', items: ['table', 'table_r'], pos: P_POS.table, cost: { money: 1200 }, req: ['tableBench'] },
  { id: 'mapleGrove', name: '楓樹林', kind: 'crop', plant: 'tap', out: 'sap', grow: 8, pos: [-19.4, 21.5], cost: { money: 1600 }, req: ['platTable'] },
  { id: 'syrupHouse', name: '楓糖屋', kind: 'machine', mk: 'syrup', ins: ['sap'], need: 2, out: 'syrup', iv: 4, pos: [3.4, 14.0], cost: { money: 2000, sap: 10 }, req: ['mapleGrove'] },
  { id: 'shelfSweet', name: '蜂蜜糖漿架', kind: 'shelf', items: ['syrup', 'honey'], pos: [-1.6, SH_Z], cost: { money: 1400 }, req: ['syrupHouse'] },
  { id: 'sapper', name: '採汁員', kind: 'hire', role: 'sapper', zone: [-15.2, 25.4], cost: { money: 1800 }, req: ['shelfSweet'] },
  { id: 'house', name: '房屋', kind: 'town', lot: 'A', bld: 'house', note: '客人變多了', need: { plank: 20, chair: 2 }, cost: { money: 2500 }, req: ['sapper'] },
  { id: 'bedBench', name: '床工作台', kind: 'machine', mk: 'bench', ins: ['refined'], need: 3, out: 'bed', iv: 6, pos: [1.2, 21.6], cost: { money: 3000 }, req: ['house'] },
  { id: 'platBed', name: '床展示台', kind: 'platform', items: ['bed', 'bed_r'], pos: P_POS.bed, cost: { money: 2400 }, req: ['bedBench'] },
  { id: 'carpenter', name: '木匠', kind: 'hire', role: 'carpenter', zone: [3.2, 25.4], cost: { money: 2600 }, req: ['platBed'] },
  { id: 'apiary', name: '蜂場', kind: 'apiary', zone: [-19.8, 15.8], cost: { money: 3200 }, req: ['carpenter'] },
  { id: 'candleShop', name: '蠟燭工坊', kind: 'machine', mk: 'candle', ins: ['wax'], need: 1, out: 'candle', iv: 3, pos: [9.4, 14.0], cost: { money: 3500, wax: 10 }, req: ['apiary'] },
  { id: 'beekeeper', name: '養蜂人', kind: 'hire', role: 'beekeeper', zone: [-17.4, 16.8], cost: { money: 3000 }, req: ['candleShop'] },
  { id: 'bakery', name: '麵包店', kind: 'town', lot: 'B', bld: 'bakery', note: '幫你賣蜂蜜和楓糖漿', need: { refined: 15, table: 2, syrup: 6 }, cost: { money: 4000 }, req: ['beekeeper'], reqDone: ['house'] },
  { id: 'paperMill', name: '造紙廠', kind: 'machine', mk: 'paper', ins: ['sawdust'], need: 2, out: 'paper', iv: 3, pos: [3.4, 7.8], cost: { money: 4500, sawdust: 20 }, req: ['bakery'] },
  { id: 'shelfPaper', name: '文具架', kind: 'shelf', items: ['paper', 'notebook'], pos: [-4.6, SH_Z], cost: { money: 3200 }, req: ['paperMill'] },
  { id: 'binder', name: '筆記本機', kind: 'machine', mk: 'binder', ins: ['paper'], need: 2, out: 'notebook', iv: 3.5, pos: [-2.6, 7.8], cost: { money: 4800 }, req: ['shelfPaper'] },
  { id: 'hauler2', name: '搬運工', kind: 'hire', role: 'hauler', zone: [-2.4, -5.8], cost: { money: 4200 }, req: ['binder'] },
  { id: 'school', name: '學校', kind: 'town', lot: 'C', bld: 'school', note: '員工走得更快了', need: { plank: 30, notebook: 12, chair: 6 }, cost: { money: 6000 }, req: ['hauler2'], reqDone: ['bakery'] },
  { id: 'shroomHouse', name: '菇寮', kind: 'machine', mk: 'shroom', ins: ['pine'], need: 1, out: 'shiitake', iv: 5, pos: [-2.6, 14.0], cost: { money: 5500, pine: 10 }, req: ['school'] },
  { id: 'forager', name: '採菇員', kind: 'hire', role: 'forager', zone: [6.6, 5.4], cost: { money: 5000 }, req: ['shroomHouse'] },
  { id: 'bookBench', name: '書櫃工作台', kind: 'machine', mk: 'bench', ins: ['refined'], need: 2, out: 'bookcase', iv: 5, pos: [5.4, 21.6], cost: { money: 7000 }, req: ['forager'] },
  { id: 'platBook', name: '書櫃展示台', kind: 'platform', items: ['bookcase', 'bookcase_r'], pos: P_POS.bookcase, cost: { money: 5500 }, req: ['bookBench'] },
  { id: 'courier', name: '送貨員', kind: 'courier', note: '家具加收送貨費', zone: [-17.6, -4.2], cost: { money: 8000 }, req: ['platBook'] },
  { id: 'park', name: '公園', kind: 'town', lot: 'D', bld: 'park', note: '客人更有耐心、多給小費', need: { refined: 30, chair: 6, honey: 10 }, cost: { money: 8000 }, req: ['courier'], reqDone: ['school'] },
  { id: 'lumberjack2', name: '伐木工', kind: 'hire', role: 'lumberjack', zone: [-5.2, 0.2], cost: { money: 7500 }, req: ['park'] },
  { id: 'rockerBench', name: '搖椅工作台', kind: 'machine', mk: 'bench', ins: ['refined'], need: 3, out: 'rocker', iv: 7, pos: [9.6, 21.6], cost: { money: 10000 }, req: ['lumberjack2'] },
  { id: 'platRocker', name: '搖椅展示台', kind: 'platform', items: ['rocker', 'rocker_r'], pos: P_POS.rocker, cost: { money: 8000 }, req: ['rockerBench'] },
  { id: 'fireStation', name: '消防局', kind: 'town', lot: 'E', bld: 'fire', note: '森林大火變小了', need: { plank: 40, refined: 30, candle: 10 }, cost: { money: 12000 }, req: ['platRocker'], reqDone: ['park'] },
  { id: 'hauler3', name: '搬運工', kind: 'hire', role: 'hauler', zone: [-6.4, -5.8], cost: { money: 11000 }, req: ['fireStation'] },
  { id: 'carpenter2', name: '木匠', kind: 'hire', role: 'carpenter', zone: [3.2, 25.4], cost: { money: 12000 }, req: ['hauler3'] },
  { id: 'trainStation', name: '火車站', kind: 'town', lot: 'F', bld: 'train', note: '火車會來下大訂單', need: { plank: 60, refined: 40, table: 4, bed: 2 }, cost: { money: 18000 }, req: ['carpenter2'], reqDone: ['fireStation'] },
  { id: 'planter2', name: '植樹員', kind: 'hire', role: 'planter', zone: [-5.6, -1.8], cost: { money: 14000 }, req: ['trainStation'] },
  { id: 'forestExpand', name: '擴大林場', kind: 'expand', note: '可以再種 8 棵樹', zone: [-5.0, 16.4], cost: { money: 20000 }, req: ['planter2'] },
  { id: 'clockTower', name: '鐘樓', kind: 'town', lot: 'G', bld: 'clock', note: '小鎮慶典！所有商品售價 ×1.2', need: { refined: 80, bookcase: 4, rocker: 4, notebook: 20 }, cost: { money: 40000 }, req: ['forestExpand'], reqDone: ['trainStation'] },
  { id: 'cafeGate', name: '開分店：山城咖啡館', kind: 'mapgate', zone: [9.8, -8.4], cost: { money: 300000 }, req: [] },
];
for (const d of DEFS) if (d.kind === 'town') d.zone = LOTS[d.lot].pad;
const DEF = Object.fromEntries(DEFS.map((d) => [d.id, d]));

const lv = (n, base, k) => Array.from({ length: n }, (_, i) => Math.round(base * Math.pow(k, i) / 10) * 10);
const UPS = {
  cap: { tab: 0, name: '背包容量', ic: 'pine', vals: [6, 10, 14, 18, 24, 30, 36, 44, 52], cost: [30, 80, 150, 260, 420, 700, 1100, 1700], fmt: (v) => v + ' 個' },
  speed: { tab: 0, name: '移動速度', ic: 'run', vals: [5.8, 6.4, 7, 7.6, 8.2, 8.8, 9.4], cost: [40, 100, 200, 380, 650, 1000], fmt: (v) => v.toFixed(1) },
  wcap: { tab: 1, name: '員工一次拿多少', ic: 'plank', vals: [4, 6, 8, 11, 15, 20, 26], cost: [100, 220, 450, 800, 1400, 2400], fmt: (v) => v + ' 個' },
  wspeed: { tab: 1, name: '員工速度', ic: 'run', vals: [4, 4.6, 5.2, 5.8, 6.4, 7, 7.6], cost: [100, 220, 450, 800, 1400, 2400], fmt: (v) => v.toFixed(1) },
  chop: { tab: 2, name: '伐木速度', ic: 'pine', need: 'logging', vals: [0.42, 0.35, 0.29, 0.24, 0.2, 0.16], cost: [60, 160, 380, 800, 1600], fmt: (v) => v + ' 秒砍一下' },
  regrow: { tab: 2, name: '樹木再生', ic: 'oak', need: 'logging', vals: [24, 20, 16, 13, 10, 8], cost: [80, 220, 500, 1000, 2000], fmt: (v) => v + ' 秒長回來' },
  mush: { tab: 2, name: '菇類生長', ic: 'shiitake', need: 'mushrooms', vals: [1, 1.25, 1.5, 1.8, 2.2, 2.6], cost: [100, 280, 600, 1200, 2200], fmt: (v) => '×' + v },
  sap: { tab: 2, name: '楓汁收集', ic: 'sap', need: 'mapleGrove', vals: [1, 1.25, 1.5, 1.8, 2.2], cost: [800, 1600, 3000, 5200], fmt: (v) => '×' + v },
  bee: { tab: 2, name: '蜂巢產量', ic: 'honey', need: 'apiary', vals: [12, 10, 8.5, 7, 6], cost: [1200, 2400, 4200, 7000], fmt: (v) => v + ' 秒一份' },
  flume: { tab: 2, name: '運木速度', ic: 'maple', need: 'flume', vals: [3, 4, 5, 6.5, 8], cost: [800, 1600, 3000, 5000], fmt: (v) => v.toFixed(1) },
  mach: { tab: 2, name: '機器速度', ic: 'refined', need: 'sawmill', vals: [1, 1.25, 1.5, 1.8, 2.2, 2.6], cost: [400, 900, 1800, 3200, 5500], fmt: (v) => '×' + v },
  luck: { tab: 2, name: '彩繪家具機率', ic: 'chair_r', need: 'chairBench', vals: [0.08, 0.11, 0.14, 0.18, 0.22], cost: [1500, 3500, 7000, 12000], fmt: (v) => Math.round(v * 100) + '%' },
  price: { tab: 3, name: '商品售價', ic: 'money', need: 'cashier', vals: [1, 1.1, 1.2, 1.3, 1.4, 1.55, 1.7, 1.85, 2, 2.2, 2.4], cost: lv(10, 200, 1.6), fmt: (v) => '×' + v },
  shelfCap: { tab: 3, name: '貨架容量', ic: 'plank', need: 'cashier', vals: [8, 12, 16, 20, 24], cost: [150, 400, 900, 1800], fmt: (v) => v + ' 個' },
  cust: { tab: 3, name: '客人數量', ic: 'run', need: 'cashier', vals: [1, 1.2, 1.4, 1.6, 1.8, 2], cost: [300, 700, 1400, 2600, 4500], fmt: (v) => '×' + v },
  autoCash: { tab: 3, name: '自動收款', ic: 'money', need: 'courier', vals: [0, 1], cost: [6000], fmt: (v) => v ? '錢自動入袋' : '要自己收錢' },
};
const upVal = (k) => UPS[k].vals[state.up[k] || 0];
const GROW = {
  logging: { start: 6, max: 16, cost: [20, 40, 70, 110, 160, 240, 330, 450, 600, 800, 2500, 3200, 4000, 5000, 6200, 7500, 9000, 11000], what: '＋1 棵樹' },
  mushrooms: { start: 3, max: 6, cost: [25, 60, 120], what: '＋1 叢香菇' },
  mapleGrove: { start: 3, max: 6, cost: [1200, 1800, 2600], what: '＋1 棵楓樹' },
  apiary: { start: 2, max: 4, cost: [2500, 4000], what: '＋1 個蜂巢' },
};
const growMax = (k) => (k === 'logging' && isBuilt('forestExpand') ? 24 : GROW[k].max);
const lvlOf = (id) => state.lvl[id] || GROW[id].start;
const LOG_PAGES = [
  { name: '原木家具', ids: FURN.slice(), reward: 1500 },
  { name: '彩繪家具', ids: FURN.map((f) => f + '_r'), reward: 25000 },
];

// ---------- save ----------
const SAVE = 'forest_save_v1';
let resetting = false;
const blank = () => ({ money: 50, built: [], paid: {}, up: {}, stock: {}, store: {}, lvl: {}, piles: [0, 0], earned: 0, log: {}, logPaid: {}, logNew: false, extra: {}, sites: {}, festival: false });
const state = Object.assign(blank(), { sound: true });
try { Object.assign(state, JSON.parse(localStorage.getItem(SAVE) || '{}')); } catch (e) { /* fresh start */ }
if (params.has('fresh')) Object.assign(state, blank());
for (const k of ['store', 'lvl', 'stock', 'paid', 'up', 'log', 'logPaid', 'extra', 'sites']) state[k] = state[k] || {};
for (const k in UPS) state.up[k] = state.up[k] || 0;
const isBuilt = (id) => state.built.includes(id);
const siteDone = (id) => !!(state.sites[id] && state.sites[id].done);
function save() {
  if (resetting) return;
  for (const id in stations) {
    const s = stations[id];
    if (s.kind === 'machine') state.stock[id] = { i: s.inBin.list, o: s.outBin.list };
    else if (s.bin) state.stock[id] = { l: s.bin.list };
    if (s.kind === 'flume') state.stock[id] = { q: s.queue.map((q) => q.t) };
  }
  state.piles = COUNTERS.map((c) => c.pile.value);
  if (bakery.pile) state.bakeryPile = bakery.pile.value;
  try { localStorage.setItem(SAVE, JSON.stringify(state)); } catch (e) { /* storage off */ }
}
function loadList(bin, list) { if (Array.isArray(list)) for (const t of list) if (ITEMS[t] && bin.list.length < bin.max) binAdd(bin, t); }

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
scene.background = new THREE.Color('#9fd06a');
const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 220);
const lights = K.makeLights(scene);
const joy = new Joystick(canvas, $('ui'));
joy.onStart = () => { if (actx && actx.state === 'suspended') actx.resume(); };

const colliders = [];
const nav = createNav(colliders, { x0: -26, x1: 31, z0: -18.6, z1: 31 }, 0.5, 0.35);
let navV = 0;
const box = (x0, z0, x1, z1) => { const b = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) }; colliders.push(b); nav.dirty(); navV++; return b; };
function unbox(b) { const i = colliders.indexOf(b); if (i >= 0) { colliders.splice(i, 1); nav.dirty(); navV++; } }
const insideBox = (x, z) => colliders.find((b) => x > b.x0 + 0.01 && x < b.x1 - 0.01 && z > b.z0 + 0.01 && z < b.z1 - 0.01);
function navPath(sx, sz, tx, tz, exact) {
  const r = nav.path(sx, sz, tx, tz);
  const l = r[r.length - 1];
  if (exact && (!l || Math.hypot(l[0] - tx, l[1] - tz) > 0.05)) r.push([tx, tz]);
  return r;
}
function setGoal(c, x, z, exact) { c.goal = [x, z, exact]; c.navV = navV; const p = c.p.root.position; c.path = navPath(p.x, p.z, x, z, exact); }
function evict() {
  for (const a of [...workers, ...customers]) {
    const pos = a.p.root.position, b = insideBox(pos.x, pos.z);
    if (!b) continue;
    const opts = [[b.x0 - 0.45, pos.z], [b.x1 + 0.45, pos.z], [pos.x, b.z0 - 0.45], [pos.x, b.z1 + 0.45]];
    opts.sort((u, v) => Math.hypot(u[0] - pos.x, u[1] - pos.z) - Math.hypot(v[0] - pos.x, v[1] - pos.z));
    const ok = opts.find((o) => !insideBox(o[0], o[1])) || opts[0];
    pos.x = ok[0]; pos.z = ok[1];
  }
}
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- item icons (and dark silhouettes for the catalog) ----------
const ICON = {}, ICON_BIG = {}, ICON_SIL = {};
function makeIcons() {
  try {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setSize(96, 96); r.outputColorSpace = THREE.SRGBColorSpace;
    const sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight('#fff6e6', '#c3e08a', 1.7));
    const d = new THREE.DirectionalLight('#fff1d6', 1.6); d.position.set(-2, 4, 3); sc.add(d);
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    const sil = new THREE.MeshBasicMaterial({ color: '#6b5d50' });
    for (const type of Object.keys(ITEMS)) {
      const m = itemMesh(type); sc.add(m);
      const bb = new THREE.Box3().setFromObject(m), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3()).length();
      cam.position.set(c.x + s * 0.7, c.y + s * 1.3, c.z + s * 1.6); cam.lookAt(c);
      r.render(sc, cam);
      const url = r.domElement.toDataURL();
      ICON[type] = '<img class="ii" src="' + url + '" alt="">';
      ICON_BIG[type] = '<img src="' + url + '" alt="">';
      if (FURN.includes(type.replace('_r', ''))) { sc.overrideMaterial = sil; r.render(sc, cam); ICON_SIL[type] = '<img class="sil" src="' + r.domElement.toDataURL() + '" alt="">'; sc.overrideMaterial = null; }
      sc.remove(m);
    }
    r.dispose(); r.forceContextLoss();
  } catch (e) { /* emoji fallback */ }
  for (const t in ITEMS) {
    if (!ICON[t]) ICON[t] = '<span class="ic">' + ITEMS[t].icon + '</span>';
    if (!ICON_BIG[t]) ICON_BIG[t] = '<span class="big">' + ITEMS[t].icon + '</span>';
    if (!ICON_SIL[t]) ICON_SIL[t] = '<span class="big">？</span>';
  }
  ICON.run = '<span class="ic">👟</span>';
}
makeIcons();

// ---------- static world ----------
const doors = [];
const areas = [];
function makeArea(x0, z0, x1, z1, lamps, lx, lz) {
  const light = new THREE.PointLight('#ffe2a8', 0, 18, 1.6); light.position.set(lx, 3.2, lz); scene.add(light);
  const A = { x0, z0, x1, z1, light, lamps, k: 0 };
  areas.push(A);
  return A;
}
const ripples = [];
const animals = [];
function shopShell(D, R, signText, signCol, doorX) {
  const cx = (R.x0 + R.x1) / 2, w = R.x1 - R.x0 + 0.4, d = R.z1 - R.z0;
  K.add(D, K.mesh(G.rbox(w, 0.12, d + 0.4, 0.06, 2), '#e8c290', false, true), cx, 0.06, (R.z0 + R.z1) / 2);
  for (let x = R.x0 + 0.4; x < R.x1; x += 0.8) K.add(D, K.mesh(G.rbox(0.03, 0.02, d, 0.01), '#d4a872', false, true), x, 0.125, (R.z0 + R.z1) / 2);
  K.add(D, K.mesh(G.rbox(w, 2.0, 0.4, 0.08), '#f6e3c0'), cx, 1.0, R.z0 - 0.2);
  K.add(D, K.mesh(G.rbox(w + 0.1, 0.22, 0.46, 0.05), '#59a14f'), cx, 2.0, R.z0 - 0.2);
  K.add(D, K.mesh(G.rbox(w + 0.05, 0.16, 0.44, 0.04), '#c98a55'), cx, 0.5, R.z0 - 0.2);
  for (const x of [cx - w / 3, cx, cx + w / 3]) K.add(D, K.mesh(G.rbox(2.2, 0.8, 0.08, 0.06), '#bfe9ff'), x, 1.25, R.z0 + 0.02);
  for (const x of [R.x0 - 0.2, R.x1]) {
    K.add(D, K.mesh(G.rbox(0.4, 2.0, d + 0.4, 0.08), '#f6e3c0'), x, 1.0, (R.z0 + R.z1) / 2);
    K.add(D, K.mesh(G.rbox(0.46, 0.22, d + 0.5, 0.05), '#59a14f'), x, 2.0, (R.z0 + R.z1) / 2);
  }
  box(R.x0 - 0.4, R.z0 - 0.4, R.x1 + 0.2, R.z0); box(R.x0 - 0.4, R.z0 - 0.2, R.x0, R.z1 + 0.1); box(R.x1 - 0.2, R.z0 - 0.2, R.x1 + 0.2, R.z1 + 0.1);
  const wallPiece = (x0, x1, z) => {
    K.add(D, K.mesh(G.rbox(x1 - x0, 0.55, 0.3, 0.08), '#f6e3c0'), (x0 + x1) / 2, 0.28, z);
    K.add(D, K.mesh(G.rbox(x1 - x0 - 0.1, 0.62, 0.12, 0.04), '#cfeeff'), (x0 + x1) / 2, 0.85, z);
    K.add(D, K.mesh(G.rbox(x1 - x0, 0.14, 0.32, 0.05), '#59a14f'), (x0 + x1) / 2, 1.2, z);
    box(x0, z - 0.2, x1, z + 0.2);
  };
  wallPiece(R.x0 - 0.4, doorX - 1.15, R.z1); wallPiece(doorX + 1.15, R.x1 + 0.2, R.z1);
  const sign = P2.signBoard(signText, 4, signCol); sign.position.set(cx, 2.75, R.z0 - 0.15); D.add(sign);
  const dr = P2.slidingDoor(2.1); dr.g.position.set(doorX, 0.1, R.z1); scene.add(dr.g);
  doors.push({ d: dr, x: doorX, z: R.z1, k: 0 });
  const lamps = [];
  for (const x of [cx - w / 3, cx + w / 3]) { const l = P2.wallLamp(); l.g.position.set(x, 1.75, R.z0 + 0.1); scene.add(l.g); lamps.push(l); }
  return makeArea(R.x0, R.z0, R.x1, R.z1, lamps, cx, (R.z0 + R.z1) / 2);
}
function buildWorld() {
  const D = new THREE.Group();
  const rnd = mulberry(23);
  K.add(D, K.mesh(G.plane(140, 140), '#a8d86a', false, true), 2, 0, 6);
  for (let i = 0; i < 60; i++) {
    const r = 1.2 + rnd() * 3.2, p = K.mesh(G.circle(r, 18), rnd() < 0.5 ? '#9ccf5e' : '#b6e47a', false, true);
    p.position.set(-25 + rnd() * 56, 0.003 + i * 0.0011, -17 + rnd() * 48); p.scale.set(1, 1, 0.6 + rnd() * 0.6); p.rotation.y = rnd() * 3; D.add(p);
  }
  // river with banks, and the two bridges
  K.add(D, K.mesh(G.plane(RIVER.x1 - RIVER.x0 + 1.2, 140), '#c9b07a', false, true), (RIVER.x0 + RIVER.x1) / 2, 0.004, 6);
  K.add(D, K.mesh(G.plane(RIVER.x1 - RIVER.x0, 140), '#6fc9e8', false, true), (RIVER.x0 + RIVER.x1) / 2, 0.008, 6);
  for (let z = -60; z < 75; z += 1.4) for (const x of [RIVER.x0 - 0.15, RIVER.x1 + 0.15]) { if (x < RIVER.x0 && z > -17.2 && z < -12.0) continue; const r = K.mesh(new THREE.DodecahedronGeometry(0.22 + rnd() * 0.14, 0), '#a3aeb0'); r.position.set(x + (rnd() - 0.5) * 0.3, 0.06, z + rnd()); r.scale.set(1, 0.55, 1); D.add(r); }
  let zz = -40;
  for (const bz of BRIDGES) { box(RIVER.x0, zz, RIVER.x1, bz - 1.2); zz = bz + 1.2; const br = P5.bridge(RIVER.x1 - RIVER.x0 + 1.4, 2.6); br.position.set((RIVER.x0 + RIVER.x1) / 2, 0, bz); D.add(br); }
  box(RIVER.x0, zz, RIVER.x1, 60);
  // paths: in front of the shops, to the bridge and through the town; diners of the furniture showroom come the same way
  const path = (x, z, w, d, col = '#e6cf98') => K.add(D, K.mesh(G.rbox(w, 0.05, d, 0.2, 1), col, false, true), x, 0.025, z);
  path(1, -4.9, 26, 1.8); path(-19.1, -4.9, 14.4, 1.8); path(22, -4.9, 16, 1.8, '#d9c7a0'); path(22.5, 6, 1.8, 44, '#d9c7a0');
  path(-0.4, 5.2, 1.6, 18); path(-3.5, 17.6, 30, 1.6); path(-3.5, 1.0, 1.4, 9);
  path(6.5, -6.5, 2.2, 1.8);   // up to the market door
  path(18.5, 18.0, 6.4, 1.6, '#d9c7a0');   // from the south bridge into town
  path(-18.6, -2.7, 3.6, 1.6);   // the delivery truck's lay-by
  // the town: lot outlines and street lamps, railway in the south
  for (const k in LOTS) { const o = P5.lotOutline(); o.position.set(LOTS[k].x, 0, LOTS[k].z); D.add(o); }
  const rl = P5.rails(60); rl.position.set(15.6, 0, TRAIN.z); D.add(rl);
  for (const z of [-14, -2, 10, 22]) { K.add(D, P.lamp(), 24.0, 0, z + 1.5); box(23.9, z + 1.4, 24.1, z + 1.6); }
  // market shell
  // decorative forest around the playable area (solid inside, free beyond the walls of trees)
  const tree = (x, z, kind, s, solid) => { D.add(Object.assign(P5.decoTree(kind, s), {}).translateX(x).translateZ(z)); if (solid) box(x - 0.3, z - 0.3, x + 0.3, z + 0.3); };
  for (let i = 0; i < 26; i++) tree(-26 + i * 2.3 + rnd(), -19.5 - rnd() * 3, rnd() < 0.7 ? 'pine' : 'oak', 0.9 + rnd() * 0.4, false);
  for (let i = 0; i < 22; i++) tree(-27.5 - rnd() * 4, -17 + i * 2.3 + rnd(), rnd() < 0.6 ? 'pine' : rnd() < 0.5 ? 'oak' : 'maple', 0.9 + rnd() * 0.4, false);
  for (let i = 0; i < 26; i++) tree(-26 + i * 2.3 + rnd(), 32.5 + rnd() * 3, rnd() < 0.6 ? 'pine' : 'maple', 0.9 + rnd() * 0.4, false);
  for (let i = 0; i < 20; i++) tree(32 + rnd() * 4, -17 + i * 2.5 + rnd(), rnd() < 0.6 ? 'pine' : 'oak', 0.9 + rnd() * 0.4, false);
  for (const [x, z, k] of [[-24.4, -3.6, 'pine'], [-24.6, 0.6, 'oak'], [-24.2, 12.6, 'pine'], [-24.4, 27.6, 'maple'], [-12, 27.8, 'pine'], [-3.6, 28.4, 'oak'], [7.4, 28.2, 'pine'], [10.4, -2.4, 'oak'], [6.4, -2.2, 'oak'], [-3.4, -2.4, 'pine'], [29.6, -14.6, 'pine'], [29.6, 4.2, 'maple'], [29.4, 13.6, 'pine'], [16.8, 12.6, 'oak'], [16.6, 0.8, 'pine'], [28.8, 24.6, 'oak']]) tree(x, z, k, 1, true);
  for (const [x, z, s] of [[-25.2, 19.4, 0.5], [-8.4, -2.6, 0.35], [11.0, 15.4, 0.45], [16.4, -15.6, 0.6], [29.0, -6.8, 0.5], [-14.8, 28.6, 0.5]]) {
    const r = P.rock(s); r.position.set(x, 0, z); D.add(r); box(x - s * 0.8, z - s * 0.7, x + s * 0.8, z + s * 0.7);
  }
  for (const [x, z, r] of [[-0.6, -2.4, 0.5], [17.4, 9.0, 0.45], [28.6, 0.0, 0.5], [-24.0, 8.0, 0.55]]) K.add(D, P.bush(r), x, 0, z);
  const fl = ['#ff7eb6', '#ffffff', '#ffd34a', '#a98bff', '#ff8a6b'];
  for (let i = 0; i < 70; i++) K.add(D, P.flower(fl[i % 5]), -24 + rnd() * 6, 0, 1 + rnd() * 13);
  for (let i = 0; i < 40; i++) K.add(D, P.flower(fl[i % 5]), 16 + rnd() * 14, 0, -16 + rnd() * 44);
  K.add(D, P.lamp(), -11.0, 0, -3.5); box(-11.1, -3.6, -10.9, -3.4);
  const shopArea = shopShell(D, SHOP, '森林市集', '#59a14f', 6.5);
  K.bake(D, scene);
  // river ripples drift downstream
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(G.plane(1.8, 0.25), new THREE.MeshBasicMaterial({ color: '#dff6ff', transparent: true, opacity: 0.5, depthWrite: false }));
    m.position.set(13.8, 0.014, -20 + i * 9); m.renderOrder = 1; scene.add(m); ripples.push({ m, z0: -20 + i * 9 });
  }
  for (const [x, z] of [[-24, -1], [27, 27]]) { const d = P5.deer(); d.g.position.set(x, 0, z); K.bakeStatic(d.b); scene.add(d.g); animals.push({ ...d, kind: 'deer', home: [x, z], tx: x, tz: z, t: 0 }); }
  for (const [x, z] of [[-10.2, 0.4], [-17.6, 11], [-6, 18.6], [18, 3]]) { const s = P5.squirrel(); s.g.position.set(x, 0, z); K.bakeStatic(s.b); scene.add(s.g); animals.push({ ...s, kind: 'squirrel', home: [x, z], tx: x, tz: z, t: 0 }); }
  return shopArea;
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
function binLabel(b, max) {
  const cnt = {}; for (const t of b.list) cnt[t] = (cnt[t] || 0) + 1;
  const ks = Object.keys(cnt).sort((a, c) => cnt[c] - cnt[a]);
  return ks.map((t) => '<span>' + ICON[t] + cnt[t] + '</span>').join('') + '<span class="tot">' + b.list.length + '/' + (max || b.max) + '</span>';
}

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
function confetti(x, z) { const cols = [C.red, C.yellow, C.blue, C.pink, C.green, C.purple]; for (let i = 0; i < 26; i++) puff(x, 1, z, cols[i % cols.length], 1, 2.2); }
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
  const m = itemMesh(type); m.position.copy(from); m.scale.setScalar(ITEMS[type].ss || 1); scene.add(m);
  flyers.push({ m, from: from.clone(), toFn, t: 0, dur, done });
}

// ---------- carriers ----------
function carrier(p) { return { p, carry: [], incoming: 0, xfer: 0, cap: () => 6 }; }
function stackTop(c, out) { let h = 0; for (const it of c.carry) h += ITEMS[it.type].h * (ITEMS[it.type].ss || 1); c.p.back.getWorldPosition(out); out.y += h + 0.15; return out; }
function restack(c) { let y = 0; for (const it of c.carry) { it.m.position.set(0, y, 0); it.y = y; y += ITEMS[it.type].h * (ITEMS[it.type].ss || 1); } }
function swayStack(c, speed, dt) {
  const target = -Math.min(1, speed / 5);
  c.swv = (c.swv || 0) + ((target - (c.sw || 0)) * 60 - (c.swv || 0) * 9) * dt;
  c.sw = (c.sw || 0) + c.swv * dt;
  const n = c.carry.length;
  for (let i = 0; i < n; i++) {
    const it = c.carry[i], k = i / Math.max(6, n), s0 = ITEMS[it.type].ss || 1;
    it.m.position.z = c.sw * k * k * (0.35 + n * 0.03);
    it.m.rotation.x = c.sw * k * 0.25;
    if (it.pop > 0) { it.pop = Math.max(0, it.pop - dt * 5); const q = it.pop; it.m.scale.set(s0 * (1 + q * 0.35), s0 * (1 - q * 0.3), s0 * (1 + q * 0.35)); }
  }
}
function stackAdd(c, type) { const m = itemMesh(type); m.rotation.y = Math.PI / 2; m.scale.setScalar(ITEMS[type].ss || 1); c.p.back.add(m); c.carry.push({ type, m, pop: 1 }); restack(c); }
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
function takeInto(c, type, from) { c.incoming++; fly(type, from, (o) => stackTop(c, o), 0.3, () => { c.incoming--; stackAdd(c, type); }); }

// ---------- player ----------
const player = carrier(K.person({ body: '#ff7f6e', hat: 'straw' }));
player.cap = () => upVal('cap');
player.p.root.position.set(START[0], 0, START[1]);
scene.add(player.p.root);
const axe = new THREE.Group();
K.add(axe, K.mesh(G.rbox(0.06, 0.5, 0.06, 0.02), C.woodDark), 0, -0.25, 0.1);
K.add(axe, K.mesh(G.rbox(0.05, 0.18, 0.22, 0.03), C.grey), 0, -0.46, 0.2);
player.p.arms[1].add(axe); axe.visible = false;
const pVel = new THREE.Vector3();
let pFace = 0;

// ---------- cash counters: forest market and the furniture showroom ----------
const COUNTERS = [
  { x: 4.6, z: -9.9, serve: { x: 4.6, z: -11.3 }, pile: { x: 7.0, z: -10.2, value: 0 }, qDir: -1, qz: -8.5, on: false },
  { x: -15.6, z: -8.6, serve: { x: -15.6, z: -10.0 }, pile: { x: -13.0, z: -9.6, value: 0 }, qDir: -1, qz: -7.25, on: false },
];
function buildCounter(i) {
  const c = COUNTERS[i]; c.on = true;
  const g = P.counter(); g.position.set(c.x, 0.12, c.z); scene.add(g); K.bakeStatic(g);
  box(c.x - 1.45, c.z - 0.55, c.x + 1.45, c.z + 0.55);
  K.add(scene, K.mesh(G.rbox(1.3, 0.04, 1.3, 0.1), '#c9f0c2', false, true), c.pile.x, 0.14, c.pile.z);
  c.pile.grp = K.add(scene, new THREE.Group(), c.pile.x, 0.16, c.pile.z);
  const slots = [];
  for (let k = 0; k < 40; k++) { const col = k % 4, row = Math.floor(k / 4) % 2, lay = Math.floor(k / 8); slots.push({ p: V3(-0.3 + (col % 2) * 0.48, lay * 0.07, -0.32 + row * 0.34 + Math.floor(col / 2) * 0.32 - 0.15), ry: (k * 0.37) % 0.3 }); }
  c.pile.stack = itemStack('money', c.pile.grp, slots);
  c.pile.label = label('badge money', '', (o) => o.set(c.pile.x, 1.2, c.pile.z));
  c.pile.value = state.piles[i] || 0; setPile(c.pile);
}
function setPile(p) {
  const n = p.value > 0 ? Math.min(p.stack.max, Math.ceil(p.value / 6)) : 0;
  p.stack.set(n); p.label.show = p.value > 0;
  setLabel(p.label, ICON.money + fmtMoney(p.value));
}
function fmtMoney(v) { return v >= 100000 ? (v / 1000).toFixed(0) + 'K' : v >= 10000 ? (v / 1000).toFixed(1) + 'K' : String(v); }

// ---------- furniture catalog (家具圖鑑) ----------
function made(type, at) {
  if (!FURN.includes(type.replace('_r', ''))) return;
  const L = state.log[type] || (state.log[type] = { n: 0, b: 0 });
  L.n++;
  if (L.n === 1) {
    state.logNew = true; showLogDot();
    toast('📖 新家具：' + ITEMS[type].name + '！');
    if (at) { confetti(at.x, at.z); floatText('NEW ' + ITEMS[type].name, V3(at.x, 2, at.z), 'big'); }
    sfx('vip');
    LOG_PAGES.forEach((pg, i) => {
      if (state.logPaid[i] || !pg.ids.every((t) => state.log[t] && state.log[t].n > 0)) return;
      state.logPaid[i] = true;
      later.push({ t: 1.2, fn: () => { bonusToPlayer(pg.reward, player.p.root.position.clone()); toast('📖 圖鑑「' + pg.name + '」完成！獎勵 $' + fmtMoney(pg.reward)); } });
    });
  }
}
function recBest(type, unit) { if (!state.log[type]) return; if (unit > state.log[type].b) state.log[type].b = unit; }
function showLogDot() { const d = document.querySelector('#bLog .dot'); if (d) d.classList.toggle('hidden', !state.logNew); }

// ---------- stations ----------
const stations = {};
const pops = [];
const later = [];
function popIn(obj) { obj.scale.setScalar(0.01); pops.push({ obj, t: 0 }); }
const CROP_LAYOUT = {
  mush: { w: 4.2, d: 2.8, make: P5.mushroomSpot, plot: () => P5.mossPlot(4.2, 2.8), spots: [[-1.4, -0.6], [0, -0.6], [1.4, -0.6], [-1.4, 0.6], [0, 0.6], [1.4, 0.6]], solid: false, y: 0.09 },
  tap: { w: 7.6, d: 4.6, make: P5.tapMaple, plot: null, spots: [[-2.6, -1.7], [0, -1.7], [2.6, -1.7], [-2.6, 1.7], [0, 1.7], [2.6, 1.7]], solid: true, y: 0 },
};
const bakery = { on: false, bin: null, pile: null, t: 0 };
const courierTruck = { on: false, g: null, st: 'park', t: 0, load: 0 };
const BIN_SRC = ['apiary'];
const furniturePrice = () => (courierTruck.on ? 1.25 : 1) * (events.snow > 0 ? 1.3 : 1);

function build(def, instant) {
  const id = def.id;
  if (!state.built.includes(id)) state.built.push(id);
  const s = { id, def, kind: def.kind };
  stations[id] = s;
  const pos = def.pos || def.zone;
  if (def.kind === 'logging') {
    s.trees = woods.trees;
    applyGrow(s);
  } else if (def.kind === 'crop') {
    const L = CROP_LAYOUT[def.plant];
    const g = new THREE.Group(); g.position.set(pos[0], 0, pos[1]); scene.add(g);
    if (L.plot) g.add(L.plot());
    s.plants = [];
    for (const [x, z] of L.spots) {
      const pl = L.make(); pl.g.position.set(x, L.y, z); pl.g.rotation.y = (x + z) * 2; pl.g.userData.dyn = true; pl.fruit.userData.dyn = true; g.add(pl.g); K.bakeStatic(pl.fruit); K.bakeStatic(pl.g);
      s.plants.push({ ...pl, x: pos[0] + x, z: pos[1] + z, ripe: true, t: 0, res: null });
    }
    s.grow = def.grow; s.g = g; s.w = L.w; s.d = L.d; s.solid = L.solid;
    applyGrow(s);
    if (!instant) popIn(g);
  } else if (def.kind === 'machine') {
    const m = P5.machine5(def.mk);
    m.g.position.set(pos[0], 0, pos[1]); scene.add(m.g);
    if (m.wheel) { m.wheel.position.set(pos[0] + 3.6, 0.5, pos[1] - 0.2); scene.add(m.wheel); K.bakeStatic(m.wheel); s.wheel = m.wheel; }
    K.bakeStatic(m.spin);
    const tw = m.inTray.getWorldPosition(new THREE.Vector3()), nw = m.outTray.getWorldPosition(new THREE.Vector3());
    Object.assign(s, { g: m.g, spin: m.spin, inPt: tw, outPt: nw, timer: 0 });
    const outCap = def.mk === 'sawmill' ? 20 : 12;
    s.inBin = makeBin(m.inTray, traySlots(), 12); s.outBin = makeBin(m.outTray, traySlots(outCap), outCap);
    const st = state.stock[id]; if (st) { loadList(s.inBin, st.i); loadList(s.outBin, st.o); }
    box(pos[0] - 0.85, pos[1] - 0.8, pos[0] + 0.85, pos[1] + 0.4);
    s.inLabel = label('badge grp', '', (o) => o.copy(tw).setY(0.95));
    s.outLabel = label('badge grp', '', (o) => o.copy(nw).setY(0.95));
    if (def.mk === 'planer') {
      // a short wooden chute from the sawmill's output tray into the planer
      const ch = new THREE.Group(), a = V3(10.85, 0, 8.45), b = V3(7.95, 0, 5.25), len = a.distanceTo(b), ry = -Math.atan2(b.z - a.z, b.x - a.x);
      const belt = K.add(ch, K.mesh(G.rbox(len, 0.08, 0.5, 0.03), '#c98a55'), (a.x + b.x) / 2, 0.62, (a.z + b.z) / 2); belt.rotation.y = ry;
      for (const sg of [-1, 1]) { const r = K.add(ch, K.mesh(G.rbox(len, 0.14, 0.06, 0.02), '#8b5a3c'), (a.x + b.x) / 2 - sg * 0.22 * Math.sin(ry), 0.72, (a.z + b.z) / 2 - sg * 0.22 * Math.cos(ry)); r.rotation.y = ry; }
      scene.add(ch); K.bakeStatic(ch);
    }
    if (!instant) popIn(m.g);
  } else if (def.kind === 'shelf' || def.kind === 'platform') {
    const plat = def.kind === 'platform';
    const sh = plat ? P5.platform() : P.shelf(); sh.g.position.set(pos[0], 0.12, pos[1]); scene.add(sh.g);
    Object.assign(s, { g: sh.g, items: def.items, ci: plat ? 1 : 0, front: V3(pos[0], 0, pos[1] + (plat ? 1.35 : 1.25)) });
    const slots = [];
    if (plat) for (let i = 0; i < 12; i++) slots.push({ p: V3(-0.9 + (i % 3) * 0.9, 0.25 + Math.floor(i / 6) * 0.62, -0.38 + (Math.floor(i / 3) % 2) * 0.78), ry: 0.3 });
    else for (let i = 0; i < 24; i++) slots.push({ p: sh.slots[i % 8].clone().setY(sh.slots[i % 8].y + Math.floor(i / 8) * 0.2), ry: Math.PI / 2 + (i % 3) * 0.2 - 0.2 });
    s.bin = makeBin(sh.g, slots, plat ? 12 : 24);
    const ic = itemMesh(def.items[0]); ic.scale.setScalar(plat ? 0.55 : 0.9); ic.position.set(0, plat ? 0.82 : 1.12, plat ? -0.92 : -0.38); ic.rotation.x = 0.5; ic.userData.dyn = true; sh.g.add(ic);
    const st = state.stock[id]; if (st) loadList(s.bin, st.l);
    s.label = label('badge big grp', '', (o) => o.set(pos[0], plat ? 1.7 : 1.95, pos[1]));
    if (plat) box(pos[0] - 1.4, pos[1] - 0.9, pos[0] + 1.4, pos[1] + 0.9); else box(pos[0] - 0.85, pos[1] - 0.5, pos[0] + 0.85, pos[1] + 0.5);
    if (!instant) popIn(sh.g);
  } else if (def.kind === 'counter') {
    buildCounter(0);
  } else if (def.kind === 'hire') {
    s.worker = makeWorker(def.role, def.zone, !instant);
  } else if (def.kind === 'pet') {
    const sq = P5.squirrel(); sq.g.position.set(5.6, 1.12, -10.1); sq.g.rotation.y = -0.6; sq.g.scale.setScalar(1.4); K.bakeStatic(sq.b); scene.add(sq.g); pets.squirrel = sq; if (!instant) popIn(sq.g);
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
  } else if (def.kind === 'showroom') {
    const g = new THREE.Group(); scene.add(g);
    shopShell(g, SHOW, '家具展示館', '#c98a55', -12.7);
    K.bakeStatic(g);
    buildCounter(1);
    if (!instant) popIn(g);
  } else if (def.kind === 'flume') {
    const g = new THREE.Group(); scene.add(g);
    const pts = FLUME.path;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1], len = Math.hypot(bx - ax, bz - az);
      const pc = P5.flumePiece(len); pc.position.set(ax, 0, az); pc.rotation.y = -Math.atan2(bz - az, bx - ax); g.add(pc);
      for (let x = 0.4; x < len; x += 2.6) { const px = ax + (bx - ax) * x / len, pz = az + (bz - az) * x / len; box(px - 0.18, pz - 0.36, px + 0.18, pz + 0.36); }
    }
    const hp = P5.hopper(); hp.position.set(FLUME.hop[0], 0, FLUME.hop[1]); g.add(hp);
    box(FLUME.hop[0] - 0.6, FLUME.hop[1] - 0.5, FLUME.hop[0] + 0.6, FLUME.hop[1] + 0.5);
    const pad = P2.pad('#59c25b'); pad.position.set(FLUME.pad[0], 0, FLUME.pad[1]); g.add(pad);
    s.g = g; s.queue = []; s.depPt = V3(FLUME.pad[0], 0, FLUME.pad[1]);
    s.len = 0; for (let i = 0; i < pts.length - 1; i++) s.len += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    const st = state.stock[id]; if (st && st.q) st.q.forEach((t, i) => s.queue.push({ t, d: i * 0.6, m: null }));
    s.label = label('badge pad', '放原木', (o) => o.set(FLUME.pad[0], 0.7, FLUME.pad[1])); s.label.near = 8;
    if (!instant) popIn(g);
  } else if (def.kind === 'apiary') {
    s.g = new THREE.Group(); scene.add(s.g);
    s.hives = [];
    HIVES.forEach(([x, z], i) => { const h = P5.hive(); h.g.position.set(x, 0, z); h.g.rotation.y = Math.PI / 2; scene.add(h.g); K.bakeStatic(h.bees); K.bakeStatic(h.g); h.g.visible = false; s.hives.push({ ...h, x, z, t: rand(0, 4), on: false, boxRef: null }); });
    const cr = P3.crate(); cr.position.set(-19.6, 0, 13.6); s.g.add(cr);
    s.outPt = V3(-19.6, 0, 13.6); s.outBin = makeBin(cr, crateSlots(), 20, true);
    box(-20.28, 13.1, -18.92, 14.1);
    const st = state.stock[id]; if (st) loadList(s.outBin, st.l);
    s.bin = s.outBin;
    s.outLabel = label('badge grp', '', (o) => o.set(-19.6, 1.0, 13.6));
    for (let i = 0; i < 24; i++) K.add(s.g, P.flower(['#ffd34a', '#ff7eb6', '#ffffff'][i % 3]), -23.6 + (i % 6) * 0.8, 0, 1.6 + Math.floor(i / 6) * 3.2);
    applyGrow(s);
    if (!instant) popIn(s.g);
  } else if (def.kind === 'town') {
    buildSite(def, instant);
  } else if (def.kind === 'courier') {
    const tr = P.truck(); tr.g.position.set(-18.6, 0, -2.7); box(-19.9, -3.2, -17.3, -2.2); tr.g.rotation.y = -Math.PI / 2; tr.g.scale.setScalar(0.8); scene.add(tr.g); K.bakeStatic(tr.g);
    Object.assign(courierTruck, { on: true, g: tr.g, bed: tr.bed, st: 'park', t: 0, load: 0 });
    if (!instant) popIn(tr.g);
  } else if (def.kind === 'expand') {
    applyGrow(stations.logging);
  } else if (def.kind === 'mapgate') {
    mapsSet('cafe');
    // a signpost beside the (now gone) zone, never on top of where the player stood
    const sx = 11.3, sz = -8.9, g = new THREE.Group(); g.position.set(sx, 0, sz); scene.add(g);
    K.add(g, K.mesh(G.rbox(0.16, 1.7, 0.16, 0.04), C.woodDark), 0, 0.85, 0);
    const sb = P2.signBoard('往山城咖啡館', 2.8, '#8b5a3c'); sb.scale.setScalar(0.6); sb.position.set(0, 1.75, 0); g.add(sb);
    box(sx - 0.15, sz - 0.15, sx + 0.15, sz + 0.15);
    s.g = g;
    if (!instant) { popIn(g); later.push({ t: 1.0, fn: () => openPanel('map') }); }
  }
  if (s.g && s.g.isObject3D && def.kind !== 'logging') K.bakeStatic(s.g);
  if (!instant) { confetti(pos[0], pos[1]); sfx('unlock'); toast('🎉 ' + def.name + (def.kind === 'town' ? ' 開工了！' : ' 完成！') + (def.kind === 'town' ? '' : (def.note || ''))); }
  evict();
  refreshZones();
  save();
}
function applyGrow(s) {
  const id = s.id; if (!GROW[id]) return;
  const n = Math.min(lvlOf(id), growMax(id));
  if (s.trees) s.trees.forEach((t, i) => {
    const on = i < n;
    if (on && !t.on) { t.on = true; t.g.visible = true; showTree(t); t.boxRef = box(t.x - 0.35, t.z - 0.35, t.x + 0.35, t.z + 0.35); if (woods.ready) popIn(t.g); }
  });
  if (s.trees) woods.ready = true;
  if (s.hives) s.hives.forEach((h, i) => { const on = i < n; if (on && !h.on) { h.on = true; h.g.visible = true; h.boxRef = box(h.x - 0.45, h.z - 0.42, h.x + 0.45, h.z + 0.42); popIn(h.g); } });
  const fresh = s.plants && !s.plants.some((q) => q.active);
  if (s.plants) s.plants.forEach((pl, i) => {
    const on = i < n;
    if (on && !pl.active) { pl.g.visible = true; pl.ripe = fresh; pl.t = 0; pl.fruit.visible = fresh; pl.fruit.scale.setScalar(1); if (!fresh) popIn(pl.g); if (s.solid) pl.boxRef = box(pl.x - 0.35, pl.z - 0.35, pl.x + 0.35, pl.z + 0.35); }
    if (!on) { pl.g.visible = false; pl.ripe = false; }
    pl.active = on;
  });
}
// the woods stand there from the start; buying 伐木區 makes them yours to chop (and lets you grow more)
const woods = { trees: [] };
function createWoods() {
  TREE_SPOTS.forEach(([x, z], i) => {
    const kind = TREE_KIND(i), t = kind === 'oak' ? P5.oakTree() : kind === 'maple' ? P5.mapleTree() : P5.pineTree();
    t.g.position.set(x, 0, z); t.g.rotation.y = i * 1.7; t.g.visible = false; scene.add(t.g);
    K.bakeStatic(t.alive); K.bakeStatic(t.stump); K.bakeStatic(t.sapling); K.bakeStatic(t.g);
    woods.trees.push({ ...t, kind, x, z, st: 'alive', hp: 4, t: 0, res: null, chop: 0, shake: 0, on: false, fireT: 0, wet: 0, boxRef: null });
  });
  applyGrow({ id: 'logging', trees: woods.trees });
}
function showTree(t) { t.alive.visible = t.st === 'alive'; t.stump.visible = t.st === 'stump'; t.sapling.visible = t.st === 'sapling'; t.fire.visible = t.fireT > 0; }

// ---------- town: construction sites that ask for materials, then a building with a lasting bonus ----------
const TOWN_BOX = 1.95;
function buildSite(def, instant) {
  const L = LOTS[def.lot], s = stations[def.id];
  const rec = state.sites[def.id] || (state.sites[def.id] = { got: {}, done: false });
  s.got = rec.got; s.pad = V3(L.pad[0], 0, L.pad[1]); s.g = null;
  s.boxRef = box(L.x - TOWN_BOX, L.z - TOWN_BOX, L.x + TOWN_BOX, L.z + TOWN_BOX);
  if (rec.done) { finishSite(s, true); return; }
  s.scaffold = P5.scaffold(); s.scaffold.position.set(L.x, 0, L.z); scene.add(s.scaffold); K.bakeStatic(s.scaffold);
  s.padObj = P2.pad('#ffb347'); s.padObj.position.copy(s.pad); scene.add(s.padObj);
  s.label = label('zone order', '', (o) => o.set(L.x, 2.8, L.z));
  updateSiteLabel(s);
  if (!instant) popIn(s.scaffold);
}
const siteLeft = (s, t) => (s.def.need[t] || 0) - (s.got[t] || 0);
function updateSiteLabel(s) {
  let rows = ''; for (const t in s.def.need) { const l = siteLeft(s, t); if (l > 0) rows += costRow(t, l); }
  setLabel(s.label, '<div class="zn">🏗️ ' + s.def.name + ' 施工中</div>' + rows);
}
function siteDeposit(c, s, t, dt) {
  c.xfer -= dt;
  if (c.xfer > 0 || count(c, t) <= 0 || siteLeft(s, t) - (s.pend && s.pend[t] || 0) <= 0) return;
  c.xfer = 0.1; s.pend = s.pend || {}; s.pend[t] = (s.pend[t] || 0) + 1;
  giveFrom(c, t, (o) => o.set(s.pad.x, 0.6, s.pad.z), () => {
    s.pend[t]--; s.got[t] = (s.got[t] || 0) + 1; state.sites[s.id].got = s.got; updateSiteLabel(s);
    if (Object.keys(s.def.need).every((k) => siteLeft(s, k) <= 0)) finishSite(s, false);
  });
  if (c === player) sfx('drop');
}
function finishSite(s, instant) {
  const L = LOTS[s.def.lot];
  state.sites[s.id].done = true; s.done = true;
  if (s.scaffold) { scene.remove(s.scaffold); s.scaffold = null; }
  if (s.padObj) { scene.remove(s.padObj); s.padObj = null; }
  if (s.label) { dropLabel(s.label); s.label = null; }
  const g = P5.townBuilding(s.def.bld); g.position.set(L.x, 0, L.z); g.rotation.y = L.x < 22 ? Math.PI / 2 : -Math.PI / 2; scene.add(g); K.bakeStatic(g); s.g = g;
  if (s.def.bld === 'park') { unbox(s.boxRef); s.boxRef = box(L.x - 1.0, L.z - 1.0, L.x + 1.0, L.z + 1.0); }
  if (s.def.bld === 'bakery') {
    bakery.on = true; bakery.bin = makeBin(new THREE.Group(), traySlots(), 16); bakery.pad = s.pad;
    const pd = P2.pad('#ff8fb1'); pd.position.copy(s.pad); scene.add(pd);
    bakery.label = label('badge grp', '', (o) => o.set(s.pad.x, 1.0, s.pad.z));
    bakery.pile = { x: s.pad.x, z: s.pad.z + 1.8, value: state.bakeryPile || 0 };
    K.add(scene, K.mesh(G.rbox(1.3, 0.04, 1.3, 0.1), '#c9f0c2', false, true), bakery.pile.x, 0.02, bakery.pile.z);
    bakery.pile.grp = K.add(scene, new THREE.Group(), bakery.pile.x, 0.04, bakery.pile.z);
    const slots = []; for (let k = 0; k < 16; k++) slots.push({ p: V3(-0.3 + (k % 2) * 0.48, Math.floor(k / 4) * 0.07, -0.17 + (Math.floor(k / 2) % 2) * 0.34), ry: (k * 0.37) % 0.3 });
    bakery.pile.stack = itemStack('money', bakery.pile.grp, slots);
    bakery.pile.label = label('badge money', '', (o) => o.set(bakery.pile.x, 1.0, bakery.pile.z));
    setPile(bakery.pile);
  }
  if (s.def.bld === 'clock' && !state.festival) state.festival = true;
  if (!instant) {
    confetti(L.x, L.z); confetti(L.x + 1, L.z + 1); sfx('vip'); popIn(g);
    toast('🎉 ' + s.def.name + ' 蓋好了！' + (s.def.note || ''));
    if (s.def.bld === 'clock') { for (let i = 0; i < 6; i++) later.push({ t: i * 0.4, fn: () => { confetti(L.x + rand(-4, 4), L.z + rand(-4, 4)); sfx('unlock'); } }); }
  }
  evict(); refreshZones(); save();
}
const priceMult = () => upVal('price') * (state.festival ? 1.2 : 1);
const crowd = () => upVal('cust') * (siteDone('house') ? 1.3 : 1);
const patienceK = () => (siteDone('park') ? 1.5 : 1);
const tipK = () => (siteDone('park') ? 1 : 0) + (pets.squirrel ? 1 : 0);

// ---------- maps unlocked across the whole game ----------
const MAPS_KEY = 'farm_maps_v1';
function mapsGet() { try { return JSON.parse(localStorage.getItem(MAPS_KEY) || '{}'); } catch (e) { return {}; } }
function mapsSet(id) { const m = mapsGet(); m[id] = true; try { localStorage.setItem(MAPS_KEY, JSON.stringify(m)); } catch (e) { /* storage off */ } }
const CAFE_EARNED = 400000;
const cafeGateOpen = () => siteDone('clockTower') || state.earned >= CAFE_EARNED;

// ---------- opening tutorial ----------
const guide = { arrows: [], labels: [] };
function makeArrow() {
  const g = new THREE.Group();
  K.add(g, K.mesh(G.cone(0.42, 0.7, 12), '#ffd23f'), 0, 0, 0).rotation.x = Math.PI;
  K.add(g, K.mesh(G.cyl(0.17, 0.17, 0.6, 10), '#ffd23f'), 0, 0.62, 0);
  g.visible = false; scene.add(g);
  return g;
}
function guideTargets() {
  if (isBuilt('counter')) return { ids: [], two: false };
  const starts = DEFS.filter((d) => d.start);
  if (!starts.some((d) => isBuilt(d.id))) return { ids: starts.map((d) => d.id), two: true };
  const shelves = DEFS.filter((d) => d.kind === 'shelf' && d.req && d.req.some((r) => starts.some((st) => st.id === r)));
  if (!shelves.some((d) => isBuilt(d.id))) return { ids: shelves.filter((d) => zones[d.id]).map((d) => d.id), two: false };
  return { ids: ['counter'], two: false };
}
function updateGuide(T) {
  const g = guideTargets();
  while (guide.arrows.length < 2) { guide.arrows.push(makeArrow()); const L = label('guide', '二選一', (o) => o.set(0, 0, 0)); L.show = false; guide.labels.push(L); }
  for (let i = 0; i < 2; i++) {
    const z = zones[g.ids[i]], a = guide.arrows[i], L = guide.labels[i];
    a.visible = !!z; L.show = !!z && g.two;
    if (!z) continue;
    a.position.set(z.x, 3.0 + Math.abs(Math.sin(T * 4)) * 0.45, z.z); a.rotation.y += 0.03;
    L.getPos = (o) => o.set(z.x, 4.3, z.z);
  }
}

// ---------- zones ----------
const zones = {};
const dashTex = K.dashTexture();
const dashMat = new THREE.MeshBasicMaterial({ map: dashTex, transparent: true, depthWrite: false });
const fillMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false });
function refreshZones() {
  for (const def of DEFS) {
    if (isBuilt(def.id)) { if (zones[def.id]) killZone(def.id); continue; }
    let open = def.req ? def.req.every(isBuilt) : def.any.some(isBuilt);
    if (def.reqDone && !def.reqDone.every(siteDone)) open = false;
    if (def.kind === 'mapgate' && !cafeGateOpen()) open = false;
    if (def.start && DEFS.some((d) => d.start && d !== def && isBuilt(d.id)) && !isBuilt('cashier')) open = false;
    if (!open && def.start && zones[def.id]) killZone(def.id);
    if (open && !zones[def.id]) makeZone(def);
  }
  for (const key in GROW) if (zones['g_' + key] && lvlOf(key) >= growMax(key)) killZone('g_' + key);
  for (const def of growDefs()) {
    const z = zones[def.id];
    if (z && z.def.lv !== def.lv) killZone(def.id);
    if (!zones[def.id]) makeZone(def);
  }
}
function frontOf(def) {
  if (def.kind === 'logging') return [-4.0, 5.6];
  if (def.kind === 'apiary') return [-22.6, 15.8];
  if (def.kind === 'crop') return [def.pos[0], def.pos[1] + CROP_LAYOUT[def.plant].d / 2 + 1.5];
  if (def.kind === 'machine' || def.kind === 'shelf') return [def.pos[0], def.pos[1] + 1.7];
  if (def.kind === 'platform') return [def.pos[0], def.pos[1] + 1.7];
  if (def.kind === 'town') return LOTS[def.lot].pad;
  return def.zone || def.pos;
}
function zoneSpot(def) { return def.kind === 'town' ? LOTS[def.lot].pad : def.zone || frontOf(def); }
function growDefs() {
  const out = [];
  for (const key in GROW) {
    const g = GROW[key], n = lvlOf(key);
    if (n >= growMax(key) || !isBuilt(key)) continue;
    out.push({ id: 'g_' + key, name: g.what, kind: 'grow', target: key, lv: n, zone: frontOf(DEF[key]), cost: { money: g.cost[Math.min(n - g.start, g.cost.length - 1)] } });
  }
  return out;
}
function grow(def) {
  state.lvl[def.target] = lvlOf(def.target) + 1;
  applyGrow(stations[def.target]);
  confetti(def.zone[0], def.zone[1]); sfx('unlock'); toast('🎉 ' + def.name + '！');
  evict(); refreshZones(); save();
}
const onFloor = (x, z) => (z < SHOW.z1 && z > SHOW.z0 && x > SHOW.x0 && x < SHOW.x1 && isBuilt('showroom')) || (z < SHOP.z1 && x > SHOP.x0 && x < SHOP.x1 && z > SHOP.z0);
function makeZone(def) {
  const [x, z] = zoneSpot(def);
  const g = new THREE.Group(); g.position.set(x, onFloor(x, z) ? 0.15 : 0.03, z); scene.add(g);
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
  if (!z.total) rows = '<div class="cost">免費</div>';
  if (z.def.kind === 'town') rows += '<div class="rew">開工後要送建材</div>';
  setLabel(z.label, '<div class="zn">' + z.def.name + '</div>' + rows);
  let paidSum = 0; for (const k in z.def.cost) paidSum += Math.min(z.def.cost[k], z.paid[k] || 0);
  const k01 = z.total ? paidSum / z.total : 0;
  z.fill.scale.set(1, 1, Math.max(0.001, k01));
  z.fill.position.z = 0.95 * (1 - k01);
}
function payZones(dt) {
  for (const id in zones) {
    const z = zones[id];
    if (dist2(player.p.root.position, z.x, z.z) > 1.35) { z.tick = 0; z.armed = true; z.stay = 0; continue; }
    if (!z.armed) continue;
    // only start paying after standing on the zone for half a second (walking across it costs nothing)
    z.stay = (z.stay || 0) + dt; if (z.stay < 0.5) continue;
    if (!z.total) { const d = z.def; later.push({ t: 0.2, fn: () => build(d) }); killZone(id); sfx('drop'); continue; }
    z.tick -= dt; if (z.tick > 0) continue;
    z.tick = 0.06;
    let moved = false;
    for (const k in z.def.cost) {
      const l = left(z, k); if (l <= 0) continue;
      if (k === 'money') {
        const chunk = Math.min(l, state.money, Math.max(1, Math.ceil(z.def.cost.money / 24)));
        if (chunk > 0) { state.money -= chunk; z.paid.money = (z.paid.money || 0) + chunk; moved = true; fly('money', V3(player.p.root.position.x, 1.6, player.p.root.position.z), (o) => o.set(z.x, 0.3, z.z), 0.25, null); }
      } else if (count(player, k) > 0) { z.paid[k] = (z.paid[k] || 0) + 1; moved = true; giveFrom(player, k, (o) => o.set(z.x, 0.3, z.z), null); }
    }
    if (moved) {
      state.paid[id] = z.paid; sfx('drop'); updateZoneLabel(z); updateMoney();
      let done = true; for (const k in z.def.cost) if (left(z, k) > 0) done = false;
      if (done) { delete state.paid[id]; const d = z.def; later.push({ t: 0.3, fn: () => (d.kind === 'grow' ? grow(d) : build(d)) }); killZone(id); }
    }
  }
}
const inShop = (x, z) => z < SHOP.z1 && z > SHOP.z0 - 0.4 && x > SHOP.x0 && x < SHOP.x1;
const inShow = (x, z) => isBuilt('showroom') && z < SHOW.z1 && z > SHOW.z0 && x > SHOW.x0 && x < SHOW.x1;
const floorY = (x, z) => (inShop(x, z) || inShow(x, z) ? 0.12 : 0);

// ---------- workers ----------
const workers = [];
const LOOKS = {
  cashier: { body: '#b48cff', hat: 'bun', hatColor: '#7a4fd6', apron: C.white },
  clerk: { body: '#ff9fc4', hat: 'bun', hatColor: '#c96a8a', apron: C.white },
  lumberjack: { body: '#ff6b5a', hat: 'cap', hatColor: '#3a3540', legs: '#4f6fb5' },
  planter: { body: '#7fcf6a', hat: 'straw', apron: '#8b5a3c' },
  hauler: { body: '#5aa9ff', hat: 'cap', hatColor: '#ffd34a', apron: '#ffd34a' },
  carpenter: { body: '#e8b67c', hat: 'cap', hatColor: '#c96a2a', apron: '#8b5a3c' },
  sapper: { body: '#ff9f43', hat: 'straw', apron: '#c96a2a' },
  beekeeper: { body: '#fbfaf5', hat: 'bun', hatColor: '#ffd34a', legs: '#ffd34a' },
  forager: { body: '#9a7ad6', hat: 'straw', apron: '#59a14f' },
};
const ONLY = { sapper: ['sap', 'syrup'], beekeeper: ['honey', 'wax', 'candle'], forager: ['shiitake', 'truffle'] };
const HOME = { lumberjack: [-5.0, 1.0], planter: [-5.4, -1.2], hauler: [0, -4.4], carpenter: [1.2, 25.0], sapper: [-15.4, 25.2], beekeeper: [-17.4, 16.6], forager: [6.4, 5.0] };
const HIRE = {
  lumberjack: { name: '伐木工', ic: 'pine', base: 700 }, planter: { name: '植樹員', ic: 'oak', base: 700 }, hauler: { name: '搬運工', ic: 'plank', base: 800 },
  carpenter: { name: '木匠', ic: 'chair', base: 1500 }, sapper: { name: '採汁員', ic: 'sap', base: 1200 }, beekeeper: { name: '養蜂人', ic: 'honey', base: 1500 }, forager: { name: '採菇員', ic: 'shiitake', base: 1200 },
};
const HIRE_MAX = 6;
const roleOpen = (role) => DEFS.some((d) => d.kind === 'hire' && d.role === role && isBuilt(d.id));
const roleCount = (role) => workers.filter((w) => w.role === role).length;
function hireCost(role) { const n = state.extra[role] || 0; return n >= HIRE_MAX ? null : Math.round(HIRE[role].base * Math.pow(1.8, n) / 10) * 10; }
function hireExtra(role) {
  const cost = hireCost(role);
  if (cost === null || state.money < cost || !roleOpen(role)) return false;
  state.money -= cost; updateMoney();
  state.extra[role] = (state.extra[role] || 0) + 1;
  const w = makeWorker(role, HOME[role], true); const p = w.p.root.position; puff(p.x, 1, p.z, '#ffffff', 8, 0.8);
  sfx('unlock'); toast('🎉 多請了一位' + HIRE[role].name + '！'); save();
  return true;
}
function makeWorker(role, at, pop) {
  const p = K.person(LOOKS[role]);
  p.root.position.set(at[0], 0, at[1]); scene.add(p.root); if (pop) popIn(p.root);
  const w = carrier(p);
  Object.assign(w, { role, job: null, wait: 0, face: 0, moving: 0 });
  w.cap = () => upVal('wcap');
  if (role === 'lumberjack') { const ax = axe.clone(); ax.visible = false; p.arms[1].add(ax); w.axe = ax; }
  workers.push(w);
  return w;
}
function go(w, x, z, dt, speed) {
  const key = x.toFixed(2) + ',' + z.toFixed(2);
  if (w.routeKey !== key || w.navV !== navV) { w.routeKey = key; w.navV = navV; const p = w.p.root.position; w.route = nav.path(p.x, p.z, x, z); if (!w.route.length) w.route = [[x, z]]; }
  while (w.route.length > 1 && walkTo(w, w.route[0][0], w.route[0][1], dt, speed)) w.route.shift();
  if (w.route.length > 1) return false;
  return walkTo(w, w.route[0][0], w.route[0][1], dt, speed);
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
const srcBin = (s) => s.outBin || null;
const srcCount = (src, item) => src.kind === 'store' ? (state.store[item] || 0) : srcBin(src) ? binCount(srcBin(src), item) : 0;
function srcTake(src, item) { if (src.kind === 'store') state.store[item]--; else binTake(srcBin(src), item); }
const srcPoint = (src) => (src.kind === 'store' ? src.outPt : src.kind === 'apiary' ? V3(src.outPt.x + 1.1, 0, src.outPt.z) : V3(src.outPt.x + 0.3, 0, src.outPt.z + 0.9));
function producible(t) {
  for (const s of Object.values(stations)) {
    if (s.kind === 'logging' && ['pine', 'oak', 'maple'].includes(t)) return true;
    if (s.kind === 'crop' && (s.def.out === t || s.def.rare === t)) return true;
    if (s.kind === 'apiary' && (t === 'honey' || t === 'wax')) return true;
    if (s.kind === 'machine' && (s.def.out === t || (s.def.mk === 'sawmill' && t === 'sawdust') || (s.def.mk === 'shroom' && t === 'truffle') || s.def.out + '_r' === t)) return true;
  }
  return false;
}
function sourceFor(item, w) {
  let best = null, bd = 1e9;
  for (const s of Object.values(stations)) {
    let ok = false;
    if (srcBin(s) && binCount(srcBin(s), item) > 0) ok = true;
    if (s.kind === 'crop' && (s.def.out === item) && s.plants.some((p) => p.ripe && (!p.res || p.res === w))) ok = true;
    if (s.kind === 'store' && (state.store[item] || 0) > 0) ok = true;
    if (!ok) continue;
    const pt = s.outPt || V3(s.def.pos[0], 0, s.def.pos[1]);
    const d = dist2(w.p.root.position, pt.x, pt.z);
    if (d < bd) { bd = d; best = s; }
  }
  return best;
}
const shelfSpace = (s) => (s.kind === 'platform' ? 12 : upVal('shelfCap')) - s.bin.list.length - (s.pend || 0);
const machAccepts = (m, t) => m.def.ins.includes(t);
const machSpace = (m) => m.inBin.max - m.inBin.list.length - (m.pend || 0);
function pickJob(w) {
  const only = ONLY[w.role] || null;
  const okItem = (t) => !only || only.includes(t);
  const want = (it) => customers.filter((c) => c.st === 'shop' && c.item === it).length;
  let best = null;
  const consider = (k, dst, src, item) => { if (!best || k > best.k) best = { k, dst, src, item }; };
  const taken = (dst, item) => workers.some((o) => o !== w && o.job && o.job.dst === dst && o.job.item === item);
  for (const s of [...listOf('shelf'), ...listOf('platform')]) {
    const space = shelfSpace(s); if (space < 1) continue;
    for (const item of s.items) {
      if (!okItem(item)) continue;
      const src = sourceFor(item, w); if (!src) continue;
      consider(want(item) * 8 + space * 0.6 + (binCount(s.bin, item) === 0 ? 4 : 0) + Math.random() * 2 - (taken(s, item) ? 12 : 0), s, src, item);
    }
  }
  for (const m of listOf('machine')) {
    const space = machSpace(m); if (space < 2) continue;
    for (const item of m.def.ins) {
      if (!okItem(item)) continue;
      const src = sourceFor(item, w); if (!src) continue;
      const clog = srcBin(src) && srcBin(src).list.length >= srcBin(src).max * 0.7 ? 6 : 0;   // keep busy machines from blocking up
      consider(space * 0.8 + (m.inBin.list.length === 0 ? 5 : 0) + clog + (m.def.mk === 'bench' ? 4 : 0) + Math.random() * 2 - (taken(m, item) ? 12 : 0), m, src, item);
    }
  }
  if (!only || only.includes('honey')) for (const s of listOf('town')) {
    if (s.done) continue;
    for (const item in s.def.need) {
      if (!okItem(item) || siteLeft(s, item) - (s.pend && s.pend[item] || 0) <= 0) continue;
      const src = sourceFor(item, w); if (!src) continue;
      consider(30 + Math.random() * 2 - (taken(s, item) ? 12 : 0), s, src, item);   // building the town comes first (beats machines and shelves)
    }
  }
  if (bakery.on && binRoom(bakery.bin) > 1) for (const item of ['syrup', 'honey']) {
    if (!okItem(item)) continue;
    const src = sourceFor(item, w); if (!src) continue;
    consider(3 + Math.random() * 2 - (taken('bakery', item) ? 12 : 0), 'bakery', src, item);
  }
  const wh = stations.warehouse;
  if (wh && storeTotal() < STORE_CAP - 10) for (const s of Object.values(stations)) {
    const b = srcBin(s); if (!b || b.list.length < b.max * 0.8) continue;
    const cnt = {}; for (const t of b.list) if (okItem(t)) cnt[t] = (cnt[t] || 0) + 1;
    const item = Object.keys(cnt).sort((a, c) => cnt[c] - cnt[a])[0]; if (!item) continue;
    consider((b.list.length >= b.max ? 12 : 5) - (taken(wh, item) ? 12 : 0), wh, s, item);
  }
  return best ? { dst: best.dst, src: best.src, item: best.item, phase: 'get' } : null;
}
function depositTo(c, dst, item, dt) {
  if (dst === 'bakery') {
    c.xfer -= dt; if (c.xfer > 0 || count(c, item) <= 0 || binRoom(bakery.bin) <= 0) return;
    c.xfer = 0.1; bakery.bin.pend = (bakery.bin.pend || 0) + 1;
    giveFrom(c, item, (o) => o.set(bakery.pad.x, 0.8, bakery.pad.z), () => { bakery.bin.pend--; binAdd(bakery.bin, item); });
    if (c === player) sfx('drop');
    return;
  }
  if (dst.kind === 'town') { siteDeposit(c, dst, item, dt); return; }
  c.xfer -= dt;
  if (c.xfer > 0 || count(c, item) <= 0) return;
  if (dst.kind === 'store') {
    if (storeTotal() + (dst.pend || 0) >= STORE_CAP) return;
    c.xfer = 0.06; dst.pend = (dst.pend || 0) + 1;
    giveFrom(c, item, (o) => o.set(dst.def.pos[0], 0.8, dst.def.pos[1] + 1.6), () => { dst.pend--; state.store[item] = (state.store[item] || 0) + 1; });
  } else if (dst.kind === 'shelf' || dst.kind === 'platform') {
    if (shelfSpace(dst) <= 0) return;
    c.xfer = 0.1; dst.pend = (dst.pend || 0) + 1;
    giveFrom(c, item, (o) => o.set(dst.def.pos[0], 0.9, dst.def.pos[1]), () => { dst.pend--; binAdd(dst.bin, item); });
  } else if (dst.kind === 'machine') {
    if (machSpace(dst) <= 0) return;
    c.xfer = 0.1; dst.pend = (dst.pend || 0) + 1;
    giveFrom(c, item, (o) => o.copy(dst.inPt).setY(0.4), () => { dst.pend--; binAdd(dst.inBin, item); });
  } else if (dst.kind === 'flume') {
    if (dst.queue.length >= 16) return;
    c.xfer = 0.12;
    giveFrom(c, item, (o) => o.set(FLUME.hop[0], 1.6, FLUME.hop[1]), () => { dst.queue.push({ t: item, d: 0, m: null }); });
  }
  if (c === player) sfx('drop');
}
function dstPoint(dst) {
  if (dst === 'bakery') return bakery.pad;
  if (dst.kind === 'town') return dst.pad;
  if (dst.kind === 'shelf' || dst.kind === 'platform') return dst.front;
  if (dst.kind === 'store' || dst.kind === 'flume') return dst.depPt;
  return V3(dst.inPt.x, 0, dst.inPt.z + 0.9);
}
function isFull(dst, item) {
  if (dst === 'bakery') return binRoom(bakery.bin) <= 0;
  if (dst.kind === 'town') return dst.done || siteLeft(dst, item) - (dst.pend && dst.pend[item] || 0) <= 0;
  if (dst.kind === 'shelf' || dst.kind === 'platform') return shelfSpace(dst) <= 0;
  if (dst.kind === 'store') return storeTotal() >= STORE_CAP;
  if (dst.kind === 'flume') return dst.queue.length >= 16;
  return machSpace(dst) <= 0;
}
const isLog = (t) => t === 'pine' || t === 'oak' || t === 'maple';
function dstFor(type) {
  const sh = [...listOf('shelf'), ...listOf('platform')].find((s) => s.items.includes(type) && !isFull(s, type));
  const fl = stations.flume && isLog(type) && stations.sawmill && !isFull(stations.flume, type) ? stations.flume : null;
  const mc = listOf('machine').find((m) => machAccepts(m, type) && !isFull(m, type));
  const site = listOf('town').find((s) => !s.done && !isFull(s, type));
  const bk = bakery.on && (type === 'syrup' || type === 'honey') && !isFull('bakery', type) ? 'bakery' : null;
  return site || fl || mc || sh || bk || (stations.warehouse && storeTotal() < STORE_CAP ? stations.warehouse : null);
}
// anything the player can make use of right now (so the crate pick-up takes useful things first)
const usable = (t) => DEFS.some((d) => (isBuilt(d.id) || zones[d.id]) && ((d.items && d.items.includes(t)) || (d.ins && d.ins.includes(t)) || (d.need && d.need[t]))) || Object.values(zones).some((z) => z.def.cost[t] && left(z, t) > 0) || !!stations.warehouse;

function updateWorker(w, dt) {
  const sp = upVal('wspeed') * (siteDone('school') ? 1.15 : 1);
  w.moving = 0;
  if (w.role === 'cashier' || w.role === 'clerk') { const c = COUNTERS[w.role === 'clerk' ? 1 : 0]; if (go(w, c.serve.x, c.serve.z, dt, sp)) w.face = 0; return; }
  if (w.role === 'lumberjack') { updateLumberjack(w, dt, sp); return; }
  if (w.role === 'planter') { updatePlanter(w, dt, sp); return; }
  if (w.role === 'carpenter') { updateCarpenter(w, dt, sp); return; }
  haul(w, dt, sp, HOME[w.role] || [0, -4.4]);
}
// generic hauling: fetch a full load from a source, deliver to a shelf, machine, site, the bakery or the warehouse
function haul(w, dt, sp, home) {
  if (!w.job) {
    if (w.carry.length && !w.incoming) {
      const type = w.carry[w.carry.length - 1].type, dst = dstFor(type);
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
      if (!pl) j.phase = w.carry.length ? 'put' : 'done';
      else if (go(w, pl.x + (src.solid ? 0.9 : 0), pl.z + 0.7, dt, sp)) { pickPlant(src, pl, w); j.plant = null; }
    } else {
      const p0 = srcPoint(src);
      if (go(w, p0.x, p0.z, dt, sp) || dist2(w.p.root.position, src.outPt.x, src.outPt.z) < 1.3) {
        w.xfer -= dt;
        if (w.xfer <= 0 && srcCount(src, j.item) > 0 && room(w) > 0) { w.xfer = 0.1; srcTake(src, j.item); takeInto(w, j.item, V3(src.outPt.x, 0.4, src.outPt.z)); }
        if ((srcCount(src, j.item) <= 0 || room(w) <= 0) && !w.incoming) j.phase = count(w, j.item) ? 'put' : 'done';
      }
    }
  } else if (j.phase === 'put') {
    if (!w.incoming) {
      const type = count(w, j.item) ? j.item : (w.carry.length ? w.carry[w.carry.length - 1].type : null);
      if (!type) { j.phase = 'done'; }
      else {
        if (type !== j.item || isFull(j.dst, type)) { const d2 = dstFor(type); if (d2) { j.dst = d2; j.item = type; } }
        const p = dstPoint(j.dst);
        if (go(w, p.x + 0.4, p.z, dt, sp) || dist2(w.p.root.position, p.x, p.z) < 1.1) {
          depositTo(w, j.dst, j.item, dt);
          if (count(w, j.item) === 0 || isFull(j.dst, j.item)) j.phase = w.carry.length ? 'put' : 'done';
          if (count(w, j.item) === 0 && w.carry.length) { j.item = w.carry[w.carry.length - 1].type; const d3 = dstFor(j.item); if (d3) j.dst = d3; else j.phase = 'done'; }
        }
      }
    }
  }
  if (j.phase === 'done') { if (j.plant && j.plant.res === w) j.plant.res = null; w.job = null; }
}
// 伐木工: chop the nearest standing tree, then bring the logs to the flume / sawmill / shelf
function updateLumberjack(w, dt, sp) {
  const lg = stations.logging; if (!lg) { idleWander(w, dt, -6, 1); return; }
  if (w.axe) w.axe.visible = false;
  if (w.incoming) return;
  if (w.carry.length && (room(w) <= 0 || w.deliver || !lg.trees.some((t) => t.on && t.st === 'alive' && (!t.res || t.res === w)))) {
    w.deliver = true; haul(w, dt, sp, HOME.lumberjack);
    if (!w.carry.length && !w.incoming) { w.deliver = false; w.job = null; }
    return;
  }
  let t = w.tree;
  if (!t || t.st !== 'alive' || (t.res && t.res !== w)) {
    if (t && t.res === w) t.res = null;
    let bd = 1e9; t = null;
    for (const q of lg.trees) if (q.on && q.st === 'alive' && !q.res && !q.fireT) { const d = dist2(w.p.root.position, q.x, q.z); if (d < bd) { bd = d; t = q; } }
    w.tree = t; if (t) t.res = w;
  }
  if (!t) { idleWander(w, dt, HOME.lumberjack[0], HOME.lumberjack[1]); return; }
  if (go(w, t.x + 0.9, t.z + 0.2, dt, sp) || dist2(w.p.root.position, t.x, t.z) < 1.4) {
    w.face = Math.atan2(t.x - w.p.root.position.x, t.z - w.p.root.position.z);
    if (w.axe) { w.axe.visible = true; w.axe.rotation.x = -1.2 + Math.sin(performance.now() / 70) * 0.9; }
    chopTick(t, w, dt);
  }
}
// 植樹員: replant stumps so they grow back much faster
function updatePlanter(w, dt, sp) {
  const lg = stations.logging; if (!lg) { idleWander(w, dt, -6, -1); return; }
  let t = w.tree;
  if (!t || t.st !== 'stump' || t.planted) { t = null; let bd = 1e9; for (const q of lg.trees) if (q.on && q.st === 'stump' && !q.planted && (!q.res2 || q.res2 === w)) { const d = dist2(w.p.root.position, q.x, q.z); if (d < bd) { bd = d; t = q; } } w.tree = t; if (t) t.res2 = w; }
  if (!t) { idleWander(w, dt, HOME.planter[0], HOME.planter[1]); return; }
  if (go(w, t.x + 0.85, t.z - 0.2, dt, sp) || dist2(w.p.root.position, t.x, t.z) < 1.3) {
    w.plantT = (w.plantT || 0) + dt;
    if (w.plantT > 0.8) { w.plantT = 0; t.planted = true; t.st = 'sapling'; t.t = 0; t.res2 = null; showTree(t); if (!simming) puff(t.x, 0.4, t.z, '#8fd16a', 5, 0.5); w.tree = null; }
  }
}
// 木匠: works at the furniture benches; a bench with a carpenter beside it works faster
function updateCarpenter(w, dt, sp) {
  const benches = listOf('machine').filter((m) => m.def.mk === 'bench');
  if (!benches.length) { idleWander(w, dt, HOME.carpenter[0], HOME.carpenter[1]); return; }
  w.benchT = (w.benchT || 0) - dt;
  if (!w.bench || w.benchT <= 0) {
    const free = benches.filter((b) => b.inBin.list.length && !workers.some((o) => o !== w && o.bench === b));
    w.bench = free.length ? pick(free) : pick(benches); w.benchT = 8 + Math.random() * 4;
  }
  const b = w.bench;
  if (go(w, b.def.pos[0], b.def.pos[1] + 1.1, dt, sp)) w.face = Math.PI;
}
const carpenterAt = (m) => workers.some((w) => w.role === 'carpenter' && w.bench === m && dist2(w.p.root.position, m.def.pos[0], m.def.pos[1] + 1.1) < 0.6);

// ---------- trees ----------
function chopTick(t, c, dt) {
  if (room(c) <= 0) return false;
  t.chop = (t.chop || 0) + dt;
  if (t.chop < upVal('chop')) return true;
  t.chop = 0; t.hp--; t.shake = 1;
  if (!simming) { puff(t.x, 0.9, t.z, '#efb27a', 3, 0.6); if (c === player) sfx('chop'); }
  const n = events.contest > 0 ? 2 : 1;
  for (let i = 0; i < n && room(c) > 0; i++) takeInto(c, t.kind, V3(t.x, 0.9, t.z));
  if (t.hp <= 0) { t.st = 'stump'; t.t = 0; t.planted = false; t.res = null; showTree(t); if (!simming) puff(t.x, 1.6, t.z, t.kind === 'maple' ? '#ff7a3c' : '#6fcd5f', 10, 1.4); }
  return true;
}
function updateTrees(dt, T) {
  const lg = woods;
  const regrow = upVal('regrow') * (events.snow > 0 ? 2 : 1);
  for (const t of lg.trees) {
    if (!t.on) continue;
    if (t.shake > 0) { t.shake = Math.max(0, t.shake - dt * 4); t.alive.rotation.z = Math.sin(t.shake * 20) * 0.06 * t.shake; }
    if (t.st === 'stump') { t.t += dt; if (t.t > regrow * 0.6) { t.st = 'sapling'; t.t = 0; showTree(t); } }
    else if (t.st === 'sapling') { t.t += dt; const k = Math.min(1, t.t / (regrow * 0.4)); t.sapling.scale.setScalar(0.5 + k * 0.7); if (k >= 1) { t.st = 'alive'; t.hp = 4; t.planted = false; showTree(t); if (!simming) pops.push({ obj: t.alive, t: 0 }); } }
    if (t.fireT > 0) {
      t.fireT -= dt;
      if (!simming) for (const f of t.fire.children) f.scale.y = 0.8 + Math.sin(T * 14 + f.position.x * 9) * 0.25;
      if (t.fireT <= 0) { t.st = 'stump'; t.t = 0; t.res = null; t.fireT = 0; showTree(t); toast('🔥 一棵樹被燒掉了…'); }
    }
  }
}

// ---------- harvesting helper ----------
function pickPlant(s, pl, c) {
  if (!pl.ripe || room(c) <= 0) { pl.res = null; return; }
  pl.ripe = false; pl.t = 0; pl.res = null; pl.fruit.visible = false;
  const t = s.def.rare && Math.random() < 0.06 ? s.def.rare : s.def.out;
  takeInto(c, t, V3(pl.x, 0.6, pl.z));
  if (t === s.def.rare && c === player) { toast('✨ 找到松露了！'); floatText('✨ 松露', V3(pl.x, 1.8, pl.z), 'big'); }
  if (c === player) sfx('pop');
}

// ---------- customers (market and showroom) ----------
const customers = [];
const CUST_COLS = ['#ff9f43', '#5ec8ff', '#ffd34a', '#ff7eb6', '#9fd86b', '#c69bff', '#ff8a6b', '#6fe3c8'];
const queueAt = (ci, i) => [COUNTERS[ci].x + COUNTERS[ci].qDir * i * 0.95, COUNTERS[ci].qz];
const spawnT = [3, 6];
function customerLook() { return { body: pick(CUST_COLS), hat: Math.random() < 0.3 ? 'cap' : (Math.random() < 0.3 ? 'bun' : null), hatColor: pick(CUST_COLS) }; }
function shopperWant(sh) {
  const stocked = sh.items.filter((t) => binCount(sh.bin, t) > 0);
  if (stocked.length && Math.random() < 0.85) return pick(stocked);
  const can = sh.items.filter((t) => producible(t));
  return can.length ? pick(can) : null;
}
function spawnCustomer(ci) {
  const shelves = (ci ? listOf('platform') : listOf('shelf')).filter((s) => s.items.some((t) => binCount(s.bin, t) > 0 || producible(t)));
  if (!shelves.length) return null;
  const sh = pick(shelves), item = shopperWant(sh);
  if (!item) return null;
  const p = K.person(customerLook());
  const sp = ci ? SPAWN2 : SPAWN;
  p.root.position.set(sp[0], 0, sp[1] + rand(-0.5, 0.5)); scene.add(p.root);
  const need = ci ? 1 : 1 + Math.floor(Math.random() * Math.min(4, 1 + shelves.length));
  const c = { p, ci, shelf: sh, item, need, got: 0, st: 'in', path: [], t: 0, face: 0, moving: 0, qi: 99 };
  setGoal(c, sh.front.x + rand(-0.75, 0.75), sh.front.z + rand(0.15, 0.6));
  c.label = label('bubble', '', (o) => { o.copy(c.p.root.position); o.y = 2.05; });
  customers.push(c);
  return c;
}
function stepPath(c, dt, speed) {
  if (c.goal && c.navV !== navV) setGoal(c, ...c.goal);
  if (!c.path.length) return true;
  const [tx, tz] = c.path[0];
  const dx = tx - c.p.root.position.x, dz = tz - c.p.root.position.z, d = Math.hypot(dx, dz);
  if (d < 0.1) { c.path.shift(); return !c.path.length; }
  const s = Math.min(d, speed * dt); c.p.root.position.x += dx / d * s; c.p.root.position.z += dz / d * s; c.face = Math.atan2(dx, dz); c.moving = 1;
  return false;
}
function updateCustomers(dt) {
  for (let ci = 0; ci < 2; ci++) {
    const n = (ci ? listOf('platform') : listOf('shelf')).length;
    if (!n || !COUNTERS[ci].on) continue;
    spawnT[ci] -= dt * crowd();
    const mine = customers.filter((c) => c.ci === ci).length, maxC = ci ? Math.min(6, 2 + n) : Math.min(12, 3 + Math.round(n * 1.5));
    if (spawnT[ci] <= 0 && mine < maxC) { spawnCustomer(ci); spawnT[ci] = (ci ? Math.max(3, 9 - n) : Math.max(1.4, 7 - n * 0.7)) * (0.7 + Math.random() * 0.6); }
  }
  const served = COUNTERS.map((k, i) => k.on && (workers.some((w) => (w.role === (i ? 'clerk' : 'cashier')) && dist2(w.p.root.position, k.serve.x, k.serve.z) < 0.6) || dist2(player.p.root.position, k.serve.x, k.serve.z) < 1.3));
  for (let ci = 0; ci < 2; ci++) customers.filter((c) => c.ci === ci && (c.st === 'queue' || c.st === 'toQueue')).sort((a, b) => a.qi - b.qi).forEach((c, i) => { c.qi = i; });
  for (let i = customers.length - 1; i >= 0; i--) {
    const c = customers[i];
    c.moving = 0;
    if (c.st === 'in') { if (stepPath(c, dt, 2.6)) { c.st = 'shop'; c.face = Math.PI; c.t = 0.4; c.patience = 32 * patienceK(); } }
    else if (c.st === 'shop') {
      c.t -= dt; c.patience -= dt;
      if (c.t <= 0 && binCount(c.shelf.bin, c.item) > 0 && c.got < c.need) {
        c.t = 0.35; binTake(c.shelf.bin, c.item); c.got++;
        fly(c.item, V3(c.shelf.def.pos[0], 0.8, c.shelf.def.pos[1]), (o) => { o.copy(c.p.root.position); o.y = 1.2; }, 0.25, null);
      }
      if (c.patience <= 0 && c.got < c.need) { if (c.got > 0) c.need = c.got; else { leaveShop(c); floatText('😞', V3(c.p.root.position.x, 2.2, c.p.root.position.z)); } }
      if (c.st === 'shop' && c.got >= c.need) { c.st = 'toQueue'; c.qi = 99; const [qx, qz] = queueAt(c.ci, 4); setGoal(c, qx, qz); }
    } else if (c.st === 'toQueue' || c.st === 'queue') {
      if (stepPath(c, dt, 2.6)) {
        const [qx, qz] = queueAt(c.ci, c.qi);
        const pos = c.p.root.position, dx = qx - pos.x, dz = qz - pos.z, d = Math.hypot(dx, dz);
        if (d > 0.08) { const s = Math.min(d, 2.6 * dt); pos.x += dx / d * s; pos.z += dz / d * s; c.face = Math.atan2(dx, dz); c.moving = 1; }
        else { c.st = 'queue'; c.face = Math.PI; }
      }
      if (c.st === 'queue' && c.qi === 0) { c.t = (c.t > 0 ? c.t : 0) + (served[c.ci] ? dt : 0); if (c.t > 0.5) pay(c); }
    } else if (c.st === 'leave') {
      if (stepPath(c, dt, 2.8)) { scene.remove(c.p.root); dropLabel(c.label); customers.splice(i, 1); continue; }
    }
    c.p.root.position.y = floorY(c.p.root.position.x, c.p.root.position.z);
    turn(c.p, c.face, dt); c.p.anim(dt, c.moving);
    if (c.st === 'shop' || c.st === 'in') setLabel(c.label, badge(c.item, c.got, c.need));
    else if (c.st !== 'leave') setLabel(c.label, ICON.money);
  }
}
function leaveShop(c) { c.st = 'leave'; c.label.show = false; const sp = c.ci ? SPAWN2 : SPAWN; setGoal(c, sp[0], sp[1]); }
const stats = { sales: 0, furniture: 0, made: {}, sold: {}, chopped: 0, sites: 0, trains: 0, bakery: 0 };
function pay(c) {
  const furn = FURN.includes(c.item.replace('_r', ''));
  const unit = Math.round(ITEMS[c.item].price * priceMult() * (furn ? furniturePrice() : 1));
  const v = unit * c.got + tipK();
  recBest(c.item, unit);
  const k = COUNTERS[c.ci]; stats.sales++; if (furn) stats.furniture++; stats.sold[c.item] = (stats.sold[c.item] || 0) + c.got;
  k.pile.value += v; setPile(k.pile); sfx('coin');
  floatText('+' + v, V3(k.pile.x, 1.6, k.pile.z), 'money');
  if (furn && courierTruck.on) { courierTruck.load++; fly(c.item, V3(k.pile.x, 1, k.pile.z), (o) => { if (courierTruck.bed) courierTruck.bed.getWorldPosition(o); o.y += 0.3; }, 0.6, null); }
  else { const bag = new THREE.Group(); K.add(bag, K.mesh(G.rbox(0.36, 0.38, 0.24, 0.06), '#e8c290'), 0, 0.1, 0); c.p.front.add(bag); }
  leaveShop(c);
}

// ---------- special orders: train ----------
const train = { st: 'away', t: 60, obj: null, order: null, value: 0, label: null };
function sellables() { return ['plank', 'refined', 'paper', 'notebook', 'syrup', 'honey', 'candle', 'shiitake', ...FURN].filter((t) => producible(t)); }
function makeOrder(types, lo, hi) {
  const items = sellables(), order = {};
  for (let i = 0; i < types && items.length; i++) { const it = pick(items); const big = ITEMS[it].price >= 40 ? 0.35 : 1; order[it] = (order[it] || 0) + Math.max(1, Math.round(rand(lo, hi) * big)); }
  return order;
}
function orderValue(order, mult) { let v = 0; for (const k in order) v += order[k] * ITEMS[k].price; return Math.round(v * priceMult() * mult); }
function orderRows(order) { let r = ''; for (const k in order) if (order[k] > 0) r += costRow(k, order[k]); return r; }
function orderDone(order) { for (const k in order) if (order[k] > 0) return false; return true; }
function bonusToPlayer(v, at) {
  floatText('+' + fmtMoney(v), at, 'money big'); sfx('vip');
  for (let i = 0; i < 8; i++) { const share = i < 7 ? Math.floor(v / 8) : v - Math.floor(v / 8) * 7; later.push({ t: i * 0.06, fn: () => fly('money', at.clone().setY(1), (o) => { o.copy(player.p.root.position); o.y = 1.6; }, 0.35, () => { addMoney(share); sfx('coin'); }) }); }
}
function updateTrain(dt) {
  if (!siteDone('trainStation')) return;
  if (!train.obj) {
    train.obj = P5.train(); K.bakeStatic(train.obj.g); train.obj.g.position.set(80, 0, TRAIN.z); train.obj.g.visible = false; scene.add(train.obj.g);
    train.label = label('zone order', '', (o) => o.set(TRAIN.spot[0], 0.3, TRAIN.spot[1] - 0.6)); train.label.show = false;
  }
  const g = train.obj.g;
  train.t -= dt;
  if (train.st === 'away' && train.t <= 0) { train.order = makeOrder(3, 5, 11); train.value = orderValue(train.order, 5) + 500; train.st = 'come'; g.visible = true; g.position.x = 80; toast('🚂 火車大訂單來了！'); }
  if (train.st === 'come') { g.position.x = Math.max(TRAIN.stopX, g.position.x - 12 * dt); if (g.position.x <= TRAIN.stopX) { train.st = 'wait'; train.t = 150; train.label.show = true; } }
  if (train.st === 'wait') {
    setLabel(train.label, '<div class="zn">🚂 火車訂單 ' + Math.ceil(train.t) + '秒</div>' + orderRows(train.order) + '<div class="rew">' + ICON.money + fmtMoney(train.value) + '</div>');
    if (dist2(player.p.root.position, TRAIN.spot[0], TRAIN.spot[1]) < 2.0) {
      train.xfer = (train.xfer || 0) - dt;
      if (train.xfer <= 0) for (const k in train.order) if (train.order[k] > 0 && count(player, k) > 0) { train.order[k]--; train.xfer = 0.08; sfx('drop'); giveFrom(player, k, (o) => o.set(TRAIN.spot[0], 1.2, TRAIN.z), null); break; }
    }
    if (orderDone(train.order)) { stats.trains++; bonusToPlayer(train.value, V3(TRAIN.spot[0], 2, TRAIN.spot[1])); confetti(TRAIN.spot[0], TRAIN.spot[1]); train.st = 'leave'; train.label.show = false; }
    else if (train.t <= 0) { train.st = 'leave'; train.label.show = false; toast('火車開走了…'); }
  }
  if (train.st === 'leave') { g.position.x += 12 * dt; if (g.position.x > 80) { train.st = 'away'; train.t = rand(120, 180); g.visible = false; } }
}

// ---------- events: 伐木大賽, 雪季, 森林大火 ----------
const events = { contest: 0, snow: 0, next: 90 };
let eventLabel = null, snowObj = null;
function updateEvents(dt) {
  events.contest = Math.max(0, events.contest - dt);
  events.snow = Math.max(0, events.snow - dt);
  if (isBuilt('sawmill')) {
    events.next -= dt;
    if (events.next <= 0) {
      events.next = rand(100, 160);
      const r = Math.random(), lg = stations.logging;
      if (r < 0.4) { events.contest = 40; toast('🪓 伐木大賽！原木加倍 40 秒'); }
      else if (r < 0.7) { events.snow = 60; toast('❄️ 雪季來了：樹長得慢，家具賣得貴'); }
      else if (lg) {
        const alive = lg.trees.filter((t) => t.on && t.st === 'alive' && !t.fireT);
        const n = Math.min(alive.length, siteDone('fireStation') ? 1 : 3);
        if (n) { for (let i = 0; i < n; i++) { const t = alive.splice(Math.floor(Math.random() * alive.length), 1)[0]; t.fireT = siteDone('fireStation') ? 10 : 25; t.wet = 0; showTree(t); } toast('🔥 森林大火！快去站在著火的樹旁邊滅火'); }
      }
    }
  }
  if (!eventLabel) { eventLabel = label('event', '', (o) => o.copy(player.p.root.position).setY(3.4)); eventLabel.show = false; }
  const msg = events.contest > 0 ? '🪓 原木加倍 ' + Math.ceil(events.contest) + '秒' : events.snow > 0 ? '❄️ 雪季 ' + Math.ceil(events.snow) + '秒' : '';
  eventLabel.show = !!msg; if (msg) setLabel(eventLabel, msg);
  if (events.snow > 0 && !snowObj && !simming) {
    const n = 300, pos = new Float32Array(n * 3);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    snowObj = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.18, transparent: true, opacity: 0.9 }));
    snowObj.userData.d = Array.from({ length: n }, () => [Math.random() * 30 - 15, Math.random() * 14, Math.random() * 30 - 15]);
    scene.add(snowObj);
  }
  if (snowObj) {
    const pp = player.p.root.position, a = snowObj.geometry.attributes.position.array;
    snowObj.userData.d.forEach((d, i) => { d[1] -= dt * 2.4; if (d[1] < 0) d[1] += 14; a[i * 3] = pp.x + d[0] + Math.sin(d[1]) * 0.3; a[i * 3 + 1] = d[1]; a[i * 3 + 2] = pp.z + d[2]; });
    snowObj.geometry.attributes.position.needsUpdate = true;
    if (events.snow <= 0) { scene.remove(snowObj); snowObj = null; }
  }
}
let toastT = 0;
function toast(msg) { if (simming) return; const el = $('toast'); el.textContent = msg; el.classList.add('on'); toastT = 2.6; }

// ---------- UI ----------
let shownMoney = -1;
function updateMoney() { if (shownMoney !== state.money) { shownMoney = state.money; $('moneyN').textContent = fmtMoney(state.money); } }
function logCard(t) {
  const L = state.log[t];
  if (!L || !L.n) return '<div class="lcard unk">' + ICON_SIL[t] + '<b>？？？</b><small>尚未做出</small></div>';
  return '<div class="lcard">' + ICON_BIG[t] + '<b>' + ITEMS[t].name + '</b><small>做了 ' + L.n + ' 件</small><small>最高售價 ' + (L.b ? '$' + fmtMoney(L.b) : '—') + '</small></div>';
}
function openPanel(kind) {
  const P0 = $('panel'), body = $('pBody');
  P0.classList.remove('hidden');
  $('pTabs').innerHTML = ''; body.innerHTML = '';
  if (kind === 'up') {
    $('pTitle').textContent = '升級';
    const tabs = ['角色', '員工', '林場', '商店'];
    const show = (ti) => {
      openPanel.tab = ti;
      [...$('pTabs').children].forEach((b, i) => b.classList.toggle('on', i === ti));
      body.innerHTML = '';
      if (ti === 1 && !workers.length) { body.innerHTML = '<div class="empty">解鎖第一位員工後開放</div>'; return; }
      if (ti === 1) {
        const names = [['cashier', '收銀員'], ['clerk', '店員'], ...Object.keys(HIRE).map((r) => [r, HIRE[r].name])];
        body.insertAdjacentHTML('beforeend', '<div class="chips staff">' + names.filter(([r]) => roleCount(r)).map(([r, nm]) => '<span class="chip">' + nm + ' ×' + roleCount(r) + '</span>').join('') + '</div>');
        for (const role in HIRE) {
          if (!roleOpen(role)) continue;
          const h = HIRE[role], cost = hireCost(role), max = cost === null;
          const row = document.createElement('div'); row.className = 'row';
          row.innerHTML = '<span class="ricon">' + ICON[h.ic] + '</span><div class="rmid"><b>多請一位' + h.name + '</b><small>目前 ' + roleCount(role) + ' 位 · 已多請 ' + (state.extra[role] || 0) + '/' + HIRE_MAX + ' 位</small></div>';
          const b = document.createElement('button'); b.className = 'buy' + (max ? ' max' : (state.money < cost ? ' poor' : ''));
          b.innerHTML = max ? '已滿' : ICON.money + fmtMoney(cost);
          b.onclick = () => { if (!hireExtra(role)) { sfx('drop'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 300); return; } show(ti); };
          row.appendChild(b); body.appendChild(row);
        }
        body.insertAdjacentHTML('beforeend', '<div class="sec">員工升級</div>');
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
  } else if (kind === 'log') {
    $('pTitle').textContent = '家具圖鑑';
    state.logNew = false; showLogDot();
    const show = (pi) => {
      openPanel.logTab = pi;
      [...$('pTabs').children].forEach((b, i) => b.classList.toggle('on', i === pi));
      const pg = LOG_PAGES[pi], got = pg.ids.filter((t) => state.log[t] && state.log[t].n > 0).length;
      body.innerHTML = '<div class="logs">' + pg.ids.map(logCard).join('') + '</div>' +
        '<div class="preward' + (state.logPaid[pi] ? ' done' : '') + '"><b>收集 ' + got + '/' + pg.ids.length + '</b><span>' + (state.logPaid[pi] ? '✓ 已領取獎勵' : '集滿獎勵 ' + ICON.money + fmtMoney(pg.reward)) + '</span></div>';
    };
    LOG_PAGES.forEach((pg, i) => { const b = document.createElement('button'); b.textContent = pg.name; b.onclick = () => show(i); $('pTabs').appendChild(b); });
    show(openPanel.logTab || 0);
  } else if (kind === 'inv') {
    $('pTitle').textContent = '倉庫';
    const chipsOf = (cnt) => { const ks = Object.keys(cnt).filter((k) => cnt[k] > 0); return ks.length ? ks.map((k) => '<span class="chip">' + ICON[k] + cnt[k] + '</span>').join('') : '<span class="empty">空空的</span>'; };
    const cntList = (list) => { const o = {}; for (const t of list) o[t] = (o[t] || 0) + 1; return o; };
    let h = '<div class="sec">背包 ' + player.carry.length + '/' + player.cap() + '</div><div class="chips">' + chipsOf(cntList(player.carry.map((c) => c.type))) + '</div>';
    const sh = [...listOf('shelf'), ...listOf('platform')];
    h += '<div class="sec">市集與展示館</div>' + (sh.length ? sh.map((s) => '<div class="chips"><span class="chip">' + s.def.name + ' ' + s.bin.list.length + '/' + (s.kind === 'platform' ? 12 : upVal('shelfCap')) + '</span>' + s.items.map((t) => '<span class="chip">' + ICON[t] + binCount(s.bin, t) + '</span>').join('') + '</div>').join('') : '<div class="empty">還沒有貨架</div>');
    if (stations.warehouse) h += '<div class="sec">倉庫 ' + storeTotal() + '/' + STORE_CAP + '</div><div class="chips">' + chipsOf(state.store) + '</div>';
    h += '<div class="sec">加工</div><div class="chips">';
    for (const s of listOf('machine')) h += '<span class="chip">' + s.def.name + ' ' + s.inBin.list.length + ' → ' + s.outBin.list.length + '</span>';
    const towns = listOf('town');
    if (towns.length) h += '</div><div class="sec">小鎮</div><div class="chips">' + towns.map((s) => '<span class="chip">' + s.def.name + ' ' + (s.done ? '✓' : '施工中') + '</span>').join('');
    h += '</div><div class="sec">進度</div><div class="chips"><span class="chip">已解鎖 ' + state.built.length + '/' + DEFS.length + '</span><span class="chip">總收入 ' + ICON.money + fmtMoney(state.earned) + '</span></div>';
    body.innerHTML = h;
  } else if (kind === 'map') {
    $('pTitle').textContent = '地圖';
    const m = mapsGet();
    body.innerHTML = '<a class="mapcard" href="./index.html"><span class="mi" style="background:#c9f0a8">🌾</span><div><b>開心農場</b><small>回到農場</small></div></a>' +
      (m.harbor ? '<a class="mapcard" href="./harbor.html"><span class="mi" style="background:#bfe9ff">⚓</span><div><b>海邊漁港</b><small>捕魚、魚市場、海鮮餐廳</small></div></a>'
        : '<div class="mapcard locked"><span class="mi" style="background:#e8e2d6">⚓</span><div><b>海邊漁港</b><small>在農場開分店後開放</small></div></div>') +
      '<div class="mapcard here"><span class="mi" style="background:#cdeec0">🌲</span><div><b>森林小鎮</b><small>你現在在這裡</small></div></div>' +
      (m.cafe ? '<a class="mapcard" href="./cafe.html"><span class="mi" style="background:#f3dcc0">☕</span><div><b>山城咖啡館</b><small>咖啡園、烘豆、咖啡館</small></div></a>'
        : '<div class="mapcard locked"><span class="mi" style="background:#e8e2d6">☕</span><div><b>山城咖啡館</b><small>蓋好鐘樓或森林總收入 $400,000 後開放</small></div></div>');
    body.querySelectorAll('a.mapcard').forEach((a) => a.addEventListener('click', () => save()));
  } else if (kind === 'set') {
    $('pTitle').textContent = '設定';
    body.innerHTML = '<div class="row"><span class="ricon">🔊</span><div class="rmid"><b>聲音</b></div><button class="buy" id="sSnd">' + (state.sound ? '開' : '關') + '</button></div>' +
      '<div class="row"><span class="ricon">🔄</span><div class="rmid"><b>重新開始</b><small>清除森林小鎮的所有進度</small></div><button class="buy poor" id="sReset">重新開始</button></div>';
    $('sSnd').onclick = () => { state.sound = !state.sound; save(); openPanel('set'); };
    let armed = false;
    $('sReset').onclick = (e) => {
      if (!armed) { armed = true; e.target.textContent = '確定嗎？'; return; }
      // stop every auto-save first, otherwise pagehide would write the old game straight back
      resetting = true; localStorage.removeItem(SAVE); location.replace(location.pathname);
    };
  }
}
$('pClose').onclick = () => $('panel').classList.add('hidden');
$('panel').addEventListener('pointerdown', (e) => { if (e.target === $('panel')) $('panel').classList.add('hidden'); });
$('bUp').onclick = () => openPanel('up');
$('bInv').onclick = () => openPanel('inv');
$('bLog').onclick = () => openPanel('log');
$('bSet').onclick = () => openPanel('set');
$('bMap').onclick = () => openPanel('map');

// ---------- per-frame interactions for the player ----------
function addMoney(v) { state.money += v; state.earned += v; updateMoney(); }
function collectPile(pile, near, dt, onChange) {
  const auto = state.up.autoCash > 0;
  if (pile.value <= 0 || (!auto && !near)) return;
  pile.tick = (pile.tick || 0) - dt;
  if (pile.tick > 0) return;
  pile.tick = near ? 0.04 : 0.25;
  const chunk = Math.max(1, Math.ceil(pile.value / 12));
  pile.value -= chunk; onChange();
  if (!near) addMoney(chunk);
  else fly('money', V3(pile.x, 0.9, pile.z), (o) => { o.copy(player.p.root.position); o.y = 1.6; }, 0.22, () => { addMoney(chunk); sfx('coin'); });
}
function playerInteract(dt) {
  const pp = player.p.root.position;
  for (const s of listOf('crop')) for (const pl of s.plants) if (pl.active && pl.ripe && !pl.res && dist2(pp, pl.x, pl.z) < (s.solid ? 1.4 : 1.0)) pickPlant(s, pl, player);
  // chop the tree next to you; stand by a burning tree to put the fire out
  let chopping = false;
  const lg = stations.logging;   // only once 伐木區 is bought
  if (lg) for (const t of lg.trees) {
    if (!t.on) continue;
    const d = dist2(pp, t.x, t.z);
    if (t.fireT > 0 && d < 1.7) { t.wet += dt; if (!simming && Math.random() < 0.3) puff(t.x, 1.4, t.z, '#9fdcff', 2, 0.6); if (t.wet > 1.2) { t.fireT = 0; t.wet = 0; showTree(t); toast('💧 火撲滅了！'); } continue; }
    if (t.st !== 'alive' || t.res || d > 1.55 || room(player) <= 0 || t.fireT > 0) continue;
    chopping = true; pFace = Math.atan2(t.x - pp.x, t.z - pp.z); chopTick(t, player, dt); break;
  }
  axe.visible = chopping; axe.rotation.x = chopping ? -1.2 + Math.sin(performance.now() / 70) * 0.9 : 0;
  player.xfer2 = (player.xfer2 || 0) - dt;
  for (const s of Object.values(stations)) {
    if (s.kind === 'machine') {
      if (dist2(pp, s.inPt.x, s.inPt.z) < 1.4) for (const t of s.def.ins) if (count(player, t) > 0) { depositTo(player, s, t, dt); break; }
    }
    const ob = srcBin(s);
    if (ob && player.xfer2 <= 0 && dist2(pp, s.outPt.x, s.outPt.z) < (s.kind === 'apiary' ? 1.7 : 1.5) && ob.list.length && room(player) > 0) {
      let t = null;
      for (let i = ob.list.length - 1; i >= 0 && !t; i--) if (usable(ob.list[i])) t = ob.list[i];
      if (!t && ob.list.length >= ob.max * 0.8) t = ob.list[ob.list.length - 1];
      if (t) { player.xfer2 = 0.08; binTake(ob, t); sfx('pop'); takeInto(player, t, V3(s.outPt.x, 0.4, s.outPt.z)); }
    }
    if ((s.kind === 'shelf' || s.kind === 'platform') && dist2(pp, s.front.x, s.front.z - 0.6) < 1.7) for (const t of s.items) if (count(player, t) > 0) { depositTo(player, s, t, dt); break; }
    if (s.kind === 'flume' && dist2(pp, s.depPt.x, s.depPt.z) < 1.1) for (const t of ['pine', 'oak', 'maple']) if (count(player, t) > 0) { depositTo(player, s, t, dt); break; }
    if (s.kind === 'town' && !s.done && dist2(pp, s.pad.x, s.pad.z) < 1.4) for (const t in s.def.need) if (count(player, t) > 0 && siteLeft(s, t) > 0) { siteDeposit(player, s, t, dt); break; }
  }
  if (bakery.on && dist2(pp, bakery.pad.x, bakery.pad.z) < 1.3) for (const t of ['syrup', 'honey']) if (count(player, t) > 0) { depositTo(player, 'bakery', t, dt); break; }
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
  for (const k of COUNTERS) if (k.on) collectPile(k.pile, dist2(pp, k.pile.x, k.pile.z) <= 1.6, dt, () => setPile(k.pile));
  if (bakery.pile) collectPile(bakery.pile, dist2(pp, bakery.pile.x, bakery.pile.z) <= 1.6, dt, () => setPile(bakery.pile));
}

// ---------- simulation ----------
function craftOut(s, used) {
  const d = s.def;
  if (d.mk === 'sawmill') { const out = []; for (const t of used) { out.push('plank'); if (t !== 'pine') out.push('plank'); if (Math.random() < 0.5) out.push('sawdust'); } return out; }
  if (d.mk === 'shroom') return Math.random() < 0.06 ? ['shiitake', 'truffle'] : ['shiitake', 'shiitake'];
  if (d.mk === 'bench') return [Math.random() < upVal('luck') ? d.out + '_r' : d.out];
  return [d.out];
}
function updateMachine(s, dt, T) {
  const d = s.def, iv = d.iv / upVal('mach') / (d.mk === 'bench' && carpenterAt(s) ? 1.6 : 1);
  const need = d.need || 1, outN = d.mk === 'sawmill' ? 3 : d.mk === 'shroom' ? 2 : 1;
  const busy = s.inBin.list.length >= need && binRoom(s.outBin) >= outN;
  if (busy) {
    s.timer += dt;
    if (s.timer >= iv) {
      s.timer = 0;
      const used = []; for (let i = 0; i < need; i++) used.push(binTake(s.inBin));
      for (const t of craftOut(s, used)) { binAdd(s.outBin, t); made(t, s.outPt); }
      if (d.mk === 'bench') stats.made[d.out] = (stats.made[d.out] || 0) + 1;
      if (!simming) puff(s.outPt.x, 0.5, s.outPt.z, d.mk === 'sawmill' ? '#efc48a' : '#fff4c9', 3, 0.4);
    }
  }
  const ax = s.spin.userData.axis, sp = s.spin;
  if (ax === 'z') sp.rotation.z += dt * (busy ? 9 : 0);
  else if (ax === 'x') sp.rotation.x += dt * (busy ? 9 : 0);
  else if (ax === 'z2') sp.rotation.z += dt * (busy ? 4 : 0);
  else if (ax === 'dip') { sp.userData.y0 = sp.userData.y0 ?? sp.position.y; sp.position.y = sp.userData.y0 + (busy ? Math.abs(Math.sin(T * 4)) * 0.12 : 0); }
  else if (ax === 'saw') sp.position.x = 0.2 + (busy ? Math.sin(T * 12) * 0.18 : 0);
  else if (ax === 'steam') { sp.visible = busy; sp.position.y = 1.75 + (T * 0.6) % 0.3; }
  if (s.wheel) s.wheel.rotation.x -= dt * 1.2;
  binRender(s.inBin); binRender(s.outBin);
  setLabel(s.inLabel, binLabel(s.inBin)); setLabel(s.outLabel, binLabel(s.outBin));
}
function updateFlume(s, dt) {
  const sp = upVal('flume'), pts = FLUME.path, mill = stations.sawmill;
  let ahead = 1e9;
  for (let i = s.queue.length - 1; i >= 0; i--) {
    const q = s.queue[i];
    q.d = Math.min(q.d + sp * dt, s.len, ahead - 0.7);
    ahead = q.d;
    if (!simming) {
      if (!q.m) { q.m = itemMesh(q.t); q.m.scale.setScalar(0.9); scene.add(q.m); }
      let d = q.d, k = 0;
      while (k < pts.length - 2 && d > Math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1])) { d -= Math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]); k++; }
      const [ax, az] = pts[k], [bx, bz] = pts[k + 1], L = Math.hypot(bx - ax, bz - az), f = Math.min(1, d / L);
      q.m.position.set(ax + (bx - ax) * f, 1.55 + Math.sin(performance.now() / 200 + i) * 0.03, az + (bz - az) * f);
      q.m.rotation.y = -Math.atan2(bz - az, bx - ax);
    }
  }
  // the log at the end drops into the sawmill's tray
  const first = s.queue[0];
  if (first && first.d >= s.len - 0.01 && mill && machSpace(mill) > 0) {
    s.queue.shift(); if (first.m) scene.remove(first.m);
    mill.pend = (mill.pend || 0) + 1;
    fly(first.t, V3(pts[pts.length - 1][0], 1.5, pts[pts.length - 1][1]), (o) => o.copy(mill.inPt).setY(0.4), 0.35, () => { mill.pend--; binAdd(mill.inBin, first.t); });
  }
  setLabel(s.label, '放原木 ' + s.queue.length + '/16');
}
function updateApiary(s, dt, T) {
  const iv = upVal('bee');
  s.hives.forEach((h, i) => {
    if (!h.on) return;
    h.t += dt;
    if (!simming) { h.bees.rotation.y += dt * 2; h.bees.position.y = 1.3 + Math.sin(T * 3 + i) * 0.1; }
    if (h.t >= iv && binRoom(s.outBin) > 0) {
      h.t = 0; s.outBin.pend = (s.outBin.pend || 0) + 1;
      const t = Math.random() < 0.7 ? 'honey' : 'wax';
      fly(t, V3(h.x, 1.2, h.z), (o) => o.set(s.outPt.x, 0.45, s.outPt.z), 0.6, () => { s.outBin.pend--; binAdd(s.outBin, t); });
    }
  });
  binRender(s.outBin); setLabel(s.outLabel, binLabel(s.outBin));
}
function updateWorld(dt, T) {
  const cap = upVal('shelfCap');
  updateTrees(dt, T);
  for (const s of Object.values(stations)) {
    if (s.kind === 'machine') updateMachine(s, dt, T);
    else if (s.kind === 'flume') updateFlume(s, dt);
    else if (s.kind === 'apiary') updateApiary(s, dt, T);
    else if (s.kind === 'crop') {
      const k = s.def.plant === 'mush' ? upVal('mush') : upVal('sap');
      for (const pl of s.plants) if (pl.active && !pl.ripe) {
        pl.t += dt * k;
        pl.fruit.visible = pl.t > s.grow * 0.35;
        pl.fruit.scale.setScalar(Math.min(1, pl.t / s.grow));
        if (pl.t >= s.grow) { pl.ripe = true; pl.fruit.scale.setScalar(1); pops.push({ obj: pl.fruit, t: 0.5 }); }
      }
    } else if (s.kind === 'shelf' || s.kind === 'platform') {
      const max = s.kind === 'platform' ? 12 : cap;
      while (s.bin.list.length > max) binTake(s.bin);
      binRender(s.bin);
      const cnt = {}; for (const t of s.bin.list) cnt[t] = (cnt[t] || 0) + 1;
      const shown = s.items.filter((t) => cnt[t]);
      setLabel(s.label, (shown.length ? shown : s.items.slice(0, 1)).map((t) => '<span>' + ICON[t] + (cnt[t] || 0) + '</span>').join('') + '<span class="tot">' + s.bin.list.length + '/' + max + '</span>');
    }
  }
  // the chute between sawmill and planer moves planks on its own
  const mill = stations.sawmill, pl = stations.planer;
  if (mill && pl) {
    pl.chuteT = (pl.chuteT || 0) - dt;
    if (pl.chuteT <= 0 && binCount(mill.outBin, 'plank') && machSpace(pl) > 0) {
      pl.chuteT = 0.5; binTake(mill.outBin, 'plank'); pl.pend = (pl.pend || 0) + 1;
      fly('plank', V3(mill.outPt.x, 0.6, mill.outPt.z), (o) => o.copy(pl.inPt).setY(0.45), 0.6, () => { pl.pend--; binAdd(pl.inBin, 'plank'); });
    }
  }
  // bakery sells your syrup and honey by itself
  if (bakery.on) {
    bakery.t += dt;
    if (bakery.t > 3 && bakery.bin.list.length) { bakery.t = 0; const t = binTake(bakery.bin); const v = Math.round(ITEMS[t].price * 1.5 * priceMult()); bakery.pile.value += v; setPile(bakery.pile); stats.bakery++; floatText('+' + v, V3(bakery.pile.x, 1.4, bakery.pile.z), 'money'); }
    setLabel(bakery.label, '🥐 ' + binLabel(bakery.bin));
  }
  // the delivery truck drives off when it is loaded and comes back
  if (courierTruck.on) {
    const tr = courierTruck;
    if (tr.st === 'park' && tr.load >= 4) { tr.st = 'go'; tr.load = 0; }
    if (tr.st === 'go') { tr.g.position.x -= 9 * dt; if (tr.g.position.x < -34) { tr.st = 'back'; tr.t = 4; } }
    if (tr.st === 'back') { tr.t -= dt; if (tr.t <= 0) { tr.g.position.x = Math.min(-18.6, tr.g.position.x + 9 * dt); if (tr.g.position.x >= -18.6) tr.st = 'park'; } }
    tr.g.position.z = -2.7 - Math.min(1, Math.max(0, (-18.6 - tr.g.position.x) / 3)) * 2.2;   // pull out of the lay-by onto the road
  }
}
function updateScenery(dt, T) {
  for (const r of ripples) { r.m.position.z += dt * 1.2; if (r.m.position.z > 34) r.m.position.z -= 54; r.m.material.opacity = 0.35 + Math.sin(T * 2 + r.z0) * 0.15; }
  for (const a of animals) {
    a.t -= dt;
    if (a.t <= 0) { a.t = 2 + Math.random() * 4; a.tx = a.home[0] + rand(-2.5, 2.5); a.tz = a.home[1] + rand(-2.5, 2.5); }
    const p = a.g.position, dx = a.tx - p.x, dz = a.tz - p.z, d = Math.hypot(dx, dz);
    if (d > 0.05) { const st = Math.min(d, (a.kind === 'deer' ? 0.9 : 1.6) * dt); p.x += dx / d * st; p.z += dz / d * st; a.g.rotation.y = Math.atan2(dx, dz); a.b.position.y = Math.abs(Math.sin(T * (a.kind === 'deer' ? 7 : 14))) * (a.kind === 'deer' ? 0.05 : 0.08); }
    else a.b.position.y = 0;
    if (a.tail) a.tail.rotation.x = -0.5 + Math.sin(T * 3) * 0.2;
  }
}

function movePlayer(dt) {
  const j = joy.read();
  const sp = upVal('speed');
  pVel.x += (j.x * sp - pVel.x) * Math.min(1, dt * 14); pVel.z += (j.y * sp - pVel.z) * Math.min(1, dt * 14);
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
  pos.x = Math.max(-25.2, Math.min(30.5, pos.x)); pos.z = Math.max(-17.0, Math.min(30.4, pos.z));
  pos.y = floorY(pos.x, pos.z);
  const spd = Math.hypot(pVel.x, pVel.z);
  if (spd > 0.3) pFace = Math.atan2(pVel.x, pVel.z);
  turn(player.p, pFace, dt);
  player.p.anim(dt, Math.min(1, spd / 4));
  player.p.back.rotation.x = -Math.min(0.12, spd * 0.015);
  swayStack(player, spd, dt);
}

function someoneNear(x, z, r) {
  if (dist2(player.p.root.position, x, z) < r) return true;
  for (const c of customers) if (dist2(c.p.root.position, x, z) < r) return true;
  for (const w of workers) if (dist2(w.p.root.position, x, z) < r) return true;
  return false;
}
function updateDoorsAndLights(dt) {
  const ease = Math.min(1, dt * 7);
  for (const d of doors) { d.k += ((someoneNear(d.x, d.z, 2.3) ? 1 : 0) - d.k) * ease; d.d.open(d.k); }
  const wh = stations.warehouse;
  if (wh) { wh.k += ((someoneNear(wh.def.pos[0], wh.def.pos[1] + 2.4, 2.8) ? 1 : 0) - wh.k) * ease; wh.door.position.y = wh.k * 1.85; }
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
const pets = {};
buildWorld();
createWoods();
for (const def of DEFS) if (isBuilt(def.id)) build(def, true);
for (const role in state.extra) if (HIRE[role] && roleOpen(role)) for (let i = 0; i < Math.min(HIRE_MAX, state.extra[role]); i++) makeWorker(role, HOME[role], false);
refreshZones();
resize(); updateCamera(0, true); updateMoney(); showLogDot();

let last = performance.now(), saveT = 0, T = 0, gateT = 0;
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
  for (const w of workers) { updateWorker(w, dt); turn(w.p, w.face, dt); w.p.anim(dt, w.moving); swayStack(w, w.moving ? upVal('wspeed') : 0, dt); w.p.root.position.y = floorY(w.p.root.position.x, w.p.root.position.z); }
  updateCustomers(dt);
  updateTrain(dt);
  updateEvents(dt);
  updateScenery(dt, T);
  if (pets.squirrel) pets.squirrel.tail.rotation.x = -0.5 + Math.sin(T * 3) * 0.25;
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
  gateT -= dt; if (gateT <= 0) { gateT = 2; if (!zones.cafeGate && !isBuilt('cafeGate') && cafeGateOpen()) refreshZones(); }
  updateGuide(T);
  updateDoorsAndLights(dt);
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('on'); }
}
requestAnimationFrame(frame);
addEventListener('visibilitychange', () => { if (document.hidden) save(); });
addEventListener('pagehide', save);

// test hooks
window.__forest = {
  state, stations, player, zones, customers, workers, events, DEFS, COUNTERS, stats, colliders, train, bakery,
  give(type, n) { for (let i = 0; i < n && room(player) > 0; i++) stackAdd(player, type); },
  cash(n) { state.money += n; updateMoney(); },
  tp(x, z) { player.p.root.position.set(x, 0, z); updateCamera(0, true); },
  build(id) { if (zones[id]) killZone(id); if (!stations[id]) build(DEF[id]); },
  finishSites() { for (const s of listOf('town')) if (!s.done) { for (const t in s.def.need) s.got[t] = s.def.need[t]; finishSite(s, true); } },
  sim(sec, quiet = true) { simming = quiet; try { for (let i = 0; i < sec * 30; i++) step(1 / 30); } finally { simming = false; } },
  simCheck(sec) {
    const r = { frames: 0, samples: 0, intrusions: 0, examples: [] };
    simming = true;
    try {
      for (let i = 0; i < sec * 30; i++) {
        step(1 / 30); r.frames++;
        const who = [...workers.map((w) => ['worker:' + w.role, w.p.root.position]), ...customers.map((c) => ['customer', c.p.root.position])];
        for (const [k, pos] of who) { r.samples++; const b = insideBox(pos.x, pos.z); if (b) { r.intrusions++; if (r.examples.length < 8) r.examples.push(k + ' ' + pos.x.toFixed(2) + ',' + pos.z.toFixed(2) + ' in [' + [b.x0, b.z0, b.x1, b.z1].map((v) => v.toFixed(2)).join(',') + ']'); } }
      }
    } finally { simming = false; }
    return r;
  },
  hire: (role) => hireExtra(role),
  open: (k) => openPanel(k),
  calls: () => renderer.info.render.calls,
  guideIds: () => guideTargets().ids,
  guideInfo: () => { const g = guideTargets(); return g.ids.join('+') + (g.two ? ' (二選一)' : ''); },
  firstSource: () => { const lg = stations.logging; if (lg) { const t = lg.trees.find((q) => q.on && q.st === 'alive'); return [t.x + 1.0, t.z]; } const m = stations.mushrooms; return [m.plants[0].x, m.plants[0].z + 0.3]; },
  fire() { events.next = 0; },
  lineup(x, z, list) { (list || Object.keys(ITEMS)).forEach((t, i) => { const m = itemMesh(t); m.scale.setScalar(2); m.position.set(x + (i % 6) * 1.3, 0, z + Math.floor(i / 6) * 1.4); scene.add(m); }); },
};
