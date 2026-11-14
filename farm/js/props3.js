// Harbour map props (海邊漁港): items, boats, piers, kitchen machines, tables, beach scenery.
// Everything is built from the shared style kit so it matches the farm.
import * as THREE from 'three';
import { C, G, mesh, add, blob, bakeStatic } from './kit.js';

export const ITEMS = {
  fish: { name: '鯛魚', icon: '🐟', h: 0.22, price: 6 },
  seaweed: { name: '海帶', icon: '🌿', h: 0.16, price: 4 },
  rice: { name: '米', icon: '🍚', h: 0.3, price: 0 },
  iced: { name: '冰鮮魚', icon: '🧊', h: 0.25, price: 12 },
  can: { name: '魚罐頭', icon: '🥫', h: 0.21, price: 18 },
  dried: { name: '魚乾', icon: '🐠', h: 0.12, price: 22 },
  grilled: { name: '烤魚', icon: '🍢', h: 0.17, price: 16 },
  sushi: { name: '壽司', icon: '🍣', h: 0.21, price: 30 },
  plate: { name: '髒盤子', icon: '🍽', h: 0.07, price: 0 },
  money: { name: '錢', icon: '💵', h: 0.07, price: 0 },
};

// a fish lying on its side (pointing +x), so the top-down camera sees its profile
export function fishShape(g, s, body, belly, y0, flat = 1) {
  const f = add(g, new THREE.Group(), 0, y0, 0);
  f.scale.setScalar(s);
  add(f, mesh(G.sphere(0.13, 14, 10), body), 0.02, 0, 0.015).scale.set(1.75, 0.6 * flat, 0.85);
  add(f, mesh(G.sphere(0.12, 12, 8), belly), 0.04, -0.012, -0.045).scale.set(1.45, 0.5 * flat, 0.6);
  // tail fan: cone tip toward the body, flattened so it reads from above
  const tail = add(f, mesh(G.cone(0.12, 0.17, 4), body), -0.27, 0, 0.01);
  tail.rotation.set(0, 0, -Math.PI / 2); tail.scale.set(0.35 * flat, 1, 1);
  const fin = add(f, mesh(G.cone(0.06, 0.1, 4), body), -0.02, 0, 0.1); fin.rotation.set(Math.PI / 2, 0, 0); fin.scale.set(1, 1, 0.3 * flat);
  add(f, mesh(G.sphere(0.035, 8, 6), '#ffffff', false), 0.15, 0.05 * flat, 0.03);
  add(f, mesh(G.sphere(0.018, 6, 5), '#2d2a33', false), 0.16, 0.075 * flat, 0.035);
  return f;
}

