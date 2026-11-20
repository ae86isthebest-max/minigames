// 離線用：第一次開啟就把所有檔案存起來。
// 網頁本身（HTML）改成「先連網路」：有網路就一定拿到最新版，沒網路才用存起來的舊版。
const CACHE = 'detective-tw-v119';
const FILES = ['./', 'index.html', 'arc.js', 'arc_data.js', 'pixel.js', 'cases.js', 'case2.js', 'case2_people.js', 'case2_people2.js', 'case2_people3.js', 'case2_items.js', 'case2_art.js', 'case1_art.js', 'world.js', 'worldkit.js', 'case2_world.js', 'case1_world.js', 'sprite2.js', 'topdown.js', 'topkit.js', 'topplay.js', 'case1_top.js', 'case2_top.js', 'case3.js', 'case3_people.js', 'case3_people2.js', 'case3_items.js', 'case3_records.js', 'case3_art.js', 'case3_world.js', 'topep.js', 'case3_top.js', 'case4.js', 'case4_people.js', 'case4_people2.js', 'case4_items.js', 'case4_records.js', 'case4_art.js', 'case4_world.js', 'case4_top.js', 'case5.js', 'case5_items.js', 'case5_art.js', 'case5_top.js', 'case6.js', 'case6_items.js', 'case6_art.js', 'case6_top.js', 'case7.js', 'case7_items.js', 'case7_art.js', 'case7_top.js', 'case8.js', 'case8_items.js', 'case8_art.js', 'case8_top.js', 'case9.js', 'case9_items.js', 'case9_art.js', 'case9_top.js', 'case10.js', 'case10_items.js', 'case10_art.js', 'case10_top.js', 'case11.js', 'case11_items.js', 'case11_art.js', 'case11_top.js', 'case12.js', 'case12_items.js', 'case12_art.js', 'case12_top.js','case13.js','case13_items.js','case13_art.js', 'case13_top.js','case14.js','case14_items.js','case14_art.js', 'case14_top.js','case15.js','case15_items.js','case15_art.js', 'case15_top.js','case16.js','case16_items.js','case16_art.js','case17.js','case17_items.js','case17_art.js','case18.js','case18_items.js','case18_art.js','case19.js','case19_items.js','case19_art.js','case20.js','case20_items.js','case20_art.js','case21.js','case21_items.js','case21_art.js','case22.js','case22_items.js','case22_art.js','case23.js','case23_items.js','case23_art.js','case24.js','case24_items.js','case24_art.js','case25.js','case25_items.js','case25_art.js','case26.js','case26_items.js','case26_art.js', 'case27.js', 'case27_items.js', 'case27_art.js', 'case28.js', 'case28_items.js', 'case28_art.js', 'case29.js', 'case29_items.js', 'case29_art.js', 'case30.js', 'case30_items.js', 'case30_art.js', 'case31.js', 'case31_items.js', 'case31_art.js', 'case32.js', 'case32_items.js', 'case32_art.js', 'case33.js', 'case33_items.js', 'case33_art.js', 'case34.js', 'case34_items.js', 'case34_art.js', 'case35.js', 'case35_items.js', 'case35_art.js', 'case36.js', 'case36_items.js', 'case36_art.js', 'case37.js', 'case37_items.js', 'case37_art.js', 'case38.js', 'case38_items.js', 'case38_art.js', 'case39.js', 'case39_items.js', 'case39_art.js', 'case40.js', 'case40_items.js', 'case40_art.js', 'case41.js', 'case41_items.js', 'case41_art.js', 'case42.js', 'case42_items.js', 'case42_art.js', 'case43.js', 'case43_items.js', 'case43_art.js', 'case44.js', 'case44_items.js', 'case44_art.js', 'case45.js', 'case45_items.js', 'case45_art.js', 'case46.js', 'case46_items.js', 'case46_art.js', 'case47.js', 'case47_items.js', 'case47_art.js', 'case48.js', 'case48_items.js', 'case48_art.js', 'case49.js', 'case49_items.js', 'case49_art.js', 'case50.js', 'case50_items.js', 'case50_art.js', 'cafe.js', 'topscene.js', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(new Request(f, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => (k.startsWith('detective-tw-') || k === 'detective-v1') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // 廣東話版 /detective/hk/ 有自己的 service worker，不在這裡處理
  if (url.pathname.includes('/detective/hk/')) return;
  const isPage = e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('/');
  e.respondWith(caches.open(CACHE).then(c => {
    const fresh = (isPage ? fetch(e.request.url, { cache: 'no-cache' }) : fetch(e.request))
      .then(res => { if (res.ok) c.put(e.request, res.clone()); return res; });
    if (isPage) return fresh.catch(() => c.match(e.request, { ignoreSearch: true }));
    return c.match(e.request, { ignoreSearch: true }).then(hit => hit || fresh.catch(() => hit));
  }));
});
