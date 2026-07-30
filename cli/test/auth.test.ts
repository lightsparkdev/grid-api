import { describe, it, expect } from "vitest";
import { runCli } from "./helpers";

describe("auth credentials", () => {
  it("list passes accountId", async () => {
    const { request } = await runCli([
      "auth",
      "credentials",
      "list",
      "--account-id",
      "InternalAccount:1",
    ]);
    expect(request?.path).toBe("/grid/v1/auth/credentials");
    expect(request?.query).toMatchObject({ accountId: "InternalAccount:1" });
  });

  it("create builds an OAuth credential body", async () => {
    const { request } = await runCli([
      "auth",
      "credentials",
      "create",
      "--type",
      "OAUTH",
      "--account-id",
      "InternalAccount:1",
      "--oidc-token",
      "tok123",
    ]);
    expect(request?.method).toBe("POST");
    expect(request?.path).toBe("/grid/v1/auth/credentials");
    expect(request?.body).toMatchObject({
      type: "OAUTH",
      accountId: "InternalAccount:1",
      oidcToken: "tok123",
    });
  });

  it("challenge posts an empty body (OTP resend)", async () => {
    const { request } = await runCli([
      "auth",
      "credentials",
      "challenge",
      "Credential:1",
    ]);
    expect(request?.method).toBe("POST");
    expect(request?.path).toBe("/grid/v1/auth/credentials/Credential:1/challenge");
    expect(request?.body).toBeUndefined();
  });

  it("challenge sends clientPublicKey when provided (passkey re-challenge)", async () => {
    const { request } = await runCli([
      "auth",
      "credentials",
      "challenge",
      "Credential:1",
      "--client-public-key",
      "04abcd",
    ]);
    expect(request?.body).toMatchObject({ clientPublicKey: "04abcd" });
  });

  it("verify sends the OTP bundle plus signed-retry headers", async () => {
    const { request } = await runCli([
      "auth",
      "credentials",
      "verify",
      "Credential:1",
      "--type",
      "EMAIL_OTP",
      "--encrypted-otp-bundle",
      '{"encappedPublic":"04ab","ciphertext":"1fa1"}',
      "--wallet-signature",
      "stamp",
      "--request-id",
      "req-1",
    ]);
    expect(request?.body).toMatchObject({
      type: "EMAIL_OTP",
      encryptedOtpBundle: '{"encappedPublic":"04ab","ciphertext":"1fa1"}',
    });
    expect(request?.headers["Grid-Wallet-Signature"]).toBe("stamp");
    expect(request?.headers["Request-Id"]).toBe("req-1");
  });

  it("revoke issues a DELETE with the signed-retry headers", async () => {
    const { request } = await runCli([
      "auth",
      "credentials",
      "revoke",
      "Credential:1",
      "--yes",
      "--wallet-signature",
      "stamp",
      "--request-id",
      "req-1",
    ]);
    expect(request?.method).toBe("DELETE");
    expect(request?.path).toBe("/grid/v1/auth/credentials/Credential:1");
    expect(request?.headers["Grid-Wallet-Signature"]).toBe("stamp");
  });
});

describe("auth delegated-keys", () => {
  it("list requires and passes accountId/fundingSourceId", async () => {
    const { request } = await runCli([
      "auth",
      "delegated-keys",
      "list",
      "--account-id",
      "InternalAccount:1",
    ]);
    expect(request?.path).toBe("/grid/v1/auth/delegated-keys");
    expect(request?.query).toMatchObject({ accountId: "InternalAccount:1" });
  });

  it("list without any filter does not call the API", async () => {
    const { calls } = await runCli(["auth", "delegated-keys", "list"]);
    expect(calls).toBe(0);
  });

  it("create builds the body with parsed spending limits", async () => {
    const { request } = await runCli([
      "auth",
      "delegated-keys",
      "create",
      "--card-id",
      "Card:1",
      "--internal-account-id",
      "InternalAccount:1",
      "--nickname",
      "Card key",
      "--spending-limit",
      "USD:5000",
      "--spending-limit",
      "EUR:4000",
    ]);
    expect(request?.body).toMatchObject({
      cardId: "Card:1",
      internalAccountId: "InternalAccount:1",
      nickname: "Card key",
      spendingLimits: [
        { currencyCode: "USD", maxPerTransaction: 5000 },
        { currencyCode: "EUR", maxPerTransaction: 4000 },
      ],
    });
  });

  it("revoke issues a plain DELETE (no signature needed)", async () => {
    const { request } = await runCli([
      "auth",
      "delegated-keys",
      "revoke",
      "DelegatedKey:1",
      "--yes",
    ]);
    expect(request?.method).toBe("DELETE");
    expect(request?.path).toBe("/grid/v1/auth/delegated-keys/DelegatedKey:1");
  });

  it("rejects a malformed spending limit before sending", async () => {
    await expect(
      runCli([
        "auth",
        "delegated-keys",
        "create",
        "--card-id",
        "Card:1",
        "--internal-account-id",
        "InternalAccount:1",
        "--nickname",
        "Card key",
        "--spending-limit",
        "USD5000",
      ])
    ).rejects.toThrow();
  });
});

describe("auth sessions", () => {
  it("list passes accountId", async () => {
    const { request } = await runCli([
      "auth",
      "sessions",
      "list",
      "--account-id",
      "InternalAccount:1",
    ]);
    expect(request?.path).toBe("/grid/v1/auth/sessions");
    expect(request?.query).toMatchObject({ accountId: "InternalAccount:1" });
  });

  it("revoke issues a signed DELETE with confirmation skipped", async () => {
    const { request } = await runCli([
      "auth",
      "sessions",
      "revoke",
      "Session:1",
      "--yes",
      "--wallet-signature",
      "stamp",
      "--request-id",
      "req-1",
    ]);
    expect(request?.method).toBe("DELETE");
    expect(request?.path).toBe("/grid/v1/auth/sessions/Session:1");
    expect(request?.headers["Grid-Wallet-Signature"]).toBe("stamp");
    expect(request?.headers["Request-Id"]).toBe("req-1");
  });

  it("refresh sends clientPublicKey and signed-retry headers", async () => {
    const { request } = await runCli([
      "auth",
      "sessions",
      "refresh",
      "Session:1",
      "--client-public-key",
      "04abcd",
      "--wallet-signature",
      "stamp",
      "--request-id",
      "req-1",
    ]);
    expect(request?.method).toBe("POST");
    expect(request?.path).toBe("/grid/v1/auth/sessions/Session:1/refresh");
    expect(request?.body).toMatchObject({ clientPublicKey: "04abcd" });
    expect(request?.headers["Request-Id"]).toBe("req-1");
  });
});
