import { useReducer, useCallback, useMemo } from 'react';
import { currencies } from '@/data/currencies';
import { cryptoAssets, type CryptoAccountType } from '@/data/crypto';
import type { CurrencySelection } from '@/lib/code-generator';

export type { CurrencySelection };

export type SourceFundingMode = 'internal' | 'external' | 'realtime';

export interface FlowBuilderState {
  send: CurrencySelection | null;
  receive: CurrencySelection | null;
  sourceRegion: string | null; // fiat code e.g. 'USD' — only used when source is crypto
  destRegion: string | null;   // fiat code — only used when destination is crypto
  sourceFundingMode: SourceFundingMode;
  audience: 'human' | 'agent';
  pickerTarget: 'send' | 'receive' | null;
}

type Action =
  | { type: 'SET_SEND'; payload: CurrencySelection }
  | { type: 'SET_RECEIVE'; payload: CurrencySelection }
  | { type: 'SET_SEND_NETWORK'; payload: CryptoAccountType }
  | { type: 'SET_RECEIVE_NETWORK'; payload: CryptoAccountType }
  | { type: 'SET_SOURCE_FUNDING_MODE'; payload: SourceFundingMode }
  | { type: 'SET_SOURCE_REGION'; payload: string }
  | { type: 'SET_DEST_REGION'; payload: string }
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
  sourceFundingMode: 'external',
  audience: 'human',
  pickerTarget: null,
};

function reducer(state: FlowBuilderState, action: Action): FlowBuilderState {
  switch (action.type) {
    case 'SET_SEND': {
      const send = action.payload;
      const sourceFundingMode: SourceFundingMode = send.type === 'crypto'
        ? 'realtime'
        : 'external';
      const sourceRegion = send.type === 'crypto' ? (state.sourceRegion ?? 'USD') : null;
      return { ...state, send, sourceFundingMode, sourceRegion, pickerTarget: null };
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
    case 'SET_SOURCE_FUNDING_MODE': {
      if (!state.send) return state;
      const mode = action.payload;
      const isNowInternal = mode === 'internal';
      let send: CurrencySelection;
      if (isNowInternal) {
        send = { ...state.send, isInternal: true, accountLabel: `Grid ${state.send.code} Account` };
      } else {
        if (state.send.type === 'fiat') {
          const fiat = currencies.find((c) => c.code === state.send!.code);
          send = { ...state.send, isInternal: false, accountLabel: fiat?.accountLabel ?? state.send.accountLabel };
        } else {
          const crypto = cryptoAssets.find((a) => a.symbol === state.send!.code);
          const acct = crypto?.accountTypes.find((at) => at.type === state.send!.accountType);
          send = { ...state.send, isInternal: false, accountLabel: acct?.label ?? state.send.accountLabel };
        }
      }
      return { ...state, send, sourceFundingMode: mode };
    }
    case 'SET_SOURCE_REGION':
      return { ...state, sourceRegion: action.payload };
    case 'SET_DEST_REGION':
      return { ...state, destRegion: action.payload };
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
    return state.sourceFundingMode === 'realtime' ? 'jit' : 'pre-funded';
  }, [state.sourceFundingMode]);

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

  const setSourceFundingMode = useCallback(
    (mode: SourceFundingMode) => dispatch({ type: 'SET_SOURCE_FUNDING_MODE', payload: mode }),
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
    setSourceFundingMode,
    setSourceRegion,
    setDestRegion,
    setAudience,
    openPicker,
    swap,
    closePicker,
    reset,
  };
}
