// Mountain café props (山城咖啡館): coffee cherries and beans, milk, café ingredients, drinks and desserts,
// coffee shrubs and other crops, the cow shed, processing machines, espresso bars and the hillside decor.
// Built from the shared style kit like the other maps.
import * as THREE from 'three';
import { C, G, mesh, add, blob, bakeStatic, itemEdge, outlineMat, OUTLINE } from './kit.js';

// h = stack height on a back, ss = scale on shelves
export const ITEMS6 = {
  cherry: { name: '阿拉比卡咖啡櫻桃', icon: '🍒', h: 0.2, price: 5 },
  robusta: { name: '羅布斯塔咖啡櫻桃', icon: '🍒', h: 0.2, price: 6 },
  geisha: { name: '藝伎咖啡豆', icon: '🫘', h: 0.28, price: 45 },
  bluemt: { name: '藍山咖啡豆', icon: '🫘', h: 0.28, price: 60 },
  civet: { name: '麝香貓咖啡豆', icon: '🫘', h: 0.28, price: 180 },
  milk: { name: '鮮奶', icon: '🥛', h: 0.36, price: 6 },
  greenbean: { name: '生豆', icon: '🫘', h: 0.26, price: 8 },
  roasted: { name: '熟豆', icon: '🫘', h: 0.26, price: 14 },
  ground: { name: '咖啡粉', icon: '☕', h: 0.26, price: 18 },
  foam: { name: '奶泡', icon: '🥛', h: 0.3, price: 9 },
  oat: { name: '燕麥', icon: '🌾', h: 0.22, price: 3 },
  oatmilk: { name: '燕麥奶', icon: '🥛', h: 0.34, price: 10 },
  cocoapod: { name: '可可果', icon: '🥥', h: 0.24, price: 4 },
  cocoa: { name: '可可粉', icon: '🍫', h: 0.26, price: 11 },
  vanilla: { name: '香草莢', icon: '🌿', h: 0.14, price: 5 },
  syrup: { name: '香草糖漿', icon: '🍯', h: 0.36, price: 12 },
  ice: { name: '冰塊', icon: '🧊', h: 0.22, price: 2 },
  wheat: { name: '小麥', icon: '🌾', h: 0.22, price: 3 },
  americano: { name: '美式咖啡', icon: '☕', h: 0.3, price: 28 },
  espresso: { name: '濃縮咖啡', icon: '☕', h: 0.2, price: 30 },
  latte: { name: '拿鐵', icon: '☕', h: 0.3, price: 40 },
  cappuccino: { name: '卡布奇諾', icon: '☕', h: 0.32, price: 42 },
  mocha: { name: '摩卡', icon: '☕', h: 0.34, price: 48 },
  macchiato: { name: '焦糖瑪奇朵', icon: '☕', h: 0.36, price: 52 },
  oatlatte: { name: '燕麥拿鐵', icon: '☕', h: 0.3, price: 50 },
  colddrip: { name: '冰滴咖啡', icon: '🧋', h: 0.4, price: 55 },
  pourover: { name: '手沖單品', icon: '☕', h: 0.36, price: 120 },
  civetpour: { name: '麝香貓手沖', icon: '☕', h: 0.36, price: 300 },
  seasonal: { name: '季節限定', icon: '☕', h: 0.36, price: 65 },
  croissant: { name: '可頌', icon: '🥐', h: 0.16, price: 30 },
  cheesecake: { name: '起司蛋糕', icon: '🍰', h: 0.2, price: 45 },
  tiramisu: { name: '提拉米蘇', icon: '🍰', h: 0.2, price: 55 },
  tealeaf: { name: '茶葉', icon: '🍃', h: 0.2, price: 9 },
  blacktea: { name: '紅茶', icon: '🧃', h: 0.36, price: 26 },
  tencha: { name: '碾茶葉', icon: '🍃', h: 0.2, price: 12 },
  matcha: { name: '抹茶粉', icon: '🍵', h: 0.3, price: 38 },
  strawberry: { name: '草莓', icon: '🍓', h: 0.2, price: 10 },
  strawcake: { name: '草莓蛋糕', icon: '🍰', h: 0.24, price: 60 },
  egg: { name: '雞蛋', icon: '🥚', h: 0.18, price: 6 },
  waffle: { name: '鬆餅', icon: '🧇', h: 0.12, price: 42 },
  chocolate: { name: '巧克力', icon: '🍫', h: 0.12, price: 50 },
  cup: { name: '髒杯子', icon: '☕', h: 0.16, price: 0 },
  money: { name: '錢', icon: '💵', h: 0.07, price: 0 },
};

