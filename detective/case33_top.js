/* =========================================================
   第 33 集・俯視版（topdown.js）
   澄港市警察局（1F 值班台、B1 走廊、證物室前台＝第 14 集同一棟；新畫：B1 清潔工具間、A 區貴重物品櫃、C 區鐵架）、
   鑑識中心（共用 CG_LAB）、金福銀樓（店面＝第 11 集）、澄港醫院六樓兒童病房。
   ========================================================= */
const C33T = typeof TOPEP === "function" ? TOPEP("stock") : null;

/* ================= 澄港市警察局 ================= */
C33T && (() => {
  const { EP, T, O, sh, ph, dA, has, A, tone, fluo, setLoc } = C33T;
  const W0 = EP.world.police || {};
  const P = (typeof window !== "undefined" && window.PD14) || null;
  const b1wall = P ? P.b1wall : (p, x, w, H) => p.R(x, 0, w, H, "#c4c8bc");
  const b1floor = P ? P.b1floor : (p, x, y, w, h) => p.R(x, y, w, h, "#8e908a");
  const cardDoor = P ? P.cardDoor : (p, x, y, w, h, amt) => T.backDoor(p, x, y, w, h, amt, "#7a8288", { frame:"#4a5056" });
  const reader = P ? P.reader : () => {};
  const rack = P ? P.rack : (p, x, y, w, col) => T.box(p, x, y, w, 8, 60, col, col);
  const hasDog = () => { try { return !!(has && has("e33_dog")); } catch (e){ return false; } };
  // 豆花（緝毒犬，坐著）
  const dog = (p, x, y) => { p.R(x - 1, y - 14, 12, 15, O); p.R(x, y - 13, 10, 13, "#d8b888"); p.R(x + 6, y - 18, 8, 8, O); p.R(x + 7, y - 17, 6, 6, "#d8b888"); p.R(x + 12, y - 15, 3, 3, "#2a1a14"); p.R(x + 7, y - 19, 2, 3, "#a88858"); p.R(x + 1, y - 2, 10, 2, "#c8a878"); p.R(x - 3, y - 4, 4, 2, "#d8b888"); p.R(x + 3, y - 10, 6, 2, "#c83a2a"); };

  /* ---------- 1F 值班台：第 14 集同一間（公布欄多了一張清潔公司的須知；往 B1 的樓梯在右前） ---------- */
  const L0 = P && P.lobby;
  const lobby = { name:"1F 值班台", w:300, h:150, wall:60,
    floor(p, g, t, o){ if (L0) L0.floor.call(this, p, g, t, o); else p.R(0, 0, 300, 150, "#d4ccb8");
      p.R(38, 15, 13, 16, "#f4f4f0"); p.R(39, 16, 11, 3, "#3a8a5a"); for (let k = 0; k < 4; k++) p.R(40, 21 + k * 2, 9, 1, "#5a5a6a"); },
    props:L0 ? L0.props : [],
    front(p, g, t, o){ if (L0) L0.front.call(this, p, g, t, o); },
    solid:[[58,74,116,34],[14,114,66,18],[10,52,18,36],[230,100,6,42],[108,128,16,20],[176,128,16,20]],
    exits:[ { r:[238,142,54,8], to:"b1hall", at:[24,96], label:"B1（下樓）", kind:"down", art:[236,98,58,44] } ]
  };

  /* ---------- B1 走廊：第 14 集同一條；樓梯口旁邊多了清潔工具間的門；證物室的門被一箱影印紙頂著；走廊盡頭一扇通風的小窗 ---------- */
  const H0 = P && P.b1hall;
  const b1hall = { name:"B1 走廊", w:360, h:140, wall:60,
    floor(p, g, t, o){ if (H0) H0.floor.call(this, p, g, t, o); else p.R(0, 0, 360, 140, "#8e908a");
      // 清潔工具間的門（牌子「清潔」）
      T.backDoor(p, 18, 18, 24, 42, dA("b1hall", "jan"), "#6a7a84", { frame:"#3a4a54" }); p.R(20, 10, 20, 6, O); p.R(21, 11, 18, 4, "#e8e2d2"); p.R(24, 12, 12, 2, "#3a6a8a");
      // 證物室的門開著（一箱影印紙頂著）
      cardDoor(p, 164, 16, 24, 44, Math.max(.8, dA("b1hall", "evoffice")), true);
      // 走廊盡頭的通風小窗
      p.R(338, 14, 16, 10, O); p.R(339, 15, 14, 8, "#8aa0b0"); for (let i = 341; i < 352; i += 3) p.R(i, 15, 1, 8, "#5a6a74"); },
    props:[
      ...(H0 ? [H0.props[0], H0.props[3]] : []),
      // 頂著門的一箱影印紙（上面薄灰和鞋印）
      { y:66, draw(p){ T.box(p, 180, 56, 16, 8, 6, "#e8e4d8", "#b8b4a8"); p.R(182, 57, 12, 2, "#3a6ac8"); p.R(184, 59, 3, 2, "rgba(80,70,60,.4)"); p.R(190, 58, 3, 2, "rgba(80,70,60,.4)"); } }
    ],
    front(p, g, t, o){ for (const x of [60, 180, 300]) fluo(p, x - 20, 2, 40); tone(g, this, o, .3); },
    solid:[[56,56,18,10],[274,48,12,20],[180,54,16,10]],
    exits:[ { r:[0,80,8,34], to:"lobby", at:[220,128], label:"1F 值班台（上樓）", kind:"door", art:[0,78,8,38] },
            { r:[18,60,24,8], to:"jan", at:[120,124], label:"清潔工具間", kind:"door", art:[18,18,24,42] },
            { r:[164,60,16,8], to:"evoffice", at:[144,132], label:"證物室前台", kind:"door", art:[164,16,24,44] } ]
  };

  /* ---------- B1 清潔工具間：架子上的清潔劑（寫著開封日期）、水泥拖把槽（倒放的水桶）、鉤子上的黃手套、兩個置物櫃（一個貼著小孩照片）；
       中間沒推回去的清潔車（垃圾袋架、吊秤、標籤機）、角落一堆今天的垃圾袋 ---------- */
  const jan = { name:"B1 清潔工具間", w:240, h:136, wall:56,
    floor(p, g, t, o){
      b1wall(p, 0, 240, 56, 8, "#c8ccc0");
      // 黃手套掛在鉤子上
      p.R(116, 22, 4, 2, O); p.R(114, 24, 8, 12, O); p.R(115, 25, 6, 10, "#e8c83a"); p.R(116, 26, 1, 6, "#d8b82a"); p.R(119, 26, 1, 6, "#d8b82a");
      b1floor(p, 0, 56, 240, 80, 33);
      p.R(0, 56, 240, 80, "rgba(220,240,240,.05)");
      T.sides(p, this, "#4a4e48", [["B", 100, 40]]);
    },
    props:[
      // 清潔劑的架子
      { y:62, draw(p){ T.box(p, 8, 20, 50, 10, 32, "#8a9088", "#6a7068"); for (let r = 0; r < 3; r++){ p.R(10, 28 + r * 10, 46, 1, "#5a6058"); for (let k = 0; k < 5; k++){ const c = ["#f4f4f0", "#3a8ac8", "#e8c83a", "#e86a3a", "#3aa86a"][(k + r) % 5]; p.R(11 + k * 9, 20 + r * 10, 6, 8, O); p.R(12 + k * 9, 21 + r * 10, 4, 7, c); p.R(12 + k * 9, 24 + r * 10, 4, 1, "#2a2a2a"); } } } },
      // 水泥拖把槽＋倒放的空水桶
      { y:70, draw(p){ T.box(p, 66, 48, 44, 14, 8, "#9a9a92", "#7a7a72"); p.R(70, 50, 36, 10, "#5a5e5c"); p.R(84, 40, 6, 6, O); p.R(85, 41, 4, 4, "#c8ccd0"); p.R(88, 46, 2, 4, O); p.R(74, 60, 14, 8, O); p.R(75, 61, 12, 6, "#3a6ac8"); p.R(75, 61, 12, 1, "#5a8ae8"); } },
      // 兩個置物櫃（右邊那個門上貼著三張小孩照片和便條）
      { y:62, draw(p){ for (let k = 0; k < 2; k++){ T.box(p, 148 + k * 26, 18, 24, 10, 34, "#8a9aa8", "#5a6a78"); p.R(166 + k * 26, 34, 2, 6, "#c8ccd0"); p.R(152 + k * 26, 22, 12, 4, "#f4f4f0"); }
          for (let k = 0; k < 3; k++){ p.R(178 + k * 6, 30 + (k % 2) * 4, 5, 6, O); p.R(179 + k * 6, 31 + (k % 2) * 4, 3, 4, "#f4e0c8"); } p.R(180, 42, 12, 6, "#f8e878"); } },
      // 角落今天的垃圾袋（明天早上才收）
      { y:112, draw(p){ for (const [x, y, w] of [[206, 80, 18], [218, 90, 16], [204, 96, 16], [220, 102, 14]]){ p.R(x, y, w, 12, O); p.R(x + 1, y + 1, w - 2, 10, "#2a2a2e"); p.R(x + 3, y + 2, 4, 2, "#4a4a50"); p.R(x + w / 2 - 2, y - 2, 4, 3, O); p.R(x + 2, y + 6, 6, 3, "#f4f4f0"); } } },
      // 清潔車：垃圾袋架、吊秤、標籤機、拖把
      { y:108, draw(p){ T.box(p, 100, 82, 50, 18, 8, "#3a6ac8", "#2a4a9a"); p.R(104, 84, 14, 12, "#f4f4f0"); p.R(122, 84, 10, 10, O); p.R(123, 85, 8, 8, "#2a2a2e"); p.R(124, 86, 6, 3, "#e8f4e8"); p.R(126, 92, 2, 1, "#f4f4f0");
          p.R(144, 66, 2, 34, O); p.R(145, 66, 1, 34, "#8a8e94"); p.R(138, 64, 14, 2, O); p.R(140, 70, 8, 8, O); p.R(141, 71, 6, 6, "#e8ecf0"); p.R(143, 73, 2, 2, "#e83a2a");
          p.R(98, 72, 2, 28, "#8a6a4a"); p.R(94, 98, 10, 4, "#c8c4b8"); for (const x of [102, 144]){ p.R(x, 100, 5, 3, O); } } }
    ],
    front(p, g, t, o){ fluo(p, 80, 2, 50); tone(g, this, o, .3); },
    solid:[[6,48,54,14],[64,46,48,16],[72,58,18,10],[146,48,52,14],[200,78,40,36],[96,80,56,22]],
    exits:[ { r:[100,130,40,6], to:"b1hall", at:[30,74], label:"B1 走廊", kind:"out", art:[100,130,40,6] } ]
  };

  /* ---------- 證物室前台：第 14 集同一間（老鄭的夾克已經收走了）；牆上多了鑰匙箱（十二把、藍牌子、領用簿）、桌邊一個套了新袋子的垃圾桶 ---------- */
  const E0 = P && P.evoffice;
  const evoffice = { name:"B1 證物室前台", w:288, h:150, wall:60,
    floor(p, g, t, o){ if (E0) E0.floor.call(this, p, g, t, o); else p.R(0, 0, 288, 150, "#8e908a");
      cardDoor(p, 204, 16, 26, 44, dA("evoffice", "vault"), false);
      // 鑰匙箱（十二把、藍牌子；A-2 那一格空的）＋領用簿
      p.R(124, 12, 20, 26, O); p.R(125, 13, 18, 24, "#c8ccd0"); for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++){ if (r === 0 && k === 1) continue; p.R(127 + k * 4, 16 + r * 7, 1, 3, "#8a8e94"); p.R(127 + k * 4, 19 + r * 7, 3, 2, "#3a6ad8"); } p.R(126, 38, 16, 4, O); p.R(127, 39, 14, 2, "#f4f0e0"); },
    props:[
      ...(E0 ? E0.props.filter((q, i) => i !== 1) : []),
      { y:72, draw(p){ T.chair(p, 60, 72, "#3a3a3e", "up"); } },
      // 垃圾桶（新的垃圾袋，套得很整齊）
      { y:110, draw(p){ p.R(116, 98, 12, 12, O); p.R(117, 99, 10, 10, "#8a9088"); p.R(116, 98, 12, 3, "#2a2a2e"); p.R(118, 98, 8, 1, "#4a4a50"); } }
    ],
    front(p, g, t, o){ fluo(p, 50, 2, 50); fluo(p, 180, 2, 50); tone(g, this, o, .3); },
    solid:[[4,58,22,18],[22,74,92,28],[236,36,46,40],[116,100,12,10]],
    exits:[ { r:[128,144,32,8], to:"b1hall", at:[176,74], label:"B1 走廊", kind:"out", art:[126,140,36,10] },
            { r:[204,60,26,8], to:"vault", at:[144,138], label:"A 區・貴重物品櫃", kind:"door", art:[204,16,26,44] } ]
  };

  /* ---------- A 區：兩座厚鋼櫃（A-1 現金和有價證券、A-2 七格開著）、「開櫃須兩人以上在場」的告示；
       A-2 的桌子：鑑識中心帶來的電子秤、22-07 的絨布盒、過磅紀錄、一捲紅色封條、陳葵的平板；右邊往 C 區 ---------- */
  const vault = { name:"A 區・貴重物品櫃", w:288, h:150, wall:60,
    floor(p, g, t, o){
      b1wall(p, 0, 288, 60, 10, "#c4c8bc");
      // 告示
      p.R(130, 14, 30, 22, O); p.R(131, 15, 28, 20, "#f4f4f0"); p.R(131, 15, 28, 4, "#c8302a"); for (let k = 0; k < 3; k++) p.R(133, 22 + k * 3, 24, 1, "#3a3a3a");
      b1floor(p, 0, 60, 288, 90, 34);
      T.sides(p, this, "#4a4e48", [["B", 128, 32], ["R", 80, 34]]);
      T.sideDoor(p, this, "R", 80, 34, dA("vault", "cshelf"), "#6a6e74");
    },
    props:[
      // A-1（關著、新封條）、A-2（門開著、七格七盒）
      { y:62, draw(p){ T.box(p, 18, 6, 42, 8, 46, "#6a7078", "#4a5058"); p.R(22, 12, 34, 38, "#7a8088"); p.R(50, 26, 4, 8, "#c8ccd0"); p.R(30, 30, 12, 3, "#c8302a"); p.R(24, 14, 10, 4, "#f4f4f0");
          T.box(p, 70, 6, 42, 8, 46, "#6a7078", "#4a5058"); p.R(74, 12, 34, 38, "#2a2e32"); for (let k = 0; k < 7; k++){ p.R(76, 13 + k * 5, 30, 1, "#5a6068"); if (k !== 3){ p.R(80, 14 + k * 5, 18, 4, O); p.R(81, 15 + k * 5, 16, 2, "#2a3a7a"); p.R(88, 15 + k * 5, 2, 2, "#c8302a"); } } p.R(112, 10, 6, 44, O); p.R(113, 11, 4, 42, "#7a8088"); p.R(76, 14, 10, 4, "#f4f4f0"); } },
      // A-2 的桌子
      { y:104, draw(p){ T.box(p, 118, 84, 104, 14, 8, "#c8ccd0", "#8a9094");
          p.R(126, 82, 20, 12, O); p.R(127, 83, 18, 10, "#e8ecec"); p.R(129, 85, 14, 4, "#c8ccd0"); p.R(131, 90, 10, 2, "#2a2a2e"); p.R(132, 90, 6, 1, "#4ae06a"); p.R(140, 80, 4, 4, O); p.R(141, 81, 2, 2, "#c8a050");
          p.R(152, 84, 14, 10, O); p.R(153, 85, 12, 8, "#2a3a7a"); p.R(153, 88, 12, 1, "#c8302a"); p.R(164, 88, 1, 2, "#2a3a7a");
          p.R(172, 86, 14, 10, O); p.R(173, 87, 12, 8, "#f4f4f0"); for (let k = 0; k < 3; k++) p.R(174, 88 + k * 2, 10, 1, "#3a3a6a");
          p.R(190, 86, 10, 10, O); p.R(191, 87, 8, 8, "#c8302a"); p.R(193, 89, 4, 4, "#8a1a14");
          p.R(204, 86, 14, 10, O); p.R(205, 87, 12, 8, "#2a2a2e"); p.R(206, 88, 10, 6, "#8ab0d0"); } },
      // 豆花（還沒去 C 區以前）
      { y:120, draw(p, g, t, o){ if (ph(o) > 0 && hasDog()) return; dog(p, 74, 120); } }
    ],
    front(p, g, t, o){ fluo(p, 70, 2, 50); fluo(p, 200, 2, 50); tone(g, this, o, .3); },
    solid:[[16,48,46,16],[68,48,52,16],[116,82,108,20]],
    exits:[ { r:[128,144,32,8], to:"evoffice", at:[216,74], label:"證物室前台", kind:"out", art:[126,140,36,10] },
            { r:[280,80,8,34], to:"cshelf", at:[24,98], label:"C 區", kind:"door", art:[280,78,8,38] } ]
  };

  /* ---------- C 區：四座鐵架（C-5、C-6 已經重鎖、C-7、C-8 還沒）、牆上 2023 年的水位線、柱子和牆中間新的固定片；
       老方的紅色工具箱、放盤點單的紙箱；第二天：牆上掛著今天的盤點單、豆花坐在 C-7 前面、C-7 最下層搬空 ---------- */
  const cshelf = { name:"C 區", w:340, h:160, wall:60,
    floor(p, g, t, o){
      b1wall(p, 0, 340, 60, 14, "#c4c8bc");
      // 2023/7/28 的水位線（112 公分）
      p.R(0, 40, 340, 1, "#5a3a2a"); p.R(166, 34, 10, 5, O); p.R(167, 35, 8, 3, "#f4f4f0");
      // 柱子和牆中間：新的固定片（亮的六角螺絲）
      for (const x of [82, 164]){ p.R(x, 20, 10, 4, "#c8ccd0"); p.R(x, 46, 10, 4, "#c8ccd0"); p.R(x + 4, 21, 2, 2, "#f4f4f0"); p.R(x + 4, 47, 2, 2, "#f4f4f0"); }
      b1floor(p, 0, 60, 340, 100, 35);
      p.seed(36); for (let k = 0; k < 40; k++) p.R(p.rnd() * 340, 76 + p.rnd() * 80, 2, 1, "rgba(80,80,70,.35)");
      T.sides(p, this, "#4a4e48", [["L", 80, 34]]);
      T.sideDoor(p, this, "L", 80, 34, dA("cshelf", "vault"), "#6a6e74");
    },
    props:[
      { y:74, draw(p, g, t, o){ rack(p, 14, 2, 66, "#7a8088"); rack(p, 96, 2, 66, "#7a8088"); rack(p, 178, 2, 66, "#6a7078"); rack(p, 260, 2, 66, "#6a7078");
          for (const [x, n] of [[14, 5], [96, 6], [178, 7], [260, 8]]){ p.R(x + 26, 4, 14, 6, O); p.R(x + 27, 5, 12, 4, "#f4f4f0"); p.R(x + 30, 6, 6, 2, "#2a2a2a"); }
          // C-7 最下層搬空、底板拆下來（下面一個十公分深的夾層）
          if (o && o.open){ p.R(181, 58, 60, 12, "#2a2e32"); p.R(184, 60, 54, 8, "#14161a"); p.R(196, 62, 16, 6, "#f4f0e0"); }
          for (const x of [181, 236]){ p.R(x, 66, 3, 3, "#e8ecf0"); }
          // 第二天：牆上掛著今天的盤點單
          if (ph(o) > 0){ p.R(166, 22, 10, 14, O); p.R(167, 23, 8, 12, "#f4f0e0"); for (let k = 0; k < 4; k++) p.R(168, 25 + k * 2, 6, 1, "#3a5a9a"); } } },
      // 老方的紅色工具箱（蓋子開著）
      { y:112, draw(p){ T.box(p, 140, 100, 22, 10, 6, "#c83a2a", "#8a2a1a"); p.R(142, 96, 18, 5, O); p.R(143, 97, 16, 3, "#e85a4a"); p.R(144, 102, 6, 2, "#c8ccd0"); p.R(152, 102, 6, 2, "#3a3a3a"); p.R(146, 104, 10, 2, "#f4f4f0"); } },
      // 放盤點單的紙箱
      { y:120, draw(p){ T.box(p, 36, 106, 26, 12, 8, "#c8a878", "#8a6a4a"); p.R(40, 102, 16, 10, O); p.R(41, 103, 14, 8, "#a8845a"); p.R(42, 105, 12, 6, "#f4f0e0"); for (let k = 0; k < 3; k++) p.R(43, 106 + k * 2, 10, 1, "#3a5a9a"); } },
      // 豆花（第二天，坐在 C-7 前面）
      { y:100, draw(p, g, t, o){ if (!(ph(o) > 0 && hasDog())) return; dog(p, 214, 100); } }
    ],
    front(p, g, t, o){ fluo(p, 80, 2, 50); fluo(p, 240, 2, 50); tone(g, this, o, .3); },
    solid:[[14,2,66,72],[96,2,66,72],[178,2,66,72],[260,2,66,72],[140,100,22,12],[36,104,26,14]],
    exits:[ { r:[0,80,8,34], to:"vault", at:[262,98], label:"A 區", kind:"door", art:[0,78,8,38] } ]
  };

  if (typeof window !== "undefined") window.PD33 = { evoffice, cshelf, dog };
  setLoc("police", { start:"lobby", spawn:[150,136], rooms:{ lobby, b1hall, jan, evoffice, vault, cshelf },
    spots:{
      cctv33_hall:[64,64,20,14,90,112,"lobby",A("type",{ actT:2, face:-1 })],
      doc33_exit:[96,94,40,10,116,112,"lobby",A("read")],
      o33_board:[14,12,40,30,36,70,"lobby",A("read")],
      o33_doorbox:[178,52,20,14,204,72,"b1hall",A("crouch",{ face:-1 })],
      o33_reader:[194,28,12,14,214,80,"b1hall",A("look",{ face:-1 })],
      o33_farend:[334,12,22,16,340,74,"b1hall",A("look")],
      doc33_door:[28,66,22,14,38,110,"evoffice",A("type")],
      doc33_sign:[56,80,22,10,66,110,"evoffice",A("read")],
      o33_keybox:[124,12,20,32,134,70,"evoffice",A("look")],
      o33_bin:[114,96,16,14,136,110,"evoffice",A("rummage",{ face:-1 })],
      doc33_scrap:[236,34,46,42,258,84,"evoffice",A("read")],
      o33_cabinet:[70,10,48,54,92,72,"vault",A("look")],
      o33_box:[150,82,18,14,160,110,"vault",A("look")],
      doc33_weigh:[170,84,18,14,178,110,"vault",A("read")],
      o33_photo:[202,84,18,14,212,110,"vault",A("look")],
      o33_scale:[124,78,24,18,136,110,"vault",A("look")],
      o33_sealroll:[188,84,14,14,196,110,"vault",A("look")],
      o33_toolbox:[138,94,26,18,151,120,"cshelf",A("rummage")],
      o33_c5:[80,16,16,38,88,82,"cshelf",A("look")],
      doc33_count:[36,100,26,18,49,128,"cshelf",A("read")],
      o33_plate:[180,56,62,16,210,84,"cshelf",A("crouch")],
      o33_record:[194,58,22,12,198,86,"cshelf",A("look")],
      o33_cart:[96,64,56,38,124,114,"jan",A("look")],
      doc33_stickers:[118,82,16,14,112,114,"jan",A("read")],
      o33_bagpile:[200,76,40,40,192,120,"jan",A("rummage",{ face:1 })],
      o33_gloves:[112,20,12,18,120,70,"jan",A("look")],
      o33_sink:[64,40,48,30,96,76,"jan",A("look")],
      o33_locker:[146,14,26,46,158,72,"jan",A("rummage")]
    },
    details:{
      d33_clock:[148,6,18,18,156,70,"lobby",A("look")],
      d33_stairs:[236,98,58,44,220,120,"lobby",A("look",{ face:1 })],
      d33_taolocker:[174,14,26,46,184,72,"jan",A("look")],
      d33_bottles:[8,14,50,40,34,70,"jan",A("look")],
      d33_hallboard:[100,8,40,32,120,70,"b1hall",A("read")],
      d33_hydrant:[230,26,20,32,240,72,"b1hall",A("look")],
      d33_kettle:[6,50,18,16,34,70,"evoffice",A("look",{ face:-1 })],
      d33_roster:[148,8,40,32,168,70,"evoffice",A("read")],
      d33_a1:[18,10,42,52,40,72,"vault",A("look")],
      d33_poster:[130,14,30,22,145,70,"vault",A("read")],
      d33_water:[162,30,16,20,170,82,"cshelf",A("look")],
      d33_c8:[260,8,66,60,292,84,"cshelf",A("look")]
    },
    place:{
      liu:[ { room:"lobby", x:116, y:66, act:"idle", facing:1 }, { room:"lobby", x:116, y:66, act:"write", facing:1 } ],
      luo:[ { room:"lobby", x:40, y:100, act:"hold", facing:1 }, { room:"lobby", x:58, y:66, act:"read", facing:-1 } ],
      man:[ { room:"jan", x:84, y:110, act:"wipe", facing:1 }, { room:"jan", x:84, y:110, act:"wipe", facing:1 } ],
      tao:[ { room:"jan", x:160, y:108, act:"wipe", facing:-1 }, { room:"jan", x:160, y:108, act:"wipe", facing:-1 } ],
      li:[ { room:"evoffice", x:150, y:96, act:"write", facing:-1 }, { room:"cshelf", x:28, y:126, act:"cross", facing:1 } ],
      cai:[ { room:"evoffice", x:60, y:66, act:"type", facing:1 }, { room:"cshelf", x:100, y:126, act:"write", facing:1 } ],
      xu:[ { room:"vault", x:106, y:100, act:"look", facing:1 }, { room:"vault", x:106, y:100, act:"write", facing:1 } ],
      kui:[ { room:"vault", x:238, y:96, act:"read", facing:-1 }, { room:"cshelf", x:300, y:110, act:"phone", facing:-1 } ],
      kang:[ { room:"vault", x:56, y:118, act:"idle", facing:1 }, { room:"vault", x:56, y:118, act:"idle", facing:1 } ],
      fang:[ { room:"cshelf", x:120, y:92, act:"hold", facing:1 }, { room:"cshelf", x:254, y:96, act:"hold", facing:-1 } ]
    },
    extras:W0.extras || [],
    intro:[ { set:{ room:"lobby", px:150, py:146 }, hide:true }, { wait:0.3, hide:true }, { set:{ room:"lobby", px:150, py:134 } },
      ...(W0.intro || []).filter(k => k.say || (k.wait && !k.hide)).map(k => k.say && k.say[0] === "wu" && /點畫面上的箭嘴|📍|清單不是全部/.test(k.say[1]) ? null : k).filter(Boolean) ],
    plan:[ { name:"澄港市警察局", w:100, h:48, rooms:{ lobby:[0,0,60,16], b1hall:[0,16,100,10], jan:[0,26,24,22], evoffice:[24,26,30,22], vault:[54,26,24,22], cshelf:[78,26,22,22] } } ] });
})();

