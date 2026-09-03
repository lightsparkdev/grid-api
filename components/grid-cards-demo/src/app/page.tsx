'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconArrowRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRight';
import { IconArrowLeft } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowLeft';
import { ConfigurePanel } from '@/components/ConfigurePanel/ConfigurePanel';
import { AppPanel } from '@/components/AppPanel/AppPanel';
import { ApiPanel } from '@/components/ApiPanel/ApiPanel';
import { ColumnResizeHandle } from '@/components/ColumnResizeHandle/ColumnResizeHandle';
import { ThemeSync } from '@/components/ThemeSync';
import { useColumnResize } from '@/hooks/useColumnResize';
import { useCardsDemoLogic } from '@/hooks/useCardsDemoLogic';
import { LAYOUT_WIDE_PX } from '@/lib/layout';
import type { ActionId } from '@/data/actions';
import styles from './page.module.scss';

type MobileView = 'configure' | 'playground';

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

// Run a view swap through the View Transitions API when available (clean
// cross-fade), else just apply it.
function withViewTransition(update: () => void) {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(
      update,
    );
  } else {
    update();
  }
}

export default function Page() {
  const logic = useCardsDemoLogic();
  const { layoutRef, apiColRef, apiWidth, resizing, onResizeStart } = useColumnResize();

  // Stacked ⇄ 3-col as a data-layout attribute on <html> so the arrangement,
  // the panel chrome colors, and the API header all flip on one clock. The
  // inline script in layout.tsx sets it BEFORE first paint (an effect here
  // would flash the SSR wide default on stacked viewports while JS loads);
  // this listener only keeps it live across resizes.
  useLayoutEffect(() => {
    const mql = window.matchMedia(`(max-width: ${LAYOUT_WIDE_PX - 1}px)`);
    const apply = () =>
      document.documentElement.setAttribute('data-layout', mql.matches ? 'stacked' : 'wide');
    apply();
    mql.addEventListener('change', apply);
    return () => mql.removeEventListener('change', apply);
  }, []);

  // Mobile only (<=767): the layout collapses to one view at a time. On desktop
  // this stays 'configure' forever (the switch is gated to the mobile viewport),
  // so the attribute + handlers are inert there.
  const [mobileView, setMobileView] = useState<MobileView>('configure');
  const stackColRef = useRef<HTMLDivElement>(null);

  const goPlayground = useCallback(() => {
    if (!isMobileViewport()) return;
    withViewTransition(() => setMobileView('playground'));
  }, []);

  const goConfigure = useCallback(() => {
    withViewTransition(() => setMobileView('configure'));
  }, []);

  // Tapping a flow in Configure runs it and jumps to the Playground (mobile);
  // on desktop goPlayground no-ops, so it behaves exactly as before.
  const onConfigureAction = useCallback(
    (id: ActionId) => {
      goPlayground();
      logic.handleAction(id);
    },
    [goPlayground, logic],
  );

  // Floating back pill hides on scroll-down, shows on scroll-up (Playground only).
  // The Playground scrolls inside stackCol, so we watch that, not the window.
  const [showBackPill, setShowBackPill] = useState(true);
  const lastScrollY = useRef(0);
  useEffect(() => {
    if (mobileView !== 'playground') return;
    const el = stackColRef.current;
    if (!el) return;
    el.scrollTop = 0;
    lastScrollY.current = 0;
    setShowBackPill(true);
    const onScroll = () => {
      const y = el.scrollTop;
      setShowBackPill(y < lastScrollY.current || y < 52);
      lastScrollY.current = y;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [mobileView]);

  // Browser/system back returns to Configure from the Playground.
  useEffect(() => {
    if (mobileView !== 'playground') return;
    history.pushState({ mobileView: 'playground' }, '');
    const onPop = () => {
      setMobileView('configure');
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [mobileView]);

  return (
    <main
      ref={layoutRef}
      className={styles.layout}
      data-mobile-view={mobileView}
    >
      <ThemeSync />
      <div className={styles.configCol}>
        <ConfigurePanel
          design={logic.design}
          onDesignChange={logic.updateDesign}
          wallet={logic.wallet}
          onAction={onConfigureAction}
          onReset={logic.reset}
        />
      </div>
      <div ref={stackColRef} className={styles.stackCol}>
        <div className={styles.appCol}>
          <AppPanel
            activeFlow={logic.activeFlow}
            onIssue={() => logic.handleAction('card')}
            design={logic.design}
            session={logic.session}
            walletEntry={logic.walletEntry}
            onCardIssued={logic.onCardIssued}
            onTapToPay={logic.onTapToPay}
            onTapDeclined={logic.onTapDeclined}
            cardOptions={logic.cardOptions}
            onSettled={logic.onSettled}
          />
        </div>
        <ColumnResizeHandle onMouseDown={onResizeStart} />
        <div
          ref={apiColRef}
          className={styles.apiCol}
          data-resizing={resizing || undefined}
          // No inline width until the post-hydration measure — the stylesheet's
          // var(--api-col-default) (seeded pre-paint from the embed's ?nav
          // param) styles the column so the first paint is already correct.
          style={{ width: apiWidth ?? undefined }}
        >
          <ApiPanel entries={logic.entries} />
        </div>
      </div>

      {/* Mobile-only controls (hidden on desktop via CSS). */}
      {/* Progressive blur tray behind the sticky CTA (configure view). */}
      <div className={styles.exploreFade} aria-hidden>
        <div className={clsx(styles.fadeBlur, styles.fadeBlurStrong)} />
        <div className={clsx(styles.fadeBlur, styles.fadeBlurMid)} />
        <div className={clsx(styles.fadeBlur, styles.fadeBlurSoft)} />
        <div className={styles.fadeTint} />
      </div>
      <button type="button" className={styles.exploreBtn} onClick={goPlayground}>
        Explore playground
        <IconArrowRight size={16} />
      </button>
      <button
        type="button"
        className={clsx(styles.backPill, !showBackPill && styles.backPillHidden)}
        onClick={goConfigure}
      >
        <IconArrowLeft size={16} />
        Configure
      </button>
    </main>
  );
}
