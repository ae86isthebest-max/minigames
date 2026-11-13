/* =========================================================
   第 4 集：走動畫面、地圖、開場
   每個地點都用 worldkit 的 autoWorld：房間排成一整排剖面建築
   ========================================================= */
(() => {
  const G = 124, RX = i => 116 + i * 198;   // autoWorld：第 i 個房間的左邊 x
  EP4.outScenes = [];
  EP4.fac = {
    hotel:["#d8d0c0","#c9a24a"], police:["#cfcabb","#3f5a7a"], lab:["#e2e8e8","#3a7a8a"], auction:["#2a2a2a","#c9a24a"],
    yehome:["#e8dcc8","#6a4a2a"], haoapt:["#b8c0c8","#3a4a5a"], qiu:["#b8b0a0","#3a6a4a"], ice:["#9aa0a6","#2a6ab8"],
    suhome:["#d8c8c0","#6a4a5a"], market:["#8a8a82","#c23a2a"]
  };
  EP4.setting = { hotel:"city", police:"city", lab:"city", auction:"city", yehome:"villa", haoapt:"city", qiu:"town", ice:"town", suhome:"city", market:"city" };
  // 三月的台北：[上, 下, 遠景, 近景, 雨, 夜晚]
  const SKY4 = [
    ["#0b0f1c","#27324a","#18202a","#1d2630",0,1],
    ["#7a96b4","#c8d8e4","#4a5a6a","#56666c",0,0],
    ["#8ab0d0","#e0e8ee","#4a6070","#56707a",0,0]
  ];
  EP4.worldSky = ph => SKY4[Math.min(ph || 0, SKY4.length - 1)];

  EP4.roomDesc = {
    hlobby: "雲頂酒店的大廳。凌晨也亮得像白天。",
    hsec: "保全室。四十八個螢幕，空氣裡都是泡麵的味道。",
    hdock: "地下二樓的卸貨區。冷得要命，到處是推車和紙箱。",
    hsvc: "31 樓的員工備餐間。客人看不到的地方，洗碗機轟轟地響。",
    hcorr: "32 樓的走廊。地毯厚得踩不出聲音。",
    hsuite: "總統套房 3202。展示櫃就在客廳最裡面。",
    hpantry: "套房裡的小備餐間。外燴在這裡準備香檳和點心。",
    hpei: "隔壁的 3201。林佩珊住在這裡。",
    pdesk: "大安分局刑事組。桌上堆著昨晚的報案單。",
    pinterview: "偵訊室。江明哲坐在裡面。",
    lab: "台北市刑大鑑識中心。許知夏的地盤。",
    afront: "瀚古拍賣的展廳。今晚的拍品都在這裡。",
    aoffice: "瀚古的辦公室。電話一直響。",
    aarchive: "瀚古的資料室。每一件拍品都有一個檔案夾。",
    yliving: "葉家天母老房子的客廳。神明桌上供著葉老先生的照片。",
    ystudy: "葉父的書房。保險櫃就在牆角。",
    hapt: "葉承浩的公寓。窗簾拉著，一屋子酒味。",
    qshop: "邱師傅的玉雕工作室。磨玉的聲音吱吱響。",
    iyard: "極凍乾冰的倉庫。地上一直冒著白煙。",
    sroom: "蘇曼文的家。很小，很整齊。",
    mstall: "建國高架橋下的假日玉市。人擠人。"
  };

  const YOU = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#e9e4da", coat:"#4a4038", bottom:"#3a3328", tie:"#5a2a2a", hat:"fedora", hatColor:"#3a3226" };
  const say = (who, text, name) => ({ say:[who, text], name });
  const COP = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#3a5a8a", bottom:"#24324e", hat:"police", tie:"#1a2236" };
  const GUARD = { skin:"#d8a880", hair:"#1a1410", hairStyle:"short", top:"#2a2f3a", bottom:"#2a2f3a", tie:"#1e1e22" };

  EP4.world = {};
  EP4.locations.forEach(l => { EP4.world[l.id] = { auto:true, you:YOU }; });
  Object.assign(EP4.world.hotel, {
    extras: [
      { id:"guo", name:"保全小郭", phase:0, until:0, x:RX(1) + 160, L:GUARD, pose:"stand", facing:-1, mood:"tired", lines:[
        "我巡完 32 樓是 23:30，那時候一切正常，套房門是關的。",
        "警報響的時候我在 28 樓，跑上來花了兩分鐘。",
        "蘇小姐的包包是我檢查的。很小一個，裝不下什麼。" ] },
      { id:"cop4", name:"員警", phase:0, until:0, x:RX(4) + 60, L:COP, pose:"stand", facing:1, mood:"tired", lines:[
        "封鎖線裡面只有鑑識可以進去。",
        "分局長說八成是那個管家。我覺得他不像。" ] }
    ],
    intro: [
      { set:{ px:-60, bx:-80, cam:0 }, hide:true },
      { car:[-60, 8, 2.4, "#e9e4da"], hide:true },
      { wait:0.5, hide:true },
      { set:{ px:70, bx:50, face:1 } },
      say("wu", "到了，雲頂酒店。凌晨三點五十，記者居然比我們還早到。", "小吳"),
      say("wu", "32 樓的總統套房，拍賣預展。一件清代的翠玉貔貅，估價一億多，03:12 展示櫃的警報響了，東西不見了。", "小吳"),
      say("wu", "鎖沒壞，玻璃沒破。保全把一個半夜進過套房的管家扣在保全室。分局長說，八成是他。", "小吳"),
      say("you", "八成，就還有兩成。", "你"),
      say("wu", "……我就知道你會這樣說。台北刑大的鑑識已經在樓上了，聽說很兇。", "小吳"),
      say("wu", "凌晨只能在酒店裡查。天亮以後可以到處跑，分局也可以申請調閱銀行和通聯，隔天早上才拿得到。星期六晚上 7 點就是拍賣會。", "小吳"),
      say("wu", "問一題五分鐘，查一樣東西十分鐘。想去哪裡，就點畫面上的箭嘴。到了以後點" + (typeof pinWhere === "function" ? pinWhere() : "左上角") + "的「📍」，那裡有誰、有什麼可以查都會列出來。要找我就點我。", "小吳"),
      say("wu", "還有，清單不是全部。畫面上還藏著小細節，要自己到處走、到處點才找得到，看那些不花時間。", "小吳")
    ]
  });

  // 區域地圖（240×135）：信義、大安、天母、內湖、萬華、中和、五股
  EP4.mapPos = { hotel:[150,72,"r"], auction:[164,60,"u"], police:[122,84,"d"], lab:[108,70,"l"], market:[112,96,"d"], yehome:[110,16,"u"],
    haoapt:[190,34,"r"], qiu:[70,82,"l"], suhome:[86,120,"l"], ice:[22,40,"r"] };
  EP4.mapRoads = [["hotel","auction"],["hotel","police"],["police","lab"],["police","market"],["lab","qiu"],["lab","yehome"],["auction","haoapt"],
    ["market","suhome"],["qiu","ice"],["qiu","suhome"]];
  EP4.mapDraw = (p, t) => {
    const { R, dither } = p;
    R(0, 0, 240, 135, "#8a9a86"); dither(0, 0, 240, 135, "#96a692", 3);
    const blocks = (x0, y0, x1, y1, c, c2) => { for (let x = x0; x < x1; x += 8) for (let y = y0; y < y1; y += 7) { R(x, y, 6, 5, c); if ((x + y) % 3 === 0) R(x + 1, y + 1, 2, 2, c2); } };
    blocks(60, 50, 200, 110, "#c8c0b0", "#b0a898");   // 台北市區
    blocks(80, 4, 140, 30, "#c8c4b4", "#b0aa9c");     // 天母
    blocks(170, 20, 236, 50, "#c0bab0", "#a8a298");   // 內湖
    blocks(60, 112, 120, 135, "#c8c2b4", "#b0aa9c");  // 中和
    for (let x = 4; x < 44; x += 12) for (let y = 26; y < 56; y += 10) R(x, y, 10, 7, "#9a9ea2");   // 五股工業區
    // 101
    R(146, 40, 6, 28, "#5a7a8a"); R(147, 34, 4, 6, "#6a8a9a"); R(148, 28, 2, 6, "#8aa0b0"); P(148, 27, "#ff4a3a");
    // 淡水河、基隆河
    for (let y = 0; y < 135; y += 2){ const x = 52 + Math.sin(y / 14) * 6; R(x + Math.sin(t + y / 9) * 0.5, y, 7, 2, "#4a86b4"); R(x + 2, y, 2, 1, "#8ac0e0"); }
    for (let x = 58; x < 240; x += 2){ const y = 40 - (x - 58) * 0.06 + Math.sin(x / 13) * 4; R(x, y + Math.sin(t + x / 9) * 0.5, 2, 5, "#4a86b4"); R(x, y + 1, 1, 2, "#8ac0e0"); }
  };
})();
