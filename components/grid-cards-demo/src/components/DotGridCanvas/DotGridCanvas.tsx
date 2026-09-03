'use client';

import clsx from 'clsx';
import { animate } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { GlassConfig } from '@/components/liquid-glass';
import { useGlassEngine } from '@/components/liquid-glass/useGlassEngine';
import { StageGL, type StageGLHandle } from '@/components/glass-gl/StageGL';
import { PhoneBootProvider } from './PhoneBootContext';
import styles from './DotGridCanvas.module.scss';

/** ms after dots begin fading before the phone + glass bezel can fade in. */
const PHONE_BOOT_DELAY_MS = 120;
/** Phone (and glass bezel) materializing — the card flies into it on this curve. */
export const PHONE_IN_DURATION_S = 0.7;
/** Phone dissolving back to the bare card (Reset). */
export const PHONE_OUT_DURATION_S = 0.45;

interface DotGridCanvasProps {
  children?: ReactNode;
  /** Lens config for the WebGL glass stage behind the phone. */
  glassConfig?: GlassConfig;
  /** Whether the phone is on stage. False = the bare card stage (design mode);
   *  flipping it animates the phone + glass in or out on one shared curve. */
  phoneVisible?: boolean;
}

/** Close to the stage's easeOutSnappy curve, evaluated directly. */
function easeOutQuart(p: number) {
  return 1 - Math.pow(1 - p, 4);
}

export function DotGridCanvas({ children, glassConfig, phoneVisible = true }: DotGridCanvasProps) {
  const stageRef = useRef<StageGLHandle>(null);
  // WebKit runs the glass shader on a slow path, so animating the entrance (the
  // lens recomputes every frame) stutters. On Safari we skip the animation and
  // let the phone + glass appear at full strength instead.
  const { isSafari } = useGlassEngine();
  const [dotsReady, setDotsReady] = useState(false);
  const [bootReady, setBootReady] = useState(false);
  // Linear progress of the phone in/out transition; the phone eases out of it,
  // the card stage eases in-out of it.
  const [bootProgress, setBootProgress] = useState(0);
  const bootOpacity = easeOutQuart(bootProgress);
  // Live value for the animation to start from mid-flight.
  const bootProgressRef = useRef(0);
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

  // One shared 0→1 curve drives screen content, the WebGL glass lens, AND the
  // card's flight from the stage into its slot. Safari skips the animation —
  // the phone + glass snap (no per-frame shader).
  useEffect(() => {
    if (!bootReady) return;
    const target = phoneVisible ? 1 : 0;
    if (isSafari) {
      bootProgressRef.current = target;
      setBootProgress(target);
      realignLens();
      // One more realign next frame in case the fit-scale is still settling.
      const raf = requestAnimationFrame(() => realignLens());
      return () => cancelAnimationFrame(raf);
    }
    const anim = animate(bootProgressRef.current, target, {
      duration: target ? PHONE_IN_DURATION_S : PHONE_OUT_DURATION_S,
      ease: 'linear',
      onUpdate: (value) => {
        bootProgressRef.current = value;
        setBootProgress(value);
        realignLens();
      },
    });
    return () => anim.stop();
  }, [bootReady, phoneVisible, isSafari, realignLens]);

  return (
    <PhoneBootProvider value={{ ready: bootReady, bootOpacity, bootProgress, realignLens }}>
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
