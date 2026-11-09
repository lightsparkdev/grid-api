import type { Purchase } from '@/data/agentEvents';
import type { Params, Product } from './conversation';
import { hash } from './hotels';
import { NAMED_PHOTOS } from './namedPhotos';
import { GIFT_CARDS, NAMED_PRODUCTS, type GiftCard, type NamedProduct } from './namedProducts';
import { BANK_COUNTRIES, currencyFor } from '@/data/bankCountries';
import { formatMoney } from './linkedBank';
import { BUY_OPTIONS, RING_LIGHT, usd2 } from './story';

/*
 * Buy online's shelf. The model passes on what they asked for (a product, a brand, a gift card's value, a budget);
 * the products and every price come from here. A product people name is on a checked list (namedProducts) or
 * priced from the model's estimate; common categories each have three invented products (made-up brands,
 * believable prices, a studio photo); anything else gets three made the same way from what they asked for, so the
 * same request always finds the same products. The ring light is the tile's story and keeps its real listing.
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
  /** Left off where stars would read oddly: a bill, a top-up. */
  rating?: string;
}

interface Category {
  key: string;
  /** How it arrives, when it isn't shipped: food from nearby within the hour, a ride, tickets by email, a top-up, a bill. */
  delivery?: Delivery;
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
    words: ['coffee maker', 'coffee machine', 'espresso machine', 'french press', 'kettle'],
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
    key: 'spirits',
    words: ['whiskey', 'whisky', 'bourbon', 'scotch', 'rye', 'tequila', 'mezcal', 'vodka', 'gin', 'rum', 'liquor', 'spirits', 'booze'],
    items: [
      { brand: 'Halden', model: 'Small Batch Bourbon', title: 'Halden Small Batch Kentucky Bourbon, 750ml', price: 4_200, rating: '4.7' },
      { brand: 'Oriel', model: 'Reposado', title: 'Oriel Reposado Tequila, 750ml', price: 5_400, rating: '4.6' },
      { brand: 'Calma', model: 'London Dry Gin', title: 'Calma London Dry Gin, 750ml', price: 3_600, rating: '4.5' },
    ],
  },
  {
    key: 'wine',
    words: ['wine', 'red wine', 'white wine', 'cabernet', 'pinot', 'chardonnay', 'champagne', 'prosecco', 'sparkling wine'],
    items: [
      { brand: 'Verde', model: 'Cabernet Sauvignon', title: 'Verde Napa Valley Cabernet Sauvignon, 750ml', price: 3_400, rating: '4.6' },
      { brand: 'Wren', model: 'Chardonnay', title: 'Wren Sonoma Coast Chardonnay, 750ml', price: 2_400, rating: '4.5' },
      { brand: 'Lumen', model: 'Brut', title: 'Lumen Brut Champagne, 750ml', price: 5_800, rating: '4.7' },
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
  // Delivered from nearby in about half an hour: restaurants, cafés, a grocer. Made-up places, real-world prices.
  {
    key: 'pizza',
    delivery: 'now',
    words: ['pizza', 'pizzas', 'pepperoni', 'margherita', 'slice'],
    items: [
      { brand: 'Forno Rosso', model: 'Margherita Pizza', title: 'Forno Rosso Margherita Pizza, 14"', price: 1_900, rating: '4.8' },
      { brand: 'Slice Theory', model: 'Pepperoni Pizza', title: 'Slice Theory Pepperoni Pizza, Large', price: 2_200, rating: '4.6' },
      { brand: 'Brick & Basil', model: 'Truffle Mushroom Pizza', title: 'Brick & Basil Truffle Mushroom Pizza', price: 2_400, rating: '4.7' },
    ],
  },
  {
    key: 'burger',
    delivery: 'now',
    words: ['burger', 'burgers', 'cheeseburger', 'cheeseburgers', 'hamburger', 'fries'],
    items: [
      { brand: 'Patty Lane', model: 'Double Cheeseburger', title: 'Patty Lane Double Cheeseburger & Fries', price: 1_700, rating: '4.7' },
      { brand: 'Stack House', model: 'Smash Burger', title: 'Stack House Classic Smash Burger', price: 1_300, rating: '4.6' },
      { brand: 'Greenfield', model: 'Veggie Burger', title: 'Greenfield Avocado Veggie Burger', price: 1_500, rating: '4.5' },
    ],
  },
  {
    key: 'sushi',
    delivery: 'now',
    words: ['sushi', 'sashimi', 'maki', 'nigiri', 'poke', 'poke bowl', 'japanese food'],
    items: [
      { brand: 'Umi Kitchen', model: 'Sushi Platter', title: 'Umi Kitchen Chef’s Sushi Platter, 16 pc', price: 3_400, rating: '4.8' },
      { brand: 'Sora', model: 'Salmon Avocado Roll', title: 'Sora Salmon Avocado Roll, 8 pc', price: 1_600, rating: '4.6' },
      { brand: 'Kai Poke', model: 'Spicy Tuna Poke Bowl', title: 'Kai Poke Spicy Tuna Poke Bowl', price: 1_800, rating: '4.7' },
    ],
  },
  {
    key: 'tacos',
    delivery: 'now',
    words: ['taco', 'tacos', 'burrito', 'burritos', 'quesadilla', 'mexican food', 'mexican'],
    items: [
      { brand: 'Casa Lupe', model: 'Carne Asada Tacos', title: 'Casa Lupe Carne Asada Tacos, 3', price: 1_400, rating: '4.8' },
      { brand: 'Verde Cantina', model: 'Chicken Burrito', title: 'Verde Cantina Chicken Burrito', price: 1_300, rating: '4.6' },
      { brand: 'La Palma', model: 'Al Pastor Tacos', title: 'La Palma Al Pastor Tacos, 3', price: 1_200, rating: '4.7' },
    ],
  },
  {
    key: 'coffee',
    delivery: 'now',
    words: ['coffee', 'coffees', 'latte', 'lattes', 'cappuccino', 'espresso', 'cold brew', 'iced coffee', 'matcha', 'flat white'],
    items: [
      { brand: 'Morning Ritual', model: 'Oat Milk Latte', title: 'Morning Ritual Oat Milk Latte, 16 oz', price: 650, rating: '4.8' },
      { brand: 'Drift Coffee', model: 'Cold Brew', title: 'Drift Coffee Iced Cold Brew, 20 oz', price: 550, rating: '4.7' },
      { brand: 'Leaf & Bean', model: 'Iced Matcha Latte', title: 'Leaf & Bean Iced Matcha Latte', price: 700, rating: '4.6' },
    ],
  },
  {
    key: 'noodles',
    delivery: 'now',
    words: ['ramen', 'noodles', 'noodle', 'pho', 'pad thai', 'thai food', 'thai', 'udon', 'vietnamese food'],
    items: [
      { brand: 'Menya Hoshi', model: 'Tonkotsu Ramen', title: 'Menya Hoshi Tonkotsu Ramen', price: 1_700, rating: '4.8' },
      { brand: 'Saigon Lane', model: 'Beef Pho', title: 'Saigon Lane Beef Pho', price: 1_500, rating: '4.7' },
      { brand: 'Bangkok Street', model: 'Chicken Pad Thai', title: 'Bangkok Street Chicken Pad Thai', price: 1_500, rating: '4.6' },
    ],
  },
  {
    key: 'salad',
    delivery: 'now',
    words: ['salad', 'salads', 'grain bowl', 'caesar'],
    items: [
      { brand: 'Green Theory', model: 'Chicken Caesar', title: 'Green Theory Chicken Caesar Salad', price: 1_400, rating: '4.7' },
      { brand: 'Harvest Bowl', model: 'Salmon Grain Bowl', title: 'Harvest Bowl Salmon Grain Bowl', price: 1_700, rating: '4.6' },
      { brand: 'Root & Leaf', model: 'Mediterranean Salad', title: 'Root & Leaf Mediterranean Salad', price: 1_300, rating: '4.5' },
    ],
  },
  {
    key: 'groceries',
    delivery: 'now',
    words: ['groceries', 'grocery', 'milk', 'eggs', 'bread', 'bananas', 'produce', 'fruit', 'vegetables', 'avocados'],
    items: [
      { brand: 'Corner Market', model: 'Milk & Eggs', title: 'Corner Market Whole Milk & a Dozen Eggs', price: 1_200, rating: '4.7' },
      { brand: 'Fresh Lane', model: 'Grocery Bag', title: 'Fresh Lane Essentials Grocery Bag', price: 3_900, rating: '4.6' },
      { brand: 'Greenleaf Grocer', model: 'Produce Box', title: 'Greenleaf Grocer Seasonal Produce Box', price: 2_900, rating: '4.8' },
    ],
  },
  {
    key: 'takeout',
    delivery: 'now',
    words: ['takeout', 'take out', 'dinner', 'lunch', 'something to eat', 'curry', 'indian food', 'chinese food', 'dumplings'],
    items: [
      { brand: 'Little Lantern', model: 'Chinese Dinner for Two', title: 'Little Lantern Chinese Dinner for Two', price: 3_800, rating: '4.7' },
      { brand: 'Saffron Indian Kitchen', model: 'Chicken Tikka Masala', title: 'Saffron Indian Kitchen Chicken Tikka Masala & Naan', price: 1_900, rating: '4.8' },
      { brand: 'Jade Garden', model: 'Pork Soup Dumplings', title: 'Jade Garden Pork Soup Dumplings, 8 pc', price: 1_400, rating: '4.7' },
    ],
  },
  // Bought like anything else (a one-time card), but each arrives its own way. Their shelves are tailored in special().
  {
    key: 'ride',
    delivery: 'ride',
    words: ['ride', 'rides', 'uber', 'lyft', 'taxi', 'cab', 'car to', 'a car', 'lift to'],
    items: [
      { brand: 'Swift', model: 'Standard', title: 'Swift Standard', price: 2_400, rating: '4.8' },
      { brand: 'Glide', model: 'Comfort', title: 'Glide Comfort', price: 3_100, rating: '4.9' },
      { brand: 'Roam', model: 'XL', title: 'Roam XL', price: 3_800, rating: '4.7' },
    ],
  },
  {
    key: 'tickets',
    delivery: 'email',
    words: ['ticket', 'tickets', 'concert', 'concert tickets', 'show tickets', 'game tickets', 'gig', 'festival', 'theater', 'theatre'],
    items: [
      { brand: 'Orpheum Hall', model: 'General Admission', title: 'Orpheum Hall General Admission', price: 4_800, rating: '4.7' },
      { brand: 'Lantern Room', model: 'Balcony Seats', title: 'Lantern Room Balcony Seats', price: 7_000, rating: '4.8' },
      { brand: 'Pier 9 Stage', model: 'Floor', title: 'Pier 9 Stage Floor', price: 9_000, rating: '4.6' },
    ],
  },
  {
    key: 'movie',
    delivery: 'email',
    words: ['movie', 'movies', 'movie tickets', 'cinema', 'imax'],
    items: [
      { brand: 'Bijou Cinema', model: 'Evening Showing', title: 'Bijou Cinema Evening Showing', price: 1_600, rating: '4.6' },
      { brand: 'Starlight IMAX', model: 'IMAX', title: 'Starlight IMAX', price: 2_400, rating: '4.8' },
      { brand: 'Rialto', model: 'Recliner Seats', title: 'Rialto Recliner Seats', price: 1_900, rating: '4.7' },
    ],
  },
  {
    key: 'table',
    delivery: 'email',
    words: ['reservation', 'reservations', 'table for', 'book a table', 'book dinner', 'dinner reservation', 'restaurant reservation', 'reserve a table'],
    items: [
      { brand: 'Olive & Ash', model: 'Table', title: 'Olive & Ash', price: 2_000, rating: '4.8' },
      { brand: 'Marlowe', model: 'Table', title: 'Marlowe', price: 2_500, rating: '4.7' },
      { brand: 'Sakura Room', model: 'Table', title: 'Sakura Room', price: 2_000, rating: '4.9' },
    ],
  },
  {
    key: 'topup',
    delivery: 'instant',
    words: ['top up', 'top-up', 'topup', 'airtime', 'phone credit', 'mobile credit', 'prepaid credit', 'phone top up', 'load her phone', 'load his phone'],
    items: [{ brand: 'Prepaid', model: 'Top-up', title: 'Prepaid top-up', price: 2_000, rating: '4.9' }, { brand: 'Prepaid', model: 'Top-up', title: 'Prepaid top-up', price: 2_000, rating: '4.9' }, { brand: 'Prepaid', model: 'Top-up', title: 'Prepaid top-up', price: 2_000, rating: '4.9' }],
  },
  {
    key: 'bill',
    delivery: 'bill',
    words: ['bill', 'bills', 'electric bill', 'power bill', 'electricity bill', 'internet bill', 'wifi bill', 'phone bill', 'cell bill', 'water bill', 'gas bill', 'utility bill', 'utilities'],
    items: [{ brand: 'Pacific Power', model: 'Bill', title: 'Pacific Power', price: 8_640, rating: '4.9' }, { brand: 'Pacific Power', model: 'Bill', title: 'Pacific Power', price: 8_640, rating: '4.9' }, { brand: 'Pacific Power', model: 'Bill', title: 'Pacific Power', price: 8_640, rating: '4.9' }],
  },
];

const BRANDS = ['Lumen', 'Halden', 'Oriel', 'Wren', 'Calma', 'Fieldnote', 'Kinetic', 'Verde'];
/** Nearby places, for food made from a request: a restaurant, not a gadget brand. */
const KITCHENS = ['Copper Pot', 'Blue Door Kitchen', 'Night Market', 'Corner Table', 'Little Lantern', 'Saffron House', 'Olive & Ash', 'Jade Garden'];
const GENERIC = 3;
/** A gift card asked for without a value (the model asks first, so this is rare). */
const GIFT_DEFAULT = 25;
const GIFT_WORDS = /\b(e-?gift|gift ?cards?)\b/i;

export type BuyKind = 'physical' | 'gift' | 'digital' | 'topup';
export type Delivery = 'ship' | 'email' | 'now' | 'ride' | 'instant' | 'bill';

/** What someone asked to buy, as the model passed it on. Flow params carry the same fields. */
export interface BuyRequest {
  /** What they want, in a few words. */
  query?: string;
  kind?: BuyKind;
  /** The exact product they named ("AirPods Pro"). */
  product?: string;
  /** The brand or store they named ("Starbucks"). */
  brand?: string;
  /** The most they'll spend, USD. */
  budget?: number;
  /** A gift card's or a phone top-up's value, USD. */
  amount?: number;
  /** The model's estimate of a named product's usual price, USD. */
  typicalPrice?: number;
}

/** A listing as the shelf builds it: an item with its photo. */
interface Listing extends Item {
  image: string;
  detail?: string;
}

const photo = (key: string, i = 1) => `/assets/agents/products/${key}-${i}.webp`;
/** A listed product's own photo where we have one, else its category's. */
const photoOf = (p: NamedProduct) => (NAMED_PHOTOS[p.name] ? `/assets/agents/products/named/${NAMED_PHOTOS[p.name]}.webp` : photo(p.category));
const genericPhoto = (seed: string, i: number) => photo('generic', ((hash(seed) + i) % GENERIC) + 1);

const titleCase = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (w ? w[0].toLocaleUpperCase() + w.slice(1) : w))
    .join(' ');

