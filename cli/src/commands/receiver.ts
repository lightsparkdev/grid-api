import { Command } from "commander";
import { GridClient } from "../client";
import { outputResponse } from "../output";
import { GlobalOptions } from "../index";

interface ReceiverLookup {
  lookupId: string;
  receiverUmaAddress?: string;
  accountId?: string;
  supportedCurrencies: Array<{
    currency: { code: string; name?: string; symbol?: string; decimals?: number };
    estimatedExchangeRate?: number;
    min?: number;
    max?: number;
  }>;
  requiredPayerDataFields?: Array<{
    name: string;
    mandatory: boolean;
  }>;
}

export function registerReceiverCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  const receiverCmd = program
    .command("receiver")
    .description("Receiver lookup commands");

  receiverCmd
    .command("lookup-uma <umaAddress>")
    .description("Look up an UMA address to get payment capabilities")
    .option("--customer-id <id>", "Sender customer ID")
    .option("--sender-uma <address>", "Sender UMA address")
    .action(async (umaAddress: string, options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const params: Record<string, string | undefined> = {
        customerId: options.customerId,
        senderUmaAddress: options.senderUma,
      };

      const response = await client.get<ReceiverLookup>(
        `/receiver/uma/${encodeURIComponent(umaAddress)}`,
        params
      );
      outputResponse(response);
    });

  receiverCmd
    .command("lookup-account <accountId>")
    .description("Look up an external account to get payment capabilities")
    .option("--customer-id <id>", "Sender customer ID")
    .option("--sender-uma <address>", "Sender UMA address")
    .action(async (accountId: string, options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const params: Record<string, string | undefined> = {
        customerId: options.customerId,
        senderUmaAddress: options.senderUma,
      };

      const response = await client.get<ReceiverLookup>(
        `/receiver/external-account/${encodeURIComponent(accountId)}`,
        params
      );
      outputResponse(response);
    });
}
