/* =========================================================
   第 5 集：像素畫、人物造型、監視器動畫、結案、走動畫面、地圖、開場
   ========================================================= */
EP5.art = true;
(() => {
  const PR = PX.prim, { R, P, dither, shade, OBJ, windowBox, door, sign, lamp, INK } = PR;
  const W = 192, H = 108;
  const wall = (y, c, b) => PR.wall(y, c, b), floor = (y, c, l) => PR.floor(y, c, l), sky = (a, b, h) => PR.sky(a, b, h);
  const SC = PX.SCENES;
  const cctvDome = (x, y) => { R(x, y, 10, 3, "#d6d6d6"); R(x + 2, y + 3, 6, 4, "#2a2a2e"); P(x + 6, y + 4, "#e04a3a"); };
  const sea = (y, ph) => { R(0, y, W, 20, ph === 0 ? "#1a2a4a" : "#3a6a9a"); for (let x = 0; x < W; x += 6) R(x + (y % 3), y + 3 + (x % 7), 4, 1, ph === 0 ? "#2a3a5a" : "#6a9aca"); };

  /* ---------- 場景 ---------- */
  SC.ckid = (o) => {
    wall(72, "#f4d8e0", false); R(0, 64, W, 8, "#e8b8c8");
    windowBox(80, 10, 36, 28, "#a8c8e8");
    R(36, 22, 28, 22, "#ffffff"); R(38, 24, 24, 18, "#fff8e8"); R(42, 34, 4, 6, "#3a3a3a"); R(48, 36, 3, 4, "#e8a0b0"); R(52, 30, 10, 6, "#3a6ab8"); for (let i = 0; i < 4; i++) P(40 + i * 5, 26, "#3ab0e0");
    R(96, 44, 34, 6, "#e8c8a0"); R(98, 50, 2, 20, "#c8a880"); R(126, 50, 2, 20, "#c8a880"); R(100, 30, 18, 14, "#ffffff"); for (let i = 0; i < 4; i++) R(102, 33 + i * 3, 14, 1, "#9a9a92");
    R(136, 56, 40, 14, "#f4f4f8"); R(134, 52, 44, 6, "#e8b8c8"); for (let i = 0; i < 4; i++){ R(140 + i * 8, 50, 6, 6, "#1e2a3a"); R(141 + i * 8, 52, 4, 3, "#f4f4f4"); P(143 + i * 8, 51, "#ffa040"); }
    R(119, 40, 9, 4, "#ffe0e8"); R(120, 41, 3, 2, "#e86a8a"); R(124, 41, 3, 1, "#3ab0e0");   // 邀請卡
    R(160, 36, 28, 30, "#2a2a2e"); R(162, 38, 24, 4, "#f4f4f4"); for (let i = 0; i < 7; i++) R(162 + i * 3.4, 38, 2, 4, i % 2 ? "#2a2a2e" : "#f4f4f4");
    floor(72, "#d8b898", "#c8a888");
  };
  // 陳家的車庫：白色休旅車（大嫂接送語彤用的）、黑色賓士
  SC.c5_garage = (o) => { PX.prim.wall(70, "#8a8a82", false); for (let y = 4; y < 34; y += 4) R(10, y, 40, 2, "#9a9a92");
    // 白色休旅車（大嫂接送語彤用的）：60–140
    R(62, 52, 76, 18, "#f0f0ec"); R(68, 40, 62, 13, "#e4e4e0"); R(72, 42, 24, 9, "#9cc5e6"); R(100, 42, 26, 9, "#9cc5e6"); R(62, 58, 76, 1, "#c8c8c4"); R(136, 56, 3, 4, "#e8c040"); R(62, 56, 3, 4, "#c23a2a");
    R(70, 68, 12, 6, "#1a1a1a"); R(118, 68, 12, 6, "#1a1a1a"); R(73, 70, 6, 2, "#6a6a6a"); R(121, 70, 6, 2, "#6a6a6a");
    R(103, 46, 14, 5, "#d8d4c8"); R(108, 48, 4, 1, "#5a5a5a");   // 前座的置物箱
    R(122, 41, 8, 4, "#1a1a1a"); P(128, 42, "#e04a3a");   // 擋風玻璃上的行車記錄器
    // 黑色賓士：150–190
    R(150, 54, 40, 14, "#1e1e22"); R(156, 45, 28, 10, "#2a2a30"); R(159, 47, 10, 6, "#4a5a6a"); R(171, 47, 10, 6, "#4a5a6a"); R(152, 58, 3, 3, "#c8c8c8"); R(154, 66, 9, 7, "#0a0a0a"); R(177, 66, 9, 7, "#0a0a0a");
    PX.prim.floor(70, "#6a6a62"); R(28, 84, 16, 3, "#55554d"); R(32, 87, 8, 1, "#55554d"); R(56, 82, 14, 3, "#55554d");   // 自家車的油漬
    R(140, 30, 10, 14, "#c8c4b8"); R(142, 33, 6, 1, "#5a5a5a"); R(142, 36, 6, 1, "#5a5a5a"); };
  // 陳家客廳（共用的客廳＋這一集的東西：全家福、鐘、兩袋現金）
  SC.c5_living = (o) => { SC.living(o); const ph = o.phase || 0;
    R(40, 8, 28, 20, "#6b4a2b"); R(42, 10, 24, 16, "#e8dcc0"); [[45,16,"#e0b48c"],[50,15,"#f0c8a8"],[55,16,"#e0b48c"],[60,19,"#f4d4bc"]].forEach(([x,y,c]) => { R(x, y, 4, 4, c); R(x, y - 1, 4, 1, "#2a2220"); R(x - 1, y + 4, 6, 4, "#5a6a8a"); });   // 牆上的全家福
    R(172, 12, 12, 12, "#f4f0e0"); R(171, 11, 14, 1, "#3a3a3a"); R(171, 24, 14, 1, "#3a3a3a"); R(177, 14, 1, 5, "#1a1a1a"); R(177, 18, 4, 1, "#1a1a1a");   // 牆上的鐘
    if (ph >= 1){ R(142, 60, 20, 9, "#2a3a5a"); R(144, 58, 16, 2, "#3a4a6a"); R(150, 57, 4, 2, "#1a1a1a"); R(142, 64, 20, 1, "#e8e8e0"); }   // 兩袋現金（運動袋）
  };
  // 保母房（和徐志賢的租屋不一樣：牆上語彤的照片、掛著的圍裙、床頭的小收音機）
  SC.c5_maid = (o) => { SC.studio(o); R(30, 22, 14, 12, "#f4f0e0"); R(32, 24, 10, 8, "#f4a8c0"); R(35, 25, 4, 4, "#f4d4bc"); R(28, 36, 2, 2, "#6b4a2b");
    R(46, 26, 2, 2, "#6b4a2b"); R(43, 28, 8, 16, "#e9e4da"); R(44, 30, 6, 1, "#c8a8a0");   // 照片、圍裙
    R(110, 42, 10, 6, "#8a6a4a"); R(112, 43, 4, 2, "#3a3a3a");   // 床頭的小收音機
    R(84, 51, 12, 6, "#c8a878"); R(86, 49, 8, 2, "#8a6a4a"); };   // 保母的包包
  const X5 = o => { R(30, 20, 24, 20, "#f4f4f0"); R(30, 20, 24, 4, "#c23a2a"); for (let k = 0; k < 12; k++) R(32 + (k % 6) * 3, 26 + Math.floor(k / 6) * 4, 2, 2, k === 7 ? "#c23a2a" : "#8a8a8a"); };   // 牆上的月曆
  SC.c5_police = (o) => { SC.police(o); R(21, 60, 12, 6, "#c8a060"); R(21, 62, 12, 1, "#c23a2a"); R(22, 59, 10, 1, "#e8e0c8"); };   // 桌上的便當
  SC.c5_lobby = (o) => { SC.lobby(o); R(160, 4, 10, 4, "#e8e8e8"); R(162, 8, 6, 3, "#2a2a2a"); P(166, 6, "#e04a3a");   // 大廳監視器
    R(40, 64, 40, 8, "#6b4a2b"); R(40, 64, 40, 1, "#8a6338"); R(56, 60, 8, 4, "#2a2a2e");   // 警衛台
    R(12, 62, 8, 10, "#8a8a8a"); R(12, 62, 8, 2, "#e8e0c8"); P(15, 61, "#f4f4f0");   // 菸灰桶
    R(118, 76, 32, 10, "#5a4a3a"); R(120, 70, 28, 6, "#c8d0d8"); R(124, 62, 6, 8, "#e8e8f0"); R(132, 58, 6, 12, "#d8e0e8"); R(140, 64, 5, 6, "#e8e8f0"); R(118, 70, 32, 1, "#7ab06a"); };   // 建案模型
  SC.c5_8f = (o) => { SC.acctoffice(o); R(152, 13, 14, 5, "#e8e8e8"); R(154, 9, 1, 4, "#5a5a5a"); R(163, 9, 1, 4, "#5a5a5a"); P(156, 15, "#6fd46f"); P(159, 15, "#6fd46f"); };   // 無線網路基地台
  SC.sgate = (o) => { const ph = o.phase || 0;
    sky(ph === 0 ? "#1a2238" : "#8ab0d0", ph === 0 ? "#3a4a6a" : "#d8e8f0", 30);
    R(0, 20, 110, 54, "#f4e8a8"); R(0, 18, 112, 4, "#e8a040"); R(14, 24, 80, 10, "#e86a2a"); R(18, 26, 72, 6, "#fff4c8");
    for (let i = 0; i < 9; i++) R(20 + i * 8, 27, 5, 4, "#e86a2a");
    door(40, 42, 28, 32, "#8ac0e8"); R(54, 42, 1, 32, "#6aa0c8"); windowBox(8, 40, 26, 20, "#a8d8f0"); windowBox(76, 40, 26, 20, "#a8d8f0");
    R(10, 62, 24, 10, "#c8a050"); for (let i = 0; i < 4; i++) R(12 + i * 6, 64, 4, 6, ["#e86a8a", "#6a9ae8", "#e8c040", "#6ac87a"][i]);
    R(120, 30, 70, 44, "#d8d0c0"); windowBox(130, 40, 20, 18, "#a8c0d0"); windowBox(160, 40, 20, 18, "#a8c0d0");
    cctvDome(150, 4);
    R(0, 74, W, 34, "#5a5a56"); dither(0, 74, W, 34, "#4e4e4a", 4); for (let x = 0; x < W; x += 20) R(x, 92, 10, 1, "#c9c9a0");
    R(110, 100, 60, 2, "#c23a2a"); R(80, 102, 10, 3, "#2a2a2a");
  };
  SC.x5room = (o) => { SC.studio(o); X5(o);
    R(58, 18, 24, 54, "#e8ecec"); R(58, 40, 24, 1, "#a8b0b0"); R(79, 26, 1, 10, "#a8b0b0"); R(79, 46, 1, 10, "#a8b0b0"); R(62, 22, 14, 10, "#f4f0e0"); R(64, 24, 4, 4, "#d8a880"); R(70, 24, 4, 4, "#f4d4bc");   // 冰箱、冰箱上的照片
    R(102, 60, 14, 12, "#5a6a5a"); R(104, 57, 8, 4, "#d8c8a0");   // 垃圾桶、空盒子
    R(8, 80, 14, 4, "#f4f4f0"); R(18, 81, 3, 2, "#c23a2a");   // 門縫塞進來的紙
    R(7, 60, 14, 12, "#f4f4ee"); R(9, 58, 4, 3, "#f4f4ee"); R(15, 58, 4, 3, "#f4f4ee"); R(9, 63, 4, 6, "#e8a0b0"); R(14, 64, 5, 5, "#e8c040"); };   // 徐志賢的租屋（加一袋兒童零食）
  SC.lab5 = (o) => { SC.lab(o); R(146, 58, 14, 4, "#e8e4d0"); P(148, 59, "#c23a2a"); P(153, 60, "#c23a2a"); P(157, 59, "#c23a2a"); R(162, 56, 4, 6, "#c89a6a"); R(162, 57, 4, 2, "#f4f0e0"); };   // 小吳桌上的地圖、咖啡
  SC.sroom = (o) => {
    wall(72, "#fff4d8", false); floor(72, "#c8b090", "#b8a080"); R(0, 64, W, 8, "#e8c880");
    R(120, 10, 60, 30, "#f8f8f8"); R(118, 8, 64, 2, "#8a8a8a"); for (let i = 0; i < 4; i++) R(124, 14 + i * 6, 30 + (i * 9) % 20, 1, "#3a6ab8");
    R(20, 40, 26, 20, "#e8e4dc"); R(22, 42, 22, 16, "#ffffff"); for (let i = 0; i < 5; i++) R(24, 44 + i * 3, 18, 1, "#9a9a92");
    OBJ.desk(60, 60, 50); R(80, 52, 16, 10, "#2a2a2e"); R(82, 54, 12, 6, "#6aa0d0");
    for (let i = 0; i < 6; i++) R(4 + i * 10, 14, 8, 10, ["#e86a8a", "#6a9ae8", "#e8c040", "#6ac87a", "#c86ae8", "#e8884a"][i]);
    R(80, 18, 20, 22, "#ffffff"); R(80, 18, 20, 4, "#e86a2a"); for (let i = 0; i < 5; i++) R(82, 24 + i * 3, 16 - (i % 2) * 4, 1, "#6a6a62"); R(82, 36, 16, 3, "#f4e48a");   // 接送規定
    
    for (let i = 0; i < 3; i++){ R(10 + i * 40, 76, 30, 4, "#e8a040"); R(12 + i * 40, 80, 2, 10, "#c88030"); R(36 + i * 40, 80, 2, 10, "#c88030"); }   // 小桌子
  };
  SC.pmeet = (o) => { const ph = o.phase || 0;
    wall(72, "#c8ccd0", false); R(0, 64, W, 8, "#8a8e92");
    R(120, 10, 60, 36, "#e8e4d0"); for (let i = 0; i < 12; i++) R(122 + (i * 13) % 56, 12 + (i * 7) % 32, 4, 3, "#4a86b4"); R(160, 38, 14, 6, "#9aa0a6"); P(166, 40, "#e04a3a");
    OBJ.desk(20, 62, 90); R(40, 46, 36, 14, "#3a3e44"); R(42, 48, 32, 8, "#1a2a3a"); for (let i = 0; i < 4; i++) R(44, 49 + i * 2, 10 + i * 5, 1, "#6fd46f"); R(100, 54, 20, 6, "#2a2a2e"); P(116, 56, "#e04a3a");
    R(4, 16, 30, 40, "#e8e8e4"); R(6, 18, 26, 12, "#3a5a7a"); R(8, 32, 22, 2, "#9a9a92");
    for (let i = 0; i < 6; i++) R(10 + i * 14, 4, 8, 3, "#f4f8ff");
    floor(72, "#9a9a92", "#8a8a82");
  };
  SC.rshop = (o) => {
    wall(72, "#d8d8d0", false); R(0, 64, W, 8, "#6a6a62");
    R(10, 10, 80, 16, "#2a6ab8"); R(14, 13, 72, 10, "#e9e4da"); for (let i = 0; i < 6; i++) R(20 + i * 10, 15, 6, 6, "#2a6ab8");
    OBJ.desk(50, 62, 60); R(64, 50, 18, 12, "#2a2a2e"); R(66, 52, 14, 8, "#6aa0d0"); R(90, 56, 14, 6, "#f4f4ee");
    R(136, 26, 40, 30, "#8a6a42"); for (let i = 0; i < 12; i++){ P(140 + (i % 6) * 6, 30 + Math.floor(i / 6) * 10, "#c8c8c8"); R(139 + (i % 6) * 6, 32 + Math.floor(i / 6) * 10, 3, 4, "#2a6ab8"); }
    floor(72, "#8a8a82", "#7a7a72");
  };
  SC.hshed = (o) => { const ph = o.phase || 0;
    R(0, 0, W, H, "#5a646e"); for (let x = 0; x < W; x += 8) R(x, 0, 2, 74, "#4e5862"); R(0, 0, W, 6, "#7a848e");
    for (let i = 0; i < 4; i++){ R(12 + i * 10, 40 - i * 2, 40, 34, ["#3a8a6a", "#2a6a8a", "#8a6a3a", "#3a7a5a"][i]); dither(12 + i * 10, 40 - i * 2, 40, 34, "#00000022", 3); }
    R(70, 30, 50, 6, "#8a6a42"); for (let i = 0; i < 5; i++) R(74 + i * 9, 20, 6, 10, ["#e8c040", "#c23a2a", "#e8e4dc", "#e8c040", "#3a8a6a"][i]);
    R(130, 56, 44, 14, "#8a6a42"); R(128, 54, 48, 3, "#a8865a");
    if (o.rescue){ R(60, 62, 14, 8, "#2a2a2e"); R(62, 63, 10, 5, "#6ab0e0"); R(40, 66, 24, 6, "#c8a0d0"); }
    lamp(96, 0, "#f4e8a8");
    R(0, 74, W, 34, "#5a5a52"); dither(0, 74, W, 34, "#4a4a42", 3);
  };
  SC.hpier = (o) => { const ph = o.phase || 0;
    sky(ph === 0 ? "#1a2238" : "#8ab0d0", ph === 0 ? "#3a4a6a" : "#e0e8ee", 30);
    sea(30, ph); R(0, 30, W, 2, "#e8f0f4");
    R(120, 12, 66, 20, "#f4f4f0"); R(124, 6, 30, 8, "#e8e8e4"); R(130, 2, 4, 6, "#c23a2a"); for (let i = 0; i < 6; i++) R(126 + i * 9, 16, 6, 4, "#3a5a7a"); R(120, 30, 66, 2, "#c23a2a");
    R(0, 50, W, 24, "#8a8a82"); for (let x = 0; x < W; x += 30) R(x, 50, 2, 24, "#7a7a72");
    for (let i = 0; i < 3; i++){ R(10 + i * 34, 34, 30, 18, "#7a848e"); for (let x = 10 + i * 34; x < 40 + i * 34; x += 4) R(x, 34, 1, 18, "#6a747e"); R(16 + i * 34, 40, 10, 12, "#5a646e"); }
    if (!o.noCar){ OBJ.car(40, 58, "#f4f4f0"); R(46, 52, 34, 3, "#1e1e22"); }
    R(0, 74, W, 34, "#6a6a62"); dither(0, 74, W, 34, "#5a5a52", 4); for (let x = 10; x < W; x += 40){ R(x, 76, 6, 6, "#3a3a3a"); }
  };

  { const hp = SC.hpier, hs = SC.hshed;
    SC.hpier = (o) => { hp(o); [[20,10],[46,18],[88,8]].forEach(([x,y]) => { P(x, y, "#f4f4f0"); P(x + 1, y + 1, "#f4f4f0"); P(x + 2, y, "#f4f4f0"); P(x - 1, y - 1, "#f4f4f0"); P(x + 3, y - 1, "#f4f4f0"); }); };   // 海鷗
    SC.hshed = (o) => { hs(o); if (!o.rescue){ R(62, 62, 12, 8, "#f4a8c0"); R(63, 63, 10, 6, "#1a2a3a"); R(122, 58, 14, 12, "#2a3a6a"); R(124, 56, 10, 3, "#2a3a6a"); R(124, 60, 1, 8, "#1a1a1a"); R(133, 60, 1, 8, "#1a1a1a"); } };   // 語彤的平板、運動背包
  }
  /* ---------- 人物造型 ---------- */
  const LOOK = {
    chen: { skin:"#e0b48c", hair:"#2a2220", hairStyle:"slick", top:"#e9e4da", coat:"#2a2f3a", bottom:"#2a2f3a", tie:"#7a1e24", mood:"worried", hello:"警官……求求你，把語彤帶回來。",
            byPhase:{ 1:{ tie:null, coat:null, top:"#8a8e94" }, 2:{ tie:null, coat:null, top:"#6a6e74", mood:"tired" } } },
    zhang:{ skin:"#f0c8a8", hair:"#3a2a20", hairStyle:"long", top:"#e8d8c8", bottom:"#3a3a4a", skirt:true, mood:"sad", hello:"……她會不會冷？她會不會餓？",
            byPhase:{ 1:{ top:"#a8a0b0", skirt:false }, 2:{ top:"#6a6a7a", skirt:false } } },
    uncle:{ skin:"#e0b48c", hair:"#1a1410", hairStyle:"slick", top:"#e9e4da", coat:"#1e1e22", bottom:"#1e1e22", tie:"#2a3a6a", glasses:true, hello:"有什麼需要，我這個做叔叔的一定幫忙。",
            byPhase:{ 1:{ tie:null }, 2:{ tie:null, coat:"#3a3a3a" } } },
    nanny:{ age:"old", skin:"#e8c09a", hair:"#3a3430", hairStyle:"bob", top:"#c8a8a0", bottom:"#4a4a52", apron:"#e9e4da", mood:"worried", hello:"都是我不好……" },
    ade:  { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#e9e4da", coat:"#1e1e22", bottom:"#1e1e22", hat:"cap", capColor:"#1e1e22", hello:"警官好。" },
    liu:  { skin:"#f4d4bc", hair:"#3a2a20", hairStyle:"long", top:"#f4b8c8", bottom:"#3a4a6a", apron:"#e8c040", mood:"sad", hello:"……對不起，對不起。" },
    huang:{ age:"old", skin:"#d0a080", hair:"#c8c8c0", hairStyle:"slick", top:"#e9e4da", coat:"#5a4a2a", bottom:"#5a4a2a", tie:"#c9a24a", hello:"我很忙，有話快說。" },
    xu:   { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a3a3a", bottom:"#2a2a30", hat:"cap", capColor:"#1e1e22", mood:"sad", hello:"……她沒事吧？她沒事就好。" },
    land: { age:"old", skin:"#e8c09a", hair:"#c8c4b8", hairStyle:"bob", top:"#6a8a6a", bottom:"#3a3a3a", hello:"又是來找阿賢的？他欠我兩個月房租了！" },
    rent: { age:"old", skin:"#c99a6e", hair:"#4a4a46", hairStyle:"short", top:"#2a6ab8", bottom:"#3a3a3a", hello:"租車嗎？" },
    zhou: { age:"old", skin:"#d8a880", hair:"#6a6a66", hairStyle:"slick", top:"#e9e4da", coat:"#3a3f4a", bottom:"#2a2f3a", hello:"說重點。" },
    yeq:  { skin:"#f0d0b4", hair:"#1e1a18", hairStyle:"long", top:"#f4f4f0", coat:"#6a6e74", bottom:"#6a6e74", skirt:true, hello:"程序要對。說吧。" },
    wu:   { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", coat:"#f4f6f6", bottom:"#3a4050", glasses:true, hello:"要驗什麼，交給我。" }
  };
  const DAILY = {
    chen: [ { room:"cliving", x:90, pose:"sit", doing:"坐在電話旁邊，眼睛一直盯著它。" }, { room:"cliving", x:140, pose:"stand", doing:"站在兩袋現金旁邊，手放在袋子上。" }, { room:"cliving", x:90, pose:"sit", doing:"一夜沒睡，坐在電話旁邊發抖。" } ],
    zhang:[ { room:"ckid", x:120, pose:"cry", doing:"坐在女兒的床上，抱著小企鵝玩偶哭。" }, { room:"ckid", x:120, pose:"sit", doing:"在女兒房間裡，一直摺同一件衣服。" }, { room:"cliving", x:50, pose:"cry", doing:"跌坐在客廳的地上。" } ],
    uncle:[ { room:"cliving", x:40, pose:"phone", doing:"在客廳角落講電話，聲音壓得很低。" }, { room:"c8f", x:100, pose:"sit", doing:"在 8 樓辦公室，一直看手機。" }, { room:"cliving", x:40, pose:"stand", doing:"站在客廳，說要陪哥哥守著電話。" } ],
    nanny:[ { room:"cmaid", x:100, pose:"cry", doing:"在保母房裡哭。" }, { room:"cmaid", x:100, pose:"sit", doing:"坐在床邊，手裡握著語彤的照片。" }, { room:"ckid", x:60, pose:"broom", doing:"在語彤的房間掃地，一邊掃一邊掉眼淚。" } ],
    ade:  [ { room:"cgarage", x:40, pose:"smoke", doing:"在車庫門口抽菸。" } ],
    liu:  [ { room:"sroom", x:100, pose:"cry", doing:"在教室裡哭，班主任在旁邊陪她。" }, { room:"sroom", x:100, pose:"sit", doing:"一個人坐在空教室裡。" } ],
    huang:[ null, { room:"clobby", x:140, pose:"cross", doing:"站在大廳，被保全擋著不讓上樓。" } ],
    xu:   [ null, null, { room:"hpier", x:120, pose:"sit", doing:"被銬在警車旁邊，低著頭。" } ],
    land: [ null, { x:60, pose:"cross", doing:"站在門口，雙手叉腰。" } ],
    rent: [ null, { x:100, pose:"sit", doing:"坐在櫃檯後面看報紙。" } ],
    zhou: [ { room:"cliving", x:160, pose:"phone", doing:"在客廳角落用無線電指揮。" }, { room:"pmeet", x:150, pose:"cross", doing:"在會議室盯著大地圖。" }, { room:"pmeet", x:150, pose:"phone", doing:"在會議室講電話，臉色很難看。" } ],
    yeq:  [ null, { room:"pmeet", x:60, pose:"read", doing:"在會議室看監聽聲請書。" } ],
    wu:   [ { room:"cliving", x:120, pose:"kneel", doing:"蹲在電話旁邊接錄音設備。" }, { x:80, pose:"stand", doing:"在實驗台前盯著電腦。" } ]
  };
  EP5.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id].map(d => d || DAILY[s.id].find(x => x));
  });
  const L0 = id => { const L = Object.assign({}, LOOK[id]); delete L.hello; delete L.byPhase; return L; };
  EP5.looks = {
    xuM: { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a3a3a", bottom:"#2a2a30", hat:"cap", capColor:"#1e1e22", mask:"#f4f4f4" },
    girl: { skin:"#f4d4bc", hair:"#3a2a20", hairStyle:"bob", top:"#f4a8c0", bottom:"#3a6ab8", skirt:true, prop:"bag" },
    uncleL: L0("uncle"), chenL: L0("chen"), xuL: L0("xu")
  };

  /* ---------- 房間和隱藏小細節 ---------- */
  EP5.rooms = {
    chenhome: [
      { id:"cgarage", name:"車庫", scene:"c5_garage", details:[
        { id:"d5_oil", name:"地上的油漬", label:"車庫地板", hot:[20,80,60,10], text:"車庫地上只有自家車的油漬，很乾淨。" } ] },
      { id:"cliving", name:"陳家客廳", scene:"c5_living", details:[
        { id:"d5_clock", name:"牆上的鐘", hot:[170,10,16,16], text:"每一次秒針走過，陳太太就看一眼。" } ] },
      { id:"ckid", name:"語彤的房間", scene:"ckid", details:[
        { id:"d5_window", name:"窗外", hot:[80,10,36,28], text:"窗外看得到港口的燈。語彤說過，長大要當船長。" } ] },
      { id:"cmaid", name:"保母房", scene:"c5_maid", details:[
        { id:"d5_maidwin", name:"小窗", hot:[120,10,32,26], text:"保母房的小窗對著廚房的後門。" } ] }
    ],
    school: [
      { id:"sgate", name:"安親班門口", scene:"sgate", details:[
        { id:"d5_redline", name:"紅線", hot:[110,98,60,6], text:"門口對面是紅線。平常家長都會被警衛趕走，那天警衛請假。" } ] },
      { id:"sroom", name:"教室・接送櫃台", scene:"sroom", details:[
        { id:"d5_cubby", name:"置物格", hot:[4,14,60,10], text:"每個孩子都有一個彩色的置物格。語彤的是黃色的，裡面還有一盒沒吃完的蠟筆。" } ] }
    ],
    police: [
      { id:"pdesk", name:"刑大辦公室", scene:"c5_police", details:[
        { id:"d5_bento", name:"便當", hot:[20,58,14,10], text:"桌上一疊便當，是副局長派人送來的，每一個都還熱著。" } ] },
      { id:"pmeet", name:"專案會議室", scene:"pmeet", details:[
        { id:"d5_coffee", name:"咖啡機", hot:[4,16,30,40], text:"咖啡機從昨晚到現在沒停過。" } ] }
    ],
    lab: [ { id:"lab", name:"澄港鑑識中心", scene:"lab5", details:[
      { id:"d5_screen", name:"電腦螢幕", hot:[128,38,30,22], text:"小吳的螢幕上開著一張地圖，上面標了好幾個基地台。" } ] } ],
    company: [
      { id:"clobby", name:"港灣大樓大廳", scene:"c5_lobby", details:[
        { id:"d5_guard", name:"警衛台", hot:[40,58,40,14], text:"警衛說，副總那天下午沒下來過，連便當都是叫上去的。" } ] },
      { id:"c8f", name:"8 樓副總辦公室", scene:"c5_8f", opt:{ who:"lin" }, details:[
        { id:"d5_view", name:"窗外", hot:[70,10,60,30], text:"從 8 樓看出去，整個港口都在腳下。南澳漁港在很遠的地方。" } ] },
      { id:"cfin", name:"財務部", scene:"archive", details:[
        { id:"d5_shred", name:"碎紙機", hot:[150,54,24,32], text:"碎紙機的桶子是滿的。會計說，副總上禮拜叫人碎了一大堆舊單據。" } ] }
    ],
    xuhome: [ { id:"xroom", name:"徐志賢的租屋", scene:"x5room", details:[
      { id:"d5_bed", name:"床", hot:[110,48,60,10], text:"床上的被子摺得整整齊齊。他走的時候，好像沒打算回來。" } ] } ],
    rental: [ { id:"rshop", name:"順風租車", scene:"rshop", details:[
      { id:"d5_sign", name:"招牌", hot:[10,10,80,16], text:"「順風租車　現金優惠　免信用卡」。" } ] } ],
    harbor: [
      { id:"hpier", name:"南澳漁港碼頭", scene:"hpier", details:[
        { id:"d5_gull", name:"海鷗", hot:[0,0,120,30], text:"海鷗在頭上叫。魚市場的味道整個碼頭都聞得到。" } ] },
      { id:"hshed", name:"志明漁具倉庫", scene:"hshed", opt:(ph,has)=>({ rescue: has("e_rescue") }), details:[
        { id:"d5_rope", name:"牆上的繩子", hot:[70,20,50,16], text:"一圈一圈的浮標和繩子。地上有一張小企鵝的貼紙。" } ] }
    ]
  };

  /* ---------- 監視器動畫 ---------- */
  const ANIM = {
    cctv_school: { scene:"sgate", opt:{ phase:1 }, cam:"小太陽 CAM1", date:"2026-04-17", beats:[
      { t:"16:08:00", d:3, cap:"一台白色廂型車停在對面，車頂有黑色行李架。", cars:{ van:[230,120,"#f4f4f0"] } },
      { t:"16:10:00", d:3.5, cap:"一個戴黑色鴨舌帽、白色口罩的高個子男人下車，走進安親班。", cars:{ van:[120,120,"#f4f4f0"] }, m:{ xuM:[54,76,null,-1,130,98,[[54,98]]] }, out:["xuM"] },
      { t:"16:11:00", d:3.5, cap:"語彤背著書包跑出來，自己牽住他的手。", cars:{ van:[120,120,"#f4f4f0"] }, m:{ xuM:[80,96,null,1,54,76], girl:[70,98,null,1,54,76] } },
      { t:"16:12:00", d:3, cap:"兩個人上車，廂型車往南澳路的方向開走。", m:{ xuM:[130,98,null,1], girl:[124,98,null,1] }, out:["xuM","girl"], cars:{ van:[120,-60,"#f4f4f0"] } }
    ] },
    ev_dashcam: { scene:"hpier", opt:{ phase:1, noCar:true }, cam:"DASHCAM", date:"2026-04-12", beats:[
      { t:"15:02:00", d:3, cap:"南澳漁港公有停車場。開車的人下車——是陳建志。", m:{ uncleL:[90,98,null,1,60,98] } },
      { t:"15:03:00", d:4, cap:"他走到停車場邊，跟一個戴鴨舌帽的高個子男人說話。男人點菸，右手手背露出一個船錨刺青。", m:{ uncleL:[110,98,"stand",1], xuL:[140,98,"smoke:R",-1] } },
      { t:"15:04:00", d:2.5, cap:"影片停在這裡。", m:{ uncleL:[110,98,"stand",1], xuL:[140,98,"smoke:R",-1] } }
    ] },
    cctv_store: { scene:"store", cam:"舊港門市 CAM2", date:"2026-04-10", beats:[
      { t:"21:38:00", d:3, cap:"一個戴黑色鴨舌帽的高個子男人走進店裡。", m:{ xuL:[60,98,null,-1,200,98] } },
      { t:"21:40:00", d:3.5, cap:"他在櫃檯買了一張預付卡，付現金，脫下手套——右手手背有船錨刺青。", m:{ xuL:[134,98,"give:R@cash",1,60,98] } },
      { t:"21:41:00", d:3, cap:"他抬頭看了一眼監視器，是徐志賢。", m:{ xuL:[134,98,"stand",1] } }
    ] },
    cctv_clobby: { scene:"c5_lobby", cam:"港灣大樓 LOBBY", date:"2026-04-17", beats:[
      { t:"14:05:00", d:3, cap:"陳建志從大門走進來，搭電梯上樓。", m:{ uncleL:[102,84,null,1,-14,98,[[102,98]]] }, out:["uncleL"] },
      { t:"17:02:00", d:3, cap:"電梯的樓層燈：董事長陳建宏從 8 樓直接下到地下室，沒有在大廳停。陳建志一直沒有出現。", m:{} }
    ] }
  };
  [...EP5.cctv, ...EP5.evidence].forEach(it => { if (ANIM[it.id]) it.anim = ANIM[it.id]; });
  const PS = [["living",{phase:0}],["pmeet",{}],["hpier",{phase:1}]];
  EP5.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 結案 ---------- */
  EP5.court = {
    title: "陳家客廳", scene: "living",
    who: ph => ph >= 2 ? ["uncle","xu","nanny","chen","zhang","huang"] : ["uncle","nanny","chen","zhang","huang"],
    open: ph => "語彤裹著毛毯，睡在媽媽懷裡。你請所有人留在陳家的客廳。葉晴檢察官站在門口。",
    kindLine: {
      kidnap: "我的結論是——語彤是被人為了錢綁走的。而且，綁匪不是一個人。",
      fake: "我的結論是——這是家裡的人自己安排的一場假綁架。"
    },
    murmur: [ "（陳建志鬆了鬆領帶。）", "（保母王淑芬一直低著頭。）", "（陳建宏把女兒抱得更緊了。）" ],
    confess: {
      xu: [ "……我欠了三百萬。被開除那天，我真的走投無路。", "副總說，沒有人會受傷。語彤叫我阿賢叔叔……我每天都給她看波波。" ],
      uncle: [ "……4 月 27 號，會計師就要來了。一千八百萬，我補不回去。", "我跟阿賢說好了，錢拿到就送她回家。她是我姪女……我怎麼可能傷害她。", "哥，對不起。" ]
    },
    cornered: { uncle: "我要找律師。", xu: "……我什麼都不會說。" },
    deny: {
      nanny: "我只是去見男朋友……我對不起太太，可是我沒有害語彤！",
      zhang: "那是我的女兒！",
      chen: "……你在說什麼？",
      huang: "我人在上海，你要我說幾次？",
      ade: "我那天一直在地下室等董事長。"
    },
    replayText: "4 月 17 日到 19 日，真正發生的事——",
    replay: { scene:"sgate", opt:{ phase:1 }, clean:true, cam:"案發經過重現", date:"2026-04-17", beats:[
      { t:"04/12 15:02", d:3, scene:"c5_garage", cap:"陳建志借了大嫂的車，從置物箱拿走備用接送卡，在南澳漁港見了徐志賢。", m:{ uncleL:[110,90,"back+reach:R@card/#f4f4f0",1,170,98] } },
      { t:"04/12 15:03", d:2, join:true, scene:"c5_garage", cap:"陳建志借了大嫂的車，從置物箱拿走備用接送卡，在南澳漁港見了徐志賢。", m:{ uncleL:[110,96,"pocket:R@card/#f4f4f0",1,110,90] } },
      { t:"04/12 16:40", d:4, scene:"hpier", opt:{ phase:1 }, cap:"陳建志借了大嫂的車，從置物箱拿走備用接送卡，在南澳漁港見了徐志賢。", m:{ uncleL:[80,98,"give:R@card/#f4f4f0",1,-20,98], xuL:[104,98,"reach",-1,104,98] } },
      { t:"04/17 15:20", d:4, scene:"c5_8f", opt:{ who:"lin" }, cap:"他在 8 樓的辦公室，用大嫂的密碼登入 App，發了那則訊息。", m:{ uncleL:[96,98,"sit+phone:R",1,96,98] } },
      { t:"04/17 16:11", d:4, cap:"語彤看到「阿賢叔叔」，開心地跑過去牽他的手。", cars:{ van:[120,120,"#f4f4f0"] }, m:{ xuM:[80,96,null,1,54,76], girl:[70,98,null,1,54,76] } },
      { t:"04/17 16:12", d:3, join:true, cap:"語彤看到「阿賢叔叔」，開心地跑過去牽他的手。", m:{ xuM:[130,98,null,1], girl:[124,98,null,1] }, out:["xuM","girl"], cars:{ van:[120,-60,"#f4f4f0"] } },
      { t:"04/18 12:00", d:4, scene:"hshed", opt:{ phase:1 }, cap:"南澳漁港的鐵皮倉庫裡，背景響起渡輪兩聲長長的船笛。", m:{ girl:[44,96,"sit",1,44,96], xuM:[120,98,"stand",-1,120,98] } },
      { t:"04/18 17:32", d:4, scene:"hpier", opt:{ phase:1 }, cap:"交贖金時，一通隱藏號碼的電話告訴徐志賢：「第二台是警察。」——那通電話是誰打的，沒有人知道。", m:{ xuM:[100,98,"phone:R",-1,100,98] } }
    ] },
    endGood: "語彤平安回家了。陳建志被收押，那一千八百萬的洞，要用他自己的一輩子來補。\n只有一件事你想不通：交贖金時，是誰打了那通電話？",
    endBad: "語彤回家了。可是你總覺得，有人悄悄鬆了一口氣。"
  };
  if (typeof ARC_INTER !== "undefined" && ARC_INTER[5] && ARC_INTER[5].after) EP5.after = ARC_INTER[5].after;

  /* ---------- 走動畫面、地圖、開場 ---------- */
  const RX = i => 116 + i * 198;
  EP5.outScenes = ["sgate","hpier"];
  EP5.fac = { chenhome:["#e8e0d0","#6a4a2a"], school:["#f4e8a8","#e86a2a"], police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], company:["#8a96a2","#2a3a5a"], xuhome:["#a8a49a","#5a4a3a"], rental:["#d8d8d0","#2a6ab8"], harbor:["#7a848e","#2a5a7a"] };
  EP5.setting = { chenhome:"villa", school:"town", police:"city", lab:"city", company:"city", xuhome:"town", rental:"town", harbor:"town" };
  const SKY5 = [ ["#0b0f1c","#27324a","#18202a","#1d2630",0,1], ["#8ab0d0","#d8e8f0","#4a6070","#56707a",0,0], ["#d8a070","#f0d8b0","#5a6a70","#6a7a80",0,0] ];
  EP5.worldSky = ph => SKY5[Math.min(ph || 0, SKY5.length - 1)];
  EP5.roomDesc = {
    cgarage:"陳家的車庫。一台白色休旅車、一台黑色賓士。", cliving:"陳家的客廳。電話旁邊坐滿了人，沒有人說話。", ckid:"語彤的房間。粉紅色的，到處都是小企鵝。", cmaid:"保母房。小小的，很整齊。",
    sgate:"小太陽安親班的門口。對面是紅線。", sroom:"安親班的教室。孩子們都被家長接走了。",
    pdesk:"澄港市刑大。你的位子在窗邊。", pmeet:"專案會議室。牆上一張大地圖，桌上一堆無線電。",
    lab:"澄港鑑識中心。小吳的地盤。", clobby:"港灣大樓的大廳。陳氏建設在 6 到 8 樓。", c8f:"8 樓的副總辦公室。", cfin:"財務部。一整排帳冊。",
    xroom:"徐志賢的租屋。很小，很舊。", rshop:"順風租車。一個小小的櫃檯。", hpier:"南澳漁港的碼頭。海風很腥。", hshed:"志明漁具倉庫。鐵皮屋頂被風吹得咚咚響。"
  };
  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#4a4038", bottom:"#3a3328", tie:"#5a2a2a", hat:"fedora", hatColor:"#3a3226" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const HAN = (typeof ARC !== "undefined" && ARC.look && ARC.look("han")) || { age:"old", skin:"#d8a880", hair:"#8a8a84", hairStyle:"slick", top:"#e9e4da", coat:"#2a2f3a", bottom:"#2a2f3a", tie:"#2a3a6a" };
  EP5.world = {};
  EP5.locations.forEach(l => { EP5.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP5.world.police, { extras:[
    { id:"han", name:"韓副局長", phase:1, until:1, x:RX(0) + 150, L:HAN, pose:"hold", facing:-1, mood:"smile", lines:[
      "我買了便當，大家先吃一點。",
      "辛苦了，孩子平安最重要。" ] } ] });
  Object.assign(EP5.world.chenhome, {
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { car:[-60, 8, 2.4, "#e9e4da"], hide:true },
      { wait:0.5, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "到了，陳家。大隊長說不准開警車進去，我們停在下面走上來的。", "小吳"),
      say("wu", "八歲的陳語彤，今天下午 16:10 在安親班被人接走。接她的人拿著陳家的接送卡，App 上還有一則媽媽帳號發的訊息。", "小吳"),
      say("wu", "媽媽說那則訊息不是她發的。綁匪到現在還沒打電話來。", "小吳"),
      say("you", "會打來的。要錢的人，一定會打來。", "你"),
      say("wu", "今晚只能在陳家和安親班查。明天刑大開了，才能申請監聽、調閱。……要記得，綁匪打來以前，有些事要先準備好。", "小吳"),
      say("wu", "問一題五分鐘，查一樣東西十分鐘。想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  EP5.mapPos = { chenhome:[60,24,"r"], school:[96,52,"u"], police:[132,62,"r"], lab:[150,48,"u"], company:[170,76,"r"], xuhome:[108,92,"l"], rental:[80,78,"l"], harbor:[150,120,"r"] };
  EP5.mapRoads = [["chenhome","school"],["school","police"],["police","lab"],["police","company"],["police","xuhome"],["school","rental"],["rental","xuhome"],["xuhome","harbor"],["company","harbor"]];
  EP5.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#8a9a86"); dither(0, 0, 240, 135, "#96a692", 3);
    const blocks = (x0, y0, x1, y1, c, c2) => { for (let x = x0; x < x1; x += 8) for (let y = y0; y < y1; y += 7) { R(x, y, 6, 5, c); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, c2); } };
    for (let i = 0; i < 8; i++) R(10 + i * 9, 6 + (i % 3) * 5, 8, 14, "#5a7a4a");   // 山
    blocks(70, 40, 200, 100, "#c8c0b0", "#b0a898");
    // 海（右下）
    for (let y = 96; y < 135; y += 2) for (let x = 0; x < 240; x += 4) { const yy = y + Math.sin(t + x / 10) * 0.6; if (x > 200 - (y - 96) * 3 || y > 104) R(x, yy, 4, 2, "#4a86b4"); }
    for (let x = 120; x < 200; x += 10) R(x, 108, 6, 6, "#9aa0a6");   // 南澳的倉庫
  };
})();