const domainOf = (brand: string) => `${brand.toLowerCase().replace(/[^a-z]/g, '')}.com`;

/** Lowercase words with spaces at both ends, so a phrase matches only on whole words. */
const words = (s: string) => ` ${s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()} `;

/** USD cents, priced like a listing: under $20 to the dollar, above it ending in 9 ($129, $49). */
function listPrice(usdDollars: number): number {
  const d = Math.max(4, usdDollars);
  return (d < 20 ? Math.round(d) : Math.round(d / 10) * 10 - 1) * 100;
}

/** The category a request means: the one whose word it uses, longest word first ("desk lamp" over "lamp"). */
function categoryFor(query: string): Category | undefined {
  const q = words(query);
  let best: { c: Category; len: number } | undefined;
  for (const c of CATEGORIES) {
    for (const w of c.words) {
      if (q.includes(` ${w} `) && (!best || w.length > best.len)) best = { c, len: w.length };
    }
  }
  if (best) return best.c;
  // Just "food" (not a pet's): something to eat from a restaurant nearby.
  if (/ (food|meal|grub) /.test(q) && !/ (dog|cat|pet|puppy|kitten|baby|bird|fish) /.test(q)) return CATEGORIES.find((c) => c.key === 'takeout');
  return undefined;
}

/** Words a request can carry around a product's name without meaning another product. */
const FILLER = new Set(['a', 'an', 'the', 'new', 'newest', 'latest', 'some', 'pair', 'of', 'my', 'me', 'one', 'brand', 'original', 'set', 'kit', 'something', 'thing', 'stuff', 'from', 'any', 'item', 'product', 'products', 'gadget', 'device',
  // What kind of thing it is, as the model adds to the query ("kindle e-reader", "ps5 gaming console").
  'e', 'reader', 'ereader', 'smartphone', 'gaming', 'video', 'game', 'wireless', 'bluetooth', 'smart', 'portable', 'electric']);
