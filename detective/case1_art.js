/* =========================================================
   第 1 集：半山別墅之夜（像素畫設定）
   - 人物造型、每個人在哪個房間做什麼
   - 房間、可點的地方、隱藏小細節
   - 五支監視器的動畫、最後眾人聚集與案發經過重現
   這集沒有「地點」，整棟別墅就是一個現場（房間清單放在 rooms._）
   座標都是 192×108 的畫布座標：[x, y, 寬, 高]
   ========================================================= */
(() => {
  const EP1 = CASES.find(c => c.id !== "tea" && !c.locations);
  if (!EP1) return;
  EP1.art = true;
  const LOOK = {
    wong: { age:"old", skin:"#e0b890", hair:"#e9e4da", hairStyle:"short", top:"#f4f6f6", coat:"#1e1e22", bottom:"#1e1e22", tie:"#1e1e22", prop:"#d8eef6", hello:"警官，請問。我知道的都會說。" },
    lam:  { skin:"#f2d2b8", hair:"#5a3a22", hairStyle:"bob", top:"#7a4a8a", bottom:"#3a2a3a", skirt:true, hello:"……你想問什麼？我很累了。" },
    ho:   { skin:"#e8c09a", hair:"#1a1410", hairStyle:"spiky", top:"#3a6a5a", bottom:"#3a4a6a", glasses:true, hello:"又是我？我什麼都不知道啊。" },
    chow: { skin:"#f0c8a8", hair:"#100c0c", hairStyle:"pony", top:"#f4f6f6", coat:"#c9b8a0", bottom:"#2a2a30", skirt:true, hello:"我會配合調查。請問吧。" }
  };
  const DAILY = {
    wong: { room:"kitchen", x:100, pose:"hold", doing:"在廚房把杯子一個一個擦乾，擦了又擦。" },
    lam:  { room:"hall", x:122, pose:"sit+phone", doing:"坐在沙發上，一直低頭看手機。" },
    ho:   { room:"hall", x:168, pose:"cross", facing:-1, doing:"靠在樓梯扶手上，腳一直抖。" },
    chow: { room:"hall", x:42, pose:"stand", doing:"被警方叫回來，外套都還沒脫。" }
  };
  EP1.suspects.forEach(s => {
    if (LOOK[s.id]){ s.hello = LOOK[s.id].hello; const L = Object.assign({}, LOOK[s.id]); delete L.hello; s.look = L; }
    if (DAILY[s.id]) s.daily = DAILY[s.id];
  });
  EP1.looks = {
    chen:   { age:"old", skin:"#e0b48c", hair:"#9a9a92", hairStyle:"slick", top:"#f4f6f6", coat:"#5a2a1a", bottom:"#2a2a30", glasses:true },
    ho_b:   Object.assign({}, LOOK.ho, { prop:"#c9d4dc" }),
    kevin:  { skin:"#d8a880", hair:"#2a2a2a", hairStyle:"short", top:"#4a5a6a", bottom:"#2a2f3a", hat:"cap", capColor:"#2a2a2a" },
    masked: Object.assign({}, LOOK.chow, { top:"#1e1e22", coat:"#1e1e22", mask:"#e9e4da", hairStyle:"short", hair:"#1e1e22" }),
    chowb:  Object.assign({}, LOOK.chow, { top:"#1e1e22", coat:"#1e1e22" })
  };

  const W = 192;
  EP1.rooms = { _: [
    { id:"hall", name:"客廳", scene:"vhall",
      details:[
        { id:"v_photo", name:"全家福", hot:[40,12,30,24], text:"牆上掛著一張全家福：陳先生、陳太太，還有站在旁邊、笑得最開心的陳浩。" },
        { id:"v_clock", name:"落地鐘", hot:[74,28,14,42], text:"落地鐘的指針走得很準。整點報時的聲音大得嚇人。" },
        { id:"v_lamp", name:"水晶吊燈", hot:[96,0,26,18], text:"水晶吊燈少了兩顆水晶，一直沒有補上。" },
        { id:"v_cam", name:"大門的監視器", hot:[28,6,10,8], text:"大門旁的監視器亮著紅燈。這棟別墅一共裝了好幾支監視器，畫面都接到保全室。" }
      ] },
    { id:"study", name:"書房（命案現場）", scene:"vstudy",
      details:[
        { id:"v_shelf", name:"書架", hot:[2,4,46,64], text:"書架上大多是建築雜誌，最上層排著一整排高爾夫球獎盃。" },
        { id:"v_keypad", name:"密碼鎖", hot:[70,38,8,10], text:"書房門上裝著密碼鎖。按鍵上有幾個數字，磨得特別亮。" },
        { id:"v_plan", name:"設計圖", hot:[84,14,40,26], text:"牆上掛著這棟別墅的設計圖，右下角是陳啟明的親筆簽名。" },
        { id:"v_keys", name:"電腦鍵盤", hot:[102,60,20,7], text:"電腦鍵盤乾乾淨淨，幾乎沒有用過的痕跡。\n筆筒裡倒是插滿了鋼筆。" },
        { id:"v_rug", name:"地毯", hot:[60,88,40,14], text:"地毯上有一圈淡淡的水漬，像是有什麼東西放在這裡滴過水。" },
        { id:"v_lamp2", name:"檯燈", hot:[124,38,18,8], text:"檯燈還亮著，燈下有一本翻開的老花眼鏡盒。" }
      ] },
    { id:"kitchen", name:"廚房", scene:"vkitchen",
      details:[
        { id:"v_bucket", name:"冰桶", hot:[40,38,16,12], text:"冰桶倒扣在水槽邊，內側還掛著水珠。" },
        { id:"v_knife", name:"刀架", hot:[68,4,14,34], text:"刀架上的刀一把也不少，都擦得發亮。" },
        { id:"v_fridge", name:"冰箱", hot:[128,6,44,60], text:"冰箱的製冰盒是空的。" },
        { id:"v_wine", name:"酒櫃", hot:[174,18,18,50], text:"酒櫃裡有一整排同一個牌子的威士忌。中間空著一格。" }
      ] },
    { id:"garden", name:"後花園", scene:"vgarden", opt:{ lit:true },
      details:[
        { id:"v_bed", name:"花圃", hot:[18,56,48,18], text:"後花園的花圃剛澆過水，泥土又濕又軟。旁邊放著一個澆花壺。" },
        { id:"v_gate", name:"側門", hot:[148,28,34,46], text:"側門沒有上鎖。門軸剛上過油，推起來一點聲音也沒有。" },
        { id:"v_bench", name:"長椅", hot:[94,76,44,18], text:"長椅上有兩個並排的濕印子，有人在這裡坐過。\n長椅下有一根外國牌子的菸蒂。" },
        { id:"v_upwin", name:"亮著的窗戶", hot:[118,28,26,22], text:"另一扇窗戶也亮著燈，窗簾拉得緊緊的。" }
      ] },
    { id:"security", name:"保全室", scene:"vsecurity",
      details:[
        { id:"v_snow", name:"壞掉的螢幕", hot:[92,38,36,26], text:"這一台螢幕壞了，只有雪花。" },
        { id:"v_log", name:"值班紀錄本", hot:[38,60,26,10], text:"值班紀錄本上，最後一行是黃伯工整的字：「21:00 巡視完畢，一切正常。」" }
      ] }
  ] };

  const HOT = {
    cctv_kitchen:["security",[16,10,36,26]], cctv_garden:["security",[54,10,36,26]], cctv_gate:["security",[92,10,36,26]],
    cctv_back:["security",[16,38,36,26]], cctv_hall:["security",[54,38,36,26]],
    ev_glass:["study",[118,50,14,16]], ev_ledger:["study",[80,58,18,10]], ev_printer:["study",[146,44,26,26]],
    ev_note:["study",[172,48,16,14]], ev_window:["study",[146,6,42,38]],
    ev_phone:["hall",[96,74,14,10]], ev_lab:["hall",[114,70,22,14]]
  };
  const SC = {
    ev_note:["doc"], ev_glass:["vstudy",{ staff:[[150,-1,"cam"]] }], ev_printer:["vstudy",{ staff:[[166,-1,"kneel"]] }],
    ev_ledger:["doc",{stamp:true}], ev_phone:["chat"], ev_window:["vstudy",{ staff:[[160,-1,"kneel"]] }], ev_lab:["doc",{stamp:true}]
  };
  const D = "2026-11-09";
  const ANIM = {
    cctv_kitchen: { scene:"vcorridor", cam:"CAM3 廚房走廊", date:D, beats:[
      { t:"21:56:00", d:3.5, cap:"陳浩從廚房走出來，手上拿著冰桶，走上樓梯往二樓書房去。", m:{ ho_b:[74,44,"hold",1,21,92] }, out:["ho_b"] },
      { t:"22:03:00", d:2.5, cap:"陳浩空手下樓，", m:{ ho:[110,98,null,1,74,44] } },
      { t:"22:03:10", d:2, cap:"看了鏡頭兩眼，", m:{ ho:[110,98,"stand",1] } },
      { t:"22:03:20", d:2.5, cap:"又上樓回房間。", m:{ ho:[74,44,null,-1] }, out:["ho"] }
    ] },
    cctv_garden: { scene:"vgarden", opt:{ lit:true }, cam:"CAM4 後花園", date:D, beats:[
      { t:"22:38:00", d:3, cap:"林美玲走到花園。", m:{ lam:[108,96,null,1,77,90] } },
      { t:"22:40:00", d:3, cap:"一名戴帽子的男子從側門進來。", m:{ kevin:[124,96,null,-1,165,90] } },
      { t:"22:41:00", d:3.5, cap:"兩人擁抱、交談。", m:{ lam:[112,96,"hold",1], kevin:[121,96,"hold",-1] } },
      { t:"22:53:00", d:3, cap:"男子從側門離開。", m:{ kevin:[165,90,null,1] }, out:["kevin"] },
      { t:"22:58:00", d:3, cap:"林美玲回到屋內。", m:{ lam:[77,90,null,-1] }, out:["lam"] }
    ] },
    cctv_gate: { scene:"vgate", cam:"CAM1 大門", date:D, beats:[
      { t:"22:31:00", d:3.5, cap:"周曉晴的白色轎車駛出大門。", cars:{ chow:[220,76,"#f1ead8"] }, out:["chow"] },
      { t:"23:00:00", d:2.5, speed:900, cap:"……之後到 23:30，都沒有人從大門進出。" }
    ] },
    cctv_back: { scene:"vback", cam:"CAM5 後門", date:D, beats:[
      { t:"22:59:00", d:3, cap:"陳浩下樓，打開後門。", m:{ ho:[120,98,null,1,30,46] } },
      { t:"23:00:00", d:3, cap:"一名穿黑色外套、戴口罩的女子進入屋內。", m:{ masked:[200,98,null,1,96,90] }, out:["masked"] },
      { t:"23:12:00", d:3, cap:"黑外套女子從後門離開。", m:{ masked:[96,90,null,-1,200,98] }, out:["masked"] },
      { t:"23:12:30", d:2, cap:"陳浩把門鎖上。", m:{ ho:[110,96,"point",-1] } }
    ] },
    cctv_hall: { scene:"vstudyhall", cam:"CAM2 書房走廊", date:D, beats:[
      { t:"23:02:00", d:2.5, cap:"一名穿黑色外套的女子走到書房門口。", m:{ masked:[97,94,null,1,10,98] }, out:["masked"] },
      { t:"23:02:20", d:3, cap:"她拿下口罩——是周曉晴。她輸入密碼，走進書房。", m:{ chowb:[97,94,"point",1] }, out:["chowb"] },
      { t:"23:08:00", d:2.5, cap:"周曉晴離開書房，下樓往後門走去。", m:{ chowb:[-12,98,null,-1,97,94] }, out:["chowb"] },
      { t:"23:30:00", d:3, cap:"黃伯用鑰匙開門，進入書房。", m:{ wong:[97,94,"hold",-1,200,98] }, out:["wong"] }
    ] }
  };
  [...EP1.cctv, ...EP1.evidence].forEach(it => {
    const v = SC[it.id]; if (v){ it.scene = v[0]; if (v[1]) it.sceneOpt = v[1]; }
    const h = HOT[it.id]; if (h){ it.room = h[0]; it.hot = h[1]; }
    if (ANIM[it.id]) it.anim = ANIM[it.id];
  });
  EP1.defaultScene = "vhall";

  EP1.court = {
    title: "凌晨・別墅客廳", scene: "vhall",
    who: ["wong","lam","ho","chow"],
    detective: null,
    open: "律師的車燈出現在山路上之前，你請所有人到客廳集合。落地鐘剛敲過兩點。",
    kindLine: {
      suicide: "我的結論是——陳先生是自殺的。",
      murder: "我的結論是——陳先生不是自殺。他是被人殺死的。",
      accident: "我的結論是——這是一場意外。陳先生誤食了有毒的東西。"
    },
    murmur: [ "（林美玲握緊了手機。）", "（黃伯手裡的杯子差點掉到地上。）" ],
    confess: {
      ho: [ "……叔叔明天就要把我從遺囑裡除名了。我欠的那些錢，那些人不會放過我的。", "冰塊是我做的。……我只是想讓一切停下來。" ],
      chow: [ "那 380 萬，我本來打算慢慢還的。他寫了「明天報警」……", "遺書是我印的。我以為，大家都會相信他是累了。" ]
    },
    cornered: { ho: "……我、我要等律師來。", chow: "……我不會再說任何話。" },
    deny: {
      wong: "警官，我在這個家三十年了……我怎麼可能害老爺？",
      lam: "我承認我說了謊，但那是為了別的事！我沒有殺他！",
      ho: "你瘋了吧？我整晚都在房間打電動！",
      chow: "我十點半就走了，大門監視器拍得一清二楚。",
      kevin: "（Kevin 不在這裡。你的話只換來一陣沉默。）",
      intruder: "（沒有人回答。窗外只有風聲。）"
    },
    replayText: "那天晚上十點，書房裡到底發生了什麼事——",
    replay: { scene:"vstudy", opt:{ body:false }, clean:true, cam:"案發經過重現", date:D, beats:[
      { t:"21:57:00", d:3, cap:"陳浩搶著把冰桶送進書房，放在書桌上。", m:{ chen:[108,96,"sit",1], ho_b:[90,98,"hold",1,61,92] } },
      { t:"21:58:00", d:2, cap:"陳浩很快就離開了。", m:{ ho_b:[61,92,null,-1] }, out:["ho_b"] },
      { t:"22:00:00", d:4, cap:"十點，陳先生照常倒了一杯威士忌，加了冰塊。", m:{ chen:[108,96,["sit","sit+drink","sit","sit+drink"],1] } },
      { t:"22:15:00", d:5, cap:"冰塊慢慢融化，毒發了。", m:{ chen:[108,96,["sit+cry","stand+cry","kneel+cry","fall"],1] } },
      { t:"23:02:00", d:3, cap:"周曉晴從後門回來，輸入密碼，走進書房。", m:{ chowb:[160,96,null,1,61,92] } },
      { t:"23:05:00", d:3, cap:"她用電腦印出一張「遺書」，放在印表機旁。", m:{ chowb:[160,96,"point",1] } },
      { t:"23:08:00", d:2.5, cap:"然後離開了。", m:{ chowb:[61,92,null,-1] }, out:["chowb"] }
    ] },
    endGood: "陳浩低著頭，周曉晴別過臉去。窗外，律師的車燈正沿著山路開上來。\n這不是自殺。你沒有讓它被當成自殺結案。",
    endBad: "沒有人說話。落地鐘滴答滴答地走著。\n你總覺得，有人悄悄鬆了一口氣。"
  };
  delete EP1.court.detective;

})();
