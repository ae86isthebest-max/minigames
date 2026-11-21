/* =========================================================
   第 45 集・俯視版（topdown.js）
   澄港看守所（大門和接見登記處、第 2 接見室、衛生科、忠二舍的值勤台、走廊、7 房：新的）；殯儀館的解剖室（CG_MORGUE）；
   鑑識中心（CG_LAB）；海風咖啡（外面的座位）；黃金水的家（門口、一樓後面的房間＝第 44 集，三天以後）。
   這一集的「你」是許知夏；跟著你的人（小吳）不畫。
   ========================================================= */
const C45T = typeof TOPEP === "function" ? TOPEP("detention") : null;

/* ================= 澄港看守所 ================= */
C45T && (() => {
  const { EP, T, O, sh, ph, dA, A, night, tone, fluo, vinyl, window2, setLoc } = C45T;
  const W0 = EP.world.jail || {};
  const NT = o => night(o);
  const conc = (p, x, y, w, h, col, seed) => { p.R(x, y, w, h, col); p.seed(seed || 45); for (let k = 0; k < w * h / 30; k++) p.R(x + p.rnd() * w, y + p.rnd() * h, 1, 1, k % 2 ? sh(col, .06) : sh(col, -.07)); };
  const grayWall = (p, w, H, col) => { p.R(0, 0, w, H, col); p.R(0, 0, w, 3, sh(col, -.12)); p.R(0, H - 8, w, 8, sh(col, -.2)); p.R(0, H - 8, w, 1, sh(col, -.3)); };

  /* ---------- 大門和接見登記處（戶外）：左邊是登記處的小屋（壓克力公告板、窗口裡的管理員、檯面上厚厚的登記簿、往接見室的門）；
       中間是灰色的大門（招牌、右下角的小門，門上一支鏡頭）；右邊屋簷下的寄物櫃（二十四格）、長椅；遠處圍牆上的崗哨 ---------- */
  const gate = { name:"澄港看守所・大門", w:320, h:160, wall:72,
    floor(p, g, t, o){ const n = NT(o);
      p.R(0, 0, 320, 72, n ? "#14203a" : "#a8cce8");
      // 高牆＋崗哨
      p.R(90, 6, 230, 66, n ? "#5a5a56" : "#b8b4a8"); p.R(90, 6, 230, 3, n ? "#6a6a64" : "#d0ccc0"); for (let x = 92; x < 320; x += 6) p.R(x, 2, 1, 5, "#5a5a5e"); p.R(90, 4, 230, 1, "#5a5a5e");
      p.R(290, 0, 24, 16, O); p.R(291, 1, 22, 14, n ? "#4a4a46" : "#9a968a"); p.R(294, 4, 16, 5, n ? "#e8d8a0" : "#2a3a4a"); p.R(288, 0, 28, 2, "#3a3a3e");
      // 登記處的小屋
      p.R(0, 18, 90, 54, n ? "#7a7468" : "#d8d0bc"); p.R(0, 14, 92, 6, O); p.R(0, 15, 92, 4, "#5a6a7a"); p.R(89, 18, 1, 54, O);
      p.R(10, 38, 18, 24, O); p.R(11, 39, 16, 22, "#f4f4f0"); p.R(11, 39, 16, 3, "#c8302a"); for (let k = 0; k < 5; k++) p.R(13, 44 + k * 3, 12, 1, "#c8302a");
      p.R(32, 26, 28, 30, O); p.R(33, 27, 26, 28, n ? "#e8d8a0" : "#9cb8c8"); p.R(38, 32, 10, 12, "#3a4a6a"); p.R(40, 28, 6, 5, "#d8a880"); p.R(40, 27, 6, 2, "#2a2a2a");
      p.R(30, 56, 32, 4, O); p.R(31, 56, 30, 3, "#8a6a42");
      // 大門
      p.R(112, 8, 76, 12, O); p.R(113, 9, 74, 10, "#2a3a5a"); for (let k = 0; k < 6; k++) p.R(118 + k * 11, 11, 7, 6, "#f4f4f0");
      p.R(112, 20, 76, 52, O); p.R(113, 21, 74, 51, "#6a7480"); for (let x = 116; x < 186; x += 6) p.R(x, 22, 1, 48, "#5a6470"); p.R(150, 21, 1, 51, "#4a5460");
      T.backDoor(p, 166, 46, 18, 26, dA("gate", "desk"), "#7a8490", { frame:"#4a5460", inside:"#2a2e34" });
      T.cam(p, 192, 24, -1, t);
      // 屋簷＋寄物櫃＋長椅
      p.R(198, 34, 100, 6, O); p.R(198, 35, 100, 4, "#5a6a7a");
      p.R(202, 42, 52, 30, O); p.R(203, 43, 50, 29, "#a8acb0"); for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++){ p.R(204 + c * 8, 44 + r * 7, 7, 6, "#c8ccd0"); p.R(208 + c * 8, 46 + r * 7, 2, 2, "#3a3a3e"); }
      // 地：水泥＋停車格
      conc(p, 0, 72, 320, 88, n ? "#4a4a46" : "#a8a49a", 451); for (const x of [220, 260, 300]) p.R(x, 112, 2, 48, "#e8e4d8");
    },
    props:[
      { y:76, draw(p){ T.box(p, 262, 62, 30, 6, 6, "#5a7a64", "#3a5a44", { legs:2 }); } }
    ],
    front(p, g, t, o){ if (NT(o)){ T.glow(g, 56, 40, 40, "255,236,180", .14); T.glow(g, 150, 30, 60, "255,236,180", .1); } tone(g, this, o, 1); },
    solid:[[0,0,320,74],[260,60,34,16]],
    exits:[ { r:[166,72,18,6], to:"desk", at:[24,104], label:"小門（忠二舍）", kind:"door", art:[166,46,18,26] },
            { r:[64,72,20,6], to:"visit", at:[28,80], label:"接見室", kind:"door", art:[62,28,24,44] } ]
  };
  // 登記處的門（往接見室）：畫在窗口的右邊
  const _gf = gate.floor; gate.floor = function(p, g, t, o){ _gf.call(this, p, g, t, o); T.backDoor(p, 64, 36, 20, 36, dA("gate", "visit"), "#6a5a4a", { frame:"#4a3a2a" }); p.R(66, 28, 16, 6, O); p.R(67, 29, 14, 4, "#e8e2d2"); };

  /* ---------- 第 2 接見室：一片到頂的透明隔板把房間切成兩半；左邊是律師那一邊（門、門邊的牌子、文件傳遞的板夾），右邊是收容人那一邊
       （錄影主機、牆角的鏡頭、鎖著的門）；隔板前後各一張桌子、一張椅子；牆上的告示 ---------- */
  const visit = { name:"律師接見室", w:256, h:136, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 60, "#d8dcd4", "plain", { base:"#5a6a64" });
      T.backDoor(p, 16, 16, 24, 44, dA("visit", "gate"), "#6a7480", { frame:"#3a4450" });
      p.R(44, 8, 30, 8, O); p.R(45, 9, 28, 6, "#2a4a8a"); p.R(48, 11, 20, 2, "#f4f4f0");
      p.R(48, 22, 10, 14, O); p.R(49, 23, 8, 12, "#8a6a42"); p.R(50, 25, 6, 9, "#f8f8f4"); p.R(51, 22, 4, 2, "#c8c8c8");
      p.R(100, 8, 56, 8, O); p.R(101, 9, 54, 6, "#f4f0e0"); p.R(104, 11, 48, 1, "#c8302a"); p.R(104, 13, 34, 1, "#5a5a5a");
      T.backDoor(p, 210, 16, 24, 44, 0, "#7a8288", { frame:"#4a5056" }); p.R(219, 22, 6, 6, "#3a4048");
      p.R(184, 20, 20, 14, O); p.R(185, 21, 18, 12, "#2a2a2e"); p.R(187, 23, 6, 3, "#3ae04a"); p.R(195, 24, 6, 1, "#8a8e94"); p.R(199, 29, 2, 2, "#e83a2a");
      T.cam(p, 244, 4, -1, t);
      vinyl(p, 0, 60, 256, 76, "#b8bcb4", "#b0b4ac", 16);
      T.sides(p, this, "#5a6a64", []);
    },
    props:[
      // 兩邊的桌子
      { y:96, draw(p){ T.box(p, 86, 78, 38, 10, 8, "#c8c4b8", "#8a8a80"); T.box(p, 132, 78, 38, 10, 8, "#c8c4b8", "#8a8a80"); p.R(118, 80, 3, 5, "#3a3a3e"); p.R(135, 80, 3, 5, "#3a3a3e"); } },
      { y:106, draw(p){ T.chair(p, 100, 106, "#5a6a7a", "up"); T.chair(p, 152, 106, "#8a6a42", "up"); } },
      // 到頂的透明隔板（通話孔）
      { y:122, draw(p){ p.R(125, 40, 6, 82, O); p.R(126, 40, 4, 82, "rgba(200,225,235,.7)"); p.R(127, 42, 1, 78, "rgba(255,255,255,.7)"); for (let k = 0; k < 3; k++) p.R(126, 62 + k * 3, 4, 1, "#3a3a3e"); } }
    ],
    front(p, g, t, o){ fluo(p, 64, 2, 50); fluo(p, 190, 2, 50); tone(g, this, o, .2); },
    solid:[[0,0,256,62],[124,40,8,90],[84,76,42,20],[132,76,40,20]],
    exits:[ { r:[16,60,24,8], to:"gate", at:[73,84], label:"接見登記處（大門）", kind:"out", art:[16,16,24,44] } ]
  };

  /* ---------- 衛生科：診療床、牆上的血壓計、視力表；辦公桌（一疊健康檢查表、壓著的那一張、電腦）；玻璃門的藥櫃（胃乳的盒子）；洗手台、身高尺 ---------- */
  const clinic = { name:"衛生科", w:240, h:140, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 240, 60, "#e4ece8", "plain", { base:"#6a8a84" });
      p.R(24, 16, 14, 18, O); p.R(25, 17, 12, 16, "#e8e8e4"); p.R(27, 19, 8, 6, "#2a2a2e"); p.R(28, 20, 4, 3, "#3ae04a"); p.R(30, 27, 2, 6, "#3a3a3e");
      p.R(48, 12, 14, 18, O); p.R(49, 13, 12, 16, "#f8f8f4"); for (let k = 0; k < 5; k++) p.R(51 + k, 15 + k * 3, 8 - k * 2, 2, "#1e1e22");
      p.R(212, 10, 8, 48, O); p.R(213, 11, 6, 46, "#f4f4f0"); for (let y = 13; y < 56; y += 4) p.R(213, y, 3, 1, "#5a5a5a");
      vinyl(p, 0, 60, 240, 80, "#c8d4d0", "#c0ccc8", 16);
      T.sides(p, this, "#6a8a84", [["L", 84, 28]]);
      T.sideDoor(p, this, "L", 84, 28, dA("clinic", "desk"), "#8a8e94");
    },
    props:[
      // 藥櫃（玻璃門）
      { y:66, draw(p){ T.box(p, 150, 20, 30, 10, 36, "#c8ccd0", "#a8acb0"); p.R(152, 32, 26, 28, "rgba(220,235,240,.8)"); p.R(152, 44, 26, 1, "#8a8e94"); for (let k = 0; k < 4; k++) p.R(154 + k * 6, 35, 4, 8, ["#f4f4f0", "#e8c040", "#f4f4f0", "#3a8ac8"][k]); p.R(154, 47, 12, 8, "#f4f4f0"); p.R(155, 49, 10, 2, "#3aa86a"); p.R(170, 47, 6, 8, "#c88a3a"); } },
      // 洗手台
      { y:60, draw(p){ p.R(190, 42, 24, 16, O); p.R(191, 43, 22, 14, "#e8ecec"); p.R(194, 46, 16, 8, "#9aaab4"); p.R(201, 38, 2, 6, "#8a8e94"); } },
      // 診療床
      { y:88, draw(p){ p.R(16, 66, 36, 20, O); p.R(17, 67, 34, 18, "#3a8a8a"); p.R(17, 67, 10, 18, "#4a9a9a"); p.R(28, 67, 23, 18, "#f4f4f0"); p.R(28, 76, 23, 1, "#d8d8d4"); p.R(18, 86, 3, 4, O); p.R(47, 86, 3, 4, O); } },
      // 辦公桌：一疊表、壓著的那一張、電腦
      { y:90, draw(p){ T.box(p, 80, 70, 62, 12, 8, "#c8b898", "#8a7a5a");
          p.R(84, 70, 10, 8, O); for (let k = 0; k < 3; k++) p.R(85, 71 + k, 8, 6, k === 2 ? "#f8f8f4" : "#e8e8e0");
          p.R(98, 71, 12, 8, O); p.R(99, 72, 10, 6, "#f8f8f4"); for (let k = 0; k < 3; k++) p.R(100, 73 + k * 2, 8, 1, "#5a5a6a");
          p.R(124, 58, 14, 12, O); p.R(125, 59, 12, 9, "#1e2226"); p.R(126, 60, 10, 7, "#4a7aa8"); p.R(130, 70, 2, 2, O); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 50); fluo(p, 170, 2, 50); tone(g, this, o, .2); },
    solid:[[0,0,240,62],[16,64,36,26],[80,68,62,22],[150,20,30,46]],
    exits:[ { r:[0,84,6,28], to:"desk", at:[256,74], label:"值勤台", kind:"door", art:[0,82,8,32] } ]
  };

  /* ---------- 忠二舍・值勤台：牆上的報告燈面板（十二個燈、下面的小螢幕）、常備藥櫃；值勤台（兩台螢幕、簽到表、巡邏感應的印表機、涼掉的茶）、椅子；
       保管櫃（十個小門）、下面的長桌（保管袋、托盤：鑰匙、手環）；左邊的門往大門，裡面的門往衛生科，右邊往走廊 ---------- */
  const desk = { name:"忠二舍・值勤台", w:288, h:140, wall:60,
    floor(p, g, t, o){ const n = NT(o);
      grayWall(p, 288, 60, "#d4d8d0");
      // 報告燈面板（7 房的燈）
      p.R(28, 16, 20, 22, O); p.R(29, 17, 18, 20, "#3a3e44"); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++){ const on = r === 0 && c === 1 && n && Math.floor(t * 3) % 2; p.R(31 + c * 4, 19 + r * 4, 3, 3, on ? "#e83a2a" : "#5a1a1a"); } p.R(31, 32, 14, 4, "#1e2226"); p.R(32, 33, 6, 2, "#3a8a5a");
      // 常備藥櫃
      p.R(96, 12, 22, 20, O); p.R(97, 13, 20, 18, "#f4f4f0"); p.R(97, 13, 20, 4, "#c8302a"); p.R(105, 14, 4, 2, "#f4f4f0"); p.R(99, 19, 16, 10, "rgba(200,220,230,.6)"); p.R(100, 21, 4, 6, "#e8c040"); p.R(106, 21, 4, 6, "#f4f4f0");
      // 保管櫃（十個小門）
      p.R(150, 6, 50, 34, O); p.R(151, 7, 48, 32, "#8a9094"); for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++){ p.R(152 + c * 9 + (c > 2 ? 1 : 0), 8 + r * 15, 8, 14, "#a8b0b4"); p.R(157 + c * 9 + (c > 2 ? 1 : 0), 14 + r * 15, 2, 2, "#3a3a3e"); }
      T.backDoor(p, 222, 16, 26, 44, dA("desk", "clinic"), "#8a9094", { frame:"#5a6064" }); p.R(226, 8, 18, 6, O); p.R(227, 9, 16, 4, "#e8e2d2"); p.R(232, 10, 6, 2, "#3aa86a");
      vinyl(p, 0, 60, 288, 80, "#b8bcb4", "#b0b4ac", 16);
      T.sides(p, this, "#5a5e58", [["L", 84, 28], ["R", 80, 28]]);
      T.sideDoor(p, this, "L", 84, 28, dA("desk", "gate"), "#7a8490");
    },
    props:[
      // 值勤台的椅子（台子後面）
      { y:76, draw(p){ T.chair(p, 126, 74, "#2a2a30", "down"); } },
      // 值勤台：兩台螢幕、簽到表、印表機、涼掉的茶
      { y:96, draw(p, g, t){ T.box(p, 50, 78, 84, 12, 8, "#a8987a", "#7a6a4a");
          for (const x of [54, 70]){ p.R(x, 72, 14, 10, O); p.R(x + 1, 73, 12, 7, "#1e2226"); p.R(x + 2, 74, 10, 5, x === 54 ? "#3a5a4a" : "#3a3a4a"); p.R(x + 6, 82, 2, 2, O); }
          p.R(88, 80, 6, 5, O); p.R(89, 81, 4, 3, "#c8a46a");
          p.R(96, 80, 14, 8, O); p.R(97, 81, 12, 6, "#f8f8f4"); for (let k = 0; k < 3; k++) p.R(98, 82 + k * 2, 10, 1, "#5a5a6a");
          p.R(114, 77, 12, 10, O); p.R(115, 78, 10, 8, "#d8d8d4"); p.R(116, 79, 8, 2, "#3a3a3e"); p.R(117, 84, 6, 2, "#f8f8f4"); } },
      // 長桌：保管袋、托盤（鑰匙、手環）
      { y:90, draw(p){ T.box(p, 150, 72, 50, 12, 6, "#c8ccd0", "#8a8e94");
          p.R(152, 70, 14, 12, O); p.R(153, 71, 12, 10, "#c8a060"); p.R(153, 74, 12, 1, "#e8e0d0");
          p.R(168, 74, 28, 8, O); p.R(169, 75, 26, 6, "#5a5e62"); p.R(170, 76, 6, 3, "#c8c8c0"); p.R(172, 79, 2, 1, "#c8a040"); p.R(180, 76, 6, 4, "#2a2a2e"); p.R(182, 77, 2, 2, "#3a3a3a"); p.R(189, 76, 4, 4, "#c8a040"); } }
    ],
    front(p, g, t, o){ fluo(p, 70, 2, 50); fluo(p, 210, 2, 50, NT(o)); tone(g, this, o, .3); },
    solid:[[0,0,288,62],[48,76,88,22],[118,64,16,14],[148,70,54,18]],
    exits:[ { r:[0,84,6,28], to:"gate", at:[175,86], label:"大門", kind:"door", art:[0,82,8,32] },
            { r:[222,60,26,8], to:"clinic", at:[22,98], label:"衛生科", kind:"door", art:[222,16,26,44] },
            { r:[282,80,6,28], to:"hall", at:[24,92], label:"走廊", kind:"door", art:[280,78,8,32] } ]
  };

  /* ---------- 忠二舍・走廊：6 房到 12 房的灰色鐵門（瞻視窗、送餐口）；7 房的門上有封條；最裡面走廊底的牆上是巡邏的感應點；
       這一頭的天花板上一支鏡頭（順著走廊往裡面拍） ---------- */
  const DX = n => 20 + (n - 6) * 44;
  const hall = { name:"忠二舍・走廊", w:352, h:120, wall:60,
    floor(p, g, t, o){ const n = NT(o);
      grayWall(p, 352, 60, "#cfd2c8");
      for (let k = 6; k <= 12; k++){ const x = DX(k);
        T.backDoor(p, x, 16, 24, 44, k === 7 ? dA("hall", "cell") : 0, "#7a8288", { frame:"#4a5056", inside:"#2a2a2e" });
        if (k !== 7 || !dA("hall", "cell")){ p.R(x + 8, 22, 8, 6, O); p.R(x + 9, 23, 6, 4, k === 7 && n ? "#3a3a30" : "#2a2e34"); p.R(x + 6, 40, 12, 3, O); p.R(x + 7, 41, 10, 1, "#5a6066"); }
        p.R(x + 6, 8, 12, 6, O); p.R(x + 7, 9, 10, 4, "#f4f0e0"); p.R(x + 10, 10, 4, 2, "#2a2a2a"); }
      p.R(DX(7) + 2, 30, 20, 4, "#f4f4f0"); p.R(DX(7) + 3, 31, 18, 2, "#c8302a");   // 封條
      p.R(334, 28, 12, 14, O); p.R(335, 29, 10, 12, "#1e1e22"); p.R(338, 32, 4, 4, "#3a6a8a"); p.R(339, 33, 2, 2, "#8ac8e8");
      vinyl(p, 0, 60, 352, 60, "#bcc0b8", "#b4b8b0", 16);
      T.sides(p, this, "#5a5e58", [["L", 72, 28]]);
    },
    props:[],
    front(p, g, t, o){ T.cam(p, 12, 4, 1, t); fluo(p, 80, 2, 50); fluo(p, 190, 2, 50); fluo(p, 290, 2, 50); tone(g, this, o, .25); },
    solid:[[0,0,352,62]],
    exits:[ { r:[0,72,6,28], to:"desk", at:[262,94], label:"值勤台", kind:"door", art:[0,70,8,32] },
            { r:[DX(7),60,24,8], to:"cell", at:[22,76], label:"7 房", kind:"door", art:[DX(7),16,24,44] } ]
  };

  /* ---------- 7 房（獨居房）：門、門邊的報告燈按鈕；垃圾桶；矮牆和後面的不鏽鋼馬桶；牆上的水泥台子（水杯、押票）；
       水泥床（薄墊子，被子掀到床尾）、床頭牆上淺色的一塊；高窗；天花板的燈 ---------- */
  const cell = { name:"7 房", w:192, h:136, wall:60,
    floor(p, g, t, o){
      grayWall(p, 192, 60, "#c8c8bc");
      T.backDoor(p, 10, 16, 24, 44, dA("cell", "hall"), "#7a8288", { frame:"#4a5056", inside:"#cfd2c8" });
      p.R(38, 34, 8, 10, O); p.R(39, 35, 6, 8, "#5a5e62"); p.R(40, 37, 4, 4, "#c8302a");
      p.R(158, 38, 10, 8, "#d8d8cc");
      p.R(170, 8, 14, 12, O); p.R(171, 9, 12, 10, "#9cb8c8"); for (let x = 173; x < 183; x += 3) p.R(x, 9, 1, 10, "#3a3a3e");
      // 水泥台子＋水杯、押票
      p.R(96, 44, 36, 12, O); p.R(97, 45, 34, 10, "#a8a89c"); p.R(97, 45, 34, 2, "#b8b8ac");
      p.R(104, 46, 6, 6, O); p.R(105, 47, 4, 4, "#f4f4f0"); p.R(105, 47, 4, 1, "#d8e8f0");
      p.R(116, 47, 8, 6, O); p.R(117, 48, 6, 4, "#f4f0e0"); p.R(118, 49, 4, 1, "#5a5a5a");
      conc(p, 0, 60, 192, 76, "#a4a498", 452);
      T.sides(p, this, "#6a6a5e", []);
    },
    props:[
      // 垃圾桶（衛生紙、撕開的鋁箔包）
      { y:82, draw(p){ p.R(50, 70, 12, 12, O); p.R(51, 71, 10, 10, "#c8ccd0"); p.R(53, 72, 4, 3, "#f8f8f4"); p.R(57, 73, 3, 2, "#c8c8c8"); } },
      // 矮牆＋馬桶（地上一小灘）
      { y:100, draw(p){ p.R(84, 64, 4, 36, O); p.R(85, 64, 2, 36, "#b8b8ac"); p.R(92, 70, 14, 14, O); p.R(93, 71, 12, 12, "#d8dce0"); p.R(95, 73, 8, 8, "#8a9aa4"); p.R(104, 84, 6, 3, "rgba(230,220,180,.6)"); } },
      // 水泥床（薄墊子；被子掀到床尾；枕頭在上面）
      { y:126, draw(p){ p.R(146, 62, 40, 64, O); p.R(147, 63, 38, 62, "#a8a89c"); p.R(149, 65, 34, 58, "#5a6a7a"); p.R(152, 66, 28, 9, "#e8e8e0"); p.R(150, 108, 32, 14, "#8a7a5a"); p.R(150, 108, 32, 2, "#9a8a6a"); p.R(152, 114, 28, 1, "#6a5a3a"); } }
    ],
    front(p, g, t, o){ p.R(80, 0, 30, 4, O); p.R(81, 1, 28, 2, "#f4f4e8"); T.glow(g, 96, 20, 60, "255,250,230", .06); tone(g, this, o, .3); },
    solid:[[0,0,192,62],[50,70,12,12],[84,64,4,36],[92,70,14,14],[146,62,40,64]],
    exits:[ { r:[10,60,24,8], to:"hall", at:[76,76], label:"走廊", kind:"out", art:[10,16,24,44] } ]
  };

  const XP = { x45_gateguard:{ room:"gate", x:150, y:86, act:"idle", facing:1 } };
  setLoc("jail", { start:"gate", spawn:[150,120], rooms:{ gate, visit, clinic, desk, hall, cell },
    spots:{
      o45_board:[10,38,18,24,19,82,"gate",A("read")],
      doc45_visitlog:[32,54,22,6,44,82,"gate",A("read")],
      o45_locker:[202,42,52,30,228,84,"gate",A("look")],
      o45_partition:[124,40,8,82,116,116,"visit",A("look",{ face:1 })],
      doc45_pass:[48,22,10,14,54,72,"visit",A("read")],
      cctv45_visit:[184,20,20,14,116,72,"visit",A("look",{ face:1 })],
      doc45_health:[98,71,12,8,104,98,"clinic",A("read")],
      o45_antbox:[150,20,30,46,165,74,"clinic",A("look")],
      doc45_patrol:[96,80,14,8,100,106,"desk",A("read")],
      doc45_punch:[114,77,12,10,124,106,"desk",A("look")],
      o45_panel:[28,16,20,22,38,72,"desk",A("look")],
      o45_bag:[152,70,14,12,156,96,"desk",A("look")],
      o45_capsule:[168,74,12,8,174,96,"desk",A("look")],
      o45_band:[180,74,10,8,190,96,"desk",A("look")],
      cctv45_hall:[54,72,14,10,58,106,"desk",A("type",{ actT:2 })],
      cctv45_cell:[70,72,14,10,76,106,"desk",A("type",{ actT:2 })],
      o45_door:[DX(7),16,24,44,DX(7) + 12,78,"hall",A("look")],
      o45_patrolbtn:[334,28,12,14,334,74,"hall",A("look")],
      o45_cam:[4,2,16,10,20,96,"hall",A("look")],
      o45_bed:[146,62,40,64,132,100,"cell",A("look",{ face:1 })],
      o45_cup:[104,46,6,6,108,66,"cell",A("look")],
      o45_packet:[50,70,12,12,56,94,"cell",A("crouch")],
      o45_toilet:[92,70,14,14,100,94,"cell",A("crouch")],
      o45_button:[38,34,8,10,42,70,"cell",A("look")],
      o45_paper:[116,47,8,6,124,68,"cell",A("read")]
    },
    details:{
      d45_sign:[112,8,76,12,130,84,"gate",A("look")],
      d45_bigdoor:[112,20,52,52,136,84,"gate",A("look")],
      d45_clerk:[32,26,28,30,30,92,"gate",A("look",{ face:-1 })],
      d45_tower:[288,0,28,16,290,86,"gate",A("look")],
      d45_bench:[260,60,34,16,276,88,"gate",A("look")],
      d45_gatecam:[184,22,10,8,196,84,"gate",A("look",{ face:-1 })],
      d45_vplate:[44,8,30,8,70,72,"visit",A("read")],
      d45_vsign:[100,8,56,8,96,72,"visit",A("read")],
      d45_ldoor:[16,16,24,44,46,80,"visit",A("look",{ face:-1 })],
      d45_rdoor:[210,16,24,44,114,104,"visit",A("look",{ face:1 })],
      d45_vcam:[236,2,12,10,112,126,"visit",A("look",{ face:1 })],
      d45_bp:[24,16,14,18,60,72,"clinic",A("look",{ face:-1 })],
      d45_couch:[16,66,36,20,34,98,"clinic",A("look")],
      d45_chart:[48,12,14,18,68,72,"clinic",A("look")],
      d45_pc:[124,58,14,12,134,98,"clinic",A("look")],
      d45_stack:[84,70,10,8,86,98,"clinic",A("look")],
      d45_sink:[190,38,24,20,202,72,"clinic",A("look")],
      d45_meddesk:[96,12,22,20,100,70,"desk",A("look")],
      d45_tea:[88,80,6,5,86,106,"desk",A("look")],
      d45_cabs:[150,6,50,34,212,74,"desk",A("look",{ face:-1 })],
      d45_chair:[118,64,16,14,108,66,"desk",A("look",{ face:-1 })],
      d45_ddoor:[0,82,8,32,16,120,"desk",A("look",{ face:-1 })],
      d45_door6:[DX(6),16,24,44,DX(6) + 12,96,"hall",A("look")],
      d45_door8:[DX(8),16,24,44,DX(8) + 12,78,"hall",A("look")],
      d45_far:[DX(9),16,DX(12) + 24 - DX(9),44,240,78,"hall",A("look")],
      d45_tube:[176,0,30,4,190,96,"hall",A("look")],
      d45_cdoor:[10,16,24,44,24,82,"cell",A("look")],
      d45_win:[170,8,14,12,132,72,"cell",A("look",{ face:1 })],
      d45_patch:[158,38,10,8,132,86,"cell",A("look",{ face:1 })],
      d45_lowwall:[84,64,4,36,72,106,"cell",A("look",{ face:1 })],
      d45_light:[80,0,30,4,60,116,"cell",A("look")]
    },
    place:{
      ye:[ { room:"hall", x:DX(7) + 34, y:80, act:"write", facing:-1 }, { room:"desk", x:40, y:106, act:"read", facing:1 } ],
      qi:[ { room:"desk", x:212, y:100, act:"idle", facing:-1 }, { room:"gate", x:120, y:100, act:"idle", facing:1 } ],
      luo:[ { room:"hall", x:300, y:80, act:"idle", facing:-1 }, { room:"desk", x:24, y:122, act:"idle", facing:1 } ],
      wuu:[ { room:"desk", x:126, y:76, act:"sit", facing:-1 }, { room:"visit", x:30, y:96, act:"idle", facing:1 } ],
      wen:[ { room:"clinic", x:120, y:104, act:"idle", facing:-1 }, { room:"clinic", x:120, y:104, act:"write", facing:-1 } ],
      chang:[ { room:"hall", x:DX(6) + 12, y:76, act:"idle", facing:1 }, { room:"hall", x:DX(6) + 12, y:76, act:"idle", facing:1 } ],
      son:[ { room:"gate", x:200, y:110, act:"hold", facing:-1 }, { room:"gate", x:250, y:112, act:"phone", facing:-1 } ],
      fang:[ { room:"desk", x:232, y:100, act:"idle", facing:-1 }, { room:"desk", x:232, y:100, act:"idle", facing:-1 } ]
    },
    extras:(W0.extras || []).map(e => Object.assign({}, e, XP[e.id] || {}, { pose:undefined })),
    intro:[ { set:{ room:"gate", px:150, py:120 } }, ...(W0.intro || []).filter(k => k.say) ],
    plan:[ { name:"澄港看守所", w:100, h:52, rooms:{ visit:[0,0,30,18], clinic:[30,0,30,18], cell:[60,0,16,18], desk:[30,18,30,16], hall:[60,18,40,16], gate:[0,34,100,18,"out"] } } ] });
})();

