/* =========================================================
   第 7 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP7.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, OBJ, windowBox, door, sign, lamp, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l), sky = (a, b, h) => PR.sky(a, b, h);
  const SC = PX.SCENES;
  const night = o => (o.phase || 0) === 0;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  // 監視器動畫：照 play() 的算法，算出現在播到第幾段、這段播了多少（scene 只拿得到 o.t）
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const lerp = (a, b, p) => a + (b - a) * p;
  const kf = (v, p) => Array.isArray(v) ? (v.length === 1 ? v[0] : (() => { const k = p * (v.length - 1), i = Math.min(v.length - 2, Math.floor(k)); return lerp(v[i], v[i + 1], k - i); })()) : v;
  const liftDoor = (x, y, w, h, open, inside) => {   // 電梯門：open 0（關）～1（全開）
    R(x - 3, y - 3, w + 6, h + 3, "#7a7e84"); R(x - 2, y - 2, w + 4, h + 2, "#b8bcc2");
    R(x, y, w, h, inside || "#3a3c40");
    const half = w / 2, sh = Math.round(half * (1 - open));
    R(x, y, sh, h, "#c8ccd2"); R(x + w - sh, y, sh, h, "#c8ccd2");
    if (sh > 2){ R(x + sh - 1, y, 1, h, "#8a8e94"); R(x + w - sh, y, 1, h, "#8a8e94"); for (let j = 4; j < h; j += 9){ R(x + 2, y + j, sh - 4, 1, "#d8dce2"); R(x + w - sh + 2, y + j, sh - 4, 1, "#d8dce2"); } }
  };
  const trihole = (x, y) => { R(x, y, 5, 4, "#2a2a2e"); P(x + 2, y, "#8a8e94"); P(x + 1, y + 2, "#1a1a1e"); P(x + 3, y + 2, "#1a1a1e"); };
  const display = (x, y, s, ins) => { R(x - 1, y - 1, 26, 10, "#5a5e64"); R(x, y, 24, 8, "#101010"); txt(s, x + 2, y + 6, "#ff4a2a"); if (ins) txt("INS", x + 12, y + 6, "#ffb030"); };

  /* ---------- 場景 ---------- */
  // 一樓大廳・管理室
  SC.t_lobby = (o) => { const n = night(o);
    wall(72, "#d4ccbc", false); R(0, 64, W, 8, "#8a7e6a"); R(0, 0, W, 5, "#9a907e");
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++){ R(10 + c * 8, 30 + r * 8, 7, 7, "#9aa0a6"); R(11 + c * 8, 33 + r * 8, 5, 1, "#3a3a3a"); }   // 信箱
    R(19, 46, 7, 7, "#f4f0e0"); R(20, 45, 5, 2, "#c23a2a");   // 14A 塞滿傳單
    R(52, 54, 60, 18, "#7a5a3a"); R(50, 52, 64, 3, "#a8845a"); R(62, 40, 14, 11, "#2a2a2e"); R(63, 41, 12, 8, n ? "#4a6a8a" : "#3a4a5a"); R(66, 51, 6, 2, "#2a2a2e");   // 管理台、小電視
    R(60, 56, 22, 8, "#f1ead8"); for (let i = 0; i < 3; i++) R(62, 58 + i * 2, 16, 1, "#6a6a6a"); R(90, 56, 18, 8, "#e8e4d0"); R(92, 58, 14, 1, "#3a6ab8");
    R(98, 48, 5, 6, "#3a6a8a"); R(99, 47, 3, 1, "#c8c8c8");   // 保溫杯
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++){ const x = 122 + c * 17, y = 15 + r * 14; R(x - 1, y - 1, 16, 12, "#2a2a2e"); R(x, y, 14, 10, (r === 1 && c === 2) ? "#050505" : "#1a2a3a"); for (let j = 0; j < 10; j += 2) R(x, y + j, 14, 1, "#00000033"); if (!(r === 1 && c === 2)) P(x + 3 + (c * 3 + r) % 8, y + 4 + r, "#e9e4da"); }
    R(118, 44, 72, 3, "#3a3a3e"); txt("B2", 158, 37, "#3a4a3a");
    R(170, 54, 4, 12, "#2a5a3a"); R(167, 50, 10, 5, "#3a8a4a"); R(168, 66, 8, 6, "#8a5a3a");   // 盆栽
    lamp(80, 0, "#f4e8c8"); lamp(150, 0, "#f4e8c8");
    floor(72, "#b8ac98", "#a89c88"); for (let x = 0; x < W; x += 24) R(x, 72, 1, 36, "#9a8e7a");
  };
  // 電梯口（一樓）
  SC.t_lift = (o) => {
    wall(72, "#d8d0c0", false); R(0, 64, W, 8, "#8a7e6a");
    R(20, 20, 30, 16, "#6a5a2a"); R(21, 21, 28, 14, "#8a7a3a"); for (let i = 0; i < 4; i++) R(24, 24 + i * 3, 22 - (i % 2) * 6, 1, "#4a3a1a");   // 銅牌
    R(24, 40, 22, 14, "#e4dccc");   // 下面比較白的方形痕跡
    display(84, 2, "1", false);
    trihole(97, 14);
    liftDoor(70, 22, 60, 50, o.open === undefined ? 1 : o.open, "#b8bcc2");
    if ((o.open === undefined ? 1 : o.open) > 0.5){ R(76, 26, 48, 40, "#a8acb2"); R(76, 52, 48, 2, "#d8dce2"); R(86, 30, 28, 12, "#f4f4ee"); R(88, 32, 24, 2, "#2a5a8a"); for (let i = 0; i < 3; i++) R(88, 36 + i * 2, 20 - i * 4, 1, "#6a6a6a"); R(118, 34, 4, 14, "#5a5e64"); for (let i = 0; i < 5; i++) P(119 + (i % 2), 36 + i * 2, "#e9e4da"); }
    R(136, 40, 6, 10, "#5a5e64"); P(138, 43, "#e9e4da"); P(138, 46, "#e9e4da");   // 叫車按鈕
    R(150, 6, 10, 3, "#d6d6d6"); R(152, 9, 6, 4, "#2a2a2e"); P(156, 10, "#e04a3a");
    R(166, 30, 22, 42, "#8a8e94"); R(168, 32, 18, 38, "#9aa0a6"); R(170, 34, 14, 8, "#2a8a4a"); txt("EXIT", 170, 40, "#e9e4da", "5px monospace");   // 樓梯間
    lamp(40, 0, "#f4e8c8");
    floor(72, "#b8ac98", "#a89c88");
  };
  // 管委會辦公室
  SC.t_committee = (o) => {
    wall(72, "#e0dccc", false); R(0, 64, W, 8, "#8a8a7a");
    OBJ.desk(20, 62, 60); R(30, 52, 26, 10, "#c8a050"); R(31, 53, 24, 2, "#a8803a"); R(34, 56, 18, 1, "#f4f0e0"); txt("2006", 36, 61, "#3a2a1a", "5px monospace");   // 檔案夾
    R(110, 18, 42, 28, "#f4f4ee"); R(110, 18, 42, 2, "#8a8a8a"); txt("59/60", 116, 30, "#c23a2a"); R(140, 36, 10, 7, "#f4e48a");   // 白板
    for (let i = 0; i < 3; i++){ R(150 + i * 13 - 4, 40, 12, 30, "#8a9098"); for (let j = 0; j < 3; j++){ R(152 + i * 13 - 4, 43 + j * 9, 8, 7, "#9aa0a8"); R(154 + i * 13 - 4, 46 + j * 9, 4, 1, "#3a3a3a"); } }
    R(152 + 13 - 4, 43, 8, 7, "#b0b6be");   // 2006 那格的把手比較亮
    windowBox(70, 12, 30, 22, "#9cc5e6");
    R(4, 14, 22, 30, "#f4f0e0"); R(6, 16, 18, 4, "#c23a2a"); for (let i = 0; i < 5; i++) R(6, 23 + i * 4, 16, 1, "#6a6a6a");   // 公告
    lamp(96, 0, "#f4f4e8");
    floor(72, "#9a9a8a", "#8a8a7a");
  };
  // 14 樓走廊
  SC.t_14 = (o) => {
    wall(74, "#e4dcc8", false); R(0, 66, W, 8, "#8a7e6a");
    display(23, 6, "14", false); trihole(32, 18); if (o.scratch !== false){ P(31, 18, "#e9e4da"); P(37, 19, "#e9e4da"); }
    liftDoor(20, 24, 30, 50, 0);
    if (o.grease !== false){ R(48, 46, 2, 4, "#1a1a1a"); }
    door(80, 30, 26, 44, "#6b4a2b"); R(84, 26, 18, 4, "#c9a24a"); txt("14A", 86, 30, "#3a2a1a", "4px monospace");
    if (o.phase === 0 || o.open){ R(80, 30, 8, 44, "#f4e8c0"); }   // 門開著，裡面的燈
    door(146, 30, 26, 44, "#4a5a6a"); R(150, 26, 18, 4, "#c9a24a"); R(154, 44, 10, 8, "#f4f4ee"); R(155, 46, 8, 1, "#3a3a3a"); R(150, 70, 8, 3, "#c23a2a"); R(160, 70, 4, 3, "#8a5a3a");   // 14B、狗碗
    R(176, 30, 16, 44, "#8a8e94"); R(178, 32, 12, 40, "#9aa0a6"); R(179, 34, 10, 6, "#2a8a4a");   // 樓梯門
    R(178, 8, 10, 3, "#d6d6d6"); R(180, 11, 6, 4, "#2a2a2e"); P(184, 12, "#e04a3a");
    lamp(96, 0, "#f4e8c8");
    floor(74, "#a89c88", "#988c78");
    if (o.tape){ OBJ.tape(70, 78, 50); }
    if (o.markers){ OBJ.marker(110, 84); OBJ.marker(40, 82); }
  };
  // 方家客廳
  SC.t_living = (o) => { const n = night(o);
    wall(72, "#e8dcc4", true); R(0, 64, W, 8, "#8a6a4a");
    R(18, 30, 44, 26, "#2a2a2e"); R(20, 32, 40, 20, n ? "#3a5a8a" : "#1a1a1e"); if (n){ R(22, 34, 16, 4, "#c23a2a"); R(22, 44, 30, 2, "#e9e4da"); } R(30, 56, 20, 16, "#6b4a2b");
    R(80, 52, 50, 20, "#7a3a2a"); R(78, 46, 54, 8, "#8a4a3a"); R(78, 50, 4, 22, "#6a2a1a"); R(128, 50, 4, 22, "#6a2a1a"); R(126, 48, 6, 2, "#2a2a2e");
    R(90, 18, 30, 20, "#c9a24a"); R(92, 20, 26, 16, "#a8c0a0"); R(100, 24, 8, 10, "#e8c09a");   // 牆上的全家福
    windowBox(140, 12, 20, 30, n ? "#141c30" : "#a8c8e0");
    door(162, 28, 24, 46, "#6b4a2b"); R(166, 64, 16, 8, "#8a6a4a"); R(168, 62, 5, 2, "#8a6a5a");   // 大門、鞋櫃、拖鞋一隻
    lamp(100, 0, "#f8e8b8");
    floor(72, "#a87a4a", "#986a3a");
  };
  // 方振華的書房
  SC.t_study = (o) => { const n = night(o);
    wall(72, "#d8ccb0", true); R(0, 64, W, 8, "#6b4a2b");
    for (let r = 0; r < 4; r++){ R(144, 6 + r * 10, 44, 2, "#5a3e24"); for (let i = 0; i < 9; i++) R(146 + i * 5, 0 + r * 10 + 1, 4, 5 + (i % 3), ["#7a1e24", "#2a4a6a", "#3a6a3a", "#c9a24a"][(i + r) % 4]); }
    R(144, 6, 2, 40, "#5a3e24"); R(186, 6, 2, 40, "#5a3e24");
    R(150, 46, 24, 24, "#3a3a3e"); R(152, 48, 20, 20, "#4a4a4e"); R(160, 54, 6, 6, "#8a8e94"); P(162, 56, "#2a2a2e");   // 保險箱
    windowBox(6, 10, 26, 30, n ? "#141c30" : "#a8c8e0");
    OBJ.desk(26, 61, 118);
    R(30, 52, 6, 6, "#c8b890"); R(30, 51, 6, 1, "#8a6a3a"); R(37, 54, 4, 4, "#e8e0c8");   // 茶壺、茶杯
    R(60, 54, 8, 4, "#8a6a3a"); R(61, 53, 6, 1, "#a8845a");   // 銅紙鎮
    R(100, 52, 18, 8, "#f4f0e0"); R(102, 54, 14, 1, "#2a5a8a"); R(110, 50, 6, 4, "#f4e48a");   // 都更合約、便條
    R(120, 52, 16, 8, "#6a4a3a"); R(121, 53, 7, 6, "#e8e0c8"); R(129, 53, 6, 6, "#e8e0c8"); R(122, 55, 4, 2, "#8a8a8a");   // 相簿
    R(84, 54, 8, 5, "#2a2a2e"); R(85, 55, 6, 3, "#c9a24a"); P(88, 56, "#f4f0e0");   // 錶盒、金錶
    if (!o.clean){ for (let i = 0; i < 3; i++) R(40 + i * 14, 66 + (i % 2) * 3, 10, 4, "#c8a070"); }   // 抽屜被拉出來
    floor(72, "#7a4a3a", "#6a3a2a"); R(30, 80, 130, 26, "#8a3a2a"); dither(30, 80, 130, 26, "#7a2a1a", 4);   // 地毯
    if (!o.clean){ R(18, 88, 10, 5, "#3a6a9a"); R(19, 89, 8, 1, "#e8e0c8"); R(44, 92, 6, 3, "#f4f0e0"); R(56, 96, 8, 2, "#e8e4d0"); R(62, 90, 5, 4, "#c8c0e0"); }   // 支票簿、散一地的東西
    if (o.body){ R(76, 86, 34, 8, "#8a8a8a"); R(70, 86, 8, 7, "#d8a880"); R(70, 85, 7, 2, "#c8c8c0"); R(108, 88, 8, 4, "#3a3a3e"); R(116, 88, 6, 3, "#8a6a5a"); R(84, 85, 8, 2, "#1a1a1a"); OBJ.blood(68, 92, 12); R(64, 84, 6, 2, "#d8a880"); }
    else if (o.outline) OBJ.outline(80, 86);
    if (o.markers){ OBJ.marker(64, 100); OBJ.marker(120, 98); OBJ.marker(44, 96); }
    lamp(80, 0, "#f8e8b8");
  };
  // 頂樓電梯機房
  SC.t_machine = (o) => {
    wall(72, "#9a9a92", false); R(0, 0, W, 6, "#6a6a62");
    for (let r = 0; r < 3; r++){ R(24, 26 + r * 12, 36, 2, "#5a5a5a"); for (let i = 0; i < 7; i++) R(26 + i * 5, 18 + r * 12, 4, 8, ["#2a4a6a", "#3a3a3a", "#6a2a2a"][(i + r) % 3]); }
    R(24, 26, 36, 40, "#00000000"); R(42, 42, 4, 8, "#f4f0e0");   // 2006 那本，少一頁
    R(100, 18, 40, 52, "#6a7a6a"); R(102, 20, 36, 48, "#7a8a7a"); R(106, 26, 12, 6, "#2a2a2e"); txt("NOR", 106, 40, "#e9e4da", "4px monospace"); txt("INS", 122, 40, "#ffb030", "4px monospace"); R(116, 42, 8, 8, "#2a2a2e"); P(119, 44, "#c8c8c8"); for (let i = 0; i < 4; i++) P(108 + i * 6, 58, ["#6fd46f", "#e04a3a", "#ffb030", "#6fd46f"][i]);
    R(150, 48, 32, 22, "#4a4a4e"); R(154, 44, 24, 6, "#5a5a5e"); for (let i = 0; i < 4; i++) R(162 + i * 3, 30, 1, 40, "#1a1a1a"); R(158, 52, 20, 14, "#3a3a3e"); R(150, 70, 32, 3, "#d8d0b0");   // 曳引機、鋼索、接油的報紙
    R(70, 30, 20, 16, "#d8d0b0"); R(72, 32, 16, 2, "#c23a2a"); txt("!", 78, 42, "#2a2a2a");   // 警告標示
    lamp(96, 0, "#e8e8d8");
    floor(72, "#7a7a72", "#6a6a62"); R(30, 74, 46, 6, "#2a2a2a"); dither(30, 74, 46, 6, "#3a3a3a", 2);   // 地上通往電梯井的開口（有欄杆）
    R(28, 62, 2, 18, "#c8a020"); R(76, 62, 2, 18, "#c8a020"); R(28, 62, 50, 2, "#c8a020");
  };
  // 地下二樓停車場
  SC.t_b2 = (o) => {
    R(0, 0, W, H, "#5a5a56"); R(0, 0, W, 6, "#3a3a38"); for (let x = 10; x < W; x += 40) R(x, 2, 20, 2, "#e9f2f8");
    R(0, 40, 30, 34, "#4a4a46"); for (let i = 0; i < 6; i++) R(0, 70 - i * 5, 30 - i * 3, 1, "#6a6a66"); txt("B1↑", 4, 38, "#e8c43a", "5px monospace");   // 往 B1 的車道
    R(60, 0, 10, 74, "#8a8a86"); R(60, 40, 10, 4, "#e8c43a"); R(60, 66, 12, 8, "#9a9a96");   // 柱子和底座
    if (!o.clean) R(62, 66, 4, 2, "#3a3a38");   // 鞋印
    liftDoor(100, 34, 30, 40, kf(o.door === undefined ? 0 : o.door, o.p || 0), "#b8bcc2"); display(103, 24, "B2", false);
    R(150, 10, 16, 3, "#d6d6d6"); R(152, 13, 10, 5, "#2a2a2e"); if (o.unplug !== false){ R(166, 6, 1, 14, "#1a1a1a"); R(165, 20, 3, 3, "#2a2a2a"); } else P(160, 15, "#e04a3a");   // B2 監視器
    R(170, 6, 2, 6, "#3a3a3a");   // 插座
    floor(74, "#5a5a56", "#4e4e4a"); for (let x = 30; x < W; x += 44) R(x, 76, 2, 32, "#e9e4da");
    R(133, 68, 8, 6, "#d8d0b0"); P(134, 67, "#f4f4e8"); P(137, 66, "#f4f4e8"); P(140, 67, "#e8e4d0"); R(135, 71, 4, 1, "#1a1a1a");   // 乾掉的白菊花
    if (o.cars !== false){ OBJ.car(150, 80, "#2a3a5a"); if (o.van) OBJ.car(76, 80, "#e9e4da"); }
    if (o.dash){ R(0, 96, W, 12, "#1a1a1e"); R(0, 0, W, 4, "#1a1a1e"); R(0, 0, 6, H, "#1a1a1e"); R(W - 6, 0, 6, H, "#1a1a1e"); R(80, 90, 32, 6, "#2a2a2e"); }
    lamp(96, 0, "#e8f0e8");
  };
  // 監視器：電梯車廂內（樓層顯示跟著動畫跑）
  SC.t_cab = (o) => {
    const [i, p] = o.ds ? beatAt(o.t || 0, o.ds) : [0, 0], s = (o.seq || [])[i] || {};
    R(0, 0, W, H, "#8a8e94"); R(0, 0, 40, H, "#7a7e84"); R(152, 0, 40, H, "#7a7e84");
    for (let x = 4; x < 40; x += 12) R(x, 6, 1, 70, "#6a6e74"); for (let x = 156; x < 188; x += 12) R(x, 6, 1, 70, "#6a6e74");
    R(0, 54, 40, 3, "#c8ccd2"); R(152, 54, 40, 3, "#c8ccd2");   // 扶手
    R(160, 22, 16, 30, "#5a5e64"); for (let k = 0; k < 8; k++){ P(164 + (k % 2) * 6, 25 + Math.floor(k / 2) * 6, "#e9e4da"); }   // 按鈕
    R(14, 16, 18, 22, "#f4f4ee"); R(16, 18, 14, 3, "#2a5a8a"); for (let k = 0; k < 4; k++) R(16, 23 + k * 3, 12 - k * 2, 1, "#6a6a6a");   // 限乘牌
    const fl = s.fl || ["1"], f = fl[Math.min(fl.length - 1, Math.floor(p * fl.length))];
    const open = kf(s.door === undefined ? 0 : s.door, p);
    liftDoor(68, 24, 56, 54, open, s.out || "#c8c0a8");
    display(84, 8, f, !!s.ins);
    if (s.over && Math.floor((o.t || 0) * 3) % 2 === 0){ R(70, 10, 12, 8, "#c23a2a"); txt("!", 74, 16, "#ffffff"); }
    R(0, 78, W, 30, "#5a5a5a"); dither(0, 78, W, 30, "#505050", 4); R(68, 78, 56, 2, "#9aa0a6");
    if (s.kids){ [[86, 100], [112, 100]].forEach(([x, y], k) => { R(x - 3, y - 15, 6, 6, "#e8c09a"); R(x - 3, y - 16, 6, 2, "#1a1410"); R(x - 4, y - 9, 8, 6, k ? "#e86a8a" : "#3a8ac8"); R(x - 3, y - 3, 2, 3, "#2a2a3a"); R(x + 1, y - 3, 2, 3, "#2a2a3a"); }); }
  };
  // 監視器：一樓大廳（攝影機在電梯口上方，看向大門）
  SC.t_lobbycam = (o) => {
    wall(74, "#d4ccbc", false);
    R(4, 22, 44, 52, "#3a4a5a"); R(6, 24, 40, 48, "#141c28"); R(25, 24, 2, 48, "#8a8e94"); txt("海悅", 14, 20, "#6a5a3a", "6px sans-serif");   // 大門
    R(70, 56, 50, 18, "#7a5a3a"); R(68, 54, 54, 3, "#a8845a"); R(80, 44, 12, 9, "#2a2a2e");   // 管理台
    R(150, 30, 30, 44, "#9aa0a6"); R(152, 32, 26, 40, "#b8bcc2"); R(164, 32, 1, 40, "#8a8e94");   // 電梯門
    R(4, 74, W, 2, "#a89c88"); floor(74, "#b8ac98", "#a89c88");
    lamp(96, 0, "#f4e8c8");
  };
  // 監視器：各樓層樓梯門（十五格）
  SC.t_stairs = (o) => {
    R(0, 0, W, H, "#101010");
    for (let k = 0; k < 15; k++){ const c = k % 5, r = Math.floor(k / 5), x = 4 + c * 37, y = 12 + r * 32; R(x, y, 35, 30, "#2a2e2a"); R(x + 12, y + 6, 12, 22, "#4a5048"); R(x + 13, y + 7, 10, 4, "#2a6a3a"); R(x, y + 26, 35, 4, "#3a3e3a"); txt((k + 1) + "F", x + 2, y + 8, "#c8d8c8", "5px monospace"); }
    // 有人經過的樓層：門打開、門口一個小小的人影（照每一段的 s.fig）
    const [bi, bp] = o.ds ? beatAt(o.t || 0, o.ds) : [0, 0], st = (o.seq || [])[bi] || {};
    (st.fig || []).forEach((k, j, arr) => { const show = arr.length < 2 || (j === 0 ? bp < 0.5 : bp >= 0.5); if (!show) return; const c = k % 5, r = Math.floor(k / 5), x = 4 + c * 37, y = 12 + r * 32;
      R(x + 13, y + 7, 10, 19, "#1a1e1a"); R(x + 16, y + 12, 5, 4, "#d8b090"); R(x + 15, y + 16, 7, 8, st.col || "#3a4a6a"); R(x + 16, y + 24, 2, 3, "#2a2a30"); R(x + 19, y + 24, 2, 3, "#2a2a30"); });
  };
  // 好運來麻將館
  SC.mj_hall = (o) => {
    wall(72, "#c8b890", true); floor(72, "#7a6a4a", "#6a5a3a"); R(0, 64, W, 8, "#6a4a2a");
    R(18, 24, 30, 22, "#a8845a"); R(20, 26, 26, 18, "#c8a070"); for (let i = 0; i < 4; i++) R(22 + (i % 2) * 12, 28 + Math.floor(i / 2) * 8, 10, 6, "#f4f0e0"); R(39, 36, 4, 3, "#c23a2a");   // 軟木板、欠條
    R(10, 50, 50, 14, "#5a3a2a"); R(8, 48, 54, 3, "#7a5a3a");   // 櫃台
    for (let k = 0; k < 2; k++){ const x = 70 + k * 64; R(x, 62, 48, 6, "#2a6a3a"); R(x - 2, 60, 52, 3, "#6b4a2b"); R(x + 4, 68, 3, 12, "#5a3e24"); R(x + 41, 68, 3, 12, "#5a3e24"); for (let i = 0; i < 6; i++) R(x + 6 + i * 6, 58, 4, 3, "#f4f0e0"); }
    R(96, 54, 8, 4, "#8a8a8a"); for (let i = 0; i < 5; i++) P(97 + i, 53, "#e9e4da");   // 堆滿的煙灰缸
    R(150, 4, 30, 10, "#2a2a2e"); R(152, 6, 6, 4, "#3a3a3e"); P(156, 8, "#e04a3a");   // 監視器
    R(110, 10, 30, 12, "#c23a2a"); txt("好運來", 113, 19, "#f4e48a", "7px sans-serif");
    lamp(96, 0, "#f8d898"); dither(0, 0, W, 60, "#ffffff08", 5);
    
  };
  // 永升電梯・遠端監控中心
  SC.ys_room = (o) => {
    wall(72, "#dce0e4", false); R(0, 64, W, 8, "#7a8088");
    R(10, 20, 30, 30, "#f4f4ee"); R(12, 22, 26, 3, "#2a5a8a"); for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) R(12 + c * 7, 27 + r * 4, 5, 2, (r === 1 && c === 2) ? "#c23a2a" : "#9a9a9a");   // 排班表
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++){ const x = 56 + c * 16, y = 26 + r * 14; R(x - 1, y - 1, 16, 12, "#2a2a2e"); R(x, y, 14, 10, "#0e2a1e"); for (let j = 0; j < 4; j++) R(x + 1, y + 2 + j * 2, 4 + ((c + j + r) * 5) % 9, 1, j === 2 && r === 0 && c === 1 ? "#ffb030" : "#6fd46f"); }
    OBJ.desk(56, 66, 52); R(62, 58, 10, 6, "#6a8a5a"); R(63, 59, 8, 2, "#e8e0c8");   // 便當袋
    R(110, 20, 20, 20, "#8a8e94"); for (let k = 0; k < 6; k++) R(112 + (k % 3) * 6, 22 + Math.floor(k / 3) * 9, 4, 6, k === 4 ? "#5a5e64" : "#c9a24a");   // 鑰匙櫃（一格是空的）
    R(140, 62, 24, 12, "#5a6a7a"); for (let k = 0; k < 4; k++) R(142 + k * 5, 58 + (k % 2), 4, 4, ["#2a2a2a", "#c23a2a", "#2a2a2a", "#3a6ab8"][k]);   // 報廢籃
    R(170, 10, 16, 30, "#2a5a8a"); txt("永升", 171, 22, "#f4f4ee", "6px sans-serif");
    lamp(96, 0, "#f4f4f8");
    floor(72, "#a8acb0", "#989ca0");
  };
  // 宏遠建設
  SC.hy_room = (o) => {
    wall(72, "#ece8e0", false); R(0, 64, W, 8, "#3a3a3e");
    R(30, 50, 60, 4, "#8a8e94"); R(28, 54, 64, 16, "#5a5e64"); for (let k = 0; k < 6; k++) R(36 + k * 9, 20 + (k % 3) * 4, 7, 30 - (k % 3) * 4, "#a8c0d8"); R(34, 18, 52, 32, "#ffffff22");   // 都更模型
    R(100, 12, 70, 28, "#2a3a5a"); txt("宏遠建設", 108, 30, "#e9e4da", "8px sans-serif");
    R(4, 40, 20, 32, "#8a8e94"); R(5, 44, 18, 1, "#5a5e64"); R(5, 56, 18, 1, "#5a5e64"); R(12, 49, 4, 2, "#2a2a2e"); R(12, 61, 4, 2, "#2a2a2e"); R(7, 64, 12, 6, "#7a3a2a");   // 檔案櫃、帳冊
    OBJ.desk(104, 66, 70); R(109, 61, 22, 5, "#9a9a92"); R(110, 62, 20, 4, "#fbf8f0"); for (let i = 0; i < 4; i++){ R(112, 62 + i, 10, 1, "#7a7a72"); P(125, 62 + i, "#3a8a4a"); } R(126, 64, 3, 2, "#d23a2a");   // 名單（打勾，一個紅圈） R(140, 52, 16, 10, "#2a2a2e"); R(141, 53, 14, 7, "#3a5a7a");
    OBJ.plant(176, 66);
    floor(72, "#5a5a5e", "#4e4e52");
  };
  // 劉文彬的住處
  SC.lh_room = (o) => {
    wall(72, "#d8d4c8", false); R(0, 64, W, 8, "#8a8478");
    R(10, 20, 20, 24, "#f4f4ee"); R(10, 20, 20, 4, "#c23a2a"); for (let k = 0; k < 15; k++) P(12 + (k % 5) * 4, 27 + Math.floor(k / 5) * 5, "#8a8a8a"); R(15, 37, 4, 4, "#c23a2a");   // 月曆
    R(118, 26, 24, 22, "#6b4a2b"); R(120, 28, 20, 18, "#c8b890"); R(124, 32, 6, 12, "#3a5a8a"); R(125, 30, 4, 3, "#e8c09a"); R(131, 38, 4, 6, "#e86a2a"); R(131, 36, 4, 2, "#e8c09a");   // 舊照片：制服的爸爸抱著小孩
    R(36, 64, 40, 10, "#c23a2a"); R(38, 62, 36, 3, "#a82a1a"); for (let k = 0; k < 6; k++) R(40 + k * 6, 66, 4, 2, "#c8c8c8");   // 工具箱
    R(90, 52, 40, 4, "#8a6a4a"); R(92, 56, 3, 18, "#6a4a2a"); R(125, 56, 3, 18, "#6a4a2a"); R(100, 48, 8, 4, "#e9e4da");   // 小桌子
    R(148, 60, 20, 14, "#3a3a3a"); R(150, 58, 16, 3, "#2a2a2a");   // 垃圾袋
    R(170, 20, 18, 52, "#7a6a5a"); R(172, 24, 14, 20, "#3a5a7a"); R(174, 46, 10, 2, "#c8c8c8");   // 衣櫃，掛著制服
    windowBox(60, 14, 24, 20, night(o) ? "#141c30" : "#a8c8e0");
    lamp(100, 0, "#f4f0d8");
    floor(72, "#a89c88", "#988c78");
  };
  // 案發經過重現：電梯井的剖面（左邊電梯井，右邊 14 樓走廊）
  SC.t_shaft = (o) => {
    const [i, p] = o.ds ? beatAt(o.t || 0, o.ds) : [0, 0], s = (o.seq || [])[i] || {};
    R(0, 0, W, H, "#141418");
    R(20, 0, 56, H, "#24242a"); R(22, 0, 2, H, "#5a5a5a"); R(72, 0, 2, H, "#5a5a5a"); for (let y = 0; y < H; y += 6) P(23, y, "#8a8a8a");   // 電梯井、導軌
    R(76, 0, 116, 56, "#e4dcc8"); R(76, 50, 116, 6, "#8a7e6a"); R(76, 56, 116, 4, "#a89c88"); R(76, 60, 116, 48, "#3a3a3e");   // 14 樓走廊（上）、13 樓（下）
    txt("14F", 150, 10, "#6a5a3a"); txt("13F", 150, 74, "#9a9a9a");
    const hd = kf(s.hd === undefined ? 0 : s.hd, p);   // 14 樓廳門
    R(74, 16, 4, 40, "#7a7e84"); R(76, 16, 4, Math.round(40 * (1 - hd)), "#c8ccd2");
    door(150, 20, 22, 36, "#6b4a2b"); if (s.fdoor) R(150, 20, 8, 36, "#f4e8c0");
    const cy = kf(s.car === undefined ? 56 : s.car, p);   // 車廂頂的高度
    R(26, cy, 44, 3, "#4a4e54"); R(26, cy + 3, 44, 44, "#8a8e94"); R(28, cy + 6, 40, 38, "#a8acb2"); R(44, cy - 6, 8, 6, "#2a2a2e"); P(47, cy - 4, s.ins ? "#ffb030" : "#6fd46f");   // 車廂、檢修盒
    R(47, 0, 1, cy - 6, "#3a3a3a"); R(49, 0, 1, cy - 6, "#3a3a3a");
  };

  /* ---------- 文字有提到的小東西（畫出來，跟文字一致） ---------- */
  const wrap7 = (n, fn) => { const b = SC[n]; SC[n] = Object.assign((o) => { b(o); fn(o); }, b); };
  wrap7("t_lift", () => { R(24, 40, 22, 14, "#c8beac"); R(25, 41, 20, 12, "#f6f2ea"); P(26, 42, "#a89e8c"); P(43, 42, "#a89e8c"); });   // 以前掛照片的位置，比旁邊的牆白
  wrap7("t_14", () => { R(105, 77, 10, 3, "#6a3a24"); R(105, 76, 6, 1, "#8a5a3a"); R(105, 80, 10, 1, "#e0d8c8"); P(104, 78, "#6a3a24"); });   // 一隻室內拖鞋，鞋尖朝電梯
  wrap7("t_machine", () => { R(150, 70, 32, 4, "#e8e4d8"); for (let i = 0; i < 4; i++) R(152 + i * 7, 71, 5, 1, "#9a9a92"); R(160, 66, 12, 4, "#f4f4f0"); R(160, 66, 12, 1, "#c8c8c0"); R(162, 65, 9, 1, "#c8a060"); });   // 報紙、吃完的便當盒和筷子
  wrap7("t_b2", () => { R(90, 98, 40, 4, "#3a3a3a"); for (let x = 92; x < 128; x += 4) R(x, 99, 2, 2, "#1a1a1a"); R(96, 95, 18, 3, "#4a5a6a"); P(100, 96, "#8a6aa8"); P(106, 96, "#6a8aa8"); });   // 排水溝、油花
  SC.c7_lab = (o) => { SC.lab(o); R(112, 44, 16, 8, "#6a4a2a"); R(114, 45, 6, 6, "#3a3a3a"); R(121, 45, 5, 3, "#c8b070"); R(126, 40, 1, 4, "#c8c8c8"); };   // 老錢的收音機

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    liu:  { skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#4a6a8a", bottom:"#3a4a5a", hat:"cap", capColor:"#2a4a6a", hello:"警察先生，電梯我很快就修好。",
            byPhase:{ 1:{ hat:null, mood:"tired" }, 2:{ hat:null, mood:"sad" } } },
    jiahao:{ skin:"#d8a880", hair:"#3a2a1a", hairStyle:"spiky", top:"#c8a040", bottom:"#2a2a3a", mood:"tired", hello:"我沒殺他！我昨天只是去借錢！",
            byPhase:{ 2:{ top:"#1e1e22", mood:"sad" } } },
    su:   { age:"old", skin:"#d0a080", hair:"#c8c8c0", hairStyle:"short", top:"#3a4a6a", bottom:"#3a4a6a", hat:"cap", capColor:"#2a3a5a", mood:"worried", hello:"都怪我……我那時候在打瞌睡。",
            byPhase:{ 1:{ hat:null, mood:"tired" } } },
    chen: { age:"old", skin:"#f0c8a8", hair:"#9a9a92", hairStyle:"bun", top:"#c88aa8", bottom:"#4a3a4a", skirt:true, hello:"我跟他吵了十年，可是……" },
    lin:  { skin:"#e8c09a", hair:"#3a2a20", hairStyle:"bun", top:"#e8dcc8", bottom:"#5a5a6a", apron:"#f4f4ee", mood:"sad", hello:"先生他……昨天我還幫他買了茶葉。" },
    jian: { skin:"#e8c09a", hair:"#1a1410", hairStyle:"slick", top:"#e9e4da", coat:"#2a2a3a", bottom:"#2a2a3a", tie:"#2a5a8a", hello:"我很忙。有話快問。" },
    heimao:{ hello:"沈警官，來打一圈？" },
    zheng:{ skin:"#f0c8a8", hair:"#3a2a20", hairStyle:"bob", top:"#e86a6a", bottom:"#3a4a6a", mood:"worried", hello:"我兒子到現在還說，電梯上面有人……" },
    fen:  { skin:"#f4d4bc", hair:"#2a2220", hairStyle:"pony", top:"#4a6a8a", bottom:"#3a4a5a", glasses:true, hello:"海悅那台嗎？我調給你看。" },
    zhao: { hello:"這種案子，我見多了。" },
    qian: { hello:"來啦。這一下打得很準。" },
    ye:   { hello:"明天下午四點。給我理由。" },
    wu:   { hello:"學長，要驗什麼？" }
  };
  ["qian","ye","wu","zhao","heimao"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (LOOK.zhao.top){ LOOK.zhao.hat = "police"; LOOK.zhao.mood = "worried"; }
  const DAILY = {
    liu:   [ { room:"tmachine", x:120, pose:"kneel", doing:"蹲在機房的控制櫃前面接線，工具一支一支擺在報紙上。" }, { room:"ysroom", x:150, pose:"stand", doing:"在公司的報廢籃旁邊填單子。" }, { room:"ysroom", x:40, pose:"sit", doing:"坐在排班表前面，手裡握著一杯沒喝的咖啡。" } ],
    jiahao:[ null, { room:"pdesk", x:60, pose:"sit", doing:"坐在偵訊室外面，一直抖腳。" }, { room:"pdesk", x:60, pose:"sit", doing:"坐在偵訊室外面，眼睛紅紅的。" } ],
    su:    [ { room:"tlobby", x:90, pose:"stand", doing:"站在管理台後面，手一直在抖。" }, { room:"tlobby", x:90, pose:"sit", doing:"坐在管理台，盯著監視器，一夜沒睡。" }, { room:"tlobby", x:90, pose:"sit", doing:"坐在管理台，在值班紀錄上補寫東西。" } ],
    chen:  [ { room:"t14", x:150, pose:"cross", doing:"站在自己家門口，抱著一隻小狗。" }, { room:"t14", x:150, pose:"stand", doing:"在門口餵狗，一直往 14A 那邊看。" }, { room:"tlift", x:40, pose:"stand", doing:"站在電梯口，不敢一個人搭電梯。" } ],
    lin:   [ null, { room:"tliving", x:100, pose:"cry", doing:"坐在客廳的沙發上哭。" }, { room:"tliving", x:60, pose:"broom", doing:"在客廳慢慢地掃地。" } ],
    jian:  [ null, { room:"hyroom", x:140, pose:"phone", doing:"在辦公室講電話：「命案？……都更要延了。」" }, { room:"hyroom", x:60, pose:"cross", doing:"站在都更模型前面，看著那棟已經不在的老大樓。" } ],
    zheng: [ null, { room:"tlift", x:150, pose:"cross", doing:"在電梯口等電梯，等了很久也不肯進去。" }, { room:"tlobby", x:40, pose:"stand", doing:"在管理室跟警衛說，她今天要帶小孩走樓梯。" } ],
    heimao:[ null, { room:"mjhall", x:100, pose:"sit", doing:"在角落那桌摸牌。" }, { room:"mjhall", x:100, pose:"smoke", doing:"坐在角落那桌抽菸。" } ],
    fen:   [ null, { room:"ysroom", x:80, pose:"sit", doing:"坐在監控螢幕前，戴著耳機。" }, { room:"ysroom", x:80, pose:"phone", doing:"在講電話派工。" } ],
    zhao:  [ { room:"t14", x:60, pose:"smoke", doing:"站在 14 樓走廊抽菸，手有一點抖。" } ],
    qian:  [ { room:"tstudy", x:60, pose:"kneel", doing:"蹲在方振華旁邊檢查。" }, { x:60, pose:"stand", doing:"在解剖台旁邊寫報告。" } ],
    ye:    [ null, { room:"pdesk", x:140, pose:"read", doing:"在看方家豪的卷宗。" } ],
    wu:    [ { room:"t14", x:30, pose:"kneel", doing:"蹲在電梯門前面，用手電筒照門縫。" }, { x:100, pose:"stand", doing:"在實驗台前盯著電腦。" } ]
  };
  EP7.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });
  const L0 = id => { const L = Object.assign({}, LOOK[id]); delete L.hello; delete L.byPhase; return L; };
  EP7.looks = {
    jiahaoL: L0("jiahao"), jianL: L0("jian"), suL: L0("su"), chenL: L0("chen"),
    liuU: { skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#4a6a8a", bottom:"#3a4a5a", hat:"cap", capColor:"#2a4a6a", gloves:"#c8b890" },
    liuH: { skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#4a6a8a", bottom:"#3a4a5a", hat:"cap", capColor:"#2a4a6a", gloves:"#c8b890" },
    fangL: { age:"old", skin:"#d8a880", hair:"#c8c8c0", hairStyle:"balding", top:"#8a8a8a", bottom:"#6a6a6a", glasses:true },
    famDad: { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a6a3a", bottom:"#2a2a3a" },
    famMom: { skin:"#f0c8a8", hair:"#2a2220", hairStyle:"long", top:"#e8a0b0", bottom:"#3a3a5a", skirt:true },
    famGma: { age:"old", skin:"#e0b48c", hair:"#c8c8c0", hairStyle:"bun", top:"#6a4a7a", bottom:"#3a3a3a" },
    cop1: { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", tie:"#1a2236" },
    cop2: { skin:"#e8c09a", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", tie:"#1a2236" }
  };

  /* ---------- 房間和隱藏小細節 ---------- */
  EP7.rooms = {
    tower: [
      { id:"tlobby", name:"一樓大廳・管理室", scene:"t_lobby", details:[
        { id:"d7_peanut", name:"花生殼", hot:[96,60,14,6], text:"管理台底下一堆花生殼。蘇金城說，他太太叫他戒菸，他就改吃花生。" } ] },
      { id:"tlift", name:"電梯口", scene:"t_lift", opt:(ph,has)=>({ open:1 }), details:[
        { id:"d7_mark", name:"銅牌下面的白色方塊", label:"電梯的銅牌", hot:[24,40,22,14], text:"你問警衛那裡以前掛什麼。他想了很久：「好像是一張照片……那個死掉的技師的。後來有人說不吉利，拿掉了。」" },
        { id:"d7_button", name:"叫車按鈕", hot:[134,38,10,14], text:"「▲」那顆按鈕被按得發亮。「▼」旁邊貼著一張小小的恐龍貼紙——9B 那個小男孩貼的。他媽媽說，他現在不敢一個人搭電梯了。" } ] },
      { id:"tcommittee", name:"管委會辦公室", scene:"t_committee", details:[
        { id:"d7_notice", name:"公告欄", hot:[4,14,22,30], text:"公告：「6/10 都更說明會，請踴躍出席。」下面有人用原子筆寫：「14A 不簽就大家一起住危樓。」" } ] },
      { id:"t14", name:"14 樓走廊", scene:"t_14", opt:(ph,has)=>({ tape:ph===0, markers:ph===0, open:ph===0 }), details:[
        { id:"d7_slipper", name:"走廊上的拖鞋", label:"走廊", hot:[102,72,16,10], text:"一隻咖啡色的室內拖鞋，鞋尖朝著電梯。" } ] },
      { id:"tliving", name:"方家客廳", scene:"t_living", details:[
        { id:"d7_photo", name:"全家福", hot:[90,18,30,20], text:"照片裡是方振華和太太，中間站著一個小男孩——小時候的方家豪。照片右下角寫著 2004。" } ] },
      { id:"tstudy", name:"書房", scene:"t_study", opt:(ph,has)=>({ body:ph===0, outline:ph>0, markers:ph===0 }), details:[
        { id:"d7_book", name:"書櫃最上面一層", label:"書櫃", hot:[144,0,44,8], text:"書櫃最上面一層是一整排的《電梯安全法規彙編》，從 2006 年版到今年，一年一本，每一本都翻得很舊。" } ] },
      { id:"tmachine", name:"頂樓電梯機房", scene:"t_machine", details:[
        { id:"d7_bento", name:"報紙", hot:[150,70,32,4], text:"接油的報紙是今天的晚報，日期 6/3。上面放著一個吃完的便當盒，筷子擺得整整齊齊。" } ] },
      { id:"tb2", name:"地下二樓停車場", scene:"t_b2", opt:(ph,has)=>({ van:ph===0, unplug:!has("ev_b2cam") || ph===0, cars:true }), details:[
        { id:"d7_puddle", name:"排水溝", hot:[90,96,40,8], text:"排水溝邊有一小灘水，帶著一點黑黑的油花。這附近停過一台車在洗手。" } ] }
    ],
    police: [ { id:"pdesk", name:"刑大辦公室", scene:"police", details:[
      { id:"d7_board", name:"白板", hot:[120,12,50,30], text:"白板上寫著：「方家豪　羈押？　6/5 16:00」。旁邊有人畫了一個電梯，打了一個問號。" } ] } ],
    lab: [ { id:"lab", name:"法醫室・鑑識中心", scene:"c7_lab", details:[
      { id:"d7_radio", name:"收音機", hot:[110,40,20,12], text:"老錢的收音機在放〈月亮代表我的心〉。他跟著哼，走音走得很厲害。" } ] } ],
    yongsheng: [ { id:"ysroom", name:"永升電梯・監控中心", scene:"ys_room", details:[
      { id:"d7_cert", name:"牆上的證書", hot:[170,10,16,30], text:"牆角掛著員工的技術證照影本。劉文彬的那張，發證日期是 2010 年，上面的照片還是個二十出頭的年輕人。" },
      { id:"d7_lunch", name:"桌上的便當袋", hot:[60,56,14,8], text:"調度台旁邊放著一個便當袋，上面縫著一塊布：「文彬　不要辣」。張雅芬說，那是他媽媽每天幫他準備的，他今天沒來拿。" } ] } ],
    mahjong: [ { id:"mjhall", name:"好運來麻將館", scene:"mj_hall", details:[
      { id:"d7_cat", name:"櫃台下面", label:"櫃台", hot:[10,60,50,10], text:"櫃台下面睡著一隻真的黑貓。老范說：「不是我養的，是牠自己要叫這個名字。」" } ] } ],
    hongyuan: [ { id:"hyroom", name:"宏遠建設・都更部", scene:"hy_room", details:[
      { id:"d7_list", name:"桌上的名單", hot:[108,58,24,9], text:"桌上一張名單，海悅大樓六十戶，五十九戶打了勾，只有「14A 方」是紅色的圈。" } ] } ],
    liuhome: [ { id:"lhroom", name:"劉文彬的住處", scene:"lh_room", details:[
      { id:"d7_uniform", name:"衣櫃裡的制服", label:"衣櫃", hot:[170,20,18,52], text:"衣櫃裡掛著兩套永升的制服。其中一套的膝蓋和胸口，有一大片黑黑的油污。" } ] } ]
  };

  /* ---------- 監視器動畫 ---------- */
  const ANIM = {
    cctv_lift: { scene:"t_cab", cam:"EV1 CAB", date:"2026-06-03", beats:[
      { t:"21:10:20", d:3, cap:"方家豪在 1 樓進電梯，按了 14 樓。", st:{ fl:["1"], door:[1,1,0], out:"#c8c0a8" }, m:{ jiahaoL:[104,98,null,1,96,78] } },
      { t:"21:10:30", d:2.5, cap:"電梯上 14 樓。", st:{ fl:["1","3","6","9","12","14"] }, m:{ jiahaoL:[104,98,"stand",-1] } },
      { t:"21:11:05", d:2.5, cap:"14 樓，他走出去。", st:{ fl:["14"], door:[0,1,1], out:"#e4dcc8" }, m:{ jiahaoL:[96,76,null,-1,104,98] }, out:["jiahaoL"] },
      { t:"21:25:40", d:3, cap:"21:25，方家豪在 14 樓進電梯。臉色很難看。", st:{ fl:["14"], door:[1,1,0], out:"#e4dcc8" }, m:{ jiahaoL:[90,98,null,-1,96,78] } },
      { t:"21:25:50", d:2.5, cap:"電梯下到 1 樓。他一直盯著地板。", st:{ fl:["14","11","8","5","3","1"] }, m:{ jiahaoL:[90,98,"cross",1] } },
      { t:"21:26:20", d:2.5, cap:"1 樓，他走出去。", st:{ fl:["1"], door:[0,1,1], out:"#c8c0a8" }, m:{ jiahaoL:[96,76,null,1,90,98] }, out:["jiahaoL"] },
      { t:"21:57:10", d:4.5, cap:"沒有人在車廂裡，電梯自己下到 B2。門開了，又關上。沒有人進出。", st:{ fl:["1","B1","B2","B2","B2"], door:[0,0,0,1,1,0], out:"#4a4a46" } },
      { t:"21:59:30", d:4.5, cap:"樓層顯示旁邊亮起「INS」。空車廂開始往上，很慢。", st:{ fl:["B2","B1","1","2","3","4","5","6","7","8","9","10","11","12"], ins:true } },
      { t:"22:02:40", d:4, cap:"車廂停住了，樓層顯示「13」。門沒有開。", st:{ fl:["13"], ins:true } },
      { t:"22:13:00", d:4, cap:"「INS」熄了。空車廂下到 1 樓，停著。", st:{ fl:["13","11","9","7","5","3","1"] } },
      { t:"22:24:10", d:4, cap:"一家五口在 1 樓進電梯。「嗶——超載」。", st:{ fl:["1"], door:1, over:true, kids:true, out:"#c8c0a8" }, m:{ famDad:[70,98,null,-1,96,78], famMom:[124,96,null,1,96,78], famGma:[140,98,null,-1,96,78] } },
      { t:"22:24:30", d:3.5, cap:"爸爸笑著走出去。警報停了，門關上。", st:{ fl:["1"], door:[1,1,0], kids:true, out:"#c8c0a8" }, m:{ famDad:[96,76,null,1,70,98], famMom:[124,96,"stand",-1], famGma:[140,98,"stand",-1] }, out:["famDad"] },
      { t:"22:24:50", d:3, cap:"電梯上到 9 樓。", st:{ fl:["1","3","5","7","9"], kids:true }, m:{ famMom:[124,96,"stand",-1], famGma:[140,98,"stand",-1] } },
      { t:"22:26:30", d:3, cap:"9 樓，那家人走出去。", st:{ fl:["9"], door:[0,1,1], kids:true, out:"#c8c0a8" }, m:{ famMom:[96,74,null,-1,124,96], famGma:[96,74,null,-1,140,98] }, out:["famMom","famGma"] },
      { t:"22:30:30", d:4.5, cap:"「INS」又亮了。空車廂從 9 樓慢慢往下，一路到 B2。", st:{ fl:["9","8","7","6","5","4","3","2","1","B1","B2"], ins:true } },
      { t:"22:34:00", d:3, cap:"「INS」熄了。電梯停在 B2。", st:{ fl:["B2"] } },
      { t:"22:37:00", d:4, cap:"電梯回到 1 樓。爸爸一個人進電梯，上到 9 樓。", st:{ fl:["1","1","3","5","7","9"], door:[1,0,0,0,0,0], out:"#c8c0a8" }, m:{ famDad:[96,98,"stand",1,96,78] } },
      { t:"22:38:40", d:3, cap:"9 樓，爸爸走出去。", st:{ fl:["9"], door:[0,1,1], out:"#c8c0a8" }, m:{ famDad:[96,74,null,-1,96,98] }, out:["famDad"] },
      { t:"22:50:10", d:4, cap:"警衛蘇金城從 1 樓進電梯，上 14 樓。", st:{ fl:["1","1","4","8","11","14"], door:[1,0,0,0,0,0], out:"#c8c0a8" }, m:{ suL:[96,98,"stand",1,96,78] } }
    ] },
    cctv_lobby: { scene:"t_lobbycam", cam:"1F LOBBY", date:"2026-06-03", beats:[
      { t:"20:27:30", d:4, cap:"一個穿西裝、拿公事包的男人刷訪客卡進來，搭電梯上樓。", m:{ jianL:[164,74,"carry@case",1,26,74,[[60,98],[150,98]]] }, out:["jianL"] },
      { t:"20:51:10", d:4, cap:"他下樓，邊走邊打電話，用力推開大門。", m:{ jianL:[26,74,"phone&case",-1,164,74,[[150,98],[60,98]]] }, out:["jianL"] },
      { t:"21:08:00", d:3.5, cap:"方家豪走進大廳，跟警衛點了個頭，搭電梯上樓。", m:{ jiahaoL:[164,74,null,1,26,74,[[60,98],[150,98]]], suL:[96,98,"stand",-1] }, out:["jiahaoL"] },
      { t:"21:26:00", d:3.5, cap:"方家豪走出大門，在門口踢了一下垃圾桶。", m:{ jiahaoL:[26,74,null,-1,164,74,[[150,98],[60,98]]], suL:[96,98,"stand",-1] }, out:["jiahaoL"] },
      { t:"22:24:00", d:4, cap:"一家五口進電梯。爸爸又走出來，站在電梯口等。", m:{ famDad:[140,98,"stand",1,26,74,[[60,98]]], famMom:[164,74,null,1,20,74,[[60,98],[150,98]]], famGma:[164,74,null,1,14,74,[[60,98],[150,98]]], suL:[96,98,"sit",-1] }, out:["famMom","famGma"] },
      { t:"22:35:20", d:4, cap:"爸爸等不到電梯，在管理台跟警衛理論，比手畫腳。", m:{ famDad:[110,98,"point",-1,140,98], suL:[96,98,"stand",1] } },
      { t:"22:37:00", d:3, cap:"爸爸搭電梯上樓。", m:{ famDad:[164,74,null,1,110,98,[[150,98]]], suL:[96,98,"sit",-1] }, out:["famDad"] },
      { t:"22:50:00", d:3, cap:"警衛蘇金城搭電梯上樓。", m:{ suL:[164,74,null,1,96,98,[[150,98]]] }, out:["suL"] },
      { t:"22:53:30", d:3.5, cap:"警衛從樓梯衝下來，在管理台打電話。", m:{ suL:[96,98,"phone",-1,190,98] } }
    ] },
    cctv_b2: { scene:"t_b2", opt:{ unplug:false, clean:true }, cam:"B2 PARKING", date:"2026-06-03", beats:[
      { t:"21:00:00", d:3, cap:"停車場裡停著十幾台車，沒有人。", st:{} },
      { t:"21:46:10", d:3.5, cap:"一台白色廂型車的車頭燈從畫面左邊掃過來。", cars:{ van:[76,-60,"#e9e4da"] } },
      { t:"21:47:05", d:3, cap:"畫面晃了一下，右下角閃過一隻戴著工作手套的手。", out:["van"] },
      { t:"21:47:20", d:3, cap:"畫面全黑，只有時間還在跑。", black:true },
      { t:"23:21:00", d:3.5, cap:"畫面突然又亮了。白色廂型車停在原來的位置。", cars:{ van:[76,76,"#e9e4da"] } }
    ] },
    cctv_stair14: { scene:"t_stairs", cam:"STAIR 1-15F", date:"2026-06-03", beats:[
      { t:"21:00:00", d:3, cap:"十五格畫面，1 樓到 15 樓的樓梯間門口。" },
      { t:"22:00:00", d:3, cap:"（21:00 到 22:53，沒有任何人開過樓梯門。）" },
      { t:"22:53:10", d:3.5, st:{ fig:[13,0], col:"#3a4a6a" }, cap:"警衛從 14 樓的樓梯門衝出來，一路跑下 1 樓。" },
      { t:"23:05:00", d:3, st:{ fig:[0,13], col:"#3a5a8a" }, cap:"兩個員警從 1 樓走樓梯上 14 樓。" }
    ] },
    cctv_mahjong: { scene:"mj_hall", cam:"HAO YUN LAI", date:"2026-06-03", beats:[
      { t:"21:35:00", d:3.5, cap:"方家豪推門進來，坐在角落那桌。", m:{ jiahaoL:[90,98,"sit",1,-14,98] } },
      { t:"22:10:00", d:3, cap:"他去廁所，22:14 回來。", m:{ jiahaoL:[90,98,"sit",1] } },
      { t:"23:40:00", d:3, cap:"他又去了一次廁所，23:44 回來。", m:{ jiahaoL:[90,98,"sit",1] } },
      { t:"01:02:00", d:3.5, cap:"他站起來，把口袋翻出來給大家看，空的。走了。", m:{ jiahaoL:[-20,98,null,-1,90,98] }, out:["jiahaoL"] }
    ] },
    ev_dashcam: { scene:"t_b2", opt:{ dash:true, unplug:false, cars:false, clean:true }, clean:true, cam:"AKV-3021 PARKING", date:"2026-06-03", beats:[
      { t:"21:46:00", d:3.5, cap:"一台白色廂型車停進電梯口旁邊的格子，車身寫著「永升電梯」。", cars:{ van:[76,-60,"#e9e4da"] } },
      { t:"21:47:00", d:4, cap:"一個穿永升制服、戴工作手套的男人下車，踩上柱子的底座，伸手到天花板。", m:{ liuU:[64,90,"raise",1,80,98] } },
      { t:"21:57:00", d:4.5, cap:"他在 B2 按了電梯。門開了，他沒進去，往通到 B1 的車道走過去。", st:{ door:[0,1,1,0] }, m:{ liuU:[10,74,null,-1,110,98,[[110,98],[40,98]]] }, out:["liuU"] },
      { t:"22:33:00", d:4, cap:"那個男人從 B1 的車道走下來，手上的東西用抹布包著，上車。", m:{ liuH:[80,96,"carry@cloth/#c8b890",1,10,74,[[30,98]]] }, out:["liuH"] },
      { t:"22:36:00", d:3, cap:"廂型車開走。", cars:{ van:[-80,76] } }
    ] }
  };
  // 有 s（場景狀態）的動畫：把每一段的狀態交給場景
  Object.values(ANIM).forEach(A => { if (A.beats.some(b => b.st || b.black)){ A.opt = Object.assign({}, A.opt || {}, { seq:A.beats.map(b => b.st || {}), ds:jds(A.beats), blk:A.beats.map(b => !!b.black) }); } });
  // B2：黑掉的那一段
  const b2 = SC.t_b2; SC.t_b2 = (o) => { if (o.blk && o.ds){ const [i] = beatAt(o.t || 0, o.ds); if (o.blk[i]){ R(0, 0, W, H, "#050505"); return; } } const s = o.seq && o.ds ? (o.seq[beatAt(o.t || 0, o.ds)[0]] || {}) : {}; b2(Object.assign({}, o, s.door !== undefined ? { door:s.door, p:beatAt(o.t || 0, o.ds)[1] } : {})); };
  [...EP7.cctv, ...EP7.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });
  const PS = [["t_14",{ phase:0, tape:true, markers:true, open:true }],["police",{}],["t_lift",{ phase:2, open:0 }]];
  EP7.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 結案 ---------- */
  const replayBeats = [
    { t:"21:59:30", d:5, cap:"21:59，他站在車廂頂上，把電梯切到檢修模式。空車廂載著他，慢慢往上。", st:{ car:[108,56], ins:true }, m:{ liuU:[48,56,"stand",1,48,108] } },
    { t:"22:03:00", d:4.5, cap:"車廂停在 13 樓和 14 樓之間。他從裡面推開 14 樓的電梯門。門口的警報「嗶——嗶——」一直響。", st:{ car:56, hd:[0,1], ins:true }, m:{ liuU:[60,56,"push",1,48,56] } },
    { t:"22:04:30", d:4, cap:"方振華打完電話給警衛，開門出來看。", st:{ car:56, hd:1, fdoor:true, ins:true }, m:{ fangL:[120,56,null,-1,160,56] } },
    { t:"22:05:10", d:5, cap:"他從電梯井走出來。「方主委，你還記得劉國雄嗎？」", st:{ car:56, hd:1, fdoor:true, ins:true }, m:{ liuU:[100,56,"stand",1,60,56], fangL:[124,56,"stand",-1] } },
    { t:"22:06:00", d:4.5, cap:"方振華往後退，退進家裡，退進書房。他抓住了老人的衣領。", st:{ car:56, hd:1, fdoor:true, ins:true }, m:{ fangL:[200,56,null,-1,124,56], liuU:[200,56,null,1,100,56] }, out:["fangL","liuU"] },
    { t:"22:12:00", d:5, cap:"六分鐘後，他一個人走回來，扳手用抹布包著，口袋裡多了一個皮夾。他回到車廂頂上，關上電梯門。", st:{ car:56, hd:[1,1,0], fdoor:true, ins:true }, m:{ liuH:[48,56,"carry@cloth/#c8b890&wallet",-1,180,56] } },
    { t:"22:13:00", d:4.5, cap:"檢修模式不能超過十五分鐘，不然公司會跳警報。他把電梯切回一般模式，趴在車廂頂上，跟著車廂一起往下。", st:{ car:[56,120], fdoor:true }, m:{ liuH:[48,120,"prone",-1,48,56] }, out:["liuH"] }
  ];
  EP7.court = {
    title: "海悅大樓一樓大廳・6 月 5 日下午", scene: "t_lobby",
    who: ph => ["jiahao","su","chen","lin","jian","liu"],
    open: ph => "你請葉晴再給你一個小時，把所有人請到海悅大樓的一樓大廳。劉文彬穿著永升的制服站在電梯口，好像隨時要去修什麼東西。",
    kindLine: {
      murder: "方振華是被人殺的。兇手沒有走樓梯，也沒有『搭』電梯——他是坐在電梯上面上來的。",
      accident: "方振華是自己跌倒撞到頭的。"
    },
    murmur: [ "（方家豪一直搓著手。）", "（陳美華抱著小狗，往後退了一步。）", "（電梯「叮」了一聲，門開了，裡面沒有人。）" ],
    confess: {
      liu: [ "我爸出事那天，我在樓下等他下班。他說，修完這台，帶我去吃牛排。", "四月我在機房看到那一頁。我爸寫『建議立即停用』，下面那個人寫『先繼續用』。報告卻說，是我爸操作不當。", "我只是想問他，記不記得我爸的名字。……他說：『對不起，我每個月都有寄錢。』", "錢。他以為那是錢的事。" ]
    },
    cornered: { liu: "……電梯不會說謊。那 72 公斤，是我。" },
    deny: {
      jiahao: "我欠錢是真的，可是我沒有殺我叔叔！他明明說要給我錢……",
      su: "我要是早點上去……我要是那時候沒睡著……",
      chen: "我只是聽到那一聲……我真的什麼都沒看到。",
      lin: "先生他這一個月，每天都在看那本相簿……",
      jian: "我說過了，我要的是簽名，不是命案。"
    },
    replayText: "6 月 3 日晚上 21:57，B2 停車場。他按了電梯，看著空車廂的門打開又關上，然後轉身走上 B1——",
    replay: { scene:"t_shaft", opt:{ seq:replayBeats.map(b => b.st), ds:jds(replayBeats) }, clean:true, cam:"案發經過重現", date:"2026-06-03", beats:replayBeats },
    endGood: "方家豪在下午四點以前走出了分局。他在門口站了很久，打了一通電話給阿彪：「錢我會自己還。」\n劉文彬被帶走的時候，請求再看一眼機房。老錢說，他在那本少了一頁的日誌上，用很工整的字寫了最後一行：「2026/06/05　劉文彬　停用。」\n一個月後，管委會把電梯口那塊白色的方塊，重新掛上了劉國雄的照片。",
    endBad: "下午四點，葉晴聲請羈押方家豪。\n電梯照常上上下下。凌晨的時候，「INS」偶爾還會亮一下，可是再也沒有人去看。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[7] && ARC_INTER[7].after) EP7.after = ARC_INTER[7].after;

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP7.outScenes = [];
  EP7.fac = { tower:["#c8c0b0","#5a4a3a"], police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], yongsheng:["#dce0e4","#2a5a8a"], mahjong:["#c8b890","#c23a2a"], hongyuan:["#ece8e0","#2a3a5a"], liuhome:["#d8d4c8","#6a5a4a"] };
  EP7.setting = { tower:"city", police:"city", lab:"city", yongsheng:"city", mahjong:"city", hongyuan:"city", liuhome:"city" };
  const SKY7 = [ ["#0b0f1c","#27324a","#18202a","#1d2630",0,0], ["#8ab0d0","#e0e8ee","#4a6070","#56707a",0,0], ["#a8a0b0","#e8d8c8","#5a5a6a","#6a6a72",0,0] ];
  EP7.worldSky = ph => SKY7[Math.min(ph || 0, SKY7.length - 1)];
  EP7.roomDesc = {
    tlobby:"一樓大廳。管理台後面一整排監視器螢幕。", tlift:"電梯口。只有一台電梯，門上方有樓層顯示。", tcommittee:"管委會辦公室。一整排舊檔案櫃。",
    t14:"14 樓走廊。左邊是電梯，中間是 14A 方家，右邊是 14B 和樓梯間。", tliving:"方家的客廳。電視還開著。", tstudy:"方振華的書房。滿牆的書。",
    tmachine:"頂樓的電梯機房。很熱，馬達嗡嗡地響，空氣裡都是機油的味道。", tb2:"地下二樓停車場。燈管一閃一閃的。",
    pdesk:"澄港市刑大。你的位子在窗邊。", lab:"法醫室和鑑識中心。老錢和小吳都在這裡。", ysroom:"永升電梯的遠端監控中心。一整面牆的螢幕都在跳數字。",
    mjhall:"好運來麻將館。洗牌的聲音嘩啦嘩啦。", hyroom:"宏遠建設的都更部。玻璃罩裡是一棟三十層的模型。", lhroom:"劉文彬的住處。很小，很乾淨。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#4a4038", bottom:"#3a3328", tie:"#5a2a2a", hat:"fedora", hatColor:"#3a3226" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const FOR = { skin:"#e8c09a", hair:"#1a1410", hairStyle:"short", top:"#f4f6f6", bottom:"#f4f6f6", mask:"#9ac0e0", hood:"#f4f6f6" };
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", tie:"#1a2236" };
  EP7.world = {};
  EP7.locations.forEach(l => { EP7.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP7.world.tower, {
    extras: [
      { id:"for7", name:"鑑識員", phase:0, until:0, x:RX(5) + 140, L:FOR, pose:"cam", facing:-1, lines:[
        "1 號是血跡，2 號是掉在地上的發票，3 號是抽屜。", "抽屜拉手被擦得很乾淨。強盜會這麼細心嗎？" ] },
      { id:"cop7a", name:"派出所員警", phase:0, until:0, x:RX(0) + 150, L:COP, pose:"stand", facing:-1, mood:"tired", lines:[
        "樓梯、電梯都有人守著。從 23:05 開始，沒有人上下過 14 樓。", "電梯公司的人？他說他是來修電梯的，巡佐說讓他上機房。" ] },
      { id:"cop7b", name:"派出所員警", phase:0, until:0, x:RX(3) + 170, L:COP, pose:"stand", facing:-1, lines:[
        "樓梯間那扇門超吵的，開一次『碰』一聲。我守在這裡一個鐘頭，都聽得一清二楚。" ] },
      { id:"fam7", name:"9B 的媽媽", phase:1, x:RX(1) + 150, L:{ skin:"#f0c8a8", hair:"#2a2220", hairStyle:"long", top:"#e8a0b0", bottom:"#3a3a5a", skirt:true }, pose:"cross", facing:-1, lines:[
        "那天晚上真的很奇怪！我們才五個人，它就叫超載。我老公一走出去，它就不叫了。", "我老公？九十公斤啦。……可是我們平常五個人一起搭，從來沒叫過。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { car:[-60, 8, 2.4, "#e9e4da"], hide:true },
      { wait:0.5, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長，海悅大樓。死者方振華，68 歲，住 14 樓。在書房被打死的，頭上一個很深的傷口。", "小吳"),
      say("wu", "他姪子九點多來過，聽說欠了一屁股債。書房的抽屜被翻得亂七八糟，皮夾不見了。", "小吳"),
      say("wu", "奇怪的是——警衛說，電梯整晚都在叫『超載』。電梯公司的技師已經在頂樓修了。", "小吳"),
      say("you", "電梯裡有監視器，樓梯也有。兇手總得從哪裡上去、從哪裡下來。", "你"),
      say("wu", "今晚只能在大樓裡查。明天才能去電梯公司、申請通聯。問一題五分鐘，查一樣東西十分鐘。", "小吳"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  EP7.world.lab.extras = [
    { id:"xu7", name:"許知夏", phase:1, x:RX(0) + 150, L:(typeof ARC !== "undefined" && ARC.look && ARC.look("xu")) || FOR, pose:"read", facing:-1, lines:[
      "沈警官。我上禮拜才報到，桌子還沒整理好，你的證物先放小吳那邊。", "電梯導軌的油？石墨潤滑脂，黏到衣服上很難洗掉。誰碰過，手上一定也有。" ] }
  ];
  EP7.mapPos = { tower:[120,60,"u"], police:[150,96,"r"], lab:[176,84,"u"], yongsheng:[60,90,"l"], mahjong:[96,40,"u"], hongyuan:[160,40,"r"], liuhome:[40,116,"l"] };
  EP7.mapRoads = [["tower","police"],["police","lab"],["tower","mahjong"],["tower","hongyuan"],["police","yongsheng"],["yongsheng","liuhome"],["tower","yongsheng"]];
  EP7.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    const blocks = (x0, y0, x1, y1, c, c2) => { for (let x = x0; x < x1; x += 8) for (let y = y0; y < y1; y += 7) { R(x, y, 6, 5, c); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, c2); } };
    blocks(20, 20, 220, 128, "#c8c0b0", "#b0a898");
    for (let y = 0; y < 18; y += 2) for (let x = 0; x < 240; x += 4) R(x, y + Math.sin(t + x / 9) * 0.5, 4, 2, "#4a86b4");   // 北邊的港
    R(116, 40, 8, 20, "#8a8478"); R(117, 41, 6, 18, "#a8a090");   // 海悅大樓（高高的一棟）
  };
})();
