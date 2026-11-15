// Harbour round 2: fish species, seafood dishes, trawler / deep-sea boats, traps, aquaculture pens,
// angler rods and the extra kitchen machines. Built from the shared style kit like everything else.
import * as THREE from 'three';
import { C, G, mesh, add, blob, bakeStatic, itemEdge } from './kit.js';
import { fishShape, itemMesh as itemMesh3 } from './props3.js';

// h = stack height, ss = scale on shelves / in crates (big fish shrink a little to fit)
export const ITEMS4 = {
  sardine: { name: '沙丁魚', icon: '🐟', h: 0.14, price: 3 },
  mackerel: { name: '鯖魚', icon: '🐟', h: 0.22, price: 8 },
  puffer: { name: '河豚', icon: '🐡', h: 0.3, price: 45 },
  salmon: { name: '鮭魚', icon: '🐟', h: 0.26, price: 14 },
  tuna: { name: '鮪魚', icon: '🐟', h: 0.34, price: 45, ss: 0.72 },
  swordfish: { name: '旗魚', icon: '🐟', h: 0.3, price: 80, ss: 0.62 },
  golden: { name: '黃金魚', icon: '✨', h: 0.24, price: 300 },
  shrimp: { name: '蝦', icon: '🦐', h: 0.16, price: 5 },
  crab: { name: '螃蟹', icon: '🦀', h: 0.2, price: 16 },
  squid: { name: '魷魚', icon: '🦑', h: 0.16, price: 10 },
  octopus: { name: '章魚', icon: '🐙', h: 0.24, price: 20 },
  lobster: { name: '龍蝦', icon: '🦞', h: 0.2, price: 60, ss: 0.85 },
  crabcan: { name: '蟹肉罐頭', icon: '🥫', h: 0.21, price: 38 },
  sashimi: { name: '鮭魚生魚片', icon: '🍣', h: 0.12, price: 40 },
  otoro: { name: '鮪魚壽司', icon: '🍣', h: 0.22, price: 75 },
  tempura: { name: '炸蝦', icon: '🍤', h: 0.16, price: 24 },
  squidgrill: { name: '烤魷魚', icon: '🦑', h: 0.14, price: 26 },
  lobstermeal: { name: '龍蝦餐', icon: '🦞', h: 0.2, price: 140 },
};

const cache = new Map();
export const itemMesh = (type) => itemEdge(itemMeshRaw(type));
function itemMeshRaw(type) {
  if (!ITEMS4[type]) return itemMesh3(type);
  let t = cache.get(type);
  if (!t) { t = build(type); cache.set(type, t); }
  return t.clone();
}

