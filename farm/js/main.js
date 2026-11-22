// 開心農場鋪 v2 — walk, carry, unlock, hire, automate. Original game, art from the shared style kit.
import * as THREE from 'three';
import * as K from './kit.js';
import * as P from './props.js';
import * as P2 from './props2.js';
import { Joystick } from './input.js';
import { createNav } from './nav.js';
import './update.js';

const { C, G } = K;
const ITEMS = P.ITEMS;
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const dist2 = (a, x, z) => Math.hypot(a.x - x, a.z - z);
const easeBack = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------- the long unlock chain (each opens after the previous one) ----------
const SH_Z = -14.6, SH_Z2 = -23.6, DEPT_Z = -25.6; // 2nd shelf row and back wall once the 百貨公司 is built
// 大擴充: the new goods get their own back-to-back rows inside the 百貨公司, facing the middle walkway (z -18.6)
// and the back walkway (z -21.8); their zones sit on the walkway side
const R1B = -15.75, R2B = -20.0, R1B_ZONE = -17.45, R2B_ZONE = -18.8;
// 新館 rows (z -25.6 → -33.6): one facing the back walkway, one against the back wall; zones on the free side
const H1_Z = -27.6, H1_ZONE = -26.6, H2_Z = -32.0, H2_ZONE = -30.3;
const DEFS = [
  { id: 'tomato', name: '番茄田', kind: 'crop', out: 'tomato', plant: 'tomato', grow: 6, pos: [8.9, 1.2], cost: { money: 30 }, req: [], alt: 'coop' },
  { id: 'coop', name: '雞舍', kind: 'producer', in: 'hay', out: 'egg', pos: [2.7, 1], cost: { money: 40 }, req: [], alt: 'tomato' },
  { id: 'shelfTomato', name: '番茄架', kind: 'shelf', item: 'tomato', pos: [-1.6, SH_Z], cost: { money: 20 }, req: ['tomato', 'counter'] },
  { id: 'shelfEgg', name: '雞蛋架', kind: 'shelf', item: 'egg', pos: [-4.6, SH_Z], cost: { money: 10 }, req: ['coop', 'counter'] },
  { id: 'counter', name: '收銀台', kind: 'counter1', zone: [4.6, -8.6], cost: { money: 0 }, any: ['tomato', 'coop'] },
  { id: 'cashier', name: '收銀員', kind: 'hire', role: 'cashier', counter: 0, zone: [6.6, -12.6], cost: { money: 80 }, req: ['counter'], any: ['shelfTomato', 'shelfEgg'] },
  { id: 'keeper', name: '飼養員', desc: '負責動物：割草餵雞餵牛餵羊，雞蛋牛奶羊毛放進倉庫', kind: 'hire', role: 'keeper', zone: [-1.4, 5.4], cost: { money: 90 }, req: ['coop', 'shelfEgg'] },
  { id: 'corn', name: '玉米田', kind: 'crop', out: 'corn', plant: 'corn', grow: 6, pos: [9, 6.8], cost: { money: 160, wood: 10 }, req: ['cashier'] },
  { id: 'shelfCorn', name: '玉米架', kind: 'shelf', item: 'corn', pos: [1.4, SH_Z], cost: { money: 130 }, req: ['corn'] },
  { id: 'farmer', name: '農夫', desc: '負責田地和機器：收成放進倉庫，從倉庫拿材料進機器', kind: 'hire', role: 'farmer', zone: [-2, 1.6], cost: { money: 120 }, req: ['shelfCorn', 'coop'] },
  { id: 'dog', name: '小狗', desc: '跟著你跑，站遠一點也能把錢吸過來；買了才能請理貨員', kind: 'pet', zone: [-1, -4.6], cost: { money: 160, wood: 10 }, req: ['shelfCorn'] },
  { id: 'shelver', name: '理貨員', desc: '負責商店：從倉庫拿貨補上貨架', kind: 'hire', role: 'shelver', zone: [1.6, -5], cost: { money: 250 }, req: ['dog'] },
  // from here on everything costs about 2.75× the old prices (大擴充 11-15: the farm takes much longer to finish)
  { id: 'warehouse', name: '倉庫', desc: '員工專用：農場的貨都先放進倉庫，理貨員再從這裡上架', kind: 'store', pos: [10.6, -14.2], zone: [10.6, -10.8], cost: { money: 770, wood: 16 }, req: ['shelver'] },
  { id: 'sprinkler', name: '自動灑水器', desc: '所有作物長得更快', kind: 'sprinkler', zone: [11.6, 4], cost: { money: 720, wood: 12 } },
  { id: 'barn', name: '牛棚', kind: 'producer', in: 'hay', out: 'milk', pos: [-4.5, 10.2], cost: { money: 940, hay: 16, wood: 14 } },
  { id: 'shelfMilk', name: '牛奶冷藏櫃', kind: 'shelf', fridge: true, item: 'milk', pos: [4.4, SH_Z], cost: { money: 660 } },
  { id: 'market', name: '超級市場', desc: '店面加大一倍，可以擺更多貨架', kind: 'market', zone: [-12, -10], cost: { money: 3300, wood: 32 } },
  { id: 'gateCafe', name: '開分店：山城咖啡館', desc: '要先開好擴建區和 3 條新產品線', kind: 'mapgate', map: 'cafe', zone: [11.2, -1.9], cost: { money: 150000 }, req: ['market', 'expand'], lines: 3, earned: 400000 },
  { id: 'juicer', name: '果汁機', kind: 'machine', mk: 'juicer', in: 'tomato', out: 'juice', iv: 3, pos: [5.5, -2.7], upAt: [2.6, -2.4], cost: { money: 1540, wood: 16 }, req: ['market'] },
  { id: 'shelfJuice', name: '果汁冷藏櫃', kind: 'shelf', fridge: true, item: 'juice', pos: [-8.6, SH_Z], cost: { money: 1100 } },
  { id: 'shelver2', name: '理貨員', desc: '負責商店：從倉庫拿貨補上貨架', kind: 'hire', role: 'shelver', zone: [-4.4, -5], cost: { money: 2200 } },
  { id: 'soy', name: '黃豆田', kind: 'crop', out: 'soybean', plant: 'soy', grow: 9, pos: [-9.5, 18.5], cost: { money: 1980, wood: 20 } },
  { id: 'soyMachine', name: '磨豆漿機', kind: 'machine', mk: 'soy', in: 'soybean', out: 'soymilk', iv: 3.5, pos: [-3, 18.6], upAt: [-3, 21.3], cost: { money: 2420 } },
  { id: 'shelfSoy', name: '豆漿冷藏櫃', kind: 'shelf', fridge: true, item: 'soymilk', pos: [-11.6, SH_Z], cost: { money: 1760 } },
  { id: 'dock', name: '貨運站', desc: '貨車會來下大訂單，裝滿就拿大錢', kind: 'dock', pos: [12.2, 6], zone: [12, 6], cost: { money: 2640, wood: 24 } },
  { id: 'counter2', name: '第二收銀台', desc: '多一個收銀台，客人不用排太久', kind: 'counter2', zone: [-16.5, -9.6], cost: { money: 2200 } },
  { id: 'cashier2', name: '第二收銀員', kind: 'hire', role: 'cashier', counter: 1, zone: [-19.7, -10.4], cost: { money: 2750 } },
  { id: 'counter3', name: '第三收銀台', desc: '再開一條隊，客人分開排、結帳更快', kind: 'counterX', counter: 2, zone: [-0.6, -8.7], cost: { money: 600 }, req: ['cashier', 'shelfCorn'] },
  { id: 'cashier3', name: '第三收銀員', kind: 'hire', role: 'cashier', counter: 2, zone: [-0.6, -12.7], cost: { money: 500 }, req: ['counter3'] },
  { id: 'counter4', name: '第四收銀台', desc: '再開一條隊，客人分開排、結帳更快', kind: 'counterX', counter: 3, zone: [-6.4, -8.7], cost: { money: 4950 }, req: ['market', 'counter3'] },
  { id: 'cashier4', name: '第四收銀員', kind: 'hire', role: 'cashier', counter: 3, zone: [-5.9, -12.7], cost: { money: 2480 }, req: ['counter4'] },
  { id: 'cat', req: ['cashier2'], name: '小貓', desc: '坐在收銀台，每位客人多付一點小費', kind: 'pet', zone: [1.8, -11.0], cost: { money: 2200 } },
  { id: 'parking', name: '停車場', desc: '開車來的客人更多', kind: 'parking', zone: [21, -10], cost: { money: 5780, wood: 48 } },
  { id: 'wheat', name: '小麥田', kind: 'crop', out: 'wheat', plant: 'wheat', grow: 10, pos: [-9.5, 24.5], cost: { money: 4840 } },
  { id: 'oven', name: '麵包窯', kind: 'machine', mk: 'oven', in: 'wheat', out: 'bread', iv: 4, pos: [-3, 24.6], upAt: [-3, 27.4], cost: { money: 6600, wood: 40 } },
  { id: 'shelfBread', name: '麵包架', kind: 'shelf', item: 'bread', pos: [-14.6, SH_Z], cost: { money: 4840 } },
  { id: 'farmer2', name: '農夫', desc: '負責田地和機器：收成放進倉庫，從倉庫拿材料進機器', kind: 'hire', role: 'farmer', zone: [-2, 14.6], cost: { money: 6600 } },
  { id: 'coop2', name: '第二雞舍', kind: 'producer', in: 'hay', out: 'egg', pos: [2, 7.4], cost: { money: 5720, wood: 32 } },
  { id: 'cheese', name: '起司坊', kind: 'machine', mk: 'cheese', in: 'milk', out: 'cheese', iv: 4.5, pos: [3.4, 12.8], zone: [4.8, 13.2], upAt: [3.4, 15.5], cost: { money: 8360 } },
  { id: 'shelfCheese', name: '起司冷藏櫃', kind: 'shelf', fridge: true, item: 'cheese', pos: [-17.6, SH_Z], cost: { money: 6160 } },
  { id: 'shelver3', name: '理貨員', desc: '負責商店：從倉庫拿貨補上貨架', kind: 'hire', role: 'shelver', zone: [-8.6, -5], cost: { money: 9630 } },
  { id: 'orchard', name: '蘋果園', kind: 'crop', out: 'apple', plant: 'apple', grow: 12, pos: [8.5, 23.5], cost: { money: 9900, wood: 56 } },
  { id: 'shelfApple', name: '蘋果架', kind: 'shelf', item: 'apple', pos: [-11.6, -10.6], cost: { money: 7040 } },
  { id: 'helipad', name: '停機坪', desc: '直升機會來下超大訂單', kind: 'helipad', zone: [23.5, 6], cost: { money: 19800, wood: 96 } },
  // 百貨公司: the shop grows back to z -25.6, gets a 2nd door and a 2nd row of the same shelves
  { id: 'dept', name: '百貨公司', desc: '商店往後擴大一倍、多一道門，可以擺第二排同款貨架', kind: 'dept', zone: [-3.5, -12.0], cost: { money: 11000, wood: 40 }, req: ['market', 'counter2'] },
  { id: 'shelfCorn2', name: '玉米架２', kind: 'shelf', item: 'corn', pos: [1.4, SH_Z2], cost: { money: 720 }, req: ['dept', 'shelfCorn'] },
  { id: 'shelfTomato2', name: '番茄架２', kind: 'shelf', item: 'tomato', pos: [-1.6, SH_Z2], cost: { money: 660 }, req: ['dept', 'shelfTomato'] },
  { id: 'shelfEgg2', name: '雞蛋架２', kind: 'shelf', item: 'egg', pos: [-4.6, SH_Z2], cost: { money: 660 }, req: ['dept', 'shelfEgg'] },
  { id: 'shelfMilk2', name: '牛奶冷藏櫃２', kind: 'shelf', fridge: true, item: 'milk', pos: [4.4, SH_Z2], cost: { money: 1320 }, req: ['dept', 'shelfMilk'] },
  { id: 'shelfJuice2', name: '果汁冷藏櫃２', kind: 'shelf', fridge: true, item: 'juice', pos: [-8.6, SH_Z2], cost: { money: 2200 }, req: ['dept', 'shelfJuice'] },
  { id: 'shelfSoy2', name: '豆漿冷藏櫃２', kind: 'shelf', fridge: true, item: 'soymilk', pos: [-11.6, SH_Z2], cost: { money: 3300 }, req: ['dept', 'shelfSoy'] },
  { id: 'shelfBread2', name: '麵包架２', kind: 'shelf', item: 'bread', pos: [-14.6, SH_Z2], cost: { money: 6050 }, req: ['dept', 'shelfBread'] },
  { id: 'shelfCheese2', name: '起司冷藏櫃２', kind: 'shelf', fridge: true, item: 'cheese', pos: [-17.6, SH_Z2], cost: { money: 7700 }, req: ['dept', 'shelfCheese'] },
  { id: 'shelver4', name: '理貨員', req: ['helipad'], desc: '負責商店：從倉庫拿貨補上貨架', kind: 'hire', role: 'shelver', zone: [-12.6, -5.9], cost: { money: 19250 } },
  // ---------- 大擴充 (11-15): new land south of the old fence, 5 new product lines, 2nd production buildings ----------
  // every def below has its own req, so old saves keep their place in the chain
  { id: 'expand', name: '擴建：南邊農地', desc: '拆掉南邊圍欄，開出一大片新農地', kind: 'expand', zone: [3.0, 29.4], big: 1.5, cost: { money: 30000, wood: 60 }, req: ['shelfApple', 'dept'] },
  { id: 'carrot', name: '紅蘿蔔田', kind: 'crop', out: 'carrot', plant: 'carrot', grow: 9, pos: [-16, 36.5], cost: { money: 6000 }, req: ['expand'] },
  { id: 'shelfCarrot', name: '紅蘿蔔架', kind: 'shelf', flip: true, item: 'carrot', pos: [4.4, R1B], zone: [4.4, R1B_ZONE], cost: { money: 4500 }, req: ['carrot'] },
  { id: 'strawberry', name: '草莓園', kind: 'crop', out: 'strawberry', plant: 'strawberry', grow: 10, pos: [-10, 36.5], cost: { money: 9000 }, req: ['shelfCarrot'] },
  { id: 'shelfStraw', name: '草莓架', kind: 'shelf', flip: true, item: 'strawberry', pos: [1.4, R1B], zone: [1.4, R1B_ZONE], cost: { money: 6500 }, req: ['strawberry'] },
  { id: 'barn2', name: '第二牛棚', kind: 'producer', in: 'hay', out: 'milk', pos: [-16, 44], cost: { money: 12000, wood: 40 }, req: ['shelfStraw'] },
  { id: 'jam', name: '果醬機', kind: 'machine', mk: 'jam', in: 'strawberry', out: 'jam', iv: 4.5, pos: [-4.2, 36.8], upAt: [-4.2, 39.5], cost: { money: 15000 }, req: ['shelfStraw'] },
  { id: 'shelfJam', name: '果醬架', kind: 'shelf', flip: true, item: 'jam', pos: [-1.6, R1B], zone: [-1.6, R1B_ZONE], cost: { money: 11000 }, req: ['jam'] },
  { id: 'farmer3', name: '農夫', desc: '負責田地和機器：收成放進倉庫，從倉庫拿材料進機器', kind: 'hire', role: 'farmer', zone: [1.2, 33.8], cost: { money: 6000 }, req: ['jam'] },
  { id: 'juicer2', name: '第二果汁機', kind: 'machine', mk: 'juicer', in: 'tomato', out: 'juice', iv: 3, pos: [10, 51.8], upAt: [10, 54.5], cost: { money: 16000 }, req: ['shelfJam'] },
  { id: 'pumpkin', name: '南瓜田', kind: 'crop', out: 'pumpkin', plant: 'pumpkin', grow: 12, pos: [-10, 44], cost: { money: 20000 }, req: ['shelfJam'] },
  { id: 'shelfPumpkin', name: '南瓜架', kind: 'shelf', flip: true, item: 'pumpkin', pos: [-4.6, R1B], zone: [-4.6, R1B_ZONE], cost: { money: 15000 }, req: ['pumpkin'] },
  { id: 'pie', name: '南瓜派烤爐', kind: 'machine', mk: 'pie', in: 'pumpkin', out: 'pie', iv: 5, pos: [-4.2, 44.3], upAt: [-4.2, 47.0], cost: { money: 28000, wood: 50 }, req: ['shelfPumpkin'] },
  { id: 'shelfPie', name: '南瓜派架', kind: 'shelf', flip: true, item: 'pie', pos: [-8.6, R1B], zone: [-8.6, R1B_ZONE], cost: { money: 22000 }, req: ['pie'] },
  { id: 'shelver5', name: '理貨員', desc: '負責商店：從倉庫拿貨補上貨架', kind: 'hire', role: 'shelver', zone: [-16.6, -5.9], cost: { money: 20000 }, req: ['shelfPie'] },
  { id: 'coop3', name: '第三雞舍', kind: 'producer', in: 'hay', out: 'egg', pos: [3.6, 51.5], cost: { money: 24000, wood: 40 }, req: ['shelfPumpkin'] },
  { id: 'sheep', name: '羊圈', desc: '羊吃草長羊毛，旁邊有一片新草地', kind: 'producer', in: 'hay', out: 'wool', pos: [3.8, 44], cost: { money: 36000, wood: 60 }, req: ['shelfPie'] },
  { id: 'yarn', name: '毛線機', kind: 'machine', mk: 'yarn', in: 'wool', out: 'yarn', iv: 5.5, pos: [10, 44.3], upAt: [10, 47.0], cost: { money: 45000 }, req: ['sheep'] },
  { id: 'shelfYarn', name: '毛線架', kind: 'shelf', flip: true, item: 'yarn', pos: [-11.6, R1B], zone: [-11.6, R1B_ZONE], cost: { money: 34000 }, req: ['yarn'] },
  { id: 'keeper2', name: '飼養員', desc: '負責動物：割草餵雞餵牛餵羊，雞蛋牛奶羊毛放進倉庫', kind: 'hire', role: 'keeper', zone: [-2.2, 33.8], cost: { money: 6000 }, req: ['sheep'] },
  { id: 'cheese2', name: '第二起司坊', kind: 'machine', mk: 'cheese', in: 'milk', out: 'cheese', iv: 4.5, pos: [-4.2, 51.8], upAt: [-4.2, 54.5], cost: { money: 40000 }, req: ['shelfYarn'] },
  { id: 'oven2', name: '第二麵包窯', kind: 'machine', mk: 'oven', in: 'wheat', out: 'bread', iv: 4, pos: [-16, 51.8], upAt: [-16, 54.5], cost: { money: 38000, wood: 40 }, req: ['shelfYarn'] },
  { id: 'flowers', name: '花田', desc: '種花給蜜蜂採蜜', kind: 'crop', out: 'flower', plant: 'flower', grow: 8, pos: [3.8, 36.5], cost: { money: 55000 }, req: ['shelfYarn'] },
  { id: 'hive', name: '蜂箱', kind: 'machine', mk: 'hive', in: 'flower', out: 'honey', iv: 5, pos: [10, 36.8], upAt: [10, 39.5], cost: { money: 70000, wood: 80 }, req: ['flowers'] },
  { id: 'shelfHoney', name: '蜂蜜架', kind: 'shelf', flip: true, item: 'honey', pos: [-14.6, R1B], zone: [-14.6, R1B_ZONE], cost: { money: 50000 }, req: ['hive'] },
  { id: 'soyMachine2', name: '第二磨豆漿機', kind: 'machine', mk: 'soy', in: 'soybean', out: 'soymilk', iv: 3.5, pos: [-10, 51.8], upAt: [-10, 54.5], cost: { money: 60000 }, req: ['shelfHoney'] },
  // second copies of the new shelves, back to back in the 百貨公司 (same column as the first one)
  { id: 'shelfCarrot2', name: '紅蘿蔔架２', kind: 'shelf', flip: true, item: 'carrot', pos: [4.4, R2B], zone: [4.4, R2B_ZONE], cost: { money: 9000 }, req: ['shelfCarrot', 'expand'] },
  { id: 'shelfStraw2', name: '草莓架２', kind: 'shelf', flip: true, item: 'strawberry', pos: [1.4, R2B], zone: [1.4, R2B_ZONE], cost: { money: 13000 }, req: ['shelfStraw', 'expand'] },
  { id: 'shelfJam2', name: '果醬架２', kind: 'shelf', flip: true, item: 'jam', pos: [-1.6, R2B], zone: [-1.6, R2B_ZONE], cost: { money: 22000 }, req: ['shelfJam', 'expand'] },
  { id: 'shelfPumpkin2', name: '南瓜架２', kind: 'shelf', flip: true, item: 'pumpkin', pos: [-4.6, R2B], zone: [-4.6, R2B_ZONE], cost: { money: 30000 }, req: ['shelfPumpkin', 'expand'] },
  { id: 'shelfPie2', name: '南瓜派架２', kind: 'shelf', flip: true, item: 'pie', pos: [-8.6, R2B], zone: [-8.6, R2B_ZONE], cost: { money: 44000 }, req: ['shelfPie', 'expand'] },
  { id: 'shelfYarn2', name: '毛線架２', kind: 'shelf', flip: true, item: 'yarn', pos: [-11.6, R2B], zone: [-11.6, R2B_ZONE], cost: { money: 68000 }, req: ['shelfYarn', 'expand'] },
  // more warehouses on the free land east of the road: they share one stock with the first
  { id: 'warehouse2', name: '第二倉庫', desc: '和第一座倉庫共用存貨，容量再多一座', kind: 'store', pos: [22.0, 15.5], zone: [22.0, 19.4], cost: { money: 15000, wood: 30 }, req: ['warehouse', 'market'] },
  { id: 'warehouse3', name: '第三倉庫', desc: '和其他倉庫共用存貨，容量再多一座', kind: 'store', pos: [22.0, 25.0], zone: [22.0, 28.9], cost: { money: 40000, wood: 40 }, req: ['warehouse2', 'dept'] },
  // 新館 behind the 百貨公司: a third copy of every shelf (each needs the second one)
  { id: 'hall', name: '新館', desc: '百貨公司後面再蓋一館，每種貨架可以擺第三個', kind: 'hall', zone: [6.6, -24.4], cost: { money: 90000, wood: 60 }, req: ['dept', 'expand'] },
  { id: 'shelfCorn3', name: '玉米架３', kind: 'shelf', flip: true, item: 'corn', pos: [1.4, H1_Z], zone: [1.4, H1_ZONE], cost: { money: 2200 }, req: ['shelfCorn2', 'hall'] },
  { id: 'shelfTomato3', name: '番茄架３', kind: 'shelf', flip: true, item: 'tomato', pos: [-1.6, H1_Z], zone: [-1.6, H1_ZONE], cost: { money: 2000 }, req: ['shelfTomato2', 'hall'] },
  { id: 'shelfEgg3', name: '雞蛋架３', kind: 'shelf', flip: true, item: 'egg', pos: [-4.6, H1_Z], zone: [-4.6, H1_ZONE], cost: { money: 2000 }, req: ['shelfEgg2', 'hall'] },
  { id: 'shelfMilk3', name: '牛奶冷藏櫃３', kind: 'shelf', flip: true, fridge: true, item: 'milk', pos: [4.4, H1_Z], zone: [4.4, H1_ZONE], cost: { money: 4000 }, req: ['shelfMilk2', 'hall'] },
  { id: 'shelfJuice3', name: '果汁冷藏櫃３', kind: 'shelf', flip: true, fridge: true, item: 'juice', pos: [-8.6, H1_Z], zone: [-8.6, H1_ZONE], cost: { money: 6600 }, req: ['shelfJuice2', 'hall'] },
  { id: 'shelfSoy3', name: '豆漿冷藏櫃３', kind: 'shelf', flip: true, fridge: true, item: 'soymilk', pos: [-11.6, H1_Z], zone: [-11.6, H1_ZONE], cost: { money: 9900 }, req: ['shelfSoy2', 'hall'] },
  { id: 'shelfBread3', name: '麵包架３', kind: 'shelf', flip: true, item: 'bread', pos: [-14.6, H1_Z], zone: [-14.6, H1_ZONE], cost: { money: 18000 }, req: ['shelfBread2', 'hall'] },
  { id: 'shelfCheese3', name: '起司冷藏櫃３', kind: 'shelf', flip: true, fridge: true, item: 'cheese', pos: [-17.6, H1_Z], zone: [-17.6, H1_ZONE], cost: { money: 23000 }, req: ['shelfCheese2', 'hall'] },
  { id: 'shelfCarrot3', name: '紅蘿蔔架３', kind: 'shelf', item: 'carrot', pos: [4.4, H2_Z], zone: [4.4, H2_ZONE], cost: { money: 27000 }, req: ['shelfCarrot2', 'hall'] },
  { id: 'shelfStraw3', name: '草莓架３', kind: 'shelf', item: 'strawberry', pos: [1.4, H2_Z], zone: [1.4, H2_ZONE], cost: { money: 39000 }, req: ['shelfStraw2', 'hall'] },
  { id: 'shelfJam3', name: '果醬架３', kind: 'shelf', item: 'jam', pos: [-1.6, H2_Z], zone: [-1.6, H2_ZONE], cost: { money: 66000 }, req: ['shelfJam2', 'hall'] },
  { id: 'shelfPumpkin3', name: '南瓜架３', kind: 'shelf', item: 'pumpkin', pos: [-4.6, H2_Z], zone: [-4.6, H2_ZONE], cost: { money: 90000 }, req: ['shelfPumpkin2', 'hall'] },
  { id: 'shelfPie3', name: '南瓜派架３', kind: 'shelf', item: 'pie', pos: [-8.6, H2_Z], zone: [-8.6, H2_ZONE], cost: { money: 130000 }, req: ['shelfPie2', 'hall'] },
  { id: 'shelfYarn3', name: '毛線架３', kind: 'shelf', item: 'yarn', pos: [-11.6, H2_Z], zone: [-11.6, H2_ZONE], cost: { money: 200000 }, req: ['shelfYarn2', 'hall'] },
  { id: 'shelfHoney3', name: '蜂蜜架３', kind: 'shelf', item: 'honey', pos: [-14.6, H2_Z], zone: [-14.6, H2_ZONE], cost: { money: 300000 }, req: ['shelfHoney2', 'hall'] },
  // more entrances: a cheap side door early on, a 4th door on the market front later (the 3rd one opens with the 超級市場)
  { id: 'doorB', name: '側門', desc: '多開一道門，客人不用都擠在大門', kind: 'door', zone: [-3.5, -8.6], cost: { money: 300 }, req: ['shelfCorn'] },
  { id: 'doorD', name: '第四道門', desc: '超市西邊再開一道門', kind: 'door', zone: [-19.2, -8.6], cost: { money: 8000 }, req: ['market', 'counter2'] },
  { id: 'shelfHoney2', name: '蜂蜜架２', kind: 'shelf', flip: true, item: 'honey', pos: [-14.6, R2B], zone: [-14.6, R2B_ZONE], cost: { money: 100000 }, req: ['shelfHoney', 'expand'] },
  // 11-17: more kinds of goods — 布丁 (eggs), 番茄醬 (tomatoes), 蘋果汁 (apples); the machines stand on the free west strip
  { id: 'pudding', name: '布丁機', kind: 'machine', mk: 'pudding', in: 'egg', out: 'pudding', iv: 4, pos: [-16, 19.8], upAt: [-16, 22.5], cost: { money: 9000 }, req: ['shelfCheese', 'dept'] },
  { id: 'shelfPudding', name: '布丁冷藏櫃', kind: 'shelf', flip: true, fridge: true, item: 'pudding', pos: [-17.6, R1B], zone: [-17.6, R1B_ZONE], cost: { money: 7000 }, req: ['pudding'] },
  { id: 'ketchup', name: '番茄醬機', kind: 'machine', mk: 'ketchup', in: 'tomato', out: 'ketchup', iv: 4, pos: [-16, 25.0], upAt: [-16, 27.7], cost: { money: 14000 }, req: ['shelfPudding'] },
  { id: 'shelfKetchup', name: '番茄醬架', kind: 'shelf', flip: true, item: 'ketchup', pos: [-17.6, R2B], zone: [-17.6, R2B_ZONE], cost: { money: 10000 }, req: ['ketchup'] },
  { id: 'cider', name: '蘋果汁機', kind: 'machine', mk: 'cider', in: 'apple', out: 'cider', iv: 4.5, pos: [-16, 30.2], upAt: [-16, 32.9], cost: { money: 26000 }, req: ['shelfKetchup', 'orchard', 'hall'] },
  { id: 'shelfCider', name: '蘋果汁冷藏櫃', kind: 'shelf', fridge: true, item: 'cider', pos: [-17.6, H2_Z], zone: [-17.6, H2_ZONE], cost: { money: 20000 }, req: ['cider'] },
  // up to 10 warehouses: two rows on the free land east of the road, all sharing one stock
  { id: 'warehouse4', name: '第四倉庫', desc: '和其他倉庫共用存貨，容量再多一座', kind: 'store', pos: [27.2, 15.5], zone: [27.2, 19.4], cost: { money: 70000, wood: 60 }, req: ['warehouse3'] },
  { id: 'warehouse5', name: '第五倉庫', desc: '和其他倉庫共用存貨，容量再多一座', kind: 'store', pos: [27.2, 25.0], zone: [27.2, 28.9], cost: { money: 90000, wood: 60 }, req: ['warehouse4'] },
  { id: 'warehouse6', name: '第六倉庫', desc: '和其他倉庫共用存貨，容量再多一座', kind: 'store', pos: [22.0, 34.5], zone: [22.0, 38.4], cost: { money: 120000, wood: 60 }, req: ['warehouse5', 'expand'] },
  { id: 'warehouse7', name: '第七倉庫', desc: '和其他倉庫共用存貨，容量再多一座', kind: 'store', pos: [27.2, 34.5], zone: [27.2, 38.4], cost: { money: 150000, wood: 60 }, req: ['warehouse6'] },
  { id: 'warehouse8', name: '第八倉庫', desc: '和其他倉庫共用存貨，容量再多一座', kind: 'store', pos: [22.0, 44.0], zone: [22.0, 47.9], cost: { money: 190000, wood: 60 }, req: ['warehouse7'] },
  { id: 'warehouse9', name: '第九倉庫', desc: '和其他倉庫共用存貨，容量再多一座', kind: 'store', pos: [27.2, 44.0], zone: [27.2, 47.9], cost: { money: 230000, wood: 60 }, req: ['warehouse8'] },
  { id: 'warehouse10', name: '第十倉庫', desc: '和其他倉庫共用存貨，容量再多一座', kind: 'store', pos: [22.0, 53.5], zone: [22.0, 57.4], cost: { money: 280000, wood: 60 }, req: ['warehouse9'] },
];
// the café gate counts a new product line once its first shelf is up
const NEW_LINES = ['shelfCarrot', 'shelfStraw', 'shelfPumpkin', 'shelfYarn', 'shelfHoney'];
const DEF = Object.fromEntries(DEFS.map((d) => [d.id, d]));

