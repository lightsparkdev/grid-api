'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { IconCode } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCode';
import { TextMorph } from 'torph/react';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { cubicBezierCss, easeOutSnappy, easeOutSwift, motionTransition } from '@/lib/easing';
import { ApiCallList } from './ApiCallList';
import { ApiPanelEmpty } from './ApiPanelEmpty';
import type { Entry } from './types';
import styles from './ApiPanel.module.scss';

interface ApiPanelProps {
  entries: Entry[];
}

// Graceful skeleton ⇄ live-calls swap — blur-fade so the first call doesn't pop.
const SWAP_IN = motionTransition(easeOutSnappy, 0.35);
const SWAP_OUT = motionTransition(easeOutSnappy, 0.2);
const SWAP_HIDDEN = { opacity: 0, filter: 'blur(8px)' };
const SWAP_REST = { opacity: 1, filter: 'blur(0px)' };

// New-call signifiers fade out (snappy) once the calls are seen.
const SIGNIFIER_FADE = motionTransition(easeOutSnappy, 0.3);
// Dwell before clearing so the calls don't vanish the instant they're in view.
const SEEN_DELAY_MS = 1500;
// The count pill bounces up in, then hops up each time the count ticks up.
// Dock-bounce feel: softer stiffness (slower, pronounced) with enough damping
// that it settles in a bounce or two instead of buzzing at the end.
const PILL_IN = { type: 'spring' as const, stiffness: 400, damping: 13, mass: 0.5 };
const PILL_PULSE = { duration: 0.4, ease: easeOutSnappy };
const PILL_MORPH_MS = 280;

export function ApiPanel({ entries }: ApiPanelProps) {
  const isEmpty = entries.length === 0;
  // New-call signifiers (stacked layout only): a count pill on the header + a dot
  // per unseen call. "Seen" = the calls have scrolled into view — an
  // IntersectionObserver on the body marks everything present (and anything that
  // arrives while it's in view) as seen, so the markers clear once you look.
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyVisible, setBodyVisible] = useState(false);
  const [seenKeys, setSeenKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    let io: IntersectionObserver | null = null;
    // Observe against the actual scroll container (the stacked layout scrolls
    // inside `stackCol`), not the viewport: a viewport-rooted observer is
    // unreliable in the docs iframe and reports the calls as "in view" before
    // you've scrolled. Falls back to the viewport when nothing scrolls (mobile).
    // Re-detected on resize — the embed iframe mounts at 0×0, then gets sized.
    const attach = () => {
      io?.disconnect();
      let root: HTMLElement | null = null;
      let node = el.parentElement;
      while (node && node !== document.body && node !== document.documentElement) {
        const overflowY = getComputedStyle(node).overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll') {
          root = node;
          break;
        }
        node = node.parentElement;
      }
      io = new IntersectionObserver(([e]) => setBodyVisible(e.isIntersecting), {
        root,
        // Require a good chunk of the calls to scroll up before they count as
        // "viewed" — a tiny scroll shouldn't clear them.
        rootMargin: '0px 0px -200px 0px',
      });
      io.observe(el);
    };
    attach();
    window.addEventListener('resize', attach);
    return () => {
      io?.disconnect();
      window.removeEventListener('resize', attach);
    };
  }, []);

  // Remember calls seen while the panel is in view (incl. ones that arrive then),
  // so scrolling away doesn't make already-seen calls read as new again.
  useEffect(() => {
    if (!bodyVisible) return;
    const t = setTimeout(() => {
      setSeenKeys((prev) => {
        let changed = false;
        const next = new Set(prev);
        for (const e of entries) {
          if (!next.has(e.key)) {
            next.add(e.key);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, SEEN_DELAY_MS);
    return () => clearTimeout(t);
  }, [bodyVisible, entries]);

  // Whatever arrived since the last look (cleared on a dwell once in view).
  const newKeys = useMemo(
    () => new Set(entries.filter((e) => !seenKeys.has(e.key)).map((e) => e.key)),
    [entries, seenKeys],
  );

  // Bounce the pill in when it appears, then pulse it each time the count climbs.
  const pillControls = useAnimationControls();
  const newCount = newKeys.size;
  const prevCount = useRef(0);
  useEffect(() => {
    if (newCount === 0) {
      prevCount.current = 0;
      return;
    }
    if (prevCount.current === 0) {
      void pillControls.start({ y: 0, opacity: 1, transition: PILL_IN });
    } else if (newCount > prevCount.current) {
      void pillControls.start({ y: [0, -6, 0], opacity: 1, transition: PILL_PULSE });
    }
    prevCount.current = newCount;
  }, [newCount, pillControls]);

  return (
    <section className={styles.panel}>
      <PanelHeader
        className={styles.headerStacked}
        icon={<IconCode size={20} />}
        title="API calls"
        badge={
          <AnimatePresence>
            {newCount > 0 ? (
              <motion.span
                key="new-pill"
                className={styles.newPill}
                initial={{ y: 10, opacity: 0 }}
                animate={pillControls}
                exit={{ opacity: 0, transition: SIGNIFIER_FADE }}
              >
                <TextMorph as="span" duration={PILL_MORPH_MS} ease={cubicBezierCss(easeOutSwift)}>
                  {String(newCount)}
                </TextMorph>
              </motion.span>
            ) : null}
          </AnimatePresence>
        }
      />
      <div ref={bodyRef} className={clsx(styles.body, isEmpty && styles.bodyEmpty)}>
        <AnimatePresence mode="wait" initial={false}>
          {isEmpty ? (
            <motion.div
              key="empty"
              className={styles.swapLayer}
              animate={SWAP_REST}
              exit={{ ...SWAP_HIDDEN, transition: SWAP_OUT }}
              transition={SWAP_IN}
            >
              <ApiPanelEmpty />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              className={styles.swapLayer}
              initial={SWAP_HIDDEN}
              animate={SWAP_REST}
              transition={SWAP_IN}
            >
              <ApiCallList entries={entries} newKeys={newKeys} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
