/* =========================================================
   劇情畫面（幕間、事件、揭開真相）的俯視版
   TOPSCENE.draw(canvas, 場景名, opt) → true＝已經用俯視畫好（drawScenes 就不再畫舊的側面場景）
   ・只在這一集的地點已經是俯視版時才用（C.world 裡有 top），其他集照舊。
   ・場景來源：
     1. 這裡自己畫的場景：cafe（海風咖啡）、train（高鐵車廂）、noodle（阿月姨麵攤）、road（回程車上）、roof（頂樓抽菸區）、interrog（偵訊室）
     2. 這一集地點裡的房間：EP.rooms 裡 scene 名稱相同的那一間（例如 s8_final → 謎境的最後一個房間）
   ・人：opt.cast（{ id, x(舊畫面 0～192), pose, facing, L, mark, talking }）；坐的人坐到有畫椅子的座位，站的人排在房間裡空著的那一排。
   ========================================================= */
const TOPSCENE = (() => {
  const VW = 288, VH = 162;
  const T = typeof TK !== "undefined" ? TK : null, O = T ? T.O : "#1a1410", sh = (c, k) => PX.prim.shade(c, k);
  const POSE = { stand:"idle", "stand+cup":"hold", "stand+phone":"phone", "stand+cry":"cry", phone:"phone", kneel:"kneel", cross:"cross", point:"point", cry:"cry", smoke:"smoke", read:"read", write:"write", type:"type", drink:"drink", talk:"talk", hold:"hold", look:"look", crouch:"crouch", clasp:"clasp", sweep:"sweep", wipe:"wipe", text:"text" };
  const SIT = { "sit+drink":"sitDrink", "sit+cry":"sitCry", "sit+phone":"sitText", "sit+text":"sitText", "sit+pour":"sitPour" };
  const isTop = () => { try { return typeof C !== "undefined" && C && C.world && Object.values(C.world).some(w => w && w.top); } catch (e){ return false; } };

  /* ---------- 自己畫的場景 ---------- */
  const STAGES = {};
  const tone = (g, w, h, col, a) => { g.save(); g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, w, h); g.restore(); };
  const rainFx = (p, w, h, t, y0, skip) => { for (let i = 0; i < 90; i++){ const x = (i * 53 + Math.floor(t * 30) * 2) % w, y = y0 + (i * 37 + Math.floor(t * 110)) % (h - y0); if (!skip || !skip(x, y)) p.R(x, y, 1, 3, "#9ab0c8"); } };

  // 海風咖啡：店面在上面，騎樓三張圓桌，前面是馬路（對面就是分局，在你背後）
  STAGES.cafe = (o) => {
    const tm = ["morning", "noon", "dusk", "night"].includes(o.time) ? o.time : "noon", rain = !!o.rain, night = tm === "night", ep = o.ep || 0;
    const TB = [92, 168, 244];
    const room = { w:320, h:162, wall:58,
      floor(p, g, t){
        // 店面（左）：米色牆、招牌、雨棚（掛在窗和門上面）、大窗（吧台、吊燈、咖啡機）、門
        p.R(0, 0, 160, 58, night ? "#4a4036" : "#e8dcc4"); p.R(0, 0, 160, 2, sh(night ? "#4a4036" : "#e8dcc4", .1));
        p.R(10, 1, 60, 11, O); p.R(11, 2, 58, 9, "#2a5a6a"); p.R(14, 3, 6, 6, "#f4f0e0"); p.R(20, 4, 2, 3, "#f4f0e0"); p.R(15, 3, 4, 1, "#a87a50");
        for (let x = 24; x < 34; x++) p.R(x, 5 + ((x >> 1) % 2), 1, 1, "#8ad0d8");
        const F = { C:["111","100","100","100","111"], A:["010","101","111","101","101"], F:["111","100","110","100","100"], E:["111","100","110","100","111"] };
        "CAFE".split("").forEach((ch, i) => F[ch].forEach((row, y) => row.split("").forEach((b, x) => { if (b === "1") p.R(38 + i * 7 + x * 2, 2 + y * 2 - (y > 3 ? 1 : 0), 2, 1 + (y < 4 ? 1 : 0), "#f4f0e0"); })));
        const win = night ? "#e8b860" : tm === "dusk" ? "#e8c080" : "#9cc5e6";
        p.R(8, 27, 64, 29, O); p.R(9, 28, 62, 27, win); p.R(40, 28, 1, 27, "#6a5a44");
        p.R(9, 45, 62, 10, night ? "#8a5a30" : "#a87a50"); p.R(9, 44, 62, 1, "#6a4a32"); p.R(16, 38, 10, 7, "#5a5a5e"); p.R(18, 35, 6, 3, "#8a8a8e"); p.R(52, 41, 4, 4, "#f4f4f0");
        for (const x of [22, 56]){ p.R(x, 28, 1, 4, "#3a3028"); p.R(x - 3, 32, 7, 3, "#ffd98a"); }
        p.R(86, 26, 30, 32, O); p.R(87, 27, 28, 31, "#6a4a32"); p.R(91, 30, 20, 12, win); p.R(90, 44, 22, 5, "#f4f0e0"); p.R(93, 46, 16, 1, "#2a7a8a"); p.R(110, 50, 2, 3, "#e8c040");
        // 花箱
        p.R(6, 54, 68, 4, "#7a4a2a"); for (let x = 8; x < 72; x += 5){ p.R(x, 51, 4, 3, "#4a8a3a"); p.R(x + 1, 50, 2, 2, ["#e85a6a", "#f4d04a", "#f4f0f0"][(x / 5 | 0) % 3]); }
        // 雨棚（藍白條紋，下緣一排波浪；下雨時拉長）
        const ab = rain ? 28 : 24; for (let x = 0; x < 150; x += 10){ p.R(x, 13, 10, ab - 13, (x / 10) % 2 ? "#f4f0e0" : "#2a7a8a"); p.R(x + 2, ab, 6, 2, (x / 10) % 2 ? "#f4f0e0" : "#2a7a8a"); } p.R(0, 13, 150, 1, "#1a4a5a"); p.R(0, ab - 1, 150, 1, "rgba(0,0,0,.2)");
        if (tm === "dusk" || night) for (let x = 4; x < 150; x += 8){ p.R(x, ab + 2, 1, 2, "#3a3028"); p.R(x, ab + 4, 2, 2, ["#ffd98a", "#ffb86a", "#fff0b0"][(x / 8 | 0) % 3]); }
        // 隔壁（右）：灰色的店面、拉下一半的鐵捲門
        p.R(160, 0, 160, 58, night ? "#2a2e36" : "#c8ccd0"); p.R(160, 0, 2, 58, O); p.R(176, 8, 70, 10, night ? "#3a3e46" : "#8a8e94"); p.R(180, 10, 62, 6, night ? "#5a5e66" : "#e8ecf0");
        p.R(176, 22, 70, 36, "#8a8e94"); for (let y = 22; y < 40; y += 3) p.R(176, y, 70, 1, "#6a6e74"); p.R(176, 40, 70, 18, "#1e2226");
        p.R(262, 18, 44, 30, O); p.R(263, 19, 42, 28, night ? "#e8c870" : "#a8c0d0"); p.R(284, 19, 1, 28, "#6a6e74");
        // 騎樓地磚
        const a = night ? (rain ? "#3a3c40" : "#5a5048") : rain ? "#8a8a86" : tm === "dusk" ? "#b8a088" : "#c8b8a0";
        T.tiles(p, 0, 58, 320, 72, a, sh(a, -.06), 16);
        if (rain) for (let k = 0; k < 6; k++) p.R(20 + (k * 53) % 280, 90 + (k * 17) % 34, 16, 2, "rgba(90,110,130,.35)");
        // 騎樓柱子＋馬路
        p.R(0, 128, 320, 4, "#8a8a86"); p.R(0, 128, 320, 1, O);
        p.R(0, 132, 320, 30, night ? "#26282c" : "#5a5a5c"); for (let x = 8; x < 320; x += 30) p.R(x, 148, 14, 2, "#e8e0a0");
        if (rain) for (let k = 0; k < 8; k++) p.R((k * 47) % 300, 136 + (k * 7) % 20, 18, 1, "#6a7a8a");
      },
      props:[
        // 小黑板菜單、盆栽
        { y:84, draw(p){ p.R(124, 70, 14, 14, O); p.R(125, 71, 12, 12, "#2a3a2e"); for (let k = 0; k < 4; k++) p.R(127, 73 + k * 3, 8 - (k % 2) * 3, 1, "#e8e8e0"); p.R(126, 84, 2, 4, O); p.R(134, 84, 2, 4, O); } },
        { y:84, draw(p){ T.plant(p, 304, 84, true); } },
        // 三張圓桌＋兩邊的椅子（側坐的椅子，椅背朝外）
        ...TB.map(x => ({ y:106, draw(p){ const ch = night ? "#8a8a90" : "#3a3a3e";
          T.chair(p, x - 20, 106, ch, "right"); T.chair(p, x + 20, 106, ch, "left");
          p.R(x - 12, 90, 24, 14, O); p.R(x - 11, 91, 22, 12, "#e8e8e4"); p.R(x - 11, 91, 22, 2, "#f8f8f4"); p.R(x - 1, 104, 2, 6, "#5a5a5e"); p.R(x - 5, 109, 10, 2, "#5a5a5e");
          p.R(x - 7, 93, 5, 5, O); p.R(x - 6, 94, 3, 3, "#f4f4f0"); p.R(x - 6, 94, 3, 1, "#8a5a30"); p.R(x + 2, 95, 6, 4, "#f4f4f0"); } })),
        // 停在路邊的腳踏車（下雨就沒有）
        { y:146, draw(p){ if (rain) return; const wheel = (x, y) => { p.R(x + 2, y, 6, 1, O); p.R(x + 2, y + 9, 6, 1, O); p.R(x, y + 2, 1, 6, O); p.R(x + 9, y + 2, 1, 6, O); p.R(x + 1, y + 1, 1, 1, O); p.R(x + 8, y + 1, 1, 1, O); p.R(x + 1, y + 8, 1, 1, O); p.R(x + 8, y + 8, 1, 1, O); p.R(x + 4, y + 4, 2, 2, "#8a8e94"); };
            wheel(30, 136); wheel(50, 136); p.R(35, 140, 10, 1, "#c84a3a"); p.R(44, 134, 1, 7, "#c84a3a"); p.R(40, 135, 10, 1, "#c84a3a"); p.R(55, 132, 1, 9, "#2a2a2e"); p.R(52, 131, 6, 1, "#2a2a2e"); p.R(41, 133, 6, 2, "#3a3a3e"); } },
        // 第 15 集起：鑑識犬豆花趴在中間那張桌腳、阿彬的機車停在路邊
        { y:118, draw(p){ if (ep < 15) return; const dx = 176; p.R(dx, 112, 16, 6, O); p.R(dx + 1, 113, 14, 4, "#f0dcb0"); p.R(dx + 14, 110, 7, 6, O); p.R(dx + 15, 111, 5, 4, "#f0dcb0"); p.R(dx + 18, 112, 1, 1, O); p.R(dx + 15, 110, 2, 2, "#d8c090"); } },
        { y:150, draw(p){ if (ep < 15) return; const mx = 250; p.R(mx, 138, 30, 10, O); p.R(mx + 1, 139, 28, 8, "#c83a2a"); p.R(mx + 4, 136, 8, 3, "#8a6a4a"); p.R(mx + 24, 135, 3, 5, "#3a3a3e"); p.R(mx + 2, 147, 6, 3, "#1e1e22"); p.R(mx + 22, 147, 6, 3, "#1e1e22"); } }
      ],
      front(p, g, t){
        if (night){ tone(g, 320, 162, "#0a0c1e", .38); T.glow(g, 40, 40, 70, "255,210,140", .22); T.glow(g, 160, 100, 120, "255,220,160", .08); }
        else if (tm === "dusk") tone(g, 320, 162, "#d8783a", .12);
        else if (tm === "morning") tone(g, 320, 162, "#fff0d0", .05);
        if (rain){ tone(g, 320, 162, "#2a3440", .12); rainFx(p, 320, 162, t, 0, (x, y) => x < 150 && y > 12 && y < 70); p.R(0, 58, 150, 10, "rgba(0,0,0,.08)"); }
      } };
    // 舊畫面的椅子在 34、66、88、120、142、174（三張桌子左右兩邊）
    const OLD = [34, 66, 88, 120, 142, 174], SEATS = TB.flatMap(x => [[x - 20, 106, 1], [x + 20, 106, -1]]);
    return { room, row:[30, 290, 84], seatOf:(c) => { let k = 0; OLD.forEach((x, i) => { if (Math.abs(x - c.x) < Math.abs(OLD[k] - c.x)) k = i; }); return SEATS[k]; },
      extra(p, g, t, ppl){ if (!o.bag) return; const q = ppl.find(m => m.id === o.bag); if (!q) return; const x = Math.round(q.x + (q.face > 0 ? -14 : 8)), y = Math.round(q.y);
        p.R(x, y - 18, 10, 18, O); p.R(x + 1, y - 17, 8, 16, "#2a4a8a"); p.R(x + 1, y - 17, 8, 2, "#3a5aa8"); p.R(x + 3, y - 22, 4, 5, O); p.R(x + 4, y - 21, 2, 3, "#8a8e94"); p.R(x + 1, y - 1, 2, 2, O); p.R(x + 7, y - 1, 2, 2, O); } };
  };

  // 高鐵車廂：上面一排窗（窗外的景色往後跑），兩排座位都朝右（行進方向）
  STAGES.train = (o) => { const night = o.time === "night";
    const COLS = [44, 96, 148, 200, 252];
    const room = { w:300, h:150, wall:44,
      floor(p, g, t){
        p.R(0, 0, 300, 44, "#d8d4cc"); p.R(0, 0, 300, 4, "#bcb8b0");
        for (let k = 0; k < 5; k++){ const wx = 14 + k * 56; p.R(wx - 1, 9, 42, 26, O); p.R(wx, 10, 40, 24, night ? "#0e1424" : "#9cc8e8");
          if (!night){ p.R(wx, 24, 40, 10, "#7aa860"); for (let i = 0; i < 3; i++){ const hx = wx + ((i * 17 - Math.floor(t * 60)) % 40 + 40) % 40; p.R(hx, 20, 5, 4, "#5a7a4a"); } }
          else for (let i = 0; i < 3; i++){ const lx = wx + ((i * 19 - Math.floor(t * 50)) % 40 + 40) % 40; p.R(lx, 26 + i * 2, 1, 1, "#e8c870"); } }
        p.R(0, 38, 300, 6, "#a8a49c"); p.R(0, 43, 300, 1, O);
        T.carpet(p, 0, 44, 300, 106, "#5a6a7a"); p.R(0, 88, 300, 22, "#6a6a72"); p.R(0, 88, 300, 1, "#4a4a52"); p.R(0, 109, 300, 1, "#4a4a52");   // 走道
        p.R(0, 146, 300, 4, "#a8a49c"); p.R(0, 145, 300, 1, O);
      },
      props:[
        ...[62, 82, 126, 142].map(y => ({ y, draw(p){ COLS.forEach(x => { p.R(x - 9, y - 22, 6, 22, O); p.R(x - 8, y - 21, 4, 20, "#2a4a8a"); p.R(x - 8, y - 21, 4, 3, "#f4f4f0"); p.R(x - 7, y - 10, 14, 10, O); p.R(x - 6, y - 9, 12, 8, "#3a5aa8"); p.R(x - 6, y - 9, 12, 1, "#5a7ac8"); }); } }))
      ],
      front(p, g, t){ if (night) tone(g, 300, 150, "#0a0c1e", .25); } };
    return { room, row:[30, 270, 100], seats:[[148, 62, 1], [148, 82, 1], [200, 62, 1], [200, 82, 1], [96, 126, 1], [96, 142, 1]], order:true };
  };

  // 阿月姨麵攤：深夜的路邊，左邊是攤車，右邊一張紅色折疊桌、藍色塑膠椅
  STAGES.noodle = (o) => { const rain = !!o.rain;
    const room = { w:288, h:150, wall:50,
      floor(p, g, t){
        // 後面：拉下來的鐵捲門、一盞路燈
        p.R(0, 0, 288, 50, "#20242e"); for (let k = 0; k < 4; k++){ p.R(8 + k * 72, 6, 64, 42, "#3a3e46"); for (let y = 6; y < 48; y += 3) p.R(8 + k * 72, y, 64, 1, "#2e323a"); }
        p.R(150, 8, 30, 10, "#8a2a1a"); p.R(152, 10, 26, 6, "#e9c45a");
        p.R(0, 48, 288, 2, O);
        // 地上：柏油、騎樓邊
        p.R(0, 50, 288, 100, rain ? "#2a2e36" : "#3a3a3e"); p.seed(8); for (let k = 0; k < 300; k++) p.R(p.rnd() * 288, 50 + p.rnd() * 100, 1, 1, "#46464c");
        if (rain) for (let k = 0; k < 7; k++) p.R((k * 41) % 260 + 4, 80 + (k * 13) % 60, 16, 1, "#5a6a80");
      },
      props:[
        // 攤車（鍋子冒著蒸氣，一顆燈泡）
        { y:96, draw(p, g, t){ T.box(p, 18, 56, 80, 16, 24, "#c8ccd0", "#8a8e94"); p.R(22, 74, 72, 18, "#a8acb0"); p.R(30, 78, 30, 8, "#c83a2a"); p.R(32, 80, 26, 4, "#f4f0e0");
            for (const x of [30, 62]){ p.R(x, 56, 22, 12, O); p.R(x + 1, 57, 20, 10, "#5a5e64"); p.R(x + 3, 58, 16, 6, "#e8dcc0"); }
            for (let k = 0; k < 4; k++) p.R(36 + k * 9, 50 - ((t * 10 + k * 4) % 10), 2, 3, "rgba(230,230,240,.5)");
            p.R(56, 30, 2, 26, "#5a5e64"); p.R(52, 28, 10, 4, "#ffd98a"); } },
        // 紅色折疊桌＋藍色塑膠椅
        { y:120, draw(p){ for (const y of [104, 120]) T.chair(p, 150, y, "#3a6ac8", "right"); T.chair(p, 198, 112, "#3a6ac8", "left");
            p.R(160, 96, 30, 22, O); p.R(161, 97, 28, 20, "#d84a3a"); p.R(161, 97, 28, 2, "#e86a5a"); for (const [x, y] of [[166, 100], [178, 106]]){ p.R(x, y, 7, 6, O); p.R(x + 1, y + 1, 5, 4, "#f4f4f0"); p.R(x + 2, y + 2, 3, 2, "#c8a050"); } } }
      ],
      front(p, g, t){ tone(g, 288, 150, "#0a0c1e", .32); T.glow(g, 57, 34, 60, "255,210,140", .3); if (rain){ rainFx(p, 288, 150, t, 0); } } };
    return { room, row:[30, 260, 92], seats:[[150, 104, 1], [150, 120, 1], [198, 112, -1]], order:true, standAt:{ ayue:[58, 58, 1] } };
  };

  // 頂樓抽菸區：矮牆外面是城市，水塔、冷氣室外機、一個立式菸灰缸
  STAGES.roof = (o) => {
    const room = { w:288, h:150, wall:52,
      floor(p, g, t){
        const SK = (typeof C !== "undefined" && C.worldSky) ? C.worldSky(o.phase || 0) : ["#8ab0d0", "#e0e8ee"];
        p.R(0, 0, 288, 34, SK[1]); p.R(0, 0, 288, 12, SK[0]);
        for (let i = 0; i < 288; i += 14){ const h = 10 + (i * 7) % 18; p.R(i, 34 - h, 12, h, "#8a94a0"); for (let j = 0; j < h - 4; j += 5) p.R(i + 3, 36 - h + j, 2, 2, "#c8d0d8"); }
        p.R(0, 34, 288, 18, "#a8a49c"); p.R(0, 34, 288, 3, "#c8c4bc"); p.R(0, 51, 288, 1, O);   // 矮牆
        T.tiles(p, 0, 52, 288, 98, "#9a968e", "#928e86", 20);
        p.seed(3); for (let k = 0; k < 12; k++) p.R(p.rnd() * 288, 60 + p.rnd() * 80, 2, 1, "#f4f0e0");   // 菸蒂
      },
      props:[
        { y:96, draw(p){ T.box(p, 216, 40, 52, 18, 38, "#c8ccd0", "#a8acb0"); p.R(220, 46, 44, 4, "#8a8e94"); } },
        { y:84, draw(p){ for (const x of [20, 56]){ T.box(p, x, 56, 30, 10, 18, "#c8ccd0", "#a8acb0"); p.R(x + 4, 68, 22, 3, "#8a8e94"); p.R(x + 4, 73, 22, 3, "#8a8e94"); } } },
        { y:110, draw(p){ p.R(140, 92, 10, 18, O); p.R(141, 93, 8, 16, "#5a5e64"); p.R(140, 90, 10, 4, "#8a8e94"); } },
        { y:136, draw(p){ T.box(p, 170, 120, 50, 6, 8, "#7a5a3a", "#5a3a22"); } }
      ],
      front(p, g, t){ } };
    return { room, row:[60, 230, 108] };
  };

  // 偵訊室：一張桌子、兩邊的椅子、一面單面鏡
  STAGES.interrog = (o) => {
    const room = { w:240, h:150, wall:60,
      floor(p, g, t){
        T.backWall(p, 0, 240, 60, "#c8ccc4", "plain", { base:"#5a6a6a" });
        p.R(70, 10, 100, 36, O); p.R(71, 11, 98, 34, "#2a323a"); p.R(73, 13, 30, 3, "rgba(255,255,255,.12)");
        p.R(196, 12, 14, 10, O); p.R(197, 13, 12, 8, "#2a2a2e"); p.R(205, 14, 2, 2, "#e84a3a");
        T.tiles(p, 0, 60, 240, 90, "#a8aca8", "#a0a4a0", 20);
        T.sides(p, this, "#4a5a5a", []);
      },
      props:[
        { y:112, draw(p){ T.chair(p, 92, 112, "#3a3a3e", "right"); T.chair(p, 150, 112, "#3a3a3e", "left"); p.R(100, 88, 42, 22, O); p.R(101, 89, 40, 20, "#8a8e94"); p.R(101, 89, 40, 2, "#a8acb0"); p.R(108, 94, 12, 8, "#f4f4f0"); p.R(128, 96, 6, 6, "#e8e4d8"); } }
      ],
      front(p, g, t){ T.glow(g, 120, 80, 70, "235,245,255", .08); } };
    return { room, row:[30, 210, 128], seats:[[92, 112, 1], [150, 112, -1]] };
  };

  // 回程車上：從後座往前看（擋風玻璃外面是夜晚的山路，車頭燈照著）
  STAGES.road = (o) => {
    const room = { w:288, h:162, wall:0,
      floor(p, g, t){
        p.R(0, 0, 288, 162, "#0d1220");
        // 擋風玻璃：山的影子、路、車頭燈
        p.R(20, 10, 248, 70, "#16203a"); p.R(20, 40, 248, 20, "#1d2a24");
        g.save(); g.fillStyle = "rgba(255,240,190,.22)"; g.beginPath(); g.moveTo(80, 80); g.lineTo(130, 46); g.lineTo(158, 46); g.lineTo(208, 80); g.fill(); g.restore();
        p.R(20, 56, 248, 24, "#2a2a26"); for (let k = 0; k < 4; k++){ const y = 58 + ((k * 6 + Math.floor(t * 30)) % 22); p.R(142, y, 4, 2 + Math.floor((y - 56) / 8), "#c9c9a0"); }
        for (let k = 0; k < 3; k++){ const x = 30 + ((k * 90 + Math.floor(t * 20)) % 240); p.R(x, 44, 2, 12, "#3a4a3a"); p.R(x - 4, 40, 10, 6, "#2a3a2a"); }
        p.R(16, 6, 256, 4, "#2a2a30"); p.R(16, 6, 4, 80, "#2a2a30"); p.R(268, 6, 4, 80, "#2a2a30"); p.R(140, 10, 8, 6, "#3a3a40");   // 車頂、A 柱、後照鏡
        // 儀表板
        p.R(0, 80, 288, 20, "#1e1e24"); p.R(0, 80, 288, 2, "#2e2e36"); p.R(54, 84, 30, 10, "#0e1018"); p.R(58, 86, 8, 6, "#3ac8e8"); p.R(70, 86, 8, 6, "#e8963a");
        p.R(132, 86, 24, 8, "#0e1018"); p.R(136, 88, 16, 4, "#3a6ad8");
        // 方向盤（左邊，駕駛座）
        p.R(52, 92, 36, 6, O); p.R(54, 93, 32, 4, "#2a2a30");
      },
      props:[], front(p, g, t){ for (const x of [70, 214]){ p.R(x - 30, 112, 60, 50, O); p.R(x - 29, 113, 58, 49, "#3a3a44"); p.R(x - 29, 113, 58, 3, "#4a4a56"); p.R(x - 10, 100, 20, 13, O); p.R(x - 9, 101, 18, 11, "#3a3a44"); p.R(x - 9, 101, 18, 2, "#4a4a56"); } } };
    return { room, custom:true, SEAT:[70, 214] };
  };

  // 老公寓五樓走廊（安全屋）：樓梯間在左、5B 的木門、一扇灰色鐵門、滅火器、折疊桌椅；之後那一集畫了自己的房間就用那一間
  STAGES.hall5 = (o) => {
    const room = { w:288, h:150, wall:60,
      floor(p, g, t){
        T.backWall(p, 0, 288, 60, "#e0dccc", "plain", { base:"#5a6a5a" }); p.R(0, 34, 288, 22, "#9ac0a0"); for (let i = 0; i < 288; i += 8) p.R(i, 34, 1, 22, "#88ae8e"); for (let j = 40; j < 56; j += 6) p.R(0, j, 288, 1, "#88ae8e");
        // 樓梯間（往頂樓）
        STAIR10.up(p, O, sh, 8, 2, 50, 7, "#a8a49c"); STAIR10.rail(p, O, 6, 4, 56, "#4a4a4a"); p.R(10, 6, 22, 6, O); p.R(11, 7, 20, 4, "#f4f0e0"); p.R(13, 8, 6, 2, "#3a3a3a"); p.R(21, 8, 6, 2, "#3a3a3a");
        // 5B 的木門＋門牌
        T.backDoor(p, 84, 16, 28, 44, 0, "#8a5a32", { frame:"#5a3a22" }); p.R(88, 6, 20, 8, O); p.R(89, 7, 18, 6, "#f4f0e0"); p.R(92, 9, 4, 2, "#3a3a3a"); p.R(98, 9, 6, 2, "#3a3a3a"); p.R(97, 32, 4, 4, "#1a1a1a");
        // 灰色鐵門、窗（夜）、監視器
        T.backDoor(p, 176, 16, 30, 44, 0, "#6a6e74", { frame:"#3a3e44" });
        p.R(240, 10, 38, 34, O); p.R(241, 11, 36, 32, "#5a5e64"); p.R(243, 13, 15, 28, "#141a2a"); p.R(260, 13, 15, 28, "#141a2a"); p.R(248, 20, 1, 1, "#e9c43a"); p.R(267, 28, 1, 1, "#e84a3a");
        p.R(212, 4, 12, 6, O); p.R(213, 5, 10, 4, "#2a2a2e"); p.R(220, 6, 1, 1, "#e84a3a");
        T.tiles(p, 0, 60, 288, 90, "#b8b4a8", "#b0aca0", 18);
        T.sides(p, this, "#5a6a5a", []);
      },
      props:[
        { y:72, draw(p){ p.R(226, 48, 8, 16, O); p.R(227, 49, 6, 14, "#c83a2a"); p.R(228, 45, 4, 4, O); } },
        // 折疊桌（一台熱水壺、一疊卷宗）＋一張椅子
        { y:96, draw(p){ T.box(p, 120, 76, 36, 12, 8, "#c8ccd0", "#8a8e94"); p.R(124, 70, 8, 8, O); p.R(125, 71, 6, 6, "#3a6a8a"); p.R(138, 78, 12, 7, O); p.R(139, 79, 10, 5, "#e8d8a8"); } },
        { y:104, draw(p){ T.chair(p, 112, 104, "#3a3a3e", "right"); } }
      ],
      front(p, g, t){ p.R(144, 0, 1, 6, O); p.R(140, 6, 9, 3, O); p.R(141, 7, 7, 1, "#f4f0c0"); T.glow(g, 144, 10, 60, "255,240,200", .12); } };
    return { room, row:[40, 260, 124], seats:[[112, 104, 1]] };
  };

  // 醫院走廊：病房的門、扶手、候診椅、護理站；地上的導引線
  STAGES.hospHall = (o) => {
    const room = { w:288, h:150, wall:60,
      floor(p, g, t){
        T.backWall(p, 0, 288, 60, "#e4ece8", "plain", { base:"#5a7a6a" }); p.R(0, 40, 288, 3, "#9ac0a8"); p.R(0, 43, 288, 1, "#7aa088");
        for (const [x, n] of [[20, 3], [96, 5], [172, 7]]){ T.backDoor(p, x, 16, 30, 44, 0, "#d8e4e0", { frame:"#7a9a8a" }); p.R(x + 33, 18, 10, 8, O); p.R(x + 34, 19, 8, 6, "#f4f4f0"); p.R(x + 36, 21, 1 + n % 3, 2, "#3a3a3a"); p.R(x + 4, 22, 22, 10, "#a8c8d8"); }
        p.R(60, 6, 28, 10, O); p.R(61, 7, 26, 8, "#3a7a5a"); p.R(65, 9, 18, 4, "#f4f4f0");   // 指示牌
        p.R(146, 24, 8, 14, O); p.R(147, 25, 6, 12, "#f4f8f8"); p.R(148, 26, 4, 3, "#3a8ad8");   // 乾洗手
        p.R(0, 60, 288, 90, "#cfdcd4"); for (let x = 0; x < 288; x += 16) p.R(x, 60, 1, 90, "#c0cec6"); for (let y = 76; y < 150; y += 16) p.R(0, y, 288, 1, "#c0cec6"); p.R(0, 112, 288, 3, "#3a8ad8"); p.R(0, 118, 288, 3, "#e9c46a");
        T.sides(p, this, "#5a7a6a", []);
      },
      props:[
        { y:84, draw(p){ for (let k = 0; k < 4; k++){ p.R(56 + k * 13, 70, 11, 8, O); p.R(57 + k * 13, 71, 9, 6, "#3a7aa8"); } p.R(54, 78, 56, 3, O); p.R(55, 79, 54, 1, "#5a9ac8"); p.R(56, 81, 2, 4, O); p.R(106, 81, 2, 4, O); } },
        { y:96, draw(p){ T.box(p, 220, 66, 60, 16, 12, "#e8eeea", "#9ab8a8"); p.R(226, 58, 18, 10, O); p.R(227, 59, 16, 7, "#2a2a2e"); p.R(228, 60, 14, 4, "#3a6aa8"); p.R(250, 62, 14, 8, O); p.R(251, 63, 12, 6, "#f4f0e6"); p.R(268, 60, 8, 8, O); p.R(269, 61, 6, 6, "#e9a0b0"); } }
      ],
      front(p, g, t){ for (const x of [50, 150, 250]){ p.R(x - 20, 1, 40, 3, O); p.R(x - 19, 2, 38, 1, "#f4f8f4"); } } };
    return { room, row:[30, 200, 104] };
  };

  // 告別式會場外：白色帳篷、「追思」的看板、花籃、簽到桌；豆花趴在地上
  STAGES.funeralOut = (o) => {
    o = o || {};
    const room = { w:288, h:150, wall:60,
      floor(p, g, t){
        T.backWall(p, 0, 288, 60, "#d8dcd8", "plain", { base:"#5a5e5a" });
        // 會館的入口：黑白布幔
        p.R(104, 14, 80, 46, O); p.R(105, 15, 78, 45, "#1e1e22"); for (let i = 105; i < 183; i += 8) p.R(i, 15, 4, 45, "#f4f4f0"); p.R(104, 14, 80, 4, "#2a2a2e");
        // 「追思」的看板
        p.R(20, 10, 60, 36, O); p.R(21, 11, 58, 34, "#f4f4f0"); p.R(21, 11, 58, 5, "#3a3a44"); p.R(38, 20, 24, 10, "#2a2a3a"); p.R(42, 23, 6, 4, "#f4f4f0"); p.R(52, 23, 6, 4, "#f4f4f0"); for (let k = 0; k < 3; k++) p.R(28, 34 + k * 3, 44, 1, "#8a8a92");
        // 白色帳篷的邊（一格一格垂下來）
        p.R(0, 0, 288, 6, "#f4f4f0"); for (let x = 0; x < 288; x += 16){ p.R(x, 6, 8, 4, "#f4f4f0"); p.R(x, 10, 8, 1, "#c8c8c4"); }
        T.paving(p, 0, 60, 288, 90, "#9a9a94", 16);
        T.sides(p, this, "#5a5e5a", []);
      },
      props:[
        // 花籃（白、黃菊花）
        { y:76, draw(p){ for (const [x, c] of [[90, "#f4f4f0"], [192, "#e8e8ff"], [222, "#f4f4f0"], [252, "#e8e8ff"]]){ p.R(x + 6, 48, 2, 28, O); p.R(x - 1, 34, 16, 16, O); for (let k = 0; k < 9; k++) p.R(x + (k % 3) * 5, 35 + Math.floor(k / 3) * 5, 4, 4, k % 2 ? c : "#f4e8a0"); p.R(x + 2, 50, 10, 6, "#f4f4f0"); p.R(x + 4, 52, 6, 1, "#3a3a44"); } } },
        // 簽到桌（白布、簽名簿、一盒白色的花）
        { y:100, draw(p){ T.box(p, 116, 80, 56, 12, 10, "#f4f4f0", "#e0e0dc"); p.R(124, 82, 16, 8, O); p.R(125, 83, 14, 6, "#f8f4e8"); p.R(131, 83, 1, 6, "#c8c4b8"); p.R(148, 82, 16, 7, O); p.R(149, 83, 14, 5, "#f4f4f0"); for (let k = 0; k < 4; k++) p.R(150 + k * 3, 84, 2, 2, "#f4e8a0"); } },
        // 豆花（趴著）
        { y:118, draw(p){ if (o.dog === false) return; const x = 50, y = 118; p.R(x - 4, y - 7, 22, 8, O); p.R(x - 3, y - 6, 20, 6, "#d8b888"); p.R(x + 14, y - 10, 9, 8, O); p.R(x + 15, y - 9, 7, 6, "#d8b888"); p.R(x + 20, y - 7, 2, 2, "#2a1a14"); p.R(x + 15, y - 11, 2, 2, "#a88858"); p.R(x + 4, y - 6, 6, 2, "#c8302a"); } }
      ],
      front(p, g, t){ T.glow(g, 144, 30, 70, "255,250,235", .08); } };
    return { room, row:[70, 250, 120] };
  };

  /* ---------- 地點裡的房間 ---------- */
  const ALIAS = { pol6:"interrog" };
  function resolve(name, opt){
    if (name === "police" && /頂樓/.test(opt.title || "")) return STAGES.roof(opt);
    if (ALIAS[name]) return STAGES[ALIAS[name]](opt);
    if (STAGES[name]) return STAGES[name](opt);
    const R = findRoom(name);
    if (R) return { room:R };
    if (name === "s15_hall") return STAGES.hall5(opt);
    if (name === "hospital") return STAGES.hospHall(opt);
    if (name === "funeral") return STAGES.funeralOut(opt);
    return null;
  }
  function findRoom(name){
    try {
      for (const [loc, rs] of Object.entries(C.rooms || {})) for (const r of rs || []) if (r.scene === name){ const T0 = C.world[loc] && C.world[loc].top; if (T0 && T0.rooms[r.id]) return T0.rooms[r.id]; }
      const T1 = C.world[name] && C.world[name].top; if (T1) return T1.rooms[T1.start];
      for (const [loc, rs] of Object.entries(C.rooms || {})) for (const r of rs || []) if (r.scene && r.scene.endsWith("_" + name)){ const T2 = C.world[loc] && C.world[loc].top; if (T2 && T2.rooms[r.id]) return T2.rooms[r.id]; }
      if (["s_plat"].includes(name)){ for (const w of Object.values(C.world)) if (w && w.top && w.top.rooms.splat) return w.top.rooms.splat; }
    } catch (e){}
    return null;
  }

  /* ---------- 站位 ---------- */
  function freeAt(R, x, y){ if (x < 10 || x > R.w - 10 || y < (R.wall || 0) + 8 || y > R.h - 6) return false;
    return !(R.solid || []).some(s => x > s[0] - 7 && x < s[0] + s[2] + 7 && y > s[1] - 3 && y < s[1] + s[3] + 3) && !(R.exits || []).some(e => x > e.r[0] - 2 && x < e.r[0] + e.r[2] + 2 && y > e.r[1] - 4 && y < e.r[1] + e.r[3] + 4); }
  function autoRow(R){ let best = null;
    for (let y = R.h - 14; y >= (R.wall || 0) + 18; y -= 4){ let run = 0, st = 0;
      for (let x = 10; x <= R.w - 10; x += 2){ if (freeAt(R, x, y)){ if (!run) st = x; run += 2; const sc = run + (y - (R.wall || 0)) * .15; if (!best || sc > best.sc) best = { sc, x0:st, x1:x, y }; } else run = 0; } }
    return best ? [best.x0 + 6, best.x1 - 6, best.y] : [20, R.w - 20, R.h - 20];
  }
  function layout(st, cast){
    const R = st.room, row = (st.row || (R.stage && R.stage.row) || autoRow(R)).slice(), seats = (st.seats || (R.stage && R.stage.seats) || []).map(s => ({ x:s[0], y:s[1], f:s[2], used:false }));
    if (row[1] - row[0] > 240){ const c0 = (row[0] + row[1]) / 2; row[0] = c0 - 120; row[1] = c0 + 120; }
    const ppl = [], sorted = cast.slice().sort((a, b) => (a.x || 0) - (b.x || 0));
    const mapX = x => Math.round(row[0] + Math.max(0, Math.min(192, x || 0)) / 192 * (row[1] - row[0]));
    sorted.forEach((c, j) => {
      const pose = String(c.pose || "stand"), sit = /^sit/.test(pose);
      if (st.standAt && st.standAt[c.id]){ const a = st.standAt[c.id]; ppl.push({ ...c, x:a[0], y:a[1], face:a[2], act:POSE[pose] || "idle", view:"side" }); return; }
      if (sit){ let s = null;
        if (st.seatOf){ const q = st.seatOf(c); s = seats.find(z => z.x === q[0] && z.y === q[1] && !z.used) || null; if (!s && q) s = { x:q[0], y:q[1], f:q[2] }; }
        if (!s && st.order) s = seats.find(z => !z.used && z.f === (c.facing || 1)) || seats.find(z => !z.used);
        if (!s && seats.length){ const mx = mapX(c.x); s = seats.filter(z => !z.used).sort((a, b) => (a.f !== (c.facing || 1)) - (b.f !== (c.facing || 1)) || Math.abs(a.x - mx) - Math.abs(b.x - mx))[0]; }
        if (s){ s.used = true; ppl.push({ ...c, x:s.x, y:s.y, face:s.f, act:SIT[pose] || "sit", view:"side" }); return; } }
      // 站著：排在空著的那一排，彼此至少隔 20
      let x = mapX(c.x), y = row[2] + (j % 2) * 4;
      for (let d = 0; d < 80 && !freeAt(R, x, y); d += 2){ if (freeAt(R, x + d, y)){ x += d; break; } if (freeAt(R, x - d, y)){ x -= d; break; } }
      const prev = ppl.filter(q => q.view !== "seat" && Math.abs(q.y - y) < 10 && Math.abs(q.x - x) < 20)[0]; if (prev) x = Math.min(row[1] + 10, prev.x + 20);
      let act = POSE[pose] || "idle"; if (act === "idle" && c.talking) act = "talk";
      ppl.push({ ...c, x, y, face:c.facing || 1, act, view:"side" });
    });
    return ppl;
  }

  /* ---------- 畫 ---------- */
  function draw(cv, name, opt){
    if (!T || typeof SP === "undefined" || !isTop()) return false;
    const st = resolve(name, opt || {}); if (!st) return false;
    const R = st.room, cast = (opt.people || opt.cast || []).map(c => ({ ...c, L:c.L || c.look, talking:c.talking || c.mark }));
    const ppl = st.custom ? cast : layout(st, cast.filter(c => c.L));
    cv.width = VW; cv.height = VH;
    const g = cv.getContext("2d"), p = PX.prim, o = { ...(opt || {}), phase:(opt && opt.phase) || 0 };
    const xs = ppl.length ? ppl.map(q => q.x || 0) : [R.w / 2], mid = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cx = R.w <= VW ? -(VW - R.w) / 2 : Math.max(0, Math.min(R.w - VW, mid - VW / 2));
    const ys = ppl.length && !st.custom ? ppl.map(q => q.y) : [R.h / 2], my = (Math.min(...ys) + Math.max(...ys)) / 2 - 10;
    const cy = R.h <= VH ? -(VH - R.h) / 2 : Math.max(0, Math.min(R.h - VH, my - VH / 2));
    const t0 = performance.now();
    const person = (q, t) => { const n = SP.frames(q.act), f = q.act === "idle" ? Math.floor(t * 2) % n : Math.floor(t * 4) % n;
      g.save(); g.globalAlpha = .28; g.fillStyle = "#000"; g.beginPath(); g.ellipse(Math.round(q.x), Math.round(q.y), 7, 2.2, 0, 0, 7); g.fill(); g.restore();
      SP.draw(g, q.x, q.y, q.L, { view:q.view, facing:q.face, act:q.act, f });
      if (q.mark){ const b = Math.round(Math.sin(t * 4) * 1.5), mx = Math.round(q.x), my2 = Math.round(q.y) - (/^sit/.test(q.act || "") ? 46 : 50) + b; p.R(mx - 4, my2, 9, 2, O); p.R(mx - 3, my2 + 2, 7, 2, O); p.R(mx - 2, my2 + 4, 5, 2, O); p.R(mx - 3, my2, 7, 1, "#f2c43a"); p.R(mx - 2, my2 + 2, 5, 1, "#f2c43a"); p.R(mx - 1, my2 + 4, 3, 1, "#f2c43a"); } };
    const backHead = (q, x) => { const L = q.L || {}, hair = L.hair || "#2a2220", top = L.coat || L.top || "#3a4250", skin = L.skin || "#e8c09a", long = /long|pony|bob|bun/.test(L.hairStyle || "");
      p.R(x - 22, 104, 44, 14, O); p.R(x - 21, 105, 42, 13, top); p.R(x - 5, 98, 10, 8, skin);                        // 肩膀、脖子
      p.R(x - 11, 82, 2, 6, skin); p.R(x + 9, 82, 2, 6, skin);                                                           // 耳朵
      p.R(x - 8, 74, 16, 1, O); p.R(x - 10, 75, 20, 1, O); p.R(x - 10, 76, 20, 20, O); p.R(x - 8, 96, 16, 2, O);
      p.R(x - 8, 75, 16, 1, hair); p.R(x - 9, 76, 18, 20, hair); p.R(x - 7, 96, 14, 1, hair); p.R(x - 6, 77, 7, 2, sh(hair, .22)); p.R(x - 2, 80, 1, 12, sh(hair, -.15));
      if (long){ p.R(x - 10, 94, 20, 12, O); p.R(x - 9, 94, 18, 11, hair); } };
    const loop = () => {
      if (!cv.isConnected) return;
      const t = (performance.now() - t0) / 1000;
      g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; p.ctx(g); g.fillStyle = "#0b0a09"; g.fillRect(0, 0, VW, VH);
      g.save(); g.translate(-Math.round(cx), -Math.round(cy));
      R.floor.call(R, p, g, t, o);
      if (st.custom){ ppl.slice(0, 2).forEach((q, i) => backHead(q, st.SEAT[i])); if (R.front) R.front.call(R, p, g, t, o); }
      else {
        const list = (R.props || []).map(pr => ({ y:pr.y, prop:pr })).concat(ppl.map(q => ({ y:q.y + .5, q })));
        list.sort((a, b) => a.y - b.y).forEach(it => it.prop ? it.prop.draw.call(R, p, g, t, o) : person(it.q, t));
        st.extra && st.extra(p, g, t, ppl);
        if (R.front) R.front.call(R, p, g, t, o);
      }
      g.restore();
      requestAnimationFrame(loop);
    };
    loop();
    return true;
  }
  return { draw, resolve, STAGES };
})();
