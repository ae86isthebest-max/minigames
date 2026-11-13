/* =========================================================
   第 23 集：像素畫、人物造型、結案、走動畫面、地圖、開場
   ========================================================= */
EP23.art = true;
(() => {
  const PR = PX.prim, { R, P, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i] = beatAt(o.t || 0, o.ds); return (o.seq || [])[i] || {}; };
  const glow = (x, y, r, rgb, a) => { for (let k = r; k > 0; k -= 2){ const al = Math.round(a * (1 - k / r) * 255).toString(16).padStart(2, "0"); R(x - k, y - k * 0.7, k * 2, k * 1.4, rgb + al); } };
  const tiles = (y, c, l) => { R(0, y, W, H - y, c); for (let x = 0; x < W; x += 12) R(x, y, 1, H - y, l); for (let yy = y; yy < H; yy += 6) R(0, yy, W, 1, l); };
  // 舊醫院的牆：上半淡綠、下半深綠的腰牆，到處是水漬
  const hospWall = (y, dim) => { R(0, 0, W, y, dim ? "#5a6a60" : "#a8bca8"); R(0, y - 30, W, 30, dim ? "#3a4a40" : "#6a8a72"); R(0, y - 31, W, 1, dim ? "#2a3a30" : "#4a6a52");
    for (let k = 0; k < 6; k++) R((k * 37) % 180, 4 + (k * 11) % 20, 8 + k % 3 * 4, 14, dim ? "#4a5a5022" : "#8a9a8a44"); };

  /* ---------- 一樓大廳：舊掛號櫃台改成登記處、樓層圖、輪椅、門口的警衛亭 ---------- */
  SC.c23_lobby = (o) => { o = Object.assign({}, o, stOf(o));
    hospWall(84, true);
    R(4, 24, 46, 60, "#3a4a52"); R(6, 26, 42, 30, "#5a6a72"); R(8, 30, 18, 14, o.tv ? "#3a6a9a" : "#1a2028"); if (o.tv) glow(17, 37, 14, "#8ac8f8", 0.25);   // 警衛亭
    R(30, 48, 20, 14, "#5a4a3a"); R(32, 50, 16, 2, "#3a2a1a"); R(39, 51, 3, 1, "#c8a870");   // 抽屜
    R(60, 54, 70, 30, "#6a5a48"); R(60, 54, 70, 2, "#8a7a68"); txt("掛號", 86, 50, "#8a9a8a", "6px sans-serif");
    R(88, 56, 18, 6, "#e8e0c8"); R(90, 57, 14, 1, "#6a6a7a"); R(98, 52, 1, 4, "#2a2a2a");   // 登記簿和筆
    R(140, 20, 30, 26, "#d8d0b8"); R(142, 22, 26, 22, "#c8c0a8"); for (let k = 0; k < 4; k++) R(144, 25 + k * 5, 20, 1, k % 2 ? "#c83a2a" : "#3a3a3a");   // 樓層圖
    R(16, 70, 22, 16, "#7a7a7a"); for (let dy = -6; dy <= 6; dy++){ const w = Math.round(Math.sqrt(36 - dy * dy)); R(22 - w, 80 + dy, 1, 1, "#4a4a4a"); R(22 + w, 80 + dy, 1, 1, "#4a4a4a"); } R(18, 66, 4, 8, "#5a5a5a");   // 輪椅
    R(176, 40, 12, 44, "#2a2a2a"); R(178, 42, 8, 40, "#1a1a1a"); txt("B1↓", 176, 38, "#c8c8c0", "5px sans-serif");   // 往地下室的樓梯口
    R(80, 2, 40, 3, "#c8d8c0"); glow(100, 10, 18, "#e8f0d8", 0.18);
    tiles(84, "#5a6058", "#4a5048");
  };

  /* ---------- B1 檔案室：左邊鐵門、索引櫃、一排排紙箱架、病歷櫃、驗收卡、保險絲盒、最裡面往太平間的小門 ---------- */
  SC.c23_b1 = (o) => { o = Object.assign({}, o, stOf(o)); const dark = !!o.dark;
    R(0, 0, W, 86, dark ? "#2a302c" : "#5a645c"); for (let k = 0; k < 5; k++) R(0, 8 + k * 16, W, 1, dark ? "#222824" : "#4a544c");
    R(2, 26, 22, 60, "#4a4e52"); R(4, 28, 18, 56, "#5a5e62"); R(18, 54, 3, 4, "#2a2a2a"); R(10, 30, 4, 3, o.locked ? "#e83a2a" : "#3ae83a");   // 鐵門
    R(20, 40, 26, 40, "#7a5a3a"); for (let j = 0; j < 6; j++) for (let i = 0; i < 3; i++){ R(22 + i * 8, 42 + j * 6, 7, 5, "#8a6a4a"); P(25 + i * 8, 44 + j * 6, "#e8e0c8"); }   // 索引櫃
    for (let k = 0; k < 2; k++){ const x = 56 + k * 56; R(x, 18, 2, 68, "#6a6a6a"); R(x + 50, 18, 2, 68, "#6a6a6a"); for (let s = 0; s < 3; s++){ R(x, 30 + s * 18, 52, 2, "#7a7a7a"); for (let b = 0; b < 4; b++) if (!(k === 1 && s === 2 && b === 0)) R(x + 2 + b * 12, 20 + s * 18, 11, 10, b % 2 ? "#a8906a" : "#b89a72"); } }
    R(120, 60, 16, 10, o.boxOpen ? "#8a7050" : "#b89a72"); R(121, 61, 14, 1, "#e8e0c8"); txt("17", 124, 68, "#3a2a1a", "5px monospace");   // B1-17
    R(60, 64, 22, 20, "#5a6a5a"); for (let k = 0; k < 3; k++) R(62, 66 + k * 6, 18, 5, "#6a7a6a");   // 病歷櫃（在架子前面）
    R(150, 22, 16, 10, "#e8e8e0"); R(151, 23, 14, 2, "#3a6a8a"); R(151, 27, 10, 1, "#6a6a7a");   // 驗收卡
    R(170, 44, 14, 14, "#7a7e78"); R(172, 46, 10, 10, "#5a5e58"); P(176, 50, "#2a2a2a");   // 保險絲盒
    R(150, 46, 18, 40, "#4a4e4a"); R(152, 48, 14, 36, "#5a5e5a"); txt("太平", 152, 44, "#8a8a80", "4px sans-serif");   // 往太平間的小門
    R(160, 62, 10, 12, "#2a2a2e"); R(161, 63, 8, 3, o.keypadLit === false ? "#1a2a1a" : "#3ae83a"); for (let k = 0; k < 6; k++) P(162 + (k % 3) * 3, 68 + Math.floor(k / 3) * 3, "#c8c8c0");
    R(40, 2, 30, 3, dark ? "#3a4a3a" : "#d8e8d0"); R(120, 2, 30, 3, dark ? "#3a4a3a" : "#d8e8d0");
    R(176, 8, 14, 6, "#3a3a3a"); for (let k = 0; k < 4; k++) R(177 + k * 3, 9, 2, 4, "#1a1a1a");   // 通風口
    tiles(86, dark ? "#2a2e2a" : "#5a5e58", dark ? "#222622" : "#4a4e48");
    if (dark) R(0, 0, W, H, "#00000044");
  };

  /* ---------- 舊太平間：整面冷藏櫃（第 4 格背板會晃）、不鏽鋼台、排水孔 ---------- */
  SC.c23_morgue = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#3a4440"); for (let y = 6; y < 86; y += 8) for (let x = (y / 8 % 2) * 6; x < W; x += 12) R(x, y, 11, 7, "#424c48");
    R(98, 22, 64, 52, "#8a9094"); for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++){ const x = 100 + i * 20, y = 24 + j * 16; R(x, y, 18, 14, "#a8aeb2"); R(x + 7, y + 6, 4, 2, "#5a5e62"); txt(String(j * 3 + i + 1), x + 2, y + 6, "#5a5e62", "4px monospace"); }
    if (o.open4){ R(100, 40, 18, 14, "#0a0a0a"); }
    R(30, 62, 50, 6, "#a8aeb2"); R(32, 68, 3, 16, "#7a7e82"); R(74, 68, 3, 16, "#7a7e82"); R(30, 62, 50, 1, "#c8ccd0");   // 不鏽鋼台
    R(52, 92, 6, 2, "#1a1a1a");   // 排水孔
    R(60, 2, 40, 3, "#5a6a5a");
    tiles(86, "#4a524e", "#3a423e");
    R(0, 0, W, H, "#00000033");
  };

  /* ---------- 電梯井：直直往上的井、鋼索、維修梯（下段有鐵框和掛鎖）、半路的通風口 ---------- */
  SC.c23_shaft = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, H, "#1a1e1c"); R(40, 0, 112, H, "#2a2e2c"); for (let y = 0; y < H; y += 10) R(40, y, 112, 1, "#222624");
    R(92, 0, 2, 86, "#6a5a4a"); R(102, 0, 2, 86, "#6a5a4a"); for (let y = 2; y < 86; y += 6) R(92, y, 12, 1, "#7a6a5a");   // 梯子
    if (!o.unlocked){ R(88, 50, 20, 36, "#5a5a5a44"); R(88, 50, 20, 2, "#5a5a5a"); R(88, 84, 20, 2, "#5a5a5a"); R(88, 50, 2, 36, "#5a5a5a"); R(106, 50, 2, 36, "#5a5a5a"); R(96, 66, 5, 6, "#8a6a3a"); }
    R(108, 14, 16, 12, "#3a3e3c"); for (let k = 0; k < 4; k++) R(110 + k * 4, 16, 2, 8, "#1a1a1a");   // 通風口
    R(140, 0, 2, H, "#5a5a5a"); R(146, 0, 2, H, "#5a5a5a"); R(138, 0, 14, 6, "#4a4a4a");   // 鋼索
    R(40, 86, 112, 22, "#2a2a28"); for (let k = 0; k < 8; k++) R(48 + k * 13, 90 + (k % 3) * 4, 6, 2, "#3a3a38");
    R(0, 70, 40, 16, "#0a0a0a"); R(0, 70, 40, 1, "#4a4a4a");   // 冷藏櫃後面的洞口
  };

  /* ---------- 通風管：一條很窄的方管，三條岔路，盡頭的鐵網（外面有光） ---------- */
  SC.c23_vent = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, H, "#0e100f"); R(0, 30, W, 40, "#2a2c2a"); R(0, 30, W, 2, "#3a3c3a"); R(0, 68, W, 2, "#1a1c1a"); for (let x = 0; x < W; x += 24) R(x, 30, 1, 40, "#1e201e");
    R(58, 18, 24, 14, "#2a2c2a"); R(58, 18, 24, 1, "#3a3c3a"); R(61, 20, 18, 11, "#060706"); R(61, 29, 18, 1, "#4a3a2a");   // 往上的那條岔路（細節「左邊的岔路」）
    // 三條岔路（o23_vent 的範圍 20–80）：管壁上三個黑洞，邊上一圈鏽
    [[24, 42], [44, 44], [64, 42]].forEach(([x, y]) => { R(x - 1, y - 1, 14, 16, "#4a3a2a"); R(x, y, 12, 14, "#060706"); R(x, y, 12, 2, "#1a1a18"); });
    R(30, 60, 6, 2, "#5a4630"); R(58, 38, 4, 2, "#5a4630");   // 鏽斑
    // 管壁（o23_arrows 的範圍 90–130）：灰塵上幾道看不清的刮痕、一排螺絲
    for (let k = 0; k < 6; k++) R(94 + k * 6, 44 + (k % 2), 3, 1, "#3c3e3a");
    R(96, 54, 26, 1, "#363834"); for (let x = 92; x < 132; x += 8) P(x, 34, "#4a4c48");
    if (o.uv){ for (let k = 0; k < 5; k++){ const x = 92 + k * 9; R(x, 48, 5, 1, "#6aff8a"); P(x + 4, 47, "#6aff8a"); P(x + 4, 49, "#6aff8a"); } glow(110, 48, 26, "#8a6aff", 0.18); }
    R(152, 30, 24, 20, "#5a5a5a"); for (let k = 0; k < 6; k++) R(154 + k * 4, 32, 1, 16, "#2a2a2a"); glow(164, 40, 16, "#ffe8a0", 0.3);
    R(0, 70, W, 38, "#0a0a0a");
  };

  /* ---------- 一樓控制室（機房）：監視器螢幕、門禁面板和紅色大按鈕、天花板的通風口 ---------- */
  SC.c23_control = (o) => { o = Object.assign({}, o, stOf(o));
    hospWall(84, !!o.dark);
    R(24, 20, 40, 26, "#1a1a1e"); R(26, 22, 17, 22, "#2a4a5a"); R(45, 22, 17, 22, "#2a4a3a"); R(30, 30, 6, 10, "#4a6a7a"); R(50, 34, 3, 6, "#3a3a2a");   // 兩格監視器
    R(96, 36, 48, 40, "#5a5e62"); R(100, 40, 40, 20, "#1a2a1a"); for (let k = 0; k < 5; k++) R(102, 42 + k * 3, 20 + (k * 7) % 14, 1, "#6ae86a");   // 面板螢幕
    R(104, 62, 30, 10, "#4a4e52"); R(108, 63, 10, 8, o.lockOn === false ? "#6a2a2a" : "#e83a2a"); R(122, 64, 8, 6, "#3a8a3a"); R(124, 60, 6, 2, "#e8e0c8");   // 紅色大按鈕
    R(149, 1, 26, 10, "#3a3e3a"); R(150, 2, 24, 8, o.ventOpen ? "#0a0a0a" : "#4a4e4a"); if (!o.ventOpen) for (let k = 0; k < 5; k++) R(152 + k * 4, 3, 1, 6, "#2a2a2a");   // 天花板的通風口
    if (o.ventOpen){ R(176, 2, 3, 12, "#5a5a5a"); for (let k = 0; k < 4; k++) R(177, 4 + k * 3, 1, 1, "#2a2a2a"); }   // 被推開、斜掛在旁邊的鐵網
    R(10, 56, 70, 4, "#6a5a48"); R(14, 60, 3, 24, "#5a4a38"); R(74, 60, 3, 24, "#5a4a38");
    R(160, 30, 24, 54, "#4a4e52"); R(162, 32, 20, 50, "#5a5e62"); R(178, 56, 2, 4, "#c8c8c0");   // 門
    tiles(84, "#5a6058", "#4a5048");
    if (o.dark) R(0, 0, W, H, "#00000033");
  };

  /* ---------- 側門外：舊醫院的外牆、側門、後門口的保麗龍箱、泥地上的胎痕、巷口 ---------- */
  SC.c23_gate = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 30, "#0c1022");
    R(0, 10, 130, 76, "#6a6a5e"); for (let y = 16; y < 86; y += 6) for (let x = (y / 6 % 2) * 6; x < 130; x += 12) R(x, y, 11, 1, "#5e5e52");
    for (let k = 0; k < 4; k++){ R(10 + k * 30, 20, 16, 14, "#1a2028"); R(17 + k * 30, 20, 1, 14, "#3a3a3a"); }
    R(20, 20, 0, 0, "#000"); txt("澄港醫院", 60, 9, "#5a5a50", "6px sans-serif");
    R(60, 44, 22, 42, "#4a4e52"); R(62, 46, 18, 40, "#5a5e62"); R(76, 64, 2, 4, "#c8c8c0"); R(66, 40, 10, 3, "#3a3a3a"); R(68, 41, 6, 1, o.camLit === false ? "#3a3a3a" : "#e83a2a");   // 側門和監視器
    R(30, 74, 22, 14, "#f4f4f0"); R(30, 74, 22, 2, "#e0e0dc"); txt("阿珠冰", 32, 84, "#e86a8a", "4px sans-serif");   // 保麗龍箱
    R(130, 30, 62, 56, "#1a1e28"); R(150, 40, 3, 46, "#4a4e54"); R(144, 38, 12, 3, "#4a4e54"); R(144, 41, 6, 2, "#ffe8a0"); glow(147, 56, 26, "#ffe8a0", 0.16);   // 巷口和路燈
    R(0, 86, W, 22, "#4a3a2a"); for (let k = 0; k < 12; k++) R((k * 31) % 186, 90 + (k * 7) % 14, 6, 1, "#3a2a1a");
    if (!o.noTracks){ for (let x = 70; x < 186; x += 3){ R(x, 92 + Math.round(Math.sin(x / 30) * 1), 2, 1, "#2a1e14"); R(x, 95 + Math.round(Math.sin(x / 30) * 1), 2, 1, (x % 9 < 3) ? "#2a1e14" : "#3a2c1e"); } }
    if (o.scooter){   // 重現用：停在巷口的送貨機車（跟冰店門口那台一樣，後座大鐵架）
      R(170, 82, 22, 3, "#c8ccd0"); R(168, 72, 7, 11, "#c8ccd0"); R(172, 68, 2, 5, "#3a3a3a"); R(182, 74, 12, 7, "#5a5a5a"); R(180, 72, 14, 2, "#5a5a5a");
      for (const cx of [171, 190]) for (let dy = -4; dy <= 4; dy++){ const w = Math.round(Math.sqrt(16 - dy * dy)); R(cx - w, 88 + dy, w * 2, 1, "#1a1a1a"); }
    }
    if (o.tape) PR.OBJ.tape(56, 80, 40);
  };

  /* ---------- 阿珠冰店（晚上，拉下一半的鐵門） ---------- */
  SC.c23_ice = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#e8f0e8"); R(0, 0, W, 10, "#e86a8a"); txt("阿珠冰店", 74, 8, "#ffffff", "7px sans-serif");
    R(20, 24, 30, 20, "#f4f4f0"); for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) R(22 + i * 7, 26 + j * 6, 6, 5, (i + j) % 3 ? "#f4e8c8" : "#e86a8a");   // 集點卡
    R(60, 40, 40, 44, "#c8ccd0"); R(62, 42, 36, 16, "#a8d8f0"); for (let k = 0; k < 4; k++) R(64 + k * 9, 44, 7, 12, "#e8f4f8");   // 冰櫃
    R(104, 56, 30, 28, "#b8bcc0"); R(104, 56, 30, 2, "#d8dce0"); R(106, 60, 26, 1, "#9a9ea2");   // 刨冰機的台子
    R(112, 34, 14, 4, "#8a8e92"); R(117, 30, 4, 4, "#5a5e62"); R(127, 32, 6, 2, "#3a3a3a"); R(132, 30, 2, 4, "#e86a8a");   // 機頭和手把
    R(113, 38, 2, 12, "#8a8e92"); R(123, 38, 2, 12, "#8a8e92"); R(115, 40, 8, 6, "#d8f0f8"); R(116, 41, 6, 2, "#ffffff");   // 夾著的冰塊
    R(114, 50, 10, 2, "#e86a8a"); R(115, 52, 8, 3, "#f4f4f0"); R(116, 51, 6, 2, "#7a3a2a"); R(115, 50, 8, 1, "#e8f0f4");   // 一碗紅豆，蓋著保鮮膜
    R(136, 70, 10, 14, "#3a6a8a"); R(136, 70, 10, 2, "#5a8aa8"); R(138, 66, 6, 4, "#e8e4da");   // 腳邊的冰桶
    R(0, 10, W, 12, "#6a6e70"); for (let y = 12; y < 22; y += 2) R(0, y, W, 1, "#565a5c"); R(0, 21, W, 1, "#3a3e40");   // 拉下一半的鐵門
    // 門口的送貨機車：後座大鐵架
    R(152, 74, 30, 4, "#c8ccd0"); R(150, 64, 8, 12, "#c8ccd0"); R(156, 60, 2, 6, "#3a3a3a"); R(170, 66, 14, 8, "#5a5a5a"); R(168, 64, 18, 2, "#5a5a5a");
    for (const cx of [154, 180]) for (let dy = -5; dy <= 5; dy++){ const w = Math.round(Math.sqrt(25 - dy * dy)); R(cx - w, 82 + dy, w * 2, 1, "#1a1a1a"); } R(152, 82, 4, 1, "#5a5a5a"); R(178, 82, 4, 1, "#3a3a3a");
    R(0, 86, W, 22, "#5a5e62"); for (let x = 0; x < W; x += 16) R(x, 86, 1, 22, "#4a4e52");
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    hat:  { skin:"#c89a70", hair:"#2a2220", hairStyle:"short", top:"#3a3a30", coat:"#4a4a3a", bottom:"#2a2a2a", hat:"cap", capColor:"#3a3a2a", hello:"" },
    qiu:  { age:"old", skin:"#d8a880", hair:"#9a9a94", hairStyle:"balding", top:"#5a6a8a", bottom:"#3a3a40", glasses:true, mood:"worried", hello:"我在這裡十二年，第一次出這種事。" },
    liu:  { skin:"#f0d0b4", hair:"#2a2220", hairStyle:"pony", top:"#e8e4d8", coat:"#5a6a7a", bottom:"#3a3a44", glasses:true, hello:"你們沒事吧……" },
    zhu:  { age:"old", skin:"#d8a880", hair:"#8a8a8a", hairStyle:"bun", top:"#f4f0f4", bottom:"#3a4a6a", apron:"#e86a8a", mood:"worried", hello:"這麼晚了，警察先生……" },
    xu:   { hello:"不要慌。" },
    wu:   { hello:"一、二、三……" },
    kui:  { hello:"前輩！" }
  };
  ["xu","wu","kui"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.kui.top) Object.assign(LOOK.kui, { skin:"#f0d0b4", hair:"#5a3a2a", hairStyle:"bob", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050" });
  if (!LOOK.xu.top) Object.assign(LOOK.xu, { skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" });
  if (!LOOK.wu.top) Object.assign(LOOK.wu, { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050", glasses:true });
  const DAILY = {
    qiu:  [ { room:"lobby", x:24, pose:"sit", doing:"坐在警衛亭裡，電視開得很大聲。" }, null, { room:"lobby2", x:60, pose:"stand", doing:"站在警衛亭外面，一直搓手。" } ],
    liu:  [ { room:"lobby", x:110, pose:"read", doing:"站在登記處，翻著你們的調閱單。" }, null, { room:"lobby2", x:120, pose:"phone", doing:"剛從捷運站跑回來，頭髮都是汗。" } ],
    zhu:  [ null, null, { room:"iice", x:110, pose:"stand", doing:"在冰店裡擦刨冰機，鐵門拉下一半。" } ],
    xu:   [ { room:"b1", x:100, pose:"read", doing:"拿著手電筒，一個箱號一個箱號照。" }, { room:"b1", x:90, pose:"stand", doing:"看著手錶，呼吸放得很慢。" }, { room:"control", x:150, pose:"stand", doing:"站在控制室門口，不讓任何人進來。" } ],
    wu:   [ { room:"b1", x:40, pose:"reach", doing:"在索引櫃前面一格一格拉抽屜。" }, { room:"b1", x:130, pose:"sit", doing:"坐在地上數數字，額頭都是汗。" }, { room:"gate", x:100, pose:"stand", doing:"手上纏著繃帶，站在側門外面吹風。" } ],
    kui:  [ null, null, { room:"gate", x:120, pose:"kneel", doing:"蹲在泥地上翻胎痕的模。" } ]
  };
  EP23.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP23.rooms = {
    archive: [
      { id:"lobby", name:"一樓大廳", scene:"c23_lobby", until:0, opt:{ tv:true }, details:[
        { id:"d23_stairs", name:"往地下室的樓梯", hot:[176,40,12,44], text:"往下的樓梯，扶手冰冰的。牆上還留著醫院時代的指標：「太平間　↓」。" },
        { id:"d23_light", name:"天花板的燈", hot:[80,2,40,6], text:"一排日光燈只亮了一支，一閃一閃的。" } ] },
      { id:"lobby2", name:"一樓大廳", scene:"c23_lobby", phase:2, opt:{ tv:true }, details:[
        { id:"d23_stairs2", name:"往地下室的樓梯", hot:[176,40,12,44], text:"樓梯口拉起了封鎖線。下面的燈全部打開了，照得像白天。" } ] },
      { id:"b1", name:"B1 檔案室", scene:"c23_b1", opt:(ph) => ({ dark:ph === 1, locked:ph === 1, boxOpen:true }), details:[
        { id:"d23_vent", name:"牆上的通風口", hot:[176,8,14,6], text:"通風口的葉片不轉了。把手放在前面，一點風都沒有。" },
        { id:"d23_shelf", name:"紙箱架", hot:[56,18,52,30], text:"一箱一箱的卷宗，標籤上的年份從 1990 到 2015。灰很厚，只有少數幾箱有手印。" } ] },
      { id:"morgue23", name:"舊太平間", scene:"c23_morgue", phase:1, until:1, requires:["o23_keypad"], details:[
        { id:"d23_drain", name:"地上的排水孔", hot:[48,90,14,6], text:"地上的排水孔，鐵蓋生鏽了。聞得到很淡很淡的消毒水味，不知道是幾年前的。" } ] },
      { id:"shaft", name:"電梯井", scene:"c23_shaft", phase:1, until:1, requires:["o23_fridge"], details:[
        { id:"d23_hole", name:"冷藏櫃後面的洞口", hot:[0,68,40,18], text:"你們剛剛從這個洞爬出來。洞口的邊緣，有一道很新的刮痕——不是你們刮的。" } ] },
      { id:"vent", name:"通風管", scene:"c23_vent", phase:1, until:1, requires:["o23_ladder"], details:[
        { id:"d23_fork", name:"左邊的岔路", hot:[60,20,20,10], text:"左邊那條岔路越往裡面越窄。風是從那邊吸進去的——不是出口。" } ] },
      { id:"control", name:"一樓控制室", scene:"c23_control", phase:2, opt:(ph, has) => ({ ventOpen:has("o23_grille") }), details:[
        { id:"d23_desk", name:"桌子", hot:[10,52,70,8], text:"桌上一本操作手冊，翻開在「B1 全區鎖定」那一頁。書角折起來了。" } ] },
      { id:"gate", name:"側門外", scene:"c23_gate", phase:2, opt:{ tape:true }, details:[
        { id:"d23_cam", name:"側門上的監視器", hot:[64,38,14,6], text:"側門上方的監視器，紅燈亮著。鏡頭朝下，拍得到門口，拍不到巷子。" },
        { id:"d23_lamp", name:"巷口的路燈", hot:[142,36,14,8], text:"巷口的路燈，燈泡外面纏著蜘蛛網。巷子往漁港的方向。" } ] }
    ],
    ice: [ { id:"iice", name:"阿珠冰店", scene:"c23_ice", details:[
      { id:"d23_shaver", name:"刨冰機", hot:[104,36,30,48], text:"刨冰機的刀片擦得發亮。旁邊一碗紅豆，蓋著保鮮膜。" } ] } ]
  };
  const PS = [["c23_lobby",{ tv:true }],["c23_b1",{ dark:true, locked:true, boxOpen:true }],["c23_control",{ ventOpen:true }]];
  EP23.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 結案：重現 ---------- */
  const strip = L => { const o = Object.assign({}, L); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  EP23.looks = { hatC: strip(LOOK.hat), qiuC: strip(LOOK.qiu), zhuC: strip(LOOK.zhu) };
  const RB = [
    { t:"19:40:00", d:5, cap:"19:40，一個戴鴨舌帽的男人抱著一個保麗龍箱，說是阿珠冰店來送冰。邱伯讓他放在後門。", scene:"c23_lobby", opt:{ tv:true }, m:{ hatC:[150,94,"hold@cooler/#ecebe4",1,60,94], qiuC:[24,94,"sit",1] }, out:["hatC"] },
    { t:"20:15:00", d:4, cap:"20:15，邱伯上樓巡邏，警衛亭空了。", scene:"c23_lobby", opt:{ tv:true }, m:{ qiuC:[200,94,"walk1",1,24,94] }, out:["qiuC"] },
    { t:"20:16:00", d:5, join:true, cap:"戴帽子的男人從後面走出來，拉開警衛亭沒鎖的抽屜，拿走了機房的鑰匙。", scene:"c23_lobby", opt:{ tv:true }, m:{ hatC:[40,94,"reach",-1,150,94] } },
    { t:"21:10:00", d:5.5, cap:"21:10，他在一樓的控制室，按住「B1 全區鎖定」三秒，再把 B1 的通風關掉。", scene:"c23_control", opt:{ lockOn:false }, m:{ hatC:[114,94,"back+reach",1,180,94] } },
    { t:"21:10:30", d:4, join:true, cap:"他用袖子把按鈕擦了一遍。一片魚鱗，卡進了按鈕的邊縫。", scene:"c23_control", opt:{ lockOn:true }, m:{ hatC:[114,94,"back+wipe",1] } },
    { t:"21:12:00", d:5, cap:"21:12，他推開側門，走向巷口那台阿珠冰店的送貨機車，往漁港的方向騎走了。", scene:"c23_gate", opt:{ noTracks:true, scooter:true }, m:{ hatC:[168,94,"walk1",1,72,94] }, out:["hatC"] },
    { t:"23:00:00", d:5, cap:"23:00，他把車騎回冰店。「阿珠姨，我要出去一陣子。」", scene:"c23_ice", opt:{}, m:{ hatC:[-20,94,"walk1",-1,150,94], zhuC:[110,94,"stand",1] }, out:["hatC"] }
  ];
  EP23.court = {
    title: "舊醫院一樓・12 月 30 日 00:20", scene: "c23_lobby", opt:{ tv:false },
    who: ph => ["qiu","liu"],
    open: ph => "00:20，舊醫院一樓大廳。邱伯坐在警衛亭外面的椅子上，劉怡伶站在登記處旁邊，手機一直握著。小吳的手纏著繃帶。許知夏站在控制室的門口。",
    kindLine: {
      person: "門不是自己鎖上的。有人故意把我們鎖在地下室。",
      fault: "門是舊系統自己鎖上的，沒有人故意。"
    },
    kindTrue: "",
    murmur: [ "（邱伯一直在搓手。）", "（劉怡伶把手機螢幕按亮，又按暗。）", "（小吳看著自己手上的繃帶。）" ],
    confess: { hat: "（阿帽不在這裡。冰店的集點卡上，只畫著一頂帽子。）" },
    cornered: { hat: "（阿帽不在這裡。沒有人知道他現在在哪裡。）" },
    deny: {
      qiu: "我在警衛亭看電視……我什麼都沒聽到……",
      liu: "我 20:52 就走了，我在捷運上……"
    },
    replayText: "12 月 29 日 19:40，舊醫院的大門。一個戴鴨舌帽的男人，抱著一個保麗龍箱——",
    replay: { scene:"c23_lobby", opt:{ tv:true }, clean:true, cam:"經過重現", date:"2026-12-29", beats:RB },
    endGood: "00:30，你在報告上寫：「蓄意妨害自由。嫌犯：綽號『阿帽』，在逃。」\n阿珠冰店那張畫著帽子的集點卡，被許知夏裝進證物袋。\n那本值班表少了一頁。可是你們知道了一件事：有人怕你們看到它。",
    endBad: "報告上寫的是：「舊系統故障，意外鎖閉。」\n第二天，管理處派人來修門禁。控制室的按鈕被擦得更乾淨了。\n那個戴帽子的男人，沒有人再提起。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[23] && ARC_INTER[23].after) EP23.after = Object.assign({}, ARC_INTER[23].after, { scene:"c23_gate", opt:{ tape:true } });

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP23.outScenes = ["c23_gate"];
  EP23.fac = { archive:["#8a8e80","#3a5a4a"], ice:["#e8f0e8","#e86a8a"] };
  EP23.setting = { archive:"town", ice:"town" };
  const SKY23 = [ ["#0a0f1c","#24304a","#2a3040","#323a4a",0,0], ["#0a0f1c","#24304a","#2a3040","#323a4a",0,0], ["#06080f","#1a2234","#222838","#2a3242",0,0] ];
  EP23.worldSky = ph => SKY23[Math.min(ph || 0, SKY23.length - 1)];
  EP23.roomDesc = {
    lobby:"舊澄港醫院的一樓大廳。掛號櫃台改成了登記處。", lobby2:"一樓大廳。", b1:"地下一樓的檔案室。以前是太平間的前廳。", morgue23:"舊太平間。冷冰冰的，什麼都斷電了。", shaft:"停用十年的電梯井。", vent:"通風管裡，只容得下一個人爬。",
    control:"一樓的控制室（機房）。", gate:"舊醫院的側門外面。巷子往漁港的方向。", iice:"南澳漁港邊的阿珠冰店，鐵門拉下一半。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  EP23.world = {};
  EP23.locations.forEach(l => { EP23.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP23.world.archive, {
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長……這裡好冷。燈只有一半是亮的。", "小吳"),
      say("wu", "劉小姐說值班表在 B1，索引櫃查得到箱號。", "小吳"),
      say("you", "找到就走。", "你"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  // 被鎖在地下室的那一段（phase 1）：不能走到街上；早上那段簡報從 B1 開始
  if (typeof WK !== "undefined" && WK.autoWorld && !WK._ep23wrap){
    const AW = WK.autoWorld; WK._ep23wrap = true;
    WK.autoWorld = function(l, o){
      const d = AW.apply(this, arguments);
      try {
        if (typeof C !== "undefined" && C === EP23 && l && l.id === "archive" && S && S.phase === 1){
          const st = d.areas.find(a => a.id === "_street"), b = d.areas.find(a => a.id === "b1");
          if (st) st.hide = true;
          if (b) d.spawn = Math.round((b.x0 + b.x1) / 2);
          delete d.park;
        }
      } catch (e) {}
      return d;
    };
  }
  EP23.mapPos = { archive:[120,56,"u"], ice:[54,104,"d"] };
  EP23.mapRoads = [["archive","ice"]];
  EP23.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 20; x < 230; x += 8) for (let y = 14; y < 100; y += 7) R(x, y, 6, 5, "#c8c0b0");
    R(0, 100, 240, 35, "#3a6a8a"); for (let x = 4; x < 240; x += 12) R(x, 108 + (x % 3) * 4, 6, 1, "#5a8aa8");
    R(112, 48, 16, 12, "#8a8e80"); R(118, 50, 4, 8, "#c83a2a"); R(116, 52, 8, 4, "#c83a2a");
  };
})();