const cache = new Map();
export const itemMesh = (type) => itemEdge(itemMeshRaw(type));
function itemMeshRaw(type) {
  let t = cache.get(type);
  if (!t) { t = buildItem(type); cache.set(type, t); }
  return t.clone();
}
// a café cup (with saucer) or a tall takeaway cup; top = drink colour, deco = what floats on top
function cupShape(g, top, cupCol, deco, small) {
  const s = small ? 0.75 : 1;
  add(g, mesh(G.cyl(0.17 * s, 0.17 * s, 0.025, 14), '#fbfaf5'), 0, 0.013, 0);
  add(g, mesh(G.cyl(0.13 * s, 0.1 * s, 0.2 * s, 14), cupCol), 0, 0.03 + 0.1 * s, 0);
  add(g, mesh(G.cyl(0.115 * s, 0.115 * s, 0.01, 14), top, false), 0, 0.03 + 0.2 * s, 0);
  const hd = add(g, mesh(G.cyl(0.05 * s, 0.05 * s, 0.025, 10), cupCol), 0.14 * s, 0.03 + 0.11 * s, 0); hd.rotation.x = Math.PI / 2;
  if (deco === 'heart') { const h = add(g, mesh(G.sphere(0.045, 8, 6), '#fbf3e4', false), 0, 0.03 + 0.205 * s, 0); h.scale.set(1.2, 0.2, 1); }
  if (deco === 'dome') add(g, mesh(G.sphere(0.11, 12, 8), '#fbf3e4'), 0, 0.03 + 0.2 * s, 0).scale.set(1, 0.45, 1);
  if (deco === 'cream') { add(g, mesh(G.sphere(0.1, 10, 8), '#fff8ec'), 0, 0.26, 0).scale.set(1, 0.6, 1); add(g, mesh(G.sphere(0.03, 6, 5), '#6b3e26', false), 0.02, 0.31, 0.02); }
  if (deco === 'caramel') { add(g, mesh(G.sphere(0.1, 10, 8), '#fff8ec'), 0, 0.25, 0).scale.set(1, 0.5, 1); for (let i = 0; i < 3; i++) add(g, mesh(G.rbox(0.18, 0.012, 0.02, 0.005), '#d98a3a', false), 0, 0.3, -0.05 + i * 0.05); }
}
function bag(g, col, label, beans) {
  add(g, mesh(G.rbox(0.3, 0.26, 0.2, 0.08), col), 0, 0.13, 0);
  add(g, mesh(G.rbox(0.22, 0.06, 0.16, 0.03), col), 0, 0.28, 0);
  add(g, mesh(G.rbox(0.18, 0.12, 0.01, 0.02), label, false), 0, 0.14, 0.102);
  if (beans) for (const [x, z] of [[-0.05, 0.02], [0.05, -0.02], [0, 0.05]]) add(g, mesh(G.sphere(0.035, 6, 5), beans, false), x, 0.31, z).scale.set(1, 0.7, 1.3);
}
function bottle(g, col, cap, w = 0.1, hgt = 0.3) {
  add(g, mesh(G.cyl(w, w, hgt, 12), col), 0, hgt / 2, 0);
  add(g, mesh(G.cyl(w * 0.45, w * 0.8, 0.06, 10), col), 0, hgt + 0.03, 0);
  add(g, mesh(G.cyl(w * 0.5, w * 0.5, 0.04, 10), cap), 0, hgt + 0.08, 0);
}
function berries(g, col, n = 6) {
  for (let i = 0; i < n; i++) { const a = i * 2.4, r = i ? 0.08 : 0; add(g, mesh(G.sphere(0.065, 8, 6), col), Math.cos(a) * r, 0.07 + (i % 3) * 0.03, Math.sin(a) * r); }
  add(g, mesh(G.sphere(0.05, 6, 5), '#4f9a3f', false), 0.02, 0.16, 0).scale.set(1.6, 0.3, 0.8);
}
function buildItem(type) {
  const g = new THREE.Group();
  if (type === 'cherry') berries(g, '#e3463c');
  else if (type === 'robusta') berries(g, '#a8323a');
  else if (type === 'geisha') bag(g, '#efe2c4', '#b48cff', '#7a4a2c');
  else if (type === 'bluemt') bag(g, '#efe2c4', '#5aa9ff', '#7a4a2c');
  else if (type === 'civet') { bag(g, '#f6d36b', '#ff8a2a', '#5b3420'); add(g, mesh(G.sphere(0.035, 6, 5), '#fff3a6', false), 0.1, 0.24, 0.1); }
  else if (type === 'greenbean') bag(g, '#d9c08c', '#9fd86b', '#b7c97a');
  else if (type === 'roasted') bag(g, '#c98a55', '#6b3e26', '#5b3420');
  else if (type === 'ground') { add(g, mesh(G.cyl(0.13, 0.13, 0.24, 14), '#3a2a22'), 0, 0.12, 0); add(g, mesh(G.cyl(0.135, 0.135, 0.06, 14), '#d9a066'), 0, 0.12, 0); add(g, mesh(G.cyl(0.11, 0.11, 0.02, 14), '#6b3e26', false), 0, 0.25, 0); }
  else if (type === 'milk') { bottle(g, '#ffffff', '#5aa9ff'); add(g, mesh(G.cyl(0.102, 0.102, 0.08, 12), '#5aa9ff', false), 0, 0.15, 0); }
  else if (type === 'foam') { add(g, mesh(G.cyl(0.1, 0.12, 0.24, 12), '#dfe7ee'), 0, 0.12, 0); add(g, mesh(G.sphere(0.1, 10, 8), '#fff8ec'), 0, 0.25, 0).scale.set(1, 0.5, 1); add(g, mesh(G.cone(0.04, 0.1, 6), '#dfe7ee'), 0.12, 0.22, 0).rotation.z = -1.2; }
  else if (type === 'oat') { for (let i = 0; i < 5; i++) { const a = i * 1.26; add(g, mesh(G.capsule(0.03, 0.2, 5), '#e6c87a'), Math.cos(a) * 0.05, 0.13, Math.sin(a) * 0.05).rotation.z = Math.cos(a) * 0.25; } add(g, mesh(G.rbox(0.14, 0.04, 0.14, 0.02), '#a8693a'), 0, 0.1, 0); }
  else if (type === 'oatmilk') { add(g, mesh(G.rbox(0.16, 0.28, 0.16, 0.03), '#f6e7c8'), 0, 0.14, 0); add(g, mesh(G.prism(0.16, 0.06, 0.16), '#e6c87a'), 0, 0.31, 0); add(g, mesh(G.rbox(0.1, 0.08, 0.01, 0.01), '#9fd86b', false), 0, 0.15, 0.082); }
  else if (type === 'cocoapod') { const p = add(g, mesh(G.sphere(0.12, 10, 8), '#e08a3a'), 0, 0.12, 0); p.scale.set(1.5, 0.9, 0.9); add(g, mesh(G.cyl(0.015, 0.015, 0.08, 5), '#6b4a2c'), -0.19, 0.12, 0).rotation.z = Math.PI / 2; }
  else if (type === 'cocoa') { add(g, mesh(G.cyl(0.12, 0.12, 0.24, 14), '#8b5a3c'), 0, 0.12, 0); add(g, mesh(G.cyl(0.125, 0.125, 0.04, 14), '#ffd34a'), 0, 0.24, 0); add(g, mesh(G.rbox(0.12, 0.08, 0.01, 0.01), '#fff1c4', false), 0, 0.12, 0.122); }
  else if (type === 'vanilla') { for (let i = 0; i < 4; i++) { const v = add(g, mesh(G.capsule(0.018, 0.34, 4), '#3a2a22'), -0.04 + i * 0.027, 0.03, 0); v.rotation.z = Math.PI / 2; } add(g, mesh(G.rbox(0.06, 0.07, 0.14, 0.02), '#9fd86b'), 0, 0.04, 0); }
  else if (type === 'syrup') { bottle(g, '#f2c26b', '#3a2a22', 0.09, 0.26); add(g, mesh(G.cyl(0.015, 0.015, 0.1, 6), '#3a2a22'), 0, 0.42, 0); add(g, mesh(G.rbox(0.09, 0.03, 0.03, 0.01), '#3a2a22'), 0.04, 0.47, 0); }
  else if (type === 'ice') { for (const [x, y, z] of [[-0.06, 0.06, 0], [0.07, 0.06, 0.03], [0, 0.06, -0.08], [0.01, 0.16, 0]]) add(g, mesh(G.rbox(0.12, 0.12, 0.12, 0.03), '#d6f3ff'), x, y, z).rotation.y = x * 4; }
  else if (type === 'wheat') { for (let i = 0; i < 5; i++) { const a = i * 1.26; add(g, mesh(G.capsule(0.035, 0.14, 5), '#f0c75a'), Math.cos(a) * 0.06, 0.18, Math.sin(a) * 0.06); add(g, mesh(G.cyl(0.01, 0.01, 0.16, 4), '#c7c157'), Math.cos(a) * 0.05, 0.06, Math.sin(a) * 0.05); } }
  else if (type === 'americano') cupShape(g, '#3a2218', '#fbfaf5');
  else if (type === 'espresso') cupShape(g, '#2a1810', '#ff8a6b', null, true);
  else if (type === 'latte') cupShape(g, '#c98a55', '#fbfaf5', 'heart');
  else if (type === 'cappuccino') cupShape(g, '#c98a55', '#5aa9ff', 'dome');
  else if (type === 'mocha') cupShape(g, '#6b3e26', '#8b5a3c', 'cream');
  else if (type === 'macchiato') cupShape(g, '#d9a066', '#ffd34a', 'caramel');
  else if (type === 'oatlatte') cupShape(g, '#e6c58e', '#9fd86b', 'heart');
  else if (type === 'seasonal') cupShape(g, '#ff9fbf', '#ff7eb6', 'dome');
  else if (type === 'colddrip') { add(g, mesh(G.cyl(0.1, 0.11, 0.3, 12), '#cfeeff'), 0, 0.15, 0); add(g, mesh(G.cyl(0.09, 0.1, 0.22, 12), '#4a2a1c', false), 0, 0.12, 0); add(g, mesh(G.cyl(0.05, 0.08, 0.06, 10), '#cfeeff'), 0, 0.33, 0); add(g, mesh(G.cyl(0.055, 0.055, 0.03, 10), '#3a2a22'), 0, 0.37, 0); }
  else if (type === 'pourover' || type === 'civetpour') {
    const gold = type === 'civetpour';
    add(g, mesh(G.sphere(0.13, 12, 9), '#d6f3ff'), 0, 0.13, 0).scale.set(1, 0.9, 1);
    add(g, mesh(G.sphere(0.115, 12, 9), gold ? '#7a4a1c' : '#5b3420', false), 0, 0.1, 0).scale.set(1, 0.6, 1);
    add(g, mesh(G.cone(0.12, 0.14, 12), gold ? '#ffd34a' : '#fbfaf5'), 0, 0.31, 0).rotation.x = Math.PI;
    add(g, mesh(G.cyl(0.13, 0.13, 0.02, 12), gold ? '#ffb347' : '#e8e2d6'), 0, 0.38, 0);
  } else if (type === 'croissant') {
    for (let i = -2; i <= 2; i++) { const s = add(g, mesh(G.sphere(0.07 - Math.abs(i) * 0.012, 8, 6), i % 2 ? '#e8a548' : '#f2bd5f'), i * 0.07, 0.06, -Math.abs(i) * 0.03); s.scale.set(0.9, 0.8, 1.2); }
  } else if (type === 'cheesecake' || type === 'tiramisu') {
    const tir = type === 'tiramisu';
    add(g, mesh(G.cyl(0.17, 0.17, 0.02, 14), '#fbfaf5'), 0, 0.01, 0);
    add(g, mesh(G.prism(0.26, 0.12, 0.2), tir ? '#f3e2c8' : '#fff1b8'), 0, 0.08, 0).rotation.y = Math.PI / 2;
    add(g, mesh(G.rbox(0.2, 0.025, 0.24, 0.01), tir ? '#6b3e26' : '#e8a548', false), 0, 0.03, 0);
    if (tir) add(g, mesh(G.rbox(0.2, 0.015, 0.24, 0.005), '#5b3420', false), 0, 0.105, 0);
    else add(g, mesh(G.sphere(0.035, 6, 5), '#e3463c', false), 0, 0.15, 0.04);
  } else if (type === 'tealeaf' || type === 'tencha') {
    // a little woven basket heaped with tea leaves (碾茶葉 a darker green)
    const dark = type === 'tencha';
    add(g, mesh(G.cyl(0.17, 0.12, 0.12, 12), '#c98a55'), 0, 0.06, 0);
    add(g, mesh(G.cyl(0.175, 0.175, 0.03, 12), '#a8693a'), 0, 0.12, 0);
    for (let i = 0; i < 6; i++) { const a = i * 1.05, r = i ? 0.08 : 0; const l = add(g, mesh(G.sphere(0.07, 7, 5), dark ? '#2f7a3a' : i % 2 ? '#6cc04a' : '#8fd65a'), Math.cos(a) * r, 0.15 + (i ? 0 : 0.03), Math.sin(a) * r); l.scale.set(1.2, 0.45, 0.8); l.rotation.y = a; }
  } else if (type === 'blacktea') {
    bottle(g, '#b5462a', '#ffd34a', 0.09, 0.26);
    add(g, mesh(G.cyl(0.092, 0.092, 0.1, 12), '#fff3dd', false), 0, 0.13, 0);
    add(g, mesh(G.sphere(0.03, 6, 5), '#59a14f', false), 0, 0.13, 0.09);
  } else if (type === 'matcha') {
    add(g, mesh(G.cyl(0.12, 0.12, 0.24, 14), '#3f8f4a'), 0, 0.12, 0);
    add(g, mesh(G.cyl(0.125, 0.125, 0.05, 14), '#fbfaf5'), 0, 0.25, 0);
    add(g, mesh(G.rbox(0.13, 0.1, 0.01, 0.02), '#d6f0b4', false), 0, 0.12, 0.122);
  } else if (type === 'strawberry') {
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1, b = add(g, new THREE.Group(), Math.cos(a) * 0.07, 0, Math.sin(a) * 0.07);
      add(b, mesh(G.sphere(0.075, 9, 7), '#ff4b5c'), 0, 0.08, 0).scale.set(1, 1.2, 1);
      add(b, mesh(G.cone(0.06, 0.05, 6), '#4f9a3f', false), 0, 0.17, 0);
      for (let k = 0; k < 3; k++) add(b, mesh(G.sphere(0.012, 4, 3), '#ffe680', false), Math.cos(k * 2) * 0.06, 0.07 + k * 0.02, Math.sin(k * 2) * 0.06 + 0.02);
    }
  } else if (type === 'strawcake') {
    add(g, mesh(G.cyl(0.17, 0.17, 0.02, 14), '#fbfaf5'), 0, 0.01, 0);
    add(g, mesh(G.prism(0.26, 0.16, 0.2), '#fff4e2'), 0, 0.1, 0).rotation.y = Math.PI / 2;
    add(g, mesh(G.rbox(0.2, 0.03, 0.24, 0.01), '#ff9fb0', false), 0, 0.05, 0);
    add(g, mesh(G.sphere(0.045, 8, 6), '#ff4b5c'), 0, 0.2, 0.04).scale.set(1, 1.2, 1);
    add(g, mesh(G.sphere(0.035, 6, 5), '#fff8ec', false), 0, 0.17, -0.05);
  } else if (type === 'egg') {
    for (const [x, z, c] of [[-0.06, 0, '#fff4e2'], [0.07, 0.03, '#f2d3a8'], [0, -0.07, '#fff4e2']]) add(g, mesh(G.sphere(0.07, 10, 8), c), x, 0.08, z).scale.set(0.85, 1.1, 0.85);
  } else if (type === 'waffle') {
    add(g, mesh(G.cyl(0.17, 0.17, 0.06, 16), '#e8a548'), 0, 0.03, 0);
    for (let i = -1; i <= 1; i++) { add(g, mesh(G.rbox(0.3, 0.02, 0.03, 0.01), '#c97f2a', false), 0, 0.065, i * 0.08); add(g, mesh(G.rbox(0.03, 0.02, 0.3, 0.01), '#c97f2a', false), i * 0.08, 0.065, 0); }
    add(g, mesh(G.rbox(0.07, 0.03, 0.07, 0.02), '#fff1b8', false), 0.03, 0.085, -0.02);
  } else if (type === 'chocolate') {
    add(g, mesh(G.rbox(0.34, 0.06, 0.2, 0.02), '#6b3e26'), 0, 0.03, 0);
    for (let i = -1; i <= 1; i++) add(g, mesh(G.rbox(0.08, 0.025, 0.16, 0.01), '#7a4a2c', false), i * 0.1, 0.07, 0);
    add(g, mesh(G.rbox(0.18, 0.075, 0.21, 0.02), '#ff5a8a'), -0.09, 0.035, 0);
    add(g, mesh(G.rbox(0.04, 0.08, 0.215, 0.01), '#ffd34a', false), -0.04, 0.035, 0);
  } else if (type === 'cup') {
    add(g, mesh(G.cyl(0.17, 0.17, 0.025, 14), '#fbfaf5'), 0, 0.013, 0);
    add(g, mesh(G.cyl(0.13, 0.1, 0.2, 14), '#fbfaf5'), 0, 0.13, 0);
    add(g, mesh(G.cyl(0.115, 0.115, 0.01, 14), '#c9a27a', false), 0, 0.225, 0);
  } else if (type === 'money') {
    add(g, mesh(G.rbox(0.42, 0.06, 0.24, 0.02), C.money), 0, 0.03, 0);
    add(g, mesh(G.rbox(0.1, 0.065, 0.245, 0.01), '#d8f7c8'), 0, 0.03, 0);
  }
  g.traverse((o) => { if (o.isMesh && !o.userData.outline && o.material.isMeshLambertMaterial) o.castShadow = true; });
  bakeStatic(g);
  return g;
}

