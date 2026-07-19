import { Command } from "commander";
import { GridClient } from "../client";
import { outputResponse } from "../output";
import { GlobalOptions } from "../index";

interface Discovery {
  bankName: string;
  displayName: string;
  country: string;
  currency: string;
}

export function registerDiscoveriesCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  program
    .command("discoveries")
    .description("List available receiving institutions")
    .option("--country <code>", "Filter by country (ISO 3166-1 alpha-2)")
    .option("--currency <code>", "Filter by currency (ISO 4217)")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.get<{ data: Discovery[] }>("/discoveries", {
        country: options.country,
        currency: options.currency,
      });
      outputResponse(response);
    });
}
