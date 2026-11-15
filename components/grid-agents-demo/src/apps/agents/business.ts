/* The business account's story: the company the visitor runs (Acme Studio unless they name it), the people they add
   to its team, the clients it invoices, the vendor it pays, and the contractor abroad it pays. Grid holds the money and
   moves it; the invoices are the app's own records, matched to the payments Grid receives. */

/** Someone on the team. `actingFor` is the platform's own id for them, which their agent and their cards carry. */
export interface TeamMember {
  name: string;
  first: string;
  role: string;
  actingFor: string;
  email: string;
  phone: string;
  /** Their monthly pay, what each payroll pays them, USD cents. */
  pay: number;
  /** The bank account payroll pays, as the app shows it. */
  bank: { name: string; last4: string };
}

/** Who Add a teammate suggests, in order, until the visitor types their own: a name, a role and their pay. */
export const SUGGESTED_TEAM: { name: string; role: string; pay: number }[] = [
  { name: 'Maya Chen', role: 'Design', pay: 500_000 },
  { name: 'Jordan Park', role: 'Operations', pay: 450_000 },
  { name: 'Sam Rivera', role: 'Engineering', pay: 750_000 },
  { name: 'Ava Brooks', role: 'Sales', pay: 400_000 },
];

/** The roles Add a teammate offers. */
export const ROLES = ['Design', 'Operations', 'Engineering', 'Sales'];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

/** A teammate as the platform knows them, from what the owner said and the bank they added. */
export function newMember(name: string, role: string, pay: number, bank: TeamMember['bank'], company: string): TeamMember {
  const first = name.split(' ')[0];
  const digits = name.split('').reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 10_000_000, 7);
  return {
    name,
    first,
    role,
    actingFor: `member_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    email: `${slug(first)}@${slug(company)}.co`,
    phone: `+1415555${String(digits).padStart(7, '0').slice(-4)}`,
    pay,
    bank,
  };
}

/** Someone on `team` by their name or first name. */
export const memberOf = (team: readonly TeamMember[], name?: string): TeamMember | undefined => {
  const q = name?.trim().toLowerCase();
  if (!q) return undefined;
  return team.find((m) => m.name.toLowerCase() === q || m.first.toLowerCase() === q.split(' ')[0]);
};

/** The first suggestion that isn't on the team yet. */
export const nextSuggestion = (team: readonly TeamMember[]) => SUGGESTED_TEAM.find((m) => !memberOf(team, m.name)) ?? SUGGESTED_TEAM[0];

/** The team's shared budget the Team budget tile sets up, USD cents a month. */
export const TEAM_BUDGET = 500_000;

/** The owner's own id on the platform, which their agent acts for. */
export const OWNER_ACTING_FOR = 'member_owner';

/** Where the company is: what its account and its cardholders' addresses say. */
export const COMPANY_ADDRESS = { line1: '1450 2nd St', line2: 'Suite 200', city: 'Santa Monica', state: 'CA', postalCode: '90401', country: 'US' };

/** The company's US bank details, from its account's funding instructions. */
export const COMPANY_BANK = { bankName: 'Lead Bank', routingNumber: '101019644', accountNumber: '211874036255', last4: '6255' };

/** An invoice the app sent: the app keeps it, Grid only sees the payment that settles it. */
export interface Invoice {
  number: string;
  client: string;
  /** USD cents. */
  amount: number;
  memo: string;
  /** When it's due, as the app shows it. */
  due: string;
  status: 'OPEN' | 'PAID';
}

const shortDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const inDays = (days: number) => shortDate(new Date(Date.now() + days * 86_400_000));

/** The invoice the Send invoice tile sends. */
export const STORY_INVOICE = { client: 'Northwind Coffee', amount: 240_000, memo: 'Brand refresh' };

/** Invoices the app had already sent before this visit: one still open, so tracking has something to chase. */
export const OPEN_INVOICES = (): Invoice[] => [{ number: 'INV-1038', client: 'Bluebird Bakery', amount: 85_000, memo: 'Menu design', due: inDays(3), status: 'OPEN' }];

/** The bill that came in, which the Pay a bill tile pays to the vendor's US bank account. Dollars. */
export const STORY_BILL = { name: 'Wavelink Fiber', amount: 189, note: 'the internet bill', what: 'internet', number: 'WF-20418', dueIn: 5 };

/** The contractor Pay a contractor suggests: abroad, paid to her own bank in her own currency. Dollars. */
export const STORY_CONTRACTOR = { name: 'Priya Shah', country: 'in', amount: 800, note: 'the illustrations' };

/** Where a contractor typed in might bank, as Pay a contractor offers them. */
export const CONTRACTOR_COUNTRIES = ['in', 'mx', 'ph', 'gb', 'br', 'us'];

/** What one payroll costs: everyone on the team, USD cents. */
export const payrollTotal = (team: readonly TeamMember[]) => team.reduce((sum, m) => sum + m.pay, 0);
