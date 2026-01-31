import { Command } from "commander";
import { GridClient } from "../client";
import { outputResponse } from "../output";
import { GlobalOptions } from "../index";

interface PlatformConfig {
  id: string;
  umaDomain?: string;
  webhookEndpoint?: string;
  supportedCurrencies: Array<{
    currencyCode: string;
    minAmount?: number;
    maxAmount?: number;
    enabledTransactionTypes?: string[];
  }>;
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
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const body: Record<string, unknown> = {};
      if (options.umaDomain) body.umaDomain = options.umaDomain;
      if (options.webhookEndpoint) body.webhookEndpoint = options.webhookEndpoint;

      const response = await client.patch<PlatformConfig>("/config", body);
      outputResponse(response);
    });
}
