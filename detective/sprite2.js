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

  // 鴨舌帽／警帽：帽頂矮一點，帽簷只在前面
  HEAD.side_cap = HEAD.side_hat.map((r, j) => j < 2 ? "................" : j === 4 ? "...hhhhhhhhhhhhh" : r);
  HEAD.front_cap = HEAD.front_hat.map((r, j) => j < 2 ? "................" : j === 4 ? "..hhhhhhhhhhhh.." : r);
  HEAD.back_cap = HEAD.back_hat.map((r, j) => j < 2 ? "................" : j === 4 ? "...hhhhhhhhhh..." : r);
  /* ---------- 姿勢：骨架角度（度；0＝直直向下，正＝往面向的那邊） ---------- */
  // 側面：lean 身體前傾、hF/kF 前腳大腿／膝、hB/kB 後腳、sF/eF 近鏡頭的手（肩／手肘）、sB/eB 遠的手、rot 整個人轉（跌倒）、lift 整個人離地、
  //       hand：near 那隻手拿什麼（"lens" 放大鏡）、mouth、eyes:"shut"
  const LEN = { thigh: 6, shin: 7, torso: 9, arm1: 5, arm2: 5 };   // 大頭比例：頭大約佔全身四成
  function walkSide(f, n){
    const p = f / n * Math.PI * 2, s = Math.sin(p), c = Math.cos(p);
    // 腳往前時膝蓋伸直落地，往後擺回來的那一半膝蓋彎起（抬腳）
    return { lean: 1, hF: 32 * s, kF: c > 0 ? 6 : 6 + 44 * -c, hB: -32 * s, kB: c < 0 ? 6 : 6 + 44 * c,
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
    // ---- 調查 ----
    kneel: () => [{ lean: 16, hF: 84, kF: 84, hB: -10, kB: 100, lift: -8, sF: 40, eF: 20, sB: 10, eB: 20 },        // 單膝跪低，手伸去摸地
                  { lean: 20, hF: 84, kF: 84, hB: -10, kB: 100, lift: -8, sF: 30, eF: 10, sB: 10, eB: 20 }],
    reach: () => [{ lean: -2, sF: 105, eF: 6, sB: 0, eB: 10 }, { lean: -3, sF: 118, eF: 2, sB: 0, eB: 10 }],   // 伸手去高處／開櫃
    photo: () => [{ sF: 70, eF: 80, sB: 60, eB: 90, hand: "camera" }, { sF: 70, eF: 80, sB: 60, eB: 90, hand: "camera", flash: 1 }],
    write: () => [{ sF: 30, eF: 90, sB: 20, eB: 70, hand: "note" }, { sF: 30, eF: 96, sB: 22, eB: 66, hand: "note" }],
    knock: () => [{ sF: 80, eF: 60 }, { sF: 70, eF: 80 }],
    pickup: () => [{ lean: 34, hF: 50, kF: 70, hB: 30, kB: 70, lift: -3, sF: 10, eF: 10 }, { lean: 30, hF: 50, kF: 70, hB: 30, kB: 70, lift: -3, sF: 16, eF: 20, hand: "box" },
                   { lean: 10, hF: 20, kF: 30, hB: 10, kB: 30, sF: 40, eF: 60, hand: "box" }, { lean: 0, sF: 40, eF: 70, hand: "box" }],
    sit: () => [{ hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sF: 20, eF: 50, sB: 16, eB: 50, sitting: 1 }],
    talk: () => [{ sF: 30, eF: 40, mouth: 1 }, { sF: 40, eF: 50 }, { sF: 34, eF: 46, mouth: 1 }, { sF: 20, eF: 30 }],
    // ---- 同物件互動 ----
    openDoor: () => [{ lean: 4, sF: 70, eF: 30 }, { lean: 6, sF: 84, eF: 10, hand: "grip" }, { lean: -4, hF: -6, kF: 4, hB: -16, kB: 8, sF: 60, eF: 40, hand: "grip" },
                     { lean: -6, hF: -10, kF: 6, hB: -20, kB: 10, sF: 46, eF: 50, hand: "grip" }],
    drawer: () => [{ lean: 18, hF: 30, kF: 40, hB: 10, kB: 40, lift: -2, sF: 60, eF: 20 }, { lean: 18, hF: 30, kF: 40, hB: 10, kB: 40, lift: -2, sF: 66, eF: 10, hand: "grip" },
                   { lean: 10, hF: 26, kF: 40, hB: 6, kB: 40, lift: -2, sF: 34, eF: 44, hand: "grip" }, { lean: 22, hF: 30, kF: 40, hB: 10, kB: 40, lift: -2, sF: 50, eF: 30, sB: 40, eB: 30 }],
    rummage: () => [{ lean: 40, hF: 40, kF: 50, hB: 20, kB: 50, lift: -2, sF: 20, eF: 10, sB: 30, eB: 10 }, { lean: 42, hF: 40, kF: 50, hB: 20, kB: 50, lift: -2, sF: 34, eF: 4, sB: 14, eB: 20 },
                    { lean: 40, hF: 40, kF: 50, hB: 20, kB: 50, lift: -2, sF: 14, eF: 20, sB: 36, eB: 6, hand: "note" }],
    switch: () => [{ sF: 104, eF: 6 }, { sF: 110, eF: 0, hand: "grip" }],
    phone: () => [{ sF: 60, eF: 112, hand: "phone", mouth: 1 }, { sF: 60, eF: 112, hand: "phone" }, { sF: 58, eF: 114, hand: "phone", mouth: 1 }, { sF: 60, eF: 112, hand: "phone", sB: 30, eB: 40 }],
    read: () => [{ lean: 4, sF: 56, eF: 56, sB: 50, eB: 62, hand: "paper" }, { lean: 6, sF: 54, eF: 60, sB: 48, eB: 66, hand: "paper" }],
    text: () => [{ lean: 6, sF: 30, eF: 84, sB: 26, eB: 90, hand: "phone2" }, { lean: 6, sF: 30, eF: 88, sB: 26, eB: 90, hand: "phone2" }],
    sitText: () => [{ hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, lean: 6, sF: 30, eF: 80, sB: 26, eB: 86, hand: "phone2", sitting: 1 },
                    { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, lean: 6, sF: 30, eF: 84, sB: 26, eB: 86, hand: "phone2", sitting: 1 }],
    type: () => [{ hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, lean: 8, sF: 56, eF: 30, sB: 50, eB: 34, sitting: 1 }, { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, lean: 8, sF: 50, eF: 36, sB: 56, eB: 28, sitting: 1 }],
    drink: () => [{ sF: 30, eF: 70, hand: "cup" }, { sF: 50, eF: 110, hand: "cup" }, { sF: 60, eF: 120, hand: "cup", lean: -4 }, { sF: 50, eF: 110, hand: "cup" }],
    give: () => [{ sF: 40, eF: 40, hand: "note" }, { sF: 74, eF: 10, hand: "note" }, { sF: 80, eF: 6, hand: "note" }],
    // 抽菸：夾著菸在腰邊，舉到嘴邊吸一口，再放下來
    smoke: () => [{ sF: 30, eF: 70, hand: "cig" }, { sF: 30, eF: 72, hand: "cig", breathe: 1 }, { sF: 56, eF: 116, hand: "cigM" }, { sF: 56, eF: 118, hand: "cigM", mouth: 1 }, { sF: 34, eF: 76, hand: "cig", puff: 1 }, { sF: 30, eF: 70, hand: "cig", puff: 2 }],
    // 哭：雙手掩面，肩膀一抽一抽
    cry: () => [{ lean: 10, sF: 66, eF: 104, sB: 62, eB: 108, eyes: "shut" }, { lean: 13, sF: 68, eF: 100, sB: 64, eB: 104, eyes: "shut", breathe: 1 }],
    sitCry: () => [{ hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, lean: 14, sF: 66, eF: 104, sB: 62, eB: 108, eyes: "shut" }, { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, lean: 17, sF: 68, eF: 100, sB: 64, eB: 104, eyes: "shut", breathe: 1 }],
    // 掃地：雙手拿掃把，左右掃
    sweep: () => [{ lean: 10, sF: 30, eF: 30, sB: 20, eB: 40, hand: "broom" }, { lean: 12, sF: 14, eF: 30, sB: 6, eB: 44, hand: "broom" }, { lean: 10, sF: 30, eF: 30, sB: 20, eB: 40, hand: "broom" }, { lean: 8, sF: 44, eF: 26, sB: 34, eB: 36, hand: "broom" }],
    clasp: () => [{ sF: 22, eF: 72, sB: 18, eB: 76 }, { sF: 22, eF: 74, sB: 18, eB: 76, breathe: 1 }],
    cross: () => [{ sF: 30, eF: 100, sB: 34, eB: 96 }, { sF: 30, eF: 100, sB: 34, eB: 96, breathe: 1 }],
    hold: () => [{ sF: 24, eF: 70, sB: 20, eB: 74, hand: "tray" }, { sF: 24, eF: 72, sB: 20, eB: 74, hand: "tray", breathe: 1 }],
    wipe: () => [{ sF: 90, eF: 10, hand: "cloth" }, { sF: 100, eF: 4, hand: "cloth" }, { sF: 112, eF: 0, hand: "cloth" }, { sF: 100, eF: 4, hand: "cloth" }],
    // ---- 坐著做的事（真相動畫的近鏡用）----
    sitPour: () => [{ hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, sF: 56, eF: 44, hand: "bottle" }, { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, sF: 78, eF: 22, hand: "bottleT" }, { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, sF: 82, eF: 18, hand: "bottleT", lean: 4 }, { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, sF: 60, eF: 40, hand: "bottle" }],
    sitIce: () => [{ hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, sF: 66, eF: 24, hand: "tongs" }, { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, sF: 80, eF: 12, hand: "tongs", lean: 4 }, { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, sF: 70, eF: 30, hand: "tongs" }],
    sitDrink: () => [{ hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, sF: 50, eF: 60, hand: "cup" }, { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, sF: 52, eF: 108, hand: "cup" }, { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, sF: 60, eF: 120, hand: "cup", lean: -4 }, { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, sF: 52, eF: 108, hand: "cup" }],
    sitClutch: () => [{ hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, sF: 20, eF: 110, lean: 8, mouth: 1 }, { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, sF: 24, eF: 116, lean: 16, mouth: 1, eyes: "shut" }, { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sitting: 1, sF: 20, eF: 110, lean: 12, sB: 30, eB: 60, eyes: "shut" }],
    lie: () => [{ lift: -4, sF: 10, eF: 10, sB: 6, eB: 10, hF: 0, kF: 4, hB: -2, kB: 6, rot: -90, eyes: "shut" }, { lift: -4, sF: 12, eF: 10, sB: 6, eB: 10, hF: 0, kF: 4, hB: -2, kB: 6, rot: -90, eyes: "shut", breathe: 1 }],
    // ---- 意外、自殺類（真相動畫用） ----
    drinkFall: () => [
      { sF: 50, eF: 110, hand: "cup" }, { sF: 60, eF: 118, hand: "cup", lean: -4 }, { sF: 40, eF: 80, hand: "cup" },
      { sF: 20, eF: 110, lean: 10, mouth: 1 }, { sF: 24, eF: 116, lean: 20, hF: 14, kF: 16, mouth: 1, eyes: "shut" },     // 手按心口
      { sF: 10, eF: 100, lean: 26, hF: 30, kF: 60, hB: 10, kB: 60, lift: -3, eyes: "shut" },
      { lean: 30, sF: 30, eF: 20, sB: 20, eB: 20, hF: 60, kF: 110, hB: 50, kB: 110, lift: -8, eyes: "shut" },
      { lean: 30, sF: 80, eF: 40, sB: 70, eB: 40, hF: 40, kF: 70, hB: 30, kB: 70, lift: -6, rot: 55, eyes: "shut" },
      { lean: 0, sF: 150, eF: 20, sB: 140, eB: 20, hF: 10, kF: 30, hB: 0, kB: 30, lift: -4, rot: 86, eyes: "shut" },
      { lean: 0, sF: 168, eF: 6, sB: 160, eB: 10, hF: 4, kF: 10, hB: -4, kB: 14, lift: -4, rot: 90, eyes: "shut" }],
    fallHigh: () => [
      { air: 34, sF: 160, eF: 20, sB: 150, eB: 30, hF: 20, kF: 30, hB: -20, kB: 40, rot: -10, mouth: 1 },
      { air: 28, sF: 120, eF: 50, sB: 170, eB: 20, hF: -10, kF: 50, hB: 30, kB: 20, rot: -25, mouth: 1 },
      { air: 20, sF: 170, eF: 10, sB: 110, eB: 60, hF: 30, kF: 20, hB: -20, kB: 60, rot: -45, mouth: 1 },
      { air: 11, sF: 130, eF: 40, sB: 160, eB: 20, hF: 10, kF: 40, hB: 20, kB: 30, rot: -65, eyes: "shut" },
      { air: 3, sF: 150, eF: 30, sB: 140, eB: 30, hF: 20, kF: 30, hB: 10, kB: 40, rot: -82, eyes: "shut" },
      { lift: -4, sF: 100, eF: 50, sB: 120, eB: 30, hF: 40, kF: 60, hB: 30, kB: 50, rot: -90, eyes: "shut" },
      { lift: -4, sF: 150, eF: 20, sB: 160, eB: 20, hF: 20, kF: 30, hB: 10, kB: 40, rot: -90, eyes: "shut" },
      { lift: -4, sF: 165, eF: 8, sB: 160, eB: 10, hF: 10, kF: 16, hB: 4, kB: 24, rot: -90, eyes: "shut" }],
    slump: () => [
      { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sF: 20, eF: 50, sB: 16, eB: 50, sitting: 1 },
      { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sF: 10, eF: 30, sB: 6, eB: 30, sitting: 1, lean: 12, eyes: "shut" },
      { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sF: 0, eF: 10, sB: -4, eB: 10, sitting: 1, lean: 30, eyes: "shut" },
      { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sF: -6, eF: 4, sB: -8, eB: 6, sitting: 1, lean: 40, eyes: "shut" },
      { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sF: 60, eF: 30, sB: 50, eB: 30, sitting: 1, lean: 54, eyes: "shut" },     // 伏到桌上，手攤在桌面
      { hF: 90, kF: 90, hB: 88, kB: 88, lift: -1, sF: 76, eF: 14, sB: 66, eB: 20, sitting: 1, lean: 62, eyes: "shut" }],
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

  // 舊的造型寫法也接受：hat:"fedora"/"police"/"cap"（顏色 hatColor／capColor）、hood、skirt、coat（有＝長大衣，沒有＝襯衫）、gloves
  function pal(L){
    const skin = hex(L.skin || "#e8b98f"), hair = hex(L.hood || L.hair || "#2a1d16"), coat = hex(L.coat || L.top || "#5577aa");
    const hatC = !L.hat ? null : /^#/.test(L.hat) ? L.hat : L.hat === "police" ? "#24324e" : L.hat === "cap" ? (L.capColor || "#2a2a2a") : (L.hatColor || "#4a3a2a");
    const hat = hatC ? hex(hatC) : null;
    const flat = c => { const o = c.slice(); o.flat = 1; return o; };
    return { skin, skinD: mul(skin, 0.8), hair, coat, top: hex(L.top || L.coat || "#5577aa"), pants: hex(L.skirt ? (L.legs || L.skin || "#e8b98f") : (L.bottom || "#333a44")), skirt: L.skirt ? hex(L.bottom || "#3a3a4a") : null,
      shoe: hex(L.shoes || "#2a2320"), hand: hex(L.gloves || L.skin || "#e8b98f"), long: !!L.coat, tie: L.tie ? hex(L.tie) : null, capHat: L.hat === "police" || L.hat === "cap",
      hairStyle: L.hood ? "hood" : (L.hairStyle || "short"), glasses: !!L.glasses, mask: L.mask ? flat(hex(L.mask)) : null,
      hat, hatB: hat ? mul(hat, 0.6) : null, eye: flat(OUT), white: flat([240, 236, 226]), brow: flat(mul(hex(L.hair || "#2a1d16"), 0.7)), mouth: flat([150, 70, 60]), lens: flat([200, 222, 236]), lensR: flat([90, 70, 50]),
      glass: flat([40, 34, 30]), glassL: flat([190, 214, 230]),
      cup: flat([236, 230, 218]), drink: flat([90, 50, 30]), cam: flat([40, 40, 46]), paper: flat([238, 232, 214]), ink: flat([70, 70, 90]), boxc: [176, 136, 86], bottle: flat([122, 58, 26]), ember: [255, 120, 40], stick: [140, 100, 60], straw: [200, 170, 90] };
  }
  // 頭髮款式、眼鏡、口罩：畫在頭那一層（x0, y0＝頭格子左上角；view：side 面向右／front／back）
  function decorHead(Ly, view, x0, y0, P){
    const H = (x, y, w, h) => rect(Ly, x0 + x, y0 + y, w, h, P.hair), st = P.hat ? "hat" : P.hairStyle;
    if (view === "side"){
      if (st === "spiky"){ [5, 7, 9, 11].forEach((x, i) => { H(x, 0, 1, 1); if (i % 2) H(x, -1, 1, 1); }); }
      if (st === "bob" || st === "long"){ H(3, 4, 4, st === "long" ? 13 : 9); H(6, 4, 7, 2); }
      if (st === "pony"){ H(0, 5, 4, 3); H(1, 8, 3, 6); H(6, 4, 7, 1); }
      if (st === "bun"){ H(1, 1, 4, 4); H(6, 4, 6, 1); }
      if (st === "hood"){ H(3, 4, 3, 10); H(5, 1, 9, 4); H(12, 4, 2, 8); }
      if (P.glasses){ rect(Ly, x0 + 9, y0 + 8, 5, 1, P.glass); rect(Ly, x0 + 10, y0 + 9, 3, 1, P.glass); put(Ly, x0 + 11, y0 + 8, P.glassL); rect(Ly, x0 + 6, y0 + 8, 3, 1, P.glass); }
      if (P.mask) rect(Ly, x0 + 8, y0 + 10, 7, 3, P.mask);
    } else if (view === "front"){
      if (st === "spiky"){ [3, 6, 9, 12].forEach((x, i) => { H(x, 0, 1, 1); if (i % 2) H(x, -1, 1, 1); }); }
      if (st === "bob" || st === "long"){ H(1, 4, 3, st === "long" ? 13 : 9); H(12, 4, 3, st === "long" ? 13 : 9); H(4, 4, 8, 2); }
      if (st === "pony"){ H(3, 4, 10, 1); H(1, 5, 2, 4); H(13, 5, 2, 4); }
      if (st === "bun"){ H(6, -2, 4, 3); H(3, 4, 10, 1); }
      if (st === "hood"){ H(1, 1, 14, 4); H(1, 4, 2, 10); H(13, 4, 2, 10); }
      if (P.glasses){ rect(Ly, x0 + 3, y0 + 7, 4, 3, P.glass); rect(Ly, x0 + 9, y0 + 7, 4, 3, P.glass); rect(Ly, x0 + 4, y0 + 8, 2, 1, P.glassL); rect(Ly, x0 + 10, y0 + 8, 2, 1, P.glassL); rect(Ly, x0 + 7, y0 + 8, 2, 1, P.glass); }
      if (P.mask) rect(Ly, x0 + 3, y0 + 10, 10, 3, P.mask);
    } else {
      if (st === "spiky"){ [3, 6, 9, 12].forEach((x, i) => { H(x, 0, 1, 1); if (i % 2) H(x, -1, 1, 1); }); }
      if (st === "bob") H(2, 4, 12, 9);
      if (st === "long") H(2, 4, 12, 14);
      if (st === "pony"){ H(6, 11, 4, 6); }
      if (st === "bun") H(5, -1, 6, 4);
      if (st === "hood") H(1, 1, 14, 13);
    }
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
    if (q.sitting) hip[1] = RY - 1 - 9;   // 坐著：屁股在椅面（離地 9 格），腳自然垂下
    const neck = step(hip, 180 + q.lean, LEN.torso - breathe * 0, -1);   // 往上
    const shoulder = [neck[0] + 0.5, neck[1] + 3 + breathe];   // 肩膀在身體中間，手往後擺也不會在背上凸起一舊（駝背）
    const legs = layer(), backL = layer(), body = layer(), front = layer(), headL = layer();
    // 遠的手、遠的腳（暗一點）
    const back = (c) => mul(c, 0.78);
    const leg = (Ly, h, k, dark) => { const knee = step(hip, h, LEN.thigh, dir), ank = step(knee, h - k, LEN.shin, dir);
      seg(Ly, hip, knee, 5, dark ? back(P.pants) : P.pants); seg(Ly, knee, ank, 4, dark ? back(P.pants) : P.pants);
      const fa = (h - k) - 90; const toe = step(ank, h - k + 90, 3, dir);   // 腳掌跟小腿成直角
      seg(Ly, [ank[0], ank[1] + 1], [toe[0] + dir, toe[1] + 1], 3, dark ? back(P.shoe) : P.shoe); return { knee, ank }; };
    const arm = (Ly, s, e, dark, hand) => { const el = step(shoulder, s, LEN.arm1, dir), wr = step(el, s + e, LEN.arm2, dir);
      seg(Ly, shoulder, el, 4, dark ? back(P.coat) : P.coat); seg(Ly, el, wr, 3, dark ? back(P.coat) : P.coat);
      const hd = step(wr, s + e, 1.5, dir); rect(Ly, Math.round(hd[0]) - 1, Math.round(hd[1]) - 1, 2, 2, dark ? mul(P.hand, 0.8) : P.hand);
      const hx = Math.round(hd[0]), hy = Math.round(hd[1]);
      if (hand === "lens"){ const c = step(hd, s + e, 3, dir); rect(Ly, Math.round(c[0]) - 1, Math.round(c[1]) - 2, 4, 4, P.lensR); rect(Ly, Math.round(c[0]), Math.round(c[1]) - 1, 2, 2, P.lens); }
      else if (hand === "cup"){ rect(Ly, hx, hy - 3, 3, 4, P.cup); rect(Ly, hx, hy - 3, 3, 1, P.drink); }
      else if (hand === "camera"){ rect(Ly, hx - 1, hy - 3, 5, 4, P.cam); rect(Ly, hx + 3, hy - 2, 2, 2, P.lensR); rect(Ly, hx, hy - 4, 2, 1, P.cam); }
      else if (hand === "note"){ rect(Ly, hx - 1, hy - 4, 4, 5, P.paper); rect(Ly, hx, hy - 3, 2, 1, P.ink); rect(Ly, hx, hy - 1, 2, 1, P.ink); }
      else if (hand === "phone"){ rect(Ly, hx - 1, hy - 6, 2, 6, P.cam); rect(Ly, hx - 1, hy - 6, 1, 1, P.lens); }
      else if (hand === "phone2"){ rect(Ly, hx - 1, hy - 3, 4, 3, P.cam); rect(Ly, hx, hy - 3, 2, 1, P.lens); }
      else if (hand === "paper"){ rect(Ly, hx - 1, hy - 8, 3, 9, P.paper); rect(Ly, hx, hy - 6, 1, 5, P.ink); }
      else if (hand === "tray"){ rect(Ly, hx - 3, hy - 1, 9, 1, P.cam); rect(Ly, hx - 1, hy - 4, 2, 3, P.cup); rect(Ly, hx + 2, hy - 4, 2, 3, P.cup); }
      else if (hand === "cloth"){ rect(Ly, hx - 1, hy - 2, 4, 3, P.paper); rect(Ly, hx, hy + 1, 2, 1, P.ink); }
      else if (hand === "grip"){ rect(Ly, hx - 1, hy - 1, 3, 3, P.hand); }
      else if (hand === "bottle"){ rect(Ly, hx - 1, hy - 7, 3, 8, P.bottle); rect(Ly, hx, hy - 9, 1, 2, P.bottle); rect(Ly, hx - 1, hy - 5, 3, 2, P.paper); }
      else if (hand === "bottleT"){ const n = step(hd, s + e + 60, 7, dir); seg(Ly, [hx, hy], n, 3, P.bottle); const m = step(n, s + e + 60, 2, dir); seg(Ly, n, m, 1, P.bottle); }
      else if (hand === "tongs"){ const n = step(hd, s + e, 4, dir); seg(Ly, [hx, hy], n, 1, P.lens); rect(Ly, Math.round(n[0]), Math.round(n[1]), 2, 2, P.white); }
      else if (hand === "cig"){ const n = step(hd, s + e, 3, dir); seg(Ly, [hx, hy], n, 1, P.white); rect(Ly, Math.round(n[0]), Math.round(n[1]), 1, 1, P.ember); }
      else if (hand === "cigM"){ rect(Ly, hx + dir, hy - 1, 2, 1, P.white); rect(Ly, hx + dir * 3, hy - 1, 1, 1, P.ember); }
      else if (hand === "broom"){ const n = step(hd, s + e - 10, 22, dir); seg(Ly, [hx, hy - 6], n, 1, P.stick); const m = step(n, 90, 4, dir); seg(Ly, [n[0] - 3, n[1]], [m[0] + 3, m[1]], 3, P.straw); }
      else if (hand === "box"){ rect(Ly, hx - 2, hy - 4, 6, 5, P.boxc); rect(Ly, hx - 2, hy - 4, 6, 1, mul(P.boxc, 1.2)); } };
    arm(backL, q.sB, q.eB, true);
    leg(legs, q.hB, q.kB, true);
    const fl = leg(legs, q.hF, q.kF, false);
    // 身體＋大衣（下擺蓋到大腿一半）
    const tw = 6;
    // 企直的身形：背是一條直線、胸口微微挺出、肩膀由頸向兩邊斜落（不是一條平肩頂住下巴＝縮頸駝背的感覺）
    const nb = [neck[0] - tw + 1, neck[1] + 1], nf = [neck[0] + tw - 3, neck[1] + 1], chest = [neck[0] + tw, neck[1] + 5], backTop = [neck[0] - tw, neck[1] + 3];
    const hb = [hip[0] - tw, hip[1]], hf = [hip[0] + tw - 1, hip[1]];
    const kneeB = step(hip, q.hB, LEN.thigh * 0.6, dir), kneeF = step(hip, q.hF, LEN.thigh * 0.6, dir);
    if (P.long) poly(body, [nb, nf, chest, [hf[0] + 0.5, hf[1]], [Math.max(kneeF[0], hip[0]) + 3, kneeF[1] + 1], [Math.min(kneeB[0], hip[0]) - 3, kneeB[1] + 1], [hb[0] - 0.5, hb[1]], backTop], P.coat);
    else {   // 沒有大衣：上衣到屁股；裙子由腰到膝頭
      poly(body, [nb, nf, chest, [hf[0] + 0.5, hf[1] + 1], [hb[0] - 0.5, hb[1] + 1], backTop], P.coat);
      if (P.skirt){ const kF2 = step(hip, q.hF, LEN.thigh * 0.95, dir), kB2 = step(hip, q.hB, LEN.thigh * 0.95, dir);
        poly(body, [[hb[0], hip[1]], [hf[0] + 1, hip[1]], [Math.max(kF2[0], hip[0]) + 3, kF2[1] + 1], [Math.min(kB2[0], hip[0]) - 3, kB2[1] + 1]], P.skirt); } }
    // 腰帶、領口、扣
    const belt = step(hip, 180 + q.lean, P.long ? 3 : 1, -1); rect(body, Math.round(belt[0]) - tw, Math.round(belt[1]), tw * 2, 1, P.long ? mul(P.coat, 0.62) : (P.skirt ? mul(P.skirt, 0.7) : mul(P.pants, 0.8)));
    rect(body, Math.round(neck[0]) + 1, Math.round(neck[1]) + 1, 3, 3, P.long ? mul(P.coat, 1.25) : mul(P.coat, 1.12));
    // 頭
    const hasHat = !!P.hat;
    const rows = HEAD[hasHat ? (P.capHat ? "side_cap" : "side_hat") : "side"].map(r => q.eyes === "shut" ? r.replace("we", "bb") : r).map(r => q.mouth ? r.replace("mk", "mm") : r);
    const hp = { h: P.hat, H: P.hatB, r: P.hair, k: P.skin, K: P.skinD, e: P.eye, w: P.white, b: P.brow, m: P.mouth };
    const hx = Math.round(neck[0]) - 9, hy = Math.round(neck[1]) - 15;   // 頭擺正在身體上面，不向前伸；下面露出一截頸
    rect(body, Math.round(neck[0]) - 1, Math.round(neck[1]) - 2, 4, 4, P.skinD);
    grid(headL, rows, hx, hy, hp, false);
    decorHead(headL, "side", hx, hy, P);
    arm(front, q.sF, q.eF, false, q.hand);
    if (q.puff){ const k = q.puff, sx = hx + (dir > 0 ? 18 : -2), sy = hy + 4 - k * 3; for (let i = 0; i < 3 + k; i++) put(front, sx + dir * (i % 3) + (k > 1 ? dir : 0), sy - Math.floor(i / 2), [214, 214, 210]); }   // 吐出來的煙
    if (q.flash){ const c = step(shoulder, q.sF, 12, dir); for (let k = -3; k <= 3; k++){ put(front, c[0] + 3 + k, c[1] - 2, [255, 250, 220]); put(front, c[0] + 3, c[1] - 2 + k, [255, 250, 220]); } }
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
    const low = P.long ? hipY + 6 : hipY + 1;
    poly(body, [[RX - 4, top], [RX + 4, top], [RX + 7, top + 2], [RX + 8, low], [RX - 8, low], [RX - 7, top + 2]], P.coat);   // 斜肩
    if (P.skirt) poly(body, [[RX - 7, hipY], [RX + 7, hipY], [RX + 9, hipY + 7], [RX - 9, hipY + 7]], P.skirt);
    rect(body, RX - 2, top - 2, 4, 3, P.skinD);   // 頸
    if (!backView){
      if (P.long){ rect(body, RX - 1, top, 2, 17, mul(P.coat, 0.7)); rect(body, RX - 3, top, 2, 4, mul(P.coat, 1.25)); rect(body, RX + 1, top, 2, 4, mul(P.coat, 1.25)); rect(body, RX - 2, top, 4, 2, P.top); }
      else { rect(body, RX - 2, top, 4, 2, mul(P.coat, 1.15)); }
      if (P.tie) rect(body, RX - 1, top + 1, 2, 7, P.tie); }
    else rect(body, RX, top + 2, 1, P.long ? 15 : 9, mul(P.coat, 0.75));
    rect(body, RX - 6, P.long ? hipY - 3 : hipY, 13, 1, P.long ? mul(P.coat, 0.62) : mul(P.pants, 0.8));
    // 手：前後擺＝上下移一點
    const sw = Math.round(s * 2);
    const la = backView ? sw : -sw, ra = backView ? -sw : sw;
    rect(arms, RX - 10, top + 2 + la, 4, 8, P.coat); rect(arms, RX - 10, top + 10 + la, 4, 3, P.hand);
    rect(arms, RX + 7, top + 2 + ra, 4, 8, P.coat); rect(arms, RX + 7, top + 10 + ra, 4, 3, P.hand);
    const hasHat = !!P.hat, rows = HEAD[(backView ? "back" : "front") + (hasHat ? (P.capHat ? "_cap" : "_hat") : "")];
    const hp = { h: P.hat, H: P.hatB, r: P.hair, k: P.skin, K: P.skinD, e: P.eye, w: P.white, b: P.brow, m: P.mouth };
    grid(headL, rows, RX - 8, top - 15, hp, false);
    decorHead(headL, backView ? "back" : "front", RX - 8, top - 15, P);
    [legs, body, arms].forEach(Ly => shade(Ly, -1));
    [legs, body, arms, headL].forEach(Ly => stack(out, Ly));
    return out;
  }


  /* ---------- 車（側面行駛，看得到車頂；72×56 一格，車底中央＝腳底位置） ----------
     SP.car(g, x, y, { col, patrol, f, facing, door })   f：輪子轉到第幾格（0–3），door：司機位車門打開 */
  function carFrame(o){
    const col = hex(o.col || "#7a8a9a"), dark = mul(col, 0.62), top = mul(col, 1.18), glass = [52, 70, 98], glassL = [96, 124, 160];
    const back = layer(), bodyL = layer(), det = layer(), wh = layer();
    const f = ((o.f || 0) % 4 + 4) % 4;
    // 車身側面
    poly(bodyL, [[5, 34], [66, 34], [68, 40], [67, 47], [4, 47], [3, 40]], col);
    rect(bodyL, 4, 45, 64, 2, dark);
    // 車頂那一面（3/4 俯視看得到）：車尾、車頂、車頭蓋
    poly(bodyL, [[6, 28], [20, 26], [21, 34], [5, 34]], top);           // 車尾箱
    poly(bodyL, [[46, 27], [64, 29], [66, 34], [47, 34]], top);         // 車頭蓋
    poly(bodyL, [[21, 17], [44, 17], [50, 26], [52, 34], [19, 34], [20, 26]], col);   // 車廂
    rect(bodyL, 23, 17, 20, 7, top);                                    // 車頂
    // 窗
    poly(det, [[22, 25], [33, 25], [33, 33], [21, 33]], glass); poly(det, [[35, 25], [45, 25], [49, 33], [35, 33]], glass);
    put(det, 24, 26, glassL); put(det, 25, 26, glassL); put(det, 37, 26, glassL); put(det, 38, 26, glassL);
    poly(det, [[44, 18], [46, 18], [51, 26], [49, 26]], glass);         // 擋風玻璃（斜）
    // 門縫、門柄、輪拱
    rect(det, 34, 34, 1, 11, dark); rect(det, 20, 34, 1, 11, dark); rect(det, 29, 37, 3, 1, mul(col, 1.35)); rect(det, 43, 37, 3, 1, mul(col, 1.35));
    // 燈
    rect(det, 65, 36, 3, 3, [250, 236, 170]); rect(det, 3, 36, 2, 3, [200, 50, 40]);
    if (o.patrol){ rect(det, 6, 39, 61, 2, [40, 70, 160]); const on = f % 2; rect(det, 27, 15, 5, 2, on ? [230, 60, 50] : [60, 90, 230]); rect(det, 33, 15, 5, 2, on ? [60, 90, 230] : [230, 60, 50]); }
    if (o.door){ poly(det, [[35, 34], [48, 34], [53, 25], [40, 25]], mul(col, 0.9)); rect(det, 36, 34, 12, 11, [30, 26, 24]); }
    // 輪：轉的時候輪轂上那一點跟著轉
    [[17, 48], [55, 48]].forEach(([cx, cy]) => {
      for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) if (x * x + y * y <= 26) put(wh, cx + x, cy + y, [28, 28, 30]);
      for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) if (x * x + y * y <= 5) put(wh, cx + x, cy + y, [150, 150, 156]);
      const a = f * Math.PI / 2; put(wh, cx + Math.round(Math.cos(a) * 2), cy + Math.round(Math.sin(a) * 2), [60, 60, 64]); });
    shade(bodyL, -1);
    const out = layer(); [back, bodyL, det, wh].forEach(Ly => stack(out, Ly)); return out;
  }
  function car(g, x, y, o = {}){
    const key = "car|" + JSON.stringify(o); let cv = cache.get(key);
    if (!cv){ const Ly = carFrame(o); cv = document.createElement("canvas"); cv.width = W; cv.height = H; const c = cv.getContext("2d"), id = c.createImageData(W, H);
      Ly.px.forEach((p, i) => { if (!p) return; id.data[i * 4] = p[0]; id.data[i * 4 + 1] = p[1]; id.data[i * 4 + 2] = p[2]; id.data[i * 4 + 3] = 255; }); c.putImageData(id, 0, 0); cache.set(key, cv); }
    g.save(); g.globalAlpha = 0.3; g.fillStyle = "#000"; g.beginPath(); g.ellipse(Math.round(x), Math.round(y) - 1, 34, 4, 0, 0, 7); g.fill(); g.restore();
    g.save(); g.translate(Math.round(x), Math.round(y)); if ((o.facing || 1) < 0) g.scale(-1, 1); g.imageSmoothingEnabled = false; g.drawImage(cv, -RX, -RY); g.restore();
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
  // 這一格離地多高（高處墮下：人在半空，畫的時候整個往上移）
  const airOf = o => { const A = ACTS[o.act]; if (!A || o.act === "walk") return 0; const fr = A(), n = fr.length; return fr[((o.f || 0) % n + n) % n].air || 0; };
  function draw(g, x, y, L, o = {}){
    y -= airOf(o) * (o.s || 1);
    const cv = render(L, o), flip = (o.view || "side") === "side" && (o.facing || 1) < 0, s = o.s || 1;
    g.save(); g.translate(Math.round(x), Math.round(y)); if (flip) g.scale(-1, 1);
    g.imageSmoothingEnabled = false; g.drawImage(cv, -RX * s, -RY * s, W * s, H * s); g.restore();
    return { x: x - 12 * s, y: y - 42 * s, w: 24 * s, h: 42 * s };
  }
  return { draw, render, frames, airOf, car, ACTS, W, H, RX, RY };
})();
if (typeof module !== "undefined") module.exports = SP;
