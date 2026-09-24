import { accountTypeSpecs } from '@/data/account-types';
import { currencies, railDisplayName } from '@/data/currencies';

export interface ExamplePerson {
  fullName: string;
  nationality: string;
}

export interface CurrencySelection {
  code: string;
  type: 'fiat' | 'crypto';
  name: string;
  accountType: string;
  accountLabel: string;
  countryCode?: string;
  network?: string;
  jitEligible: boolean;
  isInternal: boolean;
  examplePerson: ExamplePerson;
}

export interface ApiStep {
  step: number;
  title: string;
  description: string;
  method: string;
  endpoint: string;
  headers: Record<string, string>;
  body?: Record<string, unknown>;
  note?: string;
  isInstructional?: boolean;
}

const BASE_URL = 'https://api.lightspark.com/grid/2025-10-13';
const AUTH_HEADER = 'Basic <client_id>:<client_secret>';

function buildAccountInfoBody(sel: CurrencySelection): Record<string, unknown> {
  const spec = accountTypeSpecs[sel.accountType];
  if (!spec) {
    return { accountType: sel.accountType };
  }

  const info: Record<string, unknown> = {
    accountType: sel.accountType,
  };

  for (const field of spec.fields) {
    info[field.name] = field.example;
  }

  // Beneficiary goes inside accountInfo per API spec
  if (spec.beneficiaryRequired) {
    info.beneficiary = {
      beneficiaryType: 'INDIVIDUAL',
      fullName: sel.examplePerson.fullName,
      birthDate: '1985-06-20',
      nationality: sel.examplePerson.nationality,
      countryOfResidence: sel.examplePerson.nationality,
    };
  }

  return info;
}

function getJitPaymentMethod(source: CurrencySelection, sourceRail: string | null): string {
  if (source.type === 'crypto') {
    return 'crypto transfer';
  }
  if (sourceRail) {
    return `${railDisplayName(sourceRail)} transfer`;
  }
  const fiat = currencies.find((c) => c.code === source.code);
  if (fiat && fiat.instantRails.length > 0) {
    return `${railDisplayName(fiat.instantRails[0])} transfer`;
  }
  return 'bank transfer';
}

function getStepDescription(sel: CurrencySelection): string {
  if (sel.isInternal) {
    return `Grid internal ${sel.code} account`;
  }
  return `${sel.accountLabel} (${sel.code})`;
}

