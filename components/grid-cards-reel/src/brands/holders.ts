/* The cardholders printed on the brand cards' backs, one per card, from
   countries Grid pays out to (the payout currencies in the OpenAPI spec,
   openapi/components/schemas/external_accounts: AED to ZMW, the euro as
   several countries). Plain Latin letters, as card personalization prints.
   In show order, the regions alternate so neighbors differ. */

import type { CardCredentials } from '@/apps/shared/card/cardholder';
import { rng } from './svg';

export interface Holder {
  name: string;
  country: string;
}

export const HOLDERS: Holder[] = [
  { name: 'Amara Okafor', country: 'Nigeria' },
  { name: 'Lucas Oliveira', country: 'Brazil' },
  { name: 'Priya Raghavan', country: 'India' },
  { name: 'Sofia Hernandez', country: 'Mexico' },
  { name: 'Kwame Mensah', country: 'Ghana' },
  { name: 'Nguyen Thi Lan', country: 'Vietnam' },
  { name: 'Emma Schneider', country: 'Germany' },
  { name: 'Juan Pablo Restrepo', country: 'Colombia' },
  { name: 'Wanjiru Kamau', country: 'Kenya' },
  { name: 'Siti Rahmawati', country: 'Indonesia' },
  { name: 'Oliver Bennett', country: 'United Kingdom' },
  { name: 'Fatima Al Mansouri', country: 'United Arab Emirates' },
  { name: 'Maria Clara Santos', country: 'Philippines' },
  { name: 'Thabo Nkosi', country: 'South Africa' },
  { name: 'Liam Tremblay', country: 'Canada' },
  { name: 'Chen Jiayi', country: 'China' },
  { name: 'Ayesha Siddiqui', country: 'Pakistan' },
  { name: 'Mateo Garcia', country: 'Spain' },
  { name: 'Nomvula Banda', country: 'Zambia' },
  { name: 'Tan Wei Ming', country: 'Singapore' },
  { name: 'Rafiq Hossain', country: 'Bangladesh' },
  { name: 'Camille Laurent', country: 'France' },
  { name: 'Grace Nakato', country: 'Uganda' },
  { name: 'Somchai Wongsakul', country: 'Thailand' },
  { name: 'Mehmet Yilmaz', country: 'Turkiye' },
  { name: 'Aline Uwase', country: 'Rwanda' },
  { name: 'Diego Morales', country: 'Guatemala' },
  { name: 'Nurul Aisyah', country: 'Malaysia' },
  { name: 'Mads Kristensen', country: 'Denmark' },
  { name: 'Neema Mwakyusa', country: 'Tanzania' },
  { name: 'Yasmin Farouk', country: 'Egypt' },
  { name: 'Kerry-Ann Campbell', country: 'Jamaica' },
  { name: 'Jean-Baptiste Pierre', country: 'Haiti' },
  { name: 'Aminata Diallo', country: 'Senegal' },
  { name: 'Noa Levi', country: 'Israel' },
  { name: 'Wong Ka Yan', country: 'Hong Kong' },
  { name: 'Tumelo Mosweu', country: 'Botswana' },
  { name: 'Chikondi Phiri', country: 'Malawi' },
  { name: 'Ariane Mbarga', country: 'Cameroon' },
  { name: 'Carlos Martinez', country: 'El Salvador' },
  { name: 'Giulia Romano', country: 'Italy' },
  { name: 'Ines Ferreira', country: 'Portugal' },
  { name: 'Maya Johnson', country: 'United States' },
];

function luhn(digits: number[]): number {
  let sum = 0;
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

/** A Visa-shaped number (a 4, fourteen digits, the Luhn check digit) and a
 *  code, the same for a given seed on every render. */
export function credentialsFor(seed: number, exp: string): CardCredentials {
  const r = rng(seed * 7919 + 17);
  const digit = () => Math.floor(r() * 10);
  const body = [4, ...Array.from({ length: 14 }, digit)];
  const pan = [...body, luhn(body)].join('');
  const groups = [pan.slice(0, 4), pan.slice(4, 8), pan.slice(8, 12), pan.slice(12)];
  return { groups, last4: groups[3], exp, cvv: Array.from({ length: 3 }, digit).join('') };
}