const itemCache = new Map();
export function itemMesh(type) {
  let t = itemCache.get(type);
  if (!t) { t = buildItem(type); itemCache.set(type, t); }
  return t.clone();
}
function buildItem(type) {
  const g = new THREE.Group();
  if (type === 'fish') {
    fishShape(g, 1, '#ff7f86', '#ffe6e2', 0.11);
    add(g, mesh(G.cone(0.05, 0.12, 4), '#ff5f6a'), 0.06, 0.13, 0.1).rotation.x = Math.PI / 2;
  } else if (type === 'seaweed') {
    // a bundle of wavy kelp ribbons tied in the middle
    const cols = ['#2f8f55', '#3fae66', '#267f47'];
    for (let i = 0; i < 3; i++) {
      const rib = add(g, new THREE.Group(), 0, 0.035 + i * 0.04, (i - 1) * 0.06); rib.rotation.y = (i - 1) * 0.22;
      for (let k = 0; k < 6; k++) {
        const seg = add(rib, mesh(G.rbox(0.13, 0.035, 0.1, 0.017), cols[(i + k) % 3]), -0.33 + k * 0.13, Math.sin(k * 1.7 + i) * 0.012, Math.sin(k * 1.4 + i * 2) * 0.025);
        seg.rotation.y = Math.sin(k * 1.4 + i * 2) * 0.35;
      }
    }
    add(g, mesh(G.rbox(0.06, 0.16, 0.28, 0.03), '#e8c36a'), 0, 0.08, 0);
  } else if (type === 'rice') {
    add(g, mesh(G.rbox(0.32, 0.26, 0.26, 0.09), '#fbf6e8'), 0, 0.13, 0);
    add(g, mesh(G.rbox(0.33, 0.07, 0.27, 0.03), '#ff6b5a'), 0, 0.12, 0);
    add(g, mesh(G.cyl(0.07, 0.11, 0.07, 8), '#efe4c6'), 0, 0.28, 0);
    for (const [x, z] of [[-0.05, 0.02], [0.04, -0.03], [0.02, 0.05], [-0.02, -0.05]]) add(g, mesh(G.sphere(0.028, 6, 5), '#ffffff', false), x, 0.31, z).scale.set(1, 0.7, 1.5);
  } else if (type === 'iced') {
    // fish on crushed ice in a white foam tray
    add(g, mesh(G.rbox(0.5, 0.09, 0.32, 0.03), '#ffffff'), 0, 0.045, 0);
    add(g, mesh(G.rbox(0.44, 0.04, 0.26, 0.02), '#bfe8ff'), 0, 0.09, 0);
    for (const [x, z, s] of [[-0.18, 0.08, 0.06], [0.17, -0.08, 0.05], [0.19, 0.08, 0.055], [-0.15, -0.09, 0.05]]) add(g, mesh(G.rbox(s, s, s, 0.012), '#e3f6ff'), x, 0.12, z).rotation.y = x * 4;
    fishShape(g, 0.85, '#ff8f96', '#fff0ec', 0.16);
  } else if (type === 'can') {
    add(g, mesh(G.cyl(0.13, 0.13, 0.18, 16), '#c9d1da'), 0, 0.09, 0);
    add(g, mesh(G.cyl(0.133, 0.133, 0.11, 16), '#ff6b5a'), 0, 0.09, 0);
    add(g, mesh(G.cyl(0.134, 0.134, 0.03, 16), '#ffffff'), 0, 0.09, 0);
    add(g, mesh(G.cyl(0.115, 0.115, 0.02, 16), '#e4e9ee', false), 0, 0.185, 0);
    const tab = add(g, mesh(new THREE.TorusGeometry(0.04, 0.012, 5, 10), '#aab4bf', false), 0.05, 0.198, 0); tab.rotation.x = Math.PI / 2;
  } else if (type === 'dried') {
    fishShape(g, 1.05, '#d79a4f', '#efc27e', 0.05, 0.45);
    for (const x of [-0.06, 0.03, 0.12]) add(g, mesh(G.rbox(0.025, 0.02, 0.17, 0.008), '#a8672c', false), x, 0.085, 0.005);
  } else if (type === 'grilled') {
    add(g, mesh(G.cyl(0.25, 0.21, 0.05, 20), '#ffffff'), 0, 0.025, 0);
    add(g, mesh(G.cyl(0.2, 0.2, 0.01, 20), '#eef4f8', false), 0, 0.052, 0);
    const f = fishShape(g, 0.95, '#c9773a', '#e9a560', 0.1);
    for (const x of [-0.08, 0.02, 0.12]) add(f, mesh(G.rbox(0.025, 0.02, 0.2, 0.008), '#7a3e1c', false), x, 0.05, 0.01).rotation.y = 0.5;
    add(g, mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10, 1, false, 0, Math.PI), '#ffe14d'), 0.16, 0.07, -0.13);
  } else if (type === 'sushi') {
    add(g, mesh(G.rbox(0.48, 0.06, 0.26, 0.03), '#d9935a'), 0, 0.05, 0);
    for (const x of [-0.07, 0.07]) add(g, mesh(G.rbox(0.05, 0.04, 0.26, 0.015), '#b8733f'), x * 3, 0.01, 0);
    for (const [x, fishCol] of [[-0.1, '#ff8a5c'], [0.11, '#ff5a6a']]) {
      add(g, mesh(G.rbox(0.17, 0.08, 0.11, 0.04), '#fffdf6'), x, 0.12, 0);
      add(g, mesh(G.rbox(0.19, 0.04, 0.13, 0.02), fishCol), x, 0.175, 0);
      for (const dx of [-0.04, 0.02, 0.07]) add(g, mesh(G.rbox(0.012, 0.01, 0.12, 0.004), '#ffd9c8', false), x + dx, 0.198, 0).rotation.y = 0.45;
    }
    add(g, mesh(G.rbox(0.05, 0.085, 0.115, 0.01), '#2c4a3a'), 0.11, 0.125, 0);
  } else if (type === 'plate') {
    add(g, mesh(G.cyl(0.24, 0.2, 0.05, 18), '#ffffff'), 0, 0.025, 0);
    for (const [x, z, s] of [[-0.06, 0.04, 0.06], [0.07, -0.03, 0.045], [0.02, 0.08, 0.035]]) add(g, mesh(G.sphere(s, 7, 5), '#c9a27a', false), x, 0.05, z).scale.set(1, 0.25, 1);
    for (const z of [-0.02, 0.03]) add(g, mesh(G.rbox(0.4, 0.02, 0.02, 0.008), '#d9935a', false), 0.05, 0.07, z).rotation.y = 0.15;
  } else if (type === 'money') {
    add(g, mesh(G.rbox(0.42, 0.06, 0.24, 0.02), C.money), 0, 0.03, 0);
    add(g, mesh(G.rbox(0.1, 0.065, 0.245, 0.01), '#d8f7c8'), 0, 0.03, 0);
  }
  g.traverse((o) => { if (o.isMesh && !o.userData.outline && o.material.isMeshLambertMaterial) o.castShadow = true; });
  bakeStatic(g);
  return g;
}

