/**
 * Claude Duet's mascot, ported from the product page's PhoneMock (claude.com/product/claude-duet): a clay blob and
 * an ink brush line, both functions of time. Each state returns the blob's outline (72 points) and, optionally, a
 * line; switching states morphs the outline over ~0.83s, squeezing it in the middle, while the line draws off and
 * the next one draws on. The drawing updates 12 times a second, which gives it its stop-motion look.
 */
export type MascotState = 'tilde' | 'think1' | 'working' | 'connecting' | 'waitshape';

type Pt = [number, number];
interface Frame {
  shape: Pt[];
  line?: (t: number) => Pt;
  samples?: number;
  split?: boolean;
}

const P = 2 * Math.PI;
const clamp01 = (e: number) => (Number.isNaN(e) ? 0 : Math.min(Math.max(e, 0), 1));
const smooth = (e: number) => {
  const s = clamp01(e);
  return s * s * (3 - 2 * s);
};
const cubic = (e: number) => {
  const s = clamp01(e);
  return s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const fract = (e: number) => e - Math.floor(e);
const hump = (e: number) => (e < 0 || e > 1 ? 0 : Math.sin(Math.PI * e));
const hash = (a: number, b: number) => fract(43758.5453 * Math.sin(127.1 * a + 311.7 * b));
const ring = (f: (t: number) => Pt) => {
  const out: Pt[] = [];
  for (let i = 0; i < 72; i++) out.push(f((i + 0.5) / 72));
  return out;
};
const circle = (r: number) =>
  ring((s) => {
    const t = Math.PI / 2 + P * s;
    return [r * Math.cos(t), r * Math.sin(t)];
  });

const STATES: Record<MascotState, (t: number) => Frame> = {
  tilde: (e) => {
    const t = 0.65 * e;
    const s = fract(t / 4.8);
    const a = s < 0.4 ? smooth(s / 0.4) : s < 0.48 ? 1 : s < 0.92 ? 1 - smooth((s - 0.48) / 0.44) : 0;
    const o = 7.5 * (0.85 + 0.2 * a);
    const l = 0.26 * P * t;
    return {
      shape: circle(18 * (1 + 0.05 * a)),
      samples: 600,
      line: (x) => [lerp(-30, 30, x), 2 - o * Math.pow(Math.max(0, Math.sin(Math.PI * x)), 0.7) * Math.sin(P * x - l)],
    };
  },
  think1: (e) => {
    const s = 0.5 + 0.07 * Math.sin(P * e * 0.11);
    const t = 10 + 3.5 * Math.sin(P * e * 0.3);
    return {
      shape: circle(17),
      samples: 600,
      line: (a) => {
        const o = P * smooth((a - s) / 0.46 + 0.5);
        return [-32 + 64 * a + t * Math.sin(o), 10 - t * (1 - Math.cos(o)) + 1.2 * Math.sin(P * (a - 0.2 * e))];
      },
    };
  },
  working: (e) => {
    const s = 6.5 + 0.8 * Math.sin(P * e * 0.45);
    return {
      shape: circle(18),
      samples: 220,
      line: (t) => [-34 + 68 * t, -(0.62 * s) * Math.sin(3 * P * t - 0.9 * P * e)],
    };
  },
  connecting: (e) => {
    const step = (a: number, b: number, x: number) => cubic((x - a) / (b - a));
    const t = fract(e / 4.4);
    const a = step(0.1, 0.36, t) - step(0.74, 0.9, t);
    const o = step(0.36, 0.5, t) - step(0.62, 0.74, t);
    const l = 20 * (1 - 0.29 * a);
    const n = l * Math.pow(Math.max(0, a), 0.85) + 2.5 * o;
    const d = 1.3 * o * Math.sin(0.45 * P * e);
    const r = Math.atan2(Math.sqrt(Math.max(0, l * l - n * n)), n);
    const u = ring((s) => {
      const left = s < 0.5;
      const k = left ? 2 * s : 2 * s - 1;
      const ang = left ? lerp(r, P - r, k) : lerp(r - Math.PI, Math.PI - r, k);
      const rad = l * (1 + 0.035 * Math.sin(2 * ang + 0.8 * e) + 0.02 * Math.sin(3 * ang - 0.6 * e));
      const x = (left ? -n : n) + rad * Math.cos(ang);
      const y = (left ? d : -d) + rad * Math.sin(ang);
      return [0.9838436927881214 * x + 0.17902957342582418 * y, -0.17902957342582418 * x + 0.9838436927881214 * y];
    });
    const split = n >= l - 1e-6 && o > 0;
    const spans: [number, number][] = split
      ? [
          [0, 36],
          [36, 72],
        ]
      : [[0, 72]];
    for (const [from, to] of spans) {
      for (let pass = 0; pass < 3; pass++) {
        const seg = u.slice(from, to);
        const len = seg.length;
        seg.forEach((p, i) => {
          const prev = seg[(i + len - 1) % len];
          const next = seg[(i + 1) % len];
          u[from + i] = [(prev[0] + 2 * p[0] + next[0]) / 4, (prev[1] + 2 * p[1] + next[1]) / 4];
        });
      }
    }
    return { shape: u, split };
  },
  waitshape: (e) => {
    const o = fract(e / 2.8);
    const l = hump(o / 0.34);
    const n = hump((o - 0.34) / 0.16);
    const sx = 1 - 0.07 * l + 0.08 * n;
    const sy = 1.06 + 0.1 * l - 0.1 * n;
    const lift = 7 * l;
    return {
      shape: ring((p) => {
        const ang = P * p;
        const rad = 19.5 + 0.9 * Math.sin(3 * ang + 0.8 * e);
        return [-rad * Math.sin(ang) * sx, (rad * Math.cos(ang) - 19.5) * sy + 19.5 - lift];
      }),
    };
  },
};

const r2 = (e: number) => Math.round(100 * e) / 100;
const fmt = (p: Pt) => `${r2(p[0])} ${r2(p[1])}`;
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const closed = (pts: Pt[]) => {
  const n = pts.length;
  let d = `M${fmt(mid(pts[n - 1], pts[0]))}`;
  pts.forEach((p, i) => {
    d += `Q${fmt(p)} ${fmt(mid(p, pts[(i + 1) % n]))}`;
  });
  return `${d}Z`;
};
const centroid = (pts: Pt[]): Pt => {
  let x = 0;
  let y = 0;
  for (const p of pts) {
    x += p[0];
    y += p[1];
  }
  return [x / pts.length, y / pts.length];
};
const dir = (a: Pt, b: Pt): Pt => {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
};
/** The morph's clock: a Hermite ease over 1.475 units, half done at 0.475. */
const morph = (e: number) => {
  if (e <= 0) return 0;
  if (e >= 1.475) return 1;
  const k = 0.6779661016949152;
  const h = (x: number, s: number, a: number, b: number, ma: number, mb: number) => {
    const n = x / s;
    const d = n * n;
    const r = d * n;
    return (2 * r - 3 * d + 1) * a + (r - 2 * d + n) * s * ma + (3 * d - 2 * r) * b + (r - d) * s * mb;
  };
  return e < 0.475 ? h(e, 0.475, 0, 0.5, 1.0526315789473684, k) : h(e - 0.475, 1, 0.5, 1, k, 0.5);
};

/** Four brush grains; the line cycles through them, so its edge shimmers like ink. */
const GRAINS = [
  [0, 0, 0, 0],
  [1.9, 2.7, 1.3, 3.1],
  [3.8, 5.1, 2.9, 0.7],
  [5.3, 1.1, 4.6, 2.2],
];
const BRUSH = 3.9375;
const taper = (seed: number, len: number, total: number) => {
  const a = hash(0, 7.31 * seed + 1.7);
  const o = hash(0, 3.17 * seed + 5.3);
  const l = 0.97 - 0.12 * a;
  const n = Math.min(len * (0.7 + 0.9 * a) * (0.9 + 0.2 * o), 0.45 * total);
  const d = 1.7 + 0.6 * o;
  return (x: number) => l + (1 - l) * (1 - Math.pow(1 - Math.min(1, x / n), d));
};

/** The line as a filled brush stroke: a wobbling centre, a width that swells and tapers, round ends. */
function brush(pts: Pt[], grain: number, time: number) {
  const dist = [0];
  for (let i = 1; i < pts.length; i++) dist.push(dist[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = dist[dist.length - 1];
  if (pts.length < 2 || total < 0.8) {
    const s = 1.96875;
    return `M${r2(pts[0][0] - s)} ${r2(pts[0][1])}a${r2(s)} ${r2(s)} 0 1 0 ${r2(2 * s)} 0a${r2(s)} ${r2(s)} 0 1 0 ${r2(-2 * s)} 0Z`;
  }
  const n = Math.min(1, total / 45);
  const wob = 0.9 * n;
  const drift = 0.175 * n;
  const g = GRAINS[grain];
  const head = taper(0, BRUSH, total);
  const tail = taper(1, BRUSH, total);
  const left: Pt[] = [];
  const right: Pt[] = [];
  const half: number[] = [];
  const last = pts.length - 1;
  pts.forEach((p, i) => {
    const t = dir(pts[Math.max(0, i - 1)], pts[Math.min(last, i + 1)]);
    const nx = -t[1];
    const ny = t[0];
    const m = dist[i];
    const off = wob * (0.65 * Math.sin((P / 85) * m + g[0]) + 0.35 * Math.sin((P / 35) * m + g[1])) + drift * Math.sin((P / 150) * m + 0.5 * time);
    const w =
      Math.max(0.3, BRUSH * (1 + 0.26 * (0.6 * Math.sin((P / 60) * m + g[2]) + 0.4 * Math.sin((P / 25) * m + g[3]))) * head(m) * tail(total - m)) / 2;
    left.push([p[0] + nx * (off + w), p[1] + ny * (off + w)]);
    right.push([p[0] + nx * (off - w), p[1] + ny * (off - w)]);
    half.push(w);
  });
  right.reverse();
  const side = (e: Pt[]) => {
    let s = '';
    for (let i = 1; i < e.length - 1; i++) s += `Q${fmt(e[i])} ${fmt(mid(e[i], e[i + 1]))}`;
    return `${s}L${fmt(e[e.length - 1])}`;
  };
  const cap = (a: Pt, b: Pt, t: Pt, k: number) => `C${fmt([a[0] + t[0] * k, a[1] + t[1] * k])} ${fmt([b[0] + t[0] * k, b[1] + t[1] * k])} ${fmt(b)}`;
  return `M${fmt(left[0])}${side(left)}${cap(left[last], right[0], dir(pts[Math.max(0, last - 1)], pts[last]), 1.333 * half[last])}${side(right)}${cap(right[last], left[0], dir(pts[Math.min(last, 1)], pts[0]), 1.333 * half[0])}Z`;
}

/**
 * The mascot's clock and morphs, drawing into two SVG paths. `ask` moves to a state (queued if a morph is past
 * halfway), `advance` runs the clock by real seconds.
 */
export function createMascot(shapeEl: SVGPathElement, lineEl: SVGPathElement, initial: MascotState) {
  let cur: MascotState = initial;
  let prev: MascotState | null = null;
  let queued: MascotState | null = null;
  let curStart = 0;
  let prevStart = 0;
  let progress = 0;
  let clock = 0;
  let real = 0;
  let lastTick = -1;

  const draw = () => {
    const now = STATES[cur](clock - curStart);
    let line = now.line ?? null;
    let span: [number, number] = [0, 1];
    let shape = now.shape;
    let split = !!now.split;
    let samples = now.samples ?? 0;
    if (prev) {
      const k = morph(progress);
      const before = STATES[prev](clock - prevStart);
      samples = Math.max(samples, before.samples ?? 0);
      if (now.line && (!before.line || k >= 0.5)) {
        const a = clamp01((k - 0.5) / 0.5);
        const drawn = lerp(smooth(a), 1 - Math.pow(1 - a, 3), 0.55);
        line = drawn > 0 ? now.line : null;
        span = [0, drawn];
      } else if (before.line) {
        const gone = smooth(clamp01(k / 0.5));
        line = gone < 1 ? before.line : null;
        span = [gone, 1];
      } else line = null;
      const d = cubic(k);
      const squeeze = 1 - 0.288 * Math.sin(Math.PI * d);
      shape = before.shape.map((p, i) => [lerp(p[0], now.shape[i][0], d), lerp(p[1], now.shape[i][1], d)] as Pt);
      split = d < 0.5 ? !!before.split : !!now.split;
      const c = centroid(shape);
      shape = shape.map((p) => [c[0] + (p[0] - c[0]) * squeeze, c[1] + (p[1] - c[1]) * squeeze] as Pt);
    }
    const c = centroid(shape);
    const wob = 2.55 * clock;
    const blob = shape.map((p) => {
      const dx = p[0] - c[0];
      const dy = p[1] - c[1];
      const a = Math.atan2(dy, dx);
      const k = 1 + 0.02178 * (Math.sin(3 * a + 1.6 * wob) + 0.6 * Math.sin(5 * a - 2.3 * wob));
      return [c[0] + dx * k + 2.6, c[1] + dy * k + 2.2] as Pt;
    });
    shapeEl.setAttribute('d', split ? closed(blob.slice(0, 36)) + closed(blob.slice(36)) : closed(blob));
    if (!line) {
      lineEl.setAttribute('d', '');
      return;
    }
    const cap = Math.min(samples, 200);
    const width = span[1] - span[0];
    const steps = Math.max(1, Math.min(cap, Math.ceil(width * cap)));
    const pts: Pt[] = [];
    for (let i = 0; i <= steps; i++) pts.push(line(clamp01(Math.min(span[0] + (width * i) / steps, span[1]))));
    lineEl.setAttribute('d', brush(pts, ((Math.floor(6 * clock) % 4) + 4) % 4, clock));
  };

  const begin = (next: MascotState) => {
    prev = cur;
    prevStart = curStart;
    cur = next;
    curStart = clock;
    progress = 0;
  };

  draw();
  return {
    ask(next: MascotState) {
      if (next === cur) {
        queued = null;
        return;
      }
      if (!prev) begin(next);
      else if (morph(progress) < 0.5) {
        cur = next;
        curStart = clock;
      } else queued = next;
    },
    advance(seconds: number) {
      real += seconds;
      clock += 1.77 * seconds;
      if (prev && (progress += 1.77 * seconds) >= 1.475) {
        prev = null;
        if (queued && queued !== cur) begin(queued);
        queued = null;
      }
      const tick = Math.floor(12 * real);
      if (tick !== lastTick) {
        lastTick = tick;
        draw();
      }
    },
  };
}
