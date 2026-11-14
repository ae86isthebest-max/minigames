// Shared cartoon style kit: palette, lighting, cached materials/geometry, rounded props and the capsule people.
// Every game in the series builds its world from these pieces so they all look the same.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'rbox';
import { mergeGeometries } from 'bgu';

// Pastel palette. Shadows are never painted: the lighting turns each colour into a darker tint of itself.
export const C = {
  grass: '#b6e46a', grass2: '#a5d85a', grass3: '#c6ec7e', dirt: '#f1d49a', dirt2: '#e6c283',
  floor: '#ffd08e', floor2: '#ffc67d', wall: '#dfe7ee', wallTrim: '#8fd1c4', wallDark: '#b9c6d2',
  wood: '#d9935a', woodDark: '#b8733f', woodLight: '#efb27a', roof: '#ff8a6b', roofDark: '#e8694d',
  white: '#fbfaf5', cream: '#fff3dd', red: '#ff5a4e', green: '#59c25b', leaf: '#4fae4f', yellow: '#ffd34a',
  blue: '#5aa9ff', pink: '#ff7eb6', purple: '#a98bff', orange: '#ff9f43', brown: '#8b5a3c', grey: '#aab2bd',
  skin: '#ffd9b8', road: '#9aa1ab', roadLine: '#fff4c9', water: '#7fd3ff', money: '#5fcf6a', moneyDark: '#3fae4c',
};

const matCache = new Map();
export function mat(hex) {
  let m = matCache.get(hex);
  if (!m) { m = new THREE.MeshLambertMaterial({ color: hex }); matCache.set(hex, m); }
  return m;
}

const geoCache = new Map();
function cached(key, make) {
  let g = geoCache.get(key);
  if (!g) { g = make(); geoCache.set(key, g); }
  return g;
}
export const G = {
  rbox: (w, h, d, r = 0.08, s = 3) => cached('rb' + [w, h, d, r, s], () => new RoundedBoxGeometry(w, h, d, s, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001))),
  sphere: (r, ws = 14, hs = 10) => cached('sp' + [r, ws, hs], () => new THREE.SphereGeometry(r, ws, hs)),
  cyl: (rt, rb, h, s = 14) => cached('cy' + [rt, rb, h, s], () => new THREE.CylinderGeometry(rt, rb, h, s)),
  capsule: (r, l, s = 10) => cached('ca' + [r, l, s], () => new THREE.CapsuleGeometry(r, l, 4, s)),
  cone: (r, h, s = 10) => cached('co' + [r, h, s], () => new THREE.ConeGeometry(r, h, s)),
  plane: (w, d) => cached('pl' + [w, d], () => { const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); return g; }),
  circle: (r, s = 24) => cached('ci' + [r, s], () => { const g = new THREE.CircleGeometry(r, s); g.rotateX(-Math.PI / 2); return g; }),
  prism: (w, h, d) => cached('pr' + [w, h, d], () => {
    // roof: triangular prism along x
    const s = new THREE.Shape(); s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 });
    g.translate(0, 0, -w / 2); g.rotateY(Math.PI / 2); return g;
  }),
};

export function mesh(geo, color, cast = true, recv = true) {
  const m = new THREE.Mesh(geo, mat(color));
  m.castShadow = cast; m.receiveShadow = recv;
  return m;
}
export function add(parent, m, x = 0, y = 0, z = 0) { m.position.set(x, y, z); parent.add(m); return m; }

export function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.NoToneMapping;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  return r;
}

// Warm sky light + green-tinted bounce from the grass + one soft sun. Shadow side = sky/bounce only.
export function makeLights(scene) {
  const hemi = new THREE.HemisphereLight('#fff6e6', '#c3e08a', 1.55);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff1d6', 1.75);
  sun.position.set(-9, 18, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 22; sc.bottom = -22; sc.near = 1; sc.far = 60;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun); scene.add(sun.target);
  return { hemi, sun, follow(x, z) { sun.position.set(x - 9, 18, z + 7); sun.target.position.set(x, 0, z); } };
}

