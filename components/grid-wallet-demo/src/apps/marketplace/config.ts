/** Marketplace (travel-stays platform) — an Airbnb-style skin. Brand + copy live
 *  here; the layouts live in MarketplaceAuthScreen / MarketplaceWalletScreen.
 *  Re-brand by changing BRAND alone; code identifiers stay category-named
 *  (marketplace). */
export const BRAND = 'Waterbnb';

/** Slide duration (s) for the marketplace's iOS pageSheet presentation. Shared
 *  by the auth sheet's mount slide and the PresentationStage scale-back so the
 *  two move in lockstep — the sync the stacked effect depends on. */
export const MARKETPLACE_SHEET_DURATION = 0.5;

/** Auth sheet copy. */
export const MARKETPLACE_AUTH = {
  heading: 'Log in or sign up',
  creating: 'Creating your account\u2026',
};
