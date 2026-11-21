/* =========================================================
   第 43 集・俯視版（topdown.js）
   只有一個地點：港濱舊防空洞。外面：洞口（山壁、水泥的洞口和鐵門、鐵櫃、管理亭、右邊是海堤和海）、洞上面的山坡（第 3 段）；
   裡面由左到右：坑道 → 檔案室 → 倉庫 → 抽水機房 → 通風井。
   第 1 段（晚上）燈是亮的；第 2 段（洞裡）沒有電，只有手電筒，水一直漲（EP43_lv）；第 3 段（深夜）只看得到山坡和洞口。
   每一個房間的樣子，直接用劇情畫面的 opt(ph, has)（EP43.rooms），兩邊一定一樣。跟著你的是小吳（不畫）。
   ========================================================= */
const C43T = typeof TOPEP === "function" ? TOPEP("shelter") : null;

C43T && (() => {
  const { EP, T, O, sh, ph, dA, A, setLoc } = C43T;
  const W0 = EP.world.shelter || {};
  const got = id => typeof EP43_got === "function" && EP43_got(id);
  const ST = (id, o) => { try { const r = (EP.rooms.shelter || []).find(x => x.id === id); const f = r && r.opt; return (typeof f === "function" ? f(ph(o), got) : f) || {}; } catch (e){ return {}; } };
  const LV = id => (typeof EP43_lv === "function" ? EP43_lv(id) : 0);
  const DARK = o => ph(o) === 1;
  // 沒有電：整個壓暗，只有手電筒照到的地方
  const torch = (g, R, room) => { T.dim(g, R, .72, "#04060a"); const u = typeof TOPW !== "undefined" && TOPW.you && TOPW.you();
    if (u && u.room === room){ T.glow(g, u.x + (u.facing || 1) * 14, u.y - 10, 60, "255,245,215", .34); T.glow(g, u.x, u.y - 8, 26, "255,245,215", .16); } else T.glow(g, R.w / 2, R.h / 2 + 10, 70, "255,245,215", .22); };
  // 水：一層半透明的水蓋在地上（和人的腳上），越高越深
  const water = (p, g, R, t, lv) => { if (!lv) return; g.save(); g.globalAlpha = Math.min(.62, .2 + lv * .035); g.fillStyle = "#1a4a5a"; g.fillRect(6, R.wall, R.w - 12, R.h - R.wall); g.restore();
    g.save(); g.globalAlpha = .5; for (let k = 0; k < Math.round(R.w / 12); k++){ const x = 8 + ((k * 37 + Math.floor(t * 6) * 3) % (R.w - 24)), y = R.wall + 4 + (k * 23) % (R.h - R.wall - 10); p.R(x, y, 8, 1, "#6aaaba"); } g.restore();
    p.R(6, R.wall, R.w - 12, 1, "#5a9aaa"); };
  const concreteWall = (p, w, H, col) => { T.backWall(p, 0, w, H, col || "#8a8e88", "plain", { base:"#4a4e4a" }); for (let k = 0; k < Math.round(w / 9); k++) p.R((k * 47) % w, 6 + (k * 13) % (H - 14), 3 + k % 4, 1, sh(col || "#8a8e88", -.08)); };
  const floorC = (p, w, y, h, col) => { p.R(0, y, w, h, col || "#7a7c76"); PX.prim.seed(w + h); for (let k = 0; k < w * h / 40; k++) p.R(Math.floor(PX.prim.rnd() * w), y + Math.floor(PX.prim.rnd() * h), 1, 1, k % 2 ? sh(col || "#7a7c76", -.06) : sh(col || "#7a7c76", .06)); };
  const sea = (p, t, x, y, w, h, lift) => { p.R(x, y, w, h, "#0e1e2e"); for (let k = 0; k < 12; k++) p.R(x + ((k * 29 + Math.floor(t * 5) * 2) % (w - 8)), y + 3 + (k * 7) % (h - 5), 7, 1, "#2a4a6a"); };

  /* ---------- 洞口（晚上）：後面是山壁；水泥的洞口（牌子、厚鐵門、門框右邊的扣環）；右邊一個鐵網門的鐵櫃（手輪、指示牌），下面是涵管口；
     左邊的公布欄（潮汐表）、水泥長椅；管理亭（窗、外牆的總開關鐵箱、門上的巡查簿），亭子後面一小塊泥地；最右邊是海堤和海，堤防的尾巴有一盞釣魚的燈 ---------- */
  const mouth = { name:"防空洞的洞口", w:320, h:150, wall:70,
    floor(p, g, t, o){ const s = ST("mouth", o);
      // 天空、山壁
      p.R(0, 0, 320, 14, "#0a0e18"); for (let k = 0; k < 8; k++) p.R((k * 41 + 7) % 230, 2 + (k * 5) % 9, 1, 1, "#8a8aa0");
      p.R(0, 6, 236, 64, "#1e2a22"); for (let k = 0; k < 40; k++) p.R((k * 37) % 236, 8 + (k * 17) % 56, 6 + k % 5, 3, k % 3 ? "#26342a" : "#18221c");
      // 公布欄（潮汐表）
      p.R(12, 36, 30, 28, O); p.R(13, 37, 28, 26, "#6a5a42"); p.R(15, 39, 12, 16, "#f4f0e4"); for (let k = 0; k < 5; k++) p.R(16, 41 + k * 3, 10, 1, "#3a6ac8"); p.R(29, 40, 10, 10, "#f8f4e4"); p.R(30, 42, 8, 1, "#c83a2a"); p.R(30, 45, 7, 1, "#3a3a3a");
      // 水泥的洞口＋牌子
      p.R(58, 20, 84, 50, O); p.R(59, 21, 82, 49, "#8a8a84"); p.R(59, 21, 82, 3, "#a8a8a0"); p.R(72, 24, 56, 10, O); p.R(73, 25, 54, 8, "#5a6a5a"); for (let k = 0; k < 7; k++) p.R(76 + k * 7, 27, 5, 4, "#c8d0c0");
      // 鐵門
      const amt = s.shut ? 0 : (s.open || s.cutHasp) ? .55 : .3; T.backDoor(p, 84, 38, 30, 32, amt, "#4a5a5a", { frame:"#2a3232", inside:"#0a0c0c" });
      if (!s.cutHasp){ p.R(114, 52, 4, 5, O); p.R(115, 53, 2, 3, "#c8c8c0"); if (s.shut) { p.R(115, 57, 4, 5, O); p.R(116, 58, 2, 3, "#c8a040"); } }
      // 鐵櫃（鐵網門；手輪＋指示牌）＋涵管口
      p.R(124, 34, 22, 30, O); p.R(125, 35, 20, 28, "#5a6a6a"); p.R(127, 36, 16, 4, "#e8e4d0"); p.R(128 + (s.gateOpen ? 12 : 1), 37, 2, 2, "#c83a2a");
      p.R(129, 43, 12, 12, O); p.R(130, 44, 10, 10, "#8a5a3a"); p.R(134, 44, 2, 10, "#6a4a2a"); p.R(130, 48, 10, 2, "#6a4a2a"); p.R(134, 48, 2, 2, "#3a3a3a");
      if (s.chain){ for (let k = 0; k < 6; k++) p.R(130 + k * 2, 50 + (k % 2), 2, 1, "#c8c8c0"); p.R(140, 51, 3, 4, "#c8a040"); }
      if (s.cabOpen){ p.R(144, 35, 6, 28, O); p.R(145, 36, 4, 26, "#7a8a8a"); for (let y = 38; y < 62; y += 3) p.R(145, y, 4, 1, "#5a6a6a"); } else for (let y = 37; y < 62; y += 3) p.R(125, y, 20, 1, "rgba(160,180,180,.35)");
      p.R(126, 64, 18, 6, O); p.R(127, 65, 16, 5, "#141618"); if (s.gateOpen){ p.R(128, 66, 14, 3, "#2a5a6a"); p.R(130 + Math.floor(t * 8) % 8, 67, 4, 1, "#6aaaba"); }
      // 管理亭（窗、總開關、門＋巡查簿）
      p.R(160, 14, 68, 56, O); p.R(161, 15, 66, 55, "#b8b4a4"); p.R(158, 12, 72, 5, "#4a5a5a");
      p.R(166, 24, 20, 16, O); p.R(167, 25, 18, 14, "#1a2028"); p.R(176, 25, 1, 14, "#8a8a84");
      p.R(166, 46, 14, 14, O); p.R(167, 47, 12, 12, "#8a9094"); if (s.sw){ p.R(171, 52, 4, 6, "#c83a2a"); } else { p.R(171, 48, 4, 6, "#c83a2a"); }
      T.backDoor(p, 196, 28, 22, 42, 0, "#6a7a7a", { frame:"#3a4a4a" }); p.R(201, 34, 8, 10, O); p.R(202, 35, 6, 8, "#f4f0e4"); p.R(203, 37, 4, 1, "#3a3a3a");
      p.R(205, 18, 6, 4, "#f8e8a0");   // 門口的燈
      // 海堤＋海（右邊）
      sea(p, t, 236, 6, 84, 52); const tide = s.tide || 0; if (tide) p.R(236, 52 - tide, 84, tide, "#14283a"); p.R(236, 56, 84, 14, "#6a6a64"); p.R(236, 56, 84, 1, "#8a8a84"); p.R(256, 34, 64, 6, "#5a5a54"); p.R(256, 34, 64, 1, "#7a7a74");
      p.R(304, 26, 2, 8, "#3a3a3a"); p.R(302, 24, 6, 3, "#f8d070");
      // 地上：水泥的前庭、左下往南澳的路；亭子後面的泥地
      floorC(p, 320, 70, 80, "#5a5c58"); p.R(0, 128, 320, 22, "#34363a"); p.R(0, 128, 320, 1, "#4a4c4e"); for (let x = 12; x < 320; x += 36) p.R(x, 139, 16, 1, "#8a8a80"); p.R(230, 70, 40, 34, "#3a3228"); for (let k = 0; k < 10; k++) p.R(232 + (k * 7) % 36, 74 + (k * 11) % 28, 3, 1, "#2a2420");
      if (s.track){ for (let y = 74; y < 104; y += 3) p.R(246 + Math.round(Math.sin(y / 6) * 2), y, 2, 2, "#1e1a16"); p.R(240, 96, 10, 3, "#2a4a5a"); }
      if (s.trail){ for (let k = 0; k < 14; k++) p.R(228 - k * 6, 82 - (k < 6 ? k * 1 : 6) + (k % 2), 2, 1, "#2a4a5a"); }
      if (s.puddle){ p.R(128, 76, 18, 5, "#3a4a52"); p.R(131, 77, 4, 1, "#c8d8e0"); }
      if (s.ice){ p.R(128, 74, 10, 4, "#e8f0f4"); p.R(130, 73, 5, 1, "#f8fcff"); }
      if (s.butts){ [[172, 76], [176, 78], [169, 79]].forEach(([x, y]) => { p.R(x, y, 3, 1, "#f4f0e4"); p.R(x + 3, y, 1, 1, "#e8a040"); }); }
      if (s.chainDown){ for (let k = 0; k < 8; k++) p.R(118 + k * 2, 82 + (k % 2), 2, 1, "#a8a8a0"); p.R(134, 81, 3, 4, "#c8a040"); p.R(137, 84, 2, 1, "#c8a040"); }
      if (s.cutHasp){ p.R(108, 76, 5, 3, "#c8c8c0"); p.R(113, 76, 3, 3, "#c8a040"); }
      if (s.hose){ for (let x = 0; x < 84; x += 2) p.R(x, 104 + Math.round(Math.sin(x / 9) * 3), 2, 2, "#c83a2a"); }
      T.sides(p, this, "#2a2e2a", [["B", 0, 320]]);
    },
    props:[
      // 水泥長椅（平板）
      { y:88, draw(p, g, t, o){ T.box(p, 40, 78, 32, 6, 6, "#9a9a94", "#7a7a74"); if (ST("mouth", o).tablet){ p.R(48, 79, 10, 5, O); p.R(49, 80, 8, 3, "#3a5a8a"); } } }
    ],
    front(p, g, t, o){ T.dim(g, this, .4, "#060a14"); T.glow(g, 208, 22, 40, "255,230,170", .2); T.glow(g, 305, 26, 22, "255,220,150", .18); },
    solid:[[0,0,320,72],[40,76,32,14]],
    stage:{ row:[80, 250, 118], seats:[] },
    exits:[ { r:[84,70,30,6], to:"tunnel", at:[148,124], label:"鐵門（坑道）", kind:"door", art:[82,36,34,34] },
            { r:[0,72,6,48], to:"hill", at:[60,120], label:"上山的小路", kind:"out", art:[0,72,8,48] } ]
  };

  /* ---------- 防空洞上面的山坡（深夜）：草地、林投的樹叢、下山的小路（第 3 段有濕的腳印）、通風井的井口和圓鐵蓋（打開了就立在旁邊）、
     一支香菇頭的通風管；右邊往下看：海、堤防、釣魚的燈、管理亭的屋頂 ---------- */
  const hill = { name:"防空洞上面的山坡", w:288, h:150, wall:40,
    floor(p, g, t, o){ const s = ST("hill", o);
      p.R(0, 0, 288, 40, "#0a0e18"); for (let k = 0; k < 10; k++) p.R((k * 31 + 5) % 288, 3 + (k * 7) % 30, 1, 1, "#8a8aa0");
      p.R(150, 18, 138, 22, "#0e1e2e"); for (let k = 0; k < 8; k++) p.R(152 + ((k * 23 + Math.floor(t * 5)) % 130), 22 + (k * 5) % 16, 6, 1, "#2a4a6a"); p.R(170, 30, 118, 3, "#5a5a54"); p.R(274, 24, 2, 6, "#3a3a3a"); p.R(272, 22, 6, 3, "#f8d070");
      // 草地（坡）
      p.R(0, 40, 288, 110, "#24361e"); for (let k = 0; k < 140; k++) p.R((k * 37) % 288, 42 + (k * 23) % 106, 2, 1, k % 2 ? "#2e4426" : "#1c2c18");
      // 管理亭的屋頂（往下看）
      p.R(200, 120, 44, 24, O); p.R(201, 121, 42, 22, "#4a5a5a"); p.R(201, 121, 42, 2, "#5a6a6a");
      // 下山的小路
      for (let y = 100; y < 150; y++) p.R(18 + Math.round((y - 100) * .3), y, 26, 1, "#4a4232");
      for (let x = 44; x < 120; x++) p.R(x, 100 + Math.round(Math.sin(x / 14) * 2), 1, 14, "#4a4232");
      if (s.steps) for (let k = 0; k < 8; k++) p.R(108 - k * 9, 104 + (k % 2) * 3, 3, 2, "#2a4a5a");
      // 通風井的井口
      p.R(110, 68, 34, 28, O); p.R(111, 69, 32, 26, "#7a7a74"); p.R(115, 73, 24, 18, s.open ? "#0a0c0c" : "#5a4a3a");
      if (!s.open){ p.R(115, 73, 24, 18, "#5a4e42"); for (let k = 0; k < 6; k++) p.R(117 + k * 4, 75 + (k % 3) * 5, 3, 2, "#6a5a3a"); p.R(126, 81, 2, 2, "#3a3a3a"); }
      else { p.R(146, 62, 6, 30, O); p.R(147, 63, 4, 28, "#5a4e42"); }
      T.sides(p, this, "#1a2416", [["L", 0, 0]]);
    },
    props:[
      // 林投的樹叢
      { y:80, draw(p){ for (let k = 0; k < 7; k++){ const x = 8 + k * 9, y = 52 + (k % 3) * 8; p.R(x, y, 12, 18, O); p.R(x + 1, y + 1, 10, 16, k % 2 ? "#2a5a2a" : "#3a6a32"); p.R(x + 4, y - 3, 2, 6, "#4a7a3a"); } } },
      // 通風管（香菇頭）
      { y:88, draw(p){ p.R(176, 64, 10, 24, O); p.R(177, 65, 8, 22, "#8a8e90"); p.R(172, 58, 18, 8, O); p.R(173, 59, 16, 6, "#a8acb0"); } }
    ],
    front(p, g, t, o){ T.dim(g, this, .4, "#060a14"); T.glow(g, 274, 24, 20, "255,220,150", .16); },
    solid:[[0,0,288,42],[6,48,66,30],[110,68,34,28],[174,60,14,28]],
    exits:[ { r:[18,144,30,6], to:"mouth", at:[24,96], label:"下山的小路（洞口）", kind:"out", art:[18,140,30,10] } ]
  };

  /* ---------- 坑道：鐵門在後面（下面的牆）；後面的牆：內閘的槽（鐵板吊著／放下來）、水位尺（黃漆、刀刻的一道、紅漆）、緊急照明燈（箱子）、
     野戰電話、「避難容量 120 人」、靠牆的長椅；地上一條排水溝（鐵柵），鐵門旁邊那一頭第 2 段在冒水；右邊往檔案室 ---------- */
  const tunnel = { name:"坑道", w:288, h:144, wall:60,
    floor(p, g, t, o){ const s = ST("tunnel", o);
      concreteWall(p, 288, 60, "#8a8e86"); p.R(0, 0, 288, 6, "#6a6e66");
      // 內閘的槽＋鐵板
      p.R(30, 6, 18, 54, O); p.R(31, 7, 16, 53, "#3a3e3c"); if (s.drop){ p.R(31, 36, 16, 24, "#6a6e70"); p.R(31, 36, 16, 1, "#8a8e90"); } else { p.R(31, 8, 16, 22, "#6a6e70"); p.R(31, 29, 16, 1, "#4a4e50"); }
      // 水位尺
      p.R(72, 8, 8, 52, O); p.R(73, 9, 6, 51, "#f4f4f0"); for (let y = 12; y < 60; y += 5) p.R(73, y, 3, 1, "#3a3a3a"); p.R(73, 36, 6, 2, "#e8c040"); p.R(73, 27, 6, 1, "#5a5a5a"); p.R(73, 22, 6, 2, "#c83a2a"); p.R(69, 2, 14, 5, O); p.R(70, 3, 12, 3, "#e8e4d0");
      // 緊急照明燈（箱子）
      p.R(120, 14, 20, 8, O); p.R(121, 15, 18, 6, "#e8e4d8"); p.R(122, 10, 5, 5, "#f8f0c0"); p.R(133, 10, 5, 5, "#f8f0c0"); if (s.boxOpen){ p.R(121, 22, 18, 4, O); p.R(122, 23, 16, 2, "#5a5a5a"); } else p.R(128, 18, 4, 2, "#c83a2a");
      // 野戰電話
      p.R(152, 22, 10, 14, O); p.R(153, 23, 8, 12, "#4a5a3a"); p.R(154, 25, 6, 3, "#2a3a2a"); p.R(162, 26, 2, 5, "#3a3a3a");
      // 容量的牌子
      p.R(176, 8, 42, 12, O); p.R(177, 9, 40, 10, "#3a4a3a"); p.R(180, 12, 34, 1, "#e8e4d0"); p.R(180, 15, 22, 1, "#e8e4d0");
      // 地上＋排水溝（鐵柵）
      floorC(p, 288, 60, 84, "#6a6c66"); p.R(0, 108, 288, 10, O); p.R(0, 109, 288, 8, "#2a2c2a"); for (let x = 1; x < 288; x += 3) p.R(x, 109, 1, 8, "#5a5c58");
      if (s.gush){ p.R(100, 110, 30, 6, "#3a7a8a"); for (let k = 0; k < 6; k++) p.R(104 + ((k * 7 + Math.floor(t * 10)) % 22), 109 + (k % 3) * 2, 3, 1, "#a8e0e8"); }
      T.sides(p, this, "#3a3c38", [["R", 70, 34], ["B", 100, 48]]);
      // 鐵門（下面的牆）：第 1 段開一半
      p.R(100, 139, 48, 5, "#1e2424"); p.R(100, 137, Math.round(48 * (s.ajar ? .45 : 1)), 7, "#4a5a5a"); p.R(100, 137, Math.round(48 * (s.ajar ? .45 : 1)), 1, "#6a7a7a");
    },
    props:[
      // 靠牆的長椅
      { y:74, draw(p){ T.box(p, 172, 62, 46, 6, 6, "#8a6a42", "#5a4028", { legs:2 }); for (let x = 176; x < 216; x += 9) p.R(x, 63, 1, 4, "#6a4a2e"); } }
    ],
    front(p, g, t, o){ const lv = LV("tunnel"); water(p, g, this, t, lv); if (DARK(o)) torch(g, this, "tunnel"); else { T.glow(g, 130, 30, 80, "255,245,220", .12); T.dim(g, this, .12); } },
    solid:[[0,0,288,62],[172,60,46,16]],
    exits:[ { r:[100,138,48,6], to:"mouth", at:[99,82], label:"鐵門（洞口）", kind:"out", art:[100,134,48,10] },
            { r:[282,70,6,34], to:"files", at:[24,96], label:"檔案室", kind:"door", art:[280,68,8,38] } ]
  };

  /* ---------- 檔案室（地板比坑道高兩階）：牆上的月曆（民國 104 年 7 月）、桌子（移交清冊、檯燈）；四排密集櫃（從後面的牆往前，每一排頭上一支搖把），
     櫃頂一排紙箱；推開以後第 2、3 排中間讓出一條走道，第 3 排拉出一個抽屜；牆邊的舊鐵櫃（四個抽屜；拿走了就是空的格子）；右邊往倉庫 ---------- */
  const files = { name:"檔案室", w:256, h:144, wall:56,
    floor(p, g, t, o){ const s = ST("files", o);
      concreteWall(p, 256, 56, "#a8aca4");
      p.R(14, 12, 14, 18, O); p.R(15, 13, 12, 16, "#f4f0e4"); p.R(15, 13, 12, 4, "#c83a2a"); for (let k = 0; k < 3; k++) p.R(16, 19 + k * 3, 10, 1, "#9a9a9a"); p.R(22, 25, 3, 2, "#c83a2a");
      floorC(p, 256, 56, 88, "#8a8c86");
      // 門口的兩階
      p.R(0, 84, 14, 30, "#6a6c66"); p.R(7, 84, 1, 30, "#4a4c48");
      // 櫃頂的紙箱（靠後面的牆）
      for (let k = 0; k < 8; k++){ p.R(66 + k * 12, 6, 11, 10, O); p.R(67 + k * 12, 7, 9, 8, "#b8945a"); p.R(67 + k * 12, 10, 9, 1, "#d8c890"); }
      T.sides(p, this, "#4a4c48", [["L", 84, 30], ["R", 84, 30]]);
    },
    props:[
      // 桌子（移交清冊、檯燈）
      { y:86, draw(p, g, t, o){ T.box(p, 18, 66, 36, 12, 8, "#7a6a52", "#5a4a38", { legs:2 }); p.R(22, 67, 14, 9, O); p.R(23, 68, 6, 7, "#e8e0c8"); p.R(29, 68, 6, 7, "#e8e0c8"); p.R(28, 68, 1, 7, "#3a3a3a");
          p.R(42, 62, 6, 4, O); p.R(43, 63, 4, 2, "#2a5a3a"); p.R(44, 66, 2, 8, "#3a3a3a"); if (ph(o) === 0) T.glow(g, 45, 68, 18, "255,240,190", .2); } },
      // 四排密集櫃
      { y:112, draw(p, g, t, o){ const s = ST("files", o), xs = s.aisle ? [64, 86, 116, 138] : [64, 86, 108, 130];
          xs.forEach((x, i) => { T.box(p, x, 18, 20, 80, 12, "#9aa4a8", "#7a8488"); for (let y = 22; y < 96; y += 8) p.R(x + 2, y, 16, 1, "#7a8488"); p.R(x + 7, 50 - 30, 6, 2, "#e8e4d0");
            if (!(i === 0 && s.noCrank)){ p.R(x + 6, 104, 8, 8, O); p.R(x + 7, 105, 6, 6, "#5a5e60"); p.R(x + 9, 103, 2, 4, "#c8c8c0"); }
            if (i === 2 && s.aisle){ p.R(x - 8, 70, 10, 8, O); p.R(x - 7, 71, 8, 6, "#e8e0c8"); } }); } },
      // 牆邊的鐵櫃（四個抽屜）
      { y:72, draw(p, g, t, o){ const s = ST("files", o); T.box(p, 196, 24, 24, 10, 36, "#7a8a8a", "#5a6a6a"); for (let k = 0; k < 4; k++){ p.R(198, 35 + k * 9, 20, 8, s.taken ? "#1a1e1e" : "#6a7a7a"); if (!s.taken) p.R(205, 38 + k * 9, 6, 1, "#c8c8c0"); } } }
    ],
    front(p, g, t, o){ const lv = LV("files"); water(p, g, this, t, lv); if (DARK(o)) torch(g, this, "files"); else T.dim(g, this, .14); },
    solid:[[0,0,256,58],[18,64,36,22],[64,16,86,98],[196,22,24,52]],
    exits:[ { r:[0,84,6,30], to:"tunnel", at:[264,88], label:"坑道", kind:"door", art:[0,82,8,34] },
            { r:[250,84,6,30], to:"store", at:[24,96], label:"倉庫", kind:"door", art:[248,82,8,34] } ]
  };

  /* ---------- 倉庫：牆角一堆沙包（最上面那一包破了會漏沙）、牆上的財產清冊、地上一綑舊簿子（黑色的粗橡皮帶；拿走了就散開）、
     三層的鐵架：上層一排鋼盔、中層的硬皮簿子和紅色的手搖警報器、下層三個藍色的飲用水桶；右邊往抽水機房 ---------- */
  const store = { name:"倉庫", w:256, h:144, wall:56,
    floor(p, g, t, o){ const s = ST("store", o);
      concreteWall(p, 256, 56, "#9a9e96");
      p.R(70, 12, 18, 22, O); p.R(71, 13, 16, 20, "#f4ecd8"); p.R(71, 13, 16, 3, "#3a5a3a"); for (let k = 0; k < 5; k++) p.R(73, 18 + k * 3, 12, 1, "#7a7a7a");
      floorC(p, 256, 56, 88, "#7a7c76");
      if (s.torn){ p.R(40, 78, 14, 4, "#c8b890"); p.R(44, 82, 6, 2, "#c8b890"); }
      if (s.noBelt){ [[100, 92], [110, 96], [94, 100], [116, 88]].forEach(([x, y]) => { p.R(x, y, 10, 7, O); p.R(x + 1, y + 1, 8, 5, "#a8784a"); }); }
      T.sides(p, this, "#4a4c48", [["L", 84, 30], ["R", 84, 30]]);
    },
    props:[
      // 沙包
      { y:80, draw(p, g, t, o){ const s = ST("store", o); for (let r = 0; r < 3; r++) for (let c = 0; c < 4 - r; c++){ const x = 14 + c * 12 + r * 6, y = 70 - r * 6; p.R(x, y, 12, 8, O); p.R(x + 1, y + 1, 10, 6, "#8a8270"); p.R(x + 1, y + 1, 10, 1, "#a89e88"); }
          if (s.torn){ p.R(27, 58, 10, 5, "#5a5444"); } } },
      // 一綑舊簿子（橡皮帶）
      { y:104, draw(p, g, t, o){ if (ST("store", o).noBelt) return; p.R(98, 88, 22, 14, O); p.R(99, 89, 20, 12, "#a8784a"); for (let y = 91; y < 100; y += 3) p.R(99, y, 20, 1, "#8a5a3a"); p.R(108, 88, 3, 14, "#1e1e1e"); } },
      // 三層的鐵架
      { y:66, draw(p){ T.box(p, 140, 10, 76, 12, 44, "#8a8e90", "#6a6e70"); p.R(142, 23, 72, 1, "#5a5e60"); p.R(142, 37, 72, 1, "#5a5e60"); p.R(142, 51, 72, 1, "#5a5e60");
          for (let k = 0; k < 5; k++){ p.R(144 + k * 9, 14, 8, 6, O); p.R(145 + k * 9, 15, 6, 4, "#4a5a3a"); }
          p.R(146, 28, 12, 8, O); p.R(147, 29, 10, 6, "#3a3a3a"); p.R(148, 30, 8, 1, "#c8c0a0");
          p.R(170, 26, 18, 11, O); p.R(171, 27, 16, 9, "#c83a2a"); p.R(175, 29, 8, 5, "#e8e8e4"); p.R(187, 28, 4, 2, "#3a3a3a");
          for (let k = 0; k < 3; k++){ p.R(146 + k * 20, 40, 16, 11, O); p.R(147 + k * 20, 41, 14, 9, "#2a6ac8"); p.R(150 + k * 20, 43, 8, 3, "#e8f0f8"); } } }
    ],
    front(p, g, t, o){ const lv = LV("store"); water(p, g, this, t, lv); if (DARK(o)) torch(g, this, "store"); else T.dim(g, this, .14); },
    solid:[[0,0,256,58],[14,58,48,22],[98,88,22,14],[140,10,76,58]],
    exits:[ { r:[0,84,6,30], to:"files", at:[232,96], label:"檔案室", kind:"door", art:[0,82,8,34] },
            { r:[250,84,6,30], to:"pump", at:[30,100], label:"抽水機房", kind:"door", art:[248,82,8,34] } ]
  };

  /* ---------- 抽水機房（整個洞最低的地方，門口往下三階）：抽水機架在很高的水泥台上（管子往上穿過天花板）、牆上鐵架上的手搖發電機（大小兩個皮帶輪；
     裝上搖把／皮帶／電線以後才會動）、「備用電源」的接頭、內閘控制箱（有電的時候面板亮；放下以後綠燈）；地上的抽水坑（鐵柵）；右邊往通風井 ---------- */
  const pump = { name:"抽水機房", w:256, h:144, wall:56,
    floor(p, g, t, o){ const s = ST("pump", o);
      concreteWall(p, 256, 56, "#8a8e86");
      // 發電機（牆上的鐵架）
      p.R(100, 34, 34, 2, "#3a3a3a"); p.R(102, 36, 2, 8, "#3a3a3a"); p.R(130, 36, 2, 8, "#3a3a3a");
      p.R(104, 22, 26, 12, O); p.R(105, 23, 24, 10, "#4a6a4a"); for (let a = 0; a < 16; a++){ const q = a / 16 * Math.PI * 2; p.R(Math.round(108 + Math.cos(q) * 6), Math.round(18 + Math.sin(q) * 6), 1, 1, "#2a2a2a"); }
      p.R(122, 24, 5, 5, O); p.R(123, 25, 3, 3, "#5a5a5a");
      if (s.belt){ p.R(108, 12, 16, 1, "#1e1e1e"); p.R(108, 24, 16, 1, "#1e1e1e"); }
      if (s.crank){ const a = Math.floor(t * 4) % 4; p.R(107, 17, 2, 2, "#c8c8c0"); p.R(108 + [8, 0, -8, 0][a], 18 + [0, 8, 0, -8][a], 2, 2, "#c8c8c0"); }
      // 備用電源的接頭
      p.R(138, 24, 8, 8, O); p.R(139, 25, 6, 6, "#c8c8c0"); p.R(141, 27, 2, 2, "#3a3a3a"); if (s.cable){ for (let k = 0; k < 10; k++) p.R(130 + (k % 2), 30 + k * 2, 2, 2, "#e8823a"); }
      // 內閘控制箱
      p.R(152, 8, 26, 30, O); p.R(153, 9, 24, 28, "#8a9094"); p.R(155, 11, 20, 7, "#e8e4d0"); p.R(156, 13, 18, 1, "#3a3a3a"); p.R(156, 15, 12, 1, "#c83a2a");
      p.R(156, 22, 18, 6, s.power ? "#1a3a2a" : "#1e1e22"); if (s.power) p.R(157, 24, 3, 2, "#4ae06a"); for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) p.R(156 + c * 5, 30 + r * 3, 3, 2, "#5a5a5a");
      p.R(171, 22, 4, 4, s.done ? "#4ae06a" : "#5a2a2a");
      // 地上：比門口低三階；抽水坑
      floorC(p, 256, 56, 88, "#6a6c66"); p.R(6, 84, 22, 30, "#7a7c76"); p.R(12, 84, 1, 30, "#5a5c58"); p.R(18, 84, 1, 30, "#5a5c58");
      p.R(74, 112, 60, 12, O); p.R(75, 113, 58, 10, "#1e2020"); for (let x = 76; x < 133; x += 3) p.R(x, 113, 1, 10, "#5a5c58");
      T.sides(p, this, "#4a4c48", [["L", 84, 30], ["R", 84, 30]]);
    },
    props:[
      // 抽水機（很高的水泥台）＋往上的管子
      { y:86, draw(p){ T.box(p, 30, 50, 52, 20, 16, "#9a9a94", "#7a7a74"); p.R(36, 40, 40, 16, O); p.R(37, 41, 38, 14, "#3a7a4a"); p.R(37, 41, 38, 2, "#5a9a6a"); p.R(54, 0, 6, 42, O); p.R(55, 0, 4, 42, "#5a7a5a"); p.R(70, 54, 5, 30, O); p.R(71, 55, 3, 29, "#5a7a5a"); p.R(42, 45, 10, 6, "#e8e4d0"); } }
    ],
    front(p, g, t, o){ const lv = LV("pump"); water(p, g, this, t, lv); if (DARK(o)) { torch(g, this, "pump"); if (ST("pump", o).power) T.glow(g, 160, 24, 22, "120,255,150", .2); } else T.dim(g, this, .14); },
    solid:[[0,0,256,58],[30,48,52,38]],
    exits:[ { r:[0,84,6,30], to:"store", at:[232,96], label:"倉庫", kind:"door", art:[0,82,8,34] },
            { r:[250,84,6,30], to:"shaft", at:[24,100], label:"通風井", kind:"door", art:[248,82,8,34] } ]
  };

  /* ---------- 通風井：牆上以前的一條水痕；直直往上的井（比牆暗），鐵梯的兩根直桿，上面還有幾根橫桿，下面兩公尺的橫桿都斷了；
     卡上四個抽屜以後就是踏階；井頂的圓鐵蓋（打開了看得到天空）；地上幾截鏽斷的鐵條；右邊一台手搖送風機 ---------- */
  const shaft = { name:"通風井", w:224, h:144, wall:70,
    floor(p, g, t, o){ const s = ST("shaft", o);
      concreteWall(p, 224, 70, "#7a7e78"); p.R(6, 40, 84, 1, "#6a6e68"); for (let x = 8; x < 90; x += 6) p.R(x, 42 + (x % 4), 3, 1, "#727670");
      // 井（比牆暗）＋鐵梯
      p.R(92, 0, 40, 70, O); p.R(93, 0, 38, 70, "#2a2e2c"); p.R(93, 0, 38, 6, s.open ? "#1a2232" : "#3a3a36"); if (s.open){ p.R(100, 1, 1, 1, "#c8c8e0"); p.R(120, 3, 1, 1, "#c8c8e0"); }
      p.R(100, 0, 2, 70, "#6a5a4a"); p.R(122, 0, 2, 70, "#6a5a4a"); [8, 14, 20, 26].forEach(y => p.R(102, y, 20, 1, "#6a5a4a")); [38, 48, 58].forEach(y => { p.R(102, y, 2, 1, "#8a4a2a"); p.R(120, y, 2, 1, "#8a4a2a"); });
      if (s.steps) [36, 46, 56, 66].forEach(y => { p.R(102, y - 2, 20, 4, O); p.R(103, y - 1, 18, 2, "#6a7a7a"); });
      floorC(p, 224, 70, 74, "#6a6c66");
      // 地上鏽斷的鐵條
      [[96, 82, 10], [110, 86, 8], [100, 90, 12]].forEach(([x, y, w]) => p.R(x, y, w, 1, "#8a4a2a"));
      T.sides(p, this, "#3a3c38", [["L", 84, 30]]);
    },
    props:[
      // 手搖送風機
      { y:98, draw(p){ T.box(p, 160, 66, 34, 14, 18, "#5a6a5a", "#4a5a4a"); for (let a = 0; a < 18; a++){ const q = a / 18 * Math.PI * 2; p.R(Math.round(177 + Math.cos(q) * 6), Math.round(72 + Math.sin(q) * 5), 1, 1, "#2a2a2a"); } p.R(190, 74, 6, 2, "#8a4a2a"); } }
    ],
    front(p, g, t, o){ const lv = LV("shaft"); water(p, g, this, t, lv); if (DARK(o)) torch(g, this, "shaft"); else T.dim(g, this, .16); },
    solid:[[0,0,224,72],[160,64,34,34]],
    exits:[ { r:[0,84,6,30], to:"pump", at:[232,100], label:"抽水機房", kind:"door", art:[0,82,8,34] } ]
  };

  const XP = {};
  setLoc("shelter", {
    get start(){ const p = typeof EP43_ph === "function" ? EP43_ph() : 0; return p === 2 ? ((typeof EP43_out === "function" && EP43_out()) ? "hill" : "mouth") : p === 1 ? "tunnel" : "mouth"; },
    get spawn(){ const p = typeof EP43_ph === "function" ? EP43_ph() : 0; return p === 2 ? ((typeof EP43_out === "function" && EP43_out()) ? [60, 120] : [148, 124]) : p === 1 ? [140, 96] : [148, 124]; },
    rooms:{ mouth, hill, tunnel, files, store, pump, shaft },
    spots:{
      doc43_tide:[12,36,30,28,28,96,"mouth",A("read")],
      doc43_patrol:[200,33,10,12,206,94,"mouth",A("read")],
      o43_door0:[84,38,30,32,98,92,"mouth",A("look")],
      o43_cab0:[124,34,22,30,136,92,"mouth",A("look")],
      o43_culv0:[126,62,18,8,138,94,"mouth",A("crouch")],
      o43_lock:[104,72,16,10,104,92,"mouth",A("crouch")],
      o43_wheel:[124,34,22,30,136,92,"mouth",A("look")],
      o43_cut:[116,79,24,8,126,96,"mouth",A("crouch")],
      o43_ice:[126,72,14,8,146,92,"mouth",A("crouch")],
      o43_trail:[150,76,80,12,190,100,"mouth",A("crouch")],
      o43_butts:[166,74,14,8,174,94,"mouth",A("crouch")],
      o43_track:[230,72,40,32,250,112,"mouth",A("crouch")],
      o43_switch:[166,46,14,14,174,92,"mouth",A("look")],
      doc43_file:[46,77,14,8,58,100,"mouth",A("read")],
      o43_hatch2:[110,68,34,28,128,108,"hill",A("crouch")],
      o43_view:[196,18,92,40,220,74,"hill",A("look")],
      o43_path:[30,96,90,20,76,124,"hill",A("crouch")],
      o43_gauge:[72,8,8,52,84,82,"tunnel",A("look")],
      o43_trench:[60,106,60,12,76,128,"tunnel",A("crouch")],
      o43_door:[100,134,48,10,124,124,"tunnel",A("look",{ face:1 })],
      o43_inflow:[100,106,30,12,116,128,"tunnel",A("crouch")],
      o43_cable:[120,10,20,16,130,82,"tunnel",A("look")],
      o43_phone:[150,20,14,18,158,82,"tunnel",A("phone")],
      o43_index:[20,66,18,10,30,98,"files",A("read")],
      o43_shelves:[64,16,86,96,158,104,"files",A("look",{ face:-1 })],
      o43_card:[106,68,14,12,104,124,"files",A("read")],
      o43_crank:[68,102,12,10,74,124,"files",A("crouch")],
      o43_drawers:[196,22,24,52,208,86,"files",A("look")],
      doc43_inv:[70,12,18,22,80,74,"store",A("read")],
      doc43_log:[144,26,16,12,152,80,"store",A("read")],
      o43_sandbags:[14,58,48,22,40,92,"store",A("crouch")],
      o43_belt:[96,86,26,18,108,118,"store",A("crouch")],
      o43_pump:[30,38,52,48,56,100,"pump",A("look")],
      o43_gen2:[100,10,34,34,116,74,"pump",A("look")],
      o43_box:[152,8,26,14,164,74,"pump",A("read")],
      o43_code:[152,20,26,18,166,76,"pump",A("type",{ actT:2 })],
      o43_ladder:[92,0,40,70,112,84,"shaft",A("look")],
      o43_steps:[100,30,24,40,104,86,"shaft",A("reach")],
      o43_hatch:[92,0,40,10,120,86,"shaft",A("reach")]
    },
    details:{
      d43_plate:[72,24,56,10,72,94,"mouth",A("look")],
      d43_bench:[40,76,32,10,76,98,"mouth",A("look")],
      d43_boothwin:[166,24,20,16,184,92,"mouth",A("look")],
      d43_sw0:[166,46,14,14,170,94,"mouth",A("look")],
      d43_far:[296,20,16,16,290,86,"mouth",A("look",{ face:1 })],
      d43_sea:[236,8,84,44,276,86,"mouth",A("look",{ face:1 })],
      d43_puddle:[126,74,22,8,150,96,"mouth",A("crouch")],
      d43_doorin:[100,134,48,10,130,126,"tunnel",A("look")],
      d43_cap:[176,8,42,12,196,82,"tunnel",A("read")],
      d43_seat:[172,60,46,16,196,88,"tunnel",A("look")],
      d43_lightbox:[120,8,20,18,140,82,"tunnel",A("look")],
      d43_phone0:[150,20,14,18,160,84,"tunnel",A("look")],
      d43_plate2:[30,6,18,54,40,82,"tunnel",A("look")],
      d43_cal:[14,12,14,18,22,96,"files",A("read")],
      d43_boxes:[66,6,96,10,170,70,"files",A("look",{ face:-1 })],
      d43_lamp:[42,60,8,14,52,96,"files",A("look")],
      d43_cab0:[196,22,24,52,210,88,"files",A("look")],
      d43_helmets:[142,12,46,10,166,80,"store",A("look")],
      d43_siren:[170,26,20,12,180,82,"store",A("look")],
      d43_bundle:[96,86,26,18,110,120,"store",A("look")],
      d43_sand0:[14,58,48,22,44,94,"store",A("look")],
      d43_drums:[144,38,62,14,190,82,"store",A("look")],
      d43_pit:[74,112,60,12,104,132,"pump",A("look")],
      d43_pipe:[54,0,8,40,66,100,"pump",A("look")],
      d43_deep:[250,84,6,30,236,100,"pump",A("look",{ face:1 })],
      d43_socket:[138,24,8,8,146,74,"pump",A("look")],
      d43_fan:[160,64,34,34,176,110,"shaft",A("look")],
      d43_rust:[94,80,20,12,90,104,"shaft",A("look")],
      d43_stain:[6,36,70,8,40,90,"shaft",A("look")],
      d43_vent:[172,56,18,32,182,104,"hill",A("look")],
      d43_bush:[6,48,66,30,40,92,"hill",A("look",{ face:-1 })]
    },
    place:{
      xu:[ { room:"tunnel", x:92, y:84, act:"look", facing:-1 }, { room:"files", x:40, y:100, act:"idle", facing:1 }, { room:"mouth", x:60, y:108, act:"kneel", facing:1 } ],
      lai:[ null, null, { room:"mouth", x:30, y:100, act:"idle", facing:1 } ],
      gao:[ null, null, { room:"mouth", x:168, y:110, act:"idle", facing:-1 } ],
      kun:[ null, null, { room:"mouth", x:214, y:104, act:"idle", facing:-1 } ]
    },
    extras:(W0.extras || []).map(e => Object.assign({}, e, XP[e.id] || {})),
    intro:[ { set:{ room:"mouth", px:148, py:124 } }, ...(W0.intro || []).filter(k => k.say || (k.wait && !k.hide)) ],
    plan:[ { name:"港濱舊防空洞", w:100, h:40, rooms:{ hill:[0,0,30,14,"out"], mouth:[0,14,30,26,"out"], tunnel:[30,22,20,18], files:[50,22,16,18], store:[66,22,12,18], pump:[78,22,12,18], shaft:[90,22,10,18] } } ] });
})();