const LISTED_BRANDS = NAMED_PRODUCTS.map((p) => p.brand).filter((b, i, all) => all.indexOf(b) === i);

/** Whether our checked list has this brand's products. */
export const listsBrand = (brand: string) => LISTED_BRANDS.some((b) => words(b) === words(brand));

/** A brand on our list that a request names without the model saying so ("a lego set"). */
const brandIn = (q: string) => LISTED_BRANDS.filter((b) => words(q).includes(words(b))).sort((a, b) => b.length - a.length)[0];
const CATEGORY_WORDS = new Set(CATEGORIES.flatMap((c) => c.words.flatMap((w) => [...w.split(' '), ...w.split(' ').map((x) => x.replace(/(\w{3,})s$/, '$1'))])));
/** `words`, each in the singular, so "iphones" finds "iphone" and "airpods" still finds "airpods". */
const singular = (s: string) => words(s).replace(/(\w{3,})s /g, '$1 ');
const vocabulary = new Map(NAMED_PRODUCTS.map((p) => [p, new Set([p.brand, p.model, p.name, ...p.aliases].flatMap((s) => [...words(s).trim().split(' '), ...singular(s).trim().split(' ')]))]));

/**
 * The named product a phrase means: the alias it contains with the most words, then the longest ("galaxy z fold"
 * over "samsung galaxy"). Every other word has to be that product's too, or filler: "airpods max" isn't AirPods 4.
 * The words as they said them first ("airtags" is the 4-pack), then in the singular ("2 iphones").
 */
