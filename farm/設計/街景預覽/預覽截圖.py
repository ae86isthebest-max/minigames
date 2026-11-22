# 街景預覽：現在 / A 街景＋光影 / B = A＋鏡頭放低。唔會改線上遊戲。
# 用法：喺 小遊戲合集 開 `python -m http.server 8093`，再 `python 預覽截圖.py`
import asyncio, json, pathlib, re
from urllib.parse import quote
from PIL import Image, ImageDraw, ImageFont
from playwright.async_api import async_playwright

HERE = pathlib.Path(__file__).resolve().parent
FARM = HERE.parents[1]
BASE = 'http://localhost:8093/farm/'
MOD = '/farm/' + quote('設計/街景預覽/street.js')
SPOTS = [('1_街口', 11.5, -3.0), ('2_店門口', 0, -4.2), ('3_農場', -4.5, 14.6), ('4_北面街道', 14.6, -21)]
NAMES = {'now': '現在', 'A': 'A 街景＋光影', 'B': 'B 街景＋光影＋鏡頭放低'}


async def run(p, kind):
    b = await p.chromium.launch(channel='msedge', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio'])
    ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, service_workers='block')
    pg = await ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    await pg.goto(BASE + '?mute&fresh', timeout=120000, wait_until='domcontentloaded')
    await pg.wait_for_function('window.__farm', timeout=120000)
    state = await pg.evaluate("""()=>{const F=__farm,lvl={};for(const k in F.GROW)lvl[k]=F.GROW[k].max;
      return {...F.state,built:F.DEFS.filter(d=>d.kind!=='mapgate').map(d=>d.id),lvl,money:250000,earned:900000,
        up:{autoCash:1,look:3,floor:2,ad:3},extra:{farmer:2,keeper:1,shelver:2,orderer:1}}}""")
    await pg.add_init_script('localStorage.setItem("farm_save_v2", %s)' % json.dumps(json.dumps(state)))
    if kind == 'B':
        src = (FARM / 'js/main.js').read_text(encoding='utf-8')
        a = 'tz = pp.z + camDist * 0.6, ty = camDist * 0.8;'
        c = 'camera.lookAt(camPos.x, 0, camPos.z - camDist * 0.6);'
        assert src.count(a) == 1 and src.count(c) == 1
        src = src.replace(a, 'tz = pp.z + camDist * 0.71, ty = camDist * 0.70;').replace(c, c.replace('0.6', '0.71'))

        async def serve(route):
            await route.fulfill(body=src, content_type='text/javascript; charset=utf-8')
        await ctx.route('**/farm/js/main.js*', serve)
    await pg.goto(BASE + '?mute', timeout=120000, wait_until='domcontentloaded')
    await pg.wait_for_function('window.__farm', timeout=120000)
    await pg.evaluate('__farm.sim(50)')
    if kind != 'now':
        await pg.evaluate('async (m) => (await import(m)).build(__farm.three.scene, __farm.stations)', MOD)
    for name, x, z in SPOTS:
        await pg.evaluate('([x,z]) => { __farm.tp(x,z); __farm.sim(0.1) }', [x, z])
        await pg.wait_for_timeout(900)
        await pg.screenshot(path=str(HERE / f'{name}_{kind}.png'))
        info = await pg.evaluate("""()=>{const {renderer:R,scene,camera}=__farm.three;R.render(scene,camera);
          return [R.info.render.calls,R.info.render.triangles]}""")
        print(kind, name, 'draw calls', info[0], 'triangles', info[1], flush=True)
    print(kind, 'errors', errs)
    await b.close()


def compose():
    font = ImageFont.truetype('C:/Windows/Fonts/msjhbd.ttc', 40)
    for name, _, _ in SPOTS:
        out = Image.new('RGB', (780 * 3 + 40, 1688 + 80), '#fffaf0')
        d = ImageDraw.Draw(out)
        for i, k in enumerate(('now', 'A', 'B')):
            out.paste(Image.open(HERE / f'{name}_{k}.png').convert('RGB'), (i * 800, 80))
            d.text((i * 800 + 390, 40), NAMES[k], fill='#4a3426', font=font, anchor='mm')
        out.save(HERE / f'比較_{name}.jpg', quality=88)
        print('saved', f'比較_{name}.jpg')


async def main():
    async with async_playwright() as p:
        for k in ('now', 'A', 'B'):
            await run(p, k)
    compose()


if __name__ == '__main__':
    asyncio.run(main())
