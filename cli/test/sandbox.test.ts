import { describe, it, expect } from "vitest";
import { runCli } from "./helpers";

describe("sandbox receive", () => {
  it("uses the schema field names receivingCurrencyAmount and receivingCurrencyCode", async () => {
    const { request } = await runCli([
      "sandbox",
      "receive",
      "--uma-address",
      "$receiver@uma.example.com",
      "--sender-uma",
      "$sender@sandbox.example.com",
      "--amount",
      "1000",
      "--currency",
      "USD",
    ]);

    expect(request?.body).toMatchObject({
      receiverUmaAddress: "$receiver@uma.example.com",
      senderUmaAddress: "$sender@sandbox.example.com",
      receivingCurrencyAmount: 1000,
      receivingCurrencyCode: "USD",
    });
    const body = request?.body as Record<string, unknown>;
    expect(body.amount).toBeUndefined();
    expect(body.currency).toBeUndefined();
  });

  it("accepts customerId as an alternative to the receiver UMA address", async () => {
    const { request } = await runCli([
      "sandbox",
      "receive",
      "--customer-id",
      "Customer:abc",
      "--sender-uma",
      "$sender@sandbox.example.com",
      "--amount",
      "500",
      "--currency",
      "USD",
    ]);

    expect(request?.body).toMatchObject({
      customerId: "Customer:abc",
      receivingCurrencyAmount: 500,
    });
  });
});

describe("config update", () => {
  it("sends supportedCurrencies and embeddedWalletConfig from JSON inputs", async () => {
    const { request } = await runCli([
      "config",
      "update",
      "--supported-currencies",
      '[{"currencyCode":"USD","minAmount":100,"maxAmount":100000}]',
      "--embedded-wallet-config",
      '{"appName":"Acme","otpLength":6}',
    ]);

    expect(request?.method).toBe("PATCH");
    expect(request?.body).toMatchObject({
      supportedCurrencies: [
        { currencyCode: "USD", minAmount: 100, maxAmount: 100000 },
      ],
      embeddedWalletConfig: { appName: "Acme", otpLength: 6 },
    });
  });
});