/* ================= 殯儀館・解剖室（CG_MORGUE） ================= */
C45T && (() => {
  const { EP, T, O, A, setLoc } = C45T;
  if (typeof CG_MORGUE !== "function") return;
  const R0 = CG_MORGUE(C45T, { props:[
    // 解剖台旁邊的盤子（心臟、秤）、推車上的量杯
    { y:62, draw(p){ p.R(170, 46, 22, 3, O); p.R(171, 46, 20, 2, "#8a8e94"); p.R(173, 36, 16, 10, O); p.R(174, 37, 14, 8, "#5a4a3a"); p.R(176, 39, 6, 4, "#c8c0a0"); p.R(184, 39, 2, 2, "#3a3a3a"); } },
    { y:101, draw(p){ p.R(186, 76, 10, 6, O); p.R(187, 77, 8, 4, "#c8ccd0"); p.R(189, 77, 4, 3, "#a83a3a"); p.R(200, 76, 6, 7, O); p.R(201, 77, 4, 5, "rgba(230,240,240,.8)"); p.R(201, 80, 4, 2, "#c8b890"); } }
  ] });
  const aut = Object.assign({}, R0, { name:"殯儀館・解剖室",
    floor(p, g, t, o){ R0.floor.call(this, p, g, t, o); T.sides(p, this, "#5a6a6a", [["B", 112, 32], ["L", 80, 28]]); T.sideDoor(p, this, "L", 80, 28, 0, "#8a9aa0"); p.R(212, 10, 24, 14, O); p.R(213, 11, 22, 12, "#f4f4f0"); for (let k = 0; k < 3; k++) p.R(215, 13 + k * 3, 18, 1, "#5a5a5a"); }
  });
  setLoc("morgue", { start:"aut", spawn:[128,140], rooms:{ aut },
    spots:{
      o45_body:[74,64,88,18,120,104,"aut",A("look")],
      o45_heart:[186,76,10,6,190,106,"aut",A("look")],
      o45_stomach:[200,76,6,7,206,106,"aut",A("look")],
      o45_neck:[96,10,50,28,56,72,"aut",A("look")],
      doc45_temp:[212,10,24,14,224,64,"aut",A("read")],
      o45_radio:[172,34,18,14,180,64,"aut",A("look")]
    },
    details:{
      d45_fridge:[8,8,58,50,36,72,"aut",A("look",{ face:-1 })],
      d45_adoor:[0,78,8,32,16,100,"aut",A("look",{ face:-1 })],
      d45_lamp:[100,58,40,6,150,104,"aut",A("look")]
    },
    place:{ qian:[ { room:"aut", x:150, y:100, act:"idle", facing:-1 }, { room:"aut", x:150, y:100, act:"write", facing:-1 } ] },
    extras:(EP.world.morgue || {}).extras || [],
    plan:[ { name:"殯儀館・解剖室", w:100, h:30, rooms:{ aut:[0,0,100,30] } } ] });
})();

