import { hashMessage, isAddressEqual, recoverPublicKey, type Hex } from 'viem';
import { publicKeyToAddress } from 'viem/accounts';

/** An EVM wallet as the Grid flows use it: its address and `personal_sign`. */
export interface EvmSigner {
  address: Hex;
  /** EIP-191 `personal_sign` over the exact string given. */
  signMessage: (message: string) => Promise<Hex>;
}

/** One row of `GET /auth/credentials`. */
export interface CredentialRow {
  id: string;
  type: string;
  nickname?: string;
  credentialId?: string;
  adminReference?: string;
}

/** What "Continue with EVM wallet" does on this account. */
export type EvmSignInPlan =
  | { kind: 'create-wallet' }
  | { kind: 'sign-in'; credentialId: string }
  | { kind: 'not-on-account' };

export class EvmWalletNotOnAccountError extends Error {
  constructor(address: string) {
    super(
      `${address} is not a credential on this account. Sign in another way, then add it from the wallet.`,
    );
    this.name = 'EvmWalletNotOnAccountError';
  }
}

/** An EVM credential's nickname is its address, in whatever case Grid stored. */
function findEvmCredential(
  credentials: CredentialRow[],
  address: string,
): CredentialRow | undefined {
  const wanted = address.toLowerCase();
  return credentials.find((c) => c.type === 'EVM_WALLET' && c.nickname?.toLowerCase() === wanted);
}

/**
 * A `PENDING` account with no credentials has no wallet yet, so under
 * `AT_FIRST_CREDENTIAL` this EVM wallet creates it. An account that already
 * has credentials only signs in with one it lists.
 */
export function planEvmSignIn(
  accountStatus: string,
  credentials: CredentialRow[],
  address: string,
): EvmSignInPlan {
  const credential = findEvmCredential(credentials, address);
  if (credential) return { kind: 'sign-in', credentialId: credential.id };
  if (accountStatus === 'PENDING' && credentials.length === 0) return { kind: 'create-wallet' };
  return { kind: 'not-on-account' };
}

/** What the second owner's wallet signs so its public key can be recovered. It grants nothing. */
export const OWNER_KEY_MESSAGE =
  'Share this wallet’s public key so it can be added as an owner of a Grid Global Account.\n\nThis signature authorizes nothing.';

/**
 * Recovers the signer's secp256k1 key from a `personal_sign` signature, as
 * compressed `0x`-hex. Wallets expose an address, not a key, and
 * `POST /auth/admin-credentials` takes the key.
 */
export async function recoverCompressedPublicKey(
  message: string,
  signature: Hex,
  address: Hex,
): Promise<Hex> {
  const uncompressed = await recoverPublicKey({ hash: hashMessage(message), signature });
  if (!isAddressEqual(publicKeyToAddress(uncompressed), address)) {
    throw new Error(`The signature was not made by ${address}`);
  }
  const x = uncompressed.slice(4, 68);
  const yIsEven = parseInt(uncompressed.slice(-2), 16) % 2 === 0;
  return `0x${yIsEven ? '02' : '03'}${x}`;
}

/** Derived from the address, so one wallet always maps to one administrator. */
export function adminReferenceFor(address: string): string {
  return `member_${address.slice(2, 10).toLowerCase()}`;
}
