// Forest town props (森林小鎮): wood, forest goods, furniture, trees, machines, the town buildings, train and animals.
// Built from the shared style kit like the other maps.
import * as THREE from 'three';
import { C, G, mesh, add, blob, bakeStatic } from './kit.js';

// h = stack height on a back, ss = scale on shelves / platforms
export const ITEMS5 = {
  pine: { name: '松木', icon: '🪵', h: 0.24, price: 4 },
  oak: { name: '橡木', icon: '🪵', h: 0.24, price: 7 },
  maple: { name: '楓木', icon: '🪵', h: 0.24, price: 9 },
  plank: { name: '木板', icon: '🪵', h: 0.16, price: 7 },
  refined: { name: '精製木材', icon: '🪵', h: 0.14, price: 14 },
  sawdust: { name: '木屑', icon: '🟫', h: 0.24, price: 0 },
  paper: { name: '紙', icon: '📄', h: 0.12, price: 10 },
  notebook: { name: '筆記本', icon: '📓', h: 0.1, price: 24 },
  sap: { name: '楓樹汁', icon: '🪣', h: 0.3, price: 0 },
  syrup: { name: '楓糖漿', icon: '🍁', h: 0.32, price: 26 },
  honey: { name: '蜂蜜', icon: '🍯', h: 0.28, price: 16 },
  wax: { name: '蜂蠟', icon: '🟨', h: 0.14, price: 0 },
  candle: { name: '蜂蠟蠟燭', icon: '🕯', h: 0.3, price: 22 },
  shiitake: { name: '香菇', icon: '🍄', h: 0.18, price: 5 },
  truffle: { name: '松露', icon: '🟤', h: 0.2, price: 60 },
  chair: { name: '椅子', icon: '🪑', h: 0.62, price: 40, ss: 0.9 },
  table: { name: '桌子', icon: '🪑', h: 0.5, price: 70, ss: 0.85 },
  bed: { name: '床', icon: '🛏', h: 0.42, price: 110, ss: 0.8 },
  bookcase: { name: '書櫃', icon: '📚', h: 0.66, price: 90, ss: 0.85 },
  rocker: { name: '搖椅', icon: '🪑', h: 0.64, price: 140, ss: 0.85 },
  chair_r: { name: '彩繪椅子', icon: '🪑', h: 0.62, price: 80, ss: 0.9 },
  table_r: { name: '彩繪桌子', icon: '🪑', h: 0.5, price: 140, ss: 0.85 },
  bed_r: { name: '彩繪床', icon: '🛏', h: 0.42, price: 220, ss: 0.8 },
  bookcase_r: { name: '彩繪書櫃', icon: '📚', h: 0.66, price: 180, ss: 0.85 },
  rocker_r: { name: '彩繪搖椅', icon: '🪑', h: 0.64, price: 280, ss: 0.85 },
  money: { name: '錢', icon: '💵', h: 0.07, price: 0 },
};

