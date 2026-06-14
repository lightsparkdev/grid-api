'use client';

import clsx from 'clsx';
import { animate } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { GlassConfig } from '@/components/liquid-glass';
import { easeOutSnappy } from '@/lib/easing';
import { StageGL, type StageGLHandle } from '@/components/glass-gl/StageGL';
import { PhoneBootProvider } from './PhoneBootContext';
import styles from './DotGridCanvas.module.scss';

/** ms after dots begin fading before the phone + glass bezel fade together. */
const PHONE_BOOT_DELAY_MS = 120;
export const PHONE_BOOT_DURATION_S = 0.45;

interface DotGridCanvasProps {
  children?: ReactNode;
  /** Lens config for the WebGL glass stage behind the phone. */
  glassConfig?: GlassConfig;
}

export function DotGridCanvas({ children, glassConfig }: DotGridCanvasProps) {
  const stageRef = useRef<StageGLHandle>(null);
  const [dotsReady, setDotsReady] = useState(false);
  const [bootReady, setBootReady] = useState(false);
  const [bootOpacity, setBootOpacity] = useState(0);
  const realignLens = useCallback(() => {
    stageRef.current?.bootRepaint();
  }, []);

  useLayoutEffect(() => {
    realignLens();
    let phoneTimer = 0;
    const frame = requestAnimationFrame(() => {
      setDotsReady(true);
      phoneTimer = window.setTimeout(() => setBootReady(true), PHONE_BOOT_DELAY_MS);
    });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(phoneTimer);
    };
  }, [realignLens]);

  // One shared 0→1 curve drives screen content AND the WebGL glass lens.
  useEffect(() => {
    if (!bootReady) return;
    const anim = animate(0, 1, {
      duration: PHONE_BOOT_DURATION_S,
      ease: easeOutSnappy,
      onUpdate: (value) => {
        setBootOpacity(value);
        realignLens();
      },
    });
    return () => anim.stop();
  }, [bootReady, realignLens]);

  return (
    <PhoneBootProvider value={{ ready: bootReady, bootOpacity, realignLens }}>
      <div className={styles.canvasGlassDemo}>
        <StageGL
          ref={stageRef}
          className={clsx(styles.gridLayerSwag, dotsReady && styles.gridLayerVisible)}
          lens={glassConfig}
          bootMix={bootOpacity}
        />
        {children}
      </div>
    </PhoneBootProvider>
  );
}
