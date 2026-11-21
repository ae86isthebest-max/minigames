/* =========================================================
   第 48 集・俯視版（topdown.js）
   海風咖啡（外面的座位＝TOPSCENE 的 cafe；最左邊那一桌＝新的，騎樓往左延伸的那一段）；
   周家（客廳、書桌、昀昀的房間＝第 47 集，兩天以後）；南澳魚市（停車場、過磅台＝第 46 集，星期六的早上）；
   安和護理之家（大廳、交誼廳＝第 24 集，三年以後）。
   第一段是深夜（下雨），第二段是白天（雨停了）。沒有跟著你的人。
   ========================================================= */
const C48T = typeof TOPEP === "function" ? TOPEP("prince") : null;

/* 重用別集的房間：floor／props 用那一集的「第 ph0 段」畫（天色、白天黑夜跟著那一段），front／solid／exits 用這一集自己的 */
const AT48 = (R, ph0, over) => {
  if (!R) return null;
  const fo = o => Object.assign({}, o || {}, { phase:ph0 });
  const base = Object.assign({}, R);
  delete base.solid; delete base.props;
  return Object.assign(base, {
    floor(p, g, t, o){ R.floor.call(this, p, g, t, fo(o)); },
    props:(R.props || []).map(q => Object.assign({}, q, { draw(p, g, t, o){ q.draw.call(this, p, g, t, fo(o)); } }))
  }, over || {});
};

/* ================= 海風咖啡 ================= */
/* MK48CAFE(K, v)：外面的座位（TOPSCENE 的 cafe 舞台＋路燈＋往左邊那一桌的騎樓）、最左邊（最外面）那一桌（第 48 集新畫的；第 49 集照用）
   v.stage(o)＝舞台的設定；v.night(o)、v.rain(o)；v.scooter(o)＝阿彬的機車要不要畫；v.poster(p)＝路燈下面那一張紙；v.items(p, g, t, o)＝桌上的東西；
   v.dog＝豆花趴在你的椅子旁邊；v.tableLabel＝門口的字 */
