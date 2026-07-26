import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gridFetch } from './gridClient';
import {
  transactionToRow,
  fetchActivity,
  fetchDepositInstructions,
  fetchExternalAccounts,
  externalAccountKey,
  fundingInstructionRows,
  type RawTransaction,
} from './gridReads';

vi.mock('./gridClient', () => ({ gridFetch: vi.fn() }));

const mockedFetch = vi.mocked(gridFetch);
const usdb = (amount: number) => ({ amount, currency: { code: 'USDB', decimals: 6 } });
const mxn = (amount: number) => ({ amount, currency: { code: 'MXN', decimals: 2 } });

describe('transactionToRow', () => {
  it('maps an inbound credit to a "+" row with its real id and time', () => {
    const t: RawTransaction = {
      id: 'Transaction:1',
      type: 'INCOMING',
      direction: 'CREDIT',
      status: 'COMPLETED',
      createdAt: '2026-07-24T17:17:28.405573Z',
      receivedAmount: usdb(5_000_000),
    };
    const row = transactionToRow(t);
    expect(row.id).toBe('Transaction:1');
    expect(row.amount).toBe('+$5.00');
    expect(row.detail).toBe('Added to balance');
    expect(row.timestamp).toBe(Date.parse('2026-07-24T17:17:28.405573Z'));
  });

  it('shows an outbound cash-out at what LEFT the wallet, noting the payout currency', () => {
    const t: RawTransaction = {
      id: 'Transaction:2',
      type: 'OUTGOING',
      direction: 'DEBIT',
      status: 'COMPLETED',
      createdAt: '2026-07-24T17:35:47.038270Z',
      sentAmount: usdb(5_000_000),
      receivedAmount: mxn(8389),
    };
    const row = transactionToRow(t);
    expect(row.amount).toBe('$5.00'); // no "+", and not the MXN leg
    expect(row.detail).toBe('Sent as MXN');
  });

  it('surfaces a non-settled status in the detail line', () => {
    const base: RawTransaction = {
      id: 'Transaction:3',
      type: 'OUTGOING',
      direction: 'DEBIT',
      status: 'PROCESSING',
      sentAmount: usdb(1_500_000),
    };
    expect(transactionToRow(base).detail).toBe('Sent from balance · Processing');
    expect(transactionToRow({ ...base, status: 'FAILED' }).detail).toBe('Sent from balance · Failed');
  });

  it('prefers the counterparty name when Grid supplies one', () => {
    const t: RawTransaction = {
      id: 'Transaction:4',
      type: 'INCOMING',
      direction: 'CREDIT',
      status: 'COMPLETED',
      receivedAmount: usdb(2_000_000),
      counterpartyInformation: { FULL_NAME: 'Pat Teehantri' },
    };
    expect(transactionToRow(t).title).toBe('Pat Teehantri');
  });

  it('falls back to type when direction is absent', () => {
    const t: RawTransaction = {
      id: 'Transaction:5',
      type: 'INCOMING',
      status: 'COMPLETED',
      receivedAmount: usdb(0),
    };
    expect(transactionToRow(t).amount).toBe('+$0.00');
  });
});

