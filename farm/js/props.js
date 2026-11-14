// Props for the farm game, all built from the shared style kit.
import * as THREE from 'three';
import { C, G, mesh, add, blob } from './kit.js';

export const ITEMS = {
  hay: { name: '禾草', icon: '🌾', h: 0.3, price: 0 },
  wood: { name: '木頭', icon: '🪵', h: 0.27, price: 0 },
  egg: { name: '雞蛋', icon: '🥚', h: 0.27, price: 4 },
  tomato: { name: '番茄', icon: '🍅', h: 0.29, price: 5 },
  corn: { name: '玉米', icon: '🌽', h: 0.26, price: 7 },
  milk: { name: '牛奶', icon: '🥛', h: 0.36, price: 10 },
  money: { name: '錢', icon: '💵', h: 0.07, price: 0 },
};

export function itemMesh(type) {
  const g = new THREE.Group();
  if (type === 'hay') {
    add(g, mesh(G.rbox(0.5, 0.28, 0.36, 0.07), '#f4d466'), 0, 0.14, 0);
    for (const x of [-0.12, 0.12]) add(g, mesh(G.rbox(0.06, 0.29, 0.37, 0.02), '#d6a64a'), x, 0.14, 0);
  } else if (type === 'wood') {
    const log = add(g, mesh(G.cyl(0.12, 0.12, 0.54, 10), C.wood), 0, 0.12, 0); log.rotation.z = Math.PI / 2;
    for (const x of [-0.275, 0.275]) { const c = add(g, mesh(G.cyl(0.1, 0.1, 0.02, 10), C.woodLight), x, 0.12, 0); c.rotation.z = Math.PI / 2; }
  } else if (type === 'egg') {
    add(g, mesh(G.sphere(0.12, 12, 10), '#fff6e8'), 0, 0.14, 0).scale.set(1, 1.22, 1);
  } else if (type === 'tomato') {
    add(g, mesh(G.sphere(0.145, 12, 10), C.red), 0, 0.14, 0).scale.set(1, 0.88, 1);
    add(g, mesh(G.cone(0.08, 0.06, 5), C.leaf), 0, 0.27, 0);
  } else if (type === 'corn') {
    const cob = add(g, mesh(G.capsule(0.09, 0.22, 8), C.yellow), 0, 0.12, 0); cob.rotation.z = Math.PI / 2;
    for (const s of [-1, 1]) { const l = add(g, mesh(G.rbox(0.3, 0.03, 0.1, 0.012), C.green), -0.08, 0.1, s * 0.07); l.rotation.y = s * 0.3; }
  } else if (type === 'milk') {
    add(g, mesh(G.cyl(0.11, 0.12, 0.26, 12), C.white), 0, 0.13, 0);
    add(g, mesh(G.cyl(0.115, 0.125, 0.09, 12), '#bfe3ff'), 0, 0.13, 0);
    add(g, mesh(G.cyl(0.06, 0.06, 0.08, 10), C.blue), 0, 0.3, 0);
  } else if (type === 'money') {
    add(g, mesh(G.rbox(0.42, 0.06, 0.24, 0.02), C.money), 0, 0.03, 0);
    add(g, mesh(G.rbox(0.1, 0.065, 0.245, 0.01), '#d8f7c8'), 0, 0.03, 0);
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

export function tree() {
  const g = new THREE.Group();
  g.add(blob(1.2));
  const trunk = add(g, mesh(G.cyl(0.2, 0.28, 1.2, 8), C.woodDark), 0, 0.6, 0);
  const crown = add(g, new THREE.Group(), 0, 1.55, 0);
  add(crown, mesh(G.sphere(0.85, 9, 7), '#5fbf55'), 0, 0.2, 0);
  add(crown, mesh(G.sphere(0.62, 9, 7), '#6fcd5f'), 0.5, 0.45, 0.25);
  add(crown, mesh(G.sphere(0.58, 9, 7), '#58b14f'), -0.45, 0.5, -0.2);
  add(crown, mesh(G.sphere(0.5, 9, 7), '#7ad86a'), 0.05, 0.85, 0.1);
  const stump = add(g, mesh(G.cyl(0.26, 0.3, 0.3, 8), C.woodDark), 0, 0.15, 0);
  add(stump, mesh(G.cyl(0.22, 0.22, 0.02, 8), C.woodLight), 0, 0.16, 0);
  stump.visible = false;
  return { g, trunk, crown, stump };
}

export function tuft() {
  const g = new THREE.Group();
  const tall = add(g, new THREE.Group());
  const cols = ['#d8dc62', '#e9d35b', '#c6d457'];
  for (let i = 0; i < 4; i++) {
    const a = i * 1.6 + 0.3, r = i ? 0.13 : 0;
    const c = add(tall, mesh(G.cone(0.13, 0.55 + (i % 2) * 0.12, 5), cols[i % 3]), Math.cos(a) * r, 0.28, Math.sin(a) * r);
    c.rotation.z = Math.cos(a) * 0.25; c.rotation.x = Math.sin(a) * 0.25;
  }
  for (const [x, z] of [[0.05, 0], [-0.08, 0.06], [0.06, -0.08]]) add(tall, mesh(G.sphere(0.055, 6, 5), '#f6c94e'), x, 0.6 + x, z);
  const stub = add(g, mesh(G.cyl(0.18, 0.2, 0.06, 7), '#93c748'), 0, 0.03, 0);
  return { g, tall, stub };
}

function pen(w, d) {
  const g = new THREE.Group();
  const post = (x, z) => add(g, mesh(G.rbox(0.12, 0.55, 0.12, 0.03), C.woodLight), x, 0.27, z);
  const rail = (x, z, len, rot) => {
    for (const y of [0.22, 0.42]) { const r = add(g, mesh(G.rbox(len, 0.07, 0.06, 0.02), C.woodLight), x, y, z); r.rotation.y = rot; }
  };
  for (const [x, z] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) post(x, z);
  rail(0, d / 2, w, 0); rail(-w / 2, 0, d, Math.PI / 2); rail(w / 2, 0, d, Math.PI / 2);
  return g;
}

export function chicken() {
  const g = new THREE.Group();
  g.add(blob(0.3));
  const b = add(g, new THREE.Group());
  add(b, mesh(G.sphere(0.2, 10, 8), C.white), 0, 0.24, 0).scale.set(1, 0.9, 1.15);
  add(b, mesh(G.sphere(0.12, 10, 8), C.white), 0, 0.42, 0.12);
  add(b, mesh(G.cone(0.04, 0.09, 5), C.orange), 0, 0.41, 0.25).rotation.x = Math.PI / 2;
  add(b, mesh(G.rbox(0.05, 0.08, 0.1, 0.02), C.red), 0, 0.55, 0.12);
  add(b, mesh(G.rbox(0.14, 0.14, 0.06, 0.03), C.white), 0, 0.32, -0.21).rotation.x = -0.5;
  return { g, b };
}

export function coop() {
  const g = new THREE.Group();
  g.add(blob(2.2));
  add(g, mesh(G.rbox(2.2, 1.3, 1.6, 0.12), C.cream), 0, 0.65, -0.6);
  add(g, mesh(G.rbox(2.3, 0.14, 1.7, 0.05), C.wallTrim), 0, 1.25, -0.6);
  add(g, mesh(G.prism(2.5, 0.75, 1.95), C.roof), 0, 1.3, -0.6);
  add(g, mesh(G.rbox(0.55, 0.75, 0.08, 0.05), C.woodDark), -0.4, 0.38, 0.22);
  add(g, mesh(G.cyl(0.18, 0.18, 0.06, 14), C.woodDark), 0.55, 0.85, 0.21).rotation.x = Math.PI / 2;
  // feed trough (left) and egg nest box (right)
  const trough = add(g, new THREE.Group(), -1.75, 0, 0.7);
  add(trough, mesh(G.rbox(1.2, 0.32, 0.6, 0.06), C.wood), 0, 0.16, 0);
  add(trough, mesh(G.rbox(1.05, 0.05, 0.46, 0.02), C.woodDark), 0, 0.3, 0);
  const nest = add(g, new THREE.Group(), 1.6, 0, 0.75);
  add(nest, mesh(G.rbox(1.0, 0.22, 0.8, 0.06), C.woodLight), 0, 0.11, 0);
  add(nest, mesh(G.rbox(0.86, 0.04, 0.66, 0.02), '#f6dd8a'), 0, 0.22, 0);
  const yard = add(g, pen(2.4, 1.4), 0, 0, 0.6);
  return { g, trough, nest, yard };
}

export function cow() {
  const g = new THREE.Group();
  g.add(blob(0.8));
  const b = add(g, new THREE.Group());
  add(b, mesh(G.rbox(0.62, 0.55, 1.05, 0.2), C.white), 0, 0.65, 0);
  add(b, mesh(G.sphere(0.18, 8, 6), '#3b3b44'), 0.2, 0.8, 0.15).scale.set(1, 0.7, 1.3);
  add(b, mesh(G.sphere(0.14, 8, 6), '#3b3b44'), -0.22, 0.7, -0.25).scale.set(1, 0.8, 1.2);
  add(b, mesh(G.rbox(0.42, 0.42, 0.42, 0.14), C.white), 0, 0.85, 0.62);
  add(b, mesh(G.rbox(0.36, 0.2, 0.14, 0.07), '#ffb3c1'), 0, 0.72, 0.84);
  for (const s of [-1, 1]) {
    add(b, mesh(G.cone(0.05, 0.14, 6), C.cream), s * 0.15, 1.12, 0.6);
    for (const z of [-0.35, 0.35]) add(b, mesh(G.capsule(0.08, 0.22, 6), C.white), s * 0.2, 0.25, z);
  }
  return { g, b };
}

export function barn() {
  const g = new THREE.Group();
  g.add(blob(2.8));
  add(g, mesh(G.rbox(2.8, 1.8, 2.0, 0.14), '#ff7a66'), 0, 0.9, -0.9);
  add(g, mesh(G.prism(3.1, 1.0, 2.35), C.white), 0, 1.78, -0.9);
  add(g, mesh(G.rbox(1.0, 1.25, 0.08, 0.05), C.white), 0, 0.62, 0.12);
  for (const s of [-1, 1]) add(g, mesh(G.rbox(0.06, 1.2, 0.09, 0.02), '#ff7a66'), s * 0.25, 0.62, 0.15).rotation.z = s * 0.7;
  const trough = add(g, new THREE.Group(), -2.05, 0, 0.6);
  add(trough, mesh(G.rbox(1.1, 0.32, 0.6, 0.06), C.wood), 0, 0.16, 0);
  add(trough, mesh(G.rbox(0.95, 0.05, 0.46, 0.02), C.woodDark), 0, 0.3, 0);
  const nest = add(g, new THREE.Group(), 2.05, 0, 0.65);
  add(nest, mesh(G.rbox(1.0, 0.22, 0.8, 0.06), C.woodLight), 0, 0.11, 0);
  add(nest, mesh(G.rbox(0.86, 0.04, 0.66, 0.02), '#cfe9ff'), 0, 0.22, 0);
  add(g, pen(3.0, 1.8), 0, 0, 0.9);
  return { g, trough, nest };
}

export function plot(w, d) {
  const g = new THREE.Group();
  g.add(blob(Math.max(w, d) * 0.62));
  add(g, mesh(G.rbox(w, 0.2, d, 0.08), '#c98a55'), 0, 0.1, 0);
  add(g, mesh(G.rbox(w - 0.2, 0.04, d - 0.2, 0.03), '#a86d3e'), 0, 0.2, 0);
  return g;
}
export function tomatoPlant() {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.035, 0.05, 0.7, 6), '#4c9a3e'), 0, 0.55, 0);
  for (let i = 0; i < 4; i++) { const l = add(g, mesh(G.sphere(0.17, 7, 5), i % 2 ? '#5bb84c' : '#4ea843'), Math.cos(i * 1.7) * 0.15, 0.55 + i * 0.12, Math.sin(i * 1.7) * 0.15); l.scale.set(1, 0.6, 1); }
  const fruit = add(g, new THREE.Group(), 0, 0, 0);
  for (const [x, y, z] of [[0.17, 0.58, 0.12], [-0.15, 0.7, 0.1], [0.05, 0.86, -0.15]]) add(fruit, mesh(G.sphere(0.11, 10, 8), C.red), x, y, z);
  return { g, fruit };
}
export function cornPlant() {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.04, 0.06, 1.3, 6), '#5cb04a'), 0, 0.85, 0);
  for (let i = 0; i < 4; i++) { const l = add(g, mesh(G.rbox(0.5, 0.03, 0.12, 0.012), i % 2 ? '#66bf52' : '#4fa443'), 0, 0.6 + i * 0.2, 0); l.rotation.y = i * 1.4; l.rotation.z = 0.35; }
  const fruit = add(g, new THREE.Group());
  add(fruit, mesh(G.capsule(0.07, 0.2, 8), C.yellow), 0.12, 0.95, 0).rotation.z = 0.35;
  add(fruit, mesh(G.capsule(0.07, 0.18, 8), C.yellow), -0.1, 1.15, 0.05).rotation.z = -0.4;
  return { g, fruit };
}

