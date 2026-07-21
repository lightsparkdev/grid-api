/** Marketplace (travel-stays platform) — an Airbnb-style skin. Brand + copy live
 *  here; the layouts live in MarketplaceAuthScreen / MarketplaceWalletScreen.
 *  Re-brand by changing BRAND alone; code identifiers stay category-named
 *  (marketplace). */
export const BRAND = 'Waterbnb';

/** Slide duration (s) for the marketplace's iOS pageSheet presentation. Shared
 *  by the auth sheet's mount slide and the PresentationStage scale-back so the
 *  two move in lockstep — the sync the stacked effect depends on. */
export const MARKETPLACE_SHEET_DURATION = 0.5;

/** iOS navigation-push duration (s) — the deposit page's slide-over and the
 *  wallet's parallax shift underneath share it so they move in lockstep. */
export const MARKETPLACE_PUSH_DURATION = 0.4;

/** How far (px) the wallet slides left behind an incoming pushed page (~30% of
 *  the 402px screen — the iOS nav-stack parallax). */
export const MARKETPLACE_PUSH_PARALLAX = 120;

/** Auth sheet copy. */
export const MARKETPLACE_AUTH = {
  heading: 'Log in or sign up',
  creating: 'Signing you in\u2026',
};
