/* =========================================================
   第 21 集・俯視版（topdown.js）
   鷹嘴崖步道（營地、往廁所的步道、鷹嘴彎道、崖下溪溝）、山下派出所（值班台、會客室）、登山口雜貨店、
   鑑識中心（共用 CG_LAB）、法醫室（共用 CG_MORGUE）。第一段是凌晨、起大霧；第二段是下午。
   ========================================================= */
const C21T = typeof TOPEP === "function" ? TOPEP("eaglecliff") : null;
if (C21T){ const SKY21T = [ ["#080c16","#2a3240","#262a1e","#2e3426",0,1], ["#b8ccdc","#e8ecee","#6a7a58","#5a6a48",0,0] ];
  C21T.EP.worldSky = ph => SKY21T[Math.min(ph || 0, SKY21T.length - 1)]; }

/* ================= 鷹嘴崖步道 ================= */
C21T && (() => {
  const { EP, T, O, sh, dA, ph, A, night, tone, setLoc } = C21T;
  const W0 = EP.world.mountain || {};
  const N = o => ph(o) === 0;
  // 一棵樹（從上面往下看：一團樹冠，下面露出一小截樹幹）
  const tree = (p, x, y, r, col, n) => { col = n ? sh(col, -.35) : col; p.R(x - 2, y - 2, 5, 8, O); p.R(x - 1, y - 1, 3, 7, n ? "#2a2018" : "#5a4028");
    for (let j = -r; j <= r; j++){ const w = Math.round(Math.sqrt(r * r - j * j) * 1.1); p.R(x - w - 1, y - r - 4 + j, w * 2 + 2, 1, O); } for (let j = -r + 1; j < r; j++){ const w = Math.round(Math.sqrt(r * r - j * j) * 1.1) - 1; p.R(x - w, y - r - 4 + j, w * 2, 1, j < -r / 3 ? sh(col, .14) : j > r / 3 ? sh(col, -.16) : col); }
    p.R(x - Math.round(r / 2), y - r * 2 - 1, 3, 2, sh(col, .25)); };
  // 森林的邊（後面一整排樹）
  const forest = (p, w, H, o, seed) => { const n = N(o); p.R(0, 0, w, H, n ? "#0a1410" : "#3a5a3a"); p.seed(seed || 3);
    for (let k = 0; k < w / 9; k++){ const x = p.rnd() * w, r = 8 + p.rnd() * 6; tree(p, x, H - 2 + p.rnd() * 4, r, ["#2a4a2e", "#3a5a34", "#2e5a3a"][k % 3], n); } };
  // 泥土地（夜裡暗、白天黃褐，有落葉）
  const dirt = (p, x, y, w, h, o, seed) => { const n = N(o), base = n ? "#2e2a20" : "#7a6a4a"; p.R(x, y, w, h, base); p.seed(seed || 9);
    for (let k = 0; k < w * h / 24; k++) p.R(x + p.rnd() * w, y + p.rnd() * h, 2, 1, k % 3 ? sh(base, -.12) : sh(base, .1));
    for (let k = 0; k < w * h / 160; k++) p.R(x + p.rnd() * w, y + p.rnd() * h, 2, 2, n ? "#3a3220" : ["#a8783a", "#8a5a2a", "#6a7a3a"][k % 3]); };
  const grassy = (p, x, y, w, h, o) => T.grass(p, x, y, w, h, N(o) ? "#1a2a1a" : "#4a6a3a");
  // 大霧（第一段）：一片白，幾團慢慢飄的霧
  const fog = (g, R, t, o, k) => { if (!N(o)) return; k = k ?? 1; g.save(); g.globalAlpha = .22 * k; g.fillStyle = "#c8d0d4"; g.fillRect(0, 0, R.w, R.h);
    for (let i = 0; i < 7; i++){ const x = ((i * 67 + t * (4 + i % 3)) % (R.w + 120)) - 60, y = 20 + (i * 37) % (R.h - 20), r = 40 + (i % 3) * 14;
      const gr = g.createRadialGradient(x, y, 2, x, y, r); gr.addColorStop(0, "rgba(220,228,232,.55)"); gr.addColorStop(1, "rgba(220,228,232,0)"); g.globalAlpha = .5 * k; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } g.restore(); };
  // 帳篷（俯視：屋脊一條線、門口一片拉鍊門）
  const tent = (p, x, y, w, h, col, door) => { p.R(x - 1, y - 1, w + 2, h + 2, O); p.R(x, y, w, h, col); p.R(x, y, w, Math.round(h / 2), sh(col, .12)); p.R(x, y + Math.round(h / 2), w, 1, sh(col, -.35));
    p.R(x - 3, y + 2, 2, 2, "#8a8e94"); p.R(x + w + 1, y + 2, 2, 2, "#8a8e94"); p.R(x - 3, y + h - 3, 2, 2, "#8a8e94"); p.R(x + w + 1, y + h - 3, 2, 2, "#8a8e94");
    if (door){ const dx = x + Math.round(w / 2) - 7; p.R(dx, y + h - 2, 14, 4, O); p.R(dx + 1, y + h - 1, 12, 3, door === "open" ? "#1a1410" : sh(col, -.2)); } };
  const chair = (p, x, y, col, blanket) => { p.R(x - 6, y - 10, 13, 12, O); p.R(x - 5, y - 9, 11, 10, col); p.R(x - 5, y - 9, 11, 3, sh(col, .2)); p.R(x - 7, y - 4, 2, 6, O); p.R(x + 6, y - 4, 2, 6, O);
    if (blanket){ p.R(x - 6, y - 12, 13, 8, O); p.R(x - 5, y - 11, 11, 6, "#8a3a4a"); for (let k = 0; k < 3; k++) p.R(x - 4 + k * 4, y - 11, 1, 6, "#c8a050"); } };

  /* ---------- 營地：六頂帳篷（左邊橘色那頂是黃志明和鄭子安的；右邊社長的帳篷門開著、正對火堆）、火堆、兩張摺疊椅、燈籠、守夜表、垃圾袋 ---------- */
  const camp = { name:"營地", w:288, h:150, wall:42,
    floor(p, g, t, o){ const n = N(o);
      forest(p, 288, 42, o, 21);
      dirt(p, 0, 42, 288, 108, o, 21); grassy(p, 0, 132, 288, 18, o); grassy(p, 0, 42, 18, 90, o);
      // 火堆（一圈石頭、只剩一點紅色的炭；下午是冷的灰）
      for (let k = 0; k < 10; k++){ const a = k / 10 * 6.283; p.R(Math.round(132 + Math.cos(a) * 12) - 2, Math.round(102 + Math.sin(a) * 8) - 2, 5, 4, O); p.R(Math.round(132 + Math.cos(a) * 12) - 1, Math.round(102 + Math.sin(a) * 8) - 1, 3, 2, n ? "#5a5a5a" : "#9a9a94"); }
      p.R(124, 98, 17, 9, n ? "#1a1410" : "#5a5450"); for (let k = 0; k < 5; k++) p.R(126 + k * 3, 100 + (k % 2) * 2, 2, 2, n ? (Math.floor(t * 3 + k) % 3 ? "#c83a1a" : "#ff7a2a") : "#7a7470");
      if (n) T.glow(g, 132, 102, 26, "255,120,40", .22);
      // 往廁所的步道（右邊）
      p.R(262, 86, 26, 30, n ? "#3a3428" : "#8a7a58");
    },
    props:[
      // 後面三頂小帳篷
      { y:66, draw(p, g, t, o){ const n = N(o); tent(p, 82, 48, 34, 18, n ? "#2a4a6a" : "#3a6a9a", true); tent(p, 124, 46, 30, 18, n ? "#3a5a3a" : "#5a8a4a", true); tent(p, 160, 48, 30, 18, n ? "#4a4a5a" : "#7a7a8a", true); } },
      // 燈籠（掛在一根竹竿上，充電式）
      { y:72, draw(p, g, t, o){ p.R(196, 40, 2, 32, O); p.R(196, 40, 10, 2, O); p.R(202, 42, 6, 9, O); p.R(203, 43, 4, 7, N(o) ? "#fff0b0" : "#e8e0c0"); if (N(o)) T.glow(g, 205, 47, 20, "255,230,160", .2); } },
      // 左邊：黃志明和鄭子安的橘色帳篷（門口只剩一雙鞋，裡面看得到藍色背包）
      { y:88, draw(p, g, t, o){ tent(p, 22, 58, 50, 28, N(o) ? "#a8501a" : "#e8742a", "open"); p.R(42, 80, 8, 6, "#2a5aa8"); p.R(43, 81, 6, 2, "#e9c43a");
          p.R(30, 90, 5, 7, O); p.R(31, 91, 3, 5, "#5a4a3a"); p.R(36, 90, 5, 7, O); p.R(37, 91, 3, 5, "#5a4a3a"); p.R(50, 91, 10, 6, "rgba(40,30,20,.5)"); } },
      // 右邊：社長的帳篷，門沒拉、正對火堆；裡面一個揉成一團的紅色睡袋
      { y:94, draw(p, g, t, o){ tent(p, 214, 60, 48, 32, N(o) ? "#4a3a3a" : "#7a5a5a", "open"); p.R(226, 72, 24, 14, O); p.R(227, 73, 22, 12, "#1a1410"); p.R(229, 75, 18, 9, "#c8302a"); p.R(232, 77, 8, 4, "#e85a4a"); } },
      // 水壺（燻黑）＋一塊平石頭上十二個鐵杯
      { y:106, draw(p){ p.R(98, 92, 22, 14, O); p.R(99, 93, 20, 12, "#8a8a84"); for (let k = 0; k < 12; k++){ p.R(100 + (k % 6) * 3, 94 + Math.floor(k / 6) * 4, 2, 3, "#c8ccd0"); } p.R(108, 84, 10, 9, O); p.R(109, 85, 8, 7, "#2a2a2a"); p.R(111, 83, 4, 2, O); } },
      // 兩張摺疊椅對著火堆（一張搭著毯子）
      { y:116, draw(p){ chair(p, 112, 116, "#3a6a8a", false); chair(p, 154, 116, "#3a6a3a", true); } },
      // 社長帳篷門口的小凳子
      { y:104, draw(p){ p.R(232, 98, 12, 6, O); p.R(233, 99, 10, 4, "#5a5a5a"); p.R(234, 103, 2, 3, O); p.R(240, 103, 2, 3, O); } },
      // 守夜表（夾板掛在營地的小桌子上）
      { y:132, draw(p){ T.box(p, 168, 124, 30, 8, 6, "#8a8e94", "#5a5e64", { legs:2 }); p.R(174, 118, 14, 10, O); p.R(175, 119, 12, 8, "#f4f0e0"); for (let k = 0; k < 3; k++) p.R(177, 121 + k * 2, 8, 1, "#3a3a6a"); p.R(178, 117, 6, 2, "#8a6a4a"); } },
      // 綁好的垃圾袋
      { y:138, draw(p){ p.R(206, 124, 14, 14, O); p.R(207, 125, 12, 12, "#2a2a2e"); p.R(210, 122, 6, 4, O); p.R(211, 123, 4, 2, "#2a2a2e"); p.R(208, 127, 4, 2, "#e9c43a"); } }
    ],
    front(p, g, t, o){ tone(g, this, o, .7); fog(g, this, t, o); },
    solid:[[20,56,54,32],[80,46,112,22],[212,58,52,36],[96,82,26,26],[122,94,20,16],[104,104,16,14],[146,104,16,14],[230,96,16,10],[166,116,34,16],[204,120,18,18]],
    exits:[ { r:[280,86,8,30], to:"trail", at:[18,92], label:"往廁所的步道", kind:"out", art:[272,84,16,34] } ]
  };

  /* ---------- 往廁所的步道：兩邊都是樹，步道上橫著粗樹根、原木台階（長青苔）；木頭指標、樹幹上只剩一片反光片、路邊畫著白箭頭的石頭 ---------- */
  const trail = { name:"往廁所的步道", w:288, h:130, wall:36,
    floor(p, g, t, o){ const n = N(o);
      forest(p, 288, 36, o, 22); grassy(p, 0, 36, 288, 94, o);
      // 步道（泥土，一路往右）
      dirt(p, 0, 76, 288, 32, o, 22); p.R(0, 76, 288, 1, n ? "#1a2a1a" : "#3a5a2a"); p.R(0, 107, 288, 1, n ? "#1a2a1a" : "#3a5a2a");
      // 橫過步道的樹根（被踩得發亮）
      for (const x of [86, 108, 132]){ for (let k = 0; k < 32; k++) p.R(x + Math.round(Math.sin(k / 4) * 3), 76 + k, 3, 1, k % 5 ? (n ? "#4a3a2a" : "#8a6a4a") : (n ? "#6a5a4a" : "#b89a6a")); }
      // 原木台階（長了一層滑滑的青苔）
      for (let k = 0; k < 4; k++){ p.R(196 + k * 12, 77, 3, 30, O); p.R(197 + k * 12, 77, 1, 30, n ? "#4a5a3a" : "#7a8a4a"); p.R(196 + k * 12, 80 + (k * 7) % 20, 3, 4, n ? "#3a5a3a" : "#5a8a3a"); }
    },
    props:[
      // 上面一排樹（第三棵樹幹上只剩一片紅白反光片）
      { y:66, draw(p, g, t, o){ const n = N(o); for (const [x, r] of [[20, 11], [70, 12], [168, 13], [230, 11], [272, 10]]) tree(p, x, 66, r, "#2e5a34", n); p.R(166, 58, 5, 6, O); p.R(167, 59, 3, 2, "#e8302a"); p.R(167, 61, 3, 2, "#f4f4f0"); for (const x of [18, 68, 228]) p.R(x, 60, 1, 1, "#8a8e94"); } },
      // 木頭指標（兩片箭頭）
      { y:74, draw(p){ p.R(124, 46, 3, 28, O); p.R(125, 46, 1, 28, "#8a6a4a"); p.R(112, 46, 28, 8, O); p.R(113, 47, 26, 6, "#a87a4a"); p.R(138, 47, 3, 6, O); p.R(116, 49, 16, 1, "#3a2a1a"); p.R(120, 56, 26, 7, O); p.R(121, 57, 24, 5, "#a87a4a"); p.R(123, 59, 12, 1, "#3a2a1a"); p.R(140, 58, 3, 3, "#e9c43a"); } },
      // 路邊長青苔的石頭（白漆箭頭）
      { y:122, draw(p, g, t, o){ p.R(48, 110, 26, 13, O); p.R(49, 111, 24, 11, N(o) ? "#4a5048" : "#8a9088"); p.R(49, 111, 24, 4, N(o) ? "#3a5a3a" : "#5a8a4a"); p.R(56, 116, 10, 1, "#e8e8e0"); p.R(64, 115, 2, 3, "#e8e8e0"); } },
      // 下面一排樹
      { y:130, draw(p, g, t, o){ const n = N(o); for (const [x, r] of [[110, 10], [160, 12], [212, 10], [262, 11]]) tree(p, x, 134, r, "#3a5a34", n); } }
    ],
    front(p, g, t, o){ tone(g, this, o, .75); fog(g, this, t, o, 1.2); },
    solid:[[46,108,30,16],[120,44,26,30]],
    exits:[ { r:[0,76,8,32], to:"camp", at:[268,100], label:"營地", kind:"out", art:[0,74,12,36] },
            { r:[280,76,8,32], to:"cliff", at:[18,96], label:"鷹嘴彎道", kind:"out", art:[276,74,12,36] } ]
  };

  /* ---------- 鷹嘴彎道：步道往左上彎進樹林（遠處廁所小屋）；右邊那塊伸出去的大石頭就是鷹嘴，再過去是一片黑；倒在泥巴裡的木樁和繩子、一排黃色小旗子 ---------- */
  const cliff = { name:"鷹嘴彎道", w:288, h:150, wall:40,
    floor(p, g, t, o){ const n = N(o);
      forest(p, 288, 40, o, 23);
      // 遠處樹林裡的廁所小屋（門口的燈壞了）
      p.R(30, 20, 26, 20, O); p.R(31, 21, 24, 19, n ? "#3a3a34" : "#8a8070"); p.R(30, 16, 28, 6, O); p.R(31, 17, 26, 4, n ? "#2a2a2a" : "#5a5a5a"); p.R(39, 28, 8, 12, "#1a1410"); p.R(41, 24, 4, 3, "#5a5a54");
      grassy(p, 0, 40, 288, 110, o);
      // 步道：從左下進來，在這裡往左上彎、鑽進樹林
      dirt(p, 0, 92, 150, 30, o, 23); dirt(p, 60, 40, 40, 60, o, 24);
      // 崖外：一片黑（下午是溪谷的霧和遠山）
      p.R(232, 40, 56, 110, n ? "#05070c" : "#a8b8c4"); if (!n){ for (let k = 0; k < 3; k++) p.R(236 + k * 18, 60 + k * 6, 14, 4, "#8a9aa4"); } p.R(232, 40, 1, 110, O);
      for (let y = 40; y < 150; y += 3) p.R(230 + Math.round(Math.sin(y / 9) * 2), y, 3, 3, n ? "#2a3028" : "#6a7458");
      // 泥巴裡一組鞋印（從步道直直往鷹嘴走，半個腳掌、步子很短）
      for (let k = 0; k < 9; k++){ const x = 148 + k * 9, y = 104 + (k % 2) * 4; p.R(x, y, 4, 3, n ? "#1e1a14" : "#4a3a2a"); }
    },
    props:[
      // 鷹嘴：一塊伸出去的大石頭（長滿青苔，最前面缺了一角）
      { y:118, draw(p, g, t, o){ const n = N(o); p.R(214, 86, 50, 34, O); p.R(215, 87, 48, 32, n ? "#4a4e4a" : "#8a8e88"); p.R(215, 87, 48, 8, n ? "#2e4a2e" : "#4a7a3a"); for (let k = 0; k < 8; k++) p.R(218 + k * 5, 96 + (k % 3) * 6, 3, 2, n ? "#2e4a2e" : "#4a7a3a");
          p.R(256, 100, 8, 10, n ? "#05070c" : "#a8b8c4"); p.R(254, 98, 4, 14, n ? "#8a8a84" : "#c8c8c0"); p.R(253, 98, 1, 14, O); } },
      // 還站著的木樁（繩子綁得很緊）＋兩根歪倒的木樁、一整段掉在泥巴裡的繩子
      { y:102, draw(p){ p.R(176, 82, 5, 20, O); p.R(177, 83, 3, 18, "#8a6a4a"); p.R(176, 86, 5, 2, "#e8d8a8"); p.R(196, 98, 14, 5, O); p.R(197, 99, 12, 3, "#7a5a3a"); p.R(208, 108, 14, 5, O); p.R(209, 109, 12, 3, "#7a5a3a");
          for (let k = 0; k < 36; k++) p.R(181 + k, 88 + Math.round(k * .5 + Math.sin(k / 3) * 2), 1, 1, "#e8d8a8"); } },
      // 陳葵插的一排黃色小旗子
      { y:112, draw(p){ for (let k = 0; k < 6; k++){ const x = 150 + k * 14, y = 102 + (k % 2) * 6; p.R(x, y - 8, 1, 8, O); p.R(x + 1, y - 8, 4, 3, O); p.R(x + 1, y - 7, 3, 1, "#e9c43a"); } } },
      // 封鎖線（擋住鷹嘴）
      { y:84, draw(p){ for (const [x, y] of [[166, 74], [226, 74]]){ p.R(x, y, 3, 12, O); p.R(x + 1, y + 1, 1, 10, "#e9c43a"); } T.tape(p, 168, 76, 228, 76); } },
      // 路邊的大樹
      { y:140, draw(p, g, t, o){ for (const [x, r] of [[24, 12], [120, 11], [178, 12]]) tree(p, x, 144, r, "#2e5a34", N(o)); tree(p, 130, 70, 11, "#3a5a34", N(o)); tree(p, 22, 74, 10, "#2e5a34", N(o)); } }
    ],
    front(p, g, t, o){ tone(g, this, o, .75); fog(g, this, t, o, 1.3); },
    solid:[[212,84,76,66],[230,40,58,46],[174,80,8,22],[128,50,10,26],[18,56,10,22],[14,128,22,22],[110,126,22,24],[168,126,22,24]],
    exits:[ { r:[0,92,8,30], to:"trail", at:[268,92], label:"往廁所的步道", kind:"out", art:[0,90,12,34] },
            { r:[150,142,40,8], to:"below", at:[40,108], label:"崖下（繞溪溝下去）", kind:"down", art:[148,134,44,16] } ]
  };

  /* ---------- 鷹嘴崖下：整面崖壁（一路新的刮痕）、溪溝、亂石；頭燈卡在兩塊石頭中間、一塊有新斷面的石頭；救難隊的探照燈和發電機 ---------- */
  const below = { name:"鷹嘴崖下", w:288, h:150, wall:66,
    floor(p, g, t, o){ const n = N(o);
      // 崖壁（灰色岩石、青苔），從上到下一路新的刮痕
      p.R(0, 0, 288, 66, n ? "#2a2c2a" : "#7a7c74"); p.seed(25); for (let k = 0; k < 90; k++) p.R(p.rnd() * 288, p.rnd() * 62, 4 + p.rnd() * 8, 2, k % 3 ? (n ? "#222422" : "#6a6c64") : (n ? "#2a3e2a" : "#4a6a3a"));
      for (let k = 0; k < 4; k++) for (let y = 0; y < 62; y += 2) p.R(150 + k * 4 + Math.round(Math.sin(y / 7 + k) * 2), y, 1, 2, n ? "#6a6a64" : "#c8c8c0");
      p.R(0, 62, 288, 4, O);
      // 亂石灘
      p.R(0, 66, 288, 84, n ? "#2a2a28" : "#8a8678"); p.seed(26); for (let k = 0; k < 60; k++){ const x = p.rnd() * 288, y = 70 + p.rnd() * 50, w = 4 + p.rnd() * 8; p.R(x, y, w, 4, O); p.R(x + 1, y + 1, w - 2, 2, n ? "#4a4a46" : "#a8a49a"); }
      // 溪溝（水很冰、聲音很大）
      p.R(0, 124, 288, 20, n ? "#0e1a24" : "#4a7a9a"); for (let k = 0; k < 14; k++) p.R(((k * 23 + t * 20) % 300) - 10, 128 + (k % 4) * 4, 8, 1, n ? "#3a5a6a" : "#c8e0f0"); p.R(0, 123, 288, 1, O); p.R(0, 144, 288, 6, n ? "#2a2a28" : "#8a8678");
      // 往上的小路（左邊，從溪溝爬上去）
      p.R(10, 66, 30, 58, n ? "#3a3428" : "#8a7a58");
    },
    props:[
      // 頭燈卡在兩塊石頭中間
      { y:104, draw(p){ p.R(70, 94, 12, 10, O); p.R(71, 95, 10, 8, "#7a7a74"); p.R(92, 96, 10, 8, O); p.R(93, 97, 8, 6, "#7a7a74"); p.R(82, 97, 10, 6, O); p.R(83, 98, 8, 4, "#1e1e22"); p.R(84, 99, 3, 2, "#a8b0b8"); p.R(80, 99, 2, 1, "#c8302a"); p.R(92, 99, 2, 1, "#c8302a"); } },
      // 他（第一段：蓋著藍色的布）；第二段：封鎖線圍著
      { y:108, draw(p, g, t, o){ if (N(o)){ p.R(124, 92, 54, 16, O); p.R(125, 93, 52, 14, "#2a5ac8"); p.R(125, 93, 52, 2, "#3a7ae8"); p.R(170, 98, 6, 6, "#5a4a3a"); }
          else { for (const [x, y] of [[118, 88], [184, 88], [118, 112], [184, 112]]){ p.R(x, y, 3, 10, O); p.R(x + 1, y + 1, 1, 8, "#e9c43a"); } T.tape(p, 120, 90, 186, 90); T.tape(p, 120, 114, 186, 114); for (let k = 0; k < 40; k++) p.R(130 + k, 100 + Math.round(Math.sin(k / 6) * 3), 1, 1, "#f4f4f0"); } } },
      // 一塊西瓜大的石頭（一面青苔、一面新的斷面）
      { y:112, draw(p, g, t, o){ p.R(196, 98, 18, 14, O); p.R(197, 99, 16, 12, N(o) ? "#4a4e4a" : "#8a8e88"); p.R(197, 99, 8, 12, N(o) ? "#2e4a2e" : "#4a7a3a"); p.R(205, 99, 8, 12, N(o) ? "#7a7a74" : "#c8c8c0"); p.R(199, 102, 4, 2, "#5a4a3a"); } },
      // 救難隊的探照燈＋小發電機
      { y:100, draw(p, g, t, o){ T.box(p, 252, 84, 22, 10, 8, "#c8302a", "#8a2a1a"); p.R(256, 86, 14, 4, "#3a3a3a"); p.R(240, 70, 3, 26, O); p.R(234, 64, 16, 10, O); p.R(235, 65, 14, 8, "#5a5e64"); p.R(237, 66, 10, 6, N(o) ? "#fffce0" : "#c8ccd0");
          if (N(o)){ g.save(); g.globalAlpha = .18; g.fillStyle = "#fffce8"; g.beginPath(); g.moveTo(236, 66); g.lineTo(248, 66); g.lineTo(184, 0); g.lineTo(130, 0); g.fill(); g.restore(); } } }
    ],
    front(p, g, t, o){ tone(g, this, o, .65); fog(g, this, t, o, .8); },
    solid:[[68,92,36,14],[194,96,22,18],[250,82,26,22],[232,62,20,36],[0,120,288,30]],
    exits:[ { r:[10,66,30,8], to:"cliff", at:[150,136], label:"爬回鷹嘴彎道", kind:"up", art:[8,60,34,14] } ]
  };

  const spots = {
    o21_pack:[36,76,20,12,48,102,"camp",A("rummage",{ face:-1 })],
    o21_watchlog:[172,116,18,14,182,142,"camp",A("read")],
    o21_fire:[118,92,30,20,134,124,"camp",A("crouch")],
    o21_redbag:[224,70,28,18,256,108,"camp",A("look",{ face:-1 })],
    o21_sign:[110,44,36,22,128,90,"trail",A("read")],
    o21_photo_spot:[80,76,60,32,100,118,"trail",A("crouch")],
    o21_rope:[180,84,44,30,190,122,"cliff",A("crouch",{ face:1 })],
    o21_prints:[144,98,84,14,160,122,"cliff",A("crouch",{ face:1 })],
    o21_rock:[214,86,50,34,200,124,"cliff",A("look",{ face:1 })],
    o21_lamp:[68,92,36,14,86,114,"below",A("crouch")],
    o21_pocket:[122,90,58,20,150,116,"below",A("kneel")],
    o21_stone:[194,96,22,18,224,108,"below",A("crouch",{ face:-1 })],
    o21_wall:[140,0,30,62,160,74,"below",A("look")]
  };
  const details = {
    d21_boots:[28,88,16,10,30,104,"camp",A("crouch",{ face:1 })],
    d21_lantern:[194,38,16,34,186,82,"camp",A("look")],
    d21_trash:[204,120,18,18,230,130,"camp",A("look",{ face:-1 })],
    d21_kettle:[96,82,26,26,88,116,"camp",A("look",{ face:1 })],
    d21_reflector:[160,40,16,26,170,90,"trail",A("look")],
    d21_steps:[194,76,48,32,218,116,"trail",A("crouch")],
    d21_mossrock:[46,108,30,16,90,120,"trail",A("look",{ face:-1 })],
    d21_bend:[60,40,40,56,80,90,"cliff",A("look",{ face:-1 })],
    d21_toilet:[28,14,32,28,62,104,"cliff",A("look",{ face:-1 })],
    d21_post:[174,80,8,22,170,110,"cliff",A("look",{ face:1 })],
    d21_stream:[0,120,288,26,100,112,"below",A("look")],
    d21_light:[232,62,44,42,262,112,"below",A("look",{ face:1 })]
  };
  const place = {
    guanyu:[ { room:"camp", x:238, y:104, act:"sit", facing:-1, view:"side" }, null ],
    zhaosi:[ { room:"camp", x:112, y:116, act:"sit", facing:1, view:"side" }, { room:"camp", x:112, y:116, act:"sit", facing:1, view:"side" } ],
    yutong:[ { room:"camp", x:172, y:108, act:"cry", facing:-1 }, { room:"camp", x:172, y:108, act:"idle", facing:-1 } ],
    zhiming:[ { room:"camp", x:84, y:94, act:"idle", facing:-1 }, { room:"camp", x:84, y:94, act:"idle", facing:-1 } ],
    zhang:[ { room:"below", x:244, y:114, act:"idle", facing:-1 }, { room:"below", x:244, y:114, act:"idle", facing:-1 } ],
    kui:[ { room:"cliff", x:132, y:110, act:"kneel", facing:1 }, null ]
  };
  const EX = { cop21:{ room:"camp", x:246, y:126, act:"idle", facing:-1 } };
  const extras = (W0.extras || []).map(e => EX[e.id] ? { ...e, ...EX[e.id] } : e);
  const intro = [ { set:{ room:"camp", px:12, py:120 }, hide:true }, { wait:0.3, hide:true }, { set:{ room:"camp", px:60, py:124 } },
    ...(W0.intro || []).filter(k => k.say || (k.wait && !k.hide)).map(k => k.say && k.say[0] === "wu" && /點畫面上的箭嘴|📍|清單不是全部/.test(k.say[1]) ? null : k).filter(Boolean),
    { say:["wu", "想去哪裡，點畫面上的門口就會自己走過去。閃著星星的就是還沒看過的東西，按上面的「🧭 平面圖」看全部在哪裡。"], name:"小吳" } ];
  setLoc("mountain", { start:"camp", spawn:[60,124], rooms:{ camp, trail, cliff, below }, spots, details, place, extras, intro,
    plan:[ { name:"鷹嘴崖步道", w:100, h:22, rooms:{ camp:[0,0,34,22,"out"], trail:[34,0,33,22,"out"], cliff:[67,0,33,22,"out"] } },
           { name:"崖下", w:100, h:16, rooms:{ below:[60,0,40,16,"out"] } } ] });
})();

