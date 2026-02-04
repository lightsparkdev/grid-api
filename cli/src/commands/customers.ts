import { Command } from "commander";
import { GridClient, PaginatedResponse } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";
import { validateDate, validateCustomerType, validateAll } from "../validation";
import { confirm } from "../prompt";

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
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const params: Record<string, string | number | undefined> = {
        limit: parseInt(options.limit, 10),
        cursor: options.cursor,
        platformCustomerId: options.platformId,
        customerType: options.type,
        umaAddress: options.umaAddress,
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

  customersCmd
    .command("create")
    .description("Create a new customer")
    .requiredOption("--platform-id <id>", "Platform-specific customer ID")
    .option("--type <type>", "Customer type (INDIVIDUAL or BUSINESS)", "INDIVIDUAL")
    .option("--uma-address <address>", "UMA address (optional, generated if not provided)")
    .option("--full-name <name>", "Full name (for individuals)")
    .option("--birth-date <date>", "Birth date YYYY-MM-DD (for individuals)")
    .option("--legal-name <name>", "Legal name (for businesses)")
    .option("--registration-number <number>", "Registration number (for businesses)")
    .option("--tax-id <id>", "Tax ID (for businesses)")
    .option("--address-line1 <line>", "Address line 1")
    .option("--address-city <city>", "City")
    .option("--address-state <state>", "State/Province")
    .option("--address-postal <code>", "Postal code")
    .option("--address-country <country>", "Country code (e.g., US)")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const validations = [validateCustomerType(options.type)];
      if (options.birthDate) {
        validations.push(validateDate(options.birthDate, "birth-date"));
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

      if (options.umaAddress) body.umaAddress = options.umaAddress;

      if (options.type === "INDIVIDUAL") {
        if (options.fullName) body.fullName = options.fullName;
        if (options.birthDate) body.birthDate = options.birthDate;
      } else if (options.type === "BUSINESS") {
        const businessInfo: Record<string, string> = {};
        if (options.legalName) businessInfo.legalName = options.legalName;
        if (options.registrationNumber)
          businessInfo.registrationNumber = options.registrationNumber;
        if (options.taxId) businessInfo.taxId = options.taxId;
        body.businessInfo = businessInfo;
      }

      if (options.addressLine1 || options.addressCity) {
        body.address = {
          line1: options.addressLine1,
          city: options.addressCity,
          state: options.addressState,
          postalCode: options.addressPostal,
          country: options.addressCountry,
        };
      }

      const response = await client.post<Customer>("/customers", body);
      outputResponse(response);
    });

  customersCmd
    .command("update <customerId>")
    .description("Update a customer")
    .option("--full-name <name>", "Full name")
    .option("--birth-date <date>", "Birth date YYYY-MM-DD")
    .option("--address-line1 <line>", "Address line 1")
    .option("--address-city <city>", "City")
    .option("--address-state <state>", "State/Province")
    .option("--address-postal <code>", "Postal code")
    .option("--address-country <country>", "Country code")
    .action(async (customerId: string, options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      if (options.birthDate) {
        const validation = validateDate(options.birthDate, "birth-date");
        if (!validation.valid) {
          output(formatError(validation.error!));
          process.exitCode = 1;
          return;
        }
      }

      const body: Record<string, unknown> = {};
      if (options.fullName) body.fullName = options.fullName;
      if (options.birthDate) body.birthDate = options.birthDate;

      if (options.addressLine1 || options.addressCity) {
        body.address = {
          line1: options.addressLine1,
          city: options.addressCity,
          state: options.addressState,
          postalCode: options.addressPostal,
          country: options.addressCountry,
        };
      }

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

  customersCmd
    .command("kyc-link")
    .description("Generate a KYC link for a customer")
    .requiredOption("--customer-id <id>", "Customer ID")
    .requiredOption("--redirect-url <url>", "Redirect URL after KYC completion")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const body = {
        customerId: options.customerId,
        redirectUrl: options.redirectUrl,
      };

      const response = await client.post<{ kycUrl: string }>(
        "/customers/kyc-link",
        body
      );
      outputResponse(response);
    });
}
