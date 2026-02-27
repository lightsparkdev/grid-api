import { useReducer, useCallback, useMemo } from 'react';
import { currencies } from '@/data/currencies';
import { cryptoAssets, type CryptoAccountType } from '@/data/crypto';
import type { CurrencySelection } from '@/lib/code-generator';

export type { CurrencySelection };

export interface FlowBuilderState {
  send: CurrencySelection | null;
  receive: CurrencySelection | null;
  sourceRegion: string | null; // fiat code e.g. 'USD' — only used when source is crypto
  destRegion: string | null;   // fiat code — only used when destination is crypto
  jitFunding: boolean;
  audience: 'human' | 'agent';
  pickerTarget: 'send' | 'receive' | null;
}

type Action =
  | { type: 'SET_SEND'; payload: CurrencySelection }
  | { type: 'SET_RECEIVE'; payload: CurrencySelection }
  | { type: 'SET_SEND_NETWORK'; payload: CryptoAccountType }
  | { type: 'SET_RECEIVE_NETWORK'; payload: CryptoAccountType }
  | { type: 'TOGGLE_SEND_INTERNAL' }
  | { type: 'TOGGLE_RECEIVE_INTERNAL' }
  | { type: 'SET_SOURCE_REGION'; payload: string }
  | { type: 'SET_DEST_REGION'; payload: string }
  | { type: 'SET_JIT_FUNDING'; payload: boolean }
  | { type: 'SET_AUDIENCE'; payload: 'human' | 'agent' }
  | { type: 'OPEN_PICKER'; payload: 'send' | 'receive' }
  | { type: 'CLOSE_PICKER' }
  | { type: 'SWAP' }
  | { type: 'RESET' };

const initialState: FlowBuilderState = {
  send: null,
  receive: null,
  sourceRegion: null,
  destRegion: null,
  jitFunding: true,
  audience: 'human',
  pickerTarget: null,
};

function toggleInternal(sel: CurrencySelection): CurrencySelection {
  const isNowInternal = !sel.isInternal;
  if (isNowInternal) {
    return {
      ...sel,
      isInternal: true,
      accountLabel: `Grid ${sel.code} Account`,
    };
  }
  // Restore external label
  if (sel.type === 'fiat') {
    const fiat = currencies.find((c) => c.code === sel.code);
    return {
      ...sel,
      isInternal: false,
      accountLabel: fiat?.accountLabel ?? sel.accountLabel,
    };
  }
  const crypto = cryptoAssets.find((a) => a.symbol === sel.code);
  const acct = crypto?.accountTypes.find((at) => at.type === sel.accountType);
  return {
    ...sel,
    isInternal: false,
    accountLabel: acct?.label ?? sel.accountLabel,
  };
}

