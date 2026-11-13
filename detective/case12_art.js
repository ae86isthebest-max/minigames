/* =========================================================
   第 12 集：像素畫、人物造型、結案、走動畫面、地圖、開場
   ========================================================= */
EP12.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, OBJ, windowBox, door, sign, lamp, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const kf = (v, p) => Array.isArray(v) ? (() => { if (v.length === 1) return v[0]; const k = p * (v.length - 1), i = Math.min(v.length - 2, Math.floor(k)); return v[i] + (v[i + 1] - v[i]) * (k - i); })() : v;
  const stOf = o => { if (!o.ds) return [{}, 0]; const [i, p] = beatAt(o.t || 0, o.ds); return [(o.seq || [])[i] || {}, p]; };
  const sea = (y, h, t) => { R(0, y, W, h, "#2a5a7a"); for (let x = 0; x < W; x += 6) R(x, y + 2 + Math.round(Math.sin((t || 0) * 2 + x / 9)), 4, 1, "#5a8aaa"); };
  const boatHull = (x, y, w, c, name) => { R(x, y, w, 12, c); R(x + 4, y + 12, w - 8, 4, "#3a2a2a"); R(x, y - 2, w, 2, "#e9e4da"); if (name) txt(name, x + 6, y + 9, "#f4f0e0", "5px sans-serif"); R(x + w - 26, y - 16, 18, 14, "#e9e4da"); R(x + w - 24, y - 13, 6, 5, "#5a8aa0"); R(x + w - 16, y - 13, 6, 5, "#5a8aa0"); R(x + w - 18, y - 30, 2, 14, "#5a5a5a"); };

  /* ---------- 場景 ---------- */
  // 趙家・客廳
  SC.m12_home = (o) => {
    wall(72, "#e4dcc8", false); R(0, 64, W, 8, "#9a8a70");
    R(20, 16, 24, 18, "#8a6a3a"); R(22, 18, 20, 14, "#9cc5e6"); R(22, 26, 20, 6, "#3a6a8a"); R(26, 23, 3, 5, "#e8c09a"); R(30, 23, 3, 5, "#e8c09a"); R(34, 24, 3, 4, "#e8c09a"); R(38, 22, 3, 6, "#b88a60"); R(24, 28, 16, 3, "#c23a2a");   // 全家福（船頭）
    R(60, 14, 16, 20, "#f4f0e0"); R(60, 14, 16, 3, "#c23a2a"); for (let k = 0; k < 4; k++) R(61, 19 + k * 3, 14, 1, "#c8c0b0"); R(70, 28, 4, 3, "#e04a3a");   // 月曆
    R(84, 50, 50, 14, "#7a5a3a"); R(82, 46, 54, 6, "#8a6a4a"); R(90, 40, 12, 6, "#c8b898");   // 舊沙發
    R(100, 62, 30, 3, "#6b4a2b"); R(104, 65, 2, 9, "#5a3e24"); R(124, 65, 2, 9, "#5a3e24"); R(108, 58, 8, 4, "#f4f0e0");   // 茶几
    R(150, 30, 16, 14, "#f4f4f0"); R(152, 32, 12, 10, "#e8e8e8"); R(153, 34, 4, 3, "#c23a2a"); R(158, 34, 4, 3, "#f4f4f4");   // 藥櫃
    R(170, 14, 20, 58, "#9cc5e6"); R(172, 16, 16, 30, "#c8dce8"); R(170, 46, 20, 2, "#5a5a5a"); R(176, 50, 12, 6, "#8a8a8a"); R(178, 49, 8, 2, "#c8c8c8");   // 陽台門、菸灰缸
    R(130, 30, 14, 16, "#2a2a2e"); R(131, 31, 12, 10, "#3a4a5a");   // 電視
    lamp(96, 0, "#f8e8c8");
    floor(72, "#b8a888", "#a89878");
  };
  // 趙家・書房
  SC.m12_study = (o) => {
    wall(72, "#d8d0bc", false); R(0, 64, W, 8, "#8a7a64");
    R(10, 14, 36, 58, "#6b4a2b"); for (let r = 0; r < 4; r++){ R(12, 22 + r * 12, 32, 2, "#4a3020"); for (let k = 0; k < 6; k++) R(13 + k * 5, 14 + r * 12, 4, 8, ["#7a2a2a", "#2a4a6a", "#3a5a3a", "#c8a050"][(k + r) % 4]); }   // 書櫃
    R(60, 52, 60, 4, "#6b4a2b"); R(62, 56, 3, 18, "#5a3e24"); R(115, 56, 3, 18, "#5a3e24"); R(66, 44, 14, 8, "#2a2a2e"); R(67, 45, 12, 6, "#3a5a7a");   // 書桌、電腦
    for (let k = 0; k < 3; k++){ R(84 + k * 10, 56 + k * 3, 10, 4, "#8a6a4a"); R(85 + k * 10, 57 + k * 3, 8, 1, "#5a3e24"); }   // 拉出來的抽屜
    R(140, 14, 20, 16, "#3a3a3a"); R(142, 16, 16, 12, "#a8a8a8"); for (let k = 0; k < 6; k++) P(143 + k * 2, 22, "#2a2a2a");   // 警校畢業照
    R(150, 48, 14, 10, "#c8a050"); R(152, 46, 10, 3, "#e8c040");   // 首飾盒
    lamp(90, 0, "#f8e8c8");
    floor(72, "#a89878", "#988868");
    for (let k = 0; k < 9; k++) R(24 + (k * 17) % 90, 78 + (k * 7) % 14, 10, 6, ["#f4f0e0", "#e8e0d0", "#f4e8c8"][k % 3]);   // 地上的文件
    R(40, 86, 18, 6, "#f4f0e0"); R(42, 88, 10, 1, "#c23a2a");   // 借據
    R(101, 89, 5, 2, "#8a4ac8"); P(103, 88, "#8a4ac8");   // 紫色髮圈
  };
  // 趙家・以晴的房間
  SC.m12_girl = (o) => {
    wall(72, "#e8e0f0", false); R(0, 64, W, 8, "#a898b8");
    R(80, 14, 20, 26, "#f4f4f0"); R(82, 16, 16, 6, "#2a3a6a"); R(82, 24, 16, 1, "#3a3a3a"); R(82, 27, 12, 1, "#3a3a3a"); R(84, 30, 12, 6, "#c23a2a"); R(86, 32, 8, 1, "#3a6ab8");   // 警大簡章
    R(20, 62, 50, 4, "#c8b898"); R(22, 66, 3, 8, "#a89878"); R(65, 66, 3, 8, "#a89878"); R(40, 56, 16, 6, "#f4f0e0"); R(42, 58, 10, 1, "#3a3a3a"); R(26, 52, 10, 10, "#3a3a44");   // 書桌、收據、書
    R(140, 44, 48, 30, "#c8b8d8"); R(140, 40, 48, 6, "#f4f0f4"); R(176, 36, 12, 8, "#f4f4f4");   // 床
    R(120, 60, 16, 14, "#3a5a8a"); R(122, 56, 12, 5, "#2a4a7a");   // 書包
    R(110, 14, 22, 20, "#f4d4e0"); txt("考上", 113, 26, "#c23a2a", "6px sans-serif");   // 便條
    lamp(96, 0, "#f8f0f8");
    floor(72, "#c8bcd0", "#b8acc0");
  };
  // 派出所・值班台
  SC.m12_station = (o) => {
    wall(72, "#d8dce0", false); R(0, 64, W, 8, "#6a7a8a");
    R(40, 8, 110, 12, "#2a4a7a"); txt("中正派出所", 74, 17, "#ffffff", "8px sans-serif");
    R(60, 56, 90, 18, "#8a9aa8"); R(58, 52, 94, 5, "#aab8c4"); R(100, 48, 24, 8, "#f4f0e0"); R(102, 50, 20, 1, "#3a3a3a");   // 值班台、日誌
    R(160, 30, 14, 12, "#2a2a2e"); P(166, 34, "#6fd46f"); R(162, 38, 10, 2, "#5a5a5a");   // 無線電
    R(10, 22, 30, 24, "#f4f0e0"); for (let k = 0; k < 5; k++) R(12, 25 + k * 4, 26, 1, "#3a3a3a"); R(14, 24, 10, 8, "#c8c8c8");   // 協尋單
    lamp(30, 0, "#f4f4e8");
    floor(72, "#a8b0b8", "#98a0a8");
  };
  // 派出所・更衣室
  SC.m12_locker = (o) => {
    wall(72, "#c8ccd0", false); R(0, 64, W, 8, "#6a6e74");
    for (let k = 0; k < 6; k++){ const x = 20 + k * 28; R(x, 20, 26, 54, "#7a8a9a"); R(x + 2, 22, 22, 50, "#8a9aa8"); R(x + 20, 44, 2, 6, "#3a3a3e"); R(x + 6, 26, 14, 4, "#f4f0e0"); }
    R(22, 22, 22, 50, "#2a2a30"); R(24, 26, 18, 8, "#3a5a8a"); R(24, 36, 18, 2, "#5a5a5a"); R(26, 30, 4, 3, "#1a1a1a"); R(34, 40, 8, 10, "#e8c8a8");   // 打開的置物櫃（制服、手機、照片）
    R(88, 66, 40, 4, "#8a6a4a"); R(90, 70, 3, 4, "#5a3e24"); R(123, 70, 3, 4, "#5a3e24");   // 長椅
    lamp(100, 0, "#f4f4e8");
    floor(72, "#9aa0a6", "#8a9096");
    R(100, 62, 16, 4, "#f4f0e0"); R(101, 63, 10, 1, "#2a4a8a");   // 長椅上的公文
    R(70, 82, 14, 12, "#5a5a60"); R(69, 80, 16, 3, "#6a6a70"); R(73, 79, 6, 3, "#e8e040");   // 垃圾桶、預付卡盒
  };
  // 觀海台・停車場
  SC.m12_cliff = (o) => { const [s, p] = stOf(o), night = o.night || s.night;
    R(0, 0, W, 50, night ? "#0b0f1c" : "#8ab0d0"); R(0, 40, W, 10, night ? "#1a2230" : "#c8dce8"); sea(46, 18, o.t);
    R(0, 62, W, 46, "#6a6a62"); dither(0, 62, W, 46, "#5a5a54", 4);
    for (let x = 0; x < W; x += 12) R(x, 76, 8, 1, "#e8e8e0");
    OBJ.car(36, 58, "#b8bcc4"); R(42, 64, 6, 3, "#7a1a1a"); R(56, 63, 4, 2, "#7a1a1a");   // 銀色轎車（駕駛座的血）
    if (!o.clean){ R(78, 66, 36, 4, "#3a6ab8"); R(80, 62, 10, 6, "#e8ecf0"); R(81, 63, 8, 4, "#f4f0e0"); P(84, 64, "#7a1a1a"); R(100, 62, 10, 6, "#e8ecf0"); R(101, 63, 8, 4, "#f4f0e0"); }   // 鑑識攤開的證物袋：衛生紙、收據
    R(150, 30, 24, 18, "#e8e0c8"); R(152, 32, 20, 2, "#c23a2a"); for (let k = 0; k < 3; k++) R(152, 36 + k * 3, 18, 1, "#3a3a3a"); R(160, 48, 3, 26, "#6a6a6a");   // 告示牌
    R(118, 78, 30, 2, "#6b4a2b"); R(119, 80, 2, 6, "#5a3e24"); R(145, 80, 2, 6, "#5a3e24"); R(116, 86, 34, 3, "#8a6338"); R(118, 89, 2, 9, "#5a3e24"); R(146, 89, 2, 9, "#5a3e24");   // 長椅
    if (s.butts) for (let k = 0; k < Math.round(kf(s.butts, p)); k++) P(122 + k * 3, 97 - (k % 2), "#e8e0c8");   // 地上的菸蒂
    if (s.truck !== undefined){ const x = Math.round(Array.isArray(s.truck) ? s.truck[0] + (s.truck[1] - s.truck[0]) * p : s.truck); R(x, 58, 40, 14, "#3a6ab8"); R(x + 28, 52, 12, 10, "#3a6ab8"); R(x + 30, 54, 8, 5, "#9cc5e6"); R(x + 4, 72, 7, 4, "#1a1a1a"); R(x + 28, 72, 7, 4, "#1a1a1a"); txt("金水水產", x + 4, 67, "#f4f0e0", "5px sans-serif"); if (night) R(x + 40, 60, 14, 4, "#f8e8a066"); }
    if (night){ PR.g().fillStyle = "rgba(10,14,30,.45)"; PR.g().fillRect(0, 0, W, H); }
    if (o.tape) OBJ.tape(20, 84, 30);
  };
  // 觀海台・欄杆邊
  SC.m12_view = (o) => {
    R(0, 0, W, 40, "#8ab0d0"); sea(36, 30, o.t);
    R(0, 66, W, 42, "#6a7a4a"); for (let x = 2; x < W; x += 3) R(x, 60 + (x % 5), 1, 8, "#8a9a5a");   // 芒草
    R(40, 60, 100, 2, "#6a5a4a"); for (let x = 40; x < 140; x += 10) R(x, 60, 2, 14, "#6a5a4a"); R(40, 66, 100, 1, "#6a5a4a");   // 欄杆
    R(10, 40, 3, 34, "#6a5a4a"); R(13, 42, 14, 6, "#e86a2a");   // 海巡布條
    R(150, 64, 30, 4, "#8a6a4a"); R(152, 68, 2, 6, "#5a3e24"); R(176, 68, 2, 6, "#5a3e24"); for (let k = 0; k < 4; k++) R(150 + k * 4, 76, 3, 1, "#f4f0e0");   // 長椅、菸蒂
    floor(74, "#7a7a6a", "#6a6a5a");
  };
  // 王內科
  SC.m12_clinic = (o) => {
    wall(72, "#e8f0ec", false); R(0, 64, W, 8, "#7aa898");
    R(70, 8, 52, 10, "#2f7a6a"); txt("王內科診所", 78, 16, "#ffffff", "6px sans-serif");
    R(90, 56, 70, 18, "#d8e0dc"); R(88, 52, 74, 5, "#b8c8c0"); R(100, 46, 22, 8, "#f4f4f0"); for (let k = 0; k < 3; k++) R(102, 48 + k * 2, 18, 1, "#5a5a5a");   // 櫃台、病歷
    R(140, 48, 14, 6, "#c8a878"); for (let k = 0; k < 4; k++) R(141 + k * 3, 46, 2, 3, "#f4f4f4");   // 衛生紙籃
    R(60, 40, 14, 12, "#e8e8e8"); R(62, 42, 10, 4, "#2a3a2a"); P(64, 43, "#6fd46f"); R(62, 47, 8, 2, "#c23a2a");   // 血壓機
    R(10, 50, 50, 6, "#8aa8c8"); R(12, 56, 3, 18, "#5a6a7a"); R(55, 56, 3, 18, "#5a6a7a");   // 候診椅
    R(20, 16, 24, 30, "#f4f4f0"); R(24, 20, 16, 2, "#c23a2a"); R(30, 24, 4, 16, "#c23a2a"); R(24, 30, 16, 4, "#c23a2a");   // 血壓海報
    lamp(166, 0, "#f4f8f4");
    floor(72, "#d0dcd8", "#c0ccc8");
  };
  // 標哥茶行
  SC.m12_teashop = (o) => {
    wall(72, "#5a3a24", true); R(0, 64, W, 8, "#3a2414");
    for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++){ R(12 + k * 9, 14 + r * 14, 7, 10, ["#c8a050", "#6a8a4a", "#8a3a2a"][(k + r) % 3]); R(12 + k * 9, 24 + r * 14, 7, 2, "#3a2414"); }   // 茶葉罐
    R(70, 60, 60, 14, "#7a4a2a"); R(68, 56, 64, 5, "#9a6a3a"); R(80, 52, 20, 5, "#e8d8b0"); R(82, 53, 16, 1, "#3a3a3a"); R(110, 50, 10, 6, "#6a3a2a");   // 櫃台、帳本、茶壺
    R(140, 16, 24, 20, "#c8a040"); R(142, 18, 20, 16, "#c23a2a"); R(146, 22, 12, 8, "#e8c09a");   // 婚宴照
    R(170, 20, 18, 52, "#3a2414"); R(172, 24, 14, 44, "#2a1a0e"); txt("2F", 174, 32, "#8a6a4a", "5px monospace");   // 往二樓
    lamp(96, 0, "#f8d898");
    floor(72, "#6a4a30", "#5a3e24");
  };
  // 南澳漁港・加油碼頭
  SC.m12_fuel = (o) => {
    R(0, 0, W, 54, "#9cc5e6"); sea(54, 20, o.t);
    R(0, 70, W, 38, "#7a7a72"); R(0, 70, W, 2, "#a8a8a0");
    R(30, 50, 20, 24, "#e8c040"); R(34, 44, 12, 8, "#c23a2a"); R(36, 54, 4, 20, "#2a2a2a");   // 漁船泵
    R(110, 28, 50, 44, "#e8e8e0"); R(108, 24, 54, 6, "#c23a2a"); R(120, 40, 20, 14, "#9cc5e6"); R(122, 46, 14, 6, "#f4f0e0");   // 加油亭（窗口）
    R(150, 10, 10, 8, "#2a2a2e"); P(154, 13, "#e04a3a");   // 監視器
    boatHull(60, 50, 44, "#3a6ab8", "");
    floor(80, "#6a6a62", "#5a5a54");
    if (o.thermos){ R(86, 82, 12, 9, "#c84a3a"); R(88, 80, 8, 3, "#a83a2a"); }
  };
  // 南澳漁港・港務站
  SC.m12_port = (o) => {
    wall(72, "#e0e4e8", false); R(0, 64, W, 8, "#3a6a8a");
    R(20, 14, 40, 30, "#f4f0e0"); for (let k = 0; k < 6; k++) R(22, 18 + k * 4, 34, 1, "#3a3a3a"); R(22, 38, 30, 1, "#c23a2a");   // 出港公告欄
    R(70, 60, 60, 14, "#8a9aa8"); R(68, 56, 64, 5, "#aab8c4"); R(80, 50, 24, 8, "#f4f4f0"); R(82, 52, 20, 1, "#3a3a3a"); R(82, 55, 14, 1, "#c23a2a");   // 櫃台、出港申請
    windowBox(146, 14, 36, 26, "#9cc5e6"); R(148, 32, 32, 6, "#2a5a7a"); R(152, 28, 14, 4, "#3a6ab8"); R(150, 40, 12, 7, "#1a1a1e"); R(151, 41, 10, 4, "#2a3a4a");   // 監視器螢幕
    lamp(100, 0, "#f4f4e8");
    floor(72, "#b8c0c8", "#a8b0b8");
  };
  // 南澳魚市場・龍叔的茶室
  SC.m12_tea = (o) => {
    wall(72, "#d8ccb0", false); R(0, 64, W, 8, "#7a6a50");
    R(70, 8, 50, 12, "#6a2a1a"); txt("漁獲豐收", 78, 17, "#f2c94c", "7px serif");   // 匾額
    R(60, 62, 64, 4, "#5a3a24"); R(64, 66, 3, 8, "#4a2e1c"); R(117, 66, 3, 8, "#4a2e1c"); R(80, 56, 20, 6, "#3a2a20"); R(86, 52, 8, 5, "#7a3a2a"); for (let k = 0; k < 4; k++) R(81 + k * 5, 58, 3, 3, "#e8e0d0");   // 茶几、紫砂壺
    R(140, 14, 40, 24, "#f4f4f4"); for (let k = 0; k < 5; k++) R(142, 17 + k * 4, 30 - k * 3, 1, "#2a4a8a");   // 拍賣板
    R(10, 20, 24, 30, "#c8d0d8"); R(12, 22, 20, 8, "#8a9aa8"); R(14, 26, 16, 1, "#3a3a3a");   // 冷氣
    lamp(40, 0, "#f8e8b8");
    floor(72, "#9a8a6a", "#8a7a5a");
  };
  // 福滿 12 號・甲板
  SC.m12_deck = (o) => {
    R(0, 0, W, 50, "#9cc5e6"); sea(50, 10, o.t);
    R(0, 60, W, 48, "#3a6ab8"); R(0, 58, W, 3, "#e9e4da"); R(0, 70, W, 38, "#6a5a4a"); dither(0, 70, W, 38, "#5a4a3a", 4);   // 甲板
    R(140, 20, 40, 40, "#e9e4da"); R(144, 26, 10, 8, "#5a8aa0"); R(158, 26, 10, 8, "#5a8aa0"); R(170, 0, 3, 20, "#5a5a5a"); txt("福滿12", 144, 50, "#3a6ab8", "6px sans-serif");   // 駕駛艙
    for (let k = 0; k < 12; k++) R(40 + k * 5, 62 + (k % 3), 4, 12, "#5a8a6a"); dither(40, 60, 60, 16, "#3a6a4a", 2);   // 漁網
    R(110, 70, 20, 4, "#2a2a2a"); R(112, 64, 16, 6, "#4a3a2a");   // 船艙口
    floor(80, "#6a5a4a", "#5a4a3a");
  };
  // 福滿 12 號・船艙
  SC.m12_hold = (o) => {
    R(0, 0, W, H, "#2a2420"); for (let k = 0; k < 8; k++) R(0, 10 + k * 10, W, 1, "#3a3028");
    R(10, 30, 50, 44, "#3a4a5a"); R(12, 32, 46, 40, "#2a3a4a"); for (let k = 0; k < 4; k++) R(14, 36 + k * 9, 42, 2, "#4a5a6a");   // 魚艙
    R(96, 4, 6, 6, "#f8d898"); dither(80, 10, 40, 30, "#f8d89822", 3);   // 燈
    floor(74, "#4a3a2a", "#3e3022");
    R(120, 70, 48, 8, "#8a8aa8"); R(122, 68, 44, 3, "#a8a8c0");   // 床墊
    R(124, 62, 16, 8, "#1a1a1e"); for (let k = 0; k < 4; k++) R(144 + k * 4, 64, 3, 5, "#f4f4f0"); R(160, 62, 6, 4, "#e8e8e8"); R(161, 63, 4, 2, "#8a8aa0");   // 旅行袋、藥袋、照片
  };

  /* ---------- 文字有提到的小東西（畫清楚，跟文字一致） ---------- */
  const wrap12 = (n, fn) => { const b = SC[n]; SC[n] = Object.assign((o) => { b(o); fn(o); }, b); };
  wrap12("m12_home", () => { R(2, 58, 14, 14, "#7a5a3a"); R(2, 58, 14, 1, "#9a7a5a"); R(2, 65, 14, 1, "#5a3e24"); R(4, 55, 10, 3, "#1a1a1e"); P(6, 55, "#9a9aa0"); P(11, 55, "#9a9aa0"); });   // 鞋櫃、擦亮的皮鞋
  wrap12("m12_cliff", () => { R(121, 43, 7, 3, "#f4f4f0"); R(119, 42, 4, 2, "#f4f4f0"); P(118, 42, "#e8a03a"); R(124, 42, 4, 1, "#9aa0a6"); P(122, 46, "#e8a03a"); P(125, 46, "#e8a03a"); });   // 欄杆上的海鷗
  SC.c12_police = (o) => { SC.police(o); R(100, 22, 18, 48, "#6b4a2b"); R(102, 24, 14, 44, "#7a5a3a"); R(103, 28, 12, 4, "#e9e4da"); R(104, 29, 10, 1, "#3a3a3a"); R(114, 46, 2, 3, "#c9a24a"); R(102, 50, 14, 1, "#5a3e24"); };   // 周隊長的辦公室門
  SC.c12_lab = (o) => { SC.lab(o); R(98, 64, 16, 7, "#cfd6d6"); R(98, 64, 16, 1, "#9ab0b0"); R(104, 66, 4, 1, "#7a8a8a"); R(100, 62, 9, 3, "#1e3a1e"); R(101, 62, 3, 1, "#f2c94c"); };   // 小吳的抽屜，露出一包海苔
  wrap12("m12_fuel", () => { R(170, 80, 9, 6, "#e8e0d0"); R(170, 82, 4, 3, "#c8761a"); R(176, 78, 5, 4, "#e8e0d0"); P(177, 77, "#e8e0d0"); P(180, 77, "#e8e0d0"); P(177, 79, INK); R(168, 84, 3, 1, "#2a2a2a"); });   // 碼頭邊的花貓
  wrap12("m12_deck", () => { R(178, 0, 1, 16, "#7a6a54"); R(179, 1, 10, 7, "#e8c43a"); R(181, 3, 6, 3, "#c23a2a"); P(188, 8, "#e8c43a"); });   // 媽祖的旗子
  wrap12("m12_hold", () => { for (let i = 0; i < 4; i++) R(62 + i * 2, 21, 1, 6, "#c8b898"); R(61, 24, 8, 1, "#c8b898"); for (let i = 0; i < 3; i++) R(72 + i * 2, 21, 1, 6, "#c8b898"); });   // 牆上的刻痕

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    mei:  { skin:"#e0b48c", hair:"#2a2220", hairStyle:"bob", top:"#c8a8a0", bottom:"#3a3a4a", apron:"#e8d8c8", mood:"worried", hello:"他只是去看海……他說叫我先睡。",
            byPhase:{ 2:{ top:"#5a6a7a", apron:null, mood:"sad" } } },
    qing: { skin:"#f4d4bc", hair:"#1e1a18", hairStyle:"long", top:"#f4f6f6", bottom:"#2a3a6a", skirt:true, mood:"angry", hello:"他不會回來了，對不對？" },
    cai:  { skin:"#a87a50", hair:"#2a2220", hairStyle:"short", top:"#e8e0c8", bottom:"#3a4a5a", hat:"cap", capColor:"#c23a2a", mood:"worried", hello:"我在整網子，有事快講。" },
    biao: { skin:"#d8a880", hair:"#1a1410", hairStyle:"slick", top:"#c23a2a", bottom:"#2a2a2a", chain:true, mood:"smug", hello:"警察先生，喝茶。" },
    zhang:{ skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", mood:"worried", hello:"學長他……他不是壞人。" },
    wang: { skin:"#e8c8a8", hair:"#c8c8c8", hairStyle:"balding", top:"#e9e4da", coat:"#f4f6f6", bottom:"#3a3a4a", glasses:true, stetho:true, hello:"他的血壓，我說過他好多次了。" },
    fen:  { skin:"#d8a880", hair:"#3a2a20", hairStyle:"pony", top:"#c23a2a", bottom:"#3a3a3a", hat:"cap", capColor:"#e8c040", hello:"加油嗎？" },
    liu:  { skin:"#f0c8a8", hair:"#2a2220", hairStyle:"bob", top:"#e8ecf0", bottom:"#3a4a5a", glasses:true, hello:"出港申請要排隊喔。" },
    zhao: { skin:"#d8a880", hair:"#5a5a5a", hairStyle:"short", top:"#24324e", bottom:"#3a3a3a", mood:"tired", hello:"……我就知道，你會找到。" },
    li:   { hello:"明天十點以前，我要知道他是死是活。" },
    xu:   { hello:"血是從上面滴下來的。" },
    wu:   { hello:"學長，海巡說下面的海流很急……" }
  };
  ["li","xu","wu","zhao"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.xu.top) Object.assign(LOOK.xu, { skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"pony", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#2a2a30", glasses:true });
  if (!LOOK.wu.top) Object.assign(LOOK.wu, { skin:"#e8c09a", hair:"#1a1410", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4a6a", glasses:true });
  if (!LOOK.li.top) Object.assign(LOOK.li, { skin:"#e8c09a", hair:"#1a1410", hairStyle:"slick", top:"#f4f6f6", bottom:"#2a2a3a" });
  if (LOOK.zhao) LOOK.zhao.mood = "tired";
  const DAILY = {
    mei:  [ { room:"zliving", x:100, pose:"sit", doing:"坐在沙發上，手機一直握在手裡。" }, { room:"zliving", x:60, pose:"phone", doing:"在客廳講電話，看到你們就掛了。" }, { room:"hfuel", x:80, pose:"stand", doing:"提著一個保溫袋，站在碼頭邊。" } ],
    qing: [ { room:"zgirl", x:60, pose:"sit", doing:"坐在書桌前，題本一頁都沒翻。" }, { room:"zgirl", x:150, pose:"cry", doing:"抱著膝蓋坐在床上。" }, { room:"zgirl", x:60, pose:"write", doing:"在寫考卷，寫得很用力。" } ],
    cai:  [ { room:"hfuel", x:90, pose:"stand", doing:"在船邊捲纜繩。" }, { room:"hoffice", x:110, pose:"stand", doing:"在港務站櫃台前面等。" }, { room:"bdeck", x:120, pose:"cross", doing:"擋在船艙口前面。" } ],
    biao: [ { room:"tfront", x:100, pose:"cup", doing:"在櫃台後面泡茶。" } ],
    zhang:[ { room:"sdesk", x:120, pose:"stand", doing:"在值班台，一直看著門口。" }, { room:"slocker", x:110, pose:"sit", doing:"坐在更衣室的長椅上，看著學長的置物櫃。" } ],
    wang: [ { room:"croom", x:120, pose:"write", doing:"在櫃台寫病歷。" } ],
    fen:  [ { room:"hfuel", x:136, pose:"stand", doing:"在加油亭裡數零錢。" } ],
    liu:  [ { room:"hoffice", x:96, pose:"write", doing:"在櫃台蓋章。" } ],
    zhao: [ null, { room:"bhold", x:140, pose:"sit", doing:"坐在床墊上，看著女兒的照片。" } ],
    li:   [ null, { room:"pdesk", x:150, pose:"cross", doing:"站在你的位子旁邊，等你。" }, { room:"hfuel", x:170, pose:"cross", doing:"站在加油亭旁邊，看著碼頭。" } ],
    xu:   [ { room:"cpark", x:60, pose:"kneel", doing:"蹲在駕駛座旁邊，用放大鏡看血跡。" }, { x:40, pose:"read", doing:"在實驗台前寫報告。" } ],
    wu:   [ { room:"cview", x:100, pose:"stand", doing:"站在欄杆邊，往下看。" }, { x:110, pose:"stand", doing:"在電腦前面填調閱公文。" } ]
  };
  EP12.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP12.rooms = {
    zhaohome: [
      { id:"zliving", name:"客廳", scene:"m12_home", details:[
        { id:"d12_shoes", name:"門口的鞋櫃", hot:[2,58,14,14], text:"鞋櫃最上面一層，一雙擦得發亮的警用皮鞋。他上班穿的那雙不在。" } ] },
      { id:"zstudy", name:"書房", scene:"m12_study", details:[
        { id:"d12_book", name:"書櫃上的書", hot:[12,38,32,10], text:"書櫃中間一整排都是女兒以前的參考書，按年級排好，最新的一本是〈高三　學測總複習〉。" } ] },
      { id:"zgirl", name:"以晴的房間", scene:"m12_girl", details:[
        { id:"d12_note", name:"牆上的便條", hot:[110,14,22,20], text:"「考上」兩個大字下面，有一行很小的、別人的字：「加油　爸」。便條的邊被手指摸得起毛了。" } ] }
    ],
    station: [
      { id:"sdesk", name:"值班台", scene:"m12_station", details:[
        { id:"d12_flyer", name:"牆上的協尋單", hot:[10,22,30,24], text:"協尋單上的照片是趙德安的警員證照片。照片下面有人用原子筆寫了：「學長回來」。" } ] },
      { id:"slocker", name:"更衣室", scene:"m12_locker", details:[
        { id:"d12_tag", name:"置物櫃的名牌", hot:[26,26,14,4], text:"名牌寫著「趙德安」，旁邊貼著一張小貼紙：女兒國小時候畫的警察。" } ] }
    ],
    cliff: [
      { id:"cpark", name:"停車場", scene:"m12_cliff", opt:(ph) => ({ tape:ph === 0 }), details:[
        { id:"d12_gull", name:"欄杆上的海鷗", hot:[120,40,10,8], text:"一隻海鷗站在停車場邊的欄杆上，一直盯著那台銀色的車。" } ] },
      { id:"cview", name:"欄杆邊", scene:"m12_view", details:[
        { id:"d12_lock", name:"欄杆上的鎖", hot:[100,62,8,6], text:"欄杆上掛著一排情侶鎖，最舊的一個寫著：「德安♥美鳳　1998」。鏽得打不開了。" } ] }
    ],
    police: [ { id:"pdesk", name:"澄港市刑大", scene:"c12_police", details:[
      { id:"d12_zhou", name:"周隊長的門", hot:[100,22,18,46], text:"周隊長的辦公室門關著，裡面一直有人在講電話。你聽到他說了一句：「他是我學弟帶出來的。」" } ] } ],
    lab: [ { id:"lab", name:"鑑識中心", scene:"c12_lab", details:[
      { id:"d12_snack", name:"小吳的抽屜", hot:[97,61,18,11], text:"小吳的抽屜裡有一包海苔，上面貼著一張許知夏的便條：「國界以外的零食，充公。」" } ] } ],
    clinic: [ { id:"croom", name:"王內科・候診室", scene:"m12_clinic", details:[
      { id:"d12_poster", name:"牆上的海報", hot:[20,16,24,30], text:"「血壓 140 以上，請不要熬夜、不要生氣、不要開長途車。」海報上有人用原子筆圈了「不要生氣」。" } ] } ],
    casino: [ { id:"tfront", name:"標哥茶行", scene:"m12_teashop", details:[
      { id:"d12_stairs", name:"往二樓的樓梯", hot:[170,20,18,52], text:"樓梯口拉著一條紅繩，掛著「私人住宅」的牌子。樓上傳來洗牌的聲音。" } ] } ],
    harbour: [
      { id:"hfuel", name:"加油碼頭", scene:"m12_fuel", opt:(ph) => ({ thermos:ph === 2 }), details:[
        { id:"d12_cat", name:"碼頭邊的貓", hot:[170,78,10,8], text:"一隻胖胖的花貓蹲在碼頭邊，等漁船丟魚下來。" } ] },
      { id:"hoffice", name:"港務站", scene:"m12_port", details:[
        { id:"d12_clock", name:"牆上的潮汐表", hot:[146,42,36,8], text:"潮汐表：9/7 滿潮 08:42。漁船都想趕在滿潮前後出港。" } ] },
      { id:"hmarket", name:"魚市場・茶室", scene:"m12_tea", details:[
        { id:"d12_ac", name:"老冷氣", hot:[10,20,24,30], text:"冷氣上貼著一張紙：「颱風天請拔插頭」。字是很多年前寫的。" } ] }
    ],
    boat: [
      { id:"bdeck", name:"甲板", scene:"m12_deck", details:[
        { id:"d12_flag", name:"船頭的旗子", hot:[176,0,14,16], text:"船頭插著一面媽祖的旗子，被海風吹得啪啪響。" } ] },
      { id:"bhold", name:"船艙", scene:"m12_hold", details:[
        { id:"d12_tally", name:"牆上的刻痕", hot:[60,20,20,10], text:"船艙的木板上，有人用指甲刻了兩道痕。一天一道。" } ] }
    ]
  };
  const PS = [["m12_cliff",{ phase:0, tape:true }],["police",{}],["m12_fuel",{}]];
  EP12.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 結案 ---------- */
  EP12.looks = { zhaoC: Object.assign({}, LOOK.zhao, { hello:undefined, top:"#24324e" }), caiC: Object.assign({}, LOOK.cai, { hello:undefined }) };
  const RB = [
    { t:"23:12:00", d:3, cap:"9/4 23:12，觀海台。趙德安把車停在最靠海的格子，關掉自己的手機。手機最後一次連上的，是這裡的基地台。", st:{ night:true }, m:{ zhaoC:[62,98,null,1,62,80] } },
    { t:"23:12:30", d:2.5, join:true, cap:"9/4 23:12，觀海台。趙德安把車停在最靠海的格子，關掉自己的手機。手機最後一次連上的，是這裡的基地台。", st:{ night:true }, m:{ zhaoC:[62,98,"phone:R",1] } },
    { t:"23:20:00", d:3, cap:"鼻血又流下來了。他用診所的衛生紙一直擦，一滴一滴滴在方向盤上。他在長椅上坐了很久，抽了八根菸。", st:{ night:true }, m:{ zhaoC:[62,98,["raise:R@paper/#f4f4f0","stand","raise:R@paper/#f4f4f0"],-1] } },
    { t:"23:21:00", d:4, join:true, cap:"鼻血又流下來了。他用診所的衛生紙一直擦，一滴一滴滴在方向盤上。他在長椅上坐了很久，抽了八根菸。", st:{ night:true, butts:[0,8] }, m:{ zhaoC:[132,98,"sit+smoke:R",1,62,98] } },
    { t:"23:33:00", d:5, cap:"23:33，一台「金水水產」的小貨車開上來。", st:{ night:true, butts:8, truck:[-60,90] }, m:{ zhaoC:[132,98,"stand",-1] } },
    { t:"23:40:00", d:2.5, cap:"他用遙控器鎖上車門，把鑰匙放進口袋，上了小貨車。車子停在懸崖邊，車上有血——就像他已經不在了。", st:{ night:true, butts:8, truck:90 }, m:{ zhaoC:[96,98,"aim:R@remote",-1,132,98] } },
    { t:"23:40:10", d:2, join:true, cap:"他用遙控器鎖上車門，把鑰匙放進口袋，上了小貨車。車子停在懸崖邊，車上有血——就像他已經不在了。", st:{ night:true, butts:8, truck:90 }, m:{ zhaoC:[96,98,"pocket:R@key",-1] } },
    { t:"23:40:20", d:3, join:true, cap:"他用遙控器鎖上車門，把鑰匙放進口袋，上了小貨車。車子停在懸崖邊，車上有血——就像他已經不在了。", st:{ night:true, butts:8, truck:90 }, m:{ zhaoC:[124,80,null,1,96,98,[[124,98]]] }, out:["zhaoC"] },
    { t:"23:52:00", d:4.5, cap:"23:52，小貨車開下山，前座兩個人。23:58，他的預付卡手機在南澳漁港開機。", st:{ night:true, butts:8, truck:[90,-60] } }
  ];
  EP12.court = {
    title: "南澳漁港・福滿 12 號旁・9 月 7 日早上", scene: "m12_fuel",
    who: ph => ["mei","qing","cai","biao","zhang","zhao"],
    open: ph => "08:40，滿潮。福滿 12 號的引擎已經發動了。碼頭邊站著林美鳳、蔡金水，還有被張文華載來的以晴。黎光耀站在加油亭旁邊，看著錶。",
    kindLine: {
      hide: "趙德安沒有死，也沒有被誰帶走。他是自己走的，有人幫他。",
      taken: "趙德安是被人從觀海台帶走的。",
      sea: "趙德安在觀海台，從欄杆外面下去了。",
      flee: "趙德安帶著錢，一個人逃走了。"
    },
    murmur: [ "（以晴看著那艘船，咬著嘴唇。）", "（林美鳳手上的保溫袋，提把被她捏得變形。）", "（蔡金水把手上的菸捏熄了。）" ],
    confess: {
      mei: [ "我去報案，是因為他說：讓他們以為我死了，他們就不會去找以晴。", "我拿藥的時候，醫生問我他要去哪裡出差。我說不出來，就哭了。" ],
      cai: [ "他半夜站在觀海台，鼻子一直流血，一直跟我說對不起。", "十天。他說十天以後，他自己去找督察組。" ]
    },
    cornered: { mei: "……我只是想要我女兒平安。", cai: "要抓就抓我。船是我的。" },
    deny: {
      qing: "我只是在找存摺……我以為他不要我們了。",
      biao: "他三年前就跟我沒關係了。",
      zhang: "學長叫我跟黎組長說，他沒有要跑……",
      zhao: "……"
    },
    replayText: "9 月 4 日晚上 23:12，觀海台。他把車停在懸崖邊，關掉手機，鼻血又流了下來——",
    replay: { scene:"m12_cliff", opt:{ clean:true, seq:RB.map(b => b.st), ds:jds(RB) }, clean:true, cam:"案發經過重現", date:"2026-09-04", beats:RB },
    endGood: "09:00，福滿 12 號沒有出港。\n趙德安從船艙走出來的時候，以晴站在碼頭上。她沒有哭，只說了一句：「你不准再這樣。」\n黎光耀把他帶上車。車門關上以前，趙德安回頭看了你一眼。",
    endBad: "09:00，福滿 12 號出港了。\n十天以後它回來，船上少了一個人。蔡金水說，那個臨時工在北邊的港口下船了，不知道去了哪裡。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[12]){
    if (ARC_INTER[12].after) EP12.after = Object.assign({}, ARC_INTER[12].after, { scene:"s15_hall" });
    if (ARC_INTER[12].before) EP12.before = Object.assign({}, ARC_INTER[12].before, { scene:"police" });
  }

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP12.outScenes = ["m12_cliff","m12_view","m12_fuel","m12_deck"];
  EP12.fac = { zhaohome:["#c8b8a0","#5a4a3a"], station:["#d8dce0","#2a4a7a"], cliff:["#8ab0d0","#6a6a62"], police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"],
    clinic:["#e8f0ec","#2f7a6a"], casino:["#5a3a24","#c8a050"], harbour:["#e0e4e8","#3a6a8a"], boat:["#3a6ab8","#e9e4da"] };
  EP12.setting = { zhaohome:"town", station:"city", cliff:"town", police:"city", lab:"city", clinic:"town", casino:"town", harbour:"town", boat:"town" };
  const SKY12 = [ ["#7ab0e0","#e0eef4","#4a6070","#56707a",0,0], ["#9ab8d0","#e8e0d0","#4a6070","#56707a",0,0], ["#3a4a6a","#e8b890","#3a4a5a","#4a5a6a",0,0] ];
  EP12.worldSky = ph => SKY12[Math.min(ph || 0, SKY12.length - 1)];
  EP12.roomDesc = {
    zliving:"趙家的客廳。很舊，可是很乾淨。", zstudy:"書房。抽屜全被拉出來，文件倒了一地。", zgirl:"以晴的房間。牆上貼滿便條。",
    sdesk:"中正派出所的值班台。", slocker:"派出所的更衣室，一排鐵置物櫃。",
    cpark:"觀海台的停車場。一台銀色轎車孤零零地停在最靠海的格子。", cview:"觀海台的欄杆邊。下面是三十公尺的懸崖。",
    pdesk:"澄港市刑大。", lab:"鑑識中心。", croom:"王內科的候診室，量血壓的機器嗶嗶響。", tfront:"標哥茶行。一樓賣茶，二樓有洗牌的聲音。",
    hfuel:"南澳漁港的漁船加油碼頭。", hoffice:"港務站。辦出港申請的地方。", hmarket:"魚市場裡龍叔的小茶室。",
    bdeck:"福滿 12 號的甲板。", bhold:"福滿 12 號的船艙。柴油和魚的味道。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police" };
  const CG = { skin:"#c89a70", hair:"#1a1410", hairStyle:"short", top:"#e86a2a", bottom:"#24324e", hat:"cap", capColor:"#24324e" };
  EP12.world = {};
  EP12.locations.forEach(l => { EP12.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP12.world.cliff, {
    extras: [ { id:"cg12", name:"海巡隊員", phase:0, until:1, x:RX(1) + 40, L:CG, pose:"stand", facing:1, lines:[
      "我們從早上找到現在，下面的岸邊、定置網都看過了。", "這裡的海流往北。真的掉下去，三天內一定會在漁港外面的網子找到。" ] } ]
  });
  Object.assign(EP12.world.zhaohome, {
    extras: [ { id:"cop12", name:"派出所員警", phase:0, until:0, x:RX(0) + 30, L:COP, pose:"stand", facing:1, lines:[
      "趙太太九點二十打電話說書房被翻了，我們馬上過來。門鎖沒有被撬。", "趙巡佐是我們的學長……拜託你們快點找到他。" ] } ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長，失蹤的是中正派出所的巡佐趙德安，52 歲。就是六月海悅大樓那晚，帶隊封樓的那位。", "小吳"),
      say("wu", "禮拜五下班說要去看海，就沒回家。今天早上，他的車在觀海台被找到，駕駛座有血。", "小吳"),
      say("wu", "然後……他家書房早上被人翻了。禮拜一早上十點，督察組本來要約談他。", "小吳"),
      say("you", "車停在懸崖邊、座位上有血、家裡被翻、禮拜一要被約談。……每一樣都在叫我們往一個方向想。先看看。", "你"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  EP12.mapPos = { zhaohome:[110,44,"u"], station:[130,70,"r"], cliff:[210,30,"u"], police:[150,96,"r"], lab:[176,84,"d"], clinic:[86,64,"l"], casino:[70,40,"l"], harbour:[40,100,"d"], boat:[16,110,"l"] };
  EP12.mapRoads = [["zhaohome","station"],["station","police"],["police","lab"],["zhaohome","clinic"],["clinic","casino"],["zhaohome","cliff"],["clinic","harbour"],["harbour","boat"],["police","harbour"]];
  EP12.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    const blocks = (x0, y0, x1, y1, c, c2) => { for (let x = x0; x < x1; x += 8) for (let y = y0; y < y1; y += 7) { R(x, y, 6, 5, c); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, c2); } };
    blocks(60, 30, 190, 104, "#c8c0b0", "#b0a898");
    R(0, 112, 240, 23, "#3a6a8a"); R(196, 0, 44, 135, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 113 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");
    R(196, 20, 20, 20, "#6a7a4a"); R(204, 26, 8, 6, "#b8bcc4");   // 觀海台
    R(8, 104, 30, 8, "#7a7a72"); for (let k = 0; k < 3; k++) R(10 + k * 9, 114, 7, 3, ["#3a6ab8", "#c23a2a", "#e9e4da"][k]);   // 漁港
  };
})();
