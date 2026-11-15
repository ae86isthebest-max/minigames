// New version check: every map polls the site's service-worker version. When an update is online,
// a banner offers to reload; the page saves on unload, so progress is kept and nothing is re-downloaded by hand.
const swUrl = new URL('../../sw.js', import.meta.url).href;
async function version() {
  try {
    const r = await fetch(swUrl + '?nc=' + Date.now(), { cache: 'no-store' });
    const m = (await r.text()).match(/mg-v\d+/);
    return m ? m[0] : null;
  } catch (e) { return null; }
}
function banner() {
  if (document.getElementById('newVer')) return;
  const b = document.createElement('button');
  b.id = 'newVer'; b.type = 'button';
  b.textContent = '✨ 有新版本！點一下更新（進度會保留）';
  b.onclick = () => { b.textContent = '更新中…'; location.reload(); };
  document.body.appendChild(b);
}
(async () => {
  const cur = await version();
  if (!cur) return;
  const check = async () => { if (document.hidden) return; const v = await version(); if (v && v !== cur) banner(); };
  setInterval(check, 90000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
})();