// ---------- crops ----------
export function seaweedPlant() {
  const g = new THREE.Group(); g.scale.setScalar(1.35);
  add(g, mesh(G.sphere(0.12, 8, 6), '#9aa7a8'), 0, 0.02, 0).scale.set(1.3, 0.5, 1);
  const fruit = add(g, new THREE.Group());
  const cols = ['#2f9a5a', '#3fb06a', '#258a4c'];
  for (let i = 0; i < 4; i++) {
    const a = i * 1.57 + 0.4, r = add(fruit, mesh(G.capsule(0.055, 0.42, 6), cols[i % 3]), Math.cos(a) * 0.08, 0.3, Math.sin(a) * 0.08);
    r.scale.set(1.5, 1, 0.55); r.rotation.set(Math.sin(a) * 0.35, a, Math.cos(a) * 0.35);
  }
  for (let i = 0; i < 3; i++) add(fruit, mesh(G.sphere(0.06, 6, 5), '#5cc27a'), Math.cos(i * 2.1) * 0.15, 0.55 + i * 0.03, Math.sin(i * 2.1) * 0.15).scale.set(1, 0.6, 1);
  return { g, fruit };
}
export function ricePlant() {
  const g = new THREE.Group(); g.scale.setScalar(1.45);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26, r = i ? 0.09 : 0;
    const b = add(g, mesh(G.rbox(0.04, 0.6, 0.02, 0.01), i % 2 ? '#7cc35a' : '#68b04c'), Math.cos(a) * r, 0.3, Math.sin(a) * r);
    b.rotation.set(Math.sin(a) * 0.25, a, Math.cos(a) * 0.25);
  }
  const fruit = add(g, new THREE.Group());
  for (let i = 0; i < 4; i++) {
    const a = i * 1.57 + 0.3, h = add(fruit, mesh(G.capsule(0.04, 0.16, 6), '#f2cf5a'), Math.cos(a) * 0.13, 0.58, Math.sin(a) * 0.13);
    h.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
  }
  return { g, fruit };
}
// shallow tidal pool for seaweed
export function pool(w, d) {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(w, 0.16, d, 0.12), '#d8c9a6', false, true), 0, 0.08, 0);
  add(g, mesh(G.rbox(w - 0.3, 0.04, d - 0.3, 0.1), '#7fdcdc', false, true), 0, 0.15, 0);
  for (const [x, z, s] of [[-w / 2, -d / 2, 0.3], [w / 2, d / 2 - 0.3, 0.26], [w / 2 - 0.2, -d / 2, 0.22]]) {
    const r = add(g, mesh(new THREE.DodecahedronGeometry(s, 0), '#b9c2c6'), x, s * 0.4, z); r.scale.set(1, 0.6, 0.9);
  }
  return g;
}
// flooded rice paddy
export function paddy(w, d) {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(w, 0.2, d, 0.08), '#b98a55', false, true), 0, 0.1, 0);
  add(g, mesh(G.rbox(w - 0.24, 0.04, d - 0.24, 0.04), '#9fd6c9', false, true), 0, 0.19, 0);
  return g;
}

