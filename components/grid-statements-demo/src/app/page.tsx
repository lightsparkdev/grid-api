'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconArrowRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRight';
import { IconArrowLeft } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowLeft';
import { ConfigurePanel } from '@/components/ConfigurePanel/ConfigurePanel';
import { StatementPanel } from '@/components/StatementPanel/StatementPanel';
import { ApiPanel } from '@/components/ApiPanel/ApiPanel';
import type { AppShellDevice } from '@/apps/shared/AppShell';
import { ColumnResizeHandle } from '@/components/ColumnResizeHandle/ColumnResizeHandle';
import { ThemeSync } from '@/components/ThemeSync';
import { useColumnResize } from '@/hooks/useColumnResize';
import { LAYOUT_WIDE_PX } from '@/lib/layout';
import { buildApiEntries, type StatementApiEntry } from '@/statement/api';
import {
  DEFAULT_BRAND,
  PERIODS,
  buildStatement,
  statementFilename,
} from '@/statement/fixtures';
import {
  PRESETS,
  presetIconSrc,
  type PresetId,
  type StatementPreset,
} from '@/statement/presets';
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
  const [periodId, setPeriodId] = useState(PERIODS[0].id);
  const [brand, setBrand] = useState<StatementBrand>(DEFAULT_BRAND);
  const [presetId, setPresetId] = useState<PresetId | null>(PRESETS[0].id);
  const [presetSequence, setPresetSequence] = useState(0);
  const [device, setDevice] = useState<AppShellDevice>('iphone');
  const [entries, setEntries] = useState<StatementApiEntry[]>(() =>
    buildApiEntries(buildStatement('consumer', DEFAULT_BRAND, PERIODS[0]), 0),
  );
  const [uploadError, setUploadError] = useState('');
  const [mobileView, setMobileView] = useState<MobileView>('configure');
  const uploadedUrl = useRef<string | null>(null);
  const stackColRef = useRef<HTMLDivElement>(null);
  const period = PERIODS.find((candidate) => candidate.id === periodId) ?? PERIODS[0];
  const statement = useMemo(() => buildStatement(variant, brand, period), [brand, period, variant]);
  const apiStatement = useMemo(
    () => buildStatement(variant, DEFAULT_BRAND, period),
    [period, variant],
  );
  const refreshKey = `${variant}:${period.id}:${presetSequence}`;
  const previousRefreshKey = useRef(refreshKey);
  const entriesHydrated = useRef(false);

  useLayoutEffect(() => {
    const media = window.matchMedia(`(max-width: ${LAYOUT_WIDE_PX - 1}px)`);
    const apply = () =>
      document.documentElement.setAttribute('data-layout', media.matches ? 'stacked' : 'wide');
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!entriesHydrated.current) {
      entriesHydrated.current = true;
      setEntries(buildApiEntries(apiStatement));
      return;
    }
    if (refreshKey === previousRefreshKey.current) return;
    previousRefreshKey.current = refreshKey;
    setEntries([]);
    const timer = window.setTimeout(() => setEntries(buildApiEntries(apiStatement)), 260);
    return () => window.clearTimeout(timer);
  }, [apiStatement, refreshKey]);

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
      setPresetSequence((current) => current + 1);
      setBrand((current) => ({
        ...current,
        companyName: preset.companyName,
        logo: {
          kind: 'image',
          src: presetIconSrc(preset),
          alt: `${preset.companyName} logo`,
        },
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
      setPresetId(null);
      setBrand((current) => ({
        ...current,
        logo: { kind: 'image', src: url, alt: `${current.companyName || 'Company'} logo` },
      }));
      setUploadError('');
    },
    [clearUploadedUrl],
  );

  const printStatement = useCallback(() => {
    const previousTitle = document.title;
    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    document.title = statementFilename(statement).replace(/\.pdf$/i, '');
    window.addEventListener('afterprint', restoreTitle);
    window.print();
    window.setTimeout(restoreTitle, 1000);
  }, [statement]);

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
          periodId={periodId}
          presetId={presetId}
          uploadError={uploadError}
          variant={variant}
          onBrandChange={(companyName) => {
            setPresetId(null);
            setBrand((current) => ({ ...current, companyName }));
          }}
          onBrandColorChange={(key, value) => {
            setPresetId(null);
            setBrand((current) => ({
              ...current,
              colors: { ...current.colors, [key]: value },
            }));
          }}
          onClearLogo={() => {
            clearUploadedUrl();
            setPresetId(null);
            setBrand((current) => ({ ...current, logo: { kind: 'none' } }));
          }}
          onPeriodChange={setPeriodId}
          onPresetSelect={selectPreset}
          onUpload={uploadLogo}
          onVariantChange={setVariant}
        />
      </div>
      <div ref={stackColRef} className={styles.stackCol}>
        <div className={styles.appCol}>
          <StatementPanel
            statement={statement}
            device={device}
            onDeviceChange={setDevice}
            onPrint={printStatement}
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
