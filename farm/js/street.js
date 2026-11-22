// 街景 (design A, approved 2026-11-22): sidewalks, town, farm ground detail and passing cars.
// Static things are baked in chunks so the camera only draws the part of the town it can see.
// Ground heights (all must stay under the 0.012 contact shadows and the 0.03 dashed zones):
//   stripes 0.0018 < grass patches 0.003–0.0094 < paving base 0.0099 < paving tiles 0.0108
import * as THREE from 'three';
import * as K from './kit.js';
import * as P from './props.js';
import * as P2 from './props2.js';

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
const flat = (g, w, d, col, x, y, z) => K.add(g, K.mesh(G.plane(w, d), col, false, true), x, y, z);
// zebra crossings, at the places people actually cross: shop + car park, helipad, one for each warehouse row
export const CROSSINGS = [-4.3, 9, 18.5, 28.2, 37.9, 47.2, 56.6];
const atCrossing = (z, r) => CROSSINGS.some((c) => Math.abs(c - z) < r);
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

// env: box() makes a solid, keep = [x, z, r] spots that must stay clear (zones, trays, pens)
export function buildStreet(scene, { box, keep }) {
  const D = new THREE.Group(), R = rng(4711);
  const put = (o, x, z, ry = 0) => { o.position.set(x, 0, z); o.rotation.y = ry; D.add(o); return o; };
  const solid = (x, z, rx, rz = rx) => box(x - rx, z - rz, x + rx, z + rz);
  const clear = (x, z, r) => keep.every(([kx, kz, kr]) => Math.hypot(kx - x, kz - z) > r + kr);

  // paved sidewalks (flat, so zones and shadows still show on them) with a kerb on both sides of the road
  for (let z = -42; z < 74; z += 1.2) {
    const k = Math.round((z + 42) / 1.2), dock = Math.abs(z - 6) < 2.2;
    for (const x of [12.65, 18.35]) {
      if (x < 15 && dock) continue;
      flat(D, 1.1, 1.2, '#cdb497', x, 0.0099, z);
      flat(D, 1.02, 1.12, k % 2 ? '#e6cfb4' : '#dcc09f', x, 0.0108, z);
    }
    for (const x of [13.28, 17.72]) {
      if ((x < 15 && dock) || atCrossing(z, 0.85)) continue; // lowered kerb at a crossing
      rb(D, 0.22, 0.18, 1.18, k % 4 < 2 ? '#f4f1e8' : '#f2c94c', x, 0.09, z, false, 0.03);
    }
  }
  // road detail: two crossings, edge lines, manholes
  for (const z of CROSSINGS) {
    for (let k = 0; k < 6; k++) flat(D, 0.36, 1.7, '#fbfaf5', 13.8 + k * 0.68, 0.025, z);
    // stop lines, on the side each lane comes from
    flat(D, 1.5, 0.12, '#fbfaf5', 14.7, 0.022, z - 1.2);
    flat(D, 1.5, 0.12, '#fbfaf5', 16.6, 0.022, z + 1.2);
  }
  for (let z = -40; z < 62; z += 10) {
    for (const x of [13.65, 17.35]) rb(D, 0.08, 0.012, 9.2, '#e9edf0', x, 0.018, z + 5, false, 0.005);
    cy(D, 0.36, 0.36, 0.015, '#747b86', 16.4, 0.022, z + 3, false, 12);
  }
  // street furniture
  for (const z of [-38, -31, -26, -21, -10.6, 3.3, 11.4, 20.3, 25.6, 36, 43, 50, 54.5]) { put(streetTree(0.78), 12.63, z); solid(12.63, z, 0.18); }
  for (const z of [-35, -28, -22, 0.1, 11.2, 19.8, 29, 39, 49, 58]) { put(streetTree(0.92), 18.5, z); solid(18.5, z, 0.22); }
  for (const z of [-33, -18, -6.1, 17.6, 29.6]) { put(streetLamp(1), 12.95, z); solid(12.95, z, 0.1); }
  for (const z of [-25, -7.6, 3, 14, 24, 35, 45, 55]) { put(streetLamp(-1), 18.0, z); solid(18.0, z, 0.1); }
  for (const z of [-14, -2, 10, 22]) solid(13, z, 0.1); // the older round lamps
  for (const z of [-8.9, 13, 24.2]) { put(bench(), 12.5, z); solid(12.48, z, 0.2, 0.72); }
  for (const z of [-2.6, 14.3]) {
    cy(D, 0.16, 0.2, 0.6, '#ef5350', 12.75, 0.35, z); solid(12.75, z, 0.14);
    rb(D, 0.5, 0.75, 0.4, '#3f9f6a', 18.3, 0.5, z + 1.2); solid(18.3, z + 1.2, 0.22, 0.18);
  }
  // bus stop
  const bus = put(new THREE.Group(), 18.5, -19);
  for (const z of [-1, 1]) cy(bus, 0.07, 0.07, 2.1, '#3f5366', 0.2, 1.05, z);
  rb(bus, 1.3, 0.12, 2.6, '#3fae8f', 0, 2.15, 0);
  rb(bus, 0.08, 1.2, 2.1, '#a9d8ee', 0.3, 1.1, 0);
  put(bench(), 18.5, -19, Math.PI); solid(18.65, -19, 0.2, 0.95);
  // town: a street of shop-houses, the back row behind the shop, houses beyond the car park and warehouses
  [-39, -34.6, -30.2, -25.8, -21.4].forEach((z, i) => { put(house(i, 2 + (i % 2)), 21, z, -Math.PI / 2); solid(21, z, 1.6, 1.95); });
  for (let i = 0; i < 8; i++) { put(house(i + 2, 2 + (i % 2)), -21 + i * 4.3, -37.6); solid(-21 + i * 4.3, -37.6, 1.95, 1.6); }
  for (let i = 0; i < 17; i++) put(house(i + 1, 2 + (i % 3)), 32.8, -18 + i * 4.7, -Math.PI / 2);
  // a little kiosk between the billboard and the helipad
  const ks = put(new THREE.Group(), 19.9, 1.1, -Math.PI / 2);
  solid(19.9, 1.1, 0.62, 0.78);
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

  // mown stripes in the lawn, up to the sidewalk
  for (let z = -3.6; z < 61; z += 3.2) flat(D, 33.05, 1.6, '#aedd62', -4.425, 0.0018, z + 0.8);
  pebbles(D, R, -3.4, 30, keep);
  // grass tufts and flower clumps give the lawn some texture
  for (let i = 0; i < 420; i++) {
    const x = -20 + R() * 31.5, z = -4 + R() * 64, col = R() < 0.5 ? '#86c94c' : '#97d455';
    if (!clear(x, z, 0.1)) continue;
    const tuft = put(new THREE.Group(), x, z);
    for (let k = 0; k < 3; k++) {
      K.add(tuft, K.mesh(G.cone(0.06, 0.2, 3), col, false), (k - 1) * 0.09, 0.08, (k % 2) * 0.07).rotation.z = (1 - k) * 0.35;
    }
  }
  for (const [x, z] of [[-11, 1.5], [-11.3, 12.3], [-7.8, 15.6], [1.4, 10.6], [11.2, 10.2], [-2.0, 5.4], [5.8, 16.2], [-11.8, -3.2]]) {
    if (!clear(x, z, 0.35)) continue;
    const c = put(P.bush(0.36), x, z);
    solid(x, z, 0.24);
    for (let k = 0; k < 4; k++) K.add(c, K.mesh(G.sphere(0.09, 6, 4), FLOWERS[k], false), -0.3 + k * 0.2, 0.45, 0.25);
  }
  // bunting over the main path
  for (const z of [16.1]) {
    for (const x of [-2, 0.8]) { cy(D, 0.06, 0.09, 2.7, '#9a6238', x, 1.35, z); solid(x, z, 0.09); }
    for (let k = 0; k <= 8; k++) {
      const t = k / 8, y = 2.65 - Math.sin(t * Math.PI) * 0.38, f = K.mesh(G.cone(0.14, 0.3, 3), FLOWERS[k % 5]);
      f.rotation.x = Math.PI; f.scale.z = 0.3;
      K.add(D, f, -2 + t * 2.8, y, z);
    }
  }
  bakeChunks(D, scene);

  // signs keep their own texture
  for (const [t, x, z, col] of [['小鎮咖啡', 19.5, -25.8, '#8b5a3c'], ['陽光花店', 19.5, -34.6, '#d8689c'], ['幸福麵包', 19.5, -21.4, '#e8694d']]) {
    const s = P2.signBoard(t, 2.2, col);
    s.position.set(x - 0.25, 2.1, z); s.rotation.y = -Math.PI / 2; s.scale.setScalar(0.75);
    scene.add(s);
  }

}

