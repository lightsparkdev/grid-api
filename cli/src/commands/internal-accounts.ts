import { Command } from "commander";
import { GridClient } from "../client";
import { outputResponse, formatError, output } from "../output";
import { GlobalOptions } from "../index";
import { addSignedOptions, signedHeaders } from "../signed";

export function registerInternalAccountsCommand(
  program: Command,
  getClient: (opts: GlobalOptions) => GridClient | null
): void {
  const internalAccountsCmd = program
    .command("internal-accounts")
    .description("Internal account update/export commands");

  addSignedOptions(
    internalAccountsCmd
      .command("update <internalAccountId>")
      .description("Update an internal account")
      .option("--private-enabled <true|false>", "Enable/disable Embedded Wallet privacy")
  ).action(async (internalAccountId: string, options) => {
    const opts = program.opts<GlobalOptions>();
    const client = getClient(opts);
    if (!client) return;

    if (options.privateEnabled === undefined) {
      output(formatError("Provide --private-enabled <true|false>"));
      process.exitCode = 1;
      return;
    }
    if (options.privateEnabled !== "true" && options.privateEnabled !== "false") {
      output(formatError("--private-enabled must be true or false"));
      process.exitCode = 1;
      return;
    }

    const response = await client.patch(
      `/internal-accounts/${internalAccountId}`,
      { privateEnabled: options.privateEnabled === "true" },
      signedHeaders(options)
    );
    outputResponse(response);
  });

  addSignedOptions(
    internalAccountsCmd
      .command("export <internalAccountId>")
      .description(
        "Export an internal account's wallet credentials — returns an HPKE-sealed ciphertext you decrypt client-side with the matching private key"
      )
      .requiredOption(
        "--client-public-key <hex>",
        "Ephemeral client P-256 public key (uncompressed SEC1 hex); discard the private key after decrypting"
      )
  ).action(async (internalAccountId: string, options) => {
    const opts = program.opts<GlobalOptions>();
    const client = getClient(opts);
    if (!client) return;

    const response = await client.post(
      `/internal-accounts/${internalAccountId}/export`,
      { clientPublicKey: options.clientPublicKey },
      signedHeaders(options)
    );
    outputResponse(response);
  });
}
