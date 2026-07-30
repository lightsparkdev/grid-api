import { Command } from "commander";
import { GridClient, PaginatedResponse } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";

interface CurrencyAmount {
  amount: number;
  currency: { code: string; name?: string; symbol?: string; decimals?: number };
}

interface Transaction {
  id: string;
  type: "INCOMING" | "OUTGOING" | "CARD";
  direction?: string;
  status: string;
  customerId?: string;
  platformCustomerId?: string;
  source?: Record<string, unknown>;
  destination?: Record<string, unknown>;
  receivedAmount?: CurrencyAmount;
  sentAmount?: CurrencyAmount;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export function registerTransactionsCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  const transactionsCmd = program
    .command("transactions")
    .description("Transaction management commands");

  transactionsCmd
    .command("list")
    .description("List transactions")
    .option("-l, --limit <number>", "Maximum results (default 20, max 100)", "20")
    .option("--cursor <cursor>", "Pagination cursor")
    .option("--customer-id <id>", "Filter by customer ID")
    .option("--platform-customer-id <id>", "Filter by platform customer ID")
    .option("--sender <id>", "Filter by sender account identifier")
    .option("--receiver <id>", "Filter by receiver account identifier")
    .option("--account-identifier <id>", "Filter by an account identifier matching either sender or receiver")
    .option("--status <status>", "Filter by status")
    .option("--type <type>", "Filter by type (INCOMING or OUTGOING)")
    .option("--reference <ref>", "Filter by reference")
    .option("--start-date <date>", "Filter by start date (ISO 8601)")
    .option("--end-date <date>", "Filter by end date (ISO 8601)")
    .option("--sort <order>", "Sort order: asc or desc (default: desc)")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const params: Record<string, string | number | undefined> = {
        limit: parseInt(options.limit, 10),
        cursor: options.cursor,
        customerId: options.customerId,
        platformCustomerId: options.platformCustomerId,
        senderAccountIdentifier: options.sender,
        receiverAccountIdentifier: options.receiver,
        accountIdentifier: options.accountIdentifier,
        status: options.status,
        type: options.type,
        reference: options.reference,
        startDate: options.startDate,
        endDate: options.endDate,
        sortOrder: options.sort,
      };

      const response = await client.get<PaginatedResponse<Transaction>>(
        "/transactions",
        params
      );
      outputResponse(response);
    });

  transactionsCmd
    .command("get <transactionId>")
    .description("Get transaction details")
    .action(async (transactionId: string) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.get<Transaction>(
        `/transactions/${transactionId}`
      );
      outputResponse(response);
    });

  transactionsCmd
    .command("approve <transactionId>")
    .description("Approve an incoming payment transaction")
    .option(
      "--receiver-customer-info <json>",
      "Requested receiver customer info as a JSON object"
    )
    .action(async (transactionId: string, options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      let body: Record<string, unknown> | undefined;
      if (options.receiverCustomerInfo) {
        try {
          body = { receiverCustomerInfo: JSON.parse(options.receiverCustomerInfo) };
        } catch {
          output(formatError("Invalid JSON for --receiver-customer-info"));
          process.exitCode = 1;
          return;
        }
      }

      const response = await client.post<Transaction>(
        `/transactions/${transactionId}/approve`,
        body
      );
      outputResponse(response);
    });

  transactionsCmd
    .command("reject <transactionId>")
    .description("Reject an incoming payment transaction")
    .option("--reason <reason>", "Rejection reason")
    .action(async (transactionId: string, options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const body = options.reason ? { reason: options.reason } : undefined;
      const response = await client.post<Transaction>(
        `/transactions/${transactionId}/reject`,
        body
      );
      outputResponse(response);
    });
}
