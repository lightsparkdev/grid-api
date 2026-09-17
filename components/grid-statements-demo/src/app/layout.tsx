import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Grid periodic statements playground',
  description: 'Turn account data into a consumer or commercial periodic statement.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=new URLSearchParams(location.search);if(p.get('embed')==='true')document.documentElement.dataset.embed='true';var t=p.get('theme');if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
