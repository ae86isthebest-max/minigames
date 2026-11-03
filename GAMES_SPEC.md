# 小遊戲合集 — build spec

A private, ad-free collection of 15 casual mobile mini-games, played on an iPhone as an
offline web app (PWA). Vanilla JS + Canvas 2D, no build step, no external assets, no network.

## Framework (already written — read `core.js` first, do NOT edit it, `index.html` or `style.css`)

Each game is one file `games/<id>.js` that calls:

```js
MG.register({
  id: 'bus', name: '巴士逃脫', icon: '🚌', color: '#ff8f3d',
  create(api) {            // called at the start of every level (and on restart)
    return {               // all optional
      update(dt) {},       // dt seconds, capped at 0.05
      draw(g) {},          // g = CanvasRenderingContext2D, already scaled: use CSS px, 0..api.W x 0..api.H
      down(x, y) {}, move(x, y) {}, up(x, y) {},   // single pointer, CSS px in canvas space
      resize(W, H) {},     // if omitted, the level restarts on resize
      destroy() {},
    };
  },
});
```

`api`: `W`, `H` (getters, current canvas size), `level` (1, 2, 3 … endless),
`rng()` (seeded per game+level → same level is the same layout every time; use it for ALL
randomness in level generation; Math.random is fine for cosmetic particles only),
`util` (PALETTE, clamp, lerp, easeOutBack, easeOutCubic, rr (rounded-rect path), shade(hex, ±amt),
shuffle(rng, arr), text(g, str, x, y, size, color, align, weight), BG),
`sfx(name)` (tap, pop, good, bad, shoot, hit, pour, drop, win, lose),
`info(text)` (one short status line shown above the canvas, e.g. `分數 120 / 400`),
`win(text?)`, `lose(text?)` (shell shows the 過關 / 失敗 card; call once), `ended` (true after win/lose —
stop accepting input and stop the simulation then, but keep drawing).

The shell already provides: back button, level number, restart button, win/lose card, mute.
Anything else (undo, boosters, extra slot) is drawn by the game inside its canvas and hit-tested by it.

## Quality bar (this is the point — the user wants it to feel like the real ad games)

- Portrait phone first (≈390×700 CSS px canvas, iPhone), but lay out from `api.W/H` so it also fits
  iPad and any aspect. Never draw outside the canvas, never clip important things.
- Bright, polished, "juicy": rounded shapes, gradients, soft shadows, highlights, smooth tweened
  movement (no teleporting), pop/scale bounces, particles or confetti on clears, screen shake on hits
  where it fits. Draw everything with canvas shapes (emoji allowed for small icons/faces).
- Background: draw your own full-canvas background fitting the theme (not plain black).
- Touch targets ≥ 44 px. Instant feedback on every tap (sfx + visual). Invalid move → shake + `bad`.
- Text the player sees is Traditional Chinese (Taiwan wording), short.
- Level 1 is very easy (teaches the mechanic in seconds, put a one-line hint in `api.info`),
  difficulty ramps smoothly, endless levels generated from `api.level` + `api.rng`.
- **Every generated level must be solvable/winnable.** Prove it with a generator that builds
  levels backwards, or a solver/simulation. Keep that check as `tools/check_<id>.js`
  (node, loads the game the same way `tools/smoke.js` does or re-implements the generator)
  and run it for levels 1–60.
- 60 fps on a phone: no per-frame allocations of big arrays, minimal `shadowBlur`, cache static
  layers in an offscreen canvas if drawing is heavy.
- No audio files, no images, no fetch, no localStorage (the shell saves level progress).

## Testing you must do for each game

1. `node --check games/<id>.js`
2. `node tools/smoke.js <id> 40` → must print OK (random taps for 40 levels, no exceptions).
3. `node tools/check_<id>.js` → solvability / winnability for levels 1–60.
Do NOT use any browser tool — the lead tests visually in the browser afterwards.
Edit carefully: no greedy regex replacements on code, no `//` comments in the middle of a line of code.

## v2: difficulty, endless, records (core.js updated — read it again)

Tapping a game now opens a picker: 簡單 / 普通 / 困難 (and 無盡 if the def has `endless: true`).
Each mode has its own level progress and records; the shell saves them.

New `api` fields:
- `api.diff` — 0 簡單, 1 普通, 2 困難. Each mode is its own endless level ladder starting at level 1.
- `api.endless` — true in 無盡 mode (`api.diff` is 2 then, `api.level` is 1). Play never "wins": it keeps ramping
  forever until the player fails; call `api.score(n)` whenever the score changes and `api.lose(text)` at the end.
  The shell compares with the best and shows 新紀錄. Show the live score and `api.best` (best so far) in the canvas.
- `api.score(n)` — report current score (integer). Score games (blocks, fruit, stack…) should report it in every mode.
- `api.rng` in endless is seeded from the clock (different every run).

What the difficulties mean (the user said: what you built so far feels like 簡單; they want 困難 to be
"really hard, really thrilling"):
- 簡單 = the current game exactly as it is now (keep it; do not make it harder).
- 普通 = clearly harder from level 1: think of current level ~10–15 at level 1 and ramping faster.
- 困難 = genuinely tense from level 1: think beyond the current level 30 at level 1, tighter limits
  (fewer bays/slots/hearts/undos/boosters, more colours, faster enemies, time pressure where it fits,
  hidden info), ramps quickly. Still always winnable — the check scripts must prove 簡單/普通/困難 levels 1–40
  winnable (bot / solver), and that a lazy/no-input player loses on 困難 where that applies.
- Real-time games on 困難: faster, more enemies, less margin — the player should feel pressure in seconds.
- Seeds differ per mode, so levels differ between modes.
