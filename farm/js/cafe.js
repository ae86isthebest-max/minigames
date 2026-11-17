// 山城咖啡館 — map 2 of 開心農場鋪. Coffee terraces and a dairy shed feed a processing yard (sun drying, washing,
// roasting with a timing bonus, grinding, milk foam, oat milk, cocoa, syrup, ice and a bakery); beans and goods sell
// in the market, drinks and desserts are made at espresso bars and served in the café.
// Same style kit, controls and UI as the farm and the other branches (logic adapted from harbor.js).
import * as THREE from 'three';
import * as K from './kit.js';
import * as P from './props.js';
import * as P2 from './props2.js';
import * as P3 from './props3.js';
import * as P5 from './props5.js';
import * as P6 from './props6.js';
import { Joystick } from './input.js';
import { createNav } from './nav.js';
import './update.js';

const { C, G } = K;
const ITEMS = { ...P6.ITEMS6 };
const itemMesh = P6.itemMesh;
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
// The café is a branch opened from the farm (the farm writes {cafe: true} to 'farm_maps_v1'); the café opens the harbour.
// ?test / ?fresh skip this for testing.
{
  let open = false;
  try { open = JSON.parse(localStorage.getItem('farm_maps_v1') || '{}').cafe === true; } catch (e) { /* storage off */ }
  open = false; // 11-17: closed for now, every visit goes back to the farm
  if (!open && !params.has('test') && !params.has('fresh')) { location.replace('index.html'); throw new Error('café not unlocked yet: back to the farm'); }
}
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const dist2 = (a, x, z) => Math.hypot(a.x - x, a.z - z);
const easeBack = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const r10 = (v) => Math.round(v / 10) * 10;

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
const crateSlots = () => { const s = []; for (let i = 0; i < 45; i++) s.push({ p: V3(-0.48 + (i % 5) * 0.24, 0.31 + Math.floor(i / 10) * 0.11, -0.2 + (Math.floor(i / 5) % 2) * 0.4), ry: Math.PI / 2 + ((i * 0.7) % 0.5) - 0.25, s: 0.85 }); return s; };

// ---------- layout ----------
const SH_Z = -14.6, MID_Z = -11.2;
// 咖啡屋擴建: the back wall moves from z -17.6 to DEPT_Z (the 烘豆工坊 hall). SH_Z / MID_Z / NEW_Z only name the old rows in
// DEFS; where every display really stands is SHELF_AT below.
const DEPT_Z = -32.4, NEW_Z = -27.0;
const SHOP = { x0: -9.4, x1: 7.95, z0: -17.4, z1: -7.3 };
// 山城咖啡屋: the front room is a café with the coffee bar at the back, bistro tables in the middle and the goods on
// wooden wall shelves and glass pastry cases along the walls; the 咖啡屋擴建 adds the 烘豆工坊 hall behind it.
// [x, z, face]: the way a display opens (S towards the road, N towards the back, E towards +x, W towards -x)
const SHELF_AT = {
  shelfGround: [-7.6, -16.75, 'S'], shelfBean: [-5.0, -16.75, 'S'], shelfPantry: [-8.9, -13.2, 'E'], shelfDessert: [-8.9, -10.9, 'E'],
  shelfCherry: [7.45, -15.4, 'W'], shelfMilk: [7.45, -13.2, 'W'], shelfTake: [7.45, -11.0, 'W'], shelfRare: [0.85, -8.0, 'N'],
  shelfCherry3: [3.2, -8.0, 'N'], shelfMilk3: [-4.05, -8.0, 'N'],
  shelfGround2: [-7.6, -18.45, 'N'], shelfBean2: [-5.0, -18.45, 'N'],
  shelfMatcha: [-8.4, -31.75, 'S'], shelfMatcha2: [-6.0, -31.75, 'S'], shelfBerry: [-3.6, -31.75, 'S'], shelfBerry2: [-1.2, -31.75, 'S'],
  shelfWaffle: [1.2, -31.75, 'S'], shelfWaffle2: [3.6, -31.75, 'S'], shelfChoco: [6.0, -31.75, 'S'],
  shelfChoco2: [-8.9, -28.6, 'E'], shelfTea: [-8.9, -26.4, 'E'], shelfTea2: [-8.9, -24.2, 'E'], shelfPantry2: [-8.9, -22.0, 'E'],
  shelfCherry2: [7.45, -19.8, 'W'], shelfMilk2: [7.45, -22.0, 'W'], shelfTake2: [7.45, -24.2, 'W'], shelfDessert2: [7.45, -26.4, 'W'], shelfRare2: [7.45, -28.6, 'W'],
  shelfBean3: [-4.7, -25.05, 'S'], shelfGround3: [-2.9, -25.05, 'S'], shelfPantry3: [-4.7, -26.05, 'N'], shelfDessert3: [-2.9, -26.05, 'N'],
  shelfTake3: [3.8, -25.05, 'S'], shelfRare3: [3.8, -26.05, 'N'],
};
const FACE = { S: [0, 1, 0], N: [0, -1, Math.PI], E: [1, 0, Math.PI / 2], W: [-1, 0, -Math.PI / 2] };
// the café's entrances on the front (z -7.3): the wide main door, a cheap 2nd one early and a 3rd one later
const DOORS = [{ id: null, x: 5.9, w: 2.8 }, { id: 'door2', x: -1.4, w: 2.2 }, { id: 'door3', x: -6.7, w: 2.2 }];
for (const D of DOORS) Object.assign(D, { in: [D.x, -8.6], out: [D.x, -6.0], d: null, k: 0 });
const SPAWN_W = [-12.6, -4.6];   // shoppers also come down the hill road from the west
const ROAD_Z = -4.6;   // shoppers walk along the middle of the road (2.7 from the front wall) and turn up to their door
const R0 = -23.6, WING_X0 = -40;
const REST = { x0: R0, x1: -11.2, z0: -20.8, z1: -6 };
const RB = -20.6;   // the café's back wall (deep enough for a 做更快 zone in front of every espresso bar)
const T_POS = [[-14.8, -8.7], [-18.0, -8.7], [-21.2, -8.7], [-14.8, -12.1], [-18.0, -12.1], [-21.2, -12.1], [-26.0, -8.7], [-29.4, -8.7], [-32.8, -8.7], [-26.0, -12.1], [-29.4, -12.1], [-32.8, -12.1]];
const SINK = { x: -12.4, z: -18.6 };
const SPAWN = [12.6, -4.9];   // shoppers walk in along the hill road from the east
const D_SPAWN = [-12.4, 12.5];   // café guests come up the stone path from the south-west
const KITCHEN_Z = -18.4;   // espresso bars stand along the café's back wall
const DELIVERY = { x: 10.4, z: -2.0 };   // 外送站 pad beside the road
const JUDGE = { x: -17.4, z: -3.4 };     // 咖啡比賽 desk in front of the café
const PHOTO = { x: -5.0, z: -2.0 };      // 網紅拍照牆 facing the road

// ---------- beans (with rarity), the drink recipe book and desserts ----------
const RARITY = { cherry: 0, robusta: 0, geisha: 2, bluemt: 2, civet: 4 };
const RAR_NAME = ['普通', '少見', '稀有', '珍稀', '傳說'];
const BEANS = ['cherry', 'robusta', 'geisha', 'bluemt', 'civet'];
const DRINKS = ['americano', 'espresso', 'latte', 'cappuccino', 'mocha', 'macchiato', 'oatlatte', 'colddrip', 'pourover', 'civetpour', 'seasonal'];
const DESSERTS = ['croissant', 'cheesecake', 'tiramisu'];
const LOG_PAGES = [
  { name: '咖啡豆', ids: BEANS, reward: 1500 },
  { name: '飲品配方本', ids: DRINKS, reward: 15000 },
  { name: '甜點', ids: DESSERTS, reward: 5000 },
];
const isLogged = (t) => BEANS.includes(t) || DRINKS.includes(t) || DESSERTS.includes(t);
const RAW = [...BEANS, 'milk', 'oat', 'cocoapod', 'vanilla', 'wheat', 'tealeaf', 'tencha', 'strawberry', 'egg'];
// a coffee cherry may turn out to be a rare bean (藝伎 / 藍山 from the arabica terrace, 麝香貓 from either)
function rollBean(field) {
  const luck = upVal('luck'), r = Math.random();
  if (r < 0.004 * luck * (field === 'robusta' ? 2.5 : 1)) return 'civet';
  if (field === 'cherry') { if (r < 0.03 * luck) return 'geisha'; if (r < 0.05 * luck) return 'bluemt'; }
  return field;
}
const DISHES = [...DRINKS, ...DESSERTS];
const DISH_W = { americano: 3, espresso: 2, latte: 3, cappuccino: 2.5, mocha: 2, macchiato: 2, oatlatte: 1.6, colddrip: 1.6, pourover: 0.8, civetpour: 0.15, seasonal: 1.4, croissant: 2, cheesecake: 1.4, tiramisu: 1.2 };
const SEASONS = ['南瓜拿鐵', '櫻花拿鐵', '薄荷摩卡', '楓糖拿鐵'];

// ---------- the unlock chain ----------
const kz = (x) => [x, KITCHEN_Z];
const DEFS = [
  { id: 'arabica', name: '阿拉比卡咖啡園', kind: 'crop', out: 'cherry', plant: 'coffee', grow: 6, pos: [10.0, 2.2], zone: [9.0, 5.0], cost: { money: 40 }, req: [], start: true },
  { id: 'cowShed', name: '乳牛棚', kind: 'producer', out: 'milk', pos: [3.4, 0.8], zone: [5.2, 4.6], cost: { money: 30 }, req: [], start: true },
  { id: 'shelfCherry', name: '咖啡櫻桃架', kind: 'shelf', items: ['cherry', 'robusta'], pos: [4.4, SH_Z], cost: { money: 10 }, req: ['arabica', 'counter'] },
  { id: 'shelfMilk', name: '鮮奶玻璃櫃', kind: 'shelf', fridge: true, items: ['milk'], pos: [1.4, SH_Z], cost: { money: 15 }, req: ['cowShed', 'counter'] },
  { id: 'counter', name: '點餐櫃台', kind: 'counter', zone: [2.9, -13.75], cost: { money: 0 }, any: ['arabica', 'cowShed'] },
  { id: 'cashier', name: '櫃台店員', kind: 'hire', role: 'cashier', counter: 0, zone: [2.9, -13.75], cost: { money: 80 }, req: ['counter'], any: ['shelfCherry', 'shelfMilk'] },
  { id: 'door2', name: '第二道門', kind: 'door', di: 1, desc: '多開一道門，客人進出不擠', zone: [-1.4, -6.0], cost: { money: 150 }, req: ['cashier'] },
  { id: 'dryer', name: '日曬場', kind: 'machine', mk: 'dryer', in: 'cherry', out: 'greenbean', iv: 3, pos: [5.0, 8.0], cost: { money: 200, cherry: 6 }, req: ['cashier', 'arabica'] },
  { id: 'shelfBean', name: '咖啡豆架', kind: 'shelf', items: ['greenbean', 'roasted'], pos: [-1.6, SH_Z], cost: { money: 160 }, req: ['dryer'] },
  { id: 'picker', name: '採豆工', kind: 'hire', role: 'picker', zone: [7.6, 5.4], cost: { money: 180 }, req: ['shelfBean'] },
  { id: 'cat', name: '店貓', kind: 'pet', zone: [-1.0, -11.0], cost: { money: 260, cherry: 10 }, req: ['picker'] },
  { id: 'roaster', name: '烘豆機', kind: 'machine', mk: 'roaster', in: 'greenbean', out: 'roasted', iv: 3.5, roast: true, pos: [-7.0, 8.0], cost: { money: 450 }, req: ['cat'] },
  { id: 'roasterMan', name: '烘豆師', kind: 'hire', role: 'roaster', zone: [-4.0, 5.6], cost: { money: 320 }, req: ['roaster'] },
  { id: 'warehouse', name: '倉庫', kind: 'store', pos: [11.2, -14.4], zone: [11.2, -10.6], cost: { money: 450 }, req: ['roasterMan'] },
  { id: 'counter2', name: '第二點餐櫃台', desc: '再開一條隊，客人分開排、結帳更快', kind: 'counterX', counter: 1, zone: [-1.2, -13.75], cost: { money: 1200 }, req: ['warehouse'] },
  { id: 'cashier2', name: '第二位櫃台店員', kind: 'hire', role: 'cashier', counter: 1, zone: [-1.2, -13.75], cost: { money: 600 }, req: ['counter2'] },
  { id: 'door3', name: '第三道門', kind: 'door', di: 2, desc: '再多一道門，進出更順', zone: [-6.7, -6.0], cost: { money: 1500 }, req: ['counter2'] },
  { id: 'grinder', name: '磨豆機', kind: 'machine', mk: 'grinder', in: 'roasted', out: 'ground', yield: 2, iv: 3, pos: [-7.0, 13.4], cost: { money: 550 }, req: ['warehouse'] },
  { id: 'shelfGround', name: '咖啡粉架', kind: 'shelf', items: ['ground'], pos: [-4.6, SH_Z], cost: { money: 480 }, req: ['grinder'] },
  { id: 'restaurant', name: '山城咖啡館', kind: 'restaurant', zone: [-12.4, -4.0], cost: { money: 1200, cherry: 15 }, req: ['shelfGround'] },
  { id: 'espressoBar', name: '義式咖啡機', kind: 'machine', mk: 'espresso', in: 'ground', outs: ['americano', 'espresso'], iv: 3, pos: kz(-15.0), cost: { money: 700, ground: 6 }, req: ['restaurant'] },
  { id: 'waiter', name: '外場', kind: 'hire', role: 'waiter', zone: [-13.2, -10.4], cost: { money: 850 }, req: ['espressoBar'] },
  { id: 'table2', name: '第 2 張桌子', kind: 'table', ti: 1, cost: { money: 600 }, req: ['waiter'] },
  { id: 'robusta', name: '羅布斯塔咖啡園', kind: 'crop', out: 'robusta', plant: 'robusta', grow: 6, pos: [10.0, 8.4], cost: { money: 1600 }, req: ['table2'] },
  { id: 'washTank', name: '水洗槽', kind: 'machine', mk: 'washer', in: 'robusta', out: 'greenbean', iv: 2.5, pos: [-1.0, 8.0], cost: { money: 1400, robusta: 10 }, req: ['robusta'] },
  { id: 'steamer', name: '奶泡機', kind: 'machine', mk: 'steamer', in: 'milk', out: 'foam', iv: 2.5, pos: [-1.0, 13.4], cost: { money: 1300, milk: 10 }, req: ['washTank', 'cowShed'] },
  { id: 'latteBar', name: '拿鐵吧', kind: 'machine', mk: 'latte', in: 'ground', in2: 'foam', outs: ['latte', 'cappuccino'], iv: 3.5, pos: kz(-18.4), cost: { money: 2200 }, req: ['steamer'] },
  { id: 'table3', name: '第 3 張桌子', kind: 'table', ti: 2, cost: { money: 1500 }, req: ['latteBar'] },
  { id: 'cupWasher', name: '洗杯工', kind: 'hire', role: 'washer', zone: [-13.2, -13.0], cost: { money: 1900 }, req: ['table3'] },
  { id: 'barista', name: '咖啡師', kind: 'hire', role: 'barista', zone: [-12.3, -7.7], cost: { money: 2400 }, req: ['cupWasher'] },
  { id: 'shelfTake', name: '外帶咖啡櫃', kind: 'shelf', fridge: true, items: ['americano', 'latte', 'colddrip'], pos: [-1.6, MID_Z], cost: { money: 2000 }, req: ['barista'] },
  { id: 'dept', name: '咖啡屋擴建', kind: 'dept', note: '後面多了烘豆工坊，可以擺更多展示架', zone: [-1.0, -11.0], cost: { money: 4000, cherry: 40 }, req: ['shelfTake'] },
  { id: 'counter3', name: '工坊點餐櫃台', desc: '烘豆工坊裡也能結帳，隊伍更短', kind: 'counterX', counter: 2, zone: [1.0, -22.4], cost: { money: 5000 }, req: ['dept', 'counter2'] },
  { id: 'cashier3', name: '工坊櫃台店員', kind: 'hire', role: 'cashier', counter: 2, zone: [1.0, -21.9], cost: { money: 2000 }, req: ['counter3'] },
  { id: 'warehouse2', name: '第二倉庫', kind: 'store', pos: [-14.5, 21.0], zone: [-14.5, 25.8], desc: '再一間倉庫，存貨更多，員工也會來拿', cost: { money: 6000 }, req: ['dept', 'warehouse'] },
  { id: 'cocoaGrove', name: '可可樹', kind: 'crop', out: 'cocoapod', plant: 'cocoa', grow: 8, pos: [10.0, 19.6], cost: { money: 2800 }, req: ['shelfTake'] },
  { id: 'cocoaMill', name: '可可研磨機', kind: 'machine', mk: 'cocoa', in: 'cocoapod', out: 'cocoa', iv: 3, pos: [-1.0, 18.8], cost: { money: 3200, cocoapod: 8 }, req: ['cocoaGrove'] },
  { id: 'mochaBar', name: '摩卡吧', kind: 'machine', mk: 'mocha', in: 'ground', in2: 'cocoa', out: 'mocha', iv: 3.5, pos: kz(-21.8), cost: { money: 3200 }, req: ['cocoaMill'] },
  { id: 'table4', name: '第 4 張桌子', kind: 'table', ti: 3, cost: { money: 3200 }, req: ['mochaBar'] },
  { id: 'waiter2', name: '外場', kind: 'hire', role: 'waiter', zone: [-22.5, -10.4], cost: { money: 3600 }, req: ['table4'] },
  { id: 'delivery', name: '外送站', kind: 'delivery', note: '會有外送大單', zone: [DELIVERY.x, DELIVERY.z], cost: { money: 6500 }, req: ['waiter2'] },
  { id: 'picker2', name: '採豆工', kind: 'hire', role: 'picker', zone: [7.6, 11.2], cost: { money: 4500 }, req: ['delivery'] },
  { id: 'restWing', name: '戶外露台', kind: 'wing', zone: [-30, -4.2], cost: { money: 7000 }, req: ['picker2'] },
  { id: 'vanilla', name: '香草園', kind: 'crop', out: 'vanilla', plant: 'vanilla', grow: 7, pos: [10.0, 25.2], cost: { money: 4200 }, req: ['restWing'] },
  { id: 'syrupPot', name: '糖漿鍋', kind: 'machine', mk: 'syrup', in: 'vanilla', out: 'syrup', iv: 3, pos: [-7.0, 18.8], cost: { money: 4200, vanilla: 10 }, req: ['vanilla'] },
  { id: 'macchiatoBar', name: '焦糖瑪奇朵吧', kind: 'machine', mk: 'macchiato', in: 'ground', in2: 'syrup', out: 'macchiato', iv: 3.5, pos: kz(-25.6), cost: { money: 5200 }, req: ['syrupPot'] },
  { id: 'table5', name: '第 5 張桌子', kind: 'table', ti: 4, cost: { money: 5500 }, req: ['macchiatoBar'] },
  { id: 'oatField', name: '燕麥田', kind: 'crop', out: 'oat', plant: 'oat', grow: 6, pos: [10.0, 14.0], cost: { money: 6000 }, req: ['table5'] },
  { id: 'oatMachine', name: '燕麥奶機', kind: 'machine', mk: 'oat', in: 'oat', out: 'oatmilk', iv: 3, pos: [5.0, 18.8], cost: { money: 6500, oat: 10 }, req: ['oatField'] },
  { id: 'oatBar', name: '燕麥拿鐵吧', kind: 'machine', mk: 'oatlatte', in: 'ground', in2: 'oatmilk', out: 'oatlatte', iv: 3.5, pos: kz(-29.0), cost: { money: 8000 }, req: ['oatMachine'] },
  { id: 'shelfPantry', name: '烘焙材料架', kind: 'shelf', items: ['oatmilk', 'cocoa', 'syrup'], pos: [-4.6, MID_Z], cost: { money: 6000 }, req: ['oatBar'] },
  { id: 'iceMaker', name: '製冰機', kind: 'machine', mk: 'ice', out: 'ice', iv: 2, pos: [5.0, 13.4], cost: { money: 8000 }, req: ['shelfPantry'] },
  { id: 'colddrip', name: '冰滴塔', kind: 'machine', mk: 'colddrip', in: 'ground', in2: 'ice', out: 'colddrip', iv: 4, pos: kz(-32.4), cost: { money: 9500 }, req: ['iceMaker'] },
  { id: 'table6', name: '第 6 張桌子', kind: 'table', ti: 5, cost: { money: 8500 }, req: ['colddrip'] },
  { id: 'wheat', name: '小麥田', kind: 'crop', out: 'wheat', plant: 'wheat', grow: 6, pos: [-7.0, 29.6], cost: { money: 9000 }, req: ['table6'] },
  { id: 'oven', name: '烘焙坊', kind: 'machine', mk: 'oven', in: 'wheat', in2: 'milk', outs: ['croissant', 'cheesecake'], iv: 4, pos: [-7.0, 24.2], cost: { money: 11000, wheat: 10 }, req: ['wheat'] },
  { id: 'baker', name: '烘焙師', kind: 'hire', role: 'baker', zone: [-4.0, 21.6], cost: { money: 9000 }, req: ['oven'] },
  { id: 'shelfDessert', name: '甜點玻璃櫃', kind: 'shelf', fridge: true, items: ['croissant', 'cheesecake', 'tiramisu'], pos: [-7.6, MID_Z], cost: { money: 10000 }, req: ['baker'] },
  { id: 'tiramisuBar', name: '提拉米蘇冷藏台', kind: 'machine', mk: 'tiramisu', in: 'ground', in2: 'milk', out: 'tiramisu', iv: 4.5, pos: [-1.0, 24.2], cost: { money: 14000 }, req: ['shelfDessert'] },
  { id: 'table8', name: '第 8 張桌子', kind: 'table', ti: 7, cost: { money: 10000 }, req: ['tiramisuBar'] },
  { id: 'judge', name: '咖啡比賽台', kind: 'judge', note: '評審會來比賽', zone: [JUDGE.x, JUDGE.z + 1.5], cost: { money: 15000 }, req: ['table8'] },
  { id: 'shelfRare', name: '精品豆櫃', kind: 'shelf', items: ['geisha', 'bluemt', 'civet'], pos: [-7.6, SH_Z], cost: { money: 12000 }, req: ['judge'] },
  { id: 'pourBar', name: '手沖台', kind: 'machine', mk: 'pour', inAny: ['geisha', 'bluemt', 'civet'], outs: ['pourover', 'civetpour'], iv: 5, pos: [5.0, 24.2], cost: { money: 18000 }, req: ['shelfRare'] },
  { id: 'table9', name: '第 9 張桌子', kind: 'table', ti: 8, cost: { money: 12000 }, req: ['pourBar'] },
  { id: 'seasonalBar', name: '季節吧', kind: 'machine', mk: 'seasonal', in: 'foam', in2: 'syrup', out: 'seasonal', iv: 4, pos: kz(-35.8), cost: { money: 16000 }, req: ['table9'] },
  { id: 'barista2', name: '咖啡師', kind: 'hire', role: 'barista', zone: [-12.3, -7.7], cost: { money: 12000 }, req: ['seasonalBar'] },
  { id: 'table10', name: '第 10 張桌子', kind: 'table', ti: 9, cost: { money: 16000 }, req: ['barista2'] },
  { id: 'picker3', name: '採豆工', kind: 'hire', role: 'picker', zone: [7.6, 16.6], cost: { money: 14000 }, req: ['table10'] },
  { id: 'table11', name: '第 11 張桌子', kind: 'table', ti: 10, cost: { money: 18000 }, req: ['picker3'] },
  { id: 'cupWasher2', name: '洗杯工', kind: 'hire', role: 'washer', zone: [-13.2, -13.0], cost: { money: 15000 }, req: ['table11'] },
  { id: 'table12', name: '第 12 張桌子', kind: 'table', ti: 11, cost: { money: 20000 }, req: ['cupWasher2'] },
  { id: 'photoWall', name: '網紅拍照牆', kind: 'photo', note: '網紅會來拍照', zone: [PHOTO.x - 2.6, PHOTO.z + 0.4], cost: { money: 25000 }, req: ['table12'] },
  { id: 'cafeStar', name: '山城之星招牌', kind: 'star', note: '客人變多了', zone: [-20.6, -4.4], cost: { money: 60000 }, req: ['photoWall'] },
  // ---------- 擴建：南坡新園區 — new land south of the yard: new crops and goods, and a second production line ----------
  { id: 'expand', name: '擴建：南坡新園區', kind: 'expand', nx: true, desc: '拆掉南邊的樹林，開出一大片新土地', zone: [2.0, 32.8], cost: { money: 25000 }, req: ['dept', 'table5'] },
  { id: 'teaGarden', name: '茶園', kind: 'crop', nx: true, out: 'tealeaf', plant: 'tea', grow: 7, pos: [10.0, 38.6], desc: '採茶葉，可以直接賣或做成紅茶', cost: { money: 12000 }, req: ['expand'] },
  { id: 'teaMachine', name: '紅茶機', kind: 'machine', nx: true, mk: 'tea', in: 'tealeaf', out: 'blacktea', iv: 3.5, pos: [5.0, 40.0], cost: { money: 18000, tealeaf: 10 }, req: ['teaGarden'] },
  { id: 'shelfTea', name: '茶葉櫃', kind: 'shelf', nx: true, items: ['blacktea', 'tealeaf'], pos: [4.4, NEW_Z], cost: { money: 15000 }, req: ['teaMachine'] },
  { id: 'cowShed2', name: '第二乳牛棚', kind: 'producer', nx: true, out: 'milk', pos: [-13.0, 40.4], zone: [-11.2, 44.2], desc: '再一個牛棚，牛奶多一倍', cost: { money: 22000 }, req: ['shelfTea'] },
  { id: 'roaster2', name: '第二烘豆機', kind: 'machine', nx: true, mk: 'roaster', in: 'greenbean', out: 'roasted', iv: 3.5, roast: true, pos: [-7.0, 40.0], cost: { money: 28000 }, req: ['cowShed2'] },
  { id: 'roasterMan2', name: '烘豆師', kind: 'hire', nx: true, role: 'roaster', zone: [-4.0, 42.6], home: [-4.0, 44.0], cost: { money: 0 }, req: ['roaster2'] },
  { id: 'matchaField', name: '抹茶田', kind: 'crop', nx: true, out: 'tencha', plant: 'matcha', grow: 8, pos: [10.0, 44.2], desc: '遮光種的茶樹，碾茶葉可以磨成抹茶粉', cost: { money: 35000 }, req: ['roasterMan2'] },
  { id: 'matchaMill', name: '抹茶石臼', kind: 'machine', nx: true, mk: 'matcha', in: 'tencha', out: 'matcha', iv: 4, pos: [5.0, 45.4], cost: { money: 45000, tencha: 10 }, req: ['matchaField'] },
  { id: 'shelfMatcha', name: '抹茶櫃', kind: 'shelf', nx: true, items: ['matcha', 'tencha'], pos: [1.4, NEW_Z], cost: { money: 40000 }, req: ['matchaMill'] },
  { id: 'dryer2', name: '第二日曬場', kind: 'machine', nx: true, mk: 'dryer', in: 'cherry', out: 'greenbean', iv: 3, pos: [-1.0, 40.0], cost: { money: 50000 }, req: ['shelfMatcha'] },
  { id: 'grinder2', name: '第二磨豆機', kind: 'machine', nx: true, mk: 'grinder', in: 'roasted', out: 'ground', yield: 2, iv: 3, pos: [-7.0, 45.4], cost: { money: 60000 }, req: ['dryer2'] },
  { id: 'picker4', name: '採豆工', kind: 'hire', nx: true, role: 'picker', zone: [7.6, 39.0], home: [7.6, 47.0], cost: { money: 0 }, req: ['grinder2'] },
  { id: 'berryField', name: '草莓園', kind: 'crop', nx: true, out: 'strawberry', plant: 'berry', grow: 6, pos: [10.0, 49.8], desc: '採草莓，可以直接賣或做成草莓蛋糕', cost: { money: 70000 }, req: ['picker4'] },
  { id: 'cakeBar', name: '草莓蛋糕台', kind: 'machine', nx: true, mk: 'cake', in: 'strawberry', in2: 'milk', out: 'strawcake', iv: 4, pos: [5.0, 50.8], cost: { money: 85000, strawberry: 10 }, req: ['berryField'] },
  { id: 'shelfBerry', name: '草莓蛋糕櫃', kind: 'shelf', nx: true, fridge: true, items: ['strawcake', 'strawberry'], pos: [-1.6, NEW_Z], cost: { money: 80000 }, req: ['cakeBar'] },
  { id: 'steamer2', name: '第二奶泡機', kind: 'machine', nx: true, mk: 'steamer', in: 'milk', out: 'foam', iv: 2.5, pos: [-1.0, 45.4], cost: { money: 95000 }, req: ['shelfBerry'] },
  { id: 'coop', name: '雞舍', kind: 'producer', nx: true, animal: 'chicken', out: 'egg', pos: [-13.0, 47.6], zone: [-11.2, 51.4], desc: '母雞會生蛋，鬆餅機要用', cost: { money: 110000 }, req: ['steamer2'] },
  { id: 'waffleMaker', name: '鬆餅機', kind: 'machine', nx: true, mk: 'waffle', in: 'egg', in2: 'wheat', out: 'waffle', iv: 4, pos: [-1.0, 50.8], cost: { money: 130000, egg: 10 }, req: ['coop', 'wheat'] },
  { id: 'shelfWaffle', name: '鬆餅架', kind: 'shelf', nx: true, items: ['waffle', 'egg'], pos: [-4.6, NEW_Z], cost: { money: 120000 }, req: ['waffleMaker'] },
  { id: 'oven2', name: '第二烘焙坊', kind: 'machine', nx: true, mk: 'oven', in: 'wheat', in2: 'milk', outs: ['croissant', 'cheesecake'], iv: 4, pos: [-1.0, 56.2], cost: { money: 150000 }, req: ['shelfWaffle', 'oven'] },
  { id: 'baker2', name: '烘焙師', kind: 'hire', nx: true, role: 'baker', zone: [-4.0, 53.4], home: [-4.0, 51.6], cost: { money: 0 }, req: ['oven2'] },
  { id: 'cocoaGrove2', name: '第二可可園', kind: 'crop', nx: true, out: 'cocoapod', plant: 'cocoa', grow: 8, pos: [10.0, 55.4], desc: '可可果再多一倍，做巧克力要用很多可可', cost: { money: 170000 }, req: ['baker2', 'cocoaGrove'] },
  { id: 'chocoMaker', name: '巧克力工坊', kind: 'machine', nx: true, mk: 'choco', in: 'cocoa', in2: 'milk', out: 'chocolate', iv: 4.5, pos: [5.0, 56.2], cost: { money: 220000, cocoa: 10 }, req: ['cocoaGrove2', 'cocoaMill'] },
  { id: 'shelfChoco', name: '巧克力櫃', kind: 'shelf', nx: true, items: ['chocolate'], pos: [-7.6, NEW_Z], cost: { money: 200000 }, req: ['chocoMaker'] },
  { id: 'picker5', name: '採豆工', kind: 'hire', nx: true, role: 'picker', zone: [7.6, 50.0], home: [7.6, 53.0], cost: { money: 0 }, req: ['shelfChoco'] },
  { id: 'warehouse3', name: '第三倉庫', kind: 'store', nx: true, pos: [-13.2, 56.4], zone: [-13.2, 61.0], desc: '南坡也有倉庫，存貨更多', cost: { money: 60000 }, req: ['expand', 'warehouse2'] },
  { id: 'harbor', name: '開分店：海邊漁港', kind: 'mapgate', zone: [10.6, -7.8], cost: { money: 500000 }, req: ['counter'], earned: 1200000 },
];
// 遊戲時間 ×5–6: everything after the 店貓 costs about 2.8× what it used to (the new content above has its own prices)
{
  let late = false;
  for (const d of DEFS) { if (late && !d.nx && d.kind !== 'mapgate' && d.cost.money) d.cost.money = r10(d.cost.money * 2.8); if (d.id === 'cat') late = true; }
}
// after the 咖啡屋擴建 every display can be bought a second time, and a third time where the room allows (needs the second)
for (const d of DEFS.filter((q) => q.kind === 'shelf')) {
  const c2 = Math.max(400, Math.round(d.cost.money * 1.2 / 10) * 10);
  DEFS.push({ id: d.id + '2', name: d.name + '２', kind: 'shelf', nx: d.nx, fridge: d.fridge, items: d.items, pos: d.pos, cost: { money: c2 }, req: d.nx ? [d.id] : ['dept', d.id] });
  if (SHELF_AT[d.id + '3']) DEFS.push({ id: d.id + '3', name: d.name + '３', kind: 'shelf', nx: d.nx, fridge: d.fridge, items: d.items, pos: d.pos, cost: { money: r10(c2 * 1.5) }, req: [d.id + '2'] });
}
for (const d of DEFS) if (d.kind === 'shelf' && SHELF_AT[d.id]) { const [x, z, f] = SHELF_AT[d.id]; d.pos = [x, z]; d.face = f; }
for (const d of DEFS) if (d.kind === 'table') d.pos = T_POS[d.ti];
// short notes shown on a special zone while the player stands on it
const DESC = {
  counter: '客人在這裡點餐結帳', cashier: '站在點餐櫃台幫客人結帳', picker: '採咖啡豆和各種作物，送到機器和貨架',
  cat: '坐在點餐櫃台上，每位客人多付 $1', roasterMan: '烘豆、磨豆再送上貨架，站在烘豆機旁會完美中焙',
  warehouse: '放不下的東西存在這裡，員工也會來拿', restaurant: '客人會來喝咖啡、吃甜點',
  waiter: '把咖啡和甜點送到客人桌上', cupWasher: '擦桌子，把杯子拿去洗', barista: '把咖啡粉、奶泡等材料送進咖啡吧',
  restWing: '咖啡館往西擴大，可以多擺餐桌', baker: '小麥和牛奶送進烘焙坊，甜點上架',
  harbor: '在海邊漁港開一間分店',
};
for (const d of DEFS) { const k = d.id.replace(/\d+$/, ''); if (d.desc) continue; if (DESC[k] && d.kind !== 'shelf') d.desc = DESC[k]; else if (d.note) d.desc = d.note; }
const DEF = Object.fromEntries(DEFS.map((d) => [d.id, d]));

