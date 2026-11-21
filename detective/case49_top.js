/* =========================================================
   第 49 集・俯視版（topdown.js）
   海風咖啡（外面的座位、最外面那一桌＝第 48 集，MK48CAFE）；港濱路口（店門口＝第 44 集、店後面的停車場＝第 36 集）；
   你住的公寓（樓下、一樓大廳、四樓走廊、客廳＝第 38 集，MK38HOME）；澄東牛肉麵（新的）；法院・公設辯護人室（＝第 40 集）。
   第一天是晴天，第二天下午下雨。跟著你的是許知夏（不畫成 NPC）。
   ========================================================= */
const C49T = typeof TOPEP === "function" ? TOPEP("seconds") : null;

/* ================= 海風咖啡 ================= */
C49T && (() => {
  const { EP, T, O, ph, A, has, setLoc } = C49T;
  const W0 = EP.world.cafe || {};
  if (typeof MK48CAFE !== "function") return;
  const { seat, table } = MK48CAFE(C49T, {
    stage:o => ph(o) > 0 ? { time:"noon", rain:true, ep:49 } : { time:"morning", ep:49 },
    night:() => false, rain:o => ph(o) > 0, scooter:() => true, tableLabel:"最外面那一桌",
    // 路燈：尋狗啟事被撕掉了，膠帶旁邊有人寫了兩個字
    poster(p){ p.R(274, 100, 2, 2, "#e8e0c8"); p.R(279, 100, 2, 2, "#e8e0c8"); p.R(275, 103, 5, 1, "#2a3a8a"); },
    // 桌上：許知夏攤開的筆記本、紙杯（烏龍茶）、她的筆電、印出來的閃電紀錄、銀色的工具箱、你的打火機、你的手機、你的美式和咬了一口的三明治
    items(p, g, t, o){
      p.R(62, 84, 20, 12, O); p.R(63, 85, 9, 10, "#f8f8f4"); p.R(73, 85, 8, 10, "#f8f8f4"); p.R(72, 85, 1, 10, "#c8c8c4"); p.R(64, 87, 7, 1, "#3a3a6a"); for (let k = 0; k < 6; k++) p.R(64 + k, 90, 1, k % 2 ? 2 : 3, "#3a3a6a"); p.R(74, 88, 6, 1, "#8a8a9a"); p.R(74, 91, 4, 1, "#8a8a9a");
      p.R(86, 82, 7, 8, O); p.R(87, 83, 5, 6, "#f4f0e0"); p.R(88, 84, 3, 2, "#a8783a"); p.R(92, 83, 2, 1, "#c8c8c4");
      p.R(96, 82, 22, 14, O); p.R(97, 83, 20, 7, "#2a3240"); p.R(98, 84, 18, 5, has("f4") ? "#3a5a7a" : "#4a5a6a"); if (has("f4")) for (let k = 0; k < 8; k++) p.R(99 + k * 2, 85 + (k % 3), 1, 3 - (k % 3), "#8ad0e8"); p.R(97, 90, 20, 5, "#a8acb0"); p.R(99, 91, 16, 3, "#8a8e94");
      if (has("x7")){ p.R(98, 96, 18, 7, O); p.R(99, 97, 16, 5, "#f8f8f4"); p.R(100, 98, 14, 1, "#3a3a3a"); p.R(100, 100, 10, 1, "#c8302a"); }
      p.R(122, 82, 22, 13, O); p.R(123, 83, 20, 11, "#c8ccd0"); p.R(123, 83, 20, 2, "#e8ecf0"); p.R(131, 81, 6, 2, O); p.R(124, 88, 18, 1, "#8a9094"); p.R(140, 86, 2, 3, "#5a5e64");
      p.R(124, 98, 6, 4, O); p.R(125, 99, 4, 2, "#c8903a");
      p.R(146, 97, 6, 7, O); p.R(147, 98, 4, 5, has("x3") ? "#3a6a5a" : "#1e2226");
      p.R(146, 86, 8, 7, O); p.R(147, 87, 6, 5, "#f4f4f0"); p.R(148, 88, 4, 3, "#3a2410"); p.R(153, 88, 2, 3, O);
      p.R(137, 88, 8, 6, O); p.R(138, 89, 6, 4, "#f0d8a0"); p.R(138, 90, 6, 1, "#e8a0a0"); p.R(143, 89, 1, 2, "#f4f4f0");
    }
  });

  const XP = { x49_abin:{ room:"seat", x:200, y:80, act:"hold", facing:-1 }, x49_su:{ room:"seat", x:264, y:106, act:"sit", facing:-1, view:"side" } };
  setLoc("cafe", { start:"seat", spawn:[200,124], rooms:{ seat, table },
    spots:{
      doc49_app:[146,97,6,7,152,118,"table",A("look")],
      doc49_dash:[96,82,22,14,106,72,"table",A("look")],
      doc49_light:[98,96,18,7,108,118,"table",A("read")],
      o49_kit:[122,82,22,13,132,72,"table",A("rummage")],
      o49_tea:[86,82,7,8,90,72,"table",A("look")],
      o49_note:[62,84,20,12,72,118,"table",A("read")],
      o49_lighter:[124,98,6,4,126,118,"table",A("look")],
      o49_station:[60,138,200,24,160,126,"seat",A("look")],
      o49_sutable:[232,90,24,14,244,126,"seat",A("look")]
    },
    details:{
      d49_window:[8,27,64,29,30,72,"seat",A("look")],
      d49_flowers:[6,50,68,8,64,72,"seat",A("look")],
      d49_lamp:[272,76,14,34,262,122,"seat",A("look",{ face:1 })],
      d49_street:[0,132,240,18,200,122,"table",A("look")],
      d49_mug:[137,86,17,8,148,72,"table",A("look")]
    },
    place:{},
    extras:(W0.extras || []).map(e => Object.assign({}, e, XP[e.id] || {}, { pose:undefined })),
    plan:[ { name:"海風咖啡", w:100, h:28, rooms:{ table:[0,0,40,28,"out"], seat:[40,0,60,28,"out"] } } ] });
})();

