/* =========================================================
   第 22 集・俯視版（topdown.js）
   澄港信用合作社（大廳、地下室金庫、保全室、副理辦公室、後巷）、刑大（共用 CG_DESK）、澄港醫院病房、鑑識中心（共用 CG_LAB）。
   第一段是上午，第二段是晚上。
   ========================================================= */
const C22T = typeof TOPEP === "function" ? TOPEP("timelock") : null;

/* ================= 澄港信用合作社 ================= */
C22T && (() => {
  const { EP, T, O, sh, dA, ph, A, night, tone, fluo, vinyl, concrete, marble, carpetTiles, window2, setLoc } = C22T;
  const W0 = EP.world.coop || {};
  const NT = o => night(o) || !!(o && o.night);

  /* ---------- 大廳：三個櫃台（玻璃隔板、號碼燈停在 087）、紅色跑馬燈、公告欄（停電通知）、藍色等候椅；前面是玻璃大門 ---------- */
  const lobby = { name:"大廳", w:320, h:156, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 320, 60, "#e8e4d8", "plain", { base:"#2a5a4a" }); p.R(0, 40, 320, 15, "#3a7a5a");
      // 招牌「澄港信用合作社」
      p.R(118, 4, 100, 12, O); p.R(119, 5, 98, 10, "#2a6a4a"); for (let k = 0; k < 7; k++) p.R(124 + k * 13, 7, 9, 6, "#f4e8a8");
      // 紅色跑馬燈（定存利率、保管箱租金）
      p.R(16, 10, 80, 12, O); p.R(17, 11, 78, 10, "#1a1414"); for (let k = 0; k < 18; k++){ const x = 18 + ((k * 7 + Math.floor(t * 20)) % 78); if (x < 92) p.R(x, 14, 4, 4, "#e83a2a"); } p.R(26, 26, 54, 10, O); p.R(27, 27, 52, 8, "#f4f0e0"); p.R(30, 30, 40, 1, "#3a3a3a");
      // 號碼燈（停在 087）
      p.R(146, 20, 44, 14, O); p.R(147, 21, 42, 12, "#1a1414"); for (const [x, d] of [[152, 0], [164, 8], [176, 7]]){ p.R(x, 23, 8, 8, "#3a1a14"); p.R(x + 1, 24, 6, 2, "#e8402a"); p.R(x + 1, 29, 6, 1, "#e8402a"); if (d) p.R(x + 6, 24, 1, 6, "#e8402a"); }
      // 往副理辦公室的門（後牆左邊）
      T.backDoor(p, 96, 18, 24, 42, dA("lobby", "office"), "#8a6a4a", { frame:"#5a4a3a" }); p.R(100, 10, 16, 6, O); p.R(101, 11, 14, 4, "#e8e2d2");
      // 公告欄（停電通知）
      p.R(270, 8, 40, 30, O); p.R(271, 9, 38, 28, "#a87a4a"); p.R(274, 12, 16, 20, "#f4f0e6"); p.R(276, 15, 12, 2, "#c8302a"); for (let k = 0; k < 4; k++) p.R(276, 19 + k * 3, 11, 1, "#3a3a3a"); p.R(294, 12, 12, 14, "#f4e8a8");
      marble(p, 0, 60, 320, 96, "#d8d4c8", 32);
      T.sides(p, this, "#2a5a4a", [["L", 76, 44], ["R", 76, 44], ["B", 130, 60]]);
      T.sideDoor(p, this, "L", 76, 44, dA("lobby", "sec"), "#7a7e84"); T.sideDoor(p, this, "R", 76, 44, dA("lobby", "vault"), "#7a7e84");
      // 前面的玻璃大門（拉下一半的鐵捲門外面擠著箱主）
      p.R(130, 150, 60, 6, "rgba(200,225,235,.7)"); p.R(159, 150, 2, 6, "#c8ccd0");
    },
    props:[
      // 櫃台（三格玻璃隔板、電腦、蓋章的印台），右邊留一個進出的小門
      { y:98, draw(p, g, t){ T.box(p, 124, 80, 132, 12, 14, "#e8e0cc", "#a89878"); for (let k = 0; k < 4; k++) p.R(124 + k * 44, 64, 2, 18, "rgba(200,225,235,.8)"); p.R(124, 64, 134, 2, "rgba(200,225,235,.9)");
          for (let k = 0; k < 3; k++){ const x = 134 + k * 44; p.R(x, 70, 18, 12, O); p.R(x + 1, 71, 16, 9, "#1e2226"); p.R(x + 2, 72, 14, 7, "#3a5a6a"); p.R(x + 22, 82, 8, 6, O); p.R(x + 23, 83, 6, 4, "#c8302a"); } } },
      // 藍色等候椅（兩排）
      { y:104, draw(p){ for (let k = 0; k < 4; k++) T.chair(p, 26 + k * 16, 104, "#3a6ac8", "up"); p.R(18, 102, 68, 3, O); p.R(36, 96, 8, 6, "#f4f4f0"); } },
      { y:128, draw(p){ for (let k = 0; k < 4; k++) T.chair(p, 26 + k * 16, 128, "#3a6ac8", "up"); p.R(18, 126, 68, 3, O); p.R(58, 120, 10, 7, "#f4f0e0"); } },
      // 一盆發財樹
      { y:76, draw(p){ T.plant(p, 236, 76, true, "#3a7a3a"); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 60); fluo(p, 160, 2, 60); fluo(p, 260, 2, 60); tone(g, this, o, .3); },
    solid:[[122,78,138,30],[16,90,72,16],[16,114,72,16],[226,56,22,22]],
    exits:[ { r:[0,76,8,44], to:"sec", at:[214,96], label:"保全室", kind:"door", art:[0,74,8,48] },
            { r:[312,76,8,44], to:"vault", at:[46,100], label:"地下室（金庫）", kind:"down", art:[312,74,8,48] },
            { r:[96,60,24,8], to:"office", at:[112,124], label:"副理辦公室", kind:"door", art:[96,18,24,42] } ]
  };

  /* ---------- 地下室金庫：開著的鋼製圓門（門內側是時間鎖的面板）、整面兩百多格的保險箱牆、地上七個被拉出來的抽屜、清潔紀錄、灰色的地板 ---------- */
  const vault = { name:"地下室金庫", w:272, h:144, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 272, 60, "#9aa0a4", "plain", { base:"#5a6064" });
      // 保險箱牆（中間幾排有七個空格）
      p.R(66, 4, 196, 54, O); p.R(67, 5, 194, 52, "#b8bcc0"); const EMPTY = { "2,8":1, "2,9":1, "3,10":1, "2,11":1, "4,8":1, "3,13":1, "4,14":1 };
      for (let r = 0; r < 6; r++) for (let c = 0; c < 21; c++){ const x = 68 + c * 9, y = 6 + r * 8.5 | 0; if (EMPTY[r + "," + c]){ p.R(x, y, 8, 7, "#1e2226"); continue; } p.R(x, y, 8, 7, "#c8ccd0"); p.R(x, y, 8, 1, "#e0e4e8"); p.R(x + 3, y + 3, 2, 2, "#8a8e94"); p.R(x + 1, y + 1, 2, 1, "#a8acb0"); }
      // 清潔紀錄（貼在門邊的牆上）
      p.R(36, 14, 20, 26, O); p.R(37, 15, 18, 24, "#f4f0e6"); p.R(39, 17, 14, 2, "#3a5a8a"); for (let k = 0; k < 5; k++) p.R(39, 22 + k * 3, 12, 1, k === 3 ? "#c8302a" : "#7a7a8a");
      // 天花板的角落（沒有監視器，只剩兩個螺絲孔）
      p.R(256, 2, 2, 2, "#5a5e64"); p.R(262, 2, 2, 2, "#5a5e64");
      // 地：灰色的地板（拖過）
      p.R(0, 60, 272, 84, "#8a8e90"); for (let j = 60; j < 144; j += 18) p.R(0, j, 272, 1, "#7e8284"); for (let i = 0; i < 272; i += 24) p.R(i, 60, 1, 84, "#7e8284");
      // 斜光下看得到的一串皮鞋印（從門口走到箱子牆，再走回來）
      for (let k = 0; k < 10; k++){ const x = 40 + k * 14, y = 104 - k * 3 + (k % 2) * 5; p.R(x, y, 5, 3, "rgba(60,60,64,.35)"); p.R(x + 1, y + 3, 3, 2, "rgba(60,60,64,.35)"); }
      T.sides(p, this, "#5a6064", [["L", 74, 52]]);
      p.R(0, 74, 7, 52, "#3a3e42");
    },
    props:[
      // 開著的鋼製圓門（往裡面打開、靠在左牆；門內側是時間鎖的面板）
      { y:130, draw(p, g, t){ p.R(4, 64, 26, 68, O); p.R(5, 65, 24, 66, "#a8acb0"); p.R(7, 67, 20, 62, "#c8ccd0"); for (let k = 0; k < 4; k++) p.R(8, 74 + k * 14, 18, 2, "#8a8e94"); p.R(12, 86, 12, 18, O); p.R(13, 87, 10, 16, "#2a2e34"); p.R(14, 89, 8, 4, "#3a8a5a"); p.R(15, 90, 6, 2, "#8af0a8"); p.R(14, 95, 3, 3, "#c8ccd0"); p.R(19, 95, 3, 3, "#c8ccd0"); p.R(14, 99, 8, 2, "#e9c43a"); } },
      // 地上七個被拉出來的抽屜
      { y:116, draw(p){ for (const [x, y] of [[112, 88], [130, 96], [150, 86], [168, 100], [186, 90], [204, 104], [140, 108]]){ p.R(x, y, 14, 8, O); p.R(x + 1, y + 1, 12, 6, "#c8ccd0"); p.R(x + 2, y + 2, 10, 4, "#2a2e34"); p.R(x + 5, y + 1, 4, 1, "#e9c43a"); } } }
    ],
    front(p, g, t, o){ fluo(p, 90, 2, 60, false); fluo(p, 200, 2, 60, false); tone(g, this, o, .3); },
    solid:[[2,62,30,72],[110,86,110,30]],
    exits:[ { r:[0,74,8,52], to:"lobby", at:[300,104], label:"樓上（大廳）", kind:"up", art:[0,72,8,56] } ]
  };

  /* ---------- 保全室：八格監視器螢幕牆、錄影機、UPS 機櫃（一排電池）、值班桌（兩個保溫杯、交班簿）、鐵置物櫃、鑰匙掛勾；後面一扇門通後巷 ---------- */
  const sec = { name:"保全室", w:240, h:136, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 240, 58, "#c8ccc4", "plain", { base:"#3a3e3a" });
      // 監視器螢幕牆（八格，左下角是金庫走廊）
      p.R(66, 6, 74, 40, O); p.R(67, 7, 72, 38, "#1e2226"); for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++){ const x = 68 + c * 18, y = 8 + r * 18; p.R(x, y, 16, 16, r === 1 && c === 0 ? "#2a4a3a" : "#2a3a4a"); p.R(x + 2, y + 10, 12, 1, "#5a6a7a"); } p.R(70, 30, 4, 6, "#c8ccd0");
      // 鑰匙掛勾（「值班鑰匙」那格是空的）
      p.R(150, 14, 30, 16, O); p.R(151, 15, 28, 14, "#8a6a4a"); for (let k = 0; k < 5; k++){ p.R(154 + k * 5, 17, 1, 3, "#c8ccd0"); if (k !== 2) p.R(153 + k * 5, 20, 3, 6, "#c8a050"); } p.R(154, 26, 22, 2, "#f4f0e0");
      // 往後巷的鐵門
      T.backDoor(p, 196, 18, 26, 40, dA("sec", "alley"), "#6a6e74", { frame:"#3a3e42" }); p.R(200, 10, 18, 6, O); p.R(201, 11, 16, 4, "#3aa84a");
      vinyl(p, 0, 58, 240, 78, "#9a9e94", "#92968c", 16);
      T.sides(p, this, "#3a3e3a", [["R", 82, 40]]);
      T.sideDoor(p, this, "R", 82, 40, dA("sec", "lobby"), "#7a7e84");
    },
    props:[
      // 鐵置物櫃（四格）
      { y:76, draw(p){ for (let k = 0; k < 4; k++){ T.box(p, 8 + k * 13, 24, 12, 8, 44, "#7a8a9a", "#5a6a7a"); p.R(10 + k * 13, 40, 8, 1, O); p.R(16 + k * 13, 50, 2, 4, "#c8ccd0"); } } },
      // 值班桌：錄影機、交班簿、兩個保溫杯
      { y:92, draw(p, g, t){ T.box(p, 64, 70, 80, 12, 10, "#8a8e94", "#5a5e64"); p.R(70, 62, 24, 10, O); p.R(71, 63, 22, 8, "#2a2a2e"); p.R(73, 66, 4, 2, "#3aa84a"); p.R(88, 66, 3, 3, "#c8ccd0");
          p.R(100, 72, 16, 9, O); p.R(101, 73, 14, 7, "#f4f0e6"); p.R(103, 75, 10, 1, "#3a3a3a"); p.R(103, 77, 8, 1, "#3a3a3a"); for (const [x, c] of [[122, "#3a6ac8"], [132, "#c8302a"]]){ p.R(x, 70, 6, 9, O); p.R(x + 1, 71, 4, 7, c); } } },
      { y:100, draw(p){ T.chair(p, 104, 100, "#2a2a30", "up"); } },
      // UPS 機櫃（一排電池、綠色的燈）
      { y:84, draw(p, g, t){ T.box(p, 160, 40, 26, 10, 34, "#3a3e44", "#2a2e34"); for (let k = 0; k < 4; k++){ p.R(163, 52 + k * 7, 20, 5, "#1e2226"); p.R(165, 53 + k * 7, 2, 2, Math.floor(t * 2 + k) % 3 ? "#3aa84a" : "#8af0a8"); } } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 50); fluo(p, 180, 2, 50); tone(g, this, o, .3); },
    solid:[[6,22,56,54],[62,60,84,32],[158,38,30,48]],
    exits:[ { r:[232,82,8,40], to:"lobby", at:[36,80], label:"大廳", kind:"door", art:[232,80,8,44] },
            { r:[196,58,26,8], to:"alley", at:[120,84], label:"後門（後巷）", kind:"door", art:[196,18,26,40] } ]
  };

  /* ---------- 副理辦公室：辦公桌（螢幕上一片綠色的股票、一家三口的照片）、抽屜、腳邊的紙簍、牆上的績優證書、窗（看得到後巷） ---------- */
  const office = { name:"副理辦公室", w:224, h:136, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 224, 58, "#e0dccc", "panel", { base:"#4a3a2a", panel:"#7a5a3a" });
      // 績優證書（框是新的）
      p.R(24, 10, 30, 22, O); p.R(25, 11, 28, 20, "#c8a050"); p.R(27, 13, 24, 16, "#f4f0e0"); p.R(30, 16, 18, 2, "#c8302a"); p.R(30, 21, 16, 1, "#3a3a3a"); p.R(30, 24, 12, 1, "#3a3a3a");
      // 窗：看得到後巷、後門、垃圾箱
      window2(p, 150, 8, 54, 34, o, t, (x, y, w, h) => { p.R(x, y + 14, w, h - 14, NT(o) ? "#2a2830" : "#8a8278"); p.R(x + 6, y + 18, 10, 12, NT(o) ? "#3a3e44" : "#6a6e74"); p.R(x + 28, y + 22, 14, 8, NT(o) ? "#2a4a2a" : "#3a7a4a"); }, "#c8ccd0");
      carpetTiles(p, 0, 58, 224, 78, "#6a6a72", "#62626a", 16);
      T.sides(p, this, "#4a3a2a", [["B", 96, 32]]);
    },
    props:[
      // 檔案櫃
      { y:76, draw(p){ T.box(p, 74, 30, 34, 10, 36, "#8a9088", "#6a7068"); for (let r = 0; r < 3; r++) p.R(86, 44 + r * 10, 10, 1, O); } },
      // 辦公桌：螢幕（股票一片綠）、照片、電話
      { y:104, draw(p, g, t){ T.box(p, 40, 82, 96, 14, 10, "#6a4a2a", "#4a2a14"); p.R(70, 66, 30, 18, O); p.R(71, 67, 28, 15, "#1e2226"); for (let k = 0; k < 6; k++) p.R(73, 69 + k * 2, 24 - (k * 3) % 10, 1, "#3ad86a"); p.R(88, 77, 10, 4, "#f4f4f0"); p.R(89, 78, 8, 1, "#c8302a");
          p.R(48, 82, 10, 9, O); p.R(49, 83, 8, 7, "#c8a050"); p.R(50, 84, 6, 5, "#8ac0e0"); p.R(51, 86, 4, 3, "#e8c09a"); p.R(112, 84, 14, 8, O); p.R(113, 85, 12, 6, "#2a2a2e"); p.R(108, 96, 22, 2, "#4a2a14"); } },
      { y:80, draw(p){ T.chair(p, 84, 80, "#2a2a30", "down"); } },
      // 腳邊的紙簍（一團揉皺的紙）
      { y:116, draw(p){ p.R(142, 104, 12, 12, O); p.R(143, 105, 10, 10, "#5a5e64"); p.R(145, 103, 6, 5, O); p.R(146, 104, 4, 3, "#f4f4f0"); } }
    ],
    front(p, g, t, o){ fluo(p, 112, 2, 50); tone(g, this, o, .3); },
    solid:[[72,28,38,40],[38,80,100,26],[140,102,16,16]],
    exits:[ { r:[96,128,32,8], to:"lobby", at:[108,76], label:"大廳", kind:"out", art:[94,124,36,12] } ]
  };

  /* ---------- 後巷：鐵製的後門（保全感應器亮著紅燈）、門邊綁死結的黑色垃圾袋、綠色大垃圾箱、唯一的路燈 ---------- */
  const alley = { name:"合作社後巷", w:288, h:124, wall:58,
    floor(p, g, t, o){ const n = NT(o);
      p.R(0, 0, 288, 58, n ? "#3a3634" : "#a8a090"); for (let y = 4; y < 58; y += 6) p.R(0, y, 288, 1, n ? "#302c2a" : "#988a7a");
      p.R(150, 0, 138, 58, n ? "#2e2c2c" : "#8a8278"); p.R(150, 0, 1, 58, O);
      // 冷氣室外機、排水管
      for (const x of [20, 56]){ p.R(x, 14, 26, 18, O); p.R(x + 1, 15, 24, 16, n ? "#6a6e70" : "#c8ccd0"); for (let k = 0; k < 4; k++) p.R(x + 4, 18 + k * 3, 18, 1, "#8a8e94"); }
      p.R(142, 0, 4, 58, O); p.R(143, 0, 2, 58, "#7a7e84");
      // 鐵製後門（從裡面才打得開）＋保全感應器
      p.R(96, 16, 30, 42, O); p.R(97, 17, 28, 41, n ? "#4a4e54" : "#7a7e84"); for (let y = 22; y < 56; y += 8) p.R(98, y, 26, 1, n ? "#3a3e44" : "#6a6e74"); p.R(120, 36, 3, 6, "#c8ccd0");
      p.R(128, 20, 8, 6, O); p.R(129, 21, 6, 4, "#e8e4d8"); p.R(131, 22, 2, 2, Math.floor(t * 2) % 2 ? "#e83a2a" : "#8a1a10");
      // 對面那棟的窗
      for (let k = 0; k < 4; k++){ p.R(166 + k * 30, 14, 18, 14, O); p.R(167 + k * 30, 15, 16, 12, n ? (k === 2 ? "#e8d890" : "#1a1c24") : "#a8b4bc"); }
      // 地：舊柏油、一條水溝
      p.R(0, 58, 288, 66, n ? "#2a2a2e" : "#5a5a5e"); p.seed(22); for (let k = 0; k < 150; k++) p.R(p.rnd() * 288, 58 + p.rnd() * 66, 2, 1, n ? "#24242a" : "#4e4e52");
      p.R(0, 112, 288, 6, O); p.R(0, 113, 288, 4, n ? "#1e1e22" : "#3a3a3a"); for (let x = 2; x < 288; x += 5) p.R(x, 113, 2, 4, n ? "#141418" : "#2a2a2a");
      T.sides(p, this, n ? "#1e1e22" : "#4a4a4e", []);
    },
    props:[
      // 黑色垃圾袋（綁死結）
      { y:72, draw(p){ p.R(130, 58, 16, 14, O); p.R(131, 59, 14, 12, "#1e1e22"); p.R(134, 55, 8, 5, O); p.R(135, 56, 6, 3, "#1e1e22"); p.R(133, 62, 6, 2, "#3a3a3e"); } },
      // 綠色大垃圾箱（蓋子半開）
      { y:86, draw(p){ T.box(p, 176, 60, 48, 14, 12, "#2a6a3a", "#1e4a2a"); p.R(176, 56, 48, 6, O); p.R(177, 57, 46, 4, "#3a8a4a"); p.R(180, 62, 18, 6, "#e8e4d8"); p.R(200, 62, 8, 6, "#c8a878"); } },
      // 路燈（停電那晚也是暗的）
      { y:84, draw(p, g, t, o){ T.streetLamp(p, g, 250, 84); if (NT(o)) T.glow(g, 256, 32, 40, "255,230,160", .14); } }
    ],
    front(p, g, t, o){ if (NT(o)) T.dim(g, this, .32); else tone(g, this, o, .2); },
    solid:[[128,54,20,18],[174,54,52,32],[244,78,14,8]],
    exits:[ { r:[96,58,30,8], to:"sec", at:[209,72], label:"保全室", kind:"door", art:[96,16,30,42] } ]
  };

  const spots = {
    o22_notice:[270,8,40,30,286,120,"lobby",A("read")],
    o22_board:[16,10,80,26,56,76,"lobby",A("look")],
    o22_boxes:[110,84,112,30,166,126,"vault",A("crouch")],
    o22_door:[2,62,30,72,44,90,"vault",A("look",{ face:-1 })],
    doc22_timelock:[12,86,12,18,44,108,"vault",A("type",{ actT:2, face:-1 })],
    o22_prints:[36,92,150,20,96,124,"vault",A("crouch")],
    o22_clean:[36,14,20,26,48,74,"vault",A("read")],
    cctv22_vault:[66,6,74,40,84,108,"sec",A("look")],
    doc22_ups:[158,38,30,48,174,100,"sec",A("look")],
    doc22_shift:[100,70,16,12,112,112,"sec",A("read")],
    o22_dvr:[68,60,28,14,68,108,"sec",A("look")],
    o22_locker:[6,22,56,54,34,90,"sec",A("rummage")],
    o22_screen:[68,64,34,20,62,116,"office",A("type",{ actT:2 })],
    o22_dunning:[38,90,40,16,30,118,"office",A("rummage",{ face:1 })],
    o22_ticket:[140,100,16,18,166,116,"office",A("rummage",{ face:-1 })],
    o22_photo:[46,80,14,12,40,72,"office",A("look")],
    o22_trash:[128,54,20,18,152,82,"alley",A("rummage",{ face:-1 })],
    o22_backdoor:[96,16,40,42,112,74,"alley",A("look")]
  };
  const details = {
    d22_number:[146,20,44,14,166,116,"lobby",A("look")],
    d22_chairs:[16,90,72,40,98,118,"lobby",A("look",{ face:-1 })],
    d22_wall:[66,4,196,54,236,80,"vault",A("look")],
    d22_cam:[248,0,24,10,252,104,"vault",A("look")],
    d22_mug:[120,68,20,12,132,108,"sec",A("look")],
    d22_keys:[150,14,30,16,154,104,"sec",A("look")],
    d22_cert:[24,10,30,22,26,74,"office",A("look")],
    d22_window:[150,8,54,34,176,74,"office",A("look")],
    d22_bin:[174,54,52,32,200,96,"alley",A("look")],
    d22_lamp:[240,24,22,62,264,98,"alley",A("look",{ face:-1 })]
  };
  const place = {
    chen:[ { room:"lobby", x:196, y:70, act:"phone", facing:1 }, { room:"office", x:84, y:76, act:"sitText", facing:1, view:"front" } ],
    guo:[ { room:"sec", x:104, y:100, act:"sit", facing:1, view:"side" }, { room:"sec", x:150, y:110, act:"cross", facing:-1 } ],
    huang:[ { room:"vault", x:52, y:122, act:"cross", facing:1 }, { room:"lobby", x:286, y:136, act:"write", facing:-1 } ],
    zhong:[ { room:"lobby", x:118, y:140, act:"idle", facing:1 }, { room:"lobby", x:118, y:140, act:"idle", facing:1 } ],
    fan:[ { room:"vault", x:44, y:72, act:"type", facing:-1 }, { room:"vault", x:44, y:72, act:"type", facing:-1 } ],
    yuee:[ { room:"lobby", x:110, y:118, act:"cry", facing:-1 }, { room:"lobby", x:58, y:128, act:"sit", facing:1, view:"side" } ],
    kui:[ { room:"vault", x:240, y:120, act:"kneel", facing:-1 }, null ]
  };
  const intro = [ { set:{ room:"lobby", px:160, py:150 }, hide:true }, { wait:0.3, hide:true }, { set:{ room:"lobby", px:160, py:132 } },
    ...(W0.intro || []).filter(k => k.say || (k.wait && !k.hide)).map(k => k.say && k.say[0] === "wu" && /點畫面上的箭嘴|📍|清單不是全部/.test(k.say[1]) ? null : k).filter(Boolean),
    { say:["wu", "想去哪裡，點畫面上的門口就會自己走過去。閃著星星的就是還沒看過的東西，按上面的「🧭 平面圖」看全部在哪裡。"], name:"小吳" } ];
  setLoc("coop", { start:"lobby", spawn:[160,132], rooms:{ lobby, vault, sec, office, alley }, spots, details, place, extras:W0.extras || [], intro,
    plan:[ { name:"1F", w:100, h:40, rooms:{ alley:[0,0,34,12,"out"], office:[34,0,30,14], sec:[0,12,34,28], lobby:[34,14,66,26] } },
           { name:"B1", w:100, h:18, rooms:{ vault:[50,0,50,18] } } ] });
})();

