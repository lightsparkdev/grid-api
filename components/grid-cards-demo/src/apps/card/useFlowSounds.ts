import { useEffect, useRef } from 'react';
import type { CardHome } from '@/apps/shared/card';
import { play } from '@/lib/sounds';

/**
 * The phone's flow moments, as sounds: a tap-to-pay approved (the Apple Pay
 * chime, as the Done check lands), the card added to Apple Wallet (as
 * Apple's check lands), and a push notification arriving. Each fires on the
 * change into the moment, so a re-render inside it is silent. The card's
 * own moments (issued, locked, closed, the reveal, the decline) play from
 * the stage, next to the card.
 */
export function useFlowSounds(home: Pick<CardHome, 'tapPhase' | 'notice' | 'card'>) {
  const { tapPhase, notice } = home;
  const { walletPhase } = home.card;

  const lastTap = useRef(tapPhase);
  useEffect(() => {
    if (tapPhase === 'done' && lastTap.current !== 'done') play('approved');
    lastTap.current = tapPhase;
  }, [tapPhase]);

  const lastWallet = useRef(walletPhase);
  useEffect(() => {
    if (walletPhase === 'added' && lastWallet.current !== 'added') play('success');
    lastWallet.current = walletPhase;
  }, [walletPhase]);

  const lastNotice = useRef(notice?.id);
  useEffect(() => {
    if (notice && notice.id !== lastNotice.current) play('notify');
    lastNotice.current = notice?.id;
  }, [notice]);
}
