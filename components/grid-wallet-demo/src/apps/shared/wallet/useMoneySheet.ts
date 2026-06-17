'use client';

/**
 * Headless brain for the add / withdraw / send / receive money sheet — shared by
 * every skin's sheet FACE. Owns the step machine, amount keypad, bank/recipient
 * state, FX + fee math, and the API-call callbacks. No JSX: a view consumes this,
 * reads the state, and renders + animates however it likes. The only UI-coupled
 * bit is the shake on an invalid amount, surfaced as `shakeNonce` (bumps on each
 * invalid attempt) for the view to animate.
 */
import { useEffect, useRef, useState } from 'react';
import type { ExternalAccountInput, TransferDest } from '@/data/apiCalls';
import { currencyFor, recipientNamesFor, type BankCountry } from '@/data/bankCountries';
import { useUsdRates } from '@/hooks/useUsdRates';
import { formatUsdCents, typedToCents } from './format';
import type { MoneySheetMode, ReceivedPayment, TransferActivity } from './types';
import {
  BANK_COUNTRIES,
  BTC_NETWORK_FEE_USD,
  BTC_USD,
  DEFAULT_SEND_NETWORK,
  DEMO_BENEFICIARY,
  MODES,
  QUOTE_MS,
  RECEIVE_RAIL,
  SAVE_MS,
  USD_TO_MXN,
  accountLast4,
  firstNameLastInitial,
  formatRate,
  receiveFields,
  sampleValuesFor,
  type CryptoRecipient,
  type SavedBank,
  type SavedRecipient,
  type SendNetwork,
  type Step,
} from './moneySheet';

export interface UseMoneySheetOptions {
  open: boolean;
  /** Direction of the flow — flips titles, source rows, card order, and copy. */
  mode: MoneySheetMode;
  /** Live cash balance (cents) — displayed, and the withdraw over-balance cap. */
  availableCents: number;
  /** Face ID running — Confirm shows a spinner and input locks. */
  confirming: boolean;
  onDismiss: () => void;
  /** Confirm tapped with the typed amount (cents). `activity` carries the real
   *  destination for the Activity row + toast. */
  onConfirm: (cents: number, activity: TransferActivity) => void;
  /** Amount committed (the quote beat). `dest` references the recipient. */
  onQuote?: (cents: number, dest?: TransferDest) => void;
  /** A bank/crypto recipient was added — parent logs the external-account call. */
  onLinkExternalAccount?: (input: ExternalAccountInput, label: string) => void;
  /** Receive flow: Share/Copy fired a (simulated) inbound payment. */
  onReceive?: (payment: ReceivedPayment) => void;
}

