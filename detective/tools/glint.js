// 走近才閃＋小東西的點擊範圍：最後要印出 GLINT TEST PASS。
// 1) 還沒看過的東西只有在主角附近（同一個區域／40 格內、同一層樓）才算「附近」；看過就不閃；劇情進行中不閃
// 2) iPad、手機大小：手指點在小東西外面一點點也算點中；離很遠不算；點人還是點到人
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = []; const r = {};
  for (const [name, w, h] of [['ipad', 1180, 820], ['phone', 844, 390]]){
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:8765/index.html');
    const skip = async () => { for (let i = 0; i < 10; i++){ const v = await p.evaluate(() => { const b = document.querySelector('.wskip'); return b && !b.hidden; }); if (!v) break; await p.click('.wskip'); await p.waitForTimeout(400); } };
    const settle = async () => { for (let i = 0; i < 40; i++){ await p.waitForTimeout(250); if (await p.evaluate(() => !WORLD.walking())) break; } await p.waitForTimeout(200); };
    await p.evaluate(() => { localStorage.clear(); window.uiConfirm = async () => true; openCase(0); }); await p.waitForTimeout(800); await skip(); await p.waitForTimeout(500);
    const put = (x, up) => p.evaluate(([x, up]) => { const st = WORLD.state("_"), def = worldDef(curLoc()); st.px = x; st.py = up ? def.floors[0].y : 124; st.path = []; st.walking = false; st.areaSay = null; }, [x, up]);
    const near = () => p.evaluate(() => curHooks.spots().filter(q => q.fresh && WORLD.nearYou(q)).map(q => q.id || q.ids[0]).sort().join());
    const still = async () => { let c = -1; for (let i = 0; i < 60; i++){ const n = await p.evaluate(() => WORLD.state("_").cam); if (Math.abs(n - c) < 0.02) break; c = n; await p.waitForTimeout(120); } };
    const tapAt = async (x, y) => { await still(); const pt = await p.evaluate(([x, y]) => { const c = document.querySelector('canvas'), rc = c.getBoundingClientRect(), st = WORLD.state("_"); return [rc.left + (x - st.cam) * rc.width / 240, rc.top + y * rc.height / 135]; }, [x, y]); await p.touchscreen.tap(pt[0], pt[1]); await settle(); };
    const found = () => p.evaluate(() => (S.found || []).join());
    const o = r[name] = {};
    await put(205, 0); await p.waitForTimeout(400); o.security = await near();
    await put(480, 1); await p.waitForTimeout(400); o.study = await near();
    o.scale = await p.evaluate(() => document.querySelector('canvas').getBoundingClientRect().width / 240);
    // 小東西：書房門邊的密碼鎖 v_keypad [431,50,6,10]。點在它左邊外面 3 格、上面 2 格
    await tapAt(428, 48); o.tapNear = await found();
    o.afterFound = (await near()).includes('v_keypad');
    await p.evaluate(() => { peek = null; wRoom = null; render(); }); await p.waitForTimeout(200);
    // 離很遠（上面的屋頂）不算
    await tapAt(470, 12); o.tapFar = await found();
    await ctx.close();
  }
  console.log(JSON.stringify(r));
  const ok = ['ipad', 'phone'].every(n => { const o = r[n];
    return o.security.includes('v_snow') && o.security.includes('v_log') && !o.security.includes('v_keypad') && !o.security.includes('v_photo')
      && o.study.includes('v_keypad') && o.study.includes('ev_glass') && !o.study.includes('v_snow') && !o.study.includes('v_fridge')
      && o.tapNear === 'v_keypad' && !o.afterFound && o.tapFar === 'v_keypad'; }) && !errs.length;
  console.log(ok ? 'GLINT TEST PASS' : 'GLINT TEST FAIL', errs); await b.close();
})();
