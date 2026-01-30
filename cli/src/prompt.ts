import * as readline from "readline";

export async function confirm(message: string, defaultValue = false): Promise<boolean> {
  const suffix = defaultValue ? "[Y/n]" : "[y/N]";
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} ${suffix} `, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      if (normalized === "") {
        resolve(defaultValue);
      } else {
        resolve(normalized === "y" || normalized === "yes");
      }
    });
  });
}

export async function promptInput(message: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
