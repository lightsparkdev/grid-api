import { subscribe, type WebhookEvent } from '@/lib/webhookEvents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Comment frames keep proxies (and ngrok) from closing an idle stream. */
const KEEPALIVE_MS = 15_000;

/**
 * Server-sent events: every webhook that passes signature verification is pushed
 * to connected panels as it lands. One-way and text-only, so it survives the
 * ngrok tunnel a real Grid webhook arrives through — no polling, no client
 * timers, and the panel shows the event at the moment Grid delivers it.
 */
export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | undefined;
  let keepalive: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: WebhookEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // Client vanished between the push and the enqueue — drop it.
        }
      };
      // An opening comment flushes headers so EventSource fires `open`.
      controller.enqueue(encoder.encode(': connected\n\n'));
      unsubscribe = subscribe(send);
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