const lv = (n, base, k) => Array.from({ length: n }, (_, i) => Math.round(base * Math.pow(k, i) / 10) * 10);
// 商店外觀 levels of the café shop (山城咖啡屋): name on the sign by the door, its colour, and the awning stripes
const SHOP_LOOKS = [
  { name: '山城咖啡屋', col: '#6b4a35' },
  { name: '山城咖啡屋', col: '#6f8f61', aw: ['#8fae7e', '#f4e6cf'] },
  { name: '山城精品咖啡', col: '#c8693f', aw: ['#c8693f', '#f4e6cf'] },
  { name: '山城咖啡旗艦店', col: '#4a3326', aw: ['#6b4a35', '#d4a64a'] },
];
// every chain is at most 6 buys (old saves are clamped to the top level below)
const UPS = {
  cap: { tab: 0, name: '背包容量', ic: 'cherry', vals: [6, 10, 16, 24, 32, 42, 52], cost: [30, 90, 200, 420, 800, 1500], fmt: (v) => v + ' 個' },
  speed: { tab: 0, name: '移動速度', ic: 'run', vals: [5.8, 6.4, 7, 7.6, 8.2, 8.8, 9.4], cost: [40, 100, 200, 380, 650, 1000], fmt: (v) => v.toFixed(1) },
  wcap: { tab: 1, name: '員工一次拿多少', ic: 'ground', vals: [4, 6, 8, 11, 15, 20, 26], cost: [100, 220, 450, 800, 1400, 2400], fmt: (v) => v + ' 個' },
  wspeed: { tab: 1, name: '員工速度', ic: 'run', vals: [4, 4.6, 5.2, 5.8, 6.4, 7, 7.6], cost: [100, 220, 450, 800, 1400, 2400], fmt: (v) => v.toFixed(1) },
  grow: { tab: 2, name: '作物生長', ic: 'cherry', vals: [1, 1.25, 1.5, 1.8, 2.2, 2.6], cost: [100, 280, 600, 1200, 2200], fmt: (v) => '×' + v },
  cows: { tab: 2, name: '牛奶和雞蛋速度', ic: 'milk', need: 'cowShed', vals: [6, 5, 4.2, 3.5, 3, 2.5], cost: [80, 220, 500, 1000, 1900], fmt: (v) => v + ' 秒一份' },
  stock: { tab: 2, name: '存貨量', ic: 'greenbean', need: 'dryer', nx: true, vals: [12, 16, 20, 25, 30], cost: [3000, 9000, 24000, 60000], fmt: (v) => '機器盤子放 ' + v + ' 個' },
  store: { tab: 2, name: '倉庫容量', ic: 'roasted', need: 'warehouse', nx: true, vals: [200, 350, 500, 650, 800, 1000], cost: [5000, 15000, 40000, 100000, 200000], fmt: (v) => '每間倉庫 ' + v + ' 個' },
  mach: { tab: 2, name: '機器速度', ic: 'greenbean', need: 'dryer', vals: [1, 1.25, 1.5, 1.8, 2.2, 2.6], cost: [400, 900, 1800, 3200, 5500], fmt: (v) => '×' + v },
  roast: { tab: 2, name: '完美烘焙範圍', ic: 'roasted', need: 'roaster', vals: [0.18, 0.24, 0.3, 0.36, 0.42], cost: [500, 1200, 2500, 5000], fmt: (v) => '中焙區 ' + Math.round(v * 100) + '%' },
  luck: { tab: 2, name: '稀有咖啡豆', ic: 'geisha', need: 'shelfBean', vals: [1, 1.3, 1.7, 2.2, 3], cost: [500, 1200, 2500, 5000], fmt: (v) => '稀有豆 ×' + v },
  mgrShop: { tab: 1, name: '店長', noLv: true, ic: 'mgr', emo: '👔', need: 'cashier', vals: [0, 1, 2, 3], cost: [1200, 4000, 12000], fmt: (v) => ['還沒請店長', '店長：咖啡屋結帳更快、客人給小費', '資深店長：小費更多、客人更有耐心', '金牌店長：小費最多、櫃台的錢自動入袋'][v] },
  mgrFarm: { tab: 1, name: '莊園主管', noLv: true, ic: 'mgr', emo: '🧢', need: 'picker', vals: [0, 1, 2, 3], cost: [1000, 3500, 10000], fmt: (v) => ['還沒請莊園主管', '主管：採豆工、烘豆師、烘焙師走更快', '資深主管：一次拿更多', '金牌主管：又快又能拿'][v] },
  price: { tab: 4, name: '商品售價', ic: 'money', need: 'cashier', vals: [1, 1.2, 1.4, 1.6, 1.85, 2.1, 2.4], cost: [200, 500, 1100, 2400, 5000, 10000], fmt: (v) => '×' + v },
  shelfCap: { tab: 4, name: '展示架容量', ic: 'roasted', need: 'cashier', vals: [8, 16, 24, 32, 40, 50], cost: [150, 400, 900, 1800, 3600], fmt: (v) => v + ' 個' + (v > 40 ? '・展示架加高' : '') },
  cust: { tab: 4, name: '客人數量', ic: 'run', need: 'cashier', vals: [1, 1.2, 1.4, 1.6, 1.8, 2], cost: [300, 700, 1400, 2600, 4500], fmt: (v) => '×' + v },
  look: { tab: 4, name: '商店外觀', ic: 'shop', emo: '🏪', need: 'counter', vals: [0, 1, 2, 3], cost: [800, 3000, 9000], fmt: (v) => SHOP_LOOKS[v].name + ['', '・雨棚花台', '・燈串燈柱', '・紅地毯旗幟'][v] + (v ? '，客人更多、賣更貴' : '') },
  floor: { tab: 4, name: '地板翻新', ic: 'shop', emo: '🧱', need: 'counter', vals: [0, 1, 2, 3], cost: [600, 2400, 7000], fmt: (v) => ['原木地板', '深色人字木地板', '復古花磚', '大理石＋金邊'][v] + (v ? '，客人更多' : '') },
  ad: { tab: 4, name: '路邊廣告牌', ic: 'shop', emo: '🪧', need: 'cashier', vals: [0, 1, 2, 3], cost: [500, 2000, 6500], fmt: (v) => ['沒有廣告', '木頭立牌', '大型看板', '發光看板'][v] + (v ? '，路過的人更多' : '') },
  basket: { tab: 4, name: '提籃和推車', ic: 'bk', emo: '🧺', need: 'cashier', noLv: true, vals: [1, 1.35, 1.7], cost: [800, 2500], fmt: (v) => ['還沒有提籃', '提籃：客人提著籃子走更快，買很多的推推車', '更好的推車：大家又快又順'][v === 1 ? 0 : v < 1.5 ? 1 : 2] },
  eat: { tab: 3, name: '品嚐速度', ic: 'latte', need: 'restaurant', vals: [7, 6, 5, 4, 3.2, 2.5], cost: [300, 700, 1400, 2600, 4500], fmt: (v) => v + ' 秒喝完' },
  tip: { tab: 3, name: '拉花技巧（小費）', ic: 'latte', need: 'restaurant', vals: [0, 2, 4, 7, 10, 15], cost: [400, 900, 1800, 3500, 6000], fmt: (v) => '+' + v },
  autoCash: { tab: 3, name: '自動收款', ic: 'money', need: 'waiter2', vals: [0, 1], cost: [6000], fmt: (v) => v ? '錢自動入袋' : '要自己收錢' },
};
// 遊戲時間 ×5–6: every level from $300 up costs 2.6× (the two new capacity upgrades have their own prices)
for (const k in UPS) if (!UPS[k].nx) UPS[k].cost = UPS[k].cost.map((c) => (c >= 300 ? r10(c * 2.6) : c));
const upVal = (k) => UPS[k].vals[Math.min(state.up[k] || 0, UPS[k].vals.length - 1)];
// 管理層: 店長 (the market) and 莊園主管 (採豆工 / 烘豆師 / 烘焙師)
const MGR_PAY = [0.5, 0.3, 0.25, 0.2], MGR_TIP = [1, 1.1, 1.2, 1.3], MGR_PAT = [0, 0, 10, 15];
const FARM_SP = [1, 1.15, 1.25, 1.35], FARM_CAP = [0, 0, 3, 5];
const mShop = () => state.up.mgrShop || 0, mFarm = () => state.up.mgrFarm || 0;
const isFarmRole = (r) => r === 'picker' || r === 'roaster' || r === 'baker';
// 地板翻新 / 路邊廣告牌 / 商店外觀 together bring more shoppers
const shopCustMul = () => (1 + 0.12 * (state.up.look || 0)) * (1 + 0.06 * (state.up.floor || 0)) * (1 + 0.08 * (state.up.ad || 0));

// small repeatable unlocks next to a building
const GROW = {
  arabica: { start: 3, max: 6, cost: [25, 60, 120], what: '＋1 株阿拉比卡' },
  cowShed: { start: 1, max: 4, cost: [90, 400, 1200], what: '＋1 頭乳牛' },
  robusta: { start: 4, max: 8, cost: [700, 1000, 1400, 1900], what: '＋1 株羅布斯塔' },
  oatField: { start: 4, max: 8, cost: [2000, 2800, 3600, 4500], what: '＋1 叢燕麥' },
  cocoaGrove: { start: 3, max: 6, cost: [1500, 2200, 3000], what: '＋1 棵可可樹' },
  vanilla: { start: 4, max: 8, cost: [1800, 2400, 3200, 4000], what: '＋1 株香草' },
  wheat: { start: 4, max: 8, cost: [2500, 3200, 4000, 5000], what: '＋1 叢小麥' },
};
for (const k in GROW) GROW[k].cost = GROW[k].cost.map((c) => (c >= 300 ? r10(c * 2.6) : c));
Object.assign(GROW, {
  cowShed2: { start: 1, max: 4, cost: [10000, 25000, 50000], what: '＋1 頭乳牛' },
  coop: { start: 2, max: 6, cost: [40000, 60000, 85000, 115000], what: '＋1 隻母雞' },
  teaGarden: { start: 4, max: 8, cost: [6000, 9000, 13000, 18000], what: '＋1 株茶樹' },
  matchaField: { start: 4, max: 8, cost: [15000, 22000, 30000, 40000], what: '＋1 株抹茶' },
  berryField: { start: 4, max: 8, cost: [30000, 42000, 56000, 72000], what: '＋1 株草莓' },
  cocoaGrove2: { start: 3, max: 6, cost: [60000, 85000, 110000], what: '＋1 棵可可樹' },
});
// every machine (the espresso bars too, the café is deep enough now) gets its own 「X做更快」 zone (Lv1–4, each level 40% faster)
for (const d of DEFS) if (d.kind === 'machine') GROW[d.id] = { start: 1, max: 4, mach: true, cost: [r10(Math.max(300, d.cost.money * 0.8)), r10(Math.max(700, d.cost.money * 1.6)), r10(Math.max(1400, d.cost.money * 3))], what: d.name + '做更快' };
const lvlOf = (id) => state.lvl[id] || GROW[id].start;
const machK = (id) => (GROW[id] && GROW[id].mach ? 1 + 0.4 * (lvlOf(id) - 1) : 1);

// ---------- save ----------
const SAVE = 'cafe_save_v1';
let resetting = false, booting = true;   // no saving while the save is being rebuilt at start (piles would read 0)
const blank = () => ({ questSeen: false, money: 50, built: [], paid: {}, up: {}, stock: {}, store: {}, lvl: {}, piles: [0], tpiles: {}, earned: 0, log: {}, logPaid: {}, logNew: false, extra: {} });
const state = Object.assign(blank(), { sound: true });
try { Object.assign(state, JSON.parse(localStorage.getItem(SAVE) || '{}')); } catch (e) { /* fresh start */ }
if (params.has('fresh')) Object.assign(state, blank());
for (const k of ['store', 'lvl', 'tpiles', 'stock', 'paid', 'up', 'log', 'logPaid', 'extra']) state[k] = state[k] || {};
// 收銀速度 was removed again (checkout is quick as before): give back what was paid for it
if (state.up.paySpeed) { const back = [200, 500, 1100, 2200, 4000].slice(0, state.up.paySpeed).reduce((a, b) => a + b, 0); state.money += back; delete state.up.paySpeed; setTimeout(() => toast('結帳恢復原本速度，退還收銀速度升級 $' + back), 2500); }
for (const k in UPS) state.up[k] = Math.min(state.up[k] || 0, UPS[k].vals.length - 1);
const isBuilt = (id) => state.built.includes(id);
if (state.built.includes('dept') && !state.built.includes('door2')) state.built.push('door2');
// backup code: every map's save in one base64 string (same format and keys as the farm, so a code works on every map)
const SAVE_KEYS = ['farm_save_v2', 'harbor_save_v1', 'forest_save_v1', 'cafe_save_v1', 'farm_maps_v1'];
function exportSave() {
  const o = { v: 1 };
  for (const k of SAVE_KEYS) { const s = localStorage.getItem(k); if (s) o[k] = s; }
  return 'FARM1:' + btoa(unescape(encodeURIComponent(JSON.stringify(o))));
}
function importSave(txt) {
  try {
    const t = String(txt).replace(/\s+/g, '');
    if (!t.startsWith('FARM1:')) return false;
    const o = JSON.parse(decodeURIComponent(escape(atob(t.slice(6)))));
    if (!o || o.v !== 1 || !o.farm_save_v2) return false;
    for (const k of SAVE_KEYS) { if (o[k]) JSON.parse(o[k]); }
    for (const k of SAVE_KEYS) { if (o[k]) localStorage.setItem(k, o[k]); else localStorage.removeItem(k); }
    return true;
  } catch (e) { return false; }
}
function copyText(ta) {
  const ok = () => toast('存檔碼已複製，請貼到記事本或傳給自己保存');
  const fallback = () => { ta.focus(); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { toast('請長按文字框，全選後複製'); } };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(ok, fallback); else fallback();
}
if (state.built.length > 3) state.questSeen = true;
function save() {
  if (resetting || booting) return;
  for (const id in stations) {
    const s = stations[id];
    if (s.kind === 'machine') state.stock[id] = { a: s.inN, c: s.inN2 || 0, l: s.outBin.list, i: s.inBin ? s.inBin.list : null };
    else if (s.bin) state.stock[id] = { l: s.bin.list };
  }
  state.piles = COUNTERS.map((c) => c.pile.value);
  for (const t of tables) state.tpiles[t.i] = t.pile.value;
  try { localStorage.setItem(SAVE, JSON.stringify(state)); } catch (e) { /* storage off */ }
}
function loadBin(s) {
  const st = state.stock[s.id];
  if (st && Array.isArray(st.l)) for (const t of st.l) if (ITEMS[t] && s.bin.list.length < s.bin.max) binAdd(s.bin, t);
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
scene.background = new THREE.Color('#cfe8d6');
const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 220);
const lights = K.makeLights(scene);
lights.hemi.groundColor.set('#b9d98f');
const joy = new Joystick(canvas, $('ui'));
joy.onStart = () => { if (actx && actx.state === 'suspended') actx.resume(); };

const colliders = [];
// grid path-finding over the same boxes the player collides with; the terraced hillside (x 13.2) is the east border
const nav = createNav(colliders, { x0: -41, x1: 13.2, z0: DEPT_Z - 0.5, z1: 64 }, 0.5, 0.35);
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
// phones: at most NAV_BUDGET grid searches per frame; whoever is over the budget plans a frame later (and stands still)
const NAV_BUDGET = 4;
let navLeft = NAV_BUDGET;
const navStats = { calls: 0, deferred: 0, maxWait: 0 };
function navTake() { if (navLeft <= 0) { navStats.deferred++; return false; } navLeft--; navStats.calls++; return true; }
// the path is planned lazily (stepPath), so a crowd that all wants a new goal at once is spread over a few frames
function setGoal(c, x, z, exact) { c.goal = [x, z, exact]; c.navV = -1; c.path = []; }
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
    sc.add(new THREE.HemisphereLight('#fff6e6', '#d9e8c4', 1.7));
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
      if (isLogged(type)) { sc.overrideMaterial = sil; r.render(sc, cam); ICON_SIL[type] = '<img class="sil" src="' + r.domElement.toDataURL() + '" alt="">'; sc.overrideMaterial = null; }
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
}
makeIcons();

