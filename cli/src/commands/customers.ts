import { Command } from "commander";
import { GridClient, PaginatedResponse } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";
import {
  validateDate,
  validateCustomerType,
  validateAll,
  ValidationResult,
} from "../validation";
import { confirm } from "../prompt";
import { parseList } from "../parse";

interface Customer {
  id: string;
  platformCustomerId: string;
  customerType: "INDIVIDUAL" | "BUSINESS";
  umaAddress?: string;
  fullName?: string;
  birthDate?: string;
  kycStatus?: string;
  createdAt: string;
  updatedAt: string;
}

// Address requires line1/postalCode/country. Returns an error if a partial
// address was supplied so we never send a schema-invalid object.
function validateAddress(
  options: Record<string, string | undefined>
): ValidationResult {
  const provided =
    options.addressLine1 ||
    options.addressLine2 ||
    options.addressCity ||
    options.addressState ||
    options.addressPostal ||
    options.addressCountry;
  if (!provided) return { valid: true };
  if (options.addressLine1 && options.addressPostal && options.addressCountry) {
    return { valid: true };
  }
  return {
    valid: false,
    error:
      "address requires --address-line1, --address-postal, and --address-country",
  };
}

// BusinessInfo requires legalName, taxId, and incorporatedOn on create.
function validateBusinessRequired(
  options: Record<string, string | undefined>
): ValidationResult {
  const missing = ["legalName", "taxId", "incorporatedOn"].filter(
    (key) => !options[key]
  );
  if (missing.length === 0) return { valid: true };
  const flags = missing
    .map((k) => "--" + k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()))
    .join(", ");
  return {
    valid: false,
    error: `Business customers require ${flags}`,
  };
}

function buildAddress(options: Record<string, string | undefined>) {
  if (!options.addressLine1) return undefined;
  const address: Record<string, string> = { line1: options.addressLine1 };
  if (options.addressLine2) address.line2 = options.addressLine2;
  if (options.addressCity) address.city = options.addressCity;
  if (options.addressState) address.state = options.addressState;
  if (options.addressPostal) address.postalCode = options.addressPostal;
  if (options.addressCountry) address.country = options.addressCountry;
  return address;
}

function buildBusinessInfo(
  options: Record<string, string | undefined>
): Record<string, unknown> {
  const info: Record<string, unknown> = {};
  const set = (key: string, value: string | undefined) => {
    if (value !== undefined) info[key] = value;
  };
  set("legalName", options.legalName);
  set("doingBusinessAs", options.doingBusinessAs);
  set("country", options.businessCountry);
  set("registrationNumber", options.registrationNumber);
  set("incorporatedOn", options.incorporatedOn);
  set("entityType", options.entityType);
  set("taxId", options.taxId);
  set("businessType", options.businessType);
  set("purposeOfAccount", options.purposeOfAccount);
  set("sourceOfFunds", options.sourceOfFunds);
  set("naicsCode", options.naicsCode);
  set(
    "expectedMonthlyTransactionCount",
    options.expectedMonthlyTransactionCount
  );
  set(
    "expectedMonthlyTransactionVolume",
    options.expectedMonthlyTransactionVolume
  );
  const countriesOfOperation = parseList(options.countriesOfOperation);
  if (countriesOfOperation) info.countriesOfOperation = countriesOfOperation;
  const sourceOfFundsCategories = parseList(options.sourceOfFundsCategories);
  if (sourceOfFundsCategories)
    info.sourceOfFundsCategories = sourceOfFundsCategories;
  const expectedCounterpartyCountries = parseList(
    options.expectedCounterpartyCountries
  );
  if (expectedCounterpartyCountries)
    info.expectedCounterpartyCountries = expectedCounterpartyCountries;
  const expectedRecipientJurisdictions = parseList(
    options.expectedRecipientJurisdictions
  );
  if (expectedRecipientJurisdictions)
    info.expectedRecipientJurisdictions = expectedRecipientJurisdictions;
  return info;
}

function applyTopLevelFields(
  body: Record<string, unknown>,
  options: Record<string, string | undefined>
): void {
  if (options.umaAddress) body.umaAddress = options.umaAddress;
  if (options.email) body.email = options.email;
  if (options.phoneNumber) body.phoneNumber = options.phoneNumber;
  const currencies = parseList(options.currencies);
  if (currencies) body.currencies = currencies;
}

