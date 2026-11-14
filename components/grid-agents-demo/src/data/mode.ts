/** Which account the playground is showing: the person's own, or a business they run. Each has its own agent,
 *  conversation, API log and tiles; switching between them keeps both where they were. */
export type Mode = 'personal' | 'business';

export const MODES: Mode[] = ['personal', 'business'];

/** `?mode=business` opens on the business account. */
export function modeFor(search: string): Mode | undefined {
  const mode = new URLSearchParams(search).get('mode')?.trim().toLowerCase();
  return mode === 'business' || mode === 'personal' ? mode : undefined;
}

/**
 * The account the stores a flow reads from belong to (saved recipients, the linked bank). Set by the page whenever it
 * shows a mode, so a flow running in that mode reads that account's own.
 */
let current: Mode = 'personal';
export const activeMode = () => current;
export function setActiveMode(mode: Mode) {
  current = mode;
}

/** The business the business account belongs to, and who runs it. The visitor can name both as it's set up. */
export interface BusinessNames {
  company: string;
  owner: string;
}

export const DEFAULT_BUSINESS: BusinessNames = { company: 'Acme Studio', owner: 'Alex Rivera' };

/** The longest name the visitor can give the company or themselves. */
export const MAX_NAME = 40;

/** A name as typed, made safe to show and send: plain, single-spaced, capped. Empty when nothing usable is left. */
export function cleanName(text: string): string {
  return text
    .replace(/[<>{}[\]\\`"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME)
    .trim();
}
