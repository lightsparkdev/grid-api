/** Playground layout constants shared by the pre-paint boot script
 *  (layout.tsx), the live listeners (page.tsx, useColumnResize), and —
 *  by convention, since SCSS can't import TS — the stylesheet twins in
 *  styles/breakpoints.scss. Change them together. */

/** The docs sidebar expanded, its default: what the layout assumes standalone. */
export const DOCS_SIDEBAR_EXPANDED_PX = 280;

/** Stacked ⇄ 3-col threshold beside the expanded docs sidebar. */
export const LAYOUT_WIDE_PX = 1600;

/** Configure column width. Twin: $layout-laptop-config-width. */
export const CONFIGURE_COL_PX = 400;

/** The app column with the phone at full size and its inset (434 + 16 each side). */
export const APP_COL_FULL_PX = 466;

/** Docs sidebar widths at or below this read as "collapsed to the rail".
 *  The embed reports the live width (?nav on boot, nav-sync after): 48px
 *  for the collapsed rail (--ls-nav-rail-w in mintlify/style.css), 280–420px
 *  expanded (MIN_WIDTH..MAX_WIDTH in mintlify/sidebar-toggle.js). Anything
 *  in between never occurs, so the midpoint is a safe cut. */
export const NAV_COLLAPSED_MAX_PX = 160;

/**
 * The narrowest app column the tight 3 columns start at. Less than the phone at full size: on a laptop the phone is
 * fitted to the frame's height long before its width (a 14" shows it ~312px wide), and side by side it still comes
 * out larger than stacked, where the API panel's peek takes height from it.
 */
export const APP_COL_TIGHT_PX = 360;

/**
 * The frame width where the tight 3 columns fit: the phone between two configure-width columns. 1160, so beside the
 * expanded sidebar a 1440px window gets them, with slack under a MacBook Pro 14" (1512) for browsers that frame the
 * page (Arc takes ~16px).
 */
export const LAYOUT_TIGHT_PX = CONFIGURE_COL_PX * 2 + APP_COL_TIGHT_PX;

/** Where 3 columns fit with the API column at its default (sidebar + configure): 1600 expanded, 1368 collapsed. */
const fullAt = (sidebar: number) => LAYOUT_WIDE_PX - DOCS_SIDEBAR_EXPANDED_PX + sidebar;

/**
 * Where stacked flips to 3 columns (Configure 400 | App | API) beside a docs sidebar this wide: room for the phone at
 * full size next to the API column. Collapsed to the rail, that's the API column at its default: 1368, so a MacBook
 * Pro 14" (a 1464px embed) gets 3 columns. Beside an expanded sidebar the API column may go tight, down to the
 * configure column's width: 1160, so a MacBook Pro 16" (a 1448px embed) and a 14" (1232px) get 3 columns with the
 * sidebar open.
 */
export const wideAt = (sidebar = DOCS_SIDEBAR_EXPANDED_PX) =>
  sidebar <= NAV_COLLAPSED_MAX_PX ? fullAt(sidebar) : Math.min(fullAt(sidebar), LAYOUT_TIGHT_PX);

/** The html[data-layout] value for a frame this wide beside a docs sidebar this wide. */
export const layoutFor = (width: number, sidebar?: number) => (width < wideAt(sidebar) ? 'stacked' : 'wide');

/**
 * Whether the 3 columns are the tight ones (html[data-tight]): the API column at the configure column's width, and
 * the panels in the stacked layout's colors rather than the docs-chrome gray.
 */
export const isTight = (width: number, sidebar = DOCS_SIDEBAR_EXPANDED_PX) => width >= wideAt(sidebar) && width < fullAt(sidebar);

/** The html[data-nav] value for a reported docs sidebar width. Set by the
 *  pre-paint boot script (layout.tsx) and kept live by the nav-sync listener
 *  (useColumnResize) so the stylesheet can key chrome on the sidebar state. */
export function navState(sidebarWidth: number): 'collapsed' | 'expanded' {
  return sidebarWidth <= NAV_COLLAPSED_MAX_PX ? 'collapsed' : 'expanded';
}
