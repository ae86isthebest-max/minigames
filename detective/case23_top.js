/* =========================================================
   第 23 集・俯視版（topdown.js）
   舊澄港醫院（警察檔案庫）：一樓大廳（晚上／深夜各一間）、B1 檔案室、舊太平間、電梯井、通風管、一樓控制室、側門外；
   阿珠冰店（南澳漁港）。三段都是晚上；第二段被鎖在地下室（燈很暗）。
   每一段開始的房間不一樣：晚上＝大廳、地下室＝B1、深夜＝大廳（top.start 用 getter）。
   ========================================================= */
const C23T = typeof TOPEP === "function" ? TOPEP("archive") : null;
if (C23T){ const SKY23T = [ ["#0a0f1c","#24304a","#2a3040","#323a4a",0,1], ["#0a0f1c","#24304a","#2a3040","#323a4a",0,1], ["#06080f","#1a2234","#222838","#2a3242",0,1] ];
  C23T.EP.worldSky = ph => SKY23T[Math.min(ph || 0, SKY23T.length - 1)]; }

/* ================= 舊澄港醫院（警察檔案庫） ================= */
C23T && (() => {
  const { EP, T, O, sh, dA, ph, A, night, tone, fluo, vinyl, concrete, tileWall, roomOk, setLoc } = C23T;
  const W0 = EP.world.archive || {};
  const ok = id => roomOk("archive", id);
  const UP = STAIR10.up, DOWN = STAIR10.down, RAIL = STAIR10.rail;
  // 醫院時代的磨石子地（髒、裂）
  const terrazzo = (p, x, y, w, h, base, seed) => { p.R(x, y, w, h, base); p.seed(seed || 23); for (let k = 0; k < w * h / 26; k++) p.R(x + p.rnd() * w, y + p.rnd() * h, 1, 1, [sh(base, .12), sh(base, -.14), "#8a7a6a"][k % 3]);
    for (let k = 0; k < 5; k++){ let cx = x + p.rnd() * w, cy = y + p.rnd() * h; for (let i = 0; i < 18; i++){ cx += p.rnd() * 3 - 1; cy += p.rnd() * 2 - .5; p.R(cx, cy, 1, 1, sh(base, -.3)); } } };
  // 一支壞掉、一閃一閃的燈管
  const flick = (p, x, t, seed) => { const on = Math.floor(t * 7 + seed) % 9 > 1; fluo(p, x, 2, 40, on); };

  /* ---------- 一樓大廳（舊醫院的掛號大廳）：掛號櫃台改成的登記處（夜間出入登記簿）、警衛亭（小電視開得很大聲）、舊樓層圖、卡死的輪椅、往地下室的樓梯；控制室的門、側門 ---------- */
  const lobbyRoom = (late) => ({ name:"一樓大廳", w:304, h:150, wall:60,
    floor(p, g, t, o){
      tileWall(p, 0, 304, 60, "#c8d0c8", "#b8c0b8");
      // 舊樓層圖（紅字醫院時代、黑字檔案庫）
      p.R(96, 8, 48, 34, O); p.R(97, 9, 46, 32, "#e8e4d4"); for (let r = 0; r < 3; r++){ p.R(100, 12 + r * 10, 40, 8, O); p.R(101, 13 + r * 10, 38, 6, "#f4f0e0"); p.R(103, 15 + r * 10, 12, 2, "#c8302a"); p.R(118, 15 + r * 10, 16, 2, "#2a2a2a"); }
      // 「掛號」的舊燈箱（不亮了）
      p.R(160, 6, 50, 12, O); p.R(161, 7, 48, 10, "#5a6a6a"); p.R(170, 9, 10, 6, "#8a9a9a"); p.R(186, 9, 10, 6, "#8a9a9a");
      // 控制室的門（右後）
      T.backDoor(p, 226, 18, 24, 42, ok("control") ? dA(late ? "lobby2" : "lobby", "control") : 0, "#6a6e74", { frame:"#3a3e42" }); p.R(230, 10, 16, 6, O); p.R(231, 11, 14, 4, "#e8e2d2");
      // 往地下室的樓梯（右邊，牆上「太平間 ↓」）
      p.R(262, 0, 42, 60, "#4a504c"); DOWN(p, O, sh, 264, 4, 36, 7, "#9a9a90"); RAIL(p, O, 262, 4, 54, "#3a3a3a"); p.R(266, 2, 22, 6, O); p.R(267, 3, 20, 4, "#e8e4d8"); p.R(269, 4, 10, 2, "#c8302a");
      if (late){ T.tape(p, 262, 52, 302, 52); for (const x of [262, 300]){ p.R(x, 44, 3, 14, O); p.R(x + 1, 45, 1, 12, "#e9c43a"); } }
      terrazzo(p, 0, 60, 304, 90, "#a8a498", 23);
      T.sides(p, this, "#4a504c", [["L", 80, 44], ["B", 120, 50]]);
      T.sideDoor(p, this, "L", 80, 44, ok("gate") ? dA(late ? "lobby2" : "lobby", "gate") : 0, "#5a5e64");
    },
    props:[
      // 警衛亭（玻璃小亭子、裡面一台小電視、一個沒鎖的抽屜）
      { y:96, draw(p, g, t){ p.R(14, 62, 50, 34, O); p.R(15, 63, 48, 32, "#8a9088"); p.R(17, 65, 44, 20, "rgba(200,225,235,.5)"); p.R(15, 85, 48, 10, "#6a7068");
          p.R(44, 66, 14, 10, O); p.R(45, 67, 12, 8, "#2a3a5a"); p.R(46, 68, 10, 6, ["#3a6a9a", "#9a5a3a", "#5a8a5a"][Math.floor(t * 2) % 3]); p.R(20, 86, 16, 6, O); p.R(21, 87, 14, 4, "#8a6a4a"); p.R(27, 88, 2, 2, "#c8a050"); } },
      // 登記處（舊的掛號櫃台）：夜間出入登記簿
      { y:98, draw(p){ T.box(p, 120, 78, 104, 12, 12, "#c8c0a8", "#8a8068"); p.R(124, 70, 96, 8, "rgba(200,225,235,.6)"); p.R(150, 80, 22, 8, O); p.R(151, 81, 20, 6, "#f4f0e0"); p.R(161, 81, 1, 6, "#c8c4b8"); p.R(153, 83, 6, 1, "#3a3a6a"); p.R(164, 83, 5, 1, "#3a3a6a"); p.R(190, 80, 12, 8, O); p.R(191, 81, 10, 6, "#3a3a44"); } },
      // 卡死的輪椅（醫院財產編號 0318）
      { y:122, draw(p){ const x = 86, y = 122; p.R(x, y - 18, 16, 14, O); p.R(x + 1, y - 17, 14, 12, "#3a5a8a"); p.R(x + 1, y - 17, 14, 3, "#4a6a9a"); for (const wx of [x - 2, x + 16]){ p.R(wx, y - 14, 3, 14, O); p.R(wx + 1, y - 13, 1, 12, "#8a8e94"); } p.R(x + 4, y - 4, 8, 4, O); p.R(x + 5, y - 3, 6, 2, "#c8ccd0"); p.R(x + 4, y - 15, 8, 2, "#f4f4f0"); } },
      // 一排舊的候診椅
      { y:134, draw(p){ for (let k = 0; k < 5; k++) T.chair(p, 170 + k * 16, 134, "#7a8a6a", "up"); p.R(162, 132, 84, 3, O); } }
    ],
    front(p, g, t, o){ flick(p, 80, t, 0); fluo(p, 200, 2, 40, false); tone(g, this, o, .55); },
    solid:[[12,60,54,38],[118,76,108,26],[82,100,26,24],[160,124,88,12],[260,0,44,62]],
    exits:[ { r:[262,60,40,8], to:"b1", at:[50,76], label:"往地下室（B1 檔案室）", kind:"down", art:[262,0,42,60], when:() => ok("b1") },
            { r:[226,60,24,8], to:"control", at:[60,110], label:"控制室", kind:"door", art:[226,18,24,42], when:() => ok("control") },
            { r:[0,80,8,44], to:"gate", at:[60,74], label:"側門", kind:"door", art:[0,78,8,48], when:() => ok("gate") } ]
  });
  const lobby = lobbyRoom(false), lobby2 = lobbyRoom(true);

  /* ---------- B1 檔案室（以前是太平間的前廳）：鐵門（總控鎖定的紅燈）、索引櫃（木頭小抽屜）、一排排紙箱架、桌上的 B1-17、最底下一格的舊病歷袋、保險絲盒、門邊的驗收卡片、牆上的通風口；最裡面一道「往太平間」的小鐵門（密碼鎖） ---------- */
  const b1 = { name:"B1 檔案室", w:304, h:150, wall:58,
    floor(p, g, t, o){ const dark = ph(o) === 1;
      T.backWall(p, 0, 304, 58, dark ? "#3a423c" : "#6a746c", "plain", { base:"#2a302c" });
      // 鐵門（你們進來的那扇；第二段亮著紅燈「總控鎖定」）
      p.R(16, 10, 30, 48, O); p.R(17, 11, 28, 47, "#6a6e74"); for (let y = 16; y < 56; y += 8) p.R(18, y, 26, 1, "#5a5e64"); p.R(40, 32, 3, 6, "#c8ccd0"); p.R(26, 4, 10, 5, O); p.R(27, 5, 8, 3, dark ? (Math.floor(t * 2) % 2 ? "#e83a2a" : "#8a1a10") : "#3aa84a");
      // 驗收卡片（護貝）＋保險絲盒
      p.R(52, 22, 14, 10, O); p.R(53, 23, 12, 8, "#f4f0e0"); p.R(55, 25, 8, 1, "#3a3a3a"); p.R(55, 27, 6, 1, "#c8302a");
      p.R(70, 18, 16, 20, O); p.R(71, 19, 14, 18, "#8a8e94"); p.R(72, 20, 12, 16, "#9a9ea4"); p.R(76, 26, 4, 3, "#2a2a2a");
      // 紙箱架（1990–2015）
      for (let s = 0; s < 3; s++){ const x0 = 100 + s * 50; p.R(x0, 6, 44, 50, O); p.R(x0 + 1, 7, 42, 48, "#5a4a3a"); for (let r = 0; r < 3; r++){ p.R(x0 + 1, 21 + r * 16, 42, 2, "#3a2a1a"); for (let k = 0; k < 4; k++){ p.R(x0 + 2 + k * 10, 9 + r * 16, 9, 12, "#c8a878"); p.R(x0 + 4 + k * 10, 12 + r * 16, 5, 3, "#f4f0e0"); } } }
      // 牆上的通風口（葉片不轉了）
      p.R(252, 8, 22, 12, O); p.R(253, 9, 20, 10, "#8a8e94"); for (let k = 0; k < 4; k++) p.R(254, 10 + k * 2, 18, 1, "#5a5e64");
      // 最裡面的小鐵門「往太平間」＋密碼鎖
      p.R(270, 22, 26, 36, O); p.R(271, 23, 24, 35, "#5a5e58"); p.R(273, 26, 20, 5, "#8a8a7a"); p.R(262, 34, 6, 8, O); p.R(263, 35, 4, 6, "#2a2a2a"); p.R(264, 36, 2, 1, "#6fd46f");
      terrazzo(p, 0, 58, 304, 92, dark ? "#4a4e48" : "#8a8e86", 24);
      T.sides(p, this, "#2a302c", []);
    },
    props:[
      // 索引櫃（木頭小抽屜，卡片被摸得發黑）
      { y:114, draw(p){ T.box(p, 14, 90, 44, 12, 14, "#8a6a4a", "#5a3a22"); for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++){ p.R(16 + c * 8, 104 + r * 5, 7, 4, "#a87a4a"); p.R(19 + c * 8, 105 + r * 5, 2, 1, "#c8a050"); } p.R(26, 90, 10, 4, "#f4f0e0"); } },
      // 桌上的 B1-17（封條割開又黏回去）
      { y:110, draw(p){ T.box(p, 130, 92, 60, 12, 8, "#7a7e84", "#5a5e64"); p.R(146, 84, 24, 14, O); p.R(147, 85, 22, 12, "#c8a878"); p.R(147, 90, 22, 2, "rgba(220,230,240,.8)"); p.R(150, 87, 8, 2, "#f4f0e0"); } },
      // 最底下一格塞著舊病歷袋
      { y:72, draw(p){ for (let k = 0; k < 5; k++){ p.R(204 + k * 8, 50, 7, 6, "#c8b48a"); p.R(204 + k * 8, 50, 7, 1, "#a8946a"); } p.R(220, 49, 8, 7, "#d8c49a"); } }
    ],
    front(p, g, t, o){ if (ph(o) === 1){ flick(p, 150, t, 3); T.dim(g, this, .5); g.save(); g.globalCompositeOperation = "lighter"; const gr = g.createRadialGradient(150, 100, 4, 150, 100, 80); gr.addColorStop(0, "rgba(255,250,220,.18)"); gr.addColorStop(1, "rgba(255,250,220,0)"); g.fillStyle = gr; g.fillRect(0, 0, this.w, this.h); g.restore(); } else { fluo(p, 80, 2, 50); fluo(p, 220, 2, 50); tone(g, this, o, .3); } },
    solid:[[12,88,48,30],[128,82,64,30],[260,30,10,14]],
    exits:[ { r:[16,58,30,8], to:"lobby", at:[282,74], label:"樓上（大廳）", kind:"up", art:[16,10,30,48], when:() => ok("lobby") },
            { r:[16,58,30,8], to:"lobby2", at:[282,74], label:"樓上（大廳）", kind:"up", art:[16,10,30,48], when:() => ok("lobby2") },
            { r:[270,58,26,8], to:"morgue23", at:[40,118], label:"往太平間", kind:"door", art:[270,22,26,36], when:() => ok("morgue23") } ]
  };

  /* ---------- 舊太平間：一整面不鏽鋼冷藏櫃（三排三格；第 4 格後面有洞）、積灰的解剖台「1987」、生鏽的排水孔 ---------- */
  const morgue23 = { name:"舊太平間", w:256, h:140, wall:60,
    floor(p, g, t, o){
      tileWall(p, 0, 256, 60, "#9aa8a4", "#8a9894");
      // 冷藏櫃（三排三格，第 4 格＝中間那排第一格，門拉開著）
      p.R(120, 4, 120, 56, O); p.R(121, 5, 118, 54, "#a8acb0"); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++){ const x = 124 + c * 38, y = 7 + r * 17; const open = r === 1 && c === 0;
        p.R(x, y, 36, 15, open ? "#0a0c10" : "#c8ccd0"); if (!open){ p.R(x, y, 36, 1, "#e0e4e8"); p.R(x + 28, y + 5, 4, 4, "#8a8e94"); } else { p.R(x + 4, y + 3, 28, 9, "#141414"); } }
      vinyl(p, 0, 60, 256, 80, "#8a9490", "#848e8a", 18);
      p.R(60, 100, 10, 8, O); p.R(61, 101, 8, 6, "#5a4a3a"); for (let k = 0; k < 3; k++) p.R(62, 102 + k * 2, 6, 1, "#3a2a1a");
      T.sides(p, this, "#4a5450", [["L", 98, 36]]);
    },
    props:[
      // 解剖台（灰很厚，邊緣刻著「1987」）
      { y:100, draw(p){ T.box(p, 60, 66, 76, 22, 10, "#b8bcc0", "#8a8e94", { legs:4 }); p.R(64, 70, 68, 14, "#c8ccd0"); p.seed(5); for (let k = 0; k < 40; k++) p.R(64 + p.rnd() * 68, 70 + p.rnd() * 14, 2, 1, "rgba(160,150,130,.5)"); p.R(120, 86, 12, 2, "#5a5e64"); } },
      // 拉開的第 4 格托盤
      { y:66, draw(p){ p.R(124, 41, 36, 22, O); p.R(125, 42, 34, 20, "#c8ccd0"); p.R(127, 44, 30, 16, "#a8acb0"); } }
    ],
    front(p, g, t, o){ T.dim(g, this, .45); g.save(); g.globalCompositeOperation = "lighter"; const gr = g.createRadialGradient(110, 90, 4, 110, 90, 70); gr.addColorStop(0, "rgba(220,240,255,.15)"); gr.addColorStop(1, "rgba(220,240,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, this.w, this.h); g.restore(); },
    solid:[[58,64,80,38],[118,2,124,62]],
    exits:[ { r:[0,98,8,36], to:"b1", at:[282,90], label:"B1 檔案室", kind:"door", art:[0,96,8,40] },
            { r:[124,62,36,8], to:"shaft", at:[40,104], label:"第 4 格後面的洞", kind:"up", art:[124,24,36,38], when:() => ok("shaft") } ]
  };

  /* ---------- 電梯井：生鏽的鋼索垂下來、上面停著不動的電梯廂、鐵梯（下段罩著鐵框和掛鎖）、冷藏櫃後面爬出來的洞口 ---------- */
  const shaft = { name:"電梯井", w:192, h:136, wall:56,
    floor(p, g, t, o){
      concrete(p, 0, 0, 192, 56, "#4a4a46", 23); p.R(0, 54, 192, 2, O);
      // 鋼索（垂下來）＋往上看到的電梯廂底
      p.R(60, 0, 80, 10, O); p.R(61, 0, 78, 9, "#3a3a3a"); for (const x of [84, 96, 108]) p.R(x, 9, 1, 47, "#8a6a4a");
      // 鐵梯（右邊）：下段罩著鐵框，一把生鏽的掛鎖
      p.R(150, 0, 3, 56, O); p.R(166, 0, 3, 56, O); for (let y = 4; y < 56; y += 6) p.R(150, y, 19, 2, "#7a6a5a"); p.R(146, 26, 27, 30, O); for (let x = 147; x < 172; x += 4) p.R(x, 27, 1, 29, "#5a5e64"); p.R(146, 26, 27, 2, "#6a6e74"); p.R(156, 40, 7, 8, O); p.R(157, 41, 5, 6, "#8a5a2a");
      concrete(p, 0, 56, 192, 80, "#5a5a54", 24); p.seed(4); for (let k = 0; k < 12; k++) p.R(20 + p.rnd() * 150, 70 + p.rnd() * 56, 4, 2, "#3a3a36");
      // 洞口（冷藏櫃後面爬出來的，左邊牆上）
      p.R(0, 88, 7, 30, "#0a0a0a"); p.R(6, 88, 2, 30, "#8a8e94"); p.R(6, 94, 2, 4, "#e8e4d8");
      T.sides(p, this, "#2a2a28", [["L", 88, 30]]);
    },
    props:[],
    front(p, g, t, o){ T.dim(g, this, .5); g.save(); g.globalCompositeOperation = "lighter"; const gr = g.createRadialGradient(96, 96, 4, 96, 96, 60); gr.addColorStop(0, "rgba(255,250,220,.16)"); gr.addColorStop(1, "rgba(255,250,220,0)"); g.fillStyle = gr; g.fillRect(0, 0, this.w, this.h); g.restore(); },
    solid:[],
    exits:[ { r:[0,88,8,30], to:"morgue23", at:[150,76], label:"洞口（太平間）", kind:"out", art:[0,86,12,34] },
            { r:[150,56,20,8], to:"vent", at:[30,100], label:"爬梯子（通風管）", kind:"up", art:[146,0,27,56], when:() => ok("vent") } ]
  };

  /* ---------- 通風管（從上面往下看）：只容得下一個人爬的鐵皮管、三條岔路；紫外光照出來的綠色螢光箭頭；盡頭一片鐵網，外面有光 ---------- */
  const DUCT = [[14,86,120,26],[110,30,24,82],[110,30,170,22],[180,30,24,96],[180,104,96,22],[30,30,80,22]];
  const vent = { name:"通風管", w:288, h:140, wall:6,
    floor(p, g, t, o){
      p.R(0, 0, 288, 140, "#0a0a0c");
      for (const [x, y, w, h] of DUCT){ p.R(x - 3, y - 3, w + 6, h + 6, O); p.R(x - 2, y - 2, w + 4, h + 4, "#5a5e64"); p.R(x, y, w, h, "#3a3e44"); for (let i = x + 6; i < x + w; i += 12) p.R(i, y, 1, h, "#34383e"); for (let j = y + 6; j < y + h; j += 12) p.R(x, j, w, 1, "#34383e"); }
      for (const [x, y, w, h] of DUCT){ p.R(x, y, w, h, "rgba(0,0,0,0)"); }
      // 綠色螢光箭頭（維修工人畫的）
      for (const [x, y, d] of [[60, 98, 1], [100, 98, 1], [122, 70, -2], [150, 40, 1], [192, 60, 2], [192, 92, 2], [220, 114, 1], [250, 114, 1]]){ const c = "#7aff9a"; if (Math.abs(d) === 1){ p.R(x, y, 8, 1, c); p.R(x + 6, y - 1, 1, 3, c); } else { p.R(x, y, 1, 8, c); p.R(x - 1, d > 0 ? y + 6 : y, 3, 1, c); } }
      // 左邊那條岔路（越來越窄，風往裡吸）
      p.R(30, 34, 20, 14, "#2a2e34");
      // 盡頭：一片鐵網，外面有光
      p.R(270, 104, 6, 22, O); for (let j = 104; j < 126; j += 3) p.R(270, j, 6, 1, "#a8acb0"); T.glow(g, 278, 115, 26, "255,240,200", .25);
      // 進來的地方（左下，梯子頂端）
      p.R(14, 86, 8, 26, "#2a2e34"); p.R(16, 90, 4, 18, "#7a6a5a");
    },
    props:[],
    front(p, g, t, o){ const g2 = g; g2.save(); g2.globalAlpha = .55; g2.fillStyle = "#000"; g2.fillRect(0, 0, this.w, this.h); g2.restore(); g.save(); g.globalCompositeOperation = "lighter"; for (const [x, y] of [[60, 98], [122, 70], [192, 60], [192, 92], [250, 114]]){ const gr = g.createRadialGradient(x, y, 1, x, y, 16); gr.addColorStop(0, "rgba(140,255,170,.3)"); gr.addColorStop(1, "rgba(140,255,170,0)"); g.fillStyle = gr; g.fillRect(x - 16, y - 16, 32, 32); } g.restore(); },
    solid:[[0,0,288,26],[0,0,10,140],[0,116,180,24],[0,56,106,26],[138,56,38,134],[208,56,80,44],[0,130,288,10],[280,0,8,140],[54,26,52,30]],
    exits:[ { r:[10,86,10,26], to:"shaft", at:[158,72], label:"梯子（往下）", kind:"down", art:[10,84,14,30] },
            { r:[266,104,10,22], to:"control", at:[118,84], label:"鐵網（外面有光）", kind:"out", art:[264,100,14,30], when:() => ok("control") } ]
  };

  /* ---------- 一樓控制室：監視器（大門、側門）、控制面板（紅色大按鈕「B1 全區鎖定 按住 3 秒」）、桌上的操作手冊、鎖定紀錄；天花板上一個被踢開的通風口 ---------- */
  const control = { name:"一樓控制室", w:224, h:136, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 224, 58, "#b8c0bc", "plain", { base:"#3a4440" });
      // 監視器（兩格）
      p.R(20, 8, 60, 30, O); p.R(21, 9, 58, 28, "#1e2226"); p.R(22, 10, 27, 26, "#2a3a3a"); p.R(51, 10, 27, 26, "#2a3a3a"); p.R(28, 26, 12, 6, "#5a6a6a"); p.R(58, 24, 8, 10, "#4a5a5a");
      // 控制面板（一排燈、紅色大按鈕）
      p.R(96, 10, 80, 40, O); p.R(97, 11, 78, 38, "#8a9088"); for (let k = 0; k < 8; k++) p.R(101 + k * 9, 15, 5, 4, k === 0 ? (Math.floor(t * 2) % 2 ? "#e83a2a" : "#8a1a10") : "#3a8a5a"); p.R(124, 26, 22, 18, O); p.R(125, 27, 20, 16, "#c8302a"); p.R(127, 29, 16, 4, "#e85a4a"); p.R(150, 28, 20, 12, "#f4f0e0"); p.R(152, 31, 16, 1, "#3a3a3a"); p.R(152, 34, 12, 1, "#3a3a3a");
      // 天花板被踢開的通風口（第二段以後）
      if (ok("control")){ p.R(186, 6, 24, 14, O); p.R(187, 7, 22, 12, "#0a0a0c"); p.R(190, 18, 16, 3, "#a8acb0"); }
      vinyl(p, 0, 58, 224, 78, "#9aa29c", "#929a94", 16);
      p.R(190, 100, 18, 4, "#a8acb0"); for (let k = 0; k < 5; k++) p.R(191 + k * 3, 100, 1, 4, "#5a5e64");   // 掉在地上的鐵網
      T.sides(p, this, "#3a4440", [["B", 40, 40]]);
    },
    props:[
      // 桌子（操作手冊翻在「B1 全區鎖定」、鎖定紀錄的列印）
      { y:92, draw(p){ T.box(p, 14, 70, 90, 12, 10, "#7a7e84", "#5a5e64"); p.R(22, 72, 22, 9, O); p.R(23, 73, 10, 7, "#f4f0e0"); p.R(33, 73, 10, 7, "#f4f0e0"); p.R(42, 72, 3, 3, "#e9c43a"); p.R(60, 72, 16, 9, O); p.R(61, 73, 14, 7, "#f4f4f0"); p.R(63, 75, 10, 1, "#3a3a3a"); p.R(63, 77, 8, 1, "#c8302a"); } },
      { y:100, draw(p){ T.chair(p, 60, 100, "#2a2a30", "up"); } }
    ],
    front(p, g, t, o){ fluo(p, 112, 2, 50); tone(g, this, o, .3); },
    solid:[[12,68,94,24],[94,8,84,44]],
    exits:[ { r:[40,128,40,8], to:"lobby2", at:[238,76], label:"一樓大廳", kind:"out", art:[38,124,44,12], when:() => ok("lobby2") } ]
  };

  /* ---------- 側門外：一片雨後的泥地（一道機車胎痕拉到巷子）、門邊白色保麗龍箱「阿珠冰」、門上的監視器、巷口的路燈 ---------- */
  const gate = { name:"側門外", w:288, h:136, wall:58,
    floor(p, g, t, o){
      p.R(0, 0, 288, 58, "#3a3e40"); for (let y = 6; y < 58; y += 6) p.R(0, y, 288, 1, "#32363a"); p.R(0, 0, 288, 6, "#0a0f1c");
      // 側門（鐵門）＋門上的監視器
      p.R(40, 16, 30, 42, O); p.R(41, 17, 28, 41, "#5a5e64"); p.R(64, 36, 3, 6, "#c8ccd0"); T.cam(p, 74, 10, -1, t);
      // 醫院時代的舊窗（封著木板）
      for (let k = 0; k < 3; k++){ p.R(100 + k * 46, 16, 30, 24, O); p.R(101 + k * 46, 17, 28, 22, "#5a4a3a"); for (let j = 0; j < 3; j++) p.R(101 + k * 46, 20 + j * 7, 28, 2, "#7a6a5a"); }
      // 泥地（下過雨），機車胎痕從門口拉到巷子（前輪紋路清楚、後輪平平的）
      p.R(0, 58, 288, 78, "#4a4234"); p.seed(23); for (let k = 0; k < 160; k++) p.R(p.rnd() * 288, 58 + p.rnd() * 78, 2, 1, k % 2 ? "#3e3628" : "#5a5040"); for (let k = 0; k < 6; k++) p.R(30 + k * 44, 70 + (k * 17) % 50, 18, 5, "rgba(120,150,170,.25)");
      for (let k = 0; k < 120; k++){ const x = 60 + k * 1.8, y = 66 + k * .45; p.R(x, y, 2, 1, k % 3 ? "#2a2418" : "#5a5040"); p.R(x, y + 5, 2, 1, "#2e2a1e"); }
      T.sides(p, this, "#2a2e30", []);
    },
    props:[
      // 白色保麗龍箱「阿珠冰」
      { y:76, draw(p){ T.box(p, 76, 62, 22, 10, 8, "#f4f4f0", "#d8d8d4"); p.R(80, 64, 14, 4, "#c8e0f0"); p.R(80, 72, 12, 2, "#2a5aa8"); } },
      // 巷口的路燈（纏著蜘蛛網）
      { y:100, draw(p, g){ T.streetLamp(p, g, 256, 100); T.glow(g, 262, 48, 40, "255,230,160", .12); for (let k = 0; k < 6; k++) p.R(258 + k, 46 + (k % 2), 1, 1, "#c8c8c8"); } }
    ],
    front(p, g, t, o){ T.dim(g, this, .3); },
    solid:[[74,60,26,22],[250,94,14,8]],
    exits:[ { r:[40,58,30,8], to:"lobby2", at:[24,102], label:"一樓大廳", kind:"door", art:[40,16,30,42], when:() => ok("lobby2") } ]
  };

  const spots = {
    o23_logbook:[148,78,26,12,160,112,"lobby",A("read")],
    o23_floormap:[96,8,48,34,106,72,"lobby",A("look")],
    o23_wheel:[82,100,26,24,118,122,"lobby",A("look",{ face:-1 })],
    o23_index:[12,88,48,30,36,128,"b1",A("rummage")],
    o23_box:[144,82,28,16,160,122,"b1",A("rummage")],
    o23_card:[52,22,14,10,60,72,"b1",A("read")],
    o23_files:[202,48,44,10,224,72,"b1",A("rummage")],
    o23_fuse:[70,18,16,20,84,72,"b1",A("look")],
    o23_door:[16,10,30,48,32,74,"b1",A("look")],
    o23_keypad:[260,32,10,12,254,74,"b1",A("type",{ actT:2 })],
    o23_fridge:[120,4,120,56,180,82,"morgue23",A("rummage")],
    o23_slab:[58,64,80,38,100,114,"morgue23",A("look")],
    o23_ladder:[146,26,27,30,158,72,"shaft",A("look")],
    o23_cables:[60,0,80,56,96,76,"shaft",A("look")],
    o23_vent:[110,30,24,82,122,100,"vent",A("look")],
    o23_arrows:[180,56,24,48,192,80,"vent",A("look")],
    o23_grille:[266,104,12,22,256,115,"vent",A("look",{ face:1 })],
    o23_keyhook:[18,84,20,10,40,110,"lobby2",A("rummage",{ face:-1 })],
    o23_tv:[42,64,18,14,74,108,"lobby2",A("look",{ face:-1 })],
    cctv23_gate:[20,8,60,30,50,104,"control",A("look")],
    doc23_locklog:[58,70,20,12,70,106,"control",A("read")],
    o23_panel:[96,8,84,44,136,72,"control",A("look")],
    o23_tire:[56,64,220,40,160,112,"gate",A("crouch")],
    o23_icebox:[74,60,26,22,110,80,"gate",A("rummage",{ face:-1 })]
  };
  const details = {
    d23_stairs:[262,0,42,60,248,80,"lobby",A("look",{ face:1 })],
    d23_light:[60,0,40,10,80,80,"lobby",A("look")],
    d23_stairs2:[262,0,42,60,248,80,"lobby2",A("look",{ face:1 })],
    d23_vent:[252,8,22,12,240,74,"b1",A("look")],
    d23_shelf:[100,6,144,50,120,72,"b1",A("look")],
    d23_drain:[58,98,14,12,80,124,"morgue23",A("crouch",{ face:-1 })],
    d23_hole:[0,86,12,34,30,104,"shaft",A("look",{ face:-1 })],
    d23_fork:[30,30,24,22,120,42,"vent",A("look",{ face:-1 })],
    d23_desk:[14,68,40,14,30,104,"control",A("read")],
    d23_cam:[64,6,16,10,100,98,"gate",A("look")],
    d23_lamp:[248,40,24,60,240,114,"gate",A("look",{ face:1 })]
  };
  const place = {
    qiu:[ { room:"lobby", x:30, y:82, act:"sit", facing:1, view:"side" }, null, { room:"lobby2", x:70, y:128, act:"clasp", facing:1 } ],
    liu:[ { room:"lobby", x:180, y:72, act:"read", facing:1 }, null, { room:"lobby2", x:196, y:116, act:"phone", facing:-1 } ],
    xu:[ { room:"b1", x:110, y:96, act:"read", facing:1 }, { room:"b1", x:206, y:104, act:"idle", facing:-1 }, { room:"control", x:150, y:104, act:"idle", facing:-1 } ],
    kui:[ null, null, { room:"gate", x:180, y:96, act:"kneel", facing:-1 } ]
  };
  const intro = [ { set:{ room:"lobby", px:146, py:146 }, hide:true }, { wait:0.3, hide:true }, { set:{ room:"lobby", px:146, py:128 } },
    ...(W0.intro || []).filter(k => k.say || (k.wait && !k.hide)).map(k => k.say && k.say[0] === "wu" && /點畫面上的箭嘴|📍|清單不是全部/.test(k.say[1]) ? null : k).filter(Boolean),
    { say:["wu", "想去哪裡，點畫面上的門口就會自己走過去。閃著星星的就是還沒看過的東西，按上面的「🧭 平面圖」看全部在哪裡。"], name:"小吳" } ];
  setLoc("archive", { start:"lobby", spawn:[146,128], rooms:{ lobby, lobby2, b1, morgue23, shaft, vent, control, gate }, spots, details, place, extras:W0.extras || [], intro,
    plan:[ { name:"1F", w:100, h:30, rooms:{ gate:[0,0,24,30,"out"], lobby:[24,0,52,30], lobby2:[24,0,52,30], control:[76,0,24,16] } },
           { name:"通風管", w:100, h:10, rooms:{ vent:[24,0,76,10] } },
           { name:"B1", w:100, h:24, rooms:{ b1:[0,0,44,24], morgue23:[44,0,34,24], shaft:[78,0,22,24] } } ] });
  // 每一段開始的房間：晚上在大廳、地下室在 B1（被鎖在裡面）、深夜回到大廳
  const T23 = EP.world.archive.top, START = ["lobby", "b1", "lobby2"], SPAWN = [[146,128], [150,120], [146,128]];
  const PHN = () => { try { return Math.min(2, (typeof S !== "undefined" && S && S.phase) || 0); } catch(e){ return 0; } };
  Object.defineProperty(T23, "start", { get:() => START[PHN()], configurable:true });
  Object.defineProperty(T23, "spawn", { get:() => SPAWN[PHN()], configurable:true });
})();

