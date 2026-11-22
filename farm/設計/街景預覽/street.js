// 街景預覽 v1 (2026-11-22) — NOT in the live game. Loaded on top of mg-v75 by 預覽截圖.py.
// Visual only: no colliders, nothing the game logic reads. Everything static is baked into a few meshes.
import * as THREE from 'three';
import * as K from '/farm/js/kit.js';
import * as P from '/farm/js/props.js';
import * as P2 from '/farm/js/props2.js';

const G = K.G;
const boxes = new Map();
// small and flat parts are plain 12-triangle boxes; only chunky shapes are rounded (phones)
function boxGeo(w, h, d) {
  const k = [w, h, d].map((v) => v.toFixed(3)).join();
  if (!boxes.has(k)) boxes.set(k, new THREE.BoxGeometry(w, h, d).toNonIndexed());
  return boxes.get(k);
}
const rb = (g, w, h, d, col, x, y, z, cast = true, r = 0.06) => K.add(g, K.mesh(r >= 0.12 ? G.rbox(w, h, d, r, 1) : boxGeo(w, h, d), col, cast, true), x, y, z);
const cy = (g, rt, rBottom, h, col, x, y, z, cast = true, s = 8) => K.add(g, K.mesh(G.cyl(rt, rBottom, h, s), col, cast, true), x, y, z);
function rng(a) { return () => ((a = (a * 16807) % 2147483647) / 2147483647); }

const WALLS = ['#ffd9b8', '#bfe0f5', '#ffe69a', '#f7bfd0', '#c9e8c0', '#d9c9f0', '#fff3dd'];
const ROOFS = ['#e8694d', '#4f8fc0', '#b8733f', '#8a6fc0', '#3f9f88'];
const AWN = ['#ff6f61', '#3fae8f', '#f0a43a', '#5a86d8', '#d8689c'];
const FLOWERS = ['#ff7eb6', '#ffffff', '#ffd34a', '#a98bff', '#ff8a6b'];

// a town shop-house, front on +z
function house(i, floors, w = 3.8) {
  const g = new THREE.Group(), h = 1.75 * floors + 0.25, wall = WALLS[i % WALLS.length];
  rb(g, w, h, 3, wall, 0, h / 2, 0);
  rb(g, w + 0.16, 0.3, 3.16, '#8d8f96', 0, 0.15, 0); // plinth
  if (i % 3 === 1) {
    rb(g, w + 0.24, 0.3, 3.24, '#fff8ec', 0, h + 0.12, 0); // flat roof with AC and water tank
    rb(g, 0.8, 0.4, 0.6, '#b9c2cc', -0.8, h + 0.47, 0.2);
    cy(g, 0.4, 0.4, 0.75, '#7fb7d8', 0.8, h + 0.65, -0.3);
  } else {
    K.add(g, K.mesh(G.prism(w + 0.3, 1.1, 3.4), ROOFS[i % ROOFS.length]), 0, h - 0.02, 0);
    rb(g, 0.4, 0.9, 0.4, '#c98a6a', w * 0.28, h + 0.85, -0.4);
  }
  // shop window, door, striped awning and hanging sign
  rb(g, w * 0.48, 0.95, 0.12, '#fff8ec', -w * 0.17, 0.85, 1.5);
  rb(g, w * 0.41, 0.75, 0.12, '#7fc4e6', -w * 0.17, 0.85, 1.56, false);
  rb(g, 0.72, 1.25, 0.12, '#7a5238', w * 0.3, 0.72, 1.53);
  const a = AWN[i % AWN.length], n = 7;
  for (let k = 0; k < n; k++) {
    rb(g, w / n, 0.12, 0.85, k % 2 ? '#fff8ec' : a, -w / 2 + (k + 0.5) * w / n, 1.6, 1.82, true, 0.02).rotation.x = 0.32;
  }
  rb(g, 0.12, 0.5, 0.65, a, w / 2 - 0.08, 2.2, 1.8);
  for (let f = 1; f < floors; f++) {
    for (const x of [-w * 0.25, w * 0.25]) {
      const y = f * 1.75 + 0.85;
      rb(g, 0.95, 0.95, 0.12, '#fff8ec', x, y, 1.5);
      rb(g, 0.76, 0.76, 0.12, '#6fb4dc', x, y, 1.56, false);
      rb(g, 0.06, 0.76, 0.12, '#fff8ec', x, y, 1.6, false, 0.01);
      rb(g, 1.05, 0.2, 0.28, '#a8623c', x, y - 0.56, 1.66);
      for (let k = 0; k < 3; k++) K.add(g, K.mesh(G.sphere(0.12, 6, 4), FLOWERS[(i + k) % 5], false), x - 0.3 + k * 0.3, y - 0.42, 1.68);
    }
  }
  return g;
}

