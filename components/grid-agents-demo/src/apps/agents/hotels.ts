import type { MerchantAgent } from '@/data/agentEvents';
import type { Params } from './conversation';

/*
 * Pay an agent's stays. Popular cities have an invented boutique hotel and a believable nightly rate; anywhere
 * else gets one made the same way from the city's name, so the same city always gets the same hotel. The model
 * only says where and when: the hotel and every price come from here, so the math always adds up. Nothing here
 * is a real hotel.
 */

interface Hotel {
  city: string;
  hotel: string;
  /** USD cents a night, before the 10% off for paying the hotel's agent directly. */
  nightly: number;
}

const CITIES: Hotel[] = [
  { city: 'Lisbon', hotel: 'Hotel Alma', nightly: 20_600 },
  { city: 'Tokyo', hotel: 'Hotel Kōen', nightly: 26_000 },
  { city: 'Paris', hotel: 'Maison Lune', nightly: 31_000 },
  { city: 'New York', hotel: 'The Halden', nightly: 34_000 },
  { city: 'London', hotel: 'The Fenwick', nightly: 29_000 },
  { city: 'Mexico City', hotel: 'Casa Ámbar', nightly: 17_000 },
  { city: 'Barcelona', hotel: 'Hotel Brisa', nightly: 23_000 },
  { city: 'Rome', hotel: 'Albergo Sole', nightly: 24_000 },
  { city: 'Bangkok', hotel: 'Baan Saeng', nightly: 12_000 },
  { city: 'Singapore', hotel: 'The Linden', nightly: 28_000 },
  { city: 'Seoul', hotel: 'Hotel Dal', nightly: 19_000 },
  { city: 'Istanbul', hotel: 'Konak Mira', nightly: 15_000 },
  { city: 'Cape Town', hotel: 'Fynbos House', nightly: 16_000 },
  { city: 'Buenos Aires', hotel: 'Casa Sur', nightly: 13_000 },
  { city: 'Sydney', hotel: 'The Wattle', nightly: 25_000 },
  { city: 'Dubai', hotel: 'Dar Noor', nightly: 30_000 },
  { city: 'Amsterdam', hotel: 'Hotel Gracht', nightly: 26_000 },
  { city: 'Berlin', hotel: 'Haus Linde', nightly: 18_000 },
];

const ALIASES: Record<string, string> = { nyc: 'New York', 'new york city': 'New York', cdmx: 'Mexico City', 'mexico df': 'Mexico City' };

const PATTERNS = ['Hotel {w}', 'Casa {w}', 'The {w}', 'Maison {w}', '{w} House'];
const WORDS = ['Lumen', 'Verde', 'Solace', 'Marlow', 'Oriel', 'Tessa', 'Calma', 'Wren', 'Azul', 'Juniper', 'Linde', 'Halcyon'];

/** A small stable hash, so a city always gets the same made-up hotel. */
function hash(s: string) {
  let h = 2166136261;
  for (const ch of s.toLowerCase()) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

const titleCase = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (w ? w[0].toLocaleUpperCase() + w.slice(1) : w))
    .join(' ');

function hotelFor(city: string): Hotel {
  const name = ALIASES[city.trim().toLowerCase()] ?? titleCase(city);
  const known = CITIES.find((c) => c.city.toLowerCase() === name.toLowerCase());
  if (known) return known;
  const h = hash(name);
  const word = WORDS[h % WORDS.length];
  return {
    city: name,
    hotel: PATTERNS[(h >>> 8) % PATTERNS.length].replace('{w}', word),
    nightly: 12_000 + ((h >>> 16) % 21) * 1_000,
  };
}

export interface Stay {
  hotel: string;
  city: string;
  /** "June 12 to 14", "June 30 to July 2". */
  dates: string;
  nights: number;
  guests: number;
  /** USD cents: what the hotel lists for the stay, and what the agent pays it directly (10% off). */
  listed: number;
  amount: number;
}

const DAY = 86_400_000;
const parse = (iso: string) => new Date(`${iso}T00:00:00Z`);
const month = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });

function datesLabel(from: Date, to: Date) {
  const same = from.getUTCMonth() === to.getUTCMonth();
  return `${month(from)} ${from.getUTCDate()} to ${same ? '' : `${month(to)} `}${to.getUTCDate()}`;
}

/** The Pay an agent tile's stay: Hotel Alma in Lisbon, June 12 to 14, two guests. */
const STORY = { city: 'Lisbon', dates: 'June 12 to 14', nights: 2, guests: 2 };

/** Where and when someone asked to stay, priced; the tile's story when they didn't say. */
export function stayFor(p?: { city?: string; checkIn?: string; checkOut?: string; guests?: number }): Stay {
  const asked = p?.city && p.checkIn && p.checkOut;
  const from = asked ? parse(p.checkIn!) : null;
  const to = asked ? parse(p.checkOut!) : null;
  const nights = from && to ? Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY)) : STORY.nights;
  const h = hotelFor(asked ? p.city! : STORY.city);
  const listed = h.nightly * nights;
  return {
    hotel: h.hotel,
    city: h.city,
    dates: from && to ? datesLabel(from, to) : STORY.dates,
    nights,
    guests: asked ? (p.guests ?? 1) : STORY.guests,
    listed,
    amount: Math.round(listed * 0.9),
  };
}

/** The other side of the payment, as Grid sees it, and how History and the "already booked" check name it. */
export function merchantFor(s: Stay): MerchantAgent {
  return { name: s.hotel, amount: s.amount, description: `${s.nights === 1 ? '1 night' : `${s.nights} nights`} in ${s.city}, ${s.dates}` };
}

/** What the lines, the approval and the receipt say the stay with. */
export function stayParams(s: Stay): Params {
  return { hotel: s.hotel, city: s.city, dates: s.dates, nights: s.nights, guests: s.guests, listed: s.listed, amount: s.amount };
}