const lv = (n, base, k) => Array.from({ length: n }, (_, i) => Math.round(base * Math.pow(k, i) / 10) * 10);
const UPS = {
  cap: { tab: 0, name: '背包容量', ic: 'hay', vals: [6, 12, 20, 30, 40, 52, 64, 76], cost: [30, 100, 690, 1510, 2750, 4500, 7500], fmt: (v) => v + ' 個' },
  speed: { tab: 0, name: '移動速度', ic: 'run', vals: [5.8, 6.6, 7.4, 8.2, 8.8, 9.4, 10, 10.6, 11.2], cost: [40, 120, 770, 1510, 2480, 4000, 7000, 11000], fmt: (v) => v.toFixed(1) },
  wcap: { tab: 1, name: '員工一次拿多少', ic: 'egg', vals: [4, 7, 11, 16, 21, 26, 30, 34, 38], cost: [90, 250, 1510, 2750, 4950, 8000, 14000, 24000], fmt: (v) => v + ' 個' },
  wspeed: { tab: 1, name: '員工速度', ic: 'run', vals: [4, 4.8, 5.6, 6.4, 7, 7.6, 8.2, 8.8, 9.4, 10], cost: [90, 250, 1510, 2750, 4950, 8000, 14000, 24000, 40000], fmt: (v) => v.toFixed(1) },
  coop: { tab: 2, name: '雞生蛋速度', ic: 'egg', need: 'coop', vals: [3, 2.5, 2, 1.6, 1.3, 1.0, 0.8, 0.65, 0.5], cost: [50, 130, 770, 1510, 2750, 5000, 9000, 16000], fmt: (v) => v + ' 秒一顆' },
  barn: { tab: 2, name: '牛奶速度', ic: 'milk', need: 'barn', vals: [5, 4.2, 3.4, 2.7, 2.1, 1.6, 1.3, 1.05, 0.85, 0.7], cost: [330, 770, 1510, 2750, 4950, 8000, 14000, 24000, 40000], fmt: (v) => v + ' 秒一瓶' },
  grow: { tab: 2, name: '作物生長速度', ic: 'tomato', need: 'tomato', vals: [1, 1.25, 1.5, 1.8, 2.2, 2.6, 3, 3.5, 4, 4.6], cost: [100, 250, 1430, 2610, 4680, 8000, 14000, 24000, 40000], fmt: (v) => '×' + v },
  dogR: { tab: 2, name: '小狗吸錢範圍', noLv: false, ic: 'money', need: 'dog', vals: [3, 5, 7, 9, 11, 13], cost: [150, 1100, 2480, 5000, 9000], fmt: (v) => v + ' 格' },
  price: { tab: 3, name: '商品售價', ic: 'money', need: 'cashier', vals: [1, 1.2, 1.45, 1.75, 2.05, 2.4, 2.6, 2.8, 3.0, 3.2, 3.4], cost: [200, 500, 3030, 6050, 11000, 18000, 30000, 50000, 80000, 130000], fmt: (v) => '×' + v },
  shelfCap: { tab: 3, name: '貨架容量', ic: 'egg', need: 'cashier', vals: [8, 14, 20, 30, 40, 50, 60, 70, 80], cost: [120, 320, 1930, 3850, 9000, 15000, 25000, 40000], fmt: (v) => v + ' 個' + (v >= 30 ? '，疊得高高的' : '') },
  storeCap: { tab: 3, name: '倉庫容量', ic: 'hay', need: 'warehouse', vals: [500, 1000, 2000, 3500, 5000, 8000, 12000, 18000, 25000], cost: [5000, 15000, 35000, 80000, 150000, 250000, 400000, 650000], fmt: (v) => '每座倉庫放 ' + v + ' 個' },
  cust: { tab: 3, name: '客人數量', ic: 'run', need: 'cashier', vals: [1, 1.2, 1.4, 1.6, 1.8, 2, 2.3, 2.6, 3], cost: [250, 550, 3030, 5500, 9630, 16000, 28000, 48000], fmt: (v) => '×' + v },
  mach: { tab: 2, name: '所有機器一起加速', ic: 'juice', need: 'juicer', vals: [1, 1.25, 1.5, 1.8, 2.2, 2.6, 3, 3.5, 4, 4.6], cost: [960, 2060, 4130, 7150, 12100, 20000, 35000, 60000, 100000], fmt: (v) => '×' + v },
  stockCap: { tab: 2, name: '動物棚和機器存貨量', ic: 'hay', need: 'juicer', vals: [12, 16, 20, 25, 30, 36, 42, 50], cost: [4000, 12000, 30000, 70000, 120000, 200000, 320000], fmt: (v) => '每盤放 ' + v + ' 個' + (v >= 25 ? '，堆成小山' : '') },
  mgrShop: { tab: 1, name: '店長', noLv: true, ic: 'mgr', emo: '👔', need: 'cashier', vals: [0, 1, 2, 3], cost: [3300, 11000, 33000], fmt: (v) => ['還沒請店長', '店長：結帳更快、客人給小費', '資深店長：小費更多、客人更有耐心', '金牌店長：小費最多、錢自動入袋'][v] },
  mgrFarm: { tab: 1, name: '農場主管', noLv: true, ic: 'mgr', emo: '🧢', need: 'keeper', vals: [0, 1, 2, 3], cost: [2750, 9630, 27500], fmt: (v) => ['還沒請農場主管', '主管：飼養員和農夫走更快', '資深主管：一次拿更多', '金牌主管：又快又能拿'][v] },
  floor: { tab: 3, name: '地板翻新', ic: 'shop', need: 'counter', vals: [0, 1, 2, 3], cost: [1650, 6600, 19250], fmt: (v) => ['原本的地板', '溫暖木地板', '奶油格子磚', '大理石＋金邊'][v] + (v ? '，客人更多' : '') },
  ad: { tab: 3, name: '路邊廣告牌', ic: 'shop', need: 'cashier', vals: [0, 1, 2, 3], cost: [1380, 5500, 17880], fmt: (v) => ['沒有廣告', '木頭立牌', '大型看板', '發光看板'][v] + (v ? '，路過的人更多' : '') },
  look: { tab: 3, name: '商店外觀', ic: 'shop', need: 'counter', vals: [0, 1, 2, 3], cost: [2200, 8250, 24750], fmt: (v) => LOOKS[v].name + ['', '・雨棚花台', '・燈串路燈', '・紅地毯旗幟'][v] + (v ? '，客人更多、賣更貴' : '') },
  basket: { tab: 3, name: '購物籃架', ic: 'bk', emo: '🧺', need: 'cashier', noLv: true, vals: [1, 1.35, 1.7], cost: [2200, 6880], fmt: (v) => ['還沒有購物籃', '購物籃：客人提著籃子，走更快、拿更快', '購物車：客人推著車，又快又順'][v === 1 ? 0 : v < 1.5 ? 1 : 2] },
  autoCash: { tab: 3, name: '自助結帳機', ic: 'money', need: 'cashier2', vals: [0, 1], cost: [16500], fmt: (v) => v ? '客人自己在機器結帳，錢直接入袋，不用收銀員' : '還是收銀員結帳、要自己收錢' },
  hayGrow: { tab: 2, name: '牧草長得更快', ic: 'hay', need: 'barn', vals: [1, 1.3, 1.6, 2, 2.5, 3], cost: [3000, 7000, 14000, 26000, 45000], fmt: (v) => '×' + v },
  buyMore: { tab: 3, name: '客人買更多', ic: 'bk', emo: '🛒', need: 'market', vals: [1, 1.1, 1.2, 1.3, 1.4, 1.5], cost: [12000, 25000, 45000, 75000, 120000], fmt: (v) => ['客人買得普普通通', '客人會多買一些', '客人買得更多', '客人買了好多', '客人買得超多', '客人買到提不動'][Math.round((v - 1) * 10)] },
  bonus: { tab: 3, name: '大訂單獎金', ic: 'money', need: 'market', vals: [1, 1.1, 1.2, 1.3, 1.4, 1.5], cost: [10000, 22000, 40000, 70000, 110000], fmt: (v) => '貨車、直升機、特別客人：' + ['一般獎金', '獎金多一些', '獎金更豐厚', '獎金很豐厚', '獎金超豐厚', '獎金大豐收'][Math.round((v - 1) * 10)] },
};
const upVal = (k) => UPS[k].vals[Math.min(state.up[k] || 0, UPS[k].vals.length - 1)];
// extra staff bought from the 員工 tab (on top of the ones unlocked on the map)
const EXTRA = {
  keeper: { name: '飼養員', base: 200, need: 'keeper', ok: () => isBuilt('coop') || isBuilt('barn'), at: [-1.4, 5.4], does: '負責動物：割草餵雞餵牛餵羊，雞蛋牛奶羊毛放進倉庫' },
  farmer: { name: '農夫', base: 300, need: 'farmer', ok: () => FARM_CROPS_SRC.some(isBuilt), at: [-2, 1.6], does: '負責田地和機器：收成放進倉庫，從倉庫拿材料進機器' },
  shelver: { name: '理貨員', base: 400, need: 'shelver', at: [1.6, -5], does: '負責商店：從倉庫拿貨補上貨架' },
  orderer: { name: '訂單專員', emo: '📦', base: 3000, need: 'market', at: [11.2, -4.6], does: '只負責大訂單：從倉庫拿特別客人、貨車、直升機要的貨去交' },
};
const EXTRA_MAX = 6;
// 農夫 harvests every field (and feeds the animals when there is nothing to pick)
const FARM_CROPS_SRC = ['tomato', 'corn', 'soy', 'wheat', 'orchard', 'carrot', 'strawberry', 'pumpkin', 'flowers'];
const FARM_CROPS = ['tomato', 'corn', 'soybean', 'wheat', 'apple', 'carrot', 'strawberry', 'pumpkin', 'flower'];
// old saves: the per-product 專屬工人 (removed 11-15) become 飼養員 / 農夫 / 理貨員
const LINE_TO_ROLE = { egg: 'keeper', milk: 'keeper', tomato: 'farmer', corn: 'farmer', soy: 'farmer', wheat: 'farmer', apple: 'farmer', juice: 'shelver', soymilk: 'shelver', bread: 'shelver', cheese: 'shelver' };
// 管理層: 店長 (shop) and 農場主管 (farm)
const MGR_PAY = [0.5, 0.3, 0.25, 0.2], MGR_TIP = [1, 1.1, 1.2, 1.3], MGR_PAT = [0, 0, 10, 15];
const FARM_SP = [1, 1.15, 1.25, 1.35], FARM_CAP = [0, 0, 3, 5];
const mShop = () => state.up.mgrShop || 0, mFarm = () => state.up.mgrFarm || 0;
const isFarmRole = (r) => r === 'keeper' || r === 'farmer';
// one price list for hiring, whether from the map or from the 員工 tab:
// the next 飼養員 / 農夫 / 理貨員 costs base × 1.8 for every one already working (and ×2.75 after the first one, 大擴充)
const HIRE_BASE = { keeper: 90, farmer: 120, shelver: 250, orderer: 3000 };
const hireCost = (role) => { const n = workers.filter((w) => w.role === role).length; return Math.round(HIRE_BASE[role] * Math.pow(1.8, n) * (n ? 2.75 : 1) / 10) * 10; };
const extraCost = (role) => hireCost(role);
const zoneDef = (def) => (def.kind === 'hire' && HIRE_BASE[def.role] ? { ...def, cost: { money: hireCost(def.role) } } : def);

// small repeatable unlocks next to a building: one more chicken / cow / plant / patch of grass
const GROW = {
  coop: { start: 2, max: 8, cost: [30, 70, 140, 660, 1050, 1540], what: '＋1 隻雞' },
  coop2: { start: 2, max: 8, cost: [690, 1240, 2060, 3030, 4400, 6050], what: '＋1 隻雞' },
  barn: { start: 1, max: 10, cost: [1100, 2610, 4500, 7000, 10000, 14000, 19000, 25000, 32000], what: '＋1 頭牛' },
  tomato: { start: 2, max: 8, cost: [25, 55, 120, 550, 880, 1320], what: '＋1 棵番茄' },
  juicer: { start: 1, max: 4, cost: [1380, 3030, 6050], what: '果汁機做更快' },
  soyMachine: { start: 1, max: 4, cost: [2480, 4950, 9630], what: '磨豆漿機做更快' },
  oven: { start: 1, max: 4, cost: [3300, 6600, 12380], what: '麵包窯做更快' },
  cheese: { start: 1, max: 4, cost: [4130, 8250, 15130], what: '起司坊做更快' },
  corn: { start: 3, max: 9, cost: [100, 170, 740, 1200, 1800, 2600], what: '＋1 棵玉米' },
  soy: { start: 3, max: 6, cost: [1510, 2200, 3300], what: '＋1 棵黃豆' },
  wheat: { start: 4, max: 8, cost: [1930, 2610, 3440, 4400], what: '＋1 叢小麥' },
  orchard: { start: 2, max: 6, cost: [6600, 8800, 11000, 14300], what: '＋1 棵蘋果樹' },
  field: { start: 6, max: 25, steps: [6, 10, 15, 20, 25], cost: [15, 45, 100, 550], what: '擴大草地' },
  // 大擴充: the new fields, animals and machines in the south farmland
  carrot: { start: 4, max: 8, cost: [3000, 4500, 6500, 9000], what: '＋1 棵紅蘿蔔' },
  strawberry: { start: 4, max: 8, cost: [4500, 6500, 9000, 12000], what: '＋1 叢草莓' },
  pumpkin: { start: 3, max: 6, cost: [9000, 13000, 18000], what: '＋1 顆南瓜' },
  flowers: { start: 4, max: 8, cost: [20000, 28000, 38000, 50000], what: '＋1 叢花' },
  sheep: { start: 2, max: 6, cost: [16000, 24000, 34000, 48000], what: '＋1 隻羊' },
  barn2: { start: 1, max: 10, cost: [9000, 16000, 24000, 34000, 46000, 60000, 78000, 100000, 125000], what: '＋1 頭牛' },
  coop3: { start: 2, max: 8, cost: [8000, 11000, 15000, 20000, 26000, 34000], what: '＋1 隻雞' },
  jam: { start: 1, max: 4, cost: [14000, 26000, 45000], what: '果醬機做更快' },
  pie: { start: 1, max: 4, cost: [24000, 45000, 80000], what: '南瓜派烤爐做更快' },
  yarn: { start: 1, max: 4, cost: [40000, 80000, 140000], what: '毛線機做更快' },
  hive: { start: 1, max: 4, cost: [80000, 160000, 300000], what: '蜂箱做更快' },
  juicer2: { start: 1, max: 4, cost: [12000, 22000, 40000], what: '第二果汁機做更快' },
  cheese2: { start: 1, max: 4, cost: [30000, 55000, 95000], what: '第二起司坊做更快' },
  oven2: { start: 1, max: 4, cost: [25000, 45000, 80000], what: '第二麵包窯做更快' },
  soyMachine2: { start: 1, max: 4, cost: [40000, 75000, 130000], what: '第二磨豆漿機做更快' },
  pudding: { start: 1, max: 4, cost: [8000, 15000, 26000], what: '布丁機做更快' },
  ketchup: { start: 1, max: 4, cost: [10000, 19000, 33000], what: '番茄醬機做更快' },
  cider: { start: 1, max: 4, cost: [20000, 38000, 65000], what: '蘋果汁機做更快' },
};
for (const k in GROW) { const g = GROW[k]; if (g.what.endsWith('做更快') && g.max === 4) { const c = g.cost[g.cost.length - 1]; g.cost.push(Math.round(c * 1.7 / 1000) * 1000, Math.round(c * 2.8 / 1000) * 1000); g.max = 6; } }
const lvlOf = (id) => state.lvl[id] || GROW[id].start;
// machine level 1–4: each level makes that one machine 40% faster
const machK = (id) => (GROW[id] ? 1 + 0.4 * (lvlOf(id) - 1) : 1);

// ---------- save ----------
const SAVE = 'farm_save_v2';
const state = { money: 50, built: [], paid: {}, up: {}, stock: {}, store: {}, lvl: null, piles: [0, 0], sound: true, earned: 0 };
try { Object.assign(state, JSON.parse(localStorage.getItem(SAVE) || '{}')); } catch (e) { /* fresh start */ }
if (params.has('fresh')) Object.assign(state, { money: 50, built: [], paid: {}, up: {}, stock: {}, store: {}, lvl: {}, piles: [0, 0], earned: 0 });
state.store = state.store || {};
state.extra = state.extra || {};
// the 飼養員工作 upgrade was removed (the keeper now does everything): give back what was paid for it
let keeperRefund = 0;
// 收銀台升級 used to add registers; it became real counters, so its price comes back
if (state.up.lanes) { keeperRefund += [0, 1500, 6500][Math.min(2, state.up.lanes)]; state.money += [0, 1500, 6500][Math.min(2, state.up.lanes)]; delete state.up.lanes; }
if (state.up.keeper) { keeperRefund = [0, 150, 550, 1450][Math.min(3, state.up.keeper)]; state.money += keeperRefund; delete state.up.keeper; }
state.built = state.built.filter((id) => id !== 'harbor');
if (mapsGet().cafe && !state.built.includes('gateCafe')) state.built.push('gateCafe');
let tomatoMerged = false;
if (state.built.includes('tomato2')) {
  state.built = state.built.filter((id) => id !== 'tomato2');
  state.lvl.tomato = Math.min(8, (state.lvl.tomato || 2) + (state.lvl.tomato2 || 2));
  tomatoMerged = true;
}
if (state.paid && state.paid.tomato2) { state.money += state.paid.tomato2.money || 0; delete state.paid.tomato2; }
if (state.paid) delete state.paid.g_tomato2;
if (state.lvl) delete state.lvl.tomato2;
let linesMoved = 0;
if (state.lines) {
  for (const k in state.lines) { const r = LINE_TO_ROLE[k] || 'shelver', n = state.lines[k] || 0; if (!n) continue; state.extra[r] = Math.min(6, (state.extra[r] || 0) + n); linesMoved += n; }
  delete state.lines;
}
// older saves already had full fields and three chickens: keep them that way
if (!state.lvl) { state.lvl = {}; if (state.built.length) { for (const k in GROW) state.lvl[k] = GROW[k].max; state.lvl.field = 25; } }
// 收銀速度 was removed again (checkout is quick as before): give back what was paid for it
if (state.up.paySpeed) { const back = [150, 400, 900, 1800, 3500].slice(0, state.up.paySpeed).reduce((a, b) => a + b, 0); state.money += back; delete state.up.paySpeed; setTimeout(() => toast('結帳恢復原本速度，退還收銀速度升級 $' + back), 2500); }
for (const k in UPS) state.up[k] = Math.min(state.up[k] || 0, UPS[k].vals.length - 1);
const isBuilt = (id) => state.built.includes(id);
const MAPS_KEY = 'farm_maps_v1';
// 11-17: the café, the harbour and the forest are closed for now (new ideas coming); their saves are kept
const BRANCHES_OPEN = false;
function mapsGet() { try { return JSON.parse(localStorage.getItem(MAPS_KEY) || '{}'); } catch (e) { return {}; } }
function mapsSet(id) { const m = mapsGet(); m[id] = true; try { localStorage.setItem(MAPS_KEY, JSON.stringify(m)); } catch (e) { /* storage off */ } showMapBtn(); }
function showMapBtn() { const b = document.getElementById('bMap'); if (b) b.classList.toggle('hidden', !BRANCHES_OPEN || !Object.keys(mapsGet()).length); }
// backup code: every map's save in one base64 string, so progress survives a cleared browser or a new phone
const SAVE_KEYS = ['farm_save_v2', 'harbor_save_v1', 'forest_save_v1', 'cafe_save_v1', MAPS_KEY];
function exportSave() {
  const o = { v: 1 };
  for (const k of SAVE_KEYS) { const s = localStorage.getItem(k); if (s) o[k] = s; }
  return 'FARM1:' + btoa(unescape(encodeURIComponent(JSON.stringify(o))));
}
function importSave(txt) {
  try {
    const t = String(txt).replace(/\s+/g, '');
    if (!t.startsWith('FARM1:')) return false;
    const o = JSON.parse(decodeURIComponent(escape(atob(t.slice(6)))));
    if (!o || o.v !== 1 || !o.farm_save_v2) return false;
    for (const k of SAVE_KEYS) { if (o[k]) JSON.parse(o[k]); } // every part must be valid before touching storage
    for (const k of SAVE_KEYS) { if (o[k]) localStorage.setItem(k, o[k]); else localStorage.removeItem(k); }
    return true;
  } catch (e) { return false; }
}
function copyText(ta) {
  const ok = () => toast('存檔碼已複製，請貼到記事本或傳給自己保存');
  const fallback = () => { ta.focus(); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { toast('請長按文字框，全選後複製'); } };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(ok, fallback); else fallback();
}
// set while restarting, so the page's own unload save can't write the old game back
let resetting = false;
function save() {
  if (resetting) return;
  for (const id in stations) {
    const s = stations[id];
    if (s.kind === 'producer' || s.kind === 'machine') state.stock[id] = { a: s.inN, b: s.outN };
    else if (s.kind === 'shelf') state.stock[id] = { a: s.n };
  }
  state.piles = COUNTERS.map((c) => c.pile.value);
  try { localStorage.setItem(SAVE, JSON.stringify(state)); } catch (e) { /* storage off */ }
}

// ---------- sound ----------
let actx = null;
function sfx(kind) {
  if (!state.sound || params.has('mute')) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime;
    const tone = (f, d, type = 'sine', v = 0.12, at = 0) => {
      const o = actx.createOscillator(), gn = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t + at);
      gn.gain.setValueAtTime(v, t + at); gn.gain.exponentialRampToValueAtTime(0.001, t + at + d);
      o.connect(gn).connect(actx.destination); o.start(t + at); o.stop(t + at + d);
    };
    if (kind === 'pop') tone(660 + Math.random() * 120, 0.08, 'triangle', 0.08);
    else if (kind === 'drop') tone(420, 0.07, 'triangle', 0.07);
    else if (kind === 'coin') { tone(1180, 0.06, 'square', 0.04); tone(1580, 0.08, 'square', 0.04, 0.05); }
    else if (kind === 'chop') tone(180, 0.09, 'square', 0.06);
    else if (kind === 'unlock') [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.09, i * 0.08));
    else if (kind === 'buy') { tone(880, 0.08, 'triangle', 0.08); tone(1320, 0.12, 'triangle', 0.08, 0.07); }
    else if (kind === 'vip') [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.22, 'sine', 0.08, i * 0.1));
  } catch (e) { /* no audio */ }
}

// ---------- renderer / scene ----------
const canvas = $('cv');
const renderer = K.makeRenderer(canvas);
const scene = new THREE.Scene();
scene.background = new THREE.Color(C.grass2);
const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 220);
const lights = K.makeLights(scene);
const joy = new Joystick(canvas, $('ui'));
joy.onStart = () => { if (actx && actx.state === 'suspended') actx.resume(); };

const colliders = [];
// workers find their way around everything solid (walls, fences, buildings) with a path grid
// z1 reaches past the 擴建 farmland (south fence at z 62 once it is bought)
const nav = createNav(colliders, { x0: -22, x1: 30, z0: -36, z1: 64 });
const box = (x0, z0, x1, z1) => { const b = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) }; colliders.push(b); nav.dirty(); return b; };
function unbox(b) { const i = colliders.indexOf(b); if (i >= 0) colliders.splice(i, 1); nav.dirty(); }
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- item icons: each item's 3D model rendered once to a small picture ----------
const ICON = {};
// one template per item; every copy shares its geometry (no new GPU buffers for each flying egg)
const TPL = {};
const itemClone = (t) => (TPL[t] || (TPL[t] = P.itemMesh(t))).clone();
function makeIcons() {
  try {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setSize(80, 80); r.outputColorSpace = THREE.SRGBColorSpace;
    const sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight('#fff6e6', '#c3e08a', 1.7));
    const d = new THREE.DirectionalLight('#fff1d6', 1.6); d.position.set(-2, 4, 3); sc.add(d);
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    for (const type of Object.keys(ITEMS)) {
      const m = P.itemMesh(type); sc.add(m);
      const bb = new THREE.Box3().setFromObject(m), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3()).length();
      cam.position.set(c.x + s * 0.9, c.y + s * 1.25, c.z + s * 1.7); cam.lookAt(c);
      r.render(sc, cam);
      ICON[type] = '<img class="ii" src="' + r.domElement.toDataURL() + '" alt="">';
      sc.remove(m);
    }
    r.dispose(); r.forceContextLoss();
  } catch (e) { /* fall back to emoji */ }
  for (const t in ITEMS) if (!ICON[t]) ICON[t] = '<span class="ic">' + ITEMS[t].icon + '</span>';
  ICON.run = '<span class="ic">👟</span>';
}
makeIcons();

// ---------- static world ----------
const standWall = { g: null, b: null };
const backWalls = { g1: null, b1: null, g2: null, b2: null };
let deptG = null, mFront = { g: null, b: [] };
// 擴建: the old south fence (removed when bought) and the new farmland scenery
let southG = null, southBox = null, expandG = null;
const standSign = { g: null, board: null };
// 商店外觀 levels: name on the sign, its colour, and the awning stripes
const LOOKS = [
  { name: '農場小舖', col: '#59c25b' },
  { name: '農場超市', col: '#59c25b', aw: ['#59c25b', '#fff3dd'] },
  { name: '精品超市', col: '#ff8a6b', aw: ['#ff8a6b', '#fff3dd'] },
  { name: '旗艦超市', col: '#e9a400', aw: ['#8f7bff', '#ffd34a'] },
];
let lookG = null, lookBoxes = [];
function applyShopLook(anim) {
  const lv = state.up.look || 0, L = LOOKS[lv];
  // sign: a wider board each level
  if (standSign.board) standSign.g.remove(standSign.board);
  standSign.board = P2.signBoard(L.name, 1.6 + lv * 0.25, L.col); standSign.board.position.set(0, 1.75, 0); standSign.g.add(standSign.board);
  if (lv === 3) { const st = K.mesh(G.sphere(0.2, 10, 8), '#ffd34a'); st.scale.set(1, 1, 0.4); K.add(standSign.board, st, 0, 0.72, 0); }
  if (lookG) { scene.remove(lookG); lookG = null; }
  for (const b of lookBoxes) unbox(b);
  lookBoxes = [];
  if (!lv) return;
  const g = K.add(scene, new THREE.Group());
  const x0 = isBuilt('market') ? -20.8 : -6.8, x1 = 7.95, Z = -7.3;
  // striped awning along the whole front, scalloped edge
  const sw = 0.62, n = Math.round((x1 - x0) / sw), w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const x = x0 + (i + 0.5) * w, col = L.aw[i % 2];
    const s = K.add(g, K.mesh(G.rbox(w + 0.01, 0.07, 1.05, 0.03, 1), col), x, 1.72, Z + 0.42);
    s.rotation.x = 0.38;
    K.add(g, K.mesh(G.sphere(w * 0.5, 8, 5), col, false), x, 1.52, Z + 0.92).scale.set(1, 0.55, 0.3);
  }
  K.add(g, K.mesh(G.rbox(x1 - x0 + 0.1, 0.12, 0.16, 0.05), lv === 3 ? '#ffd34a' : C.white), (x0 + x1) / 2, 1.9, Z - 0.02);
  // flower planters against the wall (not in front of the door)
  const fl = ['#ff7eb6', '#ffd34a', '#a98bff', '#ffffff', '#ff8a6b'];
  let k = 0;
  for (let x = x0 + 1.4; x < 4.6; x += 3.2) {
    if (DOORS.some((d) => Math.abs(d.x - x) < d.w / 2 + 1.0)) continue;
    const pl = K.add(g, new THREE.Group(), x, 0, Z + 0.42);
    K.add(pl, K.mesh(G.rbox(1.5, 0.42, 0.5, 0.08), lv === 3 ? '#fbfaf5' : C.woodLight), 0, 0.21, 0);
    K.add(pl, K.mesh(G.rbox(1.38, 0.06, 0.4, 0.03, 1), '#8b5a3c', false), 0, 0.43, 0);
    for (let j = 0; j < 5; j++) { const f = P.flower(fl[(k + j) % 5]); f.position.set(-0.56 + j * 0.28, 0.42, (j % 2) * 0.1 - 0.05); f.scale.setScalar(1.3); pl.add(f); }
    k++;
    lookBoxes.push(box(x - 0.8, Z + 0.15, x + 0.8, Z + 0.7));
  }
  if (lv >= 2) {
    // colourful string lights hanging from the awning, and a lantern post each side of the door
    g.add(bulbs(x0, x1, Z + 0.95));
    for (const x of [4.95, 8.35]) {
      const p = K.add(g, new THREE.Group(), x, 0, Z + 0.62);
      K.add(p, K.mesh(G.rbox(0.36, 0.18, 0.36, 0.05), '#6a7382'), 0, 0.09, 0);
      K.add(p, K.mesh(G.cyl(0.06, 0.07, 1.5, 8), '#6a7382'), 0, 0.85, 0);
      K.add(p, K.mesh(G.rbox(0.3, 0.36, 0.3, 0.06), '#fff2b8'), 0, 1.75, 0);
      K.add(p, K.mesh(G.cone(0.26, 0.2, 4), '#6a7382'), 0, 2.02, 0).rotation.y = Math.PI / 4;
      lookBoxes.push(box(x - 0.2, Z + 0.42, x + 0.2, Z + 0.82));
    }
  }
  if (lv >= 3) {
    // red carpet from the door down to the path, and two flags
    K.add(g, K.mesh(G.rbox(1.5, 0.03, 1.9, 0.02, 1), '#e8494d', false, true), 6.5, 0.045, -5.95);
    K.add(g, K.mesh(G.rbox(1.62, 0.025, 2.0, 0.02, 1), '#ffd34a', false, true), 6.5, 0.035, -5.95);
    for (const [x, c] of [[4.95, '#8f7bff'], [8.35, '#ff7eb6']]) {
      K.add(g, K.mesh(G.cyl(0.04, 0.04, 1.1, 6), '#ffd34a'), x, 2.6, Z + 0.62);
      K.add(g, K.mesh(G.rbox(0.62, 0.4, 0.04, 0.02, 1), c), x + 0.33, 2.9, Z + 0.62);
    }
  }
  K.bakeStatic(g);
  lookG = g;
  if (anim) { popIn(g); popIn(standSign.board); }
}
// 地板翻新 and 路邊廣告牌: two more shop upgrades that change the look and bring more customers
let floorG = null, adG = null;
const shopCustMul = () => (1 + 0.12 * (state.up.look || 0)) * (1 + 0.06 * (state.up.floor || 0)) * (1 + 0.08 * (state.up.ad || 0));
function applyFloor(anim) {
  if (floorG) { scene.remove(floorG); floorG = null; }
  const lv = state.up.floor || 0; if (!lv) return;
  const g = K.add(scene, new THREE.Group());
  const x0 = isBuilt('market') ? -20.6 : -6.6, x1 = 7.75, z0 = isBuilt('hall') ? HALL_Z + 0.2 : isBuilt('dept') ? DEPT_Z + 0.2 : -17.4, z1 = -7.45, y = 0.134;
  const tile = (x, z, w, d, col) => K.add(g, K.mesh(G.plane(w, d), col, false, true), x, y, z);
  if (lv === 1) {
    // warm wooden planks, every other row shifted by half a plank
    const cols = ['#e9b47a', '#dea468', '#f0c08a'];
    for (let z = z0, k = 0; z < z1 - 0.05; z += 0.55, k++) {
      const d = Math.min(0.55, z1 - z) - 0.03, edges = [x0];
      for (let e = x0 + (k % 2 ? 1.2 : 2.4); e < x1 - 0.1; e += 2.4) edges.push(e);
      edges.push(x1);
      for (let j = 0; j < edges.length - 1; j++) tile((edges[j] + edges[j + 1]) / 2, z + d / 2 + 0.015, edges[j + 1] - edges[j] - 0.03, d, cols[(k + j) % 3]);
    }
  } else {
    // lv2 cream checker, lv3 marble with a gold frame
    const sz = lv === 2 ? 1.0 : 1.6, a = lv === 2 ? '#fff4e2' : '#f6f2ea', b = lv === 2 ? '#ead9bf' : '#e3dbcd';
    for (let z = z0, r = 0; z < z1 - 0.05; z += sz, r++) for (let x = x0, c = 0; x < x1 - 0.05; x += sz, c++) {
      const w = Math.min(sz, x1 - x) - 0.03, d = Math.min(sz, z1 - z) - 0.03;
      tile(x + w / 2 + 0.015, z + d / 2 + 0.015, w, d, (r + c) % 2 ? b : a);
    }
    if (lv === 3) {
      const gold = '#f2c14e', yy = y + 0.003;
      for (const zz of [z0 + 0.35, z1 - 0.35]) K.add(g, K.mesh(G.plane(x1 - x0 - 0.5, 0.12), gold, false, true), (x0 + x1) / 2, yy, zz);
      for (const xx of [x0 + 0.35, x1 - 0.35]) K.add(g, K.mesh(G.plane(0.12, z1 - z0 - 0.5), gold, false, true), xx, yy, (z0 + z1) / 2);
    }
  }
  K.bakeStatic(g);
  floorG = g;
  if (anim) confetti(0.5, -12);
}
function adCanvas(lv) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const x = c.getContext('2d');
  const bg = x.createLinearGradient(0, 0, 0, 256);
  bg.addColorStop(0, lv === 3 ? '#8f7bff' : '#59c25b'); bg.addColorStop(1, lv === 3 ? '#5b46d6' : '#3fa34a');
  x.fillStyle = bg; x.fillRect(0, 0, 512, 256);
  x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '900 78px "PingFang TC","Microsoft JhengHei",sans-serif'; x.fillText(LOOKS[state.up.look || 0].name, 256, 92);
  x.font = '800 44px "PingFang TC","Microsoft JhengHei",sans-serif'; x.fillStyle = '#fff3a6'; x.fillText('🍅🥚🌽 新鮮直送 ➜', 256, 188);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
