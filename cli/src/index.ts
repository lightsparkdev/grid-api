#!/usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { loadConfig, GridConfig } from "./config";
import { GridClient } from "./client";
import { formatError, output, setOutputFormat, setUseColors, OutputFormat } from "./output";

export interface GlobalOptions {
  config?: string;
  baseUrl?: string;
  format?: OutputFormat;
  color?: boolean;
}

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf-8")
);

const program = new Command();

program
  .name("grid")
  .description("CLI for Grid API - manage global payments")
  .version(packageJson.version)
  .option("-c, --config <path>", "Path to credentials file")
  .option(
    "-u, --base-url <url>",
    "Base URL for API (default: https://api.lightspark.com/grid/2025-10-13)"
  )
  .option("-f, --format <format>", "Output format: json or table", "json")
  .option("--no-color", "Disable colored output")
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.format) setOutputFormat(opts.format as OutputFormat);
    if (opts.color === false) setUseColors(false);
  });

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
  const { registerConfigureCommand } = await import("./commands/configure");
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

  registerConfigureCommand(program);
  registerConfigCommand(program, getClient);
  registerCustomersCommand(program, getClient);
  registerAccountsCommand(program, getClient);
  registerQuotesCommand(program, getClient);
  registerTransactionsCommand(program, getClient);
  registerTransfersCommand(program, getClient);
  registerSandboxCommand(program, getClient);
  registerReceiverCommand(program, getClient);

  const customersCmd = program.commands.find(c => c.name() === "customers");
  const transactionsCmd = program.commands.find(c => c.name() === "transactions");
  const accountsCmd = program.commands.find(c => c.name() === "accounts");

  if (customersCmd) customersCmd.alias("cust");
  if (transactionsCmd) transactionsCmd.alias("tx");
  if (accountsCmd) accountsCmd.alias("acct");

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  output(formatError(err.message));
  process.exitCode = 1;
});
