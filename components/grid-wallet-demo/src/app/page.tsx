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
        persona={logic.persona}
        setPersona={logic.setPersona}
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
            wallet={logic.wallet}
            phone={logic.phone}
            running={logic.running}
            handleAction={logic.handleAction}
            signInWithMethod={logic.signInWithMethod}
            signInMethod={logic.signInMethod}
            otpActive={logic.otpActive}
            submitOtp={logic.submitOtp}
            emailActive={logic.emailActive}
            submitEmail={logic.submitEmail}
            gNonce={logic.gNonce}
            submitGoogle={logic.submitGoogle}
            amountConfig={logic.amountConfig}
            submitAmount={logic.submitAmount}
            cancelAmount={logic.cancelAmount}
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