function streetTree(s) {
  const g = new THREE.Group();
  rb(g, 0.8, 0.24, 0.8, '#b9774d', 0, 0.12, 0);
  cy(g, 0.09, 0.14, 1.7, '#9a6238', 0, 0.95, 0);
  K.add(g, K.mesh(G.sphere(0.68, 8, 6), '#3f9f4a'), 0, 1.95, 0);
  K.add(g, K.mesh(G.sphere(0.5, 8, 6), '#5fbf55'), 0.2, 2.3, 0.12);
  K.add(g, K.mesh(G.sphere(0.38, 8, 6), '#86d86a'), -0.2, 2.4, 0.25);
  g.scale.setScalar(s);
  return g;
}

function streetLamp(side) {
  const g = new THREE.Group();
  cy(g, 0.07, 0.12, 3, '#3f5366', 0, 1.5, 0);
  rb(g, 0.8, 0.09, 0.09, '#3f5366', side * 0.35, 2.95, 0);
  cy(g, 0.12, 0.28, 0.2, '#3f5366', side * 0.7, 2.86, 0);
  K.add(g, K.mesh(G.sphere(0.17, 8, 6), '#fff2a8', false), side * 0.7, 2.72, 0);
  cy(g, 0.22, 0.14, 0.22, '#b9774d', 0, 2.1, 0.22); // hanging flower basket
  for (let k = 0; k < 3; k++) K.add(g, K.mesh(G.sphere(0.14, 6, 4), FLOWERS[k]), -0.15 + k * 0.15, 2.26, 0.22);
  return g;
}

function car(col) {
  const g = new THREE.Group();
  rb(g, 1.3, 0.55, 2.4, col, 0, 0.5, 0, true, 0.15);
  rb(g, 1.1, 0.5, 1.25, '#fff8ec', 0, 0.98, -0.12, true, 0.15);
  rb(g, 1.14, 0.34, 1.0, '#5f9fc8', 0, 0.98, -0.12, false);
  for (const x of [-0.62, 0.62]) for (const z of [-0.75, 0.75]) cy(g, 0.3, 0.3, 0.2, '#30343c', x, 0.3, z).rotation.z = Math.PI / 2;
  for (const x of [-0.4, 0.4]) rb(g, 0.25, 0.12, 0.08, '#fff2a8', x, 0.55, 1.2, false, 0.03);
  return g;
}

function bench() {
  const g = new THREE.Group();
  rb(g, 0.45, 0.1, 1.5, '#c9773f', 0, 0.36, 0);
  rb(g, 0.08, 0.4, 1.5, '#c9773f', -0.22, 0.66, 0);
  for (const z of [-0.55, 0.55]) rb(g, 0.4, 0.34, 0.08, '#3f5366', 0, 0.17, z);
  return g;
}

function windmill() {
  const g = new THREE.Group();
  cy(g, 0.9, 1.5, 4.2, '#fff3dd', 0, 2.1, 0, true, 10);
  K.add(g, K.mesh(G.cone(1.2, 1.2, 10), '#e8694d'), 0, 4.8, 0);
  rb(g, 0.8, 1.2, 0.2, '#7a5238', 0, 0.6, 1.35);
  for (let k = 0; k < 4; k++) {
    const arm = K.add(g, new THREE.Group(), 0, 3.8, 1.25);
    arm.rotation.z = Math.PI / 4 + k * Math.PI / 2;
    rb(arm, 0.12, 2.4, 0.1, '#8b5a3c', 0, 1.2, 0);
    rb(arm, 0.55, 1.6, 0.06, '#fffaf0', 0.3, 1.45, 0.02, true, 0.02);
  }
  return g;
}

