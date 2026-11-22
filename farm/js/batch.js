// Frame-cost saver. Every frame:
//   1. whole things (a person, a building, a car) out of view are skipped, matrices and all;
//   2. meshes with the same geometry and look are drawn as one instanced mesh;
//   3. the renderer gets that short list instead of walking the ~6000 objects of the scene twice.
// Nothing in the game changes: the original meshes stay where they are. farm/?nobatch turns it off to compare.
import * as THREE from 'three';

const CAST = 1, RECV = 2;
// how far outside the view a shadow caster still matters (the tallest house throws ~4 units)
const SHADOW_REACH = 5.6, EDGE_REACH = 0.3;

export function createBatcher(scene) {
  const groups = new Map(), used = [];
  const shownList = [];
  const frustum = new THREE.Frustum(), vp = new THREE.Matrix4(), sphere = new THREE.Sphere();
  const tinted = new Map(), copies = new Map();
  let stamp = 0;
  const kept = [], none = [];

  // plain coloured Lambert materials differ only in colour: one white material + a colour per instance
  function isPlain(m) {
    return !!m.isMeshLambertMaterial && !m.vertexColors && !m.map && !m.transparent && m.side === THREE.FrontSide && m.emissive.getHex() === 0; // must be a real boolean (the two draw passes compare it)
  }
  // instanced and single meshes must not share a material, or three.js switches programs for every object
  function materialFor(m, plain) {
    if (plain) {
      if (!tinted.has('w')) tinted.set('w', new THREE.MeshLambertMaterial({ color: 0xffffff }));
      return tinted.get('w');
    }
    let c = copies.get(m);
    if (!c) {
      c = m.clone();
      // clone() leaves these two behind (the outline shader needs them)
      c.onBeforeCompile = m.onBeforeCompile;
      c.customProgramCacheKey = m.customProgramCacheKey;
      copies.set(m, c);
    }
    return c;
  }
  function makeInstanced(G, n) {
    if (G.im) G.im.dispose();
    const im = new THREE.InstancedMesh(G.geometry, materialFor(G.material, G.plain), n === 1 ? 1 : Math.max(8, n * 2));
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    if (G.plain) {
      im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(im.instanceMatrix.count * 3), 3);
      im.instanceColor.setUsage(THREE.DynamicDrawUsage);
    }
    im.castShadow = !!(G.flags & CAST); im.receiveShadow = !!(G.flags & RECV); im.renderOrder = G.order;
    im.frustumCulled = false; im.matrixAutoUpdate = false;
    G.im = im;
  }

  // how far a top-level object reaches from its position; re-measured about once a second (stacks grow)
  const measured = new WeakMap(), ball = new THREE.Sphere();
  function reachOf(root, index) {
    let e = measured.get(root);
    if (e && (stamp + index) % 60) return e;
    root.updateMatrixWorld();
    const x = root.matrixWorld.elements[12], y = root.matrixWorld.elements[13], z = root.matrixWorld.elements[14];
    let r = e ? e.r : 0, always = false, cast = false;
    root.traverse((o) => {
      if (o.isLight) always = true;
      if (!o.isMesh) return;
      if (!o.frustumCulled) { always = true; return; }
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      ball.copy((o.isInstancedMesh && o.boundingSphere) || o.geometry.boundingSphere).applyMatrix4(o.matrixWorld);
      r = Math.max(r, Math.hypot(ball.center.x - x, ball.center.y - y, ball.center.z - z) + ball.radius);
      cast = cast || o.castShadow;
    });
    e = { r: always ? Infinity : r, cast };
    measured.set(root, e);
    return e;
  }
  function visit(o) {
    if (o.isLight) { o.updateMatrixWorld(); shownList.push(o); return; }
    if (!o.visible) return;
    if (o.matrixAutoUpdate) o.updateMatrix();
    if (o.parent === scene) o.matrixWorld.copy(o.matrix);
    else o.matrixWorld.multiplyMatrices(o.parent.matrixWorld, o.matrix);
    if (o.isMesh) {
      if (o.isInstancedMesh || !o.frustumCulled) shownList.push(o);
      else consider(o);
    } else if (o.isPoints || o.isLine || o.isSprite) shownList.push(o);
    const kids = o.children;
    for (let i = 0; i < kids.length; i++) visit(kids[i]);
  }
  function visitRoot(o, i) {
    if (o.isLight) return visit(o);
    if (!o.visible) return;
    const e = reachOf(o, i);
    if (e.r !== Infinity) {
      sphere.center.copy(o.position);
      // a little spare room for popping in and bobbing
      sphere.radius = e.r + 0.8 + (e.cast ? SHADOW_REACH : EDGE_REACH);
      if (!frustum.intersectsSphere(sphere)) return;
    }
    visit(o);
  }
  function consider(o) {
    const geo = o.geometry, m = o.material;
    if (!geo.boundingSphere) geo.computeBoundingSphere();
    sphere.copy(geo.boundingSphere).applyMatrix4(o.matrixWorld);
    sphere.radius += o.castShadow ? SHADOW_REACH : EDGE_REACH;
    if (!frustum.intersectsSphere(sphere)) return;
    // see-through things depend on their drawing order: only the soft blob shadows (order 1) are batched
    if (m.transparent && o.renderOrder !== 1) { shownList.push(o); return; }
    let plain = m.userData.batchPlain;
    if (plain === undefined) plain = m.userData.batchPlain = isPlain(m);
    const flags = (o.castShadow ? CAST : 0) | (o.receiveShadow ? RECV : 0);
    const key = ((plain ? 0 : m.id) * 64 + o.renderOrder * 4 + flags);
    let byLook = groups.get(geo);
    if (!byLook) groups.set(geo, byLook = new Map());
    let G = byLook.get(key);
    if (!G) byLook.set(key, G = { geometry: geo, material: m, plain, flags, order: o.renderOrder, list: [], im: null, at: 0 });
    if (G.at !== stamp) { G.at = stamp; G.list.length = 0; used.push(G); }
    G.list.push(o);
  }

  function update(camera) {
    stamp++;
    used.length = 0;
    shownList.length = 0;
    camera.updateMatrixWorld();
    frustum.setFromProjectionMatrix(vp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    const roots = scene.children;
    for (let i = 0; i < roots.length; i++) visitRoot(roots[i], i);
    // tinted batches last: the shadow pass changes program whenever coloured and uncoloured batches alternate
    for (let pass = 0; pass < 2; pass++) for (const G of used) {
      if (G.plain !== (pass === 1)) continue;
      const list = G.list, n = list.length;
      if (!G.im || G.im.instanceMatrix.count < n) makeInstanced(G, n);
      const im = G.im, mats = im.instanceMatrix.array, cols = G.plain ? im.instanceColor.array : null;
      // most things stand still: only upload what changed
      let moved = false, recoloured = false;
      for (let i = 0; i < n; i++) {
        const o = list[i], e = o.matrixWorld.elements, at = i * 16;
        for (let k = 0; k < 16; k++) { const v = Math.fround(e[k]); if (mats[at + k] !== v) { mats[at + k] = v; moved = true; } }
        if (cols) {
          const c = o.material.color, r = Math.fround(c.r), g = Math.fround(c.g), b = Math.fround(c.b), j = i * 3;
          if (cols[j] !== r || cols[j + 1] !== g || cols[j + 2] !== b) { cols[j] = r; cols[j + 1] = g; cols[j + 2] = b; recoloured = true; }
        }
      }
      im.count = n; shownList.push(im);
      if (moved) { im.instanceMatrix.clearUpdateRanges(); im.instanceMatrix.addUpdateRange(0, n * 16); im.instanceMatrix.needsUpdate = true; }
      if (recoloured) { im.instanceColor.clearUpdateRanges(); im.instanceColor.addUpdateRange(0, n * 3); im.instanceColor.needsUpdate = true; }
    }
  }

  return {
    render(renderer, camera) {
      update(camera);
      // the renderer sees only the short list; its members must not bring their children along
      const roots = scene.children;
      for (const o of shownList) if (o.children.length) { kept.push(o, o.children); o.children = none; }
      scene.children = shownList;
      scene.matrixWorldAutoUpdate = false;
      try { renderer.render(scene, camera); } finally {
        scene.children = roots;
        scene.matrixWorldAutoUpdate = true;
        for (let i = 0; i < kept.length; i += 2) kept[i].children = kept[i + 1];
        kept.length = 0;
      }
    },
  };
}
