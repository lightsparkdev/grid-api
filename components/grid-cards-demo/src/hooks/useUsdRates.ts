'use client';

// Live USD -> currency mid-market rates from Coinbase's public exchange-rates
// endpoint (no key, CORS-open). Cached ~5 min at module scope and shared across
// the app. Purely for display: the wallet shows the mid-market rate and adds
// Grid's spread as a fee on the confirm screen. Every caller passes a static
// fallback (the baked-in usdToLocal numbers) so the demo never breaks offline or
// behind a strict CSP, and nothing here ever throws.
//
// TODO(fx-source): swap Coinbase -> Grid's own public (unauthenticated) rates
// once corridor coverage is confirmed with the team. It's the spec's documented
// GET /exchange-rates (operationId getExchangeRates), no-auth `/public/` variant:
//   GET https://api.lightspark.com/grid/2025-10-13/public/exchange-rates
//        ?sourceCurrency=USD&destinationCurrency=INR&sendingAmount=<cents>
//   data[] -> { exchangeRate (SOURCE per DEST, so 1 USD = 1/exchangeRate),
//               fees.fixed (source cents), receivingAmount (dest minor units),
//               destinationCurrency.{code,decimals,symbol}, destinationPaymentRail }
// Upsides: real Grid rates + real fees (drop the fabricated 30 bps), and because
// it's spec-faithful we could then log GET /exchange-rates in the API panel.
// Caveat: as of 2026-06 it returns only 35 BANK_TRANSFER currencies from USD, so
// the long-tail countries would still need this static fallback (or a hybrid:
// Grid where covered, Coinbase elsewhere).

import { useEffect, useState } from 'react';

const COINBASE_URL = 'https://api.coinbase.com/v2/exchange-rates?currency=USD';
const TTL_MS = 5 * 60 * 1000;

let cache: Record<string, number> | null = null;
let cachedAt = 0;
let inflight: Promise<Record<string, number> | null> | null = null;

async function loadUsdRates(): Promise<Record<string, number> | null> {
  if (cache && Date.now() - cachedAt < TTL_MS) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(COINBASE_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const raw = json?.data?.rates as Record<string, string> | undefined;
      if (!raw) throw new Error('no rates in response');
      const rates: Record<string, number> = {};
      for (const [code, value] of Object.entries(raw)) {
        const n = Number(value);
        if (Number.isFinite(n) && n > 0) rates[code] = n;
      }
      cache = rates;
      cachedAt = Date.now();
      return rates;
    } catch {
      return null; // callers fall back to their static rate
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function useUsdRates() {
  const [rates, setRates] = useState<Record<string, number> | null>(cache);
  useEffect(() => {
    let active = true;
    void loadUsdRates().then((r) => {
      if (active && r) setRates(r);
    });
    return () => {
      active = false;
    };
  }, []);
  return {
    /** Mid-market units of `currency` per 1 USD; `fallback` until/unless live. */
    rateFor: (currency: string, fallback: number) => rates?.[currency] ?? fallback,
    live: rates !== null,
  };
}
