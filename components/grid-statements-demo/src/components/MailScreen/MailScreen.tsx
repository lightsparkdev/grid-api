'use client';

import React, { useState } from 'react';
import { IconArrowLeft } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowLeft';
import { StatementDocument } from '@/components/StatementDocument';
import { pressable } from '@/lib/sounds';
import type { StatementModel } from '@/statement/types';
import styles from './MailScreen.module.scss';

function statementSubject(statement: StatementModel) {
  const [year, month] = statement.period.id.split('-').map(Number);
  const name = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return `${name} statement`;
}

export function MailScreen({ statement }: { statement: StatementModel }) {
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const subject = statementSubject(statement);

  if (attachmentOpen) {
    return (
      <section className={styles.viewer} aria-label="Statement document viewer">
        <header className={styles.viewerHeader}>
          <button
            type="button"
            aria-label="Back to message"
            {...pressable({ onClick: () => setAttachmentOpen(false) })}
          >
            <IconArrowLeft size={20} aria-hidden />
            Mail
          </button>
          <strong>{subject}</strong>
        </header>
        <div className={styles.documentScroller}>
          <StatementDocument statement={statement} width="narrow" />
        </div>
      </section>
    );
  }

  return (
    <article className={styles.message} aria-label={subject}>
      <header className={styles.mailHeader}>
        <strong>Mail</strong>
        <span>Inbox</span>
      </header>
      <div className={styles.messageScroller}>
        <h1>{subject}</h1>
        <dl className={styles.envelope}>
          <div>
            <dt>From</dt>
            <dd>{statement.brand.companyName || 'Your company'}</dd>
          </div>
          <div>
            <dt>To</dt>
            <dd>{statement.account.holder}</dd>
          </div>
        </dl>
        <p>The Platform sends your monthly statement by email.</p>
        <button
          type="button"
          className={styles.attachment}
          aria-label={`Open ${subject} attachment`}
          {...pressable({ onClick: () => setAttachmentOpen(true) }, true)}
        >
          <span className={styles.attachmentIcon}>
            <DocumentIcon />
          </span>
          <span>
            <strong>{subject}.pdf</strong>
            <small>PDF document</small>
          </span>
        </button>
      </div>
    </article>
  );
}

function DocumentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path
        d="M5.5 2.75h7.25l3.75 3.75v12.75h-11V2.75Zm7.25 0V6.5h3.75M8 10h6M8 13h6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