function MK48CAFE(K, v){
  const { T, O, sh, ph, tone, rainFx } = K;
  const NT = o => !!v.night(o), RN = o => !!v.rain(o);
  const ST = {};
  const st = o => { const k = ph(o) > 0 ? 1 : 0; if (ST[k]) return ST[k];
    if (typeof TOPSCENE === "undefined" || !TOPSCENE.STAGES || !TOPSCENE.STAGES.cafe) return null;
    const R = TOPSCENE.STAGES.cafe(v.stage({ phase:k })).room;
    // 舞台的第 7 個道具是豆花（這兩集牠不在中間那一桌）、第 8 個是阿彬的機車
    const props = R.props.filter((q, i) => i !== 6 && (i !== 7 || v.scooter({ phase:k })));
    return (ST[k] = Object.assign({}, R, { props })); };
  const PH = () => { try { return (typeof S !== "undefined" && S && S.phase) || 0; } catch (e){ return 0; } };

  /* ---------- 外面的座位：TOPSCENE 的海風咖啡；加一盞路燈（燈罩下面貼著一張紙）；左邊沿著騎樓走過去，是最左邊那一桌 ---------- */
  const seat = { name:"海風咖啡・外面的座位", w:320, h:162, wall:58,
    floor(p, g, t, o){ const R = st(o); if (R) R.floor.call(this, p, g, t, o); else p.R(0, 0, 320, 162, "#8a8a86");
      p.R(0, 82, 3, 32, "rgba(0,0,0,.12)"); },
    get props(){ const R = st({ phase:PH() }); return (R ? R.props : []).concat([
      { y:132, draw(p, g, t, o){ T.streetLamp(p, g, 278, 132); v.poster(p); if (NT(o)) T.glow(g, 284, 80, 50, "255,226,160", .18); } }
    ]); },
    front(p, g, t, o){ const R = st(o); if (R && R.front) R.front.call(this, p, g, t, o); },
    solid:[[0,0,320,60],[78,88,28,22],[154,88,28,22],[230,88,28,22],[122,70,18,18],[296,72,16,14],[0,136,320,26],[272,126,12,8]],
    exits:[ { r:[0,84,6,28], to:"table", at:[204,104], label:v.tableLabel, kind:"out", art:[0,82,8,32] } ]
  };

  /* ---------- 最左邊那一桌：騎樓往左延伸的一段，雨棚一直拉到這裡；店的側窗（吧台的燈、一排杯子）、窗台下的花箱、落水管；左邊是騎樓的大柱子；
       兩張白色方桌併在一起，兩邊各一張椅子；桌上的東西每一集不一樣 ---------- */
  const table = { name:"海風咖啡・桌上", w:240, h:150, wall:58,
    floor(p, g, t, o){ const n = NT(o), wet = RN(o);
      const wall = n ? "#4a4036" : "#e8dcc4";
      p.R(0, 0, 240, 58, wall); p.R(0, 0, 240, 2, sh(wall, .1));
      const win = n ? "#e8b860" : "#9cc5e6";
      p.R(96, 27, 70, 29, O); p.R(97, 28, 68, 27, win); p.R(131, 28, 1, 27, "#6a5a44");
      p.R(97, 45, 68, 10, n ? "#8a5a30" : "#a87a50"); p.R(97, 44, 68, 1, "#6a4a32"); for (let k = 0; k < 6; k++) p.R(102 + k * 10, 40, 4, 4, "#f4f4f0");
      for (const x of [112, 150]){ p.R(x, 28, 1, 4, "#3a3028"); p.R(x - 3, 32, 7, 3, "#ffd98a"); }
      p.R(94, 54, 74, 4, "#7a4a2a"); for (let x = 96; x < 166; x += 5){ p.R(x, 51, 4, 3, "#4a8a3a"); p.R(x + 1, 50, 2, 2, ["#e85a6a", "#f4d04a", "#f4f0f0"][(x / 5 | 0) % 3]); }
      p.R(206, 0, 4, 58, O); p.R(207, 0, 2, 58, n ? "#5a5e66" : "#8a8e94");
      const ab = wet ? 28 : 24; for (let x = 0; x < 240; x += 10){ p.R(x, 13, 10, ab - 13, (x / 10) % 2 ? "#2a7a8a" : "#f4f0e0"); p.R(x + 2, ab, 6, 2, (x / 10) % 2 ? "#2a7a8a" : "#f4f0e0"); } p.R(0, 13, 240, 1, "#1a4a5a"); p.R(0, ab - 1, 240, 1, "rgba(0,0,0,.2)");
      const a = n ? "#3a3c40" : wet ? "#8a8a86" : "#c8b8a0";
      T.tiles(p, 0, 58, 240, 70, a, sh(a, -.06), 16);
      if (wet) for (let k = 0; k < 4; k++) p.R(24 + (k * 61) % 200, 116 + (k * 5) % 10, 14, 2, "rgba(90,110,130,.35)");
      p.R(0, 128, 240, 4, "#8a8a86"); p.R(0, 128, 240, 1, O);
      p.R(0, 132, 240, 18, n ? "#26282c" : "#5a5a5c"); for (let x = 14; x < 240; x += 30) p.R(x, 144, 14, 2, "#e8e0a0");
      if (wet) for (let k = 0; k < 6; k++) p.R((k * 43) % 220, 134 + (k * 5) % 12, 18, 1, "#6a7a8a");
    },
    props:[
      { y:128, draw(p){ p.R(0, 58, 14, 70, O); p.R(0, 58, 13, 69, "#b8b0a0"); p.R(0, 58, 13, 3, "#c8c0b0"); p.R(10, 61, 3, 66, "#a8a090"); } },
      { y:100, draw(p, g, t, o){ T.chair(p, 46, 100, NT(o) ? "#8a8a90" : "#3a3a3e", "right"); } },
      { y:100, draw(p, g, t, o){ T.chair(p, 174, 100, NT(o) ? "#8a8a90" : "#3a3a3e", "left"); } },
      { y:110, draw(p, g, t, o){
          p.R(59, 79, 98, 26, O); p.R(60, 80, 96, 24, "#e8e8e4"); p.R(60, 80, 96, 2, "#f8f8f4"); p.R(108, 80, 1, 24, "#c8c8c4"); p.R(60, 104, 96, 5, "#b8b8b4"); p.R(59, 104, 1, 6, O); p.R(156, 104, 1, 6, O); p.R(59, 109, 98, 1, O);
          for (const x of [62, 104, 112, 152]) p.R(x, 110, 2, 2, "#5a5a5e");
          v.items(p, g, t, o); } },
      { y:120, draw(p){ if (!v.dog) return; const dx = 166; p.R(dx, 112, 16, 6, O); p.R(dx + 1, 113, 14, 4, "#f0dcb0"); p.R(dx - 6, 110, 7, 6, O); p.R(dx - 5, 111, 5, 4, "#f0dcb0"); p.R(dx - 4, 112, 1, 1, O); p.R(dx - 2, 110, 2, 2, "#d8c090"); p.R(dx + 15, 113, 4, 1, "#d8c090"); } }
    ],
    front(p, g, t, o){
      if (NT(o)){ T.dim(g, this, .36); if (v.glow) v.glow(g, o); T.glow(g, 130, 40, 50, "255,210,140", .12); }
      else tone(g, this, o, .3);
      if (RN(o)){ rainFx(p, g, this, t, o, 130); p.R(0, 58, 240, 6, "rgba(0,0,0,.08)"); }
    },
    solid:[[0,0,240,60],[0,58,14,70],[58,78,100,34],[38,86,16,16],[166,86,16,16],[0,136,240,14]],
    exits:[ { r:[234,84,6,28], to:"seat", at:[36,104], label:"外面的座位", kind:"out", art:[232,82,8,32] } ]
  };
  return { seat, table };
}

