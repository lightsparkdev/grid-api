'use client';

import clsx from 'clsx';
import { IconBuildings } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBuildings';
import { IconPeopleCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPeopleCircle';
import { LayoutGroup, motion } from 'motion/react';
import { useLayoutEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { MODES, type Mode } from '@/data/mode';
import { motionTransition } from '@/lib/easing';
import { pressable } from '@/lib/sounds';
import styles from './ModeSwitch.module.scss';

/** How the switch is drawn: tiles with the agents' ring, the card designer's tabs, a row of the Cards playground's
 *  swatches (inside the agents' group), or a segmented pill. */
export type ModeSwitchVariant = 'tiles' | 'tabs' | 'row' | 'segmented' | 'heading';

const TABS: Record<Mode, { label: string; Icon: ComponentType<{ size?: number }>; color: string }> = {
  personal: { label: 'Personal', Icon: IconPeopleCircle, color: 'var(--color-sky-500)' },
  business: { label: 'Business', Icon: IconBuildings, color: '#34C759' },
};

/** The Cards playground's swatch ring, sprung the same way. */
const RING_SPRING = { type: 'spring', stiffness: 620, damping: 40, mass: 0.9 } as const;

interface ModeSwitchProps {
  mode: Mode;
  onSelect: (mode: Mode) => void;
  variant?: ModeSwitchVariant;
  /** Tabs: keep to the content's width instead of running across the panel. */
  inset?: boolean;
  /** Heading: a control pinned to its right (Reset), as the section heading it replaces has. */
  action?: ReactNode;
  /** Read as who the flows are for: "For personal", "For business". */
  forWhom?: boolean;
}

/** Personal or business. Each keeps its own conversation. */
export function ModeSwitch({ mode, onSelect, variant = 'tiles', inset, action, forWhom }: ModeSwitchProps) {
  const pick = (m: Mode) => pressable({ onClick: () => m !== mode && onSelect(m) });
  switch (variant) {
    case 'tiles':
      return <Tiles mode={mode} pick={pick} forWhom={forWhom} />;
    case 'tabs':
      return <RailTabs mode={mode} pick={pick} inset={inset} />;
    case 'row':
      return <SwatchRow mode={mode} pick={pick} />;
    case 'segmented':
      return <Segmented mode={mode} pick={pick} />;
    case 'heading':
      return <HeadingTabs mode={mode} pick={pick} action={action} />;
    default: {
      const exhaustive: never = variant;
      return exhaustive;
    }
  }
}

type Pick = (m: Mode) => ReturnType<typeof pressable>;

function Label({ m, forWhom }: { m: Mode; forWhom?: boolean }) {
  const { label, Icon, color } = TABS[m];
  return (
    <>
      <span className={styles.icon} style={{ color }}>
        <Icon size={20} />
      </span>
      <span className={styles.label}>{forWhom ? `For ${label.toLowerCase()}` : label}</span>
    </>
  );
}

/** Two tiles in the agents' group style; the chosen one wears their gradient ring, gliding between. */
function Tiles({ mode, pick, forWhom }: { mode: Mode; pick: Pick; forWhom?: boolean }) {
  return (
    <LayoutGroup id="mode-tiles">
      <div className={styles.tiles} role="tablist" aria-label="Personal or business">
        {MODES.map((m) => (
          <button key={m} type="button" role="tab" aria-selected={m === mode} className={clsx(styles.tile, m === mode && styles.active)} {...pick(m)}>
            {m === mode && <motion.span layoutId="mode-ring" className={styles.ring} transition={motionTransition(undefined, 0.22)} aria-hidden />}
            <span className={styles.content}>
              <Label m={m} forWhom={forWhom} />
            </span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

/** The card designer's Physical / Digital tabs: a strip on a hairline, the chosen tab open into the panel below it. */
function RailTabs({ mode, pick, inset }: { mode: Mode; pick: Pick; inset?: boolean }) {
  const refs = useRef<Partial<Record<Mode, HTMLButtonElement | null>>>({});
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[mode];
      if (el) setBox({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    const strip = refs.current.personal?.parentElement;
    if (!strip) return;
    const ro = new ResizeObserver(measure);
    ro.observe(strip);
    return () => ro.disconnect();
  }, [mode]);
  return (
    <div
      className={clsx(styles.railTabs, inset ? styles.railTabsInset : mode === MODES[0] && styles.railLeadingActive)}
      role="tablist"
      aria-label="Personal or business"
    >
      {box && <motion.span className={styles.railIndicator} aria-hidden initial={false} animate={box} transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }} />}
      {MODES.map((m) => (
        <button
          key={m}
          ref={(el) => {
            refs.current[m] = el;
          }}
          type="button"
          role="tab"
          aria-selected={m === mode}
          className={styles.railTab}
          {...pick(m)}
        >
          <Label m={m} />
        </button>
      ))}
    </div>
  );
}

/** A row at the foot of the agents' group: the Cards playground's swatches, in words, with its sliding ring. */
function SwatchRow({ mode, pick }: { mode: Mode; pick: Pick }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>Account</span>
      <LayoutGroup id="mode-row">
        <div className={styles.swatches} role="radiogroup" aria-label="Account">
          {MODES.map((m) => (
            <button key={m} type="button" role="radio" aria-checked={m === mode} className={styles.swatch} {...pick(m)}>
              {m === mode && <motion.span layoutId="mode-swatch-ring" className={styles.swatchRing} transition={RING_SPRING} aria-hidden />}
              {TABS[m].label}
            </button>
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}

const HEADINGS: Record<Mode, string> = { personal: 'Personal flows', business: 'Business flows' };

/** In place of the flows' first heading: the two sets of flows as tabs on its rule, the chosen one underlined. */
function HeadingTabs({ mode, pick, action }: { mode: Mode; pick: Pick; action?: ReactNode }) {
  return (
    <LayoutGroup id="mode-heading">
      <div className={styles.heading}>
        <div className={styles.headingTabs} role="tablist" aria-label="Personal or business flows">
          {MODES.map((m) => {
            const { Icon, color } = TABS[m];
            return (
              <button key={m} type="button" role="tab" aria-selected={m === mode} className={styles.headingTab} {...pick(m)}>
                <span className={styles.headingIcon} style={{ color }}>
                  <Icon size={16} />
                </span>
                {HEADINGS[m]}
                {m === mode && <motion.span layoutId="mode-underline" className={styles.underline} transition={motionTransition(undefined, 0.22)} aria-hidden />}
              </button>
            );
          })}
        </div>
        <span className={styles.headingRule} />
        {action}
      </div>
    </LayoutGroup>
  );
}

/** A segmented pill: the agents' surface split in two, the chosen half raised. */
function Segmented({ mode, pick }: { mode: Mode; pick: Pick }) {
  return (
    <LayoutGroup id="mode-segmented">
      <div className={styles.segmented} role="tablist" aria-label="Personal or business">
        {MODES.map((m) => (
          <button key={m} type="button" role="tab" aria-selected={m === mode} className={styles.segment} {...pick(m)}>
            {m === mode && <motion.span layoutId="mode-raised" className={styles.raised} transition={motionTransition(undefined, 0.2)} aria-hidden />}
            <span className={styles.content}>
              <Label m={m} />
            </span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}
