import { describe, it, expect } from "vitest";
import { runCli } from "./helpers";

describe("accounts external create — beneficiary gating", () => {
  it("does not require a beneficiary for a wallet account type", async () => {
    const { request, calls } = await runCli([
      "accounts",
      "external",
      "create",
      "--customer-id",
      "Customer:abc",
      "--currency",
      "USDC",
      "--account-type",
      "SPARK_WALLET",
      "--address",
      "sp1qexampleaddress",
    ]);

    expect(calls).toBe(1);
    expect(request?.body).toMatchObject({
      accountInfo: { accountType: "SPARK_WALLET", address: "sp1qexampleaddress" },
    });
  });

  it("builds a BUSINESS beneficiary with registration and tax id", async () => {
    const { request } = await runCli([
      "accounts",
      "external",
      "create",
      "--customer-id",
      "Customer:abc",
      "--currency",
      "USD",
      "--account-type",
      "USD_ACCOUNT",
      "--account-number",
      "1234567890",
      "--routing-number",
      "021000021",
      "--beneficiary-type",
      "BUSINESS",
      "--beneficiary-name",
      "Acme LLC",
      "--beneficiary-registration-number",
      "5523041",
      "--beneficiary-tax-id",
      "47-1234567",
    ]);

    expect(request?.body).toMatchObject({
      accountInfo: {
        beneficiary: {
          beneficiaryType: "BUSINESS",
          legalName: "Acme LLC",
          registrationNumber: "5523041",
          taxId: "47-1234567",
        },
      },
    });
  });

  it("rejects a partial beneficiary address", async () => {
    const { calls } = await runCli([
      "accounts",
      "external",
      "create",
      "--customer-id",
      "Customer:abc",
      "--currency",
      "USD",
      "--account-type",
      "USD_ACCOUNT",
      "--account-number",
      "1234567890",
      "--routing-number",
      "021000021",
      "--beneficiary-type",
      "INDIVIDUAL",
      "--beneficiary-name",
      "Ada Lovelace",
      "--beneficiary-address-line1",
      "123 Main St",
    ]);

    expect(calls).toBe(0);
  });
});

describe("accounts external create", () => {
  it("uses the currency-suffixed USD_ACCOUNT discriminator and includes the beneficiary", async () => {
    const { request } = await runCli([
      "accounts",
      "external",
      "create",
      "--customer-id",
      "Customer:abc",
      "--currency",
      "USD",
      "--account-type",
      "USD_ACCOUNT",
      "--account-number",
      "1234567890",
      "--routing-number",
      "021000021",
      "--beneficiary-type",
      "INDIVIDUAL",
      "--beneficiary-name",
      "Ada Lovelace",
    ]);

    expect(request?.method).toBe("POST");
    expect(request?.path).toBe("/grid/v1/customers/external-accounts");
    expect(request?.body).toMatchObject({
      customerId: "Customer:abc",
      currency: "USD",
      accountInfo: {
        accountType: "USD_ACCOUNT",
        accountNumber: "1234567890",
        routingNumber: "021000021",
        beneficiary: { beneficiaryType: "INDIVIDUAL", fullName: "Ada Lovelace" },
      },
    });
  });

  it("does not send a request when a fiat account omits the required beneficiary", async () => {
    const { request, calls } = await runCli([
      "accounts",
      "external",
      "create",
      "--customer-id",
      "Customer:abc",
      "--currency",
      "USD",
      "--account-type",
      "USD_ACCOUNT",
      "--account-number",
      "1234567890",
      "--routing-number",
      "021000021",
    ]);

    expect(calls).toBe(0);
    expect(request).toBeNull();
  });

  it("rejects a beneficiary that has a type but no name", async () => {
    const { calls } = await runCli([
      "accounts",
      "external",
      "create",
      "--customer-id",
      "Customer:abc",
      "--currency",
      "USD",
      "--account-type",
      "USD_ACCOUNT",
      "--account-number",
      "1234567890",
      "--routing-number",
      "021000021",
      "--beneficiary-type",
      "INDIVIDUAL",
      // --beneficiary-name omitted
    ]);

    expect(calls).toBe(0);
  });

  it("carries platformAccountId and defaultUmaDepositAccount at the top level", async () => {
    const { request } = await runCli([
      "accounts",
      "external",
      "create",
      "--customer-id",
      "Customer:abc",
      "--currency",
      "USD",
      "--account-type",
      "USD_ACCOUNT",
      "--account-number",
      "1234567890",
      "--routing-number",
      "021000021",
      "--beneficiary-type",
      "INDIVIDUAL",
      "--beneficiary-name",
      "Ada Lovelace",
      "--platform-account-id",
      "ext_acc_1",
      "--default-uma-deposit-account",
    ]);

    expect(request?.body).toMatchObject({
      platformAccountId: "ext_acc_1",
      defaultUmaDepositAccount: true,
    });
  });
});

describe("accounts external create currency validation", () => {
  it("accepts currencies beyond the legacy allowlist (e.g. SGD)", async () => {
    const { request, calls } = await runCli([
      "accounts",
      "external",
      "create",
      "--customer-id",
      "Customer:abc",
      "--currency",
      "SGD",
      "--account-type",
      "SGD_ACCOUNT",
      "--account-number",
      "1234567890",
      "--beneficiary-type",
      "INDIVIDUAL",
      "--beneficiary-name",
      "Ada Lovelace",
    ]);

    expect(calls).toBe(1);
    expect(request?.body).toMatchObject({ currency: "SGD" });
  });
});

describe("accounts internal list", () => {
  it("sends only currency and type to the platform endpoint", async () => {
    const { request } = await runCli([
      "accounts",
      "internal",
      "list",
      "--platform",
      "--currency",
      "USD",
      "--type",
      "INTERNAL_FIAT",
    ]);

    expect(request?.path).toBe("/grid/v1/platform/internal-accounts");
    expect(request?.query).toEqual({ currency: "USD", type: "INTERNAL_FIAT" });
  });

  it("passes the type filter to the customer endpoint", async () => {
    const { request } = await runCli([
      "accounts",
      "internal",
      "list",
      "--type",
      "EMBEDDED_WALLET",
    ]);

    expect(request?.path).toBe("/grid/v1/customers/internal-accounts");
    expect(request?.query).toMatchObject({ type: "EMBEDDED_WALLET" });
  });
});

describe("accounts external list", () => {
  it("does not send customerId to the platform endpoint", async () => {
    const { request } = await runCli([
      "accounts",
      "external",
      "list",
      "--platform",
      "--customer-id",
      "Customer:abc",
    ]);

    expect(request?.path).toBe("/grid/v1/platform/external-accounts");
    expect(request?.query.customerId).toBeUndefined();
  });
});
