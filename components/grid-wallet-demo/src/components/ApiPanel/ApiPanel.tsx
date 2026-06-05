import { IconCode } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCode';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import styles from './ApiPanel.module.scss';

export function ApiPanel() {
  return (
    <section className={styles.panel}>
      <PanelHeader
        icon={<IconCode size={20} />}
        title="API calls"
      />
      <div className={styles.body} />
    </section>
  );
}
