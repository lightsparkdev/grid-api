# Agent guide: cards launch video

You're working on the Grid cards launch video. Branch `pat/cards-reel` of `lightsparkdev/grid-api`. Everything is in `components/grid-cards-reel/`. Video-only: never merged, never deployed.

## Two parts

| Folder | What | Use it to |
| --- | --- | --- |
| `remotion/` | A Remotion 4 project: the card plate on a background, in four formats | Edit the video: timing, framing, background, type, logo, sound. **Start here.** |
| `.` (the reel app) | A Vite app that renders the 3D card frame by frame into the plate | Change the card's motion or the card designs, then re-render the plate |

The plate (`remotion/public/card-reel.webm`, transparent, 2160 × 2160, 60 fps) is the 3D card spinning through 43 card designs, launched from and landing on a white "Your brand" card, already motion-blurred. Remotion composites it; it does not re-render the 3D.

## Editing the video (remotion/)

```bash
cd components/grid-cards-reel/remotion
npm install
npm run dev                 # Remotion Studio
npm run render:square       # exports/cards-launch-square.mp4 (also :landscape, :portrait)
```

- `src/CardsLaunch.tsx`: the composition. Props (editable in Studio): `background`, `scale`, `offsetX`, `offsetY`, `startAt`. Add type, logo, and audio as layers here.
- `src/Root.tsx`: the formats: Square 1080, Landscape 1920 × 1080, Portrait 1080 × 1350, Master 2160.
- `src/plate.ts`: `SWAPS` (the plate frame of every card change, with the design's id) and `BEATS` (`launch`, `firstSwap`, `finalSwap`). Sync sound and type to these, e.g. an `<Audio>` per swap for a flick sound.
- `src/track.json`: per-frame data from the reel app (which design, the card's pose). Regenerated with the plate.
- For the final master, a ProRes 4444 `.mov` of the same plate looks better than the WebM: get `card-reel.mov` (about 600 MB, not in git; ask Pat, or render it below), put it in `public/`, and set `PLATE.file` in `src/plate.ts`.

## Changing the card itself (the reel app)

Read `README.md` in this folder first. Then:

```bash
cd components/grid-cards-reel
npm install && npx playwright install chromium
npm run dev                                  # leave running (port 4010)
npm run render -- my-take --size 1080        # a quick check
npm run encode -- my-take --preview          # out/my-take/card-reel-preview.mp4
npm run render -- final && npm run encode -- final --webm   # the real plate (2160, .mov + .webm)
cp out/final/card-reel.webm remotion/public/ && cp out/final/track.json remotion/src/track.json
```

- Motion: `REEL` in `src/reel/reelTimeline.ts` (every setting documented there and in the README).
- Which designs show their fronts: `FRONT_SHOWN` in `src/brands/newBrands.ts`; everything else only appears on the card's back. Show order: `ORDER`. Card designs: `newBrands.ts` (layout, finish) and `art.ts` (artwork). Back of the card (cardholders, numbers): `holders.ts`.

## Rules

- **Never edit `components/grid-cards-demo/`.** The reel imports the playground's 3D card from it read-only. If the card itself must change, copy the file into `src/forks/` and change the copy.
- Node 20 or 22, a Mac with a GPU (the reel renders in headless Chrome on Metal).
- After any change to the motion or designs, render a 1080 check and look at frames (`out/<take>/frames/`) before calling it done. Keep the rules the video depends on: no front of a back-only design is ever visible; the card starts and lands dead center; the presets close the cycle, Z last before "Your brand".
- `out/`, `node_modules/`, and `remotion/exports/` are not committed.
