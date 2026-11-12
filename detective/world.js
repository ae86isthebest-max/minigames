/* =========================================================
   可以走動的橫向場景（動畫遊戲模式）
   - 畫面 240×135，場景可以比畫面寬，鏡頭跟著主角
   - 點地面：主角走過去；點人：走過去問話；點東西：走過去調查
   - 助手會跟在主角後面
   - 開場可以跑一段劇情（車開進來、助手交代案情）
   ========================================================= */
const WORLD = (() => {
  const VW = 240, VH = 135, GROUND = 124, SPEED = 60;
  const st = {};
  let cur = null;
  const P = () => PX.prim;

  function state(lid, def){
    return st[lid] || (st[lid] = { px:def.spawn||60, tx:null, face:1, cam:Math.max(0,(def.spawn||60)-VW/2), bx:(def.spawn||60)-20, bface:1, bmove:false, after:null, t:0, script:null, si:0, sT:0, car:null, typed:"", typeKey:"" });
  }

  function mount(canvas, def, lid, hooks){
    const s = state(lid, def);
    canvas.width = VW; canvas.height = VH;
    const wrap = canvas.parentNode, bub = wrap.querySelector(".wbubble"), tip = wrap.querySelector(".wtip");
    cur = { canvas, def, lid, hooks, s, bub, tip };
    if (s.px > def.w - 8) s.px = def.w - 30;
    if (!s.car && def.park !== undefined) s.car = { x:def.park, from:def.park, to:def.park, d:0, c:"#e9e4da" };
    if (hooks.script && !s.script && !hooks.scriptDone()){ s.script = hooks.script; s.si = 0; s.sT = 0; startStep(); }
    canvas.onclick = e => tap(e);
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
    if (k.set){ Object.assign(s, k.set); if (k.set.px!==undefined){ s.cam = Math.max(0, Math.min(cur.def.w-VW, s.px-VW/2)); } }
    if (k.walk){ const [who,x] = k.walk; if (who==="you") s.tx = x; else s.btx = x; }
    if (k.car) s.car = { x:k.car[0], from:k.car[0], to:k.car[1], d:k.car[2], c:k.car[3]||"#e9e4da" };
    if (k.set || k.carStop) { if (!k.say && !k.walk && !k.car && !k.wait) next(); }
  }
  function next(){ const s = cur.s; s.si++; startStep(); }

  /* ---------- 點擊 ---------- */
  function tap(e){
    const { canvas, s, hooks, def } = cur;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * VW / r.width + s.cam, y = (e.clientY - r.top) * VH / r.height;
    if (s.script){ const k = step(); if (k && k.say){ if (s.typed.length < k.say[1].length) s.typed = k.say[1]; else next(); } return; }
    const ppl = hooks.people();
    const buddy = hooks.buddy && hooks.buddy();
    const inBox = (bx,by,bw,bh) => x>=bx && x<=bx+bw && y>=by && y<=by+bh;
    const spots = hooks.spots();
    const fresh = spots.find(q => q.k==="item" && q.fresh && inBox(...q.r));
    if (fresh) return goThen(fresh.walk ?? (fresh.r[0]+fresh.r[2]/2), () => hooks.onSpot(fresh));
    const p = ppl.find(q => inBox(q.x-9, GROUND-31, 18, 32));
    if (p) return goThen(p.x + (s.px < p.x ? -16 : 16), () => { s.face = s.px < p.x ? 1 : -1; hooks.onPerson(p.id); });
    if (buddy && inBox(s.bx-9, GROUND-31, 18, 32)) return hooks.onBuddy ? hooks.onBuddy(buddy.id) : hooks.onPerson(buddy.id);
    const h = spots.filter(q => inBox(...q.r)).sort((a,b)=>a.r[2]*a.r[3]-b.r[2]*b.r[3])[0];
    if (h) return goThen(h.walk ?? (h.r[0]+h.r[2]/2), () => hooks.onSpot(h));
    hooks.onGround && hooks.onGround();
    goThen(Math.max(8, Math.min(def.w-8, x)), null);
  }
  function goThen(x, cb){ const s = cur.s; s.tx = x; s.after = cb; if (Math.abs(x - s.px) < 2){ s.tx = null; cb && cb(); } }

  /* ---------- 更新 ---------- */
  function update(dt){
    const { s, def } = cur; s.t += dt; s.sT += dt;
    if (s.tx !== null && s.tx !== undefined){
      const d = s.tx - s.px; s.face = d > 0 ? 1 : -1;
      const m = Math.min(Math.abs(d), SPEED*dt); s.px += Math.sign(d)*m; s.walking = true;
      if (Math.abs(s.tx - s.px) < 0.5){ s.px = s.tx; s.tx = null; s.walking = false; const cb = s.after; s.after = null; cb && cb(); if (s.script && step() && step().walk && step().walk[0]==="you") next(); }
    } else s.walking = false;
    // 助手跟著走
    let bt = s.btx !== undefined && s.btx !== null ? s.btx : s.px - 20*s.face;
    const bd = bt - s.bx;
    if (Math.abs(bd) > (s.btx!=null ? 0.5 : 6)){ s.bmove = true; s.bface = bd > 0 ? 1 : -1; s.bx += Math.sign(bd)*Math.min(Math.abs(bd), SPEED*0.95*dt); }
    else { s.bmove = false; if (s.btx!=null){ s.btx = null; if (s.script && step() && step().walk && step().walk[0]==="buddy") next(); } if (!s.walking) s.bface = s.px > s.bx ? 1 : -1; }
    // 車
    if (s.car && s.car.d){ const k = Math.min(1, s.sT / s.car.d); s.car.x = s.car.from + (s.car.to - s.car.from) * (1 - (1-k)*(1-k)); if (k>=1 && step() && step().car){ s.car.d = 0; next(); } }
    if (s.script && step() && step().wait && s.sT >= step().wait) next();
    // 鏡頭
    const target = Math.max(0, Math.min(def.w - VW, (s.car && s.script && step() && step().hide ? s.car.x+20 : s.px) - VW/2));
    s.cam += (target - s.cam) * Math.min(1, dt*4);
    // 對話框打字效果
    const b = bubbleNow();
    const key = b ? b.who + "|" + b.text : "";
    if (key !== s.typeKey){ s.typeKey = key; s.typed = ""; }
    if (b && s.typed.length < b.text.length) s.typed = b.text.slice(0, s.typed.length + Math.max(1, Math.round(dt*40)));
  }
  function bubbleNow(){
    const s = cur.s;
    if (s.script){ const k = step(); return k && k.say ? { who:k.say[0], text:k.say[1], name:k.name } : null; }
    return cur.hooks.bubble();
  }

  /* ---------- 畫 ---------- */
  function draw(){
    const { canvas, def, s, hooks } = cur, g = canvas.getContext("2d"), p = P();
    g.imageSmoothingEnabled = false; p.ctx(g);
    g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,VW,VH);
    const cam = Math.round(s.cam);
    g.translate(-cam, 0);
    def.draw(p, s.t, hooks.opt(), cam, g);
    // 還沒查的證物：閃光
    hooks.spots().forEach(q => { if (q.k==="item" && q.fresh && Math.floor(s.t*2 + q.r[0]) % 3 !== 0) p.spark(q.r[0]+q.r[2]/2, q.r[1]+2); });
    // 車
    if (s.car){ p.OBJ.car(s.car.x, GROUND-20, s.car.c); if (s.car.c==="#e9e4da"){ p.R(s.car.x+14,GROUND-22,4,2, Math.floor(s.t*4)%2?"#e04a3a":"#3a6ae0"); p.R(s.car.x+18,GROUND-22,4,2, Math.floor(s.t*4)%2?"#3a6ae0":"#e04a3a"); p.R(s.car.x,GROUND-11,40,2,"#2a3a6a"); } }
    // 人：先畫後面的，再畫前面的
    const list = hooks.people().map(q => ({ ...q, kind:"npc" }));
    const hideYou = s.script && step() && step().hide;
    const buddy = hooks.buddy && hooks.buddy();
    if (buddy && !hideYou) list.push({ id:buddy.id, x:s.bx, L:buddy.L, kind:"buddy" });
    if (!hideYou) list.push({ id:"you", x:s.px, L:hooks.you, kind:"you" });
    list.sort((a,b) => (a.z||0) - (b.z||0));
    list.forEach(q => {
      if (q.kind==="you"){ if (s.walking) PX.profile(q.x, GROUND, q.L, Math.floor(s.t*8), s.face); else PX.person(q.x, GROUND, q.L, 1, s.face, q.pose || (s.script ? "stand" : "stand")); }
      else if (q.kind==="buddy"){ if (s.bmove) PX.profile(q.x, GROUND, q.L, Math.floor(s.t*8)+1, s.bface); else PX.person(q.x, GROUND, q.L, 1, s.bface, "hold"); }
      else {
        const breathe = Math.floor(s.t*1.3 + q.x) % 2 === 0 ? 0 : 0;
        PX.person(q.x, GROUND + breathe + (q.dy||0), q.L, 1, q.facing||1, q.pose);
        if (q.mark) { p.R(q.x-2, GROUND-38 + (Math.floor(s.t*3)%2), 5, 3, "#ffd04a"); p.R(q.x-1, GROUND-35 + (Math.floor(s.t*3)%2), 3, 2, "#ffd04a"); }
      }
    });
    if (def.front) def.front(p, s.t, hooks.opt(), cam);
    g.setTransform(1,0,0,1,0,0);
    if (def.overlay) def.overlay(p, s.t, hooks.opt());
    // 對話框（HTML，字才清楚）
    const b = bubbleNow(), bub = cur.bub;
    if (b && bub){
      const who = b.who==="you" ? { x:s.px } : buddy && (b.who===buddy.id || b.who==="wu") ? { x:s.bx } : hooks.people().find(q=>q.id===b.who) || null;
      const name = b.name || (b.who==="you" ? "你" : hooks.nameOf(b.who));
      if (who){
        bub.hidden = false;
        bub.querySelector("b").textContent = name;
        bub.querySelector("span").textContent = s.typed;
        const ww = canvas.clientWidth, bw = bub.offsetWidth, hx = (who.x - cam) / VW * ww;
        const left = Math.max(4, Math.min(ww - bw - 4, hx - bw/2));
        bub.style.left = left + "px";
        bub.style.setProperty("--tail", Math.max(10, Math.min(bw - 10, hx - left)) + "px");
      } else bub.hidden = true;
    } else if (bub) bub.hidden = true;
    if (cur.tip) cur.tip.textContent = s.script ? (step() && step().say ? "點一下繼續 ▶" : "") : "";
  }

  return { mount, state, VW, VH, GROUND, reset:(lid)=>{ delete st[lid]; } };
})();
