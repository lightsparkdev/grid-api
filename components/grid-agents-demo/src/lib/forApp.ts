import type { ConnectorId } from '@/data/connectors';

/** `?for=` names the agent app a link was made for, by its id or the name people know it by. */
const FOR: Record<string, ConnectorId> = {
  muse: 'muse',
  grok: 'grok',
  bot: 'grok',
  dot: 'dot',
  dots: 'dot',
  instinct: 'instinct',
  duet: 'claude',
  claude: 'claude',
};

export function appFor(search: string): ConnectorId | undefined {
  const name = new URLSearchParams(search).get('for')?.trim().toLowerCase();
  return name ? FOR[name] : undefined;
}
