/* The words a share travels with: the link preview's title and description,
   and the X post. One place, so the meta tags, the unfurl mock, and the
   composer say the same thing. Lightspark, not Grid: the audience is the
   brand's, not the API's. A card with no brand name is "Untitled" where a
   name is called for, and "a card" in a sentence. */

import type { ShareRecord } from './types';

/** The brand as the title wants it: the name given, else "Untitled". */
export function shareBrand(programName: string): string {
  return programName.trim() || 'Untitled';
}

export function shareTitle(brand: string): string {
  return `${brand} Card — Lightspark Cards Playground`;
}

export function shareDescription(record: Pick<ShareRecord, 'kind' | 'forName'>): string {
  return record.kind === 'pitch' && record.forName
    ? `A card for ${record.forName}, issued by Lightspark.`
    : 'Issue a Visa debit card and watch the API calls fire as you go.';
}

/** The X composer's prefill; the link follows it. */
export function sharePostText(programName: string): string {
  const name = programName.trim();
  const what = name ? `the ${name} card` : 'a card';
  return `I designed ${what} on @lightspark. Design yours and watch the API calls fire as you go →`;
}
