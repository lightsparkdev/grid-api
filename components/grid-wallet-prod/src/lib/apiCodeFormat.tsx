import type { ReactNode } from 'react';
import { GRID_API_BASE_URL, type ApiCall } from '@/data/flow';

export function formatApiUrl(path: string): string {
  return `${GRID_API_BASE_URL}${path}`;
}

export function stepTitle(entry: ApiCall): string {
  if (entry.title) return entry.title;
  const path = entry.path.split('?')[0];
  if (path.includes('/execute')) return 'Execute quote';
  if (path.endsWith('/quotes') && entry.method === 'POST') return 'Create quote';
  if (path.includes('/transactions/')) return 'Get transaction';
  if (path.includes('/challenge')) return 'Start challenge';
  if (path.includes('/verify')) return 'Verify credential';
  const resource = path.split('/').filter(Boolean).pop();
  return `${entry.method} ${resource}`;
}

export function formatCurlString(entry: ApiCall): string {
  const lines: string[] = [];
  // Inbound webhooks are sent BY Grid TO your endpoint, so `path` is already a
  // full URL and there's no Grid auth header (Grid signs with X-Grid-Signature).
  // Everything else is an outbound call to the Grid API with your key.
  const url = entry.inbound ? entry.path : formatApiUrl(entry.path);
  const headerEntries = Object.entries(entry.headers ?? {});
  if (!entry.inbound) headerEntries.unshift(['Authorization', 'Basic $GRID_KEY']);
  const hasBody = !!entry.reqBody;

  lines.push(`curl -X ${entry.method} "${url}"${headerEntries.length || hasBody ? ' \\' : ''}`);

  headerEntries.forEach(([name, value], i) => {
    const cont = i < headerEntries.length - 1 || hasBody ? ' \\' : '';
    lines.push(`  -H "${name}: ${value}"${cont}`);
  });

  if (hasBody) {
    lines.push(`  -d '${JSON.stringify(entry.reqBody, null, 2)}'`);
  }

  return lines.join('\n');
}

function objectField(value: unknown, key: string): unknown {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)[key]
    : undefined;
}

function isRealtimeFundingQuote(entry: ApiCall): boolean {
  if (!entry.path.endsWith('/quotes') || entry.method !== 'POST') return false;
  return objectField(objectField(entry.reqBody, 'source'), 'sourceType') === 'REALTIME_FUNDING';
}

function isQuoteCreate(entry: ApiCall): boolean {
  return entry.method === 'POST' && entry.path.endsWith('/quotes');
}

function isQuoteExecute(entry: ApiCall): boolean {
  return entry.method === 'POST' && /\/quotes\/[^/]+\/execute$/.test(entry.path);
}

function quoteIdFromPath(path: string): string {
  const match = path.match(/\/quotes\/([^/]+)\/execute$/);
  return match?.[1] ?? 'Quote:019e8f49-3c8f-5246-0000-4d75f9a6d1d1';
}

function quoteFundingCurrency(entry: ApiCall): string {
  const currency = objectField(objectField(entry.reqBody, 'source'), 'currency');
  return typeof currency === 'string' ? currency : 'USD';
}

