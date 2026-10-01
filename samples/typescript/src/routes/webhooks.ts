import { Router } from "express";
import { gridClient } from "../gridClient.js";
import { webhookStream } from "../webhookStream.js";
import { log } from "../log.js";

export const webhookRouter = Router();

webhookRouter.post("/", (req, res) => {
  const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  log.webhook(rawBody);

  const event = gridClient.webhooks.unwrap(rawBody);
  log.gridResponse("webhooks.unwrap", JSON.stringify(event, null, 2));

  webhookStream.addEvent(rawBody);
  res.sendStatus(200);
});
