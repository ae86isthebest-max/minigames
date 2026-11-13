/* =========================================================
   第 3 集：走動畫面、地圖、開場
   每個地點都用 worldkit 的 autoWorld：房間排成一整排，戶外的房間（小巷、車道）畫天空
   ========================================================= */
(() => {
  const G = 124, RX = i => 116 + i * 198;   // autoWorld：第 i 個房間的左邊 x
  EP3.outScenes = ["wlane", "wyard"];
  // 建築外牆和招牌的顏色
  EP3.fac = {
    warehouse:["#a8aeb4","#2a3a5a"], police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], morgue:["#c8ccc8","#4a4e54"],
    firm:["#d8d4c8","#2a3a5a"], vhome:["#d8ccb8","#6a4a3a"], linhome:["#c8c0b0","#5a4a3a"], jia:["#d8c8c0","#8a4a5a"],
    shark:["#4a3a36","#c8a040"], market:["#c8c4b8","#c23a2a"], pi:["#8a8e94","#2a2a2e"], seven:["#f4f4f0","#e86a2a"], diner:["#e8c8a0","#c23a2a"]
  };
  EP3.setting = { warehouse:"town", market:"town", seven:"town", jia:"town", shark:"town", vhome:"city", linhome:"city", firm:"city", pi:"city", diner:"city", police:"city", lab:"city", morgue:"town" };
  // 十二月的新北：[上, 下, 遠景, 近景, 雨, 夜晚]
  const SKY3 = [
    ["#56606a","#8c969c","#3a4a50","#46565c",1,0],
    ["#6a7a88","#b0bcc4","#4a5a60","#56666c",0,0],
    ["#4e5862","#868e96","#3a4a50","#46565c",1,0],
    ["#7090b0","#c6d6e2","#4a6070","#56707a",0,0],
    ["#3a3a5a","#d08a5a","#2a3440","#36404a",0,0]
  ];
  EP3.worldSky = ph => SKY3[Math.min(ph || 0, SKY3.length - 1)];

  // 每個房間第一次走進去（每天各一次），主角會說一句
  EP3.roomDesc = {
    wlane: "倉儲圍牆外的小巷。沒有路燈，泥地上都是水窪。",
    wyard: "宏昌倉儲的大門和車道。一排鐵捲門，B-12 在最裡面。",
    wguard: "管理室。四個監視器螢幕，一台小電視，一個便當。",
    wfront: "B-12 的前段。鐵架上都是檔案箱，中間是打包桌。",
    wback: "B-12 的最裡面。血腥味重得讓人想吐。",
    pdesk: "新莊分局刑事組。桌上的調閱申請單疊得跟山一樣高。",
    pinterview: "偵訊室。一張桌子、兩張椅子、一面單面鏡。",
    lab: "新北鑑識中心。白色的實驗台，冰箱裡放著九根手指。",
    morgue: "解剖室。消毒水和福馬林的味道，冷得像冰箱。",
    mhall: "家屬休息室。沙發、花籃，還有一盒衛生紙。",
    freception: "鄭林聯合會計師事務所。櫃檯的小姐眼睛紅紅的。",
    voffice: "鄭國華的辦公室。東西少得不像一個做了二十年的人。",
    loffice: "林啟明的辦公室。整整齊齊，連筆都排成一直線。",
    farchive: "帳務室。一整面牆的帳冊，一台碎紙機。",
    vliving: "鄭家的客廳。電視關著，只聽得到時鐘的聲音。",
    vstudy: "鄭國華的書房。一台電腦、一整排稅法的書。",
    vgarage: "鄭家的車庫。白色 Lexus 的車位空著。",
    llobby: "鴻福華廈的一樓管理室。一整面牆的信箱。",
    lliving: "林家的客廳。很乾淨，連拖鞋都排得很整齊。",
    lbalcony: "林家的陽台。一整排蘭花，看得出主人很用心。",
    lpark: "鴻福華廈的地下停車場。燈很暗，柱子上有編號。",
    jroom: "蔡佳穎的套房。很小，一張床就佔了一半。",
    sfront: "金鼎資產管理。招牌寫著「免保人、快速撥款」。",
    sback: "金鼎後面的小房間。一台冷凍櫃、一張麻將桌。",
    mstall: "新莊市場的豬肉攤。剁骨頭的聲音此起彼落。",
    pioffice: "鷹眼徵信社。牆上貼滿了別人的照片。",
    seven: "每日便利商店鴻福門市。門口叮咚一聲。",
    diner: "好食堡三重中正店。二十四小時都亮著燈。"
  };

  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#4a4038", bottom:"#3a3328", tie:"#5a2a2a", hat:"fedora", hatColor:"#3a3226" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const STAFF = { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", bottom:"#f4f6f6", hood:"#f4f6f6", mask:"#9ac0e0", gloves:"#4a8ad8" };
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", tie:"#1a2236" };

  EP3.world = {};
  EP3.locations.forEach(l => { EP3.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP3.world.warehouse, {
    // 第一天：現場有鑑識人員和員警（第二天以後就撤了）
    extras: [
      { id:"cop3", name:"員警", phase:0, until:0, x:RX(1) + 168, L:COP, pose:"stand", facing:-1, mood:"tired", lines:[
        "封鎖線裡面不要亂碰，鑑識還在採證。",
        "我是第一個到的。說真的，我差點吐出來。",
        "記者已經在外面了，不知道誰通知的。" ] },
      { id:"cam3", name:"鑑識人員", phase:0, until:0, x:RX(4) + 40, L:STAFF, pose:"hold", facing:1, mood:"tired", lines:[
        "照片我拍了三百多張了。桌上那九根，我一根一根編號。",
        "地上的血太多了，走路請踩踏板。",
        "牆上的字我們先不對外公布，這是分局長交代的。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { car:[-60, 8, 2.4, "#e9e4da"], hide:true },
      { wait:0.5, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "到了，宏昌倉儲。五股工業區最裡面這一排。", "小吳"),
      say("wu", "死者鄭國華，52 歲，會計師。今天早上 06:40 管理員巡倉時發現的。", "小吳"),
      say("wu", "先跟你說……裡面很難看。他被綁在椅子上，十根手指全被切斷了。", "小吳"),
      say("you", "十根？", "你"),
      say("wu", "九根排在桌上，一根不見了。牆上還用血寫了「欠債還錢」。分局長說，八成是地下錢莊。", "小吳"),
      say("you", "八成，就還有兩成。", "你"),
      say("wu", "這一案要查的資料會很多。銀行、電話、車牌，都要回分局申請調閱，隔天早上才拿得到。今天能申請的，今天就先申請。", "小吳"),
      say("wu", "問一題大概五分鐘，查一樣東西十分鐘，看監視器要看錄影長度。今天到晚上八點。", "小吳"),
      say("wu", "想去哪裡，就點畫面上的箭嘴。到了以後點「📍」，那裡有誰、有什麼可以查都會列出來。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，走近的時候會微微閃一下，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });
  // 金鼎：阿豹的 BMW 停在店門外
  Object.assign(EP3.world.shark, { spots:{ ev_bmw:[30, G - 26, 46, 24] },
    drawAfter: (p) => { p.OBJ.car(30, G - 20, "#1e1e22"); p.R(36, G - 22, 22, 2, "#3a3a3e"); } });

  // 區域地圖（240×135）：新莊、五股、三重、板橋，中間是淡水河和大漢溪
  EP3.mapPos = { warehouse:[36,40,"r"], police:[92,72,"l"], firm:[112,60,"u"], linhome:[84,92,"l"], seven:[70,104,"d"], market:[118,84,"r"],
    lab:[160,104,"r"], morgue:[192,116,"d"], vhome:[146,122,"l"], jia:[150,44,"u"], shark:[178,56,"r"], diner:[136,28,"u"], pi:[216,22,"l"] };
  EP3.mapRoads = [["warehouse","firm"],["firm","police"],["police","linhome"],["linhome","seven"],["police","market"],["market","lab"],["lab","morgue"],["lab","vhome"],
    ["firm","jia"],["jia","shark"],["jia","diner"],["diner","pi"],["shark","pi"]];
  EP3.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#8a9a86"); dither(0, 0, 240, 135, "#96a692", 3);
    // 城市街區
    const blocks = (x0, y0, x1, y1, c, c2) => { for (let x = x0; x < x1; x += 8) for (let y = y0; y < y1; y += 7) { R(x, y, 6, 5, c); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, c2); } };
    blocks(60, 50, 132, 112, "#c8c0b0", "#b0a898");   // 新莊
    blocks(122, 14, 200, 66, "#c0bab0", "#a8a298");   // 三重
    blocks(132, 96, 210, 135, "#c8c2b4", "#b0aa9c");  // 板橋
    blocks(196, 4, 240, 40, "#b8b4ae", "#a09c96");    // 台北
    // 五股工業區（大塊的灰色倉庫）
    for (let x = 10; x < 60; x += 14) for (let y = 24; y < 58; y += 11) R(x, y, 12, 8, "#9a9ea2");
    // 淡水河（從右上往左上）與大漢溪（從右下往中間）
    for (let y = 0; y < 135; y += 2) { const x = 186 - y * 0.25 + Math.sin(y / 12) * 4; if (y < 70) { R(x + Math.sin(t + y / 9) * 0.5, y, 7, 2, "#4a86b4"); R(x + 2, y, 2, 1, "#8ac0e0"); } }
    for (let x = 60; x < 190; x += 2) { const y = 72 + (x - 60) * 0.12 + Math.sin(x / 15) * 3; R(x, y + Math.sin(t + x / 9) * 0.5, 2, 5, "#4a86b4"); R(x, y + 1, 1, 2, "#8ac0e0"); }
    for (let y = 0; y < 50; y += 2) R(58 + Math.sin(y / 8) * 3, y, 5, 2, "#4a86b4");   // 五股的支流
  };
})();