// ---------- fishing ----------
export function pier(len, wid = 2.2) {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(len, 0.16, wid, 0.05), '#d9a066', false, true), len / 2, 0.08, 0);
  for (let x = 0.5; x < len - 0.2; x += 0.62) add(g, mesh(G.rbox(0.04, 0.02, wid - 0.06, 0.01), '#b97f48', false, true), x, 0.165, 0);
  for (let x = 0.3; x < len; x += 2.4) for (const s of [-1, 1]) {
    add(g, mesh(G.cyl(0.13, 0.13, 0.9, 8), '#9a6236'), x, -0.1, s * (wid / 2 + 0.02));
    add(g, mesh(G.cyl(0.14, 0.14, 0.06, 8), '#7a4a26'), x, 0.36, s * (wid / 2 + 0.02));
  }
  for (const s of [-1, 1]) add(g, mesh(G.cyl(0.1, 0.12, 0.3, 8), '#5b5f6a'), len - 0.4, 0.3, s * (wid / 2 - 0.2));
  return g;
}
export function crate() {
  const g = new THREE.Group();
  g.add(blob(1));
  add(g, mesh(G.rbox(1.35, 0.34, 1.0, 0.06), C.wood), 0, 0.17, 0);
  add(g, mesh(G.rbox(1.2, 0.04, 0.85, 0.02), '#cfeeff'), 0, 0.33, 0);
  for (const x of [-0.45, 0, 0.45]) add(g, mesh(G.rbox(0.05, 0.3, 1.01, 0.02), C.woodDark), x, 0.17, 0);
  return g;
}
// small fishing boat pointing +x; flag shows during the fishing contest
export function boat(col) {
  const g = new THREE.Group();
  const b = add(g, new THREE.Group());
  add(b, mesh(G.rbox(2.6, 0.55, 1.15, 0.24), col), 0, 0.12, 0);
  add(b, mesh(G.sphere(0.58, 12, 8), col), 1.15, 0.12, 0).scale.set(0.9, 0.48, 0.99);
  add(b, mesh(G.rbox(2.62, 0.12, 1.17, 0.05), '#ffffff'), 0, 0.26, 0);
  add(b, mesh(G.rbox(2.3, 0.06, 0.9, 0.03), '#f2dcb4', false, true), 0.05, 0.4, 0);
  add(b, mesh(G.rbox(0.85, 0.62, 0.78, 0.1), '#fbfaf5'), -0.55, 0.72, 0);
  add(b, mesh(G.rbox(0.98, 0.1, 0.9, 0.04), '#5aa9ff'), -0.55, 1.07, 0);
  add(b, mesh(G.rbox(0.05, 0.24, 0.58, 0.03), '#9fdcff'), -0.12, 0.78, 0);
  add(b, mesh(G.cyl(0.035, 0.035, 1.3, 6), '#8b5a3c'), 0.55, 0.95, 0);
  add(b, mesh(new THREE.TorusGeometry(0.14, 0.05, 6, 12), '#ff6b5a'), -0.55, 0.72, 0.41);
  const catchBox = add(b, new THREE.Group(), 0.65, 0.42, 0); catchBox.userData.dyn = true;
  add(catchBox, mesh(G.rbox(0.62, 0.2, 0.55, 0.04), C.woodLight), 0, 0.1, 0);
  for (const [x, z, r] of [[-0.12, -0.08, 0.3], [0.12, 0.09, -0.4], [0.02, 0.0, 1.2]]) { const f = add(catchBox, new THREE.Group(), x, 0.17, z); f.rotation.y = r; f.scale.setScalar(0.7); fishShape(f, 1, '#ff7f86', '#ffe6e2', 0.11); }
  bakeStatic(catchBox);
  const flag = add(b, new THREE.Group(), 0.55, 1.48, 0); flag.userData.dyn = true;
  add(flag, mesh(G.rbox(0.42, 0.26, 0.03, 0.02), '#ffd34a'), -0.22, 0, 0);
  add(flag, mesh(G.rbox(0.22, 0.13, 0.035, 0.02), '#ff5a4e'), -0.22, 0, 0);
  bakeStatic(b);
  return { g, b, catchBox, flag };
}
// big cruise ship, long axis along z (bow toward -z)
export function cruiseShip() {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(3.4, 1.3, 12, 0.5), '#fbfaf5'), 0, 0.35, 0);
  add(g, mesh(G.sphere(1.7, 14, 8), '#fbfaf5'), 0, 0.35, -5.6).scale.set(1, 0.4, 1.3);
  add(g, mesh(G.rbox(3.45, 0.3, 12.05, 0.12), '#4f8fe8'), 0, -0.05, 0);
  add(g, mesh(G.rbox(3.0, 0.8, 8.4, 0.3), '#ffffff'), 0, 1.35, 0.6);
  add(g, mesh(G.rbox(3.04, 0.16, 8.0, 0.06), '#7fc8ff'), 0, 1.4, 0.6);
  add(g, mesh(G.rbox(2.5, 0.7, 5.6, 0.28), '#ffffff'), 0, 2.05, 1.0);
  add(g, mesh(G.rbox(2.54, 0.14, 5.2, 0.06), '#7fc8ff'), 0, 2.1, 1.0);
  add(g, mesh(G.rbox(1.8, 0.5, 2.0, 0.2), '#ffffff'), 0, 2.6, -0.6);
  add(g, mesh(G.rbox(1.5, 0.16, 0.05, 0.04), '#5aa9ff'), 0, 2.65, -1.62);
  add(g, mesh(G.cyl(0.5, 0.6, 1.1, 14), '#ff6b5a'), 0, 3.0, 2.4);
  add(g, mesh(G.cyl(0.52, 0.52, 0.22, 14), '#ffffff'), 0, 3.15, 2.4);
  for (const s of [-1, 1]) for (const z of [-2, 0.5, 3]) add(g, mesh(G.capsule(0.22, 0.7, 6), '#ff9f43'), s * 1.62, 1.0, z).rotation.x = Math.PI / 2;
  add(g, mesh(G.rbox(1.6, 0.06, 2.2, 0.05), '#5fd3e6', false, true), 0, 1.78, 3.4);
  return g;
}