const cache = new Map();
export function itemMesh(type) {
  let t = cache.get(type);
  if (!t) { t = buildItem(type); cache.set(type, t); }
  return t.clone();
}
const WOOD = { pine: ['#e0a96a', '#b8793f', '#f6d7a4'], oak: ['#a8693a', '#7e4a24', '#d9a46e'], maple: ['#d47a52', '#9e4a2c', '#f2b48c'] };
const PAINT = { chair: '#6fd6c0', table: '#ff8fb1', bed: '#7fb8ff', bookcase: '#ffd34a', rocker: '#ff7a66' };
function logShape(g, kind) {
  const [bark, dark, end] = WOOD[kind];
  const l = add(g, mesh(G.cyl(0.13, 0.13, 0.5, 12), bark), 0, 0.13, 0); l.rotation.z = Math.PI / 2;
  for (const x of [-0.255, 0.255]) {
    const c = add(g, mesh(G.cyl(0.11, 0.11, 0.02, 12), end), x, 0.13, 0); c.rotation.z = Math.PI / 2;
    const r = add(g, mesh(G.cyl(0.05, 0.05, 0.022, 10), dark, false), x * 1.01, 0.13, 0); r.rotation.z = Math.PI / 2;
  }
  for (const x of [-0.1, 0.08]) add(g, mesh(G.rbox(0.03, 0.03, 0.27, 0.01), dark, false), x, 0.255, 0);
  if (kind === 'maple') { const lf = add(g, mesh(G.sphere(0.07, 6, 5), '#ff5a3c'), 0.05, 0.27, 0.02); lf.scale.set(1.4, 0.3, 1.2); }
  if (kind === 'oak') add(g, mesh(G.sphere(0.05, 8, 6), '#8b5a3c'), -0.05, 0.27, 0.03);
}
// furniture pointing +z (front)
function chairShape(g, wood, accent) {
  add(g, mesh(G.rbox(0.34, 0.06, 0.32, 0.02), accent), 0, 0.27, 0);
  add(g, mesh(G.rbox(0.34, 0.32, 0.05, 0.02), wood), 0, 0.46, -0.14);
  for (const [x, z] of [[-0.14, -0.13], [0.14, -0.13], [-0.14, 0.13], [0.14, 0.13]]) add(g, mesh(G.rbox(0.05, 0.26, 0.05, 0.015), wood), x, 0.13, z);
}
function buildItem(type) {
  const g = new THREE.Group();
  const base = type.replace('_r', ''), rare = type.endsWith('_r');
  const wood = rare ? '#d9935a' : '#c98a55', accent = rare ? PAINT[base] : '#e8b67c';
  if (WOOD[type]) logShape(g, type);
  else if (type === 'plank') {
    for (const [y, r] of [[0.04, 0], [0.11, 0.12]]) { const p = add(g, mesh(G.rbox(0.56, 0.06, 0.16, 0.02), y > 0.1 ? '#efc48a' : '#e0ad70'), 0, y, 0); p.rotation.y = r; add(p, mesh(G.rbox(0.5, 0.005, 0.01, 0.002), '#c08a50', false), 0, 0.031, 0.03); }
  } else if (type === 'refined') {
    add(g, mesh(G.rbox(0.56, 0.1, 0.14, 0.04), '#f6e1bd'), 0, 0.05, 0);
    add(g, mesh(G.rbox(0.5, 0.012, 0.02, 0.005), '#ffffff', false), 0, 0.105, 0.03);
    add(g, mesh(G.rbox(0.08, 0.105, 0.145, 0.02), '#5aa9ff'), 0.18, 0.05, 0);
  } else if (type === 'sawdust') {
    add(g, mesh(G.rbox(0.3, 0.22, 0.24, 0.09), '#e8cfa0'), 0, 0.11, 0);
    add(g, mesh(G.cyl(0.06, 0.1, 0.06, 8), '#c9a868'), 0, 0.24, 0);
    for (const [x, z] of [[-0.05, 0.13], [0.06, 0.12]]) add(g, mesh(G.sphere(0.03, 6, 5), '#d9b47a'), x, 0.08, z).scale.set(1, 0.5, 1);
  } else if (type === 'paper') {
    for (let i = 0; i < 4; i++) add(g, mesh(G.rbox(0.36, 0.02, 0.26, 0.008), i % 2 ? '#ffffff' : '#f4f0e6'), (i % 2) * 0.01, 0.015 + i * 0.022, (i % 2) * 0.01).rotation.y = i * 0.05;
    add(g, mesh(G.rbox(0.38, 0.03, 0.06, 0.01), '#ff8a6b'), 0, 0.06, 0);
  } else if (type === 'notebook') {
    add(g, mesh(G.rbox(0.3, 0.06, 0.38, 0.02), '#5a8fe0'), 0, 0.03, 0);
    add(g, mesh(G.rbox(0.28, 0.065, 0.36, 0.01), '#ffffff'), 0.012, 0.03, 0);
    add(g, mesh(G.rbox(0.31, 0.02, 0.385, 0.01), '#5a8fe0'), 0, 0.065, 0);
    add(g, mesh(G.rbox(0.14, 0.005, 0.08, 0.004), '#ffffff', false), 0.03, 0.077, -0.06);
  } else if (type === 'sap') {
    add(g, mesh(G.cyl(0.13, 0.11, 0.24, 12), '#aab4bf'), 0, 0.12, 0);
    add(g, mesh(G.cyl(0.115, 0.115, 0.02, 12), '#d98a3a', false), 0, 0.23, 0);
    const h = add(g, mesh(new THREE.TorusGeometry(0.11, 0.012, 5, 12, Math.PI), '#6a7382', false), 0, 0.24, 0);
  } else if (type === 'syrup') {
    add(g, mesh(G.rbox(0.18, 0.24, 0.12, 0.05), '#c96a2a'), 0, 0.12, 0);
    add(g, mesh(G.cyl(0.04, 0.05, 0.08, 8), '#c96a2a'), 0, 0.28, 0);
    add(g, mesh(G.cyl(0.045, 0.045, 0.03, 8), '#ff5a4e'), 0, 0.33, 0);
    add(g, mesh(G.rbox(0.19, 0.1, 0.125, 0.02), '#fff3dd'), 0, 0.12, 0);
    const lf = add(g, mesh(G.sphere(0.035, 6, 5), '#ff5a3c', false), 0, 0.13, 0.065); lf.scale.set(1.3, 1.1, 0.3);
  } else if (type === 'honey') {
    add(g, mesh(G.cyl(0.12, 0.12, 0.2, 14), '#ffb92e'), 0, 0.1, 0);
    add(g, mesh(G.cyl(0.13, 0.13, 0.06, 14), '#fbfaf5'), 0, 0.23, 0);
    add(g, mesh(G.cyl(0.124, 0.124, 0.07, 14), '#fff3dd'), 0, 0.1, 0);
    add(g, mesh(G.sphere(0.06, 8, 6), '#ffb92e'), 0, 0.27, 0).scale.set(1, 0.5, 1);
  } else if (type === 'wax') {
    add(g, mesh(G.rbox(0.3, 0.1, 0.22, 0.03), '#ffe07a'), 0, 0.05, 0);
    for (const x of [-0.07, 0.07]) for (const z of [-0.05, 0.05]) add(g, mesh(G.cyl(0.035, 0.035, 0.012, 6), '#f2c94a', false), x, 0.105, z);
  } else if (type === 'candle') {
    add(g, mesh(G.cyl(0.14, 0.15, 0.04, 14), '#d9a066'), 0, 0.02, 0);
    for (const [x, hh] of [[-0.05, 0.22], [0.06, 0.16]]) {
      add(g, mesh(G.cyl(0.04, 0.04, hh, 10), '#fff1c4'), x, 0.04 + hh / 2, 0);
      add(g, mesh(G.cone(0.025, 0.06, 6), '#ffb347', false), x, 0.08 + hh, 0);
    }
  } else if (type === 'shiitake') {
    for (const [x, z, s] of [[-0.07, 0, 1], [0.09, 0.04, 0.85], [0.02, -0.08, 0.75]]) {
      add(g, mesh(G.cyl(0.03 * s, 0.035 * s, 0.1 * s, 8), '#fff3dd'), x, 0.05 * s, z);
      add(g, mesh(G.sphere(0.09 * s, 12, 8), '#9a5a32'), x, 0.11 * s, z).scale.set(1, 0.5, 1);
      add(g, mesh(G.sphere(0.02 * s, 5, 4), '#e8c9a0', false), x + 0.03 * s, 0.15 * s, z);
    }
  } else if (type === 'truffle') {
    add(g, mesh(new THREE.DodecahedronGeometry(0.12, 1), '#3a2a22'), 0, 0.12, 0).scale.set(1.1, 0.9, 1);
    for (const [x, y, z] of [[0.06, 0.18, 0.05], [-0.05, 0.16, -0.06], [0.0, 0.21, -0.01]]) add(g, mesh(G.sphere(0.025, 5, 4), '#5a4434', false), x, y, z);
    add(g, mesh(G.rbox(0.05, 0.05, 0.05, 0.01), '#ffd34a', false), 0.1, 0.24, 0.08).rotation.set(0.7, 0.7, 0);
  } else if (base === 'chair') {
    chairShape(g, wood, accent);
  } else if (base === 'table') {
    add(g, mesh(G.rbox(0.56, 0.06, 0.42, 0.03), accent), 0, 0.36, 0);
    for (const [x, z] of [[-0.23, -0.16], [0.23, -0.16], [-0.23, 0.16], [0.23, 0.16]]) add(g, mesh(G.rbox(0.06, 0.34, 0.06, 0.02), wood), x, 0.17, z);
  } else if (base === 'bed') {
    add(g, mesh(G.rbox(0.42, 0.14, 0.66, 0.04), wood), 0, 0.12, 0);
    add(g, mesh(G.rbox(0.38, 0.08, 0.6, 0.04), '#fbfaf5'), 0, 0.22, 0.01);
    add(g, mesh(G.rbox(0.4, 0.06, 0.38, 0.03), accent), 0, 0.27, 0.12);
    add(g, mesh(G.rbox(0.26, 0.07, 0.14, 0.04), '#ffffff'), 0, 0.28, -0.2);
    add(g, mesh(G.rbox(0.44, 0.3, 0.06, 0.03), wood), 0, 0.25, -0.33);
  } else if (base === 'bookcase') {
    add(g, mesh(G.rbox(0.44, 0.62, 0.2, 0.03), wood), 0, 0.31, 0);
    for (const y of [0.18, 0.38]) add(g, mesh(G.rbox(0.4, 0.03, 0.18, 0.01), accent), 0, y, 0.015);
    const cols = ['#ff7a66', '#5aa9ff', '#59c25b', '#ffd34a', '#a98bff'];
    for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) add(g, mesh(G.rbox(0.055, 0.14, 0.13, 0.01), cols[(i + r * 2) % 5]), -0.14 + i * 0.07, 0.27 + r * 0.2, 0.02);
  } else if (base === 'rocker') {
    chairShape(g, wood, accent);
    for (const x of [-0.16, 0.16]) { const r = add(g, mesh(new THREE.TorusGeometry(0.36, 0.022, 5, 18, Math.PI * 0.42), wood), x, 0.4, 0); r.rotation.set(0, Math.PI / 2, Math.PI * 1.29); }
    for (const x of [-0.17, 0.17]) add(g, mesh(G.rbox(0.04, 0.04, 0.3, 0.015), accent), x, 0.38, 0.02);
  } else if (type === 'money') {
    add(g, mesh(G.rbox(0.42, 0.06, 0.24, 0.02), C.money), 0, 0.03, 0);
    add(g, mesh(G.rbox(0.1, 0.065, 0.245, 0.01), '#d8f7c8'), 0, 0.03, 0);
  }
  g.traverse((o) => { if (o.isMesh && !o.userData.outline && o.material.isMeshLambertMaterial) o.castShadow = true; });
  bakeStatic(g);
  return g;
}

