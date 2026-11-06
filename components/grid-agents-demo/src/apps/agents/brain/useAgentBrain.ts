import { useCallback, useEffect, useRef, useState } from 'react';
import { ACTIONS, type ActionId } from '@/data/actions';
import type { AgentEvent } from '@/data/agentEvents';
import type { Beat, Chip, Said, StoredMessage } from '../conversation';
import { FLOWS, planFor, type FlowContext, type FlowParams } from '../flows';

/** A tile's jump: put this flow's line in the composer. */
export interface FlowEntry {
  nonce: number;
  flow: ActionId;
  variant: number;
  /** What the jump set up on its own (an account, a top-up in USD cents), for the agent to mention. */
  setup?: { connected: boolean; funded: number };
}

/** What the agent says to anything that isn't a flow's line. */
export interface FreeTextReply {
  said: Said;
  /** A flow the reply starts, as if its tile's line had been sent, with the details the person gave. */
  flow?: { id: ActionId; variant: number; params?: FlowParams };
  /** Replies the person might tap instead of typing, under a question. */
  suggestions?: Chip[];
}

type Decision = 'allow' | 'deny' | 'cancel';
type NewMessage = StoredMessage extends infer M ? (M extends StoredMessage ? Omit<M, 'id'> : never) : never;

const MAX_MESSAGES = 200;

/** Under the greeting: things to try, so it's clear you can just type. A tap sends one as the person's own message, so each is in their words. */
const STARTERS: Chip[] = [{ label: 'Set up a balance' }, { label: 'Send money abroad' }, { label: 'What can you do?' }];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Which option a typed reply picks: its number, or its label; -1 for neither. */
function typedChoice(text: string, chips: Chip[]) {
  const n = Number.parseInt(text, 10);
  const lower = text.toLowerCase();
  if (n >= 1 && n <= chips.length) return n - 1;
  return chips.findIndex((c) => lower.includes(c.label.toLowerCase()) || c.label.toLowerCase().includes(lower));
}

/** A reply that's just an amount in dollars: "75", "$1,000", "75 bucks", "make it 100", "2k". */
const AMOUNT = /^\s*(?:(?:add|make it|maybe|about|around|like|just)\s+)*\$?\s*(\d[\d,]*(?:\.\d{1,2})?)\s*(k)?\s*(?:usd|dollars?|bucks)?\s*(?:please|pls)?\s*[.!]*\s*$/i;

/** A reply that means all of it. */
const ALL = /^\s*(?:all|all of it|everything|the whole thing|the whole balance|max)\s*[.!]*\s*$/i;

/** Dollars from a typed reply; "everything" is `all` cents when the question has a ceiling. */
function typedAmount(text: string, all?: number) {
  if (all && ALL.test(text)) return all / 100;
  const m = AMOUNT.exec(text);
  if (!m) return undefined;
  const usd = Number(m[1].replace(/,/g, '')) * (m[2] ? 1000 : 1);
  return usd > 0 ? usd : undefined;
}

