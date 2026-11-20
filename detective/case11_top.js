/* =========================================================
   第 11 集・俯視版（topdown.js）
   金福銀樓（店面、保險櫃室＋後走廊、二樓辦公室、後巷）、澄港醫院骨科病房、刑大（共用 CG_DESK）、鑑識中心（共用 CG_LAB）、
   澄港客運調度室、阿珠冰店、林家客廳、邱家書房。
   ========================================================= */
const C11T = typeof TOPEP === "function" ? TOPEP("goldshop") : null;
// 天色：那一晚 21:40 是晚上（case11_art 的 SKY11 沒有標夜晚，俯視版自己標）
if (C11T){ const SKY11T = [ ["#0b0f1c","#27324a","#18202a","#1d2630",0,1], ["#7ab0e0","#e0eef4","#4a6070","#56707a",0,0], ["#8ab8e0","#f0e8d0","#4a6070","#56707a",0,0] ];
  C11T.EP.worldSky = ph => SKY11T[Math.min(ph || 0, SKY11T.length - 1)]; }

/* ================= 金福銀樓 ================= */
C11T && (() => {
  const { EP, T, O, sh, dA, ph, night, A, tone, window2, cityView, fluo, concrete, wetCement, tileWall, vinyl, marble, laminate, setLoc } = C11T;
  const W0 = EP.world.gold || {};
  const GOLD = "#e9c45a", RED = "#8a1a14";
  const shards = (p, x, y, w, h, seed) => { p.seed(seed); for (let k = 0; k < w * h / 30; k++){ const sx = x + p.rnd() * w, sy = y + p.rnd() * h; p.R(sx, sy, 2, 1, "#e8f4f8"); if (k % 3 === 0) p.R(sx + 1, sy + 1, 1, 1, "#a8c8d8"); } };
  const glassCase = (p, x, y, w, broken, items) => { T.box(p, x, y, w, 14, 14, "#c8e0e8", "#6a1a14"); p.R(x + 1, y + 1, w - 2, 12, broken ? "#2a1e1a" : "#a8c8d0");
    if (!broken) items(p, x, y); else { p.R(x + 4, y + 3, w - 8, 8, "#5a1a20"); for (let i = x + 6; i < x + w - 6; i += 8) p.R(i, y + 5, 4, 3, "#3a1218"); p.R(x + w / 2 - 3, y + 2, 6, 3, "#e8f4f8"); }
    p.R(x, y, w, 1, "#e8f4f8"); p.R(x, y + 14, w, 2, GOLD); };
  const chains = (p, x, y) => { for (let i = x + 5; i < x + 50; i += 8){ p.R(i, y + 4, 5, 1, GOLD); p.R(i + 2, y + 5, 1, 4, GOLD); p.R(i + 1, y + 9, 3, 2, GOLD); } };

  /* ---------- 店面：紅牆金字、三個玻璃展示櫃（兩個被敲破）、金價牌、招財貓 ---------- */
  const gfront = { name:"店面", w:300, h:156, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 300, 60, "#a8241a", "damask", { base:"#3a0e0a" });
      // 金字招牌
      p.R(96, 6, 76, 18, O); p.R(97, 7, 74, 16, RED); p.R(99, 9, 70, 12, "#5a0e0a"); for (let k = 0; k < 4; k++){ p.R(104 + k * 16, 10, 12, 10, GOLD); p.R(106 + k * 16, 12, 8, 6, "#5a0e0a"); p.R(109 + k * 16, 12, 2, 6, GOLD); }
      // 今日金價牌（左）
      p.R(14, 10, 44, 34, O); p.R(15, 11, 42, 32, "#1a1a1e"); p.R(17, 13, 38, 6, GOLD); for (let r = 0; r < 3; r++){ p.R(18, 23 + r * 6, 14, 3, "#e8e4d8"); p.R(36, 23 + r * 6, 16, 3, "#e84a3a"); }
      // 牆上的層板：監視器主機（四格畫面）
      p.R(138, 40, 34, 3, "#3a0e0a"); p.R(140, 27, 30, 14, O); p.R(141, 28, 28, 12, "#1e2226"); for (let k = 0; k < 4; k++) p.R(142 + (k % 2) * 14, 29 + (k >> 1) * 6, 12, 5, k % 2 ? "#3a4a3a" : "#4a3a3a");
      // 日曆
      p.R(196, 12, 18, 24, O); p.R(197, 13, 16, 22, "#f4f0e0"); p.R(197, 13, 16, 5, "#c8302a"); p.R(200, 21, 10, 6, "#2a2a2a"); p.R(200, 30, 10, 1, "#c8302a");
      // 往後走廊的門
      T.backDoor(p, 250, 16, 28, 44, dA("gfront", "gvault"), "#5a1a14", { frame:"#2a0a08" });
      // 地板：米白大理石（被燈照得金金的）
      marble(p, 0, 60, 300, 96, "#e8e0cc", 32);
      if (ph(o) === 0){ shards(p, 30, 104, 60, 14, 3); shards(p, 100, 104, 70, 16, 7); shards(p, 40, 66, 120, 10, 11); }
      T.sides(p, this, "#3a0e0a", []);
      // 前面的鐵捲門（那一晚拉下來；之後拉起來，看得到騎樓）
      const down = ph(o) === 0; p.R(0, 150, 300, 6, down ? "#7a7e84" : "#c8bca8"); if (down) for (let i = 0; i < 300; i += 3) p.R(i, 150, 1, 6, "#5a5e64"); p.R(0, 149, 300, 1, O);
    },
    props:[
      // 三個展示櫃（第一、二個被敲破；第三個是鍍金飾品）＋櫃台上的戒指盤、招財貓
      { y:104, draw(p, g, t, o){ const br = ph(o) === 0;
          const emp = ph(o) > 0 ? () => {} : chains; glassCase(p, 30, 84, 62, br, emp); glassCase(p, 100, 84, 70, br, emp);
          glassCase(p, 180, 84, 56, false, (p2, x, y) => { for (let k = 0; k < 5; k++){ p2.R(x + 6 + k * 9, y + 4, 6, 6, "#c8a050"); p2.R(x + 8 + k * 9, y + 6, 2, 2, "#a8c8d0"); } });
          p.R(166, 98, 4, 3, "#5a5a64");                                                                      // 卡在鐵角上的碎片
          p.R(184, 78, 22, 8, O); p.R(185, 79, 20, 6, "#2a1a14"); for (let k = 0; k < 4; k++) p.R(187 + k * 5, 80, 3, 3, GOLD);   // 戒指盤
          const sw = Math.floor(t * 1.2) % 2; p.R(222, 74, 10, 12, O); p.R(223, 75, 8, 10, GOLD); p.R(224, 77, 2, 1, O); p.R(228, 77, 2, 1, O); p.R(230, 71 + sw, 3, 5, GOLD); } },
      // 櫃台後面的高腳椅（老闆坐的）
      { y:80, draw(p){ T.chair(p, 150, 80, "#5a1a14", "down"); } },
      // 客人坐的椅子（左前）＋盆栽
      { y:132, draw(p){ T.chair(p, 40, 132, "#5a1a14", "right"); T.plant(p, 282, 140, true); } }
    ],
    front(p, g, t, o){ T.glow(g, 130, 90, 120, "255,220,150", night(o) ? .16 : .08); tone(g, this, o, .25); },
    solid:[[28,82,66,36],[98,82,74,36],[178,82,60,36],[272,124,20,22]],
    exits:[ { r:[250,60,28,8], to:"gvault", at:[166,134], label:"保險櫃室・後走廊", kind:"door", art:[250,16,28,44] } ]
  };

  /* ---------- 保險櫃室・後走廊：左邊隔出一間保險櫃室；走廊盡頭是後門，樓梯就在旁邊 ---------- */
  const gvault = { name:"保險櫃室・後走廊", w:320, h:150, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 320, 60, "#d8d0c0", "plain", { base:"#5a4a3a" });
      // 保險櫃（開著）＋中間那一格的木盒
      p.R(18, 8, 46, 50, O); p.R(19, 9, 44, 49, "#4a4e54"); p.R(22, 12, 38, 42, "#2a2e34"); for (let r = 0; r < 3; r++) p.R(24, 16 + r * 13, 34, 1, "#5a5e64");
      p.R(26, 30, 30, 8, "#7a4a2a"); p.R(28, 31, 26, 6, "#6a1a20"); for (let k = 0; k < 6; k++) p.R(29 + k * 4, 32, 3, 4, "#4a1018");
      p.R(64, 9, 10, 49, O); p.R(65, 10, 8, 47, "#5a5e64"); p.R(67, 30, 4, 6, "#c8ccd0");    // 打開的門
      // 隔間牆（保險櫃室｜走廊）
      p.R(110, 0, 6, 60, "#b8b0a0"); p.R(110, 0, 1, 60, O);
      // 收音機（走廊燈旁邊）
      p.R(160, 18, 16, 10, O); p.R(161, 19, 14, 8, "#5a3a2a"); p.R(163, 21, 5, 4, "#2a2a2a"); p.R(170, 21, 3, 2, "#e8e0c8"); p.R(156, 12, 26, 3, "#f4f4f0");
      // 往二樓的樓梯（窄窄的木樓梯）＋後門（鐵門）
      STAIR10.up(p, O, sh, 200, 4, 38, 7, "#8a6440"); STAIR10.rail(p, O, 197, 6, 54, "#4a3020");
      T.backDoor(p, 252, 14, 28, 46, dA("gvault", "galley"), "#6a6e74", { frame:"#3a3e44" }); p.R(255, 24, 22, 8, "#f4f4f0"); p.R(258, 26, 14, 1, "#3a3a3a"); p.R(258, 29, 10, 1, "#3a3a3a");
      // 地板
      T.tiles(p, 0, 60, 320, 90, "#b8b0a0", "#b0a898", 15);
      // 隔間牆往前延伸（俯視看到牆頂），中間留一個門口
      p.R(110, 60, 6, 32, "#8a8070"); p.R(110, 60, 1, 32, O); p.R(110, 128, 6, 22, "#8a8070"); p.R(110, 128, 1, 22, O);
      // 血：從走廊中間拖到店面（第三天清掉了）
      if (ph(o) < 2){ p.R(176, 96, 14, 8, "#6a1a14"); for (let k = 0; k < 8; k++) p.R(170 - k * 2, 104 + k * 5, 6, 4, "rgba(106,26,20,.7)"); p.R(186, 100, 7, 3, "#2a2a2e"); p.R(187, 101, 2, 1, "#5a8ac8"); }
      else p.R(160, 98, 34, 46, "rgba(200,190,170,.18)");
      // 彈殼、鑰匙圈
      p.R(124, 96, 3, 2, "#c8a050"); p.R(264, 76, 5, 3, "#e8c45a"); p.R(268, 77, 3, 1, "#f4f0e0");
      if (ph(o) === 0){ T.marker(p, 128, 94, 1); T.marker(p, 270, 74, 2); T.marker(p, 194, 96, 3); }
      T.sides(p, this, "#4a3a2a", [["B", 150, 32]]);
    },
    props:[
      // 保險櫃室的小桌（清點單、筆掉在地上）
      { y:104, draw(p){ T.box(p, 30, 80, 56, 14, 10, "#7a5a3a", "#5a3a22"); p.R(40, 82, 18, 10, O); p.R(41, 83, 16, 8, "#f4f4f0"); p.R(43, 85, 12, 1, "#3a3a3a"); p.R(43, 87, 10, 1, "#3a3a3a"); p.R(43, 89, 6, 1, "#3a3a3a"); p.R(62, 108, 8, 1, "#2a2a6a"); } },
      { y:76, draw(p){ T.chair(p, 58, 76, "#3a3a3a", "down"); } }
    ],
    front(p, g, t, o){ fluo(p, 150, 2, 40, false); fluo(p, 40, 2, 40, false); tone(g, this, o, .3); },
    solid:[[18,8,58,52],[110,60,6,32],[110,128,6,22],[28,78,60,28],[0,60,6,90]],
    exits:[ { r:[150,142,32,8], to:"gfront", at:[264,74], label:"店面", kind:"out", art:[148,138,36,12] },
            { r:[204,60,32,8], to:"goffice", at:[40,124], label:"二樓辦公室", kind:"up", art:[198,4,42,56] },
            { r:[252,60,28,8], to:"galley", at:[73,70], label:"後巷", kind:"door", art:[252,14,28,46] } ]
  };

  /* ---------- 二樓辦公室：辦公桌對著窗戶（窗外是公車站），書櫃上一台網路攝影機 ---------- */
  const goffice = { name:"二樓辦公室", w:256, h:144, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 60, "#e8e0d0", "stripe", { base:"#5a4a3a" });
      // 窗（中正路、公車站牌）
      window2(p, 96, 10, 70, 38, o, t, (x, y, w, h) => { p.R(x, y + h - 12, w, 12, night(o) ? "#2a2a2e" : "#6a6a6e"); p.R(x + 6, y + h - 24, 2, 14, "#8a8e94"); p.R(x + 2, y + h - 28, 10, 5, "#2a6ad8"); for (let i = 0; i < w; i += 14) p.R(x + i, y + h - 6, 6, 1, "#e8e0a0"); }, "#8a8e94");
      // 婚紗照
      p.R(196, 12, 30, 36, O); p.R(197, 13, 28, 34, "#c8a050"); p.R(199, 15, 24, 30, "#e8ecf4"); p.R(204, 22, 6, 18, "#f4f4f4"); p.R(212, 22, 6, 18, "#f4f4f0"); p.R(205, 18, 4, 4, "#e8c09a"); p.R(213, 18, 4, 4, "#e8c09a");
      // 往外牆鐵梯的小鐵門（右牆）
      T.sideDoor(p, this, "R", 72, 36, 0, "#6a6e74");
      laminate(p, 0, 60, 256, 84, "#8a6a4a");
      // 往樓下的樓梯（左前）
      STAIR10.down(p, O, sh, 8, 110, 50, 6, "#8a6440"); STAIR10.rail(p, O, 60, 104, 34, "#4a3020");
      T.sides(p, this, "#4a3a2a", [["R", 72, 36]]);
    },
    props:[
      // 書櫃＋上面的網路攝影機（對著辦公桌和窗戶）
      { y:64, draw(p, g, t){ T.shelf(p, 14, 8, 40, 52, 3, "#5a3a22"); T.books(p, 17, 12, 34, 14, 2); T.books(p, 17, 30, 34, 14, 5); p.R(30, 0, 12, 8, O); p.R(31, 1, 10, 6, "#e8ecf0"); p.R(34, 3, 4, 3, "#1a1a1a"); if (Math.floor(t * 2) % 2) p.R(40, 2, 1, 1, "#e84a3a"); } },
      // 辦公桌：筆電、帳本、馬克杯、兩封信
      { y:100, draw(p){ T.box(p, 90, 74, 90, 14, 12, "#6a4428", "#4a2a14");
          p.R(100, 70, 22, 14, O); p.R(101, 71, 20, 8, "#1e2226"); p.R(102, 72, 18, 6, "#3a5a7a"); p.R(101, 79, 20, 4, "#8a8e94");
          p.R(128, 76, 18, 10, O); p.R(129, 77, 16, 8, "#2a3a2a"); p.R(137, 77, 1, 8, "#e8e0c8");
          p.R(150, 76, 7, 8, O); p.R(151, 77, 5, 6, "#f4f4f0"); p.R(152, 78, 3, 2, GOLD);
          p.R(160, 78, 14, 8, "#f4f4f0"); p.R(161, 80, 12, 1, "#3a5a8a"); p.R(162, 82, 12, 6, "#f4ecd8"); p.R(163, 84, 10, 1, "#c8302a"); } },
      { y:108, draw(p){ T.chair(p, 134, 108, "#2a2a30", "up"); } },
      { y:98, draw(p){ T.chair(p, 192, 98, "#2a2a30", "left"); } }
    ],
    front(p, g, t, o){ fluo(p, 110, 2, 40, false); tone(g, this, o, .3); },
    solid:[[12,6,44,56],[88,72,94,30],[0,104,8,40]],
    exits:[ { r:[8,136,50,8], to:"gvault", at:[216,76], label:"一樓（下樓）", kind:"down", art:[6,106,56,38] } ]
  };

  /* ---------- 後巷：銀樓後門、外牆的鐵梯、垃圾桶；巷口（右）一個檳榔攤 ---------- */
  const galley = { name:"後巷", w:320, h:140, wall:56,
    floor(p, g, t, o){
      p.R(0, 0, 320, 56, "#9a9488"); for (let j = 6; j < 52; j += 10) p.R(0, j, 320, 1, "#8a8478"); p.seed(23); for (let k = 0; k < 40; k++) p.R(p.rnd() * 320, p.rnd() * 50, 1, 3 + p.rnd() * 5, "rgba(40,40,40,.22)");
      p.R(0, 51, 320, 5, "#4a4438"); p.R(0, 56, 320, 1, O);
      T.backDoor(p, 60, 12, 26, 44, dA("galley", "gvault"), "#6a6e74", { frame:"#3a3e44" });
      // 外牆的鐵梯（從二樓小鐵門斜斜下來）
      p.R(170, 2, 22, 10, O); p.R(171, 3, 20, 8, "#6a5a4a"); p.R(174, 4, 14, 7, "#3a3e44");
      for (let k = 0; k < 9; k++){ const x = 160 - k * 6, y = 12 + k * 5; p.R(x, y, 14, 3, O); p.R(x + 1, y, 12, 2, "#8a5a3a"); }
      p.R(108, 12, 2, 44, "#6a4a2a"); p.R(174, 12, 2, 10, "#6a4a2a");
      // 垃圾車時刻、壞掉的路燈
      p.R(210, 18, 30, 14, O); p.R(211, 19, 28, 12, "#f4f0e0"); p.R(213, 21, 24, 2, "#2a6a3a"); p.R(213, 25, 18, 1, "#5a5a5a"); p.R(213, 28, 20, 1, "#5a5a5a");
      p.R(282, 4, 2, 52, "#5a5e64"); p.R(278, 4, 12, 4, "#3a3e44");
      concrete(p, 0, 56, 320, 84, "#6a6a66", 29);
      // 摔破的垃圾袋（那一晚）、輪胎痕、機油
      if (ph(o) === 0){ p.R(88, 62, 12, 8, "#2a2a2e"); p.R(100, 66, 6, 3, "#f4f4f0"); p.R(94, 70, 8, 4, "#c8a878"); }
      for (let k = 0; k < 20; k++) p.R(90 + k * 6, 82 + Math.round(Math.sin(k / 4) * 6) - k, 6, 2, "rgba(20,20,20,.55)");
      p.R(118, 92, 10, 4, "rgba(30,30,40,.6)");
      // 巷口（右）：往中正路
      p.R(296, 56, 24, 84, "rgba(255,230,180,.06)");
      T.sides(p, this, "#4a4438", [["R", 56, 84], ["B", 0, 320]]);
    },
    props:[
      // 垃圾桶（後面躲著一隻橘貓）
      { y:78, draw(p){ for (const x of [150, 168]){ p.R(x, 58, 16, 20, O); p.R(x + 1, 59, 14, 18, "#3a6a3a"); p.R(x + 1, 59, 14, 3, "#4a7a4a"); } p.R(184, 66, 8, 7, O); p.R(185, 67, 6, 5, "#e8963a"); p.R(186, 68, 1, 1, "#2a2a2a"); p.R(189, 68, 1, 1, "#2a2a2a"); } },
      // 檳榔攤（巷口）：玻璃櫃、柱子、一盞霓虹
      { y:120, draw(p, g, t){ T.box(p, 262, 90, 46, 14, 14, "#e8ecf0", "#c8ccd0"); p.R(266, 92, 38, 10, "#8ac8a0"); for (let k = 0; k < 6; k++) p.R(268 + k * 6, 94, 4, 4, "#3a8a3a");
          p.R(254, 70, 4, 48, O); p.R(255, 71, 2, 46, "#c8ccd0"); p.R(258, 66, 50, 4, "#e83a8a"); if (Math.floor(t * 2) % 3) p.R(260, 67, 46, 2, "#ff8ac8");
          p.R(248, 116, 2, 1, "#f4f0e0"); p.R(252, 118, 2, 1, "#f4f0e0"); p.R(246, 120, 3, 1, "#f4f0e0"); } }
    ],
    front(p, g, t, o){ if (night(o)){ T.glow(g, 73, 12, 30, "255,230,170", .18); T.glow(g, 282, 90, 50, "255,120,200", .14); } tone(g, this, o, .4); },
    solid:[[148,56,48,24],[252,86,58,36]],
    exits:[ { r:[60,56,26,8], to:"gvault", at:[266,78], label:"保險櫃室・後走廊", kind:"door", art:[60,12,26,44] } ]
  };

  const spots = {
    cctv_store:[140,27,30,14,156,74,"gfront",A("type",{ actT:2 })],
    ev_counter:[30,84,140,18,100,124,"gfront",A("look",{ actT:1.6 })],
    ev_visorchip:[162,94,10,8,176,124,"gfront",A("crouch",{ face:-1 })],
    o11_shutter:[100,146,100,10,150,138,"gfront",A("look")],
    o11_price:[14,10,44,34,36,72,"gfront",A("read")],
    o11_tray:[184,78,22,8,196,72,"gfront",A("look")],
    ev_safe:[18,8,58,50,40,112,"gvault",A("look",{ actT:1.6 })],
    ev_casing:[120,92,10,8,136,106,"gvault",A("crouch",{ actT:1.6, face:-1 })],
    ev_keyfob:[260,72,14,8,248,84,"gvault",A("crouch",{ face:1 })],
    ev_backdoor:[252,14,28,46,288,74,"gvault",A("look",{ face:-1 })],
    o11_blood:[160,94,36,48,206,118,"gvault",A("crouch",{ face:-1 })],
    o11_stairs:[198,4,42,56,232,92,"gvault",A("look")],
    o11_count:[40,82,18,10,48,116,"gvault",A("read")],
    cctv_office:[30,0,12,8,36,70,"goffice",A("look")],
    ev_camset:[28,0,16,10,46,74,"goffice",A("type",{ actT:2 })],
    o11_window:[96,10,70,38,90,66,"goffice",A("look")],
    o11_photo:[196,12,30,36,210,70,"goffice",A("look")],
    o11_policy:[158,76,16,10,168,112,"goffice",A("read")],
    o11_notice:[160,82,14,8,182,108,"goffice",A("read",{ face:-1 })],
    o11_ledger:[126,74,22,12,146,112,"goffice",A("read")],
    o11_door2:[248,72,8,36,238,90,"goffice",A("look",{ face:1 })],
    o11_firestair:[100,10,80,46,140,70,"galley",A("look",{ actT:1.6 })],
    o11_butt:[240,112,16,12,236,128,"galley",A("crouch",{ face:1 })],
    o11_trash:[210,18,30,14,224,70,"galley",A("read")],
    o11_tire:[90,64,120,30,110,104,"galley",A("crouch",{ actT:1.6 })]
  };
  const details = {
    d11_bell:[220,70,14,16,232,72,"gfront",A("look",{ face:-1 })],
    d11_cal:[196,12,18,24,206,72,"gfront",A("look")],
    d11_radio:[156,12,26,16,168,72,"gvault",A("look")],
    d11_mug:[148,74,10,10,154,112,"goffice",A("look")],
    d11_cat:[182,62,12,12,200,86,"galley",A("crouch",{ face:-1 })]
  };
  const place = {
    qiu:[ { room:"gfront", x:250, y:124, act:"cross", facing:-1 }, { room:"goffice", x:192, y:98, act:"sit", facing:-1, view:"side" }, { room:"goffice", x:200, y:110, act:"phone", facing:-1 } ],
    lu:[ { room:"gvault", x:72, y:120, act:"kneel", facing:-1 }, null, { room:"gfront", x:150, y:80, act:"sit", facing:1, view:"side" } ],
    shan:[ { room:"gfront", x:204, y:132, act:"phone", facing:-1 }, { room:"gfront", x:128, y:74, act:"idle", facing:1 }, null ],
    wen:[ { room:"gfront", x:40, y:132, act:"sitCry", facing:1, view:"side" }, null ],
    mei:[ { room:"galley", x:286, y:84, act:"idle", facing:-1 } ],
    xu:[ { room:"gvault", x:150, y:110, act:"kneel", facing:1 }, null ],
    wu:[ { room:"goffice", x:60, y:86, act:"idle", facing:-1 }, null ]
  };
  const EX = { cop11:{ room:"gfront", x:96, y:138, act:"idle", facing:1 }, for11:{ room:"gvault", x:226, y:112, act:"cam", facing:-1 } };
  const extras = (W0.extras || []).map(e => EX[e.id] ? { ...e, ...EX[e.id] } : e);
  const intro = [ { set:{ room:"gfront", px:150, py:142 }, hide:true }, { wait:0.3, hide:true }, { set:{ room:"gfront", px:150, py:132 } },
    ...(W0.intro || []).filter(k => k.say || (k.wait && !k.hide)).map(k => k.say && k.say[0] === "wu" && /點畫面上的箭嘴|📍|清單不是全部/.test(k.say[1]) ? null : k).filter(Boolean),
    { say:["wu", "想去哪裡，點畫面上的門口、樓梯就會自己走過去。閃著星星的就是還沒看過的東西，按上面的「🧭 平面圖」看全部在哪裡。"], name:"小吳" } ];
  setLoc("gold", { start:"gfront", spawn:[150,132], rooms:{ gfront, gvault, goffice, galley }, spots, details, place, extras, intro,
    plan:[ { name:"金福銀樓", w:100, h:52, rooms:{ goffice:[60,0,40,14], galley:[0,14,100,10], gvault:[0,24,100,14], gfront:[0,38,100,14] } } ] });
})();