function reducer(state: FlowBuilderState, action: Action): FlowBuilderState {
  switch (action.type) {
    case 'SET_SEND': {
      const send = action.payload;
      const jitFunding = send.jitEligible ? state.jitFunding : false;
      // Region determines Grid Switch assignment for crypto sources.
      // Crypto is global — Grid doesn't know the user's region from the currency alone.
      // We ask the user to pick their region, which determines which Grid Switch they're assigned to.
      let sourceRegion: string | null = null;
      if (send.type === 'crypto') {
        sourceRegion = state.sourceRegion ?? null; // will trigger region picker
      }
      return { ...state, send, jitFunding, sourceRegion, pickerTarget: null };
    }
    case 'SET_RECEIVE': {
      const receive = action.payload;
      const destRegion = receive.type === 'crypto'
        ? (receive.code === 'BTC' ? (state.destRegion ?? null) : 'USD')
        : null;
      return { ...state, receive, destRegion, pickerTarget: null };
    }
    case 'SET_SEND_NETWORK': {
      if (!state.send) return state;
      const acct = action.payload;
      return {
        ...state,
        send: {
          ...state.send,
          accountType: acct.type,
          accountLabel: acct.label,
          network: acct.network,
        },
      };
    }
    case 'SET_RECEIVE_NETWORK': {
      if (!state.receive) return state;
      const acct = action.payload;
      return {
        ...state,
        receive: {
          ...state.receive,
          accountType: acct.type,
          accountLabel: acct.label,
          network: acct.network,
        },
      };
    }
    case 'TOGGLE_SEND_INTERNAL': {
      if (!state.send) return state;
      const toggled = toggleInternal(state.send);
      return { ...state, send: toggled };
    }
    case 'TOGGLE_RECEIVE_INTERNAL': {
      if (!state.receive) return state;
      const toggled = toggleInternal(state.receive);
      return { ...state, receive: toggled };
    }
    case 'SET_SOURCE_REGION':
      return { ...state, sourceRegion: action.payload };
    case 'SET_DEST_REGION':
      return { ...state, destRegion: action.payload };
    case 'SET_JIT_FUNDING':
      return { ...state, jitFunding: action.payload };
    case 'SET_AUDIENCE':
      return { ...state, audience: action.payload };
    case 'OPEN_PICKER':
      return { ...state, pickerTarget: action.payload };
    case 'CLOSE_PICKER':
      return { ...state, pickerTarget: null };
    case 'SWAP': {
      return {
        ...state,
        send: state.receive,
        receive: state.send,
        sourceRegion: state.destRegion,
        destRegion: state.sourceRegion,
      };
    }
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function lookupCurrency(code: string): CurrencySelection | null {
  const fiat = currencies.find((c) => c.code === code);
  if (fiat) {
    return {
      code: fiat.code,
      type: 'fiat',
      name: fiat.name,
      accountType: fiat.accountType,
      accountLabel: fiat.accountLabel,
      countryCode: fiat.countryCode,
      jitEligible: fiat.instantRails.length > 0,
      isInternal: false,
      examplePerson: fiat.examplePerson,
    };
  }
  const crypto = cryptoAssets.find((a) => a.symbol === code);
  if (crypto) {
    const defaultAcct = crypto.accountTypes[0];
    return {
      code: crypto.symbol,
      type: 'crypto',
      name: crypto.name,
      accountType: defaultAcct.type,
      accountLabel: defaultAcct.label,
      network: defaultAcct.network,
      jitEligible: true,
      isInternal: false,
      examplePerson: crypto.examplePerson,
    };
  }
  return null;
}

export function useFlowBuilder() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const isComplete = useMemo(
    () => state.send !== null && state.receive !== null,
    [state.send, state.receive],
  );

  const fundingModel = useMemo((): 'jit' | 'pre-funded' => {
    if (!state.send) return 'pre-funded';
    if (!state.send.jitEligible) return 'pre-funded';
    return state.jitFunding ? 'jit' : 'pre-funded';
  }, [state.send, state.jitFunding]);

  const setSend = useCallback(
    (sel: CurrencySelection) => dispatch({ type: 'SET_SEND', payload: sel }),
    [],
  );

  const setReceive = useCallback(
    (sel: CurrencySelection) => dispatch({ type: 'SET_RECEIVE', payload: sel }),
    [],
  );

  const setSendNetwork = useCallback(
    (acct: CryptoAccountType) => dispatch({ type: 'SET_SEND_NETWORK', payload: acct }),
    [],
  );

  const setReceiveNetwork = useCallback(
    (acct: CryptoAccountType) => dispatch({ type: 'SET_RECEIVE_NETWORK', payload: acct }),
    [],
  );

  const toggleSendInternal = useCallback(
    () => dispatch({ type: 'TOGGLE_SEND_INTERNAL' }),
    [],
  );

  const toggleReceiveInternal = useCallback(
    () => dispatch({ type: 'TOGGLE_RECEIVE_INTERNAL' }),
    [],
  );

  const setSourceRegion = useCallback(
    (code: string) => dispatch({ type: 'SET_SOURCE_REGION', payload: code }),
    [],
  );

  const setDestRegion = useCallback(
    (code: string) => dispatch({ type: 'SET_DEST_REGION', payload: code }),
    [],
  );

  const setJitFunding = useCallback(
    (on: boolean) => dispatch({ type: 'SET_JIT_FUNDING', payload: on }),
    [],
  );

  const setAudience = useCallback(
    (audience: 'human' | 'agent') =>
      dispatch({ type: 'SET_AUDIENCE', payload: audience }),
    [],
  );

  const openPicker = useCallback(
    (target: 'send' | 'receive') =>
      dispatch({ type: 'OPEN_PICKER', payload: target }),
    [],
  );

  const closePicker = useCallback(() => dispatch({ type: 'CLOSE_PICKER' }), []);

  const swap = useCallback(() => dispatch({ type: 'SWAP' }), []);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    isComplete,
    fundingModel,
    setSend,
    setReceive,
    setSendNetwork,
    setReceiveNetwork,
    toggleSendInternal,
    toggleReceiveInternal,
    setSourceRegion,
    setDestRegion,
    setJitFunding,
    setAudience,
    openPicker,
    swap,
    closePicker,
    reset,
  };
}
