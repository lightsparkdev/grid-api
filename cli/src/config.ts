import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface GridConfig {
  apiTokenId: string;
  apiClientSecret: string;
  baseUrl: string;
}

const DEFAULT_BASE_URL = "https://api.lightspark.com/grid/2025-10-13";
const CREDENTIALS_FILE = ".grid-credentials";

function getCredentialsPath(): string {
  return path.join(os.homedir(), CREDENTIALS_FILE);
}

function loadCredentialsFile(): Partial<GridConfig> {
  const credentialsPath = getCredentialsPath();
  if (fs.existsSync(credentialsPath)) {
    const content = fs.readFileSync(credentialsPath, "utf-8");
    try {
      return JSON.parse(content);
    } catch {
      throw new Error(
        `Invalid JSON in credentials file: ${credentialsPath}. ` +
        `Please fix the file or delete it and run 'grid configure'.`
      );
    }
  }
  return {};
}

export { getCredentialsPath };

export function loadConfig(options: {
  configPath?: string;
  baseUrl?: string;
}): GridConfig {
  let fileConfig: Partial<GridConfig> = {};

  if (options.configPath) {
    if (!fs.existsSync(options.configPath)) {
      throw new Error(`Config file not found: ${options.configPath}`);
    }
    const content = fs.readFileSync(options.configPath, "utf-8");
    try {
      fileConfig = JSON.parse(content);
    } catch {
      throw new Error(`Invalid JSON in config file: ${options.configPath}`);
    }
  } else {
    fileConfig = loadCredentialsFile();
  }

  const apiTokenId =
    process.env.GRID_API_TOKEN_ID || fileConfig.apiTokenId || "";
  const apiClientSecret =
    process.env.GRID_API_CLIENT_SECRET || fileConfig.apiClientSecret || "";
  const baseUrl =
    options.baseUrl ||
    process.env.GRID_BASE_URL ||
    fileConfig.baseUrl ||
    DEFAULT_BASE_URL;

  if (!apiTokenId || !apiClientSecret) {
    throw new Error(
      `Missing credentials. Set GRID_API_TOKEN_ID and GRID_API_CLIENT_SECRET environment variables, ` +
        `or create ${getCredentialsPath()} with apiTokenId and apiClientSecret fields.`
    );
  }

  return { apiTokenId, apiClientSecret, baseUrl };
}

export function saveCredentials(config: Partial<GridConfig>): void {
  const credentialsPath = getCredentialsPath();
  let existing: Partial<GridConfig> = {};

  if (fs.existsSync(credentialsPath)) {
    const content = fs.readFileSync(credentialsPath, "utf-8");
    try {
      existing = JSON.parse(content);
    } catch {
      existing = {};
    }
  }

  const merged = { ...existing, ...config };
  fs.writeFileSync(credentialsPath, JSON.stringify(merged, null, 2), {
    mode: 0o600,
  });
}
