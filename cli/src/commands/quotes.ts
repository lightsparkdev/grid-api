import { Command } from "commander";
import { GridClient } from "../client";
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

interface Currency {
  code: string;
  name?: string;
  symbol?: string;
  decimals?: number;
}

interface Quote {
  id: string;
  status:
    | "PENDING"
    | "PENDING_AUTHORIZATION"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "EXPIRED";
  source: Record<string, unknown>;
  destination: Record<string, unknown>;
  sendingCurrency: Currency;
  receivingCurrency: Currency;
  totalSendingAmount: number;
  totalReceivingAmount: number;
  feesIncluded: number;
  exchangeRate: number;
  transactionId: string;
  expiresAt: string;
  createdAt: string;
}

export function registerQuotesCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  const quotesCmd = program
    .command("quotes")
    .description("Quote management commands");

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
    .option("--purpose-of-payment <purpose>", "Purpose of payment (GOODS_OR_SERVICES, GIFT, SELF, EDUCATION, etc.)")
    .option("--remittance-information <text>", "Free-form remittance information (max 80 chars)")
    .option("--payment-rail <rail>", "Payment rail for an ACCOUNT destination")
    .option("--crypto-network <network>", "Crypto network for a stablecoin realtime-funding source")
    .option("--fbo-customer <id>", "Customer ID when funding from an FBO account (ACCOUNT source)")
    .option("--sca-factor <factor>", "Preferred SCA factor (SMS_OTP or PASSKEY)")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const validations = [
        validateAmount(options.amount, "amount"),
        validateLockSide(options.lockSide),
      ];
      // A realtime-funding source requires a currency.
      if (
        (options.sourceCustomer || options.cryptoNetwork) &&
        !options.sourceAccount &&
        !options.sourceCurrency
      ) {
        validations.push({
          valid: false,
          error:
            "--source-currency is required for a realtime-funding source (--source-customer or --crypto-network)",
        });
      }
      // --crypto-network only applies to a realtime-funding source; it's ignored
      // for an ACCOUNT source, so reject the combination rather than silently drop it.
      if (options.cryptoNetwork && options.sourceAccount) {
        validations.push({
          valid: false,
          error:
            "--crypto-network only applies to a realtime-funding source, not --source-account",
        });
      }
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
        const source: Record<string, unknown> = {
          sourceType: "ACCOUNT",
          accountId: options.sourceAccount,
        };
        if (options.fboCustomer) source.customerId = options.fboCustomer;
        body.source = source;
      } else if (options.sourceCustomer || options.sourceCurrency) {
        const source: Record<string, unknown> = {
          sourceType: "REALTIME_FUNDING",
          currency: options.sourceCurrency,
        };
        if (options.sourceCustomer) source.customerId = options.sourceCustomer;
        if (options.cryptoNetwork) source.cryptoNetwork = options.cryptoNetwork;
        body.source = source;
      }

      if (options.destAccount) {
        const destination: Record<string, unknown> = {
          destinationType: "ACCOUNT",
          accountId: options.destAccount,
        };
        if (options.paymentRail) destination.paymentRail = options.paymentRail;
        body.destination = destination;
      } else if (options.destUma) {
        body.destination = {
          destinationType: "UMA_ADDRESS",
          umaAddress: options.destUma,
          currency: options.destCurrency,
        };
      }

      if (options.description) body.description = options.description;
      if (options.lookupId) body.lookupId = options.lookupId;
      if (options.immediate) body.immediatelyExecute = true;
      if (options.remittanceInformation)
        body.remittanceInformation = options.remittanceInformation;
      if (options.purposeOfPayment)
        body.purposeOfPayment = options.purposeOfPayment;
      if (options.scaFactor) body.scaFactor = options.scaFactor;

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
    .option("--sca-factor <factor>", "Preferred SCA factor (SMS_OTP or PASSKEY)")
    .action(async (quoteId: string, options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const body = options.scaFactor
        ? { scaFactor: options.scaFactor }
        : undefined;

      const response = await client.post<Quote>(
        `/quotes/${quoteId}/execute`,
        body
      );
      outputResponse(response);
    });
}