// ---------- trees: alive (trunk + crown) and stump; sapling for replanting ----------
function treeBase(trunkCol) {
  const g = new THREE.Group();
  g.add(blob(1.1));
  const alive = add(g, new THREE.Group()); alive.userData.dyn = true;
  add(alive, mesh(G.cyl(0.18, 0.26, 1.1, 8), trunkCol), 0, 0.55, 0);
  const stump = add(g, new THREE.Group()); stump.userData.dyn = true; stump.visible = false;
  add(stump, mesh(G.cyl(0.24, 0.28, 0.28, 8), trunkCol), 0, 0.14, 0);
  add(stump, mesh(G.cyl(0.2, 0.2, 0.02, 8), '#f2d2a2'), 0, 0.29, 0);
  const sapling = add(g, new THREE.Group()); sapling.userData.dyn = true; sapling.visible = false;
  add(sapling, mesh(G.cyl(0.04, 0.05, 0.5, 6), trunkCol), 0, 0.25, 0);
  add(sapling, mesh(G.sphere(0.22, 8, 6), '#7fd66a'), 0, 0.58, 0);
  const fire = add(g, new THREE.Group(), 0, 0.9, 0); fire.userData.dyn = true; fire.visible = false;
  const fm = new THREE.MeshBasicMaterial({ color: '#ff8a2a', transparent: true, opacity: 0.85 }), fm2 = new THREE.MeshBasicMaterial({ color: '#ffe14d', transparent: true, opacity: 0.9 });
  for (let i = 0; i < 5; i++) { const a = i * 1.26, f = new THREE.Mesh(G.cone(0.32, 1.1, 6), i % 2 ? fm : fm2); f.position.set(Math.cos(a) * 0.4, 0.5 + (i % 2) * 0.4, Math.sin(a) * 0.4); fire.add(f); }
  return { g, alive, stump, sapling, fire };
}
export function pineTree() {
  const t = treeBase('#9a6236');
  for (let i = 0; i < 3; i++) add(t.alive, mesh(G.cone(1.0 - i * 0.24, 1.0, 9), i % 2 ? '#3f9a58' : '#4aae62'), 0, 1.3 + i * 0.62, 0);
  return t;
}
export function oakTree() {
  const t = treeBase('#7e4a24');
  add(t.alive, mesh(G.sphere(0.95, 10, 8), '#5fae4a'), 0, 1.7, 0);
  add(t.alive, mesh(G.sphere(0.66, 9, 7), '#6fbf55'), 0.5, 2.0, 0.3);
  add(t.alive, mesh(G.sphere(0.6, 9, 7), '#4f9d40'), -0.5, 2.05, -0.2);
  for (const [x, z] of [[0.6, 0.6], [-0.7, 0.4], [0.2, -0.85]]) add(t.alive, mesh(G.sphere(0.07, 6, 5), '#8b5a3c'), x, 1.5, z);
  return t;
}
export function mapleTree() {
  const t = treeBase('#8b4a2c');
  add(t.alive, mesh(G.sphere(0.9, 10, 8), '#ff7a3c'), 0, 1.75, 0);
  add(t.alive, mesh(G.sphere(0.62, 9, 7), '#ff5a3c'), 0.5, 2.05, 0.3);
  add(t.alive, mesh(G.sphere(0.58, 9, 7), '#ffa04a'), -0.5, 2.1, -0.2);
  return t;
}
// decorative forest tree (static, baked into the scenery)
export function decoTree(kind, s = 1) {
  const t = kind === 'oak' ? oakTree() : kind === 'maple' ? mapleTree() : pineTree();
  t.g.remove(t.stump); t.g.remove(t.sapling); t.g.remove(t.fire); t.alive.userData.dyn = false;
  t.g.scale.setScalar(s);
  return t.g;
}
// maple with a tap and a bucket; fruit = the bucket full of sap
export function tapMaple() {
  const g = new THREE.Group();
  g.add(blob(1.0));
  add(g, mesh(G.cyl(0.2, 0.28, 1.2, 8), '#8b4a2c'), 0, 0.6, 0);
  add(g, mesh(G.sphere(0.85, 10, 8), '#ff7a3c'), 0, 1.75, 0);
  add(g, mesh(G.sphere(0.58, 9, 7), '#ffa04a'), 0.45, 2.05, 0.25);
  add(g, mesh(G.cyl(0.02, 0.02, 0.2, 5), C.grey), 0, 0.75, 0.3).rotation.x = Math.PI / 2;
  add(g, mesh(G.cyl(0.13, 0.11, 0.24, 10), '#aab4bf'), 0, 0.52, 0.38);
  const fruit = add(g, new THREE.Group(), 0, 0, 0);
  add(fruit, mesh(G.cyl(0.115, 0.115, 0.02, 10), '#d98a3a', false), 0, 0.63, 0.38);
  add(fruit, mesh(G.sphere(0.04, 6, 5), '#d98a3a', false), 0, 0.7, 0.33);
  return { g, fruit };
}
// a little cluster of mushrooms growing on a mossy log (fruit = the caps)
export function mushroomSpot() {
  const g = new THREE.Group();
  const log = add(g, mesh(G.cyl(0.14, 0.15, 0.7, 8), '#8b5a3c'), 0, 0.1, 0); log.rotation.z = Math.PI / 2;
  add(g, mesh(G.sphere(0.12, 7, 5), '#6fbf55'), 0.15, 0.2, 0.02).scale.set(1.5, 0.4, 1);
  const fruit = add(g, new THREE.Group());
  for (const [x, z, s] of [[-0.18, 0.14, 1], [0.05, 0.16, 0.8], [0.2, -0.12, 0.9], [-0.06, -0.16, 0.7]]) {
    add(fruit, mesh(G.cyl(0.03 * s, 0.035 * s, 0.14 * s, 6), '#fff3dd'), x, 0.07 * s, z);
    add(fruit, mesh(G.sphere(0.11 * s, 10, 7), '#9a5a32'), x, 0.15 * s, z).scale.set(1, 0.5, 1);
  }
  return { g, fruit };
}
export function mossPlot(w, d) {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(w, 0.08, d, 0.3), '#6fae4a', false, true), 0, 0.04, 0);
  add(g, mesh(G.rbox(w - 0.3, 0.03, d - 0.3, 0.25), '#5c9a3c', false, true), 0, 0.085, 0);
  for (const [x, z, s] of [[-w / 2, d / 2 - 0.2, 0.25], [w / 2 - 0.1, -d / 2 + 0.2, 0.3]]) { const r = add(g, mesh(new THREE.DodecahedronGeometry(s, 0), '#9aa7a0'), x, s * 0.4, z); r.scale.set(1, 0.6, 0.9); add(r, mesh(G.sphere(s * 0.7, 6, 5), '#6fbf55'), 0, s * 0.45, 0).scale.set(1.1, 0.35, 1.1); }
  return g;
}

