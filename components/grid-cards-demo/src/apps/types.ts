import type { CardHome } from '@/apps/shared/card';

/** Props the phone's card face receives. The brain is hosted ABOVE the face
 *  (CardHost) so its state survives re-renders of the view. */
export interface CardScreenProps {
  /** The persistent card brain (issuance, tap state, controls, sheets). */
  home: CardHome;
  /** One-shot entrance stagger on first mount. */
  entrance?: boolean;
}