/* ================= 澄港醫院、刑大（共用）、鑑識中心（共用）、客運調度室、阿珠冰店、林家、邱家 ================= */
C11T && (() => {
  const { EP, T, O, sh, dA, ph, night, A, tone, window2, cityView, fluo, vinyl, laminate, tileWall, has, setLoc } = C11T;
  const sea = o => (p => (x, y, w, h) => { p.R(x, y + h * .55, w, h * .45, night(o) ? "#0a1a2a" : "#3a6a90"); for (let i = 0; i < w; i += 9) p.R(x + i, y + h * .55 + 2 + (i % 4), 5, 1, night(o) ? "#2a3a4a" : "#8ab0c8"); });

  /* ---------- 澄港醫院・骨科病房：一張床、床頭櫃上的花和證物袋、牆上的看片燈 ---------- */
  const hward = { name:"骨科病房", w:288, h:154, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 288, 58, "#e4ece8", "plain", { base:"#6a8a7a" }); p.R(0, 40, 288, 3, "#9ac0a8");
      // 看片燈（左）：一張大腿的 X 光，股骨旁邊一個白點
      p.R(12, 8, 40, 30, O); p.R(13, 9, 38, 28, "#e8f4f8"); p.R(16, 11, 32, 24, "#2a3a44"); p.R(28, 12, 8, 22, "#8aa0b0"); p.R(30, 13, 4, 20, "#b8c8d4"); p.R(37, 22, 3, 3, "#f8f8ff");
      // 床頭牆上：氧氣、抽吸接頭、叫人鈴、生理監視器
      p.R(110, 8, 60, 16, O); p.R(111, 9, 58, 14, "#d8e0dc"); p.R(114, 12, 6, 6, "#3aa86a"); p.R(124, 12, 6, 6, "#f4f4f0"); p.R(134, 12, 6, 6, "#e9c43a"); p.R(150, 11, 16, 10, "#2a2e30");
      for (let k = 0; k < 14; k++) p.R(151 + k, 15 + Math.round(Math.sin(t * 6 + k * .9) * (k % 5 === 2 ? 3 : 1)), 1, 1, "#4ae87a");
      // 牆上的電視（關著）、時鐘
      p.R(70, 10, 28, 18, O); p.R(71, 11, 26, 15, "#1a1c20"); p.R(82, 28, 4, 4, O);
      p.R(186, 10, 12, 12, O); p.R(187, 11, 10, 10, "#f4f4f0"); p.R(191, 13, 1, 4, O); p.R(192, 16, 3, 1, O);
      // 窗（右）：外面是港口
      window2(p, 210, 8, 66, 32, o, t, sea(o)(p), "#c8d0cc"); p.R(208, 6, 70, 3, "#8aa0b0"); for (let k = 0; k < 5; k++) p.R(210 + k * 14, 9, 2, 30, "rgba(200,220,210,.35)");
      vinyl(p, 0, 58, 288, 96, "#d0dcd4", "#c8d4cc", 16);
      T.sides(p, this, "#6a8a7a", [["B", 40, 34]]);
    },
    props:[
      // 點滴架（床頭）
      { y:96, draw(p){ p.R(140, 40, 2, 56, O); p.R(141, 41, 1, 54, "#c8ccd0"); p.R(136, 40, 10, 2, O); p.R(134, 42, 6, 10, O); p.R(135, 43, 4, 8, "#e8f4f8"); p.R(135, 47, 4, 4, "#c8e0f0"); p.R(137, 52, 1, 30, "#c8e0f0"); p.R(136, 95, 10, 2, O); } },
      // 床頭櫃：一束花、一個證物袋（彈頭）
      { y:98, draw(p){ T.box(p, 104, 70, 30, 14, 12, "#e8ecea", "#b8c4c0"); p.R(108, 62, 6, 9, O); p.R(109, 63, 4, 8, "#c8e0e8"); p.R(105, 56, 4, 4, "#e85a8a"); p.R(110, 55, 4, 4, "#f4e04a"); p.R(114, 57, 4, 4, "#e85a8a"); p.R(108, 59, 6, 4, "#3a8a3a"); p.R(112, 62, 6, 4, O); p.R(113, 63, 4, 2, "#f4f4f0");
          p.R(120, 72, 10, 7, O); p.R(121, 73, 8, 5, "rgba(230,240,250,.8)"); p.R(124, 75, 2, 2, "#c8a050"); p.R(121, 73, 8, 1, "#e84a3a"); } },
      // 病床：床頭在左、腳在右；腳邊掛著病歷夾（先畫床，人躺在上面）
      { y:80, draw(p, g, t){ p.R(144, 66, 6, 36, O); p.R(145, 67, 4, 34, "#c8ccd0"); T.box(p, 150, 72, 58, 22, 8, "#f4f6f8", "#a8b0b8"); p.R(152, 74, 14, 10, "#ffffff"); p.R(166, 76, 40, 16, "#c8dce8"); p.R(166, 76, 40, 1, "#e8f0f8");
          p.R(184, 80, 22, 10, "#e8f0f8"); p.R(186, 82, 18, 6, "#f8f8f8");                      // 包得很厚的左大腿
          p.R(208, 70, 6, 34, O); p.R(209, 71, 4, 32, "#c8ccd0"); p.R(209, 84, 8, 11, O); p.R(210, 85, 6, 9, "#f4f0e0"); p.R(211, 86, 4, 1, "#3a6ad8"); p.R(211, 88, 4, 1, O); p.R(211, 90, 3, 1, O);
          p.R(150, 102, 2, 4, O); p.R(206, 102, 2, 4, O); } },
      // 床尾的助行器、輪椅
      { y:96, draw(p){ p.R(254, 66, 22, 2, O); p.R(254, 66, 2, 30, O); p.R(274, 66, 2, 30, O); p.R(255, 67, 20, 1, "#c8ccd0"); p.R(255, 80, 20, 1, "#a8acb0"); } },
      { y:130, draw(p){ p.R(58, 104, 24, 4, O); p.R(59, 105, 22, 2, "#3a5a8a"); p.R(58, 96, 4, 12, O); p.R(59, 97, 2, 10, "#3a5a8a"); for (const wx of [56, 78]){ p.R(wx - 1, 104, 8, 18, O); p.R(wx, 105, 6, 16, "#5a5e64"); p.R(wx + 2, 107, 2, 12, "#c8ccd0"); } p.R(64, 118, 10, 2, O); p.R(66, 120, 2, 6, O); p.R(72, 120, 2, 6, O); } },
      // 推車（醫師寫紀錄用）
      { y:132, draw(p){ T.box(p, 252, 112, 26, 12, 12, "#e8ecea", "#b8c4c0"); p.R(256, 108, 10, 6, O); p.R(257, 109, 8, 4, "#2a2e30"); p.R(268, 110, 8, 6, O); p.R(269, 111, 6, 4, "#f4f0e0"); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 50); fluo(p, 180, 2, 50); if (night(o)) T.glow(g, 158, 16, 20, "120,255,160", .12); tone(g, this, o, .3); },
    solid:[[102,68,34,30],[144,64,8,42],[150,94,58,12],[206,68,10,38],[252,64,26,34],[52,96,34,34],[250,104,30,30]],
    exits:[]
  };
  setLoc("hospital", { start:"hward", spawn:[57,146], rooms:{ hward },
    spots:{
      ev_bullet:[118,70,14,10,126,104,"hward",A("look",{ actT:1.6 })],
      o11_chain:[162,78,16,12,174,112,"hward",A("look")],
      o11_chart:[208,82,10,14,226,100,"hward",A("read")]
    },
    details:{ d11_flower:[104,54,16,18,96,104,"hward",A("look")] },
    place:{
      yong:[ { room:"hward", x:186, y:88, act:"lie", facing:1, view:"side" } ],
      doc:[ { room:"hward", x:238, y:142, act:"write", facing:1 }, { room:"hward", x:32, y:72, act:"read", facing:-1 } ],
      lu:[ null, { room:"hward", x:110, y:118, act:"idle", facing:1 }, null ]
    },
    plan:[ { name:"澄港醫院・骨科病房", w:100, h:34, rooms:{ hward:[0,0,100,34] } } ] });

  /* ---------- 刑大：公布欄多了一張槍擊案統計；長椅上坐著等的人 ---------- */
  const pdesk = CG_DESK(C11T, { meetOk:false,
    board(p){ p.R(176, 8, 16, 18, O); p.R(177, 9, 14, 16, "#f4f4f0"); p.R(179, 11, 10, 1, "#2a2a2a"); for (let k = 0; k < 3; k++) p.R(179, 14 + k * 3, 8, 1, "#7a7a8a"); p.R(184, 19, 5, 5, "#c8302a"); p.R(185, 20, 3, 3, "#f4f4f0"); },
    clutter(p){ p.R(122, 88, 16, 9, O); p.R(123, 89, 14, 7, "#f4f0e6"); p.R(124, 90, 8, 1, "#2a5a8a"); p.R(124, 93, 10, 1, "#7a7a8a");                      // 繳費收據
      for (let k = 0; k < 4; k++){ p.R(212, 86 - k * 3, 20, 4, O); p.R(213, 87 - k * 3, 18, 2, ["#3a5a8a", "#8a3a3a", "#e9c46a", "#3a7a52"][k]); } p.R(230, 78, 3, 3, "#f4e04a"); p.R(213, 76, 3, 3, "#ff8ac8"); },   // 升等考試的書＋便利貼
    props:[ { y:146, draw(p){ p.R(28, 132, 52, 4, O); p.R(29, 133, 50, 2, "#7a5a3a"); T.chair(p, 40, 146, "#7a5a3a", "right"); T.chair(p, 66, 146, "#7a5a3a", "right"); } },
      { y:106, draw(p){ T.chair(p, 262, 106, "#2a3a2a", "left"); } } ] });
  setLoc("police", { start:"pdesk", spawn:[170,154], rooms:{ pdesk },
    spots:{
      doc_losslist:[46,76,22,12,56,106,"pdesk",A("read",{ actT:1.6 })],
      o11_receipt:[120,86,20,12,124,114,"pdesk",A("read")],
      o11_wanted:[174,6,20,22,182,70,"pdesk",A("read")]
    },
    details:{ d11_books:[210,74,26,18,218,114,"pdesk",A("look")] },
    place:{
      wen:[ null, { room:"pdesk", x:40, y:146, act:"sit", facing:1, view:"side" } ],
      ye:[ { room:"pdesk", x:178, y:146, act:"read", facing:-1 } ],
      jc:[ null, null, { room:"pdesk", x:262, y:106, act:"sit", facing:-1, view:"side" } ],
      ja:[ null, null, { room:"pdesk", x:66, y:146, act:"sitCry", facing:1, view:"side" } ]
    },
    extras:(EP.world.police || {}).extras || [],
    plan:[ { name:"澄港市刑大", w:100, h:30, rooms:{ pdesk:[0,0,100,30] } } ] });

  /* ---------- 鑑識中心：許知夏的桌上排著三樣證物；小吳那邊一碗芒果冰 ---------- */
  setLoc("lab", { start:"lab", spawn:[144,140],
    rooms:{ lab:CG_LAB(C11T, { props:[
      { y:101, draw(p){ T.box(p, 130, 70, 44, 14, 10, "#e8ecf0", "#b8bcc0");
          for (const [x, c] of [[134, "#c8a050"], [146, "#b87a3a"], [158, "#4a4e54"]]){ p.R(x, 72, 9, 8, O); p.R(x + 1, 73, 7, 6, "rgba(230,240,250,.85)"); p.R(x + 3, 75, 3, 2, c); p.R(x + 1, 79, 7, 2, "#f4f4f0"); }   // 彈殼、彈頭、碎片，各貼一張標籤
          p.R(176, 70, 2, 28, "#e9c43a"); } },
      { y:104, draw(p){ T.chair(p, 152, 104, "#2a2a30", "up"); } },
      { y:112, draw(p){ p.R(258, 90, 12, 8, O); p.R(259, 91, 10, 6, "#f4f4f0"); p.R(260, 88, 8, 4, "#f4b83a"); p.R(262, 87, 4, 2, "#f8d870"); p.R(268, 86, 1, 6, "#c8ccd0"); } }   // 吃一半的芒果冰
    ], solid:[[128,68,48,28]] }) },
    spots:{
      doc_haul:[198,70,22,12,196,98,"lab",A("read",{ actT:1.6 })],
      o11_lab:[132,70,38,12,150,108,"lab",A("look",{ actT:1.6 })]
    },
    details:{ d11_tape:[174,68,6,30,180,108,"lab",A("look")] },
    place:{ xu:[ null, { room:"lab", x:150, y:116, act:"read", facing:1 } ], wu:[ null, { room:"lab", x:232, y:104, act:"idle", facing:-1 } ] },
    extras:(EP.world.lab || {}).extras || [],
    plan:[ { name:"鑑識中心", w:100, h:20, rooms:{ lab:[0,0,100,20] } } ] });

  /* ---------- 澄港客運調度室：一面 GPS 大螢幕、窗外的洗車場 ---------- */
  const crab = (p, x, y) => { p.R(x + 4, y, 10, 6, "#e83a2a"); p.R(x, y - 2, 4, 3, "#e83a2a"); p.R(x + 14, y - 2, 4, 3, "#e83a2a"); for (let k = 0; k < 3; k++){ p.R(x + 2, y + 2 + k * 2, 2, 1, "#c82a1a"); p.R(x + 14, y + 2 + k * 2, 2, 1, "#c82a1a"); } p.R(x + 6, y + 1, 1, 1, O); p.R(x + 11, y + 1, 1, 1, O); };
  const bdesk = { name:"客運調度室", w:288, h:158, wall:62,
    floor(p, g, t, o){
      T.backWall(p, 0, 288, 62, "#dcdcd4", "plain", { base:"#3a4a5a" });
      // 班表板（左）
      p.R(8, 10, 26, 34, O); p.R(9, 11, 24, 32, "#8a6a4a"); p.R(11, 13, 20, 28, "#f4f4ee"); p.R(13, 15, 16, 2, "#c8302a"); for (let k = 0; k < 6; k++) p.R(13, 19 + k * 4, 14, 1, "#3a3a3a");
      // GPS 大螢幕：12 路的路線，一個個會動的小點
      p.R(42, 6, 132, 44, O); p.R(43, 7, 130, 42, "#14181e"); p.R(46, 10, 124, 36, "#1a2a3a");
      const path = [[50, 40], [80, 40], [80, 20], [120, 20], [120, 34], [164, 34]]; for (let i = 0; i < path.length - 1; i++){ const [a, b] = path[i], [c, d] = path[i + 1]; p.R(Math.min(a, c), Math.min(b, d), Math.abs(c - a) + 2, Math.abs(d - b) + 2, "#3a8ad8"); }
      for (let k = 0; k < 5; k++){ const u = (t * .05 + k / 5) % 1; let L = u * 156, x = 50, y = 40; for (let i = 0; i < path.length - 1; i++){ const [a, b] = path[i], [c, d] = path[i + 1], seg = Math.abs(c - a) + Math.abs(d - b); if (L <= seg){ x = a + Math.sign(c - a) * Math.min(L, Math.abs(c - a)); y = b + Math.sign(d - b) * Math.min(L, Math.abs(d - b)); break; } L -= seg; x = c; y = d; } p.R(x - 1, y - 1, 4, 4, k === 2 ? "#e83a2a" : "#4ae87a"); }
      p.R(110, 26, 6, 4, "#e9c45a"); p.R(48, 12, 20, 3, "#8aa0b0");
      // 窗：洗車場裡那台貼紅色大螃蟹的公車
      window2(p, 192, 8, 86, 38, o, t, (x, y, w, h) => { p.R(x, y + h - 6, w, 6, "#5a5e64"); p.R(x + 6, y + 8, w - 12, h - 14, O); p.R(x + 7, y + 9, w - 14, h - 16, "#f4f4f0"); for (let i = x + 10; i < x + w - 12; i += 10) p.R(i, y + 11, 7, 6, "#3a4a5a");
          crab(p, x + 22, y + 21); p.R(x + 50, y + 20, 18, 3, "#e83a2a"); p.R(x + 54, y + 24, 12, 2, "#2a5ad8"); p.R(x + w - 18, y + 11, 6, 4, "#e9c43a");
          for (let k = 0; k < 3; k++) p.R(x + 4 + ((k * 23 + Math.floor(t * 10)) % (w - 8)), y + 18 + k * 4, 1, 3, "#c8e0f0"); }, "#8a9094");
      vinyl(p, 0, 62, 288, 96, "#b8bcb4", "#b0b4ac", 16);
      T.sides(p, this, "#3a4a5a", [["B", 120, 36]]);
    },
    props:[
      // 調度台：無線電、GPS 紀錄的列印紙、一杯茶
      { y:98, draw(p, g, t){ T.box(p, 48, 74, 124, 14, 10, "#8a8e94", "#5a5e64"); p.R(56, 72, 14, 10, O); p.R(57, 73, 12, 8, "#2a2e30"); p.R(58, 74, 4, 2, Math.floor(t * 3) % 2 ? "#4ae87a" : "#1a5a2a"); p.R(66, 66, 1, 7, O);
          p.R(120, 76, 22, 10, O); p.R(121, 77, 20, 8, "#f4f4ee"); for (let k = 0; k < 3; k++) p.R(123, 79 + k * 2, 14, 1, "#5a5a6a"); p.R(150, 76, 8, 8, O); p.R(151, 77, 6, 6, "#f4f4f0"); p.R(152, 78, 4, 3, "#8a5a2a");
          p.R(90, 70, 20, 12, O); p.R(91, 71, 18, 9, "#1e2226"); p.R(92, 72, 16, 7, "#2a4a5a"); } },
      { y:100, draw(p){ T.chair(p, 182, 100, "#2a3a4a", "left"); } },
      // 置物櫃、鑰匙板、飲水機
      { y:86, draw(p){ for (let k = 0; k < 3; k++){ T.box(p, 224 + k * 18, 56, 16, 8, 22, "#8a9aa8", "#6a7a88"); p.R(228 + k * 18, 68, 8, 1, O); } } },
      { y:150, draw(p){ T.box(p, 248, 120, 22, 14, 14, "#e8ecf0", "#b8bcc0"); p.R(252, 112, 14, 10, O); p.R(253, 113, 12, 8, "#a8d0e8"); p.R(254, 130, 3, 3, "#e84a3a"); p.R(260, 130, 3, 3, "#3a6ad8"); } },
      { y:146, draw(p){ p.R(20, 128, 60, 4, O); p.R(21, 129, 58, 2, "#3a6aa8"); for (let k = 0; k < 4; k++){ p.R(22 + k * 15, 120, 12, 8, O); p.R(23 + k * 15, 121, 10, 6, "#3a6aa8"); } p.R(22, 132, 2, 10, O); p.R(76, 132, 2, 10, O); } }   // 司機休息的排椅
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 50); fluo(p, 200, 2, 50); T.glow(g, 108, 28, 40, "80,160,255", .1); tone(g, this, o, .3); },
    solid:[[46,64,128,36],[222,52,54,34],[246,110,26,32],[18,118,64,26]],
    exits:[]
  };
  setLoc("bus", { start:"bdesk", spawn:[138,150], rooms:{ bdesk },
    spots:{
      doc_busgps:[118,74,26,14,130,104,"bdesk",A("read",{ actT:1.6 })],
      o11_busad:[192,8,86,38,214,72,"bdesk",A("look",{ face:1 })],
      o11_roster:[8,10,26,34,22,72,"bdesk",A("read",{ actT:1.6 })]
    },
    details:{ d11_radio2:[54,66,18,16,62,104,"bdesk",A("look")] },
    place:{ lai:[ { room:"bdesk", x:182, y:100, act:"sit", facing:-1, view:"side" }, { room:"bdesk", x:182, y:100, act:"sit", facing:-1, view:"side" }, { room:"bdesk", x:196, y:118, act:"phone", facing:-1 } ] },
    plan:[ { name:"澄港客運・調度室", w:100, h:32, rooms:{ bdesk:[0,0,100,32] } } ] });

  /* ---------- 阿珠冰店：老刨冰機、集點卡的軟木板、窗外的碼頭 ---------- */
  const iice = { name:"阿珠冰店", w:280, h:150, wall:60,
    floor(p, g, t, o){
      tileWall(p, 0, 280, 60, "#e8f0e8", 5); p.R(0, 50, 280, 6, "#3a8a6a"); p.R(0, 56, 280, 4, "#2a5a4a"); p.R(0, 60, 280, 1, O);
      // 價目表（手寫，最下面一行加料免費）
      p.R(18, 6, 104, 30, O); p.R(19, 7, 102, 28, "#f4ecd8"); p.R(22, 9, 30, 4, "#c8302a"); for (let r = 0; r < 4; r++){ p.R(22, 15 + r * 4, 40, 1, "#3a3a3a"); p.R(90, 15 + r * 4, 14, 1, "#c8302a"); } p.R(22, 31, 70, 2, "#2a5ad8");
      // 集點卡的軟木板
      p.R(136, 8, 44, 34, O); p.R(137, 9, 42, 32, "#b8864a"); p.seed(11); for (let k = 0; k < 9; k++){ const x = 139 + (k % 3) * 13, y = 11 + Math.floor(k / 3) * 10; p.R(x, y, 11, 8, k === 4 ? "#f8f0a8" : "#f4f4ee"); p.R(x + 1, y + 2, 9, 1, "#e85a3a"); p.R(x + 5, y, 1, 1, "#c8302a"); }
      // 窗：南澳漁港的碼頭
      window2(p, 196, 8, 72, 34, o, t, (x, y, w, h) => { p.R(x, y + h * .5, w, h * .5, night(o) ? "#0a1a2a" : "#3a6a90"); for (let k = 0; k < 4; k++){ const bx = x + 2 + k * 17; p.R(bx, y + h * .5 - 2, 14, 5, ["#e8e4da", "#3a6ad8", "#e8e4da", "#c8302a"][k]); p.R(bx + 4, y + h * .5 - 8, 5, 6, "#f4f4f0"); p.R(bx + 6, y + 4, 1, h * .5 - 10, "#5a5e64"); } p.R(x, y + h - 4, w, 4, "#8a7a6a"); }, "#5a8a6a");
      T.tiles(p, 0, 60, 280, 90, "#e8dcc8", "#d8cbb4", 10);
      T.sides(p, this, "#2a5a4a", [["B", 112, 36]]);
    },
    props:[
      // 櫃台：鑄鐵刨冰機、一塊冰、料盒（紅豆、芒果、芋頭、煉乳）
      { y:106, draw(p, g, t){ T.box(p, 16, 80, 110, 14, 12, "#e8ecea", "#3a8a6a"); p.R(16, 94, 110, 1, "#5aaa8a");
          p.R(28, 62, 22, 20, O); p.R(29, 63, 20, 18, "#c8302a"); p.R(31, 58, 16, 6, O); p.R(32, 59, 14, 4, "#8a8e94"); p.R(34, 66, 10, 8, "#d8f0f8"); p.R(36, 74, 6, 6, "#f4f4f8"); p.R(48, 64, 6, 2, O);
          if (Math.floor(t * 4) % 2) p.R(37, 76, 4, 1, "#ffffff");
          for (let k = 0; k < 5; k++){ p.R(62 + k * 11, 82, 10, 8, O); p.R(63 + k * 11, 83, 8, 6, ["#7a2a2a", "#f4b83a", "#a888c8", "#f8f4e8", "#3a8a3a"][k]); }
          p.R(118, 70, 6, 12, O); p.R(119, 71, 4, 10, "#f8f4e8"); } },
      // 冰櫃（右後）
      { y:92, draw(p){ T.box(p, 232, 64, 40, 16, 12, "#f4f4f0", "#c8ccd0"); p.R(236, 66, 32, 12, "#d8e8f0"); p.R(240, 68, 10, 6, "#e8f4f8"); p.R(254, 68, 10, 6, "#e8f4f8"); } },
      // 兩張小桌（塑膠椅），一碗紅豆牛奶冰
      { y:118, draw(p){ T.box(p, 140, 94, 36, 16, 8, "#e8e4da", "#a8a49a"); p.R(150, 94, 12, 10, O); p.R(151, 95, 10, 8, "#f4f4f0"); p.R(152, 92, 8, 6, "#f8f8ff"); p.R(154, 90, 4, 3, "#ffffff"); p.R(152, 98, 8, 2, "#7a2a2a"); p.R(153, 92, 6, 1, "#f8f0d8"); p.R(166, 98, 6, 1, "#c8ccd0");
          T.chair(p, 132, 112, "#e83a3a", "right"); T.chair(p, 184, 112, "#3a6ad8", "left"); } },
      { y:132, draw(p){ T.box(p, 196, 108, 36, 16, 8, "#e8e4da", "#a8a49a"); p.R(204, 110, 8, 4, "#f4f4f0"); T.chair(p, 214, 104, "#e9c43a", "up"); } }
    ],
    front(p, g, t, o){ p.R(140, 0, 2, 6, O); const a = t * 7; for (let k = 0; k < 3; k++) p.R(141 + Math.round(Math.cos(a + k * 2.1) * 9) - 1, 7 + Math.round(Math.sin(a + k * 2.1) * 3), 3, 2, "#5a5e5a"); p.R(138, 6, 6, 3, O);
      fluo(p, 40, 2, 50); fluo(p, 200, 2, 50); tone(g, this, o, .3); },
    solid:[[14,78,114,30],[0,60,14,48],[230,62,44,30],[138,92,40,26],[194,106,40,26]],
    exits:[]
  };
  setLoc("ice", { start:"iice", spawn:[130,142], rooms:{ iice },
    spots:{
      o11_stamp:[136,8,44,34,158,72,"iice",A("read",{ actT:1.6 })],
      o11_icecup:[148,88,16,14,158,124,"iice",A("look")],
      o11_dock:[196,8,72,34,214,72,"iice",A("look")]
    },
    details:{ d11_menu:[18,6,104,30,82,114,"iice",A("read")] },
    place:{ zhu:[ { room:"iice", x:72, y:74, act:"sweep", facing:1 }, { room:"iice", x:72, y:74, act:"sweep", facing:1 }, { room:"iice", x:214, y:140, act:"wipe", facing:-1 } ] },
    plan:[ { name:"阿珠冰店", w:100, h:30, rooms:{ iice:[0,0,100,30] } } ] });

  /* ---------- 林家客廳：牆上水漬、門外被潑漆；機車停在客廳裡 ---------- */
  const lroom = { name:"林家客廳", w:280, h:150, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 280, 60, "#e4ddcc", "plain", { base:"#5a4a3a" });
      p.seed(21); for (let k = 0; k < 7; k++){ const x = 60 + p.rnd() * 200, w = 10 + p.rnd() * 20; p.R(x, 3, w, 6 + p.rnd() * 18, "rgba(150,120,70,.22)"); p.R(x + 2, 3, w - 4, 4, "rgba(120,90,50,.18)"); }   // 水漬
      p.R(200, 18, 1, 22, "#9a8a7a"); p.R(201, 30, 6, 1, "#9a8a7a");   // 裂縫
      // 大門（開著）：門板外面被潑了紅漆
      p.R(12, 6, 36, 54, O); p.R(13, 7, 34, 53, "#3a3a3a"); p.R(16, 10, 28, 50, "#8a8e86"); p.R(16, 10, 28, 1, "#aab0a8");
      for (let k = 0; k < 6; k++){ p.R(18 + k * 4, 16 + (k % 3) * 2, 3, 24 + (k % 2) * 10, "rgba(200,40,30,.6)"); p.R(18 + k * 4, 40 + (k % 2) * 10, 2, 4, "rgba(170,30,24,.6)"); } p.R(20, 14, 20, 4, "rgba(200,40,30,.55)");
      p.R(48, 6, 6, 54, "#5a5a54"); p.R(48, 6, 6, 54, "rgba(0,0,0,.2)");
      // 牆上的層板：兩頂黑色全罩安全帽
      p.R(96, 40, 38, 3, O); p.R(97, 41, 36, 1, "#8a6a4a"); for (const x of [100, 118]){ p.R(x, 28, 14, 12, O); p.R(x + 1, 29, 12, 10, "#1e2024"); p.R(x + 3, 32, 9, 5, "#3a3e44"); p.R(x + 4, 30, 4, 1, "#5a5e64"); } p.R(127, 35, 2, 2, "#e8e4da");
      // 舊照片（漁船前面兩兄弟）、月曆
      p.R(146, 12, 22, 18, O); p.R(147, 13, 20, 16, "#e8dcc0"); p.R(149, 15, 16, 12, "#a8b8c0"); p.R(149, 23, 16, 4, "#5a6a7a"); p.R(153, 17, 3, 7, "#3a3a3a"); p.R(157, 19, 2, 4, "#3a3a3a");
      p.R(176, 10, 18, 22, O); p.R(177, 11, 16, 20, "#f4f4ee"); p.R(177, 11, 16, 4, "#c8302a"); for (let k = 0; k < 12; k++) p.R(179 + (k % 4) * 3, 17 + Math.floor(k / 4) * 4, 2, 2, "#8a8a8a");
      // 往廚房的門簾（右後）
      p.R(232, 8, 36, 52, O); p.R(233, 9, 34, 51, "#2a2420"); for (let i = 234; i < 266; i += 6) p.R(i, 9, 5, 26, i % 12 ? "#3a7aa8" : "#e8e4da");
      T.tiles(p, 0, 60, 280, 90, "#c8bca8", "#bcb09a", 10); p.seed(5); for (let k = 0; k < 12; k++) p.R(p.rnd() * 270, 62 + p.rnd() * 84, 6, 1, "rgba(90,70,50,.25)");
      T.sides(p, this, "#5a4a3a", [["B", 100, 36]]);
    },
    props:[
      // 白色機車（沒車牌）
      { y:100, draw(p){ p.R(56, 92, 10, 8, O); p.R(57, 93, 8, 6, "#2a2a2a"); p.R(84, 92, 10, 8, O); p.R(85, 93, 8, 6, "#2a2a2a"); p.R(58, 78, 34, 16, O); p.R(59, 79, 32, 14, "#f4f4f0"); p.R(62, 76, 16, 6, O); p.R(63, 77, 14, 4, "#2a2a2a"); p.R(86, 70, 4, 10, O); p.R(82, 68, 12, 3, O); p.R(83, 69, 10, 1, "#8a8e94"); p.R(59, 86, 32, 1, "#c8ccd0"); p.R(58, 82, 3, 3, "#8a8e94"); p.R(64, 79, 6, 2, "#8a8a8a"); } },
      // 矮桌：手機、一疊信封
      { y:122, draw(p){ T.box(p, 130, 96, 56, 18, 8, "#8a5a3a", "#5a3a22"); p.R(140, 98, 10, 7, O); p.R(141, 99, 8, 5, "#1e2024"); p.R(142, 100, 6, 3, "#2a3a5a"); p.R(162, 98, 18, 10, O); p.R(163, 99, 16, 8, "#f4f0e0"); p.R(164, 101, 14, 1, "#c8302a"); p.R(165, 103, 10, 1, "#7a7a8a"); p.R(170, 100, 8, 8, "rgba(0,0,0,.08)"); } },
      // 掛著外套的塑膠椅、兩張塑膠凳
      { y:104, draw(p){ T.chair(p, 214, 104, "#3a6ad8", "left"); p.R(214, 80, 8, 18, O); p.R(215, 81, 6, 16, "#2a3a6a"); p.R(213, 86, 3, 8, "#2a3a6a"); p.R(219, 92, 2, 2, "#8a8e94"); } },
      { y:120, draw(p){ T.chair(p, 112, 120, "#e83a3a", "right"); } },
      { y:112, draw(p){ T.chair(p, 40, 112, "#3a8a3a", "right"); } },
      // 米桶（廚房門口）
      { y:96, draw(p){ T.box(p, 240, 72, 22, 10, 12, "#e8e4da", "#a8a49a"); p.R(240, 70, 22, 4, O); p.R(241, 71, 20, 2, has("e_arrest") ? "#4a4e54" : "#c8302a"); if (has("e_arrest")){ p.R(244, 74, 10, 4, "#e9c45a"); p.R(246, 75, 4, 1, "#fff2b0"); p.R(254, 74, 4, 3, "#c8c8c0"); } } },
      // 舊電視櫃
      { y:84, draw(p){ T.box(p, 140, 64, 46, 10, 10, "#6a4a2a", "#4a3020"); p.R(148, 52, 30, 14, O); p.R(149, 53, 28, 12, "#2a2a2e"); p.R(150, 54, 10, 4, "rgba(255,255,255,.08)"); } }
    ],
    front(p, g, t, o){ p.R(140, 0, 1, 10, O); p.R(136, 10, 9, 4, O); p.R(137, 11, 7, 2, "#f4f0c0"); T.glow(g, 140, 14, 40, "255,240,190", .1); tone(g, this, o, .3); },
    solid:[[54,68,42,34],[128,94,60,28],[138,50,50,26],[238,68,26,28]],
    exits:[]
  };
  setLoc("linhome", { start:"lroom", spawn:[118,142], rooms:{ lroom },
    spots:{
      ev_bike:[54,66,42,34,76,108,"lroom",A("crouch",{ actT:1.6, face:-1 })],
      ev_helmet:[98,26,34,16,114,72,"lroom",A("look",{ actT:1.6 })],
      ev_jacket:[210,78,14,20,228,112,"lroom",A("look",{ face:-1 })],
      ev_japhone:[138,96,14,10,144,126,"lroom",A("text",{ actT:2 })],
      ev_gun:[238,66,26,18,250,100,"lroom",A("rummage",{ actT:2 })],
      o11_paint:[12,6,36,54,30,72,"lroom",A("look",{ actT:1.6 })],
      o11_photo2:[144,10,26,22,206,72,"lroom",A("look")]
    },
    details:{ d11_bills:[160,96,22,14,172,126,"lroom",A("read")] },
    place:{
      jc:[ { room:"lroom", x:112, y:120, act:"sit", facing:1, view:"side" }, { room:"lroom", x:112, y:120, act:"sit", facing:1, view:"side" }, null ],
      ja:[ { room:"lroom", x:40, y:112, act:"sit", facing:1, view:"side" }, { room:"lroom", x:40, y:112, act:"sit", facing:1, view:"side" }, null ]
    },
    plan:[ { name:"林家（南澳老街）", w:100, h:30, rooms:{ lroom:[0,0,100,30] } } ] });

  /* ---------- 邱家書房：18 樓、整面窗看港口；一張還沒拆完包裝的嬰兒床 ---------- */
  const qroom = { name:"邱家書房", w:272, h:150, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 272, 60, "#eceae4", "plain", { base:"#3a3a3e" });
      // 白板＋超音波照片（嬰兒床上方）
      p.R(16, 8, 48, 32, O); p.R(17, 9, 46, 30, "#f8f8f8"); p.R(30, 13, 14, 12, "#1a1a1e"); p.R(33, 16, 8, 6, "#5a5a60"); p.R(36, 18, 3, 3, "#8a8a90"); p.R(35, 11, 4, 3, "#e9c45a"); p.R(48, 16, 12, 1, "#e85a8a"); p.R(48, 20, 10, 1, "#e85a8a"); p.R(20, 30, 20, 1, "#2a5ad8");
      // 落地窗：港口、貨櫃起重機、海
      window2(p, 76, 4, 112, 52, o, t, (x, y, w, h) => { p.R(x, y + h * .58, w, h * .42, night(o) ? "#0a1a2a" : "#3a6a90"); cityView(p, o)(x, y, w, h * .58);
          for (const cx of [x + 20, x + 70]){ p.R(cx, y + 8, 2, h * .5, "#c8302a"); p.R(cx - 8, y + 8, 22, 2, "#c8302a"); p.R(cx + 10, y + 10, 1, 8, "#5a5e64"); }
          for (let i = 0; i < w; i += 11) p.R(x + i, y + h * .6 + 3 + (i % 5), 6, 1, night(o) ? "#2a3a4a" : "#9ac0d8"); p.R(x + 40, y + h * .62, 18, 4, "#e8e4da"); }, "#2a2a2e");
      // 書櫃（理財書、一隻金色公牛）
      T.shelf(p, 200, 6, 60, 52, 3, "#3a2a20"); T.books(p, 203, 9, 54, 14, 7); T.books(p, 203, 25, 34, 14, 9); p.R(240, 30, 14, 8, O); p.R(241, 31, 12, 6, "#e9c45a"); p.R(240, 29, 3, 2, "#e9c45a"); p.R(251, 29, 3, 2, "#e9c45a"); T.books(p, 203, 41, 54, 14, 13);
      laminate(p, 0, 60, 272, 90, "#b8946a");
      T.sides(p, this, "#3a3a3e", [["B", 116, 36]]);
    },
    props:[
      // 嬰兒床（包裝還沒拆完）
      { y:116, draw(p){ T.box(p, 18, 80, 46, 20, 14, "#f4f0e8", "#d8d0c0"); for (let i = 20; i < 62; i += 4) p.R(i, 70, 1, 12, "#d8c8a8"); p.R(18, 68, 46, 3, O); p.R(19, 69, 44, 1, "#e8dcc0"); p.R(22, 84, 38, 12, "rgba(220,235,245,.55)"); p.R(24, 86, 12, 2, "#ffffff"); p.R(40, 70, 10, 8, O); p.R(41, 71, 8, 6, "#f8e0e8"); p.R(42, 73, 6, 1, "#c8302a"); p.R(54, 98, 10, 14, O); p.R(55, 99, 8, 12, "#c8a878"); } },
      { y:108, draw(p){ T.chair(p, 82, 108, "#d8c8a8", "left"); } },
      // 書桌：平板、抽屜（手機、當票）
      { y:104, draw(p, g, t){ T.box(p, 196, 76, 62, 14, 12, "#5a4030", "#3a2a20"); p.R(204, 92, 22, 8, O); p.R(205, 93, 20, 6, "#4a3424"); p.R(213, 95, 4, 1, "#c8a050"); p.R(228, 92, 22, 8, O); p.R(229, 93, 20, 6, "#4a3424"); p.R(237, 95, 4, 1, "#c8a050");
          p.R(236, 76, 16, 10, O); p.R(237, 77, 14, 8, "#1a1c22"); for (let k = 0; k < 12; k++) p.R(238 + k, 80 + Math.round(Math.sin(k * .8 + t) * 1.5) + Math.floor(k / 4), 1, 1, k > 6 ? "#e84a3a" : "#3ae87a");
          p.R(200, 78, 22, 8, O); p.R(201, 79, 20, 6, "#f4f0e6"); p.R(224, 78, 8, 8, O); p.R(225, 79, 6, 6, "#f4f4f0"); p.R(226, 80, 4, 3, "#3a2a1a"); } },
      { y:120, draw(p){ T.chair(p, 226, 120, "#1e1e22", "up"); } },
      // 洗衣籃（一件淺藍襯衫）
      { y:124, draw(p){ T.box(p, 150, 108, 22, 10, 8, "#d8c8a8", "#b8a888"); for (let i = 152; i < 170; i += 3) p.R(i, 118, 1, 7, "#a89878"); p.R(153, 106, 14, 6, O); p.R(154, 107, 12, 4, "#a8c8e8"); p.R(160, 107, 2, 4, "#f4f4f0"); } }
    ],
    front(p, g, t, o){ tone(g, this, o, .3); },
    solid:[[16,70,50,46],[194,74,66,30],[148,106,26,20],[198,4,64,56]],
    exits:[]
  };
  setLoc("qiuhome", { start:"qroom", spawn:[134,142], rooms:{ qroom },
    spots:{
      ev_phone2:[202,90,26,12,214,110,"qroom",A("drawer",{ actT:1.6 })],
      o11_pawn:[226,90,26,12,240,110,"qroom",A("drawer",{ actT:1.6 })],
      o11_crypto:[234,74,20,14,252,110,"qroom",A("read",{ actT:1.6 })],
      o11_shirt:[148,102,26,16,160,132,"qroom",A("look",{ face:-1 })],
      o11_crib:[18,66,46,34,74,124,"qroom",A("look")]
    },
    details:{ d11_ultra:[28,10,18,18,40,64,"qroom",A("look")] },
    place:{ shan:[ null, null, { room:"qroom", x:82, y:108, act:"sit", facing:-1, view:"side" } ] },
    plan:[ { name:"港景大樓 18 樓・邱家", w:100, h:30, rooms:{ qroom:[0,0,100,30] } } ] });
})();
