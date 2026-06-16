import type { ComponentType } from 'react';
import type { AuthMethod, Persona } from '@/data/flow';
import type { AppSkinId } from '@/apps/skins';

/** Per-skin content + brand strings. Layout/visuals live in the skin's screens +
 *  skin.scss tokens; this is the copy/data they read. */
export interface SkinConfig {
  brand: { name: string; tagline: string; logoSrc: string };
  auth: {
    headline: string;
    subhead: string;
    /** Marquee rows (categories + titles) for the auth hero. */
    marquee: string[][];
  };
}

/** Props every skin's AuthScreen receives (mirrors AuroraAuthScreen + config). */
export interface SkinAuthScreenProps {
  busy?: boolean;
  methods: AuthMethod[];
  dismissed?: boolean;
  leaving?: boolean;
  onSignIn: (method: AuthMethod) => void;
  config: SkinConfig;
}

/** A registry entry = a skin's auth screen + its config. (HomeScreen is v2 — v1
 *  lands on the reskinned Aurora home.) */
export interface SkinEntry {
  id: AppSkinId;
  persona: Persona;
  config: SkinConfig;
  AuthScreen: ComponentType<SkinAuthScreenProps>;
  /** Screen-aligned copy the OTP notification refracts (the skin's static field). */
  NotifField?: ComponentType;
}
