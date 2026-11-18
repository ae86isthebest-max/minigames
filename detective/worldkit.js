/* =========================================================
   worldkit.js：讓每個地點都變成可以走動的畫面
   - autoWorld(l)：把一個地點的房間（C.rooms）排成一整排剖面建築，
     房間裡的證物、小細節、人物位置都自動換算成走動場景的座標
   - 天色：依天數變化（C.worldSky 可以自訂）
   - 區域地圖：像素畫地圖，點地點，警車開過去
   - 早上的簡報：每天第一次到出發地點時，小吳把當天的事講一遍
   用到 index.html 裡的共用函式（roomsOf、roomOpen、allItems、S、C……）
   ========================================================= */
const WK = (() => {
  const OY = 26, GAP = 6, SX = 116, G = 124, RW = 192;
  // 會自己畫天空的戶外場景：不畫外牆
  const OUT0 = new Set(["care", "vgarden", "farm", "backyard", "pool", "courtyard", "road"]);
  // 案件可以用 C.outScenes 加上自己的戶外場景
  const OUT = { has: s => OUT0.has(s) || ((typeof C !== "undefined" && C && C.outScenes) || []).includes(s) };
  // 天色：[上, 下, 遠山, 近山, 雨(0 沒有 1 小雨 2 大雨), 夜晚]
  const SKY = [
    ["#0b0f1c", "#27324a", "#18241f", "#1d2c25", 2, 1],
    ["#5e6b78", "#a9b4ba", "#3e5a44", "#4a6a50", 0, 0],
    ["#6fa0d0", "#cfe3ee", "#4f7a4a", "#5f8a5a", 0, 0],
    ["#56606a", "#8c969c", "#3a5040", "#465c4a", 1, 0],
    ["#7a90a8", "#c6d2da", "#4a6a50", "#5a7a5a", 0, 0],
    ["#3a3a5a", "#e09a6a", "#2a3a3a", "#3a4a40", 0, 0]
  ];
  const skyOf = ph => C.worldSky ? C.worldSky(ph) : SKY[Math.min(ph || 0, SKY.length - 1)];
  // 建築外牆顏色：[牆, 招牌]
  const FAC = { police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], hospital:["#eef0ee","#2f7a6a"], shark:["#4a3a36","#ff4a8a"],
    lawyer:["#7a6a5a","#3a2a1a"], shop:["#8a6a42","#5a2a1e"], care:["#e4d8c0","#b45a3a"], office:["#8a96a2","#2a3a5a"], taipei:["#c8ccd0","#d23a3a"], _:["#e9e2d0","#5a3e24"] };
  const SETTING = { shop:"village", care:"village", office:"city", taipei:"city", hospital:"city", _:"villa" };

  // 房間畫面先畫好存起來（每一格重畫太慢）
  const cache = {};
  function roomImg(scene, opt){
    const k = scene + "|" + JSON.stringify(opt);
    if (cache[k]) return cache[k];
    const c = document.createElement("canvas"); PX.draw(c, scene, opt);
    if (!OUT.has(scene)) texture(c);
    return cache[k] = c;
  }
  // 室內質感：牆面細細的斑駁＋牆角、天花板的陰影（看起來比較有立體感，不會一片平）
  function texture(c){
    const g = c.getContext("2d"), W = c.width, H = c.height, d = g.getImageData(0, 0, W, H), px = d.data;
    let sd = 7;
    const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
      const i = (y*W + x) * 4; let f = 1;
      const r = rnd(); if (r < 0.06) f -= 0.07; else if (r < 0.09) f += 0.05;          // 斑駁
      if (y < 5) f -= (5 - y) * 0.035;                                                  // 天花板陰影
      if (x < 4) f -= (4 - x) * 0.03; if (x > W - 5) f -= (x - (W - 5)) * 0.03;           // 兩邊牆角
      if (y > H - 22 && y < H - 18) f -= 0.05;                                          // 牆腳和地板交界
      px[i] = Math.max(0, Math.min(255, px[i] * f)); px[i+1] = Math.max(0, Math.min(255, px[i+1] * f)); px[i+2] = Math.max(0, Math.min(255, px[i+2] * f));
    }
    g.putImageData(d, 0, 0);
  }
  // 戶外場景：把它自己的天空挖掉，改用這個地點當天的天色（下雨天就不會出現晴天的天空）
  // 只挖「天空」：海、遠山、偏藍偏灰的牆都要留著。to＝從第幾排開始一律不挖（C.skyTo[場景名]；自動判斷不準的時候才需要寫）
  function noSky(src, to){
    if (src._ns) return src._ns;
    const c = document.createElement("canvas"); c.width = src.width; c.height = src.height;
    const g = c.getContext("2d"); g.drawImage(src, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height), px = d.data, W = c.width, H = c.height;
    const A0 = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) A0[i] = px[i*4 + 3] ? 1 : 0;   // 原本就有畫東西的地方
    const at = (x, y) => (px[(y*W + x)*4] << 16) | (px[(y*W + x)*4 + 1] << 8) | px[(y*W + x)*4 + 2];
    const dist = (a, b) => Math.abs((a>>16) - (b>>16)) + Math.abs(((a>>8)&255) - ((b>>8)&255)) + Math.abs((a&255) - (b&255));
    const blue = v => (v & 255) >= (v >> 16), lum = v => ((v >> 16) * 3 + ((v >> 8) & 255) * 6 + (v & 255)) / 10;
    // 每一排最多的顏色
    const dom = [];
    for (let y = 0; y < H; y++){ const n = {}; let best = 0, bc = 0; for (let x = 0; x < W; x++){ const v = at(x, y); n[v] = (n[v]||0) + 1; if (n[v] > best){ best = n[v]; bc = v; } } dom.push(best > W * 0.25 ? bc : -1); }
    // 哪幾排「最多的顏色」真的是天空（ref）：從最上面往下，顏色要接得上才算——
    // 跟上一排天空差不多（漸層一點一點變；中間隔著招牌、屋頂的話放寬一點）、出現過的天空顏色、或是緊貼著天空而且比較亮的一條（地平線的霧）。
    // 接不上的（rej）＝海、遠山、牆：忽然變暗、忽然變成別的顏色，或是漸層的天空下面忽然一大片同一個顏色（晚上的海）
    const end = Math.min(H, to === undefined ? H : to);
    const ref = new Array(H).fill(-1), rej = new Array(H).fill(-1), seen = [], bad = [], hist = [];
    let last = -1, lastY = -1;
    for (let y = 0; y < end; y++){ const r = dom[y]; if (r < 0 || !blue(r)) continue;
      let ok = last < 0;
      if (!ok && !bad.some(q => dist(q, r) < 4)){
        const gap = y - lastY - 1, grad = new Set(hist.slice(-8)).size >= 4;
        ok = dist(r, last) < 18 + (grad ? Math.min(30, 5 * gap) : 0) || (gap <= 1 && lum(r) > lum(last) && (lum(r) >= 160 || dist(r, last) < 26)) || seen.some(q => dist(q, r) < 4);
        if (ok && grad && r !== last){ let n = 1; while (dom[y + n] === r) n++; if (n >= 6) ok = false; }
      }
      if (ok){ ref[y] = r; if (r !== last) seen.push(r); last = r; lastY = y; hist.push(r); } else { rej[y] = r; bad.push(r); }
    }
    const near = (a, b) => b >= 0 && dist(a, b) < 18;
    const land = (v, y) => rej[y] >= 0 && dist(v, rej[y]) < 4;
    const sky = (x, y) => { const v = at(x, y); return (near(v, ref[y]) || (y && near(v, ref[y-1])) || near(v, ref[y+1] ?? -1)) && blue(v) && !land(v, y); };
    // 天空是漸層：跟正上方那一格天空幾乎同色（而且偏藍）的也是天空。
    // 這樣就算那一排大部分是房子或山（天空不是最多的顏色），房子旁邊也不會留下一塊沒去掉的天空
    const lim = Math.min(H * 0.75, end), real = new Uint8Array(W * H);   // real＝真的當成天空挖掉的（不含夾在中間一起挖掉的雨滴）
    for (let x = 0; x < W; x++){ let up = -1;
      for (let y = 0; y < lim; y++){
        const v = at(x, y);
        if (!sky(x, y) && !(up >= 0 && blue(v) && dist(v, up) < 7 && !land(v, y))){
          // 中間夾著雨滴之類的幾個點也算天空，碰到真的不是天空的東西就停
          let k = 1; while (k <= 6 && y + k < end && !sky(x, y + k)) k++; if (k > 6 || y + k >= end) break; for (let j = 0; j < k; j++) px[((y+j)*W + x)*4 + 3] = 0; y += k - 1; up = -1; continue; }
        px[(y*W + x)*4 + 3] = 0; up = v; real[y*W + x] = 1;
      }
    }
    // 招牌、屋簷正下方的一小塊天空（上面被擋住，直的掃不到）：跟同一排挖掉的天空同一個顏色、夠厚（3×3 以上，細線不算）、
    // 而且從旁邊連得到已經挖掉的天空或畫面左右邊，才補挖。被框住的（例如跟天空同色的窗戶）連不到，不會動
    const st = new Uint8Array(W * H), thick = new Uint8Array(W * H), q = [];   // st：1＝已經挖掉 2＝候選
    for (let y = 0; y < lim; y++){ const cs = new Set(); for (let x = 0; x < W; x++){ const i = y*W + x; if (A0[i] && !px[i*4 + 3]){ st[i] = 1; if (real[i]) cs.add(at(x, y)); } }
      const cl = [...cs]; if (cl.length) for (let x = 0; x < W; x++){ const i = y*W + x; if (!A0[i] || st[i]) continue; const v = at(x, y); if (blue(v) && !land(v, y) && cl.some(cc => dist(v, cc) < 4)) st[i] = 2; } }
    for (let y = 0; y + 2 < lim; y++) for (let x = 0; x + 2 < W; x++){ let all = true; for (let j = 0; j < 3 && all; j++) for (let i = 0; i < 3; i++) if (!st[(y+j)*W + x + i]){ all = false; break; } if (all) for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) thick[(y+j)*W + x + i] = 1; }
    for (let i = 0; i < W * H; i++) if (st[i] === 1) q.push(i);
    for (let y = 0; y < lim; y++) [0, W - 1].forEach(x => { const i = y*W + x; if (st[i] === 2 && thick[i]){ st[i] = 1; px[i*4 + 3] = 0; q.push(i); } });
    while (q.length){ const i = q.pop(), x = i % W, y = (i - x) / W;
      [[x-1, y], [x+1, y], [x, y-1], [x, y+1]].forEach(([nx, ny]) => { if (nx < 0 || nx >= W || ny < 0 || ny >= lim) return; const j = ny*W + nx;
        if (st[j] !== 2 || !thick[j]) return; st[j] = 1; px[j*4 + 3] = 0; q.push(j); }); }
    g.putImageData(d, 0, 0);
    c._left = st.reduce((n, v) => n + (v === 2), 0);   // 還留著的「跟天空同色」的格子數（給 tools/outscenes.js 看）
    c._end = 0; for (let i = W * lim - 1; i >= 0; i--) if (st[i] === 1){ c._end = Math.floor(i / W) + 1; break; }   // 挖掉的天空最低到第幾排（海邊背景的海平線不可以比它高）
    { const sr = rej.find(v => v >= 0 && (v & 255) - (v >> 16) >= 16); c._sea = sr === undefined ? null : "#" + sr.toString(16).padStart(6, "0"); }   // 場景自己畫的海是什麼顏色（海邊背景跟著用，兩邊才接得起來）
    c._land = rej.findIndex(v => v >= 0);              // 第一排「不是天空」的大片顏色（海平線、山、牆頂），沒有＝-1
    return src._ns = c;
  }
  // 把一張圖染上一層顏色（透明的地方不染）
  function tinted(src, col, a){
    const k = col + "|" + a; src._tint = src._tint || {}; if (src._tint[k]) return src._tint[k];
    const c = document.createElement("canvas"); c.width = src.width; c.height = src.height;
    const g = c.getContext("2d"); g.drawImage(src, 0, 0); g.globalCompositeOperation = "source-atop"; g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
    return src._tint[k] = c;
  }
  const roomOpt = r => ({ ...(typeof r.opt === "function" ? r.opt(S.phase, has) : (r.opt || {})), phase:S.phase });

  /* ---------- 背景 ---------- */
  function backdrop(p, t, ph, cam, w, setting, seaY, seaCol){
    const { R, P, mix } = p, [top, bot, h1, h2, , night] = skyOf(ph);
    for (let y = 0; y < 104; y += 2) R(cam - 2, y, 246, 2, mix(top, bot, y / 104));
    if (night){ p.seed(4); for (let i = 0; i < 26; i++) P(cam + p.rnd() * 240, p.rnd() * 40, "#c9d4e8"); }
    if (setting === "village" || setting === "villa"){
      for (let x = 0; x < 248; x += 2){ const wx = x + cam * 0.5; const h = 56 + Math.sin(wx / 41) * 9 + Math.sin(wx / 15) * 3; R(cam + x - 4, h, 2, 80 - h + 40, h1); }
      for (let x = 0; x < 248; x += 2){ const wx = x + cam * 0.7; const h = 76 + Math.sin(wx / 27) * 5; R(cam + x - 4, h, 2, 60, h2); }
      for (let x = Math.floor(cam / 23) * 23 - 23; x < cam + 260; x += 23){ const s = (x * 7) % 5; R(x + 4, 96 - s, 3, 28 + s, mix(h2, "#000", .4)); R(x - 2, 86 - s, 15, 12, mix(h2, "#000", .2)); R(x, 82 - s, 11, 5, mix(h2, "#000", .15)); }
    } else if (setting === "coast"){
      // 海邊：遠方只有海平線和一小段低低的岬角，沒有高樓（海平線上不會冒出大樓）。
      // seaY＝海平線畫在哪裡：要比這個地點每個戶外場景挖掉的天空都低，才不會從場景的天空裡看到第二條海平線
      const hy = seaY || 86, mid = mix(top, bot, .6), n = parseInt(mid.slice(1), 16), dark = ((n >> 16) * 3 + ((n >> 8) & 255) * 6 + (n & 255)) / 10 < 70;
      const wet = skyOf(ph)[4], sea = seaCol ? (night ? mix(seaCol, "#0b0f1c", .45) : wet ? mix(seaCol, bot, .22) : seaCol) : dark ? mix(mid, "#0a2a48", .55) : mix(mix("#2f5f82", mid, .2), bot, wet ? .22 : 0), land = mix(h1, mid, .4), cape = wx => Math.round(Math.sin(wx / 67) * 8 + Math.sin(wx / 23) * 2 - 3);   // 海的顏色：這個地點的場景自己畫了海就用同一個顏色（染色也一樣），沒有就跟著當天的天色（晴天藍、陰天下雨偏灰、晚上暗）
      for (let x = 0; x < 248; x += 2){ const hh = cape(x + cam * 0.3); if (hh > 0) R(cam + x - 4, hy - hh, 2, hh, land); }
      if (dark) for (let i = Math.floor(cam * 0.3 / 31) - 1; i < (cam * 0.3 + 260) / 31; i++){ const wx = i * 31 + 9; if (i % 2 && cape(wx) > 3) P(wx - cam * 0.3 + cam - 4, hy - 2, "#ffd98a"); }   // 岬角上的幾點燈火
      R(cam - 2, hy, 246, G - hy, sea); R(cam - 2, hy, 246, 1, mix(sea, bot, .4));
      for (let i = Math.floor(cam * 0.8 / 29) - 1; i < (cam * 0.8 + 260) / 29; i++) R(i * 29 - cam * 0.8 + cam + ((i * 13) % 11), hy + 4 + ((i * 7) % 5) * 5, 5, 1, mix(sea, "#ffffff", dark ? .1 : .25));
    } else {
      const tall = setting === "city";
      for (let i = Math.floor(cam * 0.6 / 19) - 1; i < (cam * 0.6 + 260) / 19; i++){
        const bx = i * 19 - cam * 0.6 + cam, hh = (tall ? 40 : 18) + ((i * 37) % 7) * (tall ? 8 : 5);
        const c = mix(h1, night ? "#0a0e18" : "#8a96a2", .55);
        R(bx, 104 - hh, 17, hh + 20, c);
        for (let y = 104 - hh + 4; y < 100; y += 6) for (let x = 3; x < 15; x += 5) if ((i + y + x) % 3) R(bx + x, y, 3, 3, night ? "#ffd98a" : mix(c, "#e9f2f8", .35));
      }
    }
    // 地面
    R(0, G, w, 11, setting === "villa" || setting === "village" ? "#3a352c" : "#3a3a3e"); R(0, G, w, 1, "#1a1816");
    if (setting === "town" || setting === "city" || setting === "coast") for (let x = 6; x < w; x += 20) R(x, G + 6, 10, 1, "#c9c9a0");
    // 路燈
    for (let x = 40; x < w; x += 170){ R(x, 78, 2, 46, "#4a4e54"); R(x - 4, 76, 8, 3, "#4a4e54"); R(x - 3, 79, 6, 2, night ? "#ffe8a0" : "#cfd6d6"); if (night) p.dither(x - 10, 81, 22, 42, "#ffe8a0", 4); }
  }

  // 雨：室內（看得到裡面的建築）不下雨
  function drawRain(p, t, rain, cam){
    for (let i = 0; i < (rain > 1 ? 120 : 45); i++){
      const x = cam + ((i * 37 + t * 30) % 252) - 6, y = (i * 53 + t * (rain > 1 ? 230 : 120)) % 140 - 4;
      if (WORLD.indoor(x, y + 2) > 0.5) continue;
      p.R(x, y, 1, rain > 1 ? 4 : 3, "#8fa4b8");
    }
  }

  /* ---------- 自動建出一個地點的走動場景 ---------- */
  function autoWorld(l, o = {}){
    let rooms = roomsOf(l).filter(roomOpen);
    if (o.order) rooms = o.order.map(id => rooms.find(r => r.id === id)).filter(Boolean).concat(rooms.filter(r => !o.order.includes(r.id)));
    const first = roomsOf(l)[0].id, pos = {};
    let x = SX;
    rooms.forEach(r => { pos[r.id] = x; x += RW + GAP; });
    // street:false（EPn.world[地點].street = false）：這個地點只有室內，沒有街道。不能走到建築外面、鏡頭不會照到外面、
    // 沒有「街上」這一區、門口沒有「出去」的牌子、沒有停著的車；進來就站在第一個房間裡。房間的位置不變。
    const noStreet = o.street === false;
    const w = x - GAP + (noStreet ? GAP : 70);
    const spots = {}, details = {};
    allItems().filter(it => (it.loc || "_") === l.id && it.hot).forEach(it => {
      const ox = pos[it.room || first]; if (ox === undefined) return;
      spots[it.id] = [ox + it.hot[0], OY + it.hot[1], it.hot[2], it.hot[3]];
    });
    Object.assign(spots, o.spots || {});          // 個別地點可以把證物搬到別的位置（例如停在店外的車）
    rooms.forEach(r => (r.details || []).forEach(d => { details[d.id] = [pos[r.id] + d.hot[0], OY + d.hot[1], d.hot[2], d.hot[3]]; }));
    const setting = o.setting || (C.setting || {})[l.id] || SETTING[l.id] || "town", fac = (C.fac || {})[l.id] || FAC[l.id] || FAC.police;
    // 人站的位置只看劇本（C.daily 的 room／x）；「不要疊在一起」交給 index.html 的 spreadPeople（連員警、鑑識人員一起排）
    const placeFor = (s) => {
      const d = dailyOf(s), room = d.room && pos[d.room] !== undefined ? d.room : rooms[0].id;
      let px = pos[room] + (d.x !== undefined ? d.x : 60);
      return { x:px, pose:d.pose, facing:d.facing };
    };
    function draw(p, t, op, cam, g){
      const { R, shade, windowBox } = p, ph = op.phase || 0, night = skyOf(ph)[5];
      let seaY = 0, seaCol = null; const bluer = c => { const n = parseInt(c.slice(1), 16); return (n & 255) - (n >> 16); };
      if (setting === "coast") rooms.forEach(r => { if (!OUT.has(r.scene)) return; const ns = noSky(roomImg(r.scene, { ...roomOpt(r), ...((o.ropt || {})[r.id] || {}) }), (C.skyTo || {})[r.scene]); seaY = Math.max(seaY, OY + ns._end); if (ns._sea && (!seaCol || bluer(ns._sea) > bluer(seaCol))) seaCol = ns._sea; });   // 幾個場景都有海：用最藍的那個（不會挑到偏藍的白牆）
      backdrop(p, t, ph, cam, w, setting, seaY ? Math.min(104, Math.max(70, seaY)) : 0, seaCol);
      if (o.drawBefore) o.drawBefore(p, t, op, cam);
      rooms.forEach((r, i) => {
        const ox = pos[r.id];
        if (ox > cam + 250 || ox + RW < cam - 10) return;
        const img = roomImg(r.scene, { ...roomOpt(r), ...((o.ropt || {})[r.id] || {}) }); p.ctx(g);
        if (OUT.has(r.scene)){
          // 陰天、下雨、晚上：場景跟著變暗（只染畫了東西的地方，不會在天空上留下一個方塊）；左右兩邊用樹籬接到背景，不會一刀切
          const sk = skyOf(ph);
          const ns = noSky(img, (C.skyTo || {})[r.scene]);
          const im2 = sk[4] || sk[5] ? tinted(ns, sk[5] ? "#0b0f1c" : sk[1], sk[5] ? 0.45 : 0.22) : ns;
          g.drawImage(im2, 0, 0, RW, 20, ox, 0, RW, OY + 20); g.drawImage(im2, 0, 20, RW, 88, ox, OY + 20, RW, 88);
          [ox - 3, ox + RW - 4].forEach(hx => { R(hx, 66, 7, G - 66, shade(sk[3], -.25)); R(hx - 1, 62, 9, 6, shade(sk[3], -.1)); for (let y = 70; y < G; y += 7) R(hx + 1 + (y % 3), y, 2, 2, shade(sk[3], .15)); });
          return;
        }
        // 外牆（二樓）＋屋頂
        R(ox - GAP, 3, RW + GAP * 2, OY - 3, fac[0]); R(ox - GAP - 3, 0, RW + GAP * 2 + 6, 4, shade(fac[0], -.45));
        for (let k = 0; k < 6; k++) if (!(i === 0 && (k === 2 || k === 3))) windowBox(ox + 10 + k * 31, 9, 14, 11, night ? ((k + i) % 3 ? "#ffd98a" : "#1a2030") : "#9cc5e6");
        if (i === 0){ // 招牌
          R(ox + 66, 6, 62, 14, fac[1]); R(ox + 66, 6, 62, 1, shade(fac[1], .3)); R(ox + 66, 19, 62, 1, shade(fac[1], -.4));
          if (l.id === "hospital"){ R(ox + 72, 9, 8, 2, "#e04a3a"); R(ox + 75, 7, 2, 6, "#e04a3a"); }
          if (l.id === "police"){ R(ox + 72, 8, 6, 6, "#f2d03b"); R(ox + 74, 7, 2, 8, "#f2d03b"); }
        }
        g.drawImage(img, ox, OY);
        // 房間之間的牆（下面是門口）
        const wall = shade(fac[0], -.3);
        [ox - GAP, ox + RW].forEach(wx => { R(wx, OY, GAP, 98 - 32, wall); R(wx, G - 32, GAP, 32, "#14100c"); R(wx, G - 33, GAP, 1, shade(wall, -.3)); });
      });
      // 建築最左、最右的外牆
      const ins = rooms.filter(r => !OUT.has(r.scene));
      if (ins.length){
        const a = pos[ins[0].id] - GAP, b = pos[ins[ins.length - 1].id] + RW;
        R(a - 2, OY, 4, 98 - 32, shade(fac[0], -.5)); R(b + GAP - 2, OY, 4, 98 - 32, shade(fac[0], -.5));
      }
      if (noStreet){ R(SX - GAP - 400, 0, 400, 135, "#0c0a08"); R(w, 0, 400, 135, "#0c0a08"); }   // 建築外面全部塗黑
      if (o.drawAfter) o.drawAfter(p, t, op, cam);
    }
    function front(p, t, op, cam){
      const rain = skyOf(op.phase || 0)[4];
      if (rain) drawRain(p, t, rain, cam);
    }
    // 室內的房間連在一起就是一棟建築：在外面只看得到外牆
    const buildings = [], shade = PX.prim.shade;
    rooms.forEach(r => { if (OUT.has(r.scene)) return; const a = pos[r.id] - GAP, b = pos[r.id] + RW + GAP, last = buildings[buildings.length-1];
      if (last && Math.abs(last.x1 - a) < GAP + 1) last.x1 = b; else buildings.push({ x0:a, x1:b }); });
    const signText = l.sign || l.name.replace(/（.*?）|\(.*?\)/g, "").replace(/・.*/, "");
    const fs = Math.min(7, 60 / Math.max(3, signText.length));
    buildings.forEach((b, i) => Object.assign(b, {
      labels: i ? [] : [ { x: b.x0 + GAP + 100, y: 38.5, text: signText, size: fs, when:"out" }, { x: b.x0 + GAP + 101, y: 13.5, text: signText, size: Math.min(6.5, fs), when:"in" } ], y0:4, wall:fac[0], roof:shade(fac[0], -.5), brick: setting !== "city", rows:[8, 88], door:"#5a3e24",
      night: op => skyOf(op.phase||0)[5],
      sign: i ? null : (p) => { const { R, shade } = p, ox = b.x0 + GAP; R(ox + 60, 30, 72, 16, fac[1]); R(ox + 60, 30, 72, 1, shade(fac[1], .3)); R(ox + 60, 45, 72, 1, shade(fac[1], -.4));
        if (l.id === "hospital"){ R(ox + 66, 35, 8, 2, "#e04a3a"); R(ox + 69, 32, 2, 8, "#e04a3a"); }
        if (l.id === "police"){ R(ox + 66, 33, 6, 6, "#f2d03b"); R(ox + 68, 32, 2, 8, "#f2d03b"); }
        // 一樓頭兩扇窗下面的花台（以前是一條橫跨兩扇窗的條紋，擋住半扇窗，看起來像畫錯）
        [12, 42].forEach(wx => { R(ox + wx - 3, 104, 18, 4, shade(fac[1], -.1)); R(ox + wx - 3, 104, 18, 1, shade(fac[1], .25)); R(ox + wx - 3, 107, 18, 1, shade(fac[1], -.4));
          for (let k = 0; k < 6; k++){ R(ox + wx - 2 + k*3, 102, 2, 2, k % 2 ? "#4f7f46" : "#3f6b3a"); if (k % 3 === 1) R(ox + wx - 2 + k*3, 101, 1, 1, "#f2d6dc"); } }); }
    }));
    // 每個房間第一次走進去說的話（C.roomDesc[房間 id]），街上也說一句
    const areas = rooms.map(r => ({ id:r.id, name:r.name, x0:pos[r.id] - GAP, x1:pos[r.id] + RW - 1, text:(C.roomDesc || {})[r.id] || `${r.name}。看起來沒什麼特別的。` }));
    if (buildings.length && !noStreet) areas.push({ id:"_street", x0:0, x1:buildings[0].x0 - 1, text:"街上。這裡沒什麼特別的。" });
    if (noStreet){ buildings.forEach(b => { b.doors = [false, false]; });
      return { auto:true, areas, w, minX:SX - GAP, spawn:o.spawn || SX + 60, park:undefined, draw, front, spots, details, placeFor, buddy:o.buddy, car:false, you:o.you, intro:o.intro, rooms, pos, buildings, extras:o.extras }; }
    return { auto:true, areas, w, spawn:o.spawn || 70, park:o.park ?? 8, draw, front, spots, details, placeFor, buddy:o.buddy, car:o.car, you:o.you, intro:o.intro, rooms, pos, buildings, extras:o.extras };
  }

  /* ---------- 早上的簡報：小吳把今天的事講一遍 ---------- */
  const strip = s => String(s).replace(/<[^>]+>/g, "");
  function chunks(text, n = 46){
    const out = [];
    strip(text).split(/\n+/).forEach(line => {
      let buf = "";
      line.split(/(?<=[。！？」])/).forEach(s => { if (buf && (buf + s).length > n){ out.push(buf); buf = ""; } buf += s; });
      if (buf.trim()) out.push(buf);
    });
    return out;
  }
  function morning(def, buddyName){
    const p = PH(), i = S.phase, steps = [{ set:{ px:def.spawn, bx:def.spawn - 20, face:1 } }];
    const say = (who, text) => steps.push({ say:[who, text], name: who === "you" ? "你" : buddyName });
    say("wu", `${p.title}。`);
    (p.intro || []).forEach(x => chunks(x).forEach(c => say("wu", c)));
    (p.reports || []).forEach(r => { say("wu", `報告：${r.title}`); chunks(r.text).forEach(c => say("wu", c)); });
    (C.events || []).filter(e => S.ev[e.id] === i).forEach(e => { say("wu", `出事了：${e.title}`); chunks(e.text).forEach(c => say("wu", c)); });
    tests().filter(t => S.labq[t.id] !== undefined && S.labq[t.id] + t.days === i).forEach(t => { say("wu", `化驗結果出來了：${t.title}`); chunks(t.text).forEach(c => say("wu", c)); });
    // 最後一句提示：phases[n].tip = "字" 換成自己的話；tip:false 不說（例如這一段只能待在一個地方）
    if (p.tip !== undefined){ if (p.tip) chunks(p.tip).forEach(c => say("wu", c)); }
    else if (travel()) say("wu", p.clock ? `${PW.now} ${p.clock.start} 到 ${p.clock.end} 可以調查。開車要花時間，越遠越久。要去別的地方，就點左上角的「地圖」。` : `${PW.now}有 ${p.actions} 個行動點。要去別的地方，就點左上角的「地圖」。`);
    return steps;
  }
  function arrive(def){
    const c = WORLD.carOf(def);   // 車的樣子：見 world.js 的 carOf（false＝走路來：從畫面左邊走進來）
    if (!c) return [ { set:{ px:10, bx:-10, cam:0, face:1 } }, { walk:["you", def.spawn] } ];
    return [ { set:{ px:-70, bx:-90, cam:0 }, hide:true }, { car:[-60, def.park ?? 8, 1.4], hide:true }, { set:{ px:def.spawn, bx:def.spawn - 20, face:1 } } ];
  }

  /* ---------- 區域地圖 ---------- */
  const MW = 240, MH = 135;
  function drawMap(cv, from, onFrame){
    cv.width = MW; cv.height = MH;
    const g = cv.getContext("2d"), p = PX.prim, { R, P, mix, shade, dither } = p;
    const pos = C.mapPos || {}, roads = C.mapRoads || [];
    const pt = id => pos[id] || [120, 70];
    let anim = null;
    function line(a, b, c, wdt = 2){ const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.5); for (let i = 0; i <= n; i++){ const k = i / n; const x = a[0] + (b[0] - a[0]) * k + Math.sin(k * 6 + a[0]) * 2, y = a[1] + (b[1] - a[1]) * k; R(x, y, wdt, wdt, c); } }
    function frame(now){
      if (!cv.isConnected) return;
      p.ctx(g); g.setTransform(1, 0, 0, 1, 0, 0);
      const t = now / 1000, night = skyOf(S.phase)[5];
      // 地形（案件可以用 C.mapDraw 自己畫）
      if (C.mapDraw) C.mapDraw(p, t); else {
      R(0, 0, MW, MH, "#6f9a5a"); dither(0, 0, MW, MH, "#7aa866", 3);
      p.seed(7); for (let i = 0; i < 70; i++){ const x = p.rnd() * 110, y = 50 + p.rnd() * 85; R(x, y, 9, 5, "#3f6b3a"); R(x + 2, y - 2, 5, 2, "#4f7f46"); }   // 西南的山（鹿谷）
      for (let i = 0; i < 40; i++){ const x = 180 + p.rnd() * 60, y = 60 + p.rnd() * 70; R(x, y, 9, 5, "#3f6b3a"); R(x + 2, y - 2, 5, 2, "#4f7f46"); }   // 東邊的山（埔里）
      for (let y = 0; y < MH; y += 2){ const x = 150 + Math.sin(y / 14) * 12 - y * 0.55; R(x + Math.sin(t + y / 9) * 0.6, y, 6, 2, "#4a86b4"); R(x + 1, y, 2, 1, "#8ac0e0"); }   // 河
      R(92, 64, 70, 46, "#b8b0a0"); for (let x = 96; x < 160; x += 9) for (let y = 68; y < 108; y += 8) R(x, y, 6, 5, "#d6d0c2");    // 南投市
      R(180, 12, 58, 44, "#b0aaa0"); for (let x = 183; x < 236; x += 8) for (let y = 15; y < 54; y += 7) R(x, y, 5, 4, "#cfc9bc");   // 台中
      }
      roads.forEach(([a, b]) => { line(pt(a), pt(b), "#4a4038", 3); line(pt(a), pt(b), "#e9d9a0", 1); });
      // 地點
      const open = C.locations.filter(locOpen);
      C.locations.forEach(l => {
        const [x, y] = pt(l.id), isOpen = open.includes(l), known = mapKnown(l);
        if (!known) return;
        const f = (C.fac || {})[l.id] || FAC[l.id] || ["#e9e4da", "#5a3e24"];
        R(x - 6, y - 7, 12, 8, isOpen ? f[0] : "#8a8a8a"); R(x - 7, y - 9, 14, 3, isOpen ? f[1] : "#5a5a5a"); R(x - 1, y - 4, 3, 5, "#3a2a1a");
        if (here(l.id)){ const b = Math.floor(t * 3) % 2; R(x - 2, y - 17 - b, 5, 4, "#ffd04a"); R(x - 1, y - 13 - b, 3, 2, "#ffd04a"); }
      });
      if (C.mapExtra) C.mapExtra(p, t);
      // 車
      let car = pt(from);
      if (anim){ const k = Math.min(1, (now - anim.t0) / anim.d), e = 1 - (1 - k) * (1 - k); car = [anim.a[0] + (anim.b[0] - anim.a[0]) * e, anim.a[1] + (anim.b[1] - anim.a[1]) * e]; if (k >= 1){ const cb = anim.cb; anim = null; cb(); } }
      // 地圖上的車跟整集的設定（C.car）：不寫＝巡邏車（會閃燈）；顏色＝那個顏色的車，不閃燈；false＝灰色的車，不閃燈
      const mc = C.car === undefined ? WORLD.PATROL : C.car || "#9a9a94";
      R(car[0] - 4, car[1] - 1, 9, 4, "#14100c"); R(car[0] - 3, car[1], 7, 2, mc); R(car[0] - 1, car[1] - 1, 3, 1, mc === WORLD.PATROL ? (Math.floor(t * 6) % 2 ? "#e04a3a" : "#3a6ae0") : PX.prim.shade(mc, -.25));
      if (night){ g.fillStyle = "rgba(10,14,40,.45)"; g.fillRect(0, 0, MW, MH); }
      onFrame && onFrame();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return { drive(to, cb){ const a = pt(from), b = pt(to); from = to; anim = { a, b, t0:performance.now(), d:Math.min(1400, 500 + Math.hypot(b[0] - a[0], b[1] - a[1]) * 9), cb }; } };
  }

  return { autoWorld, morning, arrive, drawMap, drawRain, chunks, skyOf, SKY, OY, G, noSky };
})();
