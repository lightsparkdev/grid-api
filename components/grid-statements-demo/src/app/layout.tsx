import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { easingVarsStylesheet } from '@/lib/easing';
import { CONFIGURE_COL_PX, LAYOUT_WIDE_PX, NAV_COLLAPSED_MAX_PX } from '@/lib/layout';
import './globals.scss';

const TITLE = 'Grid Statements - Playground';
const DESCRIPTION =
  'Build a periodic statement and inspect the Grid API data behind it.';

/** The browser chrome's color (mobile Safari's bars): the app's surfaces.
 *  A page whose surface differs (the share page) exports its own. */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F0F0EE' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
};

export const metadata: Metadata = {
  // lightspark.com's favicons, the files themselves (the website repo's
  // public/favicons), linked as its Meta component links them.
  icons: {
    icon: [
      { url: '/favicons/favicon.ico', sizes: 'any' },
      { url: '/favicons/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicons/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: '/favicons/apple-touch-icon.png',
  },
  // Absolute base for social-card image URLs (scrapers need full URLs).
  // VERCEL_PROJECT_PRODUCTION_URL covers previews; the default is prod.
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'https://grid-statements-demo.vercel.app',
  ),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <head>
        {/* Preload the two variable fonts (every weight of Suisse Intl and of
            its Mono) so the first paint shows the real font sooner.
            crossOrigin is required even though the fonts are same-origin:
            @font-face fetches use CORS mode, so without it the preload
            wouldn't match and the font would download twice. */}
        <link rel="preload" href="/fonts/SuisseIntlVF.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/SuisseIntlMonoVF.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* Boot attributes, set before first paint to avoid flashes — an
            effect is too late (the SSR HTML paints long before hydration):
            - data-embed / data-theme from the URL (embed) or stored pref
            - data-layout (stacked ⇄ 3-col) from the viewport width
            - --api-col-default from the embed's ?nav param (the live docs
              sidebar width), so the wide layout's code column paints at its
              real default — sidebar + configure column — instead of the
              expanded-sidebar assumption and re-fitting after hydration.
            - data-nav (collapsed ⇄ expanded) from the same ?nav param, so
              chrome keyed on the docs sidebar state paints right first time.
              Absent standalone (no ?nav), where the rules don't apply. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
              var p=new URLSearchParams(window.location.search);
              if(p.get('embed')==='true'){document.documentElement.setAttribute('data-embed','true');}
              var t=p.get('theme');
              if(t!=='dark'&&t!=='light'){
                t=localStorage.getItem('grid-cards-theme');
              }
              if(t!=='dark'&&t!=='light'){
                t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
              }
              document.documentElement.setAttribute('data-theme',t);
              document.documentElement.setAttribute('data-layout',window.innerWidth<${LAYOUT_WIDE_PX}?'stacked':'wide');
              var nav=parseFloat(p.get('nav'));
              if(isFinite(nav)&&nav>=0){
                document.documentElement.style.setProperty('--api-col-default',(Math.round(nav)+${CONFIGURE_COL_PX})+'px');
                document.documentElement.setAttribute('data-nav',nav<=${NAV_COLLAPSED_MAX_PX}?'collapsed':'expanded');
              }
            }catch(e){}})();`,
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: easingVarsStylesheet() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
