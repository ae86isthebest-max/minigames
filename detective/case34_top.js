/* =========================================================
   第 34 集・俯視版（topdown.js）
   澄港市警察局：3F 督察組會議室（新）、1F 值班台（＝第 14 集）、1F 收發室（新）、1F 食堂（新）、
   B1 證物室前台和 C 區（＝第 33 集）；舊碼頭的路口、阿珠冰店、舊碼頭（＝第 28、30 集）。白天。
   ========================================================= */
const C34T = typeof TOPEP === "function" ? TOPEP("three") : null;

/* ================= 澄港市警察局 ================= */
C34T && (() => {
  const { EP, T, O, sh, ph, dA, has, A, tone, fluo, vinyl, window2, setLoc } = C34T;
  const W0 = EP.world.police || {};
  const P = (typeof window !== "undefined" && window.PD14) || null;
  const P3 = (typeof window !== "undefined" && window.PD33) || null;
  const b1wall = P ? P.b1wall : (p, x, w, H) => p.R(x, 0, w, H, "#c4c8bc");
  const b1floor = P ? P.b1floor : (p, x, y, w, h) => p.R(x, y, w, h, "#8e908a");
  const cardDoor = P ? P.cardDoor : (p, x, y, w, h, amt) => T.backDoor(p, x, y, w, h, amt, "#7a8288", { frame:"#4a5056" });
  const hasUsb = () => { try { return !!(has && has("e34_he")); } catch (e){ return false; } };
  const tape = (p, x, y, w, h) => { p.R(x, y, w, 2, "#e9c43a"); p.R(x, y + h - 2, w, 2, "#e9c43a"); p.R(x, y, 2, h, "#e9c43a"); p.R(x + w - 2, y, 2, h, "#e9c43a"); };

  /* ---------- 1F 值班台：第 14 集同一間；公布欄多了「退休人員服務」的公告；後牆多了往收發室的門，左邊的側門往食堂 ---------- */
  const L0 = P && P.lobby;
  const lobby = { name:"1F 值班台", w:300, h:150, wall:60,
    floor(p, g, t, o){ if (L0) L0.floor.call(this, p, g, t, o); else p.R(0, 0, 300, 150, "#d4ccb8");
      p.R(38, 15, 13, 16, "#f4f4f0"); p.R(39, 16, 11, 3, "#3a6ad8"); for (let k = 0; k < 4; k++) p.R(40, 21 + k * 2, 9, 1, "#5a5a6a");
      // 往收發室的門
      T.backDoor(p, 120, 18, 24, 42, dA("lobby", "mail"), "#8a6a4a", { frame:"#5a4a3a" }); p.R(122, 10, 20, 6, O); p.R(123, 11, 18, 4, "#e8e2d2"); p.R(126, 12, 12, 2, "#3a3a3a");
      // 左邊往食堂的側門
      T.sideDoor(p, this, "L", 88, 24, dA("lobby", "canteen"), "#8a6a4a"); },
    props:L0 ? L0.props : [],
    front(p, g, t, o){ if (L0) L0.front.call(this, p, g, t, o); },
    solid:[[58,74,116,34],[14,114,66,18],[10,52,18,36],[230,100,6,42],[108,128,16,20],[176,128,16,20]],
    exits:[ { r:[196,60,30,8], to:"meet", at:[150,136], label:"3F 督察組（電梯）", kind:"up", art:[194,16,34,44] },
            { r:[120,60,24,8], to:"mail", at:[128,128], label:"1F 收發室", kind:"door", art:[120,18,24,42] },
            { r:[0,88,8,24], to:"canteen", at:[276,110], label:"1F 食堂", kind:"door", art:[0,86,8,28] },
            { r:[238,142,54,8], to:"evoffice", at:[144,132], label:"B1 證物室（下樓）", kind:"down", art:[236,98,58,44] } ]
  };

  /* ---------- 3F 督察組會議室：門包著隔音棉、比樓下快兩分鐘的鐘、拉下來的百葉窗（對著停車場）、黎光耀的白板（三個名字、四個詞、十二格）；
       矮櫃上自己的傳真機；長會議桌（比對報告、紙條的放大影本、鑰匙清冊、退休卷宗、電信局三頁紙、刑大送來的箱子、隨身碟）；許知夏的電腦桌 ---------- */
  const meet = { name:"3F 督察組會議室", w:304, h:150, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 304, 60, "#e4e4dc", "plain", { base:"#3a4a5a" });
      // 白板：三個名字、四個詞、十二格
      p.R(28, 8, 84, 40, O); p.R(29, 9, 82, 38, "#f8f8f4"); for (let k = 0; k < 3; k++) p.R(52 + k * 20, 12, 14, 2, "#2a2a6a"); for (let k = 0; k < 4; k++) p.R(32, 18 + k * 7, 14, 2, "#2a2a6a");
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++){ p.R(50 + c * 20, 17 + r * 7, 18, 1, "#a8a8b0"); } for (let c = 0; c < 4; c++) p.R(49 + c * 20, 17, 1, 28, "#a8a8b0"); p.R(34, 47, 18, 2, "#5a5a5e");
      // 鐘（快兩分鐘）
      p.R(118, 10, 14, 14, O); p.R(119, 11, 12, 12, "#f4f4f0"); p.R(124, 13, 1, 5, O); p.R(124, 17, 4, 1, O);
      // 百葉窗（拉下來的）
      p.R(140, 8, 62, 38, O); p.R(141, 9, 60, 36, "#d8d8d0"); for (let y = 10; y < 45; y += 3) p.R(141, y, 60, 1, "#b8b8b0"); p.R(198, 9, 1, 30, "#8a8a84");
      // 門（裡面包了一層隔音棉）
      T.backDoor(p, 272, 16, 24, 44, 0, "#6a7480", { frame:"#3a4450" }); for (let y = 20; y < 58; y += 6) for (let x = 275; x < 294; x += 6) p.R(x, y, 2, 2, "#5a6470");
      vinyl(p, 0, 60, 304, 90, "#b8bcc0", "#b0b4b8", 18);
      T.sides(p, this, "#3a4a5a", [["B", 130, 44]]);
    },
    props:[
      // 矮櫃＋傳真機（回條夾在上面）
      { y:66, draw(p){ T.box(p, 206, 40, 48, 8, 16, "#a89878", "#7a6a4a"); p.R(216, 32, 24, 12, O); p.R(217, 33, 22, 10, "#e8e8e0"); p.R(219, 35, 10, 3, "#2a2a2e"); p.R(232, 34, 5, 3, "#4ae06a"); p.R(220, 30, 14, 4, "#f4f4f0"); } },
      // 許知夏的電腦桌（螢幕上放大的指紋；第二天旁邊多一個藍色箱子）
      { y:112, draw(p, g, t, o){ T.box(p, 4, 84, 28, 20, 8, "#c8c8c0", "#8a8a84"); p.R(8, 74, 20, 14, O); p.R(9, 75, 18, 11, "#1e2226"); p.R(10, 76, 16, 9, "#e8e4d8"); for (let k = 0; k < 4; k++) p.R(13 + k, 78 + k, 8 - k * 2, 1, "#8a6a5a");
          if (ph(o) > 0){ T.box(p, 6, 110, 20, 10, 8, "#3a6ac8", "#2a4a9a"); } } },
      // 長會議桌＋椅子
      { y:76, draw(p){ for (const x of [90, 130, 170, 210]) T.chair(p, x, 76, "#3a4a5a", "down"); } },
      { y:114, draw(p, g, t, o){ T.box(p, 70, 84, 162, 22, 8, "#c8b898", "#8a7a5a");
          // 比對報告、紙條影本、鑰匙清冊、退休卷宗、電信局三頁紙、刑大的箱子、隨身碟
          p.R(78, 88, 14, 10, O); p.R(79, 89, 12, 8, "#f4f4f0"); p.R(80, 90, 8, 1, "#c8302a"); for (let k = 0; k < 3; k++) p.R(80, 92 + k * 2, 9, 1, "#5a5a6a");
          p.R(102, 88, 14, 10, O); p.R(103, 89, 12, 8, "#f8f8f4"); for (let k = 0; k < 3; k++) p.R(104, 90 + k * 2, 10, 1, "#a8b8d8"); p.R(105, 91, 6, 1, "#2a4ad8");
          p.R(126, 88, 14, 10, O); p.R(127, 89, 12, 8, "#f4f0e0"); for (let k = 0; k < 4; k++) p.R(128, 90 + k * 2, 10, 1, "#5a5a6a");
          p.R(150, 87, 14, 12, O); p.R(151, 88, 12, 10, "#c8a050"); p.R(152, 89, 10, 8, "#f4f4f0"); p.R(153, 90, 8, 1, "#2a2a2a");
          p.R(174, 88, 14, 10, O); p.R(175, 89, 12, 8, "#f4f4f0"); p.R(176, 91, 10, 1, "#5a5a6a"); p.R(176, 93, 10, 1, "#5a5a6a"); p.R(176, 95, 6, 1, "#c8302a");
          T.box(p, 198, 86, 20, 12, 6, "#c8a878", "#8a6a4a"); p.R(201, 88, 14, 2, "#f4f4f0");
          if (hasUsb()){ p.R(222, 92, 6, 3, O); p.R(223, 93, 4, 1, "#3a6ad8"); } } },
      { y:126, draw(p){ for (const x of [110, 190]) T.chair(p, x, 126, "#3a4a5a", "up"); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 60); fluo(p, 190, 2, 60); tone(g, this, o, .25); },
    solid:[[204,40,52,24],[2,82,32,24],[68,82,166,26]],
    exits:[ { r:[130,144,44,6], to:"lobby", at:[210,68], label:"1F 值班台（電梯）", kind:"down", art:[130,142,44,8] } ]
  };

  /* ---------- 1F 收發室：一整面牆的退休人員信箱（每一格一把鎖）、牆上的告示；櫃台（領信簿）、櫃台邊的垃圾桶、角落兩個沒人領的包裹；
       長椅（一頂舊安全帽、摺好的報紙） ---------- */
  const mail = { name:"1F 收發室", w:256, h:144, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 58, "#e8e2cc", "plain", { base:"#6a4a3a" });
      // 告示
      p.R(16, 14, 32, 22, O); p.R(17, 15, 30, 20, "#f4f4f0"); for (let k = 0; k < 4; k++) p.R(19, 18 + k * 3, 26, 1, "#3a3a3a"); p.R(38, 28, 6, 6, "rgba(200,48,42,.7)");
      // 一整面牆的小鐵櫃
      p.R(60, 6, 146, 48, O); p.R(61, 7, 144, 46, "#8a9098"); for (let r = 0; r < 5; r++) for (let c = 0; c < 12; c++){ const x = 62 + c * 12, y = 8 + r * 9; p.R(x, y, 11, 8, "#a8b0b8"); p.R(x + 1, y + 1, 5, 2, "#f4f4f0"); p.R(x + 8, y + 4, 2, 2, "#5a5a5a"); }
      p.R(146, 26, 11, 8, "#c8d0d8");
      vinyl(p, 0, 58, 256, 86, "#c8bca0", "#c0b498", 16);
      T.sides(p, this, "#6a4a3a", [["B", 108, 40]]);
    },
    props:[
      // 櫃台（領信簿）
      { y:98, draw(p){ T.box(p, 6, 78, 66, 12, 10, "#a88a62", "#7a5a3a"); p.R(30, 80, 20, 8, O); p.R(31, 81, 9, 6, "#f4f0e0"); p.R(41, 81, 8, 6, "#f4f0e0"); for (let k = 0; k < 2; k++){ p.R(32, 82 + k * 2, 6, 1, "#5a5a6a"); p.R(42, 82 + k * 2, 6, 1, "#5a5a6a"); } p.R(56, 79, 10, 6, "#e8e4d8"); } },
      // 垃圾桶（撕開的信封、包著塑膠套的月刊）
      { y:100, draw(p){ p.R(76, 88, 10, 12, O); p.R(77, 89, 8, 10, "#5a6a7a"); p.R(78, 89, 6, 3, "#f4f0e0"); p.R(79, 88, 4, 2, "rgba(220,235,240,.8)"); } },
      // 角落兩個包裹
      { y:80, draw(p){ T.box(p, 214, 62, 32, 12, 8, "#c8a878", "#8a6a4a"); T.box(p, 218, 54, 22, 10, 6, "#d8b888", "#9a7a5a"); p.R(222, 56, 12, 4, "#f4f4f0"); } },
      // 長椅：舊安全帽、摺好的報紙（第二天）
      { y:120, draw(p, g, t, o){ p.R(140, 108, 82, 10, O); p.R(141, 109, 80, 8, "#4a6a8a"); for (let i = 141; i < 221; i += 12) p.R(i, 109, 1, 8, "#3a5a7a"); p.R(142, 118, 3, 4, O); p.R(216, 118, 3, 4, O);
          if (ph(o) > 0){ p.R(148, 102, 14, 10, O); p.R(149, 103, 12, 8, "#c8c0a0"); p.R(150, 104, 10, 3, "#e8e0c0"); p.R(166, 108, 14, 6, O); p.R(167, 109, 12, 4, "#e8e4d8"); } } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 50); fluo(p, 170, 2, 50); tone(g, this, o, .25); },
    solid:[[4,76,70,24],[74,86,14,14],[212,52,36,24],[138,106,86,14]],
    exits:[ { r:[108,138,40,6], to:"lobby", at:[132,68], label:"1F 值班台", kind:"out", art:[108,138,40,6] } ]
  };

  /* ---------- 1F 食堂：配菜台（玻璃罩、後面是廚房）、最右邊的洗碗槽、牆上的菜單、熱水桶、對著大門和車棚的窗戶；
       刷卡機（夾著印出來的紀錄）、靠窗那一桌（桌角一圈一圈的茶漬）、兩張長桌 ---------- */
  const canteen = { name:"1F 食堂", w:304, h:150, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 304, 60, "#ece6d4", "plain", { base:"#5a6a4a" });
      // 廚房（配菜台後面）：鍋子、抽油煙機
      p.R(6, 4, 128, 40, "#c8c8c0"); p.R(6, 4, 128, 8, "#a8acb0"); for (let k = 0; k < 3; k++){ p.R(16 + k * 34, 22, 22, 14, O); p.R(17 + k * 34, 23, 20, 12, "#8a8e94"); p.R(19 + k * 34, 24, 16, 4, "#c8a050"); }
      if (Math.floor(t * 2) % 2) p.R(26, 16, 2, 5, "rgba(240,240,240,.5)");
      // 菜單（紅筆一行）
      p.R(142, 10, 36, 34, O); p.R(143, 11, 34, 32, "#2a3a2a"); for (let k = 0; k < 5; k++) p.R(146, 15 + k * 5, 26, 1, "#e8e8e0"); p.R(146, 39, 26, 1, "#e85a4a");
      // 窗戶（對著大門和車棚）
      window2(p, 200, 10, 76, 34, o, t, (x, y, w, h) => { p.R(x, y, w, h, "#b8c8d0"); p.R(x, y + h - 12, w, 12, "#8a8e90"); p.R(x + 6, y + 4, 26, 14, "#c8ccd0"); p.R(x + 40, y + 10, 30, 8, "#5a6a7a"); for (let k = 0; k < 4; k++) p.R(x + 42 + k * 7, y + 18, 4, 4, "#2a2a2e"); }, "#e8e4d8");
      vinyl(p, 0, 60, 304, 90, "#c8c4b0", "#c0bca8", 16);
      T.sides(p, this, "#5a6a4a", [["R", 90, 30]]);
      T.sideDoor(p, this, "R", 90, 30, dA("canteen", "lobby"), "#8a6a4a");
    },
    props:[
      // 配菜台（玻璃罩）＋最右邊的洗碗槽
      { y:80, draw(p, g, t, o){ T.box(p, 6, 58, 128, 10, 12, "#c8ccd0", "#8a9094"); for (let k = 0; k < 5; k++){ p.R(10 + k * 20, 60, 16, 7, O); p.R(11 + k * 20, 61, 14, 5, ph(o) > 0 && k > 1 ? "#a8acb0" : ["#c8803a", "#4a8a3a", "#e8d8a8", "#8a5a3a", "#c8a050"][k]); }
          p.R(6, 52, 104, 3, "rgba(220,240,250,.7)"); p.R(112, 59, 20, 8, O); p.R(113, 60, 18, 6, "#a8b8c0"); p.R(120, 56, 2, 4, "#c8ccd0"); } },
      // 熱水桶
      { y:72, draw(p){ T.box(p, 182, 58, 16, 10, 4, "#8a6a4a", "#5a3a22"); p.R(184, 44, 12, 16, O); p.R(185, 45, 10, 14, "#d8dcdc"); p.R(187, 48, 6, 4, "#f4f4f0"); p.R(190, 58, 2, 3, O); } },
      // 刷卡機（右邊門口）
      { y:82, draw(p){ p.R(286, 60, 3, 20, O); p.R(282, 58, 12, 12, O); p.R(283, 59, 10, 10, "#3a3a3e"); p.R(284, 60, 8, 4, "#4ae06a"); p.R(284, 66, 8, 2, "#f4f4f0"); } },
      // 靠窗那一桌（茶漬）
      { y:90, draw(p){ T.box(p, 208, 72, 44, 14, 6, "#d8c8a8", "#a8987a"); for (const [x, y] of [[212, 74], [216, 77], [244, 75]]){ p.R(x, y, 6, 1, "rgba(140,90,40,.45)"); p.R(x, y + 3, 6, 1, "rgba(140,90,40,.45)"); p.R(x, y, 1, 4, "rgba(140,90,40,.45)"); p.R(x + 5, y, 1, 4, "rgba(140,90,40,.45)"); } } },
      { y:96, draw(p){ for (const x of [218, 242]) T.chair(p, x, 96, "#6a8a5a", "up"); } },
      // 兩張長桌
      { y:122, draw(p){ for (const x of [30, 120]){ T.box(p, x, 106, 60, 14, 6, "#d8c8a8", "#a8987a"); p.R(x + 6, 108, 8, 5, "#f4f4f0"); } } },
      { y:136, draw(p){ for (const x of [44, 74, 134, 164]) T.chair(p, x, 136, "#6a8a5a", "up"); } }
    ],
    front(p, g, t, o){ fluo(p, 70, 2, 60); fluo(p, 200, 2, 60); tone(g, this, o, .2); },
    solid:[[4,50,132,30],[180,56,20,14],[280,58,16,24],[206,70,48,18],[28,104,64,18],[118,104,64,18]],
    exits:[ { r:[296,90,8,30], to:"lobby", at:[24,100], label:"1F 值班台", kind:"door", art:[296,88,8,34] } ]
  };

  /* ---------- B1 證物室前台：第 33 集同一間；桌上一套紫砂茶具（壺是溫的）、兩個海風咖啡的外帶杯、桌邊一個深藍色行李箱 ---------- */
  const E3 = P3 && P3.evoffice;
  const evoffice = { name:"B1 證物室前台", w:288, h:150, wall:60,
    floor(p, g, t, o){ if (E3) E3.floor.call(this, p, g, t, o); else p.R(0, 0, 288, 150, "#8e908a");
      cardDoor(p, 204, 16, 26, 44, dA("evoffice", "cshelf"), false); },
    props:[
      ...(E3 ? E3.props : []),
      // 紫砂茶具、兩個外帶咖啡杯
      { y:103, draw(p){ p.R(92, 84, 16, 8, O); p.R(93, 85, 14, 6, "#6a3a2a"); p.R(96, 82, 6, 4, O); p.R(97, 83, 4, 2, "#8a4a32"); for (let k = 0; k < 4; k++) p.R(94 + k * 3, 88, 2, 2, "#e8dcc8");
          for (const x of [70, 76]){ p.R(x, 92, 5, 7, O); p.R(x + 1, 93, 3, 5, "#f4f0e8"); p.R(x + 1, 95, 3, 2, "#3a6a8a"); } } },
      // 深藍色行李箱（把手上掛著講習的名牌）
      { y:118, draw(p){ p.R(140, 96, 16, 22, O); p.R(141, 97, 14, 20, "#2a3a6a"); p.R(141, 104, 14, 1, "#1a2a4a"); p.R(145, 92, 6, 5, O); p.R(146, 93, 4, 3, "#5a5a5e"); p.R(152, 96, 6, 4, "#f4f4f0"); p.R(142, 118, 3, 2, O); p.R(151, 118, 3, 2, O); } }
    ],
    front(p, g, t, o){ fluo(p, 50, 2, 50); fluo(p, 180, 2, 50); tone(g, this, o, .3); },
    solid:[[4,58,22,18],[22,74,92,28],[236,36,46,40],[116,100,12,10],[140,98,16,20]],
    exits:[ { r:[128,144,32,8], to:"lobby", at:[220,128], label:"1F 值班台（上樓）", kind:"out", art:[126,140,36,10] },
            { r:[204,60,26,8], to:"cshelf", at:[24,98], label:"C 區", kind:"door", art:[204,16,26,44] } ]
  };

  /* ---------- C 區：第 33 集同一間；C-7 底板鎖回去了，貼著兩道督察組的封條；地上一個黃膠帶貼的長方形（十四箱的大小）；老方的工具箱還在 ---------- */
  const S3 = P3 && P3.cshelf;
  const cshelf = { name:"B1・C 區", w:340, h:160, wall:60,
    floor(p, g, t, o){ if (S3) S3.floor.call(this, p, g, t, o); else p.R(0, 0, 340, 160, "#8e908a");
      tape(p, 186, 92, 56, 30); },
    props:[
      ...(S3 ? [S3.props[0], S3.props[1], S3.props[2]].map(q => ({ y:q.y, draw(p, g, t, o){ q.draw.call(this, p, g, t, Object.assign({}, o, { open:false })); } })) : []),
      // C-7 底板上的兩道封條
      { y:75, draw(p){ for (const x of [190, 220]){ p.R(x, 60, 16, 4, "#f4f4f0"); p.R(x + 2, 61, 12, 2, "#c8302a"); } } }
    ],
    front(p, g, t, o){ fluo(p, 80, 2, 50); fluo(p, 240, 2, 50); tone(g, this, o, .3); },
    solid:[[14,2,66,72],[96,2,66,72],[178,2,66,72],[260,2,66,72],[140,100,22,12],[36,104,26,14]],
    exits:[ { r:[0,80,8,34], to:"evoffice", at:[216,74], label:"證物室前台", kind:"door", art:[0,78,8,38] } ]
  };

  if (typeof window !== "undefined") window.PD34 = { meet, lobby };
  setLoc("police", { start:"meet", spawn:[150,136], rooms:{ meet, lobby, mail, canteen, evoffice, cshelf },
    spots:{
      cctv34_lobby:[64,64,20,14,90,112,"lobby",A("type",{ actT:2, face:-1 })],
      doc34_night:[96,94,40,10,116,112,"lobby",A("read")],
      o34_board1:[14,12,40,30,36,70,"lobby",A("read")],
      o34_report:[76,86,18,14,86,122,"meet",A("read")],
      doc34_slip:[100,86,18,14,108,122,"meet",A("read")],
      doc34_keys:[124,86,18,14,132,122,"meet",A("read")],
      doc34_retire:[148,85,18,16,156,122,"meet",A("read")],
      doc34_calls:[172,86,18,14,180,122,"meet",A("read")],
      doc34_post:[196,82,24,18,206,122,"meet",A("rummage")],
      doc34_sms:[218,88,14,12,228,122,"meet",A("look")],
      o34_board:[28,8,84,40,70,70,"meet",A("read")],
      o34_fax:[214,28,28,16,230,72,"meet",A("read")],
      doc34_mail:[28,78,24,12,40,104,"mail",A("read")],
      o34_mailbox:[144,24,14,12,152,68,"mail",A("rummage")],
      o34_helmet:[146,100,18,14,154,128,"mail",A("look")],
      doc34_meal:[280,56,16,16,272,90,"canteen",A("read",{ face:1 })],
      o34_seat:[206,70,48,18,230,104,"canteen",A("look")],
      o34_menu:[142,10,36,34,160,72,"canteen",A("read")],
      doc34_handbook:[56,80,22,10,66,110,"evoffice",A("read")],
      doc34_duty:[148,8,40,32,168,70,"evoffice",A("read")],
      doc34_visit:[236,34,46,12,258,84,"evoffice",A("read")],
      o34_remit:[24,92,24,10,40,110,"evoffice",A("rummage")],
      o34_teaset:[90,80,20,14,96,110,"evoffice",A("look")],
      o34_suitcase:[138,92,20,28,166,112,"evoffice",A("look",{ face:-1 })],
      o34_c7:[180,56,62,16,210,84,"cshelf",A("crouch")],
      o34_c7dust:[262,56,62,16,292,84,"cshelf",A("crouch")]
    },
    details:{
      d34_blinds:[140,8,62,38,170,70,"meet",A("look")],
      d34_clock:[118,10,14,14,124,70,"meet",A("look")],
      d34_door:[272,16,24,44,284,72,"meet",A("look")],
      d34_clock1:[148,6,18,18,156,70,"lobby",A("look")],
      d34_stairs:[236,98,58,44,220,120,"lobby",A("look",{ face:1 })],
      d34_glass:[128,140,44,10,150,132,"lobby",A("look")],
      d34_notice:[16,14,32,22,32,68,"mail",A("read")],
      d34_parcel:[212,50,36,26,230,88,"mail",A("look")],
      d34_bin:[74,86,14,14,94,104,"mail",A("look",{ face:-1 })],
      d34_urn:[182,42,16,28,190,80,"canteen",A("look")],
      d34_window:[200,10,76,34,250,66,"canteen",A("look")],
      d34_sink:[110,56,24,12,122,90,"canteen",A("look")],
      d34_kettle:[6,50,18,16,34,70,"evoffice",A("look",{ face:-1 })],
      d34_keycab:[124,12,20,32,134,70,"evoffice",A("look")],
      d34_cups:[68,90,14,10,76,110,"evoffice",A("look")],
      d34_water:[162,30,16,20,170,82,"cshelf",A("look")],
      d34_tape:[184,90,60,34,214,132,"cshelf",A("look")],
      d34_toolbox:[138,94,26,18,151,120,"cshelf",A("look")]
    },
    place:{
      li:[ { room:"meet", x:104, y:70, act:"write", facing:-1 }, { room:"meet", x:104, y:70, act:"cross", facing:-1 } ],
      ye:[ { room:"meet", x:262, y:96, act:"read", facing:-1 }, { room:"meet", x:262, y:96, act:"read", facing:-1 } ],
      xu:[ { room:"meet", x:40, y:94, act:"type", facing:-1 }, { room:"meet", x:40, y:94, act:"type", facing:-1 } ],
      zhou:[ { room:"meet", x:198, y:68, act:"cross", facing:1 }, { room:"meet", x:198, y:68, act:"cross", facing:1 } ],
      liu:[ { room:"lobby", x:116, y:66, act:"idle", facing:1 }, { room:"lobby", x:116, y:66, act:"write", facing:1 } ],
      huang:[ { room:"mail", x:196, y:100, act:"read", facing:-1 }, { room:"mail", x:196, y:100, act:"read", facing:-1 } ],
      pan:[ { room:"mail", x:20, y:68, act:"write", facing:1 }, { room:"mail", x:20, y:68, act:"idle", facing:1 } ],
      xia:[ { room:"canteen", x:44, y:90, act:"wipe", facing:-1 }, { room:"canteen", x:44, y:90, act:"wipe", facing:-1 } ],
      cai:[ { room:"evoffice", x:60, y:66, act:"write", facing:1 }, { room:"evoffice", x:60, y:66, act:"type", facing:1 } ],
      wei:[ { room:"evoffice", x:124, y:96, act:"drink", facing:-1 }, { room:"evoffice", x:124, y:96, act:"read", facing:-1 } ],
      kui:[ { room:"cshelf", x:252, y:100, act:"write", facing:-1 }, null ]
    },
    extras:W0.extras || [],
    intro:[ { set:{ room:"meet", px:150, py:146 }, hide:true }, { wait:0.3, hide:true }, { set:{ room:"meet", px:150, py:134 } },
      ...(W0.intro || []).filter(k => k.say || (k.wait && !k.hide)).map(k => k.say && k.say[0] === "wu" && /點畫面上的箭嘴|📍|清單不是全部/.test(k.say[1]) ? null : k).filter(Boolean) ],
    plan:[ { name:"澄港市警察局", w:100, h:52, rooms:{ meet:[20,0,60,16], canteen:[0,18,30,16], lobby:[30,18,40,16], mail:[70,18,30,16], evoffice:[20,36,34,16], cshelf:[54,36,46,16] } } ] });
})();

