/* =========================================================
   第 24 集：像素畫、人物造型、結案、走動畫面、地圖、開場
   ========================================================= */
EP24.art = true;
(() => {
  const PR = PX.prim, { R, P, INK } = PR;
  const W = 192, H = 108;
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i] = beatAt(o.t || 0, o.ds); return (o.seq || [])[i] || {}; };
  const glow = (x, y, r, rgb, a) => { for (let k = r; k > 0; k -= 2){ const al = Math.round(a * (1 - k / r) * 255).toString(16).padStart(2, "0"); R(x - k, y - k * 0.7, k * 2, k * 1.4, rgb + al); } };
  const tiles = (y, c, l) => { R(0, y, W, H - y, c); for (let x = 0; x < W; x += 12) R(x, y, 1, H - y, l); for (let yy = y; yy < H; yy += 6) R(0, yy, W, 1, l); };
  // 護理之家的牆：米白、扶手、下半淺藍的腰牆
  const careWall = (y, night) => {
    R(0, 0, W, y, night ? "#a8a494" : "#efe8d8"); R(0, y - 26, W, 26, night ? "#7a8a94" : "#b8d0dc"); R(0, y - 27, W, 1, night ? "#5a6a74" : "#8aa8b8");
    R(0, y - 34, W, 3, night ? "#8a6a4a" : "#c89a6a"); R(0, y - 31, W, 1, night ? "#6a4a2a" : "#9a6a3a");   // 扶手
  };
  const ceilLight = (x, night) => { R(x, 2, 30, 3, night ? "#c8c8b0" : "#f8f4e0"); glow(x + 15, 8, 16, night ? "#e8e0b8" : "#fff8e0", night ? 0.12 : 0.18); };
  const dark = a => R(0, 0, W, H, "#0a1020" + a);

  /* ---------- 大廳：左邊警衛桌（監視器主機、夜間登記簿）、中間櫃台（訪客登記簿）、魚缸、門口公告、自動門 ---------- */
  SC.c24_lobby = (o) => { o = Object.assign({}, o, stOf(o)); const night = !!o.night;
    careWall(86, night); ceilLight(70, night);
    R(0, 0, W, 6, night ? "#8a8676" : "#d8d0bc");
    // 警衛桌
    R(4, 58, 40, 28, "#6a5a48"); R(4, 58, 40, 2, "#8a7a68"); R(8, 44, 24, 14, "#2a2a2e"); R(9, 45, 22, 11, "#1a2a3a");
    for (let k = 0; k < 4; k++) R(10 + (k % 2) * 11, 46 + (k > 1 ? 5 : 0), 10, 4, k === 1 ? "#4a6a5a" : "#3a4a5a");   // 四格監視畫面
    R(18, 56, 4, 2, "#2a2a2e"); R(24, 60, 14, 5, "#2a4a8a"); R(25, 61, 12, 1, "#e8e0c8");   // 夜間登記簿
    // 櫃台
    R(76, 58, 56, 28, "#c8a878"); R(76, 58, 56, 2, "#e0c898"); R(80, 64, 48, 18, "#b8986a"); txt("服務台", 92, 75, "#7a5a3a", "6px sans-serif");
    R(96, 55, 22, 5, "#f4f0e4"); R(97, 56, 20, 1, "#7a7a8a"); R(110, 52, 1, 4, "#2a2a2a");   // 訪客登記簿和筆
    // 魚缸
    R(128, 58, 22, 16, "#3a6a8a"); R(129, 59, 20, 14, night ? "#3a5a7a" : "#6ab0d8"); R(132, 64, 3, 2, "#f0a040"); R(140, 68, 3, 2, "#e86a4a"); R(144, 62, 2, 1, "#f0d040"); R(128, 74, 22, 12, "#5a4a3a");
    // 門口公告和自動門
    R(150, 22, 26, 18, "#f4f0e4"); R(150, 22, 26, 3, "#3a8a6a"); for (let k = 0; k < 4; k++) R(153, 28 + k * 3, 18 - (k % 2) * 5, 1, "#5a5a6a");
    R(156, 42, 34, 44, night ? "#3a4a5a" : "#a8c8d8"); R(172, 42, 2, 44, "#7a8a94"); R(156, 42, 34, 2, "#7a8a94");
    if (night){ R(157, 44, 32, 40, "#0a1428"); R(160, 50, 6, 6, "#ffe8a0"); }
    tiles(86, night ? "#8a8274" : "#d8ccb4", night ? "#7a7264" : "#c8bca4");
  };

  /* ---------- 護理站（也是走廊）：藥車、櫃台上的點班本、呼叫鈴面板、巡房單、白板 ---------- */
  SC.c24_station = (o) => { o = Object.assign({}, o, stOf(o)); const night = !!o.night;
    careWall(86, night); ceilLight(40, night); ceilLight(130, night);
    // 呼叫鈴面板
    R(100, 24, 24, 12, "#4a4e52"); for (let k = 0; k < 6; k++){ const on = o.bell && k === 4; R(102 + k * 4, 26, 3, 3, on ? "#ff4a3a" : "#2a2a2a"); txt(String(301 + k), 101 + k * 4, 34, "#c8c8c0", "3px monospace"); } if (o.bell) glow(118, 27, 8, "#ff4a3a", 0.35);
    // 櫃台
    R(52, 52, 80, 34, "#e8e0cc"); R(52, 52, 80, 3, "#c8b898"); R(56, 60, 72, 22, "#d8ccb0"); R(60, 44, 22, 9, "#3a5a8a"); R(61, 45, 20, 1, "#e8e0c8"); R(62, 48, 16, 1, "#e8e0c8");   // 點班本（立在櫃台上）
    R(90, 46, 14, 8, "#2a2a2e"); R(91, 47, 12, 5, night ? "#2a4a3a" : "#3a6a5a");   // 小螢幕
    txt("護理站", 80, 72, "#8a7a5a", "6px sans-serif");
    // 巡房單
    R(136, 36, 14, 18, "#a87a4a"); R(137, 38, 12, 15, "#f4f0e4"); R(140, 36, 6, 2, "#6a6a6a"); for (let k = 0; k < 4; k++){ R(139, 41 + k * 3, 6, 1, "#5a5a6a"); P(146, 41 + k * 3, k === 1 ? "#3a3aa8" : "#2a2a2a"); }
    // 白板
    R(160, 20, 26, 22, "#f8f8f4"); R(160, 20, 26, 1, "#9a9a9a"); R(160, 41, 26, 1, "#9a9a9a"); for (let k = 0; k < 5; k++) R(163, 24 + k * 3, 16 - (k % 3) * 3, 1, k === 2 ? "#e8f0f8" : "#2a4a8a"); R(162, 38, 20, 2, "#c8c8c8");
    // 藥車
    R(20, 58, 26, 26, "#c8ccd0"); R(20, 58, 26, 2, "#e8ecf0"); for (let k = 0; k < 3; k++){ R(22, 62 + k * 7, 22, 6, "#a8acb0"); R(31, 64 + k * 7, 4, 1, "#5a5a5a"); }
    if (o.drawer) R(22, 61, 22, 3, "#e8e4d4");   // 抽屜拉開
    R(44, 60, 2, 2, o.locked ? "#3a3a3a" : "#e8c040");   // 按鈕鎖（彈起來＝黃色）
    for (const x of [22, 42]) R(x, 84, 3, 2, "#2a2a2a");
    // 紅色的感染性垃圾桶
    R(148, 70, 12, 16, "#c83a2a"); R(147, 68, 14, 3, "#a82a1a"); R(150, 76, 8, 4, "#f4f0e4"); R(152, 77, 4, 2, "#c83a2a");
    tiles(86, night ? "#8a8a80" : "#d0d4cc", night ? "#7a7a70" : "#c0c4bc");
    if (night) dark("44");
  };

  /* ---------- 301 病房：病床、鼻胃管、眼控平板、床頭的同意書、窗戶和紙鶴、照片、右邊的浴室 ---------- */
  SC.c24_301 = (o) => { o = Object.assign({}, o, stOf(o)); const night = !!o.night;
    careWall(86, night); ceilLight(86, night);
    // 窗戶和窗台上的紙鶴
    R(52, 18, 22, 22, "#8a7a68"); R(54, 20, 18, 18, night ? "#1a2238" : "#c8e0d0"); R(62, 20, 1, 18, "#8a7a68"); if (!night){ R(56, 24, 6, 8, "#5a8a4a"); R(64, 22, 6, 10, "#6a9a5a"); P(58, 26, "#f4f0f4"); P(66, 25, "#f4f0f4"); }
    R(50, 40, 26, 2, "#a89a88"); for (let k = 0; k < 7; k++){ R(51 + k * 3.5, 37, 3, 3, "#f4f4ec"); P(52 + k * 3.5, 37, "#8a8aa8"); }
    // 床頭的同意書（夾板）
    R(30, 34, 16, 12, "#a87a4a"); R(31, 35, 14, 10, "#f4f0e4"); for (let k = 0; k < 3; k++) R(33, 37 + k * 2.5, 10, 1, "#5a5a6a"); R(35, 33, 6, 2, "#8a8a8a");
    // 照片
    R(134, 22, 16, 12, "#6a4a2a"); R(135, 23, 14, 10, "#c8b888"); R(136, 24, 6, 5, "#2a3a2a"); R(143, 27, 2, 4, "#4a3a2a"); R(146, 28, 2, 3, "#4a3a2a");
    // 病床（頭在左）
    R(56, 52, 4, 28, "#9aa0a6"); R(136, 56, 4, 24, "#9aa0a6"); R(58, 62, 80, 8, "#c8ccd0"); R(58, 70, 80, 4, "#9aa0a6"); for (const x of [60, 132]) R(x, 74, 4, 10, "#7a8086"), R(x - 1, 84, 6, 2, "#2a2a2a");
    R(60, 56, 18, 7, "#f8f8f4"); R(60, 56, 18, 1, "#e0e0dc");   // 枕頭
    if (o.body !== false){
      R(66, 52, 10, 8, "#e0c4a8"); R(66, 52, 10, 2, "#c8c8c4"); R(68, 56, 2, 1, "#8a7a6a"); R(72, 56, 2, 1, "#8a7a6a"); R(70, 58, 3, 1, "#b8a090");   // 頭（閉著眼）
      R(76, 57, 12, 1, "#e8d878"); R(74, 56, 4, 2, "#f4f4f0");   // 鼻胃管的膠帶和管子
      R(78, 58, 60, 6, o.cover ? "#f4f4f0" : "#e8eef4"); R(78, 58, 60, 1, "#c8d0d8"); for (let x = 84; x < 136; x += 10) R(x, 60, 6, 1, "#d0d8e0");   // 被子
      if (o.cover) R(64, 51, 14, 8, "#f4f4f0");
    } else { R(78, 58, 60, 6, "#e8eef4"); R(78, 58, 60, 1, "#c8d0d8"); }
    // 鼻胃管接頭（垂在床邊）
    if (o.body !== false){ R(77, 58, 1, 3, "#e8d878"); R(78, 60, 1, 3, "#e8d878"); R(79, 62, 1, 4, "#e8d878"); R(80, 65, 1, 3, "#e8d878"); }
    if (o.body !== false){ R(78, 67, 5, 4, "#5a8ac8"); R(79, 71, 3, 1, "#3a6aa8"); R(83, 67, 2, 2, o.capOpen === false ? "#5a8ac8" : "#f4f4f0"); }   // 垂在床邊的接頭
    // 眼控平板（支架）
    R(112, 44, 2, 18, "#6a6e72"); R(104, 30, 18, 14, "#2a2a2e"); R(105, 31, 16, 10, night ? "#1a3a5a" : "#3a6a9a"); R(106, 42, 14, 2, "#1a1a1a"); P(109, 43, "#e83a2a"); P(116, 43, "#e83a2a");
    if (o.typed){ for (let k = 0; k < 2; k++) R(107, 33 + k * 3, 10 - k * 3, 1, "#e8f4ff"); }
    // 浴室門、垃圾桶
    R(158, 30, 30, 56, "#d8ccb4"); R(160, 32, 26, 54, "#e8dcc4"); R(182, 56, 2, 4, "#8a8a8a"); txt("浴室", 166, 42, "#9a8a6a", "5px sans-serif");
    R(168, 72, 12, 12, "#a8acb0"); R(167, 71, 14, 2, "#8a8e92"); R(170, 70, 6, 2, "#f4f4f0");
    if (o.tape) PR.OBJ.tape(4, 76, 50);
    tiles(86, night ? "#8a8a80" : "#dcd8c8", night ? "#7a7a70" : "#ccc8b8");
    if (night) dark("40");
  };

  /* ---------- 交誼廳：鋼琴、電視櫃、零用金罐、沙發、窗邊、天花板角落的監視器 ---------- */
  SC.c24_lounge = (o) => { o = Object.assign({}, o, stOf(o)); const night = !!o.night;
    careWall(86, night); ceilLight(90, night && !o.lightsOn);
    R(182, 4, 8, 5, "#3a3a3a"); R(183, 8, 4, 2, "#1a1a1a"); P(188, 5, "#ff3a2a");   // 監視器
    // 窗
    R(140, 14, 40, 30, "#8a7a68"); R(142, 16, 36, 26, night ? "#141c30" : "#b8d8e8"); R(160, 16, 1, 26, "#8a7a68"); if (!night){ R(146, 28, 10, 14, "#7aa86a"); R(164, 24, 10, 18, "#6a9a5a"); }
    // 窗邊的輪椅
    R(150, 62, 3, 18, "#6a6e72"); R(152, 70, 16, 3, "#3a4a6a"); R(152, 62, 3, 9, "#3a4a6a"); R(166, 66, 2, 6, "#6a6e72"); R(165, 64, 6, 2, "#6a6e72");
    for (let a = 0; a < 360; a += 8){ const r = a * Math.PI / 180; P(Math.round(158 + 6 * Math.cos(r)), Math.round(80 + 6 * Math.sin(r)), "#4a4a4e"); } R(157, 79, 2, 2, "#4a4a4e"); R(152, 79, 12, 1, "#6a6a6e"); R(166, 84, 3, 2, "#2a2a2a");
    if (!o.noOrange) R(164, 63, 3, 2, "#f0a030");
    // 鋼琴
    R(18, 50, 34, 30, "#3a2418"); R(18, 50, 34, 3, "#5a3a28"); R(20, 64, 30, 4, "#f4f0e0"); for (let k = 0; k < 10; k++) R(21 + k * 3, 64, 1, 3, "#2a2a2a"); R(28, 54, 12, 8, "#f4f0e0"); R(30, 56, 8, 1, "#5a5a5a"); R(18, 80, 3, 6, "#2a1a10"); R(49, 80, 3, 6, "#2a1a10");
    // 電視和櫃子
    R(70, 24, 30, 20, "#1a1a1e"); R(72, 26, 26, 16, night ? (o.tvOff ? "#0a0a0e" : "#2a4a6a") : "#4a7a9a"); R(84, 44, 4, 4, "#2a2a2a");
    R(64, 48, 76, 12, "#a87a4a"); R(64, 48, 76, 2, "#c89a6a"); R(66, 52, 72, 6, "#9a6a3a"); R(100, 54, 2, 2, "#e8c070");
    // 零用金罐
    R(120, 46, 14, 10, "#c8a838"); R(120, 46, 14, 2, "#e8c858"); R(123, 50, 8, 4, "#f4f0e4"); R(124, 51, 6, 1, "#5a5a5a"); R(125, 45, 4, 1, "#3a3a3a");
    // 沙發
    R(70, 64, 60, 16, "#7a9a8a"); R(70, 60, 60, 6, "#6a8a7a"); R(66, 62, 6, 18, "#6a8a7a"); R(128, 62, 6, 18, "#6a8a7a"); R(80, 64, 18, 4, "#d8c8a8");
    tiles(86, night ? "#8a8270" : "#d8c8a8", night ? "#7a7260" : "#c8b898");
    if (night) dark(o.lightsOn ? "30" : "55");
  };

  /* ---------- 員工休息室：一排置物櫃、阿蘭的櫃子、長椅、熱水壺 ---------- */
  SC.c24_staff = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#c8c4b4"); R(0, 60, W, 26, "#a8a494"); ceilLight(80, true);
    for (let k = 0; k < 4; k++){ const x = 20 + k * 12; R(x, 24, 11, 56, "#8a9aa8"); R(x + 1, 26, 9, 52, "#9aaab8"); R(x + 2, 30, 6, 1, "#5a6a78"); R(x + 7, 50, 1, 4, "#3a3a3a"); R(x + 3, 34, 4, 2, "#f4f0e4"); }
    R(62, 24, 18, 56, "#8a9aa8"); R(64, 26, 14, 52, "#2a2e32"); R(78, 24, 3, 56, "#9aaab8");   // 阿蘭的櫃子（開著）
    R(66, 32, 10, 2, "#6a6e72"); R(64, 40, 14, 12, "#2a2e32"); R(66, 42, 9, 8, "#f0a0b0"); R(67, 41, 2, 2, "#f0a0b0"); R(74, 45, 2, 2, "#e890a0"); P(70, 44, "#2a2a2a"); R(68, 41, 3, 1, "#c87080");   // 小豬存錢筒
    R(66, 56, 10, 14, "#6a7a9a"); R(67, 58, 8, 1, "#4a5a7a");   // 掛著的圍裙
    R(100, 66, 60, 4, "#8a6a4a"); R(104, 70, 3, 16, "#6a4a2a"); R(152, 70, 3, 16, "#6a4a2a");   // 長椅
    R(160, 48, 24, 4, "#a87a4a"); R(166, 40, 8, 8, "#c8c8c8"); R(174, 42, 2, 3, "#c8c8c8"); R(168, 38, 4, 2, "#3a3a3a");   // 熱水壺
    R(120, 20, 30, 20, "#f4f0e4"); txt("徵照服員", 124, 30, "#c83a2a", "5px sans-serif"); R(124, 33, 22, 1, "#5a5a6a");
    tiles(86, "#9a9888", "#8a8878");
  };

  /* ---------- 何美玲的家：客廳正中間的電動病床、餐桌和包包、書架、窗外的夜 ---------- */
  SC.c24_home = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#d8c8a8"); R(0, 0, W, 4, "#c8b898"); for (let x = 0; x < W; x += 16) R(x, 4, 1, 82, "#ccbc9c");
    R(84, 10, 40, 30, "#6a5a48"); R(86, 12, 36, 26, "#141a2a"); R(104, 12, 1, 26, "#6a5a48"); P(92, 18, "#ffe8a0"); P(114, 22, "#ffe8a0"); P(98, 30, "#c8d0e8");   // 窗
    R(130, 12, 20, 24, "#f4f0e4"); R(131, 13, 18, 4, "#c83a2a"); for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) R(132 + i * 3, 19 + j * 4, 2, 2, "#8a8a8a");   // 月曆
    glow(60, 20, 26, "#ffe8b0", 0.18); R(56, 0, 8, 6, "#a87a4a"); R(54, 6, 12, 4, "#f4e8c0");   // 吊燈
    // 電動病床
    R(14, 54, 44, 4, "#c8ccd0"); R(14, 58, 44, 6, "#f4f4f0"); R(14, 58, 44, 1, "#d8dce0"); R(14, 64, 44, 4, "#9aa0a6"); R(12, 46, 3, 30, "#9aa0a6"); R(56, 50, 3, 26, "#9aa0a6"); for (const x of [16, 52]) R(x, 68, 3, 12, "#7a8086"), R(x - 1, 80, 5, 2, "#2a2a2a");
    R(16, 52, 12, 6, "#f8f8f4");   // 枕頭
    // 餐桌和包包
    R(80, 66, 56, 4, "#7a5a3a"); R(84, 70, 3, 16, "#5a3a2a"); R(128, 70, 3, 16, "#5a3a2a"); R(96, 58, 18, 9, "#6a3a3a"); R(98, 56, 14, 2, "#4a2a2a"); R(102, 54, 6, 2, "#4a2a2a");
    R(120, 62, 6, 4, "#f4f4f0"); R(121, 61, 4, 1, "#c8c8c8");   // 一杯水
    // 書架
    R(146, 30, 30, 56, "#7a5a3a"); for (let s = 0; s < 4; s++){ R(146, 40 + s * 12, 30, 2, "#5a3a2a"); for (let b = 0; b < 6; b++) if (!(s === 2 && b === 1)) R(148 + b * 4.5, 32 + s * 12, 4, 8, ["#3a5a8a","#8a3a3a","#c8a838","#4a7a4a","#e8e0c8","#6a4a7a"][(b + s) % 6]); }
    R(150, 54, 16, 6, "#3a6a8a"); R(151, 55, 14, 1, "#e8e0c8");   // 數學作業簿（橫放）
    tiles(86, "#8a6a4a", "#7a5a3a");
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    mei:  { skin:"#f0d0b4", hair:"#2a2220", hairStyle:"long", top:"#7a8a9a", coat:"#3a3a48", bottom:"#3a3a44", mood:"tired", hello:"……你們好。" },
    son:  { skin:"#e0b48e", hair:"#1a1a1a", hairStyle:"slick", top:"#e8ecf0", coat:"#2a3a5a", bottom:"#2a2a34", tie:"#7a2a2a", hello:"你們終於來了！" },
    lan:  { skin:"#d8a880", hair:"#3a2a20", hairStyle:"bun", top:"#8ab4c8", bottom:"#4a5a6a", apron:"#6a7a9a", mood:"worried", hello:"……警察先生。" },
    jing: { skin:"#f0d0b4", hair:"#2a2220", hairStyle:"pony", top:"#f4f6f6", bottom:"#f4f6f6", stetho:true, hello:"我昨晚值大夜……" },
    dir:  { skin:"#e8c0a0", hair:"#4a3a30", hairStyle:"bob", top:"#c8a8b8", coat:"#5a4a5a", bottom:"#3a3040", glasses:true, hello:"我們一切都照規定。" },
    liao: { age:"old", skin:"#d8a880", hair:"#9a9a94", hairStyle:"short", top:"#3a4a6a", bottom:"#2a2a34", hat:"cap", capColor:"#2a3a5a", hello:"晚上的事問我就對了。" },
    xu:   { hello:"先不要碰他。" },
    wu:   { hello:"院長說了四次「自然死亡」。" },
    kui:  { hello:"前輩，平板在這裡！" }
  };
  ["xu","wu","kui"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.kui.top) Object.assign(LOOK.kui, { skin:"#f0d0b4", hair:"#5a3a2a", hairStyle:"bob", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050" });
  if (!LOOK.xu.top) Object.assign(LOOK.xu, { skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" });
  if (!LOOK.wu.top) Object.assign(LOOK.wu, { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050", glasses:true });
  const DAILY = {
    mei:  [ { room:"lounge", x:150, pose:"sit", doing:"坐在交誼廳的窗邊，手裡捏著一條圍巾。" }, { room:"mhome", x:76, pose:"sit", doing:"坐在餐桌旁邊，看著客廳那張空的病床。" } ],
    son:  [ { room:"r301", x:150, pose:"stand", doing:"站在 301 門口，雙手插在口袋裡，一直看著床。" }, { room:"lobby", x:136, pose:"phone", doing:"在大廳講電話，聲音很大。" } ],
    lan:  [ { room:"lounge", x:56, pose:"stand", doing:"站在鋼琴旁邊，圍裙的口袋鼓鼓的。" }, { room:"staff", x:120, pose:"sit", doing:"坐在休息室的長椅上，眼睛紅紅的。" } ],
    jing: [ { room:"station", x:70, pose:"stand", doing:"站在護理站，一直看著藥車。" }, { room:"station", x:120, pose:"write", doing:"在護理站寫交班紀錄，寫寫停停。" } ],
    dir:  [ { room:"lobby", x:112, pose:"read", doing:"在服務台翻評鑑的資料夾。" }, { room:"lobby", x:90, pose:"stand", doing:"站在服務台後面，一直看手錶。" } ],
    liao: [ { room:"lobby", x:30, pose:"sit", doing:"坐在警衛桌，被院長叫來加班。" }, null ],
    xu:   [ { room:"r301", x:96, pose:"inspect", doing:"站在床邊，看著鼻胃管的接頭。" }, { room:"lab", x:100, pose:"read", doing:"在鑑識中心看化驗單。" } ],
    wu:   [ { room:"station", x:150, pose:"write", doing:"在護理站抄東西，一邊推眼鏡。" }, { room:"lounge", x:100, pose:"stand", doing:"抬頭看著交誼廳角落的監視器。" } ],
    kui:  [ null, { room:"lab", x:60, pose:"type", doing:"對著電腦，接著那台眼控平板。" } ]
  };
  EP24.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP24.rooms = {
    anhe: [
      { id:"lobby", name:"一樓大廳", scene:"c24_lobby", opt:(ph) => ({ night:ph === 1 }), details:[
        { id:"d24_doorbell", name:"大門旁邊的門鈴", hot:[150,46,6,6], text:"大門旁邊一個白色的門鈴，按下去，警衛桌會響。下面貼著：「22:00 後請按鈴」。" },
        { id:"d24_light", name:"天花板的燈", hot:[70,2,30,6], text:"日光燈的燈罩裡，積了一層死掉的小蟲。" } ] },
      { id:"station", name:"護理站", scene:"c24_station", opt:(ph) => ({ night:ph === 1, locked:false }), details:[
        { id:"d24_redbin", name:"紅色的垃圾桶", hot:[146,68,16,18], text:"護理站的紅色感染性垃圾桶。裡面一堆用過的灌食空針，每一支都貼著床號。沒有 301 昨晚的。" },
        { id:"d24_screen", name:"櫃台的小螢幕", hot:[90,46,14,8], text:"給藥系統的畫面：301 何振聲　1/5 22:00　Zolpidem 10mg ×1　陳靜宜。" } ] },
      { id:"r301", name:"301 病房", scene:"c24_301", opt:(ph) => ph === 0 ? { body:true, cover:false } : { body:false, tape:true, night:true }, details:[
        { id:"d24_cranes", name:"窗台", hot:[50,36,26,6], text:"窗台上一排紙鶴，紙是批改過的數學考卷，紅筆的勾勾還看得到。" },
        { id:"d24_rail", name:"床尾", hot:[132,56,10,18], text:"床尾掛著翻身時間表：每兩小時一次。最後一格「02:00」，打了勾。" } ] },
      { id:"lounge", name:"交誼廳", scene:"c24_lounge", opt:(ph) => ({ night:ph === 1, lightsOn:true }), details:[
        { id:"d24_cam", name:"角落的監視器", hot:[180,2,10,8], text:"天花板角落的監視器，紅燈亮著。鏡頭正對著電視櫃和沙發。" },
        { id:"d24_window", name:"窗邊的輪椅", hot:[146,60,26,28], text:"窗邊一張空的輪椅。扶手上放著半顆剝好的橘子。" } ] },
      { id:"staff", name:"員工休息室", scene:"c24_staff", phase:1, details:[
        { id:"d24_kettle", name:"熱水壺", hot:[160,38,24,14], text:"熱水壺旁邊一排泡麵的空碗。大夜班的晚餐。" } ] }
    ],
    lab: [ { id:"lab", name:"鑑識中心", scene:"lab", details:[
      { id:"d24_tray", name:"桌上的托盤", hot:[100,44,24,10], text:"托盤上一支空針，活塞被拉出來，貼著黃色的標籤：「301 浴室」。" } ] } ],
    meihome: [ { id:"mhome", name:"何美玲的家", scene:"c24_home", details:[
      { id:"d24_calendar", name:"牆上的月曆", hot:[130,12,20,24], text:"月曆停在去年九月，沒有再翻。九月十二日被圈起來：「爸　入住安和」。" },
      { id:"d24_cup", name:"一杯水", hot:[118,60,10,6], text:"一杯水，旁邊一排藥袋，全部是父親的名字，日期到去年九月。" } ] } ]
  };
  const PS = [["c24_301",{ body:true, cover:false }],["c24_station",{ night:true }]];
  EP24.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 監視器動畫 ---------- */
  const strip = L => { const o = Object.assign({}, L); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  EP24.looks = { meiC: strip(LOOK.mei), jingC: strip(LOOK.jing), lanC: strip(LOOK.lan), liaoC: strip(LOOK.liao) };
  const ANIM = {
    cctv24_lounge: { scene:"c24_lounge", opt:{ night:true, lightsOn:false }, cam:"1F LOUNGE", date:"2027-01-06", beats:[
      { t:"00:30:00", d:3, cap:"00:30，交誼廳的燈只開了一半，沒有人。", m:{} },
      { t:"00:50:00", d:4, cap:"00:50，照服員阿蘭走進來，左右看了一下。", m:{ lanC:[110,94,"walk1",1,-20,94] } },
      { t:"00:52:00", d:4.5, cap:"00:52，她打開櫃子上的零用金鐵罐，把硬幣倒進圍裙的口袋。", m:{ lanC:[114,94,"door",1] } },
      { t:"00:55:00", d:4, cap:"00:55，她坐在沙發上滑手機。", m:{ lanC:[96,90,"sit+phone",1,118,94] } },
      { t:"01:12:00", d:4, cap:"01:12，畫面外傳來呼叫鈴的聲音。她抬頭看了一眼，又低下頭。", m:{ lanC:[96,90,"sit+phone",-1] } },
      { t:"01:40:00", d:4, cap:"01:40，她站起來，拍拍口袋，走出交誼廳。", m:{ lanC:[-20,94,"walk1",-1,96,94] }, out:["lanC"] }
    ] }
  };
  [...EP24.cctv, ...EP24.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案：重現 ---------- */
  const RB = [
    { t:"19:50:00", d:5, cap:"1 月 5 日 19:50，何美玲背著她每天都背的大包包，在訪客登記簿上寫下名字。", scene:"c24_lobby", opt:{ night:true }, m:{ meiC:[104,94,"write@pen&bag",-1,200,94] } },
    { t:"22:20:00", d:5, cap:"22:20，305 的呼叫鈴響了。陳靜宜和阿蘭跑去 305。藥車的抽屜開著，沒有鎖。", scene:"c24_station", opt:{ night:true, bell:true, drawer:true }, m:{ jingC:[220,94,"walk1",1,50,94], lanC:[220,94,"walk1",1,120,94] }, out:["jingC","lanC"] },
    { t:"22:22:00", d:5, join:true, cap:"何美玲從走廊另一頭走過來，從藥車裡拿走父親藥盒裡的一整片鋁箔：十四顆。", scene:"c24_station", opt:{ night:true, bell:true, drawer:true }, m:{ meiC:[48,94,"reach@pill",-1,-20,94] } },
    { t:"22:31:00", d:6, cap:"22:31，301。她在浴室把藥磨碎、加水，用灌食空針從鼻胃管慢慢推進去。平板上打出一行字：「美玲　不要哭」。", scene:"c24_301", opt:{ night:true, body:true, typed:true, capOpen:true }, m:{ meiC:[90,94,"hold@syringe",-1,150,94] } },
    { t:"22:40:00", d:5, cap:"22:40，她按鈴，老廖開了大門。她在夜間登記簿上簽了名，眼睛紅紅的。", scene:"c24_lobby", opt:{ night:true }, m:{ liaoC:[24,94,"sit",1], meiC:[200,94,"carry:R@bag",1,40,94] }, out:["meiC"] },
    { t:"00:52:00", d:4.5, cap:"00:52，交誼廳。阿蘭把零用金罐的硬幣倒進口袋。那是另一件錯事。", scene:"c24_lounge", opt:{ night:true, lightsOn:false }, m:{ lanC:[114,94,"door",1] } },
    { t:"06:00:00", d:5, cap:"06:00，陳靜宜來給藥。他已經沒有呼吸了。", scene:"c24_301", opt:{ body:true, cover:false, capOpen:true }, m:{ jingC:[96,94,"inspect",-1,180,94] } }
  ];
  EP24.court = {
    title: "安和護理之家・護理站・1 月 6 日 22:30", scene: "c24_station", opt:{ night:true },
    who: ph => ["mei","son","lan","jing","dir"],
    open: ph => "22:30，護理站。走廊的燈關了一半。何志明靠在牆上，何美玲坐在長椅上，包包放在腿上。阿蘭和陳靜宜站在藥車旁邊，院長站在最後面。",
    kindLine: {
      natural: "何先生是自然走的。漸凍症，呼吸衰竭。",
      error: "是給藥出了錯。有人給錯了藥。",
      murder: "何先生不是自然死亡。有人違反他的意思，害死了他。",
      assist: "何先生不是自然死亡。他是自己想走的——有人照他的意思，幫了他。"
    },
    kindTrue: "",
    murmur: [ "（何志明一直看著妹妹的包包。）", "（院長把資料夾抱在胸前。）", "（阿蘭的手伸進圍裙的口袋，又拿出來。）" ],
    confess: { mei: [ "……是我。", "爸要我答應他。一月二號，他錄了影片。我答應了。", "影片我沒有刪。我在等你們來。" ] },
    cornered: { mei: "……我沒有違反他的意思。我只是照他說的做。" },
    deny: {
      son: "我？我昨晚在台中！",
      lan: "我拿了錢……可是我沒有碰何伯伯！我發誓！",
      jing: "我只給了一顆！給藥紀錄寫得清清楚楚！",
      dir: "我們這裡的人，我都信得過……"
    },
    replayText: "1 月 5 日 19:50，安和護理之家的大廳——",
    replay: { scene:"c24_lobby", opt:{ night:true }, clean:true, cam:"經過重現", date:"2027-01-05", beats:RB },
    endGood: "22:30，你在報告上寫：「何振聲，死因：安眠藥過量（經鼻胃管灌入）。依死者生前意願，由其女何美玲協助。涉嫌加工自殺。」\n何美玲自己伸出了手。\n何志明把父親的平板抱在懷裡，在走廊站了很久。\n交誼廳的零用金罐，院長另外報了案。",
    endBad: "報告上寫的是你的結論。\n301 的床單換了新的。窗台上那一排紙鶴，被收進一個紙箱。\n平板裡那個叫「給檢察官」的影片，沒有人打開。"
  };

  /* ---------- 收工之後（主線幕間）：許振業在走廊。c_told_xu → 下午已經說過，許知夏在場；沒有 → 現在才說，她不在 ---------- */
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[24] && ARC_INTER[24].after){
    const base = ARC_INTER[24].after, told = () => typeof ARC !== "undefined" && ARC.has && ARC.has("c_told_xu");
    const conf = ["那顆彈頭，跟你舅舅的配槍對不上。", "上面叫我寫「相符」。我寫了。", "上面是誰？", "……我還有一個女兒。"];
    const lines = [];
    base.lines.forEach(L => {
      if (L.choices){ lines.push(
        { who:"xuzy", text:"下午說的，我不會收回。", when:"arc:c_told_xu" },
        { who:"xuzy", text:"名字……再給我一點時間。我媽還住在這裡。", when:"arc:c_told_xu" }); }
      lines.push(conf.includes(L.text) && !L.when ? Object.assign({}, L, { unless:"arc:c_told_xu" }) : L);
    });
    EP24.after = Object.assign({}, base, { scene:"c24_station", opt:{ night:true }, lines, arc:"xuzy_confess" });
    Object.defineProperty(EP24.after, "cast", { get:() => told() ? base.cast : base.cast.filter(c => c.id !== "xu"), enumerable:true, configurable:true });
  }

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP24.outScenes = [];
  EP24.fac = { anhe:["#efe8d8","#3a8a6a"], lab:["#e2e8e8","#3a7a8a"], meihome:["#c8b898","#7a5a3a"] };
  EP24.setting = { anhe:"town", lab:"city", meihome:"town" };
  const SKY24 = [ ["#8ab8d8","#a8c8e0","#c8d8e0","#6a8a5a",0,0], ["#0a0f1c","#1a2238","#222a3a","#2a3242",0,1] ];
  EP24.worldSky = ph => SKY24[Math.min(ph || 0, SKY24.length - 1)];
  EP24.roomDesc = {
    lobby:"安和護理之家的一樓大廳。消毒水的味道。", station:"二樓的護理站，走廊兩邊都是病房。", r301:"301 病房。何振聲住了快四個月的地方。", lounge:"二樓的交誼廳。電視開著，沒有聲音。", staff:"員工休息室。大夜班的人在這裡吃飯。",
    lab:"鑑識中心。", mhome:"何美玲的家。客廳正中間，還放著一張病床。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  EP24.world = {};
  EP24.locations.forEach(l => { EP24.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP24.world.anhe, {
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長，院長在大廳等我們。遺體還在 301，許前輩已經上去了。", "小吳"),
      say("you", "兒子呢？", "你"),
      say("wu", "也在 301 門口。他說要等到我們查清楚才走。", "小吳"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  EP24.mapPos = { anhe:[90,60,"u"], lab:[190,40,"r"], meihome:[50,96,"d"] };
  EP24.mapRoads = [["anhe","lab"],["anhe","meihome"]];
  EP24.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#a8b098"); dither(0, 0, 240, 135, "#b0b8a0", 3);
    for (let x = 14; x < 230; x += 9) for (let y = 12; y < 128; y += 8) if ((x * 7 + y) % 5) R(x, y, 7, 6, "#c8c4b0");
    R(0, 70, 240, 4, "#8a8a80"); R(120, 0, 4, 135, "#8a8a80");
    R(82, 52, 16, 12, "#efe8d8"); R(88, 54, 4, 8, "#3a8a6a"); R(86, 56, 8, 4, "#3a8a6a");
  };
})();
