/**
 * Interaction sounds for the Grid playgrounds. One file, no imports, so it
 * copies unchanged between grid-cards-demo, grid-wallet-demo, and the
 * website's grid-visualizer (whose `utils/sounds.ts` this supersedes: the
 * `playTick`, `playTickBright`, and `playPress` exports are kept).
 *
 * Two kinds of cue. The small ones (hover tick, press, snap, decline) are
 * synthesized live with Web Audio; the rich ones (approval, Apple Pay,
 * lock, notification, key click) are short samples in `/assets/sounds/`,
 * built by `scripts/build-sounds.sh`. Every sampled cue has a synthesized
 * stand-in that plays until its sample has decoded, or when the asset is
 * missing, so nothing depends on the files being there. Besides the cues
 * there are two continuous voices the caller writes into every frame:
 * `airflow()` for something turning through the air (the card's turn-over)
 * and `grain()` for a surface laid down as a dither behind a moving front
 * (the card's material change).
 *
 * Rules, in the order `play` applies them: nothing during SSR; nothing
 * while muted (`localStorage['ls-demo-sounds-muted']`, shared across the
 * playgrounds); nothing while the tab is hidden; one cue per name per
 * minimum gap, so a sweep across a row of tiles cannot machine-gun; and
 * nothing before the browser allows sound in this window, which is the
 * first gesture here, or an activation the parent page delegated to the
 * iframe through `allow="autoplay"` (so the intro can sound when the
 * visitor clicked their way to the docs page, and stays silent on a cold
 * load). A play blocked that way is dropped, never fired late on the first
 * click. Hover cues also require a real pointer: `(hover: hover) and
 * (pointer: fine)` and `pointerType === 'mouse'`.
 *
 * The AudioContext is built during idle time and resumed on the first
 * gesture, so the first press only pays a cheap `resume()`: building the
 * context inside the gesture froze it for hundreds of ms.
 *
 * Levels: `press` is the reference. Hovers sit about 30 dB under it; the
 * sampled cues peak at -3 dBFS on disk and are scaled here. A compressor
 * on the master bus keeps overlapping cues from clipping.
 *
 * The synthesis (`press`, the tone and noise layers) is vendored from
 * cuelume v0.1.2 (https://cuelume.dev), carved down to what the cues use.
 *
 * MIT License — Copyright (c) 2026 Daniel Belyi
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, subject to including the above copyright notice
 * and this permission notice in all copies or substantial portions
 * of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY
 * OF ANY KIND.
 */

export type SoundName =
  /** Hover over anything that can be pressed. Very quiet. */
  | 'tick'
  /** A brighter tick: toggles, tabs, swatches. */
  | 'tickBright'
  /** A guide caught during a drag. Quieter than `tick`. */
  | 'snap'
  /** A press, a click, a select. The reference level. */
  | 'press'
  /** A lower press: Remove, Close card. */
  | 'pressLow'
  /** Keyboard-driven text and nudges. Sampled iOS key click. */
  | 'keyClick'
  /** A short thin swish (a sheet turning), synthesized. The card uses `airflow()` instead. */
  | 'swish'
  /** A declined purchase: a short low double. */
  | 'decline'
  /** The lock seating on the card (Apple's lock click). */
  | 'lock'
  /** The lock leaving. The same click, quieter. */
  | 'unlock'
  /** A push notification landing (iOS "Rebound"). */
  | 'notify'
  /** Card issued, added to wallet. */
  | 'success'
  /** A tap-to-pay approved (the Apple Pay chime). */
  | 'approved'
  /** A light rising whoosh (the intro's card arriving). */
  | 'whoosh';

// ── Levels and sources ────────────────────────────────────────────────────────

/** Where `scripts/build-sounds.sh` writes the samples, relative to the app origin. */
const ASSET_BASE = '/assets/sounds/';

/** Sampled cues: the file (without extension; `.m4a` first, `.mp3` fallback)
 *  and the gain applied to it. Files peak at -3 dBFS. */
