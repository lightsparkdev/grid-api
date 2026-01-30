import { ApiResponse } from "./client";

export type OutputFormat = "json" | "table";

let currentFormat: OutputFormat = "json";
let useColors = process.stdout.isTTY ?? false;

export function setOutputFormat(format: OutputFormat): void {
  currentFormat = format;
}

export function setUseColors(colors: boolean): void {
  useColors = colors;
}

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

function colorize(text: string, color: keyof typeof colors): string {
  if (!useColors) return text;
  return `${colors[color]}${text}${colors.reset}`;
}

export interface CliOutput<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: unknown;
  };
}

function colorizeJson(json: string): string {
  if (!useColors) return json;
  return json
    .replace(/"([^"]+)":/g, `${colors.cyan}"$1"${colors.reset}:`)
    .replace(/: "([^"]+)"/g, `: ${colors.green}"$1"${colors.reset}`)
    .replace(/: (\d+)/g, `: ${colors.yellow}$1${colors.reset}`)
    .replace(/: (true|false)/g, `: ${colors.blue}$1${colors.reset}`)
    .replace(/: (null)/g, `: ${colors.dim}$1${colors.reset}`);
}

function formatAsTable<T>(data: T): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return colorize("No results", "dim");
    const items = data as Record<string, unknown>[];
    const keys = Object.keys(items[0]).filter(k =>
      typeof items[0][k] !== "object" || items[0][k] === null
    );
    const widths = keys.map(k =>
      Math.max(k.length, ...items.map(item => String(item[k] ?? "").length))
    );
    const header = keys.map((k, i) => k.padEnd(widths[i])).join("  ");
    const separator = widths.map(w => "-".repeat(w)).join("  ");
    const rows = items.map(item =>
      keys.map((k, i) => String(item[k] ?? "").padEnd(widths[i])).join("  ")
    );
    return [colorize(header, "cyan"), colorize(separator, "dim"), ...rows].join("\n");
  }
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    const maxKeyLen = Math.max(...Object.keys(obj).map(k => k.length));
    return Object.entries(obj)
      .filter(([, v]) => typeof v !== "object" || v === null)
      .map(([k, v]) => `${colorize(k.padEnd(maxKeyLen), "cyan")}  ${v}`)
      .join("\n");
  }
  return String(data);
}

export function formatOutput<T>(response: ApiResponse<T>): string {
  if (currentFormat === "table") {
    if (!response.success) {
      const err = response.error;
      return colorize(`Error: ${err?.message || "Unknown error"}`, "red") +
        (err?.code ? colorize(` (${err.code})`, "dim") : "");
    }
    const data = response.data;
    if (data && typeof data === "object" && "data" in data) {
      return formatAsTable((data as { data: unknown }).data);
    }
    return formatAsTable(data);
  }

  const output: CliOutput<T> = {
    success: response.success,
  };

  if (response.success) {
    output.data = response.data;
  } else if (response.error) {
    output.error = {
      code: response.error.code,
      message: response.error.message,
      details: response.error.details,
    };
  }

  return colorizeJson(JSON.stringify(output, null, 2));
}

export function formatError(message: string, details?: unknown): string {
  const output: CliOutput = {
    success: false,
    error: { message, details },
  };
  return JSON.stringify(output, null, 2);
}

export function formatSuccess<T>(data: T): string {
  const output: CliOutput<T> = {
    success: true,
    data,
  };
  return JSON.stringify(output, null, 2);
}

export function output(result: string): void {
  console.log(result);
}

export function outputResponse<T>(response: ApiResponse<T>): void {
  output(formatOutput(response));
  if (!response.success) {
    process.exitCode = 1;
  }
}
