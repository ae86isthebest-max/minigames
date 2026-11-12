/* =========================================================
   可以走動的橫向場景（動畫遊戲模式）
   - 畫面 240×135，場景可以比畫面寬，鏡頭跟著主角
   - 點地面：主角走過去；點人：走過去問話；點東西：走過去調查
   - 助手會沿著主角走過的路跟在後面（上下樓梯也會跟）
   - 建築（def.buildings）：在外面只看得到外牆，走進門才看得到裡面；門會開關
   - 樓層（def.floors）與樓梯（def.stairs）：點二樓，主角會自己走到樓梯爬上去
   - 開場可以跑一段劇情（車開進來、助手交代案情）
   - 每個人都會呼吸、眨眼，依姿勢做小動作（喝東西、抽菸、掃地、哭），說話時嘴巴會動
   ========================================================= */
const WORLD = (() => {
  const VW = 240, VH = 135, GROUND = 124, SPEED = 60, BACK = 22;
  const st = {};
  let cur = null;
  const P = () => PX.prim;

  function state(lid, def){
    if (st[lid]) return st[lid];
    const x = def.spawn || 60;
    return st[lid] = { px:x, py:GROUND, path:[], face:1, cam:Math.max(0, x - VW/2), bx:x-20, by:GROUND, bface:1, bmove:false, trail:[[x-20,GROUND],[x,GROUND]],
      after:null, t:0, script:null, si:0, sT:0, car:null, typed:"", typeKey:"", rv:{}, door:{} };
  }
  function resetTrail(s){ s.trail = [[s.bx, s.by], [s.px, s.py]]; }

  function mount(canvas, def, lid, hooks){
    const s = state(lid, def);
    canvas.width = VW; canvas.height = VH;
    const wrap = canvas.parentNode, bub = wrap.querySelector(".wbubble"), tip = wrap.querySelector(".wtip");
    cur = { canvas, def, lid, hooks, s, bub, tip };
    if (s.px > def.w - 8){ s.px = def.w - 30; s.py = GROUND; resetTrail(s); }
    if (!s.car && def.park !== undefined) s.car = { x:def.park, from:def.park, to:def.park, d:0, c:"#e9e4da" };
    if (hooks.script && !s.script && !hooks.scriptDone()){ s.script = hooks.script; s.si = 0; s.sT = 0; startStep(); }
    // 操作：按下去就有反應；按住或拖著，主角就一路跟著手指走
    canvas.onclick = null;
    canvas.onpointerdown = e => {
      if (e.button > 0) return;
      try { canvas.setPointerCapture(e.pointerId); } catch(_){}
      s.lastTap = "";
      tap(e);
      cur.hold = { id:e.pointerId, sx:e.clientX, sy:e.clientY, cx:e.clientX, cy:e.clientY, t:performance.now(), moved:false, kind:s.lastTap };
    };
    canvas.onpointermove = e => {
      const h = cur.hold; if (!h || h.id !== e.pointerId) return;
      h.cx = e.clientX; h.cy = e.clientY;
      if (Math.hypot(h.cx - h.sx, h.cy - h.sy) > 10) h.moved = true;
    };
    canvas.onpointerup = canvas.onpointercancel = e => { if (cur.hold && cur.hold.id === e.pointerId) cur.hold = null; };
    const skipBtn = wrap.querySelector(".wskip");
    if (skipBtn) skipBtn.onclick = e => { e.stopPropagation(); skip(); };
    let last = performance.now();
    const loop = now => {
      if (!canvas.isConnected) return;
      const dt = Math.min(0.05, (now - last)/1000); last = now;
      update(dt); draw(); requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- 開場劇情 ---------- */
  function step(){ const s = cur.s; return s.script && s.script[s.si]; }
  function startStep(){
    const s = cur.s, k = step(); s.sT = 0;
    if (!k) { s.script = null; cur.hooks.scriptDone(true); cur.hooks.refresh(); return; }
    if (k.set){
      Object.assign(s, k.set);
      if (k.set.px!==undefined){ s.py = GROUND; s.by = GROUND; s.path = []; s.cam = Math.max(0, Math.min(cur.def.w-VW, s.px-VW/2)); resetTrail(s); }
    }
    if (k.walk){ const [who,x] = k.walk; if (who==="you") s.path = [[x, s.py]]; else s.btx = x; }
    if (k.car) s.car = { x:k.car[0], from:k.car[0], to:k.car[1], d:k.car[2], c:k.car[3]||"#e9e4da" };
    if (k.set || k.carStop) { if (!k.say && !k.walk && !k.car && !k.wait) next(); }
  }
  function next(){ const s = cur.s; s.si++; s.readT = 0; startStep(); }
  // 跳過整段劇情：把每一步的結果直接套用
  function skip(){
    const s = cur.s; let guard = 0;
    while (s.script && guard++ < 300){
      const k = step();
      if (k && k.walk){ if (k.walk[0]==="you"){ s.px = k.walk[1]; s.path = []; } else { s.bx = k.walk[1]; s.btx = null; } }
      if (k && k.car) s.car = { x:k.car[1], from:k.car[1], to:k.car[1], d:0, c:k.car[3]||"#e9e4da" };
      next();
    }
    s.py = GROUND; s.by = GROUND; resetTrail(s);
    s.cam = Math.max(0, Math.min(cur.def.w - VW, s.px - VW/2));
  }

  /* ---------- 樓層、樓梯、建築 ---------- */
  const floors = () => cur.def.floors || [];
  const stairs = () => cur.def.stairs || [];
  const blds = () => cur.def.buildings || [];
  // 點到的位置在哪一層：回傳該層地板的 y
  function floorAt(x, y){
    for (const f of floors()) if (x >= f.x0 && x <= f.x1 && y <= f.y + 3 && y >= f.y - 44) return f.y;
    return GROUND;
  }
  const bldAt = x => blds().findIndex(b => x > b.x0 && x < b.x1);
  // 一棟建築的樓層（由上到下）：{ y0, y1, fy 地板 }；沒寫就整棟一層
  const levelsOf = b => b.levels || [{ y0:-99, y1:GROUND + 20, fy:GROUND }];
  const levelAt = (b, y) => levelsOf(b).findIndex(L => y >= L.y0 && y <= L.y1);
  // 現在看得到哪一層：在這棟裡面、而且人在那一層（走樓梯途中兩層都看得到）
  function levelShown(s, i, k){
    const b = blds()[i], L = levelsOf(b)[k];
    if (!(s.px > b.x0 && s.px < b.x1)) return false;
    const onAny = levelsOf(b).some(M => Math.abs(M.fy - s.py) < 1);
    return !onAny || Math.abs(L.fy - s.py) < 1;
  }
  const lvVis = (s, i, k) => Math.min(s.rv[i]||0, s.rv[i+"L"+k] ?? 0);
  function hiddenAt(s, x, y){ const i = bldAt(x); if (i < 0) return false; const k = levelAt(blds()[i], y); return lvVis(s, i, k < 0 ? 0 : k) < 0.5; }
  // 從 (x0,y0) 走到 (x,y)：換樓層就先走到樓梯
  function route(x0, y0, x, y){
    if (Math.abs(y - y0) < 2) return [[x, y]];
    const ss = stairs().filter(k => (Math.abs(k.y0 - y0) < 2 && Math.abs(k.y1 - y) < 2) || (Math.abs(k.y1 - y0) < 2 && Math.abs(k.y0 - y) < 2));
    if (!ss.length) return [[x, y0]];
    const k = ss.sort((a,b)=>Math.abs((Math.abs(a.y0-y0)<2?a.x0:a.x1)-x0) - Math.abs((Math.abs(b.y0-y0)<2?b.x0:b.x1)-x0))[0];
    const up = Math.abs(k.y0 - y0) < 2;
    return up ? [[k.x0, k.y0], [k.x1, k.y1], [x, y]] : [[k.x1, k.y1], [k.x0, k.y0], [x, y]];
  }
  function clampX(x, y){
    if (y === GROUND) return Math.max(8, Math.min(cur.def.w - 8, x));
    const f = floors().find(f => Math.abs(f.y - y) < 2);
    return f ? Math.max(f.x0 + 4, Math.min(f.x1 - 4, x)) : x;
  }

  /* ---------- 點擊 ---------- */
  function tap(e){
    const { canvas, s, hooks } = cur;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * VW / r.width + s.cam, y = (e.clientY - r.top) * VH / r.height;
    if (s.script){ s.lastTap = "script"; const k = step(); if (k && k.say){ if (s.typed.length < k.say[1].length) s.typed = k.say[1]; else next(); } return; }
    const inBox0 = (bx,by,bw,bh) => x>=bx && x<=bx+bw && y>=by && y<=by+bh;
    // 從外面就看得到的東西（例如亮著的窗戶）：walk 在建築外面
    const outSpot = hooks.spots().find(q => q.walk !== undefined && bldAt(q.walk) < 0 && inBox0(...q.r) && !(bldAt(x) >= 0 && (s.rv[bldAt(x)]||0) >= 0.5));
    if (outSpot) return goThen(outSpot.walk, GROUND, () => hooks.onSpot(outSpot));
    // 還沒進去的建築：先走到門口，進去
    const bi = bldAt(x), inside = bldAt(s.px);
    if (bi >= 0 && bi === inside && hiddenAt(s, x, y)){ s.lastTap = "ground"; hooks.onGround && hooks.onGround(); return goThen(x, floorAt(x, y), null); }
    if (bi >= 0 && bi !== inside && (s.rv[bi]||0) < 0.5){
      const b = blds()[bi], d = Math.abs(s.px - b.x0) < Math.abs(s.px - b.x1) ? b.x0 + 10 : b.x1 - 10;
      s.lastTap = "ground"; hooks.onGround && hooks.onGround();
      return goThen(d, GROUND, null);
    }
    const ppl = hooks.people();
    const buddy = hooks.buddy && hooks.buddy();
    const inBox = (bx,by,bw,bh) => x>=bx && x<=bx+bw && y>=by && y<=by+bh;
    const spots = hooks.spots();
    const target = q => { const cx = q.r[0]+q.r[2]/2, fy = floorAt(cx, q.r[1]+q.r[3]/2); return [q.walk ?? cx, fy]; };
    // 點的範圍放大一點，手指不用點得很準
    const M = 5, inR = r => inBox(r[0]-M, r[1]-M, r[2]+M*2, r[3]+M*2);
    const fresh = spots.find(q => q.k==="item" && q.fresh && inR(q.r)) ;
    if (fresh){ const [tx,ty] = target(fresh); return goThen(tx, ty, () => hooks.onSpot(fresh)); }
    const p = ppl.filter(q => inBox(q.x-13, (q.y||GROUND)-36, 26, 38)).sort((a,c) => Math.abs(a.x-x) - Math.abs(c.x-x))[0];
    if (p) return goThen(p.x + (s.px < p.x ? -16 : 16), p.y||GROUND, () => { s.face = s.px < p.x ? 1 : -1; hooks.onPerson(p.id); });
    if (buddy && inBox(s.bx-10, s.by-33, 20, 34)) return hooks.onBuddy ? hooks.onBuddy(buddy.id) : hooks.onPerson(buddy.id);
    const h = spots.filter(q => inBox(...q.r)).sort((a,b)=>a.r[2]*a.r[3]-b.r[2]*b.r[3])[0];
    if (h){ const [tx,ty] = target(h); return goThen(tx, ty, () => hooks.onSpot(h)); }
    // 什麼都沒點中：附近有沒查過的東西，就當作點它
    const dist = r => Math.hypot(Math.max(r[0]-x, 0, x-r[0]-r[2]), Math.max(r[1]-y, 0, y-r[1]-r[3]));
    const near = spots.filter(q => q.k==="item" && q.fresh && dist(q.r) < 12).sort((a,c) => dist(a.r) - dist(c.r))[0];
    if (near){ const [tx,ty] = target(near); return goThen(tx, ty, () => hooks.onSpot(near)); }
    s.lastTap = "ground";
    hooks.onGround && hooks.onGround();
    const fy = floorAt(x, y);
    goThen(x, fy, null);
  }
  function goThen(x, y, cb){
    const s = cur.s; x = clampX(x, y);
    s.after = cb;
    let sx = s.px, sy = s.py, pre = [];
    const onLevel = v => Math.abs(v - GROUND) < 1 || floors().some(f => Math.abs(f.y - v) < 1);
    if (!onLevel(sy)){
      // 正在樓梯上：先走到樓梯的上端或下端，再照常走
      const k = stairs().find(k => sx >= Math.min(k.x0,k.x1) - 1 && sx <= Math.max(k.x0,k.x1) + 1);
      if (k){ const end = Math.abs(k.y1 - y) < Math.abs(k.y0 - y) ? [k.x1, k.y1] : [k.x0, k.y0]; pre = [end]; sx = end[0]; sy = end[1]; }
      else { s.py = sy = GROUND; }
    }
    if (!pre.length && Math.abs(x - sx) < 2 && Math.abs(y - sy) < 2){ s.path = []; cb && cb(); return; }
    s.path = [...pre, ...route(sx, sy, x, y).map(([a,b]) => [clampX(a,b), b])];
  }

  /* ---------- 更新 ---------- */
  function trailBack(s, dist){
    let d = 0, [x, y] = s.trail[s.trail.length-1];
    for (let i = s.trail.length - 2; i >= 0; i--){
      const [ax, ay] = s.trail[i], l = Math.hypot(x-ax, y-ay);
      if (d + l >= dist){ const k = (dist - d) / l; return [x + (ax-x)*k, y + (ay-y)*k]; }
      d += l; x = ax; y = ay;
    }
    return [x, y];
  }
  function update(dt){
    const { s, def } = cur; s.t += dt; s.sT += dt;
    const wasX = s.px, wasY = s.py;
    // 按住／拖著：一直往手指的位置走（手指放在畫面邊緣，就會一直走下去）
    const h = cur.hold;
    if (h && !s.script && (h.moved || (h.kind === "ground" && performance.now() - h.t > 280))){
      const r = cur.canvas.getBoundingClientRect();
      const hx = (h.cx - r.left) * VW / r.width + s.cam, hy = (h.cy - r.top) * VH / r.height;
      const fy = floorAt(hx, hy), last = s.path[s.path.length-1];
      if (!last || Math.abs(last[0] - clampX(hx, fy)) > 3 || Math.abs(last[1] - fy) > 1) goThen(hx, fy, null);
    }
    // 距離遠就用跑的
    let left = 0, lx = s.px, ly = s.py; s.path.forEach(([a,b]) => { left += Math.hypot(a-lx, b-ly); lx = a; ly = b; });
    s.spd = (s.spd || 1) + ((left > 70 ? 1.8 : 1) - (s.spd || 1)) * Math.min(1, dt*4);
    if (s.path.length){
      const [tx, ty] = s.path[0], dx = tx - s.px, dy = ty - s.py, d = Math.hypot(dx, dy);
      if (Math.abs(dx) > 0.3) s.face = dx > 0 ? 1 : -1;
      const m = Math.min(d, SPEED*s.spd*dt*(Math.abs(dy) > 1 ? 0.8 : 1));
      if (d > 0){ s.px += dx/d*m; s.py += dy/d*m; }
      s.walking = true;
      if (Math.hypot(tx - s.px, ty - s.py) < 0.5){
        s.px = tx; s.py = ty; s.path.shift();
        if (!s.path.length){ s.walking = false; const cb = s.after; s.after = null; cb && cb(); if (s.script && step() && step().walk && step().walk[0]==="you") next(); }
      }
    } else s.walking = false;
    // 路徑記錄（助手照著走）
    const lt = s.trail[s.trail.length-1];
    if (Math.hypot(s.px - lt[0], s.py - lt[1]) > 1){ s.trail.push([s.px, s.py]); if (s.trail.length > 400) s.trail.splice(0, 100); }
    // 助手
    const obx = s.bx, oby = s.by;
    if (s.btx !== undefined && s.btx !== null){
      const bd = s.btx - s.bx;
      if (Math.abs(bd) > 0.5){ s.bx += Math.sign(bd)*Math.min(Math.abs(bd), SPEED*0.95*dt); }
      else { s.btx = null; resetTrail(s); if (s.script && step() && step().walk && step().walk[0]==="buddy") next(); }
    } else {
      const [gx, gy] = trailBack(s, BACK), dd = Math.hypot(gx - s.bx, gy - s.by);
      if (dd > 0.5){ const m = Math.min(dd, SPEED*Math.max(1.05, s.spd*1.05)*dt); s.bx += (gx-s.bx)/dd*m; s.by += (gy-s.by)/dd*m; }
    }
    s.bmove = Math.hypot(s.bx-obx, s.by-oby) > 0.05;
    if (s.bmove && Math.abs(s.bx-obx) > 0.02) s.bface = s.bx > obx ? 1 : -1;
    else if (!s.bmove && !s.walking) s.bface = s.px > s.bx ? 1 : -1;
    // 車
    if (s.car && s.car.d){ const k = Math.min(1, s.sT / s.car.d); s.car.x = s.car.from + (s.car.to - s.car.from) * (1 - (1-k)*(1-k)); if (k>=1 && step() && step().car){ s.car.d = 0; next(); } }
    if (s.script && step() && step().wait && s.sT >= step().wait) next();
    // 建築：在裡面就慢慢看得到裡面；門在有人經過時打開
    blds().forEach((b, i) => {
      const inside = s.px > b.x0 && s.px < b.x1;
      s.rv[i] = (s.rv[i]||0) + ((inside ? 1 : 0) - (s.rv[i]||0)) * Math.min(1, dt*5);
      levelsOf(b).forEach((L, k) => { const key = i+"L"+k, v = s.rv[key] ?? (levelShown(s, i, k) ? 1 : 0); s.rv[key] = v + ((levelShown(s, i, k) ? 1 : 0) - v) * Math.min(1, dt*5); });
      [b.x0, b.x1].forEach((dx, j) => { const near = [s.px, s.bx].some(v => Math.abs(v - dx) < 9) && s.py > GROUND - 2; const k = i+"_"+j; s.door[k] = (s.door[k]||0) + ((near?1:0) - (s.door[k]||0)) * Math.min(1, dt*8); });
    });
    // 鏡頭
    const target = Math.max(0, Math.min(def.w - VW, (s.car && s.script && step() && step().hide ? s.car.x+20 : s.px) - VW/2));
    s.cam += (target - s.cam) * Math.min(1, dt*4);
    // 對話框打字效果
    const b = bubbleNow();
    const key = b ? b.who + "|" + b.text : "";
    if (key !== s.typeKey){ s.typeKey = key; s.typed = ""; }
    if (b && s.typed.length < b.text.length) s.typed = b.text.slice(0, s.typed.length + Math.max(1, Math.round(dt*40)));
    // 劇情對白打完後，停一下讓人看，然後自動下一句（點一下可以馬上跳）
    if (s.script && step() && step().say && b && s.typed.length >= b.text.length){
      s.readT = (s.readT || 0) + dt;
      if (s.readT > 1.3 + b.text.length / 7) next();
    }
  }
  function bubbleNow(){
    const s = cur.s;
    if (s.script){ const k = step(); return k && k.say ? { who:k.say[0], text:k.say[1], name:k.name } : null; }
    return cur.hooks.bubble();
  }

  /* ---------- 小動作：呼吸、眨眼、依姿勢動 ---------- */
  function alive(q, t, talking){
    const ph = t + ((q.x * 0.37) % 5);
    let pose = q.pose || "stand";
    const parts = pose.split("+"), hasLegs = parts.length > 1;
    let arms = hasLegs ? parts[1] : parts[0], legs = hasLegs ? parts[0] : null;
    if (["kneel","sit","fall","lie"].includes(arms) && !hasLegs){ legs = arms; arms = null; }
    const fx = { blink: (ph % 3.7) < 0.13, bob: Math.floor(ph / 1.4) % 2 === 0 };
    let puff = false;
    if (arms === "drink") arms = (ph % 4.5) < 1.1 ? "drink" : "cup";
    else if (arms === "smoke"){ const c = ph % 5; arms = c < 1.3 ? "smoke" : "cig"; puff = c > 1.1 && c < 3.2; }
    else if (arms === "broom") arms = Math.floor(ph * 2.2) % 2 ? "broom" : "broom2";
    else if (arms === "brush") arms = Math.floor(ph * 3) % 2 ? "brush" : "brush2";
    else if (arms === "cry"){ fx.shake = Math.floor(ph * 7) % 2; fx.bob = false; }
    else if (arms === "phone" && (ph % 6) < 3.5) fx.talk = Math.floor(ph * 5) % 2 === 0;
    if (talking) fx.talk = Math.floor(t * 6) % 2 === 0;
    const out = legs ? (arms ? legs + "+" + arms : legs) : (arms || "stand");
    return { pose: out, fx, puff };
  }
  function smoke(p, x, y, t){
    for (let i = 0; i < 4; i++){ const k = (t * 0.5 + i / 4) % 1; p.dither(Math.round(x + Math.sin(k * 6 + i) * 3), Math.round(y - k * 16), 4, 3, "#c9c9c9", 2 + (k > .6 ? 1 : 0)); }
  }

  /* ---------- 建築外觀（在外面時蓋住裡面） ---------- */
  function facade(p, b, t, i, alpha){
    const g = cur.g, { R, shade, dither, windowBox } = p, s = cur.s;
    g.save(); g.globalAlpha = alpha;
    if (b.ext) b.ext(p, t, cur.hooks.opt(), b);
    else {
      const wall = b.wall || "#b8a58a", top = b.y0, night = typeof b.night === "function" ? b.night(cur.hooks.opt()) : b.night;
      R(b.x0, top, b.x1 - b.x0, GROUND - top, wall);
      if (b.brick){
        // 磚牆：一塊一塊，顏色有深有淺，有些缺角
        const mort = shade(wall, -.22); p.seed(b.x0 * 3 + 1);
        for (let y = top + 2, r = 0; y < GROUND - 1; y += 4, r++) {
          R(b.x0, y + 3, b.x1 - b.x0, 1, mort);
          for (let x = b.x0 + (r % 2) * 5 - 5; x < b.x1; x += 10){
            const v = p.rnd(), bx = Math.max(b.x0, x), bw = Math.min(x + 9, b.x1) - bx; if (bw <= 0) continue;
            R(x + 9, y, 1, 3, mort);
            if (v < 0.25) R(bx, y, bw, 3, shade(wall, -.07)); else if (v > 0.85) R(bx, y, bw, 3, shade(wall, .07));
            if (v > 0.97) R(bx + 1, y, 3, 2, shade(wall, -.3));
            R(bx, y, bw, 1, shade(wall, .1));
          }
        }
      }
      p.seed(b.x0); for (let k = 0; k < (b.x1 - b.x0) / 6; k++) dither(b.x0 + p.rnd()*(b.x1-b.x0-8), top + p.rnd()*(GROUND-top-10), 8, 6, shade(wall, -.12), 3);
      R(b.x0 - 4, top - 5, b.x1 - b.x0 + 8, 6, b.roof || shade(wall, -.5)); R(b.x0 - 4, top + 1, b.x1 - b.x0 + 8, 1, shade(wall, -.35));
      (b.rows || []).forEach(y => { R(b.x0, y + 17, b.x1 - b.x0, 2, shade(wall, -.25)); R(b.x0, y + 17, b.x1 - b.x0, 1, shade(wall, .12));
        for (let x = b.x0 + 18; x < b.x1 - 20; x += 30) {
          const lit = night && (x/30|0)%3, glass = night ? (lit ? "#ffd98a" : "#1a2030") : "#8fb0c4";
          R(x - 3, y - 3, 18, 2, shade(wall, -.3)); R(x - 2, y - 2, 16, 1, shade(wall, .18));
          windowBox(x, y, 12, 13, glass);
          if (!night){ R(x + 1, y + 1, 4, 1, "#d8ecf6"); R(x + 7, y + 8, 3, 1, "#d8ecf6"); } else if (lit){ R(x + 1, y + 1, 5, 5, "#ffe8b0"); p.dither(x - 4, y + 14, 20, 6, "#ffd98a", 4); }
          if ((x/30|0)%2){ R(x - 4, y, 3, 13, shade(b.shutter || "#5a6a5a", 0)); R(x + 13, y, 3, 13, shade(b.shutter || "#5a6a5a", 0)); for (let k = 1; k < 13; k += 2){ R(x - 4, y + k, 3, 1, shade(b.shutter || "#5a6a5a", -.25)); R(x + 13, y + k, 3, 1, shade(b.shutter || "#5a6a5a", -.25)); } }
          R(x - 2, y + 14, 16, 2, shade(wall, .15)); R(x - 2, y + 16, 16, 1, shade(wall, -.35));
        } });
      // 雨水管、冷氣、門燈、牆角的髒污
      R(b.x1 - 7, top, 2, GROUND - top, shade(wall, -.4)); R(b.x1 - 8, GROUND - 3, 4, 3, shade(wall, -.45));
      (b.rows || []).slice(0, 1).forEach(y => { const ax = b.x0 + Math.floor((b.x1 - b.x0) * 0.62); R(ax, y + 3, 12, 8, "#c9cdd0"); R(ax, y + 3, 12, 1, "#e9eef0"); for (let k = 0; k < 3; k++) R(ax + 2, y + 5 + k*2, 8, 1, "#8a9094"); R(ax + 5, y + 11, 1, 6, "#6a7074"); });
      R(b.x0, GROUND - 6, b.x1 - b.x0, 6, shade(wall, -.18)); dither(b.x0, GROUND - 10, b.x1 - b.x0, 4, shade(wall, -.18), 3);
      const lampOn = night;
      R(b.x0 + 16, GROUND - 32, 3, 4, "#2a2a2e"); R(b.x0 + 16, GROUND - 29, 3, 2, lampOn ? "#ffe8a0" : "#c9cdd0"); if (lampOn) dither(b.x0 + 10, GROUND - 30, 16, 18, "#ffe8a0", 4);
      if (b.sign) b.sign(p, t, b);
    }
    // 門（前門在左、後門在右）
    [b.x0, b.x1].forEach((dx, j) => {
      if (b.doors && b.doors[j] === false) return;
      const o = s.door[i+"_"+j] || 0, x = j === 0 ? dx + 1 : dx - 13;
      R(x - 1, GROUND - 26, 14, 26, "#2a1e16"); R(x, GROUND - 25, 12, 25, "#14100c");
      const w = Math.round(12 * (1 - o * 0.75)), dc = b.door || "#6b4a2b";
      R(j === 0 ? x : x + 12 - w, GROUND - 25, w, 25, dc); if (w > 4){ R((j === 0 ? x : x + 12 - w) + 2, GROUND - 22, w - 4, 8, shade(dc, .15)); R((j === 0 ? x : x + 12 - w) + 2, GROUND - 11, w - 4, 8, shade(dc, .15)); P(j === 0 ? x + w - 2 : x + 13 - w, GROUND - 13, "#d9b75b"); }
      R(x - 2, GROUND - 28, 16, 2, shade(b.wall || "#b8a58a", -.4)); R(x - 3, GROUND, 18, 2, "#5a5a52");
    });
    g.restore();
    function P(x, y, c){ R(x, y, 1, 1, c); }
  }

  /* ---------- 畫 ---------- */
  function draw(){
    const { canvas, def, s, hooks } = cur, g = canvas.getContext("2d"), p = P();
    cur.g = g;
    g.imageSmoothingEnabled = false; p.ctx(g);
    g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,VW,VH);
    const cam = Math.round(s.cam);
    g.translate(-cam, 0);
    def.draw(p, s.t, hooks.opt(), cam, g);
    // 還沒查的證物：閃光（在外面看不到建築裡面的）
    hooks.spots().forEach(q => { const cx = q.r[0]+q.r[2]/2; if (q.k==="item" && q.fresh && !hiddenAt(s, cx, q.r[1]+q.r[3]/2) && Math.floor(s.t*2 + q.r[0]) % 3 !== 0) p.spark(cx, q.r[1]+2); });
    // 車
    if (s.car){ p.OBJ.car(s.car.x, GROUND-20, s.car.c); if (s.car.c==="#e9e4da"){ p.R(s.car.x+14,GROUND-22,4,2, Math.floor(s.t*4)%2?"#e04a3a":"#3a6ae0"); p.R(s.car.x+18,GROUND-22,4,2, Math.floor(s.t*4)%2?"#3a6ae0":"#e04a3a"); p.R(s.car.x,GROUND-11,40,2,"#2a3a6a"); } }
    // 人
    const b = bubbleNow();
    const talkingId = b && s.typed.length < b.text.length ? b.who : null;
    const list = hooks.people().map(q => ({ ...q, y:q.y||GROUND, kind:"npc" }));
    const hideYou = s.script && step() && step().hide;
    const buddy = hooks.buddy && hooks.buddy();
    if (buddy && !hideYou) list.push({ id:buddy.id, x:s.bx, y:s.by, L:buddy.L, kind:"buddy" });
    if (!hideYou) list.push({ id:"you", x:s.px, y:s.py, L:hooks.you, kind:"you" });
    list.sort((a,c) => (a.z||0) - (c.z||0) || a.y - c.y);
    const drawOne = q => {
      const talking = talkingId === q.id || (talkingId === "wu" && q.kind === "buddy");
      if (q.kind==="you" || q.kind==="buddy"){
        const moving = q.kind==="you" ? s.walking : s.bmove, face = q.kind==="you" ? s.face : s.bface;
        if (moving) PX.profile(q.x, q.y, q.L, Math.floor(s.t*8) + (q.kind==="buddy"?1:0), face);
        else { const a = alive({ x:q.x, pose:q.kind==="buddy" ? "hold" : "stand" }, s.t, talking); PX.person(q.x, q.y, { ...q.L, ...a.fx }, 1, face, a.pose); }
        return;
      }
      const a = alive(q, s.t, talking);
      PX.person(q.x, q.y + (q.dy||0), { ...q.L, ...a.fx, mood: q.mood || q.L.mood, tear: q.tear, sweat: q.sweat }, 1, q.facing||1, a.pose);
      if (a.puff) smoke(p, q.x + (q.facing||1)*-1, q.y - 30, s.t);
      if (q.mark) { p.R(q.x-2, q.y-38 + (Math.floor(s.t*3)%2), 5, 3, "#ffd04a"); p.R(q.x-1, q.y-35 + (Math.floor(s.t*3)%2), 3, 2, "#ffd04a"); }
    };
    // 先畫建築裡面的人，再蓋上外牆，最後畫外面的人
    list.filter(q => bldAt(q.x) >= 0).forEach(drawOne);
    // 外牆：在外面整棟蓋住；在裡面只蓋住不在的那一層
    blds().forEach((bd, i) => {
      if (bd.x1 < cam - 20 || bd.x0 > cam + VW + 20) return;
      levelsOf(bd).forEach((L, k) => {
        const a = 1 - lvVis(s, i, k); if (a <= 0.02) return;
        g.save(); g.beginPath(); g.rect(bd.x0 - 12, Math.max(-40, L.y0), bd.x1 - bd.x0 + 24, L.y1 - Math.max(-40, L.y0) + (k === levelsOf(bd).length - 1 ? 12 : 0)); g.clip();
        facade(p, bd, s.t, i, a); g.restore();
      });
    });
    list.filter(q => bldAt(q.x) < 0).forEach(drawOne);
    if (def.front) def.front(p, s.t, hooks.opt(), cam, s);
    g.setTransform(1,0,0,1,0,0);
    if (def.overlay) def.overlay(p, s.t, hooks.opt());
    // 對話框（HTML，字才清楚）
    const bub = cur.bub;
    if (b && bub){
      const who = b.who==="you" ? { x:s.px, y:s.py } : buddy && (b.who===buddy.id || b.who==="wu") ? { x:s.bx, y:s.by } : list.find(q=>q.id===b.who) || null;
      const name = b.name || (b.who==="you" ? "你" : hooks.nameOf(b.who));
      if (who){
        bub.hidden = false;
        bub.querySelector("b").textContent = name;
        bub.querySelector("span").textContent = s.typed;
        const ww = canvas.clientWidth, wh = canvas.clientHeight, bw = bub.offsetWidth, bh = bub.offsetHeight, hx = (who.x - cam) / VW * ww;
        const left = Math.max(4, Math.min(ww - bw - 4, hx - bw/2));
        const headY = (who.y - 34) / VH * wh;
        const top = Math.max(4, Math.min(headY - bh - 8, wh - bh - 4));
        bub.style.left = left + "px"; bub.style.top = top + "px";
        bub.style.setProperty("--tail", Math.max(10, Math.min(bw - 10, hx - left)) + "px");
      } else bub.hidden = true;
    } else if (bub) bub.hidden = true;
    if (cur.tip) cur.tip.textContent = s.script ? (step() && step().say ? "點一下跳到下一句 ▶" : "") : "";
    const sk = cur.canvas.parentNode.querySelector(".wskip"); if (sk) sk.hidden = !s.script;
  }

  return { mount, state, skip:() => cur && cur.s.script && skip(), VW, VH, GROUND, reset:(lid)=>{ delete st[lid]; } };
})();
