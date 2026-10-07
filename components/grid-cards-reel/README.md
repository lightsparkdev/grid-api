# Cards launch reel

Video-only. Renders the cards playground's real 3D card (same mesh, materials, studio lighting, foil, and hologram) frame by frame onto transparency, for compositing in Remotion. Lives on the `pat/cards-reel` branch; never merged, never deployed. Nothing in `components/grid-cards-demo` is edited: the card is imported from it read-only.

## What you get

| File | Use |
| --- | --- |
| `out/<take>/card-reel.mov` | ProRes 4444 with alpha, 2160 × 2160, 60 fps. The plate. |
| `out/<take>/card-reel.webm` | VP9 with alpha (smaller; Chrome-friendly). |
| `out/<take>/card-reel-preview.mp4` | H.264 on black, for review. |
| `out/<take>/frames/` | The PNG sequence the above are encoded from. |
| `out/<take>/track.json` | Per frame: which brand is on the card, and the pose. `meta.swaps` lists the time each brand comes on, for syncing sound to the flips. |
| `out/stills/<id>/` | Per brand: `hero.png` (4K, transparent, three-quarter pose), `front.png`, `back.png`. |

The latest plate is `out/plate-v3`.

## Setup

Node 20 or 22, a Mac with a GPU.

```bash
cd components/grid-cards-reel
npm install
npx playwright install chromium
npm run dev            # http://localhost:4010, leave running
```

## Render

```bash
npm run render -- my-take              # full plate, 2160, ~35 s
npm run render -- my-take --size 1080  # quicker, for checking motion
npm run render -- my-test --test       # one second around the first swaps
npm run encode -- my-take [--webm]     # frames -> .mov, preview .mp4 (and .webm)
npm run stills                         # stills + Figma SVGs for every brand
```

Renders run in headless Chrome, so nothing has to stay on screen. In the browser, `#/render` has a live preview and a scrubber that shows any frame exactly as it renders, `#/sheet` renders every card front and back, and `#/stills` writes the stills.

## Tweaking the motion

Everything is in `REEL` at the top of `src/reel/reelTimeline.ts`. Change a number and re-render.

| Setting | What it does |
| --- | --- |
| `open.hold`, `open.rest` | Seconds on the still "Your brand" card before anything happens, and where it rests (0 = dead center; it starts and lands there). |
| `dip.depth`, `dip.windup` | How far it sinks before the launch, and how far the bottom-left corner tips back. |
| `pop.height`, `pop.toward` | How high the arc rises, and how close to the camera at the top. The arc goes up like a throw and comes down softly, caught. |
| `tumble.turns` | Full turns about the axis (2). |
| `tumble.axisDeg`, `tumble.axisDrift` | The spin axis in the card's plane (-32 is the diagonal, so the bottom-left corner leads). Drift 0 keeps it fixed, as a free spin is. |
| `tumble.flick`, `drag`, `catch` | The spin's speed: up over the launch, slowing a little with drag, eased to a stop over the catch. It never speeds up mid-air. |
| `cycle.startPerSecond`, `peakPerSecond`, `endPerSecond` | The swap rate's ramp: slow, then up to 8 a second, then easing into the landing. Every brand shows exactly once; the duration (and so the spin's speed) follows. Lower = slower everything. |
| `cycle.swapOn` | `'both'` swaps whichever face is showing; `'front'` only while the front faces the camera. |
| `orientation.mix` | `'none'` (default): the card never rolls, so upright designs flip past sideways, as a rigid card would. `'grouped'`: they play as one run with a quarter turn in and out mid-air. `'interleaved'`: scattered, the silhouette snaps. The rolls read as a change of momentum. |
| `settle.hold` | Seconds on "Your brand" at the end. |
| `size`, `cardFrac` | Plate size, and the card's width as a share of it (leave room for the pop). |
| `blur` | Motion blur: samples per frame scale with speed so a fast frame is a smear, not copies. |
| `exposure` | Tone mapping (1.0 is the playground's dark stage). |

The show order is `ORDER` in `src/brands/newBrands.ts`. The back's name and card number are `BACK` in `src/brands/reelBrands.ts`.

## In Remotion

Drop the plate in as a transparent video:

```tsx
<OffthreadVideo src={staticFile('card-reel.mov')} transparent />
```

or use the PNG sequence with `<Img src={staticFile(\`frames/frame_${pad(frame + 1)}.png\`)} />`. Motion blur is baked into the plate (Remotion's motion blur can't act inside a pre-rendered video). Scale, position, timing, and color are all free to change in Remotion; the card's own 3D motion is changed here.

## Porting the motion to Remotion later

`reelTimeline.ts` is pure TypeScript (no React, no three): `buildReel(placeholder, brands).frame(t)` gives the pose and the brand for any time. A port would render `ReelScene` inside `@remotion/three`'s `ThreeCanvas`, drive it with `frame(useCurrentFrame() / fps)`, hold each frame with `delayRender` until the card has painted the frame's design (`ReelDirector.show` is the check), and render with `--gl=angle --concurrency=1`.

## The cards

37 brands from the Figma icon strip (Social 2025-26, node 2921:13229) plus the playground's six presets. Marks are the strip's fake glyphs (`src/brands/glyphs.raw.json`, rebuilt with `node scripts/build-glyphs.mjs`); art is per brand in `src/brands/art.ts`; each card's material, finish, mark treatment, Visa face, and orientation are in `src/brands/newBrands.ts`. No card prints a name.

The editable versions are on the "Card reel brands" page of the Social 2025-26 Figma file: each face as layers (print, art, mark, chip, Visa, live text on the back), with the 3D render beside it. Grain, the toast's crumb texture, and the dove hologram are image layers; everything else is vector.

## Gotchas

- The playground's surface bake worker has ES imports; `vite.config.ts` starts it as a module worker at serve time. If `surfaceBakeClient.ts` changes, the config throws and says so.
- Black gloss reads gray head-on (the laminate mirrors the studio), which is why the darkest cards are matte.
- A browser tab out of view stops animation frames and a render there stalls; use `npm run render`.
