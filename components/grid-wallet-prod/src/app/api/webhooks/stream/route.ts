import { eventsSince, listenerCount, subscribe, type WebhookEvent } from '@/lib/webhookEvents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Comment frames keep proxies (and ngrok) from closing an idle stream. */
const KEEPALIVE_MS = 15_000;

/**
 * Server-sent events: every webhook that passes signature verification is pushed
 * to EVERY connected panel as it lands. The demo drives one hardcoded customer, so
 * all clients are watching the same account and all of them get every delivery.
 * One-way and text-only, so it survives the ngrok tunnel a real Grid webhook
 * arrives through — no polling, no client timers, and the panel shows the event at
 * the moment Grid delivers it.
 *
 * Each frame carries an `id:` (a per-process sequence). EventSource echoes the last
 * one back as `Last-Event-ID` when it reconnects, and anything that landed during
 * the gap is replayed — so a blip doesn't silently drop deliveries.
 */
export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | undefined;
  let keepalive: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: WebhookEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`id: ${event.seq}\ndata: ${JSON.stringify(event)}\n\n`),
          );
        } catch {
          // Client vanished between the push and the enqueue — drop it.
        }
      };
      // An opening comment flushes headers so EventSource fires `open`. The count
      // is a comment (ignored by EventSource) and shows in `curl -N` when checking
      // that every panel is attached.
      controller.enqueue(encoder.encode(`: connected clients=${listenerCount() + 1}\n\n`));

      // Catch-up must neither GAP nor DUPLICATE, which rules out both naive
      // orderings: replay-then-subscribe loses whatever lands in between, and
      // subscribe-then-replay sends that same event twice (live, then again from
      // the backlog). So: subscribe immediately but HOLD live events, replay the
      // backlog, then flush the held ones that the replay didn't already cover.
      let holding = true;
      const held: WebhookEvent[] = [];
      unsubscribe = subscribe((event) => {
        if (holding) held.push(event);
        else send(event);
      });
      const lastSeen = Number.parseInt(req.headers.get('last-event-id') ?? '', 10);
      let replayedThrough = Number.isFinite(lastSeen) ? lastSeen : 0;
      if (Number.isFinite(lastSeen)) {
        for (const missed of eventsSince(lastSeen)) {
          send(missed);
          replayedThrough = missed.seq;
        }
      }
      holding = false;
      for (const event of held) {
        if (event.seq > replayedThrough) send(event);
      }
      keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch {
          /* closing */
        }
      }, KEEPALIVE_MS);
      // Tab closed / navigated away.
      req.signal.addEventListener('abort', () => {
        unsubscribe?.();
        if (keepalive) clearInterval(keepalive);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
    cancel() {
      unsubscribe?.();
      if (keepalive) clearInterval(keepalive);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Nginx-style proxies buffer by default, which would stall the stream.
      'X-Accel-Buffering': 'no',
    },
  });
}
