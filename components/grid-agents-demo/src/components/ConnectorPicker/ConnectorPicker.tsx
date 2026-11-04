'use client';

import clsx from 'clsx';
import { LayoutGroup, motion } from 'motion/react';
import { CONNECTORS, type ConnectorDef, type ConnectorId } from '@/data/connectors';
import { motionTransition } from '@/lib/easing';
import { pressable } from '@/lib/sounds';
import styles from './ConnectorPicker.module.scss';

interface ConnectorPickerProps {
  selected: ConnectorId;
  /** A flow is playing: the agent can't change under it. */
  running: boolean;
  onSelect: (id: ConnectorId) => void;
}

function Logo({ logo }: { logo: ConnectorDef['logo'] }) {
  const { mark } = logo;
  return (
    <span className={styles.logo} data-circle={logo.circle || undefined} style={{ background: logo.background }}>
      <img
        src={logo.src}
        alt=""
        className={styles.mark}
        data-round={mark.round || undefined}
        style={{ left: mark.left, top: mark.top, width: mark.width, height: mark.height }}
        draggable={false}
      />
    </span>
  );
}

/** Select connector: the agent app the visitor gives an account to (Figma 124:3873). */
export function ConnectorPicker({ selected, running, onSelect }: ConnectorPickerProps) {
  return (
    <LayoutGroup>
      <div className={styles.group}>
        {CONNECTORS.map((c) => {
          const isSelected = selected === c.id;
          const enabled = !running || isSelected;
          return (
            <button
              key={c.id}
              type="button"
              className={clsx(styles.card, isSelected && styles.cardSelected)}
              disabled={!enabled}
              aria-pressed={isSelected}
              {...pressable({ onClick: () => enabled && onSelect(c.id), disabled: !enabled })}
            >
              {isSelected ? (
                <motion.span
                  layoutId="connector-active-ring"
                  className={styles.activeRing}
                  transition={motionTransition(undefined, 0.22)}
                  aria-hidden
                />
              ) : null}
              <span className={styles.content}>
                <Logo logo={c.logo} />
                <span className={styles.label}>{c.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