describe('fetchDepositInstructions', () => {
  beforeEach(() => mockedFetch.mockReset());

  const reply = (status: number, body: unknown) =>
    mockedFetch.mockResolvedValue({
      request: { method: 'GET' as const, path: '/customers/internal-accounts', headers: {} },
      response: { status, body },
    });

  // Exactly the shape the live sandbox returns for the USD fiat account.
  it('turns the fiat account funding instruction into display rows', async () => {
    reply(200, {
      data: [
        {
          id: 'InternalAccount:1',
          balance: { currency: { code: 'USD' } },
          fundingPaymentInstructions: [
            {
              accountOrWalletInfo: {
                accountType: 'USD_ACCOUNT',
                accountNumber: '7752061236',
                routingNumber: '943515368',
                paymentRails: ['ACH', 'WIRE', 'RTP', 'FEDNOW'],
                reference: 'InternalAccount:1',
              },
              instructionsNotes: 'Include the reference code in the memo',
            },
          ],
        },
      ],
    });

    const d = await fetchDepositInstructions(() => {});
    expect(d?.sections).toEqual([
      {
        label: 'USD',
        rows: [
          ['Account number', '7752061236'],
          ['Routing number', '943515368'],
          ['Rails', 'ACH · WIRE · RTP · FEDNOW'],
          ['Reference', 'InternalAccount:1'],
        ],
        note: 'Include the reference code in the memo',
      },
    ]);
    expect(d?.last4).toBe('1236'); // labels the simulated deposit's activity row
  });

  // When the customer gets a real EUR account, its IBAN must appear with no code
  // change — that's what retires data/placeholderDeposit.
  it('returns one section per fiat account', async () => {
    reply(200, {
      data: [
        {
          id: 'InternalAccount:1',
          balance: { currency: { code: 'USD' } },
          fundingPaymentInstructions: [{ accountOrWalletInfo: { accountNumber: '7752061236' } }],
        },
        {
          id: 'InternalAccount:2',
          balance: { currency: { code: 'EUR' } },
          fundingPaymentInstructions: [{ accountOrWalletInfo: { iban: 'DE89370400440532013000' } }],
        },
      ],
    });
    const d = await fetchDepositInstructions(() => {});
    expect(d?.sections.map((x) => x.label)).toEqual(['USD', 'EUR']);
    expect(d?.last4).toBe('1236'); // the first account's, where the sandbox deposit lands
  });

  it('is null when the account has no funding instructions to show', async () => {
    reply(200, {
      data: [{ id: 'InternalAccount:1', balance: { currency: { code: 'USD' } } }],
    });
    expect(await fetchDepositInstructions(() => {})).toBeNull();
  });

  // Nothing is invented: a field Grid didn't send doesn't appear as a row.
  it('omits rows Grid did not return', async () => {
    expect(fundingInstructionRows({ accountOrWalletInfo: { iban: 'DE89370400440532013000' } })).toEqual([
      ['IBAN', 'DE89370400440532013000'],
    ]);
    expect(fundingInstructionRows({})).toEqual([]);
  });
});

describe('fetchActivity', () => {
  beforeEach(() => mockedFetch.mockReset());

  const envelope = (status: number, body: unknown) => ({
    request: { method: 'GET' as const, path: '/transactions', headers: {} },
    response: { status, body },
  });

  // EXPIRED transactions are quotes that timed out — no money moved, so they
  // must not appear as history.
  it('drops EXPIRED rows and orders the rest newest first', async () => {
    mockedFetch.mockResolvedValue(
      envelope(200, {
        data: [
          { id: 'Transaction:old', type: 'INCOMING', direction: 'CREDIT', status: 'COMPLETED', createdAt: '2026-07-24T10:00:00Z', receivedAmount: usdb(1_000_000) },
          { id: 'Transaction:expired', type: 'OUTGOING', direction: 'DEBIT', status: 'EXPIRED', createdAt: '2026-07-24T12:00:00Z', sentAmount: usdb(2_000_000) },
          { id: 'Transaction:new', type: 'OUTGOING', direction: 'DEBIT', status: 'COMPLETED', createdAt: '2026-07-24T18:00:00Z', sentAmount: usdb(3_000_000) },
        ],
      }),
    );
    const rows = await fetchActivity(() => {});
    expect(rows.map((r) => r.id)).toEqual(['Transaction:new', 'Transaction:old']);
  });

  it('returns nothing when the read fails, rather than throwing at the caller', async () => {
    mockedFetch.mockResolvedValue(envelope(403, { error: { code: 'PROXY_NOT_ALLOWED' } }));
    expect(await fetchActivity(() => {})).toEqual([]);
  });
});