// ---------- kitchen / processing machines ----------
function tray(g, x, z, col) {
  const t = add(g, new THREE.Group(), x, 0, z);
  add(t, mesh(G.rbox(1.0, 0.24, 0.8, 0.06), C.woodLight), 0, 0.12, 0);
  add(t, mesh(G.rbox(0.86, 0.04, 0.66, 0.02), col), 0, 0.24, 0);
  return t;
}
// input tray on the left, output tray on the right (sushi bar: second input tray further left)
export function machine(kind) {
  const g = new THREE.Group();
  g.add(blob(1.8));
  let spin;
  if (kind === 'ice') {
    add(g, mesh(G.rbox(1.5, 1.1, 1.1, 0.16), '#9fdcff'), 0, 0.55, -0.2);
    add(g, mesh(G.rbox(1.56, 0.12, 1.16, 0.05), C.white), 0, 1.1, -0.2);
    add(g, mesh(G.rbox(0.9, 0.55, 0.06, 0.06), '#e6f7ff'), 0, 0.6, 0.36);
    for (let i = 0; i < 3; i++) add(g, mesh(G.rbox(0.5, 0.06, 0.03, 0.02), '#5aa9ff'), 0, 0.6, 0.4).rotation.z = i * Math.PI / 3;
    for (const [x, z] of [[-0.45, -0.45], [0.45, -0.3], [-0.2, 0.05]]) add(g, mesh(G.rbox(0.24, 0.24, 0.24, 0.05), '#e3f6ff'), x, 1.28, z - 0.2).rotation.y = x * 3;
    spin = add(g, new THREE.Group(), 0.3, 1.25, -0.2);
    add(spin, mesh(G.cyl(0.08, 0.08, 0.1, 8), C.grey), 0, 0, 0);
    for (let i = 0; i < 3; i++) add(spin, mesh(G.rbox(0.5, 0.03, 0.14, 0.02), C.white), 0, 0.05, 0).rotation.y = i * 2.09;
  } else if (kind === 'can') {
    add(g, mesh(G.rbox(1.6, 0.95, 1.1, 0.14), '#9fb8cc'), 0, 0.48, -0.2);
    add(g, mesh(G.rbox(1.66, 0.1, 1.16, 0.05), '#6f8ea2'), 0, 0.98, -0.2);
    add(g, mesh(G.cyl(0.18, 0.2, 0.9, 10), '#ff8a6b'), -0.45, 1.4, -0.45);
    add(g, mesh(G.cyl(0.21, 0.21, 0.1, 10), '#e0694d'), -0.45, 1.85, -0.45);
    add(g, mesh(G.rbox(1.4, 0.08, 0.32, 0.03), '#5b6474'), 0.05, 1.07, 0.15);
    for (const x of [-0.35, 0.05, 0.45]) { const c = itemMesh('can'); c.scale.setScalar(0.8); c.position.set(x, 1.1, 0.15); c.userData.dyn = true; g.add(c); }
    spin = add(g, new THREE.Group(), 0.35, 1.35, -0.45);
    add(spin, mesh(G.cyl(0.3, 0.3, 0.12, 10), '#ffd34a'), 0, 0, 0).rotation.x = Math.PI / 2;
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; add(spin, mesh(G.rbox(0.12, 0.12, 0.12, 0.02), '#ffd34a'), Math.cos(a) * 0.33, Math.sin(a) * 0.33, 0).rotation.z = a; }
    spin.userData.axis = 'z';
  } else if (kind === 'dry') {
    add(g, mesh(G.rbox(1.7, 0.2, 1.0, 0.06), C.woodLight), 0, 0.1, -0.2);
    for (const x of [-0.75, 0.75]) add(g, mesh(G.rbox(0.12, 1.6, 0.12, 0.04), C.woodDark), x, 0.9, -0.2);
    add(g, mesh(G.rbox(1.7, 0.1, 0.12, 0.04), C.woodDark), 0, 1.65, -0.2);
    add(g, mesh(G.rbox(1.5, 0.03, 0.03, 0.01), '#fbfaf5'), 0, 1.25, -0.2);
    spin = add(g, new THREE.Group(), 0, 1.6, -0.2);
    for (const x of [-0.5, -0.17, 0.17, 0.5]) {
      add(spin, mesh(G.rbox(0.015, 0.25, 0.015, 0.005), '#fbfaf5', false), x, -0.12, 0);
      const f = itemMesh('dried'); f.rotation.set(0, 0, Math.PI / 2); f.position.set(x, -0.5, -0.05); spin.add(f);
    }
    spin.userData.axis = 'sway';
  } else if (kind === 'grill') {
    add(g, mesh(G.rbox(1.5, 0.72, 1.0, 0.12), '#e07a5a'), 0, 0.36, -0.2);
    for (const y of [0.2, 0.45]) add(g, mesh(G.rbox(1.52, 0.04, 1.02, 0.01), '#c9603f', false), 0, y, -0.2);
    add(g, mesh(G.rbox(1.3, 0.06, 0.8, 0.03), '#ffb347', false, true), 0, 0.74, -0.2);
    for (let i = 0; i < 6; i++) add(g, mesh(G.rbox(0.035, 0.04, 0.82, 0.01), '#4a4f5a'), -0.55 + i * 0.22, 0.79, -0.2);
    add(g, mesh(G.cyl(0.12, 0.14, 0.7, 8), '#8f969f'), 0.55, 1.05, -0.6);
    spin = add(g, new THREE.Group(), -0.1, 0.84, -0.2);
    const f = itemMesh('grilled'); spin.add(f); f.position.y = -0.03;
    spin.userData.axis = 'flip';
  } else {
    // sushi bar: wooden counter, noren curtain, rice tub and a turning sushi plate
    add(g, mesh(G.rbox(1.8, 0.9, 1.0, 0.1), '#f2c99a'), 0, 0.45, -0.2);
    add(g, mesh(G.rbox(1.9, 0.1, 1.1, 0.04), '#8b5a3c'), 0, 0.92, -0.2);
    for (const x of [-0.85, 0.85]) add(g, mesh(G.rbox(0.1, 1.8, 0.1, 0.03), C.woodDark), x, 0.9, -0.72);
    add(g, mesh(G.rbox(1.8, 0.1, 0.12, 0.03), C.woodDark), 0, 1.8, -0.72);
    for (const x of [-0.6, -0.2, 0.2, 0.6]) add(g, mesh(G.rbox(0.36, 0.5, 0.04, 0.03), '#5a7fd0'), x, 1.5, -0.7);
    add(g, mesh(G.cyl(0.26, 0.22, 0.24, 14), '#d9935a'), -0.5, 1.09, -0.25);
    add(g, mesh(G.cyl(0.22, 0.22, 0.04, 14), '#fffdf6', false), -0.5, 1.21, -0.25);
    spin = add(g, new THREE.Group(), 0.35, 0.99, -0.15);
    add(spin, mesh(G.cyl(0.32, 0.32, 0.04, 16), '#ffffff'), 0, 0, 0);
    const s = itemMesh('sushi'); s.scale.setScalar(0.9); s.position.y = 0.02; spin.add(s);
  }
  spin.userData.dyn = true;
  const inTray = tray(g, -1.45, 0.65, '#f6dd8a');
  const outTray = tray(g, 1.45, 0.65, '#cfe9ff');
  const in2Tray = kind === 'sushi' ? tray(g, -2.65, 0.65, '#fff1c4') : null;
  return { g, inTray, in2Tray, outTray, spin };
}

