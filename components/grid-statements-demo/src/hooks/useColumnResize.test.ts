import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONFIGURE_COL_PX } from '@/lib/layout';
import { API_DEFAULT_WIDTH } from './useColumnResize';

describe('right rail geometry parity', () => {
  it('uses the exact Cards and Wallet resize source', () => {
    const statements = readFileSync(resolve(process.cwd(), 'src/hooks/useColumnResize.ts'));
    const cards = readFileSync(
      resolve(process.cwd(), '../grid-cards-demo/src/hooks/useColumnResize.ts'),
    );
    const wallet = readFileSync(
      resolve(process.cwd(), '../grid-wallet-demo/src/hooks/useColumnResize.ts'),
    );

    expect(statements).toEqual(cards);
    expect(statements).toEqual(wallet);
  });

  it('pins minimum, default, and maximum widths from the source formula', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/hooks/useColumnResize.ts'),
      'utf8',
    );

    expect(CONFIGURE_COL_PX).toBe(400);
    expect(API_DEFAULT_WIDTH).toBe(680);
    expect(source).toContain('const MIN_APP = 320;');
    expect(source).toContain('const MIN_API = CONFIGURE_COL_PX;');
    expect(source).toContain('Math.max(MIN_API, Math.min(totalMiddle - MIN_APP, width))');
    expect(2560 - CONFIGURE_COL_PX - 320).toBe(1840);
  });
});
