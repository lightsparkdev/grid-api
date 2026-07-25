'use client';

import { useEffect, useRef } from 'react';
import type { WebhookEvent } from '@/lib/webhookEvents';

/**
 * Subscribes to /api/webhooks/stream and hands each verified webhook to `onEvent`
 * as it arrives. EventSource reconnects on its own if the tunnel or dev server
 * blips, so there's no retry logic here.
 */
export function useWebhookStream(onEvent: (event: WebhookEvent) => void): void {
  // Keep the latest callback without resubscribing (a new EventSource per render
  // would drop events mid-flight).
  const handler = useRef(onEvent);
  handler.current = onEvent;

  useEffect(() => {
    if (typeof window === 'undefined' || !('EventSource' in window)) return;
    const source = new EventSource('/api/webhooks/stream');
    source.onmessage = (e) => {
      try {
        handler.current(JSON.parse(e.data) as WebhookEvent);
      } catch {
        // A frame we can't parse isn't worth breaking the stream over.
      }
    };
    source.onerror = () => {
      // EventSource retries by itself; nothing to do but let it.
    };
    return () => source.close();
  }, []);
}
