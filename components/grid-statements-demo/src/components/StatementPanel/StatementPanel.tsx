'use client';

import { useRef, useState } from 'react';
import { AppShell, type AppShellDevice } from '@/apps/shared/AppShell';
import { SampleSwatches } from '@/components/DesignControls/DesignControls';
import { MailScreen } from '@/components/MailScreen/MailScreen';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { StatementDocument } from '@/components/StatementDocument';
import { pressable } from '@/lib/sounds';
import { brandContrast } from '@/statement/brand';
import {
  buildStatementHtml,
  downloadHtml,
  statementExportFilename,
} from '@/statement/export';
import type { StatementModel } from '@/statement/types';
import styles from './StatementPanel.module.scss';

interface StatementPanelProps {
  statement: StatementModel;
  device: AppShellDevice;
  onDeviceChange: (device: AppShellDevice) => void;
  onPrint: () => void;
}

export function StatementPanel({
  statement,
  device,
  onDeviceChange,
  onPrint,
}: StatementPanelProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [exportError, setExportError] = useState('');
  const exportDocumentRef = useRef<HTMLElement>(null);
  const contrast = brandContrast(statement.brand.colors);
  const exportAllowed = contrast.primaryPasses && contrast.secondaryPasses;
  const exportHtml = async () => {
    if (!exportDocumentRef.current) return;
    try {
      setExportError('');
      const filename = statementExportFilename(statement, 'html');
      const html = await buildStatementHtml(exportDocumentRef.current, filename);
      downloadHtml(html, filename);
      setExportOpen(false);
    } catch {
      setExportError('HTML export failed. Try again.');
    }
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
                { id: 'iphone', label: 'iPhone' },
                { id: 'duo', label: 'iPhone Duo' },
              ]}
              onChange={onDeviceChange}
            />
            <button
              className={styles.download}
              type="button"
              disabled={!exportAllowed}
              title={
                exportAllowed
                  ? undefined
                  : 'Fix the statement color contrast before you export.'
              }
              aria-expanded={exportOpen}
              aria-controls="statement-export-preview"
              {...pressable({
                onClick: () => {
                  setExportError('');
                  setExportOpen((current) => !current);
                },
              })}
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
          {exportError ? (
            <span className={styles.exportError} role="alert">
              {exportError}
            </span>
          ) : null}
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
