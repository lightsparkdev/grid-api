'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DEV_APP_TOOLS,
  STORAGE_FIXTURE,
  STORAGE_UI_VARIANT,
  type PhoneUiVariant,
} from '@/dev/appDev';
import { PHONE_PREVIEW_FIXTURE_IDS } from '@/dev/phonePreview/fixtures';

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}

export function useAppDevState() {
  const [fixtureId, setFixtureIdState] = useState('live');
  const [uiVariant, setUiVariantState] = useState<PhoneUiVariant>('slop');
  useEffect(() => {
    if (!DEV_APP_TOOLS) return;
    const storedFixture = readStorage(STORAGE_FIXTURE, 'live');
    const storedVariant = readStorage<PhoneUiVariant>(STORAGE_UI_VARIANT, 'slop');
    setFixtureIdState(
      PHONE_PREVIEW_FIXTURE_IDS.has(storedFixture) ? storedFixture : 'live',
    );
    setUiVariantState(storedVariant === 'swag' ? 'swag' : 'slop');
  }, []);

  const setFixtureId = useCallback((id: string) => {
    setFixtureIdState(id);
    writeStorage(STORAGE_FIXTURE, id);
  }, []);

  const setUiVariant = useCallback((variant: PhoneUiVariant) => {
    setUiVariantState(variant);
    writeStorage(STORAGE_UI_VARIANT, variant);
  }, []);

  return {
    enabled: DEV_APP_TOOLS,
    fixtureId,
    setFixtureId,
    uiVariant,
    setUiVariant,
    previewActive: DEV_APP_TOOLS && fixtureId !== 'live',
  };
}
