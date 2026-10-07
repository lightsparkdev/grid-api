import { useEffect, useState } from 'react';
import { RenderPage } from './pages/Render';
import { SheetPage } from './pages/Sheet';
import { StillsPage } from './pages/Stills';

const PAGES = {
  render: { label: 'Reel', Page: RenderPage },
  sheet: { label: 'Contact sheet', Page: SheetPage },
  stills: { label: 'Stills', Page: StillsPage },
} as const;
type PageId = keyof typeof PAGES;

const pageOf = (hash: string): PageId => {
  const id = hash.replace(/^#\/?/, '').split('?')[0];
  return id in PAGES ? (id as PageId) : 'render';
};

export function App() {
  const [page, setPage] = useState<PageId>(() => pageOf(location.hash));
  useEffect(() => {
    const on = () => setPage(pageOf(location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const { Page } = PAGES[page];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <nav style={{ display: 'flex', gap: 16, padding: '10px 16px', borderBottom: '1px solid #222' }}>
        {(Object.keys(PAGES) as PageId[]).map((id) => (
          <a key={id} href={`#/${id}`} style={{ color: id === page ? '#fff' : '#777', textDecoration: 'none' }}>
            {PAGES[id].label}
          </a>
        ))}
      </nav>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Page key={page} />
      </div>
    </div>
  );
}