/* ================= 港濱路口（店門口＝第 44 集，店後面的停車場＝第 36 集） ================= */
C49T && (() => {
  const { EP, T, O, ph, A, has, tone, rainFx, setLoc } = C49T;
  const W0 = EP.world.harbor || {};
  const F = (typeof window !== "undefined" && window.HFRONT44) || null, L = (typeof window !== "undefined" && window.LOT36) || null;
  if (!F || !L || typeof AT48 !== "function") return;

  /* ---------- 店門口：第 44 集同一個路口；林記的鐵門上貼著新的封條；路燈旁邊多了公車站牌（21 路）；
       第一天：一台黃色的計程車停在粥店東邊的轉角（紅線，駕駛座的門開著） ---------- */
  const PH = () => { try { return (typeof S !== "undefined" && S && S.phase) || 0; } catch (e){ return 0; } };
  const hfront = AT48(F, 0, {
    front(p, g, t, o){ tone(g, this, o, 1); rainFx(p, g, this, t, o, 50); },
    exits:[ { r:[96,50,12,8], to:"hlot", at:[154,74], label:"窄走道（往店後面的停車場）", kind:"door", art:[98,4,8,46] } ]
  });
  Object.defineProperty(hfront, "solid", { get(){ return [[34,58,12,10],[186,60,8,6],[232,60,6,6]].concat(PH() > 0 ? [] : [[196,66,46,22]]); }, enumerable:true });
  hfront.props = hfront.props.concat([
    // 新的封條（舊的那一張被雨打爛了）
    { y:51, draw(p){ p.R(52, 30, 16, 10, O); p.R(53, 31, 14, 8, "#ffffff"); p.R(53, 33, 14, 1, "#d8302a"); p.R(55, 35, 10, 1, "#3a3a3a"); p.R(62, 36, 3, 2, "#d8302a"); } },
    // 公車站牌（21 路，往魚市口；貼著時刻表）
    { y:66, draw(p){ p.R(234, 24, 3, 42, O); p.R(235, 24, 1, 42, "#8a8e94"); p.R(226, 14, 18, 12, O); p.R(227, 15, 16, 10, "#2a4a9a"); for (const [x, y] of [[229,17],[230,17],[231,17],[231,18],[231,19],[230,19],[229,19],[229,20],[229,21],[230,21],[231,21],[235,17],[234,18],[235,18],[235,19],[235,20],[234,21],[235,21],[236,21]]) p.R(x, y, 1, 1, "#f4f4f0");
        p.R(238, 30, 8, 12, O); p.R(239, 31, 6, 10, "#f8f8f4"); for (let k = 0; k < 4; k++) p.R(240, 33 + k * 2, 4, 1, "#5a5a6a"); } },
    // 第一天：黃色的計程車（紅線、駕駛座的門開著，後照鏡下面掛著東西）
    { y:88, draw(p, g, t, o){ p.R(196, 87, 50, 2, "#c8302a"); if (ph(o) > 0) return; const x = 198, y = 68;
        p.R(x - 1, y - 1, 44, 20, O); p.R(x, y, 42, 18, "#f0c030"); p.R(x + 10, y + 2, 22, 14, "#d8a820"); p.R(x + 12, y + 3, 8, 12, "#5a7a94"); p.R(x + 24, y + 3, 6, 12, "#5a7a94"); p.R(x + 18, y - 3, 8, 3, O); p.R(x + 19, y - 2, 6, 1, "#f4f4f0");
        for (const a of [5, 31]){ p.R(x + a, y - 2, 7, 2, O); p.R(x + a, y + 18, 7, 2, O); } p.R(x + 20, y + 18, 10, 3, O); p.R(x + 21, y + 18, 8, 2, "#f0c030"); p.R(x + 22, y + 6, 1, 4, "#c83a2a"); } }
  ]);

  /* ---------- 店後面的停車場：第 36 集同一片（白天）；林記的後門關著、貼著封條，門檻上新補的水泥；那一支攝影機還歪著對著牆；
       白色的廂型車還停在這裡（一層灰）；自取箱的蓋子上貼著「暫停營業」 ---------- */
  const hlot = AT48(L, 1, {
    front(p, g, t, o){
      p.R(96, 10, 3, 6, O); p.R(98, 8, 10, 7, O); p.R(99, 9, 8, 5, "#e9e4da"); p.R(99, 9, 1, 5, "#1a1410"); p.R(102, 13, 4, 1, "#8a8a8e");
      tone(g, this, o, .6); rainFx(p, g, this, t, o, 0); },
    solid:[[0,56,40,50],[38,58,20,16],[232,52,24,14]],
    exits:[ { r:[148,58,12,8], to:"hfront", at:[102,62], label:"窄走道（往路口）", kind:"door", art:[150,4,8,56] } ]
  });
  const _f = hlot.floor; hlot.floor = function(p, g, t, o){ _f.call(this, p, g, t, o);
    // 後門關著、貼著封條
    p.R(64, 20, 28, 40, O); p.R(65, 21, 26, 39, "#6a5a44"); p.R(66, 22, 24, 37, "#7a6a54"); p.R(86, 40, 2, 3, "#c8a050"); p.R(66, 34, 24, 4, "#ffffff"); p.R(66, 35, 24, 1, "#d8302a"); p.R(72, 36, 12, 1, "#3a3a3a");
    // 門檻上新補的水泥；鞋印不見了
    p.R(64, 60, 28, 6, "#b8b4a8"); p.R(64, 60, 28, 1, "#8a8680"); p.R(86, 68, 12, 8, "#9a9890");
    // 廂型車的擋風玻璃一層灰（上面被小孩寫了字）
  };
  hlot.props = hlot.props.concat([
    { y:106.5, draw(p){ p.R(5, 61, 30, 8, "#8a9aa4"); p.R(8, 63, 3, 1, "#c8d0d4"); p.R(13, 63, 2, 3, "#c8d0d4"); p.R(18, 64, 4, 1, "#c8d0d4"); p.R(37, 98, 1, 6, "#2a2a2a"); } },
    { y:74.5, draw(p){ p.R(41, 61, 14, 4, "#e8d8a0"); p.R(42, 62, 12, 1, "#3a3a3a"); } }
  ]);

  const XP = { x49_dog:{ room:"hlot", x:70, y:80, act:"sit", facing:1 } };
  setLoc("harbor", { start:"hfront", spawn:[120,112], rooms:{ hfront, hlot },
    spots:{
      o49_taxi:[196,66,46,22,186,100,"hfront",A("look",{ face:1 })],
      o49_busstop:[226,14,20,52,250,74,"hfront",A("read",{ face:-1 })],
      o49_lampcam:[196,12,12,10,180,72,"hfront",A("look",{ face:-1 })],
      o49_shutter:[30,20,60,30,64,62,"hfront",A("look")],
      o49_backdoor:[64,20,28,40,88,72,"hlot",A("look")],
      o49_van:[2,58,36,40,50,96,"hlot",A("look",{ face:-1 })],
      o49_camback:[96,6,12,10,106,72,"hlot",A("look")]
    },
    details:{
      d49_congee:[118,20,54,30,158,62,"hfront",A("look")],
      d49_71:[298,0,102,28,320,62,"hfront",A("look")],
      d49_patch:[4,72,40,18,24,100,"hfront",A("crouch")],
      d49_win2:[172,6,22,16,184,72,"hlot",A("look")],
      d49_gas:[234,36,22,22,244,76,"hlot",A("look")],
      d49_box:[40,56,16,14,48,84,"hlot",A("look")]
    },
    place:{
      e:[ { room:"hfront", x:132, y:64, act:"hold", facing:-1 }, { room:"hfront", x:132, y:64, act:"hold", facing:-1 } ],
      fan:[ { room:"hfront", x:176, y:82, act:"hold", facing:1 }, null ]
    },
    extras:(W0.extras || []).map(e => Object.assign({}, e, XP[e.id] || {}, { pose:undefined })),
    plan:[ { name:"港濱路口", w:100, h:50, rooms:{ hlot:[0,0,100,20,"out"], hfront:[0,20,100,30,"out"] } } ] });
})();

