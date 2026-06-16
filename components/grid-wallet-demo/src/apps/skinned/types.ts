import type { ComponentType } from 'react';
import type { AuthMethod, Persona } from '@/data/flow';
import type { AppSkinId } from '@/apps/skins';
import type { WalletListItemData } from '@/apps/aurora/wallet/WalletListItem';

/** central-icons / SfSymbol-compatible glyph component (accepts `size`). */
export type SkinIcon = ComponentType<{ size?: number | string; className?: string }>;

/** Per-skin content + brand strings. Layout/visuals live in the skin's screens +
 *  skin.scss tokens; this is the copy/data they read. */
export interface SkinConfig {
  brand: { name: string; tagline: string; logoSrc: string };
  auth: {
    headline: string;
    subhead: string;
    /** Marquee rows (categories + titles) for the auth hero. */
    marquee: string[][];
  };
  /** Home screen config — drives the reused AuroraWalletScreen's skinnable seams.
   *  Omit for the Aurora-default home (the fintech baseline). */
  home?: SkinHomeConfig;
}

// ── Home skin kit ───────────────────────────────────────────────────────────
// Every field is optional / Aurora-defaulting: with no `home` config the wallet
// screen renders exactly as Aurora. A skin overrides only what its design changes.

/** Which existing wallet flow a hero action button triggers. */
export type SkinActionId = 'add' | 'withdraw' | 'send';

/** A hero action button. `label` omitted → icon-only (like Aurora's Send). */
export interface SkinHomeAction {
  id: SkinActionId;
  label?: string;
  Icon: SkinIcon;
  ariaLabel?: string;
}

/** What a header icon button opens. */
export type SkinHeaderTarget = 'openCard' | 'settings' | 'none';

export interface SkinHeaderButton {
  Icon: SkinIcon;
  ariaLabel: string;
  target?: SkinHeaderTarget;
}

/** Brand-aware home header. With no avatar it falls back to a text title. */
export interface SkinHeaderConfig {
  /** Left avatar image; omit → text title. */
  avatarSrc?: string;
  /** Title text when there's no avatar (default "Wallet"). */
  title?: string;
  /** Right-aligned icon buttons (e.g. settings + card). */
  buttons?: SkinHeaderButton[];
  /** Scroll the header with the content instead of pinning it (default pinned). */
  scroll?: boolean;
}

/** An insight card in the skin's "icon-circle metric" style (Wiggle restyles
 *  both Aurora cards into this). */
export interface SkinInsightCard {
  Icon: SkinIcon;
  /** Circle accent color behind the icon (e.g. green earnings, pink followers). */
  accent: string;
  /** Large metric, e.g. "6%" or "1345". */
  value: string;
  /** Small unit after the value, e.g. "APY". */
  unit?: string;
  /** Bold leading amount in the caption, e.g. "+56". Ignored when `dynamic` is set. */
  captionAmount?: string;
  /** Sub caption, e.g. "followers from last stream". Ignored when `dynamic` is set. */
  caption: string;
  /** Tint the caption positive (green). */
  captionPositive?: boolean;
  /** Drive the caption from a live wallet metric instead of `caption`:
   *  `earnings` → "+$X today" (balance × APY ÷ 365), like the Aurora wallet. */
  dynamic?: 'earnings';
}

export interface SkinTabBarItem {
  Icon: SkinIcon;
  /** Glyph shown when the item is active (e.g. a filled variant); falls back to `Icon`. */
  activeIcon?: SkinIcon;
  label: string;
  active?: boolean;
}

export interface SkinTabBarConfig {
  items: SkinTabBarItem[];
  /** Center floating action button (decorative for v1). */
  fab?: { Icon: SkinIcon; ariaLabel: string };
}

/** Activity row fixture — a WalletListItemData minus the live timestamp, plus a
 *  relative age the screen converts to a timestamp on mount. */
export type SkinActivityFixture = Omit<WalletListItemData, 'timestamp'> & {
  /** Minutes ago, converted to a timestamp at mount (drives "2m ago" labels). */
  agoMinutes: number;
};

export interface SkinActivityConfig {
  /** Filter tabs, e.g. ['All', 'Sent', 'Received']; omit → no tabs (Aurora). */
  tabs?: string[];
  /** Seed rows shown on the home Activity list. */
  fixtures?: SkinActivityFixture[];
}

export interface SkinHomeConfig {
  /** Balance hero label (default "Total balance"). */
  balanceLabel?: string;
  header?: SkinHeaderConfig;
  /** Hero action buttons (default Aurora Add/Withdraw/Send). */
  actions?: SkinHomeAction[];
  /** `wash` paints a solid brand card behind balance + actions (default `plain`). */
  heroStyle?: 'plain' | 'wash';
  /** Both insight cards in the skin's icon-circle metric style; omit → Aurora's
   *  bespoke weekly-activity + earnings pair. */
  insightCards?: [SkinInsightCard, SkinInsightCard];
  /** Issuance background: `aurora` field (default) or a solid brand `wash`. */
  issuanceBg?: 'aurora' | 'wash';
  /** Hide the debit card on the closed home (the balance hero takes the slot);
   *  the card flow is reached from a header button instead. */
  hideHomeCard?: boolean;
  /** Decorative bottom tab bar; omit → none (Aurora). */
  tabBar?: SkinTabBarConfig;
  /** Activity tabs + seed fixtures. */
  activity?: SkinActivityConfig;
}

/** Props every skin's AuthScreen receives (mirrors AuroraAuthScreen + config). */
export interface SkinAuthScreenProps {
  busy?: boolean;
  methods: AuthMethod[];
  dismissed?: boolean;
  leaving?: boolean;
  onSignIn: (method: AuthMethod) => void;
  config: SkinConfig;
}

/** A registry entry = a skin's auth screen + its config. The home is the reused
 *  AuroraWalletScreen, skinned via `config.home`. */
export interface SkinEntry {
  id: AppSkinId;
  persona: Persona;
  config: SkinConfig;
  AuthScreen: ComponentType<SkinAuthScreenProps>;
}
