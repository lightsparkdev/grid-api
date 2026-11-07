/* The agent apps a visitor can connect (Figma 124:3873, Select agent). */

export type ConnectorId = 'muse' | 'grok' | 'dot' | 'instinct' | 'claude' | 'yourapp';

export interface ConnectorDef {
  id: ConnectorId;
  label: string;
  /** The app's icon: its App Store artwork at 400 x 400, or a glyph on a tile for an app that has none. */
  logo: { src: string; glyph?: boolean };
}

/** In the Figma's grid order: two columns, read across. */
export const CONNECTORS: ConnectorDef[] = [
  { id: 'muse', label: 'Muse', logo: { src: '/assets/connectors/muse-app.png' } },
  { id: 'grok', label: 'Grok Bot', logo: { src: '/assets/connectors/bot-app.png' } },
  { id: 'dot', label: 'Dots', logo: { src: '/assets/connectors/chatgpt-app.png' } },
  // Instinct lives in iMessage and has no app: its mark, drawn as an icon.
  { id: 'instinct', label: 'Instinct', logo: { src: '/assets/connectors/instinct-app.png' } },
  { id: 'claude', label: 'Duet', logo: { src: '/assets/connectors/duet-app.png' } },
  { id: 'yourapp', label: 'Your agent', logo: { src: '/assets/connectors/your-app.svg', glyph: true } },
];
