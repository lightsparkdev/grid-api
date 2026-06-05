import { IconSettingsSliderHor } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSettingsSliderHor';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { PlaygroundIntro } from '@/components/PlaygroundIntro/PlaygroundIntro';
import styles from './ConfigurePanel.module.scss';

export function ConfigurePanel() {
  return (
    <aside className={styles.panel}>
      <PanelHeader
        icon={<IconSettingsSliderHor size={20} />}
        title="Configure"
      />
      <div className={styles.body}>
        <PlaygroundIntro />
      </div>
    </aside>
  );
}