const SAMPLES: Partial<Record<SoundName, { file: string; gain: number }>> = {
  keyClick: { file: 'keyclick', gain: 0.14 },
  lock: { file: 'lock', gain: 0.3 },
  unlock: { file: 'lock', gain: 0.2 },
  notify: { file: 'notify', gain: 0.22 },
  success: { file: 'approval', gain: 0.42 },
  approved: { file: 'applepay', gain: 0.36 },
  whoosh: { file: 'whoosh', gain: 0.32 },
};

/** The least time between two plays of the same cue, ms. */
const MIN_GAP_MS: Partial<Record<SoundName, number>> = {
  tick: 60,
  tickBright: 60,
  snap: 80,
  keyClick: 25,
  notify: 400,
  success: 400,
  approved: 400,
};
const DEFAULT_GAP_MS = 30;

/** The mute flag, shared by the playgrounds. No control renders it yet. */
const MUTE_KEY = 'ls-demo-sounds-muted';

// ── Synthesis ─────────────────────────────────────────────────────────────────

type ToneLayer = {
  kind: 'tone';
  waveform: OscillatorType;
  frequency: number;
  attack: number;
  decay: number;
  peak: number;
  offset?: number;
};

type NoiseLayer = {
  kind: 'noise';
  filterType: BiquadFilterType;
  filterFrequency: number;
  /** The filter glides to this frequency over the layer (a swish). */
  filterSweepTo?: number;
  filterQ?: number;
  attack: number;
  decay: number;
  peak: number;
  offset?: number;
};

/** The production site's tick: a 5 ms noise burst with per-sample
 *  exponential decay through a narrow bandpass, randomly detuned up to
 *  +600 Hz per play so runs of ticks shimmer instead of machine-gunning. */
type TickLayer = {
  kind: 'tick';
  frequency: number;
  peak: number;
  offset?: number;
};

type Layer = ToneLayer | NoiseLayer | TickLayer;

type Recipe = {
  masterGain: number;
  layers: Layer[];
};