// ---------- crops: a plant with a `fruit` group that shows when ripe ----------
export function coffeeShrub(berry = '#e3463c') {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.05, 0.07, 0.4, 6), '#8b5a3c'), 0, 0.2, 0);
  for (const [x, y, z, r] of [[0, 0.55, 0, 0.32], [0.18, 0.42, 0.1, 0.22], [-0.16, 0.45, -0.08, 0.22]]) add(g, mesh(G.sphere(r, 9, 7), '#3f9a58'), x, y, z);
  const fruit = add(g, new THREE.Group());
  for (let i = 0; i < 7; i++) { const a = i * 0.9; add(fruit, mesh(G.sphere(0.055, 6, 5), berry, false), Math.cos(a) * 0.3, 0.38 + (i % 3) * 0.12, Math.sin(a) * 0.3); }
  return { g, fruit };
}
export function oatPlant() {
  const g = new THREE.Group();
  const fruit = add(g, new THREE.Group());
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26, r = i ? 0.12 : 0;
    add(g, mesh(G.cyl(0.016, 0.02, 0.6, 4), '#9fbf57', false), Math.cos(a) * r, 0.3, Math.sin(a) * r).rotation.z = Math.cos(a) * 0.15;
    for (let k = 0; k < 3; k++) add(fruit, mesh(G.sphere(0.035, 5, 4), '#e6d07a', false), Math.cos(a) * r * 1.3 + (k - 1) * 0.04, 0.62 + k * 0.05, Math.sin(a) * r * 1.3);
  }
  return { g, fruit };
}
export function cocoaTree() {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.08, 0.11, 0.9, 7), '#7e4a24'), 0, 0.45, 0);
  add(g, mesh(G.sphere(0.5, 10, 8), '#3f8f4a'), 0, 1.15, 0);
  add(g, mesh(G.sphere(0.35, 9, 7), '#4fa35a'), 0.3, 1.0, 0.2);
  const fruit = add(g, new THREE.Group());
  for (const [x, y, z] of [[0.11, 0.55, 0.06], [-0.1, 0.65, 0.05], [0.02, 0.45, -0.11]]) add(fruit, mesh(G.sphere(0.08, 8, 6), '#e08a3a'), x, y, z).scale.set(0.8, 1.4, 0.8);
  return { g, fruit };
}
export function vanillaVine() {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.03, 0.03, 1.0, 5), '#b8733f'), 0, 0.5, 0);
  for (let i = 0; i < 4; i++) add(g, mesh(G.sphere(0.13, 7, 5), '#5fae4a'), Math.cos(i * 1.6) * 0.12, 0.3 + i * 0.2, Math.sin(i * 1.6) * 0.12).scale.set(1, 0.6, 1);
  const fruit = add(g, new THREE.Group());
  for (let i = 0; i < 3; i++) add(fruit, mesh(G.capsule(0.02, 0.22, 4), '#6b8a2c', false), Math.cos(i * 2.1) * 0.15, 0.55, Math.sin(i * 2.1) * 0.15);
  add(fruit, mesh(G.sphere(0.06, 6, 5), '#fff1c4', false), 0.12, 0.9, 0.05);
  return { g, fruit };
}
export function wheatSheaf() {
  const g = new THREE.Group();
  const fruit = add(g, new THREE.Group());
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26, r = i ? 0.12 : 0;
    add(g, mesh(G.cyl(0.018, 0.022, 0.7, 4), '#c7c157', false), Math.cos(a) * r, 0.35, Math.sin(a) * r).rotation.z = Math.cos(a) * 0.12;
    add(fruit, mesh(G.capsule(0.045, 0.16, 6), '#f0c75a', false), Math.cos(a) * r * 1.3, 0.8, Math.sin(a) * r * 1.3);
  }
  return { g, fruit };
}
// 茶樹 (茶園) and 抹茶 (shaded tea bushes under a dark net), a low 草莓 plant
export function teaBush(dark) {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.04, 0.06, 0.2, 6), '#8b5a3c'), 0, 0.1, 0);
  add(g, mesh(G.sphere(0.34, 10, 7), dark ? '#2f7a3a' : '#4fae4f'), 0, 0.36, 0).scale.set(1.15, 0.75, 1);
  const fruit = add(g, new THREE.Group());
  for (let i = 0; i < 6; i++) { const a = i * 1.05; add(fruit, mesh(G.sphere(0.07, 6, 5), dark ? '#5fae4a' : '#a8e86a', false), Math.cos(a) * 0.26, 0.52, Math.sin(a) * 0.22).scale.set(1.2, 0.5, 0.8); }
  if (dark) {
    for (const [x, z] of [[-0.35, -0.3], [0.35, -0.3], [-0.35, 0.3], [0.35, 0.3]]) add(g, mesh(G.cyl(0.02, 0.02, 0.9, 4), '#5b3420'), x, 0.45, z);
    add(g, mesh(G.rbox(0.8, 0.03, 0.7, 0.01), '#2d3436', false), 0, 0.91, 0);
  }
  return { g, fruit };
}
export function berryPlant() {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) { const a = i * 1.26; add(g, mesh(G.sphere(0.13, 7, 5), '#4fae4f'), Math.cos(a) * 0.14, 0.1, Math.sin(a) * 0.14).scale.set(1.2, 0.45, 1.2); }
  const fruit = add(g, new THREE.Group());
  for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4; add(fruit, mesh(G.sphere(0.06, 7, 6), '#ff4b5c'), Math.cos(a) * 0.2, 0.12, Math.sin(a) * 0.2).scale.set(1, 1.2, 1); }
  return { g, fruit };
}
// terrace bed (a raised field with a stone edge)
export function terraceBed(w, d, soil = '#8a5a3a') {
  const g = new THREE.Group();
  g.add(blob(Math.max(w, d) * 0.6));
  add(g, mesh(G.rbox(w + 0.3, 0.18, d + 0.3, 0.06), '#c9c2b4'), 0, 0.09, 0);
  add(g, mesh(G.rbox(w, 0.04, d, 0.04), soil, false, true), 0, 0.19, 0);
  return g;
}

