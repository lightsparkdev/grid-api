/**
 * Cursor wake tuning — sizes are ratios of min(stageW, stageH), i.e. a stage-local
 * vmin. That matches the dot field's coordinate space better than dvh/dvw (the
 * wake lives in the app panel, not the full viewport).
 */
export const DOT_WAKE_ENABLED = false;

export const DOT_MOUSE = {
  /** Wake bubble radius — fraction of min(stageW, stageH). */
  wakeRadiusRatio: 0.36,
  /** Max dot displacement at cursor center — same reference. */
  wakePushRatio: 0.022,
} as const;

export interface PointerSample {
  x: number;
  y: number;
  /** False when the pointer is outside the stage — wake is off. */
  active: boolean;
}

/** Resolve wake size for the current stage (CSS px). */
export function dotWakeMetrics(stageW: number, stageH: number) {
  const ref = Math.max(1, Math.min(stageW, stageH));
  return {
    wakeRadius: ref * DOT_MOUSE.wakeRadiusRatio,
    wakePush: ref * DOT_MOUSE.wakePushRatio,
  };
}

/** Shift a dot away from the pointer — soft radial wake. */
export function dotMouseOffset(
  dotX: number,
  dotY: number,
  pointer: PointerSample,
  stageW: number,
  stageH: number,
): { dx: number; dy: number } {
  if (!DOT_WAKE_ENABLED || !pointer.active || stageW <= 0 || stageH <= 0) {
    return { dx: 0, dy: 0 };
  }

  const { wakeRadius, wakePush } = dotWakeMetrics(stageW, stageH);
  const px = dotX - pointer.x;
  const py = dotY - pointer.y;
  const dist = Math.hypot(px, py);
  if (dist <= 0 || dist >= wakeRadius) return { dx: 0, dy: 0 };

  const t = (1 - dist / wakeRadius) ** 2;
  const push = wakePush * t;
  return { dx: (px / dist) * push, dy: (py / dist) * push };
}

/**
 * Track pointer anywhere over `stage` (including the phone on top).
 * Uses capture + bounds check so child elements don't break follow.
 */
export function createPointerTracker(
  stage: HTMLElement,
  canvas: HTMLCanvasElement,
  options?: { flipY?: boolean },
) {
  let x = 0;
  let y = 0;
  let active = false;
  let stageH = 0;
  const flipY = options?.flipY ?? false;

  const stageRect = () => stage.getBoundingClientRect();

  const inStage = (clientX: number, clientY: number) => {
    const r = stageRect();
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
  };

  const toLocal = (clientX: number, clientY: number) => {
    const r = canvas.getBoundingClientRect();
    let localY = clientY - r.top;
    if (flipY && stageH > 0) localY = stageH - localY;
    return { x: clientX - r.left, y: localY };
  };

  const setStage = (w: number, h: number) => {
    stageH = h;
    if (!active) {
      x = w * 0.5;
      y = h * 0.5;
    }
  };

  const sync = (e: PointerEvent) => {
    if (!inStage(e.clientX, e.clientY)) {
      active = false;
      return;
    }
    const p = toLocal(e.clientX, e.clientY);
    x = p.x;
    y = p.y;
    active = true;
  };

  // Capture on stage so moves over the phone still update the wake.
  stage.addEventListener('pointermove', sync, { capture: true });
  stage.addEventListener('pointerdown', sync, { capture: true });
  window.addEventListener('pointermove', sync, { passive: true });

  const tick = (): PointerSample => ({ x, y, active });

  const dispose = () => {
    stage.removeEventListener('pointermove', sync, { capture: true });
    stage.removeEventListener('pointerdown', sync, { capture: true });
    window.removeEventListener('pointermove', sync);
  };

  return { tick, setStage, dispose };
}

/* ── Press-and-release ──────────────────────────────────────────────────────
 * Press the dot grid in on pointer-down (a concave dimple at the cursor), let it
 * follow while held (including over the phone), and release it into the ripple on
 * pointer-up. The dimple's spatial profile lives in the shader (pressOffset); this
 * tracker only produces a smoothed position + a 0..1 strength.
 */
export const DOT_PRESS = {
  enabled: true,
  /** Position follow per frame (0..1). Higher = snappier trail behind the cursor. */
  followLerp: 0.28,
  /** Depth ramp-in per frame while held (the "press in"). */
  riseLerp: 0.3,
  /** How long the release rebound animates before the surface is idle again (ms). */
  releaseLifeMs: 1500,
} as const;

