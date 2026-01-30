import { Command } from "commander";
import * as readline from "readline";
import { saveCredentials, getCredentialsPath } from "../config";
import { formatSuccess, formatError, output } from "../output";

function prompt(question: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (hidden && process.stdin.isTTY) {
      process.stdout.write(question);
      const stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding("utf8");

      let input = "";
      const onData = (char: string) => {
        if (char === "\n" || char === "\r" || char === "\u0004") {
          stdin.setRawMode(false);
          stdin.removeListener("data", onData);
          rl.close();
          process.stdout.write("\n");
          resolve(input);
        } else if (char === "\u0003") {
          process.exit();
        } else if (char === "\u007F" || char === "\b") {
          if (input.length > 0) {
            input = input.slice(0, -1);
          }
        } else {
          input += char;
        }
      };
      stdin.on("data", onData);
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

async function testCredentials(apiTokenId: string, apiClientSecret: string, baseUrl: string): Promise<boolean> {
  const credentials = `${apiTokenId}:${apiClientSecret}`;
  const auth = `Basic ${Buffer.from(credentials).toString("base64")}`;

  try {
    const response = await fetch(`${baseUrl}/config`, {
      headers: { Authorization: auth, Accept: "application/json" },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function registerConfigureCommand(program: Command): void {
  program
    .command("configure")
    .description("Configure Grid API credentials interactively")
    .option("--token-id <id>", "API token ID (skip prompt)")
    .option("--client-secret <secret>", "API client secret (skip prompt)")
    .option("--base-url <url>", "API base URL")
    .option("--no-verify", "Skip credential verification")
    .action(async (options) => {
      const credentialsPath = getCredentialsPath();
      console.log(`\nGrid CLI Configuration\n`);
      console.log(`Credentials will be saved to: ${credentialsPath}\n`);

      let apiTokenId = options.tokenId;
      let apiClientSecret = options.clientSecret;
      const baseUrl = options.baseUrl || "https://api.lightspark.com/grid/2025-10-13";

      if (!apiTokenId) {
        apiTokenId = await prompt("API Token ID: ");
      }
      if (!apiClientSecret) {
        apiClientSecret = await prompt("API Client Secret: ", true);
      }

      if (!apiTokenId || !apiClientSecret) {
        output(formatError("API Token ID and Client Secret are required"));
        process.exitCode = 1;
        return;
      }

      if (options.verify !== false) {
        process.stdout.write("Verifying credentials... ");
        const valid = await testCredentials(apiTokenId, apiClientSecret, baseUrl);
        if (!valid) {
          console.log("FAILED");
          output(formatError("Credentials verification failed. Check your API Token ID and Client Secret."));
          process.exitCode = 1;
          return;
        }
        console.log("OK");
      }

      saveCredentials({ apiTokenId, apiClientSecret, baseUrl });
      output(formatSuccess({
        message: "Configuration saved successfully",
        credentialsPath,
      }));
    });
}
