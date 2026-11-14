// v2 props: new crops, processing machines, sprinkler, vehicles, helipad, signs.
import * as THREE from 'three';
import { C, G, mesh, add, blob } from './kit.js';

export function soyPlant() {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) { const b = add(g, mesh(G.sphere(0.2, 8, 6), i % 2 ? '#6cc257' : '#5ab34c'), Math.cos(i * 2.1) * 0.12, 0.35, Math.sin(i * 2.1) * 0.12); b.scale.set(1, 0.75, 1); }
  const fruit = add(g, new THREE.Group());
  for (let i = 0; i < 4; i++) { const p = add(fruit, mesh(G.capsule(0.04, 0.12, 6), '#c9d86a'), Math.cos(i * 1.6) * 0.2, 0.45, Math.sin(i * 1.6) * 0.2); p.rotation.z = 1.2; p.rotation.y = i * 1.6; }
  return { g, fruit };
}
export function wheatPlant() {
  const g = new THREE.Group();
  const fruit = add(g, new THREE.Group());
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26, r = i ? 0.12 : 0;
    const st = add(g, mesh(G.cyl(0.018, 0.022, 0.7, 4), '#c7c157'), Math.cos(a) * r, 0.35, Math.sin(a) * r);
    st.rotation.z = Math.cos(a) * 0.12;
    add(fruit, mesh(G.capsule(0.045, 0.16, 6), '#f0c75a'), Math.cos(a) * r * 1.3, 0.8, Math.sin(a) * r * 1.3);
  }
  return { g, fruit };
}
export function appleTree() {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.13, 0.18, 0.9, 7), C.woodDark), 0, 0.45, 0);
  add(g, mesh(G.sphere(0.7, 9, 7), '#5fbf55'), 0, 1.25, 0);
  add(g, mesh(G.sphere(0.45, 9, 7), '#72cf60'), 0.3, 1.55, 0.2);
  const fruit = add(g, new THREE.Group());
  for (const [x, y, z] of [[0.55, 1.15, 0.3], [-0.45, 1.3, 0.4], [0.1, 1.05, 0.65], [-0.3, 1.6, -0.35]]) add(fruit, mesh(G.sphere(0.11, 9, 7), '#9bd34b'), x, y, z);
  return { g, fruit };
}