function shrimpShape(g, s, col, y0) {
  const r = add(g, new THREE.Group(), 0, y0, 0); r.scale.setScalar(s);
  for (let i = 0; i < 6; i++) {
    const a = -0.4 + i * 0.5, rad = 0.12 - i * 0.012;
    add(r, mesh(G.sphere(rad * 0.62, 10, 8), i % 2 ? col : '#ffb08a'), Math.cos(a) * 0.15, 0, Math.sin(a) * 0.15).scale.set(1, 0.7, 1.1);
  }
  const tail = add(r, mesh(G.cone(0.06, 0.1, 4), col), Math.cos(2.7) * 0.16, 0, Math.sin(2.7) * 0.16 + 0.02); tail.rotation.set(0, 0, Math.PI / 2); tail.scale.set(0.3, 1, 1);
  for (const dz of [-0.03, 0.03]) { const an = add(r, mesh(G.rbox(0.32, 0.012, 0.012, 0.005), '#c9532e', false), 0.2, 0.02, -0.12 + dz); an.rotation.y = 0.5; }
  add(r, mesh(G.sphere(0.018, 6, 5), '#2d2a33', false), 0.17, 0.05, -0.05);
  return r;
}
function lobsterShape(g, s, y0) {
  const r = add(g, new THREE.Group(), 0, y0, 0); r.scale.setScalar(s);
  const body = '#d2442f', light = '#ef6a4a';
  add(r, mesh(G.sphere(0.11, 12, 8), body), 0.06, 0, 0).scale.set(1.5, 0.8, 1);
  for (let i = 0; i < 4; i++) add(r, mesh(G.rbox(0.09, 0.08, 0.15 - i * 0.015, 0.03), i % 2 ? body : light), -0.12 - i * 0.08, -0.01, 0);
  const fan = add(r, mesh(G.cone(0.09, 0.12, 5), body), -0.47, -0.01, 0); fan.rotation.set(0, 0, -Math.PI / 2); fan.scale.set(0.3, 1, 1);
  for (const sz of [-1, 1]) {
    const arm = add(r, mesh(G.capsule(0.03, 0.14, 6), body), 0.26, 0, sz * 0.09); arm.rotation.set(0, sz * 0.5, Math.PI / 2);
    add(r, mesh(G.sphere(0.07, 10, 8), light), 0.4, 0, sz * 0.16).scale.set(1.5, 0.7, 0.9);
    const an = add(r, mesh(G.rbox(0.4, 0.012, 0.012, 0.005), '#a8321f', false), 0.38, 0.03, sz * 0.05); an.rotation.y = -sz * 0.25;
    for (let k = 0; k < 3; k++) { const l = add(r, mesh(G.capsule(0.012, 0.1, 4), body, false), 0.02 - k * 0.06, -0.02, sz * 0.12); l.rotation.x = sz * 1.2; }
  }
  for (const sz of [-1, 1]) add(r, mesh(G.sphere(0.018, 6, 5), '#2d2a33', false), 0.2, 0.06, sz * 0.03);
  return r;
}
function squidShape(g, s, body, spot, y0) {
  const r = add(g, new THREE.Group(), 0, y0, 0); r.scale.setScalar(s);
  const m = add(r, mesh(G.cone(0.1, 0.34, 10), body), 0.12, 0, 0); m.rotation.z = -Math.PI / 2; m.scale.set(1, 1, 0.75);
  const fin = add(r, mesh(G.cone(0.1, 0.12, 4), body), 0.24, 0, 0); fin.rotation.set(Math.PI / 2, 0, 0); fin.scale.set(1.2, 1, 0.15);
  add(r, mesh(G.sphere(0.075, 10, 8), body), -0.06, 0, 0).scale.set(0.9, 0.75, 0.85);
  for (const [x, z] of [[0.1, 0.03], [0.16, -0.03], [0.03, -0.04]]) add(r, mesh(G.sphere(0.018, 6, 5), spot, false), x, 0.07, z);
  for (let i = 0; i < 6; i++) { const t = add(r, mesh(G.capsule(0.017, 0.2, 4), body), -0.22, -0.01, (i - 2.5) * 0.028); t.rotation.set(0, (i - 2.5) * 0.12, Math.PI / 2); }
  for (const sz of [-1, 1]) add(r, mesh(G.sphere(0.02, 6, 5), '#2d2a33', false), -0.07, 0.05, sz * 0.045);
  return r;
}
function canShape(g, label, dot) {
  add(g, mesh(G.cyl(0.13, 0.13, 0.18, 16), '#c9d1da'), 0, 0.09, 0);
  add(g, mesh(G.cyl(0.133, 0.133, 0.11, 16), label), 0, 0.09, 0);
  add(g, mesh(G.cyl(0.115, 0.115, 0.02, 16), '#e4e9ee', false), 0, 0.185, 0);
  add(g, mesh(G.sphere(0.055, 10, 8), dot), 0, 0.19, 0).scale.set(1.3, 0.35, 1);
}

