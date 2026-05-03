# Webhooks follow-up

Load this only when the user, after finishing the happy-path tutorial, asks something
like "how do webhooks work?" / "let's add webhooks" / "what about real-time updates?".

The v1 tutorial polls `GET /transactions/{id}` to track payment status. Production
integrations don't poll — Grid pushes status changes via webhooks. This add-on
upgrades the demo.

## What changes

1. Add a webhook receiver route to the demo: `app/api/webhooks/route.ts`.
2. Configure Grid's platform to point at the receiver.
3. Locally, use a tunnel (`cloudflared`/`ngrok`) so Grid can reach `localhost:3000`.
4. Verify the `X-Grid-Signature` header on every incoming webhook.

## Step 1 — Add the receiver

Create `app/api/webhooks/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-grid-signature") ?? "";
  const secret = process.env.GRID_WEBHOOK_SECRET ?? "";

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  console.log("[webhook]", event.type, event.id);
  return NextResponse.json({ ok: true });
}
```

Tell the user: `console.log` is fine for the tutorial. In production this is where you'd
update your database, fan out to subscribers, etc. *Always* respond `2xx` quickly —
Grid retries on `5xx` and timeouts.

## Step 2 — Get a webhook signing secret

The signing secret comes from the Grid dashboard's webhook configuration, not from
the API token. Add it to `.env.local`:

```
GRID_WEBHOOK_SECRET=<from dashboard>
```

## Step 3 — Set up a tunnel

Local dev servers aren't reachable from Grid's infra. Use a tunnel:

```bash
brew install cloudflare/cloudflare/cloudflared   # one-time
cloudflared tunnel --url http://localhost:3000   # prints a public URL
```

Or use ngrok if the user prefers.

## Step 4 — Tell Grid where to send webhooks

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X PATCH -H "Content-Type: application/json" \
  -d "{\"webhookEndpoint\": \"https://<tunnel-url>/api/webhooks\"}" \
  "$GRID_BASE_URL/config" | jq .
```

## Step 5 — Test it

Trigger a synthetic webhook from sandbox:

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST "$GRID_BASE_URL/sandbox/webhooks/test" | jq .
```

The receiver should log the event. Then re-run the payouts flow — the
`OUTGOING_PAYMENT` webhook should fire when the transfer completes, replacing the
need to poll.

## Events worth handling

| Event | When it fires | What to do |
| --- | --- | --- |
| `INCOMING_PAYMENT` | Funds arrive in an internal account | Update balance display |
| `OUTGOING_PAYMENT` | Outgoing transfer settles | Mark transaction as final |
| `CUSTOMER_STATUS_UPDATED` | KYC approved/rejected | Unblock or notify customer |
| `VERIFICATION_STATUS_UPDATED` | Document verification result | Prompt for re-upload if rejected |
| `INTERNAL_ACCOUNT_STATUS_UPDATED` | Balance/lock state changes | UI refresh |

## Authoritative reference

- <https://grid.lightspark.com/api-reference/webhooks> — full webhook spec with all event types and signature verification details (append `.md` for an LLM-friendly version).

## Production considerations to flag

- **Idempotency**: Grid retries on failure. Use the event `id` to dedupe.
- **Ordering is not guaranteed**: don't assume `INCOMING_PAYMENT` arrives before
  `INTERNAL_ACCOUNT_STATUS_UPDATED`.
- **Use a queue**: process webhooks asynchronously so a slow handler doesn't tip Grid
  into retry-storm territory.
- **Rotate the signing secret** if it leaks; the dashboard supports this.
