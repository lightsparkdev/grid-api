import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { TextMorph } from 'torph/react';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconCoin1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCoin1';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconGauge } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGauge';
import { IconLightning } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLightning';
import { IconMagicWand } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMagicWand';
import { IconPaperPlane } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPaperPlane';
import { IconPlusMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusMedium';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import type { ActionId } from '@/data/actions';
import { FLOW_ICONS, type FlowIconCmp } from '@/data/flowIcons';
import { smoothShapeClip } from '@/lib/squircle/path';
import type { AgentAsk, AskState, Chip, ChipGlyph } from '../conversation';
import { askButtons, MORPH } from '../parts';
import styles from './DuetChoices.module.scss';

const GLYPH: Record<ChipGlyph, FlowIconCmp> = {
  card: IconCreditCard1,
  bank: IconBank,
  coin: IconCoin1,
  bolt: IconLightning,
  check: IconCheckmark1,
  wallet: IconWallet1,
};

/** iOS continuous corners, as the chat bubbles draw them (styles/_corners.scss). */
const SMOOTHING = 0.6;

/**
 * Duet's cards with their lift: each card (the children, or what `cards` selects) is clipped to continuous corners at
 * its own CSS radius, a pill's ends as a smooth capsule, and the shadow is a drop shadow around the clips, which a
 * box shadow on the card can't be.
 */
export function Lift({ children, cards = ':scope > *' }: { children: ReactNode; cards?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const shape = (el: HTMLElement) => {
      const cs = getComputedStyle(el);
      const inset = cs.boxSizing === 'border-box' ? 0 : el.offsetWidth - el.clientWidth + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const insetY = cs.boxSizing === 'border-box' ? 0 : el.offsetHeight - el.clientHeight + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const w = parseFloat(cs.width) + inset;
      const h = parseFloat(cs.height) + insetY;
      const r = parseFloat(cs.borderTopLeftRadius) || 0;
      if (w > 0 && h > 0) el.style.clipPath = smoothShapeClip(w, h, [r, r, r, r], SMOOTHING, true);
    };
    const ro = new ResizeObserver((entries) => entries.forEach((e) => shape(e.target as HTMLElement)));
    const seen = new WeakSet<Element>();
    const watch = () =>
      root.querySelectorAll<HTMLElement>(cards).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        ro.observe(el);
      });
    const mo = new MutationObserver(watch);
    mo.observe(root, { childList: true, subtree: true });
    watch();
    return () => {
      mo.disconnect();
      ro.disconnect();
    };
  }, [cards]);
  return (
    <div ref={ref} className={styles.lift}>
      {children}
    </div>
  );
}

/** The ways Duet can be set up to pay, as its connections list names them. */
export const SETUP: Partial<Record<ActionId, { title: string; detail: string; Icon: FlowIconCmp }>> = {
  connect: {
    title: 'Duet balance',
    detail: 'Its own account, with limits you set',
    Icon: IconWallet1,
  },
  card: {
    title: 'Credit or debit card',
    detail: 'Save it once and I’ll pay when you ask',
    Icon: IconCreditCard1,
  },
  bank: {
    title: 'Bank account',
    detail: 'Move money in and out, in 65+ countries',
    Icon: IconBank,
  },
};

/** A suggestion's mark: what it is, else the setup or flow it starts, else a question or a request. */
const iconFor = (c: Chip) =>
  c.glyph ? GLYPH[c.glyph] : c.flow ? (SETUP[c.flow]?.Icon ?? FLOW_ICONS[c.flow]) : c.label.endsWith('?') ? IconMagicWand : IconPaperPlane;

interface Listed {
  /** Where the option sits in the message's chips, which is what a pick reports. */
  index: number;
  chip: Chip;
}

/** A choice with a line under each option: a card apiece. The pick keeps a check, and the rest step back. */
export function OptionList({ items, picked, settled, onPick }: { items: Listed[]; picked: number | null; settled: boolean; onPick: (i: number) => void }) {
  return (
    <Lift cards=":scope > * > *">
      <div className={styles.options} data-settled={settled || undefined}>
        {items.map(({ index, chip }) => {
          const Icon = iconFor(chip);
          return (
            <button
              key={chip.label}
              type="button"
              className={styles.option}
              data-picked={picked === index || undefined}
              disabled={settled}
              onClick={() => onPick(index)}
            >
              <span className={styles.tile}>
                <Icon size={22} />
              </span>
              <span className={styles.text}>
                <b>{chip.label}</b>
                {chip.detail && <small>{chip.detail}</small>}
              </span>
              {picked === index && <IconCheckmark1 size={18} className={styles.check} />}
            </button>
          );
        })}
      </div>
    </Lift>
  );
}

/** Ways to set Duet up, as one card of connections: each with a plus, a check once it's the one; a Not now under them. */
export function ConnectList({
  items,
  picked,
  settled,
  onPick,
  notNow,
}: {
  items: Listed[];
  picked: number | null;
  settled: boolean;
  onPick: (i: number) => void;
  notNow?: number;
}) {
  return (
    <Lift>
      <div className={styles.connect} data-settled={settled || undefined}>
        {items.map(({ index, chip }) => {
          const setup = chip.flow ? SETUP[chip.flow] : undefined;
          const Icon = setup?.Icon ?? iconFor(chip);
          const chosen = picked === index;
          return (
            <div key={chip.label} className={styles.connection} data-picked={chosen || undefined}>
              <span className={styles.logo}>
                <Icon size={22} />
              </span>
              <span className={styles.text}>
                <b>{setup?.title ?? chip.label}</b>
                <small>{setup?.detail ?? chip.detail}</small>
              </span>
              <button type="button" className={styles.plus} aria-label={chip.label} disabled={settled} onClick={() => onPick(index)}>
                {chosen ? <IconCheckmark1 size={18} /> : <IconPlusMedium size={20} />}
              </button>
            </div>
          );
        })}
        {notNow !== undefined && !settled && (
          <button type="button" className={styles.secondary} onClick={() => onPick(notNow)}>
            Not now
          </button>
        )}
      </div>
    </Lift>
  );
}

/** A yes Duet needs (its own account, new limits) as a permission card: what it's asking, why, Not now and Allow. */
export function PermissionCard({ ask, state, onAllow, onDeny }: { ask: AgentAsk; state: AskState; onAllow: () => void; onDeny: () => void }) {
  const b = askButtons(ask, state);
  const Icon = ask.rows?.some((r) => r.icon === 'wallet') ? IconWallet1 : IconGauge;
  return (
    <Lift>
      <div className={styles.permission} data-state={state}>
        <span className={styles.permissionHead}>
          <Icon size={22} />
          <b>{ask.title}</b>
        </span>
        <p>{ask.text}</p>
        <span className={styles.actions} data-single={!ask.deny || undefined}>
          {ask.deny && (
            <button type="button" className={styles.secondary} disabled={b.settled || b.pressing} onClick={onDeny}>
              <TextMorph {...MORPH}>{b.denyLabel}</TextMorph>
            </button>
          )}
          <button
            type="button"
            className={styles.primary}
            data-pressing={b.pressing || undefined}
            data-done={state === 'done' || undefined}
            disabled={b.settled || b.pressing}
            onClick={onAllow}
          >
            <TextMorph {...MORPH}>{b.allowLabel}</TextMorph>
          </button>
        </span>
      </div>
    </Lift>
  );
}
