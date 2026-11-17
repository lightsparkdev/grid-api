/* Reading a typed reply to a question the agent has open (an approval, a name, an amount, a choice): does it answer
   it, and with what? The model reads it as a person would; the page carries on as if the answer were tapped. */

import { cleanName } from '@/data/mode';

export type OpenKind = 'approval' | 'name' | 'amount' | 'choice';

export interface ReadRequest {
  kind: OpenKind;
  /** What the agent last said, which the reply answers. */
  asked: string;
  /** The options on screen, in order: choices, the amounts offered, or the name it suggests. */
  options?: string[];
  /** For an amount, the most they could mean by "all of it" (USD). */
  all?: number;
  reply: string;
}

/** What the reply says: the answer, or that it's about something else (the question lapses and the agent answers it). */
export type Reading =
  | { answers: false }
  | { answers: true; decision: 'yes' | 'no' }
  | { answers: true; name: string }
  | { answers: true; amount: number }
  | { answers: true; option: number };

/** What /api/agent/read sends the page. */
export interface ReadResponse {
  reading?: Reading;
  fallback?: string;
}

export const READ_SYSTEM = `You read one reply a person typed in a payments app while the app's agent was waiting on an answer. Decide whether the reply answers what the agent asked, the way a person would mean it: typos, slang, lowercase, emoji and filler words are fine. Always call read_reply once.

If the reply asks a question, makes a different request, changes the details, or says more than the answer, it doesn't answer: answers=false. Never guess past what they typed.

approval (the agent asked them to approve something as shown):
- decision "yes" when they clearly agree to go ahead as it is ("go for it", "sounds good", "lgtm", "ship it", "absolutely", "yes please", "👍").
- decision "no" when they only decline or put it off ("not now", "not yet", "hmm maybe later", "nah", "hold off", "I'll pass", "no thanks").
- answers=false for anything else: a question ("what's the fee?"), a change ("yes but make it $40", "send it to Maria instead"), or a new request.

name (the agent asked for a name: a company, the owner, a teammate):
- name: just the name, without lead-ins like "it's called", "my name is", "I'm", "we're", "call me", "it's". Capitalize words they typed all in lowercase ("pat capulong" is "Pat Capulong", "studio 54" is "Studio 54"); keep any capitals they typed as they are ("iRobot Labs").
- A first name alone is a name, even when the agent asked for a full name ("I'm Pat" is Pat).
- A name can sound like a request: "It's called Pay It Forward" names a company called Pay It Forward.
- If they accept the suggested name ("sure, use that", "that's fine", "the first one", or part of it with an okay: "rivera is good" for Alex Rivera), option 1.
- answers=false for a request ("pay Bob $50", "I want to run payroll"), a question, a no ("not right now"), or anything that isn't a name.

amount (the agent asked how much, in US dollars):
- amount_usd: the dollars they mean ("fifty" is 50, "2k" is 2000, "a hundred and twenty" is 120). "All of it", "everything", "max" is the most they could mean; "half" is half of it. "The first one" is the first amount offered.
- answers=false if it's a question, a different request, or no amount ("not sure", "never mind").

choice (the agent offered options):
- option: the number of the option they picked, by its name, part of it, a synonym, its position ("the second one", "the last"), or what they describe when it plainly falls under one option (a job title under its role, a city under its country).
- An option that confirms something ("I’ve sent it", "Done") is picked by a reply that says the same ("did it", "transferred", "all set").
- answers=false if it picks none of them ("neither", "something else"), or it's a question or a different request.`;

export const READ_TOOL = {
  name: 'read_reply',
  description: 'What the reply answers, or that it answers nothing that was asked.',
  input_schema: {
    type: 'object',
    properties: {
      answers: { type: 'boolean', description: 'The reply answers what the agent asked.' },
      decision: { type: 'string', enum: ['yes', 'no'], description: 'For an approval.' },
      name: { type: 'string', description: 'For a name: the name only, as it should be written.' },
      amount_usd: { type: 'number', description: 'For an amount: dollars.' },
      option: { type: 'integer', description: 'For a choice, or a suggested name or amount picked: its number, from 1.' },
    },
    required: ['answers'],
  },
} as const;

/** The reply and what it answers, as the model reads it. */
export function readPrompt(r: ReadRequest): string {
  const lines = [`Waiting on: ${r.kind}`, `The agent said: "${r.asked}"`];
  if (r.options?.length) lines.push(`On screen: ${r.options.map((o, i) => `${i + 1}. ${o}`).join('  ')}`);
  if (r.all !== undefined) lines.push(`"All of it" is $${r.all.toLocaleString('en-US')}`);
  lines.push(`Their reply: "${r.reply}"`);
  return lines.join('\n');
}

/** Letters and digits only, lowercased: how a name is matched against what they typed. */
const bare = (s: string) => s.toLowerCase().replace(/[^a-z0-9à-öø-ÿā-ž]+/g, ' ').trim();

/**
 * The model's answer checked against the question: an option on screen, a real amount, a name made of words they
 * typed, a yes or a no. Anything that doesn't hold up is null, and the page reads the reply the plain way instead.
 */
export function checkedReading(raw: Record<string, unknown>, r: ReadRequest): Reading | null {
  if (raw.answers === false) return { answers: false };
  if (raw.answers !== true) return null;
  const option = typeof raw.option === 'number' && Number.isInteger(raw.option) && r.options && raw.option >= 1 && raw.option <= r.options.length ? raw.option - 1 : null;
  switch (r.kind) {
    case 'approval':
      return raw.decision === 'yes' || raw.decision === 'no' ? { answers: true, decision: raw.decision } : null;
    case 'choice':
      return option !== null ? { answers: true, option } : null;
    case 'amount': {
      if (option !== null) return { answers: true, option };
      const usd = typeof raw.amount_usd === 'number' && Number.isFinite(raw.amount_usd) ? Math.round(raw.amount_usd * 100) / 100 : 0;
      return usd > 0 && usd <= 10_000_000 ? { answers: true, amount: usd } : null;
    }
    case 'name': {
      const said = typeof raw.name === 'string' ? cleanName(raw.name) : '';
      const name = r.reply.includes('’') ? said.replace(/'/g, '’') : said;
      const typed = ` ${bare(r.reply)} `;
      if (bare(name) && bare(name).split(' ').every((w) => typed.includes(` ${w} `))) return { answers: true, name };
      return option !== null ? { answers: true, option } : null;
    }
    default: {
      const never: never = r.kind;
      return never;
    }
  }
}
