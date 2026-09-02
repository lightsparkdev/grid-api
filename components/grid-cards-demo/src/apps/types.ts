import type { ComponentType } from 'react';
import type { MoneySheet, WalletHome } from '@/apps/shared/wallet';

/** Contract every skin's wallet screen implements. The wallet + money-sheet
 *  brains are hosted ABOVE the skin (WalletHost) so their state survives skin
 *  switches — the view just reads them and renders. */
export interface SkinWalletScreenProps {
  /** The persistent wallet brain (balance, activity, sheets, card/tap state). */
  home: WalletHome;
  /** The persistent money-sheet brain (step machine, banks, amounts, FX). */
  money: MoneySheet;
  /** One-shot entrance stagger on first mount. */
  entrance?: boolean;
  /** This wallet view mounted because of a SKIN SWITCH. Skins whose entrance
   *  pre-plays the home stagger elsewhere use this to still cascade in on a
   *  platform change. */
  switchedIn?: boolean;
  /** A virtual card finished issuing on the phone — log the issue call. */
  onCardIssued?: () => void;
}

export type SkinWalletScreen = ComponentType<SkinWalletScreenProps>;
