/* The new brands, one per icon in the Figma strip (Social 2025-26, node
   2921:13229), each a card in its own visual language. The marks are the
   strip's fake glyphs (glyphs.json); the art is composed per brand
   (art.ts). Nothing prints a name.

   Spec px throughout: 1536 × 963 flat, 963 × 1536 upright. Flat, the chip
   sits at x 172–369, y 334–483 and a front Visa mark at x 1143–1482,
   y 698–909; upright, the chip is at x 480–629, y 172–369.

   Variety, by design: no two neighbors in ORDER share a layout idea, a
   material, and a color family. The layout ideas: an oversized bleeding
   mark (cash, pop), a pattern field (base, venmo, cross, coin), an
   illustration or scene (bread, market, road, map, parcel, gingham, video,
   box, denim), a gradient or mesh (ghost, camera, wallet), a graphic split
   or burst (kalshi, live, spark, speed), data as art (sound, poly, fomo,
   eq), editorial (patron), and bare steel (openai-like, goat-like). */

import type { BrandLayout } from '@/data/design';
import type { PresetDesign } from '@/data/presets';
import * as art from './art';
import { mark } from './svg';

export interface NewBrand {
  id: string;
  /** The Figma layer the mark came from. */
  figma: string;
  design: PresetDesign;
  /** The art, as SVG, rasterized before use. */
  art?: () => string;
}

const at = (x: number, y: number, h: number, anchor: BrandLayout['anchor'] = 'center', opacity = 1): BrandLayout => ({
  x,
  y,
  h,
  anchor,
  rotation: 0,
  opacity,
});

const base: PresetDesign = {
  programName: '',
  material: 'plastic',
  finish: 'matte',
  color: '#000000',
  gradient: null,
  logoUrl: null,
  logoTreatment: 'print',
  brandLayout: null,
  brandHidden: false,
  backgroundUrl: null,
  artTreatment: 'print',
  artLayout: null,
  visaMark: 'back',
  orientation: 'landscape',
};

const card = (d: Partial<PresetDesign>): PresetDesign => ({ ...base, ...d });

const GOLD = '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc95"/><stop offset="0.5" stop-color="#d4a548"/><stop offset="1" stop-color="#9c7124"/></linearGradient>';