const SYNTH: Record<SoundName, Recipe> = {
  tick: { masterGain: 1, layers: [{ kind: 'tick', frequency: 1400, peak: 0.12 }] },
  tickBright: { masterGain: 1, layers: [{ kind: 'tick', frequency: 5200, peak: 0.12 }] },
  snap: { masterGain: 1, layers: [{ kind: 'tick', frequency: 2400, peak: 0.07 }] },
  /** cuelume's press: a dull, muted knock, like a key bottoming out. */
  press: {
    masterGain: 0.4,
    layers: [
      { kind: 'noise', filterType: 'bandpass', filterFrequency: 1700, filterQ: 1.4, attack: 0.001, decay: 0.02, peak: 0.13 },
    ],
  },
  pressLow: {
    masterGain: 0.5,
    layers: [
      { kind: 'noise', filterType: 'bandpass', filterFrequency: 750, filterQ: 1.2, attack: 0.001, decay: 0.035, peak: 0.16 },
    ],
  },
  keyClick: {
    masterGain: 0.35,
    layers: [
      { kind: 'noise', filterType: 'bandpass', filterFrequency: 3200, filterQ: 3, attack: 0.001, decay: 0.008, peak: 0.12 },
      { kind: 'tone', waveform: 'sine', frequency: 1900, attack: 0.001, decay: 0.012, peak: 0.06 },
    ],
  },
  swish: {
    masterGain: 0.3,
    layers: [
      {
        kind: 'noise',
        filterType: 'bandpass',
        filterFrequency: 900,
        filterSweepTo: 2400,
        filterQ: 0.8,
        attack: 0.03,
        decay: 0.11,
        peak: 0.12,
      },
    ],
  },
  decline: {
    masterGain: 0.5,
    layers: [
      { kind: 'tone', waveform: 'triangle', frequency: 196, attack: 0.004, decay: 0.05, peak: 0.25 },
      { kind: 'tone', waveform: 'triangle', frequency: 165, attack: 0.004, decay: 0.06, peak: 0.25, offset: 0.095 },
    ],
  },
  lock: {
    masterGain: 0.45,
    layers: [
      { kind: 'noise', filterType: 'bandpass', filterFrequency: 900, filterQ: 2, attack: 0.001, decay: 0.018, peak: 0.14 },
      { kind: 'noise', filterType: 'bandpass', filterFrequency: 1300, filterQ: 2, attack: 0.001, decay: 0.014, peak: 0.12, offset: 0.045 },
    ],
  },
  unlock: {
    masterGain: 0.35,
    layers: [
      { kind: 'noise', filterType: 'bandpass', filterFrequency: 1300, filterQ: 2, attack: 0.001, decay: 0.014, peak: 0.12 },
      { kind: 'noise', filterType: 'bandpass', filterFrequency: 900, filterQ: 2, attack: 0.001, decay: 0.018, peak: 0.14, offset: 0.045 },
    ],
  },
  notify: {
    masterGain: 0.35,
    layers: [
      { kind: 'tone', waveform: 'sine', frequency: 1046, attack: 0.003, decay: 0.18, peak: 0.2 },
      { kind: 'tone', waveform: 'sine', frequency: 2093, attack: 0.003, decay: 0.1, peak: 0.05 },
    ],
  },
  success: {
    masterGain: 0.35,
    layers: [
      { kind: 'tone', waveform: 'sine', frequency: 659, attack: 0.005, decay: 0.35, peak: 0.2 },
      { kind: 'tone', waveform: 'sine', frequency: 1318, attack: 0.005, decay: 0.2, peak: 0.05 },
      { kind: 'tone', waveform: 'sine', frequency: 988, attack: 0.005, decay: 0.4, peak: 0.2, offset: 0.12 },
      { kind: 'tone', waveform: 'sine', frequency: 1976, attack: 0.005, decay: 0.2, peak: 0.05, offset: 0.12 },
    ],
  },
  approved: {
    masterGain: 0.35,
    layers: [
      { kind: 'tone', waveform: 'sine', frequency: 784, attack: 0.005, decay: 0.3, peak: 0.2 },
      { kind: 'tone', waveform: 'sine', frequency: 1175, attack: 0.005, decay: 0.4, peak: 0.2, offset: 0.1 },
      { kind: 'tone', waveform: 'sine', frequency: 2349, attack: 0.005, decay: 0.2, peak: 0.05, offset: 0.1 },
    ],
  },
  /** Stand-in: a swell of noise rising through a lowpass. */
  whoosh: {
    masterGain: 0.35,
    layers: [
      {
        kind: 'noise',
        filterType: 'lowpass',
        filterFrequency: 300,
        filterSweepTo: 2200,
        filterQ: 1,
        attack: 0.35,
        decay: 0.45,
        peak: 0.2,
      },
    ],
  },
};

const SOURCE_STOP_PADDING = 0.05;
const CLEANUP_MARGIN = 0.05;

function renderTone(context: AudioContext, destination: AudioNode, layer: ToneLayer, startTime: number) {
  const oscillator = context.createOscillator();
  oscillator.type = layer.waveform;
  oscillator.frequency.setValueAtTime(layer.frequency, startTime);

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(layer.peak, startTime + layer.attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + layer.attack + layer.decay);

  oscillator.connect(gain).connect(destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + layer.attack + layer.decay + SOURCE_STOP_PADDING);
}

function renderNoise(context: AudioContext, destination: AudioNode, layer: NoiseLayer, startTime: number) {
  const duration = layer.attack + layer.decay + SOURCE_STOP_PADDING;
  const length = Math.max(1, Math.floor(duration * context.sampleRate));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = 2 * Math.random() - 1;

  const source = context.createBufferSource();
  source.buffer = buffer;

  const filter = context.createBiquadFilter();
  filter.type = layer.filterType;
  filter.frequency.setValueAtTime(layer.filterFrequency, startTime);
  if (layer.filterSweepTo !== undefined) {
    filter.frequency.exponentialRampToValueAtTime(layer.filterSweepTo, startTime + layer.attack + layer.decay);
  }
  if (layer.filterQ !== undefined) filter.Q.value = layer.filterQ;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(layer.peak, startTime + layer.attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + layer.attack + layer.decay);

  source.connect(filter).connect(gain).connect(destination);
  source.start(startTime);
  source.stop(startTime + duration);
}

