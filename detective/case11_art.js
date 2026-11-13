/* =========================================================
   第 11 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP11.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, OBJ, windowBox, door, sign, lamp, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + 0.5, en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const kf = (v, p) => Array.isArray(v) ? (() => { if (v.length === 1) return v[0]; const k = p * (v.length - 1), i = Math.min(v.length - 2, Math.floor(k)); return v[i] + (v[i + 1] - v[i]) * (k - i); })() : v;
  const stOf = o => { if (!o.ds) return [{}, 0]; const [i, p] = beatAt(o.t || 0, o.ds); return [(o.seq || [])[i] || {}, p]; };
  const clip = (x, y, w, h, fn) => { const g = PR.g(); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  // 公車：x＝車頭左邊，y＝車頂；ad＝海產節廣告
  const bus = (x, y, ad) => { x = Math.round(x);
    R(x, y, 64, 18, ad ? "#f4f0e8" : "#f0f0f0"); R(x, y + 14, 64, 2, "#2a6a5a"); for (let k = 0; k < 6; k++) R(x + 4 + k * 10, y + 2, 8, 6, "#3a4a5a");
    if (ad){ R(x + 8, y + 9, 30, 5, "#e04a2a"); R(x + 10, y + 8, 4, 2, "#e04a2a"); R(x + 32, y + 8, 4, 2, "#e04a2a"); P(x + 20, y + 10, "#ffffff"); P(x + 26, y + 10, "#ffffff"); txt("海產節", x + 40, y + 13, "#c23a2a", "5px sans-serif"); }
    R(x + 6, y + 17, 7, 3, "#1a1a1a"); R(x + 50, y + 17, 7, 3, "#1a1a1a"); txt("12", x + 56, y + 7, "#e8c040", "5px monospace"); };
  // 展示櫃：broken＝玻璃破了
  const vcase = (x, y, w, broken, plated) => {
    R(x, y + 8, w, 12, "#5a3a24"); R(x, y + 7, w, 2, "#8a6338");
    R(x + 1, y, w - 2, 8, broken ? "#2a2a30" : "#c8e0e8"); dither(x + 1, y, w - 2, 8, "#e8f4f8", 3);
    if (!broken){ for (let k = 0; k < Math.floor((w - 4) / 4); k++){ R(x + 3 + k * 4, y + 3, 2, 3, plated ? "#d8b860" : "#f2c94c"); P(x + 3 + k * 4, y + 3, "#fff6c8"); } }
    else { R(x + 2, y + 5, w - 4, 2, "#5a1e24"); for (let k = 0; k < 6; k++) P(x + 3 + k * 3, y + 1 + (k % 3), "#e8f4f8"); }
    R(x + w - 2, y - 1, 2, 2, "#3a3a3e"); };

  /* ---------- 場景 ---------- */
  // 店面（o.broken：展示櫃破了；o.tape：封鎖線）
  SC.g11_front = (o) => { const [s, p] = stOf(o), broken = o.broken || s.broken, shut = kf(s.shutter === undefined ? 1 : s.shutter, p);
    wall(72, "#7a2a24", false); R(0, 64, W, 8, "#4a1a14"); dither(0, 0, W, 64, "#8a3a2a", 6);
    R(56, 2, 80, 8, "#2a1a10"); txt("金　福　銀　樓", 66, 9, "#f2c94c", "6px serif");
    R(0, 20, 16, 54, "#6a6e74"); for (let y = 20 + Math.round(54 * (1 - shut)); y < 74; y += 3) R(0, y, 16, 1, "#4a4e54"); if (shut < 1) R(0, 20, 16, Math.round(54 * (1 - shut)), "#1a2430");   // 鐵捲門
    R(150, 14, 24, 16, "#1a1a1e"); for (let k = 0; k < 4; k++) R(151 + (k % 2) * 11, 15 + Math.floor(k / 2) * 7, 10, 6, ["#2a3a2a", "#3a2a2a"][k % 2]); txt("REC", 152, 29, "#e04a3a", "4px monospace");   // 監視器主機
    R(120, 10, 24, 14, "#1a1a1a"); txt("金價", 122, 17, "#f2c94c", "5px sans-serif"); txt("14050", 122, 23, "#e04a3a", "5px monospace");   // 金價牌
    vcase(24, 48, 36, false, true); vcase(68, 48, 20, broken); vcase(90, 48, 22, broken);   // 展示櫃
    R(124, 54, 56, 20, "#5a3a24"); R(122, 52, 60, 3, "#8a6338"); R(130, 52, 30, 3, "#2a1e18"); for (let k = 0; k < 7; k++){ R(132 + k * 4, 52, 3, 2, "#f2c94c"); }   // 櫃台、戒指盤
    R(166, 46, 8, 6, "#2a2a2e"); R(167, 47, 6, 3, "#3a3a3e");   // 電話
    R(184, 20, 8, 54, "#3a1a14"); R(185, 34, 6, 20, "#1a0e0a");   // 往走廊的門
    lamp(50, 0, "#f8e0a0"); lamp(140, 0, "#f8e0a0");
    floor(72, "#c8b8a0", "#b8a890");
    if (broken){ for (let k = 0; k < 14; k++) P(70 + (k * 7) % 44, 76 + (k * 5) % 12, "#e8f4f8"); R(108, 86, 3, 2, "#4a4a54"); P(109, 86, "#8a8a9a"); }   // 碎玻璃、面罩碎片
    if (o.tape) OBJ.tape(0, 82, 20);
  };
  // 保險櫃室＋後走廊（o.open：保險櫃開著；o.mark：證物標示）
  SC.g11_back = (o) => { const [s, p] = stOf(o);
    wall(72, "#d8ccb4", false); R(0, 64, W, 8, "#8a7a64");
    R(10, 30, 36, 44, "#3a3e44"); R(12, 32, 32, 40, "#2a2e34"); R(12, 44, 32, 2, "#5a5e64"); R(12, 58, 32, 2, "#5a5e64");   // 保險櫃
    R(18, 47, 20, 10, "#6b4a2b"); R(19, 48, 18, 6, "#7a1e24"); for (let k = 0; k < 6; k++) R(20 + k * 3, 49, 2, 4, k < 2 ? "#5a1a1e" : "#8a2a2e");   // 木盒（凹槽）
    R(46, 30, 6, 44, "#4a4e54"); R(47, 48, 4, 4, "#c8c8c8");   // 打開的櫃門
    R(48, 62, 24, 3, "#8a6a4a"); R(50, 65, 2, 9, "#6a4a2a"); R(68, 65, 2, 9, "#6a4a2a"); R(52, 58, 14, 4, "#f4f0e0"); R(53, 59, 10, 1, "#3a3a3a");   // 清點單
    R(76, 18, 4, 56, "#a89a84");   // 隔間牆
    R(116, 22, 34, 52, "#b8a88c"); for (let k = 0; k < 8; k++) R(116 + k * 4, 70 - k * 6, 34 - k * 4, 2, "#8a6a4a"); R(116, 22, 2, 52, "#6a5a44");   // 往二樓的樓梯
    door(160, 30, 24, 44, "#5a5e64"); R(162, 22, 20, 6, "#f4f0e0"); txt("21:03", 164, 27, "#c23a2a", "4px monospace");   // 後門＋紙條
    R(84, 4, 8, 4, "#2a2a2e");   // 走廊燈
    lamp(30, 0, "#f8e8c8"); lamp(130, 0, "#f8e8c8");
    floor(72, "#a89a84", "#9a8c76");
    if (!o.clean){ R(96, 82, 22, 6, "#7a1a1a"); R(118, 84, 40, 2, "#7a1a1a"); R(100, 80, 6, 3, "#2a2a2e"); }   // 血、對講機
    if (!o.clean){ R(92, 90, 4, 2, "#d8a830"); P(92, 90, "#f8e080"); }   // 彈殼
    if (!o.clean){ R(140, 92, 3, 4, "#f4c8d8"); R(141, 96, 1, 2, "#c8a878"); R(143, 92, 3, 1, "#8a8a8a"); }   // 冰棒鑰匙圈
    if (o.mark){ OBJ.marker(94, 96, 1); OBJ.marker(142, 100, 2); OBJ.marker(108, 92, 3); }
  };
  // 二樓辦公室（o.cam：攝影機畫面；s.bus：窗外公車的位置）
  SC.g11_office = (o) => { const [s, p] = stOf(o);
    wall(72, "#e8e0cc", false); R(0, 64, W, 8, "#7a6a54");
    R(4, 28, 24, 46, "#5a5e64"); R(6, 30, 20, 42, "#6a6e74"); R(22, 48, 4, 3, "#3a3a3e"); R(8, 26, 16, 3, "#3a3a3e");   // 後門（往鐵梯）
    R(34, 20, 24, 52, "#8a7a64"); for (let k = 0; k < 3; k++) R(36, 26 + k * 15, 20, 1, "#6a5a44"); R(40, 12, 12, 8, "#f4f4f4"); R(43, 14, 6, 4, "#2a2a2e"); P(45, 15, "#3a8ae0"); P(50, 13, "#e04a3a");   // 櫃子、網路攝影機
    R(100, 14, 20, 24, "#c8a040"); R(102, 16, 16, 20, "#e8e8f0"); R(105, 22, 4, 12, "#f4f4f4"); R(111, 22, 4, 12, "#e8c8d8"); R(105, 19, 4, 3, "#e8c09a"); R(111, 19, 4, 3, "#e8c09a"); P(108, 30, "#f2c94c");   // 婚紗照
    // 窗戶＋公車站
    R(136, 8, 50, 38, "#5a4a3a"); clip(138, 10, 46, 34, () => {
      R(138, 10, 46, 34, o.cam && !o.day ? "#1a2230" : "#9cc5e6"); R(138, 34, 46, 10, "#4a4a4e"); R(138, 33, 46, 1, "#e8e040");
      R(170, 18, 2, 16, "#8a8a8a"); R(166, 16, 10, 4, "#2a6a5a");   // 站牌
      const bx = s.bus === undefined ? null : kf(s.bus, p); if (bx !== null) bus(138 + bx, 18, !s.plain);
    }); R(160, 8, 2, 38, "#5a4a3a");
    R(44, 62, 86, 4, "#6b4a2b"); R(46, 66, 3, 8, "#5a3e24"); R(125, 66, 3, 8, "#5a3e24"); R(44, 62, 86, 1, "#8a6338");   // 辦公桌
    R(84, 48, 22, 13, "#2a2a2e"); R(85, 49, 20, 10, "#3a5a7a"); R(84, 60, 22, 2, "#4a4a4e");   // 筆電
    R(48, 58, 14, 4, "#2a4a3a"); R(49, 58, 12, 1, "#f4f0e0"); R(64, 58, 14, 4, "#f4f0e0"); R(65, 59, 8, 1, "#2a5a8a"); R(110, 58, 14, 4, "#f4f0e0"); R(111, 59, 10, 1, "#c23a2a"); R(115, 58, 2, 4, "#c8c8a0");   // 帳本、保險信、會計師通知
    R(94, 76, 14, 4, "#2a2a2a"); R(96, 66, 10, 10, "#3a3a44");   // 椅子
    lamp(90, 0, "#f8e8c8");
    floor(72, "#9a8a70", "#8a7a60");
    if (o.cam){ txt("CAM-OFFICE", 4, 7, "#f4f4f4", "5px monospace"); }
  };
  // 後巷
  SC.g11_alley = (o) => {
    R(0, 0, W, 80, "#1e2028"); dither(0, 0, W, 80, "#2a2c34", 4);
    R(0, 0, 130, 80, "#6a5e52"); dither(0, 0, 130, 80, "#5a5046", 5);   // 銀樓的背面
    door(22, 2, 14, 18, "#5a5e64");   // 二樓後門
    for (let k = 0; k < 6; k++){ const y = 20 + k * 10, x = (k % 2) ? 18 : 36; R(18, y, 36, 1, "#6a3a24"); R(x === 18 ? 18 : 18, y, 2, 10, "#5a2a1a"); for (let j = 0; j < 4; j++) R(20 + j * 9 + (k % 2) * 4, y + 2 + j * 2, 6, 1, "#8a4a2a"); }   // 鐵梯
    R(54, 20, 2, 60, "#5a2a1a");
    door(62, 34, 22, 40, "#5a5e64"); R(64, 28, 18, 5, "#3a3a3e");   // 一樓後門
    R(86, 60, 14, 10, "#f4f0e0"); txt("21:05", 87, 67, "#2a2a2a", "4px monospace");   // 告示
    R(110, 20, 4, 60, "#3a3a3e");
    R(136, 0, 3, 60, "#3a3a3e"); R(132, 0, 12, 4, "#4a4a4e"); R(134, 4, 8, 2, "#2a2a2a");   // 壞掉的路燈
    R(150, 40, 42, 34, "#3a2a24"); R(148, 34, 46, 8, "#c23a2a"); txt("檳榔", 160, 41, "#f2f24c", "6px sans-serif"); dither(148, 34, 46, 8, "#ff4a8a44", 2); R(152, 50, 36, 10, "#e8e0c8"); R(154, 52, 6, 4, "#3a8a3a"); R(162, 52, 6, 4, "#3a8a3a");   // 檳榔攤
    floor(80, "#4a4a50", "#40404a");
    R(82, 78, 18, 16, "#2a5a3a"); R(80, 76, 22, 3, "#3a6a4a");   // 垃圾桶
    R(100, 94, 40, 2, "#1a1a1a"); R(110, 96, 30, 1, "#1a1a1a"); R(90, 90, 8, 3, "#2a2a1e");   // 輪胎痕、機油
    R(145, 92, 4, 1, "#f4f0e0"); R(148, 93, 4, 1, "#e8c890"); R(146, 94, 3, 1, "#f4f0e0");   // 菸蒂
    R(60, 80, 30, 6, "#5a6a7a"); dither(60, 80, 30, 6, "#7a8a9a", 3);   // 冷氣滴水的水漬
  };
  // 醫院（阿勇的病房）
  SC.hosp11 = (o) => { SC.hospital(o);
    R(58, 64, 22, 3, "#c8ccd0"); R(60, 67, 2, 7, "#9aa"); R(76, 67, 2, 7, "#9aa"); R(62, 58, 12, 6, "#e8ecf0"); R(64, 60, 4, 3, "#c8a040");   // 推車、證物袋
    R(100, 40, 14, 18, "#a8b0b8"); R(102, 42, 10, 14, "#f4f6f6"); for (let k = 0; k < 4; k++) R(103, 44 + k * 3, 8, 1, "#888");   // 病歷板
    R(152, 58, 10, 5, "#e8ecf0"); R(154, 59, 4, 2, "#a8a8b0");   // 床上的小袋子
  };
  SC.pol11 = (o) => { SC.police(o); R(176, 40, 14, 30, "#c8a070"); R(178, 43, 10, 8, "#f4f0e0"); R(178, 54, 10, 8, "#f4f0e0"); R(184, 44, 3, 3, "#c23a2a"); };
  SC.lab11 = (o) => { SC.lab(o); R(124, 54, 26, 6, "#7a1e24"); for (let k = 0; k < 8; k++){ R(126 + k * 3, 55, 2, 4, "#f2c94c"); P(126 + k * 3, 55, "#fff6c8"); } };
  // 客運調度站
  SC.g11_bus = (o) => {
    wall(72, "#d8dcd4", false); R(0, 64, W, 8, "#6a7a6a");
    R(20, 20, 30, 24, "#f4f0e0"); for (let k = 0; k < 6; k++) R(22, 23 + k * 3, 24 - (k % 2) * 6, 1, "#3a3a3a");   // 排班表
    R(58, 8, 64, 30, "#1a1a1e"); R(60, 10, 60, 26, "#1a2a3a"); for (let x = 62; x < 118; x += 2) P(x, 24 + Math.round(Math.sin(x / 8) * 6), "#6fd46f"); for (let k = 0; k < 5; k++) R(66 + k * 11, 22 + Math.round(Math.sin((66 + k * 11) / 8) * 6), 3, 3, k === 2 ? "#e04a3a" : "#f2c94c");   // GPS 大螢幕
    R(66, 58, 60, 4, "#7a7a7a"); R(68, 62, 3, 12, "#5a5a5a"); R(121, 62, 3, 12, "#5a5a5a"); R(80, 46, 30, 12, "#f4f4f0"); for (let k = 0; k < 4; k++) R(82, 48 + k * 2, 24, 1, "#5a5a5a"); R(82, 52, 24, 1, "#e04a3a");   // 桌上的到站紀錄
    R(128, 18, 54, 34, "#5a5e64"); clip(130, 20, 50, 30, () => { R(130, 20, 50, 30, "#9cc5e6"); R(130, 42, 50, 8, "#6a6a6a"); bus(124, 26, true); });   // 窗外的 517
    lamp(96, 0, "#f4f4e8");
    floor(72, "#8a9a8a", "#7a8a7a");
  };
  // 阿珠冰店
  SC.g11_ice = (o) => {
    wall(72, "#e8f0e8", false); R(0, 64, W, 8, "#3a8aa0");
    R(20, 16, 40, 30, "#a8784a"); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++){ R(22 + c * 9, 18 + r * 9, 8, 7, "#f4f0e0"); for (let j = 0; j < 3; j++) P(23 + c * 9 + j * 2, 21 + r * 9, "#e04a3a"); }   // 集點板
    R(66, 10, 60, 12, "#e86a8a"); txt("阿珠冰", 80, 19, "#ffffff", "8px sans-serif");
    R(66, 40, 40, 34, "#c8d0d8"); R(66, 38, 40, 3, "#a8b0b8"); R(76, 28, 12, 12, "#8a8e94"); R(80, 24, 4, 4, "#3a3a3e");   // 刨冰機
    R(86, 64, 30, 3, "#e8d8b8"); R(88, 67, 2, 7, "#a89878"); R(112, 67, 2, 7, "#a89878"); R(92, 58, 10, 6, "#f4f0f4"); R(93, 56, 8, 3, "#f4f4f4"); R(94, 55, 4, 2, "#a83a3a");   // 桌子、紅豆牛奶冰
    R(138, 12, 48, 34, "#5a8aa0"); clip(140, 14, 44, 30, () => { R(140, 14, 44, 18, "#cfe3ee"); R(140, 30, 44, 14, "#3a6a8a"); for (let k = 0; k < 3; k++){ R(144 + k * 14, 28, 12, 4, ["#e9e4da", "#c23a2a", "#3a6ab8"][k]); R(148 + k * 14, 22, 1, 6, "#5a5a5a"); } });   // 碼頭
    floor(72, "#d8d0c0", "#c8c0b0");
  };
  // 林家（南澳漁港的老房子）
  SC.g11_lin = (o) => {
    wall(72, "#b8ac94", true); R(0, 64, W, 8, "#6a5a44"); dither(0, 0, W, 64, "#a89a80", 5);
    R(0, 24, 42, 50, "#3a4a5a"); R(0, 60, 42, 14, "#6a6a6a");   // 打開的大門（外面）
    R(4, 62, 30, 8, "#e9e4da"); R(2, 70, 8, 8, "#1a1a1a"); R(26, 70, 8, 8, "#1a1a1a"); R(10, 58, 14, 5, "#2a2a2e"); R(20, 61, 6, 2, "#8a8a8a"); P(25, 60, "#5a5a64");   // 白色機車、歪掉的扣環
    R(42, 28, 22, 48, "#7a6a54"); R(44, 62, 18, 12, "#7a6a54"); for (let k = 0; k < 5; k++) R(45 + k * 3, 63 + (k % 2) * 3, 2, 8, "#a82a1a");   // 門板、紅漆
    R(64, 52, 30, 2, "#5a4a3a"); R(68, 42, 10, 10, "#1a1a1e"); R(70, 44, 6, 4, "#3a3a44"); R(80, 42, 10, 10, "#1a1a1e"); R(82, 44, 6, 4, "#3a3a44"); R(86, 47, 2, 1, "#b8ac94");   // 安全帽（缺一角）
    R(80, 14, 16, 20, "#e8e0c8"); R(82, 16, 12, 16, "#a8b8c0"); R(84, 22, 4, 8, "#c8a080"); R(89, 24, 3, 6, "#c8a080");   // 舊照片
    R(90, 64, 40, 3, "#8a6a4a"); R(92, 67, 2, 7, "#6a4a2a"); R(126, 67, 2, 7, "#6a4a2a"); R(98, 60, 6, 4, "#2a2a2e"); P(100, 61, "#6fd46f");   // 桌子、預付卡手機
    R(118, 50, 16, 24, "#4a3a2a"); R(116, 44, 20, 16, "#24324e"); R(130, 52, 4, 2, "#8a8a8a");   // 椅背上的外套
    R(150, 54, 24, 20, "#2a5a8a"); R(148, 52, 28, 3, "#3a6a9a"); R(154, 50, 16, 3, "#c8b890");   // 米桶
    lamp(110, 0, "#e8d8a8");
    floor(72, "#8a7a60", "#7a6a50");
    if (o.gold){ R(152, 50, 4, 2, "#f2c94c"); R(158, 49, 4, 2, "#f2c94c"); }
  };
  // 邱家（港景大樓 18 樓・書房）
  SC.g11_qiu = (o) => {
    wall(72, "#f0ece4", false); R(0, 64, W, 8, "#a8a098");
    R(50, 8, 96, 36, "#c8c8c8"); clip(52, 10, 92, 32, () => { R(52, 10, 92, 20, "#9cc5e6"); R(52, 30, 92, 12, "#3a6a8a"); for (let k = 0; k < 6; k++) R(56 + k * 15, 22 - (k % 3) * 4, 10, 8 + (k % 3) * 4, "#8a9aa8"); });   // 落地窗（港景）
    R(10, 50, 30, 24, "#f4e8d8"); for (let k = 0; k < 6; k++) R(12 + k * 5, 50, 1, 20, "#d8c8b0"); R(14, 44, 10, 6, "#f4f0e0"); R(28, 46, 8, 6, "#f4c8d8");   // 嬰兒床、包裝、卡片
    R(60, 66, 74, 3, "#5a4a3a"); R(62, 69, 3, 5, "#4a3a2a"); R(129, 69, 3, 5, "#4a3a2a"); R(70, 60, 20, 6, "#6a5a4a"); R(78, 62, 4, 1, "#c8c8c8");   // 書桌、抽屜
    R(94, 62, 12, 3, "#f4e8c8"); R(95, 61, 10, 1, "#c23a2a");   // 當票
    R(110, 52, 16, 10, "#1a1a1e"); R(111, 53, 14, 8, "#1a2a1a"); for (let x = 112; x < 124; x++) P(x, 55 + ((x * 3) % 5), x < 118 ? "#6fd46f" : "#e04a3a");   // 平板
    R(150, 62, 20, 12, "#c8a878"); R(152, 58, 16, 5, "#a8c8e8");   // 洗衣籃、淺藍襯衫
    lamp(96, 0, "#fff4e0");
    floor(72, "#c8b8a0", "#b8a890");
  };
  // 店裡的監視器主機：左 CAM1 店面、右 CAM2 保險櫃室
  SC.g11_dvr = (o) => { const [s, p] = stOf(o), shut = kf(s.shutter === undefined ? 1 : s.shutter, p);
    R(0, 0, W, H, "#0a0a0c");
    // CAM1
    R(0, 0, 95, 98, "#7a2a24"); R(0, 64, 95, 34, "#c8b8a0");
    R(0, 34, 10, 40, "#3a1a14"); R(1, 40, 8, 34, "#1a0e0a");   // 往走廊的門（左邊）
    R(84, 22, 11, 52, "#6a6e74"); for (let y = 22 + Math.round(52 * (1 - shut)); y < 74; y += 3) R(84, y, 11, 1, "#4a4e54"); if (shut < 1) R(84, 22, 11, Math.round(52 * (1 - shut)), "#1a2430");   // 鐵捲門（右邊）
    vcase(18, 52, 18, s.broken); vcase(40, 52, 18, s.broken); R(62, 58, 20, 16, "#5a3a24"); R(60, 56, 24, 3, "#8a6338"); R(70, 52, 6, 4, "#2a2a2e");   // 展示櫃、櫃台、電話
    // CAM2
    R(97, 0, 95, 98, "#d8ccb4"); R(97, 70, 95, 28, "#a89a84");
    R(104, 30, 28, 44, "#3a3e44"); R(106, 32, 24, 40, "#2a2e34"); R(110, 46, 16, 8, s.box ? "#7a1e24" : "#6b4a2b"); if (s.box) for (let k = 0; k < 5; k++) R(111 + k * 3, 47, 2, 4, "#5a1a1e");   // 保險櫃
    R(132, 30, 4, 44, "#4a4e54");
    R(180, 30, 12, 44, "#8a7a64"); R(182, 34, 8, 40, "#2a2420");   // 門（右邊，通走廊）
    R(95, 0, 2, H, "#0a0a0c");
    txt("CAM1", 3, 7, "#f4f4f4", "5px monospace"); txt("CAM2", 100, 7, "#f4f4f4", "5px monospace");
    R(0, 98, W, 10, "#0a0a0c");
  };
  // 案發經過重現：剖面（左邊後巷和鐵梯，中間二樓辦公室、一樓走廊，右邊保險櫃室和店面）
  SC.g11_cut = (o) => { const [s, p] = stOf(o);
    R(0, 0, W, H, "#141418");
    R(0, 0, 36, 98, "#1e2028"); for (let k = 0; k < 4; k++){ const y = 50 + k * 12; for (let j = 0; j < 12; j++) P((k % 2 ? 30 - j * 2 : 8 + j * 2), y + Math.round(j), "#8a4a2a"); }   // 後巷、鐵梯
    R(28, 50, 8, 2, "#8a4a2a");
    R(36, 2, 156, 48, "#e8e0cc"); R(36, 48, 156, 2, "#5a4a3a");   // 二樓
    R(36, 22, 4, 26, "#5a5e64");   // 二樓後門
    R(60, 38, 50, 3, "#6b4a2b"); R(62, 41, 2, 7, "#5a3e24"); R(106, 41, 2, 7, "#5a3e24"); R(78, 32, 12, 6, "#3a5a7a");   // 辦公桌
    R(66, 6, 6, 4, "#f4f4f4"); P(68, 7, "#e04a3a");   // 攝影機
    R(160, 8, 28, 26, "#5a4a3a"); clip(162, 10, 24, 22, () => { R(162, 10, 24, 22, "#1a2230"); const bx = s.bus === undefined ? null : kf(s.bus, p); if (bx !== null) bus(162 + bx, 14, true); });   // 窗外
    R(36, 52, 156, 46, "#d8ccb4");   // 一樓
    R(36, 60, 4, 38, s.backOpen ? "#1e2028" : "#5a5e64");   // 一樓後門
    for (let k = 0; k < 8; k++) R(96 + k * 2, 92 - k * 6, 10, 2, "#8a6a4a");   // 樓梯
    R(118, 52, 3, 46, "#a89a84"); R(122, 66, 18, 26, "#3a3e44"); R(124, 70, 14, 8, "#7a1e24");   // 保險櫃室
    R(150, 52, 3, 46, "#a89a84"); R(156, 82, 30, 6, "#5a3a24"); R(156, 78, 30, 4, s.broken ? "#2a2a30" : "#c8e0e8");   // 店面
    txt("2F", 40, 9, "#8a7a64"); txt("1F", 40, 59, "#8a7a64"); txt("後巷", 4, 9, "#8a8a9a", "5px sans-serif");
    R(0, 98, W, 10, "#3a3a40");
    if (s.flash){ PR.g().fillStyle = "rgba(220,200,120,.35)"; PR.g().fillRect(36, 52, 114, 46); }
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    qiu:  { skin:"#ecc8a4", hair:"#1a1410", hairStyle:"slick", top:"#a8c8e8", bottom:"#2a2a3a", glasses:true, mood:"worried", hello:"我在樓上……我什麼都沒看到，我只聽到一聲。",
            byPhase:{ 1:{ top:"#e9e4da" }, 2:{ top:"#c8c8d0", mood:"tired" } } },
    lu:   { skin:"#d8a880", hair:"#c8c8c8", hairStyle:"balding", top:"#8a6a3a", bottom:"#3a3a3a", glasses:true, mood:"sad", hello:"四十年了……第一次有人拿槍頂著我的頭。" },
    shan: { skin:"#f4d4bc", hair:"#2a2220", hairStyle:"long", top:"#e8b8c8", bottom:"#e8b8c8", skirt:true, mood:"worried", hello:"我先生打了十幾通電話給我……" },
    wen:  { skin:"#f4d4bc", hair:"#1e1a18", hairStyle:"pony", top:"#f4f0e0", bottom:"#2a2a3a", apron:"#c23a2a", mood:"shock", hello:"我只是去倒垃圾……",
            byPhase:{ 1:{ top:"#5a6a8a", apron:null, mood:"sad" }, 2:{ top:"#5a6a8a", apron:null, mood:"tired" } } },
    yong: { skin:"#c89a70", hair:"#2a2220", hairStyle:"short", top:"#c8dce8", bottom:"#c8dce8", mood:"tired", hello:"我沒攔住……對不起老闆。" },
    doc:  { skin:"#f0d0b4", hair:"#2a2220", hairStyle:"bob", top:"#a8d8c8", coat:"#f4f6f6", bottom:"#a8d8c8", stetho:true, hello:"命保住了。" },
    mei:  { skin:"#c89a70", hair:"#5a4a40", hairStyle:"bun", top:"#6a8a4a", bottom:"#3a3a3a", apron:"#3a6a3a", hello:"那兩台……不是，那一台機車喔，差點撞到我的攤子。" },
    zhu:  { skin:"#d8a880", hair:"#8a8a8a", hairStyle:"bun", top:"#f4f0f4", bottom:"#3a4a6a", apron:"#e86a8a", mood:"smile", hello:"警察先生，吃冰嗎？" },
    jc:   { skin:"#b88a60", hair:"#1a1410", hairStyle:"short", top:"#5a6a5a", bottom:"#3a3a30", mood:"sad", hello:"……我就知道會有今天。" },
    ja:   { skin:"#c89a70", hair:"#1a1410", hairStyle:"spiky", top:"#24324e", bottom:"#2a2a2a", mood:"shock", shake:true, hello:"我不是故意的……" },
    lai:  { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#4a7a6a", bottom:"#2a3a3a", hat:"cap", capColor:"#2a5a4a", hello:"GPS 不會騙人的。" },
    xu:   { hello:"後門沒有被撬。是從裡面開的。" },
    wu:   { hello:"學長，金子耶……整間店都是金子。" },
    ye:   { hello:"你給我理由，我就放人。" }
  };
  ["xu","wu","ye"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.xu.top) Object.assign(LOOK.xu, { skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"pony", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#2a2a30", glasses:true });
  if (!LOOK.wu.top) Object.assign(LOOK.wu, { skin:"#e8c09a", hair:"#1a1410", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4a6a", glasses:true });
  if (!LOOK.ye.top) Object.assign(LOOK.ye, { skin:"#f0d0b4", hair:"#1a1410", hairStyle:"bob", top:"#2a2a30", coat:"#2a2a30", bottom:"#2a2a30" });
  const DAILY = {
    qiu:  [ { room:"gfront", x:150, pose:"cross", doing:"站在櫃台旁邊，一直搓手上的金戒指。" }, { room:"goffice", x:96, pose:"sit", doing:"坐在二樓辦公室，把帳本翻來翻去。" }, { room:"goffice", x:60, pose:"phone", doing:"在辦公室講電話，聲音壓得很低。" } ],
    lu:   [ { room:"gvault", x:60, pose:"sit", doing:"坐在保險櫃室的地上，看著空掉的木盒。" }, { room:"hward", x:120, pose:"stand", doing:"站在阿勇的病床邊。" }, { room:"gfront", x:140, pose:"sit", doing:"坐在櫃台後面，對著空的展示櫃發呆。" } ],
    shan: [ { room:"gfront", x:110, pose:"phone", doing:"剛從補習班趕來，一直打電話。" }, { room:"gfront", x:140, pose:"stand", doing:"在店裡陪爸爸，一手扶著肚子。" }, { room:"qroom", x:40, pose:"sit", doing:"坐在嬰兒床旁邊，什麼都沒做。" } ],
    wen:  [ { room:"gfront", x:60, pose:"cry", doing:"坐在店面的椅子上發抖，制服上沾了阿勇的血。" }, { room:"pdesk", x:60, pose:"sit", doing:"坐在偵訊室外面的長椅上，抱著包包。" }, { room:"pdesk", x:60, pose:"sit", doing:"還在刑大，一夜沒睡。" } ],
    yong: [ { room:"hward", x:166, pose:"sit", doing:"剛開完刀，躺在病床上，腿包得很厚。" } ],
    doc:  [ { room:"hward", x:80, pose:"write", doing:"在寫手術紀錄。" }, { room:"hward", x:80, pose:"read", doing:"在看 X 光片。" } ],
    mei:  [ { room:"galley", x:170, pose:"stand", doing:"站在巷口的檳榔攤裡，往巷子裡看。" }, { room:"galley", x:170, pose:"stand", doing:"在攤子裡包檳榔。" } ],
    zhu:  [ null, { room:"iice", x:80, pose:"stand", doing:"在刨冰機前面刨冰。" }, { room:"iice", x:80, pose:"stand", doing:"在擦桌子。" } ],
    jc:   [ null, { room:"lroom", x:110, pose:"sit", doing:"坐在客廳的塑膠椅上，手放在膝蓋上，沒有動。" }, { room:"pdesk", x:140, pose:"sit", doing:"在偵訊室，一直看著自己的手。" } ],
    ja:   [ null, { room:"lroom", x:60, pose:"sit", doing:"手銬銬在背後，坐在門邊發抖。" }, { room:"pdesk", x:120, pose:"cry", doing:"在偵訊室，一直問哥哥在哪裡。" } ],
    lai:  [ null, { room:"bdesk", x:96, pose:"sit", doing:"坐在 GPS 大螢幕前面。" }, { room:"bdesk", x:96, pose:"phone", doing:"在跟司機講無線電。" } ],
    xu:   [ { room:"gvault", x:100, pose:"kneel", doing:"蹲在走廊上，用手電筒貼著地板照。" }, { x:40, pose:"read", doing:"在實驗台前，把彈頭轉來轉去。" } ],
    wu:   [ { room:"goffice", x:80, pose:"stand", doing:"站在辦公室，盯著那台網路攝影機。" }, { x:110, pose:"stand", doing:"在實驗台前一條一條對金條的編號。" } ],
    ye:   [ null, { room:"pdesk", x:150, pose:"read", doing:"在看田小雯的卷宗。" }, { room:"pdesk", x:150, pose:"read", doing:"看著牆上的時鐘，在等你。" } ]
  };
  EP11.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });
  const L0 = id => { const L = Object.assign({}, LOOK[id]); delete L.hello; delete L.byPhase; return L; };
  const HELM = { hood:"#1a1a1e", hair:"#1a1a1e", sunglasses:true, mask:"#2a2a30" };
  EP11.looks = {
    qiuL: L0("qiu"), luL: L0("lu"), wenL: L0("wen"), yongL: { skin:"#c89a70", hair:"#2a2220", hairStyle:"short", top:"#3a4a6a", bottom:"#2a3a5a", hat:"cap", capColor:"#2a3a5a" },
    jcL: Object.assign({ skin:"#b88a60", top:"#2a2a2e", bottom:"#3a3a30", prop:"bag" }, HELM), jaL: Object.assign({ skin:"#c89a70", top:"#24324e", bottom:"#2a2a2a" }, HELM),
    meiL: L0("mei")
  };
  ["qiu","wen","jc","ja","lu","yong"].forEach(k => { EP11.looks[k + "C"] = EP11.looks[k + "L"]; });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP11.rooms = {
    gold: [
      { id:"gfront", name:"店面", scene:"g11_front", opt:(ph) => ({ broken:ph === 0, tape:ph === 0 }), details:[
        { id:"d11_bell", name:"門口的招財貓", hot:[124,40,8,10], text:"櫃台邊一隻金色的招財貓，手一直在搖。電池快沒電了，搖得很慢。" },
        { id:"d11_cal", name:"櫃台後面的日曆", hot:[176,30,8,12], text:"日曆停在 8 月 24 日，下面用紅筆寫著：「9/1 會計師」。旁邊一行小字：「佩珊 產檢」。" } ] },
      { id:"gvault", name:"保險櫃室・後走廊", scene:"g11_back", opt:(ph) => ({ mark:ph === 0, clean:ph === 2 }), details:[
        { id:"d11_radio", name:"走廊的收音機", hot:[84,4,8,4], text:"走廊的燈旁邊塞著一台小收音機，轉在老歌台。呂金福說，那是阿勇值班的時候聽的。" } ] },
      { id:"goffice", name:"二樓辦公室", scene:"g11_office", details:[
        { id:"d11_mug", name:"桌上的馬克杯", hot:[124,54,6,6], text:"一個馬克杯，印著「BULL RUN 2025」，一隻往上衝的金色公牛。杯底的咖啡已經乾成一圈。" } ] },
      { id:"galley", name:"後巷", scene:"g11_alley", outdoor:true, details:[
        { id:"d11_cat", name:"垃圾桶後面", hot:[100,80,10,10], text:"一隻橘貓縮在垃圾桶後面。阿美說，牠每天 21:03 也會來，等那個女孩子分牠一點便當。" } ] }
    ],
    hospital: [ { id:"hward", name:"澄港醫院・骨科病房", scene:"hosp11", details:[
      { id:"d11_flower", name:"床頭的花", hot:[176,50,8,8], text:"床頭一小束花，卡片上歪歪的字：「阿勇哥　快點好起來　小雯」。" } ] } ],
    police: [ { id:"pdesk", name:"澄港市刑大", scene:"pol11", details:[
      { id:"d11_books", name:"小吳的桌上", hot:[34,56,18,12], text:"小吳的桌上堆著升等考試的書，最上面那本貼滿了便利貼：「刑訴 88-1」「別再忘了」。" } ] } ],
    lab: [ { id:"lab", name:"鑑識中心", scene:"lab11", details:[
      { id:"d11_tape", name:"兩張桌子中間", hot:[100,62,10,8], text:"小吳貼的那條「國界」膠帶還在。許知夏那邊的膠帶，被人用尺壓得平平整整。" } ] } ],
    bus: [ { id:"bdesk", name:"澄港客運・調度室", scene:"g11_bus", details:[
      { id:"d11_radio2", name:"無線電", hot:[120,50,6,8], text:"無線電一直在響：「12 路 508，前方施工，請改道……」賴宏明一邊聽一邊在紙上記。" } ] } ],
    ice: [ { id:"iice", name:"阿珠冰店", scene:"g11_ice", details:[
      { id:"d11_menu", name:"牆上的價目表", hot:[110,24,20,12], text:"價目表最下面一行是手寫的：「警察、消防、外送　加料免費」。" } ] } ],
    linhome: [ { id:"lroom", name:"林家・客廳", scene:"g11_lin", opt:(ph, has) => ({ gold:has("e_arrest") }), details:[
      { id:"d11_bills", name:"桌上的信封", hot:[110,60,8,4], text:"一疊沒拆的信封，最上面一封是冷凍廠寄來的：「林建成　八月薪資　預支扣回」。" } ] } ],
    qiuhome: [ { id:"qroom", name:"邱家・書房", scene:"g11_qiu", details:[
      { id:"d11_ultra", name:"冰箱上的超音波照片", hot:[40,40,8,8], text:"一張超音波照片，用金色的磁鐵貼著。旁邊呂佩珊寫著：「24 週　是女生」。" } ] } ]
  };

  /* ---------- 監視器動畫 ---------- */
  const ANIM = {
    cctv_store: { scene:"g11_dvr", cam:"DVR CAM1 / CAM2", date:"2026-08-24", beats:[
      { t:"20:40:00", d:3.5, cap:"CAM1：邱俊傑從店面走進後面的走廊。", st:{ shutter:0 }, m:{ qiuL:[-14,98,null,-1,50,98] }, out:["qiuL"] },
      { t:"21:00:00", d:4.5, cap:"CAM1：阿勇拉下鐵捲門，小雯往走廊走。CAM2：呂金福打開保險櫃，開始清點。", st:{ shutter:[0,1] }, m:{ yongL:[78,98,"point",1,60,98], wenL:[-14,98,null,-1,40,98], luL:[140,98,"kneel",-1,160,98] }, out:["wenL"] },
      { t:"21:03:20", d:4.5, cap:"CAM2：兩個戴全罩安全帽的人衝進保險櫃室。高的把呂金福壓到地上，矮的拿槍對著他。", st:{ box:false }, m:{ jcL:[136,98,"point",-1,200,98], jaL:[162,98,"hold",-1,210,98], luL:[146,102,"lie",-1] } },
      { t:"21:03:40", d:4.5, cap:"CAM2：高的直接打開中間那一格的木盒，把金條一把一把掃進袋子。", st:{ box:true }, m:{ jcL:[120,98,"hold",-1,136,98] } },
      { t:"21:05:20", d:3.5, cap:"CAM1：阿勇往後面走廊衝過去。", st:{ box:true }, m:{ yongL:[-14,98,null,-1,78,98] }, out:["yongL"] },
      { t:"21:05:30", d:3.5, cap:"CAM2：矮的轉身跑向走廊，高的跟上去。（21:05:40，畫面外傳來一聲槍響。）", st:{ box:true }, m:{ jaL:[200,98,null,1,162,98], jcL:[204,98,null,1,120,98] }, out:["jaL","jcL"] },
      { t:"21:06:00", d:5, cap:"CAM1：兩人把小雯和一跛一跛的阿勇押進店面。高的敲破兩個展示櫃，抓走項鍊。矮的轉身時，安全帽撞到櫃角。", st:{ broken:true }, m:{ wenL:[66,98,"cry",-1,-14,98], yongL:[52,100,"kneel",-1,-14,98], jcL:[30,98,"hold",1,-14,98], jaL:[44,98,"point",1,-14,98] } },
      { t:"21:07:50", d:3.5, cap:"CAM1：兩人往後面走廊跑。", st:{ broken:true }, m:{ jcL:[-14,98,null,-1,30,98], jaL:[-14,98,null,-1,44,98] }, out:["jcL","jaL"] },
      { t:"21:08:31", d:3.5, cap:"CAM1：小雯爬到櫃台打電話。", st:{ broken:true }, m:{ wenL:[72,98,"phone",-1,66,98] } },
      { t:"21:09:40", d:4, cap:"CAM1：邱俊傑從後面走廊衝進店面。", st:{ broken:true }, m:{ qiuL:[30,98,"stand",1,-14,98] } }
    ] },
    cctv_office: { scene:"g11_office", opt:{ cam:true }, cam:"CAM-OFFICE", date:"2026-08-24", beats:[
      { t:"20:50:05", d:4, cap:"邱俊傑坐下來，打開筆電，翻開帳本。他沒有戴耳機。", m:{ qiuL:[100,98,"sit",-1,-20,98] } },
      { t:"21:02:10", d:5.5, cap:"窗外的公車站停了一台公車，車身是「澄港海產節」的紅螃蟹廣告。", st:{ bus:[-66,0,0,0,50] }, m:{ qiuL:[100,98,"sit",-1] } },
      { t:"21:05:40", d:4, cap:"他突然轉頭看向門口，跳起來，躲到桌子底下。", m:{ qiuL:[92,100,"kneel",-1,100,98] } },
      { t:"21:07:30", d:3, cap:"（桌子底下露出半個肩膀，一動也不動。）", m:{ qiuL:[92,100,"kneel",-1] } },
      { t:"21:09:10", d:3.5, cap:"他爬出來，往門口的方向走出畫面。", m:{ qiuL:[-20,98,null,-1,92,100] }, out:["qiuL"] },
      { t:"21:22:00", d:4.5, cap:"窗外又一台公車經過，白色的，沒有廣告。辦公室沒有人。", st:{ bus:[-66,50], plain:true } }
    ] }
  };
  Object.values(ANIM).forEach(A => { if (A.beats.some(b => b.st)) A.opt = Object.assign({}, A.opt || {}, { seq:A.beats.map(b => b.st || {}), ds:A.beats.map(b => b.d) }); });
  [...EP11.cctv, ...EP11.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });
  const PS = [["g11_back",{ phase:0, mark:true }],["pol11",{}],["pol11",{}]];
  EP11.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 結案 ---------- */
  const F2 = 48, F1 = 98;
  const RB = [
    { t:"20:40:00", d:5, cap:"8/24 20:40，邱俊傑上二樓。辦公室的攝影機，兩天前就被他調快了 10 分鐘——畫面上寫的是 20:50。", st:{}, m:{ qiuC:[84,F2,"sit",1,130,F2] } },
    { t:"20:52:10", d:5, cap:"20:52，517 號公車停在窗外。攝影機把它錄成 21:02。", st:{ bus:[-66,0,0,30] }, m:{ qiuC:[84,F2,"sit",1] } },
    { t:"20:55:40", d:4.5, cap:"20:55，他對著鏡頭，假裝聽到樓下一聲巨響，躲到桌子底下——錄影上，是 21:05:40。", st:{}, m:{ qiuC:[80,F2 + 2,"kneel",-1,84,F2] } },
    { t:"20:59:10", d:5, cap:"20:59，他從二樓後門出去，走鐵梯下到後巷。", st:{}, m:{ qiuC:[14,F1,"stand",-1,80,F2,[[40,F2],[30,F2],[10,62],[28,74],[10,86]]] } },
    { t:"21:01:00", d:5, cap:"21:01，他在巷口一邊抽菸，一邊用那支舊手機打給林建安：「她三分鐘後出來，保險櫃開著。」十二秒。", st:{}, m:{ qiuC:[14,F1,"phone",1] } },
    { t:"21:03:00", d:5, cap:"21:03，小雯提著垃圾打開後門，被推了回去。", st:{ backOpen:true }, m:{ wenC:[60,F1,"cry",1,44,F1], jcC:[48,F1,"point",1,20,F1], jaC:[40,F1,"hold",1,10,F1], qiuC:[14,F1,"smoke",1] } },
    { t:"21:03:30", d:5, cap:"他們直接走進保險櫃室——「金條在哪一格」。22 條。另外 8 條，早就被他拿去當掉了。", st:{}, m:{ jcC:[130,F1,"hold",1,48,F1], jaC:[110,F1,"point",1,40,F1], luC:[142,F1 + 2,"lie",-1] } },
    { t:"21:05:40", d:4.5, cap:"阿勇衝過來。林建安的手一直在抖——", st:{ flash:true }, m:{ yongC:[96,F1 + 2,"lie",-1,170,F1], jaC:[86,F1,"point",1,110,F1] } },
    { t:"21:07:50", d:4.5, cap:"21:07，兩兄弟從後門跑出去，騎上那台沒有車牌的白色機車。", st:{ backOpen:true, broken:true }, m:{ jcC:[-20,F1,null,-1,130,F1], jaC:[-30,F1,null,-1,86,F1] }, out:["jcC","jaC"] },
    { t:"21:08:40", d:5, cap:"21:08，機車一衝出去，邱俊傑就往巷子裡走，從後門進來，在樓梯口站了一下，然後衝進店面。", st:{ backOpen:true, broken:true }, m:{ qiuC:[170,F1,"stand",1,14,F1,[[40,F1],[100,F1],[106,F1]]], yongC:[96,F1 + 2,"lie",-1] } }
  ];
  EP11.court = {
    title: "金福銀樓・店面・8 月 26 日中午", scene: "g11_front",
    who: ph => ["qiu","lu","shan","wen","jc","ja"],
    open: ph => "12:30，金福銀樓的鐵捲門拉起一半。葉晴站在門口看了一下錶。田小雯是被員警帶過來的，眼睛腫腫的。呂佩珊扶著爸爸坐下，邱俊傑站在櫃台後面，手上那隻金戒指，一直在轉。",
    kindLine: {
      inside: "這不是碰運氣的搶案。有人告訴他們：幾點、哪一扇門、哪一格。",
      outside: "兩個搶匪自己在外面盯了幾個禮拜，看準了倒垃圾的時間下手。",
      fake: "這場搶案是店家自己安排的，為了那一大筆保險金。"
    },
    murmur: [ "（呂金福看著空掉的展示櫃。）", "（田小雯抓著自己的包包。）", "（邱俊傑把戒指轉了一圈，又轉回來。）" ],
    confess: {
      qiu: [ "第一條只是想週轉一下。幣價一回來，我就贖回來。", "然後是第二條、第三條……會計師的信寄來那天，我在廁所吐了。", "我跟他們說好不碰人的。我跟他們說好的。", "……公車。我調了攝影機，調了不在場證明，算好了每一分鐘。我沒想到窗外會有一台公車。" ],
      jc: [ "阿安欠的錢，我還了三年，越還越多。那個人說，一次就好，店裡的人會幫我們開門。", "我只想讓阿安以後不要再過這種日子。……結果是我讓他開了槍。" ],
      ja: [ "我買那把槍的時候，那個戴帽子的人說：「放心，這種槍，查不到。」", "……阿勇伯，對不起。" ]
    },
    cornered: { qiu: "……jj.chiu。是我。我連改時間，都用自己的帳號。" },
    deny: {
      lu: "我自己搶自己？我趴在地上，以為我會死！",
      shan: "我在上課……我什麼都不知道。",
      wen: "我只是去倒垃圾！學費的收據我都給你們了！",
      jc: "……",
      ja: "我只是……那個保全衝過來……"
    },
    replayText: "8 月 22 日深夜 23:41，港景大樓 18 樓。太太睡了。他打開手機裡的攝影機 App，關掉「自動校時」，把時間往前撥了 10 分鐘——",
    replay: { scene:"g11_cut", opt:{ seq:RB.map(b => b.st), ds:RB.map(b => b.d) }, clean:true, cam:"案發經過重現", date:"2026-08-24", beats:RB },
    endGood: "13:00，葉晴沒有聲請羈押田小雯。她走出刑大的時候，媽媽在門口等她，手上提著一袋她最愛吃的蔥油餅。\n9 月 1 日，會計師來盤點。木盒裡的 22 條金條回來了，另外 8 條，呂佩珊拿自己的嫁妝去當舖贖了回來。\n呂金福把邱俊傑的金戒指收進抽屜。他說，以後點金條，他要自己點。",
    endBad: "13:00，葉晴聲請羈押田小雯。法官准了。\n9 月 1 日，會計師在報告上寫：「庫存短少 30 條，因搶案滅失，由保險理賠。」\n邱俊傑在醫院陪太太產檢。他手上的戒指，擦得很亮。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[11]){
    if (ARC_INTER[11].after) EP11.after = ARC_INTER[11].after;
    if (ARC_INTER[11].before) EP11.before = Object.assign({}, ARC_INTER[11].before, { scene:"police" });
  }

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP11.outScenes = ["g11_alley"];
  EP11.fac = { gold:["#7a2a24","#f2c94c"], hospital:["#e6ecea","#2f7a6a"], police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], bus:["#d8dcd4","#2a6a5a"],
    ice:["#e8f0e8","#e86a8a"], linhome:["#b8ac94","#5a4a3a"], qiuhome:["#e8ecf0","#3a4a5a"] };
  EP11.setting = { gold:"city", hospital:"city", police:"city", lab:"city", bus:"city", ice:"town", linhome:"town", qiuhome:"city" };
  const SKY11 = [ ["#0b0f1c","#27324a","#18202a","#1d2630",0,0], ["#7ab0e0","#e0eef4","#4a6070","#56707a",0,0], ["#8ab8e0","#f0e8d0","#4a6070","#56707a",0,0] ];
  EP11.worldSky = ph => SKY11[Math.min(ph || 0, SKY11.length - 1)];
  EP11.roomDesc = {
    gfront:"金福銀樓的店面。紅色的牆，滿室金光——只是現在兩個展示櫃破了。", gvault:"保險櫃室和後走廊。樓梯就在後門旁邊。", goffice:"二樓辦公室。一張辦公桌、一台網路攝影機，窗外就是公車站。", galley:"銀樓後面的窄巷。巷口有一個檳榔攤，路燈壞了。",
    hward:"澄港醫院的骨科病房。", pdesk:"澄港市刑大。你的位子在窗邊。", lab:"鑑識中心。許知夏的桌子一條線都沒歪。",
    bdesk:"澄港客運的調度室。一面大螢幕上，每一台公車都是一個會動的小點。", iice:"南澳漁港邊的老冰店，冰機轟轟地響。", lroom:"林家兄弟的老房子。牆上有水漬，門外被潑了漆。", qroom:"港景大樓 18 樓，邱家的書房。窗外看得到整個港。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police" };
  const FOR = { skin:"#e8c09a", hair:"#1a1410", hairStyle:"short", top:"#f4f6f6", bottom:"#f4f6f6", mask:"#9ac0e0", hood:"#f4f6f6" };
  EP11.world = {};
  EP11.locations.forEach(l => { EP11.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP11.world.gold, {
    extras: [
      { id:"cop11", name:"派出所員警", phase:0, until:0, x:RX(0) + 30, L:COP, pose:"stand", facing:1, lines:[
        "我們 21:14 到的。鐵捲門拉下來，我們是從後巷進來的。", "巷口那個檳榔攤的阿姨說她有看到機車，我請她先不要收攤。" ] },
      { id:"for11", name:"鑑識員", phase:0, until:0, x:RX(1) + 60, L:FOR, pose:"cam", facing:-1, lines:[
        "1 號是彈殼，2 號是那個小鑰匙圈，3 號是保全倒下的地方。", "保險櫃上的指紋太多了，全店的人都摸過。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { car:[-60, 8, 2.4, "#e9e4da"], hide:true },
      { wait:0.5, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長，金福銀樓。21:03 兩個戴全罩安全帽的人從後門衝進來，搶走保險櫃裡的金條，七分鐘就走了。", "小吳"),
      say("wu", "保全阿勇想攔，大腿中了一槍，在澄港醫院開刀。老闆、經理、店員都在店裡，沒有人受傷。", "小吳"),
      say("wu", "經理說他在二樓辦公室，聽到槍聲躲到桌子底下——他說辦公室有攝影機，可以證明。", "小吳"),
      say("you", "後門是怎麼開的？保險櫃為什麼開著？先看看。", "你"),
      say("wu", "許知夏在後面的走廊。她說……地上的東西一樣都不要踩。", "小吳"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳")
    ]
  });
  EP11.mapPos = { gold:[110,60,"u"], hospital:[150,40,"u"], police:[150,90,"r"], lab:[176,78,"u"], bus:[70,40,"l"], ice:[54,104,"d"], linhome:[30,96,"l"], qiuhome:[190,50,"r"] };
  EP11.mapRoads = [["gold","hospital"],["gold","police"],["police","lab"],["gold","bus"],["gold","ice"],["ice","linhome"],["hospital","qiuhome"],["police","qiuhome"]];
  EP11.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    const blocks = (x0, y0, x1, y1, c, c2) => { for (let x = x0; x < x1; x += 8) for (let y = y0; y < y1; y += 7) { R(x, y, 6, 5, c); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, c2); } };
    blocks(60, 20, 230, 100, "#c8c0b0", "#b0a898");
    R(0, 112, 240, 23, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 112 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");   // 港
    for (let k = 0; k < 4; k++) R(20 + k * 12, 116, 8, 3, ["#e9e4da", "#c23a2a", "#3a6ab8", "#e8c040"][k]);   // 漁船
    R(104, 54, 12, 8, "#7a2a24"); R(106, 56, 8, 4, "#f2c94c");   // 金福銀樓
    R(60, 66, 120, 2, "#6a6a6a");   // 中正路
  };
})();
