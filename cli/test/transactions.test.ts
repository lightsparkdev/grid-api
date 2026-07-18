import { describe, it, expect } from "vitest";
import { runCli } from "./helpers";

describe("transactions list", () => {
  it("passes the accountIdentifier filter", async () => {
    const { request } = await runCli([
      "transactions",
      "list",
      "--account-identifier",
      "InternalAccount:abc",
    ]);

    expect(request?.query).toMatchObject({
      accountIdentifier: "InternalAccount:abc",
    });
  });
});

describe("transactions approve", () => {
  it("sends receiverCustomerInfo from a JSON option", async () => {
    const { request } = await runCli([
      "transactions",
      "approve",
      "txn_1",
      "--receiver-customer-info",
      '{"FULL_NAME":"Ada Lovelace"}',
    ]);

    expect(request?.method).toBe("POST");
    expect(request?.path).toBe("/grid/v1/transactions/txn_1/approve");
    expect(request?.body).toMatchObject({
      receiverCustomerInfo: { FULL_NAME: "Ada Lovelace" },
    });
  });
});

describe("receiver lookup-account", () => {
  it("passes senderUmaAddress and customerId query params", async () => {
    const { request } = await runCli([
      "receiver",
      "lookup-account",
      "ExternalAccount:abc",
      "--sender-uma",
      "$sender@uma.example.com",
      "--customer-id",
      "Customer:xyz",
    ]);

    expect(request?.path).toBe(
      "/grid/v1/receiver/external-account/ExternalAccount%3Aabc"
    );
    expect(request?.query).toMatchObject({
      senderUmaAddress: "$sender@uma.example.com",
      customerId: "Customer:xyz",
    });
  });
});
