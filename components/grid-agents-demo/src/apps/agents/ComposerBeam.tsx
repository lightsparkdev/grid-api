'use client';

import { createContext, useContext, useEffect, useState, type ReactNode, type RefObject } from 'react';
import { BorderBeam, type BorderBeamColorVariant, type BorderBeamSize, type BorderBeamTheme } from 'border-beam';
import { DialRoot, useDialKit, type DialConfig } from 'dialkit';
import 'dialkit/styles.css';

const SIZES: BorderBeamSize[] = ['md', 'sm', 'line', 'pulse-inner', 'pulse-outside'];
const COLORS: BorderBeamColorVariant[] = [
  'global',
  'ocean',
  'colorful',
  'mono',
  'sunset',
  'forest',
  'candy',
  'ice',
  'gold',
];

const DIALS = {
  beam: {
    type: 'select',
    options: [...SIZES, 'off'],
    default: 'md',
  },
  colors: { type: 'select', options: COLORS, default: 'global' },
  theme: { type: 'select', options: ['dark', 'light'], default: 'dark' },
  untilFirstMessage: true,
  shimmer: true,
  look: {
    strength: [1, 0, 1, 0.05],
    brightness: [3, 0, 3, 0.05],
    saturation: [3, 0, 3, 0.05],
    glowSize: [0.2, 0.2, 3, 0.05],
    hueRange: [180, 0, 180, 1],
    staticColors: true,
  },
  timing: {
    duration: [3, 0.5, 10, 0.05],
    on: [0.5, 0.5, 15, 0.5],
    off: [0, 0, 30, 0.5],
  },
} satisfies DialConfig;

type Dials = {
  beam: BorderBeamSize | 'off';
  colors: BorderBeamColorVariant;
  theme: Exclude<BorderBeamTheme, 'auto'>;
  untilFirstMessage: boolean;
  shimmer: boolean;
  look: {
    strength: number;
    brightness: number;
    saturation: number;
    glowSize: number;
    hueRange: number;
    staticColors: boolean;
  };
  timing: { duration: number; on: number; off: number };
};

const DEFAULTS: Dials = {
  beam: 'md',
  colors: 'global',
  theme: 'dark',
  untilFirstMessage: true,
  shimmer: true,
  look: { strength: 1, brightness: 3, saturation: 3, glowSize: 0.2, hueRange: 180, staticColors: true },
  timing: { duration: 3, on: 0.5, off: 0 },
};

const DialsContext = createContext<Dials>(DEFAULTS);

/** The composer's live tuning panel (DialKit; hidden in production builds) and the values every phone reads. */
export function ComposerDials({ children }: { children: ReactNode }) {
  const values = useDialKit('Composer', DIALS, { id: 'composer-beam-v3', persist: true });
  const dials: Dials = {
    ...values,
    beam: values.beam as Dials['beam'],
    colors: values.colors as Dials['colors'],
    theme: values.theme as Dials['theme'],
  };
  return (
    <DialsContext.Provider value={dials}>
      {children}
      <DialRoot position="bottom-right" />
    </DialsContext.Provider>
  );
}

export const useComposerDials = () => useContext(DialsContext);

type Box = { left: number; top: number; width: number; height: number; radius: number };

/**
 * Where the skin's composer pill sits in the composer (CSS px) and its corner radius: the rounded box around the text
 * field. Each skin draws its own pill, so it's found, not configured.
 */
function usePillOutline(host: RefObject<HTMLDivElement>) {
  const [box, setBox] = useState<Box | null>(null);
  // After the commit, not in a layout effect: the composer's ref is attached after its children's layout effects.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const pillOf = () => {
      let pill = el.querySelector('textarea:not([aria-hidden])')?.parentElement;
      while (pill && pill !== el && parseFloat(getComputedStyle(pill).borderTopLeftRadius) < 12)
        pill = pill.parentElement;
      return pill && pill !== el ? pill : null;
    };
    let found: HTMLElement | null = null;
    const ro = new ResizeObserver(() => measure());
    const measure = () => {
      if (!found) return;
      const h = el.getBoundingClientRect();
      const r = found.getBoundingClientRect();
      // The phone is scaled to fit the page; positions inside it are in its own px.
      const scale = h.width / el.offsetWidth || 1;
      setBox({
        left: (r.left - h.left) / scale,
        top: (r.top - h.top) / scale,
        width: r.width / scale,
        height: r.height / scale,
        radius: parseFloat(getComputedStyle(found).borderTopLeftRadius),
      });
    };
    // The skin's field can arrive after the first paint (and a skin can redraw its pill): look again when it does.
    const look = () => {
      const pill = pillOf();
      if (!pill || pill === found) return;
      found = pill;
      ro.disconnect();
      ro.observe(pill);
      ro.observe(el);
      measure();
    };
    look();
    const mo = new MutationObserver(look);
    mo.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    return () => {
      mo.disconnect();
      ro.disconnect();
    };
  }, [host]);
  return box;
}

/** On for `on` seconds, off for `off`, repeating while active; always on when `off` is 0. */
function useCycle(on: number, off: number, active: boolean) {
  const [lit, setLit] = useState(false);
  useEffect(() => {
    if (!active) return setLit(false);
    if (off <= 0) return setLit(true);
    let state = false;
    let timer = 0;
    const step = () => {
      state = !state;
      setLit(state);
      timer = window.setTimeout(step, (state ? on : off) * 1000);
    };
    timer = window.setTimeout(step, 600);
    return () => window.clearTimeout(timer);
  }, [on, off, active]);
  return lit;
}

/**
 * Border Beam (libraries.dev/beam) laid over the composer pill, fading in and out on a cycle. It sits on the pill's
 * box rather than wrapping it, so no skin changes; the pointer passes through to the field.
 */
export function ComposerBeam({ host, fresh }: { host: RefObject<HTMLDivElement>; fresh: boolean }) {
  const dials = useComposerDials();
  const box = usePillOutline(host);
  const active = dials.beam !== 'off' && (!dials.untilFirstMessage || fresh);
  const lit = useCycle(dials.timing.on, dials.timing.off, active);
  if (!box || dials.beam === 'off') return null;
  const radius = Math.min(box.radius, box.height / 2, box.width / 2);
  return (
    <BorderBeam
      aria-hidden
      size={dials.beam}
      colorVariant={dials.colors}
      theme={dials.theme}
      active={lit}
      borderRadius={radius}
      duration={dials.timing.duration}
      strength={dials.look.strength}
      brightness={dials.look.brightness}
      saturation={dials.look.saturation}
      glowSize={dials.look.glowSize}
      hueRange={dials.look.hueRange}
      staticColors={dials.look.staticColors}
      style={{
        position: 'absolute',
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <div style={{ width: '100%', height: '100%' }} />
    </BorderBeam>
  );
}
