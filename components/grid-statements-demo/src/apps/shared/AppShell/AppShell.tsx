'use client';

import type { CSSProperties, ReactNode } from 'react';
import { PhoneStatusBar } from './PhoneStatusBar';
import { APP_SHELL_PRESETS } from './devicePresets';
import { squirclePath } from '@/components/liquid-glass/squircle';
import { usePhoneFitScale } from './usePhoneFitScale';
import type { StatementDevice } from '@/statement/types';
import styles from './AppShell.module.scss';

interface AppShellProps {
  device: StatementDevice;
  children: ReactNode;
  screenTone?: 'default' | 'light';
}

export function AppShell({
  device,
  children,
  screenTone = 'default',
}: AppShellProps) {
  const preset = APP_SHELL_PRESETS[device];
  const { wrapRef, scale } = usePhoneFitScale(preset);
  const screenClip = `path('${squirclePath(
    preset.screenWidth,
    preset.screenHeight,
    preset.screenRadii,
    0.75,
  )}')`;
  const shellClip = `path('${squirclePath(
    preset.outerWidth,
    preset.outerHeight,
    preset.shellRadii,
    0.75,
  )}')`;
  const style = {
    '--app-shell-width': `${preset.outerWidth}px`,
    '--app-shell-height': `${preset.outerHeight}px`,
    '--app-screen-width': `${preset.screenWidth}px`,
    '--app-screen-height': `${preset.screenHeight}px`,
    '--app-screen-top': `${preset.screenInset[0]}px`,
    '--app-screen-right': `${preset.screenInset[1]}px`,
    '--app-screen-bottom': `${preset.screenInset[2]}px`,
    '--app-screen-left': `${preset.screenInset[3]}px`,
    '--fit-scale': scale,
    '--shell-clip': shellClip,
    '--screen-clip': screenClip,
  } as CSSProperties;

  return (
    <div ref={wrapRef} className={styles.stage} data-device={device}>
      <div className={styles.scaled} style={style}>
        <div className={styles.frame}>
          <div className={styles.shell} aria-hidden />
          <div className={styles.screen}>
            <PhoneStatusBar tone={screenTone} />
            <div className={styles.screenBody} data-screen-body>
              {children}
            </div>
          </div>
          {preset.cameraHole ? (
            <span
              className={styles.cameraHole}
              style={{
                width: preset.cameraHole.diameter,
                height: preset.cameraHole.diameter,
                top: preset.cameraHole.top - preset.cameraHole.diameter / 2,
                left: preset.cameraHole.outer - preset.cameraHole.diameter / 2,
              }}
              aria-hidden
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
