import { Command } from "commander";

/**
 * Options for the signed-retry leg of a mutating flow. The CLI does not compute
 * the Turnkey/HPKE stamp itself — the caller supplies one (e.g. via
 * scripts/embedded-wallet-sign.js) and it is forwarded verbatim as the
 * `Grid-Wallet-Signature` / `Request-Id` headers.
 */
export function addSignedOptions(cmd: Command): Command {
  return cmd
    .option(
      "--wallet-signature <stamp>",
      "Grid-Wallet-Signature header for the signed retry of this operation"
    )
    .option(
      "--request-id <id>",
      "Request-Id header echoing the challenge's requestId"
    );
}

export function signedHeaders(options: {
  walletSignature?: string;
  requestId?: string;
}): Record<string, string | undefined> {
  return {
    "Grid-Wallet-Signature": options.walletSignature,
    "Request-Id": options.requestId,
  };
}

/**
 * The signed retry needs both headers together. Returns an error message when
 * exactly one of --wallet-signature / --request-id was supplied.
 */
export function signedOptionsError(options: {
  walletSignature?: string;
  requestId?: string;
}): string | undefined {
  if (Boolean(options.walletSignature) !== Boolean(options.requestId)) {
    return "--wallet-signature and --request-id must be provided together";
  }
  return undefined;
}
