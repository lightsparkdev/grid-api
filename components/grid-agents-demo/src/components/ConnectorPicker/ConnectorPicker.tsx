'use client';

import clsx from 'clsx';
import { LayoutGroup, motion } from 'motion/react';
import { CONNECTORS, type ConnectorDef, type ConnectorId } from '@/data/connectors';
import { motionTransition } from '@/lib/easing';
import { pressable } from '@/lib/sounds';
import styles from './ConnectorPicker.module.scss';

interface ConnectorPickerProps {
  selected: ConnectorId;
  onSelect: (id: ConnectorId) => void;
}

function Logo({ logo }: { logo: ConnectorDef['logo'] }) {
  return (
    <span className={styles.logo} data-glyph={logo.glyph || undefined}>
      <img src={logo.src} alt="" className={styles.mark} draggable={false} />
    </span>
  );
}

/** Select agent: the agent app on the phone (Figma 124:3873). Switching
 *  mid-flow is fine: the conversation carries on in the next app's look. */
export function ConnectorPicker({ selected, onSelect }: ConnectorPickerProps) {
  return (
    <LayoutGroup>
      <div className={styles.group}>
        {CONNECTORS.map((c) => {
          const isSelected = selected === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className={clsx(styles.card, isSelected && styles.cardSelected)}
              aria-pressed={isSelected}
              {...pressable({ onClick: () => onSelect(c.id) })}
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
