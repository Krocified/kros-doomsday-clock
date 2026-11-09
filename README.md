# kros-doomsday-clock

My personal ticking doomsday-style clock: a split-flap (airport/Solari) countdown to a fixed
date, ticking down days / hours / minutes / seconds, with an optional grandfather-clock
tick-tock. At zero it stops and flips out **ELAPSED**.

## Run

```sh
./run.sh          # installs deps if needed, starts the Vite dev server
```

Or directly:

```sh
npm install
npm run dev       # dev server
npm run build     # production build -> dist/
npm test          # unit tests
```

Toggle sound with the small button in the bottom-right corner (audio is muted until you click).

## Change the target date

Edit `TARGET` in `src/countdown.ts` (ISO 8601, local time).

## Docs

- `docs/INTENT.md` — why this exists
- `docs/SPEC.md` — behavior
- `docs/plan.md` — how it was built
