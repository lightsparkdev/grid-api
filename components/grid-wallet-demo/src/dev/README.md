# App panel dev tooling (temporary)

Used while styling the phone demo. **Delete this entire folder** when done.

## Remove checklist

1. Delete `src/dev/`
2. Simplify `AppPanel.tsx` — keep `Phone` + `DotGridCanvas`, drop `AppDevControls` / `resolvePhoneProps`
3. Trim `page.tsx` props passed into `AppPanel` if no longer needed

## Flags

- `appDev.ts` → `DEV_APP_TOOLS` — master switch (set `false` to hide controls without deleting files)

## localStorage

- `wallet-demo.dev.fixture` — preview screen id (`live` = real demo state)
- `wallet-demo.dev.uiVariant` — `slop` | `swag`
