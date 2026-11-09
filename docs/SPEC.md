# Spec

## Clocks

A list of named target dates in `src/countdown.ts` (`CLOCKS`), each a local-time date:

- **Japan** — `2027-04-14T00:00:00`
- **Malaysia** — `2026-12-04T00:00:00`

The first is selected on load. Adding a clock is one entry in that list.

## Clock menu

A radial arc wheel, bottom-left. Hover or click the trigger to open; wheel / drag / arrow
keys scroll the arc; click or Enter selects. It stays open until you pick, press Escape, or
click outside. Selecting a clock **random-flips** the board (all tiles scramble through random
digits for ~1.2s) then settles on the new countdown.

## Behavior

- On page load, read the selected clock's target, compute `target - now`.
- Render `DD days HH hours MM minutes SS seconds`, zero-padded.
- Re-render every 1000ms via `setInterval`, each tick recomputed from `Date.now()` (not decremented) so drift never accumulates.
- On reaching zero: `clearInterval`, freeze/disable the clock, and replace it with the single word **ELAPSED**.

## Presentation

- Vite + React + TS + Tailwind. One client-side page.
- Split-flap display: matte near-black tiles, off-white condensed/monospace characters,
  centered; one tile per digit — days 3 digits, hours/minutes/seconds 2.
- No dependencies beyond the stack above unless a flip animation truly needs one.

## Split-flap animation

Target: read as a real Solari/airport board, not a CSS flip toy.

- Each digit is a `top`/`bottom` half split at the horizontal centreline, with the classic
  seam shadow between halves.
- A flip runs top→down: the current top half rotates down about the seam (rotateX) revealing
  the incoming digit's bottom behind it; the new digit then becomes the resting top.
- Flips are **per-digit and only when that digit's value changes** — the seconds ones-digit
  flips ~every second, tens-digit once per 10s, etc. No full-board re-flip per tick.
- Timing: fast, ~150ms, single-leaf fold (see plan). Snappy, mechanical.
- Days are always **3 digits, zero-padded** (e.g. `412`).

## Sound

Heavy grandfather-clock tick-tock, Avengers-doomsday-trailer flavour, synthesized via Web Audio
(no audio files).

- One tick per second, alternating tick (higher) / tock (lower) — a crisp, bright clock
  transient (short filtered-noise + tone burst, ~2–4kHz, 20–50ms), not a drum.
- Requires a user gesture: audio starts muted; a small **sound** toggle in the corner unlocks
  the AudioContext on click. No autoplay (browser policy).
- Each flap in the ELAPSED cascade plays the clack; reaching zero plays a single deeper toll.
- All output runs through a smooth convolution reverb (~3s tail) so each tick lingers — no
  distinct delay repeats.

## Zero state

Clock stops. A word of split-flap tiles spells **ELAPSED**, one character at a time
(staggered ~140ms), each letter flipping in from a blank tile.

## Out of scope (for now)

Accuracy to a specific real machine down to the millisecond, timezone controls, multiple
targets, persistence. Unit tests cover the duration/formatting logic (`src/countdown.test.ts`);
the flip animation and audio are verified by one manual check.