function build(type) {
  const g = new THREE.Group();
  if (type === 'sardine') {
    for (const z of [-0.085, 0, 0.085]) { const f = add(g, new THREE.Group(), (z * 3) % 0.1, 0, z); fishShape(f, 0.6, '#8fb3d6', '#f4f9ff', 0.06, 0.8); }
  } else if (type === 'mackerel') {
    const f = fishShape(g, 1.05, '#3f9a9a', '#eef6ff', 0.11);
    for (const x of [-0.12, -0.04, 0.04, 0.12]) { const st = add(f, mesh(G.rbox(0.025, 0.02, 0.12, 0.008), '#1f5a5a', false), x, 0.075, 0.03); st.rotation.y = 0.6; }
  } else if (type === 'puffer') {
    add(g, mesh(G.sphere(0.16, 14, 10), '#e8c25a'), 0, 0.15, 0).scale.set(1.05, 0.9, 1);
    add(g, mesh(G.sphere(0.13, 12, 8), '#fff6dc'), 0.02, 0.1, -0.05).scale.set(1, 0.6, 0.9);
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; const sp = add(g, mesh(G.cone(0.025, 0.07, 4), '#b8902f'), Math.cos(a) * 0.16, 0.2, Math.sin(a) * 0.15); sp.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2); }
    const tail = add(g, mesh(G.cone(0.07, 0.1, 4), '#d9a83a'), -0.2, 0.15, 0); tail.rotation.set(0, 0, -Math.PI / 2); tail.scale.set(0.3, 1, 1);
    for (const z of [-0.06, 0.06]) { add(g, mesh(G.sphere(0.035, 8, 6), '#ffffff', false), 0.11, 0.25, z); add(g, mesh(G.sphere(0.02, 6, 5), '#2d2a33', false), 0.125, 0.27, z); }
  } else if (type === 'salmon') {
    const f = fishShape(g, 1.25, '#ff9a6a', '#ffe2cf', 0.13);
    for (const [x, z] of [[-0.1, 0.04], [0.0, -0.02], [0.08, 0.05], [-0.04, 0.07], [0.12, -0.01]]) add(f, mesh(G.sphere(0.014, 5, 4), '#7a4a3a', false), x, 0.077, z);
  } else if (type === 'tuna') {
    const f = fishShape(g, 1.7, '#2f5f9f', '#dfe9f2', 0.17);
    for (let i = 0; i < 4; i++) add(f, mesh(G.cone(0.02, 0.05, 4), '#ffd34a'), -0.2 + i * 0.05, 0, 0.1).rotation.x = Math.PI / 2;
    add(f, mesh(G.rbox(0.3, 0.012, 0.02, 0.006), '#ffd34a', false), 0, 0.08, -0.02);
  } else if (type === 'swordfish') {
    const f = fishShape(g, 1.45, '#4a78c8', '#e6f0fa', 0.15);
    const sw = add(f, mesh(G.cone(0.03, 0.42, 6), '#2f4f8f'), 0.42, 0, 0); sw.rotation.z = -Math.PI / 2;
    const sail = add(f, mesh(G.sphere(0.14, 12, 8, ), '#2f5aa8'), -0.02, 0, 0.13); sail.scale.set(1.6, 0.18, 0.9);
  } else if (type === 'golden') {
    const f = fishShape(g, 1.1, '#ffcf3a', '#fff3b0', 0.12);
    add(f, mesh(G.cone(0.06, 0.12, 4), '#ffb000'), 0.0, 0, 0.12).rotation.x = Math.PI / 2;
    for (const [x, y, z] of [[0.18, 0.2, 0.12], [-0.15, 0.22, -0.1]]) { const sp = add(g, mesh(G.rbox(0.06, 0.06, 0.06, 0.01), '#fffbe0', false), x, y, z); sp.rotation.set(0.6, 0.6, 0.6); }
  } else if (type === 'shrimp') {
    shrimpShape(g, 1, '#ff8a5c', 0.08);
  } else if (type === 'crab') {
    add(g, mesh(G.sphere(0.16, 14, 10), '#ff5a3c'), 0, 0.1, 0).scale.set(1.25, 0.55, 1);
    for (const sz of [-1, 1]) {
      const arm = add(g, mesh(G.capsule(0.03, 0.12, 6), '#e8452a'), 0.18, 0.08, sz * 0.12); arm.rotation.set(0, sz * 0.7, Math.PI / 2);
      add(g, mesh(G.sphere(0.06, 10, 8), '#ff6a4a'), 0.28, 0.09, sz * 0.2).scale.set(1.4, 0.7, 1);
      for (let k = 0; k < 3; k++) { const l = add(g, mesh(G.capsule(0.018, 0.13, 4), '#e8452a'), -0.06 + k * 0.08, 0.05, sz * 0.2); l.rotation.set(sz * 1.25, 0, 0); }
      const st = add(g, mesh(G.cyl(0.012, 0.012, 0.06, 4), '#e8452a', false), 0.15, 0.17, sz * 0.05);
      add(g, mesh(G.sphere(0.025, 6, 5), '#2d2a33', false), 0.15, 0.2, sz * 0.05); st.rotation.z = -0.3;
    }
  } else if (type === 'squid') {
    squidShape(g, 1, '#fbe0dc', '#e87a8a', 0.08);
  } else if (type === 'octopus') {
    add(g, mesh(G.sphere(0.13, 14, 10), '#c95a7a'), 0, 0.17, 0).scale.set(1, 1.1, 1);
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2, l = add(g, new THREE.Group(), 0, 0.05, 0); l.rotation.y = a;
      add(l, mesh(G.capsule(0.03, 0.16, 5), '#c95a7a'), 0.17, 0, 0).rotation.z = Math.PI / 2;
      add(l, mesh(G.sphere(0.035, 6, 5), '#d9778f'), 0.28, 0.01, 0.02);
    }
    for (const z of [-0.05, 0.05]) { add(g, mesh(G.sphere(0.035, 8, 6), '#ffffff', false), 0.11, 0.2, z); add(g, mesh(G.sphere(0.018, 6, 5), '#2d2a33', false), 0.135, 0.205, z); }
  } else if (type === 'lobster') {
    lobsterShape(g, 1, 0.08);
  } else if (type === 'crabcan') {
    canShape(g, '#4f9cf0', '#ff5a3c');
  } else if (type === 'sashimi') {
    add(g, mesh(G.rbox(0.5, 0.05, 0.32, 0.03), '#3a4a5a'), 0, 0.025, 0);
    for (let i = 0; i < 4; i++) {
      const sl = add(g, mesh(G.rbox(0.09, 0.04, 0.2, 0.02), '#ff9a6a'), -0.12 + i * 0.075, 0.075, -0.01); sl.rotation.set(0, 0.35, 0.25);
      add(sl, mesh(G.rbox(0.012, 0.042, 0.19, 0.004), '#ffe2cf', false), 0, 0.002, 0);
    }
    add(g, mesh(G.sphere(0.06, 8, 6), '#59c25b'), 0.17, 0.06, 0.08).scale.set(1.4, 0.25, 0.8);
    add(g, mesh(G.sphere(0.035, 8, 6), '#9bd65a'), 0.18, 0.07, -0.08);
  } else if (type === 'otoro') {
    add(g, mesh(G.rbox(0.5, 0.06, 0.28, 0.03), '#2d2a33'), 0, 0.03, 0);
    add(g, mesh(G.rbox(0.52, 0.02, 0.3, 0.01), '#e8b84a', false, true), 0, 0.005, 0);
    for (const x of [-0.11, 0.11]) {
      add(g, mesh(G.rbox(0.17, 0.08, 0.11, 0.04), '#fffdf6'), x, 0.1, 0);
      add(g, mesh(G.rbox(0.2, 0.045, 0.13, 0.02), '#ff6f7f'), x, 0.16, 0);
      for (const dx of [-0.05, 0, 0.05]) add(g, mesh(G.rbox(0.012, 0.01, 0.12, 0.004), '#ffd0d6', false), x + dx, 0.184, 0).rotation.y = 0.45;
    }
    add(g, mesh(G.rbox(0.05, 0.012, 0.05, 0.005), '#ffd34a', false), 0.12, 0.19, 0.02).rotation.y = 0.7;
  } else if (type === 'tempura') {
    add(g, mesh(G.cyl(0.25, 0.21, 0.05, 20), '#ffffff'), 0, 0.025, 0);
    for (const z of [-0.08, 0, 0.08]) {
      const t = add(g, mesh(G.capsule(0.045, 0.24, 6), '#f2b84a'), 0, 0.09, z); t.rotation.set(0, 0.25, Math.PI / 2);
      add(g, mesh(G.cone(0.035, 0.07, 4), '#ff6a3c'), 0.2, 0.09, z + 0.05).rotation.z = -Math.PI / 2;
    }
    add(g, mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10, 1, false, 0, Math.PI), '#ffe14d'), -0.15, 0.07, 0.13);
  } else if (type === 'squidgrill') {
    add(g, mesh(G.rbox(0.48, 0.04, 0.24, 0.02), '#f6e3c0'), 0, 0.02, 0);
    const st = add(g, mesh(G.cyl(0.012, 0.012, 0.6, 5), '#d9a066'), 0, 0.08, 0); st.rotation.z = Math.PI / 2;
    const sq = squidShape(g, 0.9, '#c97a3a', '#7a3e1c', 0.09);
    for (const x of [0.04, 0.12, 0.2]) add(sq, mesh(G.rbox(0.015, 0.012, 0.13, 0.004), '#6b3416', false), x, 0.06, 0);
  } else if (type === 'lobstermeal') {
    add(g, mesh(G.cyl(0.32, 0.27, 0.05, 22), '#ffffff'), 0, 0.025, 0);
    add(g, mesh(G.cyl(0.323, 0.323, 0.02, 22), '#5aa9ff'), 0, 0.045, 0);
    lobsterShape(g, 0.9, 0.1);
    for (const [x, z] of [[-0.18, 0.18], [0.2, -0.17]]) add(g, mesh(G.sphere(0.05, 8, 6), '#59c25b'), x, 0.07, z).scale.set(1.3, 0.4, 1);
    add(g, mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10, 1, false, 0, Math.PI), '#ffe14d'), 0.05, 0.07, 0.2);
  }
  g.traverse((o) => { if (o.isMesh && !o.userData.outline && o.material.isMeshLambertMaterial) o.castShadow = true; });
  bakeStatic(g);
  return g;
}

