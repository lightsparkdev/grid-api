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
