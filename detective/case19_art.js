/* =========================================================
   第 19 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP19.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i] = beatAt(o.t || 0, o.ds); return (o.seq || [])[i] || {}; };
  const progOf = o => o.ds ? beatAt(o.t || 0, o.ds)[1] : 1;
  const lerpV = (v, p) => Array.isArray(v) ? v[0] + (v[1] - v[0]) * p : v;
  const tile = (x, y, w, h, c, l) => { R(x, y, w, h, c); for (let yy = y; yy < y + h; yy += 8) R(x, yy, w, 1, l); for (let xx = x; xx < x + w; xx += 8) R(xx, y, 1, h, l); };
  const rain = (x, y, w, h) => { for (let k = 0; k < Math.floor(w * h / 60); k++) { const rx = x + (k * 37) % w, ry = y + (k * 23) % Math.max(1, h - 4); R(rx, ry, 1, 3, "#a8c0d8aa"); } };
  // 黑傘：撐在頭上（x＝人的中央）
  const umbrella = (x, low) => { const y = low ? 56 : 50; R(x - 13, y + 5, 26, 2, "#14161c"); R(x - 11, y + 3, 22, 2, "#1a1c24"); R(x - 8, y + 1, 16, 2, "#22242c"); R(x - 4, y, 8, 1, "#2a2c34"); P(x, y - 1, "#4a4c54"); R(x - 12, y + 4, 24, 1, "#6a6c78"); R(x - 8, y + 2, 4, 1, "#5a5c68"); for (let k = -12; k <= 12; k += 6) P(x + k, y + 7, "#2a2c34"); };

  /* ---------- 福安街的老公寓 ---------- */
  // 一樓大門和樓梯間：鐵門、門上的監視器、信箱、管委會的小鐵箱、公告欄、往上的樓梯
  SC.c19_stairs = (o) => { o = Object.assign({}, o, stOf(o));
    const p = progOf(o);
    wall(80, "#c8c0a8", false); R(0, 66, W, 14, "#8a9a8a"); for (let x = 0; x < W; x += 6) R(x, 66, 1, 14, "#7a8a7a");
    R(30, 4, 6, 2, "#f4f0d0"); dither(20, 6, 26, 12, "#f4f0d022", 3);   // 樓梯燈
    // 鐵門（左）
    R(2, 26, 28, 54, "#3a3c40"); R(4, 28, 24, 50, o.rain ? "#1a2230" : "#22283a"); for (let x = 6; x < 28; x += 4) R(x, 28, 1, 50, "#5a5c62"); R(4, 50, 24, 1, "#5a5c62"); R(24, 52, 3, 2, "#c8a040");
    if (o.rain) rain(4, 28, 24, 50);
    // 門上的監視器
    R(10, 16, 10, 5, "#2a2a2e"); R(17, 17, 3, 3, "#4a4a52"); P(11, 17, "#e83a3a"); R(14, 21, 1, 5, "#5a5a5e");
    // 信箱
    R(40, 40, 30, 20, "#6a6e64"); for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { R(41 + c * 10, 41 + r * 10, 8, 8, "#7a7e72"); R(42 + c * 10, 43 + r * 10, 6, 1, "#2a2a2a"); } R(62, 52, 6, 4, "#f4f0e0"); R(63, 51, 4, 1, "#e83a3a");
    // 管委會的小鐵箱（錄影機）
    R(76, 50, 14, 12, "#5a5e66"); R(77, 51, 12, 10, "#6a6e76"); R(86, 55, 2, 2, "#c8a040"); P(79, 53, "#3ae86a");
    // 公告欄
    R(96, 30, 30, 22, "#8a6a4a"); R(98, 32, 26, 18, "#d8c8a0"); R(100, 34, 10, 7, "#f4f4f0"); R(101, 35, 8, 1, "#c83a2a"); R(112, 34, 10, 12, "#f4f0e0"); for (let k = 0; k < 4; k++) R(113, 37 + k * 2, 8, 1, "#5a5a5a");
    // 樓梯（往右上）
    R(136, 26, 56, 54, "#b8b0a0"); for (let k = 0; k < 9; k++) { const sx = 140 + k * 6, sy = 78 - k * 5; R(sx, sy, W - sx, 2, "#d8d0c0"); R(sx, sy + 2, W - sx, 3, "#a8a090"); }
    for (let k = 0; k < 9; k++) R(140 + k * 6, 60 - k * 5, 1, 18, "#5a4a3a"); R(140, 58, 54, 1, "#6a5a4a"); for (let k = 0; k < 9; k++) R(140 + k * 6, 58 - k * 5, 6, 1, "#6a5a4a");
    R(176, 2, 16, 20, "#a8a090"); txt("4F", 180, 14, "#5a5a5a", "6px sans-serif");
    floor(80, "#9a948a", "#8a8478"); for (let x = 2; x < W; x += 12) for (let y = 84; y < H; y += 9) P(x + (y % 2) * 5, y, "#b4aea2");
    if (o.drops !== false) for (let k = 0; k < 7; k++) { R(146 + k * 6, 75 - k * 5, 2, 1, "#7a7a76"); }
    if (o.dark) R(0, 0, W, H, "#0a0c1488");
  };
  SC.c19_stairs.front = (o) => { o = Object.assign({}, o, stOf(o)); const p = progOf(o); if (o.umb !== undefined) umbrella(Math.round(lerpV(o.umb, p)), o.umbLow); };

  // 客廳：窗戶和相機、冷氣、茶几上的酒菜、電視櫃（數位相框、電視、音箱）、牆上的白色主機、沙發
  SC.c19_living = (o) => { o = Object.assign({}, o, stOf(o));
    wall(80, "#e4dcc8", false); R(0, 74, W, 6, "#c8b898"); for (let x = 0; x < W; x += 32) R(x, 0, 1, 74, "#d8d0bc");
    const lit = o.light !== false;
    // 窗戶（月亮）和相機
    R(8, 18, 28, 28, "#8a7a5a"); R(10, 20, 24, 24, "#1a2440"); R(24, 24, 5, 5, "#f4f0c8"); R(25, 23, 3, 1, "#f4f0c8"); R(21, 20, 1, 24, "#8a7a5a"); R(10, 31, 24, 1, "#8a7a5a");
    R(8, 46, 28, 3, "#a8987a"); R(14, 42, 8, 4, "#2a2a2e"); R(20, 43, 6, 2, "#3a3a3e"); R(16, 46, 1, 6, "#5a5a5e");
    // 冷氣
    R(44, 10, 30, 9, "#f4f4f0"); R(46, 17, 26, 1, "#c8c8c4"); P(70, 12, o.ac ? "#3ae86a" : "#5a5a5a"); if (o.ac) dither(46, 19, 26, 6, "#c8e8f833", 3);
    // 茶几
    R(40, 70, 40, 4, "#8a5a3a"); R(42, 74, 2, 8, "#6a4a2a"); R(76, 74, 2, 8, "#6a4a2a");
    R(46, 60, 4, 10, "#e8e4d8"); R(46, 58, 4, 2, "#c83a2a"); R(47, 64, 2, 3, "#c83a2a");   // 高粱
    R(52, 67, 3, 3, "#f4f4f0"); R(57, 67, 3, 3, "#f4f4f0"); R(62, 66, 6, 4, "#c8a060"); R(63, 66, 4, 1, "#8a5a2a");   // 杯子、滷味
    if (o.phone !== false) R(70, 68, 5, 2, "#1a1a1e");
    // 電視櫃
    R(84, 60, 50, 3, "#6a4a2a"); R(84, 63, 50, 15, "#7a5a3a"); R(86, 66, 22, 10, "#6a4a2a"); R(110, 66, 22, 10, "#6a4a2a"); P(107, 70, "#c8a040"); P(111, 70, "#c8a040");
    R(92, 34, 30, 20, "#1a1a1e"); R(93, 35, 28, 17, o.tv ? "#3a6aa8" : "#2a2c34"); if (o.tv) { R(95, 37, 12, 6, "#e8e8f0"); R(95, 45, 24, 2, "#c83a2a"); } R(105, 54, 4, 6, "#2a2a2e");
    R(85, 52, 7, 8, "#3a3a3e"); R(86, 53, 5, 6, lit ? "#e8c8a0" : "#5a5040");   // 數位相框
    R(123, 52, 8, 8, "#f4f4f0"); R(124, 52, 6, 1, o.listen ? "#3ac8e8" : "#c8c8c4");   // 音箱
    // 牆上的白色主機
    R(134, 22, 8, 8, "#f4f4f0"); R(135, 23, 6, 6, "#e8e8e4"); P(138, 28, "#3ae86a"); R(137, 30, 1, 10, "#c8c8c4");
    // 月曆
    R(160, 20, 20, 26, "#f4f4f0"); R(160, 20, 20, 5, "#c83a2a"); for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) P(162 + c * 4, 28 + r * 4, "#5a5a5a"); R(173, 39, 3, 3, "#e83a3a");
    // 沙發
    R(144, 56, 44, 10, "#7a3a2a"); R(140, 62, 6, 16, "#7a3a2a"); R(186, 62, 6, 16, "#7a3a2a"); R(146, 66, 40, 8, "#8a4a3a"); R(146, 74, 40, 4, "#6a2a1a"); R(150, 60, 10, 6, "#e8c040");
    floor(80, "#a88a6a", "#98785a"); for (let x = 0; x < W; x += 20) R(x, 80, 1, 28, "#8a6a4a");
    if (!lit) R(0, 0, W, H, "#0a0c18aa");
  };

  // 浴室：門口、熱水器面板、洗衣籃、毛巾架、洗手台、浴缸、小窗
  SC.c19_bath = (o) => { o = Object.assign({}, o, stOf(o));
    tile(0, 0, W, 80, "#c8d8d0", "#b8c8c0"); R(0, 0, W, 4, "#a8b8b0");
    R(2, 22, 14, 58, "#8a7a6a"); R(4, 24, 10, 56, "#3a3430");   // 門口
    if (o.slippers !== false) { R(4, 94, 5, 2, "#3a5a8a"); R(10, 94, 5, 2, "#3a5a8a"); }
    // 熱水器面板
    R(20, 36, 10, 8, "#f4f4f0"); R(21, 37, 8, 3, "#2a3a2a"); P(22, 38, "#6ae86a"); P(25, 38, "#6ae86a"); R(22, 41, 2, 2, "#c8c8c4"); R(26, 41, 2, 2, "#e83a3a");
    // 毛巾架
    R(36, 30, 26, 2, "#c8ccd0"); R(40, 32, 16, 14, "#e8d8b8"); R(40, 32, 16, 2, "#d8c8a8");
    // 洗衣籃
    R(66, 66, 14, 12, "#c8b080"); for (let k = 0; k < 4; k++) R(67, 68 + k * 3, 12, 1, "#a89060"); R(68, 64, 8, 2, "#8aa0c8");
    // 洗手台
    R(84, 26, 14, 16, "#a8b8c0"); R(85, 27, 12, 14, "#d8e8f0"); R(82, 46, 18, 5, "#f4f4f0"); R(87, 51, 8, 26, "#e8e8e0");
    // 浴缸
    R(104, 60, 84, 18, "#f4f4f0"); R(104, 58, 84, 3, "#e8e8e0"); R(106, 62, 80, 2, "#d8e0e4"); R(104, 76, 84, 2, "#d8d8d0");
    R(180, 40, 2, 18, "#c8ccd0"); R(176, 38, 8, 3, "#c8ccd0");   // 水龍頭
    // 小窗（開了一條縫）
    R(140, 18, 26, 16, "#8a8e94"); R(142, 20, 22, 12, "#18202c"); R(142, 20, 4, 12, "#3a4a5a");
    tile(0, 80, W, 28, "#c0ccd0", "#b0bcc0");
    if (o.body) { R(100, 88, 50, 9, "#f4f4f0"); R(102, 86, 44, 3, "#e8e8e8"); R(106, 91, 38, 1, "#e0e0e0"); R(146, 90, 5, 5, "#5a5a5e"); R(98, 92, 3, 3, "#5a1a1a"); }
    if (o.dark) R(0, 0, W, H, "#0a0c12cc");
  };

  // 書房（暗房）：整面牆的底片櫃、書桌和信、放大機、晾照片的線、紅燈、顯影盤
  SC.c19_study = (o) => { o = Object.assign({}, o, stOf(o));
    wall(80, "#5a4a44", false); R(0, 74, W, 6, "#4a3a34");
    // 底片櫃
    R(8, 14, 62, 62, "#6a4a2a"); for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) { const x = 10 + c * 10, y = 16 + r * 7, empty = (r === 6 && c === 1); R(x, y, 8, 5, empty ? "#2a1a10" : "#8a6a4a"); if (!empty) { R(x + 3, y + 2, 2, 1, "#c8a040"); P(x + 1, y + 1, "#f4f0e0"); } }
    // 晾照片的線
    R(78, 20, 112, 1, "#c8c8c4"); for (let k = 0; k < 9; k++) { const x = 82 + k * 12; R(x, 21, 1, 2, "#8a8a8e"); R(x - 3, 23, 8, 10, "#f4f0e0"); R(x - 2, 24, 6, 8, "#1a1a24"); R(x, 26 + (k % 3), 2, 2, "#e8e4c8"); }
    // 紅燈
    R(176, 0, 1, 8, "#3a3a3a"); R(173, 8, 7, 4, o.red ? "#e83a2a" : "#6a2a2a"); if (o.red) dither(150, 6, 42, 30, "#e83a2a22", 2);
    // 書桌、放大機、信
    R(88, 60, 56, 4, "#6a4a2a"); R(90, 64, 2, 16, "#5a3a1a"); R(140, 64, 2, 16, "#5a3a1a"); R(92, 64, 22, 10, "#5a3a1a");
    R(122, 28, 3, 32, "#3a3a3e"); R(118, 28, 12, 8, "#2a2a2e"); R(119, 36, 10, 4, "#4a4a52"); R(116, 56, 16, 4, "#2a2a2e");
    R(104, 56, 14, 4, "#f4f4f0"); R(105, 57, 5, 1, "#3a5aa8"); R(111, 57, 5, 2, "#e83a3a");
    // 顯影盤
    R(148, 64, 40, 3, "#6a6e74"); R(146, 67, 44, 13, "#5a5e64"); for (let k = 0; k < 3; k++) { R(150 + k * 12, 60, 10, 4, "#e8e8e4"); R(151 + k * 12, 61, 8, 2, ["#c8b880","#a8c0c8","#d8d8c8"][k]); }
    floor(80, "#4a3e38", "#3e3430");
    if (o.red) dither(0, 0, W, H, "#e83a2a11", 3);
  };

  /* ---------- 許振業家 ---------- */
  SC.c19_xuhome = (o) => {
    wall(80, "#d8ccb4", false); R(0, 74, W, 6, "#b8a888");
    R(26, 38, 22, 4, "#6a4a2a"); R(28, 42, 2, 38, "#5a3a1a"); R(44, 42, 2, 38, "#5a3a1a"); R(28, 56, 18, 2, "#5a3a1a");   // 椅子
    R(30, 48, 14, 16, "#4a5a4a"); R(32, 50, 4, 10, "#3a4a3a"); dither(30, 48, 14, 16, "#2a3a5a55", 2);   // 濕外套
    R(80, 20, 20, 16, "#6a4a2a"); R(81, 21, 18, 14, "#c8c0a8"); R(84, 25, 4, 8, "#3a4a6a"); R(91, 25, 4, 8, "#3a4a6a"); R(85, 23, 2, 2, "#d8a880"); R(92, 23, 2, 2, "#d8a880");   // 老照片
    R(110, 30, 30, 24, "#3a3a3e"); R(112, 32, 26, 18, "#1a1a1e"); R(122, 54, 6, 4, "#3a3a3e");   // 舊電視
    R(60, 70, 50, 4, "#7a5a3a"); R(62, 74, 2, 8, "#5a3a1a"); R(106, 74, 2, 8, "#5a3a1a"); R(70, 62, 3, 8, "#3a6a3a"); R(76, 66, 4, 4, "#f4f4f0"); R(86, 66, 8, 4, "#e8e4dc"); R(87, 65, 2, 1, "#e83a3a");   // 茶几：空酒瓶、杯子、解酒液
    R(150, 52, 38, 10, "#8a7a5a"); R(146, 58, 6, 20, "#8a7a5a"); R(186, 58, 6, 20, "#8a7a5a"); R(152, 62, 34, 12, "#9a8a6a");   // 舊沙發
    R(160, 14, 20, 26, "#2a3040"); R(162, 16, 16, 22, "#1a2030"); R(169, 16, 1, 22, "#3a4050");   // 窗
    floor(80, "#8a7a62", "#7a6a52");
  };

  /* ---------- 宏軒智能 ---------- */
  SC.c19_olobby = (o) => {
    wall(80, "#e8ecf0", false); R(0, 74, W, 6, "#c8ccd4"); R(0, 10, W, 2, "#3a8ac8");
    R(8, 26, 28, 54, "#8a8e96"); R(10, 28, 11, 52, "#b8bcc4"); R(23, 28, 11, 52, "#b8bcc4"); R(16, 20, 12, 4, "#2a2a2e"); P(21, 21, "#e8c040");   // 電梯
    R(54, 30, 50, 14, "#2a4a7a"); txt("宏軒智能", 58, 40, "#f4f4f0", "9px sans-serif");
    for (let k = 0; k < 2; k++) { R(66 + k * 22, 64, 4, 16, "#5a5e66"); R(64 + k * 22, 62, 8, 3, "#3a3e46"); P(67 + k * 22, 63, "#3ae86a"); }   // 刷卡閘門
    R(118, 60, 56, 4, "#6a5a4a"); R(120, 64, 52, 16, "#7a6a5a"); R(140, 50, 12, 9, "#2a2a2e"); R(141, 51, 10, 6, "#3a6aa8"); R(144, 59, 4, 2, "#2a2a2e");   // 警衛台、電腦
    R(156, 48, 16, 10, "#2a2a2e"); R(157, 49, 6, 4, "#3a4a3a"); R(164, 49, 7, 4, "#3a4a3a"); R(157, 53, 6, 4, "#3a4a3a"); R(164, 53, 7, 4, "#3a4a3a");   // 監視器螢幕
    R(178, 22, 14, 58, o.night ? "#1a2438" : "#a8c8d8"); R(184, 22, 1, 58, "#8a8e96");
    floor(80, "#c8ccd0", "#b8bcc4");
  };
  SC.c19_ofloor = (o) => {
    wall(80, "#eef0f2", false); R(0, 74, W, 6, "#d0d4d8");
    R(20, 22, 40, 26, "#f8f8f8"); R(20, 22, 40, 1, "#8a8a8e"); for (let k = 0; k < 5; k++) R(23, 26 + k * 4, 30 - (k % 2) * 10, 1, k === 4 ? "#3a5aa8" : "#2a2a2e"); R(50, 40, 6, 3, "#3a5aa8");
    for (let d = 0; d < 3; d++) { const x = 70 + d * 40; R(x, 60, 34, 3, "#d8d0c0"); R(x + 2, 63, 2, 17, "#a8a090"); R(x + 30, 63, 2, 17, "#a8a090"); R(x + 10, 48, 14, 10, "#2a2a2e"); R(x + 11, 49, 12, 8, d === 2 ? "#1a1a1e" : "#3a5a8a"); R(x + 16, 58, 2, 2, "#2a2a2e"); }
    R(150, 56, 6, 4, "#c8a060"); R(144, 54, 5, 6, "#f4f4f0"); R(145, 53, 3, 1, "#e8c040");   // 鄭立凡的座位：相框、咖啡
    R(180, 20, 12, 56, o.night ? "#1a2438" : "#a8c8d8"); R(186, 20, 1, 56, "#8a8e96");
    floor(80, "#9aa0a8", "#8a9098");
    if (o.night) R(0, 0, W, H, "#0a102026");
  };
  SC.c19_ob2 = (o) => {
    wall(80, "#8a8a86", false); R(0, 0, W, 6, "#6a6a66"); for (let x = 40; x < W; x += 70) { R(x, 0, 8, 80, "#a8a8a2"); R(x, 40, 8, 6, "#e8c040"); }
    for (let x = 10; x < W; x += 50) { R(x, 6, 20, 2, "#f4f8f0"); dither(x - 4, 8, 28, 6, "#f4f8f022", 3); }
    R(4, 20, 16, 8, "#2a5a8a"); txt("B2", 7, 26, "#f4f4f0", "5px sans-serif");
    R(20, 62, 12, 14, "#a8acb0"); R(19, 60, 14, 3, "#c8ccd0"); R(22, 76, 8, 4, "#8a8e92");   // 菸灰桶
    // 灰色休旅車（車頭朝左）
    R(96, 62, 90, 16, "#7a7e86"); R(108, 48, 66, 15, "#6a6e76"); R(110, 50, 18, 10, "#3a4a5a"); R(130, 50, 22, 10, "#3a4a5a"); R(154, 50, 18, 10, "#3a4a5a");
    R(102, 74, 12, 10, INK); R(166, 74, 12, 10, INK); R(105, 77, 6, 4, "#8a8a8e"); R(169, 77, 6, 4, "#8a8a8e"); R(96, 66, 4, 3, "#fff4c0"); R(182, 66, 4, 3, "#c83a3a");
    if (o.coat !== false) { R(132, 56, 16, 4, "#1e2a4a"); R(134, 55, 6, 1, "#2a3a5a"); R(146, 52, 2, 8, "#14161c"); }   // 後座的雨衣和傘
    R(112, 56, 8, 3, "#2a2a2e");   // 副駕駛座的平板
    floor(80, "#6a6a66", "#5a5a56"); for (let x = 4; x < W; x += 50) R(x, 92, 30, 1, "#e8e8e0");
  };

  /* ---------- 刑大：偵訊室、等候區 ---------- */
  SC.c19_interview = (o) => {
    wall(80, "#c8ccc4", false); R(0, 74, W, 6, "#a8aca4");
    R(110, 16, 70, 40, "#2a2e34"); R(112, 18, 66, 36, "#4a525a"); dither(112, 18, 66, 36, "#8a9aaa22", 3);   // 單面鏡
    R(30, 64, 64, 4, "#8a8e92"); R(34, 68, 2, 14, "#6a6e72"); R(88, 68, 2, 14, "#6a6e72"); R(56, 60, 10, 4, "#f4f4f0"); R(70, 61, 6, 3, "#c8a060");
    R(20, 58, 2, 22, "#5a5e62"); R(14, 58, 8, 2, "#5a5e62"); R(102, 58, 2, 22, "#5a5e62"); R(102, 58, 8, 2, "#5a5e62");
    R(150, 2, 10, 5, "#2a2a2e"); P(151, 3, "#e83a3a");
    floor(80, "#8a8e8a", "#7a7e7a");
  };
  SC.c19_wait = (o) => {
    wall(80, "#d8d4c8", false); R(0, 74, W, 6, "#b8b4a8");
    R(10, 20, 40, 30, "#a8c8d8"); R(29, 20, 1, 30, "#8a8e92"); dither(10, 20, 40, 30, "#ffffff33", 2);
    for (let k = 0; k < 2; k++) { const x = 60 + k * 60; R(x, 66, 50, 4, "#3a6a9a"); R(x, 58, 50, 8, "#4a7aaa"); R(x + 2, 70, 2, 10, "#5a5e62"); R(x + 46, 70, 2, 10, "#5a5e62"); }
    R(176, 30, 16, 50, "#c83a2a"); R(178, 34, 12, 24, "#1a1a1e"); for (let k = 0; k < 3; k++) R(179, 36 + k * 7, 10, 4, ["#e8c040","#3a8ac8","#6ae86a"][k]); R(180, 64, 8, 4, "#2a2a2e");
    R(90, 20, 30, 12, "#f4f4f0"); txt("請稍候", 94, 29, "#3a5a8a", "6px sans-serif");
    floor(80, "#a8a49a", "#98948a");
  };

  /* ---------- 幕後：許振業家樓下（深夜） ---------- */
  SC.c19_street = (o) => {
    R(0, 0, W, 40, "#0a0f1c"); for (let k = 0; k < 8; k++) P((k * 37 + 11) % W, 4 + (k * 13) % 28, "#8a8aa0");
    R(150, 8, 8, 8, "#f4f0c8"); R(151, 7, 6, 1, "#f4f0c8");
    R(0, 24, 120, 62, "#3a3a40"); for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) R(8 + c * 22, 30 + r * 16, 12, 10, (r + c) % 3 ? "#1a1c24" : "#e8d890");
    R(30, 64, 18, 22, "#2a2a30"); R(32, 66, 14, 20, "#4a4e56"); R(38, 60, 6, 3, "#fff4c0"); dither(26, 60, 26, 24, "#fff4c022", 2);
    R(120, 40, 72, 46, "#2a2c34"); for (let c = 0; c < 3; c++) R(128 + c * 22, 48, 12, 10, c === 1 ? "#e8d890" : "#1a1c24");
    R(100, 20, 2, 66, "#5a5a5e"); R(96, 18, 10, 3, "#5a5a5e"); R(98, 21, 6, 2, "#fff4c0"); R(96, 86, 12, 2, "#4a4a40");
    floor(86, "#2a2a2e", "#24242a"); R(0, 86, W, 2, "#4a4a4e");
    R(60, 96, 30, 3, "#2a3a4a"); dither(60, 96, 30, 3, "#5a7a9a55", 2);
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    lifan:  { skin:"#e8c09a", hair:"#1e1a18", hairStyle:"short", top:"#c8ccd4", coat:"#3a4a6a", bottom:"#2a2f3a", glasses:true, mood:"worried", hello:"爸他……他每天都會泡澡的。" },
    meijun: { skin:"#f0d0b4", hair:"#2a2220", hairStyle:"long", top:"#a85a4a", bottom:"#3a3a44", mood:"sad", hello:"我只想知道，爸最後是不是很痛。" },
    xuzy:   { hello:"……葛仔呢？" },
    lin:    { age:"old", skin:"#e8c0a0", hair:"#6a5a50", hairStyle:"bob", top:"#c8a0c8", bottom:"#4a4a52", hello:"我就住樓上，什麼都聽得到。" },
    peng:   { skin:"#e0b48c", hair:"#1a1410", hairStyle:"slick", top:"#f4f4f0", coat:"#3a3a40", bottom:"#3a3a40", tie:"#2a5a8a", hello:"我們是正派的公司。" },
    guard:  { age:"old", skin:"#d8a880", hair:"#a8a8a0", hairStyle:"short", top:"#3a4a6a", bottom:"#2a2f3a", hat:"cap", capColor:"#2a3a5a", hello:"這麼晚了，警察先生要找誰？" },
    kui:    { hello:"沈警官……我、我第一次出命案現場。" },
    xu:     { hello:"……你要問什麼，就問吧。" },
    qian:   { hello:"四十年。我沒想到有一天要驗他。" },
    wu:     { hello:"學長，這種音箱我家也有……" },
    ye:     { hello:"17:30。" }
  };
  ["xuzy","kui","xu","qian","wu","ye"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.xuzy.top) Object.assign(LOOK.xuzy, { age:"old", skin:"#d0a080", hair:"#8a8a84", hairStyle:"balding", top:"#6a5a4a", bottom:"#3a3430", beard:true });
  if (!LOOK.kui.top) Object.assign(LOOK.kui, { skin:"#f0d0b4", hair:"#5a3a2a", hairStyle:"bob", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050" });
  if (!LOOK.xu.top) Object.assign(LOOK.xu, { skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" });
  if (!LOOK.wu.top) Object.assign(LOOK.wu, { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050", glasses:true });
  if (!LOOK.qian.top) Object.assign(LOOK.qian, { age:"old", skin:"#e0b48c", hair:"#b8b8b0", hairStyle:"balding", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#2a2a30", glasses:true });
  if (!LOOK.ye.top) Object.assign(LOOK.ye, { skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"pony", top:"#f4f4f0", coat:"#6a6e74", bottom:"#6a6e74", skirt:true });
  LOOK.xuzy.mood = "sad";
  const DAILY = {
    lifan:  [ { room:"living", x:150, pose:"phone", doing:"站在沙發旁邊，一直在滑手機，眼鏡推了好幾次。" }, { room:"interview", x:62, pose:"sit", doing:"坐在偵訊室的桌子前面，手指在桌上敲個不停。" } ],
    meijun: [ { room:"living", x:170, pose:"sit", doing:"坐在沙發上，手上還握著備用鑰匙。" }, { room:"wait", x:84, pose:"sit", doing:"坐在等候區的長椅上，一直看著手機裡爸爸的照片。" } ],
    xuzy:   [ { room:"xroom", x:166, pose:"sit", doing:"坐在沙發上，酒還沒醒，眼睛紅紅的。" }, { room:"wait", x:146, pose:"sit", doing:"坐在等候區最旁邊，雙手撐著膝蓋，一動也不動。" } ],
    lin:    [ { room:"stairs", x:120, pose:"cross", doing:"穿著睡衣站在樓梯口，雙手抱胸。" }, { room:"stairs", x:120, pose:"stand", doing:"在樓梯口跟別的住戶講話，看到你就停下來。" } ],
    peng:   [ null, { room:"wait", x:30, pose:"phone", doing:"站在等候區的窗邊講電話，一直說「是、是」。" } ],
    guard:  [ { room:"olobby", x:146, pose:"stand", doing:"站在警衛台後面，看著監視器螢幕。" }, { room:"olobby", x:146, pose:"read", doing:"坐在警衛台後面看報紙。" } ],
    kui:    [ { room:"bath", x:40, pose:"write", doing:"蹲在浴室門口，一直在筆記本上寫東西。" }, { x:150, pose:"read", doing:"在鑑識中心整理浴室的照片，一張一張編號。" } ],
    xu:     [ null, { x:50, pose:"read", doing:"戴著耳機，盯著電腦上的波形，很久都沒有眨眼。" } ],
    qian:   [ null, { room:"mroom", x:90, pose:"stand", doing:"站在解剖台旁邊，手放在白布上。" } ],
    wu:     [ { room:"study", x:160, pose:"stand", doing:"站在暗房的顯影盤旁邊，一張一張看晾著的照片。" }, { room:"pdesk", x:80, pose:"read", doing:"抱著一疊剛到的調閱資料。" } ],
    ye:     [ null, { room:"pdesk", x:130, pose:"read", doing:"站在白板前面看卷宗，一張一張對齊。" } ]
  };
  EP19.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP19.rooms = {
    ge: [
      { id:"stairs", name:"一樓大門和樓梯", scene:"c19_stairs", details:[
        { id:"d19_notice", name:"公告欄", hot:[96,30,30,22], text:"「都更說明會　12 月 6 日」的海報上，有人用原子筆在「都更」兩個字上畫了一個叉。旁邊是管委會的公告：「樓梯燈已修好，請勿再拍打開關。」" },
        { id:"d19_gate", name:"大門", hot:[2,26,28,54], text:"老式的鐵門，要用鑰匙才開得了。門鎖是新換的，管委會去年統一換的——每戶發兩把。" },
        { id:"d19_cam", name:"門上的監視器", hot:[10,16,10,6], text:"管委會的監視器，只拍得到門口和樓梯的第一階。鏡頭上有一點蜘蛛網。" },
        { id:"d19_light", name:"樓梯燈", hot:[24,2,18,8], text:"樓梯燈的開關被拍到裂開了，用膠帶黏著。" } ] },
      { id:"living", name:"客廳", scene:"c19_living", opt:(ph) => ({ tv:true, ac:true, listen:false }), details:[
        { id:"d19_sofa", name:"沙發", hot:[140,56,52,22], text:"老沙發的扶手被磨得發亮。坐墊上放著一個黃色的靠枕，繡著「爸爸生日快樂」，是美君小時候做的。" },
        { id:"d19_ac", name:"冷氣", hot:[44,10,30,10], text:"冷氣開著，設定 26 度。遙控器放在冷氣下面的架子上，電池蓋用橡皮筋綁著。" },
        { id:"d19_tv", name:"電視", hot:[92,34,30,20], text:"電視還開著，聲音被員警轉小了。新聞台在播明天的天氣：「北部有雨。」" },
        { id:"d19_calendar", name:"牆上的月曆", hot:[160,20,20,26], text:"月曆上的 11 月 27 日，用鉛筆寫著「阿業」。12 月 1 日，用紅筆圈起來，寫著「美君　回診」。" } ] },
      { id:"bath", name:"浴室", scene:"c19_bath", opt:(ph) => ({ body:ph === 0 }), details:[
        { id:"d19_towel", name:"毛巾架", hot:[36,30,26,16], text:"一條毛巾摺得方方正正，掛在架子上。旁邊有一個空的掛鉤。" },
        { id:"d19_sink", name:"洗手台", hot:[82,26,18,26], text:"洗手台上一支牙刷、一條牙膏、一瓶刮鬍水。牙刷是乾的。" },
        { id:"d19_win", name:"小窗", hot:[140,18,26,16], text:"浴室的小窗開著一條縫，冷風一直灌進來。窗台上有一盆小小的薄荷，是乾的。" },
        { id:"d19_slip", name:"門口的拖鞋", hot:[2,90,16,8], text:"一雙藍色的塑膠拖鞋，整整齊齊地擺在浴室門外，鞋尖朝外——像是脫下來，準備等一下出來再穿。" } ] },
      { id:"study", name:"書房（暗房）", scene:"c19_study", opt:(ph) => ({ red:true }), details:[
        { id:"d19_enlarger", name:"放大機", hot:[116,28,16,32], text:"一台老式的放大機，鏡頭蓋上貼著膠帶：「不要碰——葛」。" },
        { id:"d19_prints", name:"晾著的照片", hot:[78,20,112,14], text:"一排月亮。每張照片的背面都寫著日期和「23:00」。" },
        { id:"d19_redlight", name:"紅燈", hot:[170,0,12,14], text:"暗房的安全燈。紅色的光照在牆上，所有的東西都變成同一個顏色。" } ] }
    ],
    xuhome: [ { id:"xroom", name:"許振業家的客廳", scene:"c19_xuhome", details:[
      { id:"d19_xtv", name:"舊電視", hot:[110,30,30,28], text:"一台映像管電視，上面放著一張全家福：許振業、他太太，還有一個綁馬尾的小女孩。" },
      { id:"d19_xtable", name:"茶几", hot:[60,62,50,12], text:"一個空的高粱瓶、一個杯子，和一瓶喝了一半的解酒液。" },
      { id:"d19_xwin", name:"窗戶", hot:[160,14,20,26], text:"窗戶外面是對面的老公寓。窗台上有一盆仙人掌，花盆是用底片罐做的。" } ] } ],
    office: [
      { id:"olobby", name:"一樓大廳", scene:"c19_olobby", opt:(ph) => ({ night:ph === 0 }), details:[
        { id:"d19_gate2", name:"刷卡閘門", hot:[62,60,32,20], text:"進出都要刷卡，閘門旁邊貼著：「請勿尾隨進出」。" },
        { id:"d19_screens", name:"監視器螢幕", hot:[156,48,16,10], text:"四格畫面：大門、電梯、B1、B2。B2 那一格，一直有一台灰色的車。" },
        { id:"d19_logo", name:"公司的招牌", hot:[54,30,50,14], text:"「宏軒智能　讓家聽你的話」。" } ] },
      { id:"ofloor", name:"辦公室", scene:"c19_ofloor", opt:(ph) => ({ night:ph === 0 }), details:[
        { id:"d19_desks", name:"其他人的座位", hot:[70,48,72,32], text:"桌上都是空的泡麵碗和能量飲料。有人在螢幕上貼了一張便利貼：「上線前不准請假」。" } ] },
      { id:"ob2", name:"B2 停車場", scene:"c19_ob2", details:[
        { id:"d19_b2cam", name:"B2 的監視器", hot:[160,6,20,6], text:"天花板上的燈管有一支一直在閃。監視器在柱子的另一邊，只拍得到車道。" } ] }
    ],
    police: [
      { id:"pdesk", name:"澄港市刑大", scene:"police", details:[
        { id:"d19_coffee", name:"你桌上的咖啡", hot:[60,62,10,8], text:"小吳幫你買的咖啡，杯子上寫著「學長　撐住」。旁邊還有一杯，寫著「許前輩」——他忘了拿過去。" } ] },
      { id:"interview", name:"偵訊室", scene:"c19_interview", details:[
        { id:"d19_mirror", name:"單面鏡", hot:[110,16,70,40], text:"鏡子的另一邊是葉晴。你看不到她，可是你知道她在。" } ] },
      { id:"wait", name:"等候區", scene:"c19_wait", details:[
        { id:"d19_vending", name:"販賣機", hot:[176,30,16,50], text:"販賣機的熱飲只剩下一種：罐裝玉米濃湯。" } ] }
    ],
    lab: [ { id:"lab", name:"鑑識中心", scene:"lab", details:[
      { id:"d19_headset", name:"耳機", hot:[140,20,20,14], text:"許知夏的耳機線上，纏著一條褪色的紅繩子。陳葵說，那是她小時候爸爸綁上去的。" } ] } ],
    morgue: [ { id:"mroom", name:"法醫室", scene:"m13_morgue", details:[
      { id:"d19_radio", name:"收音機", hot:[20,40,12,8], text:"收音機關著。老錢說：「葛仔不喜歡吵。」" } ] } ]
  };
  const PS = [["c19_living",{ tv:true, ac:true }],["police",{}]];
  EP19.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 監視器動畫（大樓門口） ---------- */
  const strip = L => { const o = Object.assign({}, L); delete o.hello; delete o.mood; return o; };
  const RAIN = { skin:"#e8c09a", hair:"#1e1a18", hairStyle:"short", hood:"#1e2a4a", top:"#1e2a4a", coat:"#1e2a4a", bottom:"#2a2f3a", shoes:"#1a1a1e" };
  EP19.looks = {
    xzC: strip(LOOK.xuzy), mjC: strip(LOOK.meijun), lfC: strip(LOOK.lifan), geC: { age:"old", skin:"#d8b08a", hair:"#c8c8c0", hairStyle:"short", top:"#6a6a6e", bottom:"#3a3a40" },
    rcBack: Object.assign({}, RAIN, { back:true }), rcMan: Object.assign({}, RAIN, { mask:"#1e2a4a" })
  };
  const STAIRS19 = [[140,94,186,58]];
  const ANIM = {
    cctv19_door: { scene:"c19_stairs", opt:{ drops:false }, stairs:STAIRS19, cam:"FUAN 12 GATE", date:"2026-11-27", beats:[
      { t:"19:02:00", d:6, cap:"19:02，許振業提著一個塑膠袋和一瓶酒，按電鈴，門開了。他走上樓梯。", m:{ xzC:[186,58,"hold@bag/#f4f4f0",1,-10,96,[[140,94]]] }, out:["xzC"] },
      { t:"21:10:00", d:3, cap:"21:10，外面開始下雨。", st:{ rain:true } },
      { t:"21:31:00", d:4, cap:"21:31，許振業扶著牆，慢慢走下樓梯，", st:{ rain:true }, m:{ xzC:[134,96,"stand",-1,186,58,[[140,94]]] } },
      { t:"21:31:10", d:3, join:true, cap:"在最後一階踩空，坐在地上。", st:{ rain:true }, m:{ xzC:[130,97,["stumble","sit","sit"],-1] } },
      { t:"21:31:30", d:4, join:true, cap:"他自己爬起來，走出大門。", st:{ rain:true }, m:{ xzC:[-14,96,"stand",-1,130,96] }, out:["xzC"] },
      { t:"21:36:00", d:5, cap:"21:36，一個穿深藍色雨衣、戴著雨衣帽子的男人，撐著一把黑傘走到門口，傘壓得很低，拍不到臉。他沒有按電鈴，用鑰匙開門。", st:{ rain:true, umb:[-6,24], umbLow:true }, m:{ rcBack:[24,96,"reach",-1,-6,96] } },
      { t:"21:36:20", d:5, join:true, cap:"他收起傘，背對著鏡頭走上樓梯。", st:{ rain:true }, m:{ rcBack:[186,58,"stand",1,24,96,[[140,94]]] }, out:["rcBack"] },
      { t:"21:59:00", d:5, cap:"21:59，同一個人從樓梯下來，帽子拉得很低。", st:{ rain:true }, m:{ rcMan:[30,96,"stand",-1,186,58,[[140,94]]] } },
      { t:"21:59:20", d:4, join:true, cap:"他在門口撐開黑傘，走出大門。", st:{ rain:true, umb:[30,-14], umbLow:true }, m:{ rcMan:[-14,96,"stand",-1,30,96] }, out:["rcMan"] },
      { t:"22:40:00", d:3, cap:"22:40，雨停了。" },
      { t:"23:48:00", d:5, cap:"23:48，葛美君用鑰匙開門，跑上樓。", m:{ mjC:[186,58,"stand",1,-10,96,[[140,94]]] }, out:["mjC"] }
    ] }
  };
  Object.values(ANIM).forEach(A => { if (A.beats.some(b => b.st)) A.opt = Object.assign({}, A.opt || {}, { seq:A.beats.map(b => Object.assign({}, A.opt || {}, b.st || {})), ds:jds(A.beats) }); });
  [...EP19.cctv, ...EP19.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案 ---------- */
  const RB = [
    { t:"21:18:00", d:5, cap:"11 月 27 日 21:18，鄭立凡跟警衛說要去買晚餐。他走到地下室，打開自己的車門，開車出去。", scene:"c19_ob2", opt:{ coat:false }, m:{ lfC:[124,94,"reach",1,40,94] }, out:["lfC"] },
    { t:"21:36:00", d:5, cap:"21:36，他穿著深藍色的雨衣、撐著黑傘，用自己的鑰匙打開岳父家樓下的門。", scene:"c19_stairs", opt:{ rain:true, drops:false, umb:[-6,24], umbLow:true }, stairs:STAIRS19, m:{ rcBack:[24,96,"reach",-1,-6,96] } },
    { t:"21:45:00", d:5, cap:"21:45，在浴室門口，他抓住岳父的兩隻手臂，用力一推。", scene:"c19_bath", opt:{}, m:{ geC:[110,94,"handsup",-1,90,94], lfC:[76,94,"push",1,40,94] } },
    { t:"21:45:10", d:4, join:true, cap:"岳父往後倒，後腦撞上浴缸的邊緣。樓上的林太太聽到「砰」一聲。", scene:"c19_bath", opt:{}, m:{ geC:[120,96,"fall",-1,110,94], lfC:[76,94,"stand",1] } },
    { t:"21:47:00", d:5, cap:"21:47，他打開熱水器，放了六分鐘的熱水，把拖鞋擺在門口——佈置成洗澡滑倒。", scene:"c19_bath", opt:{}, m:{ geC:[120,96,"lie",-1], lfC:[170,94,"reach",1,76,94] } },
    { t:"21:58:00", d:5, cap:"21:58，他站在客廳，用自己的手機在 App 設了一個排程：23:00，音箱播放「提醒.m4a」。", scene:"c19_living", opt:{ light:true, tv:false }, m:{ lfC:[116,94,"phone",-1,170,94] } },
    { t:"22:36:00", d:5, cap:"22:36，他刷卡回到公司，跟警衛說：「雨好大。」", scene:"c19_olobby", opt:{ night:true }, m:{ lfC:[90,94,"stand",-1,180,94] }, out:["lfC"] },
    { t:"23:00:00", d:5, cap:"23:00，沒有人的客廳裡，音箱用岳父的聲音說：「開燈。」「開冷氣。」「開電視。」", scene:"c19_living", opt:{ light:true, tv:true, ac:true, listen:true, phone:false } },
    { t:"23:05:00", d:5, cap:"23:05，他在公司樓下抽菸，把排程刪掉。", scene:"c19_ob2", opt:{}, m:{ lfC:[30,94,"phone",1] } },
    { t:"23:50:00", d:5, cap:"23:50，葛美君打開浴室的門。", scene:"c19_bath", opt:{ body:false }, m:{ geC:[120,96,"lie",-1], mjC:[44,94,"cry",1,8,94] } }
  ];
  EP19.court = {
    title: "刑大偵訊室・11 月 28 日 17:20", scene: "c19_interview",
    who: ph => ["lifan","meijun","xuzy","peng"],
    open: ph => "17:20，偵訊室裡只開了一盞燈。鄭立凡坐在桌子前面，眼鏡放在桌上。單面鏡的另一邊，葛美君握著自己的備用鑰匙，許振業站在她後面。",
    kindLine: {
      accident: "葛振民是洗澡的時候滑倒的。",
      murder: "葛振民不是滑倒的。有人推倒了他，再把浴室佈置成意外。"
    },
    murmur: [ "（鄭立凡把眼鏡戴上，又拿下來。）", "（單面鏡的另一邊，傳來一聲很輕的啜泣。）", "（許振業的手放在葛美君的肩膀上。）" ],
    confess: {
      lifan: [ "六百萬。下個月再不補，我就完了。美君什麼都不知道。", "我只是想跟他談。他說：『你等我死了再來。』……我抓住他，我只是想叫他聽我說。", "那個音檔……我剪了四次。第四次的時候，我聽到他在影片裡笑，我差點就刪掉了。……可是我沒有。" ]
    },
    cornered: { lifan: "那是、那是提醒他吃藥的……" },
    deny: {
      meijun: "那是我爸。你們在說什麼？",
      xuzy: "我九點半就走了。……我應該留下來的。",
      peng: "我整晚都在餐廳，發票都在你們手上。"
    },
    replayText: "11 月 27 日 21:18，宏軒智能的地下室。鄭立凡跟警衛說，他要去買晚餐——",
    replay: { scene:"c19_ob2", opt:{}, clean:true, cam:"經過重現", date:"2026-11-27", beats:RB },
    get endGood(){
      const told = typeof ARC !== "undefined" && ARC.has && ARC.has("xuzy_slip");
      return "17:30，葉晴在聲押書上簽了名。\n葛美君沒有看她先生一眼。她只問了一件事：「我可以拿回爸爸的相機嗎？」\n那天晚上 23:00，她站在爸爸家的窗邊，用那台相機拍了一張月亮。" + (told ? "\n樓下的巷子裡，許振業一個人站在路燈下面，抬頭看著四樓的窗戶，很久都沒有走。" : "");
    },
    endBad: "17:30，葉晴把卷宗闔上：「不夠。」\n鄭立凡被請回家。轄區的報告寫著：洗澡滑倒，意外。\n三個月後，宏城建設在福安街掛上了紅布條：「都更　全體同意」。"
  };
  // 幕後：沒問到說漏的那一題、沒看到底片櫃的玩家，不會聽到相關的對白
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[19] && ARC_INTER[19].after){
    const A = ARC_INTER[19].after, need = t => /沈組長|停下腳步|我會去問他|說了什麼/.test(t) ? "arc:xuzy_slip" : /2011|我也看到了/.test(t) ? "arc:photo_box_2011" : null;
    EP19.after = Object.assign({}, A, { scene:"c19_street", opt:{}, lines:(A.lines || []).map(l => { const w = need(l.text || ""); return w && !l.when ? Object.assign({}, l, { when:w }) : l; }) });
  }

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP19.outScenes = [];
  EP19.fac = { ge:["#a8a090","#5a4a3a"], police:["#cfcabb","#3f5a7a"], office:["#e8ecf0","#3a8ac8"], xuhome:["#c8bca4","#6a4a2a"], lab:["#e2e8e8","#3a7a8a"], morgue:["#d8e0e0","#5a7a8a"] };
  EP19.setting = { ge:"town", police:"city", office:"city", xuhome:"town", lab:"city", morgue:"city" };
  const SKY19 = [ ["#0a0f1c","#24304a","#2a3040","#323a4a",0,0], ["#9aaabb","#d8dce0","#4a5a66","#56646e",0,0] ];
  EP19.worldSky = ph => SKY19[Math.min(ph || 0, SKY19.length - 1)];
  EP19.roomDesc = {
    stairs:"老公寓的一樓。鐵門、信箱、往上的樓梯。", living:"葛家的客廳。電視和冷氣都還開著。", bath:"浴室。", study:"葛振民的書房，也是他的暗房。",
    xroom:"許振業家的客廳。滿屋子的酒味。",
    olobby:"宏軒智能的一樓大廳。", ofloor:"工程部的辦公室。", ob2:"地下二樓的停車場。",
    pdesk:"澄港市刑大。", interview:"偵訊室。", wait:"刑大的等候區。", lab:"鑑識中心。", mroom:"法醫室。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police" };
  EP19.world = {};
  EP19.locations.forEach(l => { EP19.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP19.world.ge, {
    extras: [
      { id:"cop19", name:"轄區員警", phase:0, until:0, x:RX(0) + 74, L:COP, pose:"stand", facing:1, lines:[
        "我們 00:08 到的。浴室的燈開著，人倒在浴缸旁邊。", "看起來就是洗澡滑倒。……老人家，常有的事。可是他女兒一直說不對。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長，死者葛振民，68 歲，退休的警察攝影師。轄區說是洗澡滑倒。", "小吳"),
      say("wu", "許前輩……她說她不能來。她爸昨晚在這裡喝酒。所以來的是陳葵。", "小吳"),
      say("you", "……上去看看。", "你"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  EP19.mapPos = { ge:[60,70,"u"], police:[170,40,"r"], office:[200,96,"d"], xuhome:[100,100,"d"], lab:[196,62,"r"], morgue:[214,80,"r"] };
  EP19.mapRoads = [["ge","police"],["ge","xuhome"],["ge","office"],["police","lab"],["lab","morgue"],["police","office"]];
  EP19.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#24283a"); dither(0, 0, 240, 135, "#2c3044", 3);
    for (let x = 20; x < 230; x += 8) for (let y = 14; y < 124; y += 7){ R(x, y, 6, 5, "#363a4c"); if ((x * 3 + y) % 7 === 0) R(x + 1, y + 1, 2, 2, "#e8d890"); }
    R(0, 84, 240, 5, "#4a4e5e"); R(130, 0, 5, 135, "#4a4e5e");
    R(54, 62, 12, 8, "#a8a090"); R(58, 64, 4, 2, (Math.floor(t * 2) % 2) ? "#e8d890" : "#5a5a5a");   // 老公寓四樓的燈
    R(186, 90, 18, 10, "#e8ecf0"); R(188, 92, 14, 2, "#3a8ac8");   // 科技園區
  };
})();
