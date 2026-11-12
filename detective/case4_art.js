/* =========================================================
   第 4 集：像素畫設定
   - 新場景（PX.SCENES）：酒店套房、備餐間、走廊、保全室、卸貨區、大廳、玉市、玉雕工作室、乾冰廠……
   - LOOK：人物造型（byPhase 依時段改變；衣服跟著劇情）
   - DAILY：每個人每個時段在哪個房間、在做什麼
   - ROOMS：每個地點的房間（＝走動畫面的區域）和隱藏小細節
   - ANIM：監視器畫面的動畫（每一段都要跟字幕一致）
   - COURT：最後在瀚古的展廳說出推理
   座標都是 192×108 的畫布座標
   ========================================================= */
EP4.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, shade, OBJ, windowBox, door, sign, lamp, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l), sky = (a, b, h) => PR.sky(a, b, h);
  const SC = PX.SCENES;
  const carpet = (y, c, c2) => { R(0, y, W, H - y, c); for (let x = 0; x < W; x += 12) for (let j = y + 3; j < H; j += 9) { R(x + ((j / 9) % 2) * 6, j, 4, 1, c2); } };
  const cctvDome = (x, y) => { R(x, y, 10, 3, "#d6d6d6"); R(x + 2, y + 3, 6, 4, "#2a2a2e"); P(x + 6, y + 4, "#e04a3a"); };
  const nightCity = (x, y, w, h, ph) => { R(x - 1, y - 1, w + 2, h + 2, "#3a3228"); R(x, y, w, h, ph === 0 ? "#0e1428" : ph === 2 ? "#c8a888" : "#8aa8c8");
    PR.seed(x + y); for (let i = 0; i < w; i += 6){ const hh = 6 + PR.rnd() * (h - 4); R(x + i, y + h - hh, 5, hh, ph === 0 ? "#1a2238" : "#5a6a7a"); for (let j = y + h - hh + 2; j < y + h - 1; j += 3) if (PR.rnd() > .4) P(x + i + 2, j, ph === 0 ? "#ffd98a" : "#c8d4dc"); }
    if (ph === 0){ R(x + w - 18, y + 3, 6, h - 3, "#2a3048"); for (let j = y + 6; j < y + h; j += 4) P(x + w - 15, j, "#9ad0ff"); } R(x + w / 2, y, 1, h, "#3a3228"); };
  // 翠玉貔貅（小小的綠色獸）
  const pixiu = (x, y, chip) => { R(x, y + 3, 10, 4, "#3a9a6a"); R(x + 7, y, 4, 5, "#3a9a6a"); R(x + 1, y + 2, 7, 2, "#5aba8a"); P(x + 9, y + 1, "#1a4a2a"); R(x, y + 7, 2, 1, "#2a7a4a"); R(x + 8, y + 7, 2, 1, "#2a7a4a"); if (!chip) P(x + 10, y - 1, "#3a9a6a"); };
  // 展示櫃：o.state = "full"（有貔貅）、"empty"（只剩底座和小袋）、"hood"（罩著絨布）、"fog"（櫃內起霧）
  const showcase = (x, y, state) => { R(x - 2, y + 30, 38, 22, "#2a2622"); R(x - 1, y + 31, 36, 3, "#8a7a5a"); R(x + 2, y + 36, 30, 3, "#3a3632"); P(x + 30, y + 40, "#3fd46f");
    if (state === "hood"){ R(x - 2, y - 2, 38, 34, "#7a1e24"); for (let i = 0; i < 38; i += 4) R(x - 2 + i, y - 2, 1, 34, "#6a1a1e"); R(x - 2, y - 2, 38, 2, "#9a2a30"); return; }
    R(x, y, 34, 30, "#9ac8d8"); R(x + 1, y + 1, 32, 28, "#c8e4ec"); R(x + 2, y + 2, 2, 24, "#ffffff");
    R(x + 9, y + 22, 16, 5, "#5a2a1a"); R(x + 8, y + 26, 18, 2, "#4a2014"); R(x + 11, y + 21, 12, 2, "#2a5a3a");
    if (state === "full") pixiu(x + 12, y + 13);
    if (state === "empty" || state === "fog"){ R(x + 12, y + 19, 10, 3, "#2a5a3a"); R(x + 13, y + 18, 8, 1, "#3a6a4a"); R(x + 11, y + 22, 6, 1, "#e8f0f0"); }
    if (state === "fog"){ dither(x + 1, y + 1, 32, 28, "#f4f8f8", 2); }
  };
  const cart = (x, y, box) => { R(x, y, 26, 2, "#c8c8c8"); R(x, y + 10, 26, 2, "#a8a8a8"); R(x, y, 2, 14, "#8a8a8a"); R(x + 24, y, 2, 14, "#8a8a8a"); P(x + 2, y + 15, INK); P(x + 23, y + 15, INK);
    if (box){ R(x + 3, y - 10, 14, 10, "#2a6ab8"); R(x + 3, y - 10, 14, 2, "#4a8ad8"); R(x + 8, y - 6, 4, 2, "#e9e4da"); R(x + 18, y - 5, 6, 5, "#e9e4da"); } else { for (let i = 0; i < 5; i++){ R(x + 3 + i * 4, y - 6, 2, 6, "#d8ecf4"); P(x + 3 + i * 4, y - 7, "#ffffff"); } } };

  /* =================== 雲頂酒店 =================== */
  SC.hsuite = (o) => { const ph = o.phase || 0;
    wall(74, "#d8c8a8", false); R(0, 66, W, 8, "#6a4a2a"); R(0, 64, W, 2, "#c9a24a");
    for (let x = 0; x < W; x += 32) R(x, 0, 1, 64, "#c8b898");
    nightCity(4, 8, 50, 50, ph);
    // 三角鋼琴、花藝
    R(70, 44, 36, 14, "#f4f2ec"); R(72, 40, 30, 4, "#e8e6e0"); R(74, 58, 2, 14, "#d8d6d0"); R(100, 58, 2, 14, "#d8d6d0"); R(76, 46, 22, 2, INK); for (let i = 0; i < 11; i++) R(76 + i * 2, 46, 1, 2, "#ffffff");
    R(58, 52, 8, 20, "#e8e6e0"); for (let i = 0; i < 5; i++){ R(54 + i * 3, 40 + (i % 2) * 3, 4, 4, "#f4f4f4"); P(56 + i * 3, 42, "#d88ad0"); } R(60, 46, 2, 8, "#4a7a3a");
    // 展示櫃
    const st = o.case || (ph === 0 ? "fog" : "empty");
    showcase(120, 26, st);
    if (ph === 0 && st !== "hood"){ R(152, 44, 22, 28, "#7a1e24"); for (let i = 0; i < 22; i += 4) R(152 + i, 44, 1, 28, "#6a1a1e"); OBJ.marker(116, 84, 1); OBJ.marker(148, 84, 2); }
    // 吧台
    R(160, 54, 32, 18, "#e8e4dc"); R(158, 52, 34, 3, "#a8a49a"); R(164, 46, 8, 6, "#c8c8c8"); R(166, 42, 2, 6, "#2a5a3a"); R(176, 44, 2, 8, "#2a5a3a"); R(182, 44, 2, 8, "#2a5a3a");
    // 茶几、目錄、香檳杯
    R(52, 66, 34, 4, "#5a3a22"); R(60, 62, 20, 4, "#e9e4da"); R(62, 63, 16, 1, "#2a6a4a"); for (let i = 0; i < 3; i++){ R(94 + i * 6, 62, 2, 6, "#e8f0f4"); P(94 + i * 6, 62, "#f4d48a"); }
    lamp(96, 0, "#ffe6a8"); lamp(140, 0, "#ffe6a8"); cctvDome(186, 2);
    carpet(74, "#7a2a2a", "#8a3a34");
    if (ph === 0) OBJ.tape(0, 100, 60);
  };
  SC.hpantry = (o) => { const ph = o.phase || 0;
    wall(74, "#e8e8e4", false); for (let x = 0; x < W; x += 12) for (let y = 10; y < 66; y += 8) R(x, y, 11, 7, "#f2f2ee");
    R(0, 60, W, 14, "#9a9a96"); R(0, 58, W, 3, "#c8c8c4");
    R(20, 48, 30, 12, "#b8bcc0"); R(22, 50, 26, 6, "#8a9096"); R(34, 42, 2, 6, "#c8c8c8");                // 水槽
    R(60, 54, 20, 4, "#c8ccd0"); R(62, 52, 16, 2, ph === 0 ? "#f4f8fa" : "#d8dcdc"); R(68, 57, 6, 1, "#3fd46f");   // 電子秤
    R(88, 56, 18, 4, "#d8c8a8"); R(96, 50, 2, 6, "#8a8a8a"); R(95, 48, 4, 2, "#c8c8c8");                // 砧板、冰鑿
    if (ph === 0){ P(92, 55, "#ffffff"); P(101, 55, "#ffffff"); }
    R(118, 40, 24, 12, "#f4f4f4"); for (let i = 0; i < 5; i++) R(120, 42 + i * 2, 20, 1, "#e0e0dc"); R(126, 46, 8, 2, "#c9a24a");  // 餐巾
    R(150, 54, 14, 14, "#c8ccd0"); R(152, 56, 10, 10, "#9ac8e0");                                        // 冰桶
    R(170, 30, 20, 40, "#d8dcdc"); R(172, 32, 16, 18, "#c8ccd0"); R(172, 52, 16, 16, "#c8ccd0");         // 冰箱
    lamp(96, 0, "#f4f8ff"); floor(74, "#c8c4b8", "#b8b4a8");
  };
  SC.hcorr = (o) => { const ph = o.phase || 0;
    wall(74, "#cfc2a6", false); R(0, 68, W, 6, "#6a4a2a"); for (let x = 8; x < W; x += 40){ R(x, 18, 6, 10, "#e8d8a8"); P(x + 2, 22, "#ffffff"); }
    door(30, 30, 24, 44, "#6a4428"); R(36, 24, 12, 5, "#c9a24a"); R(38, 25, 8, 3, "#2a2218"); R(48, 50, 3, 2, "#c9a24a");
    if (ph >= 0){ R(34, 52, 8, 10, "#e9e4da"); R(35, 54, 6, 1, "#c23a2a"); }
    door(84, 26, 32, 48, "#5a3a20"); R(100, 26, 1, 48, "#3a2614"); R(92, 20, 16, 5, "#c9a24a"); R(94, 21, 12, 3, "#2a2218"); R(96, 48, 3, 2, "#c9a24a"); R(102, 48, 3, 2, "#c9a24a");
    door(150, 30, 24, 44, "#8a8e94"); R(156, 24, 12, 5, "#3a3e44"); R(170, 46, 4, 6, "#2a2a2e"); P(171, 48, "#e04a3a");
    cctvDome(124, 2);
    carpet(74, "#5a2a2a", "#6a3430");
    if (ph === 0){ OBJ.tape(80, 76, 40); }
  };
  SC.hsec = (o) => { const ph = o.phase || 0;
    wall(74, "#bcc0c4", false);
    R(20, 26, 66, 32, "#2a2a2e"); for (let i = 0; i < 4; i++){ const x = 22 + (i % 2) * 32, y = 28 + Math.floor(i / 2) * 15; R(x, y, 30, 13, "#0d1a12"); for (let j = 0; j < 13; j += 2) R(x, y + j, 30, 1, "#12261a"); R(x + 2, y + 2, 2, 2, "#e04a3a"); }
    for (let i = 0; i < 12; i++) R(4 + (i % 2) * 8, 10 + Math.floor(i / 2) * 8, 7, 6, i % 3 ? "#1a2a22" : "#22382c");
    OBJ.desk(16, 66, 80); R(30, 60, 30, 6, "#3a3e44"); R(32, 61, 26, 4, "#5a5e64");
    R(98, 28, 44, 34, "#e8e8e4"); R(100, 30, 40, 18, "#1a2a3a"); for (let i = 0; i < 6; i++) R(102, 32 + i * 2, 20 + (i * 7) % 16, 1, "#6fd46f"); R(100, 50, 40, 10, "#c8c8c4"); P(136, 52, "#e04a3a");
    R(144, 28, 30, 34, "#d8d8d0"); R(146, 30, 26, 14, "#2a3a4a"); for (let i = 0; i < 5; i++) R(148, 32 + i * 2, 16, 1, "#9ad0ff"); R(144, 62, 30, 6, "#c8c8c0");
    R(176, 30, 14, 20, "#5a4a3a"); for (let i = 0; i < 6; i++) P(179 + (i % 3) * 4, 34 + Math.floor(i / 3) * 6, "#c9a24a");
    floor(74, "#8a8e92", "#7a7e82");
  };
  SC.hsvc = (o) => { const ph = o.phase || 0;
    wall(74, "#d0d4d0", false);
    R(10, 22, 30, 52, "#8a9096"); R(12, 24, 13, 50, "#a8b0b6"); R(26, 24, 13, 50, "#a8b0b6"); R(22, 16, 8, 4, "#2a2a2e"); R(24, 17, 4, 2, "#ff9a3a");   // 員工電梯
    R(44, 36, 30, 34, "#c8ccd0"); R(46, 38, 26, 14, "#8a9096"); R(48, 40, 22, 10, "#3a3e44"); P(68, 54, "#3fd46f"); R(46, 56, 26, 2, "#e9e4da");    // 洗碗機
    R(80, 56, 40, 14, "#c8c8c4"); R(78, 54, 44, 3, "#a8a8a4"); for (let i = 0; i < 6; i++) R(82 + i * 6, 50, 4, 4, "#e9e4da");
    R(128, 26, 46, 48, "#6a7a8a"); for (let i = 0; i < 4; i++){ R(130 + i * 11, 28, 10, 44, "#7a8a9a"); R(137 + i * 11, 46, 2, 3, "#c8c8c8"); }
    R(141, 32, 8, 6, "#e8d8c8"); P(144, 34, "#2a2a2e");
    floor(74, "#9a9a92", "#8a8a82");
  };
  SC.hdock = (o) => { const ph = o.phase || 0;
    wall(74, "#7a7e82", true);
    R(0, 0, W, 6, "#4a4e52"); for (let x = 0; x < W; x += 16) R(x, 6, 2, 4, "#5a5e62");
    R(18, 38, 30, 24, "#c8b898"); R(20, 40, 26, 20, "#e8dcc0"); for (let i = 0; i < 7; i++) R(22, 42 + i * 2.5, 22, 1, "#8a7a5a");   // 登記簿（掛板）
    R(56, 50, 60, 24, "#5a5e62"); R(56, 48, 60, 3, "#e8c040"); for (let x = 56; x < 116; x += 8) R(x, 48, 4, 3, "#2a2a2a");        // 卸貨平台
    R(120, 18, 52, 56, "#c8d0d4"); R(122, 20, 48, 54, "#a8b4bc"); R(144, 20, 2, 54, "#8a949c"); R(124, 30, 10, 2, "#e9e4da");      // 冷藏室
    if (o.boxes){ for (let i = 0; i < 3; i++){ R(126 + i * 14, 60, 12, 10, i === 1 ? "#2a6ab8" : "#c8c8c8"); } }
    R(176, 30, 16, 44, "#4a4e52"); for (let y = 30; y < 74; y += 4) R(176, y, 16, 1, "#3a3e42");
    cctvDome(100, 8); lamp(80, 6, "#f4f8ff");
    floor(74, "#6a6e70", "#5a5e60"); for (let x = 0; x < W; x += 24) R(x, 92, 12, 2, "#e8c040");
  };
  SC.hlobby = (o) => { const ph = o.phase || 0;
    wall(74, "#e8dcc4", false); R(0, 66, W, 8, "#3a2a1e"); for (let x = 0; x < W; x += 24){ R(x, 0, 6, 66, "#d8c8a8"); R(x + 1, 0, 1, 66, "#f4ecd8"); }
    R(60, 6, 72, 4, "#c9a24a"); for (let i = 0; i < 9; i++){ R(68 + i * 7, 10, 1, 8, "#c9a24a"); R(66 + i * 7, 18, 5, 4, "#fff4c8"); }   // 吊燈
    R(16, 30, 44, 26, "#1e1e22"); R(18, 32, 40, 22, ph === 0 ? "#1a2a3a" : "#3a5a7a"); if (ph >= 1){ R(18, 50, 40, 4, "#c23a2a"); R(20, 51, 30, 2, "#e9e4da"); }   // 電視
    R(70, 46, 50, 24, "#5a3a22"); R(68, 44, 54, 3, "#c9a24a"); R(84, 30, 22, 10, "#2a2218"); R(86, 32, 18, 6, "#c9a24a");   // 櫃檯
    R(124, 44, 40, 26, "#c8c8c4"); R(126, 40, 36, 4, "#8a8e92"); R(130, 34, 26, 6, "#3a5a7a"); R(132, 35, 22, 4, "#e9e4da");   // 員工出口・檢查桌
    R(168, 26, 22, 48, "#d8d8d4"); R(170, 28, 18, 46, "#a8c0cc");
    OBJ.plant(4, 60); OBJ.plant(116, 60); cctvDome(150, 2);
    floor(74, "#e8e0d0", "#d8d0c0"); for (let x = 0; x < W; x += 16) for (let y = 78; y < H; y += 10) R(x + ((y / 10) % 2) * 8, y, 8, 1, "#c8c0b0");
  };
  SC.hpei = (o) => { const ph = o.phase || 0;
    wall(74, "#d8ccb0", false); R(0, 66, W, 8, "#6a4a2a");
    nightCity(140, 8, 46, 46, ph);
    R(10, 50, 50, 20, "#e8e4dc"); R(8, 42, 54, 10, "#c8b898"); R(12, 48, 46, 4, "#f4f0ea"); R(14, 44, 14, 6, "#ffffff");   // 床
    R(66, 58, 28, 12, "#5a3a22"); R(64, 56, 32, 3, "#7a5a3a"); R(70, 54, 16, 3, "#2a2a6a"); R(72, 55, 4, 1, "#9a6aff");     // 桌上的手電筒
    R(100, 52, 24, 4, "#d8c8a0"); R(102, 53, 20, 2, "#a89870");                                                              // 圖錄
    R(140, 56, 30, 14, "#3a3a4a"); R(142, 50, 26, 6, "#4a4a5a"); R(152, 48, 6, 2, "#8a8a9a");                              // 行李箱
    lamp(96, 0, "#ffe6a8"); carpet(74, "#5a3a4a", "#6a4a5a");
  };

  SC.svclift = (o) => {
    R(0, 0, W, H, "#8a9096"); for (let x = 0; x < W; x += 24) R(x, 0, 1, 80, "#7a8086");
    R(60, 10, 72, 70, "#a8b0b6"); R(95, 10, 2, 70, "#7a8086"); R(84, 4, 24, 5, "#1e1e22"); R(88, 5, 16, 3, "#ff9a3a");
    R(150, 30, 12, 24, "#c8ccd0"); for (let i = 0; i < 8; i++) R(152 + (i % 2) * 5, 32 + Math.floor(i / 2) * 5, 3, 3, "#e9e4da");
    R(0, 80, W, 28, "#5a5e62"); for (let x = 0; x < W; x += 8) R(x, 80, 4, 28, "#62666a");
  };

  /* =================== 瀚古拍賣 =================== */
  SC.afront = (o) => { const ph = o.phase || 0;
    wall(74, "#f2efe8", false); R(0, 70, W, 4, "#2a2a2a");
    for (let i = 0; i < 4; i++){ const x = 14 + i * 44; R(x, 26, 30, 30, "#e8e6e0"); R(x + 1, 27, 28, 28, "#f8f8f4"); R(x - 2, 56, 34, 14, "#2a2a2a");
      if (i === 0){ R(x + 8, 40, 6, 6, "#3a9a6a"); R(x + 16, 40, 6, 6, "#3a9a6a"); }
      if (i === 1){ R(x + 10, 34, 10, 16, "#f4f4f8"); R(x + 12, 38, 6, 8, "#2a4a9a"); }
      if (i === 2){ R(x + 6, 48, 18, 6, "#e9e4da"); R(x + 8, 49, 14, 1, "#c23a2a"); }
      if (i === 3){ R(x + 8, 30, 14, 22, "#e8dcc0"); for (let j = 0; j < 4; j++) R(x + 10 + j * 3, 32, 1, 16, "#2a2218"); } }
    R(70, 6, 52, 12, "#1e1e22"); R(74, 9, 44, 6, "#c9a24a");
    lamp(40, 0, "#ffffff"); lamp(150, 0, "#ffffff");
    floor(74, "#3a3a3a", "#2e2e2e");
    if (o.court){ for (let i = 0; i < 8; i++){ R(10 + i * 22, 80, 14, 3, "#8a1e24"); R(10 + i * 22, 83, 2, 6, "#2a2a2a"); R(22 + i * 22, 83, 2, 6, "#2a2a2a"); } }
  };

  /* =================== 葉家・玉市・工作室・乾冰廠 =================== */
  SC.ystudy = (o) => { const ph = o.phase || 0;
    wall(70, "#d8c8a8", false); R(0, 62, W, 8, "#6a4a2a");
    windowBox(90, 10, 40, 30, "#a8c8a8");
    OBJ.shelf(4, 8, 30, 4, ["#7a2a2a", "#2a3a6a", "#8a6a3a", "#3a5a3a"]);
    OBJ.desk(36, 62, 46); R(40, 20, 24, 20, "#5a3a22"); R(42, 22, 20, 16, "#c8b898"); R(48, 28, 8, 6, "#3a9a6a");   // 舊照片
    R(140, 40, 30, 34, "#3a3e44"); R(142, 42, 26, 30, "#4a4e54"); R(160, 52, 6, 6, "#8a8e94"); P(163, 55, "#c9a24a"); // 保險櫃
    R(96, 54, 22, 16, "#a8865a"); R(96, 50, 22, 4, "#c8a87a"); R(100, 52, 14, 2, "#7a1e24");                         // 窗邊藤椅
    floor(70, "#8a6a4a", "#7a5a3a");
  };
  SC.mstall = (o) => {
    R(0, 0, W, 30, "#6a6e72"); R(0, 26, W, 6, "#5a5e62"); for (let x = 0; x < W; x += 30) R(x + 10, 0, 10, 30, "#7a7e82");   // 高架橋下
    wall(74, "#a8a49c", false); R(0, 30, W, 3, "#4a4e52");
    for (let i = 0; i < 2; i++){ const x = 6 + i * 34; R(x, 50, 30, 20, "#8a6a42"); R(x, 46, 30, 4, "#c8a050"); for (let j = 0; j < 5; j++) R(x + 3 + j * 5, 47, 3, 2, ["#3a9a6a", "#c8c8c8", "#d8a050", "#8a3a3a", "#3a7a5a"][j]); }
    R(80, 40, 110, 34, "#5a3a22"); R(78, 36, 114, 5, "#c23a2a"); R(110, 30, 50, 6, "#2a2218"); R(114, 31, 42, 4, "#c9a24a");   // 福記
    R(84, 50, 40, 20, "#8a6a42"); R(82, 46, 44, 4, "#c8c8c0"); for (let j = 0; j < 6; j++) R(86 + j * 6, 47, 4, 2, "#3a9a6a"); R(96, 56, 10, 4, "#c8c8c8");
    R(132, 42, 34, 30, "#3a3e44"); R(134, 44, 30, 26, o.open ? "#1a1a1a" : "#4a4e54"); if (o.open){ R(140, 54, 18, 10, "#5a3a22"); R(142, 56, 14, 2, "#e9e4da"); } else { R(156, 54, 4, 6, "#8a8e94"); }
    floor(74, "#7a7a72", "#6a6a62");
  };
  SC.qshop = (o) => {
    wall(74, "#b8b0a0", false); R(0, 66, W, 8, "#5a4a3a");
    OBJ.shelf(4, 12, 60, 4, ["#3a9a6a", "#c8c8b8", "#8a6a3a", "#5aba8a"]);
    R(70, 52, 70, 18, "#6a5a4a"); R(68, 50, 74, 3, "#8a7a6a"); R(80, 40, 6, 12, "#8a8e94"); R(78, 38, 10, 3, "#5a5e64"); R(110, 44, 14, 8, "#e8e4dc"); R(112, 46, 10, 4, "#c8c4b8");
    R(30, 50, 24, 8, "#e9e4da"); for (let i = 0; i < 3; i++) R(32, 52 + i * 2, 18, 1, "#9a9a92");
    R(150, 56, 30, 14, "#5a4a3a"); for (let i = 0; i < 6; i++) R(152 + i * 4, 52, 4, 4, "#4aca7a");
    lamp(104, 0, "#fff4c8"); floor(74, "#8a7a6a", "#7a6a5a"); dither(70, 70, 70, 4, "#d8d4c8", 3);
  };
  SC.iyard = (o) => { const ph = o.phase || 0;
    wall(74, "#9aa0a6", true); R(0, 0, W, 8, "#5a6066");
    R(20, 38, 24, 22, "#e8e4dc"); for (let i = 0; i < 6; i++) R(22, 40 + i * 3, 20, 1, "#8a8a82");
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) R(60 + i * 16, 52 - j * 11, 14, 10, (i + j) % 3 ? "#c8c8c8" : "#2a6ab8");
    R(90, 56, 30, 18, ph === 1 ? "#2a6ab8" : "#c8c8c8"); R(90, 56, 30, 3, "#4a8ad8");
    PR.seed(7); for (let i = 0; i < 30; i++) P(130 + PR.rnd() * 50, 40 + PR.rnd() * 30, "#f4f8f8");
    R(130, 60, 50, 14, "#d8dcdc"); R(132, 58, 46, 3, "#e8ecec");
    floor(74, "#7a7e80", "#6a6e70");
  };

  /* ---------- 人物造型（衣服跟著劇情走） ---------- */
  const LOOK = {
    hao:  { skin:"#e0b48c", hair:"#2a2220", hairStyle:"short", top:"#3a4a5a", hood:"#3a4a5a", bottom:"#2a2a30", beard:true, hello:"……又是你。",
            byPhase:{ 1:{ hood:null, top:"#e9e4da", coat:"#2a2f3a", bottom:"#2a2f3a", tie:"#5a2a2a" }, 2:{ hood:null, top:"#6a6e74", bottom:"#3a3e44", mood:"tired" } } },
    fang: { skin:"#f0c8a8", hair:"#1e1a18", hairStyle:"bob", top:"#e9e4da", coat:"#2a2a30", bottom:"#2a2a30", skirt:true, glasses:true, hello:"請說。我會照實回答。",
            byPhase:{ 1:{ coat:"#6a5a4a", top:"#c8b8a0", skirt:false }, 2:{ coat:"#1e1e22", top:"#e9e4da" } } },
    ma:   { age:"old", skin:"#e8c8a8", hair:"#d8d4cc", hairStyle:"bob", top:"#8a5a6a", bottom:"#4a3a3a", hello:"你是阿和的朋友嗎？" },
    maria:{ skin:"#b07a54", hair:"#1a1410", hairStyle:"long", top:"#7ab0d0", bottom:"#3a3a4a", apron:"#e9e4da", hello:"Hello……你好，請坐。" },
    su:   { skin:"#f0d0b4", hair:"#1a1410", hairStyle:"long", top:"#1e1e22", coat:"#6a6e74", bottom:"#2a2a30", skirt:true, hello:"我能幫的都會幫。",
            byPhase:{ 1:{ coat:"#1e1e22", top:"#e9e4da" }, 2:{ coat:null, top:"#a89a8a", bottom:"#4a4a52", skirt:false, mood:"tired" } } },
    du:   { age:"old", skin:"#e0b48c", hair:"#c8c8c0", hairStyle:"slick", top:"#e9e4da", coat:"#1e1e22", bottom:"#1e1e22", tie:"#7a1e24", hello:"瀚古四十年的招牌，不能毀在這裡。" },
    jiang:{ skin:"#e8c09a", hair:"#1a1410", hairStyle:"short", top:"#e9e4da", coat:"#2a2a30", bottom:"#2a2a30", tie:"#1e1e22", hello:"我真的什麼都沒做……",
            byPhase:{ 1:{ coat:null, tie:null, top:"#5a7a9a", bottom:"#3a4a6a", mood:"worried" } } },
    pei:  { skin:"#f0c8a8", hair:"#9a9490", hairStyle:"bob", top:"#c8b8d8", bottom:"#c8b8d8", hello:"警官，這麼晚了。",
            byPhase:{ 1:{ top:"#2a5a4a", bottom:"#2a5a4a", skirt:true }, 2:{ top:"#e9e4da", coat:"#3a2a3a", bottom:"#3a2a3a" } } },
    deng: { age:"old", skin:"#c99a6e", hair:"#6a6a66", hairStyle:"short", top:"#e9e4da", coat:"#2a2f3a", bottom:"#2a2f3a", tie:"#2a3a5a", hello:"有話快問，我這邊還有一堆記者。" },
    kai:  { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#f4f4f0", bottom:"#2a2a30", apron:"#1e1e22", hello:"我、我只是推車的……" },
    ho:   { age:"old", skin:"#d0a080", hair:"#3a3632", hairStyle:"slick", top:"#c8a050", bottom:"#3a3430", glasses:true, chain:true, hello:"警察來玉市？看貨還是看人？" },
    qiu:  { age:"old", skin:"#c99a6e", hair:"#d8d4cc", hairStyle:"short", top:"#6a6a5a", bottom:"#4a4a42", apron:"#8a7a5a", glasses:true, hello:"坐，小心那塊石頭，很利。" },
    xu:   { skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8", gloves:"#4a8ad8", hello:"有話快說。我在忙。",
            byPhase:{ 1:{ coat:"#f4f6f6" }, 2:{ coat:"#f4f6f6" } } },
    cai:  { age:"old", skin:"#c99a6e", hair:"#4a4a46", hairStyle:"short", top:"#3a5a8a", bottom:"#3a3a3a", hat:"cap", capColor:"#3a5a8a", hello:"卸貨區很冷，有話快說喔。" },
    cheng:{ skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#2a6ab8", bottom:"#3a3a3a", gloves:"#1e1e22", hello:"警察？找乾冰喔？" }
  };
  const DAILY = {
    hao:  [ { room:"hsec", x:150, pose:"cross", doing:"在保全室外面走來走去，一直看手機。" }, { room:"aoffice", x:60, pose:"sit", doing:"在瀚古的辦公室等保險公司的人，一直搓手錶。" }, { x:100, pose:"sit", doing:"窩在沙發上，桌上一排空酒瓶。" } ],
    fang: [ { room:"hsec", x:120, pose:"stand", doing:"站在保全室門口，手裡拿著委託合約。" }, { room:"yliving", x:80, pose:"read", doing:"在客廳看文件，旁邊是一堆帳單。" }, { room:"afront", x:60, pose:"stand", doing:"在展廳和杜總討論撤拍的事。" } ],
    ma:   [ null, { room:"yliving", x:130, pose:"sit", doing:"坐在神明桌前的藤椅上，看著先生的照片。" }, { room:"ystudy", x:100, pose:"sit", doing:"坐在書房的窗邊，手上捧著一塊空空的絨布。" } ],
    maria:[ null, { room:"yliving", x:150, pose:"broom", doing:"在客廳掃地，偷偷看著你。" }, { room:"ystudy", x:70, pose:"stand", doing:"陪在阿嬤旁邊。" } ],
    su:   [ { room:"hsuite", x:100, pose:"cross", doing:"站在展示櫃旁邊，臉色蒼白。" }, { room:"aoffice", x:120, pose:"sit", doing:"坐在辦公桌前，一直盯著同一頁目錄。" }, { x:90, pose:"sit", doing:"穿著居家服坐在沙發上，貓窩在她腳邊。" } ],
    du:   [ null, { room:"aoffice", x:150, pose:"phone", doing:"一直在講電話，跟買家道歉。" }, { room:"afront", x:140, pose:"stand", doing:"在展廳指揮員工布置今晚的拍賣會。" } ],
    jiang:[ { room:"hsec", x:40, pose:"sit", doing:"被留在保全室，坐在椅子上低著頭。" }, { room:"pinterview", x:96, pose:"sit", doing:"坐在偵訊室裡，眼睛紅紅的。" }, { room:"hsvc", x:100, pose:"stand", doing:"回來上班了，在員工備餐間整理杯子。" } ],
    pei:  [ { room:"hpei", x:60, pose:"sit", doing:"披著睡袍坐在床邊，一點都不像被吵醒的樣子。" }, { room:"hpei", x:100, pose:"read", doing:"在看那本泛黃的圖錄。" }, { room:"afront", x:30, pose:"stand", doing:"在展廳看那對翡翠鐲子。" } ],
    deng: [ { room:"hsec", x:80, pose:"stand", doing:"站在螢幕牆前，雙手抱胸。" }, { room:"hsec", x:80, pose:"phone", doing:"在講電話，被總經理罵。" }, { room:"hlobby", x:140, pose:"stand", doing:"站在員工出口，親自開箱檢查每一台外燴推車。" } ],
    kai:  [ { room:"hdock", x:60, pose:"stand", doing:"被叫到卸貨區，一臉睡意。" }, { room:"hdock", x:70, pose:"hold", doing:"在卸貨區搬貨。" }, { room:"hdock", x:70, pose:"hold", doing:"在卸貨區搬貨，看到你就縮了一下。" } ],
    ho:   [ null, null, { x:110, pose:"stand", doing:"站在攤位後面，身後是一個老保險櫃。" } ],
    qiu:  [ null, { x:100, pose:"brush", doing:"在工作台前磨一塊玉，戴著放大眼鏡。" }, { x:100, pose:"brush", doing:"在磨一尊觀音像。" } ],
    xu:   [ { room:"hsuite", x:150, pose:"kneel", facing:-1, doing:"蹲在展示櫃前採證，頭也不抬。" }, { x:80, pose:"stand", doing:"在實驗台前，一邊吃麵包一邊看顯微鏡。" }, { x:80, pose:"stand", doing:"在實驗台前寫報告。" } ],
    cai:  [ { room:"hdock", x:30, pose:"stand", doing:"站在登記簿旁邊，搓著手取暖。" }, { room:"hdock", x:30, pose:"stand", doing:"在登記簿上寫東西。" } ],
    cheng:[ null, { x:120, pose:"hold", doing:"在倉庫搬保冷箱，手套結了一層霜。" } ]
  };
  EP4.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });
  // 監視器、重現裡出現的人
  const L0 = id => { const L = Object.assign({}, LOOK[id]); delete L.hello; delete L.byPhase; return L; };
  EP4.looks = {
    haoL: L0("hao"), fangL: L0("fang"), peiL: Object.assign(L0("pei"), { top:"#2a5a4a", bottom:"#2a5a4a", skirt:true }),
    suL: Object.assign(L0("su"), { coat:null }), suC: L0("su"), jiangL: L0("jiang"), kaiL: L0("kai"), dengL: L0("deng"),
    guo: { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#2a2f3a", bottom:"#2a2f3a", tie:"#1e1e22" },
    cheng: L0("cheng"), cai: L0("cai"), xuL: L0("xu"),
    haoY: { skin:"#e0b48c", hair:"#2a2220", hairStyle:"short", top:"#3a3a3a", bottom:"#2a2a30", prop:"bag" }
  };

  /* ---------- 房間（＝走動畫面的區域）和隱藏小細節 ---------- */
  EP4.rooms = {
    hotel: [
      { id:"hlobby", name:"酒店大廳", scene:"hlobby", details:[
        { id:"d4_chand", name:"水晶吊燈", hot:[60,4,72,20], text:"大廳的水晶吊燈有三層樓高。櫃檯的人說，光是擦一次就要兩天。" },
        { id:"d4_exit", name:"員工出口", hot:[124,34,40,36], text:"員工出口有一張檢查桌，桌上貼著「宴會部推車免檢」的舊公告，紙都黃了。" } ] },
      { id:"hsec", name:"保全室", scene:"hsec", details:[
        { id:"d4_shift", name:"值班表", hot:[4,10,16,48], text:"夜班只有一個保全看螢幕，另一個巡樓。昨晚巡樓的是小郭。" } ] },
      { id:"hdock", name:"B2 卸貨區", scene:"hdock", opt:ph=>({ boxes: ph === 0 ? false : false }), details:[
        { id:"d4_stripe", name:"地上的黃線", hot:[0,90,192,6], text:"黃線外是貨車的位置。今天早上的輪胎印還很新。" } ] },
      { id:"hsvc", name:"31 樓員工備餐間", scene:"hsvc", details:[
        { id:"d4_lift", name:"員工電梯", hot:[10,22,30,52], text:"員工電梯只有刷員工卡才會動。電梯裡面有監視器。" } ] },
      { id:"hcorr", name:"32 樓走廊", scene:"hcorr", details:[
        { id:"d4_light", name:"壁燈", hot:[8,18,6,10], text:"走廊的壁燈整晚都亮著，監視器拍得很清楚。" } ] },
      { id:"hsuite", name:"3202 客廳・展示區", scene:"hsuite", details:[
        { id:"d4_view", name:"窗外", hot:[4,8,50,50], text:"窗外是 101。凌晨三點多，整個信義區只剩下幾盞燈。" },
        { id:"d4_vent", name:"冷氣出風口", hot:[60,0,30,6], text:"冷氣設定 24 度。這個房間不會冷到讓玻璃起霧。" } ] },
      { id:"hpantry", name:"3202 小備餐間", scene:"hpantry", details:[
        { id:"d4_fridge", name:"小冰箱", hot:[170,30,20,40], text:"冰箱裡只有幾瓶香檳和一盒草莓。冷凍庫小到放不下一盒冰淇淋。" } ] },
      { id:"hpei", name:"3201 林佩珊的套房", scene:"hpei", requires:["pei1","cctv_corr"], details:[
        { id:"d4_peiview", name:"窗外", hot:[140,8,46,46], text:"從 3201 的窗戶看出去，跟隔壁一模一樣的夜景。兩間套房之間沒有相通的門。" } ] }
    ],
    police: [
      { id:"pdesk", name:"刑事組辦公室", scene:"police", details:[
        { id:"d4_sofa", name:"沙發", hot:[140,56,40,16], text:"你剛剛在這張沙發上睡了一個半小時。脖子到現在還在痛。" } ] },
      { id:"pinterview", name:"偵訊室", scene:"interview", phase:1, until:1, details:[
        { id:"d4_cup", name:"紙杯", hot:[80,60,10,8], text:"江明哲面前的紙杯，水一口都沒喝。" } ] }
    ],
    lab: [ { id:"lab", name:"刑大鑑識中心", scene:"lab", details:[
      { id:"d4_box", name:"舊工具箱", hot:[130,46,30,20], text:"舊工具箱的鎖扣上，刻著一行很小的字：「許振業 1998」。" } ] } ],
    auction: [
      { id:"afront", name:"瀚古展廳", scene:"afront", details:[
        { id:"d4_logo", name:"招牌", hot:[70,6,52,12], text:"「瀚古拍賣　since 1986」。展廳的燈光，每一盞都打在拍品上。" } ] },
      { id:"aoffice", name:"辦公室", scene:"acctoffice", opt:{ who:"lin" }, details:[
        { id:"d4_award", name:"牆上的獎狀", hot:[150,18,32,26], text:"「2019 年度最佳鑑定師　蘇曼文」。框得很正。" } ] },
      { id:"aarchive", name:"資料室", scene:"archive", details:[
        { id:"d4_files", name:"一整排檔案", hot:[16,20,68,50], text:"每一件拍品都有一個檔案夾。貔貅那一夾，被人翻得邊角都捲起來了。" } ] }
    ],
    yehome: [
      { id:"yliving", name:"葉家客廳", scene:"living", details:[
        { id:"d4_clock", name:"老座鐘", hot:[170,20,16,40], text:"座鐘停在三點十二分。瑪莉亞說它停了好幾年了，阿嬤不准人修。" } ] },
      { id:"ystudy", name:"葉父的書房", scene:"ystudy", details:[
        { id:"d4_books", name:"書架", hot:[4,8,30,50], text:"一整排《故宮文物月刊》，從 1983 年到 2024 年，一期都沒缺。" } ] }
    ],
    haoapt: [ { id:"hapt", name:"葉承浩的公寓", scene:"apartment", opt:{ who:"zheng" }, details:[
      { id:"d4_haobed", name:"床頭", hot:[140,40,40,20], text:"床頭櫃上壓著一張催繳單，信封已經拆過，又被揉成一團。" } ] } ],
    qiu: [ { id:"qshop", name:"邱師傅玉雕工作室", scene:"qshop", details:[
      { id:"d4_dust", name:"地上的粉", hot:[70,70,70,4], text:"地上一層白色的石粉。老邱說：「玉越磨越亮，人越磨越老。」" } ] } ],
    ice: [ { id:"iyard", name:"極凍乾冰倉庫", scene:"iyard", details:[
      { id:"d4_frost", name:"倉庫的門", hot:[0,30,16,44], text:"倉庫門口貼著：「禁止密閉空間存放乾冰：二氧化碳會讓人窒息」。" } ] } ],
    suhome: [ { id:"sroom", name:"蘇曼文的家", scene:"studio", details:[
      { id:"d4_suphoto", name:"相框", hot:[110,48,60,10], text:"相框裡是蘇曼文剛進瀚古時的照片，站在杜總旁邊，笑得很開心。" } ] } ],
    market: [ { id:"mstall", name:"建國假日玉市・福記", scene:"mstall", opt:(ph,has)=>({ open: has("e_ho_safe") }), details:[
      { id:"d4_bridge", name:"高架橋", hot:[0,0,W,30], text:"頭上的車聲轟隆隆的。玉市在橋下開了三十年。" } ] } ]
  };

  /* ---------- 監視器動畫（每一段的動作都要和字幕一樣） ---------- */
  const ANIM = {
    cctv_corr: { scene:"hcorr", opt:{ phase:1 }, cam:"32F CORRIDOR", date:"2026-03-19", beats:[
      { t:"22:05:00", d:3, cap:"葉承浩、葉承芳從 3202 出來，走向客梯。", m:{ haoL:[-14,96,null,-1,100,76], fangL:[-20,98,null,-1,104,76] }, out:["haoL","fangL"] },
      { t:"22:15:00", d:3, cap:"林佩珊從 3202 出來，刷卡進入隔壁 3201。", m:{ peiL:[42,76,null,-1,100,76] }, out:["peiL"] },
      { t:"22:20:00", d:3, cap:"江明哲推著餐車，從 3202 走進員工通道門。", m:{ jiangL:[162,76,"hold",1,100,76] }, out:["jiangL"] },
      { t:"22:36:00", d:3, cap:"王凱文推著一車杯架，走進員工通道門。", m:{ kaiL:[162,76,"hold",1,100,76] }, out:["kaiL"] },
      { t:"22:48:00", d:3, cap:"江明哲從員工通道門出來，刷卡進入 3202。", m:{ jiangL:[100,76,null,-1,162,76] }, out:["jiangL"] },
      { t:"22:58:00", d:3, cap:"王凱文回來，刷卡進入 3202。", m:{ kaiL:[100,76,null,-1,162,76] }, out:["kaiL"] },
      { t:"23:05:00", d:3.5, cap:"王凱文推著第二車（上面有一個藍色保冷箱）進入員工通道門；江明哲跟在後面。", m:{ kaiL:[162,76,"hold",1,100,76], jiangL:[162,78,null,1,92,78] }, out:["kaiL","jiangL"] },
      { t:"23:10:00", d:3, cap:"蘇曼文和鄧志強從 3202 出來，走向客梯。", m:{ suC:[-14,96,null,-1,100,76], dengL:[-20,98,null,-1,104,76] }, out:["suC","dengL"] },
      { t:"02:51:00", d:3, cap:"江明哲刷卡進入 3202。", m:{ jiangL:[100,76,null,1,162,76] }, out:["jiangL"] },
      { t:"02:58:00", d:3, cap:"江明哲出來，一邊走一邊把手機貼在耳朵上。", m:{ jiangL:[162,76,"phone",1,100,76] }, out:["jiangL"] },
      { t:"03:14:00", d:3, cap:"鄧志強和保全小郭跑進 3202。", m:{ dengL:[100,76,null,1,-14,96], guo:[104,76,null,1,-20,98] }, out:["dengL","guo"] }
    ] },
    cctv_svc: { scene:"svclift", cam:"STAFF LIFT", date:"2026-03-19", beats:[
      { t:"22:21:00", d:3, cap:"江明哲推餐車進電梯，從 32 樓下到 31 樓。", m:{ jiangL:[90,98,"hold",-1,200,98] } },
      { t:"22:37:00", d:3, cap:"王凱文推著一車杯架，從 32 樓下到 B2。", m:{ kaiL:[90,98,"hold",-1,200,98], jiangL:[220,98,null,1] }, out:["jiangL"] },
      { t:"22:56:00", d:2.5, cap:"王凱文空手從 B2 回到 32 樓。", m:{ kaiL:[96,98,"stand",-1,200,98] } },
      { t:"23:05:00", d:3.5, cap:"王凱文推第二車下 B2，車上一個藍色保冷箱。他推得很吃力，停下來喘了一口氣。", m:{ kaiL:[90,98,"hold",-1,200,98] } },
      { t:"23:06:00", d:2.5, cap:"江明哲從 31 樓搭到 1 樓，下班。", m:{ jiangL:[96,98,"stand",-1,200,98], kaiL:[220,98,null,1] }, out:["kaiL"] }
    ] },
    cctv_lobby: { scene:"hlobby", opt:{ phase:1 }, cam:"LOBBY STAFF EXIT", date:"2026-03-19", beats:[
      { t:"23:14:00", d:4, cap:"蘇曼文走到員工出口，保全小郭打開她的手提包檢查，翻了翻，放行。", m:{ suC:[130,98,"hold",-1,200,98], guo:[150,96,"point",-1] } },
      { t:"23:15:00", d:3, cap:"她走出去，在門口攔了一台計程車。", m:{ suC:[180,80,null,1], guo:[150,96,"stand",-1] }, out:["suC"] }
    ] },
    cctv_dock: { scene:"hdock", opt:{ boxes:true }, cam:"B2 DOCK", date:"2026-03-19", beats:[
      { t:"23:07:00", d:3.5, cap:"王凱文把藍色保冷箱推進冷藏室。", m:{ kaiL:[140,98,"hold",1,10,98] }, out:["kaiL"] },
      { t:"06:20:00", d:3.5, cap:"極凍乾冰的貨車停進來，司機搬走三個保冷箱，包括那個藍色的。", cars:{ tr:[-60,40,"#e8e8e4"] }, m:{ cheng:[140,98,"hold",-1,60,98] } },
      { t:"07:00:00", d:3.5, cap:"蘇曼文快步走進卸貨區，跟老蔡講話，一直往冷藏室裡看。", m:{ suL:[120,98,"point",1,-14,98], cai:[40,98,"stand",1] } },
      { t:"07:02:00", d:3, cap:"她走到一邊打電話，打了很久。", m:{ suL:[70,98,"phone",-1], cai:[40,98,"stand",1] } }
    ] },
    cctv_party: { scene:"hsuite", opt:{ phase:1, case:"full" }, cam:"瀚古 PROMO", date:"2026-03-19", clean:true, beats:[
      { t:"20:00:00", d:3.5, cap:"揭幕：外燴推出乾冰，白霧從展示櫃底下湧出來，大家拍手。", m:{ kaiL:[110,98,"hold",1], fangL:[60,98,"stand",1], haoL:[40,98,"stand",1], peiL:[84,98,"stand",1] } },
      { t:"21:30:00", d:3, cap:"管家江明哲站在角落，偷偷用手機拍了一張貔貅。", m:{ jiangL:[170,98,"phone",-1] } },
      { t:"21:50:00", d:4, cap:"蘇曼文打開展示櫃，林佩珊拿起貔貅，用紫外線手電筒照了很久，指著左耳說話。蘇曼文笑著搖頭。", m:{ suL:[118,98,"stand",1], peiL:[150,98,"point",-1] }, out:["jiangL"] },
      { t:"21:55:00", d:4, cap:"林佩珊走開。蘇曼文自己拿起放大鏡，對著貔貅看。她的手停在半空中，大概有十秒鐘一動也不動。", m:{ peiL:[60,98,null,-1], suL:[130,98,"read",1] } },
      { t:"22:03:00", d:3, cap:"她走到窗邊打電話，對方好像沒接。", m:{ suL:[30,98,"phone",-1,130,98] } }
    ] }
  };
  [...EP4.cctv, ...EP4.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  const PS = [["hsuite",{phase:0}],["police",{}],["afront",{}]];
  EP4.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 結案：拍賣會開始前，所有人到瀚古的展廳 ---------- */
  EP4.court = {
    title: "瀚古展廳・拍賣會前一小時", scene: "afront", opt:{ court:true },
    who: ph => ["su","hao","fang","jiang","pei","kai"],
    open: ph => "拍賣會開始前一小時，你請所有人到瀚古的展廳。椅子已經排好了，貔貅的位置空著。杜總站在最後面，雙手抱胸。",
    kindLine: {
      theft: "我的結論是——貔貅是被人拿走的。而且，拿走它的不只一個人。",
      fraud: "我的結論是——這是葉家自己演的一場戲，為了一億二千萬的保險金。",
      lost: "我的結論是——沒有人偷。是展示櫃出了問題，東西被收錯了地方。"
    },
    murmur: [ "（林佩珊翹起腳，好像在看一場好戲。）", "（葉承浩一直搓著手錶，額頭在冒汗。）", "（蘇曼文低著頭，手指緊緊扣在一起。）" ],
    confess: {
      su: [ "……21:55，我看到了樹脂裡的氣泡。", "鑑定書是我簽的。再錯一次，我就完了。", "我只是想讓它消失。我沒有想要它的錢……我甚至不知道真的那一件在哪裡。" ],
      hao: [ "……是我。去年八月，我把真的拿去押了。", "我以為賭贏了就能贖回來。我沒想到我妹會堅持拍賣。", "媽……她摸得出來。只有她摸得出來。" ]
    },
    cornered: { su: "……我要先跟公司的律師談。", hao: "我什麼都不會說。" },
    deny: {
      jiang: "我只是回去拿手機……真的！",
      pei: "我？我想要它，可是我要的是真的那一件。",
      kai: "我只是推車的！我什麼都不知道！",
      fang: "我是律師。你說這種話，要負責任。",
      ho: "我收的是抵押品，有借據，合法的。"
    },
    kindTrue: "",
    replayText: "3 月 19 日晚上，雲頂酒店 3202 裡真正發生的事——",
    replay: { scene:"hsuite", opt:{ phase:1, case:"full" }, clean:true, cam:"案發經過重現", date:"2026-03-19", beats:[
      { t:"21:55:00", d:4, cap:"林佩珊走開後，蘇曼文用放大鏡看到了樹脂裡的小氣泡。這是假貨——而鑑定書是她簽的。", m:{ suL:[130,98,"read",1] } },
      { t:"22:36:00", d:3.5, cap:"管家和外燴都離開了。套房裡只剩她一個人。", m:{ suL:[130,98,"stand",-1], kaiL:[220,98,"hold",1,160,98] }, out:["kaiL"] },
      { t:"22:39:00", d:4, cap:"她到備餐間，用外燴的電子秤，把一塊乾冰削到 527 公克，包進絲綢小袋。", m:{ suL:[176,98,"hold",1,130,98] } },
      { t:"22:40:00", d:4, cap:"二號鑰匙，維修模式 53 秒：仿品拿出來，乾冰放進去。展示櫃裡的溫度一下子掉到 3 度。", m:{ suL:[134,98,"hold",-1,176,98] } },
      { t:"22:43:00", d:3.5, cap:"仿品用兩條餐巾包好，塞進外燴保冷箱最底下的乾冰下面。", m:{ suL:[176,98,"kneel",1,134,98] } },
      { t:"23:05:00", d:3.5, cap:"不知情的王凱文，把保冷箱推下 B2。23:08，展示區的移動偵測打開了。", m:{ kaiL:[220,98,"hold",1,176,98], suL:[110,98,"stand",1] }, out:["kaiL"] },
      { t:"03:12:00", d:4, cap:"四個半小時，乾冰一點一點昇華成二氧化碳。重量慢慢變輕，感應器一直當成誤差——直到剩不到一成。", m:{} },
      { t:"2025-08-02", d:4, cap:"而真正的貔貅，早在去年 8 月 2 日的半夜，就被葉承浩從天母的保險櫃裡換走了。", m:{ haoY:[200,98,"hold",1,40,98] }, out:["haoY"] }
    ] },
    endGood: "拍賣會照常開始，貔貅撤拍。何永福交出了真品，葉老太太捧著它，摸了很久，說：「這才是阿和的。」\n收隊的時候，許知夏把她的工具箱扛上車，跟你說：「下個月見。我調去澄港了。」",
    endBad: "拍賣會照常開始。你總覺得，這間展廳裡有人悄悄鬆了一口氣。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[4] && ARC_INTER[4].after) EP4.after = ARC_INTER[4].after;
})();