// ---------- cow shed: a little barn with a fenced paddock ----------
export function cowShed() {
  const g = new THREE.Group();
  g.add(blob(2.6));
  add(g, mesh(G.rbox(2.6, 1.5, 1.6, 0.1), '#fbfaf5'), 0, 0.75, -0.9);
  add(g, mesh(G.prism(2.9, 0.8, 1.9), '#ff8a6b'), 0, 1.9, -0.9);
  add(g, mesh(G.rbox(0.9, 1.0, 0.06, 0.04), '#c96a4a'), 0, 0.5, -0.08);
  for (const x of [-0.85, 0.85]) add(g, mesh(G.rbox(0.5, 0.4, 0.05, 0.03), '#bfe9ff'), x, 1.0, -0.08);
  for (const s of [-1, 1]) for (const z of [0.3, 1.2]) add(g, mesh(G.rbox(0.1, 0.6, 0.1, 0.03), C.woodDark), s * 1.25, 0.3, z);
  for (const s of [-1, 1]) for (const y of [0.25, 0.5]) add(g, mesh(G.rbox(0.06, 0.06, 1.0, 0.02), C.wood), s * 1.25, y, 0.75);
  return g;
}

// ---------- hen house (雞舍): a small yellow coop with a fenced run ----------
export function henHouse() {
  const g = new THREE.Group();
  g.add(blob(2.4));
  add(g, mesh(G.rbox(2.2, 1.2, 1.4, 0.1), '#fff1c4'), 0, 0.6, -0.9);
  add(g, mesh(G.prism(2.5, 0.7, 1.7), '#ffb347'), 0, 1.55, -0.9);
  add(g, mesh(G.rbox(0.6, 0.7, 0.06, 0.04), '#c96a4a'), 0, 0.35, -0.18);
  add(g, mesh(G.rbox(0.5, 0.08, 0.6, 0.02), C.woodDark), 0, 0.1, 0.05).rotation.x = 0.4;
  for (const x of [-0.75, 0.75]) add(g, mesh(G.cyl(0.14, 0.14, 0.04, 10), '#bfe9ff'), x, 0.85, -0.18).rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) for (const z of [0.3, 1.2]) add(g, mesh(G.rbox(0.1, 0.5, 0.1, 0.03), C.woodDark), s * 1.25, 0.25, z);
  for (const s of [-1, 1]) for (const y of [0.2, 0.42]) add(g, mesh(G.rbox(0.06, 0.06, 1.0, 0.02), C.wood), s * 1.25, y, 0.75);
  return g;
}

