'use client';

import clsx from 'clsx';
import { IconShareOs } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconShareOs';
import { pressable } from '@/lib/sounds';
import styles from './StageShareButton.module.scss';

interface StageShareButtonProps {
  /** The card is floating alone (the button goes with the phone). */
  visible: boolean;
  onClick: () => void;
}

/** Share, on the stage under the floating card: the developer's control,
 *  beside the card as an object, not on the cardholder's phone. */
export function StageShareButton({ visible, onClick }: StageShareButtonProps) {
  return (
    <div className={clsx(styles.root, !visible && styles.hidden)} aria-hidden={!visible}>
      <button type="button" className={styles.button} tabIndex={visible ? 0 : -1} {...pressable({ onClick })}>
        <IconShareOs size={15} aria-hidden />
        Share
      </button>
    </div>
  );
}
