import type { CardHome } from '@/apps/shared/card';

/** Props the phone's card face receives. The brain is hosted above the phone
 *  (AppPanel) so the stage card and the phone render from the same state. */
export interface CardScreenProps {
  home: CardHome;
}