let adBox = null;
function applyAd(anim) {
  if (adG) { scene.remove(adG); adG = null; }
  if (adBox) { unbox(adBox); adBox = null; }
  const lv = state.up.ad || 0; if (!lv) return;
  const g = K.add(scene, new THREE.Group(), 19.8, 0, -1.9);
  g.add(K.blob(1.6));
  const W = lv === 1 ? 2.4 : 4.2, H = W / 2, top = lv === 1 ? 2.2 : 3.9;
  const post = lv === 1 ? C.woodDark : '#8f969f';
  for (const sx of [-W / 2 + 0.3, W / 2 - 0.3]) K.add(g, K.mesh(G.rbox(0.18, top - H / 2, 0.18, 0.05), post), sx, (top - H / 2) / 2, 0);
  K.add(g, K.mesh(G.rbox(W + 0.24, H + 0.24, 0.16, 0.06), lv === 1 ? C.woodLight : C.white), 0, top - H / 2, -0.02);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshLambertMaterial({ map: adCanvas(lv) }));
  face.position.set(0, top - H / 2, 0.065); g.add(face);
  if (lv === 3) {
    const n = 14, bm = new THREE.MeshBasicMaterial({ color: '#fff3a6' });
    for (let i = 0; i <= n; i++) for (const yy of [top + 0.16, top - H - 0.16]) { const b = new THREE.Mesh(G.sphere(0.06, 6, 5), bm); b.position.set(-W / 2 - 0.1 + (W + 0.2) * i / n, yy, 0.08); g.add(b); }
    for (const sx of [-1.2, 1.2]) K.add(g, K.mesh(G.cyl(0.12, 0.18, 0.3, 8), '#6a7382'), sx, 0.15, 0.9).rotation.x = -0.6;
  }
  K.bakeStatic(g);
  adBox = box(19.8 - W / 2 + 0.1, -2.1, 19.8 + W / 2 - 0.1, -1.7);
  adG = g;
  if (anim) { popIn(g); confetti(19.8, -1.9); }
}
function bulbs(x0, x1, z) {
  const g = new THREE.Group(), cols = ['#ffd34a', '#ff8a6b', '#9fd86b', '#5aa9ff'];
  const n = Math.round((x1 - x0) / 0.8);
  for (let i = 0; i <= n; i++) {
    const t = i / n, m = new THREE.Mesh(G.sphere(0.07, 6, 5), new THREE.MeshBasicMaterial({ color: cols[i % 4] }));
    m.position.set(x0 + (x1 - x0) * t, 1.42 - Math.abs(Math.sin(t * n * Math.PI / 2)) * 0.12, z); g.add(m);
  }
  return g;
}
let shopArea = null;
const areas = [];
function makeArea(x0, z0, x1, z1, lamps, lx, lz) {
  const light = new THREE.PointLight('#ffe2a8', 0, 16, 1.6); light.position.set(lx, 3.2, lz); scene.add(light);
  const A = { x0, z0, x1, z1, light, lamps, k: 0 };
  areas.push(A);
  return A;
}
function buildWorld() {
  const D = new THREE.Group();
  // ground, road and curbs in 20-unit pieces: one 160-unit triangle that passes behind the camera
  // (far south in the 擴建 land) came out as a full-screen smear on software GPUs
  for (let gx = -76; gx < 84; gx += 20) for (let gz = -74; gz < 86; gz += 20) K.add(D, K.mesh(G.plane(20, 20), C.grass, false, true), gx + 10, 0, gz + 10);
  const rnd = mulberry(7);
  for (let i = 0; i < 40; i++) {
    const r = 1.5 + rnd() * 3.5, p = K.mesh(G.circle(r, 9), rnd() < 0.5 ? C.grass2 : C.grass3, false, true);
    p.position.set(-34 + rnd() * 72, 0.003 + i * 0.0011, -30 + rnd() * 70); p.scale.set(1, 1, 0.6 + rnd() * 0.6); p.rotation.y = rnd() * 3;
    // never on top of the road or the drop-off ring beside it
    if (p.position.x + r < 9.8 || p.position.x - r > 18) D.add(p);
  }
  // dirt path: out of the shop door, a branch east to the road, and the main path west then south through the farm
  const pathPts = [];
  const lay = (x0, z0, x1, z1) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / 1.15)); for (let i = 0; i <= n; i++) pathPts.push([x0 + (x1 - x0) * i / n, z0 + (z1 - z0) * i / n]); };
  lay(6.5, -6.6, 6.5, -4.3); lay(7.6, -4.3, 12.8, -4.3); lay(5.4, -4.3, -0.6, -4.3); lay(-0.6, -3.15, -0.6, 30);
  pathPts.forEach(([x, z], k) => {
    const t = K.mesh(G.rbox(1.0, 0.04, 0.95, 0.12, 2), k % 2 ? C.dirt : C.dirt2, false, true);
    t.position.set(x + Math.sin(k * 1.7) * 0.06, 0.02, z); t.rotation.y = Math.sin(k * 2.3) * 0.12; D.add(t);
  });
  for (let rz = -80; rz < 80; rz += 20) K.add(D, K.mesh(G.plane(4.2, 20), C.road, false, true), 15.5, 0.006, rz + 10);
  for (let z = -70; z < 70; z += 3) K.add(D, K.mesh(G.plane(0.18, 1.4), C.roadLine, false, true), 15.5, 0.012, z);
  for (const x of [13.3, 17.7]) for (let rz = -80; rz < 80; rz += 20) K.add(D, K.mesh(G.rbox(0.3, 0.12, 20, 0.05, 1), '#d5d9de', false, true), x, 0.06, rz + 10);
  // the farm stand (becomes part of the supermarket later)
  K.add(D, K.mesh(G.rbox(14.4, 0.12, 10.4, 0.06, 2), C.floor, false, true), 0.6, 0.06, -12.2);
  K.add(D, K.mesh(G.rbox(14.2, 0.05, 0.6, 0.03, 1), C.floor2, false, true), 0.6, 0.125, -7.3);
  // back wall in its own group: the 百貨公司 removes it and builds a new one further back
  backWalls.g1 = K.add(scene, new THREE.Group());
  K.add(backWalls.g1, K.mesh(G.rbox(14.6, 1.5, 0.4, 0.08), C.wall), 0.5, 0.75, -17.6);
  K.add(backWalls.g1, K.mesh(G.rbox(14.7, 0.2, 0.46, 0.05), C.wallTrim), 0.5, 1.5, -17.6);
  for (const x of [-3, 3]) K.add(backWalls.g1, K.mesh(G.rbox(2.2, 0.8, 0.08, 0.06), '#bfe9ff'), x, 0.85, -17.38);
  standWall.g = K.add(scene, new THREE.Group());
  K.add(standWall.g, K.mesh(G.rbox(0.4, 1.5, 10.2, 0.08), C.wall), -6.8, 0.75, -12.3);
  K.add(standWall.g, K.mesh(G.rbox(0.46, 0.2, 10.3, 0.05), C.wallTrim), -6.8, 1.5, -12.3);
  backWalls.b1 = box(-6.8, -17.8, 7.6, -17.4); standWall.b = box(-7.0, -17.5, -6.6, -7.2);
  // front wall (glass windows) with a door gap, and the east wall
  buildFront();
  K.add(D, K.mesh(G.rbox(0.4, 1.5, 10.4, 0.08), C.wall), 7.95, 0.75, -12.4);
  K.add(D, K.mesh(G.rbox(0.46, 0.2, 10.5, 0.05), C.wallTrim), 7.95, 1.5, -12.4);
  box(7.75, -17.6, 8.15, -7.2);
  // the shop's name sign stays outside the baked scenery so the 商店外觀 upgrade can repaint it
  standSign.g = K.add(scene, new THREE.Group(), 3.6, 0, -6.2);
  K.add(standSign.g, K.mesh(G.rbox(0.14, 1.6, 0.14, 0.04), C.woodDark), 0, 0.8, 0);
  for (const [x, z] of [[-6.1, -16.8], [7.0, -16.8]]) {
    const pot = K.add(backWalls.g1, new THREE.Group(), x, 0.12, z);
    K.add(pot, K.mesh(G.cyl(0.32, 0.24, 0.45, 10), C.roof), 0, 0.22, 0);
    K.add(pot, P.bush(0.35), 0, 0.4, 0);
  }
  // VIP carpet by the entrance
  // fences, trees, decoration
  for (const seg of [[-21, -4.5, -21, 32], [-21, -4.5, -10.5, -4.5]]) D.add(P.fenceLine(...seg));
  box(-21.2, -4.5, -20.8, 32); box(-21, -4.65, -10.5, -4.35);
  // the south fence and the tree line behind it stay apart from the baked scenery: the 擴建 takes them away
  const S = new THREE.Group();
  S.add(P.fenceLine(-21, 32, 12, 32));
  for (let i = 0; i < 20; i++) { const t = P.tree(); t.g.position.set(-24 - rnd() * 6 + (i % 3), 0, -24 + i * 3.1); t.g.scale.setScalar(0.9 + rnd() * 0.5); D.add(t.g); }
  for (let i = 0; i < 16; i++) { const t = P.tree(); t.g.position.set(-20 + i * 3.1 + rnd(), 0, 35 + rnd() * 3); t.g.scale.setScalar(0.85 + rnd() * 0.4); S.add(t.g); }
  southG = K.add(scene, new THREE.Group()); K.bake(S, southG);
  southBox = box(-21, 31.8, 12, 32.2);
  // more woods west and east of the 擴建 farmland (outside the play area, so they can always be there)
  const rnd2 = mulberry(11);
  for (let i = 0; i < 9; i++) { const t = P.tree(); t.g.position.set(-24 - rnd2() * 6 + (i % 3), 0, 38 + i * 3.2); t.g.scale.setScalar(0.9 + rnd2() * 0.5); D.add(t.g); }
  for (let i = 0; i < 7; i++) { const t = P.tree(); t.g.position.set(31 + rnd2() * 3, 0, 37 + i * 5 + rnd2() * 2); D.add(t.g); }
  for (let i = 0; i < 12; i++) { const t = P.tree(); t.g.position.set(-22 + i * 3.4 + rnd(), 0, -36.6 - rnd() * 2.5); D.add(t.g); }
  for (let i = 0; i < 12; i++) { const t = P.tree(); t.g.position.set(31 + rnd() * 3, 0, -24 + i * 5 + rnd() * 2); D.add(t.g); }
  for (const [x, z, r] of [[11.5, -16, 0.6], [-11.5, -5.2, 0.5], [6, 30.5, 0.55], [-9, 30.6, 0.5], [12, 15.5, 0.6], [-19.5, 12, 0.6], [-19.5, 2, 0.5]]) K.add(D, P.bush(r), x, 0, z);
  const fl = ['#ff7eb6', '#ffffff', '#ffd34a', '#a98bff', '#ff8a6b'];
  for (let i = 0; i < 70; i++) K.add(D, P.flower(fl[i % 5]), -20 + rnd() * 32, 0, -3.5 + rnd() * 35);
  for (const [x, z, s] of [[-19, 28, 0.45], [-15, 14, 0.3], [11.5, 13, 0.4], [10, 30, 0.5]]) K.add(D, P.rock(s), x, 0, z);
  for (const z of [-14, -2, 10, 22]) K.add(D, P.lamp(), 13, 0, z);
  K.bake(D, scene);
  K.bakeStatic(backWalls.g1);
  const lamps = [];
  for (const x of [-4.5, 0.5, 5.5]) { const l = P2.wallLamp(); l.g.position.set(x, 1.35, -17.3); scene.add(l.g); lamps.push(l); }
  shopArea = makeArea(-6.8, -17.4, 7.9, -7.3, lamps, 0.5, -12);
  buildBin();
}
// ---------- 擴建：南邊農地 ----------
// the old south fence and its tree line come down, the land to z 62 opens: fences, woods, the main path carries on south
function applyExpand(anim) {
  if (expandG) return;
  if (southG) { scene.remove(southG); southG = null; }
  if (southBox) { unbox(southBox); southBox = null; }
  const D = new THREE.Group(), rnd = mulberry(23);
  for (let i = 0; i < 18; i++) {
    const r = 1.4 + rnd() * 3, p = K.mesh(G.circle(r, 9), rnd() < 0.5 ? C.grass2 : C.grass3, false, true);
    p.position.set(-19 + rnd() * 30, 0.004 + i * 0.0011, 34 + rnd() * 26); p.scale.set(1, 1, 0.6 + rnd() * 0.6); p.rotation.y = rnd() * 3; D.add(p);
  }
  D.add(P.fenceLine(-21, 32, -21, 62)); D.add(P.fenceLine(-21, 62, 12, 62));
  box(-21.2, 32, -20.8, 62); box(-21, 61.8, 12, 62.2);
  for (let i = 0; i < 16; i++) { const t = P.tree(); t.g.position.set(-20 + i * 3.1 + rnd(), 0, 65 + rnd() * 3); t.g.scale.setScalar(0.85 + rnd() * 0.4); D.add(t.g); }
  // the main path carries on south through the new land
  const pts = [], n = Math.round((60 - 30.6) / 1.15);
  for (let i = 0; i <= n; i++) pts.push([-0.6, 30.6 + (60 - 30.6) * i / n]);
  pts.forEach(([x, z], k) => {
    const t = K.mesh(G.rbox(1.0, 0.04, 0.95, 0.12, 2), k % 2 ? C.dirt : C.dirt2, false, true);
    t.position.set(x + Math.sin(k * 1.9) * 0.06, 0.02, z); t.rotation.y = Math.sin(k * 2.7) * 0.12; D.add(t);
  });
  // welcome sign by the path (its two posts are solid)
  const sg = K.add(D, new THREE.Group(), 3.6, 0, 31.4);
  for (const x of [-1.25, 1.25]) K.add(sg, K.mesh(G.rbox(0.16, 1.9, 0.16, 0.05), C.woodDark), x, 0.95, 0);
  const board = P2.signBoard('南邊農地', 2.4, '#59c25b'); board.position.set(0, 1.75, 0.05); sg.add(board);
  for (const x of [-1.25, 1.25]) box(3.6 + x - 0.12, 31.28, 3.6 + x + 0.12, 31.52);
  // bushes, rocks and flowers only along the edges, clear of the buildings and the path
  for (const [x, z, r] of [[-19.6, 34, 0.6], [-19.6, 48, 0.55], [-19.4, 60.4, 0.6], [11.2, 33.4, 0.5], [11.4, 60.4, 0.6], [-7, 60.6, 0.5], [4.6, 60.8, 0.45]]) K.add(D, P.bush(r), x, 0, z);
  for (const [x, z, s] of [[-19.4, 40.5, 0.4], [-13, 60.5, 0.35], [11.5, 41.5, 0.35]]) K.add(D, P.rock(s), x, 0, z);
  const fl = ['#ff7eb6', '#ffffff', '#ffd34a', '#a98bff', '#ff8a6b'];
  for (let i = 0; i < 26; i++) K.add(D, P.flower(fl[i % 5]), -20.3 + rnd() * 1.4, 0, 33 + rnd() * 28);
  for (let i = 0; i < 20; i++) K.add(D, P.flower(fl[(i + 2) % 5]), -19 + rnd() * 30, 0, 60.6 + rnd() * 1.0);
  for (const z of [34, 46, 58]) K.add(D, P.lamp(), 13, 0, z);
  expandG = K.add(scene, new THREE.Group());
  K.bake(D, expandG);
  if (anim) { for (const [x, z] of [[-10, 40], [4, 40], [-10, 52], [4, 52], [-0.6, 33]]) confetti(x, z); toast('🎉 南邊農地開放了！往下走看看'); }
}
// 羊圈 comes with its own patch of grass next to the pen, so the 飼養員 doesn't walk back to the old field
function buildSheepGrass() {
  if (tufts.some((t) => t.extra)) return;
  K.add(scene, K.mesh(G.circle(3.6, 12), '#a9d957', false, true), 6.4, 0.006, 58.6).scale.set(1.45, 1, 0.62);
  for (let iz = 0; iz < 3; iz++) for (let k = 0; k < 7; k++) {
    const t = P.tuft(), x = 2.6 + k * 1.15 + (iz % 2) * 0.35, z = 57.6 + iz * 1.0;
    t.g.position.set(x, 0, z); t.g.rotation.y = (k * 5 + iz * 3) % 6; scene.add(t.g); K.bakeStatic(t.tall);
    tufts.push({ ...t, x, z, grown: true, t: 0, res: null, active: true, extra: true });
  }
}
// trash bin on the open grass between the coop, the tomato field and the corn field, away from every path: stand on the red circle
// for half a second to throw away whatever you are carrying
const bin = { x: 5.0, z: 4.0, px: 5.0, pz: 5.05, lid: null, open: 0, t: 0, dwell: 0 };
function buildBin() {
  const g = K.add(scene, new THREE.Group(), bin.x, 0, bin.z);
  g.add(K.blob(0.5));
  K.add(g, K.mesh(G.cyl(0.34, 0.28, 0.78, 14), '#6cc0b2'), 0, 0.39, 0);
  K.add(g, K.mesh(G.cyl(0.37, 0.37, 0.1, 14), '#4fa597'), 0, 0.8, 0);
  K.add(g, K.mesh(G.rbox(0.36, 0.12, 0.05, 0.02, 1), '#ffffff', false), 0, 0.45, 0.31);
  const hinge = K.add(g, new THREE.Group(), 0, 0.86, -0.34);
  hinge.userData.dyn = true;
  K.add(hinge, K.mesh(G.cyl(0.38, 0.38, 0.08, 14), '#ff8a6b'), 0, 0.04, 0.34);
  K.add(hinge, K.mesh(G.rbox(0.22, 0.08, 0.1, 0.03, 1), '#e8694d'), 0, 0.12, 0.34);
  bin.lid = hinge;
  K.bakeStatic(g);
  box(bin.x - 0.4, bin.z - 0.4, bin.x + 0.4, bin.z + 0.4);
  const pd = P2.pad('#ff6b6b'); pd.position.set(bin.px, 0, bin.pz); scene.add(pd);
  label('zone', '<div class="zn">🗑️ 垃圾桶</div>', (o) => o.set(bin.px, 0.4, bin.pz + 0.2));
}
function updateBin(dt) {
  const pp = player.p.root.position;
  const onPad = dist2(pp, bin.px, bin.pz) < 0.75 && player.carry.length > 0;
  bin.dwell = onPad ? bin.dwell + dt : 0;
  const on = onPad && bin.dwell > 0.5;
  bin.t -= dt;
  if (on && bin.t <= 0) {
    bin.t = 0.07;
    const it = player.carry.pop(), from = new THREE.Vector3(); it.m.getWorldPosition(from);
    player.p.back.remove(it.m); restack(player); sfx('pop');
    fly(it.type, from, (o) => o.set(bin.x, 0.95, bin.z), 0.25, () => {});
    if (!player.carry.length) toast('手上的東西丟掉了');
  }
  bin.open += ((on || bin.t > -0.4 ? 1 : 0) - bin.open) * Math.min(1, dt * 10);
  bin.lid.rotation.x = -bin.open * 1.6;
}

// ---------- labels (DOM, projected) ----------
const labels = [];
const tmpV = new THREE.Vector3();
function label(cls, html, getPos) {
  const el = document.createElement('div'); el.className = 'lbl ' + cls; el.innerHTML = html;
  $('labels').appendChild(el);
  const L = { el, getPos, html, show: true, near: 0 };
  labels.push(L);
  return L;
}
function setLabel(L, html) { if (L.html !== html) { L.html = html; L.el.innerHTML = html; L.w = 0; lblSig = -1; } }
function dropLabel(L) { L.el.remove(); const i = labels.indexOf(L); if (i >= 0) labels.splice(i, 1); }
// clearer labels: zone names sit on a soft plate, far-away zones shrink, and labels that would cover
// each other are nudged upwards (the one nearer the bottom of the screen keeps its place)
const LBL2 = !params.has('lbl1'); // clearer labels are the default (farm/?lbl1 shows the old look)
if (LBL2) document.body.classList.add('lbl2');
const shown = [];
// only touch the DOM when something really changed (phones: style writes every frame add up)
const lblShow = (L, on) => { if (L.disp !== on) { L.disp = on; L.el.style.display = on ? '' : 'none'; } };
let lblSig = -1;
function placeLabels() {
  const w = innerWidth, h = innerHeight, pp = player.p.root.position;
  shown.length = 0;
  let sig = 0;
  for (const L of labels) {
    if (!L.show) { lblShow(L, false); continue; }
    L.getPos(tmpV);
    const dist = Math.hypot(tmpV.x - pp.x, tmpV.z - pp.z);
    if (L.near && dist > L.near) { lblShow(L, false); continue; }
    tmpV.project(camera);
    if (tmpV.z > 1 || tmpV.x < -1.3 || tmpV.x > 1.3 || tmpV.y < -1.3 || tmpV.y > 1.3) { lblShow(L, false); continue; }
    lblShow(L, true);
    // half-pixel steps: a label that hasn't moved writes the same transform (or none at all)
    L.sx = Math.round((tmpV.x + 1) / 2 * w * 2) / 2; L.sy = Math.round((1 - tmpV.y) / 2 * h * 2) / 2;
    sig = (sig * 31 + L.sx * 3 + L.sy * 7 + (L.w || 0) + (L.far ? 0.5 : 0)) % 1e9;
    if (LBL2) {
      const far = L.el.classList.contains('zone') && dist > 1.6; // zone names stay small unless you stand on the zone
      if (far !== !!L.far) { L.far = far; L.el.classList.toggle('far', far); L.w = 0; }
      shown.push(L);
    } else if (L.tx !== L.sx || L.ty !== L.sy) { L.tx = L.sx; L.ty = L.sy; L.el.style.transform = 'translate(' + L.sx.toFixed(1) + 'px,' + L.sy.toFixed(1) + 'px) translate(-50%,-100%)'; }
  }
  if (!LBL2) return;
  sig += shown.length * 0.001;
  if (sig === lblSig) return;
  lblSig = sig;
  K.layoutLabels(shown);
}
// 「MAX」 above a full stack, so nobody walks back for more
function maxTag(c) {
  if (!c.maxL) c.maxL = label('maxtag', 'MAX', (o) => { stackTop(c, o); o.y += 0.2; });
  c.maxL.show = c.carry.length > 0 && c.carry.length + c.incoming >= c.cap();
}
const badge = (type, n, max) => ICON[type] + n + '/' + max;
const costRow = (type, n) => '<div class="cost">' + ICON[type] + n + '</div>';

// ---------- particles / floating text / flying items ----------
const puffs = [];
const puffGeo = G.sphere(0.12, 6, 5);
function puff(x, y, z, col = '#ffffff', n = 6, spread = 1) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(puffGeo, K.mat(col)); m.position.set(x, y, z); scene.add(m);
    const a = Math.random() * 6.28;
    puffs.push({ m, vx: Math.cos(a) * spread * (1 + Math.random()), vy: 1.5 + Math.random() * 2, vz: Math.sin(a) * spread * (1 + Math.random()), t: 0, life: 0.5 + Math.random() * 0.3 });
  }
}
function confetti(x, z) {
  const cols = [C.red, C.yellow, C.blue, C.pink, C.green, C.purple];
  for (let i = 0; i < 26; i++) puff(x, 1, z, cols[i % cols.length], 1, 2.2);
}
function floatText(text, pos3, cls = '') {
  const el = document.createElement('div'); el.className = 'ftxt ' + cls; el.textContent = text; $('labels').appendChild(el);
  const p = pos3.clone(); p.project(camera);
  el.style.left = ((p.x + 1) / 2 * innerWidth) + 'px'; el.style.top = ((1 - p.y) / 2 * innerHeight) + 'px';
  setTimeout(() => el.remove(), 900);
}
const flyers = [];
function fly(type, from, toFn, dur, done) {
  const m = itemClone(type); m.position.copy(from); scene.add(m);
  flyers.push({ m, from: from.clone(), toFn, t: 0, dur, done });
}

// ---------- carriers (player and workers carry a stack on their back) ----------
function carrier(p) { return { p, carry: [], incoming: 0, xfer: 0, cap: () => 6 }; }
function stackTop(c, out) {
  let h = 0; for (const it of c.carry) h += ITEMS[it.type].h;
  c.p.back.getWorldPosition(out); out.y += h + 0.15; return out;
}
function restack(c) { let y = 0; for (const it of c.carry) { it.m.position.set(0, y, 0); it.y = y; y += ITEMS[it.type].h; } }
// spring-driven lean: the tower bends back when walking and wobbles when stopping
function swayStack(c, speed, dt) {
  const target = -Math.min(1, speed / 5);
  c.swv = (c.swv || 0) + ((target - (c.sw || 0)) * 60 - (c.swv || 0) * 9) * dt;
  c.sw = (c.sw || 0) + c.swv * dt;
  const n = c.carry.length;
  for (let i = 0; i < n; i++) {
    const it = c.carry[i], k = i / Math.max(6, n);
    it.m.position.z = c.sw * k * k * (0.35 + n * 0.03);
    it.m.rotation.x = c.sw * k * 0.25;
    if (it.pop > 0) { it.pop = Math.max(0, it.pop - dt * 5); const q = it.pop; it.m.scale.set(1 + q * 0.35, 1 - q * 0.3, 1 + q * 0.35); }
  }
}
function stackAdd(c, type) { const m = itemClone(type); c.p.back.add(m); c.carry.push({ type, m, pop: 1 }); restack(c); }
function count(c, type) { let n = 0; for (const it of c.carry) if (it.type === type) n++; return n; }
function room(c) { return c.cap() - c.carry.length - c.incoming; }
function giveFrom(c, type, toFn, done) {
  for (let i = c.carry.length - 1; i >= 0; i--) {
    if (c.carry[i].type !== type) continue;
    const it = c.carry.splice(i, 1)[0];
    const from = new THREE.Vector3(); it.m.getWorldPosition(from);
    c.p.back.remove(it.m); restack(c);
    fly(type, from, toFn, 0.28, done);
    return true;
  }
  return false;
}
function takeInto(c, type, from) {
  c.incoming++;
  fly(type, from, (o) => stackTop(c, o), 0.3, () => { c.incoming--; stackAdd(c, type); });
}

// ---------- player ----------
const player = carrier(K.person({ body: '#ff7f6e', hat: 'straw' }));
player.cap = () => upVal('cap');
player.p.root.position.set(5.0, 0, -1.4);
scene.add(player.p.root);
const axe = new THREE.Group();
K.add(axe, K.mesh(G.rbox(0.06, 0.5, 0.06, 0.02), C.woodDark), 0, -0.25, 0.1);
K.add(axe, K.mesh(G.rbox(0.05, 0.18, 0.22, 0.03), C.grey), 0, -0.46, 0.2);
player.p.arms[1].add(axe); axe.visible = false;
const pVel = new THREE.Vector3();
let pFace = 0;

// ---------- resource nodes ----------
const tufts = [];
function buildField() {
  for (let iz = 0; iz < 5; iz++) for (let k = 0; k < 5; k++) {
    const ix = 4 - k, t = P.tuft(); const x = -7.6 + ix * 1.05 + (iz % 2) * 0.3, z = -0.2 + iz * 1.0;
    t.g.position.set(x, 0, z); t.g.rotation.y = (ix * 7 + iz * 3) % 6; scene.add(t.g); K.bakeStatic(t.tall);
    tufts.push({ ...t, x, z, grown: true, t: 0, res: null });
  }
  K.add(scene, K.mesh(G.circle(3.4, 10), '#a9d957', false, true), -5.3, 0.006, 1.9).scale.set(1.15, 1, 1);
  applyField();
}
const trees = [];
function buildTrees() {
  for (const [x, z] of [[-13.2, -2.6], [-14.6, 0.8], [-12.6, 3.6], [-14.4, 6.6], [-12.9, 9.6], [-15.5, 12.6], [-13.4, 14.8]]) {
    const t = P.tree(); t.g.position.set(x, 0, z); scene.add(t.g); K.bakeStatic(t.crown);
    trees.push({ ...t, x, z, hp: 3, dead: false, t: 0, shake: 0 });
    box(x - 0.35, z - 0.35, x + 0.35, z + 0.35);
  }
}

