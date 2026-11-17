/* =========================================================
   第 27 集：場景、人物造型、監視器畫面、結案、走動畫面、地圖、開場
   ========================================================= */
EP27.art = true;
(() => {
  const PR = PX.prim, { R, P } = PR;
  const W = 192, H = 108;
  const SC = PX.SCENES;
  // 每一段（beat）的狀態：o.ds＝每段長度（含段和段之間的 0.5 秒，join 的段沒有），o.seq＝每段的狀態；回傳 [第幾段, 這段的進度 0–1]
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i, p] = beatAt(o.t || 0, o.ds); return Object.assign({ _p:p }, (o.seq || [])[i] || {}); };
  const glow = (x, y, r, rgb, a) => { for (let k = r; k > 0; k -= 2){ const al = Math.round(a * (1 - k / r) * 255).toString(16).padStart(2, "0"); R(x - k, y - k * 0.7, k * 2, k * 1.4, rgb + al); } };
  const tiles = (y, c, l) => { R(0, y, W, H - y, c); for (let x = 0; x < W; x += 12) R(x, y, 1, H - y, l); for (let yy = y; yy < H; yy += 6) R(0, yy, W, 1, l); };
  const lamp = x => { R(x, 2, 30, 3, "#f4f0dc"); glow(x + 15, 8, 16, "#fff8e0", 0.16); };
  const smoke = (x, y, n, t) => { for (let k = 0; k < n; k++){ const a = (k * 37 + Math.floor((t || 0) * 6) * 11) % 23; R(x + (a % 9) * 3 - 12, y - k * 5 - (a % 4), 8 + (a % 5), 5, "#5a565499"); } };

  /* ---------- 科學館三樓的走廊：樓梯口（監視器）、化學教室的門、公佈欄、準備室的門、滅火器、安全門 ---------- */
  SC.c27_corr = (o) => { o = Object.assign({}, o, stOf(o)); const bf = !!o.before;
    R(0, 0, W, 86, "#d6d2c2"); R(0, 58, W, 28, "#b9c4bc"); R(0, 57, W, 1, "#9aa69e"); lamp(52); lamp(120);
    // 樓梯口
    R(2, 20, 26, 66, "#3a3f44"); R(2, 20, 26, 2, "#8a8a80"); for (let k = 0; k < 6; k++) R(4, 80 - k * 6, 22 - k * 3, 6, k % 2 ? "#6a6f74" : "#7a7f84"); R(2, 50, 26, 2, "#8a6a4a");
    // 天花板上的半球監視器
    R(28, 4, 8, 2, "#c8c8c0"); R(29, 6, 6, 4, "#2a2a2e"); P(32, 8, "#ff4a3a");
    // 化學教室的門（開著）
    R(44, 24, 20, 5, "#2f5a4a"); R(44, 30, 20, 56, "#8a6a4a"); R(46, 32, 16, 54, "#e8e4d4"); R(46, 32, 16, 18, "#9cc5e6"); R(46, 50, 16, 1, "#8a6a4a");
    // 公佈欄
    R(70, 24, 34, 22, "#7a5a3a"); R(72, 26, 30, 18, "#3f6a4a"); R(74, 28, 12, 8, "#f4f4f0"); R(88, 28, 12, 6, "#f4e8a0"); R(76, 38, 10, 5, "#f4f4f0"); R(90, 36, 8, 7, "#f0c8d0");
    // 準備室的門
    R(118, 22, 22, 5, "#2f5a4a");
    if (bf){ R(118, 28, 22, 58, "#7a5a3a"); R(120, 30, 18, 56, "#9a7a52"); R(122, 34, 14, 16, "#8a6a44"); R(135, 58, 2, 2, "#d8c060"); R(121, 30, 16, 2, "#5a5a5a"); }
    else { R(110, 12, 38, 16, "#8a8478"); R(114, 16, 30, 12, "#5a5650"); R(118, 28, 22, 58, "#2a2420"); R(120, 30, 18, 56, "#141210");
      R(125, 32, 13, 54, "#5a4a3a"); R(123, 36, 3, 50, "#4a3a2a"); R(127, 36, 9, 14, "#3a3028"); R(134, 58, 2, 2, "#d8c060");   // 被撬開、斜靠著的門板
      R(96, 60, 62, 2, "#f4d020"); for (let x = 98; x < 158; x += 8) R(x, 60, 3, 2, "#1a1a1a"); }   // 封鎖線
    // 安全門
    R(166, 18, 18, 6, "#2aa84a"); R(169, 20, 12, 2, "#f4f4f0"); R(164, 26, 22, 60, "#3f7a5a"); R(166, 28, 18, 56, "#4a8a66"); R(170, 34, 10, 6, "#c83a2a"); R(172, 36, 6, 2, "#f4f4f0"); R(181, 58, 3, 2, "#c8c8c0"); R(162, 54, 6, 4, "#f4f0dc"); R(163, 55, 4, 1, "#c83a2a");
    if (!bf){
      R(72, 80, 5, 6, "#e8f0f4"); R(73, 82, 3, 4, "#3a2a1a"); R(79, 80, 5, 6, "#e8f0f4"); R(80, 82, 3, 4, "#3a2a1a"); R(86, 80, 5, 6, "#e8f0f4"); R(87, 82, 3, 4, "#3a2a1a");   // 一排燒杯咖啡
      R(74, 76, 6, 4, "#f0a8c8"); R(82, 75, 6, 5, "#f4f0dc"); R(76, 78, 2, 2, "#4a8a4a"); R(84, 78, 2, 2, "#4a8a4a");   // 花
      R(143, 70, 6, 16, "#c83a2a"); R(144, 67, 4, 3, "#2a2a2a"); R(148, 68, 3, 1, "#2a2a2a"); R(144, 76, 4, 3, "#f4f4f0");   // 滅火器
    }
    if (o.smoke){ smoke(128, 40, 5, o.t); smoke(140, 30, 4, (o.t || 0) + 1); }
    tiles(86, "#a8a498", "#98948a");
  };

  /* ---------- 化學教室：黑板、示範桌、瓦斯總開關、酒精燈櫃、配電箱、角落的課桌 ---------- */
  SC.c27_class = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#dcd8c8"); R(0, 60, W, 26, "#c2ccc4"); lamp(40); lamp(110);
    R(150, 0, 42, 10, "#a8a498"); R(170, 0, 22, 16, "#8a867c");   // 天花板的煙燻
    R(20, 14, 90, 30, "#6a4a2a"); R(22, 16, 86, 26, "#2f5a4a"); R(28, 20, 40, 1, "#e8e8e0"); R(28, 24, 30, 1, "#e8e8e0"); R(28, 28, 36, 1, "#e8e8e0"); R(82, 30, 22, 9, "#e8e8e0"); R(83, 31, 20, 7, "#2f5a4a"); R(85, 33, 14, 1, "#e8e8e0"); R(85, 35, 10, 1, "#e8e8e0"); R(22, 43, 86, 1, "#c8c0a0");
    R(118, 30, 12, 16, "#c8c4b4"); R(119, 31, 10, 14, "#b0ac9c"); R(120, 36, 8, 3, "#c83a2a"); R(123, 40, 4, 5, "#f4f0dc");   // 瓦斯總開關（把手橫的＝關）
    R(140, 10, 28, 16, "#f4f4f0"); for (let k = 0; k < 6; k++) for (let j = 0; j < 3; j++) R(142 + k * 4, 12 + j * 4, 3, 3, ["#f0a8a8","#a8c8f0","#f0e0a0","#b8e0b8","#d8b8e8","#f0c8a0"][(k + j) % 6]);   // 週期表
    R(140, 30, 28, 56, "#7a6a52"); R(142, 32, 24, 52, "#b8d0d8"); for (let j = 0; j < 4; j++){ R(142, 44 + j * 12, 24, 1, "#7a6a52"); for (let k = 0; k < 5; k++){ R(144 + k * 4, 39 + j * 12, 3, 5, "#e8f0f4"); R(145 + k * 4, 37 + j * 12, 1, 2, "#c83a2a"); } } R(154, 32, 1, 52, "#7a6a52");   // 酒精燈櫃
    R(174, 34, 12, 18, "#9aa0a4"); R(176, 36, 8, 14, "#2a2a2e"); for (let k = 0; k < 4; k++) R(177 + (k % 2) * 4, 38 + Math.floor(k / 2) * 6, 2, 4, "#e8e8e0"); R(174, 28, 12, 5, "#f4f0dc");   // 配電箱和消防隊貼的紙
    R(32, 60, 70, 3, "#2a2a2e"); R(34, 63, 66, 23, "#5a4a3a"); R(60, 57, 10, 3, "#9aa0a4"); R(64, 52, 2, 5, "#c8c8c0"); R(62, 52, 6, 1, "#c8c8c0"); R(40, 68, 14, 8, "#4a3a2a"); R(80, 68, 14, 8, "#4a3a2a");   // 示範桌
    R(4, 66, 22, 3, "#c8a878"); R(6, 69, 18, 5, "#a88858"); R(7, 74, 2, 12, "#6a6a6a"); R(22, 74, 2, 12, "#6a6a6a"); R(10, 67, 10, 1, "#7a5a3a");   // 角落的課桌（刻了字）
    tiles(86, "#a8a498", "#98948a");
  };

  /* ---------- 化學準備室（預設＝燒過；before＝起火以前）：窗邊實驗桌、藥品櫃、小冰箱、水槽、她的辦公桌 ---------- */
  SC.c27_prep = (o) => { o = Object.assign({}, o, stOf(o)); const bf = !!o.before, p = o._p || 0;
    R(0, 0, W, 86, bf ? "#dcd8c8" : "#8a8478"); R(0, 60, W, 26, bf ? "#c2ccc4" : "#6a665c");
    if (bf) lamp(84);
    else { R(0, 0, 100, 60, "#5a544c"); R(0, 0, 64, 60, "#3a352f"); for (let k = 0; k < 26; k++) R(28 - k * 1.1, 56 - k * 2.2, 3 + k * 2.2, 3, "#1a1612"); }   // 煙燻和 V 字形燒痕
    // 窗戶
    R(6, 14, 34, 34, bf ? "#8a8e92" : "#2e2a26"); R(8, 16, 30, 30, bf ? "#9cc5e6" : "#56646a"); R(22, 16, 2, 30, bf ? "#8a8e92" : "#2e2a26"); R(21, 30, 4, 3, "#c8c8c0");
    if (!bf){ R(10, 20, 8, 1, "#c8d0d4"); R(17, 21, 1, 8, "#c8d0d4"); R(28, 34, 7, 1, "#c8d0d4"); }
    // 牆上的鐘
    R(104, 30, 9, 9, bf ? "#f4f4f0" : "#6a665e"); R(108, 32, 1, 3, "#1a1a1a"); R(108, 34, 3, 1, "#1a1a1a"); if (!bf) R(105, 39, 7, 2, "#6a665e");
    // 偵煙器
    R(120, 2, 6, 3, bf ? "#f4f4f0" : "#5a5650"); if (!bf) R(121, 5, 3, 1, "#3a3632");
    // 窗邊的實驗桌
    R(4, 58, 58, 3, bf ? "#2a2a2e" : "#141210"); R(6, 61, 54, 25, bf ? "#6a5a48" : "#2a2420"); if (!bf) R(22, 58, 9, 3, "#070605");
    if (!bf || o.rig){
      R(46, 18, 2, 40, "#4a4e52"); R(42, 56, 10, 2, "#3a3e42"); R(28, 28, 19, 1, "#4a4e52"); R(26, 27, 6, 1, "#4a4e52"); R(26, 29, 6, 1, "#4a4e52");   // 鐵架和鐵環
      R(16, 55, 24, 3, "#9aa0a4"); R(17, 54, 22, 1, "#b8bcc0"); R(18, 55, 20, 1, bf ? "#c8a040" : "#f4f4f0");   // 鐵盤（before＝煤油；之後＝白色硬殼）
      if (bf) { R(26, 55, 3, 1, "#d8d8d0"); R(31, 55, 2, 1, "#d8d8d0"); }   // 鈉
      R(22, 45, 13, 1, "#3a3a3e"); R(23, 46, 1, 9, "#3a3a3e"); R(33, 46, 1, 9, "#3a3a3e"); R(28, 46, 1, 9, "#3a3a3e");   // 三腳架
      R(24, 42, 9, 3, "#f4f4f0"); R(25, 41, 7, 1, "#e0e0dc"); if (o.fill) R(25, 41, 7, 1 + Math.round(2 * Math.min(1, o.fill)), "#9cc5e6"); if (!bf) R(32, 42, 1, 3, "#c8c8c0");   // 瓷皿
      if (!bf) { R(27, 30, 4, 3, "#2f4a3a"); R(28, 33, 2, 1, "#2f4a3a"); }   // 熔掉的網袋
      else if (o.ice > 0){ const s = o.ice, w = Math.round(3 + 4 * s), h = Math.round(2 + 6 * s); R(29 - Math.ceil(w / 2) - 1, 30, w + 2, h + 1, "#3f7a4a55"); R(29 - Math.ceil(w / 2), 30, w, h, "#cfe8f4"); R(29 - Math.ceil(w / 2), 30, w, 1, "#f4fcff"); R(28, 29, 2, 1, "#3f7a4a");
        if (o.drip) P(28, 31 + h + Math.floor(p * 12 % (9 - h > 2 ? 9 - h : 2)), "#9cc5e6"); }
      if (o.spill) { R(33, 44, 1, 10, "#9cc5e6"); }
    }
    if (o.fire){ const f = o.fire, n = Math.round(4 + 10 * f); for (let k = 0; k < n; k++){ const a = (k * 29 + Math.floor((o.t || 0) * 8) * 7) % 31, hh = 6 + (a % 9) + Math.round(14 * f); R(12 + (k * 3) % 34, 56 - hh, 3, hh, k % 3 ? "#ff9a2a" : "#ffd84a"); } glow(28, 44, 26, "#ff8a2a", 0.3 * f); smoke(30, 30, 5, o.t); }
    // 藥品櫃
    R(66, 20, 30, 66, bf ? "#8a8e92" : "#3a3a3a");
    if (bf && !o.cabOpen){ R(68, 22, 26, 62, "#a8acb0"); R(80, 22, 1, 62, "#7a7e82"); R(77, 50, 2, 5, "#5a5e62"); R(82, 50, 2, 5, "#5a5e62"); }
    else { R(68, 22, 26, 62, bf ? "#d8dcdc" : "#1e1c1a"); for (let j = 0; j < 3; j++) R(68, 38 + j * 15, 26, 1, bf ? "#8a8e92" : "#3a3a3a"); R(71, 28, 4, 9, "#7a4a2a"); R(78, 30, 4, 7, "#e8e8d8"); R(86, 29, 5, 8, "#3f7a4a"); R(72, 45, 5, 7, "#e8e8d8"); R(84, 44, 4, 8, "#7a4a2a");
      R(72, 75, 6, 8, "#6a4a2a"); R(73, 73, 4, 2, "#2a2a2a"); R(82, 73, 5, 10, "#c8c8a0"); R(83, 78, 3, 5, "#c8a040"); R(88, 58, 5, 8, "#f4f0dc");   // 鈉的廣口瓶、煤油、登記簿
      R(60, 22, 6, 62, bf ? "#8a8e92" : "#4a4a48"); }   // 打開的櫃門
    // 小冰箱
    R(100, 56, 16, 30, bf ? "#f0f0ec" : "#6a6862"); R(100, 66, 16, 1, "#4a4a48"); R(113, 59, 1, 5, "#4a4a48"); R(113, 69, 1, 8, "#4a4a48");
    // 水槽和瀝水架
    R(118, 60, 24, 26, bf ? "#9a8a72" : "#4a443c"); R(118, 58, 24, 3, "#9aa0a4"); R(134, 50, 2, 8, "#c8c8c0"); R(131, 50, 5, 1, "#c8c8c0"); R(119, 55, 11, 3, "#c8c8c0"); R(121, 49, 5, 6, bf ? "#e8f4f8" : "#b8c4c8"); R(121, 54, 5, 1, "#9aa0a4"); R(127, 52, 3, 3, "#f4f0dc");
    // 她的辦公桌、椅子、實驗衣
    R(146, 62, 42, 3, bf ? "#8a6a4a" : "#4a3a2e"); R(158, 65, 30, 21, bf ? "#7a5a3a" : "#3a2e24"); R(171, 67, 14, 10, bf ? "#8a8e92" : "#2a2a2a"); R(176, 71, 4, 1, "#c8c8c0");
    R(162, 58, 14, 4, bf ? "#f4f4f0" : "#c8c4b8"); R(163, 57, 12, 1, bf ? "#e8e8e0" : "#b8b4a8"); if (!bf){ R(165, 59, 2, 1, "#c83a2a"); R(167, 60, 7, 1, "#c83a2a"); }
    R(147, 50, 10, 22, bf ? "#f4f4f0" : "#c8c4b8"); R(148, 52, 8, 1, bf ? "#d8d8d4" : "#a8a498"); R(146, 72, 12, 3, "#3a3a40"); R(147, 75, 2, 11, "#3a3a40"); R(155, 75, 2, 11, "#3a3a40");
    if (o.slump){ R(158, 54, 8, 5, "#2a2220"); R(156, 58, 12, 4, "#f4f4f0"); R(166, 59, 6, 3, "#e8c8a8"); }   // 趴在桌上的人
    tiles(86, bf ? "#a8a498" : "#4a4640", bf ? "#98948a" : "#3a3632");
    if (!bf){ R(166, 92, 5, 1, "#c83a2a"); R(40, 90, 6, 2, "#1a1612"); R(70, 94, 4, 2, "#1a1612"); }   // 掉在地上的紅筆、燒掉的碎片
  };

  /* ---------- 教務處：阿滿姐的電腦、行事曆、冰箱、瀝水架、回收桶、主任的桌子、試卷保管櫃 ---------- */
  SC.c27_office = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#e2dccb"); R(0, 60, W, 26, "#cfc8b4"); lamp(30); lamp(120);
    R(60, 14, 38, 26, "#8a8e92"); R(62, 16, 34, 22, "#f8f8f4"); for (let k = 0; k < 5; k++) R(62 + k * 7, 16, 1, 22, "#c8c8c0"); for (let j = 0; j < 3; j++) R(62, 21 + j * 6, 34, 1, "#c8c8c0"); R(70, 24, 4, 2, "#3a6aa8"); R(84, 30, 4, 2, "#3a6aa8"); R(91, 30, 3, 2, "#c83a2a");   // 行事曆
    R(8, 62, 44, 3, "#8a6a4a"); R(10, 65, 40, 21, "#7a5a3a"); R(16, 46, 18, 13, "#1a1a1e"); R(17, 47, 16, 10, "#3a5a7a"); R(19, 49, 6, 3, "#9cc5e6"); R(27, 49, 4, 3, "#9cc5e6"); R(23, 59, 4, 3, "#2a2a2e"); R(38, 58, 10, 4, "#f4f4f0");   // 阿滿姐的桌子和電腦
    R(62, 44, 16, 42, "#f0f0ec"); R(62, 58, 16, 1, "#8a8e92"); R(75, 47, 1, 8, "#8a8e92"); R(75, 62, 1, 12, "#8a8e92");   // 冰箱（上層冷凍）
    R(80, 66, 18, 20, "#b8b0a0"); R(80, 64, 18, 2, "#9aa0a4"); R(81, 61, 16, 3, "#c8c8c0"); R(83, 57, 12, 4, "#e8f0f4"); R(83, 57, 12, 1, "#9cc5e6");   // 流理台、瀝水架上倒扣的保鮮盒
    R(100, 72, 10, 14, "#3a6aa8"); R(99, 71, 12, 2, "#2a4a7a"); R(102, 68, 3, 4, "#f4f0dc"); R(105, 67, 3, 5, "#f4f0dc");   // 紙類回收桶和紙杯
    R(114, 62, 40, 3, "#6a4a2a"); R(116, 65, 36, 21, "#5a3a22"); R(119, 69, 16, 12, "#6a4a2a"); R(125, 74, 4, 1, "#d8c060"); R(127, 59, 12, 3, "#d8c060"); R(142, 54, 8, 8, "#2a2a2e"); R(143, 55, 6, 5, "#3a5a7a");   // 主任的桌子、抽屜、名牌
    R(158, 24, 28, 62, "#6a7078"); R(160, 26, 24, 58, "#7a8088"); R(172, 26, 1, 58, "#5a6068"); R(168, 54, 3, 5, "#c8c8c0"); R(174, 54, 3, 5, "#c8c8c0"); R(162, 30, 8, 5, "#f4f0dc");   // 試卷保管櫃
    tiles(86, "#b0a898", "#a09888");
  };

  /* ---------- 印刷室（工友室）：影印機、紙架、鑰匙櫃、桌上的修繕紀錄簿、火警受信總機、廢紙箱、水桶 ---------- */
  SC.c27_print = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#d8d6cc"); R(0, 62, W, 24, "#c4c2b6"); lamp(60); lamp(140);
    R(14, 52, 42, 34, "#d8d8d4"); R(14, 50, 42, 3, "#b8b8b4"); R(16, 42, 30, 8, "#c8c8c4"); R(18, 44, 12, 5, "#2a3a4a"); R(20, 45, 8, 3, "#6ac8e8"); R(48, 46, 8, 4, "#e8e8e4"); R(18, 60, 34, 1, "#9a9a96"); R(18, 70, 34, 1, "#9a9a96"); R(14, 64, 4, 6, "#f4f4f0");   // 大台影印機
    R(62, 20, 30, 66, "#8a7a62"); for (let j = 0; j < 5; j++){ R(64, 22 + j * 13, 26, 11, "#6a5a48"); for (let k = 0; k < 3; k++) R(65 + k * 8, 24 + j * 13, 7, 8, j === 4 ? "#2a2a2e" : "#f4f4f0"); }   // 紙架
    R(100, 26, 18, 22, "#7a6a52"); R(102, 28, 14, 18, "#e8e0c8"); for (let j = 0; j < 3; j++) for (let k = 0; k < 4; k++) R(103 + k * 3, 30 + j * 5, 1, 3, "#c8b040"); R(104, 48, 8, 7, "#f4f0dc"); R(107, 46, 1, 2, "#2a2a2a");   // 鑰匙櫃和借用簿
    R(96, 64, 46, 3, "#8a6a4a"); R(98, 67, 3, 19, "#6a4a2a"); R(137, 67, 3, 19, "#6a4a2a"); R(104, 61, 14, 3, "#3a5a4a"); R(105, 60, 12, 1, "#f4f0dc"); R(124, 58, 6, 6, "#c8c8c0"); R(132, 61, 6, 3, "#f4f4f0");   // 桌子、修繕紀錄簿
    R(146, 22, 24, 28, "#c83a2a"); R(148, 24, 20, 10, "#2a2a2e"); for (let k = 0; k < 6; k++) P(150 + k * 3, 28, k === 2 ? "#ff4a3a" : "#3aa84a"); R(150, 38, 16, 8, "#e8e8e0"); R(152, 40, 12, 1, "#8a8a8a"); R(152, 43, 9, 1, "#8a8a8a");   // 火警受信總機
    R(150, 72, 22, 14, "#c8a870"); R(150, 72, 22, 2, "#a88850"); for (let k = 0; k < 6; k++) R(152 + k * 3, 69 + (k % 2), 2, 4, "#f4f4f0");   // 廢紙箱
    R(178, 74, 9, 12, "#3a6aa8"); R(177, 73, 11, 2, "#2a4a7a"); R(184, 44, 2, 30, "#c8a878"); R(182, 68, 6, 6, "#e8e8e0");   // 水桶和拖把
    tiles(86, "#a8a8a0", "#989890");
  };

  /* ---------- 校長室：茶几、紅榜、會議桌和簽到表、窗戶、校長的桌子和筆電 ---------- */
  SC.c27_prin = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#e8e0d0"); R(0, 60, W, 26, "#8a6a52"); R(0, 59, W, 1, "#6a4a32"); lamp(84);
    R(56, 14, 68, 20, "#c82a2a"); R(58, 16, 64, 16, "#d83a3a"); R(64, 20, 52, 2, "#f4d84a"); R(70, 25, 40, 2, "#f4d84a"); R(76, 29, 28, 1, "#f4e8a0");   // 紅榜
    R(150, 16, 30, 24, "#8a8e92"); R(152, 18, 26, 20, "#9cc5e6"); R(164, 18, 2, 20, "#8a8e92"); R(154, 28, 10, 10, "#b8b4a8"); R(156, 30, 3, 2, "#2a2420");   // 窗戶（看得到科學館，三樓有一扇是黑的）
    R(8, 66, 34, 3, "#6a4a2a"); R(10, 69, 3, 17, "#5a3a22"); R(37, 69, 3, 17, "#5a3a22"); R(12, 62, 8, 4, "#f4f0e0"); for (let k = 0; k < 4; k++) R(22 + k * 5, 63, 3, 3, "#e8e0d0"); R(36, 62, 3, 4, "#c8a040");   // 茶几、茶壺、倒扣的杯子、一個正的杯子
    R(50, 64, 82, 3, "#5a3a22"); R(54, 67, 4, 19, "#4a2a12"); R(124, 67, 4, 19, "#4a2a12"); R(84, 61, 14, 3, "#f4f4f0"); R(86, 62, 8, 1, "#3a3a8a"); R(100, 60, 2, 4, "#2a2a2a");   // 會議桌、簽到表、筆
    R(140, 62, 46, 3, "#6a4a2a"); R(142, 65, 42, 21, "#5a3a22"); R(150, 52, 16, 10, "#2a2a2e"); R(151, 53, 14, 8, "#e8f0f4"); R(153, 55, 10, 1, "#8a8a8a"); R(153, 57, 8, 1, "#8a8a8a"); R(172, 56, 6, 6, "#3f7a4a"); R(173, 52, 4, 4, "#4a8a4a");   // 校長的桌子、筆電、盆栽
    tiles(86, "#b89a7a", "#a88a6a");
  };

  /* ---------- 明星補習班櫃台：紅布條、電腦、刷卡機、抽屜、講義架、教室的玻璃門、傘桶 ---------- */
  SC.c27_cram = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#f0ece0"); R(0, 60, W, 26, "#e0d8c4"); lamp(40); lamp(120);
    R(20, 12, 100, 18, "#c82a2a"); R(22, 14, 96, 14, "#d83a3a"); R(28, 18, 60, 2, "#f4d84a"); R(28, 23, 44, 2, "#f4d84a"); R(96, 17, 16, 8, "#f4d84a"); R(98, 19, 12, 4, "#d83a3a");   // 紅布條
    R(20, 60, 70, 3, "#3a6aa8"); R(22, 63, 66, 23, "#f4f4f0"); R(22, 63, 66, 2, "#c8c8c0"); R(28, 44, 18, 13, "#1a1a1e"); R(29, 45, 16, 10, "#3a5a7a"); R(35, 57, 4, 3, "#2a2a2e"); R(54, 52, 8, 8, "#2a2a2e"); R(55, 53, 6, 3, "#3aa86a"); R(56, 57, 4, 2, "#c8c8c0"); R(67, 66, 20, 11, "#d8d8d4"); R(74, 71, 6, 1, "#8a8a8a");   // 櫃台、電腦、刷卡機、抽屜
    R(100, 40, 26, 46, "#8a7a62"); for (let j = 0; j < 3; j++){ R(102, 42 + j * 11, 22, 9, "#6a5a48"); for (let k = 0; k < 3; k++) R(103 + k * 7, 43 + j * 11, 6, 7, ["#f4f4f0","#f4e8a0","#c8e0f0"][(j + k) % 3]); } R(102, 76, 22, 8, "#6a5a48");   // 講義架
    R(140, 26, 36, 60, "#8a8e92"); R(142, 28, 32, 58, "#cfe4ee"); R(157, 28, 2, 58, "#8a8e92"); R(144, 34, 28, 10, "#f8f8f4"); for (let k = 0; k < 5; k++){ R(145 + k * 6, 56, 4, 4, "#2a2220"); R(144 + k * 6, 60, 6, 6, "#f4f4f0"); } R(155, 58, 2, 4, "#c8c8c0");   // 教室的玻璃門（裡面的學生）
    R(181, 72, 8, 14, "#4a4e52"); R(183, 62, 1, 10, "#c83a2a"); R(185, 60, 1, 12, "#3a6aa8"); R(187, 64, 1, 8, "#2a2a2a");   // 傘桶
    tiles(86, "#c8c4b8", "#b8b4a8");
  };

  /* ---------- 補習班的教室（監視器裝在白板上面，從講台往學生看） ---------- */
  const STU = [ { skin:"#e8c09a", hair:"#1a1a1a", hairStyle:"short" }, { skin:"#f0c8a8", hair:"#2a2220", hairStyle:"long", skirt:true }, { skin:"#d8a880", hair:"#2a2220", hairStyle:"spiky" }, { skin:"#f0c8a8", hair:"#3a2a22", hairStyle:"bun", skirt:true }, { skin:"#e8c09a", hair:"#1a1a1a", hairStyle:"slick", glasses:true } ]
    .map(L => Object.assign({ top:"#f4f4f0", coat:"#2a3a5a", bottom:"#2a3a5a" }, L));
  const deskF = (x, y) => { R(x - 13, y - 15, 26, 3, "#c8a878"); R(x - 13, y - 15, 26, 1, "#e0c498"); R(x - 12, y - 12, 2, 12, "#8a8e92"); R(x + 10, y - 12, 2, 12, "#8a8e92"); R(x - 5, y - 18, 9, 3, "#f8f8f4"); R(x - 4, y - 17, 6, 1, "#3a6aa8"); };
  SC.c27_room = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 64, "#eeeade"); R(0, 60, W, 4, "#d8d2c0"); lamp(40); lamp(120);
    R(6, 14, 40, 32, "#8a8e92"); R(8, 16, 36, 28, o.dusk ? "#3a4a6a" : "#9ab8d0"); R(25, 16, 2, 28, "#8a8e92"); R(8, 29, 36, 2, "#8a8e92"); if (o.dusk){ R(12, 20, 2, 2, "#f8e8a0"); R(34, 36, 2, 2, "#f8e8a0"); }   // 後牆的窗戶
    R(62, 16, 66, 28, "#7a5a3a"); R(64, 18, 62, 24, "#c83a2a"); R(70, 22, 50, 2, "#f8e060"); R(74, 28, 42, 2, "#f8e060"); R(80, 34, 30, 1, "#f8e060");   // 紅榜
    R(148, 20, 24, 44, "#6a4a2a"); R(150, 22, 20, 42, "#b8a078"); R(153, 26, 14, 12, "#9ab8d0"); R(152, 44, 2, 3, "#c8a040");   // 後門
    tiles(64, "#c8c4b8", "#b8b4a8");
  };
  // 前景：兩排學生和課桌（最後一排靠窗的位子空著，或是有人趴著）
  SC.c27_room.frontY = 90;
  SC.c27_room.front = (o) => { o = Object.assign({}, o, stOf(o));
    const far = [22, 58, 94, 130], near = [40, 78, 116], fy = 80, ny = 104;
    far.forEach((x, k) => { if (k > 0 && !o.empty) PR.person(x, fy, STU[k % STU.length], 1.25, 1, k % 2 ? "sit+write" : "sit"); });
    if (o.nap){ const x = far[0], y = fy - 22; R(x - 9, y + 5, 18, 6, "#2a3a5a"); R(x - 6, y, 12, 8, "#1a1a1a"); R(x - 4, y - 1, 2, 2, "#1a1a1a"); R(x + 1, y - 2, 2, 3, "#1a1a1a"); R(x - 12, y + 9, 8, 3, "#e8c09a"); R(x + 4, y + 9, 8, 3, "#e8c09a"); }   // 趴在桌上：只看到頭頂和兩隻手臂
    far.forEach(x => deskF(x, fy));
    near.forEach((x, k) => o.empty || PR.person(x, ny, STU[(k + 2) % STU.length], 1.25, 1, k === 1 ? "sit" : "sit+write"));
    near.forEach(x => deskF(x, ny));
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    shao:  { skin:"#e0b48c", hair:"#6a6a68", hairStyle:"slick", top:"#f4f4f0", coat:"#4a5a4e", bottom:"#3a3a40", tie:"#6a2a2a", glasses:true, hello:"沈警官。……這件事，學校會全力配合。" },
    bohan: { skin:"#e8c09a", hair:"#1a1a1a", hairStyle:"spiky", top:"#f4f4f0", coat:"#2a3a5a", bottom:"#2a3a5a", hello:"幹嘛？我又沒怎樣。" },
    gan:   { skin:"#d8a880", hair:"#2a2220", hairStyle:"slick", top:"#f4f4f0", coat:"#3a4a6a", bottom:"#2a2f3a", tie:"#e8c040", hello:"兩位是家長嗎？寒假先修班還有名額喔。……警察？" },
    kang:  { skin:"#f0c8a8", hair:"#2a2220", hairStyle:"bun", top:"#7a9ab8", coat:"#f4f4f0", bottom:"#4a4a56", mood:"tired", hello:"……對不起，我一直想到她昨天還在這裡。" },
    principal:{ skin:"#f0c8a8", hair:"#4a3a34", hairStyle:"bun", top:"#f4f0e8", coat:"#6a3a4a", bottom:"#3a3038", glasses:true, hello:"請坐。學校出這種事，我很難過。" },
    aman:  { skin:"#e8c09a", hair:"#3a2a22", hairStyle:"short", top:"#c88aa8", bottom:"#4a4a52", hello:"警察先生，要不要喝茶？……啊，現在好像不適合。" },
    tian:  { age:"old", skin:"#c89a70", hair:"#9a9a94", hairStyle:"short", top:"#5a7a9a", bottom:"#4a4a3a", mood:"tired", hello:"要是我昨天有帶鑰匙上去……" },
    yutong:{ skin:"#f0c8a8", hair:"#2a2220", hairStyle:"long", top:"#f4f4f0", coat:"#2a3a5a", bottom:"#2a3a5a", skirt:true, hello:"……老師真的不在了嗎？" },
    shi:   { skin:"#d8a880", hair:"#1a1a1a", hairStyle:"short", top:"#e8a030", coat:"#2a3040", bottom:"#2a3040", hello:"火調的報告還沒寫。你先看現場。" },
    wen:   { skin:"#f0c8a8", hair:"#2a2220", hairStyle:"bun", top:"#7a9ab8", coat:"#f4f4f0", bottom:"#3a3a44" },
    qian:  { hello:"報告在這裡。有一項，下午才會出來。" },
    xu:    { hello:"起火點很小。可是燒得太快了。" },
    wu:    { hello:"學長……這間教室，我以前坐過。" },
    kui:   { hello:"前輩，門鎖我看過了！" },
    ye:    { hello:"門是鎖著的。我想親眼看。" },
    li:    { hello:"你查。我看。" }
  };
  ["qian","xu","wu","kui","ye","li"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  const DAILY = {
    shao:  [ { room:"office", x:146, pose:"stand", doing:"站在自己的桌子旁邊，一直在擦眼鏡。" }, { room:"office", x:146, pose:"cross", doing:"雙手抱胸站著，看著窗外的雨。" } ],
    aman:  [ { room:"office", x:46, pose:"type", doing:"在電腦前面打字，打一下就停下來嘆氣。" }, { room:"office", x:46, pose:"type", doing:"在整理寒輔的點名單。" } ],
    bohan: [ null, { room:"prin", x:118, pose:"cross", doing:"靠在會議桌旁邊，雙手抱胸，不看任何人。" } ],
    yutong:[ null, { room:"prin", x:40, pose:"cry", doing:"站在茶几旁邊，眼睛紅紅的，手上捏著一張衛生紙。" } ],
    principal:[ null, { room:"prin", x:176, pose:"stand", doing:"站在窗戶前面，看著對面的科學館。" } ],
    tian:  [ { room:"print", x:78, pose:"stand", doing:"站在影印機旁邊，一直在搓手。" }, { room:"corr", x:36, pose:"broom", doing:"在樓梯口掃地，掃得很慢。" } ],
    kang:  [ { room:"corr", x:100, pose:"cry", doing:"站在公佈欄前面，看著那張手寫的紙條。" }, null ],
    gan:   [ null, { room:"front", x:136, pose:"stand", doing:"站在講義架旁邊，手一直放在西裝口袋裡。" } ],
    shi:   [ { room:"prep", x:48, pose:"write", doing:"站在窗邊的實驗桌旁邊，在板夾上畫圖。" }, { room:"prep", x:48, pose:"inspect", doing:"蹲低看著鐵盤，看了很久。" } ],
    qian:  [ { room:"lab27", x:30, pose:"read", doing:"拿著解剖報告，站得很直。" }, { room:"lab27", x:30, pose:"read", doing:"在看剛出來的藥物報告。" } ],
    xu:    [ { room:"prep", x:130, pose:"inspect", doing:"拿著手電筒，在看藥品櫃。" }, { room:"lab27", x:54, pose:"inspect", doing:"在顯微鏡前面，手邊一排樣本瓶。" } ],
    wu:    [ { room:"corr", x:42, pose:"stand", doing:"站在化學教室門口，一直看著裡面。" }, { room:"office", x:88, pose:"phone", doing:"在講電話，問員生社的事。" } ],
    kui:   [ { room:"class", x:100, pose:"write", doing:"在示範桌旁邊寫紀錄，寫得很用力。" }, { room:"lab27", x:124, pose:"type", doing:"在打化驗單。" } ],
    ye:    [ { room:"corr", x:158, pose:"read", doing:"站在走廊盡頭，翻著消防局的報告。" }, { room:"lab27", x:150, pose:"read", doing:"拿著卷宗，等你的答案。" } ],
    li:    [ { room:"class", x:44, pose:"write", doing:"站在教室後面，在小本子上寫字。" }, { room:"lab27", x:176, pose:"write", doing:"站在門邊，在小本子上寫字。" } ]
  };
  EP27.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP27.rooms = {
    sci: [
      { id:"corr", name:"三樓的走廊", scene:"c27_corr", details:[
        { id:"d27_notice", name:"公佈欄", hot:[70,24,34,22], text:"寒假輔導課表：「高二化學　13:30–15:30　科 3F」。\n下面釘著一張手寫的紙：「下課後要問問題，請敲準備室的門。　溫」" },
        { id:"d27_stairs", name:"樓梯", hot:[2,20,26,60], text:"樓梯往下是二樓的物理教室，再往下是一樓的穿堂和販賣機。寒輔這幾天，二樓沒有排課。" } ] },
      { id:"class", name:"化學教室", scene:"c27_class", details:[
        { id:"d27_table", name:"週期表", hot:[140,10,28,16], text:"牆上的元素週期表。右下角有人用鉛筆寫：「背不起來」。\n下面是紅筆的字：「背得起來。下課來找我。」" },
        { id:"d27_bench", name:"示範桌", hot:[34,60,66,24], text:"示範桌擦得很乾淨。抽屜上貼著一張護貝的紙：「借用器材請登記。用完洗乾淨、放回原位。」" } ] },
      { id:"prep", name:"化學準備室", scene:"c27_prep", details:[
        { id:"d27_clock", name:"牆上的鐘", hot:[102,28,13,13], text:"牆上的鐘停在 17:24。塑膠外殼被烤得往下垂，像融化的蠟。" } ] }
    ],
    admin: [
      { id:"office", name:"教務處", scene:"c27_office", details:[
        { id:"d27_name", name:"桌上的名牌", hot:[125,57,16,6], text:"名牌：「教務主任　邵文正」。\n旁邊一個小相框，是很多年前的畢業合照。他站在最後一排，比現在瘦，穿著一件白色的實驗衣。" } ] },
      { id:"print", name:"印刷室", scene:"c27_print", details:[
        { id:"d27_paper", name:"紙架", hot:[62,20,30,40], text:"一包一包的影印紙，疊到快碰到天花板。最下面一層是碳粉匣，每一支都用奇異筆寫了更換的日期。" },
        { id:"d27_bucket", name:"水桶和拖把", hot:[176,44,12,42], text:"田叔的水桶。拖把是濕的——他今天一早，已經把整棟行政大樓拖過一遍了。" } ] },
      { id:"prin", name:"校長室", scene:"c27_prin", phase:1, details:[
        { id:"d27_view", name:"窗戶", hot:[150,16,30,24], text:"從校長室的窗戶，看得到對面的科學館。三樓東邊那一排窗戶，有一扇是黑的。" } ] }
    ],
    lab: [ { id:"lab27", name:"鑑識中心", scene:"lab", details:[] } ],
    cram: [ { id:"front", name:"明星補習班的櫃台", scene:"c27_cram", details:[
      { id:"d27_classdoor", name:"教室的玻璃門", hot:[140,26,36,60], text:"玻璃門裡面是教室，坐滿了穿澄港高中制服的學生。白板上寫著：「寒假先修班　高二化學」。" },
      { id:"d27_umbrella", name:"傘桶", hot:[180,60,10,26], text:"門口的傘桶，插著幾把學生的傘。有一把上面用立可白寫著班級和座號。" } ] } ]
  };
  const PS = [["c27_corr",{}],["lab",{}]];
  EP27.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 監視器動畫 ---------- */
  const strip = L => { const o = Object.assign({}, L || {}); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  EP27.looks = { shaoC: strip(LOOK.shao), wenC: strip(LOOK.wen), ytC: strip(LOOK.yutong), tianC: strip(LOOK.tian), bohanC: strip(LOOK.bohan), ganC: strip(LOOK.gan), ganB: Object.assign(strip(LOOK.gan), { tie:null }), prC: strip(LOOK.principal) };
  const mk = (scene, opt, cam, date, beats, clean) => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join);
    return { scene, opt:Object.assign({}, opt, { ds, seq:beats.map(b => b.st || {}) }), cam, date, clean, beats:beats.map(b => { const o = Object.assign({}, b); delete o.st; return o; }) }; };
  const ANIM = {
    cctv27_stairs: mk("c27_corr", { before:true }, "CAM 科3F-E", "2027-01-25", [
      { t:"15:31:10", d:4, cap:"15:31，溫淑芬和一個抱著考卷的女學生上樓，走進走廊。", m:{ wenC:[116,96,"walk1",1,6,96], ytC:[100,96,"hold@box/#f4f4f0",1,-12,96] } },
      { t:"15:31:40", d:2.5, join:true, cap:"15:31，兩個人走進準備室。", m:{ wenC:[128,89,"door",1], ytC:[126,89,"hold@box/#f4f4f0",1] }, out:["wenC","ytC"] },
      { t:"15:33:20", d:3.5, cap:"15:33，女學生一個人出來，下樓。", m:{ ytC:[4,96,"walk1",-1,128,90] }, out:["ytC"] },
      { t:"15:42:05", d:4.5, cap:"15:42，邵文正上樓。一隻手拿著兩杯飲料，另一隻手提著一個鼓鼓的保冷袋。", m:{ shaoC:[114,96,"carry:L@bag/#3a6aa8&cup",1,6,96] } },
      { t:"15:42:30", d:2.5, join:true, cap:"15:42，他敲了門，走進準備室。", m:{ shaoC:[128,89,"knock:L&bag/#3a6aa8",1] }, out:["shaoC"] },
      { t:"16:24:10", d:4.5, cap:"16:24，邵文正一個人出來，把門帶上。紙杯疊在一起，保冷袋是扁的。他下樓。", m:{ shaoC:[4,96,"carry:R@cloth/#3a6aa8&cup",-1,128,90] }, out:["shaoC"] },
      { t:"17:16:20", d:3.5, cap:"16:24 到 17:16，樓梯口沒有任何人經過。17:16，走廊裡面開始冒煙。", st:{ smoke:true }, m:{} },
      { t:"17:17:30", d:3.5, cap:"17:17，田叔拿著滅火器衝上樓。", st:{ smoke:true }, m:{ tianC:[108,96,"carry@bottle/#c83a2a",1,6,96] } }
    ]),
    cctv27_cram: Object.assign(mk("c27_room", {}, "CAM 3F 教室", "2027-01-25", [
      { t:"16:27:10", d:4.5, cap:"16:27，江柏翰從後門走進教室，坐到最後一排靠窗的位子。", m:{ bohanC:[22,80,"sit",1,160,70] } },
      { t:"16:30:00", d:4, cap:"16:30，甘志遠走上講台，開始上課。", m:{ bohanC:[22,80,"sit",1], ganC:[164,107,"stand",-1,204,107] }, out:["bohanC","ganC"] },
      { t:"17:16:00", d:3.5, cap:"17:16，甘志遠還在講台上。江柏翰趴在桌上睡覺。", st:{ nap:true, dusk:true }, m:{ ganB:[164,107,"back+point",-1] }, out:["ganB"] },
      { t:"18:00:00", d:3.5, cap:"18:00，下課。甘志遠走出教室。", st:{ nap:true, dusk:true }, m:{ ganC:[204,107,"walk1",1,164,107] }, out:["ganC"] },
      { t:"18:32:00", d:4, cap:"18:32，江柏翰背起書包，從後門離開。", st:{ dusk:true, empty:true }, m:{ bohanC:[160,70,"carry@bag/#2a2f3a",1,22,80] }, out:["bohanC"] }
    ]), { s:1.25 })
  };
  [...EP27.cctv, ...EP27.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案：重現 ---------- */
  const mkR = beats => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join); const seq = beats.map(b => b.st || {});
    return beats.map(b => { const o = Object.assign({}, b, { opt:Object.assign({}, b.opt || {}, { ds, seq }) }); delete o.st; return o; }); };
  const RB = mkR([
    { t:"01/11 18:42", d:5, cap:"1 月 11 日 18:42，印刷室。邵文正用自己的帳號，把溫淑芬剛交進來的母卷多印了四十份。", scene:"c27_print", opt:{}, m:{ shaoC:[66,96,"reach@paper",-1,150,96] } },
    { t:"01/22 17:30", d:5, cap:"1 月 22 日傍晚，溫淑芬拿著補習班的猜題卷來找他：「禮拜一下班以前，你自己去跟校長講。」", scene:"c27_office", opt:{}, m:{ wenC:[126,96,"give@paper",1,60,96], shaoC:[146,96,"stand",-1] }, out:["wenC"] },
    { t:"01/22 18:10", d:4.5, cap:"那天晚上，他在教務處的冰箱冰了一盒水。", scene:"c27_office", opt:{}, m:{ shaoC:[88,96,["hold@box/#dce8f0","hold@box/#dce8f0","reach@box/#dce8f0"],-1,146,96] } },
    { t:"01/25 15:42", d:5, cap:"1 月 25 日 15:42，他帶著兩杯咖啡和一個保冷袋走進準備室。她那一杯裡，有六顆安眠藥。", scene:"c27_prep", opt:{ before:true }, m:{ wenC:[150,96,"sit+cup",-1], shaoC:[128,96,"give@cup",1,60,96] }, out:["wenC"] },
    { t:"01/25 16:10", d:5.5, cap:"等她趴在桌上睡著，他從藥品櫃拿出金屬鈉和煤油，放進窗邊的鐵盤；架上瓷皿，再用網袋把那塊冰吊在鐵架上。", scene:"c27_prep", opt:{ before:true }, st:{ rig:true, ice:1, slump:true, cabOpen:true }, m:{ shaoC:[52,96,"reach",-1,110,96] } },
    { t:"01/25 16:24", d:4.5, cap:"16:24，他把門帶上。門一關，就鎖了。水，一滴一滴落進瓷皿。", scene:"c27_prep", opt:{ before:true }, st:{ rig:true, ice:0.9, drip:true, fill:0.1, slump:true }, m:{ shaoC:[204,96,"carry@bag/#3a6aa8",1,60,96] }, out:["shaoC"] },
    { t:"01/25 16:28", d:4.5, cap:"16:28，他坐進校長室，第一個簽到。", scene:"c27_prin", opt:{}, m:{ shaoC:[92,96,"write",1,6,96], prC:[176,96,"stand",-1] } },
    { t:"01/25 17:16", d:4.5, cap:"17:16，瓷皿滿了。水沿著邊緣流下去，滴進鐵盤，碰到了鈉。", scene:"c27_prep", opt:{ before:true }, st:{ rig:true, ice:0.25, drip:true, fill:1, spill:true, slump:true, fire:0.35 }, m:{} },
    { t:"01/25 17:16", d:4.5, join:true, cap:"冰融光了，網袋燒掉了。偵煙器響的時候，他正坐在校長的對面。", scene:"c27_prep", opt:{ before:true }, st:{ rig:true, ice:0, fill:1, slump:true, fire:1 }, m:{} }
  ]);
  EP27.court = {
    title: "澄港高中・校長室・1 月 26 日 18:30", scene: "c27_prin", opt:{},
    who: ph => ["shao","bohan","gan","kang"],
    open: ph => "18:30，校長室。外面的雨還在下。邵文正坐在會議桌的一頭，眼鏡拿在手上。甘志遠被請來了，西裝的肩膀濕了一片。江柏翰靠在門邊，康雅雯站在窗戶前面，看著對面那一扇黑掉的窗。",
    kindLine: {
      accident: "那一場火，是準備室裡的東西自己燒起來的。是意外。",
      suicide: "門是她自己鎖的，火也是她自己放的。",
      murder: "1 月 25 日傍晚那一場火，不是意外。是有人讓它燒起來的。"
    },
    kindTrue: "",
    murmur: [ "（雨打在校長室的窗戶上。）", "（邵文正把眼鏡戴上，又拿下來。）", "（牆上那張紅榜，沒有人看。）" ],
    confess: { shao: [ "……她說，禮拜二。", "二十二年。我在這間學校二十二年。她一句話，就什麼都沒有了。", "我只是想讓她……晚一點說。", "（他看著自己的手。）冰融化的時間，我算過三次。" ] },
    cornered: { shao: "我那時候在開會！校長可以作證！你們憑什麼——" },
    deny: {
      bohan: "我只是寫了一句氣話！我連三樓都沒上去！",
      gan: "我只是買考卷！火的事跟我沒有關係！",
      kang: "……我沒有鑰匙。我連那扇門都打不開。"
    },
    replayText: "1 月 11 日 18:42，印刷室——",
    replay: { scene:"c27_print", opt:{}, clean:true, cam:"經過重現", date:"2027-01-11", beats:RB },
    endGood: "18:50，葉晴簽了拘票。邵文正被帶出校長室的時候，走廊上站著幾個還沒回家的學生。沒有人說話。\n甘志遠也被請上了車：洩題，另案辦。\n小吳一個人走回科學館三樓。封鎖線前面那一排燒杯，他蹲下來，把每一杯冷掉的咖啡，都擺正。\n溫淑芬那疊小考卷，康雅雯說，她會改完。",
    endBad: "報告上寫的是你的結論。\n一個禮拜以後，化學準備室重新粉刷。新的學期，高二化學的平均分數，還是全市第一。\n校長室的紅榜，沒有人拿下來。"
  };

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP27.fac = { sci:["#c8c0ae","#3f6a5a"], admin:["#d8ccb4","#7a4a3a"], lab:["#e2e8e8","#3a7a8a"], cram:["#f0e8d8","#c82a2a"] };
  EP27.setting = { sci:"city", admin:"city", lab:"city", cram:"city" };
  // 早上：寒流、晴；下午：陰，15:00 以後下雨
  const SKY27 = [ ["#6aa8e0","#c0dcf0","#5a6a56","#6a7a62",0,0], ["#6a7480","#a0a8b0","#4a5a50","#5a6a5a",1,0] ];
  EP27.worldSky = ph => SKY27[Math.min(ph || 0, SKY27.length - 1)];
  EP27.roomDesc = {
    corr:"科學館三樓的走廊。燒焦的味道還沒散。", class:"化學教室。黑板上還留著昨天的字。", prep:"化學準備室。靠窗那一頭全黑了。",
    office:"教務處。影印紙和茶葉的味道。", print:"印刷室，也是田叔的工友室。", prin:"校長室。牆上一張很大的紅榜。",
    lab27:"鑑識中心。", front:"明星補習班的櫃台。日光燈白得刺眼。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  EP27.world = {};
  EP27.locations.forEach(l => { EP27.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP27.world.sci, {
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長……準備室在三樓最裡面。消防隊說可以進去了。", "小吳"),
      say("you", "門是鎖著的？", "你"),
      say("wu", "對。消防隊是撬開的。鑰匙……在溫老師自己的口袋裡。", "小吳"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下。", "小吳")
    ]
  });
  EP27.mapPos = { sci:[96,56,"d"], admin:[150,60,"d"], lab:[204,24,"u"], cram:[52,104,"d"] };
  EP27.mapRoads = [["sci","admin"],["admin","lab"],["sci","cram"],["admin","cram"]];
  EP27.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    R(60, 26, 130, 60, "#8aa878"); dither(60, 26, 130, 60, "#7a9868", 2);   // 校園
    R(70, 72, 60, 10, "#b87a5a"); R(74, 74, 52, 6, "#c88a6a");   // 操場的跑道
    for (let x = 6; x < 56; x += 8) for (let y = 10; y < 90; y += 7) if ((x + y * 3) % 7) R(x, y, 6, 5, "#c8c0b0");
    for (let x = 196; x < 236; x += 8) for (let y = 40; y < 120; y += 7) if ((x * 2 + y) % 5) R(x, y, 6, 5, "#c8c0b0");
    R(0, 94, 240, 4, "#7a7a72"); R(192, 0, 4, 135, "#7a7a72"); R(58, 86, 134, 2, "#6a6a62");   // 校門口的路、往鑑識中心的路、圍牆
  };
})();
