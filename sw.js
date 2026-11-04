// Offline cache: everything is precached on first visit, then served cache-first.
// Each visit also refreshes the cache in the background, so updates show up on the next open.
const CACHE = 'mg-v6';
const GAMES = ['bus', 'water', 'zombie', 'crowd', 'parking', 'screw', 'blocks', 'arrows', 'triple', 'pins', 'pixel', 'fruit', 'stack', 'tangle', 'bricks',
  'runner', 'hole', 'survivor', 'bubble', 'snake', 'helix', 'knife', 'bullet', 'merge', 'paper', 'flow', 'ninja', 'piano', 'g2048', 'jumper', 'multiply'];
const FILES = ['./', 'index.html', 'style.css', 'core.js', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png']
  .concat(GAMES.map((g) => 'games/' + g + '.js'))
  .concat(GAMES.map((g) => 'thumbs/' + g + '.jpg'));

self.addEventListener('install', (e) => {
  // cache file by file so one missing file can't break the whole offline install
  e.waitUntil(caches.open(CACHE)
    .then((c) => Promise.all(FILES.map((f) => c.add(f).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then((c) =>
    c.match(e.request, { ignoreSearch: true }).then((hit) => {
      const fresh = fetch(e.request).then((res) => {
        if (res.ok) c.put(e.request, res.clone());
        return res;
      }).catch(() => hit);
      return hit || fresh;
    })));
});
