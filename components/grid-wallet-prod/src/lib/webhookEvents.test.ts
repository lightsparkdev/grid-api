import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  pushEvent,
  subscribe,
  eventsSince,
  listEvents,
  listenerCount,
  clearEvents,
} from './webhookEvents';

const delivery = (n: number) => ({
  id: `Webhook:${n}`,
  type: 'INCOMING_PAYMENT.COMPLETED',
  data: { n },
});
const latestSeq = () => listEvents().at(-1)?.seq ?? 0;

describe('webhook bus', () => {
  beforeEach(() => clearEvents());

  // The demo drives ONE hardcoded customer, so every connected panel is watching
  // the same account and must see every delivery — there is no filtering.
  it('delivers each event to every subscriber', () => {
    const a = vi.fn();
    const b = vi.fn();
    const c = vi.fn();
    const stop = [subscribe(a), subscribe(b), subscribe(c)];

    pushEvent(delivery(1));

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    expect(c).toHaveBeenCalledTimes(1);
    expect(a.mock.calls[0][0]).toMatchObject({ id: 'Webhook:1', data: { n: 1 } });
    stop.forEach((s) => s());
  });

  it('keeps delivering to the rest after one subscriber leaves', () => {
    const stays = vi.fn();
    const leaves = vi.fn();
    const stopStays = subscribe(stays);
    subscribe(leaves)();

    pushEvent(delivery(1));

    expect(stays).toHaveBeenCalledTimes(1);
    expect(leaves).not.toHaveBeenCalled();
    stopStays();
  });

  // A subscriber that throws must not stop the others, or the 200 back to Grid.
  it('survives a broken subscriber', () => {
    const after = vi.fn();
    const stop = [
      subscribe(() => {
        throw new Error('boom');
      }),
      subscribe(after),
    ];

    expect(() => pushEvent(delivery(1))).not.toThrow();
    expect(after).toHaveBeenCalledTimes(1);
    stop.forEach((s) => s());
  });

  it('counts live subscribers', () => {
    const before = listenerCount();
    const stop = subscribe(() => {});
    expect(listenerCount()).toBe(before + 1);
    stop();
    expect(listenerCount()).toBe(before);
  });

  describe('replay window', () => {
    it('stamps each event with an increasing seq', () => {
      pushEvent(delivery(1));
      pushEvent(delivery(2));
      const [first, second] = listEvents().slice(-2);
      expect(second.seq).toBeGreaterThan(first.seq);
    });

    // What a reconnecting client asks for with Last-Event-ID.
    it('returns only the events after the one a client last saw', () => {
      pushEvent(delivery(1));
      const afterFirst = latestSeq();
      pushEvent(delivery(2));
      pushEvent(delivery(3));

      expect(eventsSince(afterFirst).map((e) => (e.data as { n: number }).n)).toEqual([2, 3]);
    });

    it('returns nothing when the client is already current', () => {
      pushEvent(delivery(1));
      expect(eventsSince(latestSeq())).toEqual([]);
    });

    // seq 0 is "I have seen nothing" — a client that presents it gets the buffer.
    it('replays everything buffered for seq 0', () => {
      pushEvent(delivery(1));
      pushEvent(delivery(2));
      expect(eventsSince(0)).toHaveLength(2);
    });

    it('drops the oldest beyond the ring, so a long-gone client loses the overflow', () => {
      for (let n = 1; n <= 55; n++) pushEvent(delivery(n));
      const kept = listEvents();
      expect(kept).toHaveLength(50);
      expect((kept[0].data as { n: number }).n).toBe(6);
      expect(eventsSince(0)).toHaveLength(50);
    });
  });
});
