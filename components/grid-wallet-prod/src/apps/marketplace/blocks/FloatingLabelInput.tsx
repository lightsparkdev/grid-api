'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { TextMorph } from 'torph/react';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { SquircleFocusHalo } from '@/apps/shared/SquircleFocusHalo';
import { cubicBezierCss, easeOutSwift } from '@/lib/easing';
import styles from './FloatingLabelInput.module.scss';

const MORPH_MS = 280;

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChange: (raw: string) => void;
  onEnter?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  inputRef?: (el: HTMLInputElement | null) => void;
  inputProps?: Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'inputMode' | 'autoComplete'
  >;
}

/** Airbnb-style floating-label field (Figma 2375:11747) — h62, r12 squircle.
 *  The label rests centered (17px, #6a6a6a); on focus or with content it glides
 *  up and shrinks (one transform transition, origin left) and the border
 *  becomes the primary label color. The border is an SVG halo stroke so it
 *  survives the squircle clip and can color-transition. The label text itself
 *  morphs (TextMorph) when the enabled methods change it — "Phone number or
 *  email" ⇄ "Email" ⇄ "Phone number". */
export function FloatingLabelInput({
  label,
  value,
  onChange,
  onEnter,
  onFocus,
  disabled,
  inputRef,
  inputProps,
}: FloatingLabelInputProps) {
  const clip = useSquircleClip<HTMLDivElement>({ figmaRadii: 12 });
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className={styles.shell} data-focus={focused || undefined}>
      <div
        ref={clip.ref}
        style={clip.style}
        className={styles.clip}
        data-float={floated || undefined}
      >
        <span className={styles.label} aria-hidden>
          {/* nbsp instead of spaces: spaced text makes torph segment by WORD
              with exact matching — "email" ≠ "Email", so a label change reads
              as a crossfade. Space-free text segments by GRAPHEME, so the
              shared letters (m/a/i/l…) glide to their new spots instead. */}
          <TextMorph as="span" duration={MORPH_MS} ease={cubicBezierCss(easeOutSwift)}>
            {label.replace(/ /g, '\u00a0')}
          </TextMorph>
        </span>
        <input
          ref={inputRef}
          className={styles.input}
          aria-label={label}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEnter?.();
          }}
          {...inputProps}
        />
      </div>
      <SquircleFocusHalo
        path={clip.path}
        width={clip.width}
        height={clip.height}
        className={styles.halo}
      />
    </div>
  );
}