/* ================= 山下派出所、登山口雜貨店、鑑識中心、法醫室 ================= */
C21T && (() => {
  const { EP, T, O, sh, dA, ph, A, night, tone, fluo, vinyl, laminate, concrete, window2, setLoc } = C21T;
  const W0 = EP.world.station || {};

  /* ---------- 山下派出所・值班台：木頭值班台（電話、一台舊電腦、報修單）、手繪步道圖、三頂黃色安全帽、窗外就是上山的路、一張長椅 ---------- */
  const sdesk = { name:"值班台", w:256, h:140, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 58, "#e8e4d4", "plain", { base:"#3a5a7a" }); p.R(0, 36, 256, 17, "#c8d4dc");
      // 「澄港市警察局 山下派出所」
      p.R(80, 6, 70, 12, O); p.R(81, 7, 68, 10, "#3a5a8a"); for (let k = 0; k < 6; k++) p.R(85 + k * 10, 9, 7, 6, "#f4f4f0");
      // 手繪的步道圖（兩個紅叉）
      p.R(12, 8, 50, 40, O); p.R(13, 9, 48, 38, "#f4ecd8"); for (let k = 0; k < 24; k++) p.R(16 + k * 2, 20 + Math.round(Math.sin(k / 3) * 6), 2, 1, "#5a7a3a"); p.R(42, 22, 4, 4, "#c8302a"); p.R(48, 28, 4, 4, "#c8302a"); p.R(16, 38, 18, 1, "#3a3a3a");
      // 安全帽架（三頂黃色，最下面那頂帶子斷了）
      p.R(164, 10, 30, 3, O); for (let k = 0; k < 3; k++){ const y = 13 + k * 13; p.R(170, y, 18, 10, O); p.R(171, y + 1, 16, 8, "#e9c43a"); p.R(171, y + 1, 16, 2, "#f4dc6a"); p.R(174, y + 5, 10, 1, "#3a3a3a"); } p.R(180, 48, 1, 6, "#3a3a3a");
      // 窗（外面就是上山的路）
      window2(p, 204, 10, 44, 30, o, t, (x, y, w, h) => { p.R(x, y + h - 10, w, 10, "#5a5a5a"); p.R(x + 4, y + h - 6, w - 8, 1, "#e8e4d8"); p.R(x, y, w, 10, "#4a7a4a"); }, "#c8ccd0");
      // 往會客室的門（左牆）
      vinyl(p, 0, 58, 256, 82, "#b8b4a8", "#b0aca0", 16);
      T.sides(p, this, "#3a5a7a", [["L", 72, 40]]);
      T.sideDoor(p, this, "L", 72, 40, dA("sdesk", "smeet"), "#8a6a4a");
    },
    props:[
      // 值班台（電話、舊電腦、報修單、一份氣象預報、GPS 紀錄）
      { y:102, draw(p, g, t){ T.box(p, 80, 78, 110, 14, 12, "#8a6a4a", "#5a3a22"); p.R(150, 64, 22, 16, O); p.R(151, 65, 20, 12, "#c8c4b8"); p.R(152, 66, 18, 10, "#2a4a5a"); p.R(154, 68, 10, 1, "#6fd46f"); for (let k = 0; k < 8; k++) p.R(154 + k * 2, 74 - (k % 3), 1, 1, "#e9c43a");
          p.R(88, 80, 18, 10, O); p.R(89, 81, 16, 8, "#f4f0e6"); p.R(90, 82, 10, 1, "#c8302a"); p.R(90, 84, 12, 1, "#3a3a3a"); p.R(90, 86, 9, 1, "#3a3a3a");
          p.R(112, 80, 16, 10, O); p.R(113, 81, 14, 8, "#e8f0f4"); p.R(115, 83, 4, 3, "#3a8ad8"); p.R(120, 84, 5, 1, "#3a3a3a"); p.R(176, 80, 10, 8, O); p.R(177, 81, 8, 6, "#2a2a2e"); } },
      { y:74, draw(p){ T.chair(p, 134, 74, "#3a3a44", "down"); } },
      // 長椅（左下）
      { y:128, draw(p){ p.R(16, 114, 56, 4, O); p.R(17, 115, 54, 2, "#7a5a3a"); for (const x of [28, 52]) T.chair(p, x, 128, "#7a5a3a", "right"); } },
      // 一盆蘭花、飲水機
      { y:84, draw(p){ T.box(p, 214, 66, 16, 10, 14, "#f4f4f0", "#c8ccd0"); p.R(218, 54, 8, 13, O); p.R(219, 55, 6, 11, "#a8d0e8"); p.R(236, 70, 10, 10, O); p.R(237, 71, 8, 8, "#a8583a"); p.R(238, 62, 6, 9, "#3a7a3a"); p.R(239, 60, 3, 3, "#f4d8f0"); } }
    ],
    front(p, g, t, o){ fluo(p, 70, 2, 50); fluo(p, 190, 2, 50); tone(g, this, o, .3); },
    solid:[[78,76,114,30],[12,108,64,22],[210,50,40,34]],
    exits:[ { r:[0,72,8,40], to:"smeet", at:[184,96], label:"會客室", kind:"door", art:[0,70,8,44] } ]
  };

  /* ---------- 會客室：舊人造皮沙發（扶手破洞貼膠帶）、茶几（一杯沒喝的水、學生證影本）、月曆（鷹嘴的日出） ---------- */
  const smeet = { name:"會客室", w:208, h:128, wall:56,
    floor(p, g, t, o){
      T.backWall(p, 0, 208, 56, "#d8d4c4", "panel", { base:"#5a4a3a", panel:"#8a6a4a" });
      // 月曆：鷹嘴的日出
      p.R(140, 8, 28, 36, O); p.R(141, 9, 26, 34, "#f4f4ee"); p.R(141, 9, 26, 16, "#e8a84a"); p.R(141, 19, 26, 6, "#3a3a34"); p.R(150, 13, 6, 6, "#fff4c0"); for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) p.R(143 + c * 5, 28 + r * 4, 2, 2, "#8a8a8a");
      p.R(30, 10, 40, 26, O); p.R(31, 11, 38, 24, "#f4f0e6"); p.R(34, 14, 32, 3, "#3a5a8a"); for (let k = 0; k < 4; k++) p.R(34, 20 + k * 3, 28, 1, "#7a7a8a");   // 「為民服務」
      laminate(p, 0, 56, 208, 72, "#a88a62", "#9c7e58");
      T.sides(p, this, "#5a4a3a", [["R", 76, 40]]);
      T.sideDoor(p, this, "R", 76, 40, dA("smeet", "sdesk"), "#8a6a4a");
    },
    props:[
      // 舊沙發（扶手破一個洞、貼著膠帶）
      { y:80, draw(p){ T.box(p, 40, 70, 90, 14, 10, "#5a3a2a", "#3a2418"); p.R(40, 62, 90, 10, O); p.R(41, 63, 88, 8, "#4a2e20"); p.R(36, 64, 6, 28, O); p.R(37, 65, 4, 26, "#6a4a3a"); p.R(128, 64, 6, 28, O); p.R(129, 65, 4, 26, "#6a4a3a"); p.R(129, 70, 4, 6, "#c8c4b0"); } },
      // 茶几：一杯水（一口都沒喝）、學生證影本
      { y:108, draw(p){ T.box(p, 58, 92, 56, 12, 6, "#8a6a4a", "#5a3a22"); p.R(70, 86, 6, 10, O); p.R(71, 87, 4, 8, "rgba(220,235,240,.85)"); p.R(84, 94, 18, 8, O); p.R(85, 95, 16, 6, "#f4f4f0"); p.R(86, 96, 5, 4, "#c8b49a"); p.R(93, 96, 7, 1, "#3a3a3a"); } }
    ],
    front(p, g, t, o){ fluo(p, 104, 2, 46); tone(g, this, o, .3); },
    solid:[[34,60,102,14],[34,60,8,34],[128,60,8,34],[56,90,60,16]],
    exits:[ { r:[200,76,8,40], to:"sdesk", at:[24,90], label:"值班台", kind:"door", art:[200,74,8,44] } ]
  };
  setLoc("station", { start:"sdesk", spawn:[220,126], rooms:{ sdesk, smeet },
    spots:{ doc21_weather:[110,78,20,14,120,114,"sdesk",A("read")], doc21_gps:[148,62,26,18,160,114,"sdesk",A("type",{ actT:2 })], o21_repair:[86,78,22,14,96,114,"sdesk",A("read")], o21_map:[12,8,50,40,40,72,"sdesk",A("look")], o21_cup:[68,84,36,18,86,116,"smeet",A("look")] },
    details:{ d21_helmets:[164,8,30,48,178,72,"sdesk",A("look")], d21_window:[202,8,48,34,200,96,"sdesk",A("look",{ face:1 })], d21_calendar:[140,8,28,36,152,72,"smeet",A("look")], d21_sofa:[34,60,102,34,150,96,"smeet",A("look",{ face:-1 })] },
    place:{
      wang:[ null, { room:"sdesk", x:134, y:72, act:"sitText", facing:1, view:"front" } ],
      guanyu:[ null, { room:"sdesk", x:28, y:128, act:"sit", facing:1, view:"side" } ],
      father:[ null, { room:"smeet", x:86, y:84, act:"sit", facing:1, view:"front" } ]
    },
    extras:W0.extras || [],
    plan:[ { name:"山下派出所", w:100, h:24, rooms:{ smeet:[0,0,40,24], sdesk:[40,0,60,24] } } ] });

  /* ---------- 登山口雜貨店：收銀台後面一排電池（黃色大象、鹼性）、收據存根、掛著的可可粉、瓦斯罐、黃色雨衣、飲料冰箱 ---------- */
  const shop = { name:"登山口雜貨店", w:256, h:140, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 58, "#e8dcc0", "wood", { base:"#5a3a22" });
      // 收銀台後面的電池架（黃色大象＝便宜的碳鋅、旁邊是鹼性）
      p.R(120, 8, 50, 40, O); p.R(121, 9, 48, 38, "#8a6a4a"); for (let r = 0; r < 3; r++){ p.R(121, 20 + r * 12, 48, 2, "#5a3a22"); for (let k = 0; k < 6; k++){ const yel = k < 3; p.R(123 + k * 8, 10 + r * 12, 6, 9, O); p.R(124 + k * 8, 11 + r * 12, 4, 8, yel ? "#e9c43a" : "#3a6ac8"); if (yel) p.R(125 + k * 8, 13 + r * 12, 2, 2, "#8a8a8a"); } } p.R(156, 34, 12, 6, "#f4f0a8");
      // 掛著的可可粉、薑母茶、即溶咖啡（可可粉那一排少了兩包）
      p.R(186, 10, 56, 2, O); for (let c = 0; c < 4; c++) for (let r = 0; r < 3; r++){ if (c === 0 && r > 0) continue; p.R(188 + c * 14, 14 + r * 12, 10, 10, O); p.R(189 + c * 14, 15 + r * 12, 8, 8, ["#8a5a3a", "#c8a050", "#3a2a1a", "#c83a2a"][c]); p.R(190 + c * 14, 17 + r * 12, 6, 2, "#f4f0e0"); }
      // 黃色輕便雨衣（掛在牆上、積灰）
      for (let k = 0; k < 3; k++){ p.R(16 + k * 14, 12, 12, 26, O); p.R(17 + k * 14, 13, 10, 24, "#e9d84a"); p.R(17 + k * 14, 13, 10, 3, "rgba(200,190,170,.5)"); }
      concrete(p, 0, 58, 256, 82, "#9a968c", 21);
      T.sides(p, this, "#5a3a22", []);
    },
    props:[
      // 收銀台（收據存根、收銀機）
      { y:96, draw(p){ T.box(p, 110, 72, 80, 12, 12, "#a87a4a", "#6a4a2a"); p.R(116, 74, 20, 8, O); p.R(117, 75, 18, 6, "#f4f0e0"); p.R(119, 76, 12, 1, "#3a6ac8"); p.R(119, 78, 10, 1, "#3a3a3a"); p.R(160, 66, 20, 12, O); p.R(161, 67, 18, 10, "#3a3a44"); p.R(163, 68, 14, 4, "#6fd46f"); } },
      // 登山瓦斯罐的架子（少了兩罐）
      { y:110, draw(p){ T.box(p, 14, 76, 60, 12, 20, "#7a7e84", "#5a5e64"); for (let k = 0; k < 6; k++){ if (k === 2 || k === 3) continue; p.R(18 + k * 9, 70, 7, 10, O); p.R(19 + k * 9, 71, 5, 8, "#3a6ac8"); p.R(19 + k * 9, 71, 5, 2, "#c8ccd0"); } p.R(18, 90, 26, 4, "#f4f0e0"); } },
      // 飲料冰箱（玻璃門貼著「鷹嘴日出最佳時間」）
      { y:96, draw(p){ T.box(p, 214, 50, 34, 12, 34, "#e8ecec", "#c8ccd0"); p.R(217, 64, 28, 28, "#a8d0e0"); for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) p.R(219 + k * 7, 66 + r * 9, 5, 7, ["#3a8ad8", "#e9c43a", "#3aa84a", "#c8302a"][(k + r) % 4]); p.R(228, 80, 12, 6, "#f4f0e0"); } }
    ],
    front(p, g, t, o){ p.R(128, 0, 1, 6, O); p.R(120, 6, 17, 4, O); p.R(121, 7, 15, 2, "#f4f0c0"); T.glow(g, 128, 12, 50, "255,235,190", .1); tone(g, this, o, .3); },
    solid:[[108,70,84,30],[12,68,64,42],[212,48,38,50]],
    exits:[]
  };
  setLoc("store", { start:"shop", spawn:[114,128], rooms:{ shop },
    spots:{ o21_battshelf:[120,8,50,40,100,106,"shop",A("look",{ face:1 })], o21_stub:[114,72,24,12,124,106,"shop",A("read")], o21_cocoa:[186,10,56,40,200,106,"shop",A("look")] },
    details:{ d21_gas:[14,68,60,30,44,118,"shop",A("look")], d21_raincoat:[14,10,44,30,88,74,"shop",A("look",{ face:-1 })], d21_fridge:[212,48,38,50,202,108,"shop",A("look",{ face:1 })] },
    place:{ aying:[ null, { room:"shop", x:200, y:84, act:"idle", facing:-1 } ] },
    extras:(EP.world.store || {}).extras || [],
    plan:[ { name:"登山口雜貨店", w:100, h:22, rooms:{ shop:[0,0,100,22] } } ] });

  /* ---------- 鑑識中心：採證台上一個計時器、兩支一模一樣的頭燈（一支已經比較暗） ---------- */
  setLoc("lab", { start:"lab", spawn:[144,140],
    rooms:{ lab:CG_LAB(C21T, { props:[
      { y:106, draw(p, g, t){ p.R(40, 88, 12, 8, O); p.R(41, 89, 10, 6, "#f4f4f0"); p.R(43, 90, 6, 3, "#1e2226"); p.R(44, 91, 4, 1, "#e84a3a");
          for (const [x, b] of [[60, 1], [80, .5]]){ p.R(x, 88, 12, 8, O); p.R(x + 1, 89, 10, 6, "#2a2a2e"); p.R(x + 4, 90, 4, 4, b > .7 ? "#fffce0" : "#c8a85a"); T.glow(g, x + 6, 92, 10 * b + 4, b > .7 ? "255,255,230" : "220,180,90", .25 * b); } } }
    ] }) },
    spots:{ o21_timer:[38,84,58,14,66,114,"lab",A("look")] },
    details:{ d21_bags:[176,8,52,36,200,96,"lab",A("look")] },
    place:{ xu:[ null, { room:"lab", x:118, y:116, act:"read", facing:-1 } ], kui:[ null, { room:"lab", x:236, y:120, act:"read", facing:-1 } ] },
    extras:(EP.world.lab || {}).extras || [],
    plan:[ { name:"鑑識中心", w:100, h:20, rooms:{ lab:[0,0,100,20] } } ] });

  /* ---------- 法醫室 ---------- */
  setLoc("morgue", { start:"mroom", spawn:[128,140], rooms:{ mroom:CG_MORGUE(C21T, {}) },
    spots:{ doc21_autopsy:[44,110,26,14,56,140,"mroom",A("read",{ actT:1.6 })] },
    details:{ d21_bag:[182,74,30,12,196,106,"mroom",A("look")] },
    place:{ qian:[ null, { room:"mroom", x:150, y:104, act:"idle", facing:-1 } ] },
    plan:[ { name:"法醫室", w:100, h:30, rooms:{ mroom:[0,0,100,30] } } ] });
})();
