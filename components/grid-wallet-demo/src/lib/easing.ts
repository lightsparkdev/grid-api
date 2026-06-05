/** Cubic-bezier control points for CSS / Framer Motion. */
export type CubicBezier = readonly [number, number, number, number];

/** Snappy ease-out — cubic-bezier(0.19, 1, 0.22, 1) */
export const easeOutSnappy: CubicBezier = [0.19, 1, 0.22, 1];

export function cubicBezierCss(curve: CubicBezier): string {
  return `cubic-bezier(${curve.join(', ')})`;
}

/** Framer Motion transition preset. */
export function motionTransition(
  curve: CubicBezier = easeOutSnappy,
  duration = 0.15,
) {
  return { duration, ease: [...curve] as [number, number, number, number] };
}