/* ================= 舊碼頭的路口、阿珠冰店、舊碼頭 ================= */
C34T && (() => {
  const { EP, T, O, A, tone, fluo, concrete, setLoc } = C34T;
  const W = id => (EP.world[id] || {});
  const F = typeof window !== "undefined" ? window.FRONT28 : null;
  const I30 = (typeof window !== "undefined" && window.ICE30) || {};
  const OP = typeof window !== "undefined" ? window.OLDPIER28 : null;

  /* ---------- 路口：第 28 集同一排（冰店、公共電話、海龍漁業的魚攤）；冰店的小貨車停在右邊（洗得很乾淨） ---------- */
  const front = { name:"冰店門口", w:336, h:150, wall:70,
    floor(p, g, t, o){ if (F) F.floor.call(this, p, g, t, o); else p.R(0, 0, 336, 150, "#8a8a82"); },
    props:[
      ...(F ? F.props.filter((q, i) => i !== 4) : []),
      // 阿珠的小貨車（後面冷凍櫃、車身粉紅色的字、藍色的車頭）
      { y:124, draw(p){ const x = 240, y = 98;
          p.R(x, y + 26, 92, 3, "rgba(0,0,0,.3)");
          for (const wx of [x + 10, x + 50, x + 72]){ p.R(wx, y - 2, 12, 4, O); p.R(wx, y + 24, 12, 4, O); }
          p.R(x, y, 64, 26, O); p.R(x + 1, y + 1, 62, 24, "#f4f6f6"); p.R(x + 1, y + 1, 62, 3, "#ffffff"); for (let k = 0; k < 4; k++) p.R(x + 8 + k * 14, y + 4, 1, 20, "#d8dcdc");
          p.R(x + 14, y + 22, 34, 3, "#e87aa8"); p.R(x + 14, y + 1, 34, 2, "#e87aa8");
          p.R(x + 64, y + 2, 26, 22, O); p.R(x + 65, y + 3, 24, 20, "#3a6aa8"); p.R(x + 68, y + 5, 10, 16, "#2a3a4a"); p.R(x + 69, y + 6, 8, 2, "#6a8aa8"); p.R(x + 84, y + 4, 4, 18, "#4a7ab8"); p.R(x + 89, y + 5, 2, 4, "#fff4c0"); p.R(x + 89, y + 17, 2, 4, "#fff4c0"); } }
    ],
    front(p, g, t, o){ if (F && F.front) F.front.call(this, p, g, t, o); },
    solid:[[28,80,30,12],[92,88,14,8],[50,96,18,10],[148,78,100,20],[238,96,94,28]],
    exits:[ { r:[40,70,40,8], to:"shop", at:[46,128], label:"店裡", kind:"door", art:[10,38,90,32] },
            { r:[328,88,8,52], to:"oldpier", at:[36,114], label:"舊碼頭", kind:"out", art:[328,88,8,52] } ]
  };

  /* ---------- 店裡：第 30 集同一間（機車鑰匙、新打的小貨車鑰匙） ---------- */
  const S0 = I30.shop;
  const shop = { name:"阿珠冰店", w:256, h:144, wall:62,
    floor(p, g, t, o){ if (S0) S0.floor.call(this, p, g, t, o); else p.R(0, 0, 256, 144, "#a8a49c"); p.R(245, 27, 3, 2, "#f8f0c0"); p.R(246, 22, 1, 6, "#f4f4f8"); },
    props:S0 ? S0.props : [],
    front(p, g, t, o){ fluo(p, 128, 2, 50); tone(g, this, o, .2); },
    solid:[[154,42,40,22],[212,58,42,18],[66,70,88,24],[28,106,26,14],[68,106,26,14]],
    exits:[ { r:[20,138,50,6], to:"front", at:[68,82], label:"冰店門口", kind:"out", art:[20,138,50,6] } ]
  };

  /* ---------- 舊碼頭：第 28 集同一個；船塢的鐵捲門拉下來、貼著封條；地上的舊輪胎印已經被雨洗掉了 ---------- */
  const oldpier = { name:"舊碼頭", w:352, h:164, wall:70,
    floor(p, g, t, o){ if (OP) OP.floor.call(this, p, g, t, Object.assign({}, o, { night:false })); else p.R(0, 0, 352, 164, "#8a8a82");
      // 雨洗過的地（蓋掉舊的輪胎印）
      concrete(p, 0, 90, 236, 20, "#8a8a82", 32);
      // 船塢鐵捲門拉到底＋封條
      p.R(241, 25, 48, 45, "#a8b0b8"); for (let y = 27; y < 70; y += 4) p.R(241, y, 48, 1, "#98a0a8"); p.R(244, 44, 42, 4, "#f4f4f0"); p.R(258, 44, 14, 4, "#c8302a"); },
    props:OP ? OP.props.filter((q, i) => i !== 2) : [],
    front(p, g, t, o){ tone(g, this, o, .2); },
    solid:[[0,126,244,38],[286,126,66,38],[16,90,36,16],[156,112,12,10],[186,94,8,4]],
    exits:[ { r:[0,80,8,40], to:"front", at:[318,134], label:"路口", kind:"out", art:[0,80,8,40] } ]
  };

  setLoc("harbour", { start:"front", spawn:[300,136], rooms:{ front, shop, oldpier },
    spots:{
      o34_phone:[116,28,16,42,124,80,"front",A("look")],
      o34_sign:[90,74,18,22,98,104,"front",A("read")],
      o34_hooks:[234,18,18,14,203,70,"shop",A("look",{ face:1 })],
      o34_tidecam:[112,110,20,46,122,118,"oldpier",A("look")]
    },
    details:{
      d34_upwin:[8,4,22,14,70,78,"front",A("look")],
      d34_hailong:[148,72,100,26,170,106,"front",A("look")],
      d34_truck:[238,96,94,28,226,132,"front",A("look")],
      d34_cards:[14,22,48,26,38,76,"shop",A("look")],
      d34_table:[28,104,26,16,40,132,"shop",A("look")],
      d34_icer:[154,40,40,24,174,72,"shop",A("look")],
      d34_seal:[240,24,50,46,264,80,"oldpier",A("look")],
      d34_bollard:[150,108,24,16,162,104,"oldpier",A("crouch")]
    },
    place:{
      zhu:[ { room:"shop", x:112, y:102, act:"wipe", facing:-1 }, { room:"shop", x:112, y:102, act:"wipe", facing:-1 } ],
      kui:[ null, { room:"front", x:146, y:108, act:"write", facing:-1 } ]
    },
    extras:W("harbour").extras || [],
    plan:[ { name:"南澳漁港・舊碼頭", w:100, h:36, rooms:{ shop:[0,0,40,18], front:[0,18,60,18,"out"], oldpier:[60,18,40,18,"out"] } } ] });
})();
