import { useEffect, useState } from 'react';
import type { AgentAsk } from '../conversation';
import { PERSON } from '../story';

const SAVE_MS = 800;
const SAVED_MS = 600;

export interface CardField {
  key: string;
  label: string;
  value: string;
}

/** The card's details, filled in the way the person's password manager would. */
export function cardFields(ask: AgentAsk): CardField[] {
  const last4 = ask.card?.last4 ?? '4242';
  const [mm, yy] = (ask.card?.expires ?? '09/29').split('/');
  return [
    { key: 'number', label: 'Card number', value: `4242 4242 4242 ${last4}` },
    { key: 'expiry', label: 'Expiry (MM/YY)', value: `${mm} / ${yy}` },
    { key: 'cvc', label: 'Security code', value: '•••' },
    { key: 'name', label: 'Name on card', value: ask.card?.name ?? PERSON.full },
    { key: 'zip', label: 'Billing ZIP', value: '90405' },
  ];
}

export const cardLabel = (ask: AgentAsk) => `Visa •••• ${ask.card?.last4 ?? '4242'}`;

export type CardStage = 'form' | 'saving' | 'saved';

/** Saving the card: a beat of saving, a beat of saved, then the agent hears it's in the vault. */
export function useCardEntry(onSaved: () => void) {
  const [stage, setStage] = useState<CardStage>('form');
  useEffect(() => {
    if (stage === 'form') return;
    const t = window.setTimeout(() => (stage === 'saving' ? setStage('saved') : onSaved()), stage === 'saving' ? SAVE_MS : SAVED_MS);
    return () => window.clearTimeout(t);
  }, [stage, onSaved]);
  return {
    stage,
    busy: stage !== 'form',
    save: () => setStage((s) => (s === 'form' ? 'saving' : s)),
  };
}