function namedIn(text?: string): NamedProduct | undefined {
  return text ? (matchIn(text, words) ?? matchIn(text, singular)) : undefined;
}

function matchIn(text: string, normal: (s: string) => string): NamedProduct | undefined {
  const t = normal(text);
  let best: { p: NamedProduct; count: number; len: number } | undefined;
  for (const p of NAMED_PRODUCTS) {
    const own = vocabulary.get(p)!;
    for (const a of [...p.aliases, p.model, p.name]) {
      const w = normal(a);
      if (!w.trim() || !t.includes(w)) continue;
      const rest = t.replace(w, ' ').trim().split(' ').filter(Boolean);
      // A count up front is how many, not which: "2 iphones" is an iPhone.
      const others = t.startsWith(` ${rest[0]} `) && /^\d{1,3}$/.test(rest[0] ?? '') ? rest.slice(1) : rest;
      if (!others.every((x) => own.has(x) || FILLER.has(x) || CATEGORY_WORDS.has(x))) continue;
      const count = w.trim().split(' ').length;
      if (!best || count > best.count || (count === best.count && w.length > best.len)) best = { p, count, len: w.length };
    }
  }
  return best?.p;
}

/** The product on our checked list a request names, by the product, the query, or the brand with the query. */
export function listedFor(r: BuyRequest): NamedProduct | undefined {
  return namedIn(r.product) ?? namedIn(r.query) ?? (r.brand ? namedIn(`${r.brand} ${r.query ?? ''}`) : undefined);
}

/** The gift card a request means: by the brand they named, else one whose name it contains; any brand's falls back to Visa's. */
function giftCardFor(r: BuyRequest): GiftCard | undefined {
  const said = `${r.query ?? ''} ${r.product ?? ''}`;
  if (r.kind !== 'gift' && !GIFT_WORDS.test(said)) return undefined;
  const brand = r.brand ? words(r.brand) : '';
  const t = words(`${said} ${r.brand ?? ''}`);
  return (
    GIFT_CARDS.find((g) => brand && words(g.brand) === brand) ??
    GIFT_CARDS.find((g) => [g.brand, ...g.aliases].some((a) => t.includes(words(a)))) ??
    GIFT_CARDS.find((g) => g.brand === 'Visa')
  );
}

/** `count` made from what they asked for, each from a different house brand, around `typical` and inside `budget` (USD). */
function generated(name: string, count: number, typical?: number, budget?: number, skip: string[] = [], houses = BRANDS): Listing[] {
  const h = hash(name);
  const base = typical ?? 15 + (h % 120);
  // One alone is the usual price; three spread around it.
  const tiers = (count === 1 ? [1] : [1.2, 1, 0.8]).map((t) => t * base);
  const fit = budget ? Math.min(1, budget / tiers[0]) : 1;
  const cap = budget ? Math.floor(budget) * 100 : Infinity;
  const brands = houses.filter((b) => !skip.includes(b));
  return tiers.slice(0, count).map((t, i) => {
    const brand = brands[(h + i * 3) % brands.length];
    return { brand, model: name, title: `${brand} ${name}`, price: Math.min(listPrice(t * fit), cap), rating: ['4.6', '4.4', '4.2'][i], image: genericPhoto(name, i) };
  });
}