// ---------- machines: input tray left, optional second input in front, output tray right ----------
function tray(g, x, z, col) {
  const t = add(g, new THREE.Group(), x, 0, z);
  add(t, mesh(G.rbox(0.9, 0.24, 0.72, 0.06), C.woodLight), 0, 0.12, 0);
  add(t, mesh(G.rbox(0.78, 0.04, 0.6, 0.02), col), 0, 0.24, 0);
  return t;
}
const ACCENT = {
  espresso: '#ff8a6b', latte: '#5aa9ff', mocha: '#8b5a3c', macchiato: '#ffb347', oatlatte: '#9fd86b', seasonal: '#ff7eb6',
};
// an espresso bar: wooden counter with a chrome machine, cups and an accent colour
function espressoBar(g, accent) {
  add(g, mesh(G.rbox(1.7, 0.9, 1.0, 0.08), '#a8693a'), 0, 0.45, -0.2);
  add(g, mesh(G.rbox(1.76, 0.08, 1.06, 0.03), '#e8d9c4'), 0, 0.92, -0.2);
  add(g, mesh(G.rbox(1.0, 0.5, 0.55, 0.08), '#cfd6de'), 0, 1.21, -0.35);
  add(g, mesh(G.rbox(1.02, 0.1, 0.57, 0.04), accent), 0, 1.5, -0.35);
  for (const x of [-0.25, 0.25]) { add(g, mesh(G.cyl(0.05, 0.05, 0.12, 8), '#5b6474'), x, 1.02, -0.05); add(g, mesh(G.cyl(0.07, 0.06, 0.08, 10), '#fbfaf5'), x, 0.98, 0.12); }
  for (let i = 0; i < 3; i++) add(g, mesh(G.cyl(0.06, 0.05, 0.08, 8), '#fbfaf5'), -0.55 + i * 0.12, 1.54, -0.4);
}
export function machine6(kind, two) {
  const g = new THREE.Group();
  g.add(blob(1.8));
  let spin;
  if (ACCENT[kind]) {
    espressoBar(g, ACCENT[kind]);
    spin = add(g, new THREE.Group(), 0.42, 1.62, -0.35);
    for (let i = 0; i < 3; i++) add(spin, mesh(G.sphere(0.08 - i * 0.015, 6, 5), '#ffffff', false), 0, i * 0.14, 0);
    spin.userData.axis = 'steam';
  } else if (kind === 'colddrip') {
    add(g, mesh(G.rbox(1.5, 0.9, 0.9, 0.08), '#a8693a'), 0, 0.45, -0.2);
    for (const x of [-0.45, 0.45]) add(g, mesh(G.rbox(0.08, 1.4, 0.08, 0.03), '#5b3420'), x, 1.6, -0.3);
    add(g, mesh(G.rbox(1.0, 0.08, 0.3, 0.03), '#5b3420'), 0, 2.3, -0.3);
    add(g, mesh(G.sphere(0.2, 10, 8), '#d6f3ff'), 0, 2.05, -0.3);
    add(g, mesh(G.cyl(0.14, 0.14, 0.3, 10), '#cfeeff'), 0, 1.45, -0.3);
    add(g, mesh(G.cyl(0.13, 0.13, 0.2, 10), '#4a2a1c', false), 0, 1.0, -0.3);
    spin = add(g, new THREE.Group(), 0, 1.75, -0.3);
    add(spin, mesh(G.sphere(0.04, 6, 5), '#6b3e26', false), 0, 0, 0);
    spin.userData.axis = 'drip';
  } else if (kind === 'dryer') {
    for (const z of [-0.5, 0.1]) { add(g, mesh(G.rbox(1.7, 0.08, 0.5, 0.03), C.woodDark), 0, 0.55, z); add(g, mesh(G.rbox(1.6, 0.04, 0.42, 0.02), '#c94a3c', false), 0, 0.6, z); }
    for (const [x, z] of [[-0.8, -0.7], [0.8, -0.7], [-0.8, 0.3], [0.8, 0.3]]) add(g, mesh(G.rbox(0.07, 0.55, 0.07, 0.02), C.woodDark), x, 0.27, z);
    add(g, mesh(G.cyl(0.04, 0.04, 1.6, 6), C.woodDark), -0.85, 0.8, -0.2);
    spin = add(g, new THREE.Group(), 0, 1.7, -0.2);
    add(spin, mesh(G.sphere(0.22, 10, 8), '#ffd34a', false), 0, 0, 0);
    spin.userData.axis = 'sun';
  } else if (kind === 'washer') {
    add(g, mesh(G.rbox(1.7, 0.6, 1.1, 0.1), '#c9c2b4'), 0, 0.3, -0.2);
    add(g, mesh(G.rbox(1.5, 0.04, 0.9, 0.04), '#7fd0ea', false, true), 0, 0.61, -0.2);
    add(g, mesh(G.cyl(0.06, 0.06, 0.8, 6), '#6a7382'), -0.7, 0.9, -0.6);
    add(g, mesh(G.rbox(0.1, 0.06, 0.4, 0.02), '#6a7382'), -0.7, 1.3, -0.45);
    spin = add(g, new THREE.Group(), 0.1, 0.65, -0.2);
    for (let i = 0; i < 4; i++) { const p = add(spin, mesh(G.rbox(0.5, 0.05, 0.08, 0.02), '#a8693a'), 0, 0, 0); p.rotation.y = i * Math.PI / 4; }
    spin.userData.axis = 'y';
  } else if (kind === 'roaster') {
    add(g, mesh(G.rbox(1.6, 0.7, 1.0, 0.1), '#5b6474'), 0, 0.35, -0.2);
    spin = add(g, new THREE.Group(), 0, 1.05, -0.2);
    const d = add(spin, mesh(G.cyl(0.42, 0.42, 1.1, 14), '#c96a4a'), 0, 0, 0); d.rotation.z = Math.PI / 2;
    for (let i = 0; i < 4; i++) { const r = add(spin, mesh(G.rbox(1.12, 0.05, 0.05, 0.02), '#8e3e2a'), 0, Math.cos(i * 1.57) * 0.42, Math.sin(i * 1.57) * 0.42); r.userData.k = i; }
    spin.userData.axis = 'x';
    add(g, mesh(G.cyl(0.12, 0.14, 1.4, 8), '#6a7382'), 0.6, 1.6, -0.55);
    add(g, mesh(G.cone(0.25, 0.25, 8), '#ffd34a'), 0, 1.55, -0.2);
  } else if (kind === 'grinder') {
    add(g, mesh(G.rbox(1.4, 0.8, 0.9, 0.1), '#e8d9c4'), 0, 0.4, -0.2);
    add(g, mesh(G.rbox(0.5, 0.5, 0.5, 0.08), '#3a2a22'), 0, 1.05, -0.25);
    add(g, mesh(G.cone(0.32, 0.45, 10), '#cfeeff'), 0, 1.55, -0.25).rotation.x = Math.PI;
    spin = add(g, new THREE.Group(), 0.3, 1.0, 0.05);
    add(spin, mesh(G.cyl(0.08, 0.08, 0.05, 8), '#ff8a6b'), 0, 0, 0).rotation.x = Math.PI / 2;
    add(spin, mesh(G.rbox(0.04, 0.22, 0.04, 0.01), '#ff8a6b'), 0, 0.11, 0.03);
    spin.userData.axis = 'z';
  } else if (kind === 'steamer' || kind === 'oat') {
    const col = kind === 'oat' ? '#f6e7c8' : '#cfd6de';
    add(g, mesh(G.rbox(1.5, 0.85, 1.0, 0.1), kind === 'oat' ? '#9fd86b' : '#5aa9ff'), 0, 0.43, -0.2);
    add(g, mesh(G.cyl(0.4, 0.4, 0.8, 14), col), 0, 1.25, -0.25);
    add(g, mesh(G.sphere(0.4, 14, 8), col), 0, 1.65, -0.25).scale.set(1, 0.4, 1);
    spin = add(g, new THREE.Group(), 0, 1.95, -0.25);
    for (let i = 0; i < 3; i++) add(spin, mesh(G.sphere(0.09 - i * 0.02, 6, 5), '#ffffff', false), 0, i * 0.15, 0);
    spin.userData.axis = 'steam';
  } else if (kind === 'ice') {
    add(g, mesh(G.rbox(1.4, 1.2, 1.0, 0.14), '#9fdcff'), 0, 0.6, -0.2);
    add(g, mesh(G.rbox(1.44, 0.12, 1.04, 0.05), C.white), 0, 1.2, -0.2);
    add(g, mesh(G.rbox(0.9, 0.5, 0.05, 0.06), '#e8f7ff'), 0, 0.6, 0.31);
    spin = add(g, new THREE.Group(), 0, 1.45, -0.2);
    add(spin, mesh(G.rbox(0.2, 0.2, 0.2, 0.04), '#d6f3ff'), 0, 0, 0);
    spin.userData.axis = 'y';
  } else if (kind === 'cocoa') {
    add(g, mesh(G.rbox(1.5, 0.7, 1.0, 0.1), '#8b5a3c'), 0, 0.35, -0.2);
    add(g, mesh(G.cyl(0.42, 0.5, 0.3, 14), '#c98a55'), 0, 0.85, -0.2);
    spin = add(g, new THREE.Group(), 0, 1.1, -0.2);
    add(spin, mesh(G.cyl(0.32, 0.32, 0.18, 12), '#6a7382'), 0, 0, 0);
    add(spin, mesh(G.rbox(0.08, 0.3, 0.08, 0.02), '#5b6474'), 0.22, 0.2, 0);
    spin.userData.axis = 'y';
  } else if (kind === 'syrup') {
    add(g, mesh(G.rbox(1.5, 0.6, 1.0, 0.1), '#c96a4a'), 0, 0.3, -0.2);
    add(g, mesh(G.cyl(0.45, 0.4, 0.45, 14), '#aab4bf'), 0, 0.82, -0.2);
    add(g, mesh(G.cyl(0.4, 0.4, 0.03, 14), '#f2c26b', false, true), 0, 1.04, -0.2);
    spin = add(g, new THREE.Group(), 0, 1.05, -0.2);
    add(spin, mesh(G.cyl(0.025, 0.025, 0.7, 6), '#b8733f'), 0.15, 0.3, 0).rotation.z = 0.4;
    spin.userData.axis = 'y';
  } else if (kind === 'oven') {
    add(g, mesh(G.rbox(1.6, 1.1, 1.1, 0.12), '#e8d9c4'), 0, 0.55, -0.25);
    add(g, mesh(G.cyl(0.6, 0.8, 0.5, 14), '#c96a4a'), 0, 1.35, -0.25);
    add(g, mesh(G.rbox(0.8, 0.45, 0.06, 0.1), '#3a2a22'), 0, 0.55, 0.32);
    add(g, mesh(G.rbox(0.6, 0.25, 0.02, 0.06), '#ffb347', false), 0, 0.55, 0.36);
    add(g, mesh(G.cyl(0.1, 0.12, 0.7, 8), '#6a7382'), 0.4, 1.8, -0.45);
    spin = add(g, new THREE.Group(), 0.4, 2.25, -0.45);
    for (let i = 0; i < 3; i++) add(spin, mesh(G.sphere(0.1 - i * 0.02, 6, 5), '#eeeeee', false), 0, i * 0.16, 0);
    spin.userData.axis = 'steam';
  } else if (kind === 'tiramisu') {
    add(g, mesh(G.rbox(1.6, 0.9, 1.0, 0.1), '#fbfaf5'), 0, 0.45, -0.2);
    add(g, mesh(G.rbox(1.5, 0.5, 0.8, 0.08), '#cfeeff'), 0, 1.15, -0.25);
    add(g, mesh(G.rbox(1.3, 0.08, 0.6, 0.03), '#6b3e26', false), 0, 1.05, -0.25);
    spin = add(g, new THREE.Group(), 0, 1.5, -0.25);
    add(spin, mesh(G.sphere(0.1, 8, 6), '#8b5a3c'), 0, 0, 0).scale.set(1.4, 0.4, 1);
    spin.userData.axis = 'y';
  } else if (kind === 'tea') {
    // 紅茶機: a green rolling drum on a wooden base
    add(g, mesh(G.rbox(1.6, 0.6, 1.0, 0.1), '#a8693a'), 0, 0.3, -0.2);
    spin = add(g, new THREE.Group(), 0, 0.95, -0.2);
    const d = add(spin, mesh(G.cyl(0.38, 0.38, 1.1, 14), '#59a14f'), 0, 0, 0); d.rotation.z = Math.PI / 2;
    for (let i = 0; i < 4; i++) add(spin, mesh(G.rbox(1.12, 0.05, 0.05, 0.02), '#3f7f3a'), 0, Math.cos(i * 1.57) * 0.38, Math.sin(i * 1.57) * 0.38);
    spin.userData.axis = 'x';
    add(g, mesh(G.cyl(0.2, 0.25, 0.3, 10), '#b5462a'), 0.55, 1.45, -0.55);
  } else if (kind === 'matcha') {
    // 抹茶石臼: two grey millstones, the top one turning, on a low table
    add(g, mesh(G.rbox(1.5, 0.55, 1.0, 0.1), '#c98a55'), 0, 0.28, -0.2);
    add(g, mesh(G.cyl(0.5, 0.55, 0.25, 16), '#9aa3ad'), 0, 0.68, -0.2);
    spin = add(g, new THREE.Group(), 0, 0.95, -0.2);
    add(spin, mesh(G.cyl(0.45, 0.45, 0.28, 16), '#b8c0c8'), 0, 0, 0);
    add(spin, mesh(G.cyl(0.04, 0.04, 0.45, 6), '#8b5a3c'), 0.32, 0.3, 0);
    add(spin, mesh(G.cyl(0.18, 0.18, 0.02, 12), '#3f8f4a', false), 0, 0.15, 0);
    spin.userData.axis = 'y';
  } else if (kind === 'cake') {
    // 草莓蛋糕台: a pink pastry counter with a turning cake on top
    add(g, mesh(G.rbox(1.6, 0.9, 1.0, 0.1), '#ff9fbf'), 0, 0.45, -0.2);
    add(g, mesh(G.rbox(1.64, 0.08, 1.04, 0.03), '#fbfaf5'), 0, 0.92, -0.2);
    spin = add(g, new THREE.Group(), 0, 1.0, -0.25);
    add(spin, mesh(G.cyl(0.36, 0.36, 0.3, 16), '#fff4e2'), 0, 0.15, 0);
    add(spin, mesh(G.cyl(0.37, 0.37, 0.06, 16), '#ff9fb0'), 0, 0.3, 0);
    for (let i = 0; i < 6; i++) add(spin, mesh(G.sphere(0.06, 7, 5), '#ff4b5c'), Math.cos(i * 1.05) * 0.26, 0.38, Math.sin(i * 1.05) * 0.26);
    spin.userData.axis = 'y';
  } else if (kind === 'waffle') {
    // 鬆餅機: a black waffle iron that opens and shuts
    add(g, mesh(G.rbox(1.6, 0.85, 1.0, 0.1), '#ffd34a'), 0, 0.43, -0.2);
    add(g, mesh(G.rbox(0.9, 0.14, 0.7, 0.08), '#3a3f48'), 0, 0.93, -0.25);
    add(g, mesh(G.cyl(0.3, 0.3, 0.02, 16), '#e8a548', false), 0, 1.01, -0.25);
    spin = add(g, new THREE.Group(), 0, 1.0, -0.6);
    add(spin, mesh(G.rbox(0.9, 0.12, 0.7, 0.08), '#3a3f48'), 0, 0.06, 0.35);
    add(spin, mesh(G.rbox(0.12, 0.08, 0.3, 0.03), '#ff8a6b'), 0, 0.1, 0.75);
    spin.userData.axis = 'lid';
  } else if (kind === 'choco') {
    // 巧克力工坊: a copper pot of melted chocolate with a stirring paddle, molds on the side
    add(g, mesh(G.rbox(1.6, 0.6, 1.0, 0.1), '#8b5a3c'), 0, 0.3, -0.2);
    add(g, mesh(G.cyl(0.45, 0.38, 0.5, 14), '#d9883a'), -0.15, 0.85, -0.25);
    add(g, mesh(G.cyl(0.4, 0.4, 0.03, 14), '#5b3420', false, true), -0.15, 1.08, -0.25);
    for (let i = 0; i < 3; i++) add(g, mesh(G.rbox(0.18, 0.06, 0.3, 0.02), '#ff5a8a'), 0.55, 0.64, -0.5 + i * 0.3);
    spin = add(g, new THREE.Group(), -0.15, 1.1, -0.25);
    add(spin, mesh(G.cyl(0.025, 0.025, 0.7, 6), '#c98a55'), 0.15, 0.3, 0).rotation.z = 0.4;
    spin.userData.axis = 'y';
  } else {
    // 手沖台: a wooden bar with a gooseneck kettle pouring over a dripper
    add(g, mesh(G.rbox(1.6, 0.9, 1.0, 0.08), '#c98a55'), 0, 0.45, -0.2);
    add(g, mesh(G.rbox(1.66, 0.06, 1.06, 0.03), '#5b3420'), 0, 0.92, -0.2);
    add(g, mesh(G.sphere(0.13, 10, 8), '#d6f3ff'), -0.1, 1.08, -0.25);
    add(g, mesh(G.cone(0.13, 0.16, 12), '#fbfaf5'), -0.1, 1.28, -0.25).rotation.x = Math.PI;
    spin = add(g, new THREE.Group(), 0.35, 1.2, -0.25);
    add(spin, mesh(G.cyl(0.12, 0.14, 0.22, 10), '#3a2a22'), 0, 0, 0);
    const n = add(spin, mesh(G.cyl(0.015, 0.02, 0.35, 5), '#3a2a22'), -0.18, 0.08, 0); n.rotation.z = 1.0;
    spin.userData.axis = 'pour';
  }
  spin.userData.dyn = true;
  const inTray = tray(g, -1.2, 0.75, '#f6dd8a');
  const outTray = tray(g, 1.2, 0.75, '#cfe9ff');
  const in2Tray = two ? tray(g, 0, 0.95, '#fff1c4') : null;
  return { g, inTray, in2Tray, outTray, spin };
}