/* ================= 你住的公寓（＝第 38 集，MK38HOME） ================= */
C49T && (() => {
  const { EP, T, O, ph, A, has, setLoc } = C49T;
  const W0 = EP.world.home || {};
  if (typeof MK38HOME !== "function") return;
  const H = MK38HOME(C49T);

  /* ---------- 樓下：大門旁邊的對講機 ---------- */
  const front = Object.assign({}, H.front);
  front.props = H.front.props.concat([ { y:62, draw(p){ p.R(75, 47, 4, 8, O); p.R(76, 48, 2, 6, "#c8ccd0"); p.R(76, 49, 2, 2, "#2a3a4a"); p.R(76, 52, 1, 1, "#3a3a3a"); p.R(77, 53, 1, 1, "#3a3a3a"); } } ]);

  /* ---------- 一樓大廳：管理室角落的錄影主機；看過大廳的監視器以後，螢幕旁邊插著藍色的隨身碟 ---------- */
  const office = Object.assign({}, H.office);
  office.props = H.office.props.concat([ { y:70.5, draw(p){ p.R(126, 44, 16, 9, O); p.R(127, 45, 14, 7, "#2a2a2e"); p.R(128, 47, 6, 1, "#4a4a4e"); p.R(138, 47, 1, 1, "#3ae83a"); p.R(136, 49, 4, 1, "#4a4a4e");
      if (has("cctv49_lobby")){ p.R(168, 56, 6, 3, O); p.R(169, 56, 4, 2, "#3a6ac8"); } } } ]);

  /* ---------- 四樓走廊：家門的位置往右一點才不會被樓梯口的人擋住 ---------- */
  const hall4 = Object.assign({}, H.hall4, { exits:[ { r:[8,60,32,8], to:"office", at:[54,78], label:"樓梯（下一樓）", kind:"down", art:[6,20,34,40] },
    { r:[50,60,24,8], to:"living", at:[40,104], label:"四樓之一（你家）", kind:"door", art:[50,16,24,44] } ] });

  /* ---------- 客廳：煙霧偵測器拿走了（兩個螺絲孔、一圈比較白的油漆）；沙發上的塑膠屑早就清掉了；電視櫃上的遙控器 ---------- */
  const living = Object.assign({}, H.living, {
    floor(p, g, t, o){ H.living.floor.call(this, p, g, t, Object.assign({}, o || {}, { off:true, clean:true })); p.R(104, 0, 16, 5, "#f0ece4"); p.R(108, 2, 8, 3, "#f0ece4"); p.R(107, 2, 1, 1, "#5a5a5a"); p.R(116, 2, 1, 1, "#5a5a5a"); },
    exits:[ { r:[0,88,8,30], to:"hall4", at:[62,76], label:"家門（四樓走廊）", kind:"door", art:[0,86,8,34] } ]
  });
  living.props = H.living.props.concat([ { y:134.5, draw(p){ p.R(118, 120, 8, 3, O); p.R(119, 121, 6, 1, "#3a3a3e"); } } ]);

  setLoc("home", { start:"front", spawn:[150,104], rooms:{ front, office, hall4, living },
    spots:{
      o49_intercom:[75,47,4,8,74,72,"front",A("look")],
      o49_ramp:[176,40,40,22,196,72,"front",A("look")],
      cctv49_lobby:[152,44,14,11,160,80,"office",A("look")],
      doc49_b1:[126,44,16,9,134,80,"office",A("look")],
      o49_mail:[56,20,52,26,82,76,"office",A("rummage")],
      o49_door41:[50,16,24,44,62,78,"hall4",A("look")],
      o49_door42:[140,16,24,44,152,74,"hall4",A("look")],
      o49_stairs:[6,20,34,40,52,80,"hall4",A("look",{ face:-1 })],
      o49_tray:[18,49,10,4,24,78,"living",A("look")],
      o49_tv:[98,108,28,13,112,98,"living",A("look")]
    },
    details:{
      d49_plate:[109,44,7,5,112,72,"front",A("look")],
      d49_win4:[56,20,14,9,64,72,"front",A("look")],
      d49_gwin:[118,46,24,12,130,72,"front",A("look")],
      d49_cam:[110,2,12,10,116,80,"office",A("look")],
      d49_stairs1:[6,12,40,48,56,80,"office",A("look",{ face:-1 })],
      d49_cal:[130,14,16,12,140,80,"office",A("look")],
      d49_plate41:[56,8,12,6,70,76,"hall4",A("look")],
      d49_ext:[112,34,8,20,116,74,"hall4",A("look")],
      d49_win:[214,12,30,32,228,74,"hall4",A("look")],
      d49_photo:[60,14,14,16,66,78,"living",A("look")],
      d49_chain:[0,88,8,12,24,100,"living",A("look",{ face:-1 })],
      d49_ceiling:[104,0,16,9,112,84,"living",A("look")]
    },
    place:{
      wan:[ { room:"office", x:110, y:82, act:"read", facing:1 }, { room:"office", x:110, y:82, act:"idle", facing:1 } ],
      zou:[ { room:"hall4", x:176, y:80, act:"idle", facing:-1 }, null ],
      huo:[ { room:"office", x:70, y:92, act:"hold", facing:-1 }, null ]
    },
    extras:W0.extras || [],
    plan:[ { name:"4F", w:100, h:20, rooms:{ hall4:[0,0,50,20], living:[50,0,50,20] } },
           { name:"1F", w:100, h:30, rooms:{ office:[0,0,50,30], front:[50,0,50,30,"out"] } } ] });
})();

