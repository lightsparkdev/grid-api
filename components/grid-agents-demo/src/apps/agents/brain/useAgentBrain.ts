import { useCallback, useEffect, useRef, useState } from 'react';
import { ACTIONS, type ActionId } from '@/data/actions';
import { BANK_REACH } from '@/data/bankCountries';
import type { AgentEvent } from '@/data/agentEvents';
import { BANK_COUNTRIES } from '@/data/bankCountries';
import { ENDS_TURN, READS_RESULT, type Block, type Say, type ToolCall, type ToolResult, type Turn } from '@/lib/llm/tools';
import type { Beat, Chip, PayTo, Said, StoredMessage } from '../conversation';
import { FLOWS, needsSetup, planFor, topicFor, type FlowContext } from '../flows';
import { accountNow, flowOf, newToolMemory, runTool, topicOf } from '../tools/run';

/** A tile's jump: put this flow's line in the composer. */
export interface FlowEntry {
  nonce: number;
  flow: ActionId;
  variant: number;
  /** What the jump set up on its own (an account, a top-up in USD cents), for the agent to mention. */
  setup?: { connected: boolean; funded: number };
}

/** The model's next step: the tools it calls, or why the page answers with a canned line instead. */
export type StepReply = { calls: ToolCall[] } | { fallback: 'fallback' | 'limited' };

type Decision = 'allow' | 'deny' | 'cancel' | { swap: PayTo };
type NewMessage = StoredMessage extends infer M ? (M extends StoredMessage ? Omit<M, 'id'> : never) : never;

const MAX_MESSAGES = 200;
/** The most model calls one message can take before the agent stops and waits. */
const MAX_STEPS = 6;
/** How much of the conversation the model sees: the latest turns, starting on something the person said. */
const MAX_TURNS = 24;

/** Under the greeting: things to try, so it's clear you can just type. A tap sends one as the person's own message, so each is in their words. */
const STARTERS: Chip[] = [
  { label: 'Set up a balance', flow: 'connect', detail: 'Spend from it, within limits you set' },
  { label: 'Add a card', flow: 'card', detail: 'Save it once, I’ll pay when you ask' },
  { label: 'Send money to friends (US and abroad)', detail: `To banks in ${BANK_REACH} countries` },
  { label: 'What can you do?', detail: 'A quick tour of what I can handle' },
];
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

/** Lines a tool opens with that answer the request themselves: a setup first, a no, or "already done". The model's own
 *  line is dropped for them, so the two don't talk over each other. */
const SPEAKS_FIRST = new Set([
  'fund.amount',
  'cashout.amount',
  'connect.intro',
  'connect.already',
  'cashout.noBalance',
  'cashout.empty',
  'cashout.bank',
  'pay.newRecipient',
  'balance.none',
  'history.none',
  'card.already',
  'bank.already',
  'limits.same',
  'agent.already',
  'getpaid.already',
]);

