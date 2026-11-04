import type { CSSProperties, ReactNode } from 'react';
import { FrostPanel } from '@/components/liquid-glass';
import { Sym } from './Sym';
import styles from './Keyboard.module.scss';

/**
 * The iOS 26 keyboard, from the GoFundMe demo (bitcoin-2026-gofundme-web src/ios/Keyboard.tsx): Pat's Figma metrics
 * (LS3-improvements 3564:40913: 402 × 342, 33.1 × 45pt keys on 39.1pt steps, rows 56pt apart from 49pt down, a
 * #0088FF return), the 123 layer for digits, Liquid Glass behind, and iOS 26's pop-up over the last letter typed.
 * `dark` is the dark-mode keyboard for the agents' dark chats.
 */

export type KeyboardLayer = 'letters' | 'numbers';

export const KEYBOARD_H = 342;

interface KeyDef {
  id: string;
  x: number;
  y: number;
  w: number;
  label?: ReactNode;
  kind?: 'char' | 'system' | 'return' | 'space';
  /** Letter keys show a pop-up when typed. */
  pops?: boolean;
}

const ROW_Y = [49, 105, 161, 217];
const KEY_H = 45;
// iOS 26's pop-up (Pat's recording, ScreenRecording_11-03-2026 17-49-17 @3x): its own rounded square floating
// 4pt over the key, which lights up beneath it rather than joining it.
const POP_W = 60;
const POP_H = 65;
const POP_GAP = 4;
const row1 = (chars: string) => chars.split('').map((c, i) => ({ id: c, x: 8.5 + i * 39.1, y: ROW_Y[0], w: 33.1, label: c, pops: true }));
const row2 = (chars: string) => chars.split('').map((c, i) => ({ id: c, x: 28.5 + i * 39, y: ROW_Y[1], w: 33, label: c, pops: true }));

function lettersKeys(shift: boolean): KeyDef[] {
  const t = (s: string) => (shift ? s.toUpperCase() : s);
  return [
    ...row1(t('qwertyuiop')),
    ...row2(t('asdfghjkl')),
    { id: 'shift', x: 8.5, y: ROW_Y[2], w: 44.67, kind: 'system', label: <Sym name={shift ? 'shift.fill' : 'shift'} size={19} weight="medium" /> },
    ...t('zxcvbnm')
      .split('')
      .map((c, i) => ({ id: c, x: 67.42 + i * 38.98, y: ROW_Y[2], w: 32.98, label: c, pops: true })),
    { id: 'delete', x: 348.5, y: ROW_Y[2], w: 45, kind: 'system', label: <Sym name="delete.left" size={19} weight="medium" /> },
    { id: 'switch', x: 8.5, y: ROW_Y[3], w: 91.67, kind: 'system', label: <span className={styles.switch}>123</span> },
    { id: ' ', x: 106.17, y: ROW_Y[3], w: 189.33, kind: 'space' },
    { id: 'return', x: 301.5, y: ROW_Y[3], w: 92, kind: 'return', label: <Sym name="return" size={20} weight="medium" /> },
  ];
}

function numbersKeys(): KeyDef[] {
  return [
    ...row1('1234567890'),
    ...'-/:;()$&@"'.split('').map((c, i) => ({ id: c, x: 8.5 + i * 39.1, y: ROW_Y[1], w: 33.1, label: c, pops: true })),
    { id: 'symbols', x: 8.5, y: ROW_Y[2], w: 44.67, kind: 'system', label: <span className={styles.switch}>#+=</span> },
    ...".,?!'".split('').map((c, i) => ({ id: c, x: 58.92 + i * 56.27, y: ROW_Y[2], w: 50.27, label: c, pops: true })),
    { id: 'delete', x: 348.5, y: ROW_Y[2], w: 45, kind: 'system', label: <Sym name="delete.left" size={19} weight="medium" /> },
    { id: 'switch', x: 8.5, y: ROW_Y[3], w: 91.67, kind: 'system', label: <span className={styles.switch}>ABC</span> },
    { id: ' ', x: 106.17, y: ROW_Y[3], w: 189.33, kind: 'space' },
    { id: 'return', x: 301.5, y: ROW_Y[3], w: 92, kind: 'return', label: <Sym name="return" size={20} weight="medium" /> },
  ];
}

const GLASS = {
  light: { tint: 'rgba(218, 221, 225, 0.8)', edge: 'rgba(255, 255, 255, 0.85)', shadow: '0 0 0 0.5px rgba(0, 0, 0, 0.14)' },
  dark: { tint: 'rgba(38, 38, 40, 0.82)', edge: 'rgba(255, 255, 255, 0.16)', shadow: '0 0 0 0.5px rgba(0, 0, 0, 0.5)' },
};

/** Which layer a character is typed from, and whether it needs shift. */
export function keyFor(ch: string): { layer: KeyboardLayer; shift: boolean; id: string } {
  const letter = ch.toLowerCase() !== ch.toUpperCase();
  return { layer: letter || ch === ' ' ? 'letters' : 'numbers', shift: letter && ch !== ch.toLowerCase(), id: ch };
}

export function Keyboard({
  layer,
  shift,
  pressed,
  dark,
  suggestions,
  style,
}: {
  layer: KeyboardLayer;
  shift: boolean;
  pressed: string | null;
  dark?: boolean;
  /** QuickType's three slots over the keys. */
  suggestions?: [string, string, string];
  style?: CSSProperties;
}) {
  const keys = layer === 'numbers' ? numbersKeys() : lettersKeys(shift);
  const popKey = keys.find((k) => k.pops && k.id === pressed);
  const glass = dark ? GLASS.dark : GLASS.light;
  return (
    <div className={styles.keyboard} data-dark={dark || undefined} style={{ height: KEYBOARD_H, ...style }} aria-hidden>
      <FrostPanel
        cornerRadii={[26, 26, 58, 58]}
        tint={glass.tint}
        tintBlur={20}
        edge={glass.edge}
        shadow={glass.shadow}
        style={{ position: 'absolute', inset: 0 }}
      />
      <span className={styles.suggestionRule} style={{ left: 134 }} />
      <span className={styles.suggestionRule} style={{ left: 268 }} />
      {suggestions?.map((s, i) => (
        <span key={i} className={styles.suggestion} style={{ left: i * 134 }}>
          {s}
        </span>
      ))}
      {keys.map((k) => (
        <span
          key={`${k.id}-${k.x}`}
          className={`${styles.key} ${styles[k.kind ?? 'char']} ${pressed === k.id ? styles.down : ''}`}
          style={{ left: k.x, top: k.y, width: k.w, height: KEY_H }}
        >
          {k.label}
        </span>
      ))}
      {popKey && (
        <span
          className={styles.pop}
          style={{ left: popKey.x + popKey.w / 2 - POP_W / 2, top: popKey.y - POP_GAP - POP_H, width: POP_W, height: POP_H }}
        >
          {popKey.label}
        </span>
      )}
      <span className={styles.emoji}>
        <Sym name="face.smiling" size={27} weight="regular" />
      </span>
      <span className={styles.mic}>
        <Sym name="microphone" size={24} weight="regular" />
      </span>
    </div>
  );
}