// ---------- beehive, flowers ----------
export function hive() {
  const g = new THREE.Group();
  g.add(blob(0.7));
  add(g, mesh(G.rbox(0.8, 0.12, 0.7, 0.03), '#b8733f'), 0, 0.3, 0);
  for (const s of [-1, 1]) add(g, mesh(G.rbox(0.06, 0.3, 0.06, 0.02), '#8b5a3c'), s * 0.3, 0.15, 0.25);
  for (let i = 0; i < 3; i++) add(g, mesh(G.rbox(0.74, 0.22, 0.64, 0.04), i % 2 ? '#ffd34a' : '#fbfaf5'), 0, 0.47 + i * 0.22, 0);
  add(g, mesh(G.rbox(0.86, 0.08, 0.76, 0.03), '#ff8a6b'), 0, 1.13, 0);
  add(g, mesh(G.rbox(0.2, 0.05, 0.03, 0.01), '#3a2a22', false), 0, 0.42, 0.33);
  const bees = add(g, new THREE.Group(), 0, 1.3, 0); bees.userData.dyn = true;
  for (let i = 0; i < 3; i++) { const b = add(bees, mesh(G.sphere(0.05, 6, 5), '#ffd34a', false), Math.cos(i * 2.1) * 0.5, i * 0.1, Math.sin(i * 2.1) * 0.5); b.scale.set(1.3, 0.9, 0.9); }
  return { g, bees };
}