function tray(g, x, z, col) {
  const t = add(g, new THREE.Group(), x, 0, z);
  add(t, mesh(G.rbox(1.0, 0.24, 0.8, 0.06), C.woodLight), 0, 0.12, 0);
  add(t, mesh(G.rbox(0.86, 0.04, 0.66, 0.02), col), 0, 0.24, 0);
  return t;
}
// processing machine: input tray on the left, output tray on the right; `spin` turns while it works
export function machine(kind) {
  const g = new THREE.Group();
  g.add(blob(1.8));
  let spin;
  if (kind === 'juicer') {
    add(g, mesh(G.rbox(1.5, 1.0, 1.1, 0.14), '#ff7a66'), 0, 0.5, -0.2);
    add(g, mesh(G.rbox(1.55, 0.12, 1.15, 0.05), C.white), 0, 1.0, -0.2);
    add(g, mesh(G.cyl(0.42, 0.36, 0.75, 16), '#cdeeff'), 0, 1.45, -0.2);
    add(g, mesh(G.cyl(0.36, 0.3, 0.5, 16), '#ff8a5c'), 0, 1.32, -0.2);
    spin = add(g, new THREE.Group(), 0, 1.9, -0.2);
    add(spin, mesh(G.cyl(0.46, 0.46, 0.1, 16), C.white), 0, 0, 0);
    add(spin, mesh(G.rbox(0.5, 0.06, 0.1, 0.03), C.grey), 0, 0.08, 0);
  } else if (kind === 'soy') {
    add(g, mesh(G.rbox(1.6, 0.8, 1.1, 0.14), '#f3e2b8'), 0, 0.4, -0.2);
    add(g, mesh(G.cyl(0.45, 0.5, 0.9, 16), '#d9e7f0'), -0.3, 1.2, -0.2);
    add(g, mesh(G.cyl(0.47, 0.47, 0.08, 16), '#b8865a'), -0.3, 1.68, -0.2);
    spin = add(g, new THREE.Group(), 0.45, 1.0, -0.2);
    add(spin, mesh(G.cyl(0.35, 0.35, 0.18, 14), '#bfc4c9'), 0, 0, 0);
    add(spin, mesh(G.cyl(0.33, 0.33, 0.18, 14), '#a8adb3'), 0, 0.19, 0);
    add(spin, mesh(G.rbox(0.08, 0.3, 0.08, 0.03), C.woodDark), 0.25, 0.4, 0);
  } else if (kind === 'oven') {
    add(g, mesh(G.rbox(1.7, 0.4, 1.3, 0.1), '#d08a63'), 0, 0.2, -0.2);
    const dome = add(g, mesh(G.sphere(0.8, 14, 10), '#e0805a'), 0, 0.4, -0.2); dome.scale.set(1, 0.85, 0.9);
    add(g, mesh(G.rbox(0.6, 0.45, 0.1, 0.12), '#5b3a2c'), 0, 0.65, 0.5);
    add(g, mesh(G.rbox(0.48, 0.3, 0.06, 0.1), '#ffb347'), 0, 0.62, 0.53);
    add(g, mesh(G.cyl(0.14, 0.16, 0.6, 8), '#c96d4a'), 0.35, 1.3, -0.4);
    spin = add(g, new THREE.Group(), 0.35, 1.7, -0.4);
    add(spin, mesh(G.sphere(0.16, 7, 5), '#f2f2f2'), 0, 0, 0);
  } else {
    add(g, mesh(G.rbox(1.6, 0.5, 1.1, 0.1), C.woodLight), 0, 0.25, -0.2);
    for (const x of [-0.65, 0.65]) add(g, mesh(G.rbox(0.14, 1.4, 0.14, 0.04), C.woodDark), x, 0.9, -0.2);
    add(g, mesh(G.rbox(1.5, 0.14, 0.2, 0.05), C.woodDark), 0, 1.55, -0.2);
    add(g, mesh(G.cyl(0.4, 0.4, 0.3, 16), '#ffd25a'), 0, 0.68, -0.2);
    spin = add(g, new THREE.Group(), 0, 1.75, -0.2);
    const wh = add(spin, mesh(G.cyl(0.32, 0.32, 0.06, 12), C.wood), 0, 0, 0); wh.rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) add(spin, mesh(G.rbox(0.6, 0.05, 0.05, 0.02), C.woodDark), 0, 0, 0.04).rotation.z = i * 1.05;
  }
  const inTray = tray(g, -1.45, 0.65, '#f6dd8a');
  const outTray = tray(g, 1.45, 0.65, '#cfe9ff');
  return { g, inTray, outTray, spin };
}

export function sprinkler() {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.05, 0.07, 0.6, 8), C.grey), 0, 0.3, 0);
  const head = add(g, new THREE.Group(), 0, 0.62, 0);
  add(head, mesh(G.cyl(0.1, 0.1, 0.08, 10), C.blue), 0, 0, 0);
  add(head, mesh(G.rbox(0.36, 0.05, 0.05, 0.02), C.blue), 0, 0.05, 0);
  const drops = [];
  for (let i = 0; i < 6; i++) drops.push(add(g, mesh(G.sphere(0.05, 6, 4), '#9fdcff', false, false)));
  return { g, head, drops };
}

export function car(col) {
  const g = new THREE.Group();
  g.add(blob(1.4));
  add(g, mesh(G.rbox(1.3, 0.5, 2.3, 0.2), col), 0, 0.45, 0);
  add(g, mesh(G.rbox(1.15, 0.45, 1.2, 0.2), col), 0, 0.85, -0.15);
  add(g, mesh(G.rbox(1.18, 0.3, 1.0, 0.12), '#cdeeff'), 0, 0.88, -0.15);
  for (const s of [-1, 1]) for (const z of [-0.7, 0.7]) { const w = add(g, mesh(G.cyl(0.24, 0.24, 0.2, 12), '#3c3f48'), s * 0.62, 0.24, z); w.rotation.z = Math.PI / 2; }
  for (const s of [-1, 1]) add(g, mesh(G.sphere(0.08, 6, 5), '#fff4c2'), s * 0.42, 0.5, 1.15);
  return g;
}

