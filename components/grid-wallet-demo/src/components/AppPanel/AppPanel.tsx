'use client';

import { useState } from 'react';
import { IconPhoneDynamicIsland } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPhoneDynamicIsland';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { DotGridCanvas } from '@/components/DotGridCanvas/DotGridCanvas';
import Phone from '@/components/Phone';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { AppDevControls } from '@/dev/phonePreview/AppDevControls';
import { resolvePhoneProps, type DemoLogicPhoneSlice } from '@/dev/phonePreview/resolvePhoneProps';
import { useAppDevState } from '@/dev/phonePreview/useAppDevState';
import { PhoneSwag } from '@/dev/phoneSwag/PhoneSwag';
import styles from './AppPanel.module.scss';

interface AppPanelProps extends DemoLogicPhoneSlice {}

export function AppPanel(props: AppPanelProps) {
  const dev = useAppDevState();
  const [glassConfig, setGlassConfig] = useState(PHONE_SHELL_GLASS);
  const [showGlassOutline, setShowGlassOutline] = useState(false);
  const phoneProps = resolvePhoneProps(props, dev.fixtureId, dev.previewActive);

  return (
    <section className={styles.panel}>
      <PanelHeader
        icon={<IconPhoneDynamicIsland size={20} />}
        title="App"
      />
      <div className={styles.body}>
        <div className={styles.phoneStage}>
          <DotGridCanvas glassDemoBg={dev.uiVariant === 'swag'}>
            {dev.uiVariant === 'swag' ? (
              <PhoneSwag
                {...phoneProps}
                glassConfig={glassConfig}
                showGlassOutline={showGlassOutline}
                draggable={dev.enabled}
                glassDemoBg
              />
            ) : (
              <Phone {...phoneProps} />
            )}
          </DotGridCanvas>
        </div>
        {dev.enabled ? (
          <AppDevControls
            fixtureId={dev.fixtureId}
            onFixtureChange={dev.setFixtureId}
            uiVariant={dev.uiVariant}
            onUiVariantChange={dev.setUiVariant}
            glassConfig={glassConfig}
            onGlassConfigChange={setGlassConfig}
            showGlassOutline={showGlassOutline}
            onShowGlassOutlineChange={setShowGlassOutline}
          />
        ) : null}
      </div>
    </section>
  );
}
