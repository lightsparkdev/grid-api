import { describe, it, expect } from "vitest";
import { runCli } from "./helpers";

describe("transfers out", () => {
  it("sends remittanceInformation and destination paymentRail", async () => {
    const { request } = await runCli([
      "transfers",
      "out",
      "--source",
      "InternalAccount:abc",
      "--dest",
      "ExternalAccount:xyz",
      "--remittance-information",
      "Payroll",
      "--payment-rail",
      "ACH",
    ]);

    expect(request?.body).toMatchObject({
      remittanceInformation: "Payroll",
      destination: { accountId: "ExternalAccount:xyz", paymentRail: "ACH" },
    });
  });
});
