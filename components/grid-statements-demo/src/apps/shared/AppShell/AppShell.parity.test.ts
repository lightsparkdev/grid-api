import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Wallet AppShell parity', () => {
  it('matches Wallet except for the required device preset adapter', () => {
    const statements = resolve(process.cwd(), 'src/apps/shared/AppShell');
    const wallet = resolve(process.cwd(), '../grid-wallet-demo/src/apps/shared/AppShell');
    const files = readdirSync(wallet).sort();
    const adapted = new Set(['AppShell.tsx', 'usePhoneFitScale.ts']);

    expect(readdirSync(statements).filter((file) => !file.endsWith('.test.ts')).sort()).toEqual(files);
    for (const file of files) {
      if (adapted.has(file)) continue;
      expect(readFileSync(resolve(statements, file))).toEqual(
        readFileSync(resolve(wallet, file)),
      );
    }

    const appShell = readFileSync(resolve(statements, 'AppShell.tsx'), 'utf8');
    const fitScale = readFileSync(resolve(statements, 'usePhoneFitScale.ts'), 'utf8');
    expect(appShell).toContain("device = 'phone'");
    expect(appShell).toContain('APP_SHELL_GEOMETRY[device]');
    expect(fitScale).toContain("'duo-landscape'");
    expect(fitScale).toContain('screenWidth: 890');
    expect(fitScale).toContain('screenHeight: 626');
    expect(fitScale).toContain('screenRadius: 54');
  });
});