// ---------- restaurant ----------
export function diningTable() {
  const g = new THREE.Group();
  g.add(blob(1.2));
  add(g, mesh(G.cyl(0.18, 0.28, 0.06, 12), '#8f969f'), 0, 0.03, 0);
  add(g, mesh(G.cyl(0.06, 0.06, 0.72, 8), '#8f969f'), 0, 0.4, 0);
  add(g, mesh(G.cyl(0.64, 0.64, 0.08, 22), '#fff3dd'), 0, 0.78, 0);
  add(g, mesh(G.cyl(0.645, 0.645, 0.03, 22), '#5aa9ff'), 0, 0.745, 0);
  const seats = [];
  for (const s of [-1, 1]) {
    const ch = add(g, new THREE.Group(), 0, 0, s * 0.95);
    add(ch, mesh(G.rbox(0.5, 0.09, 0.46, 0.04), '#ff9f43'), 0, 0.42, 0);
    add(ch, mesh(G.rbox(0.5, 0.5, 0.08, 0.04), '#ff9f43'), 0, 0.68, s * 0.22);
    for (const [x, z] of [[-0.19, -0.17], [0.19, -0.17], [-0.19, 0.17], [0.19, 0.17]]) add(ch, mesh(G.cyl(0.03, 0.03, 0.4, 6), C.woodDark), x, 0.2, z);
    seats.push({ x: 0, z: s * 0.95, face: s < 0 ? 0 : Math.PI, dish: new THREE.Vector3(0, 0.82, s * 0.3) });
  }
  return { g, seats };
}
export function sink() {
  const g = new THREE.Group();
  g.add(blob(1));
  add(g, mesh(G.rbox(1.1, 0.75, 0.9, 0.08), '#dfe7ee'), 0, 0.37, 0);
  add(g, mesh(G.rbox(1.0, 0.06, 0.8, 0.03), '#b9c6d2'), 0, 0.76, 0);
  add(g, mesh(G.rbox(0.8, 0.04, 0.6, 0.03), '#9fdcff', false, true), 0, 0.78, 0.02);
  add(g, mesh(G.cyl(0.04, 0.04, 0.5, 6), C.grey), 0, 1.0, -0.38);
  add(g, mesh(G.rbox(0.06, 0.06, 0.3, 0.02), C.grey), 0, 1.24, -0.25);
  return g;
}
// low white railing with a wooden handrail
export function railLine(x0, z0, x1, z1) {
  const g = new THREE.Group();
  const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 1.3)), rot = -Math.atan2(z1 - z0, x1 - x0);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    add(g, mesh(G.rbox(0.2, 0.75, 0.2, 0.06), '#fbfaf5'), x0 + (x1 - x0) * t, 0.37, z0 + (z1 - z0) * t);
  }
  const r = add(g, mesh(G.rbox(len + 0.1, 0.12, 0.16, 0.05), C.wood), (x0 + x1) / 2, 0.76, (z0 + z1) / 2); r.rotation.y = rot;
  const r2 = add(g, mesh(G.rbox(len, 0.08, 0.08, 0.03), '#fbfaf5'), (x0 + x1) / 2, 0.4, (z0 + z1) / 2); r2.rotation.y = rot;
  return g;
}
export function lantern(col = '#ff6b5a') {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.04, 0.05, 2.0, 6), C.woodDark), 0, 1.0, 0);
  const l = add(g, mesh(G.sphere(0.24, 10, 8), col), 0, 2.15, 0); l.scale.set(1, 1.2, 1);
  add(g, mesh(G.cyl(0.12, 0.12, 0.06, 8), '#3a2a22'), 0, 2.45, 0);
  return g;
}

