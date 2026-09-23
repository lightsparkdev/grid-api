'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconArrowRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRight';
import { IconArrowLeft } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowLeft';
import { ConfigurePanel } from '@/components/ConfigurePanel/ConfigurePanel';
import { StatementPanel } from '@/components/StatementPanel/StatementPanel';
import { ApiPanel } from '@/components/ApiPanel/ApiPanel';
import { ColumnResizeHandle } from '@/components/ColumnResizeHandle/ColumnResizeHandle';
import { ThemeSync } from '@/components/ThemeSync';
import { useColumnResize } from '@/hooks/useColumnResize';
import { LAYOUT_WIDE_PX } from '@/lib/layout';
import { buildApiEntries, type StatementApiEntry } from '@/statement/api';
import {
  INITIAL_STATEMENT_PREVIEW,
  nextStatementPreview,
} from '@/statement/lifecycle';
import {
  DEFAULT_BRAND,
  STATEMENT_PERIOD,
  buildStatement,
} from '@/statement/fixtures';
import {
  PRESETS,
  presetIconSrc,
  type PresetId,
  type StatementPreset,
} from '@/statement/presets';
import {
  parseStatementShareState,
  statementShareUrl,
} from '@/statement/shareState';
import type {
  StatementBrand,
  StatementVariant,
} from '@/statement/types';
import styles from './page.module.scss';

type MobileView = 'configure' | 'playground';

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

function withViewTransition(update: () => void) {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    (document as Document & { startViewTransition: (callback: () => void) => void })
      .startViewTransition(update);
  } else {
    update();
  }
}

