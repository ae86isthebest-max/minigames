/* =========================================================
   第 21 集：像素畫、人物造型、結案、走動畫面、地圖、開場
   ========================================================= */
EP21.art = true;
(() => {
  const PR = PX.prim, { R, P, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i] = beatAt(o.t || 0, o.ds); return (o.seq || [])[i] || {}; };

  /* ---------- 山上共用 ---------- */
  // 顏色（晚上／白天）。樹和山的顏色紅大於藍，走動畫面去天空的時候不會被當成天空吃掉
  const COL = d => d
    ? { sky:"#c8d6e0", ridge:"#6a7658", tree:"#2e4a26", tree2:"#3e5a30", ground:"#7a6648", ground2:"#6a5638", rock:"#8a8a7e", rock2:"#6e6e64", moss:"#5a7a3a" }
    : { sky:"#0b1020", ridge:"#262a1e", tree:"#161e12", tree2:"#1e2818", ground:"#3a3228", ground2:"#2e281e", rock:"#4a4a44", rock2:"#38382f", moss:"#2e3e22" };
  const pine = (x, by, h, c, c2) => { R(x - 1, by - 6, 2, 6, "#3a2a1a"); for (let y = 0; y < h; y++){ const w = Math.max(1, Math.round((y / h) * h * 0.42)); R(x - w, by - 6 - h + y, w * 2, 1, (y % 5 === 0) ? c2 : c); } };
  const ridge = (c, y0, k) => { for (let x = 0; x < W; x++){ const h = y0 + Math.sin(x / 23 + k) * 6 + Math.sin(x / 9 + k) * 2; R(x, h, 1, 60, c); } };
  // 柔和的光：一圈一圈半透明，不用網點（網點在晚上會變成格子）
  const glow = (x, y, r, rgb, a) => { for (let k = r; k > 0; k -= 2){ const al = Math.round(a * (1 - k / r) * 255).toString(16).padStart(2, "0"); R(x - k, y - k * 0.7, k * 2, k * 1.4, rgb + al); } };
  // 霧：幾條半透明的帶子，越下面越濃
  const fog = (o, thick) => { if (!o.fog) return; const c = o.day ? "#e0e6ea" : "#7a8494";
    for (let k = 0; k < 8; k++){ const y = 36 + k * 8, a = (thick ? 0x12 : 0x0c) + k * 2; R(0, y, W, H - y, c + a.toString(16).padStart(2, "0")); } };
  const blob = (x, y, r, c) => { for (let dy = -r; dy <= r; dy++){ const w = Math.round(Math.sqrt(r * r - dy * dy)); R(x - w, y + dy, w * 2, 1, c); } };
  const ground = (c, y) => { R(0, y, W, H - y, c.ground); R(0, y, W, 1, c.ground2); for (let k = 0; k < 24; k++) R((k * 37 + 11) % W, y + 3 + (k * 13) % (H - y - 4), 2, 1, c.ground2); };
  const backTrees = (c, by) => { for (let k = 0; k < 9; k++) pine(8 + k * 23 + (k % 2) * 6, by - (k % 3) * 2, 26 + (k * 7) % 12, c.tree, c.tree2); };

  /* ---------- 鷹嘴崖營地 ---------- */
  // 營地：左邊橘色帳篷（鄭子安、黃志明）、樹樁上的守夜表、火堆和兩張摺疊椅、燈籠、右邊藍色帳篷（林冠宇，門對著火堆）
  SC.c21_camp = (o) => { o = Object.assign({}, o, stOf(o)); const d = !!o.day, c = COL(d);
    R(0, 0, W, 56, c.sky); ridge(c.ridge, 34, 0); backTrees(c, 84);
    ground(c, 84);
    // 橘色帳篷
    const ta = d ? "#d8702a" : "#7a4222", tad = d ? "#a8521a" : "#5a3018";
    for (let y = 58; y < 87; y++){ const h = (y - 58) * 0.8; R(36 - h, y, h * 2, 1, ta); } R(35, 58, 2, 28, tad);
    for (let y = 63; y < 87; y++){ const h = (y - 63) * 0.42; R(36 - h, y, h * 2, 1, o.lampIn ? "#3a2c18" : "#1a1410"); }
    if (o.lampIn){ R(35, 64, 2, 2, "#ffe8a0"); glow(36, 68, 10, "#ffe08a", 0.35); }
    R(29, 72, 9, 10, "#2a5a9a"); R(30, 73, 7, 2, "#3a6ab0"); R(31, 76, 5, 1, "#1a3a6a");   // 背包
    R(46, 82, 4, 4, "#3a2a1a"); R(51, 82, 4, 4, "#2a2a2a");   // 門口的登山鞋
    // 樹樁和守夜表
    R(66, 76, 10, 10, d ? "#6a4a2a" : "#3a2a18"); R(65, 75, 12, 2, d ? "#8a6a3a" : "#4a3a22");
    R(64, 70, 12, 8, "#8a6a3a"); R(65, 71, 10, 6, d ? "#f0ead8" : "#9a968a"); for (let k = 0; k < 3; k++) R(66, 72 + k * 2, 7 - k, 1, "#5a5a6a");
    // 火堆、水壺
    if (!o.cold){ glow(97, 80, 22, "#ff9a3a", d ? 0.12 : 0.4); }
    for (let k = 0; k < 6; k++) R(88 + k * 3, 84 - (k % 2), 3, 2, c.rock);
    R(92, 81, 10, 3, o.cold ? "#3a3a36" : "#c83a1a"); if (!o.cold){ R(94, 79, 2, 2, "#ff9a3a"); R(98, 78, 2, 3, "#ffc85a"); }
    R(97, 74, 6, 5, "#3a3a3a"); R(98, 73, 4, 1, "#5a5a5a"); R(103, 75, 1, 2, "#3a3a3a");
    // 摺疊椅（右邊那張搭著毯子）
    const chair = (x) => { R(x, 76, 8, 2, "#2a4a6a"); R(x, 70, 1, 8, "#6a6a6a"); R(x + 7, 70, 1, 8, "#6a6a6a"); R(x, 70, 8, 1, "#2a4a6a"); R(x + 1, 78, 1, 8, "#6a6a6a"); R(x + 6, 78, 1, 8, "#6a6a6a"); };
    chair(78); chair(110); R(109, 72, 10, 9, d ? "#9a4a6a" : "#5a2a3e"); R(110, 73, 8, 1, d ? "#b86a8a" : "#6a3a4e");
    // 燈籠
    R(125, 48, 1, 38, "#5a4a3a"); R(123, 46, 5, 1, "#5a4a3a"); R(122, 48, 6, 8, d ? "#c8c0a0" : "#ffd98a"); R(122, 48, 6, 1, "#3a3a3a"); if (!d) glow(125, 53, 12, "#ffe08a", 0.3);
    // 藍色帳篷：門開著，對著火堆，裡面是紅色的睡袋
    const tb = d ? "#2a5aa8" : "#1a3456", tbd = d ? "#1a4488" : "#102440";
    for (let y = 58; y < 87; y++){ const h = (y - 58) * 0.62; R(155 - h, y, h * 2, 1, tb); } R(154, 58, 2, 28, tbd);
    for (let y = 64; y < 87; y++){ const h = (y - 64) * 0.5; R(153 - h, y, h * 2 + 2, 1, "#14141a"); }
    R(144, 76, 18, 8, o.emptyBag ? "#5a2018" : "#a82820"); R(145, 77, 16, 1, o.emptyBag ? "#6a2a20" : "#c8382a"); if (!o.emptyBag) R(146, 74, 6, 3, "#a82820");
    // 垃圾袋
    R(177, 76, 11, 10, "#2a2a2a"); R(180, 74, 5, 2, "#3a3a3a");
    fog(o);
  };

  // 往廁所的步道：兩邊是樹，木頭指標，原木台階，地上的樹根，樹幹上的反光片
  SC.c21_trail = (o) => { o = Object.assign({}, o, stOf(o)); const d = !!o.day, c = COL(d);
    R(0, 0, W, 50, c.sky); ridge(c.ridge, 30, 2);
    for (let k = 0; k < 9; k++) pine(4 + k * 24, 70, 22 + (k * 5) % 10, c.tree2, c.tree);
    for (let k = 0; k < 6; k++){ const x = 14 + k * 34 + (k % 2) * 6; R(x, 20, 5, 66, d ? "#4a3a28" : "#22180e"); R(x + 4, 40, 6, 2, d ? "#4a3a28" : "#22180e");
      blob(x + 2, 14, 13, c.tree); blob(x - 6, 22, 9, c.tree); blob(x + 11, 22, 9, c.tree); blob(x + 4, 10, 6, c.tree2); }
    ground(c, 84);
    for (let k = 0; k < 5; k++){ const x = 54 + k * 14; R(x, 84 + (k % 2), 12, 2, d ? "#6a4a2a" : "#2e2214"); }   // 原木台階
    R(120, 80, 24, 3, d ? "#5a3e24" : "#2a1e12"); R(126, 78, 10, 2, d ? "#5a3e24" : "#2a1e12"); R(138, 82, 6, 2, d ? "#6a4a2a" : "#2e2214");   // 樹根
    // 指標
    R(34, 40, 2, 46, d ? "#6a4a2a" : "#3a2a18");
    R(26, 40, 18, 7, d ? "#a07a46" : "#4a3a22"); R(44, 41, 3, 5, d ? "#a07a46" : "#4a3a22"); txt("廁所→", 27, 46, d ? "#3a2a18" : "#8a7a5a", "5px sans-serif");
    R(26, 50, 18, 7, d ? "#a07a46" : "#4a3a22"); R(23, 51, 3, 5, d ? "#a07a46" : "#4a3a22"); txt("鷹嘴⚠", 27, 56, d ? "#8a2a1a" : "#8a5a3a", "5px sans-serif");
    // 樹幹上的反光片（大部分都掉了）
    R(162, 50, 3, 4, d ? "#c8c8c0" : "#6a6a62"); R(162, 50, 3, 1, "#e83a3a");
    R(72, 58, 14, 10, c.rock); R(73, 58, 12, 3, c.moss);   // 長青苔的石頭
    fog(o, true);
  };

  // 鷹嘴彎道：步道往左上彎進樹林（遠處是廁所）；木樁和護欄繩斜斜擋在前面，後兩根倒了、繩子掉在泥巴裡；
  // 泥巴上的鞋印直直走向右邊的鷹嘴大石頭；石頭前端懸在空中，下面什麼都沒有
  SC.c21_cliff = (o) => { o = Object.assign({}, o, stOf(o)); const d = !!o.day, c = COL(d);
    R(0, 0, W, 60, c.sky); ridge(c.ridge, 46, 4);
    for (let k = 0; k < 4; k++) pine(10 + k * 22, 74, 30 + (k % 2) * 8, c.tree, c.tree2);
    ground(c, 84);
    // 往左上彎進樹林的步道，遠處的廁所
    for (let y = 60; y < 86; y++){ const t = (y - 60) / 26, x = 28 + t * 40, w = 4 + t * 16; R(x, y, w, 1, d ? "#9a8460" : "#4a4030"); }
    R(22, 52, 10, 8, d ? "#8a7a6a" : "#3a342c"); R(21, 50, 12, 2, d ? "#5a4a3a" : "#2a241c"); R(25, 55, 3, 5, "#1a1410");
    // 鷹嘴大石頭
    R(124, 84, 54, 14, c.rock); R(124, 84, 54, 2, c.moss); R(128, 98, 44, 4, c.rock2); R(132, 102, 34, 6, c.rock2);
    for (let k = 0; k < 6; k++) R(126 + k * 9, 86 + (k % 3), 4, 1, c.moss);
    // 右邊：懸崖。地面到 x=176 為止，再過去是空的（遠處的山谷）
    const vo = d ? "#b8c4cc" : "#141824"; R(178, 56, 14, 52, vo); R(170, 102, 22, 6, vo); R(166, 104, 6, 4, vo);
    for (let x = 178; x < W; x++){ R(x, 74 + Math.round(Math.sin(x / 5) * 2), 1, 34, d ? "#8a9a88" : "#1e2420"); R(x, 90 + Math.round(Math.sin(x / 4 + 1) * 2), 1, 18, d ? "#6a7a64" : "#181e18"); }
    R(178, 56, 14, 52, d ? "#e0e6ea44" : "#7a849422");
    // 前端的缺口（新的斷面）或完整的一角
    if (o.whole){ R(176, 86, 10, 10, c.rock); R(176, 86, 10, 2, c.moss); }
    else { R(172, 88, 6, 8, d ? "#c8c8c0" : "#8a8a84"); R(173, 90, 4, 1, d ? "#a8a8a0" : "#6a6a64"); if (o.slip) R(166, 86, 5, 2, d ? "#5a4630" : "#2a2218"); }
    // 泥巴和鞋印（直直往前）
    R(60, 86, 66, 6, d ? "#5a4630" : "#2a2218");
    if (!o.noPrints) for (let k = 0; k < 12; k++){ const x = 66 + k * 9; if (x > 170) break; R(x, 88 + (k % 2) * 2, 3, 1, d ? "#3a2a1a" : "#161008"); }
    if (o.flags) for (let k = 0; k < 6; k++){ const x = 70 + k * 16; R(x, 82, 1, 6, "#8a8a8a"); R(x + 1, 82, 3, 2, "#f2d03b"); }
    // 木樁和護欄繩：第一根站著，後面兩根倒了
    const post = d ? "#7a5a36" : "#3a2a18", rope = d ? "#3a6aa8" : "#22406a", rot = d ? "#b8b0a0" : "#5a564e";
    R(74, 70, 3, 16, post); R(73, 70, 5, 1, post);
    if (o.ropeUp){ R(88, 74, 3, 14, post); R(102, 80, 3, 14, post); R(76, 73, 13, 1, rope); R(90, 77, 13, 1, rope); }
    else { R(84, 84, 10, 3, post); R(98, 92, 11, 3, post); R(76, 73, 2, 1, rope); for (let k = 0; k < 28; k++) P(77 + k, 74 + Math.round(k * 0.62), k < 4 ? rope : rot); R(104, 92, 2, 1, rot); }
    if (o.tape) PR.OBJ.tape(118, 78, 54);
    fog(o, true);
  };

  // 崖下：後面是崖壁（上面看得到鷹嘴的下緣），亂石堆，右邊的溪溝，探照燈
  SC.c21_below = (o) => { o = Object.assign({}, o, stOf(o)); const d = !!o.day, c = COL(d);
    R(0, 0, W, H, d ? "#b8c4cc" : "#0b1020");
    R(0, 0, 150, 90, c.rock2); for (let y = 4; y < 90; y += 6) R((y * 7) % 40, y, 60 + (y % 4) * 10, 1, c.rock);
    for (let k = 0; k < 10; k++) R((k * 31) % 140, 8 + (k * 17) % 70, 8, 3, c.moss);
    R(10, 0, 70, 6, c.rock); R(10, 6, 60, 2, "#00000044");   // 鷹嘴的下緣
    for (let k = 0; k < 7; k++) R(22 + (k % 3) * 8, 10 + k * 9, 2, 6, d ? "#c8c8c0" : "#7a7a74");   // 新的刮痕
    R(150, 40, 42, 50, d ? "#5a6a48" : "#1a2416");
    R(0, 86, W, 22, c.ground2);
    for (let k = 0; k < 14; k++){ const x = (k * 29) % 186, y = 88 + (k * 11) % 16; R(x, y, 8 + k % 5, 4, c.rock); R(x + 1, y, 6, 1, c.rock2); }
    R(150, 94, 42, 8, d ? "#5a8aa8" : "#1a2a3a"); for (let x = 152; x < 190; x += 7) R(x, 96 + (x % 3), 4, 1, d ? "#8ab8d0" : "#2a4a5a");   // 溪溝
    // 石頭（斷下來的那一角）
    R(132, 82, 16, 10, c.rock); R(132, 82, 16, 3, c.moss); R(144, 84, 4, 8, d ? "#c8c8c0" : "#8a8a84"); R(136, 82, 4, 1, d ? "#5a4630" : "#2a2218");
    // 頭燈
    R(119, 89, 8, 3, "#1a1a1a"); R(118, 90, 2, 2, "#7a7a7a"); R(127, 90, 1, 1, "#3a3a3a");
    // 蓋著藍布的人（凌晨）／號碼牌（下午）
    if (o.body){ R(74, 86, 34, 6, "#2a5a9a"); R(76, 84, 10, 3, "#2a5a9a"); R(104, 88, 6, 4, "#3a2a1a"); R(74, 86, 34, 1, "#3a6ab0"); }
    else { PR.OBJ.marker(80, 86, 1); PR.OBJ.marker(120, 84, 2); PR.OBJ.marker(140, 78, 3); }
    // 探照燈
    R(166, 56, 2, 30, "#5a5a5e"); R(162, 84, 10, 2, "#5a5a5e"); R(160, 50, 12, 8, "#3a3a3e"); R(160, 52, 2, 4, d ? "#c8c8c0" : "#fff6c8");
    if (!d && o.beam){ const g = PR.g(); g.save(); g.globalAlpha = 0.18; g.fillStyle = "#fff6c8"; g.beginPath(); g.moveTo(160 * PX.HI, 52 * PX.HI); g.lineTo(20 * PX.HI, 0); g.lineTo(80 * PX.HI, 0); g.closePath(); g.fill(); g.restore(); }
    if (o.tape) PR.OBJ.tape(60, 80, 70);
    fog(o);
  };

  /* ---------- 登山口雜貨店 ---------- */
  SC.c21_store = (o) => {
    wall(84, "#d8cdb0", false); R(0, 78, W, 6, "#b8a888");
    // 左邊：門、瓦斯罐、雨衣
    R(2, 30, 18, 54, "#8a9aa8"); R(3, 31, 16, 30, "#b8d0e0"); R(10, 31, 1, 30, "#6a7a88");
    R(24, 40, 30, 36, "#7a5a36"); R(24, 76, 2, 8, "#5a3e24"); R(52, 76, 2, 8, "#5a3e24"); for (let k = 0; k < 3; k++) R(24, 50 + k * 12, 30, 2, "#5a3e24");
    for (let k = 0; k < 5; k++){ R(26 + k * 6, 44, 4, 6, "#c83a2a"); R(27 + k * 6, 42, 2, 2, "#3a3a3a"); }   // 瓦斯罐
    for (let k = 0; k < 4; k++) R(26 + k * 7, 54, 6, 8, ["#e8c040","#3a8ac8","#c83a2a","#3a9a5a"][k]);   // 零食
    R(58, 28, 1, 30, "#5a5a5a"); R(56, 30, 16, 24, "#e8d040"); R(57, 31, 14, 2, "#f4e060");   // 雨衣
    // 收銀台和後面的電池架
    R(108, 38, 26, 18, "#7a5a36"); R(108, 46, 26, 1, "#5a3e24");
    for (let k = 0; k < 5; k++){ R(110 + k * 5, 40, 4, 5, "#e8c020"); P(111 + k * 5, 42, "#8a8a8a"); }   // 黃色的碳鋅
    for (let k = 0; k < 4; k++){ R(110 + k * 6, 48, 5, 6, "#2a2a2a"); R(110 + k * 6, 48, 5, 2, "#c88a2a"); }   // 鹼性
    R(122, 34, 12, 4, "#f4f4f0"); txt("鹼性!", 123, 37, "#c83a2a", "3px sans-serif");
    R(90, 60, 60, 26, "#9a7a4a"); R(90, 60, 60, 2, "#b89a6a"); R(100, 66, 18, 6, "#7a5a36"); R(107, 68, 4, 1, "#c8a870");   // 櫃台和抽屜
    R(128, 54, 12, 6, "#3a3a3e"); R(130, 55, 8, 2, "#6ac86a");   // 收銀機
    // 右邊：沖泡飲料
    R(156, 40, 24, 16, "#8a6a4a"); for (let k = 0; k < 4; k++) for (let j = 0; j < 2; j++) R(158 + k * 5, 42 + j * 7, 4, 5, ["#7a4a2a","#c8a040","#4a2a1a","#e8e0c0"][k]);
    R(160, 62, 26, 22, "#c8ccd0"); R(162, 64, 22, 12, "#e8f0f4"); for (let k = 0; k < 5; k++) R(163 + k * 4, 66, 3, 8, ["#c83a2a","#3a8ac8","#e8c040","#3a9a5a","#f4f4f0"][k]);   // 冰箱
    floor(86, "#a89a7a", "#988a6a");
  };

  /* ---------- 山下派出所 ---------- */
  SC.c21_station = (o) => {
    wall(80, "#d8e0d0", false); R(0, 74, W, 6, "#a8b0a0");
    R(14, 18, 36, 26, "#f0ead8"); R(14, 18, 36, 1, "#8a8a8a"); for (let k = 0; k < 4; k++) R(18 + k * 7, 26 + (k % 2) * 4, 8, 1, "#3a6a3a");   // 步道圖
    R(36, 28, 3, 1, "#c83a2a"); R(37, 27, 1, 3, "#c83a2a"); R(40, 30, 3, 1, "#c83a2a"); R(41, 29, 1, 3, "#c83a2a");
    R(60, 20, 26, 20, "#9cc5e6"); R(72, 20, 1, 20, "#5a5a5a"); R(60, 30, 26, 1, "#5a5a5a");   // 窗
    PR.OBJ.desk(50, 62, 80); R(56, 58, 22, 4, "#f1ead8"); R(58, 59, 14, 1, "#6a6a7a");   // 公文
    R(98, 46, 18, 12, "#2a2a2e"); R(99, 47, 16, 9, "#3a6a8a"); R(100, 49, 10, 1, "#c8e0f0"); R(100, 52, 12, 1, "#c8e0f0"); R(105, 58, 4, 4, "#2a2a2e");   // 電腦
    R(148, 60, 22, 24, "#8a8a84"); R(150, 50, 16, 10, "#e8e4d8"); R(152, 51, 10, 2, "#3a3a3a"); R(153, 54, 8, 4, "#f4f4f0");   // 傳真機
    R(176, 30, 12, 50, "#5a6a4a"); for (let k = 0; k < 3; k++) R(178, 36 + k * 12, 8, 6, "#e8c040");   // 安全帽
    floor(84, "#b8b0a0", "#a8a090");
  };
  // 會客室
  SC.c21_meet = (o) => {
    wall(80, "#e0d8c8", false); R(0, 74, W, 6, "#b8b0a0");
    R(30, 20, 30, 22, "#9cc5e6"); R(45, 20, 1, 22, "#6a6a6a");
    R(120, 18, 24, 18, "#c8b890"); R(122, 20, 20, 14, "#5a7a9a");   // 牆上的山景月曆
    R(20, 64, 50, 18, "#6a4a3a"); R(20, 58, 50, 8, "#7a5a4a");   // 沙發
    R(80, 62, 40, 4, "#8a6a4a"); R(84, 66, 3, 16, "#6a4a3a"); R(113, 66, 3, 16, "#6a4a3a");
    R(94, 55, 6, 7, "#e8f0f4"); R(95, 57, 4, 4, "#c8e0f0"); R(102, 60, 12, 2, "#f1ead8");   // 水杯、學生證影本
    R(130, 64, 50, 18, "#6a4a3a"); R(130, 58, 50, 8, "#7a5a4a");
    floor(84, "#a89a8a", "#988a7a");
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    guanyu:  { skin:"#e0b48c", hair:"#1e1a18", hairStyle:"short", top:"#c8302a", coat:"#2a2a30", bottom:"#3a3a40", mood:"worried", hello:"我沒有出去……我真的沒有……" },
    zhaosi:  { hello:"……沈警官。" },
    yutong:  { skin:"#f0d0b4", hair:"#3a2a20", hairStyle:"long", top:"#e8e0d0", coat:"#8a3a5a", bottom:"#3a4050", mood:"sad", hello:"我那時候睡著了……" },
    zhiming: { skin:"#d8a880", hair:"#2a2220", hairStyle:"short", top:"#3a7a4a", bottom:"#3a3a40", glasses:true, hello:"我一點半醒來，他就不見了。" },
    zhang:   { age:"old", skin:"#c89a70", hair:"#5a5a56", hairStyle:"short", top:"#e8702a", bottom:"#2a2a30", hat:"cap", capColor:"#e8702a", hello:"十八公尺。這種霧，什麼都看不到。" },
    wang:    { age:"old", skin:"#d8a880", hair:"#3a3430", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", hello:"十年，第三個了。" },
    father:  { age:"old", skin:"#d8a880", hair:"#6a6a66", hairStyle:"short", top:"#e8e4d8", coat:"#4a4a3a", bottom:"#3a3a40", mood:"sad", hello:"是誰帶他去崖邊的？" },
    aying:   { age:"old", skin:"#d8a880", hair:"#4a4440", hairStyle:"bun", top:"#c8a0b8", apron:"#3a6a8a", bottom:"#3a3a44", hello:"要買什麼？……啊，是昨天那個孩子的事？" },
    kui:     { hello:"沈警官！小旗子我都插好了！" },
    xu:      { hello:"電池不會說謊。" },
    qian:    { hello:"……二十歲。" },
    wu:      { hello:"學長，霧好大……" }
  };
  ["zhaosi","kui","xu","qian","wu"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.zhaosi.top) Object.assign(LOOK.zhaosi, { skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"long", top:"#5a7a5a", bottom:"#3a4050" });
  if (!LOOK.kui.top) Object.assign(LOOK.kui, { skin:"#f0d0b4", hair:"#5a3a2a", hairStyle:"bob", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050" });
  if (!LOOK.xu.top) Object.assign(LOOK.xu, { skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" });
  if (!LOOK.wu.top) Object.assign(LOOK.wu, { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050", glasses:true });
  if (!LOOK.qian.top) Object.assign(LOOK.qian, { age:"old", skin:"#e0b48c", hair:"#b8b8b0", hairStyle:"balding", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#2a2a30", glasses:true });
  // 山上很冷：凌晨大家都穿著外套
  LOOK.zhaosi = Object.assign({}, LOOK.zhaosi, { coat:"#2a3a2a" });
  const DAILY = {
    guanyu:  [ { room:"camp", x:150, pose:"sit", doing:"坐在自己帳篷門口，手錶一直按亮又按暗。" }, { room:"sdesk", x:30, pose:"sit", doing:"坐在派出所的長椅上，一直看著自己的手。" } ],
    zhaosi:  [ { room:"camp", x:84, pose:"sit", doing:"坐在火堆旁邊的椅子上，雙手抱著膝蓋，一直看著步道那邊。" } ],
    yutong:  [ { room:"camp", x:118, pose:"cry", doing:"站在搭著毯子的椅子旁邊，手機握在手上。" } ],
    zhiming: [ { room:"camp", x:56, pose:"stand", doing:"站在橘色帳篷旁邊，不敢往裡面看。" } ],
    zhang:   [ { room:"below", x:176, pose:"stand", doing:"站在探照燈旁邊，一直在調燈的角度。" } ],
    kui:     [ { room:"cliff", x:60, pose:"kneel", doing:"蹲在彎道外面，一支一支插黃色的小旗子。" }, { x:150, pose:"read", doing:"在鑑識中心比對鞋印的照片。" } ],
    wang:    [ null, { room:"sdesk", x:132, pose:"phone", doing:"在講電話，跟管理處說「明天就去綁」。" } ],
    father:  [ null, { room:"smeet", x:150, pose:"sit", doing:"坐在會客室的沙發上，一動也不動。" } ],
    aying:   [ null, { room:"shop", x:120, pose:"stand", doing:"站在櫃台後面，一直摸著那排黃色的電池。" } ],
    xu:      [ null, { x:50, pose:"read", doing:"盯著計時器，頭燈在桌上亮著。" } ],
    qian:    [ null, { room:"mroom", x:90, pose:"stand", doing:"站在解剖台旁邊，看著那雙磨破的手。" } ],
    wu:      [ { room:"camp", x:20, pose:"write", doing:"在營地一個一個記社員的名字。" }, { room:"sdesk", x:86, pose:"phone", doing:"在打電話，一直說「謝謝、謝謝」。" } ]
  };
  EP21.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP21.rooms = {
    mountain: [
      { id:"camp", name:"營地", scene:"c21_camp", opt:(ph) => ({ day:ph > 0, fog:ph === 0, lampIn:false, cold:ph > 0, emptyBag:true }), details:[
        { id:"d21_boots", name:"帳篷門口的鞋", hot:[45,80,12,6], text:"橘色帳篷門口只剩一雙登山鞋，是黃志明的。旁邊空了一雙的位置，泥巴印還在。" },
        { id:"d21_lantern", name:"燈籠", hot:[121,46,8,12], text:"營地的燈籠，用的是充電式的。上面貼著一張紙：「社產　用完請充電」。" },
        { id:"d21_trash", name:"垃圾袋", hot:[176,74,12,12], text:"綁好的垃圾袋，裡面是泡麵碗和竹筷。最上面有一個空的電池包裝紙，黃色的，印著大象。" },
        { id:"d21_kettle", name:"水壺", hot:[96,72,8,7], text:"燻黑的水壺裡還有半壺水。旁邊擺著十二個鐵杯，每個杯子上都用奇異筆寫了名字。「子安」那個是乾的。" } ] },
      { id:"trail", name:"往廁所的步道", scene:"c21_trail", opt:(ph) => ({ day:ph > 0, fog:ph === 0 }), details:[
        { id:"d21_reflector", name:"樹幹上的反光片", hot:[160,48,7,8], text:"樹幹上釘著一片紅白的反光片。一路上本來每棵樹都有，現在只剩這一片，其他的都只剩釘子。" },
        { id:"d21_steps", name:"原木台階", hot:[54,82,68,6], text:"原木做的台階，上面長了一層滑滑的青苔。霧氣一來，踩上去會滑。" },
        { id:"d21_mossrock", name:"路邊的石頭", hot:[72,58,14,10], text:"路邊一塊長滿青苔的石頭，上面有人用白漆畫了一個箭頭，指著前面。漆掉得差不多了。" } ] },
      { id:"cliff", name:"鷹嘴彎道", scene:"c21_cliff", opt:(ph) => ({ day:ph > 0, fog:ph === 0, flags:true, tape:true, slip:true }), details:[
        { id:"d21_bend", name:"往樹林裡的步道", hot:[28,60,40,24], text:"步道在這裡往左邊彎，鑽進樹林。白天一看就知道要轉彎；晚上沒有燈，就只剩下前面一片黑。" },
        { id:"d21_toilet", name:"遠處的小屋", hot:[20,48,14,12], text:"樹林裡的廁所，還要再走一百公尺。門口的燈壞了。" },
        { id:"d21_post", name:"還站著的木樁", hot:[72,68,7,18], text:"唯一還站著的木樁，繩子綁得很緊，結是新的——這一段後來有人重綁過。再過去就沒有了。" } ] },
      { id:"below", name:"鷹嘴崖下", scene:"c21_below", opt:(ph) => ({ day:ph > 0, fog:ph === 0, body:ph === 0, beam:ph === 0, tape:ph > 0 }), details:[
        { id:"d21_stream", name:"溪溝", hot:[150,92,42,10], text:"溪溝的水很冰，水聲很大。在這裡，上面發生什麼事都聽不到。" },
        { id:"d21_light", name:"探照燈", hot:[158,48,16,12], text:"救難隊的探照燈，接著一台小發電機。燈罩上凝著一層水珠。" } ] }
    ],
    station: [
      { id:"sdesk", name:"值班台", scene:"c21_station", details:[
        { id:"d21_helmets", name:"安全帽", hot:[176,32,12,44], text:"架子上掛著三頂黃色的安全帽，上面寫著「山區勤務」。最下面那頂的帶子斷了。" },
        { id:"d21_window", name:"窗戶", hot:[60,20,26,20], text:"窗外就是上山的路。今天下午，一台接一台的記者車開上去。" } ] },
      { id:"smeet", name:"會客室", scene:"c21_meet", details:[
        { id:"d21_calendar", name:"月曆", hot:[120,18,24,18], text:"牆上的月曆，十二月的照片就是鷹嘴的日出。金色的光從石頭的後面射出來。" },
        { id:"d21_sofa", name:"沙發", hot:[20,58,50,24], text:"舊的人造皮沙發，扶手破了一個洞，用膠帶貼著。" } ] }
    ],
    store: [ { id:"shop", name:"雜貨店", scene:"c21_store", details:[
      { id:"d21_gas", name:"瓦斯罐", hot:[24,40,30,10], text:"一排登山用的瓦斯罐。旁邊的價目表寫著：「一罐 120，兩罐 240」。少了兩罐。" },
      { id:"d21_raincoat", name:"雨衣", hot:[56,28,16,26], text:"黃色的輕便雨衣，一件五十。上面積了一層灰。" },
      { id:"d21_fridge", name:"冰箱", hot:[160,62,26,22], text:"冰箱裡是運動飲料和啤酒。玻璃門上貼著一張「鷹嘴日出最佳時間：06:35」。" } ] } ],
    lab: [ { id:"lab", name:"鑑識中心", scene:"lab", details:[
      { id:"d21_bags", name:"證物袋", hot:[140,20,20,14], text:"一排證物袋，上面寫著「鷹嘴 #1–#38」。每一袋都附了兩張照片，是陳葵的習慣。" } ] } ],
    morgue: [ { id:"mroom", name:"法醫室", scene:"m13_morgue", details:[
      { id:"d21_bag", name:"證物袋", hot:[20,40,14,10], text:"一個證物袋，裝著一張學生證：「鄭子安　大氣科學系」。" } ] } ]
  };
  const PS = [["c21_camp",{ fog:true }],["c21_station",{}]];
  EP21.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 結案：重現 ---------- */
  const strip = L => { const o = Object.assign({}, L); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  EP21.looks = {
    ziC: { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#3a6ab0", coat:"#e8702a", bottom:"#3a3a40", hat:"cap", capColor:"#2a2a2a" },
    gyC: strip(LOOK.guanyu), ytC: strip(LOOK.yutong), zsC: strip(LOOK.zhaosi), zmC: strip(LOOK.zhiming), zhC: strip(LOOK.zhang), ayC: strip(LOOK.aying)
  };
  const RB = [
    { t:"12/19 15:22", d:5, cap:"12 月 19 日 15:22，登山口的雜貨店。他的備用電池忘在宿舍，買了一包最便宜的。老闆娘叫他買鹼性的，他說：「反正只用一個晚上。」", scene:"c21_store", opt:{}, m:{ ziC:[104,94,"reach",1,20,94], ayC:[124,90,"stand",-1] } },
    { t:"12/19 20:10", d:5, cap:"20:10，他在火堆旁邊換上新電池，打開頭燈，掛在帳篷頂上當燈。趙思妤坐在對面。", scene:"c21_camp", opt:{ lampIn:false }, m:{ ziC:[90,94,"sit+inspect",1], zsC:[116,94,"sit",-1] } },
    { t:"12/19 21:00", d:5, cap:"21:00，林冠宇在火堆旁邊對他吼：「你再靠近她試試看。」", scene:"c21_camp", opt:{ lampIn:true }, m:{ gyC:[110,94,"point",-1], ziC:[84,94,"stand",1] } },
    { t:"12/19 23:50", d:5, cap:"23:50，霧來了。守夜的江雨彤在椅子上睡著了。林冠宇在自己的睡袋裡。", scene:"c21_camp", opt:{ fog:true, lampIn:true }, m:{ ytC:[114,94,"sit",-1], zsC:[82,94,"sit",1] } },
    { t:"12/20 00:05", d:5, cap:"00:05，他走出帳篷，往廁所的步道走。頭燈已經黃了。", scene:"c21_camp", opt:{ fog:true, lampIn:false }, m:{ ziC:[200,94,"walk1",1,40,94], ytC:[114,94,"sit",-1], zsC:[82,94,"sit",1] }, out:["ziC"] },
    { t:"12/20 00:09", d:4.5, cap:"00:09，他在步道上拍了一張照片：一片白，中間一圈很暗的黃光。手機只剩 3%。", scene:"c21_trail", opt:{ fog:true }, m:{ ziC:[110,94,"phone",1,20,94] } },
    { t:"12/20 00:15", d:5, cap:"00:15 前後，頭燈熄了。一分鐘後，手機也沒電了。", scene:"c21_cliff", opt:{ fog:true, noPrints:true, whole:true }, m:{ ziC:[66,94,"walk1",1,10,94] } },
    { t:"12/20 00:18", d:6, cap:"步道在這裡往左彎，護欄繩倒在地上。他看不見，直直往前，一小步、一小步地摸。", scene:"c21_cliff", opt:{ fog:true, whole:true }, m:{ ziC:[164,94,"walk1",1,66,94] } },
    { t:"12/20 00:20", d:4.5, cap:"00:20，鷹嘴最前面的一角，斷了。", scene:"c21_cliff", opt:{ fog:true, slip:true }, m:{ ziC:[172,98,"stumble",1,164,94] }, out:["ziC"] },
    { t:"12/20 02:40", d:5, cap:"02:40，救難隊的探照燈照到了崖下。他的鬧鐘，設在 05:20。", scene:"c21_below", opt:{ body:true, beam:true, fog:true }, m:{ zhC:[170,94,"point",-1] } }
  ];
  EP21.court = {
    title: "山下派出所・12 月 20 日 17:20", scene: "c21_station",
    who: ph => ["guanyu","yutong","zhiming","father"],
    open: ph => "17:20，山下派出所。鄭國華坐在最前面，眼睛一直盯著林冠宇。江雨彤和黃志明坐在後面，中間隔著一張空椅子。王所長站在門口，手上拿著那張報修單。",
    kindLine: {
      accident: "鄭子安的死，是一場意外。",
      murder: "鄭子安不是自己掉下去的。有人讓他掉下去。",
      suicide: "鄭子安是自己跳下去的。"
    },
    kindTrue: "一包三十九塊的電池，四個鐘頭。23:50 起的濃霧。往左彎的步道，和早就倒在泥巴裡的繩子。彎道外只有他一個人的鞋印，一小步一小步。斷掉的那一角石頭上，是他自己的腳印。……沒有人推他。",
    murmur: [ "（林冠宇一直在摳手錶的錶帶。）", "（江雨彤把手機螢幕按暗，又按亮。）", "（鄭國華的手抓著那張學生證影本。）" ],
    confess: {},
    cornered: {},
    deny: {
      guanyu: "我說了那句話……可是我沒有出去。我真的沒有出去。",
      yutong: "我那時候睡著了……我連他出去都不知道……",
      zhiming: "我在睡覺……我一點半才醒來……",
      father: "……我是他爸爸。"
    },
    replayText: "12 月 19 日下午，登山口的雜貨店。他看著架子上的兩種電池——",
    replay: { scene:"c21_store", opt:{}, clean:true, cam:"事發經過重現", date:"2026-12-19", beats:RB },
    endGood: "17:30，王所長對鄭國華說：「是意外。」他把報修單、氣象紀錄、電池的化驗報告，一張一張攤在桌上。\n鄭國華看了很久。最後他走到林冠宇面前，什麼都沒說，只是拍了拍他的肩膀。\n第二天早上，管理處的人上山，把鷹嘴彎道的繩子重新綁好，在木樁上掛了一盞太陽能燈。\n雜貨店的電池架上，黃色的那一排不見了。",
    endBad: "案子以「他殺嫌疑」移送。林冠宇被帶回去問了三次。\n社團解散了。新聞說：「登山社情殺？」\n鷹嘴彎道的繩子，一直到一月十五日才有人去綁。"
  };

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP21.outScenes = ["c21_camp","c21_trail","c21_cliff","c21_below"];
  EP21.fac = { mountain:["#5a6a48","#3a5a2a"], station:["#d8e0d0","#3f5a7a"], store:["#c8b898","#c83a2a"], lab:["#e2e8e8","#3a7a8a"], morgue:["#d8e0e0","#5a7a8a"] };
  EP21.setting = { mountain:"village", station:"village", store:"village", lab:"city", morgue:"city" };
  const SKY21 = [ ["#080c16","#2a3240","#262a1e","#2e3426",0,0], ["#b8ccdc","#e8ecee","#6a7a58","#5a6a48",0,0] ];
  EP21.worldSky = ph => SKY21[Math.min(ph || 0, SKY21.length - 1)];
  EP21.roomDesc = {
    camp:"登山社的營地。十二個人，六頂帳篷。", trail:"往廁所的步道，兩邊都是樹。", cliff:"鷹嘴彎道。步道在這裡往左彎；右邊那塊大石頭，就是鷹嘴。", below:"鷹嘴崖下。從溪溝爬上來的亂石堆。",
    sdesk:"山下派出所的值班台。", smeet:"派出所的會客室。", shop:"登山口雜貨店。", lab:"鑑識中心。", mroom:"法醫室。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police" };
  EP21.world = {};
  EP21.locations.forEach(l => { EP21.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP21.world.mountain, {
    extras: [
      { id:"cop21", name:"派出所員警", phase:0, until:0, x:RX(0) + 66, L:COP, pose:"stand", facing:1, lines:[
        "社員十二個，一個都沒讓他們下山。帳篷都沒動。", "崖下那邊，救難隊的老張還在。要下去的話，從溪溝那邊繞，路很滑。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長……霧好大。手電筒照出去，只看得到一片白。", "小吳"),
      say("wu", "社員十二個都在營地。鄭子安在鷹嘴崖下面，救難隊的人在那邊顧著。", "小吳"),
      say("you", "先問人，再去崖邊。", "你"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  EP21.mapPos = { mountain:[50,40,"u"], store:[86,72,"u"], station:[110,82,"r"], lab:[196,62,"r"], morgue:[214,86,"r"] };
  EP21.mapRoads = [["mountain","store"],["store","station"],["station","lab"],["lab","morgue"],["station","morgue"]];
  EP21.mapDraw = (p, t) => {
    const { R } = p;
    R(0, 0, 240, 135, "#7a8a5a");
    for (let x = 0; x < 140; x += 2){ const h = 30 + Math.sin(x / 13) * 10 + Math.sin(x / 5) * 3; R(x, h, 2, 70 - h + 20, "#4a6a3a"); }
    for (let k = 0; k < 30; k++) R((k * 37) % 130 + 4, 40 + (k * 13) % 40, 3, 4, "#2e4a26");
    R(150, 30, 90, 105, "#a8a8a0"); for (let x = 156; x < 236; x += 8) for (let y = 36; y < 128; y += 7) R(x, y, 6, 5, "#c8c0b0");
    R(36, 30, 10, 6, "#8a8a7e"); R(44, 33, 6, 3, "#9a9a8e");   // 鷹嘴
  };
})();
