// 海邊漁港 — map 2 of 開心農場鋪. A whole fishing industry: boats, anglers, trawlers, traps, deep-sea boats and
// fish farms bring many species; process them, sell them in the fish market and serve them in a seafood restaurant.
// Same style kit, controls and UI as the farm (logic adapted from main.js).
import * as THREE from 'three';
import * as K from './kit.js';
import * as P from './props.js';
import * as P2 from './props2.js';
import * as P3 from './props3.js';
import * as P4 from './props4.js';
import { Joystick } from './input.js';
import { createNav } from './nav.js';

const { C, G } = K;
const ITEMS = { ...P3.ITEMS, ...P4.ITEMS4 };
const itemMesh = P4.itemMesh;
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
// The harbour is a branch of the farm, not a separate game: it only opens after 開分店 is bought on the farm
// (the farm writes {harbor: true} to 'farm_maps_v1'). ?test / ?fresh skip this for testing.
{
  let open = false;
  try { open = JSON.parse(localStorage.getItem('farm_maps_v1') || '{}').harbor === true; } catch (e) { /* storage off */ }
  if (!open && !params.has('test') && !params.has('fresh')) { location.replace('index.html'); throw new Error('harbour not unlocked yet: back to the farm'); }
}
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const dist2 = (a, x, z) => Math.hypot(a.x - x, a.z - z);
const easeBack = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------- instanced piles ----------
// A pile of one item (machine tray, cash pile, sink): all copies are one instanced mesh per material. set(n) shows n.
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _sc = new THREE.Vector3();
function slotMatrix(sl, extra = 1) { _e.set(sl.rx || 0, sl.ry || 0, 0); _q.setFromEuler(_e); _sc.setScalar((sl.s || 1) * extra); return new THREE.Matrix4().compose(sl.p, _q, _sc); }
function templateParts(type, noOutline) {
  const tpl = itemMesh(type), parts = [];
  tpl.updateMatrixWorld(true);
  tpl.traverse((o) => { if (o.isMesh && !(noOutline && o.material.side === THREE.BackSide)) parts.push(o); });
  return parts;
}
// bounding sphere around every slot, so piles that are off screen are skipped by frustum culling
function slotSphere(slots) {
  const c = new THREE.Vector3(); for (const sl of slots) c.add(sl.p); c.divideScalar(slots.length);
  let r = 0; for (const sl of slots) r = Math.max(r, c.distanceTo(sl.p));
  return new THREE.Sphere(c, r + 0.8);
}
function instGroup(parent, parts, n, slots) {
  const g = new THREE.Group(); g.userData.dyn = true; parent.add(g);
  const sphere = slotSphere(slots);
  const ims = parts.map((o) => {
    const im = new THREE.InstancedMesh(o.geometry, o.material, n);
    im.castShadow = false; im.receiveShadow = o.receiveShadow; im.count = 0; im.visible = false;
    im.boundingSphere = sphere.clone(); im.frustumCulled = true; g.add(im);
    return im;
  });
  return ims;
}
function itemStack(type, parent, slots) {
  const parts = templateParts(type), ims = instGroup(parent, parts, slots.length, slots);
  slots.forEach((sl, i) => { const m = slotMatrix(sl, ITEMS[type].ss || 1); ims.forEach((im, k) => im.setMatrixAt(i, _m4.multiplyMatrices(m, parts[k].matrixWorld))); });
  return { n: 0, max: slots.length, set(n) { n = Math.max(0, Math.min(this.max, n)); if (n !== this.n) { this.n = n; for (const im of ims) { im.count = n; im.visible = n > 0; } } } };
}
// A mixed pile (catch crates, fish-market coolers): an ordered list of item types. Each species present gets its own
// instanced mesh; same species sit next to each other, so the pile reads at a glance and costs 2 draws per species.
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
const crateSlots = () => { const s = []; for (let i = 0; i < 30; i++) s.push({ p: V3(-0.48 + (i % 5) * 0.24, 0.31 + Math.floor(i / 10) * 0.11, -0.2 + (Math.floor(i / 5) % 2) * 0.4), ry: Math.PI / 2 + ((i * 0.7) % 0.5) - 0.25, s: 0.85 }); return s; };

// ---------- layout ----------
const SH_Z = -14.6, MID_Z = -11.2;
const SHOP = { x0: -9.4, x1: 7.95, z0: -17.4, z1: -7.3 };
const R0 = -23.6, WING_X0 = -40;
const REST = { x0: R0, x1: -11.2, z0: -18, z1: -6 };
const T_POS = [[-14.8, -8.7], [-18.0, -8.7], [-21.2, -8.7], [-14.8, -12.1], [-18.0, -12.1], [-21.2, -12.1], [-24.4, -8.7], [-27.6, -8.7], [-24.4, -12.1], [-27.6, -12.1]];
const SINK = { x: -12.4, z: -15.8 };
const SPAWN = [11.2, -1.8];   // shoppers arrive along the shore boardwalk, right by the market
const D_SPAWN = [-12.4, 12.5];   // diners walk up the plank path from the west beach
const CRUISE = { x: 9.2, z: 32.5, dockX: 16.3 };
const LIGHT = { x: 21.5, z: -15.0 };
const CRATE_X = 12.4, PIER_X = 13.1;
const ANGLER_Z = -3.2, TRAP_Z = -8.6, AQUA_Z = 22.4;
const KITCHEN_Z = -15.6;

// ---------- species, rarity and where each one is caught ----------
const SPECIES = ['fish', 'sardine', 'mackerel', 'puffer', 'shrimp', 'crab', 'squid', 'octopus', 'salmon', 'tuna', 'swordfish', 'lobster', 'golden'];
const isRaw = (t) => SPECIES.includes(t);
const RARITY = { fish: 0, sardine: 0, mackerel: 0, shrimp: 0, crab: 1, squid: 1, octopus: 2, salmon: 1, puffer: 2, tuna: 2, swordfish: 3, lobster: 3, golden: 4 };
const RAR_NAME = ['普通', '少見', '稀有', '珍稀', '傳說'];
const LOG_PAGES = [
  { name: '近海魚', ids: ['fish', 'sardine', 'mackerel', 'puffer'], reward: 500 },
  { name: '蝦蟹頭足', ids: ['shrimp', 'crab', 'squid', 'octopus'], reward: 2500 },
  { name: '大洋珍品', ids: ['salmon', 'tuna', 'swordfish', 'lobster', 'golden'], reward: 12000 },
];
const CATCH = {
  boat: { fish: 70, mackerel: 22, squid: 8 },
  trawl: { sardine: 62, shrimp: 30, squid: 6, octopus: 2 },
  deep: { tuna: 34, salmon: 30, mackerel: 28, swordfish: 8 },
  angler: { sardine: 22, fish: 22, mackerel: 18, squid: 12, salmon: 9, puffer: 6, octopus: 5, tuna: 3, swordfish: 1.6, lobster: 1.0, golden: 0.4 },
  crab: { crab: 60, shrimp: 22, octopus: 12, lobster: 6 },
  lobster: { lobster: 45, crab: 40, octopus: 15 },
};
function roll(table, luck = 1) {
  let sum = 0; const w = {};
  for (const t in table) { w[t] = table[t] * (RARITY[t] >= 2 ? luck : 1); sum += w[t]; }
  let r = Math.random() * sum;
  for (const t in w) { r -= w[t]; if (r <= 0) return t; }
  return Object.keys(table)[0];
}
const DISHES = ['grilled', 'sushi', 'otoro', 'tempura', 'squidgrill', 'lobstermeal'];
const DISH_W = { grilled: 3, sushi: 3, otoro: 1.4, tempura: 3, squidgrill: 3, lobstermeal: 0.9 };

// ---------- the unlock chain ----------
const kz = (x) => [x, KITCHEN_Z];
const DEFS = [
  { id: 'pier1', name: '釣魚碼頭', kind: 'pier', boat: 'boat', pz: 2, zone: [10.0, 2], cost: { money: 40 }, req: [], start: true },
  { id: 'seaweed', name: '海帶田', kind: 'crop', out: 'seaweed', plant: 'seaweed', grow: 6, pos: [6.6, 1.8], cost: { money: 30 }, req: [], start: true },
  { id: 'shelfFish', name: '鮮魚冷藏櫃', kind: 'shelf', fridge: true, items: ['fish', 'sardine', 'mackerel', 'squid'], pos: [4.4, SH_Z], cost: { money: 10 }, req: ['pier1', 'counter'] },
  { id: 'shelfSeaweed', name: '海帶架', kind: 'shelf', items: ['seaweed'], pos: [1.4, SH_Z], cost: { money: 15 }, req: ['seaweed', 'counter'] },
  { id: 'counter', name: '收銀台', kind: 'counter', zone: [4.6, -8.7], cost: { money: 0 }, any: ['pier1', 'seaweed'] },
  { id: 'cashier', name: '收銀員', kind: 'hire', role: 'cashier', zone: [6.6, -12.6], cost: { money: 80 }, req: ['counter'], any: ['shelfFish', 'shelfSeaweed'] },
  { id: 'iceMaker', name: '製冰機', kind: 'machine', mk: 'ice', in: 'fish', out: 'iced', iv: 3, pos: [8.2, 7.6], cost: { money: 200, fish: 6 }, req: ['cashier', 'pier1'] },
  { id: 'shelfIced', name: '冷藏鮮魚櫃', kind: 'shelf', fridge: true, items: ['iced'], pos: [-1.6, SH_Z], cost: { money: 160 }, req: ['iceMaker'] },
  { id: 'fisher', name: '漁夫', kind: 'hire', role: 'fisher', zone: [10.0, -1.0], cost: { money: 180 }, req: ['shelfIced'] },
  { id: 'cat', name: '小貓', kind: 'pet', zone: [2.6, -11.6], cost: { money: 260, fish: 10 }, req: ['fisher'] },
  { id: 'anglerPier', name: '釣魚棧橋', kind: 'angler', zone: [10.0, -2.0], cost: { money: 450 }, req: ['cat'] },
  { id: 'shelver', name: '理貨員', kind: 'hire', role: 'shelver', zone: [1.6, -5.8], cost: { money: 320 }, req: ['anglerPier'] },
  { id: 'warehouse', name: '倉庫', kind: 'store', pos: [11.2, -14.4], zone: [11.2, -10.6], cost: { money: 450 }, req: ['shelver'] },
  { id: 'shelfPremium', name: '高級魚冷藏櫃', kind: 'shelf', fridge: true, items: ['salmon', 'tuna', 'swordfish', 'puffer', 'golden'], pos: [-1.6, MID_Z], cost: { money: 550 }, req: ['warehouse'] },
  { id: 'cannery', name: '罐頭工廠', kind: 'machine', mk: 'can', in: 'fish', out: 'can', iv: 4, pos: [2.0, 7.6], cost: { money: 650, fish: 15 }, req: ['shelfPremium'] },
  { id: 'shelfCan', name: '罐頭架', kind: 'shelf', items: ['can', 'crabcan'], pos: [-4.6, SH_Z], cost: { money: 480 }, req: ['cannery'] },
  { id: 'restaurant', name: '海鮮餐廳', kind: 'restaurant', zone: [-12.4, -4.0], cost: { money: 1200, seaweed: 15 }, req: ['shelfCan'] },
  { id: 'grill', name: '烤魚爐', kind: 'machine', mk: 'grill', in: 'fish', out: 'grilled', iv: 3.5, pos: kz(-20.8), cost: { money: 700, fish: 12 }, req: ['restaurant'] },
  { id: 'waiter', name: '服務生', kind: 'hire', role: 'waiter', zone: [-13.2, -10.4], cost: { money: 850 }, req: ['grill'] },
  { id: 'table2', name: '第 2 張餐桌', kind: 'table', ti: 1, cost: { money: 600 }, req: ['waiter'] },
  { id: 'pier2', name: '拖網漁船碼頭', kind: 'pier', boat: 'trawl', pz: 10, zone: [10.0, 10], cost: { money: 1600 }, req: ['table2'] },
  { id: 'shelfShell', name: '蝦蟹冷藏櫃', kind: 'shelf', fridge: true, items: ['shrimp', 'crab', 'octopus', 'lobster'], pos: [-4.6, MID_Z], cost: { money: 900 }, req: ['pier2'] },
  { id: 'dryRack', name: '曬魚架', kind: 'machine', mk: 'dry', in: 'sardine', out: 'dried', iv: 4, pos: [-4.4, 7.6], cost: { money: 1400, sardine: 15 }, req: ['shelfShell'] },
  { id: 'shelfDried', name: '魚乾架', kind: 'shelf', items: ['dried'], pos: [-7.6, SH_Z], cost: { money: 1100 }, req: ['dryRack'] },
  { id: 'paddy', name: '稻田', kind: 'crop', out: 'rice', plant: 'rice', grow: 7, pos: [-15.4, 1.8], cost: { money: 1300 }, req: ['shelfDried'] },
  { id: 'sushiBar', name: '壽司吧', kind: 'machine', mk: 'sushi', in: 'fish', in2: 'rice', out: 'sushi', iv: 3.5, pos: kz(-15.2), cost: { money: 2200, seaweed: 20 }, req: ['paddy'] },
  { id: 'table3', name: '第 3 張餐桌', kind: 'table', ti: 2, cost: { money: 1500 }, req: ['sushiBar'] },
  { id: 'washer', name: '洗碗工', kind: 'hire', role: 'washer', zone: [-13.2, -13.0], cost: { money: 1900 }, req: ['table3'] },
  { id: 'shelver2', name: '理貨員', kind: 'hire', role: 'shelver', zone: [-2.4, -5.8], cost: { money: 2400 }, req: ['washer'] },
  { id: 'traps', name: '蟹籠', kind: 'traps', zone: [10.4, TRAP_Z], cost: { money: 2800 }, req: ['shelver2'] },
  { id: 'crabCannery', name: '蟹肉罐頭廠', kind: 'machine', mk: 'crabcan', in: 'crab', out: 'crabcan', iv: 4, pos: [-4.4, 12.8], cost: { money: 3200, crab: 8 }, req: ['traps'] },
  { id: 'table4', name: '第 4 張餐桌', kind: 'table', ti: 3, cost: { money: 3200 }, req: ['crabCannery'] },
  { id: 'waiter2', name: '服務生', kind: 'hire', role: 'waiter', zone: [-22.5, -10.4], cost: { money: 3600 }, req: ['table4'] },
  { id: 'cruise', name: '郵輪碼頭', kind: 'cruise', zone: [CRUISE.x, CRUISE.z], cost: { money: 6500 }, req: ['waiter2'] },
  { id: 'fisher2', name: '漁夫', kind: 'hire', role: 'fisher', zone: [7.6, 11.8], cost: { money: 4500 }, req: ['cruise'] },
  { id: 'restWing', name: '餐廳擴建', kind: 'wing', zone: [-30, -4.2], cost: { money: 7000 }, req: ['fisher2'] },
  { id: 'fryer', name: '炸蝦鍋', kind: 'machine', mk: 'fryer', in: 'shrimp', out: 'tempura', iv: 3, pos: kz(-29.7), cost: { money: 4200, shrimp: 15 }, req: ['restWing'] },
  { id: 'table5', name: '第 5 張餐桌', kind: 'table', ti: 4, cost: { money: 5500 }, req: ['fryer'] },
  { id: 'squidGrill', name: '烤魷魚架', kind: 'machine', mk: 'squid', in: 'squid', out: 'squidgrill', iv: 3.5, pos: kz(-33.8), cost: { money: 5200, squid: 10 }, req: ['table5'] },
  { id: 'pier3', name: '深海漁船碼頭', kind: 'pier', boat: 'deep', pz: 17, zone: [10.0, 17], cost: { money: 9000 }, req: ['squidGrill'] },
  { id: 'tunaBar', name: '鮪魚壽司台', kind: 'machine', mk: 'tuna', in: 'tuna', out: 'otoro', iv: 4, pos: kz(-25.6), cost: { money: 9500 }, req: ['pier3'] },
  { id: 'sashimiBar', name: '生魚片台', kind: 'machine', mk: 'sashimi', in: 'salmon', out: 'sashimi', iv: 3.5, pos: [2.0, 12.8], cost: { money: 8000, salmon: 10 }, req: ['tunaBar'] },
  { id: 'shelfSashimi', name: '生魚片冷藏櫃', kind: 'shelf', fridge: true, items: ['sashimi'], pos: [-7.6, MID_Z], cost: { money: 6000 }, req: ['sashimiBar'] },
  { id: 'table6', name: '第 6 張餐桌', kind: 'table', ti: 5, cost: { money: 8500 }, req: ['shelfSashimi'] },
  { id: 'aqua', name: '養殖場', kind: 'aqua', zone: [10.0, AQUA_Z], cost: { money: 12000 }, req: ['table6'] },
  { id: 'waiter3', name: '服務生', kind: 'hire', role: 'waiter', zone: [-26.0, -10.4], cost: { money: 9000 }, req: ['aqua'] },
  { id: 'table8', name: '第 8 張餐桌', kind: 'table', ti: 7, cost: { money: 10000 }, req: ['waiter3'] },
  { id: 'lobsterTraps', name: '龍蝦籠', kind: 'lobtraps', zone: [12.0, -6.9], cost: { money: 15000 }, req: ['table8'] },
  { id: 'lobsterPot', name: '龍蝦鍋', kind: 'machine', mk: 'lobster', in: 'lobster', out: 'lobstermeal', iv: 6, pos: kz(-37.9), cost: { money: 18000, lobster: 4 }, req: ['lobsterTraps'] },
  { id: 'table9', name: '第 9 張餐桌', kind: 'table', ti: 8, cost: { money: 12000 }, req: ['lobsterPot'] },
  { id: 'shelver3', name: '理貨員', kind: 'hire', role: 'shelver', zone: [-6.4, -5.8], cost: { money: 12000 }, req: ['table9'] },
  { id: 'fisher3', name: '漁夫', kind: 'hire', role: 'fisher', zone: [9.6, 16.0], cost: { money: 14000 }, req: ['shelver3'] },
  { id: 'table10', name: '第 10 張餐桌', kind: 'table', ti: 9, cost: { money: 16000 }, req: ['fisher3'] },
  { id: 'washer2', name: '洗碗工', kind: 'hire', role: 'washer', zone: [-13.2, -13.0], cost: { money: 15000 }, req: ['table10'] },
  { id: 'lighthouse', name: '點亮燈塔', kind: 'lighthouse', note: '所有漁船出海更快了', zone: [8.9, -8.2], cost: { money: 25000 }, req: ['washer2'] },
  { id: 'aquarium', name: '水族館', kind: 'aquarium', note: '遊客變多了', pos: [-4, 20.5], zone: [-4, 16.6], cost: { money: 60000 }, req: ['lighthouse'] },
  { id: 'forestGate', name: '開分店：森林小鎮', kind: 'mapgate', zone: [8.9, -8.2], cost: { money: 120000 }, req: ['lighthouse'], earned: 150000 },
];
for (const d of DEFS) if (d.kind === 'table') d.pos = T_POS[d.ti];
const DEF = Object.fromEntries(DEFS.map((d) => [d.id, d]));

