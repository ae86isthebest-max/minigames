/* =========================================================
   第 26 集：像素畫、人物造型、行車紀錄器畫面、結案、走動畫面、地圖、開場
   ========================================================= */
EP26.art = true;
(() => {
  const PR = PX.prim, { R, P, INK } = PR;
  const W = 192, H = 108;
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  // 每一段（beat）的狀態：o.ds＝每段長度（含段和段之間的 0.5 秒，join 的段沒有），o.seq＝每段的狀態；回傳 [第幾段, 這段的進度 0–1]
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i, p] = beatAt(o.t || 0, o.ds); const s = (o.seq || [])[i] || {}; const r = { _p:p };
    Object.entries(s).forEach(([k, v]) => { r[k] = (Array.isArray(v) && v.length === 2 && Array.isArray(v[0])) ? v[0].map((a, j) => a + (v[1][j] - a) * p) : v; }); return r; };
  const glow = (x, y, r, rgb, a) => { for (let k = r; k > 0; k -= 2){ const al = Math.round(a * (1 - k / r) * 255).toString(16).padStart(2, "0"); R(x - k, y - k * 0.7, k * 2, k * 1.4, rgb + al); } };
  const tiles = (y, c, l) => { R(0, y, W, H - y, c); for (let x = 0; x < W; x += 12) R(x, y, 1, H - y, l); for (let yy = y; yy < H; yy += 6) R(0, yy, W, 1, l); };
  const lamp = x => { R(x, 2, 30, 3, "#f4f0dc"); glow(x + 15, 8, 16, "#fff8e0", 0.16); };
  const streetLamp = (x, y, h, night) => { R(x, y - h, 2, h, "#4a4e52"); R(x, y - h, 10, 2, "#4a4e52"); R(x + 7, y - h + 2, 5, 2, night ? "#fff0b0" : "#c8c8c0"); if (night) glow(x + 9, y - h + 8, 16, "#fff0b0", 0.22); };

  /* ---------- 黑色休旅車（側面）：x＝車尾（面向右）或車頭（面向左），y＝地面 ---------- */
  const suv = (x, y, d, s) => { s = s || {}; const f = d >= 0, k = s.k || 1;
    const X = (a, w) => f ? x + a * k : x + (48 - a - (w || 1)) * k;
    const B = (a, b, w, h, c) => R(X(a, w), y + b * k, w * k, h * k, c);
    B(0, -16, 48, 10, "#1e2024"); B(2, -17, 44, 1, "#34383e"); B(8, -25, 30, 9, "#1a1c20"); B(9, -24, 13, 7, s.lit ? "#5a6a7a" : "#2a3a4a"); B(24, -24, 12, 7, s.lit ? "#5a6a7a" : "#2a3a4a"); B(22, -25, 2, 9, "#1a1c20");
    if (s.driver){ B(29, -24, 5, 5, s.lit ? "#c8a888" : "#0e0e10"); B(28, -25, 7, 2, "#2a2a30"); B(29, -24, 5, 1, "#2a2a30"); }   // 駕駛（帽 T 的帽子），頭快頂到車頂
    B(46, -14, 2, 3, s.lightOut ? "#3a3a3a" : "#fff4c8"); if (!s.lightOut && s.beam) R(f ? x + 48 * k : x - 30, y - 15 * k, 30, 4, "#fff4c822");   // 大燈
    B(0, -14, 2, 3, s.brake ? "#ff3a2a" : "#7a1a1a");   // 尾燈（煞車時才亮）
    if (s.mirrorOff) { B(38, -18, 1, 3, "#5a5a5a"); if (s.dangle) B(39, -16, 2, 3, "#2a2a2e"); } else B(37, -19, 3, 3, "#1e2024");   // 右後照鏡
    if (s.dent) { B(44, -10, 4, 3, "#3a3a40"); B(45, -9, 1, 1, "#e8e4da"); B(46, -8, 1, 1, "#c83a2a"); }
    for (const a of [10, 38]) { B(a - 4, -8, 8, 8, "#0a0a0c"); B(a - 2, -6, 4, 4, "#5a5a5e"); }
    if (s.plate) { B(f ? 0 : 41, -12, 7, 3, "#e8e8e0"); }
  };
  /* 休旅車（從後面看）：cx 中心、y 地面、k 大小 */
  const suvBack = (cx, y, k, s) => { s = s || {}; const w = 30 * k, h = 22 * k;
    R(cx - w / 2, y - h, w, h * 0.62, "#1e2024"); R(cx - w * 0.42, y - h * 1.0, w * 0.84, h * 0.4, "#1a1c20"); R(cx - w * 0.36, y - h * 0.94, w * 0.72, h * 0.3, s.lit ? "#4a5a6a" : "#24303c");
    if (s.driver) { R(cx - w * 0.3, y - h * 0.94, w * 0.18, h * 0.26, "#0a0a0c"); }   // 只有左邊（駕駛座）一個頭，頂到車頂
    R(cx - w / 2, y - h * 0.5, w * 0.16, h * 0.12, s.brake ? "#ff3a2a" : "#6a1a1a"); R(cx + w / 2 - w * 0.16, y - h * 0.5, w * 0.16, h * 0.12, s.brake ? "#ff3a2a" : "#6a1a1a");
    R(cx - w * 0.14, y - h * 0.34, w * 0.28, h * 0.1, "#d8d8d0"); R(cx - w * 0.46, y - h * 0.38, w * 0.08, h * 0.38, "#0a0a0c"); R(cx + w * 0.38, y - h * 0.38, w * 0.08, h * 0.38, "#0a0a0c"); };
  /* 外送機車（側面，面向上方的路口＝畫成側面往右）：x 車尾、y 地面 */
  const scooter = (x, y, s) => { s = s || {}; if (s.down){ R(x, y - 4, 22, 4, "#e8e4da"); R(x + 4, y - 5, 10, 1, "#c83a2a"); R(x + 14, y - 10, 10, 8, "#3aa86a"); R(x - 2, y - 2, 4, 2, "#1a1a1a"); return; }
    R(x + 2, y - 10, 16, 5, "#e8e4da"); R(x + 4, y - 9, 12, 1, "#c83a2a"); R(x + 16, y - 16, 2, 8, "#5a5a5a"); R(x, y - 20, 10, 9, "#3aa86a"); R(x + 1, y - 19, 8, 1, "#7ad89a");   // 車身、紅條紋、龍頭、外送箱
    if (s.lit) R(x + 18, y - 14, 2, 2, "#fff4c8");
    for (const a of [3, 16]) R(x + a - 2, y - 4, 5, 4, "#1a1a1a");
    if (s.rider){ R(x + 8, y - 22, 6, 12, "#2a5a8a"); R(x + 9, y - 27, 5, 5, "#e8e4da"); R(x + 10, y - 25, 4, 2, "#2a2a3a"); } };

  /* ---------- 港濱路口：港濱路橫過畫面，海港街往裡面；路邊的貨車、紅綠燈、速限牌、封鎖線、林記 ---------- */
  SC.c26_cross = (o) => { o = Object.assign({}, o, stOf(o)); const night = !!o.night, wet = o.wet !== false;
    R(0, 0, W, 30, night ? "#0b0f1c" : "#8a96a2");
    // 對面的店面：林記釣具（鐵門）、阿娥粥店、一排老騎樓
    R(0, 18, W, 46, night ? "#3a3a42" : "#b8b0a0"); for (let x = 0; x < W; x += 32) { R(x, 18, 1, 46, night ? "#2a2a32" : "#a09888"); }
    R(64, 30, 40, 30, night ? "#4a4e56" : "#7a8a94"); for (let y = 32; y < 60; y += 3) R(64, y, 40, 1, night ? "#3a3e46" : "#6a7a84"); R(66, 22, 36, 7, "#2a4a6a"); for (let k = 0; k < 4; k++) R(70 + k * 8, 24, 5, 3, "#f4f0e4");
    R(110, 30, 34, 30, night ? "#2a2a30" : "#5a4a3a"); R(112, 22, 30, 7, "#c8402a"); for (let k = 0; k < 3; k++) R(116 + k * 8, 24, 5, 3, "#fff4d8"); R(140, 24, 3, 3, "#fff4d8"); if (night) { R(114, 34, 26, 20, "#ffd98a"); glow(127, 44, 18, "#ffd98a", 0.2); }
    R(150, 22, 42, 38, night ? "#34343c" : "#a8a090"); R(156, 30, 12, 14, night ? "#1a1a20" : "#7a8a94"); R(174, 30, 12, 14, night ? "#ffd98a" : "#7a8a94");
    // 人行道、港濱路（兩線道）、海港街路口的斑馬線
    R(0, 60, W, 6, night ? "#4a4a48" : "#a8a49a"); R(0, 66, W, 42, night ? "#1e2024" : "#5a5e62");
    for (let x = 4; x < W; x += 20) R(x, 86, 10, 1, night ? "#8a8a80" : "#e8e4d0");   // 分向線
    for (let k = 0; k < 9; k++) R(70 + k * 6, 67, 4, 40, night ? "#3a3a3a" : "#7a7e82"); for (let k = 0; k < 9; k++) R(70 + k * 6, 67, 4, 40, night ? "#5a5a58" : "#d8d8d0");   // 海港街的斑馬線
    R(68, 100, 56, 2, night ? "#8a8a80" : "#e8e4d0");   // 停止線
    if (wet) { for (let k = 0; k < 10; k++) R((k * 41 + 7) % 184, 70 + (k * 13) % 34, 12, 1, night ? "#ffd98a33" : "#c8d0d860"); }
    streetLamp(40, 60, 46, night); streetLamp(176, 60, 46, night);
    // 紅綠燈：港濱路方向紅燈（o.red）、海港街綠燈
    R(152, 20, 2, 46, "#3a3a3e"); R(146, 20, 14, 6, "#2a2a2e"); P(148, 22, o.green ? "#3ae04a" : "#3a3a3a"); P(152, 22, "#3a3a3a"); P(156, 22, o.green ? "#3a3a3a" : "#ff3a2a"); if (night && !o.green) glow(156, 23, 6, "#ff3a2a", 0.3);
    R(150, 46, 6, 12, "#8a8a86"); R(151, 48, 4, 4, "#5a5a56");   // 號誌控制箱
    R(31, 9, 14, 14, "#f4f4f0"); R(32, 10, 12, 12, "#d83a2a"); R(34, 12, 8, 8, "#f4f4f0");   // 速限牌：50
    { const G5 = ["###","#..","###","..#","###"], G0 = ["###","#.#","#.#","#.#","###"]; [G5, G0].forEach((G, n) => G.forEach((row, y) => [...row].forEach((c, x) => { if (c === "#") P(34.5 + n * 4 + x, 13.5 + y, "#1a1a1a"); }))); }
    R(37, 23, 2, 37, "#8a8a86"); R(35, 27, 6, 3, "#e87aa8");   // 柱子、綁著的舊塑膠花
    // 路邊的貨車（西南角，停車錄影）
    if (!o.noTruck) { R(4, 50, 26, 26, "#e8e8e4"); R(30, 58, 16, 18, "#3a6aa8"); R(32, 60, 10, 7, "#9cc5e6"); R(34, 61, 3, 2, "#e04a3a"); for (const a of [10, 38]) R(a, 74, 7, 7, "#1a1a1a"); R(10, 60, 14, 8, "#3a6aa8"); R(12, 62, 10, 1, "#e8e8e4"); R(12, 65, 7, 1, "#e8e8e4"); }
    // 現場：倒下的機車、碎片、封鎖線、粉筆
    if (o.scene) { scooter(84, 92, { down:true }); R(112, 96, 14, 1, "#2a2a2a"); R(110, 95, 2, 3, "#f4f4f0"); R(62, 97, 6, 2, "#1a1a1e"); R(64, 96, 3, 1, "#2a2a30"); R(108, 88, 1, 12, "#f4f4f0"); R(108, 88, 18, 1, "#f4f4f0"); }
    if (o.tape) { PR.OBJ.tape(120, 70, 30); PR.OBJ.tape(10, 92, 50); }
    // 動畫：機車（從海港街往路口）、休旅車（港濱路由左往右）
    if (o.sc) scooter(o.sc[0], o.sc[1], { rider:!o.scDown, lit:night, down:o.scDown });
    if (o.car) suv(o.car[0], o.car[1], 1, { driver:true, beam:night, brake:false, mirrorOff:o.hit, dangle:o.hit, dent:o.hit, lightOut:o.hit });
    if (o.flash) R(0, 0, W, H, "#ffffff40");
    if (o.he) { R(170, 58, 10, 10, "#2a2a2a"); R(172, 60, 6, 6, "#4a5a6a"); R(174, 62, 2, 2, "#9cc5e6"); }   // 何沛恩的相機包
  };

  /* ---------- 行車紀錄器的「第一人稱」畫面：路往遠方縮小；休旅車從後面看 ---------- */
  SC.c26_pov = (o) => { o = Object.assign({}, o, stOf(o)); const night = o.night !== false, vx = 96, vy = 44;
    R(0, 0, W, vy, night ? "#0d1220" : "#8a96a2");
    R(0, vy, W, H - vy, night ? "#141618" : "#4a4e52");
    const g = PR.g(); g.fillStyle = night ? "#1e2024" : "#5a5e62"; g.beginPath(); g.moveTo(vx - 4, vy); g.lineTo(vx + 4, vy); g.lineTo(W + 60, H); g.lineTo(-60, H); g.closePath(); g.fill();
    const off = ((o.t || 0) * (o.speed || 1.2)) % 1;
    for (let k = 0; k < 7; k++) { const z = (k + off) / 7, y = vy + (H - vy) * z * z, w = 1 + 3 * z * z; R(vx - w / 2 + (o.lane || 0) * z, y, w, 2 + 6 * z * z, night ? "#8a8a70" : "#e8e4d0"); }   // 中線
    for (let k = 0; k < 6; k++) { const z = ((k + off) / 6); if (z < 0.22) continue; const y = vy + (H - vy) * z * z, xl = vx - (vx + 60) * z * z, xr = vx + (W + 60 - vx) * z * z, h = 8 + 50 * z * z;
      R(xl - 2, y - h, 1 + 2 * z, h, "#3a3e42"); R(xr, y - h, 1 + 2 * z, h, "#3a3e42"); if (night) { glow(xl + 4 * z, y - h, 4 + 12 * z, "#fff0b0", 0.25); glow(xr - 4 * z, y - h, 4 + 12 * z, "#fff0b0", 0.25); } }
    if (o.wet !== false) for (let k = 0; k < 8; k++) R(20 + (k * 29) % 150, vy + 12 + (k * 11) % 50, 10, 1, "#ffd98a22");
    if (o.signal) { R(150, 8, 2, 30, "#3a3a3e"); R(144, 8, 14, 5, "#2a2a2e"); P(146, 10, o.signal === "red" ? "#3a3a3a" : "#3ae04a"); P(154, 10, o.signal === "red" ? "#ff3a2a" : "#3a3a3a"); }
    if (o.rear) suvBack(o.rear[0], o.rear[1], o.rear[2], { driver:true, lit:!!o.lit, brake:!!o.brake });
    if (o.side) suv(o.side[0], o.side[1], 1, { driver:true, lit:!!o.lit, beam:true, mirrorOff:!!o.broken, dangle:!!o.broken, lightOut:!!o.broken, dent:!!o.broken, plate:!!o.plate });
    if (o.cross) { R(0, 58, W, 14, night ? "#1e2024" : "#5a5e62"); for (let k = 0; k < 12; k++) R(k * 16, 64, 8, 1, "#8a8a70"); }   // 橫過前面的港濱路
    if (o.scooter) scooter(o.scooter[0], o.scooter[1], { rider:true, lit:true });
    if (o.truckCab) { R(0, 0, W, 6, "#1a1a1a"); R(0, H - 8, W, 8, "#1a1a1a"); R(0, 0, 6, H, "#1a1a1a"); }   // 聯結車的擋風玻璃框
  };

  /* ---------- 酒吧門口的小街（停車錄影／重現） ---------- */
  SC.c26_street = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 22, "#0b0f1c"); R(0, 14, W, 60, "#2a2630"); for (let x = 0; x < W; x += 24) R(x, 14, 1, 60, "#221e28");
    R(20, 34, 30, 40, "#3a2a20"); R(22, 36, 26, 38, "#5a3a2a"); R(34, 36, 1, 38, "#3a2a20"); R(18, 24, 36, 9, "#1a1a2a"); txt("港灣", 26, 31, "#ff9a3a", "7px sans-serif"); glow(36, 28, 20, "#ff9a3a", 0.25);   // 酒吧的門、霓虹招牌
    R(60, 40, 40, 20, "#4a3a2a"); R(62, 42, 36, 16, "#ffd98a"); glow(80, 50, 22, "#ffd98a", 0.18);
    R(0, 74, W, 8, "#3a3a38"); R(0, 82, W, 26, "#1a1c1e"); R(104, 82, 88, 2, "#c83a2a");   // 人行道、馬路、紅線
    streetLamp(160, 74, 54, true);
    if (o.parked !== false && !o.car) suv(118, 98, 1, { lit:true, plate:true });
    if (o.car) suv(o.car[0], o.car[1], 1, { driver:!!o.drv, lit:true, beam:true, plate:true });
  };

  /* ---------- 山上的坡道和王家大門（鄰居的停車錄影／重現） ---------- */
  SC.c26_hill = (o) => { o = Object.assign({}, o, stOf(o)); const night = o.night !== false;
    R(0, 0, W, 50, night ? "#0b0f1c" : "#8ab0d0"); if (night) for (let k = 0; k < 14; k++) P((k * 37) % W, (k * 13) % 30, "#c8c8d8");
    for (let k = 0; k < 6; k++) R(k * 32 - 4, 30 + (k % 2) * 4, 36, 30, night ? "#14201a" : "#3a5a3a");   // 樹
    R(100, 22, 92, 60, night ? "#3a3a40" : "#d8d0c0"); R(100, 20, 92, 4, night ? "#2a2a30" : "#8a7a6a"); for (const x of [112, 140, 168]) R(x, 32, 14, 12, night ? "#ffd98a" : "#9cc5e6");   // 王家別墅
    R(100, 56, 8, 30, "#5a5a5e"); R(176, 56, 8, 30, "#5a5a5e"); R(108, 58, 68, 2, "#2a2a2e"); for (let x = 110; x < 176; x += 6) R(x, 58, 1, 28, "#2a2a2e");   // 大門鐵欄
    if (o.gateOpen) R(110, 58, 64, 28, night ? "#1a1a20" : "#7a7a70");
    R(0, 86, W, 22, night ? "#1e2024" : "#6a6e70"); for (let x = 0; x < W; x += 18) R(x, 96, 8, 1, "#8a8a70");
    streetLamp(60, 86, 50, night);
    if (o.car) suv(o.car[0], o.car[1], o.car[2] === undefined ? 1 : o.car[2], { driver:!!o.drv, lit:night, beam:night, mirrorOff:true, dangle:true, lightOut:true, dent:true, plate:true });
    if (o.tow) { const x = o.tow[0], y = o.tow[1]; R(x, y - 20, 22, 14, "#e8c040"); R(x + 2, y - 18, 10, 7, "#9cc5e6"); R(x - 40, y - 10, 40, 4, "#5a5a5e"); R(x - 40, y - 14, 4, 4, "#5a5a5e"); for (const a of [4, -10, -34]) R(x + a, y - 6, 8, 6, "#1a1a1a"); R(x + 18, y - 22, 3, 2, "#ff9a2a"); suv(x - 46, y - 10, 1, { mirrorOff:true, lightOut:true, dent:true }); }
  };

  /* ---------- 交通隊（刑大一樓）：兩台螢幕、白板路口圖、桌上的牛皮紙袋、黎光耀的保溫杯 ---------- */
  SC.c26_traffic = (o) => { o = Object.assign({}, o, stOf(o)); const night = !!o.night;
    R(0, 0, W, 86, "#cfcabb"); R(0, 58, W, 28, "#b8b2a2"); lamp(40); lamp(130);
    for (const x of [20, 60]) { R(x, 40, 30, 22, "#1a1a1e"); R(x + 2, 42, 26, 16, night ? "#2a3a4a" : "#3a4a5a"); R(x + 4, 50, 22, 6, "#1e2024"); R(x + 6, 44, 6, 4, "#ffd98a"); R(x + 13, 61, 4, 3, "#2a2a2e"); }   // 兩台螢幕
    R(10, 64, 100, 5, "#7a5a3a"); R(10, 64, 100, 1, "#9a7a5a"); for (const x of [14, 104]) R(x, 69, 3, 17, "#5a3a2a");
    for (let k = 0; k < 6; k++) R(14 + k * 7, 62, 5, 2, ["#2a2a2a","#3a6aa8","#2a2a2a","#c83a2a","#2a2a2a","#e8c040"][k]);   // 一排記憶卡
    // 白板：路口圖和便利貼
    R(110, 14, 46, 32, "#f8f8f4"); R(110, 14, 46, 1, "#9a9a9a"); R(114, 28, 38, 4, "#9a9a9a"); R(130, 18, 4, 24, "#9a9a9a"); for (let k = 0; k < 6; k++) R(113 + k * 7, 37, 5, 5, ["#f4e04a","#f4e04a","#f4e04a","#f0a8c8","#f0a8c8","#f0a8c8"][k]); R(127, 28, 3, 3, "#c83a2a");
    // 右邊的桌子：牛皮紙袋（晚上才有）、保溫杯
    R(92, 64, 80, 4, "#8a6a4a"); for (const x of [96, 166]) R(x, 68, 3, 18, "#6a4a2a");
    if (o.envelope !== false && night) { R(96, 58, 16, 6, "#c8a870"); R(96, 58, 16, 1, "#a88850"); }
    R(150, 56, 6, 8, "#c8ccd0"); R(150, 55, 6, 1, "#8a8e92"); R(151, 58, 4, 2, "#e8e4da");
    R(170, 18, 16, 40, "#6a7a8a"); R(172, 20, 12, 36, night ? "#1a2030" : "#9cc5e6");   // 門
    tiles(86, "#9a9a90", "#8a8a80");
  };

  /* ---------- 澄港醫院急診：掛號櫃台、走廊、護理站、販賣機 ---------- */
  SC.c26_er = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#e6ecea"); R(0, 44, W, 3, "#7fb6a8"); lamp(30); lamp(110);
    R(14, 18, 50, 10, "#2f7a6a"); R(20, 20, 6, 6, "#ffffff"); R(22, 20, 2, 6, "#c83a2a"); R(20, 22, 6, 2, "#c83a2a"); for (let k = 0; k < 3; k++) R(32 + k * 9, 21, 6, 4, "#e8f4f0");
    R(14, 58, 54, 28, "#c8d4d0"); R(14, 56, 54, 3, "#a8b8b4"); R(30, 50, 22, 6, "#2a2a2e"); R(32, 51, 18, 4, "#4a7a9a");   // 掛號櫃台、電腦
    R(84, 30, 22, 36, "#d8e0dc"); R(86, 32, 18, 18, "#b8d8e8"); R(84, 66, 22, 3, "#a8b0ac");   // 走廊盡頭的門
    R(106, 60, 46, 26, "#c8d4d0"); R(106, 58, 46, 3, "#a8b8b4"); R(110, 54, 12, 6, "#f4f4f0"); R(112, 55, 4, 3, "#c83a2a"); R(118, 55, 3, 3, "#2a2a2e");   // 護理站：記憶卡放在一張紙上
    R(126, 50, 20, 8, "#2a2a2e"); R(127, 51, 18, 6, "#3aa86a");   // 監測螢幕
    R(160, 30, 22, 52, "#c83a2a"); R(162, 34, 18, 26, "#e8f0f4"); for (let k = 0; k < 3; k++) for (let j = 0; j < 4; j++) R(163 + j * 4, 36 + k * 8, 3, 6, ["#3a6aa8","#e8c040","#4a8a4a","#f4f4f0"][j]); R(166, 64, 10, 4, "#1a1a1a");   // 販賣機
    tiles(86, "#c8d0cc", "#b8c0bc");
  };
  /* ---------- 急診旁邊的家屬休息區：長椅、小桌上的手機、紙房子 ---------- */
  SC.c26_fam = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#e2e6e4"); R(0, 60, W, 26, "#d0d6d4"); lamp(80);
    R(20, 16, 40, 28, "#7fb6a8"); R(22, 18, 36, 24, "#a8d8c8"); R(26, 24, 8, 12, "#2a4a4a"); R(28, 20, 4, 4, "#2a4a4a"); R(38, 26, 6, 10, "#2a4a4a"); R(39, 22, 4, 4, "#2a4a4a"); R(48, 30, 6, 6, "#2a4a4a");
    R(70, 20, 30, 24, "#f4f4f0"); R(72, 22, 26, 2, "#c83a2a"); for (let k = 0; k < 4; k++) R(72, 27 + k * 4, 22, 1, "#8a8a8a");   // 公告
    R(84, 62, 34, 4, "#c8a878"); R(88, 66, 3, 20, "#a88858"); R(112, 66, 3, 20, "#a88858"); R(96, 58, 12, 4, "#1a1a1e"); R(97, 59, 10, 2, "#3a4a6a"); P(100, 59, "#e8e8f0");   // 小桌、裂掉的手機
    R(120, 64, 66, 4, "#3a6aa8"); R(120, 54, 66, 3, "#3a6aa8"); for (const x of [124, 152, 180]) R(x, 68, 3, 18, "#2a4a7a");   // 長椅
    R(130, 54, 12, 8, "#f4ecd8"); R(129, 52, 14, 3, "#e87a5a"); R(134, 57, 3, 5, "#8a5a3a");   // 紙房子（屋頂紅色，門還沒剪開）
    tiles(86, "#c8ccca", "#b8bcba");
  };

  /* ---------- 王家：玄關和客廳（鑰匙箱、全家福、管家桌上的監視器） ---------- */
  SC.c26_wang = (o) => { o = Object.assign({}, o, stOf(o)); const night = !!o.night;
    R(0, 0, W, 86, "#e8dcc4"); R(0, 0, W, 4, "#c8b898"); R(0, 64, W, 22, "#d8c8a8"); lamp(60); lamp(140);
    R(22, 30, 18, 22, "#7a5a3a"); R(24, 32, 14, 18, "#a87a4a"); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (!(r === 2 && c === 1)) { R(26 + c * 4, 35 + r * 5, 1, 3, "#c8c0a0"); R(25 + c * 4, 34 + r * 5, 3, 1, "#c8c0a0"); } R(29, 44, 2, 1, "#c8c0a0"); R(26, 52, 10, 8, "#f4ecd8"); R(27, 54, 8, 1, "#5a5a5a"); R(27, 56, 6, 1, "#5a5a5a");   // 鑰匙箱（一個空鉤）和鑰匙簿
    R(80, 20, 26, 18, "#c8a838"); R(82, 22, 22, 14, "#d8d0c0"); for (let k = 0; k < 3; k++) R(86 + k * 6, 26, 4, 8, ["#2a2a3a","#8a3a4a","#3a3a5a"][k]); R(83, 30, 3, 6, "#3a4a5a"); R(84, 33, 2, 2, "#3a6aa8");   // 全家福（邊邊是老劉和小男孩）
    R(100, 50, 48, 16, "#5a2a1a"); R(98, 62, 52, 6, "#6a3a2a"); R(96, 56, 4, 12, "#4a1a10"); R(148, 56, 4, 12, "#4a1a10"); R(102, 68, 3, 18, "#3a1a10"); R(143, 68, 3, 18, "#3a1a10");   // 沙發
    R(156, 52, 30, 4, "#4a3a2a"); R(158, 56, 3, 30, "#3a2a1a"); R(181, 56, 3, 30, "#3a2a1a"); R(162, 40, 16, 12, "#1a1a1e"); R(163, 41, 14, 9, night ? "#2a3a4a" : "#3a4a5a"); for (let k = 0; k < 4; k++) R(164 + (k % 2) * 7, 42 + Math.floor(k / 2) * 4, 6, 3, "#4a5a6a");   // 管家桌上的監視器
    R(4, 14, 12, 50, "#8a6a4a"); R(5, 16, 10, 46, "#a88050"); P(13, 40, "#e8c040");   // 大門
    R(56, 50, 14, 14, "#e8e0d0"); R(58, 40, 10, 10, "#4a8a4a");   // 盆栽
    tiles(86, "#c8b8a0", "#b8a890");
  };
  /* ---------- 王家車庫：空的車位、拖吊車的胎痕、油漬、紅色跑車；鐵門外坡道上鄰居的車 ---------- */
  SC.c26_carport = (o) => { o = Object.assign({}, o, stOf(o)); const night = !!o.night;
    R(0, 0, W, 86, "#a8a8a0"); R(0, 0, W, 6, "#7a7a72"); lamp(70); lamp(150);
    R(0, 20, 50, 66, night ? "#0b0f1c" : "#8ab0d0"); R(0, 60, 50, 26, night ? "#1e2024" : "#6a6e70"); for (let x = 2; x < 50; x += 5) R(x, 20, 1, 66, "#3a3a3e");   // 鐵門外：坡道
    R(4, 56, 40, 20, "#e8e8e4"); R(10, 50, 26, 8, "#d8d8d4"); R(12, 51, 10, 6, "#9cc5e6"); R(24, 51, 10, 6, "#9cc5e6"); R(28, 52, 3, 2, "#e04a3a"); for (const a of [8, 32]) R(a, 72, 7, 7, "#1a1a1a");   // 鄰居的白色小車（停車錄影的紅燈）
    for (let x = 50; x < W; x += 46) R(x, 6, 2, 80, "#8a8a82");
    R(130, 58, 50, 18, "#c82a2a"); R(140, 52, 28, 8, "#a81a1a"); R(142, 53, 24, 5, "#8a9aa8"); R(143, 53, 22, 1, "#b8b8b0"); P(150, 55, "#8a6a3a"); P(156, 54, "#8a6a3a"); for (const a of [138, 170]) R(a, 72, 8, 8, "#1a1a1a");   // 紅色跑車（擋風玻璃上一層灰和落葉）
    R(0, 86, W, 22, "#8a8a84"); R(60, 90, 70, 3, "#2a2a2a"); R(60, 94, 70, 3, "#2a2a2a"); R(78, 96, 14, 5, "#2a2620"); for (let k = 0; k < 4; k++) P(100 + k * 3, 92 - (k % 2), "#e8f0f4");   // 拖吊車的雙胎痕、油漬、車燈碎玻璃
    R(85, 79, 2, 6, "#e8e4d0"); R(84, 80, 1, 1, "#e8e4d0"); R(84, 85, 4, 1, "#e8e4d0");
  };

  /* ---------- 阿德汽車修理廠：升降架上的休旅車、牆上的拖吊單、工作台抽屜、月曆 ---------- */
  SC.c26_garage = (o) => { o = Object.assign({}, o, stOf(o)); const night = !!o.night;
    R(0, 0, W, 86, "#7a7a72"); for (let y = 4; y < 60; y += 4) R(0, y, W, 1, "#6a6a62"); R(0, 0, W, 4, "#5a5a52"); lamp(90);
    R(44, 74, 108, 4, "#c8a838"); R(48, 78, 6, 8, "#8a8a82"); R(142, 78, 6, 8, "#8a8a82");   // 升降架
    suv(50, 74, 1, { k:2, mirrorOff:true, lightOut:true, dent:true, plate:true });
    // 車頭（右邊）放大看得到的凹痕和漆：畫在 suv 上
    R(150, 40, 14, 12, "#f4f0e4"); R(151, 42, 12, 1, "#5a5a5a"); R(151, 45, 10, 1, "#5a5a5a"); R(151, 48, 8, 1, "#5a5a5a"); R(156, 38, 2, 3, "#8a8a8a");   // 夾在牆上的拖吊單
    R(8, 62, 40, 6, "#6a4a2a"); R(10, 68, 36, 18, "#5a3a2a"); R(24, 62, 12, 6, "#7a5a3a"); R(28, 64, 4, 1, "#c8a870");   // 工作台、抽屜
    for (let k = 0; k < 5; k++) R(10 + k * 7, 30, 2, 14, "#3a3a3e"); R(8, 28, 38, 2, "#5a5a5e");   // 牆上的工具
    R(170, 16, 16, 20, "#f4f4f0"); R(170, 16, 16, 4, "#c83a2a"); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) R(171 + c * 4, 22 + r * 4, 2, 2, r === 1 && c === 2 ? "#c83a2a" : "#8a8a8a");   // 月曆
    if (night) R(0, 0, W, 86, "#0b0f1c30");
    tiles(86, "#5a5a52", "#4a4a42");
  };

  /* ---------- 港灣酒吧：吧台、最裡面的高腳椅、收銀機旁的帳單、老闆的記憶卡 ---------- */
  SC.c26_bar = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#2a2026"); for (let x = 0; x < W; x += 10) R(x, 0, 1, 86, "#221a20"); glow(60, 10, 30, "#ff9a3a", 0.12); glow(140, 10, 30, "#ff9a3a", 0.12);
    R(20, 14, 120, 30, "#3a2a20"); for (let s = 0; s < 3; s++) { R(22, 22 + s * 10, 116, 1, "#5a4a3a"); for (let b = 0; b < 14; b++) R(24 + b * 8, 15 + s * 10, 4, 7, ["#c8a040","#8a4a2a","#4a8a5a","#e8e4c8","#6a3a2a"][(b + s) % 5]); }   // 酒櫃
    R(10, 62, 150, 6, "#5a3a24"); R(10, 60, 150, 3, "#7a5a3a"); R(12, 68, 146, 18, "#3a2618");   // 吧台
    for (const x of [30, 56, 82, 108]) { R(x, 66, 12, 3, "#8a2a2a"); R(x + 5, 69, 2, 15, "#8a8a8a"); R(x + 2, 84, 8, 1, "#8a8a8a"); }   // 高腳椅
    R(31, 65, 10, 1, "#6a1a1a");   // 最裡面那張：椅墊坐出一個凹
    R(120, 52, 14, 8, "#1a1a1e"); R(122, 53, 10, 4, "#3a6a4a"); R(120, 58, 14, 4, "#f4f0e4"); R(122, 59, 8, 1, "#5a5a5a");   // 收銀機和帳單
    R(66, 56, 4, 6, "#e8e4c8"); R(67, 57, 2, 3, "#c8a040"); R(90, 56, 4, 6, "#e8e4c8");   // 杯子
    R(160, 22, 28, 34, "#1a1a20"); R(162, 24, 24, 30, "#0b0f1c"); R(170, 30, 4, 4, "#ffd98a"); R(160, 40, 18, 14, "#3a2a20"); R(164, 44, 6, 4, "#2a2a2a"); R(171, 45, 4, 3, "#c83a2a");   // 窗外的街、窗台上老闆的記憶卡盒
    tiles(86, "#3a2a20", "#2a1a14");
  };

  /* ---------- 地方法院：羈押庭外的走廊、庭期表、長椅 ---------- */
  SC.c26_court = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 86, "#d8d4c8"); R(0, 54, W, 32, "#c8c0a8"); R(0, 52, W, 2, "#8a7a5a"); lamp(30); lamp(130);
    R(40, 20, 26, 20, "#f4f4f0"); R(42, 22, 22, 2, "#2a2a2a"); for (let k = 0; k < 4; k++) R(42, 27 + k * 3, 18 - (k % 2) * 4, 1, "#5a5a5a"); R(62, 20, 4, 3, "#e8e0a0");   // 庭期表（膠帶在翹）
    R(140, 14, 36, 50, "#6a4a2a"); R(142, 16, 32, 48, "#8a6a4a"); R(157, 16, 2, 48, "#6a4a2a"); R(146, 8, 24, 6, "#2a2a2a"); for (let k = 0; k < 4; k++) R(148 + k * 5, 10, 3, 2, "#e8e0c0");   // 法庭的門
    R(80, 66, 50, 4, "#6a4a2a"); R(80, 58, 50, 4, "#6a4a2a"); for (const x of [84, 124]) R(x, 70, 3, 16, "#4a3a2a"); R(100, 62, 12, 5, "#f4f4f0"); R(101, 63, 8, 1, "#c83a2a");   // 長椅、估價單
    R(10, 30, 20, 30, "#8a96a2"); R(12, 32, 16, 26, "#0b0f1c");   // 窗（夜）
    tiles(86, "#a8a090", "#989080");
  };

  /* ---------- 收工幕間：漁港的冰店旁邊，一支漆都掉光的公共電話 ---------- */
  SC.c26_pier = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 50, "#0b0f1c"); for (let k = 0; k < 16; k++) P((k * 41 + 3) % W, (k * 17) % 34, "#c8c8d8");
    R(0, 46, W, 30, "#0e1a2a"); for (let k = 0; k < 10; k++) R((k * 23 + Math.floor((o.t || 0) * 4)) % W, 52 + (k % 4) * 5, 8, 1, "#3a5a7a");   // 海
    for (const [x, c] of [[20, "#c8402a"], [70, "#3a6aa8"]]) { R(x, 40, 36, 8, c); R(x + 8, 32, 12, 8, "#e8e4da"); R(x + 18, 20, 1, 14, "#8a8a8a"); P(x + 18, 20, "#ff3a2a"); }   // 漁船
    R(110, 24, 82, 52, "#3a3a42"); R(112, 16, 50, 9, "#e86a8a"); txt("阿珠冰店", 116, 23, "#ffffff", "7px sans-serif"); R(112, 30, 50, 40, "#5a5e62"); for (let y = 32; y < 70; y += 2) R(112, y, 50, 1, "#4a4e52");   // 冰店（鐵門拉下）
    R(168, 34, 14, 28, "#2a5a4a"); R(169, 36, 12, 14, "#8a9a8a"); R(171, 38, 8, 4, "#1a1a1a"); R(172, 44, 6, 4, "#5a5a5a"); R(176, 50, 2, 8, "#1a1a1a"); for (let k = 0; k < 6; k++) P(168 + (k * 5) % 14, 36 + (k * 7) % 26, "#6a7a6a");   // 公共電話（漆掉光）
    R(168, 62, 2, 14, "#2a2a2a"); R(180, 62, 2, 14, "#2a2a2a");
    streetLamp(96, 76, 54, true);
    R(0, 76, W, 32, "#2a2a2a"); for (let x = 0; x < W; x += 14) R(x, 76, 1, 32, "#1e1e1e");
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    liu:  { age:"old", skin:"#d0a078", hair:"#8a8a84", hairStyle:"short", top:"#f4f4f0", coat:"#2a3a5a", bottom:"#2a3a5a", tie:"#2a2a3a", mood:"tired", hello:"……車是我開的。" },
    zijie:{ skin:"#f0c8a0", hair:"#3a2a1a", hairStyle:"spiky", top:"#2a2a2e", coat:"#4a4a52", bottom:"#3a4a6a", hood:"#4a4a52", hello:"又是你們？我爸請律師了。" },
    wangdong:{ skin:"#e0b48c", hair:"#5a5a58", hairStyle:"slick", top:"#f4f4f0", coat:"#3a3a40", bottom:"#3a3a40", tie:"#8a2a2a", hello:"沈警官，辛苦了。坐。" },
    ade:  { skin:"#c89068", hair:"#2a2a2a", hairStyle:"short", top:"#3a5a7a", bottom:"#3a5a7a", apron:"#5a5a5a", hello:"……那台車，我有話要說。" },
    aqi:  { skin:"#d8a880", hair:"#1a1a1a", hairStyle:"spiky", top:"#3aa86a", bottom:"#2a2a3a", hello:"我、我整晚都在這裡！" },
    nurse:{ skin:"#f0c8a8", hair:"#2a2220", hairStyle:"bun", top:"#7ab8c8", bottom:"#7ab8c8", hello:"我十分鐘後要回去顧病人。" },
    cw:   { skin:"#f0c8a8", hair:"#2a2220", hairStyle:"long", top:"#8a7a6a", bottom:"#3a3a44", mood:"tired", hello:"……你們找到那台車了嗎？" },
    lin:  { age:"old", skin:"#c89a70", hair:"#9a9a94", hairStyle:"short", top:"#4a5a6a", coat:"#6a6a4a", bottom:"#3a3a34", mood:"tired", hello:"又是這個路口。" },
    bartender:{ skin:"#e8c09a", hair:"#1a1a1a", hairStyle:"short", top:"#f4f4f0", coat:"#1a1a1e", bottom:"#1a1a1e", tie:"#1a1a1e", hello:"還沒開始營業喔……警察？" },
    su:   { hello:"沈警官，我的當事人已經說得很清楚了。" },
    li:   { hello:"一台一台看。不要跳。" },
    ye:   { hello:"羈押庭以前，給我一個答案。" },
    xu:   { hello:"他是從左邊被撞的。" },
    wu:   { hello:"學長，記憶卡送來了！" },
    kui:  { hello:"前輩，路上的痕跡我都圈起來了！" },
    he:   { hello:"沈警官。……又見面了。" }
  };
  ["su","li","ye","xu","wu","kui","he"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  const DAILY = {
    liu:  [ { room:"tdesk", x:120, pose:"stand", doing:"站在白板前面，帽子抓在手上，一直看著地板。" }, { room:"chall", x:60, pose:"stand", doing:"站在法庭門口，兩手被手銬銬在前面。" } ],
    zijie:[ { room:"hall", x:124, pose:"sit+phone", doing:"坐在沙發上滑手機，手腕上的錶一直亮。" }, { room:"hall", x:120, pose:"cross", doing:"雙手抱胸靠在牆上，腳一直在抖。" } ],
    wangdong:[ { room:"hall", x:100, pose:"stand", doing:"站在全家福下面，西裝扣得整整齊齊。" }, { room:"hall", x:100, pose:"phone", doing:"在講電話，聲音壓得很低。" } ],
    su:   [ { room:"tdesk", x:150, pose:"read", doing:"站在老劉旁邊，翻著一份文件。" }, { room:"chall", x:120, pose:"read", doing:"坐在長椅的另一頭，翻著卷宗。" } ],
    ade:  [ { room:"bay", x:30, pose:"inspect", doing:"站在工作台旁邊，看著那台車，沒有動手。" }, { room:"bay", x:150, pose:"stand", doing:"站在升降架旁邊，手上的扳手一直沒放下。" } ],
    aqi:  [ { room:"er", x:80, pose:"phone", doing:"左手包著紗布，右手拿著手機，坐立不安。" }, null ],
    nurse:[ { room:"er", x:130, pose:"write", doing:"在護理站寫病歷，口罩拉到下巴。" }, null ],
    cw:   [ { room:"fam", x:150, pose:"sit", doing:"坐在長椅上，手上捏著一個紙做的小房子。" }, null ],
    lin:  [ { room:"lshop", x:140, pose:"stand", doing:"站在窗前，看著外面的路口。" }, null ],
    he:   [ { room:"cross", x:176, pose:"cam", doing:"在封鎖線外面拍照，鏡頭對著那幾個外送員。" }, null ],
    bartender:[ null, { room:"bar", x:90, pose:"polish@cup", doing:"在吧台後面擦杯子，一個擦了很久。" } ],
    li:   [ { room:"tdesk", x:60, pose:"write", doing:"站在螢幕後面，在小本子上寫字。" }, { room:"chall", x:170, pose:"stand", doing:"站在法庭門口的另一邊，看著你。" } ],
    ye:   [ { room:"tdesk", x:40, pose:"read", doing:"翻著交通隊的報告。" }, { room:"chall", x:150, pose:"read", doing:"手上拿著卷宗，等開庭。" } ],
    xu:   [ { room:"er", x:40, pose:"write", doing:"拿著驗傷紀錄在寫。" }, { room:"tdesk", x:96, pose:"inspect", doing:"在看 ETC 的照片，用放大鏡。" } ],
    wu:   [ { room:"cross", x:100, pose:"inspect", doing:"蹲在機車旁邊拍照。" }, { room:"tdesk", x:30, pose:"type", doing:"一台一台在看行車紀錄器。" } ],
    kui:  [ { room:"cross", x:126, pose:"kneel", doing:"蹲在路上，用粉筆把痕跡圈起來。" }, { room:"tdesk", x:76, pose:"type", doing:"在比對時間軸。" } ]
  };
  EP26.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP26.rooms = {
    junction: [
      { id:"cross", name:"港濱路口", scene:"c26_cross", opt:() => ({ scene:true, tape:true, wet:true, he:true }), details:[
        { id:"d26_porridge", name:"阿娥粥店", hot:[110,22,34,38], text:"阿娥粥店的鐵門拉到一半。老闆娘站在門口，看著路口，手上的抹布一直沒動。陳俊宏那兩碗粥，就是她煮的。" },
        { id:"d26_riders", name:"封鎖線外", hot:[176,50,14,14], text:"幾個外送員站在封鎖線外，安全帽都沒有拿下來。有一個人把機車的外送箱打開，放了一罐熱咖啡在路邊。" } ] },
      { id:"lshop", name:"林記釣具", scene:"c25_tackle", details:[
        { id:"d26_shutter", name:"鐵門", hot:[8,14,30,62], text:"林正雄說，他凌晨聽到聲音，連鐵門都沒拉，從二樓的窗戶直接看出去。" } ] }
    ],
    traffic: [ { id:"tdesk", name:"交通隊辦公室", scene:"c26_traffic", opt:(ph) => ({ night:ph === 1 }), details:[
      { id:"d26_cards", name:"一排記憶卡", hot:[12,60,44,4], text:"桌上一排記憶卡，每一張都貼著一張便利貼：車主的名字、電話、停在哪裡。" },
      { id:"d26_door", name:"門", hot:[170,18,16,40], text:"門外有人探頭進來：「下午又有一個聯結車司機打電話，說他好像也有拍到。」" } ] } ],
    hospital: [
      { id:"er", name:"急診", scene:"c26_er", details:[
        { id:"d26_door2", name:"走廊盡頭的門", hot:[84,30,22,36], text:"門上寫著「急救室」。凌晨兩點，陳俊宏就是被推進這扇門。" } ] },
      { id:"fam", name:"家屬休息區", scene:"c26_fam", details:[
        { id:"d26_notice", name:"牆上的公告", hot:[70,20,30,24], text:"「家屬休息區請保持安靜」。下面有人用原子筆加了一行：「謝謝護理師」。" } ] }
    ],
    lab: [ { id:"lab26", name:"鑑識中心", scene:"lab", details:[] } ],
    wang: [
      { id:"hall", name:"王家的玄關和客廳", scene:"c26_wang", opt:(ph) => ({ night:ph === 1 }), details:[
        { id:"d26_plant", name:"盆栽", hot:[56,40,14,24], text:"一盆修剪得很整齊的羅漢松。盆子上貼著一張小紙：「老劉每週三澆水」。" } ] },
      { id:"carport", name:"車庫", scene:"c26_carport", opt:(ph) => ({ night:ph === 1 }), details:[
        { id:"d26_number", name:"地上的「1」", hot:[80,78,10,8], text:"車位地上漆著「1」。是那台休旅車的位子。旁邊「2」是跑車。" } ] }
    ],
    garage: [ { id:"bay", name:"修理廠的工作區", scene:"c26_garage", opt:(ph) => ({ night:ph === 1 }), details:[
      { id:"d26_tools", name:"牆上的工具", hot:[8,28,38,16], text:"每一支扳手都掛在畫好輪廓的位置上，只有一個位置是空的——在阿德手上。" } ] } ],
    bar: [ { id:"bar", name:"港灣酒吧", scene:"c26_bar", details:[
      { id:"d26_bottles", name:"酒櫃", hot:[20,14,120,30], text:"酒櫃最上層一瓶威士忌，瓶身掛著一個小牌子：「王少寄酒」。剩下三分之一。" } ] } ],
    court: [ { id:"chall", name:"羈押庭外的走廊", scene:"c26_court", details:[
      { id:"d26_courtdoor", name:"第三法庭的門", hot:[140,14,36,50], text:"門縫底下透出一道光。裡面有人在咳嗽。" } ] } ]
  };
  const PS = [["c26_cross",{ scene:true, tape:true }],["c26_traffic",{ night:true }]];
  EP26.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 行車紀錄器、監視器動畫 ---------- */
  const strip = L => { const o = Object.assign({}, L || {}); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  EP26.looks = { zijieC: strip(LOOK.zijie), liuC: strip(LOOK.liu), suC: strip(LOOK.su), hoodC: Object.assign(strip(LOOK.zijie), { back:false }) };
  // mk：把每一段的場景狀態（st）收成 opt.ds／opt.seq，讓場景自己畫車子
  const mk = (scene, opt, cam, date, beats, clean) => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join);
    return { scene, opt:Object.assign({}, opt, { ds, seq:beats.map(b => b.st || {}) }), cam, date, clean, beats:beats.map(b => { const o = Object.assign({}, b); delete o.st; return o; }) }; };
  const ANIM = {
    dash26_truck: mk("c26_cross", { night:true, noTruck:true }, "DASHCAM 停車錄影", "2027-01-19", [
      { t:"01:52:08", d:3.5, cap:"01:52:08，一台外送機車亮著燈，從海港街慢慢騎進路口。", st:{ sc:[[78,106],[84,92]], green:true } },
      { t:"01:52:12", d:2.5, join:true, cap:"01:52:12，畫面左邊，兩道車燈衝進來，沒有減速。", st:{ sc:[[84,92],[86,90]], car:[[-60,92],[30,92]], green:true } },
      { t:"01:52:13", d:1.5, join:true, cap:"01:52:13，碰。", st:{ sc:[86,90], scDown:true, car:[[30,92],[60,92]], flash:true, hit:true, green:true } },
      { t:"01:52:14", d:3.5, join:true, cap:"01:52:14，那台車沒有停，往右邊開走。煞車燈一次都沒有亮。", st:{ sc:[96,94], scDown:true, car:[[60,92],[230,92]], hit:true, green:true } }
    ]),
    dash26_taxi: mk("c26_pov", { night:true, signal:"green", cross:true }, "DASHCAM 計程車", "2027-01-19", [
      { t:"01:52:00", d:3.5, cap:"01:52:00，海港街綠燈。一台外送機車從旁邊慢慢騎過去。", st:{ scooter:[[120,96],[100,74]], speed:0 } },
      { t:"01:52:11", d:2.5, cap:"01:52:11，左邊港濱路，兩道車燈直接衝進路口——那邊是紅燈。", st:{ side:[[-50,70],[60,70]], lit:true, speed:0 } },
      { t:"01:52:12", d:3, join:true, cap:"01:52:12，車牌在路燈下閃過：BKV-80……後面看不清楚。", st:{ side:[[60,70],[220,70]], lit:true, plate:true, plateTxt:"BKV-80", speed:0 } }
    ]),
    dash26_nurse: mk("c26_pov", { night:true }, "DASHCAM 簡依婷", "2027-01-19", [
      { t:"01:49:30", d:4, cap:"01:49:30，前面的黑色休旅車在兩個車道之間蛇行。", st:{ rear:[[80,80,1.6],[112,80,1.6]] } },
      { t:"01:49:40", d:3, join:true, cap:"它又壓過分隔線，晃回來。", st:{ rear:[[112,80,1.6],[84,80,1.6]] } },
      { t:"01:50:10", d:4, cap:"01:50:10，路燈從後擋風玻璃照進去：只有駕駛座一個人影，頭頂幾乎碰到車頂。", st:{ rear:[96,84,2], lit:true } },
      { t:"01:51:58", d:3.5, cap:"01:51:58，它突然加速，越開越遠。", st:{ rear:[[96,82,1.8],[96,50,0.3]], brake:false, speed:2 } }
    ]),
    dash26_ramp: mk("c26_pov", { night:true, truckCab:true, wet:false }, "DASHCAM 聯結車", "2027-01-19", [
      { t:"01:52:30", d:3, cap:"01:52:30，一台黑色休旅車從港濱路衝上匝道，右前大燈不亮。", st:{ side:[[-50,84],[70,84]], broken:true, speed:0 } },
      { t:"01:52:31", d:3.5, join:true, cap:"車頭燈正好照進它的車窗：副駕駛座是空的，後座也沒有人。右邊後照鏡只剩支架。", st:{ side:[[70,84],[90,84]], broken:true, lit:true, speed:0 } },
      { t:"01:52:33", d:2.5, join:true, cap:"它開上聯絡道，不見了。", st:{ side:[[90,84],[230,84]], broken:true, speed:0 } }
    ]),
    dash26_he: mk("c26_pov", { night:true, wet:false }, "CAMERA 何沛恩", "2027-01-19", [
      { t:"01:52:20", d:3, cap:"01:52:20，一台黑色休旅車從路口方向衝過來，右邊的後照鏡吊在車門上晃。", st:{ side:[[-50,84],[70,84]], broken:true, speed:0 } },
      { t:"01:52:21", d:3.5, join:true, cap:"經過路燈下面：車內只有駕駛座一個戴帽 T 帽子的人影。", st:{ side:[[70,84],[96,84]], broken:true, lit:true, speed:0 } },
      { t:"01:52:23", d:2.5, join:true, cap:"它開上聯絡道。", st:{ side:[[96,84],[230,84]], broken:true, speed:0 } }
    ]),
    dash26_bar: mk("c26_street", {}, "DASHCAM 停車錄影", "2027-01-19", [
      { t:"01:35:50", d:4, cap:"01:35:50，酒吧的門開了，一個穿帽 T 的年輕男人走出來，很高，手上甩著一串鑰匙。", m:{ zijieC:[90,98,"walk1+carry@key",1,36,98] } },
      { t:"01:36:05", d:3.5, join:true, cap:"01:36:05，他走到黑色休旅車旁邊，扶著車門站了一下。", m:{ zijieC:[146,98,"door",1,90,98] } },
      { t:"01:36:12", d:3, join:true, cap:"01:36:12，他自己打開駕駛座的門，坐進去。沒有別人上車。", m:{ zijieC:[150,96,"stand",1] }, out:["zijieC"] },
      { t:"01:36:40", d:4, cap:"01:36:40，車燈亮了，車子開走。沒有代駕。", st:{ car:[[118,98],[230,98]], drv:true } }
    ]),
    dash26_hill: mk("c26_hill", {}, "DASHCAM 停車錄影", "2027-01-19", [
      { t:"02:16:40", d:4, cap:"02:16:40，一台黑色休旅車開上坡，右前大燈不亮，右邊後照鏡吊著。", st:{ car:[[-50,96],[110,96]], drv:true } },
      { t:"02:16:52", d:3, cap:"02:16:52，車開進王家大門。", st:{ car:[[110,96],[124,92]], drv:true, gateOpen:true } },
      { t:"02:17:30", d:4.5, cap:"02:17:30，駕駛座的門打開，下來一個人：很高，穿帽 T，扶了一下車頂才站穩。其他車門都沒有開。", st:{ car:[124,92], gateOpen:true }, m:{ zijieC:[150,92,"door",1,138,92] } },
      { t:"02:17:40", d:3.5, join:true, cap:"他一個人，歪歪地走進屋裡。", st:{ car:[124,92], gateOpen:true }, m:{ zijieC:[176,84,"walk1",1,150,92] }, out:["zijieC"] }
    ]),
    cam26_lin: mk("c26_cross", { night:true, noTruck:true }, "林記 門口", "2027-01-19", [
      { t:"01:52:12", d:2.5, cap:"01:52:12，店門口，一小角馬路。", st:{} },
      { t:"01:52:13", d:1.5, join:true, cap:"01:52:13，畫面右邊一道白光，整個畫面閃了一下。", st:{ flash:true } },
      { t:"01:52:14", d:4, join:true, cap:"01:52:14，「碰」。沒有煞車的聲音。只有引擎聲越來越遠。", st:{ car:[[80,92],[230,92]], hit:true } }
    ])
  };
  [...EP26.cctv, ...EP26.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案：重現 ---------- */
  // 重現：每一段可以有自己的場景狀態 st（車子、機車），全部收進每一段的 opt（重現的時間是從頭算的）
  const mkR = beats => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join); const seq = beats.map(b => b.st || {});
    return beats.map(b => { const o = Object.assign({}, b, { opt:Object.assign({}, b.opt || {}, { ds, seq }) }); delete o.st; return o; }); };
  const RB = mkR([
    { t:"01/18 23:05", d:5, cap:"1 月 18 日 23:05，港灣酒吧。王子傑一個人靠在吧台最裡面喝酒。六杯威士忌，兩杯 shot。", scene:"c26_bar", opt:{}, m:{ zijieC:[36,92,"drink",1] }, out:["zijieC"] },
    { t:"01:36:05", d:5, cap:"01:36，他一個人走出酒吧，打開黑色休旅車的駕駛座。沒有代駕。", scene:"c26_street", opt:{}, m:{ zijieC:[146,98,"door",1,36,98] }, out:["zijieC"] },
    { t:"01:52:12", d:4, cap:"01:52，港濱路紅燈。他沒有煞車。", scene:"c26_cross", opt:{ night:true, noTruck:true }, st:{ sc:[[80,104],[86,90]], car:[[-60,92],[40,92]] }, m:{} },
    { t:"01:52:14", d:3.5, join:true, cap:"陳俊宏被撞飛到路口中央。車子往聯絡道開走。", scene:"c26_cross", opt:{ night:true, noTruck:true }, st:{ sc:[96,94], scDown:true, car:[[40,92],[230,92]], hit:true }, m:{} },
    { t:"02:17:30", d:5, cap:"02:17，他把車開回王家車庫，一個人從駕駛座下來，走進屋裡。", scene:"c26_hill", opt:{ gateOpen:true }, st:{ car:[124,92] }, m:{ zijieC:[176,84,"walk1",1,138,92] }, out:["zijieC"] },
    { t:"08:10:00", d:5, cap:"08:10，蘇律師的事務所叫來的拖吊車，把車從車庫直接吊走。沒有人坐進駕駛座。", scene:"c26_hill", opt:{ night:false, gateOpen:true }, st:{ tow:[[150,96],[260,96]] }, m:{} },
    { t:"14:00:00", d:5, cap:"14:00，老劉穿著燙平的司機制服，走進交通隊。「車是我開的。」", scene:"c26_traffic", opt:{}, m:{ liuC:[100,94,"stand",-1,180,94], suC:[132,94,"stand",-1,200,94] } }
  ]);
  EP26.court = {
    title: "地方法院・羈押庭外・1 月 19 日 23:30", scene: "c26_court", opt:{},
    who: ph => ["liu","zijie","wangdong","su","aqi"],
    open: ph => "23:30，羈押庭剛結束。老劉坐在長椅上，手銬還沒解開。王董和王子傑站在走廊另一頭，蘇律師在講電話。阿凱被叫來做筆錄，站在窗邊，左手還包著紗布。",
    kindLine: {
      hitrun: "1 月 19 日 01:52，有人開著那台黑色休旅車，在港濱路闖紅燈撞了陳俊宏，沒有停下來。",
      pushed: "陳俊宏不是自己騎進車子前面的。有人故意把他推了出去。"
    },
    kindTrue: "",
    murmur: [ "（蘇律師掛掉電話，把手機放進西裝口袋。）", "（王子傑的腳一直在抖。）", "（老劉看著自己的手銬。）" ],
    confess: { zijie: [ "……是我。", "我喝了酒。我以為是一個紙箱。", "劉叔說他願意的。我爸說……這樣對大家都好。" ] },
    cornered: { zijie: "我要等蘇律師！我什麼都不會說！" },
    deny: {
      liu: "是我！是我開的！你不要再問了！",
      wangdong: "我兒子那天晚上在家，我可以作證。",
      su: "沈警官，我只是一個辯護人。",
      aqi: "我整晚都在急診！護士都看到了！"
    },
    replayText: "1 月 18 日 23:05，港灣酒吧——",
    replay: { scene:"c26_bar", opt:{}, clean:true, cam:"經過重現", date:"2027-01-18", beats:RB },
    endGood: "23:40，葉晴在羈押庭外重新寫了一份聲請書：「被告王子傑，酒後駕車致人於死、肇事逃逸。劉福來，頂替。」\n老劉被帶走以前，回頭跟你說了一句：「我孫子的手術……」\n葉晴說：「我會幫他申請社福補助。不是王家的錢。」\n阿德修理廠的那台車，沒有烤漆。",
    endBad: "報告上寫的是你的結論。\n第二天中午，阿德修理廠那台黑色休旅車烤好了漆，亮得像新的一樣。\n港濱路口的速限牌下面，多了一束新的花。"
  };

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP26.outScenes = ["c26_cross"];
  EP26.fac = { junction:["#8a8a84","#2a4a6a"], traffic:["#cfcabb","#3f5a7a"], hospital:["#eef0ee","#2f7a6a"], lab:["#e2e8e8","#3a7a8a"], wang:["#e8dcc4","#5a4a3a"], garage:["#7a7a72","#c8a838"], bar:["#2a2026","#ff9a3a"], court:["#d8d4c8","#3a3a3a"] };
  EP26.setting = { junction:"city", traffic:"city", hospital:"city", lab:"city", wang:"villa", garage:"town", bar:"city", court:"city" };
  // 白天：陰天、東北風；晚上：晴、冷
  const SKY26 = [ ["#7a8696","#b8c0c8","#4a5a50","#5a6a5a",0,0], ["#0b0f1c","#27324a","#18241f","#1d2c25",0,1] ];
  EP26.worldSky = ph => SKY26[Math.min(ph || 0, SKY26.length - 1)];
  EP26.roomDesc = {
    cross:"港濱路口。封鎖線在風裡啪啪作響。", lshop:"林記釣具。鐵門只拉起一半。", tdesk:"交通隊辦公室。桌上一排記憶卡。",
    er:"澄港醫院的急診。消毒水的味道。", fam:"急診旁邊的家屬休息區。", lab26:"鑑識中心。",
    hall:"王家的玄關和客廳。地板亮得照得出人影。", carport:"王家的車庫，可以停四台車。", bay:"阿德汽車修理廠的工作區。機油的味道。",
    bar:"港灣酒吧。燈很暗，音樂很小聲。", chall:"地方法院，羈押庭外的走廊。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  EP26.world = {};
  EP26.locations.forEach(l => { EP26.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP26.world.junction, {
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長……機車還在這裡。外送箱裡的粥，蓋子都沒打開。", "小吳"),
      say("you", "行車紀錄器呢？", "你"),
      say("wu", "交通隊在一台一台找。路邊那台貨車的老闆答應給，計程車那台已經送到交通隊了。", "小吳"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下。", "小吳")
    ]
  });
  EP26.mapPos = { junction:[120,92,"d"], traffic:[150,40,"r"], hospital:[190,70,"r"], lab:[200,40,"u"], wang:[40,24,"u"], garage:[90,104,"d"], bar:[70,70,"l"], court:[180,20,"u"] };
  EP26.mapRoads = [["junction","traffic"],["junction","hospital"],["junction","garage"],["junction","bar"],["traffic","lab"],["traffic","court"],["traffic","wang"],["bar","wang"],["hospital","court"]];
  EP26.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    R(0, 0, 70, 50, "#4a6a4a"); dither(0, 0, 70, 50, "#3a5a3a", 2);   // 山
    for (let x = 80; x < 230; x += 8) for (let y = 14; y < 100; y += 7) if ((x + y * 3) % 7) R(x, y, 6, 5, "#c8c0b0");
    R(0, 112, 240, 23, "#3a6a8a"); R(0, 96, 240, 3, "#7a7a72"); R(118, 40, 3, 72, "#7a7a72");   // 海、港濱路、海港街
    R(160, 84, 80, 4, "#6a6a62");   // 港區聯絡道
  };
})();