// ---------- machines: input tray left, output tray right ----------
function tray(g, x, z, col) {
  const t = add(g, new THREE.Group(), x, 0, z);
  add(t, mesh(G.rbox(1.0, 0.24, 0.8, 0.06), C.woodLight), 0, 0.12, 0);
  add(t, mesh(G.rbox(0.86, 0.04, 0.66, 0.02), col), 0, 0.24, 0);
  return t;
}
export function machine5(kind) {
  const g = new THREE.Group();
  g.add(blob(1.8));
  let spin, wheel = null;
  if (kind === 'sawmill') {
    add(g, mesh(G.rbox(1.7, 1.2, 1.2, 0.1), '#c98a55'), 0, 0.6, -0.2);
    add(g, mesh(G.prism(1.9, 0.6, 1.5), '#8f5a36'), 0, 1.2, -0.2);
    add(g, mesh(G.rbox(1.6, 0.1, 0.5, 0.03), '#e8c290'), 0, 0.85, 0.42);
    spin = add(g, new THREE.Group(), 0, 1.0, 0.45);
    add(spin, mesh(G.cyl(0.32, 0.32, 0.04, 16), '#cfd6de'), 0, 0, 0).rotation.x = Math.PI / 2;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(spin, mesh(G.cone(0.05, 0.08, 4), '#aab4bf'), Math.cos(a) * 0.34, Math.sin(a) * 0.34, 0).rotation.z = a - Math.PI / 2; }
    spin.userData.axis = 'z';
    wheel = new THREE.Group();
    add(wheel, mesh(G.cyl(1.0, 1.0, 0.12, 18), '#a8693a'), 0, 0, -0.3).rotation.z = Math.PI / 2;
    add(wheel, mesh(G.cyl(1.0, 1.0, 0.12, 18), '#a8693a'), 0, 0, 0.3).rotation.z = Math.PI / 2;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const p = add(wheel, mesh(G.rbox(0.08, 0.32, 0.7, 0.02), '#d9a066'), 0, Math.cos(a) * 0.95, Math.sin(a) * 0.95); p.rotation.x = -a; }
    add(wheel, mesh(G.cyl(0.12, 0.12, 0.8, 8), '#5b6474'), 0, 0, 0).rotation.x = Math.PI / 2;
  } else if (kind === 'planer') {
    add(g, mesh(G.rbox(1.6, 0.85, 1.0, 0.1), '#7fb6c9'), 0, 0.43, -0.2);
    add(g, mesh(G.rbox(1.66, 0.1, 1.06, 0.04), '#5b6474'), 0, 0.9, -0.2);
    add(g, mesh(G.rbox(0.9, 0.3, 0.6, 0.06), '#ffd34a'), 0, 1.1, -0.2);
    spin = add(g, new THREE.Group(), 0, 1.0, 0.35);
    add(spin, mesh(G.cyl(0.14, 0.14, 1.0, 10), '#cfd6de'), 0, 0, 0).rotation.z = Math.PI / 2;
    spin.userData.axis = 'x';
  } else if (kind === 'paper') {
    add(g, mesh(G.rbox(1.6, 0.6, 1.1, 0.12), '#bfe6fa'), 0, 0.3, -0.2);
    add(g, mesh(G.cyl(0.5, 0.45, 0.6, 16), '#fbfaf5'), -0.3, 0.9, -0.3);
    add(g, mesh(G.cyl(0.42, 0.42, 0.04, 16), '#e8d9b0', false, true), -0.3, 1.2, -0.3);
    spin = add(g, new THREE.Group(), 0.45, 0.85, 0.05);
    for (const y of [0, 0.22]) add(spin, mesh(G.cyl(0.11, 0.11, 0.7, 10), '#aab4bf'), 0, y, 0).rotation.x = Math.PI / 2;
    spin.userData.axis = 'z2';
  } else if (kind === 'binder') {
    add(g, mesh(G.rbox(1.5, 0.8, 1.0, 0.1), '#b48cff'), 0, 0.4, -0.2);
    add(g, mesh(G.rbox(1.56, 0.08, 1.06, 0.03), '#7a4fd6'), 0, 0.84, -0.2);
    spin = add(g, new THREE.Group(), 0, 1.1, -0.2);
    add(spin, mesh(G.rbox(0.7, 0.12, 0.5, 0.04), '#5b6474'), 0, 0, 0);
    add(spin, mesh(G.cyl(0.04, 0.04, 0.5, 6), '#cfd6de'), 0, 0.3, 0);
    spin.userData.axis = 'dip';
  } else if (kind === 'syrup') {
    add(g, mesh(G.rbox(1.6, 0.6, 1.1, 0.1), '#c96a4a'), 0, 0.3, -0.2);
    add(g, mesh(G.rbox(1.3, 0.3, 0.8, 0.06), '#aab4bf'), 0, 0.75, -0.2);
    add(g, mesh(G.rbox(1.2, 0.04, 0.7, 0.03), '#d98a3a', false, true), 0, 0.91, -0.2);
    add(g, mesh(G.cyl(0.12, 0.14, 1.0, 8), '#6a7382'), 0.55, 1.2, -0.55);
    spin = add(g, new THREE.Group(), 0.55, 1.75, -0.55);
    for (let i = 0; i < 3; i++) add(spin, mesh(G.sphere(0.13 - i * 0.02, 7, 5), '#f2f2f2', false), 0, i * 0.2, 0);
    spin.userData.axis = 'steam';
  } else if (kind === 'candle') {
    add(g, mesh(G.rbox(1.5, 0.75, 1.0, 0.1), '#ffd34a'), 0, 0.38, -0.2);
    add(g, mesh(G.rbox(1.56, 0.08, 1.06, 0.03), '#e8a53a'), 0, 0.8, -0.2);
    for (const x of [-0.45, -0.15, 0.15, 0.45]) { add(g, mesh(G.cyl(0.05, 0.05, 0.3, 8), '#fff1c4'), x, 1.0, -0.1); add(g, mesh(G.cone(0.03, 0.07, 6), '#ffb347', false), x, 1.19, -0.1); }
    spin = add(g, new THREE.Group(), 0, 1.35, -0.45);
    add(spin, mesh(G.cyl(0.25, 0.3, 0.3, 12), '#aab4bf'), 0, 0, 0);
    spin.userData.axis = 'dip';
  } else if (kind === 'shroom') {
    add(g, mesh(G.rbox(1.8, 1.2, 1.3, 0.1), '#8b5a3c'), 0, 0.6, -0.25);
    add(g, mesh(G.prism(2.0, 0.6, 1.6), '#4f8f5f'), 0, 1.2, -0.25);
    for (const y of [0.4, 0.75]) { const l = add(g, mesh(G.cyl(0.11, 0.11, 1.5, 8), '#a8693a'), 0, y, 0.45); l.rotation.z = Math.PI / 2; for (const x of [-0.5, 0, 0.45]) add(g, mesh(G.sphere(0.09, 8, 6), '#9a5a32'), x, y + 0.1, 0.52).scale.set(1, 0.5, 1); }
    spin = add(g, new THREE.Group(), 0, 1.6, -0.25);
    add(spin, mesh(G.cyl(0.1, 0.12, 0.4, 8), '#6a7382'), 0, 0, 0);
    spin.userData.axis = 'none';
  } else {
    // furniture workbench: wooden table with a saw going back and forth
    add(g, mesh(G.rbox(1.7, 0.12, 1.0, 0.04), '#c98a55'), 0, 0.82, -0.2);
    for (const [x, z] of [[-0.75, -0.6], [0.75, -0.6], [-0.75, 0.2], [0.75, 0.2]]) add(g, mesh(G.rbox(0.1, 0.8, 0.1, 0.03), '#8b5a3c'), x, 0.4, z);
    add(g, mesh(G.rbox(1.5, 0.06, 0.8, 0.03), '#8b5a3c'), 0, 0.25, -0.2);
    add(g, mesh(G.rbox(0.4, 0.1, 0.25, 0.03), '#5aa9ff'), -0.5, 0.93, -0.45);
    spin = add(g, new THREE.Group(), 0.2, 0.95, -0.15);
    add(spin, mesh(G.rbox(0.5, 0.12, 0.02, 0.01), '#cfd6de'), 0, 0, 0);
    add(spin, mesh(G.rbox(0.14, 0.1, 0.06, 0.03), '#ff6b5a'), -0.3, 0.02, 0);
    spin.userData.axis = 'saw';
  }
  spin.userData.dyn = true;
  const inTray = tray(g, -1.45, 0.65, '#f6dd8a');
  const outTray = tray(g, 1.45, 0.65, '#cfe9ff');
  return { g, inTray, outTray, spin, wheel };
}

