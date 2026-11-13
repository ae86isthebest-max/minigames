/* =========================================================
   第 3 集：像素畫設定
   - 新場景（PX.SCENES）：倉庫、解剖室、事務所、公寓、市場、便利商店……
   - LOOK：人物造型（byPhase 依天數改變；衣服跟著劇情）
   - DAILY：每個人每天在哪個房間、在做什麼
   - ROOMS：每個地點的房間（＝走動畫面的區域）和隱藏小細節
   - ANIM：監視器畫面的動畫（每一段都要跟字幕一致）
   - COURT：最後在分局會議室說出推理
   座標都是 192×108 的畫布座標
   ========================================================= */
EP3.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, shade, OBJ, windowBox, door, sign, lamp, INK } = PR;
  const W = 192, H = 108;
  const sky = (a, b, h) => PR.sky(a, b, h), wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const tile = (x, y, w, h, c, s = 8) => { R(x, y, w, h, c); for (let i = x; i < x + w; i += s) R(i, y, 1, h, shade(c, -.12)); for (let j = y; j < y + h; j += s) R(x, j, w, 1, shade(c, -.12)); };
  const box = (x, y, w, h, c) => { R(x, y, w, h, c); R(x, y, w, 1, shade(c, .25)); R(x, y + h - 1, w, 1, shade(c, -.3)); R(x + w / 2 - 3, y + 2, 6, 3, "#e9e4da"); };
  const shelfRack = (x, y, w, h, rows, fill) => { R(x, y, 2, h, "#5a6068"); R(x + w - 2, y, 2, h, "#5a6068"); for (let r = 0; r <= rows; r++){ const yy = y + r * (h / rows); R(x, yy, w, 2, "#7a8088"); if (r < rows && fill) fill(x + 3, yy + 2, w - 6, h / rows - 3, r); } };
  const blood = (x, y, w, h, c = "#6e1712") => { PR.seed(x * 13 + y); for (let i = 0; i < w * h / 3; i++){ const a = PR.rnd() * w, b = PR.rnd() * h; const d = Math.hypot(a - w / 2, (b - h / 2) * 1.8) / (w / 2); if (d < 1) P(x + a, y + b, d < .6 ? c : shade(c, .15)); } };
  const drip = (x, y, n, c = "#6e1712") => { for (let i = 0; i < n; i++) R(x + i * 2, y + (i % 2), 1, 2 + (i * 3) % 4, c); };
  const marker = (x, y, n) => OBJ.marker(x, y, n);
  const tape = (x, y, w) => OBJ.tape(x, y, w);
  const cctvDome = (x, y) => { R(x, y, 10, 3, "#d6d6d6"); R(x + 2, y + 3, 6, 4, "#2a2a2e"); P(x + 6, y + 4, "#e04a3a"); };
  const plant = (x, y) => OBJ.plant(x, y);
  const windowCity = (x, y, w, h, ph) => { R(x - 1, y - 1, w + 2, h + 2, "#3a3e44"); R(x, y, w, h, ph === 4 ? "#e0a070" : "#a8bccc"); PR.seed(x); for (let i = 0; i < w; i += 7){ const hh = 6 + PR.rnd() * (h - 6); R(x + i, y + h - hh, 6, hh, "#7a8a9a"); for (let j = y + h - hh + 2; j < y + h - 1; j += 3) P(x + i + 2, j, "#d6e2ea"); } R(x + w / 2, y, 1, h, "#3a3e44"); };

  /* =================== 宏昌倉儲 =================== */
  SC.wlane = (o) => { const ph = o.phase || 0;
    sky("#4e6078", "#8aa0b8", 40);
    // 遠處的堤防和河
    R(0, 34, W, 8, "#5a6a5a"); R(0, 40, W, 3, "#4a5a4a");
    // 圍牆（水泥）＋鐵絲網
    R(0, 30, W, 44, "#8e8e86"); for (let x = 0; x < W; x += 24) R(x, 30, 1, 44, "#7a7a72"); R(0, 30, W, 2, "#a8a8a0");
    for (let x = 0; x < W; x += 6){ R(x, 26, 1, 4, "#5a5a58"); P(x + 3, 27, "#7a7a78"); } R(0, 27, W, 1, "#6a6a68");
    dither(0, 60, W, 14, "#6e6e66", 3);
    // 側門（鐵門＋對講機）
    R(137, 35, 26, 39, INK); R(138, 36, 24, 38, "#5a646e"); R(140, 38, 20, 16, "#4e5862"); R(140, 56, 20, 16, "#4e5862"); P(158, 56, "#d9b75b");
    R(166, 46, 6, 9, "#2a2a2e"); R(167, 47, 4, 3, "#6fa0d0"); P(169, 52, "#e04a3a");
    if (ph <= 1) R(155, 56, 2, 1, "#5a1a14");
    // 泥地
    R(0, 74, W, 34, "#6a5a44"); dither(0, 74, W, 34, "#5a4a36", 3);
    for (let i = 0; i < 6; i++) R(10 + i * 30, 82 + (i % 3) * 7, 14, 3, "#4a5a6a");   // 水窪
    if (ph <= 1){
      for (let x = 18; x < 96; x += 2){ P(x, 86 + Math.sin(x / 9), "#4a3a28"); P(x, 92 + Math.sin(x / 9), "#4a3a28"); }  // 車胎痕
      for (let x = 22; x < 82; x += 3) P(x, 99 + Math.sin(x / 6), "#4a3a28");  // 機車胎痕
      for (let i = 0; i < 6; i++) R(96 + i * 7, 88 - i * 2, 3, 2, "#3a2c1e");   // 皮鞋腳印走向側門
      for (let i = 0; i < 4; i++) R(40 + (i % 2) * 4, 76 + i * 2, 3, 2, "#e9e4da"); // 雨鞋（白色泥印）
      if (ph === 0){ marker(30, 80, 1); marker(100, 84, 2); marker(150, 76, 3); }
    }
    // 小巷盡頭的水溝
    R(100, 98, 40, 6, "#3a4048"); for (let x = 100; x < 140; x += 4) R(x, 98, 2, 6, "#2a2e34");
    for (let i = 0; i < 8; i++){ R(i * 25 + 4, 66, 2, 8, "#4a6a3a"); P(i * 25 + 3, 66, "#5a8a4a"); }
  };
  SC.wyard = (o) => { const ph = o.phase || 0;
    sky("#4e6078", "#8aa0b8", 24);
    // 倉庫正面：一排鐵捲門
    R(40, 22, 152, 52, "#a8aeb4"); R(38, 18, 156, 5, "#6a7078");
    ["B-10", "B-11", "B-12"].forEach((t, i) => { const x = 50 + i * 48; R(x, 34, 38, 40, "#7e868e"); for (let y = 36; y < 74; y += 3) R(x, y, 38, 1, "#6e767e");
      R(x + 12, 26, 14, 6, "#2a3a5a"); R(x + 14, 28, 10, 2, "#e9e4da");
      if (i === 2){ R(x, 56, 38, 18, ph === 0 ? "#2a2a26" : "#3a3a36"); if (ph === 0) dither(x, 58, 38, 16, "#ffd98a33", 3); } });
    // 大門（左邊的滑門）
    R(0, 40, 36, 34, "#5a5a58"); for (let x = 2; x < 36; x += 4) R(x, 42, 2, 32, "#8a8a86"); R(0, 40, 36, 2, "#9a9a96"); R(0, 56, 36, 2, "#9a9a96");
    R(36, 30, 4, 44, "#6a6a66"); R(36, 30, 4, 2, "#e04a3a"); R(35, 50, 6, 8, "#3a3a3e"); R(36, 51, 4, 2, "#8ab0c8"); P(38, 55, "#e8c040");   // 側門的對講機
    // 地面
    R(0, 74, W, 34, "#5a5a56"); dither(0, 74, W, 34, "#4e4e4a", 4); for (let x = 0; x < W; x += 20) R(x, 90, 10, 1, "#c9c9a0");
    // 水溝蓋和菸蒂
    R(28, 94, 22, 6, "#3a3a3a"); for (let x = 29; x < 50; x += 3) R(x, 95, 1, 4, "#222");
    if (ph <= 1){ OBJ.cig(32, 93); OBJ.cig(38, 92); OBJ.cig(44, 94); }
    // 死者的白色 Lexus
    if (!o.noCar){ OBJ.car(100, 66, "#e8e8e4"); R(108, 66, 22, 2, "#c8c8c4"); }
    if (ph <= 1){ tape(96, 102, 70); R(150, 84, 4, 2, "#1a1a1a"); }
    if (ph === 0){ marker(120, 86, 4); }
  };
  SC.wguard = (o) => { const ph = o.phase || 0;
    wall(70, "#c8c4b4", false); R(0, 60, W, 10, "#8a8676");
    // 監視器主機和四個螢幕
    R(22, 28, 64, 38, "#2a2a2e"); for (let i = 0; i < 4; i++){ const x = 25 + (i % 2) * 31, y = 31 + Math.floor(i / 2) * 16; R(x, y, 28, 13, "#0d1a12"); for (let j = 0; j < 13; j += 2) R(x, y + j, 28, 1, "#12261a"); R(x + 2, y + 2, 2, 2, "#e04a3a"); }
    OBJ.desk(16, 66, 80); R(60, 62, 22, 6, "#d8c89a"); R(62, 63, 18, 1, "#6a5a4a"); R(62, 65, 14, 1, "#6a5a4a");
    // 小電視、便當
    R(110, 36, 34, 24, "#1e1e22"); R(112, 38, 30, 18, "#3a5a6a"); R(120, 60, 18, 3, "#2a2a2e"); OBJ.desk(104, 66, 46); R(112, 62, 12, 4, "#e9e4da"); R(114, 61, 8, 1, "#c9763a");
    // 門禁主機
    R(150, 30, 26, 24, "#d8d8d0"); R(152, 32, 22, 10, "#1a2a3a"); for (let i = 0; i < 6; i++) R(153 + (i % 3) * 7, 44 + Math.floor(i / 3) * 4, 5, 3, "#9a9a92"); P(172, 33, "#3fd46f");
    windowBox(110, 8, 40, 20, "#9cb4c8"); R(160, 60, 12, 10, "#5a5a52"); plant(176, 64);
    floor(70, "#9a9688", "#8a8678"); R(30, 4, 30, 14, "#e9e4da"); R(32, 6, 26, 2, "#c23a2a"); for (let i = 0; i < 4; i++) R(33, 10 + i * 2, 20, 1, "#9a9a92");
  };
  SC.wfront = (o) => { const ph = o.phase || 0;
    wall(74, "#b8bcbe", false); floor(74, "#8a8c88", "#7a7c78"); dither(0, 74, W, 34, "#7e807c", 4); for (let y = 8; y < 74; y += 10) R(0, y, W, 1, "#a8acae");
    R(0, 0, W, 6, "#6a7078"); for (let x = 10; x < W; x += 30) R(x, 0, 2, 8, "#5a6068");
    // 左：鐵架上的檔案箱
    shelfRack(4, 16, 54, 56, 3, (x, y, w, h, r) => { for (let i = 0; i < 3; i++) box(x + i * 16, y + 2, 14, h - 2, ["#b89a6a", "#a88a5a", "#c8a87a"][(i + r) % 3]); });
    // 中：打包桌
    R(70, 60, 60, 4, "#7a6a54"); R(72, 64, 3, 10, "#5a4a3a"); R(125, 64, 3, 10, "#5a4a3a"); R(70, 60, 60, 1, "#9a8a74");
    R(76, 54, 14, 6, "#3a3a3e"); R(78, 52, 8, 4, "#c8a050"); R(94, 56, 18, 4, "#b89a6a"); R(116, 57, 8, 2, "#d0d0d0"); R(116, 57, 3, 2, "#e8c43a");
    R(130, 66, 4, 6, "#e9e4da"); R(131, 68, 2, 2, "#2a2a2e"); R(134, 66, 10, 1, "#2a2a2e"); R(144, 66, 1, 4, "#2a2a2e");   // 插座和充電線
    // 垃圾桶
    R(44, 82, 16, 16, "#4a5a4a"); R(43, 81, 18, 2, "#3a4a3a"); R(48, 80, 6, 3, "#e9e4da");
    // 右：行李箱（打開、被翻過）
    R(142, 74, 40, 14, "#2c3e5c"); R(142, 60, 40, 3, "#2c3e5c"); R(144, 63, 36, 11, "#3a4e6e"); R(146, 66, 10, 6, "#e9e4da"); R(158, 65, 8, 5, "#8aa0c0"); R(168, 78, 12, 8, "#c8b080");
    R(160, 70, 6, 3, "#c8a050");   // 泰銖
    
    // 桌腳下的包裝袋
    R(98, 86, 14, 7, "#e9eef2"); R(100, 88, 6, 2, "#2a5ad8");
    if (ph === 0){ marker(84, 76, 5); marker(146, 92, 6); OBJ.tape(0, 104, W); }
    // 半開的鐵捲門（光從外面照進來）
    R(186, 20, 6, 54, "#7e868e"); dither(166, 74, 26, 34, "#e9e4da22", 3);
  };
  SC.wback = (o) => { const ph = o.phase || 0, body = ph === 0;
    // 結案重現（o.replay）：o.p＝播到哪裡。血、牆上的字、桌上的手指要照時間慢慢出現
    let st = {}; if (o.replay && o.seq && o.ds){ let el = 0, t = o.t || 0; for (let i = 0; i < o.ds.length; i++){ const en = el + (o.ds.j && o.ds.j[i] ? 0 : 0.5) + o.ds[i]; if (t < en || i === o.ds.length - 1){ st = o.seq[i] || {}; break; } el = en; } }
    const rp = o.replay ? (o.seq ? (st.late ? 1 : st.mid ? 0.5 : st.cut ? 0.1 : 0) : (o.p || 0)) : 1, late = rp >= 0.8, mid = rp >= 0.42;
    wall(74, "#e4e2da", false); R(0, 0, W, 6, "#6a7078");
    // 牆上的血字
    const red = "#7a1a14";
    if (late) [[44,14],[62,14],[80,14],[98,14]].forEach(([x,y],k) => { R(x, y, 12, 2, red); R(x + 5, y, 2, 16, red); R(x + 1, y + 6, 10, 2, red); R(x + (k%2?2:8), y + 10, 3, 2, red); drip(x + 2, y + 16, 3, red); });
    // 右：鐵架上的檔案箱（有噴濺血點）
    shelfRack(146, 16, 44, 58, 3, (x, y, w, h, r) => { for (let i = 0; i < 2; i++) box(x + i * 19, y + 2, 17, h - 2, ["#b89a6a", "#a88a5a"][(i + r) % 2]); });
    PR.seed(9); if (mid) for (let i = 0; i < 40; i++) P(148 + PR.rnd() * 30, 22 + PR.rnd() * 30, red);
    // 左：鐵架最下層（藥瓶滾到底下）
    shelfRack(4, 40, 34, 46, 2, (x, y, w, h) => box(x, y + 1, w, h - 1, "#a88a5a"));
    floor(74, "#8a8c88", "#7a7c78");
    R(14, 92, 4, 5, "#e9e4da"); R(14, 91, 4, 1, "#c23a2a"); P(20, 96, "#fff"); P(23, 95, "#fff"); P(26, 97, "#fff");
    // 地上的血
    if (mid){ blood(64, 82, 64, 18); blood(124, 76, 30, 10, "#5a1410"); } else if (rp > 0.04) blood(86, 90, 18, 6);
    // 輪子痕
    for (let x = 40; x < 80; x += 3){ P(x, 98, "#6a6c68"); P(x, 102, "#6a6c68"); }
    // 摺疊桌
    R(128, 62, 48, 3, "#9aa0a6"); R(132, 65, 2, 12, "#7a8086"); R(170, 65, 2, 12, "#7a8086");
    if (body){ for (let i = 0; i < 9; i++){ R(132 + i * 4.6, 59, 2, 3, "#d8b89a"); P(132 + i * 4.6, 59, "#e8d0c0"); P(133 + i * 4.6, 61, red); } }
    else if (late) { for (let i = 0; i < 9; i++) P(133 + i * 4.6, 61, red); }
    // 血腳印
    if (late){ R(120, 94, 6, 3, "#5a1410"); R(121, 93, 4, 1, "#5a1410"); } dither(118, 92, 14, 8, "#8a8c8822", 2);
    // 辦公椅＋死者
    const cx = 96;
    if (mid) { R(cx - 10, 84, 20, 3, "#2a2a2e"); R(cx - 1, 76, 3, 9, "#2a2a2e"); R(cx - 12, 88, 2, 2, INK); R(cx + 10, 88, 2, 2, INK);
    if (o.replay){ R(cx - 11, 62, 3, 22, "#1e1e22"); R(cx + 8, 62, 3, 22, "#1e1e22"); } else { R(cx - 9, 66, 18, 12, "#1e1e22"); R(cx - 8, 46, 16, 22, "#1e1e22"); } }
    if (body){
      R(cx - 7, 50, 14, 18, "#e9e4da"); R(cx - 7, 50, 14, 2, "#c8c4b8"); R(cx - 1, 52, 2, 14, "#2a3a6a");                  // 白襯衫、領帶
      R(cx - 9, 50, 2, 16, "#3a3e46"); R(cx + 7, 50, 2, 16, "#3a3e46");                                               // 西裝
      R(cx - 5, 38, 10, 11, "#d8b090"); R(cx - 5, 37, 10, 3, "#3a3632"); P(cx - 3, 43, INK); P(cx + 2, 43, INK); R(cx - 2, 46, 4, 2, "#e9e4da");   // 頭、嘴裡的布
      R(cx - 6, 66, 12, 14, "#3a3e46"); R(cx - 6, 79, 5, 6, "#3a3e46"); R(cx + 1, 79, 5, 6, "#3a3e46");
      // 綁在扶手上的手（膠帶）
      R(cx - 14, 64, 6, 4, "#c8a050"); R(cx + 8, 64, 6, 4, "#c8a050"); R(cx - 16, 64, 3, 4, "#c8a090"); R(cx + 13, 64, 3, 4, "#c8a090");
      R(cx - 17, 65, 2, 2, "#e9e4da"); blood(cx - 18, 66, 6, 8); blood(cx + 12, 66, 6, 8);
      marker(118, 80, 7); marker(150, 70, 8); marker(42, 6, 9);
    } else {
      R(cx - 9, 66, 18, 2, "#5a1410"); tape(60, 104, 80);
    }
    if (ph <= 1) tape(0, 74, 30);
    lamp(96, 0, "#fff2c8");
  };

  /* =================== 分局：偵訊室 =================== */
  SC.interview = (o) => {
    wall(74, "#7e8288", false); R(0, 0, W, 4, "#5a5e64");
    R(120, 14, 60, 30, "#1a2028"); R(120, 14, 60, 1, "#3a4048"); dither(122, 16, 56, 26, "#2a323c", 3);   // 單面鏡
    floor(74, "#6a6e72", "#5e6266");
    R(60, 62, 72, 4, "#9a9ea2"); R(64, 66, 3, 20, "#7a7e82"); R(125, 66, 3, 20, "#7a7e82");
    if (o.knife){ R(84, 64, 22, 3, "#c8ccd0"); R(86, 63, 18, 1, "#e9e4da");   // 剁刀（證物袋）
    R(140, 78, 22, 14, "#2a3a4a"); R(144, 76, 14, 3, "#2a3a4a"); }   // 背包
    lamp(96, 0, "#fff6d8"); R(20, 20, 26, 18, "#d8d8d0"); R(22, 22, 22, 2, "#3a5a8a"); for (let i = 0; i < 4; i++) R(23, 26 + i * 3, 18, 1, "#9a9a92");
  };
  /* =================== 解剖室 =================== */
  SC.morgue = (o) => {
    wall(74, "#cfd8d6", false); tile(0, 0, W, 74, "#d6dedc", 8);
    floor(74, "#9aa6a4", "#8a9694"); R(92, 96, 8, 4, "#5a6664");
    // 燈箱
    R(146, 16, 40, 32, "#eef4f8"); R(146, 16, 40, 1, "#9ab"); for (let i = 0; i < 6; i++){ const x = 149 + (i % 3) * 12, y = 19 + Math.floor(i / 3) * 14; R(x, y, 10, 12, "#3a4a5a"); R(x + 3, y + 3, 4, 6, "#c8b0a0"); R(x + 4, y + 5, 2, 1, "#e9e4da"); }
    // 不鏽鋼台＋白布下的遺體
    R(56, 66, 80, 4, "#b8c0c4"); R(60, 70, 4, 18, "#8a9296"); R(128, 70, 4, 18, "#8a9296"); R(56, 66, 80, 1, "#e0e6e8");
    R(60, 58, 70, 8, "#eef0ee"); R(60, 56, 18, 4, "#eef0ee"); R(126, 60, 8, 6, "#d8b090");
    // 露在白布外的雙手（斷指的手掌）
    R(74, 62, 8, 4, "#d0a888"); R(110, 62, 8, 4, "#d0a888"); P(74, 62, "#7a2a20"); P(81, 62, "#7a2a20"); P(110, 62, "#7a2a20"); P(117, 62, "#7a2a20"); R(73, 62, 1, 2, "#e9e4da");
    R(120, 68, 12, 6, "#e9e4da"); R(120, 70, 12, 1, "#7a7a7a");   // 腳趾名牌
    // 標本盤
    R(16, 62, 32, 8, "#c0c8cc"); R(20, 60, 24, 4, "#9aa"); R(26, 58, 10, 5, "#8a3a3a"); R(28, 59, 4, 2, "#a85a5a");
    R(18, 70, 3, 18, "#8a9296"); R(43, 70, 3, 18, "#8a9296");
    lamp(96, 0, "#ffffff"); dither(70, 6, 52, 40, "#ffffff10", 3);
  };
  SC.mhall = (o) => {
    wall(70, "#d8d0c4", false); windowBox(20, 14, 34, 24, "#b8c8d4");
    floor(70, "#8a7a6a", "#7a6a5a");
    R(20, 58, 54, 12, "#6a5a6a"); R(20, 52, 54, 8, "#5a4a5a"); R(18, 54, 4, 16, "#4a3a4a"); R(72, 54, 4, 16, "#4a3a4a");
    R(80, 68, 40, 4, "#6b4a2b"); R(84, 72, 3, 12, "#5a3e24"); R(113, 72, 3, 12, "#5a3e24");
    R(88, 62, 24, 8, "#e9eef2"); R(90, 64, 20, 1, "#2a5ad8"); R(92, 61, 6, 2, "#3a2a1a");   // 遺物袋
    // 白色花籃
    R(158, 60, 16, 14, "#c8a878"); for (let i = 0; i < 9; i++){ const x = 150 + (i % 3) * 10, y = 38 + Math.floor(i / 3) * 7; R(x, y, 8, 6, "#f4f4ee"); P(x + 3, y + 2, "#e8e070"); }
    R(152, 58, 26, 1, "#3f6a3a"); R(176, 44, 6, 18, "#e9e4da"); R(177, 46, 4, 1, "#2a2a2a"); R(177, 49, 4, 1, "#2a2a2a");
  };

  /* =================== 事務所 =================== */
  SC.firmfront = (o) => { const ph = o.phase || 0;
    wall(70, "#e6e2da", false); R(0, 56, W, 14, "#8a7a6a");
    R(56, 12, 80, 18, "#2a3a5a"); R(58, 14, 76, 14, "#34466a"); for (let i = 0; i < 9; i++) R(64 + i * 7, 19, 5, 4, "#e9e4da");
    cctvDome(10, 2);
    R(66, 52, 68, 18, "#8a6a4a"); R(64, 50, 72, 3, "#a8865a"); R(90, 47, 20, 4, "#e9e4da"); R(92, 48, 16, 1, "#9a9a92"); R(72, 47, 14, 3, "#f1ead8"); R(79, 47, 1, 3, "#9a9a92"); R(73, 48, 5, 1, "#5a5a5a"); R(81, 48, 4, 1, "#5a5a5a"); R(86, 46, 1, 4, "#2a2a2e");
    door(160, 24, 22, 46, "#c8ccd0"); R(170, 30, 2, 30, "#e9e4da");
    R(10, 62, 40, 6, "#5a6a7a"); R(10, 56, 40, 6, "#4a5a6a"); plant(52, 64);
    if (ph >= 1){ R(140, 40, 16, 30, "#e9e4da"); for (let i = 0; i < 6; i++) R(141 + (i % 2) * 7, 34 + Math.floor(i / 2) * 5, 6, 5, "#f4f4ee"); R(146, 46, 4, 18, "#1e1e22"); }
    floor(70, "#a8a49a", "#98948a");
  };
  SC.acctoffice = (o) => { const ph = o.phase || 0, lin = o.who === "lin";
    wall(70, lin ? "#d6dcd8" : "#e2dccc", false); floor(70, "#7a6a5a", "#6a5a4a");
    windowCity(70, 10, 60, 30, ph);
    OBJ.shelf(6, 12, 50, 4, ["#2a3a6a", "#7a2a2a", "#2a5a3a", "#d8c89a"]);
    OBJ.desk(56, 58, 66); OBJ.monitor(64, 44, 18, 12); R(90, 54, 20, 4, "#f1ead8"); R(112, 50, 10, 8, lin ? "#e9e4da" : "#2a2a2e");
    if (lin){ R(113, 51, 8, 6, "#3a2a1a"); R(98, 46, 10, 8, "#e9e4da"); R(100, 48, 6, 4, "#d88ad0");
      R(150, 18, 32, 26, "#7a6a5a"); R(152, 20, 28, 22, "#8a7a6a"); R(158, 24, 14, 16, "#f1ead8"); for (let i = 0; i < 5; i++) R(160, 27 + i * 3, 10, 1, "#9a9a92");
      plant(164, 64); R(158, 58, 14, 4, "#e8a0d8"); }
    else { R(96, 44, 12, 10, "#c8a050"); R(98, 46, 8, 6, "#d8c8b0");
      R(150, 46, 28, 28, "#4a4e54"); R(152, 48, 24, 24, "#5a5e64"); R(170, 58, 4, 4, "#c8c8c8"); P(158, 52, "#3fd46f"); }
    R(80, 66, 16, 12, "#2a2a2e"); R(82, 62, 12, 5, "#2a2a2e");
    
  };
  SC.archive = (o) => {
    wall(70, "#d8d4c8", false); floor(70, "#8a8478", "#7a7468");
    for (let k = 0; k < 2; k++){ const x = 16 + k * 36; R(x, 20, 32, 50, "#7a7a72"); for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) R(x + 2 + i * 5, 22 + r * 12, 4, 10, ["#2a3a6a", "#7a2a2a", "#2a5a3a", "#d8c89a", "#4a4a6a", "#8a6a3a"][(i + r + k) % 6]); }
    OBJ.desk(92, 66, 46); R(100, 58, 30, 8, "#f1ead8"); R(102, 60, 26, 1, "#9a9a92"); R(102, 62, 22, 1, "#9a9a92"); R(116, 56, 6, 3, "#c23a2a");
    R(150, 54, 24, 32, "#3a3e44"); R(152, 56, 20, 6, "#2a2e34"); R(152, 64, 20, 20, "#4a4e54"); for (let i = 0; i < 5; i++) R(154 + i * 4, 66, 1, 8, "#e9e4da");
    lamp(120, 0); 
  };

  /* =================== 公寓（鄭家客廳、林家客廳） =================== */
  SC.apartment = (o) => { const ph = o.phase || 0, lin = o.who === "lin";
    wall(70, lin ? "#d8dce0" : "#e8dccc", false); floor(70, lin ? "#9a8a76" : "#8a6a4a", lin ? "#8a7a66" : "#7a5a3a"); R(0, 62, W, 8, lin ? "#a8acb0" : "#b8a88a");
    windowCity(120, 12, 50, 30, ph);
    if (lin){ R(8, 38, 28, 36, "#8a6a4a"); R(10, 40, 24, 14, "#7a5a3a"); R(10, 56, 24, 16, "#7a5a3a"); for (let i = 0; i < 3; i++) R(12 + i * 7, 60, 5, 3, "#1e1e22"); R(30, 52, 2, 2, "#d9b75b"); }
    else { R(18, 16, 24, 28, "#f4f0e6"); R(18, 16, 24, 5, "#c23a2a"); for (let i = 0; i < 12; i++) R(20 + (i % 4) * 6, 23 + Math.floor(i / 4) * 6, 4, 4, i >= 5 && i <= 7 ? "#e8c43a" : "#d8d4c8"); }
    R(50, 30, 40, 24, "#1e1e22"); R(52, 32, 36, 20, ph === 4 ? "#3a3a5a" : "#2a3a4a"); R(66, 54, 8, 4, "#2a2a2e");
    R(60, 76, 70, 12, lin ? "#5a6a7a" : "#8a5a4a"); R(60, 68, 70, 9, lin ? "#4a5a6a" : "#7a4a3a"); R(56, 70, 6, 18, shade(lin ? "#4a5a6a" : "#7a4a3a", -.2)); R(128, 70, 6, 18, shade(lin ? "#4a5a6a" : "#7a4a3a", -.2));
    R(90, 66, 36, 3, "#6b4a2b"); R(92, 69, 2, 8, "#5a3e24"); R(122, 69, 2, 8, "#5a3e24");
    if (lin){ R(100, 62, 12, 4, "#e9e4da"); R(102, 61, 4, 1, "#3a8ad8"); } else { R(96, 63, 26, 3, "#f1ead8"); R(98, 63, 8, 1, "#2a5aa8"); }
    
    plant(178, 64);
    if (lin){ R(94, 30, 14, 12, "#8a6a4a"); R(95, 31, 12, 10, "#b8d0e0"); R(95, 37, 12, 4, "#8aa070"); R(97, 33, 2, 4, "#3a3a4a"); R(100, 33, 2, 4, "#c23a2a"); R(103, 35, 3, 3, "#e9e4da"); R(103, 38, 4, 2, "#5a5a5a"); }   // 安養院門口的合照
  };
  SC.lobby = (o) => {
    wall(70, "#cfc8bc", false); R(0, 0, W, 6, "#8a8478");
    R(18, 26, 56, 38, "#5a4a3a"); R(20, 28, 52, 30, "#2a2a2e"); for (let i = 0; i < 4; i++){ const x = 22 + (i % 2) * 25, y = 30 + Math.floor(i / 2) * 14; R(x, y, 23, 12, "#0d1a12"); P(x + 2, y + 2, "#e04a3a"); }
    R(14, 62, 64, 8, "#7a6a54"); R(14, 62, 64, 1, "#a8967a");
    R(126, 20, 56, 46, "#a8a8a0"); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){ R(128 + i * 13, 22 + j * 11, 12, 10, "#c8c8c0"); R(132 + i * 13, 25 + j * 11, 4, 1, "#3a3a3a"); }
    R(129, 23, 10, 8, "#d8d0b0"); R(130, 24, 8, 2, "#c23a2a");
    door(90, 26, 22, 44, "#9aa0a6"); R(100, 26, 1, 44, "#6a7076"); R(114, 34, 4, 6, "#e9e4da");
    floor(70, "#b8b0a0", "#a8a090");
  };
  SC.balcony = (o) => { const ph = o.phase || 0;
    sky(ph === 4 ? "#3a3a5a" : "#7a90a8", ph === 4 ? "#e09a6a" : "#c6d2da", 70); floor(84, "#9a9488", "#8a8478");
    PR.seed(3); for (let i = 0; i < 12; i++){ const h = 20 + PR.rnd() * 30; R(i * 17, 70 - h, 15, h, "#8a96a2"); for (let j = 70 - h + 3; j < 68; j += 5) R(i * 17 + 3, j, 9, 2, "#c9d8e6"); }
    R(0, 0, W, 6, "#9a9a92");
    // 晾衣桿
    R(110, 8, 60, 2, "#c8c8c0"); if (ph <= 1){ R(124, 10, 2, 4, "#c8c8c0"); R(118, 14, 16, 30, "#1e2a4a"); R(117, 16, 2, 22, "#1e2a4a"); R(133, 16, 2, 22, "#1e2a4a"); R(125, 16, 1, 26, "#c8c8c8"); }
    // 蘭花架
    for (let r = 0; r < 2; r++){ R(18, 50 + r * 20, 92, 2, "#7a6a54"); for (let i = 0; i < 6; i++){ const x = 22 + i * 15, y = 42 + r * 20; R(x, y, 8, 8, "#e9e4da"); R(x + 3, y - 10, 1, 10, "#4a7a3a"); R(x + 1, y - 12, 6, 4, ["#e8a0d8", "#f4f4ee", "#e8c43a"][(i + r) % 3]); R(x + 5, y - 6, 4, 2, "#3f6a3a"); } }
    R(20, 30, 2, 50, "#6a5a44"); R(108, 30, 2, 50, "#6a5a44");
    // 花市的帆布袋
    R(150, 66, 2, 4, "#7a6a54"); R(146, 70, 22, 18, "#d8c8a0"); R(150, 76, 14, 2, "#3f6a3a");
    // 欄杆
     R(0, 74, W, 2, "#5a5e64"); for (let x = 0; x < W; x += 8) R(x, 74, 1, 10, "#5a5e64");
    if (o.newShears){ R(120, 64, 10, 3, "#c23a2a"); R(128, 62, 6, 1, "#d0d0d0"); R(128, 66, 6, 1, "#d0d0d0"); }
  };
  SC.parking = (o) => {
    wall(70, "#8a8a86", false); for (let x = 0; x < W; x += 48){ R(x + 40, 0, 10, 70, "#a8a8a2"); R(x + 40, 40, 10, 4, "#e8c43a"); }
    R(0, 0, W, 6, "#6a6a66"); for (let x = 10; x < W; x += 40) R(x, 2, 20, 2, "#e9f2f8");
    floor(70, "#6a6a66"); for (let x = 54; x < W; x += 80) R(x, 76, 2, 30, "#e9e4da");
    if (!o.noCar){ OBJ.car(64, 64, "#b8bcc0"); R(72, 64, 22, 2, "#9aa0a4"); }
    R(146, 40, 10, 14, "#f1ead8"); R(147, 42, 8, 1, "#6a6a6a"); R(147, 44, 6, 1, "#6a6a6a");
    R(150, 90, 30, 6, "#5a5a56"); R(158, 92, 14, 2, "#e9e4da");
    // 車道旁的樓梯間（往一樓大廳）
    R(164, 26, 26, 44, "#5a5e62"); R(166, 30, 22, 40, "#7a8088"); R(184, 48, 2, 4, "#c8c8cc"); R(170, 34, 14, 10, "#9cb0c0"); R(166, 20, 22, 6, "#2a8a4a"); R(168, 22, 6, 2, "#e9f2f8"); R(176, 22, 10, 2, "#e9f2f8");
  };

  /* =================== 蔡佳穎的套房 =================== */
  SC.studio = (o) => { const ph = o.phase || 0;
    wall(70, "#e8d8d0", false); floor(70, "#b8a08a", "#a8907a"); windowBox(120, 14, 30, 22, ph === 4 ? "#e0a070" : "#a8c0d0");
    door(4, 20, 22, 50, "#a88a6a"); if (ph >= 3){ R(6, 22, 18, 30, "#a8201a"); drip(8, 52, 7, "#a8201a"); R(6, 70, 20, 4, "#a8201a"); R(10, 40, 10, 6, "#f1ead8"); }
    R(110, 56, 60, 14, "#f4eef0"); R(110, 52, 60, 5, "#e0b0c0"); R(164, 48, 8, 22, "#a88a6a");
    OBJ.desk(52, 60, 60); R(60, 56, 22, 4, "#f1ead8"); R(62, 57, 6, 2, "#2a5aa8"); R(90, 56, 18, 4, "#f1ead8"); R(56, 46, 14, 10, "#e8c0c8");
    if (o.jia){ R(150, 66, 30, 22, "#e8a0b0"); R(162, 62, 6, 4, "#e8a0b0"); R(156, 72, 18, 3, "#c8eee8"); R(150, 86, 3, 2, "#3a3a3a"); R(177, 86, 3, 2, "#3a3a3a"); }
    
  };

  /* =================== 金鼎資產：後面的房間 =================== */
  SC.backroom = (o) => {
    wall(74, "#4a3a36", true); floor(74, "#3a302c", "#2e2622"); R(0, 0, W, 4, "#2a2220");
    R(20, 58, 48, 28, "#e9eef2"); R(20, 58, 48, 4, "#c8ccd0"); R(22, 62, 44, 1, "#9aa"); R(62, 70, 4, 4, "#3a6ae0");
    R(100, 66, 44, 4, "#2f6a3a"); R(104, 70, 3, 14, "#5a3e24"); R(137, 70, 3, 14, "#5a3e24"); for (let i = 0; i < 6; i++) R(104 + i * 6, 64, 4, 2, "#f1ead8");
    R(112, 62, 12, 4, "#f1ead8"); OBJ.cig(130, 64); OBJ.cig(134, 65);
    R(150, 20, 30, 40, "#2a2220"); R(152, 22, 26, 18, "#8a2a3a"); R(156, 26, 18, 2, "#ffd04a");
    lamp(90, 0, "#ffb86a"); dither(0, 0, W, H, "#00000033", 3);
    
  };

  /* =================== 新莊市場・豬肉攤 =================== */
  SC.butcher = (o) => { const ph = o.phase || 0;
    wall(70, "#c8c4b8", false); floor(76, "#8a8a7e", "#7a7a6e"); dither(0, 76, W, 32, "#9a9a8e", 4); tile(0, 30, W, 40, "#e8e8e0", 6);
    R(0, 0, W, 10, "#c23a2a"); for (let i = 0; i < 8; i++) R(i * 26, 10, 24, 4, i % 2 ? "#c23a2a" : "#e9e4da");
    R(60, 2, 72, 7, "#f4e4b0"); for (let i = 0; i < 6; i++) R(66 + i * 10, 4, 7, 3, "#7a1a14");
    // 吊著的肉
    for (let i = 0; i < 5; i++){ const x = 20 + i * 18; R(x + 3, 14, 1, 6, "#9a9a92"); R(x, 20, 9, 16, "#d88a7a"); R(x + 2, 22, 5, 3, "#f0d0c0"); }
    // 刀架
    R(128, 18, 44, 4, "#5a3e24"); for (let i = 0; i < 6; i++){ if (ph >= 2 && i === 2) continue; R(131 + i * 7, 22, 5, 14, "#c8ccd0"); R(132 + i * 7, 22, 3, 3, "#3a2a1a"); }
    // 攤位檯面
    R(10, 56, 120, 16, "#b8b8b0"); R(10, 54, 120, 3, "#e8e8e0"); R(30, 50, 24, 5, "#e8a090"); R(64, 50, 20, 5, "#d88070"); R(92, 54, 22, 2, "#2a2a2e"); R(100, 50, 6, 9, "#1e1e22"); R(101, 51, 4, 6, "#3a6a9a"); R(102, 53, 2, 1, "#f4f4f0");
    R(10, 72, 120, 4, "#8a8a82");
    // 雨鞋
    R(20, 84, 8, 12, "#f4f4ee"); R(30, 84, 8, 12, "#f4f4ee"); R(20, 94, 10, 3, "#e9e4da"); R(30, 94, 10, 3, "#e9e4da"); P(24, 96, "#8a7a4a");
    // 機車
    R(150, 80, 30, 10, "#3a5a8a"); R(146, 88, 10, 10, INK); R(174, 88, 10, 10, INK); R(170, 70, 4, 12, "#2a2a2e"); R(152, 76, 18, 4, "#1e1e22");
    
  };
  /* =================== 鷹眼徵信 =================== */
  SC.pioffice = (o) => {
    wall(70, "#5a5e64", false); floor(70, "#4a3a2a", "#3a2a1a"); R(0, 0, W, 4, "#3a3e44");   // 地板要先畫，桌腳才不會被蓋掉
    R(118, 10, 66, 36, "#a8865a"); for (let i = 0; i < 6; i++){ const x = 122 + (i % 3) * 20, y = 14 + Math.floor(i / 3) * 15; R(x, y, 14, 11, "#e9e4da"); R(x + 2, y + 2, 10, 6, "#4a5a6a"); P(x + 6, y - 1, "#c23a2a"); }
    for (let i = 0; i < 40; i++) P(128 + i, 16 + Math.sin(i / 6) * 8 + 8, "#c23a2a");
    OBJ.desk(30, 66, 66); OBJ.monitor(40, 47, 16, 11); OBJ.monitor(62, 47, 16, 11); R(96, 62, 22, 6, "#f1ead8");
    R(4, 30, 20, 40, "#4a4e54"); for (let i = 0; i < 4; i++) R(6, 33 + i * 9, 16, 7, "#5a5e64");
    lamp(70, 0, "#ffe8b0");
  };
  /* =================== 便利商店 =================== */
  SC.store = (o) => {
    wall(70, "#f4f4f0", false); R(0, 0, W, 8, "#e86a2a"); R(0, 8, W, 3, "#2a8a4a");
    // 多媒體機
    R(18, 32, 28, 42, "#e86a2a"); R(21, 36, 22, 16, "#1a2a3a"); R(23, 38, 18, 2, "#9fd49f"); R(24, 56, 16, 3, "#2a2a2e"); R(26, 62, 12, 6, "#f4f4f0");
    // 貨架
    for (let k = 0; k < 2; k++){ const x = 56 + k * 40; R(x, 30, 34, 44, "#c8c8c0"); for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) R(x + 2 + i * 5, 32 + r * 10, 4, 8, ["#c23a2a", "#2a6ad8", "#e8c43a", "#3a9a4a", "#e86a2a", "#8a3ad8"][(i + r + k) % 6]); }
    // 櫃檯
    R(140, 56, 50, 18, "#8a6a4a"); R(138, 54, 54, 3, "#a8865a"); R(150, 46, 14, 9, "#2a2a2e"); R(152, 48, 10, 5, "#3a6a8a");
    cctvDome(172, 2); R(168, 40, 20, 14, "#f4f4f0"); R(168, 40, 20, 3, "#c23a2a"); for (let i = 0; i < 3; i++) R(170, 45 + i * 3, 16 - i * 3, 1, "#3a3a3a"); R(176, 54, 4, 1, "#9a9a92");   // 櫃檯上的告示
    floor(74, "#d8d8d0", "#c8c8c0");
  };
  /* =================== 好食堡 =================== */
  SC.diner = (o) => { const ph = o.phase || 0;
    wall(70, "#e8c8a0", false); floor(70, "#b89a7a", "#a88a6a"); R(0, 0, W, 6, "#c23a2a");
    windowBox(10, 12, 100, 32, ph === 4 ? "#e0a070" : "#a8bccc"); for (let x = 14; x < 108; x += 16) R(x, 36, 10, 6, "#7a8a9a");
    R(130, 10, 56, 20, "#2a2a2e"); for (let i = 0; i < 6; i++) R(134 + (i % 3) * 17, 13 + Math.floor(i / 3) * 8, 14, 6, ["#e8c43a", "#c23a2a", "#e86a2a"][i % 3]);
    // 靠窗的桌子
    R(40, 62, 60, 4, "#c23a2a"); R(68, 66, 4, 18, "#8a8a82"); R(36, 66, 10, 18, "#a82a1a"); R(94, 66, 10, 18, "#a82a1a");
    R(112, 62, 22, 4, "#f1ead8"); R(114, 63, 18, 1, "#9a9a92"); R(121, 66, 4, 18, "#8a8a82");   // 小桌要有桌腳，不能浮在半空
    R(140, 56, 50, 18, "#c8c8c0"); R(138, 54, 54, 3, "#e9e4da");
    cctvDome(6, 2); 
  };


  /* ---------- 共用場景加上第 3 集的細節 ---------- */
  SC.c3_police = (o) => { SC.police(o);
    R(8, 65, 12, 4, "#f1ead8"); R(9, 64, 12, 1, "#e0d8c4"); R(10, 66, 8, 1, "#9a9a92");   // 一疊調閱申請單
    R(22, 61, 7, 8, "#f4f0e6"); R(23, 62, 5, 2, "#4a2e1a"); R(29, 63, 2, 3, "#f4f0e6"); R(22, 68, 7, 1, "#c8c0b0");   // 冷掉的咖啡
  };
  SC.c3_lab = (o) => { SC.lab(o);
    R(9, 43, 13, 11, "#f4e070"); R(9, 43, 13, 2, "#e8c840"); for (let i = 0; i < 3; i++) R(11, 47 + i * 2, 9 - i * 2, 1, "#6a5a2a");   // 便條
    R(164, 26, 26, 48, "#dfe6e8"); R(164, 26, 26, 1, "#f4f8fa"); R(167, 30, 20, 30, "#a8c8d4"); dither(167, 30, 20, 30, "#c8e0e8", 3);   // 證物冰箱
    for (let r = 0; r < 3; r++){ R(167, 39 + r * 10, 20, 1, "#7a8a90"); for (let i = 0; i < 3; i++){ R(169 + i * 6, 33 + r * 10, 4, 5, "#f4f4f0"); P(170 + i * 6, 34 + r * 10, "#c23a2a"); } }
    R(185, 40, 2, 10, "#8a9296"); R(166, 62, 22, 8, "#c8d0d2"); P(170, 65, "#3fd46f"); R(174, 64, 10, 3, "#1a2a2a"); R(175, 65, 6, 1, "#7ad4ff");
  };
  SC.c3_vgarage = (o) => { SC.garage(o);
    // 高爾夫球桿袋（積灰）
    R(154, 46, 12, 26, "#2a4a3a"); R(154, 46, 12, 2, "#3a5a4a"); R(152, 56, 2, 12, "#6b4a2b"); R(156, 40, 2, 6, "#c8c8c8"); R(159, 38, 2, 8, "#c8c8c8"); R(162, 41, 2, 5, "#c8c8c8"); R(155, 38, 3, 2, "#e8e8e8"); R(158, 36, 4, 2, "#e8e8e8"); R(161, 39, 4, 2, "#e8e8e8");
    dither(154, 46, 12, 26, "#9a9a9233", 3);
    // 舊手機紙箱
    R(20, 74, 28, 18, "#b88a5a"); R(20, 74, 28, 2, "#d8aa7a"); R(32, 74, 4, 18, "#c8a070"); R(24, 70, 8, 5, "#2a2a2e"); R(26, 71, 4, 3, "#4a5a6a"); R(36, 71, 6, 4, "#3a3a3e"); R(40, 68, 1, 7, "#1e1e22"); R(23, 80, 8, 4, "#f4f0e6"); R(24, 81, 6, 1, "#3a3a3a");
  };
  SC.c3_lobby = (o) => { SC.lobby(o);
    R(42, 59, 18, 4, "#f1ead8"); R(50, 59, 1, 4, "#9a9a92"); for (let i = 0; i < 3; i++){ R(43, 60 + i, 6, 1, "#7a7a72"); R(52, 60 + i, 6, 1, "#7a7a72"); } R(61, 60, 6, 1, "#2a5aa8");   // 登記簿和筆
  };
  SC.c3_shark = (o) => { SC.shark(o);
    // 右邊的玻璃門：外面停著阿豹的黑色 BMW
    R(164, 30, 28, 44, "#2a2220"); R(166, 32, 24, 42, "#5a6a78"); dither(166, 32, 24, 42, "#7a8a98", 3);
    R(166, 56, 24, 12, "#1e1e22"); R(168, 52, 18, 5, "#26262a"); R(170, 53, 12, 3, "#4a5a6a"); R(166, 62, 3, 2, "#c23a2a"); R(170, 66, 5, 5, "#0a0a0a"); R(183, 66, 5, 5, "#0a0a0a");
    R(177, 34, 1, 40, "#2a2220"); R(174, 48, 2, 6, "#c8c8c8");
  };

  /* ---------- 人物造型（衣服跟著劇情走） ---------- */
  const LOOK = {
    lin:  { skin:"#e8c09a", hair:"#3a3632", hairStyle:"slick", top:"#e9e4da", coat:"#4a4e56", bottom:"#4a4e56", tie:"#5a2a2a", glasses:true, hello:"警官，有什麼我能幫忙的，儘管說。",
            byPhase:{ 0:{ bandage:true }, 1:{ bandage:true, tie:"#1e1e22" }, 2:{ tie:"#1e1e22" }, 3:{ coat:"#6a5a4a", top:"#c8c0b0", tie:null }, 4:{ coat:"#6a5a4a", top:"#c8c0b0", tie:null } } },
    mei:  { skin:"#f0c8a8", hair:"#2a1a14", hairStyle:"bob", top:"#6a4a5a", bottom:"#2a2228", skirt:true, hello:"……你想問什麼？", byPhase:{ 1:{ top:"#1e1e22", bottom:"#1e1e22" }, 2:{ top:"#1e1e22", bottom:"#1e1e22" }, 3:{ top:"#1e1e22", bottom:"#1e1e22" }, 4:{ top:"#1e1e22", bottom:"#1e1e22" } } },
    jia:  { skin:"#f4d4bc", hair:"#5a3a22", hairStyle:"long", top:"#e8b0c0", bottom:"#3a3a4a", hello:"……我什麼都不知道。", byPhase:{ 1:{ top:"#8a8e94" }, 2:{ top:"#8a8e94" }, 3:{ top:"#5a5e64", mood:"scared" } } },
    bao:  { skin:"#c89068", hair:"#3a2a20", hairStyle:"bald", top:"#1e1e22", bottom:"#1e1e22", sunglasses:true, chain:true, hello:"警察喔？坐啊，喝茶。" },
    jun:  { skin:"#e0b08a", hair:"#1a1410", hairStyle:"spiky", top:"#e9e4da", bottom:"#3a4a6a", apron:"#c23a2a", shoes:"#f4f4ee", hello:"……你要買肉還是要問話？",
            byPhase:{ 2:{ top:"#1e1e22", hood:"#1e1e22", apron:null }, 3:{ top:"#1e1e22", hood:"#1e1e22", apron:null }, 4:{ top:"#1e1e22", hood:"#1e1e22", apron:null } } },
    shu:  { skin:"#f0c8a8", hair:"#6a5a52", hairStyle:"bun", top:"#7a8a6a", bottom:"#4a4a52", hello:"我先生不在……你要找他嗎？", byPhase:{ 3:{ top:"#5a5a62" }, 4:{ top:"#5a5a62" } } },
    liu:  { skin:"#f0c8a8", hair:"#1a1410", hairStyle:"pony", top:"#e9e4da", coat:"#5a6a7a", bottom:"#3a3a4a", glasses:true, hello:"我能幫的一定幫。" , byPhase:{ 1:{ coat:"#1e1e22" }, 2:{ coat:"#1e1e22" } } },
    zhang:{ age:"old", skin:"#c99a6e", hair:"#c9c4b8", hairStyle:"short", top:"#3a5a8a", bottom:"#3a3a3a", hat:"cap", capColor:"#3a5a8a", hello:"警察先生……我知道的都說了。" },
    he:   { skin:"#f0c8a8", hair:"#2a2a2a", hairStyle:"bun", top:"#7fb6d8", coat:"#f4f6f6", bottom:"#3a4a5a", glasses:true, gloves:"#4a8ad8", hello:"屍體不會說謊。你想知道什麼？" },
    luo:  { skin:"#d8a880", hair:"#2a2a2a", hairStyle:"short", top:"#3a3a3a", coat:"#6a5a3a", bottom:"#2a2a2a", hat:"fedora", hatColor:"#3a3226", hello:"警察找徵信社？難得。" },
    wu:   { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4a5a", glasses:true, hello:"要驗什麼就交給我。調閱的資料，早上我會整理好給你。" }
  };
  const DAILY = {
    lin:  [ { room:"loffice", x:80, pose:"phone", doing:"在辦公室講電話，聲音很平穩，在安排客戶的事。" },
            { room:"loffice", x:90, pose:"read", doing:"戴著黑領帶，在看事務所的帳。" },
            { room:"loffice", x:96, pose:"sit", doing:"坐在辦公桌前，看起來一夜沒睡。" },
            { room:"lliving", x:96, pose:"sit", doing:"請了假在家，坐在沙發上盯著手機。" },
            { room:"lbalcony", x:60, pose:"stand", facing:-1, doing:"站在陽台的蘭花架前，一動也不動。" } ],
    mei:  [ { room:"vliving", x:90, pose:"cry", doing:"坐在沙發上，一直在哭。" },
            { room:"mhall", x:44, pose:"sit", doing:"坐在家屬室的沙發上，手裡緊緊抓著丈夫的皮夾。" },
            { room:"vliving", x:90, pose:"phone", doing:"在跟葬儀社講電話。" },
            { room:"vstudy", x:96, pose:"read", doing:"在書房翻丈夫的抽屜。" },
            { room:"vliving", x:90, pose:"sit", doing:"坐在沙發上發呆。" } ],
    jia:  [ { x:130, pose:"cry", doing:"縮在床邊，眼睛哭腫了。" },
            { x:130, pose:"phone", doing:"一直撥同一個號碼，撥了又撥。" },
            { x:100, pose:"cross", doing:"站在書桌旁，看著那個收好的行李箱。" },
            { x:130, pose:"cry", doing:"縮在床角發抖，門外的紅漆還沒乾。" },
            { x:100, pose:"stand", doing:"在收拾東西，說要搬回南部。" } ],
    bao:  [ { room:"sfront", x:140, pose:"smoke", facing:-1, doing:"翹著腳坐在櫃檯後面抽菸。" } ],
    jun:  [ { x:70, pose:"hold", doing:"在攤位上剁排骨，一刀一刀很用力。" },
            { x:70, pose:"hold", doing:"在攤位上剁肉，眼睛一直看著手機。" },
            { room:"pinterview", x:96, pose:"sit", doing:"坐在偵訊室裡，雙手放在桌上，一直低著頭。" } ],
    shu:  [ { room:"lliving", x:70, pose:"broom", doing:"在打掃客廳。" },
            { room:"lliving", x:70, pose:"hold", doing:"在泡茶，手有點抖。" },
            { room:"lliving", x:40, pose:"stand", doing:"站在鞋櫃旁邊，一直看著先生的鞋子。" },
            { room:"lliving", x:150, pose:"cross", facing:-1, doing:"站在窗邊，一直看著先生。" } ],
    liu:  [ { room:"farchive", x:120, pose:"read", doing:"在帳務室對帳，眉頭皺得很緊。" } ],
    zhang:[ { room:"wguard", x:120, pose:"stand", doing:"站在管理室門口，臉色很差。" }, { room:"wguard", x:100, pose:"sit", doing:"坐在管理室裡看監視器。" } ],
    he:   [ { room:"wback", x:150, pose:"kneel", facing:-1, doing:"蹲在屍體旁邊檢查。" }, { room:"morgue", x:150, pose:"stand", facing:-1, doing:"站在解剖台旁邊，正在寫報告。" } ],
    luo:  [ { x:96, pose:"smoke", doing:"在辦公室抽菸，牆上貼滿照片。" } ],
    wu:   [ { room:"wfront", x:110, pose:"kneel", doing:"蹲在地上一寸一寸地採證。" }, { x:150, pose:"stand", doing:"在實驗室裡對著電腦打報告。" } ]
  };
  EP3.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id];
  });
  // 不是問話對象、但會出現在監視器裡的人
  EP3.looks = {
    zheng: { skin:"#d8b090", hair:"#3a3632", hairStyle:"short", top:"#e9e4da", coat:"#3a3e46", bottom:"#3a3e46", tie:"#2a3a6a" },
    capman: { skin:"#e8c09a", hair:"#3a3632", hairStyle:"short", top:"#1e2a4a", coat:"#1e2a4a", bottom:"#3a3e46", hat:"cap", capColor:"#1e1e22", glasses:true },
    capman_bag: { skin:"#e8c09a", hair:"#3a3632", hairStyle:"short", top:"#1e2a4a", coat:"#1e2a4a", bottom:"#3a3e46", hat:"cap", capColor:"#1e1e22", glasses:true, prop:"bag" },
    hoodie: { skin:"#e0b08a", hair:"#1a1410", hairStyle:"spiky", top:"#1e1e22", hood:"#1e1e22", bottom:"#3a4a6a", shoes:"#f4f4ee" },
    baoL: { skin:"#c89068", hair:"#3a2a20", hairStyle:"bald", top:"#1e1e22", bottom:"#1e1e22", sunglasses:true, chain:true },
    zhangL: { age:"old", skin:"#c99a6e", hair:"#c9c4b8", hairStyle:"short", top:"#3a5a8a", bottom:"#3a3a3a", hat:"cap", capColor:"#3a5a8a" },
    meiL: { skin:"#f0c8a8", hair:"#2a1a14", hairStyle:"bob", top:"#6a4a5a", bottom:"#2a2228", skirt:true },
    jiaL: { skin:"#f4d4bc", hair:"#5a3a22", hairStyle:"long", top:"#e8b0c0", bottom:"#3a3a4a" },
    linL: { skin:"#e8c09a", hair:"#3a3632", hairStyle:"slick", top:"#e9e4da", coat:"#4a4e56", bottom:"#4a4e56", tie:"#5a2a2a", glasses:true }
  };

  /* ---------- 房間（＝走動畫面的區域）和隱藏小細節 ---------- */
  EP3.rooms = {
    warehouse: [
      { id:"wlane", name:"圍牆外的小巷", scene:"wlane", details:[
        { id:"d3_wire", name:"鐵絲網", hot:[0,24,W,6], text:"圍牆上的鐵絲網生鏽了，有一段被剪開過，看起來是很久以前的事。" },
        { id:"d3_weed", name:"牆角的雜草", hot:[0,64,40,10], text:"雜草被踩倒了一片，倒的方向是往小巷外面——有人在這裡蹲過，然後跑走。" } ] },
      { id:"wyard", name:"倉儲大門和車道", scene:"wyard", details:[
        { id:"d3_gate", name:"大門", hot:[0,40,36,34], text:"滑門上掛著一個牌子：「22:00 後請用遙控器或走側門」。" },
        { id:"d3_doors", name:"B-10、B-11", hot:[50,34,86,40], text:"隔壁兩間倉庫都上了鎖。B-11 的承租人是一家文具批發，週末不開。" },
        { id:"d3_lights", name:"B-12 的燈", hot:[146,56,38,18], until:0, text:"鐵捲門下面透出白色的燈光。張伯說，燈從他早上巡倉時就一直亮著。" } ] },
      { id:"wguard", name:"管理室", scene:"wguard", details:[
        { id:"d3_cal", name:"牆上的班表", hot:[30,4,30,14], text:"班表上只有一個名字：張文雄。每天 07:00–22:30。晚上沒有人值班。" },
        { id:"d3_fan", name:"電暖器", hot:[160,60,14,10], text:"小小的電暖器開著。十二月的五股，晚上只有十度。" } ] },
      { id:"wfront", name:"B-12 前段", scene:"wfront", details:[
        { id:"d3_roll", name:"鐵捲門", hot:[184,20,8,54], text:"鐵捲門的遙控器掛在門邊的牆上，電池還有電。從裡面就能把門拉起來。" },
        { id:"d3_beams", name:"天花板", hot:[0,0,W,8], text:"天花板的鋼樑上積了很厚的灰。這裡平常除了鄭國華，大概沒什麼人來。" } ] },
      { id:"wback", name:"B-12 後段（命案現場）", scene:"wback", opt:ph=>({ }), details:[
        { id:"d3_light", name:"日光燈", hot:[86,0,20,8], text:"日光燈一閃一閃的。在這裡待了五分鐘，你的頭就開始痛了。" },
        { id:"d3_corner", name:"倉庫最裡面", hot:[30,40,30,30], text:"從鐵捲門口往裡看，這個角落剛好被鐵架擋住。外面的人看不到這裡發生什麼事。" } ] }
    ],
    police: [
      { id:"pdesk", name:"刑事組辦公室", scene:"c3_police", details:[
        { id:"d3_coffee", name:"冷掉的咖啡", hot:[20,58,14,10], text:"桌上一杯冷掉的咖啡，旁邊一疊調閱申請單，每一張都要分局長簽名。" },
        { id:"d3_window", name:"窗戶", hot:[12,12,34,24], text:"窗外擠滿記者，攝影機都對著分局大門。" } ] },
      { id:"pinterview", name:"偵訊室", scene:"interview", opt:{ knife:true }, phase:2, requires:["e_confess"], details:[
        { id:"d3_mirror", name:"單面鏡", hot:[120,14,60,30], text:"單面鏡後面，分局長一直站著看。他已經在電話裡跟記者說「破案了」。" } ] }
    ],
    lab: [ { id:"lab", name:"新北鑑識中心", scene:"c3_lab", details:[
      { id:"d3_scope", name:"顯微鏡", hot:[28,42,20,22], text:"顯微鏡下夾著一片切口的切片，同一個位置有一道細細的刮痕。" } ] } ],
    morgue: [
      { id:"morgue", name:"解剖室", scene:"morgue", details:[
        { id:"d3_drain", name:"地上的排水孔", hot:[88,94,16,8], text:"地上的排水孔一直在滴水。這裡永遠是十八度。" },
        { id:"d3_sink", name:"洗手台", hot:[0,40,14,30], text:"何法醫洗手洗了很久。她說：「做了二十年，這種的還是第一次。」" } ] },
      { id:"mhall", name:"家屬休息室", scene:"mhall", details:[
        { id:"d3_mwin", name:"窗戶", hot:[20,14,34,24], text:"窗外是殯儀館的停車場，一輛靈車慢慢開出去。" } ] }
    ],
    firm: [
      { id:"freception", name:"事務所櫃檯", scene:"firmfront", details:[
        { id:"d3_logo", name:"招牌", hot:[56,12,80,18], text:"「鄭林聯合會計師事務所　1998」。兩個人的姓，並排掛了二十八年。" } ] },
      { id:"voffice", name:"鄭國華的辦公室", scene:"acctoffice", opt:{ who:"zheng" }, details:[
        { id:"d3_vchair", name:"椅子", hot:[80,62,16,16], text:"椅背上掛著一件西裝外套，口袋是空的。" } ] },
      { id:"loffice", name:"林啟明的辦公室", scene:"acctoffice", opt:{ who:"lin" }, details:[
        { id:"d3_orchid", name:"桌上的蘭花", hot:[158,52,16,18], text:"一盆白色的蝴蝶蘭，花梗的切口很新，切得很整齊。" } ] },
      { id:"farchive", name:"帳務室", scene:"archive", details:[
        { id:"d3_binders", name:"一整排帳冊", hot:[16,20,68,50], text:"二十八年的帳，按年份排好。每一本的書背都是劉怡君手寫的。" } ] }
    ],
    vhome: [
      { id:"vliving", name:"鄭家客廳", scene:"apartment", opt:{ who:"zheng" }, details:[
        { id:"d3_tv", name:"電視", hot:[50,30,40,24], text:"電視關著。遙控器旁邊壓著一張紙，是今天新聞的截圖。許美玲把它翻過去了。" } ] },
      { id:"vstudy", name:"書房", scene:"study", details:[
        { id:"d3_vshelf", name:"書架", hot:[128,4,60,42], text:"一整排稅法和會計的書。最下層卻有一本全新的《泰語入門》。" } ] },
      { id:"vgarage", name:"車庫", scene:"c3_vgarage", details:[
        { id:"d3_vspot", name:"空車位", hot:[100,70,80,30], text:"白色 Lexus 的車位空著，地上有一圈油漬。" } ] }
    ],
    linhome: [
      { id:"llobby", name:"鴻福華廈 管理室", scene:"c3_lobby", details:[
        { id:"d3_guard", name:"管理員的登記簿", hot:[14,62,64,8], text:"夜班管理員 23:00 就下班了。登記簿上，12/7 晚上沒有任何訪客。" } ] },
      { id:"lliving", name:"林家客廳", scene:"apartment", opt:{ who:"lin" }, details:[
        { id:"d3_lphoto", name:"牆上的照片", hot:[92,28,18,16], text:"電視旁邊的相框：林啟明夫妻和一位坐輪椅的老太太，在安養院門口合照。" } ] },
      { id:"lbalcony", name:"林家陽台", scene:"balcony", opt:(ph,has)=>({ newShears: has("e_new_shears") }), details:[
        { id:"d3_view", name:"陽台外", hot:[0,6,W,40], text:"從陽台看出去，就是鴻福路。樓下轉角就是那家每日便利商店。" } ] },
      { id:"lpark", name:"地下停車場", scene:"parking", details:[
        { id:"d3_ramp", name:"車道", hot:[0,0,40,70], text:"車道口有一支監視器，所有進出的車都會被拍到。" } ] }
    ],
    jia: [ { id:"jroom", name:"蔡佳穎的套房", scene:"studio", opt:{ jia:true }, details:[
      { id:"d3_bed", name:"床頭", hot:[110,48,60,10], text:"床頭貼著一張曼谷的明信片，背面寫著：「等我們。——國」" } ] } ],
    shark: [
      { id:"sfront", name:"金鼎資產 櫃檯", scene:"c3_shark", details:[
        { id:"d3_gold", name:"玻璃櫃", hot:[26,26,14,14], text:"玻璃櫃裡放著幾支名錶。每一支都貼著一張小紙條，寫著人名。" } ] },
      { id:"sback", name:"後面的小房間", scene:"backroom", requires:["bao7","bao5"], details:[
        { id:"d3_mj", name:"麻將桌", hot:[100,62,44,10], text:"麻將桌上還有昨晚的牌，菸灰缸滿出來了。" } ] }
    ],
    market: [ { id:"mstall", name:"阿德豬肉攤", scene:"butcher", details:[
      { id:"d3_meat", name:"吊著的肉", hot:[18,14,90,22], text:"老闆阿德說：「俊傑剁骨頭是全市場最準的，一刀就斷，從來不用第二刀。」" } ] } ],
    pi: [ { id:"pioffice", name:"鷹眼徵信社", scene:"pioffice", details:[
      { id:"d3_files", name:"檔案櫃", hot:[4,30,20,40], text:"每一個抽屜都上了鎖，標籤寫的是代號，不是人名。" } ] } ],
    seven: [ { id:"seven", name:"每日便利 鴻福門市", scene:"store", details:[
      { id:"d3_shelf", name:"貨架", hot:[56,30,74,44], text:"店員說常客她都認得：「有一個戴眼鏡的伯伯，週末會來買花肥。」" } ] } ],
    diner: [ { id:"diner", name:"好食堡 三重中正店", scene:"diner", details:[
      { id:"d3_menu", name:"菜單", hot:[130,10,56,20], text:"深夜的菜單只剩下咖啡、薯條和漢堡。" } ] } ]
  };

  /* ---------- 監視器動畫（每一段的動作都要和字幕一樣） ---------- */
  const ANIM = {
    cctv_gate: { scene:"wyard", opt:{ phase:1, noCar:true }, cam:"CAM1 GATE", date:"2025-12-07", beats:[
      { t:"19:41:00", d:3, cap:"白色 Lexus 開進大門，往 B 區開去。", cars:{ lx:[230,-50,"#e8e8e4"] }, out:["lx"] },
      { t:"20:21:00", d:3, cap:"黑色 BMW 開進大門，往 B 區。駕駛是一個光頭男子。", cars:{ bmw:[230,-50,"#1e1e22"] }, out:["bmw"] },
      { t:"21:04:00", d:3, cap:"黑色 BMW 離開。", cars:{ bmw:[-60,230,"#1e1e22"] }, out:["bmw"] },
      { t:"23:37:00", d:3, cap:"一個戴鴨舌帽的人從小巷走到側門，按了對講機。", m:{ capman_bag:[27,98,"door&bag/#c8b898",1,-12,98] } },
      { t:"23:38:00", d:3, cap:"側門打開，他走進去，手上提著一個布購物袋。", m:{ capman_bag:[200,98,"carry@bag/#c8b898",1] }, out:["capman_bag"] },
      { t:"00:06:00", d:3.5, cap:"一個穿黑色帽T、白色雨鞋的人走到圍牆邊，一直往裡面看。", m:{ hoodie:[14,98,"stand",1,-12,98] } },
      { t:"00:17:00", d:2.5, cap:"穿帽T的人跑回小巷。", m:{ hoodie:[-14,98,null,-1] }, out:["hoodie"] },
      { t:"02:38:00", d:3.5, cap:"戴鴨舌帽的人從側門出來，提著布購物袋，往小巷走去。", m:{ capman_bag:[-14,98,"carry@bag/#c8b898",-1,200,98,[[30,98]]] }, out:["capman_bag"] },
      { t:"06:40:00", d:3, cap:"管理員走向 B 區。", m:{ zhangL:[200,98,null,1,40,98] }, out:["zhangL"] }
    ] },
    cctv_garage: { scene:"parking", opt:{ noCar:true }, cam:"B1 RAMP", date:"2025-12-07", beats:[
      { t:"23:20:00", d:3.5, cap:"銀色舊 Toyota 開出地下室。駕駛戴鴨舌帽、穿深色防風外套。", cars:{ ty:[-60,64,"#b8bcc0"] }, out:["ty"] },
      { t:"02:58:00", d:3.5, cap:"同一台車開回地下室。", cars:{ ty:[64,-60,"#b8bcc0"] } },
      { t:"03:04:00", d:3, cap:"駕駛從車道旁的樓梯間走上樓，手上提著布購物袋。", m:{ capman_bag:[177,74,"carry@bag/#c8b898",1,98,98,[[177,98]]] }, out:["capman_bag"] },
      { t:"07:02:00", d:3, cap:"林啟明穿著西裝走出大樓。", m:{ linL:[-14,98,null,-1,177,74,[[177,98]]] }, out:["linL"] }
    ] },
    cctv_store: { scene:"store", cam:"CAM2 STORE", date:"2025-12-06", beats:[
      { t:"21:13:00", d:3, cap:"戴鴨舌帽的男人走進店裡，提著布購物袋。", m:{ capman_bag:[40,98,"carry@bag/#c8b898",-1,200,98] } },
      { t:"21:14:00", d:3.5, cap:"他在多媒體機前操作，拿著單據到櫃檯，把手機遞給店員掃了一下。", m:{ capman_bag:[32,98,"back+type",-1,40,98] } },
      { t:"21:14:00", d:3.5, join:true, cap:"他在多媒體機前操作，拿著單據到櫃檯，把手機遞給店員掃了一下。", m:{ capman_bag:[134,98,"give@phone&bag/#c8b898",1,32,98] } },
      { t:"21:15:00", d:3, cap:"他走出去時抬了一下頭：戴眼鏡，五十多歲。", m:{ capman_bag:[200,98,"carry@bag/#c8b898",1] }, out:["capman_bag"] }
    ] },
    cctv_diner: { scene:"diner", cam:"CAM1 DINING", date:"2025-12-07", beats:[
      { t:"23:05:00", d:3, cap:"許美玲走進店裡，坐在靠窗的位子。", m:{ meiL:[41,84,"sit",1,200,98] } },
      { t:"23:12:00", d:3, cap:"蔡佳穎走進來，坐到她對面。", m:{ jiaL:[99,84,"sit",-1,200,98] } },
      { t:"00:12:00", d:3, cap:"蔡佳穎去櫃檯點了一份薯條，回到座位。", m:{ jiaL:[99,84,"sit",-1,99,84,[[150,86]]] } },
      { t:"00:48:00", d:2.5, cap:"許美玲先離開。", m:{ meiL:[200,98,null,1] }, out:["meiL"] },
      { t:"00:51:00", d:2.5, cap:"蔡佳穎離開。", m:{ jiaL:[200,98,null,1] }, out:["jiaL"] }
    ] }
  };
  [...EP3.cctv, ...EP3.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  const PS = [["wback",{phase:0}],["morgue",{}],["interview",{ knife:true }],["police",{}],["police",{}]];
  EP3.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 結案：所有人到分局的會議室 ---------- */
  EP3.court = {
    title: "新莊分局 會議室", scene: "police",
    who: ph => ph >= 2 ? ["lin","mei","jia","bao","jun","shu"] : ["lin","mei","jia","bao","shu"],
    open: ph => "你請所有人到分局的會議室。檢察官坐在最後一排，雙手抱胸。白板上還貼著那九根手指的照片。",
    kindLine: {
      murder: "我的結論是——鄭國華是被人折磨致死的。這不是一場意外，也不是單純的病死。",
      natural: "我的結論是——鄭國華是心臟病發作死的。切手指的人很殘忍，但不是殺死他的原因。",
      suicide: "我的結論是——鄭國華走投無路，自己安排了這一切。"
    },
    murmur: [ "（許美玲緊緊抓著手提包，指節都白了。）", "（阿豹翹起腳，笑了一聲。）", "（林啟明推了一下眼鏡，表情沒有任何變化。）" ],
    confess: { lin: [
      "……二十年。我幫他扛了二十年。",
      "他跪著求我，說年底一定補。結果他要帶著錢、帶著那個女人去曼谷，留我一個人去坐牢。",
      "我只是要密碼。我只是要把錢拿回來……他心臟那麼差，我不知道……我真的不知道他會死。",
      "人死了，我才想到阿豹剁的那根手指。我想，只要看起來像地下錢莊……"
    ] },
    cornered: { lin: "……我要找律師。" },
    deny: {
      lin: "警官，我和老鄭是二十年的兄弟。你這樣說，要有證據。",
      mei: "我是想過要他死，但我沒有殺他！那晚我在好食堡，她可以作證！",
      jia: "我們要一起走的……我為什麼要殺他？",
      bao: "我只剁一根，這我認。其他的你別想算到我頭上。",
      jun: "……我真的沒有進去。我只是……跑掉了。",
      shu: "我、我那天晚上吃了藥，什麼都不知道……",
      gang: "（金鼎的律師站起來：「我的當事人與本案無關。」）"
    },
    replayText: "12 月 7 日晚上，宏昌倉儲 B-12 裡真正發生的事——",
    replay: { scene:"wback", opt:{ phase:1, replay:true }, clean:true, cam:"案發經過重現", date:"2025-12-07", beats:[
      { t:"20:21:00", d:3.5, st:{ cut:true }, cap:"阿豹找上倉庫。他剁下鄭國華的左手小指，包紮好，帶著那根手指離開。", m:{ baoL:[116,98,"strike@knife",-1,200,98], zheng:[96,98,"cry",1] } },
      { t:"21:04:00", d:2.5, st:{ cut:true }, cap:"阿豹離開時，鄭國華還活著。", m:{ baoL:[220,98,null,1] }, out:["baoL"] },
      { t:"22:58:00", d:3, st:{ cut:true }, cap:"鄭國華用藏起來的第二支手機，打給林啟明的預付卡。", m:{ zheng:[96,98,"phone",1] } },
      { t:"23:40:00", d:3.5, st:{ cut:true }, cap:"林啟明來了，戴著鴨舌帽、提著布購物袋。他看到行李、護照，還有手機裡兩張飛曼谷的機票。", m:{ capman_bag:[130,98,"carry@bag/#c8b898",-1,200,98] } },
      { t:"23:41:00", d:3, join:true, st:{ cut:true }, cap:"林啟明來了，戴著鴨舌帽、提著布購物袋。他看到行李、護照，還有手機裡兩張飛曼谷的機票。", m:{ capman_bag:[124,98,"inspect@phone&bag/#c8b898",-1] } },
      { t:"00:05:00", d:4, st:{ cut:true, mid:true }, cap:"他把鄭國華綁在椅子上，用園藝剪一根一根剪下手指，逼問冷錢包的密碼。", m:{ zheng:[96,98,"sit",1], capman_bag:[112,98,"reach@scissors",-1] } },
      { t:"00:41:00", d:3, st:{ cut:true, mid:true }, cap:"拿到密碼後，他把 118 萬 USDT 轉到岳母名下的帳戶。", m:{ capman_bag:[124,98,"inspect@phone",-1] } },
      { t:"00:45:00", d:3.5, st:{ cut:true, mid:true }, cap:"鄭國華胸口劇痛，想拿藥。藥瓶被一腳踢到架子底下。", m:{ zheng:[96,98,"sit+clutch",1], capman_bag:[60,98,"stand",-1] } },
      { t:"01:30:00", d:4, st:{ cut:true, mid:true, late:true }, cap:"人死了。他剪下剩下的六根手指排在桌上，用死者的手指在牆上寫「欠債還錢」。", m:{ capman_bag:[100,92,"back+wipe",1] } },
      { t:"02:38:00", d:3, st:{ cut:true, mid:true, late:true }, cap:"他從側門離開。牆上那四個字，是寫給警察看的。", m:{ capman_bag:[220,98,"carry@bag/#c8b898",1,100,98] }, out:["capman_bag"] }
    ] },
    endGood: "林啟明被帶走時，回頭看了一眼白板上的照片。\n「那雙手，」他低聲說，「是算了一輩子帳的手。」",
    endBad: "會議室裡一片安靜。檢察官合上卷宗，看了你一眼。\n你總覺得，有人在心裡鬆了一口氣。"
  };
  { const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) }); const RP = EP3.court.replay; RP.opt = Object.assign({}, RP.opt, { seq:RP.beats.map(b => b.st || {}), ds:jds(RP.beats) }); }
})();
