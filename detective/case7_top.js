/* =========================================================
   第 7 集・俯視版（topdown.js）
   海悅大樓（1990 年代的十五層住宅：大廳、電梯口、管委會、14 樓、方家、頂樓機房、B2）、
   刑大（共用 CG_DESK）、鑑識中心（共用 CG_LAB）、永升電梯監控中心、好運來麻將館、宏遠建設、劉文彬的住處。
   每一個地點的樣子都不一樣；字、位置跟 case7.js 的文字對得上。
   ========================================================= */
const C7T = typeof TOPEP === "function" ? TOPEP("fourteen") : null;
// 天色：[上, 下, 遠景, 近景, 雨, 夜晚]。case7_art 的 SKY7 是橫向畫面用的（第一晚沒有標夜晚），俯視版自己標
if (C7T){ const SKY7T = [ ["#0b0f1c","#27324a","#18202a","#1d2630",0,1], ["#8ab0d0","#e0e8ee","#4a6070","#56707a",0,0], ["#a8a0b0","#e8d8c8","#5a5a6a","#6a6a72",0,0] ];
  C7T.EP.worldSky = ph => SKY7T[Math.min(ph || 0, SKY7T.length - 1)]; }

/* ================= 海悅大樓 ================= */
C7T && (() => {
  const { EP, T, O, sh, dA, ph, night, A, tone, window2, cityView, fluo, marble, vinyl, laminate, concrete, setLoc } = C7T;
  const W0 = EP.world.tower || {};
  // 不鏽鋼電梯門（open 0～1）＋上面的樓層燈；tri＝門上方的三角鑰匙孔
  const liftDoor = (p, x, y, w, h, open, fl, scratch) => {
    p.R(x - 4, y - 4, w + 8, h + 4, O); p.R(x - 3, y - 3, w + 6, h + 3, "#8a8e94");
    p.R(x, y, w, h, "#2a2a2e");
    const half = Math.round(w / 2 * (1 - open));
    if (half > 0){ p.R(x, y, half, h, "#b8bcc2"); p.R(x + w - half, y, half, h, "#b8bcc2"); p.R(x + 2, y + 2, half - 3, h - 4, "#c8ccd2"); p.R(x + w - half + 1, y + 2, half - 3, h - 4, "#c8ccd2"); p.R(x + half - 1, y, 1, h, O); p.R(x + w - half, y, 1, h, O); }
    p.R(x + w / 2 - 6, y - 14, 12, 8, O); p.R(x + w / 2 - 5, y - 13, 10, 6, "#1a1010"); p.R(x + w / 2 - 3, y - 12, 6, 4, "#e84a2a");   // 樓層燈
    if (fl) p.R(x + w / 2 - 2, y - 11, 4, 2, "#ffb07a");
    p.R(x + w / 2 - 2, y - 4, 4, 3, O); p.R(x + w / 2 - 1, y - 3, 2, 1, "#5a5e64");   // 三角鑰匙孔
    if (scratch) for (let k = 0; k < 4; k++) p.R(x + w / 2 - 4 + k * 2, y - 5 + (k % 2), 2, 1, "#f4f4f8");
  };
  const fireDoor = (p, x, y, w, h, amt) => { T.backDoor(p, x, y, w, h, amt, "#7a8088", { frame:"#4a4e54" }); p.R(x + 3, y + 4, w - 6, 3, "#e84a3a"); p.R(x + 4, y + 5, w - 8, 1, "#f4f4f0"); };
  const terrazzo = (p, x, y, w, h, base) => { p.R(x, y, w, h, base); p.seed(x * 7 + y); for (let k = 0; k < w * h / 9; k++) p.R(x + p.rnd() * w, y + p.rnd() * h, 1, 1, [sh(base, -.12), sh(base, .1), "#8a7a6a", "#e8e0d0"][k % 4]); for (let i = x; i < x + w; i += 48) p.R(i, y, 1, h, sh(base, -.18)); };
  const oldTiles = (p, x, y, w, h, a, b) => { for (let j = y; j < y + h; j += 12) for (let i = x; i < x + w; i += 12){ p.R(i, j, 12, 12, ((i + j) / 12) % 2 ? a : b); p.R(i, j, 12, 1, sh(a, -.15)); p.R(i, j, 1, 12, sh(a, -.15)); } };

  /* ---------- 一樓大廳・管理室：信箱牆、管理台、後面一整排監視器 ---------- */
  const tlobby = { name:"一樓大廳・管理室", w:288, h:160, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 288, 60, "#d8cfbc", "tile", { base:"#5a4a3a" });
      // 鐵信箱（4 排 × 8 格），14A 那格塞滿了傳單
      p.R(14, 8, 78, 44, O); p.R(15, 9, 76, 42, "#9a9ea2");
      for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++){ const x = 16 + c * 9.4, y = 10 + r * 10; p.R(x, y, 8, 9, "#b8bcc0"); p.R(x + 1, y + 1, 6, 1, "#5a5e62"); if (r === 1 && c === 5){ p.R(x + 1, y + 2, 6, 4, "#f4f0e6"); p.R(x + 2, y + 3, 3, 1, "#2a3a6a"); } }
      // 往管委會的門（左後）
      T.backDoor(p, 104, 18, 24, 42, dA("tlobby", "tcommittee"), "#8a6a4a", { frame:"#5a4a3a" }); p.R(106, 8, 20, 7, O); p.R(107, 9, 18, 5, "#e8e2d2"); p.R(109, 11, 14, 1, "#2a2a2a");
      // 管理台後面：一整排監視器（2 排 × 4 台）
      p.R(146, 6, 94, 46, O); p.R(147, 7, 92, 44, "#2a2a2e");
      for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++){ const x = 150 + c * 22, y = 10 + r * 20; p.R(x, y, 20, 16, "#1e2226"); p.R(x + 1, y + 1, 18, 14, ["#3a4a5a", "#4a4a40", "#2a3a3a", "#3a3a4a"][(r * 4 + c) % 4]); p.R(x + 2 + (Math.floor(t * 3 + c + r) % 12), y + 9, 3, 4, "rgba(220,230,240,.35)"); p.R(x + 1, y + 1, 7, 2, "#c8d0d8"); }
      // 牆上的鐘、「海悅大樓」字牌
      p.R(250, 10, 12, 12, O); p.R(251, 11, 10, 10, "#f4f4f0"); p.R(256, 12, 1, 5, O); p.R(256, 16, 3, 1, O);
      p.R(244, 30, 38, 12, O); p.R(245, 31, 36, 10, "#8a6a2a"); for (let k = 0; k < 4; k++) p.R(248 + k * 8, 33, 6, 6, "#e9c46a");
      // 地：磨石子
      terrazzo(p, 0, 60, 288, 100, "#b8b0a0");
      // 大門的腳踏墊
      p.R(118, 136, 52, 18, "#5a3a2a"); for (let i = 120; i < 168; i += 4) p.R(i, 138, 2, 14, "#4a2a1a");
      T.sides(p, this, "#5a4a3a", [["R", 96, 40]]); T.sideDoor(p, this, "R", 96, 40, dA("tlobby", "tlift"), "#8a8e94");
      // 前面那幅牆：玻璃大門
      p.R(118, 154, 52, 6, "#9ac0d8"); p.R(143, 154, 2, 6, O); p.R(118, 154, 52, 1, O);
    },
    props:[
      // 管理台（L 型）：值班紀錄、柵欄紀錄、小電視
      { y:98, draw(p, g, t, o){ T.box(p, 140, 72, 100, 14, 12, "#8a6a4a", "#6a4a2a"); T.box(p, 140, 72, 14, 26, 6, "#8a6a4a", "#6a4a2a");
          p.R(150, 74, 14, 9, O); p.R(151, 75, 12, 7, "#e8e4d0"); p.R(153, 77, 8, 1, "#7a7a8a"); p.R(153, 79, 6, 1, "#7a7a8a");   // 柵欄紀錄（印出來的）
          p.R(200, 75, 16, 9, O); p.R(201, 76, 14, 7, "#2a4a8a"); p.R(208, 76, 1, 7, "#f4f4f0");                                    // 值班紀錄（藍皮）
          p.R(224, 73, 14, 11, O); p.R(225, 74, 12, 8, "#1e2226"); p.R(226, 75, 10, 6, ph(o) === 0 ? "#6a8aa0" : "#3a4a5a");          // 小電視
          p.R(180, 76, 6, 7, O); p.R(181, 77, 4, 5, "#c84a3a"); p.R(170, 78, 6, 4, "#c8a050"); } },                                // 保溫杯、花生
      { y:70, draw(p){ T.chair(p, 190, 70, "#2a2a30", "left"); } },
      // 管理台前面地上的花生殼
      { y:96, draw(p){ for (const [x, y] of [[128, 92], [131, 94], [134, 91], [126, 95], [133, 96]]) p.R(x, y, 3, 2, "#c8a878"); } },
      // 大廳的盆栽、等候的長椅
      { y:150, draw(p){ T.plant(p, 22, 150, true); T.plant(p, 266, 150, true); } },
      { y:120, draw(p){ T.box(p, 20, 104, 60, 10, 8, "#5a6a5a", "#3a4a3a"); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 50); fluo(p, 200, 2, 50); tone(g, this, o, .35); },
    solid:[[12,6,82,48],[138,70,104,30],[138,70,18,36],[14,134,18,18],[258,134,18,18],[18,102,64,22]],
    exits:[ { r:[280,96,8,40], to:"tlift", at:[24,110], label:"電梯口", kind:"door", art:[280,94,8,44] },
            { r:[104,62,24,8], to:"tcommittee", at:[204,118], label:"管委會辦公室", kind:"door", art:[104,18,24,42] } ]
  };

  /* ---------- 電梯口：只有一台電梯（停著、門開著、拉了封鎖線） ---------- */
  const tlift = { name:"電梯口", w:256, h:150, wall:66,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 66, "#c8bca4", "plain", { base:"#5a4a3a" }); for (let x = 0; x < 256; x += 32) p.R(x, 4, 1, 56, "#b8ac94");
      // 電梯（門開著：看得到車廂後面那面牆跟限乘牌）
      liftDoor(p, 106, 20, 44, 46, 1, false, false);
      p.R(108, 20, 40, 46, "#8a8e94"); p.R(110, 22, 36, 30, "#a8acb2"); p.R(110, 52, 36, 2, "#c8ccd2");
      p.R(118, 26, 20, 14, O); p.R(119, 27, 18, 12, "#f4f4ee"); p.R(120, 28, 16, 3, "#2a5a8a"); for (let k = 0; k < 3; k++) p.R(120, 32 + k * 2, 14 - k * 3, 1, "#6a6a6a");
      p.R(140, 30, 4, 12, "#5a5e64"); for (let k = 0; k < 4; k++) p.R(141, 31 + k * 3, 2, 2, "#e9e4da");
      // 叫車按鈕（▲ 發亮、▼ 旁邊一張恐龍貼紙）
      p.R(158, 34, 8, 16, O); p.R(159, 35, 6, 14, "#c8ccd2"); p.R(160, 37, 4, 3, "#f4f4ee"); p.R(160, 43, 4, 3, "#8a8e94"); p.R(165, 44, 3, 3, "#3aa86a");
      // 發黑的銅牌、下面一塊比較白的方塊
      p.R(50, 18, 30, 14, O); p.R(51, 19, 28, 12, "#6a5a2a"); p.R(52, 20, 26, 10, "#8a7a3a"); for (let k = 0; k < 3; k++) p.R(54, 22 + k * 3, 20 - k * 4, 1, "#4a3a1a");
      p.R(52, 36, 22, 14, "#d8ccb4"); p.R(52, 36, 1, 1, "#a89c84"); p.R(73, 36, 1, 1, "#a89c84");
      // 往樓梯間（上 14 樓）的防火門
      fireDoor(p, 204, 22, 26, 44, dA("tlift", "t14"));
      terrazzo(p, 0, 66, 256, 84, "#b0a898");
      T.sides(p, this, "#5a4a3a", [["L", 90, 40], ["B", 200, 36]]); T.sideDoor(p, this, "L", 90, 40, dA("tlift", "tlobby"), "#8a8e94");
      // 往 B2 的樓梯（右下）
      for (let k = 0; k < 4; k++){ p.R(202, 128 + k * 5, 32, 4, O); p.R(203, 129 + k * 5, 30, 3, sh("#8a8478", -k * .08)); }
    },
    props:[
      // 封鎖線拉在電梯口
      { y:70, draw(p){ T.tape(p, 100, 68, 156, 68); for (const x of [100, 156]){ p.R(x - 1, 60, 3, 12, O); p.R(x, 61, 1, 10, "#e84a2a"); } } },
      // 住戶坐的塑膠椅
      { y:140, draw(p){ T.chair(p, 60, 140, "#3a7ab8", "down"); } }
    ],
    front(p, g, t, o){ fluo(p, 110, 2, 40); tone(g, this, o, .35); },
    solid:[[96,58,64,14],[52,122,16,20]],
    exits:[ { r:[0,90,8,40], to:"tlobby", at:[270,116], label:"大廳", kind:"door", art:[0,88,8,44] },
            { r:[204,68,26,8], to:"t14", at:[298,110], label:"14 樓（走樓梯）", kind:"up", art:[204,22,26,44] },
            { r:[200,142,36,8], to:"tb2", at:[288,64], label:"B2 停車場（走樓梯）", kind:"down", art:[200,126,36,24] } ]
  };

  /* ---------- 管委會辦公室：按年分排的鐵櫃、都更投票的白板 ---------- */
  const tcommittee = { name:"管委會辦公室", w:224, h:144, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 224, 58, "#e0dccc", "plain", { base:"#6a5a4a" });
      // 白板：「都更同意書 59／60 戶」＋便條
      p.R(110, 8, 66, 36, O); p.R(111, 9, 64, 34, "#f8f8f4"); p.R(114, 12, 30, 3, "#c8302a"); p.R(116, 18, 22, 6, "#c8302a"); p.R(118, 19, 18, 4, "#f8f8f4"); p.R(120, 20, 4, 2, "#c8302a"); p.R(128, 20, 6, 2, "#c8302a");
      p.R(150, 16, 18, 14, "#f4e88a"); p.R(152, 19, 12, 1, "#3a3a3a"); p.R(152, 22, 10, 1, "#3a3a3a"); p.R(152, 25, 8, 1, "#3a3a3a"); p.R(110, 44, 66, 2, "#8a8e94");
      // 公告欄（右邊）
      p.R(184, 10, 34, 30, O); p.R(185, 11, 32, 28, "#a87a4a"); p.R(188, 14, 14, 18, "#f4f0e6"); p.R(190, 17, 10, 2, "#2a3a6a"); for (let k = 0; k < 4; k++) p.R(190, 21 + k * 2, 10, 1, "#7a7a8a"); p.R(190, 30, 9, 1, "#2a5ad8"); p.R(204, 16, 10, 12, "#f4e8a8");
      laminate(p, 0, 58, 224, 86, "#a8987a");
      T.sides(p, this, "#6a5a4a", [["R", 100, 36]]); T.sideDoor(p, this, "R", 100, 36, dA("tcommittee", "tlobby"), "#8a6a4a");
    },
    props:[
      // 一整排鐵櫃（按年分排，每格貼年份；2006 那一格把手是亮的）
      { y:70, draw(p){ for (let k = 0; k < 6; k++){ const x = 6 + k * 16; T.box(p, x, 18, 15, 8, 40, "#8a9088", "#6a7068"); p.R(x + 3, 30, 9, 4, "#f4f0e6"); p.R(x + 5, 31, 5, 1, "#2a2a2a");
            for (let r = 0; r < 3; r++) p.R(x + 5, 40 + r * 9, 5, 2, k === 3 ? "#f4f4f8" : "#4a4e4a"); if (k !== 3) p.R(x + 1, 27, 13, 1, "rgba(200,200,190,.6)"); } } },
      // 開會的長桌、摺疊椅、一盒 2006 年的卷宗
      { y:112, draw(p){ T.box(p, 64, 88, 96, 16, 8, "#c8b898", "#8a7a5a");
          p.R(76, 90, 22, 10, O); p.R(77, 91, 20, 8, "#c8a878"); p.R(79, 92, 16, 2, "#f4f0e6"); p.R(84, 95, 8, 2, "#2a2a2a"); p.R(110, 92, 14, 9, O); p.R(111, 93, 12, 7, "#f4f0e6"); } },
      { y:84, draw(p){ for (const x of [80, 112, 144]) T.chair(p, x, 84, "#5a5e62", "down"); } },
      { y:128, draw(p){ for (const x of [96, 136]) T.chair(p, x, 128, "#5a5e62", "up"); } },
      { y:138, draw(p){ T.plant(p, 20, 138); } }
    ],
    front(p, g, t, o){ fluo(p, 90, 2, 50); tone(g, this, o, .35); },
    solid:[[4,16,98,52],[62,86,100,28],[10,124,20,16]],
    exits:[ { r:[216,100,8,36], to:"tlobby", at:[116,76], label:"大廳", kind:"door", art:[216,98,8,40] } ]
  };

  /* ---------- 14 樓走廊：左電梯、中間 14A、右邊 14B 和樓梯間 ---------- */
  const t14 = { name:"14 樓走廊", w:320, h:136, wall:62,
    floor(p, g, t, o){
      T.backWall(p, 0, 320, 62, "#e4dcc8", "plain", { base:"#8a7e6a" });
      // 電梯門（關著；三角孔旁邊幾道新的刮痕）
      liftDoor(p, 30, 18, 40, 44, 0, true, true);
      // 14A（方家）：門開著一條縫，封鎖線
      T.backDoor(p, 140, 18, 28, 44, ph(o) === 0 ? .25 : dA("t14", "tliving"), "#7a4a2a", { frame:"#4a2a1a" }); p.R(146, 10, 16, 6, O); p.R(147, 11, 14, 4, "#c8a050"); p.R(150, 12, 8, 2, "#2a2a2a");
      // 14B：狗碗、被撕了一半的紙
      T.backDoor(p, 228, 18, 26, 44, 0, "#8a6a4a", { frame:"#5a4a3a" }); p.R(233, 10, 16, 6, O); p.R(234, 11, 14, 4, "#c8a050");
      p.R(232, 24, 14, 8, "#f4f0e6"); p.R(232, 24, 6, 8, "#e8e4d0"); p.R(240, 26, 5, 1, "#3a3a3a"); p.R(236, 29, 8, 1, "#2a5ad8");
      // 樓梯間的防火門＋上面的監視器
      fireDoor(p, 286, 18, 26, 44, dA("t14", "tmachine")); T.cam(p, 298, 6, -1, t);
      oldTiles(p, 0, 62, 320, 74, "#c8bca4", "#beb29a");
      T.sides(p, this, "#6a5e4a", [["B", 284, 30]]);
      for (let k = 0; k < 4; k++){ p.R(284, 116 + k * 5, 30, 4, O); p.R(285, 117 + k * 5, 28, 3, sh("#8a8478", -k * .08)); }   // 往下的樓梯
    },
    props:[
      // 14A 門口的封鎖線
      { y:66, draw(p, g, t, o){ if (ph(o) === 0) T.tape(p, 134, 64, 174, 64); } },
      // 走廊上的拖鞋（鞋尖朝電梯）
      { y:92, draw(p){ p.R(106, 88, 11, 5, O); p.R(107, 89, 9, 3, "#6a3a24"); p.R(107, 89, 4, 1, "#8a5a3a"); p.R(115, 89, 1, 3, "#e0d8c8"); } },
      // 14B 門口：狗碗、一雙拖鞋
      { y:74, draw(p){ p.R(222, 68, 8, 5, O); p.R(223, 69, 6, 3, "#c84a3a"); p.R(224, 69, 4, 1, "#8a5a3a"); p.R(252, 68, 5, 6, O); p.R(253, 69, 3, 4, "#3a6ad8"); p.R(258, 68, 5, 6, O); p.R(259, 69, 3, 4, "#3a6ad8"); } },
      // 那晚：陳太太抱著的小狗（她站的位置旁邊）
      { y:92, draw(p, g, t, o){ if (ph(o) > 1) return; const x = 258, y = 92; p.R(x - 5, y - 6, 11, 6, O); p.R(x - 4, y - 5, 9, 4, "#e8d8b8"); p.R(x + 3, y - 9, 5, 5, O); p.R(x + 4, y - 8, 3, 3, "#e8d8b8"); p.R(x + 5, y - 7, 1, 1, O); p.R(x - 6, y - 5, 2, 1, "#e8d8b8"); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 40); fluo(p, 200, 2, 40); tone(g, this, o, .4); },
    solid:[[24,14,52,50],[262,84,4,4]],
    exits:[ { r:[140,64,28,8], to:"tliving", at:[36,124], label:"14A 方家", kind:"door", art:[140,18,28,44] },
            { r:[286,64,26,8], to:"tmachine", at:[40,118], label:"頂樓電梯機房（走樓梯）", kind:"up", art:[286,18,26,44] },
            { r:[284,128,30,8], to:"tlift", at:[216,80], label:"1 樓電梯口（走樓梯）", kind:"down", art:[284,112,30,24] } ]
  };

  /* ---------- 方家客廳：老式木板牆、電視還開著 ---------- */
  const tliving = { name:"方家客廳", w:256, h:144, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 58, "#d8ccb0", "panel", { base:"#4a3424", panel:"#7a5232" });
      // 落地窗（外面是城市）
      window2(p, 20, 8, 60, 30, o, t, (x, y, w, h) => cityView(p, o), "#8a7a5a");
      // 全家福（2004）
      p.R(96, 10, 22, 18, O); p.R(97, 11, 20, 16, "#c8a050"); p.R(99, 13, 16, 12, "#a8c0d8"); p.R(101, 17, 3, 6, "#3a3a4a"); p.R(106, 19, 2, 4, "#e86a2a"); p.R(110, 17, 3, 6, "#c84a6a"); for (const x of [101, 106, 110]) p.R(x, 15, 3, 2, "#e8c09a");
      // 往書房的門
      T.backDoor(p, 210, 16, 26, 42, dA("tliving", "tstudy"), "#7a4a2a", { frame:"#4a2a1a" });
      // 地：拼花木地板
      T.herring(p, 0, 58, 256, 86, "#a87a4a");
      T.rug(p, 80, 84, 96, 40, "#7a2a2a", "#c8a050", "#5a1a1a");
      T.sides(p, this, "#4a3424", [["B", 20, 32]]);
    },
    props:[
      // 電視櫃＋電視（停在新聞台）
      { y:74, draw(p, g, t, o){ T.box(p, 130, 52, 60, 10, 12, "#5a3a22", "#3a2414"); p.R(140, 38, 40, 18, O); p.R(141, 39, 38, 15, "#1a1c20"); p.R(142, 40, 36, 13, "#2a4a7a"); p.R(142, 49, 36, 4, "#c8302a"); p.R(144 + (Math.floor(t * 8) % 30), 50, 6, 1, "#f4f4f0"); p.R(156, 56, 8, 2, O); } },
      // 側面的沙發（椅背在左）＋遙控器擺得正正的
      { y:122, draw(p){ const L = "#a86a44", D = "#7a4a2e";
          p.R(54, 82, 10, 42, O); p.R(55, 83, 8, 40, D); p.R(56, 84, 6, 38, L); for (let k = 0; k < 3; k++) p.R(56, 96 + k * 12, 6, 1, D);              // 椅背（靠左邊牆）
          p.R(62, 92, 22, 28, O); p.R(63, 93, 20, 26, sh(L, .08)); p.R(63, 105, 20, 1, D); p.R(63, 93, 20, 1, sh(L, .25));                             // 坐墊（兩塊）
          p.R(54, 80, 32, 12, O); p.R(55, 81, 30, 10, L); p.R(55, 81, 30, 2, sh(L, .2)); p.R(54, 116, 32, 10, O); p.R(55, 117, 30, 8, L); p.R(55, 117, 30, 2, sh(L, .2));   // 兩邊的扶手
          p.R(72, 83, 8, 3, O); p.R(73, 84, 6, 1, "#2a2a2e"); } },
      // 茶几
      { y:112, draw(p){ T.box(p, 104, 94, 44, 14, 6, "#6a4a2a", "#4a2a1a"); p.R(112, 98, 8, 6, O); p.R(113, 99, 6, 4, "#f4f4f0"); } },
      // 門口的鞋櫃（方振華的室內拖鞋只剩一隻）
      { y:132, draw(p){ T.box(p, 8, 96, 16, 30, 6, "#8a6a4a", "#6a4a2a"); p.R(12, 100, 8, 5, O); p.R(13, 101, 6, 3, "#6a3a24"); } }
    ],
    front(p, g, t, o){ T.glow(g, 120, 60, 70, "255,240,200", night(o) ? .14 : .05); tone(g, this, o, .35); },
    solid:[[128,50,64,26],[52,78,36,50],[102,92,48,22],[6,94,20,40]],
    exits:[ { r:[20,136,32,8], to:"t14", at:[154,76], label:"14 樓走廊", kind:"out", art:[18,132,36,12] },
            { r:[210,60,26,8], to:"tstudy", at:[40,132], label:"書房", kind:"door", art:[210,16,26,42] } ]
  };

  /* ---------- 書房：滿牆的書、翻亂的抽屜 ---------- */
  const tstudy = { name:"書房", w:256, h:150, wall:64,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 64, "#e0d4b8", "plain", { base:"#4a3424" });
      // 一整面書櫃（最上面一層是一排《電梯安全法規彙編》）
      T.shelf(p, 8, 4, 170, 56, 4, "#5a3a22"); p.R(10, 6, 166, 10, "#3a2414"); for (let k = 0; k < 18; k++){ p.R(12 + k * 9, 7, 8, 9, O); p.R(13 + k * 9, 8, 6, 8, "#2a4a7a"); p.R(13 + k * 9, 10, 6, 1, "#e9c46a"); }
      T.carpet(p, 0, 64, 256, 86, "#6a5a4a");
      // 血跡（那晚之後還留著）＋粉筆的輪廓
      p.R(206, 112, 14, 8, "rgba(110,20,20,.65)"); p.R(210, 118, 8, 4, "rgba(110,20,20,.5)");
      if (ph(o) >= 1){ const c = "rgba(240,240,230,.8)"; p.R(186, 104, 40, 1, c); p.R(186, 118, 40, 1, c); p.R(186, 104, 1, 14, c); p.R(226, 104, 1, 14, c); p.R(226, 108, 8, 1, c); }
      T.sides(p, this, "#4a3424", [["B", 24, 32]]);
    },
    props:[
      // 右邊的矮書櫃，下面是保險箱
      { y:100, draw(p){ T.box(p, 214, 36, 36, 10, 54, "#5a3a22", "#3a2414"); T.books(p, 218, 50, 28, 12, 7); T.books(p, 218, 66, 28, 10, 9);
          p.R(220, 78, 24, 20, O); p.R(221, 79, 22, 18, "#4a4e54"); p.R(222, 80, 20, 16, "#5a5e64"); p.R(234, 84, 6, 6, O); p.R(235, 85, 4, 4, "#c8ccd2"); p.R(224, 86, 4, 2, "#c8ccd2"); } },
      // 書桌：烏龍茶（左）、金錶盒、合約＋便條、攤開的相簿（右），三個抽屜全拉出來
      { y:108, draw(p, g, t){ T.box(p, 64, 74, 112, 18, 14, "#6a4428", "#4a2a14");
          p.R(70, 76, 10, 8, O); p.R(71, 77, 8, 6, "#8a5a3a"); p.R(80, 78, 2, 2, "#8a5a3a"); p.R(84, 78, 6, 6, O); p.R(85, 79, 4, 4, "#f4f4f0"); p.R(86, 80, 2, 2, "#8a6a2a");   // 茶壺、杯子
          p.R(98, 78, 18, 12, O); p.R(99, 79, 16, 10, "#f8f4ec"); p.R(101, 81, 12, 1, "#2a3a6a"); p.R(101, 84, 10, 1, "#7a7a8a"); p.R(108, 78, 8, 6, "#f4e88a");   // 合約＋便條
          p.R(124, 78, 8, 6, O); p.R(125, 79, 6, 4, "#e8e4d0"); p.R(130, 82, 6, 4, O); p.R(131, 83, 4, 2, "#a8742a");                                               // 銅紙鎮壓著發票
          p.R(140, 76, 30, 14, O); p.R(141, 77, 14, 12, "#e8e0c8"); p.R(156, 77, 13, 12, "#e8e0c8"); p.R(143, 79, 10, 6, "#c8c0a8"); p.R(158, 79, 9, 3, "#a8a090");    // 相簿
          p.R(160, 74, 10, 6, O); p.R(161, 75, 8, 4, "#7a2a2a"); p.R(163, 76, 4, 2, "#e9c43a");                                                                       // 開著的錶盒、金錶
          for (let k = 0; k < 3; k++){ p.R(72 + k * 34, 106, 26, 8, O); p.R(73 + k * 34, 107, 24, 6, "#5a3418"); p.R(82 + k * 34, 108, 4, 1, "#c8a050"); } } },
      { y:72, draw(p){ T.chair(p, 120, 72, "#3a2a1e", "down"); } },
      // 從抽屜倒出來的東西（文具、發票、藥袋、藍色支票簿）
      { y:124, draw(p){ for (const [x, y, w, c] of [[70, 118, 8, "#f4f4f0"], [86, 122, 6, "#e84a3a"], [100, 117, 10, "#f4f0e6"], [114, 124, 7, "#f4f4f0"], [140, 118, 6, "#3a8a4a"], [130, 121, 5, "#f4e8a8"]]){ p.R(x, y, w, 4, O); p.R(x + 1, y + 1, w - 2, 2, c); }
          p.R(150, 120, 14, 8, O); p.R(151, 121, 12, 6, "#2a5ab8"); p.R(152, 123, 10, 1, "#f4f4f0"); } },
      // 那一晚：方振華側躺在書桌和書櫃之間，右手伸向書櫃
      { y:118, draw(p, g, t, o){ if (ph(o) !== 0) return; SP.draw(g, 192, 116, { skin:"#d8b090", hair:"#9a9a9a", hairStyle:"short", top:"#8a8e94", bottom:"#7a7e84", hat:null }, { view:"side", facing:-1, act:"lie", f:0 }); p.R(210, 104, 4, 2, O); p.R(211, 104, 3, 1, "#d8b090"); } },
      // 那一晚：證物號碼牌
      { y:130, draw(p, g, t, o){ if (ph(o) !== 0) return; T.marker(p, 216, 126, 1); T.marker(p, 100, 130, 2); T.marker(p, 80, 120, 3); } }
    ],
    front(p, g, t, o){ T.glow(g, 120, 70, 60, "255,236,200", .12); tone(g, this, o, .35); },
    solid:[[6,2,174,60],[212,34,40,62],[62,72,116,42]],
    exits:[ { r:[24,142,32,8], to:"tliving", at:[222,70], label:"客廳", kind:"out", art:[22,138,36,12] } ]
  };

  /* ---------- 頂樓電梯機房：曳引機、控制櫃、保養日誌 ---------- */
  const tmachine = { name:"頂樓電梯機房", w:256, h:140, wall:56,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 56, "#a8aaa4", "plain", { base:"#4a4e4a" }); p.seed(77); for (let k = 0; k < 12; k++) p.R(p.rnd() * 250, 6 + p.rnd() * 40, 2, 6 + p.rnd() * 8, "rgba(80,80,70,.25)");
      // 控制櫃（鑰匙開關 NOR／INS、貼紙）
      p.R(20, 6, 40, 48, O); p.R(21, 7, 38, 46, "#c8ccc8"); p.R(26, 12, 14, 8, "#1e2a22"); p.R(28, 14, 8, 2, "#6fd46f"); p.R(46, 12, 8, 8, O); p.R(47, 13, 6, 6, "#e9c43a"); p.R(49, 14, 2, 4, O);
      p.R(26, 26, 28, 10, "#f4f4ee"); p.R(28, 28, 20, 1, "#c8302a"); for (let k = 0; k < 3; k++) p.R(28, 30 + k * 2, 22, 1, "#7a7a8a"); for (let k = 0; k < 4; k++) p.R(26 + k * 7, 42, 5, 5, ["#6fd46f", "#e84a3a", "#e9c43a", "#6fd46f"][k]);
      // 鐵架上一排保養日誌（2001～今年；2006 那本凸出來一點）
      p.R(66, 10, 60, 44, O); p.R(67, 11, 58, 42, "#5a5e5a"); for (let r = 0; r < 2; r++){ p.R(67, 30 + r * 20, 58, 2, "#8a8e8a"); for (let k = 0; k < 13; k++) p.R(69 + k * 4, 14 + r * 20, 3, 16, k === 5 && r === 0 ? "#c8a050" : ["#2a5a8a", "#2a4a6a", "#3a6a9a"][k % 3]); }
      // 通風窗（很熱）
      window2(p, 160, 10, 40, 20, o, t, (x, y, w, h) => { for (let k = 0; k < 5; k++) p.R(x, y + 3 + k * 4, w, 1, "#5a5e5a"); }, "#8a8e8a");
      concrete(p, 0, 56, 256, 84, "#8a8a84", 41);
      // 鋼索穿下去的洞
      p.R(150, 104, 26, 10, O); p.R(151, 105, 24, 8, "#0a0a0a");
      T.sides(p, this, "#4a4e4a", [["B", 24, 32]]);
      for (let k = 0; k < 3; k++){ p.R(24, 124 + k * 5, 32, 4, O); p.R(25, 125 + k * 5, 30, 3, sh("#8a8478", -k * .1)); }
    },
    props:[
      // 曳引機：馬達＋捲著鋼索的輪子（鋼索油亮，往下穿進洞裡）
      { y:104, draw(p, g, t){ T.box(p, 136, 70, 54, 20, 14, "#3a6a5a", "#2a4a3a"); p.R(146, 64, 22, 26, O); p.R(147, 65, 20, 24, "#4a4e54"); p.R(149, 67, 16, 20, "#2a2a2e");
          const a = t * 4; p.R(156 + Math.round(Math.cos(a) * 6), 77 + Math.round(Math.sin(a) * 6), 2, 2, "#c8ccd2");
          for (let k = 0; k < 4; k++){ p.R(152 + k * 4, 86, 1, 20, "#1a1a1a"); p.R(153 + k * 4, 86, 1, 20, "#5a5a5a"); }
          p.R(176, 74, 10, 12, O); p.R(177, 75, 8, 10, "#c8302a"); } },
      // 地上墊著接油的報紙、吃完的便當盒、筷子
      { y:118, draw(p){ p.R(196, 102, 34, 16, O); p.R(197, 103, 32, 14, "#e8e4d8"); for (let k = 0; k < 4; k++) p.R(199, 105 + k * 3, 28, 1, "#9a9a92"); p.R(204, 108, 6, 3, "rgba(20,20,20,.5)");
          p.R(212, 104, 14, 8, O); p.R(213, 105, 12, 6, "#f4f4f0"); p.R(213, 105, 12, 1, "#c8c8c0"); p.R(214, 113, 12, 1, "#8a6a4a"); } },
      // 工具一支一支擺在地上（技師的）
      { y:96, draw(p){ for (let k = 0; k < 5; k++){ p.R(30 + k * 6, 88, 4, 8, O); p.R(31 + k * 6, 89, 2, 6, ["#c8302a", "#e9c43a", "#8a8e94", "#2a5ad8", "#8a8e94"][k]); } } }
    ],
    front(p, g, t, o){ fluo(p, 100, 2, 50, Math.floor(t * 4) % 11 === 0); g.save(); g.globalAlpha = .05 + .03 * Math.sin(t * 2); g.fillStyle = "#ff8a3a"; g.fillRect(0, 0, this.w, this.h); g.restore(); tone(g, this, o, .3); },
    solid:[[18,4,44,52],[64,8,64,48],[134,62,58,44],[148,102,30,14]],
    exits:[ { r:[24,132,32,8], to:"t14", at:[298,82], label:"14 樓（走樓梯）", kind:"down", art:[22,120,36,20] } ]
  };

  /* ---------- 地下二樓停車場：柱子、一閃一閃的燈管、電梯口的白菊花 ---------- */
  const tb2 = { name:"地下二樓停車場", w:320, h:156, wall:50,
    floor(p, g, t, o){
      concrete(p, 0, 0, 320, 50, "#7a7a74", 13); p.R(0, 45, 320, 5, "#3a3a38"); p.R(0, 50, 320, 1, O);
      // B2 電梯門＋樓層燈
      liftDoor(p, 130, 12, 32, 38, 0, false, false);
      // 天花板上的監視器（插頭被拔掉、掛在半空中晃）＋插座
      p.R(200, 4, 16, 6, O); p.R(201, 5, 14, 4, "#d6d6d6"); p.R(212, 6, 3, 2, "#2a2a2e"); p.R(222, 2, 6, 6, O); p.R(223, 3, 4, 4, "#e8e4d8"); p.R(224, 4, 1, 2, O); p.R(226, 4, 1, 2, O);
      const sw = Math.round(Math.sin(t * 2) * 1.5); p.R(216, 8, 1, 10, "#1a1a1a"); p.R(215 + sw, 18, 3, 3, "#2a2a2a");
      // 往 B1 的坡道（左）
      p.R(0, 50, 40, 106, "#5a5a56"); for (let k = 0; k < 10; k++) p.R(0, 54 + k * 10, 40, 2, "#4a4a46"); p.R(40, 50, 2, 106, "#e9c43a"); p.R(8, 56, 20, 6, "#e9c43a"); p.R(10, 57, 16, 4, "#2a2a2a");
      // 地：環氧樹脂，停車格
      p.R(42, 51, 278, 105, "#6a6e6a"); p.seed(5); for (let k = 0; k < 500; k++) p.R(42 + p.rnd() * 278, 51 + p.rnd() * 105, 2, 1, "#5e625e");
      for (let x = 60; x < 320; x += 52) p.R(x, 100, 2, 56, "#e9e4da");
      p.R(42, 98, 278, 2, "#e9c43a");
      // 排水溝（電梯口前面），一小灘帶油花的水
      p.R(120, 84, 60, 4, O); for (let x = 122; x < 178; x += 4) p.R(x, 85, 2, 2, "#1a1a1a"); p.R(184, 86, 18, 5, "rgba(140,160,180,.45)"); p.R(188, 87, 3, 1, "#8a6aa8"); p.R(194, 88, 3, 1, "#6a8aa8");
      T.sides(p, this, "#3a3a38", [["L", 50, 106]]);
    },
    props:[
      // 乾掉的白菊花（黑色緞帶）
      { y:54, draw(p){ p.R(164, 42, 10, 10, O); p.R(165, 43, 8, 8, "#d8d0b0"); p.R(166, 43, 2, 2, "#f4f4e8"); p.R(170, 44, 2, 2, "#f4f4e8"); p.R(167, 48, 4, 2, "#1a1a1a"); } },
      // 柱子（底座上有一個灰灰的鞋印）
      { y:86, draw(p){ T.box(p, 228, 56, 18, 14, 16, "#9a9a96", "#7a7a76"); p.R(228, 66, 18, 3, "#e9c43a"); p.R(232, 82, 5, 3, "#5a5a56"); } },
      // 8A 王先生的車（停在電梯口斜對面）＋另外兩台
      { y:148, draw(p, g){ SP.car(g, 112, 148, { col:"#2a3a5a", facing:-1 }); SP.car(g, 268, 148, { col:"#c8c8c4", facing:1 }); } },
      { y:96, draw(p, g){ SP.car(g, 76, 96, { col:"#7a2a2a", facing:-1 }); } },
      // 樓梯間的門（右後）
      { y:50, draw(p, g, t, o){ fireDoor(p, 276, 6, 24, 40, dA("tb2", "tlift")); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 40); fluo(p, 180, 2, 40, Math.floor(t * 3) % 5 === 0); T.dim(g, this, .14); tone(g, this, o, .2); },
    solid:[[226,54,22,36],[78,112,68,40],[234,112,68,40],[42,60,68,40]],
    exits:[ { r:[276,50,24,8], to:"tlift", at:[218,130], label:"1 樓電梯口（走樓梯）", kind:"up", art:[276,6,24,40] } ]
  };

  const spots = {
    // 大廳
    cctv_lift:[150,10,20,16,160,64,"tlobby",A("type",{ actT:2 })],
    cctv_lobby:[172,10,20,16,182,64,"tlobby",A("type",{ actT:2 })],
    cctv_b2:[194,10,20,16,204,64,"tlobby",A("type",{ actT:2 })],
    cctv_stair14:[150,30,86,16,226,64,"tlobby",A("type",{ actT:2 })],
    doc_guardlog:[200,75,16,9,208,104,"tlobby",A("read",{ actT:1.6 })],
    doc_gatelog:[150,74,14,9,156,110,"tlobby",A("read",{ actT:1.6 })],
    o7_mailbox:[14,8,78,44,52,74,"tlobby",A("look")],
    o7_guardtv:[224,73,14,11,250,88,"tlobby",A("look",{ face:-1 })],
    // 電梯口
    o7_liftsign:[118,26,20,14,128,80,"tlift",A("read")],
    o7_plaque:[50,18,30,14,64,78,"tlift",A("read")],
    o7_lifthole:[122,4,12,6,140,80,"tlift",A("look")],
    // 管委會
    doc_2006:[76,90,22,10,88,124,"tcommittee",A("read",{ actT:1.6 })],
    o7_vote:[110,8,66,36,140,72,"tcommittee",A("read")],
    o7_cabinet:[6,18,96,48,112,72,"tcommittee",A("look",{ face:-1 })],
    // 14 樓
    ev_14door:[30,4,40,58,50,78,"t14",A("crouch",{ actT:1.6 })],
    o7_chendoor:[222,18,40,56,240,82,"t14",A("look")],
    o7_stairdoor:[286,4,26,58,280,80,"t14",A("look",{ face:1 })],
    // 客廳
    o7_tv:[130,36,60,26,160,86,"tliving",A("look")],
    o7_door14a:[8,96,16,34,36,116,"tliving",A("look",{ face:-1 })],
    // 書房
    ev_body:[186,104,44,16,190,132,"tstudy",A("crouch",{ actT:1.6 })],
    ev_collar:[192,106,12,8,198,132,"tstudy",A("crouch",{ actT:1.6 })],
    ev_safe:[220,78,24,20,206,104,"tstudy",A("crouch",{ face:1 })],
    ev_drawers:[72,104,96,10,120,132,"tstudy",A("look",{ actT:1.6 })],
    ev_contract:[98,78,18,12,106,67,"tstudy",A("read",{ actT:1.6 })],
    o7_photos:[140,76,30,14,150,67,"tstudy",A("read")],
    o7_checkbook:[150,120,14,8,170,134,"tstudy",A("pickup")],
    o7_teacup:[70,76,20,8,76,67,"tstudy",A("look")],
    o7_paperweight:[124,78,14,8,132,67,"tstudy",A("look")],
    // 機房
    ev_logbook:[66,10,60,44,98,72,"tmachine",A("read",{ actT:1.6 })],
    o7_controller:[20,6,40,48,40,72,"tmachine",A("look")],
    o7_motor:[136,62,54,42,200,92,"tmachine",A("crouch",{ face:-1 })],
    // B2
    ev_b2cam:[198,2,32,20,206,66,"tb2",A("look")],
    ev_dashcam:[78,112,68,36,112,104,"tb2",A("look")],
    o7_flowers:[162,40,14,14,176,64,"tb2",A("crouch",{ face:-1 })],
    o7_ramp:[0,50,40,106,50,120,"tb2",A("look",{ face:-1 })]
  };
  const details = {
    d7_peanut:[124,88,14,10,120,104,"tlobby",A("crouch")],
    d7_mark:[52,36,22,14,62,78,"tlift",A("look")],
    d7_button:[158,34,10,16,170,80,"tlift",A("look")],
    d7_notice:[184,10,34,30,200,72,"tcommittee",A("read")],
    d7_slipper:[104,86,14,8,98,100,"t14",A("crouch",{ face:1 })],
    d7_photo:[96,10,22,18,108,72,"tliving",A("look")],
    d7_book:[10,6,166,12,190,67,"tstudy",A("look",{ face:-1 })],
    d7_bento:[196,102,34,16,212,126,"tmachine",A("crouch")],
    d7_puddle:[120,82,84,12,176,104,"tb2",A("crouch")]
  };
  const place = {
    su:[ { room:"tlobby", x:214, y:68, act:"idle", facing:-1 }, { room:"tlobby", x:190, y:70, act:"sit", facing:-1, view:"side" }, { room:"tlobby", x:190, y:70, act:"sit", facing:-1, view:"side" } ],
    chen:[ { room:"t14", x:248, y:94, act:"cross", facing:-1 }, { room:"t14", x:248, y:94, act:"idle", facing:-1 }, { room:"tlift", x:60, y:112, act:"cross", facing:1 } ],
    lin:[ null, { room:"tliving", x:72, y:110, act:"sitCry", facing:1, view:"side" }, { room:"tliving", x:110, y:128, act:"sweep", facing:-1 } ],
    zheng:[ null, { room:"tlift", x:184, y:104, act:"cross", facing:-1 }, { room:"tlobby", x:216, y:116, act:"idle", facing:-1 } ],
    zhao:[ { room:"t14", x:96, y:110, act:"smoke", facing:1 } ],
    qian:[ { room:"tstudy", x:158, y:124, act:"kneel", facing:1 } ],
    wu:[ { room:"t14", x:58, y:80, act:"kneel", facing:-1 } ],
    liu:[ { room:"tmachine", x:42, y:90, act:"kneel", facing:-1 } ]
  };
  const EX = { for7:{ room:"tstudy", x:120, y:142, act:"cam", facing:1 }, cop7a:{ room:"tlobby", x:100, y:136, act:"idle", facing:1 },
    cop7b:{ room:"t14", x:270, y:104, act:"idle", facing:-1 }, fam7:{ room:"tlift", x:150, y:120, act:"cross", facing:-1 } };
  const extras = (W0.extras || []).map(e => EX[e.id] ? { ...e, ...EX[e.id] } : e);
  const intro = [ { set:{ room:"tlobby", px:144, py:150 }, hide:true }, { wait:0.3, hide:true }, { set:{ room:"tlobby", px:144, py:130 } },
    ...(W0.intro || []).filter(k => k.say || (k.wait && !k.hide)).map(k => k.say && k.say[0] === "wu" && /點畫面上的箭嘴|📍|清單不是全部/.test(k.say[1]) ? null : k).filter(Boolean),
    { say:["wu", "想去哪裡，點畫面上的門口、樓梯就會自己走過去。閃著星星的就是還沒看過的東西，按上面的「🧭 平面圖」看全部在哪裡。"], name:"小吳" } ];
  setLoc("tower", { start:"tlobby", spawn:[144,130], rooms:{ tlobby, tlift, tcommittee, t14, tliving, tstudy, tmachine, tb2 }, spots, details, place, extras, intro,
    plan:[ { name:"頂樓", w:100, h:14, rooms:{ tmachine:[60,0,40,14] } },
           { name:"14 樓", w:100, h:30, rooms:{ t14:[0,0,100,10], tliving:[20,10,40,20], tstudy:[60,10,40,20] } },
           { name:"1 樓", w:100, h:30, rooms:{ tcommittee:[0,0,30,30], tlobby:[30,0,45,30], tlift:[75,0,25,30] } },
           { name:"B2", w:100, h:20, rooms:{ tb2:[0,0,100,20] } } ] });
})();

