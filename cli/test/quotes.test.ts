import { describe, it, expect } from "vitest";
import { runCli } from "./helpers";

describe("quotes create", () => {
  it("sends purposeOfPayment as a top-level field, not inside senderCustomerInfo", async () => {
    const { request } = await runCli([
      "quotes",
      "create",
      "--amount",
      "1000",
      "--lock-side",
      "SENDING",
      "--source-account",
      "InternalAccount:abc",
      "--dest-uma",
      "$bob@uma.example.com",
      "--dest-currency",
      "USD",
      "--purpose-of-payment",
      "GOODS_OR_SERVICES",
    ]);

    const body = request?.body as Record<string, unknown>;
    expect(body.purposeOfPayment).toBe("GOODS_OR_SERVICES");
    expect(
      (body.senderCustomerInfo as Record<string, unknown> | undefined)
        ?.PURPOSE_OF_PAYMENT
    ).toBeUndefined();
  });

  it("sends top-level remittanceInformation", async () => {
    const { request } = await runCli([
      "quotes",
      "create",
      "--amount",
      "1000",
      "--lock-side",
      "SENDING",
      "--source-account",
      "InternalAccount:abc",
      "--dest-account",
      "ExternalAccount:xyz",
      "--remittance-information",
      "Invoice 42",
    ]);

    expect((request?.body as Record<string, unknown>).remittanceInformation).toBe(
      "Invoice 42"
    );
  });

  it("sets paymentRail on an ACCOUNT destination", async () => {
    const { request } = await runCli([
      "quotes",
      "create",
      "--amount",
      "1000",
      "--lock-side",
      "SENDING",
      "--source-account",
      "InternalAccount:abc",
      "--dest-account",
      "ExternalAccount:xyz",
      "--payment-rail",
      "ACH",
    ]);

    expect(request?.body).toMatchObject({
      destination: { destinationType: "ACCOUNT", paymentRail: "ACH" },
    });
  });

  it("sets cryptoNetwork on a realtime-funding source", async () => {
    const { request } = await runCli([
      "quotes",
      "create",
      "--amount",
      "1000",
      "--lock-side",
      "SENDING",
      "--source-customer",
      "Customer:abc",
      "--source-currency",
      "USDC",
      "--crypto-network",
      "SOLANA",
      "--dest-account",
      "ExternalAccount:xyz",
    ]);

    expect(request?.body).toMatchObject({
      source: {
        sourceType: "REALTIME_FUNDING",
        currency: "USDC",
        cryptoNetwork: "SOLANA",
      },
    });
  });
});

describe("quotes create validation", () => {
  it("rejects a realtime-funding source without a currency", async () => {
    const { calls } = await runCli([
      "quotes",
      "create",
      "--amount",
      "1000",
      "--lock-side",
      "SENDING",
      "--source-customer",
      "Customer:abc",
      "--dest-account",
      "ExternalAccount:xyz",
    ]);

    expect(calls).toBe(0);
  });
});

describe("quotes execute", () => {
  it("sends scaFactor in the body when provided", async () => {
    const { request } = await runCli([
      "quotes",
      "execute",
      "quote_1",
      "--sca-factor",
      "SMS_OTP",
    ]);

    expect(request?.method).toBe("POST");
    expect(request?.path).toBe("/grid/v1/quotes/quote_1/execute");
    expect(request?.body).toMatchObject({ scaFactor: "SMS_OTP" });
  });
});