export function useMoneySheet({
  open,
  mode,
  availableCents,
  confirming,
  onDismiss,
  onConfirm,
  onQuote,
  onLinkExternalAccount,
  onReceive,
}: UseMoneySheetOptions) {
  const { titles, sources, activeSources, details } = MODES[mode];
  const balance = formatUsdCents(availableCents);
  const [step, setStep] = useState<Step>(
    mode === 'send' ? 'banks' : mode === 'receive' ? 'deposit' : 'source',
  );
  const [back, setBack] = useState(false); // direction of the last nav
  // Bumps on every open so the step stack remounts fresh.
  const [openKey, setOpenKey] = useState(0);
  const [raw, setRaw] = useState(''); // typed amount, e.g. "1500.5"
  const [started, setStarted] = useState(false); // Swift's hasStartedTyping
  const [quoting, setQuoting] = useState(false); // fake quote beat on Continue
  const [saving, setSaving] = useState(false); // 500ms validate+save beat on add
  const [pasted, setPasted] = useState(false); // send: address card filled
  const [pastedAddress, setPastedAddress] = useState(''); // the entered crypto address
  const [pickerOpen, setPickerOpen] = useState(false); // crypto network picker sheet
  const [pickedNetwork, setPickedNetwork] = useState<SendNetwork | null>(null);
  // Withdraw-to-crypto destination — a one-off wallet (not a saved list).
  const [cryptoDest, setCryptoDest] = useState<CryptoRecipient | null>(null);
  const quoteTimer = useRef(0);
  const saveTimer = useRef(0);
  // Invalid-amount signal: bumps on a rejected keypress (past the cap) or an
  // invalid Continue. The view watches this to run its shake animation.
  const [shakeNonce, setShakeNonce] = useState(0);
  const triggerShake = () => setShakeNonce((n) => n + 1);

  const isSend = mode === 'send';
  const [savedBanks, setSavedBanks] = useState<SavedBank[]>([]);
  const [savedRecipients, setSavedRecipients] = useState<SavedRecipient[]>([]);
  // The active list for the current mode: send = recipients; add/withdraw = banks.
  const banks: SavedRecipient[] = isSend ? savedRecipients : savedBanks;
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [pickedCountry, setPickedCountry] = useState<BankCountry | null>(null);
  const [countryQuery, setCountryQuery] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formBeneficiary, setFormBeneficiary] = useState(DEMO_BENEFICIARY);
  // Deposit (Receive) list — per-row copy feedback (copy works; QR is a no-op).
  const [copiedChainId, setCopiedChainId] = useState<string | null>(null);
  const copyTimer = useRef(0);
  // Live mid-market rates (Coinbase, cached) with the baked-in usdToLocal fallback.
  const { rateFor } = useUsdRates();
  const selected = banks.find((b) => b.id === selectedBankId) ?? null;
  const selectedBank = selected && !('address' in selected) ? selected : null;
  // Send picks crypto from the saved list; withdraw uses a one-off cryptoDest.
  const selectedCrypto = cryptoDest ?? (selected && 'address' in selected ? selected : null);
  const localCurrency = selectedBank ? currencyFor(selectedBank.country) : 'MXN';
  const cryptoCurrency = selectedCrypto?.currency ?? 'USDC';
  const isBtcDest = cryptoCurrency === 'BTC';
  const stablecoinDest = !selectedBank && (selectedCrypto != null || mode === 'send');
  const fxRate = selectedBank
    ? rateFor(currencyFor(selectedBank.country), selectedBank.country.usdToLocal)
    : stablecoinDest
      ? isBtcDest
        ? 1 / BTC_USD
        : 1
      : USD_TO_MXN;
  // BTC shows fractional precision; stablecoins (and fiat) use 2 decimals.
  const fxFractionDigits = stablecoinDest && isBtcDest ? 6 : 2;
  const fxLabel = stablecoinDest ? cryptoCurrency : localCurrency;

  // Country picker lists: Popular (by volume) on top, then All (alphabetical).
  const countryQ = countryQuery.trim().toLowerCase();
  const allCountries = [...BANK_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
  const popularCountries = BANK_COUNTRIES.filter((c) => c.popularRank).sort(
    (a, b) => (a.popularRank ?? 0) - (b.popularRank ?? 0),
  );
  const filteredCountries = allCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(countryQ) ||
      currencyFor(c).toLowerCase().includes(countryQ) ||
      c.code.includes(countryQ),
  );

  // Fresh flow every open — reset DURING render (derive-state-on-prop-change).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setOpenKey((k) => k + 1);
      setStep(mode === 'receive' ? 'deposit' : isSend ? 'banks' : 'source');
      setBack(false);
      setRaw('');
      setStarted(false);
      setQuoting(false);
      setSaving(false);
      setPasted(false);
      setPastedAddress('');
      setPickerOpen(false);
      setPickedNetwork(null);
      setCryptoDest(null);
      setSelectedBankId(null);
      setPickedCountry(null);
      setCountryQuery('');
    }
  }
  useEffect(() => {
    if (open) window.clearTimeout(quoteTimer.current);
  }, [open]);
  useEffect(
    () => () => {
      window.clearTimeout(quoteTimer.current);
      window.clearTimeout(copyTimer.current);
      window.clearTimeout(saveTimer.current);
    },
    [],
  );

  const go = (next: Step, isBack = false) => {
    setBack(isBack);
    setStep(next);
  };

  // Pick a crypto network in the secondary sheet — fills the address card.
  const pickNetwork = (net: SendNetwork) => {
    setPickedNetwork(net);
    setPastedAddress(net.address);
    setPasted(true);
    setPickerOpen(false);
  };

  // Copy a value to the clipboard; the tapped control flips to a checkmark.
  const copyValue = (id: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedChainId(id);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopiedChainId(null), 1400);
  };

  // Share the funding instructions (native share sheet; clipboard fallback).
  const shareFunding = () => {
    if (!pickedCountry) return;
    const text = receiveFields(pickedCountry, formBeneficiary)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n');
    if (navigator.share) {
      navigator.share({ title: `Receive from ${pickedCountry.name}`, text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  };

  // Share the bank details, then fire the (simulated) inbound payment.
  const shareFundingAndReceive = () => {
    shareFunding();
    if (!pickedCountry) return;
    const pool = recipientNamesFor(pickedCountry);
    const full = pool[Math.floor(Math.random() * pool.length)];
    onReceive?.({
      via: 'bank',
      countryCode: pickedCountry.code,
      countryName: pickedCountry.name,
      payer: firstNameLastInitial(full),
      payerFull: full,
      rail: RECEIVE_RAIL[pickedCountry.accountType] ?? 'BANK_TRANSFER',
    });
  };

  // Bank flow handlers.
  const openAddBank = () => {
    setPickedCountry(null);
    setCountryQuery('');
    go(isSend ? 'source' : 'country');
  };
  const pickCountry = (country: BankCountry) => {
    setPickedCountry(country);
    setFormValues(sampleValuesFor(country));
    if (isSend) {
      const pool = recipientNamesFor(country);
      const count = banks.filter(
        (b) => !('address' in b) && b.country.code === country.code,
      ).length;
      setFormBeneficiary(pool[count % pool.length]);
    } else {
      setFormBeneficiary(DEMO_BENEFICIARY);
    }
    go(mode === 'receive' ? 'fundingDetails' : 'bankForm');
  };
  const updateField = (key: string, value: string) =>
    setFormValues((v) => ({ ...v, [key]: value }));
  const addBank = () => {
    if (!pickedCountry || saving) return;
    const country = pickedCountry;
    const pool = country.banks ?? [country.bankName];
    const sameCountry = banks.filter(
      (b) => !('address' in b) && b.country.code === country.code,
    ).length;
    const bank: SavedBank = {
      id: `${country.accountType}-${Date.now()}`,
      country,
      bankName: pool[sameCountry % pool.length],
      values: formValues,
      beneficiary: formBeneficiary,
    };
    setSaving(true);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      if (isSend) setSavedRecipients((r) => [...r, bank]);
      else setSavedBanks((r) => [...r, bank]);
      onLinkExternalAccount?.(
        {
          kind: 'bank',
          accountType: country.accountType,
          currency: currencyFor(country),
          bankName: bank.bankName,
          fields: formValues,
          beneficiary: formBeneficiary,
        },
        isSend ? 'Add recipient' : 'Add bank account',
      );
      setSelectedBankId(bank.id);
      setSaving(false);
      go('amount');
    }, SAVE_MS);
  };

  // Save the pasted crypto address as a recipient, then go to amount.
  const addCryptoRecipient = () => {
    if (saving) return;
    const net = pickedNetwork ?? DEFAULT_SEND_NETWORK;
    const recipient: CryptoRecipient = {
      id: `crypto-${Date.now()}`,
      address: pastedAddress || net.address,
      network: net.name,
      logo: net.logo,
      currency: net.currency,
      accountType: net.accountType,
    };
    setSaving(true);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      setSavedRecipients((r) => [...r, recipient]);
      onLinkExternalAccount?.(
        {
          kind: 'crypto',
          address: recipient.address,
          network: recipient.network,
          accountType: recipient.accountType,
          currency: recipient.currency,
        },
        'Add recipient',
      );
      setSelectedBankId(recipient.id);
      setPasted(false);
      setPastedAddress('');
      setSaving(false);
      go('amount');
    }, SAVE_MS);
  };
  const selectBank = (id: string) => {
    setSelectedBankId(id);
    go('amount');
  };

  // Withdraw-to-crypto: confirm the typed wallet as a one-off destination.
  const useCryptoWithdraw = () => {
    if (saving) return;
    const net = pickedNetwork ?? DEFAULT_SEND_NETWORK;
    const dest: CryptoRecipient = {
      id: `crypto-${Date.now()}`,
      address: pastedAddress || net.address,
      network: net.name,
      logo: net.logo,
      currency: net.currency,
      accountType: net.accountType,
    };
    setSaving(true);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      setCryptoDest(dest);
      onLinkExternalAccount?.(
        {
          kind: 'crypto',
          address: dest.address,
          network: dest.network,
          accountType: dest.accountType,
          currency: dest.currency,
        },
        'Add crypto wallet',
      );
      setSaving(false);
      go('amount');
    }, SAVE_MS);
  };

  // The just-confirmed destination — drives the wallet's Activity row + toast.
  const activityForConfirm = (): TransferActivity =>
    selectedCrypto
      ? {
          kind: 'crypto',
          address: selectedCrypto.address,
          network: selectedCrypto.network,
          logo: selectedCrypto.logo,
        }
      : {
          kind: 'bank',
          countryCode: selectedBank?.country.code ?? 'mx',
          bankName: selectedBank?.bankName ?? 'Bank account',
          last4: selectedBank ? accountLast4(selectedBank.values) : '0000',
          recipientName: selectedBank?.beneficiary ?? '',
        };

  // Back walks the mode's own path.
  const backFrom: Partial<Record<Step, Step>> =
    mode === 'receive'
      ? {
          country: 'deposit',
          fundingDetails: 'country',
        }
      : isSend
        ? {
            confirm: 'amount',
            amount: 'banks',
            bankForm: 'country',
            country: 'source',
            recipient: 'source',
            source: 'banks',
          }
        : {
            confirm: 'amount',
            amount: selectedCrypto ? 'recipient' : 'banks',
            bankForm: 'country',
            country: 'banks',
            recipient: 'source',
            banks: 'source',
            deposit: 'source',
          };
  // The entry step shows the X (close); every other step shows the back arrow.
  const isEntryStep =
    mode === 'receive' ? step === 'deposit' : isSend ? step === 'banks' : step === 'source';

  // Mirrors the Swift KeypadInputModel.handleKey.
  const press = (key: string) => {
    if (confirming) return;
    if (key === 'del') {
      if (!started) {
        setStarted(true);
        setRaw('');
        return;
      }
      setRaw((r) => r.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (!started) {
        setStarted(true);
        setRaw('0.');
        return;
      }
      setRaw((r) => (r.includes('.') ? r : r === '' ? '0.' : `${r}.`));
      return;
    }
    if (!started) {
      setStarted(true);
      setRaw(key);
      return;
    }
    const frac = raw.split('.')[1];
    if (frac !== undefined && frac.length >= 2) return;
    const next = `${raw}${key}`;
    // Cap below $1M (6 whole digits) — reject with the error shake.
    if (next.split('.')[0].length > 6) {
      triggerShake();
      return;
    }
    setRaw(next);
  };

  const cents = typedToCents(raw);

  // Confirm details: mid-market rate + a 0.30% spread fee (the real FX model).
  const FEE_BPS = 30;
  const feeCents = Math.round((cents * FEE_BPS) / 10000);
  const cryptoDetails: Array<[string, string]> = [
    ['Fee', isBtcDest ? formatUsdCents(Math.round(BTC_NETWORK_FEE_USD * 100)) : '$0.60'],
    [
      'Conversion rate',
      isBtcDest ? `1 BTC = ${formatUsdCents(BTC_USD * 100)}` : `1 USD = 1 ${cryptoCurrency}`,
    ],
    [mode === 'withdraw' ? 'Arrives in wallet' : 'Arrives', 'Instantly'],
  ];
  const confirmDetails: Array<[string, string]> = selectedBank
    ? [
        ['Exchange rate', `1 USD = ${formatRate(fxRate)} ${localCurrency}`],
        ['Fee', formatUsdCents(feeCents)],
        [mode === 'add' ? 'Arrives' : 'Arrives in bank', 'Instantly'],
      ]
    : selectedCrypto
      ? cryptoDetails
      : details;

  // "Use max" (withdraw) — fill the typed amount with the exact balance.
  const useMax = () => {
    if (confirming) return;
    setStarted(true);
    setRaw((availableCents / 100).toFixed(2));
  };

  // Continue: invalid amount errors out with a shake; a valid amount "creates a
  // quote" (CTA spins a beat) before the confirm step.
  const tryContinue = () => {
    if (confirming || quoting) return;
    if (cents > 0 && (mode === 'add' || cents <= availableCents)) {
      const dest: TransferDest | undefined = selectedCrypto
        ? { kind: 'crypto', currency: selectedCrypto.currency }
        : selectedBank
          ? { kind: 'bank', currency: localCurrency }
          : undefined;
      onQuote?.(cents, dest);
      setQuoting(true);
      window.clearTimeout(quoteTimer.current);
      quoteTimer.current = window.setTimeout(() => {
        setQuoting(false);
        go('confirm');
      }, QUOTE_MS);
      return;
    }
    triggerShake();
  };

  // Hardware keyboard drives the keypad while the amount step is up.
  useEffect(() => {
    if (!open || step !== 'amount') return;
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === '.') press('.');
      else if (e.key === 'Backspace') press('del');
      else if (e.key === 'Enter') tryContinue();
      else return;
      e.preventDefault();
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, raw, started, confirming]);

  const dismiss = () => {
    if (!confirming) onDismiss();
  };

  // Amount-entry decimals: hidden until the user types the dot ("1500" →
  // "$1,500"); then typed digits solid + remaining placeholders dim. Confirm
  // renders the full cents solid.
  const hasDot = raw.includes('.');
  const fracTyped = raw.split('.')[1] ?? '';
  const amountFraction =
    step === 'confirm'
      ? { hasDot: true, typed: String(cents % 100).padStart(2, '0'), ghost: '' }
      : {
          hasDot,
          typed: fracTyped,
          ghost: hasDot ? '0'.repeat(Math.max(0, 2 - fracTyped.length)) : '',
        };

  // The funding-details step titles itself with the picked country's name.
  const displayTitle =
    step === 'fundingDetails' && pickedCountry
      ? `Receive from ${pickedCountry.name}`
      : titles[step];

  return {
    // flow config (per mode)
    titles,
    sources,
    activeSources,
    details,
    displayTitle,
    // step machine
    step,
    setStep,
    back,
    openKey,
    go,
    backFrom,
    isEntryStep,
    // amount
    raw,
    started,
    cents,
    hasDot,
    fracTyped,
    amountFraction,
    balance,
    press,
    useMax,
    tryContinue,
    quoting,
    shakeNonce,
    // confirm / fx
    feeCents,
    fxRate,
    fxFractionDigits,
    fxLabel,
    localCurrency,
    cryptoCurrency,
    isBtcDest,
    stablecoinDest,
    confirmDetails,
    activityForConfirm,
    // saved banks / recipients
    isSend,
    banks,
    selected,
    selectedBank,
    selectedCrypto,
    setCryptoDest,
    selectedBankId,
    setSelectedBankId,
    selectBank,
    saving,
    addBank,
    addCryptoRecipient,
    useCryptoWithdraw,
    // country picker
    countryQuery,
    setCountryQuery,
    countryQ,
    allCountries,
    popularCountries,
    filteredCountries,
    pickedCountry,
    pickCountry,
    openAddBank,
    // bank form
    formValues,
    setFormValues,
    formBeneficiary,
    setFormBeneficiary,
    updateField,
    // crypto address / network picker
    pasted,
    setPasted,
    pastedAddress,
    setPastedAddress,
    pickerOpen,
    setPickerOpen,
    pickedNetwork,
    setPickedNetwork,
    pickNetwork,
    // receive / deposit
    copiedChainId,
    copyValue,
    shareFunding,
    shareFundingAndReceive,
    // lifecycle
    dismiss,
  };
}

export type MoneySheet = ReturnType<typeof useMoneySheet>;
