/* =========================================================
   俯視畫面（topdown.js）用的共用畫具：牆、地板、家具、門、窗、植物……
   全部用 PX.prim（p.R 畫方塊）畫，風格跟 sprite2.js 的人一樣：深色外框、上面亮、前面暗。
   座標：房間裡的像素（左上角 0,0）；家具 box(x, y, w, h, d)：y～y+h 是桌面（看得到的頂），y+h～y+h+d 是正面。
   ========================================================= */
const TK = (() => {
  const O = "#1a1410";                                     // 外框
  const sh = (c, k) => PX.prim.shade(c, k);
  const mix = (a, b, k) => PX.prim.mix(a, b, k);

  // 家具方塊：頂面＋正面＋外框；頂面上緣一條亮邊、正面上緣一條暗線
  function box(p, x, y, w, h, d, top, front, o){
    o = o || {};
    p.R(x - 1, y - 1, w + 2, h + d + 2, O);
    p.R(x, y, w, h, top); p.R(x, y, w, 1, sh(top, .12));
    if (d > 0){ p.R(x, y + h, w, d, front || sh(top, -.28)); p.R(x, y + h, w, 1, sh(front || sh(top, -.28), -.25)); }
    if (o.legs){ const lc = sh(front || top, -.35); p.R(x + 1, y + h + d, 2, o.legs, lc); p.R(x + w - 3, y + h + d, 2, o.legs, lc); p.R(x, y + h + d + o.legs - 1, 4, 1, O); p.R(x + w - 4, y + h + d + o.legs - 1, 4, 1, O); }
  }
  // 地上的影（家具底下一片暗）
  function shadow(p, x, y, w, h, a){ const g = p.g(); g.save(); g.globalAlpha = a ?? .22; p.R(x, y, w, h, "#000"); g.restore(); }

  /* ---------- 牆 ---------- */
  // 後面那幅牆（向著鏡頭）：上面一條天花線、下面踢腳板；pat："stripe" 直紋、"panel" 下半截木板、"plain"、"brick"、"tile"
  function backWall(p, x, w, H, col, pat, o){
    o = o || {};
    p.R(x, 0, w, H, col);
    if (pat === "stripe") for (let i = x + 4; i < x + w; i += 10) p.R(i, 4, 2, H - 8, sh(col, -.05));
    if (pat === "damask") for (let i = x + 6; i < x + w; i += 14) for (let j = 8; j < H - 14; j += 12){ const k = ((i + j) / 2) % 2; p.R(i + k * 7, j, 2, 2, sh(col, -.07)); p.R(i + k * 7 - 1, j + 1, 4, 1, sh(col, -.05)); }
    if (pat === "panel"){ const py = Math.round(H * .55); p.R(x, py, w, H - py, o.panel || "#7a5232"); p.R(x, py, w, 2, sh(o.panel || "#7a5232", .15)); for (let i = x + 2; i < x + w - 10; i += 22){ p.R(i + 3, py + 5, 16, H - py - 10, sh(o.panel || "#7a5232", -.1)); p.R(i + 3, py + 5, 16, 1, sh(o.panel || "#7a5232", -.25)); } }
    if (pat === "brick") for (let j = 2; j < H - 4; j += 6){ p.R(x, j, w, 1, sh(col, -.18)); for (let i = x + ((j / 6) % 2) * 6; i < x + w; i += 12) p.R(i, j, 1, 6, sh(col, -.18)); }
    if (pat === "tile"){ const ty = Math.round(H * .4); for (let j = ty; j < H - 4; j += 6) p.R(x, j, w, 1, sh(col, -.1)); for (let i = x; i < x + w; i += 6) p.R(i, ty, 1, H - 4 - ty, sh(col, -.1)); }
    if (pat === "wood") for (let i = x; i < x + w; i += 7){ p.R(i, 0, 1, H, sh(col, -.15)); if ((i * 13) % 5 === 0) p.R(i + 3, 10 + (i % 20), 1, 3, sh(col, -.1)); }
    p.R(x, 0, w, 3, sh(col, .1)); p.R(x, 3, w, 1, sh(col, -.2));                      // 天花線
    p.R(x, H - 5, w, 5, o.base || "#4a3424"); p.R(x, H - 5, w, 1, sh(o.base || "#4a3424", .2)); p.R(x, H, w, 1, O);   // 踢腳板
  }
  // 左右兩邊的牆頂（俯視看到牆的厚度）＋前面那幅牆的牆頂（不畫牆身，才看得到房間）
  function sides(p, R, col, gaps){
    col = col || "#3a2e26"; gaps = gaps || [];
    const isGap = (side, y) => gaps.some(g => g[0] === side && y >= g[1] && y < g[1] + g[2]);
    for (let y = 0; y < R.h; y++){
      if (!isGap("L", y)){ p.R(0, y, 6, 1, col); p.R(6, y, 1, 1, O); }
      if (!isGap("R", y)){ p.R(R.w - 6, y, 6, 1, col); p.R(R.w - 7, y, 1, 1, O); }
    }
    for (let x = 0; x < R.w; x++) if (!isGap("B", x)){ p.R(x, R.h - 5, 1, 5, col); p.R(x, R.h - 6, 1, 1, O); }
    gaps.forEach(g => { if (g[0] === "B"){ p.R(g[1] - 1, R.h - 6, 1, 6, O); p.R(g[1] + g[2], R.h - 6, 1, 6, O); } else { const x = g[0] === "L" ? 0 : R.w - 7; p.R(x, g[1] - 1, 7, 1, O); p.R(x, g[1] + g[2], 7, 1, O); } });
    p.R(0, 0, R.w, 1, O);
  }
  // 側牆上的門口：開咗幾多（amt 0～1），門板貼著牆打開
  function sideDoor(p, R, side, y, h, amt, col){
    col = col || "#6a4428"; const x = side === "L" ? 0 : R.w - 7;
    p.R(x, y, 7, h, "#2a1e16"); p.R(x + (side === "L" ? 5 : 0), y, 2, h, "#4a3424");   // 門框、門檻
    const open = Math.round(h * (1 - amt * .85));
    p.R(x + 1, y, 5, open, col); p.R(x + 1, y, 5, 1, sh(col, .2)); if (open > 6) p.R(x + (side === "L" ? 4 : 1), y + Math.round(open / 2), 2, 2, "#d8b050");
  }
  // 後牆上的門：amt 0 閂、1 開；門板向左邊門鉸收窄，開咗見到後面暗暗的
  function backDoor(p, x, y, w, h, amt, col, o){
    o = o || {}; col = col || "#7a5232";
    p.R(x - 3, y - 3, w + 6, h + 3, O); p.R(x - 2, y - 2, w + 4, h + 2, o.frame || "#5a3a22");
    p.R(x, y, w, h, o.inside || "#1a1410");
    const pw = Math.round(w * (1 - amt * .8));
    if (pw > 0){ p.R(x, y, pw, h, col); if (pw > 6){ p.R(x + 2, y + 3, pw - 4, Math.round(h * .38), sh(col, .1)); p.R(x + 2, y + Math.round(h * .5), pw - 4, Math.round(h * .4), sh(col, .1)); p.R(x + pw - 4, y + Math.round(h * .5), 2, 3, "#e8c45a"); } p.R(x + pw - 1, y, 1, h, O); }
  }
  // 窗：night＝夜晚（深藍＋星）；curtain：窗簾顏色；open 0～1 窗簾拉開幾多；lit：窗外有燈
  function win(p, x, y, w, h, o){
    o = o || {};
    p.R(x - 2, y - 2, w + 4, h + 4, O); p.R(x - 1, y - 1, w + 2, h + 2, o.frame || "#e9e4da");
    const sky = o.sky || (o.night === false ? "#9cc5e6" : "#1a2440");
    p.R(x, y, w, h, sky); p.R(x, y + h - 4, w, 4, mix(sky, "#000000", .3));
    if (o.night !== false){ p.R(x + 3, y + 3, 1, 1, "#c9d4e8"); p.R(x + w - 6, y + 5, 1, 1, "#ffffff"); if (o.moon) p.R(x + w - 9, y + 3, 3, 3, "#f4f0e0"); }
    if (o.lights) for (let i = 2; i < w - 2; i += 4) p.R(x + i, y + h - 3, 1, 1, i % 8 ? "#ffd98a" : "#ffe8b0");
    p.R(x + Math.floor(w / 2), y, 1, h, o.frame || "#e9e4da"); p.R(x, y + Math.floor(h / 2), w, 1, o.frame || "#e9e4da");
    p.R(x - 3, y + h + 2, w + 6, 2, o.sill || "#d8d0c0"); p.R(x - 3, y + h + 4, w + 6, 1, O);
    if (o.curtain){ const op = o.open ?? .5, cw = Math.max(2, Math.round((w / 2 + 3) * (1 - op * .75)));
      p.R(x - 5, y - 4, w + 10, 2, "#3a2414");
      [[x - 4, 1], [x + w + 4 - cw, -1]].forEach(([cx]) => { p.R(cx, y - 2, cw, h + 7, o.curtain); for (let i = 1; i < cw; i += 3) p.R(cx + i, y - 2, 1, h + 7, sh(o.curtain, -.18)); p.R(cx, y + h + 4, cw, 1, sh(o.curtain, -.3)); }); }
  }
  // 牆上的畫框
  function frame(p, x, y, w, h, col, inner){ p.R(x - 1, y - 1, w + 2, h + 2, O); p.R(x, y, w, h, col || "#8a6338"); p.R(x + 2, y + 2, w - 4, h - 4, "#e8dcc0"); if (inner) inner(x + 2, y + 2, w - 4, h - 4); p.R(x + 1, y + h, w - 1, 1, sh(col || "#8a6338", -.3)); }

  /* ---------- 地板 ---------- */
  function wood(p, x, y, w, h, col){ col = col || "#8a6440"; p.R(x, y, w, h, col);
    for (let j = y; j < y + h; j += 6){ p.R(x, j, w, 1, sh(col, -.16)); for (let i = x + ((j / 6) % 3) * 13; i < x + w; i += 38) p.R(i, j, 1, 6, sh(col, -.16)); }
    for (let i = x + 5; i < x + w; i += 17) for (let j = y + 2; j < y + h; j += 11) if (((i * 7 + j * 3) % 5) === 0) p.R(i, j, 3, 1, sh(col, .08)); }
  function herring(p, x, y, w, h, col){ col = col || "#9a6e44"; p.R(x, y, w, h, col);
    for (let j = y; j < y + h; j += 4) for (let i = x + ((j - y) / 4 % 2) * 6; i < x + w; i += 12){ p.R(i, j, 6, 1, sh(col, -.14)); p.R(i, j, 1, 4, sh(col, -.14)); p.R(i + 1, j + 1, 4, 1, sh(col, .05)); } }
  function tiles(p, x, y, w, h, a, b, s){ s = s || 10; for (let j = y; j < y + h; j += s) for (let i = x; i < x + w; i += s){ p.R(i, j, s, s, ((i - x) / s + (j - y) / s) % 2 ? a : b); } for (let j = y; j < y + h; j += s) p.R(x, j, w, 1, sh(a, -.12)); for (let i = x; i < x + w; i += s) p.R(i, y, 1, h, sh(a, -.12)); }
  function carpet(p, x, y, w, h, col){ p.R(x, y, w, h, col); for (let j = y + 1; j < y + h; j += 3) for (let i = x + ((j - y) % 2) * 2; i < x + w; i += 4) p.R(i, j, 1, 1, sh(col, -.06)); }
  function grass(p, x, y, w, h, col){ col = col || "#2c4a2a"; p.R(x, y, w, h, col); PX.prim.seed(x * 7 + y); for (let k = 0; k < w * h / 18; k++){ const gx = x + PX.prim.rnd() * w, gy = y + PX.prim.rnd() * h; p.R(gx, gy, 1, 2, k % 3 ? sh(col, .12) : sh(col, -.14)); } }
  function paving(p, x, y, w, h, col, s){ col = col || "#8a8478"; s = s || 12; p.R(x, y, w, h, col); for (let j = y; j < y + h; j += s){ p.R(x, j, w, 1, sh(col, -.18)); for (let i = x + ((j - y) / s % 2) * s / 2; i < x + w; i += s) p.R(i, j, 1, s, sh(col, -.18)); } }
  function asphalt(p, x, y, w, h){ p.R(x, y, w, h, "#34363a"); PX.prim.seed(y * 3 + w); for (let k = 0; k < w * h / 14; k++) p.R(x + PX.prim.rnd() * w, y + PX.prim.rnd() * h, 1, 1, k % 2 ? "#3e4044" : "#2c2e32"); }
  function rug(p, x, y, w, h, a, b, c){ p.R(x - 1, y - 1, w + 2, h + 2, sh(a, -.4)); p.R(x, y, w, h, a); p.R(x + 3, y + 3, w - 6, h - 6, b); p.R(x + 5, y + 5, w - 10, h - 10, sh(b, .06));
    for (let i = x + 9; i < x + w - 9; i += 10) for (let j = y + 9; j < y + h - 9; j += 8) { p.R(i, j, 3, 1, c || a); p.R(i + 1, j - 1, 1, 3, c || a); }
    for (let i = x; i < x + w; i += 3){ p.R(i, y - 2, 1, 1, a); p.R(i, y + h + 1, 1, 1, a); } }

  /* ---------- 物件 ---------- */
  function plant(p, x, y, big, col){ const lc = col || "#3c7a40";   // x,y：花盆底中間
    const pw = big ? 12 : 8, ph = big ? 9 : 6;
    p.R(x - pw / 2 - 1, y - ph - 1, pw + 2, ph + 2, O); p.R(x - pw / 2, y - ph, pw, ph, "#a0583a"); p.R(x - pw / 2, y - ph, pw, 2, "#c06a46"); p.R(x - pw / 2, y - 2, pw, 1, "#7a3a22");
    const n = big ? 9 : 5; for (let i = 0; i < n; i++){ const a = (i / (n - 1) - .5) * 2.4, l = (big ? 15 : 9) - Math.abs(i - (n - 1) / 2) * 1.5;
      for (let k = 2; k < l; k++){ const lx = Math.round(x + Math.sin(a) * k), ly = Math.round(y - ph - Math.cos(a) * k * .9); p.R(lx - 1, ly - 1, 3, 3, O); } }
    for (let i = 0; i < n; i++){ const a = (i / (n - 1) - .5) * 2.4, l = (big ? 15 : 9) - Math.abs(i - (n - 1) / 2) * 1.5;
      for (let k = 2; k < l; k++){ const lx = Math.round(x + Math.sin(a) * k), ly = Math.round(y - ph - Math.cos(a) * k * .9); p.R(lx, ly, 2, 2, k > l - 3 ? sh(lc, .2) : lc); } } }
  function floorLamp(p, x, y, on){ p.R(x - 4, y - 2, 9, 3, O); p.R(x - 3, y - 2, 7, 2, "#3a3a3e"); p.R(x - 1, y - 34, 3, 32, O); p.R(x, y - 33, 1, 31, "#6a6a70");
    p.R(x - 6, y - 44, 13, 11, O); p.R(x - 5, y - 43, 11, 9, on ? "#f4e2b0" : "#c8b890"); p.R(x - 5, y - 35, 11, 1, on ? "#fff6d0" : "#a89870"); }
  // 光：一圈暖黃色（畫在最上面用 lighter 疊）
  function glow(g, x, y, r, col, a){ g.save(); g.globalCompositeOperation = "lighter"; const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, `rgba(${col || "255,220,150"},${a ?? .28})`); gr.addColorStop(1, `rgba(${col || "255,220,150"},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
  // 夜：成間房暗一點（a：多暗）
  function dim(g, R, a, col){ g.save(); g.globalAlpha = a; g.fillStyle = col || "#0a0c1e"; g.fillRect(0, 0, R.w, R.h); g.restore(); }
  function books(p, x, y, w, h, seed){ const C = ["#8a3a3a","#3a5a8a","#c9a45a","#3e7a52","#7a4a8a","#a8662a","#5a5a6a","#2a4a3a"]; let i = x;
    PX.prim.seed(seed || x); while (i < x + w - 1){ const bw = 2 + Math.floor(PX.prim.rnd() * 2), bh = h - Math.floor(PX.prim.rnd() * 3); p.R(i, y + h - bh, bw, bh, C[Math.floor(PX.prim.rnd() * C.length)]); p.R(i, y + h - bh, bw, 1, "#00000022"); i += bw + (PX.prim.rnd() < .15 ? 1 : 0); } }
  function shelf(p, x, y, w, h, rows, col){ col = col || "#4a3020"; p.R(x - 1, y - 1, w + 2, h + 2, O); p.R(x, y, w, h, col); const rh = (h - 4) / rows;
    for (let r = 0; r < rows; r++){ const ry = Math.round(y + 2 + r * rh); p.R(x + 2, ry, w - 4, Math.round(rh) - 2, sh(col, -.3)); books(p, x + 3, ry + 1, w - 6, Math.round(rh) - 3, x + r * 31); p.R(x + 1, ry + Math.round(rh) - 2, w - 2, 2, sh(col, .1)); } }
  // 證物號碼牌（黃色小三角）
  function marker(p, x, y, n){ p.R(x - 1, y - 6, 8, 7, O); p.R(x, y - 5, 6, 5, "#f2c43a"); p.R(x, y - 1, 6, 1, "#c89a1a"); const d = String(n); p.R(x + 2, y - 4, 2, 3, "#1a1410"); if (d === "1") p.R(x + 2, y - 4, 1, 3, "#f2c43a"); }
  // 封鎖線（黃黑相間），x1,y1 → x2,y2 直線
  function tape(p, x1, y1, x2, y2){ const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)); for (let k = 0; k <= n; k++){ const x = Math.round(x1 + (x2 - x1) * k / n), y = Math.round(y1 + (y2 - y1) * k / n); p.R(x, y, 1, 2, (Math.floor(k / 3) % 2) ? "#f2c43a" : "#1a1410"); } }
  // 牆上的監視器（dir 1 向右、-1 向左）
  function cam(p, x, y, dir, t){ p.R(x - 1, y - 1, 4, 4, O); p.R(x, y, 2, 2, "#8a8e94"); const bx = dir > 0 ? x + 2 : x - 7; p.R(bx - 1, y, 9, 5, O); p.R(bx, y + 1, 7, 3, "#e9e4da"); p.R(dir > 0 ? bx + 6 : bx, y + 2, 1, 1, "#1a1410"); if (Math.floor((t || 0) * 2) % 2) p.R(dir > 0 ? bx + 1 : bx + 5, y + 1, 1, 1, "#e04a3a"); }
  // 街燈（底在 x,y）
  function streetLamp(p, g, x, y){ p.R(x - 3, y - 2, 7, 3, O); p.R(x - 1, y - 52, 3, 50, O); p.R(x, y - 51, 1, 49, "#5a5e66"); p.R(x - 1, y - 54, 12, 3, O); p.R(x, y - 53, 10, 1, "#5a5e66"); p.R(x + 7, y - 52, 6, 3, O); p.R(x + 8, y - 51, 4, 1, "#fff2c0"); }
  // 灌木
  function bush(p, x, y, w, h, col){ col = col || "#2f5236"; p.R(x - 1, y - 1, w + 2, h + 2, O); p.R(x, y, w, h, col); for (let i = x + 1; i < x + w - 2; i += 4) p.R(i, y + 1 + (i % 3), 3, 2, sh(col, .18)); p.R(x, y + h - 2, w, 2, sh(col, -.25)); }
  // 椅（俯視、向下坐）：x,y＝椅子底中間
  function chair(p, x, y, col, face){ col = col || "#6a4428"; face = face || "down";
    if (face === "down"){ p.R(x - 6, y - 16, 12, 9, O); p.R(x - 5, y - 15, 10, 7, sh(col, -.1)); p.R(x - 6, y - 8, 12, 7, O); p.R(x - 5, y - 7, 10, 4, col); p.R(x - 5, y - 3, 10, 1, sh(col, -.3)); p.R(x - 5, y - 2, 2, 2, sh(col, -.4)); p.R(x + 3, y - 2, 2, 2, sh(col, -.4)); }
    else if (face === "up"){ p.R(x - 6, y - 10, 12, 8, O); p.R(x - 5, y - 9, 10, 5, col); p.R(x - 6, y - 5, 12, 6, O); p.R(x - 5, y - 4, 10, 4, sh(col, -.15)); p.R(x - 5, y - 4, 10, 1, sh(col, .15)); }
    else { const d = face === "right" ? 1 : -1, bx = d > 0 ? x - 7 : x + 4;   // 側坐的椅：椅背在後面
      p.R(bx - 1, y - 21, 5, 21, O); p.R(bx, y - 20, 3, 19, sh(col, -.1)); p.R(x - 7, y - 11, 14, 6, O); p.R(x - 6, y - 10, 12, 3, col); p.R(x - 6, y - 7, 12, 1, sh(col, -.3)); p.R(x - 6, y - 6, 2, 6, sh(col, -.4)); p.R(x + 4, y - 6, 2, 6, sh(col, -.4)); } }

  return { O, sh, mix, box, shadow, backWall, sides, sideDoor, backDoor, win, frame, wood, herring, tiles, carpet, grass, paving, asphalt, rug, plant, floorLamp, glow, dim, books, shelf, marker, tape, cam, streetLamp, bush, chair };
})();
if (typeof module !== "undefined") module.exports = TK;
