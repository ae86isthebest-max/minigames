/* =========================================================
   第 40 集・俯視版（topdown.js）
   上午：海風咖啡（外面的座位＝劇情畫面的騎樓，下雨；店裡＝第 38 集，櫃台修好了）、警察局一樓大廳（＝第 14 集）、
   你住的公寓（＝第 38 集：樓下、一樓大廳、四樓走廊、客廳）、澄港地方法院（門口、一樓大廳、公設辯護人室：新的）；
   下午：法院的地下一樓（候審室、律見室：新的）。整天都在下雨。這一集的「你」是沈岳；跟著你的上午是周振邦、下午是裴秀蓉（不畫）。
   ========================================================= */
const C40T = typeof TOPEP === "function" ? TOPEP("custody") : null;

/* ================= 海風咖啡 ================= */
C40T && (() => {
  const { EP, T, O, A, has, setLoc } = C40T;
  const W0 = EP.world.cafe || {};
  let ST = null; const st = () => ST || (ST = (typeof TOPSCENE !== "undefined" && TOPSCENE.STAGES && TOPSCENE.STAGES.cafe) ? TOPSCENE.STAGES.cafe({ time:"morning", ep:40, rain:true }).room : null);
  /* ---------- 外面的座位：下雨的早上（雨棚多拉出來了）；最左邊那一桌是你的：信封、杯子、手機、傳票；往店裡的門 ---------- */
  const seat = { name:"海風咖啡・外面的座位", w:320, h:162, wall:58,
    floor(p, g, t, o){ const R = st(); if (R) R.floor.call(this, p, g, t, o); else p.R(0, 0, 320, 162, "#8a8a86");
      T.backDoor(p, 87, 27, 28, 31, C40T.dA("seat", "shop"), "#6a4a32", { frame:"#4a3222" }); p.R(91, 30, 20, 12, "#9cc5e6"); p.R(90, 44, 22, 5, "#f4f0e0"); p.R(93, 46, 16, 1, "#2a7a8a"); },
    get props(){ const R = st(); return (R ? R.props : []).concat([
      { y:107, draw(p){ p.R(80, 98, 8, 6, O); p.R(81, 99, 6, 4, "#c8a46a"); p.R(81, 100, 6, 1, "#a8844a");
          p.R(89, 99, 6, 4, O); p.R(90, 100, 4, 2, "#1e1e22"); p.R(91, 100, 2, 1, "#5a8ab8");
          p.R(96, 98, 7, 6, O); p.R(97, 99, 5, 4, "#f8f8f4"); p.R(97, 101, 5, 1, "#c8c8c4"); } } ]); },
    front(p, g, t, o){ const R = st(); if (R && R.front) R.front.call(this, p, g, t, o); },
    solid:[[0,0,320,60],[68,88,48,22],[144,88,48,22],[220,88,48,22],[122,70,18,18],[296,72,16,14],[0,136,320,26]],
    exits:[ { r:[86,58,30,10], to:"shop", at:[36,118], label:"店裡面", kind:"door", art:[86,26,30,32] } ]
  };
  const S0 = typeof MK38SHOP === "function" ? MK38SHOP(C40T, { ep40:true }) : null;
  const shop = S0 ? Object.assign({}, S0, {
    floor(p, g, t, o){ S0.floor.call(this, p, g, t, o); p.R(156, 10, 22, 18, O); p.R(157, 11, 20, 16, "#2a3a2e"); for (let k = 0; k < 4; k++) p.R(159, 13 + k * 3, 14 - (k % 2) * 5, 1, "#e8e8e0"); p.R(159, 25, 10, 1, "#f4a0a0"); },
    exits:S0.exits.filter(e => e.to === "seat") }) : null;
  const XP = { x40_xu:{ room:"seat", x:208, y:80, act:"cross", facing:-1 }, x40_wu:{ room:"seat", x:232, y:80, act:"idle", facing:-1 },
    x40_su:{ room:"seat", x:266, y:107, act:"sit", facing:-1, view:"side" }, x40_mom:{ room:"shop", x:212, y:76, act:"hold", facing:-1 } };
  setLoc("cafe", { start:"seat", spawn:[200,124], rooms:shop ? { seat, shop } : { seat },
    spots:{
      doc40_phone:[88,98,8,6,92,118,"seat",A("read")],
      o40_envelope:[79,97,10,8,84,118,"seat",A("read")],
      doc40_invoice:[104,66,16,12,112,100,"shop",A("type",{ face:-1 })],
      o40_counter:[100,70,80,24,140,100,"shop",A("look")]
    },
    details:{
      d40_paper:[95,97,9,8,100,118,"seat",A("read")],
      d40_right:[232,88,24,16,244,118,"seat",A("look")],
      d40_dog:[176,108,22,10,186,124,"seat",A("look")],
      d40_street:[0,132,320,30,200,126,"seat",A("look")],
      d40_awning:[0,12,150,16,60,72,"seat",A("look")],
      d40_board:[156,10,22,18,166,100,"shop",A("read")],
      d40_cups:[19,9,36,22,37,100,"shop",A("look")],
      d40_mark:[118,6,30,26,133,100,"shop",A("look")],
      d40_cooker:[24,64,24,14,34,100,"shop",A("look")],
      d40_alarm:[182,26,12,14,192,72,"shop",A("look",{ face:-1 })]
    },
    place:{
      ye:[ { room:"seat", x:148, y:107, act:"sit", facing:1, view:"side" } ],
      abin:[ { room:"shop", x:100, y:104, act:"wipe", facing:-1 } ]
    },
    extras:(W0.extras || []).map(e => Object.assign({}, e, XP[e.id] || {}, { pose:undefined })),
    intro:[ { set:{ room:"seat", px:200, py:136 }, hide:true }, { wait:0.3, hide:true }, { set:{ room:"seat", px:200, py:124 } },
      ...(W0.intro || []).filter(k => k.say || (k.wait && !k.hide)).map(k => k.say && k.say[0] === "wu" && /點畫面上的箭嘴|📍|清單不是全部/.test(k.say[1]) ? null : k).filter(Boolean) ],
    plan:[ { name:"海風咖啡", w:100, h:46, rooms:{ shop:[6,0,46,18], seat:[0,18,100,28,"out"] } } ] });
})();

