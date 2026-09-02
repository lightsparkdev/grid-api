'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { SquircleFocusHalo } from '@/apps/shared/SquircleFocusHalo';
import styles from './PlainInput.module.scss';

interface PlainInputProps {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  onEnter?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  inputRef?: (el: HTMLInputElement | null) => void;
  inputProps?: Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'inputMode' | 'autoComplete'
  >;
}

/** Uber-style plain field (IMG_0669/0693): h56, r8 squircle. At rest it's a
 *  light-grey fill with no stroke; focused it turns white with a 2px black
 *  border. The border is an SVG halo stroke so it survives the squircle clip
 *  and can fade between states. */
export function PlainInput({
  value,
  onChange,
  placeholder,
  onEnter,
  onFocus,
  disabled,
  inputRef,
  inputProps,
}: PlainInputProps) {
  const clip = useSquircleClip<HTMLDivElement>({ figmaRadii: 8 });
  const [focused, setFocused] = useState(false);

  return (
    <div className={styles.shell} data-focus={focused || undefined}>
      <div ref={clip.ref} style={clip.style} className={styles.clip}>
        <input
          ref={inputRef}
          className={styles.input}
          aria-label={placeholder}
          placeholder={placeholder}
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