/* ================= 澄東牛肉麵（新的） ================= */
C49T && (() => {
  const { EP, T, O, sh, ph, A, has, tone, rainFx, setLoc } = C49T;
  const W0 = EP.world.noodle || {};

  /* ---------- 麵店：白磁磚的後牆、紅底白字的大菜單（牆角一張綠色的「轉角送」貼紙）；左上角掛著壞掉的監視器（沒有燈）；
       右邊是櫃台（出單機、收銀機、一疊外送袋）和後面的爐台（大湯鍋冒著白煙）；三張不鏽鋼小桌子、圓板凳；
       最前面的桌上一頂綠色的安全帽（A-3317）；下面是拉門（外面在下雨） ---------- */
  const shop = { name:"澄東牛肉麵", w:240, h:140, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 240, 60, "#eceae2", "tile", { base:"#8a3a2a" });
      // 大菜單
      p.R(104, 8, 68, 26, O); p.R(105, 9, 66, 24, "#9a2a1e"); p.R(105, 9, 66, 3, "#b83a2a"); for (let r = 0; r < 4; r++){ p.R(108, 14 + r * 5, 30, 2, "#f4ecd8"); p.R(152, 14 + r * 5, 14, 2, "#f4d070"); }
      // 「轉角送」的綠色貼紙
      p.R(174, 30, 8, 6, O); p.R(175, 31, 6, 4, "#3aa85a"); p.R(176, 32, 4, 1, "#f4f4f0");
      // 壞掉的監視器（左上角，沒有燈）
      p.R(4, 2, 3, 5, O); p.R(6, 3, 10, 6, O); p.R(7, 4, 8, 4, "#d8d4c8"); p.R(7, 4, 1, 4, "#2a2a2a"); p.R(9, 8, 4, 1, "#8a8a8a");
      // 爐台＋大湯鍋（後牆右邊）
      p.R(196, 30, 40, 30, "#c8c4b8"); p.R(196, 30, 40, 2, "#a8a498"); p.R(202, 22, 24, 18, O); p.R(203, 23, 22, 16, "#b8bcc0"); p.R(203, 23, 22, 3, "#d8dce0"); p.R(205, 26, 18, 2, "#6a4a2a");
      // 地：紅磚色的磁磚
      T.tiles(p, 0, 60, 240, 80, "#b07a5a", "#a46e50", 12);
      // 拉門（下面）、門口的地墊
      p.R(80, 136, 80, 4, "rgba(200,225,235,.8)"); p.R(119, 136, 2, 4, "#8a8e94"); p.R(96, 128, 48, 7, O); p.R(97, 129, 46, 5, "#3a5a3a");
      T.sides(p, this, "#6a3a2a", [["B", 80, 80]]);
    },
    props:[
      // 櫃台：出單機（紙捲拉出來一段）、收銀機、一疊外送袋
      { y:86, draw(p){ T.box(p, 146, 66, 80, 10, 12, "#c8c4b8", "#8a8478"); p.R(152, 60, 14, 9, O); p.R(153, 61, 12, 7, "#3a3a3e"); p.R(155, 58, 8, 4, "#f8f8f4"); p.R(156, 59, 6, 1, "#8a8a8a");
          p.R(176, 60, 16, 9, O); p.R(177, 61, 14, 7, "#5a5e64"); p.R(178, 62, 8, 3, "#3ae8a0"); p.R(198, 64, 14, 6, O); p.R(199, 65, 12, 4, "#f4ecd8"); p.R(200, 66, 10, 1, "#9a2a1e"); } },
      // 三張不鏽鋼小桌子＋圓板凳
      ...[[40, 84], [96, 84], [40, 116]].map(([x, y]) => ({ y:y + 12, draw(p){ T.box(p, x - 14, y - 6, 28, 12, 6, "#c8ccd0", "#8a9094", { legs:2 }); for (const sx of [x - 20, x + 20]){ p.R(sx - 4, y + 2, 8, 5, O); p.R(sx - 3, y + 3, 6, 3, "#c83a2a"); p.R(sx - 1, y + 7, 2, 4, "#5a5e64"); }
          p.R(x - 10, y - 4, 4, 4, O); p.R(x - 9, y - 3, 2, 2, "#c83a2a"); p.R(x + 6, y - 4, 5, 3, "#d8b070"); } })),
      // 最前面那一桌上的綠色安全帽（A-3317）、夾著一雙濕的手套
      { y:96.5, draw(p){ p.R(44, 78, 12, 9, O); p.R(45, 79, 10, 7, "#3aa85a"); p.R(45, 79, 10, 2, "#5ac87a"); p.R(47, 83, 6, 2, "#f4f4f0"); p.R(54, 84, 4, 3, "#3a3a44"); } }
    ],
    front(p, g, t, o){ for (let k = 0; k < 4; k++){ const y = 18 - ((t * 9 + k * 5) % 16); p.R(206 + k * 4 + Math.round(Math.sin(t + k) * 2), y, 3, 2, "rgba(250,250,250,.5)"); }
      C49T.fluo(p, 60, 2, 50); C49T.fluo(p, 160, 2, 50); tone(g, this, o, .25); },
    solid:[[0,0,240,62],[144,64,84,24],[24,76,32,22],[80,76,32,22],[24,108,32,22]],
    exits:[]
  };

  const XP = { x49_boss:{ room:"shop", x:130, y:100, act:"hold", facing:-1 } };
  setLoc("noodle", { start:"shop", spawn:[120,124], rooms:{ shop },
    spots:{
      doc49_slip:[152,58,14,11,160,96,"shop",A("read")],
      o49_menu:[104,8,68,26,128,72,"shop",A("read")],
      o49_helmet:[44,78,14,9,62,104,"shop",A("look",{ face:-1 })]
    },
    details:{
      d49_pot:[202,22,24,18,212,96,"shop",A("look")],
      d49_dcam:[4,2,12,8,20,72,"shop",A("look",{ face:-1 })]
    },
    place:{ rider:[ null, { room:"shop", x:76, y:122, act:"phone", facing:1 } ] },
    extras:(W0.extras || []).map(e => Object.assign({}, e, XP[e.id] || {}, { pose:undefined })),
    plan:[ { name:"澄東牛肉麵", w:100, h:24, rooms:{ shop:[0,0,100,24] } } ] });
})();