export function shelf() {
  const g = new THREE.Group();
  g.add(blob(1.3));
  add(g, mesh(G.rbox(1.7, 0.55, 0.95, 0.08), C.wood), 0, 0.28, 0);
  add(g, mesh(G.rbox(1.55, 0.05, 0.8, 0.02), C.woodDark), 0, 0.56, 0);
  add(g, mesh(G.rbox(1.7, 0.75, 0.12, 0.05), C.woodLight), 0, 0.85, -0.46);
  const sign = add(g, mesh(G.rbox(0.62, 0.36, 0.06, 0.05), C.white), 0, 1.22, -0.45);
  const slots = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) slots.push(new THREE.Vector3(-0.56 + c * 0.37, 0.58, -0.2 + r * 0.38));
  return { g, slots, sign };
}

export function counter() {
  const g = new THREE.Group();
  g.add(blob(1.8));
  add(g, mesh(G.rbox(2.8, 0.95, 1.0, 0.1), '#72d8bf'), 0, 0.48, 0);
  add(g, mesh(G.rbox(2.95, 0.1, 1.12, 0.05), C.white), 0, 1.0, 0);
  const reg = add(g, new THREE.Group(), -0.7, 1.05, 0);
  add(reg, mesh(G.rbox(0.55, 0.3, 0.45, 0.06), '#5b6474'), 0, 0.15, 0);
  add(reg, mesh(G.rbox(0.5, 0.32, 0.06, 0.04), '#3d4452'), 0, 0.42, -0.12).rotation.x = -0.35;
  add(reg, mesh(G.rbox(0.42, 0.24, 0.02, 0.02), '#9fe4ff'), 0, 0.43, -0.085).rotation.x = -0.35;
  return g;
}

