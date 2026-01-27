import { Command } from "commander";
import { GridClient } from "../client";
import { outputResponse } from "../output";
import { GlobalOptions } from "../index";

export function registerSandboxCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  const sandboxCmd = program
    .command("sandbox")
    .description("Sandbox testing commands");

  sandboxCmd
    .command("send")
    .description("Simulate sending a payment in sandbox")
    .requiredOption("--quote-id <id>", "Quote ID to simulate sending")
    .requiredOption("--currency <code>", "Currency code for the funds to send")
    .option("--amount <number>", "Amount in smallest unit (derived from quote if not provided)")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const body: Record<string, unknown> = {
        quoteId: options.quoteId,
        currencyCode: options.currency,
      };
      if (options.amount) body.currencyAmount = parseInt(options.amount);
      const response = await client.post<unknown>("/sandbox/send", body);
      outputResponse(response);
    });

  sandboxCmd
    .command("receive")
    .description("Simulate receiving a UMA payment in sandbox")
    .requiredOption("--uma-address <address>", "Receiver UMA address")
    .requiredOption("--amount <number>", "Amount in smallest unit")
    .requiredOption("--currency <code>", "Currency code")
    .option("--sender-uma <address>", "Sender UMA address")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const body: Record<string, unknown> = {
        receiverUmaAddress: options.umaAddress,
        amount: parseInt(options.amount),
        currency: options.currency,
      };
      if (options.senderUma) body.senderUmaAddress = options.senderUma;

      const response = await client.post<unknown>("/sandbox/uma/receive", body);
      outputResponse(response);
    });

  sandboxCmd
    .command("fund <accountId>")
    .description("Fund an internal account in sandbox")
    .requiredOption("--amount <number>", "Amount in smallest unit")
    .action(async (accountId: string, options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      const body = { amount: parseInt(options.amount) };
      const response = await client.post<unknown>(
        `/sandbox/internal-accounts/${accountId}/fund`,
        body
      );
      outputResponse(response);
    });
}
