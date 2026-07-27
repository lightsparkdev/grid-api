import { describe, it, expect } from "vitest";
import { runCli } from "./helpers";

describe("cards list", () => {
  it("passes filters as query params", async () => {
    const { request } = await runCli([
      "cards",
      "list",
      "--cardholder-id",
      "Customer:abc",
      "--state",
      "ACTIVE",
    ]);

    expect(request?.path).toBe("/grid/v1/cards");
    expect(request?.query).toMatchObject({
      cardholderId: "Customer:abc",
      state: "ACTIVE",
    });
  });
});

describe("cards create", () => {
  it("builds the create body with funding sources and default form", async () => {
    const { request } = await runCli([
      "cards",
      "create",
      "--cardholder-id",
      "Customer:abc",
      "--funding-sources",
      "InternalAccount:1,InternalAccount:2",
    ]);

    expect(request?.method).toBe("POST");
    expect(request?.path).toBe("/grid/v1/cards");
    expect(request?.body).toMatchObject({
      cardholderId: "Customer:abc",
      form: "VIRTUAL",
      fundingSources: ["InternalAccount:1", "InternalAccount:2"],
    });
  });
});

describe("cards update", () => {
  it("freezes a card via state", async () => {
    const { request } = await runCli([
      "cards",
      "update",
      "Card:1",
      "--state",
      "FROZEN",
    ]);

    expect(request?.method).toBe("PATCH");
    expect(request?.path).toBe("/grid/v1/cards/Card:1");
    expect(request?.body).toMatchObject({ state: "FROZEN" });
  });

  it("forwards a supplied wallet signature and request id as headers", async () => {
    const { request } = await runCli([
      "cards",
      "update",
      "Card:1",
      "--state",
      "CLOSED",
      "--wallet-signature",
      "stamp123",
      "--request-id",
      "req-1",
    ]);

    expect(request?.headers["Grid-Wallet-Signature"]).toBe("stamp123");
    expect(request?.headers["Request-Id"]).toBe("req-1");
  });

  it("rejects an update with no state or funding sources", async () => {
    const { calls } = await runCli(["cards", "update", "Card:1"]);
    expect(calls).toBe(0);
  });

  it("rejects an invalid --state value", async () => {
    const { calls } = await runCli([
      "cards",
      "update",
      "Card:1",
      "--state",
      "PENDING_KYC",
    ]);
    expect(calls).toBe(0);
  });

  it("rejects an empty --funding-sources value", async () => {
    const { calls } = await runCli([
      "cards",
      "update",
      "Card:1",
      "--funding-sources",
      ",",
    ]);
    expect(calls).toBe(0);
  });

  it("rejects a partial signed-retry (wallet-signature without request-id)", async () => {
    const { calls } = await runCli([
      "cards",
      "update",
      "Card:1",
      "--state",
      "FROZEN",
      "--wallet-signature",
      "stamp",
    ]);
    expect(calls).toBe(0);
  });

  it("rejects CLOSED combined with funding sources", async () => {
    const { calls } = await runCli([
      "cards",
      "update",
      "Card:1",
      "--state",
      "CLOSED",
      "--funding-sources",
      "InternalAccount:1",
    ]);
    expect(calls).toBe(0);
  });
});

describe("cards reveal", () => {
  it("posts to the reveal endpoint with no body", async () => {
    const { request } = await runCli(["cards", "reveal", "Card:1"]);

    expect(request?.method).toBe("POST");
    expect(request?.path).toBe("/grid/v1/cards/Card:1/reveal");
    expect(request?.body).toBeUndefined();
  });
});
