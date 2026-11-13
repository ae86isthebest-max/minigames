/* =========================================================
   第 16 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP16.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i] = beatAt(o.t || 0, o.ds); return (o.seq || [])[i] || {}; };
  const cam = (x, y) => { R(x, y, 10, 5, "#2a2a2e"); R(x + 7, y + 1, 3, 3, "#4a4a52"); P(x + 1, y + 1, "#e83a3a"); };
  const tube = (x, y, w, c) => { R(x, y, w, 2, c || "#f4f8f0"); dither(x - 4, y + 2, w + 8, 6, (c || "#f4f8f0") + "22", 3); };
  const dog = (x, y, pose) => {   // 豆花：奶油色拉布拉多，背心「豆花」；pose: sit / lie / sniff
    const c = "#f0dcb0", d = "#d8c090";
    if (pose === "lie"){ R(x, y - 5, 16, 5, c); R(x + 14, y - 8, 7, 6, c); R(x + 15, y - 9, 2, 3, d); P(x + 20, y - 6, INK); P(x + 18, y - 7, INK); R(x - 3, y - 4, 4, 2, c); R(x + 4, y - 6, 6, 3, "#3a6ac8"); return; }
    if (pose === "sniff"){ R(x, y - 9, 14, 6, c); R(x + 13, y - 6, 7, 5, c); P(x + 19, y - 3, INK); P(x + 16, y - 5, INK); R(x + 14, y - 8, 2, 3, d); R(x + 1, y - 3, 2, 3, c); R(x + 10, y - 3, 2, 3, c); R(x - 3, y - 10, 4, 2, c); R(x + 3, y - 9, 7, 4, "#3a6ac8"); return; }
    R(x, y - 8, 9, 8, c); R(x + 6, y - 15, 7, 8, c); R(x + 6, y - 16, 2, 4, d); R(x + 11, y - 11, 3, 2, c); P(x + 13, y - 11, INK); P(x + 10, y - 13, INK); R(x - 2, y - 2, 4, 2, c); R(x + 7, y - 1, 3, 1, d); R(x + 1, y - 7, 6, 4, "#3a6ac8"); P(x + 3, y - 6, "#f4f0e0");
  };
  const jack = (x, y, tarp) => {   // 油壓拖板車（tarp：上面蓋著藍色帆布的東西）
    R(x, y - 3, 22, 3, "#c83a2a"); R(x + 1, y, 3, 2, INK); R(x + 18, y, 3, 2, INK); R(x - 3, y - 14, 2, 12, "#3a3a3e"); R(x - 5, y - 15, 6, 2, "#3a3a3e");
    if (tarp === "fold") { R(x + 4, y - 5, 14, 2, "#3a6ac8"); R(x + 5, y - 6, 12, 1, "#2a5ab8"); }
    else if (tarp) { R(x + 1, y - 9, 20, 6, "#3a6ac8"); R(x + 2, y - 10, 18, 1, "#2a5ab8"); R(x + 4, y - 7, 14, 1, "#2a5ab8"); }
  };
  const crate = (x, y, w, h, c, lab) => { R(x, y, w, h, c || "#c8b898"); R(x, y, w, 1, "#e8d8b8"); R(x + (w >> 1), y, 1, h, "#a89878"); if (lab) R(x + 2, y + 2, Math.min(8, w - 4), 3, lab); };

  /* ---------- 場景：永福冷鏈 ---------- */
  // 院子：左邊鐵門和打卡鐘、中間辦公室（窗戶、門）、右邊冷凍庫的大門
  SC.c16_yard = (o) => { o = Object.assign({}, o, stOf(o));
    const night = !!o.night;
    R(0, 0, W, 40, night ? "#0c1018" : "#a8c8e0"); if (!night) dither(0, 26, W, 14, "#c8dce8", 3);
    R(0, 18, W, 58, night ? "#2a2e34" : "#b8bcb8"); for (let x = 0; x < W; x += 8) R(x, 18, 1, 58, night ? "#24282e" : "#a8aca8");   // 浪板外牆
    // 鐵門（左）
    R(0, 24, 30, 52, night ? "#3a3e44" : "#8a8e92"); for (let y = 26; y < 76; y += 3) R(1, y, 28, 1, night ? "#2e3238" : "#7a7e82");
    R(18, 40, 10, 12, "#d8d8d0"); R(19, 41, 8, 5, "#2a3a2a"); R(20, 42, 6, 2, "#6ae86a"); R(20, 48, 6, 2, "#5a5a5a");   // 打卡鐘
    // 辦公室（中）
    R(40, 22, 86, 54, night ? "#3a3a3e" : "#d8d0c0"); R(40, 20, 86, 3, night ? "#2a2a2e" : "#8a7a6a");
    const fog = o.fog, glow = o.heater;
    R(50, 32, 40, 22, "#5a5a5e"); R(52, 34, 36, 18, night ? (glow ? "#c86a2a" : (o.lit !== false ? "#e8d890" : "#1a1e26")) : (fog ? "#c8d0d4" : "#9cc5e6")); R(70, 34, 1, 18, "#5a5a5e");
    if (fog) dither(52, 34, 36, 18, "#f4f4f088", 2);
    R(104, 34, 18, 42, night ? "#4a3a2a" : "#8a6a4a"); P(118, 56, "#e8c040"); txt("辦公室", 98, 30, night ? "#8a8a8a" : "#5a4a3a", "5px sans-serif");
    if (o.tape) { R(100, 54, 26, 2, "#e8c020"); for (let k = 0; k < 4; k++) R(102 + k * 6, 54, 3, 2, INK); }
    // 冷凍庫大門（右）
    R(146, 22, 46, 54, night ? "#3a4048" : "#c8ccd0"); R(150, 28, 38, 48, night ? "#5a6470" : "#e8ecf0"); R(168, 28, 1, 48, "#a8b0b8"); R(182, 46, 3, 10, "#3a3a3e");
    R(160, 22, 18, 5, "#1a3a6a"); txt("冷凍庫", 161, 26, "#f4f4f0", "5px sans-serif"); R(166, 14, 6, 4, night && o.flamp ? "#fff4c0" : "#8a8a7a"); if (night && o.flamp) dither(150, 18, 38, 30, "#fff4c022", 2);
    R(140, 36, 6, 8, "#d8d8dc"); R(141, 37, 4, 3, "#2a2a2a"); P(142, 41, "#e83a3a");   // 刷卡機
    cam(36, 8);
    floor(76, night ? "#24262a" : "#7a7a76", night ? "#1e2024" : "#6a6a66");
    if (!night) { R(0, 92, W, 2, "#e8c040"); for (let x = 4; x < W; x += 12) R(x, 92, 6, 2, "#6a6a66"); }
    R(8, 2, 1, 16, "#3a3a3e"); R(4, 2, 10, 3, "#5a5a5e"); if (night) dither(0, 4, 24, 30, "#fff4c012", 3);   // 路燈
    if (o.jack === "office") jack(118, 86, "fold"); else if (o.jack === "freezer") jack(156, 86, false);
    if (o.car) { R(0, 60, 30, 14, "#e8e8e8"); R(4, 54, 22, 7, "#c8d8e8"); R(2, 72, 6, 6, INK); R(22, 72, 6, 6, INK); }
    R(80, 80, 10, 6, night ? "#3a3a3e" : "#5a7a9a"); R(82, 78, 6, 2, "#3a5a7a");   // 水桶
  };

  // 辦公室：左摺疊床、門後的外套、窗戶、中間辦公桌、電暖器、右邊落地磅秤
  SC.c16_office = (o) => { o = Object.assign({}, o, stOf(o));
    wall(76, "#e0d8c4", false); R(0, 70, W, 6, "#c8bca4");
    R(2, 70, 10, 22, "#7a8a9a"); R(3, 68, 8, 3, "#e8e4d8"); R(4, 74, 6, 1, "#5a6a7a");   // 摺疊床（收著）
    R(16, 30, 2, 2, "#5a5a5a"); R(14, 32, 18, 30, "#4a5a6a"); R(16, 34, 14, 2, "#3a4a5a"); R(26, 46, 4, 6, "#3a4a5a");   // 門後的外套
    PR.windowBox(40, 20, 30, 22, o.fog ? "#c8d0d4" : "#9cc5e6"); if (o.fog) { dither(40, 20, 30, 22, "#f4f4f088", 2); for (let k = 0; k < 5; k++) R(43 + k * 6, 24 + (k % 3) * 4, 1, 10, "#e8eef0"); }
    R(84, 14, 30, 22, "#f4f0e0"); R(84, 14, 30, 2, "#c83a2a"); for (let k = 0; k < 4; k++) R(87, 19 + k * 4, 24 - (k % 2) * 6, 1, "#5a5a5a"); txt("漁價", 88, 34, "#c83a2a", "5px sans-serif");   // 漁價表
    R(124, 18, 22, 16, "#8a6a4a"); R(126, 20, 18, 12, "#e8d8b8"); R(130, 24, 4, 6, "#3a3a3a"); R(136, 23, 4, 7, "#5a7a9a");   // 牆上的舊照片（漁船）
    // 辦公桌
    R(70, 58, 56, 4, "#8a6a4a"); R(72, 62, 52, 14, "#7a5a3a"); R(88, 62, 18, 6, "#6a4a2a"); P(97, 65, "#e8c040"); R(72, 76, 3, 2, "#5a3a2a"); R(121, 76, 3, 2, "#5a3a2a");
    R(108, 54, 12, 5, "#2a4a8a"); R(109, 55, 10, 3, "#e8e4d8");   // 記帳本
    R(76, 48, 14, 10, "#1a1a1e"); R(77, 49, 12, 7, "#3a5a7a"); R(80, 58, 6, 1, "#3a3a3e");   // 電腦
    R(92, 54, 8, 4, "#f4f0e0"); R(93, 53, 6, 1, "#c83a2a");   // 電話
    // 電暖器
    const heat = o.heater !== false;
    R(130, 72, 14, 16, "#c8c0b0"); R(132, 74, 10, 10, heat ? "#e85a1a" : "#5a5048"); for (let k = 0; k < 3; k++) R(133, 75 + k * 3, 8, 1, heat ? "#ffb04a" : "#4a4038"); R(140, 86, 2, 2, INK);
    if (heat) dither(126, 56, 22, 18, "#ff8a3a22", 2);
    R(146, 86, 2, 10, "#2a2a2a"); R(146, 96, 12, 2, "#2a2a2a");   // 延長線
    R(150, 88, 12, 10, "#5a6a5a"); R(151, 87, 10, 2, "#4a5a4a"); R(153, 86, 4, 2, "#f4f0e0");   // 垃圾桶
    // 落地磅秤
    R(170, 84, 20, 4, "#5a5a5e"); R(178, 52, 3, 32, "#3a3a3e"); R(170, 52, 20, 3, "#8a8a8e"); R(174, 56, 12, 8, "#e8e4d8"); P(180, 60, INK); R(186, 55, 1, 6, "#3a3a3e");
    if (o.weight) { R(184, 61, 5, 6, "#3a3a40"); } else { R(184, 61, 5, 6, "#d0c8b4"); }   // 秤錘（不見了：牆上留下乾淨的印子）
    floor(78, "#b8b0a0", "#a8a090");
    R(151, 91, 10, 9, "#6a7a7a"); R(150, 90, 12, 2, "#8a9a9a");   // 垃圾桶（o16_bento）
    if (o.body) {
      if (o.wet) { dither(72, 86, 58, 8, "#6a8aa8aa", 1); P(78, 91, "#e8e8f0"); P(96, 92, "#e8e8f0"); P(118, 90, "#e8e8f0"); }
      PR.person(86, 92, { skin:"#d8c0b0", hair:"#a8a8a0", hairStyle:"balding", top:"#5a7a5a", bottom:"#3a3a40", blink:true }, 1.15, -1, "lie");
      R(120, 86, 3, 2, "#4a1a1a"); R(84, 84, 4, 3, "#c8c0b0"); R(85, 85, 2, 1, "#e8eef0");   // 頭後的血、手錶
    }
    if (o.tape) { R(0, 100, W, 2, "#e8c020"); for (let k = 0; k < 16; k++) R(k * 12 + 2, 100, 5, 2, INK); }
  };

  // 冷凍庫：結霜的鐵架和棧板、門邊的溫控主機
  SC.c16_freezer = (o) => { o = Object.assign({}, o, stOf(o));
    wall(80, "#c8dce8", false); dither(0, 0, W, 80, "#e8f4fa55", 2);
    for (let x = 4; x < W; x += 30) R(x, 8, 2, 72, "#9ab0c0");
    tube(40, 2, 24, "#e8f4ff"); tube(130, 2, 24, "#e8f4ff");
    R(8, 30, 14, 18, "#3a4a5a"); R(10, 32, 10, 6, "#1a2a1a"); txt("-25", 10, 37, "#6ae86a", "5px monospace"); R(10, 40, 10, 2, "#c8c8c8"); R(10, 44, 4, 2, "#e8c040");   // 溫控主機
    // 門口的棧板（冷凍鯖魚）
    R(40, 84, 50, 4, "#a88a5a"); for (let k = 0; k < 5; k++) R(42 + k * 10, 84, 6, 4, "#8a6a3a");
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) crate(42 + c * 12, 60 + r * 8, 11, 8, "#d8e0e8", "#3a7ab8");
    // 一箱碎冰
    R(100, 76, 20, 12, "#3a7ac8"); R(101, 74, 18, 3, "#e8f4ff"); if (o.bump !== false) R(107, 72, 6, 3, "#f4faff");
    // 魚餌櫃
    R(130, 40, 26, 40, "#8a9aa8"); R(132, 42, 22, 16, "#a8b8c4"); R(132, 60, 22, 18, "#a8b8c4"); R(152, 50, 2, 6, "#3a3a3e"); R(134, 44, 10, 8, "#f4f4f0"); txt("魚餌", 134, 64, "#3a4a5a", "5px sans-serif");
    // 角落的貨箱（海龍漁業寄存）
    for (let k = 0; k < 2; k++) crate(160, 52 + k * 9, 24, 9, "#c8a878", "#e86a2a");
    crate(160, 70, 24, 18, "#c8a878", "#e86a2a"); R(162, 76, 18, 2, "#8a6a4a");
    R(30, 88, 14, 2, "#d8ecf8");
    floor(88, "#a8c0d0", "#98b0c0"); dither(0, 88, W, 20, "#f4faff55", 2);
    R(25, 84, 10, 2, "#e8f0f4"); R(25, 84, 3, 2, "#c83a2a");   // 掉在地上的溫度計（d16_thermo）
    if (o.scrape !== false) R(46, 92, 40, 6, "#8aa0b0");   // 霜被刮掉的地方
    if (o.dog) dog(150, 98, "sit");
  };

  // 更衣室：洗手台、置物櫃（寫著「洪」）、防寒衣
  SC.c16_locker = (o) => {
    wall(76, "#d8dcd0", false); R(0, 70, W, 6, "#b8bcb0");
    R(30, 50, 24, 8, "#e8ecec"); R(40, 46, 2, 4, "#a8a8a8"); R(32, 58, 4, 18, "#c8ccc8"); PR.windowBox(30, 20, 24, 20, "#c8d8e0", "#8a8a86"); R(48, 52, 4, 2, "#e8d8a0");   // 洗手台和鏡子
    for (let k = 0; k < 4; k++){ const x = 66 + k * 20; R(x, 30, 18, 58, "#6a7a8a"); R(x + 1, 31, 16, 56, "#7a8a9a"); R(x + 13, 56, 2, 6, "#3a3a3e"); R(x + 4, 34, 10, 4, "#f4f4f0"); }
    txt("洪", 109, 37, "#2a2a2a", "5px sans-serif"); txt("蔡", 69, 37, "#2a2a2a", "5px sans-serif"); txt("吳", 89, 37, "#2a2a2a", "5px sans-serif");
    for (let k = 0; k < 3; k++){ R(146 + k * 12, 28, 2, 2, "#5a5a5a"); R(142 + k * 12, 30, 10, 36, ["#2a4a8a","#2a4a8a","#2a4a8a"][k]); R(144 + k * 12, 32, 6, 2, "#c8c8c8"); }
    R(178, 28, 2, 2, "#5a5a5a");   // 少一件
    R(10, 82, 16, 6, "#5a5a5e"); R(12, 80, 12, 2, "#3a3a3e");   // 長椅
    floor(88, "#9aa4a0", "#8a9490");
  };

  // 對面製冰廠
  SC.c16_ice = (o) => {
    wall(76, "#b8c4c8", false); for (let x = 0; x < W; x += 10) R(x, 0, 1, 76, "#a8b4b8");
    R(100, 30, 40, 40, "#8a9aa8"); R(102, 32, 36, 20, "#5a6a7a"); for (let k = 0; k < 4; k++) R(104, 34 + k * 4, 32, 2, "#e8f4ff"); R(104, 56, 32, 10, "#3a4a5a"); R(110, 66, 20, 4, "#e8f4ff");   // 製冰機
    R(60, 70, 40, 4, "#5a5a5e"); for (let k = 0; k < 4; k++) R(62 + k * 9, 64, 8, 6, "#e8f4ff");   // 輸送帶上的冰
    R(30, 46, 30, 30, "#7a6a5a"); R(40, 50, 20, 14, "#f4f0e0"); for (let k = 0; k < 4; k++) R(42, 53 + k * 3, 14, 1, "#5a5a5a");   // 出貨單和桌子
    R(160, 40, 24, 36, "#c8c8cc"); R(162, 42, 20, 14, "#1a1a1e"); R(163, 43, 18, 12, "#2a3a2a"); for (let k = 0; k < 4; k++) R(164 + (k % 2) * 9, 44 + (k >> 1) * 6, 8, 5, "#4a6a5a");   // 監視器螢幕
    txt("澄港製冰", 8, 14, "#3a4a5a", "7px sans-serif"); cam(150, 8);
    for (let k = 0; k < 3; k++) R(8 + k * 8, 66, 7, 10, "#3a6ac8");   // 冰袋
    floor(76, "#8a9498", "#7a8488"); dither(60, 76, 60, 20, "#e8f4ff33", 3);
  };

  /* ---------- 碼頭、廟、魚市 ---------- */
  SC.c16_pier = (o) => {
    const dusk = !!o.dusk, night = !!o.night;
    R(0, 0, W, 52, night ? "#0a0e18" : dusk ? "#e8906a" : "#9cc5e6"); if (night) { for (let k = 0; k < 12; k++) P((k * 41) % W, 4 + (k * 17) % 36, "#c8c8d8"); } if (dusk) { dither(0, 30, W, 22, "#f4b07a", 2); R(140, 34, 14, 14, "#ffd890"); }
    R(0, 52, W, 30, dusk ? "#5a5a7a" : "#3a6a8a"); for (let x = 0; x < W; x += 7) R(x, 56 + (x % 3) * 6, 4, 1, dusk ? "#8a8aaa" : "#5a8aaa");
    // 順興六號
    R(20, 58, 150, 12, "#e8e4d8"); R(16, 54, 158, 5, "#c83a2a"); R(20, 70, 146, 4, "#2a4a6a"); R(70, 36, 40, 18, "#f4f4f0"); R(74, 40, 10, 8, "#5a8aaa"); R(88, 40, 10, 8, "#5a8aaa"); R(104, 22, 2, 14, "#3a3a3e");
    txt("順興六號", 120, 66, "#2a4a6a", "6px sans-serif");
    R(130, 62, 22, 10, "#3a7ac8"); R(131, 61, 20, 2, "#f4f4f0");   // 保冰箱
    R(20, 60, 18, 10, "#8a6a4a"); R(22, 56, 14, 8, "#1a1a1e"); R(23, 57, 12, 6, "#5a8ac8");   // 阿彥的筆電（放在木箱上）
    R(60, 56, 14, 4, "#f4f0e0");   // 收據板
    for (let k = 0; k < 4; k++) R(40 + k * 22, 44, 1, 12, "#3a3a3e");   // 釣竿架
    floor(82, dusk ? "#6a5a50" : "#8a8276", dusk ? "#5a4a40" : "#7a7266");
    for (let x = 6; x < W; x += 44) { R(x, 78, 6, 8, "#3a3a3e"); R(x - 1, 77, 8, 2, "#2a2a2e"); }   // 繫船柱

    if (night) { dither(0, 0, W, H, "#0a0e1888", 1); R(104, 30, 4, 4, "#ffe8a0"); dither(96, 30, 20, 20, "#ffe8a022", 2); }
  };
  SC.c16_temple = (o) => {
    R(0, 0, W, 76, "#8a2a1a"); for (let x = 0; x < W; x += 24) R(x, 0, 3, 76, "#6a1a10");
    R(70, 8, 52, 40, "#3a1a10"); R(74, 12, 44, 32, "#c89a3a"); R(88, 18, 16, 22, "#e8c060"); R(92, 22, 8, 10, "#3a2a1a");   // 神龕
    R(60, 50, 72, 6, "#a83a1a"); R(64, 56, 64, 20, "#8a2a10");   // 供桌
    R(30, 30, 30, 22, "#e8e0c8"); R(32, 32, 26, 18, "#8aa0b8"); for (let k = 0; k < 8; k++) R(34 + (k % 4) * 6, 38 + (k >> 2) * 6, 4, 5, ["#c83a2a","#3a3a3a","#e8c040","#3a5a8a"][k % 4]);   // 公布欄和大合照
    R(140, 52, 22, 24, "#5a5a5e"); R(142, 46, 18, 8, "#3a3a3e"); R(146, 40, 10, 6, "#2a2a2e"); dither(140, 30, 22, 16, "#8a8a8a22", 3);   // 金爐
    R(100, 60, 12, 12, "#a87a3a"); for (let k = 0; k < 5; k++) R(101 + k * 2, 54, 1, 6, "#c8a060");   // 籤筒
    for (let k = 0; k < 2; k++) { R(10 + k * 170, 6, 12, 18, "#e83a2a"); R(12 + k * 170, 24, 8, 3, "#e8c040"); }   // 燈籠
    floor(76, "#8a7a6a", "#7a6a5a");
  };
  SC.c16_fish = (o) => {
    wall(76, "#d8d4c8", false);
    R(0, 50, 80, 26, "#a8b8c0"); for (let k = 0; k < 5; k++) { R(4 + k * 15, 58, 12, 6, "#c8d8e0"); R(6 + k * 15, 56, 8, 3, "#8a9aa8"); }   // 魚攤的冰台
    R(84, 50, 100, 26, "#6a4a2a"); R(88, 54, 24, 6, "#f4f0e0");   // 辦公桌
    R(90, 56, 18, 8, "#e8e4d8"); R(91, 57, 16, 1, "#5a5a5a");   // 收據
    R(130, 58, 16, 8, "#7a4a2a"); R(132, 56, 4, 3, "#8a5a3a"); R(138, 56, 4, 3, "#8a5a3a");   // 茶盤
    R(110, 14, 40, 24, "#c83a2a"); txt("海龍漁業", 114, 30, "#ffe07a", "7px sans-serif");
    R(160, 16, 20, 14, "#8a6a4a"); R(162, 18, 16, 10, "#5a8aaa"); R(166, 22, 8, 4, "#e8e4d8");   // 漁船的照片
    floor(76, "#7a7a76", "#6a6a66"); dither(0, 76, 80, 20, "#5a6a7a33", 2);
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    hong:  { skin:"#e0b48c", hair:"#4a4440", hairStyle:"short", top:"#e9e4da", coat:"#2a4a6a", bottom:"#3a3a40", mood:"tired", hello:"阿福……怎麼會這樣……" },
    xiong: { skin:"#c89a70", hair:"#1a1410", hairStyle:"short", top:"#2a2a2e", apron:"#e8763a", bottom:"#3a4a5a", hat:"cap", capColor:"#3a5a8a", mood:"worried", hello:"我、我開門的時候他就在那裡了……" },
    qin:   { skin:"#f0d0b4", hair:"#3a3430", hairStyle:"bob", top:"#a87a8a", coat:"#6a5a6a", bottom:"#3a3a40", mood:"sad", hello:"他昨天還說，今天要吃我煮的魚湯……" },
    kun:   { skin:"#c89a70", hair:"#1a1410", hairStyle:"spiky", top:"#f4f4f0", apron:"#2a3a4a", bottom:"#3a3a3e", hello:"冰要不要？……喔，警察喔。" },
    cap:   { age:"old", skin:"#b8865a", hair:"#c8c8c0", hairStyle:"short", top:"#3a6a9a", bottom:"#3a3a40", hat:"cap", capColor:"#f4f4f0", hello:"國華？他昨晚在我的船上啊。" },
    yan:   { skin:"#f0d0b4", hair:"#2a2220", hairStyle:"short", top:"#4a8a5a", hood:"#4a8a5a", bottom:"#3a4a6a", hat:"cap", capColor:"#e8c040", hello:"哈囉～警察大哥要上鏡嗎？" },
    hai:   { skin:"#d8a880", hair:"#1a1410", hairStyle:"slick", top:"#1e1e22", bottom:"#2a2a30", chain:true, hello:"我很忙，有話快說。" },
    miao:  { age:"old", skin:"#d8b08a", hair:"#d8d8d0", hairStyle:"bald", top:"#5a4a7a", bottom:"#3a3a40", hello:"媽祖保佑，阿福好人啊。" },
    kang:  { skin:"#d8a880", hair:"#1e1a18", hairStyle:"pony", top:"#2e3e2e", bottom:"#2e3e2e", hat:"cap", capColor:"#2e3e2e", hello:"豆花，坐下。" },
    longshu: { hello:"年輕人，喝茶。" },
    qian:  { hello:"冷的東西，會說謊。" },
    xu:    { hello:"不要用手碰地上的水。" },
    wu:    { hello:"學長，這裡好冷……" },
    zhou:  { hello:"漁港這邊，不要搞太大。" }
  };
  ["longshu","qian","xu","wu","zhou"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.longshu.top) Object.assign(LOOK.longshu, { age:"old", skin:"#c08a60", hair:"#d8d8d0", hairStyle:"short", top:"#f4f4f0", bottom:"#3a3a3a" });
  if (!LOOK.xu.top) Object.assign(LOOK.xu, { skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" });
  if (!LOOK.wu.top) Object.assign(LOOK.wu, { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050", glasses:true });
  if (!LOOK.qian.top) Object.assign(LOOK.qian, { age:"old", skin:"#e0b48c", hair:"#b8b8b0", hairStyle:"balding", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#2a2a30", glasses:true });
  if (!LOOK.zhou.top) Object.assign(LOOK.zhou, { skin:"#e0b48c", hair:"#3a3a3a", hairStyle:"slick", top:"#e9e4da", coat:"#5a5a60", bottom:"#3a3a40" });
  const DAILY = {
    hong:  [ { room:"cyard", x:60, pose:"stand", doing:"站在院子裡，一直用手抹臉，頭髮還是濕的。" }, { room:"pdesk", x:40, pose:"sit", doing:"坐在刑大的長椅上，兩隻腳一直縮在椅子底下。" }, { room:"pdesk", x:40, pose:"sit", doing:"坐在刑大，眼睛很紅，一夜沒睡。" } ],
    xiong: [ { room:"cyard", x:30, pose:"stand", doing:"站在鐵門邊，雙手抱著頭盔。" }, { room:"cfreezer", x:110, pose:"stand", doing:"穿著防寒衣，在冷凍庫幫忙搬箱子。" } ],
    qin:   [ { room:"cyard", x:90, pose:"cry", doing:"站在辦公室外面，不敢進去，手上捏著一條毛巾。" }, { room:"coffice", x:40, pose:"stand", doing:"站在門後，摸著那件外套。" } ],
    kun:   [ { room:"iceplant", x:80, pose:"stand", doing:"在製冰廠門口抽菸，看著對面的封鎖線。" }, { room:"iceplant", x:60, pose:"stand", doing:"在搬冰，手套上都是冰屑。" } ],
    cap:   [ null, { room:"pboat", x:110, pose:"stand", doing:"在船上補網，嘴裡叼著一根沒點的菸。" }, { room:"pboat", x:110, pose:"stand", doing:"在船頭擦欄杆。" } ],
    yan:   [ null, { room:"pboat", x:30, pose:"type", doing:"坐在木箱旁邊剪片，筆電上是昨晚的直播。" } ],
    hai:   [ null, { room:"tmain", x:120, pose:"stand", doing:"在廟裡幫忙搬遶境的旗子，臉色很差。" }, { room:"tmain", x:120, pose:"stand", doing:"在廟裡綁旗子。" } ],
    longshu:[ null, { room:"foffice", x:120, pose:"sit", doing:"坐在辦公桌後面泡茶，茶杯有一個缺口。" } ],
    miao:  [ null, { room:"tmain", x:60, pose:"broom", doing:"在掃金爐旁邊的地。" } ],
    qian:  [ null, { room:"mroom", x:90, pose:"stand", doing:"站在解剖台旁邊擦眼鏡，收音機開得很小聲。" } ],
    xu:    [ { room:"coffice", x:110, pose:"kneel", doing:"蹲在屍體旁邊，用棉棒沾地上的水。" }, { x:40, pose:"read", doing:"在實驗台前面，手還在抖。" } ],
    wu:    [ { room:"cfreezer", x:70, pose:"stand", doing:"穿著防寒衣，眼鏡上全是霧。" }, { x:110, pose:"stand", doing:"在電腦前面整理照片。" }, { room:"pdesk", x:80, pose:"read", doing:"抱著一疊剛到的調閱資料。" } ],
    kang:  [ { room:"cfreezer", x:150, pose:"stand", doing:"牽著豆花，站在冷凍庫的角落。" }, { room:"cyard", x:150, pose:"stand", doing:"豆花趴在她腳邊，咬著一條鞋帶。" } ],
    zhou:  [ null, { room:"pdesk", x:140, pose:"stand", doing:"站在你的桌子旁邊，看了一下手錶。" }, { room:"pdesk", x:140, pose:"phone", doing:"走到窗邊講電話。" } ]
  };
  EP16.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP16.rooms = {
    coldstore: [
      { id:"cyard", name:"院子", scene:"c16_yard", opt:(ph) => ({ jack:ph === 0 ? "office" : "freezer", tape:ph === 0, car:ph === 0, fog:ph === 0 }), details:[
        { id:"d16_bucket", name:"水桶", hot:[78,76,14,10], text:"一個藍色水桶，裡面泡著一支拖把。水是冰的，浮著幾片魚鱗——這是沖院子用的。" },
        { id:"d16_lamp", name:"路燈", hot:[2,0,14,8], text:"院子的路燈燈罩裂了一角，燈泡是新換的。阿雄說：「老闆說晚上一定要亮，不然會有人來偷魚。」" },
        { id:"d16_wall", name:"浪板牆", hot:[130,40,10,30], text:"浪板牆上用噴漆寫著「永福冷鏈　三十年」，最後一個字的漆已經掉了一半。" } ] },
      { id:"coffice", name:"辦公室", scene:"c16_office", opt:(ph) => ({ body:ph === 0, wet:ph === 0, heater:ph === 0, fog:ph === 0, tape:ph === 0 }), details:[
        { id:"d16_price", name:"牆上的漁價表", hot:[84,14,30,22], text:"手寫的漁價表，每天更新。10/15 那一行：「白帶 280↓　鯖魚 45↓」，旁邊畫了一個哭臉。" },
        { id:"d16_photo", name:"舊照片", hot:[124,18,22,16], text:"一張褪色的照片：一艘漁船，船頭站著兩個年輕人，一個是蔡永福，另一個白頭髮還是黑的——龍叔。" },
        { id:"d16_phone", name:"桌上的電話", hot:[92,52,8,6], text:"老式的轉盤電話，旁邊貼著一張便條：「阿琴　0912……」，字跡很大，像怕自己忘記。" },
        { id:"d16_pc", name:"電腦", hot:[76,48,14,10], text:"電腦的螢幕保護程式是一條白帶魚在游。桌布是一張全家福。" } ] },
      { id:"cfreezer", name:"冷凍庫", scene:"c16_freezer", opt:(ph) => ({ bump:ph === 0, scrape:ph === 0 }), details:[
        { id:"d16_tube", name:"天花板的燈", hot:[36,0,32,8], text:"燈管外面包著一層防爆罩，罩子上結了一層薄薄的霜。" },
        { id:"d16_frost", name:"結霜的柱子", hot:[2,10,6,40], text:"鐵柱上的霜厚得像糖霜。小吳用手指寫了「好冷」兩個字，五分鐘就被新的霜蓋掉了。" },
        { id:"d16_thermo", name:"牆角的溫度計", hot:[24,82,12,6], text:"地上一支掉下來的溫度計，指著 -25。不知道是誰掉的，已經凍在地上了。" } ] },
      { id:"clocker", name:"更衣室", scene:"c16_locker", details:[
        { id:"d16_mirror", name:"鏡子", hot:[30,20,24,20], text:"鏡子上貼著一張便條：「出庫前檢查防寒衣拉鍊！」字是蔡永福寫的。" },
        { id:"d16_bench", name:"長椅", hot:[8,78,20,10], text:"長椅上丟著一雙破掉的工作手套和一份昨天的報紙，報紙停在漁獲行情那一版。" },
        { id:"d16_lockerC", name:"寫著「蔡」的櫃子", hot:[66,30,18,30], text:"老闆的櫃子裡只有一件舊的防水夾克，和一盒沒拆的胃藥。" } ] },
      { id:"iceplant", name:"對面製冰廠", scene:"c16_ice", details:[
        { id:"d16_bags", name:"冰袋", hot:[6,64,26,12], text:"一袋一袋的碎冰排在門口，每一袋都寫著船名。今天早上的最上面一袋寫著「金滿意」。" },
        { id:"d16_belt", name:"輸送帶", hot:[60,62,40,12], text:"冰塊從輸送帶上一塊一塊滑下來，叮叮咚咚。阿坤說，聽久了會像下雨。" } ] }
    ],
    police: [ { id:"pdesk", name:"澄港市刑大", scene:"police", details:[
      { id:"d16_coffee", name:"你桌上的咖啡", hot:[60,62,10,8], text:"周振邦放的熱咖啡。杯子上寫著「海風咖啡」，還是熱的。" } ] } ],
    lab: [ { id:"lab", name:"鑑識中心", scene:"lab", details:[
      { id:"d16_uv", name:"桌上的放大鏡", hot:[140,20,20,14], text:"放大鏡底下壓著三片魚鱗，標籤上寫著「屍體底下　#1–#3」。" } ] } ],
    morgue: [ { id:"mroom", name:"法醫室", scene:"m13_morgue", details:[
      { id:"d16_radio", name:"收音機", hot:[20,40,12,8], text:"收音機在放〈甜蜜蜜〉。老錢說：「冷凍的人，聽一點甜的。」" } ] } ],
    pier: [ { id:"pboat", name:"順興六號", scene:"c16_pier", details:[
      { id:"d16_rods", name:"釣竿架", hot:[38,42,70,14], text:"釣竿架上插著七八支釣竿，每一支都綁著不同顏色的膠帶，是客人的記號。洪國華那支綁的是黃色。" },
      { id:"d16_bollard", name:"繫船柱", hot:[4,76,10,10], text:"繫船柱上的纜繩綁成一個漂亮的結。林船長說，綁結是討海人的第一課。" } ] } ],
    temple: [ { id:"tmain", name:"媽祖廟正殿", scene:"c16_temple", details:[
      { id:"d16_lantern", name:"燈籠", hot:[8,4,16,24], text:"燈籠上寫著「合境平安」。其中一個破了一個洞，廟公說遶境前要換。" },
      { id:"d16_shrine", name:"神龕", hot:[74,12,44,32], text:"媽祖的金身前面，供著一盤新鮮的鯖魚。廟公說是漁民早上送來的。" } ] } ],
    fishmkt: [ { id:"foffice", name:"龍叔的辦公室", scene:"c16_fish", details:[
      { id:"d16_icefish", name:"冰台上的魚", hot:[2,52,76,14], text:"冰台上一排白帶魚，每一條都一樣長。旁邊的小牌子：「海龍　今日　280」。" },
      { id:"d16_boatpic", name:"漁船的照片", hot:[160,16,20,14], text:"一張老照片：「海龍號　1996」。照片上的年輕人裡，有一個很像蔡永福。" } ] } ]
  };
  const PS = [["c16_office",{ body:true, wet:true, heater:true, fog:true, tape:true }],["police",{}],["police",{}]];
  EP16.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 監視器動畫 ---------- */
  const caiL = { skin:"#d8b090", hair:"#a8a8a0", hairStyle:"balding", top:"#5a7a5a", bottom:"#3a3a40" };
  EP16.looks = {
    hongC: Object.assign({}, LOOK.hong, { hello:undefined, mood:undefined }), xiongC: Object.assign({}, LOOK.xiong, { hello:undefined, mood:undefined }),
    haiC: Object.assign({}, LOOK.hai, { hello:undefined }), hai2C: { skin:"#c89a70", hair:"#1a1410", hairStyle:"short", top:"#3a3a3e", bottom:"#2a2a30" },
    shadowC: { skin:"#3a3a40", hair:"#1a1a1e", hairStyle:"short", top:"#22262e", coat:"#1e2228", bottom:"#1a1a1e" }, caiC: caiL, caiX: Object.assign({}, caiL, { mood:"angry" })
  };
  const ANIM = {
    cctv16_ice: { scene:"c16_yard", opt:{ cam:true }, cam:"澄港製冰 CAM1", date:"2026-10-15", beats:[
      { t:"18:00:10", d:4.5, cap:"兩個男人站在院子裡，跟蔡永福比手畫腳。戴金項鍊的那個指著冷凍庫大聲說話。", st:{ jack:"freezer" }, m:{ caiX:[70,94,"stand",1], haiC:[100,94,"point",-1], hai2C:[118,96,"cross",-1] } },
      { t:"18:08:00", d:3.5, cap:"18:08，兩人走出鐵門，開車離開。", st:{ jack:"freezer" }, m:{ caiX:[70,94,"stand",1], haiC:[-20,94,"walk1",-1,100,94], hai2C:[-36,96,"walk2",-1,118,96] }, out:["haiC","hai2C"] },
      { t:"18:10:20", d:3, cap:"18:10，吳志雄牽機車出去。", st:{ jack:"freezer" }, m:{ caiX:[112,90,"walk1",1,70,94], xiongC:[-20,96,"walk2",-1,150,96] }, out:["caiX","xiongC"] },
      { t:"19:05:00", d:4, cap:"19:05，蔡永福提著一個便當袋，從鐵門走回辦公室。", date:"2026-10-15", st:{ jack:"freezer", night:true, lit:true }, m:{ caiC:[112,90,"carry@bag",1,-20,94] }, out:["caiC"] },
      { t:"20:41:30", d:4.5, cap:"20:41，一個穿防水夾克的男人從鐵門側邊走進來，進了辦公室。", st:{ jack:"freezer", night:true, lit:true }, m:{ hongC:[112,90,"walk1",1,-20,94] }, out:["hongC"] },
      { t:"21:05:10", d:5, cap:"21:05，有人從辦公室推出拖板車，上面蓋著藍色帆布，推到冷凍庫門口。太暗，看不清楚臉。", st:{ jack:false, night:true, lit:true }, m:{ shadowC:[150,94,"push@cart/#3a6ac8",1,112,92] } },
      { t:"21:05:40", d:3, join:true, cap:"門開了，他推進去。", st:{ jack:false, night:true, lit:true, flamp:true }, m:{ shadowC:[170,86,"push@cart/#3a6ac8",1,150,94] }, out:["shadowC"] },
      { t:"21:09:40", d:3.5, cap:"21:09，拖板車空著推出來，停在冷凍庫門口。", st:{ jack:"freezer", night:true, lit:true, flamp:true }, m:{ shadowC:[150,94,"walk2",-1,170,86] } },
      { t:"21:14:00", d:4, cap:"21:14，穿防水夾克的男人提著一個袋子，從鐵門側邊走出去，往碼頭的方向。", st:{ jack:"freezer", night:true, lit:true }, m:{ hongC:[-20,94,"carry@bag",-1,150,94] }, out:["hongC"] },
      { t:"02:00:00", d:3, cap:"21:15 到 04:37，院子裡沒有人。辦公室的燈一直亮著。", date:"2026-10-16", st:{ jack:"freezer", night:true, lit:true } },
      { t:"04:38:30", d:4.5, cap:"04:38，一個男人走到冷凍庫門口刷卡。門上的燈照到他的臉：洪國華。", date:"2026-10-16", st:{ jack:"freezer", night:true, lit:true, flamp:true }, m:{ hongC:[146,92,"door",1,-20,94] } },
      { t:"04:41:00", d:5, cap:"04:41，他推著拖板車出來，上面蓋著藍色帆布，推到辦公室門口，進去。", date:"2026-10-16", st:{ jack:false, night:true, lit:true, flamp:true }, m:{ hongC:[112,92,"push@cart/#3a6ac8",-1,170,86,[[150,94]]] }, out:["hongC"] },
      { t:"04:50:20", d:4, cap:"04:50，他一個人走出辦公室，拖板車留在門口。辦公室的窗戶慢慢變成橘色。", date:"2026-10-16", st:{ jack:"office", night:true, heater:true }, m:{ hongC:[-20,94,"walk1",-1,112,92] }, out:["hongC"] },
      { t:"05:02:00", d:3, cap:"05:02，一台白色休旅車從鐵門外開走。", date:"2026-10-16", st:{ jack:"office", night:true, heater:true, car:true } },
      { t:"06:05:00", d:4, cap:"06:05，吳志雄騎機車到，開鐵門。", date:"2026-10-16", st:{ jack:"office", heater:true, fog:true }, m:{ xiongC:[60,94,"walk1",1,-20,94] } }
    ] }
  };
  Object.values(ANIM).forEach(A => { if (A.beats.some(b => b.st)) A.opt = Object.assign({}, A.opt || {}, { seq:A.beats.map(b => Object.assign({}, A.opt || {}, b.st || {})), ds:jds(A.beats) }); });
  [...EP16.cctv, ...EP16.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案 ---------- */
  const RB = [
    { t:"20:41:30", d:5, cap:"10 月 15 日 20:41，洪國華走進辦公室。蔡永福坐在桌子後面，桌上攤著那封信。", st:{ heater:false, weight:true }, m:{ caiC:[100,90,"sit",-1], hongC:[60,94,"walk1",1,-20,94] } },
    { t:"20:55:00", d:5, cap:"他求他再寬限半年。蔡永福站起來：「二十年了，我給你台階，你給我什麼？你跟你兒子一樣，都是廢物。」", st:{ heater:false, weight:true }, m:{ caiX:[108,94,"point",-1], hongC:[150,94,"stand",-1,60,94] }, out:["caiC"] },
    { t:"21:00:00", d:4.5, cap:"蔡永福轉過身去打電話。洪國華從磅秤上拿下五公斤的秤錘。", st:{ heater:false, weight:false }, m:{ caiX:[96,94,"phone",-1,108,94], hongC:[118,94,"hold@weight",-1,176,94] } },
    { t:"21:00:30", d:4.5, cap:"他從背後打了一下。", st:{ heater:false, weight:false }, m:{ caiX:[92,94,["stumble","prone","prone","prone"],-1], hongC:[106,94,"strike@weight",-1] }, out:["caiX"] },
    { t:"21:05:10", d:5, cap:"21:05，他把蔡永福抬上拖板車，蓋上藍色帆布，用自己的卡打開冷凍庫，推進去，放在門口的棧板前面。秤錘塞進一箱碎冰底下。", scene:"c16_yard", opt:{ night:true, lit:true, jack:false, flamp:true }, m:{ hongC:[170,86,"push@cart/#3a6ac8",1,112,92,[[150,94]]] }, out:["hongC"] },
    { t:"21:14:00", d:4.5, cap:"21:14，他換掉沾了血的雨鞋，穿著球鞋跑向碼頭。21:28，他跳上順興六號——遲到、滿身大汗。", scene:"c16_yard", opt:{ night:true, lit:true, jack:"freezer" }, m:{ hongC:[-20,94,"carry@bag",-1,150,94] }, out:["hongC"] },
    { t:"03:50:00", d:4.5, date:"2026-10-16", cap:"整晚，他都在船上，一船的人和一段直播都看得到他。03:50 靠岸，他說「回去拿冰」。", scene:"c16_pier", opt:{ night:true } },
    { t:"04:38:30", d:5, date:"2026-10-16", cap:"04:38，他再打開冷凍庫。凍了七個多小時的人，被推回辦公室。", scene:"c16_yard", opt:{ night:true, lit:true, jack:false, flamp:true }, m:{ hongC:[112,92,"push@cart/#3a6ac8",-1,170,86,[[150,94]]] }, out:["hongC"] },
    { t:"04:50:00", d:5, date:"2026-10-16", cap:"他把人擺在桌角旁邊，像跌倒撞到頭；把電暖器開到最大，關上門。", st:{ heater:true, weight:false, body:true }, m:{ hongC:[150,94,"reach",-1,40,94] } },
    { t:"06:10:00", d:4.5, date:"2026-10-16", cap:"06:10，吳志雄打開門。屋裡熱得像三溫暖——退了冰的身體，看起來就像凌晨兩三點才死。", st:{ heater:true, weight:false, body:true, wet:true, fog:true }, m:{ xiongC:[30,94,"stand",1,-20,94] } }
  ];
  EP16.court = {
    title: "刑大偵訊室・10 月 17 日中午", scene: "police",
    who: ph => ["hong","xiong","qin","hai","longshu","cap"],
    open: ph => "11:50，刑大的偵訊室。洪國華坐在桌子的一邊，兩隻腳縮在椅子底下。林秀琴坐在門邊，手上還捏著那條毛巾。周振邦靠在牆上，看了一下手錶。",
    kindLine: {
      accident: "蔡永福是自己跌倒，頭撞到桌角死的。",
      murder: "蔡永福不是自己跌倒的。有人打了他的頭。"
    },
    murmur: [ "（林秀琴把毛巾捏得更緊了。）", "（洪國華把腳往椅子底下又縮了一點。）", "（周振邦看了一下手錶，沒有說話。）" ],
    confess: {
      hong: [ "他說，我兒子跟我一樣，都是廢物。我手上剛好拿著那個秤錘……我只打了一下。一下。", "我把他推進冷凍庫的時候，他還熱熱的。我一路上船，一直在想，他會不會冷。", "我兒子什麼都不知道。不要去找他。……拜託你們。" ]
    },
    cornered: { hong: "二十年……二十年，他要告我。我能怎麼辦？" },
    deny: {
      xiong: "我只是第一個來上班的……",
      qin: "……他是我先生。",
      hai: "我說了，我七點就在廟裡！",
      longshu: "年輕人，冤有頭，債有主。",
      cap: "國華整晚都在我的船上啊……"
    },
    replayText: "10 月 15 日晚上 20:41，永福冷鏈的辦公室。蔡永福桌上攤著一封信——",
    replay: { scene:"c16_office", opt:{ seq:RB.map(b => b.st || {}), ds:jds(RB) }, clean:true, cam:"案發經過重現", date:"2026-10-15", beats:RB },
    endGood: "12:00，檢察官聲請羈押，法官准了。\n洪國華被帶走的時候，經過製冰廠，阿坤站在門口，手上拿著兩包冰，不知道要不要遞給他。\n傍晚，林秀琴在辦公室的摺疊床上坐了很久。她說，下個月遶境，那一千斤冰她還是會捐。",
    endBad: "12:00，案子以「意外跌倒」結案。\n洪國華接手了永福冷鏈。冷凍庫的門禁卡，他換了一張新的。\n林秀琴每天早上都去碼頭，看著順興六號出海。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[16] && ARC_INTER[16].after) EP16.after = Object.assign({}, ARC_INTER[16].after, { scene:"c16_pier", opt:{ dusk:true } });

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP16.outScenes = ["c16_yard","c16_pier"];
  EP16.fac = { coldstore:["#c8ccd0","#1a3a6a"], police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], morgue:["#d8e0e0","#5a7a8a"], pier:["#e8e4d8","#c83a2a"], temple:["#8a2a1a","#e8c060"], fishmkt:["#d8d4c8","#c83a2a"] };
  EP16.setting = { coldstore:"town", police:"city", lab:"city", morgue:"city", pier:"town", temple:"town", fishmkt:"town" };
  const SKY16 = [ ["#8ab0d0","#e8eef4","#5a7080","#56707a",0,0], ["#9ac0e0","#f0e8d8","#4a6070","#56707a",0,0], ["#9ac0e0","#f0e8d8","#4a6070","#56707a",0,0] ];
  EP16.worldSky = ph => SKY16[Math.min(ph || 0, SKY16.length - 1)];
  EP16.roomDesc = {
    cyard:"永福冷鏈的院子。左邊是鐵門，中間是辦公室，右邊是冷凍庫的大門。", coffice:"老闆的辦公室。很小，一台老磅秤靠在牆邊。", cfreezer:"冷凍庫。零下二十五度，呼出來的氣馬上變白。", clocker:"員工的更衣室。",
    iceplant:"對面的澄港製冰。機器轟轟地響。", pdesk:"澄港市刑大。", lab:"鑑識中心。", mroom:"法醫室。收音機在放老歌。",
    pboat:"夜釣船順興六號，停在 3 號碼頭。", tmain:"漁港媽祖廟的正殿，在準備下個月的遶境。", foffice:"漁港魚市裡，海龍漁業的辦公室。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police" };
  const EMT = { skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#e8763a", bottom:"#2a2a30" };
  EP16.world = {};
  EP16.locations.forEach(l => { EP16.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP16.world.coldstore, {
    extras: [
      { id:"cop16", name:"轄區員警", phase:0, until:0, x:RX(0) + 40, L:COP, pose:"stand", facing:1, lines:[
        "06:25 我們到的時候，辦公室熱得不得了，我們先把電暖器關掉了。……是不是不該關？", "院子裡那台拖板車我們沒動。冷凍庫也還沒有人進去過。" ] },
      { id:"emt16", name:"救護員", phase:0, until:0, x:RX(0) + 80, L:EMT, pose:"stand", facing:-1, lines:[
        "06:20 到場，已經沒有呼吸心跳。身體摸起來……很奇怪，表面熱熱的，貼地的那面卻是冰的。", "我們沒有搬動他。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長，死者蔡永福，永福冷鏈的老闆。員工六點十分打開辦公室，他倒在桌角旁邊，頭上有傷。", "小吳"),
      say("wu", "電暖器開到最大，屋裡三十五度。許前輩說，現場量體溫、看屍僵，推出來是凌晨兩點到四點。", "小吳"),
      say("wu", "外面已經有人在說，是昨天來吵架的海龍會幹的……", "小吳"),
      say("you", "十月開電暖器。……先看看。", "你"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  EP16.mapPos = { coldstore:[110,70,"u"], police:[190,40,"r"], lab:[206,58,"d"], morgue:[214,80,"r"], pier:[80,96,"d"], temple:[60,50,"l"], fishmkt:[140,96,"d"] };
  EP16.mapRoads = [["coldstore","pier"],["coldstore","temple"],["coldstore","fishmkt"],["coldstore","police"],["police","lab"],["lab","morgue"],["pier","fishmkt"]];
  EP16.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 20; x < 230; x += 8) for (let y = 14; y < 90; y += 7){ R(x, y, 6, 5, "#c8c0b0"); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, "#b0a898"); }
    R(0, 100, 240, 35, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 102 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");
    for (let k = 0; k < 4; k++) R(50 + k * 30, 96, 4, 8, "#7a7266");   // 碼頭
    R(70, 104, 20, 5, "#e8e4d8"); R(70, 103, 20, 1, "#c83a2a");   // 漁船
    R(104, 64, 14, 8, "#c8ccd0"); R(106, 65, 10, 2, "#1a3a6a");   // 冷凍倉庫
    R(54, 44, 12, 8, "#8a2a1a"); R(56, 42, 8, 2, "#e8c060");   // 廟
  };
})();
