import { Command } from "commander";
import { GridClient } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";

interface PlatformConfig {
  id: string;
  umaDomain?: string;
  proxyUmaSubdomain?: string;
  webhookEndpoint?: string;
  isRegulatedFinancialInstitution?: boolean;
  supportedCurrencies?: Array<{
    currencyCode: string;
    minAmount?: number;
    maxAmount?: number;
    enabledTransactionTypes?: string[];
    requiredCounterpartyFields?: string[];
  }>;
  embeddedWalletConfig?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export function registerConfigCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  const configCmd = program
    .command("config")
    .description("Platform configuration commands");

  configCmd
    .command("get")
    .description("Get platform configuration (currencies, limits, webhook)")
    .action(async () => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.get<PlatformConfig>("/config");
      outputResponse(response);
    });

  configCmd
    .command("update")
    .description("Update platform configuration")
    .option("--uma-domain <domain>", "UMA domain")
    .option("--webhook-endpoint <url>", "Webhook endpoint URL")
    .option(
      "--supported-currencies <json>",
      "Supported currencies as a JSON array of currency configs"
    )
    .option(
      "--embedded-wallet-config <json>",
      "Embedded wallet configuration as a JSON object"
    )
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const body: Record<string, unknown> = {};
      if (options.umaDomain) body.umaDomain = options.umaDomain;
      if (options.webhookEndpoint) body.webhookEndpoint = options.webhookEndpoint;

      if (options.supportedCurrencies) {
        const parsed = parseJsonOption(
          options.supportedCurrencies,
          "supported-currencies"
        );
        if ("error" in parsed) {
          output(formatError(parsed.error));
          process.exitCode = 1;
          return;
        }
        body.supportedCurrencies = parsed.value;
      }

      if (options.embeddedWalletConfig) {
        const parsed = parseJsonOption(
          options.embeddedWalletConfig,
          "embedded-wallet-config"
        );
        if ("error" in parsed) {
          output(formatError(parsed.error));
          process.exitCode = 1;
          return;
        }
        body.embeddedWalletConfig = parsed.value;
      }

      const response = await client.patch<PlatformConfig>("/config", body);
      outputResponse(response);
    });
}

function parseJsonOption(
  value: string,
  flag: string
): { value: unknown } | { error: string } {
  try {
    return { value: JSON.parse(value) };
  } catch {
    return { error: `Invalid JSON for --${flag}` };
  }
}
