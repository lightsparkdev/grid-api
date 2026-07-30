export interface WebhookEvent {
  /** Monotonic per-process sequence — the SSE `id:` field, so a reconnecting
   *  client can ask for everything after the last one it saw. */
  seq: number;
  id?: string;
  type?: string;
  timestamp?: string;
  data?: unknown;
  receivedAt: number;
}

const RING = 50;

/**
 * Live subscribers (the SSE stream at /api/webhooks/stream). Verified events are
 * PUSHED to every connected client as they arrive — nothing polls. The demo drives
 * ONE hardcoded customer, so every connected panel is looking at the same account
 * and every one of them should see every delivery; there is deliberately no
 * per-client filtering.
 *
 * In-process only, which is all the demo needs: the receiver and the stream run in
 * the same Next server. A multi-instance deployment would need a shared channel
 * (Redis pub/sub) — with replicas, only the instance that received a delivery can
 * fan it out to its own clients.
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
  seq: number;
}
const globalBus = globalThis as typeof globalThis & { __gridWebhookBus?: WebhookBus };
const bus: WebhookBus = (globalBus.__gridWebhookBus ??= {
  events: [],
  listeners: new Set<Listener>(),
  seq: 0,
});

export function subscribe(listener: Listener): () => void {
  bus.listeners.add(listener);
  return () => {
    bus.listeners.delete(listener);
  };
}

/** How many clients are currently listening (surfaced for diagnostics). */
export function listenerCount(): number {
  return bus.listeners.size;
}

/**
 * Deliveries this client missed. EventSource reconnects on its own after a network
 * blip and sends `Last-Event-ID`; without a replay, anything that landed during the
 * gap would be lost silently. Empty when the client has seen everything (and for a
 * fresh connection, which sends no id — a new panel starts from now rather than
 * replaying history as if it just arrived).
 */
export function eventsSince(lastSeq: number): WebhookEvent[] {
  return bus.events.filter((e) => e.seq > lastSeq);
}

export function pushEvent(raw: unknown): void {
  const e = raw as { id?: string; type?: string; timestamp?: string; data?: unknown };
  const event: WebhookEvent = {
    seq: ++bus.seq,
    id: e.id,
    type: e.type,
    timestamp: e.timestamp,
    data: e.data,
    receivedAt: Date.now(),
  };
  bus.events.push(event);
  if (bus.events.length > RING) bus.events = bus.events.slice(-RING);
  // Every connected client gets it. One broken subscriber must not stop the
  // others, or the 200 back to Grid.
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
