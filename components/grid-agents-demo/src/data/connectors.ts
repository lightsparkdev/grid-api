/* The agent apps a visitor can connect (Figma 124:3873, Select connector). */

export type ConnectorId = 'muse' | 'grok' | 'dot' | 'instinct' | 'claude' | 'yourapp';

export interface ConnectorDef {
  id: ConnectorId;
  label: string;
  /** The 22px logo tile: its surface and the mark inside it. */
  logo: {
    src: string;
    background: string;
    /** Instinct's mark sits on a round white avatar rather than a tile. */
    circle?: boolean;
    /** The mark's box inside the tile, in px from the tile's top-left. */
    mark: { left: number; top: number; width: number; height: number; round?: boolean };
  };
}

/** In the Figma's grid order: two columns, read across. */
export const CONNECTORS: ConnectorDef[] = [
  {
    id: 'muse',
    label: 'Muse',
    logo: {
      src: '/assets/connectors/muse.png',
      background: '#ededed',
      mark: { left: -2.5, top: -0.5, width: 26, height: 26, round: true },
    },
  },
  {
    id: 'grok',
    label: 'Grok Bot',
    logo: {
      src: '/assets/connectors/grok.svg',
      background: '#ffffff',
      mark: { left: -0.5, top: -0.5, width: 22, height: 22 },
    },
  },
  {
    id: 'dot',
    label: 'Dots',
    logo: {
      src: '/assets/connectors/dot.png',
      background: '#f4f4f2',
      mark: { left: 0.5, top: 3.55, width: 20, height: 15.9 },
    },
  },
  {
    id: 'instinct',
    label: 'Instinct',
    logo: {
      src: '/assets/connectors/instinct.png',
      background: '#ffffff',
      circle: true,
      mark: { left: 8.02, top: 3.4, width: 4.97, height: 13.84 },
    },
  },
  {
    id: 'claude',
    label: 'Claude Duet',
    logo: {
      src: '/assets/connectors/claude.svg',
      background: 'transparent',
      mark: { left: -0.5, top: -0.5, width: 22, height: 22 },
    },
  },
  {
    id: 'yourapp',
    label: 'Your app',
    logo: {
      src: '/assets/connectors/your-app.svg',
      background: 'var(--connector-yourapp-bg)',
      mark: { left: 3, top: 3, width: 14, height: 14 },
    },
  },
];
