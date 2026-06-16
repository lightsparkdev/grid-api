'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FrostPanel, PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import styles from './GlassNotification.module.scss';

const RADIUS = 28.8;
const EXIT_MS = 320;

// The swoop is SPLIT so the FrostPanel keeps its backdrop-filter blur: the capsule
// carries only the TRANSFORM (the squash drop), while the fade + motion-blur ride
// the CONTENT inside the frost. opacity/filter on the capsule itself would make it
// a backdrop-root and silently kill the blur — so they live on the child instead.
const SWOOP_TRANSITION = {
  y: { type: 'spring' as const, visualDuration: 0.55, bounce: 0.45 },
  scaleX: { type: 'spring' as const, visualDuration: 0.6, bounce: 0.3 },
  scaleY: { type: 'spring' as const, visualDuration: 0.55, bounce: 0.4 },
};
const SWOOP_HIDDEN = { y: -150, scaleX: 0.25, scaleY: 0.55 };
const SWOOP_SHOWN = { y: 0, scaleX: 1, scaleY: 1 };
const SWOOP_DISMISSED = { y: -150, scaleX: 0.5, scaleY: 0.7 };

const FADE_TRANSITION = {
  opacity: motionTransition(easeOutQuick, 0.2),
  filter: motionTransition(easeOutQuick, 0.3),
};
const FADE_HIDDEN = { opacity: 0, filter: 'blur(10px)' };
const FADE_SHOWN = { opacity: 1, filter: 'blur(0px)' };
const FADE_DISMISSED = { opacity: 0, filter: 'blur(8px)' };

interface FrostedNotificationProps {
  show: boolean;
  icon: string;
  badge?: ReactNode | string;
  title: string;
  body: string;
  bodyLines?: number;
  time?: string;
  onTap?: () => void;
}

/**
 * Cheap, cross-browser glass notification: a GPU `backdrop-filter` frost over the
 * real screen + a specular squircle rim (FrostPanel), instead of an SVG
 * displacement lens (which tanks Safari's framerate over moving content). The
 * original swoop is preserved by splitting it — transform on the capsule, fade +
 * motion-blur on the content — so the frost's blur survives.
 */
export function FrostedNotification({
  show,
  icon,
  badge,
  title,
  body,
  bodyLines = 1,
  time = 'now',
  onTap,
}: FrostedNotificationProps) {
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
  const { ref: shadowRef, style: shadowClipStyle } = useSquircleClip<HTMLSpanElement>({
    cornerRadii: [RADIUS, RADIUS, RADIUS, RADIUS],
  });

  // Hold the mount through the exit so the swoop-out + fade-out can play.
  const [mounted, setMounted] = useState(show);
  useEffect(() => {
    if (show) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [show]);

  if (!mounted) return <div className={styles.layer} aria-live="polite" />;

  const multiline = bodyLines > 1;

  return (
    <div className={styles.layer} aria-live="polite">
      <motion.button
        type="button"
        className={styles.capsule}
        initial={reduceMotion ? false : SWOOP_HIDDEN}
        animate={reduceMotion ? { y: 0, scaleX: 1, scaleY: 1 } : show ? SWOOP_SHOWN : SWOOP_DISMISSED}
        transition={reduceMotion ? { duration: 0 } : SWOOP_TRANSITION}
        onClick={onTap}
      >
        <span className={styles.shadowBlob} aria-hidden>
          <span ref={shadowRef} className={styles.shadowShape} style={shadowClipStyle} />
        </span>
        <FrostPanel
          className={styles.glass}
          radius={RADIUS}
          cornerSmoothing={PHONE_SHELL_GLASS.cornerSmoothing}
          tint={theme === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.6)'}
          tintBlur={4}
          edge="rgba(255, 255, 255, 0.16)"
        >
          <motion.span
            className={styles.inner}
            data-multiline={multiline || undefined}
            initial={reduceMotion ? { opacity: 0 } : FADE_HIDDEN}
            animate={reduceMotion ? { opacity: show ? 1 : 0 } : show ? FADE_SHOWN : FADE_DISMISSED}
            transition={reduceMotion ? { duration: 0.2 } : FADE_TRANSITION}
          >
            <span className={styles.iconWrap}>
              <img className={styles.icon} src={icon} alt="" draggable={false} />
              {badge != null && (
                <span className={styles.badge} aria-hidden>
                  {typeof badge === 'string' ? <img src={badge} alt="" draggable={false} /> : badge}
                </span>
              )}
            </span>
            <span className={styles.texts}>
              <span className={styles.titleRow}>
                <span className={styles.title}>{title}</span>
                <span className={styles.time}>{time}</span>
              </span>
              <span
                className={styles.body}
                data-clamp={multiline || undefined}
                style={multiline ? { WebkitLineClamp: bodyLines } : undefined}
              >
                {body}
              </span>
            </span>
          </motion.span>
        </FrostPanel>
      </motion.button>
    </div>
  );
}