C48T && (() => {
  const { EP, T, O, ph, A, has, night, setLoc } = C48T;
  const W0 = EP.world.cafe || {};
  const { seat, table } = MK48CAFE(C48T, {
    stage:o => ph(o) > 0 ? { time:"morning", ep:48 } : { time:"night", rain:true, ep:48 },
    night:o => night(o), rain:o => night(o), scooter:o => ph(o) > 0, dog:true, tableLabel:"最左邊那一桌",
    // 路燈：燈罩下面一張褪色的尋狗啟事
    poster(p){ p.R(274, 100, 7, 8, O); p.R(275, 101, 5, 6, "#e8e0c8"); p.R(276, 102, 3, 2, "#a89878"); },
    glow(g, o){ T.glow(g, 137, 86, 46, "255,226,160", .3); },
    // 桌上：對面的筆電（背面貼滿貼紙）、杯子、陳葵的筆記本、攤開的《小王子》；第一段露營燈；第二段兩個牛皮紙袋；你的杯子、你的手機
    items(p, g, t, o){
      p.R(63, 82, 22, 15, O); p.R(64, 83, 20, 13, "#c8ccd0"); p.R(66, 85, 4, 3, "#e8a040"); p.R(72, 86, 3, 3, "#3a6ab8"); p.R(77, 84, 5, 3, "#f4f4f0"); p.R(78, 85, 3, 1, "#c8302a"); p.R(70, 91, 5, 3, "#f0dcb0"); p.R(78, 90, 4, 4, "#8a5a8a"); p.R(84, 83, 1, 13, "rgba(200,230,255,.8)");
      for (const cx of [88, 96]){ p.R(cx, 82, 7, 7, O); p.R(cx + 1, 83, 5, 5, "#f4f4f0"); p.R(cx + 2, 84, 3, 3, ph(o) > 0 ? "#5a3a1a" : "#a8724a"); if (!ph(o)) p.R(cx + 2, 84, 1, 1, "#ffffff"); }
      p.R(86, 95, 10, 8, O); p.R(87, 96, 8, 6, "#f4e8a8"); p.R(88, 97, 6, 1, "#7a6a8a"); p.R(88, 99, 4, 1, "#7a6a8a");
      p.R(97, 87, 28, 14, O); p.R(98, 88, 12, 12, "#f4ecd8"); p.R(112, 88, 12, 12, "#f4ecd8"); p.R(110, 88, 2, 12, "#c8b898");
      for (let k = 0; k < 4; k++){ p.R(100, 90 + k * 2, 8, 1, "#8a8478"); p.R(114, 90 + k * 2, 8, 1, "#8a8478"); } p.R(99, 92, 2, 1, "#5a5a6a"); p.R(116, 93, 6, 1, "#5a5a6a");
      if (!ph(o)){ p.R(133, 81, 9, 12, O); p.R(134, 82, 7, 2, "#3a3a3e"); p.R(134, 84, 7, 7, "#fff2b0"); p.R(135, 86, 5, 2, "#f4f4f0"); p.R(134, 91, 7, 1, "#3a3a3e"); }
      if (ph(o) > 0){ if (has("e2")){ p.R(128, 92, 17, 6, O); p.R(129, 93, 15, 4, "#c8a060"); p.R(129, 93, 15, 1, "#d8b070"); }
        if (has("e3")){ p.R(129, 98, 14, 5, O); p.R(130, 99, 12, 3, "#c8a060"); p.R(130, 99, 12, 1, "#d8b070"); } }
      p.R(146, 86, 8, 7, O); p.R(147, 87, 6, 5, "#f4f4f0"); p.R(148, 88, 4, 3, ph(o) > 0 ? "#5a3a1a" : "#a8724a"); p.R(153, 88, 2, 3, O);
      p.R(146, 97, 6, 7, O); p.R(147, 98, 4, 5, "#1e2226");
    }
  });

  const XP = { x48_abin:{ room:"seat", x:200, y:80, act:"hold", facing:-1 } };
  setLoc("cafe", { start:"seat", spawn:[200,124], rooms:{ seat, table },
    spots:{
      doc48_p44:[98,88,12,12,104,118,"table",A("read")],
      doc48_p45:[112,88,12,12,118,118,"table",A("read")],
      doc48_note:[86,95,10,8,90,118,"table",A("read")],
      o48_laptop:[63,82,22,15,74,118,"table",A("look")],
      o48_cocoa:[88,82,15,7,96,72,"table",A("look")],
      o48_coffee:[88,82,15,7,96,72,"table",A("look")],
      o48_lantern:[133,81,9,12,138,72,"table",A("look")],
      doc48_bank:[128,92,17,6,134,118,"table",A("read")],
      doc48_calls:[129,98,14,5,142,118,"table",A("read")],
      o48_station:[60,138,200,24,160,126,"seat",A("look")],
      o48_sutable:[232,90,24,14,244,126,"seat",A("look")],
      o48_card:[122,70,18,18,131,96,"seat",A("read")],
      o48_awning:[0,13,150,15,52,72,"seat",A("look")]
    },
    details:{
      d48_window:[8,27,64,29,30,72,"seat",A("look")],
      d48_flowers:[6,50,68,8,64,72,"seat",A("look")],
      d48_lamp:[272,76,14,34,262,122,"seat",A("look",{ face:1 })],
      d48_phone:[146,97,6,7,152,118,"table",A("look")],
      d48_mug:[146,86,8,7,150,72,"table",A("look")],
      d48_street:[0,132,240,18,200,122,"table",A("look")]
    },
    place:{
      kui:[ { room:"table", x:46, y:100, act:"sit", facing:1, view:"side" }, { room:"table", x:46, y:100, act:"sit", facing:1, view:"side" } ],
      ye:[ null, { room:"seat", x:188, y:106, act:"sit", facing:-1, view:"side" } ]
    },
    extras:(W0.extras || []).map(e => Object.assign({}, e, XP[e.id] || {}, { pose:undefined })),
    plan:[ { name:"海風咖啡", w:100, h:28, rooms:{ table:[0,0,40,28,"out"], seat:[40,0,60,28,"out"] } } ] });
})();

