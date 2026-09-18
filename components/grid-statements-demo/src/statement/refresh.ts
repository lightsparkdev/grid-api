import type { PresetId } from './presets';
import type { StatementVariant } from './types';

export interface ApiRefreshSelection {
  variant: StatementVariant;
  periodId: string;
  presetSequence: number;
}

export type StatementControlEvent =
  | { type: 'account'; value: StatementVariant }
  | { type: 'period'; value: string }
  | { type: 'preset'; value: PresetId }
  | { type: 'companyName'; value: string }
  | { type: 'logo'; value: string | null }
  | { type: 'color'; value: string };

export function apiRefreshSelectionAfter(
  current: ApiRefreshSelection,
  event: StatementControlEvent,
): ApiRefreshSelection {
  switch (event.type) {
    case 'account':
      return { ...current, variant: event.value };
    case 'period':
      return { ...current, periodId: event.value };
    case 'preset':
      return { ...current, presetSequence: current.presetSequence + 1 };
    case 'companyName':
    case 'logo':
    case 'color':
      return current;
    default: {
      const exhaustive: never = event;
      return exhaustive;
    }
  }
}

export function apiRefreshKey(selection: ApiRefreshSelection): string {
  return `${selection.variant}:${selection.periodId}:${selection.presetSequence}`;
}
