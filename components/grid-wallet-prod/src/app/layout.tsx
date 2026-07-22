import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { easingVarsStylesheet } from '@/lib/easing';
import { CONFIGURE_COL_PX, LAYOUT_WIDE_PX } from '@/lib/layout';
import './globals.scss';

const TITLE = 'Grid Global Accounts — Live demo';
const DESCRIPTION =
  'Create a branded, self-custody dollar account and watch the Grid API calls fire in real time.';

export const metadata: Metadata = {
  // Absolute base for social-card image URLs (scrapers need full URLs).
  // VERCEL_PROJECT_PRODUCTION_URL covers previews; the default is prod.
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'https://grid-wallet-demo.vercel.app',
  ),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og-global-accounts-playground.webp', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-global-accounts-playground.webp'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#F0F0EE" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#111111" media="(prefers-color-scheme: dark)" />
        {/* Preload the visible Suisse Intl weights so the first paint shows the
            real font sooner (body=Book 450, headings/buttons=Medium 500,
            code=Mono). crossOrigin is required even though the fonts are
            same-origin: @font-face fetches use CORS mode, so without it the
            preload wouldn't match and the font would download twice. */}
        <link rel="preload" href="/fonts/SuisseIntl-Book.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/SuisseIntl-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/SuisseIntlMono-Regular-WebXL.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* Boot attributes, set before first paint to avoid flashes — an
            effect is too late (the SSR HTML paints long before hydration):
            - data-embed / data-theme from the URL (embed) or stored pref
            - data-layout (stacked ⇄ 2-col wide) from the viewport width
            - --api-col-default from the embed's ?nav param (the live docs
              sidebar width), so the wide layout's code column paints at its
              real default — sidebar width plus the deferred (Phase 2)
              configure-column offset — instead of the expanded-sidebar
              assumption and re-fitting after hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
              var p=new URLSearchParams(window.location.search);
              if(p.get('embed')==='true'){document.documentElement.setAttribute('data-embed','true');}
              var t=p.get('theme');
              if(t!=='dark'&&t!=='light'){
                t=localStorage.getItem('grid-wallet-theme');
              }
              if(t!=='dark'&&t!=='light'){
                t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
              }
              document.documentElement.setAttribute('data-theme',t);
              document.documentElement.setAttribute('data-layout',window.innerWidth<${LAYOUT_WIDE_PX}?'stacked':'wide');
              var nav=parseFloat(p.get('nav'));
              if(isFinite(nav)&&nav>=0){document.documentElement.style.setProperty('--api-col-default',(Math.round(nav)+${CONFIGURE_COL_PX})+'px');}
            }catch(e){}})();`,
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: easingVarsStylesheet() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
