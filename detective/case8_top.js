/* =========================================================
   第 8 集・俯視版（topdown.js）
   謎境密室逃脫工作室（大廳、走廊、古宅、控制室、最後一個房間、道具倉、辦公室）、
   刑大（共用 CG_DESK）、鑑識中心（共用 CG_LAB；多了許知夏的桌子）、江家、密室聯盟、葛志偉的工作室。
   ========================================================= */
const C8T = typeof TOPEP === "function" ? TOPEP("lastroom") : null;
// 天色：第一晚 23:50 是晚上（case8_art 的 SKY8 沒有標夜晚，俯視版自己標）
if (C8T){ const SKY8T = [ ["#0b0f1c","#27324a","#18202a","#1d2630",0,1], ["#8ab0d0","#e0e8ee","#4a6070","#56707a",0,0], ["#c8a8a0","#f0d8c0","#5a5060","#6a6070",0,0] ];
  C8T.EP.worldSky = ph => SKY8T[Math.min(ph || 0, SKY8T.length - 1)]; }

/* ================= 謎境密室逃脫工作室 ================= */
C8T && (() => {
  const { EP, T, O, sh, dA, ph, night, A, tone, window2, cityView, fluo, vinyl, laminate, concrete, carpetTiles, setLoc } = C8T;
  const W0 = EP.world.studio || {};
  const neon = (g, x, y, w, col, t) => { g.save(); g.globalAlpha = .18 + .05 * Math.sin(t * 3); g.fillStyle = col; g.fillRect(x - 4, y - 4, w + 8, 10); g.restore(); };
  const plank = (p, x, y, w, h, col) => { p.R(x, y, w, h, col); for (let j = y; j < y + h; j += 8){ p.R(x, j, w, 1, sh(col, -.2)); for (let i = x + ((j / 8) % 3) * 22; i < x + w; i += 66) p.R(i, j, 1, 8, sh(col, -.2)); } };

  /* ---------- 大廳・櫃台：很暗、紫色的牆、一整面拍立得 ---------- */
  const sfront = { name:"大廳・櫃台", w:288, h:156, wall:62,
    floor(p, g, t, o){
      T.backWall(p, 0, 288, 62, "#3a2a4a", "plain", { base:"#1a1424" });
      // 「謎境」霓虹招牌
      p.R(110, 6, 70, 16, O); p.R(111, 7, 68, 14, "#1a1424"); for (let k = 0; k < 4; k++){ p.R(118 + k * 15, 9, 11, 10, "#c86ae8"); p.R(120 + k * 15, 11, 7, 6, "#1a1424"); }
      // 一整面拍立得（左）
      p.R(8, 10, 86, 46, O); p.R(9, 11, 84, 44, "#2a1e34"); for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++){ const x = 11 + c * 10, y = 13 + r * 10.5; p.R(x, y, 9, 9, "#f4f4ee"); p.R(x + 1, y + 1, 7, 5, ["#5a7aa8", "#a8785a", "#6a8a5a", "#8a5a8a"][(r + c) % 4]); }
      p.R(81, 45, 9, 9, "#f8f8f0"); p.R(82, 46, 7, 5, "#4a5a7a");   // 最新的一張
      // 預約白板
      p.R(196, 10, 50, 40, O); p.R(197, 11, 48, 38, "#f4f4f0"); for (let r = 0; r < 5; r++){ p.R(199, 14 + r * 7, 14, 4, "#3a3a6a"); p.R(215, 14 + r * 7, 28, 4, r === 0 ? "#2a5ad8" : r === 4 ? "#c8302a" : "#e0e0e8"); }
      // 牆角往走廊的門口（右）
      carpetTiles(p, 0, 62, 288, 94, "#2a2434", "#262030");
      T.sides(p, this, "#1a1424", [["R", 90, 40], ["B", 120, 48]]); T.sideDoor(p, this, "R", 90, 40, dA("sfront", "shall"), "#4a3a5a");
    },
    props:[
      // 櫃台：服務鈴、名片架、門禁電腦
      { y:106, draw(p, g, t){ T.box(p, 120, 82, 100, 14, 12, "#5a4a6a", "#3a2a4a"); p.R(120, 94, 100, 2, "#c86ae8");
          p.R(132, 84, 8, 6, O); p.R(133, 85, 6, 4, "#e9c43a"); p.R(135, 83, 2, 2, "#e9c43a");                                   // 服務鈴
          p.R(150, 84, 14, 6, O); p.R(151, 85, 5, 4, "#f4f4f0"); p.R(157, 85, 5, 4, "#f4f4f0"); p.R(158, 85, 3, 1, "#c8302a");   // 名片架
          p.R(190, 72, 22, 14, O); p.R(191, 73, 20, 11, "#1e2226"); p.R(192, 74, 18, 9, "#2a3a5a"); p.R(194, 76, 12, 1, "#9ac0e0"); p.R(194, 79, 8, 1, "#9ac0e0"); } },
      // 櫃台後面的椅子（帆布包掛在椅背上）
      { y:78, draw(p){ T.chair(p, 172, 78, "#2a2a30", "down"); p.R(164, 64, 10, 12, O); p.R(165, 65, 8, 10, "#c8b890"); p.R(166, 66, 6, 2, "#f4f4f0"); } },
      // 等候的沙發、鎖物櫃
      { y:132, draw(p){ T.box(p, 18, 114, 60, 10, 8, "#5a3a6a", "#3a2a4a"); p.R(18, 108, 60, 8, O); p.R(19, 109, 58, 6, "#6a4a7a"); } },
      { y:150, draw(p){ T.plant(p, 268, 150, true); } }
    ],
    front(p, g, t, o){ neon(g, 110, 10, 70, "#c86ae8", t); T.glow(g, 160, 88, 60, "200,120,240", .12); T.dim(g, this, .12); tone(g, this, o, .3); },
    solid:[[118,80,104,30],[16,106,64,28],[258,134,20,18]],
    exits:[ { r:[280,90,8,40], to:"shall", at:[24,96], label:"走廊", kind:"door", art:[280,88,8,44] } ]
  };

  /* ---------- 走廊：五扇門（辦公室、古宅、控制室、廁所、最後一個房間） ---------- */
  const DOORS = [ ["soffice", 18, "辦公室", "#8a6a4a"], ["sguzhai", 82, "古宅", "#7a2a1a"], ["sctrl", 146, "控制室", "#4a4e54"], [null, 210, "廁所", "#6a7a8a"], ["sfinal", 274, "最後一個房間", "#1a3a2a"] ];
  const shall = { name:"走廊", w:336, h:124, wall:62,
    floor(p, g, t, o){
      T.backWall(p, 0, 336, 62, "#1e1a24", "plain", { base:"#0e0a14" });
      DOORS.forEach(([to, x, lab, col]) => { T.backDoor(p, x, 18, 28, 44, to ? dA("shall", to) : 0, col, { frame:"#0e0a14" }); p.R(x + 4, 8, 20, 7, O); p.R(x + 5, 9, 18, 5, to === "sfinal" ? "#e9c43a" : "#c8c0b0"); p.R(x + 8, 11, 12, 1, O); });
      // 最後一個房間的讀卡機
      p.R(304, 34, 6, 10, O); p.R(305, 35, 4, 8, "#2a2a2e"); p.R(306, 36, 2, 2, ph(o) === 0 ? "#6fd46f" : "#e84a3a");
      // 海報「最後一個房間 8 月開幕」
      p.R(244, 14, 22, 32, O); p.R(245, 15, 20, 30, "#1a3a2a"); p.R(247, 18, 16, 4, "#e9c43a"); p.R(250, 26, 10, 12, "#0e2a1e"); p.R(254, 28, 2, 8, "#c8c0b0"); p.R(247, 40, 16, 2, "#c8c0b0");
      // 三格置物櫃（江、葛、卓）
      for (let k = 0; k < 3; k++){ p.R(116 + k * 9, 20, 8, 38, O); p.R(117 + k * 9, 21, 6, 36, "#5a6a7a"); p.R(118 + k * 9, 24, 4, 3, "#f4f4f0"); p.R(121 + k * 9, 38, 1, 4, k === 1 ? "#e9c43a" : "#2a2a2a"); }
      // 地：黑色的地板＋一路導引的小燈
      vinyl(p, 0, 62, 336, 62, "#2a2830", "#26242c", 14); for (let x = 8; x < 336; x += 24) p.R(x, 66, 3, 1, "#e9c43a");
      T.sides(p, this, "#0e0a14", [["L", 76, 40], ["R", 76, 40]]); T.sideDoor(p, this, "L", 76, 40, dA("shall", "sfront"), "#4a3a5a"); T.sideDoor(p, this, "R", 76, 40, dA("shall", "sprop"), "#5a5e64");
    },
    props:[],
    front(p, g, t, o){ T.cam(p, 168, 2, 1, t); for (let x = 30; x < 336; x += 64) T.glow(g, x, 64, 24, "255,220,150", .1); T.dim(g, this, .1); tone(g, this, o, .3); },
    solid:[[112,16,32,46]],
    exits:[ { r:[0,76,8,40], to:"sfront", at:[264,108], label:"大廳", kind:"door", art:[0,74,8,44] },
            { r:[328,76,8,40], to:"sprop", at:[24,104], label:"道具倉", kind:"door", art:[328,74,8,44] },
      ...DOORS.filter(d => d[0]).map(([to, x, lab]) => ({ r:[x, 64, 28, 8], to, at:{ soffice:[112,128], sguzhai:[128,140], sctrl:[40,126], sfinal:[216,154] }[to], label:lab, kind:"door", art:[x, 18, 28, 44] })) ]
  };

  /* ---------- 古宅：深色木頭、雕花窗、祖先畫像（眼睛是挖空的） ---------- */
  const sguzhai = { name:"古宅", w:256, h:152, wall:64,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 64, "#5a2a1a", "wood", { base:"#2a140a" });
      // 雕花窗（左右）
      for (const x of [16, 196]){ p.R(x, 12, 44, 34, O); p.R(x + 1, 13, 42, 32, "#3a1a0e"); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++){ p.R(x + 4 + i * 10, 16 + j * 10, 7, 7, "#d8b878"); p.R(x + 6 + i * 10, 18 + j * 10, 3, 3, "#3a1a0e"); } }
      // 祖先畫像（眼睛挖空，後面一支小小的監視器）
      p.R(108, 6, 40, 50, O); p.R(109, 7, 38, 48, "#c8a050"); p.R(112, 10, 32, 42, "#e8dcc0"); p.R(120, 16, 16, 18, "#d8b090"); p.R(118, 12, 20, 6, "#1a1410"); p.R(122, 22, 3, 2, O); p.R(131, 22, 3, 2, O); p.R(132, 22, 1, 1, "#e84a3a"); p.R(116, 34, 24, 16, "#3a1a3a"); p.R(126, 34, 4, 16, "#c8a050");
      // 紅燈籠
      for (const x of [76, 168]){ p.R(x, 4, 14, 16, O); p.R(x + 1, 5, 12, 14, "#c8302a"); p.R(x + 4, 20, 6, 4, "#e9c43a"); }
      T.wood(p, 0, 64, 256, 88, "#6a3a1e");
      T.sides(p, this, "#2a140a", [["B", 112, 32]]);
    },
    props:[
      // 梳妝台（鏡子、老花眼鏡）
      { y:96, draw(p){ T.box(p, 18, 70, 50, 14, 12, "#6a2a14", "#4a1a0a"); p.R(30, 50, 26, 22, O); p.R(31, 51, 24, 20, "#a8b8c0"); p.R(33, 53, 8, 14, "#c8d8e0"); p.R(46, 74, 10, 4, O); p.R(47, 75, 3, 2, "#c8d8e0"); p.R(52, 75, 3, 2, "#c8d8e0"); } },
      // 供桌（香爐、牌位）
      { y:88, draw(p, g, t){ T.box(p, 100, 66, 56, 12, 10, "#5a1a0a", "#3a0e06"); p.R(122, 60, 12, 8, O); p.R(123, 61, 10, 6, "#a8742a"); p.R(126 + Math.round(Math.sin(t * 2)), 52, 1, 8, "rgba(220,220,220,.5)"); p.R(106, 58, 10, 10, O); p.R(107, 59, 8, 8, "#2a140a"); p.R(140, 58, 10, 10, O); p.R(141, 59, 8, 8, "#2a140a"); } },
      // 太師椅、大木箱
      { y:122, draw(p){ T.chair(p, 196, 122, "#5a1a0a", "left"); T.box(p, 26, 116, 34, 12, 10, "#7a4a1e", "#5a3014"); p.R(40, 122, 6, 4, "#c8a050"); } },
      // 緊急開門按鈕（門邊）
      { y:150, draw(p){ p.R(150, 136, 10, 10, O); p.R(151, 137, 8, 8, "#f4f4f0"); p.R(152, 138, 6, 6, "#e84a3a"); } }
    ],
    front(p, g, t, o){ for (const x of [83, 175]) T.glow(g, x, 18, 30, "255,120,80", .14); T.dim(g, this, .14); tone(g, this, o, .3); },
    solid:[[16,48,54,38],[98,58,60,20],[24,114,38,24],[184,100,20,24]],
    exits:[ { r:[112,144,32,8], to:"shall", at:[96,76], label:"走廊", kind:"out", art:[110,140,36,12] } ]
  };

  /* ---------- 控制室：一排監視螢幕、GM 控制台、後面一個很大的鐵櫃 ---------- */
  const sctrl = { name:"控制室", w:256, h:144, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 60, "#2a2e34", "plain", { base:"#14161a" });
      // 監視螢幕（2 × 3）；「最後一個房間」那一格是黑的，貼著便條
      p.R(10, 6, 120, 46, O); p.R(11, 7, 118, 44, "#1a1c20");
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++){ const x = 14 + c * 38, y = 10 + r * 20, off = r === 1 && c === 2; p.R(x, y, 36, 18, off ? "#050506" : ["#2a3a4a", "#3a2a1a", "#2a2a3a", "#1e2a2a", "#2a2a2a"][r * 3 + c]); if (!off) p.R(x + 4 + (Math.floor(t * 2 + c) % 20), y + 8, 4, 6, "rgba(220,220,230,.3)"); }
      p.R(92, 30, 14, 8, "#f4e88a"); p.R(94, 32, 10, 1, "#3a3a3a"); p.R(94, 35, 8, 1, "#3a3a3a");
      // 小洗手台（角落）
      p.R(146, 24, 26, 30, "#c8ccd0"); p.R(150, 18, 18, 8, "#a8acb0");
      concrete(p, 0, 60, 256, 84, "#4a4e54", 19);
      T.sides(p, this, "#14161a", [["B", 24, 32]]);
    },
    props:[
      // 洗手台
      { y:70, draw(p){ T.box(p, 144, 52, 30, 10, 8, "#e8ecf0", "#b8bcc0"); p.R(152, 54, 14, 6, O); p.R(153, 55, 12, 4, "#a8b8c0"); p.R(158, 56, 2, 2, "#2a2a2a"); p.R(158, 46, 2, 8, "#8a8e94"); } },
      // GM 控制台：耳機麥克風、電腦、兩本紀錄、開幕紀念杯
      { y:96, draw(p, g, t){ T.box(p, 40, 72, 100, 14, 10, "#5a5e64", "#3a3e44");
          p.R(48, 62, 22, 12, O); p.R(49, 63, 20, 9, "#1e2226"); p.R(50, 64, 18, 7, "#2a4a3a"); p.R(52, 66, 10, 1, "#6fd46f"); p.R(52, 69, 6, 1, "#6fd46f");
          p.R(74, 62, 22, 12, O); p.R(75, 63, 20, 9, "#1e2226"); p.R(76, 64, 18, 7, "#3a3a5a"); p.R(78, 66, 12, 1, "#9ac0e0");
          p.R(104, 74, 14, 8, O); p.R(105, 75, 3, 6, "#1a1a1a"); p.R(114, 75, 3, 6, "#1a1a1a"); p.R(106, 74, 10, 2, "#1a1a1a"); p.R(116, 80, 6, 1, "#1a1a1a");   // 耳機
          p.R(126, 74, 8, 8, O); p.R(127, 75, 6, 6, "#f4f4f0"); p.R(128, 77, 4, 2, "#c86ae8"); } },
      { y:104, draw(p){ T.chair(p, 96, 104, "#2a2a30", "left"); } },
      // 「電源・危險」的大鐵櫃（比人還高）
      { y:98, draw(p, g, t, o){ T.box(p, 196, 24, 46, 10, 62, "#6a6e74", "#4a4e54"); p.R(218, 34, 1, 62, O); p.R(204, 44, 30, 12, "#e9c43a"); p.R(206, 46, 26, 8, "#1a1a1a"); p.R(208, 48, 8, 4, "#e9c43a"); p.R(220, 48, 10, 4, "#e9c43a"); p.R(214, 70, 2, 6, "#c8ccd0"); p.R(222, 70, 2, 6, "#c8ccd0"); } }
    ],
    front(p, g, t, o){ T.glow(g, 70, 30, 60, "120,200,160", .1); T.dim(g, this, .12); tone(g, this, o, .3); },
    solid:[[8,4,124,50],[142,50,34,22],[38,70,104,28],[194,22,50,78]],
    exits:[ { r:[24,136,32,8], to:"shall", at:[160,76], label:"走廊", kind:"out", art:[22,132,36,12] } ]
  };

  /* ---------- 最後一個房間：綠色的壁紙、書櫃、大鐘、書桌，正中間吊著一個擺錘 ---------- */
  const sfinal = { name:"最後一個房間", w:256, h:168, wall:64,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 64, "#2a4a3a", "damask", { base:"#1a140e" });
      // 書櫃（七本假書，書背各有一個金色的數字）
      T.shelf(p, 14, 6, 74, 54, 3, "#3a2414"); for (let k = 0; k < 7; k++){ p.R(18 + k * 9, 9, 7, 14, O); p.R(19 + k * 9, 10, 5, 12, ["#5a1a1a", "#1a3a5a", "#3a1a4a", "#1a4a2a", "#5a3a1a", "#2a2a5a", "#4a1a2a"][k]); p.R(20 + k * 9, 14, 3, 3, "#e9c43a"); }
      // 大掛鐘（指針停在 12:00）
      p.R(180, 6, 40, 54, O); p.R(181, 7, 38, 52, "#5a3a1e"); p.R(186, 10, 28, 28, O); p.R(187, 11, 26, 26, "#f4ecd8"); p.R(199, 13, 2, 12, O); p.R(199, 23, 2, 2, "#c8302a"); for (let k = 0; k < 12; k++) p.R(199 + Math.round(Math.sin(k * Math.PI / 6) * 11), 23 - Math.round(Math.cos(k * Math.PI / 6) * 11), 2, 1, "#5a3a1e");
      p.R(196, 42, 8, 14, "#3a2414"); p.R(199, 44, 2, 8, "#c8a050");
      // 地：深色木地板＋黃色的圓圈（直徑三公尺）＋從書桌拖到擺錘底下的兩道刮痕
      T.wood(p, 0, 64, 256, 104, "#4a2e1a");
      for (let a = 0; a < 64; a++){ const x = 136 + Math.round(Math.cos(a / 64 * Math.PI * 2) * 52), y = 116 + Math.round(Math.sin(a / 64 * Math.PI * 2) * 26); p.R(x, y, 3, 2, "#e9c43a"); }
      p.R(66, 120, 46, 1, "rgba(220,200,170,.35)"); p.R(66, 124, 46, 1, "rgba(220,200,170,.35)"); p.R(62, 122, 2, 2, "rgba(90,20,20,.7)");
      T.sides(p, this, "#1a140e", [["B", 200, 32]]);
    },
    props:[
      // 書桌（左前）：底下貼著一張紙條
      { y:132, draw(p){ T.box(p, 18, 104, 50, 14, 12, "#5a3418", "#3a200c", { legs:4 }); p.R(26, 106, 12, 8, O); p.R(27, 107, 10, 6, "#f4ecd8"); p.R(48, 106, 10, 6, O); p.R(49, 107, 8, 4, "#3a6a3a"); } },
      { y:104, draw(p){ T.chair(p, 42, 104, "#3a2414", "down"); } },
      // 手機（書桌腳邊，螢幕裂了一角）
      { y:140, draw(p){ p.R(66, 134, 6, 9, O); p.R(67, 135, 4, 7, "#2a3a5a"); p.R(69, 135, 2, 2, "#f4f4f8"); } },
      // 工具箱＋平板（圓圈外面）
      { y:150, draw(p){ T.box(p, 200, 136, 30, 8, 8, "#c8302a", "#8a1a1a"); p.R(204, 138, 22, 4, "#2a2a2a"); p.R(184, 140, 14, 10, O); p.R(185, 141, 12, 8, "#1e2226"); p.R(186, 142, 10, 6, "#e8ecf0"); p.R(187, 143, 6, 1, "#3a8a4a"); p.R(187, 146, 6, 1, "#c8302a"); } },
      // 那一晚：江承恩趴在擺錘的正下方
      { y:124, draw(p, g, t, o){ if (ph(o) !== 0) return; p.R(94, 118, 12, 6, "rgba(110,20,20,.6)"); SP.draw(g, 130, 124, { skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#3a3a40", bottom:"#2a2a30", apron:"#5a4a3a", hat:null }, { view:"side", facing:1, act:"lie", f:0 }); } },
      // 擺錘：從天花板吊下來的鐵臂＋黑色的錘頭（地上有影子）
      { y:112, draw(p, g, t){ p.R(124, 108, 26, 6, "rgba(0,0,0,.25)"); p.R(135, 0, 4, 84, O); p.R(136, 0, 2, 84, "#8a8e94"); p.R(124, 0, 26, 4, O); p.R(125, 1, 24, 2, "#5a5e64");
          p.R(132, 80, 10, 4, "#1a1a1a"); p.R(126, 84, 22, 16, O); p.R(127, 85, 20, 14, "#2a2a2e"); p.R(127, 85, 20, 2, "#4a4a4e"); p.R(134, 81, 6, 3, "#1a1a1a"); } },
      // 那一晚：證物號碼牌
      { y:160, draw(p, g, t, o){ if (ph(o) !== 0) return; T.marker(p, 70, 148, 1); T.marker(p, 90, 130, 2); T.marker(p, 196, 156, 3); } }
    ],
    front(p, g, t, o){ T.glow(g, 136, 60, 80, "255,236,180", .14); T.dim(g, this, .1); tone(g, this, o, .3); },
    solid:[[12,4,78,58],[178,4,44,58],[16,102,54,30],[198,134,34,14],[124,82,26,20]],
    exits:[ { r:[200,160,32,8], to:"shall", at:[288,76], label:"走廊", kind:"out", art:[198,156,36,12] } ]
  };

  /* ---------- 道具倉：鐵架、一箱一箱的假金條 ---------- */
  const sprop = { name:"道具倉", w:256, h:140, wall:56,
    floor(p, g, t, o){
      concrete(p, 0, 0, 256, 56, "#7a7a74", 33); p.R(0, 51, 256, 5, "#3a3a38"); p.R(0, 56, 256, 1, O);
      concrete(p, 0, 56, 256, 84, "#6a6a66", 9);
      T.sides(p, this, "#3a3a38", [["L", 84, 40]]); T.sideDoor(p, this, "L", 84, 40, dA("sprop", "shall"), "#5a5e64");
    },
    props:[
      // 兩排鐵架（塑膠劍、假骷髏、生鏽的鑰匙、假金條；最上層一個鞋盒）
      { y:58, draw(p){ for (const x0 of [60, 150]){ p.R(x0, 4, 80, 50, O); p.R(x0 + 1, 5, 78, 48, "#5a5e64"); for (let r = 0; r < 3; r++) p.R(x0 + 1, 18 + r * 14, 78, 2, "#8a8e94");
            p.R(x0 + 4, 8, 14, 9, x0 === 60 ? "#c8b898" : "#e9c43a"); p.R(x0 + 22, 10, 8, 7, "#f4f4ee"); p.R(x0 + 24, 12, 2, 2, O); p.R(x0 + 27, 12, 2, 2, O);
            for (let k = 0; k < 5; k++){ p.R(x0 + 4 + k * 14, 22, 10, 9, ["#8a6a4a", "#e9c43a", "#a8acb0", "#5a3a2a", "#c8302a"][k]); p.R(x0 + 4 + k * 14, 36, 10, 9, ["#e9c43a", "#3a5a3a", "#e9c43a", "#8a8e94", "#6a4a8a"][k]); } } } },
      // 備用的擺錘錘頭兩個、一卷黑色膠帶（架子底下）
      { y:72, draw(p){ for (const x of [66, 84]){ p.R(x, 60, 14, 10, O); p.R(x + 1, 61, 12, 8, "#2a2a2e"); p.R(x + 1, 61, 12, 1, "#4a4a4e"); } p.R(102, 62, 8, 8, O); p.R(103, 63, 6, 6, "#1a1a1a"); p.R(105, 65, 2, 2, "#6a6a66"); } },
      // 柱子（貼著一張便條）
      { y:110, draw(p){ T.box(p, 196, 72, 16, 12, 26, "#9a9a96", "#7a7a76"); p.R(199, 88, 10, 8, "#f4e88a"); p.R(200, 90, 8, 1, "#3a3a3a"); p.R(200, 92, 6, 1, "#3a3a3a"); } },
      // 工作台（標籤機、熱熔膠槍）
      { y:130, draw(p){ T.box(p, 40, 108, 70, 12, 10, "#8a6a4a", "#6a4a2a"); p.R(50, 106, 14, 8, O); p.R(51, 107, 12, 6, "#e9c43a"); p.R(53, 108, 6, 2, "#2a2a2a"); p.R(80, 108, 12, 6, O); p.R(81, 109, 10, 4, "#3a6ad8"); } }
    ],
    front(p, g, t, o){ fluo(p, 100, 2, 50); tone(g, this, o, .3); },
    solid:[[58,2,84,52],[148,2,84,52],[194,70,20,40],[38,106,74,24],[64,58,48,14]],
    exits:[ { r:[0,84,8,40], to:"shall", at:[310,104], label:"走廊", kind:"door", art:[0,82,8,44] } ]
  };

  /* ---------- 江承恩的辦公室 ---------- */
  const soffice = { name:"辦公室", w:224, h:140, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 224, 58, "#d8d4cc", "plain", { base:"#4a4a4a" });
      // 2019 年開幕的照片
      p.R(96, 12, 30, 22, O); p.R(97, 13, 28, 20, "#2a2a2a"); p.R(99, 15, 24, 16, "#a8b8c8"); p.R(104, 20, 5, 10, "#3a3a3a"); p.R(113, 20, 5, 10, "#3a3a3a"); p.R(104, 18, 5, 2, "#e8c09a"); p.R(113, 18, 5, 2, "#e8c09a");
      // 窗（窗台上一個菸灰缸）
      window2(p, 150, 8, 56, 30, o, t, (x, y, w, h) => cityView(p, o), "#5a5a5a"); p.R(150, 38, 56, 4, "#a8a8a0"); p.R(176, 35, 10, 4, O); p.R(177, 36, 8, 2, "#5a5a5a"); p.R(178, 35, 2, 1, "#f4f4f0"); p.R(182, 35, 3, 1, "#8a5a3a");
      // 牆上的設計圖
      p.R(14, 10, 60, 40, O); p.R(15, 11, 58, 38, "#e8ecf4"); for (let k = 0; k < 6; k++) p.R(18 + k * 9, 16 + (k % 3) * 8, 7, 14, "#4a6a9a");
      laminate(p, 0, 58, 224, 82, "#7a6a5a");
      T.sides(p, this, "#4a4a4a", [["B", 96, 32]]);
    },
    props:[
      // 桌子（收購意向書）
      { y:100, draw(p){ T.box(p, 60, 74, 90, 14, 10, "#3a2a1e", "#2a1e14"); p.R(90, 76, 22, 10, O); p.R(91, 77, 20, 8, "#f8f4ec"); p.R(93, 79, 14, 1, "#2a3a6a"); p.R(93, 82, 10, 1, "#7a7a8a"); p.R(120, 76, 14, 8, O); p.R(121, 77, 12, 6, "#1e2226"); } },
      { y:72, draw(p){ T.chair(p, 104, 72, "#1a1a1e", "down"); } },
      { y:104, draw(p){ for (const x of [80, 128]) T.chair(p, x, 104, "#5a5e64", "up"); } },
      // 垃圾桶（摔破的馬克杯）
      { y:124, draw(p){ p.R(176, 108, 16, 16, O); p.R(177, 109, 14, 14, "#5a5e64"); p.R(179, 110, 4, 3, "#f4f4f0"); p.R(184, 111, 4, 2, "#c86ae8"); } },
      // 檔案櫃
      { y:84, draw(p){ T.box(p, 10, 52, 30, 10, 22, "#8a8e94", "#6a6e74"); } }
    ],
    front(p, g, t, o){ fluo(p, 90, 2, 50); tone(g, this, o, .3); },
    solid:[[58,72,94,28],[174,106,20,20],[8,50,34,36]],
    exits:[ { r:[96,132,32,8], to:"shall", at:[32,76], label:"走廊", kind:"out", art:[94,128,36,12] } ]
  };

  const spots = {
    // 大廳
    o8_linbag:[164,64,10,12,184,72,"sfront",A("look",{ face:-1 })],
    doc_gate:[190,72,22,14,204,114,"sfront",A("read",{ actT:1.6 })],
    o8_wall:[8,10,86,46,52,72,"sfront",A("look")],
    o8_board:[196,10,50,40,226,72,"sfront",A("read")],
    // 走廊
    doc_doorlog:[302,32,10,14,300,80,"shall",A("read",{ actT:1.6 })],
    o8_rules:[244,14,22,32,256,76,"shall",A("read")],
    o8_locker:[114,18,30,42,128,76,"shall",A("look")],
    // 古宅
    o8_glasses:[44,72,16,8,78,96,"sguzhai",A("pickup",{ face:-1 })],
    o8_ebtn:[150,136,10,10,166,132,"sguzhai",A("look",{ face:-1 })],
    // 控制室
    cctv_hall:[14,10,36,18,32,62,"sctrl",A("type",{ actT:2 })],
    cctv_lobby:[52,10,36,18,62,62,"sctrl",A("type",{ actT:2 })],
    cctv_guzhai:[90,10,36,18,100,62,"sctrl",A("type",{ actT:2 })],
    cctv_ctrl:[14,30,74,18,120,62,"sctrl",A("type",{ actT:2 })],
    doc_syslog:[48,62,22,12,56,106,"sctrl",A("read",{ actT:1.6 })],
    doc_hintlog:[74,62,22,12,84,108,"sctrl",A("read",{ actT:1.6 })],
    ev_headset:[104,74,14,8,112,108,"sctrl",A("look",{ face:-1 })],
    ev_lever:[196,24,46,72,186,108,"sctrl",A("look",{ face:1 })],
    ev_passage:[198,70,42,24,220,112,"sctrl",A("crouch",{ actT:1.6 })],
    ev_ctrlpc:[74,62,22,12,140,104,"sctrl",A("type",{ actT:2, face:-1 })],
    ev_geshoes:[84,104,18,8,80,116,"sctrl",A("crouch",{ face:1 })],
    o8_monitors:[90,28,40,20,132,62,"sctrl",A("look",{ face:-1 })],
    o8_sink:[146,52,26,10,180,78,"sctrl",A("look",{ face:-1 })],
    // 最後一個房間
    ev_body:[112,110,46,16,120,140,"sfinal",A("crouch",{ actT:1.6 })],
    ev_pendulum:[124,80,26,22,158,104,"sfinal",A("look",{ actT:1.6, face:-1 })],
    ev_floor:[60,118,56,8,88,140,"sfinal",A("crouch",{ actT:1.6 })],
    ev_toolbox:[184,136,46,14,214,128,"sfinal",A("crouch")],
    ev_phone:[64,132,10,12,82,150,"sfinal",A("pickup",{ face:-1 })],
    o8_clock:[180,6,40,54,200,72,"sfinal",A("look")],
    o8_books:[14,6,74,54,52,72,"sfinal",A("look")],
    o8_line:[84,88,104,56,176,94,"sfinal",A("look",{ face:-1 })],
    // 道具倉
    ev_gun:[64,6,16,12,120,64,"sprop",A("pickup",{ actT:1.6 })],
    o8_fakes:[150,4,80,50,190,64,"sprop",A("look")],
    o8_spare:[64,58,48,14,88,80,"sprop",A("crouch")],
    o8_iou:[196,86,14,12,224,108,"sprop",A("read",{ face:-1 })],
    // 辦公室
    ev_contract:[90,76,22,10,100,108,"soffice",A("read",{ actT:1.6 })],
    o8_photo:[96,12,30,22,112,64,"soffice",A("look")],
    o8_bin:[176,108,16,16,166,130,"soffice",A("crouch",{ face:1 })]
  };
  const details = {
    d8_bell:[130,82,12,10,136,116,"sfront",A("look")],
    d8_card:[150,84,14,8,156,116,"sfront",A("look")],
    d8_cam:[156,0,24,10,168,92,"shall",A("look")],
    d8_portrait:[108,6,40,50,128,92,"sguzhai",A("look")],
    d8_cup:[126,74,8,8,144,104,"sctrl",A("look",{ face:-1 })],
    d8_sticker:[18,118,50,14,44,142,"sfinal",A("crouch")],
    d8_label:[50,106,14,8,58,136,"sprop",A("look")],
    d8_ashtray:[174,34,14,8,178,64,"soffice",A("look")]
  };
  const place = {
    ge:[ { room:"sctrl", x:96, y:104, act:"sit", facing:-1, view:"side" }, { room:"sctrl", x:96, y:104, act:"sit", facing:-1, view:"side" }, { room:"sprop", x:160, y:96, act:"kneel", facing:-1 } ],
    lin:[ { room:"sfront", x:200, y:120, act:"cry", facing:-1 }, { room:"sfront", x:180, y:74, act:"phone", facing:1 }, { room:"sfront", x:180, y:74, act:"write", facing:1 } ],
    zhuo:[ null, { room:"sprop", x:150, y:116, act:"cross", facing:-1 }, { room:"shall", x:60, y:100, act:"smoke", facing:1 } ],
    xu:[ { room:"sfinal", x:96, y:146, act:"kneel", facing:1 } ],
    qian:[ { room:"sfinal", x:162, y:136, act:"kneel", facing:-1 } ],
    wu:[ { room:"sctrl", x:40, y:112, act:"idle", facing:1 } ]
  };
  const EX = { for8:{ room:"sfinal", x:226, y:96, act:"cam", facing:-1 }, cop8:{ room:"shall", x:300, y:104, act:"idle", facing:-1 } };
  const extras = (W0.extras || []).map(e => EX[e.id] ? { ...e, ...EX[e.id] } : e);
  const intro = [ { set:{ room:"sfront", px:144, py:150 }, hide:true }, { wait:0.3, hide:true }, { set:{ room:"sfront", px:144, py:132 } },
    ...(W0.intro || []).filter(k => k.say || (k.wait && !k.hide)).map(k => k.say && k.say[0] === "wu" && /點畫面上的箭嘴|📍|清單不是全部/.test(k.say[1]) ? null : k).filter(Boolean),
    { say:["wu", "想去哪裡，點畫面上的門口就會自己走過去。閃著星星的就是還沒看過的東西，按上面的「🧭 平面圖」看全部在哪裡。"], name:"小吳" } ];
  setLoc("studio", { start:"sfront", spawn:[144,132], rooms:{ sfront, shall, sguzhai, sctrl, sfinal, sprop, soffice }, spots, details, place, extras, intro,
    plan:[ { name:"謎境", w:100, h:44, rooms:{ soffice:[0,0,18,16], sguzhai:[18,0,20,16], sctrl:[38,0,18,16], sfinal:[64,0,22,16], shall:[0,16,86,10], sfront:[0,26,30,18], sprop:[86,14,14,14] } } ] });
})();

