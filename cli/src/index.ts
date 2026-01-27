#!/usr/bin/env node

import { Command } from "commander";
import { loadConfig, GridConfig } from "./config";
import { GridClient } from "./client";
import { formatError, output } from "./output";

export interface GlobalOptions {
  config?: string;
  baseUrl?: string;
}

const program = new Command();

program
  .name("grid")
  .description("CLI for Grid API - manage global payments")
  .version("1.0.0")
  .option("-c, --config <path>", "Path to credentials file")
  .option(
    "-u, --base-url <url>",
    "Base URL for API (default: https://api.lightspark.com/grid/2025-10-13)"
  );

function getClient(options: GlobalOptions): GridClient | null {
  try {
    const config = loadConfig({
      configPath: options.config,
      baseUrl: options.baseUrl,
    });
    return new GridClient(config);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Configuration error";
    output(formatError(message));
    process.exitCode = 1;
    return null;
  }
}

export { program, getClient, GridClient, GridConfig };

async function main() {
  const { registerConfigCommand } = await import("./commands/config");
  const { registerCustomersCommand } = await import("./commands/customers");
  const { registerAccountsCommand } = await import("./commands/accounts");
  const { registerQuotesCommand } = await import("./commands/quotes");
  const { registerTransactionsCommand } = await import(
    "./commands/transactions"
  );
  const { registerTransfersCommand } = await import("./commands/transfers");
  const { registerSandboxCommand } = await import("./commands/sandbox");
  const { registerReceiverCommand } = await import("./commands/receiver");

  registerConfigCommand(program, getClient);
  registerCustomersCommand(program, getClient);
  registerAccountsCommand(program, getClient);
  registerQuotesCommand(program, getClient);
  registerTransactionsCommand(program, getClient);
  registerTransfersCommand(program, getClient);
  registerSandboxCommand(program, getClient);
  registerReceiverCommand(program, getClient);

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  output(formatError(err.message));
  process.exitCode = 1;
});