/** A reply that approves an open ask; anything else declines it. */
const YES = /^\s*(y|yes|yeah|yep|yup|ok|okay|sure|approve|approved|do it|go ahead|send it)\b/i;
/** A reply that only declines it; anything that's neither is a new request, answered once the ask is declined. */
const NO =
  /^\s*(?:(?:actually|wait|oh|ok(?:ay)?|hmm|um|so)[\s,.!]*)*(n|no|nope|nah|cancel|decline|deny|stop|don'?t|not now|never ?mind|forget (?:it|that)|hold off|scratch that)\b/i;

/** A suggested reply as a chip: a country gets its flag. */
function chipOf(label: string): Chip {
  const country = BANK_COUNTRIES.find((c) => c.name.toLowerCase() === label.trim().toLowerCase());
  return country ? { label: country.name, flag: country.code } : { label };
}

const resultBlock = (id: string, result: ToolResult, isError = false): Block => ({ type: 'tool_result', tool_use_id: id, content: JSON.stringify(result).slice(0, 2000), ...(isError && { is_error: true }) });

/** The latest turns, cut so they start on something the person said, with no result left from a call cut off. */
function windowOf(turns: Turn[]): Turn[] {
  const recent = turns.slice(-MAX_TURNS);
  while (recent.length && recent[0].role !== 'user') recent.shift();
  if (!recent.length) return recent;
  const content = recent[0].content.filter((b) => b.type !== 'tool_result');
  return content.length ? [{ ...recent[0], content }, ...recent.slice(1)] : windowOf(recent.slice(1));
}

/** A run's handle: cancelling it settles whatever it was waiting on. */
interface Run {
  flow: ActionId | null;
  cancelled: boolean;
  /** What the person said that started it. */
  request?: string;
  /** They've said something since the agent last did. */
  answered?: boolean;
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
  describe,
  readsFor = 0,
  typesFor = 0,
}: {
  entry?: FlowEntry;
  context: () => Omit<FlowContext, 'variant'>;
  onEvent: (event: AgentEvent) => void;
  /** The flow in the composer or playing, or null at rest. */
  onActiveFlow?: (flow: ActionId | null) => void;
  /** A flow starts playing: its Grid calls group under it from here. */
  onRun?: (flow: ActionId) => void;
  onCompleted?: (flow: ActionId) => void;
  /** The model's next step for the conversation so far (behind /api/agent). */
  reply: (turns: Turn[]) => Promise<StepReply>;
  /** What the agent said in these messages, in the app's words, for the model to read back. */
  describe: (messages: StoredMessage[]) => string;
  /** How long the agent takes to read each of your messages before it reacts, types or carries on (ms). */
  readsFor?: number;
  /** The least time its typing bubble shows before a reply, however fast the model answers (ms). */
  typesFor?: number;
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
  const pickedOnPage = useRef(false);
  /** An open question for an amount, waiting on what they type. */
  const amountRef = useRef<{ take: (usd: number) => void; all?: number } | null>(null);
  const [awaitingAmount, setAwaitingAmount] = useState(false);
  /** Something said over an open ask that wasn't a yes or a no: answered once the ask is declined and the run ends. */
  const queued = useRef<string | null>(null);
  /** The conversation as the model reads it: the person's messages, its tool calls and what they did. */
  const transcript = useRef<Turn[]>([]);
  /** Results owed for the model's last calls, sent ahead of the person's next message. */
  const pending = useRef<Block[]>([]);
  /** The step being carried out: its calls, and the results so far, so anything said over it still pairs each call. */
  const owed = useRef<{ ids: string[]; done: Map<string, Block> } | null>(null);
  const memory = useRef(newToolMemory());
  const messagesRef = useRef<StoredMessage[]>([]);
  const askRef = useRef<((text: string, meant?: string, shown?: boolean) => Promise<void>) | null>(null);
  /** Suggested replies under the agent's last answer: a tap sends one as if typed. */
  const suggested = useRef<{ id: number; chips: Chip[] } | null>({ id: 2, chips: STARTERS });

  const cb = useRef({ context, onEvent, onActiveFlow, onRun, onCompleted, reply, describe, readsFor, typesFor });
  cb.current = { context, onEvent, onActiveFlow, onRun, onCompleted, reply, describe, readsFor, typesFor };
  messagesRef.current = messages;

  const append = (role: Turn['role'], content: Block[]) => {
    if (!content.length) return;
    const t = transcript.current;
    const last = t[t.length - 1];
    if (last?.role === role) t[t.length - 1] = { role, content: [...last.content, ...content] };
    else t.push({ role, content });
  };
  /** Whatever the last step still owed is settled: done if it finished, interrupted if the person cut in. */
  const settle = () => {
    const step = owed.current;
    if (!step) return;
    owed.current = null;
    pending.current = step.ids.map((id) => step.done.get(id) ?? resultBlock(id, { status: 'interrupted', note: 'they said something else first' }));
  };
  /** Something the person said, after the results the model is still owed. */
  const heard = (text: string) => {
    settle();
    append('user', [...pending.current, { type: 'text', text }]);
    pending.current = [];
  };
  /** Runs once the agent has read what you just sent. */
  const afterReading = (f: () => void) => {
    if (cb.current.readsFor > 0) setTimeout(f, cb.current.readsFor);
    else f();
  };

  const push = useCallback((m: NewMessage) => {
    const id = nextId.current++;
    if (runRef.current) runRef.current.answered = m.kind === 'me';
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
      for (let i = 0; i < beats.length; i++) {
        const b = beats[i];
        if (run.cancelled) return false;
        if ('work' in b) {
          setMessages((list) => {
            const rest = list.filter((m) => m.kind !== 'work');
            return [...rest, { id: nextId.current++, kind: 'work', key: b.work, params: b.params } as StoredMessage].slice(-MAX_MESSAGES);
          });
          await sleep(b.ms);
        } else if ('products' in b) {
          show({ kind: 'products', key: b.products, params: b.params });
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
          // Lines that carry this one on join it in one bubble.
          const parts = [{ key: b.say, params: b.params }];
          for (let next = beats[i + 1]; next && 'say' in next && next.join; next = beats[i + 1]) {
            parts.push({ key: next.say, params: next.params });
            i += 1;
          }
          const said = parts.length > 1 ? { parts } : parts[0];
          const replyTo = run.answered ? run.request : undefined;
          const id = show({ kind: 'them', said, sender: b.sender, typing: true, replyTo });
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
          // Paying another way: this checkout goes, and the agent comes back with one for the new way.
          if (typeof decision === 'object') {
            setMessages((list) => list.filter((m) => m.id !== id));
            if (b.swap && !(await play(b.swap(decision.swap), run))) return false;
            continue;
          }
          if (decision === 'deny') {
            patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'denied' } : m));
            await sleep(500);
            if (!(await play(b.deny, run))) return false;
            // A no ends the run: nothing after it plays.
            return false;
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
          const onPage = pickedOnPage.current;
          if (b.reply && !pickedByText.current && !onPage) push({ kind: 'me', text: b.chips[picked].label });
          pickedByText.current = false;
          pickedOnPage.current = false;
          await sleep(600);
          if (!(await play([...(onPage && b.onPage ? b.onPage(picked) : []), ...b.then(picked)], run))) return false;
        } else if ('amount' in b) {
          setBusy(false);
          setAwaitingAmount(true);
          const offered = b.options ?? [];
          const labels = [...offered.map((usd) => `$${usd.toLocaleString('en-US')}`), 'Other'];
          const chipsId = offered.length ? show({ kind: 'chips', chips: labels.map((label) => ({ label })), picked: null }) : null;
          const usd = await new Promise<number>((r) => {
            amountRef.current = { take: r, all: b.all };
            if (chipsId === null) return;
            pickRef.current = (i) => {
              if (i < 0) return r(i);
              pickRef.current = null;
              patch(chipsId, (m) => (m.kind === 'chips' ? { ...m, picked: i } : m));
              push({ kind: 'me', text: labels[i] });
              // Other: it asks for one, and the typed amount still answers.
              if (i === offered.length) void play([{ pause: 500 }, { say: 'amount.other' }], run).then(() => setBusy(false));
              else window.setTimeout(() => r(offered[i]), 600);
            };
          });
          amountRef.current = null;
          pickRef.current = null;
          setAwaitingAmount(false);
          if (chipsId !== null) patch(chipsId, (m) => (m.kind === 'chips' && m.picked === null ? { ...m, expired: true } : m));
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
    async (flow: ActionId | null, beats: Beat[], after = 0, topic?: string, request?: string) => {
      const run: Run = { flow, cancelled: false, request };
      const from = nextId.current;
      runRef.current = run;
      if (flow) cb.current.onRun?.(flow);
      setRunning(flow);
      setBusy(true);
      if (after > 0) await sleep(after);
      if (flow && topic && !run.cancelled) push({ kind: 'eyebrow', flow, text: topic });
      const finished = !run.cancelled && (await play(beats, run));
      if (runRef.current !== run) return;
      clearWork();
      runRef.current = null;
      setRunning(null);
      setBusy(false);
      if (finished && flow) cb.current.onCompleted?.(flow);
      // The model reads back what a scripted run said, so it knows where things stand.
      const said = cb.current.describe(messagesRef.current.filter((m) => m.id >= from));
      if (said) append('assistant', [{ type: 'text', text: said }]);
      const next = queued.current;
      queued.current = null;
      if (next) void askRef.current?.(next, next, false);
    },
    [play, clearWork, push],
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
    heard(text);
    const ctx: FlowContext = { ...cb.current.context(), variant: entry.variant };
    // Still missing what it needs (a card-only account and a flow that holds money): ask, as the chat would.
    const beats = needsSetup(entry.flow, ctx.account()) ? planFor(entry.flow, ctx) : FLOWS[entry.flow](ctx);
    // A shortcut that set things up on its own says so, right after it reacts.
    const setup = entry.setup;
    if (setup && (setup.connected || setup.funded > 0)) {
      const note: Beat = { say: 'setup.auto', params: { connected: setup.connected ? 1 : 0, funded: setup.funded } };
      beats.splice(beats[0] && 'react' in beats[0] ? 1 : 0, 0, note);
    }
    void start(entry.flow, beats, cb.current.readsFor, topicFor(entry.flow, ctx), text);
  }, [entry, cancelRun, dropSuggestions, push, start]);

  /** A control in the thread (the balance card's Add money) asks as the visitor would, with its tile's line. */
  const prompt = useCallback(
    (flow: ActionId) => {
      if (runRef.current) return;
      dropSuggestions();
      const def = ACTIONS.find((a) => a.id === flow)!;
      push({ kind: 'me', text: def.prompts[0] });
      heard(def.prompts[0]);
      const ctx: FlowContext = { ...cb.current.context(), variant: 0 };
      void start(flow, FLOWS[flow](ctx), cb.current.readsFor, topicFor(flow, ctx), def.prompts[0]);
    },
    [push, start, dropSuggestions],
  );

  const activeFlow = running;
  useEffect(() => {
    cb.current.onActiveFlow?.(activeFlow);
  }, [activeFlow]);

  /**
   * Free text to the model, which plans with tools: each step it calls one or more, the phone carries them out (cards,
   * sheets, approvals, the Grid calls), and what happened goes back for the next step. The turn ends when it replies
   * or offers a choice, when the person says no, or once an action is done and it has nothing more planned.
   */
  const ask = useCallback(
    async (text: string, meant = text, shown = true) => {
      if (shown) push({ kind: 'me', text, ...(meant !== text ? { meant } : {}) });
      heard(meant);
      const run: Run = { flow: null, cancelled: false, request: text };
      runRef.current = run;
      setBusy(true);
      if (cb.current.readsFor > 0) await sleep(cb.current.readsFor);
      /** The typing bubble the first thing it says lands in. */
      let typing: number | null = run.cancelled ? null : push({ kind: 'them', said: { text: '' }, typing: true });
      const dropTyping = () => {
        if (typing === null) return;
        const id = typing;
        typing = null;
        setMessages((list) => list.filter((m) => m.id !== id));
      };
      const say = async (lines: Say) => {
        const said: Said = { text: lines.muse ?? Object.values(lines)[0] ?? '', voices: lines };
        if (typing !== null) {
          const id = typing;
          typing = null;
          patch(id, (m) => (m.kind === 'them' ? { ...m, said, typing: false } : m));
          await sleep(700);
          return;
        }
        const id = show({ kind: 'them', said, typing: true, replyTo: run.answered ? run.request : undefined });
        await sleep(700);
        patch(id, (m) => (m.kind === 'them' ? { ...m, typing: false } : m));
        await sleep(600);
      };
      /** A run's label (Duet's eyebrow) goes above the first thing said about it. */
      const label = (flow: ActionId, topic: string) => {
        const eyebrow: StoredMessage = { id: nextId.current++, kind: 'eyebrow', flow, text: topic };
        const at = typing;
        setMessages((list) => (at !== null ? list.flatMap((m) => (m.id === at ? [eyebrow, m] : [m])) : [...list, eyebrow]));
      };
      let chips: Chip[] = [];
      let flow: ActionId | null = null;
      let reacted = false;
      let spoke = false;
      const finish = () => {
        if (runRef.current !== run) return;
        dropTyping();
        clearWork();
        runRef.current = null;
        setRunning(null);
        setBusy(false);
      };

      for (let step = 0; step < MAX_STEPS && !run.cancelled; step++) {
        const [answer] = await Promise.all([cb.current.reply(windowOf(transcript.current)), step === 0 ? sleep(cb.current.typesFor) : undefined]);
        if (run.cancelled) return;
        if ('fallback' in answer) {
          const said: Said = { key: answer.fallback };
          if (typing !== null) patch(typing, (m) => (m.kind === 'them' ? { ...m, said, typing: false } : m));
          else show({ kind: 'them', said, typing: false });
          typing = null;
          break;
        }
        const { calls } = answer;
        append('assistant', calls.map((c) => ({ type: 'tool_use', id: c.id, name: c.name, input: c.input })));
        const done = new Map<string, Block>();
        owed.current = { ids: calls.map((c) => c.id), done };
        // What it says goes first in the step, before any card, even when the model put it on a later call.
        const speaker = spoke ? -1 : calls.findIndex((c) => c.input.say && !ENDS_TURN.has(c.name));
        if (speaker > 0 && !ENDS_TURN.has(calls[0].name)) {
          calls[0] = { ...calls[0], input: { ...calls[0].input, say: calls[speaker].input.say } };
          calls[speaker] = { ...calls[speaker], input: { ...calls[speaker].input, say: undefined } };
        }
        let ended = false;
        let failed = false;
        let stopped = false;
        for (let i = 0; i < calls.length; i++) {
          const call: ToolCall = { ...calls[i], input: { ...calls[i].input } };
          if (stopped) {
            done.set(call.id, resultBlock(call.id, { status: 'skipped', note: 'an earlier call in this step stopped' }));
            continue;
          }
          const ctx: FlowContext = { ...cb.current.context(), variant: 0 };
          // One line from the model per turn, as it starts; after that the tools' own lines carry it, and it only speaks
          // again to ask something. Decided before the tool is built, so the tool keeps the lines the model won't say.
          if (call.input.say && !ENDS_TURN.has(call.name) && spoke) delete call.input.say;
          // Checked before anything shows: a call that can't run says nothing, and the model's next step does.
          const out = runTool({ ctx, memory: memory.current, next: calls[i + 1] }, call);
          if ('error' in out) {
            done.set(call.id, resultBlock(call.id, out.error, true));
            failed = stopped = true;
            continue;
          }
          // A step with nothing to show passes its line to the next call, so the line lands where something happens.
          if (call.input.say && !out.beats.length && i + 1 < calls.length && !ENDS_TURN.has(calls[i + 1].name)) {
            calls[i + 1] = { ...calls[i + 1], input: { ...calls[i + 1].input, say: call.input.say } };
            delete call.input.say;
          }
          const opener = out.beats.find((b) => !('react' in b));
          // A tool that opens the turn with an answer of its own (a setup first, a no) speaks for the turn: the model's
          // line goes, here and later in the turn, as today.
          if (!spoke && opener && 'say' in opener && SPEAKS_FIRST.has(opener.say)) {
            delete call.input.say;
            spoke = true;
          }
          const callFlow = flowOf(call);
          if (callFlow && callFlow !== flow) {
            flow = callFlow;
            run.flow = callFlow;
            cb.current.onRun?.(callFlow);
            setRunning(callFlow);
            if (call.input.say && !spoke) label(callFlow, topicOf(call, ctx));
          }
          if (call.input.say) {
            await say(call.input.say);
            spoke = true;
          }
          if (run.cancelled) return;
          if (ENDS_TURN.has(call.name)) {
            const options = call.name === 'offer_choices' ? call.input.options : call.input.suggestions;
            chips = Array.isArray(options) ? options.filter((o): o is string => typeof o === 'string').map(chipOf) : [];
            done.set(call.id, resultBlock(call.id, { status: 'shown' }));
            ended = stopped = true;
            continue;
          }
          if (!call.input.say) dropTyping();
          // It reacts to the request once, as it starts on it.
          const beats: Beat[] = reacted ? out.beats : [{ react: '👍' }, ...out.beats];
          reacted = true;
          const finished = await play(beats, run);
          if (run.cancelled) return;
          if (!finished) {
            done.set(call.id, resultBlock(call.id, { status: 'declined', note: 'they said no; the turn ended' }));
            ended = stopped = true;
            continue;
          }
          // What it showed stopped short of the action (over the limit, too little in the balance): the model fixes it.
          if (out.result.error) {
            done.set(call.id, resultBlock(call.id, { ...out.result, account: accountNow(cb.current.context().account()) }, true));
            failed = stopped = true;
            continue;
          }
          done.set(call.id, resultBlock(call.id, { status: 'done', ...out.result, account: accountNow(cb.current.context().account()) }));
          if (callFlow) cb.current.onCompleted?.(callFlow);
        }
        if (run.cancelled) return;
        const last = calls[calls.length - 1];
        // A limit raised for a payment goes on to that payment.
        const goOn = !ended && (failed || READS_RESULT.has(last.name) || last.input.more === true || (last.name === 'raise_limit' && typeof last.input.for === 'string'));
        owed.current = null;
        const results = calls.map((c) => done.get(c.id)!);
        if (!goOn || step === MAX_STEPS - 1) {
          pending.current = results;
          break;
        }
        append('user', results);
        // Thinking between steps isn't something said: Dots still quotes the request if they answered something since.
        if (typing === null) {
          const answered = run.answered;
          typing = push({ kind: 'them', said: { text: '' }, typing: true });
          run.answered = answered;
        }
      }
      finish();
      if (chips.length && !run.cancelled) {
        await sleep(350);
        const id = push({ kind: 'chips', chips, picked: null });
        suggested.current = { id, chips };
      }
      // Something said over an approval that wasn't a yes or a no: answered now the turn is over.
      const next = queued.current;
      queued.current = null;
      if (next && !run.cancelled) void askRef.current?.(next, next, false);
    },
    [push, patch, show, play, clearWork],
  );

  askRef.current = ask;

  /** A suggestion that is a flow's own request plays that flow, as a tile's line would; the rest go to the model. */
  const suggest = useCallback(
    async (chip: Chip, typed?: string) => {
      if (!chip.flow) return ask(typed ?? chip.label, chip.label);
      push({ kind: 'me', text: typed ?? chip.label });
      heard(typed ?? chip.label);
      const ctx: FlowContext = { ...cb.current.context(), variant: 0 };
      void start(chip.flow, FLOWS[chip.flow](ctx), cb.current.readsFor, topicFor(chip.flow, ctx), typed ?? chip.label);
    },
    [ask, push, start],
  );

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
    if (i >= 0) await suggest(s!.chips[i], text);
    else await ask(text);
  }, [composer, busy, push, ask, suggest, dropSuggestions, cancelRun]);

  /** The visitor's tap on the open ask's primary button. */
  const allow = useCallback(() => decideRef.current?.('allow'), []);
  const deny = useCallback(() => decideRef.current?.('deny'), []);
  /** The checkout's Pay with switched to another way to pay. */
  const swap = useCallback((to: PayTo) => decideRef.current?.({ swap: to }), []);
  /** A choice tapped: a chip, or (`onPage`) an option on a page the app opened. */
  const pick = useCallback(
    (i: number, onPage?: boolean) => {
      if (pickRef.current) {
        pickedOnPage.current = !!onPage;
        return pickRef.current(i);
      }
      const s = suggested.current;
      if (!s || runRef.current || busy || !s.chips[i]) return;
      setComposer((c) => (s.chips.some((chip) => chip.label === c) ? '' : c));
      dropSuggestions(i);
      void suggest(s.chips[i]);
    },
    [busy, suggest, dropSuggestions],
  );
  /** Face ID finished its scan and checkmark. */
  const authed = useCallback(() => authRef.current?.(), []);
  /** The account as it stands, for the balance page. */
  const account = useCallback(() => cb.current.context().account(), []);

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
    /** A flow is waiting on a typed dollar amount ("How much?"). */
    awaitingAmount,
    busy,
    allow,
    deny,
    swap,
    pick,
    prompt,
    authed,
    authing,
    asking,
    activeFlow,
    account,
  };
}

export type AgentBrain = ReturnType<typeof useAgentBrain>;
