/* =========================================================
   俯視（高角度）走動畫面：一個房間一個畫面，可以四面八方走
   - 跟 world.js（橫向）同一套對外的用法：WORLD.mount / goTo / standIn / goSpot …
     index.html 不用知道現在是哪一種；def.top 有寫就用這一個
   - 房間：def.top.rooms[房間 id] = {
       w, h               房間大小（可以比畫面大，鏡頭跟著主角）
       wall               上面那幅牆（正面）有多高；牆上不能走
       floor(p, g, t, o)  地板、牆、窗、地上的東西（在人後面）
       props: [{ y, draw(p, g, t, o) }]   有高度的家具：y＝它貼地那條線，人站得比它低（y 大）就畫在它前面
       solid: [[x, y, w, h], …]           走不過去的地方（家具的腳底那一塊，不是整張圖）
       exits: [{ r:[x,y,w,h], to:房間 id, at:[x,y], label, kind:"door"|"up"|"down"|"out" }]
                                          門、樓梯、出口：走到 r 就換到 to 房間，站在 at
     }
   - 證物／小細節的位置：hooks.spots() 每一項 { r:[x,y,w,h], walk:x, wy:y, room }，walk/wy＝查的時候站哪裡
   - 人：hooks.people() 每一項 { id, x, y, room, pose, facing, view, L }
   - 人物用 sprite2.js（SP）畫：左右走＝側面，上下走＝正面／背面
   - 存檔不記任何走動的位置（跟橫向一樣），換畫面不影響存檔
   ========================================================= */