/** How many of a request's words an item's title shares. */
const shared = (text: string, title: string) => singular(text).trim().split(' ').filter((w) => singular(title).includes(` ${w} `)).length;

/** The category item (and so photo) nearest a request: a tequila looks like the tequila, not the bourbon. */
const closest = (c: Category, text: string) => c.items.reduce((best, it, i) => (shared(text, it.title) > shared(text, c.items[best].title) ? i : best), 0);

/** Common gifts, for a present or "you choose": something real to show, never a made-up "Birthday Present". */
const GIFT_IDEAS = ['plant-pot', 'speaker', 'headphones', 'water-bottle', 'sunglasses', 'desk-lamp', 'coffee-maker', 'backpack'];
const VAGUE = /\b(present|gift|something|anything|whatever|item|stuff|surprise|things?)\b/i;

/** A vague request ("a birthday present for my mom", "whatever, spend $100") becomes one of the gift ideas that fits the budget. */
function ideaFor(query: string, budget?: number): Category | undefined {
  if (!VAGUE.test(query) || categoryFor(query)) return undefined;
  const cap = budget ? budget * 100 : Infinity;
  const fits = GIFT_IDEAS.map((k) => CATEGORIES.find((c) => c.key === k)!).filter((c) => c.items.some((it) => it.price <= cap));
  return fits.length ? fits[hash(query) % fits.length] : undefined;
}

/** Up to three for a request: a category's (inside the budget), topped up with ones made from the request. */
function choices(query: string, typical?: number, budget?: number, first: Listing[] = []): Listing[] {
  const c = categoryFor(query);
  const cap = budget ? budget * 100 : Infinity;
  // The ones that say what they asked for lead: "champagne" picks the champagne, not the cabernet.
  const fromCategory = c
    ? c.items
        .map((it, i) => ({ ...it, image: photo(c.key, i + 1) }))
        .filter((it) => it.price <= cap)
        .sort((a, b) => shared(query, b.title) - shared(query, a.title))
    : [];
  const picked = [...first, ...fromCategory.filter((it) => !first.some((f) => f.brand === it.brand))].slice(0, 3);
  if (picked.length >= 3) return picked;
  const name = titleCase(query.replace(/^(a|an|some|new|the)\s+/i, ''));
  const made = generated(name, 3 - picked.length, typical, budget, picked.map((p) => p.brand), c?.delivery === 'now' ? KITCHENS : BRANDS);
  // Made for a category we know, they look the part: headphones under $50 still show headphones.
  return [...picked, ...(c ? made.map((it, i) => ({ ...it, image: photo(c.key, ((picked.length + i) % 3) + 1) })) : made)];
}

export interface Shelf {
  query: string;
  /** What the carousel shows, the first one picked. */
  options: Product[];
  /** The one the agent buys. */
  pick: { brand: string; model: string; item: string; amount: number; image: string };
  /** The person named this one (a product, a gift card, the ring light they saved): the agent buys it without asking which. */
  named?: boolean;
  /** How it arrives: shipped, by email (gift cards, downloads), or brought over within the hour (food, groceries). */
  delivery: Delivery;
  /** The most they said they'd spend (USD cents), when the one they named costs more. */
  over?: number;
  /** The gift card value they asked for (USD cents), when the card doesn't come in it. */
  asked?: number;
  /** What the checkout and the lines say about how it arrives: a ride's destination, a table's time, a bill's due date. */
  details?: Params;
}

function shelfOf(query: string, listings: Listing[], extra: Partial<Shelf> = {}): Shelf {
  const options = listings.map((it, i) => ({
    title: it.title,
    model: it.model,
    merchant: it.brand,
    domain: domainOf(it.brand),
    price: usd2(it.price),
    rating: it.rating,
    ...(it.detail && { detail: it.detail }),
    image: it.image,
    ...(i === 0 && { pick: true }),
  }));
  const first = listings[0];
  return { query, options, pick: { brand: first.brand, model: first.model, item: first.title, amount: first.price, image: first.image }, delivery: 'ship', ...extra };
}

const NUMBERS: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, pair: 2, couple: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };

/** How many a request asks for ("two tickets", "a table for 4"), from the words after `before` if given. */
function countIn(q: string, before?: RegExp): number | undefined {
  const m = (before ? q.match(before) : null) ?? q.match(/\b(\d{1,2}|a|an|one|two|pair|couple|three|four|five|six|seven|eight)\b(?= (?:of )?(?:[a-z]+ )?(?:tickets?|seats?|people|of us|guests?)\b)/i);
  if (!m) return undefined;
  const n = /^\d+$/.test(m[1]) ? Number(m[1]) : NUMBERS[m[1].toLowerCase()];
  return n && n >= 1 && n <= 12 ? n : undefined;
}

/** "at 8", "8:30pm", "at 7 pm": the time as a reservation reads it ("8:00 PM"); dinner hours are evening. */
function timeIn(q: string): string | undefined {
  const all = Array.from(q.matchAll(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b(?!\s*(?:people|guests|tickets|of us|pc))/gi));
  const m = all.find((x) => /\bat\b|am|pm|:/i.test(x[0]));
  if (!m) return undefined;
  const hour = Number(m[1]);
  if (hour < 1 || hour > 12) return undefined;
  return `${hour}:${m[2] ?? '00'} ${m[3] ? m[3].toUpperCase() : hour < 11 ? 'PM' : 'AM'}`;
}

