/* =========================================================
   第 18 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP18.art = true;
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
  const cam = (x, y) => { R(x, y, 10, 5, "#2a2a2e"); R(x + 7, y + 1, 3, 3, "#4a4a52"); P(x + 1, y + 1, "#e83a3a"); };
  const chandelier = (x, y) => { R(x, 0, 1, y, "#c8a040"); R(x - 8, y, 17, 2, "#c8a040"); for (let k = 0; k < 5; k++) { R(x - 8 + k * 4, y + 2, 1, 3, "#c8a040"); P(x - 8 + k * 4, y + 5, "#fff4c0"); } dither(x - 12, y - 2, 25, 12, "#fff4c022", 2); };
  // 祝賀花架：x＝中央
  const standAt = (x) => {
    R(x - 1, 56, 2, 26, "#6a4a2a"); P(x - 4, 81, "#6a4a2a"); R(x - 5, 80, 4, 2, "#6a4a2a"); R(x + 2, 80, 4, 2, "#6a4a2a"); P(x - 5, 82, INK); P(x + 5, 82, INK);
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, px = Math.round(x + Math.cos(a) * 8) - 2, py = Math.round(44 + Math.sin(a) * 10) - 2; R(px, py, 5, 5, k % 3 ? "#f0a0b8" : "#e8708a"); P(px + 2, py + 2, "#ffffff"); }
    R(x - 4, 40, 8, 8, "#f4f0e8"); R(x - 3, 42, 6, 1, "#c83a3a"); R(x - 2, 44, 4, 1, "#5a5a5a");
    R(x - 9, 54, 2, 18, "#e83a5a"); R(x + 7, 54, 2, 18, "#e83a5a");
  };

  /* ---------- 場景：金樽喜宴會館 ---------- */
  // 大廳：大門、婚紗照、收禮台（簽名簿、外送單、禮金箱）、花架、往宴會廳的門、往 B1 的樓梯
  SC.c18_lobby = (o) => { o = Object.assign({}, o, stOf(o));
    const p = progOf(o);
    wall(80, "#f0e6d8", false); R(0, 74, W, 6, "#d8c8a8"); for (let x = 0; x < W; x += 24) R(x, 0, 1, 74, "#e4d8c4");
    R(0, 10, W, 2, "#c8a040");
    chandelier(84, 6);
    // 大門
    R(2, 28, 20, 52, "#8a7a5a"); R(4, 30, 7, 48, "#a8c8d8"); R(13, 30, 7, 48, "#a8c8d8"); dither(4, 30, 16, 48, "#ffffff22", 3); P(10, 56, "#c8a040"); P(13, 56, "#c8a040");
    // 婚紗照
    R(28, 62, 1, 18, "#6a4a2a"); R(42, 62, 1, 18, "#6a4a2a"); R(35, 62, 1, 16, "#6a4a2a");
    R(26, 40, 18, 23, "#c8a040"); R(27, 41, 16, 21, "#a8d0e0"); R(27, 54, 16, 8, "#e8d8b0"); R(31, 46, 4, 10, "#f8f4f0"); R(31, 44, 4, 3, "#3a2a20"); R(36, 46, 4, 10, "#2a2a30"); R(36, 44, 4, 3, "#1a1410");
    // 牆上的「林府　黃府」
    R(58, 26, 52, 16, "#c8302a"); R(59, 27, 50, 14, "#d8403a"); txt("林府　黃府", 62, 34, "#ffe07a", "5px sans-serif"); txt("囍", 98, 39, "#ffe07a", "8px sans-serif");
    // 收禮台
    R(58, 64, 54, 3, "#c8302a"); R(60, 67, 50, 11, "#b8282a"); R(60, 76, 50, 2, "#e8c040"); R(60, 67, 50, 1, "#e8c040");
    R(60, 59, 6, 5, "#e8c040"); R(61, 58, 4, 1, "#f0a0b8");   // 喜糖籃
    R(68, 60, 10, 4, "#c8302a"); R(69, 60, 8, 3, "#f4f0e0");   // 簽名簿
    R(80, 60, 8, 4, "#f4f4f0"); R(81, 61, 5, 1, "#5a5a5a"); R(81, 62, 3, 1, "#3a5aa8");   // 外送單
    if (o.box) { R(92, 55, 10, 9, "#a8201a"); R(92, 55, 10, 1, "#c8402a"); R(95, 56, 4, 1, "#1a0a0a"); R(94, 56, 6, 1, o.seal === false ? "#5a1a1a" : "#e8c040"); P(97, 60, "#e8c040"); }
    else { R(90, 63, 14, 1, "#8a1a1a"); R(104, 62, 3, 1, "#e83a3a"); }
    // 往宴會廳的門
    R(140, 30, 18, 50, "#c8a040"); R(141, 31, 8, 48, "#8a5a3a"); R(149, 31, 8, 48, "#8a5a3a"); P(147, 56, "#e8c040"); P(151, 56, "#e8c040"); txt("宴會廳", 140, 28, "#8a6a3a", "4px sans-serif");
    cam(140, 2);
    // 往 B1 的樓梯
    R(162, 30, 30, 50, "#3a3634"); for (let k = 0; k < 6; k++) R(162 + k * 5, 50 + k * 5, 30 - k * 5, 2, "#5a5654"); R(162, 30, 2, 50, "#8a8680"); R(164, 34, 22, 8, "#2a5a8a"); txt("B1 停車", 165, 40, "#f4f4f0", "4px sans-serif");
    R(160, 44, 1, 30, "#c8a040"); for (let k = 0; k < 5; k++) P(160 + k * 6, 44 + k * 6, "#c8a040");
    floor(80, "#7a2a3a", "#6a2232"); for (let x = 4; x < W; x += 16) for (let y = 84; y < H; y += 10) R(x + ((y / 10) % 2) * 8, y, 2, 2, "#c8a040");
    if (o.stand !== false) standAt(Math.round(lerpV(o.standX === undefined ? 122 : o.standX, p)));
    if (o.block) { for (let k = 0; k < 18; k++) R(86 + (k % 6) * 8, 34 + Math.floor(k / 6) * 10, 9, 11, k % 2 ? "#f0a0b8" : "#e8708a"); dither(84, 32, 50, 34, "#ffffff33", 2); }
  };

  // 宴會廳：舞台和「囍」字背板、主桌（酒杯、擦手巾、手機、掛外套的椅子）、右邊的桌子和結婚蛋糕
  SC.c18_hall = (o) => {
    wall(80, "#f4ece0", false); R(0, 74, W, 6, "#e0d4c0");
    chandelier(30, 8); chandelier(170, 8);
    R(60, 6, 72, 56, "#c8302a"); R(62, 8, 68, 52, "#d8403a"); txt("囍", 84, 44, "#ffe07a", "26px sans-serif"); for (let k = 0; k < 8; k++) { P(64 + k * 9, 10, "#ffe07a"); P(64 + k * 9, 58, "#ffe07a"); }
    R(56, 62, 80, 4, "#8a5a3a"); R(56, 66, 80, 2, "#6a4a2a");   // 舞台
    // 主桌（左）
    R(68, 50, 2, 26, "#c8a040"); R(74, 50, 2, 26, "#c8a040"); R(68, 50, 8, 2, "#c8a040");   // 椅子
    if (o.jacket !== false) { R(66, 52, 11, 15, "#f4f4f0"); R(70, 53, 3, 10, "#e0e0dc"); R(67, 66, 9, 2, "#e8e8e4"); }
    R(14, 68, 70, 4, "#f8f4ec"); R(16, 72, 66, 10, "#f0e8dc"); R(16, 81, 66, 1, "#d8c8b0");
    for (let k = 0; k < 6; k++) { const x = 24 + k * 7; R(x, 63, 2, 5, "#e8f0f4"); if (k % 2 === 0) R(x, 65, 2, 2, "#8a1a2a"); P(x, 68, "#c8c8c8"); }
    R(50, 65, 8, 3, "#f8f8f8"); P(52, 66, "#d83a3a"); P(55, 65, "#d83a3a");   // 擦手巾
    if (o.phone) R(37, 66, 5, 2, "#1a1a1e");
    R(30, 60, 30, 3, "#f0a0b8"); dither(30, 58, 30, 4, "#e8708a55", 2);   // 桌花
    // 右邊的桌子和蛋糕
    R(130, 70, 60, 4, "#f8f4ec"); R(132, 74, 56, 8, "#f4d8e0");
    R(146, 62, 14, 8, "#f8f4f0"); R(148, 54, 10, 8, "#f8f4f0"); R(150, 48, 6, 6, "#f8f4f0"); P(152, 45, "#2a2a30"); P(154, 45, "#f8f4f0"); R(146, 62, 14, 1, "#f0a0b8"); R(148, 54, 10, 1, "#f0a0b8");
    floor(82, "#6a2a3a", "#5a2232");
    if (o.after) { dither(0, 0, W, 80, "#2a1a2a33", 3); }
  };

  // 新娘休息室：化妝鏡、衣架、沙發、包包
  SC.c18_bridal = (o) => {
    wall(78, "#f4e0e4", false); R(0, 72, W, 6, "#e0c8cc");
    R(12, 22, 34, 32, "#e8d8b0"); R(14, 24, 30, 28, "#c8d8e0"); for (let k = 0; k < 6; k++) { P(12 + k * 6, 22, "#fff4c0"); P(12 + k * 6, 53, "#fff4c0"); }
    R(10, 56, 40, 4, "#f4f0ec"); R(12, 60, 2, 18, "#d8c8c0"); R(46, 60, 2, 18, "#d8c8c0");
    R(25, 57, 7, 3, "#e8d8c8"); R(26, 56, 5, 1, "#f4f0ec"); R(34, 56, 2, 4, "#5a3a2a"); R(38, 57, 4, 3, "#c83a5a"); R(16, 57, 6, 3, "#2a2a30");
    R(66, 22, 36, 2, "#8a8a8e"); R(66, 24, 1, 54, "#8a8a8e"); R(101, 24, 1, 54, "#8a8a8e"); R(70, 24, 1, 4, "#8a8a8e"); R(88, 24, 1, 4, "#8a8a8e");
    R(66, 28, 12, 34, "#c8302a"); R(68, 30, 8, 2, "#e8c040"); R(84, 28, 14, 44, "#f0b8c8"); dither(84, 48, 14, 24, "#ffffff44", 2);
    R(116, 60, 56, 8, "#d8b0c0"); R(116, 68, 56, 12, "#e8c8d0"); R(114, 62, 4, 18, "#d8b0c0"); R(170, 62, 4, 18, "#d8b0c0");
    R(133, 66, 12, 8, "#c8a080"); R(136, 63, 6, 3, "#8a6a4a"); R(137, 64, 4, 1, "#c8a080");
    R(176, 56, 12, 22, "#f4f0ec"); R(178, 48, 8, 8, "#f8f8f8"); dither(176, 46, 12, 10, "#f0a0b8", 2);
    floor(78, "#d8c0b0", "#c8b0a0");
    R(59, 83, 6, 1, "#1a1a1a"); R(61, 82, 2, 1, "#1a1a1a"); R(63, 84, 4, 2, "#f4f4f0");
  };

  // 後門：會館的後牆、廚房後門、垃圾桶、巷口
  SC.c18_back = (o) => {
    R(0, 0, W, 30, "#0c1020"); for (let k = 0; k < 6; k++) P((k * 41 + 7) % 150, 4 + (k * 11) % 20, "#8a8aa0");
    R(0, 20, 146, 66, "#5a5650"); for (let y = 24; y < 86; y += 6) R(0, y, 146, 1, "#4e4a44");
    R(20, 40, 22, 46, "#6a7078"); R(22, 42, 18, 44, "#7a8088"); R(36, 62, 3, 2, "#c8c8c8"); R(26, 34, 10, 3, "#fff4c0"); dither(16, 34, 30, 30, "#fff4c022", 2);
    dither(42, 50, 12, 36, "#fff0c033", 2);   // 門縫的光
    R(50, 30, 16, 12, "#8a8e92"); for (let k = 0; k < 3; k++) R(52, 32 + k * 3, 12, 1, "#5a5e62"); dither(50, 18, 16, 12, "#e8e8e833", 3);   // 排風扇
    R(84, 64, 14, 22, "#3a6a3a"); R(83, 62, 16, 3, "#2a5a2a"); R(102, 64, 14, 22, "#3a5a8a"); R(101, 62, 16, 3, "#2a4a7a"); R(120, 72, 18, 14, "#8a6a4a"); R(120, 72, 18, 1, "#a8886a");
    R(146, 20, 46, 66, "#1a1c24"); R(150, 30, 1, 56, "#5a5a5e"); R(146, 28, 10, 6, "#fff4c0"); dither(140, 30, 30, 40, "#fff4c022", 2);
    R(166, 44, 18, 10, "#e8c040"); txt("計程車", 167, 51, "#2a2a2a", "4px sans-serif"); R(174, 54, 2, 32, "#8a8a8e");
    floor(86, "#3a3a3c", "#34343a"); R(56, 94, 20, 3, "#2a2a2e"); for (let k = 0; k < 4; k++) R(58 + k * 5, 94, 1, 3, "#4a4a4e");
    if (o.flower !== false) { R(62, 91, 4, 3, "#f8f8f4"); P(63, 90, "#f8f8f4"); R(66, 92, 3, 1, "#e8c040"); }
    R(90, 98, 30, 4, "#2a3a4a"); dither(90, 98, 30, 4, "#5a7a9a55", 2);   // 水窪
  };

  // B1 停車場：禮車、伴郎的車（後車廂）
  SC.c18_parking = (o) => {
    wall(80, "#9a9a96", false); R(0, 0, W, 6, "#7a7a76"); for (let x = 30; x < W; x += 60) { R(x, 0, 8, 80, "#b8b8b2"); R(x, 40, 8, 6, "#e8c040"); }
    for (let x = 10; x < W; x += 50) { R(x, 6, 20, 2, "#f4f8f0"); dither(x - 4, 8, 28, 6, "#f4f8f022", 3); }
    R(4, 20, 16, 8, "#2a8a5a"); txt("B1", 7, 26, "#f4f4f0", "5px sans-serif"); cam(180, 10);
    // 禮車（白色，車頭朝右）
    R(12, 66, 66, 12, "#f4f4f2"); R(22, 56, 40, 11, "#e8e8e6"); R(25, 58, 15, 8, "#5a6a7a"); R(42, 58, 16, 8, "#5a6a7a"); R(18, 76, 10, 8, INK); R(60, 76, 10, 8, INK); R(21, 78, 4, 4, "#8a8a8e"); R(63, 78, 4, 4, "#8a8a8e"); R(74, 68, 4, 3, "#fff4c0");
    R(64, 62, 12, 4, "#f0a0b8"); R(68, 58, 4, 4, "#e8708a"); R(30, 66, 2, 10, "#f0a0b8"); R(44, 58, 2, 1, "#f0a0b8");
    // 伴郎的車（銀色，車頭朝左，後車廂在右邊）
    R(110, 66, 72, 12, "#b8bcc4"); R(122, 56, 40, 11, "#a8acb4"); R(125, 58, 15, 8, "#4a5a6a"); R(142, 58, 16, 8, "#4a5a6a"); R(116, 76, 10, 8, INK); R(164, 76, 10, 8, INK); R(119, 78, 4, 4, "#8a8a8e"); R(167, 78, 4, 4, "#8a8a8e"); R(110, 68, 3, 3, "#fff4c0"); R(179, 68, 3, 3, "#c83a3a");
    R(126, 64, 6, 2, "#f4f4f0");   // 副駕駛座上的信封
    if (o.trunk) { R(160, 44, 24, 3, "#a8acb4"); R(160, 47, 2, 14, "#8a8e96"); R(162, 62, 18, 6, "#1a1a1e"); R(164, 63, 10, 5, "#a8201a"); R(164, 63, 10, 1, "#e8c040"); R(174, 63, 6, 4, "#3a3a3e"); }
    floor(80, "#7a7a76", "#6a6a66"); for (let x = 4; x < W; x += 50) R(x, 92, 30, 1, "#e8e8e0");
  };

  /* ---------- 大同路、花店 ---------- */
  SC.c18_pawn = (o) => {
    wall(78, "#5a4a3a", false); R(0, 72, W, 6, "#4a3a2a");
    R(80, 6, 30, 14, "#c8302a"); txt("當", 89, 17, "#f4f0e0", "10px sans-serif");
    R(40, 22, 110, 34, "#3a2a1a"); for (let x = 42; x < 150; x += 5) R(x, 22, 1, 34, "#8a8a8e"); R(40, 38, 110, 1, "#8a8a8e");
    R(36, 56, 118, 4, "#8a6a4a"); R(38, 60, 114, 18, "#6a4a2a"); R(70, 59, 22, 3, "#f4f0e0"); R(81, 59, 1, 3, "#c8b8a0"); for (let k = 0; k < 3; k++) R(72, 59 + k, 7, 1, "#3a3a3a");
    R(120, 58, 6, 2, "#c8a040"); R(10, 30, 20, 30, "#7a6a5a"); R(12, 32, 16, 26, "#e8e0c8"); for (let k = 0; k < 6; k++) R(14, 35 + k * 4, 12, 1, "#5a5a5a");
    R(160, 30, 24, 44, "#8a7a6a"); R(162, 32, 20, 20, "#c8d8e0"); R(162, 54, 20, 18, "#c8d8e0"); P(170, 42, "#e8c040"); P(176, 60, "#c8c8c8");
    floor(78, "#6a6058", "#5a5048");
  };
  SC.c18_store = (o) => {
    wall(78, "#f4f8f4", false); R(0, 0, W, 4, "#2a8a5a"); R(0, 4, W, 2, "#e8763a");
    for (let s = 0; s < 3; s++) { R(8 + s * 28, 30, 24, 48, "#d8dcd8"); for (let r = 0; r < 4; r++) { R(8 + s * 28, 38 + r * 10, 24, 1, "#a8aca8"); for (let k = 0; k < 5; k++) R(10 + s * 28 + k * 4, 33 + r * 10, 3, 5, ["#e83a3a","#3a7ac8","#e8c040","#6aa85a","#f4f4f0"][(k + r + s) % 5]); } }
    R(100, 12, 26, 18, "#1a1a1e"); R(101, 13, 24, 13, "#3a5a8a"); R(101, 24, 24, 2, "#e83a3a");
    R(96, 58, 44, 20, "#e8e4dc"); R(96, 56, 44, 3, "#c8c4bc"); R(110, 50, 10, 7, "#2a2a2e"); R(111, 51, 8, 4, "#6ae86a"); R(124, 50, 12, 6, "#c8a060"); dither(124, 46, 12, 4, "#e8e8e866", 2);
    R(150, 40, 20, 38, "#e8c040"); R(152, 42, 16, 10, "#1a1a1e"); R(153, 43, 14, 8, "#3a8ae8"); for (let k = 0; k < 4; k++) R(153, 55 + k * 5, 14, 3, "#3a3a3e"); R(154, 56, 2, 1, "#6ae86a");
    R(176, 26, 16, 52, "#a8c8d8"); dither(176, 26, 16, 52, "#ffffff33", 3);
    floor(78, "#e8ecec", "#d8dcdc");
  };
  SC.c18_florist = (o) => {
    wall(78, "#d8e8d0", false); R(0, 72, W, 6, "#b8c8b0");
    R(20, 24, 30, 24, "#f4f4f0"); R(20, 24, 30, 1, "#8a8a8e"); for (let k = 0; k < 4; k++) R(23, 28 + k * 4, 22 - (k % 2) * 6, 1, "#3a5aa8"); P(44, 42, "#e83a3a");
    for (let k = 0; k < 6; k++) { const x = 8 + k * 16; R(x, 66, 12, 12, "#5a6a7a"); for (let j = 0; j < 4; j++) R(x + 1 + j * 3, 58 - (j % 2) * 3, 3, 4, ["#e8708a","#f4f4f0","#e8c040","#c83a5a","#a868c8","#f0a0b8"][(k + j) % 6]); R(x + 5, 60, 1, 6, "#3a7a3a"); }
    R(110, 58, 64, 4, "#8a6a4a"); R(112, 62, 60, 16, "#7a5a3a"); R(116, 54, 10, 4, "#e8e4dc");
    R(130, 44, 20, 14, "#1a1a1e"); R(131, 45, 18, 10, "#3a4a3a"); R(133, 47, 6, 6, "#6a8a6a"); R(138, 58, 4, 2, "#2a2a2e");
    R(150, 10, 34, 12, "#3a7a4a"); txt("花語花店", 152, 19, "#f4f4f0", "6px sans-serif");
    floor(78, "#a8a098", "#989088");
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    zhiwei:  { skin:"#e8c09a", hair:"#1e1a18", hairStyle:"slick", top:"#f4f4f0", coat:"#2a2a30", bottom:"#2a2a30", tie:"#c8a040", mood:"worried", hello:"他一定是跑了啦。我是他兄弟，我最知道。" },
    yaqi:    { skin:"#f4d8c0", hair:"#2a2220", hairStyle:"bun", top:"#f8f6f2", bottom:"#f8f6f2", skirt:true, mood:"sad", hello:"……他不會的。他不會這樣對我。" },
    guoming: { age:"old", skin:"#d8a880", hair:"#8a8a86", hairStyle:"short", top:"#f4f4f0", coat:"#5a4a3a", bottom:"#3a3a40", tie:"#c83a3a", mood:"worried", hello:"我只走開十分鐘……十分鐘！" },
    shufen:  { age:"old", skin:"#e8c0a0", hair:"#3a2a20", hairStyle:"bun", top:"#a83a5a", bottom:"#a83a5a", skirt:true, hello:"我就說，結婚前要先看清楚。" },
    kui:     { hello:"沈警官！我可以幫忙嗎？" },
    mgr:     { skin:"#e0b48c", hair:"#1a1410", hairStyle:"slick", top:"#f4f4f0", coat:"#1e1e22", bottom:"#1e1e22", tie:"#1e1e22", hello:"真的很抱歉，這種事我們也是第一次……" },
    cook:    { skin:"#c89a70", hair:"#1a1410", hairStyle:"short", top:"#f4f4f0", apron:"#e8e8e4", bottom:"#3a3a40", hello:"菜要涼了啦。" },
    chengen: { skin:"#e0b48c", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", apron:"#3a7a4a", bottom:"#3a4a5a", mood:"sad", hello:"……又有單要送嗎？" },
    flo:     { age:"old", skin:"#e8c0a0", hair:"#5a3a2a", hairStyle:"bob", top:"#c8a0c8", apron:"#3a7a4a", bottom:"#3a3a40", hello:"要買花嗎？今天滿天星特價。" },
    pawn:    { age:"old", skin:"#d8b08a", hair:"#c8c8c0", hairStyle:"balding", top:"#4a4a6a", bottom:"#3a3a40", glasses:true, hello:"當東西？贖東西？" },
    clerk:   { skin:"#f0d0b4", hair:"#2a2220", hairStyle:"pony", top:"#f4f4f0", apron:"#2a8a5a", bottom:"#3a3a40", hello:"歡迎光臨～" },
    xiang:   { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#f4f4f0", bottom:"#e8e4dc", tie:"#c8a040", wet:true, sweat:true, mood:"sad", hello:"對不起……對不起……" },
    xu:      { hello:"……這件裙子很難走路。" },
    wu:      { hello:"學長……我表哥不是那種人……" }
  };
  ["kui","xu","wu"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  // 今晚是喜宴：大家穿正式一點
  Object.assign(LOOK.kui, { skin:LOOK.kui.skin || "#f0d0b4", hair:LOOK.kui.hair || "#5a3a2a", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8", skirt:true, coat:undefined });
  Object.assign(LOOK.xu, { skin:LOOK.xu.skin || "#ecc8a6", hair:LOOK.xu.hair || "#1e1a18", hairStyle:"bob", top:"#2a5a4a", bottom:"#2a5a4a", skirt:true, hood:undefined, coat:undefined });
  Object.assign(LOOK.wu, { skin:LOOK.wu.skin || "#e8c09a", hair:LOOK.wu.hair || "#2a2a2a", hairStyle:"short", top:"#f4f4f0", coat:"#3a3a4a", bottom:"#3a3a4a", tie:"#c83a3a", glasses:true });
  const DAILY = {
    zhiwei:  [ { room:"hall", x:120, pose:"phone", doing:"站在宴會廳，一直滑手機，又一直把手機收起來。" }, { room:"lobby", x:176, pose:"stand", doing:"站在樓梯口，兩隻手插在口袋裡。" } ],
    yaqi:    [ { room:"bridal", x:96, pose:"cry", doing:"坐不住，在休息室裡走來走去，一直擦眼淚。" }, { room:"hall", x:124, pose:"stand", doing:"站在新郎旁邊，手緊緊抓著他的袖子。" } ],
    guoming: [ { room:"lobby", x:70, pose:"stand", doing:"站在收禮台前面，一直盯著桌上空出來的那一塊。" }, { room:"lobby", x:70, pose:"read", doing:"在收禮台前面重新翻記帳本。" } ],
    shufen:  [ { room:"bridal", x:170, pose:"cross", doing:"站在休息室門口，雙手抱胸。" }, { room:"bridal", x:170, pose:"stand", doing:"站在休息室門口，看著外面。" } ],
    kui:     [ { room:"bridal", x:50, pose:"stand", doing:"站在化妝台旁邊，手上拿著蜜粉盒，躍躍欲試。" }, { room:"bridal", x:50, pose:"write", doing:"在化妝台寫指紋的紀錄，寫得很認真。" } ],
    mgr:     [ { room:"lobby", x:178, pose:"stand", doing:"站在樓梯口，一直跟客人鞠躬道歉。" }, { room:"lobby", x:150, pose:"stand", doing:"站在宴會廳門口，指揮服務生上菜。" } ],
    cook:    [ { room:"back", x:30, pose:"smoke", doing:"站在後門外面抽菸，圍裙上都是醬汁。" }, { room:"back", x:30, pose:"stand", doing:"在後門外面休息，手上拿著一杯冰水。" } ],
    chengen: [ { room:"fshop", x:70, pose:"stand", doing:"在花店門口整理下一張單的花，動作很慢。" } ],
    flo:     [ { room:"fshop", x:100, pose:"stand", doing:"在櫃台後面包花，嘴裡在算今天的單。" } ],
    pawn:    [ { room:"pshop", x:100, pose:"read", doing:"坐在鐵窗後面，戴著老花眼鏡看帳簿。" } ],
    clerk:   [ { room:"cstore", x:80, pose:"stand", doing:"在補貨架上的泡麵。" } ],
    xiang:   [ null, { room:"hall", x:100, pose:"hold@box/#a83a5a", doing:"站在宴會廳，襯衫還是濕的，雙手捧著戒指盒。" } ],
    xu:      [ { room:"hall", x:176, pose:"stand", doing:"站在宴會廳角落，看著主桌，一口飯都沒吃。" }, { room:"hall", x:176, pose:"cross", doing:"站在宴會廳角落，雙手抱胸看陳葵忙。" } ],
    wu:      [ { room:"lobby", x:48, pose:"stand", doing:"站在門口，領帶歪了，手上還捧著一籃喜糖。" }, { room:"hall", x:152, pose:"stand", doing:"站在蛋糕旁邊，偷偷把新郎人偶扶正。" } ]
  };
  EP18.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP18.rooms = {
    venue: [
      { id:"lobby", name:"大廳（收禮台）", scene:"c18_lobby", opt:(ph) => ({ box:false, standX:122 }), details:[
        { id:"d18_candy", name:"喜糖籃", hot:[59,57,7,7], text:"一籃喜糖，粉紅色的包裝紙上印著「翔＆琪」。小吳說，喜糖是新娘自己一顆一顆包的。" },
        { id:"d18_sign", name:"牆上的紅板", hot:[58,26,52,16], text:"「林府　黃府　囍宴」。金色的字是手寫的，新郎的叔叔林國明寫的。他說他寫了十幾張才挑出這一張。" },
        { id:"d18_door", name:"大門", hot:[2,28,20,52], text:"玻璃自動門，每次打開都會「叮咚」一聲。今晚叮咚了好幾百次。" },
        { id:"d18_stairs", name:"往 B1 的樓梯", hot:[162,44,30,36], text:"往下一層就是停車場。樓梯很窄，鋪著和大廳一樣的紅地毯，轉角有一塊被踩得很髒。" } ] },
      { id:"hall", name:"宴會廳", scene:"c18_hall", opt:(ph) => ({ phone:ph >= 1 }), details:[
        { id:"d18_stage", name:"舞台", hot:[60,6,72,56], text:"背板上一個大大的「囍」。舞台上放著兩支麥克風，司儀一直在看手錶。" },
        { id:"d18_flowers", name:"桌花", hot:[30,56,30,6], text:"粉紅玫瑰和滿天星。跟大廳那個花架是同一間花店，緞帶的顏色一樣。" },
        { id:"d18_light", name:"水晶燈", hot:[18,6,26,12], text:"水晶燈少了一顆燈泡，一閃一閃的。經理說下禮拜才會修。" } ] },
      { id:"bridal", name:"新娘休息室", scene:"c18_bridal", details:[
        { id:"d18_mirror", name:"化妝鏡", hot:[12,22,34,32], text:"鏡子旁邊貼著一張便條：「17:30 第一套　19:30 第二套（紅）　20:30 送客（粉紅）」。第二套的時間被劃掉了。" },
        { id:"d18_dress", name:"衣架", hot:[66,22,34,52], text:"紅色的旗袍和粉紅色的禮服掛在衣架上。旗袍的領口別著一張小卡：「媽媽的，小心穿」。" },
        { id:"d18_bouquet", name:"捧花", hot:[176,44,12,34], text:"新娘的捧花，白色的海芋。緞帶上別著一張小小的照片：新郎求婚跪錯腳的那一刻。" } ] },
      { id:"back", name:"後門", scene:"c18_back", details:[
        { id:"d18_bins", name:"垃圾桶", hot:[82,60,36,26], text:"廚餘桶和回收桶，蓋子都蓋不起來。一隻貓蹲在上面，看了你一眼就跑了。" },
        { id:"d18_fan", name:"排風扇", hot:[50,30,16,12], text:"廚房的排風扇轟轟地響，吹出來的都是佛跳牆的味道。" } ] },
      { id:"parking", name:"B1 停車場", scene:"c18_parking", opt:(ph, has) => ({ trunk:!!(has && has("zw8")) }), details:[
        { id:"d18_cam", name:"車道的監視器", hot:[178,8,14,8], text:"只對著車道入口，拍車牌用的。鏡頭照不到停車格。" },
        { id:"d18_b1sign", name:"B1 的牌子", hot:[4,20,16,8], text:"「B1 停車場　喜宴賓客免費」。旁邊的柱子上寫著「禮車專用」。" } ] }
    ],
    pawnst: [
      { id:"pshop", name:"永信當舖", scene:"c18_pawn", details:[
        { id:"d18_rate", name:"牆上的利率表", hot:[10,30,20,30], text:"「月息 2.5%　典當期限六個月　逾期流當」。最下面一行用紅筆寫著：「有困難，先來談」。" },
        { id:"d18_safe", name:"後面的保險櫃", hot:[160,30,24,44], text:"一個很舊的保險櫃，門上貼著一張媽祖的平安符。" } ] },
      { id:"cstore", name:"大同路便利商店", scene:"c18_store", details:[
        { id:"d18_oden", name:"關東煮", hot:[124,46,12,10], text:"關東煮第二件六折。蘿蔔已經煮到透明了。" },
        { id:"d18_shelf", name:"貨架", hot:[8,30,80,46], text:"泡麵、餅乾、礦泉水。最下層的行動電源賣完了，所以他才去租。" } ] }
    ],
    florist: [ { id:"fshop", name:"花語花店", scene:"c18_florist", details:[
      { id:"d18_buckets", name:"花桶", hot:[8,54,92,24], text:"一桶一桶的玫瑰、百合、滿天星。白色的菊花放在最旁邊，是明天告別式要用的。" },
      { id:"d18_counter", name:"櫃台", hot:[114,53,14,6], text:"櫃台上有一捲粉紅色的緞帶和一捲白色的緞帶。粉紅色的快用完了。" } ] } ]
  };
  const PS = [["c18_lobby",{ box:false, standX:122 }],["c18_hall",{ phone:true }]];
  EP18.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 監視器動畫（收禮台） ---------- */
  const strip = L => { const o = Object.assign({}, L); delete o.hello; delete o.mood; return o; };
  EP18.looks = {
    zwC: strip(LOOK.zhiwei), zwNo: Object.assign(strip(LOOK.zhiwei), { coat:undefined }), gmC: strip(LOOK.guoming), sfC: strip(LOOK.shufen), ceC: strip(LOOK.chengen), mgrC: strip(LOOK.mgr),
    groomC: Object.assign(strip(LOOK.xiang), { wet:false, sweat:false, coat:"#f4f4f0" }), groomS: Object.assign(strip(LOOK.xiang), { wet:false, sweat:true }), groomW: strip(LOOK.xiang),
    cookC: strip(LOOK.cook), pawnC: strip(LOOK.pawn), clerkC: strip(LOOK.clerk),
    staffC: { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#f4f4f0", coat:"#7a2a3a", bottom:"#1e1e22" }
  };
  const ANIM = {
    cctv18_desk: { scene:"c18_lobby", opt:{ box:true, standX:122 }, cam:"金樽 大廳 CAM2", date:"2026-11-21", beats:[
      { t:"17:30:00", d:4, cap:"17:30，林國明和王淑芬開始收禮。", st:{ box:true, stand:false }, m:{ gmC:[66,94,"stand",1], sfC:[80,94,"write",1] } },
      { t:"18:00:00", d:4, cap:"18:00，兩人點完第一輪，用紅色的「囍」字封條貼住投入口。", st:{ box:true, stand:false }, m:{ gmC:[84,94,"reach",1,66,94], sfC:[70,94,"stand",1,80,94] } },
      { t:"18:20:00", d:4, cap:"18:20，新郎和伴郎在大門口招呼客人。", st:{ box:true, stand:false }, m:{ gmC:[66,94,"stand",1,84,94], sfC:[80,94,"stand",1,70,94], groomC:[24,98,"wave",1], zwC:[38,98,"stand",1] } },
      { t:"18:21:00", d:4, join:true, cap:"18:21，新郎一個人往宴會廳走，沒有停下來，也沒有靠近禮金箱。", st:{ box:true, stand:false }, m:{ groomC:[148,100,"stand",1,24,98] }, out:["groomC"] },
      { t:"18:30:00", d:4, cap:"18:30，兩人點第二輪，再貼一次封條。", st:{ box:true, stand:false }, m:{ gmC:[84,94,"reach",1,66,94], sfC:[70,94,"stand",1,80,94], zwC:[38,98,"phone",1] } },
      { t:"18:38:00", d:5, cap:"18:38，送花的人推進一個大花架。王淑芬在外送單上簽名，順手把一包紅包塞進禮金箱。", st:{ box:true, standX:[4,46] }, m:{ ceC:[34,94,"push",1,-8,94], sfC:[78,94,"sign",1,70,94], gmC:[62,94,"stand",1,84,94] } },
      { t:"18:40:00", d:5, cap:"18:40，經理叫服務生把花架推到收禮台的右邊。林國明跟伴郎說了幾句話，指了指桌子。", st:{ box:true, standX:[46,122] }, m:{ staffC:[110,94,"push",1,34,94], ceC:[24,94,"stand",-1,34,94], gmC:[60,94,"point",1,62,94], zwC:[76,94,"stand",-1,38,98], mgrC:[178,94,"point",-1] } },
      { t:"18:40:30", d:4, join:true, cap:"林國明和王淑芬一起往宴會廳走。", st:{ box:true, standX:122 }, m:{ gmC:[148,100,"stand",1,60,94], sfC:[148,98,"stand",1,78,94], staffC:[148,96,"stand",1,110,94] }, out:["gmC","sfC","staffC"] },
      { t:"18:41:00", d:4.5, cap:"18:41，送花的人從大門出去，兩手空空。同一時間，伴郎走到花架後面。", st:{ box:true, standX:122 }, m:{ ceC:[-20,94,"stand",-1,24,94], zwC:[112,92,"stand",1,76,94] }, out:["ceC","zwC"] },
      { t:"18:43:00", d:4, cap:"18:41 到 18:45，花架擋住了鏡頭，看不到收禮台和禮金箱。", st:{ box:true, standX:122, block:true } },
      { t:"18:45:00", d:5, cap:"18:45，伴郎從花架後面走出來，兩手抱著一件摺起來的西裝外套，從樓梯走下 B1。", st:{ box:false, standX:122, block:true }, m:{ zwNo:[182,94,"hold@coat/#2a2a30",1,112,94] }, out:["zwNo"] },
      { t:"18:50:00", d:4, cap:"18:50，林國明回到收禮台，大叫。", st:{ box:false, standX:122 }, m:{ gmC:[92,94,"handsup",-1,148,100] } },
      { t:"18:52:00", d:4, cap:"18:52，伴郎從樓梯上來，已經穿著西裝外套。", st:{ box:false, standX:122 }, m:{ gmC:[92,94,"stand",1], zwC:[150,94,"stand",-1,182,94], mgrC:[178,94,"stand",-1] } }
    ] }
  };
  Object.values(ANIM).forEach(A => { if (A.beats.some(b => b.st)) A.opt = Object.assign({}, A.opt || {}, { seq:A.beats.map(b => Object.assign({}, A.opt || {}, b.st || {})), ds:jds(A.beats) }); });
  [...EP18.cctv, ...EP18.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案 ---------- */
  const RB = [
    { t:"18:20:00", d:5, cap:"11 月 21 日 18:20，新郎摸了摸外套的口袋，跟伴郎說：「我出去抽根菸。」", st:{ box:true, stand:false }, m:{ groomC:[30,96,"pocket",1], zwC:[44,96,"stand",-1] } },
    { t:"18:24:00", d:4.5, cap:"18:24，他從後門跑出去，把外套丟給廚房的阿明：「幫我拿進去，太熱了。」", scene:"c18_back", opt:{ flower:false }, m:{ cookC:[90,96,"smoke",-1], groomC:[74,96,"give@coat/#f4f4f0",1,30,94] }, out:["groomC"] },
    { t:"18:24:20", d:4, join:true, cap:"胸花掉在地上，他沒發現。他往巷口跑，跳上一台計程車。", scene:"c18_back", opt:{ flower:true }, m:{ cookC:[90,96,"hold@coat/#f4f4f0",-1], groomS:[176,94,"stand",1,74,96] }, out:["groomS"] },
    { t:"18:40:00", d:5, cap:"18:40，大家都去安撫新娘。林國明叫伴郎「顧一下收禮台」。剛送來的大花架，被推到了收禮台旁邊。", st:{ box:true, standX:[46,122] }, m:{ staffC:[110,94,"push",1,34,94], gmC:[60,94,"point",1], zwC:[76,94,"stand",-1,40,96] } },
    { t:"18:41:00", d:5, cap:"18:41，他走到花架後面，撕開封條。", st:{ box:true, standX:122 }, m:{ gmC:[148,100,"stand",1,60,94], staffC:[148,96,"stand",1,110,94], zwC:[102,92,"reach",1,76,94] }, out:["gmC","staffC"] },
    { t:"18:43:00", d:5, join:true, cap:"脫下西裝外套，把禮金箱包起來。", st:{ box:false, standX:122 }, m:{ zwNo:[100,92,"hold@coat/#2a2a30",-1] }, out:["zwC"] },
    { t:"18:45:00", d:4.5, cap:"18:45，他抱著外套走下 B1。", st:{ box:false, standX:122 }, m:{ zwNo:[182,94,"hold@coat/#2a2a30",1,100,92] }, out:["zwNo"] },
    { t:"18:47:00", d:5, cap:"他打開自己的後車廂，掀起底板，把禮金箱塞進備胎槽，用毛毯蓋好。", scene:"c18_parking", opt:{ trunk:true }, m:{ zwNo:[170,94,["reach@box/#a8201a","kneel+reach","reach"],-1,120,96] } },
    { t:"18:55:00", d:5, cap:"18:55，當舖要拉鐵門的前一刻，新郎衝了進去，贖回那枚當了半年的戒指。", scene:"c18_pawn", opt:{}, m:{ pawnC:[100,92,"give@card/#a83a5a",1], groomS:[84,96,"give@cash",1,-20,96] } },
    { t:"19:18:00", d:5, cap:"19:05 他在隔壁的便利商店租了行動電源。19:18，卡在大橋上的計程車裡，他傳 LINE 給志偉：「我在大橋塞車，戒指拿回來了。」", scene:"c18_store", opt:{}, m:{ clerkC:[118,94,"stand",-1], groomS:[160,94,"phone",1,190,94] } },
    { t:"19:19:00", d:5, cap:"19:19，志偉已讀。他把手機收進口袋，跟大家說：「他一定是跑了。」", scene:"c18_hall", opt:{}, m:{ zwC:[110,94,["phone","pocket","stand"],-1] } },
    { t:"20:40:00", d:5, cap:"20:40，新郎濕透了衝進大門，手上緊緊握著那個小盒子。", st:{ box:false, standX:122 }, m:{ groomW:[70,96,"hold@card/#a83a5a",1,-10,96] } }
  ];
  EP18.court = {
    title: "金樽喜宴會館・大廳　21:50", scene: "c18_lobby",
    who: ph => ["zhiwei","xiang","chengen","guoming","shufen"],
    open: ph => "21:50，宴會廳裡的客人還沒走完。大廳的收禮台前面，新郎握著新娘的手。伴郎張志偉站在樓梯口，手插在口袋裡。林國明把記帳本攤在桌上，一頁都沒翻。",
    kindLine: {
      groom: "禮金箱是新郎帶走的。",
      theft: "禮金箱不是新郎帶走的。是有人趁亂把它拿走了。"
    },
    murmur: [ "（新娘把新郎的手握得更緊了。）", "（伴郎看了一眼樓梯。）", "（林國明把記帳本闔上，又打開。）" ],
    confess: {
      zhiwei: [ "八十二萬。銀行說下個月就要告我。我只是想先借一下……", "阿翔沒回來，大家都說他捲款跑了。我想說，那就讓大家這樣以為吧。等我週轉過來，再偷偷還回去。", "他傳 LINE 給我的時候，我看了。我看了好幾次。……阿翔，對不起。" ]
    },
    cornered: { zhiwei: "我、我只是想先借一下……我會還的……" },
    deny: {
      xiang: "我連收禮台都沒經過！我是從後門走的！",
      chengen: "我只是送花的……我連她的臉都不敢看。",
      guoming: "我只走開十分鐘……",
      shufen: "我一直在休息室陪雅琪！"
    },
    replayText: "11 月 21 日 18:20，金樽喜宴會館的大廳。新郎摸了摸外套的口袋——",
    replay: { scene:"c18_lobby", opt:{ seq:RB.map(b => b.st || {}), ds:jds(RB) }, clean:true, cam:"經過重現", date:"2026-11-21", beats:RB },
    endGood: "22:00，禮金箱放回收禮台。林國明一包一包重新點了一遍：一塊都沒少。\n新郎在台上把戒指戴到新娘手上，手抖得戴了三次才戴進去。台下的小吳哭得比新娘還慘。\n志偉一直坐在往 B1 的樓梯上，沒有進來。新郎敬完最後一桌酒，拿了兩瓶啤酒走下樓梯，在他旁邊坐了很久。",
    endBad: "22:45，喜宴草草散場。禮金箱沒有找到。\n新郎的爸爸當著所有客人的面打了他一巴掌。新娘的阿姨說：「這種人，不能嫁。」\n停車場裡，一台銀色的小車慢慢開走了。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[18] && ARC_INTER[18].after) EP18.after = Object.assign({}, ARC_INTER[18].after, { scene:"c18_hall", opt:{ after:true, phone:false } });

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP18.outScenes = ["c18_back"];
  EP18.fac = { venue:["#f0e6d8","#c8302a"], pawnst:["#5a4a3a","#c8302a"], florist:["#d8e8d0","#3a7a4a"] };
  EP18.setting = { venue:"city", pawnst:"town", florist:"town" };
  const SKY18 = [ ["#0a0f1c","#24304a","#2a3040","#323a4a",0,0], ["#0a0f1c","#24304a","#2a3040","#323a4a",0,0] ];
  EP18.worldSky = ph => SKY18[Math.min(ph || 0, SKY18.length - 1)];
  EP18.roomDesc = {
    lobby:"喜宴會館的大廳。收禮台上空了一塊。", hall:"宴會廳。三十桌，菜一道一道地上，主桌空著兩個位子。", bridal:"新娘休息室。化妝品擺了一整桌。", back:"廚房的後門，外面是一條小巷。", parking:"B1 停車場。",
    pshop:"大同路的永信當舖。鐵窗後面坐著老闆。", cstore:"當舖隔壁的便利商店。", fshop:"花語花店。滿屋子的花香。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#f4f4f0", coat:"#2a2f3a", bottom:"#2a2f3a", tie:"#3a4a6a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  EP18.world = {};
  EP18.locations.forEach(l => { EP18.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP18.world.venue, {
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長……我表哥不見了，禮金箱也不見了。大家都在說是表哥拿的。", "小吳"),
      say("wu", "可是表哥不是那種人！我小時候被欺負，都是他幫我出頭的！", "小吳"),
      say("you", "先不要急著把兩件事綁在一起。……我們去看看收禮台。", "你"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  EP18.mapPos = { venue:[110,60,"u"], pawnst:[50,90,"d"], florist:[190,90,"d"] };
  EP18.mapRoads = [["venue","pawnst"],["venue","florist"]];
  EP18.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#2a2e3a"); dither(0, 0, 240, 135, "#323644", 3);
    for (let x = 20; x < 230; x += 8) for (let y = 14; y < 120; y += 7){ R(x, y, 6, 5, "#3a3e4a"); if ((x * 7 + y) % 5 === 0) R(x + 1, y + 1, 2, 2, "#e8d890"); }
    R(0, 74, 240, 6, "#4a4e5a"); R(60, 0, 6, 135, "#4a4e5a");
    R(20, 60, 60, 4, "#6a6e7a"); for (let k = 0; k < 8; k++) R(24 + k * 7, 61, 3, 2, (Math.floor(t * 2) + k) % 3 ? "#e83a3a" : "#e8d890");   // 大橋：車燈一排動不了
    R(102, 50, 16, 10, "#f0e6d8"); R(104, 52, 12, 2, "#c8302a");   // 會館
  };
})();
