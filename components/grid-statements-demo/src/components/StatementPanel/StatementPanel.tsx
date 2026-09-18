'use client';

import { useEffect, useRef, useState } from 'react';
import { AppShell } from '@/apps/shared/AppShell';
import { ChoiceGrid } from '@/components/ChoiceGrid/ChoiceGrid';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { ShareSheet } from '@/components/ShareSheet/ShareSheet';
import { StageShareButton } from '@/components/ShareSheet/StageShareButton';
import { StatementDocument } from '@/components/StatementDocument';
import { StatementScreen } from '@/components/StatementScreen/StatementScreen';
import { IconPhone } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPhone';
import { IconLayoutWindow } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLayoutWindow';
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
  lifecycle: 'in-progress' | 'statement';
  previewMode: 'mobile' | 'desktop';
  onPreviewModeChange: (mode: 'mobile' | 'desktop') => void;
  onPrint: () => void;
}

export function StatementPanel({
  statement,
  lifecycle,
  previewMode,
  onPreviewModeChange,
  onPrint,
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

  useEffect(() => setMounted(true), []);

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
            <ChoiceGrid
              label="Preview"
              value={previewMode}
              options={[
                { id: 'mobile', label: 'Mobile', Icon: IconPhone },
                { id: 'desktop', label: 'Desktop', Icon: IconLayoutWindow },
              ]}
              onChange={onPreviewModeChange}
            />
          </div>
        }
      />
      <div className={styles.stage}>
        {previewMode === 'mobile' && mounted ? (
          <AppShell externalGlass>
            <StatementScreen statement={statement} lifecycle={lifecycle} />
          </AppShell>
        ) : previewMode === 'desktop' && lifecycle === 'statement' ? (
          <div className={styles.desktopDocument}>
            <StatementDocument statement={statement} width="full" />
          </div>
        ) : previewMode === 'desktop' ? (
          <div className={styles.emptyDocument}>
            <span>Statement arrives Oct 1</span>
          </div>
        ) : null}
        <ShareSheet
          open={shareOpen}
          statement={statement}
          onCopyLink={() => {
            void navigator.clipboard?.writeText(window.location.href);
          }}
          onSavePdf={() => {
            setShareOpen(false);
            onPrint();
          }}
          onSaveHtml={exportHtml}
        />
        <StageShareButton
          visible={lifecycle === 'statement' && exportAllowed}
          open={shareOpen}
          onClick={() => {
            setExportError('');
            setShareOpen((current) => !current);
          }}
        />
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
        />
      </div>
    </section>
  );
}