/* ================= 周家（第 47 集的房子，兩天以後） ================= */
C48T && (() => {
  const { EP, T, O, sh, ph, A, has, tone, setLoc } = C48T;
  const W0 = EP.world.home || {};
  const H = (typeof window !== "undefined" && window.HOME47) || null;
  if (!H) return;

  /* ---------- 客廳：全家福前面多了一個小香爐（三炷香）；沙發上疊著一條被子和一本美髮雜誌；小桌子上一疊白包 ---------- */
  const living = AT48(H.living, 0, {
    front(p, g, t, o){ T.glow(g, 120, 30, 90, "255,236,200", .06); tone(g, this, o, .25); }
  });
  living.props = living.props.concat([
    // 全家福下面的小架子：香爐、三炷香
    { y:61, draw(p, g, t){ p.R(68, 28, 22, 3, O); p.R(69, 29, 20, 1, "#8a6a42"); p.R(75, 24, 8, 5, O); p.R(76, 25, 6, 3, "#c8a040"); for (const x of [77, 79, 81]){ p.R(x, 18, 1, 6, "#8a3a2a"); p.R(x, 17, 1, 1, "#e8602a"); } p.R(79, 13 - Math.floor(t * 2) % 3, 1, 2, "rgba(220,220,220,.5)"); } },
    // 沙發上：摺好的被子、美髮雜誌
    { y:64.5, draw(p){ p.R(84, 50, 22, 10, O); p.R(85, 51, 20, 8, "#e8d8b8"); p.R(85, 54, 20, 1, "#c8b898"); p.R(64, 53, 10, 8, O); p.R(65, 54, 8, 6, "#e86a9a"); p.R(66, 55, 6, 2, "#f4f4f0"); } },
    // 小桌子上一疊白包（最上面那一包最厚）
    { y:104.5, draw(p){ for (let k = 0; k < 4; k++){ p.R(125 + k, 90 - k * 2, 16, 7, O); p.R(126 + k, 91 - k * 2, 14, 5, "#f8f8f4"); } p.R(130, 85, 6, 1, "#3a3a3e"); } }
  ]);

  /* ---------- 書桌：月曆翻到四月；記帳本最後一頁撕掉了 ---------- */
  const desk = AT48(H.desk, 0, {
    front(p, g, t, o){ tone(g, this, o, .25); }
  });
  desk.props = desk.props.concat([
    { y:82.5, draw(p){ p.R(70, 63, 2, 6, "#f4f0e0"); p.R(71, 63, 1, 1, "#e8e4d8"); p.R(71, 65, 1, 1, "#e8e4d8"); p.R(71, 67, 1, 1, "#e8e4d8"); } }
  ]);

  /* ---------- 昀昀的房間：太陽的布偶拿到書桌上；書包放在書桌旁邊的地上；她坐在書桌左邊的椅子；書櫃最下面一層，布偶旁邊一個藍色的紙盒（黃色的星星）；
       盒子拿出來以後，書桌上攤著一張一張的影本 ---------- */
  const room = AT48(H.room, 0, {
    front(p, g, t, o){ tone(g, this, o, .25); },
    solid:[[0,0,224,62],[14,62,44,56],[122,60,48,22],[108,80,16,12],[174,14,34,50],[156,84,14,10]]
  });
  room.props = room.props.filter((q, i) => i !== 2).concat([
    // 床上的布偶拿走了
    { y:118.5, draw(p){ p.R(40, 67, 6, 6, "#f8f8f4"); } },
    // 書桌上：太陽的布偶；盒子拿出來以後，一張一張的影本
    { y:80.5, draw(p){ p.R(156, 62, 8, 8, O); p.R(157, 63, 6, 6, "#f4c030"); p.R(158, 64, 1, 1, O); p.R(161, 64, 1, 1, O); p.R(159, 67, 2, 1, "#c8602a");
        if (has("o48_case")) for (let k = 0; k < 3; k++){ p.R(128 + k * 8, 63 + (k % 2), 8, 7, O); p.R(129 + k * 8, 64 + (k % 2), 6, 5, "#f4f4ee"); p.R(130 + k * 8, 65 + (k % 2), 4, 1, "#8a8a9a"); p.R(130 + k * 8, 67 + (k % 2), 3, 1, "#8a8a9a"); } } },
    // 書櫃最下面一層：藍色的紙盒（黃色的星星）——拿出來以後，那一格空了
    { y:64.5, draw(p){ if (has("o48_case")){ p.R(194, 50, 10, 10, "#6a4a2a"); return; } p.R(194, 50, 10, 10, O); p.R(195, 51, 8, 8, "#2a5ab8"); p.R(198, 53, 2, 2, "#f4d040"); p.R(197, 54, 4, 1, "#f4d040"); p.R(196, 57, 6, 1, "#e8c870"); } },
    // 書桌左邊的椅子
    { y:86, draw(p){ T.chair(p, 116, 86, "#f4f0e8", "right"); } },
    // 地上的藍色書包（黃色的吊飾）
    { y:94, draw(p){ p.R(156, 84, 14, 10, O); p.R(157, 85, 12, 8, "#3a6ab8"); p.R(158, 87, 10, 1, "#2a4a8a"); p.R(169, 86, 3, 4, "#f4e040"); } }
  ]);

  const XP = { x48_hdog:{ room:"living", x:178, y:116, act:"sit", facing:-1 } };
  setLoc("home", { start:"living", spawn:[56,124], rooms:{ living, desk, room },
    spots:{
      o48_whitebag:[125,84,18,12,136,114,"living",A("look")],
      o48_calendar:[110,12,16,18,118,72,"desk",A("read")],
      o48_case:[192,48,14,14,198,76,"room",A("rummage")],
      doc48_copies:[128,62,24,9,142,96,"room",A("read")]
    },
    details:{
      d48_family:[70,12,18,14,92,72,"living",A("look")],
      d48_sofa:[48,42,64,22,124,74,"living",A("look",{ face:-1 })],
      d48_ledger:[56,62,18,8,60,92,"desk",A("read")],
      d48_lamp2:[94,54,8,12,108,90,"desk",A("look",{ face:-1 })],
      d48_bed:[14,62,44,56,68,100,"room",A("look",{ face:-1 })],
      d48_poster:[112,12,14,18,100,72,"room",A("look")]
    },
    place:{
      yun:[ null, { room:"room", x:116, y:86, act:"sit", facing:1, view:"side" } ],
      fang:[ null, { room:"living", x:84, y:84, act:"hold", facing:1 } ]
    },
    extras:(W0.extras || []).map(e => Object.assign({}, e, XP[e.id] || {}, { pose:undefined })),
    plan:[ { name:"周家（港西街）", w:100, h:22, rooms:{ room:[0,0,32,22], living:[32,0,36,22], desk:[68,0,32,22] } } ] });
})();

