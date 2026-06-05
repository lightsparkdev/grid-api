'use client';

import clsx from 'clsx';
import { IconCode } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCode';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { ApiCallList } from './ApiCallList';
import { ApiPanelEmpty } from './ApiPanelEmpty';
import type { Entry } from './types';
import styles from './ApiPanel.module.scss';

interface ApiPanelProps {
  entries: Entry[];
}

export function ApiPanel({ entries }: ApiPanelProps) {
  const isEmpty = entries.length === 0;

  return (
    <section className={styles.panel}>
      <PanelHeader
        icon={<IconCode size={20} />}
        title="API calls"
      />
      <div className={clsx(styles.body, isEmpty && styles.bodyEmpty)}>
        {isEmpty ? <ApiPanelEmpty /> : <ApiCallList entries={entries} />}
      </div>
    </section>
  );
}