function renderTick(context: AudioContext, destination: AudioNode, layer: TickLayer, startTime: number) {
  const duration = 0.005;
  const length = Math.ceil(context.sampleRate * duration);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 20);
  }

  const source = context.createBufferSource();
  source.buffer = buffer;

  const filter = context.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = layer.frequency + Math.random() * 600;
  filter.Q.value = 5;

  const gain = context.createGain();
  gain.gain.setValueAtTime(layer.peak, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.006);

  source.connect(filter).connect(gain).connect(destination);
  source.start(startTime);
  source.stop(startTime + 0.06);
}

/** How long a layer sounds, from the recipe's start. */
function layerEnd(layer: Layer): number {
  const offset = layer.offset ?? 0;
  if (layer.kind === 'tick') return offset + 0.06;
  return offset + layer.attack + layer.decay + SOURCE_STOP_PADDING;
}

function renderRecipe(context: AudioContext, destination: AudioNode, recipe: Recipe, gain: number) {
  const now = context.currentTime;
  const master = context.createGain();
  master.gain.value = recipe.masterGain * gain;
  master.connect(destination);

  let end = 0;
  for (const layer of recipe.layers) {
    const startTime = now + (layer.offset ?? 0);
    if (layer.kind === 'tone') renderTone(context, master, layer, startTime);
    else if (layer.kind === 'noise') renderNoise(context, master, layer, startTime);
    else renderTick(context, master, layer, startTime);
    end = Math.max(end, layerEnd(layer));
  }

  setTimeout(() => master.disconnect(), (end + CLEANUP_MARGIN) * 1000);
}

function renderSample(context: AudioContext, destination: AudioNode, buffer: AudioBuffer, gain: number) {
  const source = context.createBufferSource();
  source.buffer = buffer;
  const level = context.createGain();
  level.gain.value = gain;
  source.connect(level).connect(destination);
  source.onended = () => level.disconnect();
  source.start();
}

// ── The context, the bus, the samples ─────────────────────────────────────────

let sharedContext: AudioContext | null = null;
let bus: AudioNode | null = null;

function getAudioContext(): AudioContext | null {
  if (sharedContext) return sharedContext;
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    sharedContext = new Ctor();
  } catch {
    return null;
  }
  // The master bus: a compressor as a limiter, so a press under a chime
  // cannot clip.
  const limiter = sharedContext.createDynamicsCompressor();
  limiter.threshold.value = -10;
  limiter.knee.value = 6;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.1;
  limiter.connect(sharedContext.destination);
  bus = limiter;
  return sharedContext;
}

const buffers = new Map<string, AudioBuffer>();
const loading = new Set<string>();

async function loadSample(context: AudioContext, file: string) {
  if (buffers.has(file) || loading.has(file)) return;
  loading.add(file);
  try {
    for (const ext of ['m4a', 'mp3']) {
      try {
        const res = await fetch(`${ASSET_BASE}${file}.${ext}`, { cache: 'force-cache' });
        if (!res.ok) continue;
        const bytes = await res.arrayBuffer();
        const buffer = await context.decodeAudioData(bytes);
        buffers.set(file, buffer);
        return;
      } catch {
        // Try the next format.
      }
    }
  } finally {
    loading.delete(file);
  }
}

function loadAllSamples(context: AudioContext) {
  const files = new Set(Object.values(SAMPLES).map((s) => s!.file));
  files.forEach((file) => void loadSample(context, file));
}

// ── Gates ─────────────────────────────────────────────────────────────────────

let hoverQuery: MediaQueryList | null = null;

/** A pointer that hovers: a mouse or trackpad, not a touch screen. */
function realPointer(pointerType?: string): boolean {
  if (typeof window === 'undefined') return false;
  if (pointerType !== undefined && pointerType !== 'mouse') return false;
  hoverQuery ??= window.matchMedia('(hover: hover) and (pointer: fine)');
  return hoverQuery.matches;
}

const lastPlayed: Partial<Record<SoundName, number>> = {};

