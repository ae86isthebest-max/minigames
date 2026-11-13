/* =========================================================
   第 17 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP17.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i] = beatAt(o.t || 0, o.ds); return (o.seq || [])[i] || {}; };
  const progOf = o => o.ds ? beatAt(o.t || 0, o.ds)[1] : 1;
  const lerpV = (v, p) => Array.isArray(v) ? v[0] + (v[1] - v[0]) * p : v;
  const cam = (x, y) => { R(x, y, 10, 5, "#2a2a2e"); R(x + 7, y + 1, 3, 3, "#4a4a52"); P(x + 1, y + 1, "#e83a3a"); };
  const lantern = (x, y, glow) => { R(x, y, 6, 8, "#e83a2a"); R(x + 1, y - 1, 4, 1, "#c8a040"); R(x + 1, y + 8, 4, 1, "#c8a040"); R(x + 2, y + 9, 1, 2, "#e8c040"); R(x + 1, y + 2, 4, 1, "#c82a1a"); if (glow) dither(x - 3, y - 2, 12, 12, "#ffb04a22", 2); };
  // 神轎：x＝轎子中央；轎槓在肩膀的高度（站在 y=94 的人）
  const sedan = (x) => {
    R(x - 26, 72, 52, 2, "#6a3a1a"); R(x - 26, 72, 52, 1, "#8a5a2a");   // 轎槓
    R(x - 8, 52, 16, 20, "#c8302a"); R(x - 6, 56, 12, 12, "#e8c040"); R(x - 4, 58, 8, 8, "#c8302a"); P(x, 61, "#ffe07a");   // 轎身、前面的簾
    R(x - 10, 48, 20, 4, "#e8c040"); R(x - 12, 47, 4, 2, "#e8c040"); R(x + 8, 47, 4, 2, "#e8c040"); R(x - 2, 43, 4, 5, "#e8c040"); P(x, 42, "#ffe07a");   // 轎頂
    R(x - 8, 70, 16, 2, "#8a2a1a"); for (let k = 0; k < 3; k++) R(x - 6 + k * 5, 52, 2, 2, "#ffe07a");
  };

  /* ---------- 場景：天后宮 ---------- */
  // 廟埕：左邊阿月姨的麵攤、後巷口、炮組的桌子、直播的腳架；中間廟門；右邊服務台、金爐
  SC.c17_square = (o) => { o = Object.assign({}, o, stOf(o));
    const night = !!o.night, p = progOf(o);
    R(0, 0, W, 34, night ? "#0c1020" : "#a8c8e0"); if (!night) dither(0, 20, W, 14, "#c8dce8", 3); else for (let k = 0; k < 8; k++) P((k * 37 + 11) % W, 3 + (k * 13) % 20, "#8a8aa0");
    R(0, 24, W, 52, night ? "#3a2a2a" : "#b8a898"); for (let x = 0; x < W; x += 16) R(x, 24, 1, 52, night ? "#2e2222" : "#a89888");   // 兩邊的老房子
    // 阿月姨的麵攤（最左邊）
    R(0, 46, 26, 4, "#c84a4a"); for (let k = 0; k < 4; k++) R(1 + k * 7, 50, 3, 2, "#e8e0d0");
    R(2, 62, 22, 14, "#c8c0b0"); R(2, 62, 22, 2, "#e8e4d8"); R(4, 66, 18, 1, "#a8a090"); R(4, 74, 3, 2, INK); R(19, 74, 3, 2, INK);
    R(4, 56, 8, 6, "#8a8a8e"); R(4, 55, 8, 1, "#aaaaae"); dither(3, 48, 10, 8, night ? "#e8e8f044" : "#f4f4f066", 2);   // 湯鍋
    R(14, 58, 6, 4, "#f4f4f0"); R(15, 59, 4, 2, "#2a3a2a"); P(16, 60, "#6ae86a");   // 計時器
    txt("麵", 7, 72, "#8a2a2a", "5px sans-serif");
    // 後巷口
    R(27, 30, 12, 46, night ? "#0e0c10" : "#4a3e3a"); R(27, 30, 12, 2, night ? "#2a2020" : "#6a5a54"); R(28, 34, 10, 6, "#f4f0e0"); txt("後巷", 28, 39, "#8a2a2a", "4px sans-serif");
    // 炮組的桌子
    R(42, 64, 20, 3, "#8a6a4a"); R(43, 67, 2, 9, "#6a4a2a"); R(59, 67, 2, 9, "#6a4a2a"); R(44, 60, 14, 4, "#f4f0e0"); for (let k = 0; k < 3; k++) R(45, 61 + k, 10 - k * 2, 1, "#8a8a8a");
    R(46, 69, 10, 7, "#c83a2a"); R(46, 69, 10, 1, "#e8c040"); txt("炮", 48, 75, "#ffe07a", "5px sans-serif");
    // 直播的腳架
    if (o.tripod) { R(66, 54, 1, 30, "#2a2a2e"); R(62, 84, 1, 1, "#2a2a2e"); for (let k = 0; k < 8; k++) { P(66 - k * 0.5 | 0, 76 + k, "#2a2a2e"); P(66 + k * 0.5 | 0, 76 + k, "#2a2a2e"); } R(62, 49, 9, 5, "#1a1a1e"); P(70, 50, "#e83a3a"); R(70, 50, 2, 3, "#3a3a4a"); }
    // 廟門（三川門）
    R(72, 28, 56, 48, "#a83a2a"); R(66, 22, 68, 6, "#3a2a2a"); R(60, 18, 10, 4, "#3a2a2a"); R(130, 18, 10, 4, "#3a2a2a"); R(58, 16, 4, 2, "#3a2a2a"); R(138, 16, 4, 2, "#3a2a2a"); R(80, 15, 40, 3, "#c89a3a"); R(96, 11, 8, 4, "#c89a3a");
    R(72, 28, 4, 48, "#7a2a1a"); R(124, 28, 4, 48, "#7a2a1a");   // 柱子
    R(88, 32, 24, 9, "#2a2a2e"); txt("天后宮", 90, 39, "#e8c040", "6px sans-serif");
    R(88, 44, 24, 32, o.doorOpen === false ? "#5a2a1a" : (night ? "#e8a050" : "#4a2a1a")); R(99, 44, 2, 32, "#3a1a10");
    if (night && o.doorOpen !== false) dither(88, 44, 24, 32, "#ffd08a33", 2);
    for (let k = 0; k < 3; k++) { P(91, 50 + k * 8, "#e8c040"); P(108, 50 + k * 8, "#e8c040"); }
    R(79, 51, 8, 10, "#f4f0e0"); R(79, 51, 8, 1, "#e8e0c8"); for (let k = 0; k < 3; k++) R(80, 53 + k * 2, 6, 1, "#5a5a5a"); R(82, 59, 4, 2, "#e8e4d8");   // 廟門邊的傳單（撕掉一半）
    lantern(77, 34, night); lantern(117, 34, night);
    // 繩子上的小燈籠
    for (let x = 0; x < W; x += 12) { R(x, 24 + ((x / 12) % 2), 12, 1, "#5a4a3a"); if ((x / 12) % 2 === 0) { R(x + 4, 25, 3, 4, "#e83a2a"); if (night) dither(x + 2, 23, 7, 8, "#ffb04a22", 2); } }
    // 服務台
    R(132, 66, 18, 10, "#c83a2a"); R(132, 64, 18, 2, "#e8e0c8"); txt("服務台", 133, 74, "#ffe07a", "4px sans-serif");
    R(133, 58, 6, 6, "#3a7ac8"); R(134, 57, 4, 1, "#e8f4ff"); R(141, 60, 8, 4, "#f4e0a0"); R(142, 59, 6, 1, "#c8302a");
    // 金爐
    R(156, 48, 20, 28, "#5a4a3a"); R(154, 44, 24, 4, "#3a2a1a"); R(152, 43, 4, 2, "#3a2a1a"); R(176, 43, 4, 2, "#3a2a1a"); R(162, 30, 8, 14, "#4a3a2a"); R(161, 29, 10, 2, "#3a2a1a");
    const burn = night || o.burn; R(160, 58, 12, 10, burn ? "#e86a1a" : "#1a0e0a"); if (burn) { R(162, 60, 8, 6, "#ffb04a"); dither(158, 50, 16, 8, "#ffb04a33", 2); }
    dither(160, 8, 14, 22, (o.burn ? "#c8c8c8aa" : "#8a8a8a33"), o.burn ? 1 : 3);
    // 右邊的燈籠柱
    R(184, 30, 2, 46, "#5a4a3a"); lantern(182, 36, night);
    floor(76, night ? "#4a3a34" : "#8a7a6a", night ? "#42322c" : "#7a6a5a");
    // 地上的鞭炮紙
    if (!o.swept) { dither(0, 78, W, 30, "#c83a2a66", 3); dither(40, 86, 120, 10, "#e84a3a55", 2); } else dither(120, 92, 70, 12, "#c83a2a44", 3);
    // 廟門邊排著的黑布鞋
    if (o.shoes !== false) for (let k = 0; k < 6; k++) { R(99 + k * 4, 80, 3, 2, "#1a1a1a"); P(99 + k * 4, 80, "#f4f4f0"); }
    // 長串鞭炮（鋪在地上，點了以後從右往左燒）
    if (o.fire !== undefined && o.fire !== false) {
      const end = o.fire === true ? 40 : Math.round(160 - 120 * p);
      R(40, 90, Math.max(0, end - 40), 2, "#c83a2a"); for (let x = 42; x < end; x += 4) P(x, 89, "#e8c040");
      for (let k = 0; k < 6; k++) P(end + ((k * 7) % 9) - 4, 84 + ((k * 5) % 8), k % 2 ? "#ffe07a" : "#ffffff");
      dither(0, 34, W, 60, "#e8e8e866", 2); dither(40, 60, 130, 30, "#f4f4f055", 3);
    }
    if (o.smoke) dither(0, 40, W, 56, "#d8d8d844", 3);
    if (o.sedan !== undefined && o.sedan !== false) sedan(Math.round(lerpV(o.sedan, p)));
    if (o.tape) { R(0, 100, W, 2, "#e8c020"); for (let k = 0; k < 16; k++) R(k * 12 + 2, 100, 5, 2, INK); }
    if (o.after) { R(8, 50, 10, 1, "#ffe8a0"); dither(0, 44, 30, 30, "#ffe8a022", 2); }
  };

  // 正殿：左邊廟公的桌子和電腦（直播的錄影）、中間神龕和供桌、香油錢箱、籤筒、右邊捐款芳名錄
  SC.c17_hall = (o) => {
    R(0, 0, W, 76, "#8a2a1a"); for (let x = 0; x < W; x += 24) R(x, 0, 3, 76, "#6a1a10");
    R(70, 8, 52, 40, "#3a1a10"); R(74, 12, 44, 32, "#c89a3a"); R(88, 18, 16, 22, "#e8c060"); R(92, 22, 8, 10, "#3a2a1a"); R(93, 32, 6, 6, "#e83a2a");   // 神龕、媽祖
    R(60, 50, 72, 6, "#a83a1a"); R(64, 56, 64, 20, "#8a2a10");   // 供桌
    R(78, 44, 10, 6, "#a87a3a"); for (let k = 0; k < 4; k++) R(80 + k * 2, 38, 1, 6, "#c8a060"); dither(78, 26, 10, 12, "#c8c8c833", 3);   // 香爐
    R(110, 46, 8, 4, "#f4e0a0"); R(111, 45, 6, 1, "#c8302a");   // 供品
    R(96, 64, 16, 12, "#5a1a0a"); R(96, 64, 16, 2, "#e8c040"); R(100, 66, 8, 1, "#1a0a0a"); txt("香油", 98, 74, "#e8c040", "5px sans-serif");   // 香油錢箱
    cam(100, 2);
    // 廟公的桌子和電腦
    R(8, 66, 32, 3, "#6a4a2a"); R(10, 69, 2, 7, "#5a3a1a"); R(36, 69, 2, 7, "#5a3a1a");
    R(14, 52, 16, 11, "#1a1a1e"); R(15, 53, 14, 8, "#2a3a5a"); R(17, 55, 6, 4, "#c83a2a"); R(23, 56, 4, 3, "#e8e8e8"); R(20, 63, 4, 3, "#2a2a2e"); R(16, 64, 18, 2, "#3a3a3e");
    R(30, 60, 6, 6, "#e8e0c8"); R(31, 61, 4, 1, "#5a5a5a");
    // 籤筒
    R(136, 60, 12, 12, "#a87a3a"); R(136, 60, 12, 1, "#c89a5a"); for (let k = 0; k < 5; k++) R(137 + k * 2, 54, 1, 6, "#c8a060"); R(134, 72, 16, 4, "#6a4a2a");
    // 捐款芳名錄
    R(150, 30, 20, 26, "#e83a2a"); for (let k = 0; k < 6; k++) R(152 + k * 3, 33, 1, 20 - (k % 3) * 3, "#2a1a1a");
    lantern(8, 6, true); lantern(178, 6, true);
    floor(76, "#8a7a6a", "#7a6a5a");
    R(60, 78, 72, 2, "#a83a2a");   // 拜墊
  };

  // 後殿辦公室：門、拖鞋、帳冊櫃、匾額、辦公桌、主委的椅子、窗戶、保險箱；紅地毯
  SC.c17_office = (o) => { o = Object.assign({}, o, stOf(o));
    wall(78, "#e8dcc4", false); R(0, 72, W, 6, "#c8b89c");
    // 通走廊的門
    R(4, 30, 16, 48, "#6a3a1a"); R(6, 32, 12, 44, "#8a4a2a"); P(17, 54, "#e8c040"); R(4, 30, 16, 1, "#4a2a10");
    R(22, 40, 18, 7, "#f4f0e0"); for (let k = 0; k < 4; k++) R(24 + k * 4, 42, 3, 3, "#8a2a2a");   // 「入內請脫鞋」
    // 帳冊櫃
    R(40, 24, 30, 34, "#6a4a2a"); R(42, 26, 26, 30, "#c8d8e0"); R(42, 40, 26, 1, "#6a4a2a");
    for (let k = 0; k < 6; k++) { const empty = o.gap !== false && k >= 3; R(43 + k * 4, 28, 3, 11, empty ? "#a8b8c0" : "#2a5ab8"); if (!empty) P(44 + k * 4, 30, "#e8e8e8"); }
    for (let k = 0; k < 5; k++) R(43 + k * 5, 43, 4, 12, ["#8a6a4a","#5a7a5a","#8a6a4a","#6a5a7a","#8a6a4a"][k]);
    dither(42, 26, 26, 30, "#ffffff22", 3);
    // 匾額
    R(80, 12, 40, 11, "#3a1a10"); R(81, 13, 38, 9, "#5a2a1a"); txt("為善最樂", 84, 20, "#e8c040", "6px sans-serif");
    // 窗戶
    PR.windowBox(132, 22, 16, 22, o.flash ? "#fff4d0" : (o.night ? "#3a2030" : "#c8d8e0")); if (o.night && !o.flash) { R(136, 30, 4, 6, "#e83a2a"); dither(132, 22, 16, 22, "#ffb04a22", 2); }
    if (o.flash) dither(110, 18, 50, 40, "#fff4d044", 2);
    // 辦公桌（主委坐在桌子右邊）
    R(70, 60, 36, 4, "#7a4a2a"); R(72, 64, 32, 12, "#6a3a1a"); R(86, 66, 10, 4, "#5a2a10"); P(91, 68, "#e8c040"); R(72, 76, 3, 2, "#4a2a10"); R(101, 76, 3, 2, "#4a2a10");
    R(85, 55, 10, 5, "#f4f0e0"); R(85, 55, 10, 1, "#c83a2a"); R(86, 57, 3, 1, "#c83a2a"); R(89, 58, 5, 1, "#2a2a2a");   // 桌曆
    R(74, 56, 8, 4, "#3a3a3e"); R(75, 55, 6, 1, "#5a5a5e");   // 電話
    if (o.ledgers) { R(94, 54, 10, 6, "#2a5ab8"); R(95, 53, 8, 1, "#3a6ac8"); R(96, 56, 6, 1, "#e8e8e8"); } else R(94, 58, 10, 2, "#8a5a3a");   // 帳本（不見了：桌墊壓平的一塊）
    // 主委的椅子
    R(106, 70, 14, 3, "#5a2a10"); R(118, 54, 3, 22, "#5a2a10"); R(107, 73, 2, 5, "#4a2a10"); R(117, 73, 2, 5, "#4a2a10");
    // 保險箱
    R(150, 56, 22, 24, "#4a4a4e"); R(151, 57, 20, 22, "#3a3a3e");
    if (o.safeOpen) { R(152, 58, 18, 20, "#1a1a1e"); R(152, 66, 18, 1, "#5a5a5e"); R(154, 72, 8, 5, "#6aa85a"); R(146, 56, 5, 24, "#5a5a5e"); R(146, 66, 2, 3, "#c8c8c8"); }
    else { R(158, 64, 6, 6, "#8a8a8e"); P(160, 66, INK); R(166, 66, 2, 6, "#c8c8c8"); }
    // 紅地毯
    floor(78, "#a02a2a", "#8a2222"); dither(0, 78, W, 30, "#7a1a1a55", 3); for (let x = 22; x < W; x += 3) P(x, 79, "#c84a3a");
    for (let k = 0; k < 4; k++) { R(22 + k * 5, 82, 4, 2, ["#3a6ac8","#3a6ac8","#e8763a","#3a6ac8"][k]); }   // 門口一排拖鞋
    if (o.tea) { R(24, 89, 4, 3, "#f4f0e0"); dither(22, 88, 12, 5, "#8a6a3a88", 2); }
    if (o.body) PR.person(112, 92, { age:"old", skin:"#d0b090", hair:"#c8c8c0", hairStyle:"balding", top:"#e8e4d8", coat:"#5a3a2a", bottom:"#3a3a40", glasses:true, blink:true }, 1.15, -1, "sit");
    if (o.body) { R(110, 74, 3, 3, "#7a1a1a"); R(109, 77, 4, 2, "#6a1a1a"); }
    if (o.tape) { R(0, 102, W, 2, "#e8c020"); for (let k = 0; k < 16; k++) R(k * 12 + 2, 102, 5, 2, INK); }
  };

  // 後巷：後殿的紅磚後牆、側門、轉角；地上都是鞭炮紙
  SC.c17_alley = (o) => { o = Object.assign({}, o, stOf(o));
    const night = !!o.night, p = progOf(o);
    R(0, 0, W, 20, night ? "#0c1020" : "#a8c8e0");
    R(0, 14, 162, 6, "#3a2a2a"); R(0, 20, 162, 66, night ? "#5a2a20" : "#9a4a3a"); for (let y = 24; y < 86; y += 5) R(0, y, 162, 1, night ? "#4a2018" : "#8a3a2a"); for (let y = 21; y < 86; y += 10) for (let x = (y % 20 ? 6 : 0); x < 162; x += 12) R(x, y, 1, 4, night ? "#4a2018" : "#8a3a2a");
    // 水塔、腳踏車
    R(10, 42, 22, 26, "#8a9aa8"); R(10, 42, 22, 3, "#a8b8c4"); R(14, 68, 2, 18, "#5a5a5e"); R(26, 68, 2, 18, "#5a5a5e");
    R(42, 78, 8, 8, "#2a2a2e"); R(43, 79, 6, 6, night ? "#5a2a20" : "#9a4a3a"); R(58, 78, 8, 8, "#2a2a2e"); R(59, 79, 6, 6, night ? "#5a2a20" : "#9a4a3a"); R(46, 74, 16, 2, "#3a6ac8"); R(54, 70, 2, 6, "#3a6ac8"); R(52, 70, 6, 1, "#2a2a2e");
    // 側門
    R(68, 38, 22, 48, "#3a1a10"); R(70, 40, 18, 46, "#6a3a1a"); R(78, 40, 1, 46, "#4a2a10"); P(76, 62, "#e8c040"); R(70, 40, 18, 1, "#8a4a2a");
    if (o.gap !== false) { R(88, 40, 1, 46, night ? "#0a0808" : "#1a1010"); R(87, 40, 1, 46, "#5a2a14"); }
    // 冷氣、水管
    R(104, 30, 18, 12, "#c8ccd0"); for (let k = 0; k < 3; k++) R(106, 32 + k * 3, 14, 1, "#8a8e92"); R(126, 20, 2, 66, "#7a7a7e");
    // 轉角
    R(162, 14, 30, 72, night ? "#3a1a14" : "#6a2e22"); R(162, 14, 2, 72, night ? "#2a120c" : "#4a1e16"); for (let k = 0; k < 4; k++) R(164 + k * 6, 66 + (k % 2) * 4, 4, 1, "#e8e0d0");
    floor(86, night ? "#3a3634" : "#7a7672", night ? "#34302e" : "#6a6662");
    dither(0, 86, 162, 22, "#c83a2a66", 3); dither(62, 86, 40, 8, "#e84a3a77", 2);
    R(121, 88, 6, 3, "#c8d8e8"); R(127, 89, 2, 1, "#3a7ac8");   // 空瓶
    R(140, 96, 16, 2, "#2a2a2e");   // 水溝蓋
    if (o.sedan !== undefined && o.sedan !== false) sedan(Math.round(lerpV(o.sedan, p)));
    if (o.smoke) dither(0, 20, W, 70, "#d8d8d866", 2);
    if (o.tape) { R(60, 92, 40, 2, "#e8c020"); for (let k = 0; k < 4; k++) R(62 + k * 10, 92, 5, 2, INK); }
  };

  // 北港宮：綠色柱子的正殿，左邊折疊桌上的筆電，右邊牆上的舊照片
  SC.c17_beigang = (o) => {
    R(0, 0, W, 76, "#7a2a1a"); for (let x = 0; x < W; x += 30) R(x, 0, 6, 76, "#2a5a4a");
    R(76, 10, 40, 36, "#2a1a10"); R(80, 14, 32, 28, "#c89a3a"); R(90, 18, 12, 20, "#e8c060"); R(93, 22, 6, 9, "#3a2a1a");   // 神龕
    R(66, 48, 60, 6, "#2a5a4a"); R(70, 54, 52, 22, "#1e4a3a");   // 供桌
    R(82, 8, 28, 6, "#1e4a3a"); txt("北港宮", 85, 13, "#e8c040", "5px sans-serif");
    // 折疊桌、筆電
    R(24, 70, 32, 2, "#c8c8c8"); R(26, 72, 1, 4, "#8a8a8a"); R(53, 72, 1, 4, "#8a8a8a"); R(30, 62, 20, 8, "#1a1a1e"); R(31, 63, 18, 6, "#3a6a5a"); R(34, 64, 6, 4, "#e8c040"); R(28, 69, 24, 1, "#3a3a3e");
    // 鼓
    R(150, 62, 18, 14, "#c83a2a"); R(150, 62, 18, 2, "#e8d8b8"); R(148, 74, 22, 2, "#5a3a1a");
    // 牆上的舊照片
    R(130, 40, 20, 22, "#5a3a1a"); R(132, 42, 16, 18, "#c8c0b0"); R(134, 48, 12, 2, "#5a5a5a"); R(135, 50, 2, 6, "#3a3a3a"); R(143, 50, 2, 6, "#3a3a3a"); R(138, 44, 4, 4, "#7a7a7a");
    lantern(8, 6, true); lantern(178, 6, true);
    floor(76, "#8a7a6a", "#7a6a5a");
  };

  /* ---------- 人物造型 ---------- */
  const CARRY = { top:"#f4f4f0", apron:"#e8c040", bottom:"#2a2a30", shoes:"#1a1a1a" };
  const LOOK = {
    jiaming: Object.assign({ skin:"#e8c8a8", hair:"#1e1a18", hairStyle:"short", glasses:true, mood:"worried" }, CARRY, { hello:"我、我一整晚都在扛轎……" }),
    de:      Object.assign({ skin:"#c08a60", hair:"#1a1410", hairStyle:"short" }, CARRY, { hello:"三十年了，沒有一次遶境出過這種事。" }),
    pao:     { skin:"#b8865a", hair:"#2a2220", hairStyle:"spiky", top:"#3a3a3e", bottom:"#3a4a5a", hat:"cap", capColor:"#c83a2a", hello:"耳朵還在響啦，你講大聲一點。" },
    yun:     { skin:"#f0d0b4", hair:"#2a2220", hairStyle:"pony", top:"#f4e0e8", bottom:"#3a4a6a", mood:"sad", hello:"我、我只是送茶進去……" },
    meiling: { skin:"#e8c0a0", hair:"#3a2a20", hairStyle:"bun", top:"#c83a2a", apron:"#f4f0e0", bottom:"#3a3a40", mood:"sad", hello:"平安餅還沒發完……我爸他……" },
    miao:    { age:"old", skin:"#d8b08a", hair:"#d8d8d0", hairStyle:"bald", top:"#5a4a7a", bottom:"#3a3a40", hello:"媽祖在看。" },
    ayue:    { hello:"欸，你們吃了沒？今晚的麵不用錢。" },
    he:      { hello:"警察先生，照片要不要？" },
    cai:     { age:"old", skin:"#d0a07a", hair:"#d8d8d0", hairStyle:"short", top:"#2a5a4a", bottom:"#3a3a40", hello:"我知道你們為什麼來。" },
    qian:    { hello:"點三八。很久沒看到了。" },
    xu:      { hello:"不要踩地毯。" },
    wu:      { hello:"學長，我的耳朵到現在還嗡嗡叫……" },
    ye:      { hello:"彈道報告呢？" },
    zhou:    { hello:"遶境的晚上……媒體會很難看。" }
  };
  ["ayue","he","qian","xu","wu","ye","zhou"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.ayue.top) Object.assign(LOOK.ayue, { age:"old", skin:"#d8a880", hair:"#4a4440", hairStyle:"bob", top:"#c84a4a", apron:"#e8e0cc", bottom:"#3a3a44" });
  if (!LOOK.he.top) Object.assign(LOOK.he, { skin:"#e0b48c", hair:"#3a2a20", hairStyle:"short", top:"#7a8a5a", bottom:"#3a4a6a", hat:"cap", capColor:"#2a3a5a" });
  if (!LOOK.xu.top) Object.assign(LOOK.xu, { skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" });
  if (!LOOK.wu.top) Object.assign(LOOK.wu, { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050", glasses:true });
  if (!LOOK.qian.top) Object.assign(LOOK.qian, { age:"old", skin:"#e0b48c", hair:"#b8b8b0", hairStyle:"balding", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#2a2a30", glasses:true });
  if (!LOOK.ye.top) Object.assign(LOOK.ye, { skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"pony", top:"#f4f4f0", coat:"#6a6e74", bottom:"#6a6e74", skirt:true });
  if (!LOOK.zhou.top) Object.assign(LOOK.zhou, { age:"old", skin:"#d8a880", hair:"#6a6a66", hairStyle:"slick", top:"#e9e4da", coat:"#62666e", bottom:"#2a2f3a", tie:"#3a4a6a" });
  const DAILY = {
    jiaming: [ { room:"tsquare", x:84, pose:"stand", doing:"站在廟門邊，轎班的黃背心濕透了，一直在擦眼鏡。" }, { room:"pdesk", x:40, pose:"sit", doing:"坐在刑大的長椅上，手機蓋在腿上。" }, { room:"pdesk", x:40, pose:"sit", doing:"坐在刑大，眼鏡放在旁邊，一直看著自己的手。" } ],
    de:      [ { room:"tsquare", x:180, pose:"cross", doing:"站在金爐旁邊，雙手抱胸，看著廟門。" }, { room:"tsquare", x:180, pose:"stand", doing:"在廟埕把轎槓一支一支擦乾淨。" } ],
    pao:     [ { room:"tsquare", x:50, pose:"stand", doing:"站在炮組的桌子旁邊，手上、臉上都是黑灰。" }, { room:"tsquare", x:50, pose:"broom", doing:"在掃廟埕的鞭炮紙，掃了一大堆。" } ],
    yun:     [ { room:"tmain", x:130, pose:"cry", doing:"站在正殿的柱子旁邊，手上還拿著茶杯，一直發抖。" }, { room:"pdesk", x:160, pose:"stand", doing:"在刑大做筆錄，兩隻手握在一起。" } ],
    meiling: [ { room:"tsquare", x:146, pose:"stand", doing:"站在服務台後面，看著那盒平安餅。" }, { room:"tmain", x:130, pose:"kneel", doing:"跪在正殿的拜墊上，很久都沒有起來。" } ],
    miao:    [ { room:"tmain", x:44, pose:"stand", doing:"站在自己的桌子旁邊，嘴裡一直在念經。" }, { room:"tmain", x:44, pose:"broom", doing:"在掃正殿的地。" }, { room:"tmain", x:44, pose:"stand", doing:"在點香，點了三次才點著。" } ],
    ayue:    [ { room:"tsquare", x:14, pose:"stand", doing:"在麵攤後面，一碗一碗地煮麵給警察吃。" }, { room:"tsquare", x:14, pose:"stand", doing:"在麵攤滷蛋，眼睛一直往廟門看。" } ],
    he:      [ { room:"tsquare", x:66, pose:"cam", doing:"站在封鎖線外面，相機一直舉著。" }, { room:"talley", x:140, pose:"cam", doing:"在後巷拍牆上的白痕。" } ],
    cai:     [ null, { room:"bmain", x:96, pose:"stand", doing:"站在北港宮的神龕前面，手上捏著佛珠。" } ],
    qian:    [ null, { room:"mroom", x:90, pose:"stand", doing:"站在解剖台旁邊，用夾子夾著一顆變形的彈頭，看了很久。" } ],
    xu:      [ { room:"toffice", x:50, pose:"kneel", doing:"跪在地毯旁邊，用手電筒斜斜地照地上。" }, { x:40, pose:"read", doing:"在實驗台前面看報告。" } ],
    wu:      [ { room:"talley", x:40, pose:"kneel+cam", doing:"蹲在後巷拍地上的鞭炮紙。" }, { x:110, pose:"stand", doing:"戴著耳機，在電腦前面聽直播的錄音。" }, { room:"pdesk", x:80, pose:"read", doing:"抱著一疊剛到的調閱資料。" } ],
    ye:      [ null, { room:"pdesk", x:100, pose:"phone", doing:"站在窗邊講電話，聲音壓得很低。" }, { room:"pdesk", x:100, pose:"read", doing:"在看卷宗，一張一張對齊。" } ],
    zhou:    [ null, { room:"pdesk", x:140, pose:"stand", doing:"站在你的桌子旁邊，看了一下手錶。" }, { room:"pdesk", x:140, pose:"phone", doing:"走到門口講電話。" } ]
  };
  EP17.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP17.rooms = {
    temple: [
      { id:"tsquare", name:"廟埕", scene:"c17_square", opt:(ph) => ({ night:ph === 0, tripod:ph === 0, swept:ph > 0 }), details:[
        { id:"d17_lanterns", name:"小燈籠", hot:[0,22,60,8], text:"一整排紅色的小燈籠，掛在電線上，從廟門拉到巷口。有幾個被鞭炮炸破了，裡面的燈泡還亮著。" },
        { id:"d17_pot", name:"湯鍋", hot:[3,48,10,14], text:"大骨湯從傍晚滾到現在。阿月姨說，遶境的晚上，她都多熬一鍋，給扛轎的。" },
        { id:"d17_tripod", name:"腳架", hot:[60,48,12,36], phase:0, until:0, text:"直播的腳架還立著，鏡頭蓋已經蓋上了。腳架上貼著一張紙：「天后宮　直播專用　請勿移動」。" },
        { id:"d17_pole", name:"燈籠柱", hot:[180,30,10,46], text:"柱子上綁著一條紅布，寫著「合境平安」。紅布被鞭炮的煙燻黑了一半。" } ] },
      { id:"tmain", name:"正殿", scene:"c17_hall", details:[
        { id:"d17_shrine", name:"神龕", hot:[74,12,44,32], text:"媽祖的金身上披著遶境穿的新袍子，袍子的下襬沾了一點鞭炮的黑灰。" },
        { id:"d17_lots", name:"籤筒", hot:[134,52,16,22], text:"籤筒旁邊放著一本解籤的小冊子，翻到第四十九籤：「言語雖多不可從，風雲靜處未行龍。」" },
        { id:"d17_censer", name:"香爐", hot:[76,36,14,14], text:"香爐裡插滿了香，有一大半是今晚回宮的時候插的。香灰滿到快要溢出來。" } ] },
      { id:"toffice", name:"後殿辦公室", scene:"c17_office", opt:(ph) => ({ night:ph === 0, body:ph === 0, tape:ph === 0, safeOpen:true, tea:ph === 0 }), details:[
        { id:"d17_plaque", name:"匾額", hot:[80,12,40,11], text:"「為善最樂」，落款是「信徒　陳金水　敬獻　民國八十五年」。他當主委以前，就送了這塊匾。" },
        { id:"d17_window", name:"窗戶", hot:[132,22,16,22], text:"窗戶對著後巷。窗框上沾了一層薄薄的鞭炮灰。窗戶從裡面鎖著，鎖頭生鏽，很久沒有打開過。" },
        { id:"d17_door", name:"通走廊的門", hot:[4,30,16,46], text:"門後面是後殿的走廊，走廊的另一頭就是通後巷的側門。走廊沒有燈，只有神明燈的一點紅光。" },
        { id:"d17_phoneD", name:"桌上的電話", hot:[74,54,8,6], text:"一台老式的按鍵電話，旁邊的便條紙寫著：「銀行　王襄理　週一再打」。" } ] },
      { id:"talley", name:"後巷", scene:"c17_alley", opt:(ph) => ({ night:ph === 0, tape:ph === 0 }), details:[
        { id:"d17_tank", name:"水塔", hot:[10,42,22,26], text:"一個舊水塔，上面用紅漆寫著「天后宮　消防用水」。漆是新補的，主委每年遶境前都叫人補。" },
        { id:"d17_bike", name:"腳踏車", hot:[42,68,26,18], text:"一台藍色的腳踏車靠在牆邊，車籃裡放著一頂轎班的斗笠。阿德說是他兒子的，騎來廟裡幫忙。" },
        { id:"d17_ac", name:"冷氣", hot:[104,30,18,12], text:"冷氣的室外機，滴著水。下面的鞭炮紙被滴濕了一小塊。" },
        { id:"d17_scratch", name:"牆上的白痕", hot:[164,62,24,12], text:"轉角的牆上一道一道的白痕，最新的一道還有木屑——今晚轎槓撞的。" } ] }
    ],
    beigang: [ { id:"bmain", name:"北港宮正殿", scene:"c17_beigang", details:[
      { id:"d17_drum", name:"鼓", hot:[148,60,22,16], text:"一面很大的鼓，鼓皮上貼著一張紅紙：「遶境平安」。鼓棒放在旁邊，握的地方被磨得發亮。" },
      { id:"d17_bshrine", name:"北港宮的神龕", hot:[76,10,40,36], text:"神龕前面擺著一盤平安餅，跟天后宮的一模一樣——是同一間餅店做的。" } ] } ],
    police: [ { id:"pdesk", name:"澄港市刑大", scene:"police", details:[
      { id:"d17_coffee", name:"你桌上的咖啡", hot:[60,62,10,8], text:"小吳幫你買的咖啡，杯子上用奇異筆寫著「學長　加油」，還畫了一個媽祖。" } ] } ],
    lab: [ { id:"lab", name:"鑑識中心", scene:"lab", details:[
      { id:"d17_headset", name:"桌上的放大鏡", hot:[140,20,20,14], text:"放大鏡底下壓著一片藍色的焦紙，旁邊的標籤：「金爐　#1」。" } ] } ],
    morgue: [ { id:"mroom", name:"法醫室", scene:"m13_morgue", details:[
      { id:"d17_radio", name:"收音機", hot:[20,40,12,8], text:"收音機在放廟會的北管。老錢說：「他聽了一輩子，送他一段。」" } ] } ]
  };
  const PS = [["c17_office",{ night:true, body:true, tape:true, safeOpen:true, tea:true }],["police",{}],["police",{}]];
  EP17.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 監視器動畫（廟口直播） ---------- */
  const chenL = { age:"old", skin:"#d0b090", hair:"#c8c8c0", hairStyle:"balding", top:"#e8e4d8", coat:"#5a3a2a", bottom:"#3a3a40", glasses:true };
  const strip = L => { const o = Object.assign({}, L); delete o.hello; delete o.mood; return o; };
  EP17.looks = {
    jmC: strip(LOOK.jiaming), jmX: Object.assign(strip(LOOK.jiaming), { sweat:true, mood:"worried" }), deC: strip(LOOK.de), paoC: strip(LOOK.pao), yunC: strip(LOOK.yun), yunX: Object.assign(strip(LOOK.yun), { mood:"sad", tear:true }),
    meiC: strip(LOOK.meiling), ayueC: strip(LOOK.ayue),
    c1C: Object.assign({ skin:"#c89a70", hair:"#1a1410", hairStyle:"spiky" }, CARRY), c2C: Object.assign({ skin:"#d8a880", hair:"#2a2220", hairStyle:"short" }, CARRY),
    q1C: { age:"old", skin:"#d8a880", hair:"#d8d8d0", hairStyle:"short", top:"#5a6a8a", bottom:"#3a3a40" }, q2C: { age:"old", skin:"#e0b48c", hair:"#8a8a86", hairStyle:"bun", top:"#8a5a7a", bottom:"#3a3a40" },
    shadowC: { skin:"#8a8a8a", hair:"#3a3a3a", hairStyle:"short", top:"#c8c8c0", apron:"#a8a070", bottom:"#3a3a40" },
    chenC: chenL, chenX: Object.assign({}, chenL, { blink:true })
  };
  const SQ = { night:true, tripod:true, shoes:false, doorOpen:true };
  const ANIM = {
    cctv17_live: { scene:"c17_square", opt:SQ, cam:"天后宮　遶境直播", date:"2026-11-14", beats:[
      { t:"19:00:00", d:5, cap:"19:00，神轎出宮，往左邊離開廟埕。第二班的轎班走在旁邊。", st:{ sedan:[100,-40] }, m:{ c1C:[-58,94,"stand",-1,82,94], c2C:[-22,94,"stand",-1,118,94], deC:[-30,98,"stand",-1,104,98], jmC:[-50,98,"stand",-1,124,98], paoC:[50,94,"stand",1] }, out:["c1C","c2C","deC","jmC"] },
      { t:"19:30:10", d:3.5, cap:"19:30，林佳芸從服務台走進廟門。", st:{}, m:{ yunC:[100,88,"stand",-1,140,94] }, out:["yunC"] },
      { t:"19:32:20", d:3.5, join:true, cap:"兩分鐘後，她抱著一箱礦泉水出來，走回服務台。", st:{}, m:{ yunC:[138,94,"hold@box/#3a7ac8",1,100,88] } },
      { t:"20:05:00", d:4.5, cap:"20:05，陳美玲在服務台發平安餅，排隊的人排到廟門前。阿炮在炮組的桌子旁邊。", st:{}, m:{ meiC:[146,94,"give@paper/#f4e0a0",-1], q1C:[128,94,"stand",1], q2C:[114,94,"stand",1], yunC:[164,94,"stand",-1,138,94], ayueC:[14,94,"stand",1] } },
      { t:"20:14:00", d:4.5, cap:"20:14，阿炮把「迎轎」長串點著。", st:{ fire:0 }, m:{ paoC:[160,94,"kneel+reach@lighter",-1,50,94] } },
      { t:"20:14:20", d:4, join:true, cap:"整個畫面都是白煙，鞭炮一直響。阿炮一直站在廟埕中間。", st:{ fire:0.1 }, m:{ paoC:[96,94,"stand",-1,160,94] } },
      { t:"20:15:30", d:3.5, join:true, cap:"20:15，畫面最左邊，有一個人影從後巷口跑出來，往左邊跑掉。煙太大，看不清楚是誰。", st:{ fire:0.5 }, m:{ shadowC:[-20,94,"stand",-1,33,90], paoC:[96,94,"stand",-1] }, out:["shadowC"] },
      { t:"20:17:00", d:3, cap:"20:17，鞭炮停了。", st:{ smoke:true }, m:{ paoC:[96,94,"stand",-1] }, out:["q2C"] },
      { t:"20:40:00", d:5, cap:"20:40，神轎回宮。", st:{ sedan:[-40,100] }, m:{ jmC:[82,94,"stand",1,-58,94], c2C:[118,94,"stand",1,-22,94], deC:[60,98,"stand",1,-50,98], paoC:[50,94,"stand",1,96,94] } },
      { t:"20:42:30", d:5, cap:"大家圍到金爐旁邊燒金紙，煙很大。", st:{ burn:true }, m:{ jmC:[150,94,["carry@paper","reach@paper","carry@paper","reach@paper"],1,82,94], deC:[186,94,["reach@paper","carry@paper","reach@paper"],-1,60,98], q1C:[132,96,"carry@paper",1], c2C:[110,94,"stand",1,118,94] }, out:["jmC","deC","c2C","q1C","q2C"] },
      { t:"21:05:00", d:4, cap:"21:05，林佳芸端著茶走進廟門。", st:{}, m:{ yunC:[100,88,"carry@cup",-1,140,94] }, out:["yunC"] },
      { t:"21:07:00", d:4, join:true, cap:"21:07，她跑出來，一直在哭。", st:{}, m:{ yunX:[120,96,"cry",1,100,88] } }
    ] }
  };
  Object.values(ANIM).forEach(A => { if (A.beats.some(b => b.st)) A.opt = Object.assign({}, A.opt || {}, { seq:A.beats.map(b => Object.assign({}, A.opt || {}, b.st || {})), ds:jds(A.beats) }); });
  [...EP17.cctv, ...EP17.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案 ---------- */
  const OF = { night:true, safeOpen:false, ledgers:true, gap:false };
  const RB = [
    { t:"18:40:00", d:5, cap:"11 月 14 日 18:40，陳金水把三年的帳冊攤在桌上，傳了一則 LINE 給姪子：「遶境結束，來辦公室，帳的事。」", st:OF, m:{ chenC:[112,92,"sit+phone",-1] } },
    { t:"20:05:00", d:5, cap:"20:05，陳家銘跟阿德說去喝水，離開轎班，從後巷走到後殿的側門。門閂，他白天就從裡面拉開了。", scene:"c17_alley", opt:{ night:true, gap:false }, m:{ jmC:[80,94,"door",-1,200,94] }, out:["jmC"] },
    { t:"20:10:00", d:5, cap:"20:10，他走進辦公室，沒有脫鞋。叔叔抬起頭：「你來了。」", st:OF, m:{ chenC:[112,92,"sit",-1], jmC:[60,94,"stand",1,12,94] } },
    { t:"20:14:00", d:4, cap:"20:14，廟埕的迎轎長串點著了。窗外一片白光，整座廟都在響。", st:Object.assign({}, OF, { flash:true }), m:{ chenC:[112,92,"sit",-1], jmC:[66,94,"stand",1] } },
    { t:"20:14:37", d:4.5, cap:"20:14:37，他舉起槍。三分鐘的鞭炮聲中間，多了一聲低低的「碰」。", st:Object.assign({}, OF, { flash:true }), m:{ chenX:[112,92,"sit",-1], jmC:[72,94,"aim@gun",1,66,94] }, out:["chenC"] },
    { t:"20:15:00", d:4.5, cap:"他用密碼打開保險箱，拿走那本藍色的總帳本。", st:{ night:true, flash:true, safeOpen:true, ledgers:false, gap:false }, m:{ chenX:[112,92,"sit",-1], jmC:[162,94,"kneel+hold@book/#2a5ab8",1,72,94,[[132,98]]] } },
    { t:"20:15:15", d:4, join:true, cap:"再從櫃子裡抽走三年的帳冊，從側門出去。", st:{ night:true, flash:true, safeOpen:true, ledgers:false, gap:true }, m:{ chenX:[112,92,"sit",-1], jmC:[12,94,"hold@book/#2a5ab8",-1,162,94,[[132,98],[56,94]]] }, out:["jmC"] },
    { t:"20:15:30", d:4.5, cap:"他抱著帳本從後巷口跑出來，撞了阿月姨一下，繞到後巷的另一頭。", scene:"c17_square", opt:{ night:true, fire:true, shoes:false }, m:{ ayueC:[14,94,"stand",1], jmX:[-24,94,"hold@book/#2a5ab8",-1,33,90] }, out:["jmX"] },
    { t:"20:16:00", d:5, cap:"20:16，他從轉角跑過來，把帳本塞在衣服裡，接過轎槓。阿德罵他：「你是去哪裡？」——「去喝水。」", scene:"c17_alley", opt:{ night:true, sedan:100, smoke:true }, m:{ deC:[66,94,"point",1], c1C:[122,94,"stand",-1], jmX:[82,94,"stand",1,200,94] } },
    { t:"20:42:30", d:5, cap:"20:40 神轎回宮。大家圍在金爐燒金紙，他把帳本一本一本塞進去。", scene:"c17_square", opt:{ night:true, burn:true, shoes:false }, m:{ jmX:[150,94,["reach@book/#2a5ab8","hold@book/#2a5ab8","reach@book/#2a5ab8"],1,110,94], deC:[186,94,"reach@paper",-1], q1C:[130,96,"carry@paper",1] } },
    { t:"21:05:00", d:5, cap:"21:05，林佳芸端著熱茶走進來。", st:{ night:true, safeOpen:true, ledgers:false, gap:true }, m:{ chenX:[112,92,"sit",-1], yunC:[60,94,"carry@cup",1,10,94] } }
  ];
  EP17.court = {
    title: "刑大偵訊室・11 月 16 日中午", scene: "police",
    who: ph => ["jiaming","de","pao","yun","meiling","cai"],
    open: ph => "11:50，刑大的偵訊室。陳家銘坐在桌子的一邊，眼鏡放在桌上。陳美玲坐在門邊，手上捏著一個紅紙包的平安餅。蔡清河站在走廊，佛珠撥了一圈又一圈。",
    kindLine: {
      suicide: "陳金水是自己開槍的。",
      murder: "陳金水不是自己開槍的。有人對他開了一槍。"
    },
    murmur: [ "（陳美玲把平安餅捏得更緊了。）", "（陳家銘把眼鏡拿起來，又放下。）", "（走廊上，蔡清河的佛珠停了一下。）" ],
    confess: {
      jiaming: [ "我想說贏回來就補回去。每一次都想說，下一把就贏回來了。", "他傳 LINE 給我，說帳的事。我知道他要報警。他說過，廟的錢是媽祖的錢，一塊都不能少。", "鞭炮的時間是我排的……我排了三年。我知道那三分鐘，什麼都聽不到。", "他抬頭看我，叫了我的名字。……他沒有站起來。他到最後都以為，我是來對帳的。" ]
    },
    cornered: { jiaming: "我只是……我只是想把帳補回去……" },
    deny: {
      de: "我在前面看路，我什麼都不知道……",
      pao: "鞭炮是我點的，可是我一直站在廟埕中間！",
      yun: "我只是送茶進去……",
      meiling: "那是我爸。你們懷疑我？",
      cai: "我說過了，我那天晚上在兩公里外。"
    },
    replayText: "11 月 14 日傍晚 18:40，天后宮的後殿辦公室。主委把三年的帳冊攤在桌上——",
    replay: { scene:"c17_office", opt:{ seq:RB.map(b => b.st || {}), ds:jds(RB) }, clean:true, cam:"案發經過重現", date:"2026-11-14", beats:RB },
    get endGood(){
      let s = "12:00，葉晴聲請羈押，法官准了。\n陳家銘被帶走的時候，經過廟埕。阿德和轎班的人站成一排，沒有人說話。\n下午，北港宮的蔡清河來上香，在後殿那張椅子前面站了很久。他說，明年的遶境，兩間廟一起走。\n廟公把那個寫著「阿爸」的平安餅，供在神桌上。";
      if (typeof ARC !== "undefined" && ARC.has && ARC.has("c_cover_zhou")) s += "\n晚上，黎光耀在走廊上攔住你：「周振邦今天打了三通電話到漁港派出所。他在查什麼？」你說不知道。他看了你很久，走了。";
      return s;
    },
    endBad: "12:00，證據不夠，葉晴沒有聲請羈押。\n隔天的報紙寫著：「遶境夜槍響　兩宮恩怨」。北港宮的大門，被人潑了紅漆。\n陳家銘還是每天去廟裡上班。香油錢的帳，他說他會補。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[17] && ARC_INTER[17].after) EP17.after = Object.assign({}, ARC_INTER[17].after, { scene:"c17_square", opt:{ night:true, after:true, swept:false, shoes:false, doorOpen:false } });

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP17.outScenes = ["c17_square","c17_alley"];
  EP17.fac = { temple:["#a83a2a","#e8c040"], police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], morgue:["#d8e0e0","#5a7a8a"], beigang:["#7a2a1a","#2a5a4a"] };
  EP17.setting = { temple:"town", police:"city", lab:"city", morgue:"city", beigang:"town" };
  const SKY17 = [ ["#0a0f1c","#24304a","#2a3040","#323a4a",0,0], ["#9ac0e0","#f0e8d8","#4a6070","#56707a",0,0], ["#a8c4dc","#eef0ec","#4a6070","#56707a",0,0] ];
  EP17.worldSky = ph => SKY17[Math.min(ph || 0, SKY17.length - 1)];
  EP17.roomDesc = {
    tsquare:"天后宮的廟埕。地上鋪滿了鞭炮紙，金爐還在冒煙。", tmain:"天后宮的正殿。香爐裡插滿了香。", toffice:"後殿的主委辦公室。鋪著一張老紅地毯。", talley:"後殿後面的小巷子，神轎每年都從這裡繞一圈。",
    bmain:"北港宮的正殿。", pdesk:"澄港市刑大。", lab:"鑑識中心。", mroom:"法醫室。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police" };
  const EMT = { skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#e8763a", bottom:"#2a2a30" };
  EP17.world = {};
  EP17.locations.forEach(l => { EP17.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP17.world.temple, {
    extras: [
      { id:"cop17", name:"轄區員警", phase:0, until:0, x:RX(3) + 54, L:COP, pose:"stand", facing:-1, lines:[
        "我們 21:10 到的。廟埕的人太多了，我們先把後殿和後巷拉起來。", "問了一圈，三百多個人，沒有一個說聽到槍聲。……那時候鞭炮放成那樣，誰聽得到。" ] },
      { id:"emt17", name:"救護員", phase:0, until:0, x:RX(1) + 64, L:EMT, pose:"stand", facing:-1, lines:[
        "21:14 到場。他坐在椅子上，胸口一個小洞，已經沒有呼吸心跳了。", "我們只量了脈搏，沒有搬動他。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長，死者陳金水，天后宮的主委。21:05 會計助理送茶到後殿，發現他坐在椅子上，胸口中槍。", "小吳"),
      say("wu", "今晚是遶境，廟埕上三百多個人。可是……沒有一個人說聽到槍聲。", "小吳"),
      say("wu", "外面已經在傳，是北港宮的人幹的。他們兩間廟為了遶境的路線吵了三個月。", "小吳"),
      say("you", "鞭炮放了一整晚。……先看看。", "你"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  EP17.mapPos = { temple:[70,74,"u"], police:[190,40,"r"], lab:[206,58,"d"], morgue:[214,80,"r"], beigang:[120,30,"u"] };
  EP17.mapRoads = [["temple","police"],["temple","beigang"],["police","lab"],["lab","morgue"],["beigang","police"]];
  EP17.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 20; x < 230; x += 8) for (let y = 14; y < 90; y += 7){ R(x, y, 6, 5, "#c8c0b0"); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, "#b0a898"); }
    R(0, 100, 240, 35, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 102 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");
    for (let k = 0; k < 4; k++) R(40 + k * 30, 96, 4, 8, "#7a7266");   // 碼頭
    R(62, 66, 16, 10, "#a83a2a"); R(60, 64, 20, 2, "#3a2a2a"); R(68, 62, 4, 2, "#e8c040");   // 天后宮
    R(112, 22, 14, 9, "#7a2a1a"); R(110, 20, 18, 2, "#2a5a4a");   // 北港宮
    for (let k = 0; k < 6; k++) R(80 + k * 6, 72, 3, 2, (Math.floor(t * 3) + k) % 2 ? "#e83a2a" : "#e8c040");   // 遶境的隊伍
  };
})();
