import { useState, type UIEvent } from 'react';
import { IconBubble2 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBubble2';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import type { Product } from '../conversation';
import { hash } from '../hotels';
import { PERSON } from '../story';
import { Safari } from './InstinctSafari';
import styles from './InstinctOptions.module.scss';

/*
 * What Instinct found, as a page it made on files.instinct.com (IMG_1941–1944 and the 2026-11-07 recording): a
 * beige masthead, then a paper sheet with the title, a short take, the options as numbered tiles with Let's buy
 * this, and what's good to know. A tile's button is the choice: it turns to Sent to Instinct, and Safari hands
 * back to Messages.
 *
 * It loads as the recording does: the wordmark over "Loading" mid-screen, then it rises to the masthead as the
 * sheet slides up. Scrolled, the masthead shrinks into a 124pt bar: the wordmark and its line scale down and rise,
 * and Share moves from under them to the bar's right.
 */

export const OPTIONS_HOST = 'files.instinct.com';

/** Where the sheet starts, the bar it shrinks the masthead to, and so how far it scrolls before pinning (pt). */
const SHEET_TOP = 302;
const BAR = 124;
const COLLAPSE = SHEET_TOP - BAR;

const COUNT = ['None', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];
/** The colors a tile offers: black first (picked), then a few more, the same ones for the same product. */
const SWATCHES = ['#2a2a2a', '#bdbcba', '#b6a693', '#8e8457', '#3f4e9b', '#e5e3df', '#6e6053', '#3b4a68', '#e9c6b3', '#c9c2dd', '#9aa8b2'];

const cents = (price: string) => Math.round(Number(price.replace(/[^0-9.]/g, '')) * 100);
const dollars = (c: number, up: boolean) => `$${(up ? Math.ceil(c / 100) : Math.floor(c / 100)).toLocaleString('en-US')}`;
const plural = (q: string) => (/s$/i.test(q) ? q : /[^aeiou]y$/i.test(q) ? `${q.slice(0, -1)}ies` : `${q}s`);
const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function swatchesFor(title: string) {
  const h = hash(title);
  const more = Array.from({ length: 2 + (h % 3) }, (_, i) => SWATCHES[1 + ((h >>> (i * 4)) % (SWATCHES.length - 1))]);
  return [SWATCHES[0], ...more.filter((c, i) => more.indexOf(c) === i)];
}

/** Each option's place in the lineup: the pick, the cheapest, and what the others are for. */
function rolesOf(products: Product[]) {
  const prices = products.map((p) => cents(p.price));
  const pick = Math.max(0, products.findIndex((p) => p.pick));
  const cheapest = prices.indexOf(Math.min(...prices));
  return products.map((_, i) => {
    if (i === pick) return { tag: 'Best all-around', why: 'is the all-around pick' };
    if (i === cheapest) return { tag: 'Value pick', why: 'is the value play' };
    return prices[i] > prices[pick] ? { tag: 'The splurge', why: 'costs the most but goes furthest' } : { tag: 'Solid runner-up', why: 'is a close second' };
  });
}

/** The page's title, which its link in the thread previews: "Three headphones, $89 to $249". */
export function optionsTitle(products: Product[], query?: string) {
  const prices = products.map((p) => cents(p.price));
  const count = COUNT[products.length] ?? String(products.length);
  const t = `${count} ${plural((query ?? 'options').toLowerCase())}, ${dollars(Math.min(...prices), false)} to ${dollars(Math.max(...prices), true)}`;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function InstinctOptionsPage({
  products,
  query,
  open,
  onPick,
  onBack,
}: {
  products: Product[];
  query?: string;
  /** The choice is still open in the thread: the buttons pick. Otherwise they're spent. */
  open: boolean;
  onPick: (i: number) => void;
  onBack: () => void;
}) {
  const [sent, setSent] = useState<number | null>(null);
  const [top, setTop] = useState(0);
  const k = Math.min(1, top / COLLAPSE);
  const lerp = (from: number, to: number) => from + (to - from) * k;
  const prices = products.map((p) => cents(p.price));
  const pick = Math.max(0, products.findIndex((p) => p.pick));
  const cheapest = prices.indexOf(Math.min(...prices));
  const roles = rolesOf(products);
  const count = COUNT[products.length] ?? String(products.length);
  const date = today();
  const name = (p: Product) => p.model ?? p.title;
  const buy = (i: number) => {
    if (!open || sent !== null) return;
    setSent(i);
    onPick(i);
  };
  return (
    <Safari host={OPTIONS_HOST} onBack={onBack}>
      <div className={styles.page}>
        <div className={styles.bar} style={{ height: Math.max(BAR, SHEET_TOP - top) }} />
        <div className={styles.head} aria-hidden>
          <span className={styles.word} style={{ top: lerp(116, 64), scale: lerp(1, 0.647) }}>
            <span>Instinct</span>
          </span>
          <span className={styles.loading}>Loading</span>
          <small className={styles.made} style={{ top: lerp(162, 92), scale: lerp(1, 0.9) }}>
            <span>
              Made for {PERSON.first} · {date}
            </span>
          </small>
          <span className={styles.shareMid} style={{ top: lerp(218, 150), opacity: Math.max(0, 1 - k * 2) }}>
            <span>Share</span>
          </span>
          <span className={styles.shareEnd} style={{ opacity: Math.max(0, k * 2 - 1) }}>
            Share
          </span>
        </div>
        <div className={styles.scroll} onScroll={(e: UIEvent<HTMLDivElement>) => setTop(e.currentTarget.scrollTop)}>
          <article className={styles.sheet}>
            <h1 className={styles.title}>{optionsTitle(products, query)}</h1>
            <p className={styles.checked}>Prices checked {date}</p>
            <p className={styles.body}>
              All {count.toLowerCase()} ship with standard shipping from the store that makes them. If you want one answer, get #{pick + 1}: the{' '}
              {products[pick].merchant} {name(products[pick])} is the best mix of quality and price. Tap Let’s buy this on the one you want.
            </p>
            <h2 className={styles.heading}>The options</h2>
            <div className={styles.grid}>
              {products.map((p, i) => (
                <div key={p.title} className={styles.tile}>
                  <span className={styles.photo}>
                    <img src={p.image} alt="" />
                    <span className={styles.badges}>
                      <b>{i + 1}</b>
                      {i === cheapest && i !== pick && <em>Cheapest</em>}
                    </span>
                  </span>
                  <span className={styles.nameRow}>
                    <strong>{name(p)}</strong>
                    <span className={styles.price}>{p.price.replace(/\.00$/, '')}</span>
                  </span>
                  <span className={styles.brand}>
                    {p.merchant} · {roles[i].tag}
                  </span>
                  <span className={styles.swatches} aria-hidden>
                    {swatchesFor(p.title).map((c, k) => (
                      <i key={c} style={{ background: c }} data-on={k === 0 || undefined} />
                    ))}
                  </span>
                  <button type="button" className={styles.buy} data-sent={sent === i || undefined} disabled={!open || (sent !== null && sent !== i)} onClick={() => buy(i)}>
                    {sent === i ? <IconCheckmark1 size={16} /> : <IconBubble2 size={16} />}
                    {sent === i ? 'Sent to Instinct' : 'Let’s buy this'}
                  </button>
                </div>
              ))}
            </div>
            <h2 className={styles.heading}>Good to know</h2>
            <p className={styles.body}>{products.map((p, i) => `#${i + 1} ${p.merchant} ${roles[i].why}.`).join(' ')}</p>
            <p className={styles.body}>
              Prices move around. The ones here are live at each store, and I check the total again before anything is charged.
            </p>
            <div className={styles.note}>
              <strong>Shipping</strong>
              <p>
                {products
                  .map((p) => p.merchant)
                  .join(', ')
                  .replace(/, ([^,]*)$/, ' and $1')}{' '}
                ship in 2 to 5 business days from their own US stores. Standard shipping is in the price.
              </p>
            </div>
            <p className={styles.foot}>
              Prices and stock checked {date} at each linked store. Nothing is ordered from this page; the buy button starts checkout with me and I
              confirm the total with you first.
            </p>
          </article>
        </div>
      </div>
    </Safari>
  );
}