function throttled(name: SoundName, now: number, gap = MIN_GAP_MS[name] ?? DEFAULT_GAP_MS): boolean {
  const last = lastPlayed[name];
  if (last !== undefined && now - last < gap) return true;
  lastPlayed[name] = now;
  return false;
}

// ── Mute ──────────────────────────────────────────────────────────────────────

const muteListeners = new Set<(muted: boolean) => void>();

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // Private mode: the flag lives for this page only.
  }
  muteListeners.forEach((cb) => cb(muted));
}

/** Follow the flag, here and from other tabs. Returns the unsubscribe. */
export function subscribeMuted(cb: (muted: boolean) => void): () => void {
  muteListeners.add(cb);
  return () => muteListeners.delete(cb);
}

// ── Dev hook ──────────────────────────────────────────────────────────────────

type Suppressed = 'muted' | 'hidden' | 'no-gesture' | 'throttled' | 'no-audio';

interface LogEntry {
  name: SoundName | 'airflow' | 'grain';
  at: number;
  played: boolean;
  reason?: Suppressed;
  /** `sample` once the file has decoded, `synth` before (or without) it. */
  via?: 'sample' | 'synth';
}

const DEV =
  typeof process !== 'undefined' && typeof process.env !== 'undefined' && process.env.NODE_ENV === 'development';
const log: LogEntry[] = [];

function record(entry: LogEntry) {
  if (!DEV) return;
  log.push(entry);
  if (log.length > 200) log.shift();
}

// ── Playback ──────────────────────────────────────────────────────────────────

function render(context: AudioContext, name: SoundName, gainScale: number) {
  const destination = bus ?? context.destination;
  const sample = SAMPLES[name];
  const buffer = sample && buffers.get(sample.file);
  if (sample && buffer) {
    renderSample(context, destination, buffer, sample.gain * gainScale);
    return 'sample' as const;
  }
  if (sample) void loadSample(context, sample.file);
  renderRecipe(context, destination, SYNTH[name], gainScale);
  return 'synth' as const;
}

/** A `resume()` that takes longer than this was waiting on a gesture: the
 *  cue it was for has passed, and must not fire late on the first click. */
const RESUME_STALE_MS = 250;

/**
 * Runs `go` against a running context: at once when it is running, or
 * after a prompt `resume()`. Before the browser allows sound (no gesture in
 * this window yet, and no activation delegated to it), `resume()` waits for
 * the gesture; a resume that takes that long is dropped, so nothing plays
 * late. Calls `blocked` when nothing will play.
 */
function whenRunning(context: AudioContext, go: () => void, blocked: () => void) {
  if (context.state === 'running') {
    go();
    return;
  }
  const asked = performance.now();
  try {
    void context.resume().then(
      () => {
        if (context.state === 'running' && performance.now() - asked < RESUME_STALE_MS) go();
        else blocked();
      },
      () => blocked(),
    );
  } catch {
    blocked();
  }
}

/**
 * Plays a cue now. Safe anywhere: a no-op during SSR, while muted, while
 * the tab is hidden, before the browser allows sound in this window (the
 * first gesture here, or an activation the parent page delegated to this
 * frame through `allow="autoplay"`), when the same cue played within its
 * minimum gap, or when Web Audio is missing. `gain` scales the cue's level
 * (1 = as tuned); `gap` overrides the cue's minimum gap in ms for this call
 * (a scored run of ticks closer than the hover throttle allows).
 */
export function play(name: SoundName, opts: { gain?: number; gap?: number } = {}) {
  if (typeof window === 'undefined') return;
  const at = performance.now();
  const suppress = (reason: Suppressed) => record({ name, at, played: false, reason });
  if (isMuted()) return suppress('muted');
  if (document.visibilityState !== 'visible') return suppress('hidden');
  if (throttled(name, at, opts.gap)) return suppress('throttled');
  const context = getAudioContext();
  if (!context) return suppress('no-audio');
  const gain = opts.gain ?? 1;
  whenRunning(
    context,
    () => record({ name, at, played: true, via: render(context, name, gain) }),
    () => suppress('no-gesture'),
  );
}

/** A hover cue, only for a real pointer (never touch), throttled. Pass the
 *  event's `pointerType` when there is one. */
