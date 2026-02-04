import { GridConfig } from "./config";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    status: number;
    code?: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount?: number;
}

export class GridClient {
  private config: GridConfig;
  private timeoutMs: number;

  constructor(config: GridConfig, timeoutMs: number = 30000) {
    this.config = config;
    this.timeoutMs = timeoutMs;
  }

  private getAuthHeader(): string {
    const credentials = `${this.config.apiTokenId}:${this.config.apiClientSecret}`;
    return `Basic ${Buffer.from(credentials).toString("base64")}`;
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const baseUrl = this.config.baseUrl.endsWith("/")
      ? this.config.baseUrl
      : this.config.baseUrl + "/";
    const fullPath = path.startsWith("/") ? path.slice(1) : path;
    const url = new URL(fullPath, baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  async request<T>(
    method: string,
    path: string,
    options?: {
      params?: Record<string, string | number | boolean | undefined>;
      body?: unknown;
    }
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, options?.params);

    const headers: Record<string, string> = {
      Authorization: this.getAuthHeader(),
      Accept: "application/json",
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (options?.body) {
      headers["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(options.body);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
      fetchOptions.signal = controller.signal;

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      const contentType = response.headers.get("content-type");
      let data: unknown = null;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorData = data as { code?: string; message?: string };
        return {
          success: false,
          error: {
            status: response.status,
            code: errorData?.code,
            message:
              errorData?.message || response.statusText || "Request failed",
            details: data,
          },
        };
      }

      return { success: true, data: data as T };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return {
          success: false,
          error: {
            status: 0,
            message: `Request timed out after ${this.timeoutMs}ms`,
          },
        };
      }
      const message = err instanceof Error ? err.message : "Unknown error";
      return {
        success: false,
        error: {
          status: 0,
          message: `Network error: ${message}`,
        },
      };
    }
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<ApiResponse<T>> {
    return this.request<T>("GET", path, { params });
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("POST", path, { body });
  }

  async patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", path, { body });
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", path);
  }
}