/* ================= 鑑識中心（CG_LAB） ================= */
C45T && (() => {
  const { EP, T, O, A, has, setLoc } = C45T;
  if (typeof CG_LAB !== "function") return;
  const R0 = CG_LAB(C45T, { props:[
    // 比對顯微鏡
    { y:105, draw(p){ p.R(38, 70, 22, 16, O); p.R(39, 71, 20, 14, "#e8ecf0"); p.R(41, 66, 5, 6, O); p.R(42, 67, 3, 4, "#3a3a3e"); p.R(52, 66, 5, 6, O); p.R(53, 67, 3, 4, "#3a3a3e"); p.R(45, 74, 8, 3, "#5a5a5e"); } },
    // 推車：接著讀取線的手環、一排檢體管
    { y:122, draw(p){ T.box(p, 120, 100, 34, 12, 8, "#c8ccd0", "#8a9094"); p.R(123, 102, 10, 7, O); p.R(124, 103, 8, 5, "#1e1e22"); p.R(126, 104, 4, 3, "#2a2a2e"); p.R(133, 105, 6, 1, "#3a3a3e");
        for (let k = 0; k < 5; k++){ p.R(140 + k * 3, 101, 2, 8, O); p.R(140 + k * 3, 102, 1, 6, ["#c83a2a", "#e8c040", "#c83a2a", "#3a8ac8", "#f4f4f0"][k]); } p.R(122, 120, 3, 3, O); p.R(149, 120, 3, 3, O); } },
    // 板夾（夾著一張照片）
    { y:62, draw(p){ p.R(164, 14, 10, 14, O); p.R(165, 15, 8, 12, "#8a6a42"); p.R(166, 17, 6, 9, "#f8f8f4"); p.R(167, 18, 4, 5, "#9cb8a8"); p.R(167, 14, 4, 2, "#c8c8c8"); } }
  ], solid:[[118,98,38,22]] });
  const lab = Object.assign({}, R0, { floor(p, g, t, o){ R0.floor.call(this, p, g, t, o); T.sides(p, this, "#4a5a6a", [["B", 128, 32], ["R", 80, 28]]); T.sideDoor(p, this, "R", 80, 28, 0, "#8a9094"); } });
  setLoc("lab", { start:"lab", spawn:[144,140], rooms:{ lab },
    spots:{ o45_medphoto:[164,14,10,14,168,70,"lab",A("look")] },
    details:{
      d45_scope:[36,64,26,24,48,112,"lab",A("look")],
      d45_screen:[186,58,64,14,236,94,"lab",A("look")],
      d45_reader:[120,100,34,12,136,128,"lab",A("look")]
    },
    place:{ kui:[ { room:"lab", x:76, y:112, act:"type", facing:1 }, { room:"lab", x:76, y:112, act:"look", facing:1 } ] },
    extras:(EP.world.lab || {}).extras || [],
    plan:[ { name:"鑑識中心", w:100, h:20, rooms:{ lab:[0,0,100,20] } } ] });
})();

