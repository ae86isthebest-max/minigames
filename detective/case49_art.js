/* =========================================================
   第 49 集：場景、人物造型、重現、結案、走動畫面、地圖
   新畫的：海風咖啡的桌上 c49_table（近景）
   借用的：海風咖啡 SC.cafe；港濱路口 c44_hfront（加計程車、公車站牌）、c36_lot（白天、出事以前的樣子＋封條）；
           公寓 c38_front／c38_office／c38_hall4／c38_living（第 38 集）、大廳監視器 c40_lcam（第 40 集）；
           麵店 SC.diner（第 3 集，加招牌、出單機、安全帽）；公設辯護人室 c40_pd（第 40 集，桌上換成平台的回覆）。
   這一集玩家是沈岳（停職，便服，深色外套）；許知夏請假，灰色帽 T。
   ========================================================= */
EP49.art = true;
(() => {
  const PR = PX.prim, { R: R0, P: P0, dither } = PR;
  const W = 192, H = 108;
  const SC = PX.SCENES;
  const R = (x, y, w, h, c) => R0(Math.round(x), Math.round(y), w, h, c), P = (x, y, c) => P0(Math.round(x), Math.round(y), c);
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o || !o.ds) return {}; const [i, p] = beatAt(o.t || 0, o.ds); return Object.assign({ _p:p }, (o.seq || [])[i] || {}); };
  const st = () => (typeof S !== "undefined" && S) ? S : null;
  const inCase = () => typeof C !== "undefined" && C && C.id === "seconds";
  const seenIt = id => { const s = st(); return !!(s && inCase() && ((s.seen || []).includes(id) || (s.asked || []).includes(id) || (s.ev && s.ev[id] !== undefined))); };
  const rain = (o, n, top) => { if (!o.rain) return; let s = Math.floor((o.t || 0) * 9) * 131 + 7; for (let i = 0; i < (n || 70); i++){ s = (s * 1103515245 + 12345) & 0x7fffffff; R(s % W, (s >> 8) % (top || 56), 1, 3, "#b8c4d055"); } };

  /* ---------- 海風咖啡・外面的座位 ---------- */
  SC.c49_cafe = (o) => { o = Object.assign({}, o, stOf(o)); SC.cafe(Object.assign({ time:"morning", ep:49 }, o)); };

  /* ---------- 海風咖啡・桌上（近景，白天）：背景 y0–56；桌面 y56–108；
     許知夏的筆電（螢幕對著你）x58–126（螢幕 x61–123、y25–57）；工具箱 x140–184（y40–60）；烏龍茶 x28–40（y57–69）；
     筆記本 x14–46（y72–90）；閃電紀錄（印出來的）x88–118（y78–94）；打火機 x135–144（y91–99）；你的手機 x149–160（y86–101）。
     o.wave＝螢幕上是波形；o.paper＝閃電紀錄；o.app＝手機打開外送 App；o.rain ---------- */
  SC.c49_table = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 56, o.rain ? "#a8b4c0" : "#cfdce6"); R(0, 30, W, 26, o.rain ? "#9a968e" : "#b8b4aa");
    for (let k = 0; k < 6; k++){ const x = 10 + k * 32; R(x, 14, 22, 18, o.rain ? "#c4bcae" : "#d8d0c0"); R(x + 3, 18, 7, 5, "#9aa8b4"); R(x + 12, 18, 7, 5, "#9aa8b4"); }
    R(0, 40, W, 6, "#8a8a86"); for (let x = 6; x < W; x += 24) R(x, 42, 10, 1, "#e8e0a0");
    for (let x = 0; x < W; x += 8) R(x, 0, 8, 5, (x / 8) % 2 ? "#f4f0e0" : "#2a7a8a"); R(0, 5, W, 1, "#1a4a5a");
    rain(o, 60);
    R(0, 56, W, 52, "#ecebe6"); R(0, 56, W, 2, "#d4d2cc"); dither(0, 92, W, 16, "#00000010", 2);
    // 許知夏的筆電（螢幕對著你）
    R(58, 22, 68, 38, "#2a2c32"); R(58, 22, 68, 1, "#4a4c54"); R(61, 25, 62, 32, "#141a24"); R(54, 60, 76, 4, "#b8bcc4"); R(54, 60, 76, 1, "#d8dce4"); R(86, 58, 12, 2, "#3a3c44");
    if (o.wave){ R(61, 25, 62, 32, "#0e1420"); R(62, 41, 60, 1, "#2a4a3a");
      for (let x = 62; x < 122; x++){ const n = ((x * 37) % 5) - 2, h = x === 100 ? 0 : (Math.abs(n) > 1 ? 2 : 1); if (x !== 100) R(x, 41 - h, 1, h * 2 + 1, "#4ac88a"); }
      R(100, 27, 1, 29, "#8af4b8"); R(99, 31, 3, 21, "#6ae8a0"); R(103, 35, 1, 13, "#5ad890");
      R(100, 26, 1, 1, "#e85a5a"); for (let y = 26; y < 57; y += 2) P(97, y, "#e85a5a");
      R(63, 27, 14, 2, "#3a5a7a"); R(63, 53, 58, 2, "#2a3a4a"); R(80, 53, 3, 2, "#e8e8e8"); }
    else { R(61, 25, 62, 32, "#2a4a6a"); [[66, 29], [78, 29], [66, 39]].forEach(([x, y]) => { R(x, y, 7, 5, "#e8c060"); R(x, y, 3, 1, "#f4d880"); }); R(61, 54, 62, 3, "#1a2a3a"); }
    // 工具箱（銀色）
    R(140, 40, 44, 20, "#b8bcc0"); R(140, 40, 44, 1, "#dce0e4"); R(140, 49, 44, 1, "#8a8e94"); R(140, 59, 44, 1, "#7a7e84");
    R(156, 37, 12, 2, "#4a4c52"); R(156, 37, 1, 4, "#4a4c52"); R(167, 37, 1, 4, "#4a4c52");
    R(146, 48, 4, 3, "#5a5e64"); R(174, 48, 4, 3, "#5a5e64"); R(152, 53, 14, 5, "#f4f0e0"); R(153, 55, 10, 1, "#c83a2a");
    // 烏龍茶（紙杯）
    R(29, 58, 10, 11, "#f8f6f0"); R(29, 58, 10, 1, "#c8a870"); R(30, 62, 8, 3, "#c8b090"); R(39, 61, 1, 4, "#d8d4c8"); dither(29, 53, 10, 5, "#ffffff22", 3);
    // 筆記本：一條時間線
    R(14, 72, 32, 18, "#f4f0e4"); R(14, 72, 32, 1, "#8a8a90"); R(16, 80, 28, 1, "#3a3a44"); for (let x = 16; x <= 44; x += 4) R(x, 79, 1, 3, "#3a3a44");
    R(31, 76, 3, 3, "#e85a5a"); P(32, 77, "#f4f0e4"); if (seenIt("e49_bus")){ R(33, 83, 1, 4, "#2a4a9a"); } if (seenIt("doc49_plat")){ R(29, 83, 1, 4, "#2a8a5a"); }
    // 閃電紀錄
    if (o.paper){ R(88, 78, 30, 16, "#fbfbf8"); R(88, 78, 30, 1, "#c8c8c8"); R(90, 80, 12, 2, "#2a4a7a"); for (let k = 0; k < 4; k++) R(90, 84 + k * 2, 24 - (k % 2) * 6, 1, "#8a8a90"); R(108, 80, 8, 2, "#e8a020"); }
    R(64, 66, 8, 8, "#3a6a8a"); R(72, 68, 2, 4, "#3a6a8a"); R(65, 66, 6, 1, "#4a2a18"); R(76, 70, 12, 5, "#f4e0b0"); R(77, 71, 10, 1, "#e8a040"); R(77, 73, 10, 1, "#f4f0e0");   // 你的杯子、三明治
    // 舅舅的打火機
    R(136, 92, 6, 7, "#c8a040"); R(136, 92, 6, 1, "#e8c870"); R(136, 94, 6, 1, "#a8802a"); P(141, 97, "#e8c870");
    // 你的手機
    R(150, 87, 9, 13, "#2a2a30"); R(151, 88, 7, 10, o.app ? "#f4f4f0" : "#3a4050"); if (o.app){ R(151, 88, 7, 2, "#2a8a5a"); R(152, 91, 5, 1, "#8a8a90"); R(152, 93, 4, 1, "#8a8a90"); R(152, 95, 5, 1, "#2a8a5a"); } P(154, 99, "#5a5a60");
  };

  /* ---------- 港濱路口・店門口：c44_hfront（白天）＋公車站牌 x146–155（牌子 y30–38，柱子 y38–66）＋轉角的計程車 x150–188（y70–86，o.taxi） ---------- */
  SC.c49_hfront = (o) => { o = Object.assign({}, o, stOf(o)); SC.c44_hfront(o);
    R(150, 38, 1, 28, "#6a6e72"); R(146, 30, 10, 9, "#f4f4f0"); R(146, 30, 10, 2, "#2a6ac8"); R(147, 34, 8, 3, "#e8eef8"); R(148, 66, 5, 1, "#5a5e62");
    if (o.taxi){ const x = 150, y = 70;
      R(x + 6, y, 24, 6, "#e8c020"); R(x + 8, y + 1, 9, 4, "#4a6a8a"); R(x + 19, y + 1, 9, 4, "#4a6a8a"); R(x + 14, y - 2, 8, 2, "#f4f4f0");
      R(x, y + 6, 38, 8, "#f0c818"); R(x, y + 6, 38, 1, "#f8e070"); R(x, y + 10, 38, 1, "#c8a010"); R(x + 36, y + 7, 2, 2, "#fff4c0"); R(x, y + 8, 2, 2, "#e85a3a");
      [4, 28].forEach(a => { R(x + a, y + 13, 7, 4, "#1a1a1a"); R(x + a + 2, y + 14, 3, 2, "#8a8a8e"); });
      R(x + 23, y + 2, 2, 2, "#c83a3a"); }
    if (o.rain) rain(o, 70, 100);
  };

  /* ---------- 店後面的停車場：c36_lot（白天、出事以前的樣子＝沒有粉筆框；攝影機還歪著）＋後門上的封條 ---------- */
  SC.c49_lot = (o) => { o = Object.assign({}, o, stOf(o)); SC.c36_lot({ day:true, pre:true, pushed:true });
    for (let k = 0; k < 20; k++){ P(61 + k, 36 + Math.round(k * 0.6), "#f4f4f0"); P(61 + k, 37 + Math.round(k * 0.6), "#f4f4f0"); } R(68, 39, 6, 2, "#c83a3a");
    R(58, 70, 26, 2, "#b8b8b0");   // 門檻：新補的水泥
  };

  /* ---------- 公寓：借第 38 集。樓下的大門右邊多一個對講機 x86–90（y61–69）；管理室的窗口左邊多一台錄影主機 x84–96（y48–53） ---------- */
  SC.c49_front = (o) => { o = Object.assign({}, o, stOf(o)); SC.c38_front(o);
    R(86, 61, 4, 8, "#8a8e94"); R(86, 61, 4, 1, "#b8bcc0"); R(87, 63, 2, 3, "#3a3e44"); P(87, 67, "#e8e8e0"); P(88, 67, "#e8e8e0");
  };
  SC.c49_office = (o) => { o = Object.assign({}, o, stOf(o)); SC.c38_office(o);
    R(84, 48, 12, 5, "#2a2a2e"); R(84, 48, 12, 1, "#4a4a52"); P(86, 50, "#4ae86a"); P(88, 50, "#4ae86a"); R(91, 50, 4, 1, "#6a6a72");
    if (o.usb){ R(118, 52, 3, 2, "#2a6ac8"); }
  };
  SC.c49_hall4 = (o) => { o = Object.assign({}, o, stOf(o)); SC.c38_hall4(o); };
  SC.c49_living = (o) => { o = Object.assign({}, o, stOf(o)); SC.c38_living(Object.assign({ off:true, clean:true }, o));
    R(25, 51, 4, 3, "#c8a040"); R(25, 51, 4, 1, "#e8c870");   // 小盤子上的打火機
    R(31, 57, 8, 2, "#f4f0e4"); R(31, 57, 2, 2, "#c83a2a"); R(34, 58, 4, 1, "#8a8a90");   // 鞋櫃上壓著的菜單
  };

  /* ---------- 澄東牛肉麵：借第 3 集的 SC.diner。窗戶上面一塊招牌 x36–80（y1–8）；櫃台上的出單機 x150–162（y46–54）；
     桌上的安全帽 x61–72（y56–62）；湯鍋 x166–182（y44–54） ---------- */
  SC.c49_noodle = (o) => { o = Object.assign({}, o, stOf(o)); SC.diner(o);
    R(36, 1, 44, 8, "#8a2a1e"); R(36, 1, 44, 1, "#a83a2a"); R(37, 8, 42, 1, "#5a1a12");
    R(150, 49, 12, 5, "#3a3a40"); R(150, 49, 12, 1, "#5a5a62"); R(152, 46, 8, 3, "#f8f8f4"); R(153, 47, 6, 1, "#8a8a90"); P(160, 51, "#4ae86a");
    R(167, 45, 14, 9, "#a8acb0"); R(166, 44, 16, 2, "#c8ccd0"); R(167, 50, 14, 1, "#8a8e92"); dither(166, 36, 16, 8, "#ffffff44", 2);   // 湯鍋
    R(62, 57, 9, 5, "#2a8a5a"); R(63, 56, 7, 1, "#3aa86a"); R(68, 58, 3, 2, "#1a2a30"); R(61, 61, 11, 1, "#1e6a44");
    if (o.rain) rain(o, 40, 30);
  };

  /* ---------- 公設辯護人室：c40_pd。桌上換成三樣東西：牛皮紙袋 x100–114、照片 x116–130、地圖 x132–145（y48–56） ---------- */
  SC.c49_pd = (o) => { o = Object.assign({}, o, stOf(o)); SC.c40_pd(o);
    R(100, 42, 45, 14, "#e8e4d8");
    R(100, 49, 14, 7, "#c8a070"); R(100, 49, 14, 1, "#a88050"); R(102, 51, 7, 1, "#8a6a40"); R(103, 47, 9, 2, "#fbfbf8");
    R(116, 49, 14, 7, "#fbfbf8"); R(117, 50, 12, 5, "#6a3a32"); R(118, 50, 4, 5, "#a83a2a"); R(119, 51, 2, 1, "#f4f4f0"); R(123, 52, 3, 2, "#c8a040");
    R(132, 49, 13, 7, "#f4f8f0"); R(133, 50, 11, 5, "#d8e8d0"); for (let k = 0; k < 9; k++) P(134 + k, 54 - Math.round(k * 0.4), "#2a5ac8"); R(142, 50, 2, 2, "#e85a3a");
  };

  /* ---------- 人物造型 ---------- */
  const AL = id => (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null;
  const strip = L => { const o = Object.assign({}, L || {}); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  const SHEN = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const DOG = { kind:"dog", coat:"#f0dcb0", collar:"#3a6ac8" };
  const XU = Object.assign({ gender:"f", skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob" }, AL("xu") || {}, { top:"#8a8e96", coat:undefined, bottom:"#3a3e48" });   // 請假：灰色帽 T
  const RIDER = { skin:"#e0b890", hair:"#1a1a1a", hairStyle:"short", top:"#2a8a5a", coat:"#2a8a5a", bottom:"#2a2e36", hat:"cap", capColor:"#2a8a5a" };
  const LOOK = {
    xu:    Object.assign({}, XU, { hello:"一秒一秒地來。" }),
    e:     { age:"old", gender:"f", skin:"#e0b890", hair:"#8a8480", hairStyle:"bun", top:"#b86a8a", apron:"#e8dcc0", bottom:"#4a4a52", hello:"吃過了沒有？" },
    fan:   { skin:"#c89870", hair:"#4a4a48", hairStyle:"short", top:"#ece6d4", coat:"#4a5a6a", bottom:"#3a3a40", hat:"cap", capColor:"#c8a020", hello:"我什麼都沒看到。" },
    wan:   { age:"old", skin:"#d8a880", hair:"#c8c8c0", hairStyle:"short", top:"#f4f0e8", coat:"#7a8a6a", bottom:"#4a4a52", glasses:true, hello:"沈先生。" },
    zou:   { age:"old", gender:"f", skin:"#e8c8a8", hair:"#a8a4a0", hairStyle:"bun", top:"#b88aa8", bottom:"#5a5a66", hello:"沈先生。" },
    huo:   { gender:"f", skin:"#ecc8a6", hair:"#3a2a22", hairStyle:"bob", top:"#c87a4a", bottom:"#4a4a52", hello:"快一點。" },
    rider: Object.assign({}, RIDER, { hello:"大哥，要叫東西吃？" }),
    fang:  Object.assign({ skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#2a2a30", bottom:"#2a2a30", glasses:true }, AL("fang") || {}, { hello:"沈岳。" })
  };
  const DAILY = {
    xu:    [ { room:"seat", x:60, pose:"sit", facing:1, doing:"坐在最外面那一桌，工具箱開著，在筆記本上畫一條線。" }, { room:"seat", x:60, pose:"sit", facing:1, doing:"坐在最外面那一桌，把一疊紙放進透明的資料夾。" } ],
    e:     [ { room:"hfront", x:128, pose:"hold@cloth", facing:-1, doing:"站在自己的店門口，手上抓著一條抹布。" }, { room:"hfront", x:128, pose:"hold@cloth", facing:-1, doing:"站在自己的店門口。雨棚下面，掛著兩條抹布。" } ],
    fan:   [ { room:"hfront", x:140, pose:"stand", facing:1, doing:"站在計程車的旁邊，手上一碗粥。" }, null ],
    wan:   [ { room:"office", x:120, pose:"stand", facing:-1, doing:"站在管理室的窗口旁邊，在看報紙。" }, { room:"office", x:120, pose:"stand", facing:-1, doing:"站在管理室的窗口旁邊。" } ],
    zou:   [ { room:"hall4", x:128, pose:"stand", facing:-1, doing:"站在自己家的門口，門開著一條縫。" }, null ],
    huo:   [ { room:"office", x:52, pose:"hold@bag", facing:-1, doing:"站在信箱的前面，提著一袋菜。" }, null ],
    rider: [ null, { room:"shop", x:70, pose:"phone", facing:1, doing:"站在麵店的門口，在滑手機等單。" } ],
    fang:  [ null, { room:"pd", x:148, pose:"stand", facing:-1, doing:"站在窗戶的旁邊，沒有坐下來。公事包放在腳邊。" } ]
  };
  EP49.suspects.forEach(s => {
    if (LOOK[s.id]){ if (LOOK[s.id].hello) s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP49.rooms = {
    cafe: [
      { id:"seat", name:"海風咖啡・外面的座位", scene:"c49_cafe", opt:(ph) => ph > 0 ? { time:"noon", rain:true } : { time:"morning" }, details:[
        { id:"d49_window", name:"店裡的窗", hot:[6,30,26,20], text:"窗戶裡面，阿彬媽媽在滷蛋。一大鍋。\n她看到許知夏，從窗戶裡揮了一下手。" },
        { id:"d49_flowers", name:"花箱", hot:[4,57,30,7], text:"窗台下的花箱。阿彬媽媽澆過水了。\n最邊邊多了一盆小小的多肉。上面插著一張紙：「許小姐的　請勿澆水」。" },
        { id:"d49_lamp", name:"路燈", hot:[108,26,8,6], text:"路燈。燈罩下面那一張尋狗啟事，被撕掉了。\n膠帶的旁邊，有人用原子筆寫了兩個字：「找到」。" } ] },
      { id:"table", name:"海風咖啡・桌上", scene:"c49_table", opt:(ph) => ({ wave:seenIt("doc49_dash"), paper:seenIt("x7"), app:seenIt("doc49_app"), rain:ph > 0 }), details:[
        { id:"d49_street", name:"外面的街", hot:[0,8,192,26], text:"雨棚外面的街。\n一台公車開過去。車頭的字是「7 海風路口」。\n許知夏抬頭看了一眼，又低頭。" },
        { id:"d49_mug", name:"你的杯子", hot:[63,65,26,10], text:"你的美式，沒有加糖。阿彬記得。\n杯子的旁邊，一個火腿蛋三明治，你咬了一口就忘了。" } ] }
    ],
    harbor: [
      { id:"hfront", name:"港濱路口・店門口", scene:"c49_hfront", opt:(ph) => ({ taxi:!ph, rain:ph > 0 }), details:[
        { id:"d49_congee", name:"阿娥粥店", hot:[110,30,34,30], text:"阿娥粥店。早上開到十一點，傍晚再開。\n牆上的電視，開著第四台的新聞。右下角跳著時間。\n許知夏看了一下，又看了一下自己的手機。「快了十一秒。」她說。「電視也不準。」" },
        { id:"d49_71", name:"路口的那一棟樓", hot:[162,0,30,22], text:"港濱路 71 號。綠色的防護網還包著。\n拆除的公告又換了一張：六月。" },
        { id:"d49_patch", name:"新補的柏油", hot:[2,69,36,14], text:"水管工程填平的那一塊柏油。\n邊上已經有一條細細的裂縫了。" } ] },
      { id:"hlot", name:"店後面的停車場", scene:"c49_lot", opt:(ph) => ({}), details:[
        { id:"d49_win2", name:"粥店樓上的窗", hot:[127,9,20,14], text:"阿娥姨樓上的窗。對著這一片停車場。\n那一天晚上，她就坐在窗戶的裡面，看氣象。" },
        { id:"d49_gas", name:"瓦斯桶", hot:[171,51,16,19], text:"粥店的兩個瓦斯桶。鐵鍊鎖在牆上。\n有一個是新換的，標籤還是白的。" },
        { id:"d49_box", name:"自取箱", hot:[37,57,17,14], text:"後門旁邊的藍色保冰箱。蓋子上用膠帶貼著：「暫停營業」。\n膠帶上，有人用奇異筆畫了一條魚。" } ] }
    ],
    home: [
      { id:"front", name:"公寓樓下", scene:"c49_front", opt:(ph) => ({ rain:!!ph }), details:[
        { id:"d49_plate", name:"門牌", hot:[86,52,12,8], text:"「澄東路 112 巷　6 號」\n藍底白字。右下角的螺絲，還是鬆的。" },
        { id:"d49_win4", name:"四樓的那一扇窗", hot:[46,18,18,10], text:"四樓，左邊數過來第二扇。你家。\n窗簾拉了一半。你出門的時候忘了拉。" },
        { id:"d49_gwin", name:"管理室的窗", hot:[91,60,20,12], text:"管理室對外的小窗。貼著：「管理員　07:00–19:00」。\n下面多貼了一張新的：「外送請按戶號，勿按管理室」。" } ] },
      { id:"office", name:"1F 大廳・管理室", scene:"c49_office", opt:(ph) => ({ usb:seenIt("cctv49_lobby") }), details:[
        { id:"d49_cam", name:"天花板上的監視器", hot:[72,4,11,10], text:"大廳的監視器。鏡頭對著大門、信箱和樓梯口。\n樓梯往上的那一段拍得到。往下的那一段，拍不到。" },
        { id:"d49_stairs1", name:"樓梯", hot:[2,14,22,62], text:"五層樓，沒有電梯。到四樓，六十四階。\n樓梯的扶手，被手摸得發亮。" },
        { id:"d49_cal", name:"管理室的月曆", hot:[83,27,18,14], text:"農會的月曆。今天的那一格，伍伯寫了兩個字：「主委」。\n旁邊畫了一個問號。" } ] },
      { id:"hall4", name:"4F 走廊", scene:"c49_hall4", opt:(ph) => ({ rain:!!ph }), details:[
        { id:"d49_plate41", name:"四樓之一的門牌", hot:[43,18,14,8], text:"「4-1」。\n門牌的螺絲上，有一點點鏽。\n全世界，只有這一扇門，掛著這一塊。" },
        { id:"d49_ext", name:"滅火器", hot:[94,49,12,24], text:"滅火器。檢查卡：「116.01.12　安泰」。\n壓力表的指針，在綠色的那一格。" },
        { id:"d49_win", name:"走廊的窗", hot:[171,19,20,32], text:"走廊盡頭的窗。往下看，是大門口的那一條巷子。\n一台外送的機車停在巷口，騎士在看手機。綠色的箱子。" } ] },
      { id:"living", name:"你家・客廳", scene:"c49_living", opt:(ph) => ({ rain:!!ph }), details:[
        { id:"d49_photo", name:"牆上的照片", hot:[51,25,16,18], text:"舅舅的照片。派出所的門口，笑得很開。\n玻璃擦得很乾淨。" },
        { id:"d49_chain", name:"門上的鏈條", hot:[2,30,16,20], text:"門上的鏈條。滑槽磨得很亮。\n每天晚上，你一進門就掛上。外送來的時候，你也沒有拿下來：門只開一條縫，手伸出去。" },
        { id:"d49_ceiling", name:"天花板", hot:[90,0,20,8], text:"天花板上，煙霧偵測器拿走了。留下兩個螺絲孔，和一圈比較白的油漆。\n新的那一個，還沒有裝。" } ] }
    ],
    noodle: [
      { id:"shop", name:"澄東牛肉麵", scene:"c49_noodle", opt:(ph) => ({ rain:true }), details:[
        { id:"d49_pot", name:"湯鍋", hot:[164,40,20,15], text:"一個大湯鍋，冒著白煙。老闆娘說，湯從早上五點熬到現在。\n「晚上十點以後，外送的單比內用多。」" },
        { id:"d49_dcam", name:"牆角的監視器", hot:[3,0,10,7], text:"牆角的監視器。老闆娘說，壞了一年了，「掛著嚇小偷的」。" } ] }
    ],
    court: [
      { id:"pd", name:"法院・公設辯護人室", scene:"c49_pd", opt:(ph) => ({}), details:[
        { id:"d49_robe", name:"衣架上的法袍", hot:[162,22,18,40], text:"黑色的法袍，綠色的邊。公設辯護人的。\n袖口的那一圈綠，洗得有一點白了。" },
        { id:"d49_board", name:"白板", hot:[22,16,32,24], text:"白板上，裴秀蓉的字：\n「22:14:52　→　22:15:40　＝　48 秒」\n下面一行，畫了兩條線：「18 分鐘」。" },
        { id:"d49_pwin", name:"窗戶", hot:[110,14,32,24], text:"窗外在下雨。法院的後面，囚車的入口。\n今天，那裡沒有車。" } ] }
    ]
  };
  EP49.phases[0].scene = "c49_table"; EP49.phases[0].sceneOpt = {};
  EP49.phases[1].scene = "c49_cafe"; EP49.phases[1].sceneOpt = { time:"noon", rain:true };

  /* ---------- 監視器動畫：大廳（伍伯的隨身碟） ---------- */
  const F = 98;
  EP49.looks = { shenV:strip(SHEN), shenS:Object.assign(strip(SHEN), { coat:undefined }), riderV:strip(RIDER), dogV:Object.assign({}, DOG),
    stuV:{ skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#4a6ac8", bottom:"#3a3a44" } };
  const mk = (scene, opt, cam, date, beats) => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join);
    return { scene, opt:Object.assign({}, opt, { ds, seq:beats.map(b => b.st || {}) }), cam, date, beats:beats.map(b => { const o = Object.assign({}, b); delete o.st; return o; }) }; };
  const ANIM = {
    cctv49_lobby: mk("c40_lcam", {}, "1F 大廳", "2027-03-19", [
      { t:"21:58:00", d:4, cap:"21:58，五樓的學生出門。", st:{ night:true }, m:{ stuV:[176, F, "stand", 1, 16, F] }, out:["stuV"] },
      { t:"22:12:30", d:5.5, cap:"22:12:30，大門「喀」地開了。一個外送員走進來，背著綠色的箱子。他沒有看信箱，直接走上樓梯。", st:{ night:true }, m:{ riderV:[16, F, "hold@box/#2a8a5a", -1, 176, F] }, out:["riderV"] },
      { t:"22:16:05", d:5.5, cap:"22:16:05，同一個外送員下樓，一邊走一邊看手機。走出大門。三分三十五秒。", st:{ night:true }, m:{ riderV:[176, F, "phone", 1, 16, F] }, out:["riderV"] },
      { t:"22:51:40", d:5, cap:"22:51:40，你從樓梯走下來。外套拿在手上。", st:{ night:true }, m:{ shenS:[176, F, "hold@coat/#3a4250", 1, 16, F] }, out:["shenS"] }
    ])
  };
  [...EP49.cctv, ...EP49.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 重現（結案的時候） ---------- */
  const mkR = beats => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join); const seq = beats.map(b => b.st || {});
    return beats.map(b => { const o = Object.assign({}, b, { opt:Object.assign({}, b.opt || {}, { ds, seq }) }); delete o.st; return o; }); };
  const RB = mkR([
    { t:"3/19 22:05", d:5.5, cap:"3 月 19 日，22:05。你洗澡以前，用手機叫了一碗牛肉麵。電視開得很大聲。", scene:"c38_living", opt:{ night:true, clean:true, off:true }, m:{ shenS:[92, 94, "phone", 1, 92, 94] } },
    { t:"22:12:30", d:5.5, cap:"22:12:30。對講機按了第二次，你才去開。外送員走進大廳。沒有電梯。", scene:"c40_lcam", opt:{ night:true }, m:{ riderV:[16, F, "hold@box/#2a8a5a", -1, 176, F] } },
    { t:"22:14:52", d:6, cap:"22:14:52。四樓。門開一條縫，鏈條掛著。一隻手伸出來。「辛苦了。」他照平台的規定，按下快門。", scene:"c38_hall4", opt:{}, m:{ riderV:[76, F, "phone", -1, 76, F] } },
    { t:"22:15:40", d:5, cap:"48 秒以後。港濱路口，轉角的計程車裡，紀錄器錄到「砰」的一聲。只有一下。", scene:"c36_lot", opt:{ pre:true, pushed:true, door:true, rain:true }, st:{ flash:true }, m:{} },
    { t:"22:16:05", d:5, cap:"22:16:05。外送員走出大廳，一邊看手機。你在四樓，打開那一碗麵。", scene:"c40_lcam", opt:{ night:true }, m:{ riderV:[176, F, "phone", 1, 16, F] } },
    { t:"22:51:40", d:5, cap:"22:51:40。小吳打電話來。你下樓。你的車，一整晚都在地下室。", scene:"c40_lcam", opt:{ night:true }, m:{ shenS:[176, F, "hold@coat/#3a4250", 1, 16, F] } },
    { t:"4 月 26 日", d:5.5, cap:"五個禮拜以後。一台計程車的記憶卡，一張存在伺服器裡的照片。要先知道是哪一秒、哪一扇門，才找得到。", scene:"c49_table", opt:{ wave:true, paper:true, app:true }, m:{} }
  ]);

  /* ---------- 結案（結局固定） ---------- */
  const pickR = () => { try { return (S.result && S.result.pick && S.result.pick.reasoning) || {}; } catch (e) { return {}; } };
  const missing = () => { try { const pk = pickR(); return EP49.reasoning.filter((r, i) => (!r.kinds) && pk[i] !== r.answer).length; } catch (e) { return 0; } };
  const arcSet = (f, how) => { try { if (typeof S !== "undefined" && S && S.done && inCase() && typeof ARC !== "undefined" && !ARC.has(f)) ARC.set(f, "seconds", how || "told"); } catch (e) {} };
  const flags = (good) => { arcSet("alibi_proven", good && !missing() ? "found" : "told"); arcSet("xu_back", "found"); };
  const tail = () => "\n方以誠把三樣東西收進卷宗，扣上公事包。\n「起訴書裡，還有一句話。」他說。「卡，是你拿給黃金水的。上面的人，是你。」\n「那一句，我還在等人回答。」\n他走出去。門沒有關。\n許知夏把資料夾闔起來。她沒有說話，只是把烏龍茶的空杯子，捏扁了。";
  EP49.court = {
    title: "公設辯護人室・4 月 27 日 17:30", scene: "c49_pd", opt:{},
    detective: Object.assign({}, SHEN),
    who: ph => ["fang", "xu"],
    open: ph => "17:30。裴秀蓉坐在桌子後面，鉛筆在指間轉。\n方以誠站著。許知夏也站著。\n「沈岳。」方以誠說。「3 月 19 日，22:15。你說你在家。」\n「這一次，我要聽你說到秒。」",
    kindLine: {
      lot: "那一刻，我在林記釣具的後門。",
      road: "那一刻，我在開車去港濱路的路上。",
      home: "那一刻，我在家門口。接一碗牛肉麵。",
      garage: "那一刻，我在公寓的地下室，正要從車道出去。"
    },
    kindTrue: "（方以誠的筆，停了一下。）\n「家門口。」他說。\n「一樣一樣來。先說那一聲。」",
    murmur: [ "（裴秀蓉的鉛筆，在筆記本上點了一下。）", "（許知夏的手指，在資料夾的邊上敲。一下，一下。）", "（窗外的雨，打在冷氣的鐵殼上。）" ],
    confess: {}, cornered: {}, deny: {},
    replayText: "許知夏把筆記本攤開。一條線，從 22:00 畫到 22:30——",
    replay: { scene:"c38_living", opt:{ night:true }, clean:true, cam:"經過重現", date:"2027-03-19", beats:RB },
    get endGood(){ const ms = missing(); flags(true);
      return "方以誠聽完，沒有馬上說話。\n他把送達照和紀錄器的時間，並排放在桌上。22:14:52。22:15:40。\n「48 秒。」他說。「十八分鐘的路。」\n「開槍的，不是你。」\n「這一句，我會寫進去。今天晚上就寫。」\n裴秀蓉的鉛筆，停住了。她把那一頁撕下來，摺好，放進你的手裡。"
        + (ms ? "\n（你沒有講清楚的那幾樣，是許知夏一張一張翻給他看的。）" : "\n（許知夏一張紙都沒有翻。她只是站著。）")
        + tail(); },
    get endBad(){ const k = (typeof S !== "undefined" && S && S.result && S.result.pick && S.result.pick.kind) || ""; flags(false);
      return (k === "lot" ? "方以誠搖頭。「22:14:52，你在四樓開門。48 秒以後，你在港濱路？」"
          : k === "road" ? "方以誠搖頭。「你的車，那一整晚都沒有動。」"
          : k === "garage" ? "方以誠搖頭。「地下室走出去的，是二樓的先生和兒子。」"
          : "方以誠搖頭。")
        + "\n許知夏把送達照放在桌子的中間。門牌 4-1。門縫裡，一個銅的打火機。\n「22:14:52。」她說。「他在家門口。48 秒以後，那一聲。」\n方以誠看了很久。「開槍的，不是他。」他說。「這一句，我會寫進去。」"
        + tail()
        + "\n（這一次，最後的那一段，是許知夏替你說完的。）"; }
  };

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP49.fac = { home:["#cfc6b4", "#5a5e66"], noodle:["#e8dcc4", "#8a2a1e"], court:["#d6d2c6", "#3a3228"] };
  EP49.setting = { cafe:"city", harbor:"harbour", home:"town", noodle:"town", court:"city" };
  EP49.car = "#7a8a6a";
  EP49.outScenes = ["c49_cafe", "c49_table", "c49_hfront", "c49_lot", "c49_front"];
  const SKY49 = [ ["#9cc4e0", "#e4ecf0", "#7a7a76", "#6a6a66", 0, 0], ["#7a8894", "#b8c0c8", "#6a6a66", "#5e5e5a", 1, 0] ];
  EP49.worldSky = ph => SKY49[Math.min(ph || 0, SKY49.length - 1)];
  EP49.worldOrder = { cafe:["seat", "table"], harbor:["hfront", "hlot"], home:["front", "office", "hall4", "living"], noodle:["shop"], court:["pd"] };
  EP49.roomDesc = {
    seat:"海風咖啡外面的座位。街對面是警局。", table:"最外面那一桌。工具箱、筆電、筆記本。",
    hfront:"港濱路口。林記釣具和阿娥粥店的前面。", hlot:"店後面的停車場。林記的後門。", front:"公寓樓下。",
    office:"一樓的大廳和管理室。", hall4:"四樓的走廊。你家，和對面。", living:"你家的客廳。",
    shop:"澄東牛肉麵。下午，沒有客人。", pd:"公設辯護人室。書架、白板、一張桌子。"
  };
  const rx = (i, x) => 116 + i * 198 + x;
  const say = (who, text, name) => ({ say:[who, text], name });
  EP49.world = {};
  EP49.locations.forEach(l => { EP49.world[l.id] = { auto:true, you:SHEN, order:(EP49.worldOrder || {})[l.id] }; });
  Object.assign(EP49.world.cafe, { spawn:rx(0, 80),
    intro: [
      { set:{ px:rx(0, 80), face:-1 } },
      say("you", "（最外面那一張桌子。工具箱，筆記本，一杯烏龍茶。）", "你")
    ],
    extras: [
      { id:"x49_abin", name:"阿彬", x:rx(0, 30), L:{ skin:"#e0b890", hair:"#1a1a1a", hairStyle:"short", top:"#f4f4f0", apron:"#2a7a8a", bottom:"#3a3a44", hat:"cap", capColor:"#2a5a6a" }, pose:"stand", facing:1,
        lines:["（他端著托盤，經過你的桌子。）", "烏龍茶。我們店現在有了。", "許小姐，要不要吃滷蛋？我媽滷了一大鍋。", "……沈大哥，加油。"] },
      { id:"x49_su", name:"蘇律師", x:rx(0, 158), until:0, L:{ skin:"#e8c09a", hair:"#8a8a88", hairStyle:"short", top:"#f4f4f0", coat:"#3a3a44", bottom:"#3a3a44", glasses:true }, pose:"read", facing:-1,
        lines:["（他翻了一頁報紙。）", "沈先生，早。", "許小姐回來了。……天氣還是不太好。"] }
    ] });
  Object.assign(EP49.world.harbor, { spawn:rx(0, 40),
    labels: [ { room:"hfront", x:151, y:37, text:"21", size:4, color:"#2a4a9a", bold:true, align:"center" } ],
    extras: [
      { id:"x49_dog", name:"豆花", x:rx(1, 70), L:Object.assign({}, DOG), pose:"sit", facing:-1,
        lines:["（豆花坐在後門的前面，一直聞門檻。）", "（牠聞了很久，然後趴下來，下巴放在前腳上。）"] }
    ] });
  Object.assign(EP49.world.home, { spawn:rx(0, 30) });
  Object.assign(EP49.world.noodle, { spawn:rx(0, 30),
    labels: [ { room:"shop", x:58, y:7, text:"澄東牛肉麵", size:5, color:"#f4e0a0", bold:true, align:"center" } ],
    extras: [
      { id:"x49_boss", name:"老闆娘", x:rx(0, 140), L:{ gender:"f", skin:"#e8c09a", hair:"#3a2a22", hairStyle:"bun", top:"#f4f0e8", apron:"#8a2a1e", bottom:"#3a3a44" }, pose:"stand", facing:-1,
        lines:["（她在擦桌子。）", "下午沒客人。坐。", "小尤喔？他很乖。下雨天也跑。", "晚上十點以後，外送的單，比內用的多。"] }
    ] });
  Object.assign(EP49.world.court, { spawn:rx(0, 30),
    extras: [
      { id:"x49_pei", name:"裴秀蓉", x:rx(0, 128), L:{ gender:"f", skin:"#e8c8a8", hair:"#4a4440", hairStyle:"bob", glasses:true, top:"#f4f0e8", coat:"#8a8478", bottom:"#3a3a44" }, pose:"sit", facing:-1,
        lines:["（她的鉛筆在指間轉。）", "我在記。你們講。", "48 秒。我在白板上寫了。", "他會發函，是因為你們給他一個查得到的東西。這種事，十七年，我第一次看到。"] }
    ] });
  EP49.mapPos = { cafe:[120,62,"u"], home:[46,40,"u"], noodle:[72,24,"u"], harbor:[150,100,"d"], court:[186,40,"u"] };
  EP49.mapRoads = [["cafe","home"],["cafe","harbor"],["cafe","court"],["home","noodle"],["home","harbor"]];
  EP49.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 6; x < 170; x += 8) for (let y = 8; y < 88; y += 7){ if ((x * 3 + y) % 5 === 0) continue; R(x, y, 6, 5, "#c8c0b0"); }
    const rd = "#d8d4c8";
    R(0, 66, 240, 5, rd); R(118, 20, 5, 50, rd); R(44, 16, 5, 52, rd); R(44, 16, 30, 4, rd); R(118, 36, 70, 4, rd); R(148, 66, 5, 30, rd);
    for (let x = 4; x < 240; x += 12) R(x, 68, 6, 1, "#f4f0e0");
    R(0, 108, 240, 27, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 112 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");
    R(110, 56, 22, 8, "#e8dcc4"); R(110, 56, 22, 2, "#2a7a8a"); R(134, 52, 14, 12, "#d8dce0"); R(134, 52, 14, 2, "#2a4a7a");   // 海風咖啡、警局
    R(36, 30, 18, 10, "#cfc6b4"); R(36, 30, 18, 2, "#5a5e66");   // 公寓
    R(66, 12, 14, 8, "#e8dcc4"); R(66, 12, 14, 2, "#8a2a1e");   // 麵店
    R(140, 92, 24, 10, "#c8b8a0"); R(140, 92, 24, 2, "#c83a2a");   // 港濱路口
    R(176, 26, 22, 12, "#d6d2c6"); R(176, 26, 22, 2, "#3a3228");   // 法院
  };
})();
