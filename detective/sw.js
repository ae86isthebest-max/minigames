// 離線用：第一次開啟就把所有檔案存起來。
// 網頁本身（HTML）改成「先連網路」：有網路就一定拿到最新版，沒網路才用存起來的舊版。
const CACHE = 'detective-tw-v21';
const FILES = ['./', 'index.html', 'pixel.js', 'cases.js', 'case2.js', 'case2_people.js', 'case2_people2.js', 'case2_people3.js', 'case2_items.js', 'case2_art.js', 'case1_art.js', 'world.js', 'worldkit.js', 'case2_world.js', 'case1_world.js', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
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
