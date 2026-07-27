import { describe, it, expect } from "vitest";
import { runCli } from "./helpers";

describe("exchange-rates", () => {
  it("passes source, repeated destination, and sending amount", async () => {
    const { request } = await runCli([
      "exchange-rates",
      "--source-currency",
      "USD",
      "--destination-currency",
      "EUR",
      "--destination-currency",
      "MXN",
      "--sending-amount",
      "10000",
    ]);

    expect(request?.path).toBe("/grid/v1/exchange-rates");
    expect(request?.url.searchParams.getAll("destinationCurrency")).toEqual([
      "EUR",
      "MXN",
    ]);
    expect(request?.query.sourceCurrency).toBe("USD");
    expect(request?.query.sendingAmount).toBe("10000");
  });
});

describe("crypto estimate-fee", () => {
  it("builds the estimate request body", async () => {
    const { request } = await runCli([
      "crypto",
      "estimate-fee",
      "--internal-account-id",
      "InternalAccount:1",
      "--currency",
      "USDC",
      "--crypto-network",
      "SOLANA",
      "--amount",
      "5000",
      "--destination-address",
      "sol-addr",
    ]);

    expect(request?.method).toBe("POST");
    expect(request?.path).toBe("/grid/v1/crypto/estimate-withdrawal-fee");
    expect(request?.body).toMatchObject({
      internalAccountId: "InternalAccount:1",
      currency: "USDC",
      cryptoNetwork: "SOLANA",
      amount: 5000,
      destinationAddress: "sol-addr",
    });
  });
});

describe("exchange-rates validation", () => {
  it("rejects a non-integer --sending-amount", async () => {
    const { calls } = await runCli([
      "exchange-rates",
      "--source-currency",
      "USD",
      "--destination-currency",
      "EUR",
      "--sending-amount",
      "10.5",
    ]);
    expect(calls).toBe(0);
  });
});

describe("crypto estimate-fee validation", () => {
  it("rejects a non-integer amount instead of truncating it", async () => {
    const { calls } = await runCli([
      "crypto",
      "estimate-fee",
      "--internal-account-id",
      "InternalAccount:1",
      "--currency",
      "USDC",
      "--crypto-network",
      "SOLANA",
      "--amount",
      "10foo",
      "--destination-address",
      "sol-addr",
    ]);
    expect(calls).toBe(0);
  });
});

describe("discoveries", () => {
  it("passes country and currency filters", async () => {
    const { request } = await runCli([
      "discoveries",
      "--country",
      "PH",
      "--currency",
      "PHP",
    ]);
    expect(request?.path).toBe("/grid/v1/discoveries");
    expect(request?.query).toMatchObject({ country: "PH", currency: "PHP" });
  });
});

describe("uma-providers", () => {
  it("passes filters and pagination", async () => {
    const { request } = await runCli([
      "uma-providers",
      "--country-code",
      "US",
      "--has-blocked-providers",
    ]);
    expect(request?.path).toBe("/grid/v1/uma-providers");
    expect(request?.query).toMatchObject({
      countryCode: "US",
      hasBlockedProviders: "true",
    });
  });
});

describe("internal-accounts update", () => {
  it("sends privateEnabled and forwards signed headers", async () => {
    const { request } = await runCli([
      "internal-accounts",
      "update",
      "InternalAccount:1",
      "--private-enabled",
      "true",
      "--wallet-signature",
      "stamp",
      "--request-id",
      "req-1",
    ]);
    expect(request?.method).toBe("PATCH");
    expect(request?.path).toBe("/grid/v1/internal-accounts/InternalAccount:1");
    expect(request?.body).toMatchObject({ privateEnabled: true });
    expect(request?.headers["Grid-Wallet-Signature"]).toBe("stamp");
  });

  it("rejects a non-boolean --private-enabled", async () => {
    const { calls } = await runCli([
      "internal-accounts",
      "update",
      "InternalAccount:1",
      "--private-enabled",
      "yes",
    ]);
    expect(calls).toBe(0);
  });
});

describe("internal-accounts export", () => {
  it("sends clientPublicKey with signed headers", async () => {
    const { request } = await runCli([
      "internal-accounts",
      "export",
      "InternalAccount:1",
      "--client-public-key",
      "04abcd",
      "--wallet-signature",
      "stamp",
      "--request-id",
      "req-1",
    ]);
    expect(request?.method).toBe("POST");
    expect(request?.path).toBe(
      "/grid/v1/internal-accounts/InternalAccount:1/export"
    );
    expect(request?.body).toMatchObject({ clientPublicKey: "04abcd" });
    expect(request?.headers["Request-Id"]).toBe("req-1");
  });
});

describe("tokens", () => {
  it("create sends name and parsed permissions", async () => {
    const { request } = await runCli([
      "tokens",
      "create",
      "--name",
      "CI token",
      "--permissions",
      "VIEW,TRANSACT",
    ]);
    expect(request?.method).toBe("POST");
    expect(request?.path).toBe("/grid/v1/tokens");
    expect(request?.body).toMatchObject({
      name: "CI token",
      permissions: ["VIEW", "TRANSACT"],
    });
  });

  it("revoke issues a DELETE", async () => {
    const { request } = await runCli(["tokens", "revoke", "Token:1", "--yes"]);
    expect(request?.method).toBe("DELETE");
    expect(request?.path).toBe("/grid/v1/tokens/Token:1");
  });
});
