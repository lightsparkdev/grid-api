import { Command, InvalidArgumentError } from "commander";
import { GridClient } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";
import { confirm } from "../prompt";
import { addSignedOptions, signedHeaders, validateSignedOptions } from "../signed";

interface AuthListResponse<T> {
  data: T[];
}

interface AuthMethod {
  id: string;
  accountId: string;
  type: string;
  nickname?: string;
  createdAt: string;
  updatedAt: string;
}

interface DelegatedKey {
  id: string;
  cardId: string;
  accountId: string;
  nickname: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthSession {
  id: string;
  accountId: string;
  type: string;
  createdAt: string;
  expiresAt: string;
}

// Collects a repeated "CURRENCY:amount" flag into spending-limit objects.
// Amounts are integers in the smallest currency unit; a malformed or non-integer
// value is rejected up front rather than silently sent as null.
function collectSpendingLimit(
  value: string,
  previous: Array<{ currencyCode: string; maxPerTransaction: number }> = []
): Array<{ currencyCode: string; maxPerTransaction: number }> {
  const match = /^([A-Z0-9]{3,16}):(\d+)$/.exec(value);
  if (!match) {
    throw new InvalidArgumentError(
      `expected CURRENCY:amount with an uppercase code and an integer amount, e.g. USD:5000 (got "${value}")`
    );
  }
  const maxPerTransaction = Number(match[2]);
  if (!Number.isSafeInteger(maxPerTransaction) || maxPerTransaction < 1) {
    throw new InvalidArgumentError(
      `spending limit amount must be a positive integer within the safe range (got "${value}")`
    );
  }
  return [...previous, { currencyCode: match[1], maxPerTransaction }];
}

export function registerAuthCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  const authCmd = program
    .command("auth")
    .description("Authentication commands (credentials, delegated keys, sessions)");

  const credentialsCmd = authCmd
    .command("credentials")
    .description("Authentication credential commands");

