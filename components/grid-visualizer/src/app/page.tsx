'use client';

import { useFlowBuilder, lookupCurrency } from '@/hooks/useFlowBuilder';
import { useTheme } from '@/hooks/useTheme';
import { usePanelCollapse } from '@/hooks/usePanelCollapse';
import { Header } from '@/components/Header/Header';
import { InputCard, CardChevron } from '@/components/InputCard/InputCard';
import { FundingModelSection } from '@/components/FundingModelSection/FundingModelSection';
import { RegionPicker } from '@/components/RegionPicker/RegionPicker';
import { PopularFlows } from '@/components/PopularFlows/PopularFlows';
import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { EmptyCanvas } from '@/components/EmptyCanvas/EmptyCanvas';
import { FlowPanel } from '@/components/FlowPanel/FlowPanel';
import { CodePanel } from '@/components/CodePanel/CodePanel';
import { Footer } from '@/components/Footer/Footer';
import { Agentation } from 'agentation';

import { IconArrowLeft } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowLeft';
import { IconArrowRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRight';
import { useState, useEffect, useCallback, useRef } from 'react';
import clsx from 'clsx';
import styles from './page.module.scss';

export default function Home() {
  const {
    state,
    isComplete,
    fundingModel,
    setSend,
    setReceive,
    setSendNetwork,
    setReceiveNetwork,
    setSourceFundingMode,
    swap,
    setSourceRegion,
    setDestRegion,
    setAudience,
    openPicker,
    closePicker,
  } = useFlowBuilder();

  // Region picker state — opened from the inline Region row on crypto cards
  const [regionTarget, setRegionTarget] = useState<'send' | 'receive' | null>(null);
  const regionCryptoCode = regionTarget === 'send' ? state.send?.code : undefined;

  const [showAgentation, setShowAgentation] = useState(false);
  const [isEmbed, setIsEmbed] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowAgentation(params.get('debug') === 'true');
    setIsEmbed(params.get('embed') === 'true');
  }, []);

  const [mobileView, setMobileView] = useState<'wizard' | 'results'>('wizard');

  useEffect(() => {
    if (isComplete) setMobileView('results');
  }, [isComplete]);

  // Scroll direction detection for mobile floating button
  const [showFloatingBtn, setShowFloatingBtn] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (mobileView !== 'results') return;
    const handleScroll = () => {
      const y = window.scrollY;
      setShowFloatingBtn(y < lastScrollY.current || y < 52);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileView]);

  // Browser back button: push history when entering results, pop returns to wizard
  useEffect(() => {
    if (mobileView !== 'results') return;
    history.pushState({ mobileView: 'results' }, '');
    const handlePop = () => {
      setMobileView('wizard');
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [mobileView]);

  const { theme, setTheme } = useTheme();

  const handleThemeChange = useCallback((t: 'light' | 'dark') => {
    setTheme(t);
    if (isEmbed) {
      window.parent.postMessage({ type: 'theme-sync', theme: t }, '*');
    }
  }, [setTheme, isEmbed]);

  useEffect(() => {
    if (!isEmbed) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'theme-sync' && (e.data.theme === 'light' || e.data.theme === 'dark')) {
        setTheme(e.data.theme);
      }
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: 'theme-request' }, '*');
    return () => window.removeEventListener('message', handler);
  }, [isEmbed, setTheme]);

  // Sync iOS status bar color with the top element's background
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const style = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const color = mobileView === 'wizard'
      ? (isDark ? style.getPropertyValue('--color-gray-975') : style.getPropertyValue('--surface-secondary'))
      : (isDark ? style.getPropertyValue('--color-gray-950') : style.getPropertyValue('--surface-primary'));
    const trimmed = color.trim();
    if (!trimmed) return;
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(meta => {
      meta.content = trimmed;
    });
  }, [mobileView, theme]);

  const { flowExpanded, codeExpanded, toggleFlow, toggleCode } =
    usePanelCollapse();

  return (
    <main className={styles.layout} data-mobile-view={mobileView}>
      {/* Left sidebar */}
      <div className={styles.sidebar}>
        {!isEmbed && (
          <div className={styles.sidebarHeader}>
            <svg width="120" height="22" viewBox="0 0 120 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Lightspark">
              <path d="M10.3034 12.2943L1.14489 18.2419H5.90287L13.1487 13.5365V20.2279L16.2067 18.242V12.2943H25.3653L29.3557 9.70291H19.0518L28.2101 3.75545L23.4521 3.75545L16.2067 8.46066V1.76953L13.1487 3.75547V9.70291H3.99043L0 12.2943H10.3034Z" fill="currentColor"/>
              <path d="M111.691 12.0481L115.747 7.49219H118.625L114.628 11.8283L119.084 18.2426H116.247L113.01 13.5668L111.691 14.9855V18.2426H109.313V3.75552H111.691V12.0481Z" fill="currentColor"/>
              <path d="M108.096 7.43222C106.637 7.47218 105.618 8.19154 105.099 9.43043V7.49216H102.781V18.2426H105.159V12.7075C105.159 10.5894 105.998 9.79011 107.636 9.79011C107.936 9.79011 108.216 9.81009 108.616 9.87004V7.4522C108.436 7.43222 108.256 7.43222 108.096 7.43222Z" fill="currentColor"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M98.9336 9.09072C98.2742 7.95174 97.0154 7.29233 95.5167 7.29233C92.939 7.29233 90.8808 9.37048 90.8808 12.8873C90.8808 16.4242 92.939 18.5023 95.5167 18.5023C97.0154 18.5023 98.2742 17.8429 98.9336 16.6839V18.2426H101.332V7.49215H98.9336V9.09072ZM99.0535 12.8873C99.0535 15.485 97.6947 16.5641 96.1961 16.5641C94.5576 16.5641 93.4186 15.2452 93.4186 12.8873C93.4186 10.5494 94.5576 9.2306 96.1961 9.2306C97.6947 9.2306 99.0535 10.2897 99.0535 12.8873Z" fill="currentColor"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M82.2685 21.3628L79.8907 21.7394V7.49215H82.2685V9.09072C82.9479 7.95174 84.1868 7.29233 85.7055 7.29233C88.2832 7.29233 90.3613 9.37047 90.3613 12.8873C90.3613 16.4242 88.2832 18.5023 85.7055 18.5023C84.1868 18.5023 82.9479 17.8429 82.2685 16.6839V21.3628ZM85.0061 16.5641C86.6646 16.5641 87.8236 15.2452 87.8236 12.8873C87.8236 10.5494 86.6646 9.2306 85.0061 9.2306C83.5074 9.2306 82.1686 10.2897 82.1686 12.8873C82.1686 15.485 83.5074 16.5641 85.0061 16.5641Z" fill="currentColor"/>
              <path d="M75.2706 11.8683L73.5721 11.5485C72.573 11.3687 72.0535 11.029 72.0535 10.3696C72.0535 9.51037 73.0526 9.13071 74.1116 9.13071C75.2906 9.13071 76.2298 9.53035 76.4895 10.6294H78.8274C78.4677 8.45131 76.6294 7.25238 74.2715 7.25238C71.7937 7.25238 69.7355 8.41135 69.7355 10.4695C69.7355 12.3678 71.2742 13.1671 72.9527 13.4868L74.6711 13.8065C75.8701 14.0263 76.6694 14.426 76.6694 15.2852C76.6694 16.1444 75.6503 16.644 74.3514 16.644C72.9327 16.644 72.0934 16.0046 71.8137 14.7657H69.4558C69.7156 16.8838 71.494 18.5023 74.3115 18.5023C76.9691 18.5023 79.0073 17.2834 79.0073 15.0454C79.0073 13.0472 77.4886 12.2879 75.2706 11.8683Z" fill="currentColor"/>
              <path d="M58.17 9.23063C56.5515 9.23063 55.6523 10.3496 55.6523 12.5277V18.2426H53.2744V4.13211L55.6523 3.75552V9.03081C56.2118 8.09165 57.3108 7.29236 59.0692 7.29236C61.7269 7.29236 62.6461 8.95088 62.6461 11.5685V18.2426H60.2682V12.228C60.2682 10.6094 60.0684 9.23063 58.17 9.23063Z" fill="currentColor"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M49.3359 9.09074C48.6565 7.95176 47.4576 7.29235 45.9589 7.29235C43.4212 7.29235 41.3231 9.21064 41.3231 12.6276C41.3231 16.0845 43.4212 17.9828 45.9589 17.9828C47.4576 17.9828 48.6565 17.3434 49.3359 16.1844V17.4233C49.3359 19.3616 48.2968 20.1209 46.6783 20.1209C45.2596 20.1209 44.6001 19.5614 44.3004 18.6422H41.9225C42.3222 20.7603 44.0207 21.9992 46.6783 21.9992C49.6956 21.9992 51.6938 20.5205 51.6938 17.0436V7.49217H49.3359V9.09074ZM49.4358 12.6276C49.4358 15.1254 48.137 16.0645 46.6383 16.0645C45.0397 16.0645 43.8608 14.8856 43.8608 12.6276C43.8608 10.4096 45.0397 9.23062 46.6383 9.23062C48.137 9.23062 49.4358 10.1498 49.4358 12.6276Z" fill="currentColor"/>
              <path d="M64.6473 15.4251C64.6473 17.763 65.2868 18.2426 67.5647 18.2426H69.7074L68.889 16.4042H68.2641C67.2051 16.4042 67.0252 16.1444 67.0252 15.0654V9.29055H69.1833V7.49216H67.0252V4.69465H64.6473V7.49216H62.6874L63.4881 9.29056L64.6473 9.29055V15.4251Z" fill="currentColor"/>
              <path d="M37.9935 18.2426V7.49218H40.3713V18.2426H37.9935Z" fill="currentColor"/>
              <path d="M37.9935 3.75552V6.11341H40.3713V3.75552H37.9935Z" fill="currentColor"/>
              <path d="M33.9432 3.75552V18.2426H36.3211V3.75552H33.9432Z" fill="currentColor"/>
            </svg>
            <a href="https://lightspark.com/contact" className={styles.headerLink}>
              Contact sales
            </a>
          </div>
        )}

        <div className={styles.sidebarContent}>
            <div className={styles.sidebarContentInner}>
            <Header />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', isolation: 'isolate' }}>
                <InputCard
                  label="Source"
                  selection={state.send}
                  region={state.sourceRegion}
                  onCardClick={() => openPicker('send')}
                  onNetworkChange={setSendNetwork}
                  onRegionClick={() => setRegionTarget('send')}
                />
                <div style={{ position: 'relative', height: '8px' }}>
                  <CardChevron onSwap={state.send || state.receive ? swap : undefined} />
                </div>
                <InputCard
                  label="Destination"
                  selection={state.receive}
                  onCardClick={() => openPicker('receive')}
                  onNetworkChange={setReceiveNetwork}
                />
              </div>

              {state.send && state.receive && (
                <FundingModelSection
                  source={state.send}
                  selectedMode={state.sourceFundingMode}
                  onModeChange={setSourceFundingMode}
                />
              )}
            </div>

            {isComplete && (
              <button
                className={styles.mobileViewBtn}
                onClick={() => {
                  const update = () => {
                    setMobileView('results');
                    window.scrollTo(0, 0);
                  };
                  if ('startViewTransition' in document) {
                    (document as any).startViewTransition(update);
                  } else {
                    update();
                  }
                }}
                type="button"
              >
                View flow and code
                <IconArrowRight size={16} />
              </button>
            )}

            <div style={{ marginTop: isComplete ? '10px' : '24px' }}>
              <PopularFlows onSelect={(sendCode, receiveCode) => {
                const s = lookupCurrency(sendCode);
                const r = lookupCurrency(receiveCode);
                if (s) setSend(s);
                if (r) setReceive(r);
              }} />
            </div>
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          <Footer theme={theme} setTheme={handleThemeChange} />
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.rightPanel}>
        {!isComplete ? (
          <EmptyCanvas />
        ) : (
          <div className={styles.rightPanelScroll}>
            <FlowPanel
              send={state.send!}
              receive={state.receive!}
              sourceRegion={state.sourceRegion}
              destRegion={state.destRegion}
              expanded={flowExpanded}
              onToggle={toggleFlow}
            />
            <CodePanel
              send={state.send!}
              receive={state.receive!}
              fundingModel={fundingModel}
              audience={state.audience}
              onAudienceChange={setAudience}
              expanded={codeExpanded}
            />
          </div>
        )}
      </div>

      {/* Currency picker modal */}
      <CurrencyPicker
        open={state.pickerTarget !== null}
        target={state.pickerTarget}
        onClose={closePicker}
        onSelect={(sel) => {
          const target = state.pickerTarget;
          if (target === 'send') {
            setSend(sel);
          } else {
            setReceive(sel);
          }
        }}
        excludeCode={
          state.pickerTarget === 'receive' && state.send
            ? state.send.code
            : state.pickerTarget === 'send' && state.receive
              ? state.receive.code
              : undefined
        }
      />

      {/* Region picker modal — opens from crypto card Region row */}
      <RegionPicker
        open={regionTarget !== null}
        cryptoCode={regionCryptoCode}
        onClose={() => setRegionTarget(null)}
        onSelect={(regionCode) => {
          if (regionTarget === 'send') {
            setSourceRegion(regionCode);
          } else if (regionTarget === 'receive') {
            setDestRegion(regionCode);
          }
          setRegionTarget(null);
        }}
      />

      {/* Mobile results view: fixed header with lockup */}
      {isComplete && mobileView === 'results' && !isEmbed && (
        <div className={styles.mobileResultsHeader}>
          <svg width="206" height="25" viewBox="0 0 206 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Lightspark Grid">
            <path d="M10.3034 13.4975L1.14489 19.4451H5.90287L13.1487 14.7396V21.431L16.2067 19.4451V13.4975H25.3653L29.3557 10.906H19.0518L28.2101 4.95858L23.4521 4.95858L16.2067 9.66379V2.97266L13.1487 4.95859V10.906H3.99043L0 13.4975H10.3034Z" fill="currentColor"/><path d="M111.691 13.2512L115.747 8.69531H118.625L114.628 13.0314L119.084 19.4457H116.247L113.01 14.7699L111.691 16.1886V19.4457H109.313V4.95865H111.691V13.2512Z" fill="currentColor"/><path d="M108.096 8.63534C106.637 8.67531 105.618 9.39466 105.099 10.6336V8.69529H102.781V19.4457H105.159V13.9106C105.159 11.7925 105.998 10.9932 107.636 10.9932C107.936 10.9932 108.216 11.0132 108.616 11.0732V8.65532C108.436 8.63534 108.256 8.63534 108.096 8.63534Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M98.9336 10.2938C98.2742 9.15487 97.0154 8.49546 95.5167 8.49546C92.939 8.49546 90.8808 10.5736 90.8808 14.0905C90.8808 17.6273 92.939 19.7054 95.5167 19.7054C97.0154 19.7054 98.2742 19.046 98.9336 17.8871V19.4457H101.332V8.69528H98.9336V10.2938ZM99.0535 14.0905C99.0535 16.6881 97.6947 17.7672 96.1961 17.7672C94.5576 17.7672 93.4186 16.4484 93.4186 14.0905C93.4186 11.7525 94.5576 10.4337 96.1961 10.4337C97.6947 10.4337 99.0535 11.4928 99.0535 14.0905Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M82.2685 22.5659L79.8907 22.9426V8.69528H82.2685V10.2938C82.9479 9.15487 84.1868 8.49546 85.7055 8.49546C88.2832 8.49546 90.3613 10.5736 90.3613 14.0905C90.3613 17.6273 88.2832 19.7054 85.7055 19.7054C84.1868 19.7054 82.9479 19.046 82.2685 17.8871V22.5659ZM85.0061 17.7672C86.6646 17.7672 87.8236 16.4484 87.8236 14.0905C87.8236 11.7525 86.6646 10.4337 85.0061 10.4337C83.5074 10.4337 82.1686 11.4928 82.1686 14.0905C82.1686 16.6881 83.5074 17.7672 85.0061 17.7672Z" fill="currentColor"/><path d="M75.2706 13.0714L73.5721 12.7517C72.573 12.5718 72.0535 12.2321 72.0535 11.5727C72.0535 10.7135 73.0526 10.3338 74.1116 10.3338C75.2906 10.3338 76.2298 10.7335 76.4895 11.8325H78.8274C78.4677 9.65444 76.6294 8.45551 74.2715 8.45551C71.7937 8.45551 69.7355 9.61447 69.7355 11.6726C69.7355 13.5709 71.2742 14.3702 72.9527 14.6899L74.6711 15.0097C75.8701 15.2295 76.6694 15.6291 76.6694 16.4883C76.6694 17.3476 75.6503 17.8471 74.3514 17.8471C72.9327 17.8471 72.0934 17.2077 71.8137 15.9688H69.4558C69.7156 18.0869 71.494 19.7055 74.3115 19.7055C76.9691 19.7055 79.0073 18.4866 79.0073 16.2485C79.0073 14.2503 77.4886 13.491 75.2706 13.0714Z" fill="currentColor"/><path d="M58.17 10.4338C56.5515 10.4338 55.6523 11.5528 55.6523 13.7308V19.4457H53.2744V5.33524L55.6523 4.95865V10.2339C56.2118 9.29477 57.3108 8.49549 59.0692 8.49549C61.7269 8.49549 62.6461 10.154 62.6461 12.7717V19.4457H60.2682V13.4311C60.2682 11.8125 60.0684 10.4338 58.17 10.4338Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M49.3359 10.2939C48.6565 9.15488 47.4576 8.49547 45.9589 8.49547C43.4212 8.49547 41.3231 10.4138 41.3231 13.8307C41.3231 17.2876 43.4212 19.1859 45.9589 19.1859C47.4576 19.1859 48.6565 18.5465 49.3359 17.3875V18.6264C49.3359 20.5647 48.2968 21.324 46.6783 21.324C45.2596 21.324 44.6001 20.7645 44.3004 19.8453H41.9225C42.3222 21.9634 44.0207 23.2023 46.6783 23.2023C49.6956 23.2023 51.6938 21.7237 51.6938 18.2468V8.69529H49.3359V10.2939ZM49.4358 13.8307C49.4358 16.3285 48.137 17.2676 46.6383 17.2676C45.0397 17.2676 43.8608 16.0887 43.8608 13.8307C43.8608 11.6127 45.0397 10.4337 46.6383 10.4337C48.137 10.4337 49.4358 11.3529 49.4358 13.8307Z" fill="currentColor"/><path d="M64.6473 16.6282C64.6473 18.9661 65.2868 19.4457 67.5647 19.4457H69.7074L68.889 17.6073H68.2641C67.2051 17.6073 67.0252 17.3476 67.0252 16.2685V10.4937H69.1833V8.69528H67.0252V5.89778H64.6473V8.69528H62.6874L63.4881 10.4937L64.6473 10.4937V16.6282Z" fill="currentColor"/><path d="M37.9935 19.4457V8.69531H40.3713V19.4457H37.9935Z" fill="currentColor"/><path d="M37.9935 4.95864V7.31654H40.3713V4.95864H37.9935Z" fill="currentColor"/><path d="M33.9432 4.95865V19.4457H36.3211V4.95865H33.9432Z" fill="currentColor"/>
            <path d="M137.77 0.203125L127.084 24.2031" stroke="currentColor" strokeOpacity="0.1"/>
            <path d="M155.679 5.03516V9.24678H158.193V5.03516H164.102V10.9446H159.89V13.4582H164.102V19.3677H158.193V15.156H155.679V19.3677H149.77V13.4582H153.981V10.9446H149.77V5.03516H155.679ZM159.89 17.6699H162.404V15.156H159.89V17.6699ZM151.467 17.6699H153.981V15.156H151.467V17.6699ZM155.679 13.4582H158.193V10.9446H155.679V13.4582ZM159.89 9.24678H162.404V6.73295H159.89V9.24678ZM151.467 9.24678H153.981V6.73295H151.467V9.24678Z" fill="currentColor"/><path d="M176.735 4.78516C179.698 4.78516 182.069 6.44449 182.662 9.21005H180.706C180.239 7.63498 178.969 6.51937 176.743 6.48488L176.636 6.48398C174.108 6.48398 172.132 8.45943 172.132 12.1732C172.132 15.7882 173.989 17.9216 176.636 17.9216C178.553 17.9216 180.864 17.1314 180.864 14.1683V13.793H177.071V12.0547H182.76V19.3637H181.18L181.081 17.5661C180.153 19.0279 178.474 19.6205 176.558 19.6205C172.429 19.6205 170.078 16.5388 170.078 12.1732C170.078 7.72854 172.705 4.78518 176.735 4.78516Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M205.143 5.04197V19.3637H203.345V17.7635C202.693 18.8895 201.568 19.6205 199.869 19.6205C197.439 19.6205 195.325 17.6056 195.325 14.0893C195.325 10.5929 197.439 8.55823 199.869 8.55823L200.026 8.56034C201.637 8.60426 202.714 9.32434 203.345 10.4151V5.04197H205.143ZM200.323 10.099C198.486 10.099 197.281 11.5608 197.281 14.0893C197.281 16.6178 198.486 18.0796 200.323 18.0796C201.923 18.0796 203.424 16.8944 203.424 14.0893C203.424 11.2843 201.923 10.099 200.323 10.099Z" fill="currentColor"/><path d="M189.79 8.67668C189.968 8.67668 190.126 8.67668 190.323 8.69643V10.6126C189.908 10.5533 189.612 10.5336 189.316 10.5336C187.657 10.5336 186.827 11.4621 186.827 13.793V19.3637H185.029V8.73591H186.787V10.5928C187.321 9.38785 188.407 8.71621 189.79 8.67668Z" fill="currentColor"/><path d="M193.526 19.3637H191.729V8.73591H193.526V19.3637Z" fill="currentColor"/><path d="M193.526 7.21493H191.729V5.04197H193.526V7.21493Z" fill="currentColor"/>
          </svg>
        </div>
      )}

      {/* Mobile results view: floating pill */}
      {isComplete && mobileView === 'results' && (
        <button
          className={clsx(
            styles.mobileFloatingBtn,
            !showFloatingBtn && styles.mobileFloatingBtnHidden,
          )}
          onClick={() => {
            const update = () => {
              setMobileView('wizard');
              window.scrollTo(0, 0);
            };
            if ('startViewTransition' in document) {
              (document as any).startViewTransition(update);
            } else {
              update();
            }
          }}
          type="button"
        >
          <IconArrowLeft size={16} />
          Change source / destination
        </button>
      )}

      {showAgentation && <Agentation />}
    </main>
  );
}
