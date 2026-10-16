/** The card details the processor's embed would render
 *  (`POST /cards/{id}/reveal`). The cardholder's name is the visitor's, in
 *  `CardDesign`. A new set is drawn each time a card is issued; the API
 *  panel's Card resource and the phone read the same current set. */

export interface CardCredentials {
  /** The PAN in its four groups. */
  groups: string[];
  last4: string;
  /** MM/YY. */
  exp: string;
  cvv: string;
}

/** The first card's details, the same on the server and the client (a random
 *  draw at module load would differ between the two). */
const FIRST: CardCredentials = { groups: ['4242', '7715', '3306', '8972'], last4: '8972', exp: '06/30', cvv: '317' };

const digit = () => Math.floor(Math.random() * 10);

/** The Luhn check digit for the digits before it. */
function luhnCheck(digits: number[]): number {
  let sum = 0;
  // Doubling from the right, starting with the rightmost of these (the
  // check digit itself is the last position and is not doubled).
  for (let i = digits.length - 1, dbl = true; i >= 0; i--, dbl = !dbl) {
    let d = digits[i];
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

/** A fresh, valid-looking Visa: a 4, fourteen random digits, the check
 *  digit; a three-digit code. The expiry stays put. */
export function newCredentials(): CardCredentials {
  const body = [4, ...Array.from({ length: 14 }, digit)];
  const digits = [...body, luhnCheck(body)];
  const pan = digits.join('');
  const groups = [pan.slice(0, 4), pan.slice(4, 8), pan.slice(8, 12), pan.slice(12, 16)];
  const cvv = Array.from({ length: 3 }, digit).join('');
  return { groups, last4: groups[3], exp: FIRST.exp, cvv };
}

let current: CardCredentials = FIRST;

/** The details of the card most recently issued. */
export function currentCredentials(): CardCredentials {
  return current;
}

/** A card is being issued: draw its details. */
export function issueCredentials(): CardCredentials {
  current = newCredentials();
  return current;
}
