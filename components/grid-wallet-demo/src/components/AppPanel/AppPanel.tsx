'use client';

import { IconPhoneDynamicIsland } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPhoneDynamicIsland';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { DotGridCanvas } from '@/components/DotGridCanvas/DotGridCanvas';
import Phone from '@/components/Phone';
import { AppDevControls } from '@/dev/phonePreview/AppDevControls';
import { resolvePhoneProps, type DemoLogicPhoneSlice } from '@/dev/phonePreview/resolvePhoneProps';
import { useAppDevState } from '@/dev/phonePreview/useAppDevState';
import { PhoneSwag } from '@/dev/phoneSwag/PhoneSwag';
import styles from './AppPanel.module.scss';

interface AppPanelProps extends DemoLogicPhoneSlice {}

export function AppPanel(props: AppPanelProps) {
  const dev = useAppDevState();
  const phoneProps = resolvePhoneProps(props, dev.fixtureId, dev.previewActive);
  const PhoneComponent = dev.uiVariant === 'swag' ? PhoneSwag : Phone;

  return (
    <section className={styles.panel}>
      <PanelHeader
        icon={<IconPhoneDynamicIsland size={20} />}
        title="App"
      />
      <div className={styles.body}>
        <div className={styles.phoneStage}>
          <DotGridCanvas>
            <PhoneComponent {...phoneProps} />
          </DotGridCanvas>
        </div>
        {dev.enabled ? (
          <AppDevControls
            fixtureId={dev.fixtureId}
            onFixtureChange={dev.setFixtureId}
            uiVariant={dev.uiVariant}
            onUiVariantChange={dev.setUiVariant}
          />
        ) : null}
      </div>
    </section>
  );
}