// ---------- decor ----------
export function parasolTable(col) {
  const g = new THREE.Group();
  g.add(blob(1.0));
  add(g, mesh(G.cyl(0.4, 0.4, 0.05, 14), '#fbfaf5'), 0, 0.7, 0);
  add(g, mesh(G.cyl(0.04, 0.04, 2.0, 6), '#8f969f'), 0, 1.0, 0);
  add(g, mesh(G.cone(1.0, 0.45, 10), col), 0, 2.1, 0);
  return g;
}
export function stringLights(x0, z0, x1, z1, h = 2.6) {
  const g = new THREE.Group();
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, z1 - z0) / 0.8));
  const cols = ['#ffd34a', '#ff8a6b', '#9fd86b', '#5aa9ff'];
  for (let i = 0; i <= n; i++) {
    const k = i / n, sag = Math.sin(k * Math.PI) * 0.35;
    const b = new THREE.Mesh(G.sphere(0.07, 6, 5), new THREE.MeshBasicMaterial({ color: cols[i % 4] }));
    b.position.set(x0 + (x1 - x0) * k, h - sag, z0 + (z1 - z0) * k); g.add(b);
  }
  return g;
}
export function terraceHill(w, steps) {
  // stepped green terraces with rows of coffee shrubs (decor beyond the east edge)
  const g = new THREE.Group();
  for (let i = 0; i < steps; i++) {
    add(g, mesh(G.rbox(w, 0.6, 3.2, 0.1), i % 2 ? '#7cc45a' : '#86cf60', false, true), 0, 0.3 + i * 0.6, -i * 0.01).position.x = i * 3.0;
    add(g, mesh(G.rbox(0.25, 0.62, w * 0.0 + 3.3, 0.06), '#c9c2b4', false, true), i * 3.0 - 1.5, 0.3 + i * 0.6, 0);
  }
  return g;
}
export function photoWall() {
  const g = new THREE.Group();
  g.add(blob(1.4));
  add(g, mesh(G.rbox(2.4, 1.8, 0.15, 0.06), '#ff9fbf'), 0, 1.2, 0);
  add(g, mesh(G.rbox(1.8, 1.2, 0.02, 0.06), '#fff3dd', false), 0, 1.25, 0.08);
  add(g, mesh(G.sphere(0.35, 12, 8), '#ff7eb6', false), 0, 1.3, 0.1).scale.set(1, 1, 0.2);
  for (const x of [-1.0, 1.0]) add(g, mesh(G.rbox(0.1, 2.1, 0.1, 0.03), '#c96a4a'), x, 1.05, -0.1);
  add(g, mesh(G.cyl(0.04, 0.04, 1.4, 6), '#3a2a22'), 0.4, 0.7, 1.2);
  add(g, mesh(G.rbox(0.25, 0.18, 0.18, 0.04), '#3a2a22'), 0.4, 1.45, 1.2);
  return g;
}
export function scooter() {
  const g = new THREE.Group();
  g.add(blob(0.9));
  add(g, mesh(G.rbox(1.2, 0.3, 0.4, 0.12), '#ff8a6b'), 0, 0.45, 0);
  for (const x of [-0.45, 0.45]) add(g, mesh(G.cyl(0.2, 0.2, 0.12, 12), '#3a2a22'), x, 0.2, 0).rotation.x = Math.PI / 2;
  add(g, mesh(G.rbox(0.5, 0.45, 0.45, 0.06), '#ffd34a'), -0.35, 0.85, 0);
  add(g, mesh(G.rbox(0.06, 0.5, 0.06, 0.02), '#5b6474'), 0.5, 0.8, 0);
  add(g, mesh(G.rbox(0.06, 0.06, 0.5, 0.02), '#5b6474'), 0.5, 1.05, 0);
  return g;
}
export function judgeDesk() {
  const g = new THREE.Group();
  g.add(blob(1.3));
  add(g, mesh(G.rbox(2.0, 0.8, 0.7, 0.08), '#fbfaf5'), 0, 0.4, 0);
  add(g, mesh(G.rbox(2.04, 0.12, 0.74, 0.04), '#ffd34a'), 0, 0.8, 0);
  add(g, mesh(G.rbox(1.2, 0.3, 0.04, 0.04), '#ff7eb6'), 0, 0.5, 0.36);
  const cup = add(g, new THREE.Group(), 0, 0.95, 0);
  add(cup, mesh(G.cyl(0.12, 0.08, 0.2, 10), '#ffd34a'), 0, 0.1, 0);
  add(cup, mesh(G.cyl(0.03, 0.03, 0.1, 6), '#ffd34a'), 0, -0.02, 0);
  return g;
}

// ---------- the café shop (山城咖啡屋): brick walls, wooden wall shelves, glass pastry cases, the coffee bar ----------
// palette: walnut and oak browns, cream, sage green and terracotta
export const CAFE = {
  walnut: '#6b4a35', oak: '#b98352', honey: '#d9a066', cream: '#f4e6cf', sage: '#8fae7e', sageDark: '#6f8f61',
  terra: '#c8693f', brick: '#b65e3f', chalk: '#2f3b33', brass: '#d4a64a', iron: '#3a3330', marble: '#efe6da',
};
const W_ = CAFE;
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
// a mesh with its own (textured) material that still gets the cartoon outline
function texMesh(geo, mat, cast = true) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true;
  if (cast && OUTLINE > 0) { const o = new THREE.Mesh(geo, outlineMat(OUTLINE)); o.userData.outline = true; m.add(o); }
  return m;
}
// warm red-brown bricks with cream mortar; one material per wall size so the bricks keep their size
let brickBase = null;
const brickMats = new Map();
export function brickMat(w, h) {
  const key = w.toFixed(2) + 'x' + h.toFixed(2);
  let m = brickMats.get(key);
  if (m) return m;
  if (!brickBase) {
    brickBase = canvasTex(256, 128, (x, cw, ch) => {
      x.fillStyle = '#ead8bf'; x.fillRect(0, 0, cw, ch);
      const cols = ['#b65e3f', '#a9553a', '#c06a48', '#b86244', '#a85a3e'];
      for (let r = 0; r < 4; r++) for (let i = -1; i < 4; i++) {
        const bx = i * 64 + (r % 2 ? 32 : 0) + 3, by = r * 32 + 3;
        x.fillStyle = cols[(r * 3 + i + 5) % cols.length]; x.fillRect(bx, by, 58, 26);
      }
    });
  }
  const t = brickBase.clone(); t.needsUpdate = true;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(Math.max(1, w / 1.3), Math.max(1, h / 0.52));
  m = new THREE.MeshLambertMaterial({ map: t }); brickMats.set(key, m);
  return m;
}
export function brickWall(w, h, d) { return texMesh(G.rbox(w, h, d, 0.05), brickMat(Math.max(w, d), h)); }