// ---------- counters (two cash desks once the supermarket grows) ----------
// qs: queue spots (x, along z -8.75) clear of every door; side: the gap between counters they walk down through;
// exits: the doors (DOORS index) they leave by, first open one wins
const QZ = -8.75;
const COUNTERS = [
  { x: 4.6, z: -9.9, serve: { x: 4.6, z: -11.3 }, pile: { x: 7.0, z: -10.2, value: 0 }, on: false, dir: -1, qs: [4.1, 3.15, 2.2], side: 1.6, exits: [0] },
  { x: -16.5, z: -9.9, serve: { x: -16.5, z: -11.3 }, pile: { x: -14.4, z: -10.2, value: 0 }, on: false, dir: 1, qs: [-16.4, -15.5, -14.6, -13.7], side: -12.8, exits: [3, 2, 0] },
  { x: -0.6, z: -9.9, serve: { x: -0.6, z: -11.3 }, pile: { x: 1.65, z: -10.2, value: 0 }, on: false, dir: -1, qs: [-0.9, 0.05, 1.0], side: 1.6, exits: [1, 0] },
  { x: -6.4, z: -9.9, serve: { x: -6.4, z: -11.3 }, pile: { x: -4.15, z: -10.2, value: 0 }, on: false, dir: -1, qs: [-6.0, -7.0], side: -3.5, exits: [1, 2, 0] },
];
const VIP = { x: 10.6, z: -7.6 };
// 購物籃架 by the door: red baskets stacked on a little stand
let basketG = null;
function applyBasket(anim) {
  if (basketG) { scene.remove(basketG); basketG = null; }
  const lv = state.up.basket || 0; if (!lv) return;
  const g = K.add(scene, new THREE.Group(), 7.25, 0.12, -8.55);
  g.add(K.blob(0.45));
  K.add(g, K.mesh(G.rbox(0.62, 0.08, 0.46, 0.03), '#8f969f'), 0, 0.04, 0);
  const stacks = lv >= 2 ? [-0.15, 0.17] : [0];
  for (const z of stacks) for (let k = 0; k < (lv >= 2 ? 4 : 3); k++) {
    K.add(g, K.mesh(G.rbox(0.5, 0.16, 0.3, 0.05), '#ff5a4e'), 0, 0.16 + k * 0.11, z);
    K.add(g, K.mesh(G.rbox(0.42, 0.02, 0.22, 0.01), '#c9322a', false), 0, 0.245 + k * 0.11, z);
  }
  K.bakeStatic(g); basketG = g;
  if (anim) popIn(g);
}
function buildCounter(i, instant) {
  const c = COUNTERS[i]; c.on = true;
  const g = P.counter(); g.position.set(c.x, 0.12, c.z); scene.add(g); K.bakeStatic(g);
  box(c.x - 1.45, c.z - 0.55, c.x + 1.45, c.z + 0.55);
  c.pile.mat = K.add(scene, K.mesh(G.rbox(1.3, 0.04, 1.3, 0.1), '#c9f0c2', false, true), c.pile.x, 0.14, c.pile.z);
  c.pile.grp = K.add(scene, new THREE.Group(), c.pile.x, 0.16, c.pile.z);
  c.pile.vis = [];
  for (let k = 0; k < 40; k++) {
    const m = itemClone('money'); const col = k % 4, row = Math.floor(k / 4) % 2, lay = Math.floor(k / 8);
    m.position.set(-0.3 + (col % 2) * 0.48, lay * 0.07, -0.32 + row * 0.34 + Math.floor(col / 2) * 0.32 - 0.15);
    m.rotation.y = (k * 0.37) % 0.3; m.visible = false; c.pile.grp.add(m); c.pile.vis.push(m);
  }
  c.pile.label = label('badge money', '', (o) => o.set(c.pile.x, 1.2, c.pile.z));
  c.pile.value = state.piles[i] || 0; setPile(c);
  if (!instant) popIn(g);
}
const kioskOn = () => (state.up.autoCash || 0) > 0;
// the self-checkout machine sitting on the customer side of a counter
function kioskModel() {
  const g = new THREE.Group();
  K.add(g, K.mesh(G.rbox(0.62, 0.16, 0.5, 0.05), '#3d4452'), 0, 0.08, 0);
  K.add(g, K.mesh(G.rbox(0.16, 0.42, 0.16, 0.05), '#5b6474'), 0, 0.37, -0.08);
  const head = K.add(g, new THREE.Group(), 0, 0.66, -0.02); head.rotation.x = 0.45;
  K.add(head, K.mesh(G.rbox(0.62, 0.44, 0.1, 0.05), '#2c3340'), 0, 0, 0);
  const scr = K.add(head, K.mesh(G.rbox(0.52, 0.34, 0.02, 0.02), '#7ff0c8', false), 0, 0.01, 0.055);
  K.add(head, K.mesh(G.rbox(0.2, 0.05, 0.02, 0.01), '#ffffff', false), 0, 0.06, 0.068);
  K.add(head, K.mesh(G.rbox(0.12, 0.04, 0.02, 0.01), '#ffd34a', false), 0, -0.07, 0.068);
  K.add(g, K.mesh(G.rbox(0.26, 0.06, 0.18, 0.02), '#ffd34a'), 0.2, 0.19, 0.14);
  const lamp = K.add(g, K.mesh(G.sphere(0.07, 8, 6), '#59e07a', false), -0.24, 0.98, -0.08);
  K.add(g, K.mesh(G.cyl(0.02, 0.02, 0.3, 6), '#5b6474'), -0.24, 0.82, -0.08);
  return { g, scr, lamp };
}
function applyKiosk(anim) {
  if (!kioskOn()) return;
  // cashiers go home: the machines take over
  for (let i = workers.length - 1; i >= 0; i--) if (workers[i].role === 'cashier') { scene.remove(workers[i].p.root); workers.splice(i, 1); }
  COUNTERS.forEach((c) => {
    if (!c.on) return;
    if (c.pile.value > 0) { addMoney(c.pile.value); c.pile.value = 0; setPile(c); }
    if (c.pile.mat) c.pile.mat.visible = false;
    if (c.kiosk) return;
    const k = kioskModel(); k.g.position.set(c.x + 0.55, 1.17, c.z + 0.12); scene.add(k.g);
    c.kiosk = { ...k, flash: 0 };
    c.kiosk.tag = label('mtag', '<b>自助結帳</b>', (o) => o.set(c.x + 0.55, 2.55, c.z + 0.1)); c.kiosk.tag.near = 7;
    if (anim) popIn(k.g);
  });
}
function updateKiosks(dt) {
  for (const c of COUNTERS) {
    const k = c.kiosk; if (!k) continue;
    if (k.flash > 0) { k.flash -= dt; k.lamp.scale.setScalar(1 + k.flash * 1.5); if (k.flash <= 0) k.lamp.scale.setScalar(1); }
  }
}
function setPile(c) {
  const p = c.pile, n = p.value > 0 ? Math.min(40, Math.ceil(p.value / 6)) : 0;
  p.vis.forEach((m, i) => { m.visible = i < n; });
  p.label.show = p.value > 0;
  setLabel(p.label, ICON.money + fmtMoney(p.value));
}
function fmtMoney(v) { return v >= 100000 ? (v / 1000).toFixed(0) + 'K' : v >= 10000 ? (v / 1000).toFixed(1) + 'K' : String(v); }

// ---------- stations ----------
const stations = {};
const pops = [];
const later = [];
function popIn(obj) { obj.scale.setScalar(0.01); pops.push({ obj, t: 0 }); }
const sprinklers = [];
// ---------- instanced piles: every copy of one item on a shelf or tray is one instanced mesh per material ----------
// (40 goods on each of ~30 shelves would otherwise be thousands of draw calls on a phone)
const SHELF_VIS = 50, STOCK_VIS = 30;
const _m4 = new THREE.Matrix4(), _m5 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _sv = new THREE.Vector3(), _pv = new THREE.Vector3();
const bumping = [];
function itemStack(parent, type, slots) {
  const tpl = TPL[type] || (TPL[type] = P.itemMesh(type)); tpl.updateMatrixWorld(true);
  const parts = []; tpl.traverse((o) => { if (o.isMesh) parts.push(o); });
  const g = new THREE.Group(); g.userData.dyn = true; parent.add(g);
  const c = new THREE.Vector3(); for (const sl of slots) c.add(_pv.set(sl.x, sl.y, sl.z)); c.divideScalar(slots.length);
  let r = 0; for (const sl of slots) r = Math.max(r, c.distanceTo(_pv.set(sl.x, sl.y, sl.z)));
  const sphere = new THREE.Sphere(c, r + 0.6);
  const ims = parts.map((o) => {
    const im = new THREE.InstancedMesh(o.geometry, o.material, slots.length);
    im.castShadow = false; im.receiveShadow = o.receiveShadow; im.count = 0; im.visible = false; im.boundingSphere = sphere.clone(); im.userData.dyn = true; g.add(im);
    return { im, local: o.matrixWorld.clone() };
  });
  const st = { slots, ims, n: 0, bump: -1, bt: 0 };
  for (let i = 0; i < slots.length; i++) stackMatrix(st, i, 1);
  return st;
}
function stackMatrix(st, i, f) {
  const sl = st.slots[i];
  _e.set(0, sl.ry || 0, 0); _q.setFromEuler(_e); _sv.setScalar((sl.s || 1) * f); _pv.set(sl.x, sl.y, sl.z);
  _m4.compose(_pv, _q, _sv);
  for (const p of st.ims) { p.im.setMatrixAt(i, _m5.multiplyMatrices(_m4, p.local)); p.im.instanceMatrix.needsUpdate = true; }
}
function stackSet(st, n) {
  n = Math.max(0, Math.min(st.slots.length, n));
  if (n === st.n) return;
  for (const p of st.ims) { p.im.count = n; p.im.visible = n > 0; }
  st.n = n;
}
// the newest item lands with a little bounce
function stackBump(st, i) {
  if (i < 0 || i >= st.slots.length) return;
  if (st.bump >= 0 && st.bump !== i) stackMatrix(st, st.bump, 1);
  st.bump = i; st.bt = 0.35;
  if (!bumping.includes(st)) bumping.push(st);
}
function updateBumps(dt) {
  for (let k = bumping.length - 1; k >= 0; k--) {
    const st = bumping[k]; st.bt += dt / 0.45;
    const done = st.bt >= 1;
    stackMatrix(st, st.bump, done ? 1 : Math.max(0.01, easeBack(st.bt)));
    if (done) { st.bump = -1; bumping.splice(k, 1); }
  }
}
// 動物棚和機器存貨量: how much every trough, nest box and machine tray holds
const stockMax = () => upVal('stockCap');
function applyStockCap(s) { const v = stockMax(); s.outMax = v; s.inMax = s.kind === 'producer' && v === 12 ? 10 : v; }
// shelves show up to 50 goods, ten per layer: the number badge sits above the top layer
function shelfTop(def) { return (def.fridge ? 1.6 : 1.95) + Math.max(0, Math.ceil(Math.min(SHELF_VIS, upVal('shelfCap')) / 10) - 2) * ITEMS[def.item].h * 0.95; }
const PLANTS = { tomato: P.tomatoPlant, corn: P.cornPlant, soy: P2.soyPlant, wheat: P2.wheatPlant, apple: P2.appleTree, carrot: P2.carrotPlant, strawberry: P2.strawberryPlant, pumpkin: P2.pumpkinPlant, flower: P2.flowerPlant };
const CROP_LAYOUT = {
  // left half first (the original 2 x 2 bed), the right half appears from the 5th plant
  tomato: { w: 6.4, d: 2.4, half: true, spots: [[-2.4, -0.55], [-0.8, -0.55], [-2.4, 0.55], [-0.8, 0.55], [0.8, -0.55], [2.4, -0.55], [0.8, 0.55], [2.4, 0.55]] },
  corn: { w: 3.2, d: 2.8, spots: [[-1, -0.85], [0, -0.85], [1, -0.85], [-1, 0], [0, 0], [1, 0], [-1, 0.85], [0, 0.85], [1, 0.85]] },
  soy: { w: 3.4, d: 2.6, spots: [[-1.1, -0.6], [0, -0.6], [1.1, -0.6], [-1.1, 0.6], [0, 0.6], [1.1, 0.6]] },
  wheat: { w: 3.4, d: 2.6, spots: [[-1.1, -0.6], [-0.37, -0.6], [0.37, -0.6], [1.1, -0.6], [-1.1, 0.6], [-0.37, 0.6], [0.37, 0.6], [1.1, 0.6]] },
  apple: { w: 5.6, d: 3.8, spots: [[-1.9, -0.95], [0, -0.95], [1.9, -0.95], [-1.9, 0.95], [0, 0.95], [1.9, 0.95]] },
  carrot: { w: 3.4, d: 2.6, spots: [[-1.1, -0.6], [-0.37, -0.6], [0.37, -0.6], [1.1, -0.6], [-1.1, 0.6], [-0.37, 0.6], [0.37, 0.6], [1.1, 0.6]] },
  strawberry: { w: 3.6, d: 2.6, spots: [[-1.2, -0.6], [-0.4, -0.6], [0.4, -0.6], [1.2, -0.6], [-1.2, 0.6], [-0.4, 0.6], [0.4, 0.6], [1.2, 0.6]] },
  pumpkin: { w: 3.8, d: 2.8, spots: [[-1.2, -0.65], [0, -0.65], [1.2, -0.65], [-1.2, 0.65], [0, 0.65], [1.2, 0.65]] },
  flower: { w: 3.6, d: 2.6, spots: [[-1.2, -0.6], [-0.4, -0.6], [0.4, -0.6], [1.2, -0.6], [-1.2, 0.6], [-0.4, 0.6], [0.4, 0.6], [1.2, 0.6]] },
};

function build(def, instant) {
  const id = def.id;
  if (!state.built.includes(id)) state.built.push(id);
  const s = { id, def, kind: def.kind };
  stations[id] = s;
  const pos = def.pos || def.zone;
  if (def.kind === 'producer') {
    // 牛棚 (milk), 羊圈 (wool) and 雞舍 (eggs)
    const isBarn = def.out === 'milk', isFold = def.out === 'wool';
    const b = isBarn ? P.barn() : isFold ? P.fold() : P.coop();
    b.g.position.set(pos[0], 0, pos[1]); scene.add(b.g);
    const tw = b.trough.getWorldPosition(new THREE.Vector3()), nw = b.nest.getWorldPosition(new THREE.Vector3());
    Object.assign(s, { g: b.g, inPt: tw, outPt: nw, inN: 0, outN: 0, inMax: 10, outMax: 12, timer: 0, animals: [] });
    applyStockCap(s);
    const inSl = [], outSl = [];
    for (let i = 0; i < STOCK_VIS; i++) inSl.push({ x: -0.4 + (i % 5) * 0.2, y: 0.3 + Math.floor(i / 5) * 0.17, z: (Math.floor(i / 5) % 2) * 0.08 - 0.04, s: 0.62 });
    for (let i = 0; i < STOCK_VIS; i++) outSl.push({ x: -0.3 + (i % 4) * 0.2, y: 0.22 + Math.floor(i / 8) * (def.out === 'wool' ? 0.2 : 0.22), z: -0.18 + (Math.floor(i / 4) % 2) * 0.3, s: 0.85 });
    s.inStack = itemStack(b.trough, 'hay', inSl); s.outStack = itemStack(b.nest, def.out, outSl);
    if (isBarn) {
      for (let i = 0; i < 10; i++) { const c = P.cow(); c.g.position.set(pos[0], 0, pos[1] + 0.9); scene.add(c.g); K.bakeStatic(c.b); s.animals.push({ ...c, home: [pos[0], pos[1] + 0.9], rx: 0, rz: 0, t: Math.random() * 5, tx: 0, tz: 0, cow: true }); }
      box(pos[0] - 1.85, pos[1] - 2, pos[0] + 1.85, pos[1] + 0.2); penBoxes(pos[0], pos[1] + 1.87, 5.0, 3.5);
      for (const k of [-1, 1]) box(pos[0] + k * 1.85, pos[1] - 0.85, pos[0] + k * 2.65, pos[1] + 0.2);
    } else if (isFold) {
      for (let i = 0; i < 6; i++) { const c = P.sheep(); c.g.position.set(pos[0] - 0.9 + (i % 3) * 0.9, 0, pos[1] + 0.5 + Math.floor(i / 3) * 0.75); c.g.scale.setScalar(0.8); scene.add(c.g); K.bakeStatic(c.b); s.animals.push({ ...c, home: [pos[0], pos[1] + 0.9], rx: 1.0, rz: 0.45, t: Math.random() * 5, tx: 0, tz: 0 }); }
      box(pos[0] - 1.5, pos[1] - 2, pos[0] + 1.5, pos[1] + 0.2); penBoxes(pos[0], pos[1] + 0.9, 3.0, 1.8);
      buildSheepGrass();
    } else {
      for (let i = 0; i < 8; i++) { const c = P.chicken(); c.g.position.set(pos[0] - 0.75 + (i % 4) * 0.5, 0, pos[1] + 0.7 + Math.floor(i / 4) * 0.7); scene.add(c.g); K.bakeStatic(c.b); s.animals.push({ ...c, home: [pos[0], pos[1] + 0.75], rx: 0.95, rz: 0.4, t: Math.random() * 5, tx: 0, tz: 0 }); }
      box(pos[0] - 1.2, pos[1] - 1.45, pos[0] + 1.2, pos[1] + 0.25);
      Object.assign(s, { yard: b.yard, yard2: b.yard2, big: false, penB: penBoxes(pos[0], pos[1] + 0.6, 2.4, 1.4) });
    }
    const st = state.stock[id]; if (st) { s.inN = st.a || 0; s.outN = st.b || 0; }
    applyGrow(s);
    s.inLabel = label('badge', '', (o) => o.copy(tw).setY(1.0)); s.inLabel.near = 0;
    s.outLabel = label('badge', '', (o) => o.copy(nw).setY(0.95)); s.outLabel.near = 0;
    if (!instant) popIn(b.g);
  } else if (def.kind === 'machine') {
    const m = P2.machine(def.mk);
    m.g.position.set(pos[0], 0, pos[1]); scene.add(m.g);
    const tw = m.inTray.getWorldPosition(new THREE.Vector3()), nw = m.outTray.getWorldPosition(new THREE.Vector3());
    Object.assign(s, { g: m.g, spin: m.spin, inPt: tw, outPt: nw, inN: 0, outN: 0, inMax: 12, outMax: 12, timer: 0 });
    applyStockCap(s);
    const inSl = [], outSl = [];
    for (let i = 0; i < STOCK_VIS; i++) inSl.push({ x: -0.3 + (i % 4) * 0.2, y: 0.25 + Math.floor(i / 8) * ITEMS[def.in].h * 0.72, z: -0.18 + (Math.floor(i / 4) % 2) * 0.3, s: 0.75 });
    for (let i = 0; i < STOCK_VIS; i++) outSl.push({ x: -0.3 + (i % 4) * 0.2, y: 0.25 + Math.floor(i / 8) * ITEMS[def.out].h * 0.75, z: -0.18 + (Math.floor(i / 4) % 2) * 0.3, s: 0.75 });
    s.inStack = itemStack(m.inTray, def.in, inSl); s.outStack = itemStack(m.outTray, def.out, outSl);
    box(pos[0] - 0.85, pos[1] - 0.8, pos[0] + 0.85, pos[1] + 0.4);
    const st = state.stock[id]; if (st) { s.inN = st.a || 0; s.outN = st.b || 0; }
    s.inLabel = label('badge', '', (o) => o.copy(tw).setY(0.95)); s.inLabel.near = 0;
    s.outLabel = label('badge', '', (o) => o.copy(nw).setY(0.95)); s.outLabel.near = 0;
    if (!instant) popIn(m.g);
    s.tag = label('mtag', '', (o) => o.set(pos[0], 2.35, pos[1] - 0.2)); s.tag.near = 9;
    machTag(s);
  } else if (def.kind === 'crop') {
    const L = CROP_LAYOUT[def.plant];
    const g = new THREE.Group(); g.position.set(pos[0], 0, pos[1]); scene.add(g);
    if (def.plant === 'apple') K.add(g, K.mesh(G.rbox(L.w, 0.08, L.d, 0.2), '#9fd25a', false, true), 0, 0.04, 0);
    else if (L.half) {
      const a = P.plot(L.w / 2, L.d); a.position.x = -L.w / 4; g.add(a);
      const b = P.plot(L.w / 2, L.d); b.position.x = L.w / 4; b.userData.dyn = true; b.visible = false; g.add(b); s.plot2 = b;
    } else g.add(P.plot(L.w, L.d));
    s.plants = [];
    for (const [x, z] of L.spots) {
      const pl = PLANTS[def.plant](); pl.g.position.set(x, def.plant === 'apple' ? 0 : 0.2, z); pl.g.userData.dyn = true; pl.fruit.userData.dyn = true; g.add(pl.g); K.bakeStatic(pl.g); K.bakeStatic(pl.fruit);
      s.plants.push({ ...pl, x: pos[0] + x, z: pos[1] + z, ripe: true, t: 0, res: null });
      if (def.plant === 'apple') box(pos[0] + x - 0.25, pos[1] + z - 0.25, pos[0] + x + 0.25, pos[1] + z + 0.25);
    }
    s.grow = def.grow; s.g = g; s.w = L.w; s.d = L.d;
    applyGrow(s);
    if (isBuilt('sprinkler')) addSprinkler(s);
    if (!instant) popIn(g);
  } else if (def.kind === 'shelf') {
    // flip: the new back-to-back rows in the 百貨公司 face -z (towards the back walkways)
    const sh = def.fridge ? P2.fridge() : P.shelf(); sh.g.position.set(pos[0], 0.12, pos[1]); if (def.flip) sh.g.rotation.y = Math.PI; scene.add(sh.g);
    const dir = def.flip ? -1 : 1;
    Object.assign(s, { g: sh.g, n: 0, item: def.item, dir, front: V3(pos[0], 0, pos[1] + 1.25 * dir), door: sh.door || null, dk: 0 });
    const ih = ITEMS[def.item].h * 0.95, sl = [];
    const y0 = sh.slots[0].y, zs = def.fridge ? [-0.22, 0.22] : [-0.2, 0.18];
    for (let i = 0; i < SHELF_VIS; i++) { const c = i % 5, r = Math.floor(i / 5) % 2; sl.push({ x: -0.6 + c * 0.3, y: y0 + Math.floor(i / 10) * ih, z: zs[r], ry: (i % 3) * 0.2 - 0.2, s: 0.92 }); }
    s.stack = itemStack(sh.g, def.item, sl);
    if (!def.fridge) { const ic = itemClone(def.item); ic.scale.setScalar(0.9); ic.position.set(0, 1.12, -0.38); sh.g.add(ic); }
    const st = state.stock[id]; if (st) s.n = st.a || 0;
    s.label = label('badge big', '', (o) => o.set(pos[0], shelfTop(def), pos[1]));
    box(pos[0] - 0.85, pos[1] - 0.5, pos[0] + 0.85, pos[1] + 0.5);
    if (!instant) popIn(sh.g);
  } else if (def.kind === 'hire') {
    if (!(def.role === 'cashier' && kioskOn())) s.worker = makeWorker(def.role, def.zone, def.counter || 0, !instant);
  } else if (def.kind === 'pet') {
    if (id === 'dog') { const d = P.dog(); d.g.position.set(pos[0], 0, pos[1]); scene.add(d.g); pets.dog = { ...d, ph: 0 }; if (!instant) popIn(d.g); }
    else { const c = P.cat(); c.g.position.set(5.6, 1.12, -10.1); c.g.rotation.y = -0.6; scene.add(c.g); pets.cat = { ...c, ph: 0 }; if (!instant) popIn(c.g); }
  } else if (def.kind === 'sprinkler') {
    for (const st of Object.values(stations)) if (st.kind === 'crop') addSprinkler(st);
  } else if (def.kind === 'market') {
    buildMarket(instant);
  } else if (def.kind === 'dept') {
    applyDept(!instant);
  } else if (def.kind === 'counter1') {
    buildCounter(0, instant);
  } else if (def.kind === 'counterX') {
    buildCounter(def.counter, instant);
  } else if (def.kind === 'counter2') {
    buildCounter(1, instant);
  } else if (def.kind === 'dock') {
    const g = new THREE.Group(); g.position.set(pos[0], 0, pos[1]); scene.add(g);
    K.add(g, K.mesh(G.rbox(2.2, 0.35, 3.2, 0.08), C.woodLight), 0, 0.17, 0);
    for (const z of [-1.4, 1.4]) K.add(g, K.mesh(G.rbox(0.18, 1.1, 0.18, 0.05), C.woodDark), -0.95, 0.55, z);
    K.add(g, K.mesh(G.rbox(0.12, 0.7, 2.9, 0.05), C.roof), -0.95, 1.1, 0);
    truck.ready = true;
    K.bakeStatic(g);
    if (!instant) popIn(g);
  } else if (def.kind === 'store') {
    const wh = P2.warehouse(); wh.g.position.set(pos[0], 0, pos[1]); scene.add(wh.g);
    box(pos[0] - 2.15, pos[1] - 1.85, pos[0] + 2.15, pos[1] + 1.85);
    const depPt = V3(pos[0] - 1.1, 0, pos[1] + 3.0), outPt = V3(pos[0] + 1.1, 0, pos[1] + 3.0);
    Object.assign(s, { g: wh.g, door: wh.door, depPt, outPt, k: 0 });
    s.label = label('store', '', (o) => o.set(pos[0], 3.9, pos[1] + 1));
    const lamp = P2.wallLamp(); lamp.g.position.set(pos[0], 2.75, pos[1] + 1.95); scene.add(lamp.g);
    makeArea(pos[0] - 2.6, pos[1] - 2, pos[0] + 2.6, pos[1] + 4, [lamp], pos[0], pos[1] + 2.6);
    if (!instant) popIn(wh.g);
  } else if (def.kind === 'hall') {
    applyHall(!instant);
  } else if (def.kind === 'door') {
    buildFront();
    if (state.up.look) applyShopLook(false);
  } else if (def.kind === 'expand') {
    applyExpand(!instant);
  } else if (def.kind === 'mapgate') {
    mapsSet(def.map || 'cafe');
    if (!instant) setTimeout(() => openPanel('map'), 900);
  } else if (def.kind === 'parking') {
    buildParking(instant);
  } else if (def.kind === 'helipad') {
    const g = P2.helipad(); g.position.set(HELI.x, 0, HELI.z); scene.add(g);
    heli.ready = true;
    if (!instant) popIn(g);
  }
  if (s.g && s.g.isObject3D) K.bakeStatic(s.g);
  if (!instant) { confetti(pos[0], pos[1]); sfx('unlock'); toast('🎉 ' + def.name + ' 完成！'); }
  refreshZones();
  if (kioskOn()) applyKiosk(!instant);
  save();
}
// the three fenced sides of an animal pen are solid
function penBoxes(cx, cz, w, d) {
  return [box(cx - w / 2 - 0.15, cz + d / 2 - 0.15, cx + w / 2 + 0.15, cz + d / 2 + 0.15),
    box(cx - w / 2 - 0.15, cz - d / 2, cx - w / 2 + 0.15, cz + d / 2),
    box(cx + w / 2 - 0.15, cz - d / 2, cx + w / 2 + 0.15, cz + d / 2)];
}
// 5+ chickens: the small yard becomes the big picket-fence yard (walls, colliders and roaming area)
function setYard(s, big, anim) {
  if (!s.yard2 || s.big === big) return;
  s.big = big; s.yard.visible = !big; s.yard2.visible = big;
  if (big && anim) popIn(s.yard2);
  for (const b of s.penB) unbox(b);
  const [x, z] = s.def.pos;
  s.penB = big ? penBoxes(x, z + 0.95, 2.4, 2.1) : penBoxes(x, z + 0.6, 2.4, 1.4);
  for (const a of s.animals) { a.home = big ? [x, z + 1.0] : [x, z + 0.75]; a.rz = big ? 0.75 : 0.4; }
}
function applyGrow(s) {
  const id = s.id; if (!GROW[id]) return;
  const n = lvlOf(id);
  if (s.yard2) setYard(s, n > 4, s.animals.some((a) => a.g.visible));
  if (s.animals && s.def.out === 'milk') layoutCows(s, n);
  if (s.animals) s.animals.forEach((a, i) => { const on = i < n; if (on && !a.g.visible) popIn(a.g); a.g.visible = on; });
  const fresh = s.plants && !s.plants.some((q) => q.active);
  if (s.plot2) { const on = n > 4; if (on && !s.plot2.visible && s.plants.some((q) => q.active)) popIn(s.plot2); s.plot2.visible = on; }
  if (s.plants) s.plants.forEach((pl, i) => {
    const on = i < n;
    // a brand-new field starts ripe; plants added later grow from seed
    if (on && !pl.active) { pl.g.visible = true; pl.ripe = fresh; pl.t = 0; pl.fruit.visible = fresh; pl.fruit.scale.setScalar(1); if (!fresh) popIn(pl.g); }
    if (!on) { pl.g.visible = false; pl.ripe = false; }
    pl.active = on;
  });
}
// every cow is the same size and has its own place: a new cow never moves or shrinks the others
// front row first, each row filled from the middle outwards
const COW_SIZE = 0.85, COW_COLS = [0, -1, 1, -2, 2];
function layoutCows(s, n) {
  const [px, pz] = s.def.pos;
  s.animals.forEach((a, i) => {
    if (i >= n) return;
    const x = px + COW_COLS[i % 5] * 0.94, z = pz + (i < 5 ? 2.55 : 0.85);
    a.home = [x, z]; a.tx = x; a.tz = z;
    a.g.position.set(x, 0, z); a.g.rotation.y = 0;
    a.b.scale.setScalar(COW_SIZE); a.g.children[0].scale.setScalar(COW_SIZE);
  });
}
function machTag(s) {
  const lv = GROW[s.id] ? lvlOf(s.id) : 1;
  setLabel(s.tag, '<b>' + s.def.name + (lv > 1 ? ' Lv' + lv : '') + '</b><span>' + ICON[s.def.in] + ' → ' + ICON[s.def.out] + '</span>');
}
function applyField() {
  const n = lvlOf('field');
  tufts.forEach((t, i) => {
    if (t.extra) return; // the 羊圈 grass is always there
    const on = i < n;
    if (on && !t.active) { t.g.visible = true; t.grown = true; t.tall.visible = true; if (tufts.some((q) => q.active)) popIn(t.g); }
    if (!on) { t.g.visible = false; t.grown = false; }
    t.active = on;
  });
}
function addSprinkler(s) {
  for (const [dx, dz] of [[-s.w / 2 - 0.15, -s.d / 2 - 0.15], [s.w / 2 + 0.15, s.d / 2 + 0.15]]) {
    const sp = P2.sprinkler(); sp.g.position.set(s.def.pos[0] + dx, 0, s.def.pos[1] + dz); scene.add(sp.g);
    sprinklers.push({ ...sp, ph: Math.random() * 6 });
  }
}
// ---------- shop entrances ----------
// A: the wide main door; B: a cheap side door early on; C: opens with the 超級市場; D: a 4th door on the market front.
// Every door sits in a gap between the counters, and no queue line starts in front of one.
const DOORS = [
  { x: 6.4, w: 2.5, on: () => true },
  { x: -3.5, w: 2.0, on: () => isBuilt('doorB') },
  { x: -9.6, w: 2.1, on: () => isBuilt('market') },
  { x: -19.2, w: 2.0, on: () => isBuilt('doorD') },
];
const ENTRY = [14.2, -3.5], OUT_Z = -4.9, LEAVE_Z = -7.85;
const openDoors = () => DOORS.filter((d) => d.on());
function nearestDoor(x) { let best = DOORS[0]; for (const d of openDoors()) if (Math.abs(d.x - x) < Math.abs(best.x - x)) best = d; return best; }
// glass front wall from the west end of the shop to the east wall, with a gap and a sliding door for every open door
function buildFront() {
  if (mFront.g) scene.remove(mFront.g);
  for (const b of mFront.b) unbox(b);
  const g = K.add(scene, new THREE.Group()); mFront = { g, b: [] };
  const piece = (x0, x1) => {
    if (x1 - x0 < 0.05) return;
    K.add(g, K.mesh(G.rbox(x1 - x0, 0.55, 0.3, 0.08), C.wall), (x0 + x1) / 2, 0.28, -7.3);
    if (x1 - x0 > 0.3) K.add(g, K.mesh(G.rbox(x1 - x0 - 0.1, 0.62, 0.12, 0.04), '#cfeeff'), (x0 + x1) / 2, 0.85, -7.3);
    K.add(g, K.mesh(G.rbox(x1 - x0, 0.14, 0.32, 0.05), C.wallTrim), (x0 + x1) / 2, 1.2, -7.3);
    mFront.b.push(box(x0, -7.5, x1, -7.1));
  };
  let x = isBuilt('market') ? -20.85 : -6.8;
  for (const d of openDoors().sort((a, b) => a.x - b.x)) {
    if (d.x < x) continue;
    piece(x, d.x - d.w / 2 - 0.05); x = d.x + d.w / 2 + 0.05;
    if (!d.d) { d.d = P2.slidingDoor(d.w); d.d.g.position.set(d.x, 0.1, -7.3); d.k = 0; scene.add(d.d.g); }
  }
  piece(x, 7.95);
  K.bakeStatic(g);
}
// the 百貨公司: back walls move from z -17.6 to -25.6, new floor, side walls, lamps and a big sign
// the 百貨公司 back wall on its own, so the 新館 can open three walkways through it (at the side aisles)
let deptBack = { g: null, b: [] };
const HALL_Z = -33.6, HALL_GAPS = [-19.6, -6.6, 6.6];
function deptBackWall(gaps) {
  if (deptBack.g) scene.remove(deptBack.g);
  for (const b of deptBack.b) unbox(b);
  const g = K.add(scene, new THREE.Group()); deptBack = { g, b: [] };
  const piece = (x0, x1) => {
    if (x1 - x0 < 0.05) return;
    K.add(g, K.mesh(G.rbox(x1 - x0, 2.2, 0.4, 0.08), C.wall), (x0 + x1) / 2, 1.1, DEPT_Z);
    K.add(g, K.mesh(G.rbox(x1 - x0 + 0.06, 0.2, 0.46, 0.05), C.wallTrim), (x0 + x1) / 2, 2.2, DEPT_Z);
    deptBack.b.push(box(x0, DEPT_Z - 0.2, x1, DEPT_Z + 0.2));
  };
  let x = -21.05;
  for (const o of gaps ? HALL_GAPS : []) {
    piece(x, o - 0.9); x = o + 0.9;
    K.add(g, K.mesh(G.rbox(1.9, 0.32, 0.44, 0.06), C.wallTrim), o, 2.1, DEPT_Z);
  }
  piece(x, 8.15);
  for (const wx of [-16.5, -10.5, -2.5, 3.5]) K.add(g, K.mesh(G.rbox(2.6, 1.0, 0.08, 0.06), '#bfe9ff'), wx, 1.2, DEPT_Z + 0.22);
  const sign = P2.signBoard('百貨公司', 5.4, '#a98bff'); sign.position.set(-6.45, 3.0, DEPT_Z + 0.1); g.add(sign);
  K.bakeStatic(g);
}
// 新館: one more hall behind the 百貨公司 for the third copy of every shelf
let hallG = null;
function applyHall(anim) {
  if (!isBuilt('hall') || hallG) return;
  deptBackWall(true);
  const g = K.add(scene, new THREE.Group());
  const zMid = (DEPT_Z + HALL_Z) / 2, dz = DEPT_Z - HALL_Z;
  K.add(g, K.mesh(G.rbox(28.8, 0.12, dz + 0.4, 0.06, 2), C.floor, false, true), -6.4, 0.06, zMid);
  for (let x = -20; x < 7.6; x += 1.6) for (let z = HALL_Z + 0.4; z < DEPT_Z - 0.2; z += 1.6) if ((Math.round(x / 1.6) + Math.round(z / 1.6)) % 2 === 0) { const d = Math.min(1.58, DEPT_Z - 0.2 - z); K.add(g, K.mesh(G.plane(1.58, d), '#ffe0a8', false, true), x + 0.8, 0.125, z + d / 2); }
  K.add(g, K.mesh(G.rbox(29.2, 2.2, 0.4, 0.08), C.wall), -6.45, 1.1, HALL_Z);
  K.add(g, K.mesh(G.rbox(29.3, 0.2, 0.46, 0.05), C.wallTrim), -6.45, 2.2, HALL_Z);
  for (const x of [-16.5, -10.5, -2.5, 3.5]) K.add(g, K.mesh(G.rbox(2.6, 1.0, 0.08, 0.06), '#bfe9ff'), x, 1.2, HALL_Z + 0.22);
  for (const x of [-20.8, 7.95]) { K.add(g, K.mesh(G.rbox(0.4, 2.2, dz + 0.4, 0.08), C.wall), x, 1.1, zMid); K.add(g, K.mesh(G.rbox(0.46, 0.2, dz + 0.5, 0.05), C.wallTrim), x, 2.2, zMid); }
  const sign = P2.signBoard('新館', 3.2, '#ff7eb6'); sign.position.set(-6.45, 3.0, HALL_Z + 0.1); g.add(sign);
  box(-21, HALL_Z - 0.2, 8.15, HALL_Z + 0.2); box(-21, HALL_Z, -20.6, DEPT_Z); box(7.75, HALL_Z, 8.15, DEPT_Z);
  for (const x of [-18, -12, -1, 5]) { const l = P2.wallLamp(); l.g.position.set(x, 1.9, HALL_Z + 0.3); scene.add(l.g); shopArea.lamps.push(l); }
  shopArea.z0 = HALL_Z + 0.2; shopArea.light.position.z = -20; shopArea.light.distance = 48;
  K.bakeStatic(g); hallG = g;
  if (state.up.floor) applyFloor(false);
  if (anim) { popIn(g); confetti(-6.5, -29.5); }
}
function applyDept(anim) {
  if (!isBuilt('dept') || deptG) return;
  for (const k of ['g1', 'g2']) if (backWalls[k]) { scene.remove(backWalls[k]); backWalls[k] = null; }
  for (const k of ['b1', 'b2']) if (backWalls[k]) { unbox(backWalls[k]); backWalls[k] = null; }
  const g = K.add(scene, new THREE.Group());
  const zMid = (DEPT_Z + -17.4) / 2, dz = -17.4 - DEPT_Z;
  K.add(g, K.mesh(G.rbox(28.8, 0.12, dz + 0.4, 0.06, 2), C.floor, false, true), -6.4, 0.06, zMid);
  for (let x = -20; x < 7.6; x += 1.6) for (let z = DEPT_Z + 0.4; z < -17.6; z += 1.6) if ((Math.round(x / 1.6) + Math.round(z / 1.6)) % 2 === 0) K.add(g, K.mesh(G.plane(1.58, Math.min(1.58, -17.5 - z)), C.floor2, false, true), x + 0.8, 0.125, z + Math.min(1.58, -17.5 - z) / 2);
  for (const x of [-20.8, 7.95]) { K.add(g, K.mesh(G.rbox(0.4, 2.2, dz + 0.4, 0.08), C.wall), x, 1.1, zMid); K.add(g, K.mesh(G.rbox(0.46, 0.2, dz + 0.5, 0.05), C.wallTrim), x, 2.2, zMid); }
  deptBackWall(isBuilt('hall'));
  box(-21, DEPT_Z, -20.6, -17.4); box(7.75, DEPT_Z, 8.15, -17.4);
  for (const l of shopArea.lamps) l.g.position.z = DEPT_Z + 0.3;
  shopArea.z0 = DEPT_Z + 0.2; shopArea.light.position.z = -16; shopArea.light.distance = 40;
  K.bakeStatic(g); deptG = g;
  buildFront();
  if (state.up.floor) applyFloor(false);
  // a big sign over the new door, facing the road side
  const fs = P2.signBoard('百貨公司', 3.0, '#a98bff'); fs.position.set(-9.6, 2.35, -7.1); scene.add(fs);
  if (anim) { popIn(g); confetti(-6.5, -21); }
}
function buildMarket(instant) {
  const g = K.add(scene, new THREE.Group());
  K.add(g, K.mesh(G.rbox(14.4, 0.12, 10.4, 0.06, 2), C.floor, false, true), -13.6, 0.06, -12.2);
  K.add(g, K.mesh(G.rbox(14.2, 0.05, 0.6, 0.03, 1), C.floor2, false, true), -13.6, 0.125, -7.3);
  for (let x = -20; x < -6.6; x += 1.6) for (let z = -16.6; z < -7.6; z += 1.6) if ((Math.round(x / 1.6) + Math.round(z / 1.6)) % 2 === 0) K.add(g, K.mesh(G.plane(1.58, 1.58), C.floor2, false, true), x + 0.8, 0.125, z + 0.8);
  backWalls.g2 = K.add(scene, new THREE.Group());
  K.add(backWalls.g2, K.mesh(G.rbox(14.4, 2.2, 0.4, 0.08), C.wall), -13.6, 1.1, -17.6);
  K.add(backWalls.g2, K.mesh(G.rbox(14.5, 0.2, 0.46, 0.05), C.wallTrim), -13.6, 2.2, -17.6);
  K.add(g, K.mesh(G.rbox(0.4, 2.2, 10.2, 0.08), C.wall), -20.8, 1.1, -12.3);
  K.add(g, K.mesh(G.rbox(0.46, 0.2, 10.3, 0.05), C.wallTrim), -20.8, 2.2, -12.3);
  for (const x of [-18, -13.5, -9]) K.add(backWalls.g2, K.mesh(G.rbox(2.6, 1.0, 0.08, 0.06), '#bfe9ff'), x, 1.2, -17.38);
  K.bakeStatic(backWalls.g2);
  const sign = P2.signBoard('超級市場', 5, '#ff8a6b'); sign.position.set(-13.6, 3.0, -17.5); g.add(sign);
  backWalls.b2 = box(-21, -17.8, -6.6, -17.4); box(-21, -17.5, -20.6, -7.2);
  buildFront();
  for (const x of [-18, -13.5, -9]) { const l = P2.wallLamp(); l.g.position.set(x, 1.9, -17.3); scene.add(l.g); shopArea.lamps.push(l); }
  K.add(g, K.mesh(G.circle(1.1, 24), '#ff8fb1', false, true), VIP.x, 0.02, VIP.z);
  K.add(g, K.mesh(G.circle(0.85, 24), '#ffd1e0', false, true), VIP.x, 0.025, VIP.z);
  shopArea.x0 = -20.8; shopArea.light.position.x = -6.5; shopArea.light.distance = 26;
  if (standWall.g) { scene.remove(standWall.g); standWall.g = null; unbox(standWall.b); }
  if (state.up.look) applyShopLook(false);
  if (state.up.floor) applyFloor(false);
  K.bakeStatic(g);
  if (!instant) popIn(g);
}
function buildParking(instant) {
  const g = K.add(scene, new THREE.Group(), 23.6, 0, -10);
  K.add(g, K.mesh(G.rbox(10, 0.08, 12.4, 0.2), '#9aa1ab', false, true), 0, 0.04, 0);
  for (let i = 0; i < 5; i++) for (const z of [-3.6, 3.6]) K.add(g, K.mesh(G.plane(0.14, 3.2), '#ffffff', false, true), -4 + i * 2, 0.09, z);
  K.add(g, K.mesh(G.plane(9.6, 0.14), '#ffde59', false, true), 0, 0.09, 0);
  park.ready = true;
  K.bakeStatic(g);
  if (!instant) popIn(g);
}

