import { describe, it, expect } from "vitest";
import { runCli } from "./helpers";

describe("customers update", () => {
  it("sends the customerType discriminator required by the update oneOf", async () => {
    const { request } = await runCli([
      "customers",
      "update",
      "cust_123",
      "--type",
      "INDIVIDUAL",
      "--full-name",
      "Ada Lovelace",
    ]);

    expect(request?.method).toBe("PATCH");
    expect(request?.path).toBe("/grid/v1/customers/cust_123");
    expect(request?.body).toMatchObject({
      customerType: "INDIVIDUAL",
      fullName: "Ada Lovelace",
    });
  });

  it("routes business fields under businessInfo with the discriminator", async () => {
    const { request } = await runCli([
      "customers",
      "update",
      "cust_456",
      "--type",
      "BUSINESS",
      "--legal-name",
      "Acme LLC",
    ]);

    expect(request?.body).toMatchObject({
      customerType: "BUSINESS",
      businessInfo: { legalName: "Acme LLC" },
    });
  });
});

describe("customers update signed retry", () => {
  it("forwards --wallet-signature and --request-id as headers", async () => {
    const { request } = await runCli([
      "customers",
      "update",
      "cust_7",
      "--type",
      "INDIVIDUAL",
      "--email",
      "ada@example.com",
      "--wallet-signature",
      "stamp",
      "--request-id",
      "req-1",
    ]);

    expect(request?.method).toBe("PATCH");
    expect(request?.path).toBe("/grid/v1/customers/cust_7");
    expect(request?.headers["Grid-Wallet-Signature"]).toBe("stamp");
    expect(request?.headers["Request-Id"]).toBe("req-1");
  });

  it("rejects --wallet-signature without --request-id", async () => {
    const { calls } = await runCli([
      "customers",
      "update",
      "cust_7",
      "--type",
      "INDIVIDUAL",
      "--email",
      "ada@example.com",
      "--wallet-signature",
      "stamp",
    ]);
    expect(calls).toBe(0);
  });
});

describe("customers update validation", () => {
  it("rejects updating email and phoneNumber in the same call", async () => {
    const { calls } = await runCli([
      "customers",
      "update",
      "cust_9",
      "--type",
      "INDIVIDUAL",
      "--email",
      "ada@example.com",
      "--phone-number",
      "+15551234567",
    ]);

    expect(calls).toBe(0);
  });
});

describe("customers create", () => {
  it("includes the required incorporatedOn for business customers", async () => {
    const { request } = await runCli([
      "customers",
      "create",
      "--platform-id",
      "p1",
      "--type",
      "BUSINESS",
      "--legal-name",
      "Acme LLC",
      "--tax-id",
      "12-3456789",
      "--incorporated-on",
      "2020-01-01",
    ]);

    expect(request?.body).toMatchObject({
      customerType: "BUSINESS",
      businessInfo: {
        legalName: "Acme LLC",
        taxId: "12-3456789",
        incorporatedOn: "2020-01-01",
      },
    });
  });

  it("rejects a business create missing required businessInfo fields", async () => {
    const { calls } = await runCli([
      "customers",
      "create",
      "--platform-id",
      "p3",
      "--type",
      "BUSINESS",
      "--legal-name",
      "Acme LLC",
      // taxId and incorporatedOn omitted
    ]);

    expect(calls).toBe(0);
  });

  it("rejects a partial address missing postalCode/country", async () => {
    const { calls } = await runCli([
      "customers",
      "create",
      "--platform-id",
      "p4",
      "--type",
      "INDIVIDUAL",
      "--full-name",
      "Ada Lovelace",
      "--address-line1",
      "123 Main St",
    ]);

    expect(calls).toBe(0);
  });

  it("sends top-level contact fields when provided", async () => {
    const { request } = await runCli([
      "customers",
      "create",
      "--platform-id",
      "p2",
      "--type",
      "INDIVIDUAL",
      "--full-name",
      "Ada Lovelace",
      "--email",
      "ada@example.com",
      "--phone-number",
      "+15551234567",
    ]);

    expect(request?.body).toMatchObject({
      customerType: "INDIVIDUAL",
      email: "ada@example.com",
      phoneNumber: "+15551234567",
    });
  });
});

describe("customers list", () => {
  it("passes new filter query params", async () => {
    const { request } = await runCli([
      "customers",
      "list",
      "--region",
      "US",
      "--currency",
      "USD",
    ]);

    expect(request?.query).toMatchObject({ region: "US", currency: "USD" });
  });
});
