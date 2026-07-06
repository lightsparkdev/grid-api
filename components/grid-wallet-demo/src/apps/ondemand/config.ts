/** On-demand (rides + delivery platform) — an Uber-style skin. Brand + copy
 *  live here; the layouts live in OndemandAuthScreen / OndemandWalletScreen.
 *  Re-brand by changing BRAND alone; code identifiers stay category-named
 *  (ondemand). */
export const BRAND = 'Super';

/** Slide duration (s) for the ondemand full-screen auth pushes. */
export const ONDEMAND_SHEET_DURATION = 0.5;

/** iOS navigation-push duration (s) — the deposit page's slide-over and the
 *  wallet's parallax shift underneath share it so they move in lockstep. */
export const ONDEMAND_PUSH_DURATION = 0.4;

/** How far (px) the wallet slides left behind an incoming pushed page (~30% of
 *  the 402px screen — the iOS nav-stack parallax). */
export const ONDEMAND_PUSH_PARALLAX = 120;

/** Auth copy. */
export const ONDEMAND_AUTH = {
  heading: `Get going with ${BRAND}`,
  creating: 'Signing you in\u2026',
};
