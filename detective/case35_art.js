/* =========================================================
   第 35 集：場景、人物造型、監視器畫面、結案、走動畫面、地圖、開場
   沿用：林記釣具（第 25 集）、督察組會議室（第 34 集）、一樓值班台（第 14 集）、鑑識中心和漁會櫃台（第 32 集）、冰店門口（第 34 集）、海風咖啡的門面（cafe.js）
   新畫的：港濱路口（修路、押送車）c35_cross、港濱路 71 號的騎樓 c35_arcade、五樓 c35_room5、咖啡店櫃台裡面 c35_counter、行車紀錄器 c35_pov
   ========================================================= */
EP35.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, INK } = PR;
  const W = 192, H = 108;
  const SC = PX.SCENES;
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i, p] = beatAt(o.t || 0, o.ds); return Object.assign({ _p:p }, (o.seq || [])[i] || {}); };
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px sans-serif"; g.fillStyle = c; g.fillText(s, x, y); };
  const veil = (c) => { const g = PR.g(); g.fillStyle = c; g.fillRect(0, 0, W, H); };
  const lamp = (x, y, h, lit) => { R(x, y - h, 2, h, "#4a4e52"); R(x, y - h, 10, 2, "#4a4e52"); R(x + 7, y - h + 2, 5, 2, lit ? "#fff0b0" : "#c8c8c0"); };
  const moved = () => (typeof EP35_moved === "function") && EP35_moved();
  /* 小客車（車頭朝左）：(x, y)＝左上角，長 34、高 15。o.glass＝這一側車窗的顏色；o.hitR＝右後車窗碎了（從另一側透過來，白白的一片）；o.open＝這一側的門開著 */
  const car = (x, y, c, o) => { o = o || {}; const dk = PR.shade ? PR.shade(c, -.25) : "#4a4e52", gl = o.glass || "#9cc5e6";
    R(x, y + 7, 34, 5, c); R(x + 2, y + 5, 30, 3, c); R(x + 8, y, 18, 6, c); R(x + 6, y + 2, 2, 4, c); R(x + 26, y + 2, 2, 4, c);
    R(x + 9, y + 1, 7, 4, gl); R(x + 18, y + 1, 7, 4, o.hitR ? "#e8eef2" : gl); if (o.hitR){ R(x + 13, y + 2, 2, 3, "#4a4640"); P(x + 14, y + 3, "#e8d8a0"); P(x + 21, y + 3, "#3a3e46"); P(x + 19, y + 2, "#c8d0d8"); P(x + 23, y + 4, "#c8d0d8"); }
    R(x + 16, y + 1, 2, 11, dk); R(x, y + 11, 34, 1, dk); R(x, y + 8, 1, 2, "#fff4c8"); R(x + 33, y + 7, 1, 3, "#c83a2a");
    [5, 23].forEach(a => { R(x + a, y + 10, 6, 5, "#1a1a1a"); R(x + a + 2, y + 12, 2, 1, "#8a8a8e"); });
    if (o.open){ R(x + 9, y + 5, 1, 7, "#2a2e36"); R(x + 18, y + 5, 1, 7, "#2a2e36"); } };

  /* ---------- 港濱路口（白天）：往北看。港濱路橫過畫面；遠的那一線往西（車頭朝左）。
     左邊：水管工程的坑和護欄（遠線）、護欄上的紀錄板 x31–41、人行道上的告示牌 x45–57。管制的停止線 x44。
     等管制的位置：第一台 x46–80、第二台 x82–116（粉筆框）、押送車 x118–152、你們的車 x156–190。
     右上角：路口東邊那一棟罩著綠色防護網的舊公寓（五樓，左邊數來第二扇窗 x174–179）。
     o.pre＝出事以前（重現用：前面兩台車還在、沒有封鎖線、沒有桿子）；o.hit＝車窗碎了；o.cup＝右前座看得到紙杯架；o.cupOut＝紙杯架放在引擎蓋上；o.noRod＝沒有桿子；o.sc＝[x] 機車鑽過去 */
  SC.c35_cross = (o) => { o = Object.assign({}, o, stOf(o)); const pre = !!o.pre, dark = !!o.dark;
    R(0, 0, W, 30, dark ? "#6a7480" : "#8a96a2");
    // 路口東邊的舊公寓：只看得到最上面兩層，罩著防護網
    R(162, 0, 30, 22, "#7a7e72"); for (let y = 0; y < 22; y += 2) for (let x = 162 + (y % 4 ? 1 : 0); x < 192; x += 2) P(x, y, "#5a8a5a");
    [167, 174, 181, 188].forEach(x => { R(x, 4, 5, 5, "#1e2226"); R(x, 9, 5, 1, "#9a9e92"); R(x, 14, 5, 5, "#1e2226"); R(x, 19, 5, 1, "#9a9e92"); });
    // 對面的店面：林記釣具（鐵門）、阿娥粥店、一排老騎樓
    R(0, 18, 162, 46, "#b8b0a0"); R(150, 22, 42, 42, "#a8a090"); for (let x = 0; x < 150; x += 32) R(x, 18, 1, 46, "#a09888");
    R(64, 30, 40, 30, "#7a8a94"); for (let y = 32; y < 60; y += 3) R(64, y, 40, 1, "#6a7a84"); R(66, 22, 36, 7, "#2a4a6a"); for (let k = 0; k < 4; k++) R(70 + k * 8, 24, 5, 3, "#f4f0e4");
    R(110, 30, 34, 30, "#5a4a3a"); R(112, 22, 30, 7, "#c8402a"); for (let k = 0; k < 3; k++) R(116 + k * 8, 24, 5, 3, "#fff4d8"); R(140, 24, 3, 3, "#fff4d8"); R(114, 34, 26, 20, "#3a2e26"); R(116, 46, 22, 8, "#8a7a5a");
    R(156, 30, 12, 14, "#7a8a94"); R(174, 30, 12, 14, "#7a8a94");
    // 人行道、港濱路（兩線道）
    R(0, 60, W, 6, "#a8a49a"); R(0, 66, W, 42, "#5a5e62"); R(0, 66, W, 1, "#8a8a84");
    for (let x = 4; x < W; x += 20) R(x, 86, 10, 1, "#e8e4d0");
    lamp(176, 60, 46);
    // 速限牌、綁著的舊塑膠花
    R(31, 9, 14, 14, "#f4f4f0"); R(32, 10, 12, 12, "#d83a2a"); R(34, 12, 8, 8, "#f4f4f0"); PR.tiny("50", 35, 14, "#1a1a1a"); R(37, 23, 2, 37, "#8a8a86"); R(35, 27, 6, 3, "#e87aa8");
    // 水管工程：坑、挖出來的土、藍色的水管、橘白相間的護欄
    R(2, 69, 34, 14, "#4a3a2a"); R(4, 71, 30, 10, "#2e241a"); R(6, 75, 26, 3, "#3a7ac8"); R(6, 75, 26, 1, "#6aa0e0"); R(14, 74, 2, 5, "#2a5a9a"); R(8, 66, 12, 4, "#7a5a3a"); R(10, 64, 8, 2, "#8a6a4a");
    for (let x = 0; x < 42; x += 6){ R(x, 84, 3, 2, "#f08030"); R(x + 3, 84, 3, 2, "#f4f4f0"); } R(40, 66, 2, 20, "#f08030"); R(40, 70, 2, 3, "#f4f4f0"); R(40, 78, 2, 3, "#f4f4f0");
    [ [46, 88], [60, 104], [20, 88] ].forEach(([x, y]) => { R(x, y, 4, 1, "#f08030"); R(x + 1, y - 4, 2, 4, "#f08030"); R(x + 1, y - 2, 2, 1, "#f4f4f0"); });   // 三角錐
    R(31, 66, 11, 11, "#8a6a4a"); R(32, 67, 9, 9, "#f4f0e0"); for (let k = 0; k < 4; k++) R(33, 69 + k * 2, 7, 1, "#6a6a6a"); R(35, 66, 3, 1, "#5a5a5e");   // 護欄上的紀錄板
    R(45, 41, 13, 16, "#f4d020"); R(46, 42, 11, 14, "#f8f4e0"); R(47, 43, 9, 2, "#c83a2a"); for (let k = 0; k < 4; k++) R(47, 47 + k * 2, 9, 1, "#5a5a5a"); R(47, 57, 1, 5, "#8a8a86"); R(55, 57, 1, 5, "#8a8a86"); R(45, 61, 13, 1, "#6a6a66");   // 告示牌
    R(44, 67, 1, 19, "#e8e4d0");   // 停止線
    // 等管制的車
    if (pre){ car(46, 68, "#e8e8e4"); car(82, 68, "#3a6aa8"); }
    else { [[46, 80], [82, 116]].forEach(([a, b], n) => { for (let x = a; x < b; x += 3){ P(x, 69, "#f4f4f0"); P(x, 83, "#f4f4f0"); } for (let y = 69; y < 84; y += 3){ P(a, y, "#f4f4f0"); P(b, y, "#f4f4f0"); } PR.tiny(String(n + 1), ((a + b) >> 1) - 1, 74, "#f4f4f0"); }); }
    car(118, 68, "#8a8e94", { hitR:!pre || o.hit, open:!pre, glass:"#7aa0c0" });
    if (o.cup && !o.cupOut){ R(127, 71, 3, 2, "#c8a070"); P(127, 70, "#f4f4f0"); P(129, 70, "#f4f4f0"); }   // 右前座上的紙杯架（隔著車窗）
    if (o.cupOut){ R(118, 72, 7, 2, "#c8a070"); R(119, 70, 2, 2, "#f4f4f0"); R(122, 70, 2, 2, "#f4f4f0"); P(124, 73, "#f8f8f8"); }   // 放在引擎蓋上
    car(156, 68, "#e4e4e0");
    if (!pre && !o.noRod){
      for (let k = 0; k < 12; k++) P(140 + k, 69 - Math.round(k * 0.75), "#f4d020");   // 彈道桿：從車窗伸出去
      for (let k = 0; k < 9; k++) P(152 + Math.round(k * 2.6), 60 - Math.round(k * 6.2), k % 2 ? "#ff5a4a" : "#c83a2a");
      R(175, 9, 2, 2, "#ff3a2a"); P(176, 8, "#ff9a8a"); }
    if (!pre){ PR.OBJ.tape(96, 64, 96); PR.OBJ.tape(96, 88, 96); }
    if (o.sc !== undefined){ const x = o.sc; R(x, 100, 14, 4, "#f4f4f0"); R(x + 2, 104, 4, 4, "#1a1a1a"); R(x + 10, 104, 4, 4, "#1a1a1a"); R(x + 5, 91, 5, 9, "#2a2a2e"); R(x + 5, 87, 5, 5, "#1a1a1e"); R(x + 2, 86, 2, 12, "#3a3a2a"); }   // 白色機車、全罩安全帽、背上的長袋子
    if (o.flash) veil("#ffffff40");
  };

  /* ---------- 林記釣具：沿用第 25 集的店面，牆上多一本撕頁的日曆（x92–106、y22–40） ---------- */
  SC.c35_tackle = (o) => { SC.c25_tackle(o);
    R(92, 22, 14, 18, "#8a2a2a"); R(93, 25, 12, 15, "#f8f4e8"); R(92, 22, 14, 3, "#c83a2a"); PR.tiny("11", 96, 27, "#c83a2a"); R(94, 34, 8, 1, "#3a5a9a"); R(94, 36, 10, 1, "#3a5a9a"); R(94, 38, 6, 1, "#3a5a9a"); P(99, 21, "#5a5a5e"); };

  /* ---------- 港濱路 71 號的騎樓：待拆的五樓公寓，從馬路這一邊看一樓
     左：拉下來的鐵門和拆除公告 x10–40；中：信箱 x58–76、樓梯口 x85–103（鐵鍊垂在一邊，鎖頭掉在地上 x104–114）；
     右：柱子 x112–116 後面的白色機車 x120–152（車頭朝左，貼紙在車頭 x120–127）；最右邊一盆枯掉的盆栽 x162–176。上面垂著綠色的防護網 */
  SC.c35_arcade = (o) => { o = Object.assign({}, o, stOf(o)); const nb = !!o.noBike;
    R(0, 0, W, 76, "#8a8a80"); R(0, 0, W, 20, "#7a7e72");
    for (let y = 0; y < 20; y += 2) for (let x = (y % 4 ? 1 : 0); x < W; x += 2) P(x, y, "#5a8a5a"); R(0, 20, W, 2, "#5a5a52");   // 防護網
    R(0, 22, W, 54, "#4a4a44"); R(4, 24, W - 8, 52, "#5e5e56");   // 騎樓裡面
    [0, 112, 186].forEach(x => { R(x, 20, 6, 56, "#9a9a8e"); R(x, 20, 1, 56, "#b0b0a4"); });   // 柱子
    // 鐵門和公告
    R(8, 26, 36, 50, "#6a6e72"); for (let y = 28; y < 76; y += 3) R(8, y, 36, 1, "#5a5e62"); R(8, 26, 36, 2, "#4a4e52");
    for (let k = 0; k < 9; k++) P(12 + (k * 7) % 30, 40 + (k * 11) % 34, "#8a5a3a");
    R(10, 28, 30, 26, "#f4f0e0"); R(10, 28, 30, 5, "#c83a2a"); R(13, 30, 24, 1, "#f4f0e0"); for (let k = 0; k < 6; k++) R(13, 36 + k * 3, 24 - (k % 3) * 4, 1, "#3a3a3a"); R(28, 48, 8, 4, "#c83a2a55");
    // 信箱
    R(58, 34, 18, 16, "#7a7468"); for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++){ R(59 + c * 6, 35 + r * 8, 5, 7, "#8a8478"); R(60 + c * 6, 37 + r * 8, 3, 1, "#3a3a34"); } R(61, 41, 3, 2, "#f4f0e0"); R(72, 49, 3, 3, "#f4f0e0");
    // 樓梯口：往上的樓梯，每一階都有灰
    R(83, 30, 22, 46, "#3a3a36"); R(85, 32, 18, 44, "#1e1e1c");
    for (let k = 0; k < 6; k++){ const y = 70 - k * 6; R(85 + k, y, 18 - k, 6, k % 2 ? "#4a4a44" : "#56564e"); R(85 + k, y, 18 - k, 1, "#8a887c"); if (k < 5) R(90 + k, y + 1, 3, 1, "#3a3a36"); }
    R(104, 34, 1, 28, "#6a6a6e"); for (let y = 34; y < 62; y += 3) P(105, y, "#8a8a8e");   // 垂在一邊的鐵鍊
    R(106, 72, 5, 4, "#8a8a6a"); R(107, 70, 3, 2, "#6a6a5a"); P(110, 70, "#e8e8e0");   // 掉在地上的鎖頭
    // 人行道
    R(0, 76, W, 32, "#9a968a"); for (let x = 0; x < W; x += 16) R(x, 76, 1, 32, "#8a867a"); R(0, 76, W, 1, "#6a665a");
    // 白色的機車（柱子的後面）
    if (!nb){ const x = 120, y = 62;
      R(x + 6, y + 6, 22, 6, "#f0f0ec"); R(x + 2, y + 2, 6, 10, "#f0f0ec"); R(x + 3, y - 2, 2, 5, "#5a5a5e"); R(x, y - 3, 7, 2, "#3a3a3e"); R(x + 14, y + 3, 14, 4, "#2a2a2e");   // 車身、龍頭、座墊
      R(x + 17, y - 2, 7, 6, "#1e1e22"); R(x + 18, y - 1, 3, 2, "#4a5a6a");   // 座墊上的全罩安全帽
      R(x + 2, y + 4, 5, 5, "#3a7a5a"); R(x + 3, y + 5, 3, 1, "#f4f0e0"); R(x + 3, y + 7, 3, 1, "#f4f0e0");   // 車頭的貼紙
      [3, 23].forEach(a => { R(x + a, y + 10, 7, 6, "#1a1a1a"); R(x + a + 2, y + 12, 3, 2, "#8a8a8e"); });
      R(x + 28, y + 8, 4, 3, "#9a9a9e"); R(x + 29, y + 5, 3, 1, "#c8c8c8"); }   // 沒有車牌：只剩兩顆螺絲
    R(112, 20, 6, 56, "#9a9a8e"); R(112, 20, 1, 56, "#b0b0a4");
    // 枯掉的盆栽
    R(164, 66, 10, 10, "#8a5a3a"); R(163, 65, 12, 2, "#a06a44"); R(168, 56, 1, 10, "#6a5a3a"); R(165, 58, 3, 1, "#7a6a3a"); R(169, 60, 4, 1, "#7a6a3a");
    if (o.rider !== undefined){ /* 重現用：人由程式另外畫 */ }
  };

  /* ---------- 五樓：窗 x60–104（玻璃拆走了，看得到斜下方的路口）、窗台 y48–53（兩個小圓印）、
     窗下攤平的紙板 x64–96、菸蒂 x99–110、門框上的身高刻度 x119–124、通往防火梯的鐵門 x150–176、左邊牆上的舊月曆 x14–28、倒在地上的椅子 x30–50
     o.butts＝菸蒂的數目（3 或 1）；o.pre＝開槍以前（重現用：防火梯的門關著） */
  SC.c35_room5 = (o) => { o = Object.assign({}, o, stOf(o)); const n = o.butts === undefined ? (moved() ? 1 : 3) : o.butts;
    R(0, 0, W, 76, "#b8b09a"); R(0, 0, W, 5, "#8a8474");
    for (let k = 0; k < 14; k++){ const x = (k * 37) % 180 + 4, y = 8 + (k * 23) % 56; R(x, y, 5 + k % 4, 1, "#a8a08a"); P(x + 2, y + 1, "#a8a08a"); }
    R(182, 24, 10, 26, "#c8c0a8"); R(182, 24, 2, 26, "#9a927c"); R(128, 8, 18, 12, "#c8c0a8"); R(128, 19, 18, 1, "#9a927c");   // 剝落的壁紙
    // 舊月曆
    R(92, 20, 14, 18, "#f4f0e0"); R(92, 20, 14, 5, "#3a7a9a"); PR.tiny("2", 98, 27, "#c83a2a"); for (let k = 0; k < 3; k++) R(94, 33 + k * 2, 10, 1, "#9a9a9a"); P(99, 19, "#5a5a5e");
    // 窗（x8–60）：很低的一扇，窗台只到膝蓋；玻璃拆走了，只剩窗框。外面是斜下方的港濱路口
    R(8, 26, 52, 46, "#6a6456"); R(10, 28, 48, 42, "#9aa6b0");
    R(10, 44, 48, 6, "#a8a090"); R(10, 50, 48, 20, "#8a8a80"); R(10, 54, 48, 10, "#5a5e62"); for (let x = 12; x < 58; x += 8) R(x, 59, 4, 1, "#e8e4d0");   // 對面的房子、人行道、馬路
    R(12, 55, 8, 3, "#3a2e22"); R(20, 54, 1, 5, "#f08030"); R(21, 55, 1, 8, "#e8e4d0");   // 坑、護欄、停止線
    R(23, 55, 6, 2, "#c8c8c0"); R(31, 55, 6, 2, "#c8c8c0"); R(39, 55, 6, 3, "#8a8e94"); R(40, 54, 4, 1, "#8a8e94"); R(47, 55, 6, 3, "#e4e4e0");   // 粉筆框、押送車、後面的車
    for (let y = 28; y < 70; y += 2) for (let x = 10 + (y % 4 ? 1 : 0); x < 58; x += 6) P(x, y, "#5a8a5a66");   // 防護網
    R(10, 28, 1, 42, "#4a4438"); R(57, 28, 1, 42, "#4a4438"); R(33, 28, 2, 42, "#6a6456");
    R(6, 70, 58, 5, "#d8d0b8"); R(6, 74, 58, 1, "#9a927c"); for (let x = 8; x < 62; x += 3) P(x, 71 + (x % 2), "#c0b8a0");   // 窗台和上面的灰
    R(44, 71, 2, 2, "#8a8270"); R(54, 71, 2, 2, "#8a8270"); R(44, 73, 1, 2, "#a8a08a"); R(54, 73, 1, 2, "#a8a08a");   // 兩個小圓印、拖過的痕跡
    // 門框上的身高刻度
    R(119, 28, 6, 48, "#8a7a5a"); R(119, 28, 1, 48, "#a8987a"); [34, 41, 47, 52, 56].forEach((y, i) => { R(120, y, 3 + (i % 2), 1, "#3a2a1a"); });
    // 通往防火梯的鐵門
    R(148, 18, 30, 58, "#5a5e58"); if (o.pre){ R(150, 20, 26, 56, "#7a8078"); R(152, 46, 3, 6, "#4a4e48"); for (let y = 24; y < 74; y += 8) R(151, y, 24, 1, "#6a7068"); }
    else { R(150, 20, 26, 56, "#c8d4dc"); R(150, 20, 9, 56, "#7a8078"); R(158, 20, 1, 56, "#4a4e48"); R(160, 44, 16, 2, "#6a6a6e"); R(160, 44, 2, 32, "#6a6a6e"); R(174, 44, 2, 32, "#6a6a6e"); for (let y = 52; y < 76; y += 6) R(160, y, 16, 1, "#8a8a8e"); R(152, 48, 3, 3, "#c8a040"); }
    // 地板
    R(0, 76, W, 32, "#8a8272"); for (let x = 0; x < W; x += 24) R(x, 76, 1, 32, "#7a7262"); R(0, 76, W, 1, "#5a5446");
    for (let k = 0; k < 10; k++) R((k * 43) % 180 + 4, 82 + (k * 13) % 22, 3, 1, "#9a9282");
    // 倒在地上的椅子
    R(127, 70, 20, 3, "#7a5a3a"); R(127, 62, 3, 9, "#7a5a3a"); R(144, 73, 2, 6, "#6a4a2a"); R(128, 73, 2, 6, "#6a4a2a");
    // 窗下的紙板、菸蒂
    R(66, 84, 34, 5, "#b89a6a"); R(66, 84, 34, 1, "#d0b282"); R(83, 84, 1, 5, "#9a7e52"); R(73, 86, 5, 2, "#a08458"); R(88, 86, 5, 2, "#a08458");
    if (n >= 3){ R(104, 86, 3, 1, "#e8c040"); P(107, 86, "#5a5a5a"); R(109, 87, 3, 1, "#e8c040"); P(108, 87, "#5a5a5a"); R(106, 88, 3, 1, "#e8c040"); P(109, 88, "#3a3a3a"); }
    else if (n === 1){ R(104, 87, 3, 1, "#e8c040"); R(107, 87, 5, 1, "#f4f4f0"); R(112, 87, 2, 1, "#9a9a9a"); }
  };

  /* ---------- 督察組會議室：沿用第 34 集。白板換成兩條路線；o.pm＝第二天（多一個藍色的箱子、收紙籃裡有紙）；o.night＝晚上（收工幕間） ---------- */
  SC.c35_meet = (o) => { SC.c34_meet(Object.assign({}, o, { pm:!!o.pm, hh:o.hh !== undefined ? o.hh : (o.pm ? 8 : 10), mm:o.mm !== undefined ? o.mm : 30 }));
    R(57, 11, 58, 32, "#f8f8f4");
    R(61, 16, 4, 4, "#3f5a7a"); R(107, 14, 5, 6, "#6a5a4a"); R(65, 18, 42, 1, "#2a3a6a");   // 警察局、地檢署、中正路
    for (let k = 0; k < 16; k++) P(63, 20 + k, "#2a3a6a"); R(63, 36, 44, 1, "#2a3a6a"); for (let k = 0; k < 16; k++) P(109, 20 + k, "#2a3a6a");   // 港濱路：繞一圈
    for (let x = 62; x < 112; x += 4) R(x, 40, 2, 1, "#6aa0d0");   // 海
    [[-2, -2], [-1, -1], [0, 0], [1, 1], [2, 2], [-2, 2], [-1, 1], [1, -1], [2, -2]].forEach(([a, b]) => P(86 + a, 36 + b, "#c83a2a"));   // 叉
    PR.tiny("9:20", 78, 27, "#c83a2a"); PR.tiny("9", 84, 13, "#2a3a6a");
    if (o.night){ PR.g().fillStyle = "#0a1020"; R(7, 13, 38, 32, "#141c2c"); for (let k = 0; k < 34; k++) R(8 + (k * 7) % 36, 14 + (k * 11) % 28, 1, 3, "#5a6a80"); R(26, 13, 1, 32, "#6a7480"); veil("rgba(10,14,30,.22)"); }
  };

  /* ---------- 海風咖啡的門面：沿用 cafe.js。o.wet＝窗台的花箱被澆到水流下來，在地上積了一小灘 ---------- */
  SC.c35_cafe = (o) => { const sky0 = PR.sky;   // 這兩天都是陰天：只把天空換成灰的，其他照舊
    if (o.time !== "night") PR.sky = (a, b, h) => sky0(o.dark ? "#6a7480" : "#8a96a2", o.dark ? "#98a2aa" : "#b4bcc2", h);
    try { SC.cafe(Object.assign({ time:"noon", ep:35 }, o)); } finally { PR.sky = sky0; }
    if (o.wet){ R(9, 64, 1, 7, "#7a9ab8"); R(22, 64, 1, 6, "#7a9ab8"); R(27, 64, 1, 7, "#7a9ab8"); R(4, 60, 30, 1, "#5a3a22"); R(4, 71, 26, 2, "#8aa4bc"); R(8, 73, 16, 1, "#8aa4bc"); R(10, 71, 8, 1, "#a8c0d4"); }
    if (o.shut){ R(40, 32, 18, 42, "#7a8490"); for (let y = 34; y < 74; y += 3) R(40, y, 18, 1, "#6a7480"); R(43, 46, 12, 9, "#f4f0e0"); R(45, 48, 8, 1, "#c83a2a"); R(45, 50, 8, 1, "#3a3a3a"); R(45, 52, 6, 1, "#3a3a3a"); R(6, 30, 26, 30, "#3a3e44"); }   // 鐵門拉下來，貼著一張紙
  };

  /* ---------- 咖啡店・櫃台的裡面（工作區）：左邊是往上推的窗（開著，外面是花箱、第一桌、對面的警察局）；
     靠牆的工作台 x44–156（y56–76）：咖啡機 x46–62、架子上的電話 x64–80（y36–48）、平板 x102–114、收銀機 x122–138、一疊紙杯架 x140–152；
     牆上的杯架 x86–120、照片 x126–146；右邊是儲藏室的門 x160–180。o.night＝打烊以後；o.shutWin＝窗戶關著 */
  SC.c35_counter = (o) => { o = Object.assign({}, o, stOf(o)); const n = !!o.night;
    R(0, 0, W, 76, n ? "#5a4e42" : "#e8dcc4"); R(0, 0, W, 6, n ? "#3a3028" : "#b8a888"); R(0, 62, W, 14, n ? "#4a4036" : "#d8c8a8");
    // 窗
    R(4, 14, 38, 36, "#6a4a32"); R(6, 16, 34, 32, n ? "#141c2c" : "#a4b0ba");
    if (!n){ R(6, 34, 34, 14, "#c8c0b0"); R(22, 24, 16, 12, "#d8dce0"); R(22, 24, 16, 2, "#2a4a7a"); for (let j = 0; j < 3; j++) R(24 + j * 5, 28, 3, 3, "#7a90a8"); R(6, 40, 34, 3, "#7a7a76");   // 對面的警察局、馬路
      R(8, 43, 12, 2, "#e8e8e4"); R(13, 45, 2, 3, "#5a5a5e"); R(6, 42, 1, 6, "#3a3a3e"); R(21, 42, 1, 6, "#3a3a3e"); }   // 外面的第一桌
    else { R(24, 26, 14, 10, "#1e2638"); R(26, 29, 3, 3, "#e8d080"); R(32, 29, 3, 3, "#e8d080"); }
    if (o.shutWin){ R(6, 16, 34, 1, "#6a4a32"); R(6, 31, 34, 2, "#6a4a32"); dither(6, 16, 34, 32, "#ffffff22", 3); }
    else { R(6, 16, 34, 9, n ? "#2a3444" : "#bcc6ce"); R(6, 24, 34, 2, "#6a4a32"); R(6, 16, 34, 1, "#6a4a32"); }   // 往上推開的那一扇
    for (let x = 8; x < 38; x += 4){ R(x, 45, 3, 3, "#4a8a3a"); P(x + 1, 44, ["#e85a6a", "#f4d04a", "#f4f0f0"][(x >> 2) % 3]); }   // 窗台外面的花
    R(4, 48, 38, 2, "#8a6a4a");
    // 牆上的杯架、照片、WC 的箭頭
    R(86, 14, 34, 1, "#6a4a32"); R(86, 22, 34, 1, "#6a4a32"); R(86, 30, 34, 1, "#6a4a32"); R(86, 14, 1, 17, "#6a4a32"); R(119, 14, 1, 17, "#6a4a32");
    for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++){ R(88 + c * 5, 17 + r * 8, 4, 5, ["#f4f4f0", "#c84a3a", "#3a6aa8", "#e8c040", "#4a8a5a", "#f4f4f0"][(c + r * 2) % 6]); P(92 + c * 5, 19 + r * 8, "#8a8a8a"); }
    R(126, 14, 20, 16, "#5a4a3a"); R(128, 16, 16, 12, "#8ab4d0"); R(128, 24, 16, 4, "#3a6a8a"); R(132, 20, 9, 4, "#c83a2a"); R(134, 17, 2, 3, "#e8e4d8"); R(138, 18, 2, 2, "#e8e4d8");   // 貨櫃輪的照片
    R(145, 7, 17, 9, "#3a5a4a"); txt("廁所", 147.5, 14, "#f4f0e0", "6px sans-serif");
    // 架子上的電話
    R(62, 48, 20, 2, "#6a4a32"); R(63, 50, 1, 6, "#6a4a32"); R(80, 50, 1, 6, "#6a4a32");
    R(65, 41, 14, 7, "#e0d4b4"); R(65, 41, 14, 1, "#f0e8cc"); R(66, 38, 12, 3, "#c8bc9c"); R(66, 38, 2, 3, "#e0d4b4"); R(76, 38, 2, 3, "#e0d4b4"); for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) P(70 + c * 2, 43 + r * 2, "#5a5a5a"); P(66, 46, "#8a8a8a"); P(65, 47, "#8a8a8a");
    R(82, 36, 8, 10, "#f8f4e0"); for (let k = 0; k < 3; k++) R(83, 38 + k * 2, 6, 1, "#5a5a5a"); P(86, 35, "#c83a2a");   // 貼在旁邊的號碼表
    // 工作台
    R(44, 56, 114, 20, n ? "#5a3a22" : "#8a5a30"); R(44, 56, 114, 2, n ? "#7a5a3a" : "#a87a50"); for (let x = 60; x < 156; x += 24) R(x, 60, 1, 16, "#6a4a2a"); for (let x = 50; x < 156; x += 24) R(x, 66, 3, 1, "#c8a870");
    R(46, 40, 16, 16, "#5a5a5e"); R(46, 40, 16, 2, "#8a8a8e"); R(48, 44, 5, 4, "#2a2a2e"); R(55, 44, 5, 4, "#2a2a2e"); R(50, 50, 2, 4, "#8a8a8e"); R(57, 50, 2, 4, "#8a8a8e"); R(48, 54, 12, 2, "#3a3a3e"); R(49, 37, 3, 3, "#f4f4f0"); R(54, 37, 3, 3, "#f4f4f0");   // 咖啡機
    R(104, 45, 9, 9, "#2a2a2e"); R(105, 46, 7, 7, n ? "#3a4a6a" : "#4a7a9a"); R(107, 54, 3, 2, "#5a5a5e"); if (o.dot){ P(108, 49, "#ff3a2a"); P(107, 50, "#8ad0e8"); P(109, 51, "#8ad0e8"); }   // 平板
    R(122, 48, 16, 8, "#4a4e56"); R(124, 44, 10, 5, "#5a5e66"); R(125, 45, 8, 2, "#8ad0a8"); R(134, 46, 3, 2, "#f4f0e0"); for (let c = 0; c < 4; c++) P(124 + c * 3, 51, "#c8c8c8"); R(123, 54, 14, 1, "#2a2e36");   // 收銀機
    for (let k = 0; k < 4; k++){ R(141, 54 - k * 2, 10, 1, "#c8a070"); R(141, 53 - k * 2, 10, 1, "#b08a58"); } R(143, 46, 6, 1, "#d8b888");   // 一疊紙杯架
    if (o.cupsOut){ R(92, 52, 10, 4, "#c8a070"); [93, 96, 99].forEach(x => R(x, 49, 2, 3, "#f4f4f0")); R(114, 53, 6, 3, "#c8a070"); R(115, 50, 2, 3, "#f4f4f0"); R(118, 50, 2, 3, "#f4f4f0"); }   // 裝好的兩個紙杯架
    // 儲藏室的門：開著一條縫，裡面是咖啡豆的麻袋
    R(158, 20, 24, 56, "#6a4a32"); R(160, 22, 20, 54, n ? "#3a3028" : "#a88a68"); R(160, 22, 5, 54, "#1e1a16"); R(161, 60, 3, 8, "#a88a5a"); R(161, 68, 3, 8, "#b8986a"); P(162, 62, "#f4f0e0"); R(176, 48, 2, 4, "#e8c040");
    // 地板
    R(0, 76, W, 32, n ? "#3a3430" : "#7a6a5a"); for (let x = 0; x < W; x += 12) R(x, 76, 1, 32, n ? "#322c28" : "#6a5a4a"); for (let y = 84; y < H; y += 8) R(0, y, W, 1, n ? "#322c28" : "#6a5a4a"); R(0, 76, W, 1, "#4a3a2a");
    if (n) veil("rgba(10,12,28,.25)");
  };

  /* ---------- 漁港的公共電話（晚上）：沿用第 34 集冰店門口，蓋一層夜色；o.lights＝對面車燈亮起來 ---------- */
  SC.c35_front = (o) => { o = Object.assign({}, o, stOf(o)); SC.c34_front(Object.assign({}, o, { shut:true, bike:true }));
    veil("rgba(6,10,28,.62)"); const g = PR.g(); g.fillStyle = "rgba(255,230,160,.16)"; g.fillRect(62, 34, 34, 46);
    if (o.lights){ g.fillStyle = "rgba(255,250,220,.30)"; g.fillRect(0, 40, W, 60); g.fillStyle = "rgba(255,250,220,.25)"; g.fillRect(40, 30, 90, 70); } };

  /* ---------- 行車紀錄器：從第二台車的擋風玻璃往前看。前面是押送車的車尾、再前面兩台車、舉牌子的人、護欄；右上角是那一棟舊公寓
     o.go＝還在開（路面的線在動）；o.turn＝押送車打方向燈；o.sign＝"stop"／"go"；o.hit＝右後車窗碎了、右後座的人倒下去 */
  SC.c35_pov = (o) => { o = Object.assign({}, o, stOf(o)); const t = o.t || 0, vx = 96, vy = 40;
    R(0, 0, W, vy, "#8a96a2"); R(0, vy - 12, W, 12, "#a8a090"); for (let x = 0; x < W; x += 22) R(x + 3, vy - 9, 8, 5, "#7a8a94");
    R(150, 2, 34, vy - 2, "#7a7e72"); for (let y = 2; y < vy; y += 2) for (let x = 150 + (y % 4 ? 1 : 0); x < 184; x += 2) P(x, y, "#5a8a5a"); [156, 165, 174].forEach(x => { R(x, 6, 5, 5, "#1e2226"); R(x, 16, 5, 5, "#1e2226"); R(x, 26, 5, 5, "#1e2226"); });
    R(0, vy, W, H - vy, "#5a5e62"); const g = PR.g(); g.fillStyle = "#63676b"; g.beginPath(); g.moveTo(vx - 30, vy); g.lineTo(vx + 30, vy); g.lineTo(W + 40, H); g.lineTo(-40, H); g.closePath(); g.fill();
    const off = o.go ? (t * 1.2) % 1 : 0.3; for (let k = 0; k < 6; k++){ const z = (k + off) / 6, y = vy + (H - vy) * z * z; R(vx - 34 - 60 * z * z, y, 1 + 2 * z, 2 + 5 * z * z, "#e8e4d0"); }
    if (o.sign){ // 護欄和舉牌子的人（左前方）
      for (let x = 20; x < 62; x += 6){ R(x, 52, 3, 2, "#f08030"); R(x + 3, 52, 3, 2, "#f4f4f0"); } R(24, 44, 30, 8, "#3a2e22");
      R(64, 46, 4, 9, "#f08030"); R(65, 43, 3, 3, "#e8c09a"); R(64, 42, 5, 1, "#f4d020"); R(69, 40, 1, 10, "#8a8a86"); R(67, 36, 6, 6, o.sign === "stop" ? "#d83a2a" : "#3aa84a"); R(68, 38, 4, 1, "#f4f4f0");
      R(78, 44, 12, 7, "#e8e8e4"); R(80, 42, 8, 3, "#e8e8e4"); R(81, 43, 6, 2, "#7aa0c0"); R(92, 43, 13, 8, "#3a6aa8"); R(94, 41, 9, 3, "#3a6aa8"); R(95, 42, 7, 2, "#7aa0c0"); }   // 前面的兩台車
    // 押送車的車尾
    const cx = o.turn ? 96 + Math.round((o._p || 0) * 26) : 96, cy = 54;
    R(cx - 20, cy, 40, 16, "#8a8e94"); R(cx - 16, cy - 9, 32, 10, "#8a8e94"); R(cx - 14, cy - 7, 28, 7, "#6a8aa8");
    R(cx - 9, cy - 6, 5, 5, "#3a4250"); if (o.hit) R(cx + 2, cy - 3, 6, 3, "#3a4250"); else R(cx + 4, cy - 6, 5, 5, "#3a4250");   // 後座的兩個人影；右邊的那一個倒下去了
    if (o.hit){ R(cx + 16, cy - 7, 3, 6, "#e8eef2"); P(cx + 20, cy - 8, "#f4f8fa"); P(cx + 22, cy - 5, "#f4f8fa"); P(cx + 21, cy - 2, "#c8d0d8"); P(cx + 19, cy - 10, "#c8d0d8"); P(cx + 24, cy - 7, "#c8d0d8"); P(cx + 13, cy - 5, "#e8eef2"); P(cx + 11, cy - 3, "#c8d0d8"); }   // 右後的車窗碎了：白白的一片，碎玻璃往車子裡面飛
    R(cx - 20, cy + 3, 5, 3, "#c83a2a"); R(cx + 15, cy + 3, 5, 3, (o.turn && Math.floor(t * 4) % 2) ? "#ffb020" : "#c83a2a"); R(cx - 6, cy + 9, 12, 4, "#f4f4f0"); R(cx - 20, cy + 15, 40, 2, "#3a3e46"); R(cx - 17, cy + 16, 7, 4, "#1a1a1a"); R(cx + 10, cy + 16, 7, 4, "#1a1a1a");
    R(0, H - 12, W, 12, "#1e1e22"); R(0, H - 13, W, 1, "#3a3a3e"); R(0, 0, W, 3, "#1e1e22");   // 儀表板、車頂的邊
    if (o.flash) veil("#ffffff30");
  };

  /* ---------- 人物造型 ---------- */
  const AL = id => (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null;
  const LOOK = {
    wu:    Object.assign({ skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", glasses:true, top:"#f0a040", bottom:"#3a5a8a" }, AL("wu") || {}, { hello:"學長。" }),
    li:    Object.assign({ skin:"#e8c09a", hair:"#1e1e1e", hairStyle:"slick", top:"#ffffff", bottom:"#1e2230" }, AL("li") || {}, { hello:"問。" }),
    ye:    Object.assign({ skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"pony", top:"#f4f4f0", coat:"#6a6e76", bottom:"#3a3e48" }, AL("ye") || {}, { hello:"沈警官。" }),
    xu:    Object.assign({ skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" }, AL("xu") || {}, { hello:"要看什麼，說。" }),
    cao:   { skin:"#d8a880", hair:"#3a3430", hairStyle:"short", top:"#e9e4da", coat:"#4a5a6a", bottom:"#2a2f3a", mood:"tired", hello:"……沈警官。" },
    yuan:  { skin:"#e8c09a", hair:"#1a1410", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a", mood:"sad", hello:"學長。" },
    liu:   { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", hello:"沈警官。" },
    tang:  { age:"old", skin:"#c89a70", hair:"#5a5650", hairStyle:"short", top:"#f08030", coat:"#f4d020", bottom:"#3a4a5a", hat:"cap", capColor:"#f4d020", hello:"警察先生。我今天什麼都沒有動。" },
    lin:   Object.assign({ age:"old", skin:"#c89a70", hair:"#9a9a94", hairStyle:"short", top:"#4a5a6a", coat:"#6a6a4a", bottom:"#3a3a34", mood:"tired" }, AL("lin") || {}, { hello:"……又是你。" }),
    barista: Object.assign({ skin:"#d8a880", hair:"#3a3430", hairStyle:"short", beard:true, top:"#f4f4f0", apron:"#6a4a2a", bottom:"#3a3a40" }, AL("barista") || {}, { hello:"沈警官。老樣子？" }),
    abin:  Object.assign({ skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#c83a2a", bottom:"#3a4a6a", hat:"cap", capColor:"#1e1e22" }, AL("abin") || {}, { hello:"警官！" }),
    su:    Object.assign({ skin:"#e8c8a8", hair:"#2a2220", hairStyle:"slick", glasses:true, top:"#f4f4f0", coat:"#24324e", bottom:"#24324e", tie:"#8a2a2a" }, AL("su") || {}, { hello:"沈警官。辛苦了。" }),
    zeng:  { skin:"#d8a880", hair:"#2a2220", hairStyle:"short", glasses:true, top:"#e8e8e0", coat:"#4a6a5a", bottom:"#3a3a40", hello:"沈警官。這一次查什麼？" }
  };
  const DAILY = {
    wu:    [ { room:"road", x:170, pose:"stand", doing:"站在你們的車子旁邊，一直看著前面那一台灰色的車。" }, { room:"meet", x:30, pose:"read", doing:"站在會議桌的旁邊，在看電信局傳來的那兩頁紙。" } ],
    xu:    [ { room:"road", x:104, pose:"write", doing:"站在押送車的旁邊，在本子上記數字。手上的雷射筆一直在轉。" }, { room:"bench", x:60, pose:"type", doing:"站在工作台的前面。昨天帶回來的東西，一袋一袋排在旁邊。" } ],
    tang:  [ { room:"road", x:62, pose:"stand", doing:"站在護欄的旁邊，管制牌夾在手臂下面。今天，他不用舉了。" }, { room:"road", x:62, pose:"stand", doing:"站在護欄的旁邊，在等警察說可以復工。" } ],
    lin:   [ { room:"lshop", x:70, pose:"cross", doing:"站在櫃台的前面，手抱在胸前。" }, { room:"lshop", x:140, pose:"stand", doing:"站在窗前，看著外面的路口。" } ],
    li:    [ { room:"meet", x:66, pose:"cross", doing:"站在白板的前面，看著那一個叉。" }, { room:"meet", x:66, pose:"write", doing:"站在白板的前面，在寫給上面的報告。寫了兩行，又劃掉。" } ],
    ye:    [ { room:"meet", x:158, pose:"read", doing:"站在門邊，在整理一疊文件的邊角。" }, { room:"meet", x:158, pose:"read", doing:"站在門邊，手上是一張還沒有填完的聲請書。" } ],
    cao:   [ { room:"lobby", x:52, pose:"stand", doing:"站在公布欄的前面。他不是在看公布欄。" }, { room:"lobby", x:52, pose:"stand", doing:"站在公布欄的前面，在等督察組叫他上去。" } ],
    yuan:  [ { room:"lobby", x:76, pose:"stand", doing:"靠著牆站著。袖口上的口子，還沒有換掉。" }, { room:"lobby", x:76, pose:"stand", doing:"靠著牆站著。換了一件襯衫。" } ],
    liu:   [ { room:"lobby", x:112, pose:"stand", doing:"站在值班台的後面。" }, { room:"lobby", x:112, pose:"write", doing:"站在值班台的後面，在寫值班日誌。" } ],
    barista: [ { room:"counter", x:96, pose:"polish@cup", doing:"站在櫃台的裡面，在擦杯子。同一個杯子，擦了很久。" }, { room:"counter", x:96, pose:"polish@cup", doing:"站在櫃台的裡面，在擦杯子。" } ],
    abin:  [ { room:"seat", x:100, pose:"phone", doing:"站在自己的機車旁邊，在看手機上的新聞。" }, { room:"seat", x:100, pose:"stand", doing:"站在自己的機車旁邊，在等老闆簽今天的單子。" } ],
    su:    [ { room:"seat", x:172, pose:"read", doing:"站在最右邊那一桌的旁邊，在看報紙。咖啡放在桌上，還冒著煙。" }, { room:"seat", x:172, pose:"read", doing:"站在最右邊那一桌的旁邊，在看報紙。和每一天一樣。" } ],
    zeng:  [ { room:"hall", x:62, pose:"write", doing:"站在漁會的櫃台旁邊，在對今天的拍賣單。" }, { room:"hall", x:62, pose:"write", doing:"站在漁會的櫃台旁邊，在對今天的拍賣單。" } ]
  };
  EP35.suspects.forEach(s => {
    if (LOOK[s.id]){ if (LOOK[s.id].hello) s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  const KNOW5 = ["o35_laser", "x3"];   // 知道子彈是從五樓來的，才會去那一棟
  EP35.rooms = {
    cross: [
      { id:"road", name:"港濱路口", scene:"c35_cross", opt:(ph, has) => ({ dark:ph > 0, cup:moved(), cupOut:!!(has && has("o35_carrier")) }), details:[
        { id:"d35_porridge", name:"阿娥粥店", hot:[110,22,34,38], text:"阿娥粥店今天沒有開。\n鐵捲門上貼了一張紙：「路口有事，休息一天。」" },
        { id:"d35_flower", name:"柱子上的塑膠花", hot:[33,25,10,7], text:"速限牌的柱子上，綁著一束褪色的塑膠花。\n一月的時候，有一個外送員，在這個路口沒有回家。" },
        { id:"d35_chalk", name:"地上的粉筆框", hot:[46,68,70,16], text:"兩個粉筆畫的框，寫著 1 和 2。\n出事的時候，排在押送車前面的那兩台車。\n車主做完筆錄，已經開走了。他們都說：只聽到一聲。" } ] },
      { id:"lshop", name:"林記釣具", scene:"c35_tackle", details:[
        { id:"d35_rods", name:"釣竿架", hot:[8,14,30,62], text:"一整排釣竿，照長度排好。\n最長的那幾支，要用長的袋子裝。街上背著那種袋子的人，沒有人會多看一眼。" },
        { id:"d35_radio", name:"架子上的收音機", hot:[46,20,14,10], text:"架子上的舊收音機，開著，聲音很小。\n新聞正在講港濱路口。他沒有關掉，也沒有轉大聲。" } ] },
      { id:"arcade", name:"港濱路 71 號・騎樓", scene:"c35_arcade", requires:KNOW5, details:[
        { id:"d35_mail", name:"信箱", hot:[58,34,18,16], text:"六個信箱，塞滿了廣告單。\n最上面的一張，是搬家公司的。" },
        { id:"d35_plant", name:"枯掉的盆栽", hot:[163,56,12,20], text:"一盆沒有人帶走的盆栽。\n葉子都掉光了。土是乾的，裂開了。" },
        { id:"d35_net", name:"防護網", hot:[20,2,80,16], text:"整棟樓罩著綠色的防護網。\n從外面看，每一扇窗戶都是黑的：裡面有沒有人，看不出來。" } ] },
      { id:"room5", name:"港濱路 71 號・五樓", scene:"c35_room5", requires:KNOW5, details:[
        { id:"d35_height", name:"門框上的刻度", hot:[118,28,8,48], text:"門框上，有原子筆畫的橫線。\n「小一」「小二」「小四」……最高的一條，寫著「國一」。\n這一家人，住到了孩子長大。" },
        { id:"d35_cal", name:"牆上的月曆", hot:[92,20,14,18], text:"月曆停在二月。\n28 號畫了一個圈：「搬家」。" },
        { id:"d35_chair", name:"倒在地上的椅子", hot:[127,62,20,17], text:"一張缺了一隻腳的木頭椅子，倒在地上。\n上面的灰是完整的：沒有人碰過它。" } ] }
    ],
    police: [
      { id:"meet", name:"3F 督察組會議室", scene:"c35_meet", opt:(ph) => ({ pm:ph > 0 }), details:[
        { id:"d35_blinds", name:"百葉窗", hot:[6,12,40,34], text:"百葉窗拉了下來。\n這一扇窗戶對著停車場。停車場的對面，就是海風咖啡的招牌。" },
        { id:"d35_clock", name:"牆上的鐘", hot:[124,8,11,11], text:"督察組的鐘，比樓下值班台的快兩分鐘。\n今天，沒有人去看它。" },
        { id:"d35_door", name:"會議室的門", hot:[166,22,20,54], text:"門的裡面，包了一層隔音棉。\n關上以後，裡面講的話，走廊上一個字都聽不到。" } ] },
      { id:"lobby", name:"1F 值班台", scene:"e_lobby", opt:{ night:false }, details:[
        { id:"d35_clock1", name:"值班台的鐘", hot:[92,6,12,12], text:"值班台後面的鐘。\n登記簿上的時間，都是照這一個鐘寫的。" },
        { id:"d35_stairs", name:"往地下室的樓梯", hot:[154,60,38,30], text:"往地下室的樓梯。車庫和證物室，都在下面。\n證物室的門，今天貼了封條。" },
        { id:"d35_glass", name:"大門", hot:[0,14,22,62], text:"玻璃的大門。\n出去，過一條馬路，就是海風咖啡。走路不用一分鐘。" } ] }
    ],
    cafe: [
      { id:"seat", name:"海風咖啡・外面的座位", scene:"c35_cafe", opt:(ph) => ({ time: ph > 0 ? "morning" : "noon", dark:ph > 0, wet:!moved() }), details:[
        { id:"d35_menu", name:"小黑板", hot:[66,52,14,18], text:"門口的小黑板。\n「今日咖啡：耶加雪菲」\n下面一行小字：「警察同仁　第二杯半價」。" },
        { id:"d35_across", name:"對面的警察局", hot:[122,22,56,38], text:"馬路的對面，就是警察局。\n坐在這裡，誰進去、誰出來，看得一清二楚。" },
        { id:"d35_table3", name:"第三桌", hot:[148,76,20,22], text:"最右邊的一桌。蘇律師的咖啡杯、摺好的報紙、一副老花眼鏡的盒子。\n每一天，都擺在一樣的位置。" } ] },
      { id:"counter", name:"海風咖啡・櫃台的裡面", scene:"c35_counter", details:[
        { id:"d35_cups", name:"牆上的杯架", hot:[86,14,34,17], text:"常客的杯子，一人一個。\n黃色的是小吳的。白色的那一個，杯底用簽字筆寫了一個「沈」。" },
        { id:"d35_machine", name:"咖啡機", hot:[46,37,16,19], text:"擦得很亮的咖啡機。\n蒸氣管上，一點奶垢都沒有。" } ] }
    ],
    lab: [
      { id:"bench", name:"鑑識中心", scene:"c32_lab", details:[
        { id:"d35_scope", name:"比對顯微鏡", hot:[28,44,16,18], text:"比對顯微鏡。兩個鏡頭，可以把兩顆彈頭並排著看。\n旁邊的架子上，有一格貼著標籤：「沈國棟案」。那一格的檢體，沒有動過。" },
        { id:"d35_screen", name:"螢幕", hot:[128,40,30,26], text:"螢幕上，是 DNA 資料庫的比對畫面。\n最新建檔的幾筆裡，有一筆是 3 月 9 日的。" } ] }
    ],
    market: [
      { id:"hall", name:"漁會櫃台", scene:"c32_hall", details:[
        { id:"d35_lockers", name:"置物櫃", hot:[160,18,27,34], text:"搬運工的置物櫃。\n最右邊的那一格，門還是開著的。名牌已經拿掉了。" },
        { id:"d35_auction", name:"白板", hot:[68,12,54,32], text:"今天的拍賣價。\n白帶魚的那一行，被人用紅筆圈了起來。" },
        { id:"d35_scale", name:"磅秤", hot:[122,56,20,30], text:"櫃台旁邊的磅秤。\n秤盤上，還有一點沒有擦乾的冰水。" } ] }
    ]
  };
  EP35.phases[0].scene = "c35_cross"; EP35.phases[0].sceneOpt = {};
  EP35.phases[1].scene = "c35_meet"; EP35.phases[1].sceneOpt = { pm:true };

  /* ---------- 監視器動畫 ---------- */
  const strip = L => { const o = Object.assign({}, L || {}); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const CAI = Object.assign({ skin:"#e8c8a8", hair:"#2a2220", hairStyle:"short", top:"#f4f4f0", coat:"#b8a070", bottom:"#3a3a40" }, AL("cai") || {});
  const HEI = Object.assign({ skin:"#b88a60", hair:"#1a1410", hairStyle:"short", top:"#2a2a2e", coat:"#2a2a2e", bottom:"#3a3a34" }, AL("heigou") || {});
  EP35.looks = { youC:YOU, wuC:strip(LOOK.wu), liC:strip(LOOK.li), yeC:strip(LOOK.ye), xuC:strip(LOOK.xu), caoC:strip(LOOK.cao), yuanC:strip(LOOK.yuan), liuC:strip(LOOK.liu), barC:strip(LOOK.barista), abinC:strip(LOOK.abin),
    caiH:Object.assign(strip(CAI), { hat:"cap", capColor:"#2a2a2e" }), caiC:strip(CAI),
    heiH:Object.assign(strip(HEI), { hat:"cap", capColor:"#1a1a1e" }), heiC:strip(HEI) };
  const mk = (scene, opt, cam, date, beats, clean) => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join);
    return { scene, opt:Object.assign({}, opt, { ds, seq:beats.map(b => b.st || {}) }), cam, date, clean, beats:beats.map(b => { const o = Object.assign({}, b); delete o.st; return o; }) }; };
  const F = 96, DN = 146, SX = 208, SY = 146;   // 大廳：DN＝往鏡頭這一邊的樓梯間；(SX, SY)＝往地下室的樓梯口下面
  const LIU = [112, 74, "stand", -1];
  const P1 = "23:08，一台機車停進隔壁魚攤的騎樓，熄火，沒有開燈。", P2 = "23:09，一個戴全罩安全帽的人，走到電話的前面。", P3 = "23:10:05，他拿起話筒，投幣，撥號。", P4 = "23:10:22，兩台車的車燈同時亮了。他把話筒掛回去。沒有跑。";
  const A1 = "08:41:05，六個人從大門走進來。葉晴的公事包，抱在胸前。", A2 = "六個人往樓梯間走，上樓。", A3 = "09:03，黎光耀、葉晴下樓，往車庫。", A4 = "09:04，曹志翔、袁家銘下樓，往車庫。兩個人的手上，都沒有東西。", A5 = "09:06，你和小吳下樓。";
  const B1 = "08:22，小吳一個人走出大門。", B2 = "08:29:40，他回來了。兩隻手，各提著一個紙杯架。", B3 = "他往樓梯間走，上樓。", B4 = "09:04:20，曹志翔、袁家銘下樓，往車庫。袁家銘的手上，提著那一個兩杯的紙杯架。";
  const D1 = "09:08，兩台車從警察局的後門出來。", D2 = "09:10，押送車打方向燈，轉進港濱路。", D3 = "09:16，前面修路。舉牌子的人把牌子轉成「停」。押送車停下來：前面還有兩台車。", D4 = "09:20:14，舉牌子的人把牌子轉了過來。", D5 = "押送車右邊的車窗，忽然白了一片。聲音晚了一點才到：一聲。";
  const ANIM = {
    cctv35_phone: mk("c35_front", { cam:true }, "臨時鏡頭 01", "2027-03-10", [
      { t:"23:08:00", d:3, cap:P1, m:{} },
      { t:"23:09:00", d:4.5, cap:P2, m:{ caiH:[84, F, "stand", -1, 130, F] } },
      { t:"23:10:05", d:4, join:true, cap:P3, m:{ caiH:[84, F, "phone", -1] } },
      { t:"23:10:22", d:4, join:true, cap:P4, st:{ lights:true }, m:{ caiH:[84, F, "stand", 1] } }
    ]),
    cctv35_dash: mk("c35_pov", {}, "DASHCAM 二車", "2027-03-11", [
      { t:"09:08:00", d:3, cap:D1, st:{ go:true } },
      { t:"09:10:00", d:3.5, cap:D2, st:{ go:true, turn:true } },
      { t:"09:16:00", d:4, cap:D3, st:{ sign:"stop" } },
      { t:"09:20:14", d:3, cap:D4, st:{ sign:"go" } },
      { t:"09:20:15", d:4, join:true, cap:D5, st:{ sign:"go", hit:true, flash:true } }
    ]),
    cctv35_lobbyA: mk("e_lobby", { night:false, cam:true }, "1F LOBBY", "2027-03-11", [
      { t:"08:41:05", d:5, cap:A1, m:{ liuC:LIU, liC:[150, F, "stand", 1, -16, F], yeC:[132, F, "hold@bag", 1, -34, F], youC:[114, F, "stand", 1, -52, F], wuC:[96, F, "stand", 1, -70, F], caoC:[78, F, "stand", 1, -88, F], yuanC:[60, F, "stand", 1, -106, F] } },
      { t:"08:41:40", d:5, join:true, cap:A2, m:{ liC:[124, DN, "stand", -1, 150, F], yeC:[114, DN, "hold@bag", -1, 132, F], youC:[104, DN, "stand", -1, 114, F], wuC:[94, DN, "stand", 1, 96, F], caoC:[84, DN, "stand", 1, 78, F], yuanC:[74, DN, "stand", 1, 60, F] }, out:["liC","yeC","youC","wuC","caoC","yuanC"] },
      { t:"09:03:00", d:2.5, cap:A3, m:{ liuC:LIU, liC:[150, F, "stand", 1, 100, DN], yeC:[132, F, "hold@bag", 1, 82, DN] } },
      { t:"09:03:10", d:2.5, join:true, cap:A3, m:{ liC:[SX, SY, "stand", 1, 150, F], yeC:[SX, SY, "hold@bag", 1, 132, F] }, out:["liC","yeC"] },
      { t:"09:04:00", d:2.5, cap:A4, m:{ liuC:LIU, caoC:[150, F, "stand", 1, 100, DN], yuanC:[132, F, "stand", 1, 82, DN] } },
      { t:"09:04:10", d:2.5, join:true, cap:A4, m:{ caoC:[SX, SY, "stand", 1, 150, F], yuanC:[SX, SY, "stand", 1, 132, F] }, out:["caoC","yuanC"] },
      { t:"09:06:00", d:2.5, cap:A5, m:{ liuC:LIU, youC:[150, F, "stand", 1, 100, DN], wuC:[132, F, "stand", 1, 82, DN] } },
      { t:"09:06:10", d:2.5, join:true, cap:A5, m:{ youC:[SX, SY, "stand", 1, 150, F], wuC:[SX, SY, "stand", 1, 132, F] }, out:["youC","wuC"] }
    ]),
    cctv35_lobbyB: mk("e_lobby", { night:false, cam:true }, "1F LOBBY", "2027-03-11", [
      { t:"08:22:00", d:4, cap:B1, m:{ liuC:LIU, wuC:[-16, F, "stand", -1, 100, DN] }, out:["wuC"] },
      { t:"08:29:40", d:4.5, cap:B2, m:{ liuC:LIU, wuC:[120, F, "hold@tray", 1, -16, F] } },
      { t:"08:29:55", d:3, join:true, cap:B3, m:{ wuC:[100, DN, "hold@tray", -1, 120, F] }, out:["wuC"] },
      { t:"09:03:00", d:2.5, cap:A3, m:{ liuC:LIU, liC:[150, F, "stand", 1, 100, DN], yeC:[132, F, "hold@bag", 1, 82, DN] } },
      { t:"09:03:10", d:2.5, join:true, cap:A3, m:{ liC:[SX, SY, "stand", 1, 150, F], yeC:[SX, SY, "hold@bag", 1, 132, F] }, out:["liC","yeC"] },
      { t:"09:04:20", d:2.5, cap:B4, m:{ liuC:LIU, caoC:[150, F, "stand", 1, 100, DN], yuanC:[132, F, "carry@box", 1, 82, DN] } },
      { t:"09:04:30", d:2.5, join:true, cap:B4, m:{ caoC:[SX, SY, "stand", 1, 150, F], yuanC:[SX, SY, "carry@box", 1, 132, F] }, out:["caoC","yuanC"] },
      { t:"09:06:00", d:2.5, cap:A5, m:{ liuC:LIU, youC:[150, F, "stand", 1, 100, DN], wuC:[132, F, "stand", 1, 82, DN] } },
      { t:"09:06:10", d:2.5, join:true, cap:A5, m:{ youC:[SX, SY, "stand", 1, 150, F], wuC:[SX, SY, "stand", 1, 132, F] }, out:["youC","wuC"] }
    ])
  };
  ["cctv35_lobbyA", "cctv35_lobbyB"].forEach(k => { ANIM[k].stairs = [[SX, SY, 150, F, 7]]; });
  [...EP35.cctv, ...EP35.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案 ---------- */
  const mkR = beats => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join); const seq = beats.map(b => b.st || {});
    return beats.map(b => { const o = Object.assign({}, b, { opt:Object.assign({}, b.opt || {}, { ds, seq }) }); delete o.st; return o; }); };
  const R_NIGHT = { t:"3/10 23:10", d:5.5, cap:"3 月 10 日，23:10。打烊以後的店裡。漁港那一頭有人拿起了公共電話；同一分鐘，這一支電話也打了出去。四十秒。", scene:"c35_counter", opt:{ night:true, shutWin:true }, m:{ barC:[84, F, "phone", -1] } };
  const R_END = [
    { t:"09:16", d:5, cap:"09:16，押送車停在管制線的前面，第三台。每一台等管制的車，都停在一樣的位置。", scene:"c35_cross", opt:{ pre:true }, m:{} },
    { t:"09:20", d:5.5, cap:"09:20。五樓，窗台上架著兩隻腳。七十二公尺。一槍。", scene:"c35_room5", opt:{ pre:true }, m:{ heiC:[88, 90, "kneel+aim", -1] } },
    { t:"09:21", d:5, cap:"他沒有從樓梯下去。後面的鐵門撬開，防火梯，後巷。機車留在了騎樓下面。", scene:"c35_room5", opt:{}, m:{ heiC:[190, F, "stand", 1, 100, F] }, out:["heiC"] }
  ];
  const RB_A = mkR([
    R_NIGHT,
    { t:"3/11 08:32", d:6, cap:"3 月 11 日，08:32。第一桌。黎光耀把路線講了一次，聲音很小。窗戶是開的。窗戶的裡面，有人在澆花。", scene:"c35_counter", opt:{ night:false, shutWin:false }, m:{ barC:[26, F, "pour@can", -1] } },
    { t:"08:41", d:5.5, cap:"08:41。六個人走進了對面的大門。櫃台裡面的電話，打了出去。二十八秒。阿彬在儲藏室裡搬第二袋豆子。", scene:"c35_counter", opt:{ night:false, shutWin:false }, m:{ barC:[84, F, "phone", -1], abinC:[176, F, "hold@bag", 1, 140, F] } },
    { t:"08:55", d:5.5, cap:"08:55。一台沒有車牌的白色機車，從等管制的車子旁邊鑽過去，騎進了 71 號的騎樓。", scene:"c35_arcade", opt:{}, m:{ heiH:[150, F, "carry@bag", 1, 186, F] } },
    ...R_END
  ]);
  const RB_B = mkR([
    R_NIGHT,
    { t:"3/11 08:24", d:6, cap:"3 月 11 日，08:24。小吳在櫃台的外面等。兩杯要帶上車的，另外裝。那個小紙杯架的夾層裡，多了一張會回報位置的卡片。", scene:"c35_counter", opt:{ night:false, shutWin:false, cupsOut:true }, m:{ barC:[116, F, "reach", 1] } },
    { t:"09:10", d:5.5, cap:"09:10。平板上的那一個點，轉進了港濱路。櫃台裡面的電話，打了出去。十九秒。", scene:"c35_counter", opt:{ night:false, shutWin:false, dot:true }, m:{ barC:[84, F, "phone", -1] } },
    { t:"09:13", d:5.5, cap:"09:13。一台沒有車牌的白色機車，騎得很急，鑽進了 71 號的騎樓。押送車，還有三分鐘到。", scene:"c35_arcade", opt:{}, m:{ heiH:[150, F, "carry@bag", 1, 186, F] } },
    ...R_END
  ]);
  const arcHas = f => typeof ARC !== "undefined" && ARC.has && ARC.has(f);
  const arrest = () => { try { if (typeof S !== "undefined" && S && S.done && typeof C !== "undefined" && C && C.id === "escort" && typeof ARC !== "undefined" && !ARC.has("barista_arrested")) ARC.set("barista_arrested", "escort", "found"); } catch (e) {} };
  // 他供得出多少，看以前在咖啡店講過多少
  const told = () => {
    const a = [];
    if (arcHas("m_leak_cafe_3")) a.push("「沈警官跟我『講個大概』的那一件，我記得最清楚。他講的時候，很累。」");
    if (arcHas("m_leak_cafe_8")) a.push("「他的筆記本，攤在桌上的那一次，我看了半頁。半頁，夠了。」");
    if (arcHas("c_warn_barista")) a.push("「沈警官警告過我一次，叫我不要碰他的筆記。從那一次以後，我只用聽的。」");
    return a.length ? "他能講得出來的，比葉晴以為的多。\n" + a.join("\n") + "\n" : "你在那一張桌子上講過的案子，他一件都講不出來。他能講的，都是別人的。\n";
  };
  const END_COMMON = () => "下午三點，葉晴帶著搜索票，走進了海風咖啡。\n梁文海把擦到一半的杯子放了下來。他沒有問為什麼。\n「錢，我收了。話，我傳了。」他說。「我只是賣咖啡，聽故事。」\n" + told() + "葉晴問他：電話的那一頭是誰。他看著窗台的那一箱花，沒有再開口。\n最右邊那一桌的報紙摺了起來。蘇律師走過來，把名片放在櫃台上：「梁先生，從現在開始，你一句話都不用說。我是他的辯護人。」\n傍晚，海風咖啡的鐵門拉了下來。門上貼了一張紙：「店休一週」。\n五樓窗邊的那個人，還沒有找到。槍，也沒有。\n蔡明宏的那一個字，寫進了筆錄。後面，什麼都沒有加。";
  EP35.court = {
    title: "督察組會議室・3 月 12 日 下午", scene: "c35_meet", opt:{ pm:true, hh:13, mm:0 },
    who: ph => ["li", "ye", "wu"],
    open: ph => "會議室的門關著。白板上的那一個叉，沒有人擦掉。黎光耀把筆放在桌上。「說。那一條路，是怎麼出去的？」",
    kindLine: {
      inside: "知道路線的六個人裡面，有人自己傳了出去。",
      heard: "講路線的時候，旁邊有人聽到了，再傳了出去。",
      track: "有一樣東西跟著押送車，一路把位置報了出去。",
      wait: "沒有人傳。開槍的人，本來就守在那個路口。"
    },
    kindTrue: "（黎光耀沒有動。葉晴把筆記本翻開了新的一頁。「誰？」）",
    murmur: [ "（葉晴的筆停了一下。）", "（小吳看著桌上那一張摺過的紙，沒有抬頭。）", "（黎光耀把手錶翻了過來，看了一眼，又蓋回去。）" ],
    confess: {
      barista: [ "（同一個時間，馬路的對面。梁文海在櫃台的裡面擦杯子。）", "（他抬起頭，看了一眼對面三樓的那一扇窗。百葉窗是拉下來的。）", "（他把杯子掛回架子上。掛得很正。）" ]
    },
    cornered: { barista: "（同一個時間，馬路的對面。梁文海在櫃台的裡面擦杯子。三樓有人講了他的名字，他不知道。）" },
    deny: {
      abin: "（同一個時間，馬路的對面。阿彬蹲在機車的旁邊，在綁今天的最後一袋豆子。三樓有人講了他的名字，他不知道。）",
      cao: "（同一個時間，一樓的大廳。曹志翔站在公布欄的前面。三樓有人講了他的名字，他不知道。）",
      yuan: "（同一個時間，一樓的大廳。袁家銘靠著牆，看著自己的袖口。三樓有人講了他的名字，他不知道。）"
    },
    replayText: "3 月 10 日，23:10，打烊以後的海風咖啡——",
    get replay(){ return { scene:"c35_counter", opt:{ night:true, shutWin:true }, clean:true, cam:"經過重現", date:"2027-03-11", beats: moved() ? RB_B : RB_A }; },
    get endGood(){ arrest(); return "葉晴把筆記本闔上。「夠了。我去聲請。」\n黎光耀走到白板的前面，在那一個叉的旁邊，寫了三個字，又擦掉了。\n" + END_COMMON(); },
    get endBad(){ arrest(); return "黎光耀聽完，很久沒有講話。\n「你給我的，葉檢不能用。」\n葉晴把電信局的那兩頁紙，又從頭看了一次。她自己去了一趟馬路的對面，問了一個人，看了一樣東西。回來的時候，她只說了一句：「我去聲請。」\n是誰、是怎麼傳出去的，她寫在了聲請書上。\n" + END_COMMON(); }
  };

  // 收工幕間：夜裡的督察組會議室（主線組寫的台詞）
  if (EP35.after) EP35.after = Object.assign({}, EP35.after, { scene:"c35_meet", opt:{ pm:true, night:true, hh:21, mm:40 },
    cast:[ { id:"li", x:66, y:98, pose:"cross", facing:1 }, { id:"ye", x:96, y:98, pose:"read", facing:1 }, { id:"xu", x:126, y:98, pose:"stand", facing:-1 }, { id:"_you", x:154, y:98, pose:"stand", facing:-1 } ] });

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP35.fac = { cross:["#b8b0a0","#2a4a6a"], police:["#cfcabb","#3f5a7a"], cafe:["#e8dcc4","#2a5a6a"], lab:["#e2e8e8","#3a7a8a"], market:["#c8d0c8","#3a6a5a"] };
  EP35.setting = { cross:"city", police:"city", cafe:"city", lab:"city", market:"coast" };
  EP35.outScenes = ["c35_cross", "c35_arcade", "c35_cafe"];
  // 第一天：陰，悶，沒有風。第二天：雲更低，起風了（晚上才下雨）
  const SKY35 = [ ["#8a96a2","#b4bcc2","#4a5a68","#56666e",0,0], ["#6a7480","#98a2aa","#3a4a58","#46565e",0,0] ];
  EP35.worldSky = ph => SKY35[Math.min(ph || 0, SKY35.length - 1)];
  EP35.worldOrder = { cross:["road","lshop","arcade","room5"], police:["meet","lobby"], cafe:["seat","counter"], lab:["bench"], market:["hall"] };
  EP35.roomDesc = {
    road:"港濱路口。修路的護欄，管制的停止線，一台灰色的車。", lshop:"林記釣具。收音機開著，聲音很小。", arcade:"港濱路 71 號的騎樓。整棟樓都搬空了。", room5:"五樓。玻璃拆走了的窗戶，正對著路口。",
    meet:"三樓，督察組的會議室。門關著。", lobby:"一樓值班台。往地下室的樓梯在右邊。",
    seat:"海風咖啡外面的座位。對面就是警察局。", counter:"櫃台的裡面。咖啡的味道。",
    bench:"鑑識中心。", hall:"南澳魚市，漁會的櫃台。"
  };
  const say = (who, text, name) => ({ say:[who, text], name });
  EP35.world = {};
  EP35.locations.forEach(l => { EP35.world[l.id] = { auto:true, you:YOU, order:(EP35.worldOrder || {})[l.id] }; });
  Object.assign(EP35.world.cross, {
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:150, bx:172, face:-1 } },
      say("xu", "車子，我沒有讓任何人動過。", "許知夏"),
      say("wu", "學長……黎組長和葉檢回局裡了。押送組的兩位學長，也在局裡等。", "小吳"),
      say("you", "先看車。", "你")
    ]
  });
  EP35.mapPos = { cross:[120,92,"u"], police:[170,44,"u"], cafe:[170,64,"d"], lab:[104,24,"u"], market:[214,96,"d"] };
  EP35.mapRoads = [["police","cafe"],["police","lab"],["police","cross"],["cross","market"],["cafe","market"]];
  EP35.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 14; x < 226; x += 8) for (let y = 10; y < 96; y += 7){ R(x, y, 6, 5, "#c8c0b0"); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, "#b0a898"); }
    R(20, 52, 220, 5, "#d8d4c8");   // 中正路
    R(200, 52, 5, 48, "#d8d4c8"); R(52, 96, 153, 5, "#d8d4c8"); R(52, 60, 5, 40, "#d8d4c8");   // 港濱路：往海邊繞一圈
    R(102, 30, 4, 24, "#d8d4c8");   // 往鑑識中心
    R(0, 104, 240, 31, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 106 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");
    R(46, 96, 16, 8, "#b8b4a8"); R(48, 100, 12, 2, "#8a8678");   // 濱海二橋
    R(22, 38, 22, 14, "#d8d0c0"); R(22, 38, 22, 3, "#6a5a4a"); R(30, 44, 6, 8, "#8a7a6a");   // 地檢署
    R(162, 34, 16, 10, "#cfcabb"); R(164, 32, 12, 3, "#3f5a7a"); R(168, 36, 4, 3, "#e8c040");   // 警察局
    R(164, 60, 12, 7, "#e8dcc4"); R(164, 60, 12, 2, "#2a7a8a");   // 海風咖啡
    R(112, 94, 3, 2, "#f08030"); R(116, 94, 3, 2, "#f4f4f0"); R(120, 94, 3, 2, "#f08030"); R(128, 86, 8, 10, "#7a7e72");   // 修路、71 號
    R(206, 100, 20, 4, "#8a8678"); R(210, 92, 12, 8, "#c8d0c8");   // 魚市
  };
})();
