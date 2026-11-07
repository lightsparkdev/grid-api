import type { Purchase } from '@/data/agentEvents';
import type { Product } from './conversation';
import { hash } from './hotels';
import { BUY_OPTIONS, RING_LIGHT, usd2 } from './story';

/*
 * Buy online's shelf. Common things people ask an agent to buy each have three invented products (made-up
 * brands, believable prices, a studio photo); anything else gets three made the same way from what they asked
 * for, so the same request always finds the same products. The model only says what they want: the products
 * and every price come from here. The ring light is the tile's story and keeps its real listing.
 */

interface Item {
  /** The maker, which is also the store it's bought from. */
  brand: string;
  /** What people call it: "Aura Max". */
  model: string;
  /** The listing's full name. */
  title: string;
  /** USD cents, with standard shipping. */
  price: number;
  rating: string;
}

interface Category {
  key: string;
  /** Words that mean this category in a request. */
  words: string[];
  items: [Item, Item, Item];
}

const CATEGORIES: Category[] = [
  {
    key: 'headphones',
    words: ['headphones', 'headphone', 'headset', 'over-ear', 'noise cancelling', 'noise canceling'],
    items: [
      { brand: 'Sonora', model: 'Aura Max', title: 'Sonora Aura Max Wireless Noise Cancelling Headphones', price: 24_900, rating: '4.7' },
      { brand: 'Halden', model: 'Studio 2', title: 'Halden Studio 2 Over-Ear Headphones', price: 17_900, rating: '4.5' },
      { brand: 'Vela', model: 'Drift', title: 'Vela Drift Foldable Wireless Headphones', price: 8_900, rating: '4.3' },
    ],
  },
  {
    key: 'earbuds',
    words: ['earbuds', 'earbud', 'earphones', 'in-ear', 'airpods', 'buds'],
    items: [
      { brand: 'Sonora', model: 'Pods Pro', title: 'Sonora Pods Pro Wireless Earbuds', price: 17_900, rating: '4.6' },
      { brand: 'Vela', model: 'Air', title: 'Vela Air True Wireless Earbuds', price: 7_900, rating: '4.4' },
      { brand: 'Kinetic', model: 'Sport', title: 'Kinetic Sport Earbuds with Ear Hooks', price: 5_900, rating: '4.2' },
    ],
  },
  {
    key: 'keyboard',
    words: ['keyboard', 'keyboards', 'mechanical keyboard'],
    items: [
      { brand: 'Keyform', model: 'K75', title: 'Keyform K75 Wireless Mechanical Keyboard', price: 12_900, rating: '4.7' },
      { brand: 'Lumen', model: 'Slim', title: 'Lumen Slim Low-Profile Keyboard', price: 7_900, rating: '4.5' },
      { brand: 'Oriel', model: 'Tenkey', title: 'Oriel Tenkeyless Keyboard, White', price: 9_900, rating: '4.4' },
    ],
  },
  {
    key: 'mouse',
    words: ['mouse', 'mice', 'trackpad'],
    items: [
      { brand: 'Keyform', model: 'Glide', title: 'Keyform Glide Wireless Mouse', price: 7_900, rating: '4.6' },
      { brand: 'Lumen', model: 'Arc', title: 'Lumen Arc Ergonomic Mouse', price: 5_900, rating: '4.4' },
      { brand: 'Oriel', model: 'Mini', title: 'Oriel Mini Travel Mouse', price: 2_900, rating: '4.2' },
    ],
  },
  {
    key: 'monitor',
    words: ['monitor', 'display', 'screen'],
    items: [
      { brand: 'Halden', model: 'View 27', title: 'Halden View 27" 4K Monitor', price: 37_900, rating: '4.6' },
      { brand: 'Lumen', model: 'Pro 32', title: 'Lumen Pro 32" 4K USB-C Monitor', price: 54_900, rating: '4.5' },
      { brand: 'Oriel', model: 'Port 16', title: 'Oriel Port 16" Portable Monitor', price: 18_900, rating: '4.3' },
    ],
  },
  {
    key: 'laptop-stand',
    words: ['laptop stand', 'stand', 'riser'],
    items: [
      { brand: 'Wren', model: 'Lift', title: 'Wren Lift Aluminum Laptop Stand', price: 4_900, rating: '4.7' },
      { brand: 'Oriel', model: 'Fold', title: 'Oriel Fold Portable Laptop Stand', price: 2_900, rating: '4.4' },
      { brand: 'Halden', model: 'Desk Riser', title: 'Halden Walnut Desk Riser', price: 8_900, rating: '4.5' },
    ],
  },
  {
    key: 'charger',
    words: ['charger', 'charging', 'power bank', 'battery pack', 'cable', 'adapter'],
    items: [
      { brand: 'Volt', model: 'Cube 65W', title: 'Volt Cube 65W USB-C Charger', price: 4_900, rating: '4.7' },
      { brand: 'Volt', model: 'Pack 10K', title: 'Volt Pack 10,000mAh Power Bank', price: 3_900, rating: '4.5' },
      { brand: 'Lumen', model: 'Trio', title: 'Lumen Trio 3-in-1 Wireless Charging Stand', price: 8_900, rating: '4.4' },
    ],
  },
  {
    key: 'phone-case',
    words: ['phone case', 'case', 'iphone case'],
    items: [
      { brand: 'Shell', model: 'Clear', title: 'Shell Clear Case with MagSafe', price: 3_900, rating: '4.6' },
      { brand: 'Shell', model: 'Leather', title: 'Shell Leather Case, Saddle Brown', price: 5_900, rating: '4.5' },
      { brand: 'Kinetic', model: 'Rugged', title: 'Kinetic Rugged Drop-Proof Case', price: 2_900, rating: '4.3' },
    ],
  },
  {
    key: 'smartwatch',
    words: ['smartwatch', 'smart watch', 'watch', 'fitness tracker', 'tracker'],
    items: [
      { brand: 'Pulse', model: 'Watch 4', title: 'Pulse Watch 4 GPS Smartwatch', price: 29_900, rating: '4.6' },
      { brand: 'Kinetic', model: 'Band', title: 'Kinetic Band Fitness Tracker', price: 9_900, rating: '4.4' },
      { brand: 'Halden', model: 'Classic', title: 'Halden Classic Hybrid Smartwatch', price: 19_900, rating: '4.3' },
    ],
  },
  {
    key: 'speaker',
    words: ['speaker', 'speakers', 'bluetooth speaker', 'soundbar'],
    items: [
      { brand: 'Sonora', model: 'Pebble', title: 'Sonora Pebble Portable Bluetooth Speaker', price: 9_900, rating: '4.7' },
      { brand: 'Sonora', model: 'Home', title: 'Sonora Home Smart Speaker', price: 19_900, rating: '4.5' },
      { brand: 'Vela', model: 'Wave', title: 'Vela Wave Waterproof Speaker', price: 5_900, rating: '4.4' },
    ],
  },
  {
    key: 'camera',
    words: ['camera', 'webcam', 'action cam', 'instant camera'],
    items: [
      { brand: 'Optica', model: 'M10', title: 'Optica M10 Mirrorless Camera with 24mm Lens', price: 89_900, rating: '4.8' },
      { brand: 'Optica', model: 'Snap', title: 'Optica Snap Instant Camera', price: 9_900, rating: '4.5' },
      { brand: 'Lumen', model: 'Cam 4K', title: 'Lumen Cam 4K Webcam', price: 12_900, rating: '4.4' },
    ],
  },
  {
    key: 'backpack',
    words: ['backpack', 'back pack', 'rucksack', 'laptop bag'],
    items: [
      { brand: 'Fieldnote', model: 'Daypack 20L', title: 'Fieldnote Daypack 20L', price: 12_900, rating: '4.7' },
      { brand: 'Wren', model: 'Commuter', title: 'Wren Commuter Laptop Backpack', price: 9_900, rating: '4.5' },
      { brand: 'Kinetic', model: 'Trail 28', title: 'Kinetic Trail 28L Hiking Pack', price: 14_900, rating: '4.4' },
    ],
  },
  {
    key: 'sneakers',
    words: ['sneakers', 'sneaker', 'shoes', 'running shoes', 'trainers', 'kicks'],
    items: [
      { brand: 'Stride', model: 'Runner 3', title: 'Stride Runner 3 Running Shoes', price: 13_900, rating: '4.6' },
      { brand: 'Stride', model: 'Court', title: 'Stride Court Leather Sneakers, White', price: 10_900, rating: '4.5' },
      { brand: 'Kinetic', model: 'Trail', title: 'Kinetic Trail Running Shoes', price: 12_900, rating: '4.4' },
    ],
  },
  {
    key: 'sunglasses',
    words: ['sunglasses', 'shades', 'glasses'],
    items: [
      { brand: 'Solace', model: 'Coast', title: 'Solace Coast Polarized Sunglasses', price: 15_900, rating: '4.6' },
      { brand: 'Solace', model: 'Round', title: 'Solace Round Acetate Sunglasses', price: 12_900, rating: '4.5' },
      { brand: 'Kinetic', model: 'Sport', title: 'Kinetic Sport Wraparound Sunglasses', price: 6_900, rating: '4.3' },
    ],
  },
  {
    key: 'water-bottle',
    words: ['water bottle', 'bottle', 'tumbler', 'thermos'],
    items: [
      { brand: 'Fieldnote', model: 'Steel 24oz', title: 'Fieldnote Insulated Steel Bottle, 24 oz', price: 3_900, rating: '4.7' },
      { brand: 'Calma', model: 'Tumbler', title: 'Calma 40 oz Tumbler with Straw', price: 4_500, rating: '4.6' },
      { brand: 'Kinetic', model: 'Squeeze', title: 'Kinetic Squeeze Sports Bottle', price: 1_900, rating: '4.3' },
    ],
  },
  {
    key: 'coffee-maker',
    words: ['coffee maker', 'coffee machine', 'espresso', 'coffee', 'french press', 'kettle'],
    items: [
      { brand: 'Brava', model: 'Espresso One', title: 'Brava Espresso One Machine', price: 39_900, rating: '4.6' },
      { brand: 'Brava', model: 'Pour', title: 'Brava Pour-Over Coffee Maker', price: 8_900, rating: '4.5' },
      { brand: 'Calma', model: 'Kettle', title: 'Calma Gooseneck Electric Kettle', price: 7_900, rating: '4.6' },
    ],
  },
  {
    key: 'blender',
    words: ['blender', 'smoothie', 'mixer', 'juicer'],
    items: [
      { brand: 'Brava', model: 'Pro 1200', title: 'Brava Pro 1200W Blender', price: 14_900, rating: '4.6' },
      { brand: 'Calma', model: 'Go', title: 'Calma Go Personal Blender', price: 4_900, rating: '4.4' },
      { brand: 'Brava', model: 'Stand Mixer', title: 'Brava 5 qt Stand Mixer', price: 29_900, rating: '4.7' },
    ],
  },
  {
    key: 'desk-lamp',
    words: ['lamp', 'desk lamp', 'light', 'floor lamp'],
    items: [
      { brand: 'Lumen', model: 'Arc Lamp', title: 'Lumen Arc LED Desk Lamp', price: 8_900, rating: '4.6' },
      { brand: 'Halden', model: 'Globe', title: 'Halden Globe Table Lamp', price: 12_900, rating: '4.5' },
      { brand: 'Oriel', model: 'Clip', title: 'Oriel Clip-On Reading Light', price: 2_900, rating: '4.3' },
    ],
  },
  {
    key: 'yoga-mat',
    words: ['yoga mat', 'yoga', 'exercise mat', 'mat', 'dumbbells', 'weights'],
    items: [
      { brand: 'Kinetic', model: 'Grip Mat', title: 'Kinetic Grip Yoga Mat, 5mm', price: 6_900, rating: '4.7' },
      { brand: 'Calma', model: 'Cork', title: 'Calma Cork Yoga Mat', price: 8_900, rating: '4.5' },
      { brand: 'Kinetic', model: 'Dumbbells', title: 'Kinetic Adjustable Dumbbells, Pair', price: 19_900, rating: '4.6' },
    ],
  },
  {
    key: 'controller',
    words: ['controller', 'gamepad', 'game controller', 'joystick', 'console', 'gaming'],
    items: [
      { brand: 'Arcade', model: 'Pro Pad', title: 'Arcade Pro Pad Wireless Controller', price: 6_900, rating: '4.6' },
      { brand: 'Arcade', model: 'Elite', title: 'Arcade Elite Controller with Paddles', price: 14_900, rating: '4.5' },
      { brand: 'Arcade', model: 'Retro', title: 'Arcade Retro Mini Controller', price: 2_900, rating: '4.3' },
    ],
  },
  {
    key: 'tablet',
    words: ['tablet', 'ipad', 'e-reader', 'kindle', 'ereader'],
    items: [
      { brand: 'Lumen', model: 'Tab 11', title: 'Lumen Tab 11" Tablet, 128 GB', price: 44_900, rating: '4.6' },
      { brand: 'Oriel', model: 'Page', title: 'Oriel Page E-Reader', price: 13_900, rating: '4.7' },
      { brand: 'Lumen', model: 'Tab Mini', title: 'Lumen Tab Mini 8" Tablet', price: 29_900, rating: '4.4' },
    ],
  },
  {
    key: 'travel-bag',
    words: ['suitcase', 'luggage', 'carry-on', 'carry on', 'duffel', 'duffle', 'travel bag'],
    items: [
      { brand: 'Fieldnote', model: 'Carry-On', title: 'Fieldnote Hardshell Carry-On', price: 27_500, rating: '4.7' },
      { brand: 'Wren', model: 'Weekender', title: 'Wren Canvas Weekender Duffel', price: 14_900, rating: '4.5' },
      { brand: 'Fieldnote', model: 'Check 26', title: 'Fieldnote Large Check-In Suitcase', price: 34_900, rating: '4.6' },
    ],
  },
  {
    key: 'plant-pot',
    words: ['plant', 'plants', 'pot', 'planter', 'vase', 'flowers'],
    items: [
      { brand: 'Verde', model: 'Planter', title: 'Verde Ceramic Planter with Stand', price: 4_900, rating: '4.6' },
      { brand: 'Verde', model: 'Monstera', title: 'Verde Monstera in Stoneware Pot', price: 6_900, rating: '4.5' },
      { brand: 'Calma', model: 'Vase', title: 'Calma Stoneware Bud Vase', price: 3_400, rating: '4.4' },
    ],
  },
];