/* ================= 南澳魚市（第 46 集的魚市，星期六的早上） ================= */
C48T && (() => {
  const { EP, T, O, sh, ph, A, has, tone, setLoc } = C48T;
  const W0 = EP.world.market || {};
  const M = (typeof window !== "undefined" && window.MARKET46) || null;
  if (!M) return;

  /* ---------- 停車場：第 46 集白天的樣子（小貨車、欄杆放下來）；外牆上多畫出側面那一扇鐵捲門（紅漆「海龍漁業 H-07」，拉到底，門縫底下是乾的）；
       管理室的門開著（裡面有人在泡茶，門上一張「夜班領班 徵人」） ---------- */
  const lot = AT48(M.lot, 0, {
    front(p, g, t, o){ tone(g, this, o, 1); },
    solid:[[0,0,320,74],[54,64,14,22],[196,94,10,8],[284,90,8,8],[48,94,60,34]],
    exits:[ { r:[244,72,66,6], to:"dock", at:[262,80], label:"鐵捲門（過磅台）", kind:"door", art:[244,24,66,48] } ]
  });
  lot.props = lot.props.concat([
    { y:73, draw(p){
        // 側面的鐵捲門（H-07）
        p.R(176, 30, 50, 42, O); p.R(177, 31, 48, 41, "#8a9094"); for (let y = 33; y < 72; y += 3) p.R(177, y, 48, 1, "#6a7074"); p.R(176, 28, 50, 3, O); p.R(177, 29, 48, 1, "#5a5e62");
        for (let k = 0; k < 5; k++) p.R(182 + k * 7, 40, 5, 6, "#c83a2a"); p.R(190, 50, 22, 6, "#c83a2a"); p.R(193, 52, 16, 2, "#8a9094");
        p.R(177, 71, 48, 1, "#5a5e62");
        // 管理室的門開著：裡面是暖暖的燈、門上一張黃掉的紙
        p.R(139, 39, 18, 33, "#3a3a34"); p.R(140, 40, 6, 31, "#c8b888"); p.R(150, 52, 5, 6, "#e8e0c8"); p.R(156, 39, 2, 33, "#6a7480"); p.R(157, 39, 4, 33, O); p.R(158, 40, 2, 31, "#7a8490");
        p.R(158, 46, 3, 6, "#e8d8a0"); } }
  ]);

  /* ---------- 過磅台：第 46 集的樣子；手推車上一個保麗龍箱（冰、七尾白帶魚、最上面一袋寫著「周」）；
       過磅桌上，全叔拿出來的勞保資料、阿蕊姨鐵盒旁邊那一張紙 ---------- */
  const dock = AT48(M.dock, 0, {
    front(p, g, t, o){ T.cam(p, 110, 2, -1, t); C48T.fluo(p, 60, 2, 60); C48T.fluo(p, 200, 2, 60); tone(g, this, o, .35); },
    solid:[[0,0,288,62],[18,62,28,30],[50,88,26,32],[136,62,8,26],[158,82,44,20]],
    exits:[ { r:[234,60,48,8], to:"lot", at:[258,84], label:"鐵捲門（停車場）", kind:"door", art:[234,12,48,48] } ]
  });
  dock.props = dock.props.concat([
    // 手推車上的保麗龍箱：冰、白帶魚、最上面一袋寫著「周」
    { y:118.5, draw(p){ p.R(52, 84, 22, 14, O); p.R(53, 85, 20, 12, "#f4f4f0"); p.R(54, 86, 18, 10, "#d8e8f0"); for (let k = 0; k < 4; k++) p.R(55, 87 + k * 2, 16, 1, "#c8d0d8"); p.R(56, 86, 10, 4, "#e8ecf0"); p.R(60, 87, 2, 2, "#3a3a3e"); } },
    // 過磅桌：阿蕊姨的鐵盒；問過以後，桌上的勞保資料、鐵盒旁邊那一張紙
    { y:100.5, draw(p){ p.R(190, 84, 10, 7, O); p.R(191, 85, 8, 5, "#c8a050"); p.R(192, 86, 6, 1, "#e8d080");
        if (has("q4")){ p.R(163, 87, 11, 7, O); p.R(164, 88, 9, 5, "#e8f0f4"); p.R(165, 89, 6, 1, "#3a6ab8"); p.R(165, 91, 4, 1, "#3a3a3e"); }
        if (has("r3")){ p.R(180, 86, 9, 7, O); p.R(181, 87, 7, 5, "#f4f0e0"); p.R(182, 88, 5, 1, "#c8302a"); p.R(182, 90, 4, 1, "#3a3a3e"); } } }
  ]);

  setLoc("market", { start:"lot", spawn:[200,128], rooms:{ lot, dock },
    spots:{
      o48_mcam:[282,34,10,10,272,102,"lot",A("look")],
      o48_shutter:[176,28,50,44,200,86,"lot",A("look")],
      doc48_labor:[162,86,12,8,168,110,"dock",A("read")],
      doc48_tax:[180,86,9,7,186,110,"dock",A("read")],
      o48_scale:[88,94,42,30,110,132,"dock",A("look")],
      o48_cart:[52,84,22,34,64,128,"dock",A("look")]
    },
    details:{
      d48_bar:[8,64,60,16,30,92,"lot",A("look")],
      d48_door:[138,38,20,34,148,82,"lot",A("look")],
      d48_pillar:[18,0,28,92,36,104,"dock",A("look")],
      d48_lockers:[170,16,48,42,226,84,"dock",A("look")]
    },
    place:{
      quan:[ null, { room:"dock", x:116, y:92, act:"write", facing:-1 } ],
      rui:[ null, { room:"dock", x:40, y:126, act:"kneel", facing:1 } ]
    },
    extras:W0.extras || [],
    plan:[ { name:"南澳魚市", w:100, h:24, rooms:{ lot:[0,0,52,24,"out"], dock:[52,0,48,24] } } ] });
})();

