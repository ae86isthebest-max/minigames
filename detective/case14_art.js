/* =========================================================
   第 14 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP14.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, lamp, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i] = beatAt(o.t || 0, o.ds); return (o.seq || [])[i] || {}; };
  const cam = (x, y) => { R(x, y, 10, 5, "#2a2a2e"); R(x + 7, y + 1, 3, 3, "#4a4a52"); P(x + 1, y + 1, "#e83a3a"); };
  const tube = (x, y, w) => { R(x, y, w, 2, "#f4f8f0"); dither(x - 4, y + 2, w + 8, 6, "#f4f8f022", 3); };
  const box = (x, y, w, h, c) => { R(x, y, w, h, c || "#b8925a"); R(x, y, w, 1, "#d8b27a"); R(x + (w >> 1), y, 1, h, "#9a7a48"); R(x + 2, y + 2, Math.min(5, w - 4), 2, "#f4f0e0"); };
  const dog = (x, y, pose) => {   // 豆花：奶油色拉布拉多，背心「豆花」；pose: sit / lie / sniff
    const c = "#f0dcb0", d = "#d8c090";
    if (pose === "lie"){ R(x, y - 5, 16, 5, c); R(x + 14, y - 8, 7, 6, c); R(x + 15, y - 9, 2, 3, d); P(x + 20, y - 6, INK); P(x + 18, y - 7, INK); R(x - 3, y - 4, 4, 2, c); R(x + 4, y - 6, 6, 3, "#3a6ac8"); return; }
    if (pose === "sniff"){ R(x, y - 9, 14, 6, c); R(x + 13, y - 6, 7, 5, c); P(x + 19, y - 3, INK); P(x + 16, y - 5, INK); R(x + 14, y - 8, 2, 3, d); R(x + 1, y - 3, 2, 3, c); R(x + 10, y - 3, 2, 3, c); R(x - 3, y - 10, 4, 2, c); R(x + 3, y - 9, 7, 4, "#3a6ac8"); return; }
    R(x, y - 8, 9, 8, c); R(x + 6, y - 15, 7, 8, c); R(x + 6, y - 16, 2, 4, d); R(x + 11, y - 11, 3, 2, c); P(x + 13, y - 11, INK); P(x + 10, y - 13, INK); R(x - 2, y - 2, 4, 2, c); R(x + 7, y - 1, 3, 1, d); R(x + 1, y - 7, 6, 4, "#3a6ac8"); P(x + 3, y - 6, "#f4f0e0");
  };
  // A 字梯：standing=true 立著（頂端在 y-34），否則倒在地上
  const ladder = (x, y, standing, bent) => {
    const c = "#c8ccd0", s = "#9aa0a8";
    if (standing){ for (let k = 0; k < 34; k++){ P(x + (k >> 3), y - k, c); P(x + 16 - (k >> 3), y - k, c); } for (let k = 1; k <= 5; k++) R(x + 1 + (k >> 1), y - k * 6, 14 - k, 1, s); R(x + 4, y - 35, 9, 2, s); return; }
    R(x, y - 3, 30, 1, c); R(x, y, 30, 1, c); for (let k = 1; k <= 5; k++) R(x + k * 5, y - 2, 1, 2, s); if (bent){ R(x + 26, y - 6, 1, 4, c); R(x + 27, y - 7, 4, 1, c); }
  };

  /* ---------- 場景：警察局 ---------- */
  // 1F 值班台
  SC.e_lobby = (o) => {
    wall(76, o.night !== false ? "#c8c4b4" : "#d8d4c4", false); R(0, 66, W, 10, "#a8a494");
    R(0, 14, 22, 62, "#7a8a98"); R(2, 16, 18, 48, "#a8c8d8"); dither(2, 16, 18, 48, o.night !== false ? "#1a2a3a88" : "#ffffff33", 2); R(10, 16, 1, 48, "#5a6a78");   // 大門（玻璃）
    R(36, 4, 14, 14, "#2a4a8a"); R(38, 6, 10, 10, "#e8c040"); R(41, 8, 4, 6, "#2a4a8a");   // 警徽
    R(24, 22, 26, 20, "#c8a868"); R(25, 23, 24, 18, "#e8dcc0"); for (let k = 0; k < 4; k++) R(27, 26 + k * 4, 12 + (k * 5) % 9, 2, ["#f4f0e0","#f6d6d6","#d6e6f6"][k % 3]);   // 公布欄
    R(92, 6, 12, 12, "#f4f4f0"); R(92, 6, 12, 1, "#5a5a5a"); R(97, 9, 1, 4, INK); R(97, 12, 3, 1, INK); P(97, 12, "#e83a3a");   // 鐘
    cam(10, 4);
    // 往地下室的樓梯（右邊，往下）：牆上的綠色指示牌，樓梯口的欄杆，地板上的樓梯開口
    R(158, 16, 26, 10, "#2a5a3a"); txt("B1↓", 163, 24, "#f4f0e0", "6px sans-serif");
    R(166, 30, 18, 8, "#f4f0e0"); R(168, 32, 14, 1, "#8a8a8a"); R(168, 35, 10, 1, "#8a8a8a");   // 便條
    floor(76, "#b8b4a4", "#a8a494");
    R(154, 78, 38, 30, "#3a3a3e"); for (let k = 0; k < 5; k++){ R(156 + k * 7, 80 + k * 6, 36 - k * 7, 2, "#b8b4a8"); R(156 + k * 7, 82 + k * 6, 36 - k * 7, 4, "#6a665a"); }   // 樓梯開口（往下）
    R(152, 60, 2, 18, "#5a5a5e"); R(152, 60, 40, 2, "#8a8a8e"); for (let x = 160; x < 192; x += 8) R(x, 62, 1, 16, "#7a7a7e");   // 欄杆
    SC.e_lobby.front(o);
  };
  // 值班台檯面：站在後面的人在檯面後
  SC.e_lobby.front = (o) => {
    R(54, 50, 92, 3, "#8a6a4a"); R(56, 53, 88, 23, "#6a7a8a"); R(58, 56, 84, 2, "#7a8a9a"); txt("值班台", 88, 68, "#e8e8e0", "6px sans-serif");
    R(68, 42, 10, 8, "#2a2a2e"); R(69, 43, 8, 5, "#3a3a40"); R(70, 47, 6, 3, "#1a1a1e");   // 電話
    R(86, 44, 6, 6, "#e8e8e0"); R(87, 45, 4, 2, "#8a6a3a"); R(85, 49, 8, 1, "#c8b890");   // 茶杯和杯墊
    R(100, 36, 14, 12, "#1a1a1e"); R(101, 37, 12, 9, o.cam ? "#2a3a3a" : "#2a4a3a"); R(103, 39, 3, 5, "#6a7a7a"); R(108, 40, 3, 3, "#8a8a8a"); R(106, 48, 2, 2, "#1a1a1e");   // 監視螢幕（B1 畫面）
    R(118, 44, 14, 8, "#2a3a6a"); R(119, 45, 12, 6, "#f4f0e0"); for (let k = 0; k < 3; k++) R(120, 46 + k * 2, 10, 1, "#8a8a8a");   // 值班日誌
  };
  SC.e_lobby.frontY = 80;

  // B1 走廊
  SC.e_b1hall = (o) => {
    R(0, 0, W, 76, "#a8b0a4"); R(0, 0, W, 6, "#8a9088");
    tube(30, 6, 18); tube(130, 6, 18);
    R(0, 56, W, 20, "#9a9a84"); dither(0, 57, W, 18, "#8a8a6a", 3); R(0, 55, W, 2, "#a8884a"); R(0, 57, W, 1, "#b8986a");   // 淹水水位線
    cam(80, 2);
    R(36, 22, 18, 14, "#8a6a4a"); R(37, 23, 16, 12, "#e8dcc0"); R(39, 25, 8, 4, "#f4f0e0"); R(40, 26, 6, 1, "#8a8a8a"); R(45, 30, 7, 4, "#f4f0f0"); P(48, 31, "#c83a2a");   // 公布欄
    // 證物室的門
    R(106, 14, 40, 8, "#3a4a5a"); txt("證物室", 114, 21, "#f4f0e0", "6px sans-serif");
    R(110, 24, 30, 52, "#5a6470"); R(112, 26, 26, 48, "#6a7480"); R(116, 32, 12, 12, "#2a3440"); R(117, 33, 10, 10, o.lit !== false ? "#c8d8c0" : "#2a3a3a"); for (let k = 0; k < 10; k += 3){ R(117, 33 + k, 10, 1, "#8a9a90"); R(117 + k, 33, 1, 10, "#8a9a90"); }   // 小窗
    if (o.lit !== false){ R(119, 37, 6, 1, "#8a7a5a"); R(118, 39, 8, 1, "#8a7a5a"); }   // 小窗裡看到斜斜的鐵架
    R(134, 48, 3, 6, "#c8c8cc");
    R(142, 42, 8, 10, "#2a2a2e"); R(143, 43, 6, 4, "#3ae86a"); R(144, 48, 4, 2, "#8a8a8a");   // 讀卡機
    // 消防栓箱（下半鏽）
    R(152, 34, 14, 28, "#c83a2a"); R(152, 56, 14, 6, "#8a5a3a"); dither(152, 54, 14, 8, "#6a3a2a", 2); R(154, 36, 10, 6, "#e8e8e0");
    if (!o.cam && o.sign !== false){ R(58, 62, 8, 14, "#f4d03a"); R(60, 58, 4, 4, "#f4d03a"); R(61, 66, 2, 4, INK); P(61, 71, INK); }   // 小心地滑
    if (o.cam && o.sign){ R(58, 62, 8, 14, "#f4d03a"); R(60, 58, 4, 4, "#f4d03a"); R(61, 66, 2, 4, INK); }
    R(170, 24, 22, 52, "#7a8478"); txt("→ C排", 172, 34, "#e8e8e0", "5px sans-serif");   // 走廊盡頭
    floor(76, "#8a8e86", "#7e827a");
    if (o.tape) { R(100, 54, 52, 2, "#f2d03b"); for (let x = 100; x < 152; x += 8) R(x, 54, 4, 2, INK); }
    if (o.dog) dog(96, 98, "lie");
    if (o.shake){ dither(30, 8, 30, 10, "#e8e8e055", 2); }
  };

  // B1 樓梯口・營繕工作室
  SC.e_facility = (o) => {
    R(0, 0, W, 76, "#a8b0a4"); R(0, 0, W, 6, "#8a9088");
    tube(110, 6, 20);
    R(0, 56, W, 20, "#9a9a84"); dither(0, 57, W, 18, "#8a8a6a", 3); R(0, 55, W, 2, "#a8884a");
    // 從一樓下來的樓梯（左邊）
    for (let k = 0; k < 7; k++){ R(0, 20 + k * 8, 46 - k * 6, 2, "#b8b4a8"); R(0, 22 + k * 8, 46 - k * 6, 6, "#6a665a"); }
    R(44, 16, 2, 30, "#5a5a5e"); for (let k = 0; k < 6; k++) R(2 + k * 7, 14 + k * 8, 8, 1, "#8a8a8e");
    txt("1F↑", 4, 12, "#3a3a3a", "6px sans-serif");
    // 洞洞板和工具（畫外框）
    R(60, 14, 60, 34, "#c8a878"); for (let x = 62; x < 120; x += 4) for (let y = 16; y < 48; y += 4) P(x, y, "#a8885a");
    [[64,18,4,16,"#8a8a90"],[72,18,14,4,"#8a8a90"],[90,18,4,14,"#c83a2a"],[98,18,12,3,"#5a5a5e"],[66,38,16,3,"#8a8a90"],[88,36,6,10,"#e8c040"],[100,30,14,4,"#5a5a5e"],[110,38,6,8,"#3a6ac8"]].forEach(([x,y,w,h,c]) => { R(x - 1, y - 1, w + 2, h + 2, "#f4f0e0"); R(x, y, w, h, c); });
    R(150, 28, 40, 2, "#6a5a4a"); R(176, 40, 10, 8, "#3a3a3e"); R(177, 41, 5, 4, "#8a8a8e"); R(183, 42, 2, 2, "#c8c8c8"); R(176, 48, 14, 2, "#6a5a4a");   // 架子和收音機
    R(152, 18, 22, 10, "#f4f0e0"); txt("營繕", 156, 26, "#2a4a8a", "6px sans-serif");
    floor(76, "#8a8e86", "#7e827a");
    // 工作台
    R(100, 52, 88, 4, "#8a6a4a"); R(102, 56, 84, 10, "#7a5a3a"); R(124, 58, 14, 6, "#6a4a2a"); R(130, 60, 3, 1, "#c8a868"); R(104, 66, 3, 10, "#5a3e24"); R(182, 66, 3, 10, "#5a3e24");
    R(150, 44, 14, 8, "#d8c8a0"); R(151, 45, 12, 2, "#c8b890"); txt("C排", 151, 51, "#2a2a2a", "5px sans-serif");   // 新螺栓
    R(110, 48, 10, 4, "#5a5a5e"); R(112, 46, 6, 2, "#8a8a8e");   // 工具箱
  };

  // 證物室・前台
  SC.e_office = (o) => {
    wall(76, "#d0ccbc", false); R(0, 66, W, 10, "#b0ac9c");
    R(0, 56, W, 2, "#a8884a"); dither(0, 58, W, 8, "#a8986a33", 3);
    tube(40, 4, 22); tube(120, 4, 22);
    cam(178, 2); R(176, 8, 14, 4, "#f4f0c0");
    R(100, 14, 14, 14, "#f4f4f0"); R(100, 14, 14, 3, "#c83a2a"); for (let k = 0; k < 3; k++) for (let j = 0; j < 4; j++) R(102 + j * 3, 19 + k * 3, 2, 2, (k * 4 + j) < 9 ? "#8a8a8a" : "#e8e8e0"); P(111, 25, "#c83a2a");   // 桌曆
    R(118, 14, 14, 14, "#6a4a2a"); R(120, 16, 10, 10, "#e8e0d0"); R(122, 18, 3, 6, "#7ac0c8"); R(126, 19, 3, 5, "#5a6a7a"); R(120, 16, 4, 2, "#e8c040");   // 相框
    R(126, 30, 14, 16, "#f4f4f0"); for (let k = 0; k < 5; k++) R(128, 32 + k * 3, 10, 1, "#8a8a8a"); R(134, 38, 4, 1, "#3a3a3a"); R(130, 47, 6, 1, "#c8a040");   // 排班表和鉛筆
    // 鐵櫃
    R(150, 24, 22, 46, "#7a8490"); R(151, 25, 20, 21, "#8a94a0"); R(151, 47, 20, 22, "#8a94a0"); R(160, 34, 2, 4, "#c8c8cc"); R(160, 56, 2, 4, "#c8c8cc"); R(153, 27, 10, 3, "#f4f0e0");
    // 通往鐵架區的鐵網門
    R(176, 16, 16, 60, "#5a6470"); for (let y = 18; y < 76; y += 4) R(178, y, 14, 1, "#8a949c"); for (let x = 178; x < 192; x += 4) R(x, 18, 1, 58, "#8a949c");
    // 書桌和電腦
    R(16, 48, 84, 3, "#8a7a5a"); R(18, 51, 80, 18, "#7a6a4a"); R(20, 69, 3, 7, "#5a4a3a"); R(94, 69, 3, 7, "#5a4a3a");
    R(40, 36, 18, 12, "#1a1a1e"); R(41, 37, 16, 9, "#2a5a7a"); for (let k = 0; k < 3; k++) R(42, 38 + k * 3, 12, 1, "#a8d8f0"); R(47, 46, 4, 2, "#2a2a2a");
    R(64, 44, 16, 4, "#2a4a3a"); R(65, 44, 14, 1, "#f4f0e0");   // 簽收簿
    R(86, 45, 10, 3, "#f4f0e0"); R(87, 44, 8, 1, "#c8c8c0"); R(84, 46, 2, 2, "#e8d0a0");   // 便當盒和滷蛋
    R(20, 46, 12, 4, "#3a3a40"); R(22, 50, 8, 18, "#2a3a6a"); R(20, 50, 2, 16, "#2a3a6a"); R(30, 50, 2, 16, "#2a3a6a");   // 椅背和夾克
    R(3, 48, 12, 2, "#8a6a4a"); R(5, 42, 6, 6, "#d8d8dc"); R(4, 44, 1, 2, "#d8d8dc"); R(6, 41, 4, 1, "#3a3a3e"); R(11, 44, 3, 4, "#e8c040");   // 牆角的小電熱水壺和泡麵（d14_kettle）
    floor(76, "#9a9a8e", "#8e8e82");
  };

  // 證物室・鐵架區
  // 比例：人（s1.3）約 34px＝170 公分 → 20px／公尺。牆腳 y76，人站在 y92–100（走道）。
  // 鐵架高 2.1 公尺（y34–76），四層：y74、y62、y48、y36。水位線 112 公分＝y54；下排固定片 40 公分＝y68，上排 190 公分＝y38。
  // C-3 在 x100–148。倒下以後往走道（往鏡頭）倒：底邊還在牆腳 y76，頂邊落在 y96。
  SC.e_shelf = (o) => { o = Object.assign({}, o, stOf(o));
    const fallen = o.fallen !== false, top = o.top === undefined ? 14 : o.top, front = o.front === undefined ? 0 : o.front;
    const BX = ["#b8925a","#a8865a","#c8a26a"];
    R(0, 0, W, 76, "#b0b4ac"); R(0, 0, W, 6, "#8a9088");
    tube(60, 6, 20); tube(150, 6, 20);
    R(0, 55, W, 21, "#a8a894"); for (let k = 0; k < 18; k++) P((k * 29) % W, 58 + (k * 7) % 16, "#e8e8e0"); R(0, 54, W, 2, "#a8884a"); txt("2023.7.28 112cm", 56, 52, "#6a6a5a", "4px monospace");   // 水位線和白華
    // 站著的鐵架（C-2 左、C-4 右）
    const shelf = (x, w, slot) => { R(x, 34, 2, 42, "#6a7480"); R(x + w - 2, 34, 2, 42, "#6a7480"); [74,62,48,36].forEach((y, r) => { R(x, y, w, 2, "#7a8490"); for (let i = 2; i + 9 < w; i += 10){ if (slot && r === 1 && i === 12) continue; box(x + i, y - 8, 9, 8, BX[(i + r) % 3]); } }); };
    shelf(0, 44); R(10, 66, 3, 3, "#6a3a2a"); R(30, 66, 3, 3, "#6a3a2a");   // C-2 和它下排的鏽螺栓
    shelf(150, 42, true); R(156, 66, 3, 3, "#6a3a2a"); R(182, 66, 3, 3, "#6a3a2a");   // C-4（第 12 格空）
    R(160, 40, 14, 6, "#f4f4f0"); txt("頂層禁放", 160, 45, "#c83a2a", "4px sans-serif");
    // 牆上的固定片
    const brk = (x, y, broke, pulled) => { if (pulled){ R(x, y, 4, 4, "#8a8a7a"); P(x + 1, y + 1, "#5a5a52"); P(x + 2, y + 2, "#5a5a52"); } else { R(x, y, 4, 5, broke ? "#6a3a2a" : "#7a4a2a"); if (broke) P(x + 1, y, "#d8d8d0"); } };
    if (fallen){ brk(104, 66, true); brk(140, 66, true); brk(104, 37, false, true); brk(140, 37, false, true); }
    if (!fallen){
      // 還站著的 C-3（tilt＝開始往前傾：頂邊往下、往外偏）
      const tl = o.tilt ? 3 : 0;
      R(100 - tl, 34 + tl, 2, 42 - tl, "#6a7480"); R(146 + tl, 34 + tl, 2, 42 - tl, "#6a7480");
      [74,62,48,36].forEach(y => { const d = Math.round(tl * (76 - y) / 42); R(100 - d, y + d, 48 + d * 2, 2, "#7a8490"); });
      for (let i = 0; i < Math.min(top, 15); i++){ const L = Math.floor(i / 5), c = i % 5; box(101 - tl + c * 9, 28 - L * 7 + tl, 9, 7, BX[i % 3]); }
      box(103, 54, 9, 8, "#8a7a5a"); box(125, 54, 9, 8, "#8a7a5a"); box(110, 40, 9, 8, "#8a7a5a");
      for (let i = 0; i < Math.min(front, 4); i++) box(102 + i * 11, 66, 10, 8, "#a8865a");
      box(104, 66, 9, 8, "#6a5a3a"); box(136, 66, 9, 8, "#6a5a3a");   // 後排的淹水箱（從前排的空隙看得到）
      R(102, 44, 6, 3, "#d8dce0");   // 銘牌
      brk(104, 66 - (front ? 0 : 0), false); brk(140, 66, false); brk(104, 37, false); brk(140, 37, false);
    }
    floor(76, "#8a8e86", "#7e827a"); R(0, 76, W, 1, "#6a6e66");
    if (fallen){
      // 先畫被壓住的人，再畫倒下的鐵架（橫桿壓在他胸口上）
      if (o.body) PR.person(132, 101, { skin:"#d8b090", hair:"#8a8a86", hairStyle:"balding", top:"#e8e4d8", bottom:"#3a3a40", gloves:"#5a5a52" }, 1.15, 1, "lie");
      else if (o.outline) PR.OBJ.outline(102, 96);
      // 倒下的 C-3：底邊 y76（x100–148），頂邊 y96（x94–154）
      const edge = k => [100 - Math.round(k * 6 / 20), 148 + Math.round(k * 6 / 20)];
      for (let k = 0; k <= 20; k++){ const [sx, ex] = edge(k); R(sx - 1, 76 + k, 3, 1, "#5a6470"); R(ex - 1, 76 + k, 3, 1, "#5a6470"); R(sx + 24 + Math.round(k * 3 / 20) - 1, 76 + k, 2, 1, "#5a6470"); }
      [[2,"#6a5a3a"],[8,"#8a7a5a"],[14,"#a8865a"]].forEach(([k, c], j) => { const [sx] = edge(k); for (let i = 0; i < 5 + j; i++) box(sx + 2 + i * 9, 76 + k - 5, 8, 5, j === 2 ? BX[i % 3] : c); });   // 卡在各層的箱子
      [0, 6, 12, 19].forEach(k => { const [sx, ex] = edge(k); R(sx, 76 + k, ex - sx, 2, "#7a8490"); R(sx, 76 + k, ex - sx, 1, "#9aa4b0"); });   // 層板
      R(112, 76, 16, 2, "#5a5248");   // 底板
      R(95, 88, 6, 4, "#d8dce0");   // 銘牌（在倒下的立柱上）
      for (let i = 0; i < 5; i++) box(156 + (i % 3) * 8, 92 - Math.floor(i / 3) * 7, 8, 7, BX[(i + 1) % 3]);   // 摔在地上的箱子
      box(80, 98, 9, 6, "#a8865a"); box(170, 100, 9, 6, "#b8925a");
      ladder(40, 102, false, true);
      R(140, 101, 6, 4, "#1a1a1e"); P(141, 102, "#5a8ac8");   // 手機
      R(24, 99, 11, 7, "#8a6a4a"); R(25, 100, 9, 5, "#f4f0e0"); R(26, 101, 6, 1, "#5a5a5a"); R(26, 103, 5, 1, "#5a5a5a");   // 夾板
      R(72, 101, 7, 5, "#1a1a1e"); R(72, 101, 7, 1, "#3a3a40");   // 黑色筆記本
      if (o.guncase){ R(114, 77, 12, 4, "#1a1a1e"); R(115, 78, 10, 2, "#3a3a40"); }
      if (o.dog) dog(120, 100, "sit");
    } else {
      ladder(o.ladderX || 82, 94, o.ladder === "up", false);
    }
  };

  // 總務科（2F）
  SC.e_admin = (o) => {
    wall(74, "#dcd8c8", false);
    R(20, 14, 40, 24, "#f4f4f0"); R(20, 14, 40, 2, "#8a8a8a"); for (let k = 0; k < 5; k++) R(23, 19 + k * 3.5, 30 - (k % 2) * 8, 1, k === 2 ? "#c83a2a" : "#3a3a8a"); R(23, 26, 26, 1, "#c83a2a");   // 預算白板
    R(80, 12, 16, 12, "#8a6a2a"); R(82, 14, 12, 8, "#e8c860"); R(86, 16, 4, 4, "#8a6a2a");   // 獎牌
    PR.windowBox(110, 12, 36, 22, "#9cc5e6");
    R(160, 16, 24, 40, "#8a8e94"); for (let k = 0; k < 4; k++) R(162, 18 + k * 9, 20, 7, "#9aa0a8");   // 檔案櫃
    floor(74, "#a8a498", "#9a968a");
    PR.OBJ.desk(30, 70, 60); PR.OBJ.monitor(40, 56, 16, 10); PR.OBJ.paper(64, 62, 12, 8, 2);
    PR.OBJ.desk(100, 70, 50); R(110, 62, 18, 8, "#f4f0e0"); R(132, 64, 10, 6, "#3a3a40");
    R(150, 56, 14, 16, "#3a3a3e"); R(151, 57, 12, 4, "#5a5a5e"); R(152, 61, 10, 10, "#2a2a2e"); R(153, 58, 8, 1, "#f4f4f0"); R(154, 55, 2, 4, "#f4f4f0"); R(158, 54, 1, 4, "#f4f4f0");   // 碎紙機
  };

  // 員工停車場（警局後面）
  SC.e_lot = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 50, o.day === false ? "#2a3040" : "#a8c8e0"); R(0, 40, W, 10, o.day === false ? "#3a4050" : "#c8d8e0");
    R(50, 44, 142, 32, "#9a968a"); for (let x = 50; x < W; x += 12) R(x, 44, 1, 32, "#8a867a"); R(50, 44, 142, 2, "#b8b4a8");   // 圍牆
    R(0, 10, 50, 66, "#c8c4b4"); R(4, 14, 42, 4, "#a8a494"); R(16, 36, 18, 40, "#5a6470"); R(18, 38, 14, 36, "#6a7480"); R(30, 54, 2, 4, "#c8c8cc"); txt("後門", 18, 34, "#3a3a3a", "6px sans-serif"); cam(30, 4); R(34, 9, 1, 6, "#3a3a3e");
    R(94, 14, 4, 62, "#b8b4a8"); R(96, 20, 20, 8, "#f4f4f0"); txt("證物室 鄭", 96, 26, "#2a4a8a", "4px sans-serif"); R(112, 20, 4, 3, "#c8a868");
    floor(76, "#7a7a76", "#6a6a66"); for (let x = 60; x < W; x += 40) R(x, 88, 2, 20, "#e8e8e0");
    // 銀色轎車（車頭朝左），後車廂在右邊
    if (o.car === false) return;
    const c = "#c8ccd0", open = o.trunk !== false && !o.cam;
    R(70, 60, 80, 16, c); R(86, 48, 44, 13, "#b0b4b8"); R(89, 50, 18, 10, "#8ab0d0"); R(110, 50, 17, 10, "#8ab0d0"); R(70, 66, 4, 4, "#f4e8a0"); R(146, 64, 4, 4, "#e83a3a");
    R(78, 74, 12, 10, INK); R(81, 77, 6, 4, "#5a5a5e"); R(128, 74, 12, 10, INK); R(131, 77, 6, 4, "#5a5a5e");
    if (open){ R(132, 42, 20, 4, "#b0b4b8"); R(150, 46, 2, 14, "#8a8e92"); R(132, 54, 16, 8, "#2a2a2e"); box(134, 52, 12, 9, "#b8925a"); R(136, 51, 8, 2, "#f4f0e0"); }
  };

  // 鄭家
  SC.z_home = (o) => {
    wall(74, "#e0d4bc", false);
    R(14, 14, 28, 60, "#d8d0c0"); R(20, 24, 16, 20, "#f4f4f0"); R(21, 25, 14, 18, "#c8d8e0"); R(23, 30, 3, 6, "#f4f4f0"); R(27, 31, 3, 5, "#c8a868"); R(31, 33, 3, 3, "#e8c040"); txt("浴", 22, 54, "#8a7a6a", "6px sans-serif");   // 浴室門和藥櫃
    R(110, 16, 14, 12, "#6a4a2a"); R(112, 18, 10, 8, "#e8e0d0"); R(114, 19, 3, 6, "#7ac0c8"); R(118, 19, 3, 6, "#3a3a40");   // 畢業照
    R(148, 18, 24, 26, "#8a3a2a"); R(150, 20, 20, 10, "#c83a2a"); R(156, 21, 8, 8, "#e8e0d0"); R(158, 22, 4, 5, "#5a5a5a"); R(150, 34, 20, 4, "#6a2a1a"); R(158, 31, 3, 3, "#c8a868"); R(152, 32, 3, 2, "#e8d0a0"); R(166, 28, 1, 6, "#e8c040");   // 佛桌
    PR.windowBox(60, 14, 36, 22, "#9cc5e6");
    floor(74, "#b8a888", "#a89878");
    R(62, 56, 56, 3, "#8a6a4a"); R(66, 59, 3, 15, "#6a4a2a"); R(112, 59, 3, 15, "#6a4a2a");   // 餐桌
    for (let k = 0; k < 6; k++){ R(70 + k * 6, 52 + (k % 2), 7, 4, "#f4f4f0"); R(71 + k * 6, 53 + (k % 2), 5, 1, "#8a8a8a"); }   // 影印紙和照片
    R(104, 50, 8, 6, "#e8c060"); R(105, 49, 6, 2, "#f4e8c0");   // 泡麵
    R(2, 62, 12, 12, "#6a5a4a"); R(3, 64, 10, 2, "#3a3a3a"); R(3, 68, 10, 2, "#3a3a3a");   // 鞋櫃

    R(128, 52, 46, 8, "#6a7a5a"); R(128, 46, 46, 7, "#5a6a4a"); R(126, 48, 4, 14, "#5a6a4a"); R(172, 48, 4, 14, "#5a6a4a"); R(150, 50, 10, 6, "#c8a868"); R(134, 60, 2, 14, "#3a2a1a"); R(166, 60, 2, 14, "#3a2a1a");   // 舊沙發和抱枕
    R(178, 50, 10, 4, "#d8d8d4"); R(182, 54, 2, 18, "#a8a8a4"); R(179, 72, 8, 2, "#a8a8a4"); R(179, 42, 8, 8, "#c8c8c4"); R(182, 45, 2, 2, "#5a5a5a");   // 電風扇
    R(44, 66, 12, 8, "#3a5a8a"); R(45, 64, 10, 3, "#2a4a7a"); R(48, 67, 4, 2, "#f4f0e0");   // 回收的寶特瓶袋
  };

  // 告別式外（第 14 集收工後的幕間）
  SC.funeral = (o) => {
    R(0, 0, W, 46, "#b8c4cc"); R(0, 36, W, 10, "#c8d0d4");
    R(30, 10, 132, 66, "#e8e4dc"); R(30, 10, 132, 6, "#5a5a6a"); R(70, 18, 52, 10, "#2a2a3a"); txt("追思", 88, 26, "#f4f4f0", "7px sans-serif");
    R(80, 36, 32, 40, "#3a3a44"); R(82, 38, 28, 38, "#4a4a54");
    [[8,"#f4f4f0"],[40,"#e8e8ff"],[140,"#f4f4f0"],[170,"#e8e8ff"]].forEach(([x,c]) => { R(x + 6, 50, 2, 26, "#5a5a5a"); for (let k = 0; k < 6; k++) R(x + (k % 3) * 5, 36 + Math.floor(k / 3) * 6, 5, 5, k % 2 ? c : "#f4f0a0"); R(x + 2, 48, 10, 4, "#f4f4f0"); });   // 花籃
    R(0, 0, W, 6, "#f4f4f0"); for (let x = 0; x < W; x += 16) R(x, 6, 8, 3, "#f4f4f0");   // 白色帳篷
    floor(76, "#8a8a86", "#7a7a76");
    if (o.dog !== false) dog(58, 100, "lie");
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    cai:  { skin:"#e8c8a8", hair:"#2a2220", hairStyle:"short", top:"#f4f4f0", coat:"#b8a070", bottom:"#3a3a40", mood:"worried", hello:"學長他……昨晚叫我先走的。" },
    liu:  { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", mood:"tired", hello:"我、我是第一個下去的。" },
    jian: { skin:"#d8b090", hair:"#6a6a66", hairStyle:"short", top:"#2e4a78", bottom:"#1e2a44", hat:"police", tie:"#1a2236", hello:"總卡的登記簿在這裡，每一筆都有簽名。" },
    tao:  { age:"old", skin:"#e0b48c", hair:"#8a8682", hairStyle:"bob", top:"#e88aa8", apron:"#3a6ac8", bottom:"#3a3a40", hello:"鄭仔昨晚還好好的……" },
    fang: { skin:"#c89a70", hair:"#9a9690", hairStyle:"balding", top:"#5a6a4a", bottom:"#3a3a2a", hat:"cap", capColor:"#4a5a3a", gloves:"#c8b890", hello:"我三年前就說了。" },
    du:   { skin:"#e8c8a8", hair:"#3a3430", hairStyle:"balding", top:"#f4f4f0", coat:"#6a5a48", bottom:"#4a3e30", tie:"#8a2a2a", glasses:true, sweat:true, hello:"總務科的事，有總務科的程序。" },
    ya:   { skin:"#f0d0b4", hair:"#2a2220", hairStyle:"pony", top:"#7ac0c8", bottom:"#7ac0c8", coat:"#e8e0d0", mood:"cry", hello:"我爸……他昨晚還跟我說話……" },
    kang: { skin:"#d8a880", hair:"#1e1a18", hairStyle:"pony", top:"#2e3e2e", bottom:"#2e3e2e", hat:"cap", capColor:"#2e3e2e", hello:"豆花，坐下。" },
    li:   { hello:"我只看證據。" },
    zhou: { hello:"查清楚。不要讓外面亂寫。" },
    qian: { hello:"我放首鄧麗君，你們別介意。" },
    xu:   { hello:"不要碰鐵架。一根都不要碰。" },
    wu:   { hello:"學長……老鄭昨天還借我膠帶。" },
    ye:   { hello:"每一步都要有紀錄。" }
  };
  ["li","zhou","qian","xu","wu","ye"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.li.top) Object.assign(LOOK.li, { skin:"#e8c09a", hair:"#1e1e1e", hairStyle:"slick", top:"#ffffff", bottom:"#1e2230" });
  if (!LOOK.zhou.top) Object.assign(LOOK.zhou, { skin:"#e0b48c", hair:"#4a4a4a", hairStyle:"short", top:"#f4f4f0", coat:"#6a6e74", bottom:"#3a3e46", tie:"#3a3a5a" });
  if (!LOOK.xu.top) Object.assign(LOOK.xu, { skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" });
  if (!LOOK.wu.top) Object.assign(LOOK.wu, { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050", glasses:true });
  if (!LOOK.qian.top) Object.assign(LOOK.qian, { age:"old", skin:"#e0b48c", hair:"#b8b8b0", hairStyle:"balding", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#2a2a30", glasses:true });
  if (!LOOK.ye.top) Object.assign(LOOK.ye, { skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"pony", top:"#f4f4f0", coat:"#6a6e74", bottom:"#6a6e74", skirt:true });
  LOOK.ye.mood = "tired"; LOOK.li.prop = undefined;
  const DAILY = {
    cai:  [ { room:"evoffice", x:60, pose:"sit", doing:"坐在前台的電腦前面，眼睛很紅。" }, { room:"evoffice", x:132, pose:"stand", doing:"站在排班表前面，看著那個被改過的格子。" }, { room:"b1hall", x:60, pose:"read", doing:"在走廊上抱著一疊盤點表。" } ],
    liu:  [ { room:"lobby", x:96, pose:"stand", doing:"站在值班台後面，一直看著樓梯口。" }, { room:"lobby", x:36, pose:"sit", doing:"下了班還沒走，坐在大廳的長椅上。" } ],
    jian: [ { room:"lobby", x:146, pose:"read", doing:"站在樓梯口，手上拿著總卡的登記簿。" }, { room:"pdesk", x:60, pose:"write", doing:"在刑大寫報告，寫了又劃掉。" } ],
    tao:  [ { room:"b1hall", x:40, pose:"broom", doing:"拿著拖把站在走廊，不敢往證物室那邊拖。" }, { room:"facility", x:60, pose:"stand", doing:"站在樓梯口，手上提著一個塑膠袋。" } ],
    fang: [ null, { room:"facility", x:130, pose:"stand", doing:"站在工作台前面，盯著那盒螺栓。" }, { room:"facility", x:90, pose:"sit", doing:"坐在工作台邊，把收音機關掉了。" } ],
    du:   [ null, { room:"admin", x:116, pose:"phone", doing:"坐在辦公桌後面，一直在講電話。" }, { room:"admin", x:62, pose:"stand", doing:"站在白板前面，看著那一行被畫掉的字。" } ],
    ya:   [ null, { room:"pdesk", x:140, pose:"sit", doing:"坐在你的桌子旁邊，還穿著醫院的制服。" }, { room:"zliving", x:90, pose:"read", doing:"站在餐桌旁邊，手上拿著一張影印紙。" } ],
    li:   [ { room:"b1hall", x:150, pose:"write", doing:"站在封鎖線裡面，在小本子上寫字。" }, { room:"evoffice", x:150, pose:"read", doing:"站在前台的鐵櫃前面翻清冊。" }, { room:"pdesk", x:172, pose:"stand", doing:"站在刑大門口，等你的結論。" } ],
    zhou: [ { room:"b1hall", x:20, pose:"stand", doing:"站在走廊口，一直看手錶。" }, { room:"pdesk", x:100, pose:"phone", doing:"在講電話，走到窗邊才接。" }, { room:"pdesk", x:40, pose:"cross", doing:"站在白板前面，看著那一排問號。" } ],
    kang: [ null, { room:"b1hall", x:80, pose:"stand", doing:"牽著豆花站在走廊上。" }, { room:"b1hall", x:80, pose:"stand", doing:"豆花趴在她腳邊，咬著一條鞋帶。" } ],
    qian: [ null, { room:"mroom", x:90, pose:"stand", doing:"站在解剖台旁邊，收音機在放鄧麗君。" } ],
    xu:   [ { room:"b1hall", x:98, pose:"stand", doing:"站在證物室門口，隔著小窗往裡面看。" }, { x:40, pose:"read", doing:"在實驗台前，用放大鏡看一顆斷掉的螺栓。" } ],
    wu:   [ { room:"lobby", x:40, pose:"stand", doing:"站在大門邊，臉色有點白。" }, { room:"pdesk", x:80, pose:"read", doing:"在電腦前面，接著老鄭的手機。" }, { room:"pdesk", x:80, pose:"read", doing:"抱著一疊剛到的調閱資料。" } ],
    ye:   [ null, { room:"b1hall", x:130, pose:"read", doing:"站在證物室門口，翻著勘驗指揮書。" }, { room:"pdesk", x:150, pose:"read", doing:"在你的桌子旁邊翻卷宗。" } ]
  };
  EP14.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  const shelfOpen = ["e_ye_fast","e_ye_proc"];
  EP14.rooms = {
    police: [
      { id:"pdesk", name:"3F 刑大", scene:"police", details:[
        { id:"d14_coffee", name:"你桌上的咖啡", hot:[60,62,10,8], text:"你的美式已經涼了。杯子底下壓著一張便條，小吳的字：「學長，老鄭的事……你要吃東西。」" } ] },
      { id:"admin", name:"2F 總務科", scene:"e_admin", phase:1, details:[
        { id:"d14_window", name:"窗外", hot:[110,12,36,22], text:"總務科的窗戶看得到警局後面的停車場。老鄭的銀色轎車還停在那裡。" } ] },
      { id:"lobby", name:"1F 值班台", scene:"e_lobby", opt:(ph) => ({ night:ph === 0 }), details:[
        { id:"d14_board", name:"大廳的公布欄", hot:[24,22,26,20], text:"公布欄上貼著「本局員工健行活動　10/18」，報名表上第一個名字是「鄭國華」，字寫得很大。" } ] },
      { id:"facility", name:"B1 樓梯口・營繕", scene:"e_facility", details:[
        { id:"d14_stairs", name:"往下的樓梯", hot:[0,20,40,40], text:"樓梯的扶手在水位線底下那一段，漆都掉光了，摸起來粗粗的。" } ] },
      { id:"b1hall", name:"B1 走廊", scene:"e_b1hall", opt:(ph) => ({ tape:true, sign:ph === 0, dog:ph >= 1, lit:true }), details:[
        { id:"d14_hydrant", name:"消防栓箱", hot:[152,34,14,20], text:"消防栓箱上半部是紅的，下半部鏽成咖啡色。檢查卡最後一次簽名是 2023 年 6 月。" } ] },
      { id:"evoffice", name:"B1 證物室前台", scene:"e_office", details:[
        { id:"d14_kettle", name:"小電熱水壺", hot:[4,40,10,8], text:"牆角有一個小電熱水壺，旁邊一罐泡麵，罐子上用麥克筆寫著「鄭」。" } ] },
      { id:"evshelf", name:"B1 證物室鐵架區", scene:"e_shelf", requires:shelfOpen, opt:(ph, has) => ({ body:ph === 0, outline:ph > 0, guncase:ph > 0 && has && has("e_dog"), dog:false }), details:[
        { id:"d14_glove", name:"地上的一隻棉紗手套", label:"地板", hot:[86,102,8,5], text:"一隻棉紗手套掉在地上，指尖的地方磨破了。是右手的。" } ] }
    ],
    lab: [ { id:"lab", name:"鑑識中心", scene:"lab", details:[
      { id:"d14_bolt", name:"桌上的放大鏡", hot:[140,40,16,10], text:"放大鏡底下是一顆斷掉的螺栓。許知夏在旁邊的便條上寫：「竹子」。" } ] } ],
    morgue: [ { id:"mroom", name:"法醫室", scene:"m13_morgue", details:[
      { id:"d14_radio", name:"收音機", hot:[18,42,16,8], text:"收音機在放〈小城故事〉。老錢說：「老鄭最喜歡這首。他每次來，都跟著哼。」" } ] } ],
    lot: [ { id:"lot", name:"員工停車場", scene:"e_lot", details:[
      { id:"d14_tape", name:"車位牌上的膠帶", label:"車位牌", hot:[110,20,6,4], text:"牌子的角用膠帶黏著。膠帶是證物室專用的那種，上面印著「證物封緘」。" } ] } ],
    zhenghome: [ { id:"zliving", name:"鄭家客廳", scene:"z_home", details:[
      { id:"d14_shoes", name:"鞋櫃", hot:[2,62,12,12], text:"鞋櫃最上層是一雙擦得很亮的皮鞋，鞋盒上寫著：「雅文升護理長那天穿」。" },
      { id:"d14_sofa", name:"舊沙發", hot:[126,46,50,16], text:"沙發的一邊陷得比較深，抱枕上有一圈洗不掉的髮油印。那是老鄭每天坐的位子。" },
      { id:"d14_fan", name:"電風扇", hot:[178,42,10,32], text:"電風扇的扇葉上積了一層灰，開關卡在「1」。" },
      { id:"d14_bottles", name:"一袋寶特瓶", hot:[43,63,14,11], text:"一袋壓扁的寶特瓶，綁得整整齊齊，等著拿去回收。" } ] } ]
  };
  // 檢察官到場以前，鐵架區的人物不能放在那裡
  const PS = [["e_b1hall",{ tape:true, lit:true }],["e_office",{}],["e_shelf",{ body:false, outline:true }]];
  EP14.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 監視器動畫 ---------- */
  const zhengLook = { skin:"#d8b090", hair:"#8a8a86", hairStyle:"balding", top:"#e8e4d8", coat:"#2a3a6a", bottom:"#3a3a40" };
  EP14.looks = {
    zhengC: zhengLook, zhengW: Object.assign({}, zhengLook, { coat:undefined, gloves:"#e8e4d8" }),
    caiC: Object.assign({}, LOOK.cai, { hello:undefined }), taoC: Object.assign({}, LOOK.tao, { hello:undefined }),
    liuC: Object.assign({}, LOOK.liu, { hello:undefined }), jianC: Object.assign({}, LOOK.jian, { hello:undefined }),
    emtC: { skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#e8763a", bottom:"#2a2a30" }
  };
  const ANIM = {
    cctv_b1: { scene:"e_b1hall", opt:{ cam:true, lit:true }, cam:"B1-CAM01", date:"2026-09-24", beats:[
      { t:"17:31:20", d:3.5, cap:"蔡明宏刷卡從證物室出來，往走廊口走。", m:{ caiC:[-20,98,"walk1",-1,126,98] }, out:["caiC"] },
      { t:"19:02:10", d:3.5, cap:"鄭國華刷卡出來，往走廊口走。", m:{ zhengC:[-20,98,"walk2",-1,126,98] }, out:["zhengC"] },
      { t:"19:41:30", d:4.5, cap:"鄭國華提著一個塑膠袋回來，刷卡，進證物室。", m:{ zhengC:[126,98,"hold",1,-20,98] }, out:["zhengC"] },
      { t:"22:08:00", d:4.5, cap:"清潔員拖地拖到證物室門口，停下來從小窗往裡看，敲了兩下窗戶。", st:{ sign:false }, m:{ taoC:[118,98,"broom",1,30,98] } },
      { t:"22:20:10", d:3.5, cap:"她把「小心地滑」的牌子靠在牆邊，上樓。", st:{ sign:true }, m:{ taoC:[-20,98,"walk1",-1,118,98] }, out:["taoC"] },
      { t:"22:40:05", d:4, cap:"22:40，她下來，走到證物室門口，站了十幾秒。", st:{ sign:true }, m:{ taoC:[110,98,"stand",1,-20,98] } },
      { t:"22:40:30", d:3.5, cap:"她拿起「小心地滑」的牌子，往走廊口走，上樓。", st:{ sign:false }, m:{ taoC:[-20,98,"walk1",-1,110,98] }, out:["taoC"] },
      { t:"23:30:00", d:3, cap:"22:41 到 01:57，沒有任何人出現。", st:{ sign:false } },
      { t:"01:58:05", d:3.5, cap:"01:58，畫面輕輕晃了一下，天花板的燈管掉下一點灰。", st:{ sign:false, shake:true } },
      { t:"02:03:10", d:4, cap:"02:03，劉建志從走廊口跑過來，刷卡，門打不開。他趴在小窗上往裡看。", st:{ sign:false }, m:{ liuC:[120,98,"walk1",1,-20,98] } },
      { t:"02:04:00", d:3, cap:"他轉身往走廊口跑回去。", st:{ sign:false }, m:{ liuC:[-20,98,"walk2",-1,120,98] }, out:["liuC"] },
      { t:"02:09:00", d:4.5, cap:"02:09，簡永昌和劉建志跑過來，簡永昌刷總卡，開門衝進去。", st:{ sign:false }, m:{ jianC:[132,98,"walk1",1,-20,98], liuC:[116,98,"walk2",1,-36,98] }, out:["jianC","liuC"] }
    ] },
    cctv_lobby: { scene:"e_lobby", opt:{ cam:true, night:true }, cam:"1F-CAM02", date:"2026-09-25", beats:[
      { t:"01:57:02", d:4, cap:"劉建志接起電話，一邊講一邊在值班日誌上寫字。", m:{ liuC:[90,74,"phone",1] } },
      { t:"01:58:05", d:4, cap:"01:58，桌上的茶杯晃了一下。他低頭看地板，電話還貼在耳朵上。", m:{ liuC:[90,74,"phone",-1] } },
      { t:"02:02:20", d:4, cap:"02:02，他放下電話，從值班台後面跑出來，往右邊的樓梯跑下去。", m:{ liuC:[196,98,"walk1",1,90,74,[[150,74],[156,98]]] }, out:["liuC"] },
      { t:"02:04:30", d:4, cap:"02:04，他從樓梯跑上來，往左邊後面的值日官室跑。", m:{ liuC:[-20,98,"walk2",-1,196,98] }, out:["liuC"] },
      { t:"02:07:10", d:4.5, cap:"02:07，他和簡永昌一起跑回來，往樓梯下去。簡永昌手上拿著一張卡。", m:{ jianC:[196,98,"walk1",1,-20,98], liuC:[196,98,"walk2",1,-40,98] }, out:["jianC","liuC"] }
    ] },
    cctv_b2: { scene:"e_lot", opt:{ cam:true, day:false, trunk:false }, cam:"P-CAM01", date:"2026-09-23", beats:[
      { t:"19:08:10", d:4.5, cap:"後門打開。鄭國華雙手抱著一個紙箱走出來，走幾步就停一下，用膝蓋頂一下箱子。", m:{ zhengC:[70,98,"hold@box",1,24,90] } },
      { t:"19:10:00", d:4.5, cap:"他走到銀色轎車後面，把箱子放在地上，打開後車廂，再彎腰把箱子抱進去。", m:{ zhengC:[160,98,["hold@box","kneel+hold@box","kneel+hold@box","hold@box"],-1,70,98] } },
      { t:"19:11:40", d:3.5, cap:"他扶著腰站起來，關上後車廂。", m:{ zhengC:[160,98,"stand",-1] } },
      { t:"19:12:20", d:4, cap:"他走到駕駛座那邊，上車。", m:{ zhengC:[86,98,"walk1",-1,160,98] }, out:["zhengC"] },
      { t:"19:12:50", d:3, cap:"銀色轎車開走了。", st:{ car:false } }
    ] }
  };
  Object.values(ANIM).forEach(A => { if (A.beats.some(b => b.st)) A.opt = Object.assign({}, A.opt || {}, { seq:A.beats.map(b => Object.assign({}, A.opt || {}, b.st || {})), ds:jds(A.beats) }); });
  // 走廊場景要讀動畫裡每一拍的狀態
  const hallBase = SC.e_b1hall; SC.e_b1hall = (o) => hallBase(Object.assign({}, o, stOf(o)));
  [...EP14.cctv, ...EP14.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案 ---------- */
  // 梯子立在 x82–98；老鄭站在第四階時腳在 y≈74（地面 98）
  const RB = [
    { t:"22:05:00", d:5, cap:"9 月 24 日晚上。老鄭戴上棉紗手套，把 C-3 底層前排的紙箱，一箱一箱搬出來。", st:{ fallen:false, ladder:"up", top:0, front:4 }, m:{ zhengW:[118,98,["kneel+hold@box","hold@box","kneel+hold@box","hold@box"],-1,150,98] } },
      { t:"22:10:00", d:5.5, cap:"他雙手抱著箱子爬上梯子，一箱一箱疊到頂層。門外的阿桃姨敲窗叫他不要爬，他揮揮手。", st:{ fallen:false, ladder:"up", top:7, front:2 }, m:{ zhengW:[90,76,"hold@box",1,118,98,[[90,98]]] } },
    { t:"23:00:00", d:4.5, cap:"23:00，前排 14 箱都上去了。頂層塞得滿滿的——銘牌寫著每層 80 公斤，上面是 212 公斤。", st:{ fallen:false, ladder:"up", top:14, front:0 }, m:{ zhengW:[120,98,"stand",-1,90,76,[[90,98]]] } },
    { t:"00:12:00", d:5, cap:"他蹲在底層，對著清冊，一箱一箱拍後排的舊箱子。23:54 他回了小蔡的訊息：「好，你顧小孩。」", st:{ fallen:false, ladder:"up", top:14, front:0 }, m:{ zhengW:[124,98,"kneel+cam",-1,120,98] } },
    { t:"01:57:30", d:5, cap:"01:57，他爬上梯子第四階，把頂層最裡面一箱往外拉，舉起手機拍標籤。", st:{ fallen:false, ladder:"up", top:14, front:0 }, m:{ zhengW:[90,70,"phone",1,124,98,[[90,98]]] } },
    { t:"01:57:40", d:5, cap:"重心往前一移——泡過水、鏽了九成的下排螺栓斷了。鐵架往前一傾，他伸手抓住立柱。", st:{ fallen:false, ladder:"up", top:14, front:0, tilt:true }, m:{ zhengW:[90,70,"point",1] }, out:["zhengW"] },
    { t:"01:57:42", d:4.5, cap:"上排的壁虎整排從牆裡拔出來。鐵架往走道倒下，連人帶梯子壓在底下。", st:{ fallen:true, body:true } },
    { t:"01:58:00", d:4, cap:"01:58。一樓值班台的茶杯晃了一下。地下室，只剩下相機還開著。", st:{ fallen:true, body:true } },
    { t:"02:09:00", d:4.5, cap:"02:09，簡永昌用總卡打開門。19:41 以後，這是第一次有人打開這扇門。", st:{ fallen:true, body:true }, m:{ jianC:[160,98,"walk1",-1,200,98], liuC:[176,98,"walk2",-1,216,98] } }
  ];
  EP14.court = {
    title: "證物室・9 月 26 日中午", scene: "e_shelf", opt:{ body:false, outline:true },
    who: ph => ["cai","liu","jian","tao","fang","du","ya","zhou"],
    open: ph => "11:50，B1 證物室。倒下的 C-3 還斜斜地靠在 C-2 上。黎光耀站在鐵網門邊，手上拿著小本子。周隊長、杜科長、老方、小蔡、阿桃姨都在。雅文站在最後面，手上抱著她爸爸的夾克。",
    kindLine: {
      accident: "老鄭不是被人殺的。是這座鐵架，自己倒下來的。",
      murder: "老鄭不是意外死的。有人讓這座鐵架倒在他身上。",
      suicide: "老鄭是自己把鐵架拉倒的。"
    },
    kindTrue: "門禁紀錄、走廊監視器、梯子上的鞋印、箱子上的指紋——19:41 以後，證物室裡只有老鄭一個人。頂層的 14 箱是他自己搬上去的，212 公斤。下排的螺栓在水位線底下鏽了三年，報修了三次。……沒有人推他。只是三年來，沒有人去換那四顆螺栓。",
    murmur: [ "（小蔡一直在摳識別證的邊。）", "（老方看著那盒寫著「C 排」的螺栓。）", "（杜科長把領帶拉鬆了一點。）" ],
    confess: {},
    cornered: {},
    deny: {
      cai: "學長是我師父……我怎麼可能……",
      liu: "我、我只是去接電話……",
      jian: "總卡的登記簿，每一筆都有簽名。",
      tao: "我只是拖地啊……",
      fang: "我沒有卡。我三年前就說要換了。",
      du: "我是批了緩辦。可是我沒有……我沒有進去過。",
      ya: "……我是他女兒。",
      zhou: "查清楚。查我也可以，查清楚。"
    },
    replayText: "9 月 24 日晚上，證物室。老鄭戴上棉紗手套——",
    replay: { scene:"e_shelf", ladders:[[90,70,98]], opt:{ seq:RB.map(b => b.st), ds:jds(RB) }, clean:true, cam:"事發經過重現", date:"2026-09-24", beats:RB },
    endGood: "12:00，黎光耀在報告上寫：「意外。查無他殺。」\n他停了一下，又加了一行：「總務科三次報修未處理，另案移送。」\n下午，方德勝一個人把 C 排每一座鐵架的螺栓都換掉了。他沒有報加班。\n群組裡，那則「滅口」的訊息，再也沒有人回。",
    endBad: "12:00，案子以「他殺嫌疑」移送。群組裡的人說：「果然。」\n沒有人再去看那些螺栓。\n兩個禮拜後的一個晚上，C-2 也倒了。那天，剛好沒有人在裡面。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[14] && ARC_INTER[14].after) EP14.after = Object.assign({}, ARC_INTER[14].after, { scene:"funeral" });

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP14.outScenes = ["e_lot"];
  EP14.fac = { police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], morgue:["#d8e0e0","#5a7a8a"], lot:["#a8a49a","#5a6470"], zhenghome:["#e0d4bc","#8a6a4a"] };
  EP14.setting = { police:"city", lab:"city", morgue:"city", lot:"city", zhenghome:"town" };
  const SKY14 = [ ["#0a0f1c","#24304a","#2a3040","#323a4a",0,0], ["#9ab0c4","#d8e0e4","#4a6070","#56707a",0,0], ["#a8c4dc","#eef0ec","#4a6070","#56707a",0,0] ];
  EP14.worldSky = ph => SKY14[Math.min(ph || 0, SKY14.length - 1)];
  EP14.worldOrder = { police:["pdesk","admin","lobby","facility","b1hall","evoffice","evshelf"] };
  EP14.roomDesc = {
    pdesk:"三樓刑大。你的位子。", admin:"二樓總務科。冷氣開得很強。", lobby:"一樓值班台。往地下室的樓梯在右邊。", facility:"B1 樓梯口，旁邊是營繕的工作台。",
    b1hall:"B1 走廊。證物室的門在中間。", evoffice:"證物室的前台。雙向刷卡的門在後面。", evshelf:"證物室的鐵架區。C 排。", lab:"鑑識中心。", mroom:"法醫室。收音機在放老歌。",
    lot:"警局後面的員工停車場。", zliving:"鄭家的客廳，在港邊的老公寓二樓。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police" };
  EP14.world = {};
  EP14.locations.forEach(l => { EP14.world[l.id] = { auto:true, you:YOU, order:(EP14.worldOrder || {})[l.id] }; });
  Object.assign(EP14.world.police, {
    extras: [
      { id:"cop14", name:"守封鎖線的員警", phase:0, until:0, x:RX(4) + 70, L:COP, pose:"stand", facing:-1, lines:[
        "督察說，鐵架區要等檢察官來。前台和走廊可以看。", "救護車 02:25 就走了。……人還在裡面，沒有移。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長……是證物室的老鄭。鄭國華。三十年都在地下室管證物的那個。", "小吳"),
      say("wu", "01:58 一樓聽到很大一聲。值班的劉建志下去，門刷不開，從小窗看到鐵架倒了，人壓在底下。", "小吳"),
      say("wu", "督察組已經到了，把證物室封起來。上禮拜 KTV 那包東西才查到是證物室出去的……現在大家都在看。", "小吳"),
      say("you", "大家想看到什麼，我們不管。我們只看那扇門、那座鐵架，和那一晚。", "你"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳")
    ]
  });
  EP14.mapPos = { police:[110,56,"u"], lot:[136,46,"r"], lab:[170,80,"d"], morgue:[186,100,"r"], zhenghome:[56,96,"d"] };
  EP14.mapRoads = [["police","lot"],["police","lab"],["lab","morgue"],["police","zhenghome"]];
  EP14.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 40; x < 200; x += 8) for (let y = 20; y < 110; y += 7){ R(x, y, 6, 5, "#c8c0b0"); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, "#b0a898"); }
    R(0, 112, 240, 23, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 113 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");
    R(102, 48, 16, 10, "#cfcabb"); R(104, 46, 12, 3, "#3f5a7a"); R(108, 50, 4, 3, "#e8c040");   // 警察局
  };
})();