export default function Page() {
  const { layoutRef, apiColRef, apiWidth, resizing, onResizeStart } = useColumnResize();
  const [variant, setVariant] = useState<StatementVariant>('consumer');
  const [brand, setBrand] = useState<StatementBrand>(DEFAULT_BRAND);
  const [presetId, setPresetId] = useState<PresetId>(PRESETS[0].id);
  const [preview, updatePreview] = useReducer(
    nextStatementPreview,
    INITIAL_STATEMENT_PREVIEW,
  );
  const [entries, setEntries] = useState<StatementApiEntry[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [mobileView, setMobileView] = useState<MobileView>('configure');
  const uploadedUrl = useRef<string | null>(null);
  const stackColRef = useRef<HTMLDivElement>(null);
  const apiTimers = useRef<number[]>([]);
  const statement = useMemo(
    () => buildStatement(variant, brand, STATEMENT_PERIOD),
    [brand, variant],
  );
  const apiStatement = useMemo(
    () => buildStatement(variant, DEFAULT_BRAND, STATEMENT_PERIOD),
    [variant],
  );
  const stageApiEntries = useCallback((nextStatement: typeof apiStatement) => {
    apiTimers.current.forEach((timer) => window.clearTimeout(timer));
    setEntries([]);
    apiTimers.current = buildApiEntries(nextStatement).map((entry, index) =>
      window.setTimeout(
        () => setEntries((current) => [...current, entry]),
        (index + 1) * 180,
      ),
    );
  }, []);

  useLayoutEffect(() => {
    const media = window.matchMedia(`(max-width: ${LAYOUT_WIDE_PX - 1}px)`);
    const apply = () =>
      document.documentElement.setAttribute('data-layout', media.matches ? 'stacked' : 'wide');
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    apiTimers.current.forEach((timer) => window.clearTimeout(timer));
    setEntries([]);
    const loadId = preview.loadId;
    const timer = window.setTimeout(() => {
      updatePreview({ type: 'load-completed', loadId });
      stageApiEntries(apiStatement);
    }, 500);
    apiTimers.current = [timer];
    return () => {
      apiTimers.current.forEach((pending) => window.clearTimeout(pending));
      apiTimers.current = [];
    };
  }, [apiStatement, preview.loadId, stageApiEntries]);

  useEffect(
    () => () => {
      if (uploadedUrl.current) URL.revokeObjectURL(uploadedUrl.current);
    },
    [],
  );

  const clearUploadedUrl = useCallback(() => {
    if (!uploadedUrl.current) return;
    URL.revokeObjectURL(uploadedUrl.current);
    uploadedUrl.current = null;
  }, []);

  const selectPreset = useCallback(
    (preset: StatementPreset) => {
      clearUploadedUrl();
      setPresetId(preset.id);
      setBrand((current) => ({
        ...current,
        companyName: preset.companyName,
        logo: {
          kind: 'image',
          src: presetIconSrc(preset),
          alt: `${preset.companyName} logo`,
        },
        colors: preset.colors,
      }));
      setUploadError('');
    },
    [clearUploadedUrl],
  );

  const uploadLogo = useCallback(
    (file: File | undefined) => {
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
    },
    [clearUploadedUrl],
  );

  useEffect(() => {
    const shared = parseStatementShareState(window.location.href, {
      variant: 'consumer',
      mode: 'mobile',
      presetId: PRESETS[0].id,
      brand: DEFAULT_BRAND,
    });
    setVariant(shared.variant);
    setPresetId(shared.presetId);
    setBrand(shared.brand);
    updatePreview({ type: 'view-selected', mode: shared.mode });
  }, []);

  const copyShareLink = useCallback(() => {
    const url = statementShareUrl(window.location.href, {
      variant,
      mode: preview.mode,
      presetId,
      brand,
    });
    window.history.replaceState(window.history.state, '', url);
    navigator.clipboard?.writeText(url).catch(() => {});
  }, [brand, presetId, preview.mode, variant]);

  const goPlayground = useCallback(() => {
    if (!isMobileViewport()) return;
    withViewTransition(() => {
      setMobileView('playground');
    });
  }, []);

  const goConfigure = useCallback(() => {
    withViewTransition(() => setMobileView('configure'));
  }, []);

  const [showBackPill, setShowBackPill] = useState(true);
  const lastScrollY = useRef(0);
  useEffect(() => {
    if (mobileView !== 'playground') return;
    const element = stackColRef.current;
    if (!element) return;
    element.scrollTop = 0;
    lastScrollY.current = 0;
    setShowBackPill(true);
    const onScroll = () => {
      const y = element.scrollTop;
      setShowBackPill(y < lastScrollY.current || y < 52);
      lastScrollY.current = y;
    };
    element.addEventListener('scroll', onScroll, { passive: true });
    return () => element.removeEventListener('scroll', onScroll);
  }, [mobileView]);

  useEffect(() => {
    if (mobileView !== 'playground') return;
    history.pushState({ mobileView: 'playground' }, '');
    const onPop = () => {
      setMobileView('configure');
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [mobileView]);

  return (
    <main ref={layoutRef} className={styles.layout} data-mobile-view={mobileView}>
      <ThemeSync />
      <div className={styles.configCol}>
        <ConfigurePanel
          brand={brand}
          presetId={presetId}
          uploadError={uploadError}
          variant={variant}
          onBrandChange={(companyName) => {
            setBrand((current) => ({ ...current, companyName }));
          }}
          onBrandColorChange={(key, value) => {
            setBrand((current) => ({
              ...current,
              colors: { ...current.colors, [key]: value },
            }));
          }}
          onClearLogo={() => {
            clearUploadedUrl();
            setBrand((current) => ({ ...current, logo: { kind: 'none' } }));
          }}
          onPresetSelect={selectPreset}
          onUpload={uploadLogo}
          onVariantChange={(nextVariant) => {
            if (nextVariant === variant) return;
            setVariant(nextVariant);
            updatePreview({ type: 'account-selected' });
          }}
        />
      </div>
      <div ref={stackColRef} className={styles.stackCol}>
        <div className={styles.appCol}>
          <StatementPanel
            statement={statement}
            preview={preview}
            onCopyLink={copyShareLink}
            onPreviewModeChange={(mode) => {
              updatePreview({ type: 'view-selected', mode });
            }}
          />
        </div>
        <ColumnResizeHandle onMouseDown={onResizeStart} />
        <div
          ref={apiColRef}
          className={styles.apiCol}
          data-resizing={resizing || undefined}
          style={{ width: apiWidth ?? undefined }}
        >
          <ApiPanel entries={entries} />
        </div>
      </div>

      <div className={styles.exploreFade} aria-hidden>
        <div className={clsx(styles.fadeBlur, styles.fadeBlurStrong)} />
        <div className={clsx(styles.fadeBlur, styles.fadeBlurMid)} />
        <div className={clsx(styles.fadeBlur, styles.fadeBlurSoft)} />
        <div className={styles.fadeTint} />
      </div>
      <button type="button" className={styles.exploreBtn} onClick={goPlayground}>
        Explore playground
        <IconArrowRight size={16} />
      </button>
      <button
        type="button"
        className={styles.backPill}
        data-hidden={!showBackPill || undefined}
        onClick={goConfigure}
      >
        <IconArrowLeft size={16} />
        Configure
      </button>
    </main>
  );
}