const lv = (n, base, k) => Array.from({ length: n }, (_, i) => Math.round(base * Math.pow(k, i) / 10) * 10);
const UPS = {
  cap: { tab: 0, name: '背包容量', ic: 'fish', vals: [6, 10, 14, 18, 24, 30, 36, 44, 52], cost: [30, 80, 150, 260, 420, 700, 1100, 1700], fmt: (v) => v + ' 個' },
  speed: { tab: 0, name: '移動速度', ic: 'run', vals: [5.8, 6.4, 7, 7.6, 8.2, 8.8, 9.4], cost: [40, 100, 200, 380, 650, 1000], fmt: (v) => v.toFixed(1) },
  wcap: { tab: 1, name: '員工一次拿多少', ic: 'can', vals: [4, 6, 8, 11, 15, 20, 26], cost: [100, 220, 450, 800, 1400, 2400], fmt: (v) => v + ' 個' },
  wspeed: { tab: 1, name: '員工速度', ic: 'run', vals: [4, 4.6, 5.2, 5.8, 6.4, 7, 7.6], cost: [100, 220, 450, 800, 1400, 2400], fmt: (v) => v.toFixed(1) },
  boat: { tab: 2, name: '漁船出海時間', ic: 'boat', need: 'pier1', vals: [12, 10.5, 9, 7.5, 6.5, 5.5], cost: [80, 220, 500, 1000, 1900], fmt: (v) => v + ' 秒' },
  catch: { tab: 2, name: '每趟漁獲', ic: 'fish', need: 'pier1', vals: [3, 4, 5, 6, 7, 8], cost: [120, 320, 750, 1500, 2800], fmt: (v) => v + ' 份' },
  angler: { tab: 2, name: '釣魚員速度', ic: 'mackerel', need: 'anglerPier', vals: [9, 7.5, 6.2, 5, 4, 3.2], cost: [300, 700, 1400, 2600, 4500], fmt: (v) => v + ' 秒釣一次' },
  luck: { tab: 2, name: '幸運魚餌', ic: 'golden', need: 'anglerPier', vals: [1, 1.3, 1.7, 2.2, 3], cost: [500, 1200, 2500, 5000], fmt: (v) => '稀有魚 ×' + v },
  trap: { tab: 2, name: '收籠時間', ic: 'crab', need: 'traps', vals: [16, 13, 10.5, 8.5, 7], cost: [600, 1400, 2800, 5000], fmt: (v) => v + ' 秒' },
  aquaT: { tab: 2, name: '養殖速度', ic: 'salmon', need: 'aqua', vals: [12, 10, 8.5, 7, 6], cost: [2000, 4000, 7000, 11000], fmt: (v) => v + ' 秒收成一次' },
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
  pier2: { start: 1, max: 3, cost: [1800, 3500], what: '＋1 艘拖網漁船' },
  pier3: { start: 1, max: 3, cost: [9000, 15000], what: '＋1 艘深海漁船' },
  anglerPier: { start: 1, max: 5, cost: [250, 700, 1500, 3000], what: '＋1 位釣魚員' },
  traps: { start: 2, max: 5, cost: [2000, 3500, 6000], what: '＋1 個蟹籠' },
  aqua: { start: 2, max: 4, cost: [6000, 10000], what: '＋1 座箱網' },
  seaweed: { start: 3, max: 6, cost: [25, 60, 120], what: '＋1 株海帶' },
  paddy: { start: 4, max: 8, cost: [700, 1000, 1400, 1900], what: '＋1 叢稻子' },
};
const lvlOf = (id) => state.lvl[id] || GROW[id].start;

