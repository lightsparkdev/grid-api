# Webhook signature verification block

Paste this into the webhooks section of every guide. It is a condensed form of the Express example in `mintlify/snippets/webhooks.mdx`; the header format, algorithm, and key type come from there. If that snippet changes, update this file to match.

---

Every webhook carries an `X-Grid-Signature` header. Fetch your Grid public key from the dashboard under Developers, webhook settings, and verify before processing anything.

1. Parse the header. It is JSON of the form `{"v": "1", "s": "<base64 signature>"}`. If parsing fails, treat the whole header as base64.
2. Base64-decode the signature.
3. Verify the signature over the raw request body using ECDSA with SHA-256 and the public key.
4. Reject with `401` if verification fails.

```javascript
const crypto = require("crypto");

function verifyGridWebhook(rawBody, signatureHeader, publicKeyPem) {
  let signature;
  try {
    const parsed = JSON.parse(signatureHeader);
    signature = Buffer.from(parsed.s, "base64");
  } catch {
    signature = Buffer.from(signatureHeader, "base64");
  }
  const verifier = crypto.createVerify("SHA256");
  verifier.update(rawBody);
  verifier.end();
  return verifier.verify({ key: publicKeyPem, format: "pem", type: "spki" }, signature);
}
```

Verify against the raw bytes. Re-serializing the parsed JSON changes whitespace and key order and breaks the signature.
