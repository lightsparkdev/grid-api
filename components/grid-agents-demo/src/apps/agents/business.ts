/* The business account's story: the company the visitor runs (Acme Studio unless they name it), the two people on its
   team, the clients it invoices, the vendor it pays, and the contractor it pays from a link. Grid holds the money and
   moves it; the invoices are the app's own records, matched to the payments Grid receives. */

/** Someone on the team. `actingFor` is the platform's own id for them, which their agent and their cards carry. */
export interface TeamMember {
  name: string;
  first: string;
  role: string;
  actingFor: string;
  email: string;
  phone: string;
  /** What each payroll pays them, USD cents. */
  pay: number;
  /** The bank account payroll pays, as the app shows it. */
  bank: { name: string; last4: string };
}

export const TEAM: TeamMember[] = [
  {
    name: 'Maya Chen',
    first: 'Maya',
    role: 'Design',
    actingFor: 'member_maya_chen',
    email: 'maya@acmestudio.co',
    phone: '+14155550187',
    pay: 320_000,
    bank: { name: 'Chase', last4: '4417' },
  },
  {
    name: 'Jordan Park',
    first: 'Jordan',
    role: 'Operations',
    actingFor: 'member_jordan_park',
    email: 'jordan@acmestudio.co',
    phone: '+14155550163',
    pay: 280_000,
    bank: { name: 'Wells Fargo', last4: '9032' },
  },
];

export const teamMember = (name?: string): TeamMember | undefined => {
  const q = name?.trim().toLowerCase();
  if (!q) return undefined;
  return TEAM.find((m) => m.name.toLowerCase() === q || m.first.toLowerCase() === q.split(' ')[0]);
};

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

/** The bill the Pay a bill tile pays, to a vendor's US bank account. */
export const STORY_BILL = { name: 'Wavelink Fiber', amount: 189, note: 'the internet bill' };

/** The contractor the Pay a contractor tile pays: no Grid account, so they claim it from a link. */
export const STORY_CONTRACTOR = { name: 'Priya Shah', email: 'priya@shahstudio.co', country: 'US', amount: 80_000, note: 'Illustrations' };

/** What one payroll costs: everyone on the team, USD cents. */
export const payrollTotal = () => TEAM.reduce((sum, m) => sum + m.pay, 0);
