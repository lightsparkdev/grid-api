import { IconPhoneDynamicIsland } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPhoneDynamicIsland';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { DotGridCanvas } from '@/components/DotGridCanvas/DotGridCanvas';
import styles from './AppPanel.module.scss';

export function AppPanel() {
  return (
    <section className={styles.panel}>
      <PanelHeader
        icon={<IconPhoneDynamicIsland size={20} />}
        title="App"
      />
      <DotGridCanvas />
    </section>
  );
}
