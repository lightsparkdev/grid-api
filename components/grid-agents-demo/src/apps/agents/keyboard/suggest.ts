// QuickType's three slots (Pat's Dot capture, IMG_1807: “Hi” | His | Hit): the word as typed in quotes,
// then two completions. A small vocabulary covers what the scripted people type
// (data/agentScripts.ts).
const WORDS = [
  'a', 'about', 'account', 'acres', 'add', 'after', 'again', 'airport', 'all', 'alma', 'almeida', 'also', 'am',
  'and', 'any', 'anything', 'are', 'as', 'asking', 'at', 'b-roll', 'back', 'base', 'be', 'beans', 'big', 'boat',
  'book', 'booked', 'bring', 'bringing', 'but', 'buy', 'by', 'call', 'can', 'cap', 'car', 'card', 'cars', 'cart',
  'chicago', 'clients', 'coffee', 'coinbase', 'collect', 'concert', 'costa', 'could', 'da', 'day', 'de', 'did',
  'diego', 'dinner', 'do', 'domain', 'done', 'edit', 'farm', 'for', 'four', 'frameway', 'friday', 'from', 'fund',
  'get', 'go', 'got', 'grab', 'green', 'had', 'handle', 'have', 'he', 'headphones', 'help', 'her', 'here', 'hi',
  'his', 'hit', 'hold', 'hotel', 'how', 'i', 'if', 'illustrations', 'in', 'instinct', 'into', 'invoice', 'invoices',
  'is', 'it', 'its', 'just', 'keep', 'kitchen', 'know', 'last', 'light', 'like', 'liked', 'line', 'lisbon', 'lock',
  'make', 'mariana', 'marta', 'me', 'mercado', 'metro', 'mom', 'money', 'more', 'move', 'my', 'nair', 'nata', 'need',
  'nice', 'no', 'not', 'now', 'of', 'ok', 'on', 'one', 'or', 'order', 'our', 'out', 'over', 'own', 'pack', 'paid',
  'past', 'pay', 'payments', 'people', 'perfect', 'photo', 'please', 'pop-up', 'porkbun', 'portfolio', 'prints',
  'printwell', 'priya', 'produce', 'product', 'put', 'remind', 'renew', 'reorder', 'restaurants', 'ribeira', 'ring',
  'rua', 'ruiz', 's three slots (Pat', 'saturday', 'saved', 'see', 'send', 'set', 'settle', 'she', 'shoot', 'silva',
  'so', 'sofia', 'space', 'spend', 'split', 'stock', 'strike', 'stuff', 'supplies', 'taberna', 'table', 'th',
  'thank', 'thanks', 'that', 'the', 'them', 'then', 'there', 'they', 'things', 'this', 'tickets', 'time', 'to',
  'too', 'top', 'tour', 'trams', 'treasury', 'trip', 'under', 'up', 'us', 'usdc', 'wallet', 'want', 'was', 'we',
  'week', 'what', 'when', 'where', 'who', 'will', 'with', 'without', 'yes', 'yesterday', 'yet', 'you', 'your',
  'yourself',
];

const STARTERS: [string, string, string] = ['I', 'The', 'I’m'];

const caseLike = (word: string, typed: string) => (typed[0] === typed[0]?.toUpperCase() ? word[0].toUpperCase() + word.slice(1) : word);

export function suggestionsFor(draft: string): [string, string, string] {
  const typed = draft.split(/\s+/).pop() ?? '';
  if (!typed) return STARTERS;
  const lower = typed.toLowerCase();
  const matches = WORDS.filter((w) => w.startsWith(lower) && w !== lower);
  // Too few completions: iOS widens to words sharing the first letter, then common words.
  const near = WORDS.filter((w) => w[0] === lower[0] && w !== lower && !matches.includes(w));
  const fill = [...matches, ...near, 'the', 'and'];
  return [`“${typed}”`, caseLike(fill[0], typed), caseLike(fill[1], typed)];
}