// ---------- static world ----------
const backWall = { g: null, b: null };
let mFront = { g: null, b: [] }, deptG = null;
const doorOpen = (D) => !D.id || isBuilt(D.id);
const CF = P6.CAFE;
// honey oak plank floor: rows of planks, every other row shifted by half a plank
function planks(g, x0, x1, z0, z1, cols = ['#c49565', '#b98a5b', '#cc9f6f'], y = 0.125) {
  for (let z = z0, k = 0; z < z1 - 0.05; z += 0.5, k++) {
    const d = Math.min(0.5, z1 - z) - 0.03, edges = [x0];
    for (let e = x0 + (k % 2 ? 1.0 : 2.0); e < x1 - 0.1; e += 2.0) edges.push(e);
    edges.push(x1);
    for (let j = 0; j < edges.length - 1; j++) K.add(g, K.mesh(G.plane(edges[j + 1] - edges[j] - 0.03, d), cols[(k + j) % cols.length], false, true), (edges[j] + edges[j + 1]) / 2, y, z + d / 2 + 0.015);
  }
}
// brick wall piece with a walnut beam on top
function brickPiece(g, w, h, d, x, z, beam = true) {
  K.add(g, P6.brickWall(w, h, d), x, h / 2, z);
  if (beam) K.add(g, K.mesh(G.rbox(w + 0.06, 0.16, d + 0.08, 0.04), CF.walnut), x, h, z);
}
// café table out on the terrace: a bistro table with a parasol
function terraceTable(col) {
  const t = P6.bistroTable('#f4e6cf');
  K.add(t.g, K.mesh(G.cyl(0.03, 0.03, 1.5, 6), CF.iron), 0, 1.5, 0);
  K.add(t.g, K.mesh(G.cone(1.05, 0.42, 12), col), 0, 2.35, 0);
  K.add(t.g, K.mesh(G.cyl(0.06, 0.06, 0.08, 8), CF.walnut), 0, 2.6, 0);
  return t.g;
}
const standSign = { g: null, board: null };
const south = { g: null, bar: null };
function shopPot(x, z) {
  const pot = P6.pottedPlant(1.1); pot.position.set(x, 0.12, z);
  return pot;
}
const areas = [];
let shopArea = null;
function makeArea(x0, z0, x1, z1, lamps, lx, lz) {
  const light = new THREE.PointLight('#ffe2a8', 0, 18, 1.6); light.position.set(lx, 3.2, lz); scene.add(light);
  const A = { x0, z0, x1, z1, light, lamps, k: 0 };
  areas.push(A);
  return A;
}
const mist = [];
function buildWorld() {
  const D = new THREE.Group();
  const rnd = mulberry(31);
  // grass, with lighter and darker patches
  K.add(D, K.mesh(G.plane(150, 170), '#a6d873', false, true), -12, 0, 8);
  for (let i = 0; i < 60; i++) {
    const r = 1.2 + rnd() * 3, p = K.mesh(G.circle(r, 18), rnd() < 0.5 ? '#9ccf62' : '#b4e27e', false, true);
    p.position.set(-42 + rnd() * 54, 0.003 + i * 0.0011, -17 + rnd() * 52); p.scale.set(1, 1, 0.6 + rnd() * 0.6); p.rotation.y = rnd() * 3; D.add(p);
  }
  // stone paths: the hill road past the market and the café, up to the market door, the guests' path, and yard lanes
  const path = (x, z, w, d, col = '#ddd3c2') => K.add(D, K.mesh(G.rbox(w, 0.05, d, 0.2, 1), col, false, true), x, 0.025, z);
  path(0, -4.9, 25.8, 1.5);
  path(-12.4, 4.5, 1.3, 17.4);   // café guests' path from the south-west
  path(7.6, 12.6, 1.2, 33.2);   // lane between the machines and the terraces
  path(2.0, 15.9, 1.4, 27.2);
  path(-4.0, 15.9, 1.4, 27.2);
  // 山城咖啡屋 shell: honey oak floor, brick walls with walnut beams (the front is rebuilt by marketFront)
  const cx = (SHOP.x0 + SHOP.x1) / 2, w = SHOP.x1 - SHOP.x0 + 0.4;
  K.add(D, K.mesh(G.rbox(w, 0.12, 10.4, 0.06, 2), '#a8784c', false, true), cx, 0.06, -12.2);
  planks(D, SHOP.x0 - 0.15, SHOP.x1 + 0.15, -17.4, -7.45);
  K.add(D, K.mesh(G.rbox(w, 0.05, 0.6, 0.03, 1), CF.walnut, false, true), cx, 0.125, -7.3);
  // the back wall is its own group: the 咖啡屋擴建 takes it down and builds the 烘豆工坊 behind
  const BW = backWall.g = K.add(scene, new THREE.Group());
  brickPiece(BW, w, 2.0, 0.4, cx, -17.6);
  for (const x of [SHOP.x0 - 0.2, SHOP.x1]) brickPiece(D, 0.4, 2.0, 10.4, x, -12.4);
  backWall.b = box(SHOP.x0 - 0.4, -17.8, SHOP.x1 + 0.2, -17.4); box(SHOP.x0 - 0.4, -17.6, SHOP.x0, -7.2); box(SHOP.x1 - 0.2, -17.6, SHOP.x1 + 0.2, -7.2);
  // terrace across the road: a wooden deck with parasol tables
  K.add(D, K.mesh(G.rbox(4.4, 0.04, 2.5, 0.03, 1), CF.oak, false, true), 4.6, 0.02, -2.45);
  for (let x = 2.65; x < 6.7; x += 0.5) K.add(D, K.mesh(G.plane(0.02, 2.4), CF.walnut, false, true), x, 0.042, -2.45);
  for (const [x, c] of [[3.45, CF.terra], [5.75, CF.sage]]) { const t = terraceTable(c); t.position.set(x, 0.04, -2.45); D.add(t); box(x - 0.6, -3.65, x + 0.6, -1.25); }
  { const pl = P6.pottedPlant(0.9); pl.position.set(2.2, 0, -3.35); D.add(pl); box(1.92, -3.63, 2.48, -3.07); }
  // decoration: trees around the estate, rocks, bushes, flowers, lamps, parasol tables on the lawn
  const tree = (x, z, kind, s, solid) => { const t = P5.decoTree(kind, s); t.position.set(x, 0, z); D.add(t); if (solid) box(x - 0.3, z - 0.3, x + 0.3, z + 0.3); };
  // the row of trees behind the market stands further back (z -27.5 or more), out of the way of the 烘豆工坊 behind the café
  for (let i = 0; i < 24; i++) {
    const x = -42 + i * 2.4 + rnd(), z = -20.5 - rnd() * 2.5, kind = rnd() < 0.6 ? 'pine' : 'oak', s = 0.9 + rnd() * 0.4;
    tree(x, x > -12.5 && x < 10.5 ? z - 14 : x <= -12.5 ? z - 3.5 : z, kind, s, false);
  }
  for (let i = 0; i < 18; i++) tree(-43.5 - rnd() * 3, -17 + i * 3.0 + rnd(), rnd() < 0.5 ? 'oak' : 'pine', 0.9 + rnd() * 0.4, false);
  // the woods along the south edge: the part in front of the 南坡新園區 is its own group, taken down by the 擴建
  south.g = K.add(scene, new THREE.Group());
  for (let i = 0; i < 22; i++) {
    const x = -42 + i * 2.6 + rnd(), z = 37 + rnd() * 2.5, kind = rnd() < 0.5 ? 'oak' : 'maple', sc = 0.9 + rnd() * 0.4;
    if (x > -18) { const t = P5.decoTree(kind, sc); t.position.set(x, 0, z); south.g.add(t); } else tree(x, z, kind, sc, false);
  }
  K.bakeStatic(south.g);
  if (!isBuilt('expand')) south.bar = box(-41, 35.2, 13.2, 35.6);
  for (const [x, z, k] of [[-16.0, 2.0, 'oak'], [-20.5, 6.5, 'pine'], [-26.0, 1.6, 'oak'], [-31.0, 6.0, 'pine'], [-36.5, 1.0, 'oak'], [-24.0, 14.0, 'maple'], [-33.0, 18.0, 'oak'], [-18.0, 22.0, 'pine'], [-28.0, 27.0, 'maple'], [-38.0, 12.0, 'pine'], [-15.6, 30.0, 'oak'], [-36.0, 31.0, 'pine']]) tree(x, z, k, 1, true);
  for (const [x, z, s] of [[-22.0, 10.4, 0.5], [-34.6, 24.0, 0.6], [-17.2, 16.8, 0.4], [12.0, 32.6, 0.5], [-39.0, -2.8, 0.5]]) {
    const r = P.rock(s); r.position.set(x, 0, z); D.add(r); box(x - s * 0.8, z - s * 0.7, x + s * 0.8, z + s * 0.7);
  }
  for (const [x, z, r] of [[-14.6, -2.4, 0.45], [-28.0, 12.0, 0.5], [-20.0, 30.6, 0.5], [12.2, -0.4, 0.4]]) K.add(D, P.bush(r), x, 0, z);
  const fl = ['#ff7eb6', '#ffffff', '#ffd34a', '#a98bff', '#ff8a6b'];
  for (let i = 0; i < 80; i++) K.add(D, P.flower(fl[i % 5]), -40 + rnd() * 25, 0, 0 + rnd() * 33);
  for (const x of [-9.0, 0.5]) { K.add(D, P.lamp(), x, 0, -3.5); box(x - 0.1, -3.6, x + 0.1, -3.4); }
  for (const [x, c] of [[-25.0, '#ff7eb6'], [-35.0, '#59c25b']]) { const pt = P6.parasolTable(c); pt.position.set(x, 0, -2.6); D.add(pt); box(x - 0.45, -3.05, x + 0.45, -2.15); }
  // the terraced coffee hillside beyond the east edge, and mountains to the north
  for (let i = 0; i < 6; i++) {
    const x = 15.5 + i * 3.0, h = 0.5 + i * 0.6;
    K.add(D, K.mesh(G.rbox(3.2, h, 80, 0.12), i % 2 ? '#7cc45a' : '#8ed067', false, true), x, h / 2, 6);
    K.add(D, K.mesh(G.rbox(0.25, h + 0.04, 80, 0.06), '#c9c2b4', false, true), x - 1.6, h / 2, 6);
    for (let z = -20; z < 34; z += 2.2) { const sh = P6.coffeeShrub(i % 2 ? '#e3463c' : '#a8323a'); sh.g.position.set(x + (rnd() - 0.5) * 0.6, h, z + rnd()); sh.g.scale.setScalar(0.9 + rnd() * 0.3); D.add(sh.g); }
  }
  for (const [x, z, r, h] of [[-30, -48, 16, 18], [-6, -52, 20, 24], [16, -46, 14, 16], [34, -40, 12, 14], [-50, -36, 14, 15]]) {
    K.add(D, K.mesh(G.cone(r, h, 9), '#8cc47a', false, true), x, h / 2 - 0.5, z);
    K.add(D, K.mesh(G.cone(r * 0.32, h * 0.3, 9), '#f4f8f2', false, true), x, h - h * 0.15 - 0.5, z);
  }
  const shopA = makeArea(SHOP.x0, SHOP.z0, SHOP.x1, SHOP.z1, [], -0.7, -12);
  K.bake(D, scene);
  K.bakeStatic(BW);
  marketFront();
  buildInterior();
  shopArea = shopA;
  buildBin();
  // the shop's name sign by the door stays outside the baked scenery so the 商店外觀 upgrade can repaint it
  standSign.g = K.add(scene, new THREE.Group(), 8.75, 0, -6.5);
  K.add(standSign.g, K.mesh(G.rbox(0.14, 1.6, 0.14, 0.04), CF.walnut), 0, 0.8, 0);
  box(8.65, -6.6, 8.85, -6.4);
  // morning mist drifting over the hillside
  const mm = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.1, depthWrite: false });
  for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(G.circle(5, 20), mm); m.scale.set(2.2, 1, 0.8); m.position.set(-40 + i * 18, 3.4 + i * 0.3, -8 + i * 11); m.renderOrder = 3; m.userData.v = 0.5 + i * 0.15; scene.add(m); mist.push(m); }
}
// the café front (z -7.3): brick base, big windows with walnut frames, and a gap with a wooden glass door for every
// entrance that is open (the main door, 第二道門, 第三道門)
function marketFront() {
  if (mFront.g) scene.remove(mFront.g);
  for (const b of mFront.b) unbox(b);
  const g = K.add(scene, new THREE.Group()); mFront = { g, b: [] };
  const piece = (x0, x1) => {
    if (x1 - x0 < 0.05) return;
    const mx = (x0 + x1) / 2, len = x1 - x0;
    K.add(g, P6.brickWall(len, 0.55, 0.3), mx, 0.28, -7.3);
    K.add(g, K.mesh(G.rbox(Math.max(0.05, len - 0.1), 0.62, 0.08, 0.03), '#d6eef5'), mx, 0.86, -7.3);
    K.add(g, K.mesh(G.rbox(len, 0.14, 0.32, 0.05), CF.walnut), mx, 1.22, -7.3);
    const n = Math.max(1, Math.round(len / 1.2));
    for (let i = 0; i <= n; i++) K.add(g, K.mesh(G.rbox(0.09, 0.66, 0.14, 0.02), CF.walnut), x0 + 0.05 + (len - 0.1) * i / n, 0.86, -7.3);
    mFront.b.push(box(x0, -7.5, x1, -7.1));
  };
  let x = SHOP.x0 - 0.4;
  for (const D of DOORS.filter(doorOpen).sort((a, b) => a.x - b.x)) {
    const a = D.x - D.w / 2 - 0.05, b = D.x + D.w / 2 + 0.05;
    piece(x, a); x = b;
    K.add(g, K.mesh(G.rbox(D.w + 0.3, 0.05, 1.3, 0.2, 1), '#d9b49a', false, true), D.x, 0.025, -6.35);   // tiled step up from the road
    if (!D.d) { D.d = P6.cafeDoor(D.w); D.d.g.position.set(D.x, 0.1, -7.3); scene.add(D.d.g); K.bakeStatic(D.d.g); if (D.id && !simming) popIn(D.d.g); }
  }
  piece(x, SHOP.x1 + 0.2);
  const sg = P6.cafeSign('山城咖啡屋', 2.6, CF.walnut); sg.position.set(DOORS[0].x, 2.35, -7.25); g.add(sg);
  K.bakeStatic(g);
}
// inside the front room: the back bar with the menus, bistro tables on rugs, plants and coffee sacks
function buildInterior() {
  const g = K.add(scene, new THREE.Group());
  const bb = P6.backBar(7.0); bb.position.set(0.85, 0.12, -17.25); g.add(bb);
  box(-2.65, -17.45, 4.35, -17.05);
  for (const [x, z] of [[-4.3, -11.9], [2.4, -11.9]]) {
    K.add(g, K.mesh(G.circle(1.35, 28), CF.terra, false, true), x, 0.142, z).scale.set(1, 1, 0.62);
    K.add(g, K.mesh(G.circle(1.15, 28), '#e9c9a4', false, true), x, 0.145, z).scale.set(1, 1, 0.58);
    const t = P6.bistroTable(); t.g.position.set(x, 0.12, z); t.g.rotation.y = Math.PI / 2; g.add(t.g);
    box(x - 1.2, z - 0.58, x + 1.2, z + 0.58);
  }
  for (const [x, z] of [[7.45, -16.9], [-8.85, -8.4]]) { g.add(shopPot(x, z)); box(x - 0.3, z - 0.3, x + 0.3, z + 0.3); }
  const sk = P6.beanSacks(); sk.position.set(-8.85, 0.12, -15.1); g.add(sk); box(-9.35, -15.5, -8.35, -14.7);
  const af = P6.aFrame('今日推薦', ['手沖精品豆', '拿鐵 $', '現烤可頌']); af.position.set(3.6, 0, -6.15); af.rotation.y = 0.15; g.add(af); box(3.3, -6.4, 3.9, -5.9);
  K.bakeStatic(g);
}
// 咖啡屋擴建: the back wall comes down, the 烘豆工坊 hall opens behind it (floor, brick walls, a sign) and a brick
// spine stays between the two rooms on the west side, with displays on both faces
function applyDept(anim) {
  if (!isBuilt('dept') || deptG) return;
  if (backWall.g) { scene.remove(backWall.g); backWall.g = null; }
  if (backWall.b) { unbox(backWall.b); backWall.b = null; }
  const g = K.add(scene, new THREE.Group());
  const cx = (SHOP.x0 + SHOP.x1) / 2, w = SHOP.x1 - SHOP.x0 + 0.4, zf = DEPT_Z - 0.2, zMid = (-17.4 + zf) / 2, dz = -17.4 - zf;
  K.add(g, K.mesh(G.rbox(w, 0.12, dz, 0.06, 2), '#a8784c', false, true), cx, 0.06, zMid);
  planks(g, SHOP.x0 - 0.15, SHOP.x1 + 0.15, DEPT_Z + 0.2, -17.4);
  K.add(g, K.mesh(G.rbox(w, 0.05, 0.5, 0.03, 1), CF.walnut, false, true), cx, 0.13, -17.45);   // a walnut band where the old wall stood
  brickPiece(g, 5.7, 2.0, 0.4, (SHOP.x0 - 0.4 - 4.1) / 2 + 0.2, -17.6);   // the spine
  brickPiece(g, w, 2.0, 0.4, cx, DEPT_Z);
  const sl = -17.6 - (DEPT_Z - 0.2), sz = (-17.6 + DEPT_Z - 0.2) / 2;
  for (const x of [SHOP.x0 - 0.2, SHOP.x1]) brickPiece(g, 0.4, 2.0, sl, x, sz);
  const sign = P6.cafeSign('烘豆工坊', 4.6, CF.sageDark); sign.position.set(cx, 3.45, DEPT_Z + 0.05); g.add(sign);
  for (const sx of [-1.6, 1.6]) K.add(g, K.mesh(G.rbox(0.14, 0.95, 0.14, 0.03), CF.walnut), cx + sx, 2.45, DEPT_Z);
  for (const [x, z] of [[-8.9, -20.1], [-8.95, -30.35]]) { g.add(shopPot(x, z)); box(x - 0.3, z - 0.3, x + 0.3, z + 0.3); }
  const sk = P6.beanSacks(); sk.position.set(7.4, 0.12, -30.6); g.add(sk); box(6.9, -31.0, 7.9, -30.2);
  // a tasting table on a rug in the front part of the hall
  K.add(g, K.mesh(G.circle(1.35, 28), CF.sage, false, true), 2.2, 0.142, -20.0).scale.set(1, 1, 0.62);
  K.add(g, K.mesh(G.circle(1.15, 28), '#e9c9a4', false, true), 2.2, 0.145, -20.0).scale.set(1, 1, 0.58);
  const tt = P6.bistroTable(); tt.g.position.set(2.2, 0.12, -20.0); tt.g.rotation.y = Math.PI / 2; g.add(tt.g); box(1.0, -20.58, 3.4, -19.42);
  box(SHOP.x0 - 0.4, -17.8, -4.1, -17.4);
  box(SHOP.x0 - 0.4, DEPT_Z - 0.2, SHOP.x1 + 0.2, DEPT_Z + 0.2); box(SHOP.x0 - 0.4, DEPT_Z, SHOP.x0, -17.4); box(SHOP.x1 - 0.2, DEPT_Z, SHOP.x1 + 0.2, -17.4);
  SHOP.z0 = DEPT_Z + 0.2; shopArea.z0 = SHOP.z0; shopArea.light.position.z = -20.0; shopArea.light.distance = 40;
  K.bakeStatic(g); deptG = g;
  if (state.up.floor) applyFloor(false);
  if (state.up.basket) applyBasket(false);
  if (anim) for (let x = SHOP.x0 + 1; x < SHOP.x1; x += 2.5) puff(x, 1.4, DEPT_Z + 0.7, '#ffffff', 6, 1);
}

// ---------- 擴建：南坡新園區 ----------
// the woods south of the yard come down and a new piece of land (x -17 … 13, z 35 … 62) opens: the three yard lanes run on
// into it, a cross path joins them where the trees stood, and new trees line the far edges
let expandG = null;
const EXP_Z = 62.5, EXP_X0 = -17.4;
function applyExpand(anim) {
  if (expandG) return;
  if (south.g) { scene.remove(south.g); south.g = null; }
  if (south.bar) { unbox(south.bar); south.bar = null; }
  const g = K.add(scene, new THREE.Group());
  const path = (x, z, w, d) => K.add(g, K.mesh(G.rbox(w, 0.05, d, 0.2, 1), '#ddd3c2', false, true), x, 0.026, z);
  path(7.6, 45.0, 1.2, 31.6);
  path(2.0, 45.0, 1.4, 31.6);
  path(-4.0, 45.0, 1.4, 31.6);
  path(-1.0, 35.3, 18.4, 1.3);
  // a few soft grass patches and flowers on the new land
  const rnd = mulberry(77), fl = ['#ff7eb6', '#ffffff', '#ffd34a', '#a98bff', '#ff8a6b'];
  for (let i = 0; i < 12; i++) { const r = 1.2 + rnd() * 2.4, pt = K.mesh(G.circle(r, 18), rnd() < 0.5 ? '#9ccf62' : '#b4e27e', false, true); pt.position.set(-16 + rnd() * 28, 0.004 + i * 0.001, 37 + rnd() * 24); pt.scale.set(1, 1, 0.6 + rnd() * 0.5); g.add(pt); }
  for (let i = 0; i < 26; i++) K.add(g, P.flower(fl[i % 5]), -16.8 + rnd() * 1.6, 0, 37 + rnd() * 24);
  // new edge: trees along the south and the west of the new land, and past the end of the coffee terraces
  const tr = (x, z, k, sc) => { const t = P5.decoTree(k, sc); t.position.set(x, 0, z); g.add(t); };
  for (let x = -19; x < 16; x += 2.5) tr(x + rnd(), 64.6 + rnd() * 2, rnd() < 0.5 ? 'oak' : 'maple', 0.9 + rnd() * 0.4);
  for (let z = 39; z < 63; z += 2.8) tr(-19.6 - rnd() * 1.5, z + rnd(), rnd() < 0.5 ? 'pine' : 'oak', 0.9 + rnd() * 0.4);
  for (let z = 47.5; z < 63; z += 2.8) tr(14.8 + rnd() * 1.5, z + rnd(), rnd() < 0.5 ? 'pine' : 'maple', 0.9 + rnd() * 0.4);
  // a welcome sign beside the cross path
  const sg = K.add(g, new THREE.Group(), -12.6, 0, 33.4);
  for (const x of [-1.1, 1.1]) K.add(sg, K.mesh(G.rbox(0.14, 2.0, 0.14, 0.04), C.woodDark), x, 1.0, 0);
  const sb = P2.signBoard('南坡新園區', 2.6, '#59a14f'); sb.position.set(0, 1.85, 0.05); sg.add(sb);
  box(-13.85, 33.3, -13.55, 33.5); box(-11.65, 33.3, -11.35, 33.5);
  K.bakeStatic(g);
  expandG = g;
  evict();
  if (anim) { popIn(g); confetti(2.0, 36); for (let x = -15; x < 12; x += 4) puff(x, 1.2, 38, '#cfe8b0', 6, 1); }
}

// ---------- trash bin ----------
// on the open grass between the road and the processing yard, away from every path and customer route: stand on the
// red circle for half a second to throw away whatever you are carrying (workers stuck with goods nobody takes come here too)
const bin = { x: -1.2, z: 2.0, px: -1.2, pz: 3.05, lid: null, open: 0, t: 0, dwell: 0 };
function buildBin() {
  const g = K.add(scene, new THREE.Group(), bin.x, 0, bin.z);
  g.add(K.blob(0.5));
  K.add(g, K.mesh(G.cyl(0.34, 0.28, 0.78, 14), '#6cc0b2'), 0, 0.39, 0);
  K.add(g, K.mesh(G.cyl(0.37, 0.37, 0.1, 14), '#4fa597'), 0, 0.8, 0);
  K.add(g, K.mesh(G.rbox(0.36, 0.12, 0.05, 0.02, 1), '#ffffff', false), 0, 0.45, 0.31);
  const hinge = K.add(g, new THREE.Group(), 0, 0.86, -0.34);
  hinge.userData.dyn = true;
  K.add(hinge, K.mesh(G.cyl(0.38, 0.38, 0.08, 14), '#ff8a6b'), 0, 0.04, 0.34);
  K.add(hinge, K.mesh(G.rbox(0.22, 0.08, 0.1, 0.03, 1), '#e8694d'), 0, 0.12, 0.34);
  bin.lid = hinge;
  K.bakeStatic(g);
  box(bin.x - 0.4, bin.z - 0.4, bin.x + 0.4, bin.z + 0.4);
  const pd = P2.pad('#ff6b6b'); pd.position.set(bin.px, 0, bin.pz); scene.add(pd);
  label('zone', '<div class="zn">🗑️ 垃圾桶</div>', (o) => o.set(bin.px, 0.4, bin.pz + 0.2));
}
function updateBin(dt) {
  const pp = player.p.root.position;
  const onPad = dist2(pp, bin.px, bin.pz) < 0.75 && player.carry.length > 0;
  bin.dwell = onPad ? bin.dwell + dt : 0;
  const on = onPad && bin.dwell > 0.5;
  bin.t -= dt;
  if (on && bin.t <= 0) {
    bin.t = 0.07;
    const it = player.carry.pop(), from = new THREE.Vector3(); it.m.getWorldPosition(from);
    player.p.back.remove(it.m); restack(player); sfx('pop');
    fly(it.type, from, (o) => o.set(bin.x, 0.95, bin.z), 0.25, () => {});
    if (!player.carry.length) toast('手上的東西丟掉了');
  }
  bin.open += ((on || bin.t > -0.4 ? 1 : 0) - bin.open) * Math.min(1, dt * 10);
  bin.lid.rotation.x = -bin.open * 1.6;
}
// 「MAX」 above a full stack, so nobody walks back for more
function maxTag(c) {
  if (!c.maxL) c.maxL = label('maxtag', 'MAX', (o) => { stackTop(c, o); o.y += 0.2; });
  c.maxL.show = c.carry.length > 0 && c.carry.length + c.incoming >= c.cap();
}

