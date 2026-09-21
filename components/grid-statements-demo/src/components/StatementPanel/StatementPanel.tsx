'use client';

import { useEffect, useRef, useState } from 'react';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { ShareSheet } from '@/components/ShareSheet/ShareSheet';
import { StageShareButton } from '@/components/ShareSheet/StageShareButton';
import { StatementDocument } from '@/components/StatementDocument';
import { StatementPreview } from '@/components/StatementPreview/StatementPreview';
import { DeviceToggle } from '@/components/DeviceToggle/DeviceToggle';
import { brandContrast } from '@/statement/brand';
import {
  buildStatementHtml,
  downloadHtml,
  printStatementHtml,
  statementExportFilename,
} from '@/statement/export';
import type { StatementPreview as StatementPreviewState } from '@/statement/lifecycle';
import type { PreviewMode } from '@/statement/lifecycle';
import type { StatementModel } from '@/statement/types';
import styles from './StatementPanel.module.scss';

interface StatementPanelProps {
  statement: StatementModel;
  preview: StatementPreviewState;
  onCopyLink: () => void;
  onPreviewModeChange: (mode: PreviewMode) => void;
}

export function StatementPanel({
  statement,
  preview,
  onCopyLink,
  onPreviewModeChange,
}: StatementPanelProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
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
      setShareOpen(false);
    } catch {
      setExportError('HTML export failed. Try again.');
    }
  };
  const exportPdf = async () => {
    if (!exportDocumentRef.current) return;
    try {
      setExportError('');
      await printStatementHtml(
        exportDocumentRef.current,
        statementExportFilename(statement, 'pdf').replace(/\.pdf$/i, ''),
      );
      setShareOpen(false);
    } catch {
      setExportError('PDF export failed. Try again.');
    }
  };

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (preview.phase === 'loading') setShareOpen(false);
  }, [preview.phase]);

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
      />
      <div className={styles.stage}>
        <DeviceToggle value={preview.mode} onChange={onPreviewModeChange} />
        {mounted ? (
          <StatementPreview
            mode={preview.mode}
            phase={preview.phase}
            statement={statement}
          />
        ) : null}
        <ShareSheet
          open={shareOpen}
          statement={statement}
          previewMode={preview.mode}
          onClose={() => setShareOpen(false)}
          onCopyLink={onCopyLink}
          onSavePdf={exportPdf}
          onSaveHtml={exportHtml}
        />
        {mounted ? (
          <StageShareButton
            visible={preview.phase === 'ready' && exportAllowed}
            open={shareOpen}
            onClick={() => {
              setExportError('');
              setShareOpen((current) => !current);
            }}
          />
        ) : null}
        {exportError ? (
          <span className={styles.exportError} role="alert">
            {exportError}
          </span>
        ) : null}
      </div>
      <div className={styles.exportSource} aria-hidden>
        <StatementDocument
          ref={exportDocumentRef}
          statement={statement}
          width="full"
          showMasthead
        />
      </div>
    </section>
  );
}