/* ================= 安和護理之家（第 24 集，三年以後） ================= */
C48T && (() => {
  const { EP, T, O, sh, ph, A, has, tone, setLoc } = C48T;
  const W0 = EP.world.anhe || {};
  const N = (typeof window !== "undefined" && window.ANHE24) || null;
  if (!N) return;
  const fluo = C48T.fluo;

  /* ---------- 一樓大廳：第 24 集的樣子；魚缸裡現在是兩尾橘色、一尾紅色；警衛桌坐著新來的年輕人；服務台上的登記簿、院長的綠色資料夾 ---------- */
  const lobby = AT48(N.lobby, 0, {
    front(p, g, t, o){ fluo(p, 60, 2, 50); fluo(p, 160, 2, 50); fluo(p, 250, 2, 50); tone(g, this, o, .3); },
    solid:[[16,70,54,36],[98,74,94,30],[212,44,36,36],[254,0,50,62],[24,112,74,20],[188,134,10,12]],
    exits:[ { r:[0,104,8,40], to:"lounge", at:[244,96], label:"交誼廳", kind:"door", art:[0,102,8,44] } ]
  });
  lobby.props = lobby.props.concat([
    // 魚缸：兩尾橘色、一尾紅色
    { y:84.5, draw(p, g, t){ p.R(215, 49, 30, 12, "#6ab8d8"); for (let k = 0; k < 3; k++){ const fx = 218 + ((k * 9 + Math.floor(t * 5) * (k % 2 ? 1 : -1)) % 22 + 22) % 22; p.R(fx, 51 + k * 3, 4, 2, ["#e8842a", "#f0a040", "#d83a2a"][k]); } } },
    // 服務台上的綠色資料夾（院長拿出來以後）
    { y:100.5, draw(p){ if (!has("d4")) return; p.R(136, 78, 13, 7, O); p.R(137, 79, 11, 5, "#4a9a5a"); p.R(138, 80, 9, 1, "#f4f4f0"); } }
  ]);

  /* ---------- 交誼廳：第 24 集的樣子；窗邊的輪椅換了一張（名牌「205 闕月嬌」、褪色的布兔子、半包餅乾） ---------- */
  const lounge = AT48(N.lounge, 0, {
    front(p, g, t, o){ fluo(p, 100, 2, 50, true); fluo(p, 220, 2, 50, true); tone(g, this, o, .3); },
    solid:[[102,36,48,46],[158,46,26,30],[18,48,64,40],[14,102,82,30],[226,64,22,22]],
    exits:[ { r:[280,76,8,44], to:"lobby", at:[108,126], label:"大廳", kind:"door", art:[280,74,8,48] } ]
  });
  lounge.props = lounge.props.filter((q, i) => i !== 4).concat([
    { y:84, draw(p){ const x = 230, y = 84; p.R(x, y - 18, 16, 14, O); p.R(x + 1, y - 17, 14, 12, "#5a6a8a"); for (const wx of [x - 2, x + 16]){ p.R(wx, y - 14, 3, 14, O); p.R(wx + 1, y - 13, 1, 12, "#8a8e94"); }
        p.R(x + 4, y - 22, 8, 5, O); p.R(x + 5, y - 21, 6, 3, "#f4f4f0"); p.R(x + 6, y - 20, 4, 1, "#3a3a6a");
        p.R(x + 2, y - 14, 7, 8, O); p.R(x + 3, y - 13, 5, 6, "#e8d8d8"); p.R(x + 3, y - 16, 2, 4, "#e8d8d8"); p.R(x + 6, y - 16, 2, 4, "#e8d8d8");
        p.R(x + 10, y - 12, 5, 5, O); p.R(x + 11, y - 11, 3, 3, "#e8c040"); } }
  ]);

  const XP = { x48_queh:{ room:"lounge", x:50, y:128, act:"sit", facing:1, view:"front" } };
  setLoc("anhe", { start:"lobby", spawn:[152,128], rooms:{ lobby, lounge },
    spots:{
      doc48_visit:[110,78,20,8,120,112,"lobby",A("read")],
      doc48_fee:[136,78,13,7,144,112,"lobby",A("read")],
      o48_notice:[184,10,26,30,202,74,"lobby",A("read")],
      o48_wheel:[226,60,22,26,256,96,"lounge",A("look",{ face:-1 })],
      o48_piano:[102,36,48,46,126,96,"lounge",A("look")]
    },
    details:{
      d48_tank:[212,44,36,36,230,94,"lobby",A("look")],
      d48_guard:[18,84,50,12,80,100,"lobby",A("look",{ face:-1 })],
      d48_tv:[18,48,64,40,50,94,"lounge",A("look")],
      d48_win:[186,8,84,36,200,94,"lounge",A("look")]
    },
    place:{
      dir:[ null, { room:"lobby", x:140, y:70, act:"read", facing:1 } ]
    },
    extras:(W0.extras || []).map(e => Object.assign({}, e, XP[e.id] || {}, { pose:undefined })).concat([
      { id:"x48_guard", name:"值班的警衛", room:"lobby", x:32, y:80, act:"sit", facing:1, view:"front", phase:1,
        L:{ skin:"#e0b890", hair:"#1a1a1a", hairStyle:"short", top:"#3a4a6a", bottom:"#2a2a34" },
        lines:["（他抬起頭，看了你一眼。）登記一下就可以進去了。", "（他又低下頭，繼續看手機。）"] }
    ]),
    plan:[ { name:"1F", w:100, h:30, rooms:{ lounge:[0,0,40,30], lobby:[40,0,60,30] } } ] });
})();
