'use client';

import { DotGridCanvas } from '@/components/DotGridCanvas/DotGridCanvas';
import type { PhoneProps } from '@/components/Phone';
import { DemoPhone } from '@/components/DemoPhone/DemoPhone';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { DEFAULT_OVERLAY_GLASS } from '@/apps/shared/glass';
import type { ActionId, WalletState } from '@/data/actions';
import type { AuthMethod, Persona, PhoneState } from '@/data/flow';
import type { WalletEntry, WalletTransferMode } from '@/apps/aurora/wallet';
import type { ExternalAccountInput, ReceivePaymentInfo, TransferDest } from '@/data/apiCalls';
import styles from './AppPanel.module.scss';

export interface DemoLogicPhoneSlice {
  persona: Persona;
  method: AuthMethod;
  methods: AuthMethod[];
  wallet: WalletState;
  phone: PhoneState;
  running: boolean;
  handleAction: (id: ActionId) => void;
  signInWithMethod: (method: AuthMethod, popup?: Promise<string>) => void;
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
  phoneActive: boolean;
  submitPhone: (number: string) => void;
  cancelPhone: () => void;
  gNonce: string | null;
  submitGoogle: (idToken: string) => void;
  aNonce: string | null;
  submitApple: (idToken: string) => void;
  popupWait: boolean;
  walletEntry?: WalletEntry;
  skipIntro?: boolean;
  onQuoteCreate?: (mode: WalletTransferMode, cents: number, dest?: TransferDest) => void;
  onLinkExternalAccount?: (input: ExternalAccountInput, label: string) => void;
  onTransferExecute?: (mode: WalletTransferMode, cents: number) => void;
  onCardIssued?: () => void;
  onTapToPay?: (cents: number, merchant: string) => void;
  onReceivePayment?: (info: ReceivePaymentInfo) => void;
}

function toPhoneProps(p: DemoLogicPhoneSlice): PhoneProps {
  return {
    persona: p.persona,
    method: p.method,
    methods: p.methods,
    phone: p.phone,
    wallet: p.wallet,
    onAction: p.handleAction,
    onSignInWithMethod: p.signInWithMethod,
    signInMethod: p.signInMethod ?? undefined,
    busy: p.running,
    popupWait: p.popupWait,
    passkey: {
      active: p.passkeyActive,
      onConfirm: p.confirmPasskey,
      onCancel: p.cancelPasskey,
    },
    faceId: {
      active: p.faceIdActive,
      onDone: p.finishFaceId,
    },
    otp: {
      active: p.otpActive,
      onSubmit: p.submitOtp,
      onCancel: p.cancelOtp,
      onBack: p.backOtp,
    },
    email: {
      active: p.emailActive,
      onSubmit: p.submitEmail,
      onCancel: p.cancelEmail,
    },
    phoneEntry: {
      active: p.phoneActive,
      onSubmit: p.submitPhone,
      onCancel: p.cancelPhone,
    },
    google: {
      nonce: p.gNonce,
      onCredential: p.submitGoogle,
    },
    apple: {
      nonce: p.aNonce,
      onCredential: p.submitApple,
    },
    walletEntry: p.walletEntry,
    skipIntro: p.skipIntro,
    onQuoteCreate: p.onQuoteCreate,
    onLinkExternalAccount: p.onLinkExternalAccount,
    onTransferExecute: p.onTransferExecute,
    onCardIssued: p.onCardIssued,
    onTapToPay: p.onTapToPay,
    onReceivePayment: p.onReceivePayment,
  };
}

export function AppPanel(phone: DemoLogicPhoneSlice) {
  const phoneProps = toPhoneProps(phone);

  return (
    <section className={styles.panel}>
      <div className={styles.body}>
        <div className={styles.phoneStage}>
          <DotGridCanvas glassConfig={PHONE_SHELL_GLASS}>
            <DemoPhone
              {...phoneProps}
              glassConfig={PHONE_SHELL_GLASS}
              overlayGlass={DEFAULT_OVERLAY_GLASS}
              glassDemoBg
              externalGlass
            />
          </DotGridCanvas>
        </div>
      </div>
    </section>
  );
}
