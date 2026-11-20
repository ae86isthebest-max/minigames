/* =========================================================
   第 5 集（俯視版，topdown.js）：八個地點全部換成俯視畫面
   原本的橫向剖面（case5_art.js）照舊留著。房間 id＝原本 EP5.rooms 的 id，證物、小細節 id 不變。
   四月的澄港：第一晚（夜）、第二天白天、第三天清晨（暖色）。
   風格：山景路的建商豪宅（大片落地窗看港口）、粉紅色的小孩房、窄窄的保母房、街口的安親班、
   老舊的澄港市刑大（之後幾集也在這裡上班）、港灣大樓的花崗岩大廳、舊港區的頂樓加蓋、小租車行、南澳漁港的鐵皮倉庫。
   ========================================================= */
const C5T = typeof TOPEP === "function" ? TOPEP("ransom", { dusk:p => p === 2 }) : null;

/* ================= 陳家（山景路）：客廳、車庫、語彤的房間、保母房 ================= */
C5T && (() => {
  const { EP, T, O, sh, mix, dA, ph, night, A, has, roomOk, tone, window2, cityView, fluo, concrete, laminate, setLoc } = C5T;
  const W0 = EP.world.chenhome || {};
  // 港口夜景／白天（落地窗外）
  const harbour = o => (p => (x, y, w, h) => { const n = night(o), d = ph(o) === 2;
    p.R(x, y, w, h, n ? "#0e1424" : d ? "#e8b888" : "#9cc0dc"); p.R(x, y + h * .55, w, h * .45, n ? "#0a1a2a" : d ? "#c88a5a" : "#4a7aa0");
    for (let i = 0; i < w; i += 8){ const bh = 4 + ((i * 7) % 9); p.R(x + i, y + h * .55 - bh, 7, bh, n ? "#1a2232" : "#6a7a8a"); if (n && i % 16 === 0) p.R(x + i + 2, y + h * .55 - bh + 2, 1, 1, "#e8c870"); }
    for (let k = 0; k < 5; k++) p.R(x + 10 + k * w / 5, y + h * .55 + 4 + (k % 2) * 3, 6, 1, n ? "#e8c870" : "#d8e8f0");   // 港口的燈／浪
    p.R(x + w * .7, y + h * .55 - 10, 2, 10, n ? "#3a3a4a" : "#8a8a8a"); p.R(x + w * .7 - 6, y + h * .55 - 4, 14, 3, n ? "#2a2a3a" : "#c8c8c8"); });
  // 大塊的灰色石英磚
  const slab = (p, x, y, w, h, col) => { p.R(x, y, w, h, col); for (let j = y; j < y + h; j += 30) p.R(x, j, w, 1, sh(col, -.1)); for (let i = x; i < x + w; i += 60) p.R(i, y, 1, h, sh(col, -.1)); p.seed(51); for (let k = 0; k < w * h / 40; k++) p.R(x + p.rnd() * w, y + p.rnd() * h, 2, 1, sh(col, .05)); };

  /* ---------- 客廳：一整面落地窗、L 型沙發、電話旁邊擠滿了人 ---------- */
  const cliving = { name:"陳家客廳", w:360, h:184, wall:70,
    floor(p, g, t, o){
      T.backWall(p, 0, 360, 70, "#ece8e0", "plain", { base:"#5a5650" });
      // 落地窗（港口）
      p.R(118, 4, 150, 64, O); p.R(119, 5, 148, 62, "#c8c4bc"); harbour(o)(p)(121, 7, 144, 58); for (const x of [168, 216]) p.R(x, 7, 2, 58, "#c8c4bc");
      p.R(112, 2, 8, 66, "#b8aa98"); p.R(266, 2, 8, 66, "#b8aa98");   // 窗簾
      // 全家福（左牆）、掛鐘
      p.R(44, 12, 40, 28, O); p.R(45, 13, 38, 26, "#c8a050"); p.R(47, 15, 34, 22, "#d8e0e8"); for (const [x, c, hgt] of [[52, "#2a2a3a", 14], [60, "#c84a6a", 13], [68, "#e8963a", 8], [75, "#3a3a4a", 12]]){ p.R(x, 34 - hgt, 6, hgt, c); p.R(x + 1, 32 - hgt, 4, 4, "#e8c09a"); }
      p.R(94, 14, 14, 14, O); p.R(95, 15, 12, 12, "#f4f0e6"); p.R(100, 16, 1, 6, O); p.R(101, 21, 4, 1, O);
      // 電視牆（右）
      p.R(278, 16, 36, 24, O); p.R(279, 17, 34, 22, "#1a1c20"); p.R(280, 18, 32, 20, "#3a8ad8"); p.R(284, 23, 9, 9, "#f4f4f0"); p.R(286, 25, 5, 5, "#2a2a3a"); p.R(298, 24, 10, 8, "#e9c43a");   // 卡通台（靜音）
      // 往保母房的門（後牆左）
      T.backDoor(p, 12, 28, 24, 42, dA("cliving", "cmaid"), "#d8ccb8", { frame:"#a89a84" });
      slab(p, 0, 70, 360, 114, "#d4d0c8");
      T.rug(p, 108, 104, 150, 62, "#8a8478", "#ece8e0", "#b8b0a0");
      // 右邊：樓梯（往二樓）
      for (let k = 0; k < 6; k++){ p.R(318, 80 + k * 10, 36, 9, O); p.R(319, 81 + k * 10, 34, 7, sh("#a8987a", k * .03)); p.R(319, 81 + k * 10, 34, 1, "#c8b89a"); }
      T.sides(p, this, "#5a5650", [["L", 120, 40], ["B", 160, 40]]); T.sideDoor(p, this, "L", 120, 40, dA("cliving", "cgarage"), "#8a8478");
    },
    props:[
      // L 型沙發（白色皮）
      { y:112, draw(p){ T.box(p, 120, 86, 120, 14, 10, "#f4f2ee", "#c8c4bc"); p.R(120, 82, 120, 5, O); p.R(121, 83, 118, 3, "#e8e4dc"); } },
      { y:150, draw(p){ T.box(p, 100, 100, 18, 48, 8, "#f4f2ee", "#c8c4bc"); } },
      // 茶几：陳建宏的手機；第二天起兩個運動袋（贖金）
      { y:138, draw(p, g, t, o){ T.box(p, 140, 116, 90, 18, 6, "#2a2a2e", "#1a1a1e"); p.R(150, 120, 8, 12, O); p.R(151, 121, 6, 10, "#1e2226"); p.R(152, 122, 4, 6, "#3a6ad8");
          if (ph(o) >= 1) for (const x of [172, 200]){ p.R(x, 114, 24, 14, O); p.R(x + 1, 115, 22, 12, "#2a3a6a"); p.R(x + 1, 120, 22, 2, "#c84a3a"); p.R(x + 8, 112, 8, 3, O); } } },
      // 電話邊桌：家用電話、警方的錄音機和一堆線
      { y:110, draw(p, g, t){ T.box(p, 60, 88, 34, 12, 10, "#5a3a22", "#3a2414"); p.R(64, 84, 12, 8, O); p.R(65, 85, 10, 6, "#e8e4d8"); p.R(66, 86, 8, 2, "#2a2a2e"); p.R(80, 86, 12, 8, O); p.R(81, 87, 10, 6, "#3a3e44"); p.R(83, 89, 2, 2, Math.floor(t * 2) % 2 ? "#e84a3a" : "#5a1a1a");
          for (let k = 0; k < 18; k++) p.R(92 + k * 2, 100 + Math.round(Math.sin(k * .7) * 2), 2, 1, "#1a1a1a"); } },
      // 陳建宏坐的單人椅
      { y:106, draw(p){ T.chair(p, 46, 106, "#e8e4dc", "right"); } },
      // 電視櫃
      { y:62, draw(p){ T.box(p, 274, 52, 42, 6, 10, "#2a2a2e", "#1a1a1e"); } },
      { y:182, draw(p){ T.plant(p, 22, 180, true, "#3a6a3a"); } }
    ],
    front(p, g, t, o){ for (const x of [140, 240]){ p.R(x - 6, 0, 12, 4, O); p.R(x - 5, 1, 10, 2, "#f4f0e0"); T.glow(g, x, 30, 50, "255,240,210", .1); } tone(g, this, o, .3); },
    solid:[[118,80,124,32],[98,98,22,58],[138,112,94,30],[58,82,38,30],[272,48,46,22],[12,164,20,18],[316,78,40,62]],
    exits:[ { r:[0,120,8,40], to:"cgarage", at:[310,96], label:"車庫", kind:"door", art:[0,118,8,44] },
            { r:[12,70,24,8], to:"cmaid", at:[96,118], label:"保母房", kind:"door", art:[12,28,24,42] },
            { r:[318,140,36,8], to:"ckid", at:[40,128], label:"二樓・語彤的房間", kind:"up", art:[316,78,40,64] } ]
  };

  /* ---------- 車庫：環氧樹脂地、鐵捲門開著，外面停著黑色賓士 ---------- */
  const cgarage = { name:"車庫", w:336, h:164, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 336, 58, "#c8c8c4", "plain", { base:"#5a5a5a" });
      // 工具牆、輪胎架
      p.R(20, 8, 80, 34, O); p.R(21, 9, 78, 32, "#9a8a6a"); for (let j = 12; j < 40; j += 4) for (let i = 23; i < 98; i += 4) p.R(i, j, 1, 1, "#7a6a4a"); for (let k = 0; k < 7; k++) p.R(26 + k * 10, 12, 2, 10 + (k % 3) * 4, "#5a5e62");
      for (let k = 0; k < 3; k++){ p.R(120 + k * 20, 14, 18, 30, O); p.R(121 + k * 20, 15, 16, 28, "#2a2a2a"); p.R(126 + k * 20, 22, 6, 14, "#4a4a4a"); }
      // 往屋裡的門（右邊）
      T.backDoor(p, 296, 16, 26, 42, dA("cgarage", "cliving"), "#c8c0b0", { frame:"#8a8478" });
      p.R(0, 58, 336, 106, "#7a8288"); for (let x = 0; x < 336; x += 3) p.R(x, 58 + ((x * 7) % 106), 1, 1, "#868e94");
      p.R(0, 58, 336, 1, "#6a7278");
      // 自家車的油漬
      p.R(150, 116, 16, 6, "rgba(20,20,24,.25)"); p.R(154, 118, 8, 2, "rgba(20,20,24,.2)"); p.R(160, 120, 3, 2, "rgba(20,20,24,.2)");
      // 鐵捲門（拉起來）＋門外的車道
      p.R(30, 150, 276, 14, "#5a5e62"); for (let x = 30; x < 306; x += 3) p.R(x, 150, 1, 3, "#4a4e52"); p.R(30, 150, 276, 1, O);
      T.sides(p, this, "#5a5a5a", [["B", 30, 276]]);
    },
    props:[
      // 白色休旅車（後座有兒童座椅）
      { y:128, draw(p, g){ SP.car(g, 100, 128, { col:"#ecebe6", facing:1 }); } },
      // 門外：陳建志的黑色賓士（停在車道上）
      { y:170, draw(p, g){ SP.car(g, 236, 170, { col:"#1e2024", facing:-1 }); } },
      // 回收桶、高爾夫球袋
      { y:72, draw(p){ p.R(200, 46, 12, 26, O); p.R(201, 47, 10, 24, "#2a5a3a"); p.R(203, 40, 2, 8, "#c8ccd0"); p.R(207, 42, 2, 6, "#c8ccd0"); T.box(p, 228, 52, 22, 12, 10, "#3a6aa8", "#2a4a7a"); } }
    ],
    front(p, g, t, o){ fluo(p, 80, 2, 50); fluo(p, 220, 2, 50); tone(g, this, o, .3); },
    solid:[[66,96,70,34],[198,40,16,34],[226,50,26,26],[200,136,72,30]],
    exits:[ { r:[296,58,26,8], to:"cliving", at:[24,140], label:"客廳", kind:"door", art:[296,16,26,42] } ]
  };

  /* ---------- 語彤的房間：粉紅色、到處都是小企鵝 ---------- */
  const penguin = (p, x, y, big) => { const s = big ? 2 : 1; p.R(x - 1, y - 1, 6 * s + 2, 7 * s + 2, O); p.R(x, y, 6 * s, 7 * s, "#1e2a3a"); p.R(x + s, y + 2 * s, 4 * s, 5 * s, "#f4f4f0"); p.R(x + 2 * s, y + s, s, s, "#f4f4f0"); p.R(x + 3 * s, y + 3 * s, s, s, "#e9a43a"); };
  const ckid = { name:"語彤的房間", w:256, h:156, wall:62,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 62, "#f4d8e0", "stripe", { base:"#c88a9a" });
      // 窗（港口）
      window2(p, 96, 8, 52, 32, o, t, harbour(o)(p), "#f4f4f0"); p.R(92, 4, 6, 40, "#e8a8c0"); p.R(146, 4, 6, 40, "#e8a8c0");
      // 牆上的蠟筆畫
      for (const [x, y, c] of [[14, 12, "#e84a3a"], [36, 16, "#3a8ad8"], [168, 12, "#3aa86a"]]){ p.R(x - 1, y - 1, 18, 14, O); p.R(x, y, 16, 12, "#fffef4"); p.R(x + 2, y + 6, 12, 1, c); p.R(x + 4, y + 2, 4, 4, c); p.R(x + 10, y + 3, 3, 3, "#e9c43a"); }
      // 出去的樓梯口
      laminate(p, 0, 62, 256, 94, "#e8d4b4");
      T.rug(p, 90, 100, 76, 40, "#e8a8c0", "#f8e8ee", "#c8a0b0");
      T.sides(p, this, "#c88a9a", [["B", 24, 32]]);
    },
    props:[
      // 床（粉紅被子）＋一排小企鵝
      { y:122, draw(p){ p.R(186, 48, 60, 74, O); p.R(187, 49, 58, 12, "#f4f4f0"); p.R(187, 61, 58, 60, "#f8c8d8"); p.R(192, 64, 22, 10, "#ffffff"); for (let k = 0; k < 4; k++) penguin(p, 190 + k * 13, 52, false); } },
      // 書桌：接送時間表、邀請卡
      { y:72, draw(p){ T.box(p, 10, 44, 60, 12, 14, "#f4f4f0", "#c8c4bc"); p.R(16, 46, 16, 9, O); p.R(17, 47, 14, 7, "#fffef4"); for (let k = 0; k < 3; k++) p.R(18, 48 + k * 2, 12, 1, "#3a6ad8"); p.R(40, 46, 14, 9, O); p.R(41, 47, 12, 7, "#f8c8d8"); p.R(44, 49, 6, 3, "#e84a3a"); } },
      { y:78, draw(p){ T.chair(p, 40, 78, "#e8a8c0", "up"); } },
      // 小鋼琴
      { y:94, draw(p){ T.box(p, 10, 76, 40, 10, 10, "#f4f4f0", "#c8c4bc"); p.R(12, 82, 36, 4, O); for (let k = 0; k < 12; k++) p.R(13 + k * 3, 83, 2, 2, "#f4f4f0"); p.R(20, 72, 14, 6, O); p.R(21, 73, 12, 4, "#fffef4"); } },
      { y:112, draw(p){ p.R(164, 102, 16, 10, O); p.R(165, 103, 14, 8, "#e8a8c0"); p.R(166, 104, 12, 2, "#f8c8d8"); } },   // 粉紅色的懶骨頭
      // 地上的玩具
      { y:136, draw(p){ penguin(p, 120, 126, false); p.R(140, 130, 8, 6, O); p.R(141, 131, 6, 4, "#3a8ad8"); p.R(104, 132, 10, 4, O); p.R(105, 133, 8, 2, "#e9c43a"); } }
    ],
    front(p, g, t, o){ T.glow(g, 128, 20, 40, "255,230,240", .14); tone(g, this, o, .3); },
    solid:[[184,46,64,78],[8,42,64,36],[8,74,44,22],[116,122,34,16]],
    exits:[ { r:[24,148,32,8], to:"cliving", at:[310,148], label:"一樓客廳", kind:"down", art:[22,144,36,12] } ]
  };

  /* ---------- 保母房：小小的、很整齊，小窗對著廚房後門 ---------- */
  const cmaid = { name:"保母房", w:192, h:136, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 192, 58, "#e8e4d4", "plain", { base:"#8a7a5a" });
      p.R(140, 12, 26, 18, O); p.R(141, 13, 24, 16, "#d8d4c8"); p.R(143, 15, 20, 12, night(o) ? "#1a2232" : "#b8c8d0"); p.R(152, 15, 1, 12, "#d8d4c8");   // 小窗
      // 床頭貼的照片、卡片
      for (const [x, c] of [[20, "#f4d8a8"], [34, "#f8c8d8"], [48, "#d8e8f0"]]){ p.R(x, 14, 12, 10, O); p.R(x + 1, 15, 10, 8, c); p.R(x + 4, 17, 4, 4, "#e8c09a"); }
      laminate(p, 0, 58, 192, 78, "#c8b490");
      T.sides(p, this, "#8a7a5a", [["B", 80, 32]]);
    },
    props:[
      { y:106, draw(p){ p.R(14, 36, 54, 70, O); p.R(15, 37, 52, 12, "#e8e4d8"); p.R(15, 49, 52, 56, "#a8b8c8"); p.R(15, 49, 52, 2, "#98a8b8"); } },   // 單人床（摺得很整齊）
      { y:62, draw(p){ T.box(p, 120, 36, 40, 10, 16, "#8a6a4a", "#6a4a2a"); p.R(128, 32, 10, 6, O); p.R(129, 33, 8, 4, "#f4f0e6"); } },   // 小衣櫃
      { y:106, draw(p){ p.R(76, 98, 12, 6, O); p.R(77, 99, 10, 4, "#8a6a4a"); } },   // 小板凳
      { y:96, draw(p){ T.chair(p, 100, 96, "#6a5a4a", "down"); p.R(94, 80, 14, 10, O); p.R(95, 81, 12, 8, "#8a3a3a"); p.R(98, 79, 6, 2, O); } }   // 椅子上的包包
    ],
    front(p, g, t, o){ fluo(p, 70, 2, 40); tone(g, this, o, .3); },
    solid:[[12,34,58,74],[118,34,44,30],[92,74,16,24]],
    exits:[ { r:[80,128,32,8], to:"cliving", at:[24,84], label:"客廳", kind:"out", art:[78,124,36,12] } ]
  };

  const spots = {
    ev_phone_rec:[80,84,12,10,82,124,"cliving",A("type",{ actT:2, face:-1 })],
    ev_threat:[150,120,8,12,154,152,"cliving",A("phone",{ actT:2 })],
    ev_gpsbag:[172,112,50,16,198,152,"cliving",A("rummage",{ actT:2 })],
    o5_money:[172,112,50,16,186,152,"cliving",A("look")],
    ev_familyphoto:[44,12,40,28,64,76,"cliving",A("look")],
    o5_tv:[278,16,36,24,262,82,"cliving",A("look",{ face:1 })],
    ev_dashcam:[118,96,20,8,150,118,"cgarage",A("reach",{ actT:2, face:-1 })],
    ev_glovebox:[112,104,20,10,148,132,"cgarage",A("rummage",{ actT:1.6, face:-1 })],
    o5_suv:[66,96,70,34,60,140,"cgarage",A("look",{ face:1 })],
    o5_benz:[200,136,72,28,190,120,"cgarage",A("look")],
    ev_drawing:[14,12,170,16,100,84,"ckid",A("look")],
    ev_schedule:[16,46,16,9,26,102,"ckid",A("read",{ actT:2 })],
    o5_invite:[40,46,14,9,62,98,"ckid",A("read",{ actT:1.6 })],
    o5_bear:[187,49,58,14,174,86,"ckid",A("look",{ face:1 })],
    o5_piano:[10,72,40,24,64,112,"ckid",A("look",{ face:-1 })],
    ev_nanny_bag:[94,78,14,12,100,112,"cmaid",A("rummage",{ actT:1.6 })],
    o5_maidroom:[18,12,44,14,80,80,"cmaid",A("look",{ face:-1 })]
  };
  const details = {
    d5_oil:[146,114,26,10,160,138,"cgarage",A("crouch")],
    d5_clock:[94,14,14,14,108,76,"cliving",A("look")],
    d5_window:[96,8,52,32,122,84,"ckid",A("look")],
    d5_maidwin:[140,12,26,18,150,78,"cmaid",A("look")]
  };
  const place = {
    chen:[ { room:"cliving", x:46, y:104, act:"sit", facing:1, view:"side" }, { room:"cliving", x:236, y:150, act:"idle", facing:-1 }, { room:"cliving", x:46, y:104, act:"sit", facing:1, view:"side" } ],
    zhang:[ { room:"ckid", x:172, y:110, act:"sitCry", facing:1, view:"side" }, { room:"ckid", x:172, y:110, act:"sit", facing:1, view:"side" }, { room:"cliving", x:60, y:150, act:"sitCry", facing:1, view:"side" } ],
    uncle:[ { room:"cliving", x:214, y:164, act:"phone", facing:-1 }, null, { room:"cliving", x:214, y:164, act:"cross", facing:-1 } ],
    nanny:[ { room:"cmaid", x:84, y:100, act:"cry", facing:-1 }, { room:"cmaid", x:82, y:104, act:"sit", facing:-1, view:"side" }, { room:"ckid", x:110, y:116, act:"sweep", facing:1 } ],
    ade:[ { room:"cgarage", x:170, y:150, act:"smoke", facing:1 } ],
    zhou:[ { room:"cliving", x:276, y:110, act:"phone", facing:-1 } ],
    wu:[ { room:"cliving", x:104, y:92, act:"kneel", facing:-1 } ]
  };
  const extras = (W0.extras || []);
  const intro = [ { set:{ room:"cgarage", px:170, py:162 }, hide:true }, { wait:0.3, hide:true }, { set:{ room:"cgarage", px:170, py:150 } },
    ...(W0.intro || []).filter(k => k.say || (k.wait && !k.hide)).map(k => k.say && k.say[0] === "wu" && /點畫面上的箭嘴|📍|清單不是全部/.test(k.say[1]) ? null : k).filter(Boolean),
    { say:["wu", "想去哪裡，點畫面上的門口、樓梯就會自己走過去。閃著星星的就是還沒看過的東西，按上面的「🧭 平面圖」看全部在哪裡。"], name:"小吳" } ];
  const plan = [
    { name:"二樓", w:100, h:20, rooms:{ ckid:[56,0,44,20] } },
    { name:"一樓", w:100, h:34, rooms:{ cgarage:[0,0,34,26], cmaid:[34,0,18,12], cliving:[34,12,66,22] } } ];
  setLoc("chenhome", { start:"cgarage", spawn:[170,150], rooms:{ cliving, cgarage, ckid, cmaid }, spots, details, place, extras, intro, plan });
})();

