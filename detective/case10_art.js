/* =========================================================
   第 10 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP10.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, OBJ, windowBox, door, sign, lamp, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return [{}, 0]; const [i, p] = beatAt(o.t || 0, o.ds); return [(o.seq || [])[i] || {}, p]; };
  const terrazzo = (y, c) => { R(0, y, W, H - y, c); for (let k = 0; k < 160; k++) P((k * 37) % W, y + 1 + (k * 23) % (H - y - 1), ["#d8d0c0", "#8a8478", "#b8b0a0"][k % 3]); R(0, y, W, 1, "#5a564e"); };
  const bars = (x, y, w, h) => { for (let k = 0; k < w; k += 5) R(x + k, y, 1, h, "#3a3a32"); R(x, y, w, 1, "#3a3a32"); R(x, y + h - 1, w, 1, "#3a3a32"); };
  const shutter = (x, y, w, h, c) => { R(x, y, w, h, c || "#8a8e90"); for (let k = 2; k < h; k += 3) R(x, y + k, w, 1, "#6a6e70"); R(x, y + h - 2, w, 2, "#4a4e50"); };
  const ironDoor = (x, y, w, h, c) => { door(x, y, w, h, c || "#5a6a5a"); for (let k = 4; k < w - 2; k += 4) R(x + k, y + 3, 1, h - 6, PR.shade ? PR.shade(c || "#5a6a5a", -.2) : "#4a5a4a"); R(x + 2, y + 6, w - 4, 1, "#3a4a3a"); R(x + 2, y + h - 8, w - 4, 1, "#3a4a3a"); };
  const chunlian = (x, y, h) => { R(x, y, 4, h, "#c23a2a"); for (let k = 3; k < h - 2; k += 5) R(x + 1, y + k, 2, 2, "#e8c040"); };
  const bundle = (x, y) => { R(x, y, 18, 7, "#2a4a8a"); R(x + 2, y + 1, 14, 2, "#3a5aa0"); R(x + 7, y - 2, 4, 3, "#2a4a8a"); P(x + 3, y + 5, "#e8c040"); };

  /* ---------- 澄港：遠興當舖 ---------- */
  // 前廳・櫃台
  SC.p_front = (o) => {
    wall(72, "#3a4a44", false); dither(0, 0, W, 72, "#344440", 5); R(0, 64, W, 8, "#2a2a24");
    R(4, 12, 34, 50, "#4a3424"); for (let r = 0; r < 4; r++) R(4, 22 + r * 12, 34, 2, "#2a1a10");   // 流當品的架子
    R(8, 12, 6, 10, "#c23a2a"); R(10, 8, 2, 4, "#5a3a24"); R(18, 16, 10, 6, "#e8e8e0"); R(20, 15, 6, 1, "#a8a8a0"); R(8, 28, 8, 6, "#e8c040"); R(22, 30, 10, 4, "#6a6a6a"); R(10, 40, 20, 6, "#3a3a5a"); R(8, 52, 8, 8, "#8a6a3a"); R(24, 52, 10, 8, "#c8c8c0");
    R(40, 50, 110, 22, "#5a3a24"); R(38, 48, 114, 3, "#7a5a34"); for (let k = 0; k < 6; k++) R(44 + k * 18, 54, 14, 14, "#4a2e1c");   // 高櫃台
    bars(40, 12, 110, 22);   // 櫃台上方的鐵欄杆
    R(58, 46, 22, 2, "#c8a040"); R(68, 36, 2, 10, "#c8a040"); R(60, 36, 18, 1, "#c8a040"); R(58, 38, 5, 2, "#c8a040"); R(75, 38, 5, 2, "#c8a040");   // 天平
    R(82, 44, 12, 4, "#8a1a1a"); for (let k = 0; k < 5; k++) R(83 + k * 2, 45, 1, 2, "#e8c040"); if (!o.weightBack) R(91, 45, 2, 2, "#5a0a0a");   // 砝碼盒（少一顆）
    R(96, 44, 16, 4, "#e8e0c8"); R(96, 44, 8, 4, "#d8d0b8"); R(104, 44, 1, 4, "#8a8070");   // 估價簿
    R(150, 18, 22, 16, "#2a2a2e"); R(152, 20, 18, 12, "#1a2a2a"); for (let k = 0; k < 12; k += 2) R(152, 20 + k, 18, 1, "#00000033"); R(154, 22, 6, 4, "#3a4a4a");   // 監視器主機
    R(160, 40, 26, 30, "#2a2a2a"); R(162, 42, 22, 28, "#4a4a4a"); txt("當", 166, 58, "#c23a2a", "12px serif");   // 大「當」字
    lamp(96, 0, "#f8d898");
    floor(72, "#5a4a3a", "#4a3a2a");
  };
  // 後面的辦公室
  SC.p_back = (o) => {
    wall(72, "#6a6a5a", false); R(0, 64, W, 8, "#4a4a3a");
    R(10, 40, 26, 32, "#3a3a3a"); R(12, 42, 22, 28, "#4a4a4a"); R(20, 52, 6, 6, "#8a8a8a"); P(23, 55, "#2a2a2a"); R(30, 50, 2, 8, "#8a8a8a");   // 保險箱
    R(44, 16, 18, 16, "#6b4a2b"); R(46, 18, 14, 12, "#c8b890"); R(48, 20, 4, 8, "#5a4a3a"); R(54, 21, 4, 7, "#8a6a5a");   // 照片
    R(70, 50, 72, 3, "#6b4a2b"); R(70, 50, 72, 1, "#8a6338"); R(72, 53, 3, 19, "#5a3e24"); R(98, 53, 44, 19, "#5a3e24"); R(100, 58, 16, 6, "#6b4a2b"); R(124, 60, 14, 6, "#6b4a2b"); P(108, 61, "#c8a040"); P(131, 63, "#c8a040");   // 辦公桌、抽屜
    R(76, 46, 22, 4, "#7a9a6a"); for (let k = 0; k < 4; k++) R(77 + k * 5, 45, 4, 5, "#8aaa7a"); R(86, 46, 2, 4, "#c23a2a");   // 現金
    R(120, 46, 16, 4, "#1a1a1a"); R(121, 46, 14, 1, "#3a3a3a"); R(120, 46, 2, 4, "#f4f0e0");   // 帳本
    R(80, 30, 8, 12, "#3a2a1a"); R(78, 42, 12, 8, "#5a3a24");   // 辦公椅背
    door(166, 32, 20, 42, o.ajar ? "#2a2a2a" : "#5a5e64"); R(168, 46, 2, 6, "#8a8a8a"); R(162, 40, 2, 6, "#c8a040"); P(162, 46, "#c8a040");   // 後門、釘子上的鑰匙
    lamp(100, 0, "#e8e0c8");
    floor(72, "#6a5a48", "#5a4a3a");
    if (o.body){ R(84, 38, 18, 10, "#e8e0c8"); R(96, 40, 9, 8, "#d8a880"); R(96, 39, 9, 2, "#8a8a84"); R(98, 40, 4, 3, "#7a1a1a"); R(104, 46, 6, 2, "#d8a880"); R(108, 45, 4, 1, "#3a3a8a");
      OBJ.blood(100, 47, 10); OBJ.blood(112, 74, 14); }
    if (!o.clean){ R(144, 88, 4, 3, "#5a1a1a"); R(149, 90, 3, 2, "#5a1a1a"); for (let k = 0; k < 4; k++) P(144 + k * 3, 89 + (k % 2), "#3a0a0a"); }
    if (o.markers){ OBJ.marker(140, 96); OBJ.marker(118, 40); OBJ.marker(172, 60); }
  };
  // 後巷
  SC.p_alley = (o) => {
    R(0, 0, W, H, "#1a1a20"); R(0, 0, W, 74, "#4a4a48"); for (let y = 0; y < 74; y += 6) for (let x = (y / 6 % 2) * 8; x < W; x += 16) R(x, y, 15, 5, "#545450");
    R(0, 0, W, 6, "#0e0e14");
    door(20, 32, 20, 42, "#5a5e64"); R(16, 26, 28, 4, "#3a3a3a");   // 當舖後門
    R(80, 30, 16, 12, "#e8e8e0"); R(82, 32, 12, 1, "#3a3a3a"); R(82, 35, 10, 1, "#3a3a3a"); R(82, 38, 8, 1, "#c23a2a");   // 收垃圾告示
    door(148, 32, 20, 42, "#6a5a3a"); R(144, 26, 28, 4, "#3a3a3a"); R(140, 60, 6, 14, "#8a8a8a"); R(172, 58, 10, 16, "#9aa6ae"); R(184, 62, 8, 12, "#9aa6ae");   // 魚丸店後門、鐵桶
    R(0, 50, 6, 24, "#3a3a3a"); R(118, 4, 2, 70, "#3a3a3a");   // 水管
    lamp(60, 0, "#e8d8a8");
    R(0, 74, W, 34, "#3a3a3a"); dither(0, 74, W, 34, "#2a2a2a", 3);
    for (let k = 0; k < 6; k++) R(10 + k * 32, 80 + (k % 3) * 6, 18, 2, "#5a6a7a");   // 水漬
    if (!o.noBags){ R(44, 84, 10, 12, "#1a1a1a"); R(54, 86, 10, 10, "#2a2a2a"); R(48, 82, 2, 2, "#3a3a3a"); }
    if (!o.clean) for (let k = 0; k < 7; k++) R(74 + k * 8, 92 - (k % 2) * 3, 3, 2, "#1a1a1a");   // 小鞋印，往右（港口路）
    txt("→ 港口路", 150, 104, "#8a8a8a", "5px sans-serif");
  };
  // 魚丸店（後面的廚房）
  SC.p_fish = (o) => {
    wall(72, "#d8d8c8", false); for (let y = 0; y < 72; y += 8) for (let x = (y / 8) % 2 * 8; x < W; x += 16) R(x, y, 15, 7, "#e8e8d8");
    R(20, 40, 40, 30, "#b8b8b0"); R(24, 34, 32, 8, "#a8a8a0"); R(30, 28, 20, 6, "#e8e8e0");   // 大鍋
    for (let k = 0; k < 3; k++) R(64 + k * 12, 54, 10, 16, "#9aa6ae");   // 鐵桶
    door(150, 30, 22, 44, "#6a5a3a"); R(152, 34, 18, 12, "#2a2a30");   // 後門（玻璃）
    R(110, 20, 30, 20, "#e8c040"); txt("阿枝魚丸", 112, 32, "#c23a2a", "6px sans-serif");
    lamp(96, 0, "#f8e8c8");
    floor(72, "#8a8a80", "#7a7a72");
  };
  // 當舖門口的騎樓（監視器用）
  const PDOOR = 96;
  SC.p_out = (o) => { const [s, p] = stOf(o), sh = s.shutUp ? p : s.shut === undefined ? (o.shut || 0) : s.shut;
    R(0, 0, W, H, "#1a1a20"); R(0, 0, W, 14, "#2a2a30");
    R(56, 4, 80, 12, "#5a1a1a"); txt("遠興當舖", 72, 13, "#e8c040", "8px serif");
    R(70, 22, 52, 52, "#d8c8a0"); R(72, 24, 48, 48, "#e8d8b0"); R(84, 34, 24, 40, "#c8a878"); txt("當", 90, 52, "#c23a2a", "10px serif");   // 店門
    if (sh > 0) shutter(70, 22, 52, Math.round(52 * sh));
    if (s.shutUp && sh > 0.05 && sh < 0.97){ const y = 22 + Math.round(52 * sh); R(93, y, 5, 2, "#d8a880"); R(99, y, 5, 2, "#d8a880"); R(91, y + 2, 15, 4, "#e8e0c8"); }   // 從裡面拉鐵門的手和袖子（馮志遠）
    R(20, 14, 8, 60, "#6a6a62"); R(164, 14, 8, 60, "#6a6a62");   // 騎樓柱子
    R(30, 30, 30, 30, "#2a2a2a"); R(32, 32, 26, 26, "#3a3a2a");   // 隔壁的鐵門
    R(130, 30, 30, 30, "#3a3a3a"); txt("阿枝", 136, 40, "#e8c040", "6px sans-serif");
    lamp(44, 14, "#f8e8b8");
    R(0, 74, W, 34, "#4a4a44"); for (let x = 0; x < W; x += 16) R(x, 74, 1, 34, "#3a3a34");
    txt("後巷 →", 160, 104, "#8a8a8a", "5px sans-serif");
  };

  /* ---------- 澄港：海口小館 ---------- */
  const table = (x, y, w) => { R(x, y, w, 3, "#e8e8e0"); R(x + 2, y + 3, 2, 14, "#5a5a5a"); R(x + w - 4, y + 3, 2, 14, "#5a5a5a"); R(x - 4, y + 6, 4, 10, "#c23a2a"); R(x + w, y + 6, 4, 10, "#c23a2a"); };
  const wok = (x, y, fire) => { R(x, y, 40, 22, "#5a5a5e"); R(x + 2, y - 2, 36, 3, "#7a7a7e"); R(x + 6, y - 6, 14, 5, "#2a2a2a"); R(x + 22, y - 5, 12, 4, "#3a3a3a"); if (fire) for (let k = 0; k < 6; k++) P(x + 8 + k * 2, y - 1 - (k % 2), k % 2 ? "#e8a040" : "#4a8ae8"); };
  SC.r_hall = (o) => { const [s] = stOf(o), split = o.split;
    wall(72, "#e8dcc0", false); R(0, 60, W, 12, "#6b4a2b");
    if (!split){
      windowBox(10, 14, 40, 26, "#2a3a4a"); table(18, 56, 30);   // 2 號桌（靠窗）
      R(70, 14, 30, 20, "#f4f4f0"); R(72, 17, 20, 1, "#3a3a8a"); R(72, 21, 26, 1, "#3a3a3a"); R(72, 25, 22, 1, "#3a3a3a"); R(72, 29, 14, 1, "#c23a2a");   // 訂位白板
      table(70, 58, 34); table(112, 58, 30);
      R(106, 24, 36, 18, "#1a1a1a"); R(108, 26, 32, 14, "#3a3a3a"); R(108, 38, 32, 4, "#c8c8c0");   // 出菜口
      R(152, 50, 38, 22, "#6b4a2b"); R(150, 48, 42, 3, "#8a6a3a"); R(160, 44, 8, 4, "#e8e8e0"); R(172, 44, 6, 4, "#f4e48a");   // 櫃台、收據
      R(168, 22, 18, 14, "#2a2a2e"); R(170, 24, 14, 10, "#1a2a2a");   // 監視器螢幕
      R(116, 6, 60, 10, "#c23a2a"); txt("清蒸午仔魚 380", 120, 14, "#f4f0e0", "6px sans-serif");
    } else {
      windowBox(10, 14, 40, 26, "#2a3a4a"); table(18, 56, 30); table(70, 58, 34);
      R(100, 24, 18, 18, "#1a1a1a"); R(102, 26, 14, 14, "#3a3a3a");   // 出菜口（左邊看過去）
      R(120, 0, 3, H, "#0a0a0a");   // 分割畫面
      R(123, 0, 69, 74, "#c8c8c0"); for (let y = 0; y < 74; y += 8) for (let x = 123 + (y / 8) % 2 * 8; x < W; x += 16) R(x, y, 15, 7, "#d8d8d0");
      wok(140, 52, true); R(123, 74, 69, 34, "#7a7a72");
      txt("CAM2 廚房", 126, 8, "#e8e8e0", "5px monospace");
    }
    lamp(60, 0, "#f8e8c8");
    if (!split) floor(72, "#8a6a4a", "#7a5a3a"); else { R(0, 72, 120, 36, "#8a6a4a"); for (let x = 0; x < 120; x += 16) R(x, 72, 1, 36, "#7a5a3a"); }
    if (s.fish) { R(26, 54, 12, 3, "#e8e8e0"); R(28, 53, 8, 2, "#c8c8b8"); }
  };
  SC.r_kitchen = (o) => {
    wall(72, "#c8c8c0", false); for (let y = 0; y < 72; y += 8) for (let x = (y / 8) % 2 * 8; x < W; x += 16) R(x, y, 15, 7, "#d8d8d0");
    R(18, 58, 34, 14, "#b8b8b8"); R(16, 56, 38, 3, "#d8d8d8"); for (let k = 0; k < 8; k++) P(22 + k * 4, 60 + (k % 2) * 3, "#e8f0f4"); R(40, 50, 10, 6, "#e8e8e0");   // 殺魚台、魚鱗桶
    wok(70, 52, false); R(70, 14, 40, 20, "#8a8a8a"); R(72, 16, 36, 4, "#6a6a6a");   // 爐子、抽油煙機
    R(120, 30, 24, 40, "#d8d8d8"); R(122, 32, 20, 16, "#c8c8c8");   // 冰箱
    R(150, 56, 24, 16, "#6b4a2b"); for (let k = 0; k < 4; k++){ R(152 + k * 6, 58, 4, 4, k === 1 ? "#5a3e24" : "#1a1a1a"); R(152 + k * 6, 65, 4, 4, "#1a1a1a"); }   // 鞋架（第二格空）
    door(176, 30, 14, 44, "#5a5e64");
    lamp(96, 0, "#f8f8e8");
    floor(72, "#7a7a72", "#6a6a62"); for (let k = 0; k < 10; k++) P(20 + k * 9, 76 + (k % 3) * 4, "#e8f0f4");
  };
  SC.r_office = (o) => {
    wall(72, "#d8ccb0", false);
    OBJ.desk(60, 58, 60); R(80, 52, 22, 6, "#2a2a2e"); R(81, 53, 20, 4, "#c8a868"); for (let k = 0; k < 3; k++) P(84 + k * 6, 55, "#c23a2a");   // 平板（象棋）
    for (let k = 0; k < 6; k++){ R(120 + (k % 3) * 10, 30 + Math.floor(k / 3) * 10, 9, 9, k === 0 ? "#f4e8e8" : "#f4f0e0"); R(124 + (k % 3) * 10, 30 + Math.floor(k / 3) * 10, 1, 2, "#3a3a3a"); }   // 帳單
    R(20, 14, 30, 30, "#f4f0e0"); txt("8", 30, 34, "#c23a2a", "12px sans-serif");   // 月曆
    lamp(96, 0, "#f8e8c8");
    floor(72, "#8a6a4a", "#7a5a3a");
  };

  /* ---------- 高鐵站 ---------- */
  SC.s_plat = (o) => { const [s, p] = stOf(o), train = s.train === undefined ? o.train : s.train;
    R(0, 0, W, H, "#2a2e34"); R(0, 0, W, 8, "#1a1e24"); for (let x = 0; x < W; x += 24) R(x, 0, 2, 70, "#3a3e44");
    R(0, 60, W, 12, "#3a3a3a"); R(0, 66, W, 2, "#8a8a8a");   // 軌道
    if (train){ R(0, 22, W, 44, "#f4f4f0"); R(0, 30, W, 8, "#3a3a3a"); R(0, 46, W, 3, "#e86a2a"); for (let x = 6; x < W; x += 30) R(x, 31, 18, 6, "#5a7a9a"); [40, 140].forEach(x => { R(x, 30, 14, 34, "#e8e8e4"); R(x + 6, 30, 1, 34, "#b8b8b4"); }); }
    R(120, 6, 40, 14, "#1a1a1a"); txt(o.tpe ? "到站" : "23:30 台北", 123, 15, "#e8a040", "6px monospace");   // 電子看板
    R(10, 6, 30, 10, "#e8e8e0"); txt(o.tpe ? "台北 Taipei" : "澄港", 12, 13, "#3a3a3a", "6px sans-serif");
    R(0, 72, W, 36, "#9a9a92"); R(0, 72, W, 3, "#e8c040"); for (let x = 0; x < W; x += 12) R(x, 76, 1, 32, "#8a8a82");
    txt("5", 66, 86, "#3a3a3a", "7px sans-serif"); txt("9", 166, 86, "#3a3a3a", "7px sans-serif");
    R(60, 58, 14, 16, "#5a6a6a"); R(61, 59, 12, 3, "#3a4a4a"); txt("2", 65, 70, "#e8e8e0", "5px sans-serif");   // 2 號垃圾桶
    lamp(96, 0, "#f8f8e8"); lamp(178, 0, "#f8f8e8");
  };
  SC.s_office = (o) => {
    wall(72, "#d8dcdc", false); R(0, 64, W, 8, "#8a8e8e");
    OBJ.desk(60, 58, 70); if (!o.empty) bundle(82, 51);   // 藍布包
    R(140, 18, 24, 16, "#2a2a2e"); R(142, 20, 20, 12, "#1a2a3a");   // 監視器
    R(20, 14, 30, 40, "#e8e8e0"); for (let k = 0; k < 8; k++) R(22, 18 + k * 4, 26, 1, "#3a3a3a");   // 班表
    R(170, 30, 16, 42, "#4a5a6a");
    lamp(96, 0, "#f8f8f0");
    floor(72, "#9a9e9e", "#8a8e8e");
  };

  /* ---------- 澄港刑大的法醫室：用 morgue ---------- */

  /* ---------- 台北：西園路的老公寓 ---------- */
  const steps = (x0, y0, n, dx, dy, c) => { for (let k = 0; k < n; k++){ R(x0 + k * dx, y0 - k * dy, dx + 1, 3 + k * dy, c); R(x0 + k * dx, y0 - k * dy, dx + 1, 1, "#e8e0d0"); } };
  SC.tp_stair = (o) => { const f = o.floor || "1";
    wall(74, "#d8d0b8", false); dither(0, 0, W, 74, "#c8c0a8", 6); R(0, 66, W, 8, "#8a8a7a"); terrazzo(74, "#a8a090");
    if (f === "1"){
      R(18, 38, 34, 24, "#7a7a72"); for (let k = 0; k < 4; k++){ R(20 + (k % 2) * 16, 40 + Math.floor(k / 2) * 11, 14, 9, "#9a9a92"); R(22 + (k % 2) * 16, 42 + Math.floor(k / 2) * 11, 6, 1, "#3a3a3a"); }   // 信箱
      txt("4F 方", 37, 61, "#3a3a3a", "4px sans-serif");
      steps(64, 72, 10, 8, 4, "#a8a090");   // 往上的樓梯
      ironDoor(160, 26, 26, 48, "#5a6a5a"); R(150, 36, 8, 12, "#2a2a2a"); for (let k = 0; k < 6; k++) P(152 + (k % 3) * 2, 39 + Math.floor(k / 3) * 3, "#6fd46f");   // 大門、密碼鎖
    } else if (f === "23"){
      steps(20, 74, 4, 10, 2, "#a8a090");   // 往下到二樓
      steps(58, 74, 6, 9, 5, "#a8a090");    // 往上到四樓
      ironDoor(150, 26, 26, 48, "#6a5a4a"); chunlian(144, 28, 40); chunlian(178, 28, 40); R(156, 18, 14, 6, "#c23a2a"); txt("福", 159, 23, "#e8c040", "5px serif");   // 許家（三樓）
      R(120, 60, 18, 12, "#8a6a3a"); R(122, 62, 14, 4, "#6a4a2a");   // 鞋櫃
      if (!o.clean){ for (let k = 0; k < 5; k++) P(62 + k * 8, 70 - k * 2, "#e8f4f8"); R(20, 90, 8, 4, "#5a1a1a"); for (let k = 0; k < 4; k++) R(21 + k * 2, 91, 1, 2, "#3a0a0a"); }   // 魚鱗、二樓的血鞋印
    } else if (f === "4"){
      // 往下（三樓）：後牆前面地板上的樓梯口，欄杆圍著
      R(6, 74, 52, 12, "#3a3428"); for (let k = 0; k < 5; k++) R(8 + k * 10, 75 + k * 2, 10, 2, "#8a8270"); R(6, 64, 52, 2, "#6a6a62"); for (let k = 0; k < 5; k++) R(8 + k * 12, 64, 1, 10, "#6a6a62"); txt("3F", 8, 62, "#5a5a52", "4px sans-serif");
      // 往上（頂樓加蓋）：從 x112 往左上爬到 x64
      for (let k = 0; k < 5; k++){ const x = 104 - k * 10, y = 74 - k * 5; R(x, y, 11, 3 + k * 5, "#a8a090"); R(x, y, 11, 1, "#e8e0d0"); }
      R(58, 22, 18, 28, "#1e1c18"); txt("頂樓", 59, 20, "#5a5a52", "4px sans-serif");
      R(120, 18, 64, 56, "#2a2a2a"); R(122, 20, 6, 54, "#5a5a52"); R(178, 20, 6, 54, "#5a5a52"); R(122, 18, 62, 3, "#5a5a52");   // 門框
      R(150, 20, 28, 54, "#5a5a4a"); R(128, 20, 22, 54, "#3a3428");   // 半開的鐵門、屋裡
      R(150, 44, 6, 4, "#c8a040"); R(152, 46, 2, 4, "#8a8a8a");   // 鑰匙插在鎖上
      if (!o.clean){ R(124, 30, 2, 10, "#6a1a1a"); R(123, 31, 1, 4, "#7a2020"); P(126, 32, "#c8c8c0"); for (let k = 0; k < 5; k++) P(12 + k * 10, 76 + k * 2, "#6a1a1a"); }   // 門框的血、往下樓梯的血滴
      R(160, 50, 14, 10, "#f4f0e0"); R(162, 53, 10, 1, "#3a3a3a");   // 牆上的剪報（從門裡看得到）
    } else {
      steps(10, 74, 6, 10, 4, "#b8b0a0"); dither(10, 50, 60, 24, "#c8c0b0", 3);   // 灰塵很多的樓梯
      ironDoor(140, 24, 30, 50, "#8a8a8a"); R(142, 30, 22, 8, "#f4f4f0"); R(144, 33, 18, 1, "#3a3a3a"); R(144, 52, 20, 1, "#6fd4f4");   // 加蓋的門、告示
      if (!o.clean) for (let k = 0; k < 9; k++) R(70 + (k * 7) % 30, 88 + (k % 3) * 3, 4, 2, "#6a6458");   // 一堆鞋印
    }
    lamp(96, 0, "#f8f0c8");
    if (f === "23" && o.outline) OBJ.outline(118, 86);
    if (f === "23" && o.body){ R(116, 86, 28, 8, "#8a5a3a"); R(140, 86, 8, 8, "#d8a880"); OBJ.blood(140, 92, 12); }
    if (o.tape) OBJ.tape(0, 80, 40);
  };
  SC.tp_flat = (o) => {
    wall(72, "#c8c0a0", false); dither(0, 0, W, 72, "#b8b090", 7);
    R(140, 12, 24, 16, "#6b4a2b"); R(142, 14, 20, 12, "#c8a040"); R(144, 16, 16, 1, "#5a4a2a"); R(146, 20, 12, 1, "#5a4a2a");   // 獎牌
    OBJ.desk(50, 58, 90); for (let k = 0; k < 6; k++){ R(58 + k * 6, 46, 4, 12, "#c8d8c8"); R(59 + k * 6, 44, 2, 2, "#c23a2a"); }   // 米酒瓶
    R(100, 54, 14, 4, "#f4f0e0"); R(101, 55, 10, 1, "#3a3a3a"); R(120, 52, 6, 6, "#e8e8e0");   // 筆記、茶杯
    windowBox(16, 14, 26, 24, "#9cb5c6");
    R(160, 40, 24, 32, "#5a4a3a"); for (let k = 0; k < 3; k++) R(162, 44 + k * 8, 20, 6, ["#3a5a7a", "#7a3a2a", "#3a6a3a"][k]);   // 書櫃：舊的鑑識教科書
    lamp(96, 0, "#f8e8c8");
    floor(72, "#a89878", "#988868");
  };
  // 公寓大門口（對面便利商店的監視器）
  const TDOOR = 96;
  SC.tp_out = (o) => {
    R(0, 0, W, H, "#141820"); R(40, 0, 112, 74, "#b8b0a0"); for (let f = 0; f < 3; f++) for (let k = 0; k < 3; k++) windowBox(50 + k * 34, 4 + f * 18, 20, 12, (f + k) % 3 ? "#1a2030" : "#ffd98a");
    R(40, 56, 112, 3, "#6a6a62"); ironDoor(84, 40, 24, 34, "#5a6a5a"); R(110, 50, 4, 6, "#2a2a2a"); P(111, 52, "#6fd46f");
    R(0, 30, 40, 44, "#3a3a3e"); R(152, 30, 40, 44, "#4a3a3a"); R(160, 34, 26, 8, "#c23a2a");
    lamp(30, 10, "#f8e8b8");
    R(0, 74, W, 34, "#4a4a48"); for (let x = 0; x < W; x += 16) R(x, 74, 1, 34, "#3a3a38");
    txt("← 龍山寺", 4, 104, "#8a8a8a", "5px sans-serif"); txt("小吃部 →", 154, 104, "#8a8a8a", "5px sans-serif");
    R(0, 0, W, 6, "#0a0a0a"); txt("CAM 7-11", 4, 5, "#e8e8e0", "4px monospace");
  };

  /* ---------- 台北：其他地方 ---------- */
  SC.w_pol = (o) => {
    wall(72, "#d8d8d0", false); R(0, 64, W, 8, "#8a8a82");
    OBJ.desk(10, 58, 172); R(20, 50, 24, 8, "#f4f0e0"); R(22, 52, 18, 1, "#3a3a3a");   // 判決書
    R(60, 36, 24, 16, "#2a2a2e"); R(62, 38, 20, 12, "#1a2a3a"); for (let k = 0; k < 12; k += 2) R(62, 38 + k, 20, 1, "#00000033");   // 監視器
    R(100, 50, 24, 8, "#f4f0e0"); for (let k = 0; k < 3; k++) R(102, 52 + k * 2, 18, 1, "#3a3a3a"); R(140, 50, 24, 8, "#e8e8e0"); R(142, 52, 10, 1, "#c23a2a");   // 電子鎖紀錄、驗屍報告
    R(70, 8, 52, 12, "#3f5a7a"); txt("萬華分局", 78, 17, "#f4f4f0", "7px sans-serif");
    R(150, 14, 30, 22, "#f4f4f0"); R(152, 16, 26, 18, "#e8e0c8");   // 白板
    lamp(40, 0, "#f8f8f0");
    floor(72, "#8a8a82", "#7a7a72");
  };
  SC.w_rail = (o) => {
    wall(72, "#d0d4d8", false); R(0, 64, W, 8, "#7a8088");
    OBJ.desk(10, 58, 172); R(20, 50, 24, 8, "#f4f0e0"); R(22, 52, 14, 1, "#e86a2a");   // 售票紀錄
    R(60, 38, 24, 16, "#2a2a2e"); R(62, 40, 20, 12, "#1a2a3a"); R(140, 18, 24, 16, "#2a2a2e"); R(142, 20, 20, 12, "#1a2a3a");
    R(90, 8, 40, 12, "#e86a2a"); txt("鐵路警察", 96, 17, "#f4f4f0", "7px sans-serif");
    lamp(40, 0, "#f8f8f0");
    floor(72, "#8a8e92", "#7a7e82");
  };
  SC.a_bar = (o) => {
    wall(72, "#6a4a3a", false); dither(0, 0, W, 72, "#5a3a2a", 4);
    R(60, 50, 120, 22, "#5a3a24"); R(58, 48, 124, 3, "#7a5a34"); for (let k = 0; k < 5; k++) R(70 + k * 20, 40, 5, 8, ["#3a7a3a", "#c8d8c8", "#7a5a2a"][k % 3]);   // 吧台、酒瓶
    R(100, 44, 18, 4, "#e8e0c8");   // 賒帳本
    table(18, 54, 26); R(28, 50, 4, 4, "#c8a868");   // 角落的小桌、烏龍茶
    R(140, 10, 40, 14, "#c23a2a"); txt("阿娥小吃部", 142, 20, "#f8e8b8", "6px sans-serif");
    R(70, 10, 50, 26, "#2a2a2e"); R(72, 12, 46, 22, "#3a5a7a");   // 電視
    lamp(50, 0, "#e8a868");
    floor(72, "#5a4a3a", "#4a3a2a");
  };
  SC.k_lobby = (o) => {
    wall(72, "#2a1a3a", false); for (let k = 0; k < 16; k++) P(6 + k * 12, 4 + (k % 3) * 3, ["#e8c040", "#3ac8e8", "#e83a8a"][k % 3]);
    R(70, 8, 60, 14, "#1a0a2a"); txt("星光 KTV", 80, 18, "#e83a8a", "8px sans-serif");
    R(80, 50, 60, 22, "#3a2a4a"); R(78, 48, 64, 3, "#e83a8a"); R(90, 44, 24, 4, "#e8e8e0");   // 櫃台
    R(20, 24, 30, 48, "#5a5a6a"); R(34, 24, 2, 48, "#3a3a4a"); R(24, 18, 22, 4, "#e8c040");   // 電梯
    R(150, 16, 24, 16, "#1a1a1e"); R(152, 18, 20, 12, "#1a2a2a");   // 監視器
    floor(72, "#3a2a4a", "#2a1a3a");
  };
  SC.n_lobby = (o) => {
    wall(72, "#e8e4dc", false); R(0, 64, W, 8, "#8a7a6a");
    R(110, 50, 80, 22, "#5a4a3a"); R(108, 48, 84, 3, "#8a7a6a"); R(120, 44, 18, 4, "#f4f4f0"); R(150, 44, 22, 4, "#e8e8e0"); R(158, 38, 10, 6, "#2a2a2e");   // 櫃台
    R(60, 8, 70, 12, "#2a3a4a"); txt("南港商旅", 74, 17, "#e8c878", "7px serif");
    OBJ.plant(20, 64); R(40, 54, 40, 14, "#6a7a8a"); R(38, 52, 44, 4, "#7a8a9a");   // 沙發
    lamp(160, 0, "#f8f0d8");
    floor(72, "#c8c0b0", "#b8b0a0");
  };
  SC.n_room = (o) => {
    wall(72, "#e8e0d0", false); R(0, 64, W, 8, "#a89878");
    R(0, 0, 62, 72, "#e8f0f0"); R(60, 0, 3, 72, "#a8a898"); R(28, 52, 30, 6, "#f4f4f4"); R(34, 46, 18, 6, "#e8e8e8"); R(40, 58, 4, 10, "#c8c8c8"); R(38, 66, 8, 4, "#a8a8a8");   // 浴室、洗手台、U 型管
    if (o.opened) { R(30, 70, 14, 4, "#3a3a3a"); R(44, 72, 6, 3, "#1a1a1a"); }
    R(110, 52, 70, 16, "#f4f4f4"); R(108, 48, 74, 6, "#c8b898"); R(112, 50, 20, 6, "#ffffff");   // 床
    OBJ.desk(76, 58, 30); R(92, 54, 10, 4, "#3a6ab8"); R(93, 55, 8, 2, "#e8e8e0");   // 桌上的展覽證
    windowBox(130, 12, 40, 24, "#9cb5c6");
    lamp(120, 0, "#f8f0d8");
    floor(72, "#a89878", "#988868");
    R(150, 92, 7, 4, "#1a1a1a"); R(158, 92, 7, 4, "#1a1a1a"); R(150, 95, 7, 1, "#5a5a5a"); R(158, 95, 7, 1, "#5a5a5a");   // 門口的鞋
  };
  SC.su_room = (o) => {
    wall(72, "#f0e8e0", false);
    R(14, 26, 34, 6, "#8a3a2a"); R(16, 32, 30, 30, "#6b2a1a"); R(22, 12, 18, 14, "#f4f0e0"); R(24, 14, 14, 10, "#c8a888"); R(28, 16, 6, 5, "#e8c8a8"); R(22, 28, 18, 2, "#e8c040"); R(18, 22, 2, 4, "#c23a2a"); R(42, 22, 2, 4, "#c23a2a");   // 小佛桌、照片、手鍊
    R(58, 56, 22, 12, "#c8a878"); R(60, 54, 18, 3, "#f4f0e0"); R(62, 52, 12, 3, "#8a6a5a");   // 紙箱
    OBJ.desk(84, 58, 36); R(90, 54, 8, 4, "#1a1a1a"); R(91, 55, 6, 2, "#c8a868");   // 手機（象棋）
    R(126, 16, 28, 56, "#c8b898"); R(139, 16, 2, 56, "#a89878"); R(130, 30, 4, 2, "#f4f4f0");   // 衣櫃、洗衣單
    R(160, 0, 32, 72, "#c8d8e8"); R(160, 0, 2, 72, "#8a8a8a"); R(162, 48, 30, 1, "#8a8a8a"); R(170, 49, 7, 8, "#f4f4f4"); R(178, 49, 7, 8, "#f4f4f4"); R(173, 55, 3, 2, "#c23a2a"); R(181, 55, 3, 2, "#c23a2a"); R(176, 62, 12, 10, "#e8f0f8");   // 陽台、白布鞋、漂白水桶
    lamp(96, 0, "#f8f0e0");
    floor(72, "#d8c8b0", "#c8b8a0");
  };
  // 高鐵車廂的連結處（監視器）
  SC.tr_vest = (o) => {
    R(0, 0, W, H, "#d8d8d4"); R(0, 0, W, 8, "#b8b8b4");
    [[0, 40], [152, 40]].forEach(([x, w]) => { R(x, 10, w, 64, "#c8c8c4"); R(x + 10, 20, w - 20, 40, "#e8e8e4"); });
    R(40, 14, 22, 60, "#e8e8e0"); R(130, 14, 22, 60, "#e8e8e0"); R(42, 24, 18, 20, "#1a2030"); R(132, 24, 18, 20, "#1a2030");   // 車門（窗外很黑）
    R(70, 8, 52, 6, "#3a3a3a"); txt("7 ⇄ 8", 86, 13, "#e8a040", "5px monospace");
    R(0, 74, W, 34, "#8a8a86"); for (let x = 0; x < W; x += 10) R(x, 74, 1, 34, "#7a7a76");
    txt("← 5 車", 4, 104, "#5a5a5a", "5px sans-serif"); txt("9 車 →", 160, 104, "#5a5a5a", "5px sans-serif");
  };
  // 台北車站東三門・計程車排班（監視器）
  SC.tx_rank = (o) => { const [s] = stOf(o), car = s.car === undefined ? 1 : s.car;
    R(0, 0, W, H, "#141820"); R(0, 0, W, 40, "#3a3e44"); R(20, 14, 60, 10, "#1a1a1a"); txt("東三門 計程車", 24, 21, "#e8c040", "6px sans-serif");
    R(0, 40, W, 34, "#2a2e34");
    if (car){ R(110, 58, 60, 16, "#e8c040"); R(122, 50, 34, 10, "#d8b030"); R(126, 52, 12, 6, "#9cc5e6"); R(140, 52, 12, 6, "#9cc5e6"); R(116, 70, 10, 6, "#1a1a1a"); R(152, 70, 10, 6, "#1a1a1a"); R(132, 46, 10, 4, "#f4f4f0"); }
    lamp(100, 24, "#f8f0d8");
    R(0, 74, W, 34, "#5a5a58"); R(0, 74, W, 2, "#e8c040");
  };
  // 案發經過重現：左邊澄港當舖、右邊台北樓梯
  SC.cut10 = (o) => { const [s] = stOf(o), side = s.side || "pawn";
    if (side === "pawn"){ SC.p_back({ clean:true, ajar:s.ajar }); if (s.dead){ R(84, 38, 18, 10, "#e8e0c8"); R(96, 40, 9, 8, "#d8a880"); R(96, 39, 9, 2, "#8a8a84"); OBJ.blood(100, 47, 10); } }
    else if (side === "train"){ SC.tr_vest({}); }
    else if (side === "kitchen"){ SC.r_hall(Object.assign({}, o, { split:true })); }
    else { SC.tp_stair({ floor:"4", clean:!s.blood }); }
    R(0, 0, W, 8, "#00000088"); txt(s.place || "", 4, 6, "#f4f0e0", "5px sans-serif");
  };

  /* ---------- 人物造型 ---------- */
  const SUC = { skin:"#f0d0b8", hair:"#1a1410", hairStyle:"long", top:"#e8e8e0", coat:"#d8c8a8", bottom:"#3a3a4a", shoes:"#f4f4f0", hat:"cap", capColor:"#3a3a3a", mask:"#e8e8ec" };
  const LOOK = {
    ade:   { age:"old", skin:"#d8a880", hair:"#c8c8c0", hairStyle:"balding", top:"#e8e0c8", coat:"#7a6a4a", bottom:"#3a3a30", glasses:true, mood:"sad", hello:"三十年了……我做了三十年。" },
    zixiang:{ skin:"#e0b48c", hair:"#1a1410", hairStyle:"spiky", top:"#3a5a3a", bottom:"#2a2a40", hello:"我知道你們在想什麼。" },
    chen:  { age:"old", skin:"#d8a880", hair:"#5a4a3a", hairStyle:"bun", top:"#e8a0a0", bottom:"#3a3a3a", apron:"#f4f4f4", shoes:"#3a5a8a", hello:"要吃魚丸嗎？……啊，你們是警察。" },
    lin:   { skin:"#f0c8a8", hair:"#2a1a14", hairStyle:"bun", top:"#c83a3a", bottom:"#2a2a30", apron:"#f4f4f0", mood:"worried", hello:"阿傑他……他在台北。" },
    yang:  { skin:"#f4d4bc", hair:"#3a2a20", hairStyle:"pony", top:"#2a2a2a", bottom:"#2a2a30", apron:"#c23a2a", hello:"老闆娘說，你們問什麼我都要說。" },
    kang:  { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#2a3a4a", bottom:"#2a2a30", shoes:"#111111", mood:"tired", hello:"我說過了，那時候我在廚房。" },
    su:    { skin:"#f0d0b8", hair:"#1a1410", hairStyle:"long", top:"#c8d8e8", bottom:"#3a3a4a", hello:"……你們找我做什麼？" },
    pan:   { skin:"#d8a880", hair:"#2a2a2a", hairStyle:"short", top:"#e8e4da", coat:"#4a4a3a", bottom:"#2a2a30", hello:"澄港的？……這裡是台北。" },
    you:   { skin:"#f4d4bc", hair:"#5a3a2a", hairStyle:"pony", top:"#e86a8a", bottom:"#3a3a4a", hello:"雅婷她……還好嗎？" },
    ae:    { age:"old", skin:"#d8a880", hair:"#3a3a3a", hairStyle:"bun", top:"#7a3a5a", bottom:"#2a2a2a", apron:"#e8e0c8", hello:"白天不賣酒啦。" },
    huang: { skin:"#f0c8a8", hair:"#2a2a2a", hairStyle:"spiky", top:"#5a5a6a", bottom:"#2a2a40", glasses:true, mood:"worried", hello:"我……我那時候有戴耳機。" },
    xuzy:  { hello:"……知夏。" },
    xu:    { hello:"現場不要亂碰。" },
    qian:  { hello:"這一下，打得很重。" },
    wu:    { hello:"學長，這個當舖好老喔。" }
  };
  ["xu","qian","wu","xuzy"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.xuzy.top) Object.assign(LOOK.xuzy, { age:"old", skin:"#d0a080", hair:"#8a8a84", hairStyle:"balding", top:"#6a5a4a", bottom:"#3a3430", beard:true });
  LOOK.xuzy.mood = "tired";
  const DAILY = {
    ade:   [ { room:"pback", x:150, pose:"cry", doing:"站在後門邊，一直擦眼睛。" }, { room:"pfront", x:120, pose:"stand", doing:"站在櫃台後面，看著那台天平。" } ],
    zixiang:[ { room:"pfront", x:60, pose:"phone", doing:"在前廳講電話，一直走來走去。" }, { room:"pfront", x:40, pose:"cross", doing:"在店裡翻抽屜，說要「整理遺物」。" } ],
    chen:  [ { room:"pfish", x:120, pose:"stand", doing:"站在魚丸店後門，看著當舖。" }, { room:"pfish", x:40, pose:"hold", doing:"在攪魚漿，眼睛紅紅的。" } ],
    lin:   [ null, { room:"rhall", x:160, pose:"stand", doing:"站在櫃台，把今天的訂位一個一個打電話取消。" } ],
    yang:  [ null, { room:"rhall", x:90, pose:"broom", doing:"在擦桌子。" } ],
    kang:  [ null, null, { room:"nroom", x:120, pose:"sit", doing:"坐在床邊，展覽證放在桌上，一直沒出門。" } ],
    su:    [ null, null, { room:"sroom", x:100, pose:"sit", doing:"坐在桌前，對著佛桌上的照片發呆。" } ],
    xuzy:  [ null, null, { room:"tflat", x:130, pose:"sit+drink", doing:"坐在桌前喝茶——杯子裡是不是茶，很難說。" } ],
    pan:   [ null, null, { room:"tpol", x:80, pose:"cross", doing:"抱著手臂，看著你們。" } ],
    you:   [ null, null, { room:"kktv", x:120, pose:"stand", doing:"在 KTV 大廳等你們，眼睛腫腫的。" } ],
    ae:    [ null, null, { room:"tbar", x:140, pose:"broom", doing:"在掃地，準備晚上開店。" } ],
    huang: [ null, null, { room:"troof", x:120, pose:"stand", doing:"站在頂樓的門口，抱著筆電。" } ],
    xu:    [ { room:"pback", x:130, pose:"kneel", doing:"蹲在桌腳旁邊，拍那半個鞋印。" }, { room:"cpolice", x:120, pose:"read", doing:"在分局看鑑識報告。" }, { room:"t4f", x:110, pose:"kneel", doing:"蹲在四樓的門口，量門框。" } ],
    qian:  [ { room:"pback", x:90, pose:"kneel", doing:"彎著腰，看死者的後腦。" }, { room:"cmorgue", x:100, pose:"stand", doing:"在解剖台旁邊寫報告。" } ],
    wu:    [ { room:"pfront", x:150, pose:"stand", doing:"在看前門的監視器。" }, { room:"palley", x:100, pose:"kneel", doing:"蹲在後巷拍照。" }, { room:"tdoor", x:60, pose:"stand", doing:"在一樓看信箱。" } ]
  };
  EP10.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });
  const L0 = id => { const L = Object.assign({}, LOOK[id]); delete L.hello; delete L.byPhase; delete L.mood; return L; };
  EP10.looks = {
    suL: SUC, suT: { skin:"#f0d0b8", hair:"#1a1410", hairStyle:"long", top:"#e8e8e0", bottom:"#3a3a4a", shoes:"#f4f4f0", prop:"#d8c8a8" },
    kangC: { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#f4f4f0", bottom:"#2a2a30", apron:"#e8e8e0", shoes:"#111111" },
    kangT: Object.assign(L0("kang"), { hat:"cap", capColor:"#1a1a1a", prop:"bag" }),
    kangN: Object.assign(L0("kang"), { prop:"bag" }),
    adeL: L0("ade"), linL: L0("lin"),
    fengL: { age:"old", skin:"#d8a880", hair:"#8a8a84", hairStyle:"balding", top:"#e8e0c8", bottom:"#3a3a30", glasses:true },
    fangL: { age:"old", skin:"#d8a080", hair:"#4a4a44", hairStyle:"balding", top:"#8a5a3a", bottom:"#3a3a30", mood:"tired" }
  };

  /* ---------- 房間和隱藏小細節 ---------- */
  const night = ph => ph === 0;
  EP10.rooms = {
    pawn: [
      { id:"pfront", name:"當舖・前廳", scene:"p_front", details:[
        { id:"d10_cal", name:"櫃台後面的月曆", hot:[120,52,20,14], text:"櫃台後面掛著農民曆。8 月 6 日那一格寫著：「宜：納財。忌：出行。」" } ] },
      { id:"pback", name:"後面的辦公室", scene:"p_back", opt:(ph,has)=>({ body:ph===0, markers:ph===0, ajar:ph===0, clean:ph>0 }), details:[
        { id:"d10_noodle", name:"垃圾桶", hot:[60,62,10,10], text:"垃圾桶裡有一個泡麵碗，「肉燥」口味。旁邊的帳單背面寫著：「明天去看醫生」。" } ] },
      { id:"palley", name:"後巷", scene:"p_alley", opt:(ph,has)=>({ noBags:ph>0, clean:ph>0 }), details:[
        { id:"d10_cat", name:"水管後面", hot:[0,50,8,24], text:"水管後面躲著一隻橘貓，盯著當舖的後門。陳秀枝說，馮老闆每天晚上都會丟一點魚乾給牠。" } ] },
      { id:"pfish", name:"阿枝魚丸・後廚", scene:"p_fish", details:[
        { id:"d10_radio", name:"收音機", hot:[110,20,30,20], text:"收音機在播：「……澄港老街一家當舖昨晚發生命案……」陳秀枝把它關掉了。" } ] }
    ],
    police: [ { id:"cpolice", name:"澄港市刑大", scene:"police", details:[
      { id:"d10_board", name:"白板", hot:[120,14,50,30], text:"白板上貼著馮志遠的照片。小吳在旁邊畫了一列火車，寫著「23:30」。" } ] } ],
    morgue: [ { id:"cmorgue", name:"法醫室", scene:"morgue", details:[
      { id:"d10_qcake", name:"老錢的桌上", hot:[150,20,30,20], text:"老錢的桌上放著半盒鳳梨酥。他說：「我太太又烤太多了。吃一個，案子會比較順。」" } ] } ],
    rest: [
      { id:"rhall", name:"用餐區", scene:"r_hall", details:[
        { id:"d10_tank", name:"門口的魚缸", hot:[150,60,30,12], text:"門口的水族箱裡游著幾條午仔魚。牌子寫著：「今日現撈　澄港漁港直送」。" } ] },
      { id:"rkitchen", name:"廚房", scene:"r_kitchen", details:[
        { id:"d10_knife", name:"刀架", hot:[120,30,24,20], text:"刀架上每一把刀都磨得很亮。最大的那把刀柄上刻著：「爸　1988」。" } ] },
      { id:"roffice", name:"辦公室", scene:"r_office", details:[
        { id:"d10_kid", name:"月曆", hot:[20,14,30,30], text:"月曆上 8 月 22 日畫了一個愛心：「小魚生日」。康家的女兒今年四歲。" } ] }
    ],
    station: [
      { id:"splat", name:"2 號月台", scene:"s_plat", details:[
        { id:"d10_ad", name:"柱子上的廣告", hot:[24,20,20,30], text:"柱子上貼著觀光廣告：「澄港　漁港的味道」。照片裡是一盤清蒸午仔魚。" } ] },
      { id:"soffice", name:"站務室", scene:"s_office", details:[
        { id:"d10_shift", name:"班表", hot:[20,14,30,40], text:"8/6 晚班的站務員寫了一行：「23:30 末班車　旅客 87 人　準點」。" } ] }
    ],
    tp_police: [ { id:"tpol", name:"萬華分局・會議室", scene:"w_pol", details:[
      { id:"d10_pancoffee", name:"潘志剛的杯子", hot:[150,14,30,22], text:"白板旁邊的杯子上印著：「萬華分局　破案績效第一名　2024」。" } ] } ],
    tp_apt: [
      { id:"tdoor", name:"一樓大門", scene:"tp_stair", opt:{ floor:"1" }, details:[
        { id:"d10_bike", name:"樓梯下面", hot:[150,60,30,14], text:"樓梯下面停著一台生鏽的腳踏車，車籃裡塞滿了廣告單。" } ] },
      { id:"tstair", name:"二樓到三樓的樓梯", scene:"tp_stair", opt:(ph,has)=>({ floor:"23", outline:true }), details:[
        { id:"d10_shoes", name:"三樓的鞋櫃", hot:[120,60,18,12], text:"許家的鞋櫃上只有一雙皮鞋，擦得很亮。旁邊一雙女生的拖鞋，粉紅色，很舊了，好像很多年沒人穿。" } ] },
      { id:"t4f", name:"四樓・方國良家門口", scene:"tp_stair", opt:{ floor:"4" }, details:[
        { id:"d10_plant", name:"門口的盆栽", hot:[96,60,16,12], text:"門口一盆枯掉的萬年青。花盆上貼著：「蘇小姐送」——是房東自己寫的，字很歪。" } ] },
      { id:"troof", name:"頂樓樓梯間", scene:"tp_stair", opt:{ floor:"roof" }, details:[
        { id:"d10_view", name:"小窗", hot:[90,20,20,20], text:"樓梯間的小窗看得到龍山寺的屋頂。半夜站在這裡，看得到整條西園路。" } ] },
      { id:"tflat", name:"三樓・許家", scene:"tp_flat", details:[
        { id:"d10_books", name:"書櫃", hot:[160,40,24,32], text:"書櫃裡是一排舊的鑑識教科書，書背都磨白了。最下面一層，有一本相簿，上面積著灰。許知夏看了一眼，沒有打開。" } ] }
    ],
    bar: [ { id:"tbar", name:"阿娥小吃部", scene:"a_bar", details:[
      { id:"d10_tv", name:"電視", hot:[70,10,50,26], text:"電視在播：「萬華老公寓房東墜樓　警方初判酒後失足」。阿娥說：「他喔，早晚的事。」說完又嘆了一口氣。" } ] } ],
    ktv: [ { id:"kktv", name:"星光 KTV 大廳", scene:"k_lobby", details:[
      { id:"d10_song", name:"點歌排行", hot:[20,18,30,6], text:"大廳的螢幕在跑本週點歌排行。第一名是〈祝你生日快樂〉。" } ] } ],
    tpe: [ { id:"ttpe", name:"台北車站・鐵路警察", scene:"w_rail", details:[
      { id:"d10_lost", name:"失物招領櫃", hot:[160,30,24,30], text:"失物招領櫃裡，有一把傘、一隻小熊、一頂黑色的鴨舌帽。8/7 早上在末班車的 9 車撿到的帽子，沒有人來領。" } ] } ],
    hotel: [
      { id:"nlobby", name:"南港商旅・櫃台", scene:"n_lobby", details:[
        { id:"d10_expo", name:"櫃台的傳單", hot:[60,52,20,14], text:"「台北國際餐飲設備展　8/7–8/9　南港展覽館」。櫃台說這幾天住的都是看展的廚師。" } ] },
      { id:"nroom", name:"1207 號房", scene:"n_room", opt:(ph,has)=>({ opened:has("ev_drain") }), details:[
        { id:"d10_photo", name:"手機桌布", hot:[110,48,20,6], text:"床上的手機亮了一下。桌布是一個小女孩抱著一條比她還大的魚，笑得很開心。" } ] }
    ],
    su_home: [ { id:"sroom", name:"蘇雅婷的套房", scene:"su_room", details:[
      { id:"d10_ticket", name:"垃圾桶", hot:[100,62,12,10], text:"桌下的垃圾桶是空的，剛倒過。只有底部黏著一小片橘色的紙屑。" } ] } ]
  };

  /* ---------- 監視器動畫 ---------- */
  const DY = 74;
  const ANIM = {
    cctv_front: { scene:"p_out", cam:"FRONT", date:"2026-08-06", opt:null, beats:[
      { t:"18:41:20", d:3.5, cap:"一個穿米色長外套、戴帽子的女人從騎樓走過，在店門口停了兩秒。", st:{ shut:0 }, m:{ suL:[220,98,null,1,-20,98,[[PDOOR,98],[PDOOR + 2,98]]] }, out:["suL"] },
      { t:"21:31:05", d:3, cap:"吳德成下班，從前門出來，往左走。", st:{ shut:0 }, m:{ adeL:[-20,98,null,-1,PDOOR,DY,[[PDOOR,98]]] }, out:["adeL"] },
      { t:"21:52:10", d:3.5, cap:"米色長外套的女人戴著口罩，走進店裡。", st:{ shut:0 }, m:{ suL:[PDOOR,DY,null,1,-20,98,[[PDOOR,98]]] }, out:["suL"] },
      { t:"21:58:30", d:3.5, cap:"她從店裡出來，往右轉——後巷的巷口在右邊。", st:{ shut:0 }, m:{ suL:[220,98,null,1,PDOOR,DY,[[PDOOR,98]]] }, out:["suL"] },
      { t:"22:01:00", d:4, cap:"鐵門從裡面慢慢拉下來。拉鐵門的是馮志遠，看得到他的手和袖子。", st:{ shutUp:true } },
      { t:"22:40:00", d:2.5, cap:"（22:01 到 22:40，前門沒有人進出。）", st:{ shut:1 } }
    ] },
    cctv_rest: { scene:"r_hall", cam:"HALL / KITCHEN", date:"2026-08-06", opt:{ split:true }, beats:[
      { t:"19:00:00", d:3, cap:"右邊是廚房：康文傑一直在爐子前面。", m:{ kangC:[156,98,"carry@pot/#4a4a4a",-1] } },
      { t:"20:31:00", d:3.5, cap:"20:31，一個穿米色長外套、戴帽子的女人一個人進來，坐靠窗的 2 號桌。", m:{ kangC:[156,98,"carry@pot/#4a4a4a",-1], suL:[34,98,"sit",1,-20,98] } },
      { t:"21:12:30", d:3, cap:"21:12，康文傑從廚房出來（左邊畫面的出菜口旁），親手把一盤魚端到 2 號桌。站了幾秒，回廚房。", m:{ kangC:[50,98,"carry@tray/#e8e8e0",-1,156,98], suL:[34,98,"sit",1] } },
      { t:"21:12:50", d:3, join:true, cap:"21:12，康文傑從廚房出來（左邊畫面的出菜口旁），親手把一盤魚端到 2 號桌。站了幾秒，回廚房。", st:{ fish:true }, m:{ kangC:[50,98,["give","stand","stand"],-1], suL:[34,98,"sit",1] } },
      { t:"21:18:00", d:3.5, cap:"21:18，她付現金離開。魚只吃了幾口。康文傑回到爐子前面。", st:{ fish:true }, m:{ kangC:[156,98,"carry@pot/#4a4a4a",-1,50,98], suL:[-20,98,null,-1,34,98] }, out:["suL"] },
      { t:"22:58:00", d:3, cap:"22:58，漁會的客人走了。康文傑走進後面的員工間。", m:{ kangC:[200,98,null,1,156,98] }, out:["kangC"] },
      { t:"23:06:10", d:3.5, cap:"23:06，他換了一件黑色上衣，背著背包，從廚房的後門離開。", m:{ kangN:[200,98,null,1,170,98] }, out:["kangN"] }
    ] },
    cctv_plat: { scene:"s_plat", cam:"PLATFORM 2", date:"2026-08-06", opt:null, beats:[
      { t:"23:09:40", d:4, cap:"米色長外套的女人走到 5 車旁邊的 2 號垃圾桶，丟進一包藍色的東西。", st:{ train:false }, m:{ suL:[70,98,"reach:R@bag/#2a5ab8",-1,-20,98] } },
      { t:"23:24:10", d:4, cap:"康文傑背著背包走上月台，站在 9 車的位置。", st:{ train:false }, m:{ suL:[60,98,"stand",1], kangT:[166,98,"stand",-1,220,98] } },
      { t:"23:26:00", d:3, cap:"他往 5 車那邊看了一眼。女人沒有回頭。", st:{ train:false }, m:{ suL:[60,98,"stand",-1], kangT:[166,98,"stand",-1] } },
      { t:"23:29:00", d:4, cap:"末班車進站。她上 5 車，他上 9 車。", st:{ train:true }, m:{ suL:[47,74,null,1,60,98,[[47,98]]], kangT:[147,74,null,-1,166,98,[[147,98]]] }, out:["suL","kangT"] }
    ] },
    cctv_train: { scene:"tr_vest", cam:"CAR 7/8", date:"2026-08-06", beats:[
      { t:"23:51:10", d:3.5, cap:"米色長外套的女人從 5 車那頭走過來，站在門邊。", m:{ suL:[80,98,"stand",1,-20,98] } },
      { t:"23:51:40", d:3.5, cap:"康文傑從 9 車那頭走過來。", m:{ suL:[80,98,"stand",1], kangT:[110,98,"stand",-1,220,98] } },
      { t:"23:52:20", d:4, cap:"兩個人沒有看對方。她從口袋拿出一張摺起來的紙，遞給他。", m:{ suL:[84,98,"give:R@paper",1], kangT:[106,98,"reach",-1] } },
      { t:"23:53:00", d:3, cap:"他打開看了一眼，手停了很久。然後摺起來，放進胸前的口袋。", m:{ suL:[80,98,"stand",1], kangT:[110,98,"read@paper",-1] } },
      { t:"23:53:40", d:2, join:true, cap:"他打開看了一眼，手停了很久。然後摺起來，放進胸前的口袋。", m:{ suL:[80,98,"stand",1], kangT:[110,98,"pocket@paper",-1] } },
      { t:"23:54:30", d:3.5, cap:"兩個人往相反的方向，走回自己的車廂。", m:{ suL:[-20,98,null,-1,80,98], kangT:[220,98,null,1,110,98] }, out:["suL","kangT"] }
    ] },
    cctv_store: { scene:"tp_out", cam:"CAM 7-11", date:"2026-08-07", beats:[
      { t:"01:32:10", d:4, cap:"一個戴帽子、背黑包、穿黑鞋的男人走到大門口，在密碼鎖上按了幾下。", m:{ kangT:[TDOOR + 12,98,"back+reach",1,-20,98] } },
      { t:"01:33:00", d:3, cap:"門開了，他走進去。", m:{ kangT:[TDOOR,DY,null,-1,TDOOR + 12,98,[[TDOOR,98]]] }, out:["kangT"] },
      { t:"01:37:30", d:3.5, cap:"方國良從右邊走過來，走路歪歪的，在門口摸了很久才刷卡進去。", m:{ fangL:[TDOOR + 4,96,"back+door@card",-1,220,98,[[TDOOR + 16,98],[TDOOR + 10,94]]] } },
      { t:"01:38:00", d:2, join:true, cap:"方國良從右邊走過來，走路歪歪的，在門口摸了很久才刷卡進去。", m:{ fangL:[TDOOR,DY,null,-1,TDOOR + 4,96,[[TDOOR,96]]] }, out:["fangL"] },
      { t:"01:45:20", d:4, cap:"剛才那個男人推門出來，低著頭，快步往左邊（龍山寺那邊）走。", m:{ kangT:[-20,98,null,-1,TDOOR,DY,[[TDOOR,98]]] }, out:["kangT"] }
    ] },
    cctv_ktv: { scene:"k_lobby", cam:"KTV LOBBY", date:"2026-08-07", beats:[
      { t:"01:28:10", d:4, cap:"蘇雅婷進來，頭髮濕濕的，穿 T 恤，手上搭著一件米色的長外套。她在櫃台問了包廂號碼。", m:{ suT:[110,98,"stand",-1,220,98] } },
      { t:"01:29:00", d:4, cap:"她走到電梯口，從口袋拿出一張橘色的小卡片看了一眼，又塞回去。", m:{ suT:[50,98,"inspect@card/#e8902a",-1,110,98] } },
      { t:"01:29:40", d:2.5, cap:"電梯門關上。（到 04:02，她都沒有離開。）", m:{ suT:[34,DY,null,-1,50,98,[[34,98]]] }, out:["suT"] }
    ] },
    cctv_taxi: { scene:"tx_rank", cam:"EAST 3", date:"2026-08-07", beats:[
      { t:"01:11:30", d:2.5, cap:"康文傑背著背包走出東三門，從口袋拿出一頂帽子戴上。", st:{ car:1 }, m:{ kangN:[100,98,"stand",1,-20,98] } },
      { t:"01:11:50", d:2, join:true, cap:"康文傑背著背包走出東三門，從口袋拿出一頂帽子戴上。", st:{ car:1 }, m:{ kangN:[100,98,["pocket","raise","raise"],1] }, out:["kangN"] },
      { t:"01:12:10", d:3.5, cap:"他上了排班的第一台計程車。車牌照得很清楚。", st:{ car:1 }, m:{ kangT:[128,74,null,1,100,98,[[128,98]]] }, out:["kangT"] },
      { t:"01:12:40", d:3, cap:"計程車開走——往萬華的方向。", st:{ car:0 } }
    ] }
  };
  [...EP10.cctv, ...EP10.evidence].forEach(it => { if (ANIM[it.id]){ const A = ANIM[it.id]; if (A.beats.some(b => b.st)) A.opt = Object.assign({}, A.opt || {}, { seq:A.beats.map(b => b.st || {}), ds:jds(A.beats) }); it.anim = A; } });
  const PS = [["p_back",{ phase:0, body:true, markers:true, ajar:true }],["r_hall",{ phase:1 }],["tp_stair",{ phase:2, floor:"4" }]];
  EP10.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 結案 ---------- */
  const RB = [
    { t:"21:12:30", d:3, cap:"8/6 21:12，海口小館。康文傑把一盤清蒸午仔魚端到 2 號桌。蘇雅婷說，她想看看自己是替誰做這件事。", st:{ side:"kitchen", place:"澄港・海口小館" }, m:{ kangC:[50,98,"carry@tray/#e8e8e0",-1,110,98], suL:[34,98,"sit",1] } },
    { t:"21:12:50", d:2.5, join:true, cap:"8/6 21:12，海口小館。康文傑把一盤清蒸午仔魚端到 2 號桌。蘇雅婷說，她想看看自己是替誰做這件事。", st:{ side:"kitchen", fish:true, place:"澄港・海口小館" }, m:{ kangC:[50,98,"give",-1], suL:[34,98,"sit",1] }, out:["kangC","suL"] },
    { t:"22:04:20", d:5, cap:"22:04，遠興當舖。她從沒鎖的後門進去。馮志遠背對著門，在算錢。那時候，康文傑在二十個客人面前炒菜。", st:{ side:"pawn", ajar:true, place:"澄港・遠興當舖" }, m:{ suL:[124,98,"stand",-1,176,DY,[[176,98]]], fengL:[96,92,"sit+hold@cash/#7a9a6a",-1] } },
    { t:"22:08:00", d:4, cap:"三下。她撕走帳本第 37 頁，用藍色的拭金布包起砝碼，從後門出去。", st:{ side:"pawn", ajar:true, place:"澄港・遠興當舖" }, m:{ suL:[106,98,["reach:R@weight/#c8a040","raise:R@weight/#c8a040","strike:R@weight/#c8a040","raise:R@weight/#c8a040","strike:R@weight/#c8a040","raise:R@weight/#c8a040","strike:R@weight/#c8a040"],-1,124,98], fengL:[96,92,"sit+hold@cash/#7a9a6a",-1] }, out:["fengL"] },
    { t:"22:08:30", d:2.5, join:true, cap:"三下。她撕走帳本第 37 頁，用藍色的拭金布包起砝碼，從後門出去。", st:{ side:"pawn", ajar:true, dead:true, place:"澄港・遠興當舖" }, m:{ suL:[126,98,"reach:L@paper",-1,106,98] } },
    { t:"22:09:00", d:2.5, join:true, cap:"三下。她撕走帳本第 37 頁，用藍色的拭金布包起砝碼，從後門出去。", st:{ side:"pawn", ajar:true, dead:true, place:"澄港・遠興當舖" }, m:{ suL:[126,98,"hold@cloth/#2a5ab8",-1] } },
    { t:"22:09:40", d:3, join:true, cap:"三下。她撕走帳本第 37 頁，用藍色的拭金布包起砝碼，從後門出去。", st:{ side:"pawn", ajar:true, dead:true, place:"澄港・遠興當舖" }, m:{ suL:[176,DY,"carry@cloth/#2a5ab8",1,126,98,[[176,98]]] }, out:["suL"] },
    { t:"23:52:20", d:3, cap:"23:52，末班車的連結處。她把那一頁交給他——「證明」。", st:{ side:"train", place:"末班列車　7 ⇄ 8 車" }, m:{ suL:[84,98,"give:R@paper",1,-20,98], kangT:[106,98,"reach",-1,220,98] } },
    { t:"23:52:40", d:2.5, join:true, cap:"23:52，末班車的連結處。她把那一頁交給他——「證明」。", st:{ side:"train", place:"末班列車　7 ⇄ 8 車" }, m:{ suL:[84,98,"stand",1], kangT:[106,98,"read@paper",-1] }, out:["suL","kangT"] },
    { t:"01:41:00", d:4, cap:"8/7 01:41，台北萬華。方國良喝醉回來，在四樓門口摸鑰匙。康文傑從頂樓樓梯下來。", st:{ side:"apt", place:"台北・西園路的老公寓　四樓" }, m:{ fangL:[146,98,"back+door@key",1,30,80,[[50,98]]], kangT:[66,50,"stand",1,66,50] } },
    { t:"01:41:05", d:2.5, join:true, cap:"8/7 01:41，台北萬華。方國良喝醉回來，在四樓門口摸鑰匙。康文傑從頂樓樓梯下來。", stairs:[[112,74,66,50,5]], st:{ side:"apt", place:"台北・西園路的老公寓　四樓" }, m:{ fangL:[146,98,"back+door@key",1], kangT:[132,98,"stand",1,66,50,[[112,74],[124,98]]] } },
    { t:"01:41:10", d:2.5, cap:"他抓住方國良，把他的頭撞上門框的鐵邊，再推下樓梯。那時候，蘇雅婷在 KTV 裡，跟朋友唱生日快樂歌。", st:{ side:"apt", place:"台北・西園路的老公寓　四樓" }, m:{ kangT:[136,98,["stand+reach","push","push"],1], fangL:[146,98,["back","stand","stumble"],1] } },
    { t:"01:41:15", d:3, join:true, cap:"他抓住方國良，把他的頭撞上門框的鐵邊，再推下樓梯。那時候，蘇雅婷在 KTV 裡，跟朋友唱生日快樂歌。", st:{ side:"apt", blood:true, place:"台北・西園路的老公寓　四樓" }, m:{ kangT:[66,92,"push",-1,136,98], fangL:[40,82,["stumble","stumble","fall"],-1,146,98] } },
    { t:"01:41:20", d:2, join:true, cap:"他抓住方國良，把他的頭撞上門框的鐵邊，再推下樓梯。那時候，蘇雅婷在 KTV 裡，跟朋友唱生日快樂歌。", st:{ side:"apt", blood:true, place:"台北・西園路的老公寓　四樓" }, m:{ kangT:[66,92,"stand",-1], fangL:[14,86,"fall",-1,40,82] }, out:["fangL"] },
    { t:"01:42:00", d:3, cap:"01:42，三樓的許振業聽到「碰」的一聲。康文傑跑下樓，經過三樓時踩到了血。", st:{ side:"apt", blood:true, place:"台北・西園路的老公寓　四樓" }, m:{ kangT:[30,80,null,-1,66,92] }, out:["kangT"] }
  ];
  EP10.court = {
    title: "萬華分局・會議室・8 月 8 日下午", scene: "w_pol",
    who: ph => ["kang","su","lin","zixiang","ade","chen","huang"],
    open: ph => "14:00，萬華分局的會議室。潘志剛坐在門口，抱著手臂。康文傑坐在長桌的一頭，蘇雅婷坐在另一頭，兩個人都沒有看對方。林佩君和吳德成早上從澄港趕上來。許知夏站在你後面，手上拿著一疊報告。",
    kindLine: {
      swap: "兩個晚上，兩個城市，兩個死人。每一個死人身邊，都有一個最恨他、卻有完美不在場證明的人。……因為他們交換了。",
      each: "馮志遠和方國良，各自死在自己的仇人手上。",
      robbery: "馮志遠是被搶匪打死的；方國良是喝醉自己摔死的。兩件事沒有關係。"
    },
    murmur: [ "（林佩君一直看著康文傑。康文傑看著桌面。）", "（蘇雅婷把手放在桌上，手腕上什麼都沒戴。）", "（潘志剛清了一下喉嚨。）" ],
    confess: {
      kang: [ "那天她坐在 2 號桌。我端魚出去，跟她說：「澄港的午仔魚，很好吃。」她看著我，說：「我知道。」", "在車上，她把那一頁給我。我認得他的字。我知道，她做了。輪到我了。", "我在頂樓的樓梯站了七分鐘。……他上樓的時候在哭，一直說「不是故意的」。我還是推了。" ],
      su: [ "我媽被撞死的那天在下雨。他說他不是故意的。法官也說他不是故意的。", "我想看看，我是替什麼樣的人做這件事。他把魚端出來，手在抖。我就知道，他也不是壞人。", "……我們都不是壞人。這才是最可怕的地方，對不對？" ]
    },
    cornered: { kang: "……我女兒下個月四歲。", su: "我只是……想要一個公道。" },
    deny: {
      lin: "阿傑那天晚上一直在廚房！我看著他炒的！",
      zixiang: "我在網咖！你們不是查過了嗎？",
      ade: "我只是回去拿藥……",
      chen: "我只是看到一個女人走過去而已……",
      huang: "我有戴耳機，我真的什麼都不知道……"
    },
    replayText: "5 月 14 日的深夜，一個叫「海口阿傑」的人，在象棋 app 上收到一個邀請。對手的名字叫「夜雨」。第一局下到一半，聊天室跳出一行字：「你也有一個，法律管不到的人嗎？」——",
    replay: { scene:"cut10", opt:{ seq:RB.map(b => b.st), ds:jds(RB) }, clean:true, cam:"案發經過重現", date:"2026-08-06", beats:RB },
    endGood: "晚上，康文傑和蘇雅婷被分別移送。澄港和台北的地檢署，第一次為了同一個案子開會。\n林佩君抱著四歲的女兒，在分局門口站了很久。\n許知夏說要回三樓拿一個東西。你們在樓下等。二十分鐘後她下來，眼睛有點紅，手上什麼都沒拿。",
    endBad: "方國良的案子，照意外結了。馮志遠的案子，掛在「搶劫未遂」底下，一直沒有破。\n9 月，台北一家小吃部的老闆娘說，那個瘦瘦的小姐，再也沒有來過。"
  };
  // 幕間：台北月台（ARC_INTER[10]）——場景改用這一集畫的月台
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[10] && ARC_INTER[10].after) EP10.after = Object.assign({}, ARC_INTER[10].after, { scene:"s_plat", opt:{ tpe:true, train:false } });

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP10.outScenes = ["p_alley"];
  EP10.fac = { pawn:["#c8b898","#5a1a1a"], police:["#cfcabb","#3f5a7a"], morgue:["#e2e8e8","#3a7a8a"], rest:["#e8dcc0","#2a6a8a"], station:["#e8ecee","#e86a2a"],
    tp_police:["#d0ccc4","#3f5a7a"], tp_apt:["#b8b0a0","#5a6a5a"], bar:["#8a6a5a","#c23a2a"], ktv:["#3a2a4a","#e83a8a"], tpe:["#d0d4d8","#e86a2a"], hotel:["#e8e4dc","#2a3a4a"], su_home:["#e8e0d8","#8a8a9a"] };
  EP10.setting = { pawn:"town", police:"city", morgue:"city", rest:"town", station:"city", tp_police:"city", tp_apt:"city", bar:"city", ktv:"city", tpe:"city", hotel:"city", su_home:"city" };
  const SKY10 = [ ["#0b0f1c","#27324a","#18241f","#1d2c25",0,1], ["#6fa0d0","#cfe3ee","#4f7a4a","#5f8a5a",0,0], ["#7a90a8","#c6d2da","#5a6a70","#6a7a80",0,0] ];
  EP10.worldSky = ph => SKY10[Math.min(ph || 0, SKY10.length - 1)];
  EP10.roomDesc = {
    pfront:"遠興當舖的前廳。高高的櫃台，上面有鐵欄杆。", pback:"當舖後面的辦公室。一張大辦公桌，一個保險箱，一扇後門。", palley:"後巷。很窄，地上濕濕的。", pfish:"隔壁阿枝魚丸的後廚。",
    cpolice:"澄港市刑大。", cmorgue:"法醫室。老錢的地盤。",
    rhall:"海口小館的用餐區。牆上寫著「清蒸午仔魚」。", rkitchen:"廚房。地上黏著亮晶晶的魚鱗。", roffice:"小小的辦公室，牆上釘滿帳單。",
    splat:"高鐵澄港站 2 號月台。", soffice:"站務室。",
    tpol:"萬華分局借你們的會議室。", tdoor:"西園路老公寓的一樓。", tstair:"二樓到三樓的樓梯。三樓的轉角，有粉筆畫的人形。", t4f:"四樓，方國良家的門口。", troof:"通往頂樓加蓋的樓梯間。", tflat:"三樓，許家。有酒味。",
    tbar:"阿娥小吃部。白天沒開店。", kktv:"星光 KTV 的大廳。", ttpe:"台北車站的鐵路警察隊。", nlobby:"南港商旅的櫃台。", nroom:"1207 號房。", sroom:"蘇雅婷的小套房。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police" };
  EP10.world = {};
  EP10.locations.forEach(l => { EP10.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP10.world.pawn, {
    extras: [
      { id:"cop10", name:"派出所員警", phase:0, until:0, x:RX(0) + 30, L:COP, pose:"stand", facing:1, lines:[
        "我們 22:50 到的。前門鐵門拉下來，我們從後巷進來。", "吳伯伯一直在發抖，我叫他坐著，他不肯。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長，死者馮志遠，58 歲，這間當舖的老闆。每個禮拜四晚上，他一個人留下來關帳。", "小吳"),
      say("wu", "22:35 老店員回來拿藥，發現他趴在後面的辦公桌上。後腦被打了好幾下。前門的鐵門是拉下來的。", "小吳"),
      say("you", "那兇手是從哪裡進來的，又是從哪裡出去的？", "你"),
      say("wu", "老錢和許知夏已經在後面了。01:30 遺體就要送走。", "小吳"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳")
    ]
  });
  EP10.mapPos = { pawn:[44,64,"u"], police:[24,96,"l"], morgue:[60,104,"d"], rest:[76,52,"r"], station:[100,84,"d"],
    tp_police:[160,70,"l"], tp_apt:[176,90,"d"], bar:[200,96,"r"], ktv:[196,52,"u"], tpe:[176,40,"u"], hotel:[226,30,"u"], su_home:[214,64,"r"] };
  EP10.mapRoads = [["pawn","rest"],["pawn","police"],["police","morgue"],["pawn","station"],["morgue","station"],
    ["tpe","tp_police"],["tp_police","tp_apt"],["tp_apt","bar"],["tpe","ktv"],["ktv","su_home"],["tpe","hotel"],["su_home","hotel"]];
  EP10.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#3a5a4a"); dither(0, 0, 240, 135, "#345244", 3);
    R(0, 110, 120, 25, "#2a4a6a"); dither(0, 110, 120, 25, "#3a5a7a", 4);   // 澄港的海
    R(8, 40, 110, 70, "#6a6a5a"); dither(8, 40, 110, 70, "#5a5a4a", 4);   // 澄港
    R(140, 20, 96, 96, "#7a7a7a"); dither(140, 20, 96, 96, "#6a6a6a", 4);   // 台北
    for (let x = 104; x < 176; x += 2) R(x, 84 - Math.round((x - 104) * 0.6), 2, 2, "#e86a2a");   // 高鐵線
    R(14, 4, 40, 10, "#1a1a1a"); R(150, 4, 40, 10, "#1a1a1a");
    const g = PR.g ? null : null;
    for (let k = 0; k < 3; k++){ const x = 104 + ((t * 30 + k * 30) % 72); R(x, 82 - Math.round((x - 104) * 0.6), 4, 3, "#f4f4f0"); }   // 列車
  };
})();
