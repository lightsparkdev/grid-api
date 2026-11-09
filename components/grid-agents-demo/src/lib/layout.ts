/** Playground layout constants shared by the pre-paint boot script
 *  (layout.tsx), the live listeners (page.tsx, useColumnResize), and —
 *  by convention, since SCSS can't import TS — the stylesheet twins in
 *  styles/breakpoints.scss. Change them together. */

/** The docs sidebar expanded, its default: what the layout assumes standalone. */
export const DOCS_SIDEBAR_EXPANDED_PX = 280;

/** Stacked ⇄ 3-col threshold beside the expanded docs sidebar. */
export const LAYOUT_WIDE_PX = 1600;

/**
 * Where stacked flips to 3 columns (Configure 400 | App | API) beside a docs sidebar this wide: room for the phone at
 * full size (~466px) next to the API column at its default (sidebar + configure). 1600 with the sidebar expanded;
 * 1368 collapsed to the rail, so a MacBook Pro 14" (a 1464px embed) gets 3 columns.
 */
export const wideAt = (sidebar = DOCS_SIDEBAR_EXPANDED_PX) => LAYOUT_WIDE_PX - DOCS_SIDEBAR_EXPANDED_PX + sidebar;

/** The html[data-layout] value for a frame this wide beside a docs sidebar this wide. */
export const layoutFor = (width: number, sidebar?: number) => (width < wideAt(sidebar) ? 'stacked' : 'wide');

/** Configure column width. Twin: $layout-laptop-config-width. */
export const CONFIGURE_COL_PX = 400;

/** Docs sidebar widths at or below this read as "collapsed to the rail".
 *  The embed reports the live width (?nav on boot, nav-sync after): 48px
 *  for the collapsed rail (--ls-nav-rail-w in mintlify/style.css), 280–420px
 *  expanded (MIN_WIDTH..MAX_WIDTH in mintlify/sidebar-toggle.js). Anything
 *  in between never occurs, so the midpoint is a safe cut. */
export const NAV_COLLAPSED_MAX_PX = 160;

/** The html[data-nav] value for a reported docs sidebar width. Set by the
 *  pre-paint boot script (layout.tsx) and kept live by the nav-sync listener
 *  (useColumnResize) so the stylesheet can key chrome on the sidebar state. */
export function navState(sidebarWidth: number): 'collapsed' | 'expanded' {
  return sidebarWidth <= NAV_COLLAPSED_MAX_PX ? 'collapsed' : 'expanded';
}