/* ================= 澄港市刑大（之後幾集也在這裡上班）：共用的辦公室，每一集換白板、桌上的東西 =================
   CG_DESK(kit, { board(p,o,t), clutter(p,o,t), props:[], solid:[], meet:"門通往的房間 id", meetOk() 或 false })：回傳 pdesk 房間
   CG_LAB(kit, { props:[], solid:[] })：澄港鑑識中心（小吳的地盤），回傳 lab 房間 */
function CG_DESK(K, opt){
  opt = opt || {};
  const { T, O, sh, dA, ph, tone, window2, fluo } = K;
  const sea = o => (p => (x, y, w, h) => { const S0 = K.SKY(ph(o)); p.R(x, y, w, h, S0[0]); p.R(x, y + h * .6, w, h * .4, K.night(o) ? "#0a1a2a" : "#4a7aa0");
    for (let i = 0; i < w; i += 7){ const bh = 3 + ((i * 5) % 7); p.R(x + i, y + h * .6 - bh, 6, bh, K.night(o) ? "#1a2232" : "#7a8a9a"); } p.R(x + w * .3, y + h * .6 - 6, 1, 6, "#3a3a3a"); p.R(x + w * .3 - 5, y + h * .6 - 2, 12, 2, K.night(o) ? "#2a2a3a" : "#c84a3a"); });
  const meet = opt.meet || "pmeet", noMeet = opt.meetOk === false, ok = noMeet ? () => false : opt.meetOk || (() => true);   // meetOk:false＝這一集沒有會議室（門關著、不能進）
  return { name:"刑大辦公室", w:336, h:168, wall:62,
    floor(p, g, t, o){
      // 老公家機關：上半截淡綠漆、下半截深綠
      p.R(0, 0, 336, 62, "#d8e0d4"); p.R(0, 34, 336, 23, "#5a7a64"); p.R(0, 34, 336, 2, "#7a9a84"); p.R(0, 0, 336, 3, "#c0c8bc"); p.R(0, 57, 336, 5, "#3a4a3e"); p.R(0, 62, 336, 1, O);
      // 窗（百葉窗半開，外面是港口）
      for (const x of [14, 64]){ window2(p, x, 8, 42, 30, o, t, sea(o)(p), "#b8bcb8"); for (let k = 0; k < 6; k++) p.R(x + 1, 9 + k * 3, 40, 1, "rgba(220,220,210,.75)"); }
      // 公布欄
      p.R(124, 6, 70, 40, O); p.R(125, 7, 68, 38, "#a87a4a"); for (let i = 0; i < 4; i++) p.R(128 + i * 16, 10, 12, 14, ["#f4f0e6", "#f4e8a8", "#f4f0e6", "#d8e8f0"][i]); p.R(130, 28, 26, 14, "#f4f0e6"); p.R(132, 30, 22, 2, "#2a3a6a"); p.R(160, 28, 30, 14, "#f4f0e6");
      if (opt.board) opt.board(p, o, t);
      // 匾額「澄港市政府警察局刑事警察大隊」、國旗
      p.R(206, 8, 62, 12, O); p.R(207, 9, 60, 10, "#7a2a1a"); for (let k = 0; k < 8; k++) p.R(210 + k * 7, 12, 4, 4, "#e9c46a");
      p.R(226, 22, 18, 12, O); p.R(227, 23, 16, 10, "#c8302a"); p.R(227, 23, 8, 5, "#1e3a8a"); p.R(230, 25, 2, 2, "#f4f4f0");
      // 往會議室的門
      T.backDoor(p, 288, 18, 26, 44, ok() ? dA("pdesk", meet) : 0, "#8a6a4a", { frame:"#5a4a3a" }); p.R(293, 8, 16, 7, O); p.R(294, 9, 14, 5, "#e8e2d2"); p.R(296, 11, 10, 1, "#2a2a2a");
      // 地：灰綠色的舊塑膠地磚
      K.vinyl(p, 0, 62, 336, 106, "#9aa494", "#929c8c", 16);
      p.R(0, 128, 336, 16, "rgba(255,255,255,.05)");
      T.sides(p, this, "#3a4a3e", [["B", 150, 40]]);
    },
    props:[
      // 你的桌子（窗邊）：一台螢幕（調閱的監視器畫面）
      { y:100, draw(p, g, t, o){ T.box(p, 14, 76, 70, 14, 10, "#8a6a4a", "#6a4a2a"); p.R(20, 66, 22, 14, O); p.R(21, 67, 20, 11, "#1e2226"); p.R(22, 68, 18, 9, "#3a4a5a"); p.R(24, 70, 6, 5, "#5a6a6a"); p.R(28, 79, 6, 2, O);
          p.R(50, 78, 16, 8, O); p.R(51, 79, 14, 6, "#f4f0e6"); p.R(52, 80, 10, 1, "#7a7a8a"); p.R(70, 78, 8, 8, O); p.R(71, 79, 6, 6, "#f4f0e6"); p.R(72, 80, 4, 3, "#4a2a1a"); } },
      { y:108, draw(p){ T.chair(p, 40, 108, "#2a3a2a", "up"); } },
      // 中間一組四張桌子（舊木桌、綠色隔板）
      { y:112, draw(p, g, t, o){ for (const [x, y] of [[112, 86], [176, 86]]){ T.box(p, x, y, 60, 14, 8, "#9a7a5a", "#6a4a2a"); p.R(x + 6, y - 8, 16, 10, O); p.R(x + 7, y - 7, 14, 7, "#1e2226"); p.R(x + 8, y - 6, 12, 5, "#3a5a6a"); }
          p.R(110, 82, 128, 3, O); p.R(111, 83, 126, 1, "#5a7a64"); if (opt.clutter) opt.clutter(p, o, t); } },
      { y:126, draw(p){ for (const x of [140, 206]) T.chair(p, x, 126, "#2a3a2a", "up"); } },
      // 鐵櫃
      { y:84, draw(p){ for (let k = 0; k < 2; k++){ T.box(p, 250 + k * 18, 52, 16, 10, 22, "#8a9088", "#6a7068"); for (let r = 0; r < 3; r++) p.R(254 + k * 18, 66 + r * 6, 8, 1, O); } } },
      // 茶水角：熱水瓶、一疊紙杯
      { y:150, draw(p){ T.box(p, 290, 128, 36, 12, 10, "#8a6a4a", "#6a4a2a"); p.R(296, 120, 8, 12, O); p.R(297, 121, 6, 10, "#c84a3a"); p.R(310, 124, 6, 8, O); p.R(311, 125, 4, 6, "#f4f4f0"); } }
    ].concat(opt.props || []),
    front(p, g, t, o){ fluo(p, 40, 2, 50); fluo(p, 150, 2, 50); fluo(p, 260, 2, 50);
      p.R(166, 0, 2, 8, O); const a = t * 6; for (let k = 0; k < 3; k++){ const c = Math.cos(a + k * 2.1), s2 = Math.sin(a + k * 2.1); p.R(167 + Math.round(c * 9) - 1, 9 + Math.round(s2 * 3), 3, 2, "#5a5e5a"); } p.R(164, 8, 6, 3, O);   // 吊扇
      tone(g, this, o, .4); },
    solid:[[12,64,74,36],[110,78,128,30],[248,48,38,32],[288,118,40,26]].concat(opt.solid || []),
    exits:noMeet ? [] : [ { r:[288,62,26,8], to:meet, at:[144,140], label:"會議室", kind:"door", art:[288,18,26,44], when:() => ok() } ]
  };
}

