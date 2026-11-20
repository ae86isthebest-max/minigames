/* =========================================================
   第 9 集・俯視版（topdown.js）
   雲靄山莊（山上的老溫泉旅館：大廳、湯屋走廊、湯屋「松」「竹」、屋後、倉庫、客房、卡拉 OK）、
   霧溪衛生所、溫泉街的曾記五金、霧溪派出所。整個山上都是霧。
   ========================================================= */
const C9T = typeof TOPEP === "function" ? TOPEP("fog") : null;
// 天色：第一晚 22:40 是晚上（case9_art 的 SKY9 沒有標夜晚，俯視版自己標）
if (C9T){ const SKY9T = [ ["#1a2028","#3a4450","#2a3430","#30383a",0,1], ["#a8b0b4","#d8dcde","#6a7a70","#7a8a80",0,0], ["#b8c8d0","#e8ecee","#5a7a60","#6a8a70",0,0] ];
  C9T.EP.worldSky = ph => SKY9T[Math.min(ph || 0, SKY9T.length - 1)]; }
// 霧：一層一層慢慢飄的白（第三天散了一點）
const FOG9 = (g, R, o, t, k) => { if (!C9T) return; const p = C9T.ph(o), a = (k ?? 1) * (p === 2 ? .45 : 1); g.save();
  for (let i = 0; i < 6; i++){ g.globalAlpha = (.08 + .04 * Math.sin(t * .3 + i)) * a; g.fillStyle = C9T.night(o) ? "#c8d0d8" : "#f4f6f8"; g.fillRect(((i * 97 + t * 4) % (R.w + 120)) - 120, 10 + i * (R.h / 6), 160, 22); }
  g.globalAlpha = .1 * a; g.fillStyle = "#e8ecf0"; g.fillRect(0, 0, R.w, R.h); g.restore(); };
const FOGWIN9 = (p, o) => (x, y, w, h) => { p.R(x, y, w, h, C9T.night(o) ? "#5a6470" : "#e8ecee"); p.R(x, y + h * .5, w, h * .5, C9T.night(o) ? "#6a7480" : "#f4f6f8"); };

