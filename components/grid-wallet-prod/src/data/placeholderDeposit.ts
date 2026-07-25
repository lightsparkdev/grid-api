/**
 * PLACEHOLDER euro deposit details — the ONLY invented values on the Add money
 * screen. Everything else there is read from Grid.
 *
 * Why this exists: Grid provisions this customer a single USD `INTERNAL_FIAT`
 * account, so there are no live SEPA details to read, and the euro half of a
 * US + euro-area wallet would otherwise be missing.
 *
 * TO REPLACE: delete this file and drop the `PLACEHOLDER_EUR_DEPOSIT` spread in
 * `useWalletDemoLogic`. `fetchDepositInstructions` already reads the `iban` field
 * and returns one section per fiat account, so a real EUR account appears on its
 * own the moment the customer has one — no other change needed.
 */
import type { DepositSection } from '@/lib/gridReads';

export const PLACEHOLDER_EUR_DEPOSIT: DepositSection = {
  label: 'EUR',
  rows: [
    ['IBAN', 'DE89 3704 0044 0532 0130 00'],
    ['BIC', 'COBADEFFXXX'],
    ['Rails', 'SEPA · SEPA Instant'],
    ['Reference', 'GGA-EUR-7Q4K2X'],
  ],
  note: 'Include the reference in the payment reference field.',
  placeholder: true,
};
