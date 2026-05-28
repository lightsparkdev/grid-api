import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Grid Global Accounts — Live demo',
  description:
    'Create a branded, self-custody dollar account and watch the Grid API calls fire in real time.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Set data-embed and an initial data-theme before paint to avoid a flash. */}
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
            }catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
