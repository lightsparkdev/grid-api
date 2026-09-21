import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TEXT_GLASS } from './liquid-glass/presets';

const copiedControls = [
  'PanelHeader/PanelHeader.tsx',
  'PanelHeader/PanelHeader.module.scss',
  'SectionDivider/SectionDivider.tsx',
  'SectionDivider/SectionDivider.module.scss',
  'Tooltip/Tooltip.tsx',
  'Tooltip/Tooltip.module.scss',
] as const;

describe('copied Cards controls', () => {
  it.each(copiedControls)('%s is byte equal', (path) => {
    expect(readFileSync(resolve(process.cwd(), 'src/components', path))).toEqual(
      readFileSync(resolve(process.cwd(), '../grid-cards-demo/src/components', path)),
    );
  });

  it('adapts the Cards export pill only to avoid the mobile back control', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/ShareSheet/StageShareButton.module.scss'),
      'utf8',
    );
    expect(source).toContain('@media (max-width: 767px)');
    expect(source).toContain('position: fixed');
    expect(source).toContain('bottom: 84px');
  });

  it('uses the exact Cards Explore flow cell states', () => {
    expect(
      readFileSync(
        resolve(process.cwd(), 'src/components/ChoiceGrid/ChoiceGrid.module.scss'),
      ),
    ).toEqual(
      readFileSync(
        resolve(
          process.cwd(),
          '../grid-cards-demo/src/components/FlowPicker/FlowPicker.module.scss',
        ),
      ),
    );
  });

  it('tunes the device toggle with the Wallet pill glass preset', () => {
    expect(TEXT_GLASS).toEqual(walletPreset('TEXT_GLASS'));
  });
});

/** Reads one named `GlassConfig` literal out of the Wallet source of truth. */
function walletPreset(name: string): Record<string, number> {
  const source = readFileSync(
    resolve(process.cwd(), '../grid-wallet-demo/src/apps/shared/glass/presets.ts'),
    'utf8',
  );
  const block = new RegExp(
    `export const ${name}: GlassConfig = \\{([\\s\\S]*?)\\n\\};`,
  ).exec(source);
  if (!block) throw new Error(`${name} is no longer declared in the Wallet presets`);
  const values: Record<string, number> = {};
  for (const [, key, value] of block[1].matchAll(/^\s*([a-zA-Z]+): (-?[\d.]+),$/gm)) {
    values[key] = Number(value);
  }
  return values;
}
