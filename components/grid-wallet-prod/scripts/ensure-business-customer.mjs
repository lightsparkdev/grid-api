#!/usr/bin/env node
/**
 * Idempotently provision the demo's sample BUSINESS customer.
 *
 *   node scripts/ensure-business-customer.mjs [--platform-id biz-…] [--dry-run]
 *
 * Looks the customer up by `platformCustomerId` (GET /customers?platformCustomerId=…),
 * creates it only when absent, then upserts GRID_BUSINESS_CUSTOMER_ID into
 * .env.local. Re-running is a no-op beyond re-printing the current state.
 *
 * Note: unlike INDIVIDUAL customers (auto-KYC'd on creation), BUSINESS customers
 * start at kybStatus UNVERIFIED and need an out-of-band verification step. The
 * embedded-wallet internal accounts only appear AFTER approval, so a freshly
 * created business customer has no accounts yet — the script says so rather than
 * pretending otherwise.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ENV_PATH = resolve(ROOT, '.env.local');
const ENV_KEY = 'GRID_BUSINESS_CUSTOMER_ID';
const DEFAULT_PLATFORM_ID = 'biz-grid-wallet-prod';

/* ── args ─────────────────────────────────────────────────────────────────── */

function parseArgs(argv) {
  const args = { platformId: DEFAULT_PLATFORM_ID, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--platform-id') args.platformId = argv[++i];
    else if (a.startsWith('--platform-id=')) args.platformId = a.slice('--platform-id='.length);
    else die(`Unknown argument: ${a}`);
  }
  if (!args.platformId) die('--platform-id needs a value');
  return args;
}

function die(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

/* ── .env.local ───────────────────────────────────────────────────────────── */

/** Minimal dotenv read: KEY=value, optional quotes, # comments, no interpolation. */
function readEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"') && v.length > 1) ||
      (v.startsWith("'") && v.endsWith("'") && v.length > 1)
    ) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

/** Replace KEY's line in place, or append it with a comment block. */
function upsertEnvKey(path, key, value, comment) {
  const original = existsSync(path) ? readFileSync(path, 'utf8') : '';
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(original)) {
    const next = original.replace(re, line);
    if (next === original) return 'unchanged';
    writeFileSync(path, next);
    return 'updated';
  }
  const sep = original === '' || original.endsWith('\n') ? '' : '\n';
  const block = `${sep}\n${comment ? `# ${comment}\n` : ''}${line}\n`;
  writeFileSync(path, original + block);
  return 'added';
}

/* ── Grid ─────────────────────────────────────────────────────────────────── */

function gridConfig(env) {
  const clientId = process.env.GRID_CLIENT_ID || env.GRID_CLIENT_ID;
  const clientSecret = process.env.GRID_CLIENT_SECRET || env.GRID_CLIENT_SECRET;
  const baseUrl =
    process.env.GRID_API_BASE_URL ||
    env.GRID_API_BASE_URL ||
    'https://api.lightspark.com/grid/2025-10-13';
  if (!clientId || !clientSecret) {
    die('GRID_CLIENT_ID / GRID_CLIENT_SECRET not found in the environment or .env.local');
  }
  const auth = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  return { baseUrl: baseUrl.replace(/\/$/, ''), auth };
}

async function grid({ baseUrl, auth }, method, path, body) {
  const res = await fetch(baseUrl + path, {
    method,
    headers: {
      Authorization: auth,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { raw: text };
  }
  return { status: res.status, body: parsed };
}

function fail(where, res) {
  const err = res.body?.error;
  die(
    `${where}: HTTP ${res.status}` +
      (err ? ` (${err.code ?? ''} ${err.message ?? ''})`.replace(/\s+/g, ' ').trimEnd() : '') +
      `\n${JSON.stringify(res.body, null, 2)}`,
  );
}

/** Sample business — deliberately boring, matches the OpenAPI businessCustomer example. */
function businessPayload(platformId) {
  return {
    customerType: 'BUSINESS',
    platformCustomerId: platformId,
    region: 'US',
    currencies: ['USD', 'USDB'],
    email: 'peng+grid-wallet-prod-biz@lightspark.com',
    phoneNumber: '+14155559876',
    businessInfo: {
      legalName: 'Aurora Labs LLC',
      doingBusinessAs: 'Aurora',
      country: 'US',
      registrationNumber: '5523041',
      incorporatedOn: '2018-03-14',
      entityType: 'LLC',
      taxId: '47-1234567',
      countriesOfOperation: ['US'],
      businessType: 'INFORMATION',
      purposeOfAccount: 'CONTRACTOR_PAYOUTS',
      sourceOfFunds: 'Funds derived from customer payments for software services',
      expectedMonthlyTransactionCount: 'COUNT_100_TO_500',
      expectedMonthlyTransactionVolume: 'VOLUME_100K_TO_1M',
      expectedRecipientJurisdictions: ['US'],
    },
    address: {
      line1: '123 Market Street',
      line2: 'Suite 400',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'US',
    },
  };
}

function kybOf(customer) {
  return customer?.kybStatus ?? customer?.kycStatus ?? 'UNKNOWN';
}

/* ── main ─────────────────────────────────────────────────────────────────── */

const args = parseArgs(process.argv.slice(2));
const env = readEnvFile(ENV_PATH);
const cfg = gridConfig(env);

console.log(`base:        ${cfg.baseUrl}`);
console.log(`platform id: ${args.platformId}`);

const lookup = await grid(
  cfg,
  'GET',
  `/customers?platformCustomerId=${encodeURIComponent(args.platformId)}`,
);
if (lookup.status !== 200) fail('list customers', lookup);

// The filter is server-side, but match defensively — a broader result set must
// not be mistaken for "found".
const existing = (lookup.body.data ?? []).find(
  (c) => c.platformCustomerId === args.platformId && c.customerType === 'BUSINESS',
);

let customer = existing;
if (existing) {
  console.log(`found:       ${existing.id}  (kyb: ${kybOf(existing)})`);
} else if (args.dryRun) {
  console.log('dry-run:     no BUSINESS customer with that platform id — would create one');
  console.log(JSON.stringify(businessPayload(args.platformId), null, 2));
  process.exit(0);
} else {
  const created = await grid(cfg, 'POST', '/customers', businessPayload(args.platformId));
  if (created.status !== 201) fail('create customer', created);
  customer = created.body;
  console.log(`created:     ${customer.id}  (kyb: ${kybOf(customer)})`);
}

// Internal accounts only exist post-approval; report either way.
const accts = await grid(
  cfg,
  'GET',
  `/customers/internal-accounts?customerId=${encodeURIComponent(customer.id)}`,
);
if (accts.status === 200) {
  const rows = accts.body.data ?? [];
  if (rows.length === 0) {
    console.log(
      `accounts:    none yet — BUSINESS customers provision internal accounts after KYB approval (kyb: ${kybOf(customer)})`,
    );
  } else {
    for (const a of rows) {
      console.log(`account:     ${a.id}  ${a.balance?.currency?.code ?? '?'}  ${a.type ?? ''}`.trimEnd());
    }
  }
} else {
  console.log(`accounts:    lookup returned HTTP ${accts.status} (skipped)`);
}

if (args.dryRun) {
  console.log(`dry-run:     would set ${ENV_KEY}=${customer.id} in .env.local`);
} else {
  const wrote = upsertEnvKey(
    ENV_PATH,
    ENV_KEY,
    customer.id,
    `Sample business customer (platformCustomerId: ${args.platformId}) — scripts/ensure-business-customer.mjs`,
  );
  console.log(`.env.local:  ${ENV_KEY} ${wrote}`);
}
