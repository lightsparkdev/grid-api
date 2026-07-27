/** Playground layout constants shared by the pre-paint boot script
 *  (layout.tsx), the live listeners (page.tsx, useColumnResize), and —
 *  by convention, since SCSS can't import TS — the stylesheet twins in
 *  styles/breakpoints.scss. Change them together. */

/** Stacked ⇄ 3-col threshold. Twin: $breakpoint-layout-wide. */
export const LAYOUT_WIDE_PX = 1600;

/** Configure column width. Twin: $layout-laptop-config-width. */
export const CONFIGURE_COL_PX = 400;