function pebbles(D, R, z0, z1, keep) {
  for (let z = z0; z < z1; z += 0.55) {
    for (const x of [-1.22, 0.02]) {
      const skip = R() < 0.3, col = R() < 0.5 ? '#d8d2c4' : '#bfb6a6', pz = z + R() * 0.2;
      if (skip || !keep.every(([kx, kz, kr]) => Math.hypot(kx - x, kz - pz) > kr)) continue;
      K.add(D, K.mesh(G.sphere(0.12, 6, 4), col, false), x, 0.03, pz).scale.set(1, 0.6, 1.2);
    }
  }
}

// bake by area: one mesh over the whole map could never be culled
function bakeChunks(D, scene) {
  const chunks = new Map();
  for (const o of [...D.children]) {
    const x = o.position.x, key = (x < -22 ? 'w' : x < 10 ? 'm' : x < 28 ? 'r' : 'e') + Math.floor((o.position.z + 42) / 22);
    if (!chunks.has(key)) chunks.set(key, new THREE.Group());
    chunks.get(key).add(o);
  }
  for (const g of chunks.values()) K.bake(g, scene);
}

// the southern half of the path edging arrives with the 擴建
export function southDetail(D, keep) { pebbles(D, rng(977), 30.6, 60, keep); }

// parts that belong to a building: they go into its group, so they appear and pop in with it
export function machineYard(g) {
  flat(g, 3.9, 2.6, '#c9a273', 0, 0.0099, 0.43);
  for (let a = 0; a < 5; a++) for (let b = 0; b < 3; b++) flat(g, 0.7, 0.76, (a + b) % 2 ? '#ead3ac' : '#dfc49a', -1.48 + a * 0.74, 0.0108, -0.37 + b * 0.8);
  cy(g, 0.26, 0.22, 0.6, '#a8623c', -1.6, 0.3, -0.75);
  cy(g, 0.27, 0.27, 0.07, '#3f5366', -1.6, 0.5, -0.75, false);
}
export const BARREL = [-1.6, -0.75, 0.24];
export function sunflowers(g, w, d) {
  const n = Math.floor(w / 0.65);
  for (let k = 0; k < n; k++) {
    const x = -w / 2 + (k + 0.5) * w / n, z = -d / 2 - 0.32, h = 0.65 + (k % 3) * 0.14;
    cy(g, 0.035, 0.045, h, '#4f9f45', x, h / 2, z, false, 5);
    const f = K.add(g, new THREE.Group(), x, h + 0.05, z);
    f.rotation.x = 1.0;
    cy(f, 0.23, 0.23, 0.06, '#ffd34a', 0, 0, 0, true, 9);
    cy(f, 0.1, 0.1, 0.1, '#8b5a3c', 0, 0.02, 0, false, 8);
  }
}

