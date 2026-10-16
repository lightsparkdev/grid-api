import './share.scss';

/* The share pages' layout, under the app's root layout (Next allows more than
   one root layout only when none sits at the top of `app/`, and the
   playground's does). Once deployed behind the website's proxy, the root
   layout's stylesheet and fonts resolve through `assetPrefix`, so nothing
   here needs to stand apart; this adds the page's own tokens. */

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
