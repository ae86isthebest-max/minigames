/* =========================================================
   新人物畫法（俯視版用）：大頭、深色外框、衣服有光暗，逐格動作
   - 每個人一格 72×56（躺下也放得下），腳底中央在 (36, 53)
   - 方向：side（側面，facing 1 向右／-1 向左）、front（正面）、back（背面）
   - 動作用「骨架角度」寫，每一格算好再畫，所以每一格都是同一個人、不會走樣
   - 畫好的格會記住（快取），同一個人同一格只畫一次
   用法：SP.draw(ctx, x, y, look, { view, facing, act, f })   (x, y)＝腳底中央
        look 跟舊的一樣：{ skin, hair, hairStyle, top, coat, bottom, shoes, hat, ... }
   ========================================================= */
const SP = (() => {
  const W = 72, H = 56, RX = 36, RY = 53;
  const OUT = [26, 20, 18];                         // 外框顏色（很深的咖啡色，不是純黑）
  const hex = h => { h = (h || "#888").replace("#", ""); if (h.length === 3) h = h.split("").map(c => c + c).join(""); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const mul = (c, k) => c.map(v => Math.max(0, Math.min(255, Math.round(v * k))));
  const D2R = Math.PI / 180;

  /* ---------- 一層畫布（48×48，每格一個顏色或空） ---------- */
  function layer(){ return { px: new Array(W * H).fill(null) }; }
  function put(L, x, y, c){ x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) L.px[y * W + x] = c; }
  function rect(L, x, y, w, h, c){ for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(L, x + i, y + j, c); }
  // 粗線：沿著線一格一格蓋方塊（手腳）
  function seg(L, a, b, w, c){
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2));
    for (let k = 0; k <= n; k++){ const x = a[0] + (b[0] - a[0]) * k / n, y = a[1] + (b[1] - a[1]) * k / n;
      const x0 = Math.round(x - (w - 1) / 2), y0 = Math.round(y - (w - 1) / 2); rect(L, x0, y0, w, w, c); }
  }
  function poly(L, pts, c){
    const ys = pts.map(p => p[1]), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
    for (let y = y0; y <= y1; y++){ const xs = [], yy = y + 0.5;
      for (let i = 0; i < pts.length; i++){ const p = pts[i], q = pts[(i + 1) % pts.length];
        if ((p[1] <= yy && q[1] > yy) || (q[1] <= yy && p[1] > yy)) xs.push(p[0] + (yy - p[1]) / (q[1] - p[1]) * (q[0] - p[0])); }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.round(xs[i]); x < Math.round(xs[i + 1]); x++) put(L, x, y, c); }
  }
  // 文字格（頭）：每個字是一種顏色，"." 是空
  function grid(L, rows, x0, y0, pal, flip){
    const w = rows[0].length;
    rows.forEach((r, j) => { for (let i = 0; i < w; i++){ const ch = r[i]; if (ch === "." || !pal[ch]) continue; put(L, flip ? x0 + (w - 1 - i) : x0 + i, y0 + j, pal[ch]); } });
  }
  // 整層繞腳底轉（跌倒用），最近鄰取樣
  function rotate(L, deg, cx, cy){
    if (!deg) return L; const out = layer(), a = -deg * D2R, ca = Math.cos(a), sa = Math.sin(a);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, sx = Math.floor(cx + dx * ca - dy * sa), sy = Math.floor(cy + dx * sa + dy * ca);
      if (sx >= 0 && sy >= 0 && sx < W && sy < H) out.px[y * W + x] = L.px[sy * W + sx]; }
    return out;
  }
  // 光暗：上面沒東西＝受光（亮一點）；後面那一邊（背光）沒東西＝暗一點。皮膚和外框以外的顏色才做
  function shade(L, back){
    const src = L.px.slice(), at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? null : src[y * W + x];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ const c = src[y * W + x]; if (!c || c.flat) continue;
      let k = 1;
      if (!at(x, y - 1)) k = 1.16;
      else if (!at(x + back, y) || !at(x + back * 2, y) && !at(x + back, y + 1)) k = 0.78;
      else if (!at(x, y + 1)) k = 0.84;
      if (k !== 1){ const n = mul(c, k); n.flat = c.flat; L.px[y * W + x] = n; } }
  }
  // 疊上去：先畫這一層的外框（只畫在這一層外面一格），再畫這一層。後畫的層會在前面的層上留下一條分隔線
  function stack(base, L){
    const src = L.px;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ if (src[y * W + x]) continue;
      if ((x > 0 && src[y * W + x - 1]) || (x < W - 1 && src[y * W + x + 1]) || (y > 0 && src[(y - 1) * W + x]) || (y < H - 1 && src[(y + 1) * W + x])) base.px[y * W + x] = OUT; }
    for (let i = 0; i < src.length; i++) if (src[i]) base.px[i] = src[i];
  }

  // 轉過的人（跌倒、躺下）：整個往上／下移，最低的一格剛好碰到地面（不會一半陷進地下）
  function settle(L){
    let low = -1; for (let i = 0; i < L.px.length; i++) if (L.px[i]) low = Math.max(low, Math.floor(i / W));
    const d = RY - low; if (!d || low < 0) return L; const out = layer();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ const sy = y - d; if (sy >= 0 && sy < H) out.px[y * W + x] = L.px[sy * W + x]; }
    return out;
  }
  /* ---------- 頭（大頭：14～16 格高） ---------- */
  // 字：h 帽 H 帽帶 r 頭髮 k 皮膚 K 皮膚暗 e 眼 w 眼白 m 嘴 b 眉
  const HEAD = {
    side_hat: [
      "......hhhhhh....",
      ".....hhhhhhhh...",
      "....hhhhhhhhh...",
      "....HHHHHHHHH...",
      "..hhhhhhhhhhhhh.",
      "....rrrkkkkkk...",
      "...rrrkkkkkkk...",
      "...rrkkkkkbbk...",
      "...rrKkkkkwek...",
      "...rKKkkkkkkkk..",
      "...rrkkkkkkkkk..",
      "....rkkkkkkmk...",
      ".....kkkkkkk....",
      "......kkkk......"],
    front_hat: [
      "....hhhhhhhh....",
      "...hhhhhhhhhh...",
      "...hhhhhhhhhh...",
      "...HHHHHHHHHH...",
      ".hhhhhhhhhhhhhh.",
      "...rkkkkkkkkr...",
      "..rkkkkkkkkkkr..",
      "..rkbbkkkkbbkr..",
      "..KkwekkkkewkK..",
      "..Kkkkkkkkkkkk..",
      "...kkkkKKkkkk...",
      "...kkkkmmkkkk...",
      "....kkkkkkkk....",
      "......kkkk......"],
    back_hat: [
      "....hhhhhhhh....",
      "...hhhhhhhhhh...",
      "...hhhhhhhhhh...",
      "...HHHHHHHHHH...",
      ".hhhhhhhhhhhhhh.",
      "...rrrrrrrrrr...",
      "..rrrrrrrrrrrr..",
      "..rrrrrrrrrrrr..",
      "..Krrrrrrrrrrk..",
      "..Krrrrrrrrrrk..",
      "...rrrrrrrrrr...",
      "...kkrrrrrrkk...",
      "....kkkkkkkk....",
      "......kkkk......"],
    side: [
      "................",
      "......rrrrr.....",
      "....rrrrrrrrr...",
      "...rrrrrrrrrrr..",
      "...rrrrrrrrrrr..",
      "...rrrrrkkkkkr..",
      "...rrrrkkkkkkk..",
      "...rrrkkkkkbbk..",
      "...rrKkkkkkwek..",
      "...rKKkkkkkkkkk.",
      "...rrkkkkkkkkk..",
      "....rkkkkkkmk...",
      ".....kkkkkkk....",
      "......kkkk......"],
    front: [
      "................",
      ".....rrrrrr.....",
      "...rrrrrrrrrr...",
      "..rrrrrrrrrrrr..",
      "..rrrrrrrrrrrr..",
      "..rrkkkrrkkkrr..",
      "..rkkkkkkkkkkr..",
      "..rkbbkkkkbbkr..",
      "..KkwekkkkewkK..",
      "..Kkkkkkkkkkkk..",
      "...kkkkKKkkkk...",
      "...kkkkmmkkkk...",
      "....kkkkkkkk....",
      "......kkkk......"],
    back: [
      "................",
      ".....rrrrrr.....",
      "...rrrrrrrrrr...",
      "..rrrrrrrrrrrr..",
      "..rrrrrrrrrrrr..",
      "..rrrrrrrrrrrr..",
      "..rrrrrrrrrrrr..",
      "..rrrrrrrrrrrr..",
      "..Krrrrrrrrrrk..",
      "..Krrrrrrrrrrk..",
      "...rrrrrrrrrr...",
      "...kkrrrrrrkk...",
      "....kkkkkkkk....",
      "......kkkk......"]
  };

  /* ---------- 姿勢：骨架角度（度；0＝直直向下，正＝往面向的那邊） ---------- */
  // 側面：lean 身體前傾、hF/kF 前腳大腿／膝、hB/kB 後腳、sF/eF 近鏡頭的手（肩／手肘）、sB/eB 遠的手、rot 整個人轉（跌倒）、lift 整個人離地、
  //       hand：near 那隻手拿什麼（"lens" 放大鏡）、mouth、eyes:"shut"
  const LEN = { thigh: 6, shin: 6, torso: 9, arm1: 5, arm2: 5 };   // 大頭比例：頭大約佔全身四成
  function walkSide(f, n){
    const p = f / n * Math.PI * 2, s = Math.sin(p), c = Math.cos(p);
    // 腳往前時膝蓋伸直落地，往後擺回來的那一半膝蓋彎起（抬腳）
    return { lean: 5, hF: 32 * s, kF: c > 0 ? 6 : 6 + 44 * -c, hB: -32 * s, kB: c < 0 ? 6 : 6 + 44 * c,
      sF: -30 * s, eF: 16 - 10 * s, sB: 30 * s, eB: 16 + 10 * s };
  }
  // 動作表：每一個動作是一串格（每格一組角度，沒寫的用站姿）
  const STAND = { lean: 0, hF: 4, kF: 2, hB: -4, kB: 2, sF: 6, eF: 10, sB: -4, eB: 10, rot: 0, lift: 0 };
  const ACTS = {
    idle: n => [0, 1, 2, 3].map(i => ({ breathe: i === 1 || i === 2 ? 1 : 0 })),
    look: () => [{ lean: 10, hF: 14, kF: 10, sF: 70, eF: 30, hand: "lens" }, { lean: 12, hF: 14, kF: 10, sF: 74, eF: 26, hand: "lens" }],
    crouch: () => [{ lean: 26, hF: 70, kF: 120, hB: -20, kB: 110, lift: -7, sF: 50, eF: 40, sB: 20, eB: 30, hand: "lens" },
                   { lean: 28, hF: 70, kF: 120, hB: -20, kB: 110, lift: -7, sF: 56, eF: 34, sB: 20, eB: 30, hand: "lens" }],
    point: () => [{ lean: 2, sF: 88, eF: 2 }],
    // 向後跌（正面中彈那一種的動作節奏）：仰、退一步、膝軟、坐低、倒下、彈一下、躺定
    fallBack: () => [
      { lean: -8, sF: 30, eF: 60, sB: -40, eB: 20, hF: 10, hB: -6, eyes: "shut" },
      { lean: -16, sF: 60, eF: 50, sB: -60, eB: 30, hF: 16, kF: 6, hB: -14, kB: 4, eyes: "shut", mouth: 1 },
      { lean: -20, sF: 40, eF: 40, sB: -50, eB: 40, hF: -10, kF: 10, hB: 20, kB: 24, eyes: "shut", mouth: 1 },
      { lean: -12, sF: 20, eF: 30, sB: -30, eB: 30, hF: 10, kF: 40, hB: 16, kB: 40, lift: -2, eyes: "shut" },
      { lean: -10, sF: 10, eF: 20, sB: -20, eB: 20, hF: 40, kF: 80, hB: 34, kB: 76, lift: -5, eyes: "shut" },
      { lean: -24, sF: 20, eF: 30, sB: -20, eB: 30, hF: 60, kF: 90, hB: 50, kB: 90, lift: -8, rot: -20, eyes: "shut" },
      { lean: -10, sF: 60, eF: 40, sB: 30, eB: 40, hF: 60, kF: 60, hB: 50, kB: 70, lift: -6, rot: -55, eyes: "shut" },
      { lean: 0, sF: 120, eF: 30, sB: 100, eB: 30, hF: 30, kF: 30, hB: 20, kB: 40, lift: -4, rot: -88, eyes: "shut" },
      { lean: 0, sF: 150, eF: 20, sB: 130, eB: 30, hF: 24, kF: 20, hB: 14, kB: 30, lift: -5, rot: -86, eyes: "shut" },
      { lean: 0, sF: 160, eF: 10, sB: 150, eB: 20, hF: 14, kF: 14, hB: 8, kB: 20, lift: -4, rot: -90, eyes: "shut" },
      { lean: 0, sF: 165, eF: 6, sB: 160, eB: 10, hF: 8, kF: 6, hB: 4, kB: 10, lift: -4, rot: -90, eyes: "shut" }],
    // 向前仆（背後中彈那一種）：身體向前彎、腳軟、跪低、整個人撲落地
    fallFwd: () => [
      { lean: 14, sF: -10, eF: 20, sB: -20, eB: 20, hF: 10, hB: -10, eyes: "shut" },
      { lean: 26, sF: -40, eF: 30, sB: -50, eB: 20, hF: 20, kF: 10, hB: -14, kB: 10, eyes: "shut", mouth: 1 },
      { lean: 34, sF: -20, eF: 40, sB: -30, eB: 40, hF: 26, kF: 30, hB: -4, kB: 30, lift: -1, eyes: "shut" },
      { lean: 30, sF: 10, eF: 30, sB: 0, eB: 30, hF: 40, kF: 70, hB: 20, kB: 70, lift: -4, eyes: "shut" },
      { lean: 30, sF: 30, eF: 20, sB: 20, eB: 20, hF: 60, kF: 110, hB: 50, kB: 110, lift: -8, eyes: "shut" },
      { lean: 40, sF: 50, eF: 30, sB: 40, eB: 30, hF: 60, kF: 110, hB: 50, kB: 110, lift: -8, rot: 20, eyes: "shut" },
      { lean: 30, sF: 80, eF: 40, sB: 70, eB: 40, hF: 40, kF: 70, hB: 30, kB: 70, lift: -6, rot: 55, eyes: "shut" },
      { lean: 0, sF: 150, eF: 20, sB: 140, eB: 20, hF: 10, kF: 30, hB: 0, kB: 30, lift: -4, rot: 86, eyes: "shut" },
      { lean: 0, sF: 160, eF: 10, sB: 150, eB: 20, hF: 6, kF: 20, hB: -4, kB: 20, lift: -5, rot: 88, eyes: "shut" },
      { lean: 0, sF: 168, eF: 6, sB: 160, eB: 10, hF: 4, kF: 10, hB: -4, kB: 14, lift: -4, rot: 90, eyes: "shut" },
      { lean: 0, sF: 170, eF: 4, sB: 165, eB: 6, hF: 2, kF: 6, hB: -2, kB: 8, lift: -4, rot: 90, eyes: "shut" }]
  };
  function frames(act){ return act === "walk" ? 8 : (ACTS[act] ? ACTS[act]().length : 1); }

  // 從一個點往某個角度（0＝向下，正＝向前）走 len 格
  const step = (p, deg, len, dir) => [p[0] + Math.sin(deg * D2R) * len * dir, p[1] + Math.cos(deg * D2R) * len];

  function pal(L){
    const skin = hex(L.skin || "#e8b98f"), hair = hex(L.hair || "#2a1d16"), coat = hex(L.coat || L.top || "#5577aa"), hat = L.hat ? hex(L.hat) : null;
    const flat = c => { const o = c.slice(); o.flat = 1; return o; };
    return { skin, skinD: mul(skin, 0.8), hair, coat, top: hex(L.top || L.coat || "#5577aa"), pants: hex(L.bottom || "#333a44"), shoe: hex(L.shoes || "#2a2320"),
      hat, hatB: hat ? mul(hat, 0.6) : null, eye: flat(OUT), white: flat([240, 236, 226]), brow: flat(mul(hair, 0.7)), mouth: flat([150, 70, 60]), lens: flat([200, 222, 236]), lensR: flat([90, 70, 50]) };
  }

  /* ---------- 畫一格（側面） ---------- */
  function sideFrame(L, P, Q){
    const dir = 1, q = { ...STAND, ...Q };
    // 腳的長度（垂直方向）決定臀部高度：站著的那隻腳踩在地上
    const legDrop = (h, k) => Math.cos(h * D2R) * LEN.thigh + Math.cos((h - k) * D2R) * LEN.shin;
    const drop = Math.max(legDrop(q.hF, q.kF), legDrop(q.hB, q.kB));
    const breathe = q.breathe || 0;
    const hip = [RX, RY - 1 - drop - (q.lift || 0) * 0];
    if (q.lift) hip[1] = RY - 1 - Math.max(drop + q.lift, 4);
    const neck = step(hip, 180 + q.lean, LEN.torso - breathe * 0, -1);   // 往上
    const shoulder = [neck[0] - 1, neck[1] + 2 + breathe];
    const legs = layer(), backL = layer(), body = layer(), front = layer(), headL = layer();
    // 遠的手、遠的腳（暗一點）
    const back = (c) => mul(c, 0.78);
    const leg = (Ly, h, k, dark) => { const knee = step(hip, h, LEN.thigh, dir), ank = step(knee, h - k, LEN.shin, dir);
      seg(Ly, hip, knee, 5, dark ? back(P.pants) : P.pants); seg(Ly, knee, ank, 4, dark ? back(P.pants) : P.pants);
      const fa = (h - k) - 90; const toe = step(ank, h - k + 90, 3, dir);   // 腳掌跟小腿成直角
      seg(Ly, [ank[0], ank[1] + 1], [toe[0] + dir, toe[1] + 1], 3, dark ? back(P.shoe) : P.shoe); return { knee, ank }; };
    const arm = (Ly, s, e, dark, hand) => { const el = step(shoulder, s, LEN.arm1, dir), wr = step(el, s + e, LEN.arm2, dir);
      seg(Ly, shoulder, el, 4, dark ? back(P.coat) : P.coat); seg(Ly, el, wr, 3, dark ? back(P.coat) : P.coat);
      const hd = step(wr, s + e, 1.5, dir); rect(Ly, Math.round(hd[0]) - 1, Math.round(hd[1]) - 1, 2, 2, dark ? P.skinD : P.skin);
      if (hand === "lens"){ const c = step(hd, s + e, 3, dir); rect(Ly, Math.round(c[0]) - 1, Math.round(c[1]) - 2, 4, 4, P.lensR); rect(Ly, Math.round(c[0]), Math.round(c[1]) - 1, 2, 2, P.lens); } };
    arm(backL, q.sB, q.eB, true);
    leg(legs, q.hB, q.kB, true);
    const fl = leg(legs, q.hF, q.kF, false);
    // 身體＋大衣（下擺蓋到大腿一半）
    const tw = 6;
    const nb = [neck[0] - tw, neck[1] + 1], nf = [neck[0] + tw - 1, neck[1] + 1];
    const hb = [hip[0] - tw, hip[1]], hf = [hip[0] + tw - 1, hip[1]];
    const kneeB = step(hip, q.hB, LEN.thigh * 0.75, dir), kneeF = step(hip, q.hF, LEN.thigh * 0.75, dir);
    poly(body, [nb, nf, [hf[0] + 0.5, hf[1]], [Math.max(kneeF[0], hip[0]) + 3, kneeF[1] + 1], [Math.min(kneeB[0], hip[0]) - 3, kneeB[1] + 1], [hb[0] - 0.5, hb[1]]], P.coat);
    // 腰帶、領口、扣
    const belt = step(hip, 180 + q.lean, 3, -1); rect(body, Math.round(belt[0]) - tw, Math.round(belt[1]), tw * 2, 1, mul(P.coat, 0.62));
    rect(body, Math.round(neck[0]) + 1, Math.round(neck[1]) + 1, 3, 3, mul(P.coat, 1.25));
    // 頭
    const hasHat = !!P.hat;
    const rows = HEAD[hasHat ? "side_hat" : "side"].map(r => q.eyes === "shut" ? r.replace("we", "bb") : r).map(r => q.mouth ? r.replace("mk", "mm") : r);
    const hp = { h: P.hat, H: P.hatB, r: P.hair, k: P.skin, K: P.skinD, e: P.eye, w: P.white, b: P.brow, m: P.mouth };
    const hx = Math.round(neck[0]) - 8 + 1, hy = Math.round(neck[1]) - 13;
    grid(headL, rows, hx, hy, hp, false);
    arm(front, q.sF, q.eF, false, q.hand);
    [backL, legs, body, front].forEach(Ly => shade(Ly, -dir));
    const out = layer();
    const rot = q.rot || 0, piv = [RX, RY];
    [backL, legs, body, headL, front].forEach(Ly => stack(out, rotate(Ly, rot, piv[0], piv[1])));
    return rot ? settle(out) : out;
  }

  /* ---------- 正面／背面 ---------- */
  function fbFrame(L, P, Q, backView, f, moving){
    const out = layer(), legs = layer(), body = layer(), arms = layer(), headL = layer();
    const p = f / 8 * Math.PI * 2, s = moving ? Math.sin(p) : 0, breathe = Q.breathe || 0;
    const up1 = moving ? Math.max(0, s) * 3 : 0, up2 = moving ? Math.max(0, -s) * 3 : 0;
    const bob = moving ? -Math.round(Math.abs(Math.cos(p))) : 0;
    const hipY = RY - 12 + bob;
    // 腳：抬起的那隻短一點、鞋底露出來
    rect(legs, RX - 6, hipY, 5, 11 - Math.round(up1), P.pants); rect(legs, RX + 1, hipY, 5, 11 - Math.round(up2), P.pants);
    rect(legs, RX - 7, hipY + 10 - Math.round(up1), 6, 3, P.shoe); rect(legs, RX + 1, hipY + 10 - Math.round(up2), 6, 3, P.shoe);
    // 大衣
    const top = hipY - 10 + breathe;
    poly(body, [[RX - 7, top], [RX + 7, top], [RX + 8, hipY + 6], [RX - 8, hipY + 6]], P.coat);
    if (!backView){ rect(body, RX - 1, top, 2, 17, mul(P.coat, 0.7)); rect(body, RX - 3, top, 2, 4, mul(P.coat, 1.25)); rect(body, RX + 1, top, 2, 4, mul(P.coat, 1.25));
      rect(body, RX - 2, top, 4, 2, P.top); }
    else rect(body, RX, top + 2, 1, 15, mul(P.coat, 0.75));
    rect(body, RX - 6, hipY - 3, 13, 1, mul(P.coat, 0.62));
    // 手：前後擺＝上下移一點
    const sw = Math.round(s * 2);
    const la = backView ? sw : -sw, ra = backView ? -sw : sw;
    rect(arms, RX - 10, top + 1 + la, 4, 9, P.coat); rect(arms, RX - 10, top + 10 + la, 4, 3, P.skin);
    rect(arms, RX + 7, top + 1 + ra, 4, 9, P.coat); rect(arms, RX + 7, top + 10 + ra, 4, 3, P.skin);
    const hasHat = !!P.hat, rows = HEAD[(backView ? "back" : "front") + (hasHat ? "_hat" : "")];
    const hp = { h: P.hat, H: P.hatB, r: P.hair, k: P.skin, K: P.skinD, e: P.eye, w: P.white, b: P.brow, m: P.mouth };
    grid(headL, rows, RX - 8, top - 13, hp, false);
    [legs, body, arms].forEach(Ly => shade(Ly, -1));
    [legs, body, arms, headL].forEach(Ly => stack(out, Ly));
    return out;
  }

  /* ---------- 快取＋畫到畫布 ---------- */
  const cache = new Map();
  function render(L, o){
    const view = o.view || "side", act = o.act || "idle", n = frames(act), f = ((o.f || 0) % n + n) % n;
    const key = JSON.stringify(L) + "|" + view + "|" + act + "|" + f;
    let cv = cache.get(key); if (cv) return cv;
    const P = pal(L);
    let Ly;
    if (view === "side"){ const Q = act === "walk" ? walkSide(f, 8) : (ACTS[act] ? ACTS[act]()[f] : {}); Ly = sideFrame(L, P, Q); }
    else Ly = fbFrame(L, P, act === "idle" ? ACTS.idle()[f] : {}, view === "back", f, act === "walk");
    cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const g = cv.getContext("2d"), id = g.createImageData(W, H);
    Ly.px.forEach((c, i) => { if (!c) return; id.data[i * 4] = c[0]; id.data[i * 4 + 1] = c[1]; id.data[i * 4 + 2] = c[2]; id.data[i * 4 + 3] = 255; });
    g.putImageData(id, 0, 0); cache.set(key, cv); return cv;
  }
  function draw(g, x, y, L, o = {}){
    const cv = render(L, o), flip = (o.view || "side") === "side" && (o.facing || 1) < 0, s = o.s || 1;
    g.save(); g.translate(Math.round(x), Math.round(y)); if (flip) g.scale(-1, 1);
    g.imageSmoothingEnabled = false; g.drawImage(cv, -RX * s, -RY * s, W * s, H * s); g.restore();
    return { x: x - 12 * s, y: y - 42 * s, w: 24 * s, h: 42 * s };
  }
  return { draw, render, frames, ACTS, W, H, RX, RY };
})();
if (typeof module !== "undefined") module.exports = SP;
