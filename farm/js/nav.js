// Grid path-finding so workers walk around walls, fences and buildings instead of through them.
// Shared by every map: createNav(colliders, bounds) → { dirty(), path(sx, sz, tx, tz) }.
export function createNav(colliders, b, cell = 0.5, radius = 0.35) {
  const W = Math.ceil((b.x1 - b.x0) / cell), H = Math.ceil((b.z1 - b.z0) / cell);
  let grid = null, stale = true;
  const cx = (i) => b.x0 + (i + 0.5) * cell, cz = (j) => b.z0 + (j + 0.5) * cell;
  const ci = (x) => Math.max(0, Math.min(W - 1, Math.floor((x - b.x0) / cell)));
  const cj = (z) => Math.max(0, Math.min(H - 1, Math.floor((z - b.z0) / cell)));
  function rebuild() {
    grid = new Uint8Array(W * H);
    for (const c of colliders) {
      const i0 = ci(c.x0 - radius), i1 = ci(c.x1 + radius), j0 = cj(c.z0 - radius), j1 = cj(c.z1 + radius);
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const x = cx(i), z = cz(j);
        if (x > c.x0 - radius && x < c.x1 + radius && z > c.z0 - radius && z < c.z1 + radius) grid[j * W + i] = 1;
      }
    }
    stale = false;
  }
  const free = (i, j) => i >= 0 && j >= 0 && i < W && j < H && !grid[j * W + i];
  function nearestFree(i, j) {
    if (free(i, j)) return [i, j];
    for (let r = 1; r < 12; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
      if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
      if (free(i + di, j + dj)) return [i + di, j + dj];
    }
    return null;
  }
  // straight walk possible between two points?
  function clear(x0, z0, x1, z1) {
    const d = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(d / (cell * 0.16)); // fine steps: lamp posts and tree trunks are thin
    for (let k = 1; k < n; k++) { const t = k / n; if (!free(ci(x0 + (x1 - x0) * t), cj(z0 + (z1 - z0) * t))) return false; }
    return true;
  }
  const g = new Float32Array(W * H), from = new Int32Array(W * H), seen = new Uint32Array(W * H);
  let stamp = 0;
  function path(sx, sz, tx, tz) {
    if (stale) rebuild();
    if (clear(sx, sz, tx, tz) && free(ci(tx), cj(tz))) return [[tx, tz]];
    const s = nearestFree(ci(sx), cj(sz)), t = nearestFree(ci(tx), cj(tz));
    if (!s || !t) return [[tx, tz]];
    stamp++;
    const start = s[1] * W + s[0], goal = t[1] * W + t[0];
    const heap = [];
    const push = (k, f) => { heap.push([f, k]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    const hx = t[0], hz = t[1], h = (i, j) => Math.hypot(i - hx, j - hz);
    g[start] = 0; from[start] = -1; seen[start] = stamp; push(start, h(s[0], s[1]));
    let found = false, guard = 0;
    while (heap.length && guard++ < 40000) {
      const [, k] = pop();
      if (k === goal) { found = true; break; }
      const i = k % W, j = (k / W) | 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const ni = i + di, nj = j + dj;
        if (!free(ni, nj)) continue;
        if (di && dj && (!free(i + di, j) || !free(i, j + dj))) continue; // no corner cutting
        const nk = nj * W + ni, ng = g[k] + (di && dj ? 1.4142 : 1);
        if (seen[nk] === stamp && ng >= g[nk]) continue;
        seen[nk] = stamp; g[nk] = ng; from[nk] = k; push(nk, ng + h(ni, nj));
      }
    }
    if (!found) return [[tx, tz]];
    const cells = [];
    for (let k = goal; k !== -1; k = from[k]) cells.push([cx(k % W), cz((k / W) | 0)]);
    cells.reverse();
    // string-pull: keep only the corners needed for straight walks
    const out = [];
    let ax = sx, az = sz, i = 0;
    while (i < cells.length) {
      let j = cells.length - 1;
      while (j > i && !clear(ax, az, cells[j][0], cells[j][1])) j--;
      out.push(cells[j]); ax = cells[j][0]; az = cells[j][1]; i = j + 1;
    }
    if (free(ci(tx), cj(tz))) out.push([tx, tz]);
    return out;
  }
  return { dirty() { stale = true; }, path, free: (x, z) => { if (stale) rebuild(); return free(ci(x), cj(z)); } };
}