const BRANDS = ['Lumen', 'Halden', 'Oriel', 'Wren', 'Calma', 'Fieldnote', 'Kinetic', 'Verde'];
const GENERIC = 3;

const titleCase = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (w ? w[0].toLocaleUpperCase() + w.slice(1) : w))
    .join(' ');

const domainOf = (brand: string) => `${brand.toLowerCase().replace(/[^a-z]/g, '')}.com`;

/** The category a request means: the one whose word it uses, longest word first ("desk lamp" over "lamp"). */
function categoryFor(query: string): Category | undefined {
  const q = ` ${query.toLowerCase().replace(/[^a-z0-9 -]/g, ' ')} `;
  let best: { c: Category; len: number } | undefined;
  for (const c of CATEGORIES) {
    for (const w of c.words) {
      if (q.includes(` ${w} `) && (!best || w.length > best.len)) best = { c, len: w.length };
    }
  }
  return best?.c;
}

/** Three made from the request itself, priced from its name. */
function generated(query: string): Item[] {
  const name = titleCase(query.replace(/^(a|an|some|new)\s+/i, ''));
  const h = hash(name);
  const base = 1_500 + (h % 120) * 100;
  return [
    { brand: BRANDS[h % BRANDS.length], model: `${name} Pro`, title: `${BRANDS[h % BRANDS.length]} ${name} Pro`, price: base + 3_000, rating: '4.6' },
    { brand: BRANDS[(h >> 3) % BRANDS.length], model: name, title: `${BRANDS[(h >> 3) % BRANDS.length]} ${name}`, price: base, rating: '4.4' },
    { brand: BRANDS[(h >> 6) % BRANDS.length], model: `${name} Lite`, title: `${BRANDS[(h >> 6) % BRANDS.length]} ${name} Lite`, price: Math.max(900, base - 1_000), rating: '4.2' },
  ];
}

