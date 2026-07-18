import { describe, it, expect } from "vitest";
import { runCli } from "./helpers";

describe("error handling", () => {
  it("surfaces the API error's inner details object, not the whole error body", async () => {
    const { stdout } = await runCli(["customers", "get", "cust_1"], {
      status: 400,
      body: {
        status: 400,
        code: "INVALID_REQUEST",
        message: "Bad request",
        details: { field: "email" },
      },
    });

    const parsed = JSON.parse(stdout);
    expect(parsed.success).toBe(false);
    expect(parsed.error.code).toBe("INVALID_REQUEST");
    expect(parsed.error.details).toEqual({ field: "email" });
    // The whole error envelope must not be nested under details.
    expect(parsed.error.details.code).toBeUndefined();
  });
});
