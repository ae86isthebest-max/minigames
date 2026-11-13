/* =========================================================
   集與集之間的生活小場景：全部在同一間露天咖啡店「海風咖啡」外面的座位
   ・SC.cafe：opt.time＝morning / noon / dusk / night，opt.rain＝true 下雨（雨棚會拉下來）
   ・自動接線：ARC_INTER[集數].before / after 只要 sceneWanted:"cafe"（或 scene:"cafe"），就用這個場景；
     時間、天氣沒寫的話，從標題（早上、中午、午休、下午、傍晚、下班後、晚上）和內容（雨）自己猜。
   載入順序：所有 case 檔之後。
   ========================================================= */
(() => {
  const PR = PX.prim, { R, P, dither, INK } = PR, W = 192, H = 108;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const SKY = { morning:["#9cc8e8","#f4ecd8"], noon:["#7ab4e4","#e8f0f4"], dusk:["#3a3a6a","#f0a070"], night:["#0a0f1c","#24304a"] };
  PX.SCENES.cafe = (o) => { const tm = SKY[o.time] ? o.time : "noon", rain = !!o.rain, night = tm === "night", t = o.t || 0;
    const sk = SKY[tm]; PR.sky(rain ? (night ? "#0a0e16" : "#6a7684") : sk[0], rain ? (night ? "#1a2230" : "#a8b0b8") : sk[1], 60);
    // 對面的街景
    for (let k = 0; k < 6; k++){ const x = k * 34 - 6, h = 26 + (k * 13) % 18; R(x, 60 - h, 30, h, night ? "#1e2430" : ["#c8bca8","#b8c0c8","#d8c8b0"][k % 3]); for (let j = 0; j < 3; j++) R(x + 4 + j * 9, 64 - h + 4, 5, 4, night ? "#e8c870" : "#5a6a7a"); }
    // 街對面的警局（大家從咖啡店就看得到）
    R(122, 22, 56, 38, night ? "#262c38" : "#d8dce0"); R(122, 22, 56, 4, night ? "#1a2030" : "#2a4a7a"); for (let k = 0; k < 4; k++) R(122, 26 + k * 2, 56, 1, night ? "#1a2030" : "#b8c0c8");
    for (let j = 0; j < 4; j++){ R(127 + j * 13, 32, 8, 6, night ? "#e8d080" : "#7a90a8"); R(127 + j * 13, 42, 8, 6, night ? (j % 2 ? "#e8d080" : "#2a3040") : "#7a90a8"); }
    R(144, 50, 12, 10, night ? "#3a4050" : "#5a6a7a"); R(140, 49, 20, 1, "#2a4a7a"); R(148, 18, 4, 4, "#3a7ae8"); if (night || (o.t || 0) % 1 < .5) P(149, 19, "#c8e0ff");
    R(126, 23, 3, 2, "#f4f0e0"); R(171, 23, 3, 2, "#f4f0e0");
    R(0, 56, W, 6, night ? "#2a2e34" : "#7a7a76"); for (let x = 6; x < W; x += 24) R(x, 58, 10, 1, "#e8e0a0");   // 馬路
    // 咖啡店門面
    R(0, 18, 64, 56, night ? "#3a3028" : "#e8dcc4"); R(6, 30, 26, 30, night ? "#e8b860" : "#9cc5e6"); R(18, 30, 1, 30, "#6a5a44"); R(40, 32, 18, 42, "#6a4a32"); P(54, 52, "#e8c040");   // 牆、窗、門
    // 窗裡：吧台、吊燈、咖啡機；窗台花箱；門上的玻璃和營業牌
    R(6, 50, 26, 10, night ? "#8a5a30" : "#a87a50"); R(6, 49, 26, 1, "#6a4a32"); R(9, 44, 6, 5, "#5a5a5e"); R(10, 42, 4, 2, "#8a8a8e"); R(24, 46, 3, 3, "#f4f4f0");
    [10, 22].forEach(x => { R(x, 30, 1, 5, "#3a3028"); R(x - 2, 35, 5, 2, "#ffd98a"); });
    R(4, 60, 30, 4, "#7a4a2a"); for (let x = 5; x < 33; x += 4){ R(x, 57, 3, 3, "#4a8a3a"); P(x + 1, 56, ["#e85a6a","#f4d04a","#f4f0f0"][(x >> 2) % 3]); }
    R(43, 36, 12, 14, night ? "#e8b860" : "#9cc5e6"); R(42, 54, 14, 5, "#f4f0e0"); R(44, 56, 10, 1, "#2a7a8a");
    // 招牌：杯子圖案＋浪花＋CAFE
    R(0, 2, 64, 16, night ? "#3a3028" : "#e8dcc4"); R(4, 4, 56, 9, "#2a5a6a"); R(4, 13, 56, 1, "#1a3a4a"); R(7, 6, 6, 5, "#f4f0e0"); R(13, 7, 2, 3, "#f4f0e0"); R(8, 6, 4, 1, "#a87a50");
    for (let x = 17; x < 28; x++) P(x, 8 + ((x >> 1) % 2), "#8ad0d8");
    const F = { C:["111","100","100","100","111"], A:["010","101","111","101","101"], F:["111","100","110","100","100"], E:["111","100","110","100","111"] };
    "CAFE".split("").forEach((ch, i) => F[ch].forEach((row, y) => row.split("").forEach((b, x) => { if (b === "1") P(33 + i * 5 + x, 6 + y, "#f4f0e0"); })));
    if (tm === "dusk"){ const g = PR.g(); g.fillStyle = "rgba(240,150,90,.15)"; g.fillRect(0, 0, W, 70); R(6, 30, 26, 30, "#e8c080"); R(18, 30, 1, 30, "#6a5a44"); }
    if (night){ const g = PR.g(); g.fillStyle = "rgba(255,210,140,.18)"; g.fillRect(0, 30, 70, 50); }
    // 雨棚（下雨時拉長）
    const aw = rain ? 150 : 120; for (let x = 0; x < aw; x += 8){ R(x, 14, 8, 6, (x / 8) % 2 ? "#f4f0e0" : "#2a7a8a"); } R(0, 20, aw, 1, "#1a4a5a");
    for (let x = 0; x < aw; x += 8) R(x + 2, 20, 4, 2, (x / 8) % 2 ? "#f4f0e0" : "#2a7a8a");
    if (tm === "dusk" || night){ for (let x = 3; x < aw; x += 6){ R(x, 23 + (x % 12 < 6 ? 1 : 0), 1, 1, "#3a3028"); P(x, 24 + (x % 12 < 6 ? 1 : 0), ["#ffd98a","#ffb86a","#fff0b0"][(x / 6 | 0) % 3]); } }
    // 路燈、停在路邊的腳踏車
    R(112, 30, 1, 40, "#4a4e56"); R(110, 29, 5, 2, "#4a4e56"); R(110, 31, 4, 1, night || tm === "dusk" ? "#ffe8a0" : "#c8ccd0");
    if (!rain){ const bx = 92; [0, 14].forEach(d => { R(bx + d, 62, 6, 1, "#2a2a2e"); R(bx + d, 68, 6, 1, "#2a2a2e"); R(bx + d, 62, 1, 7, "#2a2a2e"); R(bx + d + 5, 62, 1, 7, "#2a2a2e"); }); R(bx + 3, 63, 14, 1, "#c84a3a"); R(bx + 9, 60, 1, 4, "#c84a3a"); R(bx + 7, 59, 4, 1, "#2a2a2e"); R(bx + 16, 59, 1, 4, "#c84a3a"); R(bx + 15, 59, 3, 1, "#2a2a2e"); R(bx + 14, 61, 5, 2, "#a87a50"); }
    // 小黑板菜單、盆栽
    R(66, 52, 14, 18, "#2a2a2a"); R(67, 53, 12, 12, "#3a4a3a"); for (let k = 0; k < 3; k++) R(69, 56 + k * 3, 8, 1, "#e8e8e0"); R(68, 65, 2, 6, "#6a4a32"); R(76, 65, 2, 6, "#6a4a32");
    R(178, 56, 12, 14, "#a85a3a"); R(176, 46, 16, 12, "#3a7a3a"); R(180, 42, 8, 6, "#4a8a4a");
    // 地面（騎樓磁磚）
    PR.floor(70, night ? (rain ? "#3a3c40" : "#5a5048") : rain ? "#8a8a86" : tm === "dusk" ? "#b8a088" : "#c8b8a0", night ? (rain ? "#32343a" : "#504840") : rain ? "#7a7a76" : tm === "dusk" ? "#a89078" : "#b8a890"); if (rain) for (let k = 0; k < 9; k++) R((k * 47) % 176 + 6, 74 + (k * 11) % 30, 12 + k % 3 * 4, 1, night ? "#4a5a70" : "#a8b4c0");
    // 戶外桌椅：兩張圓桌
    const TB = [50, 104, 158], ch = night ? "#8a8a90" : "#3a3a3e"; const table = (x) => { R(x - 10, 80, 20, 3, "#e8e8e4"); R(x - 1, 83, 2, 14, "#5a5a5e"); R(x - 5, 97, 10, 2, "#5a5a5e"); R(x - 4, 76, 4, 4, "#f4f4f0"); R(x - 3, 75, 2, 1, "#6a4a32"); R(x + 2, 77, 3, 3, "#f4f4f0");
      [-16, 16].forEach(d => { R(x + d - 3, 86, 7, 2, ch); R(x + d - 3, 88, 1, 9, ch); R(x + d + 3, 88, 1, 9, ch); R(x + d + (d < 0 ? -3 : 3), 76, 1, 10, ch); }); };
    if (!rain){ R(157, 40, 1, 40, "#6a6a6e"); for (let k = 0; k < 6; k++) R(140 + k * 6, 38 + Math.abs(k - 2.5) | 0, 6, 3, k % 2 ? "#f4f0e0" : "#2a7a8a"); R(142, 37, 32, 1, "#1a4a5a"); }
    TB.forEach(table);
    R(44, 77, 2, 3, "#e8d8b0"); R(110, 78, 3, 2, "#c8a070");
    // 第 14 集結束以後（第 15 集開場起）：鑑識犬豆花趴在桌腳；第 15 集起：送貨員阿彬的機車停在路邊
    const ep = o.ep || 0;
    if (ep >= 15){ const mx = 74; R(mx, 62, 16, 5, "#c83a2a"); R(mx + 2, 67, 4, 4, "#1e1e22"); R(mx + 11, 67, 4, 4, "#1e1e22"); R(mx + 12, 58, 2, 5, "#3a3a3e"); R(mx + 1, 59, 8, 3, "#8a6a4a"); }
    if (ep >= 15){ const dx = 112; R(dx, 93, 14, 5, "#f0dcb0"); R(dx + 12, 90, 6, 5, "#f0dcb0"); P(dx + 17, 92, INK); P(dx + 15, 91, INK); R(dx + 12, 89, 2, 3, "#d8c090"); R(dx - 2, 94, 3, 1, "#f0dcb0"); R(dx + 1, 98, 3, 1, "#e0c8a0"); R(dx + 9, 98, 3, 1, "#e0c8a0"); }   // 糖包、餅乾
    // 雨
    if (rain){ for (let i = 0; i < 70; i++){ const x = (i * 53 + Math.floor(t * 30) * 2) % W, y = (i * 37 + Math.floor(t * 90)) % H; if (x > aw || y < 20) R(x, y, 1, 3, "#8aa0b8"); } for (let x = 0; x < aw; x += 7) R(x + 3, 22 + ((x + Math.floor(t * 40)) % 6), 1, 2, "#9ab0c8"); }
  };

  // 阿月姨麵攤（深夜路邊，opt.rain 下雨）
  PX.SCENES.noodle = (o) => { const rain = !!o.rain, t = o.t || 0;
    PR.sky("#080c16", "#1c2438", 60);
    for (let k = 0; k < 6; k++){ const x = k * 34 - 4, h = 30 + (k * 11) % 16; R(x, 62 - h, 30, h, "#161b26"); for (let j = 0; j < 3; j++) if ((k + j) % 2) R(x + 4 + j * 9, 66 - h + 4, 5, 4, "#d8b860"); }
    PR.floor(66, rain ? "#2a2e36" : "#3a3a3e", rain ? "#24282e" : "#34343a"); if (rain) for (let k = 0; k < 7; k++) R((k * 41) % 180 + 4, 72 + (k * 13) % 30, 14, 1, "#5a6a80");
    // 攤車
    R(20, 40, 90, 4, "#c83a2a"); for (let x = 20; x < 110; x += 10) R(x, 44, 5, 3, "#c83a2a"); R(24, 44, 2, 34, "#5a5a5e"); R(104, 44, 2, 34, "#5a5a5e");
    R(26, 58, 78, 20, "#a8a8a4"); R(26, 58, 78, 3, "#d8d8d4"); R(34, 50, 14, 8, "#7a7a7e"); R(36, 48, 10, 2, "#9a9a9e");   // 攤台、湯鍋
    for (let k = 0; k < 3; k++){ const s = Math.floor(t * 3 + k) % 2; P(38 + k * 4, 46 + s, "#c8c8d0"); }   // 蒸氣
    R(60, 47, 1, 3, INK); R(58, 50, 5, 2, "#ffd98a"); R(52, 64, 30, 9, "#c83a2a"); txt("阿月麵", 54, 71, "#f4e8c0", "6px sans-serif");
    // 折疊桌椅
    const tb = (x) => { R(x - 14, 82, 28, 3, "#d84a3a"); R(x - 12, 85, 2, 12, "#8a8a8e"); R(x + 10, 85, 2, 12, "#8a8a8e"); R(x - 6, 79, 4, 3, "#f4f4f0"); R(x + 3, 79, 4, 3, "#f4f4f0");
      [-20, 20].forEach(d => { R(x + d - 4, 90, 8, 2, "#3a6ac8"); R(x + d - 4, 92, 1, 6, "#3a6ac8"); R(x + d + 3, 92, 1, 6, "#3a6ac8"); }); };
    tb(140);
    if (rain){ R(118, 34, 70, 3, "#3a5a7a"); R(120, 37, 1, 40, "#5a5a5e"); R(184, 37, 1, 40, "#5a5a5e");
      for (let i = 0; i < 80; i++){ const x = (i * 53 + Math.floor(t * 30) * 2) % W, y = (i * 37 + Math.floor(t * 90)) % H; if (!((x > 18 && x < 112 && y > 40) || (x > 116 && x < 188 && y > 34))) R(x, y, 1, 3, "#7a90a8"); } }
  };
  // 高鐵車廂（窗外流過的景色）
  PX.SCENES.train = (o) => { const t = o.t || 0, night = o.time === "night";
    R(0, 0, W, H, "#d8d4cc"); R(0, 0, W, 10, "#bcb8b0"); R(0, 9, W, 1, "#9a968e");
    for (let k = 0; k < 3; k++){ const wx = 8 + k * 64; R(wx, 18, 52, 30, night ? "#0e1424" : "#9cc8e8");
      if (!night){ R(wx, 36, 52, 12, "#7aa860"); for (let i = 0; i < 4; i++){ const hx = wx + ((i * 17 - Math.floor(t * 60)) % 52 + 52) % 52; R(hx, 32, 6, 4, "#5a7a4a"); } }
      else for (let i = 0; i < 3; i++){ const lx = wx + ((i * 19 - Math.floor(t * 50)) % 52 + 52) % 52; P(lx, 38 + i * 3, "#e8c870"); }
      R(wx - 2, 16, 56, 2, "#8a867e"); R(wx - 2, 48, 56, 2, "#8a867e"); }
    R(0, 58, W, 50, "#6a6e78"); for (let x = 4; x < W; x += 30){ R(x, 52, 24, 30, "#2a5a8a"); R(x + 2, 50, 20, 6, "#3a6a9a"); R(x + 2, 54, 20, 2, "#f4f4f0"); }   // 座椅
    R(0, 84, W, 24, "#4a4e58"); dither(0, 84, W, 24, "#545862", 4);
  };

  // 麵攤、高鐵：便服；麵攤的人坐在折疊桌兩邊、阿月姨站在攤車後面；高鐵上大家坐在座位上
  const offDuty = (cast, noodle) => { let k = 0; const list = (cast || []).slice(); if (!list.some(c => c.id === "_you")) list.push({ id:"_you" });
    return list.map(c => { const look = lookFor(c.id);
      if (noodle && c.id === "ayue") return Object.assign({}, c, { x:50, y:98, s:1.2, facing:1, pose:"stand", look });
      const i = k++; return Object.assign({}, c, noodle ? { x:[124,156,108,172][i % 4], y:97, s:1.15, facing:i % 2 ? -1 : 1, pose:"sit", look } : { x:[34,64,98,128][i % 4], y:86, s:1.15, facing:1, pose:"sit", look }); }); };
  // 前景：桌面和椅子前腳畫在人前面，坐著的人看起來就真的坐在桌邊
  const draw0 = PX.draw;
  PX.draw = (cv, name, opt = {}) => { const hits = draw0(cv, name, opt);
    if (name === "cafe" && (opt.people || []).some(p => /^sit/.test(p.pose || ""))){ const night = opt.time === "night", ch = night ? "#8a8a90" : "#3a3a3e";
      [50, 104, 158].forEach(x => { R(x - 10, 80, 20, 3, "#e8e8e4"); R(x - 10, 82, 20, 1, "#b8b8b4"); R(x - 1, 83, 2, 14, "#5a5a5e"); R(x - 5, 97, 10, 2, "#5a5a5e"); R(x - 4, 76, 4, 4, "#f4f4f0"); R(x - 3, 75, 2, 1, "#6a4a32"); R(x + 2, 77, 3, 3, "#f4f4f0");
        [-1, 1].forEach(d => { const cx = x + d * 9; if ((opt.people || []).some(p => Math.abs(p.x - cx) < 3 && /^sit/.test(p.pose || ""))){ R(cx - 4, 90, 9, 2, ch); R(cx - 4, 92, 1, 6, ch); R(cx + 4, 92, 1, 6, ch); } }); }); }
    return hits; };

  // 從標題、內容猜時間和天氣
  const guess = d => { const s = (d.title || "") + JSON.stringify(d.lines || []);
    const time = /早上|早餐|上班前/.test(d.title || "") ? "morning" : /中午|午休/.test(d.title || "") ? "noon" : /傍晚|黃昏|下班/.test(d.title || "") ? "dusk" : /晚上|深夜|夜/.test(d.title || "") ? "night" : "noon";
    return { time, rain: /下雨|雨夜|雨傘|撐傘|雨棚|雨聲/.test(s) }; };
  // 咖啡店裡的打扮（下班或休息時的便服；老闆有圍裙）。只用在咖啡店的場景，案件裡照原來的工作服。
  const CAFE_LOOK = {
    _you:{ skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" },
    barista:{ skin:"#d8a880", hair:"#3a2a20", hairStyle:"short", top:"#f4f0e6", apron:"#7a4a2a", bottom:"#3a3430", beard:true, cupColor:"#f4f0e0" },
    su:{ skin:"#e8c8a8", hair:"#2a2220", hairStyle:"slick", top:"#e9e4da", coat:"#24324e", bottom:"#24324e", tie:"#7a2a2a", glasses:true },
    ye:{ skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"pony", top:"#f4f4f0", coat:"#6a6e74", bottom:"#6a6e74", skirt:true },
    wu:{ skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f0a040", bottom:"#3a5a8a", shoes:"#e8e8e8", glasses:true },
    xu:{ skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#8a8c92", hood:null, bottom:"#2a2a30", cupColor:"#c8a070" },
    qian:{ age:"old", skin:"#e0b48c", hair:"#b8b8b0", hairStyle:"balding", top:"#e9e4da", coat:"#8a7a5a", bottom:"#4a4438", glasses:true },
    zhou:{ age:"old", skin:"#d8a880", hair:"#6a6a66", hairStyle:"slick", top:"#e9e4da", coat:"#6a6e74", bottom:"#3a3f4a", tie:"#2a3a6a" },
    ayue:{ age:"old", skin:"#d8a880", hair:"#4a4440", hairStyle:"bob", top:"#c84a4a", apron:"#e8e0d0", bottom:"#3a3a44" }
  };
  const lookFor = id => CAFE_LOOK[id] || null;
  // 大家坐在外面：老闆站在店門口，其他人兩兩坐在兩張圓桌旁（沈岳一定坐第一張桌）
  const SEATS = [[41,1],[59,-1],[95,1],[113,-1],[149,1],[167,-1]];
  const seat = (cast, ep) => { const list = (cast || []).slice(), out = [];
    // 隔壁桌看報紙的律師（第 12 集起，固定坐最右邊那桌）
    const su = list.find(c => c.id === "su") || (ep >= 12 && typeof ARC !== "undefined" && ARC.look && ARC.look("su") ? { id:"su" } : null);
    if (su){ list.splice(list.indexOf(su) >>> 0, list.includes(su) ? 1 : 0); out.push(Object.assign({}, su, { x:167, y:97, s:1.15, facing:-1, pose:"sit+read", look:lookFor("su") })); }
    if (!list.some(c => c.id === "_you")) list.push({ id:"_you" });   // 你一定在座
    const bar = list.filter(c => c.id === "barista"), rest = list.filter(c => c.id !== "barista");
    rest.sort((a, b) => (b.id === "_you") - (a.id === "_you"));
    bar.forEach(c => out.push(Object.assign({}, c, { x:20, y:99, s:1.2, facing:1, pose:c.pose || "stand+cup", look:lookFor(c.id) })));
    rest.forEach((c, i) => { const [x, f] = SEATS[Math.min(i, SEATS.length - 1)], late = i >= 6;
      out.push(Object.assign({}, c, { x, y: late ? 99 : 97, s: late ? 1.2 : 1.15, facing: f, pose: late ? (c.pose || "stand") : "sit" + (c.pose && c.pose !== "stand" && c.pose !== "sit" ? "+" + c.pose.split("+").pop() : ""), look:lookFor(c.id) })); });
    return out; };
  const wire = (d, ep) => { if (!d) return d; if (d.sceneWanted !== "cafe" && d.scene !== "cafe") return d;
    const fix = L => L && L.cut && (L.cut.scene === "cafe" || L.cut.sceneWanted === "cafe") ? Object.assign({}, L, { cut:Object.assign({}, L.cut, { scene:"cafe", cast:seat(L.cut.cast, ep), opt:Object.assign({}, L.cut.opt || {}, { ep }) }) }) : L;
    return Object.assign({}, d, { scene:"cafe", cast:seat(d.cast, ep), opt:Object.assign(guess(d), d.opt || {}, { ep }), lines:(d.lines || []).map(fix) }); };
  if (typeof ARC_INTER === "undefined") return;
  CASES.forEach((c, i) => { const A = ARC_INTER[i + 1]; if (!A) return;
    if (A.before && (A.before.sceneWanted === "cafe" || A.before.scene === "cafe")) c.before = wire(A.before, i + 1);
    if (A.after && (A.after.sceneWanted === "cafe" || A.after.scene === "cafe")) c.after = wire(A.after, i + 1);
    // 麵攤、高鐵：場景已做好，沒指定別的場景就接上
    const cur = c.after, sw = cur && String(cur.sceneWanted || "");
    if (cur && !PX.SCENES[cur.scene] && /^(noodle|train)/.test(sw))
      c.after = Object.assign({}, cur, { scene: sw.slice(0, sw.startsWith("noodle") ? 6 : 5), cast: offDuty(cur.cast, sw.startsWith("noodle")), opt: Object.assign({ rain: /雨/.test(sw + (cur.title || "")), time: /晚|夜/.test(cur.title || "") ? "night" : "noon" }, cur.opt || {}) }); });
})();
