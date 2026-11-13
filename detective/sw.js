// 離線用：第一次開啟就把所有檔案存起來。
// 網頁本身（HTML）改成「先連網路」：有網路就一定拿到最新版，沒網路才用存起來的舊版。
const CACHE = 'detective-tw-v54';
const FILES = ['./', 'index.html', 'arc.js', 'arc_data.js', 'pixel.js', 'cases.js', 'case2.js', 'case2_people.js', 'case2_people2.js', 'case2_people3.js', 'case2_items.js', 'case2_art.js', 'case1_art.js', 'world.js', 'worldkit.js', 'case2_world.js', 'case1_world.js', 'case3.js', 'case3_people.js', 'case3_people2.js', 'case3_items.js', 'case3_records.js', 'case3_art.js', 'case3_world.js', 'case4.js', 'case4_people.js', 'case4_people2.js', 'case4_items.js', 'case4_records.js', 'case4_art.js', 'case4_world.js', 'case5.js', 'case5_items.js', 'case5_art.js', 'case6.js', 'case6_items.js', 'case6_art.js', 'case7.js', 'case7_items.js', 'case7_art.js', 'case8.js', 'case8_items.js', 'case8_art.js', 'case9.js', 'case9_items.js', 'case9_art.js', 'case10.js', 'case10_items.js', 'case10_art.js', 'case11.js', 'case11_items.js', 'case11_art.js', 'case12.js', 'case12_items.js', 'case12_art.js','case13.js','case13_items.js','case13_art.js','case14.js','case14_items.js','case14_art.js','case15.js','case15_items.js','case15_art.js','case16.js','case16_items.js','case16_art.js','case17.js','case17_items.js','case17_art.js','case18.js','case18_items.js','case18_art.js','case19.js','case19_items.js','case19_art.js','case20.js','case20_items.js','case20_art.js','case21.js','case21_items.js','case21_art.js','case22.js','case22_items.js','case22_art.js','case23.js','case23_items.js','case23_art.js','case24.js','case24_items.js','case24_art.js','case25.js','case25_items.js','case25_art.js','case26.js','case26_items.js','case26_art.js', 'cafe.js', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
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
