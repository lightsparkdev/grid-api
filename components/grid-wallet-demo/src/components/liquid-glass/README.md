# Liquid Glass

A cross-browser "liquid glass" refraction effect (reverse-engineered from
[Aave's writeup](https://aave.com/design/building-glass-for-the-web)). It bends
pixels under a rounded-rect "lens" with an SVG `feDisplacementMap` — text stays
selectable, links stay clickable, no `backdrop-filter`.

## The one thing to understand first

**The glass refracts its own CHILDREN, not the page behind it.**

`backdrop-filter` can't do refraction portably, so there's no "frost whatever is
behind me" mode. To make glass bend a background, you put a **copy of that
background inside the glass**. Two consequences:

- Glass over a **known** backdrop (color, gradient, image, a pattern) → works.
  Use [`<GlassOver>`](#glassover-the-easy-path) — it does the copy for you.
- Glass over **live UI behind it** (a *small* surface over a screen) → works *if
  that UI is static while the surface is up* — feed the glass a positioned **copy**
  of it. See [Glass over live UI](#glass-over-live-ui-sheets--overlays). For a
  *big* surface (sheet/modal), don't refract — use
  [`FrostPanel`](#frostpanel--cheap-frosted-surface-no-refraction) instead (cheap,
  smooth on Safari).
- Glass over **arbitrary scrolling/animating DOM** → not possible (a copy can't
  stay in sync).

If you skip this, you'll get a flat panel that doesn't lens (the classic trap).

---

## `<GlassOver>` — the easy path

Glass surface over a background you can name (button, tab bar, card, chip):

```tsx
import { GlassOver } from '@/components/liquid-glass';

const BG = 'linear-gradient(135deg, #5b9dff, #b07cff)';

<div style={{ background: BG }}>
  <GlassOver backdrop={BG} radius={16} depth={10} scale={18} cornerSmoothing={0.6}>
    <span style={{ display: 'block', padding: '12px 22px', color: '#fff', fontWeight: 600 }}>
      Settings
    </span>
  </GlassOver>
</div>
```

- `backdrop` — the **same** CSS background the surface sits on (color / gradient /
  `url(...)`). This is what gets refracted.
- `backdropNode` — a **live JSX** refraction source instead of a string `backdrop`
  (e.g. a positioned copy of the DOM behind the surface). You position it; it
  renders inside the lens and is what gets bent; it takes precedence over
  `backdrop`. See [Glass over live UI](#glass-over-live-ui-sheets--overlays).
- `children` — rendered **on top**, un-refracted (your label/content).
- everything else — any [`GlassConfig`](#glassconfig) field (`radius`, `depth`, …).
- `backdropOffset={{ x, y }}` — only needed so a **tiled/positioned** background
  lines up seamlessly (pass this element's offset within the bg's owner). Solid
  colors and most gradients don't need it.

Note: refraction is only visible when the backdrop has **texture** (gradient /
pattern / image). Over a flat color you just get the specular + edge rim.

---

## `<Glass>` — raw component

Use directly when you're refracting content you're already rendering (or doing
the backdrop copy yourself, like `AppShell`). `Glass` is an alias for
`LiquidGlass`.

```tsx
import { Glass, DEFAULT_GLASS } from '@/components/liquid-glass';

<Glass {...DEFAULT_GLASS} style={{ borderRadius: 44 }}>
  {/* this content is what gets bent */}
  <YourContent />
</Glass>
```

Props: `children` (required), `className`, `style`, `showOutline?` (debug), `lens?`
(restrict the effect to a sub-region), plus any `GlassConfig` field.

---

## Recipes

**Glass tab bar**

```tsx
<GlassOver backdrop={PAGE_BG} radius={28} depth={12} scale={20} cornerSmoothing={0.6}>
  <nav style={{ display: 'flex', padding: 8 }}>
    {tabs.map((t) => <button key={t} className={styles.tab}>{t}</button>)}
  </nav>
</GlassOver>
```

**Glass border that expands on hover** — animate `transform`, **never** the
width/height/radius (those regenerate the displacement map every frame = jank):

```tsx
// ✅ cheap: transform only
<GlassOver backdrop={BG} className={styles.chip} /* style: transition: transform .2s; :hover { transform: scale(1.06) } */ >
```

**Tiny glass button** — scale `depth`/`scale` down or it over-distorts at small radii:

```tsx
<GlassOver backdrop={BG} radius={10} depth={6} scale={10} chromaticAberration={0.3} />
```

---

## `<FrostPanel>` — cheap frosted surface (no refraction)

For **big** surfaces — a bottom sheet, a modal — refraction isn't the point and is
actively harmful: a large lens re-runs its whole SVG filter every frame as the
surface animates, which tanks Safari (WebKit runs `feDisplacementMap` on the CPU).
`FrostPanel` skips the lens entirely. It frosts the **real** backdrop with a GPU
`backdrop-filter: blur()` and traces a bright **specular edge** — the "glassy" read
comes from the rim, not a bend. Nothing per-frame, so it stays smooth while it
slides.

```tsx
import { FrostPanel } from '@/components/liquid-glass';

<FrostPanel
  tint="var(--glass-sheet-tint)"   // milky fill
  tintBlur={12}                     // GPU backdrop blur
  radius={22}
  cornerSmoothing={0.12}
  cornerRadii={[22, 22, 56, 56]}    // optional per-corner (e.g. hug a screen)
>
  <YourSheetContent />
</FrostPanel>
```

Rule of thumb: **FrostPanel for the big surface, `Glass`/`GlassOver` for the small,
tactile elements on top** (buttons, switches, handles) where the lens shines and
the area is small enough to be cheap. Working example: `apps/shared/BottomSheet`
(FrostPanel) with `apps/shared/glass` buttons (refractive) inside it.

---

## Glass over live UI (sheets / overlays)

Want a surface whose glass actually **refracts the screen behind it** (not just
frosts it)? The lens only bends its own children, so feed `GlassOver` a **copy of
the behind-UI** as `backdropNode`, positioned to line up with the real one.

Note: this is the expensive path (full displacement over a large, possibly moving
area) — use it only for **small** surfaces. For a full sheet/modal, prefer
[`FrostPanel`](#frostpanel--cheap-frosted-surface-no-refraction); that's why
`BottomSheet` switched to it.

1. **Render a copy, aligned.** Pass the behind-UI as `GlassOver`'s `backdropNode`.
   Anchor it to a shared edge so it registers with the real UI — for a bottom-anchored
   surface that's `bottom: 0` + the full backdrop height.
2. **Counter-animate it against any slide.** If the surface slides, the copy lives
   inside it and would ride along. Wrap the copy in an element that translates the
   *opposite* way so it stays put while the glass slides *over* it.
3. **Behind-UI must be static while open.** The copy is a second render — it can't
   track scrolling/animating content. A surface over a settled screen is fine.
4. **Keep the copy decorative.** `aria-hidden`, `pointer-events: none`, no-op
   handlers; the real UI behind stays the interactive/accessible one.

---

## `GlassConfig`

Presets exist (`DEFAULT_GLASS`, `SWITCH_GLASS`, `SLIDER_GLASS`, `PHONE_SHELL_GLASS`)
— start from one and override. All numeric fields are in **px** unless noted.

| field | what it does |
|---|---|
| `radius` | corner radius |
| `depth` | refraction band width (how far in from the edge the bend ramps) |
| `scale` | peak refraction strength |
| `chromaticAberration` | per-channel colour split / fringe (0–1) |
| `blur` | gaussian blur of the refracted content |
| `domeDepth` | spherical curvature (sagitta); `0` = flat/linear bend |
| `splay` | flatten the bend near edges so content stays legible (`1` = off) |
| `specularRotation` | highlight direction in **degrees** (see gotcha) |
| `specularStrength` | highlight intensity |
| `glowStrength` / `glowSpread` / `glowExponent` | broad glow along the spec axis |
| `edgeStrength` / `edgeWidth` / `edgeExponent` | thin rim light at the edge |
| `brightness` | lens-only brightness, `-1..1` |
| `cornerSmoothing` | `0`=circular … `0.5`=CSS `squircle` … `1`=near-square (exponent `2 + smoothing*4`) |
| `edgeShadow` / `insetShadow` | CSS `box-shadow` strings (drop / inner) |
| `mapSize` | displacement-map resolution (64/128/256/512) — quality vs cost |

There's a live tuning panel in the dev tools (`src/dev/glass/`) — flip the App
panel to **swag** mode to dial values in by eye.

---

## SVG vs WebGL — which renderer

**Default to the SVG path (`Glass` / `GlassOver`) for everything made of live
DOM** — buttons, tab bars, cards, text, layouts. It keeps content selectable and
clickable.

The **WebGL / shader path** is only needed when the thing you're refracting is
**not** live DOM — a `<canvas>` drawing (e.g. a generated QR code) or a `<video>`
(Safari won't apply SVG filters to those).

There is **no automatic renderer selection**, and no general "glass over a
canvas/video" component yet: the only WebGL renderer (`glass-gl/StageGL`) is
bespoke to the phone preview and re-derives the displacement in GLSL rather than
sampling the shared map. If you actually need canvas/video glass, generalize
`StageGL` (or build a map-fed WebGL glass) on demand — don't assume a drop-in.

## Gotchas

- **`corner-shape: squircle` is Chromium-only.** It falls back to a circular
  corner elsewhere; the component already handles the fallback. The app-wide
  curve is the `--corner-shape` token (`globals.scss`).
- **The map regenerates when the *shape* changes** (size / `radius` / `depth` /
  etc.) — fine for static glass, but animate with `transform`, not size, or it
  re-bakes every frame. Position-only moves are cheap (drag is fine).
- **Tuned for largish rounded rects.** Tiny elements need smaller `depth`/`scale`.
- **`specularRotation` is directional**: at 45° the highlight piles onto the
  top-left & bottom-right corners (looks like a bright "extra" arc there). Rotate
  it, or lower `edgeStrength`/`specularStrength`, to move/soften it.
- **`shadow*` fields** (`shadowOffsetY/Blur/Spread/Opacity`) are consumed by the
  phone shell (`AppShell`), **not** by `Glass` — `Glass` uses `edgeShadow`.

## What this is NOT

- **`glass-gl/StageGL`** is bespoke for the phone preview (WebGL, samples the
  animated dot-grid canvas, tracks the shell element). It is **not** a reusable
  glass component — use `Glass` / `GlassOver` instead.
- It cannot refract arbitrary **scrolling/animating** DOM behind it. For **static**
  behind-UI behind a *small* surface you *can* — via a positioned copy; see
  [Glass over live UI](#glass-over-live-ui-sheets--overlays). Big surfaces frost
  instead ([`FrostPanel`](#frostpanel--cheap-frosted-surface-no-refraction)).