// ---------- shop upgrades: 商店外觀, 地板翻新, 路邊廣告牌, 提籃和推車 ----------
// the front of the café: windows from SHOP.x0 to 8.15 with the doors in DOORS (main door at x 5.9)
let lookG = null, lookBoxes = [];
function bulbs(x0, x1, z) {
  const g = new THREE.Group(), cols = ['#ffd34a', '#ff8a6b', '#9fd86b', '#5aa9ff'];
  const n = Math.round((x1 - x0) / 0.8);
  for (let i = 0; i <= n; i++) {
    const t = i / n, m = new THREE.Mesh(G.sphere(0.07, 6, 5), new THREE.MeshBasicMaterial({ color: cols[i % 4] }));
    m.position.set(x0 + (x1 - x0) * t, 1.42 - Math.abs(Math.sin(t * n * Math.PI / 2)) * 0.12, z); g.add(m);
  }
  return g;
}
function applyShopLook(anim) {
  const lv = state.up.look || 0, L = SHOP_LOOKS[lv];
  if (standSign.board) standSign.g.remove(standSign.board);
  standSign.board = P6.cafeSign(L.name, 1.8 + lv * 0.3, L.col); standSign.board.position.set(0, 1.75, 0); standSign.g.add(standSign.board);
  if (lv === 3) { const st = K.mesh(G.sphere(0.2, 10, 8), '#ffd34a'); st.scale.set(1, 1, 0.4); K.add(standSign.board, st, 0, 0.72, 0); }
  if (lookG) { scene.remove(lookG); lookG = null; }
  for (const b of lookBoxes) unbox(b);
  lookBoxes = [];
  if (!lv) { if (anim) popIn(standSign.board); return; }
  const g = K.add(scene, new THREE.Group());
  const x0 = SHOP.x0 - 0.4, x1 = 7.95, Z = -7.3;
  // striped awning along the whole front, scalloped edge
  const sw = 0.62, n = Math.round((x1 - x0) / sw), w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const x = x0 + (i + 0.5) * w, col = L.aw[i % 2];
    const s = K.add(g, K.mesh(G.rbox(w + 0.01, 0.07, 1.05, 0.03, 1), col), x, 1.72, Z + 0.42);
    s.rotation.x = 0.38;
    K.add(g, K.mesh(G.sphere(w * 0.5, 8, 5), col, false), x, 1.52, Z + 0.92).scale.set(1, 0.55, 0.3);
  }
  K.add(g, K.mesh(G.rbox(x1 - x0 + 0.1, 0.12, 0.16, 0.05), lv === 3 ? '#ffd34a' : C.white), (x0 + x1) / 2, 1.9, Z - 0.02);
  // flower planters against the windows, never in front of one of the three doors
  const fl = ['#ff7eb6', '#ffd34a', '#a98bff', '#ffffff', '#ff8a6b'];
  [-8.85, -4.05, 0.8, 2.75].forEach((x, k) => {
    const pl = K.add(g, new THREE.Group(), x, 0, Z + 0.42);
    K.add(pl, K.mesh(G.rbox(1.5, 0.42, 0.5, 0.08), lv === 3 ? CF.cream : CF.terra), 0, 0.21, 0);
    K.add(pl, K.mesh(G.rbox(1.38, 0.06, 0.4, 0.03, 1), '#8b5a3c', false), 0, 0.43, 0);
    for (let j = 0; j < 5; j++) { const f = P.flower(fl[(k + j) % 5]); f.position.set(-0.56 + j * 0.28, 0.42, (j % 2) * 0.1 - 0.05); f.scale.setScalar(1.3); pl.add(f); }
    lookBoxes.push(box(x - 0.8, Z + 0.15, x + 0.8, Z + 0.7));
  });
  if (lv >= 2) {
    // colourful string lights hanging from the awning, and a lantern post each side of the door
    g.add(bulbs(x0, x1, Z + 0.95));
    for (const x of [4.1, 7.75]) {
      const p = K.add(g, new THREE.Group(), x, 0, Z + 0.62);
      K.add(p, K.mesh(G.rbox(0.36, 0.18, 0.36, 0.05), '#6a7382'), 0, 0.09, 0);
      K.add(p, K.mesh(G.cyl(0.06, 0.07, 1.5, 8), '#6a7382'), 0, 0.85, 0);
      K.add(p, K.mesh(G.rbox(0.3, 0.36, 0.3, 0.06), '#fff2b8'), 0, 1.75, 0);
      K.add(p, K.mesh(G.cone(0.26, 0.2, 4), '#6a7382'), 0, 2.02, 0).rotation.y = Math.PI / 4;
      lookBoxes.push(box(x - 0.2, Z + 0.42, x + 0.2, Z + 0.82));
    }
  }
  if (lv >= 3) {
    // red carpet from the door down to the road, and two flags
    K.add(g, K.mesh(G.rbox(2.0, 0.03, 1.9, 0.02, 1), '#a8322e', false, true), DOORS[0].x, 0.075, -5.95);
    K.add(g, K.mesh(G.rbox(2.12, 0.025, 2.0, 0.02, 1), CF.brass, false, true), DOORS[0].x, 0.062, -5.95);
    for (const [x, c] of [[4.1, CF.walnut], [7.75, CF.sage]]) {
      K.add(g, K.mesh(G.cyl(0.04, 0.04, 1.1, 6), '#ffd34a'), x, 2.6, Z + 0.62);
      K.add(g, K.mesh(G.rbox(0.62, 0.4, 0.04, 0.02, 1), c), x + 0.33, 2.9, Z + 0.62);
    }
  }
  K.bakeStatic(g);
  lookG = g;
  evict();
  if (anim) { popIn(g); popIn(standSign.board); }
}
let floorG = null;
function applyFloor(anim) {
  if (floorG) { scene.remove(floorG); floorG = null; }
  const lv = state.up.floor || 0; if (!lv) return;
  const g = K.add(scene, new THREE.Group());
  const x0 = SHOP.x0 + 0.2, x1 = SHOP.x1 - 0.2, z0 = SHOP.z0, z1 = -7.45, y = 0.134;
  const tile = (x, z, w, d, col) => K.add(g, K.mesh(G.plane(w, d), col, false, true), x, y, z);
  if (lv === 1) {
    // dark walnut planks, narrow and staggered
    const cols = ['#8a5c3b', '#9c6a45', '#7d5234'];
    for (let z = z0, k = 0; z < z1 - 0.05; z += 0.55, k++) {
      const d = Math.min(0.55, z1 - z) - 0.03, edges = [x0];
      for (let e = x0 + (k % 2 ? 1.2 : 2.4); e < x1 - 0.1; e += 2.4) edges.push(e);
      edges.push(x1);
      for (let j = 0; j < edges.length - 1; j++) tile((edges[j] + edges[j + 1]) / 2, z + d / 2 + 0.015, edges[j + 1] - edges[j] - 0.03, d, cols[(k + j) % 3]);
    }
  } else {
    // lv2 cream checker, lv3 marble with a gold frame
    const sz = lv === 2 ? 0.8 : 1.6, a = lv === 2 ? '#efe2cb' : '#f6f2ea', b = lv === 2 ? '#d7b291' : '#e3dbcd';
    for (let z = z0, r = 0; z < z1 - 0.05; z += sz, r++) for (let x = x0, c = 0; x < x1 - 0.05; x += sz, c++) {
      const w = Math.min(sz, x1 - x) - 0.03, d = Math.min(sz, z1 - z) - 0.03;
      tile(x + w / 2 + 0.015, z + d / 2 + 0.015, w, d, (r + c) % 2 ? b : a);
    }
    if (lv === 3) {
      const gold = '#f2c14e', yy = y + 0.003;
      for (const zz of [z0 + 0.35, z1 - 0.35]) K.add(g, K.mesh(G.plane(x1 - x0 - 0.5, 0.12), gold, false, true), (x0 + x1) / 2, yy, zz);
      for (const xx of [x0 + 0.35, x1 - 0.35]) K.add(g, K.mesh(G.plane(0.12, z1 - z0 - 0.5), gold, false, true), xx, yy, (z0 + z1) / 2);
    }
  }
  K.bakeStatic(g);
  floorG = g;
  if (anim) confetti(-0.7, -12);
}
function adCanvas(lv) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const x = c.getContext('2d');
  const bg = x.createLinearGradient(0, 0, 0, 256);
  bg.addColorStop(0, lv === 3 ? '#8b5a3c' : '#59a14f'); bg.addColorStop(1, lv === 3 ? '#5b3a2c' : '#3f7f3a');
  x.fillStyle = bg; x.fillRect(0, 0, 512, 256);
  x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  const name = SHOP_LOOKS[state.up.look || 0].name;
  x.font = '900 ' + (name.length > 4 ? 64 : 78) + 'px "PingFang TC","Microsoft JhengHei",sans-serif'; x.fillText(name, 256, 92);
  x.font = '800 44px "PingFang TC","Microsoft JhengHei",sans-serif'; x.fillStyle = '#fff3a6'; x.fillText('☕ 現烘咖啡豆 ➜', 256, 188);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
