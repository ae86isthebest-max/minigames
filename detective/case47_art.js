/* =========================================================
   第 47 集：場景、人物造型、監視器畫面、重現、結案、走動畫面、地圖
   新畫的：望海停車場的入口 c47_gate、停車場 c47_lot、堤防 c47_wall、堤防路口 c47_jct（只在監視器裡）、
           順利五金 c47_shop／c47_counter、周家 c47_living／c47_desk／c47_room
   這一集玩家是沈岳（停職，便服，深色外套）；豆花跟著他。
   ========================================================= */
EP47.art = true;
(() => {
  const PR = PX.prim, { R: R0, P: P0, dither } = PR;
  const W = 192, H = 108;
  const SC = PX.SCENES;
  const R = (x, y, w, h, c) => R0(Math.round(x), Math.round(y), w, h, c), P = (x, y, c) => P0(Math.round(x), Math.round(y), c);
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o || !o.ds) return {}; const [i, p] = beatAt(o.t || 0, o.ds); return Object.assign({ _p:p }, (o.seq || [])[i] || {}); };
  const lerp = (a, b, p) => a + (b - a) * Math.max(0, Math.min(1, p || 0));
  const tube = (x, on) => { R(x - 10, 0, 20, 2, "#d8dcd8"); R(x - 9, 2, 18, 1, on === false ? "#8a8e8a" : "#f4f8f0"); if (on !== false) dither(x - 13, 3, 26, 6, "#f4f8f022", 3); };
  const floorT = (y, a, b, step) => { R(0, y, W, H - y, a); R(0, y, W, 1, b); for (let x = 8; x < W; x += step || 24) R(x, y + 12, 1, H - y - 12, b); R(0, y + 12, W, 1, b); };
  const door = (x, frame, leaf, knob, glass) => { R(x, 26, 18, 50, frame); R(x + 2, 28, 14, 48, leaf); if (glass){ R(x + 4, 31, 10, 12, glass); R(x + 4, 31, 10, 1, "#ffffff55"); } else { R(x + 4, 31, 10, 18, "#00000014"); R(x + 4, 53, 10, 19, "#00000014"); } R(knob > 0 ? x + 13 : x + 3, 52, 2, 3, "#d8c890"); };
  // 監視器的畫面：灰階＋雜訊（畫在人的前面）
  const camFx = (o) => { if (!o || !o.cam) return; const g = PR.g(), cv = g.canvas, w = cv.width, h = cv.height; try { const im = g.getImageData(0, 0, w, h), d = im.data; let s = Math.floor((o.t || 0) * 7) * 977 + 13;
      for (let i = 0; i < d.length; i += 4){ s = (s * 1103515245 + 12345) & 0x7fffffff; const n = (s % 17) - 8; const v = Math.max(0, Math.min(255, (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) * 0.92 + 10 + n)); d[i] = v; d[i + 1] = v; d[i + 2] = Math.min(255, v * 1.02); }
      g.putImageData(im, 0, 0); } catch (e) {}
    R(4, 4, 3, 3, "#e83a3a"); };
  // 天空：day＝陰天（雨後）；dusk＝傍晚；night；dawn
  const SKY = { day:["#9aa6ae", "#d4d8d8"], dusk:["#c8784a", "#f2cc98"], night:["#0e1420", "#222c3a"], dawn:["#3a4458", "#8a96a4"] };
  const SEA = { day:["#5a7a8a", "#7a96a2"], dusk:["#6a5a6a", "#c8906a"], night:["#141c28", "#1e2a38"], dawn:["#3a4a5a", "#5a6a7a"] };
  const tod = o => o.night ? "night" : o.dawn ? "dawn" : o.dusk ? "dusk" : "day";
  const sea = (y0, y1, o) => { const k = tod(o), c = SEA[k]; R(0, y0, W, y1 - y0, c[0]); R(0, y0, W, 1, c[1]); for (let y = y0 + 3; y < y1; y += 4) for (let x = (y * 7) % 13; x < W; x += 17) R(x, y, 6, 1, c[1]); if (k === "dusk") dither(60, y0 + 1, 70, y1 - y0 - 1, "#f8d8a044", 3); };
  const rain = (o) => { if (!o.rain) return; let s = Math.floor((o.t || 0) * 9) * 131 + 7; for (let i = 0; i < 70; i++){ s = (s * 1103515245 + 12345) & 0x7fffffff; R(s % W, (s >> 8) % 100, 1, 3, "#b8c4d044"); } };
  const lighthouse = (x, y, s, o) => { const lit = o.night || o.dawn || o.dusk; R(x, y - 14 * s, 4 * s, 14 * s, "#f0ece4"); for (let k = 1; k < 4; k++) R(x, y - k * 4 * s, 4 * s, s, "#c83a2a"); R(x - s, y - 16 * s, 6 * s, 2 * s, "#3a3a40"); R(x, y - 18 * s, 4 * s, 2 * s, lit ? "#fff4b0" : "#d8d8d0"); if (lit) dither(x - 6 * s, y - 20 * s, 16 * s, 6 * s, "#fff4b022", 2); };
  // 小轎車（側面，車頭向右）。x＝車尾，y＝地面。o.col；o.fog 車窗起霧；o.tape 窗邊的膠帶；o.broken 右後窗破了；o.night
  const car = (x, y, o) => { o = o || {}; const col = o.col || "#c4c8cc", sh = PR.shade(col, -.3), lt = PR.shade(col, .3);
    R(x + 2, y - 18, 60, 11, col); R(x + 2, y - 18, 60, 1, lt); R(x, y - 15, 2, 7, col); R(x + 62, y - 15, 2, 7, col); R(x + 2, y - 8, 60, 2, sh);
    R(x + 12, y - 29, 36, 11, col); R(x + 14, y - 30, 32, 1, lt); R(x + 8, y - 25, 4, 7, col); R(x + 48, y - 26, 3, 8, col); R(x + 51, y - 22, 3, 4, col);   // 車頂、前後的斜面
    const win = (wx, ww) => { const c = o.fog ? "#e4e8ea" : o.night ? "#1a2230" : "#4a6a7a"; R(wx, y - 28, ww, 9, c); if (o.fog){ for (let k = 2; k < ww; k += 3) R(wx + k, y - 25 + (k % 4), 1, 6 - (k % 4), "#c8d0d4"); } else R(wx + 1, y - 27, 3, 1, "#ffffff44");
      if (o.tape){ R(wx, y - 28, ww, 1, "#a8acb0"); R(wx, y - 20, ww, 1, "#a8acb0"); R(wx, y - 28, 1, 9, "#a8acb0"); R(wx + ww - 1, y - 28, 1, 9, "#a8acb0"); } };
    win(x + 14, 15); win(x + 31, 15); R(x + 30, y - 28, 1, 10, sh);
    if (o.broken){ R(x + 14, y - 28, 15, 9, "#14161a"); [[1, 1], [4, 0], [13, 2], [14, 7], [0, 6], [8, 8]].forEach(([dx, dy]) => P(x + 14 + dx, y - 28 + dy, "#d8e4ec")); R(x + 15, y - 22, 6, 3, "#c8ccd0"); R(x + 16, y - 21, 4, 1, "#8a8e92"); }
    R(x + 30, y - 18, 1, 10, sh); R(x + 25, y - 16, 3, 1, sh); R(x + 42, y - 16, 3, 1, sh);   // 車門的線、把手
    R(x + 60, y - 16, 3, 2, o.night ? "#fff4c0" : "#f4f0d8"); R(x, y - 15, 2, 2, "#c83a2a");   // 頭燈、尾燈
    R(x + 4, y - 12, 8, 3, "#f4f4ec"); R(x + 5, y - 11, 6, 1, "#3a3a44");   // 車牌
    [x + 12, x + 50].forEach(cx => { R(cx - 3, y - 9, 7, 9, "#2a2a2e"); R(cx - 4, y - 7, 9, 5, "#2a2a2e"); R(cx - 1, y - 6, 3, 3, "#8a8e92"); }); };
  // 封鎖線（黃黑）：從 x0 到 x1，高度 y
  const cordon = (x0, x1, y, down) => { [x0, 58, 136, x1].forEach(px => { R(px - 1, y - 2, 3, 78 - y + 2, "#e87a2a"); R(px - 1, y + 4, 3, 2, "#f4f4ec"); });
    if (down){ R(x0, y, ((x1 - x0) / 2) | 0, 2, "#e8c820"); for (let k = x0; k < (x0 + x1) / 2; k += 6) R(k, y, 3, 2, "#2a2a2e"); R((x0 + x1) / 2 | 0, 77, ((x1 - x0) / 2) | 0, 1, "#e8c820"); return; }
    R(x0, y, x1 - x0, 2, "#e8c820"); for (let k = x0; k < x1; k += 6) R(k, y, 3, 2, "#2a2a2e"); };

  /* ---------- 入口（戶外）：遠方的交通鏡頭 x0–14（y18–40）；招牌 x14–54（y20–34）；管理亭 x60–92（y36–76，窗 x64–88 y46–56，上面的鏡頭 x84–92 y29–34）；
     欄杆 x94–144（柱 x94–99，桿 y54–56）；自動繳費機 x146–159（y48–76，螢幕 y52–60）；路燈 x176。
     o.carX＋o.car＝鏡頭裡的車（車頭向右）；o.bikeX；o.truck＝大馬路上垃圾車的燈；o.rain；o.cam ---------- */
  SC.c47_gate = (o) => { o = Object.assign({}, o, stOf(o)); const k = tod(o), nt = k === "night";
    PR.sky(SKY[k][0], SKY[k][1], 76); sea(52, 62, o);
    R(0, 62, W, 14, nt ? "#2a2e34" : "#8a8a84"); R(0, 62, W, 1, nt ? "#3a3e44" : "#a4a49c");   // 堤防的矮牆
    // 遠方路口的交通鏡頭
    R(6, 22, 2, 40, "#4a4e54"); R(2, 18, 10, 4, "#2a2a2e"); R(10, 19, 3, 2, "#3a3a40"); P(3, 19, "#e83a3a");
    // 招牌
    R(18, 34, 2, 28, "#5a5e64"); R(50, 34, 2, 28, "#5a5e64"); R(14, 20, 40, 14, nt ? "#2a4a6a" : "#2a5a8a"); R(14, 20, 40, 1, "#4a7aaa"); R(15, 31, 38, 2, "#f4f4ec");
    // 管理亭
    R(58, 34, 36, 3, nt ? "#5a5e66" : "#8a8e94"); R(60, 37, 32, 39, nt ? "#7a7e84" : "#e8e8e4"); R(60, 37, 1, 39, "#b8b8b4"); R(91, 37, 1, 39, "#b8b8b4");
    R(64, 46, 24, 10, "#3a4a5a"); R(65, 47, 22, 8, nt ? "#1a2a3a" : "#7a9aaa"); R(70, 49, 8, 5, nt ? "#5aa8e8" : "#2a3a4a"); R(71, 50, 6, 3, nt ? "#8ac8f8" : "#4a8ab8");   // 窗和裡面的螢幕
    R(66, 58, 18, 18, nt ? "#5a5e66" : "#c8c8c4"); R(80, 66, 2, 3, "#5a5a54");   // 管理亭的門
    R(86, 30, 7, 4, "#2a2a2e"); R(84, 31, 3, 2, "#3a3a40"); P(91, 31, "#e83a3a"); R(89, 34, 1, 3, "#3a3a40");   // 鏡頭
    // 欄杆
    R(94, 50, 6, 26, "#d8d4c8"); R(95, 50, 4, 3, "#c83a2a");
    const up = !!o.bar; if (up){ R(98, 10, 2, 44, "#f4f4f0"); for (let y = 12; y < 52; y += 8) R(98, y, 2, 4, "#c83a2a"); }
    else { R(100, 54, 44, 2, "#f4f4f0"); for (let x = 102; x < 144; x += 8) R(x, 54, 4, 2, "#c83a2a"); }
    // 自動繳費機
    R(146, 48, 13, 28, nt ? "#5a5e66" : "#d8d8d0"); R(146, 48, 13, 1, "#f4f4f0"); R(148, 52, 9, 8, "#1a2a3a"); R(149, 53, 7, 6, nt ? "#4a9ad8" : "#3a7aa8"); R(150, 62, 5, 2, "#3a3a3e"); R(150, 66, 5, 4, "#c8a040");
    // 路燈
    R(176, 16, 2, 60, "#3a3e44"); R(172, 14, 9, 3, "#3a3e44"); R(173, 17, 6, 1, nt ? "#fff4c0" : "#d8d8d0"); if (nt){ dither(160, 18, 36, 58, "#fff4c012", 2); }
    // 地面
    R(0, 76, W, 32, nt ? "#2e3034" : "#6e6e6c"); R(0, 76, W, 1, nt ? "#24262a" : "#5a5a58"); for (let x = 6; x < W; x += 20) R(x, 92, 10, 1, nt ? "#5a5a50" : "#d8d4b8");
    R(110, 98, 14, 1, "#e8e8e0"); R(122, 97, 2, 3, "#e8e8e0");   // 地上的箭頭
    if (!nt && !o.dusk){ R(20, 100, 26, 2, "#8a96a0"); R(150, 96, 18, 2, "#8a96a0"); }   // 雨後的水窪
    if (o.truck){ const tx = lerp(-20, 200, o._p); R(tx, 57, 4, 2, "#f8e8a0"); R(tx + 14, 57, 3, 2, "#e8a040"); }
    if (o.car) car(lerp(o.carFrom ?? o.carX, o.carX, o._p), 78, { night:nt, col:o.carCol });
    rain(o);
  };
  SC.c47_gate.front = (o) => camFx(Object.assign({}, o, stOf(o)));

  /* ---------- 停車場（戶外）：海 y40–62、燈塔 x184；堤防 y62–66；垃圾桶 x24–38（y56–76）；水泥車擋 x44–58（y72–76，下午上面壓著一張紙 o.paper）；
     上午：銀色的車 x66–130（車窗 x80–95、x97–112，y48–57）、封鎖線 y64；證物桌 x136–184（桌面 y58，袋子 y52–58：x138／147／156／165／174）；
     下午：車子拖走了（地上噴漆、碎玻璃 x70–126 y74–78）；小吳的工具箱 x114–130（y66–76）；證物桌還在（小吳在整理袋子）。
     地上：腳印 x34–90 y84–94；水窪 x134–164 y92–96；菸蒂 x150–174 y82–86。o.gone＝車子不在；o.table＝證物桌；o.box＝工具箱；o.rain；o.night；o.fog/o.tape/o.broken ---------- */
  SC.c47_lot = (o) => { o = Object.assign({}, o, stOf(o)); const k = tod(o), nt = k === "night";
    PR.sky(SKY[k][0], SKY[k][1], 40); sea(40, 62, o); lighthouse(184, 40, 1, o);
    R(0, 62, W, 4, nt ? "#3a3e44" : "#a4a49c"); R(0, 62, W, 1, nt ? "#4a4e54" : "#c4c4bc");   // 堤防
    R(0, 66, W, 42, nt ? "#2a2c30" : "#6a6a68"); R(0, 66, W, 1, nt ? "#222428" : "#5a5a58");
    R(0, 80, W, 28, nt ? "#3a3830" : "#9a8e78"); dither(0, 80, W, 28, nt ? "#4a4438" : "#a89c86", 3);   // 沒有鋪柏油的沙地
    [64, 132].forEach(x => R(x, 70, 1, 10, "#e8e8e0")); R(64, 79, 69, 1, "#e8e8e0"); if (PR.tiny) PR.tiny("B-14", 90, 72, nt ? "#8a8a84" : "#e8e8e0");
    // 垃圾桶
    R(24, 58, 14, 18, "#3a7a4a"); R(23, 56, 16, 3, "#2a6a3a"); R(26, 62, 10, 1, "#4a8a5a"); R(27, 66, 8, 6, "#2a5a3a");
    if (!o.gone){ car(66, 76, { fog:o.fog !== false, tape:o.tape !== false, broken:!!o.broken, night:nt }); }
    else if (!o.empty){ R(72, 76, 10, 1, "#f4f4ec"); R(110, 76, 10, 1, "#f4f4ec"); R(72, 76, 1, 2, "#f4f4ec"); R(119, 76, 1, 2, "#f4f4ec");
      [[78, 75], [82, 77], [85, 76], [88, 77], [80, 74]].forEach(([x, y]) => P(x, y, "#d8e8f0")); }
    if (o.table){ R(136, 58, 48, 2, "#d8d8d4"); R(136, 58, 48, 1, "#f4f4f0"); R(138, 60, 2, 16, "#8a8a84"); R(180, 60, 2, 16, "#8a8a84");
      [138, 147, 156, 165, 174].forEach((x, i) => { R(x, 52, 8, 6, "#e8f0f4"); R(x, 52, 8, 1, "#c83a2a"); R(x + 1, 54, 6, 3, ["#3a3a3e", "#a8acb0", "#2a2a2e", "#b8905a", "#1a1a1e"][i]); }); }
    if (o.box){ R(114, 68, 16, 8, "#a8a8a4"); R(114, 68, 16, 2, "#c8c8c4"); R(120, 66, 4, 2, "#5a5a54"); R(117, 69, 6, 1, "#5aa8e8"); }
    R(44, 72, 14, 4, nt ? "#5a5a58" : "#b8b4ac"); R(44, 72, 14, 1, nt ? "#6a6a68" : "#d4d0c8");   // 水泥車擋
    if (o.paper){ R(45, 70, 12, 2, "#f8f8f4"); R(46, 70, 8, 1, "#5a5a6a"); R(49, 68, 3, 2, "#7a7a76"); }
    if (o.cordon !== false) cordon(10, 186, 64, !!o.gone);
    // 地上：腳印、水窪、菸蒂
    if (!o.cam){ [[38, 88], [46, 86], [54, 89], [62, 87], [70, 90], [44, 92], [58, 93], [76, 88], [84, 91]].forEach(([x, y], i) => { R(x, y, 3, 2, i % 3 === 2 ? "#6a5e48" : "#7a6e58"); P(x + 1, y - 1, "#7a6e58"); });
      R(134, 92, 30, 4, nt ? "#3a4a5a" : "#8aa0ae"); R(136, 92, 10, 1, nt ? "#5a6a7a" : "#c8d8e0");
      [[152, 84], [156, 85], [161, 83], [165, 85], [170, 84], [158, 82], [168, 86]].forEach(([x, y]) => { R(x, y, 2, 1, "#d8d0b8"); P(x + 2, y, "#c89a6a"); }); }
    rain(o);
  };
  SC.c47_lot.front = (o) => camFx(Object.assign({}, o, stOf(o)));

  /* ---------- 堤防（戶外）：海 y30–60；燈塔 x150（防波堤 x120–192 y40–44）；消波塊 y58–66；
     欄杆（上 y48、中 y58）；長椅 x30–62（椅背 y54–62，刻的太陽 x38–46 y56–60）；路燈 x96；
     全叔的腳踏車 x118–144（y58–76）和釣竿；小鐵門 x168–188（y40–76，大鎖 x176 y56）。o.bike＝腳踏車在 ---------- */
  SC.c47_wall = (o) => { o = Object.assign({}, o, stOf(o)); const k = tod(o), nt = k === "night";
    PR.sky(SKY[k][0], SKY[k][1], 30); sea(30, 60, o);
    R(120, 40, 72, 4, nt ? "#3a3e44" : "#8a8a84"); R(120, 40, 72, 1, nt ? "#4a4e54" : "#a8a8a0"); lighthouse(150, 40, 1.6, o);
    R(0, 58, W, 8, nt ? "#2a2e34" : "#6a7076");
    for (let x = -4; x < W; x += 11){ R(x, 60 + (x % 3), 9, 6, nt ? "#4a4e54" : "#9a9a94"); R(x + 3, 58 + (x % 3), 3, 3, nt ? "#5a5e64" : "#b4b4ac"); }   // 消波塊
    R(0, 66, W, 10, nt ? "#3a3e44" : "#b8b4a8"); R(0, 66, W, 1, nt ? "#4a4e54" : "#d4d0c4");   // 堤防的頂
    // 欄杆
    for (let x = 2; x < W; x += 16){ if (x > 164 && x < 190) continue; R(x, 46, 2, 30, "#5a6a74"); }
    R(0, 47, 168, 2, "#6a7a84"); R(0, 57, 168, 1, "#6a7a84"); R(188, 47, 4, 2, "#6a7a84"); R(188, 57, 4, 1, "#6a7a84");
    // 小鐵門（生鏽）
    R(168, 40, 2, 36, "#8a4a2a"); R(186, 40, 2, 36, "#8a4a2a"); R(168, 40, 20, 2, "#8a4a2a"); for (let x = 172; x < 186; x += 4) R(x, 42, 1, 34, "#9a5a3a"); R(168, 58, 20, 1, "#7a3a1a");
    R(175, 55, 5, 6, "#6a3a1a"); R(176, 53, 3, 2, "#5a2a12"); P(177, 58, "#2a1a0a");
    // 長椅（背對你，面對燈塔）
    R(30, 54, 32, 2, "#8a6a44"); R(30, 58, 32, 2, "#8a6a44"); R(30, 61, 32, 1, "#7a5a3a"); R(30, 64, 32, 2, "#9a7a54"); R(32, 66, 2, 10, "#5a5e64"); R(58, 66, 2, 10, "#5a5e64");
    R(40, 56, 4, 3, "#5a3a22"); P(39, 57, "#5a3a22"); P(44, 57, "#5a3a22"); P(42, 55, "#5a3a22"); P(42, 59, "#5a3a22"); P(46, 58, "#6a4a2a");   // 刻的太陽
    // 路燈
    R(96, 12, 2, 64, "#3a3e44"); R(92, 10, 9, 3, "#3a3e44"); R(93, 13, 6, 1, nt || o.dusk ? "#fff4c0" : "#d8d8d0");
    if (o.bike){ R(108, 76, 1, 1, "#3a3a3e"); for (let i = 0; i < 30; i++) P(108 + i * 0.7, 76 - i * 1.1, "#2a2a2e"); P(129, 42, "#e8e8e0");   // 釣竿
      [124, 140].forEach(cx => { for (let dy = -5; dy <= 5; dy++){ const hw = Math.round(Math.sqrt(30 - dy * dy)); P(cx - hw, 70 + dy, "#2a2a2e"); P(cx + hw, 70 + dy, "#2a2a2e"); } R(cx - 2, 64, 5, 1, "#2a2a2e"); R(cx - 2, 76, 5, 1, "#2a2a2e"); P(cx, 70, "#8a8a8a"); });
      R(124, 69, 16, 1, "#3a6a8a"); R(130, 62, 1, 8, "#3a6a8a"); R(128, 61, 5, 1, "#2a2a2e"); R(139, 60, 1, 10, "#3a6a8a"); R(137, 59, 5, 1, "#2a2a2e");
      R(141, 60, 8, 5, "#8a8a84"); R(143, 57, 3, 4, "#c8c8c4"); }   // 車籃、保溫瓶
    R(0, 76, W, 32, nt ? "#3a3c40" : "#a8a49a"); R(0, 76, W, 1, nt ? "#2a2c30" : "#8a8680"); for (let x = 0; x < W; x += 24) R(x, 76, 1, 32, nt ? "#2e3034" : "#9a968c");
    rain(o);
  };

  /* ---------- 堤防路口（只在監視器裡）：大馬路 y70–86；堤防路往右上 x120–150；紅綠燈 x100；o.carX；o.taxi；o.truck；o.bikeX ---------- */
  SC.c47_jct = (o) => { o = Object.assign({}, o, stOf(o)); const nt = !o.dawn;
    PR.sky(nt ? "#0e1420" : "#3a4458", nt ? "#222c3a" : "#8a96a4", 60);
    for (let x = 0; x < 110; x += 14){ const h = 14 + (x * 7) % 18; R(x, 60 - h, 12, h, "#1e2430"); if (x % 28 === 0) R(x + 3, 60 - h + 4, 2, 2, "#c8b870"); }
    R(0, 60, W, 48, "#262a30"); R(0, 70, W, 16, "#34383e"); for (let x = 4; x < W; x += 14) R(x, 78, 7, 1, "#c8c8b0");
    R(124, 40, 26, 30, "#30343a"); R(132, 40, 1, 30, "#8a8a7a");   // 堤防路
    R(100, 30, 2, 40, "#4a4e54"); R(96, 26, 10, 5, "#2a2a2e"); P(98, 28, "#e83a3a"); P(101, 28, "#3a3a2a"); P(104, 28, "#3a3a2a");
    R(160, 20, 2, 50, "#4a4e54"); R(156, 18, 9, 3, "#4a4e54"); dither(146, 22, 32, 48, "#fff4c014", 2);
    if (o.car){ const x = lerp(o.carFrom ?? o.carX, o.carX, o._p); car(x, 84, { night:true }); }
    if (o.taxi){ const x = lerp(-70, 200, o._p); car(x, 86, { night:true, col:"#e8c020" }); }
    if (o.truck){ const x = lerp(-70, 200, o._p); R(x, 66, 50, 18, "#e8e8e4"); R(x + 50, 70, 12, 14, "#3a7a4a"); R(x + 8, 82, 8, 6, "#2a2a2e"); R(x + 44, 82, 8, 6, "#2a2a2e"); R(x + 60, 74, 2, 2, "#fff4c0"); }
  };
  SC.c47_jct.front = (o) => camFx(Object.assign({}, o, stOf(o)));

  /* ---------- 順利五金・店裡：門 x3–20；木炭 x26–60（y54–76，紅袋子）；膠帶的架子 x66–100（y30–56）；
     大架子 x102–144（最上層烤肉爐 y14–30，下面是水管、工具）；雨鞋 x150–186（y50–76）、掛著的水管 x150–186（y16–40） ---------- */
  SC.c47_shop = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 76, "#d8d0bc"); R(0, 0, W, 4, "#b8ae98"); R(0, 64, W, 12, "#c4baa4"); R(0, 64, W, 1, "#aca28c"); tube(60, true); tube(150, true);
    door(3, "#5a6a74", "#8a9aa4", 1, "#c8d8e0");
    // 木炭
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++){ if (r === 2 && c === 2) continue; const x = 26 + c * 11 + (r % 2) * 2, y = 68 - r * 7; R(x, y, 10, 8, "#c83a2a"); R(x, y, 10, 1, "#e85a4a"); R(x + 2, y + 3, 6, 2, "#f4e8c0"); R(x + 4, y - 1, 2, 1, "#f4f4f0"); }
    R(50, 52, 10, 2, "#3a3a3e"); dither(50, 52, 10, 2, "#5a5a5e", 2);   // 少了兩包的地方（灰）
    // 膠帶的架子
    R(66, 30, 34, 26, "#8a6a4a"); R(67, 31, 32, 24, "#6a4e34"); for (let r = 0; r < 3; r++){ R(67, 38 + r * 8, 32, 1, "#8a6a4a"); for (let c = 0; c < 6; c++){ if (r === 1 && (c === 2 || c === 3)) continue; const cl = ["#f4f0d8", "#e8e8f0", "#a8acb0", "#3a3a3e", "#f4c040", "#a8acb0"][(c + r) % 6]; R(68 + c * 5, 32 + r * 8, 4, 5, cl); P(70 + c * 5, 34 + r * 8, "#6a4e34"); } }
    // 大架子
    R(102, 12, 42, 64, "#7a6a54"); R(103, 13, 40, 62, "#5a4a38"); [30, 48, 62].forEach(y => R(103, y, 40, 2, "#7a6a54"));
    for (let c = 0; c < 5; c++){ const x = 105 + c * 8; R(x, 22, 7, 7, "#c8ccd0"); R(x, 22, 7, 1, "#e8ecee"); R(x + 1, 29, 1, 1, "#8a8e92"); R(x + 5, 29, 1, 1, "#8a8e92"); }   // 烤肉爐
    for (let c = 0; c < 4; c++){ R(106 + c * 9, 38, 7, 9, ["#3a7a4a", "#2a5a8a", "#e8a040", "#5a5a5e"][c]); } for (let c = 0; c < 5; c++) R(106 + c * 7, 54, 5, 7, "#a8a8a4");
    // 掛著的水管、雨鞋
    for (let c = 0; c < 3; c++){ R(152 + c * 12, 16, 10, 22, ["#3a7a4a", "#e8a040", "#2a5a8a"][c]); R(154 + c * 12, 20, 6, 14, "#d8d0bc"); }
    for (let c = 0; c < 4; c++){ R(150 + c * 9, 58, 7, 18, c % 2 ? "#2a2a2e" : "#3a5a3a"); R(150 + c * 9, 72, 9, 4, c % 2 ? "#2a2a2e" : "#3a5a3a"); }
    floorT(76, "#a89e88", "#988e78", 22);
  };

  /* ---------- 順利五金・櫃台：螺絲的抽屜牆 x4–24；櫃台 x28–112（檯面 y56，收據本 x40–56 y51–56，計算機、算盤 x60–80，信封架 x88–102 y38–54）；
     牆上的螢幕 x122–144（y26–44）；後門 x166–184。o.cam；o.hui＝鏡頭裡的她 ---------- */
  SC.c47_counter = (o) => { o = Object.assign({}, o, stOf(o));
    R(0, 0, W, 76, "#d8d0bc"); R(0, 0, W, 4, "#b8ae98"); R(0, 64, W, 12, "#c4baa4"); tube(70, true);
    R(4, 14, 20, 50, "#8a8e94"); for (let r = 0; r < 8; r++) for (let c = 0; c < 3; c++){ R(5 + c * 6, 15 + r * 6, 5, 5, "#a8acb2"); P(7 + c * 6, 17 + r * 6, "#3a3a3e"); }
    // 櫃台
    R(28, 56, 84, 3, "#a87a4a"); R(28, 56, 84, 1, "#c89a6a"); R(30, 59, 80, 17, "#8a6a44"); R(30, 59, 80, 1, "#6a4e34"); R(36, 60, 24, 14, "#c8d4d8"); R(37, 61, 22, 12, "#e8ecee"); R(42, 63, 8, 6, "#d8c8a0");   // 玻璃下面的舊照片
    R(40, 51, 16, 5, "#2a4a8a"); R(40, 51, 16, 1, "#4a6aaa"); R(42, 53, 12, 2, "#f4f4ec");   // 收據本
    R(60, 52, 10, 4, "#3a3a3e"); R(61, 53, 8, 1, "#a8c8a8"); R(72, 52, 10, 4, "#8a5a3a"); for (let k = 0; k < 4; k++) R(73 + k * 2, 52, 1, 4, "#e8d8a0");   // 計算機、算盤
    R(88, 38, 14, 16, "#5a5e64"); for (let k = 0; k < 4; k++){ R(89, 40 + k * 3.5, 12, 2, ["#f4f4f0", "#c83a2a", "#b8905a", "#f4f4f0"][k]); }
    // 牆上的螢幕
    R(122, 26, 22, 18, "#2a2a2e"); R(123, 27, 20, 14, o.cam ? "#3a4a4a" : "#4a5a5a"); R(124, 28, 9, 6, "#6a7a7a"); R(134, 28, 8, 6, "#5a6a6a"); R(124, 35, 18, 5, "#5a6a6a"); P(141, 42, "#3ae86a"); R(130, 44, 2, 4, "#3a3a3e");
    R(166, 26, 18, 50, "#6a5a48"); R(168, 28, 14, 48, "#8a7a64"); R(179, 50, 2, 3, "#d8c890");   // 後門
    R(146, 50, 14, 26, "#7a6a54"); for (let k = 0; k < 3; k++) R(147, 52 + k * 8, 12, 6, "#a89a84");   // 紙箱
    floorT(76, "#a89e88", "#988e78", 22);
  };
  SC.c47_counter.front = (o) => camFx(Object.assign({}, o, stOf(o)));
  SC.c47_shop.front = (o) => camFx(Object.assign({}, o, stOf(o)));

  /* ---------- 周家・客廳：門 x3–20；鞋櫃 x22–40（y58–76，o.fruit＝萬主任的水果盒）；沙發 x54–110；全家福 x70–86（y22–36）；
     小餐桌 x116–142；冰箱 x148–172（y18–76；上門的紙條 x152–166 y24–38）；陽台的玻璃門 x176–191（y22–76） ---------- */
  SC.c47_living = (o) => { o = Object.assign({}, o, stOf(o)); const k = tod(o);
    R(0, 0, W, 76, "#e8e0cc"); R(0, 0, W, 4, "#c8c0ac"); R(0, 66, W, 10, "#d8ceb8"); R(0, 66, W, 1, "#c4baa4"); tube(100, !o.dark);
    door(3, "#6a4a2a", "#9a7a54", 1);
    R(22, 58, 18, 18, "#b89a74"); R(22, 58, 18, 1, "#d8ba94"); R(24, 66, 14, 1, "#9a7a54"); if (o.fruit){ R(26, 52, 12, 6, "#f4e8d0"); R(27, 53, 3, 3, "#e8a040"); R(31, 53, 3, 3, "#c83a2a"); R(35, 53, 2, 3, "#8ab84a"); R(25, 51, 14, 1, "#c83a2a"); }
    // 沙發
    R(54, 52, 56, 10, "#5a7a8a"); R(54, 52, 56, 1, "#7a9aaa"); R(54, 62, 56, 6, "#4a6a7a"); R(52, 56, 4, 14, "#4a6a7a"); R(108, 56, 4, 14, "#4a6a7a"); R(56, 68, 2, 8, "#3a3a3e"); R(106, 68, 2, 8, "#3a3a3e"); R(62, 55, 10, 6, "#e8c8a8"); R(94, 55, 10, 6, "#e8d8a8");
    // 全家福
    R(70, 22, 16, 14, "#8a6a44"); R(71, 23, 14, 12, "#c8d8e0"); R(73, 27, 3, 7, "#3a4a6a"); R(77, 26, 3, 8, "#c8a080"); R(81, 29, 3, 5, "#e8a0a0"); R(73, 25, 3, 2, "#2a2220"); R(77, 24, 3, 2, "#2a2220"); R(81, 27, 3, 2, "#2a2220");
    // 小餐桌
    R(116, 60, 26, 2, "#a87a4a"); R(118, 62, 2, 14, "#6a4e34"); R(138, 62, 2, 14, "#6a4e34"); R(124, 56, 6, 4, "#f4f4ec");
    // 冰箱
    R(148, 18, 24, 58, "#e8ecee"); R(148, 18, 24, 1, "#ffffff"); R(148, 44, 24, 1, "#b8c0c4"); R(168, 26, 2, 12, "#a8b0b4"); R(168, 50, 2, 14, "#a8b0b4");
    [[152, 24, "#f8e888"], [158, 25, "#f8d8e8"], [153, 31, "#f8e888"], [159, 32, "#d8f0f8"]].forEach(([x, y, c]) => { R(x, y, 6, 5, c); P(x + 2, y, "#c83a2a"); R(x + 1, y + 2, 4, 1, "#8a8a8a"); P(x + 4, y + 3, "#e8a020"); });
    // 陽台的玻璃門
    R(176, 22, 16, 54, "#8a8e94"); R(177, 23, 14, 52, k === "dusk" ? "#e8b888" : "#a8c4d4"); R(184, 23, 1, 52, "#8a8e94"); R(178, 26, 4, 1, "#ffffff66"); R(186, 60, 4, 12, "#4a7a4a");
    floorT(76, "#c8b490", "#b8a480", 24);
  };

  /* ---------- 周家・書桌：窗 x8–34（y16–40）；書桌 x40–104（桌面 y57；記帳本 x54–72 y51–57；抽屜 x74–92 y60–65；先生的照片 x44–50；檯燈 x94–100）；
     月曆 x108–124（y14–32）；書櫃 x136–166（y18–76）；門 x172–190 ---------- */
  SC.c47_desk = (o) => { o = Object.assign({}, o, stOf(o)); const k = tod(o), nt = !!o.night;
    R(0, 0, W, 76, "#e4dccc"); R(0, 0, W, 4, "#c4bcac"); R(0, 66, W, 10, "#d4ccb8"); tube(70, true);
    R(8, 16, 26, 24, "#8a8e94"); R(9, 17, 24, 22, nt ? "#1a2030" : k === "dusk" ? "#e8b888" : "#a8c4d4"); R(20, 17, 1, 22, "#8a8e94"); R(9, 27, 24, 1, "#8a8e94");
    // 書桌
    R(40, 57, 64, 3, "#9a7a54"); R(40, 57, 64, 1, "#b89a74"); R(42, 60, 2, 16, "#6a5238"); R(100, 60, 2, 16, "#6a5238"); R(74, 60, 18, 6, "#8a6a48"); R(74, 60, 18, 1, "#a88a64"); R(82, 62, 3, 1, "#d8c890");
    R(54, 52, 18, 5, "#3a7a4a"); R(54, 52, 18, 1, "#5a9a6a"); R(56, 54, 10, 1, "#d8d0a0"); R(71, 52, 1, 5, "#f4f0e0");   // 綠色的記帳本
    R(44, 48, 6, 9, "#8a6a44"); R(45, 49, 4, 6, "#c8d8e0"); R(46, 51, 2, 3, "#3a4a6a");   // 先生的照片
    R(96, 54, 6, 3, "#3a3a3e"); R(98, 46, 2, 8, "#3a3a3e"); R(94, 43, 8, 3, "#e8d8a0"); if (nt) dither(86, 46, 20, 12, "#fff4c022", 2);   // 檯燈
    if (o.hui){ R(58, 50, 10, 2, "#f4f4ec"); }
    // 月曆
    R(108, 14, 16, 18, "#f4f0e4"); R(108, 14, 16, 3, "#c83a2a"); for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) P(110 + c * 3, 19 + r * 3, "#8a8a8a"); P(116, 22, "#1a1a3a"); R(110, 19, 2, 1, "#2a4a8a");
    // 書櫃
    R(136, 18, 30, 58, "#8a6a4a"); R(137, 19, 28, 56, "#6a4e34"); [36, 54].forEach(y => R(137, y, 28, 2, "#8a6a4a"));
    for (let c = 0; c < 6; c++){ R(139 + c * 4, 22, 3, 13, ["#2a4a8a", "#c83a2a", "#2a4a8a", "#e8c040", "#3a7a4a", "#2a4a8a"][c]); R(139 + c * 4, 40, 3, 13, ["#3a7a4a", "#3a7a4a", "#3a7a4a", "#8a6a44", "#c8c8c4", "#c8c8c4"][c]); }
    R(140, 60, 20, 14, "#b89a74");
    door(172, "#6a4a2a", "#9a7a54", -1);
    floorT(76, "#c8b490", "#b8a480", 24);
  };

  /* ---------- 周家・昀昀的房間：門 x3–20；床 x24–76；窗 x84–108（y16–38）；海報 x112–124；書桌 x96–128（桌面 y56）；椅子 x124–142；
     書包 x128–138（y58–68，吊飾是黃色的）；書櫃 x150–178 ---------- */
  SC.c47_room = (o) => { o = Object.assign({}, o, stOf(o)); const k = tod(o);
    R(0, 0, W, 76, "#efe2dc"); R(0, 0, W, 4, "#d8c8c0"); R(0, 66, W, 10, "#e0d0c8"); tube(100, true);
    door(3, "#8a6a54", "#c8a888", 1);
    R(24, 46, 4, 30, "#a87a5a"); R(24, 60, 52, 6, "#f4f4f4"); R(28, 58, 48, 6, "#e8a8b8"); R(28, 58, 48, 1, "#f8c8d4"); R(30, 54, 12, 5, "#f8f8f4"); R(26, 66, 2, 10, "#8a6a4a"); R(72, 66, 2, 10, "#8a6a4a");
    R(84, 16, 24, 22, "#8a8e94"); R(85, 17, 22, 20, k === "dusk" ? "#e8b888" : "#a8c4d4"); R(82, 14, 6, 26, "#f8d8e0"); R(104, 14, 6, 26, "#f8d8e0");
    R(112, 16, 12, 18, "#2a3a5a"); R(114, 19, 8, 6, "#e8c040"); R(114, 27, 8, 1, "#f4f4ec"); R(114, 30, 6, 1, "#f4f4ec");
    R(96, 56, 32, 2, "#c8a888"); R(98, 58, 2, 18, "#8a6a4a"); R(124, 58, 2, 18, "#8a6a4a"); R(102, 50, 10, 6, "#f4f4ec"); R(114, 52, 6, 4, "#e8a8b8");
    R(124, 60, 18, 2, "#e8c8b8"); R(138, 44, 3, 18, "#e8c8b8"); R(126, 62, 2, 14, "#a88a74"); R(138, 62, 2, 14, "#a88a74");
    R(128, 58, 10, 10, "#2a5a9a"); R(128, 58, 10, 2, "#3a6aaa"); R(130, 62, 6, 1, "#1a3a7a"); R(136, 63, 3, 3, "#f4d040"); P(137, 62, "#f4d040");   // 書包、吊飾
    R(150, 20, 28, 56, "#c8a888"); R(151, 21, 26, 54, "#a88a74"); [38, 56].forEach(y => R(151, y, 26, 2, "#c8a888"));
    for (let c = 0; c < 8; c++){ R(152 + c * 3, 24, 2, 13, ["#e8a8b8", "#8ac8e8", "#f4d040", "#a8d8a8", "#e8a8b8", "#c8a8e8", "#f4d040", "#8ac8e8"][c]); R(152 + c * 3, 42, 2, 13, ["#c83a2a", "#2a4a8a", "#e8e8e0", "#3a7a4a", "#f4f4ec", "#2a4a8a", "#c83a2a", "#e8c040"][c]); }
    R(154, 62, 10, 12, "#f4e0c8"); R(156, 60, 6, 3, "#e8c8a8");   // 小時候的玩偶
    floorT(76, "#d8c4a8", "#c8b498", 24);
  };

  /* ---------- 人物造型 ---------- */
  const AL = id => (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null;
  const strip = L => { const o = Object.assign({}, L || {}); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  const SHEN = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };   // 停職：便服，深色的外套
  const DOG = { kind:"dog", coat:"#f0dcb0", collar:"#3a6ac8" };
  const WU = Object.assign({ skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", glasses:true, top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050" }, AL("wu") || {});
  const HUI = { gender:"f", skin:"#ecc8a6", hair:"#2a2220", hairStyle:"bob", top:"#f4f0e4", coat:"#d8c8a8", bottom:"#3a3a44" };
  const LOOK = {
    wu:    Object.assign({}, WU, { hello:"……我在自言自語。" }),
    wang:  { skin:"#e0b48c", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", hello:"學長。" },
    quan:  { age:"old", skin:"#c89a70", hair:"#d8d8d0", hairStyle:"short", top:"#e8e4d8", coat:"#5a6a5a", bottom:"#3a3a40", hat:"cap", capColor:"#3a5a4a", hello:"少年仔。" },
    wan:   { skin:"#e0b890", hair:"#1a1a1a", hairStyle:"slick", top:"#f4f4f0", coat:"#2a2e3a", tie:"#8a2a2a", bottom:"#2a2e3a", hello:"你好、你好。" },
    lai:   { age:"old", gender:"f", skin:"#d8a880", hair:"#4a4440", hairStyle:"bob", top:"#e8d8c8", apron:"#3a6a9a", bottom:"#3a3a44", hello:"要什麼？自己看。" },
    yun:   Object.assign({ gender:"f", skin:"#f0d0b0", hair:"#1e1a18", hairStyle:"long", bottom:"#2e3a5a" }, AL("zhouyiqing") || {}, { top:"#3a5a9a", bottom:"#2e3a5a", hello:"……" }),
    fang:  { gender:"f", skin:"#ecc8a6", hair:"#6a3a2a", hairStyle:"pony", top:"#2a2a2e", bottom:"#3a3a44", hello:"你是沈先生？進來。" },
    ye:    Object.assign({ gender:"f", skin:"#ecc8a6", hair:"#2a2220", hairStyle:"pony", top:"#f4f4f4", coat:"#7a7e86", bottom:"#5a5e66" }, AL("ye") || {}, { hello:"沈警官。" })
  };
  const DAILY = {
    wu:    [ { room:"lot", x:120, pose:"inspect@phone", facing:-1, doing:"站在封鎖線的裡面，低頭看手機，嘴巴在動。" }, { room:"lot", x:58, pose:"kneel", facing:1, doing:"蹲在空的停車格旁邊，拿著捲尺在量。" } ],
    wang:  [ { room:"gate", x:120, pose:"stand", facing:-1, doing:"站在欄杆的旁邊，帽子壓得很低。" }, null ],
    quan:  [ { room:"wall", x:100, pose:"stand", facing:1, doing:"站在欄杆旁邊，看著海。釣竿架著，沒有在動。" }, null ],
    wan:   [ { room:"lot", x:46, pose:"inspect@phone", facing:1, doing:"站在垃圾桶的旁邊，一直在講電話。" }, { room:"living", x:34, pose:"stand", facing:1, doing:"站在門口，沒有脫鞋，手上提著一盒水果。" } ],
    lai:   [ { room:"counter", x:84, pose:"write", facing:-1, doing:"在櫃台後面算帳，算盤和計算機一起用。" }, null ],
    yun:   [ null, { room:"living", x:82, pose:"sit", facing:1, doing:"縮在沙發的角落，抱著膝蓋。" } ],
    fang:  [ null, { room:"desk", x:60, pose:"stand", facing:1, doing:"站在姊姊的書桌前面，手放在椅背上。" } ],
    ye:    [ null, { room:"lot", x:150, pose:"read", facing:-1, doing:"站在空的停車格旁邊，在看文件夾。" } ]
  };
  EP47.suspects.forEach(s => {
    if (LOOK[s.id]){ if (LOOK[s.id].hello) s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP47.rooms = {
    sea: [
      { id:"gate", name:"望海停車場・入口", scene:"c47_gate", opt:(ph) => ({ dusk:ph > 0 }), details:[
        { id:"d47_sign", name:"招牌", hot:[14,20,40,14], text:"「望海停車場」。藍色的底，白色的字。\n下面一行小字：「本停車場夜間不開放露營、烤肉」。\n「烤肉」那兩個字，被人用奇異筆圈起來，打了一個問號。" },
        { id:"d47_bar", name:"欄杆", hot:[100,52,44,6], text:"紅白相間的欄杆。車子來了，它自己升起來。\n欄杆的旁邊，有一條窄窄的縫。腳踏車和人，都從那裡走。" },
        { id:"d47_lamp", name:"路燈", hot:[172,12,10,8], text:"一盞路燈。燈罩上面，停著一隻海鷗。\n牠看著停車場的最裡面，一直沒有飛走。" } ] },
      { id:"lot", name:"望海停車場・停車場", scene:"c47_lot", opt:(ph) => ph > 0 ? { dusk:true, gone:true, box:true, table:true, paper:true } : { table:true, broken:true }, details:[
        { id:"d47_lighthouse", name:"燈塔", hot:[180,22,10,20], text:"港口外面的燈塔。白色，三條紅色的線。\n從這一格看出去，剛好在正前方。" },
        { id:"d47_seawall", name:"堤防", hot:[0,60,22,5], text:"停車場的盡頭，一道矮矮的堤防。再過去，就是海。\n浪打上來，碎成白色的，又退回去。" },
        { id:"d47_tape", name:"封鎖線", hot:[140,62,40,4], text:"黃黑相間的封鎖線，綁在三根橘色的三角錐上。\n風一吹，嘩啦嘩啦地響。\n你以前是站在線的裡面的。" } ] },
      { id:"wall", name:"望海停車場・堤防", scene:"c47_wall", opt:(ph) => ph > 0 ? { dusk:true } : { bike:true }, details:[
        { id:"d47_tetra", name:"消波塊", hot:[62,58,50,6], text:"欄杆的外面，一排一排的消波塊。灰色的，長得像大的骨頭。\n浪打在上面，白色的泡沫。" },
        { id:"d47_lamp2", name:"路燈", hot:[92,8,10,8], text:"堤防上的路燈。燈罩裡有一個鳥巢。\n晚上，這裡只有這一盞燈，和燈塔。" },
        { id:"d47_sea", name:"海", hot:[0,32,110,22], text:"灰藍色的海。\n昨天晚上下過雨，今天的海，顏色比較深。" } ] }
    ],
    hw: [
      { id:"shop", name:"順利五金・店裡", scene:"c47_shop", opt:{}, details:[
        { id:"d47_hoses", name:"掛著的水管", hot:[150,16,36,24], text:"一捲一捲的水管，綠色、橘色、藍色。\n價錢牌是手寫的，被太陽曬得看不清楚。" },
        { id:"d47_boots", name:"雨鞋", hot:[150,56,36,20], text:"一排雨鞋。魚市的人，都來這裡買。\n最旁邊那一雙，跟你借來的那一雙，一模一樣。" } ] },
      { id:"counter", name:"順利五金・櫃台", scene:"c47_counter", opt:{}, details:[
        { id:"d47_oldphoto", name:"玻璃下面的照片", hot:[36,60,24,14], text:"櫃台的玻璃下面，一張發黃的照片：一個小男孩，抱著一隻比他還大的魚。\n旁邊寫著：「阿順　八歲　第一尾」。\n店名，是用兒子的名字取的。" },
        { id:"d47_screws", name:"螺絲的抽屜", hot:[4,14,20,50], text:"一整面牆的小抽屜。每一格，都貼著一顆螺絲當標籤。\n老闆娘不用看，伸手就拿得到。" } ] }
    ],
    home: [
      { id:"living", name:"周家・客廳", scene:"c47_living", opt:(ph) => ({ dusk:true, fruit:true }), details:[
        { id:"d47_family", name:"全家福", hot:[70,22,16,14], text:"一張全家福。一個男人、一個女人，中間一個小女生。\n在燈塔前面拍的。男人的臉，曬得很黑。\n相框的玻璃，擦得很乾淨。" },
        { id:"d47_shoes", name:"鞋櫃", hot:[22,58,18,18], text:"鞋櫃上面，放著一盒水果。蘋果、橘子、芭樂。\n盒子上的紅色緞帶，綁得很整齊。\n是萬主任帶來的。沒有人去碰它。" },
        { id:"d47_sofa", name:"沙發", hot:[54,52,56,16], text:"淺藍色的沙發，扶手的地方磨白了。\n一個抱枕上，繡著一個太陽。" } ] },
      { id:"desk", name:"周家・書桌", scene:"c47_desk", opt:(ph) => ({ dusk:true }), details:[
        { id:"d47_husband", name:"桌上的照片", hot:[44,48,6,9], text:"一個男人站在船頭，穿著雨衣，在笑。\n照片的角落，貼著一張小小的紙：「2016.3」。" },
        { id:"d47_binders", name:"書櫃", hot:[136,18,30,58], text:"書櫃裡，一排一排的檔案夾。水電、保險、昀昀的學校、房子。\n每一個檔案夾的背上，都貼著標籤，字很整齊。\n最下面一層，空了一格。" },
        { id:"d47_lamp3", name:"檯燈", hot:[92,42,10,14], text:"一盞舊的檯燈。燈泡是暖黃色的。\n開關的地方，被手指摸得發亮。" } ] },
      { id:"room", name:"周家・昀昀的房間", scene:"c47_room", opt:(ph) => ({ dusk:true }), details:[
        { id:"d47_bed", name:"床", hot:[24,54,52,12], text:"粉紅色的被子，摺成一個方塊。\n枕頭的旁邊，一隻舊舊的布偶，是一顆黃色的太陽。" },
        { id:"d47_books", name:"書櫃", hot:[150,20,28,56], text:"上面兩層，是參考書和小說。\n最下面一層，是小時候的書：繪本、童話，書背都褪色了。\n還有一隻玩偶，坐在書的前面。" },
        { id:"d47_poster", name:"海報", hot:[112,16,12,18], text:"一張樂團的海報。邊上用紙膠帶貼著。\n角落有一行很小的字：「媽媽說考完才可以去」。" } ] }
    ]
  };
  EP47.phases[0].scene = "c47_lot"; EP47.phases[0].sceneOpt = { table:true, broken:true };
  EP47.phases[1].scene = "c47_wall"; EP47.phases[1].sceneOpt = { dusk:true };

  /* ---------- 監視器動畫 ---------- */
  const F = 98;
  EP47.looks = { shenV:strip(SHEN), dogV:Object.assign({}, DOG), huiV:strip(HUI), quanV:strip(LOOK.quan), laiV:strip(LOOK.lai), wanV:strip(LOOK.wan), wangV:strip(LOOK.wang), wuV:strip(WU) };
  const mk = (scene, opt, cam, date, beats, clean) => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join);
    return { scene, opt:Object.assign({}, opt, { ds, seq:beats.map(b => b.st || {}) }), cam, date, clean, beats:beats.map(b => { const o = Object.assign({}, b); delete o.st; return o; }) }; };
  const ANIM = {
    cctv47_gate: mk("c47_gate", { cam:true, night:true }, "望海停車場 入口", "2027-04-22", [
      { t:"21:52:14", d:5.5, cap:"21:52，一台銀色的小轎車開到欄杆前面。欄杆升起來。開車的是一個短髮的女人。副駕駛座上，只有一個包包。", st:{ cam:true, night:true, car:true, carFrom:-70, carX:200, bar:true }, m:{} },
      { t:"21:53–01:59", d:4.5, cap:"之後，沒有車。路燈下面，一隻貓走過去。", st:{ cam:true, night:true }, m:{} },
      { t:"02:00–04:00", d:4.5, cap:"02:00，畫面上一條一條的雨絲。四點，停了。", st:{ cam:true, night:true, rain:true }, m:{} },
      { t:"05:50", d:4.5, cap:"05:50，大馬路那邊，垃圾車的燈，從畫面的最上面經過。沒有轉進來。", st:{ cam:true, dawn:true, truck:true }, m:{} },
      { t:"06:02", d:5, out:["quanV"], cap:"06:02，一台腳踏車，從欄杆旁邊的縫騎進去。戴毛帽的：全叔。", st:{ cam:true, dawn:true }, m:{ quanV:[200, F, "stand", 1, -14, F] } },
      { t:"06:20・06:31", d:5, cap:"06:20，巡邏車。06:31，一台黑色的休旅車。在這之前，一整夜，進去的只有她。", st:{ cam:true, dawn:true, car:true, carFrom:-70, carX:200, carCol:"#1a1a1e", bar:true }, m:{} }
    ]),
    cctv47_junction: mk("c47_jct", { cam:true }, "堤防路口（交通大隊）", "2027-04-22", [
      { t:"21:49:30", d:5.5, cap:"21:49，銀色小轎車 AKT-5521，從大馬路右轉，進了堤防路。前後都沒有車。", st:{ cam:true, car:true, carFrom:-70, carX:120 }, m:{} },
      { t:"23:12", d:4.5, cap:"23:12，一台計程車，直直開過去。", st:{ cam:true, taxi:true }, m:{} },
      { t:"05:50", d:4.5, cap:"05:50，垃圾車，直直開過去。", st:{ cam:true, truck:true, dawn:true }, m:{} },
      { t:"05:58", d:5, out:["quanV"], cap:"05:58，一台腳踏車轉進堤防路。21:49 到這裡，轉進去的只有她。", st:{ cam:true, dawn:true }, m:{ quanV:[140, F, "stand", 1, -14, F] } }
    ]),
    cctv47_shop: mk("c47_counter", { cam:true }, "順利五金 櫃台", "2027-04-22", [
      { t:"16:08", d:5, cap:"16:08，一個短髮的女人走進來，穿米色的外套。門外，一台銀色的小車，車上沒有別人。", st:{ cam:true }, m:{ huiV:[60, F, "stand", 1, -14, F], laiV:[96, F, "write", -1, 96, F] } },
      { t:"16:10", d:5.5, cap:"16:10，她拿了兩包木炭。在膠帶的架子前面，站了很久。老闆娘走過去。她拿了兩捲。", st:{ cam:true }, m:{ huiV:[30, F, "inspect", -1, 60, F], laiV:[50, F, "stand", -1, 96, F] } },
      { t:"16:11", d:5, cap:"16:11，櫃台。一盒點火塊。她從信封架上，抽了一個牛皮紙的信封。", st:{ cam:true }, m:{ huiV:[80, F, "reach", 1, 30, F], laiV:[110, F, "stand", -1, 50, F] } },
      { t:"16:12", d:5.5, cap:"16:12，她付了一張五百元，揮手說不用找。收據摺好，放進錢包。", st:{ cam:true }, m:{ huiV:[80, F, "give@paper", 1, 80, F], laiV:[110, F, "stand", -1, 110, F] } },
      { t:"16:13", d:4.5, out:["huiV"], cap:"16:13，她自己開車走了。", st:{ cam:true }, m:{ huiV:[-14, F, "stand", -1, 80, F], laiV:[110, F, "stand", -1, 110, F] } }
    ])
  };
  [...EP47.cctv, ...EP47.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 重現（結案的時候） ---------- */
  const mkR = beats => { const ds = beats.map(b => b.d); ds.j = beats.map(b => !!b.join); const seq = beats.map(b => b.st || {});
    return beats.map(b => { const o = Object.assign({}, b, { opt:Object.assign({}, b.opt || {}, { ds, seq }) }); delete o.st; return o; }); };
  const RB = mkR([
    { t:"4/20 晚上", d:6, cap:"4 月 20 日的晚上。她的雨刷下面，夾過一張照片。那天晚上，她坐在書桌前面，寫到很晚。", scene:"c47_desk", opt:{ night:true, hui:true }, m:{ huiV:[64, F, "write", 1, 64, F] } },
    { t:"4/22 16:10", d:6, cap:"4 月 22 日下午。順利五金。兩包木炭、兩捲布膠帶、一盒點火塊、一個信封。她問：哪一種最黏。", scene:"c47_shop", opt:{}, m:{ huiV:[80, F, "inspect", -1, 80, F] } },
    { t:"4/22 18:00", d:6, cap:"回到家，她煮了三杯雞，放進冰箱。蓋子上，貼了一張紙條。", scene:"c47_living", opt:{ dusk:true }, m:{ huiV:[140, F, "reach", 1, 140, F] } },
    { t:"4/22 19:00", d:6, cap:"她從記帳本的最後，撕下一頁。寫給女兒。最後，畫了一個太陽。", scene:"c47_desk", opt:{ night:true, hui:true }, m:{ huiV:[64, F, "write", 1, 64, F] } },
    { t:"21:52", d:5.5, cap:"晚上九點五十二分。她自己開車，進了望海停車場。", scene:"c47_gate", opt:{ night:true, car:true, carFrom:-70, carX:200, bar:true }, m:{} },
    { t:"22:18", d:6, cap:"最裡面的一格，車頭對著海，對著燈塔。十點十八分，她把手機清乾淨了。「他們找不到妳。」", scene:"c47_lot", opt:{ night:true, fog:false, tape:false, cordon:false, empty:true }, m:{} },
    { t:"22:30", d:6, cap:"她從裡面，一條一條撕下膠帶，封住車窗和門縫。按下了鎖。", scene:"c47_lot", opt:{ night:true, fog:false, tape:true, cordon:false }, m:{} },
    { t:"02:00", d:5.5, cap:"兩點到四點，下了一場小雨。天亮以前，沒有一台車進來。", scene:"c47_lot", opt:{ night:true, rain:true, cordon:false }, m:{} },
    { t:"06:02", d:5.5, cap:"六點零二分。全叔下了夜班，騎腳踏車來堤防。", scene:"c47_gate", opt:{ dawn:true }, m:{ quanV:[200, F, "stand", 1, -14, F] } },
    { t:"那一夜", d:6, cap:"她沒有欠任何人錢。她怕的，是別的事。", scene:"c47_wall", opt:{ dusk:true }, m:{} }
  ]);

  /* ---------- 結案（結局固定） ---------- */
  const pickR = () => { try { return (S.result && S.result.pick && S.result.pick.reasoning) || {}; } catch (e) { return {}; } };
  const missing = () => { try { const pk = pickR(); return EP47.reasoning.filter((r, i) => (!r.kinds) && pk[i] !== r.answer).length; } catch (e) { return 0; } };
  const seen = id => { try { return typeof S !== "undefined" && S && (S.seen || []).includes(id); } catch (e) { return false; } };
  const sign = () => "葉晴拔開筆蓋。「死亡方式」那一格，她勾了「自殺」。\n她在下面的空白，寫了一行字：「無他殺跡證。金融紀錄查無債務。」\n寫完，她把筆蓋蓋回去，又打開，在「查無債務」的下面，畫了一條線。";
  const tail = () => "\n萬主任的黑色休旅車，開出了停車場。欄杆升起來，又放下去。\n小吳把捲尺收進工具箱，經過你的時候，很小聲：「學長，晚上……那個女生，會來這裡。阿姨說的。」\n天快黑了。燈塔的燈，亮了。\n豆花坐在空的停車格前面，對著海，坐了很久。"
    + (EP47_has("zhou_traffic_help") ? "\n你的手機，又響了一次。周振邦：「看完了刪掉。」你沒有刪。" : "");
  EP47.court = {
    title: "望海停車場・4 月 23 日 18:00", scene: "c47_lot", opt:{ dusk:true, gone:true },
    detective: Object.assign({}, SHEN),
    who: ph => ["ye", "wan", "wu"],
    open: ph => "18:00。葉晴站在空的停車格前面，相驗的單子夾在文件夾上，筆蓋沒有拔。\n萬主任站在封鎖線的外面，手機沒有放下。他的黑色休旅車停在入口。小吳蹲在地上，假裝在收捲尺。\n「沈警官。」葉晴說。「你不是承辦人。你現在說的話，我只當作一個路人的意見。」\n「路人，你說。」",
    kindLine: {
      self: "是她自己。",
      killed: "是有人殺了她，再弄成燒炭的樣子。",
      forced: "是有人把她關在車裡，從外面把車封起來。",
      accident: "是意外。她在車裡取暖，睡著了。"
    },
    kindTrue: "（萬主任的手機，放下來了。）\n（葉晴的筆，停在那一格的上面。）\n「根據。」",
    murmur: [ "（海浪的聲音。）", "（小吳把捲尺拉出來，又收回去。）", "（萬主任看了一眼手錶。）" ],
    confess: {}, cornered: {}, deny: {},
    replayText: "你走到空的停車格前面，看著燈塔。從 4 月 20 日的晚上開始——",
    replay: { scene:"c47_lot", opt:{ night:true }, clean:true, cam:"經過重現", date:"2027-04-22", beats:RB },
    get endGood(){ const ms = missing();
      return "萬主任說：「所以，就是欠債，想不開嘛。」\n葉晴沒有看他。「金融紀錄，查無債務。」她說。「萬先生，你在現場說的那一句話，我記下來了。」\n萬主任的臉，紅了一下，又白了。\n" + sign()
        + (ms ? "\n（你沒有講到的那幾樣，是陳葵在電話裡，一份一份補上的。）" : "\n（葉晴把文件夾闔起來。「一份都沒有漏。」她說。）")
        + tail(); },
    get endBad(){ const k = (typeof S !== "undefined" && S && S.result && S.result.pick && S.result.pick.kind) || "";
      return (k === "killed" ? "葉晴搖頭。「入口的鏡頭、繳費機的紀錄，講的是同一件事：那一整夜，進來的只有她。」\n「老錢說，她的身上，一道傷都沒有。」"
          : k === "forced" ? "葉晴搖頭。「膠帶是從裡面貼的。最後一條的撕口，和車上那一捲對得上。」\n「門是從裡面鎖的。鑰匙在她自己的口袋裡。」"
          : k === "accident" ? "葉晴搖頭。「取暖的人，不會把車窗一條一條封起來。」\n「也不會在出門以前，把六十萬轉給女兒。」"
          : "葉晴搖頭。")
        + "\n小吳的聲音很小：「信……是她的字。最後畫了一個太陽。」\n葉晴等了一下，然後拿起了筆。\n" + sign()
        + tail()
        + "\n（這一次，最後的那一段，是他們替你走完的。）"; }
  };

  /* ---------- 走動畫面、地圖、開場 ---------- */
  EP47.fac = { hw:["#d8d0bc", "#c83a2a"], home:["#d8ccb8", "#5a6a7a"] };
  EP47.setting = { sea:"harbour", hw:"town", home:"town" };
  EP47.car = "#7a8a6a";   // 他自己的舊車
  EP47.outScenes = ["c47_gate", "c47_lot", "c47_wall"];
  const SKY47 = [ ["#9aa6ae", "#d4d8d8", "#6e6e6c", "#5e5e5c", 0, 0], ["#c8784a", "#f2cc98", "#7a6a5a", "#6a5a4a", 0, 0] ];
  EP47.worldSky = ph => SKY47[Math.min(ph || 0, SKY47.length - 1)];
  EP47.worldOrder = { sea:["gate", "lot", "wall"], hw:["shop", "counter"], home:["living", "desk", "room"] };
  EP47.roomDesc = {
    gate:"望海停車場的入口。管理亭、欄杆、繳費機。", lot:"停車場的最裡面。B-14。", wall:"堤防。前面是海和燈塔。",
    shop:"順利五金。木炭、膠帶、烤肉爐。", counter:"順利五金的櫃台。",
    living:"周家的客廳。冰箱、沙發、陽台。", desk:"周慧玲的書桌。", room:"昀昀的房間。"
  };
  const rx = (i, x) => 116 + i * 198 + x;
  const say = (who, text, name) => ({ say:[who, text], name });
  EP47.world = {};
  EP47.locations.forEach(l => { EP47.world[l.id] = { auto:true, you:SHEN, order:(EP47.worldOrder || {})[l.id] }; });
  Object.assign(EP47.world.sea, { spawn:rx(0, 40),
    intro: [
      { set:{ px:rx(0, 40), face:1 } },
      say("you", "（入口、停車場、堤防。封鎖線的裡面，你進不去。站在外面，用眼睛走一次。）", "你")
    ],
    labels: [
      { room:"gate", x:34, y:28, text:"望海停車場", size:5, color:"#f4f4ec", bold:true, align:"center" },
      { room:"gate", x:152, y:46, text:"繳費", size:4, color:"#3a3a3e", bold:true, align:"center" }
    ],
    extras: [
      { id:"x47_kui", name:"陳葵", x:rx(1, 176), until:0, L:Object.assign({ gender:"f", skin:"#f0d0b4", hair:"#5a3a2a", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" }, AL("kui") || {}), pose:"inspect", facing:1,
        lines:["（她背對著你，在證物桌上寫標籤。）", "……我沒有看到你。", "（她把筆記本放在桌角，往車子的另外一邊走過去。）"] },
      { id:"x47_dog", name:"豆花", x:rx(2, 76), L:Object.assign({}, DOG), pose:"sit", facing:1,
        lines:["（豆花坐在長椅的旁邊，看著海。）", "（牠用鼻子碰了一下椅背上刻的那一個太陽。）"] }
    ] });
  Object.assign(EP47.world.hw, { spawn:rx(0, 30),
    labels: [ { room:"shop", x:43, y:50, text:"炭火王", size:4, color:"#c83a2a", bold:true, align:"center" } ] });
  Object.assign(EP47.world.home, { spawn:rx(0, 30),
    extras: [
      { id:"x47_hdog", name:"豆花", x:rx(0, 66), L:Object.assign({}, DOG), pose:"lie", facing:1,
        lines:["（豆花趴在沙發旁邊，下巴放在昀昀的腳上。）", "（牠沒有動。昀昀的手，一直放在牠的背上。）"] }
    ] });
  EP47.mapPos = { sea:[176,96,"d"], hw:[110,58,"u"], home:[46,40,"u"] };
  EP47.mapRoads = [["sea","hw"],["hw","home"],["home","sea"]];
  EP47.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 6; x < 150; x += 8) for (let y = 8; y < 84; y += 7){ if ((x * 3 + y) % 5 === 0) continue; R(x, y, 6, 5, "#c8c0b0"); }   // 市區
    const rd = "#d8d4c8";
    R(0, 62, 240, 5, rd); R(108, 30, 5, 34, rd); R(44, 20, 5, 44, rd); R(160, 62, 5, 40, rd); R(160, 98, 40, 4, rd);
    for (let x = 4; x < 240; x += 12) R(x, 64, 6, 1, "#f4f0e0");
    R(0, 106, 240, 29, "#3a6a8a"); R(150, 96, 90, 12, "#3a6a8a"); for (let x = 0; x < 240; x += 6) R(x, 110 + Math.round(Math.sin(t + x / 9)), 4, 1, "#5a8aaa");   // 海
    R(206, 70, 4, 26, "#a8a8a0"); R(204, 66, 8, 4, "#f0ece4"); R(205, 62, 6, 4, "#c83a2a");   // 燈塔
    R(168, 88, 28, 8, "#6e6e6c"); R(168, 88, 28, 1, "#e8e8e0");   // 望海停車場
    R(100, 48, 20, 8, "#d8d0bc"); R(100, 48, 20, 2, "#c83a2a");   // 順利五金
    R(36, 30, 18, 10, "#d8ccb8"); R(36, 30, 18, 2, "#5a6a7a");   // 港西街
  };
})();
