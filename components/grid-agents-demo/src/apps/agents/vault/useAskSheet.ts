import { useEffect, useState } from 'react';
import type { AgentAsk, Message } from '../conversation';

/**
 * Which ask a vault sheet is open for. A request that's been answered or replaced (another tile) takes its
 * sheet with it.
 */
export function useAskSheet(messages: Message[]) {
  const [ask, setAsk] = useState<{ id: number; ask: AgentAsk } | null>(null);
  const [shown, setShown] = useState(false);
  const live = !!ask && messages.some((m) => m.kind === 'ask' && m.id === ask.id && m.state === 'open');
  useEffect(() => {
    if (shown && !live) setShown(false);
  }, [shown, live]);
  return {
    ask: ask?.ask ?? null,
    /** Keys a fresh flow per ask. */
    id: ask?.id ?? 0,
    open: shown && live,
    show: (id: number, next: AgentAsk) => {
      setAsk({ id, ask: next });
      setShown(true);
    },
    hide: () => setShown(false),
  };
}
