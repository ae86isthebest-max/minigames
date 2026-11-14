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

## Unlock chain
雞舍(禾草5) → 雞蛋架(木4) → 番茄田($20) → 番茄架($25+木5) → 收銀員($60) → 農夫($100)
→ 玉米田($120+木8) → 玉米架($90) → 小狗($150+木10) → 理貨員($180) → 牛棚($220+禾草15+木12)
→ 牛奶架($150) → 貨運站($300+木20) → 小貓($260) → 第二雞舍($350+木15)

## Workers / pets
收銀員 stays at the counter. 農夫 cuts grass and feeds coops/barn. 理貨員 moves produce to shelves.
小狗 follows you and pulls in cash from further away. 小貓 sits by the counter: +1 tip per sale.

## Events
訂單卡車 (after 貨運站): truck orders items for a big reward. 市集日: double customers.
下雨: crops grow twice as fast.

## UI (kept clean)
Money top-right. Left column: 升級 (角色 / 員工 / 動物 tabs), 倉庫 (what you carry + stock), 設定.
Everything else lives in the world (labels on zones, bubbles over customers).
