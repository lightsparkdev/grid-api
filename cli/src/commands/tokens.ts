import { Command } from "commander";
import { GridClient, PaginatedResponse } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";
import { confirm } from "../prompt";
import { parseList } from "../parse";

interface ApiToken {
  id: string;
  name: string;
  permissions: string[];
  clientId: string;
  clientSecret?: string;
  createdAt: string;
  updatedAt: string;
}

export function registerTokensCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  const tokensCmd = program
    .command("tokens")
    .description("API token management commands");

  tokensCmd
    .command("list")
    .description("List API tokens")
    .option("--name <name>", "Filter by name")
    .option("--created-after <ts>", "Filter by creation date (RFC 3339)")
    .option("--created-before <ts>", "Filter by creation date (RFC 3339)")
    .option("--updated-after <ts>", "Filter by update date (RFC 3339)")
    .option("--updated-before <ts>", "Filter by update date (RFC 3339)")
    .option("-l, --limit <number>", "Maximum results (default 20, max 100)", "20")
    .option("--cursor <cursor>", "Pagination cursor")
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

      const response = await client.get<PaginatedResponse<ApiToken>>("/tokens", {
        name: options.name,
        createdAfter: options.createdAfter,
        createdBefore: options.createdBefore,
        updatedAfter: options.updatedAfter,
        updatedBefore: options.updatedBefore,
        limit,
        cursor: options.cursor,
      });
      outputResponse(response);
    });

  tokensCmd
    .command("get <tokenId>")
    .description("Get an API token")
    .action(async (tokenId: string) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const response = await client.get<ApiToken>(`/tokens/${tokenId}`);
      outputResponse(response);
    });

  tokensCmd
    .command("create")
    .description(
      "Create an API token — the clientSecret is returned only once, store it securely"
    )
    .requiredOption("--name <name>", "Token name")
    .requiredOption(
      "--permissions <list>",
      "Comma-separated permissions (VIEW, TRANSACT, MANAGE)"
    )
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const permissions = parseList(options.permissions);
      if (!permissions) {
        output(formatError("--permissions must list at least one permission"));
        process.exitCode = 1;
        return;
      }

      const response = await client.post<ApiToken>("/tokens", {
        name: options.name,
        permissions,
      });
      outputResponse(response);
    });

  tokensCmd
    .command("revoke <tokenId>")
    .description("Revoke (delete) an API token")
    .option("-y, --yes", "Skip confirmation prompt")
    .action(async (tokenId: string, options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      if (!options.yes) {
        const confirmed = await confirm(
          `Revoke API token ${tokenId}? This cannot be undone.`
        );
        if (!confirmed) {
          console.log("Aborted.");
          return;
        }
      }

      const response = await client.delete<void>(`/tokens/${tokenId}`);
      outputResponse(response);
    });
}
