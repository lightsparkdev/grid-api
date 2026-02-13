import { Router } from "express";
import { gridClient } from "../gridClient.js";
import { log } from "../log.js";

export const quoteRouter = Router();

quoteRouter.post("/", async (req, res) => {
  try {
    const body = req.body;
    log.incoming("POST", "/api/quotes", JSON.stringify(body));

    log.gridRequest("quotes.create", JSON.stringify(body));
    const quote = await gridClient.quotes.create({
      source: body.source,
      destination: body.destination,
      lockedCurrencyAmount: body.lockedCurrencyAmount,
      lockedCurrencySide: body.lockedCurrencySide || "SENDING",
      description: body.description,
      lookupId: body.lookupId,
      senderCustomerInfo: body.senderCustomerInfo,
    });
    const responseJson = JSON.stringify(quote, null, 2);
    log.gridResponse("quotes.create", responseJson);

    res.status(201).json(quote);
  } catch (error) {
    log.gridError("quotes.create", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

quoteRouter.post("/:quoteId/execute", async (req, res) => {
  try {
    const quoteId = req.params.quoteId;
    log.incoming("POST", `/api/quotes/${quoteId}/execute`);

    log.gridRequest("quotes.execute", `quoteId=${quoteId}`);
    const quote = await gridClient.quotes.execute(quoteId);
    const responseJson = JSON.stringify(quote, null, 2);
    log.gridResponse("quotes.execute", responseJson);

    res.status(200).json(quote);
  } catch (error) {
    log.gridError("quotes.execute", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});
