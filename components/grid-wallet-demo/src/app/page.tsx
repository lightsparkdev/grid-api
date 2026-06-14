'use client';

import { ConfigurePanel } from '@/components/ConfigurePanel/ConfigurePanel';
import { AppPanel } from '@/components/AppPanel/AppPanel';
import { ApiPanel } from '@/components/ApiPanel/ApiPanel';
import { ColumnResizeHandle } from '@/components/ColumnResizeHandle/ColumnResizeHandle';
import { ThemeSync } from '@/components/ThemeSync';
import { useColumnResize } from '@/hooks/useColumnResize';
import { useWalletDemoLogic } from '@/hooks/useWalletDemoLogic';
import styles from './page.module.scss';

export default function Page() {
  const logic = useWalletDemoLogic();
  const { layoutRef, apiColRef, apiWidth, onResizeStart } = useColumnResize();

  return (
    <main ref={layoutRef} className={styles.layout}>
      <ThemeSync />
      <ConfigurePanel
        useCase={logic.useCase}
        setUseCase={logic.setUseCase}
        methods={logic.methods}
        onToggleMethod={logic.toggleMethod}
        wallet={logic.wallet}
        running={logic.running}
        onAction={logic.handleAction}
        onReset={logic.reset}
      />
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
            onTransferExecute={logic.onTransferExecute}
            onCardIssued={logic.onCardIssued}
            onTapToPay={logic.onTapToPay}
          />
        </div>
        <ColumnResizeHandle onMouseDown={onResizeStart} />
        <div
          ref={apiColRef}
          className={styles.apiCol}
          style={{ width: apiWidth, flex: '0 0 auto' }}
        >
          <ApiPanel entries={logic.entries} />
        </div>
      </div>
    </main>
  );
}
