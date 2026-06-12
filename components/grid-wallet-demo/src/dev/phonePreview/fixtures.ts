import { fmt, initialWallet, type WalletState } from '@/data/actions';
import type { AuthMethod, PhoneState, Tx } from '@/data/flow';

export type PhoneOverlayId = 'email' | 'phone' | 'otp' | 'google' | 'amount' | 'passkey' | null;

export interface PhonePreviewFixture {
  id: string;
  label: string;
  group: string;
  method?: AuthMethod;
  phone: PhoneState;
  wallet: WalletState;
  overlay?: PhoneOverlayId;
}

const FUNDED: WalletState = {
  created: true,
  balanceCents: 500_000,
  hasCard: false,
  cardActivated: false,
  activity: [],
};

const FUNDED_WITH_CARD: WalletState = {
  ...FUNDED,
  hasCard: true,
};

const SAMPLE_ACTIVITY: Tx[] = [
  {
    kind: 'send',
    name: 'Sent to $leo@grid.app',
    sub: 'Payment · Just now',
    amount: '-$250.00',
  },
  {
    kind: 'bank',
    name: 'Bank account (•••• 3872)',
    sub: 'Added · Just now',
    amount: '+$5,000.00',
    positive: true,
  },
];

const FUNDED_ACTIVITY: WalletState = {
  ...FUNDED,
  activity: SAMPLE_ACTIVITY,
};

function walletPhone(
  wallet: WalletState,
  screen: PhoneState['screen'],
  extra?: Partial<PhoneState>,
): PhoneState {
  return {
    screen,
    balance: fmt(wallet.balanceCents),
    hasCard: wallet.hasCard,
    cardActivated: wallet.cardActivated,
    activity: wallet.activity,
    ...extra,
  };
}

const AUTH_METHODS: AuthMethod[] = ['passkey', 'oauth', 'apple', 'email_otp', 'sms'];

const CREDENTIAL_FIXTURES: PhonePreviewFixture[] = AUTH_METHODS.map((method) => ({
  id: `credential-${method}`,
  label: `Credential · ${method}`,
  group: 'Auth',
  method,
  phone: { screen: 'credential', balance: '$0.00', hasCard: false, cardActivated: false, activity: [] },
  wallet: initialWallet,
}));

export const PHONE_PREVIEW_FIXTURES: PhonePreviewFixture[] = [
  {
    id: 'live',
    label: 'Live demo state',
    group: 'Mode',
    phone: { screen: 'auth', balance: '$0.00', hasCard: false, cardActivated: false, activity: [] },
    wallet: initialWallet,
  },
  {
    id: 'auth',
    label: 'Auth',
    group: 'Screens',
    phone: { screen: 'auth', balance: '$0.00', hasCard: false, cardActivated: false, activity: [] },
    wallet: initialWallet,
  },
  {
    id: 'creating',
    label: 'Creating account',
    group: 'Screens',
    phone: {
      screen: 'creating',
      balance: '$0.00',
      hasCard: false,
      cardActivated: false,
      activity: [],
      note: 'Setting up your account…',
    },
    wallet: initialWallet,
  },
  ...CREDENTIAL_FIXTURES,
  {
    id: 'wallet-empty',
    label: 'Wallet · empty',
    group: 'Wallet',
    phone: walletPhone({ ...FUNDED, balanceCents: 0 }, 'wallet'),
    wallet: { ...FUNDED, balanceCents: 0, activity: [] },
  },
  {
    id: 'wallet-funded',
    label: 'Wallet · funded',
    group: 'Wallet',
    phone: walletPhone(FUNDED, 'wallet'),
    wallet: FUNDED,
  },
  {
    id: 'wallet-activity',
    label: 'Wallet · activity',
    group: 'Wallet',
    phone: walletPhone(FUNDED_ACTIVITY, 'wallet'),
    wallet: FUNDED_ACTIVITY,
  },
  {
    id: 'wallet-card',
    label: 'Wallet · has card',
    group: 'Wallet',
    phone: walletPhone(FUNDED_WITH_CARD, 'wallet'),
    wallet: FUNDED_WITH_CARD,
  },
  {
    id: 'addmoney',
    label: 'Add money confirm',
    group: 'Flows',
    phone: walletPhone(FUNDED, 'addmoney'),
    wallet: FUNDED,
  },
  {
    id: 'send',
    label: 'Send confirm',
    group: 'Flows',
    phone: walletPhone(FUNDED, 'send'),
    wallet: FUNDED,
  },
  {
    id: 'withdraw',
    label: 'Withdraw confirm',
    group: 'Flows',
    phone: walletPhone(FUNDED, 'withdraw'),
    wallet: FUNDED,
  },
  {
    id: 'card-reveal',
    label: 'Card reveal',
    group: 'Flows',
    phone: walletPhone(FUNDED, 'card-reveal'),
    wallet: FUNDED,
  },
  {
    id: 'tap-idle',
    label: 'Tap · hold reader',
    group: 'Flows',
    phone: walletPhone(FUNDED_WITH_CARD, 'tap', { cardActivated: false }),
    wallet: FUNDED_WITH_CARD,
  },
  {
    id: 'tap-done',
    label: 'Tap · done',
    group: 'Flows',
    phone: walletPhone(FUNDED_WITH_CARD, 'tap', { cardActivated: true }),
    wallet: FUNDED_WITH_CARD,
  },
  {
    id: 'overlay-email',
    label: 'Overlay · email entry',
    group: 'Overlays',
    method: 'email_otp',
    phone: walletPhone(initialWallet, 'auth'),
    wallet: initialWallet,
    overlay: 'email',
  },
  {
    id: 'overlay-otp',
    label: 'Overlay · OTP',
    group: 'Overlays',
    method: 'email_otp',
    phone: walletPhone(initialWallet, 'auth'),
    wallet: initialWallet,
    overlay: 'otp',
  },
  {
    id: 'overlay-google',
    label: 'Overlay · Google sign-in',
    group: 'Overlays',
    method: 'oauth',
    phone: walletPhone(initialWallet, 'auth'),
    wallet: initialWallet,
    overlay: 'google',
  },
  {
    id: 'overlay-passkey',
    label: 'Overlay · passkey sheet',
    group: 'Overlays',
    method: 'passkey',
    phone: walletPhone(initialWallet, 'auth'),
    wallet: initialWallet,
    overlay: 'passkey',
  },
  {
    id: 'overlay-amount',
    label: 'Overlay · amount entry',
    group: 'Overlays',
    phone: walletPhone(FUNDED, 'wallet'),
    wallet: FUNDED,
    overlay: 'amount',
  },
];

export const PHONE_PREVIEW_FIXTURE_IDS = new Set(
  PHONE_PREVIEW_FIXTURES.map((f) => f.id),
);

export function getPhonePreviewFixture(id: string): PhonePreviewFixture | undefined {
  return PHONE_PREVIEW_FIXTURES.find((f) => f.id === id);
}
