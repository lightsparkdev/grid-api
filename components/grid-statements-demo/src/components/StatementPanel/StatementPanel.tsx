'use client';

import { useRef, useState } from 'react';
import { AppShell } from '@/apps/shared/AppShell';
import { SampleSwatches } from '@/components/DesignControls/DesignControls';
import { MailScreen } from '@/components/MailScreen/MailScreen';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { StatementDocument } from '@/components/StatementDocument';
import { pressable } from '@/lib/sounds';
import {
  buildStatementHtml,
  downloadHtml,
  statementExportFilename,
} from '@/statement/export';
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
  const [exportOpen, setExportOpen] = useState(false);
  const exportDocumentRef = useRef<HTMLElement>(null);
  const exportHtml = async () => {
    if (!exportDocumentRef.current) return;
    const filename = statementExportFilename(statement, 'html');
    const html = await buildStatementHtml(exportDocumentRef.current, filename);
    downloadHtml(html, filename);
    setExportOpen(false);
  };

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
            <button
              className={styles.download}
              type="button"
              aria-expanded={exportOpen}
              aria-controls="statement-export-preview"
              {...pressable({ onClick: () => setExportOpen((current) => !current) })}
            >
              Export
            </button>
          </div>
        }
      />
      {exportOpen ? (
        <section
          id="statement-export-preview"
          className={styles.exportPreview}
          aria-label="Export statement"
        >
          <span className={styles.exportIcon} aria-hidden>
            ↓
          </span>
          <strong>Export statement</strong>
          <span className={styles.exportDescription}>
            Save the current statement.
          </span>
          <div className={styles.exportActions}>
            <button
              type="button"
              {...pressable({
                onClick: () => {
                  setExportOpen(false);
                  onPrint();
                },
              })}
            >
              PDF
            </button>
            <button type="button" {...pressable({ onClick: exportHtml })}>
              HTML
            </button>
          </div>
        </section>
      ) : null}
      <div className={styles.stage}>
        <AppShell device={device}>
          <MailScreen statement={statement} />
        </AppShell>
      </div>
      <div className={styles.exportSource} aria-hidden>
        <StatementDocument
          ref={exportDocumentRef}
          statement={statement}
          width="full"
        />
      </div>
    </section>
  );
}