// ---------- scenery ----------
export function palm(h = 3, lean = 0.4) {
  const g = new THREE.Group();
  g.add(blob(1.1));
  const n = 6;
  let x = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n; x = Math.pow(t, 1.6) * lean;
    add(g, mesh(G.cyl(0.15 - t * 0.04, 0.17 - t * 0.04, h / n + 0.04, 8), i % 2 ? '#c9935a' : '#b8803f'), x, (i + 0.5) * h / n, 0);
  }
  const top = add(g, new THREE.Group(), lean, h, 0);
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2;
    const f = add(top, new THREE.Group()); f.rotation.y = a;
    const leaf = add(f, mesh(G.sphere(0.5, 9, 6), i % 2 ? '#4fb35a' : '#5fc468'), 0.75, -0.15, 0);
    leaf.scale.set(1.7, 0.16, 0.5); leaf.rotation.z = -0.35;
  }
  for (let i = 0; i < 3; i++) add(top, mesh(G.sphere(0.13, 8, 6), '#8b5a3c'), Math.cos(i * 2.1) * 0.16, -0.12, Math.sin(i * 2.1) * 0.16);
  return g;
}
export function umbrella(colA, colB) {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.04, 0.04, 2.0, 6), '#fbfaf5'), 0, 1.0, 0);
  for (let i = 0; i < 8; i++) add(g, mesh(new THREE.ConeGeometry(1.25, 0.5, 2, 1, false, i * Math.PI / 4, Math.PI / 4), i % 2 ? colA : colB), 0, 2.1, 0);
  add(g, mesh(G.sphere(0.07, 6, 5), colA), 0, 2.38, 0);
  return g;
}
export function towel(col) {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(0.9, 0.04, 1.7, 0.03), '#ffffff', false, true), 0, 0.02, 0);
  for (const z of [-0.6, 0, 0.6]) add(g, mesh(G.rbox(0.91, 0.045, 0.24, 0.02), col, false, true), 0, 0.022, z);
  return g;
}
export function beachBall() {
  const g = new THREE.Group();
  const cols = ['#ff5a4e', '#ffffff', '#5aa9ff', '#ffd34a'];
  for (let i = 0; i < 4; i++) add(g, mesh(new THREE.SphereGeometry(0.25, 10, 8, i * Math.PI / 2, Math.PI / 2), cols[i]), 0, 0.25, 0);
  return g;
}
export function lighthouse() {
  const g = new THREE.Group();
  for (const [x, z, s] of [[0, 0, 1.6], [1.3, 0.8, 1.0], [-1.2, 0.9, 1.1], [0.6, -1.2, 0.9], [-0.9, -0.8, 0.8]]) {
    const r = add(g, mesh(new THREE.DodecahedronGeometry(s, 0), '#b9c2c6'), x, s * 0.25, z); r.scale.set(1, 0.55, 1); r.rotation.y = x;
  }
  add(g, mesh(G.cyl(0.85, 1.15, 5.2, 16), '#fbfaf5'), 0, 3.2, 0);
  for (const y of [1.6, 3.4]) add(g, mesh(G.cyl(1.04 - y * 0.04, 1.1 - y * 0.04, 0.7, 16), '#ff5a4e'), 0, y, 0);
  add(g, mesh(G.rbox(0.5, 0.8, 0.1, 0.06), '#8b5a3c'), 0, 1.2, 1.08);
  add(g, mesh(G.cyl(1.2, 1.2, 0.16, 16), '#4a4f5a'), 0, 5.85, 0);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; add(g, mesh(G.cyl(0.03, 0.03, 0.4, 5), '#4a4f5a'), Math.cos(a) * 1.12, 6.1, Math.sin(a) * 1.12); }
  const lamp = add(g, new THREE.Mesh(G.cyl(0.6, 0.6, 0.8, 14), new THREE.MeshLambertMaterial({ color: '#dfe7ee' })), 0, 6.35, 0); lamp.userData.dyn = true;
  add(g, mesh(G.sphere(0.72, 14, 8), '#ff5a4e'), 0, 6.75, 0).scale.set(1, 0.6, 1);
  add(g, mesh(G.sphere(0.1, 6, 5), '#4a4f5a'), 0, 7.2, 0);
  const beam = add(g, new THREE.Group(), 0, 6.35, 0); beam.userData.dyn = true; beam.visible = false;
  const bm = new THREE.MeshBasicMaterial({ color: '#fff3a6', transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide });
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.4, 9, 12, 1, true), bm); c.rotation.z = s * Math.PI / 2; c.position.x = s * 4.6; beam.add(c); }
  return { g, lamp, beam };
}
export function gull() {
  const g = new THREE.Group();
  add(g, mesh(G.sphere(0.2, 10, 8), '#ffffff', false), 0, 0, 0).scale.set(1, 0.8, 1.7);
  add(g, mesh(G.sphere(0.12, 8, 6), '#ffffff', false), 0, 0.08, 0.3);
  add(g, mesh(G.cone(0.04, 0.14, 5), '#ffb347', false), 0, 0.06, 0.45).rotation.x = Math.PI / 2;
  const wings = [];
  for (const s of [-1, 1]) {
    const p = add(g, new THREE.Group(), s * 0.12, 0.05, 0);
    add(p, mesh(G.rbox(0.6, 0.04, 0.26, 0.02), '#dfe5ea', false), s * 0.3, 0, 0);
    add(p, mesh(G.rbox(0.16, 0.045, 0.2, 0.02), '#4a4f5a', false), s * 0.58, 0, 0);
    wings.push(p);
  }
  return { g, wings };
}
export function buoy(col = '#ff5a4e') {
  const g = new THREE.Group();
  add(g, mesh(G.sphere(0.3, 10, 8), col), 0, 0.05, 0).scale.set(1, 0.8, 1);
  add(g, mesh(G.cyl(0.31, 0.31, 0.12, 10), '#ffffff'), 0, 0.1, 0);
  add(g, mesh(G.cyl(0.03, 0.03, 0.4, 5), C.grey), 0, 0.4, 0);
  return g;
}
export function barrel() {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.3, 0.28, 0.7, 12), C.wood), 0, 0.35, 0);
  for (const y of [0.15, 0.55]) add(g, mesh(G.cyl(0.31, 0.31, 0.05, 12), '#6a7382'), 0, y, 0);
  return g;
}
export function aquarium() {
  const g = new THREE.Group();
  g.add(blob(4));
  add(g, mesh(G.rbox(6.4, 2.4, 4.2, 0.3), '#bfe9ff'), 0, 1.2, 0);
  add(g, mesh(G.rbox(6.6, 0.22, 4.4, 0.1), '#fbfaf5'), 0, 2.45, 0);
  add(g, mesh(G.rbox(6.62, 0.14, 4.42, 0.06), '#5aa9ff'), 0, 2.3, 0);
  for (let i = 0; i < 7; i++) add(g, mesh(G.rbox(0.5, 0.18, 0.5, 0.08), i % 2 ? '#ffd34a' : '#ff8a6b'), -2.7 + i * 0.9, 2.62, 1.95);
  const dome = add(g, mesh(G.sphere(1.8, 18, 10), '#8fd8ff'), 0, 2.5, -0.3); dome.scale.set(1.25, 0.8, 0.85);
  for (const x of [-2.2, 2.2]) add(g, mesh(G.rbox(1.4, 1.2, 0.08, 0.08), '#5fc0f0'), x, 1.2, 2.1);
  add(g, mesh(G.rbox(1.2, 1.6, 0.1, 0.08), '#4a7fb8'), 0, 0.8, 2.12);
  for (const [x, y, c] of [[-2.4, 1.3, '#ffb347'], [-1.9, 1.0, '#ff7eb6'], [2.0, 1.35, '#ffd34a'], [2.5, 0.95, '#ff8a5c']]) add(g, mesh(G.sphere(0.13, 8, 6), c, false), x, y, 2.16).scale.set(1.5, 1, 0.4);
  const big = itemMesh('fish'); big.scale.setScalar(5); big.position.set(0.2, 3.7, -0.2); big.rotation.set(-0.5, 0.2, 0.2); big.userData.dyn = true; g.add(big);
  return g;
}

