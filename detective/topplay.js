/* =========================================================
   真相動畫（俯視版）：用遊戲裡同一間房（topdown 的房間）＋ sprite2 的逐格動作播一段經過。
   跟 PX.play 一樣的用法：TOPPLAY.play(canvas, A, looks, onCap, auto) → { toggle, restart }
   A = { rooms, room, cam:[x,y], side(p, g, t, flags) 近鏡背景, flags:{ 開頭的物件狀態 }, apply(flags) 畫房間前呼叫,
         beats:[ { t:"22:00:00", d:秒, cap:"字幕", shot:"room"|"side", zoom:[中心x, 中心y, 倍數],
                   m:{ id:[x, y, 動作, 面向, 正面/背面, 拿著什麼, 經過的點[[x,y]…]] }, out:[id…], set:{…}, setF:0～1 } ] }
   - 位置跟上一段不同就先走過去（走路 8 格），到了才做動作；動作 null＝站著。
   - 近鏡（shot:"side"）：畫面放大兩倍，背景用 A.side 畫，人一律側面。
   ========================================================= */
const TOPPLAY = (() => {
  const VW = 288, VH = 162, GAP = 0.5;
  const ONCE = new Set(["openDoor", "drawer", "switch", "pickup", "reach", "give", "knock", "point", "slump", "sitClutch", "drinkFall", "fallBack", "fallFwd", "fallHigh"]);
  const fmt = s => { const m = String(s || "").match(/(\d{1,2}):(\d{2})/); return m ? m[1].padStart(2, "0") + ":" + m[2] : ""; };

  function play(canvas, A, looks, onCap, auto = true){
    canvas.width = VW; canvas.height = VH;
    const g = canvas.getContext("2d"), p = PX.prim;
    const total = A.beats.reduce((n, b) => n + GAP + b.d, 0);
    let paused = !auto, t0 = performance.now(), pauseAt = auto ? 0 : 0.6, lastCap = null;
    const now = () => paused ? pauseAt : (performance.now() - t0) / 1000;

    // 某一秒：每個人在哪、做什麼；物件狀態
    function stateAt(sec){
      const who = { room:{}, side:{} }, flags = { ...(A.flags || {}) };
      let el = 0, beat = A.beats[0], bi = 0, bp = 0;
      for (let i = 0; i < A.beats.length; i++){
        const b = A.beats[i], start = el + GAP, shot = b.shot || "room";
        if (sec < el) break;
        const pr = sec < start ? 0 : Math.min(1, (sec - start) / b.d);
        beat = b; bi = i; bp = pr;
        if (b.set && pr >= (b.setF ?? 0)) Object.assign(flags, b.set);
        const W = who[shot];
        Object.entries(b.m || {}).forEach(([id, v]) => {
          const via = v[6] || [], first = !W[id];   // 第一次出現：從經過的第一點（例如門口）走進來
          const prev = W[id] || (via.length ? { x:via[0][0], y:via[0][1] } : { x:v[0], y:v[1] });
          const pts = [[prev.x, prev.y], ...(first ? via.slice(1) : via), [v[0], v[1]]];
          const segs = pts.slice(1).map((q, j) => Math.hypot(q[0] - pts[j][0], q[1] - pts[j][1])), tot = segs.reduce((a, c) => a + c, 0);
          const travel = tot > 0.5, pm = travel ? Math.min(1, pr / (v[2] ? 0.72 : 1)) : 1;
          let d = pm * tot, j = 0; while (j < segs.length - 1 && d > segs[j]){ d -= segs[j]; j++; }
          const q0 = pts[j], q1 = pts[j + 1] || q0, u = segs[j] ? Math.min(1, d / segs[j]) : 1;
          const x = q0[0] + (q1[0] - q0[0]) * u, y = q0[1] + (q1[1] - q0[1]) * u, moving = travel && pm < 1;
          const dx = q1[0] - q0[0], dy = q1[1] - q0[1];
          const actT = Math.max(0, sec - start - (travel && v[2] ? b.d * 0.72 : 0));
          W[id] = { id, x, y, moving, walkD:d + j * 50, act:moving ? "walk" : (v[2] || "idle"), actT,
            face:moving && Math.abs(dx) > Math.abs(dy) * 0.8 ? (dx < 0 ? -1 : 1) : (v[3] || prev.face || 1),
            dir:moving ? (Math.abs(dx) > Math.abs(dy) * 0.8 ? "side" : dy < 0 ? "up" : "down") : (v[4] === "back" ? "up" : v[4] === "front" ? "down" : "side"),
            carry:v[5] || null };
        });
        (b.out || []).forEach(id => { if (pr >= 1) delete W[id]; });
        el = start + b.d;
      }
      return { who, flags, beat, bi, bp, shot:beat.shot || "room" };
    }

    function drawPerson(q, t, side){
      const L = looks(q.id); if (!L) return;
      const act = q.act === "idle" && !SP.ACTS.idle ? "idle" : q.act, n = SP.frames(act);
      const view = side || (act !== "walk" && act !== "idle") ? "side" : q.dir === "up" ? "back" : q.dir === "down" ? "front" : "side";
      const f = act === "walk" ? Math.floor(q.walkD / 3.2) % 8 : ONCE.has(act) ? Math.min(n - 1, Math.floor(q.actT * 4)) : Math.floor(q.actT * (act === "idle" ? 2 : 4)) % n;
      g.save(); g.globalAlpha = .28; g.fillStyle = "#000"; g.beginPath(); g.ellipse(Math.round(q.x), Math.round(q.y), 7, 2.2, 0, 0, 7); g.fill(); g.restore();
      SP.draw(g, q.x, q.y, L, { view, facing:q.face, act, f });
      if (q.carry === "bucket"){ const bx = Math.round(q.x + (view === "side" ? q.face * 7 : 0)) - 3, by = Math.round(q.y) - 20;
        p.R(bx - 1, by - 1, 8, 8, "#1a1410"); p.R(bx, by, 6, 6, "#b8c0c8"); p.R(bx, by, 6, 1, "#e9f2f6"); p.R(bx + 1, by + 1, 4, 1, "#e9f2f6"); }
    }

    function render(){
      if (!canvas.isConnected) return false;
      const sec = Math.min(now(), total), S = stateAt(sec), t = sec;
      g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; p.ctx(g); g.fillStyle = "#0b0a09"; g.fillRect(0, 0, VW, VH);
      if (S.shot === "side"){
        g.save(); g.scale(2, 2); A.side(p, g, t, S.flags);
        Object.values(S.who.side).sort((a, c) => a.y - c.y).forEach(q => drawPerson(q, t, true));
        g.restore();
      } else {
        const R = A.rooms[S.beat.room || A.room], z = S.beat.zoom;
        let cx = (A.cam || [0, 0])[0], cy = (A.cam || [0, 0])[1], k = 1;
        if (z){ k = z[2] || 2; cx = z[0] - VW / k / 2; cy = z[1] - VH / k / 2; }
        g.save(); g.scale(k, k); g.translate(-Math.round(cx), -Math.round(cy));
        A.apply && A.apply(S.flags, looks);
        R.floor(p, g, t, {});
        const list = (R.props || []).map(pr => ({ y:pr.y, prop:pr })).concat(Object.values(S.who.room));
        list.sort((a, c) => a.y - c.y).forEach(q => q.prop ? q.prop.draw(p, g, t, {}) : drawPerson(q, t));
        if (R.front) R.front.call(R, p, g, t, {});
        A.apply && A.apply(null);
        g.restore();
      }
      // 字幕
      const cap = S.beat ? (fmt(S.beat.t) ? fmt(S.beat.t) + "　" : "") + S.beat.cap : "", end = now() >= total;
      if (cap !== lastCap || end){ lastCap = end ? null : cap; onCap && onCap(cap, end); }
      // 下面一條進度
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(0, VH - 2, VW, 2); g.fillStyle = "#e0b64e"; g.fillRect(0, VH - 2, Math.round(VW * sec / total), 2);
      return true;
    }
    const loop = () => { if (render()) requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    return {
      toggle(){ if (paused){ if (pauseAt >= total) pauseAt = 0; t0 = performance.now() - pauseAt * 1000; paused = false; } else { pauseAt = now(); paused = true; } },
      restart(){ t0 = performance.now(); pauseAt = 0; paused = false; }
    };
  }
  return { play, VW, VH };
})();
if (typeof module !== "undefined") module.exports = TOPPLAY;
