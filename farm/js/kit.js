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
  if (!m) {
    // a touch more vivid than the palette value (saturation +15%, lightness +2%)
    const c = new THREE.Color(hex), hsl = {};
    c.getHSL(hsl); c.setHSL(hsl.h, Math.min(1, hsl.s * 1.15), Math.min(0.97, hsl.l + 0.02));
    m = new THREE.MeshLambertMaterial({ color: c }); matCache.set(hex, m);
  }
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

// Thin dark outline: the same geometry drawn again, back faces only, pushed out along its normals.
const OUTLINE_COL = '#3a2a22';
const olCache = new Map();
export function outlineMat(th, col = OUTLINE_COL) {
  let m = olCache.get(th + col);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color: col, side: THREE.BackSide });
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  transformed += normalize(normal) * ' + th.toFixed(4) + ';');
    };
    m.customProgramCacheKey = () => 'ol' + th;
    olCache.set(th + col, m);
  }
  return m;
}
export let OUTLINE = 0.028;
export function setOutline(th) { OUTLINE = th; }
// every solid (shadow-casting) prop gets the outline; flat ground pieces don't
export function mesh(geo, color, cast = true, recv = true) {
  const m = new THREE.Mesh(geo, mat(color));
  m.castShadow = cast; m.receiveShadow = recv;
  if (cast && OUTLINE > 0) { const o = new THREE.Mesh(geo, outlineMat(OUTLINE)); o.userData.outline = true; m.add(o); }
  return m;
}
// goods (eggs, corn, money…) are small, so they get a slightly thicker, darker edge to stand out
const ITEM_OL = 0.036, ITEM_OL_COL = '#241812';
export function itemEdge(g) {
  g.traverse((o) => { if (o.userData.outline) o.material = outlineMat(ITEM_OL, ITEM_OL_COL); });
  return g;
}
export function add(parent, m, x = 0, y = 0, z = 0) { m.position.set(x, y, z); parent.add(m); return m; }

export function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.NoToneMapping;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); setTimeout(() => location.reload(), 400); });
  return r;
}

// Warm sky light + green-tinted bounce from the grass + one soft sun. Shadow side = sky/bounce only.
export function makeLights(scene) {
  const hemi = new THREE.HemisphereLight('#fff6e8', '#a8d066', 1.18);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff3dc', 2.4);
  sun.position.set(-9, 18, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 22; sc.bottom = -22; sc.near = 1; sc.far = 60;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun); scene.add(sun.target);
  // follow the player, but move the shadow camera in whole shadow-map texels so shadows don't shimmer
  const dir = new THREE.Vector3(9, -18, -7).normalize();
  const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, dir).normalize();
  const texel = (sc.right - sc.left) / sun.shadow.mapSize.x, p = new THREE.Vector3(), q = new THREE.Vector3();
  return {
    hemi, sun,
    follow(x, z) {
      p.set(x, 0, z);
      const r = Math.round(p.dot(right) / texel) * texel, u = Math.round(p.dot(up) / texel) * texel, d = p.dot(dir);
      q.copy(right).multiplyScalar(r).addScaledVector(up, u).addScaledVector(dir, d);
      sun.target.position.copy(q);
      sun.position.copy(q).addScaledVector(dir, -21);
    },
  };
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
const personCache = new Map();
export function person(opt = {}) {
  const prevOL = OUTLINE; OUTLINE = 0.038;
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
  const hatG = new THREE.Group(); hatG.position.set(0, 1.28, 0);
  if (opt.hat === 'straw') {
    add(hatG, mesh(G.cyl(0.46, 0.46, 0.05, 18), '#f3cf6a'), 0, 0.16, 0);
    add(hatG, mesh(G.cyl(0.24, 0.29, 0.2, 16), '#f3cf6a'), 0, 0.27, 0);
    add(hatG, mesh(G.cyl(0.295, 0.295, 0.06, 16), C.red), 0, 0.2, 0);
  } else if (opt.hat === 'cap') {
    add(hatG, mesh(G.sphere(0.3, 14, 8), opt.hatColor || C.blue), 0, 0.09, 0).scale.set(1.04, 0.62, 1.04);
    add(hatG, mesh(G.rbox(0.36, 0.05, 0.26, 0.02), opt.hatColor || C.blue), 0, 0.08, 0.26);
  } else if (opt.hat === 'crown') {
    add(hatG, mesh(G.cyl(0.2, 0.22, 0.14, 10), '#ffcf3a'), 0, 0.32, 0);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add(hatG, mesh(G.cone(0.05, 0.13, 5), '#ffcf3a'), Math.cos(a) * 0.17, 0.44, Math.sin(a) * 0.17); }
    add(hatG, mesh(G.sphere(0.045, 6, 5), '#ff5a8a'), 0, 0.33, 0.21);
  } else if (opt.hat === 'bun') {
    add(hatG, mesh(G.sphere(0.14, 10, 8), opt.hatColor || C.brown), 0, 0.3, -0.08);
  }
  if (opt.apron) add(torso, mesh(G.rbox(0.42, 0.42, 0.08, 0.04), opt.apron), 0, -0.05, 0.27);
  OUTLINE = prevOL;
  // body, head and hat never move relative to each other: one mesh (+ one outline) instead of many
  const statics = [];
  for (const m of [torso, head]) m.traverse((o) => { if (o.isMesh) statics.push(o); });
  rig.updateMatrixWorld(true);
  // the merged body is cached per look: hundreds of customers come and go, and a fresh merged mesh for
  // each one was never freed (memory kept growing until the phone's browser reloaded the page)
  const key = [body, opt.head || '', opt.apron || ''].join('|');
  let proto = personCache.get(key);
  if (!proto) { proto = mergeList(statics, rig.matrixWorld.clone().invert()); personCache.set(key, proto); }
  const merged = proto.map((m) => { const n = new THREE.Mesh(m.geometry, m.material); n.castShadow = m.castShadow; n.receiveShadow = m.receiveShadow; n.renderOrder = m.renderOrder; return n; });
  rig.remove(torso); rig.remove(head);
  for (const m of merged) rig.add(m);
  if (hatG.children.length) rig.add(hatG);
  // small limbs don't need their own sun shadow (the body casts one, and the soft blob sits under the feet)
  for (const l of legs.concat(arms)) l.traverse((o) => { if (o.isMesh) o.castShadow = false; });
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

