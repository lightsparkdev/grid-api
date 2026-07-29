import dotenv from "dotenv";
dotenv.config();

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} environment variable not set`);
  }
  return value;
}

export const config = {
  apiTokenId: getEnvVar("GRID_API_TOKEN_ID"),
  apiClientSecret: getEnvVar("GRID_API_CLIENT_SECRET"),
};
