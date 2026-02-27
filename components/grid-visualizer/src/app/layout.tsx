import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Lightspark Grid — Quickstart',
  description: 'Get the API calls and flow for your exact use case',
  openGraph: {
    title: 'Lightspark Grid — Quickstart',
    description: 'Get the API calls and flow for your exact use case',
    images: [
      {
        url: '/og-image.png',
        width: 2400,
        height: 1260,
        alt: 'Lightspark Grid Quickstart — interactive flow builder showing API calls for payment flows',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lightspark Grid — Quickstart',
    description: 'Get the API calls and flow for your exact use case',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-light.svg', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark.svg', media: '(prefers-color-scheme: dark)' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#F0F0EE" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#111111" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var params = new URLSearchParams(window.location.search);
                  if (params.get('embed') === 'true') {
                    document.documentElement.setAttribute('data-embed', 'true');
                  }
                  var paramTheme = params.get('theme');
                  var theme = paramTheme || localStorage.getItem('grid-theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  if (theme === 'dark' || theme === 'light') {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
