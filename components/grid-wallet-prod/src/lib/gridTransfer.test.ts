import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gridFetch } from './gridClient';
import {
  findEmbeddedWalletPayload,
  destSignature,
  quoteBodyFor,
  isTerminalStatus,
  isCompletionStatus,
  pollTransaction,
} from './gridTransfer';

vi.mock('./gridClient', () => ({ gridFetch: vi.fn() }));

const mockedFetch = vi.mocked(gridFetch);
const envelope = (status: number, body: unknown) => ({
  request: { method: 'GET' as const, path: '/transactions/Transaction:1', headers: {} },
  response: { status, body },
});
const noopLog = () => {};

describe('gridTransfer pure helpers', () => {
  it('isTerminalStatus recognizes terminal vs in-flight states', () => {
    expect(isTerminalStatus('COMPLETED')).toBe(true);
    expect(isTerminalStatus('FAILED')).toBe(true);
    expect(isTerminalStatus('PROCESSING')).toBe(false);
    expect(isTerminalStatus('PENDING')).toBe(false);
  });
  it('finds the EMBEDDED_WALLET payloadToSign', () => {
    const q = {
      id: 'Quote:1', status: 'PENDING',
      paymentInstructions: [
        { accountOrWalletInfo: { accountType: 'USD_ACCOUNT' } },
        { accountOrWalletInfo: { accountType: 'EMBEDDED_WALLET', payloadToSign: '{"x":1}' } },
      ],
    };
    expect(findEmbeddedWalletPayload(q)).toBe('{"x":1}');
  });
  it('returns null when there is no embedded-wallet instruction', () => {
    expect(findEmbeddedWalletPayload({ id: 'Quote:2', status: 'PENDING', paymentInstructions: [] })).toBeNull();
  });
  it('destSignature dedupes identical destinations', () => {
    const a = { kind: 'crypto', address: 'x', network: 'SPARK', accountType: 'SPARK_WALLET', currency: 'BTC' } as const;
    expect(destSignature(a)).toBe(destSignature({ ...a }));
  });
  it('quoteBodyFor locks USDB sending in micro-units', () => {
    const b = quoteBodyFor('InternalAccount:1', 'ExternalAccount:2', 200, 'USD');
    expect(b.lockedCurrencySide).toBe('SENDING');
    expect(b.lockedCurrencyAmount).toBe(2_000_000);
    expect(b.source).toEqual({ sourceType: 'ACCOUNT', accountId: 'InternalAccount:1' });
    expect(b.destination).toEqual({ destinationType: 'ACCOUNT', accountId: 'ExternalAccount:2', currency: 'USD' });
  });
  it('isCompletionStatus is true only when execute succeeded AND the transaction reached COMPLETED', () => {
    expect(isCompletionStatus(200, 'COMPLETED')).toBe(true);
    expect(isCompletionStatus(200, 'FAILED')).toBe(false);
    expect(isCompletionStatus(200, 'PROCESSING')).toBe(false);
    expect(isCompletionStatus(200, null)).toBe(false);
    expect(isCompletionStatus(400, 'COMPLETED')).toBe(false);
  });
});

describe('pollTransaction', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  it('resolves COMPLETED on the first terminal poll (no extra fetches, no sleep)', async () => {
    mockedFetch.mockResolvedValueOnce(envelope(200, { status: 'COMPLETED' }));
    const status = await pollTransaction('Transaction:1', noopLog);
    expect(status).toBe('COMPLETED');
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it('FAILED short-circuits the loop just like COMPLETED', async () => {
    mockedFetch.mockResolvedValueOnce(envelope(200, { status: 'FAILED' }));
    const status = await pollTransaction('Transaction:1', noopLog);
    expect(status).toBe('FAILED');
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it('returns the last-seen non-terminal status once the deadline has already passed, without looping again', async () => {
    mockedFetch.mockResolvedValueOnce(envelope(200, { status: 'PROCESSING' }));
    // A deadline in the past guarantees the very first Date.now() check after
    // the fetch trips the "give up" branch — exercises the timeout path
    // deterministically without fake timers or a real multi-second wait.
    const status = await pollTransaction('Transaction:1', noopLog, { timeoutMs: -1_000, intervalMs: 50_000 });
    expect(status).toBe('PROCESSING');
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });
});
