/* =========================================================
   第 34 集：場景、人物造型、監視器畫面、結案、走動畫面、地圖、開場
   沿用：一樓值班台（第 14 集 SC.e_lobby）、證物室前台和 C 區（第 33 集）、冰店門口（第 28 集）、冰店裡面（第 30 集）、舊碼頭（第 30 集）
   新畫的：三樓督察組會議室（c34_meet）、一樓收發室（c34_mail）、一樓食堂（c34_canteen）
   ========================================================= */
EP34.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, INK } = PR;
  const W = 192, H = 108;
  const SC = PX.SCENES;
  const floor = (y, c, l) => PR.floor(y, c, l);
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i, p] = beatAt(o.t || 0, o.ds); return Object.assign({ _p:p }, (o.seq || [])[i] || {}); };
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px sans-serif"; g.fillStyle = c; g.fillText(s, x, y); };
  const tube = (x, y, w) => { R(x, y, w, 2, "#f4f8f0"); dither(x - 4, y + 2, w + 8, 6, "#f4f8f022", 3); };
  const box = (x, y, w, h, c) => { R(x, y, w, h, c || "#b8925a"); R(x, y, w, 1, "#d8b27a"); R(x + (w >> 1), y, 1, h, "#9a7a48"); R(x + 2, y + 2, Math.min(4, w - 4), 2, "#f4f0e0"); };
  const clock = (x, y, hh, mm) => { R(x, y, 11, 11, "#f4f4f0"); R(x, y, 11, 1, "#5a5a5a"); R(x, y + 10, 11, 1, "#c8c8c0");
    const a = (hh % 12 + mm / 60) / 12 * Math.PI * 2, b = mm / 60 * Math.PI * 2;
    for (let k = 1; k <= 2; k++) P(x + 5 + Math.round(Math.sin(a) * k), y + 5 - Math.round(Math.cos(a) * k), INK);
    for (let k = 1; k <= 4; k++) P(x + 5 + Math.round(Math.sin(b) * k), y + 5 - Math.round(Math.cos(b) * k), INK); P(x + 5, y + 5, "#e83a3a"); };
  // 窗外：上午下雨，下午放晴
  const pane = (x, y, w, h, pm) => { R(x, y, w, h, pm ? "#a8d0ec" : "#8a98a8");
    if (pm){ R(x, y + h - 8, w, 8, "#8aa49a"); for (let i = x + 2; i < x + w - 6; i += 13) R(i, y + h - 12 - (i % 3) * 2, 8, 12 + (i % 3) * 2, "#9aa8ae"); R(x + 3, y + 3, Math.min(10, w - 6), 2, "#e8f4fa"); }
    else for (let k = 0; k < Math.floor(w * h / 26); k++) R(x + 1 + (k * 7) % (w - 2), y + 1 + (k * 11) % (h - 4), 1, 3, "#c8d4e0"); };

  /* ---------- 三樓・督察組會議室 ----------
     窗 x6–46；白板 x56–116（y10–44）；鐘 x124；傳真機和矮櫃 x138–162；門 x166–186。牆腳 y76。
     會議桌 x30–134，桌面 y59：報告 x38、影本 x54、灰色資料夾 x67、牛皮紙卷宗 x82、許知夏的電腦 x100、藍色的箱子 x118（下午才有）
     o.pm＝下午（百葉窗拉開一半、藍色的箱子、傳真機下面有紙）；o.usb＝電腦上插著隨身碟；o.done＝白板上的格子填好了（只在結案以後的重現用） */
  SC.c34_meet = (o) => { o = Object.assign({}, o, stOf(o)); const pm = !!o.pm;
    R(0, 0, W, 76, "#c9cdc6"); R(0, 0, W, 6, "#9aa09a"); tube(34, 6, 22); tube(112, 6, 22);
    R(0, 62, W, 14, "#b6bbb4"); R(0, 61, W, 1, "#9aa09a");
    // 窗戶和百葉窗
    R(5, 11, 42, 36, "#6a7480"); pane(7, 13, 38, 32, pm); R(26, 13, 1, 32, "#6a7480");
    { const bl = pm ? 27 : 39; for (let y = 13; y < bl; y += 3){ R(7, y, 38, 2, "#ece8d8"); R(7, y + 2, 38, 1, "#c4c0b0"); } R(7, bl, 38, 1, "#a8a494"); R(43, 13, 1, 30, "#d8d4c4"); P(43, 43, "#8a8a8a"); }
    R(4, 47, 44, 2, "#8a9098");
    // 白板：三個名字、四件事、十二個格子
    R(55, 9, 62, 36, "#8a8e92"); R(57, 11, 58, 32, "#f8f8f4"); R(57, 43, 58, 1, "#6a6e72"); R(60, 43, 4, 1, "#c83a2a"); R(66, 43, 4, 1, "#2a3a8a"); R(104, 42, 6, 2, "#5a5a5e");
    [74, 87, 100].forEach(x => R(x, 12, 1, 31, "#b8bcc0")); [19, 25, 31, 37].forEach(y => R(58, y, 56, 1, "#b8bcc0"));
    [75, 88, 101].forEach(x => { for (let i = 0; i < 3; i++) R(x + 1 + i * 4, 13, 3, 4, "#2a3a6a"); });
    PR.tiny("15", 59, 20, "#2a3a6a"); R(60, 27, 6, 1, "#2a3a6a"); R(60, 29, 4, 1, "#2a3a6a"); P(67, 28, "#2a3a6a"); PR.tiny("2/26", 58, 32, "#2a3a6a"); R(60, 39, 7, 3, "#3a6ac8"); R(61, 40, 3, 1, "#f8f8f4");
    if (o.done){ const T = [[1, 0, 1], [1, 0, 0], [1, 0, 0], [1, 1, 0]];
      T.forEach((row, r) => row.forEach((v, c) => { const cx = 80 + c * 13, cy = 21 + r * 6;
        if (v){ R(cx, cy, 3, 3, "#c83a2a"); P(cx + 1, cy + 1, "#f8f8f4"); } else { P(cx, cy, "#6a6e72"); P(cx + 2, cy, "#6a6e72"); P(cx + 1, cy + 1, "#6a6e72"); P(cx, cy + 2, "#6a6e72"); P(cx + 2, cy + 2, "#6a6e72"); } }));
      R(88, 15, 13, 1, "#c83a2a"); R(101, 15, 13, 1, "#c83a2a"); }
    clock(124, 8, o.hh !== undefined ? o.hh : pm ? 13 : 9, o.mm || 0);
    // 矮櫃、傳真機、掛在櫃子前面的收紙籃
    R(138, 54, 24, 22, "#7a8490"); R(138, 54, 24, 1, "#9aa4b0"); R(150, 63, 1, 13, "#5a6470"); R(147, 67, 2, 3, "#c8c8cc"); R(152, 67, 2, 3, "#c8c8cc");
    R(141, 46, 16, 8, "#d8dcd0"); R(141, 46, 16, 1, "#f0f4e8"); R(142, 47, 4, 6, "#3a3e46"); R(148, 48, 7, 2, "#2a3a2a"); P(149, 48, "#6ae86a"); for (let k = 0; k < 3; k++) R(148 + k * 3, 51, 2, 1, "#8a8e92");
    R(150, 43, 5, 3, "#f4f0e0"); R(151, 44, 3, 1, "#6a6a6a");   // 夾在上面的回條
    R(141, 56, 16, 1, "#3a4048"); R(141, 61, 16, 1, "#3a4048"); R(141, 56, 1, 6, "#3a4048"); R(156, 56, 1, 6, "#3a4048");
    if (pm){ R(142, 57, 14, 4, "#f4f0e0"); R(143, 58, 10, 1, "#6a6a6a"); R(143, 60, 7, 1, "#6a6a6a"); }
    // 門和門牌
    R(165, 21, 22, 55, "#6a7480"); R(167, 23, 18, 53, "#8a6a4a"); R(167, 23, 18, 1, "#a88a68"); R(171, 27, 10, 12, "#a8c4d4"); dither(171, 27, 10, 12, "#ffffff55", 2); R(169, 50, 2, 4, "#d8d8d8");
    R(162, 9, 28, 11, "#2a3a5a"); txt("督察組", 164, 18, "#f4f0e0", "8px sans-serif");
    // 會議桌
    R(30, 59, 104, 3, "#8a7a5a"); R(30, 59, 104, 1, "#a8987a"); R(32, 62, 100, 4, "#7a6a4a"); [33, 81, 128].forEach(x => R(x, 66, 3, 10, "#5a4a3a"));
    R(38, 56, 13, 3, "#f4f0e0"); R(38, 56, 13, 1, "#ffffff"); R(40, 57, 7, 1, "#6a6a6a"); P(48, 57, "#c83a2a");   // 指紋比對報告
    R(54, 55, 11, 4, "#c8dcf0"); R(55, 56, 9, 3, "#f4f0e0"); R(56, 57, 6, 1, "#3a5a9a");   // 影本（裝在透明夾裡）
    R(67, 52, 13, 7, "#8a9094"); R(67, 52, 13, 1, "#aab0b4"); R(70, 54, 5, 3, "#f4f0e0"); P(77, 56, "#5a5a5e");   // 灰色的資料夾
    R(82, 55, 12, 4, "#c8a070"); R(82, 55, 12, 1, "#e0b888"); R(84, 54, 8, 1, "#f4f0e0"); P(88, 57, "#8a3a2a");   // 牛皮紙卷宗
    R(100, 49, 14, 8, "#2a2e36"); R(101, 50, 12, 6, "#5a8ab8"); R(103, 52, 6, 1, "#c8d8e8"); R(103, 54, 4, 1, "#c8d8e8"); R(99, 57, 16, 2, "#8a9094"); if (o.usb) R(115, 57, 2, 2, "#c83a2a");   // 許知夏的電腦
    if (pm){ R(118, 51, 14, 8, "#3a5a9a"); R(117, 50, 16, 2, "#4a6ab0"); R(121, 54, 8, 3, "#f4f0e0"); R(122, 55, 5, 1, "#6a6a6a"); }   // 藍色的箱子
    else { R(120, 51, 4, 8, "#c8ccd0"); R(120, 51, 4, 1, "#e8ecf0"); R(126, 55, 3, 4, "#f4f0e0"); R(130, 55, 3, 4, "#f4f0e0"); }   // 保溫瓶和紙杯
    floor(76, "#6f7884", "#646d79");
  };

  /* ---------- 一樓・收發室 ----------
     櫃台 x4–46（桌面 y55，簽收簿 x17–30）；垃圾桶 x47–54；信箱牆 x55–130（每格 8×7，第 0611 號在 x84 y32）；包裹 x133–143；告示 x140–164；長椅 x146–186
     o.helmet＝長椅上放著安全帽和報紙 */
  SC.c34_mail = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 76, "#d6d0c0"); R(0, 0, W, 6, "#a8a290"); tube(22, 6, 20); tube(150, 6, 20);
    R(0, 64, W, 12, "#c4beac"); R(0, 63, W, 1, "#a8a290");
    R(6, 9, 32, 11, "#2a4a6a"); txt("收發室", 9, 18, "#f4f0e0", "8px sans-serif");
    // 櫃台後面的分信格
    R(6, 24, 40, 20, "#8a6a4a"); for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++){ R(8 + i * 7.6 | 0, 26 + j * 6, 6, 5, "#3a3028"); if ((i + j * 2) % 3) R((8 + i * 7.6 | 0) + 1, 28 + j * 6, 4, 3, ["#f4f0e0", "#e8d8b0", "#d8e4f0"][(i + j) % 3]); }
    // 櫃台：包裹、簽收簿、印章
    R(4, 55, 42, 3, "#8a6a4a"); R(4, 55, 42, 1, "#a88a68"); R(6, 58, 38, 18, "#7a8a9a"); R(8, 61, 34, 1, "#8a9aaa");
    R(6, 49, 9, 6, "#c8a070"); R(6, 49, 9, 1, "#e0b888"); R(10, 49, 1, 6, "#8a6a4a");
    R(17, 52, 14, 3, "#2a4a3a"); R(18, 51, 12, 3, "#f4f0e0"); R(24, 51, 1, 3, "#c8c4b4"); R(19, 52, 4, 1, "#6a6a6a"); R(26, 52, 3, 1, "#6a6a6a"); R(32, 53, 4, 1, "#2a3a8a");
    R(37, 51, 8, 4, "#5a4a3a"); R(38, 49, 2, 2, "#c83a2a"); R(41, 49, 2, 2, "#2a3a8a");
    R(48, 67, 6, 9, "#5a6a5a"); R(47, 66, 8, 1, "#7a8a7a"); R(49, 64, 3, 2, "#f4f0e0");   // 垃圾桶
    // 信箱牆
    R(55, 20, 76, 46, "#5a6470"); R(55, 66, 76, 10, "#6a7480"); R(55, 66, 76, 1, "#8a94a0");
    for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++){ const x = 57 + c * 9, y = 24 + r * 8; R(x, y, 8, 7, "#8a94a0"); R(x, y, 8, 1, "#a4aeb8"); R(x + 2, y + 2, 4, 1, "#3a4048"); P(x + 6, y + 5, "#e8c040"); }
    R(85, 35, 4, 2, "#f4f0e0"); P(86, 35, "#3a3a3a"); P(88, 36, "#3a3a3a");   // 0611 的名牌（手寫的）
    box(133, 66, 11, 10); box(135, 58, 8, 8, "#c8a26a");   // 還沒有人領的包裹
    R(140, 22, 24, 18, "#f4f0e0"); R(140, 22, 24, 3, "#c83a2a"); for (let k = 0; k < 4; k++) R(142, 28 + k * 3, 20 - (k * 5) % 9, 1, "#6a6a6a");   // 告示
    // 長椅
    R(146, 56, 40, 2, "#8a6a4a"); R(146, 56, 2, 10, "#6a4a2a"); R(184, 56, 2, 10, "#6a4a2a"); R(146, 66, 40, 3, "#8a6a4a"); R(146, 66, 40, 1, "#a88a68"); R(148, 69, 2, 7, "#5a4a3a"); R(182, 69, 2, 7, "#5a4a3a");
    if (o.helmet){ R(153, 64, 10, 2, "#d8d4c4"); R(154, 64, 8, 1, "#8a8a8a");   // 摺好的報紙
      R(168, 59, 7, 1, "#e8e8e0"); R(167, 60, 9, 5, "#e8e8e0"); R(169, 60, 3, 1, "#ffffff"); R(167, 64, 9, 1, "#3a3a3e"); R(166, 65, 11, 1, "#5a5a5e"); P(171, 62, "#c8a868"); }   // 舊的安全帽，裡面塞著棉手套
    floor(76, "#a8a494", "#9c9888");
  };

  /* ---------- 一樓・食堂 ----------
     菜單板 x10–50；配菜台 x4–68（檯面 y52，洗碗槽在右邊 x55–68）；刷卡機 x73–81；熱水桶 x86–96；鐘和電鈴 x100–110；窗 x128–188；窗邊的桌子 x134–180（桌面 y61）
     o.pm＝下午（雨停了） */
  SC.c34_canteen = (o) => { o = Object.assign({}, o, stOf(o)); const pm = !!o.pm;
    R(0, 0, W, 76, "#e4dcc4"); R(0, 0, W, 6, "#b4ac94"); tube(56, 6, 22); tube(150, 6, 22);
    R(0, 58, W, 18, "#d4e0da"); for (let x = 0; x < W; x += 8) R(x, 58, 1, 18, "#bccac4"); R(0, 57, W, 1, "#a8b8b0"); R(0, 67, W, 1, "#bccac4");
    R(9, 11, 42, 20, "#6a4a2a"); R(10, 12, 40, 18, "#2a4a3a"); for (let k = 0; k < 3; k++) R(13, 15 + k * 4, 20 + (k * 7) % 12, 1, "#e8e8d8"); R(13, 27, 30, 1, "#e85a4a");   // 菜單板
    // 配菜台：玻璃罩、三樣菜、洗碗槽
    R(4, 38, 50, 1, "#c8ccd0"); R(4, 38, 1, 14, "#c8ccd0"); R(53, 38, 1, 14, "#c8ccd0"); dither(5, 39, 48, 13, "#ffffff33", 2);
    R(8, 47, 12, 5, "#b8bcc0"); R(9, 48, 10, 3, "#a85a2a"); R(22, 47, 12, 5, "#b8bcc0"); R(23, 48, 10, 3, "#8ac06a"); R(37, 44, 10, 8, "#8a8e92"); R(36, 44, 12, 1, "#a8acb0"); R(38, 45, 8, 2, "#e8dcc0");
    R(55, 47, 13, 5, "#b8c0c4"); R(57, 48, 9, 3, "#5a6a70"); R(61, 41, 2, 6, "#8a8e92"); R(61, 41, 5, 2, "#8a8e92"); R(56, 43, 1, 4, "#f4f4f0"); R(58, 43, 1, 4, "#f4f4f0");
    R(4, 52, 64, 3, "#c8ccd0"); R(4, 52, 64, 1, "#e0e4e8"); R(4, 55, 64, 21, "#8a9aa0"); R(6, 58, 60, 1, "#a4b2b8");
    // 刷卡機：螢幕，下面夾著資訊室印出來的紙
    R(76, 54, 3, 22, "#8a8e92"); R(74, 75, 7, 1, "#6a6e72"); R(73, 42, 9, 12, "#2a2e36"); R(74, 43, 7, 4, "#6ad08a"); R(75, 44, 4, 1, "#1a4a2a"); R(74, 49, 7, 5, "#f4f0e0"); R(75, 50, 5, 1, "#6a6a6a"); R(75, 52, 4, 1, "#6a6a6a");
    // 熱水桶
    R(84, 58, 14, 2, "#8a7a5a"); R(85, 60, 2, 16, "#5a4a3a"); R(95, 60, 2, 16, "#5a4a3a"); R(87, 42, 9, 16, "#c8ccd0"); R(87, 42, 9, 1, "#e8ecf0"); R(89, 40, 5, 2, "#8a8e92"); R(85, 53, 2, 2, "#3a3a3e"); P(91, 46, "#e83a3a"); R(89, 49, 5, 4, "#f4f0e0");
    // 鐘，鐘下面是打上班鐘的電鈴
    clock(100, 8, pm ? 13 : 9, pm ? 5 : 10); R(105, 19, 1, 3, "#5a5a5e"); R(102, 22, 7, 5, "#c83a2a"); R(103, 23, 5, 1, "#e86a5a"); P(105, 27, "#5a5a5e");
    // 窗戶
    R(127, 13, 62, 38, "#6a7480"); pane(129, 15, 58, 34, pm); R(148, 15, 1, 34, "#6a7480"); R(168, 15, 1, 34, "#6a7480"); R(126, 51, 64, 2, "#8a9098");
    // 窗邊的桌子和兩張圓凳
    R(142, 68, 8, 2, "#c83a2a"); R(145, 70, 2, 6, "#8a8e92"); R(164, 68, 8, 2, "#c83a2a"); R(167, 70, 2, 6, "#8a8e92");
    R(134, 61, 46, 3, "#d8d4c8"); R(134, 61, 46, 1, "#f0ece0"); R(137, 64, 3, 12, "#8a8e92"); R(174, 64, 3, 12, "#8a8e92");
    R(140, 56, 5, 5, "#c8a868"); R(141, 54, 1, 2, "#8a6a3a"); R(143, 53, 1, 3, "#8a6a3a"); R(148, 58, 6, 3, "#f4f0e0"); R(164, 60, 6, 1, "#b89868");   // 筷子筒、面紙、桌角的茶漬
    floor(76, "#b4b0a0", "#a8a494");
  };

  /* ---------- B1・證物室前台（第 33 集）：桌上換成了茶具，多了兩杯咖啡、行李箱 ---------- */
  SC.c34_office = (o) => { SC.c33_office(o || {});
    R(83, 41, 16, 7, "#d0ccbc");   // 便當盒收走了
    R(84, 47, 13, 1, "#5a3a2a"); R(85, 43, 5, 4, "#7a3a2a"); R(86, 42, 3, 1, "#7a3a2a"); P(87, 41, "#5a2a1e"); P(84, 44, "#7a3a2a"); P(90, 44, "#7a3a2a"); P(90, 45, "#7a3a2a"); R(92, 45, 2, 2, "#e8dcc8"); R(95, 45, 2, 2, "#e8dcc8");   // 紫砂壺、倒扣的杯子、茶盤
    R(33, 44, 3, 4, "#f4f0e0"); R(33, 44, 3, 1, "#6a4a2a"); R(37, 44, 3, 4, "#f4f0e0"); R(37, 44, 3, 1, "#6a4a2a");   // 兩杯外帶咖啡
    [34, 60].forEach(x => { R(x, 53, 18, 8, "#6a5a3e"); R(x + 1, 54, 16, 6, "#7e6e50"); R(x + 7, 56, 4, 1, "#c8c8cc"); });   // 抽屜
    if (o && o.old) return;   // 去年（重現用）：還沒有那一個行李箱
    R(119, 56, 1, 4, "#5a5a5e"); R(125, 56, 1, 4, "#5a5a5e"); R(119, 56, 7, 1, "#5a5a5e"); R(116, 60, 13, 15, "#2a3a6a"); R(116, 60, 13, 1, "#4a5a9a"); R(116, 67, 13, 1, "#1e2a52"); R(117, 75, 3, 1, INK); R(125, 75, 3, 1, INK); R(126, 58, 3, 4, "#f4f0e0"); P(127, 59, "#c83a2a");   // 行李箱和名牌
  };

  /* ---------- B1・C 區（第 33 集）：底板鎖回去了，兩道封條；地上用膠帶貼了一個長方形
     o.old＝去年的樣子（重現用）：最下層搬空、底板拆下來 ---------- */
  SC.c34_shelf = (o) => { o = Object.assign({}, o, stOf(o));
    SC.c33_shelf(Object.assign({}, o, { sheet:false, dog:false, open:!!o.old, ds:undefined, seq:undefined }));
    if (o.old) return;
    [111, 134].forEach(x => { R(x, 72, 4, 6, "#c83a2a"); R(x + 1, 74, 2, 2, "#f4f0e0"); });   // 督察組的封條
    for (let x = 104; x < 144; x += 4){ R(x, 81, 3, 1, "#e8c040"); R(x, 93, 3, 1, "#e8c040"); } for (let y = 81; y < 94; y += 4){ R(104, y, 1, 3, "#e8c040"); R(143, y, 1, 3, "#e8c040"); }   // 地上的膠帶
  };

  /* ---------- 冰店門口（第 28 集）。o.shut＝中午：冰店和隔壁的鐵門都拉下來；o.bike＝隔壁的騎樓下停著一台機車 ---------- */
  SC.c34_front = (o) => { o = Object.assign({}, o, stOf(o)); SC.c28_front(Object.assign({}, o, { ds:undefined, seq:undefined }));
    if (o.shut){
      R(6, 40, 42, 46, "#a8b0b8"); for (let y = 42; y < 86; y += 4) R(6, y, 42, 1, "#98a0a8"); R(6, 84, 42, 2, "#6a7278");
      R(94, 43, 54, 43, "#a8b0b8"); for (let y = 45; y < 86; y += 4) R(94, y, 54, 1, "#98a0a8"); R(94, 84, 54, 2, "#6a7278");
    }
    if (o.bike){ R(103, 81, 5, 5, INK); R(117, 81, 5, 5, INK); P(105, 83, "#8a8a8a"); P(119, 83, "#8a8a8a"); R(105, 77, 14, 4, "#5a5a5e"); R(108, 75, 7, 2, INK); R(118, 71, 1, 7, "#8a8e92"); R(116, 71, 4, 1, "#8a8e92"); P(120, 74, "#e8e8a0"); }
  };

  /* ---------- 人物造型 ---------- */
  const AL = id => (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null;
  const LOOK = {
    wu:    Object.assign({ skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", glasses:true, top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050" }, AL("wu") || {}, { hello:"學長。" }),
    li:    Object.assign({ skin:"#e8c09a", hair:"#1e1e1e", hairStyle:"slick", top:"#ffffff", bottom:"#1e2230" }, AL("li") || {}, { hello:"問。" }),
    ye:    Object.assign({ skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"pony", top:"#f4f4f0", coat:"#6a6e76", bottom:"#3a3e48" }, AL("ye") || {}, { hello:"沈警官。門關了嗎？" }),
    xu:    Object.assign({ skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" }, AL("xu") || {}, { hello:"要比什麼，拿過來。" }),
    kui:   Object.assign({ skin:"#f0d0b4", hair:"#5a3a2a", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" }, AL("kui") || {}, { hello:"學長。" }),
    zhou:  Object.assign({ age:"old", skin:"#d8a880", hair:"#8a8a84", hairStyle:"slick", top:"#f4f4f0", coat:"#6a6a6e", bottom:"#3a3a40", tie:"#3a2a2a" }, AL("zhou") || {}, { hello:"問。跟問他們一樣問。" }),
    cai:   Object.assign({ skin:"#e8c8a8", hair:"#2a2220", hairStyle:"short", top:"#f4f4f0", coat:"#b8a070", bottom:"#3a3a40" }, AL("cai") || {}, { hello:"學長。前天的事，還要問嗎？" }),
    wei:   Object.assign({ age:"old", skin:"#d8a880", hair:"#9a9a92", hairStyle:"balding", glasses:true, top:"#c8c0a8", bottom:"#3a3a40" }, AL("weiguo") || {}, { hello:"沈警官。喝茶嗎？" }),
    huang: Object.assign({ age:"old", skin:"#d8a880", hair:"#8a8a84", hairStyle:"short", top:"#e9e4da", bottom:"#3a3a3a" }, AL("jinshui") || {}, { coat:"#5a5a4a", hello:"……要簽哪裡？" }),
    xia:   { age:"old", skin:"#e0b48c", hair:"#4a4240", hairStyle:"bun", top:"#f4f4f0", apron:"#e8a040", bottom:"#3a3a40", mood:"smile", hello:"警官，還沒有開飯喔。" },
    liu:   { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", hello:"沈警官。" },
    pan:   { skin:"#f0d0b4", hair:"#2a2220", hairStyle:"pony", glasses:true, top:"#a8c8e0", bottom:"#3a4050", hello:"你好。領信，還是寄件？" },
    zhu:   { age:"old", skin:"#d8a880", hair:"#8a8a8a", hairStyle:"bun", top:"#f4f0f4", coat:"#a85a6a", bottom:"#3a4a6a", apron:"#e86a8a", hello:"警察先生，又是你。吃冰嗎？" }
  };
  const DAILY = {
    wu:    [ { room:"meet", x:30, pose:"read", doing:"站在會議桌的旁邊，把那一份報告又看了一次。" }, { room:"meet", x:30, pose:"stand", doing:"站在白板的前面，一格一格地看。" } ],
    li:    [ { room:"meet", x:66, pose:"write", doing:"站在白板的前面，手上拿著筆。格子還是空的。" }, { room:"meet", x:66, pose:"cross", doing:"站在白板的前面，看著那十二個格子。" } ],
    xu:    [ { room:"meet", x:106, pose:"type", doing:"站在自己的電腦前面，螢幕上是放大的指紋。" }, { room:"meet", x:106, pose:"type", doing:"站在自己的電腦前面。旁邊多了一個藍色的箱子。" } ],
    zhou:  [ { room:"meet", x:134, pose:"cross", doing:"靠在矮櫃的旁邊，手抱在胸前。" }, { room:"meet", x:134, pose:"cross", doing:"靠在矮櫃的旁邊。他一個早上都沒有走。" } ],
    ye:    [ { room:"meet", x:158, pose:"read", doing:"站在門邊，在看一份公文。" }, { room:"meet", x:158, pose:"read", doing:"站在門邊，在看電信局傳來的那三頁紙的影本。" } ],
    liu:   [ { room:"lobby", x:112, pose:"stand", doing:"站在值班台後面。" }, { room:"lobby", x:112, pose:"write", doing:"站在值班台後面，在寫今天的值班日誌。" } ],
    pan:   [ { room:"mail", x:26, pose:"write", doing:"站在櫃台的旁邊，在分今天早上的信。" }, { room:"mail", x:26, pose:"stand", doing:"站在櫃台的旁邊，不時看一眼長椅那邊。" } ],
    huang: [ null, { room:"mail", x:150, pose:"read", doing:"站在長椅的前面，在看報紙。安全帽放在椅子上。" } ],
    xia:   [ { room:"canteen", x:36, pose:"wipe", doing:"在擦配菜台的玻璃。廚房裡，湯已經在滾了。" }, { room:"canteen", x:36, pose:"wipe", doing:"在收配菜台。中午的菜，只剩下一點湯。" } ],
    cai:   [ { room:"evoffice", x:52, pose:"write", doing:"站在前台的桌子旁邊，在登記早上送來的件。" }, { room:"evoffice", x:52, pose:"type", doing:"站在電腦前面，在打下午的清冊。" } ],
    wei:   [ { room:"evoffice", x:104, pose:"cup", doing:"站在桌子的另一頭，手上端著一杯茶。行李箱立在旁邊。" }, { room:"evoffice", x:104, pose:"read", doing:"站在桌子的另一頭，在看今天的報紙。" } ],
    kui:   [ { room:"cshelf", x:124, pose:"write", doing:"站在 C-7 的前面，在檢查封條，記下時間。" }, { room:"front", x:98, pose:"write", doing:"站在公共電話的旁邊，在本子上記時間。" } ],
    zhu:   [ null, { room:"shop", x:54, pose:"wipe", doing:"在擦櫃台。" } ]
  };
  EP34.suspects.forEach(s => {
    if (LOOK[s.id]){ if (LOOK[s.id].hello) s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP34.rooms = {
    police: [
      { id:"meet", name:"3F 督察組會議室", scene:"c34_meet", opt:(ph, has) => ({ pm:ph > 0, usb:!!(has && has("e34_he")) }), details:[
        { id:"d34_blinds", name:"百葉窗", hot:[6,12,40,34], text:"百葉窗是黎光耀自己拉下來的。\n這一間會議室的窗戶，對著的是停車場。停車場的對面，是海風咖啡的招牌。" },
        { id:"d34_clock", name:"牆上的鐘", hot:[124,8,11,11], text:"督察組的鐘，比樓下值班台的快兩分鐘。\n黎光耀說，是故意的。" },
        { id:"d34_door", name:"會議室的門", hot:[166,22,20,54], text:"門的裡面，包了一層隔音棉。\n關上以後，走廊的聲音一點都聽不到。\n裡面的聲音，走廊也聽不到。" } ] },
      { id:"lobby", name:"1F 值班台", scene:"e_lobby", opt:{ night:false }, details:[
        { id:"d34_clock1", name:"值班台的鐘", hot:[92,6,12,12], text:"值班台後面的鐘。\n登記簿上的時間，都是照這一個鐘寫的。" },
        { id:"d34_stairs", name:"往地下室的樓梯", hot:[154,60,38,30], text:"往地下室的樓梯。下去就是證物室。\n要上樓、要出大門，都得從值班台的前面走過去。" },
        { id:"d34_glass", name:"大門", hot:[0,14,22,62], text:"玻璃的大門。出去以後，左手邊是機車的車棚。\n早上的雨，把門口的地墊都打濕了。" } ] },
      { id:"mail", name:"1F 收發室", scene:"c34_mail", opt:(ph) => ({ helmet:ph > 0 }), details:[
        { id:"d34_notice", name:"牆上的告示", hot:[140,22,24,18], text:"「退休人員信箱：鑰匙由收發室保管，本人簽名領取，不得代領。」\n下面是總務科的章。" },
        { id:"d34_parcel", name:"角落的包裹", hot:[133,58,11,18], text:"兩個還沒有人領的包裹。\n上面那一個，收件人寫的是「刑事大隊　周隊長」，品名是「胃藥」。" },
        { id:"d34_bin", name:"垃圾桶", hot:[47,64,8,12], text:"櫃台旁邊的垃圾桶。\n最上面是幾個撕開的信封，和一本還包著塑膠套的月刊。" } ] },
      { id:"canteen", name:"1F 食堂", scene:"c34_canteen", opt:(ph) => ({ pm:ph > 0 }), details:[
        { id:"d34_urn", name:"熱水桶", hot:[85,40,12,18], text:"不鏽鋼的熱水桶，上面貼著一張紙：「泡茶請自備茶葉」。\n下面被人用原子筆加了一行：「也請留一點給別人」。" },
        { id:"d34_window", name:"食堂的窗戶", hot:[129,15,58,34], text:"食堂的窗戶對著大門和車棚。\n坐在窗邊，誰進來、誰出去，都看得到。" },
        { id:"d34_sink", name:"洗碗槽", hot:[55,41,13,11], text:"配菜台最右邊的洗碗槽。阿霞姨洗碗，都站在這裡。\n抬起頭，正對著的，就是窗邊的那一桌。" } ] },
      { id:"evoffice", name:"B1 證物室前台", scene:"c34_office", details:[
        { id:"d34_kettle", name:"小電熱水壺", hot:[3,40,12,10], text:"牆角的電熱水壺。\n旁邊那一罐泡麵還在，罐子上的「鄭」字，快要看不見了。" },
        { id:"d34_keycab", name:"鑰匙櫃", hot:[66,12,26,18], text:"鑰匙櫃鎖著。\n前天以後，領用簿上的每一行，都多了一個督察組的章。" },
        { id:"d34_cups", name:"兩杯咖啡", hot:[33,44,7,4], text:"兩個外帶的咖啡杯，都喝完了。\n杯套上印的是「海風咖啡」。" } ] },
      { id:"cshelf", name:"B1・C 區", scene:"c34_shelf", details:[
        { id:"d34_water", name:"牆上的水位線", hot:[86,49,18,6], text:"2023 年 7 月 28 日，一百一十二公分。\n水退了以後，帳面上報廢了很多東西。" },
        { id:"d34_tape", name:"地上的膠帶", hot:[104,81,40,13], text:"陳葵用黃色的膠帶，在地上貼出了一個長方形。\n十四個紙箱，堆起來就是這麼大的一塊。\n有人走進來，第一眼就會看到。" },
        { id:"d34_toolbox", name:"老方的工具箱", hot:[88,62,13,14], text:"老方的工具箱還在這裡。\nC-7 貼了封條，他的工作停了：剩下的兩座鐵架，要等督察組點頭才能鎖。" } ] }
    ],
    harbour: [
      { id:"front", name:"冰店門口", scene:"c34_front", details:[
        { id:"d34_upwin", name:"冰店二樓的窗戶", hot:[20,10,20,13], text:"阿珠姨住在二樓。\n窗戶的正下方，就是那一支電話。" },
        { id:"d34_hailong", name:"隔壁的魚攤", hot:[98,52,50,18], text:"海龍漁業的魚攤。碎冰上排著今天早上的魚，眼睛還是亮的。\n騎樓很深，停一台機車，從馬路上看不到。" },
        { id:"d34_truck", name:"藍色的小貨車", hot:[152,58,38,28], text:"阿珠姨的小貨車。\n車還回來以後，她把它裡裡外外洗了三次。" } ] },
      { id:"shop", name:"阿珠冰店", scene:"c30_ice", opt:{ phase:0 }, details:[
        { id:"d34_cards", name:"牆上的集點卡", hot:[56,22,34,24], text:"牆上的集點卡。\n第二排畫了星星的那一張，每一格都蓋滿了。" },
        { id:"d34_table", name:"客人的桌子", hot:[64,64,34,9], text:"白鐵的桌子，擦得很亮。\n三月了，醬油膏的罐子還沒有換成煉乳。" },
        { id:"d34_icer", name:"製冰機", hot:[152,34,34,50], text:"最裡面的製冰機，靠著後牆。\n每隔一陣子，「轟」的一聲。" } ] },
      { id:"oldpier", name:"舊碼頭", scene:"c30_tide", details:[
        { id:"d34_seal", name:"船塢的鐵捲門", hot:[144,34,40,48], text:"船塢的鐵捲門拉下來了。門上的封條還在。" },
        { id:"d34_bollard", name:"繫船柱", hot:[38,72,12,14], text:"繫船柱上，有一圈磨亮的痕跡。\n今天沒有船靠在這裡。" } ] }
    ]
  };
  EP34.phases[0].scene = "c34_meet"; EP34.phases[0].sceneOpt = {};
  EP34.phases[1].scene = "c34_meet"; EP34.phases[1].sceneOpt = { pm:true };

  /* ---------- 監視器動畫 ---------- */
  const strip = L => { const o = Object.assign({}, L || {}); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  EP34.looks = { youC:YOU, wuC:strip(LOOK.wu), liC:strip(LOOK.li), yeC:strip(LOOK.ye), xuC:strip(LOOK.xu), kuiC:strip(LOOK.kui), zhouC:strip(LOOK.zhou), caiC:strip(LOOK.cai), weiC:strip(LOOK.wei), liuC:strip(LOOK.liu),
    huangC:Object.assign(strip(LOOK.huang), { hat:"cap", capColor:"#e8e8e0" }),   // 安全帽還戴在頭上
    caiH:Object.assign(strip(LOOK.cai), { hat:"cap", capColor:"#2a2a2e" }) };
  const mk = (scene, opt, cam, date, beats, clean) => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join);
    return { scene, opt:Object.assign({}, opt, { ds, seq:beats.map(b => b.st || {}) }), cam, date, clean, beats:beats.map(b => { const o = Object.assign({}, b); delete o.st; return o; }) }; };
  const F = 96, DN = 146, SX = 208, SY = 146;   // DN＝往鏡頭這一邊走出畫面；(SX, SY)＝地下室的樓梯口下面
  const L1 = "10:44，一個穿夾克的老人走進大門，安全帽還戴在頭上。他在值班台簽了名。", L2 = "他往鏡頭這一邊的走廊走：收發室在這一邊。", L3 = "11:03，他走回來，手上多了一疊信，出了大門。";
  const L4 = "11:47，蔡明宏從地下室的樓梯上來，穿著外套，出了大門。", L5 = "12:02，魏國良從樓梯上來，手上捧著茶壺，往鏡頭這一邊的走廊走：食堂也在這一邊。";
  const L6 = "12:43，蔡明宏從大門進來，下樓。", L7 = "12:57，魏國良從走廊走回來，下樓。";
  const LIU = [112, 74, "stand", -1];
  const ANIM = {
    cctv34_lobby: mk("e_lobby", { night:false, cam:true }, "1F LOBBY", "2027-02-15", [
      { t:"10:44:00", d:4, cap:L1, m:{ liuC:LIU, huangC:[124, F, "stand", 1, -16, F] } },
      { t:"10:44:40", d:3, join:true, cap:L1, m:{ huangC:[124, F, "sign", 1] } },
      { t:"10:45:10", d:3.5, join:true, cap:L2, m:{ huangC:[100, DN, "stand", -1, 124, F] }, out:["huangC"] },
      { t:"11:03:00", d:5, cap:L3, m:{ liuC:LIU, huangC:[-16, F, "carry@envelope", -1, 100, DN] }, out:["huangC"] },
      { t:"11:47:00", d:2.5, cap:L4, m:{ liuC:LIU, caiC:[150, F, "stand", -1, SX, SY] } },
      { t:"11:47:10", d:4.5, join:true, cap:L4, m:{ caiC:[-16, F, "stand", -1, 150, F] }, out:["caiC"] },
      { t:"12:02:00", d:2.5, cap:L5, m:{ liuC:LIU, weiC:[150, F, "hold@pot/#7a3a2a", -1, SX, SY] } },
      { t:"12:02:10", d:3.5, join:true, cap:L5, m:{ weiC:[100, DN, "hold@pot/#7a3a2a", -1, 150, F] }, out:["weiC"] },
      { t:"12:43:00", d:4.5, cap:L6, m:{ liuC:LIU, caiC:[150, F, "stand", 1, -16, F] } },
      { t:"12:43:15", d:2.5, join:true, cap:L6, m:{ caiC:[SX, SY, "stand", 1, 150, F] }, out:["caiC"] },
      { t:"12:57:00", d:3.5, cap:L7, m:{ liuC:LIU, weiC:[150, F, "hold@pot/#7a3a2a", 1, 100, DN] } },
      { t:"12:57:10", d:2.5, join:true, cap:L7, m:{ weiC:[SX, SY, "hold@pot/#7a3a2a", 1, 150, F] }, out:["weiC"] }
    ])
  };
  ANIM.cctv34_lobby.stairs = [[SX, SY, 150, F, 7]];   // 往地下室的樓梯（下端 → 上端）
  [...EP34.cctv, ...EP34.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案 ---------- */
  const mkR = beats => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join); const seq = beats.map(b => b.st || {});
    return beats.map(b => { const o = Object.assign({}, b, { opt:Object.assign({}, b.opt || {}, { ds, seq }) }); delete o.st; return o; }); };
  const RB = mkR([
    { t:"去年 10/19", d:5.5, cap:"去年 10 月 19 日。前台只有他一個人。十四個紙箱，四顆螺絲。二十二分鐘。", scene:"c34_shelf", opt:{ old:true }, m:{ caiC:[124, F, "kneel+reach", 1, 60, F] } },
    { t:"去年 10/19", d:5, cap:"拿走一把，他就在紙上記一行。標題的那一個字，他寫的是從小寫慣的樣子。摺起來的時候，拇指上的油墨還沒有乾。", scene:"c34_office", opt:{ old:true }, m:{ caiC:[70, F, "write", 1] } },
    { t:"12/15 12:11", d:5.5, cap:"每個月 15 號，中午。冰店的鐵門拉下來了。安全帽沒有脫。不到一分鐘。", scene:"c34_front", opt:{ shut:true, bike:true }, m:{ caiH:[84, F, "phone", -1, 110, F] } },
    { t:"2/26 21:40", d:5.5, cap:"2 月 26 日，21:40。證物袋送進三樓。照規定，他要全程陪同。他坐在門邊，每一句話都聽得到。", scene:"c30_post", opt:{ evid:true, phase:1 }, m:{ caiC:[30, F, "stand", 1], zhouC:[96, F, "phone", 1], xuC:[130, F, "inspect", -1] } },
    { t:"3/10 16:05", d:6, cap:"今天，16:05。一句假的話，只講給一個人聽。", scene:"c34_meet", opt:{ pm:true, done:true, hh:16, mm:5 }, m:{ liC:[66, F, "write", 1], yeC:[36, F, "stand", 1], caiC:[158, F, "stand", -1, 200, F] } }
  ]);
  EP34.court = {
    title: "督察組會議室・3 月 10 日 下午", scene: "c34_meet", opt:{ pm:true, hh:16 },
    who: ph => ["li", "ye", "wu"],
    open: ph => "會議室的門關著。白板上的十二個格子，還是空的。黎光耀把筆放在桌上。「說。三個人，你刪得掉幾個？」",
    kindLine: {
      zero: "靠現在手上的東西，一個都刪不掉。",
      two: "刪得掉一個。還剩兩個人。",
      one: "刪得掉兩個。只剩一個人。"
    },
    kindTrue: "（黎光耀拿起筆，走到白板的前面。「一個。……哪一個？」）",
    murmur: [ "（葉晴把筆記本闔上。）", "（小吳看著白板，沒有動。）", "（走廊上有人走過。黎光耀等腳步聲遠了，才點頭。）" ],
    confess: {
      cai: [ "（同一個時間，地下一樓。蔡明宏在交接簿上，寫今天的記事。）", "（桌上的電話響了。他接起來，聽了兩句。）好。組長，我馬上上去。", "（他把筆蓋蓋上，把簿子闔好，擺正。）" ]
    },
    cornered: { cai: "（同一個時間，地下一樓。蔡明宏在寫他的交接簿。三樓有人講了他的名字，他不知道。）" },
    deny: {
      wei: "（同一個時間，地下一樓。魏國良把壺裡的茶葉倒掉，又沖了一次熱水。三樓有人講了他的名字，他不知道。）",
      huang: "（同一個時間，一樓的收發室。黃金水把報紙翻到下一頁。三樓有人講了他的名字，他不知道。）"
    },
    replayText: "去年 10 月，地下一樓，C 區——",
    replay: { scene:"c34_shelf", opt:{ old:true }, clean:true, cam:"經過重現", date:"2026-10-19", beats:RB },
    endGood: "黎光耀在白板上，把兩個名字劃掉。剩下的那一個，他看了很久。\n「還不夠。每一格，都只是對得上。現在動他，他什麼都不會認；他後面的人，也會知道我們查到了哪裡。……讓他自己動。」\n16:05，他撥了地下室的內線，只叫了一個人上來。蔡明宏站在會議室的門口。黎光耀頭也沒有抬：「沈國棟那一件的彈頭檢體，明天一早送台北重驗。調件單，你今天準備好。」\n「是。」門關上了。\n葉晴說：「沒有這一回事。」\n「沒有。」黎光耀把筆蓋蓋上。「這一句話，只在這個房間裡講過。聽到的，只有他。」\n從今天晚上開始，漁港的那一支公共電話，有人看著。",
    endBad: "黎光耀聽完，沒有在白板上劃掉任何一個名字。\n「你給我的，我不能用。」他自己把那十二個格子重新看了一次，看了很久。\n16:05，他撥了一通內線。有一個人上來，在門口站了不到一分鐘。黎光耀頭也沒有抬，只說了一句話：沈國棟那一件的彈頭檢體，明天一早送台北重驗。\n門關上以後，葉晴說：「沒有這一回事。」\n「沒有。這一句話，只在這個房間裡講過。」\n上來的是誰，他沒有告訴你。他說：等你自己想通了，再來問。"
  };
  // 主線：推理全對，才記下「只剩一個人」
  { const base = EP34.court.endGood;
    Object.defineProperty(EP34.court, "endGood", { enumerable:true, configurable:true, get(){
      try { if (typeof S !== "undefined" && S && S.done && S.result && S.result.verdict === "perfect" && typeof C !== "undefined" && C && C.id === "three" && typeof ARC !== "undefined" && !ARC.has("y_deduced")) ARC.set("y_deduced", "three", "found"); } catch (e) {}
      return base; } }); }

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP34.fac = { police:["#cfcabb","#3f5a7a"], harbour:["#e8dcc8","#e86a8a"] };
  EP34.setting = { police:"city", harbour:"coast" };
  EP34.outScenes = ["c34_front", "c30_tide"];
  // 上午：雨；下午：放晴
  const SKY34 = [ ["#7a8898","#a8b4bc","#4a5a68","#56666e",1,0], ["#8ec0e8","#d8ecf4","#4a6a7a","#56767e",0,0] ];
  EP34.worldSky = ph => SKY34[Math.min(ph || 0, SKY34.length - 1)];
  EP34.worldOrder = { police:["meet","lobby","mail","canteen","evoffice","cshelf"], harbour:["front","shop","oldpier"] };
  EP34.roomDesc = {
    meet:"三樓，督察組的會議室。門關著。", lobby:"一樓值班台。往地下室的樓梯在右邊。", mail:"一樓的收發室。一整面牆的信箱。", canteen:"一樓的食堂。",
    evoffice:"地下一樓，證物室的前台。茶的味道。", cshelf:"C 區。C-7 的最下層貼著封條。",
    front:"舊碼頭的路口。冰店的門口，有一支公共電話。", shop:"阿珠冰店。", oldpier:"舊碼頭。潮位站的桿子立在岸邊。"
  };
  const say = (who, text, name) => ({ say:[who, text], name });
  EP34.world = {};
  EP34.locations.forEach(l => { EP34.world[l.id] = { auto:true, you:YOU, order:(EP34.worldOrder || {})[l.id] }; });
  Object.assign(EP34.world.police, {
    intro: [
      { set:{ px:150, bx:132, cam:104, face:1 } },   // 一開場就在三樓的會議室裡（房間從 x110 開始）
      { wait:0.4 },
      say("li", "從現在開始，這個房間裡講的話，不出這個房間。", "黎光耀"),
      say("wu", "學長，報告在桌上。蔡明宏和魏國良在地下室。黃金水，下午才到。", "小吳"),
      say("you", "從桌上的東西開始。", "你")
    ]
  });
  EP34.mapPos = { police:[104,54,"u"], harbour:[188,92,"d"] };
  EP34.mapRoads = [["police","harbour"]];
  EP34.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 14; x < 226; x += 8) for (let y = 12; y < 100; y += 7){ R(x, y, 6, 5, "#c8c0b0"); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, "#b0a898"); }
    R(0, 62, 240, 5, "#d8d4c8"); R(84, 0, 5, 104, "#d8d4c8"); R(150, 62, 4, 42, "#d8d4c8"); R(150, 98, 60, 4, "#d8d4c8");   // 中正路、往漁港的路
    R(0, 104, 240, 31, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 106 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");
    R(176, 104, 40, 3, "#8a8678"); R(196, 107, 4, 12, "#8a8678"); R(210, 100, 8, 4, "#e8e4d8");   // 舊碼頭
    R(96, 46, 16, 10, "#cfcabb"); R(98, 44, 12, 3, "#3f5a7a"); R(102, 48, 4, 3, "#e8c040");   // 警察局
    R(60, 54, 8, 6, "#f4f0e0"); R(60, 54, 8, 2, "#2a7a4a");   // 中正路郵局
  };
})();
