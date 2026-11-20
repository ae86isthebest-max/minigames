// 新人物畫法的總表：node tools/sprite2sheet.js 輸出.png [放大倍數=4]
const { chromium } = require("playwright"), path = require("path"), fs = require("fs");
(async () => {
  const out = process.argv[2] || "sprite2.png", Z = +(process.argv[3] || 4);
  const b = await chromium.launch(), p = await b.newPage();
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.setContent(`<canvas id=c></canvas><script>${fs.readFileSync(path.join(__dirname, "..", "sprite2.js"), "utf8")}</script>`);
  const data = await p.evaluate(Z => {
    const DET = { skin:"#ecc29c", hair:"#2a1d16", coat:"#9a7a52", top:"#e9e4da", bottom:"#2e3340", shoes:"#1c1a18", hat:"#4a3424" };
    const WU = { skin:"#e8c09a", hair:"#2a2a2a", coat:"#3a5a7a", top:"#e9e4da", bottom:"#3a4152", shoes:"#2a2320" };
    const rows = [["side walk", DET, "side", "walk"], ["front walk", DET, "front", "walk"], ["back walk", DET, "back", "walk"], ["idle / look / crouch / point", DET, "mix"],
      ["fall back", WU, "side", "fallBack"], ["fall forward", WU, "side", "fallFwd"],
      ["investigate", DET, "inv"], ["drinkFall", WU, "side", "drinkFall"], ["fallHigh", WU, "side", "fallHigh"], ["slump + pickup", WU, "sp"]];
    const cw = 72 * Z, chh = 56 * Z, c = document.getElementById("c"); c.width = cw * 11 + 160; c.height = rows.length * chh + 40*Z; const g = c.getContext("2d");
    g.fillStyle = "#a8875e"; g.fillRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false;
    g.translate(0, 40*Z); rows.forEach((r, j) => { g.fillStyle = "#2a1d12"; g.font = "16px sans-serif"; g.fillText(r[0], 6, j * chh + 30);
      const cells = r[2] === "inv" ? [["side","kneel",0],["side","reach",1],["side","photo",0],["side","photo",1],["side","write",0],["side","knock",0],["side","sit",0],["side","talk",0]]
        : r[2] === "sp" ? [["side","slump",0],["side","slump",1],["side","slump",2],["side","slump",3],["side","pickup",0],["side","pickup",1],["side","pickup",2],["side","pickup",3]]
        : r[2] === "mix" ? [["side","idle",0],["side","idle",1],["side","look",0],["side","look",1],["side","crouch",0],["side","point",0],["front","idle",0],["back","idle",0]]
        : Array.from({ length: SP.frames(r[3]) }, (_, i) => [r[2], r[3], i]);
      cells.forEach(([v, a, f], i) => { const x = 160 + i * cw, y = j * chh; g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect(x, y + 54*Z, cw, 1);
        const cv = SP.render(r[1], { view: v, act: a, f }); g.drawImage(cv, x, y - SP.airOf({ act: a, f }) * Z, cw, chh); }); });
    return c.toDataURL().split(",")[1];
  }, Z);
  fs.writeFileSync(out, Buffer.from(data, "base64")); console.log(errs.length ? "ERR " + errs.join(" | ") : "SPRITE SHEET SAVED " + out); await b.close();
})();