export function generateSteps(
  source: CurrencySelection,
  destination: CurrencySelection,
  fundingModel: 'jit' | 'pre-funded',
  sourceRail?: string | null,
  destRail?: string | null,
): ApiStep[] {
  const jitFunding = fundingModel === 'jit';
  const steps: ApiStep[] = [];
  const headers = {
    Authorization: AUTH_HEADER,
    'Content-Type': 'application/json',
  };
  let stepNum = 1;

  const isSameCurrency = source.code === destination.code;
  const sourceIsInternal = source.isInternal;
  const destIsInternal = destination.isInternal;
  const destIsExternal = !destIsInternal;
  const sourceIsExternal = !sourceIsInternal;

  // Step 1: Create customer (always)
  steps.push({
    step: stepNum++,
    title: 'Create customer',
    description: 'Register customer on Grid',
    method: 'POST',
    endpoint: `${BASE_URL}/customers`,
    headers,
    body: {
      customerType: 'INDIVIDUAL',
      platformCustomerId: 'cust_12345',
      fullName: source.examplePerson.fullName,
      birthDate: '1990-01-15',
      nationality: source.examplePerson.nationality,
    },
  });

  // Register external accounts as needed
  if (destIsExternal) {
    const accountInfo = buildAccountInfoBody(destination);
    const extAccountBody: Record<string, unknown> = {
      customerId: 'Customer:<customer_id>',
      currency: destination.code,
      accountInfo,
    };

    steps.push({
      step: stepNum++,
      title: 'Register destination account',
      description: getStepDescription(destination),
      method: 'POST',
      endpoint: `${BASE_URL}/customers/external-accounts`,
      headers,
      body: extAccountBody,
    });
  }

  // Only register source for fiat pull-based (External mode).
  // JIT and crypto sources don't need registration — Grid provides a deposit address.
  if (sourceIsExternal && !jitFunding && source.type === 'fiat') {
    const accountInfo = buildAccountInfoBody(source);
    const extAccountBody: Record<string, unknown> = {
      customerId: 'Customer:<customer_id>',
      currency: source.code,
      accountInfo,
    };

    steps.push({
      step: stepNum++,
      title: 'Register source account',
      description: getStepDescription(source),
      method: 'POST',
      endpoint: `${BASE_URL}/customers/external-accounts`,
      headers,
      body: extAccountBody,
    });
  }

  // All transfers go through the quote endpoint
  {
    if (sourceIsInternal && !jitFunding) {
      steps.push({
        step: stepNum++,
        title: 'List internal accounts',
        description: `${source.code} internal accounts`,
        method: 'GET',
        endpoint: `${BASE_URL}/platform/internal-accounts?currency=${source.code}`,
        headers: { Authorization: AUTH_HEADER },
        note: `Ensure sufficient ${source.code} balance in the internal account.`,
      });
    }

    let quoteSource: Record<string, unknown>;
    if (jitFunding) {
      quoteSource = {
        sourceType: 'REALTIME_FUNDING',
        currency: source.code,
        customerId: 'Customer:<customer_id>',
      };
    } else if (sourceIsExternal) {
      quoteSource = {
        sourceType: 'ACCOUNT',
        accountId: 'ExternalAccount:<external_account_id>',
      };
    } else {
      quoteSource = {
        sourceType: 'ACCOUNT',
        accountId: 'InternalAccount:<internal_account_id>',
      };
    }

    let quoteDest: Record<string, unknown>;
    if (destIsExternal) {
      quoteDest = {
        destinationType: 'ACCOUNT',
        accountId: 'ExternalAccount:<external_account_id>',
      };
      // Singular `paymentRail` is a request field on the quote destination and
      // is optional — omitted, Grid picks a default. The plural `paymentRails`
      // is response-only (it reports what an account supports) and must never
      // be sent. Internal destinations are excluded: funds credited to a Grid
      // balance never traverse an external rail.
      if (destination.type === 'fiat' && destRail) {
        quoteDest.paymentRail = destRail;
      }
    } else {
      quoteDest = {
        destinationType: 'ACCOUNT',
        accountId: 'InternalAccount:<internal_account_id>',
      };
    }

    // For same-currency, non-JIT transfers, use immediatelyExecute to combine
    // quote creation and execution in a single request.
    const useImmediateExecute = isSameCurrency && !jitFunding;

    const quoteBody: Record<string, unknown> = {
      source: quoteSource,
      destination: quoteDest,
      lockedCurrencySide: 'SENDING',
      lockedCurrencyAmount: 100000,
      purposeOfPayment: 'GIFT',
    };

    if (useImmediateExecute) {
      quoteBody.immediatelyExecute = true;
    }

    const quoteDesc = isSameCurrency
      ? `${source.code} transfer`
      : `${source.code} \u2192 ${destination.code} conversion`;

    let quoteNote: string;
    if (jitFunding) {
      quoteNote = `The response includes paymentInstructions with details for real-time funding. Send ${source.code} to the provided destination to complete the transfer automatically.`;
    } else if (useImmediateExecute) {
      quoteNote = `With immediatelyExecute: true, the quote is created and executed in a single request. Amount is in smallest currency unit (e.g., cents for USD).`;
    } else {
      quoteNote = `lockedCurrencyAmount is in the smallest unit (e.g., cents). The quote locks the exchange rate for a short window.`;
    }

    steps.push({
      step: stepNum++,
      title: useImmediateExecute ? 'Create and execute transfer' : 'Create quote',
      description: quoteDesc,
      method: 'POST',
      endpoint: `${BASE_URL}/quotes`,
      headers,
      body: quoteBody,
      note: quoteNote,
    });

    if (jitFunding) {
      const paymentMethod = getJitPaymentMethod(source, sourceRail ?? null);
      steps.push({
        step: stepNum++,
        title: 'Trigger the payment',
        description: `Send ${source.code} to complete the payment`,
        method: '',
        endpoint: '',
        headers: {},
        isInstructional: true,
        note: `Trigger the payment by sending a ${paymentMethod} to the deposit address listed on the quote's \`paymentInstructions\`.`,
      });
    } else if (!useImmediateExecute) {
      steps.push({
        step: stepNum++,
        title: 'Execute quote',
        description: 'Complete the transfer',
        method: 'POST',
        endpoint: `${BASE_URL}/quotes/<quote_id>/execute`,
        headers,
      });
    }
  }

  return steps;
}

export function formatCurl(step: ApiStep): string {
  const lines: string[] = [];
  lines.push(`curl -X ${step.method} \\`);
  lines.push(`  '${step.endpoint}' \\`);
  lines.push(`  -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \\`);

  const otherHeaders = Object.entries(step.headers).filter(
    ([key]) => key !== 'Authorization',
  );

  if (step.body) {
    otherHeaders.forEach(([key, val]) => {
      lines.push(`  -H '${key}: ${val}' \\`);
    });
    const bodyJson = JSON.stringify(step.body, null, 2);
    const bodyLines = bodyJson.split('\n');
    bodyLines.forEach((line, i) => {
      if (i === 0) {
        lines.push(`  -d '${line}`);
      } else if (i === bodyLines.length - 1) {
        lines.push(`  ${line}'`);
      } else {
        lines.push(`  ${line}`);
      }
    });
  } else {
    if (otherHeaders.length === 0) {
      // Remove trailing backslash from -u line when there are no more flags
      lines[lines.length - 1] = lines[lines.length - 1].replace(' \\', '');
    } else {
      otherHeaders.forEach(([key, val], i) => {
        const isLast = i === otherHeaders.length - 1;
        lines.push(`  -H '${key}: ${val}'${isLast ? '' : ' \\'}`);
      });
    }
  }

  return lines.join('\n');
}

export function formatStepJson(step: ApiStep): string {
  const { note, description, isInstructional, ...rest } = step;
  void note;
  void description;
  void isInstructional;
  return JSON.stringify(rest, null, 2);
}
