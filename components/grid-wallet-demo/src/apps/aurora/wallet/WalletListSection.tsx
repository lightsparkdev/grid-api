'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { WalletListCard } from './WalletListCard';
import type { WalletListItemData } from './WalletListItem';
import styles from './WalletListSection.module.scss';

interface WalletListSectionProps {
  /** Section name — the visible caption, and the aria-label either way. */
  title: string;
  /** Drop the visible caption (send contacts) — the aria-label remains. */
  hideTitle?: boolean;
  emptyTitle: string;
  emptySub: ReactNode;
  /** Optional empty-state CTA (wallet Activity uses "Add money"). */
  cta?: { label: string; onClick?: () => void };
  /** Hug the phone bezel with concentric bottom corners (wallet home). */
  concentricBottom?: boolean;
  /** Real rows; when present the card renders them instead of the empty state. */
  items?: WalletListItemData[];
  /** Grow with content past the available height (the page scrolls) instead of
   *  fill + clip inside the card. */
  grow?: boolean;
  /** Round (vs squircle) skeleton avatar placeholder — the send recipient list. */
  roundGraphic?: boolean;
  /** Render each row as its own filled card instead of one shared container. */
  itemCards?: boolean;
}

/**
 * Title + elevated empty-state list. Shared by the wallet "Activity" (Figma
 * 84:12452) and card-home "Transactions" (Figma 2143:40926) sections.
 */
export function WalletListSection({
  title,
  hideTitle = false,
  emptyTitle,
  emptySub,
  cta,
  concentricBottom = false,
  items,
  grow = false,
  roundGraphic = false,
  itemCards = false,
}: WalletListSectionProps) {
  return (
    <section className={clsx(styles.section, grow && styles.sectionGrow)} aria-label={title}>
      {!hideTitle && <h2 className={styles.title}>{title}</h2>}
      <WalletListCard
        concentricBottom={concentricBottom}
        grow={grow}
        roundGraphic={roundGraphic}
        itemCards={itemCards}
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
