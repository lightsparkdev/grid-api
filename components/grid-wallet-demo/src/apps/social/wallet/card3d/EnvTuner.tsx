'use client';

import { useState } from 'react';
import { envLightTune } from './envLightTune';

/**
 * DEV-ONLY floating panel: two sliders that offset the environment rotation on
 * the RESOLVED card, so the light/reflection placement can be tuned live.
 * Writes straight into the `envLightTune` module value (read per-frame by
 * RevealCard) — dragging never re-renders the 3D scene. Once a look is found,
 * bake the readout values into REVEAL_SWEEP / the env and delete this panel.
 */
export function EnvTuner() {
  const [x, setX] = useState(envLightTune.x);
  const [y, setY] = useState(envLightTune.y);

  if (process.env.NODE_ENV === 'production') return null;

  const row = (
    label: string,
    value: number,
    set: (v: number) => void,
    axis: 'x' | 'y',
  ) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 74 }}>{label}</span>
      <input
        type="range"
        min={-Math.PI}
        max={Math.PI}
        step={0.01}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          envLightTune[axis] = v;
          set(v);
        }}
        style={{ width: 140 }}
      />
      <span style={{ width: 48, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {value.toFixed(2)}
      </span>
    </label>
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 70, // below the phone status bar
        right: 12,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '10px 12px',
        borderRadius: 10,
        background: 'rgba(0, 0, 0, 0.72)',
        color: '#fff',
        font: '500 11px/1.4 ui-monospace, monospace',
        pointerEvents: 'auto',
      }}
    >
      {row('light ↑↓', x, setX, 'x')}
      {row('light ←→', y, setY, 'y')}
      <button
        type="button"
        onClick={() => {
          envLightTune.x = 0;
          envLightTune.y = 0;
          setX(0);
          setY(0);
        }}
        style={{
          alignSelf: 'flex-end',
          padding: '2px 8px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.3)',
          background: 'transparent',
          color: '#fff',
          font: 'inherit',
          cursor: 'pointer',
        }}
      >
        reset
      </button>
    </div>
  );
}
