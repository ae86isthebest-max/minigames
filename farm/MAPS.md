# 開心農場鋪 — new maps + growth ideas (proposal 11-14, waiting for user OK)

## How you get to a new map
- A "分店" sign appears at the road once total earnings reach $40,000 and the supermarket is built.
- Pay $15,000 to open map 2, later $120,000 for map 3. A 地圖 button (left column) switches maps any time.
- Only the map you are on runs, so the phone never draws three maps at once (keeps it smooth).
- Coming back: "你離開期間賺咗 $X" — automated maps earn a share while you are away (offline earnings).

## Map 2 — 海邊漁港 (seaside harbour)
- Ground: sand, wooden piers, sea with gentle waves, lighthouse, seagulls.
- Start: $50 again, choose 釣魚碼頭 (fish) or 海帶田 (seaweed).
- Loop: fishing boats sail out and come back with fish → ice machine (fish must be iced before sale) → fish counter.
- Processing: 壽司吧 (fish + rice), 罐頭工廠 (fish → canned fish), 魚乾架 (sun-dried fish).
- New mechanic: dine-in restaurant — customers sit at tables, food is carried to them, tables must be cleared
  before the next guest sits (workers: 侍應, 洗碗員).
- Special: cruise ship tourists (big VIP group), fishing contest event.

## Map 3 — 森林伐木場 + 小鎮建設 (forest lumber + building the town)
- Ground: pine forest, river with a water wheel, dirt roads, half-built town on one side.
- Loop: chop trees → sawmill → planks → furniture workshop (chairs, tables, beds) → furniture showroom.
- Replanting: saplings grow back over time; a 植樹員 worker replants automatically.
- New mechanic: town building orders — deliver planks + furniture to build houses, school, park;
  every finished building adds townspeople = more customers and a permanent income bonus.
- Special: forest fire event (water the trees fast), log river transport.

## More growth ideas for all maps
1. 商店升級: shop size levels, self-checkout machines, bigger fridges.
2. 自動化: conveyor belts (coop → shelf), robot restockers, harvester tractor.
3. 客人星級: happy customers raise the star rating → more and richer customers.
4. 裝飾: flower beds, benches, lamps raise happiness.
5. 每日任務／成就 with gem rewards; gems buy time boosters.
6. 季節: spring/summer/autumn/winter change crops and prices.

## Performance
Fully built farm today: ~360 draw calls in the shop view, ~800 in the busiest farm view (shadows included).
Fine on a recent iPhone, may drop frames on older ones. Planned fix before adding maps: merge each finished
building's static parts into one mesh (roughly halves the count), share item meshes, one map loaded at a time.
