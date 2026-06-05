'use client';

import { ConfigurePanel } from '@/components/ConfigurePanel/ConfigurePanel';
import { AppPanel } from '@/components/AppPanel/AppPanel';
import { ApiPanel } from '@/components/ApiPanel/ApiPanel';
import { ThemeSync } from '@/components/ThemeSync';
import { useWalletDemoLogic } from '@/hooks/useWalletDemoLogic';
import styles from './page.module.scss';

export default function Page() {
  // Preserved for phase 2 — reconnect to Configure / App / API panels.
  useWalletDemoLogic();

  return (
    <main className={styles.layout}>
      <ThemeSync />
      <ConfigurePanel />
      <AppPanel />
      <ApiPanel />
    </main>
  );
}
