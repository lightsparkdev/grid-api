'use client';

import { IconCode } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCode';
import type { Entry } from '@/components/ApiSteps';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { ApiPanelEmpty } from './ApiPanelEmpty';
import styles from './ApiPanel.module.scss';

interface ApiPanelProps {
  entries: Entry[];
}

export function ApiPanel({ entries }: ApiPanelProps) {
  return (
    <section className={styles.panel}>
      <PanelHeader
        icon={<IconCode size={20} />}
        title="API calls"
      />
      <div className={styles.body}>
        {entries.length === 0 ? <ApiPanelEmpty /> : null}
      </div>
    </section>
  );
}
