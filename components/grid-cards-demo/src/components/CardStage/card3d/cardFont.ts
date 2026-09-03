/**
 * The typeface the card faces are painted with.
 *
 * Canvas 2D has no `font-feature-settings`, so the single-story "a" the Figma
 * spec asks for ('"ss01" 1, "salt" 1') can't be requested at `fillText` time.
 * The CSS Font Loading API can bake it in instead: a `FontFace` registered
 * with `featureSettings` applies those features to every glyph run drawn with
 * that family, canvas included.
 *
 * The source is the Lightspark Suisse Intl variable build (suisse-vf repo),
 * one woff2 covering wght 100–900. That build already ships the single-story
 * "a" as the default glyph, so the feature settings are belt-and-braces: they
 * keep the face correct if the file is ever swapped back to the foundry
 * statics, where ss01/salt are what select the alternate.
 *
 * Registered under its own family name so it never collides with the
 * `'Suisse Intl'` faces the rest of the app declares in CSS.
 */

export const CARD_FONT_FAMILY = 'Suisse Intl Card';

const CARD_FONT_URL = '/fonts/SuisseIntlVF.woff2';
const CARD_FONT_FEATURES = '"ss01" 1, "salt" 1';

let fontPromise: Promise<void> | null = null;

/**
 * Registers the card face(s) with `document.fonts` and resolves once they are
 * loaded. Runs once per page; resolves (never rejects) if the font can't be
 * loaded so face painting falls through to the browser's fallback.
 */
export function loadCardFont(): Promise<void> {
  if (!fontPromise) {
    fontPromise =
      typeof document === 'undefined' || typeof FontFace === 'undefined' || !('fonts' in document)
        ? Promise.resolve()
        : registerCardFont().catch(() => undefined);
  }
  return fontPromise;
}

async function registerCardFont(): Promise<void> {
  const face = new FontFace(CARD_FONT_FAMILY, `url(${CARD_FONT_URL}) format("woff2")`, {
    featureSettings: CARD_FONT_FEATURES,
    weight: '100 900',
    style: 'normal',
    display: 'swap',
  });
  document.fonts.add(face);
  await face.load();
}