// ---------- boats ----------
// trawler: wheelhouse at the bow, A-frame and a net bag at the stern (bag shows when full)
export function trawler(col) {
  const g = new THREE.Group(), b = add(g, new THREE.Group());
  add(b, mesh(G.rbox(3.2, 0.6, 1.3, 0.26), col), 0, 0.12, 0);
  add(b, mesh(G.sphere(0.64, 12, 8), col), 1.45, 0.12, 0).scale.set(0.85, 0.5, 1);
  add(b, mesh(G.rbox(3.22, 0.12, 1.32, 0.05), '#ffffff'), 0, 0.3, 0);
  add(b, mesh(G.rbox(2.9, 0.06, 1.05, 0.03), '#e6d2ae', false, true), 0, 0.43, 0);
  add(b, mesh(G.rbox(0.9, 0.75, 0.9, 0.1), '#fbfaf5'), 0.75, 0.82, 0);
  add(b, mesh(G.rbox(1.0, 0.1, 1.0, 0.04), '#ff8a6b'), 0.75, 1.24, 0);
  add(b, mesh(G.rbox(0.06, 0.26, 0.66, 0.03), '#9fdcff'), 1.2, 0.9, 0);
  for (const sz of [-1, 1]) add(b, mesh(G.rbox(0.1, 1.3, 0.1, 0.03), '#ffd34a'), -1.25, 1.05, sz * 0.5);
  add(b, mesh(G.rbox(0.12, 0.1, 1.15, 0.03), '#ffd34a'), -1.25, 1.7, 0);
  add(b, mesh(G.rbox(0.04, 0.9, 0.04, 0.01), '#4a4f5a', false), -1.25, 1.2, 0);
  const catchBox = add(b, new THREE.Group(), -0.6, 0.45, 0); catchBox.userData.dyn = true;
  add(catchBox, mesh(G.sphere(0.45, 12, 8), '#4f8f5f'), 0, 0.22, 0).scale.set(1.3, 0.55, 1);
  for (let i = 0; i < 6; i++) add(catchBox, mesh(G.rbox(0.62, 0.02, 0.02, 0.01), '#2f5f3f', false), 0, 0.42, -0.3 + i * 0.12);
  for (const [x, z] of [[-0.2, 0.15], [0.15, -0.12], [0.25, 0.2]]) { const f = add(catchBox, new THREE.Group(), x, 0.36, z); f.rotation.y = x * 5; fishShape(f, 0.55, '#8fb3d6', '#f4f9ff', 0.05); }
  bakeStatic(catchBox);
  const flag = add(b, new THREE.Group(), -1.25, 2.0, 0); flag.userData.dyn = true;
  add(flag, mesh(G.rbox(0.42, 0.26, 0.03, 0.02), '#ffd34a'), -0.22, 0, 0);
  add(flag, mesh(G.rbox(0.22, 0.13, 0.035, 0.02), '#ff5a4e'), -0.22, 0, 0);
  bakeStatic(b);
  return { g, b, catchBox, flag };
}
// deep-sea boat: bigger hull, two-deck cabin, radar mast, a tuna on deck when it returns
export function deepBoat(col) {
  const g = new THREE.Group(), b = add(g, new THREE.Group());
  add(b, mesh(G.rbox(3.8, 0.72, 1.5, 0.3), col), 0, 0.14, 0);
  add(b, mesh(G.sphere(0.75, 12, 8), col), 1.7, 0.14, 0).scale.set(0.9, 0.52, 1);
  add(b, mesh(G.rbox(3.82, 0.14, 1.52, 0.05), '#ffffff'), 0, 0.36, 0);
  add(b, mesh(G.rbox(3.5, 0.06, 1.25, 0.03), '#d9e2ea', false, true), 0, 0.52, 0);
  add(b, mesh(G.rbox(1.4, 0.7, 1.1, 0.12), '#fbfaf5'), -0.2, 0.9, 0);
  add(b, mesh(G.rbox(1.0, 0.5, 0.9, 0.1), '#fbfaf5'), -0.3, 1.45, 0);
  add(b, mesh(G.rbox(1.1, 0.1, 1.0, 0.04), '#3f6fb5'), -0.3, 1.74, 0);
  add(b, mesh(G.rbox(0.06, 0.24, 0.72, 0.03), '#9fdcff'), 0.21, 1.5, 0);
  add(b, mesh(G.cyl(0.04, 0.04, 0.9, 6), '#4a4f5a'), -0.5, 2.2, 0);
  add(b, mesh(G.rbox(0.5, 0.06, 0.12, 0.03), '#ffffff'), -0.5, 2.6, 0);
  add(b, mesh(G.cyl(0.05, 0.05, 1.2, 6), '#ffb347'), 1.1, 1.0, 0.3).rotation.z = -0.6;
  const catchBox = add(b, new THREE.Group(), 1.1, 0.55, -0.15); catchBox.userData.dyn = true;
  const tf = add(catchBox, new THREE.Group(), 0, 0, 0); tf.rotation.y = 0.3; fishShape(tf, 1.5, '#2f5f9f', '#dfe9f2', 0.14);
  bakeStatic(catchBox);
  const flag = add(b, new THREE.Group(), -0.5, 2.85, 0); flag.userData.dyn = true;
  add(flag, mesh(G.rbox(0.42, 0.26, 0.03, 0.02), '#ffd34a'), -0.22, 0, 0);
  add(flag, mesh(G.rbox(0.22, 0.13, 0.035, 0.02), '#ff5a4e'), -0.22, 0, 0);
  bakeStatic(b);
  return { g, b, catchBox, flag };
}
// little rowing boat for the trap hauler (the rower is added by the game)
export function rowboat() {
  const g = new THREE.Group(), b = add(g, new THREE.Group());
  add(b, mesh(G.rbox(1.7, 0.4, 0.85, 0.18), '#d9935a'), 0, 0.08, 0);
  add(b, mesh(G.sphere(0.42, 10, 8), '#d9935a'), 0.75, 0.08, 0).scale.set(0.8, 0.45, 1);
  add(b, mesh(G.rbox(1.72, 0.08, 0.87, 0.03), '#fbfaf5'), 0, 0.24, 0);
  add(b, mesh(G.rbox(1.5, 0.04, 0.65, 0.02), '#b8733f', false, true), 0, 0.27, 0);
  add(b, mesh(G.rbox(0.18, 0.06, 0.85, 0.02), '#b8733f'), -0.2, 0.33, 0);
  for (const sz of [-1, 1]) { const o = add(b, mesh(G.rbox(0.9, 0.04, 0.08, 0.02), '#8b5a3c'), -0.1, 0.32, sz * 0.62); o.rotation.y = sz * 0.3; }
  const hold = add(b, new THREE.Group(), 0.45, 0.3, 0); hold.userData.dyn = true;
  bakeStatic(b);
  return { g, b, hold };
}