/* ================= 鑑識中心（共用 CG_LAB） ================= */
C33T && (() => {
  const { EP, T, O, A, setLoc } = C33T;
  setLoc("lab", { start:"lab33", spawn:[144,140],
    rooms:{ lab33:CG_LAB(C33T, { props:[
      // 採證台上的顯微鏡（夾著一小段膠帶）
      { y:105, draw(p){ p.R(84, 72, 8, 14, O); p.R(85, 73, 6, 12, "#e8ecf0"); p.R(86, 70, 4, 4, O); p.R(87, 71, 2, 2, "#3a3a3e"); p.R(82, 84, 12, 3, O); p.R(83, 85, 10, 1, "#c8ccd0"); p.R(86, 80, 4, 1, "#c8a050"); } },
      // 檯面上一排今天送來的證物袋
      { y:106, draw(p){ for (let k = 0; k < 3; k++){ p.R(36 + k * 13, 86, 11, 8, O); p.R(37 + k * 13, 87, 9, 6, "rgba(220,235,240,.85)"); p.R(37 + k * 13, 87, 9, 1, "#e84a3a"); } } }
    ] }) },
    spots:{
      o33_micro:[80,68,16,20,90,112,"lab33",A("look")],
      o33_labscreen:[184,56,66,16,220,94,"lab33",A("type")]
    },
    details:{ d33_bench:[30,82,46,16,50,112,"lab33",A("look")] },
    place:{},
    extras:(EP.world.lab || {}).extras || [],
    plan:[ { name:"鑑識中心", w:100, h:20, rooms:{ lab33:[0,0,100,20] } } ] });
})();