  credentialsCmd
    .command("list")
    .description("List authentication credentials for an internal account")
    .requiredOption("--account-id <id>", "Internal account ID")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.get<AuthListResponse<AuthMethod>>(
        "/auth/credentials",
        { accountId: options.accountId }
      );
      outputResponse(response);
    });

  addSignedOptions(
    credentialsCmd
      .command("create")
      .description("Create an authentication credential")
      .requiredOption("--type <type>", "Credential type: EMAIL_OTP, SMS_OTP, OAUTH, PASSKEY")
      .requiredOption("--account-id <id>", "Internal account ID")
      .option("--oidc-token <token>", "OIDC ID token (OAUTH)")
      .option("--nickname <name>", "Credential nickname (PASSKEY)")
      .option("--challenge <challenge>", "Registration challenge (PASSKEY)")
      .option("--attestation <json>", "WebAuthn attestation as JSON (PASSKEY)")
  ).action(async (options) => {
    const opts = program.opts<GlobalOptions>();
    const client = getClient(opts);
    if (!client) return;
    if (!validateSignedOptions(options)) return;

    const body: Record<string, unknown> = {
      type: options.type,
      accountId: options.accountId,
    };
    if (options.oidcToken) body.oidcToken = options.oidcToken;
    if (options.nickname) body.nickname = options.nickname;
    if (options.challenge) body.challenge = options.challenge;
    if (options.attestation) {
      const parsed = parseJson(options.attestation, "attestation");
      if ("error" in parsed) {
        output(formatError(parsed.error));
        process.exitCode = 1;
        return;
      }
      body.attestation = parsed.value;
    }

    const response = await client.post<AuthMethod>(
      "/auth/credentials",
      body,
      signedHeaders(options)
    );
    outputResponse(response);
  });

  credentialsCmd
    .command("challenge <credentialId>")
    .description("Re-issue a credential challenge (e.g. resend an OTP)")
    .option(
      "--client-public-key <hex>",
      "Client P-256 public key — required to re-challenge a PASSKEY credential"
    )
    .action(async (credentialId: string, options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const body = options.clientPublicKey
        ? { clientPublicKey: options.clientPublicKey }
        : undefined;

      const response = await client.post<AuthMethod>(
        `/auth/credentials/${credentialId}/challenge`,
        body
      );
      outputResponse(response);
    });

  addSignedOptions(
    credentialsCmd
      .command("verify <credentialId>")
      .description("Verify an authentication credential")
      .requiredOption("--type <type>", "Credential type: EMAIL_OTP, SMS_OTP, OAUTH, PASSKEY")
      .option("--encrypted-otp-bundle <bundle>", "HPKE-sealed OTP bundle (EMAIL_OTP/SMS_OTP)")
      .option("--oidc-token <token>", "OIDC ID token (OAUTH)")
      .option("--client-public-key <hex>", "Client P-256 public key (OAUTH)")
      .option("--assertion <json>", "WebAuthn assertion as JSON (PASSKEY)")
  ).action(async (credentialId: string, options) => {
    const opts = program.opts<GlobalOptions>();
    const client = getClient(opts);
    if (!client) return;
    if (!validateSignedOptions(options)) return;

    const body: Record<string, unknown> = { type: options.type };
    if (options.encryptedOtpBundle)
      body.encryptedOtpBundle = options.encryptedOtpBundle;
    if (options.oidcToken) body.oidcToken = options.oidcToken;
    if (options.clientPublicKey) body.clientPublicKey = options.clientPublicKey;
    if (options.assertion) {
      const parsed = parseJson(options.assertion, "assertion");
      if ("error" in parsed) {
        output(formatError(parsed.error));
        process.exitCode = 1;
        return;
      }
      body.assertion = parsed.value;
    }

    const response = await client.post<AuthMethod>(
      `/auth/credentials/${credentialId}/verify`,
      body,
      signedHeaders(options)
    );
    outputResponse(response);
  });

  addSignedOptions(
    credentialsCmd
      .command("revoke <credentialId>")
      .description("Revoke an authentication credential")
      .option("-y, --yes", "Skip confirmation prompt")
  ).action(async (credentialId: string, options) => {
    const opts = program.opts<GlobalOptions>();
    const client = getClient(opts);
    if (!client) return;
    if (!validateSignedOptions(options)) return;

    if (!options.yes) {
      const confirmed = await confirm(
        `Revoke credential ${credentialId}? This cannot be undone.`
      );
      if (!confirmed) {
        console.log("Aborted.");
        return;
      }
    }

    const response = await client.delete<void>(
      `/auth/credentials/${credentialId}`,
      signedHeaders(options)
    );
    outputResponse(response);
  });

  const delegatedKeysCmd = authCmd
    .command("delegated-keys")
    .description("Delegated signing key commands");

  delegatedKeysCmd
    .command("list")
    .description("List delegated signing keys")
    .option("--account-id <id>", "Internal account ID")
    .option("--funding-source-id <id>", "Funding source ID")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      if (!options.accountId && !options.fundingSourceId) {
        output(
          formatError("Provide --account-id or --funding-source-id")
        );
        process.exitCode = 1;
        return;
      }

      const response = await client.get<AuthListResponse<DelegatedKey>>(
        "/auth/delegated-keys",
        {
          accountId: options.accountId,
          fundingSourceId: options.fundingSourceId,
        }
      );
      outputResponse(response);
    });

  delegatedKeysCmd
    .command("get <delegatedKeyId>")
    .description("Get a delegated signing key")
    .action(async (delegatedKeyId: string) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.get<DelegatedKey>(
        `/auth/delegated-keys/${delegatedKeyId}`
      );
      outputResponse(response);
    });

  addSignedOptions(
    delegatedKeysCmd
      .command("create")
      .description("Create a delegated signing key")
      .requiredOption("--card-id <id>", "Card ID")
      .requiredOption("--internal-account-id <id>", "Embedded Wallet internal account ID")
      .requiredOption("--nickname <name>", "Human-readable label for the key")
      .option(
        "--spending-limit <CUR:amount>",
        "Per-transaction limit, e.g. USD:5000 (repeatable)",
        collectSpendingLimit
      )
  ).action(async (options) => {
    const opts = program.opts<GlobalOptions>();
    const client = getClient(opts);
    if (!client) return;
    if (!validateSignedOptions(options)) return;

    const body: Record<string, unknown> = {
      cardId: options.cardId,
      internalAccountId: options.internalAccountId,
      nickname: options.nickname,
    };
    if (options.spendingLimit) body.spendingLimits = options.spendingLimit;

    const response = await client.post<DelegatedKey>(
      "/auth/delegated-keys",
      body,
      signedHeaders(options)
    );
    outputResponse(response);
  });

  delegatedKeysCmd
    .command("revoke <delegatedKeyId>")
    .description("Revoke a delegated signing key")
    .option("-y, --yes", "Skip confirmation prompt")
    .action(async (delegatedKeyId: string, options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      if (!options.yes) {
        const confirmed = await confirm(
          `Revoke delegated key ${delegatedKeyId}? This cannot be undone.`
        );
        if (!confirmed) {
          console.log("Aborted.");
          return;
        }
      }

      const response = await client.delete<void>(
        `/auth/delegated-keys/${delegatedKeyId}`
      );
      outputResponse(response);
    });

  const sessionsCmd = authCmd
    .command("sessions")
    .description("Authentication session commands");

  sessionsCmd
    .command("list")
    .description("List active authentication sessions")
    .requiredOption("--account-id <id>", "Internal account ID")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.get<AuthListResponse<AuthSession>>(
        "/auth/sessions",
        { accountId: options.accountId }
      );
      outputResponse(response);
    });

  addSignedOptions(
    sessionsCmd
      .command("revoke <sessionId>")
      .description("Revoke an authentication session")
      .option("-y, --yes", "Skip confirmation prompt")
  ).action(async (sessionId: string, options) => {
    const opts = program.opts<GlobalOptions>();
    const client = getClient(opts);
    if (!client) return;
    if (!validateSignedOptions(options)) return;

    if (!options.yes) {
      const confirmed = await confirm(
        `Revoke session ${sessionId}? This cannot be undone.`
      );
      if (!confirmed) {
        console.log("Aborted.");
        return;
      }
    }

    const response = await client.delete<void>(
      `/auth/sessions/${sessionId}`,
      signedHeaders(options)
    );
    outputResponse(response);
  });

  addSignedOptions(
    sessionsCmd
      .command("refresh <sessionId>")
      .description("Refresh an authentication session")
      .requiredOption("--client-public-key <hex>", "Client-generated P-256 public key (uncompressed SEC1 hex)")
  ).action(async (sessionId: string, options) => {
    const opts = program.opts<GlobalOptions>();
    const client = getClient(opts);
    if (!client) return;
    if (!validateSignedOptions(options)) return;

    const response = await client.post<AuthSession>(
      `/auth/sessions/${sessionId}/refresh`,
      { clientPublicKey: options.clientPublicKey },
      signedHeaders(options)
    );
    outputResponse(response);
  });
}

function parseJson(
  value: string,
  flag: string
): { value: unknown } | { error: string } {
  try {
    return { value: JSON.parse(value) };
  } catch {
    return { error: `Invalid JSON for --${flag}` };
  }
}
