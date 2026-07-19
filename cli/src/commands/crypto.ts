import { Command } from "commander";
import { GridClient } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";

interface EstimateCryptoWithdrawalFeeResponse {
  networkFee: number;
  networkFeeAsset: string;
  applicationFee: number;
  totalFee: number;
  netAmount: number;
}

export function registerCryptoCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  const cryptoCmd = program
    .command("crypto")
    .description("Crypto helper commands");

  cryptoCmd
    .command("estimate-fee")
    .description("Estimate the fee for a crypto withdrawal")
    .requiredOption("--internal-account-id <id>", "Source internal account ID")
    .requiredOption("--currency <code>", "Currency code (e.g. USDC)")
    .requiredOption("--crypto-network <network>", "Crypto network (e.g. SOLANA)")
    .requiredOption("--amount <number>", "Amount in the smallest unit")
    .requiredOption("--destination-address <address>", "Destination address")
    .action(async (options) => {
      const opts = program.opts<GlobalOptions>();
      const client = getClient(opts);
      if (!client) return;

      // A crypto amount must be a positive integer in the smallest unit;
      // reject trailing garbage (e.g. "10foo") and out-of-range values that
      // parseInt would otherwise accept or truncate.
      if (!/^\d+$/.test(options.amount)) {
        output(formatError("--amount must be a positive integer"));
        process.exitCode = 1;
        return;
      }
      const amount = Number(options.amount);
      if (!Number.isSafeInteger(amount) || amount < 1) {
        output(formatError("--amount is out of range"));
        process.exitCode = 1;
        return;
      }

      const response = await client.post<EstimateCryptoWithdrawalFeeResponse>(
        "/crypto/estimate-withdrawal-fee",
        {
          internalAccountId: options.internalAccountId,
          currency: options.currency,
          cryptoNetwork: options.cryptoNetwork,
          amount,
          destinationAddress: options.destinationAddress,
        }
      );
      outputResponse(response);
    });
}
