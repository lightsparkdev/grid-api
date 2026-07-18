import { Command } from "commander";
import { GridClient, PaginatedResponse } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";
import {
  validateCurrency,
  validateDate,
  validateAll,
  ValidationResult,
} from "../validation";

interface CurrencyAmount {
  amount: number;
  currency: { code: string; name?: string; symbol?: string; decimals?: number };
}

interface InternalAccount {
  id: string;
  customerId?: string;
  type: string;
  status: string;
  balance: CurrencyAmount;
  totalBalance: CurrencyAmount;
  fundingPaymentInstructions?: unknown[];
  privateEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExternalAccount {
  id: string;
  customerId?: string;
  platformAccountId?: string;
  currency: string;
  accountInfo: {
    accountType: string;
    [key: string]: unknown;
  };
  defaultUmaDepositAccount?: boolean;
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
    .option("--type <type>", "Filter by account type (EMBEDDED_WALLET, INTERNAL_FIAT, INTERNAL_CRYPTO)")
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

      // The platform endpoint only supports currency + type; the customer
      // endpoint additionally supports pagination and customerId.
      const params: Record<string, string | number | undefined> = options.platform
        ? { currency: options.currency, type: options.type }
        : {
            limit: parseInt(options.limit, 10),
            cursor: options.cursor,
            customerId: options.customerId,
            currency: options.currency,
            type: options.type,
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

      // The platform endpoint does not accept a customerId filter.
      const params: Record<string, string | number | undefined> = options.platform
        ? {
            limit: parseInt(options.limit, 10),
            cursor: options.cursor,
            currency: options.currency,
          }
        : {
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
    .requiredOption(
      "--account-type <type>",
      "Account type discriminator (e.g. USD_ACCOUNT, MXN_ACCOUNT, BRL_ACCOUNT, EUR_ACCOUNT, INR_ACCOUNT, NGN_ACCOUNT, SPARK_WALLET)"
    )
    .option("--account-number <number>", "Bank account number")
    .option("--routing-number <number>", "ABA routing number (USD)")
    .option("--clabe <number>", "CLABE number (MXN)")
    .option("--pix-key <key>", "PIX key (BRL)")
    .option("--pix-key-type <type>", "PIX key type: CPF, CNPJ, EMAIL, PHONE, RANDOM (BRL)")
    .option("--tax-id <id>", "Tax ID of the account holder (BRL PIX)")
    .option("--iban <number>", "IBAN (EUR and others)")
    .option("--swift-code <code>", "SWIFT/BIC code (EUR and others)")
    .option("--upi-id <id>", "UPI virtual payment address (INR UPI)")
    .option("--ifsc <code>", "IFSC code (INR NEFT/RTGS)")
    .option("--rail <rail>", "Payment rail, e.g. NEFT or RTGS (INR)")
    .option("--bank-name <name>", "Bank name")
    .option("--address <addr>", "Wallet address (for SPARK_WALLET, SOLANA_WALLET, etc.)")
    .option("--platform-account-id <id>", "Your platform's identifier for this account")
    .option("--default-uma-deposit-account", "Set as the default UMA deposit account")
    .option("--beneficiary-type <type>", "Beneficiary type: INDIVIDUAL or BUSINESS")
    .option("--beneficiary-name <name>", "Beneficiary full name (individual) or legal name (business)")
    .option("--beneficiary-birth-date <date>", "Beneficiary birth date YYYY-MM-DD (individual)")
    .option("--beneficiary-nationality <code>", "Beneficiary nationality country code (individual)")
    .option("--beneficiary-registration-number <number>", "Beneficiary registration number (business)")
    .option("--beneficiary-tax-id <id>", "Beneficiary tax ID (business)")
    .option("--beneficiary-email <email>", "Beneficiary email")
    .option("--beneficiary-phone <phone>", "Beneficiary phone number")
    .option("--beneficiary-country-of-residence <code>", "Beneficiary country of residence")
    .option("--beneficiary-address-line1 <line>", "Beneficiary address line 1")
    .option("--beneficiary-address-line2 <line>", "Beneficiary address line 2")
    .option("--beneficiary-address-city <city>", "Beneficiary city")
    .option("--beneficiary-address-state <state>", "Beneficiary state")
    .option("--beneficiary-address-postal <code>", "Beneficiary postal code")
    .option("--beneficiary-address-country <country>", "Beneficiary country code")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const validations = [
        validateCurrency(options.currency, "currency"),
        validateBeneficiaryInput(options),
      ];
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
      const setInfo = (key: string, value: string | undefined) => {
        if (value !== undefined) accountInfo[key] = value;
      };
      setInfo("accountNumber", options.accountNumber);
      setInfo("routingNumber", options.routingNumber);
      setInfo("clabeNumber", options.clabe);
      setInfo("pixKey", options.pixKey);
      setInfo("pixKeyType", options.pixKeyType);
      setInfo("taxId", options.taxId);
      setInfo("iban", options.iban);
      setInfo("swiftCode", options.swiftCode);
      setInfo("vpa", options.upiId);
      setInfo("ifsc", options.ifsc);
      setInfo("rail", options.rail);
      setInfo("bankName", options.bankName);
      setInfo("address", options.address);

      const beneficiary = buildBeneficiary(options);
      if (beneficiary) accountInfo.beneficiary = beneficiary;

      // Every fiat account type requires a beneficiary; catch it here rather
      // than letting the API reject the request.
      if (isFiatAccountType(options.accountType) && !beneficiary) {
        output(
          formatError(
            `A beneficiary is required for ${options.accountType}. Pass --beneficiary-type and --beneficiary-name.`
          )
        );
        process.exitCode = 1;
        return;
      }

      const body: Record<string, unknown> = {
        customerId: options.customerId,
        currency: options.currency,
        accountInfo,
      };
      if (options.platformAccountId)
        body.platformAccountId = options.platformAccountId;
      if (options.defaultUmaDepositAccount)
        body.defaultUmaDepositAccount = true;

      const response = await client.post<ExternalAccount>(
        "/customers/external-accounts",
        body
      );
      outputResponse(response);
    });
}

function isFiatAccountType(accountType: string): boolean {
  // Fiat and SWIFT types are the *_ACCOUNT discriminators; wallets/LIGHTNING are not.
  return accountType.endsWith("_ACCOUNT");
}

// A beneficiary needs a name for its type, and any address supplied must carry
// the schema-required line1/postalCode/country.
function validateBeneficiaryInput(
  options: Record<string, string | undefined>
): ValidationResult {
  if (options.beneficiaryType && !options.beneficiaryName) {
    return {
      valid: false,
      error: "--beneficiary-name is required with --beneficiary-type",
    };
  }
  if (options.beneficiaryName && !options.beneficiaryType) {
    return {
      valid: false,
      error: "--beneficiary-type is required with --beneficiary-name",
    };
  }
  const addressProvided =
    options.beneficiaryAddressLine1 ||
    options.beneficiaryAddressLine2 ||
    options.beneficiaryAddressCity ||
    options.beneficiaryAddressState ||
    options.beneficiaryAddressPostal ||
    options.beneficiaryAddressCountry;
  if (
    addressProvided &&
    !(
      options.beneficiaryAddressLine1 &&
      options.beneficiaryAddressPostal &&
      options.beneficiaryAddressCountry
    )
  ) {
    return {
      valid: false,
      error:
        "beneficiary address requires --beneficiary-address-line1, --beneficiary-address-postal, and --beneficiary-address-country",
    };
  }
  return { valid: true };
}

function buildBeneficiary(
  options: Record<string, string | undefined>
): Record<string, unknown> | undefined {
  if (!options.beneficiaryType) return undefined;

  const beneficiary: Record<string, unknown> = {
    beneficiaryType: options.beneficiaryType,
  };
  if (options.beneficiaryType === "INDIVIDUAL") {
    if (options.beneficiaryName) beneficiary.fullName = options.beneficiaryName;
    if (options.beneficiaryBirthDate)
      beneficiary.birthDate = options.beneficiaryBirthDate;
    if (options.beneficiaryNationality)
      beneficiary.nationality = options.beneficiaryNationality;
  } else if (options.beneficiaryType === "BUSINESS") {
    if (options.beneficiaryName) beneficiary.legalName = options.beneficiaryName;
    if (options.beneficiaryRegistrationNumber)
      beneficiary.registrationNumber = options.beneficiaryRegistrationNumber;
    if (options.beneficiaryTaxId)
      beneficiary.taxId = options.beneficiaryTaxId;
  }
  if (options.beneficiaryEmail) beneficiary.email = options.beneficiaryEmail;
  if (options.beneficiaryPhone)
    beneficiary.phoneNumber = options.beneficiaryPhone;
  if (options.beneficiaryCountryOfResidence)
    beneficiary.countryOfResidence = options.beneficiaryCountryOfResidence;

  if (options.beneficiaryAddressLine1) {
    const address: Record<string, string> = {
      line1: options.beneficiaryAddressLine1,
    };
    if (options.beneficiaryAddressLine2)
      address.line2 = options.beneficiaryAddressLine2;
    if (options.beneficiaryAddressCity)
      address.city = options.beneficiaryAddressCity;
    if (options.beneficiaryAddressState)
      address.state = options.beneficiaryAddressState;
    if (options.beneficiaryAddressPostal)
      address.postalCode = options.beneficiaryAddressPostal;
    if (options.beneficiaryAddressCountry)
      address.country = options.beneficiaryAddressCountry;
    beneficiary.address = address;
  }

  return beneficiary;
}