// ---------- save ----------
const SAVE = 'harbor_save_v1';
let resetting = false;
const blank = () => ({ questSeen: false, money: 50, built: [], paid: {}, up: {}, stock: {}, store: {}, lvl: {}, piles: [0], tpiles: {}, earned: 0, log: {}, logPaid: {}, logNew: false, extra: {} });
const state = Object.assign(blank(), { sound: true });
try { Object.assign(state, JSON.parse(localStorage.getItem(SAVE) || '{}')); } catch (e) { /* fresh start */ }
if (params.has('fresh')) Object.assign(state, blank());
for (const k of ['store', 'lvl', 'tpiles', 'stock', 'paid', 'up', 'log', 'logPaid', 'extra']) state[k] = state[k] || {};
for (const k in UPS) state.up[k] = state.up[k] || 0;
if (state.built.length && !state.built.includes('counter')) state.built.splice(Math.min(4, state.built.length), 0, 'counter');
const isBuilt = (id) => state.built.includes(id);
if (state.built.length > 3) state.questSeen = true;
function save() {
  if (resetting) return;
  for (const id in stations) {
    const s = stations[id];
    if (s.kind === 'machine') state.stock[id] = { a: s.inN, b: s.outN, c: s.inN2 || 0 };
    else if (s.bin) state.stock[id] = { l: s.bin.list };
  }
  state.piles = COUNTERS.map((c) => c.pile.value);
  for (const t of tables) state.tpiles[t.i] = t.pile.value;
  try { localStorage.setItem(SAVE, JSON.stringify(state)); } catch (e) { /* storage off */ }
}
function loadBin(s, fallbackType) {
  const st = state.stock[s.id];
  if (!st) return;
  if (Array.isArray(st.l)) for (const t of st.l) if (ITEMS[t] && s.bin.list.length < s.bin.max) binAdd(s.bin, t);
  const old = st.a || st.b || 0;   // saves from round 1 kept plain counts
  for (let i = 0; i < old && s.bin.list.length < s.bin.max; i++) binAdd(s.bin, fallbackType);
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
// grid path-finding over the same boxes the player collides with; the sea edge (x 13.2) is the east border
const nav = createNav(colliders, { x0: -41, x1: 13.2, z0: -18.6, z1: 35 }, 0.5, 0.35);
let navV = 0;   // bumps whenever a box is added or removed, so everyone re-plans their walk
const box = (x0, z0, x1, z1) => { const b = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) }; colliders.push(b); nav.dirty(); navV++; return b; };
function unbox(b) { const i = colliders.indexOf(b); if (i >= 0) { colliders.splice(i, 1); nav.dirty(); navV++; } }
const insideBox = (x, z) => colliders.find((b) => x > b.x0 + 0.01 && x < b.x1 - 0.01 && z > b.z0 + 0.01 && z < b.z1 - 0.01);
// path to a target; exact = also take the last short step onto a spot that sits in the padded area (a chair by a table)
function navPath(sx, sz, tx, tz, exact) {
  const r = nav.path(sx, sz, tx, tz);
  const l = r[r.length - 1];
  if (exact && (!l || Math.hypot(l[0] - tx, l[1] - tz) > 0.05)) r.push([tx, tz]);
  return r;
}
function setGoal(c, x, z, exact) { c.goal = [x, z, exact]; c.navV = navV; const p = c.p.root.position; c.path = navPath(p.x, p.z, x, z, exact); }
// something new was built on top of someone: step them out to the nearest side
function evict() {
  const all = [...workers, ...customers, ...diners.filter((d) => d.st !== 'sit')];
  for (const a of all) {
    const pos = a.p.root.position, b = insideBox(pos.x, pos.z);
    if (!b) continue;
    const opts = [[b.x0 - 0.45, pos.z], [b.x1 + 0.45, pos.z], [pos.x, b.z0 - 0.45], [pos.x, b.z1 + 0.45]];
    opts.sort((u, v) => Math.hypot(u[0] - pos.x, u[1] - pos.z) - Math.hypot(v[0] - pos.x, v[1] - pos.z));
    const ok = opts.find((o) => !insideBox(o[0], o[1])) || opts[0];
    pos.x = ok[0]; pos.z = ok[1];
  }
}
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- item icons: each item's 3D model rendered once (plus a dark silhouette for the catch log) ----------
const ICON = {}, ICON_BIG = {}, ICON_SIL = {};
function makeIcons() {
  try {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setSize(96, 96); r.outputColorSpace = THREE.SRGBColorSpace;
    const sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight('#fff6e6', '#e8d29c', 1.7));
    const d = new THREE.DirectionalLight('#fff1d6', 1.6); d.position.set(-2, 4, 3); sc.add(d);
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    const sil = new THREE.MeshBasicMaterial({ color: '#6b5d50' });
    for (const type of Object.keys(ITEMS)) {
      const m = itemMesh(type); sc.add(m);
      const bb = new THREE.Box3().setFromObject(m), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3()).length();
      cam.position.set(c.x + s * 0.5, c.y + s * 1.6, c.z + s * 1.5); cam.lookAt(c);
      r.render(sc, cam);
      const url = r.domElement.toDataURL();
      ICON[type] = '<img class="ii" src="' + url + '" alt="">';
      ICON_BIG[type] = '<img src="' + url + '" alt="">';
      if (isRaw(type)) { sc.overrideMaterial = sil; r.render(sc, cam); ICON_SIL[type] = '<img class="sil" src="' + r.domElement.toDataURL() + '" alt="">'; sc.overrideMaterial = null; }
      sc.remove(m);
    }
    r.dispose(); r.forceContextLoss();
  } catch (e) { /* fall back to emoji */ }
  for (const t in ITEMS) {
    if (!ICON[t]) ICON[t] = '<span class="ic">' + ITEMS[t].icon + '</span>';
    if (!ICON_BIG[t]) ICON_BIG[t] = '<span class="big">' + ITEMS[t].icon + '</span>';
    if (!ICON_SIL[t]) ICON_SIL[t] = '<span class="big">？</span>';
  }
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
  K.add(D, K.mesh(G.plane(100, 160), '#f6e2b0', false, true), -36.4, 0, 8);
  for (let i = 0; i < 60; i++) {
    const r = 1.2 + rnd() * 3, p = K.mesh(G.circle(r, 20), rnd() < 0.5 ? '#f1d8a0' : '#fbecc8', false, true);
    p.position.set(-42 + rnd() * 54, 0.003 + i * 0.0011, -26 + rnd() * 64); p.scale.set(1, 1, 0.6 + rnd() * 0.6); p.rotation.y = rnd() * 3; D.add(p);
  }
  K.add(D, K.mesh(G.plane(1.8, 160), '#ead095', false, true), 12.9, 0.004, 8);
  K.add(D, K.mesh(G.plane(2.4, 160), '#86e0dc', false, true), 14.6, 0.008, 8);
  K.add(D, K.mesh(G.plane(90, 160), '#4cc3d6', false, true), 60.7, 0.006, 8);
  for (let z = -60; z < 80; z += 0.75) K.add(D, K.mesh(G.circle(0.34 + rnd() * 0.18, 12), '#ffffff', false, true), 13.45 + rnd() * 0.2, 0.01, z);
  // boardwalks: in front of the market, along the shore and the diners' path from the west beach
  const plank = (x, z, w, d, i) => K.add(D, K.mesh(G.rbox(w, 0.06, d, 0.03, 1), i % 2 ? '#e3ad74' : '#d9a066', false, true), x, 0.03, z);
  for (let x = -12.6, i = 0; x < 11.0; x += 0.62, i++) plank(x, -4.9, 0.56, 1.5, i);
  for (let z = -4.0, i = 0; z < 14; z += 0.62, i++) plank(-12.4, z, 1.3, 0.56, i);
  for (let z = -7.0, i = 0; z < -5.5; z += 0.62, i++) plank(6.5, z, 2.0, 0.56, i);   // up to the market door
  for (let z = -5.6, i = 0; z < 34.6; z += 0.62, i++) plank(11.6, z, 1.5, 0.56, i);
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
  // decoration: palms, rocks, umbrellas, buoys, barrels, lamps, nets
  const palmAt = (x, z, s, solid) => { const p = P3.palm(2.6 + rnd() * 1.2, 0.2 + rnd() * 0.5); p.position.set(x, 0, z); p.rotation.y = rnd() * 6; p.scale.setScalar(s); D.add(p); if (solid) box(x - 0.25, z - 0.25, x + 0.25, z + 0.25); };
  for (let i = 0; i < 17; i++) palmAt(-41 + i * 3.4 + rnd(), -20.5 - rnd() * 2.5, 0.9 + rnd() * 0.3, false);
  for (let i = 0; i < 16; i++) palmAt(-42.5 - rnd() * 3, -18 + i * 3.5 + rnd(), 0.9 + rnd() * 0.3, false);
  for (let i = 0; i < 16; i++) palmAt(-40 + i * 3.6 + rnd(), 37 + rnd() * 2, 0.9 + rnd() * 0.3, false);
  for (const [x, z] of [[-6.6, -1.4], [2.8, -2.0], [-20.5, -3.2], [-9.5, 14], [6.0, 18.2], [-19.5, 9], [-21.5, 20], [5.4, 23.4], [-13.5, 27.5], [3, 30], [-30, -2.4], [-36, 3], [-27.5, 9], [-33.5, 16], [-28, 24], [-37, 28]]) palmAt(x, z, 1, true);
  for (const [x, z, s] of [[-20.5, 13.5, 0.55], [-12, 12, 0.4], [7.0, 20.8, 0.45], [-22, 27, 0.6], [4.6, -2.6, 0.35], [14.4, -16, 0.8], [14.6, 33.6, 0.7], [-38, 10, 0.6], [-31, 31, 0.5]]) {
    const r = P.rock(s); r.position.set(x, 0, z); D.add(r);
    if (x < 12.9) box(x - s * 0.8, z - s * 0.7, x + s * 0.8, z + s * 0.7);
  }
  const umb = [['#ff5a4e', '#ffffff'], ['#5aa9ff', '#ffffff'], ['#ffd34a', '#ff8a6b'], ['#59c25b', '#ffffff'], ['#ff7eb6', '#ffffff']];
  for (let i = 0; i < 9; i++) {
    const x = -26 + i * 3.7 + rnd(), z = 26 + (i % 2) * 2.4 + rnd();
    if (x > -14.5 && x < -10.5) continue;
    const u = P3.umbrella(...umb[i % umb.length]); u.position.set(x, 0, z); D.add(u); box(x - 0.15, z - 0.15, x + 0.15, z + 0.15);
    const tw = P3.towel(umb[(i + 2) % umb.length][0]); tw.position.set(x + 0.9, 0, z + 0.4); tw.rotation.y = 0.3 - rnd() * 0.6; D.add(tw);
  }
  K.add(D, P3.beachBall(), -1.5, 0, 24.5);
  K.add(D, P3.beachBall(), 6.8, 0, 27.5);
  for (const [x, z, c] of [[17, 1.0, '#ff5a4e'], [26, 6, '#ffd34a'], [17.5, 14, '#ff5a4e'], [27, 19.5, '#ffd34a'], [27, -2, '#ff5a4e'], [28, 12, '#ffd34a']]) K.add(D, P3.buoy(c), x, 0, z);
  for (const [x, z] of [[9.0, -3.2], [10.0, 14.6], [12.6, 7.4]]) { K.add(D, P3.barrel(), x, 0, z); box(x - 0.32, z - 0.32, x + 0.32, z + 0.32); }
  for (const z of [-0.6, 6, 14, 19.4, 26, 33.4]) { K.add(D, P.lamp(), 12.6, 0, z); box(12.5, z - 0.1, 12.7, z + 0.1); }
  K.add(D, P.lamp(), -11.0, 0, -3.6); box(-11.1, -3.7, -10.9, -3.5);
  for (const [x, z, r] of [[-10.0, 12.6, 0], [-8.4, 4.4, 1.57]]) { const n = P3.netRack(); n.position.set(x, 0, z); n.rotation.y = r; D.add(n); box(x - (r ? 0.3 : 1.3), z - (r ? 1.3 : 0.3), x + (r ? 0.3 : 1.3), z + (r ? 1.3 : 0.3)); }
  for (const [x, z] of [[5.6, 15.8], [-7.6, 11.6], [-9.0, -3.2]]) { K.add(D, P3.crateStack(), x, 0, z); box(x - 0.75, z - 0.55, x + 0.75, z + 0.55); }
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
    const m = new THREE.Mesh(G.plane(0.4, 160), new THREE.MeshBasicMaterial({ color: '#dffbff', transparent: true, opacity: 0, depthWrite: false }));
    m.position.set(26, 0.014, 8); m.renderOrder = 1; scene.add(m);
    waves.push({ m, ph: i / 7 });
  }
  foam = new THREE.Mesh(G.plane(0.7, 160), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.4, depthWrite: false }));
  foam.position.set(13.7, 0.015, 8); foam.renderOrder = 1; scene.add(foam);
  for (const [cx2, cz, r, h, sp] of [[15, 4, 6, 3.6, 0.45], [4, -1, 7, 4.2, 0.35], [-14, -11, 6, 3.9, -0.45], [-2, 21, 8, 3.6, 0.3]]) {
    const gl = P3.gull(); gl.g.scale.setScalar(0.85); for (const w of gl.wings) { w.userData.dyn = true; K.bakeStatic(w); } K.bakeStatic(gl.g); scene.add(gl.g); gulls.push({ ...gl, cx: cx2, cz, r, h, sp, ph: rnd() * 6 });
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
// a mixed pile's label: every species in it with its exact count, then the total
function binLabel(b, extra) {
  const cnt = {}; for (const t of b.list) cnt[t] = (cnt[t] || 0) + 1;
  const ks = Object.keys(cnt).sort((a, c) => cnt[c] - cnt[a]);
  return (ks.length ? ks.map((t) => '<span>' + ICON[t] + cnt[t] + '</span>').join('') : '') + '<span class="tot">' + b.list.length + '/' + b.max + '</span>' + (extra || '');
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
    if (it.pop > 0) { it.pop = Math.max(0, it.pop - dt * 5); const q = it.pop; it.m.scale.setScalar(ITEMS[it.type].ss || 1); it.m.scale.x *= 1 + q * 0.35; it.m.scale.y *= 1 - q * 0.3; it.m.scale.z *= 1 + q * 0.35; }
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
function takeInto(c, type, from) {
  c.incoming++;
  fly(type, from, (o) => stackTop(c, o), 0.3, () => { c.incoming--; stackAdd(c, type); });
}

// ---------- player ----------
const player = carrier(K.person({ body: '#ff7f6e', hat: 'straw' }));
player.cap = () => upVal('cap');
player.p.root.position.set(8.1, 0, 4.2);
scene.add(player.p.root);
const pVel = new THREE.Vector3();
let pFace = 0;
const legsOf = (p) => p.rig.children.filter((o) => o.isGroup && Math.abs(o.position.y - 0.36) < 1e-3);
function sitPose(p) { for (const l of legsOf(p)) l.rotation.x = -1.35; }

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

// ---------- catch log (圖鑑) ----------
function caught(type, at) {
  if (!isRaw(type)) return;
  const L = state.log[type] || (state.log[type] = { n: 0, b: 0 });
  L.n++;
  if (L.n === 1) {
    state.logNew = true; showLogDot();
    toast('📖 新魚種：' + ITEMS[type].name + '！');
    if (at) { confetti(at.x, at.z); floatText('NEW ' + ITEMS[type].name, V3(at.x, 2, at.z), 'big'); }
    sfx('vip');
    checkPages();
  } else if (RARITY[type] >= 3 && at) {
    toast('✨ ' + RAR_NAME[RARITY[type]] + '漁獲：' + ITEMS[type].name + '！');
    floatText('✨ ' + ITEMS[type].name, V3(at.x, 2, at.z), 'big');
  }
}
function recBest(type, unit) { if (!isRaw(type)) return; const L = state.log[type] || (state.log[type] = { n: 0, b: 0 }); if (unit > L.b) L.b = unit; }
function checkPages() {
  LOG_PAGES.forEach((pg, i) => {
    if (state.logPaid[i] || !pg.ids.every((t) => state.log[t] && state.log[t].n > 0)) return;
    state.logPaid[i] = true;
    later.push({ t: 1.2, fn: () => { bonusToPlayer(pg.reward, player.p.root.position.clone()); toast('📖 圖鑑「' + pg.name + '」完成！獎勵 $' + fmtMoney(pg.reward)); } });
  });
}
function showLogDot() { const d = document.querySelector('#bLog .dot'); if (d) d.classList.toggle('hidden', !state.logNew); }

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
const BOATS = {
  boat: { make: P3.boat, lane: 1.75, tip: 22.3, bin: 20 },
  trawl: { make: P4.trawler, lane: 1.8, tip: 22.9, bin: 30 },
  deep: { make: P4.deepBoat, lane: 1.95, tip: 23.4, bin: 16 },
};
const sink = { g: null, n: 0, stack: null, t: 0 };
const rest = { ready: false, wing: false };
const cruise = { ready: false, st: 'away', t: 50, ship: null, group: [], order: null, value: 0, label: null };
const tables = [];
const pets = {};
const stats = { meals: 0, angry: 0, sales: 0, cruise: 0, catches: 0, dish: {}, sold: {} };
const BIN_KINDS = ['pier', 'angler', 'traps', 'aqua'];
// a crate on land at the root of a pier (shared by every catch method)
function catchCrate(s, z, max) {
  const cr = P3.crate(); cr.position.set(CRATE_X, 0, z); s.g.add(cr);
  s.outPt = V3(CRATE_X, 0, z);
  s.bin = makeBin(cr, crateSlots(), max, true);   // outdoor crates: piles without the outline pass (keeps draw calls down)
  box(CRATE_X - 0.68, z - 0.5, CRATE_X + 0.68, z + 0.5);
  s.outLabel = label('badge grp', '', (o) => o.set(CRATE_X, 1.0, z));
}
function landCatch(s, type, from, dur = 0.55) {
  s.bin.pend = (s.bin.pend || 0) + 1;
  fly(type, from, (o) => o.set(s.outPt.x, 0.45, s.outPt.z), dur, () => { s.bin.pend--; binAdd(s.bin, type); stats.catches++; caught(type, s.outPt); });
}

function build(def, instant) {
  const id = def.id;
  if (!state.built.includes(id)) state.built.push(id);
  const s = { id, def, kind: def.kind };
  stations[id] = s;
  const pos = def.pos || def.zone;
  if (def.kind === 'pier') {
    const pz = def.pz, B = BOATS[def.boat]; s.g = new THREE.Group(); scene.add(s.g);
    const pr = P3.pier(7.5); pr.position.set(PIER_X, 0, pz); s.g.add(pr);
    catchCrate(s, pz, B.bin);
    s.boats = [];
    const idx = DEFS.filter((d) => d.kind === 'pier').indexOf(def);
    [[15.7, pz + B.lane], [15.7, pz - B.lane], [B.tip, pz]].forEach(([mx, mz], i) => {
      const b = B.make(BOAT_COLS[(i + idx) % BOAT_COLS.length]);
      b.g.position.set(mx, 0, mz); b.g.rotation.y = Math.PI; scene.add(b.g);
      b.catchBox.visible = false; b.flag.visible = false;
      s.boats.push({ ...b, mx, mz, x: mx, st: 'dock', t: rand(0, 1.5) + i * 1.3, cargo: [] });
    });
    loadBin(s, 'fish');
    if (!instant) { for (let i = 0; i < 4; i++) { const t = roll(CATCH[def.boat]); binAdd(s.bin, t); caught(t); } const b = s.boats[0]; b.st = 'back'; b.x = b.mx + 7; b.cargo = tripCatch(def.boat); b.catchBox.visible = true; }
    applyGrow(s);
    if (!instant) popIn(s.g);
  } else if (def.kind === 'angler') {
    s.g = new THREE.Group(); scene.add(s.g);
    const pr = P3.pier(8.2); pr.position.set(PIER_X, 0, ANGLER_Z); s.g.add(pr);
    catchCrate(s, ANGLER_Z, 20);
    s.anglers = [];
    [[13.9, -1], [15.2, -1], [16.5, -1], [17.8, -1], [19.1, -1]].forEach(([x, side], i) => {
      const ez = ANGLER_Z + side * 1.02;
      const p = K.person({ body: ['#7fd6c9', '#ffb347', '#b48cff', '#5aa9ff', '#ff7eb6'][i], hat: i % 2 ? 'cap' : 'straw', hatColor: '#ffd34a', legs: '#4f8fe8' });
      p.root.position.set(x, 0.12, ez); p.root.rotation.y = side > 0 ? 0 : Math.PI; sitPose(p);
      for (const a of p.arms) a.rotation.x = -1.1;
      scene.add(p.root); K.bakeStatic(p.root);
      const r = P4.rod(); r.g.position.set(x, 0, ez); r.g.rotation.y = side > 0 ? 0 : Math.PI; scene.add(r.g);
      r.pole.position.set(0.18, 0.75, 0.25); r.pole.rotation.x = 0.9;
      r.bob.position.set(0.2, 0, 2.05);
      K.bakeStatic(r.pole); K.bakeStatic(r.bob);
      s.anglers.push({ p, r, x, side, t: rand(0, 3), next: rand(3, 8), jerk: 0 });
    });
    loadBin(s, 'fish');
    applyGrow(s);
    if (!instant) popIn(s.g);
  } else if (def.kind === 'traps') {
    s.g = new THREE.Group(); scene.add(s.g);
    const pr = P3.pier(2.4); pr.position.set(PIER_X, 0, TRAP_Z); s.g.add(pr);
    catchCrate(s, TRAP_Z, 20);
    s.cages = [];
    const addCage = (x, z, kind, on) => { const c = P4.trap(kind); c.g.position.set(x, 0, z); c.g.rotation.y = Math.PI; scene.add(c.g); K.bakeStatic(c.g); c.g.visible = on; s.cages.push({ ...c, x, z, kind, t: rand(0, 6), ripe: false, on }); };
    for (const [x, z] of [[15.2, -10.6], [18.0, -7.6], [18.4, -10.4], [20.0, -8.6], [16.4, -12.4]]) addCage(x, z, 'crab', true);
    for (const [x, z] of [[20.8, -11.2], [21.6, -7.6], [18.8, -12.8]]) addCage(x, z, 'lobster', isBuilt('lobsterTraps'));
    const rb = P4.rowboat(); rb.g.position.set(16.6, 0, TRAP_Z); scene.add(rb.g);
    const rower = K.person({ body: '#ff9f43', hat: 'cap', hatColor: '#5aa9ff' }); rower.root.position.set(-0.25, 0.1, 0); rower.root.rotation.y = Math.PI / 2; rower.root.scale.setScalar(0.85); sitPose(rower);
    for (const a of rower.arms) a.rotation.x = -1.2;
    rb.b.add(rower.root); K.bakeStatic(rower.root);
    s.tboat = { ...rb, x: 16.6, z: TRAP_Z, home: [16.6, TRAP_Z], st: 'home', t: 0, hold: [], face: 0 };
    loadBin(s, 'crab');
    applyGrow(s);
    if (!instant) popIn(s.g);
  } else if (def.kind === 'lobtraps') {
    const tr = stations.traps;
    if (tr) for (const c of tr.cages) if (c.kind === 'lobster' && !c.on) { c.on = true; c.g.visible = true; if (!instant) popIn(c.g); }
  } else if (def.kind === 'aqua') {
    s.g = new THREE.Group(); scene.add(s.g);
    const pr = P3.pier(2.4); pr.position.set(PIER_X, 0, AQUA_Z); s.g.add(pr);
    catchCrate(s, AQUA_Z, 20);
    s.pens = [];
    for (const [x, z, sp] of [[16.8, AQUA_Z, 'salmon'], [19.6, AQUA_Z, 'shrimp'], [22.4, AQUA_Z, 'salmon'], [19.6, AQUA_Z + 2.8, 'shrimp']]) {
      const pn = P4.pen(); pn.g.position.set(x, 0, z); scene.add(pn.g);
      const fishM = itemMesh(sp); fishM.scale.setScalar(1.3); pn.jump.add(fishM); pn.jump.visible = false;
      K.bakeStatic(pn.g);
      s.pens.push({ ...pn, x, z, sp, t: rand(0, 5), jt: rand(1, 4), ja: 0 });
    }
    const f = K.person({ body: '#59c25b', hat: 'straw', apron: '#4f8fe8' }); f.root.position.set(15.1, 0.12, AQUA_Z); f.root.rotation.y = Math.PI / 2; scene.add(f.root);
    s.feeder = f;
    loadBin(s, 'salmon');
    applyGrow(s);
    if (!instant) popIn(s.g);
  } else if (def.kind === 'machine') {
    const m = def.mk === 'ice' || def.mk === 'can' || def.mk === 'dry' || def.mk === 'grill' || def.mk === 'sushi' ? P3.machine(def.mk) : P4.machine4(def.mk);
    const inside = pos[1] < -12 && pos[0] < -11;
    m.g.position.set(pos[0], inside ? 0.12 : 0, pos[1]); scene.add(m.g);
    const tw = m.inTray.getWorldPosition(new THREE.Vector3()), nw = m.outTray.getWorldPosition(new THREE.Vector3());
    const t2 = m.in2Tray ? m.in2Tray.getWorldPosition(new THREE.Vector3()) : null;
    K.bakeStatic(m.spin);
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
    Object.assign(s, { g: sh.g, items: def.items, front: V3(pos[0], 0, pos[1] + 1.25), door: sh.door || null, dk: 0 });
    const slots = [];
    for (let i = 0; i < 24; i++) slots.push({ p: sh.slots[i % 8].clone().setY(sh.slots[i % 8].y + Math.floor(i / 8) * 0.2), ry: Math.PI / 2 + (i % 3) * 0.2 - 0.2, s: def.fridge ? 0.9 : 1 });
    s.bin = makeBin(sh.g, slots, 24);
    if (!def.fridge) { const ic = itemMesh(def.items[0]); ic.scale.setScalar(0.9); ic.position.set(0, 1.12, -0.38); ic.rotation.x = 0.5; sh.g.add(ic); }
    loadBin(s, def.items[0]);
    s.label = label('badge big grp', '', (o) => o.set(pos[0], def.fridge ? 1.6 : 1.95, pos[1]));
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
  } else if (def.kind === 'wing') {
    buildWing(instant);
    buildTable(6, instant);
  } else if (def.kind === 'table') {
    buildTable(def.ti, instant);
  } else if (def.kind === 'cruise') {
    buildCruise(instant);
  } else if (def.kind === 'lighthouse') {
    lightObj.lamp.material = new THREE.MeshBasicMaterial({ color: '#fff3a6' });
    lightObj.beam.visible = true;
  } else if (def.kind === 'counter') {
    buildCounter(0);
    if (!instant) popIn(COUNTERS[0].pile.grp);
  } else if (def.kind === 'mapgate') {
    mapsSet('forest');
    // a signpost beside the (now gone) zone, never on top of where the player stood
    const sx = 10.4, sz = -7.2, g = new THREE.Group(); g.position.set(sx, 0, sz); scene.add(g);
    K.add(g, K.mesh(G.rbox(0.16, 1.7, 0.16, 0.04), C.woodDark), 0, 0.85, 0);
    const sb = P2.signBoard('往森林小鎮', 2.6, '#59c25b'); sb.scale.setScalar(0.6); sb.position.set(0, 1.75, 0); g.add(sb);
    box(sx - 0.15, sz - 0.15, sx + 0.15, sz + 0.15);
    s.g = g;
    if (!instant) { popIn(g); later.push({ t: 1.0, fn: () => openPanel('map') }); }
  } else if (def.kind === 'aquarium') {
    const g = P3.aquarium(); g.position.set(pos[0], 0, pos[1]); scene.add(g); s.g = g;
    box(pos[0] - 3.2, pos[1] - 2.1, pos[0] + 3.2, pos[1] + 2.1);
    if (!instant) popIn(g);
  }
  if (s.g && s.g.isObject3D) K.bakeStatic(s.g);
  const fx = def.kind === 'lighthouse' ? [LIGHT.x, LIGHT.z] : def.kind === 'lobtraps' ? [19, -8] : pos;
  if (!instant) { confetti(fx[0], fx[1]); sfx('unlock'); toast('🎉 ' + def.name + ' 完成！' + (def.note || '')); }
  evict();
  refreshZones();
  save();
}
function applyGrow(s) {
  const id = s.id; if (!GROW[id]) return;
  const n = lvlOf(id);
  const toggle = (arr, get) => arr.forEach((o, i) => { const g = get(o), on = i < n; if (on && !g.visible) popIn(g); g.visible = on; o.on = on; });
  if (s.boats) toggle(s.boats, (b) => b.g);
  if (s.anglers) { toggle(s.anglers, (a) => a.p.root); s.anglers.forEach((a) => { a.r.g.visible = a.on; }); }
  if (s.pens) toggle(s.pens, (p) => p.g);
  if (s.cages) s.cages.filter((c) => c.kind === 'crab').forEach((c, i) => { const on = i < n; if (on && !c.g.visible) popIn(c.g); c.g.visible = on; c.on = on; });
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
  const cx = (R0 + REST.x1) / 2, w = REST.x1 - R0, d = REST.z1 - REST.z0;
  K.add(g, K.mesh(G.rbox(w, 0.12, d, 0.06, 2), '#e8b67c', false, true), cx, 0.06, (REST.z0 + REST.z1) / 2);
  for (let x = R0 + 0.3; x < REST.x1 - 0.1; x += 0.6) K.add(g, K.mesh(G.rbox(0.03, 0.02, d - 0.3, 0.01), '#cf9a62', false, true), x, 0.125, (REST.z0 + REST.z1) / 2);
  K.add(g, K.mesh(G.rbox(w - 0.4, 0.03, 2.6, 0.02, 1), '#e3f1f6', false, true), cx, 0.135, -16.35);
  for (let x = R0 + 0.4; x < REST.x1 - 0.6; x += 0.8) K.add(g, K.mesh(G.plane(0.38, 2.5), '#cbe5ef', false, true), x + 0.2, 0.152, -16.35);
  K.add(g, K.mesh(G.rbox(w, 2.2, 0.4, 0.08), C.white), cx, 1.1, -17.8);
  K.add(g, K.mesh(G.rbox(w + 0.06, 0.3, 0.44, 0.04), '#8fd1c4'), cx, 0.75, -17.8);
  K.add(g, K.mesh(G.rbox(w + 0.1, 0.22, 0.46, 0.05), '#ff8a6b'), cx, 2.2, -17.8);
  const sign = P2.signBoard('海鮮餐廳', 4, '#ff8a6b'); sign.position.set(cx, 2.9, -17.7); g.add(sign);
  for (const [x0, z0, x1, z1] of [[R0, REST.z1, -13.3, REST.z1], [REST.x1, REST.z1, REST.x1, -17.6]]) g.add(P3.railLine(x0, z0, x1, z1));
  rest.frontBox = box(R0 - 0.15, REST.z1 - 0.15, -13.2, REST.z1 + 0.15);
  box(REST.x1 - 0.15, -17.8, REST.x1 + 0.15, REST.z1);
  rest.backBox = box(R0, -18.1, REST.x1, -17.6);
  for (const [x, c] of [[-18.4, '#ffd34a'], [-13.3, '#ff6b5a'], [REST.x1, '#ffd34a']]) K.add(g, P3.lantern(c), x, 0, REST.z1);
  const sk = P3.sink(); sk.position.set(SINK.x, 0.12, SINK.z); g.add(sk);
  sink.g = K.add(scene, new THREE.Group(), SINK.x, 0.12, SINK.z);
  const slots = [];
  for (let i = 0; i < 10; i++) slots.push({ p: V3(-0.2 + (i % 2) * 0.4, 0.82 + Math.floor(i / 2) * 0.06, 0.05) });
  sink.stack = itemStack('plate', sink.g, slots);
  box(SINK.x - 0.55, SINK.z - 0.45, SINK.x + 0.55, SINK.z + 0.45);
  K.bakeStatic(g);
  // the west railing goes away when the restaurant is extended
  if (!isBuilt('restWing')) {
    rest.westRail = K.add(scene, new THREE.Group());
    rest.westRail.add(P3.railLine(R0, REST.z1, R0, -17.6)); K.add(rest.westRail, P3.lantern('#ff6b5a'), R0, 0, REST.z1);
    K.bakeStatic(rest.westRail);
    rest.westBox = box(R0 - 0.15, -17.8, R0 + 0.15, REST.z1);
  }
  const lamps = [];
  for (const x of [-21.5, -17.4, -13.3]) { const l = P2.wallLamp(); l.g.position.set(x, 1.85, -17.5); scene.add(l.g); lamps.push(l); }
  restArea = makeArea(R0, REST.z0, REST.x1, REST.z1, lamps, cx, -12);
  rest.ready = true;
  if (!instant) popIn(g);
}
function buildWing(instant) {
  const g = K.add(scene, new THREE.Group());
  const x0 = WING_X0, x1 = R0, cx = (x0 + x1) / 2, w = x1 - x0, d = REST.z1 - REST.z0;
  K.add(g, K.mesh(G.rbox(w + 0.1, 0.12, d, 0.06, 2), '#e8b67c', false, true), cx, 0.06, (REST.z0 + REST.z1) / 2);
  for (let x = x0 + 0.3; x < x1; x += 0.6) K.add(g, K.mesh(G.rbox(0.03, 0.02, d - 0.3, 0.01), '#cf9a62', false, true), x, 0.125, (REST.z0 + REST.z1) / 2);
  K.add(g, K.mesh(G.rbox(w, 0.03, 2.6, 0.02, 1), '#e3f1f6', false, true), cx, 0.135, -16.35);
  for (let x = x0 + 0.4; x < x1 - 0.2; x += 0.8) K.add(g, K.mesh(G.plane(0.38, 2.5), '#cbe5ef', false, true), x + 0.2, 0.152, -16.35);
  K.add(g, K.mesh(G.rbox(w, 2.2, 0.4, 0.08), C.white), cx, 1.1, -17.8);
  K.add(g, K.mesh(G.rbox(w + 0.06, 0.3, 0.44, 0.04), '#8fd1c4'), cx, 0.75, -17.8);
  K.add(g, K.mesh(G.rbox(w + 0.1, 0.22, 0.46, 0.05), '#ff8a6b'), cx, 2.2, -17.8);
  const sign = P2.signBoard('海鮮料理', 4, '#4f9cf0'); sign.position.set(cx, 2.9, -17.7); g.add(sign);
  for (const [a, b, c, e] of [[x0, REST.z1, x1, REST.z1], [x0, REST.z1, x0, -17.6]]) g.add(P3.railLine(a, b, c, e));
  for (const [x, c] of [[x0, '#ff6b5a'], [-32, '#ffd34a'], [-27.6, '#ff6b5a']]) K.add(g, P3.lantern(c), x, 0, REST.z1);
  const tank = P4.fishTank(); tank.position.set(-35.6, 0.12, -7.0); g.add(tank);
  for (const x of [-39.0, -32.2]) { const pot = K.add(g, new THREE.Group(), x, 0.12, -7.0); K.add(pot, K.mesh(G.cyl(0.32, 0.24, 0.45, 10), C.roof), 0, 0.22, 0); K.add(pot, P.bush(0.35), 0, 0.4, 0); box(x - 0.35, -7.35, x + 0.35, -6.65); }
  box(-36.85, -7.5, -34.35, -6.5);
  box(x0 - 0.15, REST.z1 - 0.15, x1, REST.z1 + 0.15);
  box(x0 - 0.15, -17.8, x0 + 0.15, REST.z1);
  box(x0, -18.1, x1, -17.6);
  K.bakeStatic(g);
  if (rest.westRail) { scene.remove(rest.westRail); rest.westRail = null; }
  if (rest.westBox) { unbox(rest.westBox); rest.westBox = null; }
  for (const x of [-37, -32, -27]) { const l = P2.wallLamp(); l.g.position.set(x, 1.85, -17.5); scene.add(l.g); restArea.lamps.push(l); }
  REST.x0 = x0; restArea.x0 = x0; restArea.light.position.x = -25.6; restArea.light.distance = 30;
  rest.wing = true;
  if (!instant) popIn(g);
}
function buildTable(i, instant) {
  if (tables.some((t) => t.i === i)) return;
  const [x, z] = T_POS[i];
  const tb = P3.diningTable(); tb.g.position.set(x, 0.12, z); scene.add(tb.g);
  const t = { i, x, z, g: tb.g, st: 'free', seats: [], pile: { value: state.tpiles[i] || 0 }, patience: 0, claim: null, t: 0, arrived: 0 };
  for (const sd of tb.seats) {
    const seat = { wx: x + sd.x, wz: z + sd.z, face: sd.face, dish: null, got: false, diner: null, claim: null, vis: {} };
    for (const type of [...DISHES, 'plate']) {
      const m = itemMesh(type); m.position.copy(sd.dish); m.visible = false; m.userData.dyn = true; tb.g.add(m); seat.vis[type] = m;
    }
    t.seats.push(seat);
  }
  const cash = []; for (let k = 0; k < 4; k++) cash.push({ p: V3(0.36, 0.83 + k * 0.05, (k % 2) * 0.06 - 0.03), ry: Math.PI / 2 + k * 0.2, s: 0.8 });
  t.pile.stack = itemStack('money', tb.g, cash);
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
  p.stack.set(n);
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

// ---------- maps unlocked across the whole game (shared with the farm) ----------
const MAPS_KEY = 'farm_maps_v1';
function mapsGet() { try { return JSON.parse(localStorage.getItem(MAPS_KEY) || '{}'); } catch (e) { return {}; } }
function mapsSet(id) { const m = mapsGet(); m[id] = true; try { localStorage.setItem(MAPS_KEY, JSON.stringify(m)); } catch (e) { /* storage off */ } }

// ① pick one of the two starting choices → ② the free cash counter → ③ the first shelf for that choice.
// A line of glowing dots on the ground leads along the walking path to the next thing to build.
const FIRST_SHELF = { pier1: 'shelfFish', seaweed: 'shelfSeaweed' };
function guideTargets() {
  const starts = DEFS.filter((d) => d.start);
  if (!starts.some((d) => isBuilt(d.id))) return { ids: starts.map((d) => d.id).filter((id) => zones[id]), two: true };
  if (!isBuilt('counter')) return { ids: zones.counter ? ['counter'] : [], two: false };
  if (!Object.values(FIRST_SHELF).some(isBuilt)) return { ids: starts.filter((d) => isBuilt(d.id)).map((d) => FIRST_SHELF[d.id]).filter((id) => zones[id]), two: false };
  return { ids: [], two: false };
}
const guide = { labels: [] };
const dotGeo = G.circle(0.17, 14);
const dotMat = new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.95, depthWrite: false });
const dots = [];
for (let i = 0; i < 80; i++) { const d = new THREE.Mesh(dotGeo, dotMat); d.renderOrder = 3; d.visible = false; scene.add(d); dots.push(d); }
let trailT = 0, trailPts = [];
function updateGuide(dt) {
  const g = guideTargets();
  while (guide.labels.length < 2) { const L = label('guide', '二選一', (o) => o.set(0, 0, 0)); L.show = false; guide.labels.push(L); }
  for (let i = 0; i < 2; i++) {
    const z = zones[g.ids[i]], L = guide.labels[i];
    L.show = !!z && g.two;
    if (z) L.getPos = (o) => o.set(z.x, 2.6, z.z);
  }
  trailT -= dt;
  if (trailT <= 0) {
    trailT = 0.25; trailPts = [];
    const pp = player.p.root.position;
    for (const id of g.ids) {
      const z = zones[id]; if (!z) continue;
      const path = [[pp.x, pp.z]].concat(nav.path(pp.x, pp.z, z.x, z.z));
      let d = 0.9;
      for (let k = 1; k < path.length; k++) {
        const [ax, az] = path[k - 1], [bx, bz] = path[k], seg = Math.hypot(bx - ax, bz - az);
        while (d < seg) { const x = ax + (bx - ax) * d / seg, zz = az + (bz - az) * d / seg; if (Math.hypot(x - z.x, zz - z.z) > 1.1) trailPts.push([x, zz]); d += 0.7; }
        d -= seg;
      }
    }
  }
  dots.forEach((m, i) => {
    const p = trailPts[i]; m.visible = !!p;
    if (p) { m.position.set(p[0], onFloor(p[0], p[1]) ? 0.19 : 0.07, p[1]); m.scale.setScalar(1 + 0.4 * Math.max(0, Math.sin(T * 7 - i * 0.55))); }
  });
  updateQuest(dt);
}
// 新手任務: the three opening steps on the left; when all are done it says so for 4 s and then hides for good
function questSteps() {
  const picked = DEFS.find((d) => d.start && isBuilt(d.id));
  return [
    { t: '二選一：釣魚碼頭或海帶田', ok: !!picked },
    { t: '蓋收銀台', ok: isBuilt('counter') },
    { t: picked ? '蓋' + DEF[FIRST_SHELF[picked.id]].name : '蓋貨架或冷藏櫃', ok: Object.values(FIRST_SHELF).some(isBuilt) },
  ];
}
let questHtml = '', questDoneT = -1;
function updateQuest(dt) {
  const el = $('quest'); if (!el) return;
  const steps = questSteps(), all = steps.every((q) => q.ok);
  if (all && questDoneT < 0) { questDoneT = state.questSeen ? 0 : 4; state.questSeen = true; }
  if (all) { questDoneT -= dt; if (questDoneT <= 0) { el.classList.add('hidden'); return; } }
  el.classList.remove('hidden');
  const cur = steps.findIndex((q) => !q.ok);
  const html = '<b>新手任務</b>' + steps.map((q, i) => '<div class="q' + (q.ok ? ' ok' : '') + (i === cur ? ' now' : '') + '"><span>' + (q.ok ? '✓' : i + 1) + '</span>' + q.t + '</div>').join('') +
    (all ? '<div class="qdone">完成！可以自由活動了</div>' : '');
  if (html !== questHtml) { questHtml = html; el.innerHTML = html; }
}

// ---------- zones ----------
const zones = {};
const dashTex = K.dashTexture();
const dashMat = new THREE.MeshBasicMaterial({ map: dashTex, transparent: true, depthWrite: false });
const fillMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false });
function refreshZones() {
  for (const def of DEFS) {
    if (isBuilt(def.id)) { if (zones[def.id]) killZone(def.id); continue; }
    let open = (!def.req || def.req.every(isBuilt)) && (!def.any || def.any.some(isBuilt));
    if (def.start && DEFS.some((d) => d.start && d !== def && isBuilt(d.id)) && !isBuilt('cashier')) open = false;
    if (def.earned && state.earned < def.earned) open = false;
    if (!open && def.start && zones[def.id]) killZone(def.id);   // the other starting choice steps aside for now
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
  if (def.kind === 'pier') return [9.6, def.pz + 2.6];
  if (def.kind === 'angler') return [9.8, -0.4];
  if (def.kind === 'traps') return [10.2, -5.0];
  if (def.kind === 'aqua') return [8.8, 24.8];
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
const onFloor = (x, z) => (z < REST.z1 && z > REST.z0 && x > REST.x0 && x < REST.x1) || (z < SHOP.z1 && x > SHOP.x0 && x < SHOP.x1 && z > SHOP.z0);
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
    if (!z.total) { const d = z.def; later.push({ t: 0.2, fn: () => build(d) }); killZone(id); sfx('drop'); continue; }   // free zone
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
// ---------- workers ----------
const workers = [];
const LOOKS = {
  cashier: { body: '#b48cff', hat: 'bun', hatColor: '#7a4fd6', apron: C.white },
  fisher: { body: '#ffd34a', hat: 'cap', hatColor: '#ff6b5a', legs: '#4f8fe8' },
  shelver: { body: '#5aa9ff', hat: 'cap', hatColor: '#ffd34a', apron: '#ffd34a' },
  waiter: { body: '#fbfaf5', hat: 'bun', hatColor: '#5b3a2c', apron: '#4a4f5a', legs: '#4a4f5a' },
  washer: { body: '#7fd6c9', hat: 'cap', hatColor: '#ffffff', apron: '#5aa9ff' },
};
// 「多請一位」: extra staff bought from the 員工 tab (cashiers stay one per counter)
const HIRE = {
  fisher: { name: '漁夫', ic: 'fish', base: 600, home: [10.0, 4.8] },
  shelver: { name: '理貨員', ic: 'can', base: 700, home: [0, -4.4] },
  waiter: { name: '服務生', ic: 'sushi', base: 900, home: [-12.6, -11.0] },
  washer: { name: '洗碗工', ic: 'plate', base: 800, home: [-12.6, -13.4] },
  angler: { name: '釣魚員', ic: 'mackerel' },
};
const HIRE_MAX = 6;
const roleOpen = (role) => (role === 'angler' ? isBuilt('anglerPier') : DEFS.some((d) => d.kind === 'hire' && d.role === role && isBuilt(d.id)));
const roleCount = (role) => (role === 'angler' ? lvlOf('anglerPier') : workers.filter((w) => w.role === role).length);
function hireCost(role) {
  if (role === 'angler') { const g = GROW.anglerPier, n = lvlOf('anglerPier'); return n >= g.max ? null : g.cost[Math.min(n - g.start, g.cost.length - 1)]; }
  const n = state.extra[role] || 0;
  return n >= HIRE_MAX ? null : Math.round(HIRE[role].base * Math.pow(1.8, n) / 10) * 10;
}
function hireExtra(role) {
  const cost = hireCost(role);
  if (cost === null || state.money < cost || !roleOpen(role)) return false;
  state.money -= cost; updateMoney();
  if (role === 'angler') { state.lvl.anglerPier = lvlOf('anglerPier') + 1; applyGrow(stations.anglerPier); refreshZones(); }
  else { state.extra[role] = (state.extra[role] || 0) + 1; const w = makeWorker(role, HIRE[role].home, true); const p = w.p.root.position; puff(p.x, 1, p.z, '#ffffff', 8, 0.8); }
  sfx('unlock'); toast('🎉 多請了一位' + HIRE[role].name + '！'); save();
  return true;
}
function makeWorker(role, at, pop) {
  const p = K.person(LOOKS[role]);
  p.root.position.set(at[0], 0, at[1]); scene.add(p.root); if (pop) popIn(p.root);
  const w = carrier(p);
  Object.assign(w, { role, job: null, wait: 0, face: 0, moving: 0 });
  w.cap = () => upVal('wcap');
  workers.push(w);
  return w;
}
// walk along a nav path; arrives at the last waypoint (the target, or the nearest free spot when it is blocked)
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
const binStations = () => Object.values(stations).filter((s) => s.bin && BIN_KINDS.includes(s.kind));
function idleWander(w, dt, cx, cz) {
  w.wait -= dt;
  if (!w.wp || w.wait <= 0) { w.wp = [cx + (Math.random() - 0.5) * 2.4, cz + (Math.random() - 0.5) * 1.6]; w.wait = 2 + Math.random() * 2; }
  go(w, w.wp[0], w.wp[1], dt, 1.6);
}
const STORE_CAP = 200;
const storeTotal = () => Object.values(state.store).reduce((a, b) => a + b, 0);
const srcCount = (src, item) => src.kind === 'store' ? (state.store[item] || 0) : src.bin ? binCount(src.bin, item) : src.outN;
function srcTake(src, item) { if (src.kind === 'store') state.store[item]--; else if (src.bin) binTake(src.bin, item); else src.outN--; }
const srcPoint = (src) => (src.kind === 'store' ? src.outPt : src.bin ? V3(src.outPt.x - 1.1, 0, src.outPt.z) : V3(src.outPt.x + 0.3, 0, src.outPt.z + 0.9));
const machIns = (m) => (m.def.in2 ? [m.def.in, m.def.in2] : [m.def.in]);
const inCount = (m, item) => (item === m.def.in2 ? m.inN2 : m.inN);
const inPend = (m, item) => (item === m.def.in2 ? (m.pend2 || 0) : (m.pend || 0));
// can this item be produced at all right now (any catch method / machine / field built that makes it)?
function producible(t) {
  for (const s of Object.values(stations)) {
    if (s.kind === 'pier' && CATCH[s.def.boat][t]) return true;
    if (s.kind === 'angler' && CATCH.angler[t] >= 3) return true;
    if (s.kind === 'traps' && (CATCH.crab[t] || (isBuilt('lobsterTraps') && CATCH.lobster[t]))) return true;
    if (s.kind === 'aqua' && (t === 'salmon' || t === 'shrimp')) return true;
    if ((s.kind === 'machine' || s.kind === 'crop') && s.def.out === t) return true;
  }
  return false;
}
function sourceFor(item, w) {
  let best = null, bd = 1e9;
  for (const s of Object.values(stations)) {
    let ok = false;
    if (s.bin && BIN_KINDS.includes(s.kind) && binCount(s.bin, item) > 0) ok = true;
    if (s.kind === 'machine' && s.def.out === item && s.outN > 0) ok = true;
    if (s.kind === 'crop' && s.def.out === item && s.plants.some((p) => p.ripe && (!p.res || p.res === w))) ok = true;
    if (s.kind === 'store' && (state.store[item] || 0) > 0) ok = true;
    if (!ok) continue;
    const pt = s.outPt || V3(s.def.pos[0], 0, s.def.pos[1]);
    const d = dist2(w.p.root.position, pt.x, pt.z);
    if (d < bd) { bd = d; best = s; }
  }
  return best;
}
const shelfSpace = (s) => upVal('shelfCap') - s.bin.list.length - (s.pend || 0);
function pickJob(w) {
  const fisher = w.role === 'fisher';
  const want = (it) => customers.filter((c) => c.st === 'shop' && c.item === it).length;
  let best = null;
  const consider = (k, dst, src, item) => { if (!best || k > best.k) best = { k, dst, src, item }; };
  for (const s of listOf('shelf')) {
    const space = shelfSpace(s); if (space < 2) continue;
    for (const item of s.items) {
      if (fisher && !isRaw(item)) continue;
      const src = sourceFor(item, w); if (!src) continue;
      const taken = workers.some((o) => o !== w && o.job && o.job.dst === s && o.job.item === item);
      const have = binCount(s.bin, item);
      consider(want(item) * 8 + space * 0.6 + (have === 0 ? 4 : 0) + Math.random() * 2 - (taken ? 12 : 0), s, src, item);
    }
  }
  for (const m of listOf('machine')) for (const item of machIns(m)) {
    if (fisher && !isRaw(item)) continue;
    const space = m.inMax - inCount(m, item) - inPend(m, item); if (space < 3) continue;
    const src = sourceFor(item, w); if (!src) continue;
    const taken = workers.some((o) => o !== w && o.job && o.job.dst === m && o.job.item === item);
    const dish = DISHES.includes(m.def.out);
    consider(space * 0.9 + (inCount(m, item) === 0 ? 5 : 0) + (dish && demandFor(m.def.out) ? 6 : 0) + Math.random() * 2 - (taken ? 12 : 0), m, src, item);
  }
  // crates filling up with species nobody needs yet: move them to the warehouse so the catch keeps coming
  const wh = stations.warehouse;
  if (wh && storeTotal() < STORE_CAP - 10) for (const s of binStations()) {
    const fill = s.bin.list.length / s.bin.max; if (fill < 0.6) continue;
    const cnt = {}; for (const t of s.bin.list) cnt[t] = (cnt[t] || 0) + 1;
    const item = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
    const taken = workers.some((o) => o !== w && o.job && o.job.src === s && o.job.dst === wh);
    consider((fill >= 0.95 ? 14 : fill * 8 - 1) - (taken ? 12 : 0), wh, s, item);
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
    if (shelfSpace(dst) <= 0) return;
    c.xfer = 0.1; dst.pend = (dst.pend || 0) + 1;
    giveFrom(c, item, (o) => o.set(dst.def.pos[0], 0.9, dst.def.pos[1]), () => { dst.pend--; binAdd(dst.bin, item); });
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
  if (dst.kind === 'shelf') return shelfSpace(dst) <= 0;
  if (dst.kind === 'store') return storeTotal() >= STORE_CAP;
  return inCount(dst, item) + inPend(dst, item) >= dst.inMax;
}
const usable = (t) => DEFS.some((d) => (isBuilt(d.id) || zones[d.id]) && ((d.items && d.items.includes(t)) || d.in === t || d.in2 === t)) || Object.values(zones).some((z) => z.def.cost[t] && left(z, t) > 0) || !!stations.warehouse || cruiseWants(t);
const cruiseWants = (t) => cruise.st === 'wait' && cruise.order && cruise.order[t] > 0;
function dstFor(type) {
  return listOf('shelf').find((s) => s.items.includes(type) && !isFull(s, type)) || listOf('machine').find((m) => machIns(m).includes(type) && !isFull(m, type)) || (stations.warehouse && storeTotal() < STORE_CAP ? stations.warehouse : null);
}
function updateWorker(w, dt) {
  const sp = upVal('wspeed');
  w.moving = 0;
  if (w.role === 'cashier') { const c = COUNTERS[0]; if (go(w, c.serve.x, c.serve.z, dt, sp)) w.face = 0; return; }
  if (w.role === 'waiter') { updateWaiter(w, dt, sp); return; }
  if (w.role === 'washer') { updateWasher(w, dt, sp); return; }
  // fisher (seafood only) and shelver: fetch a full load from a source, then deliver it to a shelf, machine or the warehouse
  const home = w.role === 'fisher' ? [10.0, 4.8] : [0, -4.4];
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
      if (!pl) { j.phase = count(w, j.item) ? 'put' : 'done'; }
      else if (go(w, pl.x, pl.z + 0.7, dt, sp)) { pickPlant(src, pl, w); j.plant = null; }
    } else {
      const sp0 = srcPoint(src);
      if (go(w, sp0.x, sp0.z, dt, sp) || dist2(w.p.root.position, src.outPt.x, src.outPt.z) < 1.3) {
        w.xfer -= dt;
        if (w.xfer <= 0 && srcCount(src, j.item) > 0 && room(w) > 0) { w.xfer = 0.1; srcTake(src, j.item); takeInto(w, j.item, V3(src.outPt.x, 0.4, src.outPt.z)); }
        if ((srcCount(src, j.item) <= 0 || room(w) <= 0) && !w.incoming) j.phase = count(w, j.item) ? 'put' : 'done';
      }
    }
  } else if (j.phase === 'put') {
    if (!w.incoming) {
      if (isFull(j.dst, j.item) && count(w, j.item)) { const d2 = dstFor(j.item); if (d2 && d2 !== j.dst) j.dst = d2; }
      const p = dstPoint(j.dst, j.item);
      if (go(w, p.x + 0.4, p.z, dt, sp) || dist2(w.p.root.position, p.x, p.z) < 1.1) {
        depositTo(w, j.dst, j.item, dt);
        if (count(w, j.item) === 0 || isFull(j.dst, j.item)) j.phase = 'done';
      }
    }
  }
  if (j.phase === 'done') { if (j.plant && j.plant.res === w) j.plant.res = null; w.job = null; }
}

// waiter: take dishes from the kitchen to the tables that ordered them
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
    if (go(w, ax, az, dt, sp) || (dist2(w.p.root.position, tg.t.x, tg.t.z) < 1.75 && inRest(w.p.root.position.x, w.p.root.position.z))) {
      w.xfer -= dt;
      if (w.xfer <= 0) { w.xfer = 0.15; giveDish(w, tg.t, tg.s); w.tg = null; }
    }
    return;
  }
  // empty handed: choose the dish most wanted that can be fetched, and claim those seats
  if (!w.job) {
    let bestType = null, bestN = 0;
    for (const type of DISHES) {
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
// what a shopper wants from a cooler: something on it if possible, otherwise anything the harbour can make
function shopperWant(sh) {
  const stocked = sh.items.filter((t) => binCount(sh.bin, t) > 0);
  if (stocked.length && Math.random() < 0.85) return pick(stocked);
  const can = sh.items.filter((t) => producible(t) && RARITY[t] !== 4);
  return can.length ? pick(can) : null;
}
function spawnCustomer() {
  const shelves = listOf('shelf').filter((s) => s.items.some((t) => binCount(s.bin, t) > 0 || producible(t)));
  if (!shelves.length) return null;
  const sh = pick(shelves), item = shopperWant(sh);
  if (!item) return null;
  const p = K.person(customerLook());
  p.root.position.set(SPAWN[0], 0, SPAWN[1]); scene.add(p.root);
  const big = ITEMS[item].price >= 40;
  const need = big ? 1 : 1 + Math.floor(Math.random() * Math.min(4, 1 + shelves.length));
  const c = { p, shelf: sh, item, need, got: 0, st: 'in', path: [], t: 0, face: 0, moving: 0, qi: 99 };
  setGoal(c, sh.front.x + rand(-0.75, 0.75), sh.front.z + rand(0.2, 1.1));
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
  const shelfN = listOf('shelf').length;
  if (shelfN && COUNTERS[0].on) {
    spawnT -= dt * crowd();
    const maxC = Math.min(12, 3 + Math.round(shelfN * 1.5));
    if (spawnT <= 0 && customers.length < maxC) { spawnCustomer(); spawnT = Math.max(1.4, 7 - shelfN * 0.7) * (0.7 + Math.random() * 0.6); }
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
      if (c.t <= 0 && binCount(c.shelf.bin, c.item) > 0 && c.got < c.need) {
        c.t = 0.35; binTake(c.shelf.bin, c.item); c.got++;
        fly(c.item, V3(c.shelf.def.pos[0], 0.8, c.shelf.def.pos[1]), (o) => { o.copy(c.p.root.position); o.y = 1.2; }, 0.25, null);
      }
      if (c.patience <= 0 && c.got < c.need) {
        if (c.got > 0) c.need = c.got;
        else { leaveShop(c); floatText('😞', V3(c.p.root.position.x, 2.2, c.p.root.position.z)); }
      }
      if (c.st === 'shop' && c.got >= c.need) {
        c.st = 'toQueue'; c.qi = 99;
        setGoal(c, 2.4, -8.5);
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
  setGoal(c, SPAWN[0], SPAWN[1] + 1);
}
function pay(c) {
  const unit = Math.round(ITEMS[c.item].price * upVal('price'));
  const v = unit * c.got + (pets.cat ? 1 : 0);
  recBest(c.item, unit);
  const k = COUNTERS[0]; stats.sales++; stats.sold[c.item] = (stats.sold[c.item] || 0) + c.got;
  k.pile.value += v; setPile(k); sfx('coin');
  floatText('+' + v, V3(k.pile.x, 1.6, k.pile.z), 'money');
  const bag = new THREE.Group(); K.add(bag, K.mesh(G.rbox(0.36, 0.38, 0.24, 0.06), '#cfe9ff'), 0, 0.1, 0); c.p.front.add(bag);
  leaveShop(c);
}

// ---------- restaurant diners ----------
const diners = [];
let dinerT = 4;
function menu() { const m = []; for (const s of listOf('machine')) if (DISHES.includes(s.def.out)) m.push(s.def.out); return m; }
function pickDish(mn) { let sum = 0; for (const d of mn) sum += DISH_W[d]; let r = Math.random() * sum; for (const d of mn) { r -= DISH_W[d]; if (r <= 0) return d; } return mn[0]; }
function spawnGroup(t) {
  const mn = menu(), n = Math.random() < 0.55 ? 2 : 1;
  t.st = 'coming'; t.arrived = 0; t.size = n; t.patience = 90;
  const order = [0, 1].sort(() => Math.random() - 0.5).slice(0, n);
  for (const si of order) {
    const s = t.seats[si];
    const look = customerLook(), p = K.person(look);
    p.root.position.set(D_SPAWN[0] - 0.4 + Math.random() * 0.8, 0, D_SPAWN[1] + Math.random() * 1.5);
    scene.add(p.root);
    const d = { p, look, legs: legsOf(p), t, s, st: 'in', face: 0, moving: 0, path: [] };
    setGoal(d, s.wx, s.wz, true);
    s.diner = d; s.dish = pickDish(mn); s.got = false; s.claim = null;
    diners.push(d);
  }
}
function leaveTable(d) {
  const at = d.p.root.position.clone(), ry = d.p.root.rotation.y;
  scene.remove(d.p.root); d.p = K.person(d.look); d.p.root.position.set(at.x, 0.12, at.z); d.p.root.rotation.y = ry; scene.add(d.p.root);
  d.st = 'leave';
  setGoal(d, D_SPAWN[0], D_SPAWN[1] + 1.5);
  d.s.diner = null;
}
function updateDiners(dt, T) {
  const mn = menu();
  if (rest.ready && mn.length) {
    const free = tables.filter((t) => t.st === 'free');
    if (free.length) {
      dinerT -= dt * crowd() * (events.tour > 0 ? 0.75 : 1);
      if (dinerT <= 0) { spawnGroup(pick(free)); dinerT = Math.max(2.6, 11 - tables.length * 1.0) * rand(0.7, 1.3); }
    }
  }
  for (let i = diners.length - 1; i >= 0; i--) {
    const d = diners[i];
    d.moving = 0;
    if (d.st === 'in') {
      if (stepPath(d, dt, 2.7)) {
        d.st = 'sit'; d.face = d.s.face; d.t.arrived++; d.p.root.position.set(d.s.wx, 0.18, d.s.wz); d.p.root.rotation.y = d.face;
        d.p.anim(1, 0); sitPose(d.p); for (const a of d.p.arms) a.rotation.x = -0.7;
        K.bakeStatic(d.p.rig);
      }
    } else if (d.st === 'leave') {
      if (stepPath(d, dt, 2.8)) { scene.remove(d.p.root); diners.splice(i, 1); continue; }
    }
    if (d.st !== 'sit') d.p.root.position.y = inRest(d.p.root.position.x, d.p.root.position.z) ? 0.12 : 0;
    if (d.st !== 'sit') { turn(d.p, d.face, dt); d.p.anim(dt, d.moving); }
    if (d.st === 'sit') d.p.rig.rotation.x = d.t.st === 'eat' ? 0.1 + Math.abs(Math.sin(T * 6 + i)) * 0.12 : 0;
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
    if (s.vis[s.dish] && s.vis[s.dish].visible) { v += ITEMS[s.dish].price; stats.dish[s.dish] = (stats.dish[s.dish] || 0) + 1; s.vis[s.dish].visible = false; s.vis.plate.visible = true; plates++; }
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
const ORDER_OK = ['fish', 'sardine', 'mackerel', 'shrimp', 'crab', 'squid', 'salmon', 'tuna', 'seaweed', 'iced', 'can', 'crabcan', 'dried', 'sashimi', ...DISHES];
function sellables() { return ORDER_OK.filter((t) => producible(t) && !(t === 'tuna' && !isBuilt('pier3'))); }
function makeOrder(types, lo, hi) {
  const items = sellables(), order = {};
  for (let i = 0; i < types && items.length; i++) { const it = pick(items); const big = ITEMS[it].price >= 40 ? 0.4 : 1; order[it] = (order[it] || 0) + Math.max(1, Math.round(rand(lo, hi) * big)); }
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
    cruise.ship = P3.cruiseShip(); K.bakeStatic(cruise.ship); cruise.ship.position.set(34, 0, 85); cruise.ship.visible = false; scene.add(cruise.ship);
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
    const late = state.built.length > 40;
    cruise.order = makeOrder(3, late ? 6 : 4, late ? 12 : 8); cruise.value = orderValue(cruise.order, 6) + 300;
    cruise.st = 'come'; sh.visible = true; sh.position.set(34, 0, 85); sh.rotation.y = Math.atan2(17.7, 53.5);
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
  // leave the way it came: swing out to sea, then away south past the fish farm
  if (cruise.st === 'leave' && !cruise.leg && sail(25, 45, 6)) cruise.leg = true;
  else if (cruise.st === 'leave' && cruise.leg && sail(40, 95, 9)) { cruise.leg = false; cruise.st = 'away'; cruise.t = rand(150, 220); sh.visible = false; }
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
function logCard(t) {
  const L = state.log[t];
  const r = '<span class="rar r' + RARITY[t] + '">' + RAR_NAME[RARITY[t]] + '</span>';
  if (!L || !L.n) return '<div class="lcard unk">' + ICON_SIL[t] + '<b>？？？</b>' + r + '<small>尚未捕獲</small></div>';
  return '<div class="lcard">' + ICON_BIG[t] + '<b>' + ITEMS[t].name + '</b>' + r + '<small>捕獲 ' + L.n + (['shrimp', 'crab', 'squid', 'octopus', 'lobster'].includes(t) ? ' 隻' : ' 條') + '</small><small>最高售價 ' + (L.b ? '$' + fmtMoney(L.b) : '—') + '</small></div>';
}
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
        body.insertAdjacentHTML('beforeend', '<div class="chips staff">' + [['cashier', '收銀員'], ['fisher', '漁夫'], ['shelver', '理貨員'], ['waiter', '服務生'], ['washer', '洗碗工']].map(([r, nm]) => '<span class="chip">' + nm + ' ×' + n(r) + '</span>').join('') + (stations.anglerPier ? '<span class="chip">釣魚員 ×' + lvlOf('anglerPier') + '</span>' : '') + '</div>');
        for (const role in HIRE) {
          if (!roleOpen(role)) continue;
          const h = HIRE[role], cost = hireCost(role), max = cost === null;
          const extra = role === 'angler' ? '最多 ' + GROW.anglerPier.max + ' 位' : '已多請 ' + (state.extra[role] || 0) + '/' + HIRE_MAX + ' 位';
          const row = document.createElement('div'); row.className = 'row';
          row.innerHTML = '<span class="ricon">' + ICON[h.ic] + '</span><div class="rmid"><b>多請一位' + h.name + '</b><small>目前 ' + roleCount(role) + ' 位 · ' + extra + '</small></div>';
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
    $('pTitle').textContent = '魚獲圖鑑';
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
    h += '<div class="sec">魚市場</div>';
    const sh = listOf('shelf');
    h += sh.length ? sh.map((s) => '<div class="chips"><span class="chip">' + s.def.name + ' ' + s.bin.list.length + '/' + upVal('shelfCap') + '</span>' + s.items.map((t) => '<span class="chip">' + ICON[t] + binCount(s.bin, t) + '</span>').join('') + '</div>').join('') : '<div class="empty">還沒有貨架</div>';
    const bs = binStations();
    if (bs.length) h += '<div class="sec">漁獲箱</div>' + bs.map((s) => '<div class="chips"><span class="chip">' + s.def.name + ' ' + s.bin.list.length + '/' + s.bin.max + '</span>' + chipsOf(cntList(s.bin.list)) + '</div>').join('');
    if (stations.warehouse) h += '<div class="sec">倉庫 ' + storeTotal() + '/' + STORE_CAP + '</div><div class="chips">' + chipsOf(state.store) + '</div>';
    h += '<div class="sec">加工機器</div><div class="chips">';
    for (const s of listOf('machine')) h += '<span class="chip">' + s.def.name + ' ' + ICON[s.def.in] + s.inN + (s.def.in2 ? ' ' + ICON[s.def.in2] + s.inN2 : '') + ' → ' + ICON[s.def.out] + s.outN + '</span>';
    if (tables.length) {
      const busy = tables.filter((t) => t.st === 'wait' || t.st === 'eat' || t.st === 'coming').length, dirty = tables.filter((t) => t.st === 'dirty').length;
      h += '</div><div class="sec">餐廳</div><div class="chips"><span class="chip">餐桌 ' + tables.length + '</span><span class="chip">用餐中 ' + busy + '</span><span class="chip">待清理 ' + dirty + '</span>';
    }
    h += '</div><div class="sec">進度</div><div class="chips"><span class="chip">已解鎖 ' + state.built.length + '/' + DEFS.length + '</span><span class="chip">總收入 ' + ICON.money + fmtMoney(state.earned) + '</span></div>';
    body.innerHTML = h;
  } else if (kind === 'map') {
    $('pTitle').textContent = '地圖';
    const m = mapsGet();
    body.innerHTML = '<a class="mapcard" href="./index.html"><span class="mi" style="background:#c9f0a8">🌾</span><div><b>開心農場</b><small>回到農場</small></div></a>' +
      '<div class="mapcard here"><span class="mi" style="background:#bfe9ff">⚓</span><div><b>海邊漁港</b><small>你現在在這裡</small></div></div>' +
      (m.forest ? '<a class="mapcard" href="./forest.html"><span class="mi" style="background:#cdeec0">🌲</span><div><b>森林小鎮</b><small>伐木、家具、蓋小鎮</small></div></a>'
        : '<div class="mapcard locked"><span class="mi" style="background:#e8e2d6">🌲</span><div><b>森林小鎮</b><small>點亮燈塔、漁港總收入 $150,000 後開放</small></div></div>') +
      (m.cafe ? '<a class="mapcard" href="./cafe.html"><span class="mi" style="background:#f3dcc0">☕</span><div><b>山城咖啡館</b><small>咖啡園、烘豆、咖啡館</small></div></a>'
        : '<div class="mapcard locked"><span class="mi" style="background:#e8e2d6">☕</span><div><b>山城咖啡館</b><small>在森林小鎮開分店後開放</small></div></div>');
    body.querySelectorAll('a.mapcard').forEach((a) => a.addEventListener('click', () => save()));
  } else if (kind === 'set') {
    $('pTitle').textContent = '設定';
    body.innerHTML = '<div class="row"><span class="ricon">🔊</span><div class="rmid"><b>聲音</b></div><button class="buy" id="sSnd">' + (state.sound ? '開' : '關') + '</button></div>' +
      '<div class="row"><span class="ricon">🔄</span><div class="rmid"><b>重新開始</b><small>清除漁港的所有進度</small></div><button class="buy poor" id="sReset">重新開始</button></div>';
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
      if (player.xfer2 <= 0 && dist2(pp, s.outPt.x, s.outPt.z) < 1.5 && s.outN > 0 && room(player) > 0) { player.xfer2 = 0.08; s.outN--; sfx('pop'); takeInto(player, s.def.out, V3(s.outPt.x, 0.4, s.outPt.z)); }
    } else if (s.bin && BIN_KINDS.includes(s.kind)) {
      if (player.xfer2 <= 0 && dist2(pp, s.outPt.x, s.outPt.z) < 1.7 && s.bin.list.length && room(player) > 0) {
        // take what can be used now first; anything once the crate is nearly full
        let t = null;
        for (let i = s.bin.list.length - 1; i >= 0 && !t; i--) if (usable(s.bin.list[i])) t = s.bin.list[i];
        if (!t && s.bin.list.length >= s.bin.max * 0.8) t = s.bin.list[s.bin.list.length - 1];
        if (t) { player.xfer2 = 0.08; binTake(s.bin, t); sfx('pop'); takeInto(player, t, V3(s.outPt.x, 0.4, s.outPt.z)); }
      }
    } else if (s.kind === 'shelf' && dist2(pp, s.front.x, s.front.z - 0.6) < 1.7) {
      for (const t of s.items) if (count(player, t) > 0) { depositTo(player, s, t, dt); break; }
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

// ---------- catch methods ----------
function tripCatch(kind) {
  const c = upVal('catch') * (events.contest > 0 ? 2 : 1);
  const n = kind === 'trawl' ? c * 3 : kind === 'deep' ? Math.max(2, Math.round(c * 0.6)) : c;
  const out = []; for (let i = 0; i < n; i++) out.push(roll(CATCH[kind]));
  return out;
}
function updateBoats(s, dt, T) {
  const n = lvlOf(s.id), kind = s.def.boat;
  const trip = upVal('boat') * (kind === 'trawl' ? 1.15 : kind === 'deep' ? 2 : 1) * (isBuilt('lighthouse') ? 0.7 : 1), far = 30, speed = far / (trip * 0.35);
  s.boats.forEach((b, i) => {
    if (i >= n) return;
    b.t += dt;
    if (b.st === 'dock') {
      b.x = b.mx; b.g.rotation.y = Math.PI;
      if (b.cargo.length) {
        b.ut = (b.ut || 0) - dt;
        if (b.ut <= 0 && binRoom(s.bin) > 0) {
          b.ut = kind === 'trawl' ? 0.09 : 0.14;
          landCatch(s, b.cargo.pop(), V3(b.x - 0.6, 0.8, b.mz));
          if (!b.cargo.length) { b.catchBox.visible = false; b.t = 0; }
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
      if (b.t > trip * 0.3) { b.st = 'back'; b.cargo = tripCatch(kind); b.catchBox.visible = true; }
    } else if (b.st === 'back') {
      b.g.rotation.y = Math.PI; b.x -= speed * dt;
      if (b.x <= b.mx) { b.x = b.mx; b.st = 'dock'; b.t = 0; b.ut = 0.4; if (!simming && dist2(player.p.root.position, b.mx, b.mz) < 14) sfx('splash'); }
    }
    b.g.position.set(b.x, Math.sin(T * 2 + i * 1.7) * 0.04, b.mz);
    b.b.rotation.x = Math.sin(T * 1.6 + i) * 0.04; b.b.rotation.z = Math.sin(T * 1.3 + i * 2) * 0.03;
    b.flag.visible = events.contest > 0;
  });
}
function updateAnglers(s, dt, T) {
  const iv = upVal('angler'), luck = upVal('luck');
  s.anglers.forEach((a, i) => {
    if (!a.on) return;
    a.t += dt * (events.contest > 0 ? 2 : 1);
    a.jerk = Math.max(0, a.jerk - dt * 2.5);
    a.r.pole.rotation.x = 0.9 - a.jerk * 0.6;
    a.r.bob.position.y = Math.sin(T * 3 + i) * 0.03 - (a.t > a.next - 0.8 ? 0.06 : 0);
    if (a.t >= a.next && binRoom(s.bin) > 0) {
      a.t = 0; a.next = iv * rand(0.75, 1.25); a.jerk = 1;
      const from = a.r.bob.getWorldPosition(new THREE.Vector3()); from.y = 0.4;
      landCatch(s, roll(CATCH.angler, luck), from, 0.75);
      if (!simming) puff(from.x, 0.2, from.z, '#dffbff', 4, 0.5);
    }
  });
}
function updateTraps(s, dt, T) {
  const ripeT = upVal('trap'), b = s.tboat, cages = s.cages.filter((c) => c.on);
  for (const c of cages) if (!c.ripe) { c.t += dt; if (c.t >= ripeT) c.ripe = true; }
  const goTo = (x, z, sp) => { const dx = x - b.x, dz = z - b.z, d = Math.hypot(dx, dz); if (d < 0.05) return true; const st = Math.min(d, sp * dt); b.x += dx / d * st; b.z += dz / d * st; b.face = Math.atan2(dx, dz) - Math.PI / 2; return false; };
  if (b.st === 'home') {
    b.t += dt;
    const ripe = cages.filter((c) => c.ripe && !c.res);
    if (ripe.length && b.t > 0.6) { ripe.sort((p, q) => Math.hypot(p.x - b.x, p.z - b.z) - Math.hypot(q.x - b.x, q.z - b.z)); b.cage = ripe[0]; b.cage.res = true; b.st = 'go'; }
  } else if (b.st === 'go') {
    if (goTo(b.cage.x - 0.9, b.cage.z + 0.2, 3.4)) { b.st = 'haul'; b.t = 0; }
  } else if (b.st === 'haul') {
    b.t += dt;
    const k = b.t < 0.7 ? b.t / 0.7 : b.t < 1.5 ? 1 : Math.max(0, 1 - (b.t - 1.5) / 0.6);
    b.cage.cage.position.y = -0.9 + k * 1.25;
    if (b.t >= 0.7 && !b.cage.hauled) {
      b.cage.hauled = true;
      const n = b.cage.kind === 'lobster' ? 1 + (Math.random() < 0.5 ? 1 : 0) : 2 + (Math.random() < 0.4 ? 1 : 0);
      for (let i = 0; i < n; i++) b.hold.push(roll(CATCH[b.cage.kind]));
      if (!simming) puff(b.cage.x, 0.3, b.cage.z, '#dffbff', 6, 0.6);
    }
    if (b.t >= 2.1) {
      const c = b.cage; c.ripe = false; c.t = 0; c.res = false; c.hauled = false; c.cage.position.y = -0.9;
      const more = cages.filter((q) => q.ripe && !q.res);
      if (b.hold.length < 6 && more.length) { b.cage = more[0]; b.cage.res = true; b.st = 'go'; } else b.st = 'back';
    }
  } else if (b.st === 'back') {
    if (goTo(b.home[0], b.home[1], 3.4)) { b.st = 'unload'; b.t = 0; }
  } else if (b.st === 'unload') {
    b.t -= dt;
    if (!b.hold.length) { b.st = 'home'; b.t = 0; }
    else if (b.t <= 0 && binRoom(s.bin) > 0) { b.t = 0.18; landCatch(s, b.hold.pop(), V3(b.x, 0.7, b.z)); }
  }
  b.g.position.set(b.x, Math.sin(T * 2.2) * 0.03, b.z);
  let diff = b.face - b.g.rotation.y; while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
  b.g.rotation.y += diff * Math.min(1, dt * 5);
  for (const c of s.cages) if (c.on) c.g.position.y = Math.sin(T * 1.7 + c.x) * 0.03;
}
function updateAqua(s, dt, T) {
  const iv = upVal('aquaT');
  s.pens.forEach((pn) => {
    if (!pn.on) return;
    pn.t += dt;
    if (pn.t >= iv && binRoom(s.bin) > 0) { pn.t = 0; landCatch(s, pn.sp, V3(pn.x, 0.6, pn.z), 0.9); }
    if (simming) return;
    pn.jt -= dt;
    if (pn.jt <= 0 && pn.ja <= 0) { pn.ja = 1; pn.jt = rand(2, 5); pn.jx = rand(-0.6, 0.6); pn.jz = rand(-0.6, 0.6); }
    if (pn.ja > 0) {
      pn.ja = Math.max(0, pn.ja - dt * 1.6); const k = 1 - pn.ja;
      pn.jump.visible = pn.ja > 0; pn.jump.position.set(pn.jx + k * 0.5, Math.sin(k * Math.PI) * 0.9, pn.jz); pn.jump.rotation.z = (k - 0.5) * 2;
      if (pn.ja === 0) puff(pn.x + pn.jx + 0.5, 0.1, pn.z + pn.jz, '#dffbff', 4, 0.4);
    }
  });
  if (s.feeder) {
    const f = s.feeder; f.anim(dt, 0);
    f.arms[1].rotation.x = -1.4 + Math.max(0, Math.sin(T * 2.2)) * 1.2;
    if (!simming && Math.sin(T * 2.2) > 0.98 && Math.random() < 0.3) puff(15.9, 0.6, AQUA_Z, '#c9a27a', 3, 0.5);
  }
}

// ---------- simulation ----------
function updateWorld(dt, T) {
  const growK = upVal('grow');
  const cap = upVal('shelfCap');
  for (const s of Object.values(stations)) {
    if (s.kind === 'pier') updateBoats(s, dt, T);
    else if (s.kind === 'angler') updateAnglers(s, dt, T);
    else if (s.kind === 'traps') updateTraps(s, dt, T);
    else if (s.kind === 'aqua') updateAqua(s, dt, T);
    if (s.bin && BIN_KINDS.includes(s.kind)) { binRender(s.bin); setLabel(s.outLabel, binLabel(s.bin)); }
    if (s.kind === 'machine') {
      const iv = s.def.iv / upVal('mach');
      const busy = s.inN > 0 && (!s.def.in2 || s.inN2 > 0) && s.outN < s.outMax;
      if (busy) {
        s.timer += dt;
        if (s.timer >= iv) { s.timer = 0; s.inN--; if (s.def.in2) s.inN2--; s.outN++; puff(s.outPt.x, 0.5, s.outPt.z, s.def.mk === 'grill' || s.def.mk === 'squid' ? '#c9c9c9' : '#fff4c9', 3, 0.4); }
      }
      const ax = s.spin.userData.axis, sp = s.spin;
      if (ax === 'z') sp.rotation.z += dt * (busy ? 6 : 0);
      else if (ax === 'sway') sp.rotation.z = Math.sin(T * 2) * (busy ? 0.08 : 0.03);
      else if (ax === 'flip') { sp.rotation.x = busy ? Math.max(0, Math.sin(T * 4)) * 0.6 : 0; sp.position.y = 0.84 + (busy ? Math.max(0, Math.sin(T * 4)) * 0.12 : 0); }
      else if (ax === 'flip2') sp.rotation.x = busy ? Math.sin(T * 3) * 0.5 : 0;
      else if (ax === 'chop') sp.rotation.z = busy ? Math.abs(Math.sin(T * 12)) * 0.5 : 0;
      else if (ax === 'dip') { sp.userData.y0 = sp.userData.y0 ?? sp.position.y; sp.position.y = sp.userData.y0 + (busy ? Math.abs(Math.sin(T * 4)) * 0.12 : 0); }
      else sp.rotation.y += dt * (busy ? 7 : 0);
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
      while (s.bin.list.length > cap) binTake(s.bin);
      binRender(s.bin);
      const cnt = {}; for (const t of s.bin.list) cnt[t] = (cnt[t] || 0) + 1;
      const shown = s.items.filter((t) => cnt[t]);
      setLabel(s.label, (shown.length ? shown : s.items.slice(0, 1)).map((t) => '<span>' + ICON[t] + (cnt[t] || 0) + '</span>').join('') + (s.items.length > 1 ? '<span class="tot">' + s.bin.list.length + '/' + cap + '</span>' : '<span class="tot">/' + cap + '</span>'));
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
  pos.x = Math.max(-39.6, Math.min(12.9, pos.x)); pos.z = Math.max(-17.0, Math.min(34.0, pos.z));
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
for (const def of DEFS) if (isBuilt(def.id)) build(def, true);
for (const role in state.extra) if (HIRE[role] && HIRE[role].home && roleOpen(role)) for (let i = 0; i < Math.min(HIRE_MAX, state.extra[role]); i++) makeWorker(role, HIRE[role].home, false);
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
  updateGuide(dt);
  // the 森林小鎮 branch zone shows up once earnings are high enough (earnings grow without builds)
  gateT -= dt; if (gateT <= 0) { gateT = 2; if (!zones.forestGate && !isBuilt('forestGate') && isBuilt('lighthouse') && state.earned >= DEF.forestGate.earned) refreshZones(); }
  updateDoorsAndLights(dt);
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('on'); }
}
requestAnimationFrame(frame);
addEventListener('visibilitychange', () => { if (document.hidden) save(); });
addEventListener('pagehide', save);

// test hooks
window.__harbor = {
  state, stations, player, zones, customers, diners, tables, workers, cruise, events, DEFS, COUNTERS, sink, stats, colliders, SPECIES, LOG_PAGES,
  give(type, n) { for (let i = 0; i < n && room(player) > 0; i++) stackAdd(player, type); },
  cash(n) { state.money += n; updateMoney(); },
  tp(x, z) { player.p.root.position.set(x, 0, z); updateCamera(0, true); },
  build(id) { if (zones[id]) killZone(id); if (!stations[id]) build(DEF[id]); },
  sim(sec, quiet = true) { simming = quiet; try { for (let i = 0; i < sec * 30; i++) step(1 / 30); } finally { simming = false; } },
  // like sim, but after every frame checks that no worker / shopper / walking diner stands inside a collider box
  simCheck(sec) {
    const r = { frames: 0, samples: 0, intrusions: 0, examples: [] };
    simming = true;
    try {
      for (let i = 0; i < sec * 30; i++) {
        step(1 / 30); r.frames++;
        const who = [...workers.map((w) => ['worker:' + w.role, w.p.root.position]), ...customers.map((c) => ['customer', c.p.root.position]), ...diners.map((d) => ['diner', d.p.root.position])];
        for (const [k, pos] of who) { r.samples++; const b = insideBox(pos.x, pos.z); if (b) { r.intrusions++; if (r.examples.length < 8) r.examples.push(k + ' ' + pos.x.toFixed(2) + ',' + pos.z.toFixed(2) + ' in [' + [b.x0, b.z0, b.x1, b.z1].map((v) => v.toFixed(2)).join(',') + ']'); } }
      }
    } finally { simming = false; }
    return r;
  },
  hire: (role) => hireExtra(role),
  guideIds: () => guideTargets().ids,
  guideInfo: () => { const g = guideTargets(); return g.ids.join('+') + (g.two ? ' (二選一)' : ''); },
  firstSource: () => { const s = Object.values(stations).find((x) => x.bin && x.kind === 'pier') || stations.seaweed; return s.outPt ? [s.outPt.x - 1.2, s.outPt.z] : [s.plants[0].x, s.plants[0].z + 0.3]; },
  calls: () => renderer.info.render.calls,
  open: (k) => openPanel(k),
  lineup(x, z, list) { (list || Object.keys(ITEMS)).forEach((t, i) => { const m = itemMesh(t); m.scale.setScalar(2.2); m.position.set(x + (i % 5) * 1.3, 0, z + Math.floor(i / 5) * 1.4); scene.add(m); }); },
};