// ---------- zones ----------
const zones = {};
const dashTex = K.dashTexture();
const dashMat = new THREE.MeshBasicMaterial({ map: dashTex, transparent: true, depthWrite: false });
const fillMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false });
function refreshZones() {
  for (let i = 0; i < DEFS.length; i++) {
    const def = DEFS[i];
    if (isBuilt(def.id)) { if (zones[def.id]) killZone(def.id); continue; }
    let open = (def.req || def.any) ? (!def.req || def.req.every(isBuilt)) && (!def.any || def.any.some(isBuilt)) : isBuilt(DEFS[i - 1].id);
    if (def.earned && state.earned < def.earned) open = false;
    if (def.lines && linesBuilt() < def.lines) open = false;
    if (def.kind === 'mapgate' && !BRANCHES_OPEN) open = false;
    // the two starting choices: picking one hides the other until the first cashier is hired
    if (def.alt && isBuilt(def.alt) && !isBuilt('cashier')) open = false;
    if (!open && zones[def.id]) { killZone(def.id); continue; }
    if (!open) continue;
    if (def.kind === 'hire' && def.role === 'cashier' && kioskOn()) { if (zones[def.id]) killZone(def.id); delete state.paid[def.id]; state.built.push(def.id); i = -1; continue; }
    const zd = zoneDef(def);
    if (zones[def.id] && zones[def.id].def.cost.money !== zd.cost.money) killZone(def.id); // price moved after a hire
    if (!zones[def.id]) makeZone(zd);
  }
  const gd = growDefs(), live = new Set(gd.map((d) => d.id));
  for (const id of Object.keys(zones)) if (id.startsWith('g_') && !live.has(id)) killZone(id);
  for (const def of gd) {
    const z = zones[def.id];
    if (z && z.def.lv !== def.lv) killZone(def.id);
    if (!zones[def.id]) makeZone(def);
  }
}
// 開分店 needs this many of the new product lines (a line counts once its first shelf is up)
function linesBuilt() { return NEW_LINES.filter(isBuilt).length; }
function frontOf(def) {
  if (def.kind === 'producer') return [def.pos[0], def.pos[1] + (def.out === 'milk' ? 5.2 : def.out === 'wool' ? 3.9 : 3.4)];
  if (def.kind === 'crop') { const L = CROP_LAYOUT[def.plant]; return [def.pos[0] - (L.half ? L.w / 4 : 0), def.pos[1] + L.d / 2 + 1.5]; }
  if (def.kind === 'machine') return def.upAt || [def.pos[0], def.pos[1] + 2.6];
  return def.pos;
}
function zoneSpot(def) {
  if (def.zone) return def.zone;
  if (def.kind === 'shelf') return [def.pos[0], def.pos[1] + 1.7];
  if (def.kind === 'producer') return frontOf(def);
  return def.pos;
}
// the next growth step for each building (or the grass patch), as a zone definition
function growDefs() {
  const out = [];
  for (const key in GROW) {
    const g = GROW[key], n = lvlOf(key);
    if (n >= g.max) continue;
    let spot, idx;
    if (key === 'field') { if (!isBuilt('coop')) continue; spot = [-5.3, -2.0]; idx = g.steps.indexOf(n); if (idx < 0) idx = 0; }
    else { if (!isBuilt(key)) continue; spot = frontOf(DEF[key]); idx = n - g.start; }
    out.push({ id: 'g_' + key, name: g.what, kind: 'grow', target: key, lv: n, zone: spot, cost: { money: g.cost[Math.min(idx, g.cost.length - 1)] } });
  }
  return out;
}
function grow(def) {
  const g = GROW[def.target], n = lvlOf(def.target);
  state.lvl[def.target] = def.target === 'field' ? g.steps[Math.min(g.steps.length - 1, g.steps.indexOf(n) + 1)] : n + 1;
  if (def.target === 'field') applyField(); else applyGrow(stations[def.target]);
  if (stations[def.target] && stations[def.target].tag) machTag(stations[def.target]);
  confetti(def.zone[0], def.zone[1]); sfx('unlock'); toast('🎉 ' + def.name + '！');
  refreshZones(); save();
}
function makeZone(def) {
  const [x, z] = zoneSpot(def);
  const g = new THREE.Group(); g.position.set(x, inShop(x, z) ? 0.15 : 0.03, z); scene.add(g);
  // big: the 擴建 zone is a larger dashed square
  const inner = K.add(g, new THREE.Group()); if (def.big) inner.scale.set(def.big, 1, def.big);
  const ring = new THREE.Mesh(G.plane(2.4, 2.4), dashMat); ring.renderOrder = 2; inner.add(ring);
  const fill = new THREE.Mesh(G.plane(1.9, 1.9), fillMat); fill.renderOrder = 2; fill.position.y = 0.005; fill.scale.set(1, 1, 0.001); inner.add(fill);
  if (def.kind === 'hire') g.add(P2.ghostPerson());
  const paid = state.paid[def.id] || {};
  // a zone that appears under the player's feet waits until they step off once (no accidental double buys)
  const z0 = { def, g, fill, x, z, paid, total: Object.values(def.cost).reduce((a, b) => a + b, 0), tick: 0, armed: dist2(player.p.root.position, x, z) > 1.5 };
  z0.label = label('zone', '', (o) => o.set(x, def.kind === 'hire' ? 2.0 : 0.4, z + 0.2));
  zones[def.id] = z0;
  updateZoneLabel(z0);
  popIn(g);
}
function killZone(id) { const z = zones[id]; scene.remove(z.g); dropLabel(z.label); delete zones[id]; }
function left(z, k) { return z.def.cost[k] - (z.paid[k] || 0); }
function updateZoneLabel(z) {
  let rows = '';
  for (const k in z.def.cost) { const l = left(z, k); if (l > 0) rows += costRow(k, fmtMoney(l)); }
  const d = z.def, how = d.kind === 'machine' ? '<div class="how">' + ICON[d.in] + ' → ' + ICON[d.out] + '</div>'
    : d.kind === 'grow' && GROW[d.target] && DEF[d.target] && DEF[d.target].kind === 'machine' ? '<div class="how">Lv' + d.lv + ' → Lv' + (d.lv + 1) + '</div>'
    : d.desc && z.on ? '<div class="desc">' + d.desc + '</div>' : '';
  setLabel(z.label, '<div class="zn">' + d.name + '</div>' + how + rows);
  let paidSum = 0; for (const k in z.def.cost) paidSum += Math.min(z.def.cost[k], z.paid[k] || 0);
  z.fill.scale.set(1, 1, Math.max(0.001, paidSum / z.total));
  z.fill.position.z = 0.95 * (1 - paidSum / z.total);
}
function payZones(dt) {
  for (const id in zones) {
    const z = zones[id];
    const onZ = dist2(player.p.root.position, z.x, z.z) <= 1.35 * (z.def.big || 1);
    if (onZ !== !!z.on) { z.on = onZ; if (z.def.desc) updateZoneLabel(z); }
    if (!onZ) { z.tick = 0; z.armed = true; z.stay = 0; continue; }
    if (!z.armed) continue;
    // only start paying after standing on the zone for half a second (walking across it costs nothing)
    z.stay = (z.stay || 0) + dt; if (z.stay < 0.5) continue;
    z.tick -= dt; if (z.tick > 0) continue;
    z.tick = 0.06;
    let moved = false;
    for (const k in z.def.cost) {
      const l = left(z, k); if (l <= 0) continue;
      if (k === 'money') {
        const chunk = Math.min(l, state.money, Math.max(1, Math.ceil(z.def.cost.money / 24)));
        if (chunk > 0) {
          state.money -= chunk; z.paid.money = (z.paid.money || 0) + chunk; moved = true;
          fly('money', V3(player.p.root.position.x, 1.6, player.p.root.position.z), (o) => o.set(z.x, 0.3, z.z), 0.25, null);
        }
      } else if (count(player, k) > 0) {
        z.paid[k] = (z.paid[k] || 0) + 1; moved = true;
        giveFrom(player, k, (o) => o.set(z.x, 0.3, z.z), null);
      }
    }
    if (!moved && z.total === 0) moved = true;
    if (moved) {
      state.paid[id] = z.paid; sfx('drop'); updateZoneLabel(z); updateMoney();
      let done = true; for (const k in z.def.cost) if (left(z, k) > 0) done = false;
      if (done) { delete state.paid[id]; const d = z.def; later.push({ t: 0.3, fn: () => (d.kind === 'grow' ? grow(d) : build(d)) }); killZone(id); }
    }
  }
}

