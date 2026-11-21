/* =========================================================
   第 30 集・俯視版（topdown.js）
   小吳家（客廳、小瑩的房間）、海風咖啡（共用劇情畫面的騎樓座位，晚上）、刑事大隊（三樓指揮所、樓下值班台）、
   阿珠冰店（店裡＝第 23 集同一間、門口＝第 28 集的舊碼頭路口）、冰店後面的巷子。三段都是晚上，寒流、風很大。
   第 31 集會再用到：小吳家、指揮所、值班台、後巷（window.WU30）。
   ========================================================= */
const C30T = typeof TOPEP === "function" ? TOPEP("exchange") : null;

/* ================= 小吳家 ================= */
C30T && (() => {
  const { EP, T, O, sh, ph, dA, A, tone, fluo, laminate, vinyl, window2, setLoc } = C30T;
  const W0 = EP.world.wuhome || {};

  /* ---------- 客廳：玄關的門、鞋櫃（小瑩的拖鞋）、撕頁的日曆、護貝的攤車照片、靠牆的沙發、往小瑩房間的門；
       茶几（吳媽媽的手機、小吳抄的電話紀錄）、飯桌上三碗蓋著的滷肉飯、右邊的電視櫃（抽屜裡的收據） ---------- */
  const wliving = { name:"客廳", w:288, h:144, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 288, 58, "#e8e0cc", "plain", { base:"#7a6a4a" });
      T.backDoor(p, 14, 14, 24, 44, 0, "#6a5a3a", { frame:"#4a3a2a" }); p.R(32, 34, 2, 4, "#c8a050");
      // 撕頁的日曆（撕到 26）、護貝的攤車照片
      p.R(100, 18, 12, 16, O); p.R(101, 19, 10, 14, "#f4f0e8"); p.R(101, 19, 10, 4, "#c84a3a"); p.R(103, 25, 6, 5, "#2a2a2a"); p.R(110, 32, 3, 2, "#f4f0e8");
      p.R(120, 16, 24, 18, O); p.R(121, 17, 22, 16, "#e8f0f4"); p.R(123, 21, 18, 8, "#c8ccd0"); p.R(123, 19, 18, 3, "#c84a3a"); p.R(126, 29, 3, 3, "#2a2a2a"); p.R(136, 29, 3, 3, "#2a2a2a");
      T.backDoor(p, 246, 14, 24, 44, dA("wliving", "wroom"), "#c8b898", { frame:"#7a6a4a" }); p.R(250, 8, 16, 6, O); p.R(251, 9, 14, 4, "#f4c8d0");
      laminate(p, 0, 58, 288, 86, "#b8956a");
      T.rug(p, 150, 78, 76, 30, "#8a6a5a", "#a88a7a");
      T.sides(p, this, "#7a6a4a", [["B", 124, 40]]);
    },
    props:[
      // 鞋櫃（最上面一格：一雙鞋頭朝外的拖鞋）
      { y:62, draw(p){ T.box(p, 44, 46, 26, 10, 12, "#a88a62", "#7a5a3a"); p.R(48, 47, 8, 4, "#f4b8c8"); p.R(58, 47, 8, 4, "#f4b8c8"); p.R(46, 60, 22, 1, "#5a4a32"); } },
      // 靠牆的舊沙發（套著花布）
      { y:64, draw(p){ T.box(p, 150, 46, 76, 10, 10, "#a87a5a", "#8a5a3a"); p.R(150, 40, 76, 8, O); p.R(151, 41, 74, 6, "#c89a7a"); for (let x = 156; x < 222; x += 12) p.R(x, 43, 4, 3, "#e8c8a8"); } },
      // 茶几：吳媽媽的手機、小吳抄的電話紀錄
      { y:98, draw(p){ T.box(p, 160, 84, 58, 10, 4, "#c8a878", "#8a6a4a"); p.R(166, 85, 14, 8, O); p.R(167, 86, 12, 6, "#f4f0e0"); for (let k = 0; k < 3; k++) p.R(168, 87 + k * 2, 9, 1, "#3a3a6a"); p.R(198, 85, 8, 8, O); p.R(199, 86, 6, 6, "#2a2a2e"); p.R(200, 87, 4, 3, "#8ad0ff"); } },
      // 飯桌：三碗蓋著盤子的滷肉飯、三雙筷子
      { y:112, draw(p){ T.box(p, 70, 90, 56, 16, 6, "#c8a878", "#8a6a4a"); for (let k = 0; k < 3; k++){ p.R(76 + k * 16, 94, 10, 7, O); p.R(77 + k * 16, 95, 8, 5, "#f4f4f0"); p.R(76 + k * 16, 93, 10, 2, "#e8e4d8"); p.R(80 + k * 16, 102, 6, 1, "#8a5a2a"); } } },
      { y:118, draw(p){ for (const x of [82, 114]) T.chair(p, x, 118, "#8a6a4a", "up"); } },
      // 電視櫃（右牆）：電視開著，沒有聲音；抽屜沒關好
      { y:132, draw(p, g, t){ T.box(p, 254, 92, 26, 34, 8, "#8a6a4a", "#6a4a2a"); p.R(256, 94, 6, 30, O); p.R(257, 95, 4, 28, "#2a3a5a"); p.R(258, 97 + Math.floor(t * 2) % 3, 2, 6, "#8ad0ff"); p.R(266, 112, 12, 3, "#f4f0e0"); p.R(268, 108, 8, 2, "#5a4a32"); } },
      { y:136, draw(p){ T.plant(p, 18, 134, false); } }
    ],
    front(p, g, t, o){ fluo(p, 80, 2, 50); fluo(p, 190, 2, 50); tone(g, this, o, .25); },
    solid:[[42,44,30,18],[148,44,80,20],[158,82,62,16],[68,88,60,22],[252,90,30,42],[10,122,18,14]],
    exits:[ { r:[246,58,24,8], to:"wroom", at:[120,126], label:"小瑩的房間", kind:"door", art:[246,14,24,44] } ]
  };

  /* ---------- 小瑩的房間：床（平板）、床頭櫃（檯燈、充飽的行動電源）、書架（課本和推理小說）、二月的月曆、空的衣架；書桌（筆電、相框） ---------- */
  const wroom = { name:"小瑩的房間", w:240, h:136, wall:56,
    floor(p, g, t, o){
      T.backWall(p, 0, 240, 56, "#f4e8ec", "plain", { base:"#c8a0b0" });
      // 月曆（每個禮拜五畫了一碗小小的飯）
      p.R(120, 14, 22, 26, O); p.R(121, 15, 20, 24, "#f8f8f4"); p.R(121, 15, 20, 5, "#f4a8b8"); for (let j = 0; j < 4; j++) for (let k = 0; k < 5; k++) p.R(123 + k * 4, 22 + j * 4, 2, 2, k === 4 ? "#c88a4a" : "#a8a8a8");
      // 空的衣架
      p.R(220, 18, 2, 3, O); p.R(214, 21, 14, 2, O); p.R(215, 21, 12, 1, "#c8ccd0");
      window2(p, 20, 10, 40, 30, o, t, (x, y, w, h) => { p.R(x, y, w, h, "#0e1424"); for (let k = 0; k < 5; k++) p.R(x + 4 + k * 7, y + h - 8 - (k % 2) * 4, 2, 2, "#f8d878"); }, "#f4f4f0");
      laminate(p, 0, 56, 240, 80, "#c8a888");
      T.rug(p, 90, 86, 50, 30, "#e8c8d0", "#f4dce4");
      T.sides(p, this, "#c8a0b0", [["B", 100, 40]]);
    },
    props:[
      // 書架
      { y:62, draw(p){ T.box(p, 84, 14, 30, 10, 38, "#c8a878", "#8a6a4a"); T.books(p, 86, 26, 26, 8, 3); T.books(p, 86, 38, 26, 8, 7); p.R(86, 50, 26, 2, "#5a4a3a"); } },
      // 床頭櫃：檯燈、行動電源（四顆燈都亮）
      { y:70, draw(p, g){ T.box(p, 62, 56, 16, 10, 8, "#c8a878", "#8a6a4a"); p.R(64, 50, 6, 8, O); p.R(65, 51, 4, 4, "#f8e8a8"); p.R(70, 58, 6, 4, O); p.R(71, 59, 4, 2, "#2a2a2e"); for (let k = 0; k < 4; k++) p.R(71 + k, 59, 1, 1, "#4ae06a"); T.glow(g, 67, 52, 18, "255,235,170", .15); } },
      // 床（粉色的被子、平板）
      { y:120, draw(p){ T.box(p, 6, 60, 56, 56, 6, "#f4dce4", "#c8a0b0"); p.R(10, 62, 48, 10, "#f8f8f4"); p.R(8, 74, 52, 40, "#e8a8b8"); for (let k = 0; k < 4; k++) p.R(12, 80 + k * 8, 44, 1, "#d898a8"); p.R(24, 84, 14, 10, O); p.R(25, 85, 12, 8, "#2a2a2e"); p.R(26, 86, 10, 5, "#a8e8b8"); } },
      // 書桌：筆電、相框
      { y:74, draw(p){ T.box(p, 150, 52, 62, 14, 10, "#f4f0e8", "#c8c0b0"); p.R(160, 50, 22, 12, O); p.R(161, 51, 20, 9, "#2a2e36"); p.R(162, 52, 18, 7, "#e8eef8"); p.R(158, 62, 26, 3, O); p.R(196, 50, 10, 12, O); p.R(197, 51, 8, 10, "#f4f0e0"); p.R(198, 52, 6, 6, "#f4c8d0"); } },
      { y:84, draw(p){ T.chair(p, 172, 84, "#f4b8c8", "up"); } }
    ],
    front(p, g, t, o){ tone(g, this, o, .3); },
    solid:[[6,58,58,60],[62,54,18,14],[82,38,34,24],[148,48,66,26]],
    exits:[ { r:[100,130,40,6], to:"wliving", at:[258,74], label:"客廳", kind:"out", art:[100,130,40,6] } ]
  };

  setLoc("wuhome", { start:"wliving", spawn:[144,130], rooms:{ wliving, wroom },
    spots:{
      o30_notes:[164,82,18,12,172,104,"wliving",A("read")],
      o30_receipt:[264,106,16,12,242,124,"wliving",A("rummage",{ face:1 })],
      o30_momphone:[196,82,12,12,204,104,"wliving",A("look")],
      o30_stallphoto:[120,16,24,18,132,64,"wliving",A("look")],
      o30_dinner:[72,90,52,14,98,118,"wliving",A("look")],
      o30_shoes:[44,40,26,22,56,70,"wliving",A("look")],
      o30_laptop:[158,48,26,16,170,80,"wroom",A("type")],
      o30_chat:[22,82,18,14,72,96,"wroom",A("look",{ face:-1 })],
      o30_calendar:[120,14,22,26,131,64,"wroom",A("look")],
      o30_charger:[62,48,18,18,72,80,"wroom",A("look")],
      o30_photo:[194,48,14,16,202,80,"wroom",A("look")]
    },
    details:{
      d30_cal:[100,18,14,18,106,64,"wliving",A("look")],
      d30_tv:[254,70,10,36,242,88,"wliving",A("look",{ face:1 })],
      d30_shelf:[82,14,34,48,99,70,"wroom",A("look")],
      d30_hanger:[212,16,18,10,224,64,"wroom",A("look")]
    },
    place:{
      mom:[ { room:"wliving", x:200, y:72, act:"sit", facing:-1, view:"side" }, { room:"wliving", x:200, y:72, act:"sit", facing:-1, view:"side" }, { room:"wliving", x:200, y:72, act:"sit", facing:-1, view:"side" } ],
      yt:[ { room:"wliving", x:172, y:72, act:"sitText", facing:1, view:"side" }, { room:"wliving", x:172, y:72, act:"sit", facing:1, view:"side" }, { room:"wliving", x:172, y:72, act:"sit", facing:1, view:"side" } ]
    },
    extras:W0.extras || [],
    intro:[ { set:{ room:"wliving", px:144, py:138 }, hide:true }, { wait:0.3, hide:true }, { set:{ room:"wliving", px:144, py:126 } },
      ...(W0.intro || []).filter(k => k.say || (k.wait && !k.hide)).map(k => k.say && k.say[0] === "wu" && /點畫面上的箭嘴|📍|清單不是全部/.test(k.say[1]) ? null : k).filter(Boolean) ],
    plan:[ { name:"小吳家（文華街 41 巷）", w:100, h:20, rooms:{ wliving:[0,0,60,20], wroom:[60,0,40,20] } } ] });
  if (typeof window !== "undefined") window.WU30 = Object.assign(window.WU30 || {}, { wliving, wroom });
})();