// ---------- static merging (fewer draw calls on phones) ----------
// Solid Lambert meshes of any colour merge into ONE vertex-coloured mesh; everything else (outlines, glass,
// soft shadows, textured signs) merges per material. Parts marked userData.dyn (and their children) are skipped.
const vcMat = new THREE.MeshLambertMaterial({ vertexColors: true });
function prepGeo(o, m4, keepUv, keepColor) {
  const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
  for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal' && !(keepUv && name === 'uv') && !(keepColor && name === 'color')) g.deleteAttribute(name);
  if (keepUv && !g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  g.applyMatrix4(m4);
  return g;
}
function mergeList(list, rootInv) {
  const buckets = new Map(), m4 = new THREE.Matrix4();
  for (const o of list) {
    const mat = o.material, flags = (o.castShadow ? 'c' : '') + (o.receiveShadow ? 'r' : '');
    const vc = mat.isMeshLambertMaterial && !mat.transparent && !mat.map;
    const key = (vc ? 'vc' : mat.uuid) + flags;
    let b = buckets.get(key);
    if (!b) { b = { vc, mat, cast: o.castShadow, recv: o.receiveShadow, order: o.renderOrder, geos: [] }; buckets.set(key, b); }
    m4.multiplyMatrices(rootInv, o.matrixWorld);
    // a mesh that was merged before already carries its colours per vertex: keep them
    const had = vc && mat.vertexColors && !!o.geometry.attributes.color;
    const g = prepGeo(o, m4, !vc, had);
    if (vc && !had) {
      const n = g.attributes.position.count, arr = new Float32Array(n * 3), c = mat.color;
      for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
      g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    }
    b.geos.push(g);
  }
  const out = [];
  for (const b of buckets.values()) {
    const m = new THREE.Mesh(mergeGeometries(b.geos, false), b.vc ? vcMat : b.mat);
    m.castShadow = b.cast; m.receiveShadow = b.recv; m.renderOrder = b.order;
    out.push(m);
    b.geos.forEach((g) => g.dispose());
  }
  return out;
}
function isDyn(o, root) { for (let p = o; p && p !== root; p = p.parent) if (p.userData.dyn) return true; return root.userData.dyn === true && false; }
// merge the static parts of `group` in place (dynamic parts stay as they are)
export function bakeStatic(group) {
  group.updateMatrixWorld(true);
  const list = [];
  group.traverse((o) => { if (o.isMesh && !isDyn(o, group)) list.push(o); });
  if (list.length < 3) return;
  const inv = group.matrixWorld.clone().invert();
  const merged = mergeList(list, inv);
  for (const o of list) if (o.parent) o.parent.remove(o);
  for (const m of merged) group.add(m);
}
// merge everything under `group` into `target` (world space), used for the scenery
export function bake(group, target) {
  group.updateMatrixWorld(true);
  const list = [];
  group.traverse((o) => { if (o.isMesh) list.push(o); });
  for (const m of mergeList(list, new THREE.Matrix4())) target.add(m);
}