export function truck() {
  const g = new THREE.Group();
  g.add(blob(2.4));
  add(g, mesh(G.rbox(1.7, 0.5, 3.6, 0.12), '#4f8fe8'), 0, 0.6, 0);
  add(g, mesh(G.rbox(1.6, 0.9, 1.1, 0.2), '#5aa0ff'), 0, 1.25, 1.1);
  add(g, mesh(G.rbox(1.45, 0.42, 0.06, 0.06), '#bfe9ff'), 0, 1.4, 1.66);
  const bed = add(g, new THREE.Group(), 0, 0.86, -0.6);
  add(bed, mesh(G.rbox(1.55, 0.06, 2.0, 0.03), C.woodLight), 0, 0, 0);
  for (const s of [-1, 1]) for (const z of [-1.1, 1.05]) {
    const w = add(g, mesh(G.cyl(0.3, 0.3, 0.24, 14), '#3c3f48'), s * 0.82, 0.3, z); w.rotation.z = Math.PI / 2;
    const h = add(g, mesh(G.cyl(0.13, 0.13, 0.25, 10), C.grey), s * 0.82, 0.3, z); h.rotation.z = Math.PI / 2;
  }
  return { g, bed };
}

export function dog() {
  const g = new THREE.Group();
  g.add(blob(0.45));
  const b = add(g, new THREE.Group());
  add(b, mesh(G.capsule(0.17, 0.35, 8), '#e8b37a'), 0, 0.32, 0).rotation.x = Math.PI / 2;
  add(b, mesh(G.sphere(0.2, 12, 10), '#e8b37a'), 0, 0.55, 0.32);
  add(b, mesh(G.sphere(0.08, 8, 6), '#fff0dc'), 0, 0.5, 0.5);
  add(b, mesh(G.sphere(0.035, 6, 5), '#3b2b24'), 0, 0.54, 0.57);
  for (const s of [-1, 1]) {
    add(b, mesh(G.rbox(0.09, 0.2, 0.06, 0.03), '#a8703f'), s * 0.15, 0.62, 0.28).rotation.z = s * 0.4;
    for (const z of [-0.18, 0.18]) add(b, mesh(G.capsule(0.05, 0.12, 6), '#e8b37a'), s * 0.1, 0.12, z);
  }
  const tail = add(b, mesh(G.capsule(0.04, 0.16, 6), '#e8b37a'), 0, 0.45, -0.32); tail.rotation.x = -0.7;
  return { g, b, tail };
}