/* ================= 海風咖啡（共用劇情畫面的騎樓座位） ================= */
C30T && (() => {
  const { EP, T, O, A, setLoc } = C30T;
  const W = id => (EP.world[id] || {});
  let ST = null; const st = () => ST || (ST = (typeof TOPSCENE !== "undefined" && TOPSCENE.STAGES && TOPSCENE.STAGES.cafe) ? TOPSCENE.STAGES.cafe({ time:"night", ep:30 }).room : null);
  const camProp = { y:30, draw(p, g, t){ p.R(118, 18, 2, 6, O); T.cam(p, 120, 22, -1, t); } };
  const seat = { name:"海風咖啡", w:320, h:162, wall:58,
    floor(p, g, t, o){ const R = st(); if (R) R.floor.call(this, p, g, t, o); else p.R(0, 0, 320, 162, "#3a3028"); },
    get props(){ const R = st(); return (R ? R.props : []).concat([camProp]); },
    front(p, g, t, o){ const R = st(); if (R && R.front) R.front.call(this, p, g, t, o); },
    solid:[[0,0,320,62],[68,88,48,22],[144,88,48,22],[220,88,48,22],[122,70,18,18],[296,72,16,14],[0,136,320,26]],
    exits:[]
  };
  setLoc("cafe", { start:"seat", spawn:[200,124], rooms:{ seat },
    spots:{
      cctv30_cafe:[112,16,16,12,130,66,"seat",A("look")],
      o30_seat:[156,88,24,16,168,118,"seat",A("look")],
      o30_board:[122,68,18,20,150,80,"seat",A("read",{ face:-1 })]
    },
    details:{
      d30_flowers:[6,48,68,10,40,66,"seat",A("look")],
      d30_across:[0,132,320,30,236,126,"seat",A("look")]
    },
    place:{
      barista:[ { room:"seat", x:54, y:118, act:"wipe", facing:1 }, { room:"seat", x:100, y:70, act:"cross", facing:1 }, { room:"seat", x:100, y:70, act:"drink", facing:1 } ]
    },
    extras:W("cafe").extras || [],
    plan:[ { name:"海風咖啡", w:100, h:24, rooms:{ seat:[0,0,100,24,"out"] } } ] });
})();

