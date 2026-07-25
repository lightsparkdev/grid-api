export interface WebhookEvent {
  id?: string;
  type?: string;
  timestamp?: string;
  data?: unknown;
  receivedAt: number;
}

const RING = 50;

/**
 * Live subscribers (the SSE stream at /api/webhooks/stream). Verified events are
 * PUSHED to the panel as they arrive — nothing polls. In-process only, which is
 * all the demo needs: the receiver and the stream run in the same Next server. A
 * multi-instance deployment would need a shared channel (Redis pub/sub) instead.
 */
type Listener = (event: WebhookEvent) => void;

/**
 * Pinned to globalThis, NOT module scope: Next gives each route handler its own
 * module instance (and HMR re-evaluates them), so a module-level Set would leave
 * /api/webhooks publishing into a different registry than /api/webhooks/stream
 * subscribes to — the stream would connect and then stay silent forever.
 */
interface WebhookBus {
  events: WebhookEvent[];
  listeners: Set<Listener>;
}
const globalBus = globalThis as typeof globalThis & { __gridWebhookBus?: WebhookBus };
const bus: WebhookBus = (globalBus.__gridWebhookBus ??= {
  events: [],
  listeners: new Set<Listener>(),
});

export function subscribe(listener: Listener): () => void {
  bus.listeners.add(listener);
  return () => {
    bus.listeners.delete(listener);
  };
}

export function pushEvent(raw: unknown): void {
  const e = raw as { id?: string; type?: string; timestamp?: string; data?: unknown };
  const event: WebhookEvent = {
    id: e.id,
    type: e.type,
    timestamp: e.timestamp,
    data: e.data,
    receivedAt: Date.now(),
  };
  bus.events.push(event);
  if (bus.events.length > RING) bus.events = bus.events.slice(-RING);
  // One broken subscriber must not stop the others, or the 200 back to Grid.
  bus.listeners.forEach((listener) => {
    try {
      listener(event);
    } catch {
      /* ignore */
    }
  });
}

export function listEvents(): WebhookEvent[] {
  return bus.events;
}
export function clearEvents(): void {
  bus.events = [];
}
