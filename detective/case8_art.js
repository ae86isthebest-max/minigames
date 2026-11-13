/* =========================================================
   第 8 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP8.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, OBJ, windowBox, door, sign, lamp, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + 0.5, en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const kf = (v, p) => Array.isArray(v) ? (() => { if (v.length === 1) return v[0]; const k = p * (v.length - 1), i = Math.min(v.length - 2, Math.floor(k)); return v[i] + (v[i + 1] - v[i]) * (k - i); })() : v;
  const stOf = o => { if (!o.ds) return [{}, 0]; const [i, p] = beatAt(o.t || 0, o.ds); return [(o.seq || [])[i] || {}, p]; };
  // 擺錘：支點 (x, y)，長度 L，角度 a（弧度）
  const pendulum = (x, y, L, a, blood) => { R(x - 6, y - 2, 12, 3, "#3a3a3e"); const ex = x + Math.sin(a) * L, ey = y + Math.cos(a) * L;
    for (let k = 0; k <= L; k += 1) P(Math.round(x + Math.sin(a) * k), Math.round(y + Math.cos(a) * k), "#6a6a70");
    R(Math.round(ex) - 6, Math.round(ey), 12, 9, "#2a2a2e"); R(Math.round(ex) - 5, Math.round(ey) + 1, 10, 2, "#4a4a50"); R(Math.round(ex) - 1, Math.round(ey) - 2, 2, 3, "#1a1a1a");
    if (blood) R(Math.round(ex) - 5, Math.round(ey) + 8, 10, 1, "#7a1a1a"); };
  const shelf = (x, y) => { R(x, y, 38, 34, "#5a3a24"); for (let r = 0; r < 3; r++){ R(x + 2, y + 10 + r * 10, 34, 2, "#3a2414"); } for (let k = 0; k < 7; k++){ const bx = x + 3 + k * 5; R(bx, y + 2 + (k % 2), 4, 8 - (k % 2), ["#7a1e24", "#2a4a6a", "#3a5a2a", "#6a4a2a"][k % 4]); P(bx + 1, y + 5, "#e8c040"); } };

  /* ---------- 場景 ---------- */
  // 大廳・櫃台
  SC.s8_front = (o) => {
    wall(72, "#2a2430", false); R(0, 64, W, 8, "#3a2a1a"); dither(0, 0, W, 64, "#3a3040", 5);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++){ R(10 + c * 8, 20 + r * 8, 7, 7, "#f4f0e0"); R(11 + c * 8, 21 + r * 8, 5, 4, ["#6a8aa0", "#a08a6a", "#8aa06a"][(r + c) % 3]); }   // 照片牆
    R(70, 8, 52, 14, "#1a1418"); txt("謎　境", 80, 19, "#e8c040", "9px serif");
    R(64, 54, 64, 12, "#5a3a24"); R(62, 52, 68, 3, "#7a5a34"); R(84, 44, 14, 9, "#2a2a2e"); R(85, 45, 12, 7, "#3a5a7a"); R(104, 48, 6, 5, "#c8a040");   // 櫃台
    R(113, 57, 10, 7, "#c8b088"); R(115, 55, 6, 2, "#a89068"); R(116, 56, 5, 3, "#f4f4f0");   // 林語安的包包、信封
    R(70, 50, 7, 4, "#2a2a2e"); R(71, 48, 5, 3, "#f4f0e0");   // 名片架
    R(140, 20, 30, 24, "#e8e0c8"); for (let i = 0; i < 6; i++) R(142, 23 + i * 3, 24 - (i % 3) * 4, 1, "#3a3a3a"); R(142, 23, 8, 1, "#c23a2a");   // 預約板
    R(0, 30, 6, 42, "#5a5a5e"); R(186, 30, 6, 42, "#3a3036");
    lamp(60, 0, "#f8d898"); lamp(140, 0, "#f8d898");
    floor(72, "#4a3a30", "#3e3028");
  };
  // 走廊（也給監視器用）
  const HALL_DOORS = [[4, "#6b4a2b", "辦公室"], [42, "#5a3a24", "古宅"], [82, "#3a3a3e", "控制室"], [118, "#6a7a8a", "WC"], [156, "#1e1a22", "LAST"]];
  SC.s8_hall = (o) => { const [s] = stOf(o);
    wall(74, "#3a3440", false); R(0, 66, W, 8, "#2a2428");
    HALL_DOORS.forEach(([x, c, n], k) => { door(x, 34, 22, 40, c); R(x + 2, 26, 18, 6, "#1a1418"); txt(n, x + 3, 31, "#e8c040", "5px sans-serif"); if (k === 2 && (s.ctrlAjar || o.ajar)) R(x + 16, 34, 6, 40, "#141018"); });
    R(66, 44, 14, 30, "#6a7078"); for (let k = 0; k < 3; k++){ R(67, 45 + k * 10, 12, 9, "#7a8088"); R(76, 48 + k * 10, 2, 2, "#3a3a3e"); R(68, 46 + k * 10, 5, 2, "#f4f0e0"); }   // 置物櫃
    R(178, 48, 4, 8, "#2a2a2e"); P(179, 50, "#6fd46f");   // 讀卡機
    R(44, 6, 30, 16, "#c8a040"); R(46, 8, 26, 12, "#1a1418"); txt("LAST", 49, 17, "#c23a2a", "6px monospace");   // 海報
    lamp(104, 0, "#f8d898"); lamp(150, 0, "#f8d898");
    floor(74, "#4a3a30", "#3e3028");
  };
  // 古宅
  SC.s8_guzhai = (o) => {
    wall(72, "#5a4a3a", true); R(0, 64, W, 8, "#3a2a1a");
    R(30, 50, 50, 16, "#6b4a2b"); R(28, 48, 54, 3, "#8a6a3a"); R(44, 30, 24, 18, "#c8b890"); R(46, 32, 20, 14, "#a8c0c8"); R(50, 47, 10, 2, "#c8c8c8"); P(52, 46, "#e8e8e8"); P(57, 46, "#e8e8e8");   // 梳妝台、眼鏡
    R(100, 14, 30, 36, "#3a2a1a"); R(102, 16, 26, 32, "#8a8070"); R(110, 22, 10, 14, "#d8c8a8");   // 祖先畫像
    door(156, 30, 26, 44, "#3a2a1a"); R(170, 42, 6, 6, "#c23a2a"); P(172, 44, "#ff8a8a");   // 緊急開門鈕
    R(140, 4, 8, 4, "#2a2a2e"); P(144, 6, "#e04a3a");   // 喇叭／監視器
    lamp(80, 0, "#e8b878");
    floor(72, "#5a4030", "#4a3424");
  };
  // 最後一個房間（命案現場）
  SC.s8_final = (o) => { const [s, p] = stOf(o), sw = o.swing || s.swing;
    wall(72, "#2a2420", true); R(0, 64, W, 8, "#1a1410"); dither(0, 0, W, 64, "#342a24", 4);
    R(150, 8, 30, 30, "#6b4a2b"); R(152, 10, 26, 26, "#e8dcc0"); for (let k = 0; k < 12; k++){ const a = k / 12 * Math.PI * 2; P(165 + Math.round(Math.sin(a) * 11), 23 - Math.round(Math.cos(a) * 11), "#3a2a1a"); } R(164, 13, 2, 10, "#1a1a1a"); R(165, 22, 1, 1, "#1a1a1a");   // 大鐘
    shelf(148, 40);
    if (o.open || s.open) { R(150, 42, 34, 32, "#050505"); R(150, 42, 10, 32, "#1a1a20"); }   // 書櫃轉開，後面是黑布和暗道
    OBJ.desk(16, 62, 46); R(22, 54, 14, 8, "#d8d0b8"); R(40, 56, 8, 6, "#3a3a3e"); R(41, 57, 6, 4, "#5a8aa0");   // 書桌、平板
    R(20, 70, 24, 8, "#c23a2a"); R(22, 68, 20, 3, "#a82a1a");   // 工具箱
    R(30, 62, 5, 3, "#1a1a1a");   // 手機
    floor(72, "#5a3a24", "#4a2e1c");
    for (let k = 0; k < 40; k++){ const a = k / 40 * Math.PI * 2; P(100 + Math.round(Math.sin(a) * 42), 96 + Math.round(Math.cos(a) * 8), "#e8c040"); }   // 黃圈
    const ang = sw ? Math.sin((o.t || 0) * 2.4) * 0.9 : 0;
    pendulum(96, 0, 60, ang, !sw && !o.clean);
    if (o.body){ R(78, 86, 34, 8, "#3a3a4a"); R(110, 86, 8, 7, "#d8a880"); R(110, 85, 8, 2, "#1a1410"); R(74, 88, 6, 4, "#2a2a2a"); R(86, 84, 10, 3, "#6a5a3a"); OBJ.blood(116, 92, 12); }
    else if (o.outline) OBJ.outline(82, 86);
    if (o.drag){ R(46, 90, 30, 1, "#7a5a3a"); R(46, 93, 30, 1, "#7a5a3a"); }
    if (o.markers){ OBJ.marker(120, 100); OBJ.marker(50, 96); OBJ.marker(32, 66); OBJ.marker(100, 70); }
    if (o.tape) OBJ.tape(0, 80, 20);
    lamp(60, 0, "#e8b878");
  };
  // 控制室（也給監視器用；o.cab＝鐵櫃的門）
  SC.s8_ctrl = (o) => { const [s, p] = stOf(o), cab = kf(s.cab === undefined ? (o.cab || 0) : s.cab, p);
    wall(72, "#2a2a30", false); R(0, 64, W, 8, "#1e1e24");
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++){ const x = 22 + c * 17, y = 15 + r * 14; R(x - 1, y - 1, 16, 12, "#101014"); R(x, y, 14, 10, (r === 1 && c === 3) ? "#050505" : ["#2a3a2a", "#3a2a2a", "#2a2a3a"][(r + c) % 3]); P(x + 3 + (c * 5) % 9, y + 5, "#e9e4da"); }
    R(86, 40, 4, 4, "#f4e48a");   // 便條
    OBJ.desk(56, 62, 100); R(60, 48, 26, 12, "#2a2a2e"); R(61, 49, 24, 9, "#2a4a3a");   // 錄影電腦
    R(100, 44, 28, 16, "#1a1a1e"); R(101, 45, 26, 13, "#1e3a5a"); for (let k = 0; k < 4; k++) R(103, 47 + k * 3, 14 + (k % 2) * 6, 1, "#8ac0e8");   // 系統電腦
    R(130, 52, 18, 8, "#3a3a3e"); for (let k = 0; k < 6; k++) P(132 + k * 2, 55, ["#6fd46f", "#e04a3a", "#ffb030"][k % 3]);   // 控制台
    if (!o.noHeadset){ R(82, 56, 10, 4, "#1a1a1a"); R(81, 55, 3, 3, "#2a2a2a"); R(90, 55, 3, 3, "#2a2a2a"); }
    R(84, 76, 14, 4, "#2a2a2a"); R(86, 64, 10, 12, "#3a3a44");   // 椅子
    R(2, 58, 16, 16, "#9aa0a6"); R(4, 60, 12, 6, "#c8ccd2"); R(8, 54, 2, 4, "#8a8e94");   // 洗手台
    R(160, 18, 30, 56, "#5a5e64"); R(162, 20, 26, 52, "#6a6e74"); R(166, 26, 18, 6, "#e8c040"); txt("危險", 168, 31, "#2a2a2a", "5px sans-serif");
    if (cab > 0.05){ R(162, 20, Math.round(26 * cab), 52, "#0a0a0c"); if (cab > 0.5){ R(176, 40, 3, 14, "#c23a2a"); R(175, 38, 5, 3, "#e04a3a"); } }   // 鐵櫃開著：拉桿、黑洞
    lamp(110, 0, "#c8d8e8");
    floor(72, "#3a3a40", "#32323a");
  };
  // 道具倉
  SC.s8_prop = (o) => {
    wall(72, "#4a4a46", false); R(0, 64, W, 8, "#3a3a36");
    for (let r = 0; r < 3; r++){ R(16, 26 + r * 16, 160, 2, "#6a5a3a"); }
    R(20, 14, 6, 12, "#c8c8c8"); R(30, 18, 12, 8, "#e8e0d0"); R(46, 16, 8, 10, "#c8a040"); R(60, 20, 10, 6, "#8a6a3a");   // 道具
    R(22, 32, 20, 10, "#a8a8a0"); R(24, 34, 4, 4, "#1a1a1a"); R(32, 34, 4, 4, "#1a1a1a"); R(46, 34, 18, 8, "#e8c040"); R(48, 36, 14, 4, "#c8a020");
    R(100, 50, 24, 10, "#c8b890"); R(100, 50, 24, 2, "#a89870"); R(102, 53, 18, 1, "#3a3a3a"); dither(100, 50, 24, 10, "#d8c8a088", 3);   // 鞋盒
    R(140, 72, 12, 8, "#2a2a2e"); R(156, 72, 12, 8, "#2a2a2e"); R(170, 74, 6, 6, "#1a1a1a");   // 備用錘頭、膠帶
    for (let x = 16; x < 180; x += 40) R(x, 26, 2, 48, "#6a5a3a");
    R(149, 13, 10, 8, "#f4e48a"); for (let k = 0; k < 3; k++) R(150, 15 + k * 2, 7 - k, 1, "#3a3a3a");   // 欠薪的紙條
    lamp(96, 0, "#e8e8d8");
    floor(72, "#5a5a54", "#4e4e48");
  };
  // 辦公室
  SC.s8_office = (o) => {
    wall(72, "#e0d8c8", false); R(0, 64, W, 8, "#6b4a2b");
    R(20, 20, 30, 24, "#c9a24a"); R(22, 22, 26, 20, "#a8c0d0"); R(26, 28, 6, 12, "#e8c09a"); R(36, 28, 6, 12, "#e8c09a"); R(25, 32, 8, 10, "#2a2a2e"); R(35, 32, 8, 10, "#2a2a2e");   // 2019 照片
    OBJ.desk(54, 62, 80); R(60, 52, 26, 8, "#f4f0e0"); R(62, 54, 22, 1, "#2a5a8a"); R(78, 50, 6, 3, "#e8e040"); R(100, 48, 16, 12, "#2a2a2e"); R(101, 49, 14, 9, "#3a5a7a");
    R(150, 20, 34, 52, "#7a6a5a"); for (let r = 0; r < 4; r++) R(152, 24 + r * 12, 30, 2, "#5a4a3a");
    windowBox(110, 10, 24, 20, "#a8c8e0");
    lamp(90, 0, "#f8e8c8");
    floor(72, "#8a6a4a", "#7a5a3a");
    R(129, 63, 10, 10, "#5a5a5e"); R(128, 62, 12, 2, "#6a6a70"); R(131, 61, 3, 2, "#f4f0e0"); R(135, 61, 2, 2, "#c8a040");   // 垃圾桶、杯子碎片
  };
  // 江家
  SC.j_room = (o) => {
    wall(72, "#ece4d4", false); R(0, 64, W, 8, "#8a7a6a");
    R(80, 52, 60, 4, "#8a6a4a"); R(84, 56, 3, 16, "#6a4a2a"); R(133, 56, 3, 16, "#6a4a2a"); R(100, 48, 16, 4, "#f4f0e0"); R(140, 54, 16, 4, "#c8e0d0");   // 茶几、保單、瑜珈簽到單
    R(10, 40, 60, 24, "#c8b8a8"); R(8, 36, 64, 6, "#b8a898"); R(38, 54, 24, 6, "#f4f0e0"); R(40, 55, 20, 1, "#c23a2a");   // 沙發、帳單
    R(150, 14, 30, 30, "#e8e0c8"); R(152, 16, 26, 26, "#c8d0d8"); R(160, 22, 10, 14, "#e8c09a");   // 婚紗照
    R(120, 10, 16, 20, "#5a8aa0");   // 窗
    R(76, 14, 12, 16, "#f4f0e0"); R(76, 14, 12, 3, "#c23a2a"); for (let k = 0; k < 4; k++) R(77, 19 + k * 3, 10, 1, "#c8c0b0"); P(79, 20, "#e04a3a"); P(84, 26, "#2a2a2a");   // 月曆
    R(84, 48, 12, 4, "#d8e8f0"); R(85, 49, 9, 1, "#3a3a3a");   // 印出來的信
    lamp(96, 0, "#f8e8c8");
    floor(72, "#c8b8a0", "#b8a890");
  };
  // 密室聯盟總部
  SC.al_room = (o) => {
    wall(72, "#f4f4f4", false); R(0, 64, W, 8, "#2a2a30");
    R(30, 20, 50, 30, "#1a1a20"); R(32, 22, 46, 26, "#2a2a34"); for (let k = 0; k < 5; k++) R(36 + k * 8, 28, 6, 14, ["#c23a2a", "#3a6ab8", "#e8c040", "#3a8a6a", "#8a3ac8"][k]); txt("LAST", 54, 46, "#e8c040", "5px monospace");
    R(100, 10, 70, 18, "#c23a2a"); txt("密室聯盟", 110, 23, "#ffffff", "9px sans-serif");
    OBJ.desk(104, 62, 70); R(110, 54, 20, 6, "#2a2a2e"); R(111, 55, 18, 4, "#3a6ab8"); R(140, 54, 16, 6, "#f4f0e0");
    OBJ.plant(180, 66);
    floor(72, "#5a5a62", "#4e4e56");
  };
  // 葛志偉的住處・工作室
  SC.g_room = (o) => {
    wall(72, "#b8b0a0", false); R(0, 64, W, 8, "#5a4a3a");
    for (let k = 0; k < 8; k++){ R(8 + k * 22, 8 + (k % 2) * 4, 18, 22, "#f4f0e0"); for (let j = 0; j < 4; j++) R(10 + k * 22, 12 + (k % 2) * 4 + j * 4, 12 - j * 2, 1, "#2a4a8a"); }   // 設計圖
    R(30, 56, 70, 4, "#6b4a2b"); R(32, 60, 3, 14, "#5a3e24"); R(95, 60, 3, 14, "#5a3e24"); R(40, 50, 30, 6, "#2a3a5a"); R(42, 51, 26, 4, "#e8e0c8");   // 工作台、筆記
    R(76, 50, 6, 6, "#c8c8c8"); R(84, 52, 10, 4, "#8a6a3a");   // 焊槍、齒輪
    R(100, 54, 16, 6, "#f4f0e0");   // 信
    R(150, 46, 30, 28, "#e8ecf0"); R(152, 48, 26, 24, "#d8dce0"); R(158, 54, 14, 14, "#8a9aa8"); R(160, 56, 10, 10, "#2a3a5a");   // 洗衣機
    lamp(96, 0, "#f4f0d8");
    floor(72, "#7a6a5a", "#6a5a4a");
  };
  // 案發經過重現：控制室（左）＋暗道（中）＋最後一個房間（右）
  SC.s8_cut = (o) => { const [s, p] = stOf(o);
    R(0, 0, W, H, "#141418");
    R(0, 0, 70, 98, "#2a2a30"); R(4, 14, 40, 16, "#101014"); for (let k = 0; k < 4; k++) R(5 + k * 10, 15, 9, 14, "#2a3a2a"); R(4, 60, 40, 4, "#3a3a3e"); R(20, 66, 3, 32, "#2a2a2a");   // 控制室
    R(52, 40, 18, 58, "#5a5e64"); if (kf(s.cab || 0, p) > 0.4) R(54, 42, 14, 54, "#0a0a0c");   // 鐵櫃
    R(70, 84, 46, 14, "#0e0e10"); R(70, 83, 46, 1, "#3a3a3a");   // 暗道
    R(116, 0, 76, 98, "#2a2420"); dither(116, 0, 76, 98, "#342a24", 4); R(116, 74, 14, 24, "#5a3a24");   // 最後一個房間、書櫃
    const ang = s.swing ? Math.sin((o.t || 0) * 2.4) * 0.8 : 0; pendulum(170, 0, 56, ang, false);
    if (s.nohead){ R(164, 56, 12, 10, "#2a2420"); }
    txt("CTRL", 4, 8, "#8ac0e8"); txt("LAST", 150, 8, "#e8c040");
    R(0, 98, W, 10, "#3a3a40"); R(116, 98, 76, 10, "#4a2e1c");
    if (s.flash){ PR.g().fillStyle = "rgba(160,20,20,.35)"; PR.g().fillRect(116, 0, 76, 108); }
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    ge:   { skin:"#d8a880", hair:"#3a2a1a", hairStyle:"short", top:"#5a6040", bottom:"#3a3a3a", glasses:true, mood:"tired", hello:"……我不知道他為什麼會站進黃線裡。",
            byPhase:{ 1:{ top:"#5a5a5e" }, 2:{ top:"#1e1e22", mood:"sad" } } },
    lin:  { skin:"#f4d4bc", hair:"#2a2220", hairStyle:"pony", top:"#1e1e22", bottom:"#2a2a3a", mood:"worried", hello:"我、我開門的時候，他就在那裡……" },
    zhuo: { skin:"#e0b48c", hair:"#1a1410", hairStyle:"spiky", top:"#6a5a3a", bottom:"#3a3a30", apron:"#5a4a3a", hello:"擺錘是我焊的。我焊得很牢。" },
    song: { skin:"#f0c8a8", hair:"#3a2a20", hairStyle:"long", top:"#e8e0f0", bottom:"#4a4a5a", skirt:true, mood:"sad", hello:"他每天都在工作室，比在家的時間還多。",
            byPhase:{ 2:{ top:"#1e1e22" } } },
    bai:  { skin:"#e8c09a", hair:"#1a1410", hairStyle:"slick", top:"#e9e4da", coat:"#2a2a3a", bottom:"#2a2a3a", tie:"#c23a2a", hello:"合約照簽。生意就是生意。" },
    guan: { skin:"#e8c09a", hair:"#1a1410", hairStyle:"short", top:"#3a8a6a", bottom:"#3a4a6a", hello:"我們那時候在玩，什麼都不知道……" },
    yu:   { skin:"#f4d4bc", hair:"#2a2220", hairStyle:"bob", top:"#f4c8d8", bottom:"#3a4a6a", skirt:true, mood:"worried", hello:"我那時候只是想去廁所……" },
    xu:   { hello:"沈警官。證物在說話，你要不要聽？" },
    qian: { hello:"來啦。這一下，打得很重。" },
    ye:   { hello:"意外還是他殺，給我證據。" },
    wu:   { hello:"學長，這個房間好可怕……" }
  };
  ["xu","qian","ye","wu"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.xu.top) Object.assign(LOOK.xu, { skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"pony", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#2a2a30", glasses:true });
  const DAILY = {
    ge:   [ { room:"sctrl", x:100, pose:"sit", doing:"林語安打電話叫他回來。他坐在控制室，盯著那排螢幕。" }, { room:"sctrl", x:100, pose:"sit", doing:"坐在控制室，一格一格地看著空房間的畫面。" }, { room:"sprop", x:150, pose:"kneel", doing:"蹲在道具倉，把備用的錘頭擦了一遍又一遍。" } ],
    lin:  [ { room:"sfront", x:96, pose:"cry", doing:"坐在櫃台後面發抖。" }, { room:"sfront", x:96, pose:"phone", doing:"在櫃台一通一通打電話取消預約。" }, { room:"sfront", x:96, pose:"write", doing:"在櫃台寫東西，寫了又劃掉。" } ],
    zhuo: [ null, { room:"sprop", x:60, pose:"cross", doing:"站在道具倉門口，不想進去。" }, { room:"shall", x:40, pose:"smoke", doing:"在走廊盡頭抽菸。" } ],
    song: [ null, { room:"jroom", x:60, pose:"sit", doing:"坐在沙發上，手裡拿著結婚照。" }, { room:"jroom", x:120, pose:"read", doing:"在看收購合約，一頁一頁。" } ],
    bai:  [ null, { room:"alroom", x:140, pose:"phone", doing:"在辦公室講電話：「合約照簽，跟家屬簽。」" }, { room:"alroom", x:60, pose:"cross", doing:"站在新店規劃圖前面。" } ],
    guan: [ null, { room:"pdesk", x:60, pose:"sit", doing:"坐在分局的長椅上，等著做筆錄。" } ],
    yu:   [ null, { room:"pdesk", x:100, pose:"sit", doing:"坐在分局的長椅上，抱著背包。" } ],
    xu:   [ { room:"sfinal", x:60, pose:"kneel", doing:"蹲在地上，用手電筒貼著木地板照。" }, { x:60, pose:"read", doing:"在實驗台前看報告。" } ],
    qian: [ { room:"sfinal", x:120, pose:"kneel", doing:"蹲在江承恩旁邊檢查。" }, { x:120, pose:"stand", doing:"在解剖台旁邊寫報告。" } ],
    ye:   [ null, { room:"pdesk", x:140, pose:"read", doing:"在看卷宗。" } ],
    wu:   [ { room:"sctrl", x:40, pose:"stand", doing:"站在控制室，一格一格看監視器的畫面。" }, { x:100, pose:"stand", doing:"在實驗台前盯著電腦。" } ]
  };
  EP8.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });
  const L0 = id => { const L = Object.assign({}, LOOK[id]); delete L.hello; delete L.byPhase; return L; };
  EP8.looks = {
    geL: Object.assign(L0("ge"), { top:"#2a3a5a" }), linL: L0("lin"), baiL: Object.assign(L0("bai"), { prop:"bag" }), yuL: L0("yu"), guanL: L0("guan"), zhuoL: Object.assign(L0("zhuo"), { prop:"bag" }),
    jiangL: { skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#e9e4da", bottom:"#3a3a4a", apron:"#5a4a3a" },
    jiangT: { skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#e9e4da", bottom:"#3a3a4a", apron:"#5a4a3a", prop:"bag" },
    stu1: { skin:"#f4d4bc", hair:"#1a1410", hairStyle:"short", top:"#c23a2a", bottom:"#2a2a3a" },
    stu2: { skin:"#e8c09a", hair:"#1a1410", hairStyle:"long", top:"#e8e040", bottom:"#3a4a6a", skirt:true }
  };

  /* ---------- 房間和隱藏小細節 ---------- */
  EP8.rooms = {
    studio: [
      { id:"sfront", name:"大廳・櫃台", scene:"s8_front", details:[
        { id:"d8_bell", name:"櫃台的鈴", hot:[104,46,8,8], text:"櫃台上一個金色的服務鈴，按下去是〈給愛麗絲〉的前兩小節。林語安說，那是江哥自己改的。" },
        { id:"d8_card", name:"名片架", hot:[69,47,9,8], text:"櫃台的名片架上，謎境的名片印的是：「江承恩　老闆」「葛志偉　首席設計」。葛志偉那一疊，只剩最後兩張。" } ] },
      { id:"shall", name:"走廊", scene:"s8_hall", details:[
        { id:"d8_cam", name:"走廊的監視器", hot:[86,0,20,8], text:"走廊天花板的監視器正對著五扇門。它拍得到每一扇門，可是拍不到牆的後面。" } ] },
      { id:"sguzhai", name:"「古宅」", scene:"s8_guzhai", details:[
        { id:"d8_portrait", name:"祖先畫像", hot:[100,14,30,36], text:"畫像的眼睛是挖空的，後面是一支小小的監視器。玩家都以為是畫像在看他們。" } ] },
      { id:"sctrl", name:"控制室", scene:"s8_ctrl", details:[
        { id:"d8_cup", name:"控制台旁的杯子", hot:[148,52,8,8], text:"一個馬克杯，印著「謎境 2019 開幕紀念」。杯子是乾的，裡面一滴水都沒有——昨晚沒有人在這裡倒水。" } ] },
      { id:"sfinal", name:"「最後一個房間」", scene:"s8_final", opt:(ph,has)=>({ body:ph===0, outline:ph>0, markers:ph===0, drag:true, tape:ph===0, open:has("e_lockin") }), details:[
        { id:"d8_sticker", name:"書桌底下", hot:[16,62,46,8], text:"書桌底下貼著一張小紙條，是葛志偉的字：「07:07——我們的生日。」江承恩和葛志偉，是同一天生日。" } ] },
      { id:"sprop", name:"道具倉", scene:"s8_prop", details:[
        { id:"d8_label", name:"標籤機", hot:[170,60,20,10], text:"標籤機裡最後印的一張是：「THE LAST ROOM　—　設計：葛志偉」。那張標籤沒有被貼出去。" } ] },
      { id:"soffice", name:"辦公室", scene:"s8_office", details:[
        { id:"d8_ashtray", name:"窗台", hot:[110,30,24,6], text:"窗台上一個菸灰缸，裡面有兩種菸蒂。一種是江承恩抽的細菸，一種是白振宇那種很貴的雪茄頭。" } ] }
    ],
    police: [ { id:"pdesk", name:"刑大辦公室", scene:"police", details:[
      { id:"d8_board", name:"白板", hot:[60,10,40,24], text:"白板上的海悅大樓案已經擦掉了，只剩角落一個小小的電梯圖案，沒有人捨得擦。" } ] } ],
    lab: [ { id:"lab", name:"法醫室・鑑識中心", scene:"lab", details:[
      { id:"d8_xu", name:"新的桌子", hot:[130,40,30,20], text:"許知夏的桌子在小吳旁邊。小吳的桌上堆滿零食，她的桌上一條線都沒有歪。兩張桌子中間，小吳貼了一條膠帶：「國界」。" } ] } ],
    jianghome: [ { id:"jroom", name:"江家客廳", scene:"j_room", details:[
      { id:"d8_wedding", name:"婚紗照", hot:[150,14,30,30], text:"婚紗照的玻璃上有一條裂痕，用透明膠帶黏起來了。" } ] } ],
    alliance: [ { id:"alroom", name:"密室聯盟・執行長室", scene:"al_room", details:[
      { id:"d8_cv", name:"桌上的履歷", hot:[140,52,16,8], text:"桌上一疊應徵「旗艦店店長」的履歷。最上面那一份的照片，是一個綁馬尾的年輕女生——林語安。" },
      { id:"d8_award", name:"獎盃", hot:[180,50,10,16], text:"盆栽旁邊一個獎盃：「年度最佳連鎖品牌」。底座上的灰比獎盃還厚。" } ] } ],
    gehome: [ { id:"ghome", name:"葛志偉的工作室", scene:"g_room", details:[
      { id:"d8_cake", name:"冰箱", hot:[130,30,16,40], text:"冰箱裡有一個沒拆的小蛋糕，上面的巧克力片寫著：「7/7　生日快樂　承恩＆志偉」。" } ] } ]
  };

  /* ---------- 監視器動畫 ---------- */
  const DX = { office:15, guz:53, ctrl:93, wc:129, last:167 }, DY = 74;
  const ANIM = {
    cctv_hall: { scene:"s8_hall", cam:"HALL CAM", date:"2026-07-07", beats:[
      { t:"20:03:10", d:4, cap:"江承恩帶著一個穿西裝的男人走進辦公室。", m:{ jiangL:[DX.office,DY,null,-1,-20,98,[[DX.office,98]]], baiL:[DX.office,DY,"carry@case",-1,-40,98,[[DX.office,98]]] }, out:["jiangL","baiL"] },
      { t:"20:40:30", d:3, cap:"西裝男人一個人走出來，往大廳走。", m:{ baiL:[-20,98,"carry@case",-1,DX.office,DY,[[DX.office,98]]] }, out:["baiL"] },
      { t:"20:58:00", d:4, cap:"葛志偉帶四個大學生走進「古宅」，幫他們關上門。", m:{ stu1:[DX.guz,DY,null,1,-20,98,[[DX.guz,98]]], stu2:[DX.guz,DY,null,1,-36,98,[[DX.guz,98]]], yuL:[DX.guz,DY,null,1,-52,98,[[DX.guz,98]]], geL:[DX.guz + 14,96,"point",-1,-4,98] }, out:["stu1","stu2","yuL"] },
      { t:"21:02:00", d:3, cap:"葛志偉走進控制室，關上門。", m:{ geL:[DX.ctrl,DY,null,1,DX.guz + 14,96,[[DX.ctrl,98]]] }, out:["geL"] },
      { t:"21:05:20", d:4.5, cap:"江承恩提著工具箱，從辦公室出來，刷卡走進「最後一個房間」。", m:{ jiangT:[DX.last,DY,"carry@case/#c83a2a",1,DX.office,DY,[[DX.office,98],[DX.last,98]]] }, out:["jiangT"] },
      { t:"21:41:10", d:3.5, cap:"一個女大學生從「古宅」跑出來，經過控制室門口，走進廁所。", st:{ ctrlAjar:true }, m:{ yuL:[DX.wc,DY,null,1,DX.guz,DY,[[DX.guz,98],[DX.wc,98]]] }, out:["yuL"] },
      { t:"21:44:00", d:4, cap:"她走回「古宅」。經過控制室門口的時候停了一下，又走了。", st:{ ctrlAjar:true }, m:{ yuL:[DX.guz,DY,null,-1,DX.wc,DY,[[DX.wc,98],[DX.ctrl,98],[DX.ctrl - 2,98],[DX.guz,98]]] }, out:["yuL"] },
      { t:"22:00:10", d:3, cap:"葛志偉從控制室出來，打開「古宅」的門。", m:{ geL:[DX.guz + 12,96,null,-1,DX.ctrl,DY,[[DX.ctrl,98]]] } },
      { t:"22:10:00", d:3.5, cap:"大學生們離開。", m:{ stu1:[-20,98,null,-1,DX.guz,DY,[[DX.guz,98]]], yuL:[-36,98,null,-1,DX.guz,DY,[[DX.guz,98]]], geL:[DX.ctrl,DY,null,1,DX.guz + 12,96,[[DX.ctrl,98]]] }, out:["stu1","yuL","geL"] },
      { t:"22:26:00", d:3, cap:"葛志偉從控制室出來，往大廳走。", m:{ geL:[-20,98,null,-1,DX.ctrl,DY,[[DX.ctrl,98]]] }, out:["geL"] },
      { t:"22:30:00", d:2.5, cap:"（21:05 到 23:38，沒有任何人走近「最後一個房間」的門。）" },
      { t:"23:31:00", d:3.5, cap:"林語安走進辦公室。", m:{ linL:[DX.office,DY,null,-1,40,98,[[DX.office,98]]] }, out:["linL"] },
      { t:"23:37:10", d:3.5, cap:"她從辦公室出來，把一個白色信封塞進圍裙口袋。", m:{ linL:[30,98,"pocket@envelope",1,DX.office,DY,[[DX.office,98]]] } },
      { t:"23:38:20", d:4, cap:"林語安走到「最後一個房間」門口，敲門，刷卡。", m:{ linL:[DX.last - 6,98,"knock",1,30,98] } },
      { t:"23:40:10", d:3, cap:"她衝出來。", m:{ linL:[-20,98,null,-1,DX.last - 6,98] }, out:["linL"] }
    ] },
    cctv_lobby: { scene:"s8_front", cam:"LOBBY", date:"2026-07-07", beats:[
      { t:"19:58:00", d:3.5, cap:"一個穿西裝、拿公事包的男人走進來，林語安帶他往裡面走。", m:{ baiL:[200,98,"carry@case",1,-14,98], linL:[200,98,null,1,96,98] }, out:["baiL","linL"] },
      { t:"20:00:30", d:3, cap:"卓家宏背著背包下班。", m:{ zhuoL:[-20,98,null,-1,200,98] }, out:["zhuoL"] },
      { t:"20:41:00", d:3, cap:"西裝男人離開。", m:{ baiL:[-20,98,"carry@case",-1,200,98], linL:[96,98,"stand",-1] } },
      { t:"20:52:00", d:3.5, cap:"四個大學生進來，在櫃台登記。", m:{ stu1:[80,98,null,1,-14,98], stu2:[110,98,null,1,-30,98], yuL:[60,98,null,1,-46,98], linL:[96,98,"write",-1] }, out:["stu1","stu2","yuL"] },
      { t:"21:40:00", d:3, cap:"（21:00 到 22:10，林語安一直坐在櫃台後面，沒有離開過。）", m:{ linL:[96,98,"write",-1] } },
      { t:"22:12:00", d:3.5, cap:"大學生們離開，笑得很大聲。", m:{ stu1:[-20,98,null,-1,200,98], yuL:[-36,98,null,-1,210,98], linL:[96,98,"stand",-1] }, out:["stu1","yuL"] },
      { t:"22:28:00", d:3.5, cap:"葛志偉走出大門，跟林語安說了一句話。", m:{ geL:[-20,98,null,-1,200,98,[[110,98]]], linL:[96,98,"stand",1] }, out:["geL"] },
      { t:"23:30:00", d:3.5, cap:"林語安拉下一半的鐵捲門，往裡面看了一下，又走進去。", m:{ linL:[200,98,null,1,10,98] }, out:["linL"] }
    ] },
    cctv_guzhai: { scene:"s8_guzhai", cam:"GUZHAI CAM", date:"2026-07-07", beats:[
      { t:"21:20:00", d:3, cap:"四個大學生在古宅裡找線索。", m:{ guanL:[110,98,"read",1], stu1:[40,98,"kneel",-1], stu2:[70,98,"point",1], yuL:[140,98,"stand",-1] } },
      { t:"21:38:20", d:3.5, cap:"他們卡在第四關。組長按了牆上的提示鈕。", m:{ guanL:[150,98,"door",1,110,98] } },
      { t:"21:40:30", d:3, cap:"他又按了一次，再按一次。大家抬頭看喇叭。", m:{ guanL:[150,98,"cross",1], yuL:[140,98,"stand",-1] } },
      { t:"21:41:00", d:3, cap:"一個女生按了門邊的緊急開門鈕，跑出去。", m:{ yuL:[200,98,null,1,140,98] }, out:["yuL"] },
      { t:"21:44:10", d:3, cap:"她跑回來，回頭看了門外一眼。", m:{ yuL:[140,98,"stand",1,200,98] } },
      { t:"21:46:05", d:3.5, cap:"螢幕上終於出現提示：「看看祖母的眼鏡」。", m:{ stu2:[56,98,"read",-1,70,98], guanL:[60,98,"point",-1,150,98] } },
      { t:"22:00:00", d:3.5, cap:"門打開，GM 走進來跟他們拍照。", m:{ geL:[150,98,"cam@phone",-1,200,98] } }
    ] },
    cctv_ctrl: { scene:"s8_ctrl", opt:{ noHeadset:true }, cam:"CTRL TRAINING", date:"2026-07-07", beats:[
      { t:"21:02:00", d:3, cap:"葛志偉坐下，戴上耳機。", st:{ cab:0 }, m:{ geL:[92,98,"sit",1,-14,98] } },
      { t:"21:37:05", d:3.5, cap:"他的手機響了。他看了一眼，接起來，講了二十幾秒。", st:{ cab:0 }, m:{ geL:[92,98,"sit+phone",1] } },
      { t:"21:38:40", d:4.5, cap:"他摘下耳機丟在桌上，走到後面的大鐵櫃，打開櫃門，彎腰鑽進去。", st:{ cab:[0,0,1,1,0] }, m:{ geL:[176,96,"kneel",1,92,98,[[150,98]]] }, out:["geL"] },
      { t:"21:41:00", d:3, cap:"（椅子是空的。門外有一個女生的影子經過。）", st:{ cab:0 } },
      { t:"21:44:20", d:4, cap:"鐵櫃的門打開，他爬出來，回頭把一塊黑布拉進櫃子裡。", st:{ cab:[0,1,1,0] }, m:{ geL:[150,98,"stand",-1,176,96] } },
      { t:"21:44:30", d:2.5, cap:"他在控制台按了一個鍵。", st:{ cab:0 }, m:{ geL:[138,98,"reach",-1,150,98] } },
      { t:"21:45:00", d:3.5, cap:"他在角落的洗手台洗手，洗了很久，把右手的袖子拉下來。", st:{ cab:0 }, m:{ geL:[18,98,"back+wipe",-1,138,98] } },
      { t:"21:45:50", d:3, cap:"他坐回椅子，戴上耳機，打了一行字。", st:{ cab:0 }, m:{ geL:[92,98,"sit+type",1,18,98] } },
      { t:"22:20:00", d:3, cap:"他在錄影電腦前面操作了一陣子。", st:{ cab:0 }, m:{ geL:[72,98,"type",-1,92,98] } }
    ] }
  };
  Object.values(ANIM).forEach(A => { if (A.beats.some(b => b.st)) A.opt = Object.assign({}, A.opt || {}, { seq:A.beats.map(b => b.st || {}), ds:A.beats.map(b => b.d) }); });
  [...EP8.cctv, ...EP8.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });
  const PS = [["s8_final",{ phase:0, body:true, markers:true, drag:true }],["police",{}],["s8_hall",{ phase:2 }]];
  EP8.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 結案 ---------- */
  const RB = [
    { t:"21:37:05", d:4.5, cap:"21:37，江承恩打給葛志偉：「你過來。我們今晚講清楚。」", st:{}, m:{ geL:[28,98,"sit+phone",1], jiangL:[150,98,"phone",-1] } },
    { t:"21:38:40", d:5, cap:"走廊有監視器。他拉下鐵櫃裡的拉桿，從暗道爬了過去。", st:{ cab:[0,1,1] }, m:{ geL:[124,98,"kneel",1,28,98,[[60,98],[74,98]]], jiangL:[150,98,"stand",-1] } },
    { t:"21:39:30", d:5, cap:"「合約後天簽。他們要的是房間，不是人。……志偉，對不起。」", st:{}, m:{ geL:[128,98,"stand",1,124,98], jiangL:[150,98,"stand",-1] } },
    { t:"21:40:10", d:4.5, cap:"江承恩轉過身去收工具。葛志偉拔下擺錘的錘頭。", st:{ nohead:true }, m:{ geL:[164,98,"lift@weight",1,128,98], jiangL:[140,98,"kneel+reach@wrench",-1,150,98] } },
    { t:"21:40:30", d:3, cap:"他從背後砸了下去。", st:{ nohead:true, flash:true }, m:{ geL:[150,98,"strike@weight",-1,164,98], jiangL:[140,98,"prone",-1] } },
    { t:"21:41:00", d:5, cap:"他把江承恩拖到擺錘底下，把測試遙控器塞進他手裡。裝回錘頭，撕掉紅色膠帶，用自己的黑膠帶重新纏好。", st:{}, m:{ jiangL:[170,98,"prone",-1,140,98], geL:[184,98,"drag",-1,150,98] } },
    { t:"21:42:00", d:4, join:true, st:{}, cap:"他把江承恩拖到擺錘底下，把測試遙控器塞進他手裡。裝回錘頭，撕掉紅色膠帶，用自己的黑膠帶重新纏好。", m:{ jiangL:[170,98,"prone",-1], geL:[184,98,"kneel+reach@tape/#1a1a1a",-1] } },
    { t:"21:43:30", d:4.5, cap:"他爬回控制室，把黑布拉進鐵櫃。", st:{ cab:[0,1,1,0] }, m:{ geL:[40,98,"stand",-1,184,98,[[124,98],[74,98],[60,98]]], jiangL:[170,98,"prone",-1] } },
    { t:"21:44:32", d:5, cap:"然後，在控制台按下了擺錘的啟動鍵。擺錘在江承恩的身體上方，擺了二十秒。", st:{ swing:true }, m:{ geL:[24,98,"reach",-1,40,98], jiangL:[170,98,"prone",-1] } }
  ];
  EP8.court = {
    title: "謎境・「最後一個房間」・7 月 9 日下午", scene: "s8_final",
    who: ph => ["ge","lin","zhuo","song","bai","guan"],
    open: ph => "你請所有人到「最後一個房間」。擺錘靜靜地垂著，黃圈外面站滿了人。白振宇看了一眼手錶：「四點半了。」",
    kindLine: {
      murder: "江承恩不是站錯了位置。他是死了以後，才被放到擺錘底下的。",
      accident: "江承恩測試擺錘的時候，站進了黃圈，被打到了。"
    },
    murmur: [ "（宋佳蓉握著合約，指節發白。）", "（卓家宏一直盯著擺錘的插銷。）", "（葛志偉看著牆上的大鐘。）" ],
    confess: {
      ge: [ "他打電話來，說：「你過來，我們講清楚。」我以為他要跟我說，不賣了。", "他說：「他們要的是房間，不是人。志偉，對不起。」", "那個房間，是我五年的人生。他一句對不起，就要拿去賣。", "……我爬回去的時候，一直在想，開幕那天，我本來要從那條暗道走出來，嚇他一跳的。" ]
    },
    cornered: { ge: "……錘頭的底面。對，我早就應該想到。擺錘是橫著揮的，我自己畫的。" },
    deny: {
      lin: "我只是發現他的人……我什麼都不知道。",
      zhuo: "我焊得很牢……那個錘頭不會自己掉下來的。",
      song: "是我叫他賣的……如果不賣，他就不會死了嗎？",
      bai: "我們只是在談生意。",
      guan: "我們那時候還在玩……還在笑……"
    },
    replayText: "7 月 7 日晚上 21:37，控制室。他看著螢幕上那個按著提示鈕的大學生，接起了電話——",
    replay: { scene:"s8_cut", opt:{ seq:RB.map(b => b.st), ds:RB.map(b => b.d) }, clean:true, cam:"案發經過重現", date:"2026-07-07", beats:RB },
    endGood: "17:00，宋佳蓉沒有簽約。她說：「這個房間，等他們兩個的名字都寫在海報上，再說。」\n一個月後，「最後一個房間」照原定日期開幕。海報的設計者欄寫著兩個名字。卓家宏說，第一組玩家從暗道爬出來的時候，所有人都嚇了一跳。",
    endBad: "17:00，合約簽了。「最後一個房間」被拆下來，裝進貨車。\n擺錘被拆下來的時候，膠帶鬆開了，掉在地上。沒有人撿。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[8] && ARC_INTER[8].after) EP8.after = ARC_INTER[8].after;

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP8.outScenes = [];
  EP8.fac = { studio:["#2a2430","#e8c040"], police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], jianghome:["#ece4d4","#8a6a4a"], alliance:["#f4f4f4","#c23a2a"], gehome:["#b8b0a0","#5a4a3a"] };
  EP8.setting = { studio:"city", police:"city", lab:"city", jianghome:"city", alliance:"city", gehome:"town" };
  const SKY8 = [ ["#0b0f1c","#27324a","#18202a","#1d2630",0,0], ["#8ab0d0","#e0e8ee","#4a6070","#56707a",0,0], ["#c8a8a0","#f0d8c0","#5a5060","#6a6070",0,0] ];
  EP8.worldSky = ph => SKY8[Math.min(ph || 0, SKY8.length - 1)];
  EP8.roomDesc = {
    sfront:"謎境的大廳。燈光很暗，牆上貼滿玩家的拍立得。", shall:"走廊。五扇門：辦公室、古宅、控制室、廁所，最後是「最後一個房間」。",
    sguzhai:"「古宅」主題房。梳妝台、祖先畫像，一股檀香味。", sctrl:"控制室。一排監視螢幕，後面一個很大的鐵櫃。",
    sfinal:"「最後一個房間」。書櫃、大鐘、書桌，正中間吊著一個擺錘。", sprop:"道具倉。架子上堆滿了道具。", soffice:"江承恩的辦公室。",
    pdesk:"澄港市刑大。你的位子在窗邊。", lab:"法醫室和鑑識中心。現在多了一張很整齊的桌子。", jroom:"江家的客廳。很安靜。",
    alroom:"密室聯盟的執行長室。牆上是新店的規劃圖。", ghome:"葛志偉的工作室。牆上釘滿了設計圖。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#4a4038", bottom:"#3a3328", tie:"#5a2a2a", hat:"fedora", hatColor:"#3a3226" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const FOR = { skin:"#e8c09a", hair:"#1a1410", hairStyle:"short", top:"#f4f6f6", bottom:"#f4f6f6", mask:"#9ac0e0", hood:"#f4f6f6" };
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", tie:"#1a2236" };
  EP8.world = {};
  EP8.locations.forEach(l => { EP8.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP8.world.studio, {
    extras: [
      { id:"for8", name:"鑑識員", phase:0, until:0, x:RX(4) + 150, L:FOR, pose:"cam", facing:-1, lines:[
        "1 號是血，2 號是書桌旁邊那一滴，3 號是手機，4 號是工具箱。", "門是鎖著的，我們進來之前沒人碰過。" ] },
      { id:"cop8", name:"派出所員警", phase:0, until:0, x:RX(1) + 100, L:COP, pose:"stand", facing:-1, lines:[
        "走廊那支監視器我看過了，那扇門整晚都沒人靠近。真的是密室耶。", "古宅那一組學生已經回家了，明天會去分局做筆錄。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { car:[-60, 8, 2.4, "#e9e4da"], hide:true },
      { wait:0.5, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長，謎境密室逃脫。死者江承恩，38 歲，老闆。倒在一個還沒開幕的房間，叫「最後一個房間」。", "小吳"),
      say("wu", "門是鎖著的，櫃台的林小姐用總卡才打開。走廊的監視器說，他一個人進去以後，就沒人靠近過那扇門。", "小吳"),
      say("wu", "房間裡有一個八公斤的擺錘……他就趴在擺錘底下。合夥人說，大概是測試的時候站錯了位置。", "小吳"),
      say("you", "一個自己寫「任何人不准站進來，包括我」的人，會站錯位置嗎？先看看。", "你"),
      say("wu", "許知夏已經在裡面了。她說……叫你不要踩她的地板。", "小吳"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳")
    ]
  });
  EP8.mapPos = { studio:[110,64,"u"], police:[150,96,"r"], lab:[176,84,"u"], jianghome:[60,90,"l"], alliance:[170,36,"r"], gehome:[40,40,"l"] };
  EP8.mapRoads = [["studio","police"],["police","lab"],["studio","jianghome"],["studio","alliance"],["studio","gehome"],["jianghome","police"]];
  EP8.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    const blocks = (x0, y0, x1, y1, c, c2) => { for (let x = x0; x < x1; x += 8) for (let y = y0; y < y1; y += 7) { R(x, y, 6, 5, c); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, c2); } };
    blocks(20, 20, 220, 128, "#c8c0b0", "#b0a898");
    for (let y = 0; y < 18; y += 2) for (let x = 0; x < 240; x += 4) R(x, y + Math.sin(t + x / 9) * 0.5, 4, 2, "#4a86b4");
    R(104, 56, 12, 8, "#2a2430"); R(106, 58, 8, 4, "#e8c040");   // 謎境
  };
})();
