'use client';

import { useLayoutEffect } from 'react';
import { AppPanel } from '@/components/AppPanel/AppPanel';
import { ApiPanel } from '@/components/ApiPanel/ApiPanel';
import { ColumnResizeHandle } from '@/components/ColumnResizeHandle/ColumnResizeHandle';
import { ThemeSync } from '@/components/ThemeSync';
import { useColumnResize } from '@/hooks/useColumnResize';
import { useWalletDemoLogic } from '@/hooks/useWalletDemoLogic';
import { LAYOUT_WIDE_PX } from '@/lib/layout';
import styles from './page.module.scss';

export default function Page() {
  const logic = useWalletDemoLogic();
  const { layoutRef, apiColRef, apiWidth, resizing, onResizeStart } = useColumnResize();

  // Stacked ⇄ wide as a data-layout attribute on <html> so the arrangement,
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

  return (
    <main ref={layoutRef} className={styles.layout}>
      <ThemeSync />
      <div className={styles.stackCol}>
        <div className={styles.appCol}>
          <AppPanel
            persona={logic.persona}
            method={logic.method}
            methods={logic.methods}
            wallet={logic.wallet}
            phone={logic.phone}
            running={logic.running}
            handleAction={logic.handleAction}
            signInWithMethod={logic.signInWithMethod}
            signInMethod={logic.signInMethod}
            passkeyActive={logic.passkeyActive}
            confirmPasskey={logic.confirmPasskey}
            cancelPasskey={logic.cancelPasskey}
            faceIdActive={logic.faceIdActive}
            finishFaceId={logic.finishFaceId}
            otpActive={logic.otpActive}
            submitOtp={logic.submitOtp}
            cancelOtp={logic.cancelOtp}
            backOtp={logic.backOtp}
            emailActive={logic.emailActive}
            submitEmail={logic.submitEmail}
            cancelEmail={logic.cancelEmail}
            phoneActive={logic.phoneActive}
            submitPhone={logic.submitPhone}
            cancelPhone={logic.cancelPhone}
            gNonce={logic.gNonce}
            submitGoogle={logic.submitGoogle}
            aNonce={logic.aNonce}
            submitApple={logic.submitApple}
            popupWait={logic.popupWait}
            walletEntry={logic.walletEntry}
            skipIntro={logic.skipIntro}
            onQuoteCreate={logic.onQuoteCreate}
            onLinkExternalAccount={logic.onLinkExternalAccount}
            onTransferExecute={logic.onTransferExecute}
            onCardIssued={logic.onCardIssued}
            onTapToPay={logic.onTapToPay}
            onReceivePayment={logic.onReceivePayment}
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
    </main>
  );
}
