'use client';

import { useReducedMotion } from 'motion/react';
import { useCardHome, type UseCardHomeOptions, type WalletEntry } from '@/apps/shared/card';
import { CardScreen } from '@/apps/card';
import styles from './CardHost.module.scss';

export interface CardHostProps {
  /** Jump command handed to the brain so the sidebar can provision + open a flow. */
  entry?: WalletEntry;
  onCardIssued?: () => void;
  onTapToPay?: UseCardHomeOptions['onTapToPay'];
  onTapDeclined?: UseCardHomeOptions['onTapDeclined'];
  cardOptions?: UseCardHomeOptions['card'];
}

/** Hosts the card brain above the face so the view can re-render freely. */
export function CardHost({ entry, onCardIssued, onTapToPay, onTapDeclined, cardOptions }: CardHostProps) {
  const reduceMotion = useReducedMotion();
  const entrance = !reduceMotion;
  const home = useCardHome({ entrance, entry, onCardIssued, onTapToPay, onTapDeclined, card: cardOptions });

  return (
    <div className={styles.flow}>
      <CardScreen entrance={entrance} home={home} />
    </div>
  );
}