// tall wooden wall shelf: a cabinet base and 3 boards (4 when it is a big display) with goods standing on them
export function wallShelf(big) {
  const g = new THREE.Group();
  g.add(blob(1.2));
  const W = 1.7, D = 0.86, nb = big ? 4 : 3, step = 0.48, H = 0.5 + nb * step;
  add(g, mesh(G.rbox(W, 0.5, D, 0.06), W_.walnut), 0, 0.25, 0);
  for (const x of [-0.42, 0.42]) {
    add(g, mesh(G.rbox(0.74, 0.3, 0.04, 0.03), W_.oak), x, 0.25, D / 2);
    add(g, mesh(G.cyl(0.03, 0.03, 0.05, 8), W_.brass), x, 0.25, D / 2 + 0.03).rotation.x = Math.PI / 2;
  }
  add(g, mesh(G.rbox(W, H, 0.1, 0.04), W_.oak), 0, H / 2, -D / 2 + 0.05);
  for (const s of [-1, 1]) add(g, mesh(G.rbox(0.08, H, D, 0.03), W_.walnut), s * (W / 2 - 0.04), H / 2, 0);
  for (let i = 1; i < nb; i++) add(g, mesh(G.rbox(W - 0.1, 0.05, D - 0.08, 0.02), W_.honey), 0, 0.5 + i * step, 0.02);
  add(g, mesh(G.rbox(W + 0.1, 0.1, D + 0.06, 0.04), W_.walnut), 0, H + 0.05, 0);
  // a few glass jars of beans on the crown
  for (const [x, c] of [[-0.6, '#6b4a35'], [0.6, '#c8693f']]) {
    add(g, mesh(G.cyl(0.1, 0.1, 0.22, 10), '#e7f3f6'), x, H + 0.21, 0);
    add(g, mesh(G.cyl(0.085, 0.085, 0.12, 10), c, false), x, H + 0.16, 0);
    add(g, mesh(G.cyl(0.11, 0.11, 0.04, 10), W_.walnut), x, H + 0.34, 0);
  }
  if (big) {
    // the bigger display: a brass rail with little lamps along the top board
    add(g, mesh(G.cyl(0.02, 0.02, W - 0.2, 6), W_.brass), 0, H - 0.06, D / 2 - 0.05).rotation.z = Math.PI / 2;
    for (const x of [-0.55, 0, 0.55]) add(g, new THREE.Mesh(G.sphere(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff3a6' })), x, H - 0.12, D / 2 - 0.05);
  }
  const slots = [];
  for (let layer = 0; layer < 2; layer++) for (let i = 0; i < nb; i++) for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
    slots.push(new THREE.Vector3(-0.62 + c * 0.31, 0.53 + i * step + layer * 0.16, -0.18 + r * 0.32));
  }
  return { g, slots, top: H + 0.1 };
}
// glass pastry case on a wooden base (cakes, cold coffee, milk): 2 glass tiers (3 when it is a big display)
const caseGlass = new THREE.MeshLambertMaterial({ color: '#dff4ff', transparent: true, opacity: 0.28, depthWrite: false });
export function vitrine(big) {
  const g = new THREE.Group();
  g.add(blob(1.2));
  const W = 1.7, D = 0.9, nt = big ? 3 : 2, step = 0.36, H = 0.55 + nt * step + 0.06;
  add(g, mesh(G.rbox(W, 0.55, D, 0.06), W_.walnut), 0, 0.275, 0);
  add(g, mesh(G.rbox(W - 0.2, 0.32, 0.04, 0.03), W_.terra), 0, 0.27, D / 2);
  add(g, mesh(G.rbox(W, 0.06, D, 0.03), W_.cream), 0, 0.55, 0);
  for (let i = 1; i < nt; i++) add(g, new THREE.Mesh(G.rbox(W - 0.12, 0.03, D - 0.12, 0.01), caseGlass), 0, 0.55 + i * step, 0);
  const gh = H - 0.58;
  for (const s of [-1, 1]) add(g, new THREE.Mesh(G.rbox(W - 0.08, gh, 0.03, 0.01), caseGlass), 0, 0.58 + gh / 2, s * (D / 2 - 0.03));
  for (const s of [-1, 1]) add(g, new THREE.Mesh(G.rbox(0.03, gh, D - 0.08, 0.01), caseGlass), s * (W / 2 - 0.03), 0.58 + gh / 2, 0);
  add(g, new THREE.Mesh(G.rbox(W - 0.04, 0.03, D - 0.04, 0.01), caseGlass), 0, H, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(g, mesh(G.rbox(0.05, gh + 0.04, 0.05, 0.02), W_.walnut), sx * (W / 2 - 0.03), 0.58 + gh / 2, sz * (D / 2 - 0.03));
  add(g, mesh(G.rbox(W + 0.04, 0.06, D + 0.04, 0.03), W_.walnut), 0, H + 0.02, 0);
  const slots = [];
  for (let layer = 0; layer < 2; layer++) for (let i = 0; i < nt; i++) for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
    slots.push(new THREE.Vector3(-0.6 + c * 0.3, 0.6 + i * step + layer * 0.14, -0.17 + r * 0.34));
  }
  return { g, slots, top: H + 0.05 };
}
// the coffee bar: walnut bar with oak slats in front, a marble top, an espresso machine, a pastry dome and the register;
// the money tray sits at the right end (x +0.95)
export function cafeBar() {
  const g = new THREE.Group();
  g.add(blob(1.8));
  add(g, mesh(G.rbox(2.8, 0.95, 1.0, 0.08), W_.walnut), 0, 0.48, 0);
  for (let i = 0; i < 9; i++) add(g, mesh(G.rbox(0.26, 0.78, 0.05, 0.02), i % 2 ? W_.oak : W_.honey), -1.2 + i * 0.3, 0.47, 0.51);
  add(g, mesh(G.rbox(2.95, 0.08, 1.12, 0.04), W_.marble), 0, 1.0, 0);
  const em = add(g, new THREE.Group(), -0.82, 1.04, -0.1);
  add(em, mesh(G.rbox(0.66, 0.44, 0.44, 0.06), '#c9cfd6'), 0, 0.22, 0);
  add(em, mesh(G.rbox(0.68, 0.07, 0.46, 0.03), W_.terra), 0, 0.46, 0);
  for (const x of [-0.16, 0.16]) { add(em, mesh(G.cyl(0.05, 0.05, 0.1, 8), '#5b6474'), x, 0.1, 0.24); add(em, mesh(G.cyl(0.06, 0.05, 0.07, 10), W_.cream), x, 0.0, 0.3); }
  for (let i = 0; i < 3; i++) add(em, mesh(G.cyl(0.05, 0.04, 0.06, 8), W_.cream), -0.2 + i * 0.2, 0.53, -0.08);
  // glass dome with pastries
  add(g, mesh(G.cyl(0.26, 0.26, 0.03, 16), W_.cream), 0.05, 1.06, 0.05);
  for (const [x, z] of [[-0.06, 0], [0.12, 0.08], [0.06, -0.1]]) add(g, mesh(G.sphere(0.08, 8, 6), '#e9b25e'), 0.05 + x, 1.11, 0.05 + z).scale.set(1.4, 0.6, 0.8);
  const dome = add(g, new THREE.Mesh(G.sphere(0.25, 14, 8), caseGlass), 0.05, 1.08, 0.05); dome.scale.set(1, 0.9, 1);
  // register
  const reg = add(g, new THREE.Group(), 0.5, 1.04, -0.15);
  add(reg, mesh(G.rbox(0.36, 0.2, 0.32, 0.05), W_.iron), 0, 0.1, 0);
  add(reg, mesh(G.rbox(0.32, 0.22, 0.05, 0.03), '#4a4f5a'), 0, 0.28, -0.08).rotation.x = -0.35;
  // money tray
  add(g, mesh(G.rbox(0.66, 0.03, 0.66, 0.02), W_.oak, false), 0.95, 1.055, 0.05);
  return g;
}
// back bar against the wall behind the baristas: a low cabinet, open shelves of cups and two menu chalkboards
function chalk(x, cw, ch, title, rows) {
  x.fillStyle = W_.chalk; x.fillRect(0, 0, cw, ch);
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = '#ffe9a8'; x.font = '900 34px "PingFang TC","Microsoft JhengHei",sans-serif'; x.fillText(title, cw / 2, 30);
  x.fillStyle = '#f4f1ea'; x.font = '700 24px "PingFang TC","Microsoft JhengHei",sans-serif';
  rows.forEach((r, i) => x.fillText(r, cw / 2, 70 + i * 30));
  x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 3; x.strokeRect(8, 8, cw - 16, ch - 16);
}
export function menuBoard(title, rows, w = 1.5, h = 1.0) {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(w + 0.12, h + 0.12, 0.08, 0.03), W_.walnut), 0, 0, 0);
  const t = canvasTex(256, 64 + rows.length * 30 + 40, (x, cw, ch) => chalk(x, cw, ch, title, rows));
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: t }));
  f.position.z = 0.045; g.add(f);
  return g;
}
export function backBar(w) {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(w, 1.0, 0.4, 0.05), W_.walnut), 0, 0.5, 0);
  add(g, mesh(G.rbox(w + 0.04, 0.06, 0.44, 0.03), W_.marble), 0, 1.02, 0);
  for (const s of [-1, 1]) add(g, mesh(G.rbox(0.08, 1.2, 0.3, 0.03), W_.oak), s * (w / 2 - 0.06), 1.62, -0.03);
  for (const y of [1.45, 1.85]) add(g, mesh(G.rbox(w - 0.1, 0.05, 0.3, 0.02), W_.honey), 0, y, -0.03);
  const cups = [W_.cream, W_.terra, W_.sage, W_.cream];
  for (let i = 0; i < Math.floor((w - 0.4) / 0.28); i++) {
    add(g, mesh(G.cyl(0.07, 0.055, 0.12, 8), cups[i % 4]), -w / 2 + 0.3 + i * 0.28, 1.54, 0);
    if (i % 2 === 0) add(g, mesh(G.cyl(0.07, 0.07, 0.2, 8), '#e7f3f6'), -w / 2 + 0.3 + i * 0.28, 1.98, 0);
  }
  const m1 = menuBoard('咖啡 MENU', ['美式 · 拿鐵', '卡布奇諾 · 摩卡', '手沖精品豆'], 1.5, 0.9);
  m1.position.set(-w / 4, 2.6, 0.02); g.add(m1);
  const m2 = menuBoard('今日甜點', ['可頌 · 起司蛋糕', '提拉米蘇', '外帶咖啡豆'], 1.5, 0.9);
  m2.position.set(w / 4, 2.6, 0.02); g.add(m2);
  return g;
}
// round marble bistro table on an iron foot with two bentwood chairs (seats like the dining tables: z ±0.95)
export function bistroTable(top = W_.marble) {
  const g = new THREE.Group();
  g.add(blob(1.1));
  add(g, mesh(G.cyl(0.24, 0.3, 0.05, 14), W_.iron), 0, 0.03, 0);
  add(g, mesh(G.cyl(0.05, 0.05, 0.72, 8), W_.iron), 0, 0.4, 0);
  add(g, mesh(G.cyl(0.56, 0.56, 0.06, 22), top), 0, 0.78, 0);
  add(g, mesh(G.cyl(0.565, 0.565, 0.025, 22), W_.walnut), 0, 0.745, 0);
  const seats = [];
  for (const s of [-1, 1]) {
    const ch = add(g, new THREE.Group(), 0, 0, s * 0.95);
    add(ch, mesh(G.cyl(0.23, 0.23, 0.07, 14), W_.walnut), 0, 0.44, 0);
    add(ch, mesh(G.cyl(0.18, 0.18, 0.02, 14), W_.sage, false), 0, 0.48, 0);
    add(ch, mesh(G.rbox(0.44, 0.34, 0.06, 0.03), W_.walnut), 0, 0.74, s * 0.21);
    add(ch, mesh(G.rbox(0.36, 0.05, 0.07, 0.02), W_.oak), 0, 0.63, s * 0.21);
    for (const [x, z] of [[-0.15, -0.14], [0.15, -0.14], [-0.15, 0.14], [0.15, 0.14]]) add(ch, mesh(G.cyl(0.025, 0.025, 0.42, 6), W_.walnut), x, 0.21, z);
    seats.push({ x: 0, z: s * 0.95, face: s < 0 ? 0 : Math.PI, dish: new THREE.Vector3(0, 0.82, s * 0.28) });
  }
  // a little candle jar in the middle
  add(g, mesh(G.cyl(0.05, 0.05, 0.08, 8), '#ffe9b0'), 0, 0.85, 0);
  return { g, seats };
}
// pendant lamp hanging from a beam: brass cord, a terracotta shade and a warm bulb; lit(true/false)
const bulbOn = new THREE.MeshBasicMaterial({ color: '#fff1b0' }), bulbOff = new THREE.MeshLambertMaterial({ color: '#e8dcc4' });
export function pendantLamp(drop = 0.7, col = W_.terra) {
  const g = new THREE.Group();
  add(g, mesh(G.cyl(0.012, 0.012, drop, 4), W_.iron, false), 0, -drop / 2, 0);
  add(g, mesh(G.cone(0.2, 0.2, 14), col), 0, -drop - 0.06, 0);
  const b = new THREE.Mesh(G.sphere(0.08, 10, 8), bulbOff); b.position.y = -drop - 0.18; g.add(b);
  return { g, lit(on) { b.material = on ? bulbOn : bulbOff; } };
}
// burlap coffee sacks, one open with green beans on top
export function beanSacks() {
  const g = new THREE.Group();
  g.add(blob(0.8));
  const sack = (x, z, ry, s) => {
    const k = add(g, new THREE.Group(), x, 0, z); k.rotation.y = ry; k.scale.setScalar(s);
    add(k, mesh(G.rbox(0.5, 0.62, 0.38, 0.16), '#c9a77a'), 0, 0.31, 0);
    add(k, mesh(G.rbox(0.52, 0.06, 0.4, 0.03), '#9a7650'), 0, 0.5, 0);
    add(k, mesh(G.rbox(0.26, 0.16, 0.02, 0.02), W_.terra, false), 0, 0.3, 0.2);
    return k;
  };
  sack(-0.22, 0.05, 0.2, 1);
  sack(0.28, -0.08, -0.25, 0.92);
  const o = sack(0.05, 0.3, 0.05, 0.85);
  add(o, mesh(G.sphere(0.2, 10, 6), '#7f9a55', false), 0, 0.62, 0).scale.set(1, 0.35, 0.8);
  return g;
}
// A-frame chalkboard stand for the pavement
export function aFrame(title, rows) {
  const g = new THREE.Group();
  g.add(blob(0.5));
  const t = canvasTex(256, 320, (x, cw, ch) => chalk(x, cw, ch, title, rows));
  const mat = new THREE.MeshLambertMaterial({ map: t });
  for (const s of [-1, 1]) {
    const p = add(g, new THREE.Group(), 0, 0, s * 0.2); p.rotation.x = -s * 0.22;
    add(p, mesh(G.rbox(0.72, 1.0, 0.05, 0.03), W_.walnut), 0, 0.55, 0);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.85), mat); f.position.set(0, 0.57, s * 0.03); f.rotation.y = s > 0 ? 0 : Math.PI; p.add(f);
  }
  return g;
}
// potted plant: terracotta pot with a bushy fiddle-leaf plant
export function pottedPlant(h = 1.0) {
  const g = new THREE.Group();
  g.add(blob(0.45));
  add(g, mesh(G.cyl(0.26, 0.19, 0.4, 12), W_.terra), 0, 0.2, 0);
  add(g, mesh(G.cyl(0.27, 0.27, 0.06, 12), '#b55a34'), 0, 0.4, 0);
  add(g, mesh(G.cyl(0.03, 0.03, h * 0.6, 6), '#7a5a3a'), 0, 0.4 + h * 0.3, 0);
  const lf = [[0, h * 0.95, 0, 0.3], [0.18, h * 0.75, 0.08, 0.24], [-0.17, h * 0.7, -0.06, 0.25], [0.05, h * 0.55, 0.18, 0.22], [-0.08, h * 0.85, 0.15, 0.2]];
  lf.forEach(([x, y, z, r], i) => add(g, mesh(G.sphere(r, 10, 7), i % 2 ? '#5f9a52' : '#78b35f'), x, 0.4 + y * 0.6, z).scale.set(1, 0.75, 1));
  return g;
}
// shop sign with a coffee cup drawn on the left of the name
export function cafeSign(text, w = 4, col = W_.walnut) {
  const g = new THREE.Group();
  const t = canvasTex(512, 128, (x, cw, ch) => {
    x.fillStyle = col; x.fillRect(0, 0, cw, ch);
    x.strokeStyle = '#f4e6cf'; x.lineWidth = 6; x.strokeRect(8, 8, cw - 16, ch - 16);
    // cup: body, handle, saucer and steam
    x.fillStyle = '#f4e6cf';
    x.beginPath(); x.moveTo(30, 46); x.lineTo(92, 46); x.quadraticCurveTo(90, 100, 61, 100); x.quadraticCurveTo(32, 100, 30, 46); x.fill();
    x.lineWidth = 7; x.beginPath(); x.arc(94, 64, 12, -Math.PI / 2, Math.PI / 2); x.stroke();
    x.fillRect(22, 102, 80, 7);
    x.lineWidth = 4; for (const sx of [48, 64, 80]) { x.beginPath(); x.moveTo(sx, 40); x.quadraticCurveTo(sx - 8, 30, sx, 22); x.stroke(); }
    x.fillStyle = '#ffffff'; x.font = '900 ' + (text.length > 5 ? 58 : 70) + 'px "PingFang TC","Microsoft JhengHei",sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 300, 68);
  });
  add(g, mesh(G.rbox(w + 0.2, 1.1, 0.16, 0.08), W_.cream), 0, 0, 0);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.0), new THREE.MeshLambertMaterial({ map: t }));
  face.position.z = 0.085; g.add(face);
  return g;
}
// wooden double door with glass panes that swings inwards (-z); open(k) 0..1
export function cafeDoor(w = 2.2) {
  const g = new THREE.Group();
  add(g, mesh(G.rbox(w + 0.5, 0.2, 0.32, 0.05), W_.walnut), 0, 1.62, 0);
  for (const s of [-1, 1]) add(g, mesh(G.rbox(0.16, 1.62, 0.32, 0.04), W_.walnut), s * (w / 2 + 0.17), 0.81, 0);
  const leaves = [];
  for (const s of [-1, 1]) {
    const hinge = add(g, new THREE.Group(), s * w / 2, 0, 0); hinge.userData.dyn = true;
    const lw = w / 2 - 0.04, cx = -s * lw / 2;
    add(hinge, mesh(G.rbox(lw, 0.36, 0.07, 0.03), W_.oak), cx, 0.24, 0);
    add(hinge, mesh(G.rbox(lw, 0.1, 0.07, 0.03), W_.oak), cx, 1.46, 0);
    for (const e of [-1, 1]) add(hinge, mesh(G.rbox(0.08, 1.45, 0.07, 0.03), W_.oak), cx + e * (lw / 2 - 0.04), 0.76, 0);
    add(hinge, new THREE.Mesh(G.rbox(lw - 0.12, 1.0, 0.03, 0.01), caseGlass), cx, 0.93, 0);
    add(hinge, mesh(G.rbox(0.05, 0.22, 0.05, 0.02), W_.brass), -s * (lw - 0.12), 0.85, 0.06);
    leaves.push({ hinge, s });
  }
  return { g, open(k) { for (const L of leaves) L.hinge.rotation.y = L.s * -k * 1.35; } };
}
