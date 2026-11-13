/* =========================================================
   第 25 集：像素畫、人物造型、結案、走動畫面、地圖、開場
   ========================================================= */
EP25.art = true;
(() => {
  const PR = PX.prim, { R, P, INK } = PR;
  const W = 192, H = 108;
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i] = beatAt(o.t || 0, o.ds); return (o.seq || [])[i] || {}; };
  const glow = (x, y, r, rgb, a) => { for (let k = r; k > 0; k -= 2){ const al = Math.round(a * (1 - k / r) * 255).toString(16).padStart(2, "0"); R(x - k, y - k * 0.7, k * 2, k * 1.4, rgb + al); } };
  const tiles = (y, c, l) => { R(0, y, W, H - y, c); for (let x = 0; x < W; x += 12) R(x, y, 1, H - y, l); for (let yy = y; yy < H; yy += 6) R(0, yy, W, 1, l); };
  const lamp = x => { R(x, 2, 30, 3, "#f4f0dc"); glow(x + 15, 8, 16, "#fff8e0", 0.16); };
  const rainOver = (n, c) => { for (let k = 0; k < n; k++){ const x = (k * 37 + 11) % W, y = (k * 53 + 7) % 90; R(x, y, 1, 4, c); } };

  /* ---------- 刑大三樓小會議室：長桌（卷宗、值班表、影本）、投影幕上的舊照片、白板、窗外 ---------- */
  SC.c25_meet = (o) => { o = Object.assign({}, o, stOf(o)); const rain = !!o.rain;
    R(0, 0, W, 86, "#cfcabb"); R(0, 56, W, 30, "#b8b2a2"); R(0, 55, W, 1, "#9a947f"); lamp(40); lamp(120);
    R(4, 14, 22, 30, "#6a6252"); R(6, 16, 18, 26, rain ? "#5a6a7a" : "#9cc5e6"); R(14, 16, 1, 26, "#6a6252"); if (rain) rainOver(10, "#a8b8c8");
    // 投影幕和照片
    R(104, 12, 42, 34, "#f4f4f0"); R(104, 10, 42, 2, "#5a5a5a"); R(110, 20, 30, 22, "#b8a888");
    R(110, 34, 30, 8, "#8a8070"); R(112, 36, 26, 1, "#a09888"); R(114, 38, 22, 1, "#a09888");   // 照片裡的台階
    const fig = (x, y, c, face) => { R(x, y, 4, 4, face || "#e0b898"); R(x - 1, y + 4, 6, 7, c); };
    fig(129, 24, "#3a4250"); P(133, 27, "#e8e4da"); fig(122, 22, "#5a5a6a", "#f4f4f0"); fig(134, 28, "#4a4a5a"); fig(116, 31, "#6a5a4a");
    txt("'11 3 17", 130, 41, "#f08a2a", "3px monospace");
    // 白板
    R(150, 18, 34, 26, "#f8f8f4"); R(150, 18, 34, 1, "#9a9a9a"); txt("2011/3/17", 153, 27, "#2a4a8a", "5px sans-serif"); txt("21:4x", 156, 35, "#c83a2a", "6px sans-serif");
    // 長桌和桌上的東西
    R(20, 60, 150, 6, "#7a5a3a"); R(20, 60, 150, 1, "#9a7a5a"); for (const x of [26, 160]) R(x, 66, 4, 20, "#5a3a2a");
    R(30, 55, 18, 5, "#f4f0e4"); R(31, 56, 14, 1, "#6a6a7a");   // 值班表
    R(48, 54, 16, 6, "#e8e0c8"); R(49, 55, 12, 1, "#5a5a6a"); if (!o.noArmory) R(52, 53, 8, 1, "#c83a2a");   // 槍械室的帳
    R(64, 52, 24, 8, "#c8a870"); R(64, 52, 24, 2, "#a88850"); R(66, 55, 20, 1, "#e8e0c8"); R(66, 57, 16, 1, "#e8e0c8");   // 卷宗
    R(92, 54, 18, 6, "#e8e4d8"); R(93, 55, 14, 1, "#5a5a6a"); R(106, 53, 3, 3, "#e8c040");   // 勤務紀錄（折角）
    R(120, 56, 8, 4, "#2a2a2e"); R(118, 59, 12, 1, "#3a3a3e");   // 投影機
    R(140, 54, 6, 6, "#f4f4f0"); R(141, 53, 4, 1, "#7a4a2a");   // 咖啡
    for (const x of [40, 80, 120]) { R(x, 68, 14, 4, "#3a4250"); R(x + 2, 72, 2, 14, "#2a2e36"); R(x + 10, 72, 2, 14, "#2a2e36"); }
    tiles(86, "#9a9a90", "#8a8a80");
  };

  /* ---------- 法醫中心・老錢的教學室：標本櫃、桌上的筆記本、頭骨模型、黑板、牆上的合照 ---------- */
  SC.c25_qian = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#d8dcd4"); R(0, 60, W, 26, "#b8c0b8"); R(0, 59, W, 1, "#98a098"); lamp(80);
    // 標本櫃
    R(8, 10, 52, 76, "#6a5a48"); R(10, 12, 48, 72, "#a8b8b8"); for (let s = 0; s < 3; s++){ R(10, 40 + s * 15, 48, 2, "#5a4a38"); for (let b = 0; b < 5; b++) if (!(s === 0 && b === 2)) { R(13 + b * 9, 28 + s * 15, 6, 11, "#c8d8c0"); R(13 + b * 9, 27 + s * 15, 6, 2, "#8a7a68"); R(14 + b * 9, 33 + s * 15, 4, 4, ["#c8a888","#a8a898","#d8c8a8"][(b + s) % 3]); } }
    R(30, 26, 12, 14, "#e8f0f4"); R(30, 25, 12, 2, "#8a7a68"); R(32, 30, 8, 3, "#f4f0e4"); R(34, 36, 4, 2, "#5a5a5e");   // #11-03（最上層，最前面）
    // 黑板
    R(70, 12, 60, 34, "#2a4a3a"); R(70, 12, 60, 2, "#8a6a4a"); R(70, 44, 60, 2, "#8a6a4a"); R(76, 20, 24, 1, "#e8e8e0"); R(76, 26, 34, 1, "#e8e8e0"); R(76, 32, 18, 1, "#e8e8e0"); R(104, 22, 16, 14, "#3a5a4a"); R(108, 24, 8, 8, "#e8e8e0"); R(110, 26, 4, 4, "#2a4a3a");   // 黑板上畫著頭骨和角度
    // 牆上的合照
    for (let k = 0; k < 2; k++){ R(160, 20 + k * 0, 20, 16, "#5a4a3a"); } R(161, 21, 18, 14, "#c8c0a8"); for (let i = 0; i < 5; i++) R(163 + i * 3, 27, 2, 5, "#4a4a5a");
    // 桌子
    R(80, 64, 90, 5, "#8a6a4a"); R(80, 64, 90, 1, "#a88a6a"); for (const x of [84, 164]) R(x, 69, 4, 17, "#6a4a2a");
    R(94, 57, 18, 7, "#4a3a2a"); R(96, 58, 14, 5, "#e8e0c8"); R(102, 58, 1, 5, "#4a3a2a");   // 筆記本
    R(134, 52, 10, 10, "#ece4d0"); R(135, 54, 3, 3, "#2a2a2a"); R(140, 54, 3, 3, "#2a2a2a"); R(136, 58, 6, 3, "#d8d0bc"); R(130, 62, 18, 2, "#5a5a5e"); R(131, 50, 14, 1, "#c8c8d0"); R(144, 56, 4, 1, "#c8c8d0");   // 頭骨模型和金屬棒
    R(116, 58, 8, 6, "#f4f4f0"); R(117, 57, 6, 1, "#7a4a2a");   // 茶杯
    R(112, 66, 16, 3, "#3a3a40"); R(126, 50, 3, 16, "#3a3a40"); R(119, 69, 2, 12, "#5a5a60"); R(113, 81, 14, 2, "#3a3a40");   // 老錢的椅子
    tiles(86, "#a8aca4", "#989c94");
  };

  /* ---------- 舅媽家：老公寓客廳，獎狀、神明桌和遺照、茶几上的存摺、角落的紙箱、窗外 ---------- */
  SC.c25_aunt = (o) => { o = Object.assign({}, o, stOf(o)); const rain = !!o.rain;
    R(0, 0, W, 86, "#e0d4b8"); R(0, 62, W, 24, "#c8b898"); R(0, 61, W, 1, "#a89878"); R(0, 0, W, 4, "#c8bca0");
    R(24, 24, 20, 16, "#8a6a3a"); R(25, 25, 18, 14, "#f4ecd0"); R(27, 27, 14, 2, "#c83a2a"); R(28, 31, 12, 1, "#6a5a4a"); R(28, 34, 8, 4, "#8ab0c8"); R(30, 34, 2, 4, "#3a3a4a");   // 獎狀和照片
    // 神明桌
    R(62, 54, 30, 32, "#7a2a1a"); R(62, 54, 30, 3, "#9a3a2a"); R(66, 30, 22, 26, "#5a1a10"); R(70, 32, 14, 18, "#2a2a2a"); R(72, 34, 10, 14, "#3a4a6a"); R(74, 36, 6, 6, "#e0b898"); R(74, 35, 6, 2, "#2a2220"); R(73, 42, 8, 6, "#3a4a6a");   // 遺照
    R(76, 50, 4, 4, "#f4f4f0"); R(77, 49, 2, 1, "#c89a4a"); R(66, 48, 2, 6, "#c83a2a"); R(86, 48, 2, 6, "#c83a2a"); P(67, 47, "#ffd040"); P(87, 47, "#ffd040");
    // 窗
    R(110, 12, 34, 30, "#6a5a48"); R(112, 14, 30, 26, rain ? "#6a7a8a" : "#a8c8d8"); R(127, 14, 1, 26, "#6a5a48"); for (let k = 0; k < 4; k++) R(112, 18 + k * 6, 30, 1, "#8a7a68"); if (rain) rainOver(8, "#c8d8e8");
    // 沙發、茶几、存摺
    R(150, 46, 40, 20, "#7a3a2a"); R(148, 64, 44, 6, "#8a4a3a"); R(146, 58, 4, 12, "#6a2a1a"); R(188, 58, 4, 12, "#6a2a1a"); R(151, 70, 3, 16, "#4a2a1a"); R(185, 70, 3, 16, "#4a2a1a"); R(152, 64, 14, 1, "#9a5a4a");   // 沙發（左邊那格塌下去）
    R(94, 66, 34, 4, "#6a4a2a"); R(98, 70, 3, 16, "#5a3a1a"); R(122, 70, 3, 16, "#5a3a1a"); R(100, 60, 14, 6, "#2a6a3a"); R(102, 62, 10, 1, "#e8e0c8");   // 存摺
    R(116, 60, 6, 6, "#f4f4f0"); R(117, 59, 4, 1, "#7a5a2a");
    // 紙箱
    R(30, 70, 22, 16, "#b8946a"); R(30, 70, 22, 2, "#d8b48a"); R(40, 70, 2, 16, "#e8d088"); R(30, 76, 22, 1, "#a8845a");
    tiles(86, "#9a7a5a", "#8a6a4a");
  };

  /* ---------- 舊分局原址（社區圖書館）：門廊、三級台階、門檻、騎樓柱、欒樹、歷史建築的牌子 ---------- */
  SC.c25_site = (o) => { o = Object.assign({}, o, stOf(o)); const rain = o.rain !== false, night = !!o.night;
    R(0, 0, W, 20, night ? "#0b0f1c" : rain ? "#7a8490" : "#a8c8e0");
    // 建築立面
    R(30, 6, 162, 80, night ? "#5a564a" : "#b8ac90"); for (let y = 10; y < 86; y += 5) for (let x = 30 + (y / 5 % 2) * 6; x < 192; x += 12) R(x, y, 11, 1, night ? "#4a463a" : "#a89c80");
    R(30, 6, 162, 4, night ? "#3a362a" : "#8a7e62"); if (o.old) txt("澄港分局", 92, 18, night ? "#c8c0a0" : "#5a4a3a", "6px sans-serif"); else { R(84, 11, 34, 9, "#3a5a4a"); R(85, 12, 32, 7, "#4a6a5a"); for (let k = 0; k < 5; k++) R(88 + k * 6, 14, 4, 3, "#e8e4d0"); }   // 圖書館的招牌
    for (const x of [44, 150]) { R(x, 22, 8, 64, night ? "#6a665a" : "#d8ccb0"); R(x, 22, 8, 2, night ? "#7a766a" : "#e8dcc0"); R(x - 1, 82, 10, 4, night ? "#4a463a" : "#a89c80"); }   // 騎樓柱
    R(80, 28, 40, 44, night ? "#2a2a2a" : "#5a4a3a"); R(82, 30, 36, 42, night ? (o.old ? "#3a3426" : "#1a1a1a") : o.old ? "#7a6a4a" : "#a8c8d0"); R(100, 30, 1, 42, night ? "#1a1a1a" : "#5a4a3a"); if (night && o.old) glow(100, 40, 20, "#ffe8a0", 0.18);   // 大門
    R(76, 70, 48, 4, night ? "#8a8676" : "#c8c4b4");   // 門檻
    R(66, 74, 70, 4, night ? "#7a7666" : "#bcb8a8"); R(62, 78, 78, 4, night ? "#6a6656" : "#b0ac9c"); R(58, 82, 86, 4, night ? "#5a5646" : "#a4a090");   // 三級台階
    if (!o.old){ R(150, 44, 18, 12, "#3a3a3a"); R(151, 45, 16, 10, "#c8a838"); R(153, 48, 12, 1, "#3a3a3a"); R(153, 51, 8, 1, "#3a3a3a"); R(156, 57, 6, 3, "#f4f4f0"); P(157, 56, "#e8e8f0"); }   // 歷史建築的牌子和白花
    // 欒樹（樹幹、樹枝、紅褐色的蒴果）
    R(10, 30, 5, 56, "#5a3a24"); for (let k = 0; k < 6; k++) R(2 + k * 4, 20 + (k % 3) * 4, 3, 12, "#5a3a24"); R(0, 18, 28, 4, "#6a4a2a");
    for (let k = 0; k < 10; k++) R((k * 7) % 28, 14 + (k * 5) % 10, 3, 3, night ? "#5a3020" : "#b0603a");
    // 地面：騎樓的磚和人行道
    R(0, 86, W, 22, night ? "#3a3830" : "#8a8070"); for (let x = 0; x < W; x += 10) R(x, 86, 1, 22, night ? "#2a2820" : "#7a7060"); for (let y = 90; y < H; y += 5) R(0, y, W, 1, night ? "#2a2820" : "#7a7060");
    for (let k = 0; k < 8; k++) R((k * 23 + 4) % 180, 88 + (k * 3) % 14, 3, 1, night ? "#6a4020" : "#9a6a3a");   // 磚縫裡的枯葉
    if (o.wet || rain) for (let k = 0; k < 6; k++) R((k * 31 + 9) % 180, 92 + (k * 5) % 12, 10, 1, "#c8d0d860");
    if (o.recon){ R(97, 69, 3, 1, "#e8e0d0"); R(98, 40, 1, 29, "#c8c0b0"); for (let k = 0; k <= 34; k++) P(98 + k, Math.round(40 + k * 0.27), "#ff3a2a"); R(96, 38, 4, 4, "#ff3a2a66"); R(131, 47, 3, 3, "#ff3a2a"); }   // 紅線：從門檻上的腳架（開槍的位置）往右前下拉，停在最上面一級右邊、替身的左太陽穴
    if (o.bucket){ R(152, 78, 7, 8, "#3a6a9a"); R(151, 77, 9, 1, "#5a8aba"); R(153, 75, 5, 1, "#8a8a8a"); P(152, 76, "#8a8a8a"); P(158, 76, "#8a8a8a"); }   // 柱子旁邊的水桶
    if (o.tape) PR.OBJ.tape(58, 84, 86);
    if (rain && !o.noRainDraw) rainOver(26, night ? "#6a7a9a" : "#d8e0e8");
  };

  /* ---------- 港濱路・林記釣具行：釣竿牆、櫃台（抽屜裡的手冊）、窗外的路口和海、冰餌櫃 ---------- */
  SC.c25_tackle = (o) => { o = Object.assign({}, o, stOf(o)); const t = o.t || 0;
    R(0, 0, W, 86, "#c8bca0"); for (let x = 0; x < W; x += 8) R(x, 0, 1, 86, "#bcb094"); R(0, 0, W, 4, "#8a7a5a"); lamp(84);
    // 釣竿牆
    R(6, 12, 34, 66, "#7a5a3a"); R(8, 14, 30, 62, "#a08060"); for (let k = 0; k < 7; k++){ const x = 10 + k * 4; R(x, 16, 1, 58, ["#2a2a2a","#3a5a8a","#8a3a2a","#2a2a2a","#5a6a3a","#c8a040","#1a1a1a"][k]); R(x - 1, 60, 3, 8, "#3a3a3a"); }
    R(35, 16, 1, 58, "#4a3a2a"); R(34, 60, 3, 8, "#1a1a1a"); R(30, 40, 10, 3, "#f4f0e4");   // 非賣品
    // 架上的舊收音機、浮標
    R(46, 30, 26, 2, "#6a4a2a"); R(48, 22, 14, 8, "#5a3a2a"); R(50, 24, 6, 4, "#c8b888"); P(59, 25, "#e8d8a8"); for (let k = 0; k < 4; k++){ R(64 + k * 3, 24, 2, 6, k % 2 ? "#e85a2a" : "#f4f0e4"); }
    // 櫃台和抽屜裡的手冊
    R(76, 62, 56, 24, "#7a5a3a"); R(76, 62, 56, 2, "#9a7a5a"); R(80, 68, 48, 1, "#5a3a2a"); R(98, 70, 20, 8, "#6a4a2a"); R(106, 73, 4, 1, "#c8a870");
    R(100, 58, 16, 4, "#2a4a6a"); R(101, 59, 14, 1, "#e8e0c8"); txt("2011", 103, 61.6, "#e8e0c8", "3px monospace");
    R(82, 56, 12, 6, "#c8c8c0"); R(84, 54, 8, 2, "#8a8a84"); R(120, 56, 6, 6, "#f4f4f0"); R(121, 55, 4, 1, "#6a4a2a");   // 釣線捲和茶杯
    // 窗：路口、紅綠燈、海、防波堤，東北季風
    R(130, 14, 52, 34, "#5a4a3a"); R(132, 16, 48, 30, "#a8c8e0"); R(132, 30, 48, 8, "#4a7a9a"); for (let k = 0; k < 6; k++) R(132 + ((k * 9 + Math.floor(t * 6)) % 46), 31 + (k % 3) * 2, 4, 1, "#e8f0f4");
    R(132, 37, 48, 2, "#9a9a92"); R(132, 39, 48, 7, "#6a6a66"); for (let x = 134; x < 180; x += 8) R(x, 42, 4, 1, "#f4f4f0");   // 防波堤、斑馬線
    const sw = Math.round(Math.sin(t * 3) * 1); R(166, 18, 1, 20, "#3a3a3a"); R(162 + sw, 18, 9, 4, "#2a2a2a"); P(163 + sw, 19, "#3a3a3a"); P(166 + sw, 19, "#3ae04a"); P(169 + sw, 19, "#3a3a3a");   // 紅綠燈在風裡晃
    R(140, 20, 1, 18, "#5a5a5a"); R(140, 20, 6, 1, "#5a5a5a"); R(145, 21, 3, 2, "#f4f0c8");   // 路燈
    for (let k = 0; k < 4; k++) R(134 + ((k * 13 + Math.floor(t * 20)) % 44), 18 + k * 3, 6, 1, "#ffffff80");   // 風
    R(155, 16, 1, 30, "#5a4a3a"); R(132, 30, 48, 0, "#000");
    // 冰餌櫃
    R(148, 56, 30, 30, "#d8dcdc"); R(150, 58, 26, 22, "#b8d8e8"); for (let k = 0; k < 3; k++) R(152, 60 + k * 7, 22, 5, ["#e8a0a0","#f4e0c8","#c8d8e8"][k]); R(150, 58, 26, 22, "#ffffff30"); R(152, 62, 10, 4, "#f4f4f0");
    tiles(86, "#8a8478", "#7a7468");
  };

  /* ---------- 舊分局二樓・閱覽室（以前的組長室）：樓梯口、布告欄、書架、原來的木窗、地上的痕跡 ---------- */
  SC.c25_read = (o) => { o = Object.assign({}, o, stOf(o)); const rain = o.rain !== false;
    R(0, 0, W, 78, "#e8e0cc"); R(0, 0, W, 4, "#c8bca0"); lamp(70); lamp(150);
    // 樓梯口（往下）和不鏽鋼扶手
    R(4, 30, 26, 48, "#4a443a"); for (let k = 0; k < 7; k++){ const w = 26 - k * 3; R(30 - w, 36 + k * 6, w, 6, "#a49a88"); R(30 - w, 36 + k * 6, w, 1, "#c8bea8"); }   // 往下的樓梯
    for (let k = 0; k < 14; k++) P(30 - k * 1.5, 30 + k * 3, "#c8ccd0"); R(30, 26, 2, 52, "#c8ccd0"); R(4, 26, 28, 2, "#d8dce0");   // 不鏽鋼扶手
    // 布告欄
    R(40, 18, 26, 18, "#a87a4a"); R(42, 20, 22, 14, "#d8c8a0"); R(44, 22, 10, 6, "#f4f4f0"); R(46, 24, 6, 1, "#5a5a5a"); R(56, 23, 6, 9, "#f0c8d8"); P(48, 21, "#c83a2a"); P(58, 22, "#3a6ac8");
    // 書架
    R(70, 12, 46, 52, "#8a6a4a"); for (let sh = 0; sh < 4; sh++){ R(72, 16 + sh * 12, 42, 1, "#6a4a2a"); for (let b = 0; b < 10; b++) R(73 + b * 4, 17 + sh * 12, 3, 10 - (b * 3 + sh) % 3, ["#c83a2a","#3a6a8a","#e8c040","#4a8a4a","#8a4a8a","#e8e0c8"][(b + sh * 2) % 6]); }
    // 原來的木窗（雨）
    R(120, 14, 32, 34, "#6a4a2a"); R(122, 16, 28, 30, rain ? "#7a8894" : "#a8c8e0"); R(135, 16, 2, 30, "#6a4a2a"); R(122, 30, 28, 2, "#6a4a2a"); R(124, 40, 10, 6, "#b0603a"); if (rain) rainOver(6, "#c8d8e8");
    // 閱讀桌和小椅子
    R(156, 60, 32, 4, "#c8a878"); R(158, 64, 3, 14, "#a88858"); R(183, 64, 3, 14, "#a88858"); R(162, 54, 10, 6, "#f4f0e4"); R(164, 55, 6, 1, "#3a6a8a");
    for (const x of [60, 160]) { R(x, 70, 10, 2, "#e85a3a"); R(x + 1, 72, 2, 6, "#c84a2a"); R(x + 7, 72, 2, 6, "#c84a2a"); }
    // 磨石子地板
    R(0, 78, W, 30, "#c8c4b8"); for (let k = 0; k < 40; k++) P((k * 37 + 5) % W, 80 + (k * 11) % 26, ["#9a968a","#e8e4d8","#a8a090"][k % 3]); R(0, 78, W, 1, "#a8a498");
    if (!o.noStain){ R(98, 84, 18, 3, "#6a4a32"); R(102, 83, 10, 1, "#7a5a3a"); R(96, 85, 4, 1, "#7a5a3a"); R(114, 86, 3, 1, "#7a5a3a"); }
  };

  /* ---------- 2011 年的組長室（只在重現裡出現） ---------- */
  SC.c25_office = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#a8a090"); R(0, 60, W, 26, "#8a8270"); R(0, 0, W, 4, "#7a7262"); glow(96, 10, 20, "#ffe8a0", 0.2); R(86, 2, 20, 3, "#e8e0c0");
    R(20, 20, 30, 24, "#5a4a38"); R(22, 22, 26, 20, "#1a2030");   // 窗（夜）
    R(140, 18, 36, 50, "#6a5a48"); for (let s = 0; s < 3; s++) R(142, 30 + s * 12, 32, 2, "#4a3a28"); R(144, 22, 8, 8, "#c8b888"); R(156, 22, 6, 8, "#8a3a3a");   // 檔案櫃
    R(60, 60, 70, 6, "#6a4a2a"); R(62, 66, 4, 20, "#4a3a2a"); R(124, 66, 4, 20, "#4a3a2a");   // 桌子
    if (o.staged){ R(80, 56, 14, 4, "#2a2a2e"); R(92, 57, 4, 2, "#2a2a2e"); R(100, 58, 10, 2, "#e8e4da"); R(112, 57, 6, 3, "#c8a838"); }   // 擺好的配槍、擦槍布、油
    tiles(86, "#7a7262", "#6a6252");
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    aunt: { age:"old", skin:"#e8c0a0", hair:"#8a8a84", hairStyle:"bun", top:"#7a5a6a", bottom:"#3a3440", mood:"tired", hello:"你長得越來越像他了。" },
    qian: { hello:"……進來吧。" },
    zhou: { hello:"你想看什麼，就看。" },
    li:   { hello:"督察組要看你們怎麼做。" },
    xuzy: { hello:"……我在這裡。" },
    ye:   { hello:"不能抓人。可以查。" },
    xu:   { hello:"角度我量好了。" },
    wu:   { hello:"學長，照片我放大了。" },
    kui:  { hello:"前輩，紅線準備好了！" },
    lin:  { age:"old", skin:"#c89a70", hair:"#9a9a94", hairStyle:"short", top:"#4a5a6a", coat:"#6a6a4a", bottom:"#3a3a34", mood:"tired", hello:"……沈組長的外甥。坐。" },
    tao:  { age:"old", skin:"#e0b090", hair:"#6a6a68", hairStyle:"bun", top:"#c86a5a", bottom:"#3a4a5a", apron:"#3a8a6a", hello:"小聲一點喔，這裡是圖書館。" }
  };
  ["qian","zhou","li","xuzy","ye","xu","wu","kui"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  const DAILY = {
    qian: [ { room:"qroom", x:150, pose:"polish@glasses", doing:"站在標本櫃前面，一直擦眼鏡。" }, { room:"qroom", x:120, pose:"sit", doing:"坐在桌前，看著那個頭骨模型。" } ],
    zhou: [ { room:"meet", x:150, pose:"cross", doing:"站在投影幕旁邊，雙手抱胸，看著那張照片。" }, { room:"site", x:150, pose:"stand", doing:"站在騎樓的柱子旁邊，看了一下手錶。" } ],
    aunt: [ { room:"ahome", x:174, pose:"sit", doing:"坐在沙發右邊那格，手放在膝蓋上。左邊那格一直空著。" }, { room:"ahome", x:84, pose:"stand", doing:"站在神明桌前面，換了一杯新的茶。" } ],
    li:   [ null, { room:"site", x:56, pose:"write", doing:"站在騎樓的柱子旁邊躲雨，在小本子上寫字。" } ],
    xuzy: [ { room:"blab", x:120, pose:"stand", doing:"站在比對顯微鏡旁邊，沒有坐。" }, null ],
    ye:   [ { room:"meet", x:60, pose:"read", doing:"在長桌旁邊翻卷宗，把紙角一張一張對齊。" }, { room:"site", x:170, pose:"stand", doing:"站在門廊最邊邊，看著你們。" } ],
    xu:   [ { room:"qroom", x:100, pose:"inspect", doing:"在看老錢的筆記本。" }, { room:"site", x:60, pose:"inspect", doing:"拿著捲尺，在量台階。" } ],
    wu:   [ { room:"meet", x:116, pose:"type", doing:"在操作投影機。" }, { room:"site", x:132, pose:"smoke@pen", doing:"站在最上面一級、右邊門柱旁邊，右手夾著一支筆當菸。" } ],
    kui:  [ { room:"blab", x:60, pose:"type", doing:"對著比對顯微鏡的螢幕。" }, { room:"site", x:84, pose:"kneel", doing:"蹲在門檻旁邊，手裡拿著一捲紅線。" } ],
    lin:  [ { room:"shop", x:60, pose:"stand", doing:"站在釣竿架旁邊，手上一直在纏一捲釣線。" }, { room:"shop", x:140, pose:"stand", doing:"站在窗前，看著外面的路口。" } ],
    tao:  [ null, { room:"read", x:60, pose:"hold@book", doing:"抱著一疊繪本，在書架前面排書。" } ]
  };
  EP25.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP25.rooms = {
    police: [ { id:"meet", name:"三樓小會議室", scene:"c25_meet", opt:(ph) => ({ rain:ph === 1 }), details:[
      { id:"d25_window", name:"窗戶", hot:[4,14,22,30], text:"窗外是刑大的停車場。周振邦的車停在最角落，跟平常一樣。" },
      { id:"d25_coffee", name:"一杯咖啡", hot:[138,52,10,8], text:"一杯冷掉的咖啡，杯子上印著海風咖啡的魚。誰也沒喝。" } ] } ],
    qianlab: [ { id:"qroom", name:"老錢的教學室", scene:"c25_qian", details:[
      { id:"d25_board", name:"黑板", hot:[70,12,60,34], text:"黑板上畫著一個頭骨，一條斜線，旁邊寫著「15°」。粉筆字很舊了，沒有人擦。" },
      { id:"d25_cup", name:"茶杯", hot:[114,56,12,8], text:"老錢的茶杯，杯底一圈一圈的茶垢。他說洗不掉，就不洗了。" } ] } ],
    aunt: [ { id:"ahome", name:"舅媽家的客廳", scene:"c25_aunt", opt:(ph) => ({ rain:ph === 1 }), details:[
      { id:"d25_window2", name:"窗戶", hot:[110,12,34,30], text:"鐵窗上掛著一個風鈴。舅媽說，是你小時候做的。" },
      { id:"d25_sofa", name:"沙發", hot:[148,46,44,24], text:"沙發左邊那一格塌了下去。舅舅以前都坐那裡。" } ] } ],
    lab: [ { id:"blab", name:"彈道室", scene:"lab", details:[
      { id:"d25_shelf", name:"試射彈頭的櫃子", hot:[150,20,30,30], text:"一格一格的小抽屜，每一格是一把警槍試射的彈頭。抽屜上的標籤，從 1998 年開始。" } ] } ],
    tackle: [ { id:"shop", name:"林記釣具行", scene:"c25_tackle", details:[
      { id:"d25_radio", name:"架上的收音機", hot:[48,22,14,8], text:"一台舊的收音機，調在漁業氣象台。播報員說：「東北季風增強，沿海風力七到八級。」" },
      { id:"d25_floats", name:"浮標", hot:[64,22,12,8], text:"一排紅白的浮標。最舊的那一個，上面用簽字筆寫著「沈」。" } ] } ],
    oldsite: [ { id:"site", name:"舊分局門口", scene:"c25_site", phase:1, opt:(ph, has) => ({ rain:true, recon:has("o25_recon") }), details:[
      { id:"d25_door", name:"圖書館的大門", hot:[80,28,40,44], text:"以前是分局的大門，現在是圖書館的自動門。門裡面，一排小朋友在看繪本。" },
      { id:"d25_pillar", name:"騎樓的柱子", hot:[44,22,8,60], text:"柱子上一塊漆比較新的地方，大概在肩膀的高度。磨石子補過。" } ] },
      { id:"read", name:"二樓閱覽室（以前的組長室）", scene:"c25_read", phase:1, opt:() => ({ rain:true }), details:[
      { id:"d25_books", name:"書架", hot:[70,12,46,52], text:"兒童書區。最下層一排《小偵探》系列，每一本都被翻爛了。" },
      { id:"d25_chair", name:"紅色的小椅子", hot:[60,70,10,8], text:"一張給小朋友坐的紅色塑膠椅，椅背上貼著一張貼紙：「說故事時間　週六 10:00」。" } ] } ]
  };
  const PS = [["c25_meet",{}],["c25_site",{ rain:true }]];
  EP25.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 結案：重現（開槍的人沒有臉，背對鏡頭） ---------- */
  const strip = L => { const o = Object.assign({}, L || {}); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  const SHEN = { skin:"#e0b48e", hair:"#2a2220", hairStyle:"short", top:"#e8e4da", coat:"#5a5a48", bottom:"#3a3a34" };
  EP25.looks = {
    shenC: SHEN,
    luoC: { skin:"#d8a880", hair:"#2a2a2a", hairStyle:"spiky", top:"#8aa0b8", bottom:"#3a3a44" },
    xuzyC: strip(LOOK.xuzy),
    zhouC: Object.assign(strip(LOOK.zhou), { hair:"#1a1a1a" }),
    coatC: { skin:"#3a3a3a", hair:"#1a1a1a", hairStyle:"short", top:"#2e3a46", coat:"#2e3a46", bottom:"#1e242a", hood:"#2e3a46", back:true },
    shadowC: { skin:"#3a3a3a", hair:"#1a1a1a", hairStyle:"short", top:"#2a2a30", coat:"#1e1e24", bottom:"#1a1a1e", hood:"#1a1a1e", back:true }
  };
  const RB = [
    { t:"18:05:00", d:5.5, cap:"2011 年 3 月 17 日傍晚，交班。周振邦拿起相機：「來，拍一張。」舅舅站在最上面一級，右手夾著菸。", scene:"c25_site", opt:{ old:true, rain:false }, m:{ shenC:[132,74,"smoke",-1], xuzyC:[114,78,"stand",-1], luoC:[152,82,"wave",-1], shadowC:[94,70,"back",1], zhouC:[30,96,"cam",1] }, out:["shenC","xuzyC","luoC","shadowC","zhouC"] },
    { t:"21:38:00", d:5, cap:"21:38，舅舅一個人走到門口，站在他的老位置抽菸。周振邦和林正雄已經出勤了。", scene:"c25_site", opt:{ old:true, night:true, rain:false }, m:{ shenC:[132,74,"smoke",1,104,70] } },
    { t:"21:40:00", d:5, join:true, cap:"有人從門裡走出來，停在他的左後方、門檻上，一公尺半。他沒有回頭。", scene:"c25_site", opt:{ old:true, night:true, rain:false }, m:{ shenC:[132,74,"smoke",1], shadowC:[94,70,"back",1,102,70] } },
    { t:"21:40:05", d:4, join:true, cap:"一聲槍響。點三八。左太陽穴。", scene:"c25_site", opt:{ old:true, night:true, rain:false }, m:{ shenC:[134,76,"fall",1], shadowC:[94,70,"back+aim",1] }, out:["shenC","shadowC"] },
    { t:"21:50:00", d:4.5, cap:"21:50，有人穿著雨衣、帽子蓋著頭，提一桶水出來刷台階。那天晚上沒有下雨。", scene:"c25_site", opt:{ old:true, night:true, rain:false, wet:true, bucket:true }, m:{ coatC:[120,78,"broom",-1,140,82] }, out:["coatC"] },
    { t:"21:52:00", d:5, cap:"他被搬上二樓的組長室，伏在桌上。桌上擺好了他的配槍和擦槍的工具。", scene:"c25_office", opt:{ staged:true }, m:{} },
    { t:"2023-09-12", d:5, cap:"2023 年 9 月，颱風。那把早就不在槍械室的左輪，在帳上被寫成「淹水報廢」。", scene:"c25_meet", opt:{ rain:true }, m:{} }
  ];
  EP25.court = {
    title: "舊分局門口・1 月 12 日 16:30", scene: "c25_site", opt:{ rain:true },
    who: ph => ["qian","aunt","li"],
    open: ph => "16:30，雨還在下。圖書館的門口，老錢撐著傘站在最下面一級，舅媽站在騎樓下，看著台階。黎光耀站在柱子旁邊，一直在寫。",
    kindLine: {
      misfire: "跟十五年前的結論一樣：舅舅在組長室擦槍，自己的槍走火了。",
      suicide: "舅舅是自己開的槍。",
      shot: "舅舅不是擦槍走火，也不是自殺。有人在這個門口，開槍打死了他。"
    },
    kindTrue: "（老錢摘下眼鏡，用袖子擦了很久。舅媽站起來，走到最上面一級，站在舅舅的老位置。）",
    murmur: [ "（雨打在騎樓的磚上。）", "（黎光耀的筆停了一下。）" ],
    confess: {}, cornered: {}, deny: {},
    replayText: "2011 年 3 月 17 日傍晚，分局門口——",
    replay: { scene:"c25_site", opt:{ old:true, rain:false }, clean:true, cam:"經過重現", date:"2011-03-17", beats:RB },
    endGood: "葉晴當天晚上簽了公文：「澄港分局 2011 年沈國棟案，重啟偵查。案由：殺人。」\n老錢把那個標本瓶交了出來。瓶子上的標籤，他自己撕掉了。\n舅媽在門口的台階上，放了一杯熱茶。",
    endBad: "公文上寫的是你的結論。\n老錢把標本瓶放回櫃子最上層。\n那張照片上被刮掉的臉，還是一片白。"
  };

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP25.outScenes = ["c25_site"];
  EP25.fac = { police:["#cfcabb","#3f5a7a"], qianlab:["#d8dcd4","#4a6a6a"], aunt:["#c8b898","#7a5a3a"], lab:["#e2e8e8","#3a7a8a"], oldsite:["#b8ac90","#5a4a3a"], tackle:["#7a8a94","#2a4a6a"] };
  EP25.setting = { police:"city", qianlab:"city", aunt:"town", lab:"city", oldsite:"town", tackle:"town" };
  // 第一天：冷鋒過境，晴天但很冷；第二天：下雨
  const SKY25 = [ ["#8ab8e0","#c8dcec","#7a8a6a","#8a9a7a",0,0], ["#6a7480","#a0a8b0","#5a6a5a","#6a7a6a",2,0] ];
  EP25.worldSky = ph => SKY25[Math.min(ph || 0, SKY25.length - 1)];
  EP25.roomDesc = {
    meet:"刑大三樓的小會議室。門關著，百葉窗拉下一半。", qroom:"法醫中心二樓，老錢的教學室。福馬林的味道。", ahome:"舅媽家的客廳。二十年沒有換過的沙發。",
    blab:"鑑識中心的彈道室。", site:"舊分局的門口。三級台階，騎樓，一排欒樹。",
    shop:"港濱路上的小釣具行。門一開，海風就灌進來。", read:"舊分局的二樓。以前是偵查組長室，現在是兒童閱覽室。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  EP25.world = {};
  EP25.locations.forEach(l => { EP25.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP25.world.police, {
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長……會議室我借好了。照片我掃描起來，可以投在牆上放大。", "小吳"),
      say("you", "老錢那邊呢？", "你"),
      say("wu", "他說他在教學室等。他說，你一個人來也可以。", "小吳"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  EP25.mapPos = { police:[150,40,"r"], qianlab:[190,80,"r"], aunt:[46,96,"d"], lab:[200,52,"u"], oldsite:[90,70,"u"], tackle:[150,100,"d"] };
  EP25.mapRoads = [["police","qianlab"],["police","aunt"],["police","lab"],["police","oldsite"],["oldsite","aunt"],["police","tackle"],["tackle","oldsite"]];
  EP25.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 20; x < 230; x += 8) for (let y = 14; y < 120; y += 7) if ((x + y * 3) % 7) R(x, y, 6, 5, "#c8c0b0");
    R(0, 110, 240, 25, "#3a6a8a"); R(0, 64, 240, 3, "#7a7a72"); R(118, 0, 3, 110, "#7a7a72");
    R(84, 62, 14, 10, "#b8ac90"); R(86, 64, 10, 2, "#5a4a3a");
  };
})();
