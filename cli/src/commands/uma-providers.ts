import { Command } from "commander";
import { GridClient, PaginatedResponse } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";

interface UmaProvider {
  name?: string;
  domain?: string;
  supportedRegions?: string[];
  lei?: string;
  allowListStatus?: boolean;
}

export function registerUmaProvidersCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  program
    .command("uma-providers")
    .description("List available counterparty (UMA) providers")
    .option("--country-code <code>", "Filter by country code")
    .option("--currency-code <code>", "Filter by currency code")
    .option("--has-blocked-providers", "Only providers with blocked entries")
    .option("-l, --limit <number>", "Maximum results (default 20, max 100)", "20")
    .option("--cursor <cursor>", "Pagination cursor")
    .option("--sort <order>", "Sort order: asc or desc")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const limit = parseInt(options.limit, 10);
      if (Number.isNaN(limit)) {
        output(formatError("--limit must be a number"));
        process.exitCode = 1;
        return;
      }

      const response = await client.get<PaginatedResponse<UmaProvider>>(
        "/uma-providers",
        {
          countryCode: options.countryCode,
          currencyCode: options.currencyCode,
          hasBlockedProviders: options.hasBlockedProviders ? true : undefined,
          limit,
          cursor: options.cursor,
          sortOrder: options.sort,
        }
      );
      outputResponse(response);
    });
}
