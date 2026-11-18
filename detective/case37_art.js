/* =========================================================
   第 37 集：場景、人物造型、監視器畫面、結案、走動畫面、地圖、開場
   沿用：一樓值班台（第 14 集 e_lobby）、三樓督察組會議室（第 34 集 c34_meet）、鑑識中心（第 32 集 c32_lab）、海風咖啡（cafe.js）、沈岳家樓下（第 36 集 c36_home）
   新畫的：三樓走廊 c37_hall、槍械室 c37_arm、後門和員工停車場 c37_rear、走廊監視器的畫面 c37_hcam（黑白）、槍械室監視器的畫面 c37_top（從正上方、黑白）
   這一集玩家是許知夏：走動畫面裡的「你」用她的造型；沈岳是咖啡店裡的一個人。
   ========================================================= */
EP37.art = true;
(() => {
  const PR = PX.prim, { INK } = PR;
  const W = 192, H = 108;
  const SC = PX.SCENES;
  // 監視器的畫面是黑白的：畫的時候把顏色換成灰階（DIM＝走廊的燈關了一半）
  let MONO = false, DIM = false;
  const gray = c => { if (typeof c !== "string" || c[0] !== "#" || c.length < 7) return c;
    const v = Math.round((parseInt(c.slice(1, 3), 16) * .3 + parseInt(c.slice(3, 5), 16) * .59 + parseInt(c.slice(5, 7), 16) * .11) * (DIM ? .6 : .88));
    const h = n => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0"); return "#" + h(v - 5) + h(v) + h(v + 3) + c.slice(7); };
  const K = c => MONO ? gray(c) : c;
  const R = (x, y, w, h, c) => PR.R(Math.round(x), Math.round(y), w, h, K(c)), P = (x, y, c) => PR.P(Math.round(x), Math.round(y), K(c));
  const dither = (x, y, w, h, c, n) => PR.dither(x, y, w, h, K(c), n);
  const floor = (y, c, l) => PR.floor(y, K(c), K(l));
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i, p] = beatAt(o.t || 0, o.ds); return Object.assign({ _p:p }, (o.seq || [])[i] || {}); };
  const bare = o => Object.assign({}, o, { ds:undefined, seq:undefined });
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px sans-serif"; g.fillStyle = K(c); g.fillText(s, x, y); };
  const tube = (x, y, w, off) => { if (off){ R(x, y, w, 2, "#8a8e8a"); return; } R(x, y, w, 2, "#f4f8f0"); dither(x - 4, y + 2, w + 8, 6, "#f4f8f022", 3); };
  const clock = (x, y, hh, mm) => { R(x, y, 11, 11, "#f4f4f0"); R(x, y, 11, 1, "#5a5a5a"); R(x, y + 10, 11, 1, "#c8c8c0");
    const a = (hh % 12 + mm / 60) / 12 * Math.PI * 2, b = mm / 60 * Math.PI * 2;
    for (let k = 1; k <= 2; k++) P(x + 5 + Math.round(Math.sin(a) * k), y + 5 - Math.round(Math.cos(a) * k), INK);
    for (let k = 1; k <= 4; k++) P(x + 5 + Math.round(Math.sin(b) * k), y + 5 - Math.round(Math.cos(b) * k), INK); P(x + 5, y + 5, "#e83a3a"); };
  const lerp = (a, b, p) => a + (b - a) * Math.max(0, Math.min(1, p));
  const seg = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));
  /* 機車（車頭朝左）：(x, y)＝左上角，長 18、高 13 */
  const scooter = (x, y, c) => { R(x + 4, y + 5, 11, 4, c); R(x + 1, y + 2, 4, 7, c); R(x + 2, y - 1, 1, 4, "#5a5a5e"); R(x, y - 2, 5, 1, "#3a3a3e"); R(x + 8, y + 3, 7, 2, "#2a2a2e");
    [1, 12].forEach(a => { R(x + a, y + 8, 5, 5, "#1a1a1a"); P(x + a + 2, y + 10, "#8a8a8e"); }); };

  /* ---------- 三樓走廊：左邊是後樓梯的防火門 x3–19（上面是監視器 x21–29）；刑事大隊的門 x31–47；公用分機 4417 x56–62；販賣機 x70–86；
     督察組會議室的門 x99–113；窗和長椅 x122–146；最右邊是槍械室的鋼門 x158–176（200 公分＝y28–76；玻璃 y33–40＝上緣 180、下緣 150 公分）；讀卡機 x179–184。
     o.dim＝晚上九點多以後，燈關了一半；o.open＝槍械室的門開著；o.sopen＝後樓梯的門開著；o.oclosed＝刑事大隊的門關著；o.led＝讀卡機亮綠燈 */
  SC.c37_hall = (o) => { o = Object.assign({}, o, stOf(o)); const dim = !!o.dim;
    R(0, 0, W, 76, "#d3d6cd"); R(0, 0, W, 5, "#9aa09a");
    tube(34, 5, 20, dim); tube(92, 5, 20, false); tube(140, 5, 20, dim);
    R(0, 62, W, 14, "#bcc0b8"); R(0, 61, W, 1, "#9aa09a");
    // 後樓梯的防火門
    R(2, 29, 19, 47, "#6a7068");
    if (o.sopen){ R(3, 30, 17, 46, "#24282a"); R(3, 30, 3, 46, "#8a9488"); for (let k = 0; k < 4; k++) R(8, 62 + k * 4, 12 - k * 2, 1, "#4a4e50"); }
    else { R(3, 30, 17, 46, "#8a9488"); R(3, 30, 17, 1, "#a2aca0"); R(5, 53, 13, 2, "#c8ccc8"); R(7, 35, 6, 8, "#b8d0d8"); dither(7, 35, 6, 8, "#5a6a7244", 2); }
    R(3, 21, 17, 7, "#2a6a3a"); txt("樓梯", 5, 27, "#f4f0e0", "6px sans-serif");
    // 天花板下面的監視器（順著走廊，朝右邊拍）
    R(24, 5, 2, 4, "#5a5e62"); R(21, 8, 8, 4, "#3a3e44"); R(28, 9, 2, 2, "#1a1a1e"); P(22, 9, "#e83a3a");
    // 刑事大隊的門
    R(29, 29, 20, 47, "#6a7480");
    if (o.oclosed){ R(31, 31, 16, 45, "#8a6a4a"); R(31, 31, 16, 1, "#a88a68"); R(34, 35, 10, 10, "#a8c4d4"); R(44, 54, 2, 4, "#d8d8d8"); }
    else { R(31, 31, 16, 45, "#e4e6da"); R(31, 59, 16, 17, "#b0b4a6"); R(31, 55, 13, 3, "#8a7a5a"); R(33, 48, 6, 7, "#2a2e36"); R(34, 49, 4, 4, "#5a8ab8"); R(40, 52, 3, 3, "#f4f0e0"); R(44, 31, 3, 45, "#8a6a4a"); R(44, 31, 1, 45, "#a88a68"); }
    R(27, 19, 24, 8, "#2a3a5a"); txt("刑事大隊", 29, 25, "#f4f0e0", "5px sans-serif");
    // 牆上的公用分機
    R(51, 34, 17, 7, "#f4f0e0"); R(51, 34, 17, 1, "#c8c4b4"); PR.tiny("4417", 52, 35, K("#2a3a5a"));
    R(56, 43, 6, 11, "#e8e4d4"); R(56, 43, 6, 1, "#f8f4e4"); R(57, 45, 2, 7, "#3a3e44"); P(60, 46, "#6a6a6a"); P(60, 48, "#6a6a6a"); P(60, 50, "#6a6a6a"); R(57, 54, 1, 5, "#3a3e44"); P(58, 59, "#3a3e44");
    // 販賣機
    R(72, 36, 16, 40, "#3a5a8a"); R(72, 36, 16, 2, "#5a7ab0"); R(74, 39, 9, 20, "#1e2a3a");
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) R(75 + c * 3, 40 + r * 5, 2, 3, ["#c83a2a", "#e8c040", "#3a8a5a", "#8a5a3a"][(r + c) % 4]);
    R(84, 41, 3, 7, "#c8ccd0"); P(85, 43, "#3a3e44"); R(74, 64, 12, 6, "#16202c"); R(72, 74, 16, 2, "#2a4a7a");
    if (dim) dither(68, 34, 24, 44, "#a8c8f018", 2);
    // 督察組會議室的門
    R(97, 29, 18, 47, "#6a7480"); R(99, 31, 14, 45, "#8a6a4a"); R(99, 31, 14, 1, "#a88a68"); R(102, 35, 8, 10, "#a8c4d4"); dither(102, 35, 8, 10, "#ffffff55", 2); R(100, 54, 2, 4, "#d8d8d8");
    R(95, 19, 22, 8, "#2a3a5a"); txt("督察組", 97, 26, "#f4f0e0", "6px sans-serif");
    // 窗和長椅
    R(121, 21, 27, 30, "#6a7480"); R(123, 23, 23, 26, dim ? "#1a2230" : "#a8d0ec"); R(134, 23, 1, 26, "#6a7480");
    if (!dim){ R(123, 40, 23, 9, "#9aa8ae"); R(126, 36, 6, 13, "#8a98a0"); R(137, 38, 7, 11, "#a8b4ba"); R(125, 25, 8, 2, "#e8f4fa"); } else { P(127, 30, "#c8d0e0"); P(140, 27, "#c8d0e0"); for (let k = 0; k < 8; k++) R(124 + (k * 7) % 21, 25 + (k * 5) % 20, 1, 3, "#5a6a80"); }
    R(122, 66, 24, 3, "#7a6a4a"); R(122, 66, 24, 1, "#94846a"); R(124, 69, 2, 7, "#5a4a3a"); R(142, 69, 2, 7, "#5a4a3a");
    // 槍械室的鋼門
    R(156, 26, 22, 50, "#5a6068");
    if (o.open){ R(158, 28, 18, 48, "#2c3034"); R(158, 28, 3, 48, "#8a929a"); R(161, 62, 15, 14, "#3a4046"); }
    else { R(158, 28, 18, 48, "#8a929a"); R(158, 28, 18, 1, "#a8b0b8"); R(162, 33, 10, 7, "#b8d0d8"); dither(162, 33, 10, 7, "#4a5a6266", 2); R(161, 32, 12, 1, "#5a6068"); R(161, 40, 12, 1, "#5a6068"); R(173, 52, 2, 6, "#d8d8d8");
      [30, 50, 72].forEach(y => { P(159, y, "#6a7078"); P(174, y, "#6a7078"); }); if (dim) R(159, 75, 16, 1, "#e8dca0"); }
    R(154, 16, 26, 8, "#7a2a2a"); txt("槍械室", 157, 23, "#f4f0e0", "6px sans-serif");
    // 讀卡機
    R(179, 44, 5, 8, "#d8d0b0"); R(179, 44, 5, 1, "#e8e0c0"); R(180, 45, 3, 3, "#3a3e44"); P(181, 50, o.led ? "#6ae86a" : "#c83a2a");
    floor(76, "#8a9096", "#7e848a");
    for (let x = 4; x < W; x += 12) R(x, 76, 1, 32, "#7a8086");
    R(150, 79, 34, 1, "#c8b040");   // 門前的第一條線
  };

  /* ---------- 槍械室：門（裡面）x2–16、出門的按鈕 x19；牆上的配置表 x24–44；高背的椅子 x36–46；
     櫃台 x18–80（桌面 y58）：手機 x19、藥袋 x27、登記簿 x33–45、日誌 x47–56、兩個螢幕 x58–67、x69–78；櫃台正面夾著門禁報表 x60–72；
     電子槍櫃 x92–155（八格一排、六排，一格 8×10；27 號＝第四排第三格 x108、y46）；工作台 x160–190（油壺 x160、清槍紀錄簿 x168）；上面是彈藥櫃 x160–187；天花板的攝影機 x116。 */
  SC.c37_arm = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 76, "#c8ccc4"); R(0, 0, W, 5, "#9aa09a"); tube(40, 5, 22); tube(124, 5, 22);
    R(0, 64, W, 12, "#b4b8b0"); R(0, 63, W, 1, "#9aa09a");
    // 門和出門的按鈕
    R(1, 27, 17, 49, "#5a6068"); R(2, 28, 15, 48, "#8a929a"); R(2, 28, 15, 1, "#a8b0b8"); R(5, 33, 9, 7, "#b8d0d8"); dither(5, 33, 9, 7, "#4a5a6266", 2); R(3, 52, 2, 6, "#d8d8d8");
    R(19, 47, 3, 5, "#d8d0b0"); P(20, 49, "#3aa83a");
    R(3, 15, 13, 10, "#f4f0e0"); R(3, 15, 13, 2, "#c83a2a"); for (let k = 0; k < 3; k++) R(5, 19 + k * 2, 9, 1, "#8a8a8a");   // 牆上的規定
    // 配置表
    R(23, 19, 22, 16, "#8a8e92"); R(24, 20, 20, 14, "#f8f8f4");
    for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) P(26 + c * 2, 22 + r * 2, r === 3 && c === 2 ? "#c83a2a" : "#8a8e98");
    clock(49, 8, o.hh !== undefined ? o.hh : 10, o.mm || 0);
    // 椅子
    R(37, 37, 9, 21, "#3a3e46"); R(38, 38, 7, 4, "#5a606c"); R(38, 43, 7, 10, "#4a4e58"); R(39, 44, 5, 1, "#5a606c"); R(35, 51, 2, 7, "#2a2e36"); R(46, 51, 2, 7, "#2a2e36"); R(35, 50, 3, 1, "#5a606c"); R(45, 50, 3, 1, "#5a606c");
    // 櫃台
    R(18, 58, 62, 3, "#8a6a4a"); R(18, 58, 62, 1, "#a88a68"); R(18, 61, 62, 15, "#6a7a8a"); R(20, 63, 58, 1, "#7a8a9a");
    R(19, 56, 5, 2, "#1e1e22"); R(20, 56, 3, 1, "#3a5a7a");   // 手機
    R(27, 53, 5, 5, "#f4f0e0"); R(27, 53, 5, 1, "#3a8a5a"); P(30, 56, "#e8c040");   // 藥袋
    R(33, 55, 13, 3, "#3a2a2a"); R(34, 55, 11, 2, "#f4f0e0"); R(39, 55, 1, 2, "#8a8a8a");   // 登記簿
    R(47, 55, 10, 3, "#2a3a6a"); R(48, 55, 8, 2, "#f4f0e0");   // 日誌
    [58, 69].forEach((x, i) => { R(x, 44, 10, 10, "#1a1a1e"); R(x + 1, 45, 8, 7, i ? "#3a4648" : "#3e4850"); R(x + 4, 54, 2, 4, "#1a1a1e"); R(x + 2, 57, 6, 1, "#3a3a3e");
      if (i){ R(x + 2, 46, 6, 1, "#7a8688"); R(x + 2, 50, 3, 2, "#6a7678"); } else { R(x + 6, 46, 2, 6, "#8a9698"); R(x + 2, 51, 6, 1, "#59656b"); } });
    R(60, 63, 13, 10, "#f8f8f4"); R(60, 63, 13, 1, "#c83a2a"); for (let k = 0; k < 4; k++) R(61, 65 + k * 2, 10 - (k % 2) * 2, 1, "#8a8a8a");   // 門禁報表
    // 電子槍櫃
    R(90, 14, 68, 62, "#4a5058"); R(90, 14, 68, 1, "#6a7078");
    for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++){ const x = 92 + c * 8, y = 16 + r * 10, me = r === 3 && c === 2;
      R(x, y, 7, 9, me ? "#1e2226" : "#7a828a"); if (!me){ R(x, y, 7, 1, "#98a0a8"); P(x + 5, y + 5, "#3a3e44"); P(x + 1, y + 7, "#3a8a3a"); }
      else { R(x + 1, y + 6, 4, 2, "#6a5a3a"); R(x + 3, y + 3, 1, 3, "#e8c040"); R(x - 1, y + 1, 9, 2, "#e8d040"); } }   // 27 號：空的，剩一個清槍包和黃色的噴瓶；門上貼著封條
    // 工作台、油壺、清槍紀錄簿、通條
    R(160, 60, 30, 3, "#8a8e92"); R(160, 60, 30, 1, "#aab0b4"); R(162, 63, 2, 13, "#5a5e62"); R(186, 63, 2, 13, "#5a5e62");
    R(160, 53, 5, 7, "#e8e8e0"); R(161, 51, 2, 2, "#c83a2a"); R(160, 56, 5, 2, "#2a4a8a");
    R(168, 57, 13, 3, "#3a5a3a"); R(169, 57, 11, 2, "#f4f0e0"); R(184, 53, 1, 7, "#8a6a3a"); R(186, 52, 1, 8, "#8a6a3a");
    // 彈藥櫃
    R(160, 22, 28, 24, "#5a6470"); R(160, 22, 28, 1, "#7a8490"); R(174, 23, 1, 22, "#3a4450"); R(171, 33, 2, 3, "#c8c8cc"); R(176, 33, 2, 3, "#c8c8cc"); R(179, 26, 7, 10, "#8a6a42"); R(180, 28, 5, 7, "#f4f0e0"); R(181, 30, 3, 1, "#8a8a8a"); R(181, 32, 3, 1, "#8a8a8a");
    // 天花板上的攝影機
    R(116, 5, 6, 2, "#5a5e62"); R(117, 7, 4, 2, "#2a2e34"); P(118, 8, "#e83a3a");
    floor(76, "#7c838a", "#70777e");
  };

  /* ---------- 後門和員工停車場：大樓的牆 x0–56（後門 x18–34、讀卡機 x39–42、門上面的監視器朝右）；員工車位；機車棚 x116–174；最右邊是側門 x176–189。
     o.night＝晚上；o.rain＝下雨 */
  SC.c37_rear = (o) => { o = Object.assign({}, o, stOf(o)); const n = !!o.night, c = (a, b) => n ? b : a, t = o.t || 0;
    R(0, 0, W, 50, c("#9cc4e4", "#0e1220")); R(0, 38, W, 12, c("#c8dce8", "#1a2030"));
    R(56, 44, 136, 32, c("#9a968a", "#3e3e3c")); for (let x = 56; x < W; x += 12) R(x, 44, 1, 32, c("#8a867a", "#343432")); R(56, 44, 136, 2, c("#b8b4a8", "#4a4a48"));
    // 側門：只到腰的鐵柵門
    R(176, 44, 14, 32, c("#b4c8d4", "#141a26")); R(176, 60, 14, 1, "#3a3e44"); for (let x = 177; x < 190; x += 3) R(x, 60, 1, 16, "#3a3e44"); R(176, 75, 14, 1, "#3a3e44");
    // 大樓的牆、樓梯間的窗、後門
    R(0, 6, 56, 70, c("#c8c4b4", "#55544c")); R(4, 10, 48, 3, c("#a8a494", "#44433c"));
    [18, 34].forEach(y => { R(42, y, 9, 10, c("#7a8a98", "#2a3038")); R(43, y + 1, 7, 8, c("#a8c8d8", n ? "#3a4450" : "#a8c8d8")); });
    R(16, 34, 20, 42, "#5a6470"); R(18, 36, 16, 40, o.dopen ? "#1e2226" : "#6a7480"); if (!o.dopen){ R(18, 36, 16, 1, "#8a94a0"); R(31, 54, 2, 4, "#c8c8cc"); }
    txt("後門", 19, 32, c("#3a3a3a", "#a8a8a0"), "6px sans-serif");
    R(39, 48, 4, 7, "#d8d0b0"); R(40, 49, 2, 3, "#3a3e44"); P(41, 53, o.led ? "#6ae86a" : "#c83a2a");
    R(33, 4, 1, 5, "#3a3e3e"); R(30, 2, 10, 4, "#3a3e44"); R(39, 3, 2, 2, "#1a1a1e"); P(31, 3, "#e83a3a");
    if (n){ R(22, 28, 8, 2, "#fff0b0"); const g = PR.g(); g.fillStyle = "rgba(255,240,170,.10)"; g.fillRect(8, 30, 40, 56); }
    floor(76, c("#7a7a76", "#34363a"), c("#6a6a66", "#2c2e32")); for (let x = 64; x < 116; x += 24) R(x, 88, 2, 20, c("#e8e8e0", "#7a7a76"));
    // 機車棚
    R(114, 37, 62, 3, c("#5a6a5a", "#2a342c")); R(114, 40, 62, 1, c("#3a4a3a", "#1a221c")); R(117, 41, 2, 35, "#5a5e62"); R(171, 41, 2, 35, "#5a5e62");
    if (!o.empty){ scooter(121, 63, c("#3a6a9a", "#22405c")); if (!n) scooter(138, 63, c("#8a8e92", "#4a4e52")); }
    if (o.bike){ R(152, 66, 12, 3, "#1c1c20"); R(150, 62, 3, 8, "#1c1c20"); R(151, 59, 1, 4, "#2a2a2e"); R(149, 58, 5, 1, "#2a2a2e"); R(158, 63, 6, 3, "#1c1c20"); [149, 161].forEach(a => { R(a, 70, 6, 6, "#101012"); P(a + 2, 72, "#5a5a5e"); }); }
    if (!n || o.drips) [[154, 87], [157, 89], [161, 86], [156, 91]].forEach(([x, y]) => { R(x, y, 2, 1, "#1a1a1c"); });
    if (n){ const g = PR.g(); g.fillStyle = "rgba(8,12,30,.22)"; g.fillRect(0, 0, W, H); }
    if (o.rain){ for (let k = 0; k < 60; k++){ const x = (k * 53 + Math.floor(t * 12) * 5) % W, y = (k * 29 + Math.floor(t * 12) * 17) % H; if (!(x > 114 && x < 176 && y > 40 && y < 78)) R(x, y, 1, 3, "#8aa0b8"); } }
  };

  /* ---------- 三樓督察組會議室：沿用第 34 集。白板換成這一件的時間；桌上是名單（x38）和裝著員警卡的證物袋（x54）；o.fax＝傳真機下面有紙 */
  SC.c37_meet = (o) => { o = Object.assign({}, o, stOf(o)); SC.c34_meet({ pm:false, hh:o.hh !== undefined ? o.hh : 10, mm:o.mm || 0 });
    R(57, 11, 58, 32, "#f8f8f4"); PR.tiny("3/19", 59, 13, "#2a3a6a"); R(59, 20, 20, 1, "#b8bcc0");
    PR.tiny("18:03", 59, 23, "#2a3a6a"); PR.tiny("21:31", 59, 30, "#c83a2a"); PR.tiny("22:48", 59, 37, "#c83a2a");
    R(84, 25, 26, 1, "#2a3a6a"); R(84, 32, 18, 1, "#c83a2a"); P(104, 32, "#c83a2a"); P(106, 32, "#c83a2a"); R(84, 39, 18, 1, "#c83a2a"); P(104, 39, "#c83a2a"); P(106, 39, "#c83a2a");
    R(54, 54, 11, 5, "#dfe8ea"); R(54, 54, 11, 1, "#c83a2a"); R(57, 56, 5, 3, "#f4f0e0"); R(58, 57, 2, 1, "#2a4a8a");
    if (o.fax){ R(142, 57, 14, 4, "#f4f0e0"); R(143, 58, 10, 1, "#6a6a6a"); R(143, 60, 7, 1, "#6a6a6a"); }
  };

  /* ---------- 鑑識中心：沿用第 32 集。推車上是裝著槍的盤子（x111–127，旁邊是裝棉棒的管子）和排好的十五顆子彈（x131–145） ---------- */
  SC.c37_lab = (o) => { SC.c32_lab(o);
    R(111, 74, 17, 3, "#b8bcc0"); R(111, 74, 17, 1, "#dcdfe0"); R(113, 72, 9, 2, "#2a2e34"); R(119, 74, 3, 2, "#2a2e34"); P(113, 72, "#5a5e64"); R(125, 70, 1, 5, "#e8e8e0"); P(125, 70, "#c8a040");
    R(131, 74, 15, 3, "#b8bcc0"); R(131, 74, 15, 1, "#dcdfe0"); R(132, 71, 3, 4, "#3a3e44"); for (let k = 0; k < 5; k++){ R(137 + k * 2, 72, 1, 2, "#c8a040"); P(137 + k * 2, 72, "#a86a3a"); }
    R(87, 57, 4, 5, "#f4f0e8"); R(87, 57, 4, 1, "#b88a50"); P(91, 58, "#f4f0e8"); P(92, 59, "#f4f0e8"); P(91, 60, "#f4f0e8"); R(86, 62, 6, 1, "#c8d0d0"); };   // 你的茶杯：把手朝右

  /* ---------- 海風咖啡：沿用 cafe.js。o.note＝第一張桌子上攤著你的本子 ---------- */
  SC.c37_cafe = (o) => { o = o || {}; SC.cafe(Object.assign({}, o, { time:o.time || "morning", ep:37 }));
    R(8, 44, 9, 1, "#c8a070"); R(8, 46, 9, 1, "#c8a070"); R(20, 43, 1, 6, "#8a8a8e");   // 窗裡：櫃台上疊著新的木板
    if (o.note){ R(51, 78, 6, 2, "#f4f0e0"); R(51, 78, 6, 1, "#ffffff"); P(53, 79, "#2a3a8a"); P(55, 79, "#2a3a8a"); } };

  /* ---------- 走廊監視器的畫面（黑白）：就是三樓走廊，人是自己畫的，高度照比例。
     門板 200 公分＝48 格；沈岳 183＝頭頂在玻璃上緣的上面；穿雨衣的人連帽子都在玻璃上緣的下面。 */
  const FIG = { shen:["#4a5260", "#2a2f3a", "#1e1a18", "#e8c8a8"], zhou:["#7a7e86", "#2a2f3a", "#8a8a86", "#d8b090"], cao:["#eeeae0", "#2a2f3a", "#2e2a26", "#d8b090"], hood:["#30343a", "#26282c", "#30343a", "#30343a"] };
  const fig = (x, fy, h, k, d, step, hold) => { const C = FIG[k], hd = 7, lg = k === "hood" ? 8 : 15, top = fy - h, s = step ? Math.floor(step) % 2 : 0; x = Math.round(x);
    R(x - 3 + (s ? 1 : 0), fy - lg, 2, lg, C[1]); R(x + 1 - (s ? 1 : 0), fy - lg, 2, lg, C[1]);
    R(x - 4, top + hd, 8, h - hd - lg, C[0]); if (k === "hood") R(x - 5, fy - lg - 3, 10, 3, C[0]);
    if (k === "hood"){ R(x - 4, top, 8, hd + 2, C[2]); R(x - 3, top, 6, 1, "#484c52"); R(x + (d > 0 ? 2 : -4), top + 3, 2, 4, "#16181c"); }
    else { R(x - 3, top + 1, 6, hd - 1, C[3]); R(x - 3, top, 6, 3, C[2]); R(x + (d > 0 ? -3 : 1), top, 2, 6, C[2]); }
    if (hold){ R(x + (d > 0 ? 3 : -5), top + hd + 3, 2, 3, C[0]); R(x + (d > 0 ? 4 : -7), top + hd + 3, 3, 2, k === "hood" ? "#d0d0c8" : C[3]); }
    else { R(x + (d > 0 ? 2 : -4), top + hd + 2, 2, 9, C[0]); R(x + (d > 0 ? 2 : -4), top + hd + 11, 2, 2, k === "hood" ? "#d0d0c8" : C[3]); } };
  SC.c37_hcam = (o) => { o = Object.assign({}, o, stOf(o)); const p = o._p || 0, m = o.mode || "", t = o.t || 0, F = 77, st = t * 6;
    const dim = !!o.dim; let open = false, sopen = false, led = false, oclosed = !/^cao/.test(m) && dim;
    const A = [];   // 要畫的人
    if (m === "shenIn"){ A.push(["zhou", lerp(-18, 150, p), 42, 1, p < 1 ? st : 0], ["shen", lerp(-6, 166, p), 45, 1, p < 1 ? st : 0]); }
    else if (m === "shenDoor"){ led = p > .35; open = p > .6; A.push(["zhou", 150, 42, 1, 0]); if (p < .85) A.push(["shen", 166, 45, 1, 0, p > .2 && p < .6]); }
    else if (m === "shenOut"){ open = p < .12; A.push(["zhou", lerp(150, -20, seg(p, .1, 1)), 42, p > .1 ? -1 : 1, p > .1 ? st : 0], ["shen", lerp(166, -8, seg(p, .1, 1)), 45, -1, p > .1 ? st : 0]); }
    else if (m === "hoodIn"){ sopen = p < .14; A.push(["hood", lerp(11, 166, seg(p, .06, 1)), 41, 1, p < 1 ? st : 0]); }
    else if (m === "hoodDoor"){ led = p > .3; open = p > .55; if (p < .8) A.push(["hood", 166, 41, 1, 0, p > .15 && p < .55]); }
    else if (m === "cao"){ oclosed = p > .96; const x = p < .32 ? lerp(39, 80, p / .32) : p < .62 ? 80 : lerp(80, 39, seg(p, .62, .94)); if (p < .96) A.push(["cao", x, 41, p < .62 ? 1 : -1, (p < .32 || p > .62) ? st : 0, p > .34 && p < .62]); }
    else if (m === "hoodOut"){ open = p < .14; sopen = p > .9; if (p < .97) A.push(["hood", lerp(166, 11, seg(p, .08, .95)), 41, -1, p > .08 ? st : 0]); }
    else if (m === "hoodIn2"){ sopen = p < .1; led = p > .74; open = p > .84; if (p < .93) A.push(["hood", lerp(11, 166, seg(p, .05, .68)), 41, 1, p < .68 ? st : 0, p > .7 && p < .84]); }
    MONO = true; DIM = dim;
    try { SC.c37_hall({ dim, open, sopen, led, oclosed });
      A.forEach(a => fig(a[1], F, a[2], a[0], a[3], a[4], a[5]));
      for (let y = 0; y < H; y += 3) PR.R(0, y, W, 1, "rgba(0,0,0,.07)");
    } finally { MONO = false; DIM = false; }
  };

  /* ---------- 槍械室監視器的畫面（黑白）：從正上方往下拍的平面。
     上面的牆是一整排槍櫃（x70–150，27 號在第三行 x90–99）；左邊是櫃台（x14–74、y54–62），秦福生的椅子在櫃台的裡面（44, 40）；門在左下（x4、y76–92）；右邊是工作台。 */
  const topMan = (x, y, k, lean) => { x = Math.round(x); y = Math.round(y);
    if (k === "hood"){ R(x - 6, y - 3, 12, 7, "#2a2e32"); R(x - 4, y - 4, 8, 8, "#383c42"); R(x - 2, y - 2, 4, 4, "#44484e"); }
    else { R(x - 6, y - 3, 12, 7, "#3a5a8a"); R(x - 3, y - 4 - (lean ? 3 : 0), 6, 6, "#a8a8a2"); if (lean) R(x - 2, y - 2, 4, 3, "#d8b090"); } };
  SC.c37_top = (o) => { o = Object.assign({}, o, stOf(o)); const p = o._p || 0, m = o.mode || "sleep", t = o.t || 0;
    MONO = true; DIM = false;
    try {
      R(0, 0, W, H, "#8a9096"); for (let x = 6; x < W; x += 12) R(x, 0, 1, H, "#7e848a"); for (let y = 6; y < H; y += 12) R(0, y, W, 1, "#7e848a");
      R(0, 0, W, 6, "#3a3e44"); R(0, 0, 6, H, "#3a3e44"); R(186, 0, 6, H, "#3a3e44"); R(0, 102, W, 6, "#3a3e44");
      R(0, 76, 6, 16, m === "enter" || m === "exit" ? "#c8ccd0" : "#6a7078");   // 門
      // 槍櫃（上面的牆）
      R(68, 6, 84, 12, "#4a5058"); for (let c = 0; c < 8; c++){ R(70 + c * 10, 7, 9, 10, "#7a828a"); R(70 + c * 10, 16, 9, 1, "#98a0a8"); }
      const cellOpen = m === "take" || m === "put"; if (cellOpen){ R(90, 7, 9, 10, "#1a1c20"); R(88, 18, 2, 8, "#98a0a8"); }
      // 工作台
      R(163, 39, 23, 42, "#4a4e54"); R(164, 40, 22, 40, "#b4b8bc"); R(166, 46, 5, 5, "#e8e8e0"); R(167, 47, 3, 3, "#8a8e92"); R(172, 60, 10, 8, "#f4f0e0"); R(177, 60, 1, 8, "#8a8a8a"); R(175, 44, 1, 12, "#6a5a3a"); R(178, 43, 1, 13, "#6a5a3a");
      // 椅子和秦福生
      const awake = m === "awake", up = m === "wake" && p > .6, stamp = m === "stamp";
      R(37, 30, 14, 5, "#2e3238"); R(37, 35, 14, 12, "#454a54");
      if (stamp) topMan(44, 46, "qin", false); else topMan(44, 41, "qin", !(awake || up));
      // 櫃台
      R(14, 54, 60, 9, "#8a6a4a"); R(14, 54, 60, 1, "#a88a68");
      R(16, 56, 4, 5, awake ? "#a8d0f0" : "#1e1e22");   // 手機
      R(22, 56, 5, 5, "#f4f0e0");   // 藥袋
      R(38, 55, 12, 7, "#f4f0e0"); R(44, 55, 1, 7, "#8a8a8a");   // 登記簿
      R(52, 56, 8, 5, "#dfe0d8"); R(62, 55, 5, 7, "#1a1a1e"); R(68, 55, 5, 7, "#1a1a1e");
      if (m === "wake" && Math.floor(t * 4) % 2 === 0) R(30, 56, 3, 3, "#ffe060"); else R(30, 56, 3, 3, "#5a5a5e");   // 內線的燈
      if (stamp){ R(41, 51, 3, 3, "#c83a2a"); if (p > .3) P(46, 57, "#c83a2a"); if (p > .65) P(46, 60, "#c83a2a"); }
      // 穿雨衣的人
      const DOOR = [10, 84], CELL = [95, 25], DESK = [44, 70]; let q = null, paper = false, pen = false, gun = false;
      if (m === "enter") q = [lerp(DOOR[0], CELL[0], p), lerp(DOOR[1], CELL[1], p)];
      else if (m === "take" || m === "put"){ q = CELL; gun = (m === "take") ? p > .5 : p < .5; }
      else if (m === "toDesk") q = [lerp(CELL[0], DESK[0], p), lerp(CELL[1], DESK[1], p)];
      else if (m === "trace"){ q = DESK; paper = p < .62; pen = true; }
      else if (m === "exit") q = [lerp(DESK[0], DOOR[0], p), lerp(DESK[1], DOOR[1], p)];
      if (q){ topMan(q[0], q[1], "hood");
        if (m === "take" || m === "put"){ R(q[0] - 1, q[1] - 9, 2, 5, "#2a2e32"); R(q[0] - 1, q[1] - 10, 2, 2, "#d0d0c8"); if (gun) R(q[0] + 2, q[1] - 9, 4, 2, "#101214"); }
        if (pen){ R(q[0] - 1, q[1] - 9, 2, 5, "#2a2e32"); R(q[0] - 1, q[1] - 10, 2, 2, "#d0d0c8"); P(q[0], q[1] - 11, "#101214"); } }
      if (paper){ R(37, 54, 14, 9, "#ffffff"); R(37, 54, 14, 1, "#c8c8c8"); }
      for (let y = 0; y < H; y += 3) PR.R(0, y, W, 1, "rgba(0,0,0,.07)");
    } finally { MONO = false; }
  };

  /* ---------- 人物造型 ---------- */
  const AL = id => (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null;
  const XU = Object.assign({ skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" }, AL("xu") || {});
  const SHEN = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const LOOK = {
    wu:   Object.assign({ skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", glasses:true, top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050" }, AL("wu") || {}, { hello:"知夏姊。" }),
    shen: Object.assign({}, SHEN, { mood:"tired", cupColor:"#f4f0e0", hello:"知夏。" }),
    li:   Object.assign({ skin:"#e8c09a", hair:"#1e1e1e", hairStyle:"slick", top:"#ffffff", bottom:"#1e2230" }, AL("li") || {}, { hello:"許鑑識員。" }),
    qin:  { age:"old", skin:"#d8a880", hair:"#9a9a94", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", mood:"sad", hello:"許小姐。" },
    cao:  { skin:"#d8a880", hair:"#3a3430", hairStyle:"short", top:"#e9e4da", coat:"#4a5a6a", bottom:"#2a2f3a", mood:"tired", hello:"……許鑑識員。" },
    liu:  { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", hello:"許小姐。" },
    zhou: Object.assign({ age:"old", skin:"#d8a880", hair:"#6a6a66", hairStyle:"slick", top:"#e9e4da", coat:"#62666e", bottom:"#2a2f3a", tie:"#3a4a6a" }, AL("zhou") || {}, { hello:"知夏。" }),
    abin: Object.assign({ skin:"#d8a880", hair:"#2a2a2a", hairStyle:"short", top:"#e85a3a", bottom:"#3a4a6a", hat:"cap", capColor:"#2a2a2a" }, AL("abin") || {}, { apron:"#7a4a2a", hello:"許小姐，早。" })
  };
  const DAILY = {
    wu:   [ { room:"armory", x:140, pose:"write", doing:"拿著夾板，跟在你的後面記。" }, { room:"bench", x:60, pose:"write", doing:"站在工作台的旁邊，在貼樣本瓶的標籤。" } ],
    shen: [ { room:"seat", x:34, pose:"sit", doing:"坐在最左邊的那一張桌子，面前一杯黑咖啡。" }, { room:"seat", x:34, pose:"sit", doing:"坐在同一個位子上。咖啡沒有動過。" } ],
    li:   [ { room:"meet", x:150, pose:"write", doing:"站在矮櫃的旁邊，在筆記本上寫字。" }, { room:"meet", x:124, pose:"stand", doing:"站在會議桌的另一頭，在等十二點。" } ],
    qin:  [ { room:"armory", x:126, pose:"stand", doing:"站在槍櫃的前面，兩隻手不知道要放在哪裡。" }, { room:"armory", x:126, pose:"stand", doing:"站在槍櫃的前面，一格一格地看。" } ],
    cao:  [ { room:"hall", x:94, pose:"hold@can", doing:"站在販賣機的旁邊，手上拿著一罐沒有打開的咖啡。" }, { room:"hall", x:94, pose:"stand", doing:"站在販賣機的旁邊。" } ],
    liu:  [ { room:"lobby", x:122, pose:"stand", doing:"站在值班台的後面。" }, { room:"lobby", x:122, pose:"write", doing:"站在值班台的後面，在寫日誌。" } ],
    zhou: [ { room:"lobby", x:40, pose:"cross", doing:"站在公布欄的前面，背對著大門。" }, { room:"hall", x:134, pose:"stand", doing:"站在走廊的窗戶旁邊，在等。" } ],
    abin: [ { room:"seat", x:84, pose:"stand", doing:"站在小黑板的旁邊，在擦桌子。" }, { room:"seat", x:84, pose:"stand", doing:"站在小黑板的旁邊，在寫今天的菜單。" } ]
  };
  EP37.suspects.forEach(s => {
    if (LOOK[s.id]){ if (LOOK[s.id].hello) s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP37.rooms = {
    police: [
      { id:"hall", name:"3F 走廊", scene:"c37_hall", opt:{}, details:[
        { id:"d37_cam", name:"天花板下面的監視器", hot:[20,4,11,9], text:"裝在後樓梯的門上面，順著整條走廊拍過去。\n外殼還很新。這一支，是去年十月才裝的。\n在那以前，這一條走廊上，一支都沒有。" },
        { id:"d37_4417", name:"牆上的公用分機", hot:[51,34,17,26], text:"掛在牆上的內線電話。上面的牌子：「4417」。\n誰經過，都可以拿起來打。\n它掛在這裡，很多年了。" },
        { id:"d37_vend", name:"販賣機", hot:[72,36,16,38], text:"賣罐裝咖啡和茶的販賣機。只收硬幣。\n晚上，整條走廊最亮的就是它。\n站在它的前面，看得到槍械室的門。" },
        { id:"d37_office", name:"刑事大隊的門", hot:[31,19,17,40], text:"門開著。\n靠窗的那一張桌子，椅子推得很整齊。桌上的筆筒、檯燈、一疊卷宗，都在原來的地方。\n沒有人去動它。" },
        { id:"d37_bench", name:"窗邊的長椅", hot:[122,21,25,30], text:"窗戶的外面，是後面的停車場。\n從這裡看不到後門：它在這一面牆的正下方。" } ] },
      { id:"armory", name:"3F 槍械室", scene:"c37_arm", opt:(ph) => ({ hh:10, mm:ph ? 40 : 5 }), details:[
        { id:"d37_rule", name:"門邊的告示", hot:[3,15,13,10], text:"「槍枝領繳須知」\n「一、本人持卡開啟槍櫃。」\n「二、本人於登記簿簽名。」\n「三、<b>管理員當面清點後簽收。</b>」\n第三條的下面，有人用紅筆畫了一條線。是新的。" },
        { id:"d37_chair", name:"管理員的椅子", hot:[35,38,13,12], text:"一張高背的辦公椅，有扶手。\n椅背往後調到了最斜的那一格。\n坐下去，頭剛好靠得到。" },
        { id:"d37_dome", name:"天花板上的攝影機", hot:[114,3,10,7], text:"半球形的攝影機，裝在天花板的正中間，鏡頭朝下。\n它看得到每一格槍櫃、整個櫃台。\n它看不到的，只有一樣：站在它下面的人的臉。" },
        { id:"d37_cells", name:"其他的槍櫃", hot:[124,16,32,28], text:"去年七月換的電子槍櫃。四十八格。\n刷自己的卡，只開得了自己的那一格。\n每一格的門上，只有一個號碼。" },
        { id:"d37_rods", name:"工作台上的通條", hot:[183,51,5,9], text:"兩支清槍管用的通條，一支銅刷。\n公用的。用完要擦乾淨，插回筒子裡。\n都在。都是乾的。" } ] },
      { id:"meet", name:"3F 督察組會議室", scene:"c37_meet", opt:(ph, has) => ({ fax:!!(has && has("e37_tel")), hh:10, mm:ph ? 20 : 0 }), details:[
        { id:"d37_board", name:"白板", hot:[57,11,58,32], text:"黎光耀的字。\n「3/19」\n「18:03」是藍色的。\n「21:31」「22:48」是紅色的，後面各打了一個問號。" },
        { id:"d37_blind", name:"百葉窗", hot:[5,11,42,36], text:"百葉窗拉到了底。\n這一間會議室，問話的時候，都是這樣。" },
        { id:"d37_cups", name:"保溫瓶和紙杯", hot:[119,50,15,9], text:"一個保溫瓶，兩個紙杯。\n兩個都是空的。他沒有幫自己倒，也沒有幫你倒。" } ] },
      { id:"lobby", name:"1F 值班台", scene:"e_lobby", opt:{ night:false }, details:[
        { id:"d37_log", name:"外出登記簿", hot:[118,44,14,8], text:"值班台上的外出登記簿，翻回了 3 月 19 日的那一頁。\n「18:03　沈岳　配槍繳回槍械室」\n「18:05　沈岳　退勤」\n下面，沒有了。" },
        { id:"d37_b1", name:"往地下室的樓梯", hot:[154,60,38,30], text:"往地下室的樓梯。車庫和證物室，都在下面。\n往樓上的樓梯，在大廳的另一邊：上樓的人，都要從值班台的前面走過去。" },
        { id:"d37_wanted", name:"公布欄", hot:[24,22,26,20], text:"石文雄的通緝書還在。\n旁邊貼了一張新的：「槍械室領繳時間　即日起 21:00 以後須兩人同行」。\n日期是 3 月 21 日。" } ] },
      { id:"rear", name:"後門・員工停車場", scene:"c37_rear", opt:{}, details:[
        { id:"d37_rcam", name:"門上面的監視器", hot:[29,1,13,9], text:"後門上面的那一支，朝著員工的車位。\n畫面存三十天。\n它的正下方，是一塊拍不到的地方。" },
        { id:"d37_gate", name:"側門", hot:[176,44,14,32], text:"圍牆上的一道小門，鐵柵只到腰。\n外面是一條單行的巷子，通到中正路的後面。\n巷子裡，沒有路燈。" },
        { id:"d37_scoot", name:"機車棚裡的機車", hot:[120,58,38,18], text:"藍色的那一台，車牌框上貼著刑事大隊的停車證：曹志翔的。車很新，地上是乾淨的。\n灰色的那一台，是總務的。" },
        { id:"d37_bays", name:"員工的車位", hot:[60,80,56,20], text:"三個車位，都是空的。\n門上面的那一支監視器，對著的就是這裡。" } ] }
    ],
    cafe: [
      { id:"seat", name:"海風咖啡・外面的座位", scene:"c37_cafe", opt:(ph, has) => ({ time:ph ? "morning" : "noon", note:!!(has && has("o37_sample")) }), details:[
        { id:"d37_station", name:"對面的警察局", hot:[122,22,56,30], text:"馬路的對面，就是警察局。\n從這一張桌子，看得到三樓的那一排窗戶。\n他每天，就是坐在這裡看。" },
        { id:"d37_menu", name:"小黑板", hot:[66,52,14,14], text:"「今日：黑咖啡　烏龍　滷蛋（莊媽媽）」\n字是用粉筆寫的，有一點歪。" },
        { id:"d37_window", name:"店裡的櫃台", hot:[6,30,26,22], text:"隔著窗戶看進去，櫃台拆了一半。\n新的木板疊在上面，還沒有釘。" },
        { id:"d37_dog", name:"桌腳的狗", hot:[110,89,20,10], text:"豆花趴在桌腳，下巴貼著地。\n牠的鼻子，朝著最左邊的那一張桌子。" },
        { id:"d37_su", name:"最右邊的那一桌", hot:[146,72,24,12], text:"一份摺好的報紙，一杯喝了一半的咖啡。\n蘇律師每天都坐這一桌。\n他沒有抬頭。" } ] }
    ],
    lab: [
      { id:"bench", name:"鑑識中心", scene:"c37_lab", details:[
        { id:"d37_scope", name:"比對顯微鏡", hot:[28,44,16,18], text:"比對顯微鏡。\n3 月 20 日下午，你就是在這裡，把兩顆彈頭並排著看的。\n你看了三次。三次都一樣。" },
        { id:"d37_screen", name:"螢幕", hot:[128,40,30,26], text:"螢幕上，是那一份比對報告的存檔。\n最下面一行：「鑑定人：許知夏」。" },
        { id:"d37_tea", name:"工作台上的茶杯", hot:[85,55,9,8], text:"你的茶杯。烏龍，已經涼了。\n杯子的把手，朝著正右方。你每一次放下來，都是這個方向。" } ] }
    ]
  };
  EP37.phases[0].scene = "c37_hall"; EP37.phases[0].sceneOpt = {};
  EP37.phases[1].scene = "c37_lab"; EP37.phases[1].sceneOpt = {};

  /* ---------- 監視器動畫 ---------- */
  const strip = L => { const o = Object.assign({}, L || {}); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  const HOOD = { skin:"#1c1e22", hair:"#24262a", hairStyle:"short", hood:"#2a2c30", top:"#24262a", coat:"#24262a", bottom:"#1c1e22", gloves:"#c8c8c0" };   // 只有雨衣、帽子、手套：臉和顏色都不可以看得出來
  EP37.looks = { shenC:strip(SHEN), hoodC:HOOD, wuC:strip(LOOK.wu), zhouC:strip(LOOK.zhou) };
  const mk = (scene, opt, cam, date, beats, clean) => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join);
    return { scene, opt:Object.assign({}, opt, { ds, seq:beats.map(b => b.st || {}) }), cam, date, clean, beats:beats.map(b => { const o = Object.assign({}, b); delete o.st; return o; }) }; };
  const ANIM = {
    cctv37_hall: mk("c37_hcam", {}, "3F 走廊", "2027-03-19", [
      { t:"18:02:40", d:4.5, cap:"18:02:40，兩個人走到槍械室的門口：沈岳，周振邦。", st:{ mode:"shenIn" }, m:{} },
      { t:"18:02:51", d:4, join:true, cap:"18:02:51，沈岳站在門前的第一條線上，刷卡，進去。周振邦在門口等。", st:{ mode:"shenDoor" }, m:{} },
      { t:"18:04:50", d:4, cap:"18:04:50，沈岳出來。兩個人一起往大廳的樓梯走。", st:{ mode:"shenOut" }, m:{} },
      { t:"21:30:50", d:5, cap:"21:30:50，走廊的燈關了一半。後樓梯的門開了：一個穿連帽雨衣的人，低著頭。", st:{ mode:"hoodIn", dim:true }, m:{} },
      { t:"21:31:10", d:4, join:true, cap:"21:31:10，那個人站在同一條線上，刷卡，進去。門關上。", st:{ mode:"hoodDoor", dim:true }, m:{} },
      { t:"21:33:10", d:6, cap:"21:33:10，刑事大隊的門開了。曹志翔穿著襯衫，在販賣機買了一罐咖啡，回辦公室。槍械室的門，一直關著。", st:{ mode:"cao", dim:true }, m:{} },
      { t:"21:35:25", d:5, cap:"21:35:25，槍械室的門開了。穿雨衣的人出來，走回後樓梯。", st:{ mode:"hoodOut", dim:true }, m:{} },
      { t:"22:47:40", d:5.5, cap:"22:47:40，同一件雨衣。22:48:02，刷卡，進槍械室。", st:{ mode:"hoodIn2", dim:true }, m:{} },
      { t:"22:50:10", d:5, cap:"22:50:10，出來，走回後樓梯。四次從鏡頭的下面走過去，那個人沒有抬過一次頭。", st:{ mode:"hoodOut", dim:true }, m:{} }
    ]),
    cctv37_arm: mk("c37_top", {}, "槍械室", "2027-03-19", [
      { t:"21:00:30", d:3.5, cap:"21:00:30，秦福生巡完槍櫃，坐回椅子上，拿起手機。", st:{ mode:"awake" }, m:{} },
      { t:"21:14:00", d:3.5, cap:"21:14，手機的螢幕暗了。他的頭往後仰，靠在椅背上。之後，沒有再動過。", st:{ mode:"sleep" }, m:{} },
      { t:"21:31:12", d:4.5, cap:"21:31:12，門開了。一頂雨衣的帽子。那個人沒有走向牆上的配置表，直接走到槍櫃的第四排。", st:{ mode:"enter" }, m:{} },
      { t:"21:31:48", d:3.5, join:true, cap:"21:31:48，刷卡。27 號的門彈開。手套伸進去，拿出一把槍、一個彈匣。", st:{ mode:"take" }, m:{} },
      { t:"21:32:20", d:3.5, join:true, cap:"21:32:20，那個人走到櫃台，站在秦福生的旁邊：不到一公尺。", st:{ mode:"toDesk" }, m:{} },
      { t:"21:32:40", d:6, join:true, cap:"他把一張白紙鋪在登記簿上，用筆在上面慢慢地描。然後把紙拿開，在同一個地方，再寫一次。", st:{ mode:"trace" }, m:{} },
      { t:"21:35:20", d:4, join:true, cap:"21:35:20，他按了出門的按鈕，走了。那一張紙，他帶走了。秦福生沒有動。", st:{ mode:"exit" }, m:{} },
      { t:"22:48:05", d:4, cap:"22:48:05，同一頂帽子，直接走向 27 號。", st:{ mode:"enter" }, m:{} },
      { t:"22:48:30", d:3.5, join:true, cap:"22:48:30，刷卡，把槍和彈匣放了回去。", st:{ mode:"put" }, m:{} },
      { t:"22:49:00", d:5, cap:"又是那一張紙，又描了一次。22:50:05，走了。", st:{ mode:"trace" }, m:{} },
      { t:"23:00:10", d:5, cap:"23:00:10，櫃台上內線的燈開始閃。閃了一分多鐘，秦福生才坐直，接起來。", st:{ mode:"wake" }, m:{} },
      { t:"05:57:00", d:5, cap:"隔天 05:57，交班以前。秦福生翻開登記簿，看了很久。然後，他拿起印章，蓋了兩次。", st:{ mode:"stamp" }, m:{} }
    ])
  };
  [...EP37.cctv, ...EP37.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案 ---------- */
  const mkR = beats => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join); const seq = beats.map(b => b.st || {});
    return beats.map(b => { const o = Object.assign({}, b, { opt:Object.assign({}, b.opt || {}, { ds, seq }) }); delete o.st; return o; }); };
  const F = 98;
  const RB = mkR([
    { t:"18:03", d:5, cap:"3 月 19 日，18:03。沈岳繳了槍。秦福生點收、蓋章。周振邦在門口等。18:05，兩個人一起下樓。", scene:"c37_hcam", st:{ mode:"shenDoor" }, m:{} },
    { t:"21:14", d:4.5, cap:"21:14。吃了感冒藥的秦福生，在櫃台後面的椅子上睡著了。", scene:"c37_top", st:{ mode:"sleep" }, m:{} },
    { t:"21:29", d:5.5, cap:"21:29。下雨了。有人把機車停在機車棚最裡面的那一格，貼著牆走到後門。讀卡機讀到的，是沈岳的卡號。", scene:"c37_rear", opt:{ night:true, rain:true, bike:true, drips:true, empty:false, led:true }, m:{ hoodC:[46, F, "stand", -1, 150, F] } },
    { t:"21:31", d:5, cap:"21:31。那個人從後樓梯走進三樓的走廊。同一扇門的前面，他比沈岳矮了十公分。", scene:"c37_hcam", st:{ mode:"hoodIn2", dim:true }, m:{} },
    { t:"21:32", d:5.5, cap:"他沒有看配置表，直接打開了 27 號。然後在登記簿上鋪了一張紙，把「沈岳」兩個字描了上去。", scene:"c37_top", st:{ mode:"trace" }, m:{} },
    { t:"21:33", d:5, cap:"21:33。曹志翔在走廊上買咖啡。那個人，還在槍械室的裡面。", scene:"c37_hcam", st:{ mode:"cao", dim:true }, m:{} },
    { t:"21:35", d:5, cap:"21:35。他帶著那一把槍，從後樓梯走了。槍在外面待了七十七分鐘。22:15 前後，港濱路，一槍。", scene:"c37_hcam", st:{ mode:"hoodOut", dim:true }, m:{} },
    { t:"22:44", d:5, cap:"22:44。沈岳在家裡接了小吳的電話。", scene:"c36_home", opt:{}, m:{} },
    { t:"22:48", d:5, cap:"22:48。四點六公里以外，槍回到了 27 號。槍管擦過，上了油；彈匣補了一顆子彈。", scene:"c37_top", st:{ mode:"put" }, m:{} },
    { t:"22:52", d:5, cap:"22:52。沈岳站在自己家的樓下。小吳的車，剛好轉進來。", scene:"c36_home", opt:{}, m:{ shenC:[70, F, "stand", 1] } },
    { t:"05:57", d:5, cap:"隔天 05:57。秦福生看到登記簿上多了兩行。他怕人家知道他睡著，補蓋了兩個章。", scene:"c37_top", st:{ mode:"stamp" }, m:{} }
  ]);
  const arcSet = (f, how) => { try { if (typeof S !== "undefined" && S && S.done && typeof C !== "undefined" && C && C.id === "hereyes" && typeof ARC !== "undefined" && !ARC.has(f)) ARC.set(f, "hereyes", how); } catch (e) {} };
  const perfect = () => { try { return !!(typeof S !== "undefined" && S && S.done && S.result && S.result.verdict === "perfect"); } catch (e) { return false; } };
  const flags = () => { if (perfect()) arcSet("gun_swapped", "found"); };
  EP37.court = {
    title: "三樓督察組會議室・3 月 23 日 中午", scene: "c37_meet", opt:{ fax:true, hh:12, mm:0 },
    who: ph => ["li", "wu"],
    open: ph => "十二點整。黎光耀把筆記本翻到新的一頁，筆帽拔開。「許鑑識員。第一個問題：3 月 19 日晚上，那一把槍，發生了什麼事？」",
    kindLine: {
      self: "沈岳自己回來領走了槍，後來又自己還了回去。",
      never: "槍沒有離開過槍械室。那兩筆紀錄，是系統出的錯。",
      copy: "有人拿著另一張卡，用他的名字領走，又還了回去。那個人，不是沈岳。",
      inside: "局裡有人幫忙：把槍交了出去，又收了回來。"
    },
    kindTrue: "（黎光耀的筆停在紙上。他沒有抬頭。「第二個問題：憑什麼。一樣一樣講。」）",
    murmur: [ "（小吳把夾板抱在胸口，站得很直。）", "（黎光耀寫字的聲音，很慢，很平均。）", "（門的外面，走廊上，有人在等。）" ],
    confess: {},
    cornered: {},
    deny: {
      qin: "（同一個時間，槍械室。秦福生站在槍櫃的前面，把四十八格又點了一遍。有人在會議室裡講了他的名字，他不知道。）",
      cao: "（同一個時間，走廊。曹志翔站在販賣機的旁邊，手上那一罐咖啡，還是沒有打開。有人在會議室裡講了他的名字，他不知道。）"
    },
    replayText: "3 月 19 日，18:03，三樓的走廊——",
    replay: { scene:"c37_hcam", opt:{}, clean:true, cam:"經過重現", date:"2027-03-19", beats:RB },
    get endGood(){ flags(); return "黎光耀寫完最後一行，把筆帽蓋上。\n「不是他拿的。」他說。「這五個字，我會寫在送給檢察官的公文上。」\n小吳的肩膀，一下子鬆了下來。\n「可是，許鑑識員。」黎光耀把筆記本轉過來，指著最下面空白的那一格。「妳證明的是：誰<b>沒有</b>拿。誰拿的，這一格還是空的。」\n「而且，檢察官可以這樣說：他不用自己去拿。」\n" + (EP37_has("c_told_xu") ? "「那一格，我會填。」你說。「不是因為我認識他。是因為那一格是空的。」\n" : "「空的格子，我會填。」你說。\n") + "你走出會議室。走廊的窗戶旁邊，周振邦站在那裡。他什麼都沒有問。\n你點了一下頭。\n他把手錶從手腕上拿下來，看了一眼，又戴了回去。"; },
    get endBad(){ flags(); return "黎光耀聽完，把筆記本合了起來。\n「妳給我的，我沒有辦法寫。」\n「紀錄上，21:31 領槍的人，還是沈岳。在有人拿出別的東西以前，它就是這樣。」\n小吳低著頭，把夾板上的每一頁，又翻了一遍。\n你走出會議室。走廊的盡頭，槍械室的門關著。\n東西都還在那裡。門禁的報表，登記簿，走廊的畫面，推車上的那一把槍。\n它們沒有變。是你，還沒有把它們看完。"; }
  };

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP37.fac = { police:["#cfcabb", "#3f5a7a"], cafe:["#e8dcc4", "#2a7a8a"], lab:["#e2e8e8", "#3a7a8a"] };
  EP37.setting = { police:"city", cafe:"city", lab:"city" };
  EP37.outScenes = ["c37_rear", "c37_cafe"];
  EP37.skyTo = { c37_rear:0, c37_cafe:0 };
  // 兩天都是晴天：雨在 3 月 20 日早上就停了
  const SKY37 = [ ["#9cc4e4", "#d8e8f0", "#7a7a76", "#6a6a66", 0, 0], ["#9cc8e8", "#f4ecd8", "#7a7a76", "#6a6a66", 0, 0] ];
  EP37.worldSky = ph => SKY37[Math.min(ph || 0, SKY37.length - 1)];
  EP37.worldOrder = { police:["hall", "armory", "meet", "lobby", "rear"], cafe:["seat"], lab:["bench"] };
  EP37.roomDesc = {
    hall:"三樓的走廊。最裡面那一扇灰色的鋼門，就是槍械室。", armory:"槍械室。四十八格槍櫃，一張櫃台。", meet:"三樓，督察組的會議室。百葉窗拉到了底。",
    lobby:"一樓值班台。往地下室的樓梯在右邊。", rear:"後門和員工停車場。機車棚在最裡面。",
    seat:"海風咖啡外面的座位。馬路的對面，就是警察局。", bench:"鑑識中心。你的工作台。"
  };
  const say = (who, text, name) => ({ say:[who, text], name });
  EP37.world = {};
  EP37.locations.forEach(l => { EP37.world[l.id] = { auto:true, you:XU, order:(EP37.worldOrder || {})[l.id] }; });
  Object.assign(EP37.world.police, {
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:66, bx:44, face:1 } },
      say("wu", "知夏姊。槍械室在最裡面。老秦在裡面等，督察組叫他不要走。", "小吳"),
      say("you", "先量門。", "你")
    ]
  });
  EP37.world.cafe.extras = [
    { id:"x37_mom", name:"莊美鳳", x:116 + 126, L:Object.assign({ age:"old", skin:"#d8a880", hair:"#4a4440", hairStyle:"bob", top:"#7a9a7a", bottom:"#3a3a44" }, AL("abinmom") || {}, { apron:"#e8e0d0" }), pose:"hold@tray", facing:-1,
      lines:["許小姐，妳也吃一顆滷蛋。他那一盤，我每天都放，他每天都只吃半顆。", "這個人喔，停職了，還是每天七點半到。比我們開門還準時。"] },
    { id:"x37_su", name:"蘇律師", x:116 + 167, L:{ skin:"#e8c8a8", hair:"#2a2220", hairStyle:"slick", top:"#e9e4da", coat:"#24324e", bottom:"#24324e", tie:"#7a2a2a", glasses:true }, pose:"sit+read", facing:-1,
      lines:["（他把報紙翻了一頁。沒有抬頭。）"] }
  ];
  EP37.mapPos = { police:[170,44,"u"], cafe:[150,72,"d"], lab:[104,24,"u"] };
  EP37.mapRoads = [["police","lab"],["police","cafe"]];
  EP37.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 14; x < 226; x += 8) for (let y = 10; y < 96; y += 7){ R(x, y, 6, 5, "#c8c0b0"); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, "#b0a898"); }
    const rd = "#d8d4c8";
    R(20, 52, 220, 5, rd); R(200, 52, 5, 48, rd); R(52, 96, 153, 5, rd); R(52, 60, 5, 40, rd); R(102, 30, 4, 24, rd); R(150, 57, 4, 12, rd);
    R(0, 104, 240, 31, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 106 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");
    R(206, 100, 20, 4, "#8a8678"); R(210, 92, 12, 8, "#c8d0c8");   // 魚市
    R(112, 94, 3, 2, "#7a7e72"); R(128, 86, 8, 10, "#7a7e72");   // 港濱路口、71 號
  };
})();
