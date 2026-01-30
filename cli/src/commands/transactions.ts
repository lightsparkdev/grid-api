import { Command } from "commander";
import { GridClient, PaginatedResponse } from "../client";
import { outputResponse } from "../output";
import { GlobalOptions } from "../index";

interface Transaction {
  id: string;
  type: "INCOMING" | "OUTGOING";
  status: string;
  amount: number;
  currency: string;
  senderAccountIdentifier?: string;
  receiverAccountIdentifier?: string;
  reference?: string;
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
    .action(async (transactionId: string) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.post<Transaction>(
        `/transactions/${transactionId}/approve`
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