function businessOptions(cmd: Command): Command {
  return cmd
    .option("--legal-name <name>", "Legal name (business)")
    .option("--doing-business-as <name>", "Trade/DBA name (business)")
    .option("--business-country <country>", "Country of incorporation (business)")
    .option("--registration-number <number>", "Registration number (business)")
    .option("--tax-id <id>", "Tax ID (business)")
    .option("--incorporated-on <date>", "Incorporation date YYYY-MM-DD (business)")
    .option("--entity-type <type>", "Entity type (business)")
    .option("--business-type <type>", "Business type (business)")
    .option("--purpose-of-account <purpose>", "Purpose of account (business)")
    .option("--source-of-funds <text>", "Primary source of funds (business)")
    .option(
      "--source-of-funds-categories <list>",
      "Comma-separated source-of-funds categories (business)"
    )
    .option("--naics-code <code>", "NAICS code, 2-6 digits (business)")
    .option(
      "--expected-monthly-transaction-count <bucket>",
      "Expected monthly transaction count bucket (business)"
    )
    .option(
      "--expected-monthly-transaction-volume <bucket>",
      "Expected monthly transaction volume bucket (business)"
    )
    .option(
      "--countries-of-operation <list>",
      "Comma-separated countries of operation (business)"
    )
    .option(
      "--expected-counterparty-countries <list>",
      "Comma-separated expected counterparty countries (business)"
    )
    .option(
      "--expected-recipient-jurisdictions <list>",
      "Comma-separated expected recipient jurisdictions (business)"
    );
}

