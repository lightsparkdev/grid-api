'use client';

import { useEffect, useState } from 'react';
import styles from './PhoneStatusBar.module.scss';

function formatStatusBarTime(date: Date): { label: string; dateTime: string } {
  const hours24 = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const dateTime = `${hours24.toString().padStart(2, '0')}:${minutes}`;

  const uses24Hour =
    new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hour12 === false;

  const label = uses24Hour ? dateTime : `${hours24 % 12 || 12}:${minutes}`;

  return { label, dateTime };
}

/** Live clock — iOS status bar format (no seconds, locale 12/24h). */
export function StatusBarTime() {
  const [time, setTime] = useState(() => formatStatusBarTime(new Date()));

  useEffect(() => {
    const tick = () => setTime(formatStatusBarTime(new Date()));
    tick();

    const msUntilNextMinute =
      (60 - new Date().getSeconds()) * 1000 - new Date().getMilliseconds();

    let intervalId: number | undefined;
    const alignId = window.setTimeout(() => {
      tick();
      intervalId = window.setInterval(tick, 60_000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(alignId);
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, []);

  return (
    <time className={styles.time} dateTime={time.dateTime} suppressHydrationWarning>
      {time.label}
    </time>
  );
}
