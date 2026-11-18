import type { AgentAsk, AgentNote, Message } from '../conversation';

/* What's on screen, as text the model reads: a card, a receipt, an approval sheet, a product shelf. The model writes
   every line the person reads, so this is how it knows what the app put in front of them. */

const MAX = 420;
const cap = (text: string) => (text.length > MAX ? `${text.slice(0, MAX - 1)}…` : text);
const join = (parts: (string | undefined | false)[], by = '; ') => parts.filter(Boolean).join(by);

/** An approval or form: what it's for, what it says, and what its buttons are. */
export function describeAsk(ask: AgentAsk): string {
  const rows = (ask.rows ?? []).map((r) => join([r.text, r.sub], ' (') + (r.sub ? ')' : ''));
  const form = ask.form ? `${ask.form.title}: ${ask.form.fields.map((f) => `${f.label} ${f.value}`).join(', ')}` : undefined;
  const what = ask.recipient ? `a form for ${ask.recipient.name}’s bank details` : ask.bank ? 'the app’s bank-link sheet' : ask.card ? `a card form (${ask.card.brand} •••• ${ask.card.last4})` : undefined;
  const body = join([
    ask.amount,
    ask.who && `${ask.who.name}: ${ask.who.detail}`,
    ...rows,
    form,
    ask.where && `${ask.where.label}: ${ask.where.lines.join(', ')}`,
    ask.total && `total ${ask.total}`,
    ask.payWith ?? ask.method,
    ask.expires,
    what,
  ]);
  const buttons = join([ask.allow ?? 'Approve', ask.deny], ' / ');
  return cap(`“${ask.title}”${body ? `: ${body}` : ''} [buttons: ${buttons}]`);
}

function describeCard(card: AgentNote): string {
  const rows = (card.rows ?? []).slice(0, 6).map((r) => join([r.title, r.detail, r.amount], ', '));
  const invoice = card.invoice && `invoice ${card.invoice.number} to ${card.invoice.to}, ${card.invoice.amount}, due ${card.invoice.due}, ${card.invoice.status}`;
  const balance = card.balance && join([`${card.balance.wallet} ${card.balance.amount}`, card.balance.note, ...card.balance.stats.map((s) => `${s.label} ${s.value}`)], ', ');
  const body = join([...card.lines, ...rows, ...(card.stats ?? []).map((s) => `${s.label} ${s.value}`), invoice, balance, card.code && `(${card.glyph ?? 'code'}: ${card.code.slice(0, 48)})`]);
  return cap(`${card.done ? 'receipt' : 'card'} “${card.title}”${body ? `: ${body}` : ''}`);
}

/** Each thing the app showed, one line apiece, in the order it showed them. What the agent itself said isn't here. */
export function describe(messages: Message[]): string[] {
  return messages.flatMap((m): string[] => {
    switch (m.kind) {
      case 'ask':
        return [`approval ${describeAsk(m.ask)}`];
      case 'card':
        return [describeCard(m.card)];
      case 'products':
        return [cap(`products: ${m.products.map((p) => join([p.title, p.price, p.merchant, p.detail, p.pick && 'the app’s pick'], ', ')).join(' | ')}`)];
      case 'meta':
        return [`a note on screen: ${m.meta.text}`];
      case 'subagent':
        return [cap(`${m.agent.name} (another agent): ${m.done ? m.agent.summary : m.agent.working}`)];
      case 'them':
        // Only someone else's words (a message passed on): the agent's own lines are the model's to write.
        return m.sender && m.text ? [cap(`${m.sender}: ${m.text}`)] : [];
      case 'me':
      case 'chips':
      case 'work':
      case 'divider':
      case 'tag':
      case 'eyebrow':
      case 'stamp':
        return [];
      default: {
        const exhaustive: never = m;
        return exhaustive;
      }
    }
  });
}
