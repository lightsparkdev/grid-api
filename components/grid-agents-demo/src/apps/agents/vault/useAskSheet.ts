import { useEffect, useState } from 'react';
import type { AgentAsk, Message } from '../conversation';
import { useKeptAsk } from '../openSheets';

/**
 * Which ask a vault sheet is open for. A request that's been answered or replaced (another tile) takes its
 * sheet with it. With `owns` (which requests this sheet answers), it stays open across an app switch.
 */
export function useAskSheet(messages: Message[], owns?: (ask: AgentAsk) => boolean) {
  const kept = useKeptAsk('ask', messages, owns);
  const [ask, setAsk] = useState<{ id: number; ask: AgentAsk } | null>(kept.initial);
  const [shown, setShown] = useState(!!kept.initial);
  const live = !!ask && messages.some((m) => m.kind === 'ask' && m.id === ask.id && m.state === 'open');
  useEffect(() => {
    if (shown && !live) {
      setShown(false);
      kept.release(ask?.id);
    }
  }, [shown, live]);
  return {
    ask: ask?.ask ?? null,
    /** Keys a fresh flow per ask. */
    id: ask?.id ?? 0,
    open: shown && live,
    show: (id: number, next: AgentAsk) => {
      setAsk({ id, ask: next });
      setShown(true);
      kept.keep(id);
    },
    hide: () => {
      setShown(false);
      kept.release(ask?.id);
    },
  };
}