/* ================= 刑大（共用）、病房、鑑識中心 ================= */
C22T && (() => {
  const { EP, T, O, sh, dA, ph, A, night, tone, fluo, vinyl, tileWall, window2, setLoc } = C22T;

  /* ---------- 刑大：小吳畫的時間線（中間一個被圈了三次的問號） ---------- */
  const pdesk = CG_DESK(C22T, { meetOk:false,
    board(p){ p.R(126, 10, 64, 14, "#f4f0e6"); p.R(128, 17, 60, 1, "#2a3a6a"); for (const x of [130, 146, 176, 186]) p.R(x, 14, 1, 6, "#2a3a6a"); p.R(158, 12, 8, 10, "rgba(200,48,42,.25)"); p.R(160, 14, 4, 2, "#c8302a"); p.R(162, 16, 2, 2, "#c8302a"); p.R(162, 20, 2, 1, "#c8302a"); },
    props:[ { y:90, draw(p){ p.R(70, 76, 9, 10, O); p.R(71, 77, 7, 8, "#f4f0e0"); p.R(72, 79, 5, 1, "#2a2a2a"); p.R(72, 81, 3, 1, "#c8302a"); } } ] });
  setLoc("police", { start:"pdesk", spawn:[170,154], rooms:{ pdesk },
    spots:{ o22_white:[124,6,70,40,160,70,"pdesk",A("read")] },
    details:{ d22_coffee:[64,72,22,14,78,108,"pdesk",A("look")] },
    place:{ ye:[ null, { room:"pdesk", x:104, y:70, act:"read", facing:1 } ] },
    extras:(EP.world.police || {}).extras || [],
    plan:[ { name:"澄港市刑大", w:100, h:30, rooms:{ pdesk:[0,0,100,30] } } ] });

  /* ---------- 病房：病床（心電圖的線）、陪床椅、床邊小桌（小筆記本）、床尾的病歷夾、窗（看得到停車場） ---------- */
  const ward = { name:"病房", w:240, h:136, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 240, 58, "#e4ece8", "plain", { base:"#6a8a7a" });
      // 窗（停車場）
      window2(p, 16, 10, 50, 32, o, t, (x, y, w, h) => { p.R(x, y + h - 12, w, 12, night(o) ? "#2a2a30" : "#7a7e84"); for (let k = 0; k < 3; k++) p.R(x + 4 + k * 14, y + h - 9, 10, 5, ["#c8302a", "#e8e8e4", "#3a5a8a"][k]); }, "#c8ccd0");
      // 床頭的氧氣、呼叫鈴面板
      p.R(108, 12, 70, 16, O); p.R(109, 13, 68, 14, "#d8e4e0"); p.R(114, 16, 6, 6, "#3a8a5a"); p.R(126, 16, 6, 6, "#e9c43a"); p.R(160, 16, 10, 6, "#c8302a");
      vinyl(p, 0, 58, 240, 78, "#c8d0c8", "#c0c8c0", 18);
      T.sides(p, this, "#6a8a7a", [["B", 190, 34]]);
    },
    props:[
      // 心電監視器（綠色的線）
      { y:66, draw(p, g, t){ p.R(186, 26, 26, 22, O); p.R(187, 27, 24, 18, "#1e2226"); for (let i = 0; i < 22; i++){ const k = (i + Math.floor(t * 10)) % 22; p.R(188 + i, k === 6 ? 30 : k === 7 ? 40 : 36, 1, 1, "#3ad86a"); } p.R(198, 48, 2, 18, O); p.R(192, 64, 14, 3, O); } },
      // 病床（床頭在左、腳在右；腳邊掛著病歷夾）
      { y:80, draw(p){ T.box(p, 100, 64, 76, 32, 6, "#f4f4f0", "#a8b0b4", { legs:2 }); p.R(98, 60, 6, 40, O); p.R(99, 61, 4, 38, "#8a9094"); p.R(106, 68, 14, 22, O); p.R(107, 69, 12, 20, "#ffffff"); p.R(124, 64, 52, 32, "#b8d0e0"); p.R(124, 64, 2, 32, "#c8e0f0"); p.R(172, 60, 6, 40, O); p.R(173, 61, 4, 38, "#8a9094"); p.R(178, 70, 8, 12, O); p.R(179, 71, 6, 10, "#f4f0e6"); p.R(180, 73, 4, 1, "#3a3a3a"); p.R(180, 75, 4, 1, "#3a3a3a"); } },
      // 床邊小桌（水杯、小筆記本）
      { y:86, draw(p){ T.box(p, 70, 62, 22, 12, 10, "#c8b898", "#8a7a5a"); p.R(74, 64, 5, 7, O); p.R(75, 65, 3, 5, "rgba(220,235,240,.85)"); p.R(82, 65, 8, 6, O); p.R(83, 66, 6, 4, "#c8302a"); } },
      // 陪床椅
      { y:110, draw(p){ T.chair(p, 64, 110, "#6a8a9a", "right"); } }
    ],
    front(p, g, t, o){ fluo(p, 140, 2, 50); tone(g, this, o, .3); },
    solid:[[96,58,10,44],[106,62,66,3],[106,95,66,3],[170,58,10,44],[68,60,26,26],[184,24,30,44]],
    exits:[]
  };
  setLoc("hospital", { start:"ward", spawn:[206,126], rooms:{ ward },
    spots:{ doc22_admit:[176,68,12,16,196,92,"ward",A("read")], o22_list:[80,62,12,10,80,96,"ward",A("read")] },
    details:{ d22_monitor:[186,26,26,22,200,80,"ward",A("look")], d22_window2:[16,10,50,32,42,76,"ward",A("look")] },
    place:{ sun:[ { room:"ward", x:140, y:86, act:"lie", facing:1, view:"side" }, { room:"ward", x:140, y:86, act:"lie", facing:1, view:"side" } ],
            sunyh:[ { room:"ward", x:64, y:110, act:"sit", facing:1, view:"side" }, { room:"ward", x:64, y:110, act:"sit", facing:1, view:"side" } ] },
    extras:(EP.world.hospital || {}).extras || [],
    plan:[ { name:"澄港醫院", w:100, h:30, rooms:{ ward:[0,0,100,30] } } ] });

  /* ---------- 鑑識中心：一排借來的鞋、玻璃板上攤平的黑色電工膠帶 ---------- */
  setLoc("lab", { start:"lab", spawn:[144,140],
    rooms:{ lab:CG_LAB(C22T, { props:[
      { y:106, draw(p){ for (let k = 0; k < 6; k++){ const x = 34 + k * 12; p.R(x, 88, 9, 6, O); p.R(x + 1, 89, 7, 4, ["#2a2a2e", "#3a2a1a", "#5a4a3a", "#2a2a2e", "#e9c43a", "#3a2a1a"][k]); p.R(x + 1, 94, 7, 2, "#f4f0e0"); } } },
      { y:100, draw(p){ p.R(226, 70, 26, 12, O); p.R(227, 71, 24, 10, "rgba(220,235,240,.8)"); for (let k = 0; k < 20; k++) p.R(229 + k, 75 + Math.round(Math.sin(k / 2) * 2), 1, 2, "#1e1e22"); } }
    ] }) },
    spots:{ o22_shoeline:[30,84,80,14,70,114,"lab",A("look")] },
    details:{ d22_tape:[224,68,30,16,240,96,"lab",A("look")] },
    place:{ xu:[ null, { room:"lab", x:200, y:116, act:"read", facing:1 } ], kui:[ null, { room:"lab", x:124, y:118, act:"read", facing:-1 } ] },
    extras:(EP.world.lab || {}).extras || [],
    plan:[ { name:"鑑識中心", w:100, h:20, rooms:{ lab:[0,0,100,20] } } ] });
})();
