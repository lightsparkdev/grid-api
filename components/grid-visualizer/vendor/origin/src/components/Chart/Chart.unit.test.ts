/**
 * Chart Unit Tests (Vitest)
 *
 * Pure-function tests for the chart math utilities.
 * These run in JSDOM (~1ms/test) and cover edge cases,
 * defensive guards, and numerical correctness.
 */

import { describe, it, expect } from 'vitest';
import {
  linearScale,
  niceTicks,
  monotonePath,
  linearPath,
  monotoneInterpolator,
  linearInterpolator,
  type Point,
} from './utils';

// ---------------------------------------------------------------------------
// linearScale
// ---------------------------------------------------------------------------

describe('linearScale', () => {
  it('maps domain min to range min', () => {
    expect(linearScale(0, 0, 100, 0, 500)).toBe(0);
  });

  it('maps domain max to range max', () => {
    expect(linearScale(100, 0, 100, 0, 500)).toBe(500);
  });

  it('maps midpoint correctly', () => {
    expect(linearScale(50, 0, 100, 0, 500)).toBe(250);
  });

  it('handles inverted range (range flipped)', () => {
    // domain 0-100 mapped to range 500-0 (top-down like SVG y)
    expect(linearScale(0, 0, 100, 500, 0)).toBe(500);
    expect(linearScale(100, 0, 100, 500, 0)).toBe(0);
  });

  it('returns range midpoint when domain is zero-width', () => {
    expect(linearScale(5, 5, 5, 0, 100)).toBe(50);
  });

  it('works with negative domains', () => {
    expect(linearScale(-50, -100, 0, 0, 200)).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// niceTicks
// ---------------------------------------------------------------------------

describe('niceTicks', () => {
  it('returns sensible ticks for a typical range', () => {
    const result = niceTicks(0, 100, 5);
    expect(result.min).toBeLessThanOrEqual(0);
    expect(result.max).toBeGreaterThanOrEqual(100);
    expect(result.ticks.length).toBeGreaterThanOrEqual(2);
    // Ticks should be in ascending order
    for (let i = 1; i < result.ticks.length; i++) {
      expect(result.ticks[i]).toBeGreaterThan(result.ticks[i - 1]);
    }
  });

  it('handles equal min and max', () => {
    const result = niceTicks(50, 50, 5);
    expect(result.min).toBeLessThan(50);
    expect(result.max).toBeGreaterThan(50);
    expect(result.ticks.length).toBeGreaterThanOrEqual(2);
  });

  it('handles equal min and max at zero', () => {
    const result = niceTicks(0, 0, 5);
    expect(result.min).toBeLessThan(0);
    expect(result.max).toBeGreaterThan(0);
    expect(result.ticks.length).toBeGreaterThanOrEqual(2);
  });

  it('normalizes swapped min and max', () => {
    const normal = niceTicks(0, 100, 5);
    const swapped = niceTicks(100, 0, 5);
    expect(swapped.min).toBe(normal.min);
    expect(swapped.max).toBe(normal.max);
    expect(swapped.ticks).toEqual(normal.ticks);
  });

  it('handles very small ranges', () => {
    const result = niceTicks(0.001, 0.005, 5);
    expect(result.ticks.length).toBeGreaterThanOrEqual(2);
    expect(result.min).toBeLessThanOrEqual(0.001);
    expect(result.max).toBeGreaterThanOrEqual(0.005);
  });

  it('handles very large ranges', () => {
    const result = niceTicks(0, 1_000_000, 5);
    expect(result.ticks.length).toBeGreaterThanOrEqual(2);
    expect(result.ticks.length).toBeLessThanOrEqual(100);
  });

  it('handles negative ranges', () => {
    const result = niceTicks(-100, -20, 5);
    expect(result.min).toBeLessThanOrEqual(-100);
    expect(result.max).toBeGreaterThanOrEqual(-20);
    for (let i = 1; i < result.ticks.length; i++) {
      expect(result.ticks[i]).toBeGreaterThan(result.ticks[i - 1]);
    }
  });

  it('never exceeds MAX_TICKS (100)', () => {
    // Pathological input that could generate many ticks
    const result = niceTicks(0, 1000, 200);
    expect(result.ticks.length).toBeLessThanOrEqual(100);
  });

  it('first tick <= dataMin and last tick >= dataMax', () => {
    const cases = [
      [3, 97],
      [-15, 42],
      [0.1, 0.9],
      [1000, 5000],
    ] as const;
    for (const [min, max] of cases) {
      const result = niceTicks(min, max);
      expect(result.ticks[0]).toBeLessThanOrEqual(min);
      expect(result.ticks[result.ticks.length - 1]).toBeGreaterThanOrEqual(max);
    }
  });
});

// ---------------------------------------------------------------------------
// monotonePath
// ---------------------------------------------------------------------------

describe('monotonePath', () => {
  it('returns empty string for no points', () => {
    expect(monotonePath([])).toBe('');
  });

  it('returns M command for single point', () => {
    expect(monotonePath([{ x: 10, y: 20 }])).toBe('M10,20');
  });

  it('returns M + L for two points', () => {
    const path = monotonePath([
      { x: 0, y: 0 },
      { x: 100, y: 50 },
    ]);
    expect(path).toMatch(/^M0,0L100,50$/);
  });

  it('returns M + C commands for three or more points', () => {
    const points: Point[] = [
      { x: 0, y: 100 },
      { x: 50, y: 20 },
      { x: 100, y: 80 },
    ];
    const path = monotonePath(points);
    expect(path).toMatch(/^M/);
    expect(path).toContain('C');
  });

  it('starts at first point and ends at last point', () => {
    const points: Point[] = [
      { x: 10, y: 90 },
      { x: 50, y: 30 },
      { x: 90, y: 70 },
    ];
    const path = monotonePath(points);
    expect(path).toMatch(/^M10,90/);
    expect(path).toMatch(/90,70$/);
  });

  it('rounds coordinates to 2 decimal places', () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 33.333333, y: 66.666666 },
    ];
    const path = monotonePath(points);
    // Should not contain more than 2 decimal places
    const numbers = path.match(/\d+\.\d+/g) ?? [];
    for (const n of numbers) {
      const decimals = n.split('.')[1];
      expect(decimals.length).toBeLessThanOrEqual(2);
    }
  });
});

// ---------------------------------------------------------------------------
// linearPath
// ---------------------------------------------------------------------------

describe('linearPath', () => {
  it('returns empty string for no points', () => {
    expect(linearPath([])).toBe('');
  });

  it('returns M command for single point', () => {
    expect(linearPath([{ x: 5, y: 10 }])).toBe('M5,10');
  });

  it('returns M + L commands for multiple points', () => {
    const path = linearPath([
      { x: 0, y: 0 },
      { x: 50, y: 25 },
      { x: 100, y: 50 },
    ]);
    expect(path).toBe('M0,0L50,25L100,50');
  });

  it('rounds coordinates to 2 decimal places', () => {
    const path = linearPath([
      { x: 0.12345, y: 0.67891 },
      { x: 100.999, y: 50.005 },
    ]);
    const numbers = path.match(/\d+\.\d+/g) ?? [];
    for (const n of numbers) {
      const decimals = n.split('.')[1];
      expect(decimals.length).toBeLessThanOrEqual(2);
    }
  });
});

// ---------------------------------------------------------------------------
// linearInterpolator
// ---------------------------------------------------------------------------

describe('linearInterpolator', () => {
  it('returns 0 for empty points', () => {
    const interp = linearInterpolator([]);
    expect(interp(50)).toBe(0);
  });

  it('returns constant y for single point', () => {
    const interp = linearInterpolator([{ x: 50, y: 75 }]);
    expect(interp(0)).toBe(75);
    expect(interp(100)).toBe(75);
  });

  it('interpolates linearly between two points', () => {
    const interp = linearInterpolator([
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ]);
    expect(interp(50)).toBe(50);
    expect(interp(25)).toBe(25);
    expect(interp(75)).toBe(75);
  });

  it('clamps at endpoints', () => {
    const interp = linearInterpolator([
      { x: 10, y: 20 },
      { x: 90, y: 80 },
    ]);
    expect(interp(0)).toBe(20); // before first
    expect(interp(100)).toBe(80); // after last
  });

  it('handles multiple segments', () => {
    const interp = linearInterpolator([
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 },
    ]);
    expect(interp(0)).toBe(0);
    expect(interp(50)).toBe(100);
    expect(interp(100)).toBe(0);
    expect(interp(25)).toBe(50); // midpoint of first segment
    expect(interp(75)).toBe(50); // midpoint of second segment
  });

  it('returns first y for coincident x values', () => {
    const interp = linearInterpolator([
      { x: 50, y: 10 },
      { x: 50, y: 90 },
    ]);
    expect(interp(50)).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// monotoneInterpolator
// ---------------------------------------------------------------------------

describe('monotoneInterpolator', () => {
  it('returns 0 for empty points', () => {
    const interp = monotoneInterpolator([]);
    expect(interp(50)).toBe(0);
  });

  it('returns constant y for single point', () => {
    const interp = monotoneInterpolator([{ x: 50, y: 75 }]);
    expect(interp(0)).toBe(75);
    expect(interp(100)).toBe(75);
  });

  it('interpolates between two points', () => {
    const interp = monotoneInterpolator([
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ]);
    // Two-point case falls back to linear
    expect(interp(50)).toBeCloseTo(50, 5);
  });

  it('clamps at endpoints', () => {
    const interp = monotoneInterpolator([
      { x: 10, y: 20 },
      { x: 50, y: 60 },
      { x: 90, y: 80 },
    ]);
    expect(interp(0)).toBe(20); // before first
    expect(interp(100)).toBe(80); // after last
  });

  it('passes through data points exactly', () => {
    const points: Point[] = [
      { x: 0, y: 10 },
      { x: 100, y: 50 },
      { x: 200, y: 30 },
      { x: 300, y: 70 },
    ];
    const interp = monotoneInterpolator(points);
    for (const p of points) {
      expect(interp(p.x)).toBeCloseTo(p.y, 5);
    }
  });

  it('is monotone between monotone data points', () => {
    // Strictly increasing data
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 100, y: 25 },
      { x: 200, y: 50 },
      { x: 300, y: 100 },
    ];
    const interp = monotoneInterpolator(points);

    // Sample between points -- values should be non-decreasing
    let prev = interp(0);
    for (let x = 1; x <= 300; x += 1) {
      const current = interp(x);
      expect(current).toBeGreaterThanOrEqual(prev - 1e-10);
      prev = current;
    }
  });

  it('returns first y for coincident x values', () => {
    const interp = monotoneInterpolator([
      { x: 50, y: 10 },
      { x: 50, y: 90 },
    ]);
    expect(interp(50)).toBe(10);
  });
});
