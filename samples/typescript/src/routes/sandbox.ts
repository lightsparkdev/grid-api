import { Router } from "express";
import { gridClient } from "../gridClient.js";
import { log } from "../log.js";

export const sandboxRouter = Router();

sandboxRouter.post("/send-funds", async (req, res) => {
  try {
    const body = req.body;
    log.incoming("POST", "/api/sandbox/send-funds", JSON.stringify(body));

    log.gridRequest("sandbox.sendFunds", JSON.stringify(body));
    const response = await gridClient.sandbox.sendFunds({
      quoteId: body.quoteId,
      currencyCode: body.currencyCode || "USD",
      currencyAmount: body.currencyAmount,
    });
    const responseJson = JSON.stringify(response, null, 2);
    log.gridResponse("sandbox.sendFunds", responseJson);

    res.status(200).json(response);
  } catch (error) {
    log.gridError("sandbox.sendFunds", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});