/* ================= 警察局・一樓大廳（＝第 14 集） ================= */
C40T && (() => {
  const { EP, T, O, A, setLoc } = C40T;
  const W0 = EP.world.police || {};
  const L0 = (typeof window !== "undefined" && window.PD14 && window.PD14.lobby) || null;
  /* ---------- 值班台上多了一本攤開的外出登記簿；公布欄正中間是一張蓋紅章的公告；牆上的警徽；往樓上的牌子下面貼了一張紅邊的紙 ---------- */
  const lobby = { name:"警察局・一樓大廳", w:300, h:150, wall:60,
    floor(p, g, t, o){ if (L0) L0.floor.call(this, p, g, t, o); else p.R(0, 0, 300, 150, "#d4ccb8");
      p.R(27, 20, 20, 18, O); p.R(28, 21, 18, 16, "#f8f8f4"); for (let k = 0; k < 4; k++) p.R(30, 23 + k * 3, 12, 1, "#5a5a5a"); p.R(38, 31, 6, 5, "#c83a2a");
      p.R(92, 12, 16, 18, O); p.R(93, 13, 14, 16, "#e9c43a"); p.R(96, 16, 8, 8, "#2a4a8a"); p.R(99, 18, 2, 4, "#e9c43a");
      p.R(166, 6, 38, 9, O); p.R(167, 7, 36, 7, "#2a6a3a"); p.R(196, 9, 4, 3, "#f4f0e0"); p.R(198, 8, 1, 1, "#f4f0e0"); p.R(170, 10, 22, 1, "#f4f0e0"); p.R(170, 17, 22, 10, O); p.R(171, 18, 20, 8, "#f8f8f4"); p.R(171, 18, 20, 1, "#c83a2a"); p.R(171, 25, 20, 1, "#c83a2a"); p.R(173, 21, 14, 1, "#5a5a5a"); },
    props:(L0 ? L0.props : []).concat([ { y:110, draw(p){ p.R(60, 76, 14, 8, O); p.R(61, 77, 6, 6, "#f8f4e8"); p.R(67, 77, 6, 6, "#f4f0e0"); p.R(62, 79, 4, 1, "#5a5a5a"); p.R(68, 79, 4, 1, "#5a5a5a"); } } ]),
    front(p, g, t, o){ if (L0) L0.front.call(this, p, g, t, o); },
    solid:L0 ? L0.solid : [],
    exits:[]
  };
  const XP = { x40_liu:{ room:"lobby", x:116, y:66, act:"idle", facing:1 } };
  setLoc("police", { start:"lobby", spawn:[150,136], rooms:{ lobby },
    spots:{
      doc40_outlog:[59,75,16,10,50,92,"lobby",A("read")],
      doc40_reissue:[26,18,22,22,38,70,"lobby",A("read")]
    },
    details:{
      d40_up:[166,6,38,22,184,72,"lobby",A("read")],
      d40_emblem:[92,12,16,18,100,70,"lobby",A("look")],
      d40_mon:[64,62,20,12,50,78,"lobby",A("look")],
      d40_b1:[236,98,58,44,220,120,"lobby",A("look",{ face:1 })],
      d40_clock:[146,4,16,16,152,70,"lobby",A("look")]
    },
    place:{ li:[ { room:"lobby", x:46, y:100, act:"hold", facing:-1 } ] },
    extras:(W0.extras || []).map(e => Object.assign({}, e, XP[e.id] || {}, { pose:undefined })),
    plan:[ { name:"澄港警察局・一樓", w:100, h:20, rooms:{ lobby:[0,0,100,20] } } ] });
})();

