'use client';

import { DotGridCanvas } from '@/components/DotGridCanvas/DotGridCanvas';
import type { PhoneProps } from '@/components/Phone';
import { DemoPhone } from '@/components/DemoPhone/DemoPhone';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { DEFAULT_OVERLAY_GLASS } from '@/apps/shared/glass';
import styles from './AppPanel.module.scss';

export function AppPanel(phone: PhoneProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.body}>
        <div className={styles.phoneStage}>
          <DotGridCanvas glassConfig={PHONE_SHELL_GLASS}>
            <DemoPhone
              {...phone}
              glassConfig={PHONE_SHELL_GLASS}
              overlayGlass={DEFAULT_OVERLAY_GLASS}
              glassDemoBg
              externalGlass
            />
          </DotGridCanvas>
        </div>
      </div>
    </section>
  );
}
