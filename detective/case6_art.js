/* =========================================================
   第 6 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP6.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, shade, OBJ, windowBox, door, sign, lamp, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l), sky = (a, b, h) => PR.sky(a, b, h);
  const SC = PX.SCENES;
  const night = o => (o.phase || 0) === 0;
  const dust = (x, y, w, h) => { for (let i = 0; i < w * h / 18; i++) P(x + (i * 37) % w, y + (i * 53) % h, "#b8b4aa"); };
  const lockerRow = (x, y, n) => { for (let i = 0; i < n; i++){ R(x + i * 12, y, 11, 24, "#7a8a9a"); R(x + i * 12 + 1, y + 2, 9, 1, "#5a6a7a"); P(x + i * 12 + 8, y + 12, "#d8d8d8"); } };
  const studentDesk = (x, y, c) => { R(x, y, 18, 3, c || "#c8a070"); R(x + 2, y + 3, 2, 9, "#6a6a6a"); R(x + 14, y + 3, 2, 9, "#6a6a6a"); R(x + 4, y + 6, 10, 2, "#8a6a4a"); };

  /* ---------- 場景 ---------- */
  // 校門・警衛室（裡面：監視器牆）
  SC.sch_gate = (o) => {
    wall(72, "#d8d4c4", false); R(0, 64, W, 8, "#8a8a7a");
    R(10, 10, 30, 24, "#e8dcb0"); for (let i = 0; i < 6; i++) R(13, 13 + i * 3, 18 + (i % 3) * 3, 1, "#6a6a6a"); R(14, 22, 12, 8, "#9aa4ae");   // 舊報紙
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++){ const x = 120 + c * 17, y = 14 + r * 13; R(x - 1, y - 1, 16, 12, "#2a2a2e"); R(x, y, 14, 10, night(o) ? "#1a2a3a" : "#3a4a5a"); for (let j = 0; j < 10; j += 2) R(x, y + j, 14, 1, "#00000033"); P(x + 2 + (c * 3 + r) % 9, y + 4 + r, "#e9e4da"); }
    R(116, 42, 72, 3, "#3a3a3e");
    OBJ.desk(56, 66, 80); R(60, 56, 22, 10, "#f1ead8"); for (let i = 0; i < 4; i++) R(62, 58 + i * 2, 16, 1, "#6a6a6a");
    R(100, 58, 26, 8, "#e9e4da"); R(102, 60, 22, 4, "#3a6ab8");
    R(130, 58, 8, 8, "#5a7a6a"); R(131, 56, 6, 2, "#3a4a3a");
    windowBox(46, 12, 40, 26, night(o) ? "#1a2238" : "#a8c8e0");
    lamp(96, 0, "#f4e8a8");
    floor(72, "#9a9488", "#8a8478");
  };
  // 校門外（監視器用）
  SC.sch_gatecam = (o) => {
    sky("#0b0f1c", "#27324a", 40);
    R(0, 30, 70, 44, "#c8c0a8"); R(0, 26, 72, 6, "#8a3a2a"); sign(6, 34, 56, "#2a4a6a", "#e9e4da");
    R(150, 26, 42, 48, "#c8c0a8"); R(148, 22, 44, 6, "#8a3a2a"); windowBox(160, 36, 20, 16, "#ffd98a");
    R(70, 56, 80, 4, "#5a5a5a"); for (let x = 72; x < 150; x += 6) R(x, 42, 2, 14, "#6a6a6a"); R(70, 40, 80, 3, "#7a7a7a");
    lamp(110, 0, "#f4e8a8");
    R(0, 74, W, 34, "#4a4a46"); dither(0, 74, W, 34, "#3e3e3a", 4); for (let x = 0; x < W; x += 24) R(x, 90, 12, 1, "#c9c9a0");
  };
  // 行政大樓・校長室
  SC.sch_office = (o) => {
    wall(72, "#e8e0cc", false); R(0, 64, W, 8, "#8a6a4a");
    R(20, 10, 40, 24, "#c9a24a"); R(23, 13, 34, 18, "#7a1e24"); R(26, 16, 28, 3, "#f4e8a8"); R(28, 22, 24, 1, "#f4e8a8"); R(30, 26, 20, 1, "#f4e8a8");   // 績優學校獎牌（稍微歪）
    R(64, 14, 18, 14, "#c9a24a"); R(66, 16, 14, 10, "#2a3a6a"); R(86, 14, 18, 14, "#c9a24a"); R(88, 16, 14, 10, "#2a5a3a");
    R(150, 20, 20, 20, "#f4f4ee"); R(150, 20, 20, 4, "#c23a2a"); for (let i = 0; i < 12; i++) P(152 + (i % 5) * 4, 26 + Math.floor(i / 5) * 4, "#9a9a92"); R(160, 36, 3, 3, "#c23a2a");
    OBJ.desk(70, 62, 70); R(78, 54, 18, 8, "#2a2a2e"); R(80, 55, 14, 6, "#3a5a7a"); R(110, 56, 14, 6, "#f1ead8"); R(130, 52, 4, 10, "#2a3a6a"); P(131, 51, "#c9a24a");
    R(150, 46, 30, 26, "#6b4a2b"); R(152, 48, 26, 10, "#5a3e24"); R(152, 60, 26, 10, "#5a3e24"); P(164, 53, "#c9a24a"); P(164, 65, "#c9a24a");
    OBJ.plant(8, 66);
    floor(72, "#8a6a4a", "#7a5a3a");
  };
  // 2 樓導師室
  SC.sch_staff = (o) => {
    wall(72, "#e4e8e0", false); R(0, 64, W, 8, "#9aa094");
    windowBox(80, 10, 30, 22, night(o) ? "#1a2238" : "#a8c8e0");
    R(4, 12, 40, 26, "#f4f4ee"); R(6, 14, 36, 2, "#3a6ab8"); for (let i = 0; i < 5; i++) R(8, 19 + i * 4, 30 - i * 3, 1, "#6a6a6a");   // 行事曆白板
    // 梁老師的桌子（左）：乾淨
    OBJ.desk(16, 62, 50); for (let i = 0; i < 3; i++) R(20 + i * 8, 56 - i, 7, 6 + i, "#f1ead8"); R(30, 52, 12, 8, "#f8f4e4"); R(30, 52, 12, 1, "#c8c0a8"); R(56, 50, 5, 6, "#e9e4da"); R(57, 51, 3, 2, "#3a6ab8");
    // 鄭國豪的桌子（右）：獎盃
    OBJ.desk(116, 62, 54); for (let i = 0; i < 4; i++){ R(120 + i * 10, 48 - (i % 2) * 4, 6, 10 + (i % 2) * 4, "#c9a24a"); R(121 + i * 10, 58, 4, 4, "#6b4a2b"); } R(146, 46, 14, 12, "#6b4a2b"); R(147, 47, 12, 10, "#a8c0d0"); P(150, 50, "#e8c09a"); P(155, 50, "#e8c09a");
    lockerRow(176, 40, 1);
    lamp(96, 0, "#f4f4e8");
    floor(72, "#a8a89a", "#98988a");
  };
  // 3 樓高二 7 班教室
  SC.sch_class = (o) => {
    wall(72, "#f0ecd8", false); R(0, 64, W, 8, "#9a8a6a");
    R(38, 8, 96, 34, "#2a4a3a"); R(36, 6, 100, 2, "#8a6a4a"); for (let i = 0; i < 5; i++) R(44 + i * 6, 14, 4, 4, "#e9e4da"); for (let i = 0; i < 8; i++) R(76 + i * 5, 14, 3, 4, "#e9e4da"); R(44, 24, 50, 1, "#e9e4da"); R(118, 36, 12, 1, "#e9e4da");
    windowBox(2, 14, 28, 26, night(o) ? "#0e1424" : "#a8c8e0");
    windowBox(160, 14, 28, 26, night(o) ? "#0e1424" : "#a8c8e0");
    floor(72, "#c8b090", "#b8a080");
    for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++){ if (r === 1 && c === 4) continue; studentDesk(10 + c * 32, 60 + r * 16); if ((c + r) % 2) R(14 + c * 32, 57 + r * 16, 8, 3, "#f1ead8"); }
    studentDesk(154, 76, "#d8b080"); R(160, 70, 6, 6, "#8a5a3a"); R(159, 66, 8, 4, "#5fa05a"); P(162, 65, "#7fc07a");   // 空桌子和多肉
  };
  // 樓梯間・頂樓門
  SC.sch_stair = (o) => {
    wall(74, "#d8d8cc", false);
    for (let i = 0; i < 9; i++) R(60 + i * 10, 96 - i * 6 - 4, 12, 6, "#a8a49a"), R(60 + i * 10, 96 - i * 6 - 4, 12, 1, "#c8c4ba");
    R(58, 40, 2, 58, "#6a6a6a"); for (let i = 0; i < 9; i++) R(60 + i * 10, 84 - i * 6, 10, 1, "#6a6a6a");
    R(140, 26, 26, 22, "#5a646e"); R(142, 28, 22, 20, "#6a747e"); R(160, 36, 3, 4, "#c8c8c8"); R(156, 34, 3, 3, "#2a2a2e");   // 頂樓門
    R(40, 20, 30, 24, "#f4f4ee"); R(42, 22, 26, 6, "#3a8a6a"); for (let i = 0; i < 3; i++) R(44, 31 + i * 4, 20, 1, "#6a6a6a");   // 海報
    R(172, 6, 10, 3, "#d6d6d6"); R(174, 9, 6, 4, "#2a2a2e"); P(178, 10, "#e04a3a");   // 監視器
    lamp(100, 0, "#f4f4e8");
    R(0, 96, W, 12, "#9a9a90");
  };
  // 頂樓
  SC.sch_roof = (o) => { const n = night(o);
    sky(n ? "#0b0f1c" : "#8ab0d0", n ? "#2a3650" : "#e0e8ee", 60);
    if (n) for (let i = 0; i < 30; i++) P((i * 47) % W, 30 + (i * 13) % 26, "#ffd98a");   // 港口的燈
    else { R(0, 40, W, 20, "#6a8aa0"); for (let i = 0; i < 6; i++) R(10 + i * 30, 44, 18, 4, "#e9e4da"); }
    R(10, 20, 40, 44, "#9aa0a6"); R(12, 18, 36, 4, "#b8bec4"); R(14, 30, 32, 1, "#7a8086"); R(14, 44, 32, 1, "#7a8086");   // 水塔
    R(26, 74, 34, 3, "#8a6a4a"); R(28, 77, 2, 6, "#6a6a6a"); R(56, 77, 2, 6, "#6a6a6a");   // 長椅
    if (!o.clean){ R(32, 70, 20, 5, "#c8b890"); R(34, 69, 16, 2, "#a8986a"); }   // 帆布包
    R(96, 60, 96, 14, "#b8b4aa"); R(96, 60, 96, 2, "#d8d4ca");   // 女兒牆
    if (!o.clean){ R(124, 70, 5, 3, "#1e1e22"); R(130, 70, 5, 3, "#1e1e22"); }   // 鞋子
    R(122, 66, 14, 4, "#d0ccc2");   // 乾淨的長方形
    R(172, 24, 2, 50, "#6a6a6a"); R(182, 24, 2, 50, "#6a6a6a"); for (let y = 26; y < 72; y += 6) R(172, y, 12, 1, "#6a6a6a"); R(170, 30, 16, 1, "#4a4a4a");   // 爬梯
    R(0, 74, W, 34, "#a8a49a"); dust(0, 76, W, 30);
    if (o.tape) OBJ.tape(96, 76, 96);
    if (o.markers){ OBJ.marker(120, 80); OBJ.marker(140, 86); OBJ.marker(60, 90); }
  };
  // 後中庭
  SC.sch_yard = (o) => { const n = night(o);
    R(0, 0, W, H, n ? "#1a1e28" : "#b8b8ac");
    R(0, 0, 110, 70, n ? "#3a3a40" : "#d8d4c4"); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) windowBox(8 + c * 26, 6 + r * 20, 16, 12, n ? (r === 2 ? "#3a3a28" : "#0e1424") : "#a8c0d0");   // 教學大樓背面
    R(150, 10, 42, 60, n ? "#2a2a2e" : "#9a948a"); for (let i = 0; i < 6; i++) R(152 + (i % 3) * 13, 14 + Math.floor(i / 3) * 20, 10, 14, n ? "#1e1e22" : "#7a746a"); R(146, 40, 50, 30, n ? "#2a2826" : "#8a8478");   // 隔壁工地
    R(110, 60, 40, 12, n ? "#3a3a3a" : "#8a8a80");
    R(36, 66, 34, 10, "#3a6a3a"); for (let i = 0; i < 8; i++) P(38 + i * 4, 66 + (i % 3), "#d84a7a"); R(56, 68, 8, 4, "#2a4a2a");   // 杜鵑
    R(0, 74, W, 34, n ? "#3a3a38" : "#9a9a90"); dither(0, 74, W, 34, n ? "#323230" : "#8a8a82", 4);
    if (o.body){ R(76, 86, 34, 8, "#6a6e74"); R(108, 86, 8, 7, "#1e1a18"); R(70, 88, 7, 4, "#e8c09a"); R(70, 92, 7, 2, "#e8c09a"); R(86, 85, 6, 2, "#e8c09a"); P(90, 85, "#3ab0e0"); OBJ.blood(100, 92, 14); }
    else if (o.outline){ OBJ.outline(80, 86); }
    if (o.tape){ OBJ.tape(20, 80, 150); }
    if (o.markers){ OBJ.marker(72, 96); OBJ.marker(96, 98); OBJ.marker(118, 94); OBJ.marker(58, 80); }
    if (n) lamp(130, 0, "#f4e8a8");
  };
  // 體育館
  SC.sch_gym = (o) => {
    R(0, 0, W, 74, "#c8b898"); for (let x = 0; x < W; x += 16) R(x, 0, 2, 74, "#b8a888"); R(0, 0, W, 6, "#8a7a5a");
    for (let i = 0; i < 4; i++){ R(16 + i * 16, 12, 12, 18, ["#c23a2a", "#2a4a8a", "#c23a2a", "#c9a24a"][i]); R(18 + i * 16, 15, 8, 2, "#f4e8a8"); }
    R(150, 14, 30, 20, "#f4f4ee"); R(152, 16, 26, 16, "#c8c8c8"); R(162, 34, 6, 20, "#6a6a6a"); R(160, 34, 10, 2, "#e86a2a");   // 籃框
    R(100, 74, 92, 2, "#f4f4ee");
    R(150, 60, 24, 14, "#6a6a62"); R(152, 58, 20, 3, "#4a4a42");   // 器材室門口的垃圾桶
    R(0, 74, W, 34, "#c89a5a"); for (let x = 0; x < W; x += 12) R(x, 74, 1, 34, "#b88a4a"); R(0, 92, W, 1, "#f4f4ee"); R(96, 74, 1, 34, "#f4f4ee");
    if (o.mat){ R(100, 84, 40, 6, "#5a8a9a"); R(142, 82, 4, 8, "#e8c040"); }
    lamp(60, 0, "#f4f4e8"); lamp(130, 0, "#f4f4e8");
  };
  // 2 樓走廊（監視器用）
  SC.sch_hall = (o) => {
    wall(74, "#e4e8e0", false); R(0, 66, W, 8, "#9aa094");
    door(20, 40, 22, 34, "#6a7a8a"); R(22, 34, 18, 6, "#f4f4ee"); R(24, 36, 14, 2, "#3a3a3a");   // 導師室門
    R(30, 56, 4, 6, "#2a2a2e"); P(31, 57, "#6fd46f");   // 刷卡機
    for (let i = 0; i < 3; i++) windowBox(60 + i * 30, 20, 22, 20, "#1a2238");
    R(160, 30, 32, 44, "#c8c4ba"); for (let i = 0; i < 6; i++) R(160 + i * 5, 74 - i * 7, 32 - i * 5, 2, "#a8a49a");   // 樓梯
    lamp(96, 0, "#f4f4e8");
    R(0, 74, W, 34, "#a8a89a"); dither(0, 74, W, 34, "#9a9a8c", 5);
  };
  // 操場（監視器用）
  SC.sch_field = (o) => {
    sky("#0b0f1c", "#1a2236", 50);
    R(0, 50, W, 24, "#2a3a2a"); R(0, 74, W, 34, "#6a3a2a"); for (let i = 0; i < 4; i++) R(0, 78 + i * 7, W, 1, "#e9e4da");
    if (o.bikes){ R(0, 40, W, 34, "#3a3a3e"); R(0, 38, W, 3, "#5a5a5e"); for (let i = 0; i < 6; i++){ R(10 + i * 30, 62, 20, 8, i === 2 ? "#e9e4da" : ["#c23a2a", "#2a4a8a", "#3a3a3a"][i % 3]); R(12 + i * 30, 70, 4, 4, "#1e1e1e"); R(24 + i * 30, 70, 4, 4, "#1e1e1e"); } R(73, 56, 6, 5, "#e8c040"); }
    if (!o.bikes){ R(120, 92, 8, 4, "#1e1e22"); R(127, 90, 3, 3, "#1e1e22"); P(127, 89, "#1e1e22"); P(129, 89, "#1e1e22"); R(118, 91, 2, 1, "#1e1e22"); P(128, 91, "#e8c040"); }   // 黑貓
    lamp(100, 0, "#f4e8a8");
  };
  // 補習班教室
  SC.cramroom = (o) => {
    wall(72, "#f4f4ee", false); R(0, 64, W, 8, "#8a8a82");
    R(30, 8, 130, 40, "#f8f8f8"); R(28, 6, 134, 2, "#8a8a8a"); for (let i = 0; i < 6; i++) R(36 + (i % 3) * 40, 14 + Math.floor(i / 3) * 14, 30, 1, "#2a4a8a"); R(110, 30, 30, 10, "#c23a2a");
    R(10, 10, 16, 30, "#2a6ab8"); R(12, 14, 12, 4, "#e9e4da"); R(12, 22, 12, 12, "#e9e4da");
    OBJ.desk(92, 62, 40); R(110, 56, 8, 6, "#2a3a6a");
    floor(72, "#d8d0c0", "#c8c0b0");
    for (let c = 0; c < 6; c++) studentDesk(4 + c * 32, 84, "#e8e4d8");
  };
  // 北澳漁村・蔡家
  SC.caihome = (o) => {
    sky("#8ab0d0", "#e0e8ee", 30);
    R(0, 30, W, 10, "#3a6a9a"); for (let x = 0; x < W; x += 6) R(x, 33 + (x % 5), 4, 1, "#6a9aca");
    R(0, 40, W, 34, "#b8ac90"); for (let i = 0; i < 4; i++){ R(i * 50 - 10, 44, 30, 30, ["#c8c0b0", "#a8b0b8", "#d0c4a8", "#b8b0a0"][i]); R(i * 50 - 12, 41, 34, 4, "#5a6a7a"); }
    R(60, 20, 110, 54, "#c8b8a0"); R(56, 16, 118, 6, "#5a6a7a"); for (let x = 56; x < 174; x += 8) R(x, 16, 1, 6, "#4a5a6a");
    door(120, 40, 22, 34, "#3a6a8a"); for (let i = 0; i < 5; i++) R(120 + i * 5, 40, 3, 30, ["#e8c040", "#c23a2a", "#3a8a6a", "#e8c040", "#2a6ab8"][i]);   // 門簾
    windowBox(72, 36, 26, 18, "#a8c8e0");
    R(4, 66, 50, 8, "#3a6a5a"); for (let i = 0; i < 12; i++) P(6 + i * 4, 64 + (i % 3), "#5a8a7a"); R(20, 60, 8, 6, "#e86a2a");   // 漁網、浮標
    R(0, 74, W, 34, "#a89a7a"); dither(0, 74, W, 34, "#98896a", 4);
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    xiao: { age:"old", skin:"#d8a880", hair:"#8a8a84", hairStyle:"slick", top:"#e9e4da", coat:"#3a3028", bottom:"#3a3028", tie:"#7a1e24", glasses:true, hello:"警官，這件事對學校的傷害已經夠大了。",
            byPhase:{ 1:{ tie:"#2a3a6a", mood:"worried" }, 2:{ coat:"#1e1e22", bottom:"#1e1e22", tie:"#1e1e22", mood:"worried" } } },
    zheng:{ skin:"#c99a6e", hair:"#1a1410", hairStyle:"short", top:"#c23a2a", bottom:"#1e1e22", hello:"我很忙，球隊下禮拜比賽。",
            byPhase:{ 2:{ top:"#2a2a2e", coat:"#1e1e22", mood:"angry" } } },
    yang: { age:"old", skin:"#d0a080", hair:"#c8c8c0", hairStyle:"short", top:"#2a3a5a", bottom:"#2a3a5a", hat:"cap", capColor:"#2a3a5a", mood:"worried", hello:"……是我發現她的。",
            byPhase:{ 1:{ hat:null, mood:"tired" }, 2:{ hat:null, mood:"sad" } } },
    ting: { skin:"#f4d4bc", hair:"#1e1a18", hairStyle:"long", top:"#f4f4ee", bottom:"#2a3a6a", skirt:true, mood:"sad", hello:"……老師她……",
            byPhase:{ 1:{ mood:"sad", tear:true } } },
    wang: { skin:"#f0c8a8", hair:"#3a2a20", hairStyle:"bob", top:"#c8b8d8", coat:"#4a4a5a", bottom:"#4a4a5a", skirt:true, glasses:true, mood:"worried", hello:"媒體的事，我會處理。" },
    sis:  { skin:"#f0c8a8", hair:"#2a2220", hairStyle:"bob", top:"#a8c8d8", bottom:"#3a3a4a", mood:"sad", tear:true, hello:"……她出門前，還幫布丁倒了飼料。",
            byPhase:{ 2:{ top:"#1e1e22" } } },
    chen: { skin:"#e0b48c", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", bottom:"#3a4050", glasses:true, mood:"sad", hello:"……我那天不該傳那則訊息。" },
    cai:  { skin:"#f4d4bc", hair:"#1e1a18", hairStyle:"bob", top:"#e8f0f8", bottom:"#3a5a8a", skirt:true, mood:"worried", hello:"……" },
    doc:  { skin:"#f0d0b4", hair:"#3a2a20", hairStyle:"long", top:"#f4f4f0", coat:"#f4f6f6", bottom:"#5a5a6a", hello:"請坐。" },
    he:   { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#8a9a8a", coat:"#5a5a4a", bottom:"#3a3a30", glasses:true, hello:"沈警官？可以借一步說話嗎？" },
    qian: { age:"old", skin:"#d8a880", hair:"#d8d8d0", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#4a4a52", glasses:true, hello:"來啦。她不會跑，你慢慢看。" },
    zhou: { age:"old", skin:"#d8a880", hair:"#6a6a66", hairStyle:"slick", top:"#e9e4da", coat:"#3a3f4a", bottom:"#2a2f3a", hello:"說重點。" },
    ye:   { skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"long", top:"#f4f4f0", coat:"#6a6e74", bottom:"#6a6e74", skirt:true, hello:"程序要對。說吧。" },
    wu:   { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050", glasses:true, hello:"要驗什麼，交給我。" }
  };
  ["qian","zhou","ye","he","wu"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  const DAILY = {
    xiao: [ { room:"soffice", x:100, pose:"phone", doing:"在校長室講電話，聲音壓得很低。" }, { room:"soffice", x:100, pose:"read", doing:"在校長室改記者會的講稿。" }, { room:"soffice", x:100, pose:"cross", doing:"在校長室走來走去，看了好幾次錶。" } ],
    zheng:[ null, { room:"sgym", x:120, pose:"cross", doing:"在體育館盯著球員練球，吼得比平常大聲。" }, { room:"sstaff", x:140, pose:"phone", doing:"在導師室講電話：「叔，記者一直在問……」" } ],
    yang: [ { room:"sgate", x:90, pose:"sit", doing:"坐在警衛室，手一直在抖。" }, { room:"sgate", x:90, pose:"sit", doing:"一夜沒睡，坐在警衛室盯著監視器。" }, { room:"sgate", x:90, pose:"stand", doing:"站在警衛室門口，看著禮堂的方向。" } ],
    ting: [ { room:"sgate", x:150, pose:"cry", doing:"在警衛室等媽媽來接，一直在哭。" }, { room:"sclass", x:150, pose:"sit", doing:"一個人坐在教室最後一排，那張空桌子旁邊。" } ],
    wang: [ { room:"soffice", x:40, pose:"phone", doing:"在行政大樓講電話安撫家長。" }, { room:"soffice", x:40, pose:"write", doing:"在行政大樓寫家長通知單，寫了又揉掉。" }, { room:"soffice", x:40, pose:"stand", doing:"站在行政大樓的窗邊發呆。" } ],
    sis:  [ null, { room:"lroom", x:120, pose:"cry", doing:"抱著橘貓坐在妹妹的沙發上。" }, { room:"lroom", x:120, pose:"sit", doing:"在整理妹妹的衣服，一件一件摺好。" } ],
    chen: [ null, { room:"cramroom", x:110, pose:"sit", doing:"坐在空教室的講台上，看著一個戒指盒。" } ],
    cai:  [ null, { room:"croom", x:140, pose:"sit", doing:"坐在門簾後面，抱著膝蓋。" } ],
    doc:  [ null, { room:"clroom", x:120, pose:"sit", doing:"在診間看病歷。" } ],
    he:   [ null, { room:"sgate", x:40, pose:"write", doing:"站在校門口，在筆記本上寫東西。" } ],
    qian: [ { room:"syard", x:60, pose:"kneel", doing:"蹲在梁老師旁邊檢查。" }, { x:60, pose:"stand", doing:"在解剖台旁邊寫報告。" } ],
    zhou: [ null, { room:"pdesk", x:140, pose:"phone", doing:"在辦公室講電話，眉頭皺得很緊。" } ],
    ye:   [ null, { room:"pdesk", x:60, pose:"read", doing:"在看卷宗。" } ],
    wu:   [ { room:"sroof", x:90, pose:"kneel", doing:"蹲在頂樓，用手電筒照地上的灰。" }, { x:100, pose:"stand", doing:"在實驗台前盯著電腦。" } ]
  };
  EP6.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });
  const L0 = id => { const L = Object.assign({}, LOOK[id]); delete L.hello; delete L.byPhase; return L; };
  EP6.looks = {
    liangL: { skin:"#f0c8a8", hair:"#2a2220", hairStyle:"pony", top:"#e9e4da", coat:"#6a6e74", bottom:"#6a6e74", skirt:true },
    liangB: { skin:"#f0c8a8", hair:"#2a2220", hairStyle:"pony", top:"#e9e4da", coat:"#6a6e74", bottom:"#6a6e74", skirt:true, prop:"bag" },
    xiaoL: L0("xiao"), yangL: L0("yang"), zhengL: L0("zheng"), tingL: L0("ting"), chenL: L0("chen"),
    zhengHood: { skin:"#c99a6e", hair:"#1e1e22", hairStyle:"short", top:"#1e1e22", coat:"#1e1e22", bottom:"#1e1e22", hood:"#1e1e22" },
    stu1: { skin:"#f4d4bc", hair:"#1e1a18", hairStyle:"short", top:"#c23a2a", bottom:"#1e1e22" },
    stu2: { skin:"#e8c09a", hair:"#1e1a18", hairStyle:"short", top:"#2a4a8a", bottom:"#1e1e22" },
    stu3: { skin:"#f4d4bc", hair:"#1e1a18", hairStyle:"long", top:"#f4f4ee", bottom:"#2a3a6a", skirt:true }
  };

  /* ---------- 房間和隱藏小細節 ---------- */
  EP6.rooms = {
    school: [
      { id:"sgate", name:"校門・警衛室", scene:"sch_gate", details:[
        { id:"d6_sign", name:"值班表", hot:[56,56,24,10], text:"值班表上，楊文雄下個月就排到最後一班——他六月退休。" } ] },
      { id:"soffice", name:"行政大樓・校長室", scene:"sch_office", details:[
        { id:"d6_tie", name:"衣帽架", hot:[176,10,14,40], text:"衣帽架上掛著一條備用的領帶，還有一件深色西裝外套，是記者會要穿的。" } ] },
      { id:"sstaff", name:"2 樓導師室", scene:"sch_staff", details:[
        { id:"d6_board", name:"行事曆白板", hot:[4,12,40,26], text:"白板上寫著：「5/20 7 班家長日（梁）」。她的名字旁邊畫了一個小笑臉。" } ] },
      { id:"sclass", name:"3 樓高二 7 班", scene:"sch_class", details:[
        { id:"d6_pencil", name:"講桌上的粉筆", hot:[80,40,30,6], text:"粉筆盒裡，每一支粉筆都被排得整整齊齊。學生說，老師最受不了亂七八糟。" } ] },
      { id:"sstair", name:"樓梯間・頂樓門", scene:"sch_stair", details:[
        { id:"d6_rail", name:"扶手", hot:[58,40,100,50], text:"扶手被摸得發亮。最上面幾階的灰塵上，有一串很淺的平底鞋印。" } ] },
      { id:"sroof", name:"頂樓", scene:"sch_roof", opt:(ph,has)=>({ tape:true, markers:ph===0, clean:ph>0 }), details:[
        { id:"d6_star", name:"夜空", hot:[0,0,100,30], text:"港口的燈一盞一盞亮著。風很大，吹得人站不穩。" } ] },
      { id:"syard", name:"後中庭", scene:"sch_yard", opt:(ph,has)=>({ body:ph===0, outline:ph>0, tape:true, markers:ph===0 }), details:[
        { id:"d6_gum", name:"牆角", hot:[0,90,30,18], text:"牆角有好幾個菸蒂。保全說，這裡是老師們偷偷抽菸的地方——梁老師不抽菸。" } ] },
      { id:"sgym", name:"體育館", scene:"sch_gym", opt:(ph,has)=>({ mat:ph>0 }), details:[
        { id:"d6_shoe", name:"場邊的球鞋", hot:[20,86,30,10], text:"場邊一雙球鞋，鞋舌上寫著「經理」兩個字，已經很舊了。" } ] }
    ],
    police: [ { id:"pdesk", name:"刑大辦公室", scene:"police", details:[
      { id:"d6_coffee", name:"咖啡杯", hot:[150,58,12,8], text:"你的咖啡杯上貼著小吳寫的便條：「學長，記得吃飯」。" } ] } ],
    lab: [ { id:"lab", name:"法醫室・鑑識中心", scene:"lab", details:[
      { id:"d6_radio", name:"收音機", hot:[110,40,20,12], text:"老錢的收音機永遠在放老歌，他說死人比較喜歡聽這個。" } ] } ],
    liangapt: [ { id:"lroom", name:"梁靜儀的家", scene:"apartment", details:[
      { id:"d6_plant", name:"陽台的花", hot:[160,20,30,40], text:"陽台上的九層塔剛澆過水，土還是濕的——是姐姐澆的。" } ] } ],
    cram: [ { id:"cramroom", name:"柏宇數學・教室", scene:"cramroom", details:[
      { id:"d6_rank", name:"榜單", hot:[10,10,16,30], text:"牆上的金榜：「賀　台大醫科　林○○」。陳柏宇說，那是梁老師以前的學生，介紹來補習的。" } ] } ],
    caihome: [ { id:"croom", name:"蔡家門口", scene:"caihome", details:[
      { id:"d6_float", name:"浮標", hot:[16,58,20,10], text:"門口堆著橘色的浮標。宜蓁說，外公以前是船長。" } ] } ],
    clinic: [ { id:"clroom", name:"心晴身心科・候診室", scene:"hospital", details:[
      { id:"d6_tissue", name:"面紙盒", hot:[100,56,16,10], text:"每張椅子旁邊都放著一盒面紙。" } ] } ]
  };

  /* ---------- 監視器動畫 ---------- */
  const ANIM = {
    cctv_stair: { scene:"sch_stair", cam:"3F-RF 樓梯", date:"2026-05-13", beats:[
      { t:"19:36:10", d:4.5, cap:"梁靜儀一個人走上樓梯，肩上背著帆布包，在頂樓門口按了密碼。", m:{ liangB:[152,48,null,1,20,98,[[60,98],[140,48]]] }, out:["liangB"] },
      { t:"19:40:00", d:3, cap:"（19:36 到 21:16，沒有任何人經過。）" },
      { t:"21:16:40", d:4.5, cap:"保全楊文雄和校長蕭明德一起上樓。", m:{ yangL:[152,48,null,1,10,98,[[60,98],[140,48]]], xiaoL:[150,48,null,1,-10,98,[[60,98],[140,48]]] }, out:["yangL","xiaoL"] },
      { t:"21:22:05", d:4.5, cap:"蕭明德先下樓，手上拿著一張摺起來的白紙，邊走邊塞進西裝內袋。", m:{ xiaoL:[20,98,"hold",-1,150,48,[[140,48],[60,98]]] } },
      { t:"21:24:30", d:4, cap:"楊文雄下樓，一隻手扶著牆。", m:{ yangL:[30,98,null,-1,150,48,[[140,48],[60,98]]] }, out:["xiaoL"] }
    ] },
    cctv_gate: { scene:"sch_gatecam", cam:"校門 CAM1", date:"2026-05-13", beats:[
      { t:"21:00:30", d:3.5, cap:"晚自習結束，學生一個一個走出校門。班長林雨婷留在門口滑手機。", m:{ stu1:[230,98,null,1,110,90], stu2:[240,98,null,1,100,90], tingL:[60,98,"phone",1,110,90] }, out:["stu1","stu2"] },
      { t:"21:12:20", d:3.5, cap:"一台銀色轎車開進校門，停在行政大樓前面。", cars:{ silver:[-60,40,"#c8ccd0"] } },
      { t:"21:22:10", d:3.5, cap:"一台黑色休旅車開進來，往後面的教師停車場開過去。車窗上貼著籃球隊的貼紙。", cars:{ suv:[-60,240,"#1e1e22"] } },
      { t:"21:28:40", d:3, cap:"黑色休旅車開出校門。", cars:{ suv:[240,-60,"#1e1e22"] } },
      { t:"21:45:00", d:3, cap:"兩台警車開進來。", cars:{ pc1:[-60,90,"#e9e4da"], pc2:[-110,40,"#e9e4da"] } }
    ] },
    cctv_gym: { scene:"sch_gym", cam:"GYM CAM", date:"2026-05-13", beats:[
      { t:"19:20:00", d:3.5, cap:"鄭國豪掛著哨子走進體育館，球員已經在熱身。", m:{ zhengL:[70,98,"stand",1,-14,98], stu1:[120,98,null,-1], stu2:[150,98,null,-1] } },
      { t:"19:48:00", d:4, cap:"分組對抗。鄭國豪一直站在場邊吹哨、罵人。", m:{ zhengL:[70,98,"point",1], stu1:[140,98,null,1,110,98], stu2:[110,98,null,-1,160,98] } },
      { t:"20:35:00", d:3.5, cap:"鄭國豪和球員一起走出體育館。", m:{ zhengL:[-20,98,null,-1,70,98], stu1:[-30,98,null,-1,140,98], stu2:[-40,98,null,-1,110,98] }, out:["zhengL","stu1","stu2"] }
    ] },
    cctv_hall2: { scene:"sch_hall", cam:"2F 走廊", date:"2026-05-13", beats:[
      { t:"19:07:10", d:3.5, cap:"鄭國豪走進導師室。", m:{ zhengL:[31,76,null,-1,180,98] }, out:["zhengL"] },
      { t:"19:10:30", d:3.5, cap:"一個女學生拿著作業走到門口，停住，又轉身走掉。", m:{ tingL:[60,98,"hold",-1,180,98] } },
      { t:"19:14:00", d:3, cap:"鄭國豪大步走出導師室，用力甩上門。", m:{ zhengL:[200,98,null,1,31,76], tingL:[200,98,"hold",1,60,98] }, out:["zhengL","tingL"] },
      { t:"19:20:20", d:3, cap:"梁靜儀走出導師室，往樓上走。", m:{ liangL:[176,60,null,1,31,76,[[150,98],[176,60]]] }, out:["liangL"] },
      { t:"19:31:00", d:3, cap:"梁靜儀回到導師室。", m:{ liangL:[31,76,null,-1,176,60,[[150,98]]] }, out:["liangL"] },
      { t:"19:34:40", d:3.5, cap:"梁靜儀背著帆布包出來，往樓上走。", m:{ liangB:[176,60,null,1,31,76,[[150,98],[176,60]]] }, out:["liangB"] },
      { t:"21:24:10", d:3.5, cap:"一個穿黑色連帽外套、拉起帽子的男人走進導師室。看不到臉。", m:{ zhengHood:[31,76,null,-1,176,60,[[150,98]]] }, out:["zhengHood"] },
      { t:"21:26:20", d:3.5, cap:"那個男人走出來，一隻手插在口袋裡，快步下樓。", m:{ zhengHood:[200,98,null,1,31,76] }, out:["zhengHood"] }
    ] },
    cctv_field: { scene:"sch_field", cam:"操場 CAM", date:"2026-05-13", beats:[
      { t:"19:00:00", d:2.5, cap:"操場上沒有人。" },
      { t:"20:12:00", d:3.5, cap:"一隻黑貓慢慢走過跑道。" },
      { t:"21:00:00", d:2.5, cap:"其他什麼都沒有。" }
    ] },
    cctv_park: { scene:"sch_field", opt:{ bikes:true }, cam:"機車棚 CAM", date:"2026-05-13", beats:[
      { t:"17:00:00", d:3, cap:"梁靜儀的白色機車停在機車棚，安全帽掛在把手上。" },
      { t:"21:05:00", d:3.5, cap:"學生陸續把機車騎走。她的機車一直沒有人碰。", m:{ stu1:[-20,98,null,-1,150,98], stu2:[-30,98,null,-1,180,98] }, out:["stu1","stu2"] }
    ] },
    ev_cram_cctv: { scene:"cramroom", cam:"教室 CAM", date:"2026-05-13", beats:[
      { t:"18:30:00", d:3, cap:"陳柏宇走上講台。四十個學生。", m:{ chenL:[110,98,"stand",1,-14,98] } },
      { t:"19:30:10", d:3.5, cap:"他低頭看了一下手機，打了幾個字，臉色很難看。", m:{ chenL:[110,98,"phone",1] } },
      { t:"20:15:00", d:3.5, cap:"他一直在講台上寫黑板、講題目。", m:{ chenL:[80,98,"point",-1,110,98] } }
    ] }
  };
  [...EP6.cctv, ...EP6.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });
  const PS = [["sch_yard",{ phase:0, body:true, tape:true, markers:true }],["police",{}],["sch_roof",{ phase:1, clean:true, tape:true }]];
  EP6.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 結案 ---------- */
  EP6.court = {
    title: "海濱高中禮堂・記者會前十分鐘", scene: "sch_class",
    who: ph => ["xiao","zheng","yang","wang","sis","chen"],
    open: ph => "禮堂外面已經架好了攝影機。你請校長在記者會開始之前，先跟大家在教室裡坐一下。梁靜文抱著妹妹的照片，坐在最後一排那張空桌子旁邊。",
    kindLine: {
      suicide: "梁老師是自己走上頂樓的。可是她留下了一封信——有人不想讓這封信被看見。",
      murder: "梁老師不是自己掉下去的。有人把她推了下去。",
      accident: "梁老師是不小心從頂樓摔下去的。"
    },
    murmur: [ "（蕭明德一直看手錶。）", "（鄭國豪雙手抱胸，看著窗外。）", "（楊文雄低著頭，帽子捏在手裡。）" ],
    confess: {
      xiao: [ "……我看到那張紙的時候，第一個念頭是：評鑑完了，學校完了。", "我告訴自己，我是在保護學校，保護一千兩百個學生。", "……可是我連她一個人都沒有保護。" ],
      zheng: [ "校長打來說：「她留了東西，跟你有關。」我腦袋一片空白，就開車回去了。", "……那支隨身碟，我折斷的時候手在抖。", "我沒有推她。我沒有。" ]
    },
    cornered: { xiao: "……我要等律師來再說。", zheng: "你有證據就去告啊！我叔叔是誰你知道嗎？" },
    deny: {
      yang: "我只是照校長說的做……我對不起梁老師。",
      wang: "我收了陳情書，卻什麼都沒做。我沒有資格說話。",
      sis: "我妹妹不會做錯事的！",
      chen: "我那天在上課……我連去找她都沒有。"
    },
    replayText: "5 月 13 日晚上 19:10，鄭國豪在導師室對她說：「你再亂講，我讓你連老師都當不成。」二十六分鐘以後——",
    replay: { scene:"sch_roof", opt:{ phase:0 }, clean:true, cam:"案發經過重現", date:"2026-05-13", beats:[
      { t:"19:36:30", d:4.5, cap:"她走上頂樓，把鞋子脫下來，並排擺好。鞋子旁邊，壓著一張寫給大家的信。", m:{ liangB:[126,98,"kneel",1,20,98] } },
      { t:"19:41:00", d:4.5, cap:"她傳了最後一則訊息給姐姐：「姐，對不起。布丁拜託妳了。」", m:{ liangB:[126,98,"phone",1] }, out:["liangB"] },
      { t:"21:16:50", d:4, cap:"保全和校長走上頂樓。", m:{ xiaoL:[118,98,null,1,-14,98], yangL:[150,98,null,1,-30,98] } },
      { t:"21:18:00", d:4.5, cap:"校長撿起那封信，看見自己的名字。他把信摺起來，放進口袋。", m:{ xiaoL:[124,98,"hold",1], yangL:[160,98,"stand",1] } },
      { t:"21:20:10", d:4.5, cap:"他在頂樓打電話給鄭國豪：「她留了東西，跟你有關。」", m:{ xiaoL:[110,98,"phone",-1,124,98], yangL:[160,98,"stand",1] } },
      { t:"21:22:05", d:3.5, cap:"他先下樓了。", m:{ xiaoL:[-20,98,null,-1,110,98], yangL:[160,98,"stand",1] }, out:["xiaoL","yangL"] }
    ] },
    endGood: "那天下午的記者會，校長沒有出現。站在麥克風前面的是梁靜文，她讀了妹妹的信。\n三天後，教育局宣布重新調查海濱高中的三次陳情。蔡宜蓁寫了一封信給梁老師，放在頂樓那雙鞋子原本的位置。\n\n如果你或身邊的人正感到痛苦，請撥打安心專線 1925（24 小時）。",
    endBad: "記者會照常開始。校長說：「我們會永遠記得梁老師。」\n台下的梁靜文，把手裡的照片握得很緊。\n\n如果你或身邊的人正感到痛苦，請撥打安心專線 1925（24 小時）。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[6] && ARC_INTER[6].after) EP6.after = ARC_INTER[6].after;

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP6.outScenes = ["sch_roof","sch_yard","caihome"];
  EP6.fac = { school:["#e8dcc0","#2a5a3a"], police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], liangapt:["#d8d0c8","#6a4a5a"], cram:["#f4f4ee","#2a6ab8"], caihome:["#c8b8a0","#3a6a8a"], clinic:["#e8f0e8","#3a8a6a"] };
  EP6.setting = { school:"town", police:"city", lab:"city", liangapt:"city", cram:"city", caihome:"town", clinic:"city" };
  const SKY6 = [ ["#0b0f1c","#27324a","#18202a","#1d2630",0,1], ["#7a96b4","#c8d8e4","#4a5a6a","#56666c",1,0], ["#8ab0d0","#e0e8ee","#4a6070","#56707a",0,0] ];
  EP6.worldSky = ph => SKY6[Math.min(ph || 0, SKY6.length - 1)];
  EP6.roomDesc = {
    sgate:"警衛室。牆上一排監視器，桌上一本巡邏紀錄。", soffice:"行政大樓的校長室。牆上掛滿了獎牌。", sstaff:"2 樓的導師室。每個老師一張桌子。",
    sclass:"高二 7 班的教室。黑板上還留著她的字。", sstair:"通往頂樓的樓梯。最上面是一扇鐵門。", sroof:"頂樓。風很大，看得到整個港口。",
    syard:"教學大樓後面的中庭。很暗，平常沒有人來。", sgym:"體育館。地板上全是球鞋的刮痕。",
    pdesk:"澄港市刑大。你的位子在窗邊。", lab:"法醫室和鑑識中心。老錢和小吳都在這裡。", lroom:"梁靜儀的家。小小的，很整齊。一隻橘貓躲在沙發底下。",
    cramroom:"柏宇數學的教室。白板上還有昨天的題目。", croom:"北澳漁村，蔡家門口。海風吹得門簾一直晃。", clroom:"心晴身心科的候診室。燈光很柔和。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#4a4038", bottom:"#3a3328", tie:"#5a2a2a", hat:"fedora", hatColor:"#3a3226" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const FOR = { skin:"#e8c09a", hair:"#1a1410", hairStyle:"short", top:"#f4f6f6", bottom:"#f4f6f6", mask:"#9ac0e0", hood:"#f4f6f6" };
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", tie:"#1a2236" };
  EP6.world = {};
  EP6.locations.forEach(l => { EP6.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP6.world.school, {
    extras: [
      { id:"for1", name:"鑑識員", phase:0, until:0, x:RX(6) + 120, L:FOR, pose:"cam", facing:-1, lines:[
        "1 號是手環，2 號是她的髮夾，3 到 6 號是落地的位置。", "她是頭先著地的……不要看太久。" ] },
      { id:"cop6", name:"派出所員警", phase:0, until:0, x:RX(5) + 30, L:COP, pose:"stand", facing:1, mood:"tired", lines:[
        "頂樓的門是我們到了以後才封的。之前有誰上來過，要問保全。", "這麼高的牆……不是不小心翻得過去的。" ] },
      { id:"stu6", name:"籃球隊員", phase:1, x:RX(7) + 60, L:{ skin:"#e8c09a", hair:"#1a1410", hairStyle:"short", top:"#c23a2a", bottom:"#1e1e22" }, pose:"stand", facing:1, lines:[
        "教練昨天練球一直都在啊，罵得超兇。", "器材室？……教練說那裡是他的地盤，我們不准亂進去。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { car:[-60, 8, 2.4, "#e9e4da"], hide:true },
      { wait:0.5, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長，到了。海濱高中。死者是高二 7 班的導師，梁靜儀，38 歲。", "小吳"),
      say("wu", "保全九點零五分在教學大樓後面的中庭發現她。可是學校九點半才報警。", "小吳"),
      say("wu", "校長說他接到電話才趕來。他現在在校長室，一直在打電話。", "小吳"),
      say("you", "從那麼高的地方掉下來，不是被推，就是自己走上去，或是不小心。我們得知道是哪一個。", "你"),
      say("wu", "今晚只能在學校查。明天才能申請通聯，去她家、去法醫室。……校長說，星期五要開記者會。", "小吳"),
      say("wu", "問一題五分鐘，查一樣東西十分鐘。想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳")
    ]
  });
  EP6.mapPos = { school:[120,70,"u"], police:[150,96,"r"], lab:[176,84,"u"], liangapt:[90,104,"l"], cram:[70,60,"l"], caihome:[30,24,"r"], clinic:[110,116,"d"] };
  EP6.mapRoads = [["school","police"],["police","lab"],["police","liangapt"],["school","cram"],["liangapt","clinic"],["cram","caihome"],["police","clinic"]];
  EP6.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#8a9a86"); dither(0, 0, 240, 135, "#96a692", 3);
    const blocks = (x0, y0, x1, y1, c, c2) => { for (let x = x0; x < x1; x += 8) for (let y = y0; y < y1; y += 7) { R(x, y, 6, 5, c); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, c2); } };
    blocks(60, 50, 210, 128, "#c8c0b0", "#b0a898");
    for (let y = 0; y < 40; y += 2) for (let x = 0; x < 80 - y; x += 4) R(x, y + Math.sin(t + x / 9) * 0.5, 4, 2, "#4a86b4");   // 北邊的海
    R(110, 62, 20, 12, "#d8c8a0"); R(112, 64, 16, 8, "#6a8a5a");   // 學校操場
  };
})();