const TOPW = (() => {
  const VW = 288, VH = 162, SPEED = 58, CELL = 4, FOOT_W = 7, FOOT_H = 3;
  const st = {};
  let cur = null;
  const P = () => PX.prim;
  const PATROL = "#e9e4da";
  const carOf = def => def && def.car !== undefined ? def.car : (typeof C !== "undefined" && C && C.car !== undefined ? C.car : PATROL);
  const rooms = () => cur.def.top.rooms;
  const roomOf = id => rooms()[id];
  const firstRoom = def => def.top.start || Object.keys(def.top.rooms)[0];

  function state(lid, def){
    if (st[lid]) return st[lid];
    def = def || (cur && cur.def);
    const room = firstRoom(def), R = def.top.rooms[room], sp = def.top.spawn || [R.w / 2, R.h - 20];
    return st[lid] = { room, px:sp[0], py:sp[1], path:[], dir:"up", face:1, walkD:0, walking:false,
      bx:sp[0] - 14, by:sp[1] + 6, broom:room, bdir:"up", bface:1, bwalkD:0, bmove:false, trail:[], cam:[0, 0], t:0,
      script:null, si:0, sT:0, typed:"", typeKey:"", fade:0, fadeTo:null, after:null, door:{}, doorT:{}, use:null };
  }

  /* ---------- 走得到哪裡：格子地圖（4 格一格） ---------- */
  const gridCache = new Map();
  function gridOf(rid){
    const R = roomOf(rid), key = cur.lid + ":" + rid;
    let G = gridCache.get(key); if (G && G.R === R) return G;
    const gw = Math.ceil(R.w / CELL), gh = Math.ceil(R.h / CELL), block = new Uint8Array(gw * gh);
    const wall = R.wall || 0;
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++){
      const x = i * CELL + CELL / 2, y = j * CELL + CELL / 2;
      let b = y < wall + 2 || x < 4 || x > R.w - 4 || y > R.h - 2;
      if (!b) for (const s of (R.solid || [])) if (x > s[0] - FOOT_W && x < s[0] + s[2] + FOOT_W && y > s[1] - FOOT_H && y < s[1] + s[3] + FOOT_H){ b = true; break; }
      block[j * gw + i] = b ? 1 : 0;
    }
    // 出口那一塊一定走得到（門口、樓梯口常常貼著牆）
    (R.exits || []).forEach(e => { for (let j = Math.floor(e.r[1] / CELL); j <= Math.floor((e.r[1] + e.r[3]) / CELL); j++) for (let i = Math.floor(e.r[0] / CELL); i <= Math.floor((e.r[0] + e.r[2]) / CELL); i++) if (i >= 0 && j >= 0 && i < gw && j < gh) block[j * gw + i] = 0; });
    G = { R, gw, gh, block }; gridCache.set(key, G); return G;
  }
  const cellOf = (G, x, y) => [Math.max(0, Math.min(G.gw - 1, Math.floor(x / CELL))), Math.max(0, Math.min(G.gh - 1, Math.floor(y / CELL)))];
  const free = (G, i, j) => i >= 0 && j >= 0 && i < G.gw && j < G.gh && !G.block[j * G.gw + i];
  // 最近的一格走得到的地方（點在桌子上、牆上：走到旁邊）
  function nearestFree(G, i, j){
    if (free(G, i, j)) return [i, j];
    for (let r = 1; r < 40; r++){ let best = null, bd = 1e9;
      for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++){ if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
        if (free(G, i + di, j + dj)){ const d = di * di + dj * dj * 1.3 - (dj > 0 ? 0.5 : 0); if (d < bd){ bd = d; best = [i + di, j + dj]; } } }
      if (best) return best; }
    return [i, j];
  }
  function los(G, a, b){
    const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2);
    for (let k = 0; k <= n; k++){ const x = a[0] + (b[0] - a[0]) * k / n, y = a[1] + (b[1] - a[1]) * k / n, c = cellOf(G, x, y); if (!free(G, c[0], c[1])) return false; }
    return true;
  }
  // A*（八個方向），走完再把轉角拉直
  function findPath(rid, x0, y0, x1, y1){
    const G = gridOf(rid), s = nearestFree(G, ...cellOf(G, x0, y0)), g = nearestFree(G, ...cellOf(G, x1, y1));
    const goal = free(G, ...cellOf(G, x1, y1)) ? [x1, y1] : [g[0] * CELL + CELL / 2, g[1] * CELL + CELL / 2];
    if (los(G, [x0, y0], goal)) return [goal];
    const K = (i, j) => j * G.gw + i, open = [[0, s[0], s[1]]], came = new Map(), gs = new Map([[K(...s), 0]]);
    const h = (i, j) => Math.hypot(i - g[0], j - g[1]);
    let found = false, guard = 0;
    while (open.length && guard++ < 20000){
      let bi = 0; for (let k = 1; k < open.length; k++) if (open[k][0] < open[bi][0]) bi = k;
      const [, i, j] = open.splice(bi, 1)[0];
      if (i === g[0] && j === g[1]){ found = true; break; }
      for (const [di, dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
        const ni = i + di, nj = j + dj; if (!free(G, ni, nj)) continue;
        if (di && dj && (!free(G, i + di, j) || !free(G, i, j + dj))) continue;   // 不切牆角
        const ng = gs.get(K(i, j)) + (di && dj ? 1.414 : 1);
        if (ng < (gs.get(K(ni, nj)) ?? 1e9)){ gs.set(K(ni, nj), ng); came.set(K(ni, nj), [i, j]); open.push([ng + h(ni, nj), ni, nj]); }
      }
    }
    if (!found) return [goal];
    const cells = []; let c = g; while (c && !(c[0] === s[0] && c[1] === s[1])){ cells.unshift(c); c = came.get(K(...c)); }
    const pts = cells.map(([i, j]) => [i * CELL + CELL / 2, j * CELL + CELL / 2]); pts[pts.length - 1] = goal;
    // 拉直
    const out = []; let from = [x0, y0], k = 0;
    while (k < pts.length){ let far = k; for (let m = pts.length - 1; m > k; m--) if (los(G, from, pts[m])){ far = m; break; } out.push(pts[far]); from = pts[far]; k = far + 1; }
    return out;
  }
  // 房間之間怎麼走：找出口一路接過去（廣度優先）
  function roomRoute(from, to){
    if (from === to) return [];
    const prev = { [from]: null }, q = [from];
    while (q.length){ const r = q.shift(); for (const e of (roomOf(r).exits || [])){ if (!rooms()[e.to] || prev[e.to] !== undefined) continue; prev[e.to] = { r, e }; if (e.to === to){ q.length = 0; break; } q.push(e.to); } }
    if (prev[to] === undefined) return null;
    const out = []; let r = to; while (prev[r]){ out.unshift(prev[r].e); r = prev[r].r; }
    return out;
  }

  /* ---------- 同物件互動：主角做一個動作（開櫃、坐低、打電話……） ---------- */
  // q.act：動作名；q.actT：做幾耐（秒，冇寫＝做完一輪）；q.hold：做完停喺最後一格（例如坐低），點其他地方先郁；q.useAt：做動作時企喺邊（例如坐上椅）
  const ONCE = new Set(["openDoor", "drawer", "switch", "pickup", "reach", "give", "knock", "point"]);   // 做一次就停在最後一格（開門、拉櫃桶）
  function useSpot(q, done){
    const s = cur.s; faceTo(q.r);
    if (q.face) { s.dir = "side"; s.face = q.face; }
    if (q.act && SP.ACTS[q.act]){ const n = SP.frames(q.act), rate = q.rate || 5;
      if (q.useAt){ s.back = [s.px, s.py]; s.px = q.useAt[0]; s.py = q.useAt[1]; }
      s.use = { act:q.act, t:0, rate, n, dur:q.actT || n / rate, hold:!!q.hold, loop:!!(q.loop || (q.actT && !ONCE.has(q.act))), forever:!!q.loop && !q.actT }; }
    done && done();
  }
  function endUse(){ const s = cur.s; if (!s.use) return; if (s.back){ s.px = s.back[0]; s.py = s.back[1]; s.back = null; } s.use = null; }
  const doorKey = (room, e) => room + ">" + e.to;

  /* ---------- 走路 ---------- */
  // 走到 (x, y)（可以在別的房間），到了再做 cb
  function goThen(x, y, cb, room){
    const s = cur.s; room = room || s.room;
    const hops = roomRoute(s.room, room);
    if (!hops){ s.after = null; return; }
    s.plan = [...hops.map(e => ({ exit:e })), { x, y, room }];
    s.after = cb || null; nextLeg();
  }
  function nextLeg(){
    const s = cur.s, leg = s.plan && s.plan.shift();
    if (!leg){ s.path = []; const cb = s.after; s.after = null; if (cb) cb(); return; }
    if (leg.exit){ const e = leg.exit, c = [e.r[0] + e.r[2] / 2, e.r[1] + e.r[3] / 2]; s.path = findPath(s.room, s.px, s.py, c[0], c[1]); s.leg = leg; return; }
    s.path = findPath(s.room, s.px, s.py, leg.x, leg.y); s.leg = leg;
  }
  // 穿過門／樓梯：畫面暗一下再亮，換房間
  function useExit(e){
    const s = cur.s; s.fade = 0.001; s.fadeTo = e;
  }
  function arriveRoom(e){
    const s = cur.s; s.room = e.to; s.px = e.at[0]; s.py = e.at[1]; s.path = [];
    const back = [s.px < roomOf(e.to).w / 2 ? 18 : -18, 2];   // 拍檔站在旁邊（靠房間中間那一邊），不會疊在主角身上
    s.broom = e.to; s.bx = s.px + back[0]; s.by = s.py + back[1]; s.trail = [[s.bx, s.by], [s.px, s.py]];
    const R = roomOf(e.to); s.cam = camFor(R, s.px, s.py);
    s.dir = e.kind === "up" ? "up" : e.kind === "down" ? "down" : (s.px < R.w / 2 ? "side" : "side"); s.face = s.px < R.w / 2 ? 1 : -1;
    announce();
    nextLeg();
  }
  const camFor = (R, x, y) => [Math.max(0, Math.min(Math.max(0, R.w - VW), x - VW / 2)) - (R.w < VW ? (VW - R.w) / 2 : 0),
                               Math.max(0, Math.min(Math.max(0, R.h - VH), y - VH * 0.55)) - (R.h < VH ? (VH - R.h) / 2 : 0)];
  function announce(){ const s = cur.s; if (cur.hooks.areaNow) cur.hooks.areaNow(s.script ? null : s.room, !!s.script);
    // 第一次走進一個地方：主角自己說一句（跟 world.js 一樣，用 def.areas 的 text）
    if (!s.script && cur.hooks.onArea && cur.hooks.areaSeen && !cur.hooks.areaSeen(s.room)){
      const ar = (cur.def.areas || []).find(a => a.id === s.room), ph = (cur.hooks.opt() || {}).phase || 0;
      const text = !ar ? "" : typeof ar.text === "function" ? ar.text(ph) : Array.isArray(ar.text) ? ar.text[Math.min(ph, ar.text.length - 1)] : ar.text;
      if (text) s.areaSay = { text, until:s.t + 2 + text.length / 7 };
      cur.hooks.onArea(s.room); } }

  function moveAlong(dt){
    const s = cur.s;
    if (!s.path.length){ s.walking = false; return; }
    const [tx, ty] = s.path[0], dx = tx - s.px, dy = ty - s.py, d = Math.hypot(dx, dy), stp = SPEED * dt;
    s.walking = true;
    if (Math.abs(dx) > Math.abs(dy) * 0.8){ s.dir = "side"; s.face = dx > 0 ? 1 : -1; } else s.dir = dy < 0 ? "up" : "down";
    if (d <= stp){ s.px = tx; s.py = ty; s.walkD += d; s.path.shift();
      if (!s.path.length){ s.walking = false; const leg = s.leg; s.leg = null;
        if (leg && leg.exit){ if (leg.exit.kind === "door"){ s.dir = "up"; s.doorT[doorKey(s.room, leg.exit)] = s.t; s.use = { act:"openDoor", t:0, rate:9, n:4, dur:0.45, then:leg.exit }; } else useExit(leg.exit); } else nextLeg(); } }
    else { s.px += dx / d * stp; s.py += dy / d * stp; s.walkD += stp; }
    const last = s.trail[s.trail.length - 1]; if (!last || Math.hypot(last[0] - s.px, last[1] - s.py) > 3) s.trail.push([s.px, s.py]);
    if (s.trail.length > 200) s.trail.shift();
  }
  // 拍檔：沿著主角走過的路跟在後面（保持 16 格左右）
  function follow(dt){
    const s = cur.s; if (s.broom !== s.room) return;
    let tgt = null;
    for (let i = s.trail.length - 1; i >= 0; i--){ const p = s.trail[i]; if (Math.hypot(p[0] - s.px, p[1] - s.py) >= 18){ tgt = p; break; } }
    if (!tgt){ s.bmove = false; return; }
    const dx = tgt[0] - s.bx, dy = tgt[1] - s.by, d = Math.hypot(dx, dy);
    if (d < 2){ s.bmove = false; return; }
    const stp = Math.min(d, SPEED * 1.05 * dt); s.bx += dx / d * stp; s.by += dy / d * stp; s.bwalkD += stp; s.bmove = true;
    if (Math.abs(dx) > Math.abs(dy) * 0.8){ s.bdir = "side"; s.bface = dx > 0 ? 1 : -1; } else s.bdir = dy < 0 ? "up" : "down";
  }

  /* ---------- 開場劇情（只要 say／walk／set／wait／hide；車先略過） ---------- */
  const step = () => { const s = cur.s; return s.script && s.script[s.si]; };
  function startStep(){
    const s = cur.s, k = step(); s.sT = 0;
    if (!k){ s.script = null; cur.hooks.scriptDone(true); announce(); cur.hooks.refresh(); return; }
    if (k.set){ const o = k.set; if (o.room) s.room = o.room; if (o.px !== undefined){ s.px = o.px; s.py = o.py ?? s.py; s.path = []; s.bx = s.px - 14; s.by = s.py + 4; s.broom = s.room; s.trail = []; s.cam = camFor(roomOf(s.room), s.px, s.py); } }
    if (k.walk){ const [who, x, y] = k.walk; if (who === "you"){ s.plan = []; s.path = findPath(s.room, s.px, s.py, x, y ?? s.py); } else { s.bx = x; if (y !== undefined) s.by = y; } }
    if (!k.say && !k.walk && !k.wait) next();
  }
  function next(){ const s = cur.s; s.si++; s.readT = 0; startStep(); }
  function skip(){ const s = cur.s; let guard = 0;
    while (s.script && guard++ < 300){ const k = step(); if (k && k.walk && k.walk[0] === "you"){ s.px = k.walk[1]; if (k.walk[2] !== undefined) s.py = k.walk[2]; s.path = []; } next(); }
    s.cam = camFor(roomOf(s.room), s.px, s.py); }

  /* ---------- 每一格 ---------- */
  function update(dt){
    const s = cur.s, R = roomOf(s.room); s.t += dt;
    if (s.fade){ s.fade += dt * 5; if (s.fade >= 1 && s.fadeTo){ const e = s.fadeTo; s.fadeTo = null; arriveRoom(e); } if (s.fade >= 2) s.fade = 0; }
    else if (s.use && !s.walking){ const u = s.use; u.t += dt; if (!u.hold && !u.forever && u.t >= u.dur){ s.use = null; if (u.then) useExit(u.then); } }
    else moveAlong(dt);
    follow(dt);
    // 按住拖著：一路跟著手指走（只在這個房間裡）
    const h = cur.hold; if (h && h.moved && !s.script && !s.fade){ const [x, y] = toWorld(h.cx, h.cy); if (!s.lastHoldT || s.t - s.lastHoldT > 0.2){ s.lastHoldT = s.t; s.plan = []; s.after = null; s.path = findPath(s.room, s.px, s.py, x, y); } }
    const tgt = camFor(R, s.px, s.py); s.cam[0] += (tgt[0] - s.cam[0]) * Math.min(1, dt * 5); s.cam[1] += (tgt[1] - s.cam[1]) * Math.min(1, dt * 5);
    if (s.script){ const k = step(); s.sT += dt;
      if (k && k.walk && k.walk[0] === "you" && !s.path.length) next();
      else if (k && k.wait && s.sT >= k.wait) next(); }
    const b = bubbleNow(), key = b ? b.who + "|" + b.text : "";
    if (key !== s.typeKey){ s.typeKey = key; s.typed = ""; }
    if (b && s.typed.length < b.text.length) s.typed = b.text.slice(0, s.typed.length + Math.max(1, Math.round(dt * 40)));
    if (s.script && step() && step().say && b && s.typed.length >= b.text.length){ s.readT = (s.readT || 0) + dt; if (s.readT > 1.3 + b.text.length / 7) next(); }
  }
  function bubbleNow(){
    const s = cur.s;
    if (s.script){ const k = step(); return k && k.say ? { who:k.say[0], text:k.say[1], name:k.name } : null; }
    const hb = cur.hooks.bubble ? cur.hooks.bubble() : null;
    if (hb) return hb;
    if (s.flavor && s.t < s.flavor.until) return { who:"you", text:s.flavor.text };
    return s.areaSay && s.t < s.areaSay.until ? { who:"you", text:s.areaSay.text } : null;
  }

  /* ---------- 點擊 ---------- */
  function toWorld(cx, cy){ const r = cur.canvas.getBoundingClientRect(), s = cur.s; return [(cx - r.left) * VW / r.width + s.cam[0], (cy - r.top) * VH / r.height + s.cam[1]]; }
  const here = q => !q.room || q.room === cur.s.room;
  const onBody = (b, x, y) => Math.abs(x - b.x) <= 9 && y >= b.y - 40 && y <= b.y + 2;
  function tap(e){
    const { s, hooks } = cur, [x, y] = toWorld(e.clientX, e.clientY);
    if (s.use && s.use.then) return;
    if (s.use && !s.script) endUse();
    s.flavor = null;
    if (s.script){ s.lastTap = "script"; const k = step(); if (k && k.say){ if (s.typed.length < k.say[1].length) s.typed = k.say[1]; else next(); } return; }
    if (s.fade) return;
    const r = cur.canvas.getBoundingClientRect(), FING = Math.min(22, Math.max(10, 44 * VW / r.width));
    const inBox = (bx, by, bw, bh) => x >= bx && x <= bx + bw && y >= by && y <= by + bh;
    const big = q => { const mx = Math.max(4, (FING - q[2]) / 2), my = Math.max(4, (FING - q[3]) / 2); return [q[0] - mx, q[1] - my, q[2] + mx * 2, q[3] + my * 2]; };
    const dist = q => Math.hypot(Math.max(q[0] - x, 0, x - q[0] - q[2]), Math.max(q[1] - y, 0, y - q[1] - q[3]));
    const ppl = hooks.people().filter(here), buddy = hooks.buddy && hooks.buddy(), spots = hooks.spots().filter(here);
    const bodies = ppl.map(q => ({ x:q.x, y:q.y })); if (buddy && s.broom === s.room) bodies.push({ x:s.bx, y:s.by });
    const onSomeone = bodies.some(b => onBody(b, x, y));
    const stand = q => standFor(q);
    // 1. 還沒看過的東西（被人擋住時：點在人身上＝找人）
    const fresh = spots.filter(q => q.fresh && (onSomeone ? inBox(...q.r) && !glintAt(q.r, [...bodies, { x:s.px, y:s.py }]).free : q.k === "item" ? inBox(q.r[0] - 5, q.r[1] - 5, q.r[2] + 10, q.r[3] + 10) : inBox(...q.r)))
      .sort((a, c) => dist(a.r) - dist(c.r) || a.r[2] * a.r[3] - c.r[2] * c.r[3])[0];
    if (fresh){ s.lastTap = "spot"; const [tx, ty] = stand(fresh); return goThen(tx, ty, () => useSpot(fresh, () => hooks.onSpot(fresh))); }
    // 2. 人
    const p = ppl.filter(q => onBody(q, x, y) || inBox(q.x - 12, q.y - 42, 24, 44)).sort((a, c) => Math.abs(a.y - y) - Math.abs(c.y - y))[0];
    if (p){ s.lastTap = "person"; const side = s.px < p.x ? -18 : 18; return goThen(p.x + side, p.y + 1, () => { s.dir = "side"; s.face = side < 0 ? 1 : -1; hooks.onPerson(p.id); }); }
    if (buddy && s.broom === s.room && inBox(s.bx - 10, s.by - 40, 20, 42)){ s.lastTap = "buddy"; return hooks.onBuddy ? hooks.onBuddy(buddy.id) : hooks.onPerson(buddy.id); }
    // 3. 出口（門、樓梯）
    const ex = (roomOf(s.room).exits || []).find(e => inBox(...big(exitHit(e))));
    if (ex && !(ex.when && !ex.when(hooks.opt()))){ s.lastTap = "exit"; s.plan = [{ exit:ex }]; s.after = null; nextLeg(); hooks.onGround && hooks.onGround(); return; }
    // 4. 其他東西（看過的、小細節）
    const h = spots.filter(q => inBox(...q.r)).sort((a, b) => a.r[2] * a.r[3] - b.r[2] * b.r[3])[0] || spots.filter(q => inBox(...big(q.r))).sort((a, c) => dist(a.r) - dist(c.r))[0];
    if (h){ s.lastTap = "spot"; const [tx, ty] = stand(h); return goThen(tx, ty, () => useSpot(h, () => hooks.onSpot(h))); }
    // 4b. 房間裡純粹好玩的東西（坐低、開燈、拉窗簾……）：R.use = [{ r, walk, wy, act, face, actT, hold, useAt, say, on }]，不花時間、不記錄
    const fl = (roomOf(s.room).use || []).filter(u => !(u.when && !u.when(hooks.opt()))).find(u => inBox(...u.r));
    if (fl){ s.lastTap = "use"; hooks.onGround && hooks.onGround(); const [tx, ty] = stand(fl); return goThen(tx, ty, () => useSpot(fl, () => { if (fl.on) setTimeout(() => fl.on(), fl.delay ?? 250); if (fl.say){ s.flavor = { text:typeof fl.say === "function" ? fl.say() : fl.say, until:s.t + 2.4 }; } })); }
    // 5. 地面：走過去（房間裡隨便走不影響任何東西）
    s.lastTap = "ground"; hooks.onGround && hooks.onGround();
    s.plan = []; s.after = null; s.path = findPath(s.room, s.px, s.py, x, y);
  }
  // 查東西時站哪裡：寫了 walk/wy 就照寫的；沒寫就站在東西正下方（前面）走得到的地方
  function standFor(q){
    if (q.walk !== undefined && q.wy !== undefined) return [q.walk, q.wy];
    const G = gridOf(cur.s.room), cx = q.walk ?? q.r[0] + q.r[2] / 2, below = q.r[1] + q.r[3] + 6;
    const c = nearestFree(G, ...cellOf(G, cx, Math.min(roomOf(cur.s.room).h - 6, below)));
    return [c[0] * CELL + CELL / 2, c[1] * CELL + CELL / 2];
  }
  function faceTo(r){ const s = cur.s, cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2, dx = cx - s.px, dy = cy - s.py;
    if (Math.abs(dx) > Math.abs(dy) * 0.7){ s.dir = "side"; s.face = dx > 0 ? 1 : -1; } else s.dir = dy < 0 ? "up" : "down"; }

  /* ---------- 閃光、附近 ---------- */
  const spotKey = q => q.id || (q.ids || []).join("+");
  function nearYou(s, q){ if (!here(q) || s.script || s.fade) return false;
    const [wx, wy] = q.walk !== undefined && q.wy !== undefined ? [q.walk, q.wy] : [q.r[0] + q.r[2] / 2, q.r[1] + q.r[3]];
    return Math.hypot(wx - s.px, (wy - s.py) * 1.2) <= 56; }
  const GPTS = [null, [0.2, 0.3], [0.5, 0.12], [0.88, 0.6], [0.12, 0.7], [0.5, 0.88], [0.5, 0.5]];
  function glintAt(r, bl){
    const first = [r[2] > 8 ? 0.7 : 0.5, r[3] > 8 ? 0.3 : 0.5];
    for (const f of GPTS){ const [fx, fy] = f || first, x = Math.round(r[0] + (r[2] - 1) * fx), y = Math.round(r[1] + (r[3] - 1) * fy); if (!bl.some(b => onBody(b, x, y))) return { x, y, free:true }; }
    return { x:Math.round(r[0] + (r[2] - 1) * first[0]), y:Math.round(r[1] + (r[3] - 1) * first[1]), free:false };
  }
  function glint(p, g, s, q, i, bl){
    const T = 3.2, ph = ((s.t + T - 0.25 - (i % 6) * 0.35) % T + T) % T; if (ph > 0.55) return;
    const k = Math.sin(Math.PI * ph / 0.55), { x, y } = glintAt(q.r, bl);
    g.save();
    if (k > 0.75){ g.globalAlpha = 0.22; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx, dy]) => p.R(x + dx, y + dy, 1, 1, "#2a1c0c")); }
    g.globalAlpha = 0.45 + 0.5 * k;
    if (k > 0.75){ p.R(x - 2, y, 5, 1, "#ffc93a"); p.R(x, y - 2, 1, 5, "#ffc93a"); } else if (k > 0.35){ p.R(x - 1, y, 3, 1, "#ffc93a"); p.R(x, y - 1, 1, 3, "#ffc93a"); }
    g.globalAlpha = Math.min(1, 0.55 + 0.5 * k); p.R(x, y, 1, 1, "#ffffff"); g.restore();
  }
  function goSpot(key){ if (!cur || cur.s.script) return false; const q = cur.hooks.spots().find(q => spotKey(q) === key); if (!q) return false;
    const [tx, ty] = standFor(q); endUse(); goThen(tx, ty, () => useSpot(q, () => cur.hooks.onSpot(q)), q.room); return true; }

  /* ---------- 畫 ---------- */
  function shadow(g, x, y, w){ g.save(); g.globalAlpha = 0.28; g.fillStyle = "#000"; g.beginPath(); g.ellipse(Math.round(x), Math.round(y), w / 2, 2.2, 0, 0, 7); g.fill(); g.restore(); }
  // 人的樣子：走路用 8 格；站著的人照 pose（sit／lie／kneel……之後再加），先用待機呼吸
  function body(g, q, t){
    const L = q.L || {}, moving = q.moving;
    const act = moving ? "walk" : (SP.ACTS[q.act] ? q.act : "idle");
    // 做動作（查證、倒地……）一律用側面，才看得清楚手腳；只有走路和站著才分正面／背面
    const view = act !== "walk" && act !== "idle" ? "side" : q.dir === "up" ? "back" : q.dir === "down" ? "front" : "side";
    const n = SP.frames(act), f = moving ? Math.floor(q.walkD / 3.2) % 8 : q.f !== undefined ? Math.max(0, Math.min(n - 1, q.f)) : Math.floor(t * (q.rate || 2) + (q.x % 7)) % n;
    return SP.draw(g, q.x, q.y, L, { view, facing:q.face || 1, act, f });
  }
  function arrow(p, q, t){ if (!q.arrow) return; if (q.blink && Math.floor(t * 3) % 2) return; const y = q.y - 48 + Math.round(Math.sin(t * 4) * 1);
    p.R(q.x - 3, y, 7, 2, q.arrow); p.R(q.x - 2, y + 2, 5, 1, q.arrow); p.R(q.x - 1, y + 3, 3, 1, q.arrow); p.R(q.x, y + 4, 1, 1, q.arrow); }
  function draw(){
    const { canvas, def, s, hooks } = cur, g = canvas.getContext("2d"), p = P(), R = roomOf(s.room);
    g.imageSmoothingEnabled = false; p.ctx(g); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#0b0a09"; g.fillRect(0, 0, VW, VH);
    const cx = Math.round(s.cam[0]), cy = Math.round(s.cam[1]); g.translate(-cx, -cy);
    const opt = hooks.opt ? hooks.opt() : {};
    R.floor(p, g, s.t, opt);
    // 人＋家具一起由後到前排
    const b = bubbleNow(), list = [];
    (R.props || []).forEach(pr => list.push({ y:pr.y, prop:pr }));
    hooks.people().filter(here).forEach(q => list.push({ ...q, dir:q.view || (q.facing ? "side" : "down"), face:q.facing || 1, kind:"npc" }));
    const buddy = hooks.buddy && hooks.buddy(), hide = s.script && step() && step().hide;
    if (buddy && s.broom === s.room && !hide) list.push({ id:buddy.id, x:s.bx, y:s.by, L:buddy.L, dir:s.bdir, face:s.bface, moving:s.bmove, walkD:s.bwalkD, kind:"buddy", arrow:s.script ? null : "#6fd46f" });
    if (!hide) list.push({ id:"you", x:s.px, y:s.py, L:hooks.you, dir:s.dir, face:s.face, moving:s.walking, walkD:s.walkD, kind:"you", ...(s.use && !s.walking ? { act:s.use.act, f:s.use.loop ? Math.floor(s.use.t * s.use.rate) % s.use.n : Math.floor(s.use.t * s.use.rate), dir:s.use.act === "openDoor" ? "side" : s.dir } : {}) });
    list.sort((a, c) => a.y - c.y);
    const bl = [];
    list.forEach(q => { if (q.prop){ q.prop.draw(p, g, s.t, opt); return; } shadow(g, q.x, q.y, 14); body(g, q, s.t); bl.push({ x:q.x, y:q.y }); if (q.kind !== "you") arrow(p, q, s.t); });
    if (R.front) R.front(p, g, s.t, opt);
    // 出口的牌子：HTML 字（中文才清楚），放在出口上面；點牌子＝點出口
    exitLabels(R, opt, cx, cy);
    // 閃光、附近
    let nearL = [];
    if (!s.script && !hooks.noGlint){ nearL = hooks.spots().filter(q => q.fresh && nearYou(s, q)); nearL.forEach((q, i) => glint(p, g, s, q, i, bl)); }
    if (hooks.nearNow){ const sig = nearL.map(spotKey).join("|"); if (sig !== s.nearSig){ s.nearSig = sig; hooks.nearNow(nearL.slice().sort((a, c) => a.r[0] - c.r[0])); } }
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (s.fade){ g.globalAlpha = Math.max(0, 1 - Math.abs(1 - s.fade)); g.fillStyle = "#000"; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    // 對話框（HTML）
    const bub = cur.bub;
    if (b && bub){
      const who = b.who === "you" ? { x:s.px, y:s.py } : buddy && (b.who === buddy.id || b.who === "wu") ? { x:s.bx, y:s.by } : list.find(q => q.id === b.who) || null;
      if (who){ bub.hidden = false; bub.querySelector("b").textContent = b.name || (b.who === "you" ? "你" : hooks.nameOf ? hooks.nameOf(b.who) : "");
        bub.querySelector("span").textContent = s.typed;
        const cw = canvas.clientWidth, ch = canvas.clientHeight, ww = cw * (1 - (hooks.cover ? hooks.cover() : 0));
        bub.style.maxWidth = Math.round(ww * 0.9) + "px";
        const bw = bub.offsetWidth, bh = bub.offsetHeight, hx = (who.x - cx) / VW * cw, left = Math.max(4, Math.min(ww - bw - 4, hx - bw / 2));
        const top = Math.max(4, Math.min((who.y - 46 - cy) / VH * ch - bh - 6, ch - bh - 4));
        bub.style.left = left + "px"; bub.style.top = top + "px"; bub.style.setProperty("--tail", Math.max(10, Math.min(bw - 10, hx - left)) + "px");
      } else bub.hidden = true;
    } else if (bub) bub.hidden = true;
    if (cur.tip) cur.tip.textContent = s.script ? (step() && step().say ? "點一下跳到下一句 ▶" : "") : "";
    const sk = canvas.parentNode.querySelector(".wskip"); if (sk) sk.hidden = !s.script;
  }

  // 出口可以點的範圍：出口本身＋門的圖（e.art；沒寫的門＝往上 44 格那一塊牆）
  const exitHit = e => e.art || (e.kind === "door" ? [e.r[0], e.r[1] - 44, e.r[2], e.r[3] + 44] : e.r);
  function exitLabels(R, opt, cx, cy){
    const wrap = cur.canvas.parentNode, cw = cur.canvas.clientWidth, ch = cur.canvas.clientHeight;
    cur.lab = cur.lab || {};
    const want = new Set();
    (R.exits || []).forEach((e, i) => { if (e.when && !e.when(opt)) return; const key = cur.s.room + ":" + i; want.add(key);
      let el = cur.lab[key];
      if (!el){ el = cur.lab[key] = document.createElement("button"); el.className = "wnav go wexit";
        el.textContent = (e.kind === "up" ? "⬆ " : e.kind === "down" ? "⬇ " : e.kind === "out" ? "" : "🚪 ") + (e.label || (roomOf(e.to) && roomOf(e.to).name) || "") + (e.kind === "out" ? " ➜" : "");
        el.onpointerdown = ev => { ev.stopPropagation(); }; el.onclick = ev => { ev.stopPropagation(); if (cur.s.script || cur.s.fade || (cur.s.use && cur.s.use.then)) return; endUse(); cur.s.plan = [{ exit:e }]; cur.s.after = null; nextLeg(); cur.hooks.onGround && cur.hooks.onGround(); };
        wrap.appendChild(el); }
      const hr = exitHit(e), lx = hr[0] + hr[2] / 2, ly = e.lab ?? (hr[1] + hr[3] / 2);   // 字放在門／樓梯那件東西的正中間
      el.style.left = ((lx - cx) / VW * cw) + "px"; el.style.top = ((ly - cy) / VH * ch) + "px"; el.hidden = !!cur.s.script;
    });
    Object.keys(cur.lab).forEach(k => { if (!want.has(k)){ cur.lab[k].remove(); delete cur.lab[k]; } });
  }

  /* ---------- 掛上畫布 ---------- */
  function mount(canvas, def, lid, hooks){
    gridCache.clear();
    cur = { canvas, def, lid, hooks };
    const s = cur.s = state(lid, def); s.nearSig = null;
    if (!rooms()[s.room]){ const f = firstRoom(def), R = roomOf(f); s.room = f; s.px = R.w / 2; s.py = R.h - 20; s.broom = f; s.bx = s.px - 14; s.by = s.py; }
    canvas.width = VW; canvas.height = VH; canvas.classList.add("top");
    if (cur.lab0 !== canvas){ canvas.parentNode.querySelectorAll(".wexit").forEach(el => el.remove()); }
    cur.lab = {}; cur.lab0 = canvas;
    const wrap = canvas.parentNode; cur.bub = wrap.querySelector(".wbubble"); cur.tip = wrap.querySelector(".wtip");
    s.cam = camFor(roomOf(s.room), s.px, s.py);
    if (hooks.script && !s.script && !hooks.scriptDone()){ s.script = hooks.script; s.si = 0; s.sT = 0; startStep(); }
    announce();
    canvas.onclick = null;
    canvas.onpointerdown = e => { if (e.button > 0) return; try { canvas.setPointerCapture(e.pointerId); } catch(_){} s.lastTap = ""; tap(e);
      cur.hold = { id:e.pointerId, sx:e.clientX, sy:e.clientY, cx:e.clientX, cy:e.clientY, moved:false }; };
    canvas.onpointermove = e => { const h = cur.hold; if (!h || h.id !== e.pointerId) return; h.cx = e.clientX; h.cy = e.clientY; if (Math.hypot(h.cx - h.sx, h.cy - h.sy) > 10 && s.lastTap === "ground") h.moved = true; };
    canvas.onpointerup = canvas.onpointercancel = e => { if (cur.hold && cur.hold.id === e.pointerId) cur.hold = null; };
    const skipBtn = wrap.querySelector(".wskip"); if (skipBtn) skipBtn.onclick = e => { e.stopPropagation(); skip(); };
    let last = performance.now();
    const loop = now => { if (!canvas.isConnected || cur.canvas !== canvas) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); draw(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  // 走進一個區域（房間）要站哪裡：房間中間附近、沒有人的地方。回傳 [x, y, 房間]
  function standIn(a){
    const rid = a.id, R = roomOf(rid); if (!R) return [cur.s.px, cur.s.py, cur.s.room];
    const want = a.stand || [R.w / 2, Math.min(R.h - 16, (R.wall || 0) + (R.h - (R.wall || 0)) * 0.65)];
    const busy = cur.hooks.people().filter(q => q.room === rid);
    let best = want, bd = -1;
    for (let k = 0; k < 9; k++){ const c = [want[0] + [0, -22, 22, -44, 44, 0, 0, -22, 22][k], want[1] + [0, 0, 0, 0, 0, -16, 16, 16, 16][k]];
      const G = gridOf(rid), cc = cellOf(G, c[0], c[1]); if (!free(G, cc[0], cc[1])) continue;
      const d = Math.min(99, ...busy.map(q => Math.hypot(q.x - c[0], q.y - c[1]))); if (d >= 20) return [c[0], c[1], rid]; if (d > bd){ bd = d; best = c; } }
    return [best[0], best[1], rid];
  }
  function goTo(x, y, cb, room){ if (!cur || cur.s.script) return false; goThen(x, y, cb, room); return true; }

  return { top:true, carOf, PATROL, mount, state, indoor:() => 1, goTo, standIn, walking:() => !!(cur && (cur.s.path.length || cur.s.fade)),
    levelVis:() => 1, skip:() => cur && cur.s.script && skip(), nearYou:q => !!cur && !cur.s.script && nearYou(cur.s, q), goSpot, spotKey,
    you:() => cur && { x:cur.s.px, y:cur.s.py, room:cur.s.room, use:cur.s.use && cur.s.use.act }, doorAmt:(room, to) => { if (!cur) return 0; const t0 = cur.s.doorT[room + ">" + to]; if (t0 === undefined) return 0; const d = cur.s.t - t0; return d < 0.3 ? d / 0.3 : d < 1.4 ? 1 : Math.max(0, 1 - (d - 1.4) / 0.3); }, endUse:() => cur && endUse(), glintAt:q => { if (!cur) return null; const s = cur.s, bl = [{ x:s.px, y:s.py }, ...cur.hooks.people().filter(here).map(b => ({ x:b.x, y:b.y }))]; if (s.broom === s.room && cur.hooks.buddy && cur.hooks.buddy()) bl.push({ x:s.bx, y:s.by }); return glintAt(q.r, bl); }, VW, VH, GROUND:0, room:() => cur && cur.s.room,
    reset:lid => { delete st[lid]; }, resetAll:() => { Object.keys(st).forEach(k => delete st[k]); }, _cur:() => cur };
})();
