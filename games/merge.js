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

  // ---------- drawing: background / wall / units / monsters ----------
  function drawBackground(g, W, H, fieldTop, wallY, lanes, sc) {
    let gr = g.createLinearGradient(0, 0, 0, wallY);
    gr.addColorStop(0, '#5fae4a'); gr.addColorStop(1, '#3f8a36');
    g.fillStyle = gr; g.fillRect(0, 0, W, wallY + 4);
    for (let i = 0; i < lanes.length; i++) {
      const x = lanes[i], lw = Math.min(W * 0.2, 86 * sc);
      g.fillStyle = 'rgba(120,84,48,0.55)';
      U.rr(g, x - lw / 2, fieldTop - 30, lw, wallY - fieldTop + 40, lw * 0.4); g.fill();
      g.fillStyle = 'rgba(160,120,70,0.5)';
      U.rr(g, x - lw / 2 + 6, fieldTop - 30, lw - 12, wallY - fieldTop + 40, lw * 0.35); g.fill();
    }
    const r = MG.mulberry32(42);
    for (let i = 0; i < 70; i++) {
      const x = r() * W, y = fieldTop + r() * (wallY - fieldTop);
      let onLane = false;
      for (let k = 0; k < lanes.length; k++) if (Math.abs(x - lanes[k]) < Math.min(W * 0.1, 43 * sc)) onLane = true;
      if (onLane) { g.fillStyle = 'rgba(90,60,30,0.35)'; g.beginPath(); g.arc(x, y, 1.5 + r() * 2.5, 0, 6.283); g.fill(); continue; }
      const k = r();
      if (k < 0.45) {
        g.strokeStyle = 'rgba(30,90,30,0.6)'; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y - 7); g.moveTo(x, y); g.lineTo(x + 1, y - 9); g.moveTo(x, y); g.lineTo(x + 4, y - 6); g.stroke();
      } else if (k < 0.7) {
        g.fillStyle = ['#ff7ac8', '#ffe27a', '#ffffff', '#ff9a4d'][Math.floor(r() * 4)];
        for (let p = 0; p < 5; p++) { const a = p * 1.2566; g.beginPath(); g.arc(x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6, 2, 0, 6.283); g.fill(); }
        g.fillStyle = '#ffcc4d'; g.beginPath(); g.arc(x, y, 1.6, 0, 6.283); g.fill();
      } else if (k < 0.85) {
        g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(x, y + 5, 10, 3, 0, 0, 6.283); g.fill();
        g.fillStyle = '#2f7a2a'; g.beginPath(); g.arc(x - 5, y, 6, 0, 6.283); g.arc(x + 5, y, 6, 0, 6.283); g.arc(x, y - 4, 7, 0, 6.283); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.15)'; g.beginPath(); g.arc(x - 2, y - 6, 3, 0, 6.283); g.fill();
      } else {
        g.fillStyle = '#9aa0ad'; g.beginPath(); g.ellipse(x, y, 6, 4, 0, 0, 6.283); g.fill();
        g.fillStyle = '#c4c9d4'; g.beginPath(); g.ellipse(x - 1, y - 1, 4, 2.4, 0, 0, 6.283); g.fill();
      }
    }
    gr = g.createLinearGradient(0, fieldTop - 10, 0, fieldTop + 70);
    gr.addColorStop(0, 'rgba(20,40,30,0.55)'); gr.addColorStop(1, 'rgba(20,40,30,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, fieldTop + 70);
    // castle yard below the wall
    gr = g.createLinearGradient(0, wallY, 0, H);
    gr.addColorStop(0, '#6b5a4a'); gr.addColorStop(1, '#3e3346');
    g.fillStyle = gr; g.fillRect(0, wallY, W, H - wallY);
    g.fillStyle = 'rgba(255,255,255,0.05)';
    const s = 26 * sc;
    for (let y = wallY + 20, row = 0; y < H; y += s * 0.6, row++) {
      for (let x = (row % 2) * s * 0.5 - s; x < W; x += s) { U.rr(g, x + 1, y + 1, s - 2, s * 0.6 - 2, 3); g.fill(); }
    }
  }

  function drawWall(g, W, wallY, sc, hp, maxHp, flash, t) {
    const th = 30 * sc, top = wallY - th * 0.5;
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, top + th, W, 8);
    const gr = g.createLinearGradient(0, top, 0, top + th);
    gr.addColorStop(0, '#b9b2c4'); gr.addColorStop(1, '#7a7389');
    g.fillStyle = gr; g.fillRect(0, top, W, th);
    const bw = 22 * sc;
    g.fillStyle = '#cfc8da';
    for (let x = 0; x < W; x += bw * 2) { U.rr(g, x + 2, top - 11 * sc, bw, 13 * sc, 3); g.fill(); }
    g.strokeStyle = 'rgba(60,50,80,0.45)'; g.lineWidth = 1.2;
    g.beginPath();
    for (let row = 0; row < 3; row++) {
      const y = top + row * th / 3;
      g.moveTo(0, y); g.lineTo(W, y);
      for (let x = (row % 2) * bw * 0.5; x < W; x += bw) { g.moveTo(x, y); g.lineTo(x, y + th / 3); }
    }
    g.stroke();
    const dmg = 1 - hp / maxHp;
    if (dmg > 0.25) {
      g.strokeStyle = 'rgba(40,30,50,0.75)'; g.lineWidth = 2;
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
    if (flash > 0) { g.fillStyle = 'rgba(255,60,60,' + Math.min(0.5, flash * 2) + ')'; g.fillRect(0, top - 11 * sc, W, th + 11 * sc); }
    // flags
    for (let k = 0; k < 2; k++) {
      const fx = k ? W - 16 * sc : 16 * sc, fy = top - 11 * sc;
      g.fillStyle = '#5a4a3a'; g.fillRect(fx - 1.5, fy - 34 * sc, 3, 34 * sc);
      const wv = Math.sin(t * 5 + k) * 3 * sc;
      g.fillStyle = '#ff5d6c';
      g.beginPath(); g.moveTo(fx + 1.5, fy - 34 * sc); g.quadraticCurveTo(fx + 12 * sc, fy - 30 * sc + wv, fx + 22 * sc, fy - 28 * sc + wv);
      g.lineTo(fx + 1.5, fy - 20 * sc); g.closePath(); g.fill();
    }
  }

  function drawUnit(g, tier, x, y, s, t, fire) {
    const T = TIERS[tier];
    const bob = Math.sin(t * 3 + tier) * s * 0.02;
    const k = s / 60;
    y += bob;
    g.fillStyle = 'rgba(0,0,0,0.28)'; g.beginPath(); g.ellipse(x, y + 22 * k, 20 * k, 6 * k, 0, 0, 6.283); g.fill();
    if (tier === 5) {
      // cannon + gunner
      g.fillStyle = '#5a4030'; U.rr(g, x - 18 * k, y + 4 * k, 36 * k, 16 * k, 5 * k); g.fill();
      g.fillStyle = '#3a2a20'; g.beginPath(); g.arc(x - 12 * k, y + 20 * k, 7 * k, 0, 6.283); g.arc(x + 12 * k, y + 20 * k, 7 * k, 0, 6.283); g.fill();
      g.fillStyle = '#9a7a5a'; g.beginPath(); g.arc(x - 12 * k, y + 20 * k, 3 * k, 0, 6.283); g.arc(x + 12 * k, y + 20 * k, 3 * k, 0, 6.283); g.fill();
      const rec = fire > 0 ? fire * 30 * k : 0;
      const gr = g.createLinearGradient(x - 8 * k, 0, x + 8 * k, 0);
      gr.addColorStop(0, '#2b2f38'); gr.addColorStop(0.5, '#6a7080'); gr.addColorStop(1, '#2b2f38');
      g.fillStyle = gr; U.rr(g, x - 8 * k, y - 26 * k + rec, 16 * k, 34 * k, 6 * k); g.fill();
      g.fillStyle = '#1a1c22'; g.beginPath(); g.ellipse(x, y - 26 * k + rec, 8 * k, 3 * k, 0, 0, 6.283); g.fill();
      g.fillStyle = '#d9a43a'; g.fillRect(x - 9 * k, y - 8 * k + rec, 18 * k, 3 * k);
      if (fire > 0) { g.fillStyle = 'rgba(255,200,80,' + fire * 4 + ')'; g.beginPath(); g.arc(x, y - 32 * k, 10 * k, 0, 6.283); g.fill(); }
      return;
    }
    if (tier === 7) {
      // little purple dragon
      const fl = Math.sin(t * 9) * 0.5;
      g.fillStyle = '#7d3fc8';
      for (let sd = -1; sd <= 1; sd += 2) {
        g.beginPath(); g.moveTo(x + sd * 8 * k, y - 4 * k);
        g.quadraticCurveTo(x + sd * 30 * k, y - (22 + fl * 10) * k, x + sd * 28 * k, y + 4 * k);
        g.quadraticCurveTo(x + sd * 18 * k, y, x + sd * 8 * k, y + 6 * k); g.fill();
      }
      const gr = g.createRadialGradient(x - 4 * k, y - 4 * k, 2, x, y, 18 * k);
      gr.addColorStop(0, '#d9a8ff'); gr.addColorStop(1, '#8a4ad8');
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y + 6 * k, 13 * k, 15 * k, 0, 0, 6.283); g.fill();
      g.fillStyle = '#f4e0ff'; g.beginPath(); g.ellipse(x, y + 10 * k, 7 * k, 9 * k, 0, 0, 6.283); g.fill();
      g.fillStyle = '#9a5ae8'; g.beginPath(); g.arc(x, y - 12 * k, 11 * k, 0, 6.283); g.fill();
      g.fillStyle = '#ffe27a';
      g.beginPath(); g.moveTo(x - 7 * k, y - 19 * k); g.lineTo(x - 10 * k, y - 29 * k); g.lineTo(x - 3 * k, y - 21 * k);
      g.moveTo(x + 7 * k, y - 19 * k); g.lineTo(x + 10 * k, y - 29 * k); g.lineTo(x + 3 * k, y - 21 * k); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 4 * k, y - 13 * k, 3.4 * k, 0, 6.283); g.arc(x + 4 * k, y - 13 * k, 3.4 * k, 0, 6.283); g.fill();
      g.fillStyle = '#2a1040'; g.beginPath(); g.arc(x - 4 * k, y - 13 * k, 1.8 * k, 0, 6.283); g.arc(x + 4 * k, y - 13 * k, 1.8 * k, 0, 6.283); g.fill();
      if (fire > 0) { g.fillStyle = 'rgba(255,150,60,' + fire * 4 + ')'; g.beginPath(); g.arc(x, y - 6 * k, 6 * k, 0, 6.283); g.fill(); }
      return;
    }
    if (tier === 8) {
      // angel wings + halo
      const fl = Math.sin(t * 4) * 0.15;
      g.fillStyle = 'rgba(255,255,255,0.95)';
      for (let sd = -1; sd <= 1; sd += 2) {
        g.beginPath(); g.moveTo(x + sd * 6 * k, y - 4 * k);
        g.quadraticCurveTo(x + sd * 34 * k, y - (26 + fl * 30) * k, x + sd * 30 * k, y + 10 * k);
        g.quadraticCurveTo(x + sd * 18 * k, y + 2 * k, x + sd * 6 * k, y + 8 * k); g.fill();
      }
    }
    if (tier === 9) {
      const pul = 0.5 + 0.5 * Math.sin(t * 6);
      const gr = g.createRadialGradient(x, y, 4, x, y, 32 * k);
      gr.addColorStop(0, 'rgba(255,90,140,' + (0.35 + pul * 0.2) + ')'); gr.addColorStop(1, 'rgba(255,90,140,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, 32 * k, 0, 6.283); g.fill();
    }
    // body
    const body = tier === 6 ? '#c9cfdc' : tier === 9 ? '#c8304f' : T.col;
    let gr = g.createLinearGradient(x - 14 * k, y, x + 14 * k, y + 20 * k);
    gr.addColorStop(0, U.shade(body, 0.2)); gr.addColorStop(1, U.shade(body, -0.3));
    g.fillStyle = gr;
    U.rr(g, x - 13 * k, y - 2 * k, 26 * k, 24 * k, 9 * k); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x - 13 * k, y + 10 * k, 26 * k, 3 * k);
    g.fillStyle = '#ffd9b0'; g.beginPath(); g.arc(x, y - 10 * k, 11 * k, 0, 6.283); g.fill();
    g.fillStyle = '#2a2030'; g.beginPath(); g.arc(x - 4 * k, y - 10 * k, 1.8 * k, 0, 6.283); g.arc(x + 4 * k, y - 10 * k, 1.8 * k, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(255,120,120,0.5)'; g.beginPath(); g.arc(x - 7 * k, y - 6 * k, 2.2 * k, 0, 6.283); g.arc(x + 7 * k, y - 6 * k, 2.2 * k, 0, 6.283); g.fill();
    // headgear + weapon by tier
    if (tier === 0) {
      g.fillStyle = '#2f9e5a'; g.beginPath(); g.arc(x, y - 12 * k, 12 * k, Math.PI * 1.05, Math.PI * 1.95); g.lineTo(x + 2 * k, y - 28 * k); g.closePath(); g.fill();
      g.strokeStyle = '#8a5a3c'; g.lineWidth = 3 * k;
      g.beginPath(); g.arc(x + 16 * k, y - 2 * k, 13 * k, -Math.PI * 0.45, Math.PI * 0.45); g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 18 * k, y - 14 * k); g.lineTo(x + 18 * k, y + 10 * k); g.stroke();
    } else if (tier === 1) {
      g.fillStyle = '#7a8aa8'; g.beginPath(); g.arc(x, y - 12 * k, 12 * k, Math.PI, 0); g.fill();
      g.fillStyle = '#c4cde0'; g.fillRect(x - 12 * k, y - 13 * k, 24 * k, 3 * k);
      g.fillStyle = '#5a4030'; g.fillRect(x + 8 * k, y - 4 * k, 18 * k, 5 * k);
      g.strokeStyle = '#3a3f4b'; g.lineWidth = 2.5 * k;
      g.beginPath(); g.moveTo(x + 22 * k, y - 12 * k); g.quadraticCurveTo(x + 28 * k, y - 2 * k, x + 22 * k, y + 8 * k); g.stroke();
    } else if (tier >= 2 && tier <= 4) {
      const hat = tier === 2 ? '#c8302a' : tier === 3 ? '#2a8ac8' : '#c89a1a';
      g.fillStyle = hat;
      g.beginPath(); g.moveTo(x - 15 * k, y - 15 * k); g.lineTo(x + 15 * k, y - 15 * k); g.lineTo(x + 4 * k, y - 40 * k); g.closePath(); g.fill();
      g.fillStyle = U.shade(hat, -0.3); g.fillRect(x - 15 * k, y - 17 * k, 30 * k, 4 * k);
      if (tier === 4) { g.fillStyle = '#fff6a0'; g.beginPath(); g.moveTo(x + 1 * k, y - 34 * k); g.lineTo(x - 3 * k, y - 25 * k); g.lineTo(x + 1 * k, y - 25 * k); g.lineTo(x - 2 * k, y - 18 * k); g.lineTo(x + 5 * k, y - 28 * k); g.lineTo(x + 1 * k, y - 28 * k); g.closePath(); g.fill(); }
      g.strokeStyle = '#6a4a2a'; g.lineWidth = 3 * k;
      g.beginPath(); g.moveTo(x + 17 * k, y + 18 * k); g.lineTo(x + 17 * k, y - 18 * k); g.stroke();
      const oc = tier === 2 ? '#ff8a3d' : tier === 3 ? '#9ef0ff' : '#fff27a';
      const pul = 1 + 0.15 * Math.sin(t * 8) + (fire > 0 ? 0.5 : 0);
      g.fillStyle = oc; g.globalAlpha = 0.4; g.beginPath(); g.arc(x + 17 * k, y - 22 * k, 8 * k * pul, 0, 6.283); g.fill();
      g.globalAlpha = 1; g.beginPath(); g.arc(x + 17 * k, y - 22 * k, 4.5 * k, 0, 6.283); g.fill();
    } else if (tier === 6) {
      g.fillStyle = '#dfe4ef'; g.beginPath(); g.arc(x, y - 12 * k, 12.5 * k, Math.PI, 0); g.fill();
      g.fillStyle = '#ffcc4d'; g.fillRect(x - 1.5 * k, y - 26 * k, 3 * k, 10 * k);
      g.fillStyle = '#5a6fa8'; U.rr(g, x - 25 * k, y - 4 * k, 15 * k, 20 * k, 5 * k); g.fill();
      g.fillStyle = '#ffe27a'; g.fillRect(x - 19 * k, y - 1 * k, 3 * k, 14 * k); g.fillRect(x - 23 * k, y + 4 * k, 11 * k, 3 * k);
      g.strokeStyle = '#fffbe0'; g.lineWidth = 3.5 * k; g.beginPath(); g.moveTo(x + 17 * k, y + 6 * k); g.lineTo(x + 17 * k, y - 26 * k); g.stroke();
      g.strokeStyle = '#d9a43a'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(x + 11 * k, y + 2 * k); g.lineTo(x + 23 * k, y + 2 * k); g.stroke();
    } else if (tier === 8) {
      g.strokeStyle = '#ffe27a'; g.lineWidth = 2.5 * k; g.beginPath(); g.ellipse(x, y - 26 * k, 10 * k, 3.5 * k, 0, 0, 6.283); g.stroke();
      g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(x, y - 14 * k, 11 * k, Math.PI * 1.1, Math.PI * 1.9); g.fill();
      g.fillStyle = '#ffe27a'; g.beginPath(); g.arc(x + 17 * k, y - 14 * k, 5 * k * (1 + 0.2 * Math.sin(t * 7)), 0, 6.283); g.fill();
    } else if (tier === 9) {
      g.fillStyle = '#ffcc4d';
      g.beginPath(); g.moveTo(x - 12 * k, y - 18 * k);
      for (let i = 0; i <= 4; i++) { g.lineTo(x - 12 * k + i * 6 * k, y - (i % 2 ? 22 : 32) * k); }
      g.lineTo(x + 12 * k, y - 18 * k); g.closePath(); g.fill();
      g.fillStyle = '#ff4d7a'; g.beginPath(); g.arc(x, y - 24 * k, 2.4 * k, 0, 6.283); g.fill();
      g.strokeStyle = '#ffe27a'; g.lineWidth = 3.5 * k; g.beginPath(); g.moveTo(x + 18 * k, y + 16 * k); g.lineTo(x + 18 * k, y - 26 * k); g.stroke();
      g.fillStyle = '#ffe27a'; g.beginPath(); g.moveTo(x + 18 * k, y - 34 * k); g.lineTo(x + 12 * k, y - 24 * k); g.lineTo(x + 24 * k, y - 24 * k); g.closePath(); g.fill();
    }
  }

  function drawMonster(g, m, t, sc) {
    const D = MONS[m.type];
    const r = D.r * sc * (m.boss ? 1 : 1);
    const x = m.x, wk = Math.sin(t * (m.type === 'bat' ? 18 : 8) + m.ph);
    const y = m.y + (m.type === 'slime' ? Math.abs(wk) * -3 * sc : 0);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(x, m.y + r * 0.8, r * 0.9, r * 0.3, 0, 0, 6.283); g.fill();
    const col = m.slowT > 0 ? '#8fd8ff' : D.col;
    if (m.type === 'slime') {
      const sq = 1 + wk * 0.08;
      const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r * 1.2);
      gr.addColorStop(0, U.shade(col, 0.35)); gr.addColorStop(1, U.shade(col, -0.25));
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y + r * 0.1, r * sq, r * 0.85 / sq, 0, 0, 6.283); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.35, r * 0.22, r * 0.14, -0.5, 0, 6.283); g.fill();
    } else if (m.type === 'bat') {
      g.fillStyle = U.shade(col, -0.2);
      for (let sd = -1; sd <= 1; sd += 2) {
        g.beginPath(); g.moveTo(x, y);
        g.quadraticCurveTo(x + sd * r * 1.6, y - r * (0.9 + wk * 0.7), x + sd * r * 2.0, y + r * 0.2);
        g.quadraticCurveTo(x + sd * r * 1.2, y - r * 0.1, x, y + r * 0.4); g.fill();
      }
      g.fillStyle = col; g.beginPath(); g.arc(x, y, r * 0.75, 0, 6.283); g.fill();
      g.beginPath(); g.moveTo(x - r * 0.5, y - r * 0.4); g.lineTo(x - r * 0.35, y - r * 1.05); g.lineTo(x - r * 0.1, y - r * 0.6);
      g.moveTo(x + r * 0.5, y - r * 0.4); g.lineTo(x + r * 0.35, y - r * 1.05); g.lineTo(x + r * 0.1, y - r * 0.6); g.fill();
    } else {
      const big = m.type === 'boss';
      const legY = y + r * 0.45;
      g.fillStyle = U.shade(col, -0.45);
      U.rr(g, x - r * 0.5, legY - wk * r * 0.12, r * 0.35, r * 0.5, r * 0.12); g.fill();
      U.rr(g, x + r * 0.15, legY + wk * r * 0.12, r * 0.35, r * 0.5, r * 0.12); g.fill();
      const gr = g.createLinearGradient(x - r, y - r, x + r, y + r);
      gr.addColorStop(0, U.shade(col, 0.25)); gr.addColorStop(1, U.shade(col, -0.25));
      g.fillStyle = gr; U.rr(g, x - r * 0.8, y - r * 0.5, r * 1.6, r * 1.15, r * 0.45); g.fill();
      g.beginPath(); g.arc(x, y - r * 0.6, r * 0.62, 0, 6.283); g.fill();
      if (m.type === 'orc') {
        g.fillStyle = '#fffbe0';
        g.beginPath(); g.moveTo(x - r * 0.3, y - r * 0.35); g.lineTo(x - r * 0.22, y - r * 0.62); g.lineTo(x - r * 0.12, y - r * 0.35);
        g.moveTo(x + r * 0.3, y - r * 0.35); g.lineTo(x + r * 0.22, y - r * 0.62); g.lineTo(x + r * 0.12, y - r * 0.35); g.fill();
        g.strokeStyle = '#6a4a2a'; g.lineWidth = r * 0.22; g.lineCap = 'round';
        g.beginPath(); g.moveTo(x + r * 0.8, y + r * 0.2); g.lineTo(x + r * 1.0, y - r * 0.6 + wk * r * 0.2); g.stroke();
      } else if (m.type === 'knight') {
        g.fillStyle = '#d4d9e4'; g.beginPath(); g.arc(x, y - r * 0.65, r * 0.66, Math.PI, 0); g.fill();
        g.fillStyle = '#2a2a35'; g.fillRect(x - r * 0.45, y - r * 0.7, r * 0.9, r * 0.14);
        g.fillStyle = '#c0392b'; U.rr(g, x - r * 1.15, y - r * 0.4, r * 0.6, r * 0.95, r * 0.2); g.fill();
        g.fillStyle = '#ffe27a'; g.fillRect(x - r * 0.9, y - r * 0.3, r * 0.1, r * 0.75);
      } else if (big) {
        g.fillStyle = '#f2e6c8';
        g.beginPath(); g.moveTo(x - r * 0.4, y - r * 1.0); g.lineTo(x - r * 0.8, y - r * 1.6); g.lineTo(x - r * 0.15, y - r * 1.15);
        g.moveTo(x + r * 0.4, y - r * 1.0); g.lineTo(x + r * 0.8, y - r * 1.6); g.lineTo(x + r * 0.15, y - r * 1.15); g.fill();
        g.fillStyle = '#ffcc4d';
        g.beginPath(); g.moveTo(x - r * 0.35, y - r * 1.12);
        for (let i = 0; i <= 4; i++) g.lineTo(x - r * 0.35 + i * r * 0.175, y - r * (i % 2 ? 1.25 : 1.45));
        g.lineTo(x + r * 0.35, y - r * 1.12); g.closePath(); g.fill();
      }
      if (m.type !== 'knight') {
        g.fillStyle = big ? '#ffe27a' : '#ff3b3b';
        g.beginPath(); g.arc(x - r * 0.22, y - r * 0.65, r * 0.11, 0, 6.283); g.arc(x + r * 0.22, y - r * 0.65, r * 0.11, 0, 6.283); g.fill();
      }
    }
    if (m.type === 'slime' || m.type === 'bat') {
      g.fillStyle = '#fff'; g.beginPath(); g.arc(x - r * 0.28, y - r * 0.1, r * 0.2, 0, 6.283); g.arc(x + r * 0.28, y - r * 0.1, r * 0.2, 0, 6.283); g.fill();
      g.fillStyle = '#1a1020'; g.beginPath(); g.arc(x - r * 0.25, y - r * 0.05, r * 0.1, 0, 6.283); g.arc(x + r * 0.25, y - r * 0.05, r * 0.1, 0, 6.283); g.fill();
    }
    if (m.flash > 0) {
      g.globalAlpha = Math.min(1, m.flash * 10) * 0.7; g.fillStyle = '#fff';
      g.beginPath(); g.arc(x, y - r * 0.2, r * 0.95, 0, 6.283); g.fill(); g.globalAlpha = 1;
    }
    if (m.hp < m.max) {
      const bw = Math.max(22, r * 1.8), by = y - r * (m.boss ? 1.9 : 1.55);
      g.fillStyle = 'rgba(20,10,20,0.65)'; U.rr(g, x - bw / 2 - 1.5, by - 1.5, bw + 3, 7, 3.5); g.fill();
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
        if (T.kind === 'arrow' || T.kind === 'bolt') {
          g.strokeStyle = T.kind === 'arrow' ? '#8a5a3c' : '#3a3f4b'; g.lineWidth = 2.2 * k;
          g.beginPath(); g.moveTo(-12 * k, 0); g.lineTo(6 * k, 0); g.stroke();
          g.fillStyle = '#e8ecf5'; g.beginPath(); g.moveTo(10 * k, 0); g.lineTo(4 * k, -3.5 * k); g.lineTo(4 * k, 3.5 * k); g.fill();
          g.fillStyle = T.col; g.fillRect(-13 * k, -3 * k, 4 * k, 6 * k);
        } else if (T.kind === 'cannon') {
          g.fillStyle = '#2b2f38'; g.beginPath(); g.arc(0, 0, 6 * k, 0, 6.283); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(-2 * k, -2 * k, 2 * k, 0, 6.283); g.fill();
        } else {
          const r = (s.tier >= 7 ? 9 : 7) * k;
          g.fillStyle = T.pc; g.globalAlpha = 0.35;
          g.beginPath(); g.ellipse(-r, 0, r * 2, r * 0.8, 0, 0, 6.283); g.fill();
          g.globalAlpha = 1; g.fillStyle = s.tier === 3 ? '#ffffff' : T.col;
          g.beginPath(); g.arc(0, 0, r * 0.75, 0, 6.283); g.fill();
          g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, r * 0.35, 0, 6.283); g.fill();
        }
        g.restore();
      }
      function draw(g) {
        if (!bg) buildBg();
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        g.fillStyle = '#3e3346'; g.fillRect(-20, -20, W + 40, H + 40);
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
          g.fillStyle = can ? 'rgba(125,255,168,0.35)' : hl ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.1)';
          U.rr(g, x - s / 2, y - s / 2, s, s, s * 0.2); g.fill();
          g.strokeStyle = can ? 'rgba(125,255,168,0.9)' : 'rgba(255,255,255,0.18)'; g.lineWidth = can ? 2.5 : 1.5;
          U.rr(g, x - s / 2, y - s / 2, s, s, s * 0.2); g.stroke();
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
          g.strokeStyle = '#fff6a0'; g.lineWidth = 3;
          g.beginPath(); g.moveTo(z.x0, z.y0);
          for (let k = 1; k < 5; k++) g.lineTo(U.lerp(z.x0, z.x1, k / 5) + (Math.random() - 0.5) * 14, U.lerp(z.y0, z.y1, k / 5) + (Math.random() - 0.5) * 14);
          g.lineTo(z.x1, z.y1); g.stroke();
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
          g.font = '900 ' + t.size + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 3; g.strokeStyle = 'rgba(30,10,20,0.8)'; g.strokeText(t.s, t.x, t.y);
          g.fillStyle = t.col; g.fillText(t.s, t.x, t.y);
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
          g.font = '900 ' + sz + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 6; g.lineJoin = 'round'; g.strokeStyle = 'rgba(20,10,30,0.85)';
          const yy = fieldTop + (wallY - fieldTop) * 0.4 + i * 46;
          g.strokeText(b.text, W / 2, yy); g.fillStyle = b.col; g.fillText(b.text, W / 2, yy);
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
        g.fillStyle = U.shade(T.col, -0.35); g.beginPath(); g.arc(x, y, 9.5, 0, 6.283); g.fill();
        g.fillStyle = T.col; g.beginPath(); g.arc(x, y - 0.8, 8, 0, 6.283); g.fill();
        U.text(g, String(tier + 1), x, y, 11, tier === 6 || tier === 8 ? '#5a4a2a' : '#fff', 'center', 900);
      }
      function drawButton(g) {
        const c = cost();
        const ok = S.coins >= c && S.units.some((u) => !u);
        const sx = btnShake > 0 ? Math.sin(btnShake * 60) * 6 : 0;
        const pr = btnPress * 3;
        const x = btn.x + sx, y = btn.y + pr, w = btn.w, h = btn.h;
        g.fillStyle = 'rgba(0,0,0,0.3)'; U.rr(g, x, btn.y + 5, w, h, h / 2); g.fill();
        const gr = g.createLinearGradient(0, y, 0, y + h);
        gr.addColorStop(0, ok ? '#ffd84d' : '#9a95a8'); gr.addColorStop(1, ok ? '#ff9a2d' : '#6a6578');
        g.fillStyle = gr; U.rr(g, x, y, w, h, h / 2); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.3)'; U.rr(g, x + 8, y + 4, w - 16, h * 0.32, h * 0.16); g.fill();
        U.text(g, '招募弓箭手', x + w / 2, y + h * 0.36, Math.min(18, h * 0.34), ok ? '#5a2a00' : '#3a3548', 'center', 900);
        U.text(g, '💰 ' + c, x + w / 2, y + h * 0.72, Math.min(15, h * 0.28), ok ? '#5a2a00' : '#3a3548', 'center', 900);
      }
      function drawHud(g) {
        const pad = 8;
        g.fillStyle = 'rgba(15,12,35,0.6)'; U.rr(g, pad, pad, 112, 34, 17); g.fill();
        const cp = 1 + coinPop * 0.25;
        U.text(g, '💰', pad + 18, pad + 17, 17 * cp, '#fff');
        U.text(g, fmt(S.coins), pad + 34, pad + 18, 17, '#ffe27a', 'left', 900);
        g.fillStyle = 'rgba(15,12,35,0.6)'; U.rr(g, W - pad - 112, pad, 112, 34, 17); g.fill();
        U.text(g, ENDLESS ? '🌊 第 ' + S.wave + ' 波' : '🌊 ' + S.wave + ' / ' + P.waves, W - pad - 56, pad + 17, 15, '#fff', 'center', 900);
        const cw = Math.min(140, W - 260);
        if (cw > 70) {
          g.fillStyle = 'rgba(15,12,35,0.6)'; U.rr(g, W / 2 - cw / 2, pad, cw, 34, 17); g.fill();
          if (ENDLESS) {
            U.text(g, '最高 ' + Math.max(api.best || 0, S.wave) + ' 波', W / 2, pad + 17, 13, '#ffe27a', 'center', 900);
          } else {
            U.text(g, '擊殺 ' + S.kills, W / 2, pad + 17, 13, '#fff', 'center', 800);
          }
        }
        // wall hp bar on the wall
        const bw = Math.min(W - 80, 220), bx = W / 2 - bw / 2, by = wallY - 6;
        g.fillStyle = 'rgba(20,10,20,0.7)'; U.rr(g, bx - 3, by - 3, bw + 6, 14, 7); g.fill();
        const f = Math.max(0, S.wallHp / S.wallMax);
        g.fillStyle = f > 0.5 ? '#7dff8a' : f > 0.25 ? '#ffcc4d' : '#ff5d6c';
        U.rr(g, bx, by, Math.max(4, bw * f), 8, 4); g.fill();
        U.text(g, '🏰 ' + Math.ceil(S.wallHp), W / 2, by + 4, 10, '#fff', 'center', 900);
        // flying coins to counter
        for (let i = 0; i < flyCoins.length; i++) {
          const c = flyCoins[i]; if (!c.on) continue;
          const e = U.easeOutCubic(c.t);
          const x = U.lerp(c.sx, pad + 18, e), y = U.lerp(c.sy, pad + 17, e) - Math.sin(c.t * Math.PI) * 40;
          g.fillStyle = '#ffcc4d'; g.beginPath(); g.arc(x, y, 6, 0, 6.283); g.fill();
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
