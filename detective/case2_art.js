/* =========================================================
   第 2 集：像素畫設定
   - LOOK：人物造型（byPhase 依天數改變）
   - DAILY：每個人每天在哪個房間、在做什麼
   - ROOMS：每個地點裡可以走進去的房間、可以點的地方、隱藏小細節
   - HOT：每件證物在房間畫面上的位置
   - ANIM：監視器／錄影畫面的動畫
   - COURT：最後眾人聚集時的對白
   座標都是 192×108 的畫布座標：[x, y, 寬, 高]
   ========================================================= */
EP2.art = true;
(() => {
  const LOOK = {
    tu:   { age:"old", skin:"#c99a6e", hair:"#e9e4da", hairStyle:"balding", top:"#6b5a3a", bottom:"#3a3328", hat:"douli", hello:"……警察先生，你問吧。" },
    ya:   { skin:"#f0c8a8", hair:"#2a1a14", hairStyle:"bob", top:"#8a2a3a", bottom:"#2a2228", skirt:true, blush:true, hello:"我已經很累了……你要問什麼？", byPhase:{ 3:{ top:"#1e1e22", bottom:"#1e1e22" } } },
    hao:  { skin:"#d8a880", hair:"#1a1410", hairStyle:"spiky", top:"#b8442e", bottom:"#3a4a6a", beard:true, hello:"又要問什麼？快一點。", byPhase:{ 2:{ bruise:true }, 3:{ top:"#1e1e22" } } },
    xin:  { skin:"#f2d2b8", hair:"#100c0c", hairStyle:"long", top:"#2e3a4e", bottom:"#1e2430", hello:"……", byPhase:{ 3:{ top:"#1e1e22", bottom:"#1e1e22" } } },
    ho:   { skin:"#e8bf98", hair:"#1a1a1a", hairStyle:"slick", top:"#e9e4da", coat:"#24324e", bottom:"#24324e", tie:"#a82a2a", glasses:true, hello:"警官，有什麼我能幫忙的？", byPhase:{ 3:{ tie:"#1e1e22" } } },
    pei:  { skin:"#f0c8a0", hair:"#5a3a22", hairStyle:"pony", top:"#e8c24a", bottom:"#4a5a3a", apron:"#3f7a4a", prop:"pot", hello:"警察先生……我、我知道的都會說。" },
    de:   { age:"old", skin:"#d0a078", hair:"#9a9a92", hairStyle:"short", top:"#e9e4da", coat:"#6a4a2a", bottom:"#3a3328", glasses:true, prop:"pot", hello:"你是為了我哥的事來的吧。", byPhase:{ 3:{ coat:"#1e1e22" } } },
    biao: { skin:"#c89068", hair:"#3a2a20", hairStyle:"bald", top:"#2a8a7a", bottom:"#1e1e22", sunglasses:true, chain:true, hello:"警察喔？坐啊，喝茶。" },
    wang: { skin:"#e8c09a", hair:"#6a6a6a", hairStyle:"short", top:"#e9e4da", coat:"#4a4e56", bottom:"#4a4e56", tie:"#2a3a6a", glasses:true, case:true, hello:"林先生的事，我能說的都會說。" },
    dr:   { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#7fb6d8", coat:"#f4f6f6", bottom:"#3a4a5a", stetho:true, glasses:true, hello:"請坐。你想知道林先生的什麼事？" },
    fang: { age:"old", skin:"#e0b890", hair:"#f1ece2", hairStyle:"bun", top:"#7a5a8a", bottom:"#4a3a4a", cane:true, hello:"你是……來問太太的事嗎？" },
    nurse:{ skin:"#f0c8a8", hair:"#8a3a2a", hairStyle:"bob", top:"#e88aa8", bottom:"#e88aa8", hat:"nurse", hello:"家欣出了什麼事嗎？" },
    wu:   { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", bottom:"#f4f6f6", hood:"#f4f6f6", mask:"#9ac0e0", gloves:"#4a8ad8", hello:"有需要驗的東西就交給我。" }
  };

  // 每個人每天在哪裡、在做什麼（陣列第幾個 ＝ 第幾天；只寫一個 ＝ 每天都一樣）
  const DAILY = {
    tu:  [ { room:"backyard", x:160, pose:"smoke", facing:-1, doing:"站在工寮門口抽菸，一直望著製茶房。" } ],
    ya:  [ { room:"living", x:128, pose:"cry", doing:"縮在沙發上，一直在哭。" },
           { room:"living", x:128, pose:"sit", doing:"坐在沙發上發呆，眼睛哭腫了。" },
           { room:"living", x:60, pose:"phone", doing:"一直撥家豪的手機，撥了又撥。" },
           { room:"living", x:104, pose:"kneel", facing:1, doing:"跪在靈堂前燒紙錢，手一直在抖。" },
           { room:"living", x:128, pose:"read", doing:"坐在沙發上整理奠儀，算了好幾遍。" },
           { room:"living", x:128, pose:"sit", doing:"坐在沙發上，看著靈堂發呆。" } ],
    hao: [ { room:"living", x:110, pose:"drink", doing:"坐在沙發另一頭，一罐接一罐地喝啤酒。" },
           { room:"pool", x:178, pose:"smoke", facing:-1, doing:"坐在池邊抽菸，褲管還是濕的。" },
           { x:96, pose:"cry", doing:"被關在後面的小房間，臉上有瘀青。" },
           { room:"living", x:172, pose:"cross", facing:-1, doing:"站在靈堂旁邊，臉上的瘀青還沒消。" },
           { room:"garage", x:60, pose:"phone", doing:"躲在車庫講電話，聲音壓得很低。" },
           { room:"yard", x:30, pose:"smoke", doing:"在中庭一根接一根地抽菸。" } ],
    xin: [ { room:"living", x:168, pose:"cross", facing:-1, doing:"雙手抱胸靠在樓梯邊，頭髮還沒全乾。" },
           { room:"living", x:168, pose:"sit", facing:-1, doing:"坐在樓梯上，袖子拉得長長的，一直看著窗外。" },
           { room:"backyard", x:100, pose:"stand", facing:-1, doing:"一個人站在製茶房門口，看著封鎖線。" },
           { room:"living", x:40, pose:"cross", doing:"穿著一身黑，站得離靈堂最遠。" },
           { room:"backyard", x:130, pose:"stand", facing:1, doing:"站在後院，看著上山的小路。" },
           { room:"living", x:30, pose:"cross", doing:"行李箱已經放在玄關，說告別式一結束就走。" } ],
    ho:  [ { room:"living", x:40, pose:"phone", doing:"站在門口講電話，壓低聲音說「颱風，路斷了」。" },
           { x:60, pose:"phone", doing:"一直在講電話，聽起來是在跟董事長報告。" },
           { x:60, pose:"cross", doing:"站在落地窗前，臉色很難看。" },
           { room:"yard", x:120, pose:"phone", facing:-1, doing:"在中庭講電話，一直看手錶。" },
           { x:60, pose:"read", doing:"在看一疊文件，看到你就收進抽屜。" },
           { x:60, pose:"phone", doing:"在講電話，語氣很不耐煩。" } ],
    pei: [ { room:"dining", x:90, pose:"broom", doing:"拿著掃把收拾地上的碎盤子。" },
           { room:"dining", x:90, pose:"hold", doing:"煮了一大鍋稀飯，可是沒有人吃。" },
           { room:"dining", x:90, pose:"stand", doing:"在擦桌子，一直偷偷看你。" },
           { room:"dining", x:90, pose:"hold", doing:"忙著幫來弔唁的人倒茶。" },
           { room:"dining", x:90, pose:"broom", doing:"在打掃餐廳，眼睛紅紅的。" },
           { room:"dining", x:90, pose:"hold", doing:"端著茶壺站著，好像有話想說。" } ],
    de:  [ null, { x:70, pose:"hold", doing:"在店裡泡茶，手停不下來。" },
           { x:70, pose:"hold", doing:"一個人在店裡泡茶。" },
           { room:"yard", x:30, pose:"smoke", doing:"在中庭抽菸，說他不想進去。" },
           { x:70, pose:"hold", doing:"在店裡泡茶，看到你就多拿了一個杯子。" } ],
    biao:  { x:140, pose:"smoke", facing:-1, doing:"翹著腳坐在櫃檯後面抽菸。" },
    wang:  { x:60, pose:"read", doing:"在整理林振宗的卷宗。" },
    dr:    { x:110, pose:"read", doing:"拿著病歷站在走廊上。" },
    fang:  { x:150, pose:"sit", facing:-1, doing:"坐在長椅上曬太陽。" },
    nurse: { x:40, pose:"hold", doing:"推著急救車在走廊上跑來跑去。" },
    wu:  [ { room:"tearoom", x:30, pose:"kneel", doing:"蹲在地上一寸一寸地採證。" }, { x:150, pose:"stand", doing:"在實驗室裡對著電腦打報告。" } ]
  };

  EP2.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id];
  });
  // 不是問話對象、但會出現在監視器裡的人
  EP2.looks = {
    zong: { age:"old", skin:"#d8a880", hair:"#c9c4b8", hairStyle:"short", top:"#e9e4da", coat:"#6a4a2a", bottom:"#3a3328", glasses:true },
    xin_wet: Object.assign({}, LOOK.xin, { wet:true }),
    hoodie: { skin:"#c9a080", hair:"#8a8e94", hairStyle:"short", top:"#8a8e94", bottom:"#2a2f3a", hood:"#8a8e94", back:true },
    xin_hood: Object.assign({}, LOOK.xin, { top:"#8a8e94", sleeve:"#8a8e94", hood:"#8a8e94", byPhase:undefined })
  };

  /* ---------- 房間 ---------- */
  const W = 192;
  EP2.rooms = {
    farm: [
      { id:"yard", name:"中庭", scene:"farm",
        go:[ { to:"living", hot:[66,30,78,44] }, { to:"tearoom", hot:[147,40,44,34] }, { to:"garage", hot:[2,44,42,30] } ],
        details:[
          { id:"d_cam", name:"屋簷下的監視器", hot:[66,35,12,8], text:"主屋屋簷下裝著一支監視器，鏡頭對著大門口和中庭。\n製茶房那一側，完全拍不到。" },
          { id:"d_sky", name:"雨", hot:[0,0,W,26], until:0, text:"雨大得睜不開眼。\n山下傳來轟隆一聲悶響，接著無線電裡有人喊：坍方了。" },
          { id:"d_tea", name:"茶樹", hot:[44,46,22,26], until:1, text:"一整排茶樹被風雨打得東倒西歪。\n這一季的冬茶，大概是沒了。" },
          { id:"d_tea2", name:"茶樹", hot:[44,46,22,26], phase:2, text:"被颱風打壞的茶樹，已經有人用竹子一棵一棵重新綁好了支架。綁法很老派，像是老師傅教出來的。" },
          { id:"d_car", name:"警車", hot:[50,76,44,24], until:1, text:"你和小吳開上來的警車。\n後座還放著小吳的鑑識箱，箱子上貼著一張「別碰！」的便利貼。" },
          { id:"d_lantern", name:"白燈籠", hot:[74,26,62,10], phase:3, text:"屋簷下掛起了白燈籠。\n門邊放著一頂舊斗笠，是有人特地從工寮拿過來的。" },
          { id:"d_chim", name:"製茶房的煙囪", hot:[170,36,8,10], until:0, text:"製茶房的煙囪摸起來還是溫的。" }
        ] },
      { id:"living", name:"主屋客廳", scene:"living",
        go:[ { to:"yard", hot:[6,22,22,48] }, { to:"xinroom", hot:[150,14,42,30] }, { to:"backhall", hot:[168,44,22,26] } ],
        details:[
          { id:"d_cam2", name:"客廳的監視器", hot:[36,2,12,8], text:"客廳角落的監視器，鏡頭對著大門、客廳和大樓梯。\n樓梯底下那條通往洗衣間的後走廊，剛好在鏡頭外。" },
          { id:"d_mj", name:"麻將桌", hot:[58,80,44,20], until:0, text:"麻將桌上的牌還沒收，是一副打到一半的牌局。\n何志明面前的籌碼最多。" },
          { id:"d_mj2", name:"麻將桌", hot:[58,80,44,20], phase:1, text:"麻將桌收起來了，桌腳下還壓著一張九萬。" },
          { id:"d_sofa", name:"沙發", hot:[106,52,46,18], until:1, text:"沙發旁倒著三個空啤酒罐，還有一瓶喝掉一半的高粱。" },
          { id:"d_win", name:"窗戶", hot:[114,16,30,22], until:2, text:"窗外是一片漆黑的茶園。\n從這扇窗看不到製茶房。" },
          { id:"d_altar", name:"靈堂", hot:[110,14,40,38], phase:3, text:"靈堂上並排放著兩張照片。\n土伯的照片是從員工旅遊的合照裡裁下來的，他還戴著斗笠，笑得很害羞。" },
          { id:"d_lamp", name:"吊燈", hot:[84,0,14,12], text:"吊燈上積了一層薄灰。\n佩如說，她來了以後才開始有人擦這盞燈。" }
        ] },
      { id:"dining", name:"餐廳", scene:"dining",
        details:[
          { id:"d_cake", name:"生日蛋糕", hot:[146,32,40,38], text:"櫃子上放著一個沒切的生日蛋糕，上面插著「65」的蠟燭。\n今天是林振宗的生日。" },
          { id:"d_shard", name:"碎盤子", hot:[36,78,40,24], until:0, text:"地上的碎盤子是青花瓷，碎片一直噴到門邊。\n掀桌的人，力氣不小。" },
          { id:"d_dwin", name:"窗戶", hot:[16,12,32,26], text:"從餐廳的窗戶看出去，看得到後院工寮的屋頂。" }
        ] },
      { id:"study", name:"書房", scene:"study", opt:(ph,has)=>({ pried: has("e_study") }),
        details:[
          { id:"d_shelf", name:"書架", hot:[128,4,60,42], text:"書架上全是茶葉比賽的獎狀和製茶的書。\n最下層有一本相簿，翻開來，秀蘭的照片只剩一張。" },
          { id:"d_swin", name:"窗戶", hot:[18,12,34,26], text:"窗戶外面就是上後山的小路，路邊的芒草被風吹得全倒向同一邊。" },
          { id:"d_pen", name:"筆筒", hot:[96,50,24,14], phase:2, requires:["e_study"], text:"桌上的筆筒倒了，原子筆滾了一地。\n撬抽屜的人很急，卻沒有碰桌上其他東西。" }
        ] },
      { id:"backhall", name:"後門・洗衣間", scene:"backhall",
        go:[ { to:"backyard", hot:[10,22,24,44] } ],
        details:[
          { id:"d_wash", name:"洗衣機", hot:[44,34,32,38], until:0, text:"洗衣機是空的，洗衣精的蓋子沒蓋好。" },
          { id:"d_wash2", name:"洗衣機", hot:[44,34,32,38], phase:1, text:"洗衣機上貼著佩如的字條：「深色衣物請分開洗，謝謝！」" },
          { id:"d_hlamp", name:"燈", hot:[72,0,16,14], text:"這裡的燈是感應式的，有人走過才會亮。\n亮起來的時候，客廳是看不到的。" }
        ] },
      { id:"backyard", name:"後院", scene:"backyard",
        go:[ { to:"backhall", hot:[28,48,16,26] }, { to:"tearoom", hot:[66,34,56,40] }, { to:"hut", hot:[140,46,46,28] }, { to:"pool", hot:[122,54,18,20] } ],
        details:[
          { id:"d_hutwin", name:"工寮的窗戶", hot:[146,54,14,12], text:"你站到工寮的窗戶前往外看：正對著製茶房的後門。\n不到十五公尺。" },
          { id:"d_steps", name:"二十步", hot:[42,60,24,14], text:"從主屋後門走到製茶房，你數了一下：二十步。" },
          { id:"d_mud", name:"泥地", hot:[0,76,W,32], until:1, text:"泥地上全是水窪。腳印一踩下去，馬上就被雨水填平了。" }
        ] },
      { id:"tearoom", name:"製茶房", scene:"tearoom", opt:(ph)=>({ hot: ph===0, night: ph===0, body: ph===0, ash: ph>=2 }),
        details:[
          { id:"d_bags", name:"閣樓的茶葉袋", hot:[42,8,18,14], text:"閣樓邊還放著幾袋茶葉，袋子上用毛筆寫著「冬片」。" },
          { id:"d_bulb", name:"燈泡", hot:[88,0,16,16], text:"燈泡上全是茶灰，光線黃黃的。\n站在燈下，連自己的影子都是茶色的。" },
          { id:"d_tape", name:"封鎖線", hot:[0,98,W,10], until:1, text:"黃色封鎖線。\n小吳說，這是他第一次在颱風天封現場。" }
        ] },
      { id:"hut", name:"土伯的工寮", scene:"hut",
        details:[
          { id:"d_ash", name:"菸灰缸", hot:[28,16,44,30], text:"窗台上有一個菸灰缸，裡面全是長壽菸的菸蒂。\n窗戶對著製茶房的後門。" },
          { id:"d_hat", name:"牆上的釘子", hot:[72,44,18,12], phase:1, text:"牆上的釘子空著，掛斗笠的地方留下一圈比較白的痕跡。" },
          { id:"d_pillow", name:"枕頭", hot:[96,48,24,12], phase:1, text:"枕頭底下壓著一張舊照片：年輕的土伯和林振宗勾著肩，站在剛種下去的茶樹前。" }
        ] },
      { id:"pool", name:"後山蓄水池", scene:"pool", opt:(ph,has)=>({ drained: has("ev_watch"), quiet: ph===0 }),
        details:[
          { id:"d_gate", name:"閘把上的紅布", hot:[144,48,20,34], text:"水門的閘把上綁著一條褪色的紅布條，看起來綁了很多年。" },
          { id:"d_wind", name:"山風", hot:[0,0,W,34], text:"山風很大。站在池邊，聽不到主屋那邊的任何聲音。" }
        ] },
      { id:"garage", name:"車庫", scene:"garage",
        details:[
          { id:"d_door", name:"鐵捲門", hot:[8,2,94,58], text:"鐵捲門被風一吹就哐哐作響。" },
          { id:"d_slip", name:"保養單", hot:[148,38,16,18], text:"牆上貼著一張保養單：「林家豪　里程 128,450」。下次保養日期是三個月前。" }
        ] },
      { id:"xinroom", name:"家欣的房間", scene:"xinroom", phase:2, requires:["n4","p16","lab_drawer","x18"],
        details:[
          { id:"d_bed", name:"床", hot:[78,48,64,26], text:"被子疊得像醫院的病床一樣整齊。" },
          { id:"d_xwin", name:"窗台", hot:[138,12,34,30], text:"窗台上沒有一點灰塵。照片旁邊放著一本德文會話課本，書頁裡夾滿了便利貼。" }
        ] }
    ],
    police: [ { id:"police", name:"南投分局", scene:"police", details:[
      { id:"d_board", name:"白板", hot:[118,10,54,32], text:"白板上貼著這個案子的照片，紅筆畫了好幾條線。最上面寫著：「10/22 晚上結案」。" },
      { id:"d_pwin", name:"窗戶", hot:[12,12,34,24], text:"窗外是分局的停車場。分局長的車今天停在最靠近門口的位置。" },
      { id:"d_cab", name:"檔案櫃", hot:[174,38,18,34], text:"檔案櫃最上層是十幾年前的舊卷宗，抽屜上貼著「已結」。" } ] } ],
    lab: [ { id:"lab", name:"南投鑑識中心", scene:"lab", details:[
      { id:"d_scope", name:"顯微鏡", hot:[28,42,20,22], text:"顯微鏡旁貼著一張小吳的字條：「誰再用我的載玻片當杯墊，我就驗誰的 DNA。」" },
      { id:"d_bottles", name:"試劑瓶", hot:[58,50,30,14], text:"一整排試劑瓶。其中一瓶寫著「魯米諾」。" } ] } ],
    office: [ { id:"office", name:"宏遠開發", scene:"office", details:[
      { id:"d_city", name:"落地窗", hot:[0,4,W,40], text:"落地窗外是台中市區。\n牆上貼著度假村的完工示意圖——蓋在一大片茶園上。" },
      { id:"d_plant", name:"盆栽", hot:[14,56,16,20], text:"盆栽的土是乾的，葉子掉了一半。" } ] } ],
    shop: [ { id:"shop", name:"振德茶行", scene:"shop", details:[
      { id:"d_cans", name:"茶罐", hot:[8,8,80,42], text:"架上的茶罐都貼著振德手寫的標籤。最貴的那一罐，叫做「秀蘭」。" },
      { id:"d_sign", name:"招牌", hot:[60,6,72,14], text:"招牌上寫著：「振德茶行　始於 1998」。" } ] } ],
    lawyer: [ { id:"lawyer", name:"王律師事務所", scene:"lawyer", details:[
      { id:"d_law", name:"書架", hot:[6,6,74,44], text:"書架上是一整排六法全書，還有好幾本《繼承實務》。" },
      { id:"d_lwin", name:"窗戶", hot:[108,12,46,32], text:"窗外正對著南投地方法院。" } ] } ],
    hospital: [ { id:"hospital", name:"腫瘤科", scene:"hospital", details:[
      { id:"d_lamp2", name:"叫號燈", hot:[18,38,18,36], text:"診間門口的叫號燈停在 47 號。走廊上很安靜。" },
      { id:"d_hsign", name:"指示牌", hot:[68,8,56,12], text:"「腫瘤科」。指示牌旁邊貼著安寧病房的介紹。" } ] } ],
    shark: [ { id:"shark", name:"宏發當鋪", scene:"shark", details:[
      { id:"d_neon", name:"招牌", hot:[40,4,110,22], text:"招牌上寫著「宏發當鋪　高價收購金飾」。\n「宏」字的燈管壞了一半。" },
      { id:"d_gold", name:"玻璃櫃", hot:[26,26,14,14], text:"玻璃櫃裡擺著幾支金錶，標價都很漂亮。" } ] } ],
    care: [ { id:"care", name:"慈恩安養院", scene:"care", details:[
      { id:"d_bench", name:"長椅", hot:[128,56,44,14], text:"這張長椅正對著山。淑芳阿姨說，天氣好的時候，看得到茶園的方向。" },
      { id:"d_plants", name:"花盆", hot:[112,54,12,16], text:"花盆裡種的是茶花。" } ] } ],
    taipei: [ { id:"taipei", name:"仁愛醫院急診室", scene:"taipei", details:[
      { id:"d_notice", name:"公告欄", hot:[8,28,44,34], text:"公告欄上貼著：「本月耗材管控，領用請確實登記。」" },
      { id:"d_chairs", name:"候診椅", hot:[68,56,54,20], text:"候診椅上睡著一個值完大夜班的實習醫生。" } ] } ]
  };

  /* ---------- 證物的位置、證物畫面 ---------- */
  const HOT = {
    cctv_living:["living",[88,34,20,22]], cctv_gate:["living",[88,34,20,22]],
    ev_raincoat:["living",[30,26,40,40]], ev_receipt:["living",[74,44,18,12]],
    ev_dining:["dining",[56,58,70,40]],
    ev_hospital:["study",[66,46,26,20]], ev_letter:["study",[46,64,38,16]], ev_drawer:["study",[44,56,60,24]],
    ev_backdoor:["backhall",[8,66,30,14]], ev_laundry:["backhall",[78,44,30,28]], ev_backstair:["backhall",[114,20,78,86]],
    ev_ladder:["tearoom",[56,14,14,58]], ev_dryer:["tearoom",[74,44,32,26]], ev_dryerlog:["tearoom",[74,44,32,26]],
    ev_tools:["tearoom",[126,30,34,42]], ev_luminol:["tearoom",[126,30,34,42]], ev_window2:["tearoom",[166,22,22,22]],
    ev_hair:["tearoom",[102,74,18,10]], ev_body:["tearoom",[48,80,28,14]], ev_ashes:["tearoom",[6,40,44,32]],
    ev_tuhut:["hut",[18,58,56,22]], ev_note:["hut",[144,50,20,14]],
    ev_pool:["pool",[16,56,126,44]], ev_watch:["pool",[16,56,126,44]],
    ev_garage:["garage",[16,46,140,52]], ev_xinroom:["xinroom",[24,46,130,32]],
    pol_old:["police",[56,58,18,14]], pol_road:["police",[28,50,28,22]], ev_petition:["police",[114,54,22,18]],
    ev_video:["office",[114,50,32,24]], ev_contract:["office",[146,56,22,16]],
    ev_dashcam:["shop",[146,48,46,28]], ev_photo:["shop",[88,20,24,24]],
    ev_will:["lawyer",[116,56,22,16]], ev_insurance:["lawyer",[138,58,18,14]],
    ev_chart:["hospital",[150,48,32,20]], ev_iou:["shark",[56,36,20,12]], ev_recording:["shark",[114,34,18,12]],
    ev_visitlog:["care",[72,54,22,16]], ev_leave:["taipei",[66,48,56,18]], ev_glovelog:["taipei",[146,20,36,46]]
  };
  const SC = {
    cctv_living:["monitor"], cctv_gate:["monitor"],
    ev_ladder:["tearoom",{staff:[[160,-1,"cam"]]}], ev_dryer:["tearoom",{staff:[[118,1,"kneel"]]}], ev_tools:["tearoom",{staff:[[160,-1,"cam"]]}],
    ev_hair:["tearoom",{staff:[[96,1,"kneel"]]}], ev_window2:["tearoomWindow"],
    ev_body:["body"], ev_dining:["dining"], ev_backdoor:["backdoor",{staff:[[60,1,"cam"]]}],
    ev_dryerlog:["tearoom",{hot:false,night:false}], ev_luminol:["tearoom",{lumi:true,hot:false,staff:[[164,-1,"cam"]]}],
    ev_pool:["pool",{staff:[[40,1,"kneel"],[176,-1,"cam"]]}], ev_watch:["pool",{drained:true,staff:[[90,-1,"kneel"]]}],
    ev_raincoat:["rack"], ev_laundry:["laundry"], ev_backstair:["stairs"],
    ev_note:["doc"], ev_hospital:["doc",{stamp:true}], ev_letter:["doc",{photo:true}], ev_garage:["garage"], ev_tuhut:["hut"],
    ev_xinroom:["xinroom"], ev_drawer:["study",{pried:true}], ev_ashes:["stove"], ev_receipt:["receipt"],
    pol_old:["doc",{stamp:true,photo:true}], pol_road:["road"], ev_petition:["doc"],
    ev_video:["guestroom"], ev_contract:["doc",{stamp:true}], ev_dashcam:["dashcam"], ev_photo:["photo"],
    ev_will:["doc",{stamp:true}], ev_insurance:["doc",{stamp:true}], ev_chart:["doc"], ev_iou:["doc",{stamp:true}],
    ev_recording:["audio"], ev_visitlog:["doc"], ev_leave:["doc",{stamp:true}], ev_glovelog:["doc"]
  };

  /* ---------- 監視器、錄影的動畫（內容和證物文字一致，不多給線索） ---------- */
  const ANIM = {
    cctv_living: { scene:"living", opt:{ phase:0 }, cam:"CAM1 客廳", date:"2026-10-17", beats:[
      { t:"20:16:00", d:3, cap:"林振宗穿過客廳，往後走廊（製茶房方向）走去。", m:{ zong:[180,90,null,1,50,100] }, out:["zong"] },
      { t:"20:20:00", d:3, cap:"家豪坐到沙發上開始喝酒。雅琴、佩如端著碗盤進廚房。", m:{ hao:[122,94,"drink",1,40,100], ya:[-12,100,"hold",-1,96,100], pei:[-12,104,"hold",-1,104,104] }, out:["ya","pei"] },
      { t:"20:21:00", d:3, cap:"林振德拿著外套走出大門，跟沙發上的家豪揮了揮手。", m:{ de:[17,72,"point",-1,80,100] }, out:["de"] },
      { t:"20:22:00", d:3, cap:"林家欣從大樓梯走上二樓。", m:{ xin:[194,22,null,1,100,102,[[160,72]]] }, out:["xin"] },
      { t:"20:38:00", d:2, cap:"張佩如端著茶壺從大門出去。", m:{ pei:[17,72,"hold",-1,-12,100] }, out:["pei"] },
      { t:"20:44:00", d:2, cap:"張佩如回來了。", m:{ pei:[-12,100,"hold",-1,17,72] }, out:["pei"] },
      { t:"20:56:00", d:2, cap:"何志明從大門進來。", m:{ ho:[54,98,null,1,17,72] } },
      { t:"20:58:00", d:3, cap:"林家欣從大樓梯下來，頭髮是濕的。", m:{ xin_wet:[100,100,null,-1,194,22,[[160,72]]] } },
      { t:"21:00:00", d:3, cap:"雅琴、家欣、何志明、佩如開始打麻將。", m:{ ya:[54,96,"sit",1,-12,100], xin_wet:[104,96,"sit",-1], ho:[70,106,"sit",1], pei:[90,106,"sit",-1,-12,106] } },
      { t:"21:10:00", d:2.5, cap:"林家豪走出客廳，往車庫方向。", m:{ hao:[17,72,null,-1] }, out:["hao"] },
      { t:"21:46:00", d:2.5, cap:"林家豪回到客廳。", m:{ hao:[122,94,"drink",1,17,72] } },
      { t:"22:05:00", d:2.5, cap:"麻將散場。", m:{ ya:[134,98,"stand",-1], xin_wet:[164,98,"cross",-1], ho:[44,100,"phone",1], pei:[90,102,"stand",1] } },
      { t:"22:12:00", d:3.5, cap:"土伯衝進客廳大叫。", m:{ tu:[60,98,"point",1,17,72], ya:[134,98,"cry",-1], hao:[122,94,"stand",-1], xin_wet:[164,98,"stand",-1], ho:[44,100,"stand",1], pei:[90,102,"stand",-1] } }
    ] },
    cctv_gate: { scene:"courtyard", cam:"CAM2 大門", date:"2026-10-17", beats:[
      { t:"20:21:00", d:3, cap:"何志明走進中庭旁的客房。", m:{ ho:[156,74,null,1,-12,92] }, out:["ho"] },
      { t:"20:25:00", d:3, cap:"林振德的車在中庭倒車迴轉。", cars:{ de:[70,30,"#7a8a6a"] } },
      { t:"20:26:00", d:2.5, cap:"林振德的車駛出大門。", cars:{ de:[220] }, out:["de"] },
      { t:"20:39:00", d:2.5, cap:"張佩如端著茶壺走進客房。", m:{ pei:[156,74,"hold",1,37,74,[[96,92]]] }, out:["pei"] },
      { t:"20:43:00", d:2.5, cap:"張佩如走出客房。", m:{ pei:[37,74,"hold",-1,156,74,[[96,92]]] }, out:["pei"] },
      { t:"20:55:00", d:3, cap:"何志明走出客房，往主屋走去。", m:{ ho:[37,74,null,-1,156,74,[[96,92]]] }, out:["ho"] },
      { t:"21:30:00", d:2, speed:600, cap:"……沒有任何車輛或人從大門進出。" },
      { t:"23:20:00", d:3, cap:"警車抵達（你和小吳）。", cars:{ police:[70,240,"#e9e4da"] } }
    ] },
    pol_road: { scene:"road", cam:"測速照相 山路口", date:"2026-10-17", beats:[
      { t:"20:41:00", d:3, cap:"下山：林振德的車。", cars:{ de:[-60,200,"#7a8a6a"] }, out:["de"] },
      { t:"21:30:00", d:2, speed:900, cap:"……沒有其他車輛。" },
      { t:"23:10:00", d:3, cap:"上山：警車（你和小吳）。", cars:{ police:[200,-60,"#e9e4da"] } }
    ] },
    ev_video: { scene:"guestroom", cam:"視訊會議錄影", date:"2026-10-17", s:1.6, beats:[
      { t:"20:22:00", d:3, cap:"何志明在客房裡和台北的董事長開視訊會議。", m:{ ho:[96,104,"sit",1] } },
      { t:"20:40:00", d:3, cap:"有人敲門進來倒茶。是張佩如，她還對鏡頭點頭打招呼。", m:{ pei:[140,100,"hold",-1,220,100] } },
      { t:"20:43:00", d:2.5, cap:"張佩如離開。", m:{ pei:[220,100,null,1] }, out:["pei"] },
      { t:"20:52:00", d:2.5, cap:"會議結束。何志明全程都在畫面裡。", m:{ ho:[96,104,"stand",1] } }
    ] },
    ev_dashcam: { scene:"dashcam", opt:{ anim:true }, cam:"行車記錄器", date:"2026-10-17", beats:[
      { t:"20:25:10", d:4, cap:"車子在中庭倒車迴轉，車燈掃過主屋側面通往製茶房的小路。畫面裡有一個穿灰色帽T的人，背對鏡頭往製茶房走。", m:{ hoodie:[176,92,null,1,126,96] } },
      { t:"20:26:00", d:2, cap:"車子駛出大門。", out:["hoodie"] },
      { t:"20:41:00", d:2, cap:"經過山路口。" }
    ] },
    ev_recording: { scene:"audio", clean:true, cam:"通話錄音", date:"2026-10-17", beats:[
      { t:"21:12:00", d:3, cap:"（電話接通。背景是很大的風雨聲。）" },
      { t:"21:20:00", d:3.5, cap:"（車庫鐵門被風吹得哐哐響。家豪一直在求情。）" },
      { t:"21:30:00", d:5, cap:"家豪：「我爸剛剛在飯桌上說要把茶園捐掉，我現在真的沒辦法……」" },
      { t:"21:39:00", d:2, cap:"（通話結束。）" }
    ] }
  };
  [...EP2.cctv, ...EP2.evidence].forEach(it => {
    const v = SC[it.id]; if (v){ it.scene = v[0]; if (v[1]) it.sceneOpt = v[1]; }
    const h = HOT[it.id]; if (h){ it.room = h[0]; it.hot = h[1]; }
    if (ANIM[it.id]) it.anim = ANIM[it.id];
  });

  const PS = [["farm",{phase:0}],["pool",{}],["farm",{phase:2}],["farm",{phase:3}],["police",{}],["farm",{phase:2}]];
  EP2.phases.forEach((p,i) => { p.scene = PS[i][0]; p.sceneOpt = PS[i][1]; });

  /* ---------- 最後：所有人回到茶園客廳 ---------- */
  EP2.court = {
    title: "茶園客廳", scene: "living",
    who: ph => ph===0 ? ["tu","ya","hao","xin","ho","pei"] : ["ya","hao","xin","ho","pei","de"],
    open: ph => ph===0 ? "你請所有人到客廳集合。外面的風雨聲大得嚇人，今晚誰都離不開這座山。"
      : ph>=3 ? "你請所有人回到茶園的客廳。靈堂的香還在燒，外面又下起了小雨。"
      : "你請所有人回到茶園的客廳。大家坐得離彼此遠遠的，沒有人說話。",
    kindLine: {
      accident: "我的結論是——這是一場意外。林振宗爬梯子拿茶葉時，摔了下來。",
      murder: "我的結論是——林振宗不是意外死亡。他是被人殺死的。",
      suicide: "我的結論是——林振宗知道自己癌症末期，是他自己尋死的。"
    },
    murmur: [ "（客廳裡一陣騷動。雅琴緊緊抓住家豪的手臂。）", "（何志明清了清喉嚨，轉頭看向窗外。）", "（佩如手裡的茶壺抖了一下，茶灑在地上。）" ],
    confess: { xin: [
      "……那封信，我在急診室的休息室讀了一整夜。",
      "媽媽在水裡喊他的名字，他就站在那裡。土伯幫他瞞了十二年。",
      "我本來只想聽他親口說一次對不起。……是我做的。"
    ] },
    cornered: { xin: "……你說完了嗎？我還要趕飛機。" },
    deny: {
      ya: "你、你說什麼？那天晚上我一直在打麻將，大家都看到了！",
      hao: "我是欠了錢，但我再爛，也不會殺我爸！",
      xin: "……你有證據嗎？",
      ho: "警官，這種指控，我會請律師處理。",
      pei: "不是我……我真的什麼都沒做……",
      de: "我恨我哥，這我承認。可是那天晚上，我早就下山了。",
      intruder: "（沒有人回答。客廳裡只聽得到雨聲。）"
    },
    replayText: "10 月 17 日晚上八點多，製茶房裡到底發生了什麼事——",
    replay: { scene:"tearoom", opt:{ replay:true, body:false, night:true, hot:false }, clean:true, cam:"案發經過重現", date:"2026-10-17", beats:[
      { t:"20:16:00", d:3, cap:"林振宗照例到製茶房看焙茶。", m:{ zong:[110,96,"stand",-1,200,96] } },
      { t:"20:26:00", d:3, cap:"家欣換上灰色帽T，從後門進了製茶房。", m:{ xin_hood:[156,96,null,-1,200,96] } },
      { t:"20:30:00", d:3.5, cap:"兩人在工具架旁爭吵。", m:{ zong:[126,96,"point",1], xin_hood:[152,96,"point",-1] } },
      { t:"20:33:00", d:4, cap:"她抓起架上的銅秤錘，打中父親的後腦。", m:{ xin_hood:[140,96,"point",-1], zong:[126,96,["stand","kneel","fall","lie"],-1] } },
      { t:"20:40:00", d:4, cap:"她擦掉秤錘上的血，把屍體拖到木梯下，推倒閣樓邊的茶葉袋。", m:{ zong:[70,100,"lie",-1], xin_hood:[88,96,"hold",-1] } },
      { t:"20:47:00", d:3, cap:"她把焙茶機從 60 度調到 110 度，讓熱風對著屍體吹。", m:{ xin_hood:[96,96,"point",-1] } },
      { t:"20:50:00", d:3, cap:"然後從後門離開。那一刻，土伯正從工寮的窗戶看著製茶房。", m:{ xin_hood:[200,96,null,1] }, out:["xin_hood"] }
    ] },
    endGood: "小吳替家欣戴上手銬。她經過靈堂時停了一下，對著兩張照片深深鞠了一躬。\n十二年前那個颱風夜的真相，終於說出口了。",
    endBad: "沒有人說話。窗外的雨越下越大。\n你總覺得，有人悄悄鬆了一口氣。"
  };
})();
