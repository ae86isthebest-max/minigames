// 小遊戲合集 — shared shell: menu, canvas loop, levels, overlay, sound.
(function () {
  'use strict';

  const games = [];
  const SAVE_KEY = 'mg_save_v1';
  const params = new URLSearchParams(location.search);

  // ---------- storage ----------
  let save = {};
  try { save = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') || {}; } catch (e) { save = {}; }
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
  function levelOf(id) { return (save.lv && save.lv[id]) || 1; }
  function setLevel(id, n) { save.lv = save.lv || {}; save.lv[id] = n; persist(); }

  // ---------- seeded rng ----------
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- sound (synthesised, no files) ----------
  let muted = params.has('mute') || !!save.muted;
  let actx = null;
  function audio() {
    if (muted) return null;
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  function tone(freq, dur, type, vol, slide, delay) {
    const a = audio(); if (!a) return;
    const t0 = a.currentTime + (delay || 0);
    const o = a.createOscillator(), gn = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t0 + dur);
    gn.gain.setValueAtTime(vol || 0.15, t0);
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(gn); gn.connect(a.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  const SFX = {
    tap: () => tone(520, 0.06, 'triangle', 0.12),
    pop: () => tone(700, 0.09, 'sine', 0.16, 1.6),
    good: () => { tone(660, 0.08, 'triangle', 0.14); tone(990, 0.12, 'triangle', 0.12, 1, 0.07); },
    bad: () => tone(200, 0.18, 'square', 0.07, 0.6),
    shoot: () => tone(900, 0.05, 'square', 0.04, 0.4),
    hit: () => tone(180, 0.06, 'sawtooth', 0.06, 0.7),
    pour: () => tone(300, 0.25, 'sine', 0.08, 2.2),
    drop: () => tone(260, 0.1, 'triangle', 0.14, 0.5),
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.14, 1, i * 0.09)),
    lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.22, 'triangle', 0.12, 1, i * 0.12)),
  };
  function sfx(name) { if (!muted && SFX[name]) SFX[name](); }

  // ---------- helpers shared with games ----------
  const PALETTE = ['#ff5d6c', '#4c9bff', '#4cd986', '#ffcc4d', '#b26bff', '#ff8f3d', '#3de0e0', '#ff7ac8', '#8a5a3c', '#e8e8f0', '#2f9e5a', '#5560c8'];
  const util = {
    PALETTE,
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    easeOutBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    // rounded-rect path (call fill/stroke yourself)
    rr(g, x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      g.beginPath();
      g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
    },
    // lighten (amt>0) or darken (amt<0) a #rrggbb colour
    shade(hex, amt) {
      const n = parseInt(hex.slice(1), 16);
      let r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
      const f = (c) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
      r = f(r); gg = f(gg); b = f(b);
      return '#' + ((1 << 24) | (r << 16) | (gg << 8) | b).toString(16).slice(1);
    },
    shuffle(rng, arr) {
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      return arr;
    },
    text(g, str, x, y, size, color, align, weight) {
      g.font = (weight || 800) + ' ' + size + 'px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';
      g.textAlign = align || 'center'; g.textBaseline = 'middle'; g.fillStyle = color || '#fff';
      g.fillText(str, x, y);
    },
    BG: '#1b1f3b',
  };

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  let cv, g, stage, cur = null, raf = 0, last = 0, W = 0, H = 0, dpr = 1;

  function register(def) { games.push(def); }

  function buildMenu() {
    const grid = $('grid'); grid.innerHTML = '';
    games.forEach((def) => {
      const b = document.createElement('button');
      b.className = 'tile';
      b.style.background = 'linear-gradient(160deg,' + util.shade(def.color, 0.15) + ',' + util.shade(def.color, -0.25) + ')';
      b.innerHTML = '<div class="ic">' + def.icon + '</div><div class="nm">' + def.name + '</div><div class="lv">第 ' + levelOf(def.id) + ' 關</div>';
      b.onclick = () => { sfx('tap'); openGame(def.id); };
      grid.appendChild(b);
    });
  }

  function sizeCanvas() {
    const r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  }

  function openGame(id, lv) {
    const def = games.find((d) => d.id === id); if (!def) return;
    $('menu').classList.add('hidden'); $('play').classList.remove('hidden');
    $('gTitle').textContent = def.name;
    cur = { def, level: lv || levelOf(id), inst: null, ended: false };
    startLevel();
  }

  function startLevel() {
    if (!cur) return;
    hideOverlay();
    if (cur.inst && cur.inst.destroy) try { cur.inst.destroy(); } catch (e) {}
    sizeCanvas();
    cur.ended = false;
    $('gLevel').textContent = '第 ' + cur.level + ' 關';
    $('info').textContent = '';
    const lv = cur.level;
    const token = {};
    cur.token = token;
    const api = {
      get W() { return W; }, get H() { return H; },
      level: lv,
      rng: mulberry32(lv * 7919 + cur.def.id.length * 104729 + cur.def.id.charCodeAt(0)),
      util, sfx,
      info: (t) => { if (cur && cur.token === token) $('info').textContent = t; },
      get ended() { return !cur || cur.token !== token || cur.ended; },
      win: (t) => finish(token, true, t),
      lose: (t) => finish(token, false, t),
    };
    cur.api = api;
    cur.inst = cur.def.create(api) || {};
    last = performance.now();
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function finish(token, won, text) {
    if (!cur || cur.token !== token || cur.ended) return;
    cur.ended = true;
    if (won) { sfx('win'); if (cur.level >= levelOf(cur.def.id)) setLevel(cur.def.id, cur.level + 1); }
    else sfx('lose');
    setTimeout(() => {
      if (!cur || cur.token !== token) return;
      $('ovTitle').textContent = won ? '過關！' : '失敗了';
      $('ovTitle').style.color = won ? 'var(--good)' : 'var(--bad)';
      $('ovText').textContent = text || (won ? '做得好！' : '再試一次吧');
      $('ovNext').classList.toggle('hidden', !won);
      $('overlay').classList.remove('hidden');
    }, 700);
  }
  function hideOverlay() { $('overlay').classList.add('hidden'); }

  function closeGame() {
    if (cur && cur.inst && cur.inst.destroy) try { cur.inst.destroy(); } catch (e) {}
    cur = null; hideOverlay();
    cancelAnimationFrame(raf); raf = 0;
    $('play').classList.add('hidden'); $('menu').classList.remove('hidden');
    buildMenu();
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (!cur || !cur.inst) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const inst = cur.inst;
    try {
      if (inst.update) inst.update(dt);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      if (inst.draw) inst.draw(g);
    } catch (e) { console.error(e); }
  }

  function pt(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function bindInput() {
    let downId = null;
    cv.addEventListener('pointerdown', (e) => {
      e.preventDefault(); audio();
      if (!cur || !cur.inst || cur.ended || downId !== null) return;
      downId = e.pointerId; try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      const [x, y] = pt(e); if (cur.inst.down) cur.inst.down(x, y);
    });
    cv.addEventListener('pointermove', (e) => {
      if (!cur || !cur.inst || e.pointerId !== downId) return;
      const [x, y] = pt(e); if (cur.inst.move) cur.inst.move(x, y);
    });
    const up = (e) => {
      if (e.pointerId !== downId) return; downId = null;
      if (!cur || !cur.inst || cur.ended) return;
      const [x, y] = pt(e); if (cur.inst.up) cur.inst.up(x, y);
    };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
  }

  function start() {
    cv = $('cv'); g = cv.getContext('2d'); stage = $('stage');
    bindInput();
    $('backBtn').onclick = () => { sfx('tap'); closeGame(); };
    $('restartBtn').onclick = () => { sfx('tap'); startLevel(); };
    $('ovRetry').onclick = () => { sfx('tap'); startLevel(); };
    $('ovNext').onclick = () => { sfx('tap'); cur.level++; startLevel(); };
    const mb = $('muteBtn');
    const showMute = () => { mb.textContent = muted ? '🔇' : '🔊'; };
    showMute();
    mb.onclick = () => { muted = !muted; if (!params.has('mute')) { save.muted = muted; persist(); } showMute(); sfx('tap'); };
    let rt = 0;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (!cur || !cur.inst) return;
        sizeCanvas();
        if (cur.inst.resize) cur.inst.resize(W, H); else if (!cur.ended) startLevel();
      }, 150);
    });
    buildMenu();
    if (params.get('game')) openGame(params.get('game'), parseInt(params.get('level'), 10) || undefined);
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // exposed for games and for testing
  window.MG = { register, start, util, get cur() { return cur; }, games, mulberry32 };
})();
