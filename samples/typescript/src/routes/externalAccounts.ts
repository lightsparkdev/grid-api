import { Router } from "express";
import { gridClient } from "../gridClient.js";
import { log } from "../log.js";

export const externalAccountRouter = Router();

externalAccountRouter.post("/:customerId/external-accounts", async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const body = req.body;
    log.incoming("POST", `/api/customers/${customerId}/external-accounts`, JSON.stringify(body));

    const accountInfo = body.accountInfo || {};
    const beneficiary = body.beneficiary || accountInfo.beneficiary || {
      beneficiaryType: "INDIVIDUAL",
      fullName: "Account Holder",
      nationality: "US",
      birthDate: "1990-01-01",
    };

    // Ensure beneficiary is nested inside accountInfo for the SDK
    const fullAccountInfo = {
      ...accountInfo,
      beneficiary,
    };

    log.gridRequest("customers.externalAccounts.create", JSON.stringify(body));
    const account = await gridClient.customers.externalAccounts.create({
      accountInfo: fullAccountInfo,
      currency: body.currency || "USD",
      customerId,
      platformAccountId: body.platformAccountId,
    });
    const responseJson = JSON.stringify(account, null, 2);
    log.gridResponse("customers.externalAccounts.create", responseJson);

    res.status(201).json(account);
  } catch (error) {
    log.gridError("customers.externalAccounts.create", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});