export function playHover(name: SoundName = 'tick', pointerType?: string) {
  if (!realPointer(pointerType)) return;
  play(name);
}

/** A `pointerenter` handler that plays `name` for real pointers:
 *  `onPointerEnter={hoverSound()}`. */
export function hoverSound(name: SoundName = 'tick') {
  return (e: { pointerType?: string }) => playHover(name, e.pointerType);
}

// ── Airflow: a continuous voice driven by speed ───────────────────────────────

/** A voice for something turning or moving through the air, written to
 *  every frame. `set(speed)` takes 0..1 (0 still, 1 the fastest the thing
 *  goes); the voice follows it with a short lag. `stop()` fades it out. */
export interface Airflow {
  set(speed: number): void;
  stop(): void;
}

const AIR_NOISE_S = 2;
/** Loudness at full speed, and the curve under it: steeper than linear, so
 *  a small wobble is near silent, shallower than drag's square, so a lazy
 *  turn is still heard. Kept well under the presses: the air is felt more
 *  than heard. */
const AIR_GAIN = 0.09;
const AIR_CURVE = 1.8;
/** Nothing under this: the air is a whisper, not a rumble. */
const AIR_FLOOR = 250;
/** The lowpass opens with speed: a breath at a lazy turn, a rush at a fling. */
const AIR_LOW_MIN = 500;
const AIR_LOW_MAX = 2200;
/** A resonant body under it, for a little shape. */
const AIR_BODY_MIN = 600;
const AIR_BODY_MAX = 1100;
const AIR_BODY_MIX = 0.25;
/** How fast the voice follows the speed (s). */
const AIR_LAG = 0.035;
const AIR_FADE_S = 0.12;
/** A voice nobody has written to for this long is stopped (a paused frame loop). */
const AIR_WATCHDOG_MS = 500;

let airNoise: AudioBuffer | null = null;
function noiseBuffer(context: AudioContext): AudioBuffer {
  if (airNoise && airNoise.sampleRate === context.sampleRate) return airNoise;
  const length = Math.floor(AIR_NOISE_S * context.sampleRate);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = 2 * Math.random() - 1;
  airNoise = buffer;
  return buffer;
}

const NO_AIR: Airflow = { set: () => {}, stop: () => {} };

/**
 * Starts an airflow voice, silent until `set` is written. Subject to the
 * same gates as `play` (muted, hidden, sound not yet allowed, no Web
 * Audio), in which case the voice is a no-op and safe to write to.
 */
export function airflow(): Airflow {
  if (typeof window === 'undefined') return NO_AIR;
  if (isMuted() || document.visibilityState !== 'visible') return NO_AIR;
  const context = getAudioContext();
  // A voice needs the context now: it is written to from this frame on.
  if (!context || context.state !== 'running') return NO_AIR;
  const destination = bus ?? context.destination;
  const now = context.currentTime;

  const source = context.createBufferSource();
  source.buffer = noiseBuffer(context);
  source.loop = true;

  const rumble = context.createBiquadFilter();
  rumble.type = 'highpass';
  rumble.frequency.value = AIR_FLOOR;

  const low = context.createBiquadFilter();
  low.type = 'lowpass';
  low.Q.value = 0.8;
  low.frequency.setValueAtTime(AIR_LOW_MIN, now);

  const body = context.createBiquadFilter();
  body.type = 'bandpass';
  body.Q.value = 1.6;
  body.frequency.setValueAtTime(AIR_BODY_MIN, now);
  const bodyGain = context.createGain();
  bodyGain.gain.value = AIR_BODY_MIX;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0, now);

  source.connect(rumble);
  rumble.connect(low).connect(gain);
  rumble.connect(body).connect(bodyGain).connect(gain);
  gain.connect(destination);
  source.start(now);

  let stopped = false;
  let watchdog = 0;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    window.clearTimeout(watchdog);
    const t = context.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setTargetAtTime(0, t, AIR_FADE_S / 4);
    source.stop(t + AIR_FADE_S);
    source.onended = () => gain.disconnect();
  };
  const set = (speed: number) => {
    if (stopped) return;
    if (isMuted()) {
      stop();
      return;
    }
    window.clearTimeout(watchdog);
    watchdog = window.setTimeout(stop, AIR_WATCHDOG_MS);
    const s = Math.max(0, Math.min(1, speed));
    const t = context.currentTime;
    gain.gain.setTargetAtTime(AIR_GAIN * s ** AIR_CURVE, t, AIR_LAG);
    low.frequency.setTargetAtTime(AIR_LOW_MIN + (AIR_LOW_MAX - AIR_LOW_MIN) * s, t, AIR_LAG);
    body.frequency.setTargetAtTime(AIR_BODY_MIN + (AIR_BODY_MAX - AIR_BODY_MIN) * s, t, AIR_LAG);
  };
  watchdog = window.setTimeout(stop, AIR_WATCHDOG_MS);
  record({ name: 'airflow', at: performance.now(), played: true, via: 'synth' });
  return { set, stop };
}

