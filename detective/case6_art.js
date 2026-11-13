/* =========================================================
   第 6 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP6.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, OBJ, windowBox, door, lamp, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const kf = (v, p) => Array.isArray(v) ? (() => { if (v.length === 1) return v[0]; const k = p * (v.length - 1), i = Math.min(v.length - 2, Math.floor(k)); return v[i] + (v[i + 1] - v[i]) * (k - i); })() : v;
  const stOf = o => { if (!o.ds) return [{}, 0]; const [i, p] = beatAt(o.t || 0, o.ds); return [(o.seq || [])[i] || {}, p]; };
  const clip = (x, y, w, h, fn) => { const g = PR.g(); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  // 雨：t 讓雨會動
  const rain = (t, n, c, x0, y0, w, h) => { x0 = x0 || 0; y0 = y0 || 0; w = w || W; h = h || H; for (let i = 0; i < (n || 70); i++){ const x = x0 + ((i * 53 + Math.floor((t || 0) * 30) * 2) % w), y = y0 + ((i * 37 + Math.floor((t || 0) * 90)) % h); R(x, y, 1, 3, c || "#8aa0b8"); } };
  // 灰色休旅車（側面）：x＝車尾左邊，y＝車頂；face＝1 車頭朝右；dmg＝右前凹；lit＝開大燈
  const suv = (x, y, face, dmg, lit, c) => { x = Math.round(x); c = c || "#7c8288";
    const F = (px, py, w, h, col) => R(face > 0 ? x + px : x + 48 - px - w, y + py, w, h, col);
    F(2, 6, 44, 12, c); F(8, 0, 30, 7, "#5e6469"); F(10, 1, 12, 5, "#2a3440"); F(24, 1, 12, 5, "#2a3440"); F(0, 10, 2, 5, "#a03030");
    F(44, 10, 4, 4, lit ? "#fff6c8" : "#c8c8c0"); F(42, 16, 6, 2, "#4a4e52"); F(6, 16, 9, 6, INK); F(33, 16, 9, 6, INK); F(8, 18, 5, 2, "#5a5a5a"); F(35, 18, 5, 2, "#5a5a5a");
    if (dmg){ F(43, 13, 5, 3, "#4a4e52"); F(45, 15, 2, 2, "#1a1a1a"); }
    else F(44, 15, 3, 2, "#e8e8d8");   // 霧燈
    if (lit){ const g = PR.g(); g.fillStyle = "rgba(255,240,190,.22)"; g.beginPath(); const hx = face > 0 ? x + 48 : x; g.moveTo(hx, y + 11); g.lineTo(hx + face * 50, y + 2); g.lineTo(hx + face * 50, y + 24); g.closePath(); g.fill(); } };
  // 機車（側面）：x＝車尾，face＝1 朝右；box＝外送箱；lit＝大燈
  const scooter = (x, y, face, lit, crashed) => { x = Math.round(x);
    const F = (px, py, w, h, col) => R(face > 0 ? x + px : x + 26 - px - w, y + py, w, h, col);
    if (crashed){ R(x, y + 10, 26, 6, "#e8e8e4"); R(x + 2, y + 6, 10, 6, "#2f8a4a"); R(x + 18, y + 8, 6, 4, "#c8c8c4"); R(x + 2, y + 15, 6, 4, INK); R(x + 18, y + 15, 6, 4, INK); R(x + 6, y + 12, 14, 1, "#8a8a8a"); return; }
    F(4, 8, 18, 6, "#e8e8e4"); F(2, 2, 9, 7, "#2f8a4a"); F(18, 2, 2, 8, "#9a9a9a"); F(17, 1, 5, 2, "#3a3a3a"); F(3, 13, 6, 5, INK); F(18, 13, 6, 5, INK); F(21, 6, 3, 2, lit ? "#fff6c8" : "#c8c8c0");
    if (lit){ const g = PR.g(); g.fillStyle = "rgba(255,240,190,.18)"; g.beginPath(); const hx = face > 0 ? x + 24 : x + 2; g.moveTo(hx, y + 7); g.lineTo(hx + face * 34, y + 2); g.lineTo(hx + face * 34, y + 16); g.closePath(); g.fill(); } };
  const guard = (y, x0, x1) => { for (let x = x0; x < x1; x++){ R(x, y, 1, 4, "#c8ccd0"); if (x % 2) P(x, y + 1, "#9aa0a6"); } for (let x = x0 + 4; x < x1; x += 14) R(x, y + 4, 2, 8, "#8a9096"); };
  const nightSky = (day, h) => { if (day) PR.sky("#8fb4d8", "#dfe8ee", h || 60); else PR.sky("#0a0f1c", "#1c2636", h || 60); };

  /* ---------- 場景 ---------- */
  // 濱海路・彎道（o.day：白天；o.clean：現場收掉了）
  SC.c6_curve = (o) => { const day = o.day, t = o.t || 0;
    nightSky(day, 64); R(0, 44, W, 22, day ? "#4a7a9a" : "#14222e"); for (let x = 0; x < W; x += 7) R(x, 50 + (x % 3) * 4, 4, 1, day ? "#7aa8c4" : "#24384a");   // 海
    R(150, 6, 40, 20, "#2a2a2e"); R(152, 8, 36, 16, day ? "#e8e0d0" : "#8a8070"); txt("海灣一號", 155, 15, "#2a4a6a", "6px sans-serif"); txt("振東建設 →300M", 154, 22, "#5a3a24", "4px sans-serif"); R(168, 26, 2, 40, "#3a3a3e");   // 看板
    R(26, 18, 2, 50, "#6a6a6e"); R(20, 18, 14, 14, "#e85a2a"); R(22, 20, 10, 10, day ? "#cfe0ee" : "#3a4a5a"); P(24, 22, "#e8f0f8");   // 反光鏡
    R(48, 30, 2, 38, "#6a6a6e"); R(44, 30, 10, 10, "#f2c94c"); R(46, 33, 6, 2, INK); R(48, 35, 2, 3, INK);   // 前有彎道
    R(96, 0, 2, 66, "#3a3a3e"); R(92, 0, 14, 3, "#4a4a4e"); if (!day){ const g = PR.g(); g.fillStyle = "rgba(255,220,150,.10)"; g.beginPath(); g.moveTo(96, 3); g.lineTo(70, 74); g.lineTo(124, 74); g.fill(); R(92, 3, 10, 2, "#f8e0a0"); }   // 路燈
    guard(64, 0, W);
    floor(74, day ? "#5a5e62" : "#2a2e34", null); for (let x = 4; x < W; x += 20) R(x, 90, 10, 1, "#c8b860");   // 路
    if (!day) dither(0, 74, W, 34, "#3a4a5a", 5);
    if (!o.clean){
      scooter(132, 60, 1, true, true);
      if (o.body !== false){ R(100, 84, 26, 6, "#2f8a4a"); R(124, 83, 7, 6, "#f2c94c"); R(98, 86, 5, 3, "#2a2a30"); R(104, 89, 10, 3, "#2a2a30"); }   // 柯建宏（綠雨衣、黃安全帽）
      for (let k = 0; k < 9; k++) P(72 + (k * 5) % 22, 92 + (k * 3) % 6, k % 3 ? "#e8f0f8" : "#8a9096");   // 碎片
      if (o.mark){ OBJ.marker(74, 98, 1); OBJ.marker(140, 82, 2); OBJ.marker(112, 94, 3); OBJ.tape(0, 102, W); }
    } else { R(130, 70, 8, 6, "#f4f0f4"); R(132, 67, 4, 4, "#e8e0f0"); }   // 花
    if (!day) rain(t, 80, "#7a90a8");
  };
  // 濱海路・避車彎
  SC.c6_turn = (o) => { const day = o.day, t = o.t || 0;
    nightSky(day, 70); PR.hills(52, day ? "#4a6a4a" : "#18241e", day ? "#3a5a3a" : "#121a16");
    R(6, 30, 2, 40, "#6a6a6e"); R(2, 30, 10, 10, "#e85a2a"); R(4, 32, 6, 6, day ? "#cfe0ee" : "#3a4a5a");   // 遠處的反光鏡
    R(150, 22, 6, 52, "#4a3a2a"); for (let k = 0; k < 10; k++) R(132 + (k * 7) % 40, 10 + (k * 5) % 22, 10, 4, day ? "#3a6a3a" : "#1a2a1e");   // 木麻黃
    floor(74, day ? "#6a5a48" : "#2e2a26", null); dither(0, 74, W, 34, day ? "#7a6a54" : "#3a342e", 4);
    if (!o.clean){ R(40, 82, 80, 12, day ? "#7a7068" : "#4a4440"); R(46, 83, 3, 2, "#1a1a1a"); R(108, 88, 4, 3, "#1a1a1e"); }   // 乾長方形、機油
    for (let k = 0; k < 4; k++){ R(124 + k * 5, 86 + (k % 2) * 3, 4, 7, "#1e1a16"); P(125 + k * 5, 87 + (k % 2) * 3, "#4a3a2a"); }   // 鞋印
    R(150, 72, 4, 1, "#f4f0e0"); R(156, 74, 4, 1, "#e8c890"); R(160, 71, 3, 1, "#f4f0e0");   // 菸蒂
    for (let x = 0; x < 40; x += 3) R(x, 96 + (x % 5), 2, 1, "#1a1612");   // 甩泥痕
    if (!day) rain(t, 70, "#7a90a8");
  };
  // 濱海路・堤防
  SC.c6_bank = (o) => { const day = o.day, t = o.t || 0;
    nightSky(day, 60); R(0, 40, W, 30, day ? "#4a7a9a" : "#101c28"); for (let x = 0; x < W; x += 6) R(x, 46 + (x % 4) * 5, 4, 1, day ? "#7aa8c4" : "#20344a");
    R(172, 14, 8, 30, "#e8e0d0"); R(170, 12, 12, 4, "#c23a2a"); if (!day){ const a = (t * 1.5) % 6.28; PR.g().fillStyle = "rgba(255,240,180,.25)"; PR.g().beginPath(); PR.g().moveTo(176, 14); PR.g().lineTo(176 - 80 * Math.cos(a), 10 - 10 * Math.sin(a)); PR.g().lineTo(176 - 80 * Math.cos(a), 22 - 10 * Math.sin(a)); PR.g().fill(); }   // 燈塔
    R(0, 66, W, 10, "#7a7a74"); R(0, 66, W, 2, "#9a9a92");   // 堤防
    R(120, 30, 1, 36, "#c8b890"); for (let k = 0; k < 20; k++) P(120 - k, 30 + k * k / 14, "#c8c8c8");   // 釣竿
    floor(76, day ? "#5a5e62" : "#262a30", null);
    R(56, 84, 48, 8, "#1a2028"); for (let x = 58; x < 104; x += 4) R(x, 84, 2, 8, "#5a5e64"); dither(56, 84, 48, 8, "#3a5a7a", 3);   // 水溝格柵
    R(140, 68, 14, 10, "#3a6ab8"); R(142, 66, 10, 3, "#2a4a8a"); P(146, 70, "#e8e8f0"); P(149, 71, "#e8e8f0");   // 水桶
    if (!day) rain(t, 70, "#7a90a8");
  };
  // 柯家・客廳
  SC.c6_ko = (o) => { wall(72, "#c8bca4", false); R(0, 64, W, 8, "#7a6a54");
    R(20, 20, 18, 22, "#f4f0e0"); for (let k = 0; k < 6; k++) R(22, 24 + k * 3, 14 - (k % 2) * 4, 1, "#3a3a3a"); R(30, 18, 2, 3, "#c23a2a"); txt("等著", 22, 46, "#c23a2a", "5px sans-serif");   // 律師信
    R(56, 40, 30, 24, "#8a6a4a"); R(60, 18, 22, 16, "#e8e0c8"); R(62, 20, 18, 12, "#9ab0c0"); R(65, 24, 4, 7, "#f2c94c"); R(73, 24, 4, 7, "#f2c94c");   // 櫃子、照片
    windowBox(140, 14, 36, 26, "#1a2430"); rain(o.t, 18, "#6a80a0", 140, 14, 36, 26);
    R(96, 62, 50, 3, "#a8845a"); R(98, 65, 2, 9, "#7a5a3a"); R(142, 65, 2, 9, "#7a5a3a"); R(104, 58, 8, 4, "#f4f0f0"); R(124, 58, 8, 4, "#f4f0f0"); R(114, 54, 8, 8, "#e8e8e0"); P(117, 55, "#e04a3a");   // 餐桌、碗、電鍋
    lamp(110, 0, "#f8e8c0"); floor(72, "#a89a84", "#9a8c76");
  };
  // 柯家・阿宏的房間
  SC.c6_koroom = (o) => { wall(72, "#d8d0bc", false); R(0, 64, W, 8, "#8a7a64");
    for (let k = 0; k < 5; k++) R(14 + k * 10, 16 + (k % 2) * 4, 8, 10, ["#9ab0c0", "#c8b890", "#a8c8a8", "#e8c8a8", "#b8b8c8"][k]);   // 牆上的照片
    R(60, 62, 70, 3, "#7a5a3a"); R(62, 65, 3, 9, "#5a3e24"); R(125, 65, 3, 9, "#5a3e24");   // 書桌
    R(70, 56, 14, 6, "#8a6a3a"); R(71, 57, 12, 1, "#f4f0e0");   // 筆記本
    R(96, 48, 24, 13, "#2a2a2e"); R(97, 49, 22, 10, "#3a5a7a"); R(99, 51, 8, 6, "#9ab0c0"); R(109, 51, 8, 6, "#e8e0c8"); R(96, 60, 24, 2, "#4a4a4e");   // 筆電
    R(144, 18, 34, 56, "#8a6a4a"); R(150, 40, 16, 12, "#f2c94c"); R(148, 50, 20, 3, "#d8a830");   // 衣櫃、安全帽
    R(30, 40, 14, 22, "#2f8a4a"); R(34, 38, 6, 3, "#2f8a4a");   // 外送外套
    lamp(96, 0, "#f8e8c0"); floor(72, "#a89a84", "#9a8c76");
  };
  SC.pol6 = (o) => { SC.police(o); R(176, 40, 14, 30, "#c8a070"); R(178, 43, 10, 8, "#f4f0e0"); R(178, 54, 10, 8, "#f4f0e0"); R(184, 44, 3, 3, "#c23a2a"); };
  SC.lab6 = (o) => { SC.lab(o); R(22, 38, 16, 26, "#2f8a4a"); R(26, 36, 8, 3, "#2f8a4a"); R(32, 50, 4, 4, "#1a5a2a"); R(128, 56, 8, 6, "#2a2a2e"); R(130, 57, 4, 3, "#5a5a64"); };
  // 振東建設車庫・停車場
  SC.c6_garage = (o) => { wall(72, "#9a9a92", false); R(0, 64, W, 8, "#6a6a62"); dither(0, 0, W, 64, "#8a8a82", 6);
    for (let k = 0; k < 4; k++){ R(6 + k * 48, 2, 24, 2, "#e8f0e8"); PR.g().fillStyle = "rgba(230,240,230,.10)"; PR.g().fillRect(k * 48, 4, 36, 68); }
    ["ZD-3", "ZD-7", "ZD-1"].forEach((s, i) => { R([14, 104, 164][i], 30, 18, 8, "#f4f0e0"); txt(s, [15, 105, 165][i], 36, "#2a2a2a", "5px monospace"); });
    floor(72, "#6a6a64", "#5e5e58"); for (let x = 0; x < W; x += 48) R(x + 46, 72, 2, 36, "#e8e0a0");
    R(10, 56, 40, 14, "#e8e8e4"); R(30, 48, 18, 10, "#e8e8e4"); R(32, 50, 12, 5, "#3a4a5a"); R(12, 54, 18, 3, "#c8c0a8"); R(12, 68, 7, 6, INK); R(38, 68, 7, 6, INK); txt("工務", 14, 64, "#3a5a8a", "4px sans-serif");   // 小貨車
    suv(92, 52, 1, !o.fixed, false);
    R(156, 56, 34, 12, "#f0f0ec"); R(162, 50, 20, 7, "#d8d8d4"); R(158, 66, 6, 6, INK); R(180, 66, 6, 6, INK);   // 白色轎車
  };
  // 振東建設車庫・警衛亭
  SC.c6_booth = (o) => { wall(72, "#c8c4b4", false); R(0, 64, W, 8, "#8a8676");
    R(18, 22, 26, 34, "#5a5e64"); R(20, 24, 22, 28, "#3a3e44"); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++){ R(22 + c * 5, 26 + r * 8, 2, 4, "#c8a040"); } R(36, 50, 5, 3, "#3ae04a");   // 鑰匙櫃
    R(58, 18, 34, 24, "#1a1a1e"); R(60, 20, 30, 20, o.nosig ? "#1a2a6a" : "#1a2a1a"); if (o.nosig) txt("NO SIGNAL", 61, 32, "#e8e8f0", "4px monospace"); else for (let k = 0; k < 4; k++) R(61 + (k % 2) * 15, 21 + Math.floor(k / 2) * 10, 13, 8, "#2a3a2a");   // 監視器主機
    R(96, 40, 18, 12, "#2a2a2e"); R(97, 41, 16, 9, "#2a4a6a"); for (let k = 0; k < 3; k++) R(99, 43 + k * 2, 10, 1, "#9ad0f0");   // 車隊系統
    R(128, 28, 24, 18, "#2a2a2e"); R(130, 30, 20, 14, "#3a6a3a"); R(136, 36, 8, 4, "#e8e8e0");   // 小電視（球場）
    R(54, 60, 80, 3, "#7a6a54"); R(56, 63, 2, 11, "#5a4a3a"); R(130, 63, 2, 11, "#5a4a3a"); R(118, 54, 4, 6, "#7a4a2a");   // 桌子、保力達
    windowBox(158, 30, 30, 26, "#2a3440"); R(162, 50, 22, 4, "#3a3a3e"); R(166, 50, 3, 2, "#c8c8c8"); P(170, 51, "#8a3a2a");   // 窗外的延長線
    lamp(96, 0, "#f4f4e8"); floor(72, "#8a8676", "#7a7666");
  };
  // 范家・客廳
  SC.c6_fan = (o) => { wall(72, "#e8e0d0", false); R(0, 64, W, 8, "#8a6a4a");
    for (let k = 0; k < 6; k++) R(16 + (k % 3) * 12, 14 + Math.floor(k / 3) * 14, 10, 12, k === 4 ? "#c8b890" : "#d8b860"); R(42, 34, 10, 8, "#9ab0c0");   // 獎牌牆、小照片
    R(64, 50, 56, 18, "#5a3a2a"); R(62, 46, 60, 6, "#6a4a32"); R(64, 66, 4, 8, "#3a2a1a"); R(116, 66, 4, 8, "#3a2a1a");   // 沙發
    R(84, 70, 30, 3, "#c8a878"); R(108, 66, 4, 4, "#f4f0e0"); R(96, 67, 6, 2, "#1a1a1e");   // 茶几、解酒液、墨鏡
    R(140, 10, 50, 40, "#c8c8c8"); R(142, 12, 46, 36, "#1a2430"); R(150, 20, 28, 18, "#1a1a1e"); R(152, 22, 24, 14, "#2a3a2a");   // 落地窗、監視器螢幕
    lamp(96, 0, "#fff4e0"); floor(72, "#c8b8a0", "#b8a890");
  };
  // 范家・司機的小房間
  SC.c6_quarter = (o) => { wall(72, "#d8d4c8", false); R(0, 64, W, 8, "#7a7468");
    R(40, 18, 16, 14, "#e8e0c8"); R(42, 20, 12, 10, "#9ab0c0"); R(46, 22, 4, 6, "#2a2a3a"); R(58, 20, 10, 14, "#f4f0e0"); R(60, 23, 6, 1, "#c23a2a");   // 照片、繳費單
    R(130, 54, 50, 12, "#c8c0b0"); R(130, 52, 14, 4, "#f4f0f0");   // 床
    R(108, 62, 8, 6, "#c8a040"); R(118, 64, 10, 4, "#f4f0e0"); R(118, 64, 10, 1, "#c8c8c8"); R(96, 68, 8, 6, "#2a2a30");   // 蠟、擦車布、雨鞋
    lamp(90, 0, "#f8e8c8"); floor(72, "#8a8476", "#7a7466");
  };
  // 范家車道（監視器畫面；s.wax＝擦車的位置）
  SC.c6_drive = (o) => { const [s] = stOf(o), t = o.t || 0;
    R(0, 0, W, H, "#1a1e24"); R(0, 0, W, 30, "#2a3038"); R(20, 20, 150, 4, "#4a4e54"); for (let x = 24; x < 170; x += 30) R(x, 24, 2, 50, "#4a4e54");   // 雨棚
    floor(74, "#3a3e44", null);
    if (s.car !== false){ R(60, 60, 64, 14, "#0e0e12"); R(72, 50, 40, 11, "#16161a"); R(74, 52, 16, 7, "#2a3440"); R(94, 52, 16, 7, "#2a3440"); R(64, 72, 10, 6, INK); R(110, 72, 10, 6, INK); P(84, 62, "#c8c8d0"); P(100, 64, "#c8c8d0"); }   // 黑色轎車
    rain(t, 40, "#5a6a80", 0, 0, 20, H); rain(t, 40, "#5a6a80", 172, 0, 20, H);
    txt("CAM 大門", 4, 7, "#f4f4f4", "5px monospace");
  };
  // 海灣一號・工務所
  SC.c6_office = (o) => { wall(72, "#d8dce0", false); R(0, 64, W, 8, "#7a8088");
    R(0, 20, 14, 54, "#5a5e64"); R(2, 22, 10, 52, "#2a3038"); for (let k = 0; k < 4; k++) R(0, 26 + k * 2, 14, 1, "#8a7a64");   // 門框（撞凹）
    R(50, 22, 14, 26, "#24324e"); R(50, 30, 14, 1, "#e8e8e0"); R(66, 22, 6, 30, "#3a4a6a"); R(66, 48, 6, 1, "#e8e8e0");   // 外套、雨褲
    R(90, 62, 60, 3, "#8a7a64"); R(92, 65, 2, 9, "#5a4a3a"); R(146, 65, 2, 9, "#5a4a3a"); R(110, 56, 20, 6, "#2a5a8a"); R(112, 57, 16, 1, "#f4f0e0");   // 桌、資料夾
    R(150, 30, 26, 44, "#8a8e94"); for (let k = 0; k < 4; k++) R(152, 32 + k * 10, 22, 1, "#5a5e64");   // 檔案櫃
    R(16, 50, 10, 12, "#6a6e74"); R(18, 52, 6, 4, "#3a3e44");   // 水表箱
    R(100, 14, 40, 26, "#f4f4f0"); for (let k = 0; k < 5; k++) R(104, 18 + k * 4, 30, 1, "#3a3a3a");   // 白板
    lamp(110, 0, "#f4f4e8"); floor(72, "#9a9a92", "#8a8a82");
    R(20, 80, 8, 5, "#3a3020"); R(30, 80, 8, 5, "#3a3020"); R(20, 76, 5, 4, "#3a3020"); R(30, 76, 5, 4, "#3a3020"); P(22, 84, "#a85a3a"); P(33, 84, "#a85a3a");   // 工地鞋
  };
  // 海灣一號・鷹架下
  SC.c6_scaf = (o) => { PR.sky("#9cc5e6", "#e8f0f4", 70);
    R(60, 0, 100, 74, "#b8b4ac"); for (let y = 2; y < 74; y += 8) R(56, y, 108, 1, "#6a6a6a"); for (let x = 56; x < 166; x += 12) R(x, 0, 1, 74, "#6a6a6a");   // 大樓、鷹架
    dither(56, 0, 108, 60, "#3a8a4a", 2);   // 綠網
    R(110, 22, 6, 4, "#f4f4f0");   // 吊牌
    R(150, 34, 30, 22, "#2a5a8a"); R(152, 36, 26, 18, "#f4f4f0"); txt("267", 156, 50, "#c23a2a", "7px monospace");   // 無災害看板
    floor(74, "#a85a3a", null); dither(0, 74, W, 34, "#8a4a2a", 3);   // 紅土
    R(28, 62, 22, 12, "#8a2a1a"); R(30, 58, 18, 5, "#a83a2a"); R(36, 64, 6, 6, "#f4f0e0"); R(44, 66, 4, 6, "#f4f4f4");   // 神龕、百合
  };
  // 海灣一號・抽水機房
  SC.c6_pump = (o) => { wall(72, "#6a6e70", false); R(0, 64, W, 8, "#4a4e50");
    for (let k = 0; k < 3; k++) R(0, 10 + k * 14, W, 4, "#8a8e90");   // 管線
    R(80, 26, 34, 36, "#d8dcd8"); R(84, 30, 26, 14, "#1a2a1a"); for (let k = 0; k < 4; k++) R(86, 32 + k * 3, 20, 1, "#6fd46f"); R(86, 48, 5, 5, "#3ae04a"); R(96, 48, 5, 5, "#e04a3a");   // 控制盤
    R(20, 70, 44, 14, "#1a2a3a"); dither(20, 70, 44, 14, "#3a5a7a", 2); R(20, 70, 44, 1, "#9ab0c0");   // 集水坑
    R(140, 40, 20, 34, "#5a6a7a"); R(144, 30, 12, 10, "#5a6a7a");   // 抽水機
    lamp(96, 0, "#e8f0e8"); floor(72, "#5a5e60", "#4e5254");
  };
  // 陳家
  SC.c6_mei = (o) => { wall(72, "#d8c8a8", true); R(0, 64, W, 8, "#7a6a54");
    R(18, 40, 36, 34, "#8a2a1a"); R(20, 24, 32, 18, "#6a1a10"); R(28, 26, 12, 12, "#e8e0c8"); R(30, 28, 8, 8, "#9ab0c0"); R(42, 34, 8, 6, "#f2c94c"); R(24, 22, 2, 4, "#e04a3a"); R(46, 22, 2, 4, "#e04a3a");   // 神明桌
    for (let k = 0; k < 6; k++){ const x = 140 + (k % 3) * 16, y = 14 + Math.floor(k / 3) * 18; R(x, y, 14, 16, "#f4f0e0"); R(x + 6, y + 3, 2, 10, "#e8b830"); R(x + 5, y + 2, 4, 2, "#f2c94c"); }   // 長頸鹿的畫
    R(96, 62, 46, 3, "#a8845a"); R(98, 65, 2, 9, "#7a5a3a"); R(138, 65, 2, 9, "#7a5a3a"); R(110, 58, 18, 4, "#f4f0e0"); R(112, 59, 12, 1, "#3a3a3a");   // 桌上的和解書
    lamp(96, 0, "#f8e8c0"); floor(72, "#a89a84", "#9a8c76");
  };
  // 黎家・客廳
  SC.c6_lihome = (o) => { wall(72, "#d8d4c4", false); R(0, 64, W, 8, "#7a7464");
    R(20, 44, 24, 30, "#e8ecec"); R(24, 48, 16, 10, "#3a6a8a"); R(26, 60, 12, 2, "#c8c8c8"); R(46, 30, 2, 40, "#c8c8c8"); R(44, 30, 6, 6, "#e8f0f8");   // 透析機、點滴架
    R(70, 50, 40, 18, "#6a5a4a"); R(68, 46, 44, 6, "#7a6a5a");   // 沙發
    R(80, 20, 20, 16, "#e8e0c8"); R(82, 22, 16, 12, "#9ab0c0"); R(86, 26, 3, 6, "#f2c94c"); R(91, 26, 3, 6, "#e8b8c8"); R(94, 28, 3, 4, "#4a4a6a");   // 全家福
    R(140, 18, 50, 50, "#8a9aa8"); R(142, 20, 46, 46, "#1a2430"); R(150, 50, 20, 10, "#9a9a92"); R(152, 48, 16, 3, "#7a7a72"); R(122, 70, 14, 8, "#3a6ab8"); R(124, 68, 10, 3, "#f4f4f0");   // 陽台、菸灰缸、水桶
    lamp(96, 0, "#f8e8c0"); floor(72, "#a89a84", "#9a8c76");
  };
  // 黎家・車棚
  SC.c6_licar = (o) => { PR.sky("#8a9ab0", "#d8dee4", 60); R(0, 20, W, 4, "#5a5e64"); for (let x = 10; x < W; x += 60) R(x, 24, 3, 50, "#5a5e64");
    floor(74, "#6a6a64", null);
    R(40, 58, 70, 14, "#f0f0ec"); R(54, 48, 40, 11, "#e0e0dc"); R(56, 50, 16, 7, "#3a4a5a"); R(76, 50, 16, 7, "#3a4a5a"); R(44, 70, 10, 6, INK); R(96, 70, 10, 6, INK); R(100, 58, 8, 6, "#d8d8d4");   // 白色小轎車
    R(130, 40, 50, 34, "#b8b4ac"); R(134, 44, 18, 30, "#8a6a4a");   // 宿舍門口
  };
  // 7-11 濱海門市（o.cam：監視器角度）
  SC.c6_store = (o) => { wall(72, "#f4f4f0", false); R(0, 64, W, 8, "#2a8a4a"); R(0, 0, W, 6, "#2a8a4a"); R(0, 6, W, 2, "#e86a2a"); R(0, 8, W, 2, "#c23a2a");
    for (let k = 0; k < 6; k++){ R(8 + k * 6, 14, 4, 8, ["#e04a3a","#f2c94c","#3a8ae0"][k % 3]); }   // 吊旗
    R(0, 24, 4, 50, "#9ab0c0");   // 門
    R(60, 52, 70, 22, "#e8e8e4"); R(58, 50, 74, 3, "#c8c8c4"); R(100, 42, 14, 8, "#2a2a2e"); R(101, 43, 12, 6, "#3a8ae0");   // 櫃台、收銀機
    R(118, 22, 34, 26, "#8a6a4a"); for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) R(120 + c * 5, 24 + r * 8, 4, 6, r === 0 ? "#f2c94c" : ["#e8e8e4","#3a6a3a","#c23a2a"][c % 3]);   // 菸櫃
    R(156, 20, 30, 50, "#c8d0d8"); for (let k = 0; k < 4; k++) R(158, 24 + k * 12, 26, 1, "#8a9098");   // 冰櫃
    lamp(60, 0, "#f8f8f0"); lamp(140, 0, "#f8f8f0"); floor(72, "#e8e8e0", "#d8d8d0");
    if (o.cam) txt("CAM 櫃台", 4, 104, "#2a2a2a", "5px monospace");
  };
  // 宏達安全器材行
  SC.c6_hongda = (o) => { wall(72, "#8a8a82", false); R(0, 64, W, 8, "#5a5a52"); dither(0, 0, W, 64, "#7a7a72", 5);
    for (let k = 0; k < 4; k++){ R(20 + k * 20, 50, 16, 14, "#a8845a"); R(22 + k * 20, 46, 12, 5, "#f2c94c"); } R(30, 36, 10, 14, "#e86a2a"); R(48, 40, 8, 10, "#e86a2a");   // 紙箱、安全帽、三角錐
    R(110, 62, 40, 3, "#7a6a54"); R(112, 65, 2, 9, "#5a4a3a"); R(146, 65, 2, 9, "#5a4a3a"); R(118, 58, 16, 4, "#f4f0e0");   // 桌、抽屜
    R(160, 20, 24, 30, "#f4f0e0"); txt("宏達", 164, 32, "#2a5a8a", "6px sans-serif");
    lamp(96, 0, "#e8e8d8"); floor(72, "#6a6a64", "#5e5e58");
  };
  // 安全帽攝影機的畫面（POV）：s.v＝畫面種類 ride/hit/ditch/gone；s.suv＝避車彎那台車往後退的位置；s.legs、s.beam；s.lit
  SC.c6_helmet = (o) => { const [s, p] = stOf(o), t = o.t || 0, v = s.v || "ride";
    if (v === "ride" || v === "hit"){
      R(0, 0, W, H, "#0a0e16"); R(0, 52, W, 56, "#1a1e24");
      const g = PR.g(); g.fillStyle = "#24282e"; g.beginPath(); g.moveTo(40, H); g.lineTo(90, 52); g.lineTo(102, 52); g.lineTo(170, H); g.fill();   // 路
      g.fillStyle = "rgba(255,240,190,.20)"; g.beginPath(); g.moveTo(60, H); g.lineTo(92, 56); g.lineTo(100, 56); g.lineTo(150, H); g.fill();   // 大燈照的路面
      for (let k = 0; k < 4; k++){ const y = 60 + ((k * 14 + Math.floor(t * 40)) % 48); R(95 - (y - 52) * 0.05, y, 2, 3 + (y - 52) / 10, "#c8b860"); }
      for (let x = 130; x < W; x += 2) P(x, 50 + (x - 130) * 0.3, "#c8ccd0");   // 右邊的護欄
      const sx = s.suv === undefined ? null : kf(s.suv, p); if (sx !== null){ R(sx, 58 - (sx < 30 ? 6 : 0), 26, 12, "#3a3e44"); R(sx + 4, 54 - (sx < 30 ? 6 : 0), 16, 6, "#2a2e34"); R(sx + 6, 55 - (sx < 30 ? 6 : 0), 5, 4, "#1a2028"); }   // 避車彎的車
      rain(t, 90, "#7a90a8");
      if (v === "hit"){ R(0, 0, Math.round(80 * p), H, "#08080a"); PR.g().fillStyle = "rgba(255,255,255," + (0.6 * (1 - p)) + ")"; PR.g().fillRect(0, 0, W, H); }
    } else if (v === "ditch"){
      R(0, 0, W, H, "#06080c"); for (let x = 0; x < W; x += 2) P(x, 40 + Math.round(Math.sin(x / 9) * 2), "#5a6068"); R(0, 30, W, 4, "#8a9096");   // 往上看的護欄
      R(0, 80, W, 28, "#0e1620"); dither(0, 80, W, 28, "#2a4a6a", 3); for (let x = 0; x < W; x += 6) R(x, 76, 3, 32, "#2a2e34");   // 水、格柵
      const lx = s.legs === undefined ? null : kf(s.legs, p); if (lx !== null){ R(lx, 0, 10, 60, "#1e2a3e"); R(lx + 14, 0, 10, 60, "#1e2a3e"); R(lx, 54, 10, 2, "#e8e8d0"); R(lx + 14, 54, 10, 2, "#e8e8d0"); R(lx - 3, 60, 14, 6, "#3a3020"); R(lx + 15, 60, 14, 6, "#3a3020"); }   // 雨褲反光條、工地鞋（外八）
      const bx = s.beam === undefined ? null : kf(s.beam, p); if (bx !== null){ const g = PR.g(); g.fillStyle = "rgba(255,250,220,.35)"; g.beginPath(); g.moveTo(bx, 0); g.lineTo(bx - 30, H); g.lineTo(bx + 30, H); g.fill(); }
      if (s.lit){ PR.g().fillStyle = "rgba(255,240,190," + (0.4 * (1 - p)) + ")"; PR.g().fillRect(0, 0, W, 40); }
      rain(t, 60, "#5a7088");
    }
    txt("HELMET CAM", 4, 7, "#f4f4f4", "5px monospace"); R(180, 3, 4, 4, "#e04a3a");
  };
  // 案發經過重現：側面（左邊車庫，中間濱海路的避車彎，右邊彎道、護欄、水溝）
  SC.c6_cut = (o) => { const [s, p] = stOf(o), t = o.t || 0;
    PR.sky("#0a0f1c", "#1c2636", 70); R(0, 50, W, 20, "#14222e");
    R(0, 30, 44, 44, "#4a4e52"); R(2, 34, 40, 28, "#2a2e32"); R(28, 54, 10, 6, "#5a5e64"); txt("車庫", 4, 40, "#9a9a92", "5px sans-serif");   // 車庫
    if (s.cam === false){ R(30, 46, 4, 3, "#1a1a1a"); } else { R(30, 46, 4, 3, "#e04a3a"); }
    R(66, 40, 4, 34, "#4a3a2a"); for (let k = 0; k < 6; k++) R(56 + (k * 7) % 26, 30 + (k * 5) % 12, 10, 4, "#1a2a1e");   // 木麻黃
    R(150, 34, 2, 40, "#6a6a6e"); R(146, 34, 10, 10, "#e85a2a"); guard(68, 150, W);
    floor(76, "#262a30", null); R(60, 76, 70, 4, "#2e2a26");   // 路、避車彎
    R(160, 92, 32, 8, "#1a2028"); for (let x = 162; x < 192; x += 4) R(x, 92, 2, 8, "#5a5e64");   // 水溝
    const vx = s.suv === undefined ? null : kf(s.suv, p); if (vx !== null) suv(vx, 58, s.face || 1, s.dmg, s.lit);
    const kx = s.sc === undefined ? null : kf(s.sc, p); if (kx !== null) scooter(kx, 62, 1, true, s.crash);
    if (s.flash){ PR.g().fillStyle = "rgba(255,255,255,.35)"; PR.g().fillRect(120, 40, 72, 50); }
    rain(t, 70, "#7a90a8");
    R(0, 98, W, 10, "#3a3a40");
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    li:     { skin:"#c89a70", hair:"#1a1410", hairStyle:"short", top:"#24324e", bottom:"#3a3a30", hat:"cap", capColor:"#f2c94c", mood:"worried", tall:true, hello:"柯建宏？……可惜了，那孩子人不錯。" },
    kai:    { skin:"#f0d0b4", hair:"#2a1e18", hairStyle:"slick", top:"#e8e0f0", bottom:"#2a2a3a", sunglasses:true, mood:"tired", hello:"我喝到斷片了，什麼都不記得……",
              byPhase:{ 2:{ sunglasses:false, mood:"sad" } } },
    dong:   { age:"old", skin:"#e8c09a", hair:"#c8c8c8", hairStyle:"slick", top:"#e9e4da", coat:"#2a2a30", bottom:"#2a2a30", glasses:true, hello:"我的人做錯事，我會負責。" },
    zhuang: { skin:"#c89a70", hair:"#8a8a8a", hairStyle:"short", top:"#e9e4da", bottom:"#2a2a3a", mood:"sad", hello:"是我撞的。我認。" },
    qi:     { skin:"#f4d4bc", hair:"#1e1a18", hairStyle:"pony", top:"#e86a3a", bottom:"#2a3a5a", apron:"#2f8a4a", mood:"cry", hello:"他說會買鹹酥雞回來……",
              byPhase:{ 1:{ apron:null, top:"#2a2a30", mood:"sad" }, 2:{ apron:null, top:"#2a2a30", mood:"sad" } } },
    hong:   { age:"old", skin:"#b88a60", hair:"#d8d8d0", hairStyle:"balding", top:"#3a5a3a", bottom:"#3a3a30", hat:"cap", capColor:"#2a4a2a", hello:"碰的一聲，我魚竿都丟了。" },
    bin:    { skin:"#d8a880", hair:"#5a5a5a", hairStyle:"short", top:"#3a4a6a", bottom:"#2a3a5a", hat:"cap", capColor:"#2a3a5a", mood:"worried", hello:"我、我整晚都有巡啦。" },
    mei:    { skin:"#e8c09a", hair:"#2a2220", hairStyle:"bun", top:"#5a5a6a", bottom:"#2a2a30", mood:"sad", hello:"阿宏他……又一個。" },
    he:     { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#8a9a8a", coat:"#5a5a4a", bottom:"#3a3a30", glasses:true, hello:"他說今天要給我看一樣東西。他沒來。" },
    qian:   { age:"old", skin:"#d8a880", hair:"#d8d8d0", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#4a4a52", glasses:true, hello:"下雨天，什麼都被沖掉了。" },
    wu:     { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050", glasses:true, hello:"學長，他的手機不見了。" },
    ye:     { skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"long", top:"#f4f4f0", coat:"#6a6e74", bottom:"#6a6e74", skirt:true, hello:"給我理由。" },
    shufen: { skin:"#e0c0a0", hair:"#3a2a24", hairStyle:"bob", top:"#c8b8d8", bottom:"#4a4a5a", mood:"tired", hello:"他說他在家……他一直都在家。" },
    shuhui: { skin:"#f0d0b4", hair:"#2a2220", hairStyle:"long", top:"#e86a2a", bottom:"#2a2a30", mood:"worried", hello:"我只是幫姐夫顧店……" },
    xian:   { skin:"#b88a60", hair:"#2a2220", hairStyle:"short", top:"#e8a030", bottom:"#3a3a30", hat:"cap", capColor:"#f2c94c", mood:"sad", hello:"阿忠的收音機，沒有人敢關。" },
    clerk:  { skin:"#f0d0b4", hair:"#1a1410", hairStyle:"spiky", top:"#2a8a4a", bottom:"#2a2a30", apron:"#2a8a4a", mood:"worried", hello:"歡迎光臨……啊，警察？" },
    zhou:   { age:"old", skin:"#d8a880", hair:"#6a6a66", hairStyle:"slick", top:"#e9e4da", coat:"#3a3f4a", bottom:"#2a2f3a", hello:"局長一早就打給我了。" }
  };
  ["qian","zhou","ye","he","wu"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  const DAILY = {
    li:     [ null, { room:"soffice", x:120, pose:"sit", doing:"坐在工務所的桌子前面，翻著施工日誌。" }, { room:"soffice", x:90, pose:"smoke", doing:"站在工務所門口抽菸，看著濱海路那邊。" } ],
    kai:    [ null, { room:"fliving", x:90, pose:"sit", doing:"窩在沙發上，墨鏡沒拿下來，一直喝解酒液。" }, { room:"fliving", x:100, pose:"stand", doing:"站在落地窗前面，看著車道。" } ],
    dong:   [ null, { room:"fliving", x:130, pose:"phone", doing:"在客廳講電話，聲音很平靜。" }, { room:"fliving", x:60, pose:"cross", doing:"站在獎牌牆前面，雙手抱胸。" } ],
    zhuang: [ null, { room:"pdesk", x:140, pose:"sit", doing:"坐在偵訊室裡，兩手放在桌上。" }, { room:"pdesk", x:140, pose:"sit", doing:"在偵訊室，一夜沒睡，一直看著自己的手。" } ],
    qi:     [ { room:"kliving", x:120, pose:"cry", doing:"坐在餐桌旁邊，看著那兩副碗筷。" }, { room:"kroom", x:90, pose:"stand", doing:"站在哥哥的房間門口，沒有走進去。" }, { room:"kliving", x:80, pose:"sit", doing:"抱著哥哥的外送外套坐在沙發上。" } ],
    hong:   [ { room:"rbank", x:130, pose:"stand", doing:"站在堤防上，雨衣一直在滴水。" }, { room:"rbank", x:120, pose:"stand", doing:"又來釣魚了，竿子架著，一直往彎道那邊看。" } ],
    bin:    [ null, { room:"gbooth", x:100, pose:"stand", doing:"站在警衛亭裡，一直搓手。" }, { room:"gbooth", x:110, pose:"sit", doing:"坐在警衛亭，電視關著。" } ],
    mei:    [ null, { room:"mroom", x:80, pose:"sit", doing:"坐在神明桌前面摺紙蓮花。" }, { room:"mroom", x:100, pose:"stand", doing:"在給女兒的便當盒裝飯。" } ],
    he:     [ null, { room:"pdesk", x:40, pose:"write", doing:"坐在刑大門口的長椅上，一直在寫筆記。" }, { room:"pdesk", x:40, pose:"phone", doing:"在走廊講電話：「這篇我要自己寫。」" } ],
    qian:   [ { room:"rcurve", x:110, pose:"kneel", doing:"蹲在柯建宏旁邊，雨水從帽簷一直滴下來。" }, { x:60, pose:"stand", doing:"在解剖台旁邊寫報告。" } ],
    wu:     [ { room:"rcurve", x:80, pose:"kneel", doing:"打著手電筒，蹲在路上撿碎片。" }, { x:110, pose:"stand", doing:"在實驗台前，用吹風機烘一台小小的攝影機。" } ],
    ye:     [ null, { room:"pdesk", x:60, pose:"read", doing:"在看莊文福的筆錄。" }, { room:"pdesk", x:60, pose:"read", doing:"看著牆上的時鐘，在等你。" } ],
    shufen: [ null, { room:"lliving", x:60, pose:"sit", doing:"坐在透析機旁邊，手上還貼著膠布。" }, { room:"lliving", x:110, pose:"stand", doing:"站在陽台門口，看著那個水桶。" } ],
    shuhui: [ null, null, { room:"hshop", x:120, pose:"sit", doing:"坐在桌子後面，一直摳桌角。" } ],
    xian:   [ null, { room:"sscaf", x:60, pose:"stand", doing:"站在神龕旁邊，安全帽拿在手上。" }, { room:"sscaf", x:120, pose:"stand", doing:"在鷹架下面整理鋼筋，收音機還開著。" } ],
    clerk:  [ null, { room:"scounter", x:90, pose:"stand", doing:"站在櫃台後面補菸。" }, { room:"scounter", x:90, pose:"stand", doing:"在櫃台結帳，一直偷看你。" } ],
    zhou:   [ null, { room:"pdesk", x:170, pose:"phone", doing:"在講電話，眉頭皺得很緊。" } ]
  };
  EP6.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });
  const L0 = id => { const L = Object.assign({}, LOOK[id]); delete L.hello; delete L.byPhase; return L; };
  EP6.looks = {
    zhuangL: Object.assign(L0("zhuang"), { top:"#3a3a40" }),
    liC: Object.assign(L0("li"), { top:"#24324e", bottom:"#24324e", hood:"#24324e", hat:null }),
    koC: { skin:"#e8c09a", hair:"#1a1410", hairStyle:"short", top:"#2f8a4a", bottom:"#2f8a4a", hat:"helmet", capColor:"#f2c94c" },
    binC: L0("bin"), hongC: L0("hong"), liS: Object.assign(L0("li"), { hat:"cap", capColor:"#24324e" }), clerkS: L0("clerk")
  };

  /* ---------- 房間和隱藏小細節 ---------- */
  EP6.rooms = {
    road: [
      { id:"rcurve", name:"彎道・護欄", scene:"c6_curve", outdoor:true, opt:(ph) => ({ day:ph > 0, mark:ph === 0, clean:ph > 0, body:ph === 0 }), details:[
        { id:"d6_cone", name:"路邊的三角錐", hot:[60,80,8,10], text:"派出所擺的三角錐被風吹倒了兩次。值班的員警第三次把它扶起來，壓了一塊石頭。" } ] },
      { id:"rturn", name:"避車彎", scene:"c6_turn", outdoor:true, opt:(ph) => ({ day:ph > 0 }), details:[
        { id:"d6_cans", name:"草叢裡", hot:[100,70,14,6], text:"草叢裡有幾個舊的飲料罐，褪色褪得看不出牌子——這裡平常是情侶停車看海的地方。" } ] },
      { id:"rbank", name:"堤防", scene:"c6_bank", outdoor:true, opt:(ph) => ({ day:ph > 0 }), details:[
        { id:"d6_crab", name:"消波塊縫裡", hot:[10,60,20,8], text:"消波塊的縫裡，一隻小螃蟹被手電筒照到，橫著跑進更深的縫裡。" } ] }
    ],
    kohome: [
      { id:"kliving", name:"柯家・客廳", scene:"c6_ko", details:[
        { id:"d6_shoes", name:"門口的鞋櫃", hot:[150,60,20,12], text:"鞋櫃上擺著一雙還沒拆標籤的女用球鞋，盒子上貼著便利貼：「雅琪　生日快樂　哥」。她的生日是下個禮拜。" } ] },
      { id:"kroom", name:"阿宏的房間", scene:"c6_koroom", details:[
        { id:"d6_app", name:"牆上的外送獎狀", hot:[10,40,14,10], text:"外送平台的「五星騎士」獎狀，旁邊一張手寫的表：「目標：100 萬　→ 給美華姐的孩子讀書」。已經存到 31 萬。" } ] }
    ],
    police: [ { id:"pdesk", name:"澄港市刑大", scene:"pol6", details:[
      { id:"d6_noodle", name:"值班台", hot:[20,60,20,8], text:"值班台上一碗泡麵已經泡爛了。值班的員警說：「沈哥，那個自首的，他律師比他早到十分鐘。」" } ] } ],
    lab: [ { id:"lab", name:"鑑識中心", scene:"lab6", details:[
      { id:"d6_hair", name:"小吳的吹風機", hot:[120,50,10,8], text:"小吳從家裡帶來的吹風機，粉紅色的，上面貼著他妹妹的名字。「學長，不要說出去。」" } ] } ],
    garage: [
      { id:"gpark", name:"振東建設車庫", scene:"c6_garage", details:[
        { id:"d6_sticker", name:"ZD-7 的後車窗", hot:[94,52,10,6], text:"ZD-7 的後車窗貼著一張小貼紙：一隻戴墨鏡的柴犬。旁邊另一張被撕掉了，只剩一圈膠。" } ] },
      { id:"gbooth", name:"警衛亭", scene:"c6_booth", opt:(ph) => ({ nosig:false }), details:[
        { id:"d6_bento", name:"阿彬的便當", hot:[60,56,14,6], text:"桌上一個便當盒，上面寫著「國彬　週三」。他太太每天幫他準備，一個禮拜七個盒子輪流用。" } ] }
    ],
    fanhome: [
      { id:"fliving", name:"范家・客廳", scene:"c6_fan", details:[
        { id:"d6_fish", name:"客廳的魚缸", hot:[120,30,16,12], text:"一個很大的魚缸，裡面一條紅龍魚慢慢游。旁邊的卡片：「紅龍　凱文十歲時養的」。" } ] },
      { id:"fquarter", name:"司機的小房間", scene:"c6_quarter", details:[
        { id:"d6_hat", name:"門後的司機帽", hot:[20,30,10,8], text:"門後掛著一頂舊司機帽，帽沿都磨白了。裡面縫著一塊布：「福」。" } ] }
    ],
    site: [
      { id:"soffice", name:"工務所", scene:"c6_office", details:[
        { id:"d6_calendar", name:"牆上的月曆", hot:[80,20,14,16], text:"月曆上 6 月 1 日被紅筆圈了三圈：「公開　全員到」。5 月 14 日那一格寫著：「勞安講習」，被劃掉了。" } ] },
      { id:"sscaf", name:"鷹架下", scene:"c6_scaf", outdoor:true, details:[
        { id:"d6_radio", name:"鷹架上的收音機", hot:[170,60,10,8], text:"鷹架下掛著一台收音機，在放台語老歌。工人說，那是阿忠的，沒有人敢關。" } ] },
      { id:"spump", name:"地下二樓・抽水機房", scene:"c6_pump", details:[
        { id:"d6_line", name:"牆上的水位線", hot:[66,40,10,10], text:"牆上用油漆寫著：「2024 颱風　淹到這裡」，箭頭指著你的膝蓋。" } ] }
    ],
    lihome: [
      { id:"lliving", name:"黎家・客廳", scene:"c6_lihome", details:[
        { id:"d6_exam", name:"牆上的倒數月曆", hot:[110,24,14,14], text:"女兒房門上貼著一張紙：「學測倒數 247 天」。旁邊用爸爸的字寫著：「加油　爸爸載妳」。" } ] },
      { id:"lcar", name:"車棚", scene:"c6_licar", outdoor:true, details:[
        { id:"d6_charm", name:"後照鏡上的平安符", hot:[60,46,6,8], text:"後照鏡上掛著一個褪色的平安符，媽祖廟的。背面寫著：「國偉　工地平安」。" } ] } ],
    store: [ { id:"scounter", name:"7-11 濱海門市", scene:"c6_store", details:[
      { id:"d6_coffee", name:"咖啡機旁", hot:[40,40,12,12], text:"咖啡機旁邊貼著：「工地朋友　買咖啡送茶葉蛋」。茶葉蛋的鍋子咕嘟咕嘟地冒泡。" } ] } ],
    hongda: [ { id:"hshop", name:"宏達安全器材行", scene:"c6_hongda", details:[
      { id:"d6_cal2", name:"牆上的月曆", hot:[160,52,14,12], text:"月曆停在去年 6 月，上面只有一個日期被圈起來：「6/10　入帳」。" } ] } ],
    meihome: [ { id:"mroom", name:"陳家・客廳", scene:"c6_mei", details:[
      { id:"d6_bowl", name:"神明桌上的碗", hot:[42,36,8,4], text:"神明桌上一小碗羊肉爐，還溫溫的。陳美華說：「阿宏說，阿忠欠他一頓。我替他還。」" } ] } ]
  };

  /* ---------- 監視器動畫 ---------- */
  const ANIM = {
    cctv_helmet: { scene:"c6_helmet", cam:"HELMET CAM", date:"2026-05-13", beats:[
      { t:"22:43:40", d:3.5, cap:"濱海路往下坡，雨很大。機車的大燈照著路面。", st:{ v:"ride" } },
      { t:"22:44:05", d:4.5, cap:"左前方的避車彎裡，停著一台很高的深色車，沒開燈。", st:{ v:"ride", suv:[70,40,10] } },
      { t:"22:44:08", d:3.5, cap:"機車騎過避車彎。左後方傳來引擎猛催的聲音，越來越近。沒有喇叭，沒有煞車。", st:{ v:"ride", suv:[10,-40] } },
      { t:"22:44:10", d:2.5, cap:"「碰」——一大塊黑影從左邊衝進畫面。畫面翻轉。", st:{ v:"hit" } },
      { t:"22:44:13", d:3.5, cap:"攝影機掉進水溝，鏡頭朝上：護欄、雨。", st:{ v:"ditch" } },
      { t:"22:45:02", d:5.5, cap:"腳步聲。手電筒的光掃過來。一雙穿著反光條雨褲和工地鞋的腿，走路外八。男人的聲音：「……在哪……」", st:{ v:"ditch", legs:[200,120,90,110], beam:[150,60,110,40] } },
      { t:"22:46:10", d:3.5, cap:"遠遠的有人喊：「喂！」腳步聲跑走了，車門關上。", st:{ v:"ditch", legs:[110,220] } },
      { t:"22:46:20", d:3.5, cap:"一道大燈的光從畫面上方掃過去，引擎聲開遠了。只剩雨聲。", st:{ v:"ditch", lit:true } }
    ] },
    cctv_home: { scene:"c6_drive", cam:"CAM 大門", date:"2026-05-13", beats:[
      { t:"22:00:00", d:3, cap:"車道上沒有人。雨很大。", st:{ car:false } },
      { t:"22:20:00", d:4.5, cap:"莊文福把董事長的黑色轎車倒出來，停在雨棚下。", m:{ zhuangL:[130,98,"stand",-1,200,98] } },
      { t:"22:31:00", d:4, cap:"他開始打蠟，從引擎蓋擦起。", m:{ zhuangL:[126,98,"wipe@cloth",-1] } },
      { t:"22:44:00", d:4, cap:"22:44，他還在擦引擎蓋。", m:{ zhuangL:[122,98,"wipe2@cloth",-1,126,98] } },
      { t:"22:58:00", d:4, cap:"他蹲下來擦輪框。", m:{ zhuangL:[68,100,"kneel+wipe@cloth",1,122,98] } },
      { t:"23:05:00", d:4, cap:"他把車開回車庫，關燈，走回車庫旁邊的小房間。", st:{ car:false }, m:{ zhuangL:[200,98,null,1,68,100] }, out:["zhuangL"] }
    ] }
  };
  ANIM.cctv_store = { scene:"c6_store", opt:{ cam:true }, cam:"CAM 櫃台", date:"2026-05-12", beats:[
    { t:"18:39:50", d:4, cap:"一個很高的男人推門進來，頭撞到吊旗，低頭撥開。", m:{ liS:[40,98,null,1,-14,98] } },
    { t:"18:40:20", d:4.5, cap:"他在櫃台拿出一張紙，跟店員講話，把一張鈔票壓在紙下面推過去。", m:{ liS:[54,98,"give@paper",1,40,98], clerkS:[110,98,"stand",-1] } },
    { t:"18:41:00", d:4, cap:"店員把一張 SIM 卡交給他。他指了指菸櫃最上面一排。", m:{ liS:[54,98,"point",1], clerkS:[110,98,"give@card",-1] } },
    { t:"18:41:40", d:4, cap:"他轉身出門。背後印著「振東建設」。走路的時候，腳尖往外開。", m:{ liS:[-14,98,null,-1,54,98], clerkS:[110,98,"stand",-1] }, out:["liS"] }
  ] };
  Object.values(ANIM).forEach(A => { if (A.beats.some(b => b.st)) A.opt = Object.assign({}, A.opt || {}, { seq:A.beats.map(b => b.st || {}), ds:jds(A.beats) }); });
  [...EP6.cctv, ...EP6.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });
  const PS = [["c6_curve",{ mark:true }],["pol6",{}],["pol6",{}]];
  EP6.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 結案 ---------- */
  const F = 98;
  const RB = [
    { t:"22:02:00", d:5, cap:"5/13 22:02，振東建設車庫。黎國偉繞到警衛亭後面，拔掉監視器的延長線。阿彬在亭子裡看棒球，睡著了。", st:{ cam:false }, m:{ liC:[44,F,"stand",-1,80,F] } },
    { t:"22:04:00", d:4.5, cap:"22:04，他刷自己的卡打開鑰匙櫃，拿走范凱文那台灰色休旅車的鑰匙——那台車的 GPS，三月就被拆了。", st:{ cam:false }, m:{ liC:[30,F,"reach@key",-1,44,F] } },
    { t:"22:35:00", d:5, cap:"22:35，他把車熄燈停在濱海路的避車彎。從這裡，看得到彎道口的反光鏡。他下車抽了三根菸。", st:{ cam:false, suv:60 }, m:{ liC:[104,F,"smoke",1,30,F] }, },
    { t:"22:39:00", d:4.5, cap:"22:39，他用那支預付卡打給柯建宏：「到哪裡了？」——「快到了，濱海路。」", st:{ cam:false, suv:60 }, m:{ liC:[104,F,"phone",1] } },
    { t:"22:44:08", d:4, cap:"22:44，柯建宏的大燈出現在反光鏡裡。他騎過避車彎——", st:{ cam:false, suv:[60,62], sc:[40,96] }, out:["liC"] },
    { t:"22:44:10", d:4, cap:"黎國偉不開燈，油門踩到底，從左後方把他撞上護欄。", st:{ cam:false, suv:[62,128], sc:[96,150], flash:true, dmg:true } },
    { t:"22:45:00", d:5, cap:"他下車，打開手機架，拿走柯建宏的手機。然後拿手電筒在水溝邊找那台安全帽攝影機——找不到。", st:{ cam:false, suv:128, sc:150, crash:true, dmg:true }, m:{ liC:[172,F,"kneel+aim@torch",1,140,F] } },
    { t:"22:46:10", d:4.5, cap:"堤防上，洪伯大喊：「喂！」他跑回車上，這時候才打開大燈。", st:{ cam:false, suv:[128,220], sc:150, crash:true, dmg:true, lit:true }, m:{ liC:[150,F,null,-1,172,F] }, out:["liC"] },
    { t:"23:21:00", d:5, cap:"23:21，鑰匙回到鑰匙櫃。23:30，監視器亮了回來。他算準了：老闆兒子的車撞了人，老闆一定會替兒子擺平。", st:{ cam:true }, m:{ liC:[30,F,"stand",1,60,F] } }
  ];
  EP6.court = {
    title: "振東建設車庫・5 月 15 日中午", scene: "c6_garage",
    who: ph => ["li","kai","dong","zhuang","bin","shufen","qi"],
    open: ph => "12:20，振東建設的車庫。葉晴站在 ZD-7 旁邊看了一下錶。莊文福是員警帶過來的，范振東跟范凱文站在另一邊，誰也不看誰。黎國偉戴著安全帽來，進門的時候低了一下頭。柯雅琪站在最後面，手裡抱著哥哥的外送外套。",
    kindLine: {
      hitrun: "這是一場雨夜的意外。撞到人的那個人，嚇得逃走了。",
      murder: "這不是意外。有人熄了燈，在避車彎等他。",
      self: "雨太大，他在彎道自己打滑，撞上了護欄。"
    },
    murmur: [ "（范凱文一直在摳自己的手指。）", "（莊文福看著地上。）", "（黎國偉把安全帽拿下來，又戴回去。）" ],
    confess: {
      li: [ "去年那天，網子晚到了一天。我想說，一天而已，大家小心一點。", "阿忠摔下來的時候，我站在下面。我第一個想到的，不是他，是那三十八萬。", "柯建宏打給我那天，他說：『主任，你出來說，我不會恨你。』我說我考慮。", "我考慮了兩天。……我考慮的是，怎麼樣讓別人替我扛。" ],
      dong: [ "我以為是凱文。他喝成那樣，車又凹了。我只有這一個兒子。", "我做了三十年建設，什麼都擺得平。……原來我擺的，是別人替我挖好的坑。" ],
      zhuang: [ "我開了二十年車，從來沒有撞過人。……我只是想讓我女兒讀完書。" ]
    },
    cornered: { li: "……28 號半。工地發的鞋，大家都一樣。可是鞋跟磨成這樣的，只有我。" },
    deny: {
      kai: "我那天在金麗都！我連車都沒開！",
      dong: "老莊是自己願意的。我只是幫他女兒一個忙。",
      zhuang: "是我撞的……是我。",
      bin: "我整晚都有巡……好啦，我睡著了。",
      shufen: "他說他在家……他跟我說他一直都在家。",
      qi: "我哥不會自己摔車。他騎得比誰都小心。"
    },
    replayText: "5 月 12 日傍晚，7-11 濱海門市。一個很高的男人低頭閃過門口的吊旗，把一張已經回國的移工的居留證影本放在櫃台上——",
    replay: { scene:"c6_cut", opt:{ seq:RB.map(b => b.st || {}), ds:jds(RB) }, clean:true, cam:"案發經過重現", date:"2026-05-13", beats:RB },
    endGood: "13:00，葉晴撤回了莊文福的起訴，改用殺人罪起訴黎國偉。范振東被依教唆頂替起訴，莊文福也沒有逃過頂替罪。\n《澄港日報》頭版是何沛恩寫的：〈網子晚到的那一天〉。勞動檢查處重開了陳志忠的案子。\n6 月 1 日，海灣一號沒有開賣。\n柯雅琪把哥哥存的 31 萬，交給了陳美華。陳美華的女兒畫了一隻新的長頸鹿：戴著兩頂安全帽。",
    endBad: "13:00，葉晴用「過失致死、肇事逃逸」起訴莊文福。他當庭認罪，判了一年十個月，緩刑。\n6 月 1 日，海灣一號公開銷售，第一天賣掉了一半。剪綵的照片上，黎國偉站在董事長旁邊。\n柯建宏筆電裡那個叫「阿忠」的資料夾，沒有人再打開過。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[6] && ARC_INTER[6].after) EP6.after = ARC_INTER[6].after;

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP6.outScenes = ["c6_curve","c6_turn","c6_bank","c6_scaf"];
  EP6.fac = { road:["#2a2e34","#f2c94c"], kohome:["#c8bca4","#5a4a3a"], police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], garage:["#9a9a92","#3a4a5a"],
    fanhome:["#e8e0d0","#8a6a4a"], lihome:["#d8d4c4","#5a5e64"], store:["#f4f4f0","#2a8a4a"], hongda:["#8a8a82","#e86a2a"], site:["#b8b4ac","#2a5a8a"], meihome:["#d8c8a8","#7a6a54"] };
  EP6.setting = { road:"town", kohome:"town", police:"city", lab:"city", garage:"city", fanhome:"city", lihome:"town", store:"town", hongda:"city", site:"town", meihome:"town" };
  const SKY6 = [ ["#0a0f1c","#1c2636","#14181e","#1a1e26",0,0], ["#8a9ab0","#d8dee4","#4a5060","#56606a",0,0], ["#9cb8d8","#e8eef0","#4a6070","#56707a",0,0] ];
  EP6.worldSky = ph => SKY6[Math.min(ph || 0, SKY6.length - 1)];
  EP6.roomDesc = {
    rcurve:"濱海路的彎道。護欄外面就是海。", rturn:"彎道前面三十公尺的避車彎，旁邊一棵木麻黃。", rbank:"彎道下面的堤防，水溝沿著堤防流進海裡。",
    kliving:"漁港邊的老公寓，兩房一廳。", kroom:"柯建宏的房間。書桌很整齊，牆上貼滿照片。",
    pdesk:"澄港市刑大。你的位子在窗邊。", lab:"鑑識中心。小吳的桌子永遠很亂。",
    gpark:"振東建設在濱海工業區的車庫，日光燈嗡嗡地響。", gbooth:"車庫門口的警衛亭，一張桌子、一台小電視、一面鑰匙櫃。",
    fliving:"范家的客廳，一整面牆的獎牌。", fquarter:"車庫旁邊的小房間，司機莊文福住了二十年。",
    soffice:"海灣一號的工務所，一個貨櫃屋。門框很低。", sscaf:"大樓腳下。鷹架一路搭到 15 樓，外面掛著綠色的網子。", spump:"地下二樓的抽水機房，很潮濕。",
    mroom:"北澳漁村的陳家。牆上貼滿小孩的畫。", lliving:"工業區老宿舍的三樓，客廳很小，角落一台機器一直在響。", lcar:"宿舍樓下的車棚。", scounter:"濱海路口的 7-11，冷氣很強。", hshop:"工業區後巷的小倉庫，鐵捲門拉起一半。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police" };
  EP6.world = {};
  EP6.locations.forEach(l => { EP6.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP6.world.road, {
    extras: [
      { id:"cop6", name:"派出所員警", phase:0, until:0, x:RX(0) + 30, L:COP, pose:"stand", facing:1, lines:[
        "我們 22:58 到的。那個阿伯一直站在雨裡等我們，全身都濕了。", "現場只有那台機車，沒有別的車。肇事的已經跑了。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { car:[-60, 8, 2.4, "#e9e4da"], hide:true },
      { wait:0.5, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長，濱海路的彎道。外送員柯建宏，32 歲，機車撞上護欄，人已經走了。", "小吳"),
      say("wu", "報案的是在堤防釣魚的阿伯，他說聽到『碰』一聲。現場沒有別的車。", "小吳"),
      say("you", "下這麼大的雨，是自己摔的，還是被撞的？", "你"),
      say("wu", "老錢在看。地上有一些碎片……雨一直在沖，要看就快點看。", "小吳"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳")
    ]
  });
  EP6.mapPos = { road:[150,104,"d"], kohome:[40,100,"l"], police:[110,50,"u"], lab:[140,40,"u"], garage:[190,70,"r"], fanhome:[60,30,"u"], site:[200,110,"d"], meihome:[16,70,"l"], lihome:[214,60,"r"], store:[176,96,"u"], hongda:[226,36,"r"] };
  EP6.mapRoads = [["police","lab"],["police","road"],["road","site"],["road","kohome"],["police","garage"],["garage","road"],["police","fanhome"],["kohome","meihome"],["garage","lihome"],["road","store"],["lihome","hongda"]];
  EP6.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#8a9a8a"); dither(0, 0, 240, 135, "#94a494", 3);
    const blocks = (x0, y0, x1, y1, c, c2) => { for (let x = x0; x < x1; x += 8) for (let y = y0; y < y1; y += 7) { R(x, y, 6, 5, c); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, c2); } };
    blocks(70, 20, 180, 80, "#c8c0b0", "#b0a898");
    R(0, 116, 240, 19, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 116 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");   // 海
    R(110, 100, 120, 3, "#5a5a5a");   // 濱海路
    R(196, 96, 18, 14, "#b8b4ac"); R(200, 92, 10, 6, "#3a8a4a");   // 海灣一號
  };
})();