/* ================= 你住的公寓（＝第 38 集） ================= */
C40T && (() => {
  const { EP, A, setLoc } = C40T;
  const W0 = EP.world.home || {};
  const H = typeof MK38HOME === "function" ? MK38HOME(C40T, { ep40:true }) : null;
  if (!H) return;
  const front = H.front, office = H.office, hall4 = H.hall4;
  const living = Object.assign({}, H.living, { exits:H.living.exits.filter(e => e.to === "hall4") });
  const XP = { x40_zou:{ room:"hall4", x:130, y:80, act:"idle", facing:-1 } };
  setLoc("home", { start:"front", spawn:[150,104], rooms:{ front, office, hall4, living },
    spots:{
      o40_ramp:[176,34,40,28,196,72,"front",A("look")],
      cctv40_lobby:[152,44,14,11,159,78,"office",A("type",{ actT:2 })],
      doc40_visit:[132,54,16,6,140,78,"office",A("read")],
      doc40_fee:[180,51,8,7,190,78,"office",A("read")],
      o40_pot:[48,62,12,9,64,80,"hall4",A("crouch")],
      doc40_seize:[18,48,10,5,24,76,"living",A("read")],
      doc40_lease:[10,56,16,6,32,76,"living",A("read")],
      o40_passport:[90,120,22,12,78,120,"living",A("crouch",{ face:1 })],
      doc40_bank:[112,120,22,12,146,120,"living",A("crouch",{ face:-1 })],
      o40_ceiling:[104,0,16,11,112,82,"living",A("look")]
    },
    details:{
      d40_win4:[54,18,12,10,60,74,"front",A("look")],
      d40_nb:[56,44,18,15,65,72,"front",A("read")],
      d40_alley:[26,118,58,30,60,108,"front",A("look")],
      d40_mail:[56,20,52,26,82,72,"office",A("look")],
      d40_cam:[108,4,14,10,112,72,"office",A("look")],
      d40_stair:[6,12,40,48,54,78,"office",A("look",{ face:-1 })],
      d40_keys:[168,16,16,20,182,78,"office",A("look")],
      d40_bench:[222,54,32,12,238,74,"office",A("look")],
      d40_lamp:[136,10,32,50,152,74,"hall4",A("look")],
      d40_meter:[84,20,20,22,94,72,"hall4",A("look")],
      d40_ext:[112,34,10,20,116,72,"hall4",A("look")],
      d40_photo:[60,14,14,16,67,74,"living",A("look")],
      d40_box:[206,62,26,20,218,90,"living",A("look")],
      d40_sofa:[84,44,56,30,150,82,"living",A("look",{ face:-1 })],
      d40_chair:[42,28,10,34,62,74,"living",A("look",{ face:-1 })],
      d40_chain:[0,88,8,12,16,104,"living",A("look",{ face:-1 })]
    },
    place:{ wan:[ { room:"office", x:100, y:86, act:"idle", facing:1 } ] },
    extras:(W0.extras || []).map(e => Object.assign({}, e, XP[e.id] || {}, { pose:undefined })),
    plan:[ { name:"澄東路 112 巷 6 號・四樓", w:100, h:36, rooms:{ hall4:[0,0,100,12], living:[0,12,60,24] } },
           { name:"一樓", w:100, h:30, rooms:{ office:[0,0,100,14], front:[0,14,100,16,"out"] } } ] });
})();