/** Where a ride goes, as they said it: "to the airport" is the Airport. */
const destinationIn = (q: string) => {
  const m = q.match(/\bto ([a-z0-9][a-z0-9 '’&.-]*)$/i) ?? q.match(/\b(home|work)\b/i);
  const to = m?.[1].trim();
  // "to airport" reads as "the airport".
  return to && /^(airport|office|station|train station|gym|mall|beach|hospital|hotel|stadium|venue|restaurant)$/i.test(to) ? `the ${to}` : to;
};

/** A carrier for prepaid top-ups in each country we pay (made-up where it doesn't matter, the big local one where it does). */
const CARRIERS: Record<string, { carrier: string; dial: string }> = {
  mx: { carrier: 'Telcel', dial: '+52 55' },
  ph: { carrier: 'Globe', dial: '+63 917' },
  in: { carrier: 'Airtel', dial: '+91 98' },
  ng: { carrier: 'MTN', dial: '+234 803' },
  br: { carrier: 'Claro', dial: '+55 11' },
  co: { carrier: 'Claro', dial: '+57 310' },
  gt: { carrier: 'Tigo', dial: '+502 5' },
  sv: { carrier: 'Tigo', dial: '+503 7' },
  hn: { carrier: 'Tigo', dial: '+504 9' },
  do: { carrier: 'Claro', dial: '+1 809' },
  ke: { carrier: 'Safaricom', dial: '+254 712' },
  gh: { carrier: 'MTN', dial: '+233 24' },
  pe: { carrier: 'Claro', dial: '+51 9' },
  vn: { carrier: 'Viettel', dial: '+84 98' },
  pk: { carrier: 'Jazz', dial: '+92 300' },
  bd: { carrier: 'Grameenphone', dial: '+880 17' },
  us: { carrier: 'T-Mobile', dial: '+1 415' },
};

/** Which bill: the biller, its usual amount (USD cents) and its photo. */
const BILLS: { words: RegExp; biller: string; what: string; amount: number; photo: number }[] = [
  { words: /internet|wifi|wi-fi|broadband|fiber/i, biller: 'Wavelink Fiber', what: 'internet', amount: 7_000, photo: 2 },
  { words: /phone|mobile|cell|wireless/i, biller: 'Northstar Mobile', what: 'phone', amount: 4_500, photo: 3 },
  { words: /water/i, biller: 'City Water', what: 'water', amount: 3_820, photo: 4 },
  { words: /gas/i, biller: 'Bay Gas & Heat', what: 'gas', amount: 5_210, photo: 1 },
  { words: /./, biller: 'Pacific Power', what: 'electric', amount: 8_640, photo: 1 },
];

const tailoredFor = (query: string, r: BuyRequest) => {
  const c = categoryFor(r.product ?? '') ?? categoryFor(query);
  return c?.delivery && c.delivery !== 'now' ? c : undefined;
};

/** A ride, tickets, a table, a top-up or a bill: priced here, so nothing to look up. */
export const isTailored = (r: BuyRequest) => r.kind === 'topup' || !!tailoredFor(r.query ?? '', r);

const shortDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/**
 * Things bought with a one-time card that aren't products on a shelf: a ride (priced for where it's going), tickets
 * and a table (for how many, and when), a phone top-up (in the country it's for), a bill (the one that's due).
 */
const RIDE_ETAS = ['4 min', '7 min', '9 min'];

function special(query: string, r: BuyRequest): Shelf | undefined {
  const c = tailoredFor(query, r);
  if (!c) return undefined;
  const q = ` ${query} ${r.product ?? ''} `;
  const brand = r.brand ? titleCase(r.brand) : undefined;
  if (c.key === 'ride') {
    const to = destinationIn(query);
    const fare = 0.8 + (hash(to ?? query) % 50) / 100;
    // How far away each is stands in for its stars, as a ride app shows it.
    const items = c.items.map(({ rating: _, ...it }, i) => ({ ...it, price: Math.round((it.price * fare) / 100) * 100, image: photo('ride', i + 1), detail: `${RIDE_ETAS[i]} away` }));
    const listings = brand ? [{ ...items[0], brand, title: `${brand} ${items[0].model}` }] : items;
    return shelfOf(query, listings, { delivery: 'ride', named: !!brand, details: { ...(to && { to }), eta: RIDE_ETAS[0] } });
  }
  if (c.key === 'tickets' || c.key === 'movie') {
    const count = countIn(q) ?? 2;
    const items = c.items.map((it, i) => ({
      ...it,
      model: `${it.model}, ${count} ${count === 1 ? 'ticket' : 'tickets'}`,
      title: `${brand ? `${brand} · ` : ''}${it.title}, ${count} ${count === 1 ? 'ticket' : 'tickets'}`,
      price: it.price * count,
      image: photo(c.key, c.key === 'movie' ? 1 : i + 1),
    }));
    return shelfOf(query, items, { delivery: 'email', details: { tickets: count } });
  }
  if (c.key === 'table') {
    const party = countIn(q, /\bfor (\d{1,2}|two|three|four|five|six|seven|eight)\b/i) ?? 2;
    const time = timeIn(q) ?? '7:30 PM';
    const items = c.items.map((it, i) => ({
      ...it,
      ...(brand && i === 0 && { brand, title: brand }),
      model: `table for ${party} at ${time}`,
      title: `${brand && i === 0 ? brand : it.title}, table for ${party} at ${time}`,
      price: 1_000 * party,
      image: photo('table', i + 1),
    }));
    return shelfOf(query, brand ? items.slice(0, 1) : items, { delivery: 'email', named: !!brand, details: { table: party, time } });
  }
  if (c.key === 'topup') {
    const country = BANK_COUNTRIES.find((b) => words(q).includes(words(b.name))) ?? BANK_COUNTRIES.find((b) => b.code === 'us')!;
    const { carrier, dial } = CARRIERS[country.code] ?? { carrier: 'Prepaid', dial: '+1' };
    const usd = Math.min(200, Math.max(5, r.amount ?? r.budget ?? 20));
    const abroad = country.code !== 'us';
    const local = formatMoney(Math.round(usd * 100 * country.usdToLocal), currencyFor(country));
    const name = brand ?? carrier;
    const item = { brand: name, model: abroad ? `top-up, ${local}` : 'top-up', title: `${name} top-up${abroad ? `, ${local}` : ''}`, price: usd * 100, image: photo('topup') };
    return shelfOf(query, [item], {
      delivery: 'instant',
      named: true,
      details: { phone: `${dial} •••• ${String(4821 + (hash(country.code) % 4000)).slice(0, 4)}`, ...(abroad && { local }), country: country.name },
    });
  }
  const bill = BILLS.find((b) => b.words.test(q))!;
  const biller = brand ?? bill.biller;
  const amount = r.amount ? Math.round(r.amount * 100) : r.budget ? Math.round(r.budget * 100) : bill.amount;
  const month = new Date(Date.now() - 20 * 86_400_000).toLocaleDateString('en-US', { month: 'long' });
  return shelfOf(query, [{ brand: biller, model: `${month} bill`, title: `${biller}, ${month} ${bill.what} bill`, price: amount, image: photo('bill', bill.photo) }], {
    delivery: 'bill',
    named: true,
    details: { account: `•••• ${String(2231 + (hash(biller) % 7000)).slice(0, 4)}`, due: shortDate(new Date(Date.now() + 7 * 86_400_000)), what: bill.what },
  });
}

/**
 * What a request finds. The tile's ring light keeps its real listing. A gift card is exactly the value asked for,
 * by email. A product they named (on our checked list, or priced from the model's estimate) is the one thing it
 * buys. A brand they named lines up that brand's. Anything else is a category's three, or three made from the
 * request, all inside their budget.
 */
export function shelfFor(request: BuyRequest = {}): Shelf {
  const giftOnly = request.kind === 'gift' && request.brand ? `${request.brand} gift card` : '';
  const q = request.query?.trim() || giftOnly || request.brand?.trim() || '';
  const budget = request.budget;
  if ((!q && !request.product) || /ring ?light/i.test(q)) {
    return {
      query: q || 'ring light',
      options: BUY_OPTIONS,
      pick: { brand: RING_LIGHT.merchant, model: 'RP10-H', item: RING_LIGHT.item, amount: RING_LIGHT.amount, image: RING_LIGHT.image },
      named: true,
      delivery: 'ship',
    };
  }
  const query = q || request.product || '';

  const gift = giftCardFor(request);
  if (gift) {
    const asked = request.amount ?? budget ?? GIFT_DEFAULT;
    const value = Math.min(gift.max, Math.max(gift.min, asked));
    const model = /e-?gift/i.test(gift.name) ? 'eGift Card' : 'Gift Card';
    return shelfOf(query, [{ brand: gift.brand, model, title: gift.name, price: Math.round(value * 100), rating: '4.9', image: photo('gift-card') }], {
      named: true,
      delivery: 'email',
      ...(value !== asked && { asked: Math.round(asked * 100) }),
    });
  }

  const tailored = special(query, request);
  if (tailored) return tailored;

  const digital = request.kind === 'digital';
  const delivery: Delivery = digital ? 'email' : (categoryFor(request.product ?? '') ?? categoryFor(q))?.delivery === 'now' ? 'now' : 'ship';
  const listed = listedFor({ ...request, query: q });
  if (listed) {
    const price = Math.round(listed.price * 100);
    return shelfOf(query, [{ brand: listed.brand, model: listed.model, title: listed.name, price, rating: '4.8', image: photoOf(listed) }], {
      named: true,
      delivery,
      ...(budget && price > budget * 100 && { over: budget * 100 }),
    });
  }

  if (request.product) {
    // A product that's only its maker's name ("buffalo trace") takes what kind it is from the query ("bourbon").
    const kindOf = request.brand ? titleCase(words(q).replace(words(request.brand), ' ').replace(/\s+/g, ' ')) : '';
    const bare = !!request.brand && words(request.product) === words(request.brand) && !!kindOf;
    // Written by its maker ("iPhone Duo") it stays that way; typed all lowercase it's title-cased.
    const cased = /[A-Z]/.test(request.product) ? request.product.trim() : titleCase(request.product);
    const product = bare ? `${cased} ${kindOf}` : cased;
    const brand = request.brand ? titleCase(request.brand) : product.split(' ')[0];
    const title = words(product).startsWith(words(brand)) ? product : `${brand} ${product}`;
    const c = categoryFor(request.product) ?? categoryFor(q);
    const price = request.typicalPrice ? Math.round(request.typicalPrice * 100) : (c?.items[0].price ?? generated(product, 1)[0].price);
    const image = c ? photo(c.key, closest(c, `${q} ${product}`) + 1) : genericPhoto(product, 0);
    return shelfOf(query, [{ brand, model: title.toLowerCase().startsWith(`${brand.toLowerCase()} `) ? title.slice(brand.length + 1) : title, title, price, rating: '4.7', image }], {
      named: true,
      delivery,
      ...(budget && price > budget * 100 && { over: budget * 100 }),
    });
  }

  const brandSaid = request.brand ?? brandIn(q);
  if (brandSaid) {
    const brand = words(brandSaid);
    const cap = budget ? budget * 100 : Infinity;
    // What they asked for beyond the brand ("fleece" in "patagonia fleece"); nothing means anything of theirs.
    const wanted = words(q).replace(brand, ' ').trim().split(' ').filter((w) => w && !FILLER.has(w) && !brand.includes(` ${w} `));
    const category = categoryFor(q);
    const theirs = NAMED_PRODUCTS.filter((p) => words(p.brand) === brand && p.price * 100 <= cap)
      .filter((p) => !wanted.length || p.category === category?.key || wanted.some((w) => vocabulary.get(p)!.has(w)))
      .map((p) => ({ brand: p.brand, model: p.model, title: p.name, price: Math.round(p.price * 100), rating: '4.7', image: photoOf(p) }))
      // The pick is the one nearest what it usually costs, else the most affordable: "a lego set" isn't the $850 Falcon.
      .sort((a, b) => (request.typicalPrice ? Math.abs(a.price - request.typicalPrice * 100) - Math.abs(b.price - request.typicalPrice * 100) : a.price - b.price))
      .slice(0, 3);
    if (theirs.length) return shelfOf(query, choices(q, request.typicalPrice, budget, theirs), { delivery });
    if (request.brand) {
      const name = titleCase(q.replace(new RegExp(`\\b${request.brand}\\b`, 'i'), '').trim() || q);
      const own = titleCase(request.brand);
      const made = generated(name, 1, request.typicalPrice ?? (category && category.items[0].price / 100), budget)[0];
      return shelfOf(query, [{ ...made, brand: own, title: `${own} ${name}`, ...(category && { image: photo(category.key) }) }], { named: true, delivery });
    }
  }

  const idea = ideaFor(q, budget);
  return shelfOf(query, choices(idea ? idea.words[0] : q, idea ? undefined : request.typicalPrice, budget), { delivery: idea ? 'ship' : delivery });
}

const REQUEST_TEXT = ['query', 'kind', 'product', 'brand'] as const;
const REQUEST_NUMBERS = ['budget', 'typicalPrice'] as const;

/** A request as a line's params, so the products card finds the same shelf again. A value is a gift card's only. */
export function requestParams(r: BuyRequest = {}): Params {
  const out: Params = {};
  for (const k of REQUEST_TEXT) if (r[k]) out[k] = r[k];
  for (const k of REQUEST_NUMBERS) if (r[k]) out[k] = r[k];
  if ((r.kind === 'gift' || r.kind === 'topup') && r.amount) out.amount = r.amount;
  return out;
}

/** The request back from a line's params. */
export function requestOf(p: Params = {}): BuyRequest {
  const str = (k: string) => (typeof p[k] === 'string' && p[k] ? (p[k] as string) : undefined);
  const num = (k: string) => (typeof p[k] === 'number' && (p[k] as number) > 0 ? (p[k] as number) : undefined);
  const kind = str('kind');
  return {
    query: str('query'),
    kind: kind === 'gift' || kind === 'digital' || kind === 'physical' || kind === 'topup' ? kind : undefined,
    product: str('product'),
    brand: str('brand'),
    budget: num('budget'),
    amount: num('amount'),
    typicalPrice: num('typicalPrice'),
  };
}

/** The shelf with another of its options picked, the one the person chose. */
export function shelfWith(shelf: Shelf, i: number): Shelf {
  const o = shelf.options[i];
  if (!o || i === 0) return shelf;
  const amount = Math.round(Number(o.price.replace(/[^0-9.]/g, '')) * 100);
  const eta = shelf.delivery === 'ride' && o.detail?.replace(/ away$/, '');
  return {
    ...shelf,
    pick: { brand: o.merchant, model: o.title.replace(new RegExp(`^${o.merchant}\\s+`), ''), item: o.title, amount, image: o.image },
    ...(eta && { details: { ...shelf.details, eta } }),
  };
}

/** What the agent asks Grid to buy, and what the lines and cards read. */
export function purchaseFor(shelf: Shelf): Purchase {
  const p = shelf.pick;
  const how = {
    ship: 'standard shipping',
    email: 'delivered by email',
    now: 'delivered in about 30 minutes',
    ride: 'pickup in a few minutes',
    instant: 'credited instantly',
    bill: 'bill payment',
  }[shelf.delivery];
  return { merchant: p.brand, description: `${p.item}, ${how}`, amount: p.amount };
}

export function shelfParams(shelf: Shelf) {
  const p = shelf.pick;
  return {
    query: shelf.query,
    merchant: p.brand,
    model: p.model,
    item: p.item,
    amount: p.amount,
    image: p.image,
    ...(shelf.delivery === 'email' && { email: 1 }),
    ...(shelf.delivery === 'now' && { now: 1 }),
    delivery: shelf.delivery,
    ...shelf.details,
    ...(shelf.over && { over: shelf.over }),
    ...(shelf.asked && { asked: shelf.asked }),
  };
}
