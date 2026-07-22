import { describe, it, expect } from "vitest";
import { runCli } from "./helpers";

describe("customers verify-email", () => {
  it("posts to the verify-email endpoint", async () => {
    const { request } = await runCli(["customers", "verify-email", "cust_1"]);

    expect(request?.method).toBe("POST");
    expect(request?.path).toBe("/grid/v1/customers/cust_1/verify-email");
  });
});

describe("customers confirm-email", () => {
  it("posts the code to the verify-email/confirm endpoint", async () => {
    const { request } = await runCli([
      "customers",
      "confirm-email",
      "cust_1",
      "--code",
      "123456",
    ]);

    expect(request?.method).toBe("POST");
    expect(request?.path).toBe("/grid/v1/customers/cust_1/verify-email/confirm");
    expect(request?.body).toMatchObject({ code: "123456" });
  });
});

describe("customers verify-phone", () => {
  it("posts to the verify-phone endpoint", async () => {
    const { request } = await runCli(["customers", "verify-phone", "cust_1"]);

    expect(request?.method).toBe("POST");
    expect(request?.path).toBe("/grid/v1/customers/cust_1/verify-phone");
  });
});

describe("customers confirm-phone", () => {
  it("posts the code to the verify-phone/confirm endpoint", async () => {
    const { request } = await runCli([
      "customers",
      "confirm-phone",
      "cust_1",
      "--code",
      "654321",
    ]);

    expect(request?.method).toBe("POST");
    expect(request?.path).toBe("/grid/v1/customers/cust_1/verify-phone/confirm");
    expect(request?.body).toMatchObject({ code: "654321" });
  });
});
