'use client';

import type { ReactNode } from 'react';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { WalletListCard } from './WalletListCard';
import type { WalletListItemData } from './WalletListItem';
import styles from './WalletListSection.module.scss';

interface WalletListSectionProps {
  title: string;
  emptyTitle: string;
  emptySub: ReactNode;
  /** Optional empty-state CTA (wallet Activity uses "Add money"). */
  cta?: { label: string; onClick?: () => void };
  /** Hug the phone bezel with concentric bottom corners (wallet home). */
  concentricBottom?: boolean;
  /** Real rows; when present the card renders them instead of the empty state. */
  items?: WalletListItemData[];
}

/**
 * Title + elevated empty-state list. Shared by the wallet "Activity" (Figma
 * 84:12452) and card-home "Transactions" (Figma 2143:40926) sections.
 */
export function WalletListSection({
  title,
  emptyTitle,
  emptySub,
  cta,
  concentricBottom = false,
  items,
}: WalletListSectionProps) {
  return (
    <section className={styles.section} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      <WalletListCard
        concentricBottom={concentricBottom}
        items={items}
        emptyTitle={emptyTitle}
        emptySub={emptySub}
        cta={
          cta ? (
            <ContentAreaButton
              className={styles.cta}
              type="button"
              variant="filled"
              onClick={cta.onClick}
            >
              {cta.label}
            </ContentAreaButton>
          ) : undefined
        }
      />
    </section>
  );
}
