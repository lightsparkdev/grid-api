// Accuracy check for the curated country list: asserts every BANK_COUNTRIES
// entry maps to a real spec accountType, has a valid region where required, and
// that any sample override satisfies the spec field pattern. Run in CI:
//   npm run verify:bank-data
import { assertBankCountries, BANK_COUNTRIES, currencyFor } from '../src/data/bankCountries';

assertBankCountries();
const currencies = new Set(BANK_COUNTRIES.map(currencyFor));
console.log(
  `bankCountries OK: ${BANK_COUNTRIES.length} countries across ${currencies.size} currencies, all validated against the spec.`,
);