/* ================= 阿珠冰店（南澳漁港） ================= */
C23T && (() => {
  const { EP, T, O, sh, ph, A, tone, fluo, concrete, setLoc } = C23T;

  /* ---------- 阿珠冰店：鐵門拉下一半、門口一台送貨機車（後座綁大鐵架）、刨冰機、紅豆、牆上一排熟客的集點卡、冰櫃 ---------- */
  const iice = { name:"阿珠冰店", w:256, h:144, wall:62,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 62, "#e8e0d0", "tile", { base:"#3a6a8a" });
      // 招牌「阿珠冰」＋價目表
      p.R(70, 4, 80, 12, O); p.R(71, 5, 78, 10, "#3a8ac8"); for (let k = 0; k < 3; k++) p.R(88 + k * 16, 7, 10, 6, "#f4f4f0");
      for (let k = 0; k < 6; k++){ p.R(162 + (k % 3) * 22, 6 + Math.floor(k / 3) * 14, 20, 12, O); p.R(163 + (k % 3) * 22, 7 + Math.floor(k / 3) * 14, 18, 10, "#f4f0e0"); p.R(165 + (k % 3) * 22, 9 + Math.floor(k / 3) * 14, 10, 2, "#c8302a"); }
      // 集點卡（一排；有一張只畫了一頂帽子）
      p.R(14, 22, 48, 26, O); p.R(15, 23, 46, 24, "#a87a4a"); for (let k = 0; k < 6; k++){ p.R(17 + (k % 3) * 15, 25 + Math.floor(k / 3) * 11, 13, 9, "#f4f0e0"); for (let d = 0; d < 4; d++) p.R(19 + (k % 3) * 15 + d * 3, 30 + Math.floor(k / 3) * 11, 2, 2, "#c8302a"); } p.R(34, 26, 5, 2, "#2a2a2a");
      concrete(p, 0, 62, 256, 82, "#a8a49c", 23);
      // 前面拉下一半的鐵捲門
      p.R(0, 138, 256, 6, "#6a6e74"); for (let x = 0; x < 256; x += 3) p.R(x, 138, 1, 6, "#5a5e64");
      T.sides(p, this, "#3a6a8a", [["B", 20, 50]]);
    },
    props:[
      // 刨冰機＋一碗紅豆
      { y:92, draw(p){ T.box(p, 90, 70, 70, 12, 12, "#c8ccd0", "#8a8e94"); p.R(104, 52, 18, 22, O); p.R(105, 53, 16, 20, "#3a8ac8"); p.R(108, 56, 10, 6, "#c8ccd0"); p.R(110, 64, 6, 6, "#e8f0f4"); p.R(130, 72, 14, 7, O); p.R(131, 73, 12, 5, "#8a2a2a"); p.R(131, 73, 12, 1, "rgba(220,235,240,.7)"); } },
      // 冰櫃（一桶一桶的冰）
      { y:96, draw(p){ T.box(p, 186, 70, 52, 14, 12, "#e8ecec", "#c8ccd0"); p.R(190, 72, 44, 10, "#c8e0f0"); for (let k = 0; k < 4; k++) p.R(192 + k * 11, 73, 9, 8, "#f4f8fc"); } },
      // 兩張小桌子
      { y:120, draw(p){ for (const x of [30, 70]){ T.box(p, x, 108, 22, 10, 4, "#c8302a", "#8a2a1a"); T.chair(p, x + 11, 128, "#3a6ac8", "up"); } } },
      // 門口的送貨機車（後座綁大鐵架，前輪新、後輪磨平）
      { y:138, draw(p, g){ const x = 160, y = 138; for (const [wx, c] of [[x + 4, "#1e1e22"], [x + 30, "#2a2a2e"]]){ p.R(wx - 5, y - 10, 11, 11, O); p.R(wx - 4, y - 9, 9, 9, c); p.R(wx - 1, y - 6, 3, 3, "#8a8e94"); }
          p.R(x - 2, y - 16, 28, 7, O); p.R(x - 1, y - 15, 26, 5, "#e8e4d8"); p.R(x - 4, y - 26, 18, 12, O); for (let i = x - 3; i < x + 13; i += 3) p.R(i, y - 25, 1, 10, "#8a8e94"); p.R(x - 3, y - 25, 16, 1, "#8a8e94");
          p.R(x + 18, y - 20, 8, 4, O); p.R(x + 19, y - 19, 6, 2, "#2a2a2a"); p.R(x + 26, y - 26, 3, 14, O); p.R(x + 23, y - 28, 10, 3, O); p.R(x + 24, y - 27, 8, 1, "#5a5e66"); p.R(x + 29, y - 22, 3, 3, "#f4f0c8"); } }
    ],
    front(p, g, t, o){ fluo(p, 128, 2, 50); tone(g, this, o, .3); },
    solid:[[88,50,74,44],[184,68,56,30],[28,106,26,14],[68,106,26,14],[154,110,42,30]],
    exits:[]
  };
  if (typeof window !== "undefined") window.ICE23 = iice;
  setLoc("ice", { start:"iice", spawn:[40,136], rooms:{ iice },
    spots:{ o23_scooter:[154,108,42,32,140,124,"iice",A("crouch",{ face:1 })], o23_cards:[14,22,48,26,40,100,"iice",A("look")] },
    details:{ d23_shaver:[100,50,26,34,100,100,"iice",A("look")] },
    place:{ zhu:[ null, null, { room:"iice", x:176, y:104, act:"wipe", facing:-1 } ] },
    extras:(EP.world.ice || {}).extras || [],
    plan:[ { name:"阿珠冰店", w:100, h:24, rooms:{ iice:[0,0,100,24] } } ] });
})();
