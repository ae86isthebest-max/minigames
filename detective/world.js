// 「📍 地名」按鈕在哪裡：橫向在畫面左上角；直向在畫面下面（說明文字要跟著講對位置）
function pinWhere(){ try { return matchMedia("(orientation:portrait)").matches ? "畫面下面" : "左上角"; } catch(e){ return "左上角"; } }
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
    if (hooks.areaNow) hooks.areaNow(s.script ? null : (s.lastArea ?? null), !!s.script);
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
  // 站在某一層的地板上（不是在樓梯半路）
  const onLevel = v => Math.abs(v - GROUND) < 1 || floors().some(f => Math.abs(f.y - v) < 1);
  // 人在樓梯半路：回傳那座樓梯（def.stairs 的一項 { x0,y0 下端, x1,y1 上端, steps 級數 }）
  const stairAtXY = (x, y) => onLevel(y) ? null : stairs().find(k => x >= Math.min(k.x0,k.x1) - 1 && x <= Math.max(k.x0,k.x1) + 1);
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

  /* ---------- 走近才閃：還沒看過的證物、小細節 ----------
     「附近」＝跟主角在同一個區域（房間），或左右 40 格以內，而且在同一層樓。走到樓梯半路、劇情進行中都不閃。 */
  function nearYou(s, q){
    const cx = q.r[0] + q.r[2]/2, cy = q.r[1] + q.r[3]/2, wx = q.walk ?? cx;
    if (hiddenAt(s, cx, cy)) return false;
    const fy = q.walk !== undefined && bldAt(q.walk) < 0 ? GROUND : floorAt(cx, cy);
    if (Math.abs(fy - s.py) > 3) return false;
    if (Math.abs(wx - s.px) <= 40 || Math.abs(cx - s.px) <= 40) return true;
    const a = (cur.def.areas || []).find(a => s.px >= a.x0 && s.px <= a.x1 && Math.abs(s.py - (a.y ?? GROUND)) < 2);
    return !!a && ((cx >= a.x0 && cx <= a.x1) || (wx >= a.x0 && wx <= a.x1));
  }
  // 一顆很小的十字星光，沒有黑邊：每 3.2 秒亮半秒，同一個地方的幾樣東西輪流亮
  // 人的身體大概佔多大（比「點人」的範圍小）：閃光要避開、點擊要分辨「點在人身上」還是「點在旁邊露出來的東西」
  const onBody = (b, x, y) => Math.abs(x - b.x) <= 8 && y >= (b.y || GROUND) - 36 && y <= (b.y || GROUND) + 1;
  // 這樣東西要在哪裡閃：依序試幾個位置，挑第一個沒被人擋住的；整個都被擋住就回傳 free:false（照樣畫在人上面）
  const GPTS = [null, [0.2,0.3], [0.5,0.12], [0.88,0.6], [0.12,0.7], [0.5,0.88], [0.97,0.2], [0.03,0.2], [0.5,0.5]];
  function glintAt(r, bl){
    const first = [r[2] > 8 ? 0.7 : 0.5, r[3] > 8 ? 0.3 : 0.5];
    for (const f of GPTS){ const [fx, fy] = f || first, x = Math.round(r[0] + (r[2]-1) * fx), y = Math.round(r[1] + (r[3]-1) * fy); if (!bl.some(b => onBody(b, x, y))) return { x, y, free:true }; }
    return { x: Math.round(r[0] + (r[2]-1) * first[0]), y: Math.round(r[1] + (r[3]-1) * first[1]), free:false };
  }
  function glint(p, g, s, q, i, bl){
    const T = 3.2, ph = (((s.t - (s.areaT || 0)) + T - 0.25 - (i % 6) * 0.35) % T + T) % T;
    if (ph > 0.55) return;
    const k = Math.sin(Math.PI * ph / 0.55);                       // 0→1→0
    const { x, y } = glintAt(q.r, bl || []);
    // 亮底（白牆、冰箱）和暗底都要看得到：金色的十字＋白色的芯，最亮的那一下四個角落有很淡的暗點襯底
    g.save();
    if (k > 0.75){ g.globalAlpha = 0.22; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy]) => p.R(x+dx, y+dy, 1, 1, "#2a1c0c")); }
    g.globalAlpha = 0.45 + 0.5 * k;
    if (k > 0.75){ p.R(x-2, y, 5, 1, "#ffc93a"); p.R(x, y-2, 1, 5, "#ffc93a"); }
    else if (k > 0.35){ p.R(x-1, y, 3, 1, "#ffc93a"); p.R(x, y-1, 1, 3, "#ffc93a"); }
    g.globalAlpha = Math.min(1, 0.55 + 0.5 * k); p.R(x, y, 1, 1, "#ffffff");
    g.restore();
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
    const free = !hooks.noFreeWalk;
    if (bi >= 0 && bi === inside && hiddenAt(s, x, y)){ s.lastTap = "ground"; hooks.onGround && hooks.onGround(); return free ? goThen(x, floorAt(x, y), null) : null; }
    if (bi >= 0 && bi !== inside && (s.rv[bi]||0) < 0.5){
      if (!free){ s.lastTap = "ground"; hooks.onGround && hooks.onGround(); return; }
      const b = blds()[bi], d = Math.abs(s.px - b.x0) < Math.abs(s.px - b.x1) ? b.x0 + 10 : b.x1 - 10;
      s.lastTap = "ground"; hooks.onGround && hooks.onGround();
      return goThen(d, GROUND, null);
    }
    const ppl = hooks.people();
    const buddy = hooks.buddy && hooks.buddy();
    const inBox = (bx,by,bw,bh) => x>=bx && x<=bx+bw && y>=by && y<=by+bh;
    const spots = hooks.spots();
    const target = q => { const cx = q.r[0]+q.r[2]/2, fy = floorAt(cx, q.r[1]+q.r[3]/2); return [q.walk ?? cx, fy]; };
    // 點的範圍放大：再小的東西，可以點的範圍也至少有一根手指那麼大（大約 44 CSS 像素；畫面很小時最多放大到 22 格）
    const FING = Math.min(22, Math.max(10, 44 * VW / r.width));
    const big = q => { const mx = Math.max(4, (FING - q[2]) / 2), my = Math.max(4, (FING - q[3]) / 2); return [q[0]-mx, q[1]-my, q[2]+mx*2, q[3]+my*2]; };
    const dist = q => Math.hypot(Math.max(q[0]-x, 0, x-q[0]-q[2]), Math.max(q[1]-y, 0, y-q[1]-q[3]));
    const inBig = q => inBox(...big(q)), inR = q => inBox(q[0]-5, q[1]-5, q[2]+10, q[3]+10);
    // 還沒看過的東西優先（證物的範圍多 5 格；小細節要正好點中）。它前面站著人的時候：
    // 點在人身上＝找那個人；點在旁邊露出來的部分＝看東西；整個被人擋住的小東西，點下去先看東西（看過之後才輪到人）
    const bodies = ppl.map(q => ({ x:q.x, y:q.y || GROUND })); if (buddy) bodies.push({ x:s.bx, y:s.by });
    const onSomeone = bodies.some(b => onBody(b, x, y));
    const fresh = spots.filter(q => q.fresh && !hiddenAt(s, q.r[0]+q.r[2]/2, q.r[1]+q.r[3]/2)
      && (onSomeone ? inBox(...q.r) && !glintAt(q.r, [...bodies, { x:s.px, y:s.py }]).free : q.k==="item" ? inR(q.r) : inBox(...q.r))).sort((a,c) => dist(a.r) - dist(c.r) || a.r[2]*a.r[3] - c.r[2]*c.r[3])[0];
    if (fresh){ const [tx,ty] = target(fresh); return goThen(tx, ty, () => hooks.onSpot(fresh)); }
    const p = ppl.filter(q => inBox(q.x-13, (q.y||GROUND)-36, 26, 38)).sort((a,c) => Math.abs(a.x-x) - Math.abs(c.x-x))[0];
    if (p) return goThen(p.x + (s.px < p.x ? -16 : 16), p.y||GROUND, () => { s.face = s.px < p.x ? 1 : -1; hooks.onPerson(p.id); });
    if (buddy && inBox(s.bx-10, s.by-33, 20, 34)) return hooks.onBuddy ? hooks.onBuddy(buddy.id) : hooks.onPerson(buddy.id);
    // 其他可以看的東西（小細節、看過的證物）：正好點中的優先（重疊時取小的那個）；沒點中就取放大範圍裡最近的
    const h = spots.filter(q => inBox(...q.r)).sort((a,b)=>a.r[2]*a.r[3]-b.r[2]*b.r[3])[0]
      || spots.filter(q => inBig(q.r) && !hiddenAt(s, q.r[0]+q.r[2]/2, q.r[1]+q.r[3]/2)).sort((a,c) => dist(a.r) - dist(c.r))[0];
    if (h){ const [tx,ty] = target(h); return goThen(tx, ty, () => hooks.onSpot(h)); }
    // 什麼都沒點中：附近有沒查過的東西，就當作點它
    const near = spots.filter(q => q.k==="item" && q.fresh && dist(q.r) < 12).sort((a,c) => dist(a.r) - dist(c.r))[0];
    if (near){ const [tx,ty] = target(near); return goThen(tx, ty, () => hooks.onSpot(near)); }
    s.lastTap = "ground";
    hooks.onGround && hooks.onGround();
    if (!free) return;   // 不能隨便亂走：用「🚶 去哪裡」選地方
    const fy = floorAt(x, y);
    goThen(x, fy, null);
  }
  function goThen(x, y, cb){
    const s = cur.s; x = clampX(x, y);
    s.after = cb;
    let sx = s.px, sy = s.py, pre = [];
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
    if (h && !s.script && !cur.hooks.noFreeWalk && (h.moved || (h.kind === "ground" && performance.now() - h.t > 280))){
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
      if (Math.abs(s.py - wasY) > 0.01) s.vy = s.py < wasY ? -1 : 1;
      if (Math.hypot(tx - s.px, ty - s.py) < 0.5){
        s.px = tx; s.py = ty; s.path.shift();
        if (!s.path.length){ s.walking = false; const cb = s.after; s.after = null; cb && cb(); if (s.script && step() && step().walk && step().walk[0]==="you") next(); }
      }
    } else s.walking = false;
    // 走進一個新的地方：主角自己說一句（第一次才說；沒什麼特別的地方也會說）
    if (!s.script && cur.def.areas){
      const ar = cur.def.areas.find(a => s.px >= a.x0 && s.px <= a.x1 && Math.abs(s.py - (a.y ?? GROUND)) < 2);
      const aid = ar ? ar.id : null;
      if (aid !== s.lastArea){
        s.lastArea = aid; s.areaT = s.t;
        cur.hooks.areaNow && cur.hooks.areaNow(aid, false);
        if (ar && !(cur.hooks.areaSeen && cur.hooks.areaSeen(ar.id))){
          const ph = (cur.hooks.opt() || {}).phase || 0;
          const text = typeof ar.text === "function" ? ar.text(ph) : Array.isArray(ar.text) ? ar.text[Math.min(ph, ar.text.length - 1)] : ar.text;
          if (text){ s.areaSay = { text, until: s.t + 2 + text.length / 7 }; cur.hooks.onArea && cur.hooks.onArea(ar.id); }
        }
      }
    }
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
      // 助手跟在後面 BACK 那麼遠；但主角停下來時，助手不可以停在樓梯半路（下半身會被樓板擋住）：
      // 讓他把樓梯走完，如果這樣太貼近主角，就站到主角的另一邊
      let fd = BACK, [gx, gy] = trailBack(s, fd);
      if (!s.walking){
        while (!onLevel(gy) && fd > 0){ fd = Math.max(0, fd - 2); [gx, gy] = trailBack(s, fd); }
        if (fd < 10 && onLevel(s.by) && Math.abs(s.by - s.py) < 1){
          if (!s.bside){ s.bside = s.face || 1; if (Math.abs(clampX(s.px + s.bside*14, s.py) - s.px) < 9) s.bside = -s.bside; }
          gy = s.py; gx = clampX(s.px + s.bside*14, gy);
        }
      } else s.bside = 0;
      const dd = Math.hypot(gx - s.bx, gy - s.by);
      if (dd > 0.5){ const m = Math.min(dd, SPEED*Math.max(1.05, s.spd*1.05)*dt); s.bx += (gx-s.bx)/dd*m; s.by += (gy-s.by)/dd*m; }
    }
    s.bmove = Math.hypot(s.bx-obx, s.by-oby) > 0.05;
    if (Math.abs(s.by - oby) > 0.01) s.bvy = s.by < oby ? -1 : 1;
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
    // 右邊有選單蓋住畫面時，鏡頭往右移一點，讓主角和對話的人留在看得到的地方
    const cov = cur.hooks.cover ? cur.hooks.cover() : 0;
    const target = Math.max(0, Math.min(def.w - VW, (s.car && s.script && step() && step().hide ? s.car.x+20 : s.px) - VW/2 + cov*VW/2));
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
    const hb = cur.hooks.bubble();
    if (hb) return hb;
    if (s.areaSay && s.t < s.areaSay.until) return { who:"you", text:s.areaSay.text, name:"你" };
    return null;
  }

  /* ---------- 地面的質感：有深度、有碎石裂縫，近處暗一點 ---------- */
  function groundFx(p, g, cam){
    const x0 = Math.floor(cam / 2) * 2 - 4, x1 = cam + VW + 4;
    g.save();
    g.globalAlpha = 0.16; p.R(x0, GROUND + 1, x1 - x0, 1, "#ffffff");                 // 地面前緣反光
    for (let k = 0; k < 4; k++){ g.globalAlpha = 0.07 + k * 0.05; p.R(x0, GROUND + 7 + k, x1 - x0, 1, "#000000"); }   // 越近越暗
    for (let x = x0; x < x1; x += 2){
      const h = ((x * 2654435761) >>> 0) % 997;                                  // 固定的亂數（跟著世界座標，不會閃）
      if (h % 7 === 0){ g.globalAlpha = 0.28; p.R(x, GROUND + 2 + (h % 7), 1 + (h % 2), 1, "#000000"); }
      if (h % 11 === 0){ g.globalAlpha = 0.22; p.R(x, GROUND + 3 + (h % 5), 1, 1, "#ffffff"); }
      if (h % 53 === 0){ g.globalAlpha = 0.3; p.R(x, GROUND + 4 + (h % 4), 3 + (h % 3), 1, "#000000"); p.R(x + 1, GROUND + 3 + (h % 4), 2, 1, "#000000"); }   // 裂縫、小坑
      if (h % 41 === 0){ g.globalAlpha = 0.35; p.R(x, GROUND + 6 + (h % 3), 2, 2, "#000000"); g.globalAlpha = 0.25; p.R(x, GROUND + 6 + (h % 3), 1, 1, "#ffffff"); }   // 小石頭
    }
    g.restore();
  }
  /* ---------- 可以點的指示牌：上樓／下樓、進去／出去、【···】秘道 ----------
     不用按住拖著走：點一下指示牌，主角自己走過去。
     def.secrets = [{ id, x, y, walk, fy, text, when(opt) }]：牆上出現【···】，代表這裡好像有秘道或暗門；
     點了會走過去，觸發 hooks.onSecret(secret)（之後的劇本可以用它打開新的地方）。 */
  function navList(s){
    const out = [], onLv = v => Math.abs(s.py - v) < 1, curB = bldAt(s.px);
    if (s.script || s.path.length) return out;
    if (!cur.hooks.noFreeWalk) stairs().forEach((k, i) => {
      const bi = bldAt((k.x0 + k.x1) / 2); if (bi >= 0 && (s.rv[bi] || 0) < 0.5) return;
      const lo = k.y0 >= k.y1 ? [k.x0, k.y0] : [k.x1, k.y1], hi = k.y0 >= k.y1 ? [k.x1, k.y1] : [k.x0, k.y0];
      if (onLv(lo[1])) out.push({ key:"su" + i, x:(lo[0] + hi[0]) / 2, y:(lo[1] + hi[1]) / 2 - 4, label:"⬆ 上二樓", to:hi });
      if (onLv(hi[1])) out.push({ key:"sd" + i, x:(lo[0] + hi[0]) / 2, y:(lo[1] + hi[1]) / 2 + 10, label:"⬇ 下一樓", to:lo });
    });
    if (!cur.hooks.noFreeWalk) blds().forEach((b, i) => {
      const covered = (s.rv[i] || 0) < 0.5;
      [b.x0, b.x1].forEach((dx, j) => {
        if (b.doors && b.doors[j] === false) return;
        if (covered && curB !== i) out.push({ key:`d${i}_${j}`, x:dx + (j ? -6 : 6), y:GROUND - 45, label:"🚪 進去", to:[dx + (j ? -10 : 10), GROUND] });
        else if (!covered && curB === i && onLv(GROUND)) out.push({ key:`o${i}_${j}`, x:dx + (j ? -8 : 8), y:GROUND - 45, label: j ? "出去 ➜" : "⬅ 出去", to:[dx + (j ? 14 : -14), GROUND] });
      });
    });
    if (cur.hooks.noFreeWalk && cur.def.areas) out.push(...areaArrows(s));
    (cur.def.secrets || []).filter(q => !q.when || q.when(cur.hooks.opt())).forEach(q => out.push({ key:"x" + q.id, x:q.x, y:q.y, label:"【···】", secret:q, to:[q.walk ?? q.x, q.fy ?? GROUND] }));
    return out;
  }
  // 不能隨便走的時候：畫面上出現往旁邊區域的箭嘴（⬅ 客廳、🚪 大門 ➜、⬆ 二樓書房），點了就走過去
  function areaArrows(s){
    const A = cur.def.areas.filter(a => !a.hide && !(a.when && !a.when(cur.hooks.opt()))), ay = a => a.y ?? GROUND;
    const here = A.find(a => s.px >= a.x0 && s.px <= a.x1 && Math.abs(s.py - ay(a)) < 2);
    if (!here) return [];
    const nm = a => a.name || (cur.hooks.areaName ? cur.hooks.areaName(a.id) : a.id);
    const door = x => blds().some(b => Math.abs(b.x0 - x) < 8 || Math.abs(b.x1 - x) < 8);
    const mid = a => [(a.x0 + a.x1) / 2, ay(a)], out = [], fy = ay(here);
    const same = A.filter(a => a !== here && ay(a) === fy);
    const L = same.filter(a => a.x1 <= here.x0 + 2 && a.x1 >= here.x0 - 8)[0], R = same.filter(a => a.x0 >= here.x1 - 2 && a.x0 <= here.x1 + 8)[0];
    if (L) out.push({ key:"aL" + L.id, x:here.x0 + 6, y:fy + 10, label:(door(here.x0) ? "🚪 " : "⬅ ") + nm(L), to:mid(L), edge:-1, area:L.id });
    if (R) out.push({ key:"aR" + R.id, x:here.x1 - 6, y:fy + 10, label:nm(R) + (door(here.x1) ? " 🚪" : " ➜"), to:mid(R), edge:1, area:R.id });
    stairs().forEach((k, i) => {
      [[k.x0, k.y0, k.x1, k.y1], [k.x1, k.y1, k.x0, k.y0]].forEach(([ax, ayy, bx, by]) => {
        if (Math.abs(ayy - fy) > 1 || ax < here.x0 - 4 || ax > here.x1 + 4) return;
        const other = A.filter(a => Math.abs(ay(a) - by) < 2).sort((a, c) => Math.abs((a.x0 + a.x1) / 2 - bx) - Math.abs((c.x0 + c.x1) / 2 - bx))
          .find(a => bx >= a.x0 - 4 && bx <= a.x1 + 4) || A.filter(a => Math.abs(ay(a) - by) < 2).sort((a, c) => Math.abs((a.x0 + a.x1) / 2 - bx) - Math.abs((c.x0 + c.x1) / 2 - bx))[0];
        if (!other || out.some(o => o.area === other.id)) return;
        out.push({ key:"aS" + i + other.id, x:(ax + bx) / 2, y:Math.min(ayy, by) + (by < ayy ? -6 : 18), label:(by < ayy ? "⬆ 上樓・" : "⬇ 下樓・") + nm(other), to:mid(other), area:other.id });
      });
    });
    return out;
  }
  function navButtons(s, cam, wrapEl, cw, chh){
    cur.nav = cur.nav || {};
    const list = navList(s), keep = new Set();
    list.forEach(n => {
      let sx = (n.x - cam) / VW * cw;
      if (!n.edge && (sx < 10 || sx > cw - 10)) return;
      keep.add(n.key);
      let el = cur.nav[n.key];
      if (!el){
        el = cur.nav[n.key] = document.createElement("button"); el.className = "wnav" + (n.secret ? " secret" : "") + (n.area ? " go" : ""); wrapEl.appendChild(el);
        el.onpointerdown = e => e.stopPropagation();
      }
      el.textContent = n.label;
      el.onclick = e => { e.stopPropagation(); const q = n.secret; cur.hooks.onGround && !q && cur.hooks.onGround(); goThen(n.to[0], n.to[1], q ? () => cur.hooks.onSecret && cur.hooks.onSecret(q) : n.area && cur.hooks.onArrive ? () => cur.hooks.onArrive(n.area) : null); };
      if (n.edge){ const cov = (cur.hooks.cover ? cur.hooks.cover() : 0) * cw, hw = (el.offsetWidth || 120) / 2 + 6; sx = Math.max(hw, Math.min(cw - cov - hw, sx)); }   // 往旁邊的箭嘴：走到畫面外就貼在邊上
      el.style.left = sx + "px"; el.style.top = (n.y / VH * chh) + "px"; el.hidden = false;
    });
    Object.keys(cur.nav).forEach(k => { if (!keep.has(k)) cur.nav[k].hidden = true; });
  }
  // 頭上的小箭嘴：顏色代表狀態（hooks.people 給 arrow 顏色；mark＝正在跟你說話，箭嘴大一點、跳得比較快）
  function arrow(p, q, t){
    if (!q.arrow) return;
    const sit = /sit|kneel/.test(q.pose || ""), top = q.y - (sit ? 33 : 40) + (q.dy || 0);
    const bob = Math.round(Math.sin(t * (q.mark ? 7 : 3.5) + q.x * 0.1) * (q.mark ? 1.5 : 1)), y = top + bob, c = q.arrow;
    if (q.blink && Math.floor(t * 3) % 3 === 0) return;
    const ink = "#1b1512";
    p.R(q.x - 4, y - 1, 9, 1, ink); p.R(q.x - 4, y, 9, 2, c); p.R(q.x - 5, y, 1, 2, ink); p.R(q.x + 5, y, 1, 2, ink);
    p.R(q.x - 3, y + 2, 7, 1, c); p.R(q.x - 2, y + 3, 5, 1, c); p.R(q.x - 1, y + 4, 3, 1, c); p.P(q.x, y + 5, c);
    p.P(q.x - 4, y + 2, ink); p.P(q.x + 4, y + 2, ink); p.P(q.x - 3, y + 3, ink); p.P(q.x + 3, y + 3, ink); p.P(q.x - 2, y + 4, ink); p.P(q.x + 2, y + 4, ink); p.P(q.x - 1, y + 5, ink); p.P(q.x + 1, y + 5, ink); p.P(q.x, y + 6, ink);
    p.R(q.x - 3, y, 2, 1, "#ffffff");
  }
  // 腳下的影子
  function shadowAt(p, g, x, y, w){ g.save(); g.globalAlpha = 0.3; p.R(x - w/2, y - 1, w, 2, "#000000"); g.globalAlpha = 0.18; p.R(x - w/2 + 2, y + 1, w - 4, 1, "#000000"); g.restore(); }

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
    if (!def.noGroundFx) groundFx(p, g, cam);
    // 還沒查的證物：閃光（在外面看不到建築裡面的）
    if (!hooks.noSpark) hooks.spots().forEach(q => { const cx = q.r[0]+q.r[2]/2; if (q.k==="item" && q.fresh && !hiddenAt(s, cx, q.r[1]+q.r[3]/2) && Math.floor(s.t*2 + q.r[0]) % 3 !== 0) p.spark(cx, q.r[1]+2); });
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
      // 上下樓梯：一級一級踏（腳踩在梯級上，不是沿著斜線滑上去）
      const me = q.kind==="you" || q.kind==="buddy", k = me ? stairAtXY(q.x, q.y) : null;
      const sr = k ? PX.stairAt([k.x0,k.y0,k.x1,k.y1,k.steps], q.x, (((q.kind==="you" ? s.vy : s.bvy) < 0) === (k.y1 < k.y0)) ? 1 : -1) : null;
      if (sr) q = { ...q, y: sr.y };
      if (!/lie|fall/.test(q.pose || "")) shadowAt(p, g, q.x, q.y, /sit|kneel/.test(q.pose || "") ? 16 : 13);
      const talking = talkingId === q.id || (talkingId === "wu" && q.kind === "buddy");
      if (me){
        const moving = q.kind==="you" ? s.walking : s.bmove, face = q.kind==="you" ? s.face : s.bface;
        if (sr) PX.profile(q.x, q.y, q.L, sr.frame, face, { stair: sr.stair });
        else if (moving) PX.profile(q.x, q.y, q.L, Math.floor(s.t*8) + (q.kind==="buddy"?1:0), face);
        else { const a = alive({ x:q.x, pose:q.kind==="buddy" ? "hold" : "stand" }, s.t, talking); PX.person(q.x, q.y, { ...q.L, ...a.fx }, 1, face, a.pose); }
        if (q.kind==="buddy" && !s.script) arrow(p, { ...q, arrow:"#6fd46f" }, s.t);
        return;
      }
      const a = alive(q, s.t, talking);
      PX.person(q.x, q.y + (q.dy||0), { ...q.L, ...a.fx, mood: q.mood || q.L.mood, tear: q.tear, sweat: q.sweat }, 1, q.facing||1, a.pose);
      if (a.puff) smoke(p, q.x + (q.facing||1)*-1, q.y - 30, s.t);
      arrow(p, q, s.t);
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
    // 主角走到附近，還沒看過的東西才會微微閃一下（不是整個畫面都亮，還是要自己走過去）。
    // 畫在所有人的上面，而且會挑東西上「沒有被人擋住」的位置來閃，所以站在前面的人擋不住它
    if (!s.script && !hooks.noGlint){
      if (!s.gl || s.t < s.glT || s.t - s.glT > 0.25){ s.gl = hooks.spots().filter(q => q.fresh); s.glT = s.t; }   // 清單每 1/4 秒才重算一次，省電
      let i = 0; s.gl.forEach(q => { if (nearYou(s, q)) glint(p, g, s, q, i++, list); });
    }
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
        const cw0 = canvas.clientWidth, ww = cw0 * (1 - (hooks.cover ? hooks.cover() : 0));
        bub.style.maxWidth = Math.round(ww * 0.9) + "px";
        const wh = canvas.clientHeight, bw = bub.offsetWidth, bh = bub.offsetHeight, hx = (who.x - cam) / VW * cw0;
        const left = Math.max(4, Math.min(ww - bw - 4, hx - bw/2));
        const headY = (who.y - 34) / VH * wh;
        const top = Math.max(4, Math.min(headY - bh - 8, wh - bh - 4));
        bub.style.left = left + "px"; bub.style.top = top + "px";
        bub.style.setProperty("--tail", Math.max(10, Math.min(bw - 10, hx - left)) + "px");
      } else bub.hidden = true;
    } else if (bub) bub.hidden = true;
    // 招牌上的字（HTML，中文才看得清楚）：building.labels = [{ x, y, text, color, size, when:"out"|"in" }]
    const wrapEl = canvas.parentNode, cw = canvas.clientWidth, chh = canvas.clientHeight;
    cur.lab = cur.lab || {};
    blds().forEach((bd, i) => (bd.labels || []).forEach((L, j) => {
      const key = i + "_" + j; let el = cur.lab[key];
      if (!el){ el = cur.lab[key] = document.createElement("div"); el.className = "wsign"; el.textContent = L.text; wrapEl.appendChild(el); }
      const rv = s.rv[i] || 0, a = L.when === "in" ? rv : 1 - rv, sx = (L.x - cam) / VW * cw;
      el.style.opacity = a < 0.05 || sx < -80 || sx > cw + 80 ? 0 : a;
      el.style.left = sx + "px"; el.style.top = (L.y / VH * chh) + "px";
      el.style.fontSize = ((L.size || 6.5) / VW * cw) + "px"; el.style.color = L.color || "#fff8e8";
    }));
    navButtons(s, cam, wrapEl, cw, chh);
    if (cur.tip) cur.tip.textContent = s.script ? (step() && step().say ? "點一下跳到下一句 ▶" : "") : "";
    const sk = cur.canvas.parentNode.querySelector(".wskip"); if (sk) sk.hidden = !s.script;
  }

  // (x, y) 是不是在一棟「現在看得到裡面」的建築裡（雨不要下在室內）：回傳 0～1
  function indoor(x, y){ if (!cur) return 0; const i = bldAt(x); if (i < 0) return 0; const b = blds()[i]; if (y < (b.y0 ?? 0)) return 0; if ((b.open || []).some(r => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3])) return 0; const k = levelAt(b, y); return lvVis(cur.s, i, k < 0 ? 0 : k); }
  // 外面叫主角走到某個地方（選地方移動用）：到了再呼叫 cb
  function goTo(x, y, cb){ if (!cur || cur.s.script) return false; goThen(x, y ?? GROUND, cb); return true; }
  return { mount, state, indoor, goTo, walking:() => !!(cur && cur.s.path.length), levelVis:(i, k) => cur ? lvVis(cur.s, i, k) : 0, skip:() => cur && cur.s.script && skip(), nearYou:q => !!cur && !cur.s.script && nearYou(cur.s, q), glintAt:q => { if (!cur) return null; const s = cur.s, bl = cur.hooks.people().map(v => ({ x:v.x, y:v.y || GROUND })); if (cur.hooks.buddy && cur.hooks.buddy()) bl.push({ x:s.bx, y:s.by }); bl.push({ x:s.px, y:s.py }); return glintAt(q.r, bl); }, VW, VH, GROUND, reset:(lid)=>{ delete st[lid]; } };
})();