export interface SurfaceSample {
  /** Press / rebound centre, top-down CSS px (×dpr at upload to match the shader). */
  x: number;
  y: number;
  /** 0..1 held press depth (the inward dimple). 0 once released. */
  pressStr: number;
  /** Seconds since release; < 0 when not rebounding. */
  relT: number;
  /** Press depth captured at release — scales the rebound. */
  relAmp: number;
}

export const IDLE_SURFACE: SurfaceSample = { x: 0, y: 0, pressStr: 0, relT: -1, relAmp: 0 };

/**
 * Track a press as ONE continuous surface gesture: holding presses an inward dimple
 * in (and follows the cursor, over the phone too); releasing lets that same dimple
 * spring back and radiate (the rebound). The shader renders both from a single field,
 * so press → release reads as one motion rather than two separate effects.
 *
 * Capture-phase stage listeners see the press before child elements; window listeners
 * keep the follow/release working even when a child captures the pointer.
 */
export function createPressTracker(
  stage: HTMLElement,
  canvas: HTMLCanvasElement,
  opts: {
    onChange: () => void;
    /** Skip starting a press when the pointer-down lands inside this selector (the
     *  foreground phone UI). A press already in progress still follows over it. */
    excludeSelector?: string;
  },
) {
  let held = false;
  let tx = 0;
  let ty = 0; // raw target (latest pointer, top-down CSS px)
  let cx = 0;
  let cy = 0; // smoothed current
  let str = 0; // held depth, 0..1
  let releasing = false;
  let relStart = 0; // performance.now() at release
  let relAmp = 0; // depth captured at release

  const toLocal = (clientX: number, clientY: number) => {
    const r = canvas.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  // Suppress text selection while dragging the backdrop, so the drag doesn't
  // highlight the app's text (restored on release / dispose).
  const suppressSelect = (on: boolean) => {
    if (typeof document === 'undefined') return;
    const v = on ? 'none' : '';
    document.body.style.userSelect = v;
    document.body.style.setProperty('-webkit-user-select', v);
  };

  const onDown = (e: PointerEvent) => {
    // Don't grab presses that begin on the foreground phone UI (buttons etc.) — the
    // backdrop only reacts to presses that start on the backdrop. A press started on
    // the backdrop still follows if you then drag over the phone (onMove ignores this).
    const t = e.target as Element | null;
    if (opts.excludeSelector && t?.closest?.(opts.excludeSelector)) return;
    const p = toLocal(e.clientX, e.clientY);
    tx = p.x;
    ty = p.y;
    cx = p.x; // snap under the cursor — no slide-in from a stale point
    cy = p.y;
    held = true;
    releasing = false; // a fresh press cancels any in-flight rebound
    str = 0;
    suppressSelect(true);
    opts.onChange();
  };

  const onMove = (e: PointerEvent) => {
    if (!held) return;
    const p = toLocal(e.clientX, e.clientY);
    tx = p.x;
    ty = p.y;
    opts.onChange();
  };

  const onUp = () => {
    if (!held) return;
    held = false;
    // Hand the press depth to the rebound: a quick tap springs back less than a hold.
    relAmp = str;
    relStart = performance.now();
    releasing = true;
    suppressSelect(false);
    opts.onChange();
  };

  stage.addEventListener('pointerdown', onDown, { capture: true });
  stage.addEventListener('pointermove', onMove, { capture: true });
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', onUp, { capture: true });
  window.addEventListener('pointercancel', onUp, { capture: true });

  /** Advance one frame and read the sample. `now` is the rAF timestamp. */
  const tick = (now: number): SurfaceSample => {
    cx += (tx - cx) * DOT_PRESS.followLerp;
    cy += (ty - cy) * DOT_PRESS.followLerp;
    if (held) str += (1 - str) * DOT_PRESS.riseLerp;
    let relT = -1;
    if (releasing) {
      relT = Math.max(0, (now - relStart) / 1000);
      if (relT * 1000 >= DOT_PRESS.releaseLifeMs) {
        releasing = false;
        relT = -1;
      }
    }
    return { x: cx, y: cy, pressStr: held ? str : 0, relT, relAmp: releasing ? relAmp : 0 };
  };

  /** True while the loop must keep running (held, or still rebounding). */
  const isAnimating = () => held || releasing;

  const dispose = () => {
    suppressSelect(false); // restore selection if we unmount mid-press
    stage.removeEventListener('pointerdown', onDown, { capture: true });
    stage.removeEventListener('pointermove', onMove, { capture: true });
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp, { capture: true });
    window.removeEventListener('pointercancel', onUp, { capture: true });
  };

  return { tick, isAnimating, dispose };
}
