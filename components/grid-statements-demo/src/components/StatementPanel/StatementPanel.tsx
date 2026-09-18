'use client';

import { AppShell } from '@/apps/shared/AppShell';
import { SampleSwatches } from '@/components/DesignControls/DesignControls';
import { MailScreen } from '@/components/MailScreen/MailScreen';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import type { StatementDevice, StatementModel } from '@/statement/types';
import styles from './StatementPanel.module.scss';

interface StatementPanelProps {
  statement: StatementModel;
  device: StatementDevice;
  onDeviceChange: (device: StatementDevice) => void;
  onPrint: () => void;
}

export function StatementPanel({
  statement,
  device,
  onDeviceChange,
  onPrint,
}: StatementPanelProps) {
  return (
    <section className={styles.panel}>
      <PanelHeader
        icon={
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
            <path
              d="M6 3h9l3 3v15H6V3Zm9 0v4h3M9 11h6M9 15h6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        title="Statement preview"
        actions={
          <div className={styles.actions}>
            <SampleSwatches
              label="Device"
              value={device}
              options={[
                { id: 'mail', label: 'iPhone' },
                { id: 'duo', label: 'iPhone Duo' },
              ]}
              onChange={onDeviceChange}
            />
            <button className={styles.download} type="button" onClick={onPrint}>
              Download PDF
            </button>
          </div>
        }
      />
      <div className={styles.stage}>
        <AppShell device={device}>
          <MailScreen statement={statement} />
        </AppShell>
      </div>
    </section>
  );
}
