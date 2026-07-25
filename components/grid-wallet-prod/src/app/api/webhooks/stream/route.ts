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
/**
 * Refuse a subscription initiated by ANOTHER site. Browsers set Sec-Fetch-Site on
 * EventSource requests, so a page on evil.example can't quietly attach to a panel
 * running on your machine. It is deliberately narrow: only an explicit
 * `cross-site` is rejected, so `curl -N` and the verification scripts (which send
 * no such header) still work.
 *
 * This is NOT access control. The stream carries whatever Grid delivered —
 * transaction ids, amounts, and `counterpartyInformation`, which per Grid's schema
 * can include a counterparty's name, birth date and nationality — and anyone who
 * can reach the host can read it. Behind a tunnel, that's anyone with the URL.
 * Gating it properly (a session cookie, or not exposing it beyond localhost) is a
 * pre-prod requirement, tracked alongside proxy customer-scoping.
 */
function crossSite(req: Request): boolean {
  return req.headers.get('sec-fetch-site') === 'cross-site';
}

export async function GET(req: Request) {
  if (crossSite(req)) {
    return new Response('cross-site subscription refused', { status: 403 });
  }
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
