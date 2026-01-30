import { ApiResponse } from "./client";

export interface CliOutput<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: unknown;
  };
}

export function formatOutput<T>(response: ApiResponse<T>): string {
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

  return JSON.stringify(output, null, 2);
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
