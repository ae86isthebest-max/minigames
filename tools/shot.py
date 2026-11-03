# Offscreen screenshots (headless Edge, muted) so testing never touches the user's screen.
# usage: python tools/shot.py <outdir> game:mode:level:wait [...]
import sys, asyncio, os
from playwright.async_api import async_playwright
URL = 'http://localhost:8093/'
async def main(out, jobs):
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        ctx = await b.new_context(viewport={'width': 390, 'height': 800}, device_scale_factor=1)
        for j in jobs:
            g, mode, lv, wait = j.split(':')
            pg = await ctx.new_page()
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            await pg.goto(URL + '?mute&game=%s&mode=%s&level=%s' % (g, mode, lv))
            await pg.wait_for_timeout(int(float(wait) * 1000))
            await pg.screenshot(path=os.path.join(out, '%s_%s_%s.png' % (g, mode, lv)))
            if errs: print(g, 'ERRORS', errs[:3])
            await pg.close()
        await b.close()
asyncio.run(main(sys.argv[1], sys.argv[2:]))
