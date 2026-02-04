import { Command } from "commander";
import { GridClient, PaginatedResponse } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";
import {
  validateAmount,
  validateLockSide,
  validateDate,
  validateCurrency,
  validateAll,
  parseAmount,
} from "../validation";

interface Quote {
  id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "EXPIRED";
  source: {
    accountId?: string;
    customerId?: string;
    currency: string;
  };
  destination: {
    accountId?: string;
    umaAddress?: string;
    currency: string;
  };
  lockedCurrencySide: "SENDING" | "RECEIVING";
  lockedCurrencyAmount: number;
  sendingAmount: number;
  sendingCurrency: string;
  receivingAmount: number;
  receivingCurrency: string;
  exchangeRate: number;
  fees?: Array<{
    type: string;
    amount: number;
    currency: string;
  }>;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export function registerQuotesCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  const quotesCmd = program
    .command("quotes")
    .description("Quote management commands");

  quotesCmd
    .command("list")
    .description("List transfer quotes")
    .option("-l, --limit <number>", "Maximum results (default 20, max 100)", "20")
    .option("--cursor <cursor>", "Pagination cursor")
    .option("--customer-id <id>", "Filter by sending customer ID")
    .option("--sending-account <id>", "Filter by sending account ID")
    .option("--receiving-account <id>", "Filter by receiving account ID")
    .option("--sending-uma <address>", "Filter by sending UMA address")
    .option("--receiving-uma <address>", "Filter by receiving UMA address")
    .option("--status <status>", "Filter by status (PENDING, PROCESSING, COMPLETED, FAILED, EXPIRED)")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const params: Record<string, string | number | undefined> = {
        limit: parseInt(options.limit, 10),
        cursor: options.cursor,
        customerId: options.customerId,
        sendingAccountId: options.sendingAccount,
        receivingAccountId: options.receivingAccount,
        sendingUmaAddress: options.sendingUma,
        receivingUmaAddress: options.receivingUma,
        status: options.status,
      };

      const response = await client.get<PaginatedResponse<Quote>>(
        "/quotes",
        params
      );
      outputResponse(response);
    });

  quotesCmd
    .command("get <quoteId>")
    .description("Get quote details")
    .action(async (quoteId: string) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.get<Quote>(`/quotes/${quoteId}`);
      outputResponse(response);
    });

  quotesCmd
    .command("create")
    .description("Create a transfer quote")
    .requiredOption("--amount <number>", "Amount in smallest currency unit (e.g., cents)")
    .requiredOption("--lock-side <side>", "Lock SENDING or RECEIVING amount")
    .option("--source-account <id>", "Source account ID (InternalAccount:...)")
    .option("--source-customer <id>", "Source customer ID (for customer-funded quotes)")
    .option("--source-currency <code>", "Source currency (required with --source-customer)")
    .option("--dest-account <id>", "Destination account ID")
    .option("--dest-uma <address>", "Destination UMA address")
    .option("--dest-currency <code>", "Destination currency")
    .option("--description <text>", "Transfer description")
    .option("--lookup-id <id>", "Lookup request ID (from receiver lookup)")
    .option("--immediate", "Execute the quote immediately after creation")
    .option("--sender-name <name>", "Sender full name (for UMA destinations)")
    .option("--sender-birth-date <date>", "Sender birth date YYYY-MM-DD (for UMA destinations)")
    .option("--sender-nationality <code>", "Sender nationality country code (for UMA destinations)")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const validations = [
        validateAmount(options.amount, "amount"),
        validateLockSide(options.lockSide),
      ];
      if (options.sourceCurrency) {
        validations.push(validateCurrency(options.sourceCurrency, "source-currency"));
      }
      if (options.destCurrency) {
        validations.push(validateCurrency(options.destCurrency, "dest-currency"));
      }
      if (options.senderBirthDate) {
        validations.push(validateDate(options.senderBirthDate, "sender-birth-date"));
      }
      const validation = validateAll(validations);
      if (!validation.valid) {
        output(formatError(validation.error!));
        process.exitCode = 1;
        return;
      }

      const body: Record<string, unknown> = {
        lockedCurrencyAmount: parseAmount(options.amount),
        lockedCurrencySide: options.lockSide,
      };

      if (options.sourceAccount) {
        body.source = { accountId: options.sourceAccount };
      } else if (options.sourceCustomer) {
        body.source = {
          customerId: options.sourceCustomer,
          currency: options.sourceCurrency,
        };
      }

      if (options.destAccount) {
        body.destination = {
          accountId: options.destAccount,
          currency: options.destCurrency,
        };
      } else if (options.destUma) {
        body.destination = {
          umaAddress: options.destUma,
          currency: options.destCurrency,
        };
      }

      if (options.description) body.description = options.description;
      if (options.lookupId) body.lookupId = options.lookupId;
      if (options.immediate) body.immediatelyExecute = true;

      const senderInfo: Record<string, string> = {};
      if (options.senderName) senderInfo.FULL_NAME = options.senderName;
      if (options.senderBirthDate) senderInfo.BIRTH_DATE = options.senderBirthDate;
      if (options.senderNationality) senderInfo.NATIONALITY = options.senderNationality;
      if (Object.keys(senderInfo).length > 0) {
        body.senderCustomerInfo = senderInfo;
      }

      const response = await client.post<Quote>("/quotes", body);
      outputResponse(response);
    });

  quotesCmd
    .command("execute <quoteId>")
    .description("Execute a pending quote")
    .action(async (quoteId: string) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.post<Quote>(`/quotes/${quoteId}/execute`);
      outputResponse(response);
    });
}
