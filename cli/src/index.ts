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

program.parse(process.argv);