/* ================= 刑大（共用）、鑑識中心（共用）、江家、密室聯盟、葛志偉的工作室 ================= */
C8T && (() => {
  const { EP, T, O, sh, dA, ph, night, A, tone, window2, cityView, fluo, marble, vinyl, laminate, carpetTiles, concrete, setLoc } = C8T;

  /* ---------- 刑大：白板上只剩角落一個小小的電梯圖案；兩位同事坐在中間那組桌子 ---------- */
  const pdesk = CG_DESK(C8T, { meetOk:false,
    board(p){ p.R(182, 30, 8, 12, O); p.R(183, 31, 6, 10, "#c8ccd2"); p.R(185, 33, 2, 1, O); p.R(185, 37, 2, 1, O); },
    clutter(p){ p.R(128, 88, 16, 8, O); p.R(129, 89, 14, 6, "#f4f0e6"); p.R(130, 90, 10, 1, "#2a3a6a"); },
    props:[ { y:104, draw(p){ T.chair(p, 102, 104, "#2a3a2a", "right"); T.chair(p, 246, 104, "#2a3a2a", "left"); } } ] });
  const W0 = EP.world.police || {};
  setLoc("police", { start:"pdesk", spawn:[170,154], rooms:{ pdesk },
    spots:{ o8_memo:[50,78,16,8,56,106,"pdesk",A("read")] },
    details:{ d8_board:[178,26,16,18,170,70,"pdesk",A("look")] },
    place:{
      guan:[null, { room:"pdesk", x:102, y:104, act:"sit", facing:1, view:"side" }],
      yu:[null, { room:"pdesk", x:246, y:104, act:"sit", facing:-1, view:"side" }],
      ye:[null, { room:"pdesk", x:178, y:146, act:"read", facing:-1 }]
    },
    extras:W0.extras || [],
    plan:[ { name:"澄港市刑大", w:100, h:30, rooms:{ pdesk:[0,0,100,30] } } ] });

  /* ---------- 鑑識中心：小吳旁邊多了一張很整齊的桌子；兩張桌子中間一條膠帶「國界」 ---------- */
  const LW = EP.world.lab || {};
  setLoc("lab", { start:"lab", spawn:[144,140],
    rooms:{ lab:CG_LAB(C8T, { props:[
      { y:101, draw(p){ T.box(p, 130, 70, 44, 14, 10, "#e8ecf0", "#b8bcc0");
          p.R(136, 72, 10, 8, O); p.R(137, 73, 8, 6, "#3a3a3a");                                                      // 倒扣的相框
          p.R(156, 72, 8, 8, O); p.R(157, 73, 6, 6, "#f4f4f0"); p.R(158, 75, 4, 2, "#2a5a8a");                        // 舊馬克杯
          p.R(176, 70, 2, 28, "#e9c43a"); p.R(176, 70, 2, 1, O);                                                       // 「國界」膠帶
          for (const [x, y, c] of [[190, 72, "#e84a3a"], [200, 74, "#e9c43a"], [244, 72, "#3aa86a"], [252, 74, "#e86a2a"]]){ p.R(x, y, 7, 5, O); p.R(x + 1, y + 1, 5, 3, c); } } },   // 小吳桌上的零食
      { y:104, draw(p){ T.chair(p, 152, 104, "#2a2a30", "up"); } }
    ], solid:[[128,68,48,28]] }) },
    spots:{ o8_cake:[134,70,32,12,150,108,"lab",A("look")] },
    details:{ d8_xu:[174,70,6,28,178,108,"lab",A("look")] },
    place:{ xu:[null, { room:"lab", x:150, y:116, act:"read", facing:1 }], qian:[null, { room:"lab", x:70, y:118, act:"idle", facing:1 }], wu:[null, { room:"lab", x:210, y:104, act:"sit", facing:1, view:"side" }] },
    extras:LW.extras || [],
    plan:[ { name:"鑑識中心", w:100, h:20, rooms:{ lab:[0,0,100,20] } } ] });

  /* ---------- 江家客廳：新大樓、很安靜；婚紗照的玻璃裂了 ---------- */
  const jroom = { name:"江家客廳", w:272, h:148, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 272, 60, "#ece6dc", "stripe", { base:"#8a7a6a" });
      // 婚紗照（玻璃一條裂痕、膠帶）
      p.R(100, 8, 44, 32, O); p.R(101, 9, 42, 30, "#f4f0e8"); p.R(104, 12, 36, 24, "#d8c8b8"); p.R(114, 16, 6, 18, "#2a2a2a"); p.R(124, 16, 8, 18, "#f8f8f4"); p.R(115, 14, 4, 3, "#e8c09a"); p.R(126, 14, 4, 3, "#e8c09a");
      for (let k = 0; k < 10; k++) p.R(106 + k * 3, 12 + k * 2, 2, 1, "#f8f8ff"); p.R(110, 18, 10, 3, "rgba(240,240,220,.6)");
      // 月曆
      p.R(160, 10, 22, 28, O); p.R(161, 11, 20, 26, "#f4f4ee"); p.R(161, 11, 20, 5, "#3a6ab8"); for (let k = 0; k < 20; k++) p.R(163 + (k % 5) * 4, 18 + Math.floor(k / 5) * 4, 2, 2, "#8a8a8a"); p.R(169, 22, 4, 4, "#c8302a"); p.R(173, 26, 4, 4, "#c8302a");
      // 落地窗
      window2(p, 200, 6, 62, 42, o, t, (x, y, w, h) => cityView(p, o), "#8a8a8a");
      T.herring(p, 0, 60, 272, 88, "#c8a878");
      T.rug(p, 70, 90, 110, 40, "#d8d0c0", "#b8a890", "#a89880");
      T.sides(p, this, "#8a7a6a", [["B", 20, 32]]);
    },
    props:[
      // 側面的沙發（椅背在左）
      { y:130, draw(p){ const L = "#7a8a9a"; p.R(44, 84, 10, 46, O); p.R(45, 85, 8, 44, sh(L, -.15)); p.R(52, 94, 22, 30, O); p.R(53, 95, 20, 28, L); p.R(53, 108, 20, 1, sh(L, -.2)); p.R(44, 82, 32, 12, O); p.R(45, 83, 30, 10, sh(L, .1)); p.R(44, 122, 32, 10, O); p.R(45, 123, 30, 8, sh(L, .1)); } },
      // 茶几（透明資料夾）
      { y:122, draw(p){ T.box(p, 92, 102, 60, 14, 6, "#f4f4f0", "#c8c8c4"); p.R(104, 104, 20, 10, O); p.R(105, 105, 18, 8, "#d8e8f4"); p.R(107, 107, 14, 1, "#2a3a6a"); p.R(107, 110, 10, 1, "#7a7a8a"); } },
      // 餐桌（一疊催繳單）＋兩張椅子
      { y:96, draw(p){ T.box(p, 196, 70, 56, 16, 8, "#8a6a4a", "#6a4a2a", { legs:3 }); p.R(206, 72, 16, 10, O); p.R(207, 73, 14, 8, "#f4f0e6"); p.R(209, 74, 10, 2, "#c8302a"); p.R(209, 78, 8, 1, "#7a7a8a"); } },
      { y:112, draw(p){ for (const x of [210, 238]) T.chair(p, x, 112, "#8a6a4a", "up"); } },
      // 矮櫃（保單）
      { y:76, draw(p){ T.box(p, 20, 52, 50, 10, 14, "#a8987a", "#8a7a5a"); p.R(30, 54, 18, 8, O); p.R(31, 55, 16, 6, "#f4f4ee"); p.R(33, 56, 12, 1, "#2a5a8a"); } },
      { y:144, draw(p){ T.plant(p, 252, 144, true); } }
    ],
    front(p, g, t, o){ T.glow(g, 136, 60, 70, "255,240,210", .06); tone(g, this, o, .3); },
    solid:[[42,80,36,54],[90,100,64,22],[194,68,60,28],[18,50,54,28],[242,128,20,18]],
    exits:[]
  };
  setLoc("jianghome", { start:"jroom", spawn:[36,140], rooms:{ jroom },
    spots:{
      o8_email:[104,104,20,10,128,132,"jroom",A("read",{ actT:1.6 })],
      o8_calendar:[160,10,22,28,170,72,"jroom",A("read")],
      o8_insurance:[30,54,18,8,80,72,"jroom",A("read",{ actT:1.6, face:-1 })],
      o8_bills:[206,72,16,10,220,104,"jroom",A("read")]
    },
    details:{ d8_wedding:[100,8,44,32,122,72,"jroom",A("look")] },
    place:{ song:[null, { room:"jroom", x:62, y:116, act:"sit", facing:1, view:"side" }, { room:"jroom", x:170, y:122, act:"read", facing:-1 }] },
    plan:[ { name:"江家", w:100, h:30, rooms:{ jroom:[0,0,100,30] } } ] });

  /* ---------- 密室聯盟・執行長室：黑色、金色、玻璃 ---------- */
  const alroom = { name:"密室聯盟・執行長室", w:288, h:152, wall:62,
    floor(p, g, t, o){
      p.R(0, 0, 288, 62, "#1e1e22"); p.R(0, 0, 288, 3, "#2a2a30"); p.R(0, 57, 288, 5, "#0e0e10"); p.R(0, 62, 288, 1, O); for (let x = 0; x < 288; x += 36) p.R(x, 3, 1, 54, "#2a2a30");
      // 新店規劃圖「THE LAST ROOM」
      p.R(14, 8, 80, 46, O); p.R(15, 9, 78, 44, "#f4f4ee"); p.R(18, 12, 72, 6, "#c8a050"); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) p.R(20 + c * 17, 22 + r * 9, 15, 7, r === 0 && c === 3 ? "#1a3a2a" : "#d8dce4"); p.R(70, 48, 18, 3, "#c8c8c0");
      // 「密室聯盟」金色字
      p.R(116, 14, 64, 16, O); p.R(117, 15, 62, 14, "#1a1a1e"); for (let k = 0; k < 4; k++) p.R(121 + k * 14, 17, 10, 10, "#c8a050");
      // 落地窗
      window2(p, 196, 6, 84, 48, o, t, (x, y, w, h) => cityView(p, o), "#0e0e10");
      marble(p, 0, 62, 288, 90, "#3a3a40", 26);
      T.sides(p, this, "#0e0e10", [["B", 130, 36]]);
    },
    props:[
      // 大辦公桌（電腦、一疊履歷）
      { y:104, draw(p){ T.box(p, 100, 78, 96, 16, 10, "#1a1a1e", "#0e0e10"); p.R(100, 78, 96, 1, "#c8a050");
          p.R(110, 66, 24, 14, O); p.R(111, 67, 22, 11, "#1e2226"); p.R(112, 68, 20, 9, "#2a3a4a"); p.R(114, 70, 8, 5, "#5a6a7a"); p.R(126, 70, 4, 5, "#5a6a7a");
          p.R(150, 80, 16, 12, O); p.R(151, 81, 14, 10, "#f4f4f0"); p.R(152, 82, 4, 5, "#c8a890"); p.R(153, 82, 2, 1, "#2a2220"); p.R(158, 83, 6, 1, "#7a7a8a"); } },
      { y:76, draw(p){ T.chair(p, 148, 76, "#2a2a30", "down"); } },
      // 會客沙發
      { y:136, draw(p){ T.box(p, 20, 112, 60, 14, 10, "#5a2a1a", "#3a1a0e"); p.R(20, 106, 60, 8, O); p.R(21, 107, 58, 6, "#6a3a24"); } },
      // 盆栽、獎盃（底座上的灰）
      { y:146, draw(p){ T.plant(p, 262, 146, true); p.R(240, 132, 10, 14, O); p.R(241, 133, 8, 8, "#e9c43a"); p.R(242, 141, 6, 4, "#8a8a80"); p.R(242, 141, 6, 1, "#b8b8a8"); } }
    ],
    front(p, g, t, o){ T.glow(g, 148, 70, 60, "255,220,150", .08); tone(g, this, o, .25); },
    solid:[[98,76,100,30],[18,104,64,24],[236,128,36,20]],
    exits:[]
  };
  setLoc("alliance", { start:"alroom", spawn:[148,144], rooms:{ alroom },
    spots:{
      doc_meeting:[110,66,24,14,120,112,"alroom",A("type",{ actT:2 })],
      o8_plan:[14,8,80,46,54,74,"alroom",A("look")]
    },
    details:{ d8_cv:[150,80,16,12,166,112,"alroom",A("read")], d8_award:[240,130,10,16,226,140,"alroom",A("look",{ face:1 })] },
    place:{ bai:[null, { room:"alroom", x:210, y:96, act:"phone", facing:-1 }, { room:"alroom", x:56, y:80, act:"cross", facing:-1 }] },
    plan:[ { name:"密室聯盟", w:100, h:30, rooms:{ alroom:[0,0,100,30] } } ] });

  /* ---------- 葛志偉的工作室：牆上釘滿設計圖、工作台、洗衣機 ---------- */
  const ghome = { name:"葛志偉的工作室", w:256, h:148, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 60, "#c8c4b8", "brick", { base:"#4a4a44" });
      // 牆上釘滿的設計圖（書櫃、大鐘、擺錘）
      for (let k = 0; k < 7; k++){ const x = 10 + k * 26, y = 8 + (k % 2) * 6; p.R(x, y, 22, 26, O); p.R(x + 1, y + 1, 20, 24, "#e8ecf4"); p.R(x + 3, y + 4, 16, 1, "#2a4a8a"); p.R(x + 5 + (k % 3) * 3, y + 8, 8, 12, "rgba(40,70,140,.5)"); if (k === 3){ p.R(x + 10, y + 6, 1, 12, "#2a4a8a"); p.R(x + 7, y + 17, 7, 5, "#2a4a8a"); } p.R(x + 10, y - 1, 2, 2, "#c8302a"); }
      concrete(p, 0, 60, 256, 88, "#8a8680", 15);
      T.sides(p, this, "#4a4a44", [["B", 112, 32]]);
    },
    props:[
      // 工作台（攤開的筆記本、小模型、工具）
      { y:100, draw(p){ T.box(p, 20, 74, 90, 16, 10, "#a8845a", "#7a5a3a"); p.R(30, 76, 26, 12, O); p.R(31, 77, 12, 10, "#f4f0e0"); p.R(44, 77, 11, 10, "#f4f0e0"); p.R(33, 79, 8, 6, "rgba(40,70,140,.5)"); p.R(70, 74, 12, 12, O); p.R(71, 75, 10, 10, "#5a3a1e"); p.R(75, 76, 2, 8, "#8a8e94"); p.R(90, 78, 14, 3, "#8a8e94"); } },
      { y:104, draw(p){ T.chair(p, 60, 104, "#3a3a3a", "up"); } },
      // 書桌（一封沒寄的信、咖啡杯印）
      { y:110, draw(p){ T.box(p, 140, 86, 52, 14, 8, "#5a4a3a", "#3a2a1e"); p.R(150, 88, 18, 10, O); p.R(151, 89, 16, 8, "#f8f4ec"); p.R(153, 91, 12, 1, "#3a3a3a"); p.R(160, 94, 6, 3, "rgba(120,70,30,.5)"); } },
      // 洗衣機、冰箱（右邊靠牆）
      { y:84, draw(p){ T.box(p, 204, 52, 22, 10, 22, "#e8ecf0", "#c8ccd0"); p.R(209, 64, 12, 12, O); p.R(210, 65, 10, 10, "#9ab0c8"); p.R(212, 67, 6, 6, "#2a4a8a"); T.box(p, 230, 30, 20, 10, 44, "#d8dcd8", "#b8bcb8"); p.R(247, 48, 1, 10, "#8a8e94"); } },
      // 床墊直接放在地上
      { y:140, draw(p){ p.R(14, 112, 60, 28, O); p.R(15, 113, 58, 26, "#8a9aa8"); p.R(15, 113, 14, 26, "#f4f4f0"); } }
    ],
    front(p, g, t, o){ T.glow(g, 64, 70, 40, "255,240,200", .14); tone(g, this, o, .35); },
    solid:[[18,72,94,30],[138,84,56,26],[202,28,50,58],[12,110,64,32]],
    exits:[]
  };
  setLoc("gehome", { start:"ghome", spawn:[128,140], rooms:{ ghome },
    spots:{
      ev_notebook:[30,76,26,12,44,106,"ghome",A("read",{ actT:1.6 })],
      ev_shirt:[204,52,22,32,202,96,"ghome",A("crouch",{ actT:1.6, face:1 })],
      o8_resign:[150,88,18,10,160,116,"ghome",A("read")]
    },
    details:{ d8_cake:[230,30,20,54,222,96,"ghome",A("look",{ face:1 })] },
    plan:[ { name:"葛志偉的工作室", w:100, h:30, rooms:{ ghome:[0,0,100,30] } } ] });
})();