/* ================= 澄港地方法院 ================= */
C40T && (() => {
  const { EP, T, O, sh, dA, A, rain, tone, fluo, window2, vinyl, rainFx, setLoc } = C40T;
  const W0 = EP.world.court || {};

  /* ---------- 法院門口（下雨）：旗桿（旗子濕了貼在桿上）；法院（牌子、四根柱子、大門、台階）；右邊是地檢署（牌子、門），中間一條有屋頂的走廊；
       廣場上的指標牌（「偵查庭 報到處」）；台階旁邊兩支攝影機腳架（套著透明的雨衣） ---------- */
  const cfront = { name:"法院・門口", w:320, h:160, wall:70,
    floor(p, g, t, o){
      p.R(0, 0, 320, 70, "#7a8694"); p.R(0, 0, 320, 8, "#6a7684");
      // 法院
      p.R(30, 4, 196, 66, O); p.R(31, 5, 194, 65, "#d8d4c8"); p.R(31, 5, 194, 4, "#b8b4a8"); p.R(78, 12, 100, 14, O); p.R(79, 13, 98, 12, "#3a3a3e"); for (let k = 0; k < 6; k++) p.R(84 + k * 15, 15, 11, 8, "#e9c43a");
      for (const x of [62, 96, 158, 192]){ p.R(x, 30, 8, 40, O); p.R(x + 1, 31, 6, 39, "#e8e4d8"); p.R(x + 1, 31, 2, 39, "#f4f0e8"); }
      for (const x of [40, 210]){ p.R(x, 34, 12, 20, O); p.R(x + 1, 35, 10, 18, "#8aa0b0"); }
      p.R(114, 36, 32, 34, O); T.backDoor(p, 116, 38, 28, 32, dA("cfront", "chall"), "#6a4a32", { frame:"#4a3222", inside:"#2a2620" }); p.R(129, 38, 2, 32, "#4a3222");
      // 有屋頂的走廊、地檢署
      p.R(226, 40, 18, 30, "#a8acb0"); p.R(226, 38, 18, 4, "#7a7e84"); p.R(228, 44, 14, 26, "#4a4e54");
      p.R(244, 14, 76, 56, O); p.R(245, 15, 75, 55, "#c8c8c0"); p.R(252, 22, 60, 10, O); p.R(253, 23, 58, 8, "#3a3a3e"); for (let k = 0; k < 4; k++) p.R(256 + k * 14, 25, 10, 4, "#e8e4d8");
      p.R(268, 40, 22, 30, O); p.R(269, 41, 20, 29, "#8aa0b0"); p.R(278, 41, 1, 29, "#4a5a64");
      // 台階、廣場
      for (let k = 0; k < 3; k++){ p.R(80, 70 + k * 5, 100, 5, sh("#b8b4a8", -k * .06)); p.R(80, 70 + k * 5, 100, 1, "#d8d4c8"); }
      T.tiles(p, 0, 70, 320, 90, "#8a8e90", "#84888a", 16); for (let k = 0; k < 3; k++){ p.R(80, 70 + k * 5, 100, 5, sh("#b8b4a8", -k * .08)); p.R(80, 70 + k * 5, 100, 1, "#d8d4c8"); }
      PUD38(p, 10, 96, 300, 56, 7, 401);
      T.sides(p, this, "#5a5e64", []);
    },
    props:[
      // 旗桿（濕的旗子貼在桿上）
      { y:76, draw(p){ p.R(12, 4, 4, 72, O); p.R(13, 5, 2, 70, "#c8ccd0"); p.R(15, 8, 4, 18, "#a83a3a"); p.R(15, 8, 4, 6, "#2a4a8a"); p.R(9, 72, 10, 4, O); p.R(10, 73, 8, 2, "#8a8e94"); } },
      // 指標牌（偵查庭 報到處 →）
      { y:78, draw(p){ p.R(228, 60, 2, 18, O); p.R(220, 50, 18, 14, O); p.R(221, 51, 16, 12, "#f4f4f0"); p.R(223, 53, 8, 2, "#2a4a8a"); p.R(231, 53, 4, 4, "#2a4aa8"); p.R(223, 57, 10, 1, "#5a5a5a"); p.R(222, 60, 14, 2, "#f4e8a0"); } },
      // 兩支攝影機腳架（透明的雨衣）
      { y:100, draw(p){ for (const x of [184, 200]){ p.R(x + 3, 84, 2, 16, O); p.R(x, 98, 8, 2, O); p.R(x, 78, 9, 7, O); p.R(x + 1, 79, 7, 5, "#2a2a2e"); p.R(x - 1, 77, 11, 9, "rgba(220,235,245,.35)"); } } }
    ],
    front(p, g, t, o){ tone(g, this, o, .5); rainFx(p, g, this, t, o, 0); },
    solid:[[0,0,320,70],[10,70,10,6],[226,72,6,6],[182,94,28,8]],
    exits:[ { r:[116,70,28,6], to:"chall", at:[40,128], label:"法院的大門（一樓大廳）", kind:"door", art:[116,38,28,32] } ]
  };

  /* ---------- 法院一樓大廳：入口的金屬探測門；「什麼是羈押？」的海報；電子看板，下面是服務台；出納室的牌子和窗口；提款機；
       公設辯護人室的門；角落的傘架（地上一灘水） ---------- */
  const chall = { name:"法院・一樓大廳", w:320, h:150, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 320, 60, "#e4e0d4", "plain", { base:"#6a5a4a" });
      p.R(56, 12, 36, 34, O); p.R(57, 13, 34, 32, "#f8f4e8"); p.R(57, 13, 34, 7, "#2a4a8a"); p.R(60, 15, 20, 3, "#f4f4f0"); for (let k = 0; k < 6; k++) p.R(60, 23 + k * 3, 26 - (k % 3) * 4, 1, "#5a5a5a");
      p.R(104, 10, 46, 20, O); p.R(105, 11, 44, 18, "#1a1a1e"); for (let k = 0; k < 4; k++) p.R(107, 13 + k * 4, 30 + (k % 2) * 8, 2, k === 2 ? "#ff8a3a" : "#3ae88a");
      p.R(178, 10, 34, 6, O); p.R(179, 11, 32, 4, "#3a3a3e"); p.R(176, 18, 38, 38, O); p.R(177, 19, 36, 36, "#8a6a4a"); p.R(180, 22, 30, 22, "#c8dce4"); p.R(180, 44, 30, 6, "#e8e4d8"); p.R(184, 24, 16, 10, "#f8f8f4"); p.R(185, 26, 12, 1, "#c83a2a");
      p.R(220, 20, 20, 40, O); p.R(221, 21, 18, 39, "#e8e4d8"); p.R(221, 21, 18, 6, "#2a6a3a"); p.R(224, 29, 12, 9, "#3a5a7a"); p.R(225, 30, 6, 2, "#f4f4f0"); p.R(224, 42, 12, 3, "#5a5a5a");
      T.backDoor(p, 258, 16, 24, 44, dA("chall", "pd"), "#8a6a4a", { frame:"#5a3a22" }); p.R(260, 8, 20, 7, O); p.R(261, 9, 18, 5, "#e8e2d2"); p.R(263, 10, 14, 2, "#3a3a3a"); p.R(262, 30, 14, 10, "#f8f8f4");
      vinyl(p, 0, 60, 320, 90, "#c8c4b8", "#c0bcb0", 18); p.R(292, 82, 22, 6, "rgba(90,110,130,.4)");
      T.sides(p, this, "#6a5a4a", [["B", 20, 40]]);
    },
    props:[
      // 金屬探測門
      { y:104, draw(p){ p.R(22, 74, 6, 30, O); p.R(23, 75, 4, 28, "#c8ccd0"); p.R(50, 74, 6, 30, O); p.R(51, 75, 4, 28, "#c8ccd0"); p.R(22, 72, 34, 6, O); p.R(23, 73, 32, 4, "#a8acb0"); p.R(36, 74, 6, 2, "#3ae85a"); } },
      // 服務台（按鈴、訴訟輔導的單子）
      { y:92, draw(p){ T.box(p, 100, 72, 56, 8, 10, "#e8e4dc", "#6a5a4a"); p.R(112, 73, 4, 3, "#c8a050"); p.R(130, 73, 14, 5, O); p.R(131, 74, 12, 3, "#f8f4e8"); } },
      // 傘架（藍的、黑的、斷了一根骨的紅傘）
      { y:78, draw(p){ p.R(300, 66, 12, 12, O); p.R(301, 67, 10, 10, "#5a5e64"); p.R(302, 60, 2, 8, "#2a4ad8"); p.R(305, 58, 2, 10, "#1a1a1e"); p.R(308, 61, 2, 7, "#c83a2a"); p.R(309, 59, 3, 2, "#c83a2a"); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 60); fluo(p, 200, 2, 60); tone(g, this, o, .25); },
    solid:[[20,74,10,30],[48,74,10,30],[98,70,60,22],[220,52,20,10],[298,64,16,14]],
    exits:[ { r:[20,144,40,6], to:"cfront", at:[130,84], label:"法院的門口", kind:"out", art:[20,140,40,10] },
            { r:[258,60,24,8], to:"pd", at:[36,104], label:"公設辯護人室", kind:"door", art:[258,16,24,44] } ]
  };

  /* ---------- 公設辯護人室：白板（值班表）；書架（六法全書一年一本、最下面一排黑色的筆記本）；窗（下雨；外面是法院的後面、一台囚車）；
       辦公桌（卷宗、摺好的報紙、茶杯、檯燈）；衣架上的法袍（綠色的邊） ---------- */
  const pd = { name:"公設辯護人室", w:256, h:150, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 60, "#e8e4d8", "plain", { base:"#6a5a4a" });
      p.R(14, 12, 40, 28, O); p.R(15, 13, 38, 26, "#f8f8f4"); p.R(15, 13, 38, 4, "#2a4a8a"); for (let r = 0; r < 3; r++){ p.R(17, 20 + r * 6, 34, 1, "#a8a8b0"); p.R(20, 22 + r * 6, 10, 1, "#3a3a3a"); } p.R(32, 34, 14, 2, "#c83a2a");
      window2(p, 130, 10, 36, 30, o, t, (x, y, w, h) => { p.R(x, y + h - 10, w, 10, "#7a7a76"); p.R(x + 6, y + h - 16, 18, 10, "#f4f4f0"); p.R(x + 8, y + h - 14, 6, 4, "#3a4a5a"); p.R(x + 18, y + h - 15, 4, 8, "#2a2a2e"); }, "#d8d4cc");
      vinyl(p, 0, 60, 256, 90, "#b8b4a8", "#b0aca0", 16);
      T.sides(p, this, "#6a5a4a", [["L", 86, 30]]); T.sideDoor(p, this, "L", 86, 30, dA("pd", "chall"), "#8a6a4a");
    },
    props:[
      { y:60, draw(p){ T.shelf(p, 60, 8, 50, 52, 4); } },
      { y:96, draw(p){ T.box(p, 120, 76, 76, 8, 10, "#8a6a4a", "#6a4a2a"); p.R(124, 77, 14, 6, "#c8a46a"); p.R(125, 78, 12, 1, "#a8844a"); p.R(142, 77, 12, 6, "#e8e4dc"); p.R(143, 78, 8, 1, "#5a5a5a"); p.R(160, 77, 5, 5, O); p.R(161, 78, 3, 3, "#f4f0e8"); p.R(176, 70, 2, 12, O); p.R(172, 68, 10, 4, O); p.R(173, 69, 8, 2, "#3a6a3a"); } },
      { y:68, draw(p){ p.R(224, 18, 2, 50, O); p.R(218, 64, 14, 4, O); p.R(216, 20, 18, 3, O); p.R(214, 22, 22, 38, O); p.R(215, 23, 20, 36, "#141418"); p.R(215, 23, 20, 4, "#2a8a4a"); p.R(215, 23, 3, 30, "#2a8a4a"); p.R(232, 23, 3, 30, "#2a8a4a"); } }
    ],
    front(p, g, t, o){ fluo(p, 40, 2, 50); fluo(p, 150, 2, 50); tone(g, this, o, .25); },
    solid:[[58,48,54,12],[118,74,80,22],[212,56,24,12]],
    exits:[ { r:[0,86,8,30], to:"chall", at:[270,72], label:"一樓大廳", kind:"door", art:[0,84,8,34] } ]
  };

  const XP = { x40_he:{ room:"cfront", x:176, y:108, act:"write", facing:1 }, x40_guard:{ room:"chall", x:68, y:100, act:"idle", facing:-1 } };
  setLoc("court", { start:"cfront", spawn:[130,134], rooms:{ cfront, chall, pd },
    spots:{
      doc40_notice:[220,50,18,14,228,90,"cfront",A("read")],
      doc40_duty:[14,12,40,28,34,72,"pd",A("read")],
      doc40_law:[56,12,36,34,74,72,"chall",A("read")],
      doc40_board:[104,10,46,20,128,100,"chall",A("read")],
      doc40_bail:[176,18,38,38,195,72,"chall",A("read")]
    },
    details:{
      d40_csign:[78,12,100,14,130,100,"cfront",A("look")],
      d40_pros:[244,14,76,56,282,90,"cfront",A("look")],
      d40_tripod:[182,76,28,26,196,112,"cfront",A("look")],
      d40_flag:[8,4,14,72,26,90,"cfront",A("look",{ face:-1 })],
      d40_gate:[20,72,38,32,40,116,"chall",A("look")],
      d40_desk:[100,70,56,12,144,100,"chall",A("look")],
      d40_atm:[220,20,20,40,230,72,"chall",A("look")],
      d40_umb:[298,58,16,20,296,92,"chall",A("look")],
      d40_pdoor:[258,8,24,52,276,72,"chall",A("read")],
      d40_robe:[212,18,24,50,208,80,"pd",A("look",{ face:1 })],
      d40_books:[58,8,54,52,96,72,"pd",A("look")],
      d40_news:[140,76,16,8,148,102,"pd",A("read")],
      d40_pwin:[130,10,36,30,148,70,"pd",A("look")]
    },
    place:{ pei:[ { room:"pd", x:82, y:72, act:"read", facing:-1 } ] },
    extras:(W0.extras || []).map(e => Object.assign({}, e, XP[e.id] || {}, { pose:undefined })),
    plan:[ { name:"澄港地方法院・一樓", w:100, h:38, rooms:{ chall:[0,0,70,18], pd:[70,0,30,18], cfront:[0,18,100,20,"out"] } } ] });
})();