// Soft round contact shadow under moving things (cheap, always the same darker-green tint on grass)
const blobTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 4, 32, 32, 31);
  gr.addColorStop(0, 'rgba(40,70,20,0.35)'); gr.addColorStop(1, 'rgba(40,70,20,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false });
export function blob(r) {
  const m = new THREE.Mesh(G.plane(r * 2, r * 2), blobMat);
  m.position.y = 0.012; m.renderOrder = 1;
  return m;
}

// Faceless capsule person. Root sits at the feet, faces +z. Call anim(dt, speed01) every frame.
export function person(opt = {}) {
  const body = opt.body || C.pink, root = new THREE.Group(), rig = new THREE.Group();
  root.add(rig);
  root.add(blob(0.55));
  const torso = add(rig, mesh(G.capsule(0.3, 0.32), body), 0, 0.66, 0);
  const head = add(rig, mesh(G.sphere(0.31, 18, 14), opt.head || body), 0, 1.28, 0);
  const legs = [], arms = [];
  for (const sx of [-1, 1]) {
    const pivot = add(rig, new THREE.Group(), sx * 0.13, 0.36, 0);
    add(pivot, mesh(G.capsule(0.1, 0.18), opt.legs || body), 0, -0.17, 0);
    legs.push(pivot);
    const ap = add(rig, new THREE.Group(), sx * 0.34, 0.82, 0);
    add(ap, mesh(G.sphere(0.1, 10, 8), opt.hands || body), 0, -0.2, 0);
    arms.push(ap);
  }
  if (opt.hat === 'straw') {
    add(head, mesh(G.cyl(0.46, 0.46, 0.05, 18), '#f3cf6a'), 0, 0.16, 0);
    add(head, mesh(G.cyl(0.24, 0.29, 0.2, 16), '#f3cf6a'), 0, 0.27, 0);
    add(head, mesh(G.cyl(0.295, 0.295, 0.06, 16), C.red), 0, 0.2, 0);
  } else if (opt.hat === 'cap') {
    add(head, mesh(G.sphere(0.3, 14, 8), opt.hatColor || C.blue), 0, 0.09, 0).scale.set(1.04, 0.62, 1.04);
    add(head, mesh(G.rbox(0.36, 0.05, 0.26, 0.02), opt.hatColor || C.blue), 0, 0.08, 0.26);
  } else if (opt.hat === 'crown') {
    add(head, mesh(G.cyl(0.2, 0.22, 0.14, 10), '#ffcf3a'), 0, 0.32, 0);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add(head, mesh(G.cone(0.05, 0.13, 5), '#ffcf3a'), Math.cos(a) * 0.17, 0.44, Math.sin(a) * 0.17); }
    add(head, mesh(G.sphere(0.045, 6, 5), '#ff5a8a'), 0, 0.33, 0.21);
  } else if (opt.hat === 'bun') {
    add(head, mesh(G.sphere(0.14, 10, 8), opt.hatColor || C.brown), 0, 0.3, -0.08);
  }
  if (opt.apron) add(torso, mesh(G.rbox(0.42, 0.42, 0.08, 0.04), opt.apron), 0, -0.05, 0.27);
  const back = add(rig, new THREE.Group(), 0, 0.5, -0.42);
  const front = add(rig, new THREE.Group(), 0, 0.55, 0.45);
  let ph = Math.random() * 6, amt = 0;
  return {
    root, rig, head, back, front, arms,
    anim(dt, move) {
      amt += (move - amt) * Math.min(1, dt * 10);
      ph += dt * (4 + 7 * amt);
      const s = Math.sin(ph), a = Math.abs(s);
      rig.position.y = amt * a * 0.09 + (1 - amt) * Math.sin(ph * 0.35) * 0.012;
      rig.rotation.x = amt * 0.12;
      rig.scale.set(1 + amt * a * 0.03, 1 - amt * a * 0.05 + (1 - amt) * Math.sin(ph * 0.35) * 0.01, 1 + amt * a * 0.03);
      legs[0].rotation.x = s * 0.75 * amt; legs[1].rotation.x = -s * 0.75 * amt;
      arms[0].rotation.x = -s * 0.6 * amt; arms[1].rotation.x = s * 0.6 * amt;
    },
  };
}

// Dashed rounded square texture for unlock zones
export function dashTexture(color = 'rgba(255,255,255,0.95)') {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.strokeStyle = color; g.lineWidth = 16; g.lineCap = 'round'; g.setLineDash([34, 26]);
  const r = 46, p = 16, s = 256 - p * 2;
  g.beginPath();
  g.moveTo(p + r, p); g.arcTo(p + s, p, p + s, p + s, r); g.arcTo(p + s, p + s, p, p + s, r);
  g.arcTo(p, p + s, p, p, r); g.arcTo(p, p, p + s, p, r); g.closePath(); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

// Merge every static mesh under `group` into one mesh per material (far fewer draw calls on phones).
export function bake(group, target) {
  group.updateMatrixWorld(true);
  const buckets = new Map();
  group.traverse((o) => {
    if (!o.isMesh) return;
    const key = o.material.uuid + (o.castShadow ? 'c' : '') + (o.receiveShadow ? 'r' : '');
    let b = buckets.get(key);
    if (!b) { b = { mat: o.material, cast: o.castShadow, recv: o.receiveShadow, order: o.renderOrder, geos: [] }; buckets.set(key, b); }
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.applyMatrix4(o.matrixWorld);
    b.geos.push(g);
  });
  for (const b of buckets.values()) {
    const m = new THREE.Mesh(mergeGeometries(b.geos, false), b.mat);
    m.castShadow = b.cast; m.receiveShadow = b.recv; m.renderOrder = b.order;
    target.add(m);
    b.geos.forEach((g) => g.dispose());
  }
}
