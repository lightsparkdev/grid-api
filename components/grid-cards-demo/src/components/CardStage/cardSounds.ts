import { useEffect, useRef } from 'react';
import { play } from '@/lib/sounds';

/**
 * The flows' card moments, as sounds: the card issued, the lock leaving, the
 * card closed. Each fires on the change, not on mount, so a fast-forwarded
 * or reset card is silent. The lock seating and the decline shake are played
 * where they happen (the lock's impact callback, `motion.shake()`), and the
 * card's turns (a drag, the reveal) are the airflow voice in the frame
 * loop, so they stay in sync.
 */
export function useCardMomentSounds(state: { issued: boolean; issuing: boolean; frozen: boolean; closed: boolean }) {
  const { issued, issuing, frozen, closed } = state;

  // Issued: only at the end of an issuance, not a provisioned card.
  const wasIssuing = useRef(issuing);
  useEffect(() => {
    if (wasIssuing.current && issued && !issuing) play('issued');
    wasIssuing.current = issuing;
  }, [issued, issuing]);

  // Unlock: the shackle lifts out as the flag drops.
  const wasFrozen = useRef(frozen);
  useEffect(() => {
    if (wasFrozen.current && !frozen && !closed) play('unlock');
    wasFrozen.current = frozen;
  }, [frozen, closed]);

  // Closed: the line comes up over the card.
  const wasClosed = useRef(closed);
  useEffect(() => {
    if (!wasClosed.current && closed) play('pressLow');
    wasClosed.current = closed;
  }, [closed]);
}