// fishing net hung between two posts
export function netRack() {
  const g = new THREE.Group();
  g.add(blob(1.4));
  for (const x of [-1.2, 1.2]) add(g, mesh(G.cyl(0.08, 0.1, 1.6, 8), C.woodDark), x, 0.8, 0);
  add(g, mesh(G.rbox(2.5, 0.08, 0.08, 0.03), C.woodDark), 0, 1.55, 0);
  for (let i = 0; i < 9; i++) add(g, mesh(G.rbox(0.025, 1.1, 0.025, 0.01), '#7a8f6a', false), -1.0 + i * 0.25, 0.98, 0);
  for (let j = 0; j < 5; j++) add(g, mesh(G.rbox(2.2, 0.025, 0.025, 0.01), '#7a8f6a', false), 0, 0.5 + j * 0.24, 0);
  for (const x of [-0.6, 0.3]) add(g, mesh(G.sphere(0.12, 8, 6), '#ffb347'), x, 0.62, 0.05);
  return g;
}
export function crateStack() {
  const g = new THREE.Group();
  g.add(blob(1.1));
  for (const [x, y, z, r] of [[-0.35, 0.25, 0, 0.1], [0.38, 0.25, 0.05, -0.15], [0, 0.75, 0, 0.3]]) {
    const c = add(g, new THREE.Group(), x, y, z); c.rotation.y = r;
    add(c, mesh(G.rbox(0.68, 0.5, 0.6, 0.05), C.woodLight), 0, 0, 0);
    for (const s of [-1, 1]) add(c, mesh(G.rbox(0.7, 0.07, 0.62, 0.02), C.wood), 0, s * 0.15, 0);
  }
  return g;
}
export function lifeRingStand() {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(0.14, 1.5, 0.14, 0.04), '#fbfaf5'), 0, 0.75, 0);
  const r = add(g, mesh(new THREE.TorusGeometry(0.3, 0.09, 8, 16), '#ff5a4e'), 0, 1.15, 0.12);
  for (let i = 0; i < 4; i++) add(g, mesh(G.rbox(0.1, 0.19, 0.2, 0.03), '#ffffff'), Math.cos(i * Math.PI / 2 + 0.78) * 0.3, 1.15 + Math.sin(i * Math.PI / 2 + 0.78) * 0.3, 0.12).rotation.z = i * Math.PI / 2 + 0.78;
  r.rotation.y = 0;
  return g;
}
