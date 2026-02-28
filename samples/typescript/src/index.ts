import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { log } from "./log.js";
import { webhookStream } from "./webhookStream.js";
import { customerRouter } from "./routes/customers.js";
import { externalAccountRouter } from "./routes/externalAccounts.js";
import { quoteRouter } from "./routes/quotes.js";
import { sandboxRouter } from "./routes/sandbox.js";
import { webhookRouter } from "./routes/webhooks.js";

const app = express();
const PORT = 8080;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CORS
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (_req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

// JSON body parsing
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  if (req.path.startsWith("/api/") && req.method !== "OPTIONS") {
    log.incoming(req.method, req.path);
  }
  next();
});

// API routes
app.use("/api/customers", customerRouter);
app.use("/api/customers", externalAccountRouter);
app.use("/api/quotes", quoteRouter);
app.use("/api/sandbox", sandboxRouter);
app.use("/api/webhooks", webhookRouter);

// SSE endpoint
app.get("/api/sse", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Send connected message
  const connected = JSON.stringify({ type: "connected", timestamp: Date.now() });
  res.write(`data: ${connected}\n\n`);

  // Replay buffered events
  for (const event of webhookStream.getReplayEvents()) {
    res.write(`data: ${event}\n\n`);
  }

  // Stream new events
  const onEvent = (event: string) => {
    res.write(`data: ${event}\n\n`);
  };
  webhookStream.on("event", onEvent);

  // Heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    res.write(`data: heartbeat\n\n`);
  }, 30_000);

  req.on("close", () => {
    webhookStream.off("event", onEvent);
    clearInterval(heartbeat);
  });
});

// Static files (frontend build output) — must come after API routes
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n  Grid TypeScript Sample`);
  console.log(`  http://localhost:${PORT}\n`);
});
