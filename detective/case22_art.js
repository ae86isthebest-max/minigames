/* =========================================================
   第 22 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP22.art = true;
(() => {
  const PR = PX.prim, { R, P, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l);
  const SC = PX.SCENES;
  const txt = (s, x, y, c, f) => { const g = PR.g(); g.font = f || "6px monospace"; g.fillStyle = c; g.fillText(s, x, y); };
  const jds = bs => Object.assign(bs.map(b => b.d), { j:bs.map(b => !!b.join) });
  const beatAt = (t, ds) => { let el = 0; for (let i = 0; i < ds.length; i++){ const st = el + (ds.j && ds.j[i] ? 0 : 0.5), en = st + ds[i]; if (t < en || i === ds.length - 1) return [i, Math.max(0, Math.min(1, (t - st) / ds[i]))]; el = en; } return [0, 0]; };
  const stOf = o => { if (!o.ds) return {}; const [i] = beatAt(o.t || 0, o.ds); return (o.seq || [])[i] || {}; };
  const glow = (x, y, r, rgb, a) => { for (let k = r; k > 0; k -= 2){ const al = Math.round(a * (1 - k / r) * 255).toString(16).padStart(2, "0"); R(x - k, y - k * 0.7, k * 2, k * 1.4, rgb + al); } };
  // 保險箱牆：一格一格的小門，號碼牌，鑰匙孔
  const boxWall = (x, y, cols, rows, open) => { R(x - 2, y - 2, cols * 11 + 3, rows * 8 + 3, "#6a6a62");
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++){ const bx = x + i * 11, by = y + j * 8, k = j * cols + i;
      if (open && open.includes(k)){ R(bx, by, 10, 7, "#1a1a1a"); continue; }
      R(bx, by, 10, 7, "#b8b4a4"); R(bx, by, 10, 1, "#d8d4c4"); P(bx + 7, by + 3, "#3a3a3a"); R(bx + 1, by + 2, 3, 1, "#8a8678"); } };
  const OPEN = [3, 14, 17, 22, 31, 36, 40];
  // 金庫的圓門
  const vaultDoor = (x, y, open, dim) => { const c = dim ? "#4a5a52" : "#8a8e90", c2 = dim ? "#3a4842" : "#6a6e70";
    if (open){ R(x, y, 10, 60, c2); R(x + 2, y + 6, 6, 48, c); for (let k = 0; k < 4; k++) R(x + 3, y + 12 + k * 10, 4, 3, "#c8c8c0"); return; }
    for (let dy = -30; dy <= 30; dy++){ const w = Math.round(Math.sqrt(900 - dy * dy)); R(x + 30 - w, y + 30 + dy, w * 2, 1, c); }
    for (let dy = -24; dy <= 24; dy++){ const w = Math.round(Math.sqrt(576 - dy * dy)); R(x + 30 - w, y + 30 + dy, w * 2, 1, c2); }
    R(x + 28, y + 14, 4, 32, c); R(x + 14, y + 28, 32, 4, c); R(x + 26, y + 26, 8, 8, dim ? "#5a6a62" : "#a8acae"); };

  /* ---------- 澄港信用合作社 ---------- */
  // 大廳：玻璃門（貼著停電公告）、櫃台、號碼燈、利率看板、等候椅
  SC.c22_lobby = (o) => { const n = !!o.night;
    wall(84, n ? "#a8a090" : "#e8e0cc", false); R(0, 78, W, 6, n ? "#8a8270" : "#c8bca0");
    R(2, 24, 26, 60, "#5a6a72"); R(4, 26, 22, 56, n ? "#2a3440" : "#b8d4e4"); R(15, 26, 1, 56, "#5a6a72");
    R(8, 32, 14, 18, "#f4f4f0"); R(9, 34, 12, 2, "#c83a2a"); for (let k = 0; k < 4; k++) R(9, 38 + k * 3, 10 - k, 1, "#6a6a7a");   // 公告
    R(120, 14, 40, 14, "#1a1a1e"); for (let k = 0; k < 7; k++) R(122 + k * 5, 18, 4, 2, "#e83a2a"); R(122, 23, 30, 1, "#e8a03a");   // 利率看板
    R(40, 54, 140, 30, "#8a6a4a"); R(40, 54, 140, 2, "#a88a6a"); for (let k = 0; k < 4; k++){ R(46 + k * 34, 36, 28, 18, "#c8e0e8aa"); R(46 + k * 34, 36, 28, 1, "#8aa0a8"); txt(String(k + 1), 58 + k * 34, 32, "#3a3a3a", "6px monospace"); }
    R(84, 4, 24, 8, "#1a1a1e"); txt("087", 88, 11, "#e83a2a", "7px monospace");
    floor(84, n ? "#8a8478" : "#c8c0b0", n ? "#7a7468" : "#b8b0a0");
    for (let k = 0; k < 3; k++){ R(30 + k * 16, 88, 14, 4, "#3a6a9a"); R(31 + k * 16, 92, 2, 6, "#5a5a5a"); R(41 + k * 16, 92, 2, 6, "#5a5a5a"); }
    if (0) floor(96, n ? "#8a8478" : "#c8c0b0", n ? "#7a7468" : "#b8b0a0");
  };
  // 金庫：左邊打開的圓門和時間鎖面板，後面一整面保險箱牆，地上的抽屜，牆上的清潔紀錄
  SC.c22_vault = (o) => { o = Object.assign({}, o, stOf(o));
    wall(86, "#7a7e78", false); R(0, 80, W, 6, "#6a6e68");
    vaultDoor(2, 20, true); R(12, 20, 22, 62, "#2a2a2a");   // 打開的門洞
    R(36, 34, 10, 12, "#2a2a2e"); R(37, 35, 8, 4, o.lockLit ? "#6ae86a" : "#3a8a3a"); for (let k = 0; k < 6; k++) P(38 + (k % 3) * 3, 41 + Math.floor(k / 3) * 2, "#c8c8c0");   // 時間鎖面板
    boxWall(52, 10, 12, 8, o.pried === false ? [] : OPEN);
    R(160, 40, 14, 18, "#f4f4f0"); R(161, 41, 12, 2, "#3a6a8a"); for (let k = 0; k < 4; k++) R(161, 45 + k * 3, 10 - (k % 2) * 3, 1, "#6a6a7a");   // 清潔紀錄
    floor(86, "#8a8a84", null);
    if (o.pried !== false){ for (let k = 0; k < 7; k++){ const x = 58 + k * 10, y = 82 + (k % 2) * 3; R(x, y, 9, 4, "#b8b4a4"); R(x + 1, y + 1, 7, 2, "#8a2a2a"); } }
    if (o.prints) for (let k = 0; k < 10; k++) R(44 + k * 11, 93 + (k % 2) * 2, 4, 2, "#6a6a64");
  };
  // 金庫門口的走廊（監視器的視角）：圓門關著、兩盞緊急照明
  SC.c22_corr = (o) => { o = Object.assign({}, o, stOf(o)); const dim = !!o.dim;
    wall(84, dim ? "#3a4a44" : "#9a9e98", false); R(0, 78, W, 6, dim ? "#2a3a34" : "#7a7e78");
    if (!dim){ R(30, 2, 30, 3, "#f4f4e8"); R(130, 2, 30, 3, "#f4f4e8"); }
    vaultDoor(66, 18, !!o.open, dim); if (o.open) R(76, 18, 40, 60, "#14141a");
    R(112, 36, 10, 12, "#2a2a2e"); R(113, 37, 8, 4, dim ? "#3a8a3a" : "#4aa84a");
    R(8, 12, 10, 5, "#2a3a2a"); R(9, 13, 8, 3, dim ? "#6ae88a" : "#3a6a3a"); if (dim) glow(13, 20, 16, "#6ae88a", 0.35);
    R(172, 12, 10, 5, "#2a3a2a"); R(173, 13, 8, 3, dim ? "#6ae88a" : "#3a6a3a"); if (dim) glow(177, 20, 16, "#6ae88a", 0.35);
    floor(84, dim ? "#2a3430" : "#7a7e78", null);
    if (o.moth){ const [mx, my] = o.moth; R(mx - 1, my, 5, 2, "#e8e0c0"); R(mx + 1, my - 1, 1, 4, "#a89a70"); }
  };
  // 保全室：螢幕牆和錄影機、排班表、UPS 機櫃、置物櫃
  SC.c22_sec = (o) => { o = Object.assign({}, o, stOf(o));
    wall(84, "#c8ccc4", false); R(0, 78, W, 6, "#a8aca4");
    R(20, 18, 60, 34, "#2a2a2e"); for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) R(22 + i * 15, 20 + j * 16, 13, 14, (i + j) % 3 ? "#3a5a6a" : "#4a6a5a");
    R(28, 56, 26, 8, "#1a1a1e"); R(30, 58, 4, 2, "#6ae86a"); R(48, 58, 3, 3, "#8a8a8a");   // 錄影機
    PR.OBJ.desk(14, 64, 80); R(61, 59, 3, 5, "#8a9aa8"); R(61, 59, 3, 1, "#3a3a3e"); R(65, 59, 3, 5, "#c8a878"); R(65, 59, 3, 1, "#3a3a3e");   // 兩個保溫杯（d22_mug）
    R(96, 18, 24, 20, "#f4f4f0"); for (let k = 0; k < 6; k++) R(98, 21 + k * 3, 18, 1, k === 2 ? "#c83a2a" : "#6a6a7a");   // 排班表
    R(140, 30, 26, 54, "#3a3e44"); R(142, 34, 22, 10, "#1a1a1e"); R(144, 36, 12, 2, "#6ae86a"); R(144, 40, 8, 2, "#e8c040"); for (let k = 0; k < 4; k++) R(144, 50 + k * 6, 18, 3, "#2a2e34");   // UPS
    R(174, 24, 16, 60, "#6a7a8a"); R(182, 24, 1, 60, "#4a5a6a"); P(178, 50, "#c8c8c0"); P(186, 50, "#c8c8c0"); for (let k = 0; k < 3; k++) R(176, 28 + k * 3, 4, 1, "#4a5a6a");   // 置物櫃
    R(104, 64, 20, 20, "#3a3a3e"); R(102, 60, 24, 5, "#4a4a4e");   // 椅子
    R(86, 40, 8, 10, "#8a6a4a"); for (let k = 0; k < 3; k++) P(88 + k * 2, 43, "#c8c8c0"); R(88, 45, 1, 3, "#d8b84a");   // 鑰匙掛勾
    floor(84, "#8a8e88", "#7a7e78");
  };
  // 副理辦公室：書桌（抽屜）、電腦螢幕、相框、垃圾桶、窗戶
  SC.c22_office = (o) => { const n = !!o.night;
    wall(84, "#d8d0c0", false); R(0, 78, W, 6, "#b8b0a0");
    R(140, 16, 34, 26, n ? "#1a2030" : "#9cc5e6"); R(156, 16, 1, 26, "#5a5a5a"); if (n) for (let k = 0; k < 5; k++) R(143 + k * 6, 30 + (k % 2) * 4, 2, 2, "#ffd98a");
    R(20, 20, 30, 14, "#7a5a3a"); R(22, 22, 26, 10, "#c8b890");   // 證書
    PR.OBJ.desk(40, 60, 90); R(58, 62, 22, 5, "#7a5a3a"); R(67, 64, 4, 1, "#c8a870");
    R(98, 40, 18, 14, "#2a2a2e"); R(99, 41, 16, 11, "#1a2a1a"); for (let k = 0; k < 5; k++) R(100 + k * 3, 44 + k * 1.5, 2, 1, "#3ae83a"); R(105, 54, 4, 6, "#2a2a2e");   // 股票（綠）
    R(20, 48, 12, 10, "#8a6a4a"); R(21, 49, 10, 8, "#7ab8d8"); R(20, 58, 2, 2, "#8a6a4a");   // 相框（放在小櫃子上）
    R(14, 58, 26, 26, "#7a5a3a");
    R(138, 74, 12, 10, "#5a5a5e"); R(140, 72, 4, 3, "#f4f4f0"); R(144, 71, 3, 3, "#e8e4d8");   // 垃圾桶
    R(110, 64, 20, 18, "#3a3a3e"); R(108, 60, 24, 5, "#4a4a4e");
    floor(84, "#8a6a4a", "#7a5a3a");
  };
  // 後巷：合作社的後門、垃圾袋、大型垃圾車、路燈
  SC.c22_alley = (o) => { o = Object.assign({}, o, stOf(o)); const n = !!o.night;
    R(0, 0, W, 24, n ? "#0c1022" : "#a8c4dc");
    R(0, 20, 90, 66, n ? "#5a5248" : "#a8a090"); for (let y = 26; y < 86; y += 6) R(0, y, 90, 1, n ? "#4a4238" : "#988a7a");
    R(90, 24, 102, 62, n ? "#4a4440" : "#8a8278"); for (let y = 30; y < 86; y += 6) R(90, y, 102, 1, n ? "#3a3430" : "#7a7268");
    R(30, 30, 24, 52, "#5a6068"); R(32, 32, 20, 48, "#6a7078"); R(48, 54, 3, 2, "#c8c8c0"); R(56, 34, 4, 3, "#2a2a2e"); P(57, 35, "#e83a3a");   // 後門
    R(64, 26, 12, 3, "#3a3a3a"); txt("信用合作社", 62, 24, n ? "#8a8a80" : "#3a3a3a", "4px sans-serif");
    R(130, 52, 40, 32, "#2a6a3a"); R(128, 50, 44, 3, "#3a7a4a"); R(134, 58, 32, 1, "#1a5a2a");   // 大垃圾箱
    for (let k = 0; k < 3; k++){ const x = 98 + k * 9; R(x, 74 - (k % 2) * 3, 10, 12 + (k % 2) * 3, "#1a1a1e"); R(x + 3, 72 - (k % 2) * 3, 4, 2, "#2a2a2e"); }
    R(178, 6, 3, 80, "#4a4e54"); R(170, 6, 12, 3, "#4a4e54"); R(170, 9, 6, 2, n ? "#ffe8a0" : "#cfd6d6"); if (n) glow(173, 30, 30, "#ffe8a0", 0.18);
    floor(86, n ? "#2a2a2e" : "#5a5a5e", n ? "#24242a" : "#4a4a4e");
  };

  /* ---------- 澄港醫院（病房） ---------- */
  SC.c22_ward = (o) => { const n = !!o.night;
    wall(84, "#e4ece8", false); R(0, 78, W, 6, "#c8d4cc");
    R(20, 16, 34, 26, n ? "#1a2030" : "#9cc5e6"); R(37, 16, 1, 26, "#8a9a9a");
    R(70, 58, 64, 10, "#f4f6f6"); R(70, 54, 18, 6, "#ffffff"); R(72, 68, 3, 14, "#8a9a9a"); R(128, 68, 3, 14, "#8a9a9a"); R(88, 58, 46, 10, "#a8c8e0");   // 病床
    R(140, 30, 4, 54, "#8a9a9a"); R(136, 30, 12, 8, "#e8f0f4"); R(138, 38, 2, 10, "#c8d8e0");   // 點滴架
    R(108, 30, 22, 16, "#2a2a2e"); for (let x = 110; x < 128; x += 2) P(x, 38 + Math.round(Math.sin(x) * 3), "#6ae86a");   // 監視器
    R(56, 64, 22, 20, "#7a8a9a"); R(60, 62, 14, 8, "#5a6a7a");   // 陪床椅
    R(60, 62, 14, 8, "#5a6a7a"); R(62, 62, 10, 6, "#e8e0c8");   // 筆記本
    R(146, 36, 30, 46, "#c8d4cc"); R(150, 40, 22, 12, "#f4f6f6"); R(152, 42, 14, 1, "#3a6a8a"); R(152, 45, 18, 1, "#6a6a7a"); R(152, 48, 10, 1, "#6a6a7a");   // 護理站的紀錄夾
    floor(84, "#c8d0cc", "#b8c0bc");
  };

  /* ---------- 人物造型 ---------- */
  const LOOK = {
    chen:  { skin:"#e0b48c", hair:"#2a2220", hairStyle:"slick", top:"#f4f4f0", coat:"#2a3448", bottom:"#2a3448", tie:"#8a2a2a", glasses:true, mood:"worried", hello:"我做了二十年，第一次遇到這種事。" },
    guo:   { skin:"#c89a70", hair:"#1a1410", hairStyle:"short", top:"#3a4a6a", bottom:"#2a2a3a", hat:"police", hello:"那天晚上什麼事都沒有。" },
    huang: { age:"old", skin:"#e8c0a0", hair:"#3a2a20", hairStyle:"bob", top:"#f4f4f0", coat:"#7a3a4a", bottom:"#3a3a44", skirt:true, glasses:true, hello:"我們會負責到底。" },
    zhong: { age:"old", skin:"#d8a880", hair:"#9a9a94", hairStyle:"short", top:"#3a4a6a", bottom:"#2a2a3a", hat:"police", hello:"八年了，第一次。" },
    fan:   { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#3a6a8a", bottom:"#3a3a40", glasses:true, hello:"時間鎖不會說謊。" },
    yuee:  { age:"old", skin:"#d8a880", hair:"#8a8a84", hairStyle:"bun", top:"#c83a5a", bottom:"#3a3a44", mood:"sad", hello:"我的金子……" },
    sun:   { age:"old", skin:"#d8b08a", hair:"#d8d8d0", hairStyle:"balding", top:"#a8c8e0", bottom:"#a8c8e0", hello:"……你是沈國棟的外甥？" },
    sunyh: { skin:"#e8c0a0", hair:"#2a2220", hairStyle:"long", top:"#8a7a6a", bottom:"#3a3a44", hello:"我爸不能太激動。" },
    kui:   { hello:"沈警官，拖過的地最誠實！" },
    xu:    { hello:"膠帶黏的那一面。" },
    ye:    { hello:"23:50 的飛機。" },
    wu:    { hello:"學長，外面的箱主快吵起來了……" }
  };
  ["kui","xu","ye","wu"].forEach(id => { const a = (typeof ARC !== "undefined" && ARC.look) ? ARC.look(id) : null; if (a) LOOK[id] = Object.assign({}, a, { hello:LOOK[id].hello }); });
  if (!LOOK.kui.top) Object.assign(LOOK.kui, { skin:"#f0d0b4", hair:"#5a3a2a", hairStyle:"bob", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050" });
  if (!LOOK.xu.top) Object.assign(LOOK.xu, { skin:"#ecc8a6", hair:"#1e1a18", hairStyle:"bob", top:"#3d6fa8", bottom:"#3d6fa8" });
  if (!LOOK.wu.top) Object.assign(LOOK.wu, { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050", glasses:true });
  if (!LOOK.ye.top) Object.assign(LOOK.ye, { skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"pony", top:"#f4f4f0", coat:"#6a6e74", bottom:"#6a6e74", skirt:true });
  const DAILY = {
    chen:  [ { room:"lobby", x:150, pose:"phone", doing:"在櫃台後面講電話，一直鞠躬：「我們一定負責、一定負責。」" }, { room:"office", x:70, pose:"type", doing:"一個人在辦公室，一直在打鍵盤，螢幕是綠色的。" } ],
    guo:   [ { room:"sec", x:110, pose:"sit", doing:"坐在保全室的椅子上，腰上的鑰匙串一直在響。" }, { room:"sec", x:90, pose:"stand", doing:"晚班剛接班，一直盯著置物櫃。" } ],
    huang: [ { room:"vault", x:40, pose:"cross", doing:"站在金庫門口，雙手抱胸，看著地上的抽屜。" }, { room:"lobby", x:60, pose:"write", doing:"在大廳寫給箱主的道歉信，寫一張揉一張。" } ],
    zhong: [ { room:"lobby", x:24, pose:"stand", doing:"站在大廳門口，幫忙擋住擠進來的箱主。" } ],
    fan:   [ { room:"vault", x:30, pose:"type", doing:"蹲在時間鎖旁邊，筆電接著一條線。" } ],
    yuee:  [ { room:"lobby", x:100, pose:"cry", doing:"坐不住，一直在大廳走來走去。" }, { room:"lobby", x:110, pose:"sit", doing:"坐在等候椅上，不肯回家。" } ],
    sun:   [ null, { room:"ward", x:100, pose:"lie", doing:"躺在病床上，胸口貼著監視器的線。" } ],
    sunyh: [ null, { room:"ward", x:64, pose:"sit", doing:"坐在陪床椅上，手上拿著一本小筆記本。" } ],
    kui:   [ { room:"vault", x:150, pose:"kneel", doing:"趴在金庫的地上，用斜光照地板。" }, { x:150, pose:"read", doing:"在鑑識中心比對一排皮鞋。" } ],
    xu:    [ null, { x:50, pose:"read", doing:"拿著一卷撕下來的黑色膠帶，對著燈看。" } ],
    ye:    [ null, { room:"pdesk", x:130, pose:"read", doing:"看著手錶，又看一次搜索票。" } ],
    wu:    [ { room:"lobby", x:70, pose:"write", doing:"在大廳登記箱主的名字，手寫到發酸。" }, { room:"pdesk", x:80, pose:"type", doing:"在電腦前面查出境紀錄。" } ]
  };
  EP22.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });

  /* ---------- 房間和隱藏小細節 ---------- */
  EP22.rooms = {
    coop: [
      { id:"lobby", name:"大廳", scene:"c22_lobby", opt:(ph) => ({ night:ph > 0 }), details:[
        { id:"d22_number", name:"號碼燈", hot:[84,4,24,8], text:"叫號機停在 087。今天早上之後，就沒有再叫過號。" },
        { id:"d22_chairs", name:"等候椅", hot:[30,86,46,10], text:"藍色的等候椅。椅子上有人留下一包面紙，和一張保管箱的租約。" } ] },
      { id:"vault", name:"金庫", scene:"c22_vault", opt:(ph) => ({ prints:true }), details:[
        { id:"d22_wall", name:"保險箱牆", hot:[52,10,132,64], text:"兩百多個保險箱，每一個都要兩把鑰匙才打得開：一把在箱主手上，一把在合作社。被撬的七個，都在中間那幾排。" },
        { id:"d22_cam", name:"天花板的角落", hot:[176,4,14,8], text:"金庫裡面沒有監視器。合作社說，這是為了箱主的隱私。只有門外的走廊有一支。" } ] },
      { id:"sec", name:"保全室", scene:"c22_sec", details:[
        { id:"d22_mug", name:"桌上的杯子", hot:[60,58,8,6], text:"桌上兩個保溫杯，一個寫「鍾」，一個寫「國」。寫「國」的那個是空的，杯底結了一層茶垢。" },
        { id:"d22_keys", name:"鑰匙掛勾", hot:[86,40,8,10], text:"牆上的鑰匙掛勾：「值班鑰匙」那一格是空的——鑰匙要跟著值班的人。" } ] },
      { id:"office", name:"副理辦公室", scene:"c22_office", opt:(ph) => ({ night:ph > 0 }), details:[
        { id:"d22_cert", name:"牆上的證書", hot:[20,20,30,14], text:"「服務滿二十年　績優員工　陳育德」。框是新的，玻璃擦得很亮。" },
        { id:"d22_window", name:"窗戶", hot:[140,16,34,26], text:"窗戶看出去是後巷。從這裡，剛好看得到後門和垃圾箱。" } ] },
      { id:"alley", name:"後巷", scene:"c22_alley", opt:(ph) => ({ night:ph > 0 }), details:[
        { id:"d22_bin", name:"大垃圾箱", hot:[128,50,44,34], text:"綠色的大垃圾箱，蓋子半開。裡面是一般的辦公室垃圾：碎紙、便當盒。" },
        { id:"d22_lamp", name:"路燈", hot:[168,4,16,10], text:"巷子裡唯一的路燈。停電那天晚上，它也是暗的。" } ] }
    ],
    police: [ { id:"pdesk", name:"澄港市刑大", scene:"police", details:[
      { id:"d22_coffee", name:"你桌上的咖啡", hot:[60,62,10,8], text:"小吳幫你買的咖啡，杯子上寫著「學長　23:50」。" } ] } ],
    hospital: [ { id:"ward", name:"心臟內科病房", scene:"c22_ward", opt:(ph) => ({ night:true }), details:[
      { id:"d22_monitor", name:"心電圖", hot:[108,30,22,16], text:"綠色的線，跳得很慢，很規律。" },
      { id:"d22_window2", name:"窗戶", hot:[20,16,34,26], text:"窗外是醫院的停車場。孫雅慧說，她爸每天都看著那裡，等她來。" } ] } ],
    lab: [ { id:"lab", name:"鑑識中心", scene:"lab", details:[
      { id:"d22_tape", name:"桌上的膠帶", hot:[60,40,24,14], text:"一卷撕下來的黑色電工膠帶，攤平在玻璃板上，像一條長長的黑蛇。" } ] } ]
  };
  const PS = [["c22_vault",{ prints:true }],["police",{}]];
  EP22.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 監視器動畫：重播的四分鐘 ---------- */
  const strip = L => { const o = Object.assign({}, L); delete o.hello; delete o.mood; delete o.byPhase; return o; };
  EP22.looks = { chenC: strip(LOOK.chen), guoC: strip(LOOK.guo), zhongC: strip(LOOK.zhong), huangC: strip(LOOK.huang) };
  const ANIM = {
    cctv22_vault: { scene:"c22_corr", opt:{}, cam:"B1 VAULT CORRIDOR", date:"2026-12-26", beats:[
      { t:"01:20:00", d:3.5, cap:"01:20，走廊的燈亮著，金庫的門關著。", st:{ dim:false } },
      { t:"01:30:00", d:3.5, cap:"01:30，畫面閃了一下，燈熄了，綠色的緊急照明亮起來。", st:{ dim:true } },
      { t:"01:55:00", d:3.5, cap:"01:55:00，走廊沒有人。一隻飛蛾從左邊的緊急照明飛出來。", st:{ dim:true, moth:[18,22] } },
      { t:"01:58:59", d:3.5, cap:"01:58:59，飛蛾飛到右邊，停在金庫的門上。", st:{ dim:true, moth:[100,40] } },
      { t:"01:55:00", d:4, cap:"畫面上的時間跳回 01:55:00。同一隻飛蛾，從同一個地方飛出來。", st:{ dim:true, moth:[18,22] } },
      { t:"01:58:59", d:4, cap:"01:58:59，又停在金庫的門上。……這四分鐘，一直重複，一共十八次。", st:{ dim:true, moth:[100,40] } },
      { t:"03:10:00", d:4, cap:"03:10，畫面突然跳到 03:10。走廊一樣沒有人，門關著。飛蛾不見了。", st:{ dim:true } }
    ] }
  };
  Object.values(ANIM).forEach(A => { if (A.beats.some(b => b.st)) A.opt = Object.assign({}, A.opt || {}, { seq:A.beats.map(b => Object.assign({}, A.opt || {}, b.st || {})), ds:jds(A.beats) }); });
  [...EP22.cctv, ...EP22.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });

  /* ---------- 結案 ---------- */
  const RB = [
    { t:"12/24 16:00", d:5, cap:"12 月 24 日，阿國拿著換班單走進副理辦公室：「週日要帶女兒去慶生。」副理看都沒看，就簽了。", scene:"c22_office", opt:{}, m:{ guoC:[96,94,"give@paper",-1,200,94], chenC:[70,94,"sign",1] } },
    { t:"12/26 01:30", d:4.5, cap:"12 月 26 日 01:30，台電停電。走廊的緊急照明亮起來。", scene:"c22_corr", opt:{ dim:true } },
    { t:"12/26 02:00", d:5, cap:"02:00，阿國在保全室，用值班鑰匙打開錄影機的後蓋，切到重播；再把 UPS 的監視器迴路關掉、打開。", scene:"c22_sec", opt:{}, m:{ guoC:[40,94,"back+reach",-1,110,94] } },
    { t:"12/26 02:10", d:5, cap:"02:10，陳育德走到金庫門口，輸入自己的代碼 0612。時間鎖，暫停了。", scene:"c22_corr", opt:{ dim:true }, m:{ chenC:[116,94,"door",1,200,94] } },
    { t:"12/26 02:14", d:5.5, cap:"02:14，門開了。他拿著一支纏滿黑色膠帶的鐵撬，一個一個撬開他早就問好的七個箱子。", scene:"c22_vault", opt:{ pried:false, prints:false }, m:{ chenC:[96,94,"strike@pipe/#2a2a2a",1,20,94] } },
    { t:"12/26 02:40", d:5, cap:"0417 號裡面沒有金子，只有一個牛皮紙袋。他把紙和空的首飾盒塞進垃圾袋。", scene:"c22_vault", opt:{ prints:true }, m:{ chenC:[120,94,"kneel",1,96,94] } },
    { t:"12/26 03:05", d:4.5, cap:"03:05，門關上。阿國把垃圾袋綁成死結，丟到後巷。", scene:"c22_alley", opt:{ night:true }, m:{ guoC:[104,94,"carry@bag/#1a1a1e",1,44,94] } },
    { t:"12/28 08:31", d:5, cap:"12 月 28 日 08:31，經理和副理一起輸入代碼。時間鎖準時打開。他以為，它會幫他作證。", scene:"c22_vault", opt:{ prints:true }, m:{ huangC:[30,94,"handsup",1], chenC:[46,94,"stand",1] } }
  ];
  EP22.court = {
    title: "合作社大廳・12 月 28 日 21:40", scene: "c22_lobby", opt:{ night:true },
    who: ph => ["chen","guo","huang","zhong","sunyh"],
    open: ph => "21:40，合作社大廳。鐵門拉下一半，外面還有幾個箱主不肯走。陳育德坐在櫃台邊，公事包放在腳邊，拉鍊沒拉。阿國站在保全室門口。黃經理坐在等候椅上，手上捏著一疊道歉信。",
    kindLine: {
      inside: "沒有人闖進金庫。金庫是被裡面的人，用正常的方法打開的。",
      outside: "有人趁停電，從外面闖進了金庫。",
      fraud: "這是保險箱的主人自導自演。"
    },
    murmur: [ "（陳育德看了一下手錶。）", "（阿國腰上的鑰匙串響了一下。）", "（黃經理把道歉信放下來。）" ],
    confess: {
      chen: [ "三百八十萬。十二月三十一號。過了那天，我的房子、我小孩的學費，全部都沒了。", "我一個一個打電話問：箱子裡有什麼？他們都跟我說。……他們都很信任我。", "我以為時間鎖會幫我作證。它是德國的，最好的。" ],
      guo: [ "五十萬。我女兒三月要開刀。", "他說，反正箱子都有保險，沒有人真的會損失。", "我只是切了一個鈕。……我只是切了一個鈕。" ]
    },
    cornered: { chen: "我、我是去澳門出差……", guo: "我只是幫忙丟垃圾……" },
    deny: {
      huang: "我那個週末在高雄，喜酒的照片都在……",
      zhong: "我那天晚上在家睡覺。是阿國求我換的。",
      sunyh: "我爸的箱子裡只有紙……我們沒有買保險。"
    },
    replayText: "12 月 24 日下午，副理辦公室。阿國敲了敲門——",
    replay: { scene:"c22_office", opt:{}, clean:true, cam:"經過重現", date:"2026-12-24", beats:RB },
    endGood: "21:55，葉晴打了一通電話。23:20，陳育德在機場的出境櫃台前被攔下來。公事包裡，是三十兩金子和兩條手鍊。\n第二天，黃經理一個一個打電話給箱主。王月娥的孫女接的電話，說：「阿嬤在哭。是高興的那種。」",
    endBad: "22:00，你還是說不出來。\n23:50，飛往澳門的班機準時起飛。\n一個禮拜後，七個箱主收到合作社的信：「依保險條款，賠償上限為每箱新台幣五萬元。」"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[22] && ARC_INTER[22].after) EP22.after = Object.assign({}, ARC_INTER[22].after, { scene:"c22_alley", opt:{ night:true } });

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP22.outScenes = ["c22_alley"];
  EP22.fac = { coop:["#c8bca0","#2a6a4a"], police:["#cfcabb","#3f5a7a"], hospital:["#e8f0ec","#3a8a6a"], lab:["#e2e8e8","#3a7a8a"] };
  EP22.setting = { coop:"city", police:"city", hospital:"city", lab:"city" };
  const SKY22 = [ ["#9ab8d4","#e4ecf0","#8a96a2","#7a8692",0,0], ["#0a0f1c","#24304a","#2a3040","#323a4a",0,0] ];
  EP22.worldSky = ph => SKY22[Math.min(ph || 0, SKY22.length - 1)];
  EP22.roomDesc = {
    lobby:"澄港信用合作社的大廳。", vault:"地下室的金庫。圓門開著，地上散著抽屜。", sec:"保全室。螢幕牆、錄影機、UPS 機櫃。", office:"副理辦公室。", alley:"合作社後面的窄巷。",
    pdesk:"澄港市刑大。", ward:"澄港醫院，心臟內科病房。", lab:"鑑識中心。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#3a4250", bottom:"#2a2f3a" };
  const say = (who, text, name) => ({ say:[who, text], name });
  EP22.world = {};
  EP22.locations.forEach(l => { EP22.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP22.world.coop, {
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { wait:0.4, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "學長，外面排了一整排箱主，都在問自己的箱子有沒有事。", "小吳"),
      say("wu", "七個箱子被撬。金庫的門沒有被撬，時間鎖看起來也好好的。", "小吳"),
      say("you", "先看金庫，再看誰有辦法進去。", "你"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  EP22.mapPos = { coop:[80,70,"u"], police:[170,40,"r"], hospital:[130,96,"u"], lab:[196,72,"r"] };
  EP22.mapRoads = [["coop","police"],["coop","hospital"],["police","lab"],["police","hospital"]];
  EP22.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#9a9a92"); dither(0, 0, 240, 135, "#a4a49c", 3);
    for (let x = 20; x < 230; x += 8) for (let y = 14; y < 124; y += 7){ R(x, y, 6, 5, "#c8c0b0"); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, "#b0a898"); }
    R(0, 86, 240, 5, "#7a7a76"); R(110, 0, 5, 135, "#7a7a76");
    R(74, 60, 14, 10, "#c8bca0"); R(78, 62, 6, 6, "#2a6a4a");
  };
})();
