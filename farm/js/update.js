// Updates only when the player says so. The service worker keeps serving the version the game started
// with; a newer version downloads in the background and waits. When it is ready, a banner appears and the
// game switches only after a tap (the page saves on unload, so progress is kept).
function banner(onTap) {
  if (document.getElementById('newVer')) return;
  const b = document.createElement('button');
  b.id = 'newVer'; b.type = 'button';
  b.textContent = '✨ 有新版本！準備好就點這裡更新（進度會保留）';
  b.onclick = () => { b.textContent = '更新中…'; onTap(); };
  document.body.appendChild(b);
}

const swOk = 'serviceWorker' in navigator && location.protocol === 'https:';
if (swOk) {
  const swUrl = new URL('../../sw.js', import.meta.url).href;
  navigator.serviceWorker.register(swUrl).then((reg) => {
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloading) { reloading = true; location.reload(); } });
    const offer = () => {
      // only offer when this page is already run by an older version (not on the very first install)
      if (reg.waiting && navigator.serviceWorker.controller) banner(() => reg.waiting ? reg.waiting.postMessage('skip') : location.reload());
    };
    offer();
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      if (w) w.addEventListener('statechange', () => { if (w.state === 'installed') offer(); });
    });
    const check = () => { if (!document.hidden) reg.update().catch(() => {}); };
    setInterval(check, 90000);
    document.addEventListener('visibilitychange', check);
  }).catch(() => {});
} else {
  // no service worker (local testing): compare the site's version with the one the page loaded with
  const swUrl = new URL('../../sw.js', import.meta.url).href;
  const version = async () => {
    try { const m = (await (await fetch(swUrl + '?nc=' + Date.now(), { cache: 'no-store' })).text()).match(/mg-v\d+/); return m ? m[0] : null; } catch (e) { return null; }
  };
  (async () => {
    const cur = await version();
    if (!cur) return;
    const check = async () => { if (document.hidden) return; const v = await version(); if (v && v !== cur) banner(() => location.reload()); };
    setInterval(check, 90000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  })();
}
