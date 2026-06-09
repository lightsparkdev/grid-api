---
name: liquid-glass
description: >
  Build and reuse the "liquid glass" refraction UI in components/grid-wallet-demo
  (the LiquidGlass / Glass / GlassOver components). Use this skill when the user
  asks for a glass / liquid-glass / frosted / refraction / squircle UI element —
  e.g. "make a glass button", "glass tab bar", "glass card", "glass panel",
  "glass nav", "make this glass", "glass border that expands on hover", "frosted
  surface", or to tune the glass effect (refraction, chroma, specular, blur,
  corner smoothing, shadow).
allowed-tools:
  - Read
  - Glob
  - Grep
---

# Liquid Glass

Reusable refraction glass for `components/grid-wallet-demo`. Full docs:
**`components/grid-wallet-demo/src/components/liquid-glass/README.md`** — read it
before implementing anything non-trivial.

## The rule that prevents 90% of the pain

**The glass refracts its own CHILDREN, not the page behind it.** There is no
"frost whatever is behind me" mode (`backdrop-filter` can't refract portably). To
bend a background you put a *copy* of it inside the glass. So:

- Glass over a **known** backdrop (color / gradient / image / pattern) → use
  `GlassOver`, which makes the copy for you.
- Glass over **live UI behind a small surface** (over a *static* screen) →
  achievable: feed the glass a positioned **copy** of that UI. See "Refract live
  UI behind a small surface" in the gotchas / README.
- Glass over **arbitrary scrolling/animating DOM** → not achievable. Tell the user.

Exception: a **big** frosted surface (sheet/modal) should NOT refract — the
per-frame SVG filter tanks Safari. Use `FrostPanel` (GPU `backdrop-filter` + a
specular edge). Refraction is for the small, tactile elements.

Skipping this gives a flat panel that doesn't lens (the classic failure).

## Pick the right entry point

| Need | Use |
|---|---|
| Glass button / tab bar / card / chip over a known bg | `GlassOver` (easiest) |
| Refract content you already render, or custom backdrop wiring | `Glass` (= `LiquidGlass`) |
| A big frosted sheet/modal (no refraction — fast on Safari) | `FrostPanel` (`BottomSheet` uses it) |
| A small surface that refracts the (static) screen behind it | `GlassOver`'s `backdropNode` |
| The phone preview's WebGL stage | `glass-gl/StageGL` — **bespoke, don't reuse** |

**SVG vs shader (which renderer):** **default to the SVG path** (`Glass` /
`GlassOver`) for anything made of **live DOM** — buttons, tab bars, cards, text,
layouts (keeps content selectable/clickable). The **shader / WebGL** path is only
needed when you're refracting content that is **not** live DOM — a `<canvas>`
drawing (e.g. a generated QR) or a `<video>` (Safari won't SVG-filter those).
There is **no auto-switching** and no general "glass over a canvas/video" yet:
the only WebGL renderer (`StageGL`) is bespoke to the phone and re-derives the
math in GLSL. If a canvas/video glass actually comes up, **generalize `StageGL`
(or build a map-fed WebGL glass) on demand** — don't assume a drop-in exists.

## Minimal usage

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

`backdrop` = the same CSS background the surface sits on (gets refracted).
`children` = content on top (not refracted). Any `GlassConfig` field is a prop.
Start from a preset (`DEFAULT_GLASS`, `SWITCH_GLASS`, `SLIDER_GLASS`,
`PHONE_SHELL_GLASS`) and override.

## Must-know gotchas (details in the README)

- **Hover/resize:** animate `transform: scale()`, never width/height/radius — the
  displacement map re-bakes on shape change (jank).
- **Refraction needs texture:** over a flat color you only see specular/edge rim.
- **Tiny elements:** lower `depth`/`scale` or they over-distort.
- **`specularRotation`** is directional (45° puts a bright highlight on the
  top-left/bottom-right corners) — rotate or lower `edgeStrength` to move it.
- **`corner-shape: squircle`** is Chromium-only (graceful circular fallback).
- **Tiled backgrounds:** pass `GlassOver`'s `backdropOffset={{x,y}}` to align.
- **Big sheets/modals don't refract — they frost.** A large displacement lens
  re-runs its whole SVG filter every frame while the surface animates, which tanks
  Safari (CPU `feDisplacementMap`). Use `FrostPanel` (GPU `backdrop-filter` + a
  static specular edge); keep refractive `Glass`/`GlassOver` for the small buttons
  on top. Example: `apps/shared/BottomSheet` (FrostPanel) → `aurora/PasskeySheet`.
- **Refract live UI behind a *small* surface:** pass a *copy* of the behind-UI as
  `GlassOver`'s `backdropNode`, anchored to align, and **counter-animate it**
  against any slide so it stays put while the glass slides over it. Behind-UI must
  be static while open. (Not for big sheets — see above.)

## When tuning

There's a live tuning panel: run the demo (`npm run dev`, port 4000), open the
App panel, switch it to **swag** mode. Sliders map 1:1 to `GlassConfig`.