// furniture display stage in the showroom
export function platform() {
  const g = new THREE.Group();
  g.add(blob(1.6));
  add(g, mesh(G.rbox(2.8, 0.22, 1.8, 0.08), '#e8c290'), 0, 0.11, 0);
  add(g, mesh(G.rbox(2.6, 0.04, 1.6, 0.06), '#fff3dd', false, true), 0, 0.23, 0);
  add(g, mesh(G.rbox(2.82, 0.06, 1.82, 0.03), '#59a14f'), 0, 0.03, 0);
  const sign = add(g, new THREE.Group(), 0, 0, -0.95);
  add(sign, mesh(G.rbox(0.08, 0.9, 0.08, 0.02), C.woodDark), 0, 0.45, 0);
  add(sign, mesh(G.rbox(0.7, 0.36, 0.06, 0.04), '#fbfaf5'), 0, 0.95, 0);
  return { g, sign };
}

// raised log flume: a water channel on posts; length along +x
export function flumePiece(len) {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(len, 0.1, 0.62, 0.03), '#c98a55'), len / 2, 1.5, 0);
  for (const s of [-1, 1]) add(g, mesh(G.rbox(len, 0.26, 0.08, 0.03), '#b8733f'), len / 2, 1.65, s * 0.3);
  add(g, mesh(G.rbox(len, 0.03, 0.46, 0.02), '#7fd3ff', false, true), len / 2, 1.58, 0);
  for (let x = 0.4; x < len; x += 2.6) for (const s of [-1, 1]) add(g, mesh(G.rbox(0.12, 1.5, 0.12, 0.03), '#8b5a3c'), x, 0.75, s * 0.26);
  return g;
}
export function hopper() {
  const g = new THREE.Group();
  g.add(blob(1));
  add(g, mesh(G.rbox(1.2, 1.4, 1.0, 0.08), '#b8733f'), 0, 0.7, 0);
  add(g, mesh(G.rbox(1.3, 0.12, 1.1, 0.04), '#8b5a3c'), 0, 1.42, 0);
  add(g, mesh(G.rbox(1.0, 0.05, 0.8, 0.03), '#7fd3ff', false, true), 0, 1.45, 0);
  for (let i = 0; i < 3; i++) { const l = add(g, mesh(G.cyl(0.12, 0.12, 0.6, 8), '#e0a96a'), -0.3 + i * 0.3, 0.3, 0.55); l.rotation.x = Math.PI / 2; l.rotation.z = 0.2 * i; }
  return g;
}

