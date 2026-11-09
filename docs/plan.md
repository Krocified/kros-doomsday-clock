# Plan

Status: Phases 1–3 **shipped**. This is the record of how it was built, not a TODO list.

Build order: split-flap first, then sound, then the ELAPSED cascade.

## Decisions (locked)

- **Single-leaf model.** One rotating element is the physical leaf: its front shows the old
  top half, its back shows the new bottom half, it rotates `rotateX(0 → -180deg)` about the
  seam. More faithful and fewer elements than the two-element (top/bottom delayed) variant.
- **No drum cycling.** A countdown ticking once per second only ever changes a digit by 1, so
  straight old→new is indistinguishable from a real forward-only drum. Add intermediate
  cycling only if a digit ever jumps by more than 1. `ponytail: straight flip, add drum path
  when jumps >1 appear.`
- **No per-cell stagger for the clock.** Stagger (40–60ms) only matters for the ELAPSED word.
- **Commit on `animationend`**, never mid-render. Snapshot old/new at flip start.
- Page stays white; tiles are matte near-black; glyph off-white condensed/mono tabular.

---

## Phase 1 — Split-flap digit (core) — shipped

### 1.1 `src/Digit.tsx` — one tile, one character

Props: `{ char: string }`. Internal state: `current`, `next`, `flipping`.

On `char` change while not flipping: `setNext(char); setFlipping(true)`.
On `animationend` of the leaf: `setCurrent(next); setFlipping(false)`.

DOM (single-leaf, physically faithful — real classes as built):

```
.digit                            perspective: 340px   (3D stage)
├─ .half.cliptop                  top half of NEW char when flipping, else current
├─ .half.clipbottom               bottom half of OLD char (covered by the landing leaf)
└─ .digit__flap                   transform-origin: 50% 100% (the seam)
    ├─ .half.cliptop (front)      top half of OLD char, backface-visibility: hidden
    └─ .half.clipbottom           bottom half of NEW char, rotateX(180deg), backface hidden
       .digit__flap-back
```

`cliptop` = `align-items:flex-start`; `clipbottom` = `align-items:flex-end`. One full-height
glyph (`.g`) is clipped per half, so the two halves line up across the seam.

Per-phase character mapping:

| Phase        | static cliptop | static clipbottom | flap front     | flap back      |
|--------------|----------------|-------------------|----------------|----------------|
| idle         | current        | current           | — (not rendered)| —             |
| flip 0→90°   | **next**       | current           | **current** top | hidden        |
| flip 90→180° | next           | current→cover     | facing away     | **next** bottom|
| end          | next           | next              | —               | —             |

`ponytail: render the flap only while flipping; unmount/remount restarts the CSS animation
cleanly, no reflow hack needed in React.`

### 1.2 `src/index.css` — tile geometry, seam, keyframes

- em-based sizing so the whole board scales from one font-size: `.digit { width: .72em;
  height: 1.45em }` (matches FlipClock.js ratio ≈ 0.69), **even height** so 50% is whole.
- Halves: `position:absolute; height:50%; overflow:hidden; backface-visibility:hidden`.
  Top `align-items:flex-start`; bottom `align-items:flex-end`. One full-height glyph → no
  seam misalignment.
- Colors: board `#0d0d0d`, top `#1c1c1c`→ slightly lighter (overhead light), bottom `#131313`
  darker (shadow), glyph `#f2efe6`. Tabular figures.
- Seam: `.digit::after` 1px line at `top: calc(50% - .5px)`, `z-index:4`, dark line +
  1px light shadow below.
- Leaf: `.digit__flap { top:0; height:50%; transform-style:preserve-3d;
  transform-origin:50% 100%; z-index:3 }`, `.digit__flap-back { transform: rotateX(180deg) }`.
- Keyframes (fast, mechanical, 150ms):
  ```css
  @keyframes flap {
    0%   { transform: rotateX(0deg);    animation-timing-function: cubic-bezier(.4,0,.9,.5); }
    50%  { transform: rotateX(-90deg);  animation-timing-function: cubic-bezier(.1,.6,.4,1); }
    100% { transform: rotateX(-180deg); }
  }
  ```
  ease-in on the fall (gravity), ease-out to seat.
- `prefers-reduced-motion`: `Digit.tsx` sets the value instantly when reduced at load; the CSS
  rule uses `animation-duration: 1ms` (NOT `none`) so `animationend` still fires and commits
  state if the OS setting flips live mid-flip. `ponytail: 1ms, not none — keeps the commit path.`

### 1.3 `src/Display.tsx` — group digits into units

- Split duration into chars: days `pad(days,3)`, hours/minutes/seconds `pad(n,2)`.
- Render one `Digit` per char, grouped per unit with a small gap between units.
- Fixed cell count + fixed tile width = no reflow mid-flip. `role="img"` + `aria-label`
  summary for assistive tech; glyphs are `aria-hidden`.

### 1.4 `src/App.tsx`

- Render `Display`; `useCountdown` unchanged. Sound toggle + tick/toll effects live here.
- Zero state handled by `ElapsedWord` (Phase 3), not a plain heading.

### 1.5 Verify

- `npm run build` + `npm test` pass (4 tests: `splitDuration`/`pad`).
- `./run.sh` manual check: seconds ones-digit flips every second, tens-digit every 10s, hours
  roll at 0, no full-board re-flip, no seam misalignment, no back-face flash.

---

## Phase 2 — Sound — shipped

`src/audio.ts`, Web Audio, no files:
- `tickTock(high)` per second, alternating tick (higher) / tock (lower): a crisp clock
  transient — two short filtered-noise bursts (~2.1–4.3kHz, 18–40ms) plus a brief tone blip,
  with only a whisper of low body. Deliberately **not** a long low sine, which reads as a drum.
- `clack()` for each ELAPSED letter; a deeper `toll()` on reaching zero.
- A shared **convolution reverb bus** (synthetic decaying-noise impulse, ~3s) all voices run
  through, so the tick lingers smoothly. First attempt used a feedback-delay echo — rejected:
  it gave distinct slap-back repeats, not a wash. `ponytail: one convolver reused for every voice.`
- Browser policy: start muted; a small corner **sound** toggle calls `unlock()` (create +
  `resume()` the AudioContext) on click.

---

## Phase 3 — ELAPSED cascade — shipped

- `src/ElapsedWord.tsx`: render `ELAPSED` as tiles; each slot starts blank and flips to its
  letter after `i * 140ms`, `clack()` per letter. Slots spaced > flip duration so no mid-flip
  re-render.
- `App` swaps the board for `ElapsedWord` when `elapsed`; `useCountdown` already freezes.

---

## Pitfall checklist (from research) — all addressed

- [x] Even tile height; seam at `calc(50% - .5px)`; shared full-height glyph → aligned halves.
- [x] `backface-visibility:hidden` on both leaf faces → no back-face flash at 90°.
- [x] `transform-origin: 50% 100%` on the leaf → pivots on the seam, no wobble.
- [x] `perspective: 300–400px` on `.digit` (340px).
- [x] Commit state only on `animationend`; snapshot old/new at flip start.
- [x] Fixed cell count + `tabular-nums` → no layout shift.
- [x] `prefers-reduced-motion` honored (instant at load; 1ms fallback if toggled live).
