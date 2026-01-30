import { Command } from "commander";
import { GridClient } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";
import { validateAmount, parseAmount } from "../validation";

interface Transaction {
  id: string;
  type: "INCOMING" | "OUTGOING";
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export function registerTransfersCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  const transfersCmd = program
    .command("transfers")
    .description("Same-currency transfer commands");

  transfersCmd
    .command("in")
    .description("Transfer from external account to internal account (same currency)")
    .requiredOption("--source <id>", "Source external account ID (ExternalAccount:...)")
    .requiredOption("--dest <id>", "Destination internal account ID (InternalAccount:...)")
    .option("--amount <number>", "Amount in smallest currency unit (optional for full balance)")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      if (options.amount) {
        const validation = validateAmount(options.amount, "amount");
        if (!validation.valid) {
          output(formatError(validation.error!));
          process.exitCode = 1;
          return;
        }
      }

      const body: Record<string, unknown> = {
        source: { accountId: options.source },
        destination: { accountId: options.dest },
      };

      if (options.amount) {
        body.amount = parseAmount(options.amount);
      }

      const response = await client.post<Transaction>("/transfer-in", body);
      outputResponse(response);
    });

  transfersCmd
    .command("out")
    .description("Transfer from internal account to external account (same currency)")
    .requiredOption("--source <id>", "Source internal account ID (InternalAccount:...)")
    .requiredOption("--dest <id>", "Destination external account ID (ExternalAccount:...)")
    .option("--amount <number>", "Amount in smallest currency unit (optional for full balance)")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      if (options.amount) {
        const validation = validateAmount(options.amount, "amount");
        if (!validation.valid) {
          output(formatError(validation.error!));
          process.exitCode = 1;
          return;
        }
      }

      const body: Record<string, unknown> = {
        source: { accountId: options.source },
        destination: { accountId: options.dest },
      };

      if (options.amount) {
        body.amount = parseAmount(options.amount);
      }

      const response = await client.post<Transaction>("/transfer-out", body);
      outputResponse(response);
    });
}