export interface Shelf {
  query: string;
  /** What the carousel shows, the first one picked. */
  options: Product[];
  /** The one the agent buys. */
  pick: { brand: string; model: string; item: string; amount: number; image: string };
  /** The person named this one (the ring light they saved): the agent buys it without asking which. */
  named?: boolean;
}

/** What a request finds: the ring light's real listing for the tile (or a ring light), a category's three, or three made up. */
export function shelfFor(query?: string): Shelf {
  const q = query?.trim() ?? '';
  if (!q || /ring ?light/i.test(q)) {
    return {
      query: q || 'ring light',
      options: BUY_OPTIONS,
      pick: { brand: RING_LIGHT.merchant, model: 'RP10-H', item: RING_LIGHT.item, amount: RING_LIGHT.amount, image: RING_LIGHT.image },
      named: true,
    };
  }
  const c = categoryFor(q);
  const items = c ? c.items : generated(q);
  const image = (i: number) => (c ? `/assets/agents/products/${c.key}-${i + 1}.webp` : `/assets/agents/products/generic-${(hash(q) + i) % GENERIC + 1}.webp`);
  const options = items.map((it, i) => ({
    title: it.title,
    model: it.model,
    merchant: it.brand,
    domain: domainOf(it.brand),
    price: usd2(it.price),
    rating: it.rating,
    image: image(i),
    ...(i === 0 && { pick: true }),
  }));
  const first = items[0];
  return { query: q, options, pick: { brand: first.brand, model: first.model, item: first.title, amount: first.price, image: image(0) } };
}

/** The shelf with another of its options picked, the one the person chose. */
export function shelfWith(shelf: Shelf, i: number): Shelf {
  const o = shelf.options[i];
  if (!o || i === 0) return shelf;
  const amount = Math.round(Number(o.price.replace(/[^0-9.]/g, '')) * 100);
  return { ...shelf, pick: { brand: o.merchant, model: o.title.replace(new RegExp(`^${o.merchant}\\s+`), ''), item: o.title, amount, image: o.image } };
}

/** What the agent asks Grid to buy, and what the lines and cards read. */
export function purchaseFor(shelf: Shelf): Purchase {
  const p = shelf.pick;
  return { merchant: p.brand, description: `${p.item}, standard shipping`, amount: p.amount };
}

export function shelfParams(shelf: Shelf) {
  const p = shelf.pick;
  return { query: shelf.query, merchant: p.brand, model: p.model, item: p.item, amount: p.amount, image: p.image };
}
