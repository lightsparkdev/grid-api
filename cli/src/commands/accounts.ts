import { Command } from "commander";
import { GridClient, PaginatedResponse } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";
import { validateCurrency, validateDate, validateAll } from "../validation";

interface InternalAccount {
  id: string;
  customerId?: string;
  currency: string;
  balance: number;
  availableBalance: number;
  status: string;
  paymentInstructions?: unknown;
  createdAt: string;
  updatedAt: string;
}

interface ExternalAccount {
  id: string;
  customerId: string;
  currency: string;
  accountInfo: {
    accountType: string;
    [key: string]: unknown;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function registerAccountsCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  const accountsCmd = program
    .command("accounts")
    .description("Account management commands");

  const internalCmd = accountsCmd
    .command("internal")
    .description("Internal account commands");

  internalCmd
    .command("list")
    .description("List internal accounts (balances)")
    .option("-l, --limit <number>", "Maximum results (default 20, max 100)", "20")
    .option("--cursor <cursor>", "Pagination cursor")
    .option("--customer-id <id>", "Filter by customer ID")
    .option("--currency <code>", "Filter by currency code")
    .option("--platform", "List platform internal accounts instead of customer accounts")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      if (options.currency) {
        const validation = validateCurrency(options.currency, "currency");
        if (!validation.valid) {
          output(formatError(validation.error!));
          process.exitCode = 1;
          return;
        }
      }

      const params: Record<string, string | number | undefined> = {
        limit: parseInt(options.limit, 10),
        cursor: options.cursor,
        customerId: options.customerId,
        currency: options.currency,
      };

      const endpoint = options.platform
        ? "/platform/internal-accounts"
        : "/customers/internal-accounts";

      const response = await client.get<PaginatedResponse<InternalAccount>>(
        endpoint,
        params
      );
      outputResponse(response);
    });

  const externalCmd = accountsCmd
    .command("external")
    .description("External account commands");

  externalCmd
    .command("list")
    .description("List external accounts")
    .option("-l, --limit <number>", "Maximum results (default 20, max 100)", "20")
    .option("--cursor <cursor>", "Pagination cursor")
    .option("--customer-id <id>", "Filter by customer ID")
    .option("--currency <code>", "Filter by currency code")
    .option("--platform", "List platform external accounts instead of customer accounts")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      if (options.currency) {
        const validation = validateCurrency(options.currency, "currency");
        if (!validation.valid) {
          output(formatError(validation.error!));
          process.exitCode = 1;
          return;
        }
      }

      const params: Record<string, string | number | undefined> = {
        limit: parseInt(options.limit, 10),
        cursor: options.cursor,
        customerId: options.customerId,
        currency: options.currency,
      };

      const endpoint = options.platform
        ? "/platform/external-accounts"
        : "/customers/external-accounts";

      const response = await client.get<PaginatedResponse<ExternalAccount>>(
        endpoint,
        params
      );
      outputResponse(response);
    });

  externalCmd
    .command("create")
    .description("Create an external account")
    .requiredOption("--customer-id <id>", "Customer ID")
    .requiredOption("--currency <code>", "Currency code (USD, MXN, BRL, EUR, etc.)")
    .requiredOption("--account-type <type>", "Account type (US_ACCOUNT, CLABE, PIX, IBAN, UPI, NGN_ACCOUNT, SPARK_WALLET, etc.)")
    .option("--account-number <number>", "Account number (for US_ACCOUNT, NGN_ACCOUNT)")
    .option("--routing-number <number>", "Routing number (for US_ACCOUNT)")
    .option("--account-category <cat>", "Account category: CHECKING or SAVINGS (for US_ACCOUNT)")
    .option("--clabe <number>", "CLABE number (for Mexico)")
    .option("--pix-key <key>", "PIX key (for Brazil)")
    .option("--pix-key-type <type>", "PIX key type: CPF, CNPJ, EMAIL, PHONE, RANDOM (for Brazil)")
    .option("--tax-id <id>", "Tax ID of the account holder (for Brazil PIX)")
    .option("--iban <number>", "IBAN (for Europe)")
    .option("--upi-id <id>", "UPI ID (for India)")
    .option("--bank-name <name>", "Bank name (for NGN_ACCOUNT)")
    .option("--purpose <purpose>", "Purpose of payment (for NGN_ACCOUNT): GIFT, SELF, GOODS_OR_SERVICES, EDUCATION, etc.")
    .option("--address <addr>", "Wallet address (for SPARK_WALLET, SOLANA_WALLET, etc.)")
    .option("--beneficiary-type <type>", "Beneficiary type: INDIVIDUAL or BUSINESS")
    .option("--beneficiary-name <name>", "Beneficiary full name (individual) or legal name (business)")
    .option("--beneficiary-birth-date <date>", "Beneficiary birth date YYYY-MM-DD (individual)")
    .option("--beneficiary-nationality <code>", "Beneficiary nationality country code (individual)")
    .option("--beneficiary-address-line1 <line>", "Beneficiary address line 1")
    .option("--beneficiary-address-city <city>", "Beneficiary city")
    .option("--beneficiary-address-state <state>", "Beneficiary state")
    .option("--beneficiary-address-postal <code>", "Beneficiary postal code")
    .option("--beneficiary-address-country <country>", "Beneficiary country code")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const validations = [validateCurrency(options.currency, "currency")];
      if (options.beneficiaryBirthDate) {
        validations.push(validateDate(options.beneficiaryBirthDate, "beneficiary-birth-date"));
      }
      const validation = validateAll(validations);
      if (!validation.valid) {
        output(formatError(validation.error!));
        process.exitCode = 1;
        return;
      }

      const accountInfo: Record<string, unknown> = {
        accountType: options.accountType,
      };

      switch (options.accountType) {
        case "US_ACCOUNT":
          if (options.accountNumber) accountInfo.accountNumber = options.accountNumber;
          if (options.routingNumber) accountInfo.routingNumber = options.routingNumber;
          if (options.accountCategory) accountInfo.accountCategory = options.accountCategory;
          break;
        case "CLABE":
          if (options.clabe) accountInfo.clabeNumber = options.clabe;
          break;
        case "PIX":
          if (options.pixKey) accountInfo.pixKey = options.pixKey;
          if (options.pixKeyType) accountInfo.pixKeyType = options.pixKeyType;
          if (options.taxId) accountInfo.taxId = options.taxId;
          break;
        case "IBAN":
          if (options.iban) accountInfo.iban = options.iban;
          break;
        case "UPI":
          if (options.upiId) accountInfo.vpa = options.upiId;
          break;
        case "NGN_ACCOUNT":
          if (options.accountNumber) accountInfo.accountNumber = options.accountNumber;
          if (options.bankName) accountInfo.bankName = options.bankName;
          if (options.purpose) accountInfo.purposeOfPayment = options.purpose;
          break;
        case "SPARK_WALLET":
        case "SOLANA_WALLET":
        case "TRON_WALLET":
        case "POLYGON_WALLET":
        case "BASE_WALLET":
          if (options.address) accountInfo.address = options.address;
          break;
      }

      if (options.beneficiaryType || options.beneficiaryName) {
        const beneficiary: Record<string, unknown> = {};
        if (options.beneficiaryType) beneficiary.beneficiaryType = options.beneficiaryType;

        if (options.beneficiaryType === "INDIVIDUAL") {
          if (options.beneficiaryName) beneficiary.fullName = options.beneficiaryName;
          if (options.beneficiaryBirthDate) beneficiary.birthDate = options.beneficiaryBirthDate;
          if (options.beneficiaryNationality) beneficiary.nationality = options.beneficiaryNationality;
        } else if (options.beneficiaryType === "BUSINESS") {
          if (options.beneficiaryName) beneficiary.legalName = options.beneficiaryName;
        }

        if (options.beneficiaryAddressLine1 || options.beneficiaryAddressCity) {
          beneficiary.address = {
            line1: options.beneficiaryAddressLine1,
            city: options.beneficiaryAddressCity,
            state: options.beneficiaryAddressState,
            postalCode: options.beneficiaryAddressPostal,
            country: options.beneficiaryAddressCountry,
          };
        }

        accountInfo.beneficiary = beneficiary;
      }

      const body = {
        customerId: options.customerId,
        currency: options.currency,
        accountInfo,
      };

      const response = await client.post<ExternalAccount>(
        "/customers/external-accounts",
        body
      );
      outputResponse(response);
    });
}
