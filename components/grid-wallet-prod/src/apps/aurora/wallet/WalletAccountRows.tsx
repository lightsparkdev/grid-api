'use client';

import { IconArrowOutOfBox } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowOutOfBox';
import { IconCryptoWallet } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCryptoWallet';
import { IconPeopleAdd } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPeopleAdd';
import { IconShieldCheck } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconShieldCheck';
import type { WalletAccountActions } from '@/apps/types';
import { WalletNudge } from './WalletNudge';

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

function displayNickname(nickname: string | null): string {
  if (!nickname) return 'Signed in';
  return EVM_ADDRESS.test(nickname) ? `${nickname.slice(0, 6)}…${nickname.slice(-4)}` : nickname;
}

function sessionSub(expiresAt: number, adminReference: string | null): string {
  const until = new Date(expiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return adminReference ? `Admin ${adminReference} · session until ${until}` : `Session until ${until}`;
}

/** The live session, then what it can do to the account. */
export function WalletAccountRows({ actions }: { actions: WalletAccountActions }) {
  const { session, busy, onAddEvmWallet, onAddOwner, onSignOut } = actions;
  return (
    <>
      {session && (
        <WalletNudge
          icon={<IconShieldCheck size={24} />}
          title={displayNickname(session.nickname)}
          sub={sessionSub(session.expiresAt, session.adminReference)}
        />
      )}
      {onAddEvmWallet && (
        <WalletNudge
          icon={<IconCryptoWallet size={24} />}
          title="Add EVM wallet"
          sub="Sign in with your wallet next time"
          onTap={onAddEvmWallet}
          busy={busy}
        />
      )}
      {onAddOwner && (
        <WalletNudge
          icon={<IconPeopleAdd size={24} />}
          title="Add another owner"
          sub="Their EVM wallet can sign for this account"
          onTap={onAddOwner}
          busy={busy}
        />
      )}
      <WalletNudge
        icon={<IconArrowOutOfBox size={24} />}
        title="Sign out"
        sub="Back to the sign-in screen"
        onTap={onSignOut}
        busy={busy}
      />
    </>
  );
}
