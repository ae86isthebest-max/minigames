/* =========================================================
   俯視版每一集共用的小工具（第 3 集起）：TOPEP(集的 id, { wet, dusk }) 回傳這一集的材質、天氣、setLoc
   setLoc(地點, { start, spawn, rooms, spots, details, place, rows, extras, intro, plan })：把一個地點換成俯視畫面
   （房間 id＝原本 EP.rooms 的 id；證物、小細節的 id 不變，存檔照用）
   ========================================================= */
function TOPEP(epId, opt){
  opt = opt || {};
  const EP3 = typeof CASES !== "undefined" && CASES.find(c => c.id === epId);
  if (!EP3 || typeof TK === "undefined") return null;
  const T = TK, O = T.O, sh = T.sh, mix = T.mix;
  const dA = (r, to) => (typeof TOPW !== "undefined" && TOPW.doorAmt) ? TOPW.doorAmt(r, to) : 0;
  const ph = o => (o && o.phase) || 0;
  const SKY = p => (EP3.worldSky ? EP3.worldSky(p) : ["#56606a", "#8c969c", "#3a4a50", "#46565c", 1, 0]);
  const rain = o => SKY(ph(o))[4] || 0, night = o => !!SKY(ph(o))[5];
  const wet = o => rain(o) > 0 || (opt.wet ? opt.wet(ph(o)) : false), dusk = o => opt.dusk ? opt.dusk(ph(o)) : false;
  const winCol = o => mix(SKY(ph(o))[0], SKY(ph(o))[1], .5);
  const A = (act, o) => ({ act, ...(o || {}) });
  const has = id => { try { return typeof S !== "undefined" && S && (S.seen.includes(id) || S.asked.includes(id) || S.ev[id] !== undefined); } catch(e){ return false; } };
  const evOn = (id, o) => { try { return S && S.ev && S.ev[id] !== undefined && S.ev[id] <= ph(o); } catch(e){ return false; } };
  // 劇情還沒開放的房間（EP.rooms 裡寫了 phase／requires 的）：門關著、進不去
  const roomOk = (loc, id) => { try { const l = C.locations.find(x => x.id === loc), rm = roomsOf(l).find(r => r.id === id); return !rm || roomOpen(rm); } catch(e){ return true; } };

  /* ---------- 天氣 ---------- */
  function rainFx(p, g, R, t, o, y0){ const r = rain(o); if (!r) return; const n = .55 * R.w * (R.h - (y0 || 0)) / 400;
    g.save(); g.globalAlpha = .5;
    for (let i = 0; i < n; i++){ const x = (i * 37 + t * 50) % (R.w + 20) - 10, y = (y0 || 0) + (i * 53 + t * 120) % (R.h - (y0 || 0) + 10) - 6; p.R(x, y, 1, 3, "#a8b8c8"); if (i % 11 === 0) p.R(x - 1, (y0 || 0) + (i * 31) % (R.h - (y0 || 0)), 3, 1, "#c0ccd8"); }
    g.restore(); }
  const tone = (g, R, o, k) => { k = k ?? 1; if (night(o)){ T.dim(g, R, .38 * k); return; } if (dusk(o)){ g.save(); g.globalAlpha = .1 * k; g.fillStyle = "#d8783a"; g.fillRect(0, 0, R.w, R.h); g.restore(); } else if (rain(o)) T.dim(g, R, .12 * k); else if (ph(o) === 1) T.dim(g, R, .07 * k); };
  // 窗：外面的天色跟著天數；extra(x, y, w, h) 畫窗外的東西
  function window2(p, x, y, w, h, o, t, extra, frame){ frame = frame || "#d8d4cc"; p.R(x - 1, y - 1, w + 2, h + 2, O); p.R(x, y, w, h, frame); p.R(x + 2, y + 2, w - 4, h - 4, winCol(o));
    if (extra) extra(x + 2, y + 2, w - 4, h - 4); if (rain(o)) for (let k = 0; k < 4; k++) p.R(x + 3 + ((k * 7 + Math.floor(t * 8)) % Math.max(1, w - 6)), y + 3 + (k * 5) % Math.max(1, h - 8), 1, 3, "#9ab0c4");
    p.R(x + Math.round(w / 2), y + 2, 1, h - 4, frame); p.R(x - 1, y + h + 1, w + 2, 2, sh(frame, -.2)); }
  // 城市窗景：遠處的大樓
  const cityView = (p, o) => (x, y, w, h) => { const S0 = SKY(ph(o)); for (let i = 0; i < w; i += 6){ const bh = 6 + ((i * 7) % 11); p.R(x + i, y + h - bh, 5, bh, mix(S0[2], "#8a8e94", .4)); if (dusk(o)) p.R(x + i + 2, y + h - bh + 2, 1, 1, "#ffd98a"); } };
  const fluo = (p, x, y, w, off) => { p.R(x, y, w, 4, O); p.R(x + 1, y + 1, w - 2, 2, off ? "#8a9090" : "#f4f8f4"); };

  /* ---------- 材質（這一集自己的） ---------- */
  // 工業水泥地：伸縮縫、油漬、輪胎印
  function concrete(p, x, y, w, h, base, seed){ p.R(x, y, w, h, base); p.seed(seed || 5);
    for (let k = 0; k < w * h / 26; k++) p.R(x + p.rnd() * w, y + p.rnd() * h, 1, 1, k % 3 ? sh(base, -.07) : sh(base, .07));
    for (let i = x + 60; i < x + w; i += 60) p.R(i, y, 1, h, sh(base, -.2)); for (let j = y + 50; j < y + h; j += 50) p.R(x, j, w, 1, sh(base, -.2));
    for (let k = 0; k < 4; k++){ const sx = x + p.rnd() * (w - 30), sy = y + p.rnd() * (h - 14); p.R(sx, sy, 16 + p.rnd() * 14, 6 + p.rnd() * 5, "rgba(30,30,34,.14)"); } }
  // 鐵皮牆（倉庫）：一條條的浪板
  function tin(p, x, w, H, col){ p.R(x, 0, w, H, col); for (let i = x; i < x + w; i += 4){ p.R(i, 0, 1, H, sh(col, -.16)); p.R(i + 2, 0, 1, H, sh(col, .08)); }
    p.seed(x + w); for (let k = 0; k < w / 12; k++) p.R(x + p.rnd() * w, p.rnd() * H, 2, 3 + p.rnd() * 6, "rgba(120,70,40,.25)");   // 鏽
    p.R(x, H - 4, w, 4, sh(col, -.4)); p.R(x, H, w, 1, O); }
  // 空心磚牆（巷子的圍牆）
  function blocks(p, x, w, H, col){ p.R(x, 0, w, H, col); for (let j = 4; j < H - 3; j += 8){ p.R(x, j, w, 1, sh(col, -.22)); for (let i = x + ((j / 8) % 2) * 9; i < x + w; i += 18) p.R(i, j, 1, 8, sh(col, -.22)); }
    p.seed(9); for (let k = 0; k < w / 8; k++) p.R(x + p.rnd() * w, 6 + p.rnd() * (H - 10), 1, 4 + p.rnd() * 6, "rgba(40,50,40,.3)"); p.R(x, H - 3, w, 3, sh(col, -.35)); p.R(x, H, w, 1, O); }
  // 泥地＋水窪
  function mud(p, x, y, w, h, o, t){ const base = wet(o) ? "#4e4434" : "#6a5c44"; p.R(x, y, w, h, base); p.seed(x + 11);
    for (let k = 0; k < w * h / 20; k++) p.R(x + p.rnd() * w, y + p.rnd() * h, 2, 1, k % 2 ? sh(base, -.14) : sh(base, .1));
    if (wet(o)){ p.seed(4); for (let k = 0; k < w * h / 1600 + 1; k++){ const px = x + p.rnd() * (w - 30), py = y + p.rnd() * (h - 10), pw = 12 + p.rnd() * 18;
      p.R(px, py, pw, 5, "#3a4450"); p.R(px + 1, py, pw - 2, 1, "#5a6672"); if (rain(o)){ const r = Math.floor(t * 4 + k) % 3; p.R(px + 3 + r * 4, py + 2, 2, 1, "#9ab0c0"); } } } }
  // 塑膠地磚（分局）：米色、一格一格、磨舊的走道
  function vinyl(p, x, y, w, h, a, b, s){ s = s || 14; for (let j = y; j < y + h; j += s) for (let i = x; i < x + w; i += s) p.R(i, j, s, s, ((i / s + j / s) | 0) % 2 ? a : b);
    for (let j = y; j < y + h; j += s) p.R(x, j, w, 1, sh(a, -.12)); for (let i = x; i < x + w; i += s) p.R(i, y, 1, h, sh(a, -.12)); }
  // 磁磚牆（白色小方磚，解剖室、市場）
  function tileWall(p, x, w, H, col, s){ s = s || 5; p.R(x, 0, w, H, col); for (let j = 3; j < H - 4; j += s) p.R(x, j, w, 1, sh(col, -.1)); for (let i = x; i < x + w; i += s) p.R(i, 3, 1, H - 7, sh(col, -.1)); p.R(x, 0, w, 3, sh(col, -.2)); p.R(x, H - 4, w, 4, sh(col, -.35)); p.R(x, H, w, 1, O); }
  // 大理石地（板橋鄭家）
  function marble(p, x, y, w, h, base, s){ s = s || 32; p.R(x, y, w, h, base); p.seed(31);
    for (let j = y; j < y + h; j += s) for (let i = x; i < x + w; i += s){ const c = ((i / s + j / s) | 0) % 2 ? sh(base, .03) : sh(base, -.03); p.R(i, j, s, s, c);
      let vx = i + p.rnd() * s, vy = j; for (let k = 0; k < s; k++){ p.R(vx, vy, 1, 1, sh(base, -.14)); vx += p.rnd() * 2 - 1; vy += 1; } }
    for (let j = y; j < y + h; j += s) p.R(x, j, w, 1, sh(base, -.2)); for (let i = x; i < x + w; i += s) p.R(i, y, 1, h, sh(base, -.2)); }
  // 超耐磨木地板（林家）：長條、錯縫
  function laminate(p, x, y, w, h, col){ p.R(x, y, w, h, col); for (let j = y, r = 0; j < y + h; j += 6, r++){ p.R(x, j, w, 1, sh(col, -.2)); for (let i = x + (r % 3) * 20; i < x + w; i += 60) p.R(i, j, 1, 6, sh(col, -.25)); }
    p.seed(77); for (let k = 0; k < w * h / 60; k++) p.R(x + p.rnd() * w, y + p.rnd() * h, 3, 1, sh(col, p.rnd() > .5 ? .06 : -.06)); }
  // 方塊地毯（事務所）
  function carpetTiles(p, x, y, w, h, a, b){ for (let j = y; j < y + h; j += 16) for (let i = x; i < x + w; i += 16){ const c = ((i / 16 + j / 16) | 0) % 2 ? a : b; p.R(i, j, 16, 16, c);
      for (let k = 0; k < 16; k += 3) p.R(i + (((i / 16 + j / 16) | 0) % 2 ? k : 0), j + (((i / 16 + j / 16) | 0) % 2 ? 0 : k), ((i / 16 + j / 16) | 0) % 2 ? 1 : 16, ((i / 16 + j / 16) | 0) % 2 ? 16 : 1, sh(c, -.06)); } }
  // 濕濕的水泥地（市場）
  function wetCement(p, x, y, w, h, o, t){ const base = "#7a7a72"; p.R(x, y, w, h, base); p.seed(17);
    for (let k = 0; k < w * h / 18; k++) p.R(x + p.rnd() * w, y + p.rnd() * h, 1, 1, k % 2 ? sh(base, -.1) : sh(base, .08));
    for (let k = 0; k < 8; k++){ const px = x + p.rnd() * (w - 26), py = y + p.rnd() * (h - 8); p.R(px, py, 14 + p.rnd() * 14, 4, "rgba(70,90,110,.35)"); p.R(px + 2, py, 6, 1, "rgba(200,220,235,.35)"); } }
  // 人行道（紅磚／灰磚）
  function sidewalk(p, x, y, w, h, a, b){ for (let j = y; j < y + h; j += 6) for (let i = x + ((j - y) / 6 % 2) * 6; i < x + w; i += 12){ p.R(i, j, 11, 5, ((i + j) / 6 | 0) % 3 ? a : b); p.R(i, j + 5, 12, 1, sh(a, -.3)); } }
  // 俯視的公寓門（後牆）＋門牌
  function doorPlate(p, x, y, txtCol){ p.R(x, y, 8, 5, O); p.R(x + 1, y + 1, 6, 3, txtCol || "#e8e2d2"); }

  /* ---------- 人放在哪裡 ---------- */
  // PL[id] ＝ 每一天一個 { room, x, y, act, facing, view }（照 case3_art.js 的 DAILY 排），超過就用最後一個
  // 沒寫在 PL 裡的人：照原本的 DAILY（dailyOf）放到那個房間，x 從 0～192 換算到 rows[房間] ＝ [左, 右, y]
  const POSE = { smoke:"smoke", cry:"cry", drink:"drink", cross:"cross", phone:"phone", broom:"sweep", sit:"sit", kneel:"kneel", read:"read", stand:"idle", hold:"hold", brush:"wipe", type:"type", write:"write" };
  function placer(PL, rows, start){ return (s, d) => { const a = PL[s.id]; let v = Array.isArray(a) ? a[Math.min(d, a.length - 1)] : a;
    if (v) return { ...v };
    const dl = typeof dailyOf === "function" ? dailyOf(s) : {}, room = dl.room || start, r = (rows || {})[room]; if (!r) return null;
    const act = POSE[dl.pose] || "idle", x = Math.round(r[0] + ((dl.x !== undefined ? dl.x : 96) / 192) * (r[1] - r[0]));
    return { room, x, y:r[2] + (s.id.charCodeAt(0) % 3) * 5, act, facing:dl.facing || 1, ...(act === "sit" ? { view:"side" } : {}) }; }; }

  /* ---------- 把一個地點換成俯視 ---------- */
  function setLoc(loc, cfg){
    const old = EP3.world[loc] || {};
    const rms = (EP3.rooms && EP3.rooms[loc]) || [{ id:loc, name:cfg.rooms[loc] && cfg.rooms[loc].name }];
    EP3.world[loc] = { ...old, auto:false, park:8, spawn:cfg.spawn[0], you:old.you,
      areas: Object.keys(cfg.rooms).map(id => { const r = rms.find(q => q.id === id); return { id, name:(r && r.name) || cfg.rooms[id].name, x0:-9, x1:-9, y:-99, text:(EP3.roomDesc || {})[id] || "", hide: !r }; }),
      top:{ start:cfg.start, spawn:cfg.spawn, rooms:cfg.rooms, spots:cfg.spots, details:cfg.details, placeFor:placer(cfg.place || {}, cfg.rows, cfg.start), extras:cfg.extras || [], intro:cfg.intro || null,
        plan:cfg.plan || [{ name:Object.values(cfg.rooms)[0].name, w:100, h:20, rooms:{ [cfg.start]:[0,0,100,20] } }] } };
    Object.defineProperty(EP3.world[loc], "prev", { value:old, enumerable:false });   // 原本的橫向設定（測試工具用）
  }
  return { EP:EP3, EP3, T, O, sh, mix, dA, ph, SKY, rain, night, wet, dusk, winCol, A, has, evOn, roomOk, rainFx, tone, window2, cityView, fluo,
    concrete, tin, blocks, mud, vinyl, tileWall, marble, laminate, carpetTiles, wetCement, sidewalk, doorPlate, setLoc };
}