/* ================= 金福銀樓（店面＝第 11 集） ================= */
C33T && (() => {
  const { EP, T, O, A, setLoc } = C33T;
  const G = typeof window !== "undefined" ? window.GOLD11 : null;
  const O2 = o => Object.assign({}, o, { phase:2 });
  const gfront33 = { name:"金福銀樓", w:300, h:156, wall:60,
    floor(p, g, t, o){ if (G) G.floor.call(this, p, g, t, O2(o)); else p.R(0, 0, 300, 156, "#e8e0cc");
      // 換了新玻璃的兩個展示櫃（比旁邊亮）
      p.R(32, 84, 2, 10, "rgba(255,255,255,.35)"); p.R(102, 84, 2, 10, "rgba(255,255,255,.35)"); },
    props:[
      ...(G ? G.props.map(q => ({ y:q.y, draw(p, g, t, o){ q.draw.call(this, p, g, t, O2(o)); } })) : []),
      // 櫃台上：黑絨布盤（六樣金飾）、攤開的收購簿
      { y:120, draw(p){ p.R(118, 78, 24, 10, O); p.R(119, 79, 22, 8, "#1a1a1e"); for (const [x, y] of [[121, 80], [127, 80], [133, 81], [121, 84], [128, 85], [135, 84]]) p.R(x, y, 4, 2, "#e9c43a");
          p.R(148, 78, 20, 10, O); p.R(149, 79, 9, 8, "#f4f0e0"); p.R(158, 79, 9, 8, "#f4f0e0"); for (let k = 0; k < 3; k++){ p.R(150, 81 + k * 2, 6, 1, "#5a5a6a"); p.R(159, 81 + k * 2, 6, 1, "#5a5a6a"); } } }
    ],
    front(p, g, t, o){ if (G && G.front) G.front.call(this, p, g, t, O2(o)); },
    solid:[[28,82,66,36],[98,82,74,36],[178,82,60,36],[272,124,20,22]],
    exits:[]
  };
  setLoc("gold", { start:"gfront33", spawn:[150,132], rooms:{ gfront33 },
    spots:{
      cctv33_gold:[140,27,30,14,156,74,"gfront33",A("type",{ actT:2 })],
      doc33_buy:[146,76,24,14,158,124,"gfront33",A("read")],
      o33_tray:[116,76,28,14,128,124,"gfront33",A("look")],
      o33_price:[14,10,44,34,36,72,"gfront33",A("read")]
    },
    details:{
      d33_cat:[220,70,14,16,232,72,"gfront33",A("look",{ face:-1 })],
      d33_glass:[28,82,66,36,60,124,"gfront33",A("look")]
    },
    place:{
      lu:[ { room:"gfront33", x:186, y:126, act:"idle", facing:-1 }, { room:"gfront33", x:186, y:126, act:"idle", facing:-1 } ]
    },
    extras:(EP.world.gold || {}).extras || [],
    plan:[ { name:"金福銀樓", w:100, h:30, rooms:{ gfront33:[0,0,100,30] } } ] });
})();