export function lightUp(lights) {
  lights.hemi.intensity = 0.92; lights.hemi.groundColor.set('#7fa860');
  lights.sun.intensity = 2.75; lights.sun.color.set('#ffe9c4');
}

// ---------- traffic: every vehicle gives way to everyone on foot ----------
// Staff and customers cross on the zebras only (main.js keeps their routes off the road), the player anywhere.
//   * a vehicle brakes for anyone in the space in front of it;
//   * nobody steps into the space a moving vehicle needs to stop in, or into a vehicle;
//   * after 4 s of a steady stream of staff, the vehicle takes its turn: those already crossing finish, the rest wait;
//   * a vehicle never queues on top of a zebra.
// Cost: a few box checks, only for the handful of people who are near the road.
export const LANE = 16.6, SOUTH_LANE = 14.84;
const NORTH = -62, SOUTH = 78, SPEED = 4.2, BRAKE = 16, SIDE = 0.22;
const CROSS = { z0: -12.4, z1: -8.5 }; // the car park junction
export function vehicle(g, hl, hw, dx = 0, dz = 1) {
  return { g, hl, hw, dx, dz, v: 0, held: 0, turnOfCar: false };
}
function reach(o) {
  const e = o.v > 0.05 ? 0.2 + o.v * o.v / (2 * BRAKE) : 0;
  return o.turnOfCar ? Math.max(e, 1.6) : e;
}
function inside(o, x, z, ext, pad) {
  const rx = x - o.g.position.x, rz = z - o.g.position.z, f = rx * o.dx + rz * o.dz;
  if (f <= -o.hl - pad || f >= o.hl + pad + ext) return false;
  return Math.abs(rx * o.dz - rz * o.dx) < o.hw + pad;
}
export function createTraffic(scene) {
  const cars = ['#ff7a66', '#5aa9ff', '#ffd34a', '#7fcf6a', '#b48cff'].map((col, i) => {
    const g = car(col);
    g.position.set(LANE, 0, -40 + i * 24); g.rotation.y = Math.PI;
    K.bakeStatic(g); scene.add(g);
    return vehicle(g, 1.28, 0.74, 0, -1);
  });
  const moving = [], near = [];
  let you = null;

  // how far may vehicle o go this frame?
  function advance(o, dt, max, mustStop = false) {
    const p = o.g.position, stopIn = o.v * o.v / (2 * BRAKE);
    let stop = mustStop, hard = false, people = false, player = false;
    // in the car's own turn it only waits for those already in its way
    const look = o.turnOfCar ? reach(o) : stopIn + 1.35;
    for (let i = 0; i < near.length; i++) {
      const q = near[i], rx = q.x - p.x, rz = q.z - p.z, f = rx * o.dx + rz * o.dz;
      if (f <= -o.hl || f >= o.hl + SIDE + look) continue;
      if (Math.abs(rx * o.dz - rz * o.dx) >= o.hw + (q === you ? 0.4 : SIDE - 0.01)) continue; // a wider berth for the player
      stop = people = true;
      if (q === you) player = true;
      if (f < o.hl + 0.5) hard = true;
    }
    for (let i = 0; i < moving.length; i++) {
      const b = moving[i];
      if (b === o || b.dx * o.dx + b.dz * o.dz < 0.7) continue; // only whoever drives in front, the same way
      const rx = b.g.position.x - p.x, rz = b.g.position.z - p.z, f = rx * o.dx + rz * o.dz;
      if (f <= 0 || Math.abs(rx * o.dz - rz * o.dx) >= o.hw + b.hw) continue;
      const gap = f - o.hl - b.hl;
      if (gap < stopIn + 0.8) { stop = true; if (gap < 0.35) hard = true; }
      // no room on the other side of a zebra: wait before it
      if (o.dz && b.v < 0.5) {
        for (const c of CROSSINGS) {
          const before = (c - p.z) * o.dz - o.hl - 1.0, room = gap - before - 2.0;
          if (before >= 0 && before < stopIn + 0.3 && gap > before && room < o.hl * 2 + 0.4) stop = true;
        }
      }
    }
    if (people) {
      o.held += dt;
      if (!player && o.held > 4) o.turnOfCar = true;
      if (player || o.held > 7) { o.held = 0; o.turnOfCar = false; }
    } else if (o.v > 1.5) { o.held = 0; o.turnOfCar = false; }
    o.v = hard ? 0 : stop ? Math.max(0, o.v - BRAKE * dt) : Math.min(max, o.v + 6 * dt);
    return o.v * dt;
  }

  return {
    cars,
    // the car park's cars that are driving, and the order truck
    begin(others, people, player) {
      moving.length = near.length = 0;
      for (const c of cars) moving.push(c);
      for (const o of others) moving.push(o);
      you = player;
      for (const q of people) {
        const p = q.p.root.position;
        if (p.x < 12.6 || p.x > 29) { q.tx = p.x; q.tz = p.z; continue; }
        if (q.tx !== undefined) hold(q, p);
        q.tx = p.x; q.tz = p.z;
        near.push(p);
      }
      // the player is never held back, only kept out of the bodywork
      for (const o of moving) {
        if (!inside(o, player.x, player.z, 0, 0.36)) continue;
        const rx = player.x - o.g.position.x, rz = player.z - o.g.position.z;
        const f = rx * o.dx + rz * o.dz, l = rx * o.dz - rz * o.dx;
        let nf = f, nl = l;
        if (o.hl - Math.abs(f) < o.hw - Math.abs(l)) nf = (f < 0 ? -1 : 1) * (o.hl + 0.36);
        else nl = (l < 0 ? -1 : 1) * (o.hw + 0.36);
        player.x = o.g.position.x + nf * o.dx + nl * o.dz;
        player.z = o.g.position.z + nf * o.dz - nl * o.dx;
      }
      near.push(player);
    },
    advance,
    update(dt, parked) {
      let junction = false;
      for (const c of parked) {
        const p = c.g.position;
        if (c.body.dx && p.x > 15.2 && p.x < 17.9 && p.z > CROSS.z0 && p.z < CROSS.z1) junction = true;
      }
      for (const c of cars) {
        const p = c.g.position, front = p.z - c.hl;
        p.z -= advance(c, dt, SPEED, junction && front >= CROSS.z1 && front < CROSS.z1 + 1.2);
        // back to the far south (off screen) once there is room
        if (p.z < NORTH) p.z = cars.every((o) => o === c || o.g.position.z < SOUTH - 5) ? SOUTH : NORTH;
      }
    },
    junctionBusy() { return cars.some((c) => c.g.position.z - c.hl < CROSS.z1 + 0.7 && c.g.position.z + c.hl > CROSS.z0); },
  };

  function refused(o, q, x, z) {
    if (inside(o, x, z, 0, SIDE) && !inside(o, q.tx, q.tz, 0, SIDE)) return true;
    const e = reach(o);
    return e > 0 && inside(o, x, z, e, SIDE) && !inside(o, q.tx, q.tz, e, SIDE);
  }
  // a step into a vehicle's space is taken back, or turned into a step along it
  function hold(q, p) {
    if (!moving.some((o) => refused(o, q, p.x, p.z))) { if (q.waits) q.waits--; return; }
    // last resort against a jam: after 8 s of waiting they squeeze through
    q.waits = (q.waits || 0) + 1;
    if (q.waits > 240) return;
    if (!moving.some((o) => refused(o, q, p.x, q.tz))) { p.z = q.tz; return; }
    p.x = q.tx;
    if (moving.some((o) => refused(o, q, p.x, p.z))) p.z = q.tz;
  }
}