/* ================= 法院・公設辯護人室（＝第 40 集） ================= */
C49T && (() => {
  const { EP, T, O, ph, A, has, tone, setLoc } = C49T;
  const W0 = EP.world.court || {};
  const P = (typeof window !== "undefined" && window.PD40) || null;
  if (!P || typeof AT48 !== "function") return;

  /* ---------- 公設辯護人室：第 40 集同一間；白板上換成裴秀蓉的字（48 秒、18 分鐘）；問過以後，桌上三樣東西（牛皮紙袋、照片、地圖） ---------- */
  const pd = AT48(P, 0, {
    front(p, g, t, o){ C49T.fluo(p, 40, 2, 50); C49T.fluo(p, 150, 2, 50); tone(g, this, o, .25); },
    solid:[[58,48,54,12],[118,74,80,22],[212,56,24,12]],
    exits:[]
  });
  pd.props = pd.props.concat([
    // 裴秀蓉坐的椅子（桌子的右邊）
    { y:89.9, draw(p){ T.chair(p, 206, 90, "#3a3a44", "left"); } },
    // 白板：新寫的兩行
    { y:60.5, draw(p){ p.R(16, 19, 36, 18, "#f8f8f4"); p.R(18, 21, 6, 1, "#2a3a8a"); p.R(26, 21, 2, 1, "#c8302a"); p.R(30, 21, 8, 1, "#2a3a8a"); p.R(40, 21, 3, 1, "#c8302a"); p.R(44, 21, 6, 1, "#2a3a8a"); p.R(20, 27, 12, 1, "#2a3a8a"); p.R(20, 29, 12, 1, "#2a3a8a"); p.R(36, 28, 10, 1, "#c8302a"); } },
    // 桌上：牛皮紙袋、照片、地圖
    { y:96.5, draw(p){ if (!has("y2")) return; p.R(124, 76, 13, 7, O); p.R(125, 77, 11, 5, "#c8a060"); p.R(140, 76, 12, 8, O); p.R(141, 77, 10, 6, "#f4f4f0"); p.R(142, 78, 6, 3, "#3a4a5a"); p.R(155, 76, 12, 8, O); p.R(156, 77, 10, 6, "#e8f0e0"); p.R(157, 80, 8, 1, "#3a6ac8"); p.R(164, 79, 2, 2, "#c8302a"); } }
  ]);

  const XP = { x49_pei:{ room:"pd", x:206, y:90, act:"sit", facing:-1, view:"side" } };
  setLoc("court", { start:"pd", spawn:[40,110], rooms:{ pd },
    spots:{
      doc49_plat:[124,76,13,7,130,104,"pd",A("read")],
      doc49_photo:[140,76,12,8,146,104,"pd",A("look")],
      doc49_gps:[155,76,12,8,162,104,"pd",A("look")],
      o49_file:[60,8,50,52,86,72,"pd",A("rummage")]
    },
    details:{
      d49_robe:[214,20,22,40,206,80,"pd",A("look",{ face:1 })],
      d49_board:[14,12,40,28,34,72,"pd",A("read")],
      d49_pwin:[130,10,36,30,148,68,"pd",A("look")]
    },
    place:{ fang:[ null, { room:"pd", x:124, y:68, act:"idle", facing:1 } ] },
    extras:(W0.extras || []).map(e => Object.assign({}, e, XP[e.id] || {}, { pose:undefined })),
    plan:[ { name:"法院・二樓", w:100, h:24, rooms:{ pd:[0,0,100,24] } } ] });
})();
