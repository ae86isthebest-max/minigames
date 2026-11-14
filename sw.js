// Offline cache: everything is precached on first visit. With a connection the newest files are always
// fetched first (so updates show at once); without one, the cached copy is used.
const CACHE = 'mg-v21';
const GAMES = ['bus', 'water', 'zombie', 'crowd', 'parking', 'screw', 'blocks', 'arrows', 'triple', 'pins', 'pixel', 'fruit', 'stack', 'tangle', 'bricks',
  'runner', 'hole', 'survivor', 'bubble', 'snake', 'helix', 'knife', 'bullet', 'merge', 'paper', 'flow', 'ninja', 'piano', 'g2048', 'jumper', 'multiply'];
const FILES = ['./', 'index.html', 'style.css', 'core.js', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png']
  .concat(GAMES.map((g) => 'games/' + g + '.js'))
  .concat(GAMES.map((g) => 'thumbs/' + g + '.jpg'))
  .concat(['thumbs/farm.jpg', 'farm/', 'farm/index.html', 'farm/style.css', 'farm/js/main.js', 'farm/js/kit.js', 'farm/js/props.js', 'farm/js/props2.js',
    'farm/js/input.js', 'farm/vendor/three.module.min.js', 'farm/vendor/RoundedBoxGeometry.js', 'farm/vendor/BufferGeometryUtils.js']);

self.addEventListener('install', (e) => {
  // cache: 'reload' skips the browser's HTTP cache so a fresh install never stores an old copy
  e.waitUntil(caches.open(CACHE)
    .then((c) => Promise.all(FILES.map((f) => fetch(new Request(f, { cache: 'reload' })).then((r) => { if (r.ok) return c.put(f, r); }).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// network first (3.5 s timeout), cache as the offline fallback
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.includes('/detective/')) return;
  e.respondWith(caches.open(CACHE).then((c) => {
    const net = fetch(e.request, { cache: 'no-cache' }).then((res) => {
      if (res.ok) c.put(e.request, res.clone());
      return res;
    });
    const timeout = new Promise((ok) => setTimeout(ok, 3500));
    return Promise.race([net, timeout.then(() => c.match(e.request, { ignoreSearch: true }).then((hit) => hit || net))])
      .catch(() => c.match(e.request, { ignoreSearch: true }))
      .then((res) => res || c.match(e.request, { ignoreSearch: true }));
  }));
});
