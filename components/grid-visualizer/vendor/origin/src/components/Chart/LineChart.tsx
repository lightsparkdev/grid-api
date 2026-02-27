// Figma: https://www.figma.com/design/3JvbUyTqbbPL8cCpwSX0j4/Origin-design-system?node-id=6338-2213

'use client';

import * as React from 'react';
import clsx from 'clsx';
import {
  linearScale,
  niceTicks,
  monotonePath,
  linearPath,
  monotoneInterpolator,
  linearInterpolator,
  type Point,
  type CurveInterpolator,
} from './utils';
import styles from './Chart.module.scss';

// Types

export interface Series {
  key: string;
  label?: string;
  color?: string;
}

export type TooltipProp =
  | boolean
  | 'simple'
  | 'detailed'
  | ((
      datum: Record<string, unknown>,
      series: Array<Required<Series>>,
    ) => React.ReactNode);

export interface LineChartProps extends React.ComponentPropsWithoutRef<'div'> {
  data: Record<string, unknown>[];
  dataKey?: string;
  series?: Series[];
  xKey?: string;
  height?: number;
  grid?: boolean;
  /**
   * Controls the hover tooltip.
   * - `false` / omitted: no tooltip
   * - `true` / `"detailed"`: full tooltip with x-label, series dots, names, and values
   * - `"simple"`: timestamp-only tooltip (just the formatted x-label)
   * - `(datum, series) => ReactNode`: custom render function; the chart handles positioning
   */
  tooltip?: TooltipProp;
  curve?: 'monotone' | 'linear';
  strokeWidth?: number;
  /** Stroke color shorthand for single-series charts using `dataKey`. */
  color?: string;
  animate?: boolean;
  /**
   * Fade line paths to transparent on the left edge.
   * `true` for 40 px default, or a number for a custom fade width in pixels.
   */
  fadeLeft?: boolean | number;
  /** Accessible label for the chart SVG. */
  ariaLabel?: string;
  /**
   * Called when the hovered data point changes during scrub interaction.
   * Receives `null` when the pointer leaves the chart.
   */
  onActiveChange?: (
    index: number | null,
    datum: Record<string, unknown> | null,
  ) => void;
  formatValue?: (value: number) => string;
  formatXLabel?: (value: unknown) => string;
  formatYLabel?: (value: number) => string;
}

// Default color palette using Origin tokens
const SERIES_COLORS = [
  'var(--border-primary)',
  'var(--text-secondary)',
  'var(--surface-blue-strong)',
  'var(--surface-purple-strong)',
  'var(--surface-green-strong)',
  'var(--surface-pink-strong)',
];

// Chart geometry
const PAD_TOP = 8;
const PAD_RIGHT = 8;
const PAD_BOTTOM_AXIS = 28;
const PAD_LEFT_AXIS = 48;
const TOOLTIP_GAP = 12;

// Responsive width via callback ref + ResizeObserver.
// Uses a callback ref to avoid timing races between useEffect
// and the forwarded ref callback.
function useResizeWidth() {
  const [width, setWidth] = React.useState(0);
  const observerRef = React.useRef<ResizeObserver | null>(null);

  const attachRef = React.useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (node) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) setWidth(entry.contentRect.width);
      });
      observer.observe(node);
      observerRef.current = observer;
      setWidth(node.clientWidth);
    }
  }, []);

  React.useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return { width, attachRef };
}