/* ================= 刑事大隊（三樓指揮所、樓下值班台） ================= */
C30T && (() => {
  const { EP, T, O, sh, ph, dA, A, tone, fluo, vinyl, setLoc } = C30T;
  const W = id => (EP.world[id] || {});
  // 老公家機關：上半截淡綠漆、下半截深綠（和刑大辦公室同一棟）
  const govWall = (p, w) => { p.R(0, 0, w, 58, "#d8e0d4"); p.R(0, 32, w, 21, "#5a7a64"); p.R(0, 32, w, 2, "#7a9a84"); p.R(0, 0, w, 3, "#c0c8bc"); p.R(0, 53, w, 5, "#3a4a3e"); p.R(0, 58, w, 1, O); };

  /* ---------- 三樓：指揮所：門（玻璃上貼著「會議中」）、簽到表、澄港市大地圖（三根圖釘）、白板（時間線）；
       長桌（錄音介面和手機座、紙杯茶、證物袋、交接單、筆電上的潮位站畫面、通聯紀錄、台電的電錶清單） ---------- */
  const post = { name:"三樓：指揮所", w:304, h:150, wall:58,
    floor(p, g, t, o){
      govWall(p, 304);
      T.backDoor(p, 8, 14, 24, 44, dA("post", "hold"), "#8a6a4a", { frame:"#5a4a3a" }); p.R(12, 24, 14, 12, O); p.R(13, 25, 12, 10, "#c8d8e0"); p.R(14, 27, 10, 6, "#f4f4f0"); p.R(16, 29, 6, 1, "#c84a3a");
      p.R(36, 20, 14, 18, O); p.R(37, 21, 12, 16, "#f4f4f0"); for (let k = 0; k < 5; k++) p.R(38, 23 + k * 3, 9, 1, "#5a5a6a");
      // 大地圖（紅：小吳家、藍：咖啡店、黃：漁港）
      p.R(60, 6, 72, 42, O); p.R(61, 7, 70, 40, "#e8e4cc"); p.R(61, 7, 18, 40, "#b8d0c0"); for (let k = 0; k < 6; k++) p.R(80 + k * 9, 7, 1, 40, "#c8c0a8"); for (let k = 0; k < 4; k++) p.R(61, 14 + k * 9, 70, 1, "#c8c0a8"); p.R(112, 7, 19, 40, "#a8c8e0");
      for (const [x, y, c] of [[92, 18, "#e83a2a"], [100, 26, "#3a6ad8"], [116, 40, "#e8c040"]]){ p.R(x, y, 3, 3, O); p.R(x + 1, y + 1, 1, 1, c); }
      // 白板：一條橫線和幾個時間
      p.R(220, 8, 64, 38, O); p.R(221, 9, 62, 36, "#f8f8f4"); p.R(224, 26, 56, 1, "#2a2a2a"); for (let k = 0; k < 6; k++){ p.R(226 + k * 10, 24, 1, 5, "#2a2a2a"); p.R(224 + k * 10, 31, 6, 2, k === 5 ? "#c84a3a" : "#3a3a6a"); } p.R(226, 13, 4, 4, "#3aa84a");
      vinyl(p, 0, 58, 304, 92, "#9aa494", "#929c8c", 16);
      T.sides(p, this, "#3a4a3e", []);
    },
    props:[
      // 長桌
      { y:106, draw(p, g, t, o){ T.box(p, 60, 80, 192, 18, 8, "#c8b898", "#8a7a5a");
          p.R(72, 80, 24, 10, O); p.R(73, 81, 22, 8, "#2a2a2e"); p.R(75, 83, 6, 2, "#4ae06a"); p.R(84, 82, 8, 6, "#5a5a5e"); p.R(96, 84, 6, 1, "#1a1a1a");
          for (let k = 0; k < 3; k++){ p.R(104 + k * 4, 84, 3, 4, O); p.R(105 + k * 4, 85, 1, 2, "#8a5a2a"); }
          p.R(150, 84, 14, 10, O); p.R(151, 85, 12, 8, "rgba(220,235,240,.85)"); p.R(155, 87, 4, 5, "#8a6a3a"); p.R(151, 85, 12, 2, "#c84a3a");
          p.R(168, 84, 14, 8, O); p.R(169, 85, 12, 6, "#f4f0e0"); p.R(170, 86, 8, 1, "#5a5a6a");
          p.R(196, 80, 20, 12, O); p.R(197, 81, 18, 9, "#1e2226"); p.R(198, 82, 16, 7, "#1a2a2a"); p.R(200, 86, 12, 2, "#2a3a3a"); p.R(194, 92, 24, 3, O);
          p.R(222, 84, 12, 8, O); p.R(223, 85, 10, 6, "#f4f4f0"); p.R(224, 87, 8, 1, "#f8e060"); p.R(238, 84, 12, 8, O); p.R(239, 85, 10, 6, "#f4f4f0"); for (let k = 0; k < 2; k++) p.R(240, 86 + k * 2, 8, 1, "#5a5a6a"); } },
      { y:74, draw(p){ for (const x of [84, 190]) T.chair(p, x, 74, "#2a3a2a", "down"); } },
      { y:120, draw(p){ for (const x of [120, 160]) T.chair(p, x, 120, "#2a3a2a", "up"); } }
    ],
    front(p, g, t, o){ fluo(p, 70, 2, 50); fluo(p, 190, 2, 50); tone(g, this, o, .2); },
    solid:[[58,78,196,28]],
    exits:[ { r:[8,58,24,8], to:"hold", at:[162,74], label:"樓下・值班台", kind:"door", art:[8,14,24,44] } ]
  };

  /* ---------- 樓下：值班台：自動販賣機（熱的只剩黑咖啡）、公告欄、往三樓的樓梯門、留置物品的格子櫃、留置室的鐵門（門口一張椅子）；
       值班台（派出所的工作紀錄）、放著兩個便當的長椅 ---------- */
  const hold = { name:"樓下：值班台", w:288, h:144, wall:58,
    floor(p, g, t, o){
      govWall(p, 288);
      // 公告欄
      p.R(58, 14, 40, 24, O); p.R(59, 15, 38, 22, "#a87a4a"); for (let k = 0; k < 3; k++) p.R(61 + k * 12, 17, 10, 12, ["#f4f0e6", "#f4e8a8", "#d8e8f0"][k]); p.R(64, 31, 26, 4, "#f4f0e6");
      T.backDoor(p, 150, 14, 24, 44, dA("hold", "post"), "#8a6a4a", { frame:"#5a4a3a" }); p.R(154, 6, 16, 6, O); p.R(155, 7, 14, 4, "#e8e2d2");
      // 留置物品的格子櫃（三格各一個夾鏈袋）
      p.R(186, 14, 40, 40, O); p.R(187, 15, 38, 38, "#8a9098"); for (let k = 0; k < 3; k++){ p.R(189 + k * 12, 18, 10, 32, "#5a6068"); p.R(190 + k * 12, 34, 8, 10, "rgba(220,235,240,.6)"); p.R(191 + k * 12, 38, 6, 2, ["#2a2a2e", "#8a5a2a", "#e8c040"][k]); p.R(193 + k * 12, 20, 2, 2, "#c84a3a"); }
      // 留置室的鐵門
      p.R(236, 12, 32, 46, O); p.R(237, 13, 30, 45, "#4a4e54"); for (let x = 239; x < 266; x += 4) p.R(x, 15, 2, 40, "#8a8e94"); p.R(237, 32, 30, 2, "#8a8e94");
      vinyl(p, 0, 58, 288, 86, "#9aa494", "#929c8c", 16);
      T.sides(p, this, "#3a4a3e", [["B", 110, 40]]);
    },
    props:[
      // 自動販賣機（熱的那一排亮著「售完」）
      { y:62, draw(p){ T.box(p, 6, 44, 24, 10, 32, "#c83a2a", "#8a2a1a"); p.R(9, 16, 18, 22, "#d8e8f0"); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) p.R(10 + c * 6, 18 + r * 7, 4, 5, r === 0 ? (c === 2 ? "#3a2a1a" : "#c84a3a") : ["#3a8ad8", "#f4f4f0", "#e9c43a"][(r + c) % 3]); p.R(12, 40, 12, 4, "#1a1a1a"); } },
      // 值班台（電腦）
      { y:90, draw(p){ T.box(p, 50, 70, 88, 12, 10, "#8a6a4a", "#6a4a2a"); p.R(72, 60, 20, 14, O); p.R(73, 61, 18, 11, "#1e2226"); p.R(74, 62, 16, 9, "#3a4a5a"); for (let k = 0; k < 3; k++) p.R(76, 64 + k * 2, 12, 1, "#a8c8e8"); p.R(80, 74, 4, 2, O); p.R(100, 72, 16, 8, O); p.R(101, 73, 14, 6, "#f4f0e6"); } },
      // 留置室門口的椅子
      { y:70, draw(p){ T.chair(p, 252, 70, "#3a3a3e", "down"); } },
      // 長椅（兩個沒有打開的便當）
      { y:122, draw(p){ T.box(p, 180, 110, 70, 6, 6, "#3a6ad8", "#2a4a9a"); for (const x of [196, 214]){ p.R(x, 108, 14, 8, O); p.R(x + 1, 109, 12, 6, "#f4f0e0"); p.R(x + 1, 111, 12, 1, "#c84a3a"); } } }
    ],
    front(p, g, t, o){ fluo(p, 70, 2, 50); fluo(p, 200, 2, 50); tone(g, this, o, .2); },
    solid:[[4,44,26,18],[48,68,92,22],[178,108,74,14]],
    exits:[ { r:[150,58,24,8], to:"post", at:[36,74], label:"三樓・指揮所", kind:"door", art:[150,14,24,44] } ]
  };

  setLoc("police", { start:"post", spawn:[150,128], rooms:{ post, hold },
    spots:{
      cctv30_tide:[194,78,24,16,206,112,"post",A("look")],
      doc30_sign:[36,20,14,18,43,64,"post",A("read")],
      doc30_handover:[166,82,18,12,175,112,"post",A("read")],
      o30_bag:[148,82,18,14,157,112,"post",A("look")],
      o30_recorder:[70,78,30,14,84,112,"post",A("look")],
      o30_map:[60,6,72,42,96,66,"post",A("look")],
      o30_whiteboard:[220,8,64,38,252,66,"post",A("read")],
      doc30_cell:[220,82,16,12,228,112,"post",A("read")],
      doc30_power:[236,82,16,12,244,112,"post",A("read")],
      doc30_station:[70,58,24,18,80,98,"hold",A("look")],
      o30_lockers:[186,14,40,40,206,70,"hold",A("look")],
      o30_vending:[6,14,24,48,39,74,"hold",A("look",{ face:-1 })],
      o30_bench:[178,104,74,18,214,102,"hold",A("look")]
    },
    details:{
      d30_mugs:[102,82,16,8,108,112,"post",A("look")],
      d30_doorglass:[12,24,14,12,42,80,"post",A("look",{ face:-1 })],
      d30_notice:[58,14,40,24,78,64,"hold",A("read")]
    },
    place:{
      zhou:[ { room:"post", x:40, y:98, act:"cross", facing:1 }, { room:"post", x:40, y:98, act:"cross", facing:1 }, { room:"post", x:40, y:98, act:"cross", facing:1 } ],
      kui:[ { room:"post", x:84, y:72, act:"type", facing:1 }, { room:"post", x:84, y:72, act:"type", facing:1 }, { room:"post", x:84, y:72, act:"type", facing:1 } ],
      cai:[ { room:"post", x:190, y:72, act:"sit", facing:-1, view:"side" }, { room:"post", x:190, y:72, act:"sit", facing:-1, view:"side" }, { room:"post", x:190, y:72, act:"sit", facing:-1, view:"side" } ],
      xu:[ { room:"post", x:264, y:96, act:"hold", facing:-1 }, { room:"post", x:264, y:96, act:"read", facing:-1 }, { room:"post", x:264, y:96, act:"write", facing:-1 } ],
      qian:[ null, { room:"post", x:280, y:70, act:"idle", facing:-1 }, { room:"post", x:280, y:70, act:"idle", facing:-1 } ],
      biao:[ null, { room:"hold", x:252, y:74, act:"sit", facing:-1, view:"side" }, { room:"hold", x:252, y:74, act:"sit", facing:-1, view:"side" } ]
    },
    extras:W("police").extras || [],
    plan:[ { name:"刑事大隊", w:100, h:40, rooms:{ post:[0,0,100,20], hold:[0,20,100,20] } } ] });
  if (typeof window !== "undefined") window.WU30 = Object.assign(window.WU30 || {}, { post, hold });
})();

