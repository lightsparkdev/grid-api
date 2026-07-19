import { Command } from "commander";
import { GridClient } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";

interface Currency {
  code: string;
  name?: string;
  symbol?: string;
  decimals?: number;
}

interface ExchangeRate {
  sourceCurrency: Currency;
  sendingAmount: number;
  destinationCurrency: Currency;
  destinationPaymentRail: string;
  receivingAmount: number;
  exchangeRate: number;
  updatedAt: string;
}

function collect(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

export function registerExchangeRatesCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  program
    .command("exchange-rates")
    .description("Get exchange rates")
    .option("--source-currency <code>", "Source currency code")
    .option(
      "--destination-currency <code>",
      "Destination currency code (repeatable)",
      collect
    )
    .option("--sending-amount <number>", "Sending amount in the smallest unit")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      let sendingAmount: number | undefined;
      if (options.sendingAmount !== undefined) {
        sendingAmount = parseInt(options.sendingAmount, 10);
        if (Number.isNaN(sendingAmount)) {
          output(formatError("--sending-amount must be a number"));
          process.exitCode = 1;
          return;
        }
      }

      const response = await client.get<{ data: ExchangeRate[] }>(
        "/exchange-rates",
        {
          sourceCurrency: options.sourceCurrency,
          destinationCurrency: options.destinationCurrency,
          sendingAmount,
        }
      );
      outputResponse(response);
    });
}