// ---------- workers ----------
const workers = [];
function makeWorker(role, at, counter, pop, tint) {
  const look = role === 'manager' ? (counter ? { body: '#7aa65a', hat: 'cap', hatColor: '#3f6b2e', apron: '#e9f5d8' } : { body: '#4a5a86', hat: 'bun', hatColor: '#3a2a22', apron: '#ffffff' }) : role === 'cashier' ? { body: '#b48cff', hat: 'bun', hatColor: '#7a4fd6', apron: C.white }
    : role === 'farmer' ? { body: '#7fcf6a', hat: 'straw' } : role === 'keeper' ? { body: '#ffb347', hat: 'cap', hatColor: '#ff7f6e', apron: '#fff3dd' } : role === 'orderer' ? { body: '#e8504a', hat: 'cap', hatColor: '#2f3e66', apron: '#ffe08a' } : { body: '#5aa9ff', hat: 'cap', hatColor: '#ffd34a', apron: '#ffd34a' };
  const p = K.person(look);
  p.root.position.set(at[0], 0, at[1]); scene.add(p.root); if (pop) popIn(p.root);
  const w = carrier(p);
  Object.assign(w, { role, counter, job: null, wait: 0, face: 0, moving: 0 });
  w.cap = () => upVal('wcap') + (isFarmRole(role) ? FARM_CAP[mFarm()] : 0);
  if (role === 'farmer') { w.only = FARM_CROPS; w.home = [-2, 3]; }
  workers.push(w);
  if (role !== 'cashier') buildRest();
  return w;
}
// at most a few path searches per frame (phones): whoever is over the budget waits a frame for theirs
const NAV_PER_FRAME = 4;
let navBudget = NAV_PER_FRAME;
function go(w, x, z, dt, speed) {
  const key = x.toFixed(2) + ',' + z.toFixed(2);
  if (w.routeKey !== key || !w.route || !w.route.length) {
    if (navBudget <= 0) { w.moving = 0; return false; }
    navBudget--; w.routeKey = key; const p = w.p.root.position; w.route = nav.path(p.x, p.z, x, z);
  }
  while (w.route.length > 1 && walkTo(w, w.route[0][0], w.route[0][1], dt, speed)) w.route.shift();
  if (w.route.length > 1) return false;
  return walkTo(w, w.route[0][0], w.route[0][1], dt, speed);
}
function walkTo(w, x, z, dt, speed) {
  const pos = w.p.root.position, dx = x - pos.x, dz = z - pos.z, d = Math.hypot(dx, dz);
  if (d < 0.08) { w.moving = 0; return true; }
  const st = Math.min(d, speed * dt);
  pos.x += dx / d * st; pos.z += dz / d * st;
  w.face = Math.atan2(dx, dz); w.moving = 1;
  return d < 0.1;
}
function turn(p, face, dt) {
  const r = p.root.rotation.y; let diff = face - r;
  while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
  p.root.rotation.y = r + diff * Math.min(1, dt * 12);
}
const listOf = (kind) => Object.values(stations).filter((s) => s.kind === kind);
// ---------- 員工休息區: staff with nothing to do sit down here for a while, or stroll somewhere nobody else stands ----------
const REST = { x: -9.7, z: 6.6, seats: [], built: false };
for (const sz of [-1, 1]) for (const dx of [-0.75, 0, 0.75]) REST.seats.push({ x: REST.x + dx, z: REST.z + sz * 0.95, face: sz > 0 ? Math.PI : 0, w: null });
function buildRest() {
  if (REST.built) return; REST.built = true;
  const g = new THREE.Group(); g.position.set(REST.x, 0, REST.z); scene.add(g);
  K.add(g, K.mesh(G.rbox(3.6, 0.06, 3.1, 0.2), '#d9a46a', false, true), 0, 0.03, 0);
  for (let i = -2; i <= 2; i++) K.add(g, K.mesh(G.rbox(3.5, 0.01, 0.03, 0.005), '#b5804f', false), 0, 0.064, i * 0.6);
  // round table with a striped parasol
  K.add(g, K.mesh(G.cyl(0.42, 0.42, 0.06, 16), '#fbfaf5'), 0, 0.62, 0);
  K.add(g, K.mesh(G.cyl(0.06, 0.1, 0.6, 8), '#8f969f'), 0, 0.31, 0);
  K.add(g, K.mesh(G.cyl(0.035, 0.035, 1.5, 6), '#8f969f'), 0, 1.35, 0);
  K.add(g, K.mesh(G.cone(1.15, 0.45, 12), '#ff8a6b'), 0, 2.2, 0);
  K.add(g, K.mesh(G.sphere(0.07, 8, 6), '#ffffff'), 0, 2.46, 0);
  // two cups and a snack plate on the table
  K.add(g, K.mesh(G.cyl(0.06, 0.05, 0.12, 8), '#ffffff'), -0.18, 0.71, 0.1);
  K.add(g, K.mesh(G.cyl(0.06, 0.05, 0.12, 8), '#ffd34a'), 0.2, 0.71, -0.12);
  K.add(g, K.mesh(G.cyl(0.14, 0.12, 0.03, 12), '#9fd86b'), 0.05, 0.665, 0.18);
  // a bench on each side, backrest on the outside
  for (const sz of [-1, 1]) {
    K.add(g, K.mesh(G.rbox(2.3, 0.08, 0.42, 0.04), '#c9773f'), 0, 0.3, sz * 0.95);
    K.add(g, K.mesh(G.rbox(2.3, 0.36, 0.07, 0.03), '#c9773f'), 0, 0.56, sz * 1.22);
    for (const lx of [-1.0, 1.0]) K.add(g, K.mesh(G.rbox(0.08, 0.28, 0.36, 0.02), '#7a4a2a'), lx, 0.14, sz * 0.97);
  }
  // water cooler in the corner
  const wc = K.add(g, new THREE.Group(), 1.45, 0, -1.15);
  K.add(wc, K.mesh(G.rbox(0.42, 0.78, 0.4, 0.05), '#f4f6f8'), 0, 0.39, 0);
  K.add(wc, K.mesh(G.cyl(0.17, 0.17, 0.42, 12), '#7fc8ff'), 0, 0.99, 0);
  K.add(wc, K.mesh(G.rbox(0.08, 0.06, 0.06, 0.02), '#5aa9ff'), -0.08, 0.6, 0.22);
  K.add(wc, K.mesh(G.rbox(0.08, 0.06, 0.06, 0.02), '#ff6b6b'), 0.08, 0.6, 0.22);
  // a potted plant in the other corner
  const pl = K.add(g, new THREE.Group(), -1.5, 0, -1.2);
  K.add(pl, K.mesh(G.cyl(0.2, 0.15, 0.32, 10), '#d9774e'), 0, 0.16, 0);
  K.add(pl, K.mesh(G.sphere(0.32, 10, 8), '#5fbf4a'), 0, 0.55, 0);
  box(REST.x - 0.42, REST.z - 0.42, REST.x + 0.42, REST.z + 0.42);
  box(REST.x + 1.2, REST.z - 1.4, REST.x + 1.7, REST.z - 0.9);
  REST.tag = label('mtag', '<b>員工休息區</b>', (o) => o.set(REST.x, 2.9, REST.z)); REST.tag.near = 9;
}
function releaseSeat(w) { if (w.seat && w.seat.w === w) w.seat.w = null; w.seat = null; w.sit = 0; }
function idleWander(w, dt, cx, cz) {
  w.idl = 1;
  w.wait -= dt;
  if (w.seat) {
    const s = w.seat;
    if (go(w, s.x, s.z, dt, 1.6)) { w.face = s.face; w.sit = 1; }
    if (w.wait <= 0) { releaseSeat(w); w.wp = null; }
    return;
  }
  if (!w.wp || w.wait <= 0) {
    const p = w.p.root.position;
    // now and then a break on the benches (only when the rest area is not far away)
    if (REST.built && w.role !== 'manager' && Math.random() < 0.45 && dist2(p, REST.x, REST.z) < 24) {
      const free = REST.seats.filter((q) => !q.w || !workers.includes(q.w));
      if (free.length) { const q = free[Math.floor(Math.random() * free.length)]; q.w = w; w.seat = q; w.wait = 6 + Math.random() * 6; return; }
    }
    // otherwise stroll to a spot that is walkable and away from everybody else
    let best = null;
    for (let k = 0; k < 6; k++) {
      const x = cx + (Math.random() - 0.5) * 7, z = cz + (Math.random() - 0.5) * 5;
      if (!nav.free(x, z)) continue;
      best = [x, z];
      if (!workers.some((o) => o !== w && (dist2(o.p.root.position, x, z) < 1.4 || (o.wp && Math.hypot(o.wp[0] - x, o.wp[1] - z) < 1.4)))) break;
    }
    w.wp = best || [cx + (Math.random() - 0.5) * 3, cz + (Math.random() - 0.5) * 2];
    w.wait = 3 + Math.random() * 3;
  }
  go(w, w.wp[0], w.wp[1], dt, 1.3);
}
// every warehouse adds its capacity to one shared stock (the workers use whichever is nearest)
const storeCap = () => upVal('storeCap') * Math.max(1, listOf('store').length);
const storePend = () => listOf('store').reduce((a, s) => a + (s.pend || 0), 0);
function nearestStore(p) { let best = null, bd = 1e9; for (const s of listOf('store')) { const d = dist2(p, s.depPt.x, s.depPt.z); if (d < bd) { bd = d; best = s; } } return best; }
const storeRoom = () => storeCap() - storeTotal() - storePend();
const storeTotal = () => Object.values(state.store).reduce((a, b) => a + b, 0);
const srcCount = (src, item) => src.kind === 'store' ? (state.store[item] || 0) : src.outN;
function srcTake(src, item) { if (src.kind === 'store') state.store[item]--; else src.outN--; }
// the nearest output pile for an item (warehouse included), or a crop with ripe plants
function sourceFor(item, w, forMachine) {
  let best = null, bd = 1e9;
  // feeding a machine, the 理貨員 takes from anywhere; restocking shelves it leaves fields and animals to the others
  const shop = w.role === 'shelver' && !forMachine, hasF = shop && workers.some((o) => o.role === 'farmer'), hasK = shop && workers.some((o) => o.role === 'keeper');
  for (const s of Object.values(stations)) {
    let ok = false;
    if (s.kind === 'machine' && s.def.out === item && s.outN > 0) ok = true;
    if (s.kind === 'producer' && s.def.out === item && s.outN > 0 && !hasK) ok = true;
    if (s.kind === 'crop' && s.def.out === item && !hasF && s.plants.some((p) => p.ripe && (!p.res || p.res === w))) ok = true;
    if (s.kind === 'store' && (state.store[item] || 0) > 0) ok = true;
    if (!ok) continue;
    const pt = s.outPt || V3(s.def.pos[0], 0, s.def.pos[1]);
    const d = dist2(w.p.root.position, pt.x, pt.z);
    if (d < bd) { bd = d; best = s; }
  }
  return best;
}
const useStore = () => listOf('store').length > 0;
function pickJob(w) {
  if (!useStore()) return pickJobDirect(w);
  if (w.role === 'shelver') return shelfFromStore(w);
  if (w.role === 'farmer') return farmJob(w) || (storeRoom() <= 2 ? pickJobDirect(w) : null);
  return pickJobDirect(w);
}
// 理貨員: the shelf that needs it most, filled from the nearest warehouse
function shelfFromStore(w) {
  const want = (it) => customers.filter((c) => c.st === 'shop' && c.item === it).length;
  const cap = upVal('shelfCap');
  let best = null;
  for (const s of listOf('shelf')) {
    const space = cap - s.n - (s.pend || 0), have = state.store[s.item] || 0;
    if (space < 2 || !have) continue;
    const taken = workers.some((o) => o !== w && o.job && o.job.dst === s);
    const k = want(s.item) * 8 + space + (s.n === 0 ? 10 : 0) + Math.random() * 2 - (taken ? 12 : 0);
    if (!best || k > best.k) best = { k, s, max: Math.min(space, have) };
  }
  return best ? { dst: best.s, src: nearestStore(w.p.root.position), item: best.s.item, phase: 'get', max: best.max } : null;
}
// 農夫: ripe fields → warehouse, finished goods from the machines → warehouse, materials from the warehouse → machines
function farmJob(w) {
  let best = null;
  const consider = (k, job) => { if (!best || k > best.k) best = { k, job }; };
  const busy = (x) => workers.some((o) => o !== w && o.job && (o.job.dst === x || o.job.src === x));
  // whatever the warehouse is short of comes first; goods it already has plenty of wait
  const stock = (it) => state.store[it] || 0, full = (it) => stock(it) >= storeCap() * 0.3, short = (it) => (stock(it) < 25 ? 12 : 0) - Math.min(15, stock(it) * 0.06);
  if (storeRoom() > 2) {
    for (const s of listOf('crop')) {
      // share of the field that is ripe (a field with fewer plants is not left behind)
      const r = s.plants.filter((q) => q.ripe && !q.res).length; if (!r || full(s.def.out)) continue;
      const all = s.plants.filter((q) => q.active).length || 1;
      consider(10 * r / all + short(s.def.out) + Math.random() * 4 - (busy(s) ? 4 : 0), { src: s, dst: nearestStore(V3(s.def.pos[0], 0, s.def.pos[1])), item: s.def.out, phase: 'get' });
    }
    for (const m of listOf('machine')) if (m.outN >= 3 && !full(m.def.out)) consider(m.outN * 0.5 + (m.outN >= m.outMax - 1 ? 4 : 0) + short(m.def.out) + Math.random() - (busy(m) ? 12 : 0), { src: m, dst: nearestStore(m.outPt), item: m.def.out, phase: 'get' });
  }
  for (const m of listOf('machine')) {
    if (stock(m.def.out) >= 150) continue; // enough of it waiting in the warehouse
    // keep some for the shelves: a machine only gets what is left above a small reserve
    const reserve = listOf('shelf').some((q) => q.item === m.def.in) ? 8 : 0;
    const space = m.inMax - m.inN - (m.pend || 0), have = stock(m.def.in) - reserve;
    if (space < 3 || have < 3) continue;
    const taken = workers.some((o) => o !== w && o.job && o.job.dst === m);
    consider(space * 0.4 + (m.inN === 0 ? 5 : 0) + short(m.def.out) + Math.random() - (taken ? 12 : 0), { src: nearestStore(m.inPt), dst: m, item: m.def.in, phase: 'get', max: Math.min(space, have) });
  }
  return best ? best.job : null;
}
function pickJobDirect(w) {
  const want = (it) => customers.filter((c) => c.st === 'shop' && c.item === it).length;
  let best = null;
  const cap = upVal('shelfCap');
  const only = w.only;
  for (const s of listOf('shelf')) {
    if (only && !only.includes(s.item)) continue;
    const space = cap - s.n - (s.pend || 0); if (space < 2) continue;
    const src = sourceFor(s.item, w); if (!src) continue;
    const taken = workers.some((o) => o !== w && o.job && o.job.dst === s);
    const k = want(s.item) * 8 + space + Math.random() * 2 - (taken ? 12 : 0);
    if (!best || k > best.k) best = { k, dst: s, src, item: s.item };
  }
  for (const m of listOf('machine')) {
    if (only && !only.includes(m.def.out) && !only.includes(m.def.in)) continue;
    const space = m.inMax - m.inN - (m.pend || 0); if (space < 3) continue;
    const src = sourceFor(m.def.in, w, true); if (!src) continue;
    const taken = workers.some((o) => o !== w && o.job && o.job.dst === m);
    const k = space * 0.9 + (m.inN === 0 ? 5 : 0) + Math.random() * 2 - (taken ? 12 : 0);
    if (!best || k > best.k) best = { k, dst: m, src, item: m.def.in };
  }
  return best ? { dst: best.dst, src: best.src, item: best.item, phase: 'get' } : null;
}
function depositTo(c, dst, item, dt) {
  c.xfer -= dt;
  if (c.xfer > 0 || count(c, item) <= 0) return;
  if (dst.kind === 'store') {
    if (storeRoom() <= 0) return;
    c.xfer = 0.06; dst.pend = (dst.pend || 0) + 1;
    giveFrom(c, item, (o) => o.set(dst.def.pos[0], 0.8, dst.def.pos[1] + 1.6), () => { dst.pend--; state.store[item] = (state.store[item] || 0) + 1; });
  } else if (dst.kind === 'shelf') {
    if (dst.n + (dst.pend || 0) >= upVal('shelfCap')) return;
    c.xfer = 0.1; dst.pend = (dst.pend || 0) + 1;
    giveFrom(c, item, (o) => o.set(dst.def.pos[0], 0.9, dst.def.pos[1]), () => { dst.pend--; dst.n++; stackBump(dst.stack, dst.n - 1); });
  } else {
    if (dst.inN + (dst.pend || 0) >= dst.inMax) return;
    c.xfer = 0.1; dst.pend = (dst.pend || 0) + 1;
    giveFrom(c, item, (o) => o.copy(dst.inPt).setY(0.4), () => { dst.pend--; dst.inN = Math.min(dst.inMax, dst.inN + 1); });
  }
  if (c === player) sfx('drop');
}
function dstPoint(dst) { return dst.kind === 'shelf' ? dst.front : dst.kind === 'store' ? dst.depPt : V3(dst.inPt.x, 0, dst.inPt.z + 0.9); }
function updateWorker(w, dt) {
  const sp = upVal('wspeed') * (isFarmRole(w.role) ? FARM_SP[mFarm()] : 1);
  w.moving = 0;
  if (w.role === 'cashier') {
    const c = COUNTERS[w.counter];
    if (go(w, c.serve.x, c.serve.z, dt, sp)) w.face = 0;
    return;
  }
  // stuck with a full load nobody can take: walk to the trash bin, empty it, carry on
  stuckCheck(w, dt);
  if (w.job && w.job.phase === 'trash') { trashRun(w, dt, sp); return; }
  if (w.role === 'manager') { idleWander(w, dt, w.home[0], w.home[1]); return; }
  if (w.role === 'orderer' && orderWork(w, dt, sp)) return;
  const holdsGoods = w.carry.some((it) => it.type !== 'hay');
  if (w.role === 'keeper' && !(holdsGoods && (!w.job || typeof w.job !== 'object'))) {
    // 飼養員: feeds the animals; with upgrades also carries eggs (and milk) to the shop
    const L = 2; // every animal, eggs and milk to the shelves
    if (!w.job || typeof w.job !== 'object') {
      // feeding comes first; one 飼養員 at a time leaves to carry a nearly full nest to the warehouse
      const prods = listOf('producer'), hungry = prods.some((q) => q.inN + (q.pend || 0) < q.inMax * 0.35);
      const keepers = workers.filter((o) => o.role === 'keeper'), fullNest = prods.some((q) => q.outN >= q.outMax * 0.8);
      const hauling = keepers.filter((o) => o !== w && o.job && typeof o.job === 'object').length;
      const mayHaul = !hungry || (fullNest && hauling < Math.ceil(keepers.length / 2)), troughRoom = prods.some((q) => q.inN + (q.pend || 0) < q.inMax);
      if (L >= 1 && mayHaul && room(w) >= 2 && !w.incoming && w.job !== 'deliver' && (!count(w, 'hay') || !troughRoom)) { const kj = keeperJob(w, L); if (kj) w.job = kj; }
      if (!w.job || typeof w.job !== 'object') { feedAnimals(w, dt, sp, (st) => st.def.in === 'hay'); return; }
    }
  }
  // shelver: fetch a full load from a source, then deliver it to a shelf or a machine
  if (!w.job) {
    if (w.carry.length && !w.incoming) {
      const type = w.carry[w.carry.length - 1].type;
      const dst = (useStore() && storeRoom() > 0 && w.role !== 'shelver' && type !== 'hay' ? nearestStore(w.p.root.position) : null)
        || listOf('shelf').find((s) => s.item === type && s.n + (s.pend || 0) < upVal('shelfCap'))
        || listOf('machine').find((m) => m.def.in === type && m.inN + (m.pend || 0) < m.inMax)
        || (storeRoom() > 0 ? nearestStore(w.p.root.position) : null);
      if (dst) w.job = { dst, item: type, phase: 'put' };
      else { w.job = { phase: 'trash' }; return; }
    } else if (!w.incoming) w.job = pickJob(w);
    if (!w.job) { idleWander(w, dt, w.home ? w.home[0] : -1, w.home ? w.home[1] : -4); return; }
  }
  const j = w.job;
  if (j.phase === 'get') {
    const src = j.src;
    if (room(w) <= 0 || (j.max && count(w, j.item) + w.incoming >= j.max)) { j.phase = 'put'; return; }
    if (src.kind === 'crop') {
      let pl = j.plant;
      if (!pl || !pl.ripe || (pl.res && pl.res !== w)) { pl = src.plants.find((q) => q.ripe && (!q.res || q.res === w)); j.plant = pl; if (pl) pl.res = w; }
      if (!pl) { j.phase = count(w, j.item) ? 'put' : 'done'; return; }
      if (go(w, pl.x, pl.z + 0.7, dt, sp)) { pickPlant(src, pl, w); j.plant = null; }
    } else {
      if (go(w, src.outPt.x + 0.3, src.outPt.z + 0.9, dt, sp) || dist2(w.p.root.position, src.outPt.x, src.outPt.z) < 1.3) {
        w.xfer -= dt;
        if (w.xfer <= 0 && srcCount(src, j.item) > 0 && room(w) > 0) { w.xfer = 0.1; srcTake(src, j.item); takeInto(w, j.item, V3(src.outPt.x, 0.4, src.outPt.z)); }
        if ((srcCount(src, j.item) <= 0 || room(w) <= 0) && !w.incoming) j.phase = count(w, j.item) ? 'put' : 'done';
      }
    }
  } else if (j.phase === 'put') {
    if (w.incoming) return;
    const p = dstPoint(j.dst);
    if (go(w, p.x + 0.4, p.z, dt, sp) || dist2(w.p.root.position, p.x, p.z) < 1.1) {
      depositTo(w, j.dst, j.item, dt);
      const full = j.dst.kind === 'shelf' ? j.dst.n + (j.dst.pend || 0) >= upVal('shelfCap') : j.dst.kind === 'store' ? storeTotal() >= storeCap() : j.dst.inN + (j.dst.pend || 0) >= j.dst.inMax;
      if (count(w, j.item) === 0 || full) j.phase = 'done';
    }
  }
  if (j.phase === 'done') { if (j.plant && j.plant.res === w) j.plant.res = null; w.job = null; }
}

function stuckCheck(w, dt) {
  const q = w.p.root.position, moved = w.lastX === undefined || Math.abs(q.x - w.lastX) + Math.abs(q.z - w.lastZ) > 0.01;
  w.lastX = q.x; w.lastZ = q.z;
  if (moved) w.stuckT = 0;
  // a 訂單專員 on the long walk to the truck / helicopter is not stuck
  if (w.role === 'orderer' && w.job && w.job.ord) { w.stuckT = 0; return; }
  const n = w.carry.length;
  if (n !== w.lastN || !n || w.incoming) { w.lastN = n; w.stuckT = 0; return; }
  w.stuckT += dt;
  if (w.stuckT > 14 && !(w.job && w.job.phase === 'trash')) {
    if (w.job && w.job.plant && w.job.plant.res === w) w.job.plant.res = null;
    if (w.target && w.target.res === w) { w.target.res = null; w.target = null; }
    w.job = { phase: 'trash' }; w.stuckT = 0;
  }
}
function trashRun(w, dt, sp) {
  const p = w.p.root.position;
  if (go(w, bin.px + 0.5, bin.pz + 0.2, dt, sp) || dist2(p, bin.px, bin.pz) < 0.9) {
    w.xfer -= dt;
    if (w.xfer > 0) return;
    if (!w.carry.length) { w.job = null; w.lastN = 0; bin.t = 0; return; }
    w.xfer = 0.07; bin.t = 0.3;
    const it = w.carry.pop(), from = new THREE.Vector3(); it.m.getWorldPosition(from);
    w.p.back.remove(it.m); restack(w);
    fly(it.type, from, (o) => o.set(bin.x, 0.95, bin.z), 0.25, () => {});
  }
}
function feedAnimals(w, dt, sp, ok) {
  const prods = listOf('producer').filter((s) => ok(s) && s.inN + (s.pend || 0) < s.inMax);
  const hay = count(w, 'hay');
  // only cut as much grass as the troughs can still take
  const need = prods.reduce((a, s) => a + s.inMax - s.inN - (s.pend || 0), 0);
  if (hay > 0 && (room(w) <= 0 || hay + w.incoming >= need || !tufts.some((t) => t.grown && !t.res) || w.job === 'deliver')) {
    w.job = 'deliver';
    // emptiest trough first, but a far one has to be quite a bit emptier (so the south pens get fed too)
    const wp = w.p.root.position, score = (q) => q.inN + dist2(wp, q.inPt.x, q.inPt.z) * 0.25;
    if (!w.feedDst || !prods.includes(w.feedDst)) w.feedDst = prods.sort((a, b) => score(a) - score(b))[0];
    const s = w.feedDst;
    if (!s) { w.job = null; idleWander(w, dt, -4.5, 3.6); return; }
    if (go(w, s.inPt.x - 0.6, s.inPt.z + 0.9, dt, sp) || dist2(w.p.root.position, s.inPt.x, s.inPt.z) < 1.3) depositTo(w, s, 'hay', dt);
    if (count(w, 'hay') === 0 && !w.incoming) { w.job = null; w.feedDst = null; }
  } else if (prods.length && room(w) > 0) {
    if (!w.target || !w.target.grown || w.target.res !== w) {
      if (w.target && w.target.res === w) w.target.res = null;
      let best = null, bd = 1e9;
      for (const t of tufts) if (t.grown && !t.res) { const d = dist2(w.p.root.position, t.x, t.z); if (d < bd) { bd = d; best = t; } }
      w.target = best; if (best) best.res = w;
    }
    const t = w.target;
    if (t && go(w, t.x, t.z + 0.3, dt, sp)) { cutTuft(t, w); w.target = null; }
    if (!t && hay > 0) w.job = 'deliver';
  } else idleWander(w, dt, -1.5, 4.5);
}
// ---------- 訂單專員: only the big orders (特別客人, 貨車, 直升機) — fetch what is still missing and hand it over ----------
const ORD_HOME = [11.2, -4.6];
function activeOrders() {
  const r = [], c = vip.c;
  if (c && c.st === 'wait') r.push({ h: c, t: c.patience, at: [VIP.x - 0.2, VIP.z + 1.3], r: 1.9, cx: VIP.x, cz: VIP.z, drop: (o) => { o.copy(c.p.root.position); o.y = 1.3; } });
  if (truck.st === 'wait') r.push({ h: truck, t: truck.t, at: DOCK.drop, r: 1.6, cx: DOCK.drop[0], cz: DOCK.drop[1], drop: (o) => { truck.bed.getWorldPosition(o); o.y += 0.2; } });
  if (heli.st === 'wait') r.push({ h: heli, t: heli.t, at: HELI.drop, r: 1.7, cx: HELI.drop[0], cz: HELI.drop[1], drop: (o) => o.set(HELI.x, 1.2, HELI.z) });
  return r.sort((a, b) => a.t - b.t);
}
// 訂單專員 only take from the warehouses
function orderSource(item, w) { return (state.store[item] || 0) > 0 ? nearestStore(w.p.root.position) : null; }
function orderJob(w, orders) {
  for (const o of orders) for (const k in o.h.order) {
    const busy = workers.reduce((a, q) => a + (q !== w && q.job && q.job.ord && q.job.ord.h === o.h && q.job.item === k ? q.job.n : 0), 0);
    const left = o.h.order[k] - busy; if (left <= 0) continue;
    const src = orderSource(k, w); if (!src) continue;
    return { ord: o, item: k, src, n: Math.min(left, w.cap()), phase: 'get' };
  }
  return null;
}
// returns false when the usual worker code should run (putting leftovers away after an order left)
function orderWork(w, dt, sp) {
  if (w.job && !w.job.ord) return false;
  const orders = activeOrders();
  let j = w.job;
  if (j) {
    const o = orders.find((q) => q.h === j.ord.h);
    if (!o) { if (j.plant && j.plant.res === w) j.plant.res = null; w.job = j = null; } else j.ord = o;
  }
  if (!j) {
    if (w.carry.length) return !!w.incoming;
    j = w.job = orderJob(w, orders);
    if (!j) { idleWander(w, dt, ORD_HOME[0], ORD_HOME[1]); return true; }
  }
  const h = j.ord.h, it = j.item;
  if (j.phase === 'get') {
    const have = count(w, it) + w.incoming;
    if (have >= j.n || room(w) <= 0 || h.order[it] - have <= 0) { j.phase = have ? 'give' : 'done'; }
    else if (j.src && j.src.kind === 'crop') {
      const src = j.src;
      let pl = j.plant;
      if (!pl || !pl.ripe || (pl.res && pl.res !== w)) { pl = src.plants.find((q) => q.ripe && (!q.res || q.res === w)); j.plant = pl; if (pl) pl.res = w; }
      if (!pl) j.src = null;
      else if (go(w, pl.x, pl.z + 0.7, dt, sp)) { pickPlant(src, pl, w); j.plant = null; }
    } else if (j.src) {
      const src = j.src, shelf = src.kind === 'shelf', pt = shelf ? src.front : src.outPt;
      const avail = shelf ? src.n : srcCount(src, it);
      if (avail <= 0) j.src = null;
      else if (go(w, pt.x + 0.3, pt.z + (shelf ? 0 : 0.9), dt, sp) || dist2(w.p.root.position, pt.x, pt.z) < 1.3) {
        w.xfer -= dt;
        if (w.xfer <= 0) { w.xfer = 0.1; if (shelf) src.n--; else srcTake(src, it); takeInto(w, it, V3(pt.x, 0.5, pt.z)); }
      }
    }
    if (j.phase === 'get' && !j.src && !w.incoming) { j.src = orderSource(it, w); if (!j.src) j.phase = count(w, it) ? 'give' : 'done'; }
  } else if (j.phase === 'give') {
    if (w.incoming) return true;
    const o = j.ord;
    if (go(w, o.at[0], o.at[1], dt, sp) || dist2(w.p.root.position, o.cx, o.cz) < o.r) {
      w.xfer -= dt;
      if (w.xfer <= 0) {
        if (h.order[it] > 0 && count(w, it) > 0) { h.order[it]--; w.xfer = 0.08; giveFrom(w, it, o.drop, null); }
        else j.phase = 'done';
      }
    }
  }
  if (j.phase === 'done') { if (j.plant && j.plant.res === w) j.plant.res = null; w.job = null; }
  return true;
}
function spawnManager(k, quiet) {
  const shop = k === 'mgrShop', home = shop ? [-3.4, -13.0] : [-2.5, 4.2];
  const w = makeWorker('manager', home, shop ? 0 : 1, !quiet);
  w.home = home;
}
// eggs and milk go to their shelves; 羊毛 (no shelf) goes into the 毛線機
function keeperJob(w, L) {
  // only go for a decent load (the south pens are a long walk from the shop), fullest nest first
  const min = Math.max(3, Math.round(Math.min(w.cap(), 30) * 0.6));
  for (const s of listOf('producer').sort((a, b) => b.outN - a.outN)) {
    if (s.outN < Math.min(min, s.outMax - 2)) continue;
    const it = s.def.out;
    if (useStore() && storeRoom() > 2 && (state.store[it] || 0) < storeCap() * 0.3) return { dst: nearestStore(s.outPt), src: s, item: it, phase: 'get' };
    if (useStore() && storeRoom() > 2) continue; // plenty of it in the warehouse already: the nest can wait (a full warehouse: straight to the shelves)
    const shelf = listOf('shelf').find((q) => q.item === it && upVal('shelfCap') - q.n - (q.pend || 0) >= 2);
    const mach = shelf ? null : listOf('machine').find((m) => m.def.in === it && m.inMax - m.inN - (m.pend || 0) >= 3);
    const dst = shelf || mach || (L >= 3 && storeRoom() > 0 ? nearestStore(w.p.root.position) : null);
    if (dst) return { dst, src: s, item: it, phase: 'get' };
  }
  return null;
}

// ---------- harvesting helpers ----------
function cutTuft(t, c) {
  if (!t.grown || room(c) <= 0) return false;
  t.grown = false; t.t = 0; t.res = null; t.tall.visible = false;
  puff(t.x, 0.4, t.z, '#e8dc6b', 4, 0.6);
  takeInto(c, 'hay', V3(t.x, 0.5, t.z));
  if (room(c) > 0) takeInto(c, 'hay', V3(t.x, 0.6, t.z)); // every tuft gives two bundles
  if (c === player) sfx('pop');
  return true;
}
function pickPlant(s, pl, c) {
  if (!pl.ripe || room(c) <= 0) { pl.res = null; return; }
  pl.ripe = false; pl.t = 0; pl.res = null; pl.fruit.visible = false;
  takeInto(c, s.def.out, V3(pl.x, s.def.plant === 'apple' ? 1.4 : 0.8, pl.z));
  if (room(c) > 0) takeInto(c, s.def.out, V3(pl.x, s.def.plant === 'apple' ? 1.5 : 0.9, pl.z)); // a double harvest from every plant
  if (c === player) sfx('pop');
}