// ---------- traps ----------
// floating buoy with a cage under the water; cage.position.y goes up when the trap is hauled
export function trap(kind) {
  const g = new THREE.Group();
  const col = kind === 'lobster' ? '#ff5a4e' : '#ffd34a';
  add(g, mesh(G.sphere(0.22, 10, 8), col), 0, 0.04, 0).scale.set(1, 0.75, 1);
  add(g, mesh(G.cyl(0.225, 0.225, 0.07, 10), '#ffffff'), 0, 0.08, 0);
  add(g, mesh(G.cyl(0.025, 0.025, 0.35, 5), C.grey), 0, 0.3, 0);
  add(g, mesh(G.rbox(0.18, 0.12, 0.02, 0.01), col), 0.09, 0.42, 0);
  const cage = add(g, new THREE.Group(), 0.6, -0.9, 0); cage.userData.dyn = true;
  const w = kind === 'lobster' ? 0.9 : 0.7, h = 0.5;
  add(cage, mesh(G.rbox(w, 0.05, w * 0.8, 0.02), '#5b6474'), 0, 0, 0);
  add(cage, mesh(G.rbox(w, 0.05, w * 0.8, 0.02), '#5b6474'), 0, h, 0);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(cage, mesh(G.rbox(0.04, h, 0.04, 0.01), '#5b6474'), x * w / 2, h / 2, z * w * 0.4);
  for (let i = -2; i <= 2; i++) { add(cage, mesh(G.rbox(0.02, h, 0.02, 0.005), col, false), i * w / 5, h / 2, w * 0.4); add(cage, mesh(G.rbox(0.02, h, 0.02, 0.005), col, false), i * w / 5, h / 2, -w * 0.4); }
  const inside = add(cage, new THREE.Group(), 0, 0.1, 0); inside.userData.dyn = true;
  bakeStatic(cage);
  return { g, cage, inside };
}

