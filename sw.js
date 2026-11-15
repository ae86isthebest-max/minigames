// Offline cache: everything is precached on first visit and served from the cache, so a running game never
// changes under the player. A new version downloads in the background and waits; the game shows a
// 「有新版本」 button and only switches when the player taps it (the page sends 'skip').
const CACHE = 'mg-v58';
const GAMES = ['bus', 'water', 'zombie', 'crowd', 'parking', 'screw', 'blocks', 'arrows', 'triple', 'pins', 'pixel', 'fruit', 'stack', 'tangle', 'bricks',
  'runner', 'hole', 'survivor', 'bubble', 'snake', 'helix', 'knife', 'bullet', 'merge', 'paper', 'flow', 'ninja', 'piano', 'g2048', 'jumper', 'multiply'];
const FILES = ['./', 'index.html', 'style.css', 'core.js', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png']
  .concat(GAMES.map((g) => 'games/' + g + '.js'))
  .concat(GAMES.map((g) => 'thumbs/' + g + '.jpg'))
  .concat(['thumbs/farm.jpg', 'farm/', 'farm/index.html', 'farm/style.css', 'farm/js/main.js', 'farm/js/kit.js', 'farm/js/props.js', 'farm/js/props2.js',
    'farm/js/input.js', 'farm/js/nav.js', 'farm/js/update.js', 'farm/harbor.html', 'farm/js/harbor.js', 'farm/js/props3.js', 'farm/js/props4.js', 'farm/forest.html', 'farm/js/forest.js', 'farm/js/props5.js', 'farm/cafe.html', 'farm/js/cafe.js', 'farm/js/props6.js', 'farm/vendor/three.module.min.js', 'farm/vendor/RoundedBoxGeometry.js', 'farm/vendor/BufferGeometryUtils.js']);

self.addEventListener('install', (e) => {
  // cache: 'reload' skips the browser's HTTP cache so a fresh install never stores an old copy
  e.waitUntil(caches.open(CACHE)
    .then((c) => Promise.all(FILES.map((f) => fetch(new Request(f, { cache: 'reload' })).then((r) => { if (r.ok) return c.put(f, r); }).catch(() => {}))))
  );
});
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// cache first (this version's files); anything not cached comes from the network and is kept
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.includes('/detective/')) return;
  if (url.pathname.endsWith('/sw.js')) return; // the in-game version check must always reach the network
  e.respondWith(caches.open(CACHE).then((c) => c.match(e.request, { ignoreSearch: true }).then((hit) => hit
    || fetch(e.request, { cache: 'no-cache' }).then((res) => { if (res.ok) c.put(e.request, res.clone()); return res; }))));
});
