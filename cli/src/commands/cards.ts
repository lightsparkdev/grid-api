import { Command, InvalidArgumentError } from "commander";
import { GridClient, PaginatedResponse } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";
import { addSignedOptions, signedHeaders, validateSignedOptions } from "../signed";

interface Card {
  id: string;
  cardholderId: string;
  platformCardId?: string;
  status: "PENDING_KYC" | "PROCESSING" | "ACTIVE" | "FROZEN" | "CLOSED";
  form: "VIRTUAL";
  last4?: string;
  fundingSource: string;
  maxSpendPerTransaction: number | null;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

interface CardRevealResponse {
  panEmbedUrl: string;
  expiresAt: string;
}

function parseMaxSpendPerTransaction(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw new InvalidArgumentError(
      `--max-spend-per-transaction must be a positive integer (got "${value}")`
    );
  }
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount < 1) {
    throw new InvalidArgumentError(
      `--max-spend-per-transaction must be a positive integer within the safe range (got "${value}")`
    );
  }
  return amount;
}

function parseAccountId(value: string): string {
  const accountId = value.trim();
  if (accountId === "") {
    throw new InvalidArgumentError(
      "--funding-source must be a non-empty internal account ID"
    );
  }
  return accountId;
}

export function registerCardsCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  const cardsCmd = program.command("cards").description("Card management commands");

  cardsCmd
    .command("list")
    .description("List cards")
    .option("--cardholder-id <id>", "Filter by cardholder (customer) ID")
    .option("--account-id <id>", "Filter by a bound funding-source account ID")
    .option("--platform-card-id <id>", "Filter by platform card ID")
    .option("--status <status>", "Filter by status (PENDING_KYC, PROCESSING, ACTIVE, FROZEN, CLOSED)")
    .option("-l, --limit <number>", "Maximum results (default 20, max 100)", "20")
    .option("--cursor <cursor>", "Pagination cursor")
    .option("--sort <order>", "Sort order: asc or desc")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const limit = parseInt(options.limit, 10);
      if (Number.isNaN(limit)) {
        output(formatError("--limit must be a number"));
        process.exitCode = 1;
        return;
      }

      const params: Record<string, string | number | undefined> = {
        cardholderId: options.cardholderId,
        accountId: options.accountId,
        platformCardId: options.platformCardId,
        status: options.status,
        limit,
        cursor: options.cursor,
        sortOrder: options.sort,
      };

      const response = await client.get<PaginatedResponse<Card>>("/cards", params);
      outputResponse(response);
    });

  cardsCmd
    .command("get <cardId>")
    .description("Get card details")
    .action(async (cardId: string) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.get<Card>(`/cards/${cardId}`);
      outputResponse(response);
    });

  cardsCmd
    .command("create")
    .description("Issue a card")
    .requiredOption("--cardholder-id <id>", "Cardholder (customer) ID")
    .requiredOption(
      "--funding-source <id>",
      "Internal account ID that funds the card",
      parseAccountId
    )
    .option("--form <form>", "Card form (VIRTUAL)", "VIRTUAL")
    .option("--platform-card-id <id>", "Your platform's identifier for the card")
    .option(
      "--max-spend-per-transaction <amount>",
      "Maximum amount per transaction in the card currency's smallest unit",
      parseMaxSpendPerTransaction
    )
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const body: Record<string, unknown> = {
        cardholderId: options.cardholderId,
        form: options.form,
        fundingSource: options.fundingSource,
      };
      if (options.platformCardId) body.platformCardId = options.platformCardId;
      if (options.maxSpendPerTransaction !== undefined) {
        body.maxSpendPerTransaction = options.maxSpendPerTransaction;
      }

      const response = await client.post<Card>("/cards", body);
      outputResponse(response);
    });

  addSignedOptions(
    cardsCmd
      .command("update <cardId>")
      .description(
        "Update a card (freeze/unfreeze, replace the funding source, set a spending limit, or close)"
      )
      .option("--status <status>", "Target status: ACTIVE, FROZEN, or CLOSED")
      .option(
        "--funding-source <id>",
        "Replace the card's funding source",
        parseAccountId
      )
      .option(
        "--max-spend-per-transaction <amount>",
        "Set the maximum amount per transaction in the card currency's smallest unit",
        parseMaxSpendPerTransaction
      )
      .option(
        "--clear-max-spend-per-transaction",
        "Remove the per-transaction spending limit"
      )
  ).action(async (cardId: string, options) => {
    const opts = program.opts<GlobalOptions>();
    const client = getClient(opts);
    if (!client) return;
    if (!validateSignedOptions(options)) return;

    if (options.status && !["ACTIVE", "FROZEN", "CLOSED"].includes(options.status)) {
      output(formatError("--status must be ACTIVE, FROZEN, or CLOSED"));
      process.exitCode = 1;
      return;
    }

    if (
      !options.status &&
      options.fundingSource === undefined &&
      options.maxSpendPerTransaction === undefined &&
      !options.clearMaxSpendPerTransaction
    ) {
      output(
        formatError(
          "Provide --status, --funding-source, --max-spend-per-transaction, and/or --clear-max-spend-per-transaction"
        )
      );
      process.exitCode = 1;
      return;
    }
    if (
      options.maxSpendPerTransaction !== undefined &&
      options.clearMaxSpendPerTransaction
    ) {
      output(
        formatError(
          "--max-spend-per-transaction cannot be combined with --clear-max-spend-per-transaction"
        )
      );
      process.exitCode = 1;
      return;
    }
    if (
      options.status === "CLOSED" &&
      (options.fundingSource !== undefined ||
        options.maxSpendPerTransaction !== undefined ||
        options.clearMaxSpendPerTransaction)
    ) {
      output(
        formatError(
          "--status CLOSED cannot be combined with funding-source or spending-limit changes"
        )
      );
      process.exitCode = 1;
      return;
    }

    const body: Record<string, unknown> = {};
    if (options.status) body.status = options.status;
    if (options.fundingSource !== undefined) {
      body.fundingSource = options.fundingSource;
    }
    if (options.maxSpendPerTransaction !== undefined) {
      body.maxSpendPerTransaction = options.maxSpendPerTransaction;
    } else if (options.clearMaxSpendPerTransaction) {
      body.maxSpendPerTransaction = null;
    }

    const response = await client.patch<Card>(
      `/cards/${cardId}`,
      body,
      signedHeaders(options)
    );
    outputResponse(response);
  });

  cardsCmd
    .command("reveal <cardId>")
    .description("Reveal card details — prints a short-lived panEmbedUrl to render in an iframe (do not store it)")
    .action(async (cardId: string) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.post<CardRevealResponse>(
        `/cards/${cardId}/reveal`
      );
      outputResponse(response);
    });
}