// ---------- aquaculture ----------
export function pen() {
  const g = new THREE.Group();
  add(g, mesh(G.circle(1.12, 28), '#2f9fb8', false, true), 0, 0.012, 0);
  const ring = add(g, mesh(new THREE.TorusGeometry(1.2, 0.12, 8, 28), '#5b6474'), 0, 0.06, 0); ring.rotation.x = Math.PI / 2;
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(g, mesh(G.sphere(0.14, 8, 6), i % 2 ? '#ff9f43' : '#ffffff'), Math.cos(a) * 1.2, 0.1, Math.sin(a) * 1.2).scale.set(1, 0.8, 1); }
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.4; add(g, mesh(G.cyl(0.04, 0.04, 0.6, 5), '#8f969f'), Math.cos(a) * 1.2, 0.35, Math.sin(a) * 1.2); }
  const jump = add(g, new THREE.Group(), 0, 0, 0); jump.userData.dyn = true;
  return { g, jump };
}

// ---------- angler rod: rod pivot at the hands, line and bobber out on the water ----------
export function rod() {
  const g = new THREE.Group();
  const pole = add(g, new THREE.Group(), 0, 0, 0); pole.userData.dyn = true;
  const p = add(pole, mesh(G.cyl(0.02, 0.03, 1.8, 5), '#8b5a3c'), 0, 0.9, 0);
  p.castShadow = false;
  add(pole, mesh(G.cyl(0.05, 0.05, 0.08, 8), '#4a4f5a'), 0, 0.2, 0.04).rotation.x = Math.PI / 2;
  const bob = add(g, new THREE.Group(), 0, 0, 0); bob.userData.dyn = true;
  add(bob, mesh(G.sphere(0.07, 8, 6), '#ff5a4e', false), 0, 0.05, 0);
  add(bob, mesh(G.sphere(0.072, 8, 6), '#ffffff', false), 0, 0.09, 0).scale.set(1, 0.4, 1);
  return { g, pole, bob };
}

