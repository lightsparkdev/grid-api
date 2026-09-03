'use client';

import { forwardRef } from 'react';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import { CARD_FONT_FAMILY } from './card3d/cardFont';
import { INTRO_GEOMETRY as G, INTRO_PAD } from './introTimeline';
import styles from './CardStage.module.scss';

/** Stroke weights, card px (the overlay scales with the card). */
const MAIN = 1;
const CONSTRUCTION = 0.75;
const FINE = 0.5;

const DRAW = { pathLength: 1, strokeDasharray: 1, style: { strokeDashoffset: 1, opacity: 0 } } as const;
const FADE = { style: { opacity: 0 } } as const;

/**
 * The blueprint, laid out in card px inside the card's hit box. Every element
 * that animates carries `data-intro`; `stepIntro` poses them per frame and
 * fades the whole drawing out as the card comes into focus beneath it.
 */
export const CardIntro = forwardRef<SVGSVGElement, { brand: string }>(function CardIntro({ brand }, ref) {
  return (
    <svg
      ref={ref}
      className={styles.blueprint}
      viewBox={G.viewBox}
      style={{ inset: -INTRO_PAD, width: CARD_W + INTRO_PAD * 2, height: CARD_H + INTRO_PAD * 2 }}
      aria-hidden
    >
      <g fill="none" stroke="var(--card-blueprint)" strokeLinecap="round" strokeLinejoin="round">
        {/* Registration */}
        {G.ticks.map((d, i) => (
          <path key={i} data-intro={`tick-${i}`} d={d} strokeWidth={CONSTRUCTION} {...DRAW} />
        ))}
        <path data-intro="cross" d={G.cross} strokeWidth={CONSTRUCTION} {...DRAW} />
        <circle data-intro="ring" cx={G.ring.cx} cy={G.ring.cy} r={G.ring.r} strokeWidth={CONSTRUCTION} {...DRAW} />
        <path data-intro="centerlines" data-opacity="0.4" d={G.centerlines} strokeWidth={FINE} strokeDasharray="4 4" {...FADE} />

        {/* The card */}
        <path data-intro="outline" d={G.outline} strokeWidth={MAIN} {...DRAW} />

        {/* Dimensions */}
        <path data-intro="dim-w" d={G.dimW} strokeWidth={CONSTRUCTION} {...DRAW} />
        <path data-intro="ext-w" data-opacity="0.35" d={G.extW} strokeWidth={FINE} strokeDasharray="2 2" {...FADE} />
        <text data-intro="label-w" className={styles.blueprintLabel} x={G.labelW.x} y={G.labelW.y} fontSize={G.fontDim} textAnchor="middle" {...FADE}>
          1536 · 85.60 mm
        </text>
        <path data-intro="dim-h" d={G.dimH} strokeWidth={CONSTRUCTION} {...DRAW} />
        <path data-intro="ext-h" data-opacity="0.35" d={G.extH} strokeWidth={FINE} strokeDasharray="2 2" {...FADE} />
        <text
          data-intro="label-h"
          className={styles.blueprintLabel}
          x={G.labelH.x}
          y={G.labelH.y}
          fontSize={G.fontDim}
          textAnchor="middle"
          transform={`rotate(-90 ${G.labelH.x} ${G.labelH.y})`}
          {...FADE}
        >
          963 · 53.98 mm
        </text>
        <path data-intro="leader-r" d={G.leaderR} strokeWidth={CONSTRUCTION} {...DRAW} />
        <circle data-intro="circle-r" data-opacity="0.35" cx={G.circleR.cx} cy={G.circleR.cy} r={G.circleR.r} strokeWidth={FINE} strokeDasharray="1.5 1.5" {...FADE} />
        <text data-intro="label-r" className={styles.blueprintLabel} x={G.labelR.x} y={G.labelR.y} fontSize={G.fontSmall} textAnchor="end" {...FADE}>
          R 64.8 · 3.6 mm
        </text>

        {/* Skeleton */}
        <path data-intro="chip-plate" d={G.chipPlate} strokeWidth={MAIN} {...DRAW} />
        {G.pads.map((d, i) => (
          <path key={i} data-intro={`pad-${i}`} d={d} strokeWidth={CONSTRUCTION} {...DRAW} />
        ))}
        <path data-intro="dim-cx" d={G.dimCX} strokeWidth={CONSTRUCTION} {...DRAW} />
        <text data-intro="label-cx" className={styles.blueprintLabel} x={G.labelCX.x} y={G.labelCX.y} fontSize={G.fontSmall} textAnchor="middle" {...FADE}>
          172
        </text>
        <path data-intro="dim-cy" d={G.dimCY} strokeWidth={CONSTRUCTION} {...DRAW} />
        <text data-intro="label-cy" className={styles.blueprintLabel} x={G.labelCY.x} y={G.labelCY.y} fontSize={G.fontSmall} dominantBaseline="middle" {...FADE}>
          334
        </text>
        <text data-intro="label-chip" className={styles.blueprintLabel} x={G.labelChip.x} y={G.labelChip.y} fontSize={G.fontSmall} {...FADE}>
          197 × 149 · R 25.4
        </text>
        <rect
          data-intro="brand-box"
          data-opacity="0.6"
          x={G.brandBox.x}
          y={G.brandBox.y}
          width={G.brandBox.w}
          height={G.brandBox.h}
          strokeWidth={FINE}
          strokeDasharray="3 2"
          {...FADE}
        />
        <text
          data-intro="brand-text"
          data-opacity="0.45"
          x={G.brandText.x}
          y={G.brandText.y}
          fontSize={G.brandText.size}
          fontFamily={`'${CARD_FONT_FAMILY}', 'Suisse Intl', sans-serif`}
          fontWeight={430}
          textAnchor="end"
          fill="var(--card-blueprint)"
          stroke="none"
          {...FADE}
        >
          {brand}
        </text>
      </g>
    </svg>
  );
});