/* ================= 海風咖啡（外面的座位） ================= */
C45T && (() => {
  const { EP, T, O, A, setLoc } = C45T;
  const W0 = EP.world.cafe || {};
  let ST = null; const st = () => ST || (ST = (typeof TOPSCENE !== "undefined" && TOPSCENE.STAGES && TOPSCENE.STAGES.cafe) ? TOPSCENE.STAGES.cafe({ time:"morning", ep:45 }).room : null);
  // 最右邊那一桌：一份摺起來的早報
  const seat = { name:"海風咖啡・外面的座位", w:320, h:162, wall:58,
    floor(p, g, t, o){ const R = st(); if (R) R.floor.call(this, p, g, t, o); else p.R(0, 0, 320, 162, "#8a8a86"); },
    get props(){ const R = st(); return (R ? R.props : []).concat([
      { y:107, draw(p){ p.R(246, 96, 14, 9, O); p.R(247, 97, 12, 7, "#ecece4"); p.R(248, 98, 10, 2, "#2a2a2a"); p.R(248, 101, 6, 1, "#5a5a5a"); p.R(253, 97, 1, 7, "#c8c8c0"); } } ]); },
    front(p, g, t, o){ const R = st(); if (R && R.front) R.front.call(this, p, g, t, o); },
    solid:[[0,0,320,60],[68,88,48,22],[144,88,48,22],[220,88,48,22],[122,70,18,18],[296,72,16,14],[0,136,320,26]],
    exits:[]
  };
  const XP = { x45_mom:{ room:"seat", x:200, y:78, act:"hold", facing:-1 } };
  setLoc("cafe", { start:"seat", spawn:[200,124], rooms:{ seat },
    spots:{ o45_news:[246,96,14,9,254,120,"seat",A("read")] },
    details:{
      d45_station:[0,132,320,30,160,126,"seat",A("look")],
      d45_dog:[176,108,22,10,186,124,"seat",A("look")],
      d45_menu:[122,70,18,18,131,96,"seat",A("read")]
    },
    place:{
      shen:[ { room:"seat", x:60, y:107, act:"sit", facing:1, view:"side" }, { room:"seat", x:60, y:107, act:"sit", facing:1, view:"side" } ],
      su:[ { room:"seat", x:276, y:107, act:"sit", facing:-1, view:"side" }, { room:"seat", x:276, y:107, act:"sit", facing:-1, view:"side" } ]
    },
    extras:(W0.extras || []).map(e => Object.assign({}, e, XP[e.id] || {}, { pose:undefined })),
    plan:[ { name:"海風咖啡", w:100, h:28, rooms:{ seat:[0,0,100,28,"out"] } } ] });
})();

