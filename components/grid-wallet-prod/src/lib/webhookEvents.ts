export interface WebhookEvent {
  id?: string;
  type?: string;
  timestamp?: string;
  data?: unknown;
  receivedAt: number;
}

const RING = 50;
let events: WebhookEvent[] = [];

export function pushEvent(raw: unknown): void {
  const e = raw as { id?: string; type?: string; timestamp?: string; data?: unknown };
  events.push({ id: e.id, type: e.type, timestamp: e.timestamp, data: e.data, receivedAt: Date.now() });
  if (events.length > RING) events = events.slice(-RING);
}
export function listEvents(): WebhookEvent[] {
  return events;
}
export function clearEvents(): void {
  events = [];
}
