/* =========================================================
   第 15 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP15.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, lamp, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i] = beatAt(o.t || 0, o.ds); return (o.seq || [])[i] || {}; };
  const cam = (x, y, left) => { R(x, y, 10, 5, "#2a2a2e"); R(left ? x : x + 7, y + 1, 3, 3, "#4a4a52"); P(left ? x + 8 : x + 1, y + 1, "#e83a3a"); };
  const tube = (x, y, w) => { R(x, y, w, 2, "#f4f8f0"); dither(x - 4, y + 2, w + 8, 6, "#f4f8f022", 3); };
  const screw = (x, y) => { R(x, y, 2, 2, "#e8e8e0"); P(x, y, "#c8c8c0"); };
  const tile = (x, y, w, h, c, l) => { R(x, y, w, h, c); for (let yy = y; yy < y + h; yy += 6) R(x, yy, w, 1, l); for (let xx = x; xx < x + w; xx += 6) R(xx, y, 1, h, l); };
  // 便當（盒子、排骨、筷子）
  const bento = (x, y, eaten) => { R(x, y, 14, 5, "#f4f0e0"); R(x + 1, y + 1, 12, 3, "#f8f4ea"); if (!eaten){ R(x + 2, y + 1, 6, 2, "#b8783a"); R(x + 9, y + 1, 3, 2, "#5a9a4a"); } else { R(x + 3, y + 2, 4, 1, "#e8dcc0"); P(x + 9, y + 2, "#c83a2a"); } R(x, y - 1, 14, 1, "#c8a868"); R(x + 1, y - 2, 12, 1, "#c8a868"); };
  // 老式答錄機和市話；ring＝來電燈亮
  const phoneSet = (x, y, ring, off) => {
    R(x, y, 10, 6, "#e8e4d8"); R(x + 1, y + 1, 8, 2, "#d8d4c8"); if (!off){ R(x, y - 2, 10, 2, "#f4f0e8"); R(x - 1, y - 2, 2, 3, "#f4f0e8"); R(x + 9, y - 2, 2, 3, "#f4f0e8"); }
    R(x + 11, y + 1, 10, 5, "#3a3a40"); R(x + 12, y + 2, 5, 2, "#7ac08a"); P(x + 19, y + 2, ring ? "#ff3a3a" : "#a82a2a"); if (ring) dither(x - 2, y - 6, 26, 6, "#ffffff22", 2);
    R(x + 4, y + 6, 1, 4, "#c8c4b8");
  };

  /* ---------- 場景：安全屋大樓 ---------- */
  // 一樓大門・管理室
  SC.s15_lobby = (o) => { o = Object.assign({}, o, stOf(o));
    const night = o.night !== false;
    wall(76, "#d8d0bc", false); tile(0, 50, W, 26, "#b8c4b0", "#a8b4a0");
    // 大門（玻璃鐵門）
    R(0, 12, 28, 64, "#5a5a5e"); R(2, 14, 24, 60, night ? "#1e2834" : "#a8c8d8"); R(13, 14, 2, 60, "#5a5a5e"); for (let y = 20; y < 74; y += 10) R(2, y, 24, 1, "#6a6a6e"); R(10, 44, 2, 6, "#c8c8cc"); R(16, 44, 2, 6, "#c8c8cc");
    cam(30, 4); R(34, 9, 1, 4, "#3a3a3e");
    // 管理室（窗口看得到錄影機螢幕和鑰匙板）
    R(34, 18, 54, 34, "#8a7a5a"); R(36, 20, 50, 30, "#3a3a34");
    R(36, 22, 8, 14, "#a8885a"); for (let k = 0; k < 4; k++){ R(37 + (k % 2) * 3, 24 + (k >> 1) * 5, 2, 2, "#5a5a5a"); P(38 + (k % 2) * 3, 26 + (k >> 1) * 5, k === 3 ? "#3a3a34" : "#c8a040"); }   // 鑰匙板（第四格空）
    R(44, 26, 32, 20, "#1a1a1e"); for (let k = 0; k < 4; k++){ const x = 46 + (k % 2) * 15, y = 28 + (k >> 1) * 9; R(x, y, 13, 7, night ? "#2a4a3a" : "#3a5a4a"); R(x + 2, y + 2, 4 + k, 2, "#8aa898"); }   // 錄影機四分割螢幕
    R(78, 26, 6, 18, "#c8c0a8"); R(79, 28, 4, 1, "#3a3a3a"); R(79, 31, 4, 1, "#3a3a3a");   // 牆上的排班表
    R(32, 50, 58, 4, "#6a5a3a"); R(56, 48, 18, 3, "#f4f0e0"); R(57, 47, 16, 1, "#2a4a8a");   // 窗台和訪客登記簿
    txt("管理室", 48, 16, "#5a4a3a", "6px sans-serif");
    // 信箱
    R(92, 22, 34, 28, "#8a8e86"); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++){ R(94 + c * 11, 24 + r * 6, 10, 5, "#a8aca4"); R(96 + c * 11, 25 + r * 6, 6, 1, "#5a5e56"); }
    R(95, 32, 8, 2, "#f4f0e0"); R(117, 41, 5, 3, "#e8e0d0"); R(116, 25, 7, 3, "#f4f0e0");
    // 電梯和樓層燈
    R(132, 22, 32, 54, "#8a8a8e"); R(134, 24, 28, 52, "#b8bcc0"); R(147, 24, 2, 52, "#8a8e92");
    if (o.lift){ R(136, 24, 24, 52, "#5a5a50"); R(138, 26, 20, 48, "#c8c4a8"); R(140, 70, 16, 6, "#8a8670"); R(134, 24, 4, 52, "#a8acb0"); R(158, 24, 4, 52, "#a8acb0"); }   // 電梯門打開 R(164, 44, 3, 8, "#3a3a3e"); P(165, 46, "#e8c040"); P(165, 49, "#e8e8e0");
    R(140, 12, 18, 9, "#1a1a1e"); txt(String(o.floor || 1), 146, 19, "#ff6a3a", "7px monospace");
    // 往上的樓梯（鐵柵門）
    for (let k = 0; k < 6; k++){ R(170 + k * 4, 70 - k * 8, 22 - k * 4, 2, "#c8c0a8"); R(170 + k * 4, 72 - k * 8, 22 - k * 4, 4, "#8a8274"); }
    R(168, 26, 2, 50, "#3a3a3e"); for (let x = 172; x < 192; x += 5) R(x, 26, 1, 50, "#4a4a4e"); R(168, 26, 24, 2, "#3a3a3e");
    floor(76, "#c8c0b0", "#b8b0a0");
    if (o.lamp !== false){ R(90, 0, 14, 3, "#f4f0d0"); if (night) dither(76, 3, 42, 30, "#fff4d012", 3); }
  };

  // 五樓走廊：左邊樓梯口、5B（王阿嬤）、看守桌、5A（安全屋）、盡頭的窗
  SC.s15_hall = (o) => { o = Object.assign({}, o, stOf(o));
    const night = o.night !== false;
    wall(76, "#dcd8c4", false); tile(0, 50, W, 26, "#a8c0a8", "#98b098");
    tube(80, 2, 20);
    // 樓梯口（往下）
    // 樓梯口：往頂樓的那一段（鐵門鎖著），地上是往四樓的開口
    for (let k = 0; k < 5; k++){ R(0, 62 - k * 9, 10 + k * 4, 2, "#c8c0a8"); R(0, 64 - k * 9, 10 + k * 4, 7, "#9a9284"); }
    R(0, 18, 30, 3, "#5a5a56"); for (let x = 2; x < 30; x += 4) R(x, 21, 1, 22, "#5a5a56"); R(12, 30, 4, 4, "#c8a040"); txt("頂樓", 4, 16, "#5a5a5a", "5px sans-serif");
    // 5B
    R(36, 22, 28, 54, "#7a5a3a"); R(38, 24, 24, 50, "#8a6a4a"); R(48, 38, 3, 3, "#1a1a1e"); P(49, 39, "#c8c8c0"); R(58, 50, 3, 4, "#c8a040"); R(42, 16, 16, 5, "#f4f0e0"); txt("5B", 46, 21, "#3a3a3a", "5px sans-serif");
    R(64, 64, 9, 12, "#6a5a4a"); R(65, 66, 7, 2, "#3a3a3a"); R(65, 70, 7, 2, "#c84a3a");   // 鞋架
    if (o.cat !== false){ R(44, 73, 4, 2, "#e8963a"); P(45, 72, "#e8963a"); }
    // 5A（安全屋）
    const open = !!o.door;
    R(114, 20, 30, 56, "#5a5e66"); if (open){ R(116, 22, 26, 54, "#e8dcb0"); R(116, 22, 26, 54, "#2a2620"); dither(116, 22, 26, 54, "#f8e8b844", 2); R(140, 22, 4, 54, "#6a6e76"); }
    else { R(116, 22, 26, 54, "#6a6e76"); R(118, 24, 22, 22, "#727680"); R(118, 48, 22, 26, "#727680"); R(136, 46, 3, 5, "#c8c8cc"); R(136, 53, 3, 3, "#8a8a8e"); }
    if (o.tape){ for (let k = 0; k < 26; k++){ const y = 40 + Math.round(k * 0.6); R(116 + k, y, 1, 2, (k >> 2) % 2 ? INK : "#f2d03b"); } for (let k = 0; k < 26; k++){ const y = 56 - Math.round(k * 0.5); R(116 + k, y, 1, 2, (k >> 2) % 2 ? INK : "#f2d03b"); } }
    // 走廊盡頭的窗和滅火器
    R(166, 14, 26, 36, "#5a5a56"); R(168, 16, 22, 32, night ? "#18202c" : "#b8d0e0"); R(178, 16, 2, 32, "#5a5a56"); if (night){ P(172, 22, "#e8c040"); P(184, 30, "#c83a2a"); } else R(168, 36, 22, 12, "#8a96a0");
    R(160, 58, 5, 14, "#c83a2a"); R(161, 55, 3, 3, "#3a3a3a");
    cam(150, 2, true);
    floor(76, "#b8b4a4", "#aaa696");
    R(0, 80, 30, 28, "#3a3a38"); for (let k = 0; k < 4; k++){ R(0, 82 + k * 6, 30 - k * 6, 2, "#c8c0a8"); R(0, 84 + k * 6, 30 - k * 6, 4, "#8a8274"); }   // 往四樓的樓梯開口
    R(30, 66, 2, 14, "#6a6a66"); R(0, 66, 32, 2, "#8a8a86"); txt("4F↓", 34, 74, "#5a5a5a", "5px sans-serif");
    SC.s15_hall.front(o);
  };
  // 看守桌（人坐在桌子後面）
  SC.s15_hall.front = (o) => {
    o = Object.assign({}, o, stOf(o));
    R(74, 60, 34, 3, "#8a8e94"); R(75, 63, 2, 15, "#6a6e74"); R(105, 63, 2, 15, "#6a6e74"); R(76, 66, 30, 1, "#6a6e74");
    R(80, 56, 16, 4, "#2a4a3a"); R(81, 56, 14, 1, "#f4f0e0");   // 登記簿
    R(97, 57, 7, 3, "#1a1a1e"); if (o.game) R(98, 57, 5, 1, "#6ac8f0");   // 手機
    R(76, 52, 4, 8, "#5a7a9a"); R(76, 51, 4, 1, "#8aa0b8");   // 保溫杯
  };
  SC.s15_hall.frontY = 86;

  // 安全屋・客廳（左邊是大門，內側沒有門把）
  SC.s15_living = (o) => { o = Object.assign({}, o, stOf(o));
    wall(76, "#e4dcc8", false); floor(76, "#b8a888", "#a89878"); R(0, 68, W, 8, "#a89a80");
    R(0, 20, 22, 56, "#6a6e76"); R(2, 22, 18, 54, "#7a7e86"); R(4, 26, 14, 20, "#82868e"); R(4, 50, 14, 22, "#82868e"); R(16, 46, 3, 3, "#5a5e66");   // 大門（內側沒有把手，只有鎖孔蓋）
    if (o.door){ R(2, 22, 18, 54, "#2a2620"); dither(2, 22, 18, 54, "#f4f0d033", 2); }
    // 邊桌：市話、答錄機
    R(22, 56, 22, 3, "#8a6a4a"); R(24, 59, 2, 17, "#6a4a2a"); R(40, 59, 2, 17, "#6a4a2a");
    phoneSet(23, 50, !!o.ring, !!o.off);
    // 守則
    R(48, 16, 24, 20, "#f4f4f0"); R(48, 16, 24, 3, "#2a4a8a"); for (let k = 0; k < 5; k++) R(50, 21 + k * 3, 18 - (k % 2) * 5, 1, "#5a5a5a");
    // 沙發
    R(52, 50, 52, 8, "#5a6a5a"); R(52, 58, 52, 10, "#6a7a6a"); R(50, 52, 4, 18, "#4a5a4a"); R(102, 52, 4, 18, "#4a5a4a"); R(54, 68, 3, 4, "#3a2a1a"); R(99, 68, 3, 4, "#3a2a1a");
    // 茶几和便當
    R(58, 72, 44, 3, "#8a6a4a"); R(60, 75, 2, 6, "#6a4a2a"); R(98, 75, 2, 6, "#6a4a2a");
    if (o.bento !== false){ bento(62, 67, o.bento !== "full"); R(84, 64, 10, 8, "#f4f4f0"); R(85, 63, 8, 1, "#e8e8e0"); R(86, 66, 6, 3, "#e8e0c8"); R(96, 68, 4, 4, "#c8a860"); R(96, 67, 4, 1, "#e8e0c8"); }
    // 電視
    R(110, 58, 36, 18, "#6a4a2a"); R(112, 60, 32, 6, "#7a5a3a"); R(116, 36, 26, 20, "#1a1a1e"); R(117, 37, 24, 16, o.tv === false ? "#2a2a2e" : "#3a6a4a"); if (o.tv !== false){ R(118, 46, 22, 6, "#5a8a3a"); P(128, 44, "#f4f4f0"); } R(127, 56, 4, 2, "#2a2a2a");
    R(118, 30, 14, 5, "#f4f0c0");   // 音量便條
    // 窗（螺絲鎖死）
    R(150, 14, 30, 26, "#7a7e86"); R(152, 16, 26, 22, "#18202c"); R(164, 16, 2, 22, "#7a7e86"); P(156, 24, "#e8c040"); P(172, 20, "#c83a2a"); R(158, 30, 4, 8, "#3a3a44");
    screw(151, 15); screw(177, 15); screw(151, 37); screw(177, 37);
    R(182, 22, 10, 54, "#5a4a3a");   // 往臥室
    lamp(90, 0, "#f8e8c8");
    
  };

  // 安全屋・臥室
  SC.s15_bed = (o) => { o = Object.assign({}, o, stOf(o));
    wall(76, "#dcd8c8", false); R(0, 68, W, 8, "#a8a090");
    R(86, 14, 24, 20, "#7a7e86"); R(88, 16, 20, 16, "#18202c"); screw(87, 15); screw(107, 15); screw(87, 31); screw(107, 31);   // 小窗
    R(124, 20, 14, 14, "#f4f4f0"); R(124, 20, 14, 3, "#c83a2a"); for (let k = 0; k < 3; k++) for (let j = 0; j < 4; j++) R(126 + j * 3, 25 + k * 3, 2, 2, "#8a8a8a"); R(128, 27, 2, 2, "#c83a2a"); R(131, 30, 2, 2, "#c83a2a");   // 月曆
    // 書桌、檯燈、信、筆、便條本
    R(14, 56, 68, 3, "#8a6a4a"); R(16, 59, 3, 17, "#6a4a2a"); R(77, 59, 3, 17, "#6a4a2a");
    R(16, 44, 2, 12, "#3a3a3e"); R(14, 42, 8, 3, "#3a3a3e"); if (o.lamp) dither(10, 45, 30, 12, "#fff4c022", 2);
    if (o.letter !== false){ R(28, 52, 7, 4, "#f4f4f0"); R(32, 51, 7, 5, "#f8f8f4"); R(37, 52, 7, 4, "#f4f4f0"); for (let k = 0; k < 3; k++) R(33, 52 + k, 5, 1, "#3a5ab8"); }
    R(46, 54, 9, 1, "#3a5ab8"); P(55, 54, "#2a2a6a");   // 原子筆
    R(58, 51, 12, 5, "#f4f0c0"); R(58, 51, 12, 1, "#c8a040");   // 便條本
    R(40, 64, 16, 3, "#6a4a2a"); R(42, 67, 2, 9, "#5a3a1a"); R(52, 67, 2, 9, "#5a3a1a"); R(52, 50, 3, 14, "#6a4a2a");   // 椅子
    // 行李袋
    R(92, 64, 20, 12, "#2a3a5a"); R(94, 62, 16, 2, "#1a2a4a"); R(98, 60, 8, 2, "#1a2a4a"); R(108, 66, 3, 6, "#3a4a6a");
    // 床
    R(116, 54, 72, 6, "#e8e4dc"); R(116, 60, 72, 14, "#6a5a4a"); R(184, 40, 4, 34, "#5a4a3a"); R(166, 48, 18, 6, "#f4f4f0");
    if (o.note2) { R(170, 47, 6, 3, "#f8f4e0"); }
    R(120, 52, 40, 3, "#8a9ab0");   // 摺好的被子
    lamp(96, 0, "#f8e8c8");
    floor(76, "#b8a888", "#a89878");
  };

  // 安全屋・浴室
  SC.s15_bath = (o) => { o = Object.assign({}, o, stOf(o));
    tile(0, 0, W, 76, "#c8d4d8", "#b8c4c8"); R(0, 0, W, 4, "#a8b4b8");
    // 撞開的門（左）
    R(4, 20, 30, 56, "#8a8e94"); R(6, 22, 26, 54, "#2a2a30");
    if (o.broken !== false){ R(8, 22, 8, 54, "#c8b898"); R(14, 44, 2, 3, "#c8c8cc"); for (let k = 0; k < 6; k++) R(30, 26 + k * 8, 3, 2, "#e8d8b0"); for (let k = 0; k < 7; k++) R(12 + (k * 7) % 28, 78 + (k * 3) % 6, 3, 1, "#e8d8b0"); }
    else { R(6, 22, 26, 54, "#c8b898"); R(26, 46, 3, 3, "#c8c8cc"); }
    // 洗手台、鏡子、眼鏡
    R(42, 22, 18, 18, "#a8b8c0"); R(43, 23, 16, 16, "#d8e8f0"); dither(43, 23, 16, 16, "#ffffff33", 3);
    R(40, 48, 22, 6, "#f4f4f0"); R(44, 54, 14, 2, "#e8e8e0"); R(48, 56, 6, 20, "#e8e8e0"); R(50, 46, 2, 2, "#c8c8cc"); R(44, 46, 4, 2, "#3a3a3a"); P(46, 45, "#3a3a3a");
    // 馬桶
    R(70, 58, 14, 6, "#f4f4f0"); R(72, 64, 10, 12, "#e8e8e0"); R(70, 50, 14, 8, "#f4f4f0");
    // 浴缸
    R(98, 60, 84, 16, "#f4f4f0"); R(98, 58, 84, 3, "#e8e8e0"); R(100, 62, 80, 2, "#d8e0e4");
    if (o.clothes !== false && o.rope !== "hang"){ R(104, 60, 6, 2, "#8a9ab0"); R(112, 60, 5, 2, "#e8e4d8"); }
    // 小氣窗（螺絲鎖死）
    R(150, 28, 26, 16, "#8a8e94"); R(152, 30, 22, 12, "#18202c"); R(152, 30, 22, 1, "#3a4a5a"); screw(151, 29); screw(173, 29); screw(151, 41); screw(173, 41);
    // 曬衣桿和繩子
    R(96, 14, 86, 2, "#c8ccd0"); R(94, 12, 3, 6, "#8a8e92"); R(181, 12, 3, 6, "#8a8e92");
    if (o.rope === "line"){ for (let x = 100; x < 178; x += 2) P(x, 17, "#f4f4f0"); }
    else if (o.rope !== false){ R(138, 16, 1, 24, "#f4f4f0"); R(137, 26, 3, 3, "#e8e8e0"); R(137, 30, 3, 3, "#e8e8e0"); R(137, 40, 3, 1, "#d8d8d0"); R(136, 14, 5, 3, "#e8e8e0"); }
    floor(76, "#d0d8dc", "#c0c8cc"); tile(0, 76, W, 32, "#d0d8dc", "#c0c8cc");
    // 塑膠凳
    if (o.stool === "up"){ R(116, 84, 14, 3, "#3a8ac8"); R(117, 87, 2, 9, "#2a7ab8"); R(127, 87, 2, 9, "#2a7ab8"); }
    else if (o.stool !== false){ R(114, 88, 3, 14, "#3a8ac8"); R(117, 90, 12, 2, "#2a7ab8"); R(117, 98, 12, 2, "#2a7ab8"); }
    if (o.slipper !== false){ R(140, 96, 7, 3, "#3a3a44"); R(141, 96, 4, 1, "#5a5a64"); }
    if (o.body){ R(58, 90, 52, 9, "#f4f4f0"); R(60, 88, 46, 3, "#e8e8e8"); R(64, 92, 40, 1, "#e0e0e0"); R(108, 94, 5, 4, "#8a8e94"); }
    if (o.dark) { R(0, 0, W, H, "#0a0c12dd"); }
  };

  // 結案重現用：安全屋剖面（大門｜客廳｜臥室｜浴室）
  SC.s15_flat = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, H, "#14161c");
    // 走廊（最左）
    R(0, 20, 10, 56, "#c8c4b0"); R(0, 76, 10, 32, "#8a8676");
    // 大門
    R(10, 20, 4, 56, o.door ? "#2a2620" : "#6a6e76");
    // 客廳 x14–74
    R(14, 20, 60, 56, "#e4dcc8"); R(14, 68, 60, 8, "#a89a80");
    R(16, 54, 14, 3, "#8a6a4a"); R(18, 57, 2, 19, "#6a4a2a"); R(26, 57, 2, 19, "#6a4a2a"); phoneSet(16, 48, !!o.ring, !!o.off);
    R(36, 52, 34, 6, "#5a6a5a"); R(36, 58, 34, 10, "#6a7a6a"); R(34, 54, 3, 16, "#4a5a4a"); R(69, 54, 3, 16, "#4a5a4a");
    R(40, 70, 28, 2, "#8a6a4a"); R(42, 72, 2, 4, "#6a4a2a"); R(64, 72, 2, 4, "#6a4a2a");
    if (o.bento) bento(44, 66, o.bento !== "full");
    R(28, 0, 10, 3, "#f8e8c8"); if (o.lit !== false) dither(18, 3, 30, 20, "#fff4d012", 3);
    // 牆
    R(74, 12, 4, 64, "#3a3a40");
    // 臥室 x78–130
    R(78, 20, 52, 56, o.lamp ? "#e8dcc0" : "#c8c0b0"); R(78, 68, 52, 8, "#a8a090");
    R(80, 54, 30, 2, "#8a6a4a"); R(82, 56, 2, 20, "#6a4a2a"); R(106, 56, 2, 20, "#6a4a2a"); R(82, 44, 2, 10, "#3a3a3e"); R(80, 42, 6, 2, "#3a3a3e"); if (o.lamp) dither(78, 44, 24, 12, "#fff4c033", 2);
    if (o.letter) { R(90, 51, 8, 3, "#f8f8f4"); R(93, 51, 1, 3, "#3a5ab8"); }
    R(94, 66, 10, 2, "#6a4a2a"); R(102, 56, 2, 12, "#6a4a2a"); R(95, 68, 1, 8, "#5a3a1a"); R(102, 68, 1, 8, "#5a3a1a");   // 書桌的椅子
    R(112, 58, 18, 6, "#e8e4dc"); R(112, 64, 18, 10, "#6a5a4a");
    // 牆
    R(130, 12, 4, 64, "#3a3a40");
    // 浴室 x134–192
    tile(134, 20, 58, 56, "#c8d4d8", "#b8c4c8"); R(136, 22, 2, 54, "#a8b4b8");
    R(160, 24, 30, 2, "#c8ccd0"); R(150, 56, 40, 20, "#f4f4f0");
    if (o.bathShut){ R(134, 20, 58, 56, "#0a0c12"); R(134, 74, 4, 2, "#f8f0c0"); R(134, 20, 3, 56, o.broken ? "#c8b898" : "#8a8e94"); }
    // 地板
    R(10, 76, 182, 32, "#5a5048"); R(10, 76, 182, 1, "#3a3430");
    txt("客廳", 36, 18, "#8a8a90", "5px sans-serif"); txt("臥室", 96, 18, "#8a8a90", "5px sans-serif"); txt("浴室", 156, 18, "#8a8a90", "5px sans-serif");
  };

  // 阿華便當
  SC.s15_bento = (o) => {
    wall(76, "#f0e4c8", false); floor(76, "#9a968a", "#8a867a"); R(0, 0, W, 10, "#c83a2a"); txt("阿華便當", 70, 8, "#f4f0e0", "7px sans-serif");
    R(90, 14, 40, 18, "#f4f0e0"); R(90, 14, 40, 3, "#c83a2a"); for (let k = 0; k < 4; k++) R(92, 19 + k * 3, 30 - (k % 2) * 6, 1, "#5a3a2a"); R(124, 22, 4, 6, "#8a7a6a");   // 菜單和舊照片
    // 櫃台、保溫台、訂單本、電話
    R(14, 50, 72, 4, "#8a6a4a"); R(16, 54, 68, 22, "#c8b898"); R(18, 56, 64, 2, "#d8c8a8");
    R(20, 42, 18, 8, "#c8c8cc"); for (let k = 0; k < 3; k++) R(21 + k * 6, 43, 5, 6, ["#b8783a","#e8c040","#5a9a4a"][k]);
    R(40, 46, 16, 4, "#f4f0e0"); R(41, 45, 14, 1, "#2a4a8a"); R(42, 47, 10, 1, "#5a5a5a");   // 訂單本
    R(60, 44, 10, 6, "#e8e4d8"); R(60, 42, 10, 2, "#f4f0e8");   // 電話
    R(4, 14, 8, 36, "#a8c8d8"); R(4, 14, 8, 2, "#5a5a5e");
    // 停在門口的機車和外送箱
    R(140, 64, 40, 8, "#c83a2a"); R(146, 56, 20, 8, "#d84a3a"); R(170, 50, 4, 14, "#3a3a3e"); R(168, 48, 10, 3, "#3a3a3e");
    R(138, 72, 10, 10, INK); R(141, 75, 4, 4, "#5a5a5e"); R(170, 72, 10, 10, INK); R(173, 75, 4, 4, "#5a5a5e");
    R(142, 40, 18, 16, "#e8c040"); R(143, 42, 16, 2, "#c8a020"); R(150, 50, 12, 8, "#1a1a1e"); R(151, 51, 10, 5, "#6ac8f0");   // 外送箱和手機架
    R(120, 68, 10, 10, "#f4f4f0"); R(121, 66, 8, 3, "#3a6ac8");   // 安全帽
    
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    lin:   { skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", mood:"cry", hello:"我應該進去的……我應該進去的。" },
    yijun: { skin:"#ecc8a6", hair:"#2a2220", hairStyle:"bob", top:"#f4f4f0", coat:"#2a3040", bottom:"#2a3040", glasses:true, mood:"worried", hello:"安全屋的每一樣東西，都是我管的。" },
    chen:  { age:"old", skin:"#d8a880", hair:"#c8c8c0", hairStyle:"balding", top:"#e8e0c8", bottom:"#5a5a4a", hello:"警察的事我不懂啦，錄影機我會。" },
    wang:  { age:"old", skin:"#e0b48c", hair:"#d8d8d0", hairStyle:"bob", top:"#a87ab8", bottom:"#3a3a4a", hello:"那個先生，人很好啊……" },
    mei:   { skin:"#e0b48c", hair:"#2a2220", hairStyle:"bob", top:"#3a3a44", bottom:"#3a3a4a", mood:"sad", hello:"……他吃飽了沒有，最後一餐？" },
    qing:  { skin:"#f4d4bc", hair:"#1e1a18", hairStyle:"long", top:"#8a8e94", bottom:"#2a3a6a", mood:"sad", hello:"我沒有打電話。我真的沒有。" },
    jie:   { skin:"#c89a70", hair:"#1a1410", hairStyle:"short", top:"#e8763a", bottom:"#3a3a40", hello:"那個大叔……真的走了喔？" },
    li:    { hello:"這個地址，只有九個人知道。" },
    zhou:  { hello:"他以前教我怎麼開罰單。很久以前。" },
    qian:  { hello:"……一個月兩個。" },
    xu:    { hello:"門、窗、繩子。一樣一樣來。" },
    wu:    { hello:"學長……他昨天還說要吃排骨飯。" },
    ye:    { hello:"移送的公文，是我簽的。" }
  };
  ["li","zhou","qian","xu","wu","ye"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.li.top) Object.assign(LOOK.li, { skin:"#e8c09a", hair:"#1e1e1e", hairStyle:"slick", top:"#ffffff", bottom:"#1e2230" });
  if (!LOOK.zhou.top) Object.assign(LOOK.zhou, { skin:"#e0b48c", hair:"#4a4a4a", hairStyle:"short", top:"#f4f4f0", coat:"#6a6e74", bottom:"#3a3e46", tie:"#3a3a5a" });
  if (!LOOK.xu.top) Object.assign(LOOK.xu, { skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" });
  if (!LOOK.wu.top) Object.assign(LOOK.wu, { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050", glasses:true });
  if (!LOOK.qian.top) Object.assign(LOOK.qian, { age:"old", skin:"#e0b48c", hair:"#b8b8b0", hairStyle:"balding", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#2a2a30", glasses:true });
  if (!LOOK.ye.top) Object.assign(LOOK.ye, { skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"pony", top:"#f4f4f0", coat:"#6a6e74", bottom:"#6a6e74", skirt:true });
  LOOK.li.prop = undefined; LOOK.li.mood = "tired"; LOOK.xu.mood = "tired"; LOOK.zhou.mood = "sad";
  // 林志豪：袖子捲起、制服右肩濕了一片（撞門）；白天換便服
  LOOK.lin.byPhase = { 1:{ top:"#e9e4da", coat:"#3a4250", mood:"sad" } };
  const DAILY = {
    lin:   [ { room:"hall5", x:90, pose:"sit", doing:"坐在看守桌後面，雙手抱著頭。" }, { room:"pdesk", x:150, pose:"sit", doing:"坐在刑大的長椅上，換了便服，眼睛很紅。" } ],
    li:    [ { room:"hall5", x:126, pose:"write", doing:"站在安全屋門口，在小本子上寫字。" }, { room:"pdesk", x:172, pose:"stand", doing:"站在刑大門口，手上拿著記者會的稿子，上面一個字都沒有。" } ],
    yijun: [ { room:"living", x:140, pose:"read", doing:"站在客廳，一樣一樣對著物品清單。" }, { room:"pdesk", x:60, pose:"phone", doing:"在刑大的走廊講電話，聲音很小。" } ],
    chen:  [ { room:"lobby5", x:60, pose:"stand", doing:"披著外套站在管理室窗口，被救護車吵醒了。" }, { room:"lobby5", x:60, pose:"read", doing:"在管理室窗口看報紙，報紙上是安全屋的新聞。" } ],
    wang:  [ { room:"hall5", x:66, pose:"stand", doing:"站在 5B 門口，手上抱著一隻橘貓。" } ],
    mei:   [ null, { room:"zliving", x:90, pose:"sit", doing:"坐在舊沙發上，手上拿著上禮拜那封信。" } ],
    qing:  [ null, { room:"zgirl", x:40, pose:"sit", doing:"坐在書桌前，數學參考書開著，一頁都沒有翻。" } ],
    jie:   [ null, { room:"shop", x:110, pose:"stand", doing:"抱著安全帽站在店門口等單。" } ],
    zhou:  [ { room:"hall5", x:20, pose:"stand", doing:"站在樓梯口，一直看手錶。" }, { room:"pdesk", x:100, pose:"cross", doing:"站在窗邊，窗簾拉起來了。" } ],
    qian:  [ null, { room:"mroom", x:90, pose:"stand", doing:"站在解剖台旁邊。收音機是關著的。" } ],
    xu:    [ { room:"bath", x:70, pose:"kneel", doing:"蹲在浴室門口，一片一片撿門框的木屑。" }, { x:40, pose:"read", doing:"戴著耳機，盯著電腦上的聲波圖。" } ],
    wu:    [ { room:"living", x:40, pose:"stand", doing:"站在答錄機旁邊，不太敢碰它。" }, { room:"pdesk", x:80, pose:"read", doing:"抱著一疊剛到的調閱資料。" } ],
    ye:    [ null, { room:"pdesk", x:150, pose:"read", doing:"在你的桌子旁邊看移送公文，看了很久。" } ]
  };
  EP15.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP15.rooms = {
    safehouse: [
      { id:"lobby5", name:"1F 大門・管理室", scene:"s15_lobby", opt:(ph) => ({ night:ph === 0, floor:ph === 0 ? 5 : 1 }), details:[
        { id:"d15_stairs", name:"樓梯的鐵柵門", hot:[168,26,24,50], text:"樓梯口的鐵柵門晚上會拉起來，但沒有上鎖。柵欄上掛著一張紙：「頂樓門已鎖，曬衣請洽管理員」。" } ] },
      { id:"hall5", name:"5F 走廊", scene:"s15_hall", opt:(ph) => ({ night:ph === 0, tape:ph === 0, door:false, game:false }), details:[
        { id:"d15_chair", name:"摺疊椅", hot:[84,66,14,12], text:"看守桌後面的摺疊椅，坐墊磨得發亮。椅腳邊放著一個便當盒，是林志豪自己的晚餐，一口都沒動。" } ] },
      { id:"living", name:"安全屋・客廳", scene:"s15_living", opt:(ph) => ({ ring:false, tv:ph === 0 }), details:[
        { id:"d15_remote", name:"遙控器", hot:[80,70,6,3], text:"遙控器的電池蓋用膠帶黏著。最後一台停在體育台。" } ] },
      { id:"bedroom", name:"安全屋・臥室", scene:"s15_bed", opt:(ph, has) => ({ lamp:ph === 0, note2:!!(has && has("arc:c_zhao_promise")) }), details:[
        { id:"d15_sheets", name:"摺好的被子", hot:[120,50,40,6], text:"被子摺成豆腐乾，跟警校教的一樣。他今晚沒有躺下過。" } ] },
      { id:"bath", name:"安全屋・浴室", scene:"s15_bath", opt:(ph) => ({ body:ph === 0, broken:true }), details:[
        { id:"d15_towel", name:"門後的毛巾", hot:[6,24,10,14], text:"門後的掛鉤上掛著一條毛巾，繡著「港東國小　午餐團隊」——是他太太工作的學校。" } ] }
    ],
    police: [
      { id:"pdesk", name:"3F 刑大", scene:"police", details:[
        { id:"d15_coffee", name:"你桌上的咖啡", hot:[60,62,10,8], text:"咖啡杯旁邊放著一個便當，小吳的字：「學長，今天要吃。排骨飯。」……他寫完又劃掉了「排骨」，改成「雞腿」。" } ] }
    ],
    lab: [ { id:"lab", name:"鑑識中心", scene:"lab", details:[
      { id:"d15_headphone", name:"桌上的耳機", hot:[140,40,16,10], text:"許知夏的耳機線纏成一團。旁邊的便條寫著：「四個剪接點。誰會做這種事。」最後那句被劃了很多次。" } ] } ],
    morgue: [ { id:"mroom", name:"法醫室", scene:"m13_morgue", details:[
      { id:"d15_radio", name:"收音機", hot:[18,42,16,8], text:"收音機的插頭拔掉了。老錢說：「今天不聽了。」" } ] } ],
    zhaohome: [
      { id:"zliving", name:"趙家客廳", scene:"m12_home", details:[
        { id:"d15_slippers", name:"門口的拖鞋", hot:[2,64,14,10], text:"門口還放著一雙男用的藍白拖，鞋底磨平了。林美鳳一直沒有收起來。" } ] },
      { id:"zgirl", name:"以晴的房間", scene:"m12_girl", details:[
        { id:"d15_hat", name:"書架上的帽子", hot:[150,36,14,8], text:"書架最上面，放著一頂小小的、褪色的船長帽。" } ] }
    ],
    bento: [ { id:"shop", name:"阿華便當", scene:"s15_bento", details:[
      { id:"d15_chili", name:"辣椒醬", hot:[24,42,10,6], text:"一大桶辣椒醬，旁邊一疊小包裝。老闆說：「昨晚那個客人要兩包，我給他三包。」" } ] } ]
  };
  const PS = [["s15_hall",{ tape:true, night:true }],["police",{}]];
  EP15.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 監視器動畫 ---------- */
  const zhaoBase = (typeof ARC !== "undefined" && ARC.look && ARC.look("zhao")) || { skin:"#d8a880", hair:"#5a5a5a", hairStyle:"short" };
  const zhaoS = Object.assign({}, zhaoBase, { top:"#8a8e94", bottom:"#6a6e74", coat:undefined, tie:undefined, hat:undefined, mood:"tired" });
  EP15.looks = {
    zhaoC: zhaoS, zhaoR: Object.assign({}, zhaoS, { mood:undefined }), zhaoX: Object.assign({}, zhaoS, { mood:"cry" }),
    linC: Object.assign({}, LOOK.lin, { hello:undefined, byPhase:undefined, mood:undefined }),
    liC: Object.assign({}, LOOK.li, { hello:undefined, mood:undefined }),
    jieC: { skin:"#c89a70", hair:"#1a1410", hairStyle:"short", top:"#e8763a", bottom:"#3a3a40" },
    capC: { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#4a5a4a", coat:"#4a5a4a", bottom:"#3a3a40", hat:"cap", capColor:"#2a3a5a" },
    emtC: { skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#e8763a", bottom:"#2a2a30" },
    emtD: { skin:"#d8a880", hair:"#2a2220", hairStyle:"short", top:"#e8763a", bottom:"#2a2a30" }
  };
  // 走廊：5A 門在 x116–142；看守桌後面 x90；樓梯口 x14
  const ANIM = {
    cctv_hall5: { scene:"s15_hall", opt:{ cam:true, night:true, cat:false }, cam:"5F-CAM01", date:"2026-10-08", beats:[
      { t:"21:00:10", d:4.5, cap:"黎光耀從樓梯口走上來。林志豪站起來，用鑰匙開門，黎光耀進去。", st:{ door:true }, m:{ liC:[128,98,"walk1",1,10,98], linC:[110,98,"stand",1,90,84] }, out:["liC"] },
      { t:"21:30:20", d:4, cap:"21:30，黎光耀出來，往樓梯口走。林志豪開門往裡看了一眼，關門。", st:{ door:true }, m:{ liC:[-16,98,"walk2",-1,128,98], linC:[110,98,"stand",1] }, out:["liC"] },
      { t:"22:20:05", d:5, cap:"22:20，外送員提著便當走上來，交給林志豪。林志豪開門，把便當遞進去。趙德安走到門口，跟外送員說話。", st:{ door:true, game:false }, m:{ jieC:[100,98,"hold",1,-16,98], linC:[112,98,"hold",1,90,84], zhaoR:[129,96,"stand",-1] }, out:["zhaoR"] },
      { t:"22:21:00", d:3.5, cap:"22:21，門關上。外送員往樓梯口走，下樓。", st:{ door:false }, m:{ jieC:[-16,98,"walk1",-1,100,98], linC:[90,84,"sit",1,112,98] }, out:["jieC"] },
      { t:"22:30:00", d:4, cap:"22:30，林志豪起來開門，往裡看了一眼，關門，坐回桌子後面。", st:{ door:true }, m:{ linC:[110,98,"stand",1,90,84] } },
      { t:"22:45:00", d:3.5, cap:"之後，門沒有再打開。林志豪一直坐在桌子後面，低頭看手機。", st:{ door:false, game:true }, m:{ linC:[90,84,"phone",1,110,98] } },
      { t:"23:12:30", d:4, cap:"23:12，他抬頭看了門一眼，又低下頭。", st:{ door:false, game:true }, m:{ linC:[90,84,"phone",-1] } },
      { t:"23:30:00", d:3.5, cap:"23:30，他沒有起來。", st:{ door:false, game:true }, m:{ linC:[90,84,"phone",1] } },
      { t:"00:30:10", d:4.5, cap:"00:30，林志豪起來敲門，叫了幾聲，用鑰匙開門進去。", st:{ door:true, game:false }, m:{ linC:[132,98,"walk1",1,90,84,[[110,98]]] }, out:["linC"] },
      { t:"00:31:00", d:4, cap:"00:31，他衝出來，抓起桌上的折疊刀，又衝進去。", st:{ door:true }, m:{ linC:[132,98,"walk2",1,96,98] }, out:["linC"] },
      { t:"00:42:00", d:4, cap:"00:42，救護人員從樓梯口跑上來，進安全屋。", st:{ door:true }, m:{ emtC:[130,98,"walk1",1,-16,98], emtD:[120,98,"walk2",1,-34,98] }, out:["emtC","emtD"] },
      { t:"01:00:30", d:4, cap:"01:00，黎光耀從樓梯口跑上來。整段畫面裡，五樓走廊沒有出現過其他人。", st:{ door:true }, m:{ liC:[122,98,"walk1",1,-16,98] } }
    ] },
    cctv_lobby5: { scene:"s15_lobby", opt:{ cam:true, night:true }, cam:"1F-CAM01", date:"2026-10-08", beats:[
      { t:"20:58:30", d:4, cap:"一個穿白襯衫的男人走進大門，按電梯，進電梯。", st:{ floor:1, lift:true }, m:{ liC:[148,98,"walk1",1,-16,98] }, out:["liC"] },
      { t:"21:31:10", d:3.5, cap:"21:31，他從電梯出來，走出大門。", st:{ floor:1, lift:true }, m:{ liC:[-16,98,"walk2",-1,148,98] }, out:["liC"] },
      { t:"22:18:20", d:4, cap:"22:18，外送員戴著安全帽、提著便當走進來，進電梯。", st:{ floor:1, lift:true }, m:{ jieC:[148,98,"hold",1,-16,98] }, out:["jieC"] },
      { t:"22:23:00", d:3.5, cap:"22:23，外送員從電梯出來，離開。", st:{ floor:1, lift:true }, m:{ jieC:[-16,98,"walk1",-1,148,98] }, out:["jieC"] },
      { t:"22:50:40", d:4.5, cap:"22:50，一個戴棒球帽、穿工作外套的男人低著頭走進來，進電梯。電梯的樓層燈停在 3。", st:{ floor:1, lift:true }, m:{ capC:[148,98,"walk1",1,-16,98] }, out:["capC"] },
      { t:"22:50:40", d:2, join:true, cap:"22:50，一個戴棒球帽、穿工作外套的男人低著頭走進來，進電梯。電梯的樓層燈停在 3。", st:{ floor:3 } },
      { t:"00:41:00", d:4, cap:"00:41，救護人員跑進來，進電梯。", st:{ floor:1, lift:true }, m:{ emtC:[150,98,"walk1",1,-16,98], emtD:[140,98,"walk2",1,-34,98] }, out:["emtC","emtD"] },
      { t:"00:41:00", d:2, join:true, cap:"00:41，救護人員跑進來，進電梯。", st:{ floor:5 } },
      { t:"00:59:10", d:3.5, cap:"00:59，黎光耀跑進來，進電梯。", st:{ floor:1, lift:true }, m:{ liC:[148,98,"walk1",1,-16,98] }, out:["liC"] },
      { t:"00:59:10", d:2, join:true, cap:"00:59，黎光耀跑進來，進電梯。", st:{ floor:5 } }
    ] }
  };
  EP15.looks.jieC.hat = "cap"; EP15.looks.jieC.capColor = "#f4f4f0";   // 安全帽（白）
  Object.values(ANIM).forEach(A => { if (A.beats.some(b => b.st)) A.opt = Object.assign({}, A.opt || {}, { seq:A.beats.map(b => Object.assign({}, A.opt || {}, b.st || {})), ds:jds(A.beats) }); });
  [...EP15.cctv, ...EP15.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案 ---------- */
  // 剖面：大門 x10、客廳 x14–74（市話 x16、沙發 x36–70）、臥室 x78–130（書桌 x80–108）、浴室 x134–192
  const RB = [
    { t:"21:00:00", d:5, cap:"10 月 8 日 21:00。黎光耀來確認明天的筆錄。趙德安問他：移送完，能不能見女兒一面。", st:{ lit:true }, m:{ zhaoR:[50,74,"sit",1], liC:[66,75,"read",-1] } },
    { t:"21:30:00", d:3.5, cap:"21:30，黎光耀收起小本子，離開安全屋。", st:{ lit:true, door:true }, m:{ zhaoR:[50,74,"sit",1], liC:[2,75,"walk1",-1,66,75] }, out:["liC"] },
    { t:"21:52:00", d:5, cap:"21:52，他拿起市話叫外送：「排骨飯，加辣。明天要去講話了，今天吃好一點。」", st:{ lit:true }, m:{ zhaoR:[22,75,"phone",-1,50,74] } },
    { t:"22:20:00", d:5, cap:"22:20，林志豪開門把便當遞進來。他走到門口，問外送員有沒有加辣，叫他「少年仔」。", st:{ lit:true, door:true, bento:"full" }, m:{ zhaoR:[16,75,"hold",-1,22,75] } },
    { t:"22:40:00", d:5, cap:"他坐在沙發上，吃了大半個便當，兩包辣椒醬都撕開了。", st:{ lit:true, bento:true }, m:{ zhaoR:[50,74,"sit+eat",1,16,75] } },
    { t:"23:12:00", d:5, cap:"23:12，市話響了。答錄機開始錄音。他接起來——一個女孩的聲音：「爸……你為什麼要……害我……」", st:{ lit:true, bento:true, ring:true, off:true }, m:{ zhaoR:[22,75,"phone",-1,50,74] }, out:["zhaoR"] },
    { t:"23:13:00", d:5, cap:"那不是以晴。是從她的公開影片剪出來的。他聽不出來，喊了七聲「以晴」。", st:{ lit:true, bento:true, off:true }, m:{ zhaoX:[22,75,"kneel+cry",-1] } },
    { t:"23:30:00", d:5.5, cap:"他走進臥室，坐在桌子前面，用安全屋的藍色原子筆寫信：「給我的小船長」。把「在」寫成「再」，跟十八年來的生日卡一樣。", st:{ lit:true, bento:true, lamp:true, letter:true }, m:{ zhaoX:[98,74,"sit+write",-1,22,75] } },
    { t:"23:52:00", d:5, cap:"大約 23:52，他走進浴室，從裡面按下喇叭鎖。窗戶是封死的，門外的林志豪一直坐在走廊上。", st:{ lit:true, bento:true, lamp:true, letter:true }, m:{ zhaoX:[156,75,"walk1",1,98,74] }, out:["zhaoX"] },
    { t:"23:55:00", d:5, cap:"浴室的門，再也沒有從裡面打開過。", st:{ lit:true, bento:true, lamp:true, letter:true, bathShut:true } },
    { t:"00:30:00", d:5, cap:"00:30，林志豪進來查看，浴室的門鎖著，叫不應。他用肩膀撞了三次。", st:{ lit:true, bento:true, lamp:true, letter:true, bathShut:true, door:true }, m:{ linC:[128,75,["knock","knock2","knock","knock2"],1,4,75] } },
    { t:"00:34:00", d:4.5, cap:"門框往裡裂開。他割斷繩子，做 CPR，打 119。從 22:30 到這一刻，沒有任何人打開過安全屋的門。", st:{ lit:true, bento:true, lamp:true, letter:true, bathShut:true, broken:true, door:true }, m:{ linC:[150,75,"kneel",1,128,75] } }
  ];
  const foundN = () => { try { return ARC.list().filter(x => x.how === "found").length; } catch (e) { return 0; } };
  EP15.court = {
    title: "刑大會議室・10 月 9 日 17:50", scene: "s15_living", opt:{ bento:true, tv:false },
    who: ph => ["lin","li","yijun","chen","jie","mei","zhou"],
    open: ph => "17:50，刑大的會議室。窗簾拉起來，樓下的 SNG 車還沒走。黎光耀坐在長桌的另一頭，小本子攤開。林志豪坐在最邊邊，換了便服。林美鳳抱著那封信，坐在葉檢察官旁邊。",
    kindLine: {
      suicide: "趙德安不是被人吊上去的。是他自己走進浴室，鎖上門。",
      murder: "趙德安不是自己走的。有人進了那間浴室。"
    },
    kindTrue: "走廊監視器：22:30 以後到 00:30，安全屋的門沒有打開過。浴室的喇叭鎖從裡面按下，窗戶的螺絲漆沒有裂。繩子是他從小在漁船上綁慣的漁人結，勒痕往耳後斜上，沒有掙扎傷。那封信，是他自己的字。\n……可是，23:12 那通電話，不是以晴打的。",
    murmur: [ "（林志豪的右肩一直在抖。）", "（黎光耀在小本子上寫了一行字，又劃掉。）", "（林美鳳把信紙按在胸口。）" ],
    confess: {},
    cornered: {},
    deny: {
      lin: "我沒有進去……我就是沒有進去，所以……",
      li: "我 21:30 就走了。門禁紀錄在你手上。",
      yijun: "鑰匙一整晚都在我家。",
      chen: "我十點就下班了啦！",
      jie: "我連門都沒進欸！",
      mei: "……他是我先生。",
      zhou: "查清楚。我只要查清楚。"
    },
    replayText: "10 月 8 日晚上，安全屋。他還在等明天——",
    replay: { scene:"s15_flat", opt:{ seq:RB.map(b => b.st), ds:jds(RB) }, clean:true, cam:"事發經過重現", date:"2026-10-08", beats:RB },
    get endGood(){
      let s = "18:30，記者會。黎光耀照著你的報告念：「證人趙德安，自縊身亡。查無他人進入。」\n記者舉手：「那通電話呢？」\n黎光耀闔上小本子：「教唆自殺，另案偵辦。」\n散會以後，林美鳳把那封信交給以晴。以晴讀到「給我的小船長」，把信紙貼在臉上。下禮拜一，她還是去考了模擬考。";
      if (foundN() >= 8) s += "\n\n你把這半年來記下的東西攤在桌上：淹水報廢的槍、綁架案那通電話、證物室的筆記本、分機 4417……一條一條，都通往同一棟大樓。";
      return s;
    },
    endBad: "18:30，記者會。標題是「督察組安全屋疑遭滅口」。\n以晴的 IG 底下湧進了上千則留言。她把帳號關了。\n那通電話，再也沒有人去查。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[15] && ARC_INTER[15].after) EP15.after = Object.assign({}, ARC_INTER[15].after);

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP15.outScenes = [];
  EP15.fac = { safehouse:["#c8c0b0","#5a6a5a"], police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], morgue:["#d8e0e0","#5a7a8a"], zhaohome:["#e0d4bc","#8a6a4a"], bento:["#f0e4c8","#c83a2a"] };
  EP15.setting = { safehouse:"town", police:"city", lab:"city", morgue:"city", zhaohome:"town", bento:"town" };
  const SKY15 = [ ["#0a0f1c","#24304a","#2a3040","#323a4a",0,0], ["#9ab0c4","#d8e0e4","#4a6070","#56707a",0,0] ];
  EP15.worldSky = ph => SKY15[Math.min(ph || 0, SKY15.length - 1)];
  EP15.worldOrder = { safehouse:["lobby5","hall5","living","bedroom","bath"], zhaohome:["zliving","zgirl"] };
  EP15.roomDesc = {
    lobby5:"一樓大門。管理室的窗口、信箱、電梯。", hall5:"五樓走廊。看守桌對著安全屋的門。", living:"安全屋的客廳。", bedroom:"安全屋的臥室。", bath:"安全屋的浴室。",
    pdesk:"三樓刑大。你的位子。", lab:"鑑識中心。", mroom:"法醫室。", zliving:"趙家客廳，港東社區老公寓四樓。", zgirl:"以晴的房間。", shop:"民生路口的阿華便當。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police" };
  const RX = i => 116 + i * 198;
  EP15.world = {};
  EP15.locations.forEach(l => { EP15.world[l.id] = { auto:true, you:YOU, order:(EP15.worldOrder || {})[l.id] }; });
  Object.assign(EP15.world.safehouse, {
    extras: [
      { id:"cop15", name:"守在一樓的員警", phase:0, until:0, x:RX(0) + 30, L:COP, pose:"stand", facing:1, lines:[
        "督察組交代，住戶問就說是有人身體不舒服。", "救護車 00:50 就走了。人……還在樓上，等檢察官。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長……是趙德安。督察組的安全屋，五樓。", "小吳"),
      say("wu", "00:30 看守的員警去查看，浴室的門鎖著，撞開以後……他已經……", "小吳"),
      say("wu", "他今天早上九點就要移送作證了。說出「上面的人」是誰。", "小吳"),
      say("you", "……上去吧。門、窗、繩子，每一樣都要看。", "你"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳")
    ]
  });
  EP15.mapPos = { safehouse:[70,96,"d"], police:[110,56,"u"], lab:[170,80,"d"], morgue:[186,100,"r"], zhaohome:[40,60,"u"], bento:[90,104,"r"] };
  EP15.mapRoads = [["safehouse","police"],["safehouse","bento"],["police","lab"],["lab","morgue"],["police","zhaohome"]];
  EP15.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 40; x < 200; x += 8) for (let y = 20; y < 110; y += 7){ R(x, y, 6, 5, "#c8c0b0"); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, "#b0a898"); }
    R(0, 112, 240, 23, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 113 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");
    for (let k = 0; k < 3; k++){ R(20 + k * 30, 104, 3, 10, "#c83a2a"); R(14 + k * 30, 102, 16, 2, "#c83a2a"); }   // 港區吊車
    R(102, 48, 16, 10, "#cfcabb"); R(104, 46, 12, 3, "#3f5a7a"); R(108, 50, 4, 3, "#e8c040");   // 警察局
  };
})();
