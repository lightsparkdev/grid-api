import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

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

  it('keeps the Cards StageShareButton behavior at 39baddfd', () => {
    const bytes = readFileSync(
      resolve(process.cwd(), 'src/components/ShareSheet/StageShareButton.tsx'),
    );
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(
      '664c9b04f808d2b5fd59ce2da6fdbf98d31b272cdd7a1a0729c8e99aa33a51ff',
    );
  });

  it('adapts the Cards share pill only to avoid the mobile back control', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/ShareSheet/StageShareButton.module.scss'),
      'utf8',
    );
    expect(source).toContain('@media (max-width: 767px)');
    expect(source).toContain('position: fixed');
    expect(source).toContain('bottom: 84px');
  });
});
