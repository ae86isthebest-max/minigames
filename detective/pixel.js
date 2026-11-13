/* =========================================================
   像素風場景與人物（所有案件共用）
   畫布 192×108，放大顯示（image-rendering: pixelated）
   - 人物：suspect.look = { skin, hair, hairStyle, top, bottom, ... }，可用 look.byPhase 依天數改造型
   - 場景：location.scene、item.scene、test.scene ＝ 下面 SCENES 的名字
   ========================================================= */
const PX = (() => {
  const W = 192, H = 108, INK = "#1b1512";
  let g = null, T = 0, NIGHT = false, RES = 1;   // RES＝畫布比 192×108 細幾倍（場景圖和重播用 4 倍，人物才不會變形）
  const HI = 4;
  const R = (x,y,w,h,c) => { if (c){ g.fillStyle = c; g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); } };
  const P = (x,y,c) => R(x,y,1,1,c);
  // 固定亂數（同一場景每次畫出來都一樣）
  let seed = 1; const rnd = () => (seed = (seed*16807) % 2147483647) / 2147483647;
  const dither = (x,y,w,h,c,step=2) => { for (let j=0;j<h;j++) for (let i=(j%2);i<w;i+=step) P(x+i,y+j,c); };
  const shade = (hex, k) => { const n = parseInt(hex.slice(1),16); let r=n>>16, gg=(n>>8)&255, b=n&255;
    const f = v => Math.max(0,Math.min(255,Math.round(k<0? v*(1+k) : v+(255-v)*k)));
    return "#" + [f(r),f(gg),f(b)].map(v=>v.toString(16).padStart(2,"0")).join(""); };

  /* ---------- 天空、天氣、地面 ---------- */
  function sky(top, bot, h=60){ for (let y=0;y<h;y++){ const t=y/h; R(0,y,W,1,mix(top,bot,t)); } }
  function mix(a,b,t){ const A=parseInt(a.slice(1),16), B=parseInt(b.slice(1),16);
    const c=[16,8,0].map(s=>Math.round(((A>>s)&255)*(1-t)+((B>>s)&255)*t)); return "#"+c.map(v=>v.toString(16).padStart(2,"0")).join(""); }
  function rain(n=90, c="#9fb4c8"){ seed=7; for (let i=0;i<n;i++){ const x=rnd()*W, y=rnd()*H; R(x,y,1,3,c); } }
  function hills(y, c1, c2){ seed=3; for (let x=0;x<W;x++){ const h=Math.sin(x/23)*5+Math.sin(x/9)*2; R(x,y+h,1,H,c1); }
    for (let x=0;x<W;x+=3){ const h=Math.sin(x/23)*5+Math.sin(x/9)*2; for(let r=0;r<6;r++) P(x+(r%2),y+h+4+r*4,c2); } }
  function teaRows(y, c1, c2){ for (let r=0;r<4;r++){ const yy=y+r*5; for (let x=-4;x<W;x+=8){ R(x+(r%2)*4,yy,7,3,c1); R(x+(r%2)*4,yy,7,1,c2); } } }
  function floor(y, c, line){ R(0,y,W,H-y,c); if (line) for (let x=0;x<W;x+=16) R(x,y,1,H-y,line); R(0,y,W,1,shade(c,-.3)); }
  function wall(y, c, brick){ R(0,0,W,y,c); if (brick){ for (let j=0;j<y;j+=5) for (let i=(j/5%2)*6;i<W;i+=12) R(i,j,11,1,shade(c,-.12)); } }
  function windowBox(x,y,w,h,glass,frame="#3a2e25"){ R(x-1,y-1,w+2,h+2,frame); R(x,y,w,h,glass); R(x+Math.floor(w/2),y,1,h,frame); R(x,y+Math.floor(h/2),w,1,frame); R(x+1,y+1,2,1,shade(glass,.3)); }
  function door(x,y,w,h,c){ R(x-1,y-1,w+2,h+1,INK); R(x,y,w,h,c); P(x+w-3,y+h/2,"#d9b75b"); }
  function sign(x,y,w,c,tc){ R(x-1,y-1,w+2,9,INK); R(x,y,w,7,c); for(let i=2;i<w-2;i+=3) R(x+i,y+3,2,1,tc); }
  function lamp(x,y,c="#ffd98a"){ R(x,y,1,4,INK); R(x-2,y+4,5,2,c); dither(x-6,y+6,13,10,shade(c,-.1),3); }

  /* ---------- 物件 ---------- */
  const OBJ = {
    ladder(x,y,h){ R(x,y,1,h,"#6b4a2b"); R(x+7,y,1,h,"#6b4a2b"); for(let j=2;j<h;j+=5) R(x,y+j,8,1,"#8a6338"); },
    dryer(x,y,hot){ R(x-1,y-1,30,24,INK); R(x,y,28,22,"#7d8288"); R(x+2,y+3,24,12,"#4c5157"); R(x+3,y+4,22,10,hot?"#c4472f":"#3a3e43");
      if(hot){ dither(x+3,y+4,22,10,"#f29a3c",2); for(let i=0;i<4;i++) R(x-4-i*3,y+6+i,2,1,"#f2b25c"); } R(x+20,y+17,5,3,"#2a2d31"); P(x+22,y+18,hot?"#ff4a3a":"#6fd46f"); },
    rack(x,y,shiny){ R(x,y,2,30,"#5a3e24"); R(x+26,y,2,30,"#5a3e24"); [0,10,20].forEach(j=>R(x,y+j,28,2,"#7a5533"));
      R(x+3,y-5,7,5,"#b4a78c"); R(x+12,y-4,8,4,"#9b8a6a"); R(x+4,y+5,5,5,"#8b6a3a"); if (shiny !== "off") R(x+18,y+6,6,4, shiny?"#f2c94c":"#8a6a2c"); if(shiny && shiny !== "off"){ P(x+19,y+6,"#fff6c8"); P(x+22,y+7,"#fff6c8"); }
      R(x+3,y+15,10,5,"#a08a5c"); R(x+16,y+14,8,6,"#6d6d6d"); },
    tape(x,y,w){ for(let i=0;i<w;i+=6){ R(x+i,y,3,2,"#f2d03b"); R(x+i+3,y,3,2,INK); } },
    outline(x,y){ const c="#e9e4da"; R(x,y,4,1,c); R(x+4,y+1,9,1,c); R(x+13,y,6,1,c); R(x,y,1,5,c); R(x,y+5,6,1,c); R(x+6,y+5,1,3,c); R(x+6,y+8,10,1,c); R(x+16,y+5,1,3,c); R(x+16,y+5,5,1,c); R(x+19,y,1,5,c); },
    blood(x,y,w,c="#7d1e1a"){ seed=x*7+y; for(let i=0;i<w*2;i++){ const a=rnd()*w, b=rnd()*w/2.4; P(x+a,y+b,c); } R(x+w/3,y+w/8,w/3,w/6,c); },
    teaBag(x,y){ R(x-1,y-1,10,6,INK); R(x,y,8,4,"#c9b38a"); for(let i=0;i<10;i++) P(x+10+i*1.5,y+3+(i%3),"#3f5b2a"); },
    weight(x,y,shiny){ R(x,y,5,5,shiny?"#f2c94c":"#8a6a2c"); R(x+2,y-2,1,2,"#5a4a2a"); },
    knife(x,y){ R(x,y,8,1,"#cfd6dc"); R(x+8,y-1,4,3,"#5a3e24"); P(x,y,"#ffffff"); },
    hair(x,y){ R(x,y,9,1,"#141010"); P(x+9,y-1,"#141010"); P(x+10,y-1,"#141010"); },
    marker(x,y,n){ R(x,y,5,6,"#f2d03b"); R(x+1,y+1,3,4,INK); R(x+2,y+2,1,2,"#f2d03b"); },
    pool(x,y,w,h,drained){ R(x,y,w,h,drained?"#5a3a24":"#2f4b55"); if(!drained){ for(let i=0;i<w;i+=7) R(x+i,y+2+(i%3),4,1,"#5f8794"); } R(x,y-2,w,2,"#9a4a2c"); dither(x,y-4,w,2,"#9a4a2c",3); },
    gate(x,y){ R(x,y,3,22,"#555b60"); R(x+12,y,3,22,"#555b60"); R(x,y+2,15,2,"#6c7378"); R(x+3,y+6,9,12,"#4a5054"); R(x+6,y-6,2,6,"#8a3a2a"); },
    stone(x,y,bloody){ R(x,y,6,4,"#7a7a72"); R(x+1,y-1,4,1,"#8d8d84"); if(bloody){ P(x+2,y,"#7d1e1a"); P(x+3,y+1,"#7d1e1a"); P(x+4,y,"#7d1e1a"); } },
    flashlight(x,y){ R(x,y,7,3,"#3a3a3a"); R(x+7,y-1,2,5,"#9a9a9a"); },
    coatRack(x,y,wet){ R(x,y,40,2,"#5a3e24"); R(x+2,y,2,36,"#5a3e24"); R(x+36,y,2,36,"#5a3e24");
      ["#e98fb3","#2c5d8c","#e0c23a","#4a7a3a","#7a7a7a"].forEach((c,i)=>{ const xx=x+3+i*7; R(xx,y+2,6,18,c); R(xx+1,y+3,4,1,shade(c,.3)); if(i===0&&wet){ R(xx,y+16,6,4,"#9a4a2c"); P(xx+1,y+21,"#7fb6ff"); P(xx+4,y+23,"#7fb6ff"); } }); },
    basket(x,y){ R(x,y,24,14,"#a07a46"); for(let i=0;i<24;i+=3) R(x+i,y,1,14,"#7a5a30"); R(x+3,y-4,16,5,"#8d9196"); R(x+4,y-5,6,2,"#8d9196"); R(x+14,y-3,3,2,"#5b2a1e"); },
    stove(x,y,ash){ R(x,y,40,22,"#7a6a5a"); R(x+2,y+2,36,4,"#8a7a6a"); R(x+10,y+9,20,10,INK); if(ash){ dither(x+11,y+14,18,5,"#8a8a86",2); R(x+15,y+15,4,2,"#e9e4da"); R(x+22,y+16,3,2,"#c9a77a"); } R(x+30,y-30,6,30,"#6a5a4a"); },
    desk(x,y,w){ R(x,y,w,4,"#6b4a2b"); R(x+2,y+4,3,16,"#5a3e24"); R(x+w-5,y+4,3,16,"#5a3e24"); R(x,y,w,1,"#8a6338"); },
    paper(x,y,w=22,h=28,lines=7){ R(x+1,y+1,w,h,"#00000055"); R(x,y,w,h,"#f1ead8"); for(let i=0;i<lines;i++) R(x+3,y+4+i*3.4,w-6-(i%3)*3,1,"#6a6a7a"); },
    monitor(x,y,w,h){ R(x-2,y-2,w+4,h+4,"#2a2a2e"); R(x,y,w,h,"#0d1a12"); for(let j=0;j<h;j+=2) R(x,y+j,w,1,"#12261a"); R(x+2,y+2,3,2,"#e04a3a"); R(x+w/2-1,y+h+2,3,4,"#2a2a2e"); R(x+w/2-6,y+h+6,13,2,"#2a2a2e"); },
    phone(x,y){ R(x,y,14,24,"#222"); R(x+1,y+2,12,18,"#5aa0d8"); for(let i=0;i<5;i++) R(x+3,y+5+i*3,8-(i%2)*3,1,"#e8f2ff"); },
    microscope(x,y){ R(x,y+14,14,3,"#555"); R(x+8,y,3,15,"#777"); R(x+3,y+3,7,3,"#999"); R(x+2,y+8,8,2,"#555"); },
    shelf(x,y,w,rows,items){ for(let r=0;r<rows;r++){ R(x,y+r*10,w,2,"#5a3e24"); for(let i=2;i<w-3;i+=5) R(x+i,y+r*10-6,4,6,items[(i+r)%items.length]); } },
    car(x,y,c="#3d6fa8"){ R(x,y+6,40,10,c); R(x+8,y,22,7,shade(c,-.2)); R(x+10,y+1,8,5,"#9cc5e6"); R(x+20,y+1,8,5,"#9cc5e6"); R(x+5,y+14,8,6,INK); R(x+27,y+14,8,6,INK); },
    plant(x,y){ R(x,y,6,6,"#8a5a3a"); R(x-2,y-8,10,8,"#3f7a3a"); P(x+1,y-9,"#5fa05a"); },
    cig(x,y){ R(x,y,3,1,"#e9e4da"); P(x+3,y,"#c9763a"); },
    lantern(x,y){ R(x,y,1,3,INK); R(x-3,y+3,7,9,"#f1ead8"); R(x-3,y+5,7,1,INK); R(x-3,y+9,7,1,INK); },
    bankbook(x,y){ R(x,y,16,11,"#2f7a4a"); R(x+2,y+2,12,2,"#e9e4da"); },
    suitcase(x,y){ R(x,y,24,18,"#2c3e5c"); R(x+9,y-3,6,3,INK); R(x+3,y+8,8,6,"#e9e4da"); R(x+5,y+9,4,4,"#d23a3a"); R(x+6,y+10,2,2,"#e9e4da"); }
  };

  /* ---------- 姿勢字串、手上的物件 ----------
     姿勢＝「腿+手:慣用手@物件/顏色」，後面三段都可以省略。例如：
       "drink"            站著喝（用這個人的慣用手，look.hand:"left" 就是左撇子，沒寫＝右手）
       "sit+drink:L@glass" 坐著，用左手拿玻璃杯喝
       "reach@bottle"     伸手去拿／放下瓶子          "strike@weight"  往下砸
       "push@cart/#2a6ad8" 推推車（車上的東西是藍色）   "carry:R@bag"    右手提著袋子
       "door@key&bucket"  一手拿鑰匙開門，另一隻手提著桶子（& 後面＝另一隻手拿的東西，只有單手的動作可以用）
     腿：stand walk1 walk2 sit kneel fall lie stumble prone back（back＝站著、背對鏡頭，例如面向牆邊的機器操作）
         kick／kick2＝一隻腳往前踢（kick2 是收腳的那一格，兩個輪流就是踢的動作）
         fall → lie＝往後倒、仰躺（頭在面向的反方向）；stumble → prone＝往前撲倒、趴著（頭在面向的那一邊，看到後腦）
     單手（跟著慣用手；人轉身也不會換手）：drink cup eat smoke cig phone carry raise wave wave2 inspect pocket write sign broom broom2
     單手、伸向面對的方向：point aim give reach strike pour knock knock2 wipe wipe2 brush brush2 door stretch（door＝伸手到門把／密碼鎖的高度；stretch＝伸長手去拿比較遠的東西）
     雙手：hold read cross cry cam push drag type type2 handsup lift climb climb2 clutch polish polish2（clutch＝雙手抓住胸口、很痛苦；polish@物件＝拿布擦手上的東西）
     物件：見下面 ITEMS；雙手捧的另外有 pot bucket bag box tray cooler；push 可以用 cart */
  const LEGS = new Set(["stand","walk1","walk2","sit","kneel","fall","lie","stumble","prone","back","kick","kick2"]);
  const DIR = { point:[20,11], aim:[20,10], give:[19,13], reach:[18,15], strike:[19,17], pour:[18,9], stretch:[26,12], knock:[17,6], knock2:[18,7], door:[17,5], wipe:[17,14], wipe2:[19,14], brush:[17,14], brush2:[17,16] };
  const ARM1 = new Set(["drink","cup","eat","smoke","cig","phone","carry","raise","wave","wave2","inspect","pocket","write","sign","broom","broom2"]);
  const ARM2 = new Set(["hold","read","cross","cry","cam","push","drag","type","type2","handsup","lift","climb","climb2","clutch","polish","polish2"]);
  const HOLDP = new Set(["pot","bucket","bag","box","tray","cooler"]);
  // 走路時「到了才做」的動作：路上先正常走（手上有東西就拿著），走到才擺出動作
  const ARRIVE = new Set([...Object.keys(DIR), "drink","eat","raise","wave","wave2","inspect","pocket","write","sign","cam","handsup","type","type2"]);
  // 側面走路的人畫得出來的手部動作（其他的走路時還是用正面）
  const PROF = new Set(["stand","walk1","walk2","carry","hold","read","push","drag","phone","cup","point","aim","give","reach","strike","pour","stretch","knock","knock2","door","wipe","wipe2","brush","brush2"]);
  function parsePose(str){
    let s = String(str || "stand"), item = null, col = null, hand = null, item2 = null, col2 = null;
    const amp = s.indexOf("&"); if (amp >= 0){ item2 = s.slice(amp+1); s = s.slice(0, amp); const k = item2.indexOf("/"); if (k >= 0){ col2 = item2.slice(k+1); item2 = item2.slice(0, k); } }
    const at = s.indexOf("@"); if (at >= 0){ item = s.slice(at+1); s = s.slice(0, at); const k = item.indexOf("/"); if (k >= 0){ col = item.slice(k+1); item = item.slice(0, k); } }
    const m = /:([LR])$/.exec(s); if (m){ hand = m[1]; s = s.slice(0, -2); }
    const i = s.indexOf("+"); let legs = i >= 0 ? s.slice(0, i) : s, arm = i >= 0 ? s.slice(i+1) : "";
    if (!arm){ if (LEGS.has(legs)) arm = /^walk/.test(legs) ? legs : "stand"; else { arm = legs; legs = "stand"; } }
    if (arm === "carry" && /^(box|tray|pot|cooler)$/.test(item||"")) arm = "hold";   // 大件的東西一定是兩隻手捧在身前
    return { legs, arm, hand, item, col, item2, col2 };
  }
  // 檢查姿勢字串有沒有打錯（打錯的話人會變成只是站著，所以要先查）。回傳錯在哪裡，沒錯回傳 ""
  function poseErr(str){
    if (Array.isArray(str)) return str.map(poseErr).filter(Boolean)[0] || "";
    const p = parsePose(str);
    if (!LEGS.has(p.legs)) return "不認得的腿部姿勢：" + p.legs;
    if (!(p.arm === "stand" || /^walk[12]$/.test(p.arm) || DIR[p.arm] || ARM1.has(p.arm) || ARM2.has(p.arm) || p.arm === "sniff")) return "不認得的動作：" + p.arm;
    if (p.item && !(ITEMS[p.item] || HOLDP.has(p.item) || p.item === "cart")) return "不認得的物件：" + p.item;
    if (p.item2 && !ITEMS[p.item2]) return "不認得的物件：" + p.item2;
    if (p.item2 && (ARM2.has(p.arm) || p.arm === "write" || p.arm === "sign")) return "雙手的動作不能再用 & 拿第二樣東西：" + p.arm;
    if (p.col && !/^#[0-9a-fA-F]{6}$/.test(p.col)) return "顏色要寫成 #rrggbb：" + p.col;
    return "";
  }
  /* 手上的物件。seg＝長條的東西，從手往外一段一段畫 [長度, 顏色, 粗細]；w/h/c＝一小塊；f＝自己畫。main＝可以換顏色的那一段 */
  const ITEMS = {
    cup:      { w:3, h:4, c:"#e9e4da", d:(a,x,y,w,h,c)=>a(x,y,w,1,shade(c,-.3)) },
    glass:    { w:3, h:4, c:"#cfe6f2", d:(a,x,y,w,h,c)=>a(x,y+2,w,2,"#c98a3a") },
    bottle:   { seg:[[5,"#3f7a4a",2],[2,"#2f5a3a",1]], main:0 },
    vial:     { seg:[[2,"#7a4a2a",2],[1,"#e9e4da",2]], main:0 },
    can:      { w:2, h:3, c:"#d8b23a", d:(a,x,y,w,h,c)=>a(x,y,w,1,"#c8ced2") },
    coat:     { f:(a,x,y,o,c)=>{ c = c || "#5a4a3a"; const by = o==="up" ? y-5 : y+1; a(x-1,by,4,6,c); a(x-1,by,4,1,shade(c,.2)); a(x+2,by+2,1,4,shade(c,-.25)); } },
    pill:     { w:1, h:1, c:"#ffffff" },
    ice:      { w:2, h:2, c:"#e9f6ff" },
    knife:    { seg:[[1,"#5a3a22"],[4,"#d8dde0"]], main:1 },
    scissors: { seg:[[2,"#c23a2a",2],[3,"#b8c0c4"]], main:0 },
    wrench:   { seg:[[5,"#8a9094"],[2,"#aab0b4",2]], main:0 },
    weight:   { seg:[[1,"#5a4a2a"],[3,"#c9a03a",3]], main:1 },
    hammer:   { seg:[[4,"#8a6338"],[2,"#8a9094",3]], main:1 },
    pipe:     { seg:[[8,"#8a9094"]], main:0 },
    stick:    { seg:[[8,"#8a6338"]], main:0 },
    syringe:  { seg:[[1,"#e9f2f6",2],[3,"#cfe6f2"],[1,"#8a9094"]], main:1 },
    torch:    { seg:[[3,"#2a2a2e",2],[1,"#ffe27a",2]], main:0 },
    key:      { seg:[[1,"#e6c34a",2],[2,"#e6c34a"]], main:0 },
    pen:      { seg:[[3,"#2a3a8a"]], main:0 },
    bolt:     { seg:[[1,"#8a9094",2],[2,"#aab0b4"]], main:1 },
    rope:     { seg:[[6,"#c9a35a"]], main:0 },
    lighter:  { seg:[[2,"#c23a2a"],[1,"#ffb03a"]], main:0 },
    magnifier:{ seg:[[2,"#5a3a22"],[3,"#cfe6f2",3]], main:1 },
    mop:      { seg:[[8,"#8a6338"],[2,"#e9e4da",3]], main:1 },
    brush:    { seg:[[3,"#e6c34a"]], main:0 },
    phone:    { w:2, h:4, c:"#111111", d:(a,x,y)=>a(x,y+1,1,2,"#3a5a7a") },
    paper:    { w:4, h:3, c:"#f1ead8", d:(a,x,y)=>a(x+1,y+1,2,1,"#7a8a9a") },
    envelope: { w:4, h:3, c:"#f4f6f6", d:(a,x,y,w,h,c)=>a(x,y,w,1,shade(c,-.2)) },
    notebook: { w:3, h:4, c:"#2a3a6a", d:(a,x,y,w,h,c)=>a(x,y,1,h,shade(c,.35)) },
    book:     { w:4, h:3, c:"#8a2a2a", d:(a,x,y,w,h,c)=>a(x,y+h-1,w,1,"#f1ead8") },
    card:     { w:2, h:2, c:"#e8903a" },
    cash:     { w:3, h:2, c:"#6aa85a" },
    cloth:    { w:3, h:3, c:"#e9e4da" },
    wallet:   { w:3, h:2, c:"#4a3424" },
    remote:   { w:2, h:3, c:"#2a2a2e", d:(a,x,y)=>a(x,y,1,1,"#e04a3a") },
    tape:     { w:2, h:2, c:"#222222" },
    box:      { w:4, h:4, c:"#b8915a", d:(a,x,y,w,h,c)=>a(x,y,w,1,shade(c,.25)) },
    bucket:   { f:(a,x,y,o,c)=>{ c = c || "#9aa6ae"; const by = o==="up" ? y-6 : y+2; a(x,by-1,2,1,"#6a767e"); a(x-2,by,6,5,c); a(x-2,by,6,1,"#e9f2f6"); } },
    tray:     { f:(a,x,y,o,c)=>{ a(x-3,y-1,8,1,c||"#aab0b4"); a(x-1,y-4,3,3,"#f4f0e6"); } },
    gun:      { f:(a,x,y,o,c)=>{ c = c || "#2a2a2e"; if (o==="down"){ a(x,y+2,2,4,c); a(x+1,y+1,2,1,c); } else if (o==="up"){ a(x,y-3,2,4,c); a(x+1,y,2,1,c); } else { a(x+1,y,5,2,c); a(x+1,y+1,1,2,c); } } },
    bag:      { f:(a,x,y,o,c)=>{ c = c || "#cdbf9c"; const by = o==="up" ? y-7 : y+2; a(x,by-1,1,1,shade(c,-.3)); a(x+1,by-1,1,1,shade(c,-.3)); a(x-2,by,6,6,c); a(x-2,by,6,1,shade(c,-.2)); } },
    case:     { f:(a,x,y,o,c)=>{ c = c || "#4a3424"; const by = o==="up" ? y-6 : y+2; a(x,by-1,2,1,INK); a(x-2,by,7,5,c); a(x-2,by+2,7,1,shade(c,.2)); } },
    umbrella: { f:(a,x,y,o,c)=>{ c = c || "#2a3a6a"; if (o==="up"){ a(x+1,y-6,1,7,"#5a3a22"); a(x-5,y-8,13,3,c); a(x-3,y-10,9,2,c); a(x+1,y-11,1,1,c); } else if (o==="fwd"){ a(x+1,y,2,1,"#5a3a22"); a(x+3,y,7,2,c); } else { a(x,y+1,1,2,"#5a3a22"); a(x,y+3,2,7,c); } } },
    ladder:   { f:(a,x,y,o)=>{ const c = "#8a6338", top = o==="down" ? y-6 : y-16; a(x,top,1,20,c); a(x+4,top,1,20,c); for (let j=2;j<20;j+=4) a(x,top+j,5,1,"#a8843a"); } }
  };
  // 把物件畫在手上。(x,y)＝手（2×2）的左上角；o＝up 立在手上、fwd 往前伸、down 往下垂
  function putItem(add, name, x, y, o, col){
    const it = ITEMS[name]; if (!it) return 0;
    if (it.f){ it.f(add, x, y, o, col); return 0; }
    if (it.seg){ let k = 0; it.seg.forEach(([len, c, t=1], j) => { const cc = col && j === it.main ? col : c, off = t >= 3 ? -1 : 0;
        if (o==="up") add(x + off, y + 2 - k - len, t, len, cc); else if (o==="down") add(x + off, y + k, t, len, cc); else add(x + 1 + k, y + off, len, t, cc);
        k += len; }); return k; }
    const c = col || it.c, w = it.w, h = it.h;
    const bx = o==="fwd" ? x + 1 : x + Math.floor((2-w)/2), by = o==="fwd" ? y + 1 - Math.ceil(h/2) : o==="down" ? y + 1 : y - h + 1;
    add(bx, by, w, h, c); it.d && it.d(add, bx, by, w, h, c); return w;
  }
  // 雙手捧著的東西（座標是正面人物的；ox/oy 可以整個搬動，例如舉過頭、放在地上推）
  function holdProp(add, name, col, ox=0, oy=0){
    const a = (x,y,w,h,c) => add(x+ox, y+oy, w, h, c);
    if (!name) return;
    if (name==="pot"){ const c = col||"#8a5a3a"; a(5,14,6,4,c); a(11,15,2,1,c); }
    else if (name==="bucket"){ a(4,13,8,6,col||"#9aa6ae"); a(4,13,8,1,"#e9f2f6"); a(5,16,6,1,shade(col||"#9aa6ae",-.2)); a(5,11,2,2,"#dff4ff"); a(8,11,2,2,"#cfeeff"); a(7,12,1,1,"#ffffff"); }
    else if (name==="bag"){ const c = col||"#cdbf9c"; a(3,15,10,6,c); a(3,15,10,1,shade(c,-.2)); a(4,19,8,1,shade(c,-.1)); a(5,12,1,3,shade(c,-.2)); a(10,12,1,3,shade(c,-.2)); }
    else if (name==="box"){ const c = col||"#b8915a"; a(3,12,10,7,c); a(3,12,10,1,shade(c,.25)); a(7,12,2,7,shade(c,-.2)); }
    else if (name==="cooler"){ const c = col||"#2a6ad8"; a(3,12,10,7,c); a(3,12,10,2,"#e9f2f6"); a(7,10,2,2,"#e9f2f6"); }
    else if (name==="tray"){ a(2,15,12,2,col||"#aab0b4"); a(4,12,3,3,"#e9e4da"); a(9,13,3,2,"#e9e4da"); a(4,12,3,1,"#c9c4ba"); }
    else if (ITEMS[name]) putItem(add, name, 7+ox, 14+oy, "up", col);
    else a(4,14,8,4,name);   // 舊寫法：look.prop 直接給顏色
  }
  // 推著走的東西：畫在人前面的地上
  function pushProp(add, name, col, ox=0){
    const a = (x,y,w,h,c) => add(x+ox, y, w, h, c);
    if (name==="cart"){ a(20,11,1,10,"#8a9094"); a(21,20,13,2,"#8a9094"); a(21,14,13,1,"#aab0b4"); a(33,14,1,7,"#8a9094"); a(22,23,3,3,"#2a2a2e"); a(30,23,3,3,"#2a2a2e");
      if (col){ a(22,7,11,7,col); a(22,7,11,2,shade(col,.3)); } else { a(23,11,2,3,"#e9e4da"); a(26,10,2,4,"#cfe6f2"); a(29,11,2,3,"#e9e4da"); } }
    else if (name) holdProp(add, name, col, 17+ox, 8);
  }
  // 人物每一格的大小要對齊畫布的細格（RES），不然放大 1.3、1.4 倍時臉和眼鏡會變形
  const snap = s => RES > 1 ? Math.max(1, Math.round(s*RES))/RES : s;
  const RAW = (x,y,w,h,c) => { if (c){ g.fillStyle = c; g.fillRect(x,y,w,h); } };

  /* ---------- 人物 ---------- */
  function person(x, y, L, s=1, facing=1, pose){
    // (x, y) ＝ 腳底中央；大約 16×28 像素。pose 的寫法見上面「姿勢字串」
    if (L.kind === "dog") return dog(x, y, L, s, facing, pose);
    const PP = parsePose(pose || L.pose), legs = PP.legs; pose = PP.arm;
    const climb = pose === "climb" || pose === "climb2";
    if (climb || legs === "back" || legs === "prone") L = { ...L, back:true };
    // 做動作的是哪一隻手：人的右手永遠在畫面左邊（面向右時是 x=1 那邊，翻面後是 x=13 那邊）
    // 背對鏡頭的時候左右相反（人的右手在畫面右邊）
    // 背對鏡頭又往旁邊伸手：一定用伸出去那一邊的手（另一隻手會被身體擋住，畫不出來）
    const near = (L.back && DIR[PP.arm]) ? true : (((PP.hand || (L.hand === "left" ? "L" : "R")) === "L") === (facing > 0)) !== !!L.back;
    let LAY = 0;   // 1＝畫在最上層（橫過身體的手要有自己的外框，才看得出來）
    const parts = [], add = (px,py,w,h,c) => parts.push([px,py,w,h,c,LAY]);
    const skin=L.skin||"#e8b98f", top=L.top||"#5577aa", bot=L.bottom||"#333a44", hair=L.hair||"#2a1d16", shoe=L.shoes||"#2a2320";
    const old = L.age==="old", sl = L.coat||L.sleeve||top, hand = L.gloves||skin;
    const low = legs==="kneel"||legs==="sit"||legs==="fall"||legs==="stumble";
    // 腿
    if (low){ add(3,18,4,4,bot); add(9,18,4,4,bot); add(2,21,5,2,shoe); add(9,21,5,2,shoe); if (L.skirt) add(3,17,10,4,bot); }
    else if (climb){ const a = pose==="climb" ? 3 : 0, b = 3 - a; add(4,18,3,8-a,bot); add(9,18,3,8-b,bot); add(3,25-a,4,2,shoe); add(9,25-b,4,2,shoe); if (L.skirt) add(3,17,10,5,bot); }
    else if (legs==="kick"||legs==="kick2"){ const k = legs==="kick", lc = L.skirt ? skin : bot;   // 後腳站著，前腳往面向的方向踢出去
      if (L.skirt) add(3,17,10,5,bot); add(4,L.skirt?22:18,3,L.skirt?4:8,lc); add(3,25,4,2,shoe);
      if (k){ add(9,L.skirt?21:18,3,L.skirt?2:4,lc); add(11,21,4,3,lc); add(15,21,3,3,shoe); add(17,20,1,1,shoe); }
      else { add(9,L.skirt?22:18,3,L.skirt?2:5,lc); add(10,22,3,2,lc); add(11,24,4,2,shoe); } }
    else if (L.skirt){ add(3,17,10,5,bot); const a=legs==="walk1"?1:0, b=legs==="walk2"?1:0; add(4,22,2,4-a,skin); add(10,22,2,4-b,skin); add(3,25-a,4,2,shoe); add(9,25-b,4,2,shoe); }
    else { const a=legs==="walk1"?1:0, b=legs==="walk2"?1:0; add(4-b,18,3,8-a,bot); add(9+a,18,3,8-b,bot); add(3-b,25-a,4,2,shoe); add(9+a,25-b,4,2,shoe); }
    if (!low && !L.skirt && !/^kick/.test(legs)){ add(5,19,1,5,shade(bot,-.18)); add(10,19,1,5,shade(bot,-.18)); add(3,25,1,1,shade(shoe,.45)); add(9,25,1,1,shade(shoe,.45)); }
    const legEnd = parts.length;
    // 身體（領口、皮帶、衣服皺褶）
    add(3,10,10,9,top);
    if (!low && !L.skirt && !L.coat) add(3,18,10,1,shade(bot,-.35));
    add(6,10,4,1,shade(top,.22)); add(5,15,1,2,shade(top,-.12)); add(4,11,1,6,shade(top,.12)); add(3,17,10,1,shade(top,-.2));
    if (L.coat) { add(3,10,3,10,L.coat); add(10,10,3,10,L.coat); add(6,10,1,3,shade(L.coat,.2)); add(9,10,1,3,shade(L.coat,.2)); add(4,15,1,1,shade(L.coat,-.3)); add(11,15,1,1,shade(L.coat,-.3)); }
    if (L.apron) add(5,12,6,8,L.apron);
    if (L.tie) add(7,11,2,5,L.tie);
    if (L.chain) add(5,11,6,1,"#e6c34a");
    if (L.stetho) { add(4,10,1,5,"#555"); add(11,10,1,5,"#555"); add(5,15,6,1,"#555"); }
    // 手。先照「做動作的手在 x=13 那邊」畫，如果其實是另一隻手：沒有方向的動作整個左右對調，
    // 有方向的動作（指、伸手、遞……）改成從另一邊肩膀橫過身體伸出去
    const A0 = parts.length, hands = []; let H = null, H2 = null, mirror = false, orient = "up", dflt = null;
    const hnd = (hx,hy,tag,act,w=2) => { add(hx,hy,w,2,hand); const o = { i:parts.length-1, tag }; hands.push(o); if (act) H = o; return o; };
    const armDown = (ax,sw,act) => { add(ax,11,2,7+(sw||0),sl); const o = hnd(ax,18+(sw||0), ax<8?"F":"N", act); if (!act) H2 = o; };
    const P1 = () => armDown(1, pose==="walk2"?-1:0);
    const limb = (x0,y0,x1,y1) => { const n = Math.max(Math.abs(x1-x0), Math.abs(y1-y0)) || 1; for (let i=0;i<=n;i++) add(Math.round(x0+(x1-x0)*i/n), Math.round(y0+(y1-y0)*i/n), 2, 2, sl); };
    const one = () => { mirror = !near; };
    if (DIR[pose]){ const [hx,hy] = DIR[pose]; orient = /^knock|^door/.test(pose) ? "up" : "fwd"; dflt = pose==="aim" ? "gun" : /^wipe/.test(pose) ? "cloth" : /^brush/.test(pose) ? "brush" : null;
      if (near){ P1(); limb(13,11,hx-2,hy); hnd(hx,hy,"N",1); } else { armDown(13); LAY = 1; limb(1,11,hx-2,hy); hnd(hx,hy,"F",1); LAY = 0; } }
    else if (pose==="drink"||pose==="smoke"||pose==="eat"){ one(); P1(); add(13,11,2,4,sl); add(10,10,4,2,sl); hnd(9,8,"N",1); if (pose==="smoke"){ add(6,7,4,1,"#e9e4da"); add(5,7,1,1,"#e25a2a"); } else dflt = pose==="drink" ? "cup" : "pill"; }
    else if (pose==="cup"){ one(); P1(); add(13,11,2,4,sl); add(10,14,4,2,sl); hnd(9,13,"N",1); dflt = "cup"; }
    else if (pose==="cig"){ one(); P1(); armDown(13,0,1); add(15,19,2,1,"#e9e4da"); add(17,19,1,1,"#e25a2a"); }
    else if (pose==="carry"){ one(); P1(); armDown(13,0,1); orient = "down"; }
    else if (pose==="broom2"){ one(); P1(); add(13,11,2,6,sl); hnd(12,17,"N",1); add(11,6,1,7,"#8a6338"); add(12,13,1,7,"#8a6338"); add(13,20,1,5,"#8a6338"); add(11,24,6,3,"#c9a35a"); }
    else if (pose==="broom"){ one(); P1(); armDown(13,0,1); add(15,6,1,20,"#8a6338"); add(14,24,4,3,"#c9a35a"); }
    else if (pose==="phone"){ one(); P1(); add(13,11,2,3,sl); add(13,6,2,5,sl); hnd(12,5,"N",1); add(13,1,2,6,"#111"); add(13,2,1,3,"#3a5a7a"); }
    else if (pose==="raise"){ one(); P1(); add(13,10,3,2,sl); add(15,3,2,8,sl); hnd(15,1,"N",1); }
    else if (pose==="wave"||pose==="wave2"){ one(); P1(); add(13,11,4,2,sl); add(16,6,2,6,sl); hnd(pose==="wave"?16:17,4,"N",1); }
    else if (pose==="inspect"){ one(); P1(); add(13,11,2,3,sl); add(12,8,2,4,sl); hnd(12,6,"N",1); dflt = "magnifier"; }
    else if (pose==="pocket"){ one(); P1(); add(13,11,2,4,sl); LAY = 1; add(9,13,5,2,sl); hnd(7,13,"N",1); LAY = 0; }
    else if (pose==="write"||pose==="sign"){ one(); add(1,11,2,5,sl); add(13,11,2,5,sl); hnd(3,15,"F",0,3); hnd(10,14,"N",0,3); add(3,13,6,5,"#f1ead8"); add(4,14,4,1,"#7a8a9a"); add(11,11,1,4,PP.col||"#2a3a8a"); }
    else if (pose==="cam"){ add(1,11,2,5,sl); add(13,11,2,3,sl); add(12,7,2,4,sl); add(3,12,2,4,sl); add(4,8,2,4,sl); add(5,2,7,5,"#2a2a2e"); add(10,3,2,2,"#9ab0c8"); add(6,1,2,1,"#5a5a5e"); }
    else if (pose==="cry"){ add(1,11,2,4,sl); add(13,11,2,4,sl); add(2,8,3,3,sl); add(11,8,3,3,sl); add(4,3,3,4,hand); add(9,3,3,4,hand); }
    else if (pose==="hold"||pose==="read"){ add(1,11,2,5,sl); add(13,11,2,5,sl); hnd(3,15,"F",0,3); hnd(10,15,"N",0,3);
      if (pose==="hold") holdProp(add, PP.item || L.prop, PP.col);
      else if (PP.item && PP.item !== "paper") putItem(add, PP.item, 7, 15, "up", PP.col); else add(4,12,8,5,PP.col||"#f1ead8"); }
    else if (pose==="polish"||pose==="polish2"){ const k = pose==="polish2" ? 1 : 0; add(1,11,2,5,sl); add(13,11,2,5,sl); hnd(3,15,"F",0,3); hnd(10+k,14+k,"N",0,3);   // 一手拿著東西、另一手用布擦
      putItem(add, PP.item || "cup", 5, 15, "up", PP.col); add(8+k,12+k*2,3,3,"#e9e4da"); add(8+k,12+k*2,3,1,"#c9c4ba"); }
    else if (pose==="cross"){ add(1,11,2,5,sl); add(13,11,2,5,sl); add(3,14,10,3,sl); hnd(3,14,"N"); hnd(11,15,"F"); }
    else if (pose==="push"){ LAY = 1; limb(1,11,15,13); hnd(17,13,"F"); LAY = 0; limb(13,11,17,12); hnd(19,12,"N",1); pushProp(add, PP.item, PP.col); }
    else if (pose==="drag"){ LAY = 1; limb(1,11,14,17); hnd(16,18,"F"); LAY = 0; limb(13,11,16,16); hnd(18,17,"N",1); orient = "fwd"; }
    else if (pose==="type"||pose==="type2"){ const k = pose==="type2" ? 1 : 0; LAY = 1; limb(1,11,12,14); hnd(14,15-k,"F"); LAY = 0; add(13,11,2,3,sl); limb(13,13,15,14); hnd(17,14+k,"N"); }
    else if (pose==="handsup"){ add(13,10,3,2,sl); add(15,3,2,8,sl); hnd(15,1,"N"); add(0,10,3,2,sl); add(-1,3,2,8,sl); hnd(-1,1,"F"); }
    else if (pose==="lift"){ add(13,10,3,2,sl); add(15,-3,2,14,sl); hnd(15,-5,"N"); add(0,10,3,2,sl); add(-1,-3,2,14,sl); hnd(-1,-5,"F");
      if (HOLDP.has(PP.item)) holdProp(add, PP.item, PP.col, 0, -24); else if (PP.item) putItem(add, PP.item, 7, -5, "up", PP.col); }
    else if (pose==="clutch"){ add(1,11,2,4,sl); add(13,11,2,4,sl); add(3,13,3,2,sl); add(10,13,3,2,sl); hnd(5,11,"F"); hnd(9,11,"N"); }
    else if (climb){ const k = pose==="climb2"; add(1,k?7:4,2,k?5:8,sl); hnd(1,k?5:2,"F"); add(13,k?4:7,2,k?8:5,sl); hnd(13,k?2:5,"N"); }
    else { P1(); armDown(13, pose==="walk1"?-1:0, 1); if (PP.item){ one(); orient = "down"; } }
    // 手上的東西（只有單手的動作；雙手的在上面畫了）
    const itemName = PP.item || dflt;
    if (itemName && H && !ARM2.has(pose)){ const hp = parts[H.i]; const len = putItem(add, itemName, hp[0], hp[1], orient, PP.col || (itemName==="cup" ? L.cupColor : null));
      if (pose==="pour"){ const tx = hp[0] + 2 + len; add(tx,hp[1]+2,1,1,"#9fd0ff"); add(tx,hp[1]+4,1,2,"#9fd0ff"); } }
    // 另一隻手拿的東西（& 後面那個）：垂著的那隻手提著
    if (PP.item2 && H2 && H2 !== H && !ARM2.has(pose)){ const hp = parts[H2.i]; putItem(add, PP.item2, hp[0], hp[1], ITEMS[PP.item2] && (ITEMS[PP.item2].seg || /^(bag|case|bucket|umbrella|gun)$/.test(PP.item2)) ? "down" : "up", PP.col2); }
    if (mirror){ for (let i=A0;i<parts.length;i++) parts[i][0] = 16 - parts[i][0] - parts[i][2]; hands.forEach(h => h.tag = h.tag==="N" ? "F" : "N"); }
    // 手上的記號（例如刺青）：look.handMark = { hand:"right"|"left", c:顏色 }
    if (L.handMark && !L.gloves){ const want = (((L.handMark.hand === "left") === (facing > 0)) !== !!L.back) ? "N" : "F"; hands.filter(h => h.tag === want).forEach(h => { const hp = parts[h.i]; add(hp[0] + (hp[2] > 2 ? 1 : 0), hp[1], 1, 1, L.handMark.c || "#2a3a5a"); }); }
    const armEnd = parts.length;
    // 頭（Q 版大頭：12×11，比身體寬；耳朵、臉頰陰影、頭髮亮面）
    add(2,-1,12,11,skin); add(1,3,1,3,shade(skin,-.08)); add(14,3,1,3,shade(skin,-.15));
    const hs = L.hairStyle||"short", hl = shade(hair,.28), hd = shade(hair,-.25);
    if (hs==="long"){ add(1,-2,14,3,hair); add(1,-1,2,18,hair); add(13,-1,2,18,hair); add(1,8,1,9,hd); add(4,-2,5,1,hl); }
    else if (hs==="bob"){ add(1,-2,14,3,hair); add(1,-1,2,9,hair); add(13,-1,2,9,hair); add(2,1,3,1,hair); add(4,-2,5,1,hl); }
    else if (hs==="pony"){ add(2,-2,12,3,hair); add(2,0,1,3,hair); add(14,-1,3,9,hair); add(15,1,1,6,hd); add(4,-2,5,1,hl); }
    else if (hs==="bun"){ add(2,-2,12,3,hair); add(2,0,1,3,hair); add(13,0,1,3,hair); add(6,-5,4,3,hair); add(7,-5,2,1,hl); }
    else if (hs==="bald"){ add(3,-1,10,1,shade(skin,.12)); add(2,2,1,3,shade(hair,.1)); add(13,2,1,3,shade(hair,.1)); }
    else if (hs==="balding"){ add(2,1,1,4,hair); add(13,1,1,4,hair); add(5,-1,5,1,shade(skin,.15)); }
    else if (hs==="slick"){ add(2,-2,12,2,hair); add(2,-2,2,5,hair); add(12,-2,2,4,hair); add(5,-2,6,1,hl); add(9,-1,3,1,hd); }
    else if (hs==="spiky"){ add(2,-2,12,3,hair); add(3,-3,2,1,hair); add(7,-4,2,2,hair); add(11,-3,2,1,hair); add(2,0,1,3,hair); add(13,0,1,3,hair); add(5,-2,3,1,hl); }
    else { add(2,-2,12,3,hair); add(2,0,1,3,hair); add(13,0,1,3,hair); add(4,-2,5,1,hl); add(10,0,3,1,hd); }
    if (L.hood){ add(1,-3,14,4,L.hood); add(1,-3,2,12,L.hood); add(13,-3,2,12,L.hood); add(3,-3,9,1,shade(L.hood,.15)); }
    if (L.hat==="douli"){ add(-1,-3,18,2,"#c9a35a"); add(4,-5,8,2,"#c9a35a"); add(7,-6,2,1,"#c9a35a"); add(0,-2,16,1,"#a8843a"); }
    if (L.hat==="cap"){ add(2,-3,12,3,L.capColor||"#c23a2a"); add(12,-1,5,1,L.capColor||"#c23a2a"); add(4,-3,4,1,shade(L.capColor||"#c23a2a",.25)); }
    if (L.hat==="nurse"){ add(5,-4,6,2,"#ffffff"); add(7,-4,2,2,"#e04a3a"); }
    if (L.hat==="fedora"){ const hc = L.hatColor||"#4a3a2a"; add(0,-2,16,2,hc); add(3,-6,10,4,hc); add(3,-3,10,1,"#2a1a10"); add(4,-6,4,1,shade(hc,.25)); add(7,-6,2,1,shade(hc,-.3)); }
    if (L.hat==="police"){ add(2,-4,12,4,"#24324e"); add(1,-1,14,1,"#1a2236"); add(7,-3,2,2,"#e6c34a"); add(3,-4,5,1,"#34446a"); }
    if (L.back){ add(2,-2,12,11, L.hood||hair); add(4,-2,5,1,hl); }
    // 臉：表情（L.mood：sad 傷心、worried 擔心、angry 生氣、shock 嚇到、tired 疲倦、smile 微笑、smug 得意）、眨眼、說話
    const ey = L.back ? -99 : 4, closed = pose==="cry"||pose==="clutch"||legs==="lie"||legs==="fall"||legs==="stumble"||L.blink, mood = L.mood || (pose==="cry" ? "sad" : pose==="clutch" ? "shock" : "");
    if (!L.back){
      add(3,8,10,1,shade(skin,-.12)); add(12,1,1,7,shade(skin,-.1)); add(8,5,1,2,shade(skin,-.16));
      const bc = shade(hair,-.15);
      if (mood==="angry"){ add(4,2,2,1,bc); add(6,3,1,1,bc); add(9,3,1,1,bc); add(10,2,2,1,bc); }
      else if (mood==="sad"||mood==="worried"){ add(4,3,1,1,bc); add(5,2,2,1,bc); add(9,2,2,1,bc); add(11,3,1,1,bc); }
      else if (mood==="shock"){ add(4,1,3,1,bc); add(9,1,3,1,bc); }
      else { add(4,2,2,1,bc); add(10,2,2,1,bc); }
    }
    if (L.sunglasses){ add(3,ey-1,10,3,"#111"); add(4,ey-1,2,1,"#5a6a7a"); }
    else if (pose!=="cry" && !L.back) {
      if (closed){ add(4,ey+1,3,1,INK); add(9,ey+1,3,1,INK); }
      else if (mood==="shock"){ add(4,ey-1,3,3,"#ffffff"); add(9,ey-1,3,3,"#ffffff"); add(5,ey,1,1,INK); add(10,ey,1,1,INK); }
      else if (mood==="tired"){ add(4,ey,3,1,shade(skin,-.3)); add(9,ey,3,1,shade(skin,-.3)); add(5,ey+1,1,1,INK); add(10,ey+1,1,1,INK); add(4,ey+2,3,1,shade(skin,-.2)); add(9,ey+2,3,1,shade(skin,-.2)); }
      else { add(5,ey,1,2,INK); add(10,ey,1,2,INK); add(4,ey,1,2,"#ffffff"); add(11,ey,1,2,"#ffffff"); }
      if (L.glasses){ add(3,ey-1,4,1,"#7a7a7a"); add(9,ey-1,4,1,"#7a7a7a"); add(7,ey-1,2,1,"#7a7a7a"); add(3,ey-1,1,3,"#7a7a7a"); add(12,ey-1,1,3,"#7a7a7a"); }
    }
    const mc = L.mouth||shade(skin,-.4);
    if (L.back) {}
    else if (L.mask){ add(3,6,10,3,L.mask); add(3,6,10,1,shade(L.mask,.15)); }
    else if (pose!=="drink"&&pose!=="smoke"&&pose!=="eat"){
      if (L.talk){ add(7,7,2,2,"#5a2424"); add(7,8,2,1,"#c25a5a"); }
      else if (mood==="sad"){ add(6,8,1,1,mc); add(7,7,2,1,mc); add(9,8,1,1,mc); }
      else if (mood==="worried"){ add(7,7,2,1,mc); add(9,8,1,1,mc); }
      else if (mood==="angry") add(6,7,4,1,mc);
      else if (mood==="shock") add(7,7,2,2,"#3a1a1a");
      else if (mood==="smile"){ add(6,7,1,1,mc); add(7,8,2,1,mc); add(9,7,1,1,mc); }
      else if (mood==="smug"){ add(7,7,2,1,mc); add(9,6,1,1,mc); }
      else add(7,7,2,1,mc);
    }
    if (!L.back && (mood==="sad" && L.tear || pose==="cry")){ add(5,6,1,2,"#9fd0ff"); add(10,6,1,2,"#9fd0ff"); }
    if (!L.back && L.sweat){ add(14,0,1,2,"#9fd0ff"); add(13,2,1,1,"#9fd0ff"); }
    if (L.beard){ add(3,6,10,3,shade(hair,.15)); add(6,7,4,1,shade(skin,-.3)); }
    if (L.bruise){ add(10,5,2,2,"#7a4a8a"); add(11,6,1,1,"#5a3a6a"); }
    if (old) { add(4,6,2,1,shade(skin,-.15)); add(10,6,2,1,shade(skin,-.15)); add(6,0,4,1,shade(skin,-.1)); }
    if (L.blush){ add(4,6,1,1,"#e88a8a"); add(11,6,1,1,"#e88a8a"); }
    // 手如果舉到臉前面（喝東西、哭、講電話……），要畫在臉上面
    for (let i=legEnd;i<armEnd;i++) if (parts[i][1] < 10 && pose!=="stand" && !/walk/.test(pose)) parts.push(parts[i].slice());
    if (L.cane && !low) add(15,10,1,16,"#6b4a2b");
    if (L.case && !low) add(14,17,6,5,"#4a3424");
    if (L.wet){ add(2,17,1,2,"#7fb6ff"); add(13,18,1,2,"#7fb6ff"); }
    if (L.bandage) add(1,18,2,1,"#f4f6f6");
    if (L.bob && !low) for (let i=legEnd;i<parts.length;i++) parts[i][1] -= 1;
    if (L.shake) parts.forEach(p=>p[0] += L.shake);
    // 外框 → 本體（kneel/sit 下沉 4 格；fall 斜倒；lie 橫躺）
    const rot = legs==="lie" ? 90 : legs==="prone" ? -90 : legs==="fall" ? 35 : legs==="stumble" ? -35 : 0;
    const drop = low ? 4 : 0, q = snap(s), rr = v => RES > 1 ? Math.round(v*RES)/RES : Math.round(v), Rq = RES > 1 ? RAW : R;
    if (rot){ g.save(); g.translate(Math.round(x), Math.round(y - (Math.abs(rot)>=90?8*q:0))); g.rotate(-facing*rot*Math.PI/180); }
    const ox = rot ? -8*q : rr(x - 8*q), oy = rot ? -27*q + drop*q : rr(y - 27*q + drop*q);
    const F = (px,py,w,h,c) => Rq(ox + (facing>0?px:16-px-w)*q, oy+py*q, w*q, h*q, c);
    [0,1].forEach(lay => { const ps = parts.filter(p => (p[5]||0) === lay);
      ps.forEach(([px,py,w,h]) => F(px-1,py-1,w+2,h+2,INK));
      ps.forEach(p => F(p[0],p[1],p[2],p[3],p[4]));
      if (!L.flat) ps.forEach(([px,py,w,h,c]) => { if (w>=3 && h>=3 && c && c[0]==="#" && c.length===7){ F(px+w-1,py,1,h,shade(c,-.3)); F(px,py,1,Math.min(h,2),shade(c,.18)); } }); });
    if (rot) g.restore();
    else Rq(ox+2*q, rr(y)-1*q, 12*q, 1*q, "#00000040");
    return { x: Math.round(x-9*q), y: Math.round(y-29*q+drop*q), w: Math.round(18*q), h: Math.round((29-drop)*q) };
  }

  /* ---------- 狗（側面，大約 21×14；look.kind:"dog"）。姿勢：stand walk1 walk2 sit lie sniff ---------- */
  function dog(x, y, L, s=1, facing=1, pose){
    const p = parsePose(pose), ps = p.legs !== "stand" ? p.legs : p.arm;
    const c = L.coat || L.top || "#e8d5a8", dk = shade(c,-.22), far = shade(c,-.12), parts = [], add = (px,py,w,h,cc) => parts.push([px,py,w,h,cc]);
    if (ps==="sit"){ add(1,13,3,1,c); add(3,7,7,7,c); add(7,3,6,9,c); add(11,8,2,6,c); add(8,9,2,5,far); add(11,-2,5,5,c); add(15,0,3,2,c); add(17,0,1,1,INK); add(13,-1,1,1,INK); add(11,-2,2,3,dk); add(10,3,3,1,L.collar||"#c23a2a"); }
    else if (ps==="lie"||ps==="fall"){ add(0,11,2,1,c); add(2,9,12,5,c); add(13,13,6,1,c); add(13,7,5,5,c); add(17,10,3,2,c); add(19,10,1,1,INK); add(15,9,2,1,INK); add(13,7,2,3,dk); }
    else { const sn = ps==="sniff", a = ps==="walk1" ? 1 : ps==="walk2" ? -1 : 0;
      add(6+a,10,2,4,far); add(10-a,10,2,4,far);
      add(1,4,2,1,c); add(0,3,1,1,c); add(3,5,11,5,c); add(4-a,10,2,4,c); add(12+a,10,2,4,c);
      if (sn){ add(12,6,3,5,c); add(14,9,5,4,c); add(18,11,3,2,c); add(20,11,1,1,INK); add(16,10,1,1,INK); add(14,9,2,3,dk); }
      else { add(12,3,3,5,c); add(13,0,5,4,c); add(17,2,3,2,c); add(19,2,1,1,INK); add(15,1,1,1,INK); add(13,0,2,3,dk); add(12,4,2,1,L.collar||"#c23a2a"); } }
    const q = snap(s), rr = v => RES > 1 ? Math.round(v*RES)/RES : Math.round(v), Rq = RES > 1 ? RAW : R;
    const ox = rr(x - 10*q), oy = rr(y - 14*q);
    const F = (px,py,w,h,cc) => Rq(ox + (facing>0?px:21-px-w)*q, oy+py*q, w*q, h*q, cc);
    parts.forEach(([px,py,w,h]) => F(px-1,py-1,w+2,h+2,INK));
    parts.forEach(p => F(...p));
    Rq(ox+2*q, rr(y)-1*q, 16*q, 1*q, "#00000040");
    return { x: Math.round(x-11*q), y: Math.round(y-17*q), w: Math.round(22*q), h: Math.round(17*q) };
  }

  /* ---------- 場景 ---------- */
  const SCENES = {
    farm(o){ const ph=o.phase||0;
      if (ph===0){ sky("#0d1220","#26324a"); } else if (ph===1){ sky("#8e9aa6","#c7cdd2"); } else if (ph===3){ sky("#3a2a3a","#c27a4a"); } else sky("#7fa8c9","#d9e6ee");
      hills(40, ph===0?"#1d2a24":"#3f6b3a", ph===0?"#16201b":"#355c31"); teaRows(48, ph===0?"#22382a":"#4f8a44", ph===0?"#2e4a37":"#6aa85a");
      // 車庫
      R(2,48,42,26,ph===0?"#3d3a36":"#8a8a82"); R(0,45,46,4,ph===0?"#2a2826":"#5a5a52"); R(8,54,30,20,ph===0?"#4a4742":"#a2a29a"); for(let y=56;y<74;y+=3) R(8,y,30,1,ph===0?"#3a3834":"#8e8e86");
      // 主屋
      R(70,34,70,40,ph===0?"#4a4038":"#bfae94"); R(66,30,78,6,ph===0?"#3a2a22":"#7a3a2a"); for(let i=0;i<4;i++) windowBox(76+i*16,44,9,9, ph===0?"#ffd98a":"#9cc5e6");
      door(100,60,10,14,"#5a3e24"); R(70,38,5,3,"#e9e4da"); P(71,39,"#e04a3a");
      // 製茶房
      R(150,46,38,28,ph===0?"#3d3530":"#9a8a74"); R(147,42,44,5,ph===0?"#2a221e":"#5a4a3a"); windowBox(160,54,8,7, ph===0?"#f2a84c":"#7d8a92"); R(172,40,4,8,"#6a5a4a");
      floor(74, ph===0?"#2f2a22":"#8a7a5a");
      if (ph===3){ [80,96,112,128].forEach(x=>OBJ.lantern(x,30)); }
      if (ph===0) rain(110); else if (ph===1) rain(40,"#c9d4dc");
      if (ph<=1){ OBJ.tape(146,72,44); OBJ.car(52,80,"#e9e4da"); R(52,89,40,2,"#2a3a6a"); R(65,78,4,2,"#e04a3a"); R(69,78,4,2,"#3a6ae0"); if(ph===0){ dither(55,70,14,8,"#e04a3a66",2); dither(69,70,14,8,"#3a6ae066",2); } }
    },
    police(){ wall(66,"#c9c4b4",false); R(0,60,W,6,"#8a8a80"); windowBox(14,14,30,20,"#9cc5e6"); R(60,10,40,26,"#3f5a7a"); sign(62,12,36,"#3f5a7a","#e9e4da");
      R(120,12,50,30,"#e9e4da"); for(let i=0;i<5;i++) R(124+i*9,16,7,10,["#f1ead8","#f6d6d6","#d6e6f6"][i%3]); R(140,30,2,8,"#d23a3a"); R(155,26,2,10,"#d23a3a");
      floor(74,"#9a9a90","#8a8a80"); OBJ.desk(20,70,60); OBJ.monitor(34,56,18,12); OBJ.paper(60,62,10,8,2); OBJ.desk(110,70,60); OBJ.phone(150,58); OBJ.paper(118,58,14,12,3); R(176,40,14,30,"#5a6a7a"); R(178,44,10,2,"#3a4a5a"); R(178,54,10,2,"#3a4a5a"); },
    lab(){ wall(74,"#d6e2e2",false); for(let i=0;i<4;i++) R(10+i*46,8,30,14,"#eef6f6"); R(0,40,W,2,"#9ab0b0");
      floor(74,"#c2cccc","#b2bcbc"); R(0,62,W,12,"#e9eeee"); R(0,62,W,2,"#9ab0b0"); OBJ.microscope(30,45); R(60,52,8,10,"#7fb6d8"); R(70,55,6,7,"#d8a07f"); R(78,54,6,8,"#a0d87f"); OBJ.monitor(130,42,26,16); R(170,40,14,22,"#bcc8c8"); },
    office(){ sky("#9cc5e6","#d9e6ee",74); seed=5; for(let i=0;i<12;i++){ const h=20+rnd()*40; R(i*17,74-h,15,h,"#7a8a9a"); for(let j=74-h+3;j<70;j+=5) R(i*17+3,j,9,2,"#c9d8e6"); }
      R(0,0,W,4,"#2a2e36"); for(let x=0;x<W;x+=48) R(x,0,3,74,"#2a2e36"); floor(74,"#3a3e46","#34383f"); OBJ.desk(100,70,70); OBJ.monitor(120,56,22,12); OBJ.plant(20,68); OBJ.paper(150,60,14,10,3); R(158,66,4,4,"#c23a2a"); },
    shop(o = {}){ wall(74,"#a8865a",true); OBJ.shelf(10,20,80,4,["#3f5b2a","#c9a35a","#8a3a2a","#e9e4da"]); OBJ.shelf(110,20,74,4,["#6a8a4a","#b4a78c","#5a3e24"]);
      R(60,8,70,10,"#5a2a1e"); sign(62,9,66,"#5a2a1e","#f2d03b"); floor(74,"#6b4a2b","#5a3e24"); R(20,62,150,12,"#7a5533"); R(20,62,150,2,"#9a6a3a"); if (!o.noCar) OBJ.car(150,52,"#7a8a6a"); R(91,22,18,20,"#3a2a1a"); R(93,24,14,14,"#cbb894"); R(95,30,10,6,"#7a8a8a"); R(97,26,3,4,"#e8c8a8"); R(93,39,14,1,"#e9e4da"); },
    lawyer(){ wall(74,"#5a3a2a",false); OBJ.shelf(8,14,70,5,["#7a2a2a","#2a3a6a","#2a5a3a","#b49a5a"]); windowBox(110,14,40,26,"#c9d8e6"); R(108,40,44,3,"#6b4a2b");
      floor(74,"#4a3020","#3f281a"); OBJ.desk(100,70,80); OBJ.paper(120,62,14,8,2); R(160,58,2,12,"#c9a35a"); R(156,58,10,2,"#c9a35a"); R(140,62,14,8,"#2a5a8a"); R(142,63,10,1,"#e9e4da"); },
    hospital(){ wall(74,"#e6ecea",false); R(0,44,W,3,"#7fb6a8"); for(let i=0;i<3;i++) door(20+i*60,40,16,34,"#cfd8d6"); sign(70,10,52,"#2f7a6a","#ffffff");
      floor(74,"#d2dad8","#c2cac8"); R(150,60,30,6,"#e9eeee"); R(152,66,2,8,"#9aa"); R(176,66,2,8,"#9aa"); R(158,52,12,9,"#8a6a3a"); R(159,53,10,7,"#f4f6f6"); R(160,55,7,1,"#888"); R(160,57,5,1,"#888"); },
    shark(){ wall(74,"#3a2a2a",true); R(40,6,110,14,INK); for(let i=0;i<9;i++) R(46+i*11,9,8,8,["#ff4a8a","#ffd04a"][i%2]); dither(40,20,110,6,"#ff4a8a33",3);
      R(20,40,150,4,"#7a6a5a"); for(let x=24;x<170;x+=8) R(x,24,1,16,"#9a9a9a"); floor(74,"#2a2222","#241c1c"); R(20,44,150,30,"#5a4a3a"); R(30,30,8,8,"#e6c34a"); R(140,28,10,10,"#9ab0c8"); R(60,40,14,5,"#f1ead8"); R(70,41,3,3,"#c23a2a"); R(118,40,8,4,"#222"); R(119,41,6,2,"#5aa0d8"); },
    care(){ sky("#9ac8e8","#e8f0d8"); hills(46,"#6aa85a","#5a985a"); R(20,30,90,36,"#efe2c8"); R(16,26,98,5,"#b45a3a"); for(let i=0;i<4;i++) windowBox(28+i*20,40,10,10,"#9cc5e6"); door(58,52,12,14,"#8a6338");
      floor(70,"#8ab06a"); R(76,64,16,3,"#8a6338"); R(78,66,2,5,"#6a4a2a"); R(88,66,2,5,"#6a4a2a"); R(78,61,10,3,"#2f5a8a"); R(79,61,8,1,"#e9e4da"); R(130,58,40,4,"#8a6338"); R(134,62,2,6,"#5a3e24"); R(164,62,2,6,"#5a3e24"); OBJ.plant(120,66); OBJ.plant(178,66); },
    taipei(){ wall(74,"#e6ecea",false); R(0,0,W,6,"#d23a3a"); sign(64,10,64,"#d23a3a","#ffffff"); R(10,30,40,30,"#cfe0ea"); R(60,40,70,4,"#9ab"); R(150,24,30,40,"#bcd");
      floor(74,"#c8d2d0","#b8c2c0"); R(70,58,50,6,"#e9eeee"); R(72,64,2,10,"#999"); R(116,64,2,10,"#999"); },
    // ---- 證物場景 ----
    tearoom(o){ const night = o.night!==false; wall(70, night?"#3d342c":"#7a6a58", true);
      R(0,0,W,14,night?"#2a221c":"#5a4a3a"); R(0,14,W,2,"#6b4a2b"); R(44,16,14,6,"#4a3a2a");
      // 重播用的時間點（秒）：takeAt/backAt 秤錘被拿走／放回去、hotAt 焙茶機調高、bagAt 茶葉袋掉下來、bloodAt/wipeAt 地上的血出現／被擦掉
      const tt = o.t||0, after = k => o[k] !== undefined && tt >= o[k], rp = !!o.replay;
      if (!(rp && after("bagAt"))) OBJ.teaBag(46,12);
      OBJ.stove(8,48,!!o.ash); OBJ.ladder(60,16,54); OBJ.dryer(76,46, rp && o.hotAt !== undefined ? after("hotAt") : o.hot!==false);
      OBJ.rack(130,40, rp && o.takeAt !== undefined ? (!after("takeAt") ? false : !after("backAt") ? "off" : true) : true); windowBox(170,26,14,14, night?"#1d2a3a":"#9cc5e6");
      floor(70, night?"#4a4238":"#8a7a64");
      if (rp){ if (after("bloodAt")){ if (after("wipeAt")) dither(134,73,18,8,"#6a6258",2); else OBJ.blood(136,74,14); } if (after("bagAt")) OBJ.teaBag(54,73); }
      if (!o.replay){
      if (o.body!==false) OBJ.outline(54,84);
      OBJ.blood(136,74,14); OBJ.blood(60,86,8,"#5a1612"); OBJ.teaBag(52,80); OBJ.hair(108,80);
      OBJ.marker(132,72,1); OBJ.marker(104,78,2); OBJ.marker(70,80,3);
      for(let x=140;x>70;x-=6) R(x,82+((140-x)/12),3,1,"#6a5440"); }
      if (o.lumi){ dither(132,70,22,10,"#4adfff",2); dither(136,40,18,10,"#4adfff",3); }
      lamp(96,0, night?"#ffd98a":"#fff2c8"); if (!o.replay) OBJ.tape(0,100,W);
    },
    tearoomWindow(){ SCENES.tearoom({body:false}); R(160,22,30,24,"#0d1220"); windowBox(166,24,16,18,"#1d2a3a"); R(166,24,8,18,"#0d1220"); rain(30); dither(160,60,30,8,"#7fb6ff",3); },
    stove(o){ wall(70,"#4a3e34",true); floor(70,"#5a4e40"); OBJ.stove(70,48,true); OBJ.marker(116,72,1); lamp(40,0); },
    body(){ floor(0,"#4a4238"); OBJ.paper(20,14,30,40,0); R(30,24,12,4,"#888"); R(30,26,4,2,"#ddd"); R(38,26,4,2,"#ddd"); R(70,20,24,8,"#c9a35a"); R(70,22,4,4,"#9a7a3a"); P(90,24,"#e9e4da"); OBJ.phone(120,14); OBJ.marker(20,64,1); OBJ.marker(70,64,2); OBJ.marker(120,64,3); },
    dining(){ wall(66,"#bfae94",true); windowBox(20,16,24,18,"#1d2a3a"); floor(66,"#7a5a3a","#6a4a2a"); R(60,70,60,6,"#8a5a3a"); R(64,76,4,14,"#6a4a2a"); R(112,60,4,16,"#6a4a2a");
      seed=9; for(let i=0;i<14;i++) R(40+rnd()*110,80+rnd()*20,3,2,"#e9e4da"); R(80,64,8,4,"#e9e4da"); R(96,64,8,4,"#e9e4da"); R(98,63,4,2,"#f2d03b");
      R(148,50,34,20,"#6b4a2b"); R(146,48,38,3,"#8a6338"); R(156,40,16,8,"#f1ead8"); R(156,40,16,2,"#e88aa8"); R(160,36,1,4,"#e9e4da"); R(166,36,1,4,"#e9e4da"); P(160,35,"#ffd04a"); P(166,35,"#ffd04a"); },
    backdoor(){ wall(70,"#bfae94",true); door(80,24,22,46,"#6b4a2b"); R(78,70,26,4,"#5a5a52"); R(84,71,3,2,"#5a3a24"); R(92,72,3,2,"#5a3a24"); R(88,74,3,2,"#5a3a24"); R(94,71,1,1,"#3f5b2a");
      floor(74,"#9a9a8a","#8a8a7a"); OBJ.basket(130,60); R(20,40,30,30,"#e9eeee"); R(24,44,22,22,"#bcc"); OBJ.marker(86,78,1); },
    laundry(){ wall(70,"#d6dad2",true); R(20,36,34,34,"#e9eeee"); R(28,44,18,18,"#9ab"); R(30,46,14,14,"#cde"); floor(70,"#aab0a8","#9aa098"); OBJ.basket(90,56); R(96,52,14,8,"#8d9196"); R(108,54,3,2,"#5b2a1e"); OBJ.marker(120,66,1); },
    stairs(){ wall(108,"#bfae94",true); for(let i=0;i<8;i++) R(40+i*14,96-i*11,40,4,"#7a5533"); for(let i=0;i<8;i++){ R(40+i*14,92-i*11,40,4,"#8a6338"); }
      [[56,90],[72,79],[86,68],[100,57]].forEach(([x,y])=>{ R(x,y,4,2,"#5a3a24"); P(x+1,y-1,"#2a2a1a"); }); OBJ.marker(64,84,1); lamp(150,0); },
    pool(o){ sky("#8e9aa6","#c7cdd2"); hills(30,"#3f6b3a","#355c31"); floor(56,"#9a4a2c"); dither(0,56,W,30,"#7a3a20",3);
      OBJ.pool(30,66,110,28,o.drained); OBJ.gate(146,60); if (o.quiet) return; if(!o.drained){ OBJ.stone(20,90,true); OBJ.flashlight(160,94); OBJ.marker(18,96,1); OBJ.marker(170,92,2); }
      else { R(70,84,6,3,"#c9c9c9"); R(76,85,3,1,"#3a3a3a"); OBJ.marker(64,90,1); } OBJ.tape(0,104,W); },
    rack(o){ wall(74,"#bfae94",true); door(150,24,24,50,"#6b4a2b"); floor(74,"#9a8a74","#8a7a64"); OBJ.coatRack(40,30,true); for(let i=0;i<6;i++) P(44+i*2,76+i%2,"#7fb6ff"); OBJ.marker(44,80,1); },
    study(o){ wall(70,"#6a5040",true); OBJ.shelf(130,14,56,4,["#7a2a2a","#2a3a6a","#b49a5a"]); windowBox(20,14,30,22,"#1d2a3a"); floor(70,"#5a3e24","#4a3020");
      OBJ.desk(40,64,80); R(50,68,30,10,"#7a5533"); if(o.pried){ R(52,70,26,6,INK); R(60,68,10,2,"#c9a77a"); OBJ.knife(90,62); R(84,56,10,8,"#c9a35a"); R(86,58,6,4,"#f1ead8"); } else OBJ.paper(70,52,18,12,3); OBJ.marker(56,82,1); lamp(100,0); },
    garage(){ wall(70,"#7a7a72",false); for(let y=4;y<60;y+=4) R(10,y,90,2,"#8a8a82"); floor(70,"#5a5a52"); OBJ.car(110,48,"#c23a2a"); seed=4; for(let i=0;i<8;i++) OBJ.cig(20+rnd()*70,80+rnd()*16); OBJ.paper(150,40,12,14,3); },
    hut(){ wall(70,"#6a5a48",true); windowBox(30,18,40,26,"#9a8a74"); R(32,20,18,22,"#5a4a3a"); R(54,22,12,18,"#3d3530"); floor(70,"#5a4a38"); R(100,58,70,10,"#8a7a5a"); R(100,68,70,6,"#6a5a48"); OBJ.desk(20,72,50); OBJ.bankbook(34,64); R(100,52,16,6,"#e9e4da"); R(148,55,12,7,"#c9b38a"); R(150,57,8,1,"#6a5a4a"); R(150,59,6,1,"#6a5a4a"); R(80,10,2,40,"#6a5a4a"); R(76,50,10,3,"#3f5b2a"); },
    xinroom(){ wall(70,"#d8c8b8",true); windowBox(140,14,30,24,"#9cc5e6"); R(146,40,18,2,"#6b4a2b"); R(150,32,10,8,"#f1ead8"); floor(70,"#8a6a4a","#7a5a3a"); OBJ.suitcase(30,58); R(80,52,60,20,"#e9e4da"); R(80,50,60,4,"#c9b8a8"); R(100,66,14,10,"#bcd"); OBJ.paper(112,58,10,12,3); },
    receipt(){ floor(0,"#6b4a2b","#5a3e24"); R(50,14,90,70,"#f1ead8"); R(50,14,90,70,"#f1ead8"); R(54,18,8,8,"#3f8a4a"); for(let i=0;i<9;i++) R(66,22+i*6,60-(i%3)*10,1,"#aaa"); R(50,14,90,4,"#e0d6c0"); },
    doc(o){ floor(0,"#6b4a2b","#5a3e24"); OBJ.paper(40,8,70,90,14); if(o.stamp) { R(90,74,14,14,"#c23a2a"); R(92,76,10,10,"#f1ead8"); R(94,78,6,6,"#c23a2a"); } if(o.photo){ R(124,20,40,30,"#f1ead8"); R(127,23,34,24,"#7a8a9a"); R(138,28,8,12,"#e8b98f"); } R(130,70,30,4,"#2a2a2a"); R(158,69,4,6,"#c9a35a"); },
    monitor(o){ wall(108,"#2a2a2e",false); OBJ.monitor(40,14,112,66); const c="#9fd49f"; for(let i=0;i<6;i++) R(48,24+i*8,40+(i%3)*20,2,c); R(46,18,8,3,"#e04a3a"); R(120,84,40,8,"#3a3a3e"); },
    dashcam(o){ sky("#0d1220","#26324a",108); R(0,60,W,48,"#2a2a26"); R(60,30,70,40,"#3a3430"); windowBox(70,40,8,8,"#ffd98a"); dither(0,60,W,48,"#ffd98a22",4);
      for(let i=0;i<40;i++) R(80+i*2,70+i/2,2,2,"#ffd98a"); if (!o.anim) person(140,92,{skin:"#c9a080",top:"#8a8e94",bottom:"#2a2f3a",hair:"#8a8e94",hood:"#8a8e94",hairStyle:"short",back:true},1,-1); rain(120);
      R(4,4,30,6,INK); R(6,5,4,4,"#e04a3a"); for(let i=0;i<5;i++) R(12+i*4,6,3,2,"#e9e4da"); },
    // ---- 茶園的房間 ----
    living(o){ const ph=o.phase||0, night=ph===0;
      wall(70,"#b8a58a",false); R(0,52,W,18,"#8a6a4a"); R(0,52,W,1,"#6b4a2b"); floor(70,"#7a5a3a","#6a4a2a");
      door(8,24,18,46,"#5a3e24"); OBJ.coatRack(30,28, ph===1);
      R(74,54,30,16,"#6b4a2b"); R(72,52,34,3,"#8a6338"); R(78,49,10,3,"#e9e4da"); P(78,49,"#3f8a4a"); OBJ.monitor(92,38,12,8);
      if (ph>=3){ R(112,16,36,26,"#2a2220"); R(116,20,12,14,"#e9e4da"); R(132,20,12,14,"#e9e4da"); R(119,23,6,7,"#c9a080"); R(135,23,6,7,"#c9a080"); R(116,18,28,2,INK);
        R(114,44,2,6,"#e9e4da"); R(144,44,2,6,"#e9e4da"); P(114,43,"#ffd04a"); P(145,43,"#ffd04a"); R(124,44,12,4,"#e9e4da"); P(126,43,"#f2d03b"); P(131,43,"#f2d03b"); }
      else windowBox(116,18,26,18, night?"#1d2a3a":"#9cc5e6");
      R(108,60,42,10,"#7a2a2a"); R(108,54,42,7,"#6a2222"); R(106,56,4,14,"#5a1a1a"); R(148,56,4,14,"#5a1a1a");
      R(170,46,20,24,"#2a1f18"); R(170,46,20,2,"#5a3e24");
      for(let i=0;i<7;i++){ R(156+i*5,66-i*8,40,3,"#8a6338"); R(156+i*5,69-i*8,40,5,"#6b4a2b"); } R(154,14,2,56,"#5a3e24");
      R(38,4,8,4,"#e9e4da"); R(44,6,3,2,INK); P(39,5,"#e04a3a");
      lamp(90,0, night?"#ffd98a":"#fff2c8"); if (night) dither(0,0,W,H,"#00000022",3); },
    backhall(o){ const ph=o.phase||0; wall(70,"#d6dad2",true); floor(70,"#aab0a8","#9aa098");
      door(12,24,20,46,"#6b4a2b"); R(10,70,26,4,"#5a5a52"); if (ph<=1){ R(16,71,3,2,"#5a3a24"); R(24,72,3,2,"#5a3a24"); R(20,74,3,2,"#5a3a24"); P(26,71,"#3f5b2a"); }
      R(46,36,28,34,"#e9eeee"); R(46,36,28,6,"#cfd6d6"); R(53,46,14,14,"#9ab"); R(55,48,10,10,"#cde"); R(48,38,4,2,"#6fd46f");
      OBJ.basket(80,56); if (ph<=1){ R(84,50,16,8,"#8d9196"); R(96,52,3,2,"#5b2a1e"); }
      for(let i=0;i<9;i++){ R(116+i*9,98-i*10,34,3,"#8a6338"); R(116+i*9,101-i*10,34,7,"#6b4a2b"); }
      [[124,96],[133,86],[142,76],[151,66]].forEach(([x,y])=>{ R(x,y,3,1,"#7a5a3a"); P(x+1,y-1,"#2a2a1a"); }); R(112,10,2,90,"#5a3e24");
      lamp(80,0); },
    backyard(o){ const ph=o.phase||0;
      if (ph===0) sky("#0d1220","#26324a"); else if (ph===1) sky("#8e9aa6","#c7cdd2"); else sky("#7fa8c9","#d9e6ee");
      hills(30, ph===0?"#1d2a24":"#3f6b3a", ph===0?"#16201b":"#355c31");
      R(0,30,58,44,ph===0?"#4a4038":"#bfae94"); R(0,26,62,5,ph===0?"#3a2a22":"#7a3a2a"); door(30,50,12,24,"#6b4a2b"); windowBox(8,40,10,8, ph===0?"#ffd98a":"#9cc5e6");
      R(68,38,56,36,ph===0?"#3d3530":"#9a8a74"); R(65,34,62,5,ph===0?"#2a221e":"#5a4a3a"); door(90,52,12,22,"#5a3e24"); windowBox(74,46,10,8, ph===0?"#f2a84c":"#7d8a92"); R(110,30,4,8,"#6a5a4a");
      R(142,50,42,24,ph===0?"#4a3e30":"#8a7a5a"); R(139,46,48,5,ph===0?"#2a221a":"#5a4a32"); windowBox(148,56,10,8, ph===0?"#ffd98a":"#7d8a92"); door(168,58,9,16,"#5a3e24");
      floor(74, ph===0?"#2f2a22":"#7a5a3a"); dither(124,50,30,24,ph===0?"#3a3028":"#9a7a52",2);
      R(128,58,2,16,"#6b4a2b"); R(124,56,14,6,"#8a6338"); R(126,58,8,1,"#e9e4da");
      if (ph===0) rain(110); else if (ph===1) rain(40,"#c9d4dc"); if (ph<=1) OBJ.tape(66,72,62); },
    courtyard(o){ sky("#0d1220","#26324a"); R(0,50,W,24,"#3a3430"); dither(0,50,W,24,"#2a2622",3);
      R(6,30,60,44,"#4a4038"); R(2,26,68,5,"#3a2a22"); door(30,48,14,26,"#5a3e24"); windowBox(12,38,9,8,"#ffd98a"); windowBox(50,38,9,8,"#ffd98a");
      R(130,40,56,34,"#3d3530"); R(127,36,62,5,"#2a221e"); door(150,52,12,22,"#5a3e24"); windowBox(170,46,10,8,"#ffd98a"); sign(134,44,12,"#5a4a3a","#e9e4da");
      // 中間是一排茶樹籬笆和路燈（大門在畫面右邊外面）
      for(let x=74;x<124;x+=6){ R(x,62,7,12,"#2f4a2a"); P(x+2,63,"#3f6a3a"); } R(96,34,2,30,"#555b60"); R(92,32,10,3,"#6c7378"); dither(88,35,18,8,"#ffd98a44",2);
      floor(74,"#2f2a22","#2a2520"); rain(90); },
    road(o){ sky("#0d1220","#26324a",108); hills(30,"#1d2a24","#16201b"); R(0,62,W,46,"#2a2a26"); for(let x=0;x<W;x+=16) R(x,84,8,2,"#c9c9a0");
      R(160,20,3,44,"#555b60"); R(152,16,20,10,"#3a3e44"); R(156,19,6,4,"#9ab0c8"); P(168,20,"#e04a3a"); rain(100); },
    guestroom(o){ wall(108,"#c9b89a",true); windowBox(130,14,40,30,"#1d2a3a"); dither(130,14,40,30,"#9fb4c855",4); R(0,70,W,38,"#6b4a2b"); },
    audio(o){ R(0,0,W,H,"#101418"); R(66,6,60,96,"#222"); R(68,10,56,86,"#0d1a12"); R(86,14,20,2,"#3a3a3e");
      const t = o.t||0; for(let i=0;i<24;i++){ const h = 4+Math.abs(Math.sin(i*1.7+t*6)*Math.cos(i*.6+t*2.3))*30; R(71+i*2,52-h/2,1,h,"#6fd46f"); } R(70,80,52,2,"#3a3a3e"); R(70,80,Math.min(52,52*(o.p||0)),2,"#e04a3a"); R(92,86,8,6,"#e9e4da"); },
    // ---- 第 1 集：半山別墅 ----
    vhall(o){ wall(70,"#d8ccb4",false); R(0,50,W,20,"#a8865a"); R(0,50,W,1,"#6b4a2b"); floor(70,"#5a3a2a","#4a3020");
      door(8,22,20,48,"#4a2a1a"); R(30,8,6,4,"#e9e4da"); P(31,9,"#e04a3a");
      R(40,12,30,24,"#6b4a2b"); R(42,14,26,20,"#cbb894"); [[46,18],[54,17],[61,19]].forEach(([x,y],i)=>{ R(x,y,5,5,"#e8c8a8"); R(x-1,y+5,7,9,["#3a4a6a","#8a2a3a","#4a6a3a"][i]); });
      R(76,30,10,40,"#4a2a1a"); R(78,33,6,6,"#e9e4da"); P(81,35,INK); R(80,42,2,16,"#c9a35a"); R(79,56,4,4,"#c9a35a");
      R(96,58,54,12,"#2f4a6a"); R(96,52,54,7,"#24384f"); R(94,54,4,16,"#1d2f44"); R(148,54,4,16,"#1d2f44");
      R(90,82,52,4,"#3a2418"); R(94,86,3,12,"#2a1a10"); R(135,86,3,12,"#2a1a10"); R(100,79,6,3,"#111"); R(101,79,4,1,"#5aa0d8"); R(118,76,14,6,"#8a8e94"); R(119,77,12,4,"#cfe3f2"); R(116,82,18,1,"#6a6e74");
      for(let i=0;i<7;i++){ R(156+i*5,66-i*8,40,3,"#e9e4da"); R(156+i*5,69-i*8,40,5,"#8a6a4a"); } R(154,14,2,56,"#4a2a1a");
      R(108,0,1,8,INK); R(100,8,18,4,"#e6c34a"); dither(98,12,22,6,"#fff2c8",2); },
    /* 書房。書桌和桌上的東西是「前景」（SCENES.vstudy.front）：站在 y ≤ 84 的人在書桌後面。
       重演用的選項（秒數＝動畫開始後幾秒）：chair 畫椅子、dx 椅子和遺體往右移幾格、bucketAt/bucketUntil 冰桶在桌上的時間、
       pourAt 杯裡有酒、iceAt 杯裡有冰塊、glassOff/bottleOff:[從,到] 杯子／酒瓶被拿在手上、bodyAt 陳先生趴在桌上、noteAt 印表機旁有遺書 */
    vstudy(o){ wall(70,"#2f4a3a",false); dither(0,0,W,70,"#3a5a48",4); R(0,56,W,14,"#4a2a1a"); floor(70,"#3a2418","#30200f");
      const t = o.t||0, dx = o.dx||0, dead = o.bodyAt !== undefined ? t >= o.bodyAt : o.body !== false;
      OBJ.shelf(4,14,42,6,["#7a2a2a","#2a3a6a","#c9a35a","#e9e4da"]); R(2,4,46,2,"#4a2a1a");
      door(52,22,18,48,"#4a2a1a"); R(72,40,4,6,"#222"); P(73,41,"#6fd46f");
      R(84,14,40,26,"#4a2a1a"); R(86,16,36,22,"#e9e4da"); for(let i=0;i<4;i++) R(88,19+i*5,30-(i%2)*8,1,"#5a6a8a"); R(110,30,8,6,"#5a6a8a");
      windowBox(150,10,34,30,"#0d1220"); R(146,8,6,36,"#7a2a2a"); R(182,8,6,36,"#7a2a2a");
      R(60,80,120,22,"#6a2a2a"); dither(64,84,112,14,"#8a3a3a",3);
      R(146,58,42,4,"#5a3a2a"); R(148,62,3,10,"#4a2a1a"); R(183,62,3,10,"#4a2a1a"); R(150,50,22,8,"#d8d8d0"); R(152,48,18,2,"#b8b8b0"); R(154,46,12,3,"#f1ead8");
      if (o.noteAt === undefined || t >= o.noteAt){ R(174,53,12,5,"#f1ead8"); R(176,55,8,1,"#888"); }
      if (dead || o.chair) R(98+dx,56,18,32,"#5a2a1a");
      lamp(40,0); },
    vkitchen(o){ wall(66,"#e6e2d6",false); for(let x=0;x<W;x+=8) for(let y=30;y<66;y+=8) R(x,y,7,7,"#d6d2c6"); floor(66,"#9a9a90","#8a8a80");
      R(0,50,120,16,"#8a6a4a"); R(0,48,120,3,"#c9c4b4"); R(30,40,24,8,"#b8c0c8"); R(34,38,2,4,"#8a8e94"); R(44,42,8,6,"#c9d4dc"); R(45,43,6,4,"#e9f2f6"); dither(46,44,4,2,"#7fb6ff",2);
      R(70,10,10,26,"#5a3a2a"); [0,1,2,3].forEach(i=>{ R(72+i*2,6+(i%2)*2,1,8,"#cfd6dc"); }); R(70,20,10,16,"#4a2a1a");
      R(130,8,40,58,"#d8dcdc"); R(130,30,40,1,"#a8acac"); R(166,14,2,12,"#8a8e94"); R(166,36,2,12,"#8a8e94"); R(140,18,14,8,"#9ac0e0");
      R(176,20,14,46,"#5a2a1a"); for(let y=24;y<64;y+=6) for(let x=178;x<188;x+=4) R(x,y,3,3,["#7a2a3a","#3a5a2a","#c9a35a"][(x+y)%3]);
      lamp(60,0,"#fff2c8"); },
    vgarden(o){ sky("#0d1220","#26324a",70); R(0,20,W,50,"#c9b89a"); R(0,20,W,3,"#8a6a4a"); windowBox(30,30,22,18,o.lit?"#ffd98a":"#3a3a2a"); windowBox(120,30,22,18,"#ffd98a");
      R(70,30,14,40,"#5a3e24"); floor(70,"#2f4a2a","#2a4226"); R(20,66,44,8,"#4a3020"); for(let i=0;i<6;i++) R(22+i*7,60,3,6,"#e88aa8"); R(56,64,6,6,"#6a8a9a");
      R(150,30,4,44,"#555b60"); R(176,30,4,44,"#555b60"); R(154,34,22,2,"#6c7378"); R(154,40,22,30,"#3a4044"); for(let x=156;x<176;x+=4) R(x,40,1,30,"#555b60");
      R(96,80,40,4,"#6b4a2b"); R(98,84,2,8,"#4a3020"); R(132,84,2,8,"#4a3020"); OBJ.plant(10,94); OBJ.plant(184,94); },
    vsecurity(o){ wall(108,"#3a3e44",false); R(14,8,124,58,"#1a1c20");
      [[16,10],[54,10],[92,10],[16,38],[54,38],[92,38]].forEach(([x,y],i)=>{ R(x,y,36,26,"#0d1a12"); for(let j=0;j<26;j+=2) R(x,y+j,36,1,"#12261a");
        if (i===5){ seed=11; for(let k=0;k<60;k++) P(x+rnd()*36,y+rnd()*26,"#9a9a9a"); } else { R(x+4,y+16,28,6,["#3a4a3a","#2a3a2a","#3a3a3a","#2a2a2a","#3a3a4a"][i]); R(x+10+i*3,y+8,4,8,"#5a6a5a"); }
        R(x+2,y+2,10,2,"#9fd49f"); });
      R(0,72,W,36,"#2a2c30"); R(10,68,160,4,"#5a5e64"); R(14,72,3,30,"#4a4e54"); R(164,72,3,30,"#4a4e54"); R(40,62,22,6,"#d8d8d0"); R(44,63,14,1,"#888"); R(150,30,30,40,"#5a5e64"); R(154,34,22,14,"#3a3e44"); P(156,52,"#6fd46f"); P(160,52,"#e04a3a"); },
    vcorridor(o){ wall(70,"#e9e2d0",false); R(0,56,W,14,"#a8865a"); floor(70,"#8a6a4a","#7a5a3a");
      R(10,24,22,46,"#3a2a1a"); R(12,26,18,44,"#f1ead8"); dither(12,26,18,44,"#e6c34a33",3); sign(12,16,18,"#6b4a2b","#e9e4da");
      for(let i=0;i<6;i++){ R(40+i*6,60-i*8,30,10+i*8,"#7a5a3a"); R(40+i*6,60-i*8,30,2,"#a8865a"); R(40+i*6,62-i*8,30,1,"#5a3e24"); }
      for(let i=0;i<7;i++) R(40+i*6,58-i*8,1,6,"#4a2a1a"); R(40,14,1,44,"#4a2a1a"); R(40,14,52,2,"#5a3e24");
      R(170,26,20,44,"#5a3a2a"); R(160,40,8,4,"#c9a35a"); R(164,38,4,8,"#c9a35a"); lamp(110,0); },
    vstudyhall(o){ wall(70,"#2f4a3a",false); R(0,56,W,14,"#4a2a1a"); floor(70,"#3a2418","#30200f");
      door(86,20,22,50,"#4a2a1a"); R(110,40,5,7,"#222"); P(112,42,"#6fd46f"); sign(88,12,18,"#c9a35a","#4a2a1a"); R(10,24,24,46,"#2a1a10"); lamp(60,0); lamp(150,0); },
    vback(o){ wall(70,"#d6dad2",true); floor(70,"#9a9a90","#8a8a80"); door(84,20,24,50,"#5a3e24"); R(104,44,4,3,"#c9a35a"); R(80,70,32,4,"#5a5a52");
      for(let i=0;i<6;i++){ R(10+i*6,62-i*8,30,8+i*8,"#7a5a3a"); R(10+i*6,62-i*8,30,2,"#a8865a"); R(10+i*6,64-i*8,30,1,"#5a3e24"); } R(150,40,30,30,"#e9eeee"); R(156,46,18,18,"#bcc"); lamp(96,0); },
    vgate(o){ sky("#0d1220","#26324a",108); hills(40,"#1d2a24","#16201b"); R(0,64,W,44,"#3a3a36"); R(60,30,6,40,"#8a8a82"); R(126,30,6,40,"#8a8a82"); R(54,26,18,6,"#6a6a62"); R(120,26,18,6,"#6a6a62");
      if (!(o.openUntil && (o.t||0) < o.openUntil)){ R(66,44,60,2,"#555b60"); for(let x=68;x<126;x+=6) R(x,44,2,22,"#555b60"); }
      else { R(66,44,6,2,"#555b60"); for(let x=66;x<72;x+=3) R(x,44,1,22,"#555b60"); R(120,44,6,2,"#555b60"); for(let x=120;x<126;x+=3) R(x,44,1,22,"#555b60"); } dither(70,64,52,44,"#ffd98a18",3); R(52,34,8,4,"#e9e4da"); },
    chat(o){ R(0,0,W,H,"#2a2a2e"); R(62,4,68,100,"#111"); R(65,10,62,88,"#e9edf2"); R(65,10,62,8,"#5a7a9a"); R(70,12,30,3,"#e9e4da");
      R(96,24,28,10,"#8ad88a"); R(99,27,10,2,"#2a4a2a"); R(68,40,40,14,"#ffffff"); R(71,43,32,2,"#555"); R(71,47,24,2,"#555"); R(66,60,58,1,"#c9cdd2"); R(80,64,30,6,"#d8dce2"); },
    labresult(){ SCENES.lab(); OBJ.paper(84,40,26,34,9); },
    photo(){ wall(108,"#a8865a",true); R(50,10,92,80,"#5a3e24"); R(54,14,84,66,"#e8dcc0"); R(58,18,76,46,"#b8a888"); R(64,36,60,24,"#4a6a7a"); person(80,52,{skin:"#e8c8a8",top:"#d88a9a",bottom:"#6a5a7a",hair:"#2a1d16",hairStyle:"long",skirt:true},1);
      person(100,56,{skin:"#e8c8a8",top:"#e9e4da",bottom:"#4a5a8a",hair:"#2a1d16",hairStyle:"bob"},0.7); person(114,56,{skin:"#e8c8a8",top:"#3a7a4a",bottom:"#4a4a4a",hair:"#2a1d16"},0.75); for(let i=0;i<8;i++) R(60+i*9,70,6,1,INK); }
  };

  // 客房的書桌是前景：坐在書桌後面的人（y ≤ 96）被桌面和筆電擋住
  SCENES.guestroom.frontY = 96;
  SCENES.guestroom.front = ()=>{ R(40,62,112,6,"#8a6338"); R(44,68,4,30,"#5a3e24"); R(144,68,4,30,"#5a3e24"); R(60,54,24,8,"#2a2a2e"); R(62,55,20,6,"#5aa0d8"); R(110,56,10,6,"#e9e4da"); };
  // 茶園客廳的麻將桌是前景：坐在桌子後面的人（y ≤ 90）下半身被桌子擋住
  SCENES.living.frontY = 90;
  SCENES.living.front = (o)=>{ R(60,84,40,4,"#2f6a3a"); R(62,88,3,10,"#5a3e24"); R(95,88,3,10,"#5a3e24"); for(let i=0;i<6;i++) R(64+i*6,84,4,2,"#f1ead8"); if (!(o.phase||0)) dither(60,84,40,14,"#00000022",3); };
  SCENES.vstudy.frontY = 84;
  SCENES.vstudy.front = (o) => { const t = o.t||0, dx = o.dx||0, dead = o.bodyAt !== undefined ? t >= o.bodyAt : o.body !== false;
    const off = r => r && t >= r[0] && t < r[1];
    R(78,66,62,4,"#5a3a2a"); R(78,66,62,1,"#7a5a3a"); R(80,70,4,22,"#4a2a1a"); R(134,70,4,22,"#4a2a1a");
    R(82,61,14,5,"#7a2a2a"); R(84,62,10,1,"#e9e4da");
    R(137,46,2,20,"#c9a35a"); R(133,42,10,5,"#3f7a4a"); dither(128,46,18,12,"#ffd98a",3);      // 檯燈（在書桌右邊）
    R(104,62,16,3,"#2a2a2e");                                                                   // 筆電
    // 陳先生趴在書桌上（從正面看：頭頂、肩膀、兩隻手臂放在桌上，右手伸向酒杯那邊）。外框和比例跟會動的人物一樣
    if (dead){ const cx = 107+dx, coat = "#5a2a1a", skin = "#e0b48c", hair = "#9a9a92";
      R(cx-11,56,22,10,INK); R(cx-10,57,20,9,coat); R(cx-10,57,20,1,shade(coat,.18));                 // 背、肩膀
      R(cx-15,61,7,5,INK); R(cx-14,62,5,3,coat); R(cx-17,61,4,5,INK); R(cx-16,62,2,3,skin);            // 左手臂
      R(cx+8,61,10,5,INK); R(cx+9,62,8,3,coat); R(cx+17,61,4,5,INK); R(cx+17,62,3,3,skin);             // 右手臂（伸向酒杯）
      R(cx-9,53,18,12,INK); R(cx-8,54,16,8,hair); R(cx-6,54,7,1,shade(hair,.28)); R(cx-8,60,16,2,shade(hair,-.2)); R(cx-8,62,16,2,skin); }
    // 威士忌杯（重演時：先是空杯 → 倒了酒 → 加了冰塊；拿在手上時不畫）
    if (!off(o.glassOff)){ R(124,58,6,8,"#d8eef6"); if (o.pourAt === undefined || t >= o.pourAt) R(125,61,4,4,"#c98a2a"); if (o.iceAt !== undefined && t >= o.iceAt){ R(125,60,2,2,"#f4fbff"); R(127,61,2,2,"#e4f2fa"); } }
    // 威士忌酒瓶、冰桶（重演時冰桶要等陳浩放下才出現）
    if (!off(o.bottleOff)){ R(132,50,4,16,"#7a3a1a"); R(133,46,2,4,"#5a2a10"); R(132,56,4,4,"#e9d8a8"); }
    if (o.bucketAt !== undefined && t >= o.bucketAt && !(o.bucketUntil !== undefined && t >= o.bucketUntil)){ R(114,58,9,8,"#9aa6ae"); R(114,58,9,1,"#e9f2f6"); R(115,62,7,1,"#7a868e"); }
  };
  // 在場景上畫一個閃光（還沒查過的證物）
  function spark(x,y){ R(x-1,y-3,3,7,INK); R(x-3,y-1,7,3,INK); R(x,y-2,1,5,"#ffe27a"); R(x-2,y,5,1,"#ffe27a"); P(x,y,"#ffffff"); }
  function drawStaff(list){
    (list||[]).forEach(([x,f,pose])=>{
      const L = { skin:"#e8c09a", hair:"#2a2a2a", hairStyle:"short", top:"#f4f6f6", bottom:"#f4f6f6", hood:"#f4f6f6", mask:"#9ac0e0", gloves:"#4a8ad8" };
      const kneel = pose==="kneel", y = 98;
      person(x, y, L, 1.2, f||1, kneel?"kneel":"hold");
      if (pose==="cam"){ const hx = x + (f<0?-8:3); R(hx, y-19, 6, 4, INK); R(hx+2, y-18, 2, 2, "#9ab0c8"); dither(hx-3, y-27, 12, 6, "#fffbe0", 2); }
      if (kneel){ const hx = x + (f<0?-13:9); R(hx, y-3, 4, 3, "#e6c34a"); }
    });
  }
  // 畫一個場景。opt.people：[{L, id, x, y, pose, facing}] 或舊格式（只有造型）；回傳每個人的點擊範圍
  // 畫布：邏輯大小還是 192×108，實際用 res 倍的細格（畫面上的畫布用 4 倍；離屏的用 1 倍，給世界地圖拼圖用）
  function setup(canvas, res){
    g = canvas.getContext("2d"); RES = res; canvas.width = W*res; canvas.height = H*res; g.imageSmoothingEnabled = false;
    if (res !== 1) g.setTransform(res,0,0,res,0,0);
  }
  function draw(canvas, name, opt={}, res){
    setup(canvas, res || (canvas.isConnected ? HI : 1));
    const f = SCENES[name] || SCENES.doc; f(opt);
    const hits = [], SF = SCENES[name] || {}; let fronted = !SF.front;
    const staffLast = SF.front && (SF.frontY||999) < 98;   // 鑑識人員站在 y=98：場景有前景（桌子、櫃台）時要畫在前景前面
    if (!staffLast) drawStaff(opt.staff);
    (opt.people||[]).forEach((pp,i,arr)=>{
      if (!fronted && (pp.y !== undefined ? pp.y : 96) > (SF.frontY||999)){ SF.front(opt); fronted = true; }
      const n = arr.length, L = pp.L || pp;
      const x = pp.x !== undefined ? pp.x : opt.solo ? 96 : 24 + (n===1?72:i*(144/(n-1||1)));
      const y = pp.y !== undefined ? pp.y : opt.solo ? 100 : 96;
      const s = opt.solo ? 2.6 : (pp.s || 1.4);
      const box = person(x, y, L, s, pp.facing || (opt.solo?1:(i%2?-1:1)), opt.solo && !pp.pose ? "stand" : pp.pose);
      if (pp.id) hits.push({ kind:"person", id:pp.id, ...box });
      if (pp.mark){ R(x-2, box.y-8, 5, 4, "#ffd04a"); R(x-1, box.y-4, 3, 2, "#ffd04a"); }
    });
    if (!fronted) SF.front(opt);
    if (staffLast) drawStaff(opt.staff);
    (opt.marks||[]).forEach(([x,y])=>spark(x,y));
    if (opt.dim){ g.fillStyle = "#00000088"; g.fillRect(0,0,W,H); }
    return hits;
  }

  /* ---------- 監視器動畫 ----------
     A = { scene, opt, cam:"CAM1", date:"2026-10-17", beats:[ { t:"20:16:00", d:秒, cap:"字幕",
           m:{ 人:[到x, 到y, 姿勢, 面向, 從x, 從y] }, out:[離開的人], cars:{ 名:[到x, 從x, 顏色] } } ] }
     姿勢可以是陣列：在這段時間內依序播放（例如喝水→跌倒）。姿勢的寫法見「姿勢字串」。
     - 走路：橫著走用側面走路的人；往畫面裡面走（y 變小、幾乎不橫移）看到背面；走出來看到正面。
     - 單獨一個「到了才做」的動作（point、reach、drink……，還有 sit、kneel）：路上正常走，走到（這一段的 72%）才擺出動作／坐下。
     - look.back:true 的人（不能讓玩家看到臉）永遠只畫背面，不會變成側面。
     - beat.join:true：緊接著上一段，中間不快轉（同一句字幕分幾步做的時候用，字幕寫一樣的）。
     - beat.scene／beat.opt／beat.s／beat.stairs／beat.ladders：只有這一段換到別的場景（沒寫就用 A 的）。換了場景，上一個場景的人不會帶過來，
       要在這一段的 m 重新寫出場的人（記得寫「從x, 從y」，不然會從 (到x,到y) 原地出現）。
     - A.stairs:[[x0,y0,x1,y1,級數]]：場景裡的樓梯（下端 → 上端）。路線有一段沿著樓梯走，就會一級一級踏上去／下來。
     - A.ladders:[[x,y上,y下]]：梯子。沿著梯子直上直下，就會變成背面爬梯子。 */
  function play(canvas, A, looks, onCap, auto=true){
    let alive = true, paused = !auto, t0 = performance.now(), pauseAt = auto ? 0 : 1.2, done = false, seeking = false;
    const gapOf = b => b.join ? 0 : 0.5, total = A.beats.reduce((n,b)=>n+b.d+gapOf(b),0);   // beat.join:true＝緊接著上一段，中間不快轉（同一個動作分幾步做）
    // beat.t 可以是 "HH:MM"、"HH:MM:SS"、"MM/DD HH:MM"（前面的日期會變成畫面上的日期）、或只有日期（時鐘留空）。beat.date 可以蓋過 A.date（跨過午夜的重播）。
    const tOf = bt => { const s = String(bt.t||""), m = s.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
      return m ? { sec: +m[1]*3600 + +m[2]*60 + +(m[3]||0), date: bt.date || s.slice(0, m.index).trim() || null, label: m[1].padStart(2,"0")+":"+m[2] } : { sec:null, date: bt.date || s.trim() || null, label: s.trim() }; };
    const fmt = n => [Math.floor(n/3600)%24, Math.floor(n/60)%60, Math.floor(n)%60].map(v=>String(v).padStart(2,"0")).join(":");
    let lastCap = null;
    const k0 = k => k[0], sceneOf = b => (b && b.scene) || A.scene;
    // 這個點在不在樓梯那條斜線上（差 3 格以內）
    const onLine = (k, q) => { const dx = k[2]-k[0], dy = k[3]-k[1], len = Math.hypot(dx,dy) || 1, t = ((q[0]-k[0])*dx + (q[1]-k[1])*dy)/(len*len);
      return t > -0.1 && t < 1.1 && Math.abs((q[0]-k[0])*dy - (q[1]-k[1])*dx)/len <= 4; };
    const one = (id, p, s) => { const L = looks(id); if (!L) return;
      if (p.view === "side") profile(p.x, p.y, L, p.frame, p.facing, { s, arm:p.arm, near:p.near, item:p.item, col:p.col, item2:p.item2, col2:p.col2, stair:p.stair });
      else person(p.x, p.y, p.view === "back" ? { ...L, back:true } : L, s, p.facing, p.pose); };
    function stateAt(sec){
      const st = {}, cars = {}; let el = 0, beat = null, k = 0, i = 0;
      for (; i<A.beats.length; i++){
        const b = A.beats[i], start = el + gapOf(b), end = start + b.d;
        const p = sec < start ? 0 : Math.min(1, (sec-start)/b.d);
        // 換場景（beat.scene 和上一段不一樣）：上一個場景的人和車都不帶過來
        if (i > 0 && sceneOf(b) !== sceneOf(A.beats[i-1])){ Object.keys(st).forEach(k=>delete st[k]); Object.keys(cars).forEach(k=>delete cars[k]); }
        const stairsB = b.stairs || (b.scene && b.scene !== A.scene ? [] : A.stairs) || [], laddersB = b.ladders || (b.scene && b.scene !== A.scene ? [] : A.ladders) || [];
        Object.entries(b.m||{}).forEach(([id,v])=>{
          const prev = st[id] || {};
          const fx = v[4]!==undefined ? v[4] : prev.x!==undefined ? prev.x : v[0], fy = v[5]!==undefined ? v[5] : prev.y!==undefined ? prev.y : (v[1]||96);
          const tx = v[0], ty = v[1]||96;
          // v[6]：中途經過的點（例如先走到樓梯口，再沿著樓梯往上），照距離平均走
          const pts = [[fx,fy], ...(v[6]||[]), [tx,ty]], segs = pts.slice(1).map((q,j)=>Math.hypot(q[0]-pts[j][0], q[1]-pts[j][1])), tot = segs.reduce((a,b)=>a+b,0) || 1;
          const raw = v[2] || "stand", single = !Array.isArray(raw), pp0 = single ? parsePose(raw) : null, L0 = looks(id) || {};
          const travel = segs.some(x=>x>0.5);
          // 單獨一個「到了才做」的動作：先走到，再做
          const arrive = travel && single && (ARRIVE.has(pp0.arm) || /^(sit|kneel|back|kick|kick2)$/.test(pp0.legs)) && !/^(lie|fall|prone|stumble)$/.test(pp0.legs);   // 坐下、跪下也是走到了才做
          const pm = arrive ? Math.min(1, p/0.72) : p, moving = travel && pm < 1;
          let d = pm*tot, j = 0; while (j < segs.length-1 && d > segs[j]){ d -= segs[j]; j++; }
          const q0 = pts[j], q1 = pts[j+1], u = segs[j] ? Math.min(1, d/segs[j]) : 1;
          let cx = pm>=1 ? tx : q0[0]+(q1[0]-q0[0])*u, cy = pm>=1 ? ty : q0[1]+(q1[1]-q0[1])*u; const dirX = q1[0]-q0[0], dirY = q1[1]-q0[1];
          let pose = single ? raw : raw[Math.min(raw.length-1, Math.floor(p*raw.length))];
          const facing = (moving && Math.abs(dirX) > 0.5 && !(v[3] && /(^|\+)drag|^(lie|fall|prone|stumble)/.test(String(pose)))) ? (dirX<0?-1:1) : v[3] || (tx<fx?-1:tx>fx?1:(prev.facing||1));
          const o = { x: cx, y: cy, pose, facing, view: "front" };
          const PPo = parsePose(pose);
          if (moving && (arrive || !/^(lie|fall|prone|stumble|sit|kneel)$/.test(PPo.legs)) && L0.kind !== "dog"){
            // 路上：手上有東西就拿著走，動作等走到再做
            const arm = arrive ? ((PPo.item || (PPo.arm==="drink" ? "cup" : PPo.arm==="aim" ? "gun" : null)) ? "carry" : "stand") : PPo.arm;
            const item = PPo.item || (arrive && PPo.arm==="drink" ? "cup" : arrive && PPo.arm==="aim" ? "gun" : null);
            const hs = PPo.hand || (L0.hand === "left" ? "L" : "R"), dist = pm*tot;
            const near = (hs === "R") === (facing > 0);   // 側面：面向右時靠近鏡頭的是右手
            const stair = stairsB.find(k => onLine(k, q0) && onLine(k, q1) && Math.abs(dirX) > 1 && Math.abs(dirY) > 1);
            const ladder = laddersB.find(k => Math.abs(q0[0]-k[0]) <= 3 && Math.abs(q1[0]-k[0]) <= 3 && Math.abs(dirY) > 1 && Math.abs(dirX) <= 3);
            const w = (Math.floor(sec*6)%2) ? "walk1" : "walk2", suffix = (PPo.hand ? ":"+PPo.hand : "") + (item ? "@"+item+(PPo.col ? "/"+PPo.col : "") : "") + (PPo.item2 ? "&"+PPo.item2+(PPo.col2 ? "/"+PPo.col2 : "") : "");
            const frontWalk = /^(stand|walk1|walk2)$/.test(arm) ? w + (item || PPo.item2 ? "+carry" + suffix : "") : w + "+" + arm + suffix;
            if (ladder){ o.pose = Math.floor(dist/4)%2 ? "climb2" : "climb"; o.x = k0(ladder); }
            else if (stair && PROF.has(arm) && !L0.back){ const r = stairAt(stair, cx, Math.sign(dirX) === Math.sign(stair[2]-stair[0]) ? 1 : -1);
              Object.assign(o, { view:"side", y:r.y, frame:r.frame, stair:r.stair, arm, near, item, col:PPo.col, item2:PPo.item2, col2:PPo.col2 }); }
            else if (Math.abs(dirY) > Math.abs(dirX)*1.2){ if (dirY < 0){ o.view = "back"; o.pose = w; } else o.pose = frontWalk; }   // 往裡面走：看到背面（手上的東西被身體擋住）
            else if (PROF.has(arm) && !L0.back) Object.assign(o, { view:"side", frame:Math.floor(dist/3), arm, near, item, col:PPo.col, item2:PPo.item2, col2:PPo.col2 });
            else o.pose = frontWalk;
          } else if (moving && L0.kind === "dog") o.pose = (Math.floor(pm*tot/3)%2) ? "walk1" : "walk2";
          st[id] = o;
        });
        Object.entries(b.cars||{}).forEach(([id,v])=>{ const fx = v[1]!==undefined ? v[1] : (cars[id]||{}).x ?? v[0]; cars[id] = { x: fx+(v[0]-fx)*p, c:v[2]||(cars[id]||{}).c }; });
        if (sec < end || i===A.beats.length-1){ beat = b; k = p; break; }
        (b.out||[]).forEach(id=>{ delete st[id]; delete cars[id]; });
        el = end;
      }
      return { st, cars, beat, k, gap: i>0 && i<A.beats.length && sec < el+gapOf(A.beats[i]) };
    }
    function frame(now){
      if (!alive || !canvas.isConnected){ alive = false; return; }
      const sec = paused ? pauseAt : Math.min(total, (now - t0)/1000);
      const { st, cars, beat, k, gap } = stateAt(sec);
      setup(canvas, HI);
      // beat.scene／beat.opt：這一段換到別的場景（重播從碼頭切到辦公室之類）。沒寫就是 A.scene／A.opt
      const sn = sceneOf(beat), so = { ...(beat && beat.scene && beat.scene !== A.scene ? {} : (A.opt||{})), ...((beat && beat.opt)||{}), t:sec, p:sec/total };
      (SCENES[sn]||SCENES.doc)(so);
      Object.values(cars).forEach(c=>OBJ.car(c.x, 80, c.c||"#7a8a6a"));
      // 場景可以有前景（例如櫃台、桌子）：SCENES[x].front(opt) 畫在 y ≤ frontY 的人前面、y 比較大的人後面
      const SF = SCENES[sn] || {}, fo = so, sc = (beat && beat.s) || A.s || 1.3; let fronted = !SF.front;
      Object.entries(st).sort((a,b)=>a[1].y-b[1].y).forEach(([id,p])=>{ if (!fronted && p.y > (SF.frontY||999)){ SF.front(fo); fronted = true; } one(id, p, sc); });
      if (!fronted) SF.front(fo);
      // 監視器畫面效果
      if (!A.clean){ g.fillStyle = "rgba(30,60,40,.28)"; g.fillRect(0,0,W,H); for (let y=0;y<H;y+=2){ g.fillStyle="rgba(0,0,0,.16)"; g.fillRect(0,y,W,1); }
        seed = Math.floor(sec*10)+3; for (let i=0;i<40;i++) P(rnd()*W, rnd()*H, "#ffffff33"); }
      if (gap){ g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(0,0,W,H); g.fillStyle = "#e9f2e9"; g.font = "bold 10px monospace"; g.fillText("▶▶", 88, 58); }
      const bt = beat ? tOf(beat) : null, clock = bt && bt.sec !== null ? bt.sec + (beat.speed||1)*k*beat.d : null;
      g.font = "6px monospace"; g.fillStyle = "#000a"; g.fillRect(0,0,W,9);
      g.fillStyle = "#e9f2e9"; g.fillText(`${(A.cam||"").replace(/[^\x20-\x7e]/g,"").trim()||"REC"}  ${(bt && bt.date) || A.date || ""} ${clock !== null ? fmt(clock) : ""}`, 3, 7);
      if (Math.floor(sec*2)%2===0 && !A.clean){ g.fillStyle = "#e04a3a"; g.fillRect(W-22,2,4,4); g.fillStyle = "#e9f2e9"; g.fillText("REC", W-16, 7); }
      if (paused && !seeking){ g.fillStyle = "#000a"; g.fillRect(82,42,28,24); g.fillStyle="#e9f2e9"; for(let i=0;i<15;i++) g.fillRect(92, 47+i, Math.min(i,14-i)+1, 1); }
      const cap = beat && !gap ? beat.cap : null;
      if (cap !== lastCap){ lastCap = cap; onCap && onCap(cap ? `${bt.label}　${cap}` : "", sec>=total); }
      if (sec >= total && !paused){ done = true; onCap && onCap(lastCap ? `${tOf(beat||A.beats[A.beats.length-1]).label}　${lastCap}` : "", true); return; }
      if (paused) return;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return {
      stop(){ alive = false; },
      seek(sec){ seeking = true; paused = true; pauseAt = Math.max(0, Math.min(total, sec)); alive = true; requestAnimationFrame(frame); },
      total,
      beatsAt: () => { let el = 0; return A.beats.map(b=>{ const st = el + gapOf(b); el = st + b.d; return [st, el]; }); },
      toggle(){ if (done){ this.restart(); return false; } if (paused){ paused = false; t0 = performance.now() - pauseAt*1000; requestAnimationFrame(frame); } else { paused = true; pauseAt = Math.min(total,(performance.now()-t0)/1000); } return paused; },
      restart(){ paused = false; done = false; t0 = performance.now(); lastCap = null; alive = true; requestAnimationFrame(frame); }
    };
  }
  /* 側面走路的人（14×28，面向右；facing=-1 會左右翻轉）。frame 0–3 是走路的四格。
     o = { s 放大, arm 手部動作（PROF 裡的）, near 做動作的是不是靠近鏡頭的那隻手, item, col,
           stair 1 上樓梯／-1 下樓梯（frame：0、2 一腳踏在另一級上，1、3 雙腳併攏） }
     面向右時靠近鏡頭的是右手；面向左時是左手。遠的那隻手顏色比較暗，被身體擋住一部分。 */
  function profile(x, y, L, frame=0, facing=1, o={}){
    if (L.kind === "dog") return dog(x, y, L, o.s||1, facing, (frame%2) ? "walk1" : "walk2");
    const parts = [], add = (px,py,w,h,c) => parts.push([px,py,w,h,c]);
    const skin=L.skin||"#e8b98f", top=L.top||"#5577aa", bot=L.bottom||"#333a44", hair=L.hair||"#2a1d16", shoe=L.shoes||"#2a2320";
    const sl = L.coat||L.sleeve||top, hand = L.gloves||skin, f = ((frame % 4) + 4) % 4, st = o.stair || 0;
    const bob = (f===1||f===3) ? -1 : 0;
    // 腿：[x, 抬高幾格]。上樓梯：前腳先踏上一級；下樓梯：後腳還留在上一級
    let nl, fl;
    if (st){ const a = f%2 === 0 ? [8, st>0 ? 3 : 0] : [7,0], b = f%2 === 0 ? [4, st>0 ? 0 : 3] : [5,0]; nl = f < 2 ? a : b; fl = f < 2 ? b : a; }
    else { nl = [[8,0],[6,0],[4,0],[6,0]][f]; fl = [[4,0],[6,0],[8,0],[6,0]][f]; }
    const leg = ([lx,up], c, sc) => { add(lx,19,3,7-up,c); add(lx+(lx>=7?1:0),25-up,4,2,sc); };
    if (L.skirt) add(4,18,7,4,bot);
    leg(fl, shade(bot,-.2), shade(shoe,-.1)); leg(nl, bot, shoe);
    if (L.skirt){ add(nl[0],22,2,4-nl[1],skin); add(fl[0],22,2,4-fl[1],shade(skin,-.15)); add(4,17,7,5,bot); }
    // 手：遠的那隻先畫（會被身體擋住），近的那隻最後畫
    const arm = PROF.has(o.arm) && !/^(stand|walk)/.test(o.arm) ? o.arm : (o.item ? "carry" : "swing");
    const two = arm==="hold"||arm==="read"||arm==="push"||arm==="drag", nearActs = o.near !== false;
    const FW = { point:11, aim:10, give:13, reach:15, strike:17, pour:9, stretch:12, knock:6, knock2:7, door:5, wipe:14, wipe2:14, cup:13, brush:14, brush2:16, hold:14, read:12, push:12, drag:17 };
    const dflt = arm==="aim" ? "gun" : arm==="cup" ? "cup" : /^wipe/.test(arm) ? "cloth" : /^brush/.test(arm) ? "brush" : null;
    const limb = (x0,y0,x1,y1,c) => { const n = Math.max(Math.abs(x1-x0), Math.abs(y1-y0)) || 1; for (let i=0;i<=n;i++) add(Math.round(x0+(x1-x0)*i/n), Math.round(y0+(y1-y0)*i/n), 2, 2, c); };
    const oneArm = (far, acts) => {
      const c = far ? shade(sl,-.3) : sl, hc = far ? shade(hand,-.2) : hand, mode = acts || two ? arm : "swing";
      const it = acts && !two ? (o.item || dflt) : null, col = o.col || (it==="cup" ? L.cupColor : null);
      if (mode==="swing" && !acts && o.item2 && !two){ if (!far) add(6,11,3,5,shade(sl,-.1)); add(7,15,3,3,c); add(7,18,2,2,hc); putItem(add, o.item2, 7, 18, ITEMS[o.item2] && (ITEMS[o.item2].seg || /^(bag|case|bucket|umbrella|gun)$/.test(o.item2)) ? "down" : "up", o.col2); }
      else if (mode==="swing"){ const hx = far ? [5,7,9,7][f] : [9,7,5,7][f]; if (!far) add(6,11,3,5,shade(sl,-.1)); add(hx,15,3,3,c); add(hx+(f===0&&!far?1:0),18,2,2,hc); }
      else if (mode==="carry"){ if (!far) add(6,11,3,5,shade(sl,-.1)); add(7,15,3,3,c); add(7,18,2,2,hc); if (it) putItem(add, it, 7, 18, "down", col); }
      else if (mode==="phone"){ if (!far) add(6,11,3,3,shade(sl,-.1)); add(6,9,2,3,c); }   // 手和電話要蓋在頭上，下面再畫
      else { const hy = FW[mode] - (far && two ? 1 : 0), hx = (hy < 9 ? 14 : 13) - (far && two ? 1 : 0);
        if (!far) add(6,11,3,2,shade(sl,-.1)); limb(7,11,hx-2,hy,c); add(hx,hy,2,2,hc);
        if (it){ const len = putItem(add, it, hx, hy, /^knock|^cup|^door/.test(mode) ? "up" : "fwd", col); if (mode==="pour"){ add(hx+2+len,hy+2,1,1,"#9fd0ff"); add(hx+2+len,hy+4,1,2,"#9fd0ff"); } } }
    };
    oneArm(true, !nearActs);
    // 身體
    add(4,10,7,9,top); add(4,10,1,9,shade(top,-.25));
    if (L.coat){ add(4,10,7,11,L.coat); add(9,10,2,8,top); add(4,10,1,11,shade(L.coat,-.25)); }
    if (L.apron) add(8,12,3,7,L.apron);
    if (L.tie) add(10,11,1,4,L.tie);
    if (L.chain) add(9,11,2,1,"#e6c34a");
    if (L.stetho){ add(9,10,1,5,"#555"); add(10,14,1,1,"#555"); }
    oneArm(false, nearActs);
    if (arm==="hold") holdProp(add, o.item || L.prop, o.col, 8, 0);
    else if (arm==="read"){ if (o.item && o.item !== "paper") putItem(add, o.item, 13, 12, "up", o.col); else add(13,8,4,5,o.col||"#f1ead8"); }
    else if (arm==="push") pushProp(add, o.item, o.col, -5);
    else if (arm==="drag" && o.item) putItem(add, o.item, 13, 17, "fwd", o.col);
    if (L.case && arm==="swing") add([9,7,5,7][f]-1,19,6,5,"#4a3424");
    if (L.cane && arm==="swing") add([9,7,5,7][f]+2,17,1,10,"#6b4a2b");
    // 頭（側面，Q 版大頭）
    const hl = shade(hair,.28);
    add(3,-1,10,10,skin); add(13,4,1,2,skin); add(4,7,7,1,shade(skin,-.12));
    add(10,3,1,2,INK); add(11,3,1,2,"#ffffff"); if (L.glasses){ add(9,2,4,1,"#7a7a7a"); add(9,2,1,3,"#7a7a7a"); } if (L.sunglasses) add(9,2,5,2,"#111");
    add(12,6,1,1,shade(skin,-.4)); add(6,3,2,2,shade(skin,-.18)); add(9,1,3,1,shade(hair,-.15));
    if (L.bruise) add(9,5,2,2,"#7a4a8a");
    if (L.blush) add(10,6,1,1,"#e88a8a");
    const hs = L.hairStyle||"short";
    if (hs==="bald"){ add(3,-1,10,1,shade(skin,.12)); add(3,2,2,3,hair); }
    else if (hs==="balding"){ add(3,2,3,4,hair); }
    else { add(3,-2,10,2,hair); add(2,-1,4,7,hair); add(5,-2,5,1,hl); if (hs==="long") add(2,-1,4,17,hair); if (hs==="bob") add(2,-1,4,10,hair); if (hs==="pony") add(-1,0,4,8,hair); if (hs==="bun") add(1,-4,5,3,hair); if (hs==="spiky"){ add(5,-3,2,1,hair); add(9,-3,2,1,hair); } if (hs==="slick") add(9,-2,4,1,hl); }
    if (L.hood){ add(2,-3,11,3,L.hood); add(2,-3,4,12,L.hood); }
    if (L.hat==="douli"){ add(0,-3,16,2,"#c9a35a"); add(4,-5,8,2,"#c9a35a"); }
    if (L.hat==="cap"){ add(3,-3,10,2,L.capColor||"#c23a2a"); add(12,-2,4,1,L.capColor||"#c23a2a"); }
    if (L.hat==="fedora"){ const hc = L.hatColor||"#4a3a2a"; add(1,-2,14,2,hc); add(3,-6,10,4,hc); add(3,-3,10,1,"#2a1a10"); add(4,-6,4,1,shade(hc,.25)); }
    if (L.hat==="police"){ add(3,-4,10,4,"#24324e"); add(11,-1,4,1,"#1a2236"); add(9,-3,2,2,"#e6c34a"); }
    if (L.hat==="nurse") add(5,-3,5,2,"#ffffff");
    if (L.mask) add(9,5,5,4,L.mask);
    if (L.beard) add(7,6,6,3,shade(hair,.15));
    if (arm==="phone"){ const far = !nearActs; add(6,6,2,3, far ? shade(hand,-.2) : hand); add(5,1,2,6,"#111"); if (!far) add(5,2,1,3,"#3a5a7a"); }
    const q = snap(o.s || 1), rr = v => RES > 1 ? Math.round(v*RES)/RES : Math.round(v), Rq = RES > 1 ? RAW : R;
    const ox = rr(x - 7*q), oy = rr(y - 27*q + bob*q);
    const F = (px,py,w,h,c) => Rq(ox + (facing>0?px:14-px-w)*q, oy+py*q, w*q, h*q, c);
    parts.forEach(([px,py,w,h]) => F(px-1,py-1,w+2,h+2,INK));
    parts.forEach(p => F(...p));
    Rq(ox+2*q, rr(y)-1*q, 10*q, 1*q, "#00000040");
    return { x: Math.round(ox-q), y: Math.round(oy-2*q), w: Math.round(16*q), h: Math.round(30*q) };
  }
  /* 樓梯：k = [x0,y0,x1,y1,級數]（從下面的 (x0,y0) 到上面的 (x1,y1)）。人在 x、正往 dir 走（1＝往 x1 那頭）時，
     回傳腳踩的高度 y、走路格 frame、往上還是往下 stair。一級分兩步：先跨一腳，再把身體帶上去。 */
  function stairAt(k, x, dir){
    const x0 = k[0], y0 = k[1], x1 = k[2], y1 = k[3], n = k[4] || Math.max(2, Math.round(Math.abs(y1-y0)/4));
    const a = Math.max(0, Math.min(1, (x-x0)/((x1-x0)||1))) * n, i = Math.min(n-1, Math.floor(a + 1e-6)), ph = a - i;
    const fwd = dir > 0, tread = fwd ? (ph < 0.5 ? i : i+1) : i, phase = fwd ? (ph < 0.5 ? 0 : 1) : (ph > 0.5 ? 0 : 1);
    return { y: y0 + (y1-y0)*tread/n, frame: (i&1)*2 + phase, stair: (fwd === (y1 < y0)) ? 1 : -1 };
  }
  const prim = { R, P, dither, shade, mix, OBJ, windowBox, door, sign, lamp, spark, INK, sky, rain, hills, floor, wall, person, ctx:(c)=>{ g = c; RES = 1; }, res:(n)=>{ RES = n; }, g:()=>g, seed:(n)=>{ seed = n; }, rnd:()=>rnd() };
  return { draw, person, profile, dog, play, SCENES, W, H, prim, parsePose, poseErr, stairAt, ITEMS, HI };
})();
