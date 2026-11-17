/* =========================================================
   第 31 集：場景、人物造型、監視器畫面、結案、走動畫面、地圖、開場
   指揮所、冰店、後巷沿用第 30 集的場景（SC.c30_*），在上面加今晚的變化
   ========================================================= */
EP31.art = true;
(() => {
  const PR = PX.prim, { R, P } = PR;
  const W = 192, H = 108;
  const SC = PX.SCENES;
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i, p] = beatAt(o.t || 0, o.ds); return Object.assign({ _p:p }, (o.seq || [])[i] || {}); };
  const tw = (o, k, def) => o[k + "0"] !== undefined ? o[k + "0"] + (o[k + "1"] - o[k + "0"]) * (o._p || 0) : (typeof o[k] === "number" ? o[k] : def);
  const PINK = "#e86a8a";
  // 晚上的戶外場景：走動畫面會再把整張圖染暗 45%，所以在走動畫面裡（o.world）先把顏色調亮；監視器、重現不染色，直接畫
  const mkC = on => c => { if (!on || typeof c !== "string" || c[0] !== "#" || c.length < 7) return c; const T = [11, 15, 28];
    return "#" + [1, 3, 5].map((i, k) => Math.max(0, Math.min(255, Math.round((parseInt(c.slice(i, i + 2), 16) - 0.45 * T[k]) / 0.55))).toString(16).padStart(2, "0")).join("") + c.slice(7); };
  // 每個戶外場景自己的畫筆（顏色先調過）
  const pen = o => { const K = mkC(!!o.world), r = (x, y, w, h, c) => PR.R(x, y, w, h, K(c)), p = (x, y, c) => PR.P(x, y, K(c));
    return { K, R:r, P:p,
      txt: (s, x, y, c, f) => { const g = PR.g(); g.font = f || "8px sans-serif"; g.fillStyle = K(c); g.fillText(s, x, y); },
      glow: (x, y, rr, rgb, a) => { if (o.world) return; for (let k = rr; k > 0; k -= 2){ const al = Math.round(a * (1 - k / rr) * 255).toString(16).padStart(2, "0"); PR.R(x - k, y - k * 0.7, k * 2, k * 1.4, K(rgb) + al); } },
      wheel: (cx, cy, rad, c) => { for (let dy = -rad; dy <= rad; dy++){ const w = Math.round(Math.sqrt(rad * rad - dy * dy)); r(cx - w, cy + dy, w * 2, 1, c); } } }; };
  const glow0 = (x, y, r, rgb, a) => { for (let k = r; k > 0; k -= 2){ const al = Math.round(a * (1 - k / r) * 255).toString(16).padStart(2, "0"); R(x - k, y - k * 0.7, k * 2, k * 1.4, rgb + al); } };
  // 冰店的小貨車：後面是白色的冷凍櫃。dir＝1 車頭朝右，-1 朝左；y＝輪子的底
  const truck = (B, x, y, dir) => { const bx = dir > 0 ? x : x + 14, cx = dir > 0 ? x + 34 : x;
    B.R(bx - 1, y - 29, 36, 26, "#7c8288"); B.R(bx, y - 28, 34, 24, "#f0f0ec"); B.R(bx, y - 28, 34, 2, "#c8ccd0"); B.R(bx, y - 17, 34, 3, PINK); B.R(dir > 0 ? bx : bx + 32, y - 27, 2, 22, "#b0b4b8"); B.R(dir > 0 ? bx + 1 : bx + 30, y - 14, 3, 1, "#6a6e72");
    B.R(cx - 1, y - 21, 16, 17, "#7c8288"); B.R(cx, y - 20, 14, 16, "#e4e8ec"); B.R(dir > 0 ? cx + 5 : cx + 2, y - 18, 7, 7, "#22303e"); B.P(dir > 0 ? cx + 13 : cx, y - 9, "#f8e8a0"); B.R(x, y - 6, 48, 2, "#4a4e52");
    B.wheel(cx + 7, y - 3, 3, "#141416"); B.wheel(dir > 0 ? bx + 6 : bx + 28, y - 3, 3, "#141416"); B.wheel(dir > 0 ? bx + 11 : bx + 23, y - 3, 3, "#141416"); };
  // 橘色的大魚桶（上面蓋著碎冰）；cart＝放在推車上
  const tub = (B, x, y, cart) => { if (cart){ B.R(x - 2, y - 2, 17, 2, "#4a4e52"); B.P(x, y, "#1a1a1a"); B.P(x + 12, y, "#1a1a1a"); B.R(x + 15, y - 15, 1, 14, "#6a6e72"); y -= 2; }
    B.R(x, y - 11, 13, 11, "#e8782a"); B.R(x, y - 11, 13, 1, "#f49a4a"); B.R(x + 1, y - 5, 11, 1, "#c8621e"); B.R(x - 1, y - 13, 15, 2, "#f4f8fc"); B.P(x + 3, y - 14, "#ffffff"); B.P(x + 9, y - 14, "#ffffff"); };

  /* ---------- 舊漁會倉庫：裡面 ---------- */
  SC.c31_cold = (o) => { o = Object.assign({}, o, stOf(o)); const t = o.t || 0, then = !!o.then;
    const B = { R, P };
    // 保溫板的牆、天花板上的舊冷風機
    R(0, 0, W, 86, then ? "#6a747c" : "#7e8890"); for (let x = 0; x < W; x += 16) R(x, 0, 1, 86, then ? "#5c666e" : "#6c767e"); R(0, 0, W, 6, "#4e585e"); R(0, 60, W, 26, then ? "#606a72" : "#727c84"); R(0, 59, W, 1, "#5a646c");
    R(58, 6, 54, 10, "#98a2aa"); for (let k = 0; k < 3; k++){ R(62 + k * 17, 8, 12, 6, "#56606a"); R(64 + k * 17, 9, 8, 4, "#343e46"); R(67 + k * 17, 9, 1, 4, "#6a747c"); } R(0, 18, 58, 2, "#8a949c"); R(112, 18, 44, 2, "#8a949c");
    // 椅子正上方的燈泡
    R(92, 16, 1, 8, "#2a2a2e"); R(90, 24, 5, 5, then ? "#fff4b0" : "#c8c8b8"); if (then) glow0(92, 30, 30, "#fff0a0", 0.16);
    // 側門（左邊）：開著，外面是巷子
    R(2, 28, 28, 58, "#56606a"); R(5, 31, 22, 55, then ? "#3e2e22" : "#0c1220"); if (!then){ R(5, 31, 5, 55, "#4a3a2a"); P(8, 60, "#c8c8c8"); P(18, 40, "#a8acc0"); P(23, 52, "#a8acc0"); } else P(24, 60, "#c8c8c8");
    // 和冰店共用的那一道牆：管線
    R(34, 20, 2, 66, "#8a949c"); R(38, 20, 2, 66, "#9aa4ac"); R(33, 44, 8, 2, "#5a646c");
    // 地板
    R(0, 86, W, 22, "#5e666c"); for (let x = 12; x < W; x += 24) R(x, 86, 1, 22, "#545c62"); R(0, 86, W, 1, "#4a5258");
    // 鑑識的工作燈（今晚）
    if (!then){ R(46, 50, 1, 36, "#2a2a2e"); R(42, 84, 9, 2, "#2a2a2e"); R(42, 43, 9, 7, "#fff4c0"); R(41, 42, 11, 1, "#3a3a3e"); glow0(46, 50, 34, "#fff4c0", 0.16); }
    // 椅子：扶手和椅腳上有割開的膠帶；椅墊和椅背中間有一道縫
    R(86, 56, 14, 12, "#8a8e94"); R(87, 57, 12, 10, "#6e7278"); R(84, 64, 2, 9, "#8a8e94"); R(100, 64, 2, 9, "#8a8e94"); R(85, 72, 16, 3, "#343842"); R(86, 75, 2, 11, "#8a8e94"); R(98, 75, 2, 11, "#8a8e94");
    if (!then){ R(84, 67, 2, 2, "#dadee2"); R(100, 67, 2, 2, "#dadee2"); R(86, 80, 2, 2, "#dadee2"); R(98, 80, 2, 2, "#dadee2"); if (Math.floor(t * 2) % 3 === 0) P(93, 70, "#ffffff"); else P(93, 70, "#b8c0d0"); }
    // 便當盒、水
    R(71, 83, 5, 3, "#f0ecd8"); R(77, 83, 5, 3, "#f0ecd8"); R(77, 82, 5, 1, "#8a6a42"); R(73, 79, 2, 4, "#a8d0e8"); P(73, 78, "#3a6aa8");
    // 電暖器
    R(115, 71, 12, 15, "#d4d4cc"); R(117, 73, 8, 9, "#2e2e30"); for (let k = 0; k < 3; k++) R(118, 74 + k * 3, 6, 1, then ? "#f8782a" : "#7a4a3a"); R(116, 86, 2, 1, "#3a3a3a"); R(124, 86, 2, 1, "#3a3a3a"); if (then) glow0(121, 78, 14, "#f88a3a", 0.18); else { R(129, 84, 4, 2, "#e8e8e0"); }
    // 木箱、當菸灰缸的罐子
    R(130, 72, 20, 14, "#8a6a42"); R(130, 72, 20, 1, "#a88a5a"); R(130, 79, 20, 1, "#6a5032"); R(139, 72, 1, 14, "#6a5032"); R(134, 66, 5, 6, "#a83a2a"); R(134, 66, 5, 1, "#d8d8d8"); R(141, 67, 3, 5, "#d8c040"); R(145, 67, 3, 5, "#3a6aa8");
    // 大鐵捲門的裡面：從裡面拴著
    const g = o.gust || Math.floor(t * 0.9) % 4 === 0 ? 1 : 0;
    R(154, 20, 38, 2, "#4a545a"); R(156, 22, 34, 64, "#687078"); for (let y = 24; y < 86; y += 4) R(156, y + (g && (y % 8 === 0) ? 1 : 0), 34, 1, "#58606a"); R(156, 80, 34, 2, "#34383c"); R(170, 82, 3, 5, "#34383c");
    if (!then){
      // 地上的水（碎冰化的）：椅子旁邊一個圓圈，一路到側門；門口兩條細細的輪痕；割下來的膠帶；證物的號碼牌
      R(70, 90, 12, 1, "#9ac0d8"); R(69, 91, 1, 2, "#9ac0d8"); R(82, 91, 1, 2, "#9ac0d8"); R(70, 93, 12, 1, "#9ac0d8");
      R(58, 92, 8, 1, "#8ab4cc"); R(46, 91, 7, 1, "#8ab4cc"); R(34, 92, 8, 1, "#8ab4cc"); R(30, 91, 3, 1, "#8ab4cc"); P(61, 91, "#f4f8fc"); P(49, 92, "#f4f8fc"); P(37, 91, "#f4f8fc"); P(74, 92, "#f4f8fc"); P(79, 91, "#f4f8fc");
      R(8, 90, 20, 1, "#3a4248"); R(8, 95, 20, 1, "#3a4248"); R(4, 86, 24, 2, "#a8acb0"); R(14, 87, 6, 1, "#8a8e92");
      R(101, 88, 5, 1, "#d4d8dc"); R(107, 87, 5, 1, "#d4d8dc"); R(104, 90, 7, 1, "#c4c8cc"); P(105, 90, "#e8d8f0");
      R(64, 96, 3, 3, "#f8d040"); R(112, 92, 3, 3, "#f8d040"); R(22, 99, 3, 3, "#f8d040");
    }
    // 重現：推車和魚桶
    const cx = tw(o, "tubx", null); if (cx !== null) tub(B, cx, 96, true);
  };

  /* ---------- 後巷：側門被撞開了 ---------- */
  SC.c31_alley = (o) => { o = Object.assign({}, o, stOf(o)); SC.c30_alley(o); const B = pen(o);
    if (!o.before){
      B.R(86, 44, 14, 42, "#0c1016"); B.R(98, 44, 4, 42, "#5a4030"); B.R(84, 42, 18, 2, "#3a2e24");
      for (let k = 0; k < 7; k++) B.R(80 + k * 4, 58 + (k % 2), 4, 2, k % 2 ? "#1a1a1a" : "#f8d030");
      B.R(88, 88, 3, 2, "#e0e4ea"); B.P(90, 87, "#a8acb0");
      B.R(104, 78, 16, 8, "#3a4048"); PR.dither(104, 78, 16, 8, B.K("#343a42"), 3); B.R(104, 84, 16, 2, "#1e2226");
      B.R(58, 51, 6, 2, "#3a4a44"); B.P(65, 52, "#c8d0d4"); B.R(119, 29, 14, 1, "#0e0e12");
      B.R(40, 94, 46, 1, "#22262a"); B.R(40, 98, 46, 1, "#22262a"); B.R(52, 100, 6, 2, "#1e2226"); B.R(44, 91, 6, 2, "#1e2226");
    }
    const cx = tw(o, "cartx", null); if (cx !== null) tub(B, cx, 96, true);
  };

  /* ---------- 冰店：店裡（放大魚桶的地方空了；天亮以前，阿珠的手機立在櫃台上） ---------- */
  SC.c31_ice = (o) => { o = Object.assign({}, o, stOf(o)); SC.c30_ice(Object.assign({}, o, { phase:2 }));
    R(138, 88, 12, 1, "#9ab8c8"); R(137, 89, 1, 3, "#9ab8c8"); R(150, 89, 1, 3, "#9ab8c8"); R(138, 92, 12, 1, "#9ab8c8");
    R(140, 40, 8, 9, "#f4f0d0"); R(141, 42, 6, 1, "#8a6a4a"); R(141, 44, 5, 1, "#8a8a8a"); R(141, 46, 6, 1, "#8a8a8a");
    if (o.gps){ R(30, 55, 5, 7, "#1a1a1e"); R(31, 56, 3, 5, "#9ad0f0"); P(32, 58, "#e84a4a"); }
  };

  /* ---------- 冰店門口（天亮以前，小貨車停在海龍漁業前面） ---------- */
  SC.c31_front = (o) => { o = Object.assign({}, o, stOf(o)); SC.c30_front(o);
    if (o.truck){ const B = pen(o); truck(B, 96, 86, 1); B.R(98, 62, 26, 1, "#d8dce0"); for (let k = 0; k < 3; k++){ B.P(100 + k * 9, 84, "#9ab8c8"); } }
  };

  /* ---------- 3 號碼頭 ---------- */
  SC.c31_pier3 = (o) => { o = Object.assign({}, o, stOf(o)); const t = o.t || 0, B = pen(o), r = B.R, p = B.P;
    r(0, 0, W, 48, "#0a1020"); for (let k = 0; k < 18; k++) p((k * 41 + 7) % W, (k * 13) % 34, "#b8bcd0"); r(0, 40, W, 8, "#121a2c");
    // 海、遠處的防波堤和燈；對面是魚市後面的碼頭
    r(0, 46, W, 2, "#1c2432"); p(8, 44, Math.floor(t) % 2 ? "#e83a3a" : "#5a1a1a"); r(0, 48, W, 34, "#0e1c2c"); for (let k = 0; k < 8; k++) r((k * 37 + Math.floor(t * 2) * 3) % W, 52 + k * 4, 6, 1, "#22405c");
    r(158, 43, 32, 3, "#222a36"); p(164, 41, "#f8e8a0"); p(170, 40, "#f8e8a0"); p(180, 41, "#fff4c0"); p(186, 40, "#f8e8a0"); r(164, 49, 1, 3, "#5a5a3a"); r(180, 49, 1, 4, "#6a6a4a");
    // 夜釣船「順興六號」
    r(92, 62, 46, 20, "#8a929a"); r(92, 68, 46, 2, "#3a5a7a"); r(136, 62, 4, 12, "#8a929a"); r(104, 50, 20, 12, "#a4acb4"); r(102, 48, 24, 3, "#4a5a6a"); r(107, 53, 14, 6, "#141a22"); r(126, 58, 10, 4, "#2e4a3c"); r(114, 38, 1, 10, "#7a828a");
    B.txt("順興六號", 97, 79, "#1e3048");
    // 碼頭的邊、地面
    r(0, 80, W, 6, "#6a6e72"); r(0, 80, W, 1, "#8a8e92"); r(0, 86, W, 22, "#484c52"); for (let x = 10; x < W; x += 30) r(x, 86, 1, 22, "#3e4248");
    // 貨櫃屋：窗戶亮著，窗簾拉了一半；門上的鎖生鏽了
    r(6, 36, 46, 50, "#2a4a7a"); for (let x = 9; x < 52; x += 4) r(x, 38, 1, 46, "#244068"); r(6, 36, 46, 2, "#1e3458"); r(29, 45, 16, 14, "#1a2c48"); r(30, 46, 14, 12, "#f8e8a0"); r(30, 46, 7, 12, "#c8b070"); B.glow(37, 52, 18, "#f8e8a0", 0.14);
    r(10, 50, 14, 36, "#223c62"); r(10, 50, 14, 1, "#1a2e4c"); r(21, 67, 3, 3, "#a85a2a"); p(22, 68, "#5a2a12");
    // 木箱和平板
    r(53, 74, 10, 12, "#8a6a42"); r(53, 79, 10, 1, "#6a5032"); r(54, 70, 8, 4, "#1a1a1e"); r(55, 71, 6, 2, "#9ad0f0");
    // 燈桿（燈沒有亮）和上面的黑色盒子
    r(65, 6, 2, 80, "#5a5e62"); r(60, 4, 12, 3, "#4a4e52"); r(62, 26, 6, 5, "#141418"); r(68, 27, 2, 3, "#3a3a40"); p(64, 25, "#f4f4f0"); p(64, 31, "#f4f4f0"); p(63, 30, Math.floor(t * 2) % 2 ? "#e83030" : "#5a1414");
    // 繫纜樁：最外面的那一根上有粉筆記號，旁邊是打開的工具箱
    [82, 116].forEach(x => { r(x, 80, 6, 6, "#2a2a2e"); r(x - 1, 79, 8, 2, "#3a3a3e"); });
    r(150, 78, 7, 8, "#2a2a2e"); r(149, 77, 9, 2, "#3a3a3e"); p(152, 80, "#f4f4f0"); p(154, 82, "#f4f4f0"); p(153, 81, "#f4f4f0"); p(154, 80, "#f4f4f0"); p(152, 82, "#f4f4f0");
    r(159, 81, 7, 5, "#3a6a9a"); r(159, 78, 7, 1, "#4a7aaa"); r(159, 79, 1, 2, "#4a7aaa"); r(160, 82, 5, 3, "#141a22");
    // 一疊魚箱
    r(170, 62, 18, 24, "#3a6a8a"); for (let y = 68; y < 86; y += 6) r(170, y, 18, 1, "#2a5270"); r(178, 62, 1, 24, "#2a5270");
  };

  /* ---------- 7 號碼頭 ---------- */
  SC.c31_pier7 = (o) => { o = Object.assign({}, o, stOf(o)); const t = o.t || 0, dawn = !!o.dawn, B = pen(o), r = B.R, p = B.P;
    if (dawn){ r(0, 0, W, 26, "#3c4c70"); r(0, 26, W, 10, "#7a7890"); r(0, 36, W, 6, "#c89a88"); r(0, 42, W, 6, "#f0b880"); }
    else { r(0, 0, W, 48, "#0a1020"); for (let k = 0; k < 16; k++) p((k * 47 + 11) % W, (k * 11) % 32, "#b8bcd0"); r(0, 40, W, 8, "#121a2c"); }
    r(0, 46, W, 2, dawn ? "#4a5262" : "#1c2432"); p(188, 44, Math.floor(t) % 2 ? "#3ae86a" : "#1a5a2a");
    r(0, 48, W, 34, dawn ? "#3a5a7a" : "#0e1c2c"); for (let k = 0; k < 8; k++) r((k * 37 + Math.floor(t * 2) * 3) % W, 52 + k * 4, 6, 1, dawn ? "#7a9ab8" : "#22405c");
    if (o.splash){ const s = Math.floor(t * 6) % 3, sx = o.splash === true ? 121 : o.splash; r(sx, 74 - s, 2, 4 + s, "#e8f4ff"); r(sx - 3, 76, 8, 1, "#e8f4ff"); p(sx - 4, 73 - s, "#e8f4ff"); p(sx + 4, 72 - s, "#e8f4ff"); }
    // 滿福 12 號：甲板的燈全開，冰艙的蓋子掀著
    r(128, 60, 62, 22, "#2e6a4e"); r(128, 66, 62, 2, "#e8e8e0"); r(162, 29, 22, 31, "#e8e4d0"); r(160, 26, 26, 3, "#8a3a2a"); r(164, 33, 18, 11, "#6a6458"); r(165, 34, 16, 9, "#f8e8a0"); r(173, 34, 1, 9, "#6a6458"); r(162, 50, 22, 1, "#c8c4b0"); r(150, 32, 1, 28, "#8a8e92"); r(147, 31, 7, 2, "#fff8d0"); B.glow(150, 40, 24, "#fff4c0", 0.16);
    r(134, 48, 2, 12, "#8a9096"); r(137, 57, 12, 3, "#f4f8fc"); r(152, 54, 6, 6, "#f8f8f8"); r(153, 48, 6, 6, "#f0f0f0"); r(152, 54, 6, 1, "#c8c8c8"); B.txt("滿福12號", 131, 79, "#e8e8e0");
    // 海順 3 號：駕駛艙的窗簾拉著，冰艙上了鎖
    r(60, 62, 60, 20, "#dfe4ea"); r(118, 62, 4, 14, "#dfe4ea"); r(122, 62, 2, 8, "#dfe4ea"); r(60, 68, 64, 2, "#2a5a9a"); r(60, 60, 34, 1, "#9aa0a6"); for (let x = 61; x < 94; x += 8) r(x, 57, 1, 4, "#9aa0a6");
    r(94, 28, 24, 34, "#e8ecf0"); r(92, 25, 28, 3, "#2a5a9a"); r(97, 32, 18, 10, "#4a3e36"); r(105, 32, 1, 10, "#14181e"); p(105, 37, o.raid || o.open ? "#14181e" : (Math.floor(t * 1.5) % 3 ? "#e84a2a" : "#7a2a1a")); r(94, 50, 24, 1, "#c4cad0"); r(107, 10, 1, 15, "#9aa0a6"); r(104, 14, 7, 1, "#9aa0a6");
    B.txt("海順3號", 61, 79, "#1e3a6a");
    if (o.open){ r(70, 57, 16, 5, "#aab0b6"); r(71, 58, 14, 3, "#0a0a0e"); r(68, 45, 2, 13, "#8a9096"); }
    else { r(70, 57, 16, 5, "#aab0b6"); r(69, 55, 18, 2, "#8a9096"); if (o.lock !== false){ r(77, 58, 3, 3, "#f0f4f8"); p(78, 57, "#c8ccd0"); if (Math.floor(t * 2) % 3 === 0 || o.flash) p(79, 58, "#ffffff"); } }
    p(59, 74 + Math.floor(t * 4) % 4, "#9ac0e0"); p(59, 72, "#9ac0e0");
    // 碼頭的邊、跳板、地面
    r(0, 80, W, 6, "#6a6e72"); r(0, 80, W, 1, "#8a8e92"); r(94, 76, 12, 5, "#8a6a42"); r(94, 76, 12, 1, "#a88a5a"); r(94, 78, 12, 1, "#74562f"); r(94, 80, 12, 1, "#74562f"); r(0, 86, W, 22, "#4a4e54"); for (let x = 16; x < W; x += 30) r(x, 86, 1, 22, "#40444a");
    [66, 114, 134, 182].forEach(x => { r(x, 80, 5, 6, "#2a2a2e"); r(x - 1, 79, 7, 2, "#3a3a3e"); }); p(65, 76, "#c8b888"); p(64, 72, "#c8b888"); p(63, 68, "#c8b888"); p(115, 76, "#c8b888"); p(116, 72, "#c8b888");
    // 船尾旁邊的兩個空油桶
    r(72, 86, 4, 7, "#b8402e"); r(73, 85, 2, 1, "#2a2a2e"); r(77, 86, 4, 7, "#b8402e"); p(78, 85, "#d8d8d0"); r(72, 88, 9, 1, "#8a2c20"); r(73, 93, 9, 1, "#33373d");
    // 安檢所：窗口亮著，登記簿攤在窗台上
    r(4, 30, 38, 56, "#d8dce0"); r(4, 30, 38, 10, "#2a5a9a"); B.txt("安檢所", 11, 38, "#ffffff", "bold 8px sans-serif"); r(9, 43, 24, 16, "#8a9aa8"); r(10, 44, 22, 14, "#f8f0c0"); r(24, 46, 6, 5, "#2a3a4a"); r(25, 47, 4, 3, "#6ab0d8"); r(12, 55, 12, 3, "#f4f4f0"); r(18, 55, 1, 3, "#b8b8b0"); r(34, 50, 7, 36, "#8a9aa8"); p(35, 68, "#3a3a3a"); B.glow(21, 50, 18, "#f8f0c0", 0.12);
    // 入口的燈桿和攝影機
    r(49, 8, 2, 78, "#5a5e62"); r(43, 6, 12, 2, "#5a5e62"); r(43, 8, 6, 2, "#fff8d0"); B.glow(46, 14, 22, "#fff4c0", 0.14); r(46, 19, 7, 4, "#2a2a2e"); r(53, 20, 2, 2, "#6a6e72"); p(47, 23, Math.floor(t * 2) % 2 ? "#e83030" : "#5a1414");
    // 跳板前面的碎冰、阿珠冰店的破袋子；倒車的胎痕
    if (!o.clean){ [[93, 88], [96, 89], [99, 88], [95, 91], [98, 90], [92, 90]].forEach(([x, y]) => p(x, y, "#f4f8fc")); r(101, 88, 6, 3, "#f8e0e6"); p(103, 89, PINK); p(104, 89, PINK); r(20, 94, 40, 1, "#3a3e44"); r(20, 98, 40, 1, "#3a3e44"); }
    // 小貨車、魚桶、救護車
    if (o.truck){ truck(B, tw(o, "tx", 12), 93, -1); }
    const ux = tw(o, "tubx", null); if (ux !== null) tub(B, ux, tw(o, "tuby", 92), false);
    if (o.amb){ const f = Math.floor(t * 3) % 2; r(128, 72, 46, 24, "#f4f4f0"); r(128, 84, 46, 3, "#d83a3a"); r(174, 80, 12, 16, "#e8e8e4"); r(176, 82, 8, 6, "#22303e"); r(126, 72, 3, 24, "#d0d0cc"); r(131, 76, 14, 12, "#3a3e44"); r(140, 69, 5, 3, f ? "#e83a3a" : "#7a1a1a"); r(146, 69, 5, 3, f ? "#1a3a8a" : "#3a6ae8"); B.wheel(138, 97, 3, "#141416"); B.wheel(170, 97, 3, "#141416"); r(152, 76, 8, 2, "#d83a3a"); r(155, 73, 2, 8, "#d83a3a"); }
  };

  /* ---------- 人物造型 ---------- */
  const AL = id => (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null;
  const LOOK = {
    wu:    Object.assign({ skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", glasses:true, bottom:"#3a4050" }, AL("wu") || {}, { top:"#8a94a8", coat:"#3a4660", mood:"worried", hello:"學長。" }),
    zhou:  Object.assign({}, AL("zhou") || {}, { hello:"講。" }),
    kui:   Object.assign({}, AL("kui") || {}, { hello:"我在聽。" }),
    qian:  Object.assign({}, AL("qian") || {}, { hello:"還沒有天亮。" }),
    xu:    Object.assign({}, AL("xu") || {}, { hello:"不要踩到水。沿著牆走。" }),
    cai:   { skin:"#e8c8a8", hair:"#2a2220", hairStyle:"short", top:"#f4f4f0", coat:"#b8a070", bottom:"#3a3a40", hello:"沈警官。" },
    yao:   { skin:"#d8a880", hair:"#1e1e22", hairStyle:"short", top:"#2a3440", coat:"#1e262e", bottom:"#1e2228", hat:"cap", capColor:"#1e2630", hello:"現場交給你們了。我的人在巷口。" },
    zhu:   { age:"old", skin:"#d8a880", hair:"#8a8a8a", hairStyle:"bun", top:"#f4f0f4", coat:"#a85a6a", bottom:"#3a4a6a", apron:PINK, mood:"worried", hello:"警察先生……我燈都不敢關。" },
    jun:   Object.assign({ skin:"#c9a080", hair:"#2a2a2a", hairStyle:"short", top:"#e9e4da", bottom:"#2a3a5a" }, AL("ajun") || {}, { coat:"#5a6a7a", apron:PINK, mood:"smile", hello:"警察先生，早。今天還沒有燒仙草喔，還沒有煮。" }),
    gao:   { skin:"#e0b48c", hair:"#2a2220", hairStyle:"short", top:"#7a7a70", coat:"#34443a", bottom:"#2a2a30", hello:"蹲低一點。不要走到燈桿的右邊。" },
    fang:  Object.assign({ skin:"#d8a880", hair:"#2a2a2a", hairStyle:"short", top:"#e8e8e4", bottom:"#2a3040" }, AL("fang") || {}, { coat:"#2a3a54", hello:"沈警官。" }),
    rong:  { age:"old", skin:"#b88a60", hair:"#c8c8c0", hairStyle:"balding", top:"#e8e4d0", coat:"#d8b020", bottom:"#3a4a5a", hello:"少年仔，站過去一點，會擋到我搬東西。" },
    hat:   { skin:"#c89a70", hair:"#2a2220", hairStyle:"short", top:"#3a3a30", coat:"#4a4a3a", bottom:"#2a2a2a", hat:"cap", capColor:"#3a3a2a" }
  };
  const YING = Object.assign({ skin:"#ecc8a6", hair:"#2a2a2a", hairStyle:"long", bottom:"#4a5a8a", skirt:true }, AL("xiaoying") || {}, { top:"#f8f8f8", coat:"#f8f8f8" });
  const DAILY = {
    wu:   [ { room:"post", x:62, pose:"stand", doing:"站在錄音設備旁邊。手機握在手上。" }, { room:"post", x:62, pose:"stand", doing:"站在錄音設備旁邊，看著窗戶外面。" } ],
    zhou: [ { room:"post", x:26, pose:"cross", doing:"站在地圖前面，看著那一根藍色的圖釘。" }, { room:"post", x:26, pose:"cross", doing:"站在地圖前面，看了一眼牆上的鐘。" } ],
    kui:  [ { room:"post", x:50, pose:"sit+type", doing:"戴著耳機，在放 03:00 的那一通。" }, { room:"post", x:50, pose:"sit+type", doing:"戴著耳機，手指放在錄音鍵上。" } ],
    cai:  [ { room:"post", x:120, pose:"sit", doing:"坐在長桌的另一頭，看著那兩個袋子。" }, { room:"post", x:120, pose:"sit", doing:"坐在同一張椅子上。" } ],
    qian: [ { room:"post", x:180, pose:"polish@glasses", doing:"站在白板旁邊擦眼鏡。" }, { room:"post", x:180, pose:"stand", doing:"站在白板旁邊。" } ],
    xu:   [ { room:"cold", x:58, pose:"inspect", doing:"蹲在水痕旁邊，一段一段地拍照。" }, { room:"cold", x:58, pose:"write", doing:"在寫現場的紀錄。" } ],
    yao:  [ { room:"cold", x:146, pose:"stand", doing:"站在大鐵捲門前面，頭盔拿在手上。" }, { room:"cold", x:146, pose:"cross", doing:"站在大鐵捲門前面。" } ],
    zhu:  [ { room:"shop", x:54, pose:"stand", doing:"披著外套，站在櫃台旁邊。" }, { room:"shop", x:54, pose:"cup", doing:"端著一碗紅豆，眼睛一直看著門口。" } ],
    jun:  [ null, { room:"front", x:88, pose:"carry", doing:"在把一袋一袋的碎冰搬上小貨車。" } ],
    gao:  [ { room:"p3", x:30, pose:"kneel", doing:"蹲在貨櫃屋的影子裡。" }, { room:"p3", x:30, pose:"kneel", doing:"蹲在貨櫃屋的影子裡，看著手錶。" } ],
    fang: [ { room:"quay", x:36, pose:"cross", doing:"站在安檢所的門口，沒有穿制服。" }, { room:"quay", x:36, pose:"cross", doing:"站在安檢所的門口，看著海順 3 號。" } ],
    rong: [ { room:"quay", x:150, pose:"carry", doing:"抱著一個保麗龍箱，要搬上自己的船。" }, { room:"quay", x:150, pose:"carry", doing:"在整理纜繩。" } ]
  };
  EP31.suspects.forEach(s => {
    if (LOOK[s.id]){ if (LOOK[s.id].hello) s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP31.rooms = {
    police: [
      { id:"post", name:"三樓：指揮所", scene:"c30_post", opt:{ phase:2, evid:true, pin:true }, details:[
        { id:"d31_screen", name:"推車上的螢幕", hot:[158,43,14,14], text:"舊碼頭的那一支攝影機還開著。\n沒有船，沒有人。浪比昨天晚上小了。" },
        { id:"d31_doorglass", name:"門上的玻璃", hot:[6,30,12,14], text:"門上那一張「會議中」的紙，還貼著。\n這一扇門，從昨天晚上九點半到現在，都是關著的。" } ] }
    ],
    wh: [
      { id:"cold", name:"倉庫裡面", scene:"c31_cold", details:[
        { id:"d31_fans", name:"天花板上的冷風機", hot:[58,6,54,10], text:"三台冷風機，十五個月沒有轉過了。\n葉片上的灰，被下面的電暖器烘出了一條一條的紋路。" },
        { id:"d31_bulb", name:"椅子上面的燈泡", hot:[88,16,9,13], text:"一顆燈泡，吊在椅子的正上方。\n燈座是舊的。燈泡是新的。" } ] },
      { id:"alley", name:"後巷", scene:"c31_alley", opt:{ world:true }, details:[
        { id:"d31_fan", name:"冰店的抽風扇", hot:[26,40,10,10], text:"冰店後牆上的抽風扇，還在轉。\n今天吹出來的風，沒有味道：紅豆還沒有煮。" } ] }
    ],
    ice: [
      { id:"shop", name:"店裡", scene:"c31_ice", opt:(ph, has) => ({ gps:has("e31_gps") }), details:[
        { id:"d31_table", name:"客人的桌子", hot:[64,64,34,9], text:"白鐵的桌子上，放著一碗紅豆湯。\n沒有動過，已經涼了。" } ] },
      { id:"front", name:"冰店門口", scene:"c31_front", opt:(ph, has) => ({ phase:2, world:true, truck:has("e31_truck") }), details:[
        { id:"d31_upwin", name:"冰店二樓的窗戶", hot:[20,10,20,13], text:"二樓的窗戶亮著。\n從那一扇窗戶，看得到整條後巷。" },
        { id:"d31_phone", name:"公共電話", hot:[73,44,12,24], text:"那一支公共電話。\n話筒上有一層露水。" } ] }
    ],
    pier3: [
      { id:"p3", name:"3 號碼頭", scene:"c31_pier3", opt:{ world:true }, details:[
        { id:"d31_far7", name:"海的另一邊", hot:[158,36,32,12], text:"海的另一邊，是魚市後面的那一排碼頭。\n有幾點燈。這個時間亮著燈的，是準備出去的船。" },
        { id:"d31_crates", name:"一疊魚箱", hot:[170,62,18,24], text:"一疊魚箱，都是空的。\n很腥。高偵查佐說，他已經聞不到了。" } ] }
    ],
    pier7: [
      { id:"quay", name:"7 號碼頭", scene:"c31_pier7", opt:{ world:true }, details:[
        { id:"d31_sky", name:"東邊的天空", hot:[120,2,60,22], text:"東邊的天空，還是黑的。\n可是最下面的那一條線，好像比剛才淡了一點。" } ] }
    ]
  };
  EP31.phases.forEach(p => { p.scene = "c30_post"; p.sceneOpt = { phase:2, evid:true, pin:true }; });

  /* ---------- 監視器動畫 ---------- */
  const strip = L => { const o = Object.assign({}, L || {}); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  EP31.looks = { ying:YING, wuC:strip(LOOK.wu), youC:YOU, junC:Object.assign(strip(LOOK.jun), { apron:null }), hatC:strip(LOOK.hat), fangC:strip(LOOK.fang) };
  const mk = (scene, opt, cam, date, beats, clean) => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join);
    return { scene, opt:Object.assign({}, opt, { ds, seq:beats.map(b => b.st || {}) }), cam, date, clean, beats:beats.map(b => { const o = Object.assign({}, b); delete o.st; return o; }) }; };
  const F = 96, DK = 66;   // DK＝站在海順 3 號甲板上的高度
  const ANIM = {
    cctv31_gate: mk("c31_pier7", { clean:true, lock:false }, "安檢所 入口", "2027-02-27", [
      { t:"03:10:20", d:5, cap:"03:10:20，一台白色的小貨車倒車進來，停在海順 3 號的旁邊。", st:{ truck:true, tx0:-56, tx1:12 }, m:{} },
      { t:"03:12:00", d:4.5, cap:"03:12，兩個人下車。一個很年輕；另一個戴著鴨舌帽，帽簷壓得很低。", st:{ truck:true, tx:12 }, m:{ junC:[64, F, "stand", -1, 30, F], hatC:[44, F, "stand", 1, 16, F] } },
      { t:"03:14:00", d:6, cap:"03:14，兩個人從冷凍櫃裡抬出一個橘色的大魚桶。一個人抬一邊，走得很慢。", st:{ truck:true, tx:12, tubx0:62, tubx1:93, tuby:91 }, m:{ hatC:[87, F, "carry", 1, 56, F], junC:[112, F, "carry", -1, 81, F] } },
      { t:"03:20:00", d:5.5, join:true, cap:"03:22，桶子上了跳板，被抬到甲板的中間。", st:{ truck:true, tx:12, tubx0:93, tubx1:84, tuby0:91, tuby1:62 }, m:{ hatC:[78, DK, "carry", 1, 87, F], junC:[104, DK, "carry", -1, 112, F] } },
      { t:"03:25:00", d:4.5, cap:"03:25，戴帽子的人蹲在甲板中間。他手上有一樣東西，亮了一下。", st:{ truck:true, tx:12, lock:true, flash:true }, m:{ hatC:[84, DK, "kneel", -1, 78, DK], junC:[104, DK, "stand", -1] } },
      { t:"03:31:00", d:3, cap:"03:31，年輕的那一個上車，把車開走。戴帽子的沒有下船。", st:{ truck:true, tx:12, lock:true }, m:{ junC:[100, F, "stand", -1, 104, DK], hatC:[84, DK, "stand", -1] } },
      { t:"03:31:20", d:3.5, join:true, cap:"03:31，年輕的那一個上車，把車開走。戴帽子的沒有下船。", st:{ truck:true, tx:12, lock:true }, m:{ junC:[24, F, "stand", -1, 100, F], hatC:[84, DK, "stand", -1] }, out:["junC"] },
      { t:"03:31:40", d:4.5, join:true, cap:"03:31，年輕的那一個上車，把車開走。戴帽子的沒有下船。", st:{ truck:true, tx0:12, tx1:-60, lock:true }, m:{ hatC:[110, DK, "stand", 1, 84, DK] }, out:["hatC"] }
    ])
  };
  [...EP31.cctv, ...EP31.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案：重現 ---------- */
  const mkR = beats => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join); const seq = beats.map(b => b.st || {});
    return beats.map(b => { const o = Object.assign({}, b, { opt:Object.assign({}, b.opt || {}, { ds, seq }) }); delete o.st; return o; }); };
  const RB = mkR([
    { t:"02/27 02:41", d:5.5, cap:"02:41，小貨車停在後巷口。他們帶來了十二袋碎冰，和一個橘色的大魚桶。", scene:"c31_cold", opt:{ then:true }, st:{ tubx0:14, tubx1:62 }, m:{ ying:[93, 84, "sit", -1], hatC:[116, F, "stand", -1], junC:[46, F, "push", 1, -4, F] } },
    { t:"02/27 02:43", d:5, cap:"她的手綁在後面。離開那張椅子以前，她把髮夾塞進了椅墊的縫裡。", scene:"c31_cold", opt:{ then:true }, st:{ tubx:62 }, m:{ ying:[93, 84, "sit", -1], hatC:[110, F, "kneel", -1, 116, F], junC:[46, F, "stand", 1] } },
    { t:"02/27 02:50", d:5.5, cap:"02:44，倉庫斷電。桶子上面蓋著冰，從側門推了出去。地上留下一道水，和兩條輪痕。", scene:"c31_alley", opt:{ before:true }, st:{ cartx0:84, cartx1:30 }, m:{ junC:[50, F, "push", -1, 104, F], hatC:[72, F, "stand", -1, 122, F] } },
    { t:"02/27 03:14", d:6, cap:"03:10，7 號碼頭。桶子被抬上海順 3 號，放進冰艙。03:25，上了鎖。", scene:"c31_pier7", opt:{ clean:true, lock:false }, st:{ truck:true, tx:12, tubx0:93, tubx1:84, tuby0:91, tuby1:62 }, m:{ hatC:[78, DK, "carry", 1, 87, F], junC:[104, DK, "carry", -1, 112, F] }, out:["junC"] },
    { t:"02/27 05:00", d:5, cap:"05:00，第五通電話，是在船上打的。她說：「我有點想吐。」她哥哥聽得懂。", scene:"c31_pier7", opt:{ lock:false }, m:{ hatC:[88, DK, "kneel", -1, 104, DK] } },
    { t:"02/27 05:44", d:5.5, cap:"05:44，海巡用出港安檢的名義上了船。戴帽子的人，從船尾跳進了海裡。", scene:"c31_pier7", opt:{ lock:true, dawn:true, raid:true }, st:{ splash:50 }, m:{ fangC:[98, DK, "stand", -1, 100, F], hatC:[50, 74, "fall", -1, 70, DK] }, out:["hatC"] },
    { t:"02/27 05:47", d:5.5, cap:"05:47，冰艙的鎖被剪開。她還醒著。", scene:"c31_pier7", opt:{ dawn:true, open:true }, m:{ ying:[76, DK, "sit", 1], wuC:[90, DK, "kneel", -1, 100, DK], fangC:[116, DK, "stand", -1] } }
  ]);
  EP31.court = {
    title: "三樓・指揮所・2 月 27 日 05:40", scene: "c30_post", opt:{ phase:2, evid:true, pin:true },
    who: ph => ["zhou", "wu", "kui", "qian"],
    open: ph => "05:40，指揮所。窗戶外面的黑，淡了一點。周振邦的手放在無線電上，另一隻手拿著那一根藍色的圖釘。小吳站在他旁邊。沒有人坐著。",
    kindLine: {
      p3: "照他說的：六點，她會被帶到 3 號碼頭。把人排在那裡。",
      cabin: "她已經在 3 號碼頭了。亮著燈的那一間貨櫃屋。",
      truck: "她還在冰店那一台小貨車的冷凍櫃裡。",
      sea: "來不及了。她已經被船載出海了。",
      boat7: "她在 7 號碼頭。一艘漁船上。"
    },
    kindTrue: "（周振邦把藍色的圖釘從 3 號碼頭拔了起來，按在魚市的後面。他拿起無線電。「方分隊長，海順 3 號。現在。」）",
    murmur: [ "（牆上的鐘，秒針走得很大聲。）", "（陳葵把耳機掛回脖子上。）", "（小吳的手機螢幕亮了一下，又暗了。）" ],
    confess: {
      jun: [ "（06:02，3 號碼頭。阿駿從送冰的車上下來，拿起繫纜樁旁邊的那一個袋子。高偵查佐從貨櫃屋的後面走了出來。）", "……我只是開車的。真的。他們說，東西到手，就會放她走。", "我每一餐都有買便當給她。電暖器也是我去搬的。……她昨天買燒仙草的時候，還跟我說謝謝。" ],
      hat: "（阿帽不在這裡。隔天下午，他在八公里外的海面上被撈了起來。筆錄上，一個字都沒有。）"
    },
    cornered: { jun: "車子整個晚上都停在我家樓下啊！你們去問阿姨——", hat: "（船尾的那個人回頭看了一眼。帽簷下面，看不到眼睛。）" },
    deny: {
      zhu: "我在樓上睡覺！車子的定位，是我自己拿給你們看的……那個女生，每個禮拜都來，我怎麼會……",
      owner: "（醫院回了電話：龔海順 2 月 19 日開刀，到現在都還不能下床。）"
    },
    replayText: "2 月 27 日 02:41，冰店後面的倉庫——",
    replay: { scene:"c31_cold", opt:{ then:true }, clean:true, cam:"經過重現", date:"2027-02-27", beats:RB },
    endGood: "05:44，方立群的人用出港安檢的名義，上了海順 3 號。\n戴帽子的那一個，從船尾跳進了海裡。冰艙的鎖被剪開的時候，她還醒著。她的第一句話是：「我哥呢？」\n06:00，3 號碼頭。一台送冰的小貨車，停在最外面的繫纜樁旁邊。阿駿下了車，拿起那一個袋子。他不知道，船已經不會出港了。\n隔天下午，阿帽在八公里外的海面上被撈了起來。活著。他一句話都不說。\n他的律師，比筆錄的通知還早到。姓蘇。你在咖啡店的隔壁桌，見過這個人。",
    endBad: "周振邦照你說的地方，把人排了出去。\n05:10 打到你手機裡的那一通電話，救了這個晚上。05:52，海巡的巡防艇在港口攔下了正要出去的海順 3 號。戴帽子的那一個，跳進了海裡。\n冰艙打開的時候，她的嘴唇是紫的。她還醒著。\n06:00，3 號碼頭。阿駿開著送冰的車來拿那一個袋子。他不知道，船已經被攔下來了。\n隔天下午，阿帽在八公里外的海面上被撈了起來。活著。他一句話都不說。\n他的律師，比筆錄的通知還早到。姓蘇。你在咖啡店的隔壁桌，見過這個人。"
  };

  /* 收工幕間：清晨的 7 號碼頭，救護車旁邊 */
  if (EP31.after) EP31.after = Object.assign({}, EP31.after, { scene:"c31_pier7", opt:{ dawn:true, open:true, amb:true, raid:true, clean:true },
    cast:[ { id:"xiaoying", x:140, y:98, pose:"sit", facing:-1, look:Object.assign({}, YING, { coat:"#c8a868" }) }, { id:"wu", x:120, y:98, pose:"kneel", facing:1, look:strip(LOOK.wu) }, { id:"_you", x:64, y:98, pose:"stand", facing:1 } ] });

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP31.fac = { police:["#cfcabb","#3f5a7a"], wh:["#5a626a","#2a3038"], ice:["#e8dcc8","#e86a8a"], pier3:["#2a4a7a","#1e3458"], pier7:["#d8dce0","#2a5a9a"] };
  EP31.setting = { police:"city", wh:"coast", ice:"coast", pier3:"coast", pier7:"coast" };
  EP31.outScenes = ["c31_alley", "c31_front", "c31_pier3", "c31_pier7"];
  EP31.skyTo = { c31_alley:0, c31_front:0, c31_pier3:0, c31_pier7:0 };
  EP31.worldSky = ph => ["#0a0e1a", "#222c44", "#1a1e24", "#20262c", 0, 1];
  EP31.roomDesc = {
    post:"三樓的指揮所。門還是關著的。",
    cold:"舊漁會的冷凍倉庫。一張椅子，地上是濕的。", alley:"冰店後面的巷子。側門被撞開了。",
    shop:"阿珠冰店。製冰機還在響。", front:"舊碼頭的路口。風小了。",
    p3:"3 號碼頭。港口的最外面，三面是水。",
    quay:"7 號碼頭。魚市的後面，船在準備出港。"
  };
  const say = (who, text, name) => ({ say:[who, text], name });
  EP31.world = {};
  EP31.locations.forEach(l => { EP31.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP31.world.police, {
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:96, bx:76, face:-1 } },
      say("zhou", "倉庫是空的。東西都還在原地，鑑識的人在裡面。", "周振邦"),
      say("zhou", "六點，3 號碼頭。我的人已經過去了。可是我不相信他會把人帶到那裡。", "周振邦"),
      say("you", "要我找什麼？", "你"),
      say("zhou", "跟昨天晚上一樣：她在哪裡。再加一個：是誰。05:40 以前，回來告訴我。", "周振邦"),
      say("wu", "學長，我跟你去。", "小吳")
    ]
  });
  EP31.mapPos = { police:[40,46,"u"], ice:[130,98,"d"], wh:[150,66,"u"], pier3:[214,30,"u"], pier7:[204,112,"d"] };
  EP31.mapRoads = [["police","ice"],["police","wh"],["ice","wh"],["wh","pier3"],["ice","pier7"],["pier3","pier7"]];
  EP31.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#262c34"); dither(0, 0, 240, 135, "#2c323c", 3);
    for (let x = 6; x < 112; x += 11) for (let y = 4; y < 126; y += 9) if ((x * 5 + y * 3) % 11 > 2){ R(x, y, 9, 7, "#38404c"); if ((x + y) % 4 === 0) R(x + 2, y + 2, 2, 2, "#f8d878"); if ((x * 3 + y) % 7 === 0) R(x + 6, y + 3, 2, 2, "#f8d878"); }
    R(0, 56, 124, 5, "#4a5058"); R(0, 104, 124, 4, "#4a5058"); R(70, 0, 5, 135, "#4a5058"); R(0, 16, 124, 4, "#4a5058"); for (let x = 4; x < 120; x += 16) R(x, 58, 6, 1, "#8a8e92");
    // 右邊：海，和南澳漁港。上面是伸到海裡的 3 號碼頭；下面是魚市和後面的一排碼頭
    R(120, 0, 120, 135, "#12283e"); dither(120, 0, 120, 135, "#183248", 3); for (let k = 0; k < 10; k++) R(128 + ((k * 23 + Math.floor(t * 2)) % 104), 6 + k * 13, 6, 1, "#2a4a6a");
    R(116, 52, 62, 62, "#343a42"); R(116, 52, 62, 2, "#4a5058"); R(170, 36, 60, 7, "#3e444c"); R(170, 36, 8, 20, "#3e444c"); R(224, 30, 6, 13, "#3e444c");
    R(150, 110, 84, 8, "#3e444c"); R(160, 100, 26, 12, "#4a4a44"); R(162, 102, 22, 3, "#f8d878"); for (let k = 0; k < 4; k++) R(190 + k * 11, 104, 4, 8, "#3e444c");
    for (let k = 0; k < 3; k++) R(192 + k * 11, 100, 6, 3, k === 1 ? "#dfe4ea" : "#8a929a");
  };
})();