/* ================= 雲靄山莊 ================= */
C9T && (() => {
  const { EP, T, O, sh, dA, ph, night, A, tone, window2, fluo, vinyl, laminate, concrete, mud, tileWall, setLoc } = C9T;
  const W0 = EP.world.inn || {};
  const noren = (p, x, y, w, col, ch) => { p.R(x - 2, y - 2, w + 4, 3, "#5a3a1e"); for (let k = 0; k < 3; k++){ p.R(x + k * (w / 3), y, w / 3 - 1, 14, col); } p.R(x + w / 2 - 3, y + 4, 6, 6, ch); };
  const hinoki = "#d8b880";

  /* ---------- 大廳・櫃台：木頭、窗外一片白 ---------- */
  const ilobby = { name:"大廳・櫃台", w:320, h:160, wall:62,
    floor(p, g, t, o){
      T.backWall(p, 0, 320, 62, "#c8b08a", "wood", { base:"#4a3020" });
      // 大窗：外面一片白
      window2(p, 14, 8, 84, 40, o, t, FOGWIN9(p, o), "#5a3a1e"); for (const x of [42, 70]) p.R(x, 8, 2, 40, "#5a3a1e");
      // 「雲靄山莊」木匾
      p.R(112, 6, 70, 14, O); p.R(113, 7, 68, 12, "#5a3418"); for (let k = 0; k < 4; k++) p.R(118 + k * 16, 9, 10, 8, "#e9d8a8");
      // 往二樓客房的樓梯（左後）
      for (let k = 0; k < 6; k++){ p.R(196 + k * 4, 8 + k * 8, 30 - k * 4, 8, O); p.R(197 + k * 4, 9 + k * 8, 28 - k * 4, 6, sh("#8a6a44", -k * .05)); }
      p.R(194, 4, 2, 58, "#3a2414");
      // 往卡拉 OK・餐廳的門（紫色的光從門縫透出來）
      T.backDoor(p, 260, 18, 28, 44, dA("ilobby", "ikara"), "#6a4a2a", { frame:"#3a2414", inside:"#3a1a4a" }); p.R(264, 8, 20, 7, O); p.R(265, 9, 18, 5, "#c86ae8");
      T.wood(p, 0, 62, 320, 98, "#8a6a44");
      T.rug(p, 20, 92, 96, 50, "#5a2a1a", "#c8a050", "#3a1a0e");
      T.sides(p, this, "#4a3020", [["R", 90, 40]]); T.sideDoor(p, this, "R", 90, 40, dA("ilobby", "icorr"), "#6a4a2a");
    },
    props:[
      // 櫃台：招財貓、電話、監視器、幾本登記簿（底下壓著一疊信）
      { y:100, draw(p, g, t){ T.box(p, 126, 74, 92, 14, 12, "#6a4428", "#4a2a14");
          p.R(132, 66, 10, 10, O); p.R(133, 67, 8, 8, "#f4f4f0"); p.R(134, 69, 2, 1, O); p.R(138, 69, 2, 1, O); p.R(140, 63 + (Math.floor(t) % 6 < 3 ? 0 : 1), 3, 5, "#f4f4f0"); p.R(135, 72, 4, 2, "#e84a3a");   // 招財貓（手卡在一半）
          p.R(150, 76, 14, 9, O); p.R(151, 77, 12, 7, "#2a4a3a"); p.R(156, 77, 1, 7, "#e8e0c8"); p.R(166, 76, 12, 9, O); p.R(167, 77, 10, 7, "#7a2a1a"); p.R(180, 77, 12, 8, O); p.R(181, 78, 10, 6, "#e8e4d0");   // 住宿登記、泡湯紀錄、員工日誌
          p.R(196, 64, 18, 12, O); p.R(197, 65, 16, 9, "#1e2226"); p.R(198, 66, 14, 7, "#5a6470"); p.R(200, 68, 4, 4, "#8a9298");   // 走廊監視器
          p.R(150, 86, 20, 2, "#e8e4d0"); } },
      { y:72, draw(p){ T.chair(p, 172, 72, "#4a2a14", "right"); } },
      // 等候區：長沙發（椅背在左）、兩張單人椅、矮桌（住客留言本）
      { y:132, draw(p){ const L = "#8a6a4a"; p.R(20, 90, 10, 44, O); p.R(21, 91, 8, 42, sh(L, -.2)); p.R(28, 98, 22, 30, O); p.R(29, 99, 20, 28, L); p.R(29, 112, 20, 1, sh(L, -.25)); p.R(20, 88, 32, 12, O); p.R(21, 89, 30, 10, sh(L, .1)); p.R(20, 126, 32, 10, O); p.R(21, 127, 30, 8, sh(L, .1)); } },
      { y:122, draw(p){ T.box(p, 64, 104, 36, 14, 6, "#5a3418", "#3a2010"); p.R(72, 106, 16, 10, O); p.R(73, 107, 14, 8, "#f4ecd8"); p.R(80, 107, 1, 8, "#8a6a4a"); } },
      { y:120, draw(p){ T.chair(p, 112, 120, "#7a4a2a", "left"); } },
      { y:150, draw(p){ T.chair(p, 150, 150, "#7a4a2a", "right"); T.chair(p, 178, 150, "#7a4a2a", "left"); } },
      { y:156, draw(p){ T.plant(p, 300, 156, true); } }
    ],
    front(p, g, t, o){ FOG9(g, this, o, t, .35); T.glow(g, 160, 60, 80, "255,220,160", night(o) ? .14 : .05); tone(g, this, o, .3); },
    solid:[[124,72,96,30],[18,86,36,52],[62,102,40,22],[290,138,20,20],[192,4,34,58]],
    exits:[ { r:[312,90,8,40], to:"icorr", at:[24,100], label:"湯屋走廊", kind:"door", art:[312,88,8,44] },
            { r:[260,64,28,8], to:"ikara", at:[144,140], label:"卡拉 OK・餐廳", kind:"door", art:[260,18,28,44] },
            { r:[228,64,26,8], to:"iroom", at:[40,128], label:"二樓・羅家的客房", kind:"up", art:[194,4,40,58] } ]
  };

  /* ---------- 湯屋走廊：「竹」「松」兩扇木門、盡頭是後門 ---------- */
  const icorr = { name:"湯屋走廊", w:320, h:120, wall:62,
    floor(p, g, t, o){
      T.backWall(p, 0, 320, 62, "#d8c8a8", "panel", { base:"#4a3020", panel:"#8a6a44" });
      // 竹、松兩扇木門＋門簾
      T.backDoor(p, 80, 18, 30, 44, dA("icorr", "izhu"), "#a8845a", { frame:"#5a3a1e" }); noren(p, 80, 18, 30, "#3a6a4a", "#f4f4f0");
      T.backDoor(p, 200, 18, 30, 44, dA("icorr", "isong"), "#a8845a", { frame:"#5a3a1e" }); noren(p, 200, 18, 30, "#2a3a6a", "#f4f4f0");
      // 走廊的窗（霧貼在玻璃上，窗台積水）
      window2(p, 134, 10, 44, 30, o, t, FOGWIN9(p, o), "#5a3a1e"); p.R(134, 40, 44, 3, "#a8b8c8");
      // 拖鞋架（少了一雙）
      p.R(12, 26, 40, 30, O); p.R(13, 27, 38, 28, "#6a4428"); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++){ if (r === 1 && c === 2) continue; p.R(15 + c * 9, 29 + r * 9, 7, 6, "#3a6ad8"); p.R(15 + c * 9, 29 + r * 9, 7, 2, "#f4f4f0"); }
      T.wood(p, 0, 62, 320, 58, "#9a7a50");
      // 泥巴腳印：從後門一路走到「松」的門口，越來越淡
      for (let k = 0; k < 9; k++){ const x = 300 - k * 10, y = 78 + (k % 2) * 6; p.R(x, y, 5, 3, `rgba(90,60,30,${.7 - k * .07})`); }
      T.sides(p, this, "#4a3020", [["L", 74, 40], ["R", 70, 40], ["B", 140, 32]]); T.sideDoor(p, this, "L", 74, 40, dA("icorr", "ilobby"), "#6a4a2a"); T.sideDoor(p, this, "R", 70, 40, dA("icorr", "iback"), "#5a4a3a");
    },
    props:[],
    front(p, g, t, o){ for (const x of [60, 160, 260]) T.glow(g, x, 62, 26, "255,220,160", .12); FOG9(g, this, o, t, .2); tone(g, this, o, .35); },
    solid:[[10,24,44,34]],
    exits:[ { r:[0,74,8,40], to:"ilobby", at:[294,110], label:"大廳", kind:"door", art:[0,72,8,44] },
            { r:[80,64,30,8], to:"izhu", at:[110,127], label:"湯屋「竹」", kind:"door", art:[80,18,30,44] },
            { r:[200,64,30,8], to:"isong", at:[110,127], label:"湯屋「松」", kind:"door", art:[200,18,30,44] },
            { r:[312,70,8,40], to:"iback", at:[52,76], label:"後門（屋後）", kind:"out", art:[312,68,8,44] },
            { r:[140,112,32,8], to:"istore", at:[112,70], label:"倉庫", kind:"door", art:[138,108,36,12] } ]
  };

  // 湯屋共用：檜木牆、石地、木浴池
  const bathFloor = (p, R) => { tileWall(p, 0, R.w, R.wall, "#c8b890", 8); p.R(0, R.wall, R.w, R.h - R.wall, "#7a7a72"); for (let j = R.wall; j < R.h; j += 10) for (let i = (j / 10 % 2) * 10; i < R.w; i += 20){ p.R(i, j, Math.min(19, R.w - i), 9, "#8a8a82"); p.R(i, j, Math.min(19, R.w - i), 1, "#9a9a92"); } };

  /* ---------- 湯屋「松」：檜木浴池、小小的木窗、排風扇 ---------- */
  const isong = { name:"湯屋「松」", w:224, h:140, wall:60,
    floor(p, g, t, o){
      bathFloor(p, this);
      // 小木窗（開著一條縫，霧一直飄進來；窗框的白漆裂開了）
      p.R(30, 12, 34, 26, O); p.R(31, 13, 32, 24, "#a8845a"); p.R(34, 16, 26, 18, night(o) ? "#5a6470" : "#e8ecee"); p.R(46, 16, 2, 18, "#a8845a"); p.R(34, 16, 26, 1, "#f4f4f0"); p.R(34, 33, 26, 1, "#f4f4f0"); p.R(58, 16, 2, 18, "#2a2a2a");
      // 排風扇（不會轉；開關上一張便條）
      p.R(150, 10, 24, 24, O); p.R(151, 11, 22, 22, "#c8ccd0"); for (let k = 0; k < 4; k++) p.R(152, 13 + k * 5, 20, 2, "#8a8e94"); p.R(180, 20, 8, 10, O); p.R(181, 21, 6, 8, "#f4f4f0"); p.R(178, 14, 12, 6, "#f4e88a");
      // 門後的告示（下面那面牆，門旁邊）
      T.sides(p, this, "#5a3a1e", [["B", 96, 32]]); p.R(132, 134, 18, 6, "#f4f4f0"); p.R(134, 136, 14, 1, "#c8302a");
    },
    props:[
      // 檜木浴池（水已經涼了）
      { y:124, draw(p, g, t, o){ p.R(60, 72, 120, 52, O); p.R(61, 73, 118, 50, hinoki); p.R(66, 78, 108, 40, "#5a8a9a"); p.R(66, 78, 108, 2, "#8ab0c0"); p.R(61, 73, 118, 2, sh(hinoki, .2));
          for (let k = 0; k < 4; k++) p.R(72 + ((k * 31 + t * 6) % 96), 86 + k * 8, 10, 1, "rgba(220,240,250,.35)");
          if (ph(o) === 0){ // 羅文昌坐在池子裡，上半身靠著池邊，頭歪向一邊
            p.R(150, 82, 22, 14, "rgba(220,140,130,.5)"); p.R(156, 72, 14, 12, O); p.R(157, 73, 12, 10, "#e8988a"); p.R(157, 73, 12, 3, "#2a2420"); p.R(159, 78, 2, 1, O); p.R(152, 84, 26, 8, O); p.R(153, 85, 24, 6, "#e8988a"); } } },
      // 小木托盤（清酒、倒下的杯子）
      { y:76, draw(p){ p.R(120, 66, 22, 10, O); p.R(121, 67, 20, 8, "#8a5a2a"); p.R(124, 60, 6, 12, O); p.R(125, 61, 4, 10, "#f4f4f0"); p.R(125, 66, 4, 2, "#3a6ab8"); p.R(134, 70, 6, 3, O); p.R(135, 71, 4, 1, "#f4f4f0"); } },
      // 木桶、小板凳
      { y:128, draw(p){ p.R(190, 112, 14, 14, O); p.R(191, 113, 12, 12, hinoki); p.R(191, 116, 12, 1, "#5a3a1e"); p.R(14, 116, 16, 10, O); p.R(15, 117, 14, 8, hinoki); } }
    ],
    front(p, g, t, o){ g.save(); for (let i = 0; i < 4; i++){ g.globalAlpha = .1; g.fillStyle = "#f4f6f8"; g.fillRect(30 + ((i * 50 + t * 5) % 140), 40 + i * 14, 50, 10); } g.restore(); FOG9(g, this, o, t, .4); tone(g, this, o, .35); },
    solid:[[58,70,124,52],[118,58,26,18],[188,110,18,18],[12,114,20,14]],
    exits:[ { r:[96,132,32,8], to:"icorr", at:[214,76], label:"湯屋走廊", kind:"out", art:[94,128,36,12] } ]
  };

  /* ---------- 湯屋「竹」：石砌的浴池，跟「松」共用一面牆 ---------- */
  const izhu = { name:"湯屋「竹」", w:224, h:140, wall:60,
    floor(p, g, t, o){
      bathFloor(p, this);
      // 竹子的木格窗（封著）
      p.R(30, 12, 34, 26, O); p.R(31, 13, 32, 24, "#5a7a4a"); for (let k = 0; k < 4; k++) p.R(34 + k * 7, 15, 3, 20, "#8aa86a");
      // 跟「松」共用的那面牆（右邊）：牆角磁磚縫一條細細的黑線
      p.R(200, 6, 18, 54, "#b8a880"); for (let y = 14; y < 60; y += 8) p.R(200, y, 18, 1, "#2a2a2a"); p.R(217, 6, 1, 54, "#1a1a1a");
      // 掛鉤（一條忘了拿走的登山毛巾）
      p.R(150, 18, 30, 3, "#5a3a1e"); for (const x of [154, 166]) p.R(x, 20, 2, 4, "#c8c8c0"); p.R(164, 24, 8, 20, O); p.R(165, 25, 6, 18, "#e86a2a"); p.R(166, 34, 4, 2, "#f4f4f0");
      // 地上角落剛刷過的痕跡
      p.R(184, 106, 24, 20, "rgba(220,230,220,.35)");
      T.sides(p, this, "#5a3a1e", [["B", 96, 32]]);
    },
    props:[
      // 石砌浴池
      { y:122, draw(p, g, t){ p.R(56, 72, 116, 50, O); p.R(57, 73, 114, 48, "#8a8a82"); for (let k = 0; k < 8; k++) p.R(57 + k * 14, 73, 1, 48, "#6a6a62"); p.R(64, 80, 100, 34, "#5a8a9a"); p.R(64, 80, 100, 2, "#8ab0c0"); for (let k = 0; k < 3; k++) p.R(70 + ((k * 37 + t * 5) % 86), 90 + k * 8, 10, 1, "rgba(220,240,250,.35)"); } },
      { y:128, draw(p){ p.R(14, 116, 16, 10, O); p.R(15, 117, 14, 8, hinoki); } }
    ],
    front(p, g, t, o){ FOG9(g, this, o, t, .3); tone(g, this, o, .35); },
    solid:[[54,70,120,50],[12,114,20,14]],
    exits:[ { r:[96,132,32,8], to:"icorr", at:[94,76], label:"湯屋走廊", kind:"out", art:[94,128,36,12] } ]
  };

  /* ---------- 屋後・熱水器：外牆、泥巴地、霧裡看不到竹林 ---------- */
  const iback = { name:"屋後・熱水器", w:320, h:156, wall:62,
    floor(p, g, t, o){
      // 外牆（灰泥＋木板）
      p.R(0, 0, 320, 62, "#a8a090"); for (let x = 0; x < 320; x += 12) p.R(x, 30, 1, 32, "#8a8270"); p.R(0, 30, 320, 2, "#6a6050"); p.R(0, 57, 320, 5, "#4a4030"); p.R(0, 62, 320, 1, O);
      // 後門（左）
      T.backDoor(p, 30, 18, 26, 44, dA("iback", "icorr"), "#5a4a3a", { frame:"#3a2a1e" });
      // 湯屋「松」的小窗（從外面看）
      p.R(110, 18, 26, 18, O); p.R(111, 19, 24, 16, "#a8845a"); p.R(113, 21, 20, 12, night(o) ? "#3a4450" : "#b8c0c4"); p.R(122, 21, 2, 12, "#a8845a");
      // 熱水器（室外型）＋側面的貼紙
      p.R(196, 10, 30, 40, O); p.R(197, 11, 28, 38, "#e8ecf0"); p.R(201, 16, 20, 8, "#2a2a2e"); p.R(203, 18, 8, 3, ph(o) === 0 ? "#e84a3a" : "#6fd46f"); p.R(206, 50, 2, 10, "#8a8e94"); p.R(214, 50, 2, 10, "#c84a3a");
      p.R(226, 22, 8, 12, "#f4f4ee"); p.R(227, 24, 6, 1, "#c8302a"); p.R(208, 4, 8, 6, O); p.R(209, 5, 6, 4, "#5a5e64");
      // 牆上新鑽的螺絲孔＋膠帶殘膠圍出的長方形（比人還高）
      for (let k = 0; k < 6; k++){ p.R(182, 6 + k * 10, 2, 2, "#2a2a2a"); p.R(242, 6 + k * 10, 2, 2, "#2a2a2a"); } p.R(184, 4, 58, 1, "rgba(240,236,200,.6)"); for (const x of [184, 240]) p.R(x, 4, 1, 56, "rgba(240,236,200,.6)");
      // 泥巴地
      mud(p, 0, 62, 320, 94, o, t);
      // 「松」的窗下：一片白色漆屑、一支一字螺絲起子
      for (let k = 0; k < 10; k++) p.R(108 + (k * 7) % 30, 66 + (k * 5) % 10, 2, 1, "#f4f4f0"); p.R(126, 72, 12, 2, O); p.R(127, 72, 6, 2, "#c8302a"); p.R(133, 72, 5, 1, "#c8ccd0"); p.R(137, 72, 1, 1, "#f4f4f0");
      // 竹林（下面，霧裡）
      for (let k = 0; k < 26; k++){ const x = 4 + k * 12 + (k % 3) * 2; p.R(x, 124, 3, 32, "#5a7a4a"); p.R(x, 130 + (k % 4) * 6, 3, 1, "#3a5a2a"); p.R(x - 4, 124 + (k % 3) * 4, 8, 3, "#6a8a5a"); }
      T.sides(p, this, "#4a4030", []);
    },
    props:[
      // 後門口一雙沾滿泥巴的藍白拖
      { y:72, draw(p){ for (const x of [60, 68]){ p.R(x, 66, 6, 8, O); p.R(x + 1, 67, 4, 6, "#3a6ad8"); p.R(x + 1, 67, 4, 2, "#f4f4f0"); p.R(x + 1, 71, 4, 2, "#6a4a2a"); } } },
      // 一捆舊木柴、塑膠水桶
      { y:96, draw(p){ for (let k = 0; k < 4; k++){ p.R(260, 76 + k * 5, 40, 5, O); p.R(261, 77 + k * 5, 38, 3, "#8a6a44"); } p.R(150, 84, 14, 12, O); p.R(151, 85, 12, 10, "#3a8ad8"); p.R(152, 86, 10, 2, "#6aaae8"); } }
    ],
    front(p, g, t, o){ FOG9(g, this, o, t, 1.4); g.save(); g.globalAlpha = .25; g.fillStyle = night(o) ? "#a8b0b8" : "#f4f6f8"; g.fillRect(0, 118, this.w, 40); g.restore(); tone(g, this, o, .35); },
    solid:[[0,120,320,36],[258,74,44,24],[148,82,18,16]],
    exits:[ { r:[30,64,26,8], to:"icorr", at:[296,94], label:"後門（湯屋走廊）", kind:"door", art:[30,18,26,44] } ]
  };

  /* ---------- 倉庫：浴巾、清酒、備用拖鞋 ---------- */
  const istore = { name:"倉庫", w:224, h:136, wall:56,
    floor(p, g, t, o){
      T.backWall(p, 0, 224, 56, "#a89c84", "wood", { base:"#4a3a2a" });
      T.backDoor(p, 100, 14, 26, 42, dA("istore", "icorr"), "#6a4a2a", { frame:"#3a2414" });
      concrete(p, 0, 56, 224, 80, "#7a7468", 27);
      T.sides(p, this, "#4a3a2a", []);
    },
    props:[
      // 左邊的鐵架：浴巾、清酒、拖鞋；最上面一層一塊舊招牌「雲靄旅社」
      { y:64, draw(p){ p.R(8, 4, 80, 58, O); p.R(9, 5, 78, 56, "#6a6e74"); for (let r = 0; r < 3; r++) p.R(9, 20 + r * 14, 78, 2, "#8a8e94");
          p.R(12, 7, 44, 11, "#7a4a2a"); for (let k = 0; k < 4; k++) p.R(16 + k * 10, 9, 7, 7, "#e9d8a8");
          for (let k = 0; k < 6; k++){ p.R(12 + k * 12, 24, 10, 8, "#f4f4f0"); p.R(12 + k * 12, 38, 4, 10, "#5a8a5a"); p.R(18 + k * 12, 38, 4, 10, "#5a8a5a"); p.R(12 + k * 12, 52, 10, 6, "#3a6ad8"); } p.R(58, 52, 22, 2, "#e8e4d0"); } },
      // 右邊的鐵架：紙箱（一箱沒拆的一氧化碳警報器）、說明書
      { y:64, draw(p){ p.R(136, 4, 80, 58, O); p.R(137, 5, 78, 56, "#6a6e74"); for (let r = 0; r < 3; r++) p.R(137, 20 + r * 14, 78, 2, "#8a8e94");
          for (let k = 0; k < 4; k++) p.R(140 + k * 18, 8, 16, 11, "#c8a878"); p.R(140, 23, 22, 11, "#e8e4d8"); p.R(142, 25, 18, 3, "#c8302a"); p.R(168, 26, 10, 8, "#f4f4f0"); p.R(169, 27, 8, 1, "#2a5a8a"); } },
      // 最裡面一堆紙箱（後面塞著東西）
      { y:122, draw(p){ T.box(p, 160, 94, 50, 14, 14, "#c8a878", "#a8865a"); T.box(p, 168, 82, 30, 12, 12, "#c8a878", "#a8865a"); p.R(204, 92, 10, 26, "rgba(200,220,230,.5)"); p.R(206, 90, 2, 30, "#8a6a44"); } }
    ],
    front(p, g, t, o){ fluo(p, 90, 2, 40, Math.floor(t * 3) % 7 === 0); T.dim(g, this, .1); tone(g, this, o, .3); },
    solid:[[6,2,84,62],[134,2,84,62],[158,80,58,44]],
    exits:[ { r:[100,58,26,8], to:"icorr", at:[156,104], label:"湯屋走廊", kind:"door", art:[100,14,26,42] } ]
  };

  /* ---------- 羅家的客房：和室、榻榻米 ---------- */
  const iroom = { name:"羅家的客房", w:256, h:148, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 58, "#e8dcc0", "plain", { base:"#5a3a1e" }); for (const x of [64, 128, 192]) p.R(x, 4, 3, 54, "#8a6a44");
      // 拉門窗（外面是霧）
      window2(p, 140, 8, 46, 34, o, t, FOGWIN9(p, o), "#8a6a44"); for (let k = 1; k < 4; k++) p.R(140 + k * 11, 8, 1, 34, "#8a6a44");
      // 掛軸
      p.R(86, 8, 18, 40, O); p.R(87, 9, 16, 38, "#f4ecd8"); p.R(92, 14, 6, 20, "#3a3a3a"); p.R(86, 46, 18, 2, "#5a3a1e");
      // 榻榻米
      for (let j = 58; j < 148; j += 30) for (let i = 0; i < 256; i += 60){ p.R(i, j, 59, 29, "#c8c088"); p.R(i, j, 59, 1, "#8a8a58"); p.R(i, j, 1, 29, "#8a8a58"); p.R(i + 2, j + 3, 55, 23, "#d0c890"); }
      T.sides(p, this, "#5a3a1e", [["B", 24, 32]]);
      for (let k = 0; k < 3; k++){ p.R(24, 132 + k * 5, 32, 4, O); p.R(25, 133 + k * 5, 30, 3, sh("#8a6a44", -k * .08)); }
    },
    props:[
      // 兩組被褥（一支手機放在上面）
      { y:128, draw(p){ for (const x of [90, 150]){ p.R(x, 74, 46, 54, O); p.R(x + 1, 75, 44, 10, "#f4f4f0"); p.R(x + 1, 85, 44, 42, x === 90 ? "#c8a0a8" : "#8aa0c0"); p.R(x + 4, 88, 38, 2, "#f4f4f0"); } p.R(166, 100, 6, 9, O); p.R(167, 101, 4, 7, "#e8c070"); } },
      // 床頭小櫃（安眠藥）、矮桌（公事包、手提包、降血壓藥）
      { y:82, draw(p){ T.box(p, 196, 66, 22, 10, 6, "#6a4428", "#4a2a14"); p.R(200, 66, 10, 6, O); p.R(201, 67, 8, 4, "#f4f4f0"); p.R(203, 68, 4, 1, "#c8302a"); } },
      { y:122, draw(p){ T.box(p, 200, 100, 46, 14, 6, "#6a4428", "#4a2a14"); p.R(204, 96, 18, 12, O); p.R(205, 97, 16, 10, "#3a2a1e"); p.R(212, 96, 4, 2, "#c8a050"); p.R(226, 98, 14, 10, O); p.R(227, 99, 12, 8, "#c84a5a"); p.R(232, 104, 6, 6, O); p.R(233, 105, 4, 4, "#f4f4f0"); } },
      // 洗手台（一枚婚戒）
      { y:76, draw(p){ T.box(p, 12, 50, 36, 10, 14, "#e8ecf0", "#c8ccd0"); p.R(20, 52, 18, 6, "#a8b8c0"); p.R(42, 54, 3, 3, "#e9c43a"); p.R(18, 30, 24, 18, O); p.R(19, 31, 22, 16, "#c8d8e0"); } }
    ],
    front(p, g, t, o){ T.glow(g, 128, 60, 70, "255,236,200", night(o) ? .14 : .04); FOG9(g, this, o, t, .2); tone(g, this, o, .35); },
    solid:[[88,72,50,58],[148,72,50,58],[194,64,26,14],[198,94,50,22],[10,48,40,30]],
    exits:[ { r:[24,140,32,8], to:"ilobby", at:[240,76], label:"大廳（下樓）", kind:"down", art:[22,126,36,22] } ]
  };

  /* ---------- 卡拉 OK・餐廳：紫色的燈 ---------- */
  const ikara = { name:"卡拉 OK・餐廳", w:288, h:152, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 288, 60, "#3a2a4a", "stripe", { base:"#1a1424" });
      // 大螢幕＋點歌機
      p.R(100, 6, 88, 46, O); p.R(101, 7, 86, 44, "#1a1c24"); p.R(104, 10, 80, 32, "#2a3a6a"); p.R(110, 30, 68, 4, "#e9c43a"); p.R(110 + (Math.floor(t * 10) % 60), 30, 8, 4, "#e84a3a"); p.R(104, 44, 80, 4, "#c86ae8");
      // 菜單牌
      p.R(16, 10, 50, 36, O); p.R(17, 11, 48, 34, "#2a1a14"); for (let k = 0; k < 6; k++){ p.R(20, 15 + k * 5, 26, 2, "#f4e8c0"); p.R(52, 15 + k * 5, 10, 2, "#e9c43a"); }
      // 獎狀牆
      for (let k = 0; k < 3; k++){ p.R(210 + k * 24, 12, 20, 16, O); p.R(211 + k * 24, 13, 18, 14, "#f4ecd8"); p.R(213 + k * 24, 15, 14, 2, "#c8302a"); }
      vinyl(p, 0, 60, 288, 92, "#4a3a3a", "#423434", 16);
      T.sides(p, this, "#1a1424", [["B", 128, 32]]);
    },
    props:[
      // 點歌機
      { y:72, draw(p, g, t){ T.box(p, 196, 50, 24, 10, 12, "#2a2a30", "#1a1a1e"); p.R(200, 52, 16, 6, "#3a8ad8"); p.R(202, 54, 6 + Math.floor(t * 4) % 8, 2, "#f4f4f0"); } },
      // 三張桌子（兩支麥克風；侯老闆那桌的牛皮紙袋）
      { y:104, draw(p){ for (const x of [30, 120]){ T.box(p, x, 84, 50, 14, 8, "#5a3418", "#3a2010"); } p.R(130, 86, 4, 10, O); p.R(131, 87, 2, 8, "#2a2a2a"); p.R(140, 86, 4, 10, O); p.R(141, 87, 2, 8, "#2a2a2a"); p.R(131, 86, 2, 2, "#f4f4f0"); p.R(141, 86, 2, 2, "#f4f4f0");
          p.R(40, 86, 18, 10, O); p.R(41, 87, 16, 8, "#c8a060"); p.R(48, 87, 2, 3, "#8a6a3a"); p.R(62, 86, 6, 6, O); p.R(63, 87, 4, 4, "#c8c8c0"); } },
      { y:138, draw(p){ T.box(p, 196, 118, 50, 14, 8, "#5a3418", "#3a2010"); p.R(206, 120, 8, 8, O); p.R(207, 121, 6, 6, "#e8c070"); } },
      // 椅子
      { y:100, draw(p){ T.chair(p, 22, 100, "#6a2a4a", "right"); T.chair(p, 112, 100, "#6a2a4a", "right"); } },
      { y:134, draw(p){ T.chair(p, 188, 134, "#6a2a4a", "right"); T.chair(p, 254, 134, "#6a2a4a", "left"); } },
      { y:120, draw(p){ for (const x of [44, 140]) T.chair(p, x, 120, "#6a2a4a", "up"); } }
    ],
    front(p, g, t, o){ g.save(); g.globalAlpha = .12; g.fillStyle = "#a84ae8"; g.fillRect(0, 0, this.w, this.h); g.restore(); T.glow(g, 144, 30, 70, "200,120,240", .14); tone(g, this, o, .3); },
    solid:[[28,82,54,24],[118,82,54,24],[194,116,54,24],[194,48,28,24]],
    exits:[ { r:[128,144,32,8], to:"ilobby", at:[274,76], label:"大廳", kind:"out", art:[126,140,36,12] } ]
  };

  const spots = {
    // 大廳
    cctv_corridor:[196,64,18,12,206,108,"ilobby",A("type",{ actT:2 })],
    doc_bath:[166,76,12,9,170,108,"ilobby",A("read",{ actT:1.6 })],
    o_guestbook:[72,106,16,10,80,132,"ilobby",A("read")],
    doc_roomphone:[150,86,20,4,150,108,"ilobby",A("read",{ actT:1.6 })],
    doc_stafflog:[180,77,12,8,190,108,"ilobby",A("read",{ actT:1.6 })],
    o_kephoto:[28,96,22,14,64,134,"ilobby",A("look",{ face:-1 })],
    // 走廊
    o_backmud:[210,74,100,14,250,96,"icorr",A("crouch",{ actT:1.6 })],
    o_corrwin:[134,10,44,34,156,76,"icorr",A("look")],
    // 松
    ev_body:[146,70,32,28,190,100,"isong",A("crouch",{ actT:1.6, face:-1 })],
    ev_window:[30,12,34,26,46,72,"isong",A("look",{ actT:1.6 })],
    ev_fan:[150,10,40,24,166,64,"isong",A("look")],
    o_sake:[120,60,22,16,108,66,"isong",A("look",{ face:1 })],
    // 竹
    o_zhu:[184,106,24,20,182,100,"izhu",A("crouch",{ face:1 })],
    o_wall2:[200,6,18,54,194,72,"izhu",A("look",{ face:1 })],
    // 屋後
    doc_heater:[196,10,30,40,210,76,"iback",A("read",{ actT:1.6 })],
    ev_wall:[180,2,66,58,244,80,"iback",A("look",{ actT:1.6, face:-1 })],
    ev_zmshoes:[58,64,18,12,74,86,"iback",A("crouch",{ face:-1 })],
    o_fogback:[0,120,320,36,200,110,"iback",A("look")],
    o_chips:[104,64,40,14,120,88,"iback",A("crouch",{ actT:1.6 })],
    o_label:[224,20,12,16,236,76,"iback",A("read",{ face:-1 })],
    // 倉庫
    ev_sheet:[200,88,16,34,140,104,"istore",A("crouch",{ actT:1.6, face:1 })],
    o_cobox:[140,22,22,12,148,70,"istore",A("look")],
    o_manual:[168,24,10,10,174,70,"istore",A("read")],
    // 客房
    o_pills:[198,64,14,10,206,86,"iroom",A("look",{ face:-1 })],
    o_contract9:[204,96,18,12,214,124,"iroom",A("read",{ actT:1.6 })],
    o_divorce:[226,98,14,10,236,124,"iroom",A("read",{ actT:1.6 })],
    o_bpmeds:[232,104,6,6,244,126,"iroom",A("look",{ face:-1 })],
    // 卡拉 OK
    o_kara:[196,48,26,22,208,84,"ikara",A("read",{ actT:1.6 })],
    o_bidfile:[40,86,18,10,48,112,"ikara",A("read",{ actT:1.6 })]
  };
  const details = {
    d9_cat:[132,62,12,14,138,108,"ilobby",A("look")],
    d9_loan:[126,86,92,4,214,108,"ilobby",A("crouch")],
    d9_slip:[10,24,44,34,40,76,"icorr",A("look")],
    d9_sign:[130,130,22,10,140,127,"isong",A("read")],
    d9_towel:[150,16,32,30,166,64,"izhu",A("look")],
    d9_bamboo:[0,120,100,36,60,110,"iback",A("look")],
    d9_shelf:[10,6,48,14,48,72,"istore",A("look")],
    d9_photo:[164,98,10,12,176,140,"iroom",A("look")],
    d9_ring:[40,52,8,8,60,82,"iroom",A("look",{ face:-1 })],
    d9_mic:[128,84,18,14,152,112,"ikara",A("look",{ face:-1 })]
  };
  const place = {
    zhiming:[ { room:"ilobby", x:148, y:70, act:"phone", facing:1 }, { room:"icorr", x:180, y:90, act:"idle", facing:-1 }, { room:"ilobby", x:172, y:72, act:"sit", facing:1, view:"side" } ],
    guorong:[ null, { room:"ilobby", x:38, y:112, act:"sit", facing:1, view:"side" }, { room:"iback", x:150, y:110, act:"cross", facing:1 } ],
    du:[ { room:"iroom", x:120, y:140, act:"cry", facing:1 }, { room:"iroom", x:120, y:140, act:"phone", facing:1 }, { room:"ilobby", x:150, y:150, act:"sit", facing:1, view:"side" } ],
    hou:[ { room:"ikara", x:22, y:100, act:"sit", facing:1, view:"side" }, { room:"ikara", x:22, y:100, act:"sit", facing:1, view:"side" }, { room:"ilobby", x:240, y:130, act:"cross", facing:-1 } ],
    yun:[ { room:"ilobby", x:112, y:120, act:"sit", facing:-1, view:"side" }, { room:"ilobby", x:100, y:140, act:"idle", facing:1 }, { room:"ilobby", x:100, y:140, act:"idle", facing:1 } ],
    ke:[ { room:"ilobby", x:38, y:112, act:"sit", facing:1, view:"side" }, { room:"ikara", x:254, y:134, act:"sit", facing:-1, view:"side" } ],
    lan:[ null, { room:"izhu", x:150, y:126, act:"sweep", facing:1 }, { room:"icorr", x:120, y:100, act:"sweep", facing:1 } ],
    xu:[ { room:"isong", x:40, y:96, act:"kneel", facing:1 }, { room:"iback", x:120, y:96, act:"kneel", facing:-1 }, { room:"ilobby", x:178, y:150, act:"sit", facing:-1, view:"side" } ],
    qian:[ { room:"isong", x:196, y:94, act:"kneel", facing:-1 }, { room:"ikara", x:188, y:134, act:"sit", facing:1, view:"side" } ],
    wu:[ { room:"icorr", x:80, y:100, act:"idle", facing:1 } ]
  };
  const intro = [ { set:{ room:"ilobby", px:290, py:110 }, hide:true }, { wait:0.3, hide:true }, { set:{ room:"ilobby", px:276, py:112 } },
    ...(W0.intro || []).filter(k => k.say || (k.wait && !k.hide)).map(k => k.say && k.say[0] === "wu" && /點畫面上的箭嘴|📍|清單不是全部/.test(k.say[1]) ? null : k).filter(Boolean),
    { say:["wu", "想去哪裡，點畫面上的門口、樓梯就會自己走過去。閃著星星的就是還沒看過的東西，按上面的「🧭 平面圖」看全部在哪裡。"], name:"小吳" } ];
  setLoc("inn", { start:"ilobby", spawn:[276,112], rooms:{ ilobby, icorr, isong, izhu, iback, istore, iroom, ikara }, spots, details, place, intro,
    plan:[ { name:"二樓", w:100, h:14, rooms:{ iroom:[20,0,30,14] } },
           { name:"一樓", w:100, h:44, rooms:{ ikara:[0,0,26,16], ilobby:[0,16,34,18], icorr:[34,16,46,8], izhu:[34,0,22,16], isong:[56,0,24,16], istore:[44,24,22,14], iback:[80,0,20,34,"out"] } } ] });
})();

