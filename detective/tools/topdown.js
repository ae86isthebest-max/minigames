// 俯視引擎檢查：node tools/topdown.js [截圖資料夾]（自己開伺服器）。最後印 TOPDOWN TEST PASS
const { chromium } = require("playwright"), http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), out = process.argv[2];
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split("?")[0])); fs.readFile(f, (e, d) => { if (e){ r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": f.endsWith(".html") ? "text/html; charset=utf-8" : "application/javascript" }); r.end(d); }); }).listen(0);
(async () => {
  const port = srv.address().port, b = await chromium.launch(), p = await b.newPage({ viewport:{ width:1024, height:820 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto(`http://localhost:${port}/tools/topdemo.html`); await p.waitForTimeout(400);
  const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
  const box = await p.locator("#worldcv").boundingBox(), K = box.width / (await p.evaluate(() => TOPW.VW));
  // 世界座標 → 畫面（鏡頭會跟住主角郁，先等鏡頭停定）
  const tapAt = async (x, y) => { await p.waitForTimeout(700); const c = await p.evaluate(() => TOPW.state("demo").cam); await p.mouse.click(box.x + (x - c[0]) * K, box.y + (y - c[1]) * K); };
  const st = () => p.evaluate(() => { const s = TOPW.state("demo"); return { room:s.room, x:s.px, y:s.py, walking:TOPW.walking() }; });
  const until = async (fn, ms = 6000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } return false; };
  if (out){ fs.mkdirSync(out, { recursive:true }); await p.locator("#worldcv").screenshot({ path: out + "/0-start.png" }); }
  // 1. 點地面：走過去，不會穿過書桌（路線每一點都在空地）
  await tapAt(100, 120); ok(await until(async () => !(await st()).walking), "walk to ground never stopped");
  let s = await st(); ok(Math.hypot(s.x - 100, s.y - 120) < 6, "ground walk ended at " + s.x + "," + s.y);
  // 2. 點杯（在書桌後面）：走到旁邊、觸發 onSpot
  await tapAt(122, 84); ok(await until(async () => (await p.evaluate(() => (window._log||[]).includes("spot mug")))), "mug not inspected");
  s = await st(); ok(!(s.x > 64 - 4 && s.x < 136 + 4 && s.y > 78 && s.y < 104), "stood inside the desk at " + s.x + "," + s.y);
  if (out) await p.locator("#worldcv").screenshot({ path: out + "/1-mug.png" });
  // 3. 點門：換到走廊
  await tapAt(29, 60); ok(await until(async () => (await st()).room === "hall"), "door did not lead to hall");
  await p.waitForTimeout(500); if (out) await p.locator("#worldcv").screenshot({ path: out + "/2-hall.png" });
  // 4. 從走廊用 goSpot 去書房的廢紙箱：自己穿門走過去
  await p.evaluate(() => TOPW.goSpot("bin")); ok(await until(async () => (await p.evaluate(() => (window._log||[]).includes("spot bin"))), 9000), "goSpot across rooms failed");
  // 5. 樓梯：下去再上來
  await tapAt(226, 160); ok(await until(async () => (await st()).room === "up"), "stairs down failed " + JSON.stringify(await p.evaluate(() => { const s = TOPW.state("demo"); return [s.room, s.px, s.py, s.cam, s.lastTap, s.path, s.plan, s.leg, s.use, s.fade]; })));
  await p.waitForTimeout(500); if (out) await p.locator("#worldcv").screenshot({ path: out + "/3-down.png" });
  // 6. 走去街上（地下室→書房→走廊→街）
  await p.evaluate(() => TOPW.goTo(260, 92, null, "street")); ok(await until(async () => (await st()).room === "street", 15000), "could not reach street");
  await until(async () => !(await st()).walking, 8000); await p.waitForTimeout(600); if (out) await p.locator("#worldcv").screenshot({ path: out + "/4-street.png" });
  ok(errs.length === 0, "page errors: " + errs.join(" | "));
  console.log(fail.length ? "FAIL\n- " + fail.join("\n- ") : "TOPDOWN TEST PASS");
  await b.close(); srv.close();
})();