// ── Grain: a texture laid down grain by grain, driven by a sweep ─────────────

/** A voice for a surface being laid down as a fine dither behind a moving
 *  front. `set(level, pan)`: `level` 0..1 is how fast the front is moving
 *  (the grain's density and loudness follow it), `pan` -1..1 is where the
 *  front is across the screen. `stop()` fades it out. */
export interface Grain {
  set(level: number, pan: number): void;
  stop(): void;
}

const GRAIN_GAIN = 0.08;
/** Crackle: sparse impulses, this many per second at full level. */
const GRAIN_CRACKLE_PER_S = 900;
/** The hiss under the crackle: a bandpass, its center by `bright` (0 dull
 *  plastic, 1 polished steel). */
const GRAIN_HISS_MIN = 2400;
const GRAIN_HISS_MAX = 5200;
const GRAIN_HISS_MIX = 0.4;
const GRAIN_LAG = 0.02;
const GRAIN_FADE_S = 0.08;

let crackleBuffer: AudioBuffer | null = null;
/** Two seconds of sparse, random, one-sample impulses with random sign and
 *  size: the dither's individual grains. */
function crackle(context: AudioContext): AudioBuffer {
  if (crackleBuffer && crackleBuffer.sampleRate === context.sampleRate) return crackleBuffer;
  const length = Math.floor(AIR_NOISE_S * context.sampleRate);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  const p = GRAIN_CRACKLE_PER_S / context.sampleRate;
  for (let i = 0; i < length; i++) {
    if (Math.random() < p) data[i] = (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.6);
  }
  crackleBuffer = buffer;
  return buffer;
}

const NO_GRAIN: Grain = { set: () => {}, stop: () => {} };

/**
 * Starts a grain voice, silent until `set` is written. `bright` (0..1) sets
 * the hiss's color. Subject to the same gates as `play`, in which case the
 * voice is a no-op and safe to write to.
 */
