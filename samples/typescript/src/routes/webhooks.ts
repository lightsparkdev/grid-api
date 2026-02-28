import { Router } from "express";
import { webhookStream } from "../webhookStream.js";
import { log } from "../log.js";

export const webhookRouter = Router();

webhookRouter.post("/", (req, res) => {
  const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  log.webhook(rawBody);

  // TODO: Webhook signature verification will be available in an upcoming SDK release.
  // For now, we trust the payload in this sample app.

  webhookStream.addEvent(rawBody);
  res.sendStatus(200);
});
