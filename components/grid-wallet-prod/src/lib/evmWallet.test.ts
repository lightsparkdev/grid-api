import { describe, it, expect } from 'vitest';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { planEvmSignIn, recoverCompressedPublicKey, OWNER_KEY_MESSAGE } from './evmWallet';

const ADDRESS = '0x2c7536E3605D9C16a7a3D7b1898e529396a65c23';

describe('planEvmSignIn', () => {
  it('creates the wallet on a PENDING account with no credentials', () => {
    expect(planEvmSignIn('PENDING', [], ADDRESS)).toEqual({ kind: 'create-wallet' });
  });
  it('signs in on the matching credential whatever the address case', () => {
    const creds = [
      { id: 'AuthMethod:email', type: 'EMAIL_OTP', nickname: 'pat@example.com' },
      { id: 'AuthMethod:evm', type: 'EVM_WALLET', nickname: ADDRESS.toLowerCase() },
    ];
    expect(planEvmSignIn('ACTIVE', creds, ADDRESS)).toEqual({ kind: 'sign-in', credentialId: 'AuthMethod:evm' });
  });
  it('never creates a wallet on an account that already has a credential', () => {
    const creds = [{ id: 'AuthMethod:email', type: 'EMAIL_OTP', nickname: 'pat@example.com' }];
    expect(planEvmSignIn('ACTIVE', creds, ADDRESS)).toEqual({ kind: 'not-on-account' });
    expect(planEvmSignIn('PENDING', creds, ADDRESS)).toEqual({ kind: 'not-on-account' });
  });
});

describe('recoverCompressedPublicKey', () => {
  it('recovers the signing wallet’s own compressed secp256k1 key', async () => {
    const wallet = privateKeyToAccount(generatePrivateKey());
    const signature = await wallet.signMessage({ message: OWNER_KEY_MESSAGE });
    const key = await recoverCompressedPublicKey(OWNER_KEY_MESSAGE, signature, wallet.address);
    expect(key).toBe(`0x${secp256k1.Point.fromHex(wallet.publicKey.slice(2)).toHex(true)}`);
  });
  it('refuses a signature made by a different wallet', async () => {
    const signer = privateKeyToAccount(generatePrivateKey());
    const other = privateKeyToAccount(generatePrivateKey());
    const signature = await signer.signMessage({ message: OWNER_KEY_MESSAGE });
    await expect(recoverCompressedPublicKey(OWNER_KEY_MESSAGE, signature, other.address)).rejects.toThrow();
  });
});
