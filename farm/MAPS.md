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

## Map 3 — 森林小鎮（forest lumber + building the town）— full design 11-15, waiting for the user's go
**Unlock:** inside the same game, from the harbour: light the lighthouse + total harbour earnings $150,000 → 「開分店：森林小鎮」 zone ($120,000). The 地圖 panel then lists 開心農場 / 海邊漁港 / 森林小鎮.

**Scene:** pine and maple forest, a river with a water wheel and a log flume, wooden bridges, mossy rocks, deer and squirrels, a half-built town on the east side (empty lots with dashed outlines that fill in as you build).

**Start:** $50, choose 伐木區 (chop trees → logs) or 蘑菇林 (forage mushrooms).

**Resources and industries (each unlocks with zones, gets workers and "+1" growth):**
| Industry | Input → output | Workers |
|---|---|---|
| 伐木區 (pine, oak, maple; maple and oak rarer) | trees → 原木 (3 kinds) | 伐木工, 植樹員 (replants saplings) |
| 鋸木廠 (water wheel) | 原木 → 木板 | 搬運工 |
| 刨木機 | 木板 → 精製木材 | — |
| 木工坊 | 精製木材 → 椅子 / 桌子 / 床 / 書櫃 / 搖椅 | 木匠 |
| 造紙廠 | 木屑 (from the sawmill) → 紙 / 筆記本 | — |
| 楓糖屋 | 楓樹汁 → 楓糖漿 | 採汁員 |
| 蜂場 | flowers → 蜂蜜 / 蜂蠟蠟燭 | 養蜂人 |
| 蘑菇林 / 菇寮 | → 香菇 / 松露 (rare) | 採菇員 |
| 河道運木 | logs float down the flume to the sawmill automatically | — |

**Shops:** 家具展示館 (furniture with sizes on display, customers walk around and pick a piece, delivered by a 送貨員 truck) and 森林市集 (honey, syrup, mushrooms, notebooks, candles).

**New mechanic — build the town:** each empty lot is a construction site that asks for materials (木板, 精製木材, furniture, paper). Finished buildings bring residents and a lasting bonus:
房屋 (more customers) → 麵包店 (sells your syrup and honey) → 學校 (workers faster) → 公園 (customers happier) → 消防局 (fire events smaller) → 火車站 (big orders by train, like the helicopter) → 鐘樓 (final goal: the town festival).

**Specials:** 森林大火 (water the trees fast or lose them), 伐木大賽 (double logs for 40 s), 雪季 (winter: trees grow slowly, furniture sells higher), 火車大訂單.

**Collection:** 家具圖鑑 — every furniture piece and colour you have made; finishing a set pays a reward.

**Length:** about 55 unlock steps plus town buildings, like the harbour.
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