export const NEW_BRANDS: NewBrand[] = [
  {
    id: 'feather',
    figma: 'app-icon',
    art: art.featherArt,
    design: card({
      color: '#0b0a08',
      logoUrl: mark('feather', 'url(#g)', GOLD),
      brandLayout: at(1384, 330, 380, 'right'),
      visaMark: 'front',
    }),
  },
  {
    id: 'cash',
    figma: 'app-icon-cashapp',
    art: art.cashArt,
    design: card({ color: '#00d64f', logoUrl: mark('cashapp', '#0a0a0a'), brandLayout: at(152, 170, 150, 'left') }),
  },
  {
    id: 'wallet',
    figma: 'app-icon-wallet',
    art: art.walletArt,
    design: card({
      finish: 'gloss',
      color: '#079a5c',
      logoUrl: mark('wallet', ['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.6)', '#ffffff']),
      brandLayout: at(152, 170, 120, 'left'),
    }),
  },
  {
    id: 'video',
    figma: 'app-icon-youtube',
    art: art.videoArt,
    design: card({ color: '#0f0f0f', logoUrl: mark('youtube', '#ff0033'), brandLayout: at(1060, 400, 300) }),
  },
  {
    id: 'tentacle',
    figma: 'app-icon-kraken',
    art: art.tentacleArt,
    design: card({
      finish: 'gloss',
      color: '#2a0f7a',
      logoUrl: mark('kraken', '#ffffff'),
      brandLayout: at(152, 1360, 180, 'left'),
      orientation: 'portrait',
    }),
  },
  {
    id: 'field',
    figma: 'app-icon-draftkings',
    art: art.fieldArt,
    design: card({ color: '#0c0f0b', logoUrl: mark('draftkings', '#53d337'), brandLayout: at(152, 170, 130, 'left'), visaMark: 'front' }),
  },
  {
    id: 'cloud',
    figma: 'app-icon-soundcloud',
    art: art.soundArt,
    design: card({ color: '#ff5500', logoUrl: mark('soundcloud', '#ffffff'), brandLayout: at(1384, 170, 140, 'right') }),
  },
  {
    id: 'patron',
    figma: 'app-icon-patreon',
    art: art.patronArt,
    design: card({ color: '#f2eee6', brandHidden: true, logoUrl: mark('patreon', '#141414'), orientation: 'portrait' }),
  },
  {
    id: 'circle',
    figma: 'app-icon-base',
    art: art.baseArt,
    design: card({ finish: 'gloss', color: '#0000ff', logoUrl: mark('base', '#ffffff'), brandLayout: at(1384, 300, 200, 'right'), visaMark: 'front' }),
  },
  {
    id: 'coin',
    figma: 'app-icon-coinbase',
    art: art.coinArt,
    design: card({ finish: 'gloss', color: '#0041d9', logoUrl: mark('coinbase', '#ffffff'), brandLayout: at(1180, 480, 240), visaMark: 'front' }),
  },
  {
    id: 'ghost',
    figma: 'app-icon-phantom',
    art: art.ghostArt,
    design: card({
      finish: 'gloss',
      color: '#ab9ff2',
      logoUrl: mark('phantom', '#ffffff'),
      brandLayout: at(481, 820, 440),
      orientation: 'portrait',
    }),
  },
  {
    id: 'poly',
    figma: 'app-icon-polymarket',
    art: art.polyArt,
    design: card({ color: '#ffffff', logoUrl: mark('polymarket', '#2e5cff'), brandLayout: at(152, 170, 130, 'left') }),
  },
  {
    id: 'eq',
    figma: 'app-icon-spotify',
    art: art.eqArt,
    design: card({ color: '#121212', logoUrl: mark('spotify', '#1ed760'), brandLayout: at(110, 270, 170, 'left'), orientation: 'portrait' }),
  },
  {
    id: 'odds',
    figma: 'app-icon-kalshi',
    art: art.kalshiArt,
    design: card({ finish: 'gloss', color: '#09d68f', logoUrl: mark('kalshi', '#ffffff'), brandLayout: at(1384, 408, 200, 'right') }),
  },
  {
    id: 'split',
    figma: 'app-icon-venmo',
    art: art.venmoArt,
    design: card({ color: '#008cff', logoUrl: mark('venmo', '#ffffff'), brandLayout: at(768, 450, 380), visaMark: 'front' }),
  },
  {
    id: 'pay',
    figma: 'app-icon-paypal',
    art: art.payArt,
    design: card({ finish: 'gloss', color: '#05070d', logoUrl: mark('paypal', '#ffffff'), brandLayout: at(152, 170, 90, 'left') }),
  },
  {
    id: 'parcel',
    figma: 'app-icon-ebay',
    art: art.parcelArt,
    design: card({
      color: '#fbfbfd',
      logoUrl: mark('ebay', ['#e53238', '#0064d2', '#f5af02', '#86b817']),
      brandLayout: at(152, 180, 150, 'left'),
    }),
  },
  {
    id: 'note',
    figma: 'app-icon-tiktok',
    art: art.noteArt,
    design: card({
      color: '#010101',
      logoUrl: mark('tiktok', ['#fe2c55', '#25f4ee', '#ffffff']),
      brandLayout: at(481, 780, 560),
      orientation: 'portrait',
    }),
  },
  {
    id: 'market',
    figma: 'app-icon-marketplace',
    art: art.marketArt,
    design: card({ color: '#0866ff', logoUrl: mark('marketplace', '#ffffff'), brandLayout: at(768, 560, 260), visaMark: 'front' }),
  },
  {
    id: 'camera',
    figma: 'app-icon-instagram',
    art: art.cameraArt,
    design: card({
      finish: 'gloss',
      color: '#7a11ff',
      gradient: {
        type: 'linear',
        stops: [
          { at: 0, color: '#7a11ff' },
          { at: 0.28, color: '#f102c9' },
          { at: 0.42, color: '#fe2d20' },
          { at: 0.63, color: '#f26401' },
          { at: 1, color: '#ff0764' },
        ],
        from: { x: 0, y: 0 },
        to: { x: 963, y: 1536 },
      },
      logoUrl: mark('instagram', '#ffffff'),
      // The ring centered on the face as on the icon (its center sits left
      // of and below the mark's box center, the dot being up and right).
      brandLayout: at(557, 851, 530),
      orientation: 'portrait',
    }),
  },
  {
    id: 'road',
    figma: 'app-icon-lyft',
    art: art.roadArt,
    design: card({ finish: 'gloss', color: '#e2009f', logoUrl: mark('lyft', '#ffffff'), brandLayout: at(152, 170, 140, 'left'), visaMark: 'front' }),
  },
  {
    id: 'fomo',
    figma: 'app-icon-fomo',
    art: art.fomoArt,
    design: card({
      color: '#0a0a0c',
      artTreatment: 'spotGloss',
      logoUrl: mark('fomo', '#ffffff'),
      logoTreatment: 'foil',
      brandLayout: at(1384, 300, 220, 'right'),
      visaMark: 'front',
    }),
  },
  {
    id: 'toast',
    figma: 'app-icon-bread',
    art: art.breadArt,
    design: card({ color: '#8a4a18', logoUrl: mark('bread', '#5a2e0e'), brandLayout: at(980, 480, 300) }),
  },
  {
    id: 'live',
    figma: 'app-icon-whatnot',
    art: art.liveArt,
    design: card({ finish: 'gloss', color: '#0d0d0d', logoUrl: mark('whatnot', '#0d0d0d'), brandLayout: at(1150, 400, 170), visaMark: 'front' }),
  },
  {
    id: 'thread',
    figma: 'app-icon-etsy',
    art: art.threadArt,
    design: card({ color: '#efe4cf', logoUrl: mark('etsy', '#f1641e'), brandLayout: at(1180, 440, 380) }),
  },
  {
    id: 'pop',
    figma: 'app-icon-depop',
    art: art.popArt,
    design: card({ color: '#ff2300', logoUrl: mark('depop', '#ffffff'), brandLayout: at(-170, 1160, 1000, 'left'), orientation: 'portrait' }),
  },
  {
    id: 'cross',
    figma: 'app-icon-stockx',
    art: art.crossArt,
    design: card({
      color: '#006340',
      artTreatment: 'spotGloss',
      logoUrl: mark('stockx', '#ffffff'),
      logoTreatment: 'foil',
      brandLayout: at(1384, 408, 260, 'right'),
    }),
  },
  {
    id: 'goat',
    figma: 'app-icon-goat',
    design: card({
      material: 'metal',
      color: null,
      logoUrl: mark('goat', '#111111'),
      logoTreatment: 'spotGloss',
      brandLayout: at(152, 1376, 150, 'left'),
      visaMark: 'front',
      orientation: 'portrait',
    }),
  },
  {
    id: 'denim',
    figma: 'app-icon-grailed',
    art: art.denimArt,
    design: card({ color: '#1a2b4c', logoUrl: mark('grailed', '#ffffff'), brandLayout: at(1384, 360, 200, 'right'), visaMark: 'front' }),
  },
  {
    id: 'speed',
    figma: 'app-icon-whop',
    art: art.speedArt,
    design: card({ finish: 'gloss', color: '#fa4616', logoUrl: mark('whop', '#ffffff'), brandLayout: at(1384, 408, 130, 'right') }),
  },
  {
    id: 'box',
    figma: 'app-icon-amazon',
    art: art.boxArt,
    design: card({ color: '#c9965b', logoUrl: mark('amazon', '#232f3e'), brandLayout: { ...at(1095, 182, 118), rotation: 3 } }),
  },
  {
    id: 'claw',
    figma: 'app-icon-openclaw',
    art: art.clawArt,
    design: card({
      color: '#11143a',
      logoUrl: mark('openclaw', ['#e5484d', '#e5484d', '#3ee6c8']),
      brandLayout: at(481, 860, 520),
      visaMark: 'front',
      orientation: 'portrait',
    }),
  },
  {
    id: 'courier',
    figma: 'app-icon-postmates',
    art: art.mapArt,
    design: card({ color: '#f4f4f2', logoUrl: mark('postmates', '#111111'), brandLayout: at(152, 800, 150, 'left') }),
  },
  {
    id: 'dash',
    figma: 'app-icon-doordash',
    art: art.dashArt,
    design: card({ finish: 'gloss', color: '#ff3008', logoUrl: mark('doordash', '#ffffff'), brandLayout: at(1384, 400, 170, 'right'), visaMark: 'front' }),
  },
  {
    id: 'table',
    figma: 'app-icon-grubhub',
    art: art.ginghamArt,
    design: card({ color: '#fff4e8', logoUrl: mark('grubhub', '#ff8000'), brandLayout: at(481, 900, 380), orientation: 'portrait' }),
  },
  {
    id: 'blossom',
    figma: 'app-icon-openai',
    design: card({
      material: 'metal',
      finish: 'gloss',
      color: null,
      logoUrl: mark('openai', '#111111'),
      logoTreatment: 'etch',
      brandLayout: at(1000, 420, 560),
      visaMark: 'front',
    }),
  },
  {
    id: 'spark',
    figma: 'app-icon-claude',
    art: art.sparkArt,
    design: card({ color: '#f0eee6', logoUrl: mark('claude', '#d97757'), brandLayout: at(152, 190, 170, 'left') }),
  },
];