/* ================= 阿珠冰店（店裡＝第 23 集、門口＝第 28 集） ================= */
C30T && (() => {
  const { EP, T, O, sh, ph, dA, A, tone, fluo, setLoc } = C30T;
  const W = id => (EP.world[id] || {});
  const ICE = typeof window !== "undefined" ? window.ICE23 : null, FR = typeof window !== "undefined" ? window.FRONT28 : null;
  const night = (p, w) => { p.R(0, 0, w, 16, "#0a0f1c"); for (let k = 0; k < 10; k++) p.R((k * 37 + 11) % w, 2 + (k * 7) % 12, 1, 1, "#8a8aa0"); };

  /* ---------- 店裡：同一間阿珠冰店（藍招牌、價目表、熟客的集點卡）；冬天：櫃台上一大鍋燒仙草、收銀機、刨冰機；
       最裡面那道牆：做塊冰的老機器、兩片門的立式冷凍庫、櫃台後面的鑰匙掛鉤；兩張白鐵桌 ---------- */
  const shop = { name:"店裡", w:256, h:144, wall:62,
    floor(p, g, t, o){ if (ICE) ICE.floor.call(this, p, g, t, o); else p.R(0, 0, 256, 144, "#a8a49c");
      // 鑰匙掛鉤（機車鑰匙綁著小冰棒、另一支）
      p.R(234, 18, 18, 14, O); p.R(235, 19, 16, 12, "#8a6a4a"); p.R(238, 22, 1, 6, "#c8ccd0"); p.R(237, 27, 3, 3, "#f8c8d8"); p.R(246, 22, 1, 6, "#c8ccd0"); p.R(245, 27, 3, 2, "#c8a050"); },
    props:[
      // 做塊冰的老機器（靠著最裡面那道牆）
      { y:64, draw(p, g, t){ T.box(p, 156, 44, 36, 12, 18, "#c8ccd0", "#8a8e94"); p.R(160, 48, 12, 6, "#2a2a2e"); p.R(161, 49, 8, 3, "#4ae06a"); p.R(176, 48, 12, 8, "#a8acb0"); if (Math.floor(t * 2) % 2) p.R(166, 41, 1, 3, "rgba(230,240,240,.5)"); } },
      // 立式冷凍庫（兩片門、−18°C）
      { y:76, draw(p){ T.box(p, 214, 60, 38, 14, 34, "#e8ecec", "#c8ccd0"); p.R(232, 76, 1, 34, "#a8acb0"); p.R(228, 84, 2, 8, "#8a8e94"); p.R(235, 84, 2, 8, "#8a8e94"); p.R(218, 78, 10, 4, "#2a2a2e"); p.R(219, 79, 8, 2, "#e83a2a"); } },
      // 櫃台：燒仙草（冒煙）、刨冰機、收銀機
      { y:94, draw(p, g, t){ T.box(p, 68, 72, 84, 12, 10, "#c8ccd0", "#8a8e94"); p.R(74, 64, 20, 12, O); p.R(75, 65, 18, 10, "#5a5e64"); p.R(77, 66, 14, 6, "#2a1a10"); for (let k = 0; k < 3; k++) if (Math.floor(t * 2 + k) % 2) p.R(79 + k * 5, 58 - k, 1, 4, "rgba(240,240,240,.55)");
          p.R(102, 56, 16, 18, O); p.R(103, 57, 14, 16, "#3a8ac8"); p.R(106, 60, 8, 5, "#c8ccd0"); p.R(130, 66, 16, 10, O); p.R(131, 67, 14, 8, "#3a3a3e"); p.R(133, 68, 8, 3, "#4ae06a"); p.R(141, 73, 4, 2, "#f4f4f0"); } },
      // 兩張白鐵桌（醬油膏、辣椒醬）
      { y:120, draw(p){ for (const x of [30, 70]){ T.box(p, x, 108, 22, 10, 4, "#d8dce0", "#a8acb0"); p.R(x + 6, 109, 3, 4, "#3a2a1a"); p.R(x + 12, 109, 3, 4, "#c83a2a"); T.chair(p, x + 11, 128, "#3a6ac8", "up"); } } },
      // 冷凍庫旁邊的凳子
      { y:100, draw(p){ p.R(196, 94, 10, 6, O); p.R(197, 95, 8, 4, "#3a6ac8"); } }
    ],
    front(p, g, t, o){ fluo(p, 128, 2, 50); tone(g, this, o, .2); },
    solid:[[154,42,40,22],[212,58,42,18],[66,70,88,24],[28,106,26,14],[68,106,26,14]],
    exits:[ { r:[20,138,50,6], to:"front", at:[60,82], label:"冰店門口", kind:"out", art:[20,138,50,6] } ]
  };

  /* ---------- 冰店門口：第 28 集的舊碼頭路口（同一排房子）；晚上：海龍漁業鐵門拉到底（「寒流期間 暫停營業」）、
       屋簷下的號角喇叭、7 路公車站牌、冰店送貨的機車（後座鐵架）、路口望過去的舊碼頭 ---------- */
  const front = { name:"冰店門口", w:336, h:150, wall:70,
    floor(p, g, t, o){ if (FR) FR.floor.call(this, p, g, t, o); else p.R(0, 0, 336, 150, "#3a3a3e");
      night(p, 336);
      p.R(256, 16, 80, 30, "#0e1a2a"); for (let k = 0; k < 8; k++) p.R(258 + (k * 19 + Math.floor(t * 6)) % 76, 20 + (k % 4) * 6, 8, 1, "#2a4a6a"); p.R(256, 40, 80, 6, "#3a3c40");
      // 海龍漁業：鐵門拉到底、貼著一張紙
      p.R(154, 32, 94, 38, O); p.R(155, 33, 92, 37, "#7a7e84"); for (let y = 35; y < 70; y += 3) p.R(155, y, 92, 1, "#6a6e74"); p.R(194, 44, 14, 10, O); p.R(195, 45, 12, 8, "#f4f4f0"); p.R(197, 47, 8, 1, "#3a3a3a"); p.R(197, 50, 6, 1, "#3a3a3a");
      // 屋簷下的號角喇叭
      p.R(96, 36, 2, 4, O); p.R(94, 38, 10, 7, O); p.R(95, 39, 8, 5, "#a8acb0"); p.R(102, 37, 4, 9, O); p.R(103, 38, 2, 7, "#c8ccd0"); },
    props:[
      // 7 路公車站牌
      { y:92, draw(p){ p.R(140, 60, 4, 32, O); p.R(141, 60, 2, 32, "#c8ccd0"); p.R(134, 50, 16, 12, O); p.R(135, 51, 14, 10, "#2a5aa8"); p.R(137, 53, 10, 2, "#f4f4f0"); p.R(137, 57, 6, 2, "#e9c43a"); } },
      // 冰店送貨的機車（後座焊了一個大鐵架）
      { y:104, draw(p){ const x = 40, y = 92;
          p.R(x - 4, y + 13, 50, 3, "rgba(0,0,0,.35)");
          p.R(x - 4, y + 4, 8, 6, O); p.R(x - 3, y + 5, 6, 4, "#1a1a1a"); p.R(x + 40, y + 4, 8, 6, O); p.R(x + 41, y + 5, 6, 4, "#1a1a1a");
          p.R(x + 6, y + 1, 34, 12, O); p.R(x + 7, y + 2, 32, 10, "#d8d4c8"); p.R(x + 7, y + 2, 32, 2, "#f4f0e4"); p.R(x + 8, y + 10, 30, 2, "#b0aca0");
          p.R(x + 12, y + 3, 16, 8, O); p.R(x + 13, y + 4, 14, 6, "#2a2420"); p.R(x + 14, y + 4, 12, 1, "#4a4038");
          p.R(x + 34, y - 4, 3, 22, O); p.R(x + 35, y - 3, 1, 20, "#5a5a5a"); p.R(x + 33, y - 5, 5, 2, "#2a2a2a"); p.R(x + 33, y + 17, 5, 2, "#2a2a2a"); p.R(x + 31, y - 6, 3, 2, "#9ab0c0"); p.R(x + 31, y + 18, 3, 2, "#9ab0c0");
          p.R(x + 39, y + 4, 4, 6, O); p.R(x + 40, y + 5, 2, 4, "#fff4c0");
          p.R(x - 4, y - 2, 14, 18, O); for (let i = x - 3; i < x + 9; i += 3) p.R(i, y - 1, 1, 16, "#9a9ea4"); p.R(x - 3, y - 1, 12, 1, "#9a9ea4"); p.R(x - 3, y + 14, 12, 1, "#9a9ea4"); p.R(x - 3, y + 6, 12, 1, "#9a9ea4"); } },
      // 收進來一半的立牌
      { y:96, draw(p){ p.R(104, 80, 12, 16, O); p.R(105, 81, 10, 14, "#2a4a3a"); p.R(106, 83, 8, 2, "#f8f8f4"); } },
      // 路燈（路口這一盞是亮的）
      { y:120, draw(p, g){ T.streetLamp(p, g, 250, 120); } }
    ],
    front(p, g, t, o){ g.save(); g.fillStyle = "rgba(8,10,24,.45)"; g.fillRect(0, 0, this.w, this.h); g.restore(); T.glow(g, 54, 56, 60, "255,240,200", .16); T.glow(g, 260, 70, 50, "255,230,170", .12); },
    solid:[[32,86,56,22],[138,88,8,6],[102,92,14,6],[246,116,8,6]],
    exits:[ { r:[40,70,40,8], to:"shop", at:[46,128], label:"店裡", kind:"door", art:[10,38,90,32] } ]
  };

  setLoc("ice", { start:"front", spawn:[300,130], rooms:{ shop, front },
    spots:{
      o30_cards:[14,22,48,26,38,76,"shop",A("look")],
      doc30_ledger:[128,64,20,14,138,100,"shop",A("read")],
      o30_machine:[154,40,40,24,174,72,"shop",A("look")],
      o30_freezer:[212,48,42,30,232,86,"shop",A("look")],
      o30_keys:[234,18,18,14,203,70,"shop",A("look",{ face:1 })],
      o30_pot:[72,60,24,16,84,100,"shop",A("look")],
      o30_speaker:[92,34,16,12,120,82,"front",A("look",{ face:-1 })],
      o30_stopsign:[132,48,18,46,152,100,"front",A("read",{ face:-1 })],
      o30_scooter:[32,84,56,22,62,116,"front",A("look")],
      o30_mud:[76,90,16,16,96,112,"front",A("crouch",{ face:-1 })],
      o30_yardseal:[256,16,80,54,300,90,"front",A("look")],
      o30_hailong:[154,32,94,38,200,80,"front",A("look")]
    },
    details:{
      d30_table:[28,104,66,16,60,132,"shop",A("look")],
      d30_upwin:[8,4,22,14,24,80,"front",A("look")],
      d30_phone:[116,28,16,42,124,80,"front",A("look")]
    },
    place:{
      zhu:[ { room:"shop", x:112, y:102, act:"wipe", facing:-1 }, { room:"shop", x:112, y:102, act:"idle", facing:-1 }, { room:"shop", x:112, y:102, act:"drink", facing:-1 } ],
      jun:[ { room:"front", x:110, y:104, act:"hold", facing:-1 }, { room:"shop", x:202, y:100, act:"sitText", facing:-1, view:"side" }, null ]
    },
    extras:W("ice").extras || [],
    plan:[ { name:"阿珠冰店（南澳漁港）", w:100, h:36, rooms:{ shop:[0,0,60,18], front:[0,18,100,18,"out"] } } ] });
  if (typeof window !== "undefined") window.ICE30 = { shop, front };
})();

