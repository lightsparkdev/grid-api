import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { easingVarsStylesheet } from '@/lib/easing';
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
        {/* Set data-embed, an initial data-theme, and the stacked ⇄ 3-col
            data-layout before paint to avoid a flash. The layout attribute
            must land pre-paint (not in a React effect): the SSR HTML paints
            long before hydration, and the wide default would flash 3-col on
            stacked viewports while the JS loads. 1600 matches
            $breakpoint-layout-wide. */}
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
              document.documentElement.setAttribute('data-layout',window.innerWidth<1600?'stacked':'wide');
            }catch(e){}})();`,
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: easingVarsStylesheet() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
