'use client';

import clsx from 'clsx';
import { motion } from 'motion/react';
import { TextMorph } from 'torph/react';
import { programNameOf, useBrand } from '@/apps/shared/brand/BrandContext';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { cubicBezierCss, easeOutSwift } from '@/lib/easing';
import { CardMaterial } from './CardMaterial';
import { Chip } from './Chip';
import { VisaFoil } from './VisaFoil';
import styles from './DebitCard.module.scss';

const LABEL_MORPH_MS = 280;

interface DebitCardProps {
  /** ACTIVE: the masked number shows. While PROCESSING it stays blurred out. */
  issued?: boolean;
  /** POST /cards is in flight — "Processing" chip. */
  issuing?: boolean;
  /** Card state visuals (card hub). */
  frozen?: boolean;
  closed?: boolean;
  inWallet?: boolean;
  /** A purchase just bounced — shake the card. */
  declined?: boolean;
}

/** The card face — wears the design (color, finish, logo, name) from the
 *  Design section. Figma 2143:36184 proportions, 13px continuous corners. */
export function DebitCard({
  issued = false,
  issuing = false,
  frozen = false,
  closed = false,
  inWallet = false,
  declined = false,
}: DebitCardProps) {
  const design = useBrand();
  const cardClip = useSquircleClip<HTMLDivElement>({
    radiusVar: '--corner-radius-debit-card-squircle',
  });
  const programName = programNameOf(design);

  const chip = closed
    ? 'Closed'
    : frozen
      ? 'Frozen'
      : issuing
        ? 'Processing'
        : inWallet
          ? 'In Apple Wallet'
          : null;

  return (
    <motion.div
      className={styles.cardShell}
      initial={false}
      animate={declined ? { x: [0, -10, 9, -6, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div
        ref={cardClip.ref}
        style={cardClip.style}
        className={clsx(styles.card, frozen && styles.cardFrozen, closed && styles.cardClosed)}
        role="img"
        aria-label={`${programName} card`}
      >
        <CardMaterial finish={design.finish} side="front" className={styles.material} />
        <div className={styles.top}>
          <TextMorph
            as="span"
            className={styles.primary}
            duration={LABEL_MORPH_MS}
            ease={cubicBezierCss(easeOutSwift)}
          >
            {programName}
          </TextMorph>
          {design.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.logo} src={design.logoUrl} alt="" aria-hidden draggable={false} />
          ) : (
            <span className={styles.secondary}>VIRTUAL</span>
          )}
        </div>
        <Chip />
        <div className={styles.bottom}>
          <span
            className={clsx(styles.primary, styles.cardNumber, !issued && styles.cardNumberHidden)}
          >
            •••• 8972
          </span>
        </div>
        <VisaFoil />
        {/* Frost creeps in over the face when the card is frozen. */}
        <span className={clsx(styles.frost, frozen && styles.frostOn)} aria-hidden />
        {chip && (
          <span
            className={clsx(
              styles.stateChip,
              closed && styles.stateChipClosed,
              issuing && styles.stateChipProcessing,
            )}
          >
            {chip}
          </span>
        )}
      </div>
    </motion.div>
  );
}
