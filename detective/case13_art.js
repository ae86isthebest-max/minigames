/* =========================================================
   第 13 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP13.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, lamp, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + 0.5, en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i] = beatAt(o.t || 0, o.ds); return (o.seq || [])[i] || {}; };
  const cam = (x, y) => { R(x, y, 10, 5, "#2a2a2e"); R(x + 7, y + 1, 3, 3, "#4a4a52"); P(x + 1, y + 1, "#e83a3a"); };
  const neon = (x, y, w, c, t) => { const on = Math.floor((t || 0) * 3) % 7 !== 0; R(x, y, w, 1, on ? c : "#3a2a3a"); R(x, y + 1, w, 1, on ? "#ffffff55" : "#3a2a3a"); };
  const door = (x, y, w, h, c, num) => { R(x, y, w, h, c); R(x + 1, y + 1, w - 2, h - 2, PR.shade ? c : c); R(x + w - 4, y + h / 2, 2, 2, "#e8c040"); if (num) txt(num, x + 3, y + 8, "#f4e0a0", "5px monospace"); };

  /* ---------- 場景：金曲 KTV ---------- */
  // 櫃台
  SC.k_front = (o) => {
    R(0, 0, W, 72, "#2a1e34"); for (let x = 0; x < W; x += 12) R(x, 0, 1, 72, "#32243e");
    R(60, 4, 72, 10, "#1a1022"); neon(64, 6, 64, "#ff5ab4", o.t); neon(64, 11, 64, "#5ad8ff", o.t + .3); txt("金曲 KTV", 80, 12, "#ffd0f0", "7px sans-serif");
    cam(8, 4); cam(178, 4);
    R(16, 14, 26, 20, "#e8e4dc"); R(16, 14, 26, 3, "#c23a6a"); for (let k = 0; k < 5; k++) R(18, 19 + k * 3, k === 3 ? 22 : 10 + (k * 5) % 12, 1, k === 3 ? "#d83a3a" : "#5a5a5a");   // 訂位板
    R(150, 12, 20, 16, "#b89a6a"); R(152, 14, 16, 12, "#d8c8a0"); R(156, 17, 4, 7, "#5a4a3a"); R(161, 20, 3, 4, "#5a4a3a"); R(152, 24, 16, 2, "#c23a2a");   // 開幕照片
    R(0, 20, 8, 52, "#3a2a20"); R(1, 22, 6, 30, "#4a6a8a");   // 大門
    // 櫃台和三個螢幕
    SC.k_front.front(o);
    R(84, 36, 18, 12, "#1a1a22"); R(85, 37, 16, 9, o.cam ? "#2a3a4a" : "#3a6a9a"); for (let k = 0; k < 3; k++) R(86, 38 + k * 3, 12, 1, "#a8d8f0"); R(91, 46, 4, 2, "#2a2a2a");   // 門鎖主機
    R(100, 30, 6, 4, "#f4e870");   // 便利貼（螢幕後面露出來）
    R(104, 36, 18, 12, "#1a1a22"); R(105, 37, 16, 9, "#4a2a6a"); for (let k = 0; k < 3; k++) R(106, 38 + k * 3, 6 + k * 3, 1, "#f0a0e0"); R(111, 46, 4, 2, "#2a2a2a");   // 點歌主機
    R(124, 38, 14, 10, "#1a1a22"); R(125, 39, 12, 8, "#3a5a3a"); R(126, 41, 6, 1, "#a8f0a8");   // 點餐平板
    R(60, 44, 10, 4, "#e8e8f0"); R(61, 45, 8, 2, "#c8d8e0");   // 小費罐（上緣）
    R(60, 52, 10, 8, "#b8d8e8"); R(62, 57, 2, 1, "#c8a040");
    lamp(30, 0, "#ff9ad8"); lamp(170, 0, "#9ad8ff");
    floor(72, "#3a2a3a", "#4a3a4a"); for (let x = 0; x < W; x += 16) R(x, 80 + (x / 16 % 2) * 12, 8, 1, "#5a4a5a");
  };
  // 櫃台檯面：畫在櫃台後面的人前面
  SC.k_front.front = (o) => { R(44, 48, 104, 3, "#c8a868"); R(46, 51, 100, 21, "#5a2a4a"); for (let x = 50; x < 144; x += 10) R(x, 53, 6, 17, "#6a3a5a"); R(60, 52, 10, 8, "#b8d8e8"); R(62, 57, 2, 1, "#c8a040"); };
  SC.k_front.frontY = 80;
  // 走廊
  SC.k_hall = (o) => {
    R(0, 0, W, 76, "#2e2238"); R(0, 0, W, 10, "#1e1628"); for (let x = 6; x < W; x += 30) { R(x, 8, 6, 2, "#ffd0f0"); dither(x - 2, 10, 10, 6, "#ffd0f022", 3); }
    cam(90, 2);
    R(40, 16, 18, 14, "#e8d8c0"); R(42, 18, 14, 10, "#c86a9a"); R(46, 20, 6, 6, "#f4d0b0"); R(42, 26, 14, 2, "#3a2a2a");   // 海報
    [[4,"801"],[60,"805"],[96,"806"],[150,"808"]].forEach(([x,n]) => door(x, 26, 22, 48, x === 150 ? "#5a2a3a" : "#4a3040", n));
    const red = o.red !== false; R(154, 14, 8, 6, "#1a1a1e"); R(155, 15, 6, 4, red ? "#ff3a3a" : "#3ae86a"); if (red) dither(150, 20, 16, 6, "#ff3a3a33", 3);   // 808 門燈
    R(176, 26, 16, 48, "#3a3a3e"); R(178, 28, 12, 6, "#5a5a5e"); txt("倉", 180, 42, "#8a8a90", "6px sans-serif");   // 倉庫
    R(26, 30, 8, 12, "#f4f0e0"); for (let k = 0; k < 3; k++) R(27, 32 + k * 3, 6, 1, "#5a5a5a");   // 員工守則
    if (o.cart !== false){ R(118, 66, 20, 2, "#c8c8cc"); R(120, 68, 2, 6, "#8a8a8e"); R(134, 68, 2, 6, "#8a8a8e"); R(120, 74, 3, 2, INK); R(133, 75, 3, 2, INK);
      R(122, 62, 14, 4, "#f4f0e0"); R(124, 60, 10, 3, "#8a5a2a"); R(125, 60, 3, 2, "#c8a060"); R(130, 61, 2, 1, "#5a3a1a"); }   // 推車和滷味
    floor(76, "#4a3448", "#3e2c3c"); R(0, 76, W, 2, "#ff5ab433");
  };
  // 808 包廂
  SC.k_808 = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 70, "#24182e"); for (let k = 0; k < 14; k++) P((k * 37) % W, 4 + (k * 13) % 30, ["#ff5ab4","#5ad8ff","#ffe05a"][k % 3]);
    R(70, 2, 12, 6, "#c8c8d0"); R(74, 8, 4, 3, "#e8e8f0");   // 天花板的球燈
    // 電視、門、面板
    R(148, 16, 34, 24, "#1a1a1e"); const tv = o.tv !== false; R(150, 18, 30, 20, tv ? "#3a2a6a" : "#0a0a0e");
    if (tv){ for (let k = 0; k < 4; k++) R(152, 22 + k * 4, 26 - (k * 7) % 12, 2, ["#f0a0e0","#a0e0f0","#f0e0a0","#c0c0f0"][k]); R(170, 19, 9, 2, "#ffe05a"); }
    R(184, 20, 8, 54, "#4a2a3a"); R(176, 40, 6, 8, "#d8d8dc"); R(177, 41, 4, 2, "#3ae86a"); R(177, 44, 4, 2, "#ff3a3a");
    if (o.unplug){ R(160, 40, 2, 8, "#2a2a2a"); R(158, 46, 6, 3, "#2a2a2a"); }
    // 沙發
    R(8, 42, 140, 6, "#6a1e3a"); R(8, 48, 140, 18, "#7a2a4a"); for (let x = 12; x < 148; x += 20) R(x, 50, 1, 14, "#5a1a32"); R(4, 44, 6, 22, "#6a1e3a");
    R(22, 50, 18, 14, "#2a2a2e"); R(24, 52, 6, 10, "#3a3a40");   // 皮外套
    if (o.body){ PR.person(64, 62, { skin:"#c8a890", hair:"#1a1410", hairStyle:"short", top:"#1e1e22", bottom:"#3a4a6a", chain:true, blink:true }, 1.2, 1, "lie");
      R(78, 50, 3, 2, "#9a6aa8"); R(56, 52, 2, 2, "#e86a6a"); }
    floor(66, "#2a2030", "#24202a");
    SC.k_808.front(o);
  };
  // 桌子和桌上的東西：坐在沙發上的人在桌子後面
  SC.k_808.frontY = 80;
  SC.k_808.front = (o) => {
    R(36, 66, 112, 4, "#2a2a30"); R(38, 70, 108, 8, "#1e1e24"); R(40, 78, 4, 10, "#1a1a1e"); R(140, 78, 4, 10, "#1a1a1e");
    R(46, 70, 10, 3, "#8a8a90"); P(48, 69, "#c8c0b0"); P(51, 69, "#c8c0b0");   // 菸灰缸
    for (let k = 0; k < 3; k++){ R(66 + k * 5, 70, 4, 3, "#f4f4f4"); R(66 + k * 5, 70, 4, 1, "#3a6ae8"); }   // 三小包
    R(86, 69, 10, 5, "#a8a8b0"); R(87, 70, 8, 3, "#c8c8d0"); R(89, 71, 2, 2, "#f4f4f4"); R(92, 71, 2, 2, "#f4f4f4");   // 菸盒
    R(97, 72, 6, 3, "#e8f0f8"); R(97, 72, 6, 1, "#b8c8d8"); P(99, 74, "#ffffff");   // 撕開的夾鏈袋
    R(108, 68, 16, 3, "#f4f4f0"); R(110, 66, 4, 2, "#e84a4a"); R(115, 66, 4, 2, "#a8d86a"); R(120, 66, 3, 2, "#e84a4a");   // 水果盤
    R(128, 70, 8, 4, "#1a1a1e"); R(129, 71, 6, 2, "#4a6aa8");   // 手機
    R(136, 66, 10, 2, "#2a2a2e"); R(144, 65, 2, 3, "#5a5a5e");   // 麥克風
    for (let k = 0; k < 6; k++) R(52 + k * 4, 64, 2, 2, "#d8a830");   // 啤酒瓶蓋
  };
  // 805 包廂（生日）
  SC.k_805 = (o) => {
    R(0, 0, W, 70, "#2a2040"); for (let k = 0; k < 7; k++){ const x = 14 + k * 24; R(x, 8 + (k % 2) * 4, 6, 7, ["#ff7ab4","#7ad8ff","#ffe07a"][k % 3]); R(x + 2, 15 + (k % 2) * 4, 1, 8, "#c8c8c8"); }
    txt("HAPPY BIRTHDAY", 60, 30, "#ffe07a", "6px monospace");
    R(150, 16, 32, 22, "#1a1a1e"); R(152, 18, 28, 18, "#2a3a6a");
    R(8, 44, 130, 22, "#3a4a7a"); R(8, 42, 130, 4, "#2a3a6a");
    R(20, 66, 150, 4, "#2a2a30"); R(22, 70, 146, 8, "#1e1e24");
    R(80, 60, 20, 6, "#6a3a2a"); R(82, 58, 16, 3, "#f4e0c8"); R(89, 54, 2, 4, "#f4f0f0"); P(89, 53, "#ffb030"); R(84, 62, 4, 4, "#4a2a1a");   // 蛋糕
    R(140, 62, 12, 6, "#1a1a1e"); R(141, 63, 10, 4, "#6a4aa8");   // 平板
    R(30, 64, 14, 6, "#e8e8f0"); R(32, 62, 4, 2, "#f4f4f4"); R(38, 61, 3, 3, "#f4f4f4");   // 面紙
    floor(78, "#2a2438", "#24202e");
  };
  // 辦公室
  SC.k_office = (o) => {
    wall(72, "#4a3e48", false);
    R(10, 28, 14, 20, "#5a3a2a"); for (let k = 0; k < 3; k++) R(11, 30 + k * 6, 12, 4, ["#c8a868","#a85a3a","#6a8a5a"][k]);   // 帳簿架
    R(110, 20, 12, 14, "#2a2a2a"); R(111, 21, 10, 10, "#c8c8c0"); R(114, 23, 4, 6, "#5a5a5a"); R(112, 34, 8, 2, "#8a5a2a"); P(116, 33, "#c84a2a");   // 父親的相框和香爐
    R(128, 16, 18, 16, "#f4f0e0"); R(128, 16, 18, 3, "#c23a2a"); for (let k = 0; k < 4; k++) R(130, 21 + k * 3, 14, 1, "#8a8a8a"); P(136, 16, "#e8c040");   // 存證信函
    R(150, 50, 18, 20, "#3a3a3e"); R(152, 52, 14, 16, "#2a2a2e"); R(162, 58, 3, 3, "#c8c8c8"); if (o.safeOpen !== false){ R(168, 50, 4, 20, "#4a4a4e"); }   // 保險箱
    R(36, 52, 76, 4, "#7a5a3a"); R(38, 56, 72, 16, "#6a4a2a"); R(58, 62, 14, 6, "#5a3a22"); R(64, 64, 2, 1, "#c8a868");   // 書桌和抽屜
    R(88, 50, 12, 4, "#2a3a6a"); R(89, 50, 10, 1, "#e8e8e8");   // 筆記本
    R(44, 40, 20, 12, "#1a1a1e"); R(45, 41, 18, 9, "#3a5a7a"); R(50, 50, 8, 2, "#2a2a2a");   // 監視器螢幕
    R(70, 46, 10, 6, "#e8e8e8"); R(72, 47, 6, 3, "#c8c8c8");   // 發票
    R(84, 44, 2, 6, "#8a8a8a"); R(80, 42, 10, 3, "#e8c860");   // 檯燈
    floor(72, "#3a3034", "#342a2e");
    R(170, 64, 22, 4, "#6a7a5a"); R(172, 68, 2, 6, "#5a5a5e"); R(188, 68, 2, 6, "#5a5a5e"); R(172, 61, 8, 3, "#e8e4dc"); R(173, 62, 4, 1, "#d0ccc4");   // 摺疊床
  };
  // 後門・後巷
  SC.k_back = (o) => {
    R(0, 0, W, 76, o.day ? "#8a8a86" : "#1e2230"); R(0, 0, W, 14, o.day ? "#a8b8c8" : "#0e1220");
    floor(76, o.day ? "#6a6a66" : "#2a2a30", o.day ? "#5a5a56" : "#24242a");
    R(60, 14, 132, 62, o.day ? "#a89a88" : "#3a3440"); for (let y = 18; y < 76; y += 6) R(60, y, 132, 1, o.day ? "#988a78" : "#342e3a");
    R(100, 28, 16, 46, "#5a4a3a"); R(102, 30, 12, 20, "#6a5a4a"); R(112, 52, 2, 2, "#c8a040"); txt("員工出入", 98, 26, "#e8e0c0", "5px sans-serif");
    cam(20, 6); R(24, 11, 1, 8, "#3a3a3e");
    R(26, 56, 16, 18, "#3a5a3a"); R(24, 54, 20, 3, "#2a4a2a");   // 垃圾桶
    R(44, 72, 10, 6, "#8a8a8e"); R(45, 70, 8, 2, "#a8a8ac"); P(47, 71, "#e8e0d0"); P(50, 70, "#e86a6a");   // 鐵罐
    R(146, 78, 20, 10, "#a8865a"); R(150, 74, 12, 5, "#e8963a"); P(152, 75, INK); P(158, 75, INK); R(161, 72, 2, 3, "#e8963a");   // 紙箱和橘貓
    if (!o.day) R(80, 18, 4, 2, "#ffe8a0");
    R(130, 34, 40, 12, o.day ? "#b8aa98" : "#443e4a"); txt("凱哥罩的", 132, 43, o.day ? "#c84a4a" : "#a84a5a", "7px sans-serif"); R(150, 32, 22, 16, o.day ? "#a89a88" : "#3a3440");
  };

  /* ---------- 其他地點 ---------- */
  SC.m13_morgue = (o) => {
    wall(70, "#d8e0e0", false); R(0, 66, W, 4, "#a8b8b8");
    R(160, 16, 30, 50, "#b8c4c8"); for (let k = 0; k < 3; k++){ R(162, 18 + k * 16, 26, 14, "#c8d4d8"); R(166, 23 + k * 16, 8, 3, "#f4f4f0"); R(182, 24 + k * 16, 3, 2, "#5a5a5a"); }   // 冰櫃
    R(60, 54, 70, 6, "#a8b8c0"); R(64, 60, 4, 14, "#8a9aa0"); R(122, 60, 4, 14, "#8a9aa0"); R(66, 50, 58, 5, "#e8ecf0");   // 解剖台（蓋著白布）
    R(120, 40, 24, 16, "#f4f4f0"); R(122, 42, 20, 2, "#3a3a3a"); for (let k = 0; k < 3; k++) R(122, 46 + k * 3, 16, 1, "#8a8a8a");   // 報告夾
    R(40, 58, 24, 10, "#c8c8c0"); R(42, 60, 8, 6, "#3a2a1a"); R(52, 60, 6, 6, "#e8e0d0"); R(59, 61, 4, 4, "#4a6aa8");   // 證物盤
    R(20, 20, 20, 14, "#1a1a1e"); R(22, 22, 16, 10, "#e8e8f0"); R(26, 24, 8, 6, "#8a8a8a");   // 看片燈
    R(18, 42, 16, 8, "#8a5a3a"); R(20, 44, 6, 4, "#3a3a3a"); R(28, 44, 4, 1, "#e8c040"); R(28, 46, 4, 1, "#e8c040"); R(30, 38, 1, 4, "#5a5a5a");   // 收音機（放在架上）
    R(14, 50, 24, 2, "#a8b0b0");
    R(84, 2, 24, 3, "#f4f4f0"); dither(78, 5, 36, 20, "#f4f4f022", 3);
    floor(74, "#b8c4c4", "#a8b4b4");
  };
  SC.n_stall = (o) => {
    R(0, 0, W, 60, "#9cc5e6"); R(0, 40, W, 20, "#c8c0b0");
    for (let k = 0; k < 4; k++){ const x = k * 50; R(x, 30, 44, 4, ["#c83a2a","#3a7ac8","#e8b030","#3a9a5a"][k]); R(x + 2, 34, 40, 26, "#e8e0d0"); R(x + 2, 34, 40, 26, k === 1 ? "#e8e0d0" : "#b8b0a0"); }   // 白天收起來的攤子
    R(60, 50, 40, 18, "#d8d0c0"); R(60, 48, 40, 3, "#c83a2a"); txt("鹽酥雞", 66, 46, "#c83a2a", "6px sans-serif"); R(64, 54, 12, 8, "#8a8a8e"); R(80, 54, 8, 8, "#e8c860");
    R(90, 56, 12, 8, "#f4f0e0"); for (let k = 0; k < 3; k++) R(91, 57 + k * 2, 10, 1, "#5a5a5a");   // 點單本
    floor(68, "#7a7a76", "#6a6a66");
  };
  SC.n_lane = (o) => {
    const night = !!o.cam; R(0, 0, W, 76, night ? "#14181e" : "#b8b0a4"); R(0, 0, W, 12, night ? "#0a0c12" : "#9cc5e6");
    floor(76, night ? "#24262c" : "#6a6a66", night ? "#1e2026" : "#5a5a56");
    for (let x = 0; x < W; x += 40){ R(x, 14, 36, 62, night ? "#20242c" : "#a89a88"); R(x + 4, 22, 10, 8, night ? "#2a2e36" : "#7a8a9a"); }
    cam(12, 4);
    R(90, 20, 8, 56, "#7a7a7e"); for (let k = 0; k < 5; k++) R(88, 28 + k * 8, 12, 5, ["#f4f0e0","#e8c860","#f4f0e0","#c8e0f0","#f4f0e0"][k]); R(91, 52, 6, 5, "#1a1a1e"); P(93, 53, "#e8c040"); P(95, 53, "#e8c040");   // 電線桿和黑貓貼紙
    R(80, 6, 30, 2, "#3a3a3a"); R(90, 8, 8, 4, night ? "#ffe8a0" : "#c8c8c0"); if (night) dither(80, 12, 30, 30, "#ffe8a018", 3);
    R(96, 82, 12, 4, night ? "#3a3a3e" : "#8a8a86"); for (let k = 0; k < 6; k++) P(97 + k * 2, 83 + k % 2, "#e8e0d0");
    R(120, 86, 20, 3, "#2a2a26"); R(124, 85, 10, 1, "#3a3a34");
  };
  SC.a_room = (o) => {
    R(0, 0, W, 72, "#1a1424"); for (let k = 0; k < 6; k++){ const x = 6 + k * 30; R(x, 20, 24, 50, ["#c83a6a","#3a6ac8","#e8b030","#3ac87a","#c83a6a","#6a3ac8"][k]); R(x + 3, 24, 18, 14, "#0e0e16"); R(x + 5, 26, 14, 10, ["#ff9ad8","#9ad8ff","#ffe09a"][k % 3]); }
    R(40, 60, 20, 12, "#e8c040"); R(42, 62, 16, 4, "#c8a020"); for (let k = 0; k < 5; k++) P(43 + k * 3, 63, "#f4e070");   // 推幣機
    R(100, 60, 40, 12, "#3a2a4a"); R(100, 58, 40, 3, "#5a4a6a"); R(110, 62, 10, 6, "#1a1a1e"); R(111, 63, 8, 4, "#e8c87a");   // 櫃台和手機
    txt("金龍遊藝場", 70, 12, "#ffe07a", "7px sans-serif"); cam(170, 4);
    floor(72, "#2a2034", "#241a2e");
  };
  SC.h_living = (o) => {
    wall(72, "#e8e0d0", false);
    R(78, 10, 22, 60, "#f4f4f4"); R(78, 36, 22, 1, "#c8c8c8"); R(80, 14, 18, 14, "#f4f0e0"); R(82, 16, 6, 5, "#c83a2a"); R(89, 18, 6, 6, "#3a7ac8"); R(84, 24, 2, 3, "#e8b030"); R(88, 24, 2, 3, "#e8b030"); R(92, 24, 2, 3, "#e8b030");   // 冰箱和畫
    R(10, 56, 40, 16, "#8a6a4a"); R(20, 60, 16, 8, "#f4f0e0"); R(20, 60, 16, 2, "#e84a3a"); R(58, 58, 18, 14, "#7a5a3a"); R(60, 62, 12, 6, "#6a4a2a");   // 櫃子、催繳單、抽屜
    R(120, 56, 40, 16, "#7a5a3a"); R(130, 40, 20, 16, "#1a1a1e"); R(131, 41, 18, 12, "#e8e8f0"); for (let k = 0; k < 4; k++) R(133, 43 + k * 2, 12, 1, "#5a5a8a");   // 電腦
    R(166, 14, 26, 58, "#9cc5e6"); R(166, 46, 26, 2, "#5a5a5a"); R(170, 50, 14, 10, "#8a8a8a"); R(172, 49, 10, 2, "#c8c8c8");   // 陽台、菸灰缸
    floor(72, "#c8b090", "#b8a080");
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    huang: { skin:"#e0b48c", hair:"#1a1410", hairStyle:"slick", top:"#f4f4f0", coat:"#1e1e22", bottom:"#2a2a30", tie:"#7a2a4a", mood:"tired", hello:"警察先生……這種事，我開店二十年第一次遇到。" },
    man:   { skin:"#f0d0b4", hair:"#8a5a3a", hairStyle:"long", top:"#f0a0c0", bottom:"#2a2a3a", skirt:true, mood:"sad", hello:"他不會這樣死的……" },
    chen:  { skin:"#f4d4bc", hair:"#1e1a18", hairStyle:"pony", top:"#c83a6a", bottom:"#2a2a30", mood:"worried", hello:"我今天只是去抽一根菸……" },
    long:  { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#c83a6a", apron:"#1e1e22", bottom:"#2a2a30", mood:"worried", hello:"我、我有敲門……我敲了兩次……" },
    liang: { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#2a2a2e", hood:"#2a2a2e", bottom:"#3a4a6a", hat:"cap", capColor:"#c8c8c8", chain:true, hello:"凱哥不會吸死，你們亂講。" },
    ben:   { skin:"#e8c09a", hair:"#3a2a20", hairStyle:"short", top:"#e8c040", bottom:"#3a5a8a", hat:"cap", capColor:"#ff7ab4", hello:"那段影片……我真的不知道會變成這樣。" },
    hui:   { skin:"#f4d4bc", hair:"#3a2a20", hairStyle:"long", top:"#f4f4f8", bottom:"#f4f4f8", skirt:true, hello:"我只是想過一個生日……" },
    hua:   { skin:"#c89a70", hair:"#1a1410", hairStyle:"short", top:"#1e1e22", bottom:"#3a3a3e", chain:true, sleeve:"#2a6a5a", hello:"我說了，我一點以前就走了。" },
    shuzhen:{ skin:"#f0d0b4", hair:"#2a2220", hairStyle:"bob", top:"#e8e0d0", coat:"#8a9a7a", bottom:"#4a4a5a", glasses:true, mood:"worried", hello:"他……他做了什麼？" },
    lai:   { age:"old", skin:"#d8a880", hair:"#b8b8b0", hairStyle:"balding", top:"#3a7a5a", bottom:"#5a5040", hello:"欠錢還有理喔？" },
    stall: { skin:"#c89a70", hair:"#2a2220", hairStyle:"short", top:"#f4f4f0", apron:"#c83a2a", bottom:"#3a3a3e", hat:"cap", capColor:"#c83a2a", hello:"要雞排嗎？今天沒開，晚上再來。" },
    qian:  { hello:"我放首鄧麗君，你們別介意。" },
    xu:    { hello:"不要碰桌上任何東西。" },
    wu:    { hello:"學長，那首歌還在唱……" },
    ye:    { hello:"我只看證據。" }
  };
  ["qian","xu","wu","ye"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.xu.top) Object.assign(LOOK.xu, { skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" });
  if (!LOOK.wu.top) Object.assign(LOOK.wu, { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050", glasses:true });
  if (!LOOK.qian.top) Object.assign(LOOK.qian, { age:"old", skin:"#e0b48c", hair:"#b8b8b0", hairStyle:"balding", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#2a2a30", glasses:true });
  if (!LOOK.ye.top) Object.assign(LOOK.ye, { skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"pony", top:"#f4f4f0", coat:"#6a6e74", bottom:"#6a6e74", skirt:true });
  LOOK.ye.mood = "tired";
  const DAILY = {
    huang: [ { room:"kfront", x:96, pose:"smoke", doing:"站在櫃台後面抽菸，菸灰一直掉在檯面上。" }, { room:"koffice", x:120, pose:"sit", doing:"坐在辦公室裡，對著父親的照片發呆。" }, { room:"khall", x:150, pose:"sit", doing:"坐在 808 門口的地上，不進去也不走。" } ],
    man:   [ { room:"k805", x:60, pose:"cry", doing:"坐在 805 的沙發上，妝都哭花了。" }, { room:"pdesk", x:40, pose:"sit", doing:"坐在刑大的長椅上，一直在咬指甲。" }, { room:"pdesk", x:40, pose:"phone", doing:"在講電話，跟客人一直道歉。" } ],
    chen:  [ { room:"kfront", x:140, pose:"stand", doing:"站在櫃台旁邊，雙手抱著自己。" }, { room:"kback", x:70, pose:"smoke", doing:"在後門抽菸，橘貓在她腳邊。" } ],
    long:  [ { room:"khall", x:110, pose:"stand", doing:"站在推車旁邊，一直看著那盤滷味。" }, { room:"khall", x:80, pose:"broom", doing:"在掃走廊，掃了三次同一個地方。" }, { room:"kfront", x:60, pose:"stand", doing:"站在櫃台前面，眼睛很紅。" } ],
    liang: [ null, { room:"pdesk", x:150, pose:"sit", doing:"坐在刑大的椅子上抖腳，帽子壓得很低。" }, { room:"nstall", x:140, pose:"stand", doing:"在隔壁的烤玉米攤幫媽媽翻玉米。" } ],
    ben:   [ { room:"k805", x:130, pose:"phone", doing:"一直在滑手機，看群組裡的留言。" }, { room:"pdesk", x:110, pose:"sit", doing:"坐在刑大，手機螢幕朝下放在腿上。" } ],
    hui:   [ { room:"k805", x:100, pose:"sit", doing:"抱著小曼的包包坐在旁邊，壽星的皇冠還戴在頭上。" } ],
    hua:   [ null, { room:"aroom", x:60, pose:"sit", doing:"坐在推幣機前面，一枚一枚地丟代幣。" }, { room:"aroom", x:120, pose:"cross", doing:"靠在櫃台邊，看著門口。" } ],
    shuzhen:[ null, { room:"hliving", x:60, pose:"stand", doing:"站在客廳，手上拿著一疊催繳單。" }, { room:"hliving", x:110, pose:"sit", doing:"坐在電腦前面，螢幕是黑的。" } ],
    lai:   [ null, null, { room:"kfront", x:30, pose:"point", doing:"站在大門口，手上一疊文件。" } ],
    stall: [ null, { room:"nstall", x:76, pose:"stand", doing:"在攤子後面備料，切雞排。" }, { room:"nstall", x:76, pose:"stand", doing:"在攤子後面炸東西。" } ],
    qian:  [ null, { room:"mroom", x:90, pose:"stand", doing:"站在解剖台旁邊，收音機在放鄧麗君。" } ],
    xu:    [ { room:"k808", x:110, pose:"kneel", doing:"蹲在桌邊，用鑷子夾起夾鏈袋。" }, { x:40, pose:"read", doing:"在實驗台前，紫外光燈開著。" } ],
    wu:    [ { room:"khall", x:60, pose:"stand", doing:"站在走廊，臉色有點白。" }, { x:110, pose:"stand", doing:"在電腦前面比對指紋。" }, { room:"pdesk", x:80, pose:"read", doing:"抱著一疊剛到的調閱資料。" } ],
    ye:    [ null, { room:"pdesk", x:140, pose:"read", doing:"在你的桌子旁邊翻卷宗，外套穿反了。" } ]
  };
  EP13.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP13.rooms = {
    ktv: [
      { id:"kfront", name:"櫃台", scene:"k_front", details:[
        { id:"d13_neon", name:"招牌的霓虹燈", hot:[60,4,72,10], text:"「金曲」的「曲」字，有一半的燈管壞了，一閃一閃的。" } ] },
      { id:"khall", name:"走廊", scene:"k_hall", opt:(ph) => ({ red:ph === 0, cart:ph === 0 }), details:[
        { id:"d13_rule", name:"門邊的員工守則", hot:[26,30,8,12], text:"「一、紅燈一律不得進入。二、客人的事不要問。三、店長說了算。」第三條是手寫加上去的。" } ] },
      { id:"k808", name:"808 包廂", scene:"k_808", opt:(ph) => ({ body:ph === 0, tv:ph === 0, unplug:ph === 2 }), details:[
        { id:"d13_ball", name:"天花板的球燈", hot:[68,0,16,12], text:"球燈還在慢慢轉，把一點一點的光灑在沙發上。" } ] },
      { id:"k805", name:"805 包廂", scene:"k_805", details:[
        { id:"d13_crown", name:"沙發上的壽星皇冠", hot:[110,46,10,6], text:"一個紙做的皇冠，「24」的數字貼紙掉了一半。" } ] },
      { id:"koffice", name:"店長辦公室", scene:"k_office", details:[
        { id:"d13_cot", name:"牆角的摺疊床", hot:[170,60,20,12], text:"牆角有一張摺疊床，枕頭上有睡過的凹痕。他最近常睡在店裡。" } ] },
      { id:"kback", name:"後門", scene:"k_back", opt:(ph) => ({ day:ph > 0 }), details:[
        { id:"d13_wall", name:"牆上的塗鴉", hot:[130,30,40,20], text:"後巷的牆上有人用噴漆寫了一行字：「凱哥罩的」。已經被人用油漆蓋過一半。" } ] }
    ],
    police: [ { id:"pdesk", name:"澄港市刑大", scene:"police", details:[
      { id:"d13_board", name:"白板", hot:[20,14,40,24], text:"白板上貼著這個月三個芬太尼死者的照片。阿凱的照片是今天早上剛貼上去的。" } ] } ],
    lab: [ { id:"lab", name:"鑑識中心", scene:"lab", details:[
      { id:"d13_uv", name:"紫外光燈", hot:[140,20,20,14], text:"許知夏的紫外光燈旁邊貼著一張便條：「用完關掉，不要拿來照小吳的襯衫」。" } ] } ],
    morgue: [ { id:"mroom", name:"法醫室", scene:"m13_morgue", details:[
      { id:"d13_radio", name:"收音機", hot:[20,40,12,8], text:"老錢的收音機在放〈月亮代表我的心〉。他聽到你進來，把音量轉小，又轉回來。" } ] } ],
    nightmkt: [
      { id:"nstall", name:"鹽酥雞攤", scene:"n_stall", details:[
        { id:"d13_oil", name:"油鍋", hot:[64,54,12,8], text:"油鍋上蓋著鐵板。老闆說白天不炸，晚上六點才開。" } ] },
      { id:"nlane", name:"夜市後巷", scene:"n_lane", details:[
        { id:"d13_moto", name:"地上的機車油漬", hot:[120,84,20,6], text:"地上有一小灘新的機車機油，形狀像有一台車在這裡停過幾分鐘。" } ] }
    ],
    arcade: [ { id:"aroom", name:"金龍遊藝場", scene:"a_room", details:[
      { id:"d13_claw", name:"夾娃娃機", hot:[150,24,24,40], text:"夾娃娃機裡全部是柴犬布偶。華仔說：「我夾的。全部。」" } ] } ],
    huanghome: [ { id:"hliving", name:"黃家客廳", scene:"h_living", details:[
      { id:"d13_shoes", name:"玄關的鞋", hot:[2,62,14,10], text:"玄關只有三雙鞋：一雙女用平底鞋、一雙兒童運動鞋、一雙磨破的皮鞋。" } ] } ]
  };
  const PS = [["k_808",{ body:true, tv:true }],["police",{}],["k_hall",{ red:false, cart:false }]];
  EP13.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 監視器動畫 ---------- */
  EP13.looks = {
    huangC: Object.assign({}, LOOK.huang, { hello:undefined }), chenC: Object.assign({}, LOOK.chen, { hello:undefined }),
    longC: Object.assign({}, LOOK.long, { hello:undefined }), manC: Object.assign({}, LOOK.man, { hello:undefined }),
    huaC: Object.assign({}, LOOK.hua, { hello:undefined }), liangC: Object.assign({}, LOOK.liang, { hello:undefined }),
    kaiC: { skin:"#d8b090", hair:"#1a1410", hairStyle:"short", top:"#1e1e22", bottom:"#3a4a6a", chain:true },
    sellerC: { skin:"#c89a70", hair:"#1a1410", hairStyle:"short", top:"#1e1e22", bottom:"#1e1e22", mask:"#2a2a2e", hat:"cap", capColor:"#1e1e22" },
    benC: Object.assign({}, LOOK.ben, { hello:undefined })
  };
  const ANIM = {
    cctv_counter: { scene:"k_front", opt:{ cam:true }, cam:"CAM-02 COUNTER", date:"2026-09-19", beats:[
      { t:"01:08:10", d:3.5, cap:"陳怡如拿起菸盒，從櫃台後面走出來，往後門走。", m:{ chenC:[30,98,"stand",-1,96,72,[[40,72]]] }, out:["chenC"] },
      { t:"01:09:30", d:3, cap:"櫃台沒有人。" },
      { t:"01:11:40", d:5, cap:"黃啟文從辦公室走出來，走到櫃台後面，站到主機前面，左右看了一下。", m:{ huangC:[200,72,"walk1",-1,94,72] } },
      { t:"01:12:04", d:4.5, cap:"他背對鏡頭，右手握著滑鼠，左手在鍵盤上按了一陣子。", m:{ huangC:[94,72,"point",-1] } },
      { t:"01:12:30", d:3.5, cap:"他離開主機，回辦公室。", m:{ huangC:[94,72,"walk2",1,200,72] }, out:["huangC"] },
      { t:"01:20:05", d:4, cap:"陳怡如回到櫃台後面。黃啟文出來跟她說了兩句話。", m:{ chenC:[30,98,"stand",1,96,72,[[40,72]]], huangC:[200,72,"stand",-1,130,72] } }
    ] },
    cctv_hall: { scene:"k_hall", opt:{ cam:true, red:false, cart:false }, cam:"CAM-01 HALL", date:"2026-09-19", beats:[
      { t:"00:25:10", d:4, cap:"808 門口：蘇曼妮用右手打了鄭凱文一巴掌。805 的男生拿手機在拍。", m:{ manC:[150,98,"point",1], kaiC:[164,98,"stand",-1], benC:[72,98,"phone",1] } },
      { t:"00:27:00", d:3.5, cap:"鄭凱文摸著臉回 808。蘇曼妮走進 805。", m:{ manC:[70,98,"walk1",-1,150,98], kaiC:[164,98,"stand",-1], benC:[72,98,"stand",1] }, out:["manC","benC","kaiC"] },
      { t:"00:32:20", d:4, cap:"刺龍的男人走到 808 門口，對著門裡講話。", m:{ huaC:[150,98,"stand",1,-20,98] } },
      { t:"00:34:10", d:3.5, cap:"00:34，他轉身走掉，經過推車的時候踢了一腳。", m:{ huaC:[-20,98,"walk1",-1,150,98] }, out:["huaC"] },
      { t:"00:50:00", d:4.5, cap:"黃啟文雙手端著水果盤走到 808，開門進去。", m:{ huangC:[160,98,"hold",1,-20,98] }, out:["huangC"] },
      { t:"00:52:10", d:3.5, cap:"00:52，他出來，把空托盤夾在腋下走回去。", m:{ huangC:[-20,98,"walk2",-1,160,98] }, out:["huangC"] },
      { t:"01:20:00", d:3, cap:"01:10 到 01:29，沒有人靠近 808。" },
      { t:"01:30:20", d:4.5, cap:"林育龍端著滷味到 808，看到紅燈，敲門兩次，把盤子放在門口的推車上，走掉。", s:{ red:true, cart:true }, m:{ longC:[140,98,"hold",1,-20,98] }, out:["longC"] },
      { t:"02:40:00", d:4, cap:"02:40，黃啟文和林育龍走到 808，黃啟文用卡打開門。", s:{ red:true, cart:true }, m:{ huangC:[160,98,"walk1",1,-20,98], longC:[138,98,"walk2",1,-34,98] } }
    ] },
    cctv_back: { scene:"k_back", opt:{ cam:true }, cam:"CAM-03 BACK", date:"2026-09-19", beats:[
      { t:"01:08:20", d:4, cap:"陳怡如推門出來，走到垃圾桶旁邊點菸。", m:{ chenC:[52,98,"walk1",-1,108,98] } },
      { t:"01:12:00", d:4, cap:"她一直站在同一個地方，右手夾著菸，左手滑手機。", m:{ chenC:[52,98,"smoke",1] } },
      { t:"01:19:10", d:4, cap:"她把菸蒂丟進鐵罐，推門進去。", m:{ chenC:[108,98,"walk2",1,52,98] }, out:["chenC"] }
    ] },
    cctv_market: { scene:"n_lane", opt:{ cam:true }, cam:"夜市後巷 CAM", date:"2026-09-17", beats:[
      { t:"22:58:30", d:4, cap:"一個穿深色外套的男人走進後巷，站在電線桿旁邊，一直看手錶。", m:{ huangC:[84,98,"walk1",1,-20,98] } },
      { t:"23:02:10", d:4, cap:"一台黑色機車停下。騎士戴口罩，外套背後印著「夜貓」。", m:{ huangC:[84,98,"stand",1], sellerC:[118,98,"stand",-1,220,98] } },
      { t:"23:03:00", d:4, cap:"男人把一個信封遞過去，騎士給他一個很小的東西。", m:{ huangC:[96,98,"hold",1,84,98], sellerC:[114,98,"hold",-1] } },
      { t:"23:04:20", d:4, cap:"機車離開。男人站了一分鐘才轉身——路燈照到他的臉：黃啟文。", m:{ huangC:[96,98,"stand",-1], sellerC:[230,98,"walk1",1,114,98] }, out:["sellerC"] }
    ] }
  };
  Object.values(ANIM).forEach(A => { if (A.beats.some(b => b.s)) A.opt = Object.assign({}, A.opt || {}, { seq:A.beats.map(b => b.s || {}), ds:A.beats.map(b => b.d) }); });
  [...EP13.cctv, ...EP13.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案 ---------- */
  const RB = [
    { t:"00:50:00", d:5, cap:"00:50，黃啟文端著一盤「招待」的水果從門口走進 808。阿凱坐在沙發上講電話，臉朝另一邊。", s:{ body:false, tv:true }, m:{ kaiC:[60,66,"sit+phone",-1], huangC:[116,92,"hold",-1,190,98] } },
    { t:"00:51:10", d:5, cap:"他彎腰把水果盤放在桌上，右手順勢把一個夾鏈袋塞進菸盒最外面那一格。", s:{ body:false, tv:true }, m:{ kaiC:[60,66,"sit+phone",-1], huangC:[104,92,"kneel",-1,116,92] } },
    { t:"00:52:00", d:3.5, cap:"不到兩分鐘，他走出去，把門帶上。", s:{ body:false, tv:true }, m:{ kaiC:[60,66,"sit+phone",-1], huangC:[195,98,"walk1",1,104,92] }, out:["huangC"] },
    { t:"01:05:00", d:5, cap:"01:05，阿凱伸手從菸盒最外面拿出一包，用指甲撕開，吸了。他以為那是他自己的貨。", s:{ body:false, tv:true }, m:{ kaiC:[66,66,"sit+hold",1] }, out:["kaiC"] },
    { t:"01:07:00", d:4, cap:"幾分鐘後，他倒在沙發上。電視繼續唱下一首。", s:{ body:true, tv:true } },
    { t:"01:12:04", d:4.5, cap:"01:12，櫃台。黃啟文用店長帳號，把 808 鎖成「勿擾」。門外的燈變紅了。", s:{ body:true, tv:true } },
    { t:"01:30:00", d:4.5, cap:"01:30，小龍送滷味到門口，敲了兩次。紅燈亮著——店長的規矩：紅燈不能進去。", s:{ body:true, tv:true } },
    { t:"02:40:00", d:4, cap:"02:40，打烊。黃啟文用總卡開門走進來。", s:{ body:true, tv:true }, m:{ huangC:[160,98,"walk1",-1,195,98] } },
    { t:"02:40:20", d:4.5, cap:"他沒有先看沙發上的人，而是先伸手關掉了電視。", s:{ body:true, tv:false }, m:{ huangC:[160,98,"point",1] } }
  ];
  EP13.court = {
    title: "金曲 KTV・808 門口・9 月 20 日中午", scene: "k_hall",
    who: ph => ["huang","man","chen","long","liang","hua"],
    open: ph => "11:50，金曲 KTV 的走廊。808 的門開著，點歌機的電源線繞得整整齊齊。黃啟文坐在門口的地上，小曼站在走廊另一頭。葉晴看了一下手錶。",
    kindLine: {
      overdose: "阿凱是自己吸毒過量死的。",
      murder: "阿凱不是自己吸過頭。有人讓他吸到了會死的東西。",
      suicide: "阿凱吵完架，自己鎖上門尋死。"
    },
    murmur: [ "（小曼咬著嘴唇，指甲又斷了一根。）", "（小龍一直看著那台推車。）", "（黃啟文抬起頭，看著天花板的燈。）" ],
    confess: {
      huang: [ "我只放了一包。我想說……他吸了，睡過頭，錯過中午，就好了。", "……不是。我查過。我知道那一包會怎樣。我只是不想聽到自己這樣說。", "01:12，我站在櫃台前面，按下去的時候，我想到的是我爸。" ]
    },
    cornered: { huang: "這間店是我爸的命。他要拿走，我能怎麼辦？" },
    deny: {
      man: "我只是打了他一巴掌……",
      chen: "我真的只是去抽菸……",
      long: "我有敲門……我敲了兩次……",
      liang: "我拿的錢，我會還……",
      hua: "我說了，我一點以前就走了。"
    },
    replayText: "9 月 19 日凌晨 00:50，金曲 KTV 808。店長端著一盤招待的水果走進來——",
    replay: { scene:"k_808", opt:{ seq:RB.map(b => b.s), ds:RB.map(b => b.d) }, clean:true, cam:"案發經過重現", date:"2026-09-19", beats:RB },
    endGood: "12:00，葉晴在移送書上寫下「殺人」兩個字。\n黃啟文被帶走的時候，經過櫃台，看了一眼那張開幕照片。他沒有停下來。\n小曼站在 808 門口，把那張學費收據折好，說她會寄去台中。",
    endBad: "12:00，案子以「吸毒過量」結案。\n十月一號，金曲 KTV 換了鎖。招牌拆下來的那天，黃啟文站在對面看了很久。\n夜市後巷的電線桿上，又多了一張黑貓貼紙。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[13] && ARC_INTER[13].after) EP13.after = Object.assign({}, ARC_INTER[13].after, { scene:"hospital" });

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP13.outScenes = ["k_back","n_lane","n_stall"];
  EP13.fac = { ktv:["#2a1e34","#ff5ab4"], police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], morgue:["#d8e0e0","#5a7a8a"], nightmkt:["#c8c0b0","#c83a2a"], arcade:["#1a1424","#e8c040"], huanghome:["#e8e0d0","#8a6a4a"] };
  EP13.setting = { ktv:"city", police:"city", lab:"city", morgue:"city", nightmkt:"town", arcade:"city", huanghome:"town" };
  const SKY13 = [ ["#0a0f1c","#24304a","#2a3040","#323a4a",0,0], ["#8ab8e0","#e8eef4","#4a6070","#56707a",0,0], ["#9ac0e0","#f0e8d8","#4a6070","#56707a",0,0] ];
  EP13.worldSky = ph => SKY13[Math.min(ph || 0, SKY13.length - 1)];
  EP13.roomDesc = {
    kfront:"金曲 KTV 的櫃台。霓虹燈有一半壞了。", khall:"包廂走廊。808 在最裡面。", k808:"808 包廂。最裡面那間，旁邊是倉庫。", k805:"805 包廂。生日氣球還掛著。",
    koffice:"店長辦公室。很小，牆角有一張摺疊床。", kback:"KTV 的後門和後巷。", pdesk:"澄港市刑大。", lab:"鑑識中心。", mroom:"法醫室。收音機在放老歌。",
    nstall:"港口夜市的鹽酥雞攤。白天沒開。", nlane:"夜市後面的小巷。", aroom:"金龍遊藝場。到處都是電子音效。", hliving:"黃家的客廳，在 KTV 後面的老公寓三樓。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police" };
  const EMT = { skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#e8763a", bottom:"#2a2a30" };
  EP13.world = {};
  EP13.locations.forEach(l => { EP13.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP13.world.ktv, {
    extras: [
      { id:"cop13", name:"轄區員警", phase:0, until:0, x:RX(1) + 40, L:COP, pose:"stand", facing:1, lines:[
        "02:55 我們到的時候，救護人員已經判定死亡了。門是店長用總卡開的。", "805 的客人走了一半，我們請兩個回來，在 805 等你們。" ] },
      { id:"emt13", name:"救護員", phase:0, until:0, x:RX(0) + 60, L:EMT, pose:"stand", facing:-1, lines:[
        "我們 02:51 到，已經沒有呼吸心跳了，身體也開始涼了。", "如果早一個多小時……我們車上有解毒劑。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長，死者鄭凱文，大家叫他阿凱，在中正路一帶賣毒品。808 是他固定的包廂。", "小吳"),
      say("wu", "店長說打烊的時候門鎖在「勿擾」，敲不開，用總卡開門才發現。桌上有毒品。", "小吳"),
      say("wu", "外面已經有人在傳，說是他女朋友害的。一段吵架的影片在群組裡轉來轉去。", "小吳"),
      say("you", "門鎖著、桌上有毒品、還有一段吵架的影片。每一樣都很好懂。……先看看。", "你"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳")
    ]
  });
  EP13.mapPos = { ktv:[110,50,"u"], police:[150,90,"r"], lab:[176,78,"d"], morgue:[186,100,"r"], nightmkt:[50,96,"d"], arcade:[70,40,"l"], huanghome:[128,30,"u"] };
  EP13.mapRoads = [["ktv","police"],["police","lab"],["lab","morgue"],["ktv","nightmkt"],["ktv","arcade"],["ktv","huanghome"],["police","nightmkt"]];
  EP13.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 40; x < 200; x += 8) for (let y = 20; y < 110; y += 7){ R(x, y, 6, 5, "#c8c0b0"); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, "#b0a898"); }
    R(0, 112, 240, 23, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 113 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");
    R(40, 98, 30, 8, "#c83a2a"); for (let k = 0; k < 5; k++) R(42 + k * 6, 100, 3, 3, "#ffe07a");   // 夜市
    R(104, 44, 12, 8, "#2a1e34"); R(106, 45, 8, 2, "#ff5ab4");   // KTV
  };
})();