function CG_LAB(K, opt){
  opt = opt || {};
  const { T, O, sh, ph, tone, fluo, vinyl } = K;
  return { name:"澄港鑑識中心", w:288, h:152, wall:60,
      floor(p, g, t, o){
        T.backWall(p, 0, 288, 60, "#e4e0d4", "plain", { base:"#4a5a6a" });
        // 一排藍色鐵櫃（證物袋、採證工具）
        for (let k = 0; k < 5; k++){ p.R(8 + k * 22, 6, 20, 50, O); p.R(9 + k * 22, 7, 18, 48, "#3a6a9a"); p.R(10 + k * 22, 9, 16, 4, "#f4f4f0"); p.R(24 + k * 22, 28, 1, 6, "#c8ccd0"); }
        // 證物冰箱
        p.R(124, 6, 34, 50, O); p.R(125, 7, 32, 48, "#e8ecec"); p.R(127, 9, 28, 30, "#b8d0d8"); p.R(152, 26, 2, 10, "#8a9aa0"); p.R(128, 42, 12, 4, "#e84a3a");
        // 小吳的牆：基地台位置圖
        p.R(176, 8, 50, 34, O); p.R(177, 9, 48, 32, "#f4f0e6"); for (let k = 0; k < 6; k++){ p.R(182 + (k * 13) % 40, 13 + (k * 7) % 24, 3, 3, "#3a6ad8"); } p.R(196, 22, 8, 8, "rgba(200,48,42,.3)");
        vinyl(p, 0, 60, 288, 92, "#b8c0c4", "#b0b8bc", 18);
        T.sides(p, this, "#4a5a6a", [["B", 128, 32]]);
      },
      props:[
        // 採證台（指紋粉、刷子）
        { y:104, draw(p){ T.box(p, 30, 84, 80, 14, 8, "#c8ccd0", "#8a9094"); for (let k = 0; k < 4; k++){ p.R(36 + k * 10, 86, 6, 8, O); p.R(37 + k * 10, 87, 4, 6, ["#2a2a2a", "#c8c8c8", "#e8b83a", "#3a3a8a"][k]); } p.R(80, 88, 20, 2, "#8a6a4a"); p.R(98, 86, 4, 6, "#2a2a2a"); } },
        // 小吳的 L 型桌：三台螢幕、攤開的地圖
        { y:100, draw(p, g, t){ T.box(p, 180, 70, 96, 14, 10, "#d8d4c8", "#a8a498"); T.box(p, 256, 84, 20, 26, 6, "#d8d4c8", "#a8a498");
            for (let k = 0; k < 3; k++){ p.R(186 + k * 22, 58, 20, 14, O); p.R(187 + k * 22, 59, 18, 11, "#1e2226"); p.R(188 + k * 22, 60, 16, 9, ["#2a5a7a", "#2a6a4a", "#3a3a6a"][k]); p.R(190 + k * 22, 62 + (Math.floor(t * 2 + k) % 4), 8, 1, "#d8e8f0"); }
            p.R(228, 72, 24, 10, O); p.R(229, 73, 22, 8, "#e8e4d0"); p.R(232, 75, 6, 1, "#c8302a"); p.R(240, 77, 6, 1, "#c8302a"); p.R(234, 76, 2, 2, "#c8302a"); } },
        { y:104, draw(p){ T.chair(p, 210, 104, "#2a2a30", "right"); } }
      ].concat(opt.props || []),
      front(p, g, t, o){ fluo(p, 50, 2, 60); fluo(p, 190, 2, 60); tone(g, this, o, .3); },
      solid:[[6,4,112,54],[122,4,38,54],[28,82,84,24],[178,56,100,30],[254,82,24,34]].concat(opt.solid || []),
      exits:[] };
}

