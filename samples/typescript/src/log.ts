const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";

function truncate(str: string, max = 500): string {
  const trimmed = str.trim();
  return trimmed.length > max ? trimmed.slice(0, max) + "..." : trimmed;
}

export const log = {
  incoming(method: string, path: string, body?: string) {
    console.log(`${CYAN}${BOLD}⬇ FE REQUEST${RESET}  ${CYAN}${method} ${path}${RESET}`);
    if (body) console.log(`${DIM}  Body: ${truncate(body)}${RESET}`);
  },

  gridRequest(operation: string, detail?: string) {
    console.log(`${YELLOW}${BOLD}➡ GRID API${RESET}   ${YELLOW}${operation}${RESET}`);
    if (detail) console.log(`${DIM}  Params: ${truncate(detail)}${RESET}`);
  },

  gridResponse(operation: string, response: string) {
    console.log(`${GREEN}${BOLD}⬅ GRID RESP${RESET}  ${GREEN}${operation}${RESET}`);
    console.log(`${DIM}  ${truncate(response)}${RESET}`);
  },

  gridError(operation: string, error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`${RED}${BOLD}✘ GRID ERR${RESET}   ${RED}${operation}: ${msg}${RESET}`);
  },

  webhook(body: string) {
    console.log(`${MAGENTA}${BOLD}⚡ WEBHOOK${RESET}   ${MAGENTA}${truncate(body)}${RESET}`);
  },

  response(status: number) {
    const color = status < 400 ? GREEN : RED;
    console.log(`${color}${BOLD}⬆ FE RESPONSE${RESET} ${color}${status}${RESET}`);
  },
};