/* ================= 澄港醫院六樓・兒童病房 ================= */
C33T && (() => {
  const { EP, T, O, sh, A, tone, fluo, vinyl, window2, setLoc } = C33T;

  /* ---------- 兒童病房：粉藍的牆、貼滿貼紙的床頭板、床頭的儀器（沒開，螢幕角落一張便利貼）、紙膠帶貼在牆上的鉛筆畫；
       窗戶（看得到警察局的屋頂；窗台上倒扣著一個洗好的便當盒）、病床（小熊的被子）、陪床椅（一個資料夾）、床尾掛的紀錄夾、輪椅 ---------- */
  const ward33 = { name:"六樓・兒童病房", w:272, h:144, wall:58,
    floor(p, g, t, o){
      T.backWall(p, 0, 272, 58, "#d8e8f0", "plain", { base:"#6a8aa0" });
      for (let x = 6; x < 272; x += 34) { p.R(x, 46, 6, 6, "#f4c8a8"); p.R(x + 14, 48, 5, 5, "#a8d8b8"); }
      // 鉛筆畫（紙膠帶貼著）
      p.R(108, 14, 22, 18, O); p.R(109, 15, 20, 16, "#f8f8f4"); p.R(112, 20, 3, 8, "#5a5a5a"); p.R(116, 24, 8, 5, "#7a7a7a"); p.R(124, 28, 2, 2, "#5a5a5a"); p.R(108, 13, 5, 3, "#f4e0a0"); p.R(125, 13, 5, 3, "#f4e0a0");
      // 窗戶：遠遠的警察局屋頂
      window2(p, 176, 8, 60, 36, o, t, (x, y, w, h) => { p.R(x, y, w, h, "#a8c8e0"); p.R(x, y + h - 14, w, 14, "#8a9aa8"); p.R(x + 10, y + h - 20, 22, 8, "#c8c4b8"); p.R(x + 10, y + h - 20, 22, 2, "#5a6a7a"); p.R(x + 40, y + h - 16, 16, 4, "#9a8a7a"); }, "#e8ecf0");
      vinyl(p, 0, 58, 272, 86, "#d8e0d8", "#d0d8d0", 16);
      T.sides(p, this, "#6a8aa0", [["B", 110, 40]]);
    },
    props:[
      // 窗台上倒扣的便當盒
      { y:50, draw(p){ p.R(178, 44, 56, 4, O); p.R(179, 44, 54, 3, "#e8ecf0"); p.R(196, 40, 14, 5, O); p.R(197, 41, 12, 3, "#f4f0e0"); p.R(199, 41, 6, 1, "#e8802a"); } },
      // 床頭的儀器（沒開，便利貼）
      { y:62, draw(p){ T.box(p, 18, 30, 22, 10, 18, "#e8ecf0", "#b8bcc0"); p.R(20, 32, 18, 12, "#1e2226"); p.R(32, 33, 5, 4, "#f8e878"); } },
      // 病床（床頭板貼滿貼紙、小熊被子）
      { y:116, draw(p){ T.box(p, 44, 54, 50, 60, 6, "#f4f4f0", "#a8b0b8"); p.R(44, 48, 50, 8, O); p.R(45, 49, 48, 6, "#a8c8e8"); for (let k = 0; k < 5; k++) p.R(48 + k * 9, 50, 4, 4, ["#e8802a", "#3aa86a", "#e8c83a", "#e86a8a", "#3a8ae8"][k]);
          p.R(48, 58, 42, 10, "#f8f8f4"); p.R(46, 70, 46, 40, "#f4d8a8"); for (let k = 0; k < 3; k++){ p.R(54 + k * 13, 80 + (k % 2) * 12, 6, 6, "#c8905a"); p.R(55 + k * 13, 79 + (k % 2) * 12, 2, 2, "#c8905a"); p.R(59 + k * 13, 79 + (k % 2) * 12, 2, 2, "#c8905a"); } } },
      // 床尾掛的紀錄夾
      { y:120, draw(p){ p.R(62, 114, 14, 8, O); p.R(63, 115, 12, 6, "#c8ccd0"); p.R(64, 116, 10, 4, "#f4f4f0"); } },
      // 陪床椅（攤開成一半）＋資料夾
      { y:110, draw(p){ T.box(p, 106, 86, 22, 22, 6, "#5a8aa8", "#3a6a88"); p.R(110, 90, 14, 10, O); p.R(111, 91, 12, 8, "#3a6ad8"); p.R(112, 92, 10, 6, "#f4f4f0"); } },
      // 輪椅（恩恩坐的）
      { y:100, draw(p){ p.R(154, 84, 24, 18, O); p.R(155, 85, 22, 16, "#3a4a5a"); p.R(157, 87, 18, 12, "#5a6a7a"); for (const x of [152, 176]){ p.R(x, 88, 4, 14, O); p.R(x + 1, 89, 2, 12, "#8a8e94"); } p.R(152, 102, 6, 3, O); p.R(174, 102, 6, 3, O); } },
      // 床頭櫃
      { y:76, draw(p){ T.box(p, 96, 60, 16, 10, 10, "#e8ecf0", "#b8bcc0"); p.R(99, 56, 6, 6, O); p.R(100, 57, 4, 4, "#f4a8b8"); } }
    ],
    front(p, g, t, o){ fluo(p, 60, 2, 50); fluo(p, 180, 2, 50); tone(g, this, o, .25); },
    solid:[[16,48,26,16],[42,46,54,70],[104,84,26,26],[94,58,20,14]],
    exits:[]
  };
  setLoc("hospital", { start:"ward33", spawn:[150,136], rooms:{ ward33 },
    spots:{
      doc33_bill:[106,86,24,16,140,100,"ward33",A("read",{ face:-1 })],
      o33_notice:[60,112,18,12,70,128,"ward33",A("read")],
      o33_draw:[106,12,26,22,122,68,"ward33",A("look")],
      o33_bento:[194,38,18,10,204,66,"ward33",A("look")]
    },
    details:{
      d33_window:[176,8,60,36,222,66,"ward33",A("look")],
      d33_monitor:[18,28,22,22,30,72,"ward33",A("look",{ face:-1 })]
    },
    place:{
      en:[ { room:"ward33", x:166, y:102, act:"sitText", facing:-1, view:"side" }, { room:"ward33", x:166, y:102, act:"sitText", facing:-1, view:"side" } ]
    },
    extras:(EP.world.hospital || {}).extras || [],
    plan:[ { name:"澄港醫院六樓", w:100, h:24, rooms:{ ward33:[0,0,100,24] } } ] });
})();