/* ================= 法院的地下一樓（下午） ================= */
C40T && (() => {
  const { EP, T, O, dA, A, tone, fluo, vinyl, setLoc } = C40T;
  const W0 = EP.world.hold || {};

  /* ---------- 候審室：左邊是鐵柵門（外面是走廊、往第二法庭的樓梯）；牌子；很高的毛玻璃窗（有鐵條）；固定的長椅，上面的牆有一根扣手銬的鐵桿；
       時鐘；放保管袋的架子；角落的鏡頭；法警的桌子（報到單、電話）；往律見室的門 ---------- */
  const cell = { name:"候審室", w:256, h:150, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 60, "#c8ccc4", "plain", { base:"#5a5e5a" });
      p.R(10, 12, 26, 10, O); p.R(11, 13, 24, 8, "#f4f4f0"); p.R(13, 15, 20, 1, "#3a3a3a"); p.R(13, 18, 14, 1, "#3a3a3a");
      p.R(60, 8, 30, 14, O); p.R(61, 9, 28, 12, "#c8d0d4"); for (let x = 64; x < 90; x += 5) p.R(x, 8, 1, 14, "#3a3e42");
      p.R(20, 40, 90, 2, O); p.R(20, 40, 90, 1, "#a8acb0"); for (let x = 30; x < 110; x += 20) p.R(x, 38, 2, 5, "#5a5e64");
      p.R(118, 10, 12, 12, O); p.R(119, 11, 10, 10, "#f4f4f0"); p.R(123, 12, 1, 5, O); p.R(123, 16, 4, 1, O);
      p.R(136, 28, 24, 16, O); p.R(137, 29, 22, 14, "#8a8e94"); p.R(137, 36, 22, 1, "#5a5e64"); p.R(139, 30, 8, 6, "#dfe8ea"); p.R(149, 30, 8, 6, "#dfe8ea"); p.R(140, 31, 3, 1, "#c83a2a");
      T.cam(p, 166, 4, -1, t);
      T.backDoor(p, 224, 16, 24, 44, dA("cell", "meet"), "#7a8288", { frame:"#4a5056" }); p.R(230, 8, 12, 6, O); p.R(231, 9, 10, 4, "#e8e2d2");
      vinyl(p, 0, 60, 256, 90, "#a8aca4", "#a0a49c", 16);
      T.sides(p, this, "#5a5e5a", [["L", 84, 36]]);
      // 鐵柵門
      p.R(0, 84, 8, 36, "#2a2e32"); for (let y = 86; y < 120; y += 4) p.R(1, y, 6, 1, "#8a8e94"); p.R(6, 84, 2, 36, "#5a5e64");
    },
    props:[
      // 固定的長椅（椅面磨得發亮）
      { y:66, draw(p){ T.box(p, 20, 52, 90, 6, 8, "#a87a50", "#6a4a2a"); p.R(20, 52, 90, 1, "#c89a70"); for (const x of [24, 102]) p.R(x, 66, 4, 2, O); } },
      // 法警的桌子：報到單、電話
      { y:94, draw(p){ T.box(p, 170, 74, 46, 8, 10, "#8a8e94", "#5a5e64"); p.R(184, 75, 12, 6, O); p.R(185, 76, 10, 4, "#f8f8f4"); p.R(186, 77, 6, 1, "#5a5a5a"); p.R(204, 75, 8, 5, O); p.R(205, 76, 6, 3, "#2a2a2e"); } }
    ],
    front(p, g, t, o){ fluo(p, 40, 2, 60); fluo(p, 160, 2, 50); tone(g, this, o, .3); },
    solid:[[18,50,94,18],[168,72,50,22]],
    exits:[ { r:[224,60,24,8], to:"meet", at:[36,104], label:"律見室", kind:"door", art:[224,16,24,44] } ]
  };

  /* ---------- 律見室：牆上的牌子（本室錄影 不錄音）；角落的鏡頭（紅燈）；對著走廊的小窗（夾鐵絲的玻璃，外面一個背影）、對講機；
       長桌：聲請書（最厚、紅色的標籤）和附件一到七，一疊一疊排好；裴秀蓉的短鉛筆；兩張側面的椅子 ---------- */
  const PILE = [["#c83a2a", 8], ["#2a4a9a", 3], ["#2a4a9a", 4], ["#2a4a9a", 5], ["#2a4a9a", 3], ["#2a7a4a", 5], ["#2a7a4a", 4], ["#8a8a8e", 3]];
  const meet = { name:"律見室", w:256, h:150, wall:60,
    floor(p, g, t, o){
      T.backWall(p, 0, 256, 60, "#d8dcd4", "plain", { base:"#5a5e5a" });
      p.R(60, 10, 72, 12, O); p.R(61, 11, 70, 10, "#f4f4f0"); for (let k = 0; k < 8; k++) p.R(64 + k * 8, 13, 6, 6, "#2a2a2e");
      p.R(198, 4, 9, 7, O); p.R(199, 5, 7, 5, "#e8e8e4"); p.R(201, 7, 3, 2, "#2a2a2e"); p.R(205, 5, 1, 1, Math.floor(t * 2) % 2 ? "#e83a2a" : "#6a1a1a");
      p.R(208, 16, 30, 24, O); p.R(209, 17, 28, 22, "#a8b4bc"); for (let k = 0; k < 28; k += 4){ p.R(209 + k, 17, 1, 22, "#8a969e"); p.R(209, 17 + k * .8, 28, 1, "#8a969e"); } p.R(218, 22, 10, 17, "#3a4a5a"); p.R(220, 18, 6, 5, "#3a4a5a");
      p.R(240, 26, 6, 9, O); p.R(241, 27, 4, 7, "#c8ccd0"); p.R(242, 29, 2, 2, "#2a2a2e");
      vinyl(p, 0, 60, 256, 90, "#b8bcb4", "#b0b4ac", 16);
      T.sides(p, this, "#5a5e5a", [["L", 86, 30]]); T.sideDoor(p, this, "L", 86, 30, dA("meet", "cell"), "#7a8288");
    },
    props:[
      { y:94, draw(p){ T.box(p, 30, 70, 172, 12, 10, "#c8b898", "#8a7a5a");
          PILE.forEach(([c, n], k) => { const x = 36 + k * 16; p.R(x, 76 - n, 12, n + 2, O); p.R(x + 1, 77 - n, 10, n, "#f8f8f4"); for (let j = 0; j < n; j += 2) p.R(x + 1, 77 - n + j, 10, 1, "#e0e0dc"); p.R(x + 8, 76 - n, 3, 2, c); });
          p.R(170, 78, 9, 1, "#e9c43a"); p.R(169, 78, 1, 1, "#3a3a3a"); } },
      { y:84, draw(p){ T.chair(p, 22, 84, "#5a5e64", "right"); T.chair(p, 210, 84, "#5a5e64", "left"); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 50); fluo(p, 160, 2, 50); tone(g, this, o, .3); },
    solid:[[28,62,176,30],[14,74,16,12],[204,74,16,12]],
    exits:[ { r:[0,86,8,30], to:"cell", at:[236,72], label:"候審室", kind:"door", art:[0,84,8,34] } ]
  };

  const DOCS = ["doc40_motion", "doc40_ballistic", "doc40_armlog", "doc40_scene", "doc40_lincalls", "doc40_li1", "doc40_li2", "doc40_dvr"];
  const spots = { doc40_checkin:[184,74,12,7,190,100,"cell",A("read")] };
  DOCS.forEach((id, k) => { const x = 36 + k * 16; spots[id] = [x, 66, 12, 12, x + 6, 98, "meet", A("read")]; });
  setLoc("hold", { start:"cell", spawn:[120,110], rooms:{ cell, meet },
    spots,
    details:{
      d40_bag:[136,28,24,16,148,72,"cell",A("look")],
      d40_bench2:[20,50,90,16,64,74,"cell",A("look")],
      d40_bar:[20,36,90,8,40,74,"cell",A("look")],
      d40_gatebar:[0,82,8,40,18,100,"cell",A("look",{ face:-1 })],
      d40_clock2:[118,10,12,12,124,72,"cell",A("look")],
      d40_cwin:[60,8,30,14,84,74,"cell",A("look")],
      d40_msign:[60,10,72,12,96,98,"meet",A("read")],
      d40_mcam:[196,2,12,10,196,98,"meet",A("look")],
      d40_mwin:[208,16,30,24,228,72,"meet",A("look")],
      d40_pencil:[166,76,14,4,172,98,"meet",A("look")]
    },
    place:{ chu:[ null, { room:"cell", x:232, y:96, act:"idle", facing:-1 } ] },
    extras:W0.extras || [],
    plan:[ { name:"法院・地下一樓", w:100, h:20, rooms:{ cell:[0,0,50,20], meet:[50,0,50,20] } } ] });
})();

