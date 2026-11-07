/** Playground layout constants shared by the pre-paint boot script
 *  (layout.tsx), the live listeners (page.tsx, useColumnResize), and —
 *  by convention, since SCSS can't import TS — the stylesheet twins in
 *  styles/breakpoints.scss. Change them together. */

/** Stacked ⇄ 3-col threshold. Twin: $breakpoint-layout-wide. */
export const LAYOUT_WIDE_PX = 1600;

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
