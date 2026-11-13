// 人物動作總表：node tools/poses.js [輸出資料夾]　→ poses-front.png、poses-side.png
// 用來用眼睛檢查：每個動作左右手、面向左右畫出來對不對，人物放大以後有沒有變形。
// 每一格上面兩個是右撇子（面向右、面向左），下面兩個是左撇子。人的右手永遠在畫面左邊。
const {chromium}=require('playwright');
const out = process.argv[2] || __dirname;
(async()=>{const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1700,height:1300}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/index.html');
const mk = async (name, w, h, fn) => {
  await p.evaluate(({w,h,fn})=>{
    document.body.innerHTML = `<canvas id="sh" style="width:${w*4}px;height:${h*4}px;background:#8a9a8a"></canvas>`;
    const c = document.getElementById('sh'), K = 4; c.width = w*K; c.height = h*K;
    const g = c.getContext('2d'); g.imageSmoothingEnabled=false; g.setTransform(K,0,0,K,0,0); g.fillStyle="#8a9a8a"; g.fillRect(0,0,w,h);
    PX.prim.ctx(g); PX.prim.res && PX.prim.res(K);
    const LB = { skin:"#e8c09a", hair:"#2a2220", hairStyle:"short", top:"#4a6a9a", bottom:"#3a3328", glasses:true, handMark:{ hand:"right", c:"#1a2a6a" } };
    const LG = { skin:"#e8c8a8", top:"#d88a9a", bottom:"#6a5a7a", hair:"#5a2d16", hairStyle:"long", skirt:true, hand:"left" };
    const label = (t,x,y) => { g.fillStyle="#1b1512"; g.font="4px monospace"; g.fillText(t,x,y); };
    new Function("PX","LB","LG","label","g", fn)(PX, LB, LG, label, g);
  }, {w,h,fn});
  await p.waitForTimeout(150);
  await (await p.$('#sh')).screenshot({path: out+'/'+name});
};
// 正面：每個動作 × 物件
await mk('poses-front.png', 440, 520, `
  // 每個動作：左＝面向右，右＝面向左（右撇子，右手有藍色記號）
  const list = ["stand","drink","drink@glass","cup","eat","smoke","cig","phone","carry@bag","carry@case","carry@knife","raise@weight","raise@umbrella","wave","inspect","pocket@envelope","write","broom",
    "hold@box","hold@tray","hold@bucket","read","cross","cry","cam","type","handsup","lift@box","climb","climb2",
    "sit+drink@can","sit+type","kneel+inspect","sit+phone","stand@torch","walk1@bag","carry@ladder","carry@mop","polish@weight","carry@coat","wave&coat","back+door","back+knock","lie","fall","prone","stumble"];
  list.forEach((ps,i)=>{ const col = i % 8, row = Math.floor(i/8), x = 28 + col*54, y = row*56;
    label(ps, x-24, y+5);
    PX.person(x-12, y+46, LB, 1, 1, ps); PX.person(x+12, y+46, LB, 1, -1, ps); });
  // 有方向的動作：一格一個人，才不會疊在一起
  const dir = ["point","aim","give@paper","reach@bottle","reach@key","strike@hammer","strike@knife","pour@vial","knock","wipe","brush","push@cart","push@cart/#2a6ad8","drag@rope","reach@gun","give@cash","reach@scissors","kneel+reach@cloth"];
  dir.forEach((ps,i)=>{ const col = i % 6, row = Math.floor(i/6), x = 10 + col*72, y = 404 + row*38;
    label(ps, x-8, y-28);
    PX.person(x+4, y, LB, 1, 1, ps); PX.person(x+50, y, LB, 1, -1, ps); });
`);
await mk('poses-hands.png', 440, 380, `
  // 左右手：每個動作四個人。上排＝右撇子（藍衣，右手有記號），下排＝左撇子（粉紅衣）；左＝面向右，右＝面向左
  const list = ["drink@glass","cup","phone","write","carry@bag","raise@knife","inspect","pocket@envelope","point","reach@bottle","give@paper","strike@hammer","pour@vial","aim","wipe","knock"];
  list.forEach((ps,i)=>{ const col = i % 4, row = Math.floor(i/4), x = 8 + col*110, y = row*95;
    label(ps, x, y+6);
    PX.person(x+20, y+50, LB, 1.5, 1, ps); PX.person(x+84, y+50, LB, 1.5, -1, ps);
    PX.person(x+20, y+93, LG, 1.5, 1, ps); PX.person(x+84, y+93, LG, 1.5, -1, ps); });
`);
// 側面：走路四格、拿東西、上下樓梯、放大倍率、狗
await mk('poses-side.png', 420, 300, `
  label("walk R / L", 2, 5);
  for (let f=0;f<4;f++){ PX.profile(12+f*18, 38, LB, f, 1); PX.profile(92+f*18, 38, LB, f, -1); PX.profile(172+f*18, 38, LG, f, 1); PX.profile(252+f*18, 38, LG, f, -1); }
  const arms = [["carry","bag"],["carry","knife"],["hold","box"],["hold","tray"],["push","cart"],["phone",null],["point",null],["give","paper"],["reach","bottle"],["aim",null],["cup",null],["read",null],["drag","rope"],["strike","hammer"]];
  arms.forEach(([a,it],i)=>{ const x = 16 + (i%7)*58, y = 80 + Math.floor(i/7)*46; label(a+(it?"@"+it:""), x-12, y-32);
    PX.profile(x, y, LB, 0, 1, { arm:a, item:it, near:true }); PX.profile(x+16, y, LB, 2, 1, { arm:a, item:it, near:false }); PX.profile(x+34, y, LB, 1, -1, { arm:a, item:it, near:false }); });
  label("stairs up (10 steps) / down", 2, 172);
  const k = [20,250,120,200,10]; for (let i=0;i<10;i++){ g.fillStyle="#6b4a2b"; g.fillRect(20+i*10, 250-(i+1)*5, 100-i*10, 5); g.fillStyle="#8a6338"; g.fillRect(20+i*10, 250-(i+1)*5, 10, 1); }
  [24,37,44,58,71,84,97,112].forEach(x=>{ const r = PX.stairAt(k, x, 1); PX.profile(x, r.y, LB, r.frame, 1, { stair:r.stair }); });
  const k2 = [300,250,200,200,10]; for (let i=0;i<10;i++){ g.fillStyle="#6b4a2b"; g.fillRect(200, 250-(i+1)*5, 100-i*10, 5); g.fillStyle="#8a6338"; g.fillRect(290-i*10, 250-(i+1)*5, 10, 1); }
  [208,222,236,251,264,278,292].forEach(x=>{ const r = PX.stairAt(k2, x, 1); PX.profile(x, r.y, LG, r.frame, 1, { stair:r.stair, arm:"carry", item:"bag" }); });
  label("scale 1 1.2 1.3 1.4 2 2.6 (snapped to quarter pixels)", 2, 262);
  [1,1.2,1.3,1.4,2,2.6].reduce((x,s)=>{ PX.person(x+10*s, 298, LB, s, 1, "drink@glass"); PX.profile(x+26*s, 298, LB, 0, 1, { s }); return x + 40*s; }, 4);
  const DOG = { kind:"dog" }; ["stand","walk1","walk2","sit","lie","sniff"].forEach((ps,i)=>{ PX.person(330+ (i%3)*30, 200+Math.floor(i/3)*30, DOG, 1, i%2?-1:1, ps); });
`);
console.log(errs.length ? errs : "POSE SHEETS OK → " + out); await b.close();})();