function currencyResponse(code: string): Record<string, unknown> {
  const currencies: Record<string, Record<string, unknown>> = {
    USDB: { code: 'USDB', name: 'USD Balance', symbol: '$', decimals: 6 },
    USD: { code: 'USD', name: 'United States Dollar', symbol: '$', decimals: 2 },
    EUR: { code: 'EUR', name: 'Euro', symbol: '\u20ac', decimals: 2 },
    BTC: { code: 'BTC', name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
    USDC: { code: 'USDC', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  };
  return currencies[code] ?? { code, name: code, symbol: code, decimals: 2 };
}

function quoteSource(entry: ApiCall): unknown {
  return (
    objectField(entry.reqBody, 'source') ?? {
      sourceType: 'ACCOUNT',
      accountId: 'InternalAccount:019e8f48-1135-438c-0000-8b9d28990463',
    }
  );
}

function quoteDestination(entry: ApiCall): unknown {
  return (
    objectField(entry.reqBody, 'destination') ?? {
      destinationType: 'ACCOUNT',
      accountId: 'ExternalAccount:019e8f4a-781d-7e0c-0000-a0d9afbf1314',
      currency: 'USD',
    }
  );
}

function quoteCurrencyCodes(entry: ApiCall): { sending: string; receiving: string } {
  const source = quoteSource(entry);
  const destination = quoteDestination(entry);
  const sourceType = objectField(source, 'sourceType');

  if (sourceType === 'REALTIME_FUNDING') {
    return {
      sending: typeof objectField(source, 'currency') === 'string' ? (objectField(source, 'currency') as string) : 'USD',
      receiving: 'USDB',
    };
  }

  const destinationCurrency = objectField(destination, 'currency');
  return {
    sending: 'USDB',
    receiving: typeof destinationCurrency === 'string' ? destinationCurrency : 'USD',
  };
}

function quoteAmount(entry: ApiCall): number {
  const amount = objectField(entry.reqBody, 'lockedCurrencyAmount');
  return typeof amount === 'number' ? amount : 20000;
}

function quotePaymentInstructions(entry: ApiCall): Record<string, unknown>[] {
  if (isRealtimeFundingQuote(entry)) {
    const fundingCurrency = quoteFundingCurrency(entry);
    return [
      {
        instructionsNotes: 'Include the reference code in the transfer memo',
        accountOrWalletInfo: {
          accountType: `${fundingCurrency}_ACCOUNT`,
          reference: 'PAYIN-8F49',
          accountNumber: '9876543210',
          routingNumber: '021000021',
          bankName: 'JP Morgan Chase',
          accountHolderName: 'Lightspark Payments FBO Customer',
        },
      },
    ];
  }

  return [
    {
      accountOrWalletInfo: {
        accountType: 'EMBEDDED_WALLET',
        payloadToSign:
          '{"type":"ACTIVITY_TYPE_SIGN_TRANSACTION_V2","timestampMs":"1770408000000","organizationId":"org_abc123","parameters":{"signWith":"wallet_abc123","unsignedTransaction":"<unsigned transaction>"},"generateAppProofs":true}',
      },
    },
  ];
}

function quoteResponse(entry: ApiCall, status: 'PENDING' | 'PROCESSING'): Record<string, unknown> {
  const { sending, receiving } = quoteCurrencyCodes(entry);
  const amount = quoteAmount(entry);

  return {
    id: quoteIdFromPath(entry.path),
    status,
    createdAt: '2026-06-05T12:00:00Z',
    expiresAt: '2026-06-05T12:05:00Z',
    source: quoteSource(entry),
    destination: quoteDestination(entry),
    sendingCurrency: currencyResponse(sending),
    receivingCurrency: currencyResponse(receiving),
    totalSendingAmount: amount,
    totalReceivingAmount: amount,
    exchangeRate: 1,
    feesIncluded: 0,
    paymentInstructions: quotePaymentInstructions(entry),
    transactionId: 'Transaction:019e8f49-3ca4-b78f-0000-1d3e9a411168',
  };
}

function transactionIdFromPath(path: string): string {
  const match = path.match(/\/transactions\/([^/?]+)/);
  return match?.[1] ?? 'Transaction:019e8f49-3ca4-b78f-0000-1d3e9a411168';
}

function isTransactionGet(entry: ApiCall): boolean {
  return entry.method === 'GET' && /\/transactions\/[^/?]+$/.test(entry.path);
}

function transactionResponse(entry: ApiCall): Record<string, unknown> {
  return {
    id: transactionIdFromPath(entry.path),
    status: 'COMPLETED',
    type: 'OUTGOING',
    source: {
      sourceType: 'ACCOUNT',
      accountId: 'InternalAccount:019e8f48-1135-438c-0000-8b9d28990463',
      currency: 'USDB',
    },
    destination: {
      destinationType: 'ACCOUNT',
      accountId: 'ExternalAccount:019e8f4a-781d-7e0c-0000-a0d9afbf1314',
      currency: 'USD',
    },
    customerId: 'Customer:019e8f47-2a3d-1d02-0000-6b1f0c4e2a91',
    platformCustomerId: 'customer_demo_001',
    createdAt: '2026-06-05T12:00:05Z',
    updatedAt: '2026-06-05T12:00:12Z',
    settledAt: '2026-06-05T12:00:12Z',
    quoteId: 'Quote:019e8f49-3c8f-5246-0000-4d75f9a6d1d1',
    sentAmount: {
      amount: 20000,
      currency: currencyResponse('USDB'),
    },
    receivedAmount: {
      amount: 20000,
      currency: currencyResponse('USD'),
    },
    exchangeRate: 1,
    fees: 0,
  };
}

function authCredentialIdFromPath(path: string): string {
  const match = path.match(/\/auth\/credentials\/([^/]+)\/challenge$/);
  return match?.[1] ?? 'AuthMethod:019e8f48-11a8-0dca-0000-947363f18d5a';
}

function isAuthCredentialChallenge(entry: ApiCall): boolean {
  return (
    entry.method === 'POST' &&
    /\/auth\/credentials\/[^/]+\/challenge$/.test(entry.path)
  );
}

function isPasskeyChallenge(entry: ApiCall): boolean {
  return typeof objectField(entry.reqBody, 'clientPublicKey') === 'string';
}

function isAuthCredentialVerify(entry: ApiCall): boolean {
  return (
    entry.method === 'POST' &&
    /\/auth\/credentials\/[^/]+\/verify$/.test(entry.path)
  );
}

function credentialVerifyType(entry: ApiCall): string {
  const type = objectField(entry.reqBody, 'type');
  return typeof type === 'string' ? type : 'OAUTH';
}

function isOtpVerifyType(type: string): boolean {
  return type === 'EMAIL_OTP' || type === 'SMS_OTP';
}

function hasWalletSignature(entry: ApiCall): boolean {
  return typeof entry.headers?.['Grid-Wallet-Signature'] === 'string';
}

function isExternalAccountCreate(entry: ApiCall): boolean {
  return entry.method === 'POST' && entry.path === '/customers/external-accounts';
}

function isWalletAccountInfo(accountInfo: unknown): boolean {
  const accountType = objectField(accountInfo, 'accountType');
  return (
    typeof objectField(accountInfo, 'address') === 'string' ||
    (typeof accountType === 'string' && accountType.includes('WALLET'))
  );
}

function externalAccountResponse(entry: ApiCall): Record<string, unknown> {
  const accountInfo = objectField(entry.reqBody, 'accountInfo');
  const platformAccountId =
    objectField(entry.reqBody, 'platformAccountId') ?? objectField(accountInfo, 'platformAccountId');

  return {
    id: isWalletAccountInfo(accountInfo)
      ? 'ExternalAccount:019e8f4a-9b2e-71f4-0000-3c5e7a2b9f08'
      : 'ExternalAccount:019e8f4a-781d-7e0c-0000-a0d9afbf1314',
    customerId: entry.reqBody?.customerId,
    status: 'ACTIVE',
    ...(typeof platformAccountId === 'string' ? { platformAccountId } : {}),
    currency: entry.reqBody?.currency,
    defaultUmaDepositAccount: false,
    accountInfo,
  };
}

function authSessionResponse(entry: ApiCall, includeEncryptedSessionKey: boolean): Record<string, unknown> {
  const type = credentialVerifyType(entry);
  const isPasskey = type === 'PASSKEY';
  const isApple = objectField(entry.reqBody, 'oidcToken') === '<Apple id_token>';

  return {
    id: 'Session:019e8f48-11d2-7e48-0000-d9ac1f2a9f04',
    accountId: 'InternalAccount:019e8f48-1135-438c-0000-8b9d28990463',
    type,
    ...(isPasskey
      ? {
          credentialId:
            'KEbWNCc7NgaYnUyrNeFGX9_3Y-8oJ3KwzjnaiD1d1LVTxR7v3CaKfCz2Vy_g_MHSh7yJ8yL0Pxg6jo_o0hYiew',
        }
      : {}),
    nickname: isPasskey ? 'iPhone Face-ID' : isApple ? 'demo@privaterelay.appleid.com' : 'demo@lightspark.com',
    createdAt: '2026-06-05T12:00:00Z',
    updatedAt: '2026-06-05T12:00:00Z',
    ...(includeEncryptedSessionKey
      ? {
          encryptedSessionSigningKey:
            'w99a5xV6A75TfoAUkZn869fVyDYvgVsKrawMALZXmrauZd8hEv66EkPU1Z42CUaHESQjcA5bqd8dynTGBMLWB9ewtXWPEVbZvocB4Tw2K1vQVp7uwjf',
        }
      : {}),
    expiresAt: '2026-06-05T12:15:00Z',
  };
}

export function stubResponseBody(entry: ApiCall): Record<string, unknown> {
  if (isExternalAccountCreate(entry)) {
    return externalAccountResponse(entry);
  }
  if (isAuthCredentialChallenge(entry)) {
    const id = authCredentialIdFromPath(entry.path);
    const accountId = 'InternalAccount:019e8f48-1135-438c-0000-8b9d28990463';
    const timestamps = {
      createdAt: '2026-06-05T12:00:00Z',
      updatedAt: '2026-06-05T12:00:00Z',
    };

    if (isPasskeyChallenge(entry)) {
      return {
        id,
        accountId,
        type: 'PASSKEY',
        credentialId: 'KEbWNCc7NgaYnUyrNeFGX9_3Y-8oJ3KwzjnaiD1d1LVTxR7v3CaKfCz2Vy_g_MHSh7yJ8yL0Pxg6jo_o0hYiew',
        nickname: 'iPhone Face-ID',
        ...timestamps,
        challenge: '6b35a4c41d9aa7a2a0e742f9f9e7a1c2d65a2db33a3fb748f6d4f1ce78d9a729',
        requestId: 'Request:7c4a8d09-ca37-4e3e-9e0d-8c2b3e9a1f21',
        expiresAt: '2026-06-05T12:05:00Z',
      };
    }

    return {
      id,
      accountId,
      type: 'EMAIL_OTP',
      nickname: 'demo@lightspark.com',
      otpEncryptionTargetBundle:
        '{"version":"v1.0.0","data":"7b227461726765745075626c6963...","dataSignature":"30450221...","enclaveQuorumPublic":"04a1b2c3..."}',
      ...timestamps,
    };
  }
  if (isAuthCredentialVerify(entry)) {
    const type = credentialVerifyType(entry);
    if (isOtpVerifyType(type) && !hasWalletSignature(entry)) {
      return {
        type,
        payloadToSign:
          'eyJhbGciOiJFUzI1NiIsImtpZCI6InR1cm5rZXkifQ.eyJzdWIiOiJUWnk2NkVPa1RGYTd2NkpXZ0VxaVgyZGFXOENXc2pMQzVDVU9aRUlGY3hzIiwiaWF0IjoxNzc5NDA3MjIxLCJleHAiOjE3Nzk0MTA4MjF9.gKX9MWYGkw8Y55bgzsgrRftvUHFruIe8yu0w9Kpjp5qnrZnXcTV71WVoltGPsr015IY_oRTOkIFLHmiGNG9zBw',
        requestId: 'Request:7c4a8d09-ca37-4e3e-9e0d-8c2b3e9a1f21',
        expiresAt: '2026-06-05T12:05:00Z',
      };
    }
    return authSessionResponse(entry, !isOtpVerifyType(type));
  }
  if (isQuoteCreate(entry)) {
    return quoteResponse(entry, 'PENDING');
  }
  if (isQuoteExecute(entry)) {
    return quoteResponse(entry, 'PROCESSING');
  }
  if (isTransactionGet(entry)) {
    return transactionResponse(entry);
  }
  return { status: 'ok' };
}

export function formatResponseString(entry: ApiCall): string {
  return JSON.stringify(stubResponseBody(entry), null, 2);
}

type SyntaxClass = {
  default: string;
  command: string;
  flag: string;
  string: string;
};

export function highlightCurl(code: string, s: SyntaxClass): ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    const parts: ReactNode[] = [];
    let remaining = line;
    let partKey = 0;

    while (remaining.length > 0) {
      const wsMatch = remaining.match(/^(\s+)/);
      if (wsMatch) {
        parts.push(<span key={partKey++} className={s.default}>{wsMatch[1]}</span>);
        remaining = remaining.slice(wsMatch[1].length);
        continue;
      }

      if (lineIdx === 0 && partKey === 0 && remaining.startsWith('curl')) {
        parts.push(<span key={partKey++} className={s.command}>curl</span>);
        remaining = remaining.slice(4);
        continue;
      }

      const flagMatch = remaining.match(/^(-[A-Za-z]+)/);
      if (flagMatch) {
        parts.push(<span key={partKey++} className={s.flag}>{flagMatch[1]}</span>);
        remaining = remaining.slice(flagMatch[1].length);
        continue;
      }

      const sqMatch = remaining.match(/^('[^']*(?:'|$))/);
      if (sqMatch) {
        parts.push(<span key={partKey++} className={s.string}>{sqMatch[1]}</span>);
        remaining = remaining.slice(sqMatch[1].length);
        continue;
      }

      const dqMatch = remaining.match(/^("[^"]*")/);
      if (dqMatch) {
        parts.push(<span key={partKey++} className={s.string}>{dqMatch[1]}</span>);
        remaining = remaining.slice(dqMatch[1].length);
        continue;
      }

      const methodMatch = remaining.match(/^(GET|POST)\b/);
      if (methodMatch) {
        parts.push(<span key={partKey++} className={s.flag}>{methodMatch[1]}</span>);
        remaining = remaining.slice(methodMatch[1].length);
        continue;
      }

      if (remaining.startsWith('\\')) {
        parts.push(<span key={partKey++} className={s.default}>\</span>);
        remaining = remaining.slice(1);
        continue;
      }

      parts.push(<span key={partKey++} className={s.default}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }

    return (
      <span key={lineIdx}>
        {parts}
        {lineIdx < lines.length - 1 ? '\n' : null}
      </span>
    );
  });
}

export function highlightJson(code: string, s: SyntaxClass): ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    const parts: ReactNode[] = [];
    let remaining = line;
    let partKey = 0;

    while (remaining.length > 0) {
      const keyMatch = remaining.match(/^("(?:[^"\\]|\\.)*")(\s*:)/);
      if (keyMatch) {
        parts.push(<span key={partKey++} className={s.flag}>{keyMatch[1]}</span>);
        parts.push(<span key={partKey++} className={s.default}>{keyMatch[2]}</span>);
        remaining = remaining.slice(keyMatch[0].length);
        continue;
      }

      const strMatch = remaining.match(/^("(?:[^"\\]|\\.)*")/);
      if (strMatch) {
        parts.push(<span key={partKey++} className={s.string}>{strMatch[1]}</span>);
        remaining = remaining.slice(strMatch[1].length);
        continue;
      }

      const numMatch = remaining.match(/^(\d+)/);
      if (numMatch) {
        parts.push(<span key={partKey++} className={s.command}>{numMatch[1]}</span>);
        remaining = remaining.slice(numMatch[1].length);
        continue;
      }

      parts.push(<span key={partKey++} className={s.default}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }

    return (
      <span key={lineIdx}>
        {parts}
        {lineIdx < lines.length - 1 ? '\n' : null}
      </span>
    );
  });
}
