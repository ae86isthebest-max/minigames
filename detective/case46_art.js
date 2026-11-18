/* =========================================================
   第 46 集：場景、人物造型、監視器畫面、重現、結案、走動畫面、地圖
   沿用：海風咖啡（cafe.js）
   新畫的：魚市停車場 c46_lot、管理室 c46_guard、金鴻冷凍行辦公室 c46_office、過磅台 c46_dock、冷凍倉 c46_cold、
           旬 c46_shun、丸福壽司 c46_maru、後巷 c46_alley；監視器的畫面用 o.cam（灰階、雜訊）
   這一集玩家是沈岳（停職，穿工作服、雨鞋、橡膠圍裙）；豆花跟著他（走動畫面裡是趴在過磅台、咖啡店的狗）。
   ========================================================= */
EP46.art = true;
(() => {
  const PR = PX.prim, { R: R0, P: P0, dither } = PR;
  const W = 192, H = 108;
  const SC = PX.SCENES;
  const R = (x, y, w, h, c) => R0(Math.round(x), Math.round(y), w, h, c), P = (x, y, c) => P0(Math.round(x), Math.round(y), c);
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o || !o.ds) return {}; const [i, p] = beatAt(o.t || 0, o.ds); return Object.assign({ _p:p }, (o.seq || [])[i] || {}); };
  const tube = (x, on) => { R(x - 10, 0, 20, 2, "#d8dcd8"); R(x - 9, 2, 18, 1, on === false ? "#8a8e8a" : "#f4f8f0"); if (on !== false) dither(x - 13, 3, 26, 6, "#f4f8f022", 3); };
  const floorT = (y, a, b, step) => { R(0, y, W, H - y, a); R(0, y, W, 1, b); for (let x = 8; x < W; x += step || 24) R(x, y + 12, 1, H - y - 12, b); R(0, y + 12, W, 1, b); };
  const door = (x, frame, leaf, knob, glass) => { R(x, 26, 18, 50, frame); R(x + 2, 28, 14, 48, leaf); if (glass){ R(x + 4, 31, 10, 12, glass); R(x + 4, 31, 10, 1, "#ffffff55"); } else { R(x + 4, 31, 10, 18, "#00000014"); R(x + 4, 53, 10, 19, "#00000014"); } R(knob > 0 ? x + 13 : x + 3, 52, 2, 3, "#d8c890"); };
  // 監視器的畫面：灰階＋雜訊（畫在人的前面）
  const camFx = (o) => { if (!o || !o.cam) return; const g = PR.g(), cv = g.canvas, w = cv.width, h = cv.height; try { const im = g.getImageData(0, 0, w, h), d = im.data; let s = Math.floor((o.t || 0) * 7) * 977 + 13;
      for (let i = 0; i < d.length; i += 4){ s = (s * 1103515245 + 12345) & 0x7fffffff; const n = (s % 17) - 8; const v = Math.max(0, Math.min(255, (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) * 0.92 + 10 + n)); d[i] = v; d[i + 1] = v; d[i + 2] = Math.min(255, v * 1.02); }
      g.putImageData(im, 0, 0); } catch (e) {}
    R(4, 4, 3, 3, "#e83a3a"); };
  // 冷凍魚（側面，結霜），x 是頭
  const fish = (x, y, len, c) => { R(x, y, len, 4, c || "#c8d4dc"); R(x + 1, y - 1, len - 4, 1, "#e4ecf0"); R(x + len, y - 1, 2, 2, "#a8b8c4"); R(x + len, y + 3, 2, 2, "#a8b8c4"); P(x + 2, y + 1, "#2a3036"); R(x + 4, y + 3, len - 8, 1, "#a8b8c4"); };
  // 海龍漁業的藍色箱子（封條是紅的）
  const hlBox = (x, y) => { R(x, y, 12, 8, "#2a5a9a"); R(x, y, 12, 1, "#4a7aba"); R(x, y + 3, 12, 1, "#c83a2a"); R(x + 5, y, 1, 8, "#c83a2a"); R(x + 1, y + 5, 3, 2, "#f4f4f0"); };
  // 機車（白色舊速克達），x 是左邊（車尾）；box＝後面綁著長保麗龍箱
  const scooter = (x, y, box, col) => { col = col || "#e8e8e4"; const sh = "#b8b8b4";
    const wheel = (cx) => { R(cx - 3, y - 6, 7, 7, "#2a2a2e"); R(cx - 2, y - 7, 5, 1, "#2a2a2e"); R(cx - 1, y - 4, 3, 3, "#7a7a7e"); };
    wheel(x + 7); wheel(x + 34);
    R(x + 1, y - 12, 17, 6, col); R(x + 3, y - 13, 13, 1, col); R(x + 1, y - 7, 17, 1, sh); R(x + 1, y - 11, 2, 2, "#c83a2a");   // 後車身、尾燈
    R(x + 3, y - 15, 13, 2, "#2a2a2e"); R(x + 4, y - 16, 11, 1, "#3a3a3e");   // 座墊
    R(x + 17, y - 7, 11, 2, sh); R(x + 17, y - 7, 11, 1, col);   // 腳踏板
    R(x + 27, y - 12, 4, 7, col); R(x + 28, y - 16, 4, 4, col); R(x + 29, y - 19, 4, 3, col); R(x + 31, y - 6, 6, 2, col);   // 擋風、前輪蓋
    R(x + 30, y - 22, 2, 3, "#5a5a5e"); R(x + 26, y - 23, 10, 1, "#3a3a3e"); R(x + 33, y - 19, 2, 2, "#f8e8a0");   // 把手、車燈
    if (box){ R(x - 10, y - 22, 26, 6, "#f4f4f0"); R(x - 10, y - 22, 26, 1, "#ffffff"); R(x - 10, y - 17, 26, 1, "#c8c8c4"); R(x - 4, y - 22, 1, 6, "#2a2a2e"); R(x + 10, y - 22, 1, 6, "#2a2a2e"); } };

  /* ---------- 魚市・停車場（戶外）：左邊是大門的欄杆 x2–40；右邊是魚市的建築 x58–192（招牌 x88–150 y14–23，警衛室的窗 x62–84，鐵捲門 x150–188）；
     路燈 x96；停車場的鏡頭 x174（杆子）；白線。o.night＝夜裡；o.truck＝白天停著的小貨車；o.scooter＝老包的機車（x100–148） ---------- */
  SC.c46_lot = (o) => { o = Object.assign({}, o, stOf(o)); const nt = !!o.night;
    PR.sky(nt ? "#141a2a" : "#9cc4e0", nt ? "#2a3044" : "#e4ecf0", 76);
    // 魚市的建築
    R(58, 10, 134, 66, nt ? "#5a5e66" : "#c8c4b8"); R(58, 8, 134, 3, nt ? "#3a3e46" : "#8a8a84"); for (let x = 64; x < W; x += 24) R(x, 11, 1, 65, nt ? "#50545c" : "#bab6aa");
    R(88, 14, 62, 9, nt ? "#d8d4c4" : "#f4f0e4"); R(88, 14, 62, 1, "#2a5a8a"); R(88, 22, 62, 1, "#2a5a8a");   // 招牌（字由 labels 寫）
    R(62, 34, 22, 16, "#4a4e54"); R(63, 35, 20, 14, nt ? "#e8d890" : "#9ab8c8"); R(72, 35, 1, 14, "#4a4e54"); if (nt) dither(63, 50, 20, 26, "#e8d89018", 3);   // 警衛室的窗
    R(86, 30, 16, 46, "#5a6068"); R(88, 32, 12, 44, nt ? "#3a3e44" : "#7a8088"); R(97, 52, 2, 3, "#c8ccd0");   // 側門（往走道）
    R(150, 28, 38, 48, "#7a7e84"); for (let y = 30; y < 76; y += 3) R(151, y, 36, 1, "#6a6e74"); R(150, 28, 38, 2, "#5a5e64");   // 鐵捲門
    R(106, 30, 28, 12, nt ? "#3a3e46" : "#b4b0a4"); R(108, 32, 24, 8, nt ? "#2a2e34" : "#8aa4b4");   // 二樓的窗
    // 大門的欄杆
    R(2, 52, 6, 24, "#d8d4c8"); R(3, 50, 4, 2, "#c83a2a"); R(8, 56, 34, 2, "#f4f4f0"); for (let x = 10; x < 42; x += 8) R(x, 56, 4, 2, "#c83a2a");
    // 路燈
    R(141, 20, 2, 56, "#3a3e44"); R(138, 18, 9, 3, "#3a3e44"); R(139, 21, 6, 1, nt ? "#fff4c0" : "#d8d8d0"); if (nt){ dither(122, 22, 40, 54, "#fff4c014", 2); R(126, 74, 32, 2, "#fff4c022"); }
    // 停車場的鏡頭
    R(176, 6, 2, 70, "#4a4e54"); R(172, 4, 9, 4, "#2a2a2e"); R(170, 5, 3, 2, "#3a3a40"); P(179, 5, "#e83a3a");
    // 地面、白線、水窪
    R(0, 76, W, 32, nt ? "#3a3c40" : "#8a8a86"); R(0, 76, W, 1, nt ? "#2a2c30" : "#6a6a66");
    for (let x = 52; x < W; x += 40){ R(x, 80, 1, 18, "#e8e8e0"); } R(46, 98, 146, 1, "#e8e8e0");
    R(60, 100, 22, 2, nt ? "#5a6a7a" : "#a8b8c4"); R(62, 100, 8, 1, nt ? "#8a9aaa" : "#d8e4ec");
    if (o.truck){ R(10, 54, 36, 18, "#3a6aa8"); R(10, 54, 36, 1, "#5a8ac8"); R(46, 60, 12, 12, "#3a6aa8"); R(48, 62, 7, 5, "#a8c8d8"); R(14, 70, 7, 7, "#2a2a2e"); R(46, 70, 7, 7, "#2a2a2e"); R(16, 72, 3, 3, "#6a6a6e"); R(48, 72, 3, 3, "#6a6a6e"); }
    if (o.scooter) scooter(108, 77, true);
  };

  /* ---------- 魚市・管理室（夜裡是警衛室）：門 x3–20；門禁卡的名單 x28–47（y18–33）；窗 x52–70；
     辦公桌 x58–118（桌面 y56–59）：電腦 x62–80（y38–54，右下角是冷凍倉的溫度）、巡邏簿 x82–97（y51–55）、印表機 x104–116（y46–56）；
     一排三台螢幕 x112–148（y16–40）；鑰匙箱 x156–168；o.pot＝夜裡老包的鹹粥（x128–142）；o.cam 無 ---------- */
  SC.c46_guard = (o) => { o = Object.assign({}, o, stOf(o)); const nt = !!o.night;
    R(0, 0, W, 76, "#dcd8cc"); R(0, 0, W, 4, "#bcb8ac"); R(0, 62, W, 14, "#ccc6b6"); R(0, 62, W, 1, "#b4ae9e"); tube(60, true); tube(150, true);
    door(3, "#6a6e74", "#9aa0a8", 1, "#b8c8d0");
    R(28, 18, 20, 16, "#f4f4ec"); R(28, 18, 20, 1, "#ffffff"); P(37, 17, "#c83a2a"); R(30, 20, 14, 1, "#2a4a7a"); for (let k = 0; k < 3; k++) R(30, 24 + k * 3, 12 - k * 2, 1, "#3a3a3e"); R(30, 31, 9, 1, "#8a8a8a");   // 門禁卡的名單
    R(52, 14, 18, 18, "#5a5e64"); R(53, 15, 16, 16, nt ? "#1a2030" : "#a8c4d4"); R(61, 15, 1, 16, "#5a5e64"); if (nt) P(56, 18, "#f8f0c0");   // 窗
    // 一排螢幕
    R(112, 16, 36, 24, "#2a2a2e"); [[114, 18], [126, 18], [138, 18]].forEach(([x, y], i) => { R(x, y, 9, 8, ["#4a5a52", "#3a4a5a", "#5a5a50"][i]); R(x + 1, y + 1, 7, 6, ["#6a7a70", "#5a6a7a", "#7a7a6a"][i]); });
    R(114, 28, 9, 8, "#4a4a50"); R(115, 29, 7, 6, "#3a3a40"); R(126, 28, 21, 8, "#1a1a1e"); R(128, 30, 10, 1, "#3ae86a"); R(128, 32, 6, 1, "#2a8a4a");
    R(116, 20, 4, 3, "#e8e4d8"); R(130, 21, 3, 3, "#3a3a3e"); R(141, 21, 4, 2, "#c8c8c0");
    // 辦公桌
    R(58, 56, 60, 3, "#a8a49a"); R(58, 56, 60, 1, "#c8c4ba"); R(60, 59, 2, 17, "#6a6a64"); R(114, 59, 2, 17, "#6a6a64"); R(88, 59, 26, 10, "#9a968c"); P(100, 64, "#4a4a44");
    R(62, 38, 18, 13, "#2a2a2e"); R(63, 39, 16, 11, "#c8dce8"); R(64, 41, 8, 1, "#3a4a5a"); R(64, 43, 11, 1, "#8a9aa8"); R(64, 45, 7, 1, "#8a9aa8"); R(72, 47, 6, 2, "#1a3a2a"); P(73, 47, "#3ae86a"); P(75, 47, "#3ae86a"); R(70, 51, 2, 3, "#2a2a2e"); R(66, 54, 10, 2, "#2a2a2e");   // 電腦（右下角：溫度）
    R(82, 52, 15, 4, "#2a4a8a"); R(83, 52, 13, 1, "#f4f4ec"); R(89, 52, 1, 4, "#1a3a7a");   // 巡邏簿
    R(104, 47, 12, 9, "#d8d8d4"); R(104, 47, 12, 1, "#f4f4f0"); R(106, 45, 8, 2, "#f8f8f4"); R(106, 50, 8, 1, "#3a3a3e");   // 印表機
    R(120, 72, 10, 3, "#3a3a3e"); R(122, 60, 7, 12, "#3a4a5a"); R(122, 60, 7, 1, "#5a6a7a");   // 椅子
    if (o.pot){ R(128, 58, 14, 2, "#8a8a84"); R(129, 50, 12, 8, "#b8b8b4"); R(129, 50, 12, 1, "#d8d8d4"); R(127, 52, 2, 2, "#5a5a54"); R(141, 52, 2, 2, "#5a5a54"); R(133, 48, 4, 2, "#3a3a3e"); dither(130, 40, 10, 8, "#ffffff22", 3); R(130, 60, 12, 16, "#7a6a5a"); R(130, 60, 12, 1, "#9a8a7a"); }   // 小桌子和一鍋粥
    // 鑰匙箱
    R(156, 30, 14, 18, "#8a8e94"); R(157, 31, 12, 16, "#a8acb2"); for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) P(159 + j * 4, 34 + k * 4, "#e8c040");
    R(176, 40, 12, 36, "#6a7a8a"); R(176, 40, 12, 1, "#8a9aaa"); R(181, 48, 2, 4, "#c8ccd0");   // 衣櫃
    floorT(76, "#b4b0a6", "#a4a096", 24);
  };

  /* ---------- 金鴻冷凍行・辦公室：門 x3–20；白板（排班表）x28–62（y14–36）；月曆 x66–80（y14–30）；
     辦公桌 x64–146（桌面 y57–60）：清單 x68–84（y53–57）、過磅單 x86–102（y52–57）、桌燈 x104–114（y44–57）、傳真機 x126–142（y46–57）；
     架子 x148–174（y14–62）：上面的綠色帳本 x150–172（y20–36）、檔案夾 x150–172（y42–56）；椅子 x112 ---------- */
  SC.c46_office = (o) => { o = Object.assign({}, o, stOf(o)); const nt = !!o.night;
    R(0, 0, W, 76, "#e2dcc8"); R(0, 0, W, 4, "#c4bea8"); R(0, 64, W, 12, "#d2cab4"); R(0, 64, W, 1, "#bab29c"); tube(90, true);
    door(3, "#7a6a54", "#a88a64", 1, "#c8d4d8");
    R(28, 14, 34, 22, "#f8f8f4"); R(28, 14, 34, 1, "#a8a8a8"); R(28, 35, 34, 1, "#a8a8a8"); R(28, 14, 1, 22, "#a8a8a8"); R(61, 14, 1, 22, "#a8a8a8");
    for (let k = 0; k < 4; k++){ R(30, 20 + k * 4, 30, 1, "#c8c8c8"); R(31, 18 + k * 4, 8, 1, "#2a2a2e"); R(42, 18 + k * 4, 14 - k * 2, 1, k === 3 ? "#1a3a8a" : "#2a2a2e"); } R(31, 16, 14, 1, "#b8b8b8"); R(29, 36, 10, 2, "#3a3a3e");   // 排班表
    R(66, 14, 14, 16, "#f4f0e4"); R(66, 14, 14, 3, "#c83a2a"); for (let k = 0; k < 4; k++) for (let j = 0; j < 5; j++) P(68 + j * 2.4, 19 + k * 2.6, "#8a8a8a");   // 月曆
    R(86, 18, 24, 18, "#5a5e64"); R(87, 19, 22, 16, nt ? "#1a2030" : "#a8c4d4"); R(98, 19, 1, 16, "#5a5e64");   // 窗
    // 架子
    R(148, 14, 26, 48, "#8a6a4a"); R(149, 15, 24, 46, "#6a4e34"); R(149, 38, 24, 2, "#8a6a4a"); R(149, 58, 24, 2, "#8a6a4a");
    R(151, 22, 20, 14, "#3a7a4a"); R(151, 22, 20, 1, "#5a9a6a"); R(153, 26, 10, 1, "#d8d0a0");   // 綠色的帳本
    [["#2a4a8a", 151], ["#c83a2a", 155], ["#2a4a8a", 159], ["#e8c040", 163], ["#2a4a8a", 167]].forEach(([c, x]) => { R(x, 42, 4, 16, c); R(x + 1, 46, 2, 2, "#f4f4ec"); });   // 檔案夾
    // 辦公桌
    R(64, 57, 82, 3, "#9a7a54"); R(64, 57, 82, 1, "#b8986e"); R(66, 60, 2, 16, "#6a5238"); R(142, 60, 2, 16, "#6a5238"); R(118, 60, 22, 12, "#8a6a48"); P(128, 66, "#4a3a28");
    R(68, 53, 16, 4, "#f4f4ec"); R(68, 53, 16, 1, "#ffffff"); R(70, 55, 9, 1, "#8a8a8a"); R(80, 54, 3, 2, "#c83a2a");   // 清單
    R(86, 52, 16, 5, "#f8f4e0"); R(86, 52, 16, 1, "#ffffff"); R(87, 53, 15, 1, "#e8e4d0"); R(88, 54, 10, 1, "#2a2a8a"); R(88, 56, 7, 1, "#2a2a8a");   // 過磅單
    R(108, 54, 6, 3, "#3a3a3e"); R(110, 46, 2, 8, "#3a3a3e"); R(104, 44, 10, 3, "#3a5a3a"); if (!o.dark) dither(102, 47, 14, 10, "#fff4c022", 2);   // 桌燈
    R(126, 47, 16, 10, "#d8d8d4"); R(126, 47, 16, 1, "#f4f4f0"); R(128, 49, 6, 2, "#2a2a2e"); R(136, 49, 4, 4, "#a8a8a4"); R(128, 44, 10, 3, "#f8f8f4"); R(128, 44, 10, 1, "#e8e4d0");   // 傳真機
    R(116, 50, 6, 7, "#d8d4c8"); R(117, 49, 4, 1, "#a8a8a0");   // 菸灰缸（空的）旁邊的筆筒
    R(108, 72, 12, 3, "#3a3a3e"); R(110, 60, 8, 12, "#2a2a2e"); R(110, 60, 8, 1, "#4a4a4e");   // 椅子
    R(178, 30, 12, 46, "#a8a49a"); R(178, 30, 12, 1, "#c8c4ba"); R(183, 44, 2, 4, "#5a5a54");   // 保險箱櫃
    floorT(76, "#b8ae98", "#a89e88", 24);
  };

  /* ---------- 過磅台：左邊是大柱子 x6–29（從地板到天花板）；手推車 x32–53（y56–76）；秤台 x58–99（地上 y74–77）；
     秤的顯示器和印表機 x100–113（y32–60，柱子到地上）；過磅桌 x118–146（桌面 y56）；置物櫃 x150–173（y28–76）；鐵捲門 x176–192；
     天花板的鏡頭 x74–80（y2–7）。o.night；o.hl＝海龍的六箱（x60–99 y58–73）；o.cart＝false 手推車不在；o.cam＝監視器的畫面 ---------- */
  SC.c46_dock = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 76, "#c4c8c8"); R(0, 0, W, 6, "#9aa0a2"); for (let x = 36; x < W; x += 30) R(x, 6, 1, 70, "#b4b8b8"); R(0, 60, W, 16, "#b0b6b6"); R(0, 60, W, 1, "#9aa0a2");
    tube(60, true); tube(130, true);
    R(74, 2, 7, 4, "#2a2a2e"); R(76, 6, 3, 2, "#3a3a40"); P(79, 4, "#e83a3a"); R(77, 0, 1, 2, "#3a3a40");   // 天花板的鏡頭
    // 鐵捲門（關著）
    R(176, 16, 16, 60, "#7a7e84"); for (let y = 18; y < 76; y += 3) R(176, y, 16, 1, "#6a6e74"); R(176, 16, 16, 2, "#5a5e64");
    // 置物櫃
    R(150, 28, 24, 48, "#7a8a98"); for (let k = 0; k < 4; k++){ R(151 + k * 6, 29, 5, 46, "#9aaab8"); R(151 + k * 6, 29, 5, 1, "#b8c8d4"); R(154 + k * 6, 48, 1, 3, "#3a3a3e"); R(152 + k * 6, 32, 3, 1, "#5a6a78"); } R(169, 36, 4, 3, "#f4f4ec");
    // 過磅桌
    R(118, 56, 28, 3, "#8a8a84"); R(118, 56, 28, 1, "#a8a8a2"); R(120, 59, 2, 17, "#5a5a54"); R(142, 59, 2, 17, "#5a5a54"); R(124, 53, 10, 3, "#f8f4e0"); R(136, 54, 3, 2, "#2a2a2e");
    // 秤的顯示器和印表機
    R(105, 40, 4, 36, "#6a6e74"); R(100, 32, 14, 14, "#2a2a2e"); R(101, 34, 12, 8, "#1a0a0a"); R(102, 36, 2, 4, "#e83a3a"); R(105, 36, 2, 4, "#e83a3a"); R(109, 36, 2, 4, "#e83a3a"); P(108, 39, "#e83a3a");
    R(100, 52, 14, 8, "#d8d8d4"); R(100, 52, 14, 1, "#f4f4f0"); R(103, 50, 8, 2, "#f8f8f4"); R(102, 55, 10, 1, "#3a3a3e"); P(112, 53, "#3ae86a");
    // 秤台（地上）
    R(58, 74, 42, 3, "#5a5e64"); R(58, 74, 42, 1, "#8a9098"); for (let x = 62; x < 98; x += 6) P(x, 75, "#3a3e44");
    if (o.hl){ R(60, 72, 40, 2, "#8a6a42"); for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) hlBox(61 + c * 13, 63 - r * 8); }
    // 大柱子（畫在最前面的牆上：從地板到天花板）
    R(6, 0, 24, 77, "#a8acac"); R(6, 0, 2, 77, "#c4c8c8"); R(28, 0, 2, 77, "#8a8e8e"); R(10, 40, 5, 3, "#d8dcdc"); R(20, 58, 6, 4, "#d8dcdc"); R(8, 66, 20, 2, "#e8c020"); R(8, 68, 20, 2, "#2a2a2e"); R(8, 70, 20, 2, "#e8c020");
    // 手推車
    if (o.cart !== false){ R(34, 58, 2, 18, "#5a5e64"); R(52, 58, 2, 18, "#5a5e64"); R(34, 62, 20, 2, "#8a9098"); R(34, 70, 20, 2, "#8a9098"); R(36, 72, 16, 3, "#a88a5a"); R(36, 72, 16, 1, "#c8aa7a"); R(34, 56, 6, 2, "#3a3e44"); R(35, 75, 3, 3, "#2a2a2e"); R(49, 75, 3, 3, "#2a2a2e"); }
    // 地面：濕的水泥
    R(0, 77, W, 31, "#8a9294"); R(0, 77, W, 1, "#6a7274"); for (let x = 10; x < W; x += 34) R(x, 88 + (x % 3), 14, 1, "#a0aaac"); R(62, 82, 30, 1, "#a8b4b8");
    if (o.night) dither(0, 0, W, 76, "#0a102012", 3);
  };
  SC.c46_dock.front = (o) => camFx(Object.assign({}, o, stOf(o)));

  /* ---------- 冷凍倉：側門 x3–20（讀卡機在 x22–25 y44–50）；溫度計 x28–39（y22–33）；
     永慶的魚（一排一排的鐵架）x46–112；海龍漁業的倉位 x118–158（六個藍箱子，y48–76，牌子 x126–150 y38–45）；
     角落的紙板 x160–188（y70–76）。冷氣的白霧 ---------- */
  SC.c46_cold = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 76, "#b8ccd8"); R(0, 0, W, 5, "#98b0c0"); for (let x = 0; x < W; x += 16) R(x, 5, 1, 71, "#a8c0d0"); R(0, 64, W, 12, "#a8bccc");
    tube(70, true); tube(150, true);
    R(170, 6, 18, 8, "#d8e4ec"); R(172, 8, 14, 4, "#5a6a7a"); for (let k = 0; k < 4; k++) R(173 + k * 3, 9, 2, 2, "#2a3a4a"); dither(166, 14, 26, 14, "#ffffff22", 2);   // 冷氣
    // 側門（很厚）
    R(3, 24, 18, 52, "#6a7a88"); R(5, 26, 14, 50, "#d8e0e6"); R(5, 26, 14, 1, "#f4f8fa"); R(5, 26, 1, 50, "#2a2a2e"); R(18, 26, 1, 50, "#2a2a2e"); R(14, 44, 4, 2, "#5a5e64"); R(14, 44, 1, 8, "#5a5e64");
    R(22, 44, 4, 6, "#2a2a2e"); P(23, 46, "#3ae86a");   // 讀卡機
    R(28, 22, 12, 12, "#2a2a2e"); R(29, 23, 10, 6, "#0a1a0a"); R(30, 25, 2, 3, "#3ae86a"); R(33, 25, 2, 3, "#3ae86a"); R(36, 25, 2, 3, "#3ae86a"); R(29, 30, 10, 2, "#f4f4ec"); R(33, 34, 1, 30, "#7a8a98");   // 溫度計和連到外面的線
    // 鐵架和冷凍魚
    for (let c = 0; c < 2; c++){ const x = 46 + c * 34; R(x, 20, 2, 56, "#6a7a88"); R(x + 30, 20, 2, 56, "#6a7a88");
      for (let r = 0; r < 4; r++){ const y = 26 + r * 13; R(x, y + 5, 32, 2, "#8a9aa8"); for (let k = 0; k < 2; k++) fish(x + 3 + k * 2, y + k * 2 - 1, 22); } }
    // 海龍的倉位
    R(126, 38, 24, 7, "#f4f4ec"); R(126, 38, 24, 1, "#c83a2a"); R(128, 41, 20, 1, "#c83a2a"); R(128, 43, 14, 1, "#3a3a3e"); R(137, 32, 1, 6, "#5a5e64");
    R(118, 72, 40, 4, "#8a6a42"); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (!(r === 2 && c !== 1)) hlBox(119 + c * 13, 64 - r * 8);
    // 角落的紙板
    R(160, 72, 28, 4, "#b89a6a"); R(160, 72, 28, 1, "#d8c8a8"); dither(160, 72, 28, 4, "#ffffff55", 2); R(164, 73, 9, 2, "#9a7a4a"); R(176, 73, 10, 2, "#9a7a4a"); P(163, 73, "#9a7a4a"); P(186, 73, "#9a7a4a");
    R(0, 76, W, 32, "#a8b8c4"); R(0, 76, W, 1, "#88a0b0"); dither(0, 76, W, 32, "#ffffff22", 3); for (let x = 12; x < W; x += 40) R(x, 90, 18, 1, "#c8d8e4");
    dither(0, 50, W, 26, "#ffffff10", 4);
  };

  /* ---------- 旬（日本料理）：門 x3–20；黑板 x26–51（y14–37）；吧台 x56–146（玻璃櫃 y46–56、檯面 y56–60）；燈籠 x70、x120；
     廚房的門簾 x146–162（y22–76）；板夾 x150–159（y28–44，掛在門簾的左邊牆上）……改成 x150 在門簾旁；冰箱 x166–188（y18–76） ---------- */
  SC.c46_shun = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 76, "#d8c8a8"); R(0, 0, W, 4, "#6a4a2a"); for (let x = 0; x < W; x += 12) R(x, 4, 1, 60, "#ccbc9a"); R(0, 64, W, 12, "#7a5a3a"); R(0, 64, W, 1, "#5a3a22");
    door(3, "#5a3a22", "#8a6a44", 1, "#d8c8a0");
    R(26, 14, 26, 24, "#5a3a22"); R(27, 15, 24, 22, "#2a3a2e"); for (let k = 0; k < 5; k++) R(29, 18 + k * 4, 14 + (k % 2) * 4, 1, "#e8e8e0"); R(44, 30, 6, 3, "#c83a2a"); R(48, 31, 2, 1, "#c83a2a");   // 黑板
    [70, 120].forEach(x => { R(x - 1, 4, 1, 6, "#3a2a1a"); R(x - 4, 10, 8, 10, "#e84a2a"); R(x - 4, 10, 8, 1, "#c83a1a"); R(x - 4, 19, 8, 1, "#c83a1a"); R(x - 1, 13, 2, 4, "#2a2a2e"); dither(x - 6, 20, 12, 6, "#ffd08a22", 2); });   // 燈籠
    // 吧台
    R(56, 46, 90, 10, "#e8f0f0"); R(56, 46, 90, 1, "#ffffff"); R(58, 48, 86, 6, "#cfe2e6"); [62, 80, 98, 116].forEach((x, i) => { R(x, 51, 12, 3, i % 2 ? "#e86a5a" : "#c83a3a"); R(x, 51, 12, 1, "#f4a090"); });
    R(52, 56, 98, 4, "#c8a878"); R(52, 56, 98, 1, "#e8c898"); R(56, 60, 90, 16, "#8a6a44"); for (let x = 60; x < 146; x += 18) R(x, 60, 1, 16, "#7a5a38");
    // 門簾、板夾、冰箱
    R(146, 22, 16, 54, "#3a3e5a"); R(146, 22, 16, 3, "#2a2e44"); R(153, 25, 1, 34, "#2a2e44"); R(147, 30, 6, 6, "#f4f4ec"); R(154, 30, 6, 6, "#f4f4ec");
    P(139, 27, "#3a3a3e"); R(134, 28, 10, 15, "#8a6a42"); R(135, 30, 8, 12, "#f8f8f4"); R(136, 28, 6, 2, "#a8acb0"); for (let k = 0; k < 4; k++) R(136, 32 + k * 2.5, 6 - (k % 2) * 2, 1, "#8a8a8a");
    R(166, 18, 22, 58, "#c8ccd0"); R(166, 18, 22, 1, "#e8ecee"); R(166, 46, 22, 1, "#9aa0a4"); R(184, 26, 2, 12, "#8a9094"); R(184, 50, 2, 14, "#8a9094"); R(169, 22, 8, 6, "#f4f4ec");
    floorT(76, "#9a7a54", "#8a6a44", 20);
  };

  /* ---------- 丸福壽司：門 x3–20；收銀台 x28–70（檯面 y56，進貨本 x40–53 y51–55，招財貓 x60–66）；牆上的照片 x100–113（y16–27）；
     迴轉的吧台 x76–150；廚房的門 x168–186 ---------- */
  SC.c46_maru = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 76, "#efe4cc"); R(0, 0, W, 4, "#c83a2a"); R(0, 62, W, 14, "#d8c8a4"); R(0, 62, W, 1, "#c0ae88"); tube(60, true); tube(140, true);
    door(3, "#8a5a3a", "#b88a5a", 1, "#e8dcc0");
    R(28, 56, 42, 3, "#c8a878"); R(28, 56, 42, 1, "#e8c898"); R(30, 59, 38, 17, "#a87a4a"); R(30, 59, 38, 1, "#8a5a3a");
    R(40, 51, 13, 5, "#f4e8c0"); R(40, 51, 13, 1, "#ffffff"); R(45, 52, 3, 3, "#e8c040"); R(41, 54, 3, 1, "#8a8a8a");   // 進貨本（招財貓的封面）
    R(56, 48, 10, 8, "#3a3a3e"); R(57, 49, 8, 4, "#a8c8a8"); R(60, 44, 6, 4, "#f4f4ec"); P(61, 45, "#2a2a2e"); P(64, 45, "#2a2a2e"); R(66, 42, 2, 3, "#f4f4ec");   // 收銀機、招財貓
    R(100, 16, 14, 12, "#5a3a22"); R(101, 17, 12, 10, "#a8c4d8"); R(104, 19, 5, 7, "#f4f4ec"); R(102, 22, 10, 3, "#3a4a6a"); R(103, 15, 8, 1, "#d8c070");   // 照片、稻穗
    R(76, 50, 74, 4, "#a8acb0"); R(76, 50, 74, 1, "#d8dce0"); for (let x = 78; x < 148; x += 9){ R(x, 47, 6, 3, x % 2 ? "#e8e4dc" : "#c8d8e8"); R(x + 1, 46, 4, 1, "#e86a5a"); } R(76, 54, 74, 22, "#c8a878"); R(76, 54, 74, 1, "#e8c898");
    [84, 104, 124].forEach(x => { R(x, 66, 10, 2, "#8a5a3a"); R(x + 1, 68, 2, 8, "#5a3a22"); R(x + 7, 68, 2, 8, "#5a3a22"); });   // 椅子
    R(168, 26, 18, 50, "#6a4a2a"); R(170, 28, 14, 30, "#2a3a5a"); R(176, 28, 1, 30, "#1a2a4a"); R(170, 58, 14, 18, "#8a6a44");   // 廚房門＋門簾
    R(160, 14, 6, 10, "#c83a2a"); R(161, 15, 4, 8, "#f4f4ec");
    floorT(76, "#c8b490", "#b8a480", 20);
  };

  /* ---------- 後巷（戶外）：上面一條天空。左邊是旬的後牆 x0–92（後門 x22–40，保冷箱 x42–60 y60–76，冷氣機 x64–84）；
     右邊是丸福的後牆 x96–192（後門 x112–130，門上面的鏡頭 x136–148 y18–28，垃圾桶 x148–172 y56–76）；水管、貓。
     o.dawn＝清晨的灰藍；o.scoot＝機車的 x；o.box＝機車後面有箱子；o.maru＝丸福的門開著；o.cam＝監視器 ---------- */
  SC.c46_alley = (o) => { o = Object.assign({}, o, stOf(o)); const dn = !!o.dawn;
    PR.sky(dn ? "#2a3448" : "#a8c8e0", dn ? "#5a6478" : "#e8eef0", 76);
    R(0, 12, 94, 64, dn ? "#6a645a" : "#b8a88c"); R(0, 12, 94, 2, dn ? "#4a4438" : "#8a7a60"); for (let y = 18; y < 76; y += 8) R(0, y, 94, 1, dn ? "#5e584e" : "#ac9c80");
    R(96, 8, 96, 68, dn ? "#646a70" : "#c8c0b0"); R(96, 8, 96, 2, dn ? "#44484e" : "#9a9284"); for (let x = 100; x < W; x += 20) R(x, 10, 1, 66, dn ? "#5a6066" : "#bab2a2");
    R(94, 12, 2, 64, dn ? "#3a3a3e" : "#7a7470");
    R(22, 26, 18, 50, "#5a4a3a"); R(24, 28, 14, 48, dn ? "#5a6a6a" : "#8a9a9a"); R(35, 50, 2, 3, "#c8ccd0"); R(26, 31, 10, 6, "#f4f4ec"); R(27, 33, 8, 1, "#3a3a3e");   // 旬的後門
    R(42, 64, 18, 12, "#2a6aa8"); R(42, 62, 18, 3, "#3a7ac0"); R(42, 62, 18, 1, "#5a9ad8"); R(45, 67, 12, 2, "#f4f4ec");   // 保冷箱
    R(64, 34, 20, 14, "#d8d8d4"); R(66, 36, 16, 10, "#a8a8a4"); for (let k = 0; k < 4; k++) R(67, 37 + k * 2.5, 14, 1, "#8a8a86"); R(70, 48, 2, 28, "#7a7a76");   // 冷氣機
    R(4, 14, 3, 62, "#7a7a76"); R(4, 14, 10, 3, "#7a7a76");   // 水管
    if (o.maru){ R(112, 26, 18, 50, "#4a4a4e"); R(114, 28, 14, 48, "#1a1a1e"); R(114, 28, 2, 48, "#8a8a84"); }
    else { R(112, 26, 18, 50, "#4a4a4e"); R(114, 28, 14, 48, dn ? "#6a6a5a" : "#a8a090"); R(125, 50, 2, 3, "#c8ccd0"); R(116, 31, 10, 6, "#f4f4ec"); R(117, 33, 8, 1, "#c83a2a"); }   // 丸福的後門
    R(138, 20, 9, 5, "#2a2a2e"); R(136, 21, 3, 3, "#3a3a40"); P(145, 22, "#e83a3a"); R(141, 25, 2, 3, "#3a3a40");   // 鏡頭
    R(148, 58, 24, 18, "#2a6a3a"); R(148, 56, 24, 3, "#3a7a4a"); R(148, 56, 24, 1, "#5a9a6a"); R(150, 60, 20, 1, "#1a5a2a"); R(152, 54, 10, 2, "#c8ccd0"); R(158, 52, 6, 3, "#e8d8c0"); P(163, 51, "#e8c040");   // 垃圾桶（蓋子推開了一半、魚尾露出來）
    if (!o.cam){ R(176, 70, 8, 5, "#e8963a"); R(182, 67, 4, 4, "#e8963a"); P(183, 68, "#2a2a2e"); R(174, 71, 3, 1, "#e8963a"); }   // 橘色的貓
    R(0, 76, W, 32, dn ? "#4a4c50" : "#8a8884"); R(0, 76, W, 1, dn ? "#3a3c40" : "#6a6864"); R(0, 92, W, 2, dn ? "#3e4044" : "#7a7874"); R(30, 100, 26, 2, dn ? "#5a6a7a" : "#a8b8c4");
    if (o.scoot !== undefined) scooter(o.scoot, 98, o.box !== false);
  };
  SC.c46_alley.front = (o) => camFx(Object.assign({}, o, stOf(o)));

  SC.c46_cafe = (o) => { o = o || {}; SC.cafe(Object.assign({}, o, { time:o.time || "noon", ep:46 })); };

  /* ---------- 人物造型 ---------- */
  const AL = id => (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null;
  const strip = L => { const o = Object.assign({}, L || {}); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  const SHEN = Object.assign({ skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#5a6a7a", bottom:"#2a2f3a" }, AL("shen") || {}, { top:"#5a6a7a", coat:undefined, tie:undefined, apron:"#2a4a5a", gloves:"#e8a040", bottom:"#2a2f3a" });
  const DOG = { kind:"dog", coat:"#f0dcb0", collar:"#3a6ac8" };
  const BAO = { age:"old", skin:"#d8a880", hair:"#8a8a84", hairStyle:"short", top:"#8a9aaa", bottom:"#2a3a5a", hat:"cap", capColor:"#2a3a5a" };
  const LOOK = {
    jian:  { age:"old", skin:"#d8a880", hair:"#3a3430", hairStyle:"short", top:"#f4f4f0", coat:"#3a4a5a", bottom:"#3a3a40", hello:"來了。" },
    quan:  { age:"old", skin:"#c89a70", hair:"#d8d8d0", hairStyle:"short", top:"#e8e4d8", apron:"#3a5a4a", bottom:"#3a3a40", hat:"cap", capColor:"#3a5a4a", hello:"少年仔，來啦。" },
    bao:   Object.assign({}, BAO, { hello:"新來的，吃了沒？" }),
    nan:   { skin:"#c89a70", hair:"#1a1410", hairStyle:"short", top:"#e87a2a", bottom:"#2a2a30", gloves:"#e8e4d8", hello:"新來的。" },
    zeng:  { skin:"#e0b890", hair:"#2a2a2a", hairStyle:"short", glasses:true, top:"#f4f4f0", coat:"#6a7a5a", bottom:"#3a3a44", hello:"……沈警官？" },
    jiang: { skin:"#e8c09a", hair:"#1a1410", hairStyle:"short", top:"#f4f4f0", apron:"#2a2e4a", bottom:"#2a2a30", hello:"還沒開喔。" },
    cai:   { age:"old", gender:"f", skin:"#e8c8a8", hair:"#3a2a22", hairStyle:"bob", top:"#f4e8d8", apron:"#c83a3a", bottom:"#3a3a44", hello:"五點才開喔。" },
    xcai:  { skin:"#ecc8a6", hair:"#2a2220", hairStyle:"spiky", top:"#f4f4f0", apron:"#2a2a2e", bottom:"#2a2a30", hello:"你好。……你也是來看貓的？" },
    abin:  Object.assign({ skin:"#ecc8a6", hair:"#2a2220", hairStyle:"short", top:"#f4f4f0", apron:"#6a4a2a", bottom:"#3a3a44" }, AL("abin") || {}, { hello:"沈哥？" })
  };
  const DAILY = {
    jian:  [ { room:"office", x:72, pose:"stand", facing:1, doing:"站在辦公桌的前面，一隻手壓著那一張傳真。" }, { room:"office", x:72, pose:"stand", facing:1, doing:"站在辦公桌的前面。今天晚上，他沒有回家。" } ],
    quan:  [ { room:"dock", x:124, pose:"inspect", facing:-1, doing:"蹲在秤的旁邊，在擦顯示器上的鹽。白天，他來校秤。" }, { room:"dock", x:126, pose:"write", facing:-1, doing:"坐在過磅桌的後面，戴著老花眼鏡，在對單子。" } ],
    bao:   [ null, { room:"guard", x:134, pose:"stand", facing:-1, doing:"站在小桌子旁邊，在攪那一鍋鹹粥。" } ],
    nan:   [ null, { room:"cold", x:102, pose:"stand", facing:1, doing:"站在鐵架的前面，在數棧板。呼出來的氣是白的。" } ],
    zeng:  [ { room:"guard", x:88, pose:"type", facing:-1, doing:"坐在管理室的電腦前面，在打下個月的攤位表。" }, null ],
    jiang: [ { room:"shun", x:98, pose:"inspect", facing:-1, doing:"站在吧台的後面，在磨刀。" }, null ],
    cai:   [ { room:"maru", x:80, pose:"stand", facing:-1, doing:"站在收銀台的旁邊，在擦桌子。" }, null ],
    xcai:  [ { room:"alley", x:134, pose:"carry@bag", facing:1, doing:"提著一袋垃圾，站在後門口。" }, null ],
    abin:  [ { room:"seat", x:120, pose:"hold@tray", facing:-1, doing:"拿著托盤，站在外面的座位旁邊。" }, null ]
  };
  EP46.suspects.forEach(s => {
    if (LOOK[s.id]){ if (LOOK[s.id].hello) s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP46.rooms = {
    market: [
      { id:"lot", name:"南澳魚市・停車場", scene:"c46_lot", opt:(ph) => ({ night:ph > 0, truck:ph === 0, scooter:ph > 0 }), details:[
        { id:"d46_sign", name:"魚市的招牌", hot:[88,14,62,9], text:"「南澳魚市」。藍色的字，白色的底。\n招牌的下面，有人用噴漆寫過什麼，被刷掉了。刷掉的地方，顏色比旁邊白。" },
        { id:"d46_lamp", name:"路燈", hot:[136,16,12,10], text:"一盞路燈。燈罩裡，躺著幾隻死掉的飛蛾。\n夜裡，整個停車場，只有這一盞亮。" },
        { id:"d46_lotcam", name:"杆子上的鏡頭", hot:[168,2,14,8], text:"停車場的鏡頭，對著大門的方向。\n拍得到誰的車進來、出去。拍不到建築的後面。" },
        { id:"d46_gatebar", name:"大門的欄杆", hot:[2,48,40,12], text:"紅白相間的欄杆。晚上十點以後是升起來的：卸貨的車，要進來。\n欄杆的旁邊，一個沒有人的小崗亭。" },
        { id:"d46_shutter", name:"鐵捲門", hot:[150,28,38,48], text:"卸貨用的大鐵捲門。拉起來的時候，冷凍車可以直接倒進去。\n現在是關著的。門縫下面，有一條白色的霜。" } ] },
      { id:"guard", name:"管理室・警衛室", scene:"c46_guard", opt:(ph) => ({ night:ph > 0, pot:ph > 0 }), details:[
        { id:"d46_keys", name:"鑰匙箱", hot:[156,30,14,18], text:"一個鐵的鑰匙箱。九個掛鉤，八支鑰匙。\n每一支，都綁著一塊塑膠牌：「鐵捲門」「電箱」「頂樓」……\n冷凍倉的側門，沒有鑰匙。只能刷卡。" },
        { id:"d46_window", name:"窗", hot:[52,14,18,18], text:"窗外，是停車場。\n從這裡，看得到大門、路燈，和停在下面的每一台車。" },
                { id:"d46_pc", name:"管理室的電腦", hot:[62,38,18,16], text:"螢幕上是魚市的攤位表。\n右下角，有一個綠色的小框，一直亮著：「冷凍倉　-25.1℃」。\n數字，每一分鐘跳一次。" } ] },
      { id:"office", name:"金鴻冷凍行・辦公室", scene:"c46_office", opt:(ph) => ({ night:ph > 0 }), details:[
        { id:"d46_cal", name:"月曆", hot:[66,14,14,16], text:"漁會送的月曆。每一個禮拜三，都用紅筆圈起來：卸貨。\n4 月 21 日的那一個圈的旁邊，有人寫了一個小字：「永慶」。" },
        { id:"d46_ash", name:"空的菸灰缸", hot:[116,49,7,8], text:"一個玻璃的菸灰缸。乾乾淨淨。\n旁邊一盒口香糖，只剩兩片。" },
        { id:"d46_safe", name:"櫃子", hot:[178,30,12,46], text:"一個鐵櫃，上面有一個轉盤鎖。\n簡老闆說，裡面是租約和保險。「沒有魚。」他說。" },
        { id:"d46_owin", name:"窗", hot:[86,18,24,18], text:"窗外，是魚市的屋頂。再過去，是漁港。\n三號碼頭的燈，一整夜都亮著。" } ] },
      { id:"dock", name:"過磅台", scene:"c46_dock", opt:(ph) => ({ night:ph > 0, hl:ph > 0 }), details:[
        { id:"d46_cam", name:"天花板的鏡頭", hot:[72,0,10,8], text:"天花板上的鏡頭。紅燈亮著。\n它對著秤。從秤的位置，往左邊看，是柱子的正面。" },
        { id:"d46_desk", name:"過磅桌", hot:[118,52,28,8], text:"一張鐵桌子。桌面上，被原子筆戳出好幾個小洞。\n秤手坐在這裡，看著秤上的數字，一行一行地寫。" },
        { id:"d46_shutter2", name:"鐵捲門", hot:[176,16,16,60], text:"卸貨的鐵捲門。冷凍車從外面倒進來，堆高機一板一板叉下來。\n卸完，就拉下來。" },
        { id:"d46_floor", name:"秤台", hot:[58,72,42,6], text:"地上一公尺見方的鐵板。踩上去，顯示器的數字就跳。\n你踩了一下。72.4。你自己的重量，加一雙雨鞋。" } ] },
      { id:"cold", name:"冷凍倉", phase:1, scene:"c46_cold", opt:{}, details:[
        { id:"d46_frost", name:"地上的霜", hot:[60,90,60,8], text:"地上一層薄薄的霜。雨鞋踩過去，留下一個一個的腳印。\n今天晚上的腳印，是你的，和阿南的。" },
        { id:"d46_fan", name:"冷氣", hot:[166,6,24,10], text:"冷氣的出風口，吹出來的是白霧。\n站在這裡，三分鐘，你的眉毛就硬了。" },
        { id:"d46_wire", name:"牆上的灰色電線", hot:[32,34,4,30], text:"溫度計的下面，接出一條灰色的線。\n沿著牆，從門框的上面，穿到外面去。" } ] }
    ],
    lane: [
      { id:"shun", name:"旬", scene:"c46_shun", opt:{}, details:[
        { id:"d46_lantern", name:"燈籠", hot:[64,8,12,14], text:"紅色的燈籠。上面寫著「旬」。\n燈泡是暖色的。中午的時候，也開著。" },
        { id:"d46_case", name:"玻璃櫃", hot:[56,46,90,10], text:"吧台上的玻璃櫃。紅色的魚肉，一塊一塊排好。\n最左邊的那一塊，顏色最深。邊上，是一層白色的油花。" },
        { id:"d46_noren", name:"門簾", hot:[146,22,16,40], text:"深藍色的門簾。後面是廚房。\n門簾的下面，看得到一雙白色的雨鞋，走來走去。" } ] },
      { id:"maru", name:"丸福壽司", scene:"c46_maru", opt:{}, details:[
        { id:"d46_cat", name:"招財貓", hot:[60,42,8,7], text:"一隻招財貓。舉起來的那一隻手，壞了，不會動了。\n下面墊著一張發票，好幾年前的。" },
        { id:"d46_belt", name:"吧台", hot:[76,46,74,8], text:"以前是迴轉的。輸送帶，三年前就不轉了。\n盤子還是一個一個排在上面。客人自己拿。" },
        { id:"d46_kdoor", name:"廚房的門", hot:[168,26,18,50], text:"廚房的門。門簾是深藍色的。\n門的後面，就是後巷。" } ] },
      { id:"alley", name:"後巷", scene:"c46_alley", opt:{}, details:[
        { id:"d46_shunback", name:"旬的後門", hot:[22,26,18,50], text:"旬的後門。門上貼著一張紙：「送貨請放保冷箱」。\n紙的下面，有人用原子筆補了一行：「謝謝」。" },
        { id:"d46_ac", name:"冷氣機", hot:[64,34,20,14], text:"冷氣的室外機。嗡嗡地響。\n下面滴了一小攤水。橘色的貓，喝過。" },
        { id:"d46_pipe", name:"水管", hot:[2,14,12,62], text:"一根生鏽的水管，從屋頂一路接到地上。\n下面的接口，用黑色的膠帶纏了好幾圈。" },
        { id:"d46_orange", name:"橘色的貓", hot:[172,64,16,12], text:"一隻橘色的貓，胖胖的。\n牠看著你，又看著垃圾桶。然後坐下來，開始舔爪子。\n牠知道，人走了以後，垃圾桶是牠的。" } ] }
    ],
    cafe: [
      { id:"seat", name:"海風咖啡・外面的座位", scene:"c46_cafe", opt:{ time:"noon" }, details:[
        { id:"d46_station", name:"對面的警察局", hot:[122,22,56,30], text:"馬路的對面，是警察局。\n你的辦公桌，在三樓。現在是誰在坐，你不知道。" },
        { id:"d46_menu", name:"小黑板", hot:[66,52,14,14], text:"「今日：黑咖啡　烏龍　滷蛋　三明治」\n三明治的旁邊，有人用粉筆畫了一隻狗。" } ] }
    ]
  };
  EP46.phases[0].scene = "c46_office"; EP46.phases[0].sceneOpt = {};
  EP46.phases[1].scene = "c46_dock"; EP46.phases[1].sceneOpt = { night:true, hl:true };

  /* ---------- 監視器動畫 ---------- */
  const F = 98;
  EP46.looks = { shenV:strip(SHEN), dogV:Object.assign({}, DOG), quanV:strip(LOOK.quan), baoV:strip(LOOK.bao), nanV:strip(LOOK.nan), xcaiV:strip(LOOK.xcai), jiangV:strip(LOOK.jiang),
    baoH:Object.assign(strip(LOOK.bao), { hat:"cap", capColor:"#e8e8e4", top:"#2a2e3a" }), jianV:strip(LOOK.jian) };
  const mk = (scene, opt, cam, date, beats, clean) => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join);
    return { scene, opt:Object.assign({}, opt, { ds, seq:beats.map(b => b.st || {}) }), cam, date, clean, beats:beats.map(b => { const o = Object.assign({}, b); delete o.st; return o; }) }; };
  const ANIM = {
    cctv46_dock: mk("c46_dock", { cam:true, night:true }, "過磅台", "2027-04-21", [
      { t:"22:10", d:5, cap:"22:10，你站到秤的旁邊。豆花在你的腳邊趴下。全叔坐在過磅桌。", st:{ cam:true, night:true }, m:{ shenV:[92, F, "stand", 1, 92, F], dogV:[80, F, "lie", 1, 80, F], quanV:[128, F, "sit", -1, 128, F] } },
      { t:"02:55", d:5, cap:"02:55，堆高機把最後一板放到柱子的後面。全叔走過去：畫面上消失了一分鐘。", st:{ cam:true, night:true }, m:{ shenV:[92, F, "stand", 1, 92, F], dogV:[80, F, "lie", 1, 80, F], quanV:[-14, F, "stand", -1, 128, F] } },
      { t:"03:00", d:4.5, out:["quanV"], cap:"03:00，全叔拿起外套，從右邊走出去。", st:{ cam:true, night:true }, m:{ shenV:[92, F, "stand", 1, 92, F], dogV:[80, F, "lie", 1, 80, F], quanV:[200, F, "stand", 1, 40, F] } },
      { t:"03:02", d:4.5, cap:"03:02，老包從右邊走進來，坐到過磅桌。", st:{ cam:true, night:true }, m:{ shenV:[92, F, "stand", 1, 92, F], dogV:[80, F, "lie", 1, 80, F], baoV:[128, F, "sit", -1, 200, F] } },
      { t:"03:08", d:5, out:["baoV"], cap:"03:08，他推著手推車，走到柱子的後面。", st:{ cam:true, night:true }, m:{ shenV:[92, F, "stand", 1, 92, F], dogV:[80, F, "lie", 1, 80, F], baoV:[-14, F, "stand", -1, 128, F] } },
      { t:"03:08–03:15", d:4.5, cap:"七分鐘。畫面上沒有他，也沒有那一台手推車。你在秤旁邊等。", st:{ cam:true, night:true, cart:false }, m:{ shenV:[92, F, "stand", -1, 92, F], dogV:[80, F, "lie", 1, 80, F] } },
      { t:"03:15", d:5, cap:"03:15，他推著車，從柱子後面出來。一次三尾。你秤，他寫。", st:{ cam:true, night:true }, m:{ shenV:[92, F, "stand", 1, 92, F], dogV:[80, F, "lie", 1, 80, F], baoV:[128, F, "write", -1, -14, F] } },
      { t:"04:40", d:5, out:["baoV"], cap:"04:40，你在洗秤台。老包推著空的手推車，走到柱子的後面。", st:{ cam:true, night:true }, m:{ shenV:[86, F, "inspect", 1, 86, F], dogV:[80, F, "lie", 1, 80, F], baoV:[-14, F, "stand", -1, 128, F] } },
      { t:"04:40–05:00", d:4.5, cap:"他沒有再出來。手推車也沒有。", st:{ cam:true, night:true, cart:false }, m:{ shenV:[86, F, "inspect", 1, 86, F], dogV:[80, F, "lie", 1, 80, F] } },
      { t:"05:00", d:4.5, cap:"05:00，你下班。豆花站起來。一整夜，你都在秤的旁邊；牠一直在你的腳邊。", st:{ cam:true, night:true, cart:false }, m:{ shenV:[200, F, "stand", 1, 92, F], dogV:[186, F, "stand", 1, 80, F] } }
    ]),
    cctv46_alley: mk("c46_alley", { cam:true, dawn:true }, "丸福 後巷", "2027-04-22", [
      { t:"04:56:10", d:5, cap:"04:56，一台白色的速克達從巷口騎進來。後面綁著一個很長的保麗龍箱。", st:{ cam:true, dawn:true, scoot:-10 }, m:{ baoH:[2, F, "stand", 1, 2, F] } },
      { t:"04:57:00", d:5.5, cap:"04:57，旬的後門。他從箱子裡抬出一樣長長的東西，放進門口的藍色保冷箱；從蓋子裡面撕下一個信封。", st:{ cam:true, dawn:true, scoot:62 }, m:{ baoH:[52, F, "kneel", -1, 2, F] } },
      { t:"05:01:20", d:5.5, out:["xcaiV"], cap:"05:01，丸福的後門開了。小戴。兩個人把一樣長長的東西抬進去。小戴遞給他一個信封。", st:{ cam:true, dawn:true, scoot:140, maru:true }, m:{ baoH:[132, F, "give@paper", -1, 52, F], xcaiV:[118, F, "stand", 1, 118, F] } },
      { t:"05:03:40", d:5, cap:"05:03，他騎出巷子。你把畫面停在轉彎的那一格，放大：車牌 MKN-6206。", st:{ cam:true, dawn:true, scoot:170 }, m:{ baoH:[170, F, "stand", 1, 132, F] } },
      { t:"4/15・4/8", d:5, cap:"往前滑。4 月 15 日 04:55，同一台車。4 月 8 日 04:58，同一台車。每一個禮拜四。", st:{ cam:true, dawn:true, scoot:62 }, m:{ baoH:[52, F, "kneel", -1, 52, F] } }
    ])
  };
  [...EP46.cctv, ...EP46.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 重現（結案的時候） ---------- */
  const mkR = beats => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join); const seq = beats.map(b => b.st || {});
    return beats.map(b => { const o = Object.assign({}, b, { opt:Object.assign({}, b.opt || {}, { ds, seq }) }); delete o.st; return o; }); };
  const RB = mkR([
    { t:"去年 9 月", d:6, cap:"去年九月，全叔的膝蓋開了刀。從那個時候起，他三點就下班。三點以後的過磅單，老包說：「我幫你寫。」", scene:"c46_dock", opt:{ night:true }, m:{ quanV:[128, F, "sit", -1, 128, F], baoV:[110, F, "stand", 1, 110, F] } },
    { t:"4/21 02:55", d:6, cap:"4 月 21 日的夜裡。最後一板，十四尾，叉到了柱子的後面。全叔數過，用鉛筆寫了「14」。三點，他騎腳踏車回家。", scene:"c46_dock", opt:{ night:true }, m:{ quanV:[40, F, "write", -1, 40, F], shenV:[92, F, "stand", 1, 92, F], dogV:[80, F, "lie", 1, 80, F] } },
    { t:"03:05", d:5.5, out:["baoV"], cap:"三點零五分，阿南開著堆高機去三號碼頭。老包推著手推車，一次三尾，推到秤上。有兩尾，一直留在推車的下層，蓋著麻袋。", scene:"c46_dock", opt:{ night:true }, m:{ baoV:[44, F, "stand", 1, 44, F], shenV:[92, F, "stand", 1, 92, F], dogV:[80, F, "lie", 1, 80, F] } },
    { t:"03:10", d:6, cap:"03:10，冷凍倉的側門：G-03。他把那兩尾，放在海龍那一板的後面，墊著紙板。", scene:"c46_cold", opt:{}, m:{ baoV:[166, F, "kneel", 1, 150, F] } },
    { t:"03:38", d:5.5, cap:"過磅機記了六十二次。他把鉛筆的「14」擦掉，寫了「12」。簽名：「全」。", scene:"c46_office", opt:{ night:true }, m:{ baoV:[94, F, "write", 1, 94, F] } },
    { t:"04:41", d:5.5, cap:"04:41，G-03，又一次。兩尾魚，裝進機車後面那一個長長的保麗龍箱。", scene:"c46_lot", opt:{ night:true, scooter:true }, m:{ baoV:[100, F, "stand", 1, 100, F] } },
    { t:"04:57", d:5.5, cap:"04:57，港濱路的後巷，旬的後門。", scene:"c46_alley", opt:{ dawn:true, scoot:62 }, m:{ baoH:[52, F, "kneel", -1, 52, F] } },
    { t:"05:01", d:5.5, out:["xcaiV"], cap:"05:01，丸福的後門。一公斤六百五十元，現金，沒有發票。每一個禮拜，都是這樣。從去年十月開始。", scene:"c46_alley", opt:{ dawn:true, scoot:140, maru:true }, m:{ baoH:[132, F, "give@paper", -1, 132, F], xcaiV:[118, F, "stand", 1, 118, F] } },
    { t:"4/22", d:6, cap:"以前的船，只對重量。永慶換了一個新的會計。她對的，是尾巴上的標籤。", scene:"c46_office", opt:{}, m:{ jianV:[72, F, "stand", 1, 72, F] } },
    { t:"那一夜", d:5.5, cap:"那一夜，你一直站在秤的旁邊。豆花趴在你的腳邊。那兩尾魚，從來沒有經過你的手。", scene:"c46_dock", opt:{ night:true }, m:{ shenV:[92, F, "stand", 1, 92, F], dogV:[80, F, "lie", 1, 80, F] } }
  ]);

  /* ---------- 結案（結局固定） ---------- */
  const pickR = () => { try { return (S.result && S.result.pick && S.result.pick.reasoning) || {}; } catch (e) { return {}; } };
  const missing = () => { try { const pk = pickR(); return EP46.reasoning.filter((r, i) => (!r.kinds) && pk[i] !== r.answer).length; } catch (e) { return 0; } };
  const seen = id => { try { return typeof S !== "undefined" && S && (S.seen || []).includes(id); } catch (e) { return false; } };
  const arcSet = (f, how) => { try { if (typeof S !== "undefined" && S && S.done && typeof C !== "undefined" && C && C.id === "nightshift" && typeof ARC !== "undefined" && !ARC.has(f)) ARC.set(f, "nightshift", how || "told"); } catch (e) {} };
  const flags = () => { arcSet("tuna_heavy", seen("o46_hlbox") ? "found" : "told"); };
  const police = () => "03:40，港濱派出所的巡邏車停在停車場。下來的是汪志遠。他看到你，愣了一下。\n「……學長？」\n你說：我現在搬冰塊。\n老包自己走出警衛室。帽子拿在手上。他把那一鍋鹹粥的蓋子蓋好，對阿南說：「天亮以前，要吃完。」\n他上車以前，看了豆花一眼。豆花也看著他。";
  const tail = () => "\n簡老闆站在辦公室的門口，很久沒有講話。\n「明天晚上，」他說，「十點。你還來嗎？」\n你說：來。\n他點了一下頭，回到辦公桌，把永慶的傳真摺起來，壓在菸灰缸的下面。\n「旬和丸福，我明天去。」他說。「魚，要賠。人，我不告。他們不知道。」\n全叔把他的鉛筆，插回耳朵上面。「少年仔。」他說。「你秤得很準。」"
    + (seen("o46_hlbox") ? "\n你脫下手套。手套的裡面，用原子筆寫著六個編號。HL-0415-01 到 06。\n每一箱，多四到六公斤。\n你把手套翻回來，放進口袋。" : "\n收工的時候，全叔順口說了一句：「海龍那六箱，一箱多四、五公斤。冰衣沒有那麼重。」\n他說完，就不講了。");
  EP46.court = {
    title: "金鴻冷凍行・辦公室・4 月 23 日 03:00", scene: "c46_office", opt:{ night:true },
    detective: Object.assign({}, SHEN),
    who: ph => ["jian", "quan", "bao", "nan"],
    open: ph => "03:00。全叔把外套穿上了，沒有走。阿南靠在門邊，手套還戴著。老包端著一碗粥，站在最後面。\n簡老闆坐在辦公桌的後面。傳真紙，還壓在他的手下面。\n「沈先生。」他說。他第一次叫你沈先生。「你說。」",
    kindLine: {
      took: "那兩尾魚，上了岸。到了魚市。然後，被人拿走了。",
      ship: "那兩尾魚，根本沒有上岸。是船上的清單寫錯了。",
      thaw: "那兩尾魚，在冷凍倉裡壞了，被當成垃圾丟掉了。"
    },
    kindTrue: "（簡老闆的手，從傳真紙上拿開了。）\n「誰。」",
    murmur: [ "（阿南看著自己的手套。）", "（全叔把鉛筆從耳朵上拿下來，又插回去。）", "（老包手上的粥，冒著白煙。）" ],
    confess: { bao: "（老包把那一碗粥，放在簡老闆的桌上。）\n「……一個禮拜兩尾。」\n「我太太一個禮拜洗腎三次。我想，船那麼大，沒有人會數。」\n（他把帽子拿下來。）「老闆，對不起。九年。」" },
    cornered: { bao: "（老包沒有說話。他把帽子拿下來，放在桌上。）" },
    deny: {
      jian: "我？那是我的魚。我偷我自己的魚，還叫你來查？",
      quan: "我三點就走了。第五板，我數的是十四。鉛筆是我寫的。",
      nan: "三點零五到三點半，我在三號碼頭。大門的鏡頭，你去看。"
    },
    replayText: "你走到過磅台，站到秤的旁邊。豆花在你的腳邊趴下。從去年的九月開始——",
    replay: { scene:"c46_dock", opt:{ night:true }, clean:true, cam:"經過重現", date:"2027-04-22", beats:RB },
    get endGood(){ const ms = missing(); flags();
      return "簡老闆拿起電話。他撥了三個數字，停了一下，看著老包。\n老包點了一下頭。\n簡老闆把最後一個數字按了下去。\n" + police()
        + (ms ? "\n（你沒有講到的那幾樣，是曾組長第二天早上，一張一張印出來給簡老闆的。）" : "\n（簡老闆把每一張紙對齊，收進檔案夾。「一張都不用補。」他說。）")
        + tail(); },
    get endBad(){ const k = (typeof S !== "undefined" && S && S.result && S.result.pick && S.result.pick.kind) || ""; flags();
      return (k === "ship" ? "簡老闆搖頭。「船上的清單有標籤號碼。」\n小戴傳來一張照片：後巷垃圾桶裡的一截魚尾。黃色的標籤：0861。"
          : k === "thaw" ? "簡老闆搖頭。「冷凍倉的溫度，三年來沒有跳過三度。」\n「壞掉的魚，也要有魚。」"
          : "簡老闆搖頭。")
        + "\n全叔把鉛筆從耳朵上拿下來。「第五板，我數的是十四。」\n曾組長的刷卡紀錄，傳真過來了。03:10。04:41。G-03。\n辦公室裡，所有的人，都慢慢地轉過頭去。\n老包端著那一碗粥，站在最後面。粥已經不冒煙了。\n" + police()
        + tail()
        + "\n（這一次，最後的那一段，是他們替你走完的。）"; }
  };

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP46.fac = { market:["#c8c4b8", "#2a5a8a"], lane:["#b8a88c", "#5a3a22"], cafe:["#e8dcc4", "#2a7a8a"] };
  EP46.setting = { market:"harbour", lane:"town", cafe:"city" };
  EP46.car = "#7a8a6a";   // 他自己的舊車
  EP46.outScenes = ["c46_lot", "c46_alley", "c46_cafe"];
  EP46.skyTo = { c46_cafe:0 };
  const SKY46 = [ ["#9cc4e0", "#e4ecf0", "#7a7a76", "#6a6a66", 0, 0], ["#141a2a", "#2a3044", "#3a3c40", "#2e3034", 0, 1] ];
  EP46.worldSky = ph => SKY46[Math.min(ph || 0, SKY46.length - 1)];
  EP46.worldOrder = { market:["lot", "guard", "office", "dock", "cold"], lane:["shun", "maru", "alley"], cafe:["seat"] };
  EP46.roomDesc = {
    lot:"魚市的停車場。右邊是魚市，左邊是大門。", guard:"管理室。晚上，是警衛室。", office:"金鴻冷凍行的辦公室。",
    dock:"過磅台。一台秤，一張桌子，一根大柱子。", cold:"冷凍倉。零下二十五度。",
    shun:"日本料理「旬」。", maru:"丸福壽司。", alley:"兩家店後面的巷子。", seat:"海風咖啡外面的座位。"
  };
  const rx = (i, x) => 116 + i * 198 + x;
  const say = (who, text, name) => ({ say:[who, text], name });
  EP46.world = {};
  EP46.locations.forEach(l => { EP46.world[l.id] = { auto:true, you:SHEN, order:(EP46.worldOrder || {})[l.id] }; });
  Object.assign(EP46.world.market, { spawn:rx(0, 40),
    intro: [
      { set:{ px:rx(0, 40), face:1 } },
      say("you", "（停車場、管理室、辦公室、過磅台、冷凍倉。三天了，每一個地方你都走過。今天，用另外一種眼睛走一次。）", "你")
    ],
    labels: [
      { room:"lot", x:119, y:21, text:"南澳魚市", size:7, color:"#2a5a8a", bold:true, align:"center" },
      { room:"office", x:45, y:13, text:"排班表", size:4, color:"#3a3a3e", bold:true, align:"center" },
      { room:"cold", x:138, y:37, text:"海龍漁業", size:4, color:"#c83a2a", bold:true, align:"center" },
      { room:"dock", x:108, y:31, text:"過磅", size:4, color:"#3a3e44", bold:true, align:"center" }
    ],
    extras: [
      { id:"x46_dog", name:"豆花", x:rx(3, 80), L:Object.assign({}, DOG), pose:"lie", facing:1,
        lines:["（豆花趴在秤的旁邊。你走過來，牠的尾巴拍了兩下地板。）", "（牠把下巴放在你的雨鞋上。）", "（牠抬頭看了一眼柱子的後面，又把頭放下去。）"] }
    ] });
  Object.assign(EP46.world.lane, { spawn:rx(0, 30),
    labels: [
      { room:"shun", x:39, y:12, text:"本日おすすめ", size:4, color:"#3a2a1a", bold:true, align:"center" },
      { room:"alley", x:31, y:24, text:"旬", size:5, color:"#3a2a1a", bold:true, align:"center" },
      { room:"alley", x:121, y:24, text:"丸福", size:5, color:"#c83a2a", bold:true, align:"center" }
    ] });
  Object.assign(EP46.world.cafe, { extras: [
      { id:"x46_mom", name:"阿彬媽媽", x:rx(0, 150), L:Object.assign({ age:"old", gender:"f", skin:"#d8a880", hair:"#4a4440", hairStyle:"bob", top:"#7a9a7a", bottom:"#3a3a44" }, AL("abinmom") || {}, { apron:"#e8e0d0" }), pose:"hold@tray", facing:-1,
        get lines(){ return EP46_has("c_report_mom") ? ["沈先生。……我做完筆錄了。", "滷蛋，給你帶一顆去魚市。夜班冷。"]
          : EP46_has("c_let_mom_choose") ? ["沈先生。你那天讓我自己決定。……謝謝你。", "滷蛋，給你帶一顆去魚市。夜班冷。"]
          : ["沈先生，坐。", "滷蛋，給你帶一顆去魚市。夜班冷。"]; } },
      { id:"x46_cdog", name:"豆花", x:rx(0, 104), L:Object.assign({}, DOG), pose:"lie", facing:1, lines:["（豆花趴在你的腳邊，聞你褲管上冰塊的味道。）"] } ] });
  EP46.mapPos = { market:[150,70,"d"], lane:[96,40,"u"], cafe:[52,64,"d"] };
  EP46.mapRoads = [["market","lane"],["lane","cafe"],["cafe","market"]];
  EP46.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 6; x < 120; x += 8) for (let y = 8; y < 90; y += 7){ if ((x * 3 + y) % 5 === 0) continue; R(x, y, 6, 5, "#c8c0b0"); }   // 市區
    const rd = "#d8d4c8";
    R(0, 52, 240, 5, rd); R(94, 20, 5, 34, rd); R(148, 54, 5, 30, rd); R(50, 54, 5, 20, rd);
    for (let x = 4; x < 240; x += 12) R(x, 54, 6, 1, "#f4f0e0");
    R(0, 92, 240, 43, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 96 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");   // 漁港
    R(130, 80, 44, 12, "#c8c4b8"); R(130, 80, 44, 2, "#2a5a8a");   // 魚市
    for (let k = 0; k < 4; k++) R(180 + k * 12, 88, 3, 14, "#7a6a5a");   // 碼頭
    R(84, 30, 26, 10, "#b8a88c"); R(84, 30, 26, 2, "#5a3a22");   // 港濱路
    R(40, 66, 14, 8, "#e8dcc4"); R(40, 66, 14, 2, "#2a7a8a");   // 海風咖啡
  };
})();