// ---------- town ----------
export function lotOutline() {
  const g = new THREE.Group();
  for (const [x, z, w, d] of [[0, -2, 4.2, 0.12], [0, 2, 4.2, 0.12], [-2, 0, 0.12, 4.2], [2, 0, 0.12, 4.2]]) add(g, mesh(G.rbox(w, 0.04, d, 0.02), '#f2e6c8', false, true), x, 0.02, z);
  for (const [x, z] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) add(g, mesh(G.cyl(0.08, 0.08, 0.5, 6), '#d9a066'), x, 0.25, z);
  return g;
}
export function scaffold() {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(3.8, 0.12, 3.8, 0.04), '#c9b28a', false, true), 0, 0.06, 0);
  for (const [x, z] of [[-1.7, -1.7], [1.7, -1.7], [-1.7, 1.7], [1.7, 1.7]]) add(g, mesh(G.rbox(0.12, 2.4, 0.12, 0.03), '#d9a066'), x, 1.2, z);
  for (const y of [0.9, 1.9]) for (const [x, z, w, d] of [[0, -1.7, 3.5, 0.08], [0, 1.7, 3.5, 0.08], [-1.7, 0, 0.08, 3.5], [1.7, 0, 0.08, 3.5]]) add(g, mesh(G.rbox(w, 0.08, d, 0.02), '#e0b070'), x, y, z);
  add(g, mesh(G.rbox(1.6, 0.6, 1.4, 0.05), '#e8c290'), -0.5, 0.36, 0.3);
  add(g, mesh(G.rbox(0.9, 1.2, 0.9, 0.05), '#cfd6de'), 0.8, 0.66, -0.6);
  return g;
}
const roofOf = (g, w, d, col, y) => add(g, mesh(G.prism(w, 1.1, d), col), 0, y, 0);
export function townBuilding(kind) {
  const g = new THREE.Group();
  g.add(blob(3));
  if (kind === 'house') {
    add(g, mesh(G.rbox(3.4, 2.0, 3.0, 0.12), '#fff3dd'), 0, 1.0, 0);
    roofOf(g, 3.8, 3.4, '#ff8a6b', 2.0);
    add(g, mesh(G.rbox(0.7, 1.1, 0.08, 0.05), '#8b5a3c'), 0.6, 0.55, 1.52);
    for (const x of [-0.9]) add(g, mesh(G.rbox(0.7, 0.6, 0.06, 0.05), '#bfe9ff'), x, 1.2, 1.52);
    add(g, mesh(G.rbox(0.4, 0.8, 0.4, 0.04), '#c96a4a'), 1.0, 2.7, -0.6);
  } else if (kind === 'bakery') {
    add(g, mesh(G.rbox(3.6, 2.0, 3.2, 0.12), '#ffe6c8'), 0, 1.0, 0);
    roofOf(g, 4.0, 3.6, '#c96a4a', 2.0);
    for (let i = 0; i < 6; i++) add(g, mesh(G.rbox(0.6, 0.12, 0.5, 0.03), i % 2 ? '#ffffff' : '#ff8a6b'), -1.5 + i * 0.6, 1.85, 1.8).rotation.x = 0.4;
    add(g, mesh(G.rbox(1.6, 0.7, 0.08, 0.05), '#bfe9ff'), -0.6, 1.1, 1.62);
    add(g, mesh(G.rbox(0.6, 0.18, 0.4, 0.06), '#e3a257'), -0.6, 0.9, 1.7);
  } else if (kind === 'school') {
    add(g, mesh(G.rbox(3.8, 2.4, 3.2, 0.12), '#ffd8a8'), 0, 1.2, 0);
    roofOf(g, 4.2, 3.6, '#5aa9ff', 2.4);
    add(g, mesh(G.rbox(0.8, 1.0, 0.5, 0.05), '#fbfaf5'), 0, 3.4, 0);
    add(g, mesh(G.cyl(0.25, 0.25, 0.06, 16), '#ffffff'), 0, 3.5, 0.27).rotation.x = Math.PI / 2;
    for (const x of [-1.2, 1.2]) add(g, mesh(G.rbox(0.8, 0.7, 0.06, 0.05), '#bfe9ff'), x, 1.4, 1.62);
    add(g, mesh(G.rbox(0.8, 1.2, 0.08, 0.05), '#8b5a3c'), 0, 0.6, 1.62);
  } else if (kind === 'park') {
    add(g, mesh(G.rbox(4.0, 0.08, 4.0, 0.3), '#8fd16a', false, true), 0, 0.04, 0);
    add(g, mesh(G.cyl(0.9, 1.0, 0.4, 18), '#cfd6de'), 0, 0.2, 0);
    add(g, mesh(G.cyl(0.75, 0.75, 0.05, 18), '#7fd3ff', false, true), 0, 0.42, 0);
    add(g, mesh(G.cyl(0.12, 0.15, 0.7, 8), '#cfd6de'), 0, 0.7, 0);
    for (const [x, z, r] of [[-1.4, 1.2, 0], [1.4, 1.2, 0]]) { const b = add(g, new THREE.Group(), x, 0, z); b.rotation.y = r; add(b, mesh(G.rbox(1.0, 0.08, 0.36, 0.03), '#d9935a'), 0, 0.4, 0); add(b, mesh(G.rbox(1.0, 0.3, 0.06, 0.03), '#d9935a'), 0, 0.6, -0.16); }
    for (const [x, z] of [[-1.4, -1.3], [1.4, -1.3]]) { add(g, mesh(G.cyl(0.12, 0.16, 1.0, 7), '#8b5a3c'), x, 0.5, z); add(g, mesh(G.sphere(0.7, 9, 7), '#6fbf55'), x, 1.4, z); }
  } else if (kind === 'fire') {
    add(g, mesh(G.rbox(3.6, 2.2, 3.2, 0.12), '#ff6b5a'), 0, 1.1, 0);
    add(g, mesh(G.rbox(3.7, 0.2, 3.3, 0.06), '#fbfaf5'), 0, 2.25, 0);
    add(g, mesh(G.rbox(2.0, 1.5, 0.08, 0.05), '#fbfaf5'), 0, 0.78, 1.62);
    for (let i = 0; i < 4; i++) add(g, mesh(G.rbox(2.0, 0.04, 0.1, 0.01), '#d9dee3'), 0, 0.3 + i * 0.35, 1.67);
    add(g, mesh(G.rbox(0.8, 1.2, 0.8, 0.06), '#ff6b5a'), 1.2, 2.9, -0.8);
    add(g, mesh(G.sphere(0.2, 8, 6), '#ffd34a'), 1.2, 3.6, -0.8);
  } else if (kind === 'train') {
    add(g, mesh(G.rbox(3.8, 1.8, 2.6, 0.12), '#bfe6fa'), 0, 0.9, -0.3);
    roofOf(g, 4.4, 3.4, '#4f8f5f', 1.8);
    add(g, mesh(G.cyl(0.32, 0.32, 0.08, 16), '#ffffff'), 0, 2.2, 1.0).rotation.x = Math.PI / 2;
    add(g, mesh(G.rbox(4.2, 0.12, 1.2, 0.04), '#cfd6de', false, true), 0, 0.06, 1.6);
    for (const x of [-1.8, 1.8]) add(g, mesh(G.rbox(0.12, 1.6, 0.12, 0.03), '#6a7382'), x, 0.8, 1.9);
    add(g, mesh(G.rbox(4.2, 0.1, 0.9, 0.03), '#4f8f5f'), 0, 1.6, 1.8);
  } else {
    // clock tower
    add(g, mesh(G.rbox(2.6, 1.0, 2.6, 0.1), '#d9cdb8'), 0, 0.5, 0);
    add(g, mesh(G.rbox(1.8, 4.0, 1.8, 0.1), '#fff3dd'), 0, 3.0, 0);
    for (const [x, z, r] of [[0, 0.92, 0], [0.92, 0, Math.PI / 2]]) { const c = add(g, mesh(G.cyl(0.6, 0.6, 0.08, 20), '#ffffff'), x, 4.2, z); c.rotation.x = Math.PI / 2; c.rotation.z = r; }
    add(g, mesh(G.rbox(0.06, 0.45, 0.04, 0.01), '#3a2a22', false), 0, 4.35, 0.97);
    add(g, mesh(G.rbox(0.3, 0.06, 0.04, 0.01), '#3a2a22', false), 0.12, 4.2, 0.97);
    add(g, mesh(G.cone(1.4, 1.6, 4), '#ff8a6b'), 0, 5.8, 0).rotation.y = Math.PI / 4;
    add(g, mesh(G.sphere(0.18, 8, 6), '#ffd34a'), 0, 6.7, 0);
  }
  return g;
}
export function train() {
  const g = new THREE.Group();
  const cars = [];
  const eng = add(g, new THREE.Group());
  add(eng, mesh(G.rbox(3.0, 1.2, 1.5, 0.2), '#ff6b5a'), 0, 0.9, 0);
  add(eng, mesh(G.cyl(0.55, 0.55, 1.6, 14), '#3a3540'), -0.4, 1.2, 0).rotation.z = Math.PI / 2;
  add(eng, mesh(G.rbox(1.1, 1.0, 1.5, 0.15), '#ff6b5a'), 1.0, 1.9, 0);
  add(eng, mesh(G.rbox(1.2, 0.12, 1.6, 0.05), '#3a3540'), 1.0, 2.45, 0);
  add(eng, mesh(G.cyl(0.18, 0.22, 0.7, 10), '#3a3540'), -1.0, 2.0, 0);
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { const w = add(eng, mesh(G.cyl(0.32, 0.32, 0.12, 12), '#3a3540'), -1.0 + i * 1.0, 0.32, s * 0.7); w.rotation.x = Math.PI / 2; }
  for (let c = 0; c < 2; c++) {
    const car = add(g, new THREE.Group(), -3.4 - c * 3.2, 0, 0);
    add(car, mesh(G.rbox(2.8, 0.9, 1.5, 0.15), c ? '#5aa9ff' : '#ffd34a'), 0, 0.9, 0);
    add(car, mesh(G.rbox(2.6, 0.08, 1.3, 0.04), '#b8733f', false, true), 0, 1.36, 0);
    for (const x of [-0.9, 0.9]) for (const s of [-1, 1]) { const w = add(car, mesh(G.cyl(0.28, 0.28, 0.12, 12), '#3a3540'), x, 0.3, s * 0.7); w.rotation.x = Math.PI / 2; }
    cars.push(car);
  }
  return { g, cars };
}
export function rails(len) {
  const g = new THREE.Group();
  for (let x = 0; x < len; x += 0.8) add(g, mesh(G.rbox(0.24, 0.06, 1.8, 0.02), '#8b5a3c', false, true), x, 0.03, 0);
  for (const s of [-1, 1]) add(g, mesh(G.rbox(len, 0.08, 0.1, 0.02), '#8f969f', false, true), len / 2, 0.1, s * 0.6);
  return g;
}
export function bridge(len, wid) {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(len, 0.18, wid, 0.05), '#c98a55', false, true), 0, 0.12, 0);
  for (let x = -len / 2 + 0.3; x < len / 2; x += 0.5) add(g, mesh(G.rbox(0.04, 0.02, wid - 0.06, 0.01), '#a8693a', false, true), x, 0.215, 0);
  for (const s of [-1, 1]) {
    add(g, mesh(G.rbox(len, 0.1, 0.12, 0.04), '#d9935a'), 0, 0.85, s * (wid / 2 - 0.06));
    for (let x = -len / 2; x <= len / 2 + 0.01; x += len / 3) add(g, mesh(G.rbox(0.14, 0.75, 0.14, 0.04), '#b8733f'), x, 0.5, s * (wid / 2 - 0.06));
  }
  return g;
}

