'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { StatementDocument } from '@/components/StatementDocument';
import {
  DEFAULT_BRAND,
  PERIODS,
  REQUIREMENTS,
  buildStatement,
  calculateTotals,
  statementFilename,
} from '@/statement/fixtures';
import type {
  PreviewWidth,
  StatementBrand,
  StatementVariant,
} from '@/statement/types';

const svgLogo = (label: string, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 24"><rect width="24" height="24" rx="4" fill="${color}"/><path d="M7 17 12 6l5 11h-3l-2-5-2 5H7Z" fill="white"/><text x="32" y="17" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="${color}">${label}</text></svg>`,
  )}`;

const PRESETS = [
  { name: 'Northstar', logo: svgLogo('Northstar', '#1d4ed8') },
  { name: 'Meridian', logo: svgLogo('Meridian', '#0f766e') },
  { name: 'Relay', logo: svgLogo('Relay', '#7c3aed') },
] as const;

type MobilePanel = 'configure' | 'statement' | 'source';
type EvidenceTab = 'source' | 'coverage';

export default function Page() {
  const [variant, setVariant] = useState<StatementVariant>('consumer');
  const [periodId, setPeriodId] = useState(PERIODS[0].id);
  const [brand, setBrand] = useState<StatementBrand>(DEFAULT_BRAND);
  const [width, setWidth] = useState<PreviewWidth>('full');
  const [evidenceTab, setEvidenceTab] = useState<EvidenceTab>('coverage');
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('configure');
  const [sourceWidth, setSourceWidth] = useState(440);
  const [uploadError, setUploadError] = useState('');
  const uploadedUrl = useRef<string | null>(null);
  const resizeState = useRef<{ startX: number; startWidth: number } | null>(null);
  const period = PERIODS.find((candidate) => candidate.id === periodId) ?? PERIODS[0];
  const statement = useMemo(() => buildStatement(variant, brand, period), [brand, period, variant]);
  const totals = calculateTotals(statement);
  const sourceData = {
    ...statement,
    brand: {
      ...statement.brand,
      logo:
        statement.brand.logo.kind === 'image'
          ? { kind: 'image', src: '[selected image]' }
          : statement.brand.logo,
    },
  };

  useEffect(() => {
    const parentOrigin = document.referrer ? new URL(document.referrer).origin : '*';
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      if (event.data?.type === 'theme-sync') {
        document.documentElement.dataset.theme = event.data.theme === 'dark' ? 'dark' : 'light';
      }
      if (event.data?.type === 'nav-sync' && typeof event.data.sidebarWidth === 'number') {
        document.documentElement.dataset.nav =
          event.data.sidebarWidth <= 160 ? 'collapsed' : 'expanded';
      }
    };
    window.addEventListener('message', onMessage);
    window.parent?.postMessage({ type: 'theme-request' }, parentOrigin);
    window.parent?.postMessage({ type: 'nav-request' }, parentOrigin);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(
    () => () => {
      if (uploadedUrl.current) URL.revokeObjectURL(uploadedUrl.current);
    },
    [],
  );

  const selectPreset = (preset: (typeof PRESETS)[number]) => {
    clearUploadedUrl();
    setBrand({
      companyName: preset.name,
      logo: { kind: 'image', src: preset.logo, alt: `${preset.name} logo` },
    });
    setUploadError('');
  };

  const uploadLogo = (file: File | undefined) => {
    if (!file) return;
    if (!['image/svg+xml', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Use an SVG, PNG, or WebP file.');
      return;
    }
    if (file.size > 2_000_000) {
      setUploadError('Use a logo smaller than 2 MB.');
      return;
    }
    clearUploadedUrl();
    const url = URL.createObjectURL(file);
    uploadedUrl.current = url;
    setBrand((current) => ({
      ...current,
      logo: { kind: 'image', src: url, alt: `${current.companyName || 'Company'} logo` },
    }));
    setUploadError('');
  };

  const clearUploadedUrl = () => {
    if (uploadedUrl.current) {
      URL.revokeObjectURL(uploadedUrl.current);
      uploadedUrl.current = null;
    }
  };

  const printStatement = () => {
    const previousTitle = document.title;
    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    document.title = statementFilename(statement);
    window.addEventListener('afterprint', restoreTitle);
    window.print();
    window.setTimeout(restoreTitle, 1000);
  };

  const resizeBy = (delta: number) => {
    setSourceWidth((current) => Math.max(360, Math.min(720, current + delta)));
  };

  return (
    <main className="workbench" data-mobile-panel={mobilePanel}>
      <nav className="mobile-nav" aria-label="Playground panels">
        {(['configure', 'statement', 'source'] as const).map((panel) => (
          <button
            className={mobilePanel === panel ? 'active' : ''}
            key={panel}
            onClick={() => {
              setMobilePanel(panel);
              if (panel === 'statement' && window.innerWidth <= 767) setWidth('narrow');
            }}
            type="button"
          >
            {panel === 'source' ? 'Mapping' : `${panel[0].toUpperCase()}${panel.slice(1)}`}
          </button>
        ))}
      </nav>

      <aside className="panel configure-panel">
        <PanelHeader eyebrow="Configure" title="Periodic statement" />
        <div className="panel-content">
          <section className="control-group">
            <h2>Brand</h2>
            <div className="presets">
              {PRESETS.map((preset) => (
                <button key={preset.name} type="button" onClick={() => selectPreset(preset)}>
                  <img src={preset.logo} alt="" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
            <label>
              Company name
              <input
                value={brand.companyName}
                onChange={(event) =>
                  setBrand((current) => ({ ...current, companyName: event.target.value }))
                }
              />
            </label>
            <label className="file-control">
              Logo
              <input
                type="file"
                accept="image/svg+xml,image/png,image/webp"
                onChange={(event) => uploadLogo(event.target.files?.[0])}
              />
            </label>
            {brand.logo.kind === 'image' ? (
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  clearUploadedUrl();
                  setBrand((current) => ({ ...current, logo: { kind: 'none' } }));
                }}
              >
                Remove logo
              </button>
            ) : null}
            {uploadError ? <p className="error">{uploadError}</p> : null}
          </section>

          <section className="control-group">
            <h2>Statement</h2>
            <label>
              Variant
              <select
                value={variant}
                onChange={(event) => setVariant(event.target.value as StatementVariant)}
              >
                <option value="consumer">Consumer</option>
                <option value="commercial">Commercial</option>
              </select>
            </label>
            <label>
              Period
              <select value={periodId} onChange={(event) => setPeriodId(event.target.value)}>
                {PERIODS.map((candidate) => (
                  <option value={candidate.id} key={candidate.id}>
                    {candidate.range}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <p className="ownership">
            Grid supplies account activity. Your platform owns statement generation, retention,
            and delivery.
          </p>
          <button
            className="view-statement"
            type="button"
            onClick={() => {
              setWidth('narrow');
              setMobilePanel('statement');
            }}
          >
            View statement
          </button>
        </div>
      </aside>

      <section className="stage">
        <div className="stage-toolbar">
          <div>
            <span className="eyebrow">Document</span>
            <strong>Live statement</strong>
          </div>
          <div className="toolbar-actions">
            <div className="segmented" aria-label="Preview width">
              {(['full', 'narrow'] as const).map((option) => (
                <button
                  className={width === option ? 'active' : ''}
                  key={option}
                  onClick={() => setWidth(option)}
                  type="button"
                >
                  {option === 'full' ? 'Full' : 'Narrow'}
                </button>
              ))}
            </div>
            <button className="primary-button" type="button" onClick={printStatement}>
              Download PDF
            </button>
          </div>
        </div>
        <div className="document-stage">
          <StatementDocument statement={statement} width={width} />
        </div>
      </section>

      <div
        className="resize-handle"
        role="separator"
        aria-label="Resize mapping panel"
        aria-orientation="vertical"
        aria-valuemin={360}
        aria-valuemax={720}
        aria-valuenow={sourceWidth}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') resizeBy(16);
          if (event.key === 'ArrowRight') resizeBy(-16);
        }}
        onPointerDown={(event) => {
          resizeState.current = { startX: event.clientX, startWidth: sourceWidth };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!resizeState.current) return;
          setSourceWidth(
            Math.max(
              360,
              Math.min(
                720,
                resizeState.current.startWidth + resizeState.current.startX - event.clientX,
              ),
            ),
          );
        }}
        onPointerUp={(event) => {
          resizeState.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          resizeState.current = null;
        }}
      />

      <aside className="panel evidence-panel" style={{ width: sourceWidth }}>
        <PanelHeader eyebrow="Source data" title="Requirement mapping" />
        <div className="evidence-tabs" role="tablist">
          <button
            className={evidenceTab === 'coverage' ? 'active' : ''}
            onClick={() => setEvidenceTab('coverage')}
            type="button"
          >
            Coverage
          </button>
          <button
            className={evidenceTab === 'source' ? 'active' : ''}
            onClick={() => setEvidenceTab('source')}
            type="button"
          >
            Source data
          </button>
        </div>
        <div className="panel-content evidence-content">
          {evidenceTab === 'coverage' ? (
            <>
              <p className="panel-note">
                Sample requirement coverage. This is not legal certification.
              </p>
              <div className="coverage-list">
                {REQUIREMENTS.map((requirement) => {
                  const excluded = variant === 'commercial' && requirement.appliesTo === 'consumer';
                  return (
                    <article className={excluded ? 'coverage-row excluded' : 'coverage-row'} key={requirement.id}>
                      <div>
                        <strong>{requirement.requirement}</strong>
                        <span>{excluded ? 'Excluded for commercial' : requirement.renderedAt}</span>
                      </div>
                      <p>{requirement.source}</p>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p className="panel-note">
                Renderer input assembled from sample data. This is not a Grid API response.
              </p>
              <div className="source-summary">
                <SourceRow label="Opening balance" value={statement.openingBalanceCents} />
                <SourceRow label="Closing balance" value={totals.closingBalanceCents} />
                <SourceRow label="Fee total" value={totals.totalFeesCents} />
                <SourceRow label="Transactions" value={statement.transactions.length} />
              </div>
              <pre>{JSON.stringify(sourceData, null, 2)}</pre>
              <section className="gap-note">
                <strong>Public data gaps</strong>
                <p>
                  Grid has no periodic-statement endpoint or webhook. Reg E classification,
                  balance snapshots, and full terminal addresses need platform data.
                </p>
              </section>
            </>
          )}
        </div>
      </aside>
    </main>
  );
}

function PanelHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="panel-header">
      <span className="eyebrow">{eyebrow}</span>
      <strong>{title}</strong>
    </header>
  );
}

function SourceRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value.toLocaleString('en-US')}</strong>
    </div>
  );
}