/* ================= 刑大（共用）、鑑識中心（共用）、永升電梯、好運來麻將館、宏遠建設、劉文彬的住處 ================= */
C7T && (() => {
  const { EP, T, O, sh, dA, ph, night, A, tone, window2, cityView, fluo, marble, vinyl, laminate, carpetTiles, concrete, setLoc } = C7T;

  /* ---------- 刑大：同一間；這一集白板上寫著羈押的期限，偵訊室外面的椅子 ---------- */
  const pdesk = CG_DESK(C7T, { meetOk:false,
    board(p){ p.R(160, 28, 30, 14, "#f8f8f4"); p.R(162, 30, 18, 2, "#2a3a6a"); p.R(162, 34, 14, 2, "#c8302a"); p.R(182, 30, 6, 10, O); p.R(183, 31, 4, 8, "#c8ccd2"); p.R(184, 33, 2, 1, O); },   // 「方家豪 羈押？」＋一個電梯
    props:[
      // 偵訊室外面的椅子（方家豪坐這裡抖腳）
      { y:148, draw(p){ T.chair(p, 40, 148, "#3a5a8a", "right"); } },
      { y:150, draw(p){ T.chair(p, 66, 150, "#3a5a8a", "right"); } }
    ] });
  const W0 = EP.world.police || {};
  setLoc("police", { start:"pdesk", spawn:[170,154], rooms:{ pdesk },
    spots:{ o7_memo:[50,78,16,8,56,106,"pdesk",A("read")] },
    details:{ d7_board:[124,6,70,40,158,70,"pdesk",A("read")] },
    place:{
      jiahao:[null, { room:"pdesk", x:40, y:148, act:"sit", facing:1, view:"side" }],
      ye:[null, { room:"pdesk", x:178, y:146, act:"read", facing:-1 }]
    },
    extras:W0.extras || [],
    plan:[ { name:"澄港市刑大", w:100, h:30, rooms:{ pdesk:[0,0,100,30] } } ] });

  /* ---------- 鑑識中心：同一間；老錢的小桌（保溫杯、收音機） ---------- */
  const LW = EP.world.lab || {};
  setLoc("lab", { start:"lab", spawn:[144,140],
    rooms:{ lab:CG_LAB(C7T, { props:[
      { y:136, draw(p, g, t){ T.box(p, 30, 116, 60, 12, 8, "#a8aca8", "#7a7e7a");
          p.R(70, 112, 8, 12, O); p.R(71, 113, 6, 10, "#c8ccd2"); p.R(71, 113, 6, 2, "#5a5e64"); p.R(72, 117, 4, 3, "#f4e88a");   // 保溫杯＋便利貼
          p.R(40, 116, 14, 8, O); p.R(41, 117, 12, 6, "#6a4a2a"); p.R(42, 118, 5, 4, "#3a3a3a"); p.R(49, 118, 3, 2, "#c8b07a"); if (Math.floor(t * 2) % 2) p.R(56, 114, 2, 1, "#f4f4f0"); } }   // 收音機（音符）
    ], solid:[[28,114,64,24]] }) },
    spots:{ o7_thermos:[68,110,12,14,100,128,"lab",A("look",{ face:-1 })] },
    details:{ d7_radio:[38,114,18,12,60,144,"lab",A("look")] },
    place:{ qian:[null, { room:"lab", x:104, y:142, act:"drink", facing:-1 }], wu:[null, { room:"lab", x:210, y:104, act:"sit", facing:1, view:"side" }] },
    extras:(LW.extras || []).map(e => e.id === "xu7" ? { ...e, room:"lab", x:154, y:118, act:"read", facing:-1 } : e),
    plan:[ { name:"鑑識中心", w:100, h:20, rooms:{ lab:[0,0,100,20] } } ] });

  /* ---------- 永升電梯・遠端監控中心：一整面牆的螢幕在跳數字 ---------- */
  const ysroom = { name:"永升電梯・監控中心", w:304, h:156, wall:64,
    floor(p, g, t, o){
      T.backWall(p, 0, 304, 64, "#dce0e4", "plain", { base:"#2a5a8a" });
      // 員工證照影本（牆角）
      p.R(8, 12, 30, 34, O); p.R(9, 13, 28, 32, "#f4f4ee"); for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++){ p.R(11 + c * 13, 15 + r * 10, 11, 8, "#e8e4d8"); p.R(12 + c * 13, 16 + r * 10, 4, 5, "#a8b8c8"); }
      // 一整面牆的螢幕（3 × 5），數字一直跳；有一格是紅的
      p.R(50, 6, 140, 54, O); p.R(51, 7, 138, 52, "#1a1c20");
      for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++){ const x = 53 + c * 27, y = 9 + r * 16; p.R(x, y, 25, 14, (r === 0 && c === 2) ? "#3a1414" : "#0e2a1e");
        for (let k = 0; k < 3; k++) p.R(x + 2, y + 2 + k * 4, 6 + ((Math.floor(t * 4) + k * 3 + c + r * 2) % 14), 2, (r === 0 && c === 2) ? "#e84a3a" : "#6fd46f"); }
      // 排班表
      p.R(200, 10, 40, 40, O); p.R(201, 11, 38, 38, "#f8f8f4"); p.R(203, 13, 34, 4, "#2a5a8a"); for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) p.R(203 + c * 9, 20 + r * 5, 7, 3, (r === 2 && c === 2) ? "#c8302a" : "#c8ccd0");
      // 鑰匙櫃（每個技師一格；有一格是空的）
      p.R(250, 12, 44, 34, O); p.R(251, 13, 42, 32, "#8a8e94"); for (let k = 0; k < 8; k++){ const x = 253 + (k % 4) * 10, y = 15 + Math.floor(k / 4) * 15; p.R(x, y, 8, 13, "#6a6e74"); if (k !== 5){ p.R(x + 2, y + 2, 4, 4, "#c9a24a"); p.R(x + 3, y + 7, 2, 4, "#c9a24a"); } }
      p.R(242, 2, 50, 8, "#2a5a8a"); p.R(246, 4, 20, 4, "#f4f4ee");   // 「永升」
      carpetTiles(p, 0, 64, 304, 92, "#5a6a7a", "#52626e");
      T.sides(p, this, "#2a5a8a", [["B", 140, 36]]);
    },
    props:[
      // 調度台（三台螢幕、耳機、便當袋）
      { y:104, draw(p, g, t){ T.box(p, 60, 78, 110, 14, 10, "#e8ecf0", "#a8acb0");
          for (let k = 0; k < 3; k++){ p.R(68 + k * 30, 66, 24, 14, O); p.R(69 + k * 30, 67, 22, 11, "#1e2226"); p.R(70 + k * 30, 68, 20, 9, "#0e2a1e"); p.R(72 + k * 30, 70 + (Math.floor(t * 3 + k) % 5), 10, 1, "#6fd46f"); }
          p.R(140, 80, 16, 10, O); p.R(141, 81, 14, 8, "#f4f4f0"); p.R(143, 83, 10, 1, "#7a7a8a"); p.R(143, 86, 8, 1, "#7a7a8a");   // 印出來的紀錄
          p.R(158, 78, 10, 10, O); p.R(159, 79, 8, 8, "#6a8a5a"); p.R(160, 80, 6, 2, "#e8e0c8"); } },                              // 便當袋
      { y:96, draw(p){ T.chair(p, 50, 96, "#2a3a5a", "right"); } },
      // 報廢籃（拆下來的零件、一條捲起來的線）
      { y:120, draw(p){ p.R(220, 100, 36, 20, O); p.R(221, 101, 34, 18, "#5a6a7a"); for (let k = 0; k < 6; k++) p.R(223 + k * 5, 102, 1, 16, "#4a5a6a");
          p.R(226, 96, 10, 6, O); p.R(227, 97, 8, 4, "#2a2a2a"); p.R(238, 95, 8, 6, O); p.R(239, 96, 6, 4, "#c8302a"); p.R(232, 94, 14, 3, "#1a1a1a"); p.R(244, 92, 4, 4, "#f4f4f0"); } },
      // 排班表前面的椅子（第三天劉文彬坐在這裡）
      { y:86, draw(p){ T.chair(p, 212, 86, "#3a3a44", "left"); } },
      { y:150, draw(p){ T.plant(p, 18, 150, true); T.plant(p, 286, 150, true); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 60); fluo(p, 220, 2, 60); g.save(); g.globalAlpha = .06; g.fillStyle = "#6fd4a0"; g.fillRect(50, 60, 140, 30); g.restore(); tone(g, this, o, .3); },
    solid:[[48,4,144,58],[58,64,114,40],[218,90,40,32],[10,136,18,18],[276,136,18,18],[248,10,48,38]],
    exits:[]
  };
  setLoc("yongsheng", { start:"ysroom", spawn:[158,146], rooms:{ ysroom },
    spots:{
      doc_liftlog:[140,80,16,10,148,112,"ysroom",A("read",{ actT:1.6 })],
      ev_oldsensor:[220,92,36,28,238,132,"ysroom",A("crouch",{ actT:1.6 })],
      o7_roster:[200,10,40,40,220,72,"ysroom",A("read")],
      o7_keys:[250,12,44,34,262,72,"ysroom",A("look")]
    },
    details:{ d7_cert:[8,12,30,34,26,76,"ysroom",A("look")], d7_lunch:[158,78,10,10,180,96,"ysroom",A("look",{ face:-1 })] },
    place:{
      liu:[null, { room:"ysroom", x:206, y:126, act:"write", facing:1 }, { room:"ysroom", x:212, y:86, act:"sit", facing:-1, view:"side" }],
      fen:[null, { room:"ysroom", x:50, y:96, act:"sit", facing:1, view:"side" }]
    },
    plan:[ { name:"永升電梯", w:100, h:30, rooms:{ ysroom:[0,0,100,30] } } ] });

  /* ---------- 好運來麻將館：紅招牌、綠桌、煙 ---------- */
  const mjhall = { name:"好運來麻將館", w:304, h:160, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 304, 60, "#c8b890", "stripe", { base:"#6a4a2a" });
      // 紅招牌「好運來」
      p.R(110, 6, 70, 18, O); p.R(111, 7, 68, 16, "#c23a2a"); for (let k = 0; k < 3; k++){ p.R(118 + k * 20, 10, 12, 10, "#f4e48a"); p.R(121 + k * 20, 12, 6, 6, "#c23a2a"); }
      // 櫃台後面的軟木板（欠條，一張蓋著紅色的「彪」字）
      p.R(16, 10, 50, 36, O); p.R(17, 11, 48, 34, "#a8845a"); for (let i = 0; i < 6; i++){ const x = 20 + (i % 3) * 15, y = 14 + Math.floor(i / 3) * 15; p.R(x, y, 12, 12, "#f4f0e0"); p.R(x + 2, y + 3, 8, 1, "#7a7a7a"); } p.R(39, 32, 5, 5, "#c23a2a");
      // 牆角的監視器
      T.cam(p, 286, 8, -1, t);
      // 財神、紅燈籠
      p.R(200, 10, 20, 26, O); p.R(201, 11, 18, 24, "#8a1a1a"); p.R(205, 14, 10, 12, "#e9c43a"); p.R(207, 16, 6, 6, "#c84a3a");
      for (const x of [240, 262]){ p.R(x, 6, 12, 14, O); p.R(x + 1, 7, 10, 12, "#e84a3a"); p.R(x + 4, 20, 4, 4, "#e9c43a"); }
      // 地：舊磁磚，有菸蒂
      vinyl(p, 0, 60, 304, 100, "#8a7a5a", "#82725a", 16); p.seed(11); for (let k = 0; k < 18; k++) p.R(p.rnd() * 300, 64 + p.rnd() * 90, 3, 1, "#e9e4da");
      T.sides(p, this, "#6a4a2a", [["B", 140, 36]]);
    },
    props:[
      // 櫃台（底下睡著一隻黑貓）＋小螢幕
      { y:84, draw(p, g, t){ T.box(p, 10, 58, 66, 12, 14, "#7a5a3a", "#5a3a22"); p.R(56, 50, 16, 10, O); p.R(57, 51, 14, 8, "#1e2226"); p.R(58, 52, 12, 6, "#3a4a3a");
          const b = Math.round(Math.sin(t * 1.5)); p.R(24, 84, 16, 7 + b, O); p.R(25, 85, 14, 5 + b, "#1a1a1e"); p.R(36, 82, 6, 6, O); p.R(37, 83, 4, 4, "#1a1a1e"); p.R(38, 84, 1, 1, "#e9c43a"); p.R(18, 88, 7, 2, "#1a1a1e"); } },
      // 四張麻將桌（綠色桌面、牌、椅子）；右下角那桌的煙灰缸堆滿了
      { y:116, draw(p, g, t){ for (const [x, y] of [[110, 82], [196, 82]]) mjTable(p, x, y, t); } },
      { y:150, draw(p, g, t){ for (const [x, y] of [[110, 118], [196, 118]]) mjTable(p, x, y, t); p.R(222, 128, 10, 6, O); p.R(223, 129, 8, 4, "#8a8a8a"); for (let k = 0; k < 5; k++) p.R(224 + k, 128 - (k % 2), 1, 2, "#e9e4da"); } },
      // 飲水機、牆邊的鐵櫃
      { y:150, draw(p){ T.box(p, 282, 126, 16, 10, 16, "#e8ecf0", "#c8ccd0"); p.R(286, 116, 8, 12, O); p.R(287, 117, 6, 10, "#9ac0e0"); } }
    ],
    front(p, g, t, o){ g.save(); g.globalAlpha = .1; g.fillStyle = "#c8c0a8"; for (let k = 0; k < 5; k++) g.fillRect((k * 70 + t * 6) % 320 - 20, 40 + k * 18, 70, 10); g.restore(); T.glow(g, 150, 50, 90, "255,220,150", .12); tone(g, this, o, .3); },
    solid:[[8,48,70,40],[96,70,56,36],[182,70,56,36],[96,106,56,36],[182,106,56,36],[280,114,20,30]],
    exits:[]
  };
  function mjTable(p, x, y, t){ T.box(p, x, y, 28, 20, 6, "#2a6a3a", "#5a3a22"); p.R(x + 2, y + 2, 24, 16, "#3a8a4a");
    for (let k = 0; k < 6; k++){ p.R(x + 4 + k * 3, y + 3, 2, 3, "#f4f0e0"); p.R(x + 4 + k * 3, y + 14, 2, 3, "#f4f0e0"); }
    for (const [cx, cy, f] of [[x - 6, y + 14, "right"], [x + 34, y + 14, "left"]]) T.chair(p, cx, cy, "#8a1a1a", f); }
  setLoc("mahjong", { start:"mjhall", spawn:[158,150], rooms:{ mjhall },
    spots:{
      cctv_mahjong:[56,50,16,10,88,96,"mjhall",A("type",{ actT:2, face:-1 })],
      o7_iou:[16,10,50,36,86,66,"mjhall",A("read",{ face:-1 })],
      o7_tiles:[196,118,40,26,256,140,"mjhall",A("look",{ face:-1 })]
    },
    details:{ d7_cat:[16,80,30,12,40,98,"mjhall",A("crouch")] },
    place:{ heimao:[null, { room:"mjhall", x:190, y:132, act:"sit", facing:1, view:"side" }, { room:"mjhall", x:190, y:132, act:"sit", facing:1, view:"side" }] },
    plan:[ { name:"好運來麻將館", w:100, h:30, rooms:{ mjhall:[0,0,100,30] } } ] });

  /* ---------- 宏遠建設・都更部：玻璃罩著的三十層模型 ---------- */
  const hyroom = { name:"宏遠建設・都更部", w:288, h:152, wall:60,
    floor(p, g, t, o){
      p.R(0, 0, 288, 60, "#ece8e0"); p.R(0, 0, 288, 3, "#f8f6f0"); p.R(0, 55, 288, 5, "#3a3a3e"); p.R(0, 60, 288, 1, O);
      // 落地窗（外面是港灣、高樓）
      window2(p, 8, 6, 90, 44, o, t, (x, y, w, h) => cityView(p, o), "#3a3a3e");
      // 公司 logo「宏遠建設」
      p.R(110, 12, 76, 24, O); p.R(111, 13, 74, 22, "#2a3a5a"); for (let k = 0; k < 4; k++) p.R(118 + k * 16, 18, 12, 12, "#e9e4da"); p.R(111, 31, 74, 2, "#c8a050");
      // 「海悅新苑」效果圖海報
      p.R(200, 8, 40, 44, O); p.R(201, 9, 38, 42, "#a8c0d8"); p.R(214, 14, 12, 34, "#e8ecf0"); for (let k = 0; k < 8; k++) p.R(216, 16 + k * 4, 8, 2, "#7a9ab8"); p.R(201, 44, 38, 7, "#2a3a5a");
      marble(p, 0, 60, 288, 92, "#d8d4cc", 24);
      T.sides(p, this, "#3a3a3e", [["B", 130, 36]]);
    },
    props:[
      // 都更模型（玻璃罩）
      { y:118, draw(p){ T.box(p, 40, 92, 56, 18, 10, "#5a5e64", "#3a3e44"); p.R(44, 70, 48, 32, "rgba(200,220,240,.25)"); p.R(44, 70, 48, 1, "#e8f4fa"); p.R(44, 70, 1, 32, "#e8f4fa"); p.R(91, 70, 1, 32, "#e8f4fa");
          p.R(60, 66, 14, 36, O); p.R(61, 67, 12, 34, "#e8ecf0"); for (let k = 0; k < 8; k++) p.R(63, 69 + k * 4, 8, 2, "#7a9ab8"); p.R(50, 96, 8, 4, "#3a8a4a"); p.R(78, 94, 8, 6, "#3a8a4a"); } },
      // 檔案櫃（最下層一本帳冊）
      { y:100, draw(p){ T.box(p, 240, 54, 40, 10, 34, "#8a8e94", "#6a6e74"); for (let r = 0; r < 3; r++) p.R(256, 68 + r * 10, 8, 2, O); p.R(246, 92, 14, 4, "#7a3a2a"); } },
      // 簡經理的桌子（名單、帳單、電話）
      { y:110, draw(p){ T.box(p, 134, 84, 80, 14, 10, "#3a2a1e", "#2a1e14"); p.R(140, 86, 22, 10, O); p.R(141, 87, 20, 8, "#f8f4ec"); for (let k = 0; k < 4; k++){ p.R(143, 88 + k * 2, 10, 1, "#7a7a72"); p.R(155, 88 + k * 2, 2, 1, k === 3 ? "#c8302a" : "#3a8a4a"); }
          p.R(170, 86, 14, 8, O); p.R(171, 87, 12, 6, "#f4f0e6"); p.R(172, 88, 8, 1, "#c8a050"); p.R(196, 86, 10, 6, O); p.R(197, 87, 8, 4, "#2a2a2e"); } },
      { y:82, draw(p){ T.chair(p, 174, 82, "#1a1a1e", "down"); } },
      { y:146, draw(p){ T.plant(p, 18, 146, true); T.plant(p, 268, 146, true); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 60); fluo(p, 200, 2, 60); tone(g, this, o, .25); },
    solid:[[38,64,60,48],[238,52,44,48],[132,82,84,24],[10,132,18,16],[258,132,18,16]],
    exits:[]
  };
  setLoc("hongyuan", { start:"hyroom", spawn:[148,144], rooms:{ hyroom },
    spots:{
      doc_dinner:[170,86,14,8,176,114,"hyroom",A("read",{ actT:1.6 })],
      o7_ledger:[240,86,24,12,230,110,"hyroom",A("crouch",{ face:1 })],
      o7_model:[40,66,56,46,108,104,"hyroom",A("look",{ face:-1 })]
    },
    details:{ d7_list:[140,86,22,10,150,114,"hyroom",A("read")] },
    place:{ jian:[null, { room:"hyroom", x:200, y:76, act:"phone", facing:-1 }, { room:"hyroom", x:110, y:120, act:"cross", facing:-1 }] },
    plan:[ { name:"宏遠建設", w:100, h:30, rooms:{ hyroom:[0,0,100,30] } } ] });

  /* ---------- 劉文彬的住處：很小、很乾淨 ---------- */
  const lhroom = { name:"劉文彬的住處", w:240, h:144, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 240, 58, "#d8d4c8", "plain", { base:"#6a5a4a" });
      // 月曆（五月：18 號圈起來）
      p.R(12, 10, 22, 28, O); p.R(13, 11, 20, 26, "#f4f4ee"); p.R(13, 11, 20, 5, "#c23a2a"); for (let k = 0; k < 20; k++) p.R(15 + (k % 5) * 4, 18 + Math.floor(k / 5) * 4, 2, 2, "#8a8a8a"); p.R(18, 25, 5, 5, "#c23a2a"); p.R(19, 26, 3, 3, "#f4f4ee");
      // 窗
      window2(p, 46, 10, 40, 28, o, t, (x, y, w, h) => cityView(p, o), "#8a8478");
      // 牆上的舊照片（穿技師制服的中年人＋小男孩）
      p.R(100, 12, 24, 22, O); p.R(101, 13, 22, 20, "#6b4a2b"); p.R(103, 15, 18, 16, "#c8b890"); p.R(106, 19, 5, 10, "#3a5a8a"); p.R(107, 17, 3, 3, "#e8c09a"); p.R(114, 23, 4, 6, "#e86a2a"); p.R(114, 21, 4, 2, "#e8c09a");
      // 小廚房（流理台）
      p.R(186, 20, 48, 38, "#c8ccc8");
      laminate(p, 0, 58, 240, 86, "#b0a080");
      T.sides(p, this, "#6a5a4a", [["B", 104, 32]]);
    },
    props:[
      // 流理台＋垃圾袋
      { y:72, draw(p){ T.box(p, 186, 48, 48, 12, 12, "#d8dcd8", "#a8aca8"); p.R(196, 50, 12, 6, O); p.R(197, 51, 10, 4, "#8a9aa0"); } },
      { y:96, draw(p){ p.R(210, 80, 18, 16, O); p.R(211, 81, 16, 14, "#3a3a3a"); p.R(215, 78, 8, 4, "#2a2a2a"); p.R(213, 84, 4, 2, "#5a5a5a"); } },
      // 衣櫃（裡面兩套制服）
      { y:72, draw(p){ T.box(p, 140, 22, 36, 10, 40, "#7a6a5a", "#5a4a3a"); p.R(157, 34, 1, 26, "#4a3a2a"); p.R(146, 40, 8, 10, "#3a5a7a"); p.R(160, 40, 8, 10, "#3a5a7a"); p.R(161, 44, 5, 4, "#1a1a1a"); } },
      // 單人床（被子摺得方方正正）
      { y:128, draw(p){ p.R(8, 76, 44, 52, O); p.R(9, 77, 42, 10, "#f4f4f0"); p.R(9, 87, 42, 40, "#5a6a7a"); p.R(14, 90, 32, 8, "#6a7a8a"); p.R(14, 90, 32, 1, "#8a9aaa"); } },
      // 小桌子（一杯水、藥袋）
      { y:106, draw(p){ T.box(p, 80, 86, 40, 12, 8, "#8a6a4a", "#6a4a2a", { legs:4 }); p.R(88, 84, 4, 6, O); p.R(89, 85, 2, 4, "#c8e0f0"); p.R(100, 86, 8, 6, O); p.R(101, 87, 6, 4, "#f4f4f0"); } },
      // 工具箱（打開的，一支一支排好）
      { y:132, draw(p){ T.box(p, 126, 112, 40, 10, 10, "#c23a2a", "#8a1a1a"); for (let k = 0; k < 7; k++){ p.R(129 + k * 5, 114, 3, 6, O); p.R(130 + k * 5, 115, 1, 4, k === 4 ? "#e8ecf0" : "#8a8e94"); } } }
    ],
    front(p, g, t, o){ T.glow(g, 120, 50, 50, "255,240,210", .1); tone(g, this, o, .35); },
    solid:[[6,74,48,56],[184,46,52,28],[208,78,22,20],[138,20,40,44],[78,84,44,24],[124,110,44,24]],
    exits:[]
  };
  setLoc("liuhome", { start:"lhroom", spawn:[120,140], rooms:{ lhroom },
    spots:{
      ev_wrench:[126,110,40,14,146,140,"lhroom",A("crouch",{ actT:1.6 })],
      ev_page:[100,12,24,22,112,68,"lhroom",A("look",{ actT:1.6 })],
      o7_wallet:[208,78,22,20,200,104,"lhroom",A("crouch",{ face:1 })],
      o7_calendar:[12,10,22,28,64,68,"lhroom",A("read",{ face:-1 })]
    },
    details:{ d7_uniform:[140,22,36,40,184,82,"lhroom",A("look",{ face:-1 })] },
    plan:[ { name:"劉文彬的住處", w:100, h:30, rooms:{ lhroom:[0,0,100,30] } } ] });
})();