describe('fetchExternalAccounts', () => {
  beforeEach(() => mockedFetch.mockReset());

  const usd = (id: string, accountNumber: string, routingNumber = '021000021') => ({
    id,
    status: 'ACTIVE',
    currency: 'USD',
    accountInfo: { accountType: 'USD_ACCOUNT', accountNumber, routingNumber },
  });
  const reply = (data: unknown[]) =>
    mockedFetch.mockResolvedValue({
      request: { method: 'GET' as const, path: '/customers/external-accounts', headers: {} },
      response: { status: 200, body: { data } },
    });

  // The same bank account registered twice is one account, and the row should
  // point at the most recent registration.
  it('collapses accounts that share routing + account number, keeping the newest', async () => {
    reply([
      usd('ExternalAccount:old', '1234567890'),
      usd('ExternalAccount:other', '9999999999'),
      usd('ExternalAccount:new', '1234567890'),
    ]);
    const rows = await fetchExternalAccounts(() => {});
    expect(rows.map((r) => r.id)).toEqual(['ExternalAccount:new', 'ExternalAccount:other']);
  });

  it('treats formatting differences as the same account', () => {
    expect(externalAccountKey(usd('a', '1234 5678 90', '021-000-021'))).toBe(
      externalAccountKey(usd('b', '1234567890', '021000021')),
    );
  });

  it('keeps accounts that differ only by routing number', async () => {
    reply([usd('ExternalAccount:a', '1234567890', '111111111'), usd('ExternalAccount:b', '1234567890', '222222222')]);
    expect((await fetchExternalAccounts(() => {})).length).toBe(2);
  });

  it('collapses IBANs case- and space-insensitively', () => {
    const iban = (id: string, value: string) => ({
      id,
      accountInfo: { accountType: 'EUR_ACCOUNT', iban: value },
    });
    expect(externalAccountKey(iban('a', 'DE89 3704 0044 0532 0130 00'))).toBe(
      externalAccountKey(iban('b', 'de89370400440532013000')),
    );
  });

  it('drops unsupported corridors and inactive accounts', async () => {
    reply([
      usd('ExternalAccount:ok', '1111111111'),
      { id: 'ExternalAccount:mxn', status: 'ACTIVE', accountInfo: { accountType: 'MXN_ACCOUNT', clabeNumber: '012180001234567895' } },
      { ...usd('ExternalAccount:closed', '2222222222'), status: 'CLOSED' },
    ]);
    expect((await fetchExternalAccounts(() => {})).map((r) => r.id)).toEqual(['ExternalAccount:ok']);
  });
});

describe('wallet-relative direction', () => {
  const WALLET = 'InternalAccount:wallet';
  const FIAT = 'InternalAccount:fiat';

  // Grid records an inbound PULL as a DEBIT (it debits the external source), so
  // direction alone labelled arriving money "Money sent".
  const pull: RawTransaction = {
    id: 'Transaction:pull',
    type: 'OUTGOING',
    direction: 'DEBIT',
    status: 'COMPLETED',
    createdAt: '2026-07-25T15:44:28Z',
    sentAmount: usdb(100_000_000),
    receivedAmount: { amount: 100_000_000, currency: { code: 'USDB', decimals: 6 } },
    source: { accountId: 'ExternalAccount:bank' },
    destination: { accountId: WALLET },
  };

  it('reads a pull into the wallet as money added', () => {
    const row = transactionToRow(pull, WALLET);
    expect(row.title).toBe('Money added');
    expect(row.flow).toBe('in');
    expect(row.amount).toBe('+$100.00');
  });

  it('still reads it by direction when the wallet is unknown', () => {
    expect(transactionToRow(pull).title).toBe('Money sent');
  });

  it('reads a transfer out of the wallet as money sent', () => {
    const out: RawTransaction = {
      ...pull,
      id: 'Transaction:out',
      source: { accountId: WALLET },
      destination: { accountId: 'ExternalAccount:bank' },
      sentAmount: usdb(5_000_000),
      receivedAmount: mxn(8389),
    };
    const row = transactionToRow(out, WALLET);
    expect(row.flow).toBe('out');
    expect(row.amount).toBe('$5.00');
    expect(row.detail).toBe('Sent as MXN');
  });

  // Funding arrives in two legs; listing both would show the same money twice.
  it('lists only the legs that touch the wallet', async () => {
    mockedFetch.mockReset();
    mockedFetch.mockResolvedValue({
      request: { method: 'GET' as const, path: '/transactions', headers: {} },
      response: {
        status: 200,
        body: {
          data: [
            pull,
            {
              id: 'Transaction:wire',
              type: 'INCOMING',
              direction: 'CREDIT',
              status: 'COMPLETED',
              createdAt: '2026-07-25T15:38:06Z',
              receivedAmount: { amount: 250, currency: { code: 'USD', decimals: 2 } },
              source: { sourceType: 'UMA_ADDRESS' },
              destination: { accountId: FIAT },
            },
          ],
        },
      },
    });
    const rows = await fetchActivity(() => {}, WALLET);
    expect(rows.map((r) => r.id)).toEqual(['Transaction:pull']);
  });
});