export const Line = React.forwardRef<HTMLDivElement, LineChartProps>(
  function Line(
    {
      data,
      dataKey,
      series: seriesProp,
      xKey,
      height = 300,
      grid = false,
      tooltip: tooltipProp,
      curve = 'monotone',
      strokeWidth = 1.5,
      color,
      animate = true,
      fadeLeft,
      ariaLabel,
      onActiveChange,
      formatValue,
      formatXLabel,
      formatYLabel,
      className,
      ...props
    },
    ref,
  ) {
    const { width, attachRef } = useResizeWidth();
    const uid = React.useId().replace(/:/g, '');

    // Resolve tooltip mode from the polymorphic prop
    const tooltipMode: 'off' | 'simple' | 'detailed' | 'custom' = !tooltipProp
      ? 'off'
      : tooltipProp === true || tooltipProp === 'detailed'
        ? 'detailed'
        : tooltipProp === 'simple'
          ? 'simple'
          : 'custom';
    const showTooltip = tooltipMode !== 'off';
    const tooltipRender =
      typeof tooltipProp === 'function' ? tooltipProp : undefined;

    // Merge the ResizeObserver callback ref with the forwarded ref
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        attachRef(node);
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref, attachRef],
    );

    // Resolve series
    const series = React.useMemo<Array<Required<Series>>>(() => {
      if (seriesProp) {
        return seriesProp.map((s, i) => ({
          key: s.key,
          label: s.label ?? s.key,
          color: s.color ?? SERIES_COLORS[i % SERIES_COLORS.length],
        }));
      }
      if (dataKey) {
        return [
          { key: dataKey, label: dataKey, color: color ?? SERIES_COLORS[0] },
        ];
      }
      return [];
    }, [seriesProp, dataKey, color]);

    if (process.env.NODE_ENV !== 'production') {
      if (color && seriesProp) {
        // eslint-disable-next-line no-console
        console.warn(
          'Chart.Line: `color` is ignored when `series` is provided. ' +
            'Set color on each series entry instead.',
        );
      }
    }

    // Chart area geometry
    const showXAxis = Boolean(xKey);
    const showYAxis = grid;
    const padBottom = showXAxis ? PAD_BOTTOM_AXIS : 0;
    const padLeft = showYAxis ? PAD_LEFT_AXIS : 0;
    const plotWidth = Math.max(0, width - padLeft - PAD_RIGHT);
    const plotHeight = Math.max(0, height - PAD_TOP - padBottom);

    // Left-edge fade
    const fadeWidth =
      fadeLeft === true ? 40 : typeof fadeLeft === 'number' ? fadeLeft : 0;
    const hasFade = fadeWidth > 0 && plotWidth > 0;
    const fadeMaskId = hasFade ? `${uid}-fade` : undefined;
    const clipActiveId = `${uid}-clip-active`;
    const clipInactiveId = `${uid}-clip-inactive`;

    // Y domain with nice ticks
    const { yMin, yMax, yTicks } = React.useMemo(() => {
      let min = Infinity;
      let max = -Infinity;
      for (const s of series) {
        for (const d of data) {
          const v = Number(d[s.key]);
          if (!isNaN(v)) {
            if (v < min) min = v;
            if (v > max) max = v;
          }
        }
      }
      if (min === Infinity) {
        return { yMin: 0, yMax: 1, yTicks: [0, 1] };
      }
      const result = niceTicks(min, max, 5);
      return { yMin: result.min, yMax: result.max, yTicks: result.ticks };
    }, [data, series]);

    // Compute pixel points for each series
    const seriesPoints = React.useMemo(() => {
      if (plotWidth <= 0 || plotHeight <= 0 || data.length === 0) return [];

      return series.map((s) => {
        const points: Point[] = [];
        for (let i = 0; i < data.length; i++) {
          const v = Number(data[i][s.key]);
          if (isNaN(v)) continue;
          const x =
            data.length === 1
              ? plotWidth / 2
              : (i / (data.length - 1)) * plotWidth;
          const y = linearScale(v, yMin, yMax, plotHeight, 0);
          points.push({ x, y });
        }
        return points;
      });
    }, [data, series, plotWidth, plotHeight, yMin, yMax]);

    // SVG paths
    const paths = React.useMemo(() => {
      const build = curve === 'monotone' ? monotonePath : linearPath;
      return seriesPoints.map((pts) => build(pts));
    }, [seriesPoints, curve]);

    // X axis labels (smart spacing to avoid overlap)
    const xLabels = React.useMemo(() => {
      if (!xKey || data.length === 0 || plotWidth <= 0) return [];

      const maxLabels = Math.max(2, Math.floor(plotWidth / 60));

      let indices: number[];
      if (data.length <= maxLabels) {
        indices = data.map((_, i) => i);
      } else {
        indices = [0];
        const step = (data.length - 1) / (maxLabels - 1);
        for (let i = 1; i < maxLabels - 1; i++) {
          indices.push(Math.round(i * step));
        }
        indices.push(data.length - 1);
      }

      return indices.map((i) => {
        const x =
          data.length === 1
            ? plotWidth / 2
            : (i / (data.length - 1)) * plotWidth;
        const raw = data[i][xKey];
        const text = formatXLabel ? formatXLabel(raw) : String(raw ?? '');
        return { x, text, index: i };
      });
    }, [xKey, data, plotWidth, formatXLabel]);

    // Y axis labels
    const yLabels = React.useMemo(() => {
      if (!showYAxis || plotHeight <= 0) return [];
      return yTicks.map((v) => ({
        y: linearScale(v, yMin, yMax, plotHeight, 0),
        text: formatYLabel ? formatYLabel(v) : String(v),
      }));
    }, [showYAxis, yTicks, yMin, yMax, plotHeight, formatYLabel]);

    // Curve interpolators: evaluate y at any screen x (for smooth dot tracking)
    const interpolators = React.useMemo<CurveInterpolator[]>(() => {
      const build =
        curve === 'monotone' ? monotoneInterpolator : linearInterpolator;
      return seriesPoints.map((pts) => build(pts));
    }, [seriesPoints, curve]);

    // Keep interpolators in a ref so the mousemove handler always has
    // the latest without re-creating the callback.
    const interpolatorsRef = React.useRef(interpolators);
    React.useLayoutEffect(() => {
      interpolatorsRef.current = interpolators;
    }, [interpolators]);

    // Hover system: cursor line, dots, clip masks, and tooltip position
    // update via direct DOM manipulation for smooth 1:1 mouse tracking.
    // Only activeIndex (for tooltip content) triggers a React re-render.
    const cursorRef = React.useRef<SVGLineElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const dotRefs = React.useRef<(SVGRectElement | null)[]>([]);
    const clipLeftRef = React.useRef<SVGRectElement>(null);
    const clipRightRef = React.useRef<SVGRectElement>(null);
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    // Trim stale dot refs when series count shrinks
    React.useEffect(() => {
      dotRefs.current.length = series.length;
    }, [series.length]);

    // Reset activeIndex when data changes to prevent out-of-bounds access
    React.useEffect(() => {
      setActiveIndex(null);
    }, [data]);

    // Notify consumer when the active data point changes
    const onActiveChangeRef = React.useRef(onActiveChange);
    React.useLayoutEffect(() => {
      onActiveChangeRef.current = onActiveChange;
    }, [onActiveChange]);

    React.useEffect(() => {
      onActiveChangeRef.current?.(
        activeIndex,
        activeIndex !== null && activeIndex < data.length
          ? data[activeIndex]
          : null,
      );
    }, [activeIndex, data]);

    // Shared hover logic: update cursor, dots, tooltip, and activeIndex
    // from a client-x coordinate. Called by both mouse and touch handlers.
    const updateHover = React.useCallback(
      (clientX: number, svgEl: SVGSVGElement) => {
        if (data.length === 0 || plotWidth <= 0) return;
        const rect = svgEl.getBoundingClientRect();
        const rawX = clientX - rect.left - padLeft;
        const clampedX = Math.max(0, Math.min(plotWidth, rawX));

        // Direct DOM: move cursor line
        const cursor = cursorRef.current;
        if (cursor) {
          cursor.setAttribute('x1', String(clampedX));
          cursor.setAttribute('x2', String(clampedX));
          cursor.style.display = '';
        }

        // Direct DOM: split line color at cursor position
        const clipL = clipLeftRef.current;
        if (clipL) {
          clipL.setAttribute('width', String(clampedX));
        }
        const clipR = clipRightRef.current;
        if (clipR) {
          clipR.setAttribute('x', String(clampedX));
          clipR.setAttribute('width', String(plotWidth - clampedX + PAD_RIGHT));
        }

        // Direct DOM: slide dots along curves
        const interps = interpolatorsRef.current;
        dotRefs.current.forEach((dot, i) => {
          if (dot && interps[i]) {
            const cy = interps[i](clampedX);
            dot.setAttribute('x', String(clampedX - 4));
            dot.setAttribute('y', String(cy - 4));
            dot.style.display = '';
          }
        });

        // Direct DOM: move tooltip
        const tip = tooltipRef.current;
        if (tip) {
          const absX = padLeft + clampedX;
          const isLeftHalf = clampedX <= plotWidth / 2;
          tip.style.left = `${absX}px`;
          tip.style.transform = isLeftHalf
            ? `translateX(${TOOLTIP_GAP}px)`
            : `translateX(calc(-100% - ${TOOLTIP_GAP}px))`;
          tip.style.display = '';
        }

        // React state: only update when nearest index actually changes
        const step =
          data.length === 1 ? plotWidth : plotWidth / (data.length - 1);
        const index = Math.max(
          0,
          Math.min(data.length - 1, Math.round(rawX / step)),
        );
        setActiveIndex((prev) => (prev === index ? prev : index));
      },
      [data.length, plotWidth, padLeft],
    );

    const hideHover = React.useCallback(() => {
      const cursor = cursorRef.current;
      if (cursor) cursor.style.display = 'none';
      dotRefs.current.forEach((dot) => {
        if (dot) dot.style.display = 'none';
      });
      const tip = tooltipRef.current;
      if (tip) tip.style.display = 'none';
      // Reset clip masks: active paths cover full width, inactive hidden
      const clipL = clipLeftRef.current;
      if (clipL) clipL.setAttribute('width', String(plotWidth + PAD_RIGHT));
      const clipR = clipRightRef.current;
      if (clipR) {
        clipR.setAttribute('x', String(plotWidth + PAD_RIGHT));
        clipR.setAttribute('width', '0');
      }
      setActiveIndex(null);
    }, [plotWidth]);

    // Mouse handlers
    const handleMouseMove = React.useCallback(
      (e: React.MouseEvent<SVGSVGElement>) => {
        updateHover(e.clientX, e.currentTarget);
      },
      [updateHover],
    );

    // Touch handlers (passive -- no preventDefault so page scroll isn't blocked)
    const handleTouchStart = React.useCallback(
      (e: React.TouchEvent<SVGSVGElement>) => {
        if (e.touches.length > 0) {
          updateHover(e.touches[0].clientX, e.currentTarget);
        }
      },
      [updateHover],
    );

    const handleTouchMove = React.useCallback(
      (e: React.TouchEvent<SVGSVGElement>) => {
        if (e.touches.length > 0) {
          updateHover(e.touches[0].clientX, e.currentTarget);
        }
      },
      [updateHover],
    );

    const fmtValue = React.useCallback(
      (v: number) => (formatValue ? formatValue(v) : String(v)),
      [formatValue],
    );

    const ready = width > 0;

    // Build accessible description from data
    const svgDesc = React.useMemo(() => {
      if (series.length === 0 || data.length === 0) return undefined;
      const names = series.map((s) => s.label).join(', ');
      return `Line chart with ${data.length} data points showing ${names}.`;
    }, [series, data.length]);

    return (
      <div
        ref={mergedRef}
        className={clsx(styles.root, className)}
        style={{ height }}
        {...props}
      >
        {ready && (
          <>
            <svg
              role="img"
              aria-label={ariaLabel ?? svgDesc ?? 'Line chart'}
              width={width}
              height={height}
              className={styles.svg}
              onMouseMove={handleMouseMove}
              onMouseLeave={hideHover}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={hideHover}
              onTouchCancel={hideHover}
            >
              {svgDesc && <desc>{svgDesc}</desc>}

              <defs>
                {hasFade && (
                  <>
                    <linearGradient
                      id={`${fadeMaskId}-grad`}
                      gradientUnits="userSpaceOnUse"
                      x1={0}
                      y1={0}
                      x2={fadeWidth}
                      y2={0}
                    >
                      <stop offset="0" stopColor="white" stopOpacity={0} />
                      <stop offset="1" stopColor="white" stopOpacity={1} />
                    </linearGradient>
                    <mask id={fadeMaskId}>
                      <rect
                        x={0}
                        y={-PAD_TOP}
                        width={fadeWidth}
                        height={height}
                        fill={`url(#${fadeMaskId}-grad)`}
                      />
                      <rect
                        x={fadeWidth}
                        y={-PAD_TOP}
                        width={plotWidth - fadeWidth + PAD_RIGHT}
                        height={height}
                        fill="white"
                      />
                    </mask>
                  </>
                )}

                {/* Clip paths for scrub color split */}
                <clipPath id={clipActiveId}>
                  <rect
                    ref={clipLeftRef}
                    x={0}
                    y={-PAD_TOP}
                    width={plotWidth + PAD_RIGHT}
                    height={height}
                  />
                </clipPath>
                <clipPath id={clipInactiveId}>
                  <rect
                    ref={clipRightRef}
                    x={plotWidth + PAD_RIGHT}
                    y={-PAD_TOP}
                    width={0}
                    height={height}
                  />
                </clipPath>
              </defs>

              <g transform={`translate(${padLeft},${PAD_TOP})`}>
                {/* Grid lines */}
                {grid &&
                  yLabels.map(({ y }, i) => (
                    <line
                      key={i}
                      x1={0}
                      y1={y}
                      x2={plotWidth}
                      y2={y}
                      className={styles.gridLine}
                    />
                  ))}

                {/* Line paths (dual: active color clipped left, tertiary clipped right) */}
                <g mask={fadeMaskId ? `url(#${fadeMaskId})` : undefined}>
                  {/* Active portion: series color, clipped to left of cursor */}
                  <g clipPath={`url(#${clipActiveId})`}>
                    {paths.map((d, i) => (
                      <path
                        key={series[i].key}
                        d={d}
                        pathLength={1}
                        fill="none"
                        stroke={series[i].color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={clsx(animate && styles.lineAnimate)}
                      />
                    ))}
                  </g>
                  {/* Inactive portion: muted color, clipped to right of cursor */}
                  <g clipPath={`url(#${clipInactiveId})`}>
                    {paths.map((d, i) => (
                      <path
                        key={`${series[i].key}-inactive`}
                        d={d}
                        fill="none"
                        stroke="var(--border-tertiary)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                  </g>
                </g>

                {/* Cursor line (always mounted, visibility toggled via ref) */}
                <line
                  ref={cursorRef}
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={plotHeight}
                  className={styles.cursorLine}
                  style={{ display: 'none' }}
                />

                {/* Active dots (always mounted, positioned via ref) */}
                {series.map((s, i) => (
                  <rect
                    key={s.key}
                    ref={(el) => {
                      dotRefs.current[i] = el;
                    }}
                    x={0}
                    y={0}
                    width={8}
                    height={8}
                    rx={2}
                    fill={s.color}
                    className={styles.activeDot}
                    style={{ display: 'none' }}
                  />
                ))}

                {/* Y axis labels */}
                {yLabels.map(({ y, text }, i) => (
                  <text
                    key={i}
                    x={-8}
                    y={y}
                    className={styles.axisLabel}
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {text}
                  </text>
                ))}

                {/* X axis labels */}
                {xLabels.map(({ x, text, index: labelIndex }, i) => (
                  <text
                    key={`${labelIndex}-${text}`}
                    x={x}
                    y={plotHeight + 20}
                    className={styles.axisLabel}
                    textAnchor={
                      i === 0
                        ? 'start'
                        : i === xLabels.length - 1
                          ? 'end'
                          : 'middle'
                    }
                    dominantBaseline="auto"
                  >
                    {text}
                  </text>
                ))}
              </g>
            </svg>

            {/* Tooltip (always mounted when enabled, visibility toggled via ref) */}
            {showTooltip && (
              <div
                ref={tooltipRef}
                className={clsx(styles.tooltip, tooltipMode === 'simple' && styles.tooltipSimple)}
                style={{
                  position: 'absolute',
                  top: PAD_TOP,
                  left: 0,
                  pointerEvents: 'none',
                  display: 'none',
                }}
              >
                {activeIndex !== null &&
                  activeIndex < data.length &&
                  (tooltipMode === 'custom' && tooltipRender ? (
                    tooltipRender(data[activeIndex], series)
                  ) : tooltipMode === 'simple' ? (
                    xKey && (
                      <p className={styles.tooltipLabel}>
                        {formatXLabel
                          ? formatXLabel(data[activeIndex][xKey])
                          : String(data[activeIndex][xKey] ?? '')}
                      </p>
                    )
                  ) : (
                    <>
                      {xKey && (
                        <p className={styles.tooltipLabel}>
                          {formatXLabel
                            ? formatXLabel(data[activeIndex][xKey])
                            : String(data[activeIndex][xKey] ?? '')}
                        </p>
                      )}
                      <div className={styles.tooltipItems}>
                        {series.map((s) => {
                          const v = Number(data[activeIndex][s.key]);
                          return (
                            <div key={s.key} className={styles.tooltipItem}>
                              <span
                                className={styles.tooltipIndicator}
                                style={{ backgroundColor: s.color }}
                              />
                              <span className={styles.tooltipName}>
                                {s.label}
                              </span>
                              <span className={styles.tooltipValue}>
                                {isNaN(v) ? '--' : fmtValue(v)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  },
);

if (process.env.NODE_ENV !== 'production') {
  Line.displayName = 'Chart.Line';
}