export function build(scene, stations = {}) {
  const D = new THREE.Group(), R = rng(4711);
  const put = (o, x, z, ry = 0) => { o.position.set(x, 0, z); o.rotation.y = ry; D.add(o); return o; };

  // raised, paved sidewalks with a kerb on both sides of the road
  for (let z = -42; z < 63; z += 1.2) {
    const k = Math.round((z + 42) / 1.2);
    if (Math.abs(z - 6) > 1.9) rb(D, 1.1, 0.1, 1.14, k % 2 ? '#e6cfb4' : '#dcc09f', 12.65, 0.05, z, false, 0.03);
    rb(D, 1.05, 0.1, 1.14, k % 2 ? '#dcc09f' : '#e6cfb4', 18.35, 0.05, z, false, 0.03);
    for (const x of [13.28, 17.72]) rb(D, 0.22, 0.18, 1.18, k % 4 < 2 ? '#f4f1e8' : '#f2c94c', x, 0.09, z, false, 0.03);
  }
  // road detail: two crossings, edge lines, manholes
  for (const z of [-4.3, 30]) for (let k = 0; k < 6; k++) rb(D, 0.36, 0.015, 1.7, '#fbfaf5', 13.8 + k * 0.68, 0.025, z, false, 0.005);
  for (let z = -40; z < 62; z += 10) {
    for (const x of [13.65, 17.35]) rb(D, 0.08, 0.012, 9.2, '#e9edf0', x, 0.018, z + 5, false, 0.005);
    cy(D, 0.36, 0.36, 0.015, '#747b86', 16.4, 0.022, z + 3, false, 12);
  }
  // street furniture
  for (const z of [-38, -31, -26, -21, -10.6, 2.9, 10.4, 15, 21, 27, 36, 43, 50, 57]) put(streetTree(0.78), 12.55, z);
  for (const z of [-35, -28, -22, 0.9, 11.2, 19.8, 29, 39, 49, 58]) put(streetTree(0.92), 18.5, z);
  for (const z of [-33, -18, -6.1, 8.7, 18, 32, 46, 60]) put(streetLamp(1), 12.95, z);
  for (const z of [-25, -8, 3, 14, 24, 35, 45, 55]) put(streetLamp(-1), 18.0, z);
  for (const z of [-8.9, 12.6, 24.2]) put(bench(), 12.5, z);
  for (const z of [-2.6, 13.3]) { // hydrant and post box
    cy(D, 0.16, 0.2, 0.6, '#ef5350', 12.75, 0.35, z);
    rb(D, 0.5, 0.75, 0.4, '#3f9f6a', 18.3, 0.5, z + 1.2);
  }
  // bus stop
  const bus = put(new THREE.Group(), 18.5, -19);
  for (const z of [-1, 1]) cy(bus, 0.07, 0.07, 2.1, '#3f5366', 0.2, 1.05, z);
  rb(bus, 1.3, 0.12, 2.6, '#3fae8f', 0, 2.15, 0);
  rb(bus, 0.08, 1.2, 2.1, '#a9d8ee', 0.3, 1.1, 0);
  put(bench(), 18.5, -19, Math.PI);
  // cars (they would drive in the real version)
  [['#ff7a66', -23], ['#5aa9ff', -9.5], ['#ffd34a', 1.5], ['#7fcf6a', 20], ['#b48cff', 40]].forEach(([c, z]) => put(car(c), 16.65, z, Math.PI));

  // town: a street of shop-houses, the back row behind the shop, houses beyond the car park and warehouses
  [-39, -34.6, -30.2, -25.8, -21.4].forEach((z, i) => put(house(i, 2 + (i % 2)), 21, z, -Math.PI / 2));
  for (let i = 0; i < 8; i++) put(house(i + 2, 2 + (i % 2)), -21 + i * 4.3, -37.6);
  for (let i = 0; i < 17; i++) put(house(i + 1, 2 + (i % 3)), 32.8, -18 + i * 4.7, -Math.PI / 2);
  // a little kiosk between the billboard and the helipad
  const ks = put(new THREE.Group(), 19.9, 1.1, -Math.PI / 2);
  rb(ks, 1.5, 1.4, 1.2, '#ffe69a', 0, 0.7, 0);
  rb(ks, 1.1, 0.5, 0.1, '#5f8fb0', 0, 0.9, 0.62, false);
  for (let k = 0; k < 5; k++) rb(ks, 0.36, 0.12, 1.5, k % 2 ? '#fff8ec' : '#ff6f61', -0.72 + k * 0.36, 1.55, 0.15, true, 0.02).rotation.x = 0.15;
  // countryside beyond the west fence
  put(windmill(), -24.2, 9, 0.5);
  put(house(2, 2), -24.5, 21, Math.PI / 2);
  for (const z of [0, 15, 28]) {
    cy(D, 0.8, 0.8, 2.8, '#c9d3dc', -23.6, 1.4, z, true, 10);
    K.add(D, K.mesh(G.cone(0.95, 0.7, 10), '#e8694d'), -23.6, 3.15, z);
  }

  // farm: mown stripes in the lawn
  for (let z = -3.6; z < 61; z += 3.2) K.add(D, K.mesh(G.plane(31.5, 1.6), '#aedd62', false, true), -5.2, 0.0022, z + 0.8);
  // farm: every machine stands on its own paved yard, every field has sunflowers along its back edge
  for (const s of Object.values(stations)) {
    if (!s.def || !s.def.pos) continue;
    const [x, z] = s.def.pos;
    if (s.kind === 'machine') {
      rb(D, 3.9, 0.05, 2.7, '#c9a273', x, 0.022, z + 0.45, false, 0.02);
      for (let a = 0; a < 5; a++) for (let b = 0; b < 3; b++) rb(D, 0.68, 0.03, 0.74, (a + b) % 2 ? '#ead3ac' : '#dfc49a', x - 1.48 + a * 0.74, 0.055, z - 0.36 + b * 0.82, false, 0.01);
      cy(D, 0.26, 0.22, 0.6, '#a8623c', x - 1.6, 0.3, z - 0.75);
      cy(D, 0.27, 0.27, 0.07, '#3f5366', x - 1.6, 0.5, z - 0.75, false);
    }
    if (s.kind === 'crop' && s.w) {
      const n = Math.floor(s.w / 0.65);
      for (let k = 0; k < n; k++) {
        const fx = x - s.w / 2 + (k + 0.5) * s.w / n, fz = z - s.d / 2 - 0.32, h = 0.65 + (k % 3) * 0.14;
        cy(D, 0.035, 0.045, h, '#4f9f45', fx, h / 2, fz, false, 5);
        const f = K.add(D, new THREE.Group(), fx, h + 0.05, fz);
        f.rotation.x = 1.0;
        cy(f, 0.23, 0.23, 0.06, '#ffd34a', 0, 0, 0, true, 9);
        cy(f, 0.1, 0.1, 0.1, '#8b5a3c', 0, 0.02, 0, false, 8);
      }
    }
  }
  // pebble edging along the main path
  for (let z = -3.4; z < 30; z += 0.55) {
    for (const x of [-1.22, 0.02]) {
      if (R() < 0.3) continue;
      K.add(D, K.mesh(G.sphere(0.12, 6, 4), R() < 0.5 ? '#d8d2c4' : '#bfb6a6', false), x, 0.03, z + R() * 0.2).scale.set(1, 0.6, 1.2);
    }
  }
  // grass tufts and flower clumps give the lawn some texture
  for (let i = 0; i < 420; i++) {
    const x = -20 + R() * 31.5, z = -4 + R() * 64, col = R() < 0.5 ? '#86c94c' : '#97d455';
    for (let k = 0; k < 3; k++) {
      K.add(D, K.mesh(G.cone(0.06, 0.2, 3), col, false), x + (k - 1) * 0.09, 0.08, z + (k % 2) * 0.07).rotation.z = (1 - k) * 0.35;
    }
  }
  for (const [x, z] of [[-11, 1.5], [-11.3, 12.3], [-7.8, 15.6], [1.4, 10.6], [6.2, 5.2], [11.2, 10.2], [-2.0, 5.4], [5.8, 16.2], [-11.8, -3.2]]) {
    const c = put(P.bush(0.36), x, z);
    for (let k = 0; k < 4; k++) K.add(c, K.mesh(G.sphere(0.09, 6, 4), FLOWERS[k], false), -0.3 + k * 0.2, 0.45, 0.25);
  }
  // bunting over the main path
  for (const z of [16.1]) {
    for (const x of [-2, 0.8]) cy(D, 0.06, 0.09, 2.7, '#9a6238', x, 1.35, z);
    for (let k = 0; k <= 8; k++) {
      const t = k / 8, y = 2.65 - Math.sin(t * Math.PI) * 0.38, f = K.mesh(G.cone(0.14, 0.3, 3), FLOWERS[k % 5]);
      f.rotation.x = Math.PI; f.scale.z = 0.3;
      K.add(D, f, -2 + t * 2.8, y, z);
    }
  }
  K.bake(D, scene);

  // signs keep their own texture
  for (const [t, x, z, col] of [['小鎮咖啡', 19.5, -25.8, '#8b5a3c'], ['陽光花店', 19.5, -34.6, '#d8689c'], ['幸福麵包', 19.5, -21.4, '#e8694d']]) {
    const s = P2.signBoard(t, 2.2, col);
    s.position.set(x - 0.25, 2.1, z); s.rotation.y = -Math.PI / 2; s.scale.setScalar(0.75);
    scene.add(s);
  }

  // light: a little less flat fill, a warmer and stronger sun, so every side of a thing reads differently
  scene.traverse((o) => {
    if (o.isHemisphereLight) { o.intensity = 0.92; o.groundColor.set('#7fa860'); }
    if (o.isDirectionalLight) { o.intensity = 2.75; o.color.set('#ffe9c4'); }
  });
}