/* ================= 霧溪衛生所、曾記五金、霧溪派出所 ================= */
C9T && (() => {
  const { EP, T, O, sh, dA, ph, night, A, tone, window2, fluo, vinyl, laminate, concrete, tileWall, setLoc } = C9T;

  /* ---------- 霧溪衛生所：白色、只有一個護士值班 ---------- */
  const clroom = { name:"霧溪衛生所", w:256, h:144, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 60, "#e8ecec", "tile", { base:"#5a8a8a" });
      // 衛教海報（熱水器裝室外）
      p.R(20, 8, 34, 44, O); p.R(21, 9, 32, 42, "#f4f4ee"); p.R(23, 11, 28, 6, "#c8302a"); p.R(28, 22, 12, 16, "#e8ecf0"); p.R(30, 26, 8, 6, "#2a2a2e"); p.R(42, 24, 6, 14, "#3a8ad8"); for (let k = 0; k < 3; k++) p.R(24, 42 + k * 3, 26, 1, "#7a7a8a");
      // 值班表
      p.R(70, 10, 30, 30, O); p.R(71, 11, 28, 28, "#f8f8f4"); for (let r = 0; r < 6; r++){ p.R(73, 14 + r * 4, 8, 2, "#7a7a8a"); p.R(84, 14 + r * 4, 12, 2, r === 4 ? "#c8302a" : "#3a6a8a"); }
      window2(p, 170, 8, 64, 34, o, t, FOGWIN9(p, o), "#c8ccd0");
      vinyl(p, 0, 60, 256, 84, "#c8d0c8", "#c0c8c0", 16);
      T.sides(p, this, "#5a8a8a", [["B", 112, 32]]);
    },
    props:[
      // 診療桌（檢驗單）＋兩張椅子
      { y:98, draw(p){ T.box(p, 100, 74, 64, 14, 10, "#e8e8e0", "#b8b8b0"); p.R(110, 76, 18, 10, O); p.R(111, 77, 16, 8, "#f8f8f4"); p.R(113, 79, 12, 1, "#2a5a8a"); p.R(113, 82, 8, 1, "#c8302a"); p.R(140, 66, 16, 10, O); p.R(141, 67, 14, 8, "#1e2226"); p.R(142, 68, 12, 6, "#3a6a8a"); } },
      { y:72, draw(p){ T.chair(p, 132, 72, "#3a6a8a", "down"); } },
      { y:112, draw(p){ T.chair(p, 132, 112, "#3a6a8a", "up"); } },
      // 病床（拉簾）、氧氣瓶
      { y:130, draw(p){ p.R(196, 80, 50, 50, O); p.R(197, 81, 48, 10, "#f4f4f0"); p.R(197, 91, 48, 38, "#c8e0e0"); for (let k = 0; k < 8; k++) p.R(190, 66 + k * 8, 2, 6, "#8ab0b0"); p.R(176, 96, 10, 30, O); p.R(177, 97, 8, 28, "#3a8a5a"); p.R(178, 94, 6, 4, "#c8ccd0"); } },
      // 藥櫃
      { y:82, draw(p){ T.box(p, 10, 54, 40, 10, 18, "#f4f4f0", "#c8ccd0"); for (let k = 0; k < 4; k++) p.R(14 + k * 9, 58, 6, 4, ["#e84a3a", "#3a8ad8", "#e9c43a", "#3aa86a"][k]); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 50); fluo(p, 190, 2, 50); tone(g, this, o, .25); },
    solid:[[98,72,68,28],[194,78,54,54],[174,92,14,36],[8,52,44,32]],
    exits:[]
  };
  setLoc("clinic", { start:"clroom", spawn:[128,136], rooms:{ clroom },
    spots:{ test_yun:[110,76,18,10,118,122,"clroom",A("read",{ actT:1.6 })], o_poster9:[20,8,34,44,60,76,"clroom",A("read",{ face:-1 })] },
    details:{ d9_nurse:[70,10,30,30,86,76,"clroom",A("read")] },
    place:{},
    plan:[ { name:"霧溪衛生所", w:100, h:30, rooms:{ clroom:[0,0,100,30] } } ] });

  /* ---------- 曾記五金：什麼都賣，堆到天花板 ---------- */
  const vshop = { name:"曾記五金", w:256, h:140, wall:56,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 56, "#b8b0a0", "plain", { base:"#4a4030" });
      // 牆上掛滿：水管、繩子、掃把、一捲一捲的塑膠布
      for (let k = 0; k < 14; k++){ const x = 8 + k * 17; p.R(x, 6, 2, 46, "#5a5e64"); p.R(x + 3, 10 + (k % 3) * 6, 10, 18 + (k % 4) * 4, ["#3a8ad8", "#e9c43a", "#c8302a", "#3aa86a", "#e8ecf0", "#8a6a44"][k % 6]); }
      p.R(80, 8, 30, 14, "rgba(220,235,245,.85)"); p.R(80, 8, 30, 1, "#a8b8c0");   // 透明塑膠布
      concrete(p, 0, 56, 256, 84, "#8a8478", 21);
      T.sides(p, this, "#4a4030", [["B", 104, 40]]);
    },
    props:[
      // 櫃台（出貨單本子、收音機、計算機）
      { y:96, draw(p, g, t){ T.box(p, 140, 72, 90, 14, 10, "#7a5a3a", "#5a3a22"); p.R(150, 74, 20, 10, O); p.R(151, 75, 18, 8, "#f4ecd8"); p.R(153, 77, 14, 1, "#2a3a6a"); p.R(153, 80, 10, 1, "#7a7a8a");
          p.R(186, 72, 18, 10, O); p.R(187, 73, 16, 8, "#8a2a1a"); p.R(189, 75, 5, 5, "#2a2a2a"); p.R(197, 75, 4, 2, "#e9c43a"); if (Math.floor(t * 2) % 2) p.R(206, 70, 2, 1, "#f4f4f0"); p.R(212, 74, 10, 8, O); p.R(213, 75, 8, 6, "#c8ccd0"); } },
      // 地上一箱一箱的釘子、螺絲、油漆桶
      { y:110, draw(p){ for (let k = 0; k < 4; k++){ T.box(p, 12 + k * 26, 92, 22, 10, 8, ["#c8a878", "#8a8e94", "#c8a878", "#e8ecf0"][k], ["#a8865a", "#6a6e74", "#a8865a", "#c8ccd0"][k]); } } },
      { y:132, draw(p){ for (let k = 0; k < 3; k++){ p.R(14 + k * 16, 118, 14, 14, O); p.R(15 + k * 16, 119, 12, 12, ["#f4f4f0", "#3a8ad8", "#e9c43a"][k]); p.R(15 + k * 16, 119, 12, 2, "#8a8e94"); } } },
      { y:70, draw(p){ T.chair(p, 190, 70, "#5a3a22", "down"); } }
    ],
    front(p, g, t, o){ fluo(p, 80, 2, 50); tone(g, this, o, .3); },
    solid:[[138,70,94,28],[10,90,104,22],[12,116,50,18]],
    exits:[]
  };
  setLoc("village", { start:"vshop", spawn:[124,132], rooms:{ vshop },
    spots:{ doc_receipt:[150,74,20,10,160,108,"vshop",A("read",{ actT:1.6 })] },
    details:{ d9_radio:[186,70,22,12,196,108,"vshop",A("look")] },
    place:{ zeng:[null, { room:"vshop", x:176, y:68, act:"idle", facing:-1 }] },
    plan:[ { name:"曾記五金", w:100, h:30, rooms:{ vshop:[0,0,100,30] } } ] });

  /* ---------- 霧溪派出所：小小的，只有三個人 ---------- */
  const proom = { name:"霧溪派出所", w:256, h:144, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 60, "#e0e4d8", "plain", { base:"#3a5a7a" }); p.R(0, 38, 256, 2, "#3a5a7a");
      // 牆上的地圖（紅筆圈著一家民宿）
      p.R(16, 8, 66, 44, O); p.R(17, 9, 64, 42, "#e8e4c8"); for (let k = 0; k < 6; k++) p.R(20 + k * 10, 12 + (k % 3) * 10, 8, 2, "#8aa86a"); p.R(20, 30, 58, 2, "#c8a050"); p.R(46, 18, 10, 10, "rgba(200,48,42,.3)"); p.R(46, 18, 10, 1, "#c8302a"); p.R(46, 27, 10, 1, "#c8302a"); p.R(60, 40, 18, 6, "#f4f4f0"); p.R(61, 42, 14, 1, "#c8302a");
      // 「為民服務」、時鐘、無線電
      p.R(100, 10, 60, 12, O); p.R(101, 11, 58, 10, "#3a5a7a"); for (let k = 0; k < 4; k++) p.R(106 + k * 13, 13, 9, 6, "#f4f4f0");
      p.R(174, 10, 12, 12, O); p.R(175, 11, 10, 10, "#f4f4f0"); p.R(180, 12, 1, 5, O);
      window2(p, 196, 8, 48, 34, o, t, FOGWIN9(p, o), "#8a8e94");
      vinyl(p, 0, 60, 256, 84, "#a8aca0", "#a0a498", 16);
      T.sides(p, this, "#3a5a7a", [["B", 112, 32]]);
    },
    props:[
      // 所長的桌子（電話、一份稽查紀錄夾）
      { y:100, draw(p){ T.box(p, 96, 76, 70, 14, 10, "#8a6a4a", "#6a4a2a"); p.R(104, 78, 10, 8, O); p.R(105, 79, 8, 6, "#2a2a2a"); p.R(120, 78, 20, 10, O); p.R(121, 79, 18, 8, "#c8a878"); p.R(124, 81, 12, 1, "#2a3a6a"); p.R(146, 66, 16, 12, O); p.R(147, 67, 14, 9, "#1e2226"); } },
      { y:74, draw(p){ T.chair(p, 128, 74, "#2a3a5a", "down"); } },
      // 鐵櫃、值班台、開水壺
      { y:84, draw(p){ for (let k = 0; k < 2; k++) T.box(p, 200 + k * 18, 52, 16, 10, 22, "#8a9088", "#6a7068"); } },
      { y:130, draw(p){ T.box(p, 14, 108, 56, 12, 10, "#8a6a4a", "#6a4a2a"); p.R(20, 102, 8, 10, O); p.R(21, 103, 6, 8, "#c84a3a"); p.R(40, 104, 18, 8, O); p.R(41, 105, 16, 6, "#2a2a2a"); } }
    ],
    front(p, g, t, o){ fluo(p, 80, 2, 50); tone(g, this, o, .3); },
    solid:[[94,74,74,28],[198,50,38,36],[12,106,60,26]],
    exits:[]
  };
  setLoc("post", { start:"proom", spawn:[128,136], rooms:{ proom },
    spots:{ o_inspect:[120,78,20,10,130,112,"proom",A("read",{ actT:1.6 })] },
    details:{ d9_map:[16,8,66,44,50,76,"proom",A("look")] },
    place:{ gao:[null, { room:"proom", x:176, y:96, act:"phone", facing:-1 }] },
    plan:[ { name:"霧溪派出所", w:100, h:30, rooms:{ proom:[0,0,100,30] } } ] });
})();
