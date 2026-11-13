/* =========================================================
   第 20 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP20.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i] = beatAt(o.t || 0, o.ds); return (o.seq || [])[i] || {}; };
  // 夜市的天空和一串燈泡
  const nightSky = () => { R(0, 0, W, 30, "#0c1022"); for (let k = 0; k < 7; k++) P((k * 41 + 9) % W, 3 + (k * 7) % 18, "#8a8aa0"); };
  const bulbs = (y) => { for (let x = 0; x < W; x += 2) P(x, y + Math.round(Math.sin(x / 14) * 2), "#3a3a3a"); for (let x = 6; x < W; x += 16) { const yy = y + Math.round(Math.sin(x / 14) * 2) + 1; R(x, yy, 2, 2, "#ffe08a"); dither(x - 3, yy - 2, 8, 7, "#ffe08a22", 2); } };
  const tile = (x, y, w, h, c, l) => { R(x, y, w, h, c); for (let yy = y; yy < y + h; yy += 8) R(x, yy, w, 1, l); for (let xx = x; xx < x + w; xx += 8) R(xx, y, 1, h, l); };
  const bottles = (x, y, mid) => { for (let k = 0; k < 3; k++) { const bx = x + k * 7; R(bx, y + 1, 5, 8, "#e8f0f4"); R(bx + 1, y + (k === 1 && mid ? 5 : 2), 3, k === 1 && mid ? 4 : 7, "#d8a040"); R(bx + 1, y - 1, 3, 2, "#e83a3a"); } };

  /* ---------- 澄港觀光夜市 ---------- */
  // 杏仁豆腐攤（正面）：招牌、大鍋、碗、後面的小架子和三瓶糖水、塑膠簾、客人的小桌子
  SC.c20_tofu = (o) => { o = Object.assign({}, o, stOf(o));
    const day = !!o.day;
    if (day) { R(0, 0, W, 30, "#b8c8d8"); } else nightSky();
    R(0, 24, W, 56, day ? "#6a6058" : "#2a2430");
    if (!day) bulbs(26);
    // 攤子
    R(36, 22, 112, 4, "#c8302a"); R(36, 8, 112, 16, "#c8302a"); R(38, 10, 108, 12, "#d8403a"); txt("老街杏仁豆腐", 58, 19, "#f8f4ec", "8px sans-serif");
    R(150, 40, 10, 40, "#8a6a4a"); R(151, 42, 8, 6, "#e8d8b0");   // 舊招牌靠在旁邊
    R(40, 26, 104, 30, day ? "#8a8a84" : "#4a4250"); dither(40, 26, 104, 30, "#e8f0f422", 3);   // 塑膠簾（後面）
    R(118, 36, 28, 2, "#8a6a4a"); bottles(122, 38, true);   // 後面的小架子
    R(36, 56, 112, 4, "#d8d0c0"); R(38, 60, 108, 20, "#b8a888"); R(38, 60, 108, 2, "#e8e0d0");
    R(48, 46, 24, 12, "#a8a8b0"); R(46, 44, 28, 3, "#c8c8d0"); R(56, 41, 8, 3, "#8a8a92");   // 大鍋
    if (o.seal) { R(50, 48, 20, 10, "#f4f4f0"); R(51, 49, 18, 2, "#c83a2a"); R(52, 52, 14, 1, "#3a3a3a"); R(52, 54, 10, 1, "#3a3a3a"); R(46, 44, 28, 2, "#f4f4f0"); }
    for (let k = 0; k < 4; k++) { R(80 + k * 9, 52, 7, 4, "#f4f4f0"); R(81 + k * 9, 52, 5, 2, "#f8f4e8"); }   // 碗
    R(10, 62, 22, 18, "#3a7ac8"); R(10, 60, 22, 3, "#5a9ae8"); R(12, 64, 18, 1, "#2a5aa8");   // 冰桶
    // 客人的小桌子
    for (let k = 0; k < 2; k++) { const x = 152 + k * 20; R(x, 70, 16, 3, "#c83a2a"); R(x + 7, 73, 2, 9, "#8a2a1a"); }
    if (o.bowls !== false) { R(154, 66, 6, 4, "#f4f4f0"); R(155, 67, 4, 1, "#d8a040"); R(166, 66, 6, 4, "#f4f4f0"); R(174, 66, 6, 4, "#f4f4f0"); R(175, 67, 4, 1, "#d8a040"); R(182, 66, 6, 4, "#f4f4f0"); R(178, 80, 4, 1, "#c8c8c8"); }
    floor(80, day ? "#8a8478" : "#3a3634", day ? "#7a7468" : "#34302e"); for (let x = 0; x < W; x += 24) R(x, 80, 1, 28, day ? "#6a645a" : "#2a2624");
    if (o.tape) { for (let x = 0; x < W; x += 8) R(x, 84, 5, 2, (x / 8) % 2 ? "#e8c040" : "#2a2a2a"); }
  };

  // 財記滷味（正面）：玻璃櫃、滷味、手套盒、下面的塑膠箱
  SC.c20_lu = (o) => {
    const day = !!o.day;
    if (day) { R(0, 0, W, 30, "#b8c8d8"); } else nightSky();
    R(0, 24, W, 56, day ? "#6a6058" : "#2a2430");
    if (!day) bulbs(26);
    R(28, 10, 108, 14, "#2a5a3a"); R(30, 12, 104, 10, "#3a7a4a"); txt("財記滷味", 62, 20, "#f8f4ec", "8px sans-serif");
    R(30, 26, 104, 22, day ? "#8a8a84" : "#4a4250");
    R(30, 46, 104, 3, "#c8c8c4"); R(34, 48, 60, 10, "#a8c8d8"); dither(34, 48, 60, 10, "#ffffff33", 3);   // 玻璃櫃
    for (let k = 0; k < 7; k++) R(37 + k * 8, 51, 6, 4, ["#8a5a2a","#3a5a2a","#5a2a2a","#a87a3a","#7a4a2a","#3a5a2a","#8a5a2a"][k]);
    R(96, 50, 34, 8, "#f4f4f0"); R(98, 52, 14, 4, "#c8a060"); R(104, 54, 12, 4, "#e8c040"); R(105, 55, 10, 1, "#f4f0c0");   // 砧板、手套盒
    R(30, 58, 104, 22, "#7a6a5a"); R(30, 58, 104, 2, "#a89a8a");
    R(60, 70, 30, 10, "#3a6ab8"); R(60, 70, 30, 2, "#5a8ad8");   // 塑膠箱
    R(146, 30, 40, 50, "#5a4a3a"); R(148, 32, 36, 18, "#c8a040"); txt("烤玉米", 152, 44, "#3a2a1a", "7px sans-serif"); for (let k = 0; k < 4; k++) R(150 + k * 8, 56, 5, 10, "#e8c040");   // 對面的烤玉米
    floor(80, day ? "#8a8478" : "#3a3634", day ? "#7a7468" : "#34302e"); for (let x = 0; x < W; x += 24) R(x, 80, 1, 28, day ? "#6a645a" : "#2a2624");
  };

  // 後巷：攤子的後面（左：杏仁豆腐、右：財記滷味）、中間的大垃圾桶、巷口的冰店、電線桿上的監視器
  SC.c20_alley = (o) => { o = Object.assign({}, o, stOf(o));
    nightSky();
    R(0, 24, 150, 62, "#3a3440"); for (let y = 30; y < 86; y += 7) R(0, y, 150, 1, "#342e3a");
    // 杏仁豆腐攤的後面
    R(20, 34, 48, 52, "#5a4a5a"); R(24, 38, 40, 32, "#8a8a9a"); dither(24, 38, 40, 32, "#e8f0f433", 3); R(24, 68, 40, 2, "#3a3a44");
    bottles(36, 50, !!o.half); R(32, 48, 28, 2, "#8a6a4a");
    // 財記滷味的後面
    R(118, 34, 30, 52, "#4a5a4a"); R(122, 38, 22, 32, "#6a7a6a"); R(122, 68, 22, 2, "#2a3a2a");
    // 垃圾桶
    R(96, 64, 20, 20, "#2a5aa8"); R(94, 62, 24, 3, "#3a6ab8"); R(98, 68, 16, 1, "#1a4a98"); P(100, 62, "#e8e0c0");
    // 冰店
    R(150, 24, 42, 62, "#5a6a7a"); R(152, 36, 22, 50, "#2a2a30"); R(154, 58, 22, 24, "#4a8ac8"); R(154, 58, 22, 2, "#6aaae8"); txt("冰", 178, 34, "#f4f4f0", "8px sans-serif");
    // 電線桿和監視器
    R(186, 6, 3, 80, "#5a5a5e"); R(178, 12, 10, 5, "#2a2a2e"); P(179, 13, "#e83a3a");
    floor(86, "#2a2a2e", "#24242a"); R(0, 96, W, 2, "#1a1a1e"); for (let x = 4; x < W; x += 12) R(x, 96, 6, 2, "#2a2a30");
    if (o.lit) dither(20, 24, 130, 62, "#ffe08a11", 3);
  };

  // 管委會辦公室：櫃子、攤位圖、監視器螢幕
  SC.c20_office = (o) => {
    wall(80, "#d8d0c0", false); R(0, 74, W, 6, "#b8b0a0");
    R(18, 30, 26, 46, "#7a6a5a"); for (let k = 0; k < 4; k++) { R(20, 32 + k * 11, 22, 9, "#8a7a6a"); R(29, 36 + k * 11, 4, 1, "#c8a040"); }
    R(60, 18, 44, 26, "#f4f0e0"); R(60, 18, 44, 1, "#8a8a8e"); for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) R(62 + c * 7, 21 + r * 7, 6, 5, (r === 2 && c === 5) ? "#e8708a" : (r === 2 && c === 4) ? "#7ac87a" : "#e8e4d8"); R(98, 33, 5, 1, "#e83a3a");
    R(110, 58, 60, 4, "#8a6a4a"); R(112, 62, 56, 18, "#7a5a3a");
    R(120, 44, 20, 14, "#2a2a2e"); R(121, 45, 18, 10, "#3a4a3a"); R(124, 47, 6, 4, "#5a6a5a"); R(128, 58, 4, 2, "#2a2a2e");
    R(146, 54, 8, 4, "#f4f4f0"); R(158, 52, 6, 6, "#c8a060");
    R(176, 22, 14, 30, "#1a2030"); R(182, 22, 1, 30, "#5a5a5e");
    floor(80, "#9a9488", "#8a8478");
  };

  /* ---------- 澄港醫院急診室 ---------- */
  SC.c20_er = (o) => {
    wall(80, "#e8f0ec", false); R(0, 74, W, 6, "#c8d8d0"); R(0, 40, W, 2, "#8ac8a8");
    R(10, 20, 70, 50, "#d8e8f0"); for (let x = 12; x < 78; x += 4) R(x, 20, 1, 50, "#c0d4e0"); R(10, 18, 70, 2, "#a8b8c8");   // 布簾
    R(38, 60, 18, 3, "#5a8a9a"); R(40, 63, 2, 15, "#4a6a7a"); R(52, 63, 2, 15, "#4a6a7a"); R(40, 62, 14, 8, "#c8a080"); R(42, 63, 10, 4, "#a88060");   // 椅子和包包
    R(100, 50, 8, 30, "#a8b0b8"); R(98, 48, 12, 3, "#c8d0d8");
    R(124, 58, 60, 4, "#c8d0d8"); R(126, 62, 56, 18, "#e8eef0"); R(140, 50, 18, 10, "#2a2a2e"); R(141, 51, 16, 7, "#3a7ac8"); R(162, 52, 10, 6, "#f4f4f0");   // 護理站
    R(150, 12, 30, 18, "#1a1a1e"); R(151, 13, 28, 14, "#3a5a8a"); R(151, 24, 28, 3, "#c83a2a");   // 電視
    R(86, 8, 22, 8, "#c83a2a"); txt("急診", 89, 15, "#f4f4f0", "6px sans-serif");
    floor(80, "#d8e0e0", "#c8d0d0");
  };

  /* ---------- 郭家 ---------- */
  // 屋外：舊農藥行的鐵門、二樓的陽台、對面的檳榔攤
  SC.c20_gstreet = (o) => {
    R(0, 0, W, 30, "#a8c0d8");
    R(10, 4, 90, 82, "#c8b8a0"); R(10, 4, 90, 2, "#a89880");
    R(14, 8, 82, 16, "#8a8a84"); for (let x = 16; x < 94; x += 4) R(x, 8, 1, 16, "#6a6a64"); R(14, 22, 82, 2, "#5a5a54");   // 二樓陽台
    for (let k = 0; k < 4; k++) R(20 + k * 18, 10, 6, 8, "#5a8a3a");
    R(20, 26, 60, 6, "#3a6a3a"); txt("明德農藥", 30, 31, "#e8e0c0", "5px sans-serif");
    R(20, 32, 60, 48, "#7a7e84"); for (let y = 34; y < 60; y += 3) R(20, y, 60, 1, "#5a5e64"); R(20, 60, 60, 20, "#2a2a30");   // 鐵門（半拉）
    R(84, 40, 12, 40, "#6a4a2a"); P(86, 60, "#c8a040");
    R(140, 40, 50, 46, "#3a7a3a"); R(140, 36, 50, 5, "#e8e040"); txt("檳榔", 156, 40, "#c83a2a", "5px sans-serif"); R(146, 60, 38, 18, "#a8c8a8"); dither(146, 60, 38, 18, "#ffffff33", 3);
    R(116, 30, 2, 50, "#8a8a8e"); R(110, 30, 14, 8, "#3a7ac8"); txt("22", 113, 37, "#f4f4f0", "5px sans-serif");   // 公車站牌
    floor(86, "#8a8a86", "#7a7a76"); R(0, 86, W, 2, "#6a6a66");
  };
  // 一樓：關掉的農藥行
  SC.c20_gshop = (o) => {
    wall(80, "#a8a090", false); R(0, 74, W, 6, "#8a8270");
    R(10, 20, 60, 56, "#6a5a4a"); for (let r = 0; r < 4; r++) { R(12, 30 + r * 12, 56, 2, "#5a4a3a"); for (let k = 0; k < 6; k++) R(14 + k * 9, 23 + r * 12, 6, 7, ["#5a8a3a","#c8a040","#3a6ab8","#8a8a8a","#c83a2a","#6a8a6a"][(k + r) % 6]); } R(50, 47, 6, 7, "#6a5a4a"); dither(10, 20, 60, 56, "#c8c0b044", 3);
    R(14, 16, 30, 4, "#f4f0e0");
    R(90, 56, 70, 4, "#7a6a5a"); R(92, 60, 66, 20, "#6a5a4a"); R(100, 46, 14, 10, "#8a8a84");   // 櫃台、舊磅秤
    R(132, 76, 8, 8, "#3aa8a0"); R(134, 74, 4, 2, "#e8e8e4"); dither(132, 78, 8, 6, "#c8c0b066", 2);   // 地上的空瓶
    R(168, 30, 20, 50, "#3a3a40"); for (let y = 32; y < 80; y += 3) R(168, y, 20, 1, "#2a2a30");   // 鐵門內側
    floor(80, "#7a7468", "#6a6458");
  };
  // 廚房：流理台、果汁機、碗架、冰箱、牆上的紙
  SC.c20_kitchen = (o) => {
    tile(0, 0, W, 50, "#e8e4d8", "#d8d4c8"); wall(80, "#e0d8c8", false); tile(0, 0, W, 50, "#e8e4d8", "#d8d4c8");
    R(20, 64, 120, 4, "#c8c8c4"); R(20, 68, 120, 12, "#a87a5a"); for (let k = 0; k < 4; k++) R(24 + k * 30, 70, 26, 8, "#b88a6a");
    R(60, 50, 12, 14, "#d8dce0"); R(61, 52, 10, 8, "#c8e8c8"); R(62, 60, 8, 4, "#3a3a3e"); R(64, 64, 4, 1, "#3a3a3e");   // 果汁機
    R(52, 56, 6, 4, "#e8f0f4");   // 泡刀片的碗
    R(92, 52, 26, 3, "#c8c8c4"); for (let k = 0; k < 6; k++) R(94 + k * 4, 44, 1, 8, "#c8c8c4"); R(100, 56, 10, 8, "#f4f0f0"); R(102, 58, 6, 2, "#e8708a");   // 碗架和馬克杯
    R(150, 24, 30, 56, "#e8ecec"); R(152, 26, 26, 22, "#f4f8f8"); R(152, 50, 26, 28, "#f4f8f8"); R(174, 40, 2, 6, "#a8a8a8"); R(174, 56, 2, 8, "#a8a8a8");   // 冰箱
    R(80, 22, 16, 18, "#f8f4e8"); R(82, 25, 12, 1, "#3a5a3a"); R(82, 28, 10, 1, "#3a3a3a"); R(82, 31, 8, 1, "#3a3a3a");   // 牆上的紙
    R(20, 20, 40, 2, "#8a8a8a"); R(24, 22, 6, 8, "#c8a060"); R(36, 22, 6, 8, "#8a6a4a");
    floor(80, "#c8c0b0", "#b8b0a0");
  };
  // 臥室：床、抽屜櫃、書桌和資料夾、結婚照
  SC.c20_bed = (o) => {
    wall(80, "#d8d0e0", false); R(0, 74, W, 6, "#b8b0c0");
    R(30, 56, 36, 24, "#8a6a4a"); for (let k = 0; k < 3; k++) { R(32, 58 + k * 7, 32, 5, "#9a7a5a"); R(46, 60 + k * 7, 4, 1, "#c8a040"); }   // 抽屜櫃
    R(90, 22, 18, 14, "#c8a040"); R(91, 23, 16, 12, "#e8e0d0"); R(94, 25, 4, 8, "#f4f4f0"); R(100, 25, 4, 8, "#2a2a30"); R(92, 27, 15, 1, "#a8a8a8");   // 結婚照（裂痕）
    R(76, 60, 60, 8, "#e8e0f0"); R(76, 66, 60, 14, "#a88ac8"); R(76, 56, 12, 8, "#f4f4f0"); R(74, 52, 4, 28, "#6a5a4a");   // 床
    R(140, 58, 44, 4, "#8a6a4a"); R(142, 62, 4, 18, "#6a4a2a"); R(178, 62, 4, 18, "#6a4a2a"); R(150, 56, 18, 3, "#3a6ab8"); R(160, 46, 14, 10, "#f4f0c0");   // 書桌、資料夾、檯燈
    R(150, 14, 26, 24, "#c8d8e8"); R(162, 14, 1, 24, "#a8a8b0");
    floor(80, "#a8988a", "#98887a");
  };

  /* ---------- 幕後：何沛恩被翻亂的租屋處 ---------- */
  SC.c20_apart = (o) => {
    wall(80, "#c8c0b0", false); R(0, 74, W, 6, "#a8a090");
    R(14, 30, 30, 50, "#7a6a5a"); for (let k = 0; k < 4; k++) R(16, 32 + k * 12, 26, 10, "#5a4a3a"); R(44, 62, 14, 8, "#7a6a5a");   // 抽屜都被拉出來
    R(70, 52, 50, 4, "#8a7a6a"); R(72, 56, 2, 24, "#6a5a4a"); R(116, 56, 2, 24, "#6a5a4a"); R(80, 50, 20, 2, "#3a3a3e");   // 空的書桌（筆電不見）
    R(130, 20, 30, 24, "#1a2030"); R(145, 20, 1, 24, "#5a5a5e");
    R(166, 40, 20, 40, "#5a4a3a"); R(168, 44, 16, 12, "#2a2a30");
    R(126, 46, 10, 6, "#3a3a3e"); R(128, 47, 6, 3, "#c83a2a");   // 被翻倒的相機包
    floor(80, "#8a7a6a", "#7a6a5a");
    for (let k = 0; k < 14; k++) R(20 + (k * 29) % 160, 84 + (k * 7) % 18, 8, 5, k % 3 ? "#f4f4f0" : "#e8e0c8");   // 地上的紙
    R(44, 64, 16, 6, "#7a6a5a"); R(46, 66, 12, 3, "#5a4a3a");   // 掉在地上的抽屜
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    caifu:  { age:"old", skin:"#c89a70", hair:"#3a3430", hairStyle:"short", top:"#f4f4f0", apron:"#3a7a4a", bottom:"#3a3a40", gloves:"#e8c040", mood:"worried", hello:"警察先生，要不要吃點滷味？……不收錢。" },
    aqin:   { age:"old", skin:"#e8c0a0", hair:"#8a8a84", hairStyle:"bun", top:"#c8a0b8", apron:"#f4f0e0", bottom:"#3a3a44", mood:"sad", hello:"三十年……三十年……" },
    yang:   { age:"old", skin:"#d8a880", hair:"#5a5a56", hairStyle:"balding", top:"#c83a2a", bottom:"#3a3a40", hello:"這種事，夜市幾十年來第一次。" },
    akai:   { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#3a3a40", bottom:"#3a4a6a", hat:"cap", capColor:"#1a1a1e", hello:"我那天在台中！你們可以去查！" },
    guo:    { age:"old", skin:"#d8a880", hair:"#3a3430", hairStyle:"slick", top:"#e8e4d8", coat:"#5a4a3a", bottom:"#3a3a40", mood:"worried", hello:"你們一定要抓到那個人！" },
    nurse:  { skin:"#f0d0b4", hair:"#2a2220", hairStyle:"pony", top:"#8ac8b8", bottom:"#8ac8b8", hello:"請不要在走廊大聲講話。" },
    azhu:   { skin:"#d8a880", hair:"#3a2a20", hairStyle:"bob", top:"#e8708a", bottom:"#3a3a44", hello:"要買檳榔還是要問秀蘭姐的事？" },
    xiang:  { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e8c040", apron:"#5a4a3a", bottom:"#3a4a5a", hello:"學長！你也來吃夜市？" },
    he:     { hello:"……你們也來了。" },
    kui:    { hello:"沈警官，碗、湯匙、瓶子，我全部都編號了！" },
    xu:     { hello:"兩份圖譜，你自己看。" },
    qian:   { hello:"三十年的老店……" },
    wu:     { hello:"學長，我的大腸包小腸……" },
    ye:     { hello:"17:30，兩個答案。" }
  };
  ["he","kui","xu","qian","wu","ye"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.he.top) Object.assign(LOOK.he, { skin:"#e0b48c", hair:"#3a2a20", hairStyle:"short", top:"#7a8a5a", bottom:"#3a4a6a", hat:"cap", capColor:"#2a3a5a" });
  if (!LOOK.kui.top) Object.assign(LOOK.kui, { skin:"#f0d0b4", hair:"#5a3a2a", hairStyle:"bob", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050" });
  if (!LOOK.xu.top) Object.assign(LOOK.xu, { skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" });
  if (!LOOK.wu.top) Object.assign(LOOK.wu, { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050", glasses:true });
  if (!LOOK.qian.top) Object.assign(LOOK.qian, { age:"old", skin:"#e0b48c", hair:"#b8b8b0", hairStyle:"balding", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#2a2a30", glasses:true });
  if (!LOOK.ye.top) Object.assign(LOOK.ye, { skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"pony", top:"#f4f4f0", coat:"#6a6e74", bottom:"#6a6e74", skirt:true });
  const DAILY = {
    caifu:  [ { room:"lu", x:120, pose:"stand", doing:"站在滷味攤後面，戴著黃色手套，一直在擦已經很乾淨的砧板。" }, { room:"lu", x:120, pose:"stand", doing:"在攤子後面切滷味，切得很慢，一直往隔壁看。" } ],
    aqin:   [ { room:"tofu", x:96, pose:"cry", doing:"坐在攤子後面的板凳上，手上還拿著湯杓。" }, { room:"tofu", x:96, pose:"stand", doing:"站在被封起來的攤子前面，一直摸著鍋蓋上的封條。" } ],
    yang:   [ { room:"office", x:150, pose:"phone", doing:"在辦公室講電話，一直跟記者說「無可奉告」。" }, { room:"office", x:150, pose:"read", doing:"在辦公室翻攤商的名冊。" } ],
    akai:   [ null, { room:"pdesk", x:40, pose:"sit", doing:"坐在刑大的長椅上，帽子拿在手上，一直在滑手機裡的票。" } ],
    guo:    [ null, { room:"er", x:110, pose:"phone", doing:"站在急診室的走廊上講電話，聲音很大。" } ],
    nurse:  [ null, { room:"er", x:170, pose:"write", doing:"在護理站寫紀錄，眼睛很紅。" } ],
    azhu:   [ null, { room:"gstreet", x:166, pose:"stand", doing:"站在檳榔攤裡面，一邊包檳榔一邊看著對面郭家的門。" } ],
    he:     [ { room:"tofu", x:20, pose:"cam", doing:"站在封鎖線外面，相機舉著，可是一直沒有按快門。" }, { room:"er", x:20, pose:"stand", doing:"靠在急診室門口的柱子上，帽子壓得很低。" } ],
    xiang:  [ { room:"lu", x:168, pose:"stand", doing:"站在對面的烤玉米攤，手上的玉米一直在翻。" } ],
    kui:    [ { room:"alley", x:60, pose:"kneel", doing:"蹲在後巷，一個一個編號。" }, { x:150, pose:"read", doing:"在鑑識中心整理夜市的證物袋。" } ],
    xu:     [ null, { x:50, pose:"read", doing:"盯著螢幕上的兩條圖譜，很久都沒有說話。" } ],
    qian:   [ null, { room:"mroom", x:90, pose:"stand", doing:"站在解剖台旁邊，手上拿著兩份報告。" } ],
    wu:     [ { room:"tofu", x:140, pose:"cam", doing:"在杏仁豆腐攤前面拍照，每拍一張就嘆一口氣。" }, { room:"pdesk", x:80, pose:"phone", doing:"在打電話給悠遊卡公司，一直說「很急很急」。" } ],
    ye:     [ null, { room:"pdesk", x:130, pose:"read", doing:"站在白板前面，把兩個名字寫在兩邊，中間畫了一條線。" } ]
  };
  EP20.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });
  // 星期日白天，阿財的手上沒有手套
  (EP20.suspects.find(s => s.id === "caifu").look || {}).byPhase = { 1:{ gloves:null } };

  /* ---------- 房間和隱藏小細節 ---------- */
  EP20.rooms = {
    nightmkt: [
      { id:"tofu", name:"老街杏仁豆腐", scene:"c20_tofu", opt:(ph) => ({ day:ph > 0, seal:ph > 0, tape:ph === 0, bowls:ph === 0 }), details:[
        { id:"d20_pot", name:"大鍋", hot:[46,40,28,8], text:"鍋子裡的杏仁豆腐還有半鍋，白白的，表面結了一層薄膜。阿琴姨說，豆腐本身她自己也吃了一碗。" },
        { id:"d20_ice", name:"冰桶", hot:[10,60,22,20], text:"藍色的冰桶裡，冰塊已經化了一半。旁邊的毛巾上繡著「1996」。" },
        { id:"d20_oldsign", name:"舊招牌", hot:[150,40,10,40], text:"木頭的舊招牌，字是手寫的：「老街杏仁豆腐」。邊角被摸得很圓。" } ] },
      { id:"lu", name:"財記滷味", scene:"c20_lu", opt:(ph) => ({ day:ph > 0 }), details:[
        { id:"d20_corn", name:"對面的烤玉米攤", hot:[146,30,40,50], text:"對面的烤玉米攤，醬汁的味道整條街都聞得到。招牌下面貼著一張紙：「林家　第二代」。" },
        { id:"d20_board", name:"砧板", hot:[96,50,16,6], text:"砧板洗得發白，刀子插在一旁的刀架上，一把一把排得很整齊。" } ] },
      { id:"alley", name:"攤子後面的巷子", scene:"c20_alley", opt:(ph) => ({ half:true }), details:[
        { id:"d20_cam", name:"電線桿上的監視器", hot:[176,10,14,8], text:"管委會的監視器，鏡頭往巷子裡面拍。電線桿上貼著一張褪色的尋貓啟事。" },
        { id:"d20_drain", name:"水溝", hot:[0,94,90,6], text:"水溝蓋上有一層油。巷子很窄，兩個人擦肩都會碰到。" },
        { id:"d20_lu_back", name:"滷味攤的後面", hot:[118,34,30,40], text:"財記滷味的後面掛著一片綠色的帆布，帆布下面露出一雙雨鞋。" } ] },
      { id:"office", name:"管委會辦公室", scene:"c20_office", details:[
        { id:"d20_clock", name:"牆上的窗戶", hot:[176,22,14,30], text:"窗戶外面就是夜市的入口。今晚的人潮，比平常少了一半。" },
        { id:"d20_tea", name:"桌上的茶", hot:[146,52,20,8], text:"一杯冷掉的烏龍茶，旁邊是一疊攤商的繳費單。" } ] }
    ],
    police: [ { id:"pdesk", name:"澄港市刑大", scene:"police", details:[
      { id:"d20_coffee", name:"你桌上的咖啡", hot:[60,62,10,8], text:"小吳幫你買的咖啡，杯子上寫著「學長　兩個答案」。" } ] } ],
    hospital: [ { id:"er", name:"急診室", scene:"c20_er", details:[
      { id:"d20_curtain", name:"布簾", hot:[10,20,70,40], text:"淡藍色的布簾拉著，裡面的床已經推走了。地上還有一張被踩過的病歷貼紙。" },
      { id:"d20_sign", name:"急診的牌子", hot:[86,8,22,8], text:"「急診」兩個字的燈管壞了一半，一閃一閃的。" } ] } ],
    guohome: [
      { id:"gstreet", name:"郭家門口", scene:"c20_gstreet", details:[
        { id:"d20_balcony", name:"二樓的陽台", hot:[14,8,82,16], text:"二樓陽台上一排盆栽，土都還是濕的。最旁邊一盆是蘭花，開得正好。" },
        { id:"d20_bus", name:"公車站牌", hot:[108,30,18,50], text:"「22 路　永和里」。往觀光夜市要在中央市場轉車，晚上九點以後就沒有車了。" } ] },
      { id:"gshop", name:"一樓（以前的農藥行）", scene:"c20_gshop", details:[
        { id:"d20_scale", name:"舊磅秤", hot:[98,44,18,12], text:"一台老式的磅秤，指針停在零。上面貼著「郭記　1978」。" },
        { id:"d20_door", name:"鐵門的內側", hot:[168,30,20,50], text:"鐵門內側的插銷是新上的油，拉起來一點聲音都沒有。" } ] },
      { id:"gkitchen", name:"廚房", scene:"c20_kitchen", details:[
        { id:"d20_fridge", name:"冰箱", hot:[150,24,30,56], text:"冰箱門上貼著一張旅行社的磁鐵：「北海道」。旁邊是方秀蘭的血壓紀錄表，最後一格是 12/5。" },
        { id:"d20_spice", name:"調味罐", hot:[20,18,40,14], text:"醬油、烏醋、香油，排得整整齊齊。每一罐都貼著手寫的標籤。" } ] },
      { id:"gbed", name:"臥室", scene:"c20_bed", details:[
        { id:"d20_bedside", name:"床", hot:[74,52,62,28], text:"雙人床的一邊很整齊，另一邊的枕頭被拿走了。郭明德說，他們最近分房睡。" },
        { id:"d20_window", name:"窗戶", hot:[150,14,26,24], text:"窗戶對著後面的巷子。窗台上有一本旅遊書，夾著一張書籤，停在「小樽」。" } ] }
    ],
    lab: [ { id:"lab", name:"鑑識中心", scene:"lab", details:[
      { id:"d20_bags", name:"證物袋", hot:[140,20,20,14], text:"一排證物袋，上面寫著「夜市 #1–#43」。陳葵的字一筆一畫，很工整。" } ] } ],
    morgue: [ { id:"mroom", name:"法醫室", scene:"m13_morgue", details:[
      { id:"d20_radio", name:"收音機", hot:[20,40,12,8], text:"收音機開著，很小聲。老錢說，盧伯伯以前也是聽這一台。" } ] } ]
  };
  const PS = [["c20_tofu",{ tape:true }],["police",{}]];
  EP20.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 監視器動畫（後巷） ---------- */
  const strip = L => { const o = Object.assign({}, L); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  EP20.looks = {
    aqC: strip(LOOK.aqin), cfG: strip(LOOK.caifu), cfC: Object.assign(strip(LOOK.caifu), { gloves:undefined }), guoC: strip(LOOK.guo), heC: strip(LOOK.he),
    fangC: { age:"old", skin:"#e8c0a0", hair:"#3a2a20", hairStyle:"bob", top:"#a8c8a0", bottom:"#5a5a6a" },
    luC: { age:"old", skin:"#d8b08a", hair:"#d8d8d0", hairStyle:"balding", top:"#5a6a8a", bottom:"#3a3a40" },
    stuC: { skin:"#f0d0b4", hair:"#2a2220", hairStyle:"long", top:"#f4f4f0", bottom:"#3a4a6a" }
  };
  const ANIM = {
    cctv20_alley: { scene:"c20_alley", opt:{ half:false }, cam:"NIGHT MKT ALLEY", date:"2026-12-04", beats:[
      { t:"19:55:00", d:4, cap:"19:55，阿琴姨從攤子後面出來，把一瓶新的糖水放上小架子。", st:{ half:false }, m:{ aqC:[44,90,"back+reach",-1] } },
      { t:"19:58:00", d:4, cap:"19:58，阿琴姨提著一個空桶子，從巷子走出去，往巷口的冰店。", st:{ half:false }, m:{ aqC:[200,96,"hold@bucket",1,44,90] }, out:["aqC"] },
      { t:"19:59:00", d:4, cap:"19:59，阿財從自己攤子的後面走出來，兩手戴著黃色的橡膠手套。", st:{ half:false }, m:{ cfG:[48,90,"stand",-1,132,92] } },
      { t:"19:59:10", d:4, join:true, cap:"他走到杏仁豆腐攤後面的小架子前面，背對著鏡頭，停了大約三十秒。", st:{ half:false }, m:{ cfG:[48,90,"back+reach",-1] } },
      { t:"20:00:00", d:4, cap:"20:00，阿財走回自己攤子的後面，經過垃圾桶的時候停了一下。", st:{ half:true }, m:{ cfG:[104,90,"reach",1,48,90] } },
      { t:"20:00:10", d:3, join:true, cap:"他走進自己的攤子。", st:{ half:true }, m:{ cfG:[132,92,"stand",1,104,90] }, out:["cfG"] },
      { t:"20:01:00", d:4, cap:"20:01，阿琴姨提著一桶冰回來，從後面鑽進攤子。", st:{ half:true }, m:{ aqC:[44,90,"hold@bucket",-1,200,96] }, out:["aqC"] },
      { t:"20:35:00", d:4, cap:"20:35，巷子裡的人開始往外跑。", st:{ half:true }, m:{ stuC:[200,96,"stand",1,20,96], heC:[200,94,"stand",1,60,94] }, out:["stuC","heC"] }
    ] }
  };
  Object.values(ANIM).forEach(A => { if (A.beats.some(b => b.st)) A.opt = Object.assign({}, A.opt || {}, { seq:A.beats.map(b => Object.assign({}, A.opt || {}, b.st || {})), ds:jds(A.beats) }); });
  [...EP20.cctv, ...EP20.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案 ---------- */
  const RB = [
    { t:"19:58:00", d:4.5, cap:"12 月 4 日 19:58，阿琴姨跟每天一樣，提著空桶子去巷口拿冰。", scene:"c20_alley", opt:{ half:false }, m:{ aqC:[200,96,"hold@bucket",1,44,90] }, out:["aqC"] },
    { t:"19:59:00", d:5, cap:"19:59，阿財戴著黃色手套，走到她攤子後面的小架子，把殺蟑螂的原液倒進剛換上的那瓶糖水。", scene:"c20_alley", opt:{ half:false }, m:{ cfG:[48,90,"back+reach",-1,132,92] }, out:["cfG"] },
    { t:"20:00:00", d:5, cap:"20:00，他把手套翻過來脫掉，丟進垃圾桶。", scene:"c20_alley", opt:{ half:true }, m:{ cfC:[104,90,"reach",1,48,90] } },
    { t:"20:35:00", d:5, cap:"20:35，加了糖水的三個客人，一個接一個倒下。盧伯伯每個禮拜五都來吃這一碗。", scene:"c20_tofu", opt:{ bowls:true }, m:{ stuC:[160,96,"clutch",-1], luC:[176,98,"fall",-1], aqC:[96,92,"handsup",1] }, out:["stuC","luC"] },
    { t:"12/05 09:00", d:4.5, cap:"12 月 5 日 09:00，衛生局封了攤子。新聞跑了一整天。", scene:"c20_tofu", opt:{ day:true, seal:true, bowls:false }, m:{ aqC:[96,92,"cry",1] } },
    { t:"12/05 19:40", d:5, cap:"那天晚上，郭明德打開樓下農藥行的鐵門，從貨架上拿下一瓶 2018 年的巴拉刈。", scene:"c20_gshop", opt:{}, m:{ guoC:[56,94,"reach",-1,170,94] } },
    { t:"12/05 20:30", d:5, cap:"20:30，他跟每天晚上一樣，打了一杯綠色的精力湯。這一次，他多加了一樣東西。", scene:"c20_kitchen", opt:{}, m:{ guoC:[66,94,"reach",1] } },
    { t:"12/05 20:50", d:5, cap:"方秀蘭喝了一口，皺著眉頭說：「今天的好苦。」他說：「菠菜比較老。」", scene:"c20_kitchen", opt:{}, m:{ fangC:[100,94,"drink@cup/#f4f0f0",-1,140,94], guoC:[66,94,"stand",1] } },
    { t:"12/05 21:30", d:5, cap:"21:30，她開始吐。他讓她「先睡一下」，一直等到 23:40 才叫救護車。", scene:"c20_kitchen", opt:{}, m:{ fangC:[100,98,"lie",-1], guoC:[150,94,"phone",-1,66,94] } },
    { t:"12/06 08:05", d:5, cap:"12 月 6 日 08:05，她還在插管的時候，他在急診室門口對記者說：「我太太前天晚上也去了那個夜市。」", scene:"c20_er", opt:{}, m:{ guoC:[110,94,"point",-1], heC:[60,94,"cam",1] } }
  ];
  EP20.court = {
    title: "刑大・12 月 6 日 17:20", scene: "police",
    who: ph => ["caifu","guo","aqin","akai"],
    open: ph => "17:20，刑大的會議室。白板上寫著兩個名字，中間畫了一條線。阿財坐在一邊，手上的指甲縫裡還有滷汁。郭明德坐在另一邊，一直在看手錶。阿琴姨坐在門口，手上捏著那張封條。",
    kindLine: {
      one: "夜市下毒的人，也害死了方秀蘭。",
      two: "這是兩個案子，兩個犯人。"
    },
    murmur: [ "（阿財把頭低下去。）", "（郭明德又看了一次手錶。）", "（阿琴姨把封條摺起來，又攤開。）" ],
    confess: {
      caifu: [ "那個角落……我想了十五年。", "我只是想讓她的客人拉個肚子。拉肚子，衛生局就會來，攤子就會被封，位子就會重新抽……我以為頂多就是拉肚子……", "盧伯伯每個禮拜五都買我的滷大腸。……我那天還多送他一塊豆干。" ],
      guo: [ "一千三百五十萬。她要我把房子賣了。那是我爸留下來的。", "新聞一直在講夜市下毒。我想，多一個，也沒有人會知道。", "她說「好苦」。……我說，菠菜比較老。" ]
    },
    cornered: { caifu: "我只是想讓她的客人拉肚子……", guo: "她、她是自己想不開……" },
    deny: {
      aqin: "我熬了三十年的糖水……我怎麼會害我的客人……",
      akai: "我那天在台中！我有票！"
    },
    replayText: "12 月 4 日 19:58，夜市的後巷。阿琴姨跟三十年來的每一天一樣，提著空桶子去拿冰——",
    replay: { scene:"c20_alley", opt:{}, clean:true, cam:"經過重現", date:"2026-12-04", beats:RB },
    endGood: "17:30，葉晴在兩份聲押書上簽了名。\n晚上的新聞標題改了：「夜市毒案另有隱情　丈夫藉新聞殺妻」。\n一個禮拜後，衛生局撤銷了處分。阿琴姨重新開攤的那天，老錢第一個去排隊。他點了兩碗，一碗放在旁邊的空位上。",
    endBad: "17:30，葉晴把卷宗闔上：「不夠。」\n新聞繼續寫著「夜市毒魔」。「老街杏仁豆腐」沒有再開。\n郭明德在太太的告別式上，對著鏡頭哭了很久。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[20] && ARC_INTER[20].after) EP20.after = Object.assign({}, ARC_INTER[20].after, { scene:"c20_apart", opt:{}, cast:(ARC_INTER[20].after.cast || []).map(c => c.id === "he" ? Object.assign({}, c, { x:40, pose:"sit" }) : c.id === "wu" ? Object.assign({}, c, { x:96 }) : c.id === "li" ? Object.assign({}, c, { x:140, facing:-1 }) : c) });

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP20.outScenes = ["c20_tofu","c20_lu","c20_alley","c20_gstreet"];
  EP20.fac = { nightmkt:["#2a2430","#c8302a"], police:["#cfcabb","#3f5a7a"], hospital:["#e8f0ec","#3a8a6a"], guohome:["#c8b8a0","#3a6a3a"], lab:["#e2e8e8","#3a7a8a"], morgue:["#d8e0e0","#5a7a8a"] };
  EP20.setting = { nightmkt:"town", police:"city", hospital:"city", guohome:"town", lab:"city", morgue:"city" };
  const SKY20 = [ ["#0a0f1c","#24304a","#2a3040","#323a4a",0,0], ["#a8c4dc","#eef0ec","#4a6070","#56707a",0,0] ];
  EP20.worldSky = ph => SKY20[Math.min(ph || 0, SKY20.length - 1)];
  EP20.roomDesc = {
    tofu:"「老街杏仁豆腐」。三十年的老攤子，在第三排的角落。", lu:"隔壁的「財記滷味」。對面是烤玉米攤。", alley:"攤子後面的窄巷，只有攤商會走。", office:"夜市管委會的辦公室，在入口旁邊的二樓。",
    pdesk:"澄港市刑大。", er:"澄港醫院的急診室。", gstreet:"郭家門口。對面是一家檳榔攤。", gshop:"郭家一樓，以前的農藥行。", gkitchen:"郭家的廚房。", gbed:"郭家的臥室。", lab:"鑑識中心。", mroom:"法醫室。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police" };
  EP20.world = {};
  EP20.locations.forEach(l => { EP20.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP20.world.nightmkt, {
    extras: [
      { id:"cop20", name:"轄區員警", phase:0, until:0, x:RX(0) + 30, L:COP, pose:"stand", facing:1, lines:[
        "救護車 20:48 到的。三個人都吃了杏仁豆腐，都在吐、一直流口水。", "攤子我們先封起來了，東西都沒動。……老闆娘一直說，她的糖水熬了三十年。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長……就是這一攤。老錢前兩天才說，三十年老店。", "小吳"),
      say("wu", "三個客人中毒，盧伯伯走了。醫院說像是有機磷，農藥或殺蟲劑那一類。", "小吳"),
      say("you", "先看他們吃了什麼。", "你"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  EP20.mapPos = { nightmkt:[70,80,"u"], police:[170,40,"r"], hospital:[130,60,"u"], guohome:[40,30,"u"], lab:[196,62,"r"], morgue:[214,80,"r"] };
  EP20.mapRoads = [["nightmkt","police"],["nightmkt","hospital"],["hospital","guohome"],["police","hospital"],["police","lab"],["lab","morgue"],["police","guohome"]];
  EP20.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 20; x < 230; x += 8) for (let y = 14; y < 124; y += 7){ R(x, y, 6, 5, "#c8c0b0"); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, "#b0a898"); }
    R(0, 96, 240, 5, "#7a7a76"); R(100, 0, 5, 135, "#7a7a76");
    for (let k = 0; k < 8; k++) R(52 + k * 5, 84, 3, 3, (Math.floor(t * 3) + k) % 2 ? "#e8c040" : "#c83a2a");   // 夜市的燈
    R(124, 52, 14, 10, "#e8f0ec"); R(129, 53, 4, 8, "#c83a2a"); R(127, 55, 8, 2, "#c83a2a");   // 醫院
  };
})();
