import type { CardHome } from '@/apps/shared/card';

/** Props the phone's card face receives. The brain is hosted above the phone
 *  (AppPanel) so the stage card and the phone render from the same state. */
export interface CardScreenProps {
  home: CardHome;
  /** The card is inside the phone (Issue): render the slot it lands in. Otherwise
   *  the card is on the stage and the phone shows a summary row. */
  cardOnPhone?: boolean;
}