export function registerCustomersCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  const customersCmd = program
    .command("customers")
    .description("Customer management commands");

  customersCmd
    .command("list")
    .description("List customers")
    .option("-l, --limit <number>", "Maximum results (default 20, max 100)", "20")
    .option("--cursor <cursor>", "Pagination cursor")
    .option("--platform-id <id>", "Filter by platform customer ID")
    .option("--type <type>", "Filter by type (INDIVIDUAL or BUSINESS)")
    .option("--uma-address <address>", "Filter by UMA address")
    .option("--region <country>", "Filter by region (ISO 3166-1 alpha-2)")
    .option("--currency <code>", "Filter by currency code")
    .option("--created-after <date>", "Filter by creation date (RFC 3339)")
    .option("--created-before <date>", "Filter by creation date (RFC 3339)")
    .option("--updated-after <date>", "Filter by update date (RFC 3339)")
    .option("--updated-before <date>", "Filter by update date (RFC 3339)")
    .option("--include-deleted", "Include soft-deleted customers")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const params: Record<string, string | number | boolean | undefined> = {
        limit: parseInt(options.limit, 10),
        cursor: options.cursor,
        platformCustomerId: options.platformId,
        customerType: options.type,
        umaAddress: options.umaAddress,
        region: options.region,
        currency: options.currency,
        createdAfter: options.createdAfter,
        createdBefore: options.createdBefore,
        updatedAfter: options.updatedAfter,
        updatedBefore: options.updatedBefore,
        isIncludingDeleted: options.includeDeleted ? true : undefined,
      };

      const response = await client.get<PaginatedResponse<Customer>>(
        "/customers",
        params
      );
      outputResponse(response);
    });

  customersCmd
    .command("get <customerId>")
    .description("Get customer details")
    .action(async (customerId: string) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.get<Customer>(`/customers/${customerId}`);
      outputResponse(response);
    });

  const createCmd = customersCmd
    .command("create")
    .description("Create a new customer")
    .requiredOption("--platform-id <id>", "Platform-specific customer ID")
    .option("--type <type>", "Customer type (INDIVIDUAL or BUSINESS)", "INDIVIDUAL")
    .option("--uma-address <address>", "UMA address (optional, generated if not provided)")
    .option("--region <country>", "Region (ISO 3166-1 alpha-2), immutable after creation")
    .option("--currencies <list>", "Comma-separated currency codes")
    .option("--email <email>", "Email address")
    .option("--phone-number <phone>", "Phone number in E.164 format")
    .option("--full-name <name>", "Full name (individual)")
    .option("--birth-date <date>", "Birth date YYYY-MM-DD (individual)")
    .option("--nationality <country>", "Nationality (ISO 3166-1 alpha-2, individual)")
    .option("--id-type <type>", "Identification type (individual)")
    .option("--identifier <value>", "Tax identifier, e.g. SSN/ITIN (individual)")
    .option("--address-line1 <line>", "Address line 1")
    .option("--address-line2 <line>", "Address line 2")
    .option("--address-city <city>", "City")
    .option("--address-state <state>", "State/Province")
    .option("--address-postal <code>", "Postal code")
    .option("--address-country <country>", "Country code (e.g., US)");
  businessOptions(createCmd).action(async (options) => {
    const opts = program.opts<GlobalOptions>();
    const client = getClient(opts);
    if (!client) return;

    const validations = [
      validateCustomerType(options.type),
      validateAddress(options),
    ];
    if (options.birthDate) {
      validations.push(validateDate(options.birthDate, "birth-date"));
    }
    if (options.type === "BUSINESS") {
      validations.push(validateBusinessRequired(options));
    }
    const validation = validateAll(validations);
    if (!validation.valid) {
      output(formatError(validation.error!));
      process.exitCode = 1;
      return;
    }

    const body: Record<string, unknown> = {
      platformCustomerId: options.platformId,
      customerType: options.type,
    };
    if (options.region) body.region = options.region;
    applyTopLevelFields(body, options);

    if (options.type === "INDIVIDUAL") {
      if (options.fullName) body.fullName = options.fullName;
      if (options.birthDate) body.birthDate = options.birthDate;
      if (options.nationality) body.nationality = options.nationality;
      if (options.idType) body.idType = options.idType;
      if (options.identifier) body.identifier = options.identifier;
    } else if (options.type === "BUSINESS") {
      body.businessInfo = buildBusinessInfo(options);
    }

    const address = buildAddress(options);
    if (address) body.address = address;

    const response = await client.post<Customer>("/customers", body);
    outputResponse(response);
  });

  const updateCmd = customersCmd
    .command("update <customerId>")
    .description("Update a customer")
    .requiredOption(
      "--type <type>",
      "Customer type (INDIVIDUAL or BUSINESS) — required discriminator"
    )
    .option("--uma-address <address>", "UMA address")
    .option("--currencies <list>", "Comma-separated currency codes")
    .option("--email <email>", "Email address")
    .option("--phone-number <phone>", "Phone number in E.164 format")
    .option("--full-name <name>", "Full name (individual)")
    .option("--birth-date <date>", "Birth date YYYY-MM-DD (individual)")
    .option("--nationality <country>", "Nationality (ISO 3166-1 alpha-2, individual)")
    .option("--address-line1 <line>", "Address line 1")
    .option("--address-line2 <line>", "Address line 2")
    .option("--address-city <city>", "City")
    .option("--address-state <state>", "State/Province")
    .option("--address-postal <code>", "Postal code")
    .option("--address-country <country>", "Country code");
  businessOptions(updateCmd).action(async (customerId: string, options) => {
    const opts = program.opts<GlobalOptions>();
    const client = getClient(opts);
    if (!client) return;

    const validations = [
      validateCustomerType(options.type),
      validateAddress(options),
    ];
    if (options.birthDate) {
      validations.push(validateDate(options.birthDate, "birth-date"));
    }
    // Email and phone updates must be separate PATCH calls so tied Embedded
    // Wallet credentials propagate through the signed-retry flow.
    if (options.email && options.phoneNumber) {
      validations.push({
        valid: false,
        error:
          "Update --email and --phone-number in separate calls, not together",
      });
    }
    const validation = validateAll(validations);
    if (!validation.valid) {
      output(formatError(validation.error!));
      process.exitCode = 1;
      return;
    }

    const body: Record<string, unknown> = { customerType: options.type };
    applyTopLevelFields(body, options);

    if (options.type === "INDIVIDUAL") {
      if (options.fullName) body.fullName = options.fullName;
      if (options.birthDate) body.birthDate = options.birthDate;
      if (options.nationality) body.nationality = options.nationality;
    } else if (options.type === "BUSINESS") {
      const businessInfo = buildBusinessInfo(options);
      if (Object.keys(businessInfo).length) body.businessInfo = businessInfo;
    }

    const address = buildAddress(options);
    if (address) body.address = address;

    const response = await client.patch<Customer>(
      `/customers/${customerId}`,
      body
    );
    outputResponse(response);
  });

  customersCmd
    .command("delete <customerId>")
    .description("Delete a customer")
    .option("-y, --yes", "Skip confirmation prompt")
    .action(async (customerId: string, options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      if (!options.yes) {
        const confirmed = await confirm(
          `Are you sure you want to delete customer ${customerId}? This action cannot be undone.`
        );
        if (!confirmed) {
          console.log("Aborted.");
          return;
        }
      }

      const response = await client.delete<void>(`/customers/${customerId}`);
      outputResponse(response);
    });

  interface KycLinkResponse {
    kycUrl: string;
    expiresAt: string;
    provider: string;
    token?: string;
  }

  customersCmd
    .command("kyc-link <customerId>")
    .description("Generate a hosted KYC link for an existing customer")
    .option(
      "--redirect-uri <uri>",
      "URI to redirect the customer to after completing the hosted flow"
    )
    .action(async (customerId: string, options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const body: Record<string, unknown> = {
        redirectUri: options.redirectUri,
      };

      const response = await client.post<KycLinkResponse>(
        `/customers/${customerId}/kyc-link`,
        body
      );
      outputResponse(response);
    });

  customersCmd
    .command("verify-email <customerId>")
    .description("Send an email verification code to a customer")
    .action(async (customerId: string) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.post<void>(
        `/customers/${customerId}/verify-email`
      );
      outputResponse(response);
    });

  customersCmd
    .command("confirm-email <customerId>")
    .description("Confirm a customer's email verification code")
    .requiredOption("--code <code>", "The verification code the customer received")
    .action(async (customerId: string, options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.post<Customer>(
        `/customers/${customerId}/verify-email/confirm`,
        { code: options.code }
      );
      outputResponse(response);
    });

  customersCmd
    .command("verify-phone <customerId>")
    .description("Send a phone verification code to a customer")
    .action(async (customerId: string) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.post<void>(
        `/customers/${customerId}/verify-phone`
      );
      outputResponse(response);
    });

  customersCmd
    .command("confirm-phone <customerId>")
    .description("Confirm a customer's phone verification code")
    .requiredOption("--code <code>", "The verification code the customer received")
    .action(async (customerId: string, options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.post<Customer>(
        `/customers/${customerId}/verify-phone/confirm`,
        { code: options.code }
      );
      outputResponse(response);
    });
}