export function helipad() {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(3.2, 3.2, 0.12, 32), '#8f969f', false, true), 0, 0.06, 0);
  add(g, mesh(G.cyl(2.9, 2.9, 0.13, 32), '#a7aeb6', false, true), 0, 0.065, 0);
  for (const x of [-0.7, 0.7]) add(g, mesh(G.rbox(0.32, 0.05, 2.2, 0.03), C.yellow, false, true), x, 0.15, 0);
  add(g, mesh(G.rbox(1.4, 0.05, 0.32, 0.03), C.yellow, false, true), 0, 0.15, 0);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(g, mesh(G.sphere(0.1, 6, 5), '#ffde59', false), Math.cos(a) * 3.05, 0.17, Math.sin(a) * 3.05); }
  return g;
}
export function heli() {
  const g = new THREE.Group();
  g.add(blob(2));
  const b = add(g, new THREE.Group());
  add(b, mesh(G.sphere(0.95, 14, 10), '#ff6b5a'), 0, 1.2, 0.2).scale.set(1, 0.85, 1.3);
  add(b, mesh(G.sphere(0.7, 12, 8), '#cdeeff'), 0, 1.3, 0.95).scale.set(1, 0.8, 0.7);
  add(b, mesh(G.capsule(0.18, 1.6, 8), '#ff6b5a'), 0, 1.4, -1.5).rotation.x = Math.PI / 2;
  add(b, mesh(G.rbox(0.08, 0.6, 0.4, 0.04), '#e85a4a'), 0, 1.7, -2.4);
  for (const s of [-1, 1]) add(b, mesh(G.rbox(0.08, 0.08, 2.2, 0.04), C.grey), s * 0.6, 0.2, 0.2);
  const rotor = add(b, new THREE.Group(), 0, 2.15, 0.2);
  add(rotor, mesh(G.cyl(0.12, 0.12, 0.25, 8), C.grey), 0, -0.1, 0);
  for (let i = 0; i < 2; i++) add(rotor, mesh(G.rbox(4.2, 0.04, 0.24, 0.02), '#4a4f5a'), 0, 0.04, 0).rotation.y = i * Math.PI / 2;
  return { g, b, rotor };
}

export function signBoard(text, w = 4, col = '#ff8a6b') {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = col; x.fillRect(0, 0, 512, 128);
  x.fillStyle = '#ffffff'; x.font = '900 76px "PingFang TC","Microsoft JhengHei",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 256, 68);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  add(g, mesh(G.rbox(w + 0.2, 1.1, 0.16, 0.08), C.white), 0, 0, 0);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.0), new THREE.MeshLambertMaterial({ map: t }));
  face.position.z = 0.085; g.add(face);
  return g;
}

// faint standing figure that marks a hire zone ("a person stands above the dashed square")
const ghostMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false });
export function ghostPerson() {
  const g = new THREE.Group();
  const b = new THREE.Mesh(G.capsule(0.3, 0.32), ghostMat); b.position.y = 0.66; g.add(b);
  const h = new THREE.Mesh(G.sphere(0.31, 16, 12), ghostMat); h.position.y = 1.28; g.add(h);
  return g;
}

// glass-front fridge for cold drinks and cheese; items sit on two inner shelves
const glassMat = new THREE.MeshLambertMaterial({ color: '#cfefff', transparent: true, opacity: 0.28, depthWrite: false });
export function fridge() {
  const g = new THREE.Group();
  g.add(blob(1.3));
  add(g, mesh(G.rbox(1.75, 2.0, 0.95, 0.1), '#f4f8fb'), 0, 1.0, -0.05);
  add(g, mesh(G.rbox(1.55, 1.7, 0.1, 0.04), '#cfe3ee'), 0, 1.0, -0.46);
  for (const y of [0.42, 1.02]) add(g, mesh(G.rbox(1.5, 0.05, 0.7, 0.02), '#dfe9f0'), 0, y, 0.0);
  add(g, mesh(G.rbox(1.8, 0.22, 1.0, 0.08), '#5aa9ff'), 0, 2.05, -0.05);
  // glass door hinged on the left edge
  const door = add(g, new THREE.Group(), -0.78, 0, 0.45);
  for (const [x, y, w, h] of [[0.79, 1.82, 1.58, 0.1], [0.79, 0.18, 1.58, 0.1], [0.04, 1.0, 0.08, 1.74], [1.54, 1.0, 0.08, 1.74]]) add(door, mesh(G.rbox(w, h, 0.06, 0.02), '#e8f2f8'), x, y, 0);
  const glass = new THREE.Mesh(G.rbox(1.4, 1.52, 0.07, 0.02), glassMat); glass.position.set(0.79, 1.0, 0.01); door.add(glass);
  add(door, mesh(G.rbox(0.07, 0.6, 0.07, 0.03), '#9fb4c2'), 1.42, 1.05, 0.07);
  const slots = [];
  for (const y of [0.45, 1.05]) for (let c = 0; c < 4; c++) slots.push(new THREE.Vector3(-0.54 + c * 0.36, y, 0.05));
  return { g, slots, door };
}

