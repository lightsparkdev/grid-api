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
  const { layoutRef, appColRef, appWidth, onResizeStart } = useColumnResize();

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
      <div
        ref={appColRef}
        className={styles.appCol}
        style={appWidth != null ? { width: appWidth, flex: '0 0 auto' } : undefined}
      >
        <AppPanel />
      </div>
      <ColumnResizeHandle onMouseDown={onResizeStart} />
      <div className={styles.apiCol}>
        <ApiPanel entries={logic.entries} />
      </div>
    </main>
  );
}
