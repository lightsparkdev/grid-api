/**
 * iOS opening a link from one app in another (Messages into Safari), ported from the GoFundMe demo, which traced it
 * frame by frame from a recording at 60fps: both apps shrink to cards with the display's corners and slide sideways
 * together over the wallpaper, 24pt apart at full size (the gap shrinks with them). The cards bottom out at 0.847 a
 * sixth of a second in and spring back over the rest; the slide starts a frame after the shrink. SCALE and SLIDE are
 * the recording's own values, one per frame.
 */
const FRAME_MS = 1000 / 60;
const GAP = 24;

const SCALE = [
  1, 0.9969, 0.984, 0.9634, 0.9397, 0.9184, 0.8986, 0.881, 0.865, 0.8528, 0.8474, 0.8482, 0.8535, 0.8619, 0.8711,
  0.8825, 0.8932, 0.9039, 0.9138, 0.923, 0.9321, 0.9397, 0.9474, 0.9542, 0.9603, 0.9649, 0.9695, 0.9741, 0.9779,
  0.9809, 0.9832, 0.9855, 0.9878, 0.9893, 0.9908, 0.9924, 0.9931, 0.9947, 0.9954, 0.9962, 0.9962, 0.9969, 0.9977,
  0.9977, 0.9985, 0.9985, 0.9985, 0.9992, 0.9992, 0.9992, 0.9992, 0.9992, 0.9992, 1,
];
/** How far along the slide is: 0 with the first app centred, 1 with the second. */
const SLIDE = [
  0, 0.013, 0.046, 0.098, 0.1678, 0.2538, 0.3402, 0.4236, 0.5009, 0.5716, 0.6343, 0.6896, 0.7383, 0.7796, 0.8162,
  0.8462, 0.8723, 0.8939, 0.9123, 0.9273, 0.9403, 0.9513, 0.9596, 0.9669, 0.9738, 0.9783, 0.9826, 0.9853, 0.9882,
  0.99, 0.9921, 0.9926, 0.9941, 0.9955, 0.9964, 0.997, 0.9975, 0.998, 0.9984, 0.9988, 0.999, 0.9992, 0.9994,
  0.9995, 0.9996, 0.9997, 0.9998, 0.9998, 0.9999, 0.9999, 1, 1, 1, 1,
];
const DURATION = (SCALE.length - 1) * FRAME_MS;

/** The recorded value at `ms`, between its two frames. */
function at(table: number[], ms: number) {
  const f = Math.min(ms / FRAME_MS, table.length - 1);
  const i = Math.floor(f);
  const next = table[Math.min(i + 1, table.length - 1)];
  return table[i] + (next - table[i]) * (f - i);
}

/**
 * Plays the switch from `from` to `to`, two full-screen layers in the same stage. `direction` 1 brings `to` in from
 * the right (opening a link); -1 brings it in from the left (the "◀ Back to app" breadcrumb). The first frame is
 * applied before this returns, so calling it in a layout effect never flashes `to` unmoved.
 */
export function playAppSwitch(
  from: HTMLElement,
  to: HTMLElement,
  { wallpaper, radius, direction = 1 }: { wallpaper: string; radius: number; direction?: 1 | -1 },
): Promise<void> {
  const stage = from.parentElement;
  const cards = [from, to];
  const restore = cards.map((c) => c.getAttribute('style') ?? '');
  const stageBg = stage?.style.background ?? '';
  const width = from.offsetWidth;
  if (stage) stage.style.background = wallpaper;
  for (const c of cards) {
    c.style.clipPath = `inset(0 round ${radius}px)`;
    c.style.transformOrigin = '50% 50%';
  }
  const paint = (ms: number) => {
    const s = at(SCALE, ms);
    const sep = s * (width + GAP) * direction;
    const x = -at(SLIDE, ms) * sep;
    from.style.transform = `translateX(${x}px) scale(${s})`;
    to.style.transform = `translateX(${x + sep}px) scale(${s})`;
  };
  paint(0);
  return new Promise((resolve) => {
    const t0 = performance.now();
    const frame = (now: number) => {
      const ms = Math.min(now - t0, DURATION);
      paint(ms);
      if (ms < DURATION) {
        requestAnimationFrame(frame);
        return;
      }
      cards.forEach((c, i) => c.setAttribute('style', restore[i]));
      if (stage) stage.style.background = stageBg;
      resolve();
    };
    requestAnimationFrame(frame);
  });
}