export function cat() {
  const g = new THREE.Group();
  g.add(blob(0.4));
  const b = add(g, new THREE.Group());
  add(b, mesh(G.sphere(0.2, 12, 10), '#ffad5c'), 0, 0.22, 0).scale.set(1, 0.95, 1.2);
  add(b, mesh(G.sphere(0.17, 12, 10), '#ffad5c'), 0, 0.45, 0.14);
  for (const s of [-1, 1]) add(b, mesh(G.cone(0.06, 0.12, 4), '#ffad5c'), s * 0.09, 0.62, 0.14);
  add(b, mesh(G.rbox(0.18, 0.05, 0.1, 0.02), C.white), 0, 0.4, 0.29);
  const tail = add(b, mesh(G.capsule(0.04, 0.3, 6), '#e88f3e'), 0, 0.35, -0.25); tail.rotation.x = -0.4;
  return { g, b, tail };
}

export function bush(r = 0.5) {
  const g = new THREE.Group();
  g.add(blob(r * 1.4));
  add(g, mesh(G.sphere(r, 9, 7), '#6cc75a'), 0, r * 0.75, 0);
  add(g, mesh(G.sphere(r * 0.7, 9, 7), '#7fd66a'), r * 0.6, r * 0.6, r * 0.2);
  add(g, mesh(G.sphere(r * 0.65, 9, 7), '#5cb64f'), -r * 0.55, r * 0.55, -r * 0.1);
  return g;
}
export function flower(col) {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.02, 0.02, 0.25, 5), '#5aa84a', false), 0, 0.12, 0);
  add(g, mesh(G.sphere(0.08, 7, 5), col, false), 0, 0.27, 0);
  add(g, mesh(G.sphere(0.035, 6, 4), C.yellow, false), 0, 0.3, 0.05);
  return g;
}
export function rock(s = 0.4) {
  const g = new THREE.Group();
  const m = add(g, mesh(new THREE.DodecahedronGeometry(s, 0), '#c3c9cf'), 0, s * 0.5, 0);
  m.scale.set(1, 0.65, 0.9);
  return g;
}
export function fenceLine(x0, z0, x1, z1) {
  const g = new THREE.Group();
  const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 1.6)), rot = -Math.atan2(z1 - z0, x1 - x0);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    add(g, mesh(G.rbox(0.14, 0.7, 0.14, 0.04), C.woodLight), x0 + (x1 - x0) * t, 0.35, z0 + (z1 - z0) * t);
  }
  for (const y of [0.3, 0.55]) { const r = add(g, mesh(G.rbox(len, 0.08, 0.07, 0.03), C.wood), (x0 + x1) / 2, y, (z0 + z1) / 2); r.rotation.y = rot; }
  return g;
}
export function lamp() {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.06, 0.08, 2.2, 8), '#6a7382'), 0, 1.1, 0);
  add(g, mesh(G.sphere(0.2, 10, 8), '#fff2b8'), 0, 2.3, 0);
  return g;
}