// on the open grass south of the hill road, between the photo wall and the 乳牛棚 and north of the trash bin, facing
// the camera; behind it there is only grass, the road and one street lamp, so it hides no building, zone or path
const AD = { x: -0.9, z: -0.9 };
let adG = null, adBox = null;
function applyAd(anim) {
  if (adG) { scene.remove(adG); adG = null; }
  if (adBox) { unbox(adBox); adBox = null; }
  const lv = state.up.ad || 0; if (!lv) return;
  const g = K.add(scene, new THREE.Group(), AD.x, 0, AD.z);
  g.add(K.blob(1.6));
  const W = lv === 1 ? 2.4 : 4.0, H = W / 2, top = lv === 1 ? 2.2 : 3.8;
  const post = lv === 1 ? C.woodDark : '#8f969f';
  for (const sx of [-W / 2 + 0.3, W / 2 - 0.3]) K.add(g, K.mesh(G.rbox(0.18, top - H / 2, 0.18, 0.05), post), sx, (top - H / 2) / 2, 0);
  K.add(g, K.mesh(G.rbox(W + 0.24, H + 0.24, 0.16, 0.06), lv === 1 ? C.woodLight : C.white), 0, top - H / 2, -0.02);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshLambertMaterial({ map: adCanvas(lv) }));
  face.position.set(0, top - H / 2, 0.065); g.add(face);
  if (lv === 3) {
    const n = 14, bm = new THREE.MeshBasicMaterial({ color: '#fff3a6' });
    for (let i = 0; i <= n; i++) for (const yy of [top + 0.16, top - H - 0.16]) { const b = new THREE.Mesh(G.sphere(0.06, 6, 5), bm); b.position.set(-W / 2 - 0.1 + (W + 0.2) * i / n, yy, 0.08); g.add(b); }
    for (const sx of [-1.2, 1.2]) K.add(g, K.mesh(G.cyl(0.12, 0.18, 0.3, 8), '#6a7382'), sx, 0.15, 0.9).rotation.x = -0.6;
  }
  K.bakeStatic(g);
  adBox = box(AD.x - W / 2 + 0.1, AD.z - 0.2, AD.x + W / 2 - 0.1, AD.z + 0.2);
  adG = g;
  evict();
  if (anim) { popIn(g); confetti(AD.x, AD.z); }
}
// after buying a level in the upgrade panel (and once at start for what the save already has)
function applyUpgrade(k, anim) {
  if (k === 'basket') applyBasket(anim);
  if ((k === 'mgrShop' || k === 'mgrFarm') && state.up[k] >= 1) spawnManager(k, !anim);
  if (k === 'look') { applyShopLook(anim); applyAd(false); }
  if (k === 'floor') applyFloor(anim);
  if (k === 'ad') applyAd(anim);
}
// 提籃架 just inside the main door: wicker baskets (and carts at Lv2)
let basketG = null, basketBox = null;
function applyBasket(anim) {
  if (basketG) { scene.remove(basketG); basketG = null; }
  if (basketBox) { unbox(basketBox); basketBox = null; }
  const lv = state.up.basket || 0; if (!lv) return;
  const g = K.add(scene, new THREE.Group());
  for (const [x, z] of [[7.4, -9.3]]) {
    const st = K.add(g, new THREE.Group(), x, 0.12, z);
    st.add(K.blob(0.45));
    K.add(st, K.mesh(G.rbox(0.62, 0.08, 0.46, 0.03), CF.walnut), 0, 0.04, 0);
    const stacks = lv >= 2 ? [-0.15, 0.17] : [0];
    for (const sz of stacks) for (let k = 0; k < (lv >= 2 ? 4 : 3); k++) {
      K.add(st, K.mesh(G.rbox(0.5, 0.16, 0.3, 0.05), CF.oak), 0, 0.16 + k * 0.11, sz);
      K.add(st, K.mesh(G.rbox(0.42, 0.02, 0.22, 0.01), CF.walnut, false), 0, 0.245 + k * 0.11, sz);
    }
    basketBox = box(x - 0.35, z - 0.3, x + 0.35, z + 0.3);
  }
  K.bakeStatic(g); basketG = g;
  if (anim) popIn(g);
}
function shopBasket() {
  const g = new THREE.Group(); g.position.set(0.2, -0.25, 0.05);
  K.add(g, K.mesh(G.rbox(0.36, 0.2, 0.26, 0.05), CF.oak), 0, 0, 0);
  K.add(g, K.mesh(G.rbox(0.3, 0.02, 0.2, 0.01), CF.walnut, false), 0, 0.1, 0);
  const h = K.add(g, K.mesh(G.rbox(0.04, 0.2, 0.04, 0.02), CF.walnut), 0, 0.17, 0); h.rotation.z = 0.2;
  return g;
}
function shopCart() {
  const g = new THREE.Group(); g.position.set(0, -0.62, 0.42);
  K.add(g, K.mesh(G.rbox(0.5, 0.32, 0.6, 0.05), CF.oak), 0, 0.42, 0.12);
  K.add(g, K.mesh(G.rbox(0.42, 0.03, 0.52, 0.02), CF.terra, false), 0, 0.59, 0.12);
  K.add(g, K.mesh(G.rbox(0.52, 0.05, 0.06, 0.02), CF.walnut), 0, 0.72, -0.2);
  for (const x of [-0.2, 0.2]) { K.add(g, K.mesh(G.rbox(0.04, 0.32, 0.04, 0.02), '#9aa3ad'), x, 0.56, -0.2); for (const z of [-0.12, 0.36]) K.add(g, K.mesh(G.cyl(0.07, 0.07, 0.05, 10), '#4a4f58'), x, 0.08, z).rotation.z = Math.PI / 2; }
  K.add(g, K.mesh(G.rbox(0.44, 0.04, 0.5, 0.02), '#9aa3ad'), 0, 0.2, 0.12);
  return g;
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
function setLabel(L, html) {
  if (L.html === html) return;
  L.html = html;
  if (L.disp === 0) { L.dirty = true; return; }
  L.el.innerHTML = html; L.w = 0;
}
function dropLabel(L) { L.el.remove(); const i = labels.indexOf(L); if (i >= 0) labels.splice(i, 1); }
// clearer labels: zone names sit on a soft plate, far-away zones shrink, and labels that would cover
// each other are nudged upwards (the one nearer the bottom of the screen keeps its place)
const LBL2 = !params.has('lbl1'); // clearer labels are the default (?lbl1 shows the old look)
if (LBL2) document.body.classList.add('lbl2');
const shown = [];
let lblFrame = 0, lblN = -1;
const hideL = (L) => { if (L.disp !== 0) { L.disp = 0; L.el.style.display = 'none'; } };
const showL = (L) => { if (L.disp !== 1) { L.disp = 1; L.el.style.display = ''; if (L.dirty) { L.dirty = false; L.el.innerHTML = L.html; L.w = 0; } } };
function placeLabels() {
  const w = innerWidth, h = innerHeight, pp = player.p.root.position;
  shown.length = 0; lblFrame++;
  let moved = false;
  for (const L of labels) {
    if (!L.show) { hideL(L); continue; }
    L.getPos(tmpV);
    const dist = Math.hypot(tmpV.x - pp.x, tmpV.z - pp.z);
    if (L.near && dist > L.near) { hideL(L); continue; }
    tmpV.project(camera);
    if (tmpV.z > 1 || tmpV.x < -1.3 || tmpV.x > 1.3 || tmpV.y < -1.3 || tmpV.y > 1.3) { hideL(L); continue; }
    showL(L);
    L.sx = (tmpV.x + 1) / 2 * w; L.sy = (1 - tmpV.y) / 2 * h;
    // a label that moved less than half a pixel (and was already on screen) needs no new layout
    const still = L.lastF === lblFrame - 1 && L.w && Math.abs(L.sx - L.px) < 0.5 && Math.abs(L.sy - L.py) < 0.5;
    L.lastF = lblFrame;
    if (LBL2) {
      const far = L.el.classList.contains('zone') && dist > 1.6;
      if (far !== !!L.far) { L.far = far; L.el.classList.toggle('far', far); L.w = 0; }
      shown.push(L);
      if (!still) moved = true;
    } else if (!still) { L.px = L.sx; L.py = L.sy; L.w = 1; L.el.style.transform = 'translate(' + L.sx.toFixed(1) + 'px,' + L.sy.toFixed(1) + 'px) translate(-50%,-100%)'; }
  }
  if (!LBL2) return;
  if (moved || shown.length !== lblN) {
    K.layoutLabels(shown);
    for (const L of shown) { L.px = L.sx; L.py = L.sy; }
    lblN = shown.length;
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
player.p.root.position.set(7.1, 0, 5.8);
scene.add(player.p.root);
const pVel = new THREE.Vector3();
let pFace = 0;
const legsOf = (p) => p.rig.children.filter((o) => o.isGroup && Math.abs(o.position.y - 0.36) < 1e-3);
function sitPose(p) { for (const l of legsOf(p)) l.rotation.x = -1.35; }

// ---------- the coffee bars (點餐櫃台) ----------
// two bars side by side at the back of the front room (the baristas stand behind them, in front of the back bar) and a
// third in the middle of the 烘豆工坊. Lines form in front of a bar (dir: the way a line grows, qmax: spots in the first
// row), far from every door. The money tray sits on the bar's right end.
const COUNTERS = [
  { x: 2.9, z: -15.4, serve: { x: 2.9, z: -16.65 }, pile: { x: 3.85, z: -15.35, value: 0 }, on: false, dir: -1, qmax: 3 },
  { x: -1.2, z: -15.4, serve: { x: -1.2, z: -16.65 }, pile: { x: -0.25, z: -15.35, value: 0 }, on: false, dir: -1, qmax: 3 },
  { x: 1.0, z: -25.2, serve: { x: 1.0, z: -26.45 }, pile: { x: 1.95, z: -25.15, value: 0 }, on: false, dir: -1, qmax: 3 },
];
function buildCounter(i) {
  const c = COUNTERS[i]; c.on = true;
  const g = P6.cafeBar(); g.position.set(c.x, 0.12, c.z); scene.add(g);
  // a walnut gantry on the bar with two pendant lamps
  for (const sx of [-1.36, 1.36]) K.add(g, K.mesh(G.rbox(0.09, 1.3, 0.09, 0.03), CF.walnut), sx, 1.7, -0.42);
  K.add(g, K.mesh(G.rbox(2.9, 0.12, 0.12, 0.04), CF.walnut), 0, 2.36, -0.42);
  K.bakeStatic(g);
  for (const sx of [-0.7, 0.7]) { const l = P6.pendantLamp(0.5); l.g.position.set(c.x + sx, 2.42, c.z - 0.42); scene.add(l.g); shopArea.lamps.push(l); l.lit(!!shopArea.lit); }
  box(c.x - 1.45, c.z - 0.55, c.x + 1.45, c.z + 0.55);
  c.pile.grp = K.add(scene, new THREE.Group(), c.pile.x, 1.2, c.pile.z);
  const slots = [];
  for (let k = 0; k < 40; k++) {
    const col = k % 4, row = Math.floor(k / 4) % 2, lay = Math.floor(k / 8);
    slots.push({ p: V3(-0.22 + (col % 2) * 0.22, lay * 0.06, -0.24 + row * 0.24 + Math.floor(col / 2) * 0.22 - 0.1), ry: (k * 0.37) % 0.3, s: 0.62 });
  }
  c.pile.stack = itemStack('money', c.pile.grp, slots);
  c.pile.label = label('badge money', '', (o) => o.set(c.pile.x, 1.9, c.pile.z));
  c.pile.value = state.piles[i] || 0; setPile(c);
}
function setPile(c) {
  const p = c.pile, n = p.value > 0 ? Math.min(40, Math.ceil(p.value / 6)) : 0;
  p.stack.set(n);
  p.label.show = p.value > 0;
  setLabel(p.label, ICON.money + fmtMoney(p.value));
}
function fmtMoney(v) { return v >= 100000 ? (v / 1000).toFixed(0) + 'K' : v >= 10000 ? (v / 1000).toFixed(1) + 'K' : String(v); }

// ---------- 咖啡圖鑑: beans picked, drink recipes and desserts made ----------
function caught(type, at) {
  if (!isLogged(type)) return;
  const L = state.log[type] || (state.log[type] = { n: 0, b: 0 });
  L.n++;
  if (L.n === 1) {
    state.logNew = true; showLogDot();
    toast((BEANS.includes(type) ? '📖 新咖啡豆：' : DESSERTS.includes(type) ? '📖 新甜點：' : '📖 新配方：') + ITEMS[type].name + '！');
    if (at) { confetti(at.x, at.z); floatText('NEW ' + ITEMS[type].name, V3(at.x, 2, at.z), 'big'); }
    sfx('vip');
    checkPages();
  } else if (RARITY[type] >= 2 && at) {
    toast('✨ ' + RAR_NAME[RARITY[type]] + '咖啡豆：' + ITEMS[type].name + '！');
    floatText('✨ ' + ITEMS[type].name, V3(at.x, 2, at.z), 'big');
  }
}
function recBest(type, unit) { if (!isLogged(type)) return; const L = state.log[type] || (state.log[type] = { n: 0, b: 0 }); if (unit > L.b) L.b = unit; }
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
function popIn(obj) { if (obj.userData.s0 === undefined) obj.userData.s0 = obj.scale.x; obj.scale.setScalar(0.01); pops.push({ obj, t: 0 }); }
const PLANTS = { coffee: () => P6.coffeeShrub('#e3463c'), robusta: () => P6.coffeeShrub('#a8323a'), cocoa: P6.cocoaTree, vanilla: P6.vanillaVine, oat: P6.oatPlant, wheat: P6.wheatSheaf, tea: () => P6.teaBush(false), matcha: () => P6.teaBush(true), berry: P6.berryPlant };
const row = (n, w, z) => Array.from({ length: n }, (_, i) => [-w / 2 + (i + 0.5) * (w / n), z]);
const CROP_LAYOUT = {
  coffee: { w: 3.6, d: 2.8, soil: '#8a5a3a', spots: [...row(3, 3.3, -0.6), ...row(3, 3.3, 0.6)] },
  tea: { w: 3.6, d: 2.8, soil: '#7a5a3a', spots: [...row(4, 3.4, -0.6), ...row(4, 3.4, 0.6)] },
  matcha: { w: 3.6, d: 2.8, soil: '#5e4a34', spots: [...row(4, 3.4, -0.6), ...row(4, 3.4, 0.6)] },
  berry: { w: 3.6, d: 2.8, soil: '#8a5a3a', spots: [...row(4, 3.4, -0.6), ...row(4, 3.4, 0.6)] },
  robusta: { w: 3.6, d: 2.8, soil: '#7a4a2e', spots: [...row(4, 3.4, -0.6), ...row(4, 3.4, 0.6)] },
  cocoa: { w: 3.6, d: 2.8, soil: '#6e4a30', spots: [...row(3, 3.3, -0.6), ...row(3, 3.3, 0.6)] },
  vanilla: { w: 3.6, d: 2.8, soil: '#7a5a3a', spots: [...row(4, 3.4, -0.6), ...row(4, 3.4, 0.6)] },
  oat: { w: 3.6, d: 2.8, soil: '#9a6a42', spots: [...row(4, 3.4, -0.6), ...row(4, 3.4, 0.6)] },
  wheat: { w: 3.6, d: 2.8, soil: '#9a6a42', spots: [...row(4, 3.4, -0.6), ...row(4, 3.4, 0.6)] },
};
const sink = { g: null, n: 0, stack: null, t: 0 };
const rest = { ready: false, wing: false };
const tables = [];
const pets = {};
const stats = { byCounter: [0, 0, 0], meals: 0, angry: 0, sales: 0, delivery: 0, judge: 0, milk: 0, perfect: 0, regulars: 0, made: {}, dish: {}, sold: {} };
const BIN_KINDS = ['producer'];
let starSign = null;
function landCatch(s, type, from, dur = 0.55) {
  s.bin.pend = (s.bin.pend || 0) + 1;
  fly(type, from, (o) => o.set(s.outPt.x, 0.45, s.outPt.z), dur, () => { s.bin.pend--; binAdd(s.bin, type); stats.milk++; });
}
const mSlots = (dy) => { const sl = []; for (let i = 0; i < 30; i++) sl.push({ p: V3(-0.27 + (i % 4) * 0.18, 0.25 + Math.floor(i / 8) * dy, -0.15 + (Math.floor(i / 4) % 2) * 0.28), ry: Math.PI / 2, s: 0.7 }); return sl; };

function build(def, instant) {
  const id = def.id;
  if (!state.built.includes(id)) state.built.push(id);
  const s = { id, def, kind: def.kind };
  stations[id] = s; kindCache = null;
  const pos = def.pos || def.zone;
  if (def.kind === 'producer') {
    // 乳牛棚: a barn with a paddock; each cow fills a milk crate beside it (雞舍: a hen house, each hen lays eggs)
    const hens = def.animal === 'chicken';
    s.g = new THREE.Group(); s.g.position.set(pos[0], 0, pos[1]); scene.add(s.g);
    s.g.add(hens ? P6.henHouse() : P6.cowShed());
    box(pos[0] - 1.4, pos[1] - 1.75, pos[0] + 1.4, pos[1] + 1.45);
    const cx = pos[0] + 2.0, cz = pos[1] + 0.8;
    const cr = P3.crate(); cr.position.set(cx - pos[0], 0, cz - pos[1]); s.g.add(cr);
    s.outPt = V3(cx, 0, cz);
    s.bin = makeBin(cr, crateSlots(), 24);
    box(cx - 0.68, cz - 0.5, cx + 0.68, cz + 0.5);
    s.outLabel = label('badge grp', '', (o) => o.set(cx, 1.0, cz));
    s.cows = [];
    for (let i = 0; i < (hens ? 6 : 4); i++) {
      const c = hens ? P.chicken() : P.cow();
      if (hens) c.g.position.set(-0.8 + (i % 3) * 0.8, 0, 0.45 + Math.floor(i / 3) * 0.55);
      else { c.g.scale.setScalar(0.55); c.g.position.set(-0.75 + (i % 2) * 1.5, 0, 0.45 + Math.floor(i / 2) * 0.55); } c.g.rotation.y = i * 1.3; c.g.visible = false; c.g.userData.dyn = true;
      s.g.add(c.g); K.bakeStatic(c.b);
      s.cows.push({ ...c, on: false, mt: rand(0, 4), t: 0, tx: c.g.position.x, tz: c.g.position.z });
    }
    loadBin(s);
    applyGrow(s);
    if (!instant) popIn(s.g);
  } else if (def.kind === 'machine') {
    const m = P6.machine6(def.mk, !!def.in2);
    const inside = pos[1] < -12 && pos[0] < -11;
    m.g.position.set(pos[0], inside ? 0.12 : 0, pos[1]); scene.add(m.g);
    const tw = m.inTray.getWorldPosition(new THREE.Vector3()), nw = m.outTray.getWorldPosition(new THREE.Vector3());
    const t2 = m.in2Tray ? m.in2Tray.getWorldPosition(new THREE.Vector3()) : null;
    K.bakeStatic(m.spin);
    const cap = upVal('stock');
    Object.assign(s, { g: m.g, spin: m.spin, inPt: tw, in2Pt: t2, outPt: nw, inN: 0, inN2: 0, inMax: cap, outMax: cap, timer: 0, alt: 0 });
    if (def.inAny) s.inBin = makeBin(m.inTray, mSlots(0.2), 30);
    else if (def.in) s.inStack = itemStack(def.in, m.inTray, mSlots(0.18));
    if (m.in2Tray) s.in2Stack = itemStack(def.in2, m.in2Tray, mSlots(0.24));
    s.outBin = makeBin(m.outTray, mSlots(0.22), 30);
    box(pos[0] - 0.85, pos[1] - 0.8, pos[0] + 0.85, pos[1] + 0.4);
    const st = state.stock[id];
    if (st) {
      s.inN = st.a || 0; s.inN2 = st.c || 0;
      if (Array.isArray(st.l)) for (const t of st.l) if (ITEMS[t] && s.outBin.list.length < s.outMax) binAdd(s.outBin, t);
      if (s.inBin && Array.isArray(st.i)) for (const t of st.i) if (ITEMS[t] && s.inBin.list.length < s.inMax) binAdd(s.inBin, t);
    }
    s.tag = label('mtag', '', (o) => o.set(pos[0], 1.95, pos[1] - 0.3)); s.tag.near = 9;
    machTag(s);
    if (def.in || def.inAny) s.inLabel = label('badge grp', '', (o) => o.copy(tw).setY(0.95));
    s.outLabel = label('badge grp', '', (o) => o.copy(nw).setY(0.95));
    if (t2) s.in2Label = label('badge', '', (o) => o.copy(t2).setY(1.45));
    if (def.roast) { s.roastLabel = label('roast', '', (o) => o.set(pos[0], 2.75, pos[1])); s.roastLabel.near = 9; }
    if (!instant) popIn(m.g);
  } else if (def.kind === 'crop') {
    const L = CROP_LAYOUT[def.plant];
    const g = new THREE.Group(); g.position.set(pos[0], 0, pos[1]); scene.add(g);
    g.add(P6.terraceBed(L.w, L.d, L.soil));
    s.plants = [];
    for (const [x, z] of L.spots) {
      const pl = PLANTS[def.plant](); pl.g.position.set(x, 0.2, z); pl.g.userData.dyn = true; pl.fruit.userData.dyn = true; g.add(pl.g); K.bakeStatic(pl.g); K.bakeStatic(pl.fruit);
      s.plants.push({ ...pl, x: pos[0] + x, z: pos[1] + z, ripe: true, t: 0, res: null, ph: Math.random() * 6 });
    }
    s.grow = def.grow; s.g = g; s.w = L.w; s.d = L.d;
    applyGrow(s);
    if (!instant) popIn(g);
  } else if (def.kind === 'shelf') {
    const [fx, fz, ry] = FACE[def.face || 'S'];
    Object.assign(s, { items: def.items, fv: [fx, fz], ry, front: V3(pos[0] + fx * 1.25, 0, pos[1] + fz * 1.25), door: null, dk: 0 });
    shelfModel(s, upVal('shelfCap') > 40);
    loadBin(s);
    s.label = label('badge big grp', '', (o) => o.set(pos[0], s.top + 0.35, pos[1]));
    box(pos[0] - (fx ? 0.5 : 0.85), pos[1] - (fx ? 0.85 : 0.5), pos[0] + (fx ? 0.5 : 0.85), pos[1] + (fx ? 0.85 : 0.5));
    if (!instant) popIn(s.g);
  } else if (def.kind === 'hire') {
    s.worker = makeWorker(def.role, def.zone, !instant);
    s.worker.counter = def.counter || 0;
    if (def.home) s.worker.home = def.home;
  } else if (def.kind === 'pet') {
    const c = P.cat(); c.g.position.set(COUNTERS[0].x + 0.35, 1.2, COUNTERS[0].z + 0.15); c.g.rotation.y = 0.4; scene.add(c.g); pets.cat = { ...c, ph: 0 }; if (!instant) popIn(c.g);
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
  } else if (def.kind === 'counter' || def.kind === 'counterX') {
    const ci = def.counter || 0;
    buildCounter(ci);
    if (!instant) popIn(COUNTERS[ci].pile.grp);
  } else if (def.kind === 'delivery') {
    // 外送站: a pad by the road where the delivery scooter waits for big office orders
    const g = new THREE.Group(); g.position.set(DELIVERY.x, 0, DELIVERY.z); scene.add(g); s.g = g;
    const pd = P2.pad('#ff8a6b'); pd.scale.setScalar(1.6); g.add(pd);
    const post = K.add(g, new THREE.Group(), 1.9, 0, -0.9);
    K.add(post, K.mesh(G.rbox(0.14, 1.6, 0.14, 0.04), C.woodDark), 0, 0.8, 0);
    const sb = P2.signBoard('外送站', 2.2, '#ff8a6b'); sb.scale.setScalar(0.6); sb.position.set(0, 1.7, 0); post.add(sb);
    box(DELIVERY.x + 1.8, DELIVERY.z - 1.0, DELIVERY.x + 2.0, DELIVERY.z - 0.8);
    orders.delivery.ready = true;
    if (!orders.delivery.scooter) { const sc = P6.scooter(); sc.visible = false; sc.rotation.y = Math.PI; scene.add(sc); K.bakeStatic(sc); orders.delivery.scooter = sc; }
    if (!instant) popIn(g);
  } else if (def.kind === 'judge') {
    const g = P6.judgeDesk(); g.position.set(JUDGE.x, 0, JUDGE.z); scene.add(g); s.g = g;
    box(JUDGE.x - 1.05, JUDGE.z - 0.4, JUDGE.x + 1.05, JUDGE.z + 0.4);
    orders.judge.ready = true;
    if (!instant) popIn(g);
  } else if (def.kind === 'photo') {
    const g = P6.photoWall(); g.position.set(PHOTO.x, 0, PHOTO.z); scene.add(g); s.g = g;
    box(PHOTO.x - 1.2, PHOTO.z - 0.25, PHOTO.x + 1.2, PHOTO.z + 0.25);
    box(PHOTO.x + 0.25, PHOTO.z + 1.05, PHOTO.x + 0.55, PHOTO.z + 1.35);
    if (!instant) popIn(g);
  } else if (def.kind === 'door') {
    marketFront();
    if (!instant) confetti(DOORS[def.di].x, -6.0);
  } else if (def.kind === 'dept') {
    applyDept(!instant);
  } else if (def.kind === 'expand') {
    applyExpand(!instant);
  } else if (def.kind === 'mapgate') {
    mapsSet('harbor');
    if (!instant) setTimeout(() => openPanel('map'), 900);
  } else if (def.kind === 'star') {
    const g = new THREE.Group(); scene.add(g); s.g = g;
    const sb = P2.signBoard('★ 山城之星 ★', 5, '#ff7eb6'); sb.position.set(-17.4, 4.75, RB + 0.1); g.add(sb);
    g.add(P6.stringLights(-23.4, RB + 0.2, -11.4, RB + 0.2, 3.3));
    starSign = sb;
    if (!instant) popIn(g);
  }
  if ((id === 'roaster' || id === 'grinder') && stations.roaster && stations.grinder) makeChute(!instant);
  if (s.g && s.g.isObject3D) K.bakeStatic(s.g);
  if (!instant) { confetti(pos[0], pos[1]); sfx('unlock'); toast('🎉 ' + def.name + ' 完成！' + (def.note || '')); }
  evict();
  refreshZones();
  save();
}
// (re)build a display's model: a wooden wall shelf, or a glass pastry case for chilled goods; past 40 goods it grows a
// board (or a glass tier) taller. The goods are instanced meshes inside it, so a full display costs no extra draw calls.
function shelfModel(s, big) {
  const list = s.bin ? s.bin.list.slice() : [];
  if (s.g) scene.remove(s.g);
  const def = s.def, pos = def.pos;
  const glass = def.fridge || (def.face === 'N' && pos[1] > -10);   // the window displays at the front are glass cases too
  const sh = glass ? P6.vitrine(big) : P6.wallShelf(big);
  sh.g.position.set(pos[0], 0.12, pos[1]); sh.g.rotation.y = s.ry; scene.add(sh.g);
  if (!glass) { const ic = itemMesh(def.items[0]); ic.scale.setScalar(0.85); ic.position.set(0, sh.top + 0.18, 0.1); sh.g.add(ic); }
  const slots = sh.slots.slice(0, 50).map((p, i) => ({ p, ry: Math.PI / 2 + (i % 3) * 0.2 - 0.2, s: glass ? 0.85 : 0.9 }));
  s.g = sh.g; s.top = sh.top; s.big = big;
  s.bin = makeBin(sh.g, slots, 50);
  for (const t of list) binAdd(s.bin, t);
  K.bakeStatic(sh.g);
}
// a wooden chute carries roasted beans from the roaster straight into the grinder
let chute = null;
function makeChute(pop) {
  if (chute) return;
  const a = stations.roaster.outPt, b = stations.grinder.inPt;
  const g = new THREE.Group(); scene.add(g);
  const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
  const tr = K.add(g, new THREE.Group(), (a.x + b.x) / 2, 1.25, (a.z + b.z) / 2); tr.rotation.y = Math.atan2(dx, dz);
  K.add(tr, K.mesh(G.rbox(0.36, 0.08, len - 0.6, 0.03), C.woodDark), 0, 0, 0);
  for (const s of [-1, 1]) K.add(tr, K.mesh(G.rbox(0.05, 0.14, len - 0.6, 0.02), C.wood), s * 0.18, 0.07, 0);
  for (const k of [-0.3, 0.3]) { const p = K.add(g, K.mesh(G.cyl(0.05, 0.05, 1.25, 6), C.woodDark), a.x + dx * (0.5 + k), 0.62, a.z + dz * (0.5 + k)); p.castShadow = false; }
  K.bakeStatic(g);
  chute = { g, t: 0 };
  if (pop) popIn(g);
}
function updateChute(dt) {
  if (!chute) return;
  const r = stations.roaster, gr = stations.grinder;
  chute.t -= dt;
  if (chute.t > 0 || !binCount(r.outBin, 'roasted') || gr.inN + (gr.pend || 0) >= gr.inMax) return;
  chute.t = 0.45; binTake(r.outBin, 'roasted'); gr.pend = (gr.pend || 0) + 1;
  fly('roasted', V3(r.outPt.x, 1.3, r.outPt.z), (o) => o.copy(gr.inPt).setY(0.5), 0.7, () => { gr.pend--; gr.inN = Math.min(gr.inMax, gr.inN + 1); });
}
// a machine's name tag: name (and level), what goes in and what comes out
function machHow(d) {
  const ins = d.inAny ? d.inAny.map((t) => ICON[t]).join('') : [d.in, d.in2].filter(Boolean).map((t) => ICON[t]).join('＋');
  return (ins ? ins + ' → ' : '→ ') + (d.outs || [d.out]).map((t) => ICON[t]).join('');
}
function machTag(s) {
  const lv = GROW[s.id] ? lvlOf(s.id) : 1;
  setLabel(s.tag, '<b>' + s.def.name + (lv > 1 ? ' Lv' + lv : '') + '</b><span>' + machHow(s.def) + '</span>');
}
function applyGrow(s) {
  const id = s.id; if (!GROW[id]) return;
  const n = lvlOf(id);
  if (s.cows) s.cows.forEach((c, i) => { const on = i < n; if (on && !c.g.visible) popIn(c.g); c.g.visible = on; c.on = on; });
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
// terracotta and cream checker tiles in the kitchen strip along the back wall
function restKitchen(g, x0, x1) {
  K.add(g, K.mesh(G.rbox(x1 - x0, 0.03, 2.6, 0.02, 1), '#f4e6cf', false, true), (x0 + x1) / 2, 0.135, RB + 1.45);
  for (let x = x0, i = 0; x < x1 - 0.3; x += 0.65, i++) for (let r = 0; r < 4; r++) if ((i + r) % 2 === 0) K.add(g, K.mesh(G.plane(0.62, 0.62), '#d98a5f', false, true), x + 0.33, 0.152, RB + 0.48 + r * 0.65);
}
// brick back wall with a walnut beam and arched-looking windows with walnut frames
function restWall(g, cx, w) {
  brickPiece(g, w, 2.2, 0.4, cx, RB);
  for (const x of [cx - w / 3, cx, cx + w / 3]) {
    K.add(g, K.mesh(G.rbox(2.3, 1.1, 0.06, 0.05), CF.walnut), x, 1.3, RB + 0.2);
    K.add(g, K.mesh(G.rbox(2.1, 0.92, 0.06, 0.05), '#cfe9f2'), x, 1.3, RB + 0.23);
    K.add(g, K.mesh(G.rbox(0.07, 0.92, 0.08, 0.02), CF.walnut), x, 1.3, RB + 0.25);
  }
}
function buildRestaurant(instant) {
  const g = K.add(scene, new THREE.Group());
  const cx = (R0 + REST.x1) / 2, w = REST.x1 - R0, d = REST.z1 - REST.z0;
  K.add(g, K.mesh(G.rbox(w, 0.12, d, 0.06, 2), '#a8754a', false, true), cx, 0.06, (REST.z0 + REST.z1) / 2);
  planks(g, R0 + 0.05, REST.x1 - 0.05, RB + 2.8, REST.z1 - 0.05, ['#a8754a', '#9a6a42', '#b5814f']);
  restKitchen(g, R0 + 0.2, REST.x1 - 0.2);
  restWall(g, cx, w);
  const sign = P6.cafeSign('山城咖啡館', 4.2, CF.terra); sign.position.set(cx, 2.95, RB + 0.1); g.add(sign);
  for (const [x0, z0, x1, z1] of [[R0, REST.z1, -13.3, REST.z1], [REST.x1, REST.z1, REST.x1, RB + 0.2]]) g.add(P3.railLine(x0, z0, x1, z1));
  rest.frontBox = box(R0 - 0.15, REST.z1 - 0.15, -13.2, REST.z1 + 0.15);
  box(REST.x1 - 0.15, RB, REST.x1 + 0.15, REST.z1);
  rest.backBox = box(R0, RB - 0.3, REST.x1, RB + 0.2);
  for (const [x, c] of [[-18.4, '#ffd34a'], [-13.3, '#ff6b5a'], [REST.x1, '#ffd34a']]) K.add(g, P3.lantern(c), x, 0, REST.z1);
  const sk = P3.sink(); sk.position.set(SINK.x, 0.12, SINK.z); g.add(sk);
  sink.g = K.add(scene, new THREE.Group(), SINK.x, 0.12, SINK.z);
  const slots = [];
  for (let i = 0; i < 10; i++) slots.push({ p: V3(-0.2 + (i % 2) * 0.4, 0.82 + Math.floor(i / 2) * 0.06, 0.05) });
  sink.stack = itemStack('cup', sink.g, slots);
  g.add(P6.stringLights(R0, REST.z1, REST.x1, REST.z1, 2.5));
  box(SINK.x - 0.55, SINK.z - 0.45, SINK.x + 0.55, SINK.z + 0.45);
  K.bakeStatic(g);
  // the west railing goes away when the restaurant is extended
  if (!isBuilt('restWing')) {
    rest.westRail = K.add(scene, new THREE.Group());
    rest.westRail.add(P3.railLine(R0, REST.z1, R0, RB + 0.2)); K.add(rest.westRail, P3.lantern('#ff6b5a'), R0, 0, REST.z1);
    K.bakeStatic(rest.westRail);
    rest.westBox = box(R0 - 0.15, RB, R0 + 0.15, REST.z1);
  }
  const lamps = [];
  for (const x of [-21.5, -17.4, -13.3]) { const l = P2.wallLamp(); l.g.position.set(x, 1.85, RB + 0.3); scene.add(l.g); lamps.push(l); }
  restArea = makeArea(R0, REST.z0, REST.x1, REST.z1, lamps, cx, -12);
  rest.ready = true;
  if (!instant) popIn(g);
}
function buildWing(instant) {
  const g = K.add(scene, new THREE.Group());
  const x0 = WING_X0, x1 = R0, cx = (x0 + x1) / 2, w = x1 - x0, d = REST.z1 - REST.z0;
  K.add(g, K.mesh(G.rbox(w + 0.1, 0.12, d, 0.06, 2), '#a8754a', false, true), cx, 0.06, (REST.z0 + REST.z1) / 2);
  planks(g, x0 + 0.05, x1, RB + 2.8, REST.z1 - 0.05, ['#a8754a', '#9a6a42', '#b5814f']);
  restKitchen(g, x0 + 0.2, x1);
  restWall(g, cx, w);
  const sign = P6.cafeSign('戶外露台', 4.2, CF.sageDark); sign.position.set(cx, 2.95, RB + 0.1); g.add(sign);
  g.add(P6.stringLights(x0, REST.z1, x1, REST.z1, 2.5));
  for (const [a, b, c, e] of [[x0, REST.z1, x1, REST.z1], [x0, REST.z1, x0, RB + 0.2]]) g.add(P3.railLine(a, b, c, e));
  for (const [x, c] of [[x0, '#ff6b5a'], [-32, '#ffd34a'], [-27.6, '#ff6b5a']]) K.add(g, P3.lantern(c), x, 0, REST.z1);
  for (const z of [-7.0, -12.4]) { const x = -39.0; g.add(shopPot(x, z)); box(x - 0.35, z - 0.35, x + 0.35, z + 0.35); }
  box(x0 - 0.15, REST.z1 - 0.15, x1, REST.z1 + 0.15);
  box(x0 - 0.15, RB, x0 + 0.15, REST.z1);
  box(x0, RB - 0.3, x1, RB + 0.2);
  K.bakeStatic(g);
  if (rest.westRail) { scene.remove(rest.westRail); rest.westRail = null; }
  if (rest.westBox) { unbox(rest.westBox); rest.westBox = null; }
  for (const x of [-37, -32, -27]) { const l = P2.wallLamp(); l.g.position.set(x, 1.85, RB + 0.3); scene.add(l.g); restArea.lamps.push(l); }
  REST.x0 = x0; restArea.x0 = x0; restArea.light.position.x = -25.6; restArea.light.distance = 30;
  rest.wing = true;
  if (!instant) popIn(g);
}
function buildTable(i, instant) {
  if (tables.some((t) => t.i === i)) return;
  const [x, z] = T_POS[i];
  const tb = P6.bistroTable(); tb.g.position.set(x, 0.12, z); scene.add(tb.g);
  const t = { i, x, z, g: tb.g, st: 'free', seats: [], pile: { value: state.tpiles[i] || 0 }, patience: 0, claim: null, t: 0, arrived: 0 };
  for (const sd of tb.seats) {
    const seat = { wx: x + sd.x, wz: z + sd.z, face: sd.face, dish: null, got: false, diner: null, claim: null, vis: {} };
    for (const type of [...DISHES, 'cup']) {
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

// ---------- maps unlocked across the whole game (shared with the farm) ----------
const MAPS_KEY = 'farm_maps_v1';
function mapsGet() { try { return JSON.parse(localStorage.getItem(MAPS_KEY) || '{}'); } catch (e) { return {}; } }
function mapsSet(id) { const m = mapsGet(); m[id] = true; try { localStorage.setItem(MAPS_KEY, JSON.stringify(m)); } catch (e) { /* storage off */ } }

// ① pick one of the two starting choices → ② the free cash counter → ③ the first shelf for that choice.
// A line of glowing dots on the ground leads along the walking path to the next thing to build.
const FIRST_SHELF = { arabica: 'shelfCherry', cowShed: 'shelfMilk' };
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
    { t: '二選一：咖啡園或乳牛棚', ok: !!picked },
    { t: '蓋點餐櫃台', ok: isBuilt('counter') },
    { t: picked ? '蓋' + DEF[FIRST_SHELF[picked.id]].name : '蓋展示架或玻璃櫃', ok: Object.values(FIRST_SHELF).some(isBuilt) },
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
    if (def.kind === 'mapgate' && mapsGet()[def.id]) open = false;   // that branch is already open (from an older save)
    if (!open && def.start && zones[def.id]) killZone(def.id);   // the other starting choice steps aside for now
    if (!open) continue;
    const zd = zoneDef(def);
    if (zones[def.id] && zones[def.id].def.cost.money !== zd.cost.money) killZone(def.id);   // the price moved after a hire
    if (!zones[def.id]) makeZone(zd);
  }
  // maxed (or no longer valid) growth zones always go away
  const gd = growDefs(), live = new Set(gd.map((d) => d.id));
  for (const id of Object.keys(zones)) if (id.startsWith('g_') && !live.has(id)) killZone(id);
  for (const def of gd) {
    const z = zones[def.id];
    if (z && z.def.lv !== def.lv) killZone(def.id);
    if (!zones[def.id]) makeZone(def);
  }
}
function frontOf(def) {
  if (def.kind === 'crop') return [def.pos[0], def.pos[1] + CROP_LAYOUT[def.plant].d / 2 + 1.5];
  if (def.kind === 'shelf') { const [fx, fz] = FACE[def.face || 'S']; return [def.pos[0] + fx * 1.7, def.pos[1] + fz * 1.7]; }
  if (def.kind === 'machine' || def.kind === 'table') return [def.pos[0], def.pos[1] + 1.7];
  return def.zone || def.pos;
}
function zoneSpot(def) { return def.zone || frontOf(def); }
// a machine's 「做更快」 zone sits a step further out than its build zone, clear of the trays where goods are dropped off
const upAt = (def) => [def.pos[0], def.pos[1] + 2.6];
function growDefs() {
  const out = [];
  for (const key in GROW) {
    const g = GROW[key], n = lvlOf(key);
    if (n >= g.max || !isBuilt(key)) continue;
    out.push({ id: 'g_' + key, name: g.what, kind: 'grow', target: key, lv: n, zone: g.mach ? upAt(DEF[key]) : frontOf(DEF[key]), cost: { money: g.cost[Math.min(n - g.start, g.cost.length - 1)] } });
  }
  return out;
}
function grow(def) {
  state.lvl[def.target] = Math.min(GROW[def.target].max, lvlOf(def.target) + 1);
  applyGrow(stations[def.target]);
  if (stations[def.target] && stations[def.target].tag) machTag(stations[def.target]);
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
  if (def.kind === 'expand') ring.scale.set(1.7, 1, 1.7);
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
  const d = z.def, how = d.kind === 'machine' ? '<div class="how">' + machHow(d) + '</div>'
    : d.kind === 'grow' && GROW[d.target] && GROW[d.target].mach ? '<div class="how">Lv' + d.lv + ' → Lv' + (d.lv + 1) + '</div>'
    : d.desc && z.on ? '<div class="desc">' + d.desc + '</div>' : '';
  setLabel(z.label, '<div class="zn">' + d.name + '</div>' + how + rows);
  let paidSum = 0; for (const k in z.def.cost) paidSum += Math.min(z.def.cost[k], z.paid[k] || 0);
  const k01 = z.total ? paidSum / z.total : 0;
  const big = z.def.kind === 'expand' ? 1.7 : 1;   // the 擴建 zone is a bigger square
  z.fill.scale.set(big, 1, Math.max(0.001, k01) * big);
  z.fill.position.z = 0.95 * big * (1 - k01);
}
function payZones(dt) {
  for (const id in zones) {
    const z = zones[id];
    const onZ = dist2(player.p.root.position, z.x, z.z) <= 1.35;
    if (onZ !== !!z.on) { z.on = onZ; if (z.def.desc) updateZoneLabel(z); }
    if (!onZ) { z.tick = 0; z.armed = true; z.stay = 0; continue; }
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

// ---------- routing: market door, café gate and aisles ----------
const inShop = (x, z) => z < SHOP.z1 && z > SHOP.z0 - 0.4 && x > SHOP.x0 && x < SHOP.x1;
const inRest = (x, z) => rest.ready && z < REST.z1 && z > REST.z0 && x > REST.x0 && x < REST.x1;
// ---------- workers ----------
const workers = [];
const LOOKS = {
  cashier: { body: '#b48cff', hat: 'bun', hatColor: '#7a4fd6', apron: C.white },
  picker: { body: '#9fd86b', hat: 'straw', legs: '#8b5a3c' },
  roaster: { body: '#c96a4a', hat: 'cap', hatColor: '#3a2a22', apron: '#3a2a22' },
  barista: { body: '#fbfaf5', hat: 'cap', hatColor: '#59a14f', apron: '#59a14f', legs: '#3a2a22' },
  waiter: { body: '#fbfaf5', hat: 'bun', hatColor: '#5b3a2c', apron: '#8b5a3c', legs: '#4a4f5a' },
  washer: { body: '#7fd6c9', hat: 'cap', hatColor: '#ffffff', apron: '#5aa9ff' },
  baker: { body: '#fbfaf5', hat: 'bun', hatColor: '#ffffff', apron: '#ffb347' },
  manager: { body: '#4a5a86', hat: 'bun', hatColor: '#3a2a22', apron: '#ffffff' },
  supervisor: { body: '#7aa65a', hat: 'cap', hatColor: '#3f6b2e', apron: '#e9f5d8' },
};
// 「多請一位」: extra staff bought from the 員工 tab (cashiers stay one per counter)
const HIRE = {
  picker: { name: '採豆工', ic: 'cherry', base: 600, home: [7.6, 6.0] },
  roaster: { name: '烘豆師', ic: 'roasted', base: 700, home: [-7.0, 9.7] },
  barista: { name: '咖啡師', ic: 'latte', base: 900, home: [-17.0, -16.6] },
  waiter: { name: '外場', ic: 'americano', base: 900, home: [-12.6, -11.0] },
  washer: { name: '洗杯工', ic: 'cup', base: 800, home: [-12.6, -13.4] },
  baker: { name: '烘焙師', ic: 'croissant', base: 900, home: [-4.0, 26.6] },
};
// what each kind of staff carries (cashiers, 外場 and 洗杯工 have their own jobs)
const ONLY = {
  picker: [...RAW, 'greenbean'],
  roaster: ['greenbean', 'roasted', 'ground', 'tealeaf', 'blacktea', 'tencha', 'matcha'],
  barista: ['ground', 'foam', 'oatmilk', 'cocoa', 'syrup', 'ice', 'milk', 'geisha', 'bluemt', 'civet', 'americano', 'latte', 'colddrip'],
  baker: ['wheat', 'milk', 'ground', 'croissant', 'cheesecake', 'tiramisu', 'strawberry', 'strawcake', 'egg', 'waffle', 'cocoa', 'chocolate'],
};
const HIRE_MAX = 6;
const roleOpen = (role) => DEFS.some((d) => d.kind === 'hire' && d.role === role && isBuilt(d.id));
const roleCount = (role) => workers.filter((w) => w.role === role).length;
// one price list for hiring, on the map or in the 員工 tab: the next worker of a role costs base × 1.8 for every one already working
const HIRE_BASE = { picker: 180, roaster: 830, waiter: 2200, washer: 4900, barista: 6200, baker: 23400 };
const hirePrice = (role) => Math.round(HIRE_BASE[role] * Math.pow(1.8, roleCount(role)) / 10) * 10;
function hireCost(role) { return (state.extra[role] || 0) >= HIRE_MAX ? null : hirePrice(role); }
const zoneDef = (def) => (def.kind === 'hire' && HIRE_BASE[def.role] ? { ...def, cost: { money: hirePrice(def.role) } } : def);
function hireExtra(role) {
  const cost = hireCost(role);
  if (cost === null || state.money < cost || !roleOpen(role)) return false;
  state.money -= cost; updateMoney();
  state.extra[role] = (state.extra[role] || 0) + 1; const w = makeWorker(role, HIRE[role].home, true); const p = w.p.root.position; puff(p.x, 1, p.z, '#ffffff', 8, 0.8);
  sfx('unlock'); toast('🎉 多請了一位' + HIRE[role].name + '！'); refreshZones(); save();
  return true;
}
function makeWorker(role, at, pop) {
  const p = K.person(LOOKS[role]);
  p.root.position.set(at[0], 0, at[1]); scene.add(p.root); if (pop) popIn(p.root);
  const w = carrier(p);
  Object.assign(w, { role, job: null, wait: 0, face: 0, moving: 0 });
  w.cap = () => upVal('wcap') + (isFarmRole(role) ? FARM_CAP[mFarm()] : 0);
  workers.push(w);
  return w;
}
// 管理層 NPCs: the 店長 walks the market aisle, the 莊園主管 the processing yard (they only wander and boost the others)
const MGR_HOME = { manager: [-1.0, -12.4], supervisor: [-2.4, 5.2] };
function spawnManager(k, quiet) {
  const role = k === 'mgrShop' ? 'manager' : 'supervisor';
  if (workers.some((w) => w.role === role)) return;
  const w = makeWorker(role, MGR_HOME[role], !quiet);
  w.home = MGR_HOME[role];
  if (!quiet) { const p = w.p.root.position; puff(p.x, 1, p.z, '#ffffff', 8, 0.8); }
}
// stuck with the same load for a long time (nobody takes it): walk to the trash bin, empty it, carry on
function stuckCheck(w, dt) {
  const n = w.carry.length;
  if (n !== w.lastN || !n || w.incoming) { w.lastN = n; w.stuckT = 0; return; }
  w.stuckT += dt;
  if (w.stuckT > 14 && !(w.job && w.job.phase === 'trash')) {
    if (w.job && w.job.plant && w.job.plant.res === w) w.job.plant.res = null;
    if (w.tg && w.tg.s && w.tg.s.claim === w) w.tg.s.claim = null;
    for (const t of tables) for (const s of t.seats) if (s.claim === w) s.claim = null;
    w.tg = null; w.job = { phase: 'trash' }; w.stuckT = 0;
  }
}
function trashRun(w, dt, sp) {
  const p = w.p.root.position;
  if (go(w, bin.px + 0.5, bin.pz + 0.2, dt, sp) || dist2(p, bin.px, bin.pz) < 0.9) {
    w.xfer -= dt;
    if (w.xfer > 0) return;
    if (!w.carry.length) { w.job = null; w.lastN = 0; w.hold = 0; return; }
    w.xfer = 0.07; bin.t = 0.3;
    const it = w.carry.pop(), from = new THREE.Vector3(); it.m.getWorldPosition(from);
    w.p.back.remove(it.m); restack(w);
    fly(it.type, from, (o) => o.set(bin.x, 0.95, bin.z), 0.25, () => {});
    stats.trashed = (stats.trashed || 0) + 1;
  }
}
// walk along a nav path; arrives at the last waypoint (the target, or the nearest free spot when it is blocked)
function go(w, x, z, dt, speed) {
  const key = x.toFixed(2) + ',' + z.toFixed(2);
  if (w.routeKey !== key || w.navV !== navV) { if (!navTake()) { w.moving = 0; return false; } w.routeKey = key; w.navV = navV; const p = w.p.root.position; w.route = nav.path(p.x, p.z, x, z); if (!w.route.length) w.route = [[x, z]]; }
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
let kindCache = null;
function listOf(kind) {
  if (!kindCache) { kindCache = {}; for (const s of Object.values(stations)) (kindCache[s.kind] = kindCache[s.kind] || []).push(s); }
  return kindCache[kind] || [];
}
const binStations = () => Object.values(stations).filter((s) => s.bin && BIN_KINDS.includes(s.kind));
function idleWander(w, dt, cx, cz) {
  w.wait -= dt;
  if (!w.wp || w.wait <= 0) { w.wp = [cx + (Math.random() - 0.5) * 2.4, cz + (Math.random() - 0.5) * 1.6]; w.wait = 2 + Math.random() * 2; }
  go(w, w.wp[0], w.wp[1], dt, 1.6);
}
const stores = () => listOf('store');
const storeCap = () => upVal('store') * Math.max(1, stores().length);
// the warehouse nearest to a spot (workers drop off and pick up at the closest one)
function nearStore(p) {
  let best = null, bd = 1e9;
  for (const s of stores()) { const d = dist2(p, s.depPt.x, s.depPt.z); if (d < bd) { bd = d; best = s; } }
  return best;
}
const storeTotal = () => Object.values(state.store).reduce((a, b) => a + b, 0);
const srcCount = (src, item) => src.kind === 'store' ? (state.store[item] || 0) : src.kind === 'machine' ? binCount(src.outBin, item) : src.bin ? binCount(src.bin, item) : 0;
function srcTake(src, item) { if (src.kind === 'store') state.store[item]--; else if (src.kind === 'machine') binTake(src.outBin, item); else if (src.bin) binTake(src.bin, item); }
const srcPoint = (src) => (src.kind === 'store' ? src.outPt : src.kind === 'machine' ? V3(src.outPt.x + 0.3, 0, src.outPt.z + 0.9) : V3(src.outPt.x, 0, src.outPt.z + 0.95));
const machOuts = (m) => m.def.outs || (m.def.out ? [m.def.out] : []);
const machIns = (m) => (m.def.inAny ? m.def.inAny : [m.def.in, m.def.in2].filter(Boolean));
const inCount = (m, item) => (m.def.inAny ? m.inBin.list.length : item === m.def.in2 ? m.inN2 : m.inN);
const inPend = (m, item) => (item === m.def.in2 ? (m.pend2 || 0) : (m.pend || 0));
// can this item be produced at all right now (any field / shed / machine built that makes it)?
function producible(t) {
  for (const s of Object.values(stations)) {
    if (s.kind === 'producer' && s.def.out === t) return true;
    if (s.kind === 'crop' && (s.def.out === t || (s.def.plant === 'coffee' && (t === 'geisha' || t === 'bluemt' || t === 'civet')) || (s.def.plant === 'robusta' && t === 'civet'))) return true;
    if (s.kind === 'machine' && machOuts(s).includes(t)) return true;
  }
  return false;
}
function sourceFor(item, w) {
  let best = null, bd = 1e9;
  for (const s of Object.values(stations)) {
    let ok = false;
    if (s.bin && BIN_KINDS.includes(s.kind) && binCount(s.bin, item) > 0) ok = true;
    if (s.kind === 'machine' && binCount(s.outBin, item) > 0) ok = true;
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
  const only = ONLY[w.role] || null;
  const okItem = (t) => !only || only.includes(t);
  const want = (it) => customers.filter((c) => c.st === 'shop' && c.item === it).length;
  let best = null;
  const consider = (k, dst, src, item) => { if (!best || k > best.k) best = { k, dst, src, item }; };
  const taken = (dst, item) => workers.some((o) => o !== w && o.job && o.job.dst === dst && o.job.item === item);
  for (const s of listOf('shelf')) {
    const space = shelfSpace(s); if (space < 2) continue;
    for (const item of s.items) {
      if (!okItem(item)) continue;
      const src = sourceFor(item, w); if (!src) continue;
      const have = binCount(s.bin, item);
      consider(want(item) * 8 + space * 0.6 + (have === 0 ? 4 : 0) + Math.random() * 2 - (taken(s, item) ? 12 : 0), s, src, item);
    }
  }
  for (const m of listOf('machine')) for (const item of machIns(m)) {
    if (!okItem(item)) continue;
    const space = m.inMax - inCount(m, item) - inPend(m, item); if (space < 3) continue;
    const src = sourceFor(item, w); if (!src) continue;
    const dish = machOuts(m).some((t) => DISHES.includes(t) && demandFor(t));
    consider(space * 0.9 + (inCount(m, item) === 0 ? 5 : 0) + (dish ? 6 : 0) + Math.random() * 2 - (taken(m, item) ? 12 : 0), m, src, item);
  }
  // crates and machine trays filling up with things nobody needs yet: move them to the warehouse so work keeps going
  const wh = nearStore(w.p.root.position);
  if (wh && storeTotal() < storeCap() - 10) for (const s of [...binStations(), ...listOf('machine')]) {
    const b = s.kind === 'machine' ? s.outBin : s.bin;
    const fill = b.list.length / b.max; if (fill < 0.6) continue;
    const cnt = {}; for (const t of b.list) if (okItem(t)) cnt[t] = (cnt[t] || 0) + 1;
    const item = Object.keys(cnt).sort((a, c) => cnt[c] - cnt[a])[0]; if (!item) continue;
    const tk = workers.some((o) => o !== w && o.job && o.job.src === s && o.job.dst === wh);
    consider((fill >= 0.95 ? 14 : fill * 8 - 1) - (tk ? 12 : 0), wh, s, item);
  }
  return best ? { dst: best.dst, src: best.src, item: best.item, phase: 'get' } : null;
}
function depositTo(c, dst, item, dt) {
  c.xfer -= dt;
  if (c.xfer > 0 || count(c, item) <= 0) return;
  if (dst.kind === 'store') {
    if (storeTotal() + (dst.pend || 0) >= storeCap()) return;
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
      if (two) { dst.pend2--; dst.inN2 = Math.min(dst.inMax, dst.inN2 + 1); }
      else { dst.pend--; if (dst.inBin) { if (dst.inBin.list.length < dst.inMax) binAdd(dst.inBin, item); } else dst.inN = Math.min(dst.inMax, dst.inN + 1); }
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
  if (dst.kind === 'store') return storeTotal() >= storeCap();
  return inCount(dst, item) + inPend(dst, item) >= dst.inMax;
}
const orderWants = (t) => Object.values(orders).some((o) => o.st === 'wait' && o.order && o.order[t] > 0);
const usable = (t) => DEFS.some((d) => (isBuilt(d.id) || zones[d.id]) && ((d.items && d.items.includes(t)) || d.in === t || d.in2 === t || (d.inAny && d.inAny.includes(t)))) || Object.values(zones).some((z) => z.def.cost[t] && left(z, t) > 0) || stores().length > 0 || orderWants(t);
function dstFor(type, at) {
  const wh = stores().length && storeTotal() < storeCap() ? nearStore(at || V3(0, 0, 0)) : null;
  return listOf('shelf').find((s) => s.items.includes(type) && !isFull(s, type)) || listOf('machine').find((m) => machIns(m).includes(type) && !isFull(m, type)) || wh;
}
function updateWorker(w, dt) {
  const sp = upVal('wspeed') * (isFarmRole(w.role) ? FARM_SP[mFarm()] : 1);
  w.moving = 0;
  if (w.role === 'cashier') { const c = COUNTERS[w.counter || 0]; if (go(w, c.serve.x, c.serve.z, dt, sp)) w.face = 0; return; }
  if (w.role === 'manager' || w.role === 'supervisor') { idleWander(w, dt, w.home[0], w.home[1]); return; }
  if (w.role !== 'washer') stuckCheck(w, dt);
  if (w.job && w.job.phase === 'trash') { trashRun(w, dt, sp); return; }
  if (w.role === 'waiter') { updateWaiter(w, dt, sp); return; }
  if (w.role === 'washer') { updateWasher(w, dt, sp); return; }
  // 採豆工 / 烘豆師 / 咖啡師 / 烘焙師: fetch a full load of their own goods, deliver it to a shelf, machine or the warehouse
  const home = w.home || HIRE[w.role].home;
  if (!w.job) {
    if (w.carry.length && !w.incoming) {
      const type = w.carry[w.carry.length - 1].type, dst = dstFor(type, w.p.root.position);
      if (dst) { w.job = { dst, item: type, phase: 'put' }; w.hold = 0; }
      else {
        // no shelf, machine or warehouse with room for it: wait a moment, then dump it in the trash bin
        w.hold = (w.hold || 0) + dt;
        if (w.hold > 3) { w.hold = 0; w.job = { phase: 'trash' }; return; }
        idleWander(w, dt, home[0], home[1]); return;
      }
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
      if (!pl) { j.phase = w.carry.length ? 'put' : 'done'; }
      else if (go(w, pl.x, pl.z + 0.7, dt, sp)) { pickPlant(src, pl, w); j.plant = null; }
    } else {
      const sp0 = srcPoint(src);
      if (go(w, sp0.x, sp0.z, dt, sp) || dist2(w.p.root.position, src.outPt.x, src.outPt.z) < 1.3) {
        w.xfer -= dt;
        if (w.xfer <= 0 && srcCount(src, j.item) > 0 && room(w) > 0) { w.xfer = 0.1; srcTake(src, j.item); takeInto(w, j.item, V3(src.outPt.x, 0.4, src.outPt.z)); }
        if ((srcCount(src, j.item) <= 0 || room(w) <= 0) && !w.incoming) j.phase = w.carry.length ? 'put' : 'done';
      }
    }
  } else if (j.phase === 'put') {
    if (!w.incoming) {
      // carrying something else too (a rare bean from the field): deliver the top of the stack first
      if (!count(w, j.item) && w.carry.length) { j.item = w.carry[w.carry.length - 1].type; const d2 = dstFor(j.item, w.p.root.position); if (d2) j.dst = d2; else { j.phase = 'done'; } }
      if (j.phase === 'put' && isFull(j.dst, j.item) && count(w, j.item)) { const d2 = dstFor(j.item, w.p.root.position); if (d2 && d2 !== j.dst) j.dst = d2; }
      if (j.phase === 'put') {
        const p = dstPoint(j.dst, j.item);
        if (go(w, p.x + 0.4, p.z, dt, sp) || dist2(w.p.root.position, p.x, p.z) < 1.1) {
          depositTo(w, j.dst, j.item, dt);
          if (count(w, j.item) === 0 || isFull(j.dst, j.item)) j.phase = w.carry.length && !isFull(j.dst, j.item) ? 'put' : 'done';
        }
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
  for (const s of [...listOf('machine'), ...listOf('store')]) {
    const ok = (s.kind === 'machine' && binCount(s.outBin, type) > 0) || (s.kind === 'store' && (state.store[type] || 0) > 0);
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
      const back = listOf('machine').find((m) => machOuts(m).includes(type) && m.outBin.list.length < m.outMax) || nearStore(w.p.root.position);
      if (!back) { w.hold = 0; w.job = { phase: 'trash' }; return; }
      const pt = back.kind === 'store' ? back.depPt : V3(back.outPt.x, 0, back.outPt.z + 0.9);
      if (go(w, pt.x, pt.z, dt, sp)) {
        w.xfer -= dt;
        if (w.xfer <= 0) {
          w.xfer = 0.1;
          if (back.kind === 'store') giveFrom(w, type, (o) => o.copy(back.depPt).setY(0.8), () => { state.store[type] = (state.store[type] || 0) + 1; });
          else giveFrom(w, type, (o) => o.copy(back.outPt).setY(0.4), () => { if (back.outBin.list.length < back.outMax) binAdd(back.outBin, type); });
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
// 洗杯工: wipe the tables and carry the cups to the sink
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
  if (count(w, 'cup') > 0) {
    if (go(w, SINK.x - 0.9, SINK.z + 1.0, dt, sp)) {
      w.xfer -= dt;
      if (w.xfer <= 0) { w.xfer = 0.08; giveFrom(w, 'cup', (o) => o.set(SINK.x, 1.0, SINK.z), () => { sink.n++; }); }
    }
    return;
  }
  idleWander(w, dt, -12.6, -13.4);
}
function clearTable(t, c) {
  if (t.st !== 'dirty') return;
  for (const s of t.seats) {
    if (!s.vis.cup.visible) continue;
    s.vis.cup.visible = false;
    const from = s.vis.cup.getWorldPosition(new THREE.Vector3());
    if (c === player) fly('cup', from, (o) => o.set(SINK.x, 1.0, SINK.z), 0.45, () => { sink.n++; });
    else takeInto(c, 'cup', from);
  }
  t.st = 'free'; t.claim = null;
  if (c === player) sfx('pop');
}

// ---------- harvesting helper (a coffee cherry may be a rare bean) ----------
function pickPlant(s, pl, c) {
  if (!pl.ripe || room(c) <= 0) { pl.res = null; return; }
  pl.ripe = false; pl.t = 0; pl.res = null; pl.fruit.visible = false;
  const t = s.def.plant === 'coffee' || s.def.plant === 'robusta' ? rollBean(s.def.out) : s.def.out;
  takeInto(c, t, V3(pl.x, 0.6, pl.z));
  caught(t, V3(pl.x, 0, pl.z));
  if (c === player) sfx('pop');
}

// ---------- market customers ----------
const customers = [];
const CUST_COLS = ['#ff9f43', '#5ec8ff', '#ffd34a', '#ff7eb6', '#9fd86b', '#c69bff', '#ff8a6b', '#6fe3c8'];
// phones: never more than this many shoppers and café guests walking around at once
const MAX_PEOPLE = 30;
// a line in front of counter ci: qmax spots in the first row, then a second row just behind it
function queueAt(ci, i) {
  const k = COUNTERS[ci], row = i < k.qmax ? 0 : 1, j = row ? i - k.qmax : i;
  return [k.x + k.dir * j * 0.95, k.z + 1.4 + row * 0.55];
}
const queueLen = (ci) => customers.filter((c) => c.ci === ci && (c.st === 'queue' || c.st === 'toQueue')).length;
// the open checkout with the shortest line (a little walking distance breaks ties)
function pickCounter(c) {
  let best = 0, bk = 1e9;
  COUNTERS.forEach((k, i) => { if (!k.on) return; const v = queueLen(i) + dist2(c.p.root.position, k.x, k.z) / 12; if (v < bk) { bk = v; best = i; } });
  return best;
}
// checkout: quick (0.5 s), a 店長 makes it quicker
function payTime(c) {
  return MGR_PAY[mShop()];
}
let spawnT = 3;
function customerLook() { return { body: pick(CUST_COLS), hat: Math.random() < 0.3 ? 'cap' : (Math.random() < 0.3 ? 'bun' : null), hatColor: pick(CUST_COLS) }; }
const crowd = () => upVal('cust') * shopCustMul() * (events.star > 0 ? 2 : 1) * (isBuilt('cafeStar') ? 1.5 : 1) * (events.rain > 0 ? 0.7 : 1);
const dinerCrowd = () => upVal('cust') * (events.star > 0 ? 2 : 1) * (isBuilt('cafeStar') ? 1.5 : 1) * (events.rain > 0 ? 1.6 : 1);
// Shopping lists: every shopper wants 1–3 different goods (45% / 37% / 18%), each from its own shelf (a random shelf carrying
// that good, a stocked one if possible), visited front row first. Goods on the shelves are preferred; otherwise anything the
// estate can make (rare beans only when stocked).
function shopGoods(shelves) {
  const goods = {};
  for (const s of shelves) for (const t of s.items) {
    const stocked = binCount(s.bin, t) > 0;
    if (!stocked && !(producible(t) && !(RARITY[t] >= 2))) continue;
    const g = goods[t] || (goods[t] = { all: [], stocked: [] });
    g.all.push(s); if (stocked) g.stocked.push(s);
  }
  return goods;
}
// a spot in front of a display (it may face any way), a little to the side and a step back
const shelfSpot = (sh) => { const [fx, fz] = sh.fv, a = rand(-0.75, 0.75), b = rand(0.2, 1.1); return [sh.front.x + fx * b - fz * a, sh.front.z + fz * b + fx * a]; };
// walk the nav path, then the next stop in c.via (the door a shopper uses), until the last stop is reached
function walkVia(c, dt, speed) {
  if (!stepPath(c, dt, speed)) return false;
  if (c.via && c.via.length) { const v = c.via.shift(); setGoal(c, v[0], v[1]); return false; }
  return true;
}
// how many goods in all: most take a couple, some fill a basket, a few stock up with a cart
function shopTotal() { const r = Math.random(); return r < 0.55 ? 2 + Math.floor(Math.random() * 2) : r < 0.85 ? 8 + Math.floor(Math.random() * 5) : 18 + Math.floor(Math.random() * 11); }
// doors: the open one whose inside step is nearest a spot; shoppers come from the end of the road nearer that door
const openDoors = () => DOORS.filter(doorOpen);
// shoppers who still have to pass through a door (on their way in or out), so a busy door hands some over to the next one
const doorLoad = (D) => { let n = 0; for (const c of customers) if (c.door === D) n++; return n; };
// walking distance to a door; from the 烘豆工坊 the way runs through one of the two openings beside the back bar
const PASSAGES = [[-3.4, -17.3], [5.6, -17.3]];
function doorDist(D, x, z) {
  if (z > -17.4) return Math.hypot(D.in[0] - x, D.in[1] - z);
  let best = 1e9;
  for (const [px, pz] of PASSAGES) best = Math.min(best, Math.hypot(px - x, pz - z) + Math.hypot(D.in[0] - px, D.in[1] - pz));
  return best;
}
// the nearest open door; each shopper already heading through a door counts as 3 extra steps, so crowds spread out
function nearDoor(x, z) {
  let best = DOORS[0], bs = 1e9;
  for (const D of openDoors()) { const sc = doorDist(D, x, z) + 3 * doorLoad(D); if (sc < bs) { bs = sc; best = D; } }
  return best;
}
const spawnFor = (D) => (Math.abs(D.out[0] - SPAWN[0]) <= Math.abs(D.out[0] - SPAWN_W[0]) ? SPAWN : SPAWN_W);
function spawnCustomer() {
  const shelves = listOf('shelf');
  if (!shelves.length) return null;
  const goods = shopGoods(shelves), keys = Object.keys(goods);
  if (!keys.length) return null;
  const r = Math.random(), nK = Math.min(keys.length, r < 0.45 ? 1 : r < 0.82 ? 2 : 3);
  const list = [];
  for (let k = 0; k < nK; k++) {
    const left = keys.filter((t) => !list.some((e) => e.item === t));
    const st = left.filter((t) => goods[t].stocked.length), no = left.filter((t) => !goods[t].stocked.length);
    const item = st.length && (Math.random() < 0.85 || !no.length) ? pick(st) : pick(no);
    const g = goods[item];
    list.push({ item, shelf: pick(g.stocked.length ? g.stocked : g.all), need: 1, got: 0 });
  }
  // spread the total over the list; dear goods (rare beans, desserts) only a few each
  const total = Math.max(nK, shopTotal());
  for (let n = total - nK; n > 0; n--) pick(list).need++;
  // dear goods only a few each when the list has cheaper goods to take the rest
  const cheap = list.filter((e) => ITEMS[e.item].price < 40);
  if (cheap.length) for (const e of list) if (ITEMS[e.item].price >= 40) { const cap = Math.max(1, Math.round(total / 6)); for (; e.need > cap; e.need--) pick(cheap).need++; }
  list.sort((a, b) => b.shelf.front.z - a.shelf.front.z || a.shelf.front.x - b.shelf.front.x);
  const sh = list[0].shelf, D = nearDoor(sh.front.x, sh.front.z), from = spawnFor(D);
  const p = K.person(customerLook());
  p.root.position.set(from[0] + rand(-0.4, 0.4), 0, from[1] + rand(-0.3, 0.3)); scene.add(p.root);
  const c = { p, list, li: 0, shelf: sh, item: list[0].item, need: list[0].need, got: 0, st: 'in', path: [], via: [], t: 0, face: 0, moving: 0, qi: 99, ci: 0, age: 0, total: list.reduce((a, e) => a + e.need, 0) };
  // along the middle of the road, then in through the door nearest the first display on the list
  c.door = D; c.via = [D.out, D.in, shelfSpot(sh)]; setGoal(c, D.x, ROAD_Z);
  c.label = label('bubble', '', (o) => { o.copy(c.p.root.position); o.y = 2.05; });
  customers.push(c);
  return c;
}
function stepPath(c, dt, speed) {
  if (c.goal && c.navV !== navV) {
    if (!navTake()) return false;
    const p = c.p.root.position; c.navV = navV; c.path = navPath(p.x, p.z, c.goal[0], c.goal[1], c.goal[2]);
  }
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
    const maxC = Math.min(22, 3 + Math.round(shelfN * 1.5), MAX_PEOPLE - diners.length);
    if (spawnT <= 0 && customers.length < maxC) { spawnCustomer(); spawnT = Math.max(1.4, 7 - shelfN * 0.7) * (0.7 + Math.random() * 0.6); }
  }
  const served = COUNTERS.map((k, ci) => k.on && (workers.some((w) => w.role === 'cashier' && (w.counter || 0) === ci && dist2(w.p.root.position, k.serve.x, k.serve.z) < 0.6) || dist2(player.p.root.position, k.serve.x, k.serve.z) < 1.3));
  for (let ci = 0; ci < COUNTERS.length; ci++) customers.filter((c) => c.ci === ci && (c.st === 'queue' || c.st === 'toQueue')).sort((a, b) => a.qi - b.qi).forEach((c, i) => { c.qi = i; });
  for (let i = customers.length - 1; i >= 0; i--) {
    const c = customers[i];
    c.moving = 0;
    c.age += dt;
    // 提籃和推車: once inside, a shopper takes a basket, or a cart when the list is long (8 goods or more)
    const cpos = c.p.root.position;
    if (state.up.basket && !c.cart && c.st !== 'leave' && inShop(cpos.x, cpos.z) && cpos.z < -8.0) { c.cart = c.total >= 8 ? shopCart() : shopBasket(); c.p.front.add(c.cart); }
    if (c.cart && c.st === 'leave' && (cpos.z > -8.3 || !inShop(cpos.x, cpos.z))) { c.p.front.remove(c.cart); c.cart = null; }
    const cs = c.cart ? upVal('basket') : 1;
    if (c.door && (c.st === 'leave' ? cpos.z > -6.1 : cpos.z < -8.5)) c.door = null;   // through the door now
    if (c.st === 'in') {
      if (walkVia(c, dt, 2.6 * cs)) {
        // face the display; patience grows with how much is on the list here
        c.st = 'shop'; c.door = null; c.face = Math.atan2(c.shelf.def.pos[0] - cpos.x, c.shelf.def.pos[1] - cpos.z); c.t = 0.4;
        c.patience = (c.li ? 22 : 32) + MGR_PAT[mShop()] + c.need * 1.2;
      }
    } else if (c.st === 'shop') {
      c.t -= dt; c.patience -= dt;
      if (c.age > 75 + c.total * 2) c.patience = Math.min(c.patience, 0);   // shopped long enough: pay for what is in the basket
      if (c.t <= 0 && binCount(c.shelf.bin, c.item) > 0 && c.got < c.need) {
        c.t = 0.35 / upVal('basket'); binTake(c.shelf.bin, c.item); c.got++;
        fly(c.item, V3(c.shelf.def.pos[0], 0.8, c.shelf.def.pos[1]), (o) => { o.copy(c.p.root.position); o.y = 1.2; }, 0.25, null);
      }
      // waited too long: keep what is in the basket and go on to the next shelf (or pay); only leave if the basket is empty
      if (c.patience <= 0 && c.got < c.need) {
        const any = c.got > 0 || c.list.some((e, k) => k < c.li && e.got > 0);
        if (any || c.li < c.list.length - 1) c.need = c.got;
        else { leaveShop(c); floatText('😞', V3(c.p.root.position.x, 2.2, c.p.root.position.z)); }
      }
      if (c.st === 'shop' && c.got >= c.need && c.li < c.list.length - 1) {
        // next good on the list: the nav grid leads out to the walkway and in between the next shelves
        const e = c.list[c.li]; e.got = c.got; e.need = c.need;
        const n = c.list[++c.li];
        Object.assign(c, { shelf: n.shelf, item: n.item, need: n.need, got: 0, st: 'in', via: [] });
        const tg = shelfSpot(n.shelf); setGoal(c, tg[0], tg[1]);
      }
      if (c.st === 'shop' && c.got >= c.need) {
        const e = c.list[c.li]; e.got = c.got; e.need = c.need;
        c.ci = pickCounter(c); c.st = 'toQueue'; c.qi = 99;
        const k = COUNTERS[c.ci]; setGoal(c, k.x + k.dir * 2.2, k.z + 1.4);
      }
    } else if (c.st === 'toQueue' || c.st === 'queue') {
      if (stepPath(c, dt, 2.6 * cs)) {
        const [qx, qz] = queueAt(c.ci, c.qi);
        const pos = c.p.root.position, dx = qx - pos.x, dz = qz - pos.z, d = Math.hypot(dx, dz);
        if (d > 0.08) { const s = Math.min(d, 2.6 * cs * dt); pos.x += dx / d * s; pos.z += dz / d * s; c.face = Math.atan2(dx, dz); c.moving = 1; }
        else { c.st = 'queue'; c.face = Math.PI; }
      }
      if (c.st === 'queue' && c.qi === 0) {
        c.t = (c.t > 0 ? c.t : 0) + (served[c.ci] ? dt : 0);
        if (c.t > payTime(c)) pay(c);
      }
    } else if (c.st === 'leave') {
      if (walkVia(c, dt, 2.8 * cs)) { scene.remove(c.p.root); dropLabel(c.label); customers.splice(i, 1); continue; }
    }
    c.p.root.position.y = inShop(c.p.root.position.x, c.p.root.position.z) ? 0.12 : 0;
    turn(c.p, c.face, dt); c.p.anim(dt, c.moving);
    // the bubble: the good in hand now, plus small icons of the rest of the list
    if (c.st === 'shop' || c.st === 'in') setLabel(c.label, badge(c.item, c.got, c.need) + (c.li < c.list.length - 1 ? '<span class="rest">' + c.list.slice(c.li + 1).map((e) => ICON[e.item]).join('') + '</span>' : ''));
    else if (c.st !== 'leave') setLabel(c.label, ICON.money);
  }
}
function leaveShop(c) {
  c.st = 'leave'; c.label.show = false; c.via = [];
  const pos = c.p.root.position;
  // out through the door nearest the bar they paid at (or the display they gave up at), then down the road
  if (inShop(pos.x, pos.z)) { const D = nearDoor(pos.x, pos.z), home = spawnFor(D); c.door = D; c.via = [D.out, [D.x, ROAD_Z], home]; setGoal(c, D.in[0], D.in[1]); }
  else { const home = pos.x < 0 ? SPAWN_W : SPAWN; setGoal(c, home[0], home[1]); }
}
// one payment for the whole list
function pay(c) {
  let v = 0;
  for (const e of c.list) {
    if (!e.got) continue;
    const unit = Math.round(ITEMS[e.item].price * upVal('price') * (1 + 0.05 * (state.up.look || 0)));
    v += unit * e.got; recBest(e.item, unit);
    stats.sold[e.item] = (stats.sold[e.item] || 0) + e.got;
  }
  v = Math.round(v * MGR_TIP[mShop()]) + (pets.cat ? 1 : 0);
  const k = COUNTERS[c.ci || 0]; stats.sales++; stats.byCounter[c.ci || 0]++;
  k.pile.value += v; setPile(k); sfx('coin');
  floatText('+' + v, V3(k.pile.x, 1.6, k.pile.z), 'money');
  const bag = new THREE.Group(); K.add(bag, K.mesh(G.rbox(0.36, 0.38, 0.24, 0.06), '#e8d2b0'), 0, 0.1, 0); c.p.front.add(bag);
  leaveShop(c);
}

// ---------- café guests (some are regulars with a favourite drink) ----------
const diners = [];
let dinerT = 4;
// the menu: every drink and dessert a bar can make (hand-brewed single origins only while there are some ready)
function menu() { const m = []; for (const s of listOf('machine')) for (const t of machOuts(s)) if (DISHES.includes(t) && !((t === 'pourover' || t === 'civetpour') && !binCount(s.outBin, t))) m.push(t); return m; }
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
    s.reg = Math.random() < 0.15;   // 常客: always orders the best drink on the menu and pays extra for it
    s.diner = d; s.dish = s.reg ? favourite(mn) : pickDish(mn); s.got = false; s.claim = null;
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
      dinerT -= dt * dinerCrowd();
      if (dinerT <= 0 && diners.length + customers.length + 2 <= MAX_PEOPLE) { spawnGroup(pick(free)); dinerT = Math.max(2.6, 11 - tables.length * 1.0) * rand(0.7, 1.3); }
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
      setLabel(t.label, want.map((s) => (s.reg ? '<span class="reg">★</span>' : '') + ICON[s.dish]).join('') + (t.patience < 20 ? '⏳' : ''));
      t.label.el.classList.toggle('late', t.patience < 20);
      t.label.show = want.length > 0;
    } else if (t.st === 'eat') {
      t.t -= dt;
      t.label.show = true; setLabel(t.label, '😋');
      if (t.t <= 0) finishTable(t, false);
    } else if (t.st === 'dirty') {
      t.label.show = true; setLabel(t.label, ICON.cup + '待擦桌');
    } else t.label.show = false;
  }
}
function finishTable(t, angry) {
  let v = 0, plates = 0;
  for (const s of t.seats) {
    if (!s.diner) continue;
    if (s.vis[s.dish] && s.vis[s.dish].visible) {
      v += ITEMS[s.dish].price * (s.reg && !angry ? 1.5 : 1); stats.dish[s.dish] = (stats.dish[s.dish] || 0) + 1; s.vis[s.dish].visible = false; s.vis.cup.visible = true; plates++;
      recBest(s.dish, Math.round(ITEMS[s.dish].price * upVal('price') * (s.reg ? 1.5 : 1)));
      if (s.reg && !angry) { stats.regulars++; floatText('★ 常客', V3(t.x, 2.4, t.z)); }
    }
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
const ORDER_OK = ['roasted', 'ground', 'milk', 'oatmilk', 'cocoa', 'syrup', 'blacktea', 'matcha', 'strawcake', 'waffle', 'chocolate', ...DISHES.filter((t) => t !== 'civetpour' && t !== 'pourover')];
function sellables() { return ORDER_OK.filter((t) => producible(t)); }
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
  if (st.xfer > 0) return null;
  for (const k in order) if (order[k] > 0 && count(player, k) > 0) { order[k]--; st.xfer = 0.06; sfx('drop'); giveFrom(player, k, dropFn, null); return k; }
  return null;
}
// how far the café has come: 0 at the start of the mid game … 1 near the end of the unlock list
const progressK = () => Math.min(1, Math.max(0, (state.built.length - 35) / 60));
// a big order: Q goods over 3–5 kinds (dear goods fewer); early about 20–40, late game 100–500
function makeBigOrder() {
  const k = progressK(), Q = Math.round(rand(20 + k * 80, 40 + k * 460));
  const items = sellables().sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 3)), order = {};
  if (!items.length) return null;
  const w = items.map((t) => (ITEMS[t].price >= 40 ? 0.3 : 1)), sw = w.reduce((a, b) => a + b, 0);
  items.forEach((t, i) => { order[t] = Math.max(1, Math.round(Q * w[i] / sw)); });
  return order;
}
const orderCount = (order) => { let n = 0; for (const k in order) n += Math.max(0, order[k]); return n; };
const barHtml = (k, col) => '<div style="height:7px;margin:3px 0 2px;background:#eadcc4;border-radius:4px;overflow:hidden"><div style="height:100%;width:' + Math.round(k * 100) + '%;background:' + col + '"></div></div>';
function bonusToPlayer(v, at) {
  floatText('+' + fmtMoney(v), at, 'money big'); sfx('vip');
  const n = 8;
  for (let i = 0; i < n; i++) {
    const share = i < n - 1 ? Math.floor(v / n) : v - Math.floor(v / n) * (n - 1);
    later.push({ t: i * 0.06, fn: () => fly('money', at.clone().setY(1), (o) => { o.copy(player.p.root.position); o.y = 1.6; }, 0.35, () => { addMoney(share); sfx('coin'); }) });
  }
}
function favourite(mn) { const d = mn.filter((t) => DRINKS.includes(t) && t !== 'civetpour'); return (d.length ? d : mn).slice().sort((a, b) => ITEMS[b].price - ITEMS[a].price)[0]; }
// 外送大單: the delivery scooter waits at the 外送站 for a big office order. 咖啡比賽: a judge tastes three drinks.
const orders = {
  delivery: { ready: false, st: 'away', t: 70, order: null, value: 0, label: null, x: DELIVERY.x, z: DELIVERY.z, sx: 16, scooter: null },
  judge: { ready: false, st: 'away', t: 100, order: null, value: 0, label: null, x: JUDGE.x, z: JUDGE.z + 1.3, p: null },
};
function updateOrders(dt) {
  const D = orders.delivery, pp = player.p.root.position;
  if (D.ready) {
    if (!D.label) { D.label = label('zone order', '', (o) => o.set(D.x, 0.3, D.z - 0.2)); D.label.show = false; }
    D.t -= dt;
    if (D.st === 'away' && D.t <= 0) {
      D.order = makeBigOrder();
      if (!D.order) D.t = 30;
      else {
        // pays 2.5× the shelf price per good (plus a tip when it is all there); every good handed over is paid
        D.total = orderCount(D.order); D.given = 0; D.bank = 0; D.unit = {};
        for (const k in D.order) D.unit[k] = Math.round(ITEMS[k].price * upVal('price') * 2.5);
        D.value = orderValue(D.order, 2.5); D.tip = Math.round(D.value * 0.2) + 300;
        D.st = 'come'; D.sx = 16; D.scooter.visible = true;
        toast('🛵 外送大單！辦公室訂了 ' + D.total + ' 份，可以分很多趟送');
      }
    }
    if (D.st === 'come') { D.sx = Math.max(D.x + 1.7, D.sx - 8 * dt); if (D.sx <= D.x + 1.7) { D.st = 'wait'; D.t = Math.min(600, 150 + D.total * 0.9); D.label.show = true; } }
    if (D.st === 'wait') {
      const left = orderCount(D.order);
      setLabel(D.label, '<div class="zn">🛵 外送大單 ' + Math.ceil(D.t) + '秒</div><div class="rew">已送 ' + D.given + ' / ' + D.total + '</div>' + barHtml(D.given / D.total, '#59a14f') +
        (left ? orderRows(D.order) : '') + '<div class="rew">' + ICON.money + fmtMoney(D.bank) + ' / ' + fmtMoney(D.value + D.tip) + '</div>');
      if (dist2(pp, D.x, D.z) < 2.0) { const k = feedOrder(D.order, (o) => o.set(D.x + 1.7, 1.0, D.z), dt, D); if (k) { D.given++; D.bank += D.unit[k]; } }
      const done = orderDone(D.order);
      if (done) { stats.delivery++; bonusToPlayer(D.bank + D.tip, V3(D.x, 2, D.z)); confetti(D.x, D.z); toast('🛵 外送大單全部送完！多給了小費'); }
      else if (D.t <= 0) { if (D.bank > 0) { bonusToPlayer(D.bank, V3(D.x, 2, D.z)); toast('外送時間到，送到的 ' + D.given + ' 份照樣付錢'); } else toast('外送單取消了…'); }
      if (done || D.t <= 0) { D.st = 'leave'; D.label.show = false; }
    }
    if (D.st === 'leave') { D.sx += 9 * dt; if (D.sx > 16) { D.st = 'away'; D.t = rand(120, 200); D.scooter.visible = false; } }
    if (D.scooter) D.scooter.position.set(D.sx, 0, D.z);
  }
  const J = orders.judge;
  if (J.ready) {
    if (!J.label) { J.label = label('zone order', '', (o) => o.set(J.x, 0.3, J.z + 0.2)); J.label.show = false; }
    if (!J.p) { J.p = K.person({ body: '#3a2a22', hat: 'bun', hatColor: '#ffd34a', apron: '#fbfaf5' }); J.p.root.position.set(JUDGE.x, 0, JUDGE.z - 0.75); scene.add(J.p.root); J.p.root.visible = false; }
    J.t -= dt;
    const drinks = menu().filter((t) => DRINKS.includes(t) && t !== 'civetpour');
    if (J.st === 'away' && J.t <= 0) {
      if (drinks.length) {
        // the judges taste more as the café grows: 3 cups at first, up to 12
        const n = 3 + Math.floor(progressK() * 9), pickN = drinks.slice().sort(() => Math.random() - 0.5).slice(0, 4), order = {};
        for (let i = 0; i < n; i++) order[pickN[i % pickN.length]] = (order[pickN[i % pickN.length]] || 0) + 1;
        J.order = order; J.value = orderValue(order, 10) + 1500; J.st = 'wait'; J.t = 90 + n * 8; J.label.show = true; J.p.root.visible = true; popIn(J.p.root);
        toast('🏆 咖啡比賽！評審要試喝 ' + n + ' 杯');
      } else J.t = 30;
    }
    if (J.st === 'wait') {
      setLabel(J.label, '<div class="zn">🏆 咖啡比賽 ' + Math.ceil(J.t) + '秒</div>' + orderRows(J.order) + '<div class="rew">' + ICON.money + fmtMoney(J.value) + '</div>');
      if (dist2(pp, J.x, J.z) < 1.9) feedOrder(J.order, (o) => o.set(JUDGE.x, 1.0, JUDGE.z), dt, J);
      const done = orderDone(J.order);
      if (done) { stats.judge++; bonusToPlayer(J.value, V3(JUDGE.x, 2, JUDGE.z)); confetti(JUDGE.x, JUDGE.z); toast('🏆 咖啡比賽冠軍！'); }
      else if (J.t <= 0) toast('評審離開了…下次再努力');
      if (done || J.t <= 0) { J.st = 'away'; J.t = rand(160, 240); J.label.show = false; J.p.root.visible = false; }
    }
    if (J.p.root.visible) { J.p.root.rotation.y = 0; J.p.anim(dt, 0); }
  }
}

// ---------- special days: 下雨天 (more guests in the café) and 網紅來訪 (photo wall) ----------
const events = { rain: 0, star: 0, next: 90, season: 0, seasonT: 0 };
let rainMesh = null, influencer = null, eventLabel = null;
const SKY = new THREE.Color('#cfe8d6'), SKY_RAIN = new THREE.Color('#a9b9b8');
function updateEvents(dt) {
  events.rain = Math.max(0, events.rain - dt);
  events.star = Math.max(0, events.star - dt);
  if (isBuilt('espressoBar')) {
    events.next -= dt;
    if (events.next <= 0) {
      events.next = rand(100, 160);
      if (isBuilt('photoWall') && Math.random() < 0.45) { events.star = 60; toast('📸 網紅來訪！客人變多了'); }
      else { events.rain = 45; toast('🌧️ 下雨天！大家都想進咖啡館喝一杯'); }
    }
  }
  // the 季節限定 drink changes every few minutes
  events.seasonT += dt;
  if (events.seasonT > 180) {
    events.seasonT = 0; events.season = (events.season + 1) % SEASONS.length;
    ITEMS.seasonal.name = '季節限定・' + SEASONS[events.season];
    if (isBuilt('seasonalBar')) toast('🍂 季節限定換成「' + SEASONS[events.season] + '」了');
  }
  // influencer posing at the photo wall
  if (events.star > 0 && isBuilt('photoWall')) {
    if (!influencer) { influencer = K.person({ body: '#ff7eb6', hat: 'bun', hatColor: '#ffd34a', legs: '#fbfaf5' }); influencer.root.position.set(PHOTO.x - 0.35, 0, PHOTO.z + 0.7); influencer.root.rotation.y = 0; scene.add(influencer.root); }
    influencer.root.visible = true;
    for (const a of influencer.arms) a.rotation.x = -2.4 + Math.sin(T * 3) * 0.3;
  } else if (influencer) influencer.root.visible = false;
  if (!eventLabel) { eventLabel = label('event', '', (o) => o.set(PHOTO.x, 3.0, PHOTO.z)); eventLabel.show = false; }
  eventLabel.show = events.star > 0 && isBuilt('photoWall');
  if (eventLabel.show) setLabel(eventLabel, '📸 網紅拍照中 ' + Math.ceil(events.star) + '秒');
  // rain drops around the player, the sky a little greyer
  if (!rainMesh) {
    rainMesh = new THREE.InstancedMesh(G.rbox(0.03, 0.5, 0.03, 0.01, 1), new THREE.MeshBasicMaterial({ color: '#dff2ff', transparent: true, opacity: 0.6 }), 160);
    rainMesh.frustumCulled = false; rainMesh.visible = false; scene.add(rainMesh);
    rainMesh.userData.d = Array.from({ length: 160 }, () => [rand(-9, 9), rand(0, 9), rand(-14, 8)]);
  }
  const raining = events.rain > 0 && !simming;
  rainMesh.visible = raining;
  scene.background.lerp(raining ? SKY_RAIN : SKY, Math.min(1, dt * 2));
  if (raining) {
    const pp = player.p.root.position, m4 = new THREE.Matrix4();
    rainMesh.userData.d.forEach((d, i) => { d[1] -= dt * 14; if (d[1] < 0) { d[1] += 9; d[0] = rand(-9, 9); d[2] = rand(-14, 8); } rainMesh.setMatrixAt(i, m4.makeTranslation(pp.x + d[0], d[1], pp.z + d[2])); });
    rainMesh.instanceMatrix.needsUpdate = true;
  }
}
let toastT = 0;
function toast(msg) { if (simming) return; const el = $('toast'); el.textContent = msg; el.classList.add('on'); toastT = 2.6; }

// ---------- UI ----------
let shownMoney = -1;
function updateMoney() { if (shownMoney !== state.money) { shownMoney = state.money; $('moneyN').textContent = fmtMoney(state.money); } }
function logCard(t) {
  const L = state.log[t];
  const bean = BEANS.includes(t);
  const r = bean ? '<span class="rar r' + RARITY[t] + '">' + RAR_NAME[RARITY[t]] + '</span>' : '<span class="rar r0">' + (DESSERTS.includes(t) ? '甜點' : '飲品') + '</span>';
  if (!L || !L.n) return '<div class="lcard unk">' + ICON_SIL[t] + '<b>？？？</b>' + r + '<small>' + (bean ? '尚未採到' : '尚未做出') + '</small></div>';
  return '<div class="lcard">' + ICON_BIG[t] + '<b>' + ITEMS[t].name + '</b>' + r + '<small>' + (bean ? '採到 ' + L.n + ' 次' : '做出 ' + L.n + (DESSERTS.includes(t) ? ' 份' : ' 杯')) + '</small><small>最高售價 ' + (L.b ? '$' + fmtMoney(L.b) : '—') + '</small></div>';
}
function openPanel(kind) {
  const P0 = $('panel'), body = $('pBody');
  P0.classList.remove('hidden');
  $('pTabs').innerHTML = ''; body.innerHTML = '';
  if (kind === 'up') {
    $('pTitle').textContent = '升級';
    const tabs = ['角色', '員工', '莊園', '咖啡館', '商店'];
    const show = (ti) => {
      openPanel.tab = ti;
      [...$('pTabs').children].forEach((b, i) => b.classList.toggle('on', i === ti));
      body.innerHTML = '';
      if (ti === 1 && !workers.length) { body.innerHTML = '<div class="empty">解鎖第一位員工後開放</div>'; return; }
      if (ti === 1) {
        const n = (r) => workers.filter((w) => w.role === r).length;
        body.insertAdjacentHTML('beforeend', '<div class="chips staff">' + [['cashier', '櫃台店員'], ['picker', '採豆工'], ['roaster', '烘豆師'], ['barista', '咖啡師'], ['waiter', '外場'], ['washer', '洗杯工'], ['baker', '烘焙師'], ['manager', '店長'], ['supervisor', '莊園主管']].filter(([r]) => n(r) || r === 'cashier').map(([r, nm]) => '<span class="chip">' + nm + ' ×' + n(r) + '</span>').join('') + '</div>');
        for (const role in HIRE) {
          if (!roleOpen(role)) continue;
          const h = HIRE[role], cost = hireCost(role), max = cost === null;
          const extra = '已多請 ' + (state.extra[role] || 0) + '/' + HIRE_MAX + ' 位';
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
        if (k === 'mgrShop') body.insertAdjacentHTML('beforeend', '<div class="sec">管理層</div>');
        const ric = ICON[u.ic] || '<span class="ic">' + (u.emo || '🏪') + '</span>';
        if (u.need && !isBuilt(u.need)) { body.insertAdjacentHTML('beforeend', '<div class="row locked"><span class="ricon">' + ric + '</span><div class="rmid"><b>' + u.name + '</b><small>先在地圖上買「' + DEF[u.need].name + '」就會開放</small></div></div>'); continue; }
        const lvl = state.up[k], max = lvl >= u.cost.length;
        const row = document.createElement('div'); row.className = 'row';
        row.innerHTML = '<span class="ricon">' + ric + '</span><div class="rmid"><b>' + u.name + '</b><small>' + (u.noLv ? '' : '等級 ' + (lvl + 1) + ' · ') + u.fmt(u.vals[lvl]) + (max ? '' : ' → ' + u.fmt(u.vals[lvl + 1])) + '</small><div class="pips">' + u.vals.map((_, i) => '<i class="' + (i <= lvl ? 'on' : '') + '"></i>').join('') + '</div></div>';
        const b = document.createElement('button'); b.className = 'buy' + (max ? ' max' : (state.money < u.cost[lvl] ? ' poor' : ''));
        b.innerHTML = max ? '已滿級' : ICON.money + fmtMoney(u.cost[lvl]);
        b.onclick = () => {
          if (max || state.money < u.cost[lvl]) { sfx('drop'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 300); return; }
          state.money -= u.cost[lvl]; state.up[k]++; applyUpgrade(k, true); sfx('buy'); updateMoney(); save(); show(ti);
        };
        row.appendChild(b); body.appendChild(row);
      }
    };
    tabs.forEach((t, i) => { const b = document.createElement('button'); b.textContent = t; b.onclick = () => show(i); $('pTabs').appendChild(b); });
    show(openPanel.tab || 0);
  } else if (kind === 'log') {
    $('pTitle').textContent = '咖啡圖鑑';
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
    h += '<div class="sec">山城咖啡屋</div>';
    const sh = listOf('shelf');
    h += sh.length ? sh.map((s) => '<div class="chips"><span class="chip">' + s.def.name + ' ' + s.bin.list.length + '/' + upVal('shelfCap') + '</span>' + s.items.map((t) => '<span class="chip">' + ICON[t] + binCount(s.bin, t) + '</span>').join('') + '</div>').join('') : '<div class="empty">還沒有貨架</div>';
    const bs = binStations();
    if (bs.length) h += '<div class="sec">牛奶箱和雞蛋箱</div>' + bs.map((s) => '<div class="chips"><span class="chip">' + s.def.name + ' ' + s.bin.list.length + '/' + s.bin.max + '</span>' + chipsOf(cntList(s.bin.list)) + '</div>').join('');
    if (stores().length) h += '<div class="sec">倉庫（' + stores().length + ' 間）' + storeTotal() + '/' + storeCap() + '</div><div class="chips">' + chipsOf(state.store) + '</div>';
    h += '<div class="sec">加工機器</div><div class="chips">';
    for (const s of listOf('machine')) h += '<span class="chip">' + s.def.name + ' ' + (s.def.inAny ? ICON.geisha + s.inBin.list.length : s.def.in ? ICON[s.def.in] + s.inN : '') + (s.def.in2 ? ' ' + ICON[s.def.in2] + s.inN2 : '') + ' → ' + machOuts(s).map((t) => ICON[t] + binCount(s.outBin, t)).join(' ') + '</span>';
    if (tables.length) {
      const busy = tables.filter((t) => t.st === 'wait' || t.st === 'eat' || t.st === 'coming').length, dirty = tables.filter((t) => t.st === 'dirty').length;
      h += '</div><div class="sec">咖啡館</div><div class="chips"><span class="chip">餐桌 ' + tables.length + '</span><span class="chip">用餐中 ' + busy + '</span><span class="chip">待清理 ' + dirty + '</span>';
    }
    h += '</div><div class="sec">進度</div><div class="chips"><span class="chip">已解鎖 ' + state.built.length + '/' + DEFS.length + '</span><span class="chip">總收入 ' + ICON.money + fmtMoney(state.earned) + '</span></div>';
    body.innerHTML = h;
  } else if (kind === 'map') {
    $('pTitle').textContent = '地圖';
    const m = mapsGet();
    // map order: 開心農場 → 山城咖啡館 → 海邊漁港 → 森林小鎮 (each branch is opened from the one before it)
    body.innerHTML = '<a class="mapcard" href="./index.html"><span class="mi" style="background:#c9f0a8">🌾</span><div><b>開心農場</b><small>回到農場</small></div></a>' +
      '<div class="mapcard here"><span class="mi" style="background:#f3dcc0">☕</span><div><b>山城咖啡館</b><small>你現在在這裡</small></div></div>' +
      (m.harbor ? '<a class="mapcard" href="./harbor.html"><span class="mi" style="background:#bfe9ff">⚓</span><div><b>海邊漁港</b><small>捕魚、魚市場、海鮮餐廳</small></div></a>'
        : '<div class="mapcard locked"><span class="mi" style="background:#e8e2d6">⚓</span><div><b>海邊漁港</b><small>在山城咖啡館開分店後開放（總收入達 $120,000）</small></div></div>') +
      (m.forest ? '<a class="mapcard" href="./forest.html"><span class="mi" style="background:#cdeec0">🌲</span><div><b>森林小鎮</b><small>伐木、家具、蓋小鎮</small></div></a>'
        : '<div class="mapcard locked"><span class="mi" style="background:#e8e2d6">🌲</span><div><b>森林小鎮</b><small>在海邊漁港開分店後開放</small></div></div>');
    body.querySelectorAll('a.mapcard').forEach((a) => a.addEventListener('click', () => save()));
  } else if (kind === 'set') {
    $('pTitle').textContent = '設定';
    body.innerHTML = '<div class="row"><span class="ricon">🔊</span><div class="rmid"><b>聲音</b></div><button class="buy" id="sSnd">' + (state.sound ? '開' : '關') + '</button></div>' +
      '<div class="row"><span class="ricon">💾</span><div class="rmid"><b>立即儲存</b><small>遊戲每 4 秒也會自動儲存</small></div><button class="buy" id="sSave">儲存</button></div>' +
      '<div class="row"><span class="ricon">📋</span><div class="rmid"><b>備份存檔</b><small>複製一段存檔碼，換手機或清除瀏覽器也能救回（所有地圖一起備份）</small></div><button class="buy" id="sExp">複製</button></div>' +
      '<div class="row"><span class="ricon">📥</span><div class="rmid"><b>還原存檔</b><small>貼上存檔碼，回到備份時的進度</small></div><button class="buy" id="sImp">貼上</button></div>' +
      '<div id="sBox" class="savebox hidden"><textarea id="sCode" rows="4" spellcheck="false"></textarea><button class="buy" id="sGo"></button></div>' +
      '<div class="row"><span class="ricon">🔄</span><div class="rmid"><b>重新開始</b><small>清除咖啡館的所有進度</small></div><button class="buy poor" id="sReset">重新開始</button></div>';
    $('sSnd').onclick = () => { state.sound = !state.sound; save(); openPanel('set'); };
    $('sSave').onclick = () => { save(); toast('已儲存 ✔'); };
    const sBox = $('sBox'), code = $('sCode'), sGo = $('sGo');
    $('sExp').onclick = () => {
      save();
      code.value = exportSave(); code.readOnly = true; sGo.textContent = '複製存檔碼'; sBox.classList.remove('hidden');
      sGo.onclick = () => copyText(code);
      copyText(code);
    };
    $('sImp').onclick = () => {
      code.value = ''; code.readOnly = false; code.placeholder = '把存檔碼貼在這裡'; sGo.textContent = '還原'; sBox.classList.remove('hidden'); code.focus();
      sGo.onclick = () => {
        if (!importSave(code.value)) { toast('存檔碼不正確，請整段重新複製'); return; }
        resetting = true; toast('已還原，重新載入中…'); setTimeout(() => location.replace(location.pathname), 600);
      };
    };
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
function collectPile(pile, x, z, near, dt, onChange, auto0) {
  const auto = state.up.autoCash > 0 || !!auto0;
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
      for (const it of machIns(s)) { const pt = it === s.def.in2 ? s.in2Pt : s.inPt; if (dist2(pp, pt.x, pt.z) < 1.4 && count(player, it) > 0) { depositTo(player, s, it, dt); break; } }
      if (player.xfer2 <= 0 && dist2(pp, s.outPt.x, s.outPt.z) < 1.5 && s.outBin.list.length && room(player) > 0) { player.xfer2 = 0.08; const t = binTake(s.outBin); sfx('pop'); takeInto(player, t, V3(s.outPt.x, 0.4, s.outPt.z)); }
    } else if (s.bin && BIN_KINDS.includes(s.kind)) {
      if (player.xfer2 <= 0 && dist2(pp, s.outPt.x, s.outPt.z) < 1.7 && s.bin.list.length && room(player) > 0) {
        let t = null;
        for (let i = s.bin.list.length - 1; i >= 0 && !t; i--) if (usable(s.bin.list[i])) t = s.bin.list[i];
        if (!t && s.bin.list.length >= s.bin.max * 0.8) t = s.bin.list[s.bin.list.length - 1];
        if (t) { player.xfer2 = 0.08; binTake(s.bin, t); sfx('pop'); takeInto(player, t, V3(s.outPt.x, 0.4, s.outPt.z)); }
      }
    } else if (s.kind === 'shelf' && dist2(pp, s.front.x - s.fv[0] * 0.6, s.front.z - s.fv[1] * 0.6) < 1.7) {
      for (const t of s.items) if (count(player, t) > 0) { depositTo(player, s, t, dt); break; }
    }
  }
  const kinds = Object.keys(state.store).filter((k) => state.store[k] > 0).sort((a, b) => state.store[b] - state.store[a]);
  const whHtml = '<div class="zn">倉庫 ' + storeTotal() + '/' + storeCap() + '</div>' + (kinds.length ? '<div class="inv">' + kinds.slice(0, 8).map((k) => '<span>' + ICON[k] + state.store[k] + '</span>').join('') + '</div>' : '<div class="inv">空的</div>');
  for (const wh of stores()) {
    if (dist2(pp, wh.depPt.x, wh.depPt.z) < 1.0 && player.carry.length) depositTo(player, wh, player.carry[player.carry.length - 1].type, dt);
    if (player.xfer2 <= 0 && dist2(pp, wh.outPt.x, wh.outPt.z) < 1.0 && room(player) > 0) {
      let best = null; for (const t in state.store) if (state.store[t] > 0 && (!best || state.store[t] > state.store[best])) best = t;
      if (best) { player.xfer2 = 0.08; state.store[best]--; sfx('pop'); takeInto(player, best, V3(wh.outPt.x, 0.5, wh.outPt.z)); }
    }
    setLabel(wh.label, whHtml);
  }
  // café: serve, wipe, collect
  player.xfer3 = (player.xfer3 || 0) - dt;
  for (const t of tables) {
    const d = dist2(pp, t.x, t.z);
    if (t.st === 'wait' && d < 1.9 && player.xfer3 <= 0) {
      for (const s of t.seats) if (s.diner && !s.got && count(player, s.dish) > 0) { player.xfer3 = 0.15; giveDish(player, t, s); break; }
    }
    if (t.st === 'dirty' && d < 1.7) clearTable(t, player);
    collectPile(t.pile, t.x, t.z, d < 1.9, dt, () => setTablePile(t));
  }
  for (const k of COUNTERS) if (k.on) collectPile(k.pile, k.pile.x, k.pile.z, dist2(pp, k.pile.x, k.pile.z) <= 1.6, dt, () => setPile(k), mShop() >= 3);
}

// ---------- machines ----------
function made(t, at) { stats.made[t] = (stats.made[t] || 0) + 1; caught(t, at); }
const shelfWant = (t) => (listOf('shelf').some((sh) => sh.items.includes(t) && binCount(sh.bin, t) < 2) ? 1 : 0);
// a machine with two drinks on its menu makes whichever the café and the shelves want more right now
function chooseOut(s, outs) {
  let best = outs[0], bk = -1e9;
  outs.forEach((t, i) => { const k = demandFor(t) * 3 + shelfWant(t) - binCount(s.outBin, t) * 1.5 + (s.alt % outs.length === i ? 0.5 : 0); if (k > bk) { bk = k; best = t; } });
  s.alt++;
  return best;
}
function craft(s, n) {
  let src = null;
  if (s.def.inAny) src = binTake(s.inBin); else if (s.def.in) s.inN--;
  if (s.def.in2) s.inN2--;
  const outs = machOuts(s);
  const t = s.def.inAny ? (src === 'civet' ? 'civetpour' : 'pourover') : outs.length > 1 ? chooseOut(s, outs) : outs[0];
  for (let i = 0; i < n && s.outBin.list.length < s.outMax; i++) binAdd(s.outBin, t);
  made(t, s.outPt);
  if (!simming) puff(s.outPt.x, 0.5, s.outPt.z, s.def.mk === 'roaster' ? '#c9a27a' : '#fff4c9', 3, 0.4);
}
// 烘豆機: the bar runs 淺焙 → 中焙 (green) → 深焙. Stand by the roaster (or have a 烘豆師 waiting there) while the bar
// is in the green part and the beans come out perfect: two bags instead of one.
const roastWin = () => { const w = upVal('roast'); return [0.62 - w / 2, 0.62 + w / 2]; };
function roastStep(s, iv) {
  const k = s.timer / iv, [g0, g1] = roastWin();
  s.roastK = Math.min(1, k);
  if (k >= g0 && k <= g1) {
    const fx = s.def.pos[0], fz = s.def.pos[1] + 1.4;
    const near = dist2(player.p.root.position, fx, fz) < 2.2 || workers.some((wk) => wk.role === 'roaster' && dist2(wk.p.root.position, fx, fz) < 2.0);
    if (near) {
      s.timer = 0; craft(s, 2); stats.perfect++;
      floatText('完美中焙！×2', V3(fx, 2.4, s.def.pos[1]), 'big'); if (!simming) sfx('buy');
      return;
    }
  }
  if (k >= 1) { s.timer = 0; craft(s, 1); }
}
function updateProducer(s, dt) {
  const iv = upVal('cows') * (s.def.animal === 'chicken' ? 0.75 : 1);
  for (const c of s.cows) {
    if (!c.on) continue;
    c.mt += dt;
    if (c.mt >= iv && binRoom(s.bin) > 0) { c.mt = 0; landCatch(s, s.def.out, c.g.getWorldPosition(new THREE.Vector3()).setY(0.8), 0.7); }
  }
}

// ---------- simulation ----------
function updateWorld(dt, T) {
  const growK = upVal('grow');
  const cap = upVal('shelfCap');
  for (const s of Object.values(stations)) {
    if (s.kind === 'producer') updateProducer(s, dt);
    if (s.bin && BIN_KINDS.includes(s.kind)) { binRender(s.bin); setLabel(s.outLabel, binLabel(s.bin)); }
    if (s.kind === 'producer') s.bin.max = upVal('stock') + 12;
    if (s.kind === 'machine') {
      s.inMax = s.outMax = s.outBin.max = upVal('stock'); if (s.inBin) s.inBin.max = s.inMax;
      const iv = s.def.iv / upVal('mach') / machK(s.id);
      const has1 = s.def.inAny ? s.inBin.list.length > 0 : (!s.def.in || s.inN > 0);
      const busy = has1 && (!s.def.in2 || s.inN2 > 0) && s.outBin.list.length < s.outMax;
      if (busy) {
        s.timer += dt;
        if (s.def.roast) roastStep(s, iv);
        else if (s.timer >= iv) { s.timer = 0; craft(s, s.def.yield || 1); }
      }
      const ax = s.spin.userData.axis, sp = s.spin;
      if (ax === 'x') sp.rotation.x += dt * (busy ? 5 : 0);
      else if (ax === 'y') sp.rotation.y += dt * (busy ? 6 : 0);
      else if (ax === 'z') sp.rotation.z += dt * (busy ? 7 : 0);
      else if (ax === 'steam') { sp.visible = busy; if (busy) { sp.position.y += 0; sp.scale.setScalar(0.8 + Math.abs(Math.sin(T * 3)) * 0.4); } }
      else if (ax === 'drip') { sp.userData.y0 = sp.userData.y0 ?? sp.position.y; sp.position.y = sp.userData.y0 - (busy ? ((T * 1.5) % 1) * 0.5 : 0); }
      else if (ax === 'sun') sp.scale.setScalar(1 + (busy ? Math.sin(T * 2) * 0.12 : 0));
      else if (ax === 'pour') sp.rotation.z = busy ? 0.3 + Math.sin(T * 2) * 0.15 : 0;
      else if (ax === 'lid') sp.rotation.x = busy ? -Math.abs(Math.sin(T * 2.2)) * 0.9 : 0;
      if (s.inStack) s.inStack.set(s.inN);
      if (s.inBin) binRender(s.inBin);
      binRender(s.outBin);
      if (s.in2Stack) s.in2Stack.set(s.inN2);
      if (s.inLabel) setLabel(s.inLabel, s.inBin ? binLabel(s.inBin) : badge(s.def.in, s.inN, s.inMax));
      setLabel(s.outLabel, binLabel(s.outBin));
      if (s.in2Label) setLabel(s.in2Label, badge(s.def.in2, s.inN2, s.inMax));
      if (s.roastLabel) {
        const [g0, g1] = roastWin(), k = busy ? Math.round((s.roastK || 0) * 40) / 40 : 0;
        s.roastLabel.show = busy;
        setLabel(s.roastLabel, '<div class="rbar"><i class="l" style="width:' + (g0 * 100).toFixed(0) + '%"></i><i class="m" style="width:' + ((g1 - g0) * 100).toFixed(0) + '%"></i><i class="d"></i><b style="left:' + (k * 100).toFixed(1) + '%"></b></div><div class="rtx">淺焙 · <span>中焙</span> · 深焙</div>');
      }
    } else if (s.kind === 'crop') {
      for (const pl of s.plants) {
        if (pl.active && !pl.ripe) {
          pl.t += dt * growK;
          pl.fruit.visible = pl.t > s.grow * 0.35;
          pl.fruit.scale.setScalar(Math.min(1, pl.t / s.grow));
          if (pl.t >= s.grow) { pl.ripe = true; pl.fruit.scale.setScalar(1); pops.push({ obj: pl.fruit, t: 0.5 }); }
        }
      }
    } else if (s.kind === 'shelf') {
      if (s.big !== cap > 40) shelfModel(s, cap > 40);
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
  for (const m of mist) { m.position.x += dt * m.userData.v; if (m.position.x > 34) m.position.x = -52; }
  if (pets.cat) { pets.cat.tail.rotation.z = Math.sin(T * 2.5) * 0.4; pets.cat.b.scale.y = 1 + Math.sin(T * 2) * 0.02; }
  if (simming) return;
  for (const s of listOf('producer')) for (const c of s.cows) {
    if (!c.on) continue;
    c.t -= dt;
    if (c.t <= 0) { c.t = rand(2, 5); c.tx = rand(-0.85, 0.85); c.tz = rand(0.4, 1.05); }
    const p = c.g.position, dx = c.tx - p.x, dz = c.tz - p.z, d = Math.hypot(dx, dz);
    if (d > 0.05) { p.x += dx / d * Math.min(d, dt * 0.35); p.z += dz / d * Math.min(d, dt * 0.35); c.g.rotation.y = Math.atan2(dx, dz); }
    c.b.rotation.x = d > 0.05 ? Math.sin(T * 6) * 0.03 : 0;
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
  const zMin = deptG && pos.x > SHOP.x0 - 0.4 && pos.x < SHOP.x1 + 0.2 ? DEPT_Z + 0.6 : pos.x < -11.0 && pos.x > -40.2 ? REST.z0 + 0.8 : -17.0;
  pos.x = Math.max(expandG && pos.z > 35.0 ? EXP_X0 : -39.6, Math.min(12.9, pos.x)); pos.z = Math.max(zMin, Math.min(expandG ? EXP_Z : 34.0, pos.z));
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
  for (const wh of stores()) { wh.k += ((someoneNear(wh.def.pos[0], wh.def.pos[1] + 2.4, 2.8) ? 1 : 0) - wh.k) * ease; wh.door.position.y = wh.k * 1.85; }
  for (const D of DOORS) if (D.d) { D.k += ((someoneNear(D.x, -7.3, 2.3) ? 1 : 0) - D.k) * ease; D.d.open(D.k); }
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
ITEMS.seasonal.name = '季節限定・' + SEASONS[0];
for (const def of DEFS) if (isBuilt(def.id)) build(def, true);
booting = false;
for (const role in state.extra) if (HIRE[role] && roleOpen(role)) for (let i = 0; i < Math.min(HIRE_MAX, state.extra[role]); i++) makeWorker(role, HIRE[role].home, false);
applyShopLook(false); applyFloor(false); applyAd(false); applyBasket(false);
for (const k of ['mgrShop', 'mgrFarm']) if (state.up[k]) spawnManager(k, true);
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
  T += dt; navLeft = NAV_BUDGET;
  for (let i = later.length - 1; i >= 0; i--) { later[i].t -= dt; if (later[i].t <= 0) { const f = later[i].fn; later.splice(i, 1); f(); } }
  movePlayer(dt);
  playerInteract(dt);
  payZones(dt);
  updateWorld(dt, T);
  updateChute(dt);
  for (const w of workers) { updateWorker(w, dt); turn(w.p, w.face, dt); w.p.anim(dt, w.moving); swayStack(w, w.moving ? upVal('wspeed') : 0, dt); w.p.root.position.y = inShop(w.p.root.position.x, w.p.root.position.z) || inRest(w.p.root.position.x, w.p.root.position.z) ? 0.12 : 0; }
  updateBin(dt);
  maxTag(player);
  updateCustomers(dt);
  updateDiners(dt, T);
  updateOrders(dt);
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
    p.obj.scale.setScalar(Math.max(0.01, easeBack(Math.min(1, p.t)) * (p.obj.userData.s0 || 1)));
    if (p.t >= 1) { p.obj.scale.setScalar(p.obj.userData.s0 || 1); pops.splice(i, 1); }
  }
  dashMat.opacity = 0.75 + Math.sin(T * 4) * 0.25;
  updateGuide(dt);
  updateDoorsAndLights(dt);
  gateT += dt; if (gateT > 3) { gateT = 0; if (!zones.harbor && !isBuilt('harbor') && state.earned >= DEF.harbor.earned) refreshZones(); }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('on'); }
}
requestAnimationFrame(frame);
addEventListener('visibilitychange', () => { if (document.hidden) save(); });
addEventListener('pagehide', save);

// test hooks
window.__cafe = {
  state, stations, player, zones, customers, diners, tables, workers, orders, events, DEFS, COUNTERS, sink, stats, colliders, LOG_PAGES, ITEMS,
  SHOP, DOORS, navStats, MAX_PEOPLE, mapsGet, refreshZones, inside: (x, z) => !!insideBox(x, z), storeCap, stores: () => stores().map((q) => q.id),
  shelfInfo: () => listOf('shelf').map((q) => [q.id, q.def.pos[0], q.def.pos[1], q.def.face, q.bin.list.length, q.big]),
  fillShelves(n) { for (const q of listOf('shelf')) { let k = 0; while (q.bin.list.length < n) binAdd(q.bin, q.items[k++ % q.items.length]); } },
  give(type, n) { for (let i = 0; i < n && room(player) > 0; i++) stackAdd(player, type); },
  cash(n) { state.money += n; updateMoney(); },
  tp(x, z) { player.p.root.position.set(x, 0, z); updateCamera(0, true); },
  build(id) { if (zones[id]) killZone(id); if (!stations[id]) build(DEF[id]); },
  finishSites() {},
  sim(sec, quiet = true) { simming = quiet; try { for (let i = 0; i < sec * 30; i++) step(1 / 30); } finally { simming = false; } },
  // like sim, but after every frame checks that no worker / shopper / walking guest stands inside a collider box
  simCheck(sec) {
    const r = { frames: 0, samples: 0, intrusions: 0, examples: [] };
    simming = true;
    try {
      for (let i = 0; i < sec * 30; i++) {
        step(1 / 30); r.frames++;
        const who = [...workers.map((w) => ['worker:' + w.role, w.p.root.position]), ...customers.map((c) => ['customer', c.p.root.position]), ...diners.filter((d) => d.st !== 'sit').map((d) => ['diner', d.p.root.position])];
        for (const [k, pos] of who) { r.samples++; const b = insideBox(pos.x, pos.z); if (b) { r.intrusions++; if (r.examples.length < 8) r.examples.push(k + ' ' + pos.x.toFixed(2) + ',' + pos.z.toFixed(2) + ' in [' + [b.x0, b.z0, b.x1, b.z1].map((v) => v.toFixed(2)).join(',') + ']'); } }
      }
    } finally { simming = false; }
    return r;
  },
  hire: (role) => hireExtra(role),
  bin, hireCost, hirePrice, zoneDef, exportSave, importSave, GROW, UPS, machK, lvlOf,
  up(k, n) { state.up[k] = Math.min(n, UPS[k].vals.length - 1); applyUpgrade(k, false); refreshZones(); },
  saveNow: () => save(),
  giveWorker(w, type, n) { for (let i = 0; i < n && room(w) > 0; i++) stackAdd(w, type); },
  inShop: (x, z) => inShop(x, z),
  guideIds: () => guideTargets().ids,
  guideInfo: () => { const g = guideTargets(); return g.ids.join('+') + (g.two ? ' (二選一)' : ''); },
  firstSource: () => { const s = stations.cowShed || stations.arabica; return s.outPt ? [s.outPt.x, s.outPt.z + 0.95] : [s.plants[0].x, s.plants[0].z + 0.3]; },
  calls: () => renderer.info.render.calls,
  open: (k) => openPanel(k),
  rain: (s = 30) => { events.rain = s; },
  star: (s = 30) => { events.star = s; },
  orderNow: (k) => { orders[k].t = 0; },
  lineup(x, z, list) { (list || Object.keys(ITEMS)).forEach((t, i) => { const m = itemMesh(t); m.scale.setScalar(2.2); m.position.set(x + (i % 6) * 1.3, 0, z + Math.floor(i / 6) * 1.4); scene.add(m); }); },
};