/** The new brands whose fronts the reel shows. Every other new brand only
 *  appears while the card's back faces the camera; the playground's presets
 *  show their fronts (they close the cycle on the settled card). */
export const FRONT_SHOWN = new Set([
  'ghost', 'road', 'cloud', 'fomo', 'camera', 'field', 'poly', 'note', 'cash', 'coin', 'eq', 'pop', 'dash', 'patron', 'parcel',
]);

/** The show order: the new brands with the upright ones woven through,
 *  then the playground's six presets as the cycle slows onto the settled
 *  card, the Z steel card last before "Your brand". (With the timeline's
 *  grouped roll, the upright cards are pulled into one run instead.) */
export const ORDER = [
  'feather', 'cash', 'note', 'split', 'toast', 'road', 'ghost', 'poly', 'field', 'cloud', 'camera', 'coin', 'thread',
  'fomo', 'tentacle', 'dash', 'blossom', 'wallet', 'eq', 'live', 'box', 'circle', 'pop', 'spark', 'pay', 'speed', 'claw',
  'denim', 'parcel', 'odds', 'table', 'market', 'video', 'courier', 'patron', 'cross', 'goat',
  'preset-finance', 'preset-creator', 'preset-marketplace', 'preset-messaging', 'preset-ondemand', 'preset-social',
];
