/** Cubic-bezier control points for CSS / Framer Motion. */
export type CubicBezier = readonly [number, number, number, number];

/** Snappy ease-out — cubic-bezier(0.19, 1, 0.22, 1) */
export const easeOutSnappy: CubicBezier = [0.19, 1, 0.22, 1];

/** Swift out (easing.dev) — cubic-bezier(0.175, 0.885, 0.32, 1.1) */
export const easeOutSwift: CubicBezier = [0.175, 0.885, 0.32, 1.1];

/** Overshoot out (easing.dev) — cubic-bezier(0.175, 0.885, 0.32, 1.275) */
export const easeOutOvershoot: CubicBezier = [0.175, 0.885, 0.32, 1.275];

/** Quick out (easing.dev) — cubic-bezier(0, 0, 0.2, 1) */
export const easeOutQuick: CubicBezier = [0, 0, 0.2, 1];

export function cubicBezierCss(curve: CubicBezier): string {
  return `cubic-bezier(${curve.join(', ')})`;
}

/** Framer Motion transition preset. */
export function motionTransition(
  curve: CubicBezier = easeOutSnappy,
  duration = 0.15,
  options: { delay?: number } = {},
) {
  const { delay } = options;
  return {
    duration,
    ease: [...curve] as [number, number, number, number],
    ...(delay != null && { delay }),
  };
}
