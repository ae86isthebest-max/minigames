# 開心農場鋪 — design notes

Original casual 3D "walk, carry, unlock, hire" farm + shop game. First game of the idle-builder series;
`js/kit.js` is the shared cartoon style kit that every later game (lumber, construction…) and the restyle
of the other games reuse.

## Style kit (kit.js)
- Rounded low-poly shapes (RoundedBoxGeometry, low-segment spheres/capsules), flat pastel fills, no outlines.
- Lambert materials + warm sky / green-tinted ground HemisphereLight + one soft directional sun with
  PCF soft shadows. Shadowed areas keep only the hemisphere light, so a shadow is a darker tint of the
  same hue (never grey/black).
- No tone mapping, sRGB output, fixed 45°-ish perspective camera following the player.
- Faceless capsule people: big round head, bobbing walk, swinging legs/arms, squash & stretch, lean.

## Controls
Press anywhere → floating round joystick (finger or mouse), analog / diagonal. WASD / arrows on PC.

## Loop
Cut grass → 禾草. Chop trees → 木頭. Feed 禾草 to the coop / barn → eggs / milk. Harvest crops.
Carry a stack on your back, stock shelves, customers buy, stand at the counter to take payment,
collect cash. Walk onto dashed zones to pay (money AND/OR materials) and unlock the next thing.

## Unlock chain (v2, 37 steps, ~$62k + upgrades ≈ several hours)
Farm stand: 雞舍 → 雞蛋架 → 番茄田 → 番茄架 → 收銀員 → 農夫 → 玉米田 → 玉米架 → 小狗 → 理貨員 → 自動灑水器
→ 牛棚 → 牛奶架 → 超級市場($1500, opens west wing) → 果汁機 → 果汁架 → 理貨員2 → 黃豆田 → 磨豆漿機 → 豆漿架
→ 貨運站 → 第二收銀台 → 收銀員2 → 小貓 → 停車場 → 小麥田 → 麵包窯 → 麵包架 → 農夫2 → 第二雞舍 → 起司坊
→ 起司架 → 理貨員3 → 蘋果園 → 蘋果架 → 停機坪($9000) → 理貨員4. Exact costs live in DEFS in js/main.js.

## Workers / pets / automation
收銀員 ×2 (one per counter). 農夫 ×2 cut grass and feed coops/barn. 理貨員 ×4 run logistics: crops/animal
outputs → machines, machine outputs/produce → shelves (most-wanted shelf first). 小狗 pulls cash from afar,
小貓 +1 tip. Machines: 果汁機 番茄→番茄汁, 磨豆漿機 黃豆→豆漿, 麵包窯 小麥→麵包, 起司坊 牛奶→起司.
自動灑水器 ×1.8 crop growth. Upgrade 自動收款 makes the whole shop run by itself.

## Special orders (player hands over in person, big rewards)
⭐ VIP customer (after 超級市場) ×5 value; 🚚 truck (貨運站) ×3; 🚁 helicopter (停機坪) ×6 + 300.
Events: 市集日 double customers, 下雨 crops ×2. 停車場: cars bring extra customers who buy more.

## Upgrades (4 tabs)
角色: 背包容量, 移動速度 · 員工: 拿多少, 速度 · 農場: 雞, 牛, 作物, 小狗範圍 · 商店: 售價(10 levels), 貨架容量,
客人數量, 機器速度, 自動收款.

## UI (kept clean)
Money top-right. Left column: 升級 (角色 / 員工 / 動物 tabs), 倉庫 (what you carry + stock), 設定.
Everything else lives in the world (labels on zones, bubbles over customers).

## v3 changes (11-14, girlfriend feedback)
- Start with $50 and pick 番茄田($30) or 雞舍($40); the chain then branches by `req`/`any` in DEFS.
- No floating guide arrows. Chunky picket fences, round grass clumps.
- Shop has front/east walls, an automatic sliding door, wall lamps + light that switch on only while the player is inside.
- 雪櫃 for milk / juice / soymilk / cheese. 倉庫 (after 理貨員): roll-up door opens when someone comes near, 存入/取出 pads,
  shelvers pull from it and drop leftovers into it.