/* ================= 劇情畫面：第二法庭（羈押庭，不公開）＋ 回想要用的舊場景 =================
   第二法庭只在最後一幕出現（不能走進去），所以不放進地圖：
   後面的牆是木頭護牆板；正中間是高起來的法官席（後面是國徽、上面是「第二法庭」的牌子），右上角一塊紅底的「不公開」；
   法官席的下面是書記官的桌子（螢幕、錄音的麥克風）；左邊是檢察官席、右邊是辯護人席，中間是應訊台；下面是一道木欄杆，旁聽席今天是空的。 */
C40T && (() => {
  const { EP, T, O } = C40T;
  let ROOM = null;
  const court2 = () => ROOM || (ROOM = { name:"第二法庭", w:288, h:162, wall:60,
    floor(p, g, t){
      p.R(0, 0, 288, 60, "#b8986c"); p.R(0, 0, 288, 4, "#8a6a48"); for (let x = 0; x < 288; x += 24){ p.R(x, 4, 1, 52, "#9a7a54"); p.R(x + 3, 8, 18, 44, "#c4a478"); p.R(x + 3, 8, 18, 1, "#d4b488"); }
      p.R(0, 54, 288, 6, "#6a4a2e"); p.R(0, 60, 288, 1, O);
      C40T.fluo(p, 60, 2, 40); C40T.fluo(p, 188, 2, 40);
      // 國徽、牌子、不公開
      p.R(136, 5, 16, 16, O); p.R(137, 6, 14, 14, "#2a4a8a"); p.R(140, 9, 8, 8, "#f4f0e4"); p.R(142, 11, 4, 4, "#2a4a8a");
      p.R(38, 16, 52, 9, O); p.R(39, 17, 50, 7, "#3a3228"); for (let k = 0; k < 4; k++) p.R(44 + k * 11, 20, 7, 1, "#e8c868");
      p.R(232, 10, 30, 10, O); p.R(233, 11, 28, 8, "#c83a2a"); p.R(233, 11, 28, 1, "#e85a4a"); p.R(237, 15, 20, 1, "#fff4e8");
      p.R(14, 14, 14, 14, O); p.R(15, 15, 12, 12, "#f4f4f0"); p.R(21, 16, 1, 6, "#1e1e22"); p.R(21, 21, 4, 1, "#1e1e22");   // 時鐘
      // 地板（地毯）
      T.carpet(p, 0, 60, 288, 102, "#7a4c3e");
      p.R(0, 136, 288, 26, "#8a6a4a"); p.R(0, 136, 288, 1, "#5a3e26");
      T.sides(p, this, "#6a4a2e", [["L", 88, 30]]);
    },
    props:[
      // 法官席（高起來）
      { y:80, draw(p){ p.R(133, 31, 22, 15, O); p.R(134, 32, 20, 14, "#1e1e22"); p.R(142, 32, 4, 6, "#f4f4f0"); p.R(139, 22, 10, 10, O); p.R(140, 23, 8, 8, "#e8c8a8"); p.R(140, 23, 8, 3, "#2a2220"); p.R(140, 26, 1, 3, "#2a2220"); p.R(147, 26, 1, 3, "#2a2220"); p.R(141, 28, 2, 1, "#3a3430"); p.R(145, 28, 2, 1, "#3a3430");
          p.R(92, 44, 104, 36, O); p.R(93, 45, 102, 6, "#8a6a48"); p.R(93, 45, 102, 1, "#a88a68"); p.R(93, 51, 102, 28, "#6a4a2e"); for (let x = 99; x < 190; x += 18) p.R(x, 54, 12, 22, "#5a3e26");
          p.R(118, 46, 12, 4, "#f4f0e4"); p.R(158, 46, 10, 4, "#1e1e22"); p.R(159, 46, 8, 3, "#5a8ab8"); p.R(141, 44, 6, 2, "#3a3a3e"); } },
      // 書記官的桌子
      { y:96, draw(p){ p.R(112, 82, 64, 14, O); p.R(113, 83, 62, 4, "#9a7a58"); p.R(113, 87, 62, 8, "#7a5a3a"); p.R(122, 79, 12, 6, "#1e1e22"); p.R(123, 80, 10, 4, "#5a8ab8"); p.R(152, 80, 2, 4, "#2a2a2e"); p.R(150, 79, 6, 2, "#3a3a3e"); p.R(160, 83, 8, 3, "#f4f0e4"); } },
      // 檢察官席（左）
      { y:104, draw(p){ p.R(20, 90, 64, 14, O); p.R(21, 91, 62, 4, "#9a7a58"); p.R(21, 95, 62, 8, "#7a5a3a"); p.R(30, 92, 12, 3, "#f4f0e4"); p.R(46, 91, 10, 4, "#e8e4d8"); p.R(62, 89, 2, 3, "#2a2a2e"); p.R(24, 97, 18, 5, O); p.R(25, 98, 16, 3, "#f4f0e4"); p.R(27, 99, 12, 1, "#5a5a5a"); } },
      // 辯護人席（右）
      { y:104, draw(p){ p.R(204, 90, 64, 14, O); p.R(205, 91, 62, 4, "#9a7a58"); p.R(205, 95, 62, 8, "#7a5a3a"); p.R(214, 92, 14, 3, "#f4f0e4"); p.R(240, 91, 10, 4, "#c8a46a"); p.R(226, 89, 2, 3, "#2a2a2e"); p.R(246, 97, 18, 5, O); p.R(247, 98, 16, 3, "#f4f0e4"); p.R(249, 99, 12, 1, "#5a5a5a"); } },
      { y:112, draw(p){ T.chair(p, 36, 112, "#3a3a3e", "up"); T.chair(p, 60, 112, "#3a3a3e", "up"); T.chair(p, 226, 112, "#3a3a3e", "up"); T.chair(p, 250, 112, "#3a3a3e", "up"); } },
      // 應訊台
      { y:116, draw(p){ p.R(136, 104, 16, 12, O); p.R(137, 105, 14, 3, "#9a7a58"); p.R(137, 108, 14, 7, "#7a5a3a"); p.R(143, 102, 2, 3, "#2a2a2e"); } },
      // 欄杆和空的旁聽席
      { y:140, draw(p){ p.R(0, 132, 128, 4, O); p.R(0, 132, 128, 2, "#9a7a58"); p.R(160, 132, 128, 4, O); p.R(160, 132, 128, 2, "#9a7a58"); for (let x = 6; x < 128; x += 10) p.R(x, 134, 2, 6, "#6a4a2e"); for (let x = 166; x < 288; x += 10) p.R(x, 134, 2, 6, "#6a4a2e");
          [[20, 146], [168, 146]].forEach(([x, y]) => { p.R(x, y, 100, 8, O); p.R(x + 1, y + 1, 98, 4, "#8a6a48"); p.R(x + 1, y + 5, 98, 2, "#6a4a2e"); }); } }
    ],
    front(p, g, t){ T.glow && T.glow(g, 144, 90, 110, "255,240,210", .07); },
    solid:[[0,0,288,62],[92,44,104,36],[112,80,64,16],[20,90,64,14],[204,90,64,14],[136,104,16,12],[0,132,128,8],[160,132,128,8]],
    exits:[],
    stage:{ row:[96, 196, 124], seats:[[226, 114, -1], [250, 114, -1], [36, 114, 1], [60, 114, 1]] } });
  const shop38 = () => (typeof MK38SHOP === "function" ? MK38SHOP(C40T) : null);
  let SH = null;
  EP.topStages = Object.assign({}, EP.topStages || {}, {
    c40_court: () => ({ room:court2() }),
    c38_shop: () => { SH = SH || shop38(); return SH ? { room:SH } : null; },
    c36_lot: () => (typeof window !== "undefined" && window.LOT36) ? { room:window.LOT36 } : null
  });
})();
