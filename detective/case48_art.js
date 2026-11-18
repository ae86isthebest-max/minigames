/* =========================================================
   第 48 集：場景、人物造型、重現、結案、走動畫面、地圖
   新畫的：海風咖啡的桌上 c48_table（近景）、漁會信用部 c48_bank（只在重現裡）
   借用的：海風咖啡 SC.cafe、周家 c47_living／c47_desk／c47_room（第 47 集）、南澳魚市 c46_lot／c46_dock（第 46 集）、
           安和護理之家 c24_lobby／c24_lounge（第 24 集）。都包一層 c48_*，加上這一集才有的東西。
   這一集玩家是沈岳（停職，便服，深色外套）；豆花跟著他。
   ========================================================= */
EP48.art = true;
(() => {
  const PR = PX.prim, { R: R0, P: P0, dither } = PR;
  const W = 192, H = 108;
  const SC = PX.SCENES;
  const R = (x, y, w, h, c) => R0(Math.round(x), Math.round(y), w, h, c), P = (x, y, c) => P0(Math.round(x), Math.round(y), c);
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o || !o.ds) return {}; const [i, p] = beatAt(o.t || 0, o.ds); return Object.assign({ _p:p }, (o.seq || [])[i] || {}); };
  const st = () => (typeof S !== "undefined" && S) ? S : null;
  const asked = id => { const s = st(); return !!(s && (s.asked || []).includes(id)); };
  const seenIt = id => { const s = st(); return !!(s && (s.seen || []).includes(id)); };
  const phNow = () => { const s = st(); return s ? (s.phase || 0) : 0; };
  const inCase = () => typeof C !== "undefined" && C && C.id === "prince";
  const rain = (o, n) => { if (!o.rain) return; let s = Math.floor((o.t || 0) * 9) * 131 + 7; for (let i = 0; i < (n || 70); i++){ s = (s * 1103515245 + 12345) & 0x7fffffff; R(s % W, (s >> 8) % 56, 1, 3, "#b8c4d055"); } };

  /* ---------- 海風咖啡・外面的座位：借 SC.cafe。phase 0＝深夜下雨；phase 1＝早上。o.time 可以蓋過 ---------- */
  SC.c48_cafe = (o) => { o = Object.assign({}, o, stOf(o)); SC.cafe(Object.assign({ time:"noon", ep:48 }, o)); };

  /* ---------- 海風咖啡・桌上（近景）：背景 y0–56（雨棚 y0–5）；桌面 y56–108；
     書 x68–124（左頁 x70–95、右頁 x97–122，y62–86）；陳葵的筆電（背面）x14–48（y36–60）；陳葵的筆記本 x126–148（y72–84）；
     杯子 x128–140（y56–68）；你的杯子 x56–66（y76–86）；露營燈 x160–172（y36–60，深夜）；牛皮紙袋 x160–184（y64–73、y76–85，白天、葉晴給的）；
     你的手機 x150–158（y88–102）。o.night；o.rain；o.env1／o.env2 牛皮紙袋 ---------- */
  SC.c48_table = (o) => { o = Object.assign({}, o, stOf(o)); const nt = !!o.night;
    // 背景：雨棚的邊、外面的街
    R(0, 0, W, 56, nt ? "#10141e" : "#cfdce6"); R(0, 30, W, 26, nt ? "#1a1e28" : "#b8b4aa");
    for (let k = 0; k < 6; k++){ const x = 10 + k * 32; R(x, 14, 22, 18, nt ? "#1e2430" : "#d8d0c0"); if (nt){ R(x + 4, 18, 5, 4, "#e8c87066"); R(x + 13, 24, 5, 4, "#e8c87044"); } }
    R(0, 40, W, 6, nt ? "#2a2e34" : "#8a8a86"); for (let x = 6; x < W; x += 24) R(x, 42, 10, 1, nt ? "#8a8460" : "#e8e0a0");
    if (nt){ [[30, 38], [96, 36], [150, 39]].forEach(([x, y]) => { dither(x - 6, y - 6, 12, 12, "#ffd98a22", 2); R(x - 1, y - 1, 3, 3, "#ffe8b0"); }); }
    for (let x = 0; x < W; x += 8) R(x, 0, 8, 5, (x / 8) % 2 ? "#f4f0e0" : "#2a7a8a"); R(0, 5, W, 1, "#1a4a5a");
    rain(o, 60);
    // 桌面：白色的鐵桌（近看）
    R(0, 56, W, 52, nt ? "#c8c4bc" : "#ecebe6"); R(0, 56, W, 2, nt ? "#a8a49c" : "#d4d2cc"); dither(0, 92, W, 16, nt ? "#00000022" : "#00000010", 2);
    if (nt){ dither(40, 58, 120, 40, "#ffd98a18", 2); }
    // 陳葵的筆電（背面，對著你）
    R(14, 36, 34, 24, "#b8bcc4"); R(14, 36, 34, 1, "#d8dce4"); R(14, 60, 34, 2, "#8a8e96"); R(12, 61, 38, 3, "#a8acb4");
    R(13, 37, 1, 22, nt ? "#a8c8f0" : "#d8e4f0"); R(48, 37, 1, 22, nt ? "#a8c8f0" : "#d8e4f0");
    R(18, 40, 6, 6, "#e8a040"); R(19, 41, 4, 2, "#f4d0a0"); R(28, 42, 5, 5, "#3a6ac8"); R(29, 43, 3, 3, "#d8e8f8"); R(36, 39, 8, 4, "#e85a6a"); R(37, 40, 6, 1, "#f4f4f0");   // 柴犬、放大鏡、「我愛台北」
    R(22, 50, 9, 7, "#f0dcb0"); R(23, 51, 3, 2, "#3a2a1a"); R(28, 51, 2, 2, "#3a2a1a"); R(25, 54, 3, 1, "#7a4a3a");   // 豆花的貼紙
    // 書：藍色的精裝封面，兩頁
    R(68, 60, 56, 28, "#2a5a8a"); R(68, 87, 56, 1, "#1a3a5a");
    R(70, 62, 25, 24, "#f4ecd8"); R(97, 62, 25, 24, "#f4ecd8"); R(95, 61, 2, 26, "#c8b898"); R(94, 62, 1, 24, "#e0d4bc"); R(97, 62, 1, 24, "#e0d4bc");
    const lines = (x, ws, bold) => ws.forEach((w, i) => R(x, 65 + i * 3, w, 1, bold === i ? "#4a443c" : "#9a9488"));
    lines(76, [17, 13, 9, 16, 12, 15], 1); lines(100, [16, 18, 15, 6, 8], -1);
    for (let i = 0; i < 5; i++) for (let x = 71; x < 75; x += 2) P(x, 66 + i * 4, "#6a6a70");   // 頁邊的鉛筆數字
    R(100, 68, 18, 1, "#7a7a80"); R(100, 71, 15, 1, "#7a7a80");   // 鉛筆線
    R(84, 62, 6, 2, "#9aa8b8"); R(82, 84, 8, 1, "#c8b898");   // 小王子的圖（很小）、頁碼
    // 陳葵的筆記本
    R(126, 72, 22, 12, "#f4f0e4"); R(126, 72, 22, 1, "#8a8a90"); for (let x = 127; x < 148; x += 3) P(x, 71, "#8a8a90");
    for (let i = 0; i < 3; i++) R(129, 75 + i * 3, 14 - i * 3, 1, "#5a6a9a"); R(146, 76, 1, 9, "#e85a6a"); R(145, 84, 3, 1, "#3a3a40");
    // 杯子
    if (nt){ R(130, 58, 8, 9, "#c84a3a"); R(138, 60, 2, 4, "#c84a3a"); R(131, 58, 6, 1, "#6a3a22"); P(132, 58, "#f4f0f0"); P(135, 58, "#f4f0f0"); dither(130, 54, 8, 4, "#ffffff22", 3); }
    else { R(130, 59, 8, 8, "#f4f4f0"); R(138, 61, 2, 3, "#f4f4f0"); R(131, 59, 6, 1, "#4a2a18"); R(128, 66, 12, 1, "#d8d4cc"); R(52, 64, 8, 5, "#f4f4ec"); R(53, 66, 6, 3, "#1a2a1a"); }
    R(56, 76, 9, 10, "#3a6a8a"); R(65, 78, 2, 4, "#3a6a8a"); R(57, 76, 7, 1, nt ? "#6a3a22" : "#4a2a18");   // 你的杯子
    // 露營燈（深夜）
    if (nt){ dither(150, 28, 32, 34, "#ffd98a22", 2); R(161, 38, 10, 2, "#3a3a40"); R(165, 34, 2, 4, "#3a3a40"); R(162, 40, 8, 16, "#f4d870"); R(163, 41, 2, 14, "#fff4c0"); R(161, 56, 10, 3, "#3a3a40"); R(162, 44, 8, 1, "#e8e0d0"); }
    // 牛皮紙袋（白天，葉晴放的）
    if (o.env1){ R(160, 64, 24, 9, "#c8a070"); R(160, 64, 24, 1, "#a88050"); R(161, 66, 10, 1, "#8a6a40"); R(176, 65, 6, 3, "#a88050"); }
    if (o.env2){ R(160, 76, 24, 9, "#d4b080"); R(160, 76, 24, 1, "#a88050"); R(161, 78, 8, 1, "#8a6a40"); }
    // 你的手機
    R(150, 88, 8, 14, "#2a2a30"); R(151, 89, 6, 11, nt ? "#1a2030" : "#3a4050"); P(153, 101, "#5a5a60");
  };

  /* ---------- 漁會信用部（只在重現裡）：牆上的叫號機 x150–176（y20–34）；櫃台 x40–150（檯面 y52，玻璃 y30–52）；等候椅 x6–34（y62–76）；門 x176–192 ---------- */
  SC.c48_bank = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 76, "#e8e4d8"); R(0, 0, W, 4, "#d8d4c8"); R(0, 46, W, 2, "#2a8a5a");
    R(0, 76, W, 32, "#c8c0b0"); R(0, 76, W, 1, "#a8a090"); for (let x = 0; x < W; x += 16) R(x, 76, 1, 32, "#b8b0a0");
    R(52, 8, 72, 12, "#2a8a5a"); R(56, 11, 8, 6, "#f4f0e0"); R(58, 13, 4, 2, "#2a8a5a"); for (let x = 68; x < 120; x += 6) R(x, 13, 4, 2, "#e8f0e0");   // 招牌（魚的標誌）
    R(150, 20, 26, 14, "#2a2a2e"); R(153, 23, 6, 8, "#e83a3a"); R(161, 23, 6, 8, "#e83a3a"); R(169, 23, 4, 8, "#e83a3a");   // 叫號機
    R(40, 52, 110, 24, "#b89a70"); R(40, 52, 110, 2, "#8a6a48"); R(40, 30, 110, 22, "#d8e8ec88"); for (let x = 40; x <= 150; x += 37) R(x, 30, 2, 22, "#a8b0b4");
    [[56, 44], [93, 44], [130, 44]].forEach(([x, y]) => { R(x, y, 10, 7, "#3a3a40"); R(x + 1, y + 1, 8, 5, "#5a7a9a"); R(x + 4, y + 7, 2, 2, "#3a3a40"); });
    R(6, 62, 28, 3, "#3a6a8a"); R(6, 65, 28, 3, "#2a5a7a"); [8, 30].forEach(x => R(x, 68, 2, 8, "#5a5a60"));
    R(176, 26, 16, 50, "#8a9aa8"); R(178, 28, 12, 46, "#c8dce4"); R(176, 26, 16, 1, "#5a6a78");
    R(100, 50, 12, 2, "#f4f4ec"); R(102, 49, 6, 1, "#5a8a3a");   // 檯面上的存摺
  };

  /* ---------- 周家：借第 47 集。白天。昀昀的房間加上藍色的書盒（x166–174 y61–75）和桌上的影本（x98–122 y47–56） ---------- */
  SC.c48_living = (o) => { o = Object.assign({}, o, stOf(o)); SC.c47_living(o);
    if (!o.night){ R(117, 52, 11, 3, "#f4f4f0"); R(118, 50, 11, 3, "#f8f8f4"); R(119, 49, 9, 2, "#ecece8"); R(121, 50, 4, 1, "#3a3a40"); }   // 白包
  };
  SC.c48_desk = (o) => { o = Object.assign({}, o, stOf(o)); SC.c47_desk(o); };
  SC.c48_room = (o) => { o = Object.assign({}, o, stOf(o)); SC.c47_room(o);
    R(166, 61, 8, 14, "#2a5a9a"); R(166, 61, 8, 1, "#3a6aaa"); R(167, 62, 1, 13, "#1a4a7a"); R(169, 64, 3, 3, "#f4d040"); P(170, 63, "#f4d040"); P(170, 67, "#f4d040"); P(168, 65, "#f4d040"); P(172, 65, "#f4d040");   // 書盒
    if (o.copies || (inCase() && seenIt("o48_case"))){ [[98, 49], [104, 48], [110, 50], [116, 49]].forEach(([x, y], i) => { R(x, y, 7, 7, i % 2 ? "#f4f4ec" : "#ecece4"); R(x + 1, y + 2, 5, 1, "#8a8a90"); R(x + 1, y + 4, 4, 1, "#8a8a90"); }); }
  };

  /* ---------- 南澳魚市：借第 46 集（白天）。過磅台的桌上多一張紙（x136–146 y52–55） ---------- */
  SC.c48_mlot = (o) => { o = Object.assign({}, o, stOf(o)); SC.c46_lot(o); };
  SC.c48_dock = (o) => { o = Object.assign({}, o, stOf(o)); SC.c46_dock(o);
    R(137, 53, 9, 3, "#f0ece0"); R(138, 54, 6, 1, "#8a8a90");   // 阿蕊姨的鐵盒旁邊的紙
    R(36, 54, 16, 4, "#f4f4f0"); R(37, 53, 14, 1, "#d8e4ec");   // 手推車上的保麗龍箱
  };

  /* ---------- 安和護理之家：借第 24 集。服務台的左邊多一個綠色的資料夾（x78–91 y54–58，院長拿出來以後） ---------- */
  SC.c48_lobby = (o) => { o = Object.assign({}, o, stOf(o)); SC.c24_lobby(o);
    if (o.folder || (inCase() && asked("d4"))){ R(78, 55, 13, 4, "#3a8a5a"); R(78, 55, 13, 1, "#5aaa7a"); R(80, 56, 8, 1, "#f4f4ec"); }
  };
  SC.c48_lounge = (o) => { o = Object.assign({}, o, stOf(o)); SC.c24_lounge(o); };

  /* ---------- 人物造型 ---------- */
  const AL = id => (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null;
  const strip = L => { const o = Object.assign({}, L || {}); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  const SHEN = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };   // 停職：便服，深色的外套
  const DOG = { kind:"dog", coat:"#f0dcb0", collar:"#3a6ac8" };
  const KUI = Object.assign({ gender:"f", skin:"#f0d0b4", hair:"#5a3a2a", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" }, AL("kui") || {}, { top:"#e8a0a8", coat:"#5a5a6a", bottom:"#3a4a6a" });   // 下班：便服
  const HUI = { gender:"f", skin:"#ecc8a6", hair:"#2a2220", hairStyle:"bob", top:"#f4f0e4", coat:"#d8c8a8", bottom:"#3a3a44" };
  const LOOK = {
    kui:   Object.assign({}, KUI, { hello:"前輩，喝。" }),
    ye:    Object.assign({ gender:"f", skin:"#ecc8a6", hair:"#2a2220", hairStyle:"pony", top:"#f4f4f4", coat:"#7a7e86", bottom:"#5a5e66" }, AL("ye") || {}, { top:"#e8e0d0", coat:"#8a7a6a", bottom:"#3a3a44", hello:"我是來喝咖啡的。" }),
    yun:   Object.assign({ gender:"f", skin:"#f0d0b0", hair:"#1e1a18", hairStyle:"long", bottom:"#2e3a5a" }, AL("zhouyiqing") || {}, { top:"#d8d8e0", bottom:"#2e3a5a", hello:"……" }),
    fang:  { gender:"f", skin:"#ecc8a6", hair:"#6a3a2a", hairStyle:"pony", top:"#2a2a2e", bottom:"#3a3a44", hello:"沈先生。" },
    quan:  { age:"old", skin:"#c89a70", hair:"#d8d8d0", hairStyle:"short", top:"#e8e4d8", bottom:"#3a3a40", hat:"cap", capColor:"#3a5a4a", hello:"少年仔。" },
    rui:   { age:"old", gender:"f", skin:"#c8986c", hair:"#8a8478", hairStyle:"bun", top:"#c86a5a", apron:"#2a6a8a", bottom:"#3a3a44", hello:"要買魚？" },
    dir:   { gender:"f", skin:"#e8c0a0", hair:"#4a3a30", hairStyle:"bob", top:"#c8a8b8", coat:"#5a4a5a", bottom:"#3a3040", glasses:true, hello:"沈警官。" }
  };
  const DAILY = {
    kui:   [ { room:"seat", x:44, pose:"sit", facing:1, doing:"坐在最左邊那一桌，筆電開著，熱可可冒著煙。" }, { room:"seat", x:44, pose:"sit", facing:1, doing:"坐在最左邊那一桌，一邊打字，一邊吃飯糰。" } ],
    ye:    [ null, { room:"seat", x:110, pose:"read", facing:-1, doing:"坐在中間那一桌，看報紙。咖啡沒有加糖。" } ],
    yun:   [ null, { room:"room", x:124, pose:"sit", facing:1, doing:"坐在書桌前面，看著書櫃。" } ],
    fang:  [ null, { room:"living", x:70, pose:"stand", facing:1, doing:"站在客廳，手上拿著一疊白包。" } ],
    quan:  [ null, { room:"dock", x:104, pose:"stand", facing:-1, doing:"站在秤的旁邊，鉛筆插在耳朵上。" } ],
    rui:   [ null, { room:"dock", x:28, pose:"kneel", facing:1, doing:"蹲在手推車的旁邊刮魚鱗，刀子很快。" } ],
    dir:   [ null, { room:"lobby", x:104, pose:"stand", facing:1, doing:"站在服務台後面，在翻評鑑的資料夾。" } ]
  };
  EP48.suspects.forEach(s => {
    if (LOOK[s.id]){ if (LOOK[s.id].hello) s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP48.rooms = {
    cafe: [
      { id:"seat", name:"海風咖啡・外面的座位", scene:"c48_cafe", opt:(ph) => ph > 0 ? { time:"morning" } : { time:"night", rain:true }, details:[
        { id:"d48_window", name:"店裡的窗", hot:[6,30,26,20], text:"窗戶裡面，吧台的燈還亮著一盞。\n咖啡機上蓋著一塊布。阿彬說，晚上讓它也睡一下。" },
        { id:"d48_flowers", name:"花箱", hot:[4,57,30,7], text:"窗台下的花箱。紅的、黃的、白的小花。\n阿彬媽媽每天早上澆水，一盆一盆地澆。" },
        { id:"d48_lamp", name:"路燈", hot:[108,26,8,6], text:"一盞路燈。燈罩的下面，貼著一張褪色的尋狗啟事。\n那隻狗，叫做「豆豆」。" } ] },
      { id:"table", name:"海風咖啡・桌上", scene:"c48_table", opt:(ph) => ph > 0 ? { env1:asked("e2"), env2:asked("e3") } : { night:true, rain:true }, details:[
        { id:"d48_phone", name:"你的手機", hot:[150,88,8,14], text:"你的手機。螢幕是暗的。\n最後一則訊息，是昨天晚上昀昀傳的：「書，拜託你了。」\n下面一個貼圖：一顆黃色的太陽。" },
        { id:"d48_mug", name:"你的杯子", hot:[55,75,13,12], text:"你的杯子。豆花的頭，就靠在你的椅子腳上。\n你每喝一口，牠就抬一下眼睛。" },
        { id:"d48_street", name:"外面的街", hot:[0,8,192,26], text:"雨棚外面的街。\n一台計程車開過去，水花濺到人行道上。\n對面的便利商店，店員在打哈欠。" } ] }
    ],
    home: [
      { id:"living", name:"周家・客廳", scene:"c48_living", opt:(ph) => ({}), details:[
        { id:"d48_family", name:"全家福", hot:[70,22,16,14], text:"全家福。在燈塔前面拍的。\n相框的前面，多了一個小小的香爐，三炷香。" },
        { id:"d48_sofa", name:"沙發", hot:[54,52,56,16], text:"沙發上疊著一條被子。周慧芳昨天晚上，睡在這裡。\n被子的旁邊，一本美髮的雜誌，翻都沒有翻開。" } ] },
      { id:"desk", name:"周家・書桌", scene:"c48_desk", opt:(ph) => ({}), details:[
        { id:"d48_ledger", name:"記帳本", hot:[54,50,18,6], text:"她的家用記帳本。最後一頁，被撕掉了。\n撕口的旁邊，還留著一點點鉛筆的痕跡。" },
        { id:"d48_lamp2", name:"檯燈", hot:[92,42,10,14], text:"舊的檯燈。開關的地方，被手指摸得發亮。\n她每個月 16 號的晚上，都坐在這一盞燈的下面。" } ] },
      { id:"room", name:"周家・昀昀的房間", scene:"c48_room", opt:(ph) => ({}), details:[
        { id:"d48_bed", name:"床", hot:[24,54,52,12], text:"床鋪沒有睡過的樣子。被子還是摺成方塊。\n太陽的布偶，被拿到書桌上了。" },
        { id:"d48_poster", name:"海報", hot:[112,16,12,18], text:"樂團的海報。「媽媽說考完才可以去」。\n那一行字的旁邊，多了一個用鉛筆畫的小太陽。" } ] }
    ],
    market: [
      { id:"lot", name:"南澳魚市・停車場", scene:"c48_mlot", opt:(ph) => ({}), details:[
        { id:"d48_bar", name:"欄杆", hot:[2,50,40,10], text:"大門的欄杆。星期六的早上，進出的都是小貨車。\n警衛室裡，老包的位子，換了一個年輕人。" },
        { id:"d48_door", name:"管理室的門", hot:[86,30,16,46], text:"管理室的門開著。裡面有人在泡茶。\n門上貼著一張紙：「夜班領班　徵人」。紙已經黃了。" } ] },
      { id:"dock", name:"南澳魚市・過磅台", scene:"c48_dock", opt:(ph) => ({}), details:[
        { id:"d48_pillar", name:"大柱子", hot:[6,28,23,46], text:"那一根大柱子。四個晚上，你都靠著它。\n柱子上用粉筆寫著一排數字，是全叔每一板的尾數。" },
        { id:"d48_lockers", name:"置物櫃", hot:[150,28,24,46], text:"一排鐵的置物櫃。\n最右邊那一格，名牌被撕掉了。漆的上面，還看得出一個「石」字的形狀。" } ] }
    ],
    anhe: [
      { id:"lobby", name:"安和護理之家・大廳", scene:"c48_lobby", opt:(ph) => ({}), details:[
        { id:"d48_tank", name:"魚缸", hot:[128,58,22,16], text:"大廳的魚缸。兩尾橘色的魚，一尾紅色的。\n魚缸的旁邊貼著：「請勿餵食　長輩們已經餵過了」。" },
        { id:"d48_guard", name:"警衛桌", hot:[4,44,40,20], text:"警衛桌。監視器的螢幕，分成四格。\n老廖不在。值班的是一個新的年輕人，在看手機。" } ] },
      { id:"lounge", name:"安和護理之家・交誼廳", scene:"c48_lounge", opt:(ph) => ({}), details:[
        { id:"d48_tv", name:"電視", hot:[70,32,30,22], text:"電視在播歌仔戲。聲音開得很大。\n沒有人在看。" },
        { id:"d48_win", name:"窗戶", hot:[140,22,40,30], text:"窗外是一棵大樹，和一小片天空。\n窗台上排著一排紙鶴。有一隻，是藍色的。" } ] }
    ]
  };
  EP48.phases[0].scene = "c48_table"; EP48.phases[0].sceneOpt = { night:true, rain:true };
  EP48.phases[1].scene = "c48_cafe"; EP48.phases[1].sceneOpt = { time:"morning" };

  /* ---------- 重現（結案的時候） ---------- */
  const F = 98;
  EP48.looks = { shenV:strip(SHEN), dogV:Object.assign({}, DOG), huiV:strip(HUI), kuiV:strip(KUI), quanV:strip(LOOK.quan), ruiV:strip(LOOK.rui) };
  const mkR = beats => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join); const seq = beats.map(b => b.st || {});
    return beats.map(b => { const o = Object.assign({}, b, { opt:Object.assign({}, b.opt || {}, { ds, seq }) }); delete o.st; return o; }); };
  const RB = mkR([
    { t:"113 年 2 月", d:6, cap:"113 年 2 月，南澳區漁會信用部。萬主任交給她三份公司的資料，叫她來開戶。三家公司的代表人，她都認識。", scene:"c48_bank", opt:{}, m:{ huiV:[96, F, "stand", 1, 96, F] } },
    { t:"每個月 16 號", d:6, cap:"每個月 15 號，海龍轉八百七十萬給鼎盛。16 號，她來這裡，把錢分成三筆。17 號，再來一次：三筆，轉到台北。", scene:"c48_bank", opt:{}, m:{ huiV:[96, F, "write", 1, 96, F] } },
    { t:"那天晚上", d:6, cap:"每一次，她都把存摺的內頁，偷偷影印一張。回到家，在月曆的 16 號，畫一顆很小的星星。", scene:"c48_desk", opt:{ night:true }, m:{ huiV:[72, F, "write", 1, 72, F] } },
    { t:"113 年 4 月", d:6, cap:"影本，她藏在女兒那一本《小王子》的書盒裡。內襯的硬紙板後面。昀昀睡著了。", scene:"c48_room", opt:{ night:true }, m:{ huiV:[160, F, "kneel", 1, 160, F] } },
    { t:"三年", d:5.5, cap:"三十七次。一次都沒有晚過。阿木伯去年九月走了，他的名字，還在每個月收錢、轉錢。", scene:"c48_dock", opt:{}, m:{ quanV:[104, F, "stand", -1, 104, F], ruiV:[28, F, "kneel", 1, 28, F] } },
    { t:"4 月 15 日", d:6, cap:"4 月 15 日。她最後一次到魚市對帳。這一次，她沒有買魚。「阿蕊姨，對不起。」", scene:"c48_dock", opt:{}, m:{ huiV:[60, F, "stand", -1, 84, F], ruiV:[28, F, "kneel", 1, 28, F], quanV:[104, F, "stand", -1, 104, F] } },
    { t:"4 月 21 日", d:6.5, cap:"她翻開《小王子》，在第 44 頁的頁邊，一個數字、一個數字地寫。只有坐下來、一頁一頁翻的人，才看得懂。", scene:"c48_desk", opt:{ night:true }, m:{ huiV:[72, F, "write", 1, 72, F] } },
    { t:"4 月 24 日 01:00", d:6, cap:"她相信，會有人坐下來。", scene:"c48_cafe", opt:{ time:"night", rain:true }, m:{ shenV:[64, F, "sit", -1, 64, F], kuiV:[44, F, "sit", 1, 44, F], dogV:[78, F, "lie", -1, 78, F] } }
  ]);

  /* ---------- 結案（結局固定） ---------- */
  const pickR = () => { try { return (S.result && S.result.pick && S.result.pick.reasoning) || {}; } catch (e) { return {}; } };
  const missing = () => { try { const pk = pickR(); return EP48.reasoning.filter((r, i) => (!r.kinds) && pk[i] !== r.answer).length; } catch (e) { return 0; } };
  const gotXu = () => { try { return typeof S !== "undefined" && S && S.ev && S.ev.e48_xu !== undefined; } catch (e) { return false; } };
  const arcSet = (f, how) => { try { if (typeof S !== "undefined" && S && S.done && inCase() && typeof ARC !== "undefined" && !ARC.has(f)) ARC.set(f, "prince", how || "told"); } catch (e) {} };
  const flags = (good) => { arcSet("money_trail", good && !missing() ? "found" : "told"); if (gotXu()) arcSet("huasheng", "found"); };
  const tail = () => "\n阿彬端來第三杯咖啡，放在葉晴的前面。她沒有說不要。\n豆花趴在桌腳，下巴壓著那一本《小王子》的書角。\n你把書闔起來。第 44 頁的摺痕，讓它自己又打開了一次。"
    + (gotXu() ? "\n你的手機裡，還有許知夏傳來的那一張照片。十二樓。你又看了一次，才把螢幕關掉。" : "");
  EP48.court = {
    title: "海風咖啡・4 月 24 日 13:00", scene: "c48_cafe", opt:{ time:"noon" },
    detective: Object.assign({}, SHEN),
    who: ph => ["ye", "kui"],
    open: ph => "13:00。葉晴把報紙摺起來，壓在咖啡杯的下面。\n陳葵把筆電轉過來，對著她。筆記本攤開在旁邊。\n「沈警官。」葉晴說。「我只是一個在喝咖啡的人。」\n「從頭說。錢，最後去了哪裡？」",
    kindLine: {
      queh: "錢，最後到了鼎盛海運的董事長那裡。",
      workers: "錢，最後到了那三家小公司的負責人手上。",
      taipei: "錢，最後到了台北的一家公司。",
      hailong: "錢，轉了一圈，又回到了海龍漁業。"
    },
    kindTrue: "（葉晴的筆，停了一下。）\n「台北。」她說。\n「一段一段來。每一段，給我看東西。」",
    murmur: [ "（陳葵的手指，停在鍵盤上。）", "（豆花在桌子底下，翻了一個身。）", "（街對面的警局，有人在門口抽菸。）" ],
    confess: {}, cornered: {}, deny: {},
    replayText: "你把《小王子》翻到第 44 頁，放在桌子的中間。從 113 年的 2 月開始——",
    replay: { scene:"c48_bank", opt:{}, clean:true, cam:"經過重現", date:"2024-02-06", beats:RB },
    get endGood(){ const ms = missing(); flags(true);
      return "葉晴把影本一張一張翻過去，又翻回來。\n「海龍、鼎盛、三家、華晟。」她說。「每一段，都有東西。」\n「影本，我下午去周家，請周小姐的妹妹，正式交給我。」\n「禮拜一，我分一個新的案子。洗錢防制法。」\n她站起來，把咖啡喝完。「沈警官，你今天沒有見過我。」"
        + (ms ? "\n（你沒有講到的那幾樣，是陳葵把筆電轉過去，一頁一頁補給她看的。）" : "\n（陳葵把筆電闔上。「一頁都不用補。」她說。）")
        + tail(); },
    get endBad(){ const k = (typeof S !== "undefined" && S && S.result && S.result.pick && S.result.pick.kind) || ""; flags(false);
      return (k === "queh" ? "葉晴搖頭。「八十二歲。重度失智。她現在叫每一個人『阿嬤』。」\n「她的月費，是鼎盛在付。」"
          : k === "workers" ? "葉晴搖頭。「全叔連發票都不會開。阿蕊姨的中低收入，被取消了。」\n「涂水木，去年九月就過世了。」"
          : k === "hailong" ? "葉晴搖頭。「海龍的帳上，每個月出去八百七十萬。一毛都沒有回來。」"
          : "葉晴搖頭。")
        + "\n陳葵把影本翻到中間那一張，用手指點著：「17 號。三家，各兩百八十八萬。」\n「華晟投資顧問。台北。」\n葉晴看了很久。然後她把影本收進牛皮紙袋。\n「禮拜一，我分一個新的案子。」"
        + tail()
        + "\n（這一次，最後的那一段，是他們替你走完的。）"; }
  };

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP48.fac = { home:["#d8ccb8", "#5a6a7a"], market:["#c8c4b8", "#2a5a8a"], anhe:["#f0ece0", "#3a8a6a"] };
  EP48.setting = { cafe:"city", home:"town", market:"harbour", anhe:"town" };
  EP48.car = "#7a8a6a";   // 他自己的舊車
  EP48.outScenes = ["c48_cafe", "c48_table", "c48_mlot"];
  const SKY48 = [ ["#0a0e16", "#1a2230", "#2a2e34", "#24282e", 1, 1], ["#9cc4e0", "#e4ecf0", "#7a7a76", "#6a6a66", 0, 0] ];
  EP48.worldSky = ph => SKY48[Math.min(ph || 0, SKY48.length - 1)];
  EP48.worldOrder = { cafe:["seat", "table"], home:["living", "desk", "room"], market:["lot", "dock"], anhe:["lobby", "lounge"] };
  EP48.roomDesc = {
    seat:"海風咖啡外面的座位。街對面是警局。", table:"最左邊那一桌。書、筆電、杯子。",
    living:"周家的客廳。", desk:"周慧玲的書桌。", room:"昀昀的房間。",
    lot:"南澳魚市的停車場。", dock:"過磅台。一台秤，一張桌子，一根大柱子。",
    lobby:"安和護理之家的大廳。", lounge:"交誼廳。鋼琴、電視、窗邊的輪椅。"
  };
  const rx = (i, x) => 116 + i * 198 + x;
  const say = (who, text, name) => ({ say:[who, text], name });
  EP48.world = {};
  EP48.locations.forEach(l => { EP48.world[l.id] = { auto:true, you:SHEN, order:(EP48.worldOrder || {})[l.id] }; });
  Object.assign(EP48.world.cafe, { spawn:rx(0, 80),
    intro: [
      { set:{ px:rx(0, 80), face:-1 } },
      say("you", "（外面的座位，和最左邊那一張桌子。書，攤在桌上。）", "你")
    ],
    extras: [
      { id:"x48_abin", name:"阿彬", x:rx(0, 30), phase:1, L:{ skin:"#e0b890", hair:"#1a1a1a", hairStyle:"short", top:"#f4f4f0", apron:"#2a7a8a", bottom:"#3a3a44", hat:"cap", capColor:"#2a5a6a" }, pose:"stand", facing:1,
        lines:["（他端著托盤，經過你的桌子。）", "我不在喔。", "我什麼都沒有看到。", "……要加一片鹹蛋黃吐司嗎？不在的人請客。"] }
    ] });
  Object.assign(EP48.world.home, { spawn:rx(0, 30),
    extras: [
      { id:"x48_hdog", name:"豆花", x:rx(2, 108), L:Object.assign({}, DOG), pose:"sit", facing:1,
        lines:["（豆花坐在昀昀的腳邊。）", "（牠把下巴放在她的膝蓋上，一動也不動。）"] }
    ] });
  Object.assign(EP48.world.market, { spawn:rx(0, 30),
    labels: [ { room:"lot", x:119, y:21, text:"南澳魚市", size:5, color:"#1a3a6a", bold:true, align:"center" } ] });
  Object.assign(EP48.world.anhe, { spawn:rx(0, 150),
    extras: [
      { id:"x48_queh", name:"闕奶奶", x:rx(1, 96), L:{ age:"old", gender:"f", skin:"#e8c8a8", hair:"#e8e8e0", hairStyle:"bun", top:"#c8a8c8", bottom:"#6a5a7a" }, pose:"sit", facing:1,
        lines:["（一位很瘦的奶奶，坐在沙發上，手上抱著一隻布兔子。）", "阿嬤，妳來了？", "（她把一塊餅乾放在你的手上。）吃。吃。", "（她看著窗外。）船，什麼時候回來？"] }
    ] });
  EP48.mapPos = { cafe:[120,62,"u"], home:[46,40,"u"], market:[184,98,"d"], anhe:[196,26,"u"] };
  EP48.mapRoads = [["cafe","home"],["cafe","market"],["cafe","anhe"],["home","market"]];
  EP48.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 6; x < 170; x += 8) for (let y = 8; y < 88; y += 7){ if ((x * 3 + y) % 5 === 0) continue; R(x, y, 6, 5, "#c8c0b0"); }   // 市區
    const rd = "#d8d4c8";
    R(0, 66, 240, 5, rd); R(118, 20, 5, 50, rd); R(44, 20, 5, 48, rd); R(118, 20, 100, 4, rd); R(176, 66, 5, 30, rd);
    for (let x = 4; x < 240; x += 12) R(x, 68, 6, 1, "#f4f0e0");
    R(0, 108, 240, 27, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 112 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");   // 海
    R(170, 92, 34, 12, "#c8c4b8"); R(170, 92, 34, 2, "#2a5a8a");   // 南澳魚市
    R(110, 56, 22, 8, "#e8dcc4"); R(110, 56, 22, 2, "#2a7a8a"); R(134, 52, 14, 12, "#d8dce0"); R(134, 52, 14, 2, "#2a4a7a");   // 海風咖啡、警局
    R(36, 30, 18, 10, "#d8ccb8"); R(36, 30, 18, 2, "#5a6a7a");   // 港西街
    R(186, 12, 22, 12, "#f0ece0"); R(186, 12, 22, 2, "#3a8a6a"); R(195, 14, 4, 4, "#e85a5a");   // 安和
  };
})();
