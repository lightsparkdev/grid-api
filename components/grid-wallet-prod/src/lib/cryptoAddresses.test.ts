import { describe, it, expect } from 'vitest';
import { detectAddressNetworks, randomNetworkAddress } from './cryptoAddresses';

describe('detectAddressNetworks', () => {
  // Round-trip against the generator: whatever this module can produce for a
  // chain must be recognised as valid for that chain.
  it.each([
    ['Solana', 'solana'],
    ['Tron', 'tron'],
    ['Bitcoin', 'btc'],
    ['Spark', 'spark'],
  ])('recognises a generated %s address', (network, id) => {
    expect(detectAddressNetworks(randomNetworkAddress(network))).toEqual([id]);
  });

  // The same 20 bytes are a valid account on both chains — the encoding cannot
  // distinguish them, so the caller has to ask rather than guess.
  it('reports an EVM address as ambiguous between Ethereum and Base', () => {
    expect(detectAddressNetworks(randomNetworkAddress('Base'))).toEqual(['ethereum', 'base']);
    expect(detectAddressNetworks(randomNetworkAddress('Ethereum'))).toEqual(['ethereum', 'base']);
  });

  it('accepts a lowercase (non-EIP-55) EVM address', () => {
    expect(detectAddressNetworks('0x4d765018e8f5c6f592260c95cbcadf5f5951fd15')).toEqual([
      'ethereum',
      'base',
    ]);
  });

  it('tolerates surrounding whitespace from a clipboard', () => {
    const address = randomNetworkAddress('Solana');
    expect(detectAddressNetworks(`  ${address}\n`)).toEqual(['solana']);
  });

  // Rejecting is the point: a truncated or mistyped address should fail here
  // rather than reach Grid and fail there.
  it.each([
    ['empty', ''],
    ['prose', 'send me money'],
    ['EVM one hex digit short', '0x4d765018e8f5c6f592260c95cbcadf5f5951fd1'],
    ['EVM with a non-hex digit', '0x4d765018e8f5c6f592260c95cbcadf5f5951fd1z'],
    ['bare hex without 0x', '4d765018e8f5c6f592260c95cbcadf5f5951fd15'],
    ['a bitcoin address with a broken checksum', 'bc1qsu2qrhp5vq5csy97qv3w8eku8wrh2l7dtenv7q'],
    ['a URL', 'https://example.com/pay'],
  ])('rejects %s', (_label, value) => {
    expect(detectAddressNetworks(value)).toEqual([]);
  });

  it('rejects a Solana-looking string that is not 32 bytes', () => {
    expect(detectAddressNetworks('3JZ4hmYF6u5es6Ztfpuv')).toEqual([]);
  });
});