/** A reply that approves an open ask; anything else declines it. */
const YES = /^\s*(y|yes|yeah|yep|yup|ok|okay|sure|approve|approved|do it|go ahead|send it)\b/i;
/** A reply that only declines it; anything that's neither is a new request, answered once the ask is declined. */
const NO = /^\s*(n|no|nope|nah|cancel|decline|deny|stop|don'?t|not now|never ?mind)\b/i;

/** A run's handle: cancelling it settles whatever it was waiting on. */
interface Run {
  flow: ActionId | null;
  cancelled: boolean;
}

/**
 * The conversation every app shares, hosted above the apps so switching
 * between them only changes the face. A tile jumps here (its line lands in the
 * composer); the visitor sends it and makes every choice after that. Each
 * beat that touches Grid fires `onEvent` as it happens.
 */
export function useAgentBrain({
  entry,
  context,
  onEvent,
  onActiveFlow,
  onRun,
  onCompleted,
  reply,
  readsFor = 0,
}: {
  entry?: FlowEntry;
  context: () => Omit<FlowContext, 'variant'>;
  onEvent: (event: AgentEvent) => void;
  /** The flow in the composer or playing, or null at rest. */
  onActiveFlow?: (flow: ActionId | null) => void;
  /** A flow starts playing: its Grid calls group under it from here. */
  onRun?: (flow: ActionId) => void;
  onCompleted?: (flow: ActionId) => void;
  /** Answers free text (the model, behind /api/agent). */
  reply: (text: string) => Promise<FreeTextReply>;
  /** How long the agent takes to read each of your messages before it reacts, types or carries on (ms). */
  readsFor?: number;
}) {
  const [messages, setMessages] = useState<StoredMessage[]>(() => [
    { id: 0, kind: 'stamp', text: 'Today' },
    { id: 1, kind: 'them', said: { key: 'greeting' }, typing: false },
    { id: 2, kind: 'chips', chips: STARTERS, picked: null },
  ]);
  // The clock is the visitor's, so it lands after hydration.
  useEffect(() => {
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setMessages((all) => all.map((m) => (m.id === 0 && m.kind === 'stamp' ? { ...m, text: `Today ${time}` } : m)));
  }, []);
  const [composer, setComposer] = useState('');
  const [running, setRunning] = useState<ActionId | null>(null);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(3);
  const runRef = useRef<Run | null>(null);
  const decideRef = useRef<((d: Decision) => void) | null>(null);
  const pickRef = useRef<((i: number) => void) | null>(null);
  const authRef = useRef<(() => void) | null>(null);
  /** The open choice's options, so a typed reply can pick one. */
  const openChips = useRef<Chip[] | null>(null);
  const pickedByText = useRef(false);
  /** An open question for an amount, waiting on what they type. */
  const amountRef = useRef<{ take: (usd: number) => void; all?: number } | null>(null);
  const [awaitingAmount, setAwaitingAmount] = useState(false);
  /** Something said over an open ask that wasn't a yes or a no: answered once the ask is declined and the run ends. */
  const queued = useRef<string | null>(null);
  const askRef = useRef<((text: string, meant?: string, shown?: boolean) => Promise<void>) | null>(null);
  /** Suggested replies under the agent's last answer: a tap sends one as if typed. */
  const suggested = useRef<{ id: number; chips: Chip[] } | null>({ id: 2, chips: STARTERS });

  const cb = useRef({ context, onEvent, onActiveFlow, onRun, onCompleted, reply, readsFor });
  cb.current = { context, onEvent, onActiveFlow, onRun, onCompleted, reply, readsFor };
  /** Runs once the agent has read what you just sent. */
  const afterReading = (f: () => void) => {
    if (cb.current.readsFor > 0) setTimeout(f, cb.current.readsFor);
    else f();
  };

  const push = useCallback((m: NewMessage) => {
    const id = nextId.current++;
    setMessages((list) => [...list, { ...m, id } as StoredMessage].slice(-MAX_MESSAGES));
    return id;
  }, []);
  const patch = useCallback((id: number, f: (m: StoredMessage) => StoredMessage) => {
    setMessages((list) => list.map((m) => (m.id === id ? f(m) : m)));
  }, []);
  /** Suggestions go stale once the person says anything else. */
  const dropSuggestions = useCallback(
    (picked?: number) => {
      const s = suggested.current;
      if (!s) return;
      suggested.current = null;
      patch(s.id, (m) => (m.kind === 'chips' ? (picked === undefined ? { ...m, expired: true } : { ...m, picked }) : m));
    },
    [patch],
  );

  /** The agent's status leaves once it has something to say or show. */
  const clearWork = useCallback(() => {
    setMessages((list) => (list.some((m) => m.kind === 'work') ? list.filter((m) => m.kind !== 'work') : list));
  }, []);
  const show = useCallback(
    (m: NewMessage) => {
      clearWork();
      return push(m);
    },
    [clearWork, push],
  );

  /** Stop whatever is playing: open asks and chips expire, typing settles. */
  const cancelRun = useCallback(() => {
    queued.current = null;
    const run = runRef.current;
    if (!run) return;
    run.cancelled = true;
    runRef.current = null;
    decideRef.current?.('cancel');
    pickRef.current?.(-1);
    amountRef.current?.take(-1);
    authRef.current?.();
    decideRef.current = pickRef.current = amountRef.current = authRef.current = null;
    setAwaitingAmount(false);
    setMessages((list) =>
      list
        .filter((m) => m.kind !== 'work')
        .map((m) => {
          if (m.kind === 'ask' && (m.state === 'open' || m.state === 'pressing' || m.state === 'authing')) return { ...m, state: 'expired' };
          if (m.kind === 'chips' && m.picked === null) return { ...m, expired: true };
          if (m.kind === 'them' && m.typing) return { ...m, typing: false };
          return m;
        }),
    );
    setRunning(null);
    setBusy(false);
  }, []);

  const play = useCallback(
    async (beats: Beat[], run: Run): Promise<boolean> => {
      for (const b of beats) {
        if (run.cancelled) return false;
        if ('work' in b) {
          setMessages((list) => {
            const rest = list.filter((m) => m.kind !== 'work');
            return [...rest, { id: nextId.current++, kind: 'work', key: b.work, params: b.params } as StoredMessage].slice(-MAX_MESSAGES);
          });
          await sleep(b.ms);
        } else if ('products' in b) {
          show({ kind: 'products', key: b.products });
          await sleep(1200);
        } else if ('subagent' in b) {
          const id = show({ kind: 'subagent', key: b.subagent, params: b.params, done: false });
          await sleep(b.ms);
          if (run.cancelled) return false;
          patch(id, (m) => (m.kind === 'subagent' ? { ...m, done: true } : m));
          await sleep(500);
        } else if ('react' in b) {
          setMessages((list) => {
            const last = [...list].reverse().find((m) => m.kind === 'me');
            return last ? list.map((m) => (m === last ? { ...m, react: b.react } : m)) : list;
          });
          await sleep(400);
        } else if ('meta' in b) {
          show({ kind: 'meta', key: b.meta, params: b.params });
          await sleep(500);
        } else if ('divider' in b) {
          show({ kind: 'divider', text: b.divider });
        } else if ('say' in b) {
          const id = show({ kind: 'them', said: { key: b.say, params: b.params }, sender: b.sender, typing: true });
          await sleep(700);
          if (run.cancelled) return false;
          patch(id, (m) => (m.kind === 'them' ? { ...m, typing: false } : m));
          await sleep(900);
        } else if ('card' in b) {
          show({ kind: 'card', key: b.card, params: b.params });
          await sleep(1000);
        } else if ('emit' in b) {
          cb.current.onEvent(b.emit);
        } else if ('pause' in b) {
          await sleep(b.pause);
        } else if ('when' in b) {
          if (!(await play(b.when(), run))) return false;
        } else if ('ask' in b) {
          const id = show({ kind: 'ask', key: b.ask, params: b.params, state: 'open' });
          setBusy(false);
          const decision = await new Promise<Decision>((r) => (decideRef.current = r));
          decideRef.current = null;
          if (decision === 'cancel' || run.cancelled) return false;
          setBusy(true);
          if (decision === 'deny') {
            patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'denied' } : m));
            await sleep(500);
            if (!(await play(b.deny, run))) return false;
            continue;
          }
          patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'pressing' } : m));
          await sleep(160);
          if (b.faceId) {
            patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'authing' } : m));
            await Promise.race([new Promise<void>((r) => (authRef.current = r)), sleep(4500)]);
            authRef.current = null;
            if (run.cancelled) return false;
          }
          patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'done' } : m));
          await sleep(600);
          if (!(await play(b.allow, run))) return false;
        } else if ('chips' in b) {
          const id = show({ kind: 'chips', chips: b.chips, picked: null });
          setBusy(false);
          openChips.current = b.chips;
          const picked = await new Promise<number>((r) => (pickRef.current = r));
          pickRef.current = null;
          openChips.current = null;
          if (picked < 0 || run.cancelled) return false;
          setBusy(true);
          patch(id, (m) => (m.kind === 'chips' ? { ...m, picked } : m));
          if (b.reply && !pickedByText.current) push({ kind: 'me', text: b.chips[picked].label });
          pickedByText.current = false;
          await sleep(600);
          if (!(await play(b.then(picked), run))) return false;
        } else if ('amount' in b) {
          setBusy(false);
          setAwaitingAmount(true);
          const usd = await new Promise<number>((r) => (amountRef.current = { take: r, all: b.all }));
          amountRef.current = null;
          setAwaitingAmount(false);
          if (usd <= 0 || run.cancelled) return false;
          setBusy(true);
          if (!(await play(b.then(usd), run))) return false;
        }
      }
      return !run.cancelled;
    },
    [push, patch, show],
  );

  const start = useCallback(
    async (flow: ActionId | null, beats: Beat[], after = 0) => {
      const run: Run = { flow, cancelled: false };
      runRef.current = run;
      if (flow) cb.current.onRun?.(flow);
      setRunning(flow);
      setBusy(true);
      if (after > 0) await sleep(after);
      const finished = !run.cancelled && (await play(beats, run));
      if (runRef.current !== run) return;
      clearWork();
      runRef.current = null;
      setRunning(null);
      setBusy(false);
      if (finished && flow) cb.current.onCompleted?.(flow);
      const next = queued.current;
      queued.current = null;
      if (next) void askRef.current?.(next, next, false);
    },
    [play, clearWork],
  );

  // A tile's jump, applied once: whatever was playing stops, and the tile's line goes out as the visitor's message.
  const lastNonce = useRef(0);
  useEffect(() => {
    if (!entry || entry.nonce === lastNonce.current) return;
    lastNonce.current = entry.nonce;
    const def = ACTIONS.find((a) => a.id === entry.flow)!;
    const text = def.prompts[entry.variant % def.prompts.length];
    cancelRun();
    dropSuggestions();
    push({ kind: 'me', text });
    const ctx: FlowContext = { ...cb.current.context(), variant: entry.variant };
    const beats = FLOWS[entry.flow](ctx);
    // A shortcut that set things up on its own says so, right after it reacts.
    const setup = entry.setup;
    if (setup && (setup.connected || setup.funded > 0)) {
      const note: Beat = { say: 'setup.auto', params: { connected: setup.connected ? 1 : 0, funded: setup.funded } };
      beats.splice(beats[0] && 'react' in beats[0] ? 1 : 0, 0, note);
    }
    void start(entry.flow, beats, cb.current.readsFor);
  }, [entry, cancelRun, dropSuggestions, push, start]);

  /** A control in the thread (the balance card's Add money) asks as the visitor would, with its tile's line. */
  const prompt = useCallback(
    (flow: ActionId) => {
      if (runRef.current) return;
      dropSuggestions();
      const def = ACTIONS.find((a) => a.id === flow)!;
      push({ kind: 'me', text: def.prompts[0] });
      const ctx: FlowContext = { ...cb.current.context(), variant: 0 };
      void start(flow, FLOWS[flow](ctx), cb.current.readsFor);
    },
    [push, start, dropSuggestions],
  );

  const activeFlow = running;
  useEffect(() => {
    cb.current.onActiveFlow?.(activeFlow);
  }, [activeFlow]);

  /** Free text to the model: its reply, then the flow it starts or the replies it suggests. */
  const ask = useCallback(
    async (text: string, meant = text, shown = true) => {
      if (shown) push({ kind: 'me', text, ...(meant !== text ? { meant } : {}) });
      setBusy(true);
      const replying = cb.current.reply(meant);
      if (cb.current.readsFor > 0) await sleep(cb.current.readsFor);
      const typingId = push({ kind: 'them', said: { text: '' }, typing: true });
      const answer = await replying;
      // Nothing to say (the flow it starts speaks first): the typing bubble just goes.
      const silent = 'text' in answer.said && !answer.said.text;
      if (silent) setMessages((list) => list.filter((m) => m.id !== typingId));
      else patch(typingId, (m) => (m.kind === 'them' ? { ...m, said: answer.said, typing: false } : m));
      setBusy(false);
      if (answer.flow) {
        const ctx: FlowContext = { ...cb.current.context(), variant: answer.flow.variant, params: answer.flow.params };
        if (!silent) await sleep(700);
        void start(answer.flow.id, planFor(answer.flow.id, ctx));
      } else if (answer.suggestions?.length) {
        await sleep(350);
        const id = push({ kind: 'chips', chips: answer.suggestions, picked: null });
        suggested.current = { id, chips: answer.suggestions };
      }
    },
    [push, patch, start],
  );

  askRef.current = ask;

  const send = useCallback(async () => {
    const text = composer.trim();
    if (!text) return;
    // An open ask takes a text reply as its answer.
    const decide = decideRef.current;
    if (decide) {
      decideRef.current = null;
      setComposer('');
      push({ kind: 'me', text });
      const yes = YES.test(text);
      if (!yes && !NO.test(text)) queued.current = text;
      afterReading(() => decide(yes ? 'allow' : 'deny'));
      return;
    }
    // An open question for an amount takes one; anything else lapses it and the agent answers what they said.
    const open = amountRef.current;
    if (open) {
      const usd = typedAmount(text, open.all);
      setComposer('');
      if (usd === undefined) {
        cancelRun();
        await ask(text);
        return;
      }
      amountRef.current = null;
      push({ kind: 'me', text });
      afterReading(() => open.take(usd));
      return;
    }
    // An open choice takes a typed option: its number, or its label.
    const chips = openChips.current;
    const pick = pickRef.current;
    if (chips && pick) {
      const i = typedChoice(text, chips);
      // Something else entirely: the choice lapses and the agent answers what they said.
      if (i < 0) {
        cancelRun();
        setComposer('');
        await ask(text);
        return;
      }
      pickRef.current = null;
      setComposer('');
      push({ kind: 'me', text });
      pickedByText.current = true;
      afterReading(() => pick(i));
      return;
    }
    if (runRef.current || busy) return;
    setComposer('');
    // A typed number picks a suggestion (Instinct lists them as a numbered text); the model reads what it meant.
    const s = suggested.current;
    const n = Number.parseInt(text, 10);
    const i = s && String(n) === text && n >= 1 && n <= s.chips.length ? n - 1 : -1;
    dropSuggestions(i >= 0 ? i : undefined);
    await ask(text, i >= 0 ? s!.chips[i].label : text);
  }, [composer, busy, push, ask, dropSuggestions, cancelRun]);

  /** The visitor's tap on the open ask's primary button. */
  const allow = useCallback(() => decideRef.current?.('allow'), []);
  const deny = useCallback(() => decideRef.current?.('deny'), []);
  const pick = useCallback(
    (i: number) => {
      if (pickRef.current) return pickRef.current(i);
      const s = suggested.current;
      if (!s || runRef.current || busy || !s.chips[i]) return;
      setComposer((c) => (s.chips.some((chip) => chip.label === c) ? '' : c));
      dropSuggestions(i);
      void ask(s.chips[i].label);
    },
    [busy, ask, dropSuggestions],
  );
  /** Face ID finished its scan and checkmark. */
  const authed = useCallback(() => authRef.current?.(), []);

  useEffect(() => () => cancelRun(), [cancelRun]);

  const authing = messages.some((m) => m.kind === 'ask' && m.state === 'authing');
  const asking = messages.some((m) => m.kind === 'ask' && (m.state === 'open' || m.state === 'pressing' || m.state === 'authing'));
  const answering = messages.some((m) => (m.kind === 'ask' && m.state === 'open') || (m.kind === 'chips' && m.picked === null && !m.expired));

  return {
    messages,
    composer,
    setComposer,
    send,
    canSend: composer.trim().length > 0 && (answering || awaitingAmount || (!running && !busy)),
    busy,
    allow,
    deny,
    pick,
    prompt,
    authed,
    authing,
    asking,
    activeFlow,
  };
}

export type AgentBrain = ReturnType<typeof useAgentBrain>;