// decorative fish tank for the restaurant's new wing
export function fishTank() {
  const g = new THREE.Group();
  g.add(blob(1.4));
  add(g, mesh(G.rbox(2.4, 0.5, 0.9, 0.06), C.woodDark), 0, 0.25, 0);
  add(g, mesh(G.rbox(2.3, 0.8, 0.8, 0.05), '#8fdcf0'), 0, 0.9, 0);
  add(g, mesh(G.rbox(2.36, 0.08, 0.86, 0.03), '#5b6474'), 0, 1.32, 0);
  for (const [x, c] of [[-0.6, '#ffb347'], [0.1, '#ff7eb6'], [0.7, '#ffd34a']]) add(g, mesh(G.sphere(0.1, 8, 6), c, false), x, 1.0, 0.41).scale.set(1.5, 1, 0.3);
  for (const x of [-0.9, 0.4]) add(g, mesh(G.capsule(0.05, 0.4, 5), '#3fae66', false), x, 0.85, 0.41);
  return g;
}

// ---------- kitchen and processing machines for the new products ----------
function tray(g, x, z, col) {
  const t = add(g, new THREE.Group(), x, 0, z);
  add(t, mesh(G.rbox(1.0, 0.24, 0.8, 0.06), C.woodLight), 0, 0.12, 0);
  add(t, mesh(G.rbox(0.86, 0.04, 0.66, 0.02), col), 0, 0.24, 0);
  return t;
}
export function machine4(kind) {
  const g = new THREE.Group();
  g.add(blob(1.8));
  let spin;
  if (kind === 'sashimi') {
    add(g, mesh(G.rbox(1.6, 0.9, 1.0, 0.1), '#f2c99a'), 0, 0.45, -0.2);
    add(g, mesh(G.rbox(1.2, 0.08, 0.7, 0.03), '#fff6e6'), 0, 0.94, -0.2);
    const s = itemMesh('salmon'); s.position.set(-0.2, 0.96, -0.25); g.add(s);
    spin = add(g, new THREE.Group(), 0.35, 1.0, -0.1);
    add(spin, mesh(G.rbox(0.35, 0.03, 0.08, 0.01), '#cfd6de'), 0.1, 0, 0);
    add(spin, mesh(G.rbox(0.14, 0.05, 0.06, 0.02), C.woodDark), -0.12, 0, 0);
    spin.userData.axis = 'chop';
  } else if (kind === 'crabcan') {
    add(g, mesh(G.rbox(1.6, 0.95, 1.1, 0.14), '#ff8a6b'), 0, 0.48, -0.2);
    add(g, mesh(G.rbox(1.66, 0.1, 1.16, 0.05), '#e0694d'), 0, 0.98, -0.2);
    add(g, mesh(G.cyl(0.18, 0.2, 0.9, 10), '#4f9cf0'), -0.45, 1.4, -0.45);
    add(g, mesh(G.rbox(1.4, 0.08, 0.32, 0.03), '#5b6474'), 0.05, 1.07, 0.15);
    for (const x of [-0.35, 0.05, 0.45]) { const c = itemMesh('crabcan'); c.scale.setScalar(0.8); c.position.set(x, 1.1, 0.15); g.add(c); }
    const cr = itemMesh('crab'); cr.position.set(0.3, 1.05, -0.45); g.add(cr);
    spin = add(g, new THREE.Group(), 0.35, 1.4, -0.45);
    add(spin, mesh(G.cyl(0.26, 0.26, 0.12, 10), '#ffd34a'), 0, 0, 0).rotation.x = Math.PI / 2;
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; add(spin, mesh(G.rbox(0.1, 0.1, 0.12, 0.02), '#ffd34a'), Math.cos(a) * 0.29, Math.sin(a) * 0.29, 0).rotation.z = a; }
    spin.userData.axis = 'z';
  } else if (kind === 'tuna') {
    add(g, mesh(G.rbox(1.8, 0.9, 1.0, 0.1), '#3a3540'), 0, 0.45, -0.2);
    add(g, mesh(G.rbox(1.9, 0.1, 1.1, 0.04), '#e8b84a'), 0, 0.92, -0.2);
    const t = itemMesh('tuna'); t.position.set(-0.25, 0.97, -0.35); g.add(t);
    for (const x of [-0.85, 0.85]) add(g, mesh(G.rbox(0.1, 1.8, 0.1, 0.03), '#2d2a33'), x, 0.9, -0.72);
    add(g, mesh(G.rbox(1.8, 0.1, 0.12, 0.03), '#2d2a33'), 0, 1.8, -0.72);
    for (const x of [-0.6, -0.2, 0.2, 0.6]) add(g, mesh(G.rbox(0.36, 0.5, 0.04, 0.03), '#c8402f'), x, 1.5, -0.7);
    spin = add(g, new THREE.Group(), 0.45, 0.99, -0.05);
    add(spin, mesh(G.cyl(0.3, 0.3, 0.04, 16), '#ffffff'), 0, 0, 0);
    const o = itemMesh('otoro'); o.scale.setScalar(0.85); o.position.y = 0.02; spin.add(o);
  } else if (kind === 'fryer') {
    add(g, mesh(G.rbox(1.6, 0.9, 1.0, 0.1), '#cfd6de'), 0, 0.45, -0.2);
    add(g, mesh(G.rbox(1.2, 0.06, 0.7, 0.03), '#ffcf5a', false, true), 0, 0.92, -0.2);
    for (const sz of [-1, 1]) add(g, mesh(G.rbox(1.62, 0.12, 0.08, 0.03), '#aab4bf'), 0, 0.94, -0.2 + sz * 0.42);
    add(g, mesh(G.cyl(0.12, 0.14, 0.8, 8), '#8f969f'), -0.55, 1.3, -0.6);
    spin = add(g, new THREE.Group(), 0.2, 1.05, -0.2);
    add(spin, mesh(G.rbox(0.6, 0.18, 0.45, 0.04), '#5b6474'), 0, 0, 0);
    add(spin, mesh(G.rbox(0.08, 0.06, 0.5, 0.02), '#2d2a33'), 0.38, 0.12, 0);
    spin.userData.axis = 'dip';
  } else if (kind === 'squid') {
    add(g, mesh(G.rbox(1.6, 0.8, 1.0, 0.1), '#ff6b5a'), 0, 0.4, -0.2);
    add(g, mesh(G.rbox(1.3, 0.06, 0.7, 0.02), '#ffb347', false, true), 0, 0.83, -0.2);
    for (let i = 0; i < 6; i++) add(g, mesh(G.rbox(0.035, 0.04, 0.72, 0.01), '#4a4f5a'), -0.55 + i * 0.22, 0.87, -0.2);
    for (const x of [-0.75, 0.75]) add(g, mesh(G.rbox(0.08, 1.6, 0.08, 0.03), C.woodDark), x, 0.8, -0.7);
    add(g, mesh(G.rbox(1.7, 0.3, 0.5, 0.06), '#ffffff'), 0, 1.65, -0.65);
    add(g, mesh(G.rbox(1.7, 0.12, 0.52, 0.04), '#ff6b5a'), 0, 1.65, -0.65);
    spin = add(g, new THREE.Group(), 0, 0.95, -0.2);
    for (const x of [-0.35, 0.15]) { const s = itemMesh('squidgrill'); s.scale.setScalar(0.9); s.position.set(x, 0, 0); s.rotation.y = Math.PI / 2; spin.add(s); }
    spin.userData.axis = 'flip2';
  } else {
    // lobster pot on a stove
    add(g, mesh(G.rbox(1.6, 0.6, 1.0, 0.1), '#5b6474'), 0, 0.3, -0.2);
    add(g, mesh(G.cyl(0.55, 0.5, 0.65, 18), '#d2442f'), 0, 0.93, -0.2);
    add(g, mesh(G.cyl(0.57, 0.57, 0.08, 18), '#ffffff'), 0, 1.0, -0.2);
    for (const sz of [-1, 1]) add(g, mesh(G.rbox(0.18, 0.08, 0.1, 0.03), '#2d2a33'), sz * 0.62, 1.1, -0.2);
    spin = add(g, new THREE.Group(), 0, 1.28, -0.2);
    add(spin, mesh(G.cyl(0.56, 0.56, 0.06, 18), '#aab4bf'), 0, 0, 0);
    add(spin, mesh(G.sphere(0.07, 8, 6), '#2d2a33'), 0, 0.07, 0);
    spin.userData.axis = 'dip';
  }
  spin.userData.dyn = true;
  const inTray = tray(g, -1.45, 0.65, '#f6dd8a');
  const outTray = tray(g, 1.45, 0.65, '#cfe9ff');
  return { g, inTray, in2Tray: null, outTray, spin };
}