export function grain(bright = 0.5): Grain {
  if (typeof window === 'undefined') return NO_GRAIN;
  if (isMuted() || document.visibilityState !== 'visible') return NO_GRAIN;
  const context = getAudioContext();
  if (!context || context.state !== 'running') return NO_GRAIN;
  const destination = bus ?? context.destination;
  const now = context.currentTime;
  const b = Math.max(0, Math.min(1, bright));

  const crackles = context.createBufferSource();
  crackles.buffer = crackle(context);
  crackles.loop = true;
  crackles.loopStart = Math.random() * (AIR_NOISE_S / 2);
  const crackleTone = context.createBiquadFilter();
  crackleTone.type = 'highpass';
  crackleTone.frequency.value = 1200 + 2400 * b;

  const hiss = context.createBufferSource();
  hiss.buffer = noiseBuffer(context);
  hiss.loop = true;
  const hissBand = context.createBiquadFilter();
  hissBand.type = 'bandpass';
  hissBand.frequency.value = GRAIN_HISS_MIN + (GRAIN_HISS_MAX - GRAIN_HISS_MIN) * b;
  hissBand.Q.value = 1.2 + b;
  const hissGain = context.createGain();
  hissGain.gain.value = GRAIN_HISS_MIX;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0, now);
  const panner = typeof context.createStereoPanner === 'function' ? context.createStereoPanner() : null;

  crackles.connect(crackleTone).connect(gain);
  hiss.connect(hissBand).connect(hissGain).connect(gain);
  if (panner) gain.connect(panner).connect(destination);
  else gain.connect(destination);
  crackles.start(now);
  hiss.start(now);

  let stopped = false;
  let watchdog = 0;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    window.clearTimeout(watchdog);
    const t = context.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setTargetAtTime(0, t, GRAIN_FADE_S / 4);
    crackles.stop(t + GRAIN_FADE_S);
    hiss.stop(t + GRAIN_FADE_S);
    hiss.onended = () => (panner ?? gain).disconnect();
  };
  const set = (level: number, pan: number) => {
    if (stopped) return;
    if (isMuted()) {
      stop();
      return;
    }
    window.clearTimeout(watchdog);
    watchdog = window.setTimeout(stop, AIR_WATCHDOG_MS);
    const l = Math.max(0, Math.min(1, level));
    const t = context.currentTime;
    gain.gain.setTargetAtTime(GRAIN_GAIN * l * l, t, GRAIN_LAG);
    panner?.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), t, GRAIN_LAG);
  };
  watchdog = window.setTimeout(stop, AIR_WATCHDOG_MS);
  record({ name: 'grain', at: performance.now(), played: true, via: 'synth' });
  return { set, stop };
}

type Handler<E> = (e: E) => void;

/**
 * A pressable's handlers with its sounds in front: the hover tick on
 * `pointerenter` (real pointers only) and `press` on click, then the
 * element's own handlers. Spread the result after the element's props:
 * `<button {...rest} {...pressable(rest)}>`. A disabled control is silent.
 * `null` for a cue turns that one off.
 */
export function pressable<E extends { pointerType?: string }, C>(
  own: { onPointerEnter?: Handler<E>; onClick?: Handler<C>; disabled?: boolean },
  cues: { hover?: SoundName | null; press?: SoundName | null } = {},
): { onPointerEnter: Handler<E>; onClick: Handler<C> } {
  const hover = cues.hover === undefined ? 'tick' : cues.hover;
  const press = cues.press === undefined ? 'press' : cues.press;
  return {
    onPointerEnter: (e) => {
      if (!own.disabled && hover) playHover(hover, e.pointerType);
      own.onPointerEnter?.(e);
    },
    onClick: (e) => {
      if (!own.disabled && press) play(press);
      own.onClick?.(e);
    },
  };
}

/** Hover states, accordion toggles, carousel snaps. */
export const playTick = () => playHover('tick');
/** The brighter cut: toggles, tabs, swatches. */
export const playTickBright = () => playHover('tickBright');
/** Presses and clicks. */
export const playPress = () => play('press');

// ── Install: preheat and gesture unlock ───────────────────────────────────────

/** Builds the context and decodes the samples during idle time, so the
 *  first gesture only pays `resume()`. Runs once at import; harmless to
 *  call again. */
export function preheat() {
  const context = getAudioContext();
  if (context) loadAllSamples(context);
}

if (typeof window !== 'undefined') {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => preheat(), { timeout: 3000 });
  } else {
    setTimeout(preheat, 1500);
  }

  // The first gesture resumes the context, so the cue it carries (and every
  // one after) plays without waiting on `resume()`.
  const events = ['pointerdown', 'touchstart', 'keydown'] as const;
  const onGesture = () => {
    const context = getAudioContext();
    if (context?.state === 'suspended') void context.resume();
    events.forEach((e) => window.removeEventListener(e, onGesture, true));
  };
  events.forEach((e) => window.addEventListener(e, onGesture, { capture: true, passive: true }));

  window.addEventListener('storage', (e) => {
    if (e.key === MUTE_KEY) muteListeners.forEach((cb) => cb(e.newValue === '1'));
  });

  if (DEV) {
    (window as unknown as { __sounds: unknown }).__sounds = {
      log,
      play,
      playHover,
      isMuted,
      setMuted,
      state: () => sharedContext?.state ?? 'none',
      loaded: () => Array.from(buffers.keys()),
    };
  }
}
