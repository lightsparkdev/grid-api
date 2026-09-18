import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Wallet AppShell parity', () => {
  it('matches every Wallet AppShell file byte for byte', () => {
    const statements = resolve(process.cwd(), 'src/apps/shared/AppShell');
    const wallet = resolve(process.cwd(), '../grid-wallet-demo/src/apps/shared/AppShell');
    const files = readdirSync(wallet).sort();

    expect(readdirSync(statements).filter((file) => !file.endsWith('.test.ts')).sort()).toEqual(files);
    for (const file of files) {
      expect(readFileSync(resolve(statements, file))).toEqual(
        readFileSync(resolve(wallet, file)),
      );
    }
  });
});
