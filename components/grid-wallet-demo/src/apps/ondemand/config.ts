/** On-demand (rides + delivery platform) — an Uber-style skin. Brand + copy
 *  live here; the layouts live in OndemandAuthScreen / OndemandWalletScreen.
 *  Re-brand by changing BRAND alone; code identifiers stay category-named
 *  (ondemand). */
export const BRAND = 'Super';

/** Slide duration (s) for the ondemand full-screen auth pushes. */
export const ONDEMAND_SHEET_DURATION = 0.5;

/** iOS navigation-push duration (s) — screens WITHIN a flow push with it
 *  (home → flow presents as a slide-up instead; see ONDEMAND_SHEET_DURATION). */
export const ONDEMAND_PUSH_DURATION = 0.4;

/** How far (px) an under-layer slides left behind an incoming pushed step
 *  (~30% of the 402px screen — the iOS nav-stack parallax, in-flow only). */
export const ONDEMAND_PUSH_PARALLAX = 120;

/** Auth copy. */
export const ONDEMAND_AUTH = {
  heading: `Get going with ${BRAND}`,
  creating: 'Signing you in\u2026',
};