// ---------- customers ----------
const customers = [];
// the hall line behind the counters (z -12.2) is reached through a door: A comes in east of counter 1
const inShop = (x, z) => z < -7.3 && x > -21 && x < 7.9;
const CUST_COLS = ['#ff9f43', '#5ec8ff', '#ffd34a', '#ff7eb6', '#9fd86b', '#c69bff', '#ff8a6b', '#6fe3c8'];
// past the last spot the queue bunches up at its tail (never towards a door)
const queueAt = (ci, i) => { const k = COUNTERS[ci], j = Math.min(i, k.qs.length - 1), o = i - j; return [k.qs[j] + k.dir * Math.min(o, 3) * 0.18, QZ - (o % 2) * 0.22]; };
// outside → door → behind the counters
function doorIn(d) {
  const inner = d === DOORS[0] ? [6.9, -12.2] : [d.x, -12.2];
  return d === DOORS[0] ? [[d.x, -6.0], [d.x, -8.4], inner] : [[5.0, OUT_Z], [d.x, OUT_Z], [d.x, -6.0], [d.x, -8.4], inner];
}
// from just inside the front wall → out of the door → back to the road
function doorOut(d, px) {
  const out = [[px, LEAVE_Z], [d.x, LEAVE_Z], [d.x, -6.0]];
  if (d !== DOORS[0]) out.push([d.x, OUT_Z], [5.0, OUT_Z]);
  out.push(ENTRY);
  return out;
}
const exitDoor = (ci) => { for (const k of COUNTERS[ci].exits) if (DOORS[k].on()) return DOORS[k]; return DOORS[0]; };
let spawnT = 3;
function customerLook(isVip) {
  if (isVip) return { body: '#ffcf3a', hat: 'crown' };
  return { body: pick(CUST_COLS), hat: Math.random() < 0.3 ? 'cap' : (Math.random() < 0.3 ? 'bun' : null), hatColor: pick(CUST_COLS) };
}
function spawnCustomer(from) {
  const shelves = listOf('shelf');
  if (!shelves.length) return null;
  const kinds = [...new Set(shelves.map((q) => q.item))];
  // ~55% pick up 2–3 things, ~30% 8–12, ~15% fill a trolley with 18–28, spread over their list
  const r = Math.random();
  let total = r < 0.55 ? 2 + Math.floor(Math.random() * 2) : r < 0.85 ? 8 + Math.floor(Math.random() * 5) : 18 + Math.floor(Math.random() * 11);
  total = Math.round(total * upVal('buyMore'));
  const nK = Math.max(1, Math.min(kinds.length, total <= 3 ? 1 + Math.floor(Math.random() * 2) : total <= 12 ? 2 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 2)));
  const items = kinds.sort(() => Math.random() - 0.5).slice(0, nK);
  const needs = items.map(() => 1); for (let k = nK; k < total; k++) needs[Math.floor(Math.random() * nK)]++;
  const list = items.map((it, k) => ({ item: it, shelf: pick(shelves.filter((q) => q.item === it)), need: needs[k], got: 0 }));
  // visit the shelves in a sensible order: front row first, back row last
  list.sort((a, b) => b.shelf.front.z - a.shelf.front.z || a.shelf.front.x - b.shelf.front.x);
  const sh = list[0].shelf;
  const p = K.person(customerLook(false));
  const start = from || [ENTRY[0], ENTRY[1] + 4];
  p.root.position.set(start[0], 0, start[1]); scene.add(p.root);
  const path = from ? [[from[0], -10], [14.2, -10], ENTRY] : [ENTRY];
  const L = laneOf(sh), door = nearestDoor(sh.front.x);
  path.push(...doorIn(door));
  // back rows: down the side aisle to their walkway; the front-middle shelves: round the counters
  const hx = path[path.length - 1][0];
  if (L && L !== LANE1) { const ax = aisleBetween(hx, sh.front.x); path.push([ax, -12.2], [ax, L]); }
  else if (!L) { const ex = sh.def.pos[0] + 1.7; path.push([ex, -12.2], [ex, -9.0]); }
  path.push(shelfSpot(sh));
  const c = { p, list, li: 0, shelf: sh, item: sh.item, need: list[0].need, got: 0, st: 'in', path, t: 0, face: 0, moving: 0, ci: 0, qi: 99, big: total >= 8 };
  c.label = label('bubble', '', (o) => { o.copy(c.p.root.position); o.y = 2.05; });
  customers.push(c);
  return c;
}
// walkways between the shelf rows (east wall, the wide gap in the middle, west wall)
function aisleFor(x) { let best = 6.6; for (const a of [6.6, -6.6, -19.6]) if (Math.abs(a - x) < Math.abs(best - x)) best = a; return best; }
// the aisle that makes the shortest trip from x1 to x2
function aisleBetween(x1, x2) { let best = 6.6, bd = 1e9; for (const a of [6.6, -6.6, -19.6]) { const d = Math.abs(a - x1) + Math.abs(a - x2); if (d < bd) { bd = d; best = a; } } return best; }
// walkways: the front hall (z -12.2), the middle walkway of the 百貨公司 (between row 1 and the new back-to-back row)
// and the back walkway (between the new 2nd copies and row 2). 0 = the shelves in the front-middle of the shop
const LANE1 = -12.2, LANE1B = -18.6, LANE2 = -21.8, LANE3 = -29.8;
function laneOf(s) { const z = s.def.pos[1]; return z > -12 ? 0 : z > -15.2 && !s.def.flip ? LANE1 : z > -18 ? LANE1B : z > -26 ? LANE2 : LANE3; }
const shelfSpot = (s) => [s.front.x + rand(-0.75, 0.75), s.front.z + s.dir * rand(0.2, 1.1)];
function routeToShelf(fx, fz, from, to) {
  const tgt = shelfSpot(to);
  const a = laneOf(from), b = laneOf(to);
  if (a === b && a !== 0) return [tgt];
  const out = [];
  let x = fx;
  if (a === 0) { x = from.def.pos[0] + 1.7; out.push([x, fz], [x, LANE1]); } else out.push([fx, a]);
  const la = a || LANE1, lb = b || LANE1, ex = to.def.pos[0] + 1.7;
  if (la !== lb) { const ax = aisleBetween(x, b ? tgt[0] : ex); out.push([ax, la], [ax, lb]); }
  if (b === 0) out.push([ex, LANE1], [ex, -9.0]);
  out.push(tgt);
  return out;
}
function shopBasket() {
  const g = new THREE.Group(); g.position.set(0.2, -0.25, 0.05);
  K.add(g, K.mesh(G.rbox(0.36, 0.2, 0.26, 0.05), '#ff5a4e'), 0, 0, 0);
  K.add(g, K.mesh(G.rbox(0.3, 0.02, 0.2, 0.01), '#c9322a', false), 0, 0.1, 0);
  const h = K.add(g, K.mesh(G.rbox(0.04, 0.2, 0.04, 0.02), '#d94136'), 0, 0.17, 0); h.rotation.z = 0.2;
  return g;
}
function shopCart() {
  const g = new THREE.Group(); g.position.set(0, -0.62, 0.42);
  K.add(g, K.mesh(G.rbox(0.5, 0.32, 0.6, 0.05), '#cfd6de'), 0, 0.42, 0.12);
  K.add(g, K.mesh(G.rbox(0.42, 0.03, 0.52, 0.02), '#ff5a4e', false), 0, 0.59, 0.12);
  K.add(g, K.mesh(G.rbox(0.52, 0.05, 0.06, 0.02), '#ff5a4e'), 0, 0.72, -0.2);
  for (const x of [-0.2, 0.2]) { K.add(g, K.mesh(G.rbox(0.04, 0.32, 0.04, 0.02), '#9aa3ad'), x, 0.56, -0.2); for (const z of [-0.12, 0.36]) K.add(g, K.mesh(G.cyl(0.07, 0.07, 0.05, 10), '#4a4f58'), x, 0.08, z).rotation.z = Math.PI / 2; }
  K.add(g, K.mesh(G.rbox(0.44, 0.04, 0.5, 0.02), '#9aa3ad'), 0, 0.2, 0.12);
  return g;
}
function stepPath(c, dt, speed) {
  if (!c.path.length) return true;
  const [tx, tz] = c.path[0];
  const dx = tx - c.p.root.position.x, dz = tz - c.p.root.position.z, d = Math.hypot(dx, dz);
  if (d < 0.1) { c.path.shift(); return !c.path.length; }
  const s = Math.min(d, speed * dt); c.p.root.position.x += dx / d * s; c.p.root.position.z += dz / d * s; c.face = Math.atan2(dx, dz); c.moving = 1;
  return false;
}
function queueLen(ci) { return customers.filter((c) => c.ci === ci && (c.st === 'queue' || c.st === 'toQueue')).length; }
function updateCustomers(dt) {
  const shelfN = COUNTERS[0].on ? listOf('shelf').length : 0;
  if (shelfN) {
    spawnT -= dt * upVal('cust') * shopCustMul() * (events.market > 0 ? 2 : 1) * (park.ready ? 1.5 : 1);
    // never more than 30 shoppers at once (cars on their way count too)
    const maxC = Math.min(30, 3 + Math.round(shelfN * 1.5) + (park.ready ? 4 : 0));
    if (spawnT <= 0 && customers.length + park.cars.filter((k) => k.st === 'come').length < maxC) {
      if (park.ready && Math.random() < 0.5) parkCar(); else spawnCustomer();
      spawnT = Math.max(1.6, 7 - shelfN * 0.7) * (0.7 + Math.random() * 0.6);
    }
  }
  const served = COUNTERS.map((c, i) => c.on && (kioskOn() || workers.some((w) => w.role === 'cashier' && w.counter === i && dist2(w.p.root.position, c.serve.x, c.serve.z) < 0.6) || dist2(player.p.root.position, c.serve.x, c.serve.z) < 1.3));
  for (let ci = 0; ci < COUNTERS.length; ci++) {
    customers.filter((c) => c.ci === ci && (c.st === 'queue' || c.st === 'toQueue')).sort((a, b) => a.qi - b.qi).forEach((c, i) => { c.qi = i; });
  }
  for (let i = customers.length - 1; i >= 0; i--) {
    const c = customers[i];
    c.moving = 0;
    // 購物籃架: customers take a basket (Lv1) or a cart (Lv2) once inside the door and leave it there on the way out
    const cz = c.p.root.position.z;
    if (state.up.basket && !c.cart && c.st !== 'leave' && cz < -8.0) { c.cart = state.up.basket >= 2 || c.big ? shopCart() : shopBasket(); c.p.front.add(c.cart); }
    if (c.cart && c.st === 'leave' && cz > -8.3) { c.p.front.remove(c.cart); c.cart = null; }
    const cs = 2.6 * (c.cart ? upVal('basket') : 1);
    if (c.st === 'in') { if (stepPath(c, dt, cs)) { c.st = 'shop'; c.face = c.shelf.dir < 0 ? 0 : Math.PI; c.t = 0.4; c.patience = 32 + MGR_PAT[mShop()] + c.need * 1.5; } }
    else if (c.st === 'shop') {
      c.t -= dt; c.patience -= dt;
      if (c.t <= 0 && c.shelf.n > 0 && c.got < c.need) {
        c.t = 0.35 / upVal('basket'); c.shelf.n--; c.got++;
        fly(c.item, V3(c.shelf.def.pos[0], 0.8, c.shelf.def.pos[1]), (o) => { o.copy(c.p.root.position); o.y = 1.2; }, 0.25, null);
      }
      if (c.patience <= 0 && c.got < c.need) {
        const any = c.got > 0 || c.list.some((e, i) => i < c.li && e.got > 0);
        if (c.got > 0 || c.li < c.list.length - 1 || any) c.need = c.got;
        else { leaveShop(c); floatText('😞', V3(c.p.root.position.x, 2.2, c.p.root.position.z)); }
      }
      if (c.st === 'shop' && c.got >= c.need && c.li < c.list.length - 1) {
        // next item on the list
        const e = c.list[c.li]; e.got = c.got; e.need = c.need;
        const prev = c.shelf, n = c.list[++c.li], pos = c.p.root.position;
        Object.assign(c, { shelf: n.shelf, item: n.item, need: n.need, got: 0, st: 'in' });
        c.path = routeToShelf(pos.x, pos.z, prev, n.shelf);
      }
      if (c.st === 'shop' && c.got >= c.need) {
        const e = c.list[c.li]; e.got = c.got; e.need = c.need;
        let ci = 0; for (let i = 1; i < COUNTERS.length; i++) if (COUNTERS[i].on && queueLen(i) < queueLen(ci)) ci = i;
        c.ci = ci;
        const side = COUNTERS[ci].side, pz = c.p.root.position.z;
        c.st = 'toQueue'; c.qi = 99;
        const L = laneOf(c.shelf), px = c.p.root.position.x;
        if (L && L !== LANE1) { const ax = aisleBetween(px, side); c.path = [[px, L], [ax, L], [ax, -12.1], [side, -12.1], [side, -8.5]]; }
        else c.path = L ? [[px, -12.1], [side, -12.1], [side, -8.5]] : [[side, pz], [side, -8.5]];
      }
    } else if (c.st === 'toQueue' || c.st === 'queue') {
      if (stepPath(c, dt, cs)) {
        const [qx, qz] = queueAt(c.ci, c.qi);
        const pos = c.p.root.position, dx = qx - pos.x, dz = qz - pos.z, d = Math.hypot(dx, dz);
        if (d > 0.08) { const s = Math.min(d, cs * dt); pos.x += dx / d * s; pos.z += dz / d * s; c.face = Math.atan2(dx, dz); c.moving = 1; }
        else { c.st = 'queue'; c.face = Math.PI; }
      }
      if (c.st === 'queue' && c.qi === 0) {
        c.t = (c.t > 0 ? c.t : 0) + (served[c.ci] ? dt : 0);
        if (c.t > payTime(c)) pay(c);
      }
    } else if (c.st === 'leave') {
      if (stepPath(c, dt, cs * 1.08)) { scene.remove(c.p.root); dropLabel(c.label); customers.splice(i, 1); if (c.car) c.car.waiting = false; continue; }
    }
    turn(c.p, c.face, dt); c.p.anim(dt, c.moving);
    if (c.st === 'shop' || c.st === 'in') setLabel(c.label, badge(c.item, c.got, c.need) + (c.list && c.li < c.list.length - 1 ? '<span class="rest">' + c.list.slice(c.li + 1).map((e) => ICON[e.item]).join('') + '</span>' : ''));
    else if (c.st !== 'leave') setLabel(c.label, ICON.money);
  }
}
// checkout: quick (0.5 s), a 店長 makes it quicker
function payTime(c) {
  return MGR_PAY[mShop()];
}
// x positions with no counter (or the apple shelf) between the shelves and the front of the shop
const LEAVE_GAPS = [6.6, 2.0, -3.5, -9.3, -14.0, -19.6];
function leaveShop(c) {
  c.st = 'leave'; c.label.show = false;
  const px = c.p.root.position.x, pz = c.p.root.position.z;
  // still back at the shelves (gave up waiting): come out to the front first
  const ln = pz < -26.4 ? LANE3 : pz < -20.2 ? LANE2 : pz < -16.4 ? LANE1B : 0, ax = aisleFor(px);
  const pre = ln ? [[px, ln], [ax, ln], [ax, -12.1]] : [];
  // behind the counters: cross to the front through a gap between them, never through a counter
  let gx = px;
  if (pz < -9.3) { const x0 = ln ? ax : px; gx = LEAVE_GAPS.reduce((b, g) => (Math.abs(g - x0) < Math.abs(b - x0) ? g : b), LEAVE_GAPS[0]); pre.push([ln ? ax : px, -12.1], [gx, -12.1]); }
  const door = c.paid ? exitDoor(c.ci) : nearestDoor(gx);
  c.path = [...pre, ...doorOut(door, gx)];
  if (c.home) c.path.push([14.2, -10], [c.home[0], -10], c.home); else c.path.push([ENTRY[0], ENTRY[1] + 14]);
}
function pay(c) {
  const goods = c.list ? c.list.reduce((a, e) => a + e.got * ITEMS[e.item].price, 0) : c.got * ITEMS[c.item].price;
  const v = Math.round(goods * upVal('price') * (1 + 0.05 * (state.up.look || 0)) * MGR_TIP[mShop()]) + (pets.cat ? 1 : 0);
  const k = COUNTERS[c.ci];
  if (kioskOn()) { addMoney(v); sfx('coin'); floatText('+' + v, V3(k.x + 0.55, 2.1, k.z), 'money'); if (k.kiosk) k.kiosk.flash = 0.4; }
  else { k.pile.value += v; setPile(k); sfx('coin'); floatText('+' + v, V3(k.pile.x, 1.6, k.pile.z), 'money'); }
  const bag = new THREE.Group(); K.add(bag, K.mesh(G.rbox(0.36, 0.38, 0.24, 0.06), '#f5d9a8'), 0, 0.1, 0); c.p.front.add(bag);
  c.paid = true; leaveShop(c);
}

// ---------- parking lot: cars bring customers ----------
const park = { ready: false, cars: [], slots: [] };
for (let i = 0; i < 5; i++) for (const z of [-13.6, -6.4]) park.slots.push({ x: 19.6 + i * 2, z, used: false });
const CAR_COLS = ['#5aa9ff', '#ff7a66', '#ffd34a', '#7fcf6a', '#b48cff', '#ffffff', '#ff9fc4'];
function parkCar() {
  const slot = park.slots.find((s) => !s.used);
  if (!slot) { spawnCustomer(); return; }
  slot.used = true;
  const g = P2.car(pick(CAR_COLS)); g.position.set(14.8, 0, -50); scene.add(g);
  park.cars.push({ g, slot, st: 'come', path: [[14.8, -10.5], [slot.x, -10.5], [slot.x, slot.z]], t: 0, waiting: false });
}
function updateCars(dt) {
  for (let i = park.cars.length - 1; i >= 0; i--) {
    const car = park.cars[i], g = car.g;
    if (car.path.length) {
      const [tx, tz] = car.path[0];
      const dx = tx - g.position.x, dz = tz - g.position.z, d = Math.hypot(dx, dz);
      if (d < 0.15) car.path.shift();
      else { const s = Math.min(d, 9 * dt); g.position.x += dx / d * s; g.position.z += dz / d * s; g.rotation.y = Math.atan2(dx, dz); }
    } else if (car.st === 'come') {
      car.st = 'parked'; car.waiting = true;
      const c = spawnCustomer([car.slot.x, car.slot.z]);
      if (c) { c.home = [car.slot.x, car.slot.z]; c.car = car; } else car.waiting = false;
    } else if (car.st === 'parked' && !car.waiting) {
      car.t += dt;
      if (car.t > 1.2) { car.st = 'go'; car.path = [[car.slot.x, -10.5], [16.2, -10.5], [16.2, 60]]; }
    } else if (car.st === 'go') { scene.remove(g); car.slot.used = false; park.cars.splice(i, 1); }
  }
}

// ---------- pets ----------
const pets = {};
function updatePets(dt, t) {
  if (pets.dog) {
    const d = pets.dog, pp = player.p.root.position, back = V3(pp.x - Math.sin(pFace) * 1.2 + 0.6, 0, pp.z - Math.cos(pFace) * 1.2);
    // stay behind the player, but never inside a wall: fall back to the player's own spot, then walk the path grid
    if (!nav.free(back.x, back.z)) back.set(pp.x, 0, pp.z);
    const dd = Math.hypot(back.x - d.g.position.x, back.z - d.g.position.z);
    let mv = 0;
    if (dd > 0.3) {
      const w = d.walker || (d.walker = { p: { root: d.g }, face: 0, moving: 0 });
      const sx = Math.round(back.x * 2) / 2, sz = Math.round(back.z * 2) / 2;
      const before = d.g.position.clone();
      go(w, sx, sz, dt, dd > 3 ? 10 : 6);
      mv = before.distanceTo(d.g.position);
      if (mv > 0.001) d.g.rotation.y = w.face;
    }
    d.ph += dt * (mv ? 14 : 4);
    d.b.position.y = mv ? Math.abs(Math.sin(d.ph)) * 0.08 : 0;
    d.tail.rotation.z = Math.sin(t * 12) * 0.5;
  }
  if (pets.cat) { pets.cat.tail.rotation.z = Math.sin(t * 2.5) * 0.4; pets.cat.b.scale.y = 1 + Math.sin(t * 2) * 0.02; }
}

// ---------- special orders: VIP customers, truck, helicopter (only the player can hand these over) ----------
function sellables() { return listOf('shelf').map((s) => s.item); }
// big orders grow with the farm: a handful at first, hundreds late in the game (many trips, partial deliveries add up)
const orderScale = () => Math.max(1, Math.min(40, 1 + state.earned / 25000));
function makeOrder(types, lo, hi, scale = orderScale()) {
  const items = sellables(), order = {};
  for (let i = 0; i < types && items.length; i++) { const it = pick(items); order[it] = (order[it] || 0) + Math.round(rand(lo, hi) * scale); }
  return order;
}
function orderValue(order, mult) { let v = 0; for (const k in order) v += order[k] * ITEMS[k].price; return Math.round(v * upVal('price') * (1 + 0.05 * (state.up.look || 0)) * mult); }
// a new order on a VIP / truck / helicopter: what is still missing (order), the full list (need) and the reward
function startOrder(h, types, lo, hi, mult, bonus, scale) {
  h.order = makeOrder(types, lo, hi, scale); h.need = { ...h.order }; h.mult = mult;
  h.value = orderValue(h.need, mult) + bonus;
  return Object.values(h.need).reduce((a, b) => a + b, 0);
}
// 「雞蛋 120/500」 for every line of the order
function orderRows(h) { let r = ''; for (const k in h.need) r += '<div class="cost' + (h.order[k] <= 0 ? ' done' : '') + '">' + ICON[k] + ITEMS[k].name + ' ' + (h.need[k] - h.order[k]) + '/' + h.need[k] + '</div>'; return r; }
// time ran out: what was already handed over is still paid (at half the bonus rate)
function payPartial(h, at) {
  const got = {}; for (const k in h.need) got[k] = h.need[k] - h.order[k];
  const v = orderValue(got, h.mult * 0.5);
  if (v > 0) payBonus(v, at);
  return v;
}
function orderDone(order) { for (const k in order) if (order[k] > 0) return false; return true; }
function feedOrder(order, dropFn, dt, st) {
  st.xfer = (st.xfer || 0) - dt;
  if (st.xfer > 0) return;
  for (const k in order) if (order[k] > 0 && count(player, k) > 0) {
    order[k]--; st.xfer = 0.08; sfx('drop'); giveFrom(player, k, dropFn, null); return;
  }
}
function payBonus(v, at) {
  v = Math.round(v * upVal('bonus'));
  const k = COUNTERS[0]; if (kioskOn()) addMoney(v); else { k.pile.value += v; setPile(k); }
  floatText('+' + fmtMoney(v), at, 'money big'); sfx('vip');
}

const vip = { t: 70, c: null };
function updateVip(dt) {
  if (!isBuilt('market')) return;
  if (!vip.c) {
    vip.t -= dt;
    if (vip.t <= 0) {
      const p = K.person(customerLook(true)); p.root.position.set(ENTRY[0], 0, ENTRY[1] + 4); scene.add(p.root);
      const late = state.built.length > 26;
      vip.c = { p, st: 'in', path: [ENTRY, [VIP.x, VIP.z]], face: 0, moving: 0 };
      const n = startOrder(vip.c, late ? 3 : 2, late ? 5 : 3, late ? 9 : 6, 5, 40, Math.max(1, orderScale() / 2));
      vip.c.patience = 120 + n * 0.5;
      vip.c.label = label('zone order', '', (o) => o.set(VIP.x + 0.2, 0.2, VIP.z + 2.6));
      toast('⭐ 特別客人來了！' + (workers.some((q) => q.role === 'orderer') ? '訂單專員會幫忙送貨' : '要親手交貨'));
    }
    return;
  }
  const c = vip.c; c.moving = 0;
  if (c.st === 'in' && stepPath(c, dt, 2.6)) { c.st = 'wait'; c.face = -Math.PI / 2; }
  if (c.st === 'wait') {
    c.patience -= dt;
    setLabel(c.label, '<div class="zn">⭐ 特別客人 ' + Math.ceil(c.patience) + '秒</div>' + orderRows(c) + '<div class="rew">' + ICON.money + fmtMoney(c.value) + '</div>');
    if (dist2(player.p.root.position, VIP.x, VIP.z) < 1.9) feedOrder(c.order, (o) => { o.copy(c.p.root.position); o.y = 1.3; }, dt, c);
    if (orderDone(c.order)) { payBonus(c.value, V3(VIP.x, 2, VIP.z)); confetti(VIP.x, VIP.z); c.st = 'leave'; c.label.show = false; c.path = [ENTRY, [ENTRY[0], ENTRY[1] + 14]]; }
    else if (c.patience <= 0) { c.st = 'leave'; c.label.show = false; c.path = [ENTRY, [ENTRY[0], ENTRY[1] + 14]]; const v = payPartial(c, V3(VIP.x, 2, VIP.z)); toast(v ? '特別客人時間到，已交的貨照付 $' + fmtMoney(v) : '特別客人走了…'); }
  }
  if (c.st === 'leave' && stepPath(c, dt, 2.8)) { scene.remove(c.p.root); dropLabel(c.label); vip.c = null; vip.t = rand(70, 120); return; }
  turn(c.p, c.face, dt); c.p.anim(dt, c.moving);
}

const truck = { ready: false, st: 'away', t: 25, g: null };
const DOCK = { x: 14.6, z: 6, drop: [12.9, 6] };
function updateTruck(dt) {
  if (!truck.ready) return;
  if (!truck.g) {
    const tr = P.truck(); truck.g = tr.g; truck.bed = tr.bed; truck.g.position.set(DOCK.x, 0, -45); scene.add(truck.g); truck.g.visible = false;
    truck.label = label('zone order', '', (o) => o.set(DOCK.drop[0], 0.4, DOCK.drop[1] + 0.2)); truck.label.show = false;
  }
  truck.t -= dt;
  if (truck.st === 'away' && truck.t <= 0) {
    truck.total = startOrder(truck, 2, 4, 9, 3, 0);
    truck.st = 'come'; truck.g.visible = true; truck.g.position.z = -45;
  }
  if (truck.st === 'come') {
    truck.g.position.z += Math.min(DOCK.z - truck.g.position.z, 12 * dt);
    if (DOCK.z - truck.g.position.z < 0.05) { truck.st = 'wait'; truck.t = 90 + truck.total * 0.5; truck.label.show = true; toast('🚚 訂單卡車到了！可以分很多趟送'); }
  }
  if (truck.st === 'wait') {
    setLabel(truck.label, '<div class="zn">🚚 訂單 ' + Math.ceil(truck.t) + '秒</div>' + orderRows(truck) + '<div class="rew">' + ICON.money + fmtMoney(truck.value) + '</div>');
    if (dist2(player.p.root.position, DOCK.drop[0], DOCK.drop[1]) < 1.6) feedOrder(truck.order, (o) => { truck.bed.getWorldPosition(o); o.y += 0.2; }, dt, truck);
    if (orderDone(truck.order)) { payBonus(truck.value, V3(DOCK.drop[0], 1.6, DOCK.drop[1])); truck.st = 'leave'; truck.label.show = false; }
    else if (truck.t <= 0) { truck.st = 'leave'; truck.label.show = false; const v = payPartial(truck, V3(DOCK.drop[0], 1.6, DOCK.drop[1])); toast(v ? '卡車開走了，已裝的貨照付 $' + fmtMoney(v) : '卡車開走了…'); }
  }
  if (truck.st === 'leave') {
    truck.g.position.z += 12 * dt;
    if (truck.g.position.z > 50) { truck.st = 'away'; truck.t = rand(60, 100); truck.g.visible = false; }
  }
}

const HELI = { x: 23.5, z: 6, drop: [20.6, 6] };
const heli = { ready: false, st: 'away', t: 40, obj: null };
function updateHeli(dt) {
  if (!heli.ready) return;
  if (!heli.obj) {
    heli.obj = P2.heli(); heli.obj.g.position.set(HELI.x, 30, HELI.z); heli.obj.g.visible = false; scene.add(heli.obj.g);
    heli.label = label('zone order', '', (o) => o.set(HELI.drop[0], 0.4, HELI.drop[1])); heli.label.show = false;
  }
  const g = heli.obj.g;
  heli.t -= dt;
  if (heli.st !== 'away') heli.obj.rotor.rotation.y += dt * 25;
  if (heli.st === 'away' && heli.t <= 0) {
    heli.total = startOrder(heli, 3, 6, 14, 6, 300);
    heli.st = 'come'; g.visible = true; g.position.y = 30; toast('🚁 直升機訂單來了！');
  }
  if (heli.st === 'come') { g.position.y = Math.max(0, g.position.y - 8 * dt); if (g.position.y <= 0) { heli.st = 'wait'; heli.t = 150 + heli.total * 0.5; heli.label.show = true; } }
  if (heli.st === 'wait') {
    setLabel(heli.label, '<div class="zn">🚁 大訂單 ' + Math.ceil(heli.t) + '秒</div>' + orderRows(heli) + '<div class="rew">' + ICON.money + fmtMoney(heli.value) + '</div>');
    if (dist2(player.p.root.position, HELI.drop[0], HELI.drop[1]) < 1.7) feedOrder(heli.order, (o) => o.set(HELI.x, 1.2, HELI.z), dt, heli);
    if (orderDone(heli.order)) { payBonus(heli.value, V3(HELI.drop[0], 1.6, HELI.drop[1])); confetti(HELI.x, HELI.z); heli.st = 'leave'; heli.label.show = false; }
    else if (heli.t <= 0) { heli.st = 'leave'; heli.label.show = false; const v = payPartial(heli, V3(HELI.drop[0], 1.6, HELI.drop[1])); toast(v ? '直升機飛走了，已交的貨照付 $' + fmtMoney(v) : '直升機飛走了…'); }
  }
  if (heli.st === 'leave') { g.position.y += 8 * dt; if (g.position.y > 30) { heli.st = 'away'; heli.t = rand(150, 210); g.visible = false; } }
}

const events = { market: 0, rain: 0, next: 90 };
let rainObj = null;
function updateEvents(dt) {
  events.market = Math.max(0, events.market - dt);
  events.rain = Math.max(0, events.rain - dt);
  if (isBuilt('corn')) {
    events.next -= dt;
    if (events.next <= 0) {
      events.next = rand(100, 160);
      if (Math.random() < 0.5 && isBuilt('shelfCorn')) { events.market = 40; toast('🎪 市集日！客人變多了'); }
      else { events.rain = 30; toast('🌧️ 下雨了，作物長得更快'); }
    }
  }
  if (events.rain > 0 && !rainObj) {
    const n = 220, pos = new Float32Array(n * 6);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    rainObj = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55 }));
    rainObj.userData.d = Array.from({ length: n }, () => [Math.random() * 30 - 15, Math.random() * 14, Math.random() * 30 - 15]);
    scene.add(rainObj);
  }
  if (rainObj) {
    const pp = player.p.root.position, a = rainObj.geometry.attributes.position.array;
    rainObj.userData.d.forEach((d, i) => {
      d[1] -= dt * 18; if (d[1] < 0) d[1] += 14;
      a.set([pp.x + d[0], d[1], pp.z + d[2], pp.x + d[0] - 0.1, d[1] + 0.5, pp.z + d[2]], i * 6);
    });
    rainObj.geometry.attributes.position.needsUpdate = true;
    if (events.rain <= 0) { scene.remove(rainObj); rainObj = null; }
  }
}
let toastT = 0;
function toast(msg) { const el = $('toast'); el.textContent = msg; el.classList.add('on'); toastT = 2.6; }

// ---------- guide arrow ----------
function makeGuide() {
  const g = new THREE.Group();
  K.add(g, K.mesh(G.cone(0.48, 0.75, 12), '#ffd23f'), 0, 0, 0).rotation.x = Math.PI;
  K.add(g, K.mesh(G.cyl(0.2, 0.2, 0.6, 10), '#ffd23f'), 0, 0.62, 0);
  scene.add(g); g.visible = false;
  return g;
}
const guides = [makeGuide(), makeGuide()];
// beginner route: a line of glowing dots on the ground from the player to the next thing to build
const dotGeo = G.circle(0.17, 14);
const dotMat = new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.95, depthWrite: false });
const dots = [];
for (let i = 0; i < 80; i++) { const m = new THREE.Mesh(dotGeo, dotMat); m.renderOrder = 3; m.visible = false; scene.add(m); dots.push(m); }
let trailT = 0, trailPts = [];
function updateTrail(gts, dt) {
  trailT -= dt;
  if (trailT <= 0) {
    trailT = 0.25; trailPts = [];
    const pp = player.p.root.position;
    for (const t of gts) {
      const path = [[pp.x, pp.z]].concat(nav.path(pp.x, pp.z, t[0], t[1]));
      let d = 0.9;
      for (let k = 1; k < path.length; k++) {
        const [ax, az] = path[k - 1], [bx, bz] = path[k], seg = Math.hypot(bx - ax, bz - az);
        while (d < seg) { const x = ax + (bx - ax) * d / seg, z = az + (bz - az) * d / seg; if (Math.hypot(x - t[0], z - t[1]) > 1.1) trailPts.push([x, z]); d += 0.7; }
        d -= seg;
      }
    }
  }
  dots.forEach((m, i) => {
    const p = trailPts[i]; m.visible = !!p;
    if (p) { m.position.set(p[0], 0.07, p[1]); m.scale.setScalar(1 + 0.4 * Math.max(0, Math.sin(T * 7 - i * 0.55))); }
  });
}
// beginner checklist on the left
let questHtml = '', questDoneT = -1;
function updateQuest(dt) {
  const el = $('quest'); if (!el) return;
  const steps = questSteps(), all = steps.every((q) => q.ok);
  if (all && questDoneT < 0) { questDoneT = state.questSeen ? 0 : 4; state.questSeen = true; }
  if (all) { questDoneT -= dt; if (questDoneT <= 0) { el.classList.add('hidden'); return; } }
  el.classList.remove('hidden');
  const cur = steps.findIndex((q) => !q.ok);
  const html = '<b>新手任務</b>' + steps.map((q, i) => '<div class="q' + (q.ok ? ' ok' : '') + (i === cur ? ' now' : '') + '"><span>' + (q.ok ? '✓' : i + 1) + '</span>' + q.t + '</div>').join('') +
    (all ? '<div class="qdone">完成！可以自由活動了</div>' : '');
  if (html !== questHtml) { questHtml = html; el.innerHTML = html; }
}
const guide = guides[0];
const pickLabel = label('choice', '二選一', (o) => o.copy(guides[0].position).lerp(guides[1].position, 0.5).setY(1.2));
pickLabel.show = false;
const pointer = new THREE.Mesh(G.cone(0.42, 0.9, 3), new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.95 }));
pointer.rotation.x = -Math.PI / 2; const pointerG = new THREE.Group(); pointerG.add(pointer); pointer.position.set(0, 0.1, 1.7); scene.add(pointerG);
function nearest(list) {
  const pp = player.p.root.position; let best = null, bd = 1e9;
  for (const q of list) { const d = dist2(pp, q.x, q.z); if (d < bd) { bd = d; best = q; } }
  return best;
}
function affordable(z) {
  for (const k in z.def.cost) { const l = left(z, k); if (l <= 0) continue; if (k === 'money' ? state.money < l : count(player, k) < l) return false; }
  return true;
}
function guideTargets() {
  const zp = (id) => zones[id] ? [zones[id].x, zones[id].z] : null;
  const picked = isBuilt('tomato') || isBuilt('coop');
  if (!picked) return [zp('tomato'), zp('coop')].filter(Boolean);
  if (!isBuilt('counter')) return [zp('counter')].filter(Boolean);
  if (!isBuilt('shelfTomato') && !isBuilt('shelfEgg')) return [zp(isBuilt('tomato') ? 'shelfTomato' : 'shelfEgg')].filter(Boolean);
  return [];
}
// the three beginner steps shown in the checklist on the left
function questSteps() {
  return [
    { t: '二選一：番茄田或雞舍', ok: isBuilt('tomato') || isBuilt('coop') },
    { t: '蓋收銀台', ok: isBuilt('counter') },
    { t: '蓋貨架', ok: isBuilt('shelfTomato') || isBuilt('shelfEgg') },
  ];
}
function guideTarget() { return guideTargets()[0] || null; }

