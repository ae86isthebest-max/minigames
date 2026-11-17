/* =========================================================
   第 33 集：場景、人物造型、監視器畫面、結案、走動畫面、地圖、開場
   警察局沿用第 14 集（SC.e_lobby、SC.e_b1hall、SC.e_office），金福銀樓沿用第 11 集（SC.g11_front），病房沿用第 22 集（SC.c22_ward）
   新畫的：A 區貴重物品櫃（c33_vault）、C 區鐵架（c33_shelf）、清潔工具間（c33_jan）
   ========================================================= */
EP33.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, INK } = PR;
  const W = 192, H = 108;
  const SC = PX.SCENES;
  const floor = (y, c, l) => PR.floor(y, c, l);
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i, p] = beatAt(o.t || 0, o.ds); return Object.assign({ _p:p }, (o.seq || [])[i] || {}); };
  const tw = (o, k, def) => o[k + "0"] !== undefined ? o[k + "0"] + (o[k + "1"] - o[k + "0"]) * (o._p || 0) : (typeof o[k] === "number" ? o[k] : def);
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px sans-serif"; g.fillStyle = c; g.fillText(s, x, y); };
  const tube = (x, y, w) => { R(x, y, w, 2, "#f4f8f0"); dither(x - 4, y + 2, w + 8, 6, "#f4f8f022", 3); };
  const box = (x, y, w, h, c) => { R(x, y, w, h, c || "#b8925a"); R(x, y, w, 1, "#d8b27a"); R(x + (w >> 1), y, 1, h, "#9a7a48"); R(x + 2, y + 2, Math.min(4, w - 4), 2, "#f4f0e0"); };
  const DOG = { kind:"dog", coat:"#f0dcb0", collar:"#3a6ac8" };
  // 3×5 的像素字（櫃子和鐵架的編號用；直接寫字在這個大小會糊掉）
  const GL = { A:"010101111101101", C:"011100100100011", "-":"000000111000000", 0:"111101101101111", 1:"010110010010111", 2:"111001111100111", 5:"111100111001111", 6:"111100111101111", 7:"111001010010010", 8:"111101111101111" };
  const ptxt = (s, x, y, c) => { [...String(s)].forEach((ch, i) => { const g = GL[ch]; if (!g) return; for (let k = 0; k < 15; k++) if (g[k] === "1") P(x + i * 4 + k % 3, y + Math.floor(k / 3), c); }); };
  // 清潔車（x＝左邊，y＝輪子踩的地方）：22 寬。黃色的垃圾袋架在右邊，上層的籃子在左邊，吊秤的桿子在最右邊
  const jcart = (x, y, pole) => {
    R(x, y - 20, 2, 18, "#8a9094"); R(x + 20, y - 20, 2, 18, "#8a9094"); R(x, y - 5, 22, 2, "#8a9094"); R(x, y - 14, 22, 1, "#aab0b4");
    R(x + 1, y - 22, 11, 8, "#5a8ab8"); R(x + 1, y - 22, 11, 1, "#7aaad8"); R(x + 3, y - 25, 4, 3, "#e8f4f8"); P(x + 4, y - 24, "#b8c8d0"); R(x + 8, y - 25, 2, 3, "#e84a6a");   // 籃子、膠帶、噴瓶
    R(x + 12, y - 20, 9, 14, "#e8c040"); R(x + 12, y - 20, 9, 2, "#f4dc70"); R(x + 13, y - 8, 7, 2, "#c8a030");   // 垃圾袋架
    R(x + 2, y - 3, 3, 3, INK); R(x + 17, y - 3, 3, 3, INK);
    R(x - 2, y - 22, 2, 2, "#8a9094"); P(x - 2, y - 20, "#f4a0b0");   // 把手和大頭貼
    if (pole !== false){ R(x + 22, y - 34, 2, 30, "#8a9094"); R(x + 22, y - 34, 9, 2, "#8a9094"); R(x + 29, y - 32, 1, 4, "#5a5a5e"); R(x + 26, y - 28, 7, 6, "#d8dce0"); R(x + 27, y - 27, 5, 2, "#2a3a2a"); P(x + 28, y - 26, "#6ae86a"); R(x + 25, y - 22, 9, 4, "#b8bcc0"); R(x + 28, y - 18, 3, 2, "#f4f0e0"); }   // 吊秤、標籤機
  };
  const bucket = (x, y) => { R(x, y - 7, 8, 7, "#3a6ac8"); R(x, y - 7, 8, 1, "#6a9ae8"); R(x - 1, y - 8, 10, 1, "#c8c8cc"); };

  /* ---------- B1 走廊（第 14 集）：盤點的這兩天，門用一箱影印紙擋著 ---------- */
  SC.c33_hall = (o) => { o = Object.assign({}, o, stOf(o));
    SC.e_b1hall(Object.assign({ lit:true, sign:false, tape:false, dog:false }, o, { ds:undefined, seq:undefined }));
    // 開著的門：看得到裡面前台的燈和桌子的一角
    if (!o.shut){   // o.shut＝門關好了（結案以後）
    R(110, 24, 30, 52, "#4a525c"); R(112, 26, 26, 50, "#c4c0b0"); R(112, 62, 26, 14, "#a8a494"); R(112, 26, 26, 3, "#e8ecd8"); R(120, 50, 18, 2, "#8a7a5a"); R(122, 52, 16, 12, "#7a6a4a");
    R(108, 24, 4, 52, "#5a6470"); R(109, 46, 1, 6, "#c8c8cc");   // 往裡面開的門板（側面）
    R(105, 64, 13, 12, "#d8cca8"); R(105, 64, 13, 1, "#f0e4c0"); R(107, 67, 9, 2, "#3a6a9a"); R(107, 71, 6, 1, "#8a8a7a");   // 擋門的影印紙
    }
    R(176, 10, 12, 6, "#2a3a4a"); R(177, 11, 10, 4, "#6a8aa8"); R(181, 11, 1, 4, "#2a3a4a");   // 走廊盡頭的通風窗
    const cx = tw(o, "cx"), cy = tw(o, "cy", 0); if (cx !== undefined) jcart(Math.round(cx), 97 + Math.round(cy), false);
    if (o.bk !== undefined) bucket(o.bk, 97);
  };

  /* ---------- 證物室前台（第 14 集）：多了鑰匙櫃和垃圾桶 ---------- */
  SC.c33_office = (o) => { SC.e_office(o || {});
    R(66, 12, 26, 18, "#7a8490"); R(67, 13, 24, 16, "#3a4048"); for (let k = 0; k < 12; k++){ const x = 69 + (k % 6) * 4, y = 15 + Math.floor(k / 6) * 7; P(x, y, "#e8c040"); R(x, y + 1, 1, 2, "#c8c8cc"); R(x - 1, y + 3, 3, 2, "#3a6ac8"); }   // 鑰匙櫃
    R(72, 31, 12, 5, "#2a4a3a"); R(73, 32, 10, 3, "#f4f0e0"); P(78, 30, "#8a8a8a");   // 領用簿
    R(104, 65, 9, 11, "#6a7a8a"); R(103, 64, 11, 2, "#8a9aaa"); R(105, 62, 7, 3, "#e8f0f4"); R(105, 62, 7, 1, "#ffffff");   // 垃圾桶和新的垃圾袋
  };

  /* ---------- A 區・貴重物品櫃 ----------
     牆腳 y76。A-1（左）x4–40；A-2（中）x50–104，七格：上面四格、下面三格；桌子（右）x114–188，桌面 y58。
     o.shut＝櫃門關著；o.key＝鑰匙插在鎖上；o.box7＝第 7 格的盒子還在；o.tbl===false＝桌上沒有 22-07 的盒子 */
  SC.c33_vault = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 76, "#b4b8b0"); R(0, 0, W, 6, "#8a9088"); tube(36, 6, 20); tube(140, 6, 20);
    R(0, 55, W, 21, "#aaaa96"); R(0, 54, W, 2, "#a8884a"); for (let k = 0; k < 12; k++) P((k * 37) % W, 59 + (k * 5) % 14, "#e0e0d4");   // 2023 年淹水的水位線
    R(112, 12, 50, 10, "#3a4a5a"); txt("A 區　貴重物品", 114, 20, "#f4f0e0", "7px sans-serif");
    R(166, 26, 20, 16, "#f4f0e0"); R(166, 26, 20, 3, "#c83a2a"); for (let k = 0; k < 3; k++) R(168, 32 + k * 3, 16 - k * 3, 1, "#6a6a6a");   // 告示
    // A-1
    R(4, 22, 36, 54, "#6a7480"); R(5, 23, 34, 52, "#8a94a0"); R(22, 23, 1, 52, "#6a7480"); R(19, 46, 2, 5, "#c8c8cc"); R(24, 46, 2, 5, "#c8c8cc"); R(8, 26, 15, 9, "#f4f0e0"); ptxt("A-1", 10, 28, "#2a2a2a"); R(20, 40, 5, 3, "#c83a2a");
    // A-2
    R(68, 8, 17, 9, "#f4f0e0"); ptxt("A-2", 71, 10, "#c83a2a");
    R(50, 18, 54, 58, "#3e464e"); R(52, 20, 50, 54, "#23282e");
    const slotBox = (x, y, n) => { R(x, y - 6, 9, 6, "#2a3a7a"); R(x, y - 6, 9, 1, "#4a5a9a"); R(x + 3, y - 6, 3, 6, "#c83a2a"); R(x, y + 1, 9, 3, "#d8dce0"); R(x + 2, y + 2, 5, 1, "#8a8a8a"); };
    if (o.shut){
      R(52, 20, 25, 54, "#5a6470"); R(77, 20, 25, 54, "#5a6470"); R(76, 20, 2, 54, "#3a424c"); R(53, 21, 23, 1, "#7a8490"); R(78, 21, 23, 1, "#7a8490");
      R(71, 42, 3, 10, "#c8c8cc"); R(80, 42, 3, 10, "#c8c8cc"); R(84, 44, 5, 6, "#2a2e34"); P(86, 46, "#c8c8cc");
      if (o.key){ R(86, 46, 2, 2, "#e8c040"); R(85, 49, 4, 6, "#3a6ac8"); P(86, 50, "#f4f0e0"); }
    } else {
      R(52, 46, 50, 2, "#4a525c"); [64, 76, 88].forEach(x => R(x, 20, 1, 26, "#4a525c")); [68, 85].forEach(x => R(x, 48, 1, 26, "#4a525c"));
      [0, 1, 2, 3].forEach(i => slotBox(54 + i * 12, 42, i + 1));
      slotBox(56, 70, 5); slotBox(73, 70, 6); if (o.box7) slotBox(90, 70, 7); else { R(90, 71, 9, 3, "#d8dce0"); R(92, 72, 5, 1, "#8a8a8a"); }
      R(43, 18, 7, 58, "#5a6470"); R(43, 18, 2, 58, "#7a8490");   // 左邊的門（開著，側面）
      R(104, 18, 7, 58, "#5a6470"); R(109, 18, 2, 58, "#7a8490"); R(105, 43, 4, 7, "#2a2e34"); P(106, 46, "#c8c8cc");   // 右邊的門，鎖在這一扇上
      if (o.key){ R(106, 46, 2, 2, "#e8c040"); R(105, 50, 4, 6, "#3a6ac8"); P(106, 51, "#f4f0e0"); }
    }
    // 桌子和桌上的東西
    R(114, 58, 74, 3, "#8a7a5a"); R(116, 61, 70, 4, "#7a6a4a"); R(117, 65, 3, 11, "#5a4a3a"); R(182, 65, 3, 11, "#5a4a3a");
    R(116, 55, 17, 3, "#d8dce0"); R(118, 53, 13, 2, "#b8bcc0"); R(120, 56, 8, 2, "#2a3a2a"); P(122, 56, "#6ae86a"); P(124, 56, "#6ae86a");   // 電子秤
    if (o.tbl !== false){ R(137, 51, 9, 7, "#2a3a7a"); R(137, 51, 9, 1, "#4a5a9a"); R(140, 51, 3, 7, "#c83a2a"); R(137, 54, 9, 1, "#e8f4f8"); }   // 22-07 的盒子（透明膠帶繞了一圈）
    R(150, 53, 6, 5, "#c83a2a"); R(152, 55, 2, 1, "#f4f0e0");   // 一捲封條
    R(159, 55, 13, 3, "#8a6a4a"); R(160, 54, 11, 3, "#f4f0e0"); R(161, 55, 8, 1, "#6a6a6a"); R(164, 53, 3, 2, "#8a8a8e");   // 夾板
    R(176, 49, 10, 9, "#1a1a1e"); R(177, 50, 8, 7, "#5a8ab8"); R(178, 52, 5, 3, "#c8d8e8");   // 平板
    floor(76, "#8a8e86", "#7e827a"); R(0, 76, W, 1, "#6a6e66");
    if (o.dog) PR.person(30, 101, DOG, 1, 1, "sniff");
  };

  /* ---------- C 區：四座鐵架 C-5 到 C-8 ----------
     每座 40 寬：C-5 x2、C-6 x46、C-7 x104、C-8 x148。層板 y74、62、48、36。C-6 和 C-7 中間（x86–104）是牆，放著老方的工具箱。
     o.sheet＝牆上掛著今天的盤點單；o.dog＝豆花坐在 C-7 前面；o.open＝C-7 最下層搬空、底板拆下來了 */
  SC.c33_shelf = (o) => { o = Object.assign({}, o, stOf(o));
    const BX = ["#b8925a", "#a8865a", "#c8a26a"];
    R(0, 0, W, 76, "#b0b4ac"); R(0, 0, W, 6, "#8a9088"); tube(54, 6, 20); tube(150, 6, 20);
    R(0, 55, W, 21, "#a8a894"); for (let k = 0; k < 18; k++) P((k * 29) % W, 58 + (k * 7) % 16, "#e8e8e0"); R(0, 54, W, 2, "#a8884a");
    const bolt = (x, y, nw) => { R(x, y, 4, 4, nw ? "#d8dce0" : "#7a4a2a"); P(x + 1, y + 1, nw ? "#8a9094" : "#5a3220"); if (nw) P(x + 2, y + 2, "#f4f8f8"); };
    const shelf = (x, name, nw, empty) => {
      [74, 62, 48, 36].forEach((y, r) => { R(x, y, 40, 2, "#7a8490"); if (r === 0 && empty) return; for (let i = 2; i + 8 < 40; i += 9) box(x + i, y - 8, 8, 8, BX[(i + r + x) % 3]); });
      R(x, 26, 2, 50, "#6a7480"); R(x + 38, 26, 2, 50, "#6a7480"); R(x, 26, 40, 2, "#6a7480");
      R(x + 12, 16, 15, 9, "#d8dce0"); ptxt(name, x + 14, 18, "#2a2a2a");
      bolt(x + 3, 30, nw); bolt(x + 33, 30, nw);
    };
    shelf(2, "C-5", true); shelf(46, "C-6", true); shelf(104, "C-7", false, o.open); shelf(148, "C-8", false);
    R(88, 49, 14, 5, "#d8dcd0"); R(89, 50, 12, 1, "#6a6a5a"); R(89, 52, 8, 1, "#6a6a5a");   // 水位線旁邊的小牌子
    // 工具箱（蓋子開著）
    R(88, 69, 13, 7, "#c83a2a"); R(88, 69, 13, 1, "#e85a4a"); R(88, 64, 13, 3, "#a82a1e"); R(93, 62, 3, 2, "#3a3a3e"); R(90, 67, 4, 2, "#c8ccd0"); R(96, 67, 3, 2, "#f4f0e0");
    if (o.sheet){ R(94, 37, 1, 2, "#5a5a5e"); R(90, 39, 9, 13, "#8a6a4a"); R(91, 41, 7, 10, "#f4f0e0"); for (let k = 0; k < 4; k++) R(92, 43 + k * 2, 5, 1, "#3a5a9a"); R(93, 38, 3, 2, "#c8ccd0"); }
    if (o.open){
      R(106, 64, 36, 10, "#1c1e22");
      [107, 115, 123].forEach(x => { R(x, 69, 7, 5, "#0c0c10"); R(x + 1, 70, 5, 1, "#3a3a44"); P(x + 5, 72, "#f4f0e0"); });   // 三個空的槍盒
      R(132, 69, 8, 5, "#f4f0e0"); R(133, 71, 6, 1, "#3a5a9a"); R(136, 69, 1, 5, "#d8d4c4");   // 摺起來的紙
      R(144, 58, 3, 18, "#7a8490"); R(144, 58, 1, 18, "#9aa4b0");   // 拆下來的底板，靠在 C-8 的柱子上
    }
    floor(76, "#8a8e86", "#7e827a"); R(0, 76, W, 1, "#6a6e66");
    if (o.dog) PR.person(116, 102, DOG, 1, 1, "sit");
  };

  /* ---------- 清潔工具間・垃圾集中處 ----------
     置物櫃 x4–34（左：滿，右：桃）；拖把槽 x40–63；倒放的水桶 x64–72；手套掛在 x76–84；清潔車 x106–128（吊秤到 x140）；集中處 x148–190
     o.cart===false＝清潔車不在（被推出去了） */
  SC.c33_jan = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 76, "#cfd6d0"); R(0, 0, W, 6, "#9aa29c"); tube(86, 6, 22);
    R(0, 44, W, 32, "#e0e7e3"); for (let x = 0; x < W; x += 8) R(x, 44, 1, 32, "#c6cec9"); for (let y = 44; y < 76; y += 8) R(0, y, W, 1, "#c6cec9");
    R(150, 14, 38, 9, "#2a5a3a"); txt("垃圾集中處", 151, 21.5, "#f4f0e0", "7px sans-serif");
    [4, 20].forEach((x, i) => { R(x, 26, 14, 50, "#5a7a8a"); R(x + 1, 27, 12, 48, "#7a9aaa"); for (let k = 0; k < 3; k++) R(x + 3, 30 + k * 2, 8, 1, "#5a7a8a"); R(x + 10, 52, 2, 4, "#d8dce0"); R(x + 2, 38, 10, 10, "#f4f0e0"); txt(i ? "桃" : "滿", x + 3, 46, "#2a2a2a", "8px sans-serif"); });
    R(72, 30, 32, 2, "#8a6a4a"); [[74, "#e8e8e0"], [79, "#3a8ac8"], [84, "#e8c040"], [89, "#e8e8e0"], [95, "#6ac86a"]].forEach(([x, c]) => { R(x, 23, 4, 7, c); R(x + 1, 21, 2, 2, "#5a5a5e"); });   // 架子上的清潔劑
    R(44, 20, 1, 44, "#c8a868"); R(49, 24, 1, 40, "#c8a868"); R(42, 56, 5, 6, "#e8e8e0"); R(47, 56, 5, 6, "#d8d8d0");   // 兩支拖把
    R(40, 62, 24, 14, "#a8aca8"); R(42, 62, 20, 2, "#c8ccc8"); R(42, 64, 20, 5, "#5a6a70"); R(55, 52, 2, 10, "#8a8a8e"); R(52, 52, 6, 2, "#8a8a8e");   // 拖把槽、水龍頭
    R(64, 69, 9, 7, "#3a6ac8"); R(63, 75, 11, 1, "#2a4a98"); R(64, 69, 9, 1, "#6a9ae8");   // 倒放的水桶
    P(80, 42, "#5a5a5e"); R(76, 43, 4, 10, "#f0d020"); R(81, 43, 4, 10, "#f0d020"); R(76, 51, 1, 3, "#f0d020"); R(78, 52, 1, 2, "#f0d020"); R(81, 52, 1, 2, "#f0d020"); R(84, 51, 1, 3, "#f0d020"); R(76, 43, 4, 1, "#c8a818"); R(81, 43, 4, 1, "#c8a818"); P(83, 52, "#c83a2a");   // 橡膠手套
    if (o.cart !== false) jcart(106, 76);
    // 集中處：矮的鐵籠，裡面是綁好的垃圾袋，每一袋都有標籤
    R(148, 48, 42, 2, "#8a9094"); R(148, 48, 2, 28, "#8a9094"); R(188, 48, 2, 28, "#8a9094");
    [[152, 62, 11, 14, "#3a3a42"], [164, 58, 12, 18, "#4a4a54"], [177, 63, 10, 13, "#3a3a42"], [157, 53, 10, 9, "#4a4a54"]].forEach(([x, y, w, h, c]) => { R(x, y, w, h, c); R(x + 1, y, w - 2, 1, "#6a6a74"); R(x + (w >> 1) - 1, y - 2, 3, 2, c); R(x + 2, y + 4, 4, 3, "#f4f0e0"); });
    R(171, 51, 9, 8, "#5a5a66"); R(174, 49, 3, 2, "#5a5a66"); R(172, 53, 5, 4, "#f4f0e0"); R(173, 54, 3, 1, "#c83a2a");   // 那一袋（標籤上有紅字）
    floor(76, "#b8c0bc", "#a8b0ac");
  };

  /* ---------- 金福銀樓（第 11 集）：櫃台上的收購簿和絨布盤 ---------- */
  SC.c33_gold = (o) => { o = Object.assign({}, o, stOf(o)); SC.g11_front(Object.assign({ broken:false }, o, { ds:undefined, seq:undefined }));
    if (!o.clip || o.gold){
      R(137, 49, 11, 3, "#2a4a3a"); R(138, 48, 9, 3, "#f4f0e0"); R(139, 49, 6, 1, "#6a6a6a");   // 收購簿
      R(150, 49, 13, 3, "#1a1a1e"); [151, 154, 157, 160].forEach((x, i) => R(x, 49, 2, i < 2 ? 2 : 1, "#f2c94c"));   // 絨布盤
    }
  };

  /* ---------- 澄港醫院六樓・兒童病房（第 22 集的病房）：牆上的圖、窗台上的便當盒、輪椅 ---------- */
  SC.c33_ward = (o) => { o = o || {}; SC.c22_ward(Object.assign({ night:false }, o));
    R(18, 42, 38, 2, "#c8d4cc"); R(24, 39, 11, 3, "#e8dcc0"); R(24, 39, 11, 1, "#f4ecd8");   // 窗台、倒扣的便當盒
    R(84, 20, 16, 13, "#f4f0e0"); R(84, 20, 2, 2, "#e8d890"); R(98, 20, 2, 2, "#e8d890"); R(86, 30, 12, 1, "#8a8a8a"); R(90, 24, 2, 5, "#5a5a5a"); R(92, 26, 4, 3, "#8a8a8a"); P(90, 23, "#5a5a5a");   // 鉛筆畫：一個人推著車
    if (o.chair !== false){   // 輪椅（側面，朝右）：椅背和把手在左邊，大輪子在後面，小輪子和腳踏板在前面
      R(92, 68, 2, 22, "#5a5a62"); R(87, 68, 6, 2, "#3a3a40"); R(92, 88, 20, 2, "#5a5a62"); R(94, 72, 3, 16, "#3a6a9a");
      R(85, 86, 12, 12, "#2a2a2e"); R(87, 88, 8, 8, "#c8d0cc"); R(90, 91, 2, 2, "#5a5a62"); R(90, 88, 1, 8, "#8a8a8e"); R(87, 91, 8, 1, "#8a8a8e");
      R(111, 90, 1, 5, "#5a5a62"); R(110, 94, 4, 4, "#2a2a2e"); R(111, 92, 5, 1, "#5a5a62"); }
  };

  /* ---------- 人物造型 ---------- */
  const AL = id => (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null;
  const LOOK = {
    wu:   Object.assign({ skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", glasses:true, top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050" }, AL("wu") || {}, { hello:"學長。" }),
    li:   Object.assign({ skin:"#e8c09a", hair:"#1e1e1e", hairStyle:"slick", top:"#ffffff", bottom:"#1e2230" }, AL("li") || {}, { hello:"問。問完，我要一個答案。" }),
    cai:  Object.assign({ skin:"#e8c8a8", hair:"#2a2220", hairStyle:"short", top:"#f4f4f0", coat:"#b8a070", bottom:"#3a3a40" }, AL("cai") || {}, { mood:"worried", hello:"學長。……是我的疏失。" }),
    xu:   Object.assign({ skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" }, AL("xu") || {}, { hello:"數字不會錯。錯的是中間發生的事。" }),
    kui:  Object.assign({ skin:"#f0d0b4", hair:"#5a3a2a", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" }, AL("kui") || {}, { hello:"學長，照片都在這裡。" }),
    liu:  { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", hello:"沈警官。簿子在這裡。" },
    man:  { skin:"#d8a880", hair:"#2a2220", hairStyle:"pony", top:"#8ac0b0", apron:"#3a6ac8", bottom:"#3a3a40", mood:"tired", hello:"警官，早。……我還有三層樓要掃。" },
    tao:  { age:"old", skin:"#e0b48c", hair:"#8a8682", hairStyle:"bob", top:"#e88aa8", apron:"#3a6ac8", bottom:"#3a3a40", hello:"警官，裡面是怎麼了？" },
    luo:  { skin:"#e0b890", hair:"#2a2a2a", hairStyle:"slick", glasses:true, top:"#f4f4f0", coat:"#4a4e5a", bottom:"#3a3e48", tie:"#6a2a2a", hello:"我配合。可是我的箱子，請黎組長自己來拆。" },
    fang: { skin:"#c89a70", hair:"#9a9690", hairStyle:"balding", top:"#5a6a4a", bottom:"#3a3a2a", hat:"cap", capColor:"#4a5a3a", gloves:"#c8b890", hello:"又是我？上一次也是先問我。" },
    kang: { skin:"#d8a880", hair:"#1e1a18", hairStyle:"pony", top:"#2e3e2e", bottom:"#2e3e2e", hat:"cap", capColor:"#2e3e2e", hello:"豆花，慢慢來。" },
    lu:   { skin:"#d8a880", hair:"#c8c8c8", hairStyle:"balding", top:"#8a6a3a", bottom:"#3a3a3a", glasses:true, mood:"sad", hello:"沈警官。……東西都在這裡。" },
    en:   { skin:"#f0d0b4", hair:"#2a2220", hairStyle:"bob", top:"#a8d0e0", apron:"#f4f4f0", bottom:"#a8d0e0", hello:"你好。" }
  };
  const DAILY = {
    wu:   [ { room:"vault", x:104, pose:"stand", doing:"站在 A-2 的前面，一格一格地看。" }, { room:"cshelf", x:50, pose:"read", doing:"拿著盤點單，在對 C-6 的箱子。" } ],
    li:   [ { room:"evoffice", x:128, pose:"write", doing:"站在前台，在小本子上寫字。每寫一行，就看一次門口。" }, { room:"cshelf", x:24, pose:"cross", doing:"站在 C 區的入口，看著每一個人的手。" } ],
    cai:  [ { room:"evoffice", x:60, pose:"sit", doing:"坐在前台的電腦前面，兩隻手放在膝蓋上。" }, { room:"cshelf", x:68, pose:"write", doing:"拿著夾板，一箱一箱地點。" } ],
    xu:   [ { room:"vault", x:126, pose:"inspect", doing:"站在秤的前面，把砝碼又放了一次。" }, { room:"vault", x:126, pose:"write", doing:"在 A-2 的桌子前面，重新抄一份過磅紀錄。" } ],
    kui:  [ { room:"vault", x:172, pose:"read", doing:"拿著平板，把下午的照片一張一張往回翻。" }, { room:"cshelf", x:172, pose:"cam", doing:"在拍 C-8 的每一層。" } ],
    liu:  [ { room:"lobby", x:112, pose:"stand", doing:"站在值班台後面。登記簿攤開著。" }, { room:"lobby", x:112, pose:"write", doing:"站在值班台後面，在補昨天的值班日誌。" } ],
    man:  [ null, { room:"jan", x:92, pose:"hold@cloth", doing:"站在清潔車旁邊，把抹布一條一條摺好。" } ],
    tao:  [ { room:"jan", x:92, pose:"broom", doing:"在工具間裡，把日班沒有收完的東西歸位。" }, null ],
    luo:  [ { room:"lobby", x:36, pose:"carry@case", doing:"站在大門邊，手上提著那一個鋁箱。封條還在。" }, { room:"lobby", x:36, pose:"read", doing:"站在公布欄的旁邊，在看自己的鑑價報告。" } ],
    fang: [ { room:"cshelf", x:120, pose:"hold@wrench", doing:"站在工具箱旁邊，手上轉著一支扳手。" }, { room:"cshelf", x:158, pose:"hold@wrench", doing:"站在 C-8 的前面，等著鎖剩下的兩座。" } ],
    lu:   [ null, { room:"gfront33", x:170, pose:"stand", doing:"站在櫃台的旁邊，一隻手按著那一本收購簿。" } ],
    en:   [ null, { room:"ward33", x:104, pose:"sit", doing:"坐在輪椅上，在一張紙上畫畫。衣服的下面，是一件硬的背架。" } ]
  };
  EP33.suspects.forEach(s => {
    if (LOOK[s.id]){ if (LOOK[s.id].hello) s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });
  // 康雅婷：豆花坐下以前在 A 區，坐下以後在 C-7 的前面
  { const k = EP33.suspects.find(s => s.id === "kang"), sat = () => typeof has === "function" && has("e33_dog");
    const A = { room:"vault", x:54, pose:"stand", doing:"牽著豆花，一個櫃子一個櫃子地走。" }, B = { room:"cshelf", x:88, pose:"stand", doing:"站在豆花的旁邊。豆花坐著，一動也不動。" };
    k.daily = [A, A]; Object.defineProperty(k.daily, 1, { enumerable:true, configurable:true, get(){ return sat() ? B : A; } }); }

  /* ---------- 房間和隱藏小細節 ---------- */
  EP33.rooms = {
    police: [
      { id:"lobby", name:"1F 值班台", scene:"e_lobby", opt:(ph) => ({ night:ph === 0 }), details:[
        { id:"d33_clock", name:"牆上的鐘", hot:[92,6,12,12], text:"值班台後面的鐘。\n劉建志說，登記簿上的時間，都是照這一個鐘寫的。" },
        { id:"d33_stairs", name:"往地下室的樓梯", hot:[154,60,38,30], text:"往地下室的樓梯。\n下去以後，第一間是清潔工具間。再過去，才是證物室。" } ] },
      { id:"jan", name:"B1 清潔工具間", scene:"c33_jan", details:[
        { id:"d33_taolocker", name:"阿桃姨的置物櫃", label:"右邊的置物櫃", hot:[20,26,14,50], text:"門上貼著三張小孩的照片，和一張便條：「會錢　15 號」。" },
        { id:"d33_bottles", name:"架子上的清潔劑", hot:[72,20,32,12], text:"漂白水、玻璃清潔劑、地板蠟。\n每一瓶都用麥克筆寫了開封的日期。字很小，很整齊。" } ] },
      { id:"b1hall", name:"B1 走廊", scene:"c33_hall", details:[
        { id:"d33_hallboard", name:"走廊的公布欄", hot:[36,22,18,14], text:"「盤點期間，證物室的門不關。搬運請靠右。」\n下面是黎光耀的簽名。" },
        { id:"d33_hydrant", name:"消防栓箱", hot:[152,34,14,28], text:"下半部還是鏽的。\n檢查卡上，最新的一格是上個月，簽名是一個「方」字。" } ] },
      { id:"evoffice", name:"B1 證物室前台", scene:"c33_office", details:[
        { id:"d33_kettle", name:"小電熱水壺", hot:[3,40,12,10], text:"牆角的電熱水壺還在。\n旁邊那一罐泡麵，罐子上的「鄭」字已經褪色了。沒有人把它收走。" },
        { id:"d33_roster", name:"排班表", hot:[126,30,14,16], text:"這個月的排班表。兩個名字輪流。\n其中一個人，這個禮拜的每一格都寫著「受訓」。" } ] },
      { id:"vault", name:"A 區・貴重物品櫃", scene:"c33_vault", opt:(ph, has) => ({ dog:ph > 0 && !(has && has("e33_dog")) }), details:[
        { id:"d33_a1", name:"A-1 的櫃子", hot:[4,22,36,54], text:"A-1 放的是現金和有價證券。\n今天早上盤過了。封條是新的，上面是黎光耀的簽名。" },
        { id:"d33_poster", name:"牆上的告示", hot:[166,26,20,16], text:"「貴重物品區：開櫃須兩人以上在場。」\n下午鑑價的時候，在場的有六個人。\n兩點零五分以後，一個都沒有。" } ] },
      { id:"cshelf", name:"C 區", scene:"c33_shelf", opt:(ph, has) => ({ sheet:ph > 0, dog:ph > 0 && !!(has && has("e33_dog")), open:!!(has && has("o33_plate")) }), details:[
        { id:"d33_water", name:"牆上的水位線", hot:[86,49,18,6], text:"2023 年 7 月 28 日，一百一十二公分。\n那一次淹水，泡壞了半個地下室的東西。報廢的清冊，寫了三大本。" },
        { id:"d33_c8", name:"C-8 的紙箱", label:"C-8", hot:[148,34,40,42], text:"2006 年以前的舊案。\n紙箱上的字，有一半是老鄭寫的。" } ] }
    ],
    lab: [
      { id:"lab33", name:"鑑識中心", scene:"lab", details:[
        { id:"d33_bench", name:"檯面", hot:[60,50,26,12], text:"檯面上排著今天送來的東西，每一樣都裝在袋子裡，貼了標籤。\n許知夏叫了兩個人留下來加班。" } ] }
    ],
    gold: [
      { id:"gfront33", name:"金福銀樓", scene:"c33_gold", details:[
        { id:"d33_cat", name:"招財貓", hot:[122,36,12,14], text:"櫃台邊的招財貓，手還在搖。\n換過新的電池了。" },
        { id:"d33_glass", name:"展示櫃", hot:[68,48,44,20], text:"去年被砸破的那兩個展示櫃，換了新的玻璃，比旁邊的亮。" } ] }
    ],
    hospital: [
      { id:"ward33", name:"六樓・兒童病房", scene:"c33_ward", details:[
        { id:"d33_window", name:"窗外", hot:[20,16,34,22], text:"從六樓看出去，看得到警察局的屋頂。\n走路，十五分鐘。" },
        { id:"d33_monitor", name:"床頭的儀器", hot:[108,30,22,16], text:"儀器沒有開。\n螢幕的角落貼著一張便利貼：「3/10　第一台」。" } ] }
    ]
  };
  EP33.phases[0].scene = "c33_vault"; EP33.phases[0].sceneOpt = {};
  EP33.phases[1].scene = "c33_shelf"; EP33.phases[1].sceneOpt = { sheet:true };

  /* ---------- 監視器動畫 ---------- */
  const strip = L => { const o = Object.assign({}, L || {}); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  EP33.looks = { youC:YOU, wuC:strip(LOOK.wu), liC:strip(LOOK.li), caiC:strip(LOOK.cai), xuC:strip(LOOK.xu), kuiC:strip(LOOK.kui), luoC:strip(LOOK.luo), fangC:strip(LOOK.fang), manC:strip(LOOK.man), luC:strip(LOOK.lu), enC:strip(LOOK.en) };
  const mk = (scene, opt, cam, date, beats, clean) => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join);
    return { scene, opt:Object.assign({}, opt, { ds, seq:beats.map(b => b.st || {}) }), cam, date, clean, beats:beats.map(b => { const o = Object.assign({}, b); delete o.st; return o; }) }; };
  const F = 96, DY = F - 10;
  const C1 = "14:05，六個人從證物室出來，往樓梯走。", C2 = "鑑價師也出來了。他沒有上樓：走到走廊的另一頭，把手機貼在耳朵上。", C3 = "14:08，老方提著工具箱出來，走得很快，上了樓梯。";
  const C4 = "14:10，一個推著清潔車的人從樓梯那一邊過來。她在門口的讀卡機上刷了一下卡，把車推進去。", C5 = "14:14，她推著車出來，往回走，出了畫面。";
  const C6 = "14:21，她又來了。這一次沒有推車：一隻手拿拖把，一隻手提著水桶。刷卡，進去。", C7 = "14:25，她出來，往回走。", C8 = "14:30，六個人從樓梯下來，走進證物室。";
  const ANIM = {
    cctv33_hall: mk("c33_hall", { cam:true }, "B1 CORRIDOR", "2027-03-08", [
      { t:"14:05:00", d:2.5, cap:C1, m:{ liC:[116, F, "stand", -1, 116, DY], youC:[125, F, "stand", -1, 125, DY], wuC:[134, F, "stand", -1, 134, DY] } },
      { t:"14:05:10", d:3.5, join:true, cap:C1, m:{ liC:[-20, F, "stand", -1], youC:[-20, F, "stand", -1], wuC:[-20, F, "stand", -1], xuC:[116, F, "stand", -1, 116, DY], kuiC:[125, F, "stand", -1, 125, DY], caiC:[134, F, "stand", -1, 134, DY] }, out:["liC", "youC", "wuC"] },
      { t:"14:05:25", d:3.5, join:true, cap:C2, m:{ xuC:[-20, F, "stand", -1], kuiC:[-20, F, "stand", -1], caiC:[-20, F, "stand", -1], luoC:[128, F, "carry@case", 1, 128, DY] }, out:["xuC", "kuiC", "caiC"] },
      { t:"14:05:40", d:4, join:true, cap:C2, m:{ luoC:[180, F, "phone&case", -1, 128, F] } },
      { t:"14:08:00", d:2, cap:C3, m:{ fangC:[125, F, "carry@case", -1, 125, DY] } },
      { t:"14:08:10", d:2.5, join:true, cap:C3, m:{ fangC:[-20, F, "carry@case", -1] }, out:["fangC"] },
      { t:"14:10:00", d:4.5, cap:C4, st:{ cx0:-22, cx1:110 }, m:{ manC:[98, F, "push", 1, -34, F] } },
      { t:"14:10:20", d:3, join:true, cap:C4, st:{ cx:110 }, m:{ manC:[138, F, "door@card", 1, 98, F] } },
      { t:"14:10:30", d:1.5, join:true, cap:C4, st:{ cx:110 }, m:{ manC:[98, F, "stand", 1, 138, F] } },
      { t:"14:10:40", d:2.5, join:true, cap:C4, st:{ cx0:110, cx1:114, cy0:0, cy1:-10 }, m:{ manC:[112, DY, "push", 1, 98, F] }, out:["manC"] },
      { t:"14:14:00", d:2.5, cap:C5, st:{ cx0:112, cx1:98, cy0:-10, cy1:0 }, m:{ manC:[132, F, "stand", -1, 134, DY] } },
      { t:"14:14:10", d:4, join:true, cap:C5, st:{ cx0:98, cx1:-58 }, m:{ manC:[-24, F, "push", -1, 132, F] }, out:["manC"] },
      { t:"14:20:00", d:5, cap:"14:20，鑑價師掛了電話，從門口走過去，沒有進去，上了樓梯。", m:{ luoC:[-20, F, "carry@case", -1, 180, F] }, out:["luoC"] },
      { t:"14:21:00", d:4, cap:C6, m:{ manC:[132, F, "carry@bucket&mop", 1, -20, F] } },
      { t:"14:21:20", d:2.5, join:true, cap:C6, st:{ bk:122 }, m:{ manC:[138, F, "door@card&mop", 1, 132, F] } },
      { t:"14:21:30", d:2.5, join:true, cap:C6, m:{ manC:[124, DY, "carry@bucket&mop", 1, 130, F] }, out:["manC"] },
      { t:"14:25:00", d:2, cap:C7, m:{ manC:[124, F, "carry@bucket&mop", -1, 124, DY] } },
      { t:"14:25:10", d:3.5, join:true, cap:C7, m:{ manC:[-20, F, "carry@bucket&mop", -1] }, out:["manC"] },
      { t:"14:30:00", d:4, cap:C8, m:{ liC:[124, F, "stand", 1, -20, F], youC:[110, F, "stand", 1, -34, F], wuC:[96, F, "stand", 1, -48, F], xuC:[82, F, "stand", 1, -62, F], kuiC:[68, F, "stand", 1, -76, F], caiC:[54, F, "stand", 1, -90, F] } },
      { t:"14:30:15", d:3.5, join:true, cap:C8, m:{ liC:[124, DY, "stand", 1], youC:[124, DY, "stand", 1], wuC:[124, DY, "stand", 1], xuC:[124, DY, "stand", 1], kuiC:[124, DY, "stand", 1], caiC:[124, DY, "stand", 1] }, out:["liC", "youC", "wuC", "xuC", "kuiC", "caiC"] }
    ]),
    cctv33_gold: mk("c33_gold", { clip:true }, "KIM FOOK", "2027-03-08", [
      { t:"18:14:00", d:4.5, cap:"18:14，一個女人走進來，手上提著一個便當袋。", m:{ luC:[170, F, "stand", -1], manC:[140, F, "carry@bag", 1, -16, F] } },
      { t:"18:15:00", d:4, cap:"18:15，她從便當袋裡拿出一條抹布，放在櫃台上，打開。", m:{ manC:[140, F, "reach@cloth", 1] } },
      { t:"18:16:00", d:5, cap:"18:16 到 18:20，呂金福一樣一樣放上秤。他拿起一只手鐲，用放大鏡看了很久。", st:{ gold:true }, m:{ luC:[162, F, "inspect@magnifier", -1, 170, F], manC:[140, F, "stand", 1] } },
      { t:"18:20:00", d:4.5, cap:"18:20，他從抽屜裡數錢。她在單子上簽了名。", st:{ gold:true }, m:{ luC:[162, F, "give@cash", -1], manC:[142, F, "sign", 1] } },
      { t:"18:24:00", d:4, cap:"18:24，她把錢放進便當袋，拉上拉鍊，朝他鞠了一個躬。", st:{ gold:true }, m:{ luC:[162, F, "stand", -1], manC:[142, F, "hold@bag", 1] } },
      { t:"18:26:00", d:4.5, cap:"18:26，她走出店門，往醫院的方向走。", st:{ gold:true }, m:{ manC:[-16, F, "carry@bag", -1, 142, F] }, out:["manC"] }
    ])
  };
  [...EP33.cctv, ...EP33.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案：重現 ---------- */
  const mkR = beats => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join); const seq = beats.map(b => b.st || {});
    return beats.map(b => { const o = Object.assign({}, b, { opt:Object.assign({}, b.opt || {}, { ds, seq }) }); delete o.st; return o; }); };
  const V = { tbl:false, key:true };
  const RB = mkR([
    { t:"03/08 14:04", d:5, cap:"14:04，鑑價結束。七盒都在，封條都是新的。陳葵拍了照。櫃門上，插著一把鑰匙。", scene:"c33_vault", opt:V, st:{ box7:true }, m:{ caiC:[84, F, "stand", 1], luoC:[124, F, "inspect", 1], xuC:[150, F, "write", -1], kuiC:[176, F, "cam", -1] } },
    { t:"03/08 14:05", d:5, cap:"14:05，六個人上樓開會。蔡明宏把櫃門帶上。鑰匙，沒有拔。", scene:"c33_vault", opt:V, st:{ box7:true, shut:true }, m:{ caiC:[-20, F, "stand", -1, 84, F], luoC:[-34, F, "carry@case", -1, 124, F], xuC:[-48, F, "stand", -1, 150, F], kuiC:[-62, F, "stand", -1, 176, F] }, out:["caiC", "luoC", "xuC", "kuiC"] },
    { t:"03/08 14:10", d:5, cap:"14:10，她照每天的時間下來收垃圾。門開著。她還是刷了卡。", scene:"c33_hall", opt:{}, st:{ cx0:-22, cx1:110 }, m:{ manC:[98, F, "push", 1, -34, F] } },
    { t:"03/08 14:11", d:4.5, cap:"裡面沒有人。A-2 的櫃門上，插著那一把鑰匙。她站了很久。", scene:"c33_vault", opt:V, st:{ box7:true, shut:true }, m:{ manC:[66, F, "stand", 1, -20, F] } },
    { t:"03/08 14:12", d:4.5, join:true, cap:"她拿了最邊邊的那一盒，壓在垃圾袋的最下面。吊秤印了一張標籤：0.74 公斤。", scene:"c33_vault", opt:V, st:{ box7:false }, m:{ manC:[84, F, "inspect@box/#2a3a7a", 1] } },
    { t:"03/08 14:16", d:5.5, cap:"14:16，清潔工具間。金飾倒進了便當袋。空盒子，用清潔車上的膠帶封了回去。", scene:"c33_jan", opt:{}, m:{ manC:[96, F, "reach@tape", 1, -20, F] } },
    { t:"03/08 14:21", d:5, cap:"14:21，她第二次進去。空盒子在水桶裡。", scene:"c33_hall", opt:{}, m:{ manC:[132, F, "carry@bucket&mop", 1, -20, F] } },
    { t:"03/08 14:23", d:5, cap:"盒子放回第 7 格。櫃門帶上。14:31，蔡明宏鎖了櫃子，把鑰匙拔了下來。", scene:"c33_vault", opt:V, st:{ box7:true }, m:{ manC:[92, F, "reach@box/#2a3a7a", 1, -20, F] } },
    { t:"03/08 17:10", d:5, cap:"17:02，她下班，便當袋沒有人檢查。17:10，許知夏把第七盒放上秤：38 公克。", scene:"c33_vault", opt:{ key:false }, m:{ xuC:[126, F, "inspect", 1], liC:[150, F, "cross", -1], caiC:[84, F, "stand", 1] } },
    { t:"03/08 18:20", d:5, cap:"18:20，金福銀樓。六兩二錢，七十九萬三千。", scene:"c33_gold", opt:{}, m:{ luC:[162, F, "give@cash", -1], manC:[142, F, "hold@bag", 1, -16, F] } },
    { t:"03/08 19:05", d:5.5, cap:"19:05，澄港醫院。繳費櫃台關門以前，她繳了七十八萬。那天晚上，她買了雞腿便當。", scene:"c33_ward", opt:{}, m:{ enC:[104, F, "sit", -1], manC:[70, F, "give@box", 1, -16, F] } }
  ]);
  EP33.court = {
    title: "證物室前台・3 月 9 日 14:00", scene: "c33_office", opt:{},
    who: ph => ["li", "wu", "kui"],
    open: ph => "14:00，證物室的前台。黎光耀把小本子翻到新的一頁，筆尖停在紙上。門，今天是關著的。",
    kindLine: {
      lost: "沒有人拿。是登記或擺放出了錯。",
      old: "3 月 8 日以前就被拿走了，那一天只是被發現。",
      day: "3 月 8 日下午，14:05 到 14:30 之間，被人從 A-2 的櫃子裡拿走的。"
    },
    kindTrue: "（黎光耀在本子上寫了一行。「二十五分鐘。……人呢？」）",
    murmur: [ "（走廊上，有人推著一台車走過去。）", "（陳葵把平板轉了過來。）", "（小吳把一張秤重的標籤，放在桌上。）" ],
    confess: {
      man: [ "（清潔工具間。張秋滿把抹布摺好，放在清潔車上，擺正。）", "……鑰匙就插在那裡。我每天都經過那個櫃子，三年了，它從來沒有開過。", "醫院說，禮拜一。過了禮拜一，就是七月。她的背，等不到七月。", "我本來想，等錢湊齊了，買一樣的，放回去。……對不起。那一格，是我放空的。" ]
    },
    cornered: { man: "我只是進去收垃圾。每天都是我收的……" },
    deny: {
      luo: "我的箱子，封條是黎組長親手貼的，一樓也驗過了。沈警官，我靠這一張執照吃飯，二十年。",
      fang: "我？我兩點出頭就上去買壁虎了，發票還在工具箱裡。你們每一次，都是先懷疑拿扳手的。"
    },
    replayText: "3 月 8 日 14:04，A 區，貴重物品櫃——",
    replay: { scene:"c33_vault", opt:V, clean:true, cam:"經過重現", date:"2027-03-08", beats:RB },
    endGood: "張秋滿當天下午被移送。她走出地下室以前，把清潔車推回了牆邊。\n黎光耀的報告寫了四頁：沒有關的門、沒有拔的鑰匙、沒有檢查的便當袋。每一項的後面都有一個名字。第一個，是他自己的。\n金福銀樓的六樣金飾，呂金福自己送了回來，一錢不少。那七十九萬三千，他沒有提。\n小恩的手術，3 月 10 日照常。那一筆錢要怎麼算，等法院。阿桃姨下了班，去六樓陪她。",
    endBad: "報告上寫的是你的結論。黎光耀看完，沒有簽。\n三天以後，小吳把一張垃圾袋的秤重標籤放在你的桌上。他沒有講話。\n案子重新打開的時候，該問的人，已經不肯再講同樣的話了。"
  };
  // 主線：C-7 的夾層。看過的人，結尾接指紋；沒有看的人，結尾補上（下一集的前情提要才接得上）
  { const tail = () => (typeof has === "function" && has("o33_record")) ? "\n\nC-7 下面的那一張紙，許知夏親手送進了比對系統。結果，明天。"
      : "\n\n收工以前，老方把 C-7 最下面的底板拆了下來。底板的下面有一個夾層：三個空的警槍盒，和一張手寫的紙。紙上有半枚指紋。許知夏親手把它送進了比對系統。結果，明天。";
    ["endGood", "endBad"].forEach(k => { const base = EP33.court[k]; Object.defineProperty(EP33.court, k, { enumerable:true, configurable:true, get(){ return base + tail(); } }); }); }

  // 收工幕間：證物室門口（門關好了）
  if (EP33.after) EP33.after = Object.assign({}, EP33.after, { scene:"c33_hall", opt:{ shut:true },
    cast:[ { id:"kui", x:40, y:98, pose:"stand", facing:1 }, { id:"xu", x:66, y:98, pose:"stand", facing:1 }, { id:"wu", x:92, y:98, pose:"stand", facing:1 }, { id:"li", x:150, y:98, pose:"stand", facing:-1 }, { id:"_you", x:174, y:98, pose:"stand", facing:-1 } ] });

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP33.fac = { police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], gold:["#7a2a24","#f2c94c"], hospital:["#e6ecea","#2f7a6a"] };
  EP33.setting = { police:"city", lab:"city", gold:"city", hospital:"city" };
  EP33.outScenes = [];
  // 第一天：傍晚到晚上；第二天：早上，陰
  const SKY33 = [ ["#0a0f1c","#24304a","#2a3040","#323a4a",0,0], ["#9ab0c4","#d8e0e4","#4a6070","#56707a",0,0] ];
  EP33.worldSky = ph => SKY33[Math.min(ph || 0, SKY33.length - 1)];
  EP33.worldOrder = { police:["lobby","jan","b1hall","evoffice","vault","cshelf"] };
  EP33.roomDesc = {
    lobby:"一樓值班台。往地下室的樓梯在右邊。", jan:"地下一樓，樓梯旁邊的清潔工具間。漂白水的味道。", b1hall:"B1 走廊。證物室的門，用一個箱子擋著。",
    evoffice:"證物室的前台。", vault:"A 區。最裡面是貴重物品櫃。", cshelf:"C 區。四座鐵架，十幾年沒有人整理過。",
    lab33:"鑑識中心。", gfront33:"金福銀樓。中正路上的老店。", ward33:"澄港醫院六樓，兒童病房。"
  };
  const say = (who, text, name) => ({ say:[who, text], name });
  EP33.world = {};
  EP33.locations.forEach(l => { EP33.world[l.id] = { auto:true, you:YOU, order:(EP33.worldOrder || {})[l.id] }; });
  Object.assign(EP33.world.police, {
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長。A 區的東西都沒有動，黎組長守在前台。", "小吳"),
      say("wu", "鑑價的駱先生請回來了，在大門那邊。老方在 C 區收工具。", "小吳"),
      say("you", "從那個盒子開始。", "你")
    ]
  });
  EP33.mapPos = { police:[112,58,"u"], lab:[176,84,"d"], gold:[58,86,"d"], hospital:[156,30,"u"] };
  EP33.mapRoads = [["police","lab"],["police","gold"],["gold","hospital"],["police","hospital"]];
  EP33.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 14; x < 226; x += 8) for (let y = 12; y < 108; y += 7){ R(x, y, 6, 5, "#c8c0b0"); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, "#b0a898"); }
    R(0, 66, 240, 5, "#d8d4c8"); R(84, 0, 5, 112, "#d8d4c8"); R(140, 0, 4, 112, "#d8d4c8");   // 中正路和兩條直的路
    R(0, 112, 240, 23, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 113 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");
    R(104, 50, 16, 10, "#cfcabb"); R(106, 48, 12, 3, "#3f5a7a"); R(110, 52, 4, 3, "#e8c040");   // 警察局
    R(148, 20, 16, 12, "#e6ecea"); R(154, 23, 4, 1, "#c83a2a"); R(155, 22, 2, 3, "#c83a2a");   // 醫院
  };
})();
