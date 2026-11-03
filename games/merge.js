// 合成守城 — merge defense: buy archers, drag two identical units together to merge them into a
// stronger tier, and hold the wall against waves of monsters walking down three lanes.
(function () {
  'use strict';
  const U = MG.util;
  const FONT = '-apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif';

  // ---------- unit tiers (each tier looks different, see drawUnit) ----------
  const TIERS = [
    { name: '弓箭手', col: '#4cd986', dmg: 1, rate: 1.1, kind: 'arrow', pc: '#fff3c4' },
    { name: '弩手', col: '#4c9bff', dmg: 2.3, rate: 1.2, kind: 'bolt', pc: '#bfe0ff' },
    { name: '火法師', col: '#ff6a3d', dmg: 4.8, rate: 1.0, kind: 'fire', splash: 32, pc: '#ffb04d' },
    { name: '冰法師', col: '#5fd8ff', dmg: 10.5, rate: 1.05, kind: 'ice', splash: 26, slow: 0.5, pc: '#d6f6ff' },
    { name: '雷法師', col: '#ffd84d', dmg: 23, rate: 1.15, kind: 'zap', chain: 3, pc: '#fff6a0' },
    { name: '砲兵', col: '#b07a4a', dmg: 54, rate: 0.8, kind: 'cannon', splash: 46, pc: '#3a3f4b' },
    { name: '聖騎士', col: '#e8ecff', dmg: 118, rate: 1.0, kind: 'holy', splash: 30, multi: 2, pc: '#fffbe0' },
    { name: '龍騎士', col: '#b26bff', dmg: 255, rate: 1.0, kind: 'dragon', splash: 42, multi: 2, pc: '#ff9a4d' },
    { name: '天使', col: '#ffe27a', dmg: 560, rate: 1.2, kind: 'star', chain: 4, multi: 3, pc: '#fffbe0' },
    { name: '戰神', col: '#ff4d7a', dmg: 1250, rate: 1.3, kind: 'nova', splash: 60, multi: 3, pc: '#ff9ab8' },
  ];
  const MAXT = TIERS.length - 1;

  // ---------- monsters ----------
  const MONS = {
    slime: { hp: 1, spd: 1, atk: 2, r: 13, coin: 1, col: '#6fd14a' },
    bat: { hp: 0.55, spd: 1.7, atk: 1.5, r: 11, coin: 1, col: '#8a5ad8' },
    orc: { hp: 2.6, spd: 0.68, atk: 4, r: 17, coin: 2, col: '#5d8f3a' },
    knight: { hp: 1.8, spd: 0.88, atk: 3, r: 15, coin: 2, col: '#9aa0ad' },
    boss: { hp: 6, spd: 0.42, atk: 9, r: 30, coin: 14, col: '#c0392b' },
  };

  // ---------- drawing (卡通 Q 版: thick outlines, chibi soldiers & monsters, illustrated battlefield) ----------
  const OL = '#2a1a14';
  function stk(g, lw) { g.lineWidth = lw; g.strokeStyle = OL; g.stroke(); }
  function olText(g, str, x, y, size, col, lw, align) {
    g.font = '900 ' + size + 'px ' + FONT; g.textAlign = align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = lw || Math.max(3, size * 0.22); g.strokeStyle = OL; g.strokeText(str, x, y);
    g.fillStyle = col; g.fillText(str, x, y);
  }
  function drawBackground(g, W, H, fieldTop, wallY, lanes, sc) {
    g.lineJoin = 'round'; g.lineCap = 'round';
    // meadow
    g.fillStyle = '#8fd36a'; g.fillRect(0, 0, W, wallY + 4);
    const r = MG.mulberry32(42);
    g.fillStyle = '#9ddc78';
    for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(r() * W, fieldTop + r() * (wallY - fieldTop), 30 + r() * 40, 12 + r() * 10, 0, 0, 6.283); g.fill(); }
    // dirt lanes with outlines
    const lw = Math.min(W * 0.2, 86 * sc);
    for (let i = 0; i < lanes.length; i++) {
      const x = lanes[i];
      U.rr(g, x - lw / 2, fieldTop - 40, lw, wallY - fieldTop + 50, lw * 0.4); g.fillStyle = '#d8a868'; g.fill(); stk(g, 3);
      U.rr(g, x - lw / 2 + 8, fieldTop - 40, lw - 16, wallY - fieldTop + 50, lw * 0.3); g.fillStyle = '#e8c088'; g.fill();
      for (let k = 0; k < 8; k++) {
        const px = x + (r() - 0.5) * (lw - 20), py = fieldTop + r() * (wallY - fieldTop);
        g.beginPath(); g.ellipse(px, py, 3 + r() * 3, 2 + r() * 2, 0, 0, 6.283); g.fillStyle = '#b88a58'; g.fill(); stk(g, 1.2);
      }
    }
    // grass tufts, flowers, bushes, rocks off the lanes
    for (let i = 0; i < 80; i++) {
      const x = r() * W, y = fieldTop + 20 + r() * (wallY - fieldTop - 30);
      let onLane = false;
      for (let k = 0; k < lanes.length; k++) if (Math.abs(x - lanes[k]) < lw / 2 + 8) onLane = true;
      const kk = r();
      if (onLane) continue;
      if (kk < 0.45) {
        g.strokeStyle = '#3f8a36'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y - 7); g.moveTo(x, y); g.lineTo(x + 1, y - 9); g.moveTo(x, y); g.lineTo(x + 4, y - 6); g.stroke();
      } else if (kk < 0.7) {
        const fc = ['#ff7ac8', '#ffe27a', '#ffffff', '#ff9a4d'][Math.floor(r() * 4)];
        for (let p = 0; p < 5; p++) { const a = p * 1.2566; g.beginPath(); g.arc(x + Math.cos(a) * 3, y + Math.sin(a) * 3, 2.4, 0, 6.283); g.fillStyle = fc; g.fill(); stk(g, 1); }
        g.fillStyle = '#ffcc4d'; g.beginPath(); g.arc(x, y, 1.8, 0, 6.283); g.fill();
      } else if (kk < 0.85) {
        g.fillStyle = 'rgba(42,26,20,0.2)'; g.beginPath(); g.ellipse(x, y + 6, 12, 3.5, 0, 0, 6.283); g.fill();
        g.beginPath(); g.arc(x - 5, y, 6, 0, 6.283); g.arc(x + 5, y, 6, 0, 6.283); g.arc(x, y - 4, 7, 0, 6.283);
        g.lineWidth = 4.5; g.strokeStyle = OL; g.stroke(); g.fillStyle = '#4cb04a'; g.fill();
        g.fillStyle = '#7ad65a'; g.beginPath(); g.arc(x - 2, y - 6, 3, 0, 6.283); g.fill();
      } else {
        g.beginPath(); g.ellipse(x, y, 7, 5, 0, 0, 6.283); g.fillStyle = '#b4b0c4'; g.fill(); stk(g, 2);
        g.fillStyle = '#dcd8ea'; g.beginPath(); g.ellipse(x - 2, y - 2, 3.5, 1.8, 0, 0, 6.283); g.fill();
      }
    }
    // dark forest edge the monsters walk out of
    g.fillStyle = '#7fd0ff'; g.fillRect(0, 0, W, fieldTop - 18);
    g.fillStyle = '#3f8a46'; g.fillRect(0, fieldTop - 30, W, 34);
    for (let i = 0; i < Math.ceil(W / 26) + 1; i++) {
      const x = i * 26 + (i % 2) * 6, y = fieldTop - 18 - (i % 3) * 5, rr = 17 + (i % 3) * 3;
      g.beginPath(); g.arc(x, y, rr, 0, 6.283); g.fillStyle = i % 2 ? '#2f7a3c' : '#38884a'; g.fill(); stk(g, 2.5);
      g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.arc(x - rr * 0.35, y - rr * 0.4, rr * 0.3, 0, 6.283); g.fill();
    }
    for (let i = 0; i < lanes.length; i++) {
      const x = lanes[i];
      g.beginPath(); g.ellipse(x, fieldTop - 6, lw * 0.36, 16, 0, Math.PI, 0); g.closePath(); g.fillStyle = '#1e2a22'; g.fill(); stk(g, 3);
    }
    g.fillStyle = '#5a9a3a'; g.fillRect(0, fieldTop + 2, W, 4);
    // castle yard below the wall: warm stone tiles
    g.fillStyle = '#b89a7a'; g.fillRect(0, wallY, W, H - wallY);
    const s = 30 * sc;
    g.strokeStyle = 'rgba(42,26,20,0.35)'; g.lineWidth = 2;
    for (let y = wallY + 10, row = 0; y < H; y += s * 0.6, row++) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
      for (let x = (row % 2) * s * 0.5; x < W; x += s) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + s * 0.6); g.stroke(); }
    }
    g.fillStyle = 'rgba(255,255,255,0.08)';
    for (let y = wallY + 10, row = 0; y < H; y += s * 0.6, row++) for (let x = (row % 2) * s * 0.5; x < W; x += s) g.fillRect(x + 3, y + 3, s - 6, 3);
  }

  function drawWall(g, W, wallY, sc, hp, maxHp, flash, t) {
    const th = 32 * sc, top = wallY - th * 0.5;
    g.lineJoin = 'round';
    g.fillStyle = 'rgba(42,26,20,0.3)'; g.fillRect(0, top + th, W, 8);
    g.fillStyle = '#cfc6dc'; g.fillRect(0, top, W, th);
    g.fillStyle = '#b4aac6'; g.fillRect(0, top + th * 0.62, W, th * 0.38);
    const bw = 22 * sc;
    // bricks
    g.strokeStyle = 'rgba(42,26,20,0.55)'; g.lineWidth = 1.6;
    g.beginPath();
    for (let row = 0; row < 3; row++) {
      const y = top + row * th / 3;
      g.moveTo(0, y); g.lineTo(W, y);
      for (let x = (row % 2) * bw * 0.5; x < W; x += bw) { g.moveTo(x, y); g.lineTo(x, y + th / 3); }
    }
    g.stroke();
    // battlements
    for (let x = 0; x < W; x += bw * 2) {
      U.rr(g, x + 2, top - 12 * sc, bw, 14 * sc, 3); g.fillStyle = '#ddd5ea'; g.fill(); stk(g, 2.5);
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x + 5, top - 10 * sc, bw - 6, 3);
    }
    g.beginPath(); g.rect(-3, top, W + 6, th); stk(g, 3);
    const dmg = 1 - hp / maxHp;
    if (dmg > 0.25) {
      g.strokeStyle = OL; g.lineWidth = 2.2;
      const r = MG.mulberry32(5);
      const n = Math.floor(dmg * 14);
      g.beginPath();
      for (let i = 0; i < n; i++) {
        let x = r() * W, y = top + r() * th * 0.4;
        g.moveTo(x, y);
        for (let k = 0; k < 3; k++) { x += (r() - 0.5) * 16; y += 5 + r() * 6; g.lineTo(x, y); }
      }
      g.stroke();
    }
    if (flash > 0) { g.fillStyle = 'rgba(255,60,60,' + Math.min(0.5, flash * 2) + ')'; g.fillRect(0, top - 12 * sc, W, th + 12 * sc); }
    // flags
    for (let k = 0; k < 2; k++) {
      const fx = k ? W - 16 * sc : 16 * sc, fy = top - 12 * sc;
      g.beginPath(); g.rect(fx - 2, fy - 36 * sc, 4, 36 * sc); g.fillStyle = '#8a5a3c'; g.fill(); stk(g, 1.5);
      const wv = Math.sin(t * 5 + k) * 3 * sc;
      g.beginPath(); g.moveTo(fx + 2, fy - 36 * sc); g.quadraticCurveTo(fx + 12 * sc, fy - 32 * sc + wv, fx + 24 * sc, fy - 29 * sc + wv);
      g.lineTo(fx + 2, fy - 20 * sc); g.closePath(); g.fillStyle = '#ff5d6c'; g.fill(); stk(g, 2);
      g.beginPath(); g.arc(fx, fy - 37 * sc, 3, 0, 6.283); g.fillStyle = '#ffcc4d'; g.fill(); stk(g, 1.5);
    }
  }

  // ---------- chibi soldiers: every tier gets a new outfit, weapon and more bling ----------
  // look per tier: body colour, trim, legs, cape, head gear, weapon, extras
  const LOOK = [
    { body: '#5cc86a', trim: '#8a5a3c', legs: '#6a4a2a', hair: '#8a5a2c' },                          // 1 弓箭手
    { body: '#4c9bff', trim: '#c4cde0', legs: '#3a4a7a', hair: '#3a2a20' },                          // 2 弩手
    { body: '#ff6a3d', trim: '#ffcc4d', legs: '#7a2a20', hair: '#3a2a20', robe: 1 },                 // 3 火法師
    { body: '#5fd8ff', trim: '#ffffff', legs: '#2a5a8a', hair: '#e8f4ff', robe: 1, cape: '#2a8ac8' }, // 4 冰法師
    { body: '#ffd84d', trim: '#8a4ad8', legs: '#5a3a8a', hair: '#ffffff', robe: 1, cape: '#8a4ad8' }, // 5 雷法師
    { body: '#b07a4a', trim: '#5a4030', legs: '#4a3a30', hair: '#3a2a20' },                          // 6 砲兵
    { body: '#dfe4ef', trim: '#ffcc4d', legs: '#8a90a6', hair: '#ffcc4d', cape: '#3a6ad8' },         // 7 聖騎士
    { body: '#9a5ae8', trim: '#ffcc4d', legs: '#4a2a7a', hair: '#2a1040', cape: '#5a2aa8', dwings: 1 }, // 8 龍騎士
    { body: '#ffffff', trim: '#ffcc4d', legs: '#f0e0b0', hair: '#ffd84d', robe: 1, wings: 1 },       // 9 天使
    { body: '#e8304f', trim: '#ffd84d', legs: '#5a1020', hair: '#ffd84d', cape: '#8a1030', aura: 1 }, // 10 戰神
  ];
  function wing(g, k, sd, fl, col, dragon) {
    g.save(); g.scale(sd, 1);
    g.beginPath(); g.moveTo(6 * k, -2 * k);
    if (dragon) {
      g.quadraticCurveTo(22 * k, -(24 + fl * 8) * k, 34 * k, -(18 + fl * 6) * k);
      g.lineTo(30 * k, -6 * k); g.lineTo(26 * k, 0); g.lineTo(20 * k, 2 * k); g.lineTo(14 * k, 6 * k);
    } else {
      g.quadraticCurveTo(26 * k, -(30 + fl * 10) * k, 36 * k, -(14 + fl * 6) * k);
      g.quadraticCurveTo(30 * k, -6 * k, 32 * k, 2 * k); g.quadraticCurveTo(24 * k, 2 * k, 24 * k, 8 * k); g.quadraticCurveTo(16 * k, 6 * k, 10 * k, 10 * k);
    }
    g.closePath(); g.fillStyle = col; g.fill(); stk(g, 2.4 * k);
    g.strokeStyle = dragon ? 'rgba(42,26,20,0.5)' : 'rgba(180,170,210,0.8)'; g.lineWidth = 1.5 * k;
    g.beginPath(); g.moveTo(10 * k, 0); g.lineTo(28 * k, -(16 + fl * 6) * k); g.moveTo(12 * k, 4 * k); g.lineTo(26 * k, -2 * k); g.stroke();
    g.restore();
  }
  function wizardHat(g, k, col, band, emblem, t) {
    g.beginPath(); g.moveTo(-17 * k, -20 * k); g.quadraticCurveTo(0, -24 * k, 17 * k, -20 * k);
    g.lineTo(5 * k, -42 * k); g.quadraticCurveTo(9 * k, -50 * k, 14 * k, -48 * k); g.quadraticCurveTo(4 * k, -52 * k, 1 * k, -42 * k); g.closePath();
    g.fillStyle = col; g.fill(); stk(g, 2.4 * k);
    g.beginPath(); g.ellipse(0, -20 * k, 19 * k, 5 * k, 0, 0, 6.283); g.fillStyle = col; g.fill(); stk(g, 2.4 * k);
    U.rr(g, -12 * k, -27 * k, 24 * k, 5 * k, 2 * k); g.fillStyle = band; g.fill(); stk(g, 1.6 * k);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(-6 * k, -32 * k, 2.5 * k, 6 * k, 0.4, 0, 6.283); g.fill();
    if (emblem === 'fire') {
      g.beginPath(); g.moveTo(0, -30 * k); g.quadraticCurveTo(-5 * k, -35 * k, 0, -41 * k); g.quadraticCurveTo(5 * k, -35 * k, 0, -30 * k); g.fillStyle = '#ffcc4d'; g.fill(); stk(g, 1.3 * k);
    } else if (emblem === 'ice') {
      g.strokeStyle = '#ffffff'; g.lineWidth = 2 * k;
      g.beginPath(); for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.moveTo(Math.cos(a) * 4 * k, -35 * k + Math.sin(a) * 4 * k); g.lineTo(-Math.cos(a) * 4 * k, -35 * k - Math.sin(a) * 4 * k); } g.stroke();
    } else if (emblem === 'zap') {
      g.beginPath(); g.moveTo(1 * k, -42 * k); g.lineTo(-4 * k, -34 * k); g.lineTo(0, -34 * k); g.lineTo(-2 * k, -28 * k); g.lineTo(5 * k, -37 * k); g.lineTo(1 * k, -37 * k); g.closePath();
      g.fillStyle = '#fff27a'; g.fill(); stk(g, 1.3 * k);
    }
  }
  function staff(g, k, t, fire, orb, glow) {
    g.beginPath(); g.rect(15 * k, -22 * k, 4 * k, 42 * k); g.fillStyle = '#8a5a3c'; g.fill(); stk(g, 1.8 * k);
    const pul = 1 + 0.15 * Math.sin(t * 8) + (fire > 0 ? 0.5 : 0);
    g.fillStyle = glow; g.globalAlpha = 0.45; g.beginPath(); g.arc(17 * k, -27 * k, 9 * k * pul, 0, 6.283); g.fill(); g.globalAlpha = 1;
    g.beginPath(); g.arc(17 * k, -27 * k, 5.5 * k, 0, 6.283); g.fillStyle = orb; g.fill(); stk(g, 1.8 * k);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(15.5 * k, -28.5 * k, 1.6 * k, 0, 6.283); g.fill();
  }
  function face(g, k, mood, col) {
    g.fillStyle = OL;
    g.beginPath(); g.ellipse(-5.5 * k, -12 * k, 2.3 * k, 3 * k, 0, 0, 6.283); g.ellipse(5.5 * k, -12 * k, 2.3 * k, 3 * k, 0, 0, 6.283); g.fill();
    g.fillStyle = col || '#fff';
    g.beginPath(); g.arc(-4.8 * k, -13 * k, 1 * k, 0, 6.283); g.arc(6.2 * k, -13 * k, 1 * k, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(255,110,120,0.5)'; g.beginPath(); g.ellipse(-9.5 * k, -7.5 * k, 2.6 * k, 1.6 * k, 0, 0, 6.283); g.ellipse(9.5 * k, -7.5 * k, 2.6 * k, 1.6 * k, 0, 0, 6.283); g.fill();
    g.strokeStyle = OL; g.lineWidth = 1.5 * k; g.lineCap = 'round';
    g.beginPath(); g.arc(0, -8 * k, 2.2 * k, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    if (mood) { g.beginPath(); g.moveTo(-8 * k, -17.5 * k); g.lineTo(-3 * k, -16 * k); g.moveTo(8 * k, -17.5 * k); g.lineTo(3 * k, -16 * k); g.stroke(); }
  }
  function drawUnit(g, tier, x, y, s, t, fire) {
    const L0 = LOOK[tier];
    const bob = Math.sin(t * 3 + tier) * s * 0.02;
    const k = s / 60 * (0.9 + tier * 0.022);
    g.save(); g.translate(x, y + bob);
    g.lineJoin = 'round'; g.lineCap = 'round';
    const lw = 2.4 * k;
    g.fillStyle = 'rgba(42,26,20,0.3)'; g.beginPath(); g.ellipse(0, 23 * k, 19 * k, 5.5 * k, 0, 0, 6.283); g.fill();
    if (L0.aura) {
      const pul = 0.5 + 0.5 * Math.sin(t * 6);
      g.fillStyle = 'rgba(255,90,140,' + (0.22 + pul * 0.18) + ')'; g.beginPath(); g.arc(0, -4 * k, 34 * k, 0, 6.283); g.fill();
      g.fillStyle = 'rgba(255,216,77,' + (0.25 + pul * 0.2) + ')'; g.beginPath(); g.arc(0, -4 * k, 26 * k, 0, 6.283); g.fill();
    }
    if (tier === 5) { drawGunner(g, k, t, fire); g.restore(); return; }
    const fl = Math.sin(t * (L0.dwings ? 9 : 4)) * 0.5;
    if (L0.wings) { wing(g, k, -1, fl, '#ffffff', false); wing(g, k, 1, fl, '#ffffff', false); }
    if (L0.dwings) { wing(g, k, -1, fl, '#7d3fc8', true); wing(g, k, 1, fl, '#7d3fc8', true); }
    if (L0.cape) {
      const cw = Math.sin(t * 4 + tier) * 2 * k;
      g.beginPath(); g.moveTo(-10 * k, -2 * k); g.quadraticCurveTo(-18 * k, 10 * k, -16 * k + cw, 22 * k); g.lineTo(16 * k + cw, 22 * k); g.quadraticCurveTo(18 * k, 10 * k, 10 * k, -2 * k); g.closePath();
      g.fillStyle = L0.cape; g.fill(); stk(g, lw);
    }
    // legs + boots
    for (let sd = -1; sd <= 1; sd += 2) { g.beginPath(); g.ellipse(sd * 5 * k, 18 * k, 4.5 * k, 5.5 * k, 0, 0, 6.283); g.fillStyle = L0.legs; g.fill(); stk(g, lw * 0.8); }
    // body (robe flares out for mages)
    g.beginPath();
    if (L0.robe) { g.moveTo(-9 * k, -3 * k); g.lineTo(9 * k, -3 * k); g.quadraticCurveTo(13 * k, 10 * k, 14 * k, 19 * k); g.lineTo(-14 * k, 19 * k); g.quadraticCurveTo(-13 * k, 10 * k, -9 * k, -3 * k); g.closePath(); }
    else U.rr(g, -11 * k, -3 * k, 22 * k, 21 * k, 8 * k);
    g.fillStyle = L0.body; g.fill(); stk(g, lw);
    if (L0.robe) { g.beginPath(); g.moveTo(0, -2 * k); g.lineTo(0, 18 * k); g.strokeStyle = L0.trim; g.lineWidth = 3 * k; g.stroke(); }
    else { g.fillStyle = L0.trim; g.fillRect(-10.5 * k, 8 * k, 21 * k, 3.5 * k); g.beginPath(); g.rect(-10.5 * k, 8 * k, 21 * k, 3.5 * k); stk(g, 1.2 * k); }
    if (tier >= 6) { // armour chest plate with emblem
      U.rr(g, -7 * k, -1 * k, 14 * k, 9 * k, 3 * k); g.fillStyle = tier === 6 ? '#f4f6ff' : tier === 7 ? '#b98af0' : tier === 8 ? '#fff6d0' : '#ffd84d'; g.fill(); stk(g, 1.4 * k);
      g.beginPath(); g.arc(0, 3.5 * k, 2.2 * k, 0, 6.283); g.fillStyle = tier === 9 ? '#e8304f' : '#ffcc4d'; g.fill(); stk(g, 1 * k);
    }
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(-6 * k, 1 * k, 2 * k, 4 * k, 0.3, 0, 6.283); g.fill();
    // arms
    for (let sd = -1; sd <= 1; sd += 2) {
      g.beginPath(); g.ellipse(sd * 12 * k, 4 * k, 3.8 * k, 6 * k, -sd * 0.3, 0, 6.283); g.fillStyle = L0.body; g.fill(); stk(g, lw * 0.8);
      g.beginPath(); g.arc(sd * 14 * k, 9 * k, 3.2 * k, 0, 6.283); g.fillStyle = tier >= 6 && tier !== 8 ? '#c8cedc' : '#ffd9b0'; g.fill(); stk(g, lw * 0.7);
    }
    // head
    g.beginPath(); g.ellipse(0, -13 * k, 15 * k, 13.5 * k, 0, 0, 6.283); g.fillStyle = '#ffdcb8'; g.fill(); stk(g, lw);
    headGear(g, tier, k, t, fire, L0);
    face(g, k, tier >= 6, tier === 9 ? '#ffe27a' : null);
    weapon(g, tier, k, t, fire);
    g.restore();
  }
  function headGear(g, tier, k, t, fire, L0) {
    const lw = 2.4 * k;
    if (tier === 0) {
      // green ranger hood with a feather
      g.beginPath(); g.arc(0, -15 * k, 15.5 * k, Math.PI * 1.02, Math.PI * 1.98); g.quadraticCurveTo(8 * k, -22 * k, 0, -18 * k); g.quadraticCurveTo(-8 * k, -22 * k, -15.4 * k, -17 * k); g.closePath();
      g.fillStyle = '#2f9e5a'; g.fill(); stk(g, lw);
      g.beginPath(); g.moveTo(8 * k, -27 * k); g.quadraticCurveTo(20 * k, -40 * k, 22 * k, -32 * k); g.quadraticCurveTo(16 * k, -30 * k, 8 * k, -27 * k); g.fillStyle = '#ff5d6c'; g.fill(); stk(g, 1.6 * k);
    } else if (tier === 1) {
      // steel kettle helmet
      g.beginPath(); g.arc(0, -16 * k, 15 * k, Math.PI, 0); g.closePath(); g.fillStyle = '#9aa8c4'; g.fill(); stk(g, lw);
      U.rr(g, -19 * k, -18 * k, 38 * k, 5 * k, 2.5 * k); g.fillStyle = '#c4cde0'; g.fill(); stk(g, lw * 0.8);
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(-6 * k, -25 * k, 4 * k, 2 * k, -0.4, 0, 6.283); g.fill();
    } else if (tier >= 2 && tier <= 4) {
      // hair peeking out, then the wizard hat
      g.beginPath(); g.ellipse(0, -19 * k, 15 * k, 7 * k, 0, Math.PI, 0); g.fillStyle = L0.hair; g.fill(); stk(g, lw * 0.8);
      if (tier === 4) { g.beginPath(); g.moveTo(-8 * k, 0); g.quadraticCurveTo(0, 6 * k, 8 * k, 0); g.lineTo(0, 9 * k); g.closePath(); g.fillStyle = '#ffffff'; g.fill(); stk(g, 1.4 * k); }
      wizardHat(g, k, tier === 2 ? '#d8402a' : tier === 3 ? '#2a8ac8' : '#7a3ac8', tier === 2 ? '#ffcc4d' : tier === 3 ? '#ffffff' : '#ffd84d', tier === 2 ? 'fire' : tier === 3 ? 'ice' : 'zap', t);
      if (tier === 4) {
        for (let i = 0; i < 3; i++) {
          const a = t * 3 + i * 2.1, px = Math.cos(a) * 20 * k, py = -20 * k + Math.sin(a) * 8 * k;
          g.beginPath(); g.moveTo(px, py - 4 * k); g.lineTo(px - 2.5 * k, py); g.lineTo(px + 1 * k, py); g.lineTo(px - 1 * k, py + 4 * k); g.lineTo(px + 3 * k, py - 1 * k); g.lineTo(px, py - 1 * k); g.closePath();
          g.fillStyle = '#fff27a'; g.fill(); stk(g, 1 * k);
        }
      }
    } else if (tier === 6) {
      // silver knight helm (open face) with a gold plume
      g.beginPath(); g.moveTo(2 * k, -28 * k); g.quadraticCurveTo(14 * k, -42 * k, 22 * k, -34 * k); g.quadraticCurveTo(14 * k, -32 * k, 6 * k, -24 * k); g.closePath(); g.fillStyle = '#ffcc4d'; g.fill(); stk(g, 1.6 * k);
      g.beginPath(); g.arc(0, -15 * k, 16 * k, Math.PI * 0.95, Math.PI * 2.05); g.lineTo(13 * k, -6 * k); g.lineTo(9 * k, -6 * k); g.lineTo(9 * k, -17 * k); g.lineTo(-9 * k, -17 * k); g.lineTo(-9 * k, -6 * k); g.lineTo(-13 * k, -6 * k); g.closePath();
      g.fillStyle = '#e4e8f2'; g.fill(); stk(g, lw);
      g.beginPath(); g.moveTo(0, -30 * k); g.lineTo(0, -18 * k); g.strokeStyle = '#ffcc4d'; g.lineWidth = 2.4 * k; g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(-8 * k, -24 * k, 3 * k, 1.8 * k, -0.5, 0, 6.283); g.fill();
    } else if (tier === 7) {
      // horned dragon helm
      for (let sd = -1; sd <= 1; sd += 2) { g.beginPath(); g.moveTo(sd * 9 * k, -24 * k); g.quadraticCurveTo(sd * 20 * k, -30 * k, sd * 18 * k, -42 * k); g.quadraticCurveTo(sd * 14 * k, -32 * k, sd * 4 * k, -27 * k); g.closePath(); g.fillStyle = '#ffe27a'; g.fill(); stk(g, 1.6 * k); }
      g.beginPath(); g.arc(0, -15 * k, 16 * k, Math.PI * 0.95, Math.PI * 2.05); g.lineTo(13 * k, -6 * k); g.lineTo(9 * k, -6 * k); g.lineTo(9 * k, -17 * k); g.lineTo(-9 * k, -17 * k); g.lineTo(-9 * k, -6 * k); g.lineTo(-13 * k, -6 * k); g.closePath();
      g.fillStyle = '#7d3fc8'; g.fill(); stk(g, lw);
      g.fillStyle = '#b98af0'; for (let i = -1; i <= 1; i++) { g.beginPath(); g.arc(i * 6 * k, -24 * k, 2.4 * k, 0, 6.283); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(-8 * k, -25 * k, 3 * k, 1.6 * k, -0.5, 0, 6.283); g.fill();
    } else if (tier === 8) {
      // golden curls + halo
      g.beginPath(); g.ellipse(0, -18 * k, 16 * k, 9 * k, 0, Math.PI, 0); g.fillStyle = L0.hair; g.fill(); stk(g, lw * 0.8);
      for (let sd = -1; sd <= 1; sd += 2) { g.beginPath(); g.arc(sd * 14 * k, -12 * k, 4 * k, 0, 6.283); g.fillStyle = L0.hair; g.fill(); stk(g, lw * 0.7); }
      const hy = -34 * k + Math.sin(t * 3) * 1.5 * k;
      g.beginPath(); g.ellipse(0, hy, 11 * k, 3.6 * k, 0, 0, 6.283); g.lineWidth = 5.5 * k; g.strokeStyle = OL; g.stroke(); g.lineWidth = 3 * k; g.strokeStyle = '#ffe27a'; g.stroke();
    } else if (tier === 9) {
      // god-of-war spiked golden crown helm with red plume
      g.beginPath(); g.moveTo(-4 * k, -30 * k); g.quadraticCurveTo(-2 * k, -48 * k, 12 * k, -46 * k); g.quadraticCurveTo(4 * k, -40 * k, 4 * k, -30 * k); g.closePath(); g.fillStyle = '#ff4d7a'; g.fill(); stk(g, 1.6 * k);
      g.beginPath(); g.arc(0, -15 * k, 16 * k, Math.PI * 0.95, Math.PI * 2.05); g.lineTo(13 * k, -6 * k); g.lineTo(9 * k, -6 * k); g.lineTo(9 * k, -17 * k); g.lineTo(-9 * k, -17 * k); g.lineTo(-9 * k, -6 * k); g.lineTo(-13 * k, -6 * k); g.closePath();
      g.fillStyle = '#ffcc4d'; g.fill(); stk(g, lw);
      g.beginPath(); g.moveTo(-14 * k, -24 * k);
      for (let i = 0; i <= 6; i++) g.lineTo(-14 * k + i * 4.67 * k, -24 * k - (i % 2 ? 4 : 11) * k);
      g.lineTo(14 * k, -24 * k); g.closePath(); g.fillStyle = '#ffd84d'; g.fill(); stk(g, 1.6 * k);
      g.beginPath(); g.arc(0, -27 * k, 2.6 * k, 0, 6.283); g.fillStyle = '#e8304f'; g.fill(); stk(g, 1 * k);
    }
  }
  function weapon(g, tier, k, t, fire) {
    const lw = 2.4 * k;
    if (tier === 0) {
      g.beginPath(); g.arc(14 * k, 2 * k, 15 * k, -Math.PI * 0.45, Math.PI * 0.45);
      g.lineWidth = 5.5 * k; g.strokeStyle = OL; g.stroke(); g.lineWidth = 3 * k; g.strokeStyle = '#b07a4a'; g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(16.5 * k, -12 * k); g.lineTo(16.5 * k, 16 * k); g.stroke();
    } else if (tier === 1) {
      // crossbow aimed up the field: wooden stock + steel limbs + string
      U.rr(g, 13 * k, -16 * k, 5 * k, 28 * k, 2 * k); g.fillStyle = '#8a5a3c'; g.fill(); stk(g, 1.6 * k);
      g.beginPath(); g.moveTo(4 * k, -6 * k); g.quadraticCurveTo(15.5 * k, -18 * k, 27 * k, -6 * k);
      g.lineWidth = 5.5 * k; g.strokeStyle = OL; g.stroke(); g.lineWidth = 3 * k; g.strokeStyle = '#9aa8c4'; g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(4.5 * k, -5.5 * k); g.lineTo(15.5 * k, -2 * k); g.lineTo(26.5 * k, -5.5 * k); g.stroke();
      g.beginPath(); g.moveTo(15.5 * k, -24 * k); g.lineTo(13 * k, -18 * k); g.lineTo(18 * k, -18 * k); g.closePath(); g.fillStyle = '#e4e8f2'; g.fill(); stk(g, 1.2 * k);
    } else if (tier === 2) staff(g, k, t, fire, '#ff8a3d', '#ffb04d');
    else if (tier === 3) staff(g, k, t, fire, '#c8f4ff', '#9ef0ff');
    else if (tier === 4) staff(g, k, t, fire, '#fff27a', '#fff6a0');
    else if (tier === 6 || tier === 9) {
      // sword (tier 9: big flaming golden blade) + shield for the paladin
      const big = tier === 9;
      g.save(); g.translate(16 * k, 6 * k); g.rotate(-0.15 - (fire > 0 ? 0.5 : 0));
      g.beginPath(); g.moveTo(-2.5 * k, -4 * k); g.lineTo(-2.5 * k, -(big ? 36 : 28) * k); g.lineTo(0, -(big ? 42 : 32) * k); g.lineTo(2.5 * k, -(big ? 36 : 28) * k); g.lineTo(2.5 * k, -4 * k); g.closePath();
      g.fillStyle = big ? '#ffe27a' : '#f4f6ff'; g.fill(); stk(g, 1.8 * k);
      U.rr(g, -6 * k, -5 * k, 12 * k, 3.5 * k, 1.5 * k); g.fillStyle = '#ffcc4d'; g.fill(); stk(g, 1.4 * k);
      g.beginPath(); g.rect(-1.5 * k, -1.5 * k, 3 * k, 6 * k); g.fillStyle = '#8a5a3c'; g.fill(); stk(g, 1.2 * k);
      if (big) { g.fillStyle = 'rgba(255,120,60,' + (0.4 + 0.3 * Math.sin(t * 12)) + ')'; g.beginPath(); g.ellipse(0, -24 * k, 6 * k, 18 * k, 0, 0, 6.283); g.fill(); }
      g.restore();
      if (tier === 6) {
        g.beginPath(); g.moveTo(-24 * k, -2 * k); g.lineTo(-10 * k, -2 * k); g.lineTo(-10 * k, 10 * k); g.quadraticCurveTo(-17 * k, 20 * k, -17 * k, 20 * k); g.quadraticCurveTo(-24 * k, 14 * k, -24 * k, 10 * k); g.closePath();
        g.fillStyle = '#3a6ad8'; g.fill(); stk(g, lw);
        g.fillStyle = '#ffe27a'; g.fillRect(-18.5 * k, 0, 3 * k, 13 * k); g.fillRect(-22 * k, 4 * k, 10 * k, 3 * k);
      }
    } else if (tier === 7) {
      // dragon lance
      g.beginPath(); g.moveTo(17 * k, 18 * k); g.lineTo(17 * k, -26 * k); g.lineWidth = 5.5 * k; g.strokeStyle = OL; g.stroke(); g.lineWidth = 3 * k; g.strokeStyle = '#8a5a3c'; g.stroke();
      g.beginPath(); g.moveTo(17 * k, -42 * k); g.lineTo(12 * k, -26 * k); g.lineTo(22 * k, -26 * k); g.closePath(); g.fillStyle = '#e4e8f2'; g.fill(); stk(g, 1.6 * k);
      g.beginPath(); g.moveTo(17 * k, -26 * k); g.quadraticCurveTo(26 * k, -24 * k, 28 * k, -18 * k); g.lineTo(17 * k, -20 * k); g.closePath(); g.fillStyle = '#ff9a4d'; g.fill(); stk(g, 1.4 * k);
      if (fire > 0) { g.fillStyle = 'rgba(255,150,60,' + fire * 4 + ')'; g.beginPath(); g.arc(17 * k, -44 * k, 6 * k, 0, 6.283); g.fill(); }
    } else if (tier === 8) {
      // golden star wand
      g.beginPath(); g.rect(15 * k, -18 * k, 3.5 * k, 36 * k); g.fillStyle = '#ffcc4d'; g.fill(); stk(g, 1.6 * k);
      const sr = 7 * k * (1 + 0.15 * Math.sin(t * 7) + (fire > 0 ? 0.3 : 0));
      g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? sr * 0.45 : sr; g.lineTo(16.7 * k + Math.cos(a) * rr, -24 * k + Math.sin(a) * rr); } g.closePath();
      g.fillStyle = '#fff27a'; g.fill(); stk(g, 1.6 * k);
    }
  }
  function drawGunner(g, k, t, fire) {
    const lw = 2.4 * k;
    // chibi gunner behind the cannon
    g.save(); g.translate(-9 * k, -2 * k);
    g.beginPath(); g.ellipse(0, 6 * k, 10 * k, 9 * k, 0, 0, 6.283); g.fillStyle = '#b07a4a'; g.fill(); stk(g, lw);
    g.beginPath(); g.ellipse(0, -10 * k, 13 * k, 12 * k, 0, 0, 6.283); g.fillStyle = '#ffdcb8'; g.fill(); stk(g, lw);
    g.beginPath(); g.arc(0, -12 * k, 13.5 * k, Math.PI, 0); g.closePath(); g.fillStyle = '#6a5a3a'; g.fill(); stk(g, lw);
    U.rr(g, -11 * k, -16 * k, 22 * k, 6 * k, 3 * k); g.fillStyle = '#5a4030'; g.fill(); stk(g, 1.4 * k);
    g.beginPath(); g.arc(-4.5 * k, -13 * k, 3 * k, 0, 6.283); g.arc(4.5 * k, -13 * k, 3 * k, 0, 6.283); g.fillStyle = '#9ef0ff'; g.fill(); stk(g, 1.4 * k);
    g.fillStyle = OL; g.beginPath(); g.ellipse(-4.5 * k, -6.5 * k, 1.8 * k, 2.2 * k, 0, 0, 6.283); g.ellipse(4.5 * k, -6.5 * k, 1.8 * k, 2.2 * k, 0, 0, 6.283); g.fill();
    g.strokeStyle = OL; g.lineWidth = 1.4 * k; g.beginPath(); g.arc(0, -2.5 * k, 2 * k, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    g.restore();
    // cannon (barrel points up the field, recoils when firing)
    const rec = fire > 0 ? fire * 30 * k : 0;
    U.rr(g, -6 * k, 6 * k, 30 * k, 12 * k, 5 * k); g.fillStyle = '#8a5a3c'; g.fill(); stk(g, lw);
    g.save(); g.translate(10 * k, 6 * k + rec * 0.5); g.rotate(-0.25);
    U.rr(g, -7 * k, -30 * k, 14 * k, 32 * k, 6 * k); g.fillStyle = '#4a5068'; g.fill(); stk(g, lw);
    g.beginPath(); g.ellipse(0, -30 * k, 7.5 * k, 3 * k, 0, 0, 6.283); g.fillStyle = '#1a1c22'; g.fill(); stk(g, 1.6 * k);
    g.fillStyle = '#ffcc4d'; g.beginPath(); g.rect(-7.5 * k, -12 * k, 15 * k, 3.5 * k); g.fill(); stk(g, 1.2 * k);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(-4 * k, -26 * k, 2.5 * k, 20 * k);
    if (fire > 0) { g.fillStyle = 'rgba(255,200,80,' + fire * 5 + ')'; g.beginPath(); g.arc(0, -36 * k, 9 * k, 0, 6.283); g.fill(); }
    g.restore();
    for (let sd = -1; sd <= 1; sd += 2) {
      g.beginPath(); g.arc(9 * k + sd * 10 * k, 18 * k, 6.5 * k, 0, 6.283); g.fillStyle = '#5a4030'; g.fill(); stk(g, lw);
      g.beginPath(); g.arc(9 * k + sd * 10 * k, 18 * k, 2.4 * k, 0, 6.283); g.fillStyle = '#ffcc4d'; g.fill();
    }
  }

  // ---------- chibi monsters ----------
  function mEyes(g, k, ex, ey, er, angry, col) {
    g.fillStyle = '#fff';
    g.beginPath(); g.ellipse(-ex, ey, er, er * 1.15, 0, 0, 6.283); g.ellipse(ex, ey, er, er * 1.15, 0, 0, 6.283); g.fill(); stk(g, 1.4 * k);
    g.fillStyle = col || OL; g.beginPath(); g.arc(-ex + er * 0.2, ey + er * 0.15, er * 0.55, 0, 6.283); g.arc(ex - er * 0.2, ey + er * 0.15, er * 0.55, 0, 6.283); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(-ex + er * 0.35, ey - er * 0.05, er * 0.2, 0, 6.283); g.arc(ex - er * 0.05, ey - er * 0.05, er * 0.2, 0, 6.283); g.fill();
    if (angry) { g.strokeStyle = OL; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(-ex - er, ey - er * 1.5); g.lineTo(-ex + er, ey - er * 0.9); g.moveTo(ex + er, ey - er * 1.5); g.lineTo(ex - er, ey - er * 0.9); g.stroke(); }
  }
  function drawMonster(g, m, t, sc) {
    const D = MONS[m.type];
    const r = D.r * sc;
    const x = m.x, wk = Math.sin(t * (m.type === 'bat' ? 18 : 8) + m.ph);
    const y = m.y + (m.type === 'slime' ? Math.abs(wk) * -3 * sc : 0);
    g.fillStyle = 'rgba(42,26,20,0.3)'; g.beginPath(); g.ellipse(x, m.y + r * 0.8, r * 0.9, r * 0.3, 0, 0, 6.283); g.fill();
    const col = m.slowT > 0 ? '#8fd8ff' : D.col;
    const k = r / 14;
    g.save(); g.translate(x, y); g.lineJoin = 'round'; g.lineCap = 'round';
    const lw = Math.max(1.5, 2.2 * k);
    if (m.type === 'slime') {
      const sq = 1 + wk * 0.08;
      g.beginPath(); g.moveTo(-15 * k * sq, 10 * k); g.quadraticCurveTo(-16 * k * sq, -12 * k / sq, 0, -13 * k / sq); g.quadraticCurveTo(16 * k * sq, -12 * k / sq, 15 * k * sq, 10 * k);
      g.quadraticCurveTo(0, 14 * k, -15 * k * sq, 10 * k); g.closePath();
      g.fillStyle = col; g.fill(); stk(g, lw);
      g.fillStyle = U.shade(col, 0.35); g.beginPath(); g.ellipse(0, 6 * k, 9 * k, 4 * k, 0, 0, 6.283); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(-7 * k, -6 * k, 3 * k, 2 * k, -0.5, 0, 6.283); g.fill();
      mEyes(g, k, 5 * k, -1 * k, 3.4 * k, false);
      g.strokeStyle = OL; g.lineWidth = 1.5 * k; g.beginPath(); g.arc(0, 4 * k, 2.4 * k, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    } else if (m.type === 'bat') {
      for (let sd = -1; sd <= 1; sd += 2) {
        g.beginPath(); g.moveTo(sd * 6 * k, -2 * k);
        g.quadraticCurveTo(sd * 20 * k, -(16 + wk * 10) * k, sd * 28 * k, (2 - wk * 4) * k);
        g.quadraticCurveTo(sd * 22 * k, -1 * k, sd * 18 * k, 4 * k); g.quadraticCurveTo(sd * 13 * k, 1 * k, sd * 7 * k, 6 * k); g.closePath();
        g.fillStyle = U.shade(col, -0.25); g.fill(); stk(g, lw);
      }
      for (let sd = -1; sd <= 1; sd += 2) { g.beginPath(); g.moveTo(sd * 4 * k, -8 * k); g.lineTo(sd * 9 * k, -18 * k); g.lineTo(sd * 10 * k, -5 * k); g.closePath(); g.fillStyle = col; g.fill(); stk(g, lw * 0.8); }
      g.beginPath(); g.arc(0, 0, 10.5 * k, 0, 6.283); g.fillStyle = col; g.fill(); stk(g, lw);
      g.fillStyle = U.shade(col, 0.3); g.beginPath(); g.ellipse(0, 5 * k, 6 * k, 4 * k, 0, 0, 6.283); g.fill();
      mEyes(g, k, 4.2 * k, -2 * k, 3 * k, true, '#ff3b3b');
      g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-3 * k, 4 * k); g.lineTo(-1.5 * k, 7.5 * k); g.lineTo(0, 4 * k); g.lineTo(1.5 * k, 7.5 * k); g.lineTo(3 * k, 4 * k); g.closePath(); g.fill(); stk(g, 1 * k);
    } else {
      // walkers: orc, dark knight, boss — chibi big-head bodies
      const big = m.type === 'boss';
      const st = wk * 2 * k;
      for (let sd = -1; sd <= 1; sd += 2) { g.beginPath(); g.ellipse(sd * 5 * k, 11 * k + sd * st, 4 * k, 4.5 * k, 0, 0, 6.283); g.fillStyle = U.shade(col, -0.45); g.fill(); stk(g, lw * 0.8); }
      if (big) {
        g.beginPath(); g.moveTo(-9 * k, -1 * k); g.quadraticCurveTo(-17 * k, 8 * k, -15 * k, 14 * k); g.lineTo(15 * k, 14 * k); g.quadraticCurveTo(17 * k, 8 * k, 9 * k, -1 * k); g.closePath();
        g.fillStyle = '#5a1a3a'; g.fill(); stk(g, lw);
      }
      U.rr(g, -9 * k, -2 * k, 18 * k, 14 * k, 6 * k);
      g.fillStyle = m.type === 'knight' ? '#4a4e60' : big ? '#3a2a4a' : col; g.fill(); stk(g, lw);
      if (m.type === 'orc') { g.fillStyle = '#8a5a3c'; g.fillRect(-9 * k, 6 * k, 18 * k, 5 * k); g.beginPath(); g.rect(-9 * k, 6 * k, 18 * k, 5 * k); stk(g, 1.2 * k); }
      // head
      const hr = 11 * k;
      g.beginPath(); g.ellipse(0, -11 * k, hr * 1.1, hr, 0, 0, 6.283);
      g.fillStyle = m.type === 'knight' ? '#6a7088' : col; g.fill(); stk(g, lw);
      if (m.type === 'orc') {
        for (let sd = -1; sd <= 1; sd += 2) { g.beginPath(); g.moveTo(sd * 11 * k, -14 * k); g.lineTo(sd * 17 * k, -18 * k); g.lineTo(sd * 12 * k, -9 * k); g.closePath(); g.fillStyle = col; g.fill(); stk(g, lw * 0.8); }
        mEyes(g, k, 4.5 * k, -13 * k, 2.6 * k, true, '#c8202a');
        g.fillStyle = '#fffbe0';
        for (let sd = -1; sd <= 1; sd += 2) { g.beginPath(); g.moveTo(sd * 5 * k, -5 * k); g.lineTo(sd * 4 * k, -10 * k); g.lineTo(sd * 2 * k, -5 * k); g.closePath(); g.fill(); stk(g, 1 * k); }
        // club
        g.save(); g.translate(12 * k, 4 * k); g.rotate(0.3 + wk * 0.2);
        U.rr(g, -2 * k, -18 * k, 4 * k, 20 * k, 2 * k); g.fillStyle = '#9a6a40'; g.fill(); stk(g, lw * 0.8);
        g.beginPath(); g.ellipse(0, -18 * k, 5 * k, 7 * k, 0, 0, 6.283); g.fillStyle = '#9a6a40'; g.fill(); stk(g, lw * 0.8);
        g.restore();
      } else if (m.type === 'knight') {
        g.fillStyle = OL; U.rr(g, -8 * k, -14 * k, 16 * k, 5 * k, 2.5 * k); g.fill();
        g.fillStyle = '#ff4040'; g.beginPath(); g.arc(-3.5 * k, -11.5 * k, 1.5 * k, 0, 6.283); g.arc(3.5 * k, -11.5 * k, 1.5 * k, 0, 6.283); g.fill();
        g.beginPath(); g.moveTo(0, -21 * k); g.quadraticCurveTo(6 * k, -30 * k, 12 * k, -26 * k); g.quadraticCurveTo(6 * k, -24 * k, 2 * k, -20 * k); g.closePath(); g.fillStyle = '#c0392b'; g.fill(); stk(g, 1.2 * k);
        g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.ellipse(-6 * k, -17 * k, 3 * k, 1.6 * k, -0.4, 0, 6.283); g.fill();
        // shield
        g.beginPath(); g.moveTo(-17 * k, -3 * k); g.lineTo(-7 * k, -3 * k); g.lineTo(-7 * k, 6 * k); g.quadraticCurveTo(-12 * k, 13 * k, -12 * k, 13 * k); g.quadraticCurveTo(-17 * k, 9 * k, -17 * k, 6 * k); g.closePath();
        g.fillStyle = '#c0392b'; g.fill(); stk(g, lw);
        g.fillStyle = '#ffe27a'; g.fillRect(-13 * k, -1 * k, 2 * k, 9 * k);
      } else if (big) {
        // demon king: horns, crown, fangs, glowing eyes
        for (let sd = -1; sd <= 1; sd += 2) { g.beginPath(); g.moveTo(sd * 7 * k, -19 * k); g.quadraticCurveTo(sd * 18 * k, -22 * k, sd * 17 * k, -32 * k); g.quadraticCurveTo(sd * 12 * k, -24 * k, sd * 3 * k, -21 * k); g.closePath(); g.fillStyle = '#f2e6c8'; g.fill(); stk(g, lw * 0.8); }
        g.beginPath(); g.moveTo(-7 * k, -19 * k);
        for (let i = 0; i <= 4; i++) g.lineTo(-7 * k + i * 3.5 * k, -19 * k - (i % 2 ? 3 : 8) * k);
        g.lineTo(7 * k, -19 * k); g.closePath(); g.fillStyle = '#ffcc4d'; g.fill(); stk(g, lw * 0.7);
        mEyes(g, k, 4.5 * k, -12 * k, 2.8 * k, true, '#ffcc00');
        g.fillStyle = OL; U.rr(g, -5 * k, -6 * k, 10 * k, 3.5 * k, 1.5 * k); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-4 * k, -6 * k); g.lineTo(-3 * k, -3.5 * k); g.lineTo(-2 * k, -6 * k); g.moveTo(2 * k, -6 * k); g.lineTo(3 * k, -3.5 * k); g.lineTo(4 * k, -6 * k); g.fill();
      }
      if (m.type !== 'knight') { g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(-6 * k, -17 * k, 3 * k, 1.8 * k, -0.4, 0, 6.283); g.fill(); }
    }
    g.restore();
    if (m.flash > 0) {
      g.globalAlpha = Math.min(1, m.flash * 10) * 0.7; g.fillStyle = '#fff';
      g.beginPath(); g.arc(x, y - r * 0.2, r * 0.95, 0, 6.283); g.fill(); g.globalAlpha = 1;
    }
    if (m.hp < m.max) {
      const bw = Math.max(22, r * 1.8), by = y - r * (m.boss ? 2.45 : m.type === 'knight' ? 2.25 : 1.8);
      U.rr(g, x - bw / 2 - 2, by - 2, bw + 4, 8, 4); g.fillStyle = OL; g.fill();
      g.fillStyle = m.boss ? '#ff3b54' : '#7dff8a';
      U.rr(g, x - bw / 2, by, Math.max(2, bw * m.hp / m.max), 4, 2); g.fill();
    }
  }

  function fmt(n) {
    n = Math.ceil(n);
    if (n < 1000) return String(n);
    if (n < 1e4) return (n / 1000).toFixed(1) + 'K';
    if (n < 1e6) return Math.round(n / 1000) + 'K';
    return (n / 1e6).toFixed(1) + 'M';
  }

  // ---------- level parameters ----------
  // Monster HP follows a model of the DPS a player reaches by wave w (measured with the check bot:
  // ~8.5w + 0.25w^2 - 4 with greedy buying/merging), times a difficulty factor `m`.
  function dpsModel(w) { return Math.max(4, 8.5 * w + 0.25 * w * w - 4); }
  function params(L, diff, endless) {
    return {
      m: [0.35, 0.42, 0.46][diff] * (1 + Math.min(0.15, (L - 1) * 0.005)),
      waves: endless ? 1e9 : Math.min([12, 15, 18][diff], [4, 6, 8][diff] + Math.floor((L - 1) / 3)),
      wallHp: [120, 100, 80][diff],
      coins: [30, 26, 22][diff],
      start: diff === 0 ? 2 : 1,
      spd: [1, 1.12, 1.28][diff],
      diff,
    };
  }

  MG.register({
    id: 'merge', name: '合成守城', icon: '🏰', color: '#ff5d6c', endless: true,
    create(api) {
      const L = api.level, DIFF = api.diff || 0, ENDLESS = !!api.endless, rng = api.rng;
      const P = params(L, DIFF, ENDLESS);
      const COLS = 5, ROWS = 3, NS = COLS * ROWS;
      let W, H, sc, fieldTop, wallY, slot, boardX, boardY, btn, lanes, bg = null;
      function layout() {
        W = api.W; H = api.H;
        sc = U.clamp(Math.min(W / 390, H / 700), 0.7, 1.6);
        fieldTop = 50;
        const bh = Math.max(48, Math.min(60, H * 0.08));
        slot = Math.min((W - 20) / COLS, (H * 0.3) / ROWS, 88);
        boardX = (W - slot * COLS) / 2;
        const btnY = H - 10 - bh;
        boardY = btnY - 8 - slot * ROWS;
        wallY = boardY - 26 * sc;
        const bw = Math.min(W - 40, 270);
        btn = { x: (W - bw) / 2, y: btnY, w: bw, h: bh };
        lanes = [W * 0.2, W * 0.5, W * 0.8];
        bg = null;
      }
      layout();
      function slotXY(i) { return [boardX + (i % COLS + 0.5) * slot, boardY + (Math.floor(i / COLS) + 0.5) * slot]; }
      function slotAt(x, y) {
        const c = Math.floor((x - boardX) / slot), r = Math.floor((y - boardY) / slot);
        if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return -1;
        return r * COLS + c;
      }

      const S = {
        coins: P.coins, buys: 0, wave: 0, wallHp: P.wallHp, wallMax: P.wallHp, kills: 0,
        units: new Array(NS).fill(null), mons: [], queue: [], spawnT: 0, breakT: 2.2, over: false, T: 0, merges: 0, bestTier: 0,
      };
      let anim = 0, shake = 0, wallFlash = 0, drag = null, hintT = 6, lastInfo = '', btnPress = 0, btnShake = 0, coinPop = 0;
      let hitSnd = 0, shootSnd = 0;
      const banners = [];
      function banner(text, col, size) { banners.push({ text, col, size: size || 34, t: 0 }); if (banners.length > 3) banners.shift(); }

      const parts = []; for (let i = 0; i < 300; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', size: 3, grav: 0 });
      let pCur = 0;
      const texts = []; for (let i = 0; i < 50; i++) texts.push({ on: false, x: 0, y: 0, t: 0, s: '', col: '#fff', size: 14, max: 0.8 });
      let tCur = 0;
      const shots = []; for (let i = 0; i < 160; i++) shots.push({ on: false, x: 0, y: 0, tx: 0, ty: 0, tgt: null, tier: 0, dmg: 0, t: 0 });
      const zaps = []; for (let i = 0; i < 30; i++) zaps.push({ on: false, x0: 0, y0: 0, x1: 0, y1: 0, t: 0 });
      const flyCoins = []; for (let i = 0; i < 30; i++) flyCoins.push({ on: false, x: 0, y: 0, t: 0, sx: 0, sy: 0 });

      function addPart(x, y, vx, vy, life, col, size, grav) {
        const p = parts[pCur]; pCur = (pCur + 1) % parts.length;
        p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size; p.grav = grav || 0;
      }
      function burst(x, y, n, col, spd, size) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * 6.283, v = spd * (0.3 + Math.random() * 0.7);
          addPart(x, y, Math.cos(a) * v, Math.sin(a) * v - spd * 0.2, 0.35 + Math.random() * 0.4, col, size * (0.6 + Math.random() * 0.8), 400);
        }
      }
      function addText(x, y, s, col, size, max) {
        const t = texts[tCur]; tCur = (tCur + 1) % texts.length;
        t.on = true; t.x = x; t.y = y; t.s = s; t.col = col; t.size = size; t.t = 0; t.max = max || 0.8;
      }

      function newUnit(tier) { return { tier, cd: 0.3 + Math.random() * 0.4, pop: 1, fire: 0 }; }
      {
        const startSlots = [7, 6, 8];
        for (let i = 0; i < P.start; i++) S.units[startSlots[i]] = newUnit(0);
      }
      function cost() { return 8 + S.buys * 2; }

      // ---------- waves ----------
      function countOf(w) { return Math.min(26, Math.round(6 + 0.8 * w + 1.2 * DIFF)); }
      function gapOf(w) { return (8 + 0.55 * Math.min(w, 30) - 0.5 * DIFF) / countOf(w); }
      function waveHp(w) { return P.m * dpsModel(w) * gapOf(w) * (ENDLESS ? Math.pow(1.035, w) : 1); }
      function isBossWave(w) { return ENDLESS ? (w % 5 === 0) : (w === P.waves || (w % 5 === 0)); }
      function buildWave(w) {
        const we = w + DIFF * 2;
        const n = countOf(w);
        const gap = gapOf(w);
        const q = [];
        let t = 0;
        for (let i = 0; i < n; i++) {
          const r = rng();
          let type = 'slime';
          if (we >= 2 && r < 0.22) type = 'bat';
          else if (we >= 4 && r < 0.4) type = 'knight';
          else if (we >= 6 && r < 0.52) type = 'orc';
          const lane = Math.floor(rng() * 3);
          const pack = we >= 3 && rng() < 0.25;
          q.push({ t, type, lane, jit: rng() * 2 - 1 });
          t += pack ? gap * 0.3 : gap * (0.7 + rng() * 0.6);
        }
        if (isBossWave(w)) q.push({ t: t * 0.55, type: 'boss', lane: 1, jit: 0 });
        q.sort((a, b) => a.t - b.t);
        // normalise so the whole wave carries waveHp(w) per spawn slot on average
        let sum = 0;
        for (let i = 0; i < q.length; i++) if (q[i].type !== 'boss') sum += MONS[q[i].type].hp;
        const k = n / sum;
        for (let i = 0; i < q.length; i++) q[i].hpk = k;
        return q;
      }
      function startWave() {
        S.wave++;
        S.queue = buildWave(S.wave);
        S.paid = false;
        S.spawnT = 0;
        if (ENDLESS) api.score(S.wave);
        const boss = isBossWave(S.wave);
        banner(boss ? '第 ' + S.wave + ' 波 · BOSS！' : '第 ' + S.wave + ' 波', boss ? '#ff5d6c' : '#ffe27a', boss ? 38 : 34);
        api.sfx(boss ? 'bad' : 'tap');
      }
      function spawn(e) {
        const D = MONS[e.type];
        const hp = waveHp(S.wave) * D.hp * e.hpk;
        const fh = wallY - fieldTop;
        S.mons.push({
          type: e.type, boss: e.type === 'boss', x: lanes[e.lane] + e.jit * W * 0.055, y: fieldTop - 16 * sc, hp, max: hp, incoming: 0,
          spd: fh / 9.5 * D.spd * P.spd * (1 + Math.min(0.35, S.wave * 0.015)), atk: D.atk * (1 + 0.08 * (S.wave + DIFF * 2)),
          slowT: 0, flash: 0, ph: Math.random() * 6, atWall: false, dead: false, hitT: 0,
        });
        if (e.type === 'boss') { shake = Math.max(shake, 8); }
      }

      // ---------- combat ----------
      function pickTarget(dmg) {
        let best = null, by = -1e9;
        for (let i = 0; i < S.mons.length; i++) {
          const m = S.mons[i];
          if (m.dead || m.incoming >= m.hp) continue;
          const yy = m.y + (m.atWall ? 1000 : 0);
          if (yy > by) { by = yy; best = m; }
        }
        if (!best) for (let i = 0; i < S.mons.length; i++) { const m = S.mons[i]; if (!m.dead && m.y > by) { by = m.y; best = m; } }
        return best;
      }
      function fire(i, u) {
        const T = TIERS[u.tier];
        const dmg = T.dmg;
        const [x, y] = slotXY(i);
        let fired = 0;
        for (let k = 0; k < (T.multi || 1); k++) {
          const m = pickTarget(dmg);
          if (!m) break;
          const s = shots.find((o) => !o.on);
          if (!s) break;
          s.on = true; s.x = x + (k - ((T.multi || 1) - 1) / 2) * slot * 0.2; s.y = y - slot * 0.3; s.tgt = m; s.tx = m.x; s.ty = m.y; s.tier = u.tier; s.dmg = dmg; s.t = 0;
          m.incoming += dmg;
          fired++;
        }
        if (!fired) return false;
        u.fire = 0.12;
        if (shootSnd <= 0) { api.sfx('shoot'); shootSnd = 0.1; }
        return true;
      }
      function damage(m, d) {
        if (m.dead) return;
        m.hp -= d; m.flash = 0.08;
        if (m.hp <= 0) kill(m);
      }
      function kill(m) {
        m.dead = true; S.kills++;
        const D = MONS[m.type];
        const c = Math.round(D.coin * (3 + S.wave * 1.5));
        S.coins += c;
        burst(m.x, m.y, m.boss ? 40 : 12, D.col, m.boss ? 300 : 170, m.boss ? 7 : 4.5);
        addText(m.x, m.y - 10, '+' + c, '#ffe27a', m.boss ? 22 : 15, 0.8);
        const fc = flyCoins.find((o) => !o.on);
        if (fc) { fc.on = true; fc.sx = m.x; fc.sy = m.y; fc.t = 0; }
        if (m.boss) { shake = 14; banner('擊倒 BOSS！', '#7dffa8', 40); api.sfx('good'); }
        else api.sfx('pop');
      }
      function impact(s) {
        const T = TIERS[s.tier];
        let m = s.tgt;
        if (m) m.incoming = Math.max(0, m.incoming - s.dmg);
        const x = s.tx, y = s.ty;
        if (m && !m.dead) damage(m, s.dmg);
        if (T.splash) {
          const R = T.splash * sc;
          for (let i = 0; i < S.mons.length; i++) {
            const o = S.mons[i]; if (o.dead || o === m) continue;
            const dx = o.x - x, dy = o.y - y;
            if (dx * dx + dy * dy < R * R) { damage(o, s.dmg * 0.6); if (T.slow) o.slowT = 1.6; }
          }
          burst(x, y, 10, T.pc, 160, 5);
          if (s.tier >= 5) shake = Math.max(shake, 3);
        }
        if (T.slow && m) m.slowT = 1.6;
        if (T.chain) {
          let px = x, py = y, last = m;
          const hitSet = [m];
          for (let k = 0; k < T.chain; k++) {
            let nb = null, nd = 1e9;
            for (let i = 0; i < S.mons.length; i++) {
              const o = S.mons[i]; if (o.dead || hitSet.indexOf(o) >= 0) continue;
              const d = (o.x - px) * (o.x - px) + (o.y - py) * (o.y - py);
              if (d < nd && d < (130 * sc) * (130 * sc)) { nd = d; nb = o; }
            }
            if (!nb) break;
            hitSet.push(nb);
            const z = zaps.find((o) => !o.on);
            if (z) { z.on = true; z.x0 = px; z.y0 = py; z.x1 = nb.x; z.y1 = nb.y; z.t = 0; }
            damage(nb, s.dmg * 0.7);
            px = nb.x; py = nb.y; last = nb;
          }
        }
        for (let i = 0; i < 5; i++) addPart(x, y, (Math.random() - 0.5) * 140, (Math.random() - 0.5) * 140, 0.25, T.pc, 3.5, 0);
        if (hitSnd <= 0) { api.sfx('hit'); hitSnd = 0.06; }
      }

      // ---------- input: buy / drag merge ----------
      function buy() {
        const c = cost();
        const empty = [];
        for (let i = 0; i < NS; i++) if (!S.units[i]) empty.push(i);
        if (!empty.length) { btnShake = 0.35; api.sfx('bad'); addText(W / 2, btn.y - 14, '格子滿了！合成吧', '#ff9aa5', 15, 1.1); return false; }
        if (S.coins < c) { btnShake = 0.35; api.sfx('bad'); addText(W / 2, btn.y - 14, '金幣不足', '#ff9aa5', 15, 1); return false; }
        S.coins -= c; S.buys++;
        const mid = [7, 6, 8, 2, 12, 1, 3, 11, 13, 5, 9, 0, 4, 10, 14];
        let at = empty[0];
        for (let k = 0; k < mid.length; k++) if (!S.units[mid[k]]) { at = mid[k]; break; }
        S.units[at] = newUnit(0);
        const [x, y] = slotXY(at);
        burst(x, y, 10, '#ffe27a', 140, 4);
        btnPress = 1; api.sfx('drop');
        return true;
      }
      function tryDrop(from, to) {
        const a = S.units[from];
        if (to < 0 || to === from) { if (a) a.pop = 0.5; return 'back'; }
        const b = S.units[to];
        if (!b) { S.units[to] = a; S.units[from] = null; a.pop = 0.6; api.sfx('tap'); return 'move'; }
        if (b.tier === a.tier && a.tier < MAXT) {
          S.units[from] = null; b.tier++; b.pop = 1.4; b.cd = 0.2; S.merges++;
          const [x, y] = slotXY(to);
          burst(x, y, 24, TIERS[b.tier].col, 240, 6);
          burst(x, y, 10, '#ffffff', 180, 4);
          addText(x, y - slot * 0.5, TIERS[b.tier].name + '！', TIERS[b.tier].col, 17, 1);
          shake = Math.max(shake, 3);
          api.sfx('good');
          if (b.tier >= 4 && b.tier > S.bestTier) banner('新兵種：' + TIERS[b.tier].name, TIERS[b.tier].col, 30);
          S.bestTier = Math.max(S.bestTier || 0, b.tier);
          return 'merge';
        }
        if (b.tier === a.tier) { a.pop = 0.5; api.sfx('bad'); shake = Math.max(shake, 3); return 'max'; }
        S.units[to] = a; S.units[from] = b; a.pop = 0.6; b.pop = 0.6; api.sfx('tap'); return 'swap';
      }
      function down(x, y) {
        if (api.ended || S.over) return;
        hintT = Math.min(hintT, 0.6);
        if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y - 4 && y <= btn.y + btn.h + 4) { buy(); return; }
        const i = slotAt(x, y);
        if (i >= 0 && S.units[i]) { drag = { from: i, x, y, x0: x, y0: y }; api.sfx('tap'); }
      }
      function move(x, y) { if (drag) { drag.x = x; drag.y = y; } }
      function up(x, y) {
        if (!drag) return;
        const d = drag; drag = null;
        if (api.ended || S.over) return;
        const to = slotAt(x, y);
        if (Math.hypot(x - d.x0, y - d.y0) < 8 && (to === d.from || to < 0)) { const u = S.units[d.from]; if (u) u.pop = 0.6; return; }
        tryDrop(d.from, to);
      }

      // ---------- update ----------
      function update(dt) {
        anim += dt;
        updFx(dt);
        if (api.ended || S.over) return;
        S.T += dt;
        hintT -= dt; hitSnd -= dt; shootSnd -= dt; wallFlash -= dt;
        if (btnPress > 0) btnPress = Math.max(0, btnPress - dt * 4);
        if (btnShake > 0) btnShake -= dt;
        // waves
        if (S.queue.length === 0 && S.mons.length === 0) {
          if (S.wave >= P.waves) {
            S.over = true;
            for (let i = 0; i < 60; i++) addPart(Math.random() * W, -10, (Math.random() - 0.5) * 200, Math.random() * 200, 2 + Math.random(), U.PALETTE[i % 8], 6, 300);
            banner('守住了！', '#7dffa8', 44);
            api.win('城牆守住了！擊殺 ' + S.kills + ' 隻');
            return;
          }
          if (S.breakT <= 0) { S.breakT = S.wave === 0 ? 0 : 2.4; }
          S.breakT -= dt;
          if (S.breakT <= 0) startWave();
        } else {
          S.spawnT += dt;
          while (S.queue.length && S.queue[0].t <= S.spawnT) spawn(S.queue.shift());
          if (S.queue.length === 0 && S.mons.length === 0) S.breakT = 2.4;
        }
        if (S.wave > 0 && !S.paid && S.queue.length === 0 && S.mons.length === 0) {
          S.paid = true;
          const bonus = 10 + 5 * S.wave;
          S.coins += bonus; coinPop = 1;
          addText(W / 2, wallY - 40 * sc, '過波獎勵 +' + bonus, '#ffe27a', 18, 1.3);
          api.sfx('good');
        }
        // units fire
        for (let i = 0; i < NS; i++) {
          const u = S.units[i]; if (!u) continue;
          if (u.pop > 0) u.pop = Math.max(0, u.pop - dt * 3);
          if (u.fire > 0) u.fire -= dt;
          if (drag && drag.from === i) continue;
          u.cd -= dt;
          if (u.cd <= 0) { if (fire(i, u)) u.cd += 1 / TIERS[u.tier].rate; else u.cd = 0.05; }
        }
        // shots
        const spd = 720 * sc;
        for (let i = 0; i < shots.length; i++) {
          const s = shots[i]; if (!s.on) continue;
          s.t += dt;
          if (s.tgt && !s.tgt.dead) { s.tx = s.tgt.x; s.ty = s.tgt.y - 4 * sc; }
          const dx = s.tx - s.x, dy = s.ty - s.y, d = Math.hypot(dx, dy);
          const st = spd * dt * (s.tier === 5 ? 0.8 : 1);
          if (d <= st + 2) { s.on = false; impact(s); continue; }
          s.x += dx / d * st; s.y += dy / d * st;
        }
        // monsters
        const stopY = wallY - 15 * sc;
        let atWallN = 0;
        for (let i = S.mons.length - 1; i >= 0; i--) {
          const m = S.mons[i];
          if (m.dead) { S.mons.splice(i, 1); continue; }
          m.flash -= dt; if (m.slowT > 0) m.slowT -= dt;
          const r = MONS[m.type].r * sc;
          if (!m.atWall) {
            m.y += m.spd * dt * (m.slowT > 0 ? 0.5 : 1);
            if (m.y + r * 0.8 >= stopY) { m.y = stopY - r * 0.8; m.atWall = true; }
          } else {
            atWallN++;
            m.hitT -= dt;
            const d = m.atk * dt;
            S.wallHp -= d;
            if (m.hitT <= 0) {
              m.hitT = 0.6; wallFlash = 0.15; shake = Math.max(shake, m.boss ? 7 : 2.5);
              for (let k = 0; k < 4; k++) addPart(m.x + (Math.random() - 0.5) * r, stopY, (Math.random() - 0.5) * 120, -Math.random() * 120, 0.4, '#b9b2c4', 4, 500);
              if (hitSnd <= 0) { api.sfx('hit'); hitSnd = 0.1; }
            }
          }
        }
        if (S.wallHp <= 0) {
          S.wallHp = 0; S.over = true; shake = 18;
          for (let i = 0; i < 50; i++) addPart(Math.random() * W, wallY, (Math.random() - 0.5) * 300, -Math.random() * 300, 1, '#b9b2c4', 7, 600);
          banner('城牆倒了…', '#ff5d6c', 40);
          api.sfx('bad');
          api.lose(ENDLESS ? '守到第 ' + S.wave + ' 波，擊殺 ' + S.kills + ' 隻' : '城牆被攻破了！第 ' + S.wave + '/' + P.waves + ' 波');
          return;
        }
        let info;
        if (L === 1 && DIFF === 0 && S.T < 16) info = '點「招募」買弓箭手，把兩個相同的拖在一起合成！';
        else if (ENDLESS) info = '無盡模式 · 第 ' + S.wave + ' 波 · 每 5 波 BOSS';
        else info = '第 ' + S.wave + '/' + P.waves + ' 波 · 守住城牆';
        if (info !== lastInfo) { lastInfo = info; api.info(info); }
      }
      function updFx(dt) {
        if (shake > 0) shake = Math.max(0, shake - dt * 40);
        if (coinPop > 0) coinPop = Math.max(0, coinPop - dt * 4);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
          p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        }
        for (let i = 0; i < texts.length; i++) { const t = texts[i]; if (!t.on) continue; t.t += dt; t.y -= 36 * dt; if (t.t >= t.max) t.on = false; }
        for (let i = 0; i < zaps.length; i++) { const z = zaps[i]; if (!z.on) continue; z.t += dt; if (z.t > 0.18) z.on = false; }
        for (let i = 0; i < flyCoins.length; i++) { const c = flyCoins[i]; if (!c.on) continue; c.t += dt * 1.8; if (c.t >= 1) { c.on = false; coinPop = 1; } }
        for (let i = banners.length - 1; i >= 0; i--) { banners[i].t += dt; if (banners[i].t > 1.5) banners.splice(i, 1); }
      }

      // ---------- draw ----------
      function buildBg() {
        const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
        const c = document.createElement('canvas');
        c.width = Math.ceil(W * dpr); c.height = Math.ceil(H * dpr);
        const x = c.getContext('2d'); x.scale(dpr, dpr);
        drawBackground(x, W, H, fieldTop, wallY, lanes, sc);
        bg = c;
      }
      function drawShot(g, s) {
        const T = TIERS[s.tier];
        const dx = s.tx - s.x, dy = s.ty - s.y, a = Math.atan2(dy, dx);
        g.save(); g.translate(s.x, s.y); g.rotate(a);
        const k = sc;
        g.lineJoin = 'round'; g.lineCap = 'round';
        if (T.kind === 'arrow' || T.kind === 'bolt') {
          g.beginPath(); g.moveTo(-12 * k, 0); g.lineTo(6 * k, 0);
          g.strokeStyle = OL; g.lineWidth = 4.2 * k; g.stroke();
          g.strokeStyle = T.kind === 'arrow' ? '#c08a5a' : '#8a90a6'; g.lineWidth = 2.2 * k; g.stroke();
          g.beginPath(); g.moveTo(11 * k, 0); g.lineTo(4 * k, -4 * k); g.lineTo(4 * k, 4 * k); g.closePath(); g.fillStyle = '#f4f6ff'; g.fill(); stk(g, 1.4 * k);
          g.beginPath(); g.rect(-14 * k, -3.5 * k, 5 * k, 7 * k); g.fillStyle = T.col; g.fill(); stk(g, 1.2 * k);
        } else if (T.kind === 'cannon') {
          g.beginPath(); g.arc(0, 0, 6.5 * k, 0, 6.283); g.fillStyle = '#3a3f52'; g.fill(); stk(g, 2 * k);
          g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.arc(-2 * k, -2 * k, 2 * k, 0, 6.283); g.fill();
        } else {
          const r = (s.tier >= 7 ? 9 : 7) * k;
          g.fillStyle = T.pc; g.globalAlpha = 0.45;
          g.beginPath(); g.ellipse(-r, 0, r * 2, r * 0.8, 0, 0, 6.283); g.fill();
          g.globalAlpha = 1;
          g.beginPath(); g.arc(0, 0, r * 0.8, 0, 6.283); g.fillStyle = s.tier === 3 ? '#ffffff' : T.col; g.fill(); stk(g, 1.8 * k);
          g.fillStyle = '#fff'; g.beginPath(); g.arc(-r * 0.2, -r * 0.2, r * 0.3, 0, 6.283); g.fill();
        }
        g.restore();
      }
      function draw(g) {
        if (!bg) buildBg();
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        g.fillStyle = '#b89a7a'; g.fillRect(-20, -20, W + 40, H + 40);
        g.drawImage(bg, 0, 0, W, H);
        // monsters sorted by y (few, sort in place)
        S.mons.sort((a, b) => a.y - b.y);
        for (let i = 0; i < S.mons.length; i++) drawMonster(g, S.mons[i], anim, sc);
        drawWall(g, W, wallY, sc, S.wallHp, S.wallMax, wallFlash, anim);
        // board
        for (let i = 0; i < NS; i++) {
          const [x, y] = slotXY(i);
          const s = slot * 0.92;
          const hl = drag && slotAt(drag.x, drag.y) === i && drag.from !== i;
          const can = drag && S.units[i] && S.units[drag.from] && S.units[i].tier === S.units[drag.from].tier && i !== drag.from;
          U.rr(g, x - s / 2, y - s / 2 + 3, s, s, s * 0.2); g.fillStyle = 'rgba(42,26,20,0.25)'; g.fill();
          U.rr(g, x - s / 2, y - s / 2, s, s, s * 0.2);
          g.fillStyle = can ? '#9af0b0' : hl ? '#f2d8a8' : '#d8b07a'; g.fill();
          g.lineWidth = can ? 3.5 : 2.5; g.strokeStyle = can ? '#1f9a50' : OL; g.stroke();
          g.fillStyle = 'rgba(255,255,255,0.3)'; U.rr(g, x - s / 2 + 5, y - s / 2 + 4, s - 10, s * 0.12, s * 0.06); g.fill();
          g.strokeStyle = 'rgba(42,26,20,0.15)'; g.lineWidth = 1.5;
          g.beginPath(); g.moveTo(x - s / 2 + 4, y - s * 0.12); g.lineTo(x + s / 2 - 4, y - s * 0.12); g.moveTo(x - s / 2 + 4, y + s * 0.2); g.lineTo(x + s / 2 - 4, y + s * 0.2); g.stroke();
        }
        for (let i = 0; i < NS; i++) {
          const u = S.units[i]; if (!u || (drag && drag.from === i)) continue;
          const [x, y] = slotXY(i);
          const p = u.pop > 0 ? 1 + 0.25 * Math.sin(Math.min(1, u.pop) * Math.PI) : 1;
          g.save(); g.translate(x, y); g.scale(p, p);
          drawUnit(g, u.tier, 0, slot * 0.02, slot * 0.82, anim + i, u.fire);
          g.restore();
          drawBadge(g, u.tier, x + slot * 0.3, y - slot * 0.33);
        }
        // shots
        for (let i = 0; i < shots.length; i++) if (shots[i].on) drawShot(g, shots[i]);
        g.lineCap = 'round';
        for (let i = 0; i < zaps.length; i++) {
          const z = zaps[i]; if (!z.on) continue;
          g.globalAlpha = 1 - z.t / 0.18;
          g.beginPath(); g.moveTo(z.x0, z.y0);
          for (let k = 1; k < 5; k++) g.lineTo(U.lerp(z.x0, z.x1, k / 5) + (Math.random() - 0.5) * 14, U.lerp(z.y0, z.y1, k / 5) + (Math.random() - 0.5) * 14);
          g.lineTo(z.x1, z.y1); g.lineJoin = 'round';
          g.strokeStyle = OL; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#fff27a'; g.lineWidth = 3; g.stroke();
        }
        g.globalAlpha = 1;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i]; if (!p.on) continue;
          g.globalAlpha = Math.min(1, p.life / p.max * 1.5); g.fillStyle = p.col;
          g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        g.globalAlpha = 1;
        for (let i = 0; i < texts.length; i++) {
          const t = texts[i]; if (!t.on) continue;
          const k = t.t / t.max;
          g.globalAlpha = k > 0.6 ? (1 - k) / 0.4 : 1;
          olText(g, t.s, t.x, t.y, t.size, t.col, 4);
        }
        g.globalAlpha = 1;
        g.restore();
        drawButton(g);
        drawHud(g);
        // dragged unit on top
        if (drag && S.units[drag.from]) {
          const u = S.units[drag.from];
          g.globalAlpha = 0.95;
          drawUnit(g, u.tier, drag.x, drag.y - slot * 0.35, slot * 0.95, anim, 0);
          g.globalAlpha = 1;
          drawBadge(g, u.tier, drag.x + slot * 0.32, drag.y - slot * 0.8);
        }
        for (let i = 0; i < banners.length; i++) {
          const b = banners[i];
          const k = Math.min(1, b.t / 0.35), s = U.easeOutBack(k);
          g.globalAlpha = b.t > 1.2 ? Math.max(0, 1 - (b.t - 1.2) / 0.3) : 1;
          const sz = Math.min(b.size, W / 9) * s;
          const yy = fieldTop + (wallY - fieldTop) * 0.4 + i * 46;
          olText(g, b.text, W / 2, yy, sz, b.col, 7);
        }
        g.globalAlpha = 1;
        if (hintT > 0 && L === 1 && !api.ended) {
          g.globalAlpha = Math.min(1, hintT) * (0.6 + 0.4 * Math.sin(anim * 5));
          U.text(g, '👇', W / 2 + 60, btn.y - 22 + Math.sin(anim * 6) * 5, 26, '#fff');
          g.globalAlpha = 1;
        }
      }
      function drawBadge(g, tier, x, y) {
        const T = TIERS[tier];
        g.beginPath(); g.arc(x, y, 9.5, 0, 6.283); g.fillStyle = T.col; g.fill(); g.lineWidth = 2.2; g.strokeStyle = OL; g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(x - 3, y - 4, 3.5, 1.8, -0.4, 0, 6.283); g.fill();
        olText(g, String(tier + 1), x, y + 0.5, 12, '#fff', 3);
      }
      function drawButton(g) {
        const c = cost();
        const ok = S.coins >= c && S.units.some((u) => !u);
        const sx = btnShake > 0 ? Math.sin(btnShake * 60) * 6 : 0;
        const pr = btnPress * 3;
        const x = btn.x + sx, y = btn.y + pr, w = btn.w, h = btn.h;
        U.rr(g, x, btn.y + 5, w, h, h / 2); g.fillStyle = ok ? '#c86a10' : '#5a5568'; g.fill(); g.lineWidth = 3.5; g.strokeStyle = OL; g.stroke();
        U.rr(g, x, y, w, h, h / 2); g.fillStyle = ok ? '#ffb02e' : '#9a95a8'; g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.4)'; U.rr(g, x + 10, y + 4, w - 20, h * 0.28, h * 0.14); g.fill();
        olText(g, '招募弓箭手', x + w / 2, y + h * 0.38, Math.min(19, h * 0.35), '#ffffff', 4.5);
        olText(g, '💰 ' + c, x + w / 2, y + h * 0.74, Math.min(15, h * 0.28), ok ? '#fff3a0' : '#e8e4f0', 3.5);
      }
      function drawHud(g) {
        const pad = 8;
        const pill = (x, y, w, h) => { U.rr(g, x, y, w, h, h / 2); g.fillStyle = 'rgba(255,244,220,0.95)'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke(); };
        pill(pad, pad, 112, 34);
        const cp = 1 + coinPop * 0.25;
        U.text(g, '💰', pad + 18, pad + 17, 17 * cp, '#fff');
        olText(g, fmt(S.coins), pad + 34, pad + 18, 17, '#ffcc4d', 4, 'left');
        pill(W - pad - 112, pad, 112, 34);
        olText(g, ENDLESS ? '🌊 第 ' + S.wave + ' 波' : '🌊 ' + S.wave + ' / ' + P.waves, W - pad - 56, pad + 17, 15, '#fff', 4);
        const cw = Math.min(140, W - 260);
        if (cw > 70) {
          pill(W / 2 - cw / 2, pad, cw, 34);
          if (ENDLESS) {
            olText(g, '最高 ' + Math.max(api.best || 0, S.wave) + ' 波', W / 2, pad + 17, 13, '#ffcc4d', 3.5);
          } else {
            olText(g, '擊殺 ' + S.kills, W / 2, pad + 17, 13, '#fff', 3.5);
          }
        }
        // wall hp bar on the wall
        const bw = Math.min(W - 80, 220), bx = W / 2 - bw / 2, by = wallY - 6;
        U.rr(g, bx - 3, by - 3, bw + 6, 14, 7); g.fillStyle = '#5a4a5a'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke();
        const f = Math.max(0, S.wallHp / S.wallMax);
        g.fillStyle = f > 0.5 ? '#7dff8a' : f > 0.25 ? '#ffcc4d' : '#ff5d6c';
        U.rr(g, bx, by, Math.max(4, bw * f), 8, 4); g.fill();
        olText(g, '🏰 ' + Math.ceil(S.wallHp), W / 2, by + 4, 10, '#fff', 3);
        // flying coins to counter
        for (let i = 0; i < flyCoins.length; i++) {
          const c = flyCoins[i]; if (!c.on) continue;
          const e = U.easeOutCubic(c.t);
          const x = U.lerp(c.sx, pad + 18, e), y = U.lerp(c.sy, pad + 17, e) - Math.sin(c.t * Math.PI) * 40;
          g.beginPath(); g.arc(x, y, 6.5, 0, 6.283); g.fillStyle = '#ffcc4d'; g.fill(); g.lineWidth = 2; g.strokeStyle = OL; g.stroke();
          g.fillStyle = '#fff3a0'; g.beginPath(); g.arc(x - 1.5, y - 1.5, 2.5, 0, 6.283); g.fill();
        }
      }

      return {
        update, draw, down, move, up,
        resize() { layout(); },
        _s: S, _k: { P, TIERS, MAXT, cost, slotXY, get btn() { return btn; }, NS },
      };
    },
  });
})();
