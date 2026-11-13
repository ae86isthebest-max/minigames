/* =========================================================
   第 9 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP9.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, OBJ, windowBox, door, sign, lamp, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l), sky = (a, b, h) => PR.sky(a, b, h);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const kf = (v, p) => Array.isArray(v) ? (() => { if (v.length === 1) return v[0]; const k = p * (v.length - 1), i = Math.min(v.length - 2, Math.floor(k)); return v[i] + (v[i + 1] - v[i]) * (k - i); })() : v;
  const stOf = o => { if (!o.ds) return [{}, 0]; const [i, p] = beatAt(o.t || 0, o.ds); return [(o.seq || [])[i] || {}, p]; };
  const fog = (x, y, w, h, a) => { const g = PR.g(); g.fillStyle = `rgba(220,226,230,${a})`; g.fillRect(x, y, w, h); if (a >= 0.5) for (let i = 0; i < w * h / 90; i++) P(x + (i * 37) % w, y + (i * 53) % h, "#eef2f4"); };
  const wood = (y, h, c, c2) => { R(0, y, W, h, c); for (let x = 0; x < W; x += 12) R(x, y, 1, h, c2); };
  const tub = (x, y, w, water) => { R(x, y, w, 20, "#b8864a"); R(x + 2, y + 2, w - 4, 4, water || "#7ab0b8"); for (let k = 4; k < w; k += 10) R(x + k, y + 6, 1, 14, "#9a6a3a"); R(x, y, w, 2, "#d8a868"); };
  const heater = (x, y, flame) => { R(x, y, 26, 30, "#e8e8e0"); R(x + 2, y + 2, 22, 10, "#c8c8c0"); R(x + 4, y + 4, 10, 5, "#1a2a1a"); txt("E52", x + 4, y + 9, flame === 2 ? "#ff4a2a" : "#6fd46f", "4px monospace"); R(x + 8, y - 8, 8, 8, "#8a8a8a"); R(x + 6, y - 10, 12, 3, "#5a5a5a");
    if (flame) for (let k = 0; k < 4; k++) P(x + 9 + k * 2, y + 20 - (k % 2), flame === 2 ? "#e8a040" : "#4a8ae8"); R(x + 4, y + 30, 3, 6, "#c8a040"); };

  /* ---------- 場景 ---------- */
  // 大廳・櫃台
  SC.i_lobby = (o) => {
    wall(72, "#d8c8a8", true); wood(64, 8, "#6b4a2b", "#5a3e24");
    R(16, 54, 40, 12, "#6b4a2b"); R(14, 52, 44, 3, "#8a6a3a"); R(22, 49, 12, 3, "#f4f0e0"); R(60, 54, 70, 12, "#7a5533"); R(58, 52, 74, 3, "#9a6a3a"); R(62, 48, 22, 6, "#f4f0e0"); R(64, 50, 18, 1, "#3a3a3a");   // 留言本、櫃台、預約表
    R(118, 12, 44, 28, "#2a2a2e"); R(120, 14, 40, 24, "#1a2a2a"); for (let k = 0; k < 24; k += 2) R(120, 14 + k, 40, 1, "#00000033"); R(130, 20, 4, 14, "#5a4a3a"); R(146, 20, 4, 14, "#5a4a3a");   // 走廊監視器螢幕
    R(170, 14, 18, 40, "#c8d8e0"); fog(170, 14, 18, 40, 0.6);   // 霧濛濛的窗
    R(84, 8, 30, 10, "#3a2a1a"); txt("雲靄山莊", 86, 16, "#e8c878", "6px serif");
    R(10, 20, 20, 24, "#e8dcc0"); R(12, 22, 16, 20, "#6a8a6a"); R(14, 30, 12, 8, "#c8d8d8");   // 山水畫
    R(136, 44, 14, 12, "#8a6a3a"); R(138, 46, 10, 9, "#f4f0e0"); for (let k = 0; k < 3; k++) R(139, 48 + k * 2, 8, 1, "#3a3a3a");   // 交班本
    R(104, 48, 12, 4, "#2a2a2e"); P(106, 49, "#e04a3a");   // 總機
    lamp(96, 0, "#f8d898");
    floor(72, "#8a6a4a", "#7a5a3a");
  };
  // 湯屋走廊（也給監視器用）
  const DOOR = { zhu:50, song:110, back:172 };
  SC.i_corr = (o) => {
    wall(74, "#e8dcc0", true); wood(66, 8, "#6b4a2b", "#5a3e24");
    [[DOOR.zhu, "竹", "#3a6a3a"], [DOOR.song, "松", "#2a4a2a"]].forEach(([x, n, c]) => { door(x - 12, 32, 24, 42, "#8a6a3a"); R(x - 12, 26, 24, 7, c); txt(n, x - 3, 32, "#f4f0e0", "7px serif"); R(x - 14, 28, 2, 46, "#5a3e24"); R(x + 12, 28, 2, 46, "#5a3e24"); });
    door(DOOR.back - 10, 32, 20, 42, "#5a5e64"); R(DOOR.back - 8, 26, 16, 5, "#2a8a4a");   // 後門
    R(0, 30, 24, 30, "#c8d8e0"); fog(0, 30, 24, 30, 0.7);
    for (let k = 0; k < 3; k++) R(68 + k * 8, 60, 6, 6, ["#3a6ab8", "#c23a2a", "#e8c040"][k]);   // 拖鞋架
    lamp(80, 0, "#f8d898"); lamp(150, 0, "#f8d898");
    floor(74, "#8a6a4a", "#7a5a3a");
    if (!o.noMud){ for (let k = 0; k < 7; k++){ const x = 182 - k * 10, y = 88 + (k % 2) * 4, a = k < 3 ? "#5a4028" : k < 5 ? "#6a5038" : "#7a6048"; R(x, y, 5, 2, a); R(x + 1, y - 1, 3, 1, a); } }   // 後門內側的泥巴拖鞋腳印（往「松」那邊越來越淡）
  };
  // 湯屋「松」
  SC.i_song = (o) => {
    wall(72, "#a8b8a8", false); for (let y = 0; y < 72; y += 8) for (let x = (y / 8) % 2 * 8; x < W; x += 16) R(x, y, 15, 7, "#b8c8b8");   // 磁磚
    R(150, 14, 30, 26, "#6b4a2b"); R(152, 16, 26, 22, o.winOpen === false ? "#e8e8e0" : "#c8d8e0"); if (o.winOpen !== false){ fog(152, 16, 26, 22, 0.8); R(164, 16, 2, 22, "#6b4a2b"); }
    R(100, 4, 18, 12, "#c8c8c0"); R(102, 6, 14, 8, "#8a8a8a"); R(108, 6, 2, 8, "#5a5a5a"); R(102, 10, 14, 2, "#5a5a5a"); R(118, 8, 6, 4, "#f4e48a");   // 排風扇、便條
    floor(72, "#8a8a80", "#7a7a72");
    tub(56, 70, 80, o.cold ? "#8ab0b0" : "#7ab0b8"); for (let k = 0; k < 6; k++) P(60 + k * 12, 68 - (k % 2) * 2, "#e8ecee");
    R(26, 70, 16, 4, "#9a6a3a"); R(30, 66, 4, 4, "#e8e0c8"); R(36, 68, 3, 2, "#e8e0c8");   // 清酒托盤
    if (o.body){ R(82, 64, 10, 9, "#e89a8a"); R(82, 63, 10, 2, "#1a1410"); R(80, 72, 16, 4, "#e8a090"); R(86, 66, 2, 2, "#c23a2a"); R(84, 64, 3, 1, "#8a5a5a"); }
    if (o.markers){ OBJ.marker(60, 100); OBJ.marker(150, 96); }
    fog(0, 0, W, 72, 0.12);
  };
  // 湯屋「竹」
  SC.i_zhu = (o) => {
    wall(72, "#b8c8b0", false); for (let y = 0; y < 72; y += 8) for (let x = (y / 8) % 2 * 8; x < W; x += 16) R(x, y, 15, 7, "#c8d8c0");
    R(150, 20, 30, 40, "#a8b8a0"); R(150, 58, 30, 2, "#1a1a1a");   // 共用的牆、煙灰線
    windowBox(16, 14, 24, 20, "#c8d8e0");
    floor(72, "#8a8a80", "#7a7a72"); tub(60, 70, 70); R(30, 82, 40, 6, "#9a9a90");
  };
  // 屋後・熱水器
  SC.i_back = (o) => { const sheet = o.sheet;
    R(0, 0, W, H, "#5a6a6a"); R(0, 0, W, 74, "#8a8a80"); for (let y = 0; y < 74; y += 6) R(0, y, W, 1, "#7a7a72");   // 外牆
    windowBox(150, 14, 26, 22, "#3a4a4a");   // 湯屋「松」的窗（從外面看）
    heater(44, 40, o.flame);
    R(52, 26, 10, 6, "#4a4a4a"); R(48, 22, 40, 20, "#2a2a2a44"); dither(46, 18, 46, 26, "#1a1a1a", 3);   // 排氣口和燻黑
    if (sheet){ const g = PR.g(); g.fillStyle = "rgba(220,235,240,.45)"; g.fillRect(30, 10, 130, 64); R(30, 10, 2, 64, "#8a6a3a"); R(158, 10, 2, 64, "#8a6a3a"); R(30, 10, 130, 2, "#8a6a3a"); }
    else { for (let k = 0; k < 10; k++){ P(32, 14 + k * 6, "#3a3a3a"); P(158, 14 + k * 6, "#3a3a3a"); P(36 + k * 12, 12, "#3a3a3a"); } R(34, 14, 2, 50, "#c8c8b8"); R(156, 14, 2, 50, "#c8c8b8"); R(150, 40, 3, 4, "#e8f0f0"); }
    if (o.gas){ for (let k = 0; k < 30; k++) P(40 + (k * 31) % 110, 14 + (k * 17) % 56, "#6a6a6a"); }
    door(166, 36, 20, 38, "#5a5e64");
    R(0, 74, W, 34, "#5a4a3a"); dither(0, 74, W, 34, "#4a3a2a", 3);   // 泥巴地
    if (!o.clean){ for (let k = 0; k < 8; k++) R(60 + k * 14, 84 + (k % 2) * 6, 5, 3, "#3a2a1a"); R(168, 88, 7, 3, "#3a6ab8"); R(176, 88, 7, 3, "#3a6ab8"); }
    fog(0, 0, 60, 30, 0.85); fog(0, 0, W, H, o.fogA || 0.25);
  };
  // 倉庫
  SC.i_store = (o) => {
    wall(72, "#8a7a6a", false);
    for (let r = 0; r < 3; r++){ R(100, 20 + r * 16, 80, 2, "#5a4a3a"); for (let k = 0; k < 5; k++) R(104 + k * 15, 10 + r * 16, 12, 10, ["#c8a878", "#a8c8d8", "#e8e0c8"][k % 3]); }
    R(120, 40, 30, 16, "#c8a878"); for (let k = 0; k < 6; k++) R(122 + (k % 3) * 9, 42 + Math.floor(k / 3) * 7, 7, 5, "#f4f4f4");   // 警報器的箱子
    R(40, 54, 40, 18, "#d8e8ec"); R(44, 58, 30, 8, "#e8f0f4"); R(56, 60, 8, 5, "#2a2a2a"); R(36, 69, 50, 3, "#8a6a3a");   // 塑膠布、木條
    R(10, 40, 26, 32, "#c8a878");
    R(104, 30, 12, 8, "#3a6ab8"); R(106, 31, 3, 6, "#f4f4f0");   // 說明書
    lamp(96, 0, "#e8e0c8");
    floor(72, "#6a5a4a", "#5a4a3a");
  };
  // 羅家的客房
  SC.i_room = (o) => {
    wall(72, "#e8dcc0", true); R(0, 64, W, 8, "#8a6a3a");
    R(60, 60, 80, 12, "#c8b890"); R(60, 56, 80, 6, "#f4f0e0"); R(62, 54, 20, 4, "#f4f4f4");   // 榻榻米上的被褥
    R(100, 56, 14, 8, "#6b4a2b"); R(102, 53, 6, 3, "#f4f4f4");   // 床頭櫃、藥
    R(26, 56, 28, 10, "#2a2a2e"); R(28, 54, 24, 3, "#f4f0e0");   // 公事包
    R(146, 62, 18, 10, "#8a3a4a"); R(150, 58, 10, 4, "#6a2a3a"); R(148, 60, 14, 2, "#f4f0e0");   // 手提包（離婚協議書）
    R(119, 58, 8, 5, "#f4f4f4"); R(120, 59, 6, 1, "#c23a2a");   // 降血壓藥
    R(150, 14, 30, 30, "#c8d8e0"); fog(150, 14, 30, 30, 0.6);
    R(20, 14, 30, 24, "#2a2a2e"); R(22, 16, 26, 18, "#3a5a7a");   // 電視
    lamp(96, 0, "#f8e8c8");
    floor(72, "#c8b890", "#b8a880");
  };
  // 卡拉 OK・餐廳
  SC.i_kara = (o) => {
    wall(72, "#6a3a5a", false); dither(0, 0, W, 72, "#7a4a6a", 4);
    R(40, 20, 40, 30, "#1a1a1e"); R(42, 22, 36, 24, "#3a2a6a"); for (let k = 0; k < 3; k++) R(46, 28 + k * 5, 24 - k * 4, 2, "#e8c040");   // 螢幕
    R(100, 50, 70, 14, "#6b4a2b"); R(98, 48, 74, 3, "#8a6a3a"); for (let k = 0; k < 4; k++) R(106 + k * 16, 44, 6, 4, "#e8e0c8");
    R(20, 60, 50, 12, "#c23a5a"); R(18, 56, 54, 6, "#a82a4a");   // 沙發
    R(25, 52, 16, 6, "#b8905a"); R(25, 52, 16, 1, "#8a6a3a");   // 牛皮紙袋
    for (let k = 0; k < 12; k++) P(10 + k * 16, 4 + (k % 3) * 3, ["#e8c040", "#3ac8e8", "#e83a8a"][k % 3]);
    floor(72, "#4a2a3a", "#3a2030");
  };
  // 案發經過重現：湯屋（左）＋外牆＋熱水器（右）
  SC.i_cut = (o) => { const [s, p] = stOf(o), gas = (s.gas || 0) + (s.gasUp ? p : 0);
    R(0, 0, 112, 98, "#a8b8a8"); for (let y = 0; y < 98; y += 8) for (let x = (y / 8) % 2 * 8; x < 112; x += 16) R(x, y, 15, 7, "#b8c8b8");
    R(112, 0, 6, 98, "#6a6a62");   // 牆
    R(118, 0, 74, 98, "#5a6a6a"); heater(150, 46, s.flame || 0);
    const sh = s.sheet === true ? 1 : kf(s.sheet || 0, p);   // 塑膠棚：1＝整片圍著，越小越少（一片一片扯下來）
    if (sh > 0.02){ const g = PR.g(), w = Math.round(64 * sh); g.fillStyle = "rgba(220,235,240,.4)"; g.fillRect(188 - w, 16, w, 82); R(188 - w, 16, w, 1, "#8a6a3a"); R(188, 16, 1, 82, "#8a6a3a"); if (sh > 0.9) R(124, 16, 1, 82, "#8a6a3a"); }
    { const wo = kf(s.win || 0, p);   // 湯屋的窗戶（裡面看、外面看都是同一扇）：漆死（白色油漆封邊）→ 撬開
      [[96, 14], [118, 14]].forEach(([x, w]) => { R(x, 64, w, 13, "#6a7a6a"); R(x + 1, 65, w - 2, 11, wo > 0.5 ? "#1a2a2a" : "#c8d8d0");
        if (wo <= 0.5){ R(x, 64, w, 1, "#f4f4f0"); R(x, 76, w, 1, "#f4f4f0"); R(x + (w >> 1), 65, 1, 11, "#f4f4f0"); } else R(x + 1, 65, 4, 11, "#c8d8d0"); }); }
    if (gas > 0) for (let k = 0; k < Math.round(gas * 60); k++){ const inside = k % 3 !== 0; P(inside ? 126 + (k * 29) % 60 : 4 + (k * 37) % 104, 20 + (k * 13) % 70, "#5a5a5a"); }
    R(0, 98, 112, 10, "#8a8a80"); R(118, 98, 74, 10, "#5a4a3a");
    tub(14, 78, 80); txt("松", 4, 8, "#2a4a2a", "7px serif");
    fog(118, 0, 74, 98, 0.35);
  };
  // 池子前面那片木板：泡在水裡的人，下半身被擋住（所有人都在前景後面）
  SC.i_cut.frontY = 120;
  SC.i_cut.front = () => { const g = PR.g(); g.fillStyle = "rgba(122,176,184,.6)"; g.fillRect(16, 80, 76, 4); R(14, 84, 80, 14, "#b8864a"); for (let k = 4; k < 80; k += 10) R(14 + k, 84, 1, 14, "#9a6a3a"); R(14, 84, 80, 1, "#d8a868"); };

  /* ---------- 文字有提到的小東西（畫出來，跟文字一致） ---------- */
  const wrap9 = (n, fn) => { const b = SC[n]; SC[n] = Object.assign((o) => { b(o); fn(o); }, b); };
  wrap9("i_lobby", () => { R(22, 46, 6, 6, "#f4f0e6"); R(23, 44, 4, 3, "#f4f0e6"); P(23, 43, "#f4f0e6"); P(26, 43, "#f4f0e6"); R(28, 44, 2, 3, "#f4f0e6"); P(24, 45, INK); P(26, 45, INK); R(23, 49, 4, 1, "#c23a2a"); P(25, 50, "#e8c43a");   // 招財貓（手卡住）
    R(66, 61, 16, 4, "#f4f0e6"); R(67, 60, 14, 1, "#e8e0d0"); R(70, 62, 6, 1, "#2a6a3a"); });   // 櫃台下面壓著的信
  wrap9("i_song", () => { R(3, 24, 14, 18, "#f4f0e6"); R(3, 24, 14, 3, "#c23a2a"); for (let i = 0; i < 4; i++) R(5, 29 + i * 3, 10 - (i % 2) * 3, 1, "#3a3a3a"); });   // 門後的告示
  wrap9("i_zhu", () => { R(18, 41, 16, 1, "#5a5a5a"); P(20, 42, "#5a5a5a"); P(30, 42, "#5a5a5a"); R(26, 42, 6, 8, "#2a6a5a"); R(26, 46, 6, 1, "#e8e4d8"); P(28, 48, "#e8c43a"); });   // 掛鉤上的登山毛巾
  wrap9("i_back", (o) => { for (let i = 0; i < 5; i++){ const x = 2 + i * 6; R(x, 30, 2, 40, i % 2 ? "#4a6a3a" : "#5a7a4a"); for (let j = 34; j < 70; j += 8) P(x, j, "#2a3a22"); R(x + 2, 32 + i * 5, 3, 1, "#6a8a5a"); } if (o.fogA) dither(0, 30, 30, 40, "#e8eef2", o.fogA > 0.2 ? 2 : 3); });   // 竹林
  wrap9("i_room", () => { R(18, 44, 14, 6, "#e8ecee"); R(20, 45, 10, 3, "#c8d0d4"); R(24, 41, 2, 3, "#a8a8a8"); R(28, 44, 2, 1, "#e8c43a"); P(29, 43, "#f8e070");   // 洗手台和婚戒
    R(64, 54, 6, 3, "#1e1e22"); R(65, 54, 4, 2, "#c8a060"); P(66, 54, "#3a3a3a"); });   // 被褥上的手機
  SC.c9_clinic = (o) => { SC.hospital(o);
    R(152, 22, 26, 16, "#f4f4f0"); R(152, 22, 26, 3, "#2f7a6a"); for (let i = 0; i < 4; i++){ R(154, 27 + i * 3, 22, 1, "#c8c8c0"); R(156, 26 + i * 3, 6, 2, "#5a5a5a"); } R(166, 32, 8, 2, "#d23a3a");   // 值班表
    R(22, 20, 26, 24, "#e8f0e8"); R(22, 20, 26, 4, "#2f7a6a"); R(26, 27, 18, 8, "#c8d8c8"); R(30, 29, 6, 4, "#e04a3a"); R(26, 37, 18, 1, "#3a3a3a"); R(26, 40, 12, 1, "#3a3a3a");   // 牆上的海報
    R(102, 52, 16, 8, "#c8a050"); R(103, 53, 14, 6, "#f4f4f0"); R(108, 51, 4, 2, "#8a8a8a"); R(105, 55, 10, 1, "#5a5a5a"); R(105, 57, 7, 1, "#5a5a5a"); };   // 夜間急診紀錄的夾板
  SC.c9_shop = (o) => { SC.shop(o);
    R(152, 42, 16, 7, "#5a3a2a"); R(154, 43, 6, 5, "#2a2a2a"); R(161, 43, 5, 3, "#c8b070"); R(166, 38, 1, 4, "#c8c8c8");   // 收音機
    R(62, 52, 20, 6, "#f4f0e6"); R(62, 52, 20, 1, "#d8d0c0"); R(64, 54, 12, 1, "#5a5a5a"); R(64, 56, 8, 1, "#5a5a5a"); R(78, 55, 3, 2, "#c23a2a"); };   // 出貨單
  SC.c9_police = (o) => { SC.police(o);
    R(62, 12, 36, 22, "#e8e4d0"); R(64, 14, 32, 18, "#bcd8a8"); R(70, 14, 3, 18, "#8ab0d8"); R(64, 24, 32, 2, "#d8c890"); R(80, 18, 10, 8, "#9ac088"); R(83, 20, 4, 4, "#d23a3a"); R(84, 21, 2, 2, "#bcd8a8");   // 地圖，紅筆圈起來的地方
    R(62, 60, 20, 5, "#c8a050"); R(63, 59, 18, 1, "#e8c870"); R(66, 62, 10, 1, "#7a5a2a"); };   // 去年的消防檢查報告

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    zhiming:{ skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#e9e4da", coat:"#3a4a3a", bottom:"#2a2a30", mood:"worried", hello:"……客人出了事，我們也很難過。",
              byPhase:{ 1:{ mood:"tired" }, 2:{ mood:"sad" } } },
    guorong:{ age:"old", skin:"#c8986a", hair:"#c8c8c0", hairStyle:"balding", top:"#5a6a5a", bottom:"#3a3a30", hello:"我做了四十年旅館。" },
    du:   { skin:"#f0c8a8", hair:"#3a2a20", hairStyle:"long", top:"#c8a8c8", bottom:"#4a3a4a", skirt:true, mood:"sad", hello:"他只是去泡個湯……" },
    lan:  { age:"old", skin:"#d8a880", hair:"#5a5a5a", hairStyle:"bun", top:"#c8b8e8", bottom:"#3a3a3a", apron:"#f4f4f4", hello:"我只是掃地的，我什麼都不知道……好啦，我知道一點。" },
    hou:  { age:"old", skin:"#d8a880", hair:"#3a3a3a", hairStyle:"slick", top:"#c83a3a", bottom:"#2a2a30", hello:"我跟他吵架是一回事，我沒殺人！" },
    yun:  { skin:"#f4d4bc", hair:"#2a2220", hairStyle:"pony", top:"#3a5a4a", bottom:"#2a2a30", mood:"tired", hello:"我頭還有一點痛……" },
    ke:   { skin:"#e8c09a", hair:"#1a1410", hairStyle:"short", top:"#e86a2a", bottom:"#3a4a3a", hat:"cap", capColor:"#2a5a3a", hello:"我那時候以為是水太燙。" },
    zeng: { age:"old", skin:"#c8986a", hair:"#e8e8e0", hairStyle:"short", top:"#8a8a7a", bottom:"#3a3a30", apron:"#2a4a6a", hello:"要買什麼？" },
    gao:  { skin:"#c8986a", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", hello:"沈警官，辛苦你了。我們這種小地方……" },
    xu:   { hello:"休假。我們本來是在休假。" },
    qian: { hello:"我本來是來泡湯的。" },
    wu:   { hello:"學長，這是我抽中的住宿券耶……" }
  };
  ["xu","qian","wu"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  // 休假：不穿白袍
  Object.assign(LOOK.wu, { top:"#e8a040", coat:null }); Object.assign(LOOK.qian, { top:"#c8e0c8", coat:null }); Object.assign(LOOK.xu, { top:"#8a8e94", bottom:"#3a4050", coat:null });
  const DAILY = {
    zhiming:[ { room:"ilobby", x:96, pose:"phone", doing:"在櫃台講電話，一直在擦汗。" }, { room:"icorr", x:140, pose:"stand", doing:"站在湯屋走廊，擋著不讓客人靠近。" }, { room:"ilobby", x:96, pose:"write", doing:"在櫃台寫退房的帳單，手在抖。" } ],
    guorong:[ null, { room:"ilobby", x:40, pose:"sit", doing:"坐在大廳的長椅上，看著窗外的霧。" }, { room:"iback", x:120, pose:"cross", doing:"站在屋後，盯著那面牆。" } ],
    du:   [ { room:"iroom", x:120, pose:"cry", doing:"坐在客房裡哭。" }, { room:"iroom", x:120, pose:"phone", doing:"在客房打電話通知家人。" }, { room:"ilobby", x:150, pose:"sit", doing:"坐在大廳，等檢察官上山。" } ],
    lan:  [ null, { room:"izhu", x:90, pose:"broom", doing:"在刷湯屋「竹」的地板。" }, { room:"icorr", x:120, pose:"broom", doing:"在掃走廊，一直往「松」的門口看。" } ],
    hou:  [ { room:"ikara", x:60, pose:"sit", doing:"坐在卡拉 OK 的沙發上，一臉不高興。" }, { room:"ikara", x:60, pose:"smoke", doing:"在卡拉 OK 門口抽菸。" }, { room:"ilobby", x:170, pose:"cross", doing:"在大廳等著下山。" } ],
    yun:  [ { room:"ilobby", x:60, pose:"sit", doing:"坐在櫃台旁邊，臉色很白。" }, { room:"ilobby", x:60, pose:"stand", doing:"在櫃台值班，常常揉太陽穴。" }, { room:"ilobby", x:60, pose:"stand", doing:"在櫃台幫客人退房。" } ],
    ke:   [ { room:"ilobby", x:30, pose:"sit", doing:"抱著登山包坐在大廳。" }, { room:"ikara", x:140, pose:"read", doing:"在餐廳看地圖，等路通。" } ],
    zeng: [ null, { room:"vshop", x:120, pose:"stand", doing:"在店裡整理螺絲。" } ],
    gao:  [ null, { room:"proom", x:120, pose:"phone", doing:"在派出所講電話，在問路什麼時候修好。" } ],
    xu:   [ { room:"isong", x:40, pose:"kneel", doing:"蹲在湯屋門口，打開她帶來的小箱子。" }, { room:"iback", x:80, pose:"kneel", doing:"蹲在屋後的泥巴地上看腳印。" }, { room:"ilobby", x:150, pose:"read", doing:"坐在大廳，一直看著手機。" } ],
    qian: [ { room:"isong", x:120, pose:"kneel", doing:"蹲在浴池邊，看著死者的皮膚。" }, { room:"ikara", x:100, pose:"drink", doing:"在餐廳喝茶，嘆氣。" } ],
    wu:   [ { room:"icorr", x:80, pose:"stand", doing:"站在湯屋走廊，用手機照明。" }, { room:"icorr", x:80, pose:"stand", doing:"在走廊等你。" } ]
  };
  EP9.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });
  const L0 = id => { const L = Object.assign({}, LOOK[id]); delete L.hello; delete L.byPhase; return L; };
  EP9.looks = {
    zmL: L0("zhiming"), duL: L0("du"), yunL: L0("yun"), keL: Object.assign(L0("ke"), { prop:"bag" }),
    luoL: { age:"old", skin:"#d8a880", hair:"#3a3a3a", hairStyle:"balding", top:"#e8e8e0", bottom:"#3a5a8a", prop:"bag" },
    luoB: { age:"old", skin:"#e8a890", hair:"#3a3a3a", hairStyle:"balding", top:"#e8a890", bottom:"#e8e8e0" }
  };

  /* ---------- 房間和隱藏小細節 ---------- */
  EP9.rooms = {
    inn: [
      { id:"ilobby", name:"大廳・櫃台", scene:"i_lobby", details:[
        { id:"d9_cat", name:"櫃台的招財貓", hot:[20,46,10,6], text:"招財貓的手一直在招，招到一半卡住了。陳芸說，牠從上禮拜就這樣了。" },
        { id:"d9_loan", name:"櫃台下面的信", label:"櫃台", hot:[64,60,20,6], text:"櫃台下面壓著一疊信，最上面一封是農會的：「貸款繳款通知　第三次」。" } ] },
      { id:"icorr", name:"湯屋走廊", scene:"i_corr", details:[
        { id:"d9_slip", name:"拖鞋架", hot:[66,58,26,8], text:"拖鞋架上少了一雙藍白拖。每一雙拖鞋背面都用奇異筆寫著員工的名字。" } ] },
      { id:"isong", name:"湯屋「松」", scene:"i_song", opt:(ph,has)=>({ body:ph===0, markers:ph===0, cold:ph>0 }), details:[
        { id:"d9_sign", name:"門後的告示", hot:[0,20,20,30], text:"門後貼著：「泡湯請勿超過 40 分鐘，飲酒後請勿泡湯。」紙很新，是今年才貼的。" } ] },
      { id:"izhu", name:"湯屋「竹」", scene:"i_zhu", details:[
        { id:"d9_towel", name:"掛鉤", hot:[16,40,20,10], text:"掛鉤上掛著一條忘了拿走的登山毛巾，上面繡著「柯」。" } ] },
      { id:"iback", name:"屋後・熱水器", scene:"i_back", opt:(ph,has)=>({ flame:0, fogA:ph===2 ? 0.1 : 0.3 }), details:[
        { id:"d9_bamboo", name:"竹林", hot:[0,30,30,40], text:"竹林裡一點聲音都沒有。山上的人說，這種霧叫「死霧」，一點風都不起。" } ] },
      { id:"istore", name:"倉庫", scene:"i_store", details:[
        { id:"d9_shelf", name:"架上的箱子", label:"架子", hot:[100,10,80,40], text:"一箱一箱的浴巾、清酒、備用拖鞋。最上面一層有一個寫著「民國 75 年」的舊招牌：「雲靄旅社」。" } ] },
      { id:"iroom", name:"羅家的客房", scene:"i_room", details:[
        { id:"d9_photo", name:"手機桌布", hot:[60,54,20,4], text:"被褥上放著羅文昌的另一支手機，桌布是他和一隻柴犬的合照。" },
        { id:"d9_ring", name:"洗手台", hot:[20,40,10,10], text:"洗手台邊放著一枚婚戒，是杜美玲的。她說：「我今天早上拿下來的。」" } ] },
      { id:"ikara", name:"卡拉 OK・餐廳", scene:"i_kara", details:[
        { id:"d9_mic", name:"麥克風", hot:[100,44,70,6], text:"桌上兩支麥克風，一支上面貼著「錢」，一支貼著「侯」。老錢說是侯老闆自己貼的，他不跟別人共用。" } ] }
    ],
    clinic: [ { id:"clroom", name:"霧溪衛生所", scene:"c9_clinic", details:[
      { id:"d9_nurse", name:"值班表", hot:[150,20,30,20], text:"值班表上，每天晚上都只有一個護士。7/11 那一格寫著：「阿惠（加班）」。" } ] } ],
    village: [ { id:"vshop", name:"曾記五金", scene:"c9_shop", opt:{ noCar:true }, details:[
      { id:"d9_radio", name:"收音機", hot:[150,40,20,10], text:"收音機在播路況：「霧溪聯外道路明日上午恢復通行。」" } ] } ],
    post: [ { id:"proom", name:"霧溪派出所", scene:"c9_police", details:[
      { id:"d9_map", name:"牆上的地圖", hot:[60,10,40,24], text:"牆上的地圖，紅筆圈著十年前出事的那家民宿。旁邊寫著：「一氧化碳　3 救 1」。" } ] } ]
  };

  /* ---------- 監視器動畫 ---------- */
  const DY = 74;
  const ANIM = {
    cctv_corridor: { scene:"i_corr", opt:{ noMud:true }, cam:"CORRIDOR", date:"2026-07-11", beats:[
      { t:"19:58:20", d:3.5, cap:"一個背登山包的年輕人走進湯屋「竹」。", m:{ keL:[DOOR.zhu,DY,null,1,-14,98,[[DOOR.zhu,98]]] }, out:["keL"] },
      { t:"20:41:10", d:4, cap:"他從「竹」出來，扶著牆，走得歪歪的。", m:{ keL:[-20,98,null,-1,DOOR.zhu,DY,[[DOOR.zhu,98],[30,92],[10,98]]] }, out:["keL"] },
      { t:"20:58:30", d:4, cap:"羅文昌拿著浴巾和一小瓶清酒，走進「松」，關上門。", m:{ luoL:[DOOR.song,DY,"carry:R@bottle/#e8e4d8&cloth/#f4f4f0",1,-14,98,[[DOOR.song,98]]] }, out:["luoL"] },
      { t:"21:30:00", d:2.5, cap:"（21:00 到 22:05，沒有任何人走近「松」的門。）" },
      { t:"22:06:10", d:2, cap:"杜美玲敲「松」的門，敲了很久。", m:{ duL:[DOOR.song - 6,96,null,1,-14,98] } },
      { t:"22:06:30", d:3, join:true, cap:"杜美玲敲「松」的門，敲了很久。", m:{ duL:[DOOR.song - 6,96,["back+knock","back","back+knock","back","back+knock","back+knock"],1] } },
      { t:"22:08:00", d:3, cap:"陳芸拿著鑰匙跑過來。", m:{ yunL:[DOOR.song + 8,96,"carry:R@key/#c8a040",-1,-14,98], duL:[DOOR.song - 14,98,"cross",1] } },
      { t:"22:10:05", d:4, cap:"門打開。陳芸走進去，很快又退出來，蹲在地上。", m:{ yunL:[DOOR.song + 4,98,"kneel",-1,DOOR.song + 8,96,[[DOOR.song,98],[DOOR.song,DY],[DOOR.song,98]]], duL:[DOOR.song - 14,98,"cry",1] } },
      { t:"22:12:00", d:3, cap:"呂志明跑進來。", m:{ zmL:[DOOR.song - 2,DY,null,1,-14,98,[[DOOR.song - 2,98]]] }, out:["zmL"] },
      { t:"22:15:20", d:3.5, cap:"呂志明從走廊盡頭的後門出去。", m:{ zmL:[DOOR.back,DY,null,1,DOOR.song,DY,[[DOOR.song,98],[DOOR.back,98]]] }, out:["zmL"] },
      { t:"22:33:10", d:4, cap:"呂志明從後門回來，褲管和拖鞋都是泥巴。", m:{ zmL:[DOOR.song - 2,98,"stand",-1,DOOR.back,DY,[[DOOR.back,98]]] } }
    ] }
  };
  [...EP9.cctv, ...EP9.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });
  const PS = [["i_song",{ phase:0, body:true, markers:true }],["i_back",{ phase:1, fogA:0.35 }],["i_lobby",{ phase:2 }]];
  EP9.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 結案 ---------- */
  const RB = [
    { t:"20:15:00", d:5, cap:"7/11 晚上，一點風都沒有。熱水器排出來的廢氣，被塑膠棚圍住，散不出去，又被吸了回去。面板跳出「E-52」。", st:{ sheet:true, flame:2, gas:0.1, gasUp:true } },
    { t:"20:58:30", d:3, cap:"20:58，羅文昌走進湯屋「松」。排風扇從 7/5 就壞了，窗戶是漆死的。", st:{ sheet:true, flame:2, gas:0.6 }, m:{ luoB:[8,98,null,1,-10,98] } },
    { t:"20:59:00", d:2, join:true, cap:"20:58，羅文昌走進湯屋「松」。排風扇從 7/5 就壞了，窗戶是漆死的。", st:{ sheet:true, flame:2, gas:0.6 }, m:{ luoB:[54,90,"sit",1,8,98] } },
    { t:"21:30:00", d:5, cap:"他喝了一點酒，泡在熱水裡。一氧化碳沒有顏色，沒有味道。他只覺得有點睏。", st:{ sheet:true, flame:2, gas:0.8, gasUp:true }, m:{ luoB:[54,90,"sit+drink:R@cup/#e8e4d8",1] } },
    { t:"21:50:00", d:4.5, cap:"他靠在池邊，睡著了。再也沒有醒來。", st:{ sheet:true, flame:2, gas:1.6 }, m:{ luoB:[50,90,"lie",1,54,90] } },
    { t:"22:15:20", d:2, cap:"22:15，呂志明聽了父親的話，從後門出去，把塑膠棚一片一片扯下來。", st:{ sheet:true, flame:2, gas:0.8 }, m:{ zmL:[180,98,null,-1,200,98], luoB:[50,90,"lie",1] } },
    { t:"22:16:00", d:4.5, join:true, cap:"22:15，呂志明聽了父親的話，從後門出去，把塑膠棚一片一片扯下來。", st:{ sheet:[1,0.75,0.5,0.25,0], flame:2, gas:0.8 }, m:{ zmL:[180,98,["reach","drag","reach","drag","reach","drag"],-1], luoB:[50,90,"lie",1] } },
    { t:"22:31:00", d:3, cap:"他關掉熱水器，再從外面撬開那扇漆死的窗戶。然後回到走廊上說：「他大概是喝醉滑倒了。」", st:{ flame:2, gas:0.4 }, m:{ zmL:[162,98,"back+reach",1,180,98], luoB:[50,90,"lie",1] } },
    { t:"22:31:30", d:3.5, join:true, cap:"他關掉熱水器，再從外面撬開那扇漆死的窗戶。然後回到走廊上說：「他大概是喝醉滑倒了。」", st:{ flame:0, gas:0.3, win:[0,0,0,1] }, m:{ zmL:[138,98,"reach:R@pipe/#5a5a5a",-1,162,98], luoB:[50,90,"lie",1] } },
    { t:"22:33:00", d:2.5, join:true, cap:"他關掉熱水器，再從外面撬開那扇漆死的窗戶。然後回到走廊上說：「他大概是喝醉滑倒了。」", st:{ flame:0, gas:0.2, win:1 }, m:{ zmL:[200,98,"carry@pipe/#5a5a5a",1,138,98], luoB:[50,90,"lie",1] }, out:["zmL"] }
  ];
  EP9.court = {
    title: "雲靄山莊大廳・7 月 13 日上午", scene: "i_lobby",
    who: ph => ["zhiming","guorong","du","hou","yun"],
    open: ph => "霧散了一點，窗外看得到竹林了。你請大家坐在大廳。老錢、許知夏和小吳站在你後面——本來，你們是來泡湯的。",
    kindLine: {
      accident: "羅文昌不是被殺的。他是在熱水裡，吸進了看不見的一氧化碳。可是，有人在他死了以後，把真相藏了起來。",
      murder: "羅文昌是被人害死的。",
      illness: "羅文昌是喝了酒泡溫泉，心臟病發死的。"
    },
    murmur: [ "（呂志明一直盯著自己的拖鞋。）", "（侯振南抱著手臂，哼了一聲。）", "（呂國榮看著牆上那塊老招牌。）" ],
    confess: {
      zhiming: [ "客人一直說冷……我只是想讓走廊暖一點。", "我打給我爸，他說：「先把棚子拆了，窗戶打開，什麼都不要說。」", "我扯塑膠布的時候，聞到那個味道，就知道了。是我害死他的。" ],
      guorong: [ "這家旅館，是我阿爸在民國七十五年蓋的。", "我在電話裡只想到一件事：不能讓它倒。", "……我叫我兒子去做的。是我。" ]
    },
    cornered: { zhiming: "……那六個警報器，我真的有想要裝。", guorong: "一個棚子而已……一個棚子而已。" },
    deny: {
      du: "我只是去找他……我只是去找他。",
      hou: "我說過了，我那時候在唱歌！",
      yun: "我扶他的時候……他的手還是溫的。"
    },
    replayText: "7 月 4 日，呂志明在湯屋後面的牆上，釘上最後一根木條，退後兩步看了看：「這樣客人就不會冷了。」一個禮拜以後——",
    replay: { scene:"i_cut", opt:{ seq:RB.map(b => b.st), ds:jds(RB) }, clean:true, cam:"案發經過重現", date:"2026-07-11", beats:RB },
    endGood: "中午，檢察官上了山。呂志明和呂國榮被依業務過失致死和湮滅證據移送。\n下山的路上，你們在溫泉街停了一下。許知夏走進曾記五金，買了一個一氧化碳警報器，放進小吳的背包：「你家的熱水器，裝在陽台上，對吧？」",
    endBad: "檢察官上了山，翻了翻報告：「喝酒泡湯，滑倒，意外。」\n一個禮拜後，雲靄山莊重新開放。湯屋「松」的排風扇，還是沒有修。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[9] && ARC_INTER[9].after) EP9.after = ARC_INTER[9].after;

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP9.outScenes = ["i_back"];
  EP9.fac = { inn:["#d8c8a8","#3a2a1a"], clinic:["#e6ecea","#2f7a6a"], village:["#a8865a","#5a2a1e"], post:["#cfcabb","#3f5a7a"] };
  EP9.setting = { inn:"town", clinic:"town", village:"town", post:"town" };
  const SKY9 = [ ["#1a2028","#3a4450","#2a3430","#30383a",0,0], ["#a8b0b4","#d8dcde","#6a7a70","#7a8a80",0,0], ["#b8c8d0","#e8ecee","#5a7a60","#6a8a70",0,0] ];
  EP9.worldSky = ph => SKY9[Math.min(ph || 0, SKY9.length - 1)];
  EP9.roomDesc = {
    ilobby:"雲靄山莊的大廳。窗外一片白，什麼都看不到。", icorr:"往湯屋的走廊。兩扇木門：「竹」和「松」，盡頭是後門。",
    isong:"湯屋「松」。檜木浴池，小小的木窗。", izhu:"湯屋「竹」。和「松」共用一面牆。", iback:"湯屋後面。熱水器裝在外牆上，地上全是泥巴。",
    istore:"倉庫。堆滿了浴巾和清酒。", iroom:"羅家住的客房。", ikara:"卡拉 OK 兼餐廳。燈光是紫色的。",
    clroom:"霧溪衛生所。只有一個護士值班。", vshop:"曾記五金。什麼都賣。", proom:"霧溪派出所。只有三個人。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#6a8aa0", bottom:"#3a3328" };
  const say = (who, text, name) => ({ say:[who, text], name });
  EP9.world = {};
  EP9.locations.forEach(l => { EP9.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP9.world.inn, {
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長……我們不是來泡湯的嗎？", "小吳"),
      say("wu", "死者羅文昌，52 歲，營造公司老闆。21:00 一個人進湯屋「松」，22:10 被發現。門是鎖著的，鑰匙在他身上。", "小吳"),
      say("wu", "少東說他大概是喝醉了，滑倒。路斷了，救護車和警察都上不來。高所長說，拜託我們先看。", "小吳"),
      say("you", "門鎖著，鑰匙在身上。如果是意外，那就證明它是意外。", "你"),
      say("wu", "老錢已經在裡面了。許知夏說她只帶了一個小箱子……今晚只能在山莊裡查，明天才能去村子裡。", "小吳"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  EP9.mapPos = { inn:[120,50,"u"], clinic:[80,90,"l"], village:[110,96,"d"], post:[150,100,"r"] };
  EP9.mapRoads = [["inn","village"],["village","clinic"],["village","post"]];
  EP9.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#4a6a4a"); dither(0, 0, 240, 135, "#3a5a3a", 3);
    for (let k = 0; k < 6; k++){ const x = k * 44; for (let y = 0; y < 40; y++) R(x + y / 2, 40 - y, 44 - y, 1, "#2a4a3a"); }   // 山
    R(80, 84, 90, 30, "#8a7a6a"); dither(80, 84, 90, 30, "#7a6a5a", 3);   // 溫泉街
    R(112, 70, 3, 20, "#6a5a4a"); R(100, 60, 2, 30, "#6a5a4a");
    const g = PR.g ? null : null;
    for (let k = 0; k < 80; k++) R((k * 37 + t * 6) % 240, (k * 17) % 135, 6, 2, "#d8dce0");   // 霧
  };
})();