/* ================= 黃金水的家（＝第 44 集，三天以後） ================= */
C45T && (() => {
  const { EP, A, setLoc } = C45T;
  const H = typeof MK44HOME === "function" ? MK44HOME(C45T, { ep45:true }) : null;
  if (!H) return;
  const front = Object.assign({}, H.front, { exits:H.front.exits.filter(e => e.to === "living").map(e => Object.assign({}, e, { to:"bed", at:[20,126], label:"大門（一樓後面的房間）" })) });
  const bed = Object.assign({}, H.bed, { exits:[ Object.assign({}, H.bed.exits.find(e => e.to === "living"), { to:"front", at:[168,84], label:"大門（門口）" }) ] });
  setLoc("jshome", { start:"front", spawn:[132,100], rooms:{ front, bed },
    spots:{
      o45_mailbox:[186,46,10,11,191,78,"front",A("rummage")],
      o45_meds:[70,14,18,20,92,76,"bed",A("look")],
      doc45_medbag:[154,62,14,8,158,92,"bed",A("read")],
      o45_charger:[62,60,16,10,70,88,"bed",A("look")]
    },
    details:{
      d45_hgate:[152,26,32,40,168,84,"front",A("look")],
      d45_shutter:[84,24,60,42,72,80,"front",A("look",{ face:1 })],
      d45_no7:[22,22,18,44,31,80,"front",A("look")],
      d45_bedd:[18,64,40,48,68,106,"bed",A("look",{ face:-1 })],
      d45_wardrobe:[104,30,30,42,119,80,"bed",A("look")],
      d45_frame:[178,60,8,9,184,92,"bed",A("look")]
    },
    place:{},
    extras:(EP.world.jshome || {}).extras || [],
    plan:[ { name:"永福街 46 巷 9 號", w:100, h:38, rooms:{ bed:[0,0,100,18], front:[0,18,100,20,"out"] } } ] });
})();
