'use client';

import { AnimatePresence, motion } from 'motion/react';
import { authCta, type AuthMethod } from '@/data/flow';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { AUTH_METHOD_ORDER } from '@/apps/shared/authMethodIcons';
import { WIGGLE_AUTH_METHOD_ICONS } from '../icons';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import styles from './AuthCtaList.module.scss';

// Toggling a method in Configure adds/removes its CTA — blur-fade in/out, snappy.
const CTA_TOGGLE = motionTransition(easeOutSnappy, 0.32);
// On dismiss, the CTAs blur-fade out bottom-up (0 = bottom-most).
const contentOut = (fromBottom: number) =>
  motionTransition(easeOutQuick, 0.18, { delay: fromBottom * 0.025 });
const CTA_COLLAPSED = { height: 0, opacity: 0, marginBottom: 0, filter: 'blur(8px)' };
const CTA_SHOWN = { height: 'auto' as const, opacity: 1, marginBottom: 12, filter: 'blur(0px)' };
const CTA_DISMISSED = { height: 'auto' as const, opacity: 0, marginBottom: 12, filter: 'blur(8px)' };

function AuthCta({
  method,
  index,
  total,
  dismissed,
  busy,
  onSignIn,
}: {
  method: AuthMethod;
  index: number;
  total: number;
  dismissed: boolean;
  busy?: boolean;
  onSignIn: (method: AuthMethod) => void;
}) {
  const Icon = WIGGLE_AUTH_METHOD_ICONS[method];
  return (
    <motion.div
      className={styles.action}
      initial={CTA_COLLAPSED}
      animate={dismissed ? CTA_DISMISSED : CTA_SHOWN}
      exit={CTA_COLLAPSED}
      transition={dismissed ? contentOut(total - 1 - index) : CTA_TOGGLE}
    >
      <ContentAreaButton
        icon={<Icon size={24} />}
        disabled={busy || dismissed}
        onClick={() => onSignIn(method)}
      >
        {authCta(method)}
      </ContentAreaButton>
    </motion.div>
  );
}

interface AuthCtaListProps {
  /** Methods selected in Configure — rendered in the canonical order. */
  methods: AuthMethod[];
  dismissed?: boolean;
  busy?: boolean;
  onSignIn: (method: AuthMethod) => void;
}

/** Shared auth-method CTA column (reused across skins). Each CTA animates its
 *  real height on add/remove so the column reflows; all blur-fade out on dismiss. */
export function AuthCtaList({ methods: selected, dismissed = false, busy, onSignIn }: AuthCtaListProps) {
  const methods = AUTH_METHOD_ORDER.filter((id) => selected.includes(id));
  return (
    <div className={styles.actions}>
      <AnimatePresence initial={false}>
        {methods.map((method, i) => (
          <AuthCta
            key={method}
            method={method}
            index={i}
            total={methods.length}
            dismissed={dismissed}
            busy={busy}
            onSignIn={onSignIn}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