/* ================= 冰店後面的巷子 ================= */
C30T && (() => {
  const { EP, T, O, sh, ph, A, tone, setLoc } = C30T;
  const W = id => (EP.world[id] || {});

  /* ---------- 後巷：冰店的後牆（抽風扇）接著舊冷凍倉庫（兩棟共用一道牆）：褪色的「漁會冷凍倉庫」、停用的電錶箱、生鏽的鐵門上一顆新的掛鎖、
       三公尺高被封住的通風口、巷底整面的鐵捲門；地上是濕泥（機車的胎痕）、唯一一盞壞掉的路燈、水溝邊的塑膠袋 ---------- */
  const alley = { name:"後巷", w:336, h:144, wall:60,
    floor(p, g, t, o){
      p.R(0, 0, 336, 8, "#0a0f1c");
      // 冰店的後牆＋抽風扇
      p.R(0, 8, 90, 52, "#8a8478"); p.R(0, 8, 90, 2, "#9a9488"); p.R(24, 34, 14, 14, O); p.R(25, 35, 12, 12, "#5a5e64"); const a = t * 8; for (let k = 0; k < 3; k++) p.R(31 + Math.round(Math.cos(a + k * 2.1) * 4), 41 + Math.round(Math.sin(a + k * 2.1) * 4), 2, 2, "#a8acb0");
      // 共用的那一道牆（沒有縫）
      p.R(88, 8, 4, 52, "#6a665c");
      // 冷凍倉庫：水泥牆、褪色的字、電錶箱、鐵門、通風口、巷底的鐵捲門
      p.R(92, 4, 244, 56, "#6a6a66"); p.seed(30); for (let k = 0; k < 90; k++) p.R(92 + p.rnd() * 244, 4 + p.rnd() * 56, 2, 1, k % 2 ? "#5e5e5a" : "#767672");
      for (let k = 0; k < 6; k++) p.R(112 + k * 11, 9, 8, 7, "#8a8a84");
      p.R(158, 24, 16, 18, O); p.R(159, 25, 14, 16, "#8a9098"); p.R(161, 27, 10, 8, "rgba(200,220,230,.5)"); p.R(162, 29, 8, 3, "#e8e4d0");
      p.R(196, 18, 26, 42, O); p.R(197, 19, 24, 41, "#7a4a2a"); for (let k = 0; k < 8; k++) p.R(198 + (k * 7) % 22, 22 + (k * 9) % 34, 3, 2, "#a86a3a"); p.R(216, 36, 6, 8, O); p.R(217, 37, 4, 6, "#e8ecf0");
      p.R(238, 6, 24, 10, O); p.R(239, 7, 22, 8, "#5a5e64"); for (let k = 0; k < 3; k++) p.R(240, 8 + k * 2, 20, 1, "#1a1a1a");
      p.R(270, 6, 62, 54, O); p.R(271, 7, 60, 53, "#7a7e84"); for (let y = 9; y < 60; y += 3) p.R(271, y, 60, 1, "#6a6e74"); p.R(271, 7, 60, 4, "#5a5e64");
      // 濕泥地、機車的胎痕（進來、停在鐵門前、再出去）
      p.R(0, 60, 336, 72, "#4a463e"); p.seed(31); for (let k = 0; k < 140; k++) p.R(p.rnd() * 336, 62 + p.rnd() * 68, 2, 1, k % 2 ? "#3e3a32" : "#565248");
      for (let x = 0; x < 206; x += 3){ p.R(x, 100, 2, 1, "#2e2a24"); p.R(x, 104, 2, 1, "#2e2a24"); } for (let k = 0; k < 8; k++) p.R(206 + k, 100 - k * 4, 2, 2, "#2e2a24");
      // 水溝
      p.R(0, 132, 336, 12, "#2a2a2e"); p.R(0, 132, 336, 2, "#5a5a5e"); for (let x = 4; x < 336; x += 10) p.R(x, 136, 6, 1, "#1a1a1e");
    },
    props:[
      // 水溝邊印著紅字的塑膠袋（兩個透明杯）
      { y:136, draw(p){ p.R(58, 126, 16, 10, O); p.R(59, 127, 14, 8, "#f4f4f0"); p.R(61, 129, 10, 2, "#c83a2a"); p.R(62, 123, 4, 4, O); } },
      // 壞掉的路燈（燈罩破了，沒有燈泡）
      { y:102, draw(p){ p.R(139, 46, 3, 56, O); p.R(140, 47, 1, 54, "#5a5e66"); p.R(139, 44, 12, 3, O); p.R(147, 46, 6, 4, O); p.R(148, 47, 4, 2, "#3a3a3a"); p.R(140, 70, 8, 6, O); p.R(141, 71, 6, 4, "#f4f0e0"); } }
    ],
    front(p, g, t, o){ g.save(); g.fillStyle = "rgba(6,8,20,.5)"; g.fillRect(0, 0, this.w, this.h); g.restore(); },
    solid:[[0,132,336,12],[136,98,10,6]],
    exits:[]
  };

  setLoc("wh", { start:"alley", spawn:[44,110], rooms:{ alley },
    spots:{
      o30_cup:[54,120,24,16,68,118,"alley",A("crouch")],
      o30_meter:[158,24,16,18,166,66,"alley",A("look")],
      o30_lock:[196,18,26,42,212,66,"alley",A("look")],
      o30_vent:[238,6,24,10,250,66,"alley",A("look")],
      o30_shutter:[270,6,62,54,300,70,"alley",A("look")],
      o30_wall:[84,8,12,52,94,66,"alley",A("look")],
      o30_tracks:[100,92,120,18,180,116,"alley",A("crouch")],
      o30_lamp:[136,42,18,60,156,96,"alley",A("look",{ face:-1 })]
    },
    details:{
      d30_fan:[24,34,14,14,31,66,"alley",A("look")],
      d30_sign:[110,6,70,12,130,66,"alley",A("look")]
    },
    place:{},
    extras:W("wh").extras || [],
    plan:[ { name:"冰店後面的巷子", w:100, h:24, rooms:{ alley:[0,0,100,24,"out"] } } ] });
  if (typeof window !== "undefined") window.WU30 = Object.assign(window.WU30 || {}, { alley });
})();
