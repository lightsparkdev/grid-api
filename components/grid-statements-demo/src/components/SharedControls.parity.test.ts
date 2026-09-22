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
  'ApiPanel/ApiPanelEmpty.tsx',
  'ApiPanel/ApiPanel.tsx',
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

  it('uses the complete Wallet Select platform cell states', () => {
    const local = readFileSync(
      resolve(process.cwd(), 'src/components/ChoiceGrid/ChoiceGrid.module.scss'),
      'utf8',
    );
    const wallet = readFileSync(
      resolve(
        process.cwd(),
        '../grid-wallet-demo/src/components/UseCasePicker/UseCasePicker.module.scss',
      ),
      'utf8',
    );
    const rename = (source: string) =>
      source
        .replaceAll('.cardSelected', '.optionSelected')
        .replaceAll('.card', '.option')
        .replaceAll('.icon', '.optionIcon')
        .replaceAll('.label', '.optionLabel');

    for (const selector of ['.group', '.card', '.cardSelected', '.content', '.icon', '.label']) {
      expect(normalizeScss(scssBlock(local, rename(selector)))).toBe(
        normalizeScss(rename(scssBlock(wallet, selector))),
      );
    }

    const localRing = scssBlock(local, '.activeRing');
    const walletRing = scssBlock(wallet, '.activeRing');
    for (const property of [
      'position',
      'inset',
      'z-index',
      'corner-shape',
      'border-radius',
      'pointer-events',
    ]) {
      expect(scssDeclaration(localRing, property)).toBe(scssDeclaration(walletRing, property));
    }
  });

  it('uses the Cards neutral selected ring and swatch radius', () => {
    const choiceGrid = readFileSync(
      resolve(process.cwd(), 'src/components/ChoiceGrid/ChoiceGrid.module.scss'),
      'utf8',
    );
    const statementsControls = readFileSync(
      resolve(process.cwd(), 'src/components/DesignControls/DesignControls.module.scss'),
      'utf8',
    );
    const cards = readFileSync(
      resolve(
        process.cwd(),
        '../grid-cards-demo/src/components/DesignPicker/DesignPicker.module.scss',
      ),
      'utf8',
    );
    const choiceRing = scssBlock(choiceGrid, '.activeRing');
    const statementsRing = scssBlock(statementsControls, '.ring');
    const cardsRing = scssBlock(cards, '.ring');

    expect(scssDeclaration(choiceRing, 'border')).toBe(scssDeclaration(cardsRing, 'border'));
    expect(scssDeclaration(statementsRing, 'border')).toBe(scssDeclaration(cardsRing, 'border'));
    expect(scssDeclaration(statementsRing, 'border-radius')).toBe(
      scssDeclaration(cardsRing, 'border-radius'),
    );
    expect(choiceRing).not.toMatch(/\b(?:padding|background|-webkit-mask|mask)\s*:/);
    expect(choiceGrid).not.toContain('$active-border-gradient');
  });
});

function scssBlock(source: string, selector: string): string {
  const start = source.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`${selector} is no longer declared`);
  let depth = 0;
  for (let index = source.indexOf('{', start); index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`${selector} is not closed`);
}

function normalizeScss(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\s+/g, '');
}

function scssDeclaration(source: string, property: string): string {
  const match = new RegExp(`(?:^|\\n)\\s*${property}:\\s*([^;]+);`).exec(source);
  if (!match) throw new Error(`${property} is no longer declared`);
  return match[1].replace(/\s+/g, ' ').trim();
}