// ---------- UI ----------
let shownMoney = -1;
function updateMoney() { if (shownMoney !== state.money) { shownMoney = state.money; $('moneyN').textContent = fmtMoney(state.money); } }
function openPanel(kind) {
  const P0 = $('panel'), body = $('pBody');
  P0.classList.remove('hidden');
  $('pTabs').innerHTML = ''; body.innerHTML = '';
  if (kind === 'up') {
    $('pTitle').textContent = '升級';
    const tabs = ['角色', '員工', '農場', '商店'];
    const show = (ti) => {
      openPanel.tab = ti;
      [...$('pTabs').children].forEach((b, i) => b.classList.toggle('on', i === ti));
      body.innerHTML = '';
      if (ti === 1 && !workers.length) { body.innerHTML = '<div class="empty">解鎖第一位員工後開放</div>'; return; }
      if (ti === 1) {
        const n = (r) => workers.filter((w) => w.role === r).length;
        body.insertAdjacentHTML('beforeend', '<div class="chips staff"><span class="chip">' + (kioskOn() ? '自助結帳機 ×' + COUNTERS.filter((k) => k.on).length : '收銀員 ×' + n('cashier')) + '</span><span class="chip">飼養員 ×' + n('keeper') + '</span><span class="chip">農夫 ×' + n('farmer') + '</span><span class="chip">理貨員 ×' + n('shelver') + '</span>' + (n('orderer') ? '<span class="chip">訂單專員 ×' + n('orderer') + '</span>' : '') + '</div>');
        for (const role in EXTRA) {
          const ex = EXTRA[role]; if (!(ex.ok ? ex.ok() : isBuilt(ex.need))) continue;
          const have = state.extra[role] || 0, max = have >= EXTRA_MAX, cost = extraCost(role);
          const row = document.createElement('div'); row.className = 'row';
          row.innerHTML = '<span class="ricon"><span class="ic">' + (ex.emo || '🧑‍🌾') + '</span></span><div class="rmid"><b>多請一位' + ex.name + '</b><small>' + (ex.does ? ex.does + ' · ' : '') + '現在 ' + n(role) + ' 位' + (max ? '（已達上限）' : '') + '</small></div>';
          const btn = document.createElement('button'); btn.className = 'buy' + (max ? ' max' : (state.money < cost ? ' poor' : ''));
          btn.innerHTML = max ? '已滿' : ICON.money + fmtMoney(cost);
          btn.onclick = () => {
            if (max || state.money < cost) { sfx('drop'); btn.classList.add('shake'); setTimeout(() => btn.classList.remove('shake'), 300); return; }
            state.money -= cost; state.extra[role] = have + 1; makeWorker(role, ex.at, 0, true); refreshZones(); sfx('buy'); updateMoney(); save(); show(ti);
          };
          row.appendChild(btn); body.appendChild(row);
        }
        // a counter without a cashier: hire one here too (same price as its zone on the map)
        const CASH_IDS = ['cashier', 'cashier2', 'cashier3', 'cashier4'], CNAMES = ['收銀台', '第二收銀台', '第三收銀台', '第四收銀台'];
        const ci = kioskOn() ? -2 : COUNTERS.findIndex((k, i) => k.on && !isBuilt(CASH_IDS[i]));
        const crow = document.createElement('div'); crow.className = 'row';
        if (ci === -2) {
          crow.classList.add('locked');
          crow.innerHTML = '<span class="ricon"><span class="ic">🧾</span></span><div class="rmid"><b>自助結帳機</b><small>客人自己結帳，不用請收銀員</small></div>';
        } else if (ci < 0) {
          crow.classList.add('locked');
          crow.innerHTML = '<span class="ricon"><span class="ic">🧾</span></span><div class="rmid"><b>多請一位收銀員</b><small>每個收銀台都有收銀員了，多開一個收銀台就能再請</small></div>';
        } else {
          const d = DEF[CASH_IDS[ci]], paid = (state.paid[d.id] && state.paid[d.id].money) || 0, cost = Math.max(0, d.cost.money - paid);
          crow.innerHTML = '<span class="ricon"><span class="ic">🧾</span></span><div class="rmid"><b>多請一位收銀員</b><small>「' + CNAMES[ci] + '」還沒有收銀員</small></div>';
          const btn = document.createElement('button'); btn.className = 'buy' + (state.money < cost ? ' poor' : '');
          btn.innerHTML = ICON.money + fmtMoney(cost);
          btn.onclick = () => {
            if (state.money < cost) { sfx('drop'); btn.classList.add('shake'); setTimeout(() => btn.classList.remove('shake'), 300); return; }
            state.money -= cost; delete state.paid[d.id]; if (zones[d.id]) killZone(d.id);
            build(d); refreshZones(); sfx('buy'); updateMoney(); save(); show(ti);
          };
          crow.appendChild(btn);
        }
        body.appendChild(crow);
      }
      for (const k in UPS) {
        const u = UPS[k]; if (u.tab !== ti) continue;
        if (k === 'mgrShop') body.insertAdjacentHTML('beforeend', '<div class="sec">管理層</div>');
        if (u.need && !isBuilt(u.need)) { body.insertAdjacentHTML('beforeend', '<div class="row locked"><span class="ricon">' + (ICON[u.ic] || '<span class="ic">' + (u.emo || '🏪') + '</span>') + '</span><div class="rmid"><b>' + u.name + '</b><small>先在地圖上買「' + DEF[u.need].name + '」就會開放</small></div></div>'); continue; }
        const lvl = state.up[k], max = lvl >= u.cost.length;
        const row = document.createElement('div'); row.className = 'row';
        row.innerHTML = '<span class="ricon">' + (ICON[u.ic] || '<span class="ic">' + (u.emo || '🏪') + '</span>') + '</span><div class="rmid"><b>' + u.name + '</b><small>' + (u.noLv ? '' : '等級 ' + (lvl + 1) + ' · ') + u.fmt(u.vals[lvl]) + (max ? '' : ' → ' + u.fmt(u.vals[lvl + 1])) + '</small><div class="pips">' + u.vals.map((_, i) => '<i class="' + (i <= lvl ? 'on' : '') + '"></i>').join('') + '</div></div>';
        const b = document.createElement('button'); b.className = 'buy' + (max ? ' max' : (state.money < u.cost[lvl] ? ' poor' : ''));
        b.innerHTML = max ? '已滿級' : ICON.money + fmtMoney(u.cost[lvl]);
        b.onclick = () => {
          if (max || state.money < u.cost[lvl]) { sfx('drop'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 300); return; }
          state.money -= u.cost[lvl]; state.up[k]++; if (k === 'autoCash') { applyKiosk(true); refreshZones(); } if (k === 'basket') applyBasket(true); if ((k === 'mgrShop' || k === 'mgrFarm') && state.up[k] === 1) spawnManager(k); if (k === 'look') { applyShopLook(true); applyAd(false); } if (k === 'floor') applyFloor(true); if (k === 'ad') applyAd(true); if (k === 'stockCap') for (const s of Object.values(stations)) if (s.kind === 'producer' || s.kind === 'machine') applyStockCap(s); sfx('buy'); updateMoney(); save(); show(ti);
        };
        row.appendChild(b); body.appendChild(row);
      }
    };
    tabs.forEach((t, i) => { const b = document.createElement('button'); b.textContent = t; b.onclick = () => show(i); $('pTabs').appendChild(b); });
    show(openPanel.tab || 0);
  } else if (kind === 'inv') {
    $('pTitle').textContent = '倉庫';
    const carry = {}; for (const it of player.carry) carry[it.type] = (carry[it.type] || 0) + 1;
    let h = '<div class="sec">背包 ' + player.carry.length + '/' + player.cap() + '</div><div class="chips">';
    h += Object.keys(carry).length ? Object.keys(carry).map((k) => '<span class="chip">' + ICON[k] + carry[k] + '</span>').join('') : '<span class="empty">空空的</span>';
    h += '</div><div class="sec">貨架</div><div class="chips">';
    const sh = listOf('shelf');
    h += sh.length ? sh.map((s) => '<span class="chip">' + ICON[s.item] + s.n + '/' + upVal('shelfCap') + '</span>').join('') : '<span class="empty">還沒有貨架</span>';
    if (listOf('store').length) {
      h += '</div><div class="sec">倉庫 ' + storeTotal() + '/' + storeCap() + '</div><div class="chips">';
      const ks = Object.keys(state.store).filter((k) => state.store[k] > 0);
      h += ks.length ? ks.map((k) => '<span class="chip">' + ICON[k] + state.store[k] + '</span>').join('') : '<span class="empty">空空的</span>';
    }
    h += '</div><div class="sec">農場與機器</div><div class="chips">';
    for (const s of Object.values(stations)) if (s.kind === 'producer' || s.kind === 'machine') h += '<span class="chip">' + s.def.name + ' ' + ICON[s.def.in] + s.inN + ' → ' + ICON[s.def.out] + s.outN + '</span>';
    h += '</div><div class="sec">進度</div><div class="chips"><span class="chip">已解鎖 ' + state.built.filter((id) => DEF[id] && DEF[id].kind !== 'mapgate').length + '/' + DEFS.filter((d) => d.kind !== 'mapgate').length + '</span><span class="chip">總收入 ' + ICON.money + fmtMoney(state.earned) + '</span></div>';
    body.innerHTML = h;
  } else if (kind === 'map') {
    $('pTitle').textContent = '地圖';
    const m = mapsGet();
    body.innerHTML = '<div class="mapcard here"><span class="mi" style="background:#c9f0a8">🌾</span><div><b>開心農場</b><small>你目前在這裡</small></div></div>' +
      (m.cafe ? '<a class="mapcard" href="cafe.html"><span class="mi" style="background:#f3dcc4">☕</span><div><b>山城咖啡館</b><small>種咖啡豆、烘豆、做各種咖啡</small></div></a>'
        : '<div class="mapcard locked"><span class="mi" style="background:#e8e2d6">☕</span><div><b>山城咖啡館</b><small>開好南邊農地和 3 條新產品線、總收入達 $400,000 後，在農場開分店</small></div></div>') +
      (m.harbor ? '<a class="mapcard" href="harbor.html"><span class="mi" style="background:#bfe9ff">⚓</span><div><b>海邊漁港</b><small>捕魚、壽司、海鮮餐廳</small></div></a>'
        : '<div class="mapcard locked"><span class="mi" style="background:#e8e2d6">⚓</span><div><b>海邊漁港</b><small>在山城咖啡館開分店後開放</small></div></div>') +
      (m.forest ? '<a class="mapcard" href="forest.html"><span class="mi" style="background:#cdeec0">🌲</span><div><b>森林小鎮</b><small>伐木、家具、幫小鎮蓋房子</small></div></a>'
        : '<div class="mapcard locked"><span class="mi" style="background:#e8e2d6">🌲</span><div><b>森林小鎮</b><small>在海邊漁港開分店後開放</small></div></div>');
  } else if (kind === 'set') {
    $('pTitle').textContent = '設定';
    body.innerHTML = '<div class="row"><span class="ricon">🔊</span><div class="rmid"><b>聲音</b></div><button class="buy" id="sSnd">' + (state.sound ? '開' : '關') + '</button></div>' +
      '<div class="row"><span class="ricon">💾</span><div class="rmid"><b>立即儲存</b><small>遊戲每 4 秒也會自動儲存</small></div><button class="buy" id="sSave">儲存</button></div>' +
      '<div class="row"><span class="ricon">📋</span><div class="rmid"><b>備份存檔</b><small>複製一段存檔碼，換手機或清除瀏覽器也能救回</small></div><button class="buy" id="sExp">複製</button></div>' +
      '<div class="row"><span class="ricon">📥</span><div class="rmid"><b>還原存檔</b><small>貼上存檔碼，回到備份時的進度</small></div><button class="buy" id="sImp">貼上</button></div>' +
      '<div id="sBox" class="savebox hidden"><textarea id="sCode" rows="4" spellcheck="false"></textarea><button class="buy" id="sGo"></button></div>' +
      '<div class="row"><span class="ricon">🔄</span><div class="rmid"><b>重新開始</b><small>清除所有進度</small></div><button class="buy poor" id="sReset">重新開始</button></div>';
    $('sSnd').onclick = () => { state.sound = !state.sound; save(); openPanel('set'); };
    $('sSave').onclick = () => { save(); toast('已儲存 ✔'); };
    const box = $('sBox'), code = $('sCode'), go = $('sGo');
    $('sExp').onclick = () => {
      save();
      code.value = exportSave(); code.readOnly = true; go.textContent = '複製存檔碼'; box.classList.remove('hidden');
      go.onclick = () => copyText(code);
      copyText(code);
    };
    $('sImp').onclick = () => {
      code.value = ''; code.readOnly = false; code.placeholder = '把存檔碼貼在這裡'; go.textContent = '還原'; box.classList.remove('hidden'); code.focus();
      go.onclick = () => {
        if (!importSave(code.value)) { toast('存檔碼不正確，請整段重新複製'); return; }
        resetting = true; toast('已還原，重新載入中…'); setTimeout(() => location.replace(location.pathname), 600);
      };
    };
    let armed = false;
    $('sReset').onclick = (e) => {
      if (!armed) { armed = true; e.target.textContent = '確定？'; return; }
      resetting = true; localStorage.removeItem(SAVE); location.replace(location.pathname);
    };
  }
}
$('pClose').onclick = () => $('panel').classList.add('hidden');
$('panel').addEventListener('pointerdown', (e) => { if (e.target === $('panel')) $('panel').classList.add('hidden'); });
$('bUp').onclick = () => openPanel('up');
$('bInv').onclick = () => openPanel('inv');
$('bSet').onclick = () => openPanel('set');
$('bMap').onclick = () => openPanel('map');
showMapBtn();

// ---------- per-frame interactions for the player ----------
function addMoney(v) { state.money += v; state.earned += v; updateMoney(); }
function playerInteract(dt) {
  const pp = player.p.root.position;
  for (const t of tufts) if (t.grown && !t.res && dist2(pp, t.x, t.z) < 0.8) cutTuft(t, player);
  for (const s of listOf('crop')) for (const pl of s.plants) if (pl.ripe && !pl.res && dist2(pp, pl.x, pl.z) < (s.def.plant === 'apple' ? 1.3 : 1.0)) pickPlant(s, pl, player);
  let chopping = false;
  for (const tr of trees) {
    if (tr.dead || dist2(pp, tr.x, tr.z) > 1.55 || room(player) <= 0) continue;
    chopping = true;
    tr.chop = (tr.chop || 0) + dt;
    pFace = Math.atan2(tr.x - pp.x, tr.z - pp.z);
    if (tr.chop > 0.42) {
      tr.chop = 0; tr.hp--; tr.shake = 1; sfx('chop');
      puff(tr.x, 0.9, tr.z, C.woodLight, 3, 0.6);
      takeInto(player, 'wood', V3(tr.x, 0.9, tr.z));
      if (tr.hp <= 0) { tr.dead = true; tr.t = 0; tr.trunk.visible = false; tr.crown.visible = false; tr.stump.visible = true; puff(tr.x, 1.4, tr.z, '#6fcd5f', 10, 1.4); }
    }
    break;
  }
  axe.visible = chopping;
  axe.rotation.x = chopping ? -1.2 + Math.sin(performance.now() / 70) * 0.9 : 0;
  player.xfer2 = (player.xfer2 || 0) - dt;
  updateBin(dt);
  for (const s of Object.values(stations)) {
    if (s.kind === 'producer' || s.kind === 'machine') {
      if (dist2(pp, s.inPt.x, s.inPt.z) < 1.5 && count(player, s.def.in) > 0) depositTo(player, s, s.def.in, dt);
      if (player.xfer2 <= 0 && dist2(pp, s.outPt.x, s.outPt.z) < 1.5 && s.outN > 0 && room(player) > 0) {
        player.xfer2 = 0.08; s.outN--; sfx('pop'); takeInto(player, s.def.out, V3(s.outPt.x, 0.4, s.outPt.z));
      }
    } else if (s.kind === 'shelf') {
      if (dist2(pp, s.front.x, s.front.z - 0.6 * s.dir) < 1.7 && count(player, s.item) > 0) depositTo(player, s, s.item, dt);
    }
  }
  const whs = listOf('store');
  if (whs.length) {
    const kinds = Object.keys(state.store).filter((k) => state.store[k] > 0).sort((a, b) => state.store[b] - state.store[a]);
    const html = '<div class="zn">倉庫 ' + storeTotal() + '/' + storeCap() + '</div>' + (kinds.length ? '<div class="inv">' + kinds.map((k) => '<span>' + ICON[k] + state.store[k] + '</span>').join('') + '</div>' : '<div class="inv">空的</div>');
    for (const wh of whs) {
      setLabel(wh.label, html);
    }
  }
  const reach = pets.dog ? 1.6 + upVal('dogR') : 1.6;
  for (const k of COUNTERS) {
    if (!k.on || k.pile.value <= 0) continue;
    const auto = state.up.autoCash > 0 || mShop() >= 3, near = dist2(pp, k.pile.x, k.pile.z) <= reach;
    if (!auto && !near) continue;
    k.pile.tick = (k.pile.tick || 0) - dt;
    if (k.pile.tick > 0) continue;
    k.pile.tick = near ? 0.04 : 0.25;
    const chunk = Math.max(1, Math.ceil(k.pile.value / 12));
    k.pile.value -= chunk; setPile(k);
    if (!near) addMoney(chunk);
    else fly('money', V3(k.pile.x, 0.4, k.pile.z), (o) => { o.copy(player.p.root.position); o.y = 1.6; }, 0.22, () => { addMoney(chunk); sfx('coin'); });
  }
}

// ---------- simulation ----------
function updateWorld(dt, t) {
  for (const tf of tufts) if (tf.active && !tf.grown) {
    tf.t += dt;
    if (tf.t > 4 / upVal('hayGrow')) { tf.grown = true; tf.tall.visible = true; tf.tall.scale.setScalar(0.01); pops.push({ obj: tf.tall, t: 0 }); }
  }
  for (const tr of trees) {
    if (tr.shake > 0) { tr.shake = Math.max(0, tr.shake - dt * 4); tr.crown.rotation.z = Math.sin(tr.shake * 20) * 0.08 * tr.shake; }
    if (tr.dead) { tr.t += dt; if (tr.t > 14) { tr.dead = false; tr.hp = 3; tr.trunk.visible = true; tr.crown.visible = true; tr.stump.visible = false; tr.g.scale.setScalar(0.01); pops.push({ obj: tr.g, t: 0 }); } }
  }
  const growK = upVal('grow') * (isBuilt('sprinkler') ? 1.8 : 1) * (events.rain > 0 ? 2 : 1);
  const cap = upVal('shelfCap');
  for (const s of Object.values(stations)) {
    if (s.kind === 'producer' || s.kind === 'machine') {
      const iv = s.kind === 'machine' ? s.def.iv / upVal('mach') / machK(s.id) : s.def.out === 'milk' ? upVal('barn') * 0.6 / lvlOf(s.id) : s.def.out === 'wool' ? upVal('barn') * 2.2 / lvlOf(s.id) : upVal('coop') * 2 / lvlOf(s.id);
      const busy = s.inN > 0 && s.outN < s.outMax;
      if (busy) {
        s.timer += dt;
        if (s.timer >= iv) { s.timer = 0; s.inN--; s.outN = Math.min(s.outMax, s.outN + (s.def.out === 'milk' ? 2 : 1)); puff(s.outPt.x, 0.5, s.outPt.z, '#fff4c9', 3, 0.4); }
      }
      if (s.spin) s.spin.rotation.y += dt * (busy ? 9 : 0);
      stackSet(s.inStack, s.inN); stackSet(s.outStack, s.outN);
      setLabel(s.inLabel, badge(s.def.in, s.inN, s.inMax)); setLabel(s.outLabel, badge(s.def.out, s.outN, s.outMax));
      if (s.animals) for (const a of s.animals) {
        if (!a.g.visible) continue;
        a.t -= dt;
        if (a.t <= 0) { a.t = 1.5 + Math.random() * 3; a.tx = a.home[0] + (Math.random() - 0.5) * 2 * a.rx; a.tz = a.home[1] + (Math.random() - 0.5) * 2 * a.rz; }
        const dx = a.tx - a.g.position.x, dz = a.tz - a.g.position.z, d = Math.hypot(dx, dz);
        if (d > 0.05) { const st = Math.min(d, 0.7 * dt); a.g.position.x += dx / d * st; a.g.position.z += dz / d * st; a.g.rotation.y = Math.atan2(dx, dz); a.b.position.y = Math.abs(Math.sin(t * 12)) * 0.04; }
        else { a.b.rotation.x = s.inN > 0 ? Math.max(0, Math.sin(t * 3 + a.home[0])) * 0.3 : 0; a.b.position.y = 0; if (a.cow) a.g.rotation.y *= 0.9; }
      }
    } else if (s.kind === 'crop') {
      for (const pl of s.plants) {
        if (pl.active && !pl.ripe) {
          pl.t += dt * growK;
          pl.fruit.visible = pl.t > s.grow * 0.35;
          pl.fruit.scale.setScalar(Math.min(1, pl.t / s.grow));
          if (pl.t >= s.grow) { pl.ripe = true; pl.fruit.scale.setScalar(1); pops.push({ obj: pl.fruit, t: 0.5 }); }
        }
      }
    } else if (s.kind === 'shelf') {
      if (s.n > cap) s.n = cap;
      stackSet(s.stack, s.n);
      setLabel(s.label, badge(s.item, s.n, cap));
    }
  }
  for (const sp of sprinklers) {
    sp.ph += dt * 3; sp.head.rotation.y = sp.ph;
    sp.drops.forEach((d, i) => {
      const k = ((sp.ph * 0.6 + i / 6) % 1), a = sp.ph + i * 1.05;
      d.position.set(Math.cos(a) * k * 1.6, 0.65 + Math.sin(k * Math.PI) * 0.6, Math.sin(a) * k * 1.6);
    });
  }
}

function movePlayer(dt) {
  const j = joy.read();
  const sp = upVal('speed');
  const tvx = j.x * sp, tvz = j.y * sp;
  pVel.x += (tvx - pVel.x) * Math.min(1, dt * 14); pVel.z += (tvz - pVel.z) * Math.min(1, dt * 14);
  const pos = player.p.root.position;
  pos.x += pVel.x * dt; pos.z += pVel.z * dt;
  const r = 0.42;
  for (const b of colliders) {
    const cx = Math.max(b.x0, Math.min(pos.x, b.x1)), cz = Math.max(b.z0, Math.min(pos.z, b.z1));
    const dx = pos.x - cx, dz = pos.z - cz, d = Math.hypot(dx, dz);
    if (d < r) {
      if (d > 1e-4) { pos.x = cx + dx / d * r; pos.z = cz + dz / d * r; }
      else { const ex = Math.min(pos.x - b.x0, b.x1 - pos.x), ez = Math.min(pos.z - b.z0, b.z1 - pos.z); if (ex < ez) pos.x = pos.x - b.x0 < b.x1 - pos.x ? b.x0 - r : b.x1 + r; else pos.z = pos.z - b.z0 < b.z1 - pos.z ? b.z0 - r : b.z1 + r; }
    }
  }
  pos.x = Math.max(-20.4, Math.min(28.5, pos.x)); pos.z = Math.max(isBuilt('hall') ? HALL_Z + 0.6 : isBuilt('dept') ? DEPT_Z + 0.6 : -17, Math.min(isBuilt('expand') ? 61.4 : 31.4, pos.z));
  const spd = Math.hypot(pVel.x, pVel.z);
  if (spd > 0.3) pFace = Math.atan2(pVel.x, pVel.z);
  turn(player.p, pFace, dt);
  player.p.anim(dt, Math.min(1, spd / 4));
  player.p.back.rotation.x = -Math.min(0.12, spd * 0.015);
  swayStack(player, spd, dt);
}

// ---------- automatic doors and lights ----------
function someoneNear(x, z, r) {
  if (dist2(player.p.root.position, x, z) < r) return true;
  for (const c of customers) if (dist2(c.p.root.position, x, z) < r) return true;
  for (const w of workers) if (dist2(w.p.root.position, x, z) < r) return true;
  return false;
}
function updateDoorsAndLights(dt) {
  const ease = Math.min(1, dt * 7);
  for (const d of DOORS) if (d.d) { d.k += ((someoneNear(d.x, -7.3, 2.3) ? 1 : 0) - d.k) * ease; d.d.open(d.k); }
  for (const wh of listOf('store')) { wh.k += ((someoneNear(wh.def.pos[0], wh.def.pos[1] + 2.4, 2.8) ? 1 : 0) - wh.k) * ease; wh.door.position.y = wh.k * 1.85; }
  for (const sh of listOf('shelf')) {
    if (!sh.door) continue;
    sh.dk += ((someoneNear(sh.front.x, sh.front.z, 1.9) ? 1 : 0) - sh.dk) * ease;
    sh.door.open(sh.dk);
  }
  const pp = player.p.root.position;
  for (const A of areas) {
    const inside = pp.x > A.x0 && pp.x < A.x1 && pp.z > A.z0 && pp.z < A.z1;
    A.k += ((inside ? 1 : 0) - A.k) * Math.min(1, dt * 4);
    A.light.intensity = A.k * 26;
    const lit = A.k > 0.5;
    if (A.lit !== lit) { A.lit = lit; A.lamps.forEach((l) => l.lit(lit)); }
  }
}

// ---------- camera ----------
const camPos = new THREE.Vector3();
let camDist = 20;
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < h ? 50 : 36;
  const hf = Math.atan(Math.tan(camera.fov * Math.PI / 360) * camera.aspect);
  camDist = w < h ? Math.min(24, Math.max(16, 5.4 / Math.tan(hf))) : Math.max(22, Math.min(28, 22 * 1280 / Math.max(900, w) + 4));
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
function updateCamera(dt, snap) {
  const pp = player.p.root.position;
  const tx = pp.x, tz = pp.z + camDist * 0.6, ty = camDist * 0.8;
  if (snap) camPos.set(tx, ty, tz); else camPos.lerp(V3(tx, ty, tz), Math.min(1, dt * 6));
  camera.position.copy(camPos);
  camera.lookAt(camPos.x, 0, camPos.z - camDist * 0.6);
  lights.follow(pp.x, pp.z);
}

// ---------- boot ----------
buildWorld();
buildField();
buildTrees();
if (state.built.length && !state.built.includes('counter')) state.built.splice(1, 0, 'counter');
if (state.built.length > 3) state.questSeen = true;
for (const def of DEFS) if (isBuilt(def.id)) build(def, true);
applyShopLook(false); applyFloor(false); applyAd(false); applyBasket(false);
for (const role in EXTRA) for (let i = 0; i < (state.extra[role] || 0); i++) makeWorker(role, EXTRA[role].at, 0, false);
for (const k of ['mgrShop', 'mgrFarm']) if (state.up[k]) spawnManager(k, true);
if (linesMoved) setTimeout(() => toast('專屬工人已合併成飼養員、農夫和理貨員'), 1500);
if (tomatoMerged) setTimeout(() => toast('第二番茄田已併入原本的番茄田（2×4）'), 3000);
if (keeperRefund) setTimeout(() => toast('升級改版，退還 $' + keeperRefund), linesMoved ? 4500 : 1500);
refreshZones();
applyKiosk(false);
resize(); updateCamera(0, true); updateMoney();

let last = performance.now(), saveT = 0, T = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
  step(dt);
  updateCamera(dt);
  renderer.render(scene, camera);
  placeLabels();
  saveT += dt; if (saveT > 4) { saveT = 0; save(); }
}
let gateT = 0;
function step(dt) {
  T += dt; navBudget = NAV_PER_FRAME;
  gateT += dt; if (gateT > 3) { gateT = 0; if (!zones.gateCafe && !isBuilt('gateCafe') && isBuilt('expand') && linesBuilt() >= DEF.gateCafe.lines && state.earned >= DEF.gateCafe.earned) refreshZones(); }
  for (let i = later.length - 1; i >= 0; i--) { later[i].t -= dt; if (later[i].t <= 0) { const f = later[i].fn; later.splice(i, 1); f(); } }
  movePlayer(dt);
  playerInteract(dt);
  payZones(dt);
  updateWorld(dt, T);
  for (const w of workers) {
    w.idl = 0; updateWorker(w, dt); if (!w.idl && (w.seat || w.sit)) releaseSeat(w);
    if (w.moving) w.sit = 0;
    turn(w.p, w.face, dt); w.p.anim(dt, w.moving);
    if (w.sit) { const r = w.p.rig; r.position.y = 0.0; r.rotation.x = 0; w.p.legs[0].rotation.x = -1.5; w.p.legs[1].rotation.x = -1.5; }
    swayStack(w, w.moving ? upVal('wspeed') : 0, dt);
  }
  maxTag(player);
  updateCustomers(dt);
  updateCars(dt);
  updatePets(dt, T);
  updateVip(dt);
  updateTruck(dt);
  updateHeli(dt);
  updateEvents(dt);
  for (let i = flyers.length - 1; i >= 0; i--) {
    const f = flyers[i]; f.t += dt / f.dur;
    const to = tmpV.set(0, 0, 0); f.toFn(to);
    const k = Math.min(1, f.t);
    f.m.position.lerpVectors(f.from, to, k); f.m.position.y += Math.sin(k * Math.PI) * 1.1;
    f.m.rotation.y += dt * 8;
    if (f.t >= 1) { scene.remove(f.m); flyers.splice(i, 1); if (f.done) f.done(); }
  }
  for (let i = puffs.length - 1; i >= 0; i--) {
    const p = puffs[i]; p.t += dt;
    p.vy -= 9 * dt; p.m.position.x += p.vx * dt; p.m.position.y = Math.max(0.05, p.m.position.y + p.vy * dt); p.m.position.z += p.vz * dt;
    p.m.scale.setScalar(Math.max(0.01, 1 - p.t / p.life));
    if (p.t >= p.life) { scene.remove(p.m); puffs.splice(i, 1); }
  }
  for (let i = pops.length - 1; i >= 0; i--) {
    const p = pops[i]; p.t += dt / 0.45;
    p.obj.scale.setScalar(Math.max(0.01, easeBack(Math.min(1, p.t))));
    if (p.t >= 1) { p.obj.scale.setScalar(1); pops.splice(i, 1); }
  }
  updateBumps(dt);
  updateKiosks(dt);
  dashMat.opacity = 0.75 + Math.sin(T * 4) * 0.25;
  updateDoorsAndLights(dt);
  const gts = guideTargets(), gt = gts[0] || null, pp = player.p.root.position;
  guides.forEach((g, i) => { const t = gts[i]; g.visible = false; if (t) g.position.set(t[0], 1.2, t[1]); });
  updateTrail(gts, dt);
  updateQuest(dt);
  pickLabel.show = gts.length === 2;
  pointerG.visible = false;
  if (gt) { pointerG.position.set(pp.x, 0.05, pp.z); pointerG.rotation.y = Math.atan2(gt[0] - pp.x, gt[1] - pp.z); }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('on'); }
}
requestAnimationFrame(frame);
addEventListener('visibilitychange', () => { if (document.hidden) save(); });
addEventListener('pagehide', save);

// test hooks
window.__farm = {
  state, stations, player, zones, customers, workers, truck, heli, vip, park, events, DEFS, COUNTERS, colliders, tufts, pets,
  DEF, GROW, nav, linesBuilt, growDefs, zoneSpot, ITEMS,
  DOORS, COUNTERS_Q: () => COUNTERS.map((k) => k.qs),
  three: { scene, camera, renderer, THREE },
  // average ms per frame for the whole game step + render + labels (CPU side)
  stepMs(n) { const t0 = performance.now(); for (let i = 0; i < n; i++) step(1 / 30); return (performance.now() - t0) / n; },
  bench(n) { const t0 = performance.now(); for (let i = 0; i < n; i++) { step(1 / 30); updateCamera(1 / 30); renderer.render(scene, camera); placeLabels(); } return (performance.now() - t0) / n; },
  give(type, n) { for (let i = 0; i < n && room(player) > 0; i++) stackAdd(player, type); },
  giveTo(w, type, n) { for (let i = 0; i < n; i++) stackAdd(w, type); },
  cash(n) { state.money += n; updateMoney(); },
  tp(x, z) { player.p.root.position.set(x, 0, z); updateCamera(0, true); },
  build(id) { if (zones[id]) killZone(id); build(DEF[id]); },
  sim(sec) { for (let i = 0; i < sec * 30; i++) step(1 / 30); },
  // run the game and count frames where a worker stands inside something solid
  probe(sec) { let n = 0; for (let i = 0; i < sec * 30; i++) { step(1 / 30); for (const w of workers) { const p = w.p.root.position; for (const c of colliders) if (p.x > c.x0 + 0.05 && p.x < c.x1 - 0.05 && p.z > c.z0 + 0.05 && p.z < c.z1 - 0.05) { n++; break; } } } return n; },
  guide, guideTarget, exportSave, importSave,
  look(n, f, a) { state.up.look = n; state.up.floor = f || 0; state.up.ad = a || 0; applyShopLook(false); applyFloor(false); applyAd(false); },
  calls: () => renderer.info.render.calls,
  lineup(x, z) { Object.keys(ITEMS).forEach((t, i) => { const m = P.itemMesh(t); m.scale.setScalar(2); m.position.set(x + (i % 5) * 1.1, 0, z + Math.floor(i / 5) * 1.2); scene.add(m); }); },
};