/* ================= 小太陽安親班、澄港市刑大、澄港鑑識中心 ================= */
C5T && (() => {
  const { EP, T, O, sh, mix, dA, ph, night, A, roomOk, tone, window2, fluo, sidewalk, laminate, vinyl, setLoc } = C5T;

  /* ---------- 安親班門口：橘黃色的招牌、騎樓、對面是紅線 ---------- */
  const sgate = { name:"安親班門口", w:320, h:164, wall:72,
    floor(p, g, t, o){
      const n = night(o);
      p.R(0, 0, 320, 72, "#e8c890"); for (let x = 0; x < 320; x += 4) p.R(x, 0, 1, 72, "#dcbc84");
      // 招牌（太陽）
      p.R(96, 4, 128, 22, O); p.R(97, 5, 126, 20, "#f4e8a8"); p.R(104, 8, 14, 14, "#e86a2a"); p.R(107, 11, 8, 8, "#f4c43a"); for (let k = 0; k < 6; k++) p.R(124 + k * 15, 10, 11, 10, "#e86a2a");
      // 玻璃門＋兩邊的窗（貼著卡通貼紙）
      T.backDoor(p, 146, 30, 28, 42, dA("sgate", "sroom"), "rgba(200,225,235,.9)", { frame:"#c8ccd0", inside:"#f4e8c8" });
      for (const x of [60, 200]){ p.R(x, 32, 60, 30, O); p.R(x + 1, 33, 58, 28, n ? "#f4e0a8" : "#c8dce8"); p.R(x + 8, 40, 8, 8, "#e86a2a"); p.R(x + 40, 44, 10, 8, "#3a8ad8"); p.R(x + 1, 61, 58, 1, "#c8ccd0"); }
      p.R(0, 66, 320, 6, "#a89070"); p.R(0, 72, 320, 1, O);
      // 騎樓（磁磚）＋人行道＋馬路
      sidewalk(p, 0, 72, 320, 34, "#c8bca8", "#bcb09c"); p.R(0, 106, 320, 3, "#8a8a84");
      p.R(0, 109, 320, 55, "#3a3c40"); for (let x = 10; x < 320; x += 34) p.R(x, 134, 18, 2, "#e8e4d8");
      p.R(0, 156, 320, 4, "#c8302a"); p.R(0, 160, 320, 4, "#8a8a84");   // 對面的紅線
      p.R(64, 150, 16, 4, "rgba(10,10,14,.45)"); p.R(68, 151, 8, 2, "rgba(60,40,80,.35)");   // 一小灘機油
      T.sides(p, this, "#a89070", [["L", 72, 92], ["R", 72, 92], ["B", 0, 320]]);
    },
    props:[
      // 鞋櫃（騎樓下，門的右邊）
      { y:90, draw(p){ T.box(p, 186, 74, 40, 10, 8, "#e8e4d8", "#c8c4b8"); for (let k = 0; k < 5; k++){ p.R(189 + k * 7, 76, 6, 5, ["#f8a8c8", "#3a8ad8", "#e9c43a", "#3aa86a", "#f8a8c8"][k]); } } },
      // 路燈、機車
      { y:108, draw(p, g){ T.streetLamp(p, g, 300, 108); } },
      { y:104, draw(p){ for (const x of [20, 40]){ p.R(x, 88, 8, 16, O); p.R(x + 1, 89, 6, 14, "#c84a3a"); p.R(x + 2, 86, 4, 3, O); } } }
    ],
    front(p, g, t, o){ T.cam(p, 186, 26, -1, t); if (night(o)){ T.glow(g, 160, 50, 60, "255,230,170", .2); T.glow(g, 300, 60, 40, "255,230,170", .2); } tone(g, this, o, .35); },
    solid:[[184,72,44,18],[18,84,32,22],[294,94,10,14]],
    exits:[ { r:[146,72,28,8], to:"sroom", at:[52,138], label:"安親班教室", kind:"door", art:[146,30,28,42] } ]
  };
  /* ---------- 教室・接送櫃台：矮桌子、彩色置物格 ---------- */
  const sroom = { name:"教室・接送櫃台", w:288, h:156, wall:62,
    floor(p, g, t, o){
      T.backWall(p, 0, 288, 62, "#fff4d8", "plain", { base:"#e86a2a" });
      // 置物格（彩色）
      for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++){ p.R(8 + c * 13, 8 + r * 15, 12, 14, O); p.R(9 + c * 13, 9 + r * 15, 10, 12, ["#f8a8c8", "#3a8ad8", "#e9c43a", "#3aa86a", "#e86a2a"][(r + c) % 5]); p.R(10 + c * 13, 13 + r * 15, 8, 7, "#fffef4"); }
      // 白板（明天的功課）
      p.R(96, 6, 84, 40, O); p.R(97, 7, 82, 38, "#f8f8f6"); p.R(97, 42, 82, 3, "#a8a8a8"); for (let k = 0; k < 4; k++) p.R(102, 12 + k * 7, 40 + (k % 2) * 20, 2, "#2a3a8a");
      // 接送規定（海報）
      p.R(196, 8, 26, 34, O); p.R(197, 9, 24, 32, "#fffef4"); p.R(197, 9, 24, 5, "#e86a2a"); for (let k = 0; k < 6; k++) p.R(199, 17 + k * 4, 18, 1, "#5a5a6a"); p.R(199, 37, 12, 2, "#c8302a");
      // 窗
      window2(p, 236, 10, 42, 28, o, t, null, "#f4f4f0");
      laminate(p, 0, 62, 288, 94, "#e8d8b0");
      T.sides(p, this, "#e86a2a", [["B", 36, 32]]);
    },
    props:[
      // 兩組矮桌、小椅子
      { y:104, draw(p){ for (const x of [70, 140]){ T.box(p, x, 86, 50, 14, 6, "#8ad0a8", "#5aa07a"); for (let k = 0; k < 3; k++){ p.R(x + 6 + k * 16, 80, 8, 6, O); p.R(x + 7 + k * 16, 81, 6, 4, ["#f8a8c8", "#e9c43a", "#3a8ad8"][k]); } } } },
      { y:126, draw(p){ for (const x of [80, 104, 150, 174]){ p.R(x - 4, 114, 10, 10, O); p.R(x - 3, 115, 8, 8, "#e9c43a"); } } },
      // 接送櫃台：刷卡機、老師的平板
      { y:118, draw(p){ T.box(p, 214, 96, 66, 14, 12, "#f4f0e0", "#e86a2a"); p.R(220, 92, 12, 10, O); p.R(221, 93, 10, 8, "#2a2e34"); p.R(223, 95, 6, 2, "#6fd46f"); p.R(244, 96, 16, 10, O); p.R(245, 97, 14, 8, "#1e2226"); p.R(246, 98, 12, 6, "#4a8ad8"); } },
      { y:84, draw(p){ T.chair(p, 262, 84, "#e86a2a", "down"); } },
      // 一籃球、繪本架
      { y:148, draw(p){ T.box(p, 160, 136, 44, 8, 6, "#c8a878", "#8a6a4a"); for (let k = 0; k < 6; k++) p.R(164 + k * 6, 130, 5, 8, ["#e84a3a", "#3a8ad8", "#e9c43a", "#3aa86a", "#f8a8c8", "#7a4a8a"][k]); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 60); fluo(p, 180, 2, 60); tone(g, this, o, .25); },
    solid:[[68,78,54,28],[138,78,54,28],[212,88,70,32],[158,128,48,18]],
    exits:[ { r:[36,148,32,8], to:"sgate", at:[160,86], label:"門口", kind:"out", art:[34,144,36,12] } ]
  };
  setLoc("school", { start:"sgate", spawn:[160,124], rooms:{ sgate, sroom },
    spots:{
      cctv_school:[178,20,16,10,176,88,"sgate",A("look",{ actT:2 })],
      o5_shoes:[186,74,40,10,206,98,"sgate",A("crouch")],
      o5_road:[60,146,24,10,72,140,"sgate",A("crouch")],
      doc_cardlog:[220,92,12,10,226,128,"sroom",A("type",{ actT:2 })],
      ev_app_msg:[244,96,16,10,252,128,"sroom",A("type",{ actT:2 })],
      o5_rules:[196,8,26,34,208,76,"sroom",A("read",{ actT:1.6 })],
      o5_board:[96,6,84,40,134,74,"sroom",A("look")]
    },
    details:{ d5_redline:[0,154,320,6,250,146,"sgate",A("look")], d5_cubby:[8,8,66,46,40,76,"sroom",A("look")] },
    place:{ liu:[ { room:"sroom", x:226, y:136, act:"cry", facing:-1 }, { room:"sroom", x:104, y:120, act:"sit", facing:1, view:"side" } ] },
    plan:[ { name:"小太陽安親班", w:100, h:30, rooms:{ sroom:[0,0,100,16], sgate:[0,16,100,14,"out"] } } ] });

  /* ---------- 澄港市刑大：刑大辦公室＋專案會議室 ---------- */
  const pdesk = CG_DESK(C5T, {
    board(p){ p.R(178, 10, 12, 16, "#f4f0e6"); p.R(180, 12, 8, 6, "#e8c09a"); p.R(180, 19, 8, 5, "#c84a6a"); },   // 語彤的照片
    clutter(p){ for (let k = 0; k < 4; k++){ p.R(200, 84 - k * 3, 18, 4, O); p.R(201, 85 - k * 3, 16, 2, k % 2 ? "#e8d8b0" : "#c84a3a"); } }   // 一疊便當
  });
  const pmeet = { name:"專案會議室", w:288, h:156, wall:62,
    floor(p, g, t, o){
      T.backWall(p, 0, 288, 62, "#d8dcd4", "plain", { base:"#4a544a" });
      // 澄港市大地圖（南澳在最南邊）
      p.R(54, 4, 150, 52, O); p.R(55, 5, 148, 50, "#e8e4d0"); p.R(55, 40, 148, 15, "#9ac0d8"); p.R(160, 34, 43, 21, "#9ac0d8");
      for (let k = 0; k < 9; k++) p.R(62 + k * 15, 10 + (k % 3) * 8, 10, 6, "#c8c0a8"); p.R(60, 30, 140, 1, "#c8302a"); p.R(120, 8, 1, 34, "#c8302a");
      for (const [x, y] of [[80, 24], [140, 18], [176, 38]]){ p.R(x, y, 3, 3, "#e84a3a"); p.R(x - 2, y - 2, 7, 1, "#e84a3a"); }
      // 咖啡機（右）
      T.box(p, 236, 34, 40, 10, 14, "#8a6a4a", "#6a4a2a"); p.R(246, 20, 16, 18, O); p.R(247, 21, 14, 16, "#2a2a2e"); p.R(250, 30, 8, 4, "#c84a3a"); p.R(252 + Math.round(Math.sin(t * 3)), 14, 2, 4, "rgba(230,230,230,.5)");
      vinyl(p, 0, 62, 288, 94, "#a4ac9c", "#9ca494", 16);
      T.sides(p, this, "#4a544a", [["B", 128, 32]]);
    },
    props:[
      // 長桌：無線電、追蹤設備（筆電＋電話＋錄音機）
      { y:116, draw(p, g, t, o){ T.box(p, 56, 84, 176, 20, 8, "#8a6a4a", "#6a4a2a");
          for (let k = 0; k < 4; k++){ p.R(66 + k * 12, 86, 6, 12, O); p.R(67 + k * 12, 87, 4, 10, "#2a2a2e"); p.R(68 + k * 12, 84, 1, 4, O); p.R(68 + k * 12, 89, 2, 1, Math.floor(t * 2 + k) % 2 ? "#6fd46f" : "#2a5a2a"); }
          p.R(150, 86, 24, 14, O); p.R(151, 87, 22, 12, "#3a3e44"); p.R(153, 88, 18, 8, "#2a6a8a"); p.R(180, 88, 14, 8, O); p.R(181, 89, 12, 6, "#e8e4d8"); p.R(198, 88, 12, 8, O); p.R(199, 89, 10, 6, "#3a3e44"); p.R(201, 91, 2, 2, "#e84a3a"); } },
      { y:80, draw(p){ for (const x of [90, 130, 170, 210]) T.chair(p, x, 80, "#2a3a2a", "down"); } },
      { y:128, draw(p){ for (const x of [90, 130, 210]) T.chair(p, x, 128, "#2a3a2a", "up"); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 60); fluo(p, 180, 2, 60); tone(g, this, o, .4); },
    solid:[[54,82,180,30],[234,30,44,32]],
    exits:[ { r:[128,148,32,8], to:"pdesk", at:[301,76], label:"刑大辦公室", kind:"out", art:[126,144,36,12] } ]
  };
  const W0 = EP.world.police || {};
  setLoc("police", { start:"pdesk", spawn:[170,154], rooms:{ pdesk, pmeet },
    spots:{
      cctv_store:[20,66,22,14,38,116,"pdesk",A("type",{ actT:2 })],
      doc_ferry:[128,26,30,18,150,70,"pdesk",A("read",{ actT:2 })],
      ev_trace:[150,86,60,14,180,124,"pmeet",A("type",{ actT:2.4 })],
      o5_map:[54,4,150,52,120,74,"pmeet",A("look")],
      o5_radio:[64,84,48,14,72,124,"pmeet",A("pickup")]
    },
    details:{ d5_bento:[198,74,22,14,224,124,"pdesk",A("look")], d5_coffee:[236,20,40,28,240,76,"pmeet",A("look")] },
    place:{
      zhou:[null, { room:"pmeet", x:228, y:122, act:"cross", facing:-1 }, { room:"pmeet", x:228, y:122, act:"phone", facing:-1 }],
      yeq:[null, { room:"pmeet", x:40, y:100, act:"read", facing:1 }]
    },
    extras:(W0.extras || []).map(e => e.id === "han" ? { ...e, room:"pdesk", x:250, y:120, act:"hold", facing:-1 } : e),
    plan:[ { name:"澄港市刑大", w:100, h:30, rooms:{ pdesk:[0,0,64,30], pmeet:[64,0,36,22] } } ] });

  /* ---------- 澄港鑑識中心：藍色鐵櫃、三台螢幕的小吳座位 ---------- */
  setLoc("lab", { start:"lab", spawn:[144,140],
    rooms:{ lab:CG_LAB(C5T) },
    spots:{ o5_wudesk:[228,72,24,10,240,96,"lab",A("look")] },
    details:{ d5_screen:[186,58,64,14,196,96,"lab",A("look")] },
    place:{ wu:[null, { room:"lab", x:210, y:100, act:"sit", facing:1, view:"side" }] },
    plan:[ { name:"澄港鑑識中心", w:100, h:20, rooms:{ lab:[0,0,100,20] } } ] });
})();

/* ================= 陳氏建設（港灣大樓）、徐志賢的租屋、順風租車、南澳漁港 ================= */
C5T && (() => {
  const { EP, T, O, sh, mix, dA, ph, night, A, has, tone, window2, cityView, fluo, concrete, tin, laminate, vinyl, carpetTiles, wetCement, setLoc } = C5T;
  const GUARD = { skin:"#d8a880", hair:"#5a5a5a", hairStyle:"short", top:"#2a3a5a", bottom:"#2a2f3a", hat:"police", tie:"#1a2236" };
  const harbourView = o => (p => (x, y, w, h) => { const S0 = C5T.SKY(ph(o)); p.R(x, y, w, h, S0[0]); p.R(x, y + h * .5, w, h * .5, "#4a7aa0"); for (let i = 0; i < w; i += 9){ const bh = 4 + (i * 3) % 8; p.R(x + i, y + h * .5 - bh, 8, bh, "#7a8a9a"); }
    for (let k = 0; k < 3; k++){ p.R(x + 20 + k * w / 3, y + h * .5 + 6 + k * 4, 16, 3, "#e8e8e4"); p.R(x + 24 + k * w / 3, y + h * .5 + 3 + k * 4, 6, 3, "#c84a3a"); } for (let k = 0; k < 4; k++) p.R(x + 4 + k * w / 4, y + h * .5 - 16, 1, 12, "#5a5a5a"); });
  // 深灰花崗岩（亮面）
  const granite = (p, x, y, w, h) => { p.R(x, y, w, h, "#4a4c50"); p.seed(73); for (let k = 0; k < w * h / 6; k++) p.R(x + p.rnd() * w, y + p.rnd() * h, 1, 1, ["#5a5c60", "#3a3c40", "#6a6c70", "#2a2c30"][k % 4]);
    for (let i = x; i < x + w; i += 48) p.R(i, y, 1, h, "#2a2c30"); for (let j = y; j < y + h; j += 48) p.R(x, j, w, 1, "#2a2c30"); for (let i = x + 30; i < x + w; i += 96) p.R(i, y + 2, 14, h - 4, "rgba(255,255,255,.035)"); };

  /* ---------- 港灣大樓大廳：花崗岩、木格柵牆、建案模型 ---------- */
  const clobby = { name:"港灣大樓大廳", w:352, h:172, wall:70,
    floor(p, g, t, o){
      p.R(0, 0, 352, 70, "#8a6a4a"); for (let x = 0; x < 352; x += 6) p.R(x, 0, 3, 64, "#9a7a58"); p.R(0, 64, 352, 6, "#2a2c30"); p.R(0, 70, 352, 1, O);
      // 樓層指示牌
      p.R(90, 10, 60, 40, O); p.R(91, 11, 58, 38, "#2a2c30"); for (let k = 0; k < 6; k++){ p.R(95, 15 + k * 6, 8, 4, "#c8a050"); p.R(106, 16 + k * 6, 36 - (k % 3) * 6, 2, "#d8d8d0"); }
      // 兩部電梯
      for (const [x, to] of [[220, "c8f"], [270, "cfin"]]){ p.R(x - 2, 12, 40, 58, O); p.R(x, 14, 36, 56, "#9a9ca0"); const op = Math.round(15 * dA("clobby", to)); p.R(x + 2, 16, 32, 54, "#1a1a1e"); p.R(x + 2, 16, 16 - op, 54, "#c8ccd0"); p.R(x + 18 + op, 16, 16 - op, 54, "#c8ccd0"); p.R(x + 13, 6, 10, 5, O); p.R(x + 14, 7, 8, 3, "#e84a3a"); }
      granite(p, 0, 70, 352, 102);
      // 右邊：往地下室的樓梯口
      p.R(345, 96, 7, 40, "#2a2a2e"); for (let k = 0; k < 5; k++) p.R(345, 98 + k * 8, 7, 3, "#4a4a4e");
      p.R(140, 166, 72, 6, "#9ab0c0"); p.R(175, 166, 2, 6, "#c8d0d4");
      T.sides(p, this, "#2a2c30", [["R", 96, 40], ["B", 140, 72]]);
    },
    props:[
      // 警衛台：監視器螢幕、警衛
      { y:110, draw(p, g, t){ SP.draw(g, 44, 92, GUARD, { view:"side", facing:1, act:"sit", f:0 }); T.box(p, 20, 90, 64, 14, 12, "#2a2c30", "#1a1c20"); p.R(20, 102, 64, 2, "#c8a050");
          for (let k = 0; k < 3; k++){ p.R(26 + k * 18, 84, 16, 10, O); p.R(27 + k * 18, 85, 14, 7, "#1e2226"); p.R(28 + k * 18, 86, 12, 5, ["#3a4a5a", "#2a4a3a", "#3a3a4a"][k]); } } },
      // 建案模型（玻璃罩）＋獎盃
      { y:132, draw(p){ T.box(p, 136, 104, 80, 22, 10, "#f4f2ec", "#c8c4bc"); for (let k = 0; k < 5; k++){ const h = 10 + (k * 7) % 16; p.R(146 + k * 13, 116 - h, 10, h + 4, O); p.R(147 + k * 13, 117 - h, 8, h + 2, k === 2 ? "#a8c8e8" : "#e8e8e4"); }
          p.R(140, 120, 72, 4, "#6aa0c8"); p.R(136, 92, 80, 34, "rgba(220,235,245,.18)"); p.R(136, 92, 80, 1, "#f4f8ff"); p.R(204, 98, 8, 10, O); p.R(205, 99, 6, 8, "#e9c43a"); } },
      // 地下室入口的菸灰桶
      { y:142, draw(p){ p.R(326, 122, 12, 20, O); p.R(327, 123, 10, 18, "#8a8e92"); p.R(327, 123, 10, 3, "#5a5e62"); p.R(330, 124, 4, 1, "#f4f0e6"); } },
      { y:168, draw(p){ T.plant(p, 120, 166, true, "#2a5a3a"); T.plant(p, 232, 166, true, "#2a5a3a"); } }
    ],
    front(p, g, t, o){ for (const x of [60, 176, 290]){ p.R(x - 8, 0, 16, 3, O); p.R(x - 7, 1, 14, 1, "#f4f0e0"); T.glow(g, x, 20, 50, "255,240,210", .1); } tone(g, this, o, .3); },
    solid:[[18,82,68,34],[134,90,84,46],[324,120,16,24],[110,150,20,18],[222,150,20,18]],
    exits:[ { r:[220,70,36,8], to:"c8f", at:[48,138], label:"8 樓・副總辦公室", kind:"up", art:[218,12,40,58] },
            { r:[270,70,36,8], to:"cfin", at:[40,134], label:"7 樓・財務部", kind:"up", art:[268,12,40,58] } ]
  };
  /* ---------- 8 樓副總辦公室：整面窗看港口 ---------- */
  const c8f = { name:"8 樓副總辦公室", w:288, h:152, wall:62,
    floor(p, g, t, o){
      T.backWall(p, 0, 288, 62, "#e8e4dc", "plain", { base:"#3a3430" });
      p.R(112, 4, 170, 54, O); p.R(113, 5, 168, 52, "#c8c4bc"); harbourView(o)(p)(115, 7, 164, 48); for (const x of [168, 224]) p.R(x, 7, 2, 48, "#c8c4bc");
      // 無線網路基地台（牆上）、獎狀
      p.R(26, 16, 16, 10, O); p.R(27, 17, 14, 8, "#f4f4f0"); p.R(30, 22, 2, 1, "#3aa86a"); p.R(34, 22, 2, 1, "#3a8ad8"); p.R(28, 12, 1, 5, O); p.R(39, 12, 1, 5, O);
      p.R(58, 10, 30, 22, O); p.R(59, 11, 28, 20, "#c8a050"); p.R(61, 13, 24, 16, "#f8f4e8"); p.R(64, 16, 18, 1, "#8a1a1a");
      carpetTiles(p, 0, 62, 288, 90, "#5a5a62", "#54545c");
      T.sides(p, this, "#3a3430", [["B", 32, 32]]);
    },
    props:[
      // 大桌子：桌曆、手機、菸灰缸
      { y:106, draw(p){ T.box(p, 120, 82, 90, 16, 8, "#3a2a1e", "#2a1e14"); p.R(130, 84, 16, 10, O); p.R(131, 85, 14, 8, "#f4f0e6"); p.R(131, 85, 14, 2, "#c84a3a"); for (let k = 0; k < 3; k++) p.R(133, 89 + k * 2, 10, 1, "#7a7a8a");
          p.R(160, 84, 20, 12, O); p.R(161, 85, 18, 10, "#1e2226"); p.R(186, 86, 8, 6, O); p.R(187, 87, 6, 4, "#8a8e92"); } },
      { y:104, draw(p){ T.chair(p, 220, 102, "#1a1a1e", "left"); } },
      // 沙發、茶几
      { y:142, draw(p){ T.box(p, 160, 126, 90, 10, 8, "#2a2a2e", "#1a1a1e"); T.box(p, 180, 110, 50, 10, 4, "#c8c4bc", "#8a8478"); } },
      { y:84, draw(p){ T.box(p, 8, 64, 40, 10, 12, "#3a2a1e", "#2a1e14"); for (let k = 0; k < 4; k++) p.R(12 + k * 9, 58, 6, 8, ["#c8a050", "#2a3a6a", "#8a1a1a", "#3a6a3a"][k]); } }
    ],
    front(p, g, t, o){ tone(g, this, o, .3); },
    solid:[[118,80,94,26],[158,124,94,22],[178,108,54,14],[6,56,44,30]],
    exits:[ { r:[32,144,32,8], to:"clobby", at:[238,86], label:"電梯（大廳）", kind:"down", art:[30,140,36,12] } ]
  };
  /* ---------- 財務部：一排帳冊、碎紙機滿了 ---------- */
  const cfin = { name:"財務部", w:272, h:148, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 272, 60, "#e0e0d8", "plain", { base:"#5a5a5a" });
      // 帳冊櫃（整排）
      for (let k = 0; k < 4; k++){ p.R(90 + k * 38, 6, 36, 50, O); p.R(91 + k * 38, 7, 34, 48, "#8a9094"); for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) p.R(93 + k * 38 + c * 6, 10 + r * 15, 5, 12, ["#2a3a6a", "#8a1a2a", "#2a5a3a", "#5a4a2a", "#2a3a6a"][(r + c + k) % 5]); }
      window2(p, 14, 10, 56, 30, o, t, cityView(p, o), "#c8ccd0");
      vinyl(p, 0, 60, 272, 88, "#c8c4b8", "#c0bcb0", 16);
      T.sides(p, this, "#5a5a5a", [["B", 24, 32]]);
    },
    props:[
      // 兩排會計的桌子
      { y:112, draw(p){ for (const x of [80, 160]){ T.box(p, x, 92, 70, 14, 8, "#d8d4c8", "#a8a498"); p.R(x + 6, 82, 18, 12, O); p.R(x + 7, 83, 16, 9, "#1e2226"); p.R(x + 8, 84, 14, 7, "#3a5a6a"); for (let k = 0; k < 3; k++){ p.R(x + 40, 94 - k * 2, 18, 3, O); p.R(x + 41, 95 - k * 2, 16, 1, "#f4f0e6"); } } p.R(170, 96, 14, 8, O); p.R(171, 97, 12, 6, "#f4f4f0"); p.R(172, 98, 8, 1, "#c84a3a"); } },
      { y:128, draw(p){ for (const x of [104, 184]) T.chair(p, x, 128, "#3a3a44", "up"); } },
      // 碎紙機（桶子滿了）
      { y:84, draw(p){ T.box(p, 240, 60, 22, 8, 16, "#2a2a2e", "#1a1a1e"); p.R(242, 56, 18, 6, "#f4f4f0"); for (let k = 0; k < 6; k++) p.R(243 + k * 3, 54 - (k % 2), 1, 3, "#f4f4f0"); } }
    ],
    front(p, g, t, o){ fluo(p, 70, 2, 60); fluo(p, 190, 2, 60); tone(g, this, o, .3); },
    solid:[[78,80,74,34],[158,80,74,34],[238,52,26,34]],
    exits:[ { r:[24,140,32,8], to:"clobby", at:[288,86], label:"電梯（大廳）", kind:"down", art:[22,136,36,12] } ]
  };
  setLoc("company", { start:"clobby", spawn:[176,158], rooms:{ clobby, c8f, cfin },
    spots:{
      cctv_clobby:[26,84,52,10,52,124,"clobby",A("type",{ actT:2 })],
      o5_model:[136,92,80,34,176,146,"clobby",A("look")],
      o5_cig:[326,122,12,20,314,140,"clobby",A("crouch",{ face:1 })],
      ev_uncle_desk:[130,84,16,10,138,116,"c8f",A("read",{ actT:1.6 })],
      ev_wifi:[26,12,16,14,34,94,"c8f",A("reach",{ actT:2 })],
      doc_ledger:[90,6,150,50,130,70,"cfin",A("rummage",{ actT:2.4 })],
      doc_vendor:[170,96,14,8,174,138,"cfin",A("read",{ actT:2 })]
    },
    details:{ d5_guard:[20,84,64,30,96,124,"clobby",A("look",{ face:-1 })], d5_view:[115,7,164,48,100,80,"c8f",A("look",{ face:1 })], d5_shred:[240,52,22,24,250,98,"cfin",A("look",{ face:-1 })] },
    place:{ uncle:[null, { room:"c8f", x:220, y:100, act:"sit", facing:-1, view:"side" }], huang:[null, { room:"clobby", x:250, y:124, act:"cross", facing:-1 }] },
    plan:[ { name:"8 樓", w:100, h:14, rooms:{ c8f:[40,0,60,14] } }, { name:"7 樓", w:100, h:14, rooms:{ cfin:[40,0,60,14] } }, { name:"大廳", w:100, h:22, rooms:{ clobby:[0,0,100,22] } } ] });

  /* ---------- 舊港區的頂樓加蓋：薄薄的隔間板、一個人住 ---------- */
  setLoc("xuhome", { start:"xroom", spawn:[120,128],
    rooms:{ xroom:{ name:"徐志賢的租屋", w:240, h:140, wall:58,
      floor(p, g, t, o){
        T.backWall(p, 0, 240, 58, "#c8d4d8", "plain", { base:"#5a6268" }); for (let x = 0; x < 240; x += 40) p.R(x, 0, 1, 53, "#a8b4b8");
        p.seed(3); for (let k = 0; k < 6; k++){ const x = p.rnd() * 230; p.R(x, 0, 10 + p.rnd() * 14, 8 + p.rnd() * 10, "rgba(120,110,80,.18)"); }   // 漏水的水漬
        // 小窗、月曆
        window2(p, 60, 10, 34, 22, o, t, null, "#b8bcc0");
        p.R(118, 8, 24, 30, O); p.R(119, 9, 22, 28, "#fffef4"); p.R(119, 9, 22, 6, "#c8302a"); for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) p.R(121 + c * 3, 17 + r * 4, 2, 2, "#8a8a8a"); p.R(130, 21, 4, 4, "rgba(200,48,42,.6)");
        p.R(0, 58, 240, 82, "#9a9890"); for (let j = 58; j < 140; j += 10) p.R(0, j, 240, 1, "#8a8880");   // 水泥地（磨石子掉了）
        p.R(108, 132, 18, 4, "#f4f0e6"); p.R(110, 133, 12, 1, "#c8302a");   // 門縫塞進來的催債單
        T.sides(p, this, "#5a6268", [["B", 100, 40]]);
      },
      props:[
        // 床（被子摺得整整齊齊）
        { y:104, draw(p){ p.R(10, 46, 56, 58, O); p.R(11, 47, 54, 10, "#e8e4d8"); p.R(11, 57, 54, 46, "#7a8aa0"); p.R(30, 80, 22, 14, O); p.R(31, 81, 20, 12, "#a8b8c8"); } },
        // 小桌子＋垃圾桶
        { y:100, draw(p){ T.box(p, 120, 80, 44, 12, 8, "#8a7a5a", "#6a5a3a"); p.R(126, 76, 10, 6, O); p.R(127, 77, 8, 4, "#e8e4d8"); p.R(170, 90, 12, 12, O); p.R(171, 91, 10, 10, "#5a6a5a"); p.R(172, 88, 8, 4, "#d8c8a8"); } },
        // 冰箱（貼著照片）
        { y:84, draw(p){ T.box(p, 196, 34, 30, 10, 40, "#e8e8e4", "#c8c8c4"); p.R(200, 46, 12, 10, O); p.R(201, 47, 10, 8, "#a8c8d8"); p.R(203, 50, 3, 4, "#3a3a3a"); p.R(207, 50, 3, 4, "#3a3a3a"); } },
        // 門邊的塑膠袋
        { y:132, draw(p){ p.R(136, 116, 18, 16, O); p.R(137, 117, 16, 14, "#f4f4f0"); p.R(139, 115, 4, 3, O); p.R(147, 115, 4, 3, O); p.R(140, 120, 6, 4, "#f8a8c8"); p.R(146, 124, 5, 4, "#e9c43a"); } }
      ],
      front(p, g, t, o){ p.R(118, 0, 2, 10, O); p.R(114, 10, 10, 3, O); p.R(115, 11, 8, 1, "#f4f0e0"); T.glow(g, 120, 30, 40, "255,240,210", .14); tone(g, this, o, .35); },
      solid:[[8,44,60,62],[118,76,48,26],[168,86,16,16],[194,30,34,56],[134,112,22,22]],
      exits:[] } },
    spots:{
      ev_xu_cal:[118,8,24,30,130,68,"xroom",A("look")],
      ev_vc_box:[170,88,12,14,176,112,"xroom",A("rummage",{ actT:1.6, face:-1 })],
      ev_debt:[106,130,22,6,112,122,"xroom",A("pickup")],
      o5_snacks:[136,116,18,16,166,124,"xroom",A("rummage",{ actT:1.6, face:-1 })],
      o5_xuphoto:[200,46,12,10,210,98,"xroom",A("look")]
    },
    details:{ d5_bed:[10,46,56,58,80,96,"xroom",A("look",{ face:-1 })] },
    place:{ land:[null, { room:"xroom", x:96, y:126, act:"cross", facing:1 }] },
    plan:[ { name:"徐志賢的租屋", w:100, h:20, rooms:{ xroom:[0,0,100,20] } } ] });

  /* ---------- 順風租車：一個小櫃檯、鑰匙板、燈箱招牌 ---------- */
  setLoc("rental", { start:"rshop", spawn:[128,128],
    rooms:{ rshop:{ name:"順風租車", w:256, h:140, wall:60,
      floor(p, g, t, o){
        T.backWall(p, 0, 256, 60, "#e8e8e4", "plain", { base:"#2a6ab8" });
        // 燈箱招牌（裡面那一面）
        p.R(70, 6, 116, 16, O); p.R(71, 7, 114, 14, "#2a6ab8"); p.R(76, 10, 50, 8, "#f4f4f0"); p.R(132, 11, 48, 3, "#e9c43a"); p.R(132, 15, 36, 2, "#f4f4f0");
        // 鑰匙板
        p.R(192, 10, 48, 36, O); p.R(193, 11, 46, 34, "#a87a4a"); for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++){ p.R(196 + c * 7, 14 + r * 11, 1, 4, "#c8ccd0"); p.R(195 + c * 7, 18 + r * 11, 4, 4, (r * 6 + c) === 7 ? "#a87a4a" : "#2a6ab8"); }
        // 價目表
        p.R(14, 10, 40, 30, O); p.R(15, 11, 38, 28, "#fffef4"); for (let k = 0; k < 5; k++) p.R(18, 15 + k * 5, 30, 1, "#5a5a6a"); p.R(18, 14, 18, 2, "#c8302a");
        laminate(p, 0, 60, 256, 80, "#c8c0b0");
        // 前面：玻璃門、外面停著幾台車
        p.R(100, 134, 56, 6, "#9ab0c0"); p.R(127, 134, 2, 6, "#c8d0d4");
        T.sides(p, this, "#2a6ab8", [["B", 100, 56]]);
      },
      props:[
        // 櫃檯：租車合約、計算機
        { y:98, draw(p){ T.box(p, 88, 76, 100, 12, 12, "#f4f4f0", "#2a6ab8"); p.R(100, 78, 16, 8, O); p.R(101, 79, 14, 6, "#f4f0e6"); for (let k = 0; k < 3; k++) p.R(103, 80 + k * 2, 10, 1, "#7a7a8a"); p.R(150, 78, 10, 8, O); p.R(151, 79, 8, 6, "#3a3e44"); } },
        { y:76, draw(p){ T.chair(p, 150, 74, "#2a2a30", "left"); } },
        // 等候的椅子、飲水機
        { y:120, draw(p){ for (const x of [24, 44]) T.chair(p, x, 120, "#2a6ab8", "up"); } },
        { y:84, draw(p){ T.box(p, 226, 62, 14, 10, 14, "#e8ecec", "#c8d0d0"); p.R(228, 50, 10, 12, O); p.R(229, 51, 8, 10, "#a8d0f0"); } }
      ],
      front(p, g, t, o){ fluo(p, 60, 2, 50); fluo(p, 170, 2, 50); T.glow(g, 128, 14, 40, "120,170,240", .12); tone(g, this, o, .3); },
      solid:[[86,70,104,32],[14,104,40,18],[224,48,18,38]],
      exits:[] } },
    spots:{ doc_rent:[100,78,16,8,110,112,"rshop",A("read",{ actT:2 })], o5_keys:[192,10,48,36,214,80,"rshop",A("look")] },
    details:{ d5_sign:[70,6,116,16,70,112,"rshop",A("look")] },
    place:{ rent:[null, { room:"rshop", x:150, y:72, act:"sit", facing:-1, view:"side" }] },
    plan:[ { name:"順風租車", w:100, h:20, rooms:{ rshop:[0,0,100,20] } } ] });

  /* ---------- 南澳漁港：一排鐵皮倉庫、碼頭、渡輪 ---------- */
  const van = (p, x, y) => { p.R(x - 1, y - 30, 58, 31, O); p.R(x, y - 29, 56, 22, "#ecebe6"); p.R(x + 40, y - 27, 14, 9, "#5a7090"); p.R(x + 4, y - 26, 30, 2, "#e9c43a"); p.R(x, y - 7, 56, 3, "#8a8e92");
    for (const wx of [x + 10, x + 44]){ p.R(wx - 5, y - 6, 10, 7, O); p.R(wx - 4, y - 5, 8, 5, "#2a2a2e"); p.R(wx - 1, y - 3, 2, 2, "#8a8e92"); } p.R(x + 2, y - 33, 52, 3, O); p.R(x + 3, y - 32, 50, 1, "#5a5e62"); };
  const hpier = { name:"南澳漁港碼頭", w:352, h:168, wall:70,
    floor(p, g, t, o){
      // 一排鐵皮倉庫（中間那間是志明漁具）
      tin(p, 0, 120, 70, "#7a8a96"); tin(p, 120, 70, 70, "#8a7a5a"); tin(p, 190, 110, 70, "#6a8a8a"); p.R(300, 0, 52, 70, "#5a5e62"); p.R(300, 0, 2, 70, O);
      p.R(126, 6, 58, 10, "#f4f0e6"); p.R(130, 8, 30, 6, "#2a5a7a"); p.R(164, 9, 16, 4, "#c8302a");
      T.backDoor(p, 140, 26, 30, 44, dA("hpier", "hshed"), "#6a5a3a", { frame:"#3a2a1a" });
      for (const x of [20, 210]){ p.R(x, 20, 60, 50, O); p.R(x + 1, 21, 58, 49, "#9aa0a6"); for (let j = 23; j < 70; j += 3) p.R(x + 1, j, 58, 1, "#8a9096"); }
      // 碼頭（水泥）
      concrete(p, 0, 70, 352, 62, "#a8a8a0", 19);
      for (let x = 20; x < 352; x += 70){ p.R(x, 124, 8, 8, O); p.R(x + 1, 125, 6, 6, "#3a3a3a"); }   // 繫船柱
      // 海
      p.R(0, 132, 352, 36, "#3a6a8a"); for (let k = 0; k < 30; k++) p.R((k * 37 + t * 8) % 352, 136 + (k * 13) % 30, 8, 1, "#6a9ab8");
      p.R(0, 132, 352, 2, "#2a4a5a");
      T.sides(p, this, "#5a5e62", [["L", 70, 62], ["R", 70, 62], ["B", 0, 352]]);
    },
    props:[
      // 倉庫後面（最右邊的巷子）露出半台白色廂型車
      { y:70, draw(p){ van(p, 302, 68); p.R(300, 36, 4, 34, "#5a5e62"); } },
      // 渡輪（白色、船身藍線）
      { y:168, draw(p, g, t){ const b = Math.round(Math.sin(t * 1.5)); p.R(30, 136 + b, 190, 30, O); p.R(31, 137 + b, 188, 28, "#f4f4f0"); p.R(31, 155 + b, 188, 4, "#2a5a9a"); p.R(70, 128 + b, 100, 12, O); p.R(71, 129 + b, 98, 10, "#e8e8e4");
          for (let k = 0; k < 8; k++) p.R(76 + k * 12, 131 + b, 8, 5, "#3a5a7a"); p.R(150, 118 + b, 8, 12, O); p.R(151, 119 + b, 6, 10, "#c8302a"); p.R(40, 158 + b, 60, 2, "#2a2a2a"); } },
      // 警車（徐志賢被銬在旁邊）
      { y:116, draw(p, g, t, o){ if (ph(o) >= 2){ p.R(219, 106, 16, 10, O); p.R(220, 107, 14, 8, "#3a8ad8"); p.R(220, 107, 14, 2, "#5aa0e8"); } } },
      { y:118, draw(p, g, t, o){ if (ph(o) >= 2) SP.car(g, 268, 118, { col:"#f4f2ee", patrol:true, facing:-1, f:0 }); } },
      // 魚箱、漁網堆
      { y:94, draw(p){ for (let k = 0; k < 3; k++){ T.box(p, 40 + k * 22, 78 - (k % 2) * 6, 20, 8, 8, "#3a8ad8", "#2a6aa8"); } T.box(p, 180, 80, 30, 10, 6, "#4a6a4a", "#3a5a3a"); } }
    ],
    front(p, g, t, o){ for (let k = 0; k < 3; k++){ const x = (k * 110 + t * (14 + k * 4)) % 380 - 20, y = 18 + k * 10 + Math.sin(t * 3 + k) * 3, w = Math.floor(t * 6 + k) % 2; p.R(x, y, 3, 2, "#f4f4f0"); p.R(x - 3, y - 1 - w, 3, 1, "#f4f4f0"); p.R(x + 3, y - 1 - w, 3, 1, "#f4f4f0"); } tone(g, this, o, .3); },
    solid:[[300,30,52,40],[0,132,352,36],[38,70,66,24],[178,78,34,18],[232,84,72,36]],
    exits:[ { r:[140,70,30,8], to:"hshed", at:[136,132], label:"志明漁具倉庫", kind:"door", art:[140,26,30,44] } ]
  };
  const hshed = { name:"志明漁具倉庫", w:272, h:150, wall:62,
    floor(p, g, t, o){
      tin(p, 0, 272, 62, "#8a7a5a");
      for (let k = 0; k < 4; k++) p.R(20 + k * 64 + ((Math.floor(t * 3) + k) % 2), 2, 30, 2, "rgba(255,240,200,.35)");   // 鐵皮縫透進來的光
      // 牆上：一圈一圈的繩子、浮標
      for (let k = 0; k < 3; k++){ p.R(170 + k * 26, 12, 20, 20, O); p.R(171 + k * 26, 13, 18, 18, "#c8a050"); p.R(176 + k * 26, 18, 8, 8, "#8a7a5a"); }
      for (let k = 0; k < 5; k++){ p.R(172 + k * 14, 38, 8, 8, O); p.R(173 + k * 14, 39, 6, 6, k % 2 ? "#e86a2a" : "#f4f4f0"); }
      wetCement(p, 0, 62, 272, 88, o, t);
      p.R(214, 96, 6, 6, "#f4f4f0"); p.R(215, 97, 4, 4, "#1e2a3a");   // 地上的小企鵝貼紙
      T.sides(p, this, "#5a4a3a", [["B", 120, 32]]);
    },
    props:[
      // 一大堆漁網（壓出一個小小的人形）
      { y:120, draw(p){ p.R(14, 70, 100, 50, O); p.R(15, 71, 98, 48, "#3a6a5a"); for (let j = 73; j < 118; j += 3) for (let i = 17 + (j % 2) * 2; i < 112; i += 4) p.R(i, j, 1, 1, "#5a8a7a"); p.R(48, 86, 26, 14, "#2a5a4a"); p.R(52, 84, 10, 8, "#2a5a4a"); } },
      // 平板（在漁網上）
      { y:121, draw(p){ p.R(86, 104, 14, 10, O); p.R(87, 105, 12, 8, "#f8a8c8"); p.R(88, 106, 10, 6, "#1e2226"); } },
      // 木箱上的運動背包
      { y:118, draw(p){ T.box(p, 150, 92, 34, 14, 12, "#a87a4a", "#7a5a3a"); p.R(156, 82, 22, 14, O); p.R(157, 83, 20, 12, "#2a3a6a"); p.R(157, 88, 20, 2, "#c84a3a"); p.R(163, 80, 8, 3, O); } },
      // 油桶
      { y:96, draw(p){ for (const x of [236, 252]){ p.R(x - 1, 70, 14, 26, O); p.R(x, 71, 12, 24, "#3a5a8a"); p.R(x, 76, 12, 1, "#2a4a7a"); p.R(x, 88, 12, 1, "#2a4a7a"); } } }
    ],
    front(p, g, t, o){ T.dim(g, this, .12); T.glow(g, 120, 60, 80, "255,230,180", .1); },
    solid:[[12,68,104,54],[148,80,38,40],[234,68,32,30]],
    exits:[ { r:[120,142,32,8], to:"hpier", at:[155,84], label:"碼頭", kind:"out", art:[118,138,36,12] } ]
  };
  setLoc("harbor", { start:"hpier", spawn:[90,110], rooms:{ hpier, hshed },
    spots:{
      ev_van:[302,34,50,36,288,76,"hpier",A("look",{ face:1 })],
      o5_ferry:[30,128,190,38,124,124,"hpier",A("look")],
      ev_backpack:[156,82,22,14,166,130,"hshed",A("rummage",{ actT:1.6 })],
      ev_tablet5:[86,104,14,10,100,130,"hshed",A("pickup",{ face:-1 })],
      o5_nets:[14,70,100,50,124,100,"hshed",A("crouch",{ face:-1 })],
      o5_shedwall:[60,0,100,20,134,70,"hshed",A("look")]
    },
    details:{ d5_gull:[0,10,352,30,200,100,"hpier",A("look")], d5_rope:[170,12,90,36,206,80,"hshed",A("look")] },
    place:{ xu:[null, null, { room:"hpier", x:226, y:116, act:"sit", facing:1, view:"side" }] },
    plan:[ { name:"南澳漁港", w:100, h:30, rooms:{ hshed:[36,0,22,14], hpier:[0,14,100,16,"out"] } } ] });
})();
