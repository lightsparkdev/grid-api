import type { AuthMethod, Persona } from '@/data/flow';
import type { WalletState, ActionId } from '@/data/actions';
import type { PhoneState } from '@/data/flow';
import { getPhonePreviewFixture } from '@/dev/phonePreview/fixtures';

const noop = () => {};
const noopAsync = async () => {};

const PREVIEW_AMOUNT = {
  title: 'Add money',
  cta: 'Confirm',
  source: 'Bank account',
  sub: '•••• 3872 · Instant',
  defaultDollars: 5000,
};

export interface DemoLogicPhoneSlice {
  persona: Persona;
  method: AuthMethod;
  wallet: WalletState;
  phone: PhoneState;
  running: boolean;
  handleAction: (id: ActionId) => void;
  signInWithMethod: (method: AuthMethod) => void;
  signInMethod: AuthMethod | null;
  passkeyActive: boolean;
  confirmPasskey: () => void;
  cancelPasskey: () => void;
  faceIdActive: boolean;
  finishFaceId: () => void;
  otpActive: boolean;
  submitOtp: (code: string) => void;
  cancelOtp: () => void;
  backOtp: () => void;
  emailActive: boolean;
  submitEmail: (email: string) => void;
  cancelEmail: () => void;
  gNonce: string | null;
  submitGoogle: (idToken: string) => void;
  amountConfig: typeof PREVIEW_AMOUNT | null;
  submitAmount: (dollars: number) => void;
  cancelAmount: () => void;
}

export function resolvePhoneProps(
  logic: DemoLogicPhoneSlice,
  fixtureId: string,
  previewActive: boolean,
) {
  const fixture = previewActive ? getPhonePreviewFixture(fixtureId) : undefined;

  const phone = fixture?.phone ?? logic.phone;
  const wallet = fixture?.wallet ?? logic.wallet;
  const method = fixture?.method ?? logic.method;
  const busy = previewActive ? false : logic.running;

  const overlay = fixture?.overlay ?? null;

  return {
    persona: logic.persona,
    method,
    phone,
    wallet,
    onAction: previewActive ? noop : logic.handleAction,
    onSignInWithMethod: previewActive ? noop : logic.signInWithMethod,
    signInMethod: logic.signInMethod ?? undefined,
    busy,
    passkey: {
      active: previewActive ? overlay === 'passkey' : logic.passkeyActive,
      onConfirm: previewActive ? noop : logic.confirmPasskey,
      onCancel: previewActive ? noop : logic.cancelPasskey,
    },
    faceId: {
      active: previewActive ? false : logic.faceIdActive,
      onDone: previewActive ? noop : logic.finishFaceId,
    },
    otp: {
      active: previewActive ? overlay === 'otp' : logic.otpActive,
      onSubmit: previewActive ? noop : logic.submitOtp,
      onCancel: previewActive ? noop : logic.cancelOtp,
      onBack: previewActive ? noop : logic.backOtp,
    },
    email: {
      active: previewActive ? overlay === 'email' : logic.emailActive,
      onSubmit: previewActive ? noopAsync : logic.submitEmail,
      onCancel: previewActive ? noop : logic.cancelEmail,
    },
    google: {
      nonce: previewActive
        ? overlay === 'google'
          ? 'preview-nonce'
          : null
        : logic.gNonce,
      onCredential: previewActive ? noop : logic.submitGoogle,
    },
    amount: {
      config: previewActive
        ? overlay === 'amount'
          ? PREVIEW_AMOUNT
          : null
        : logic.amountConfig,
      onSubmit: previewActive ? noop : logic.submitAmount,
      onCancel: previewActive ? noop : logic.cancelAmount,
    },
  };
}