// glass sliding double door; open01 0..1
export function slidingDoor(w = 1.8) {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(w + 0.5, 0.18, 0.3, 0.05), '#8fd1c4'), 0, 1.55, 0);
  for (const s of [-1, 1]) add(g, mesh(G.rbox(0.14, 1.6, 0.3, 0.04), '#8fd1c4'), s * (w / 2 + 0.18), 0.8, 0);
  const panels = [];
  for (const s of [-1, 1]) {
    const p = add(g, new THREE.Group(), s * w / 4, 0, 0);
    add(p, mesh(G.rbox(w / 2 - 0.04, 1.42, 0.08, 0.03), '#d8f1ff'), 0, 0.75, 0);
    add(p, mesh(G.rbox(w / 2 - 0.04, 0.08, 0.1, 0.02), '#9fb4c2'), 0, 0.06, 0);
    panels.push({ p, s, x0: s * w / 4 });
  }
  return { g, open(k) { for (const q of panels) q.p.position.x = q.x0 + q.s * k * (w / 2 - 0.06); } };
}

// warehouse with a roll-up door facing +z
export function warehouse() {
  const g = new THREE.Group();
  g.add(blob(3));
  add(g, mesh(G.rbox(4.2, 2.4, 3.6, 0.12), '#a9c3d3'), 0, 1.2, 0);
  for (let i = 0; i < 6; i++) add(g, mesh(G.rbox(0.06, 2.3, 3.62, 0.02), '#97b2c3'), -1.9 + i * 0.76, 1.2, 0);
  add(g, mesh(G.prism(4.5, 1.0, 3.9), '#6f8ea2'), 0, 2.4, 0);
  add(g, mesh(G.rbox(2.6, 2.1, 0.12, 0.04), '#5d6f7c'), 0, 1.05, 1.78);
  const door = add(g, new THREE.Group(), 0, 0, 1.86);
  add(door, mesh(G.rbox(2.4, 1.9, 0.08, 0.03), '#eef2f5'), 0, 1.0, 0);
  for (let i = 0; i < 6; i++) add(door, mesh(G.rbox(2.42, 0.04, 0.1, 0.01), '#c9d3db'), 0, 0.2 + i * 0.3, 0);
  add(g, mesh(G.rbox(3.0, 0.5, 0.1, 0.05), '#ffd34a'), 0, 2.35, 1.83);
  return { g, door };
}

// round floor pad (deposit / withdraw spots)
export function pad(col) {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.62, 0.66, 0.06, 24), col, false, true), 0, 0.03, 0);
  add(g, mesh(G.cyl(0.45, 0.45, 0.065, 24), '#ffffff', false, true), 0, 0.035, 0);
  return g;
}

// small wall lamp; set lit(true/false)
const bulbOn = new THREE.MeshBasicMaterial({ color: '#fff3a6' });
const bulbOff = new THREE.MeshLambertMaterial({ color: '#d9d4c4' });
export function wallLamp() {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(0.3, 0.12, 0.25, 0.04), '#6a7382'), 0, 0, 0);
  const b = new THREE.Mesh(G.sphere(0.16, 10, 8), bulbOff); b.position.set(0, -0.15, 0.08); g.add(b);
  return { g, lit(on) { b.material = on ? bulbOn : bulbOff; } };
}