// ---------- animals ----------
export function deer() {
  const g = new THREE.Group();
  g.add(blob(0.6));
  const b = add(g, new THREE.Group());
  add(b, mesh(G.capsule(0.22, 0.55, 8), '#c98a55'), 0, 0.75, 0).rotation.x = Math.PI / 2;
  add(b, mesh(G.sphere(0.18, 10, 8), '#c98a55'), 0, 1.15, 0.45);
  add(b, mesh(G.sphere(0.08, 8, 6), '#3a2a22'), 0, 1.12, 0.62);
  for (const s of [-1, 1]) {
    for (const z of [-0.28, 0.28]) add(b, mesh(G.capsule(0.05, 0.4, 6), '#a8693a'), s * 0.12, 0.3, z);
    const an = add(b, mesh(G.cyl(0.02, 0.025, 0.35, 5), '#8b5a3c'), s * 0.08, 1.42, 0.4); an.rotation.z = s * 0.4;
    for (const [x, z] of [[0, 0.33]]) add(b, mesh(G.sphere(0.03, 6, 5), '#fbfaf5', false), s * 0.1 + x, 0.85, z - 0.5);
  }
  add(b, mesh(G.sphere(0.07, 6, 5), '#fbfaf5'), 0, 0.85, -0.45);
  return { g, b };
}
export function squirrel() {
  const g = new THREE.Group();
  g.add(blob(0.25));
  const b = add(g, new THREE.Group());
  add(b, mesh(G.sphere(0.12, 10, 8), '#d9773a'), 0, 0.14, 0).scale.set(1, 1, 1.3);
  add(b, mesh(G.sphere(0.09, 10, 8), '#d9773a'), 0, 0.28, 0.12);
  for (const s of [-1, 1]) add(b, mesh(G.cone(0.03, 0.06, 4), '#d9773a'), s * 0.05, 0.38, 0.12);
  const tail = add(b, mesh(G.capsule(0.07, 0.2, 6), '#e8954a'), 0, 0.3, -0.15); tail.rotation.x = -0.5;
  add(b, mesh(G.sphere(0.03, 6, 5), '#8b5a3c'), 0, 0.22, 0.24);
  return { g, b, tail };
}
