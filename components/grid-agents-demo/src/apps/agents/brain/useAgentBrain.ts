import { useCallback, useEffect, useRef, useState } from 'react';
import { ACTIONS, type ActionId } from '@/data/actions';
import type { AgentEvent } from '@/data/agentEvents';
import { BANK_COUNTRIES, BANK_REACH } from '@/data/bankCountries';
import { activeMode, cleanName, MODES, setActiveMode, type Mode } from '@/data/mode';
import { ENDS_TURN, type Say, type ToolCall, type ToolResult, type Turn } from '@/lib/llm/tools';
import type { AgentAsk, Beat, Chip, Message, Params, PayTo, Said, StoredMessage, Verification } from '../conversation';
import { FLOWS, needsSetup, planFor, topicFor, type FlowContext } from '../flows';
import { nextSteps } from '../nextSteps';
import { accountNow, flowOf, newToolMemory, runTool, topicOf } from '../tools/run';
import { describe, describeAsk } from './describe';
import { endOf, called, fromApp, settled, typed, windowOf, type Log } from './log';

/*
 * The conversation every app shares, hosted above the apps so switching between them only changes the face.
 *
 * The model runs it. Anything the person says (typed, a tile, a suggestion) goes to the model with the whole record
 * and whatever is open on screen; the model writes every line and picks every step. A step is one of the app's own
 * flows (flows.ts, tools/run.ts), played here for its screens and Grid calls only: its hand-written lines are kept
 * back and handed to the model as plain notes, and it stops and reports the moment it needs the person (an approval,
 * options, an amount, a name). A tap settles what's open at once and the model carries on from what happened; typed
 * text never does anything by itself, except when it is exactly what a tap would send ("yes", an option's label).
 *
 * Without the model (off, over its cap, failing), a tile plays its flow with the flow's own lines, as a script.
 */

/** A tile's jump: put this flow's line in the composer. */
export interface FlowEntry {
  nonce: number;
  flow: ActionId;
  variant: number;
  /** What the jump set up on its own (an account, a top-up in USD cents), for the agent to mention. */
  setup?: { connected: boolean; funded: number };
}

/** The model's next step: the tools it calls, or why the app carries on without it. */
export type StepReply = { calls: ToolCall[] } | { fallback: 'fallback' | 'limited' };

/**
 * The call that put up what's waiting, made again with a detail changed ($800 becomes $1,000, another name): a
 * correction, which replaces it even before it's shown. The same call unchanged, or any other, waits its turn.
 */
function corrects(run: { asked?: { name: string; input: Record<string, unknown> } }, call: ToolCall): boolean {
  const was = run.asked;
  if (!was || was.name !== call.name) return false;
  return Object.entries(call.input).some(([k, v]) => k !== 'say' && k in was.input && JSON.stringify(was.input[k]) !== JSON.stringify(v));
}

/** The app's own line when the model can't answer: where the flow buttons are depends on the screen (beside the phone, or behind Configure). */
const stockLine = (why: 'fallback' | 'limited') => ({
  key: why,
  ...(why === 'fallback' && typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches && { params: { narrow: 1 } }),
});

type Decision = 'allow' | 'deny' | { swap: PayTo };
/** What settles something open: a decision, an option, an amount, a name; null when it's closed under them. */
type Given = { decision: Decision } | { option: number; onPage?: boolean } | { amount: number } | { name: string } | null;
type NewMessage = StoredMessage extends infer M ? (M extends StoredMessage ? Omit<M, 'id'> : never) : never;
type Line = { key: string; params?: Params };

/** What the app is waiting on the person for. */
type Wait =
  | { kind: 'approval'; title: string; what: string }
  | { kind: 'choice'; options: string[] }
  | { kind: 'amount'; options: number[]; all?: number }
  | { kind: 'name'; suggestion: string };

/** One of the app's flows being played: by the model (`voiced`), or as a script with its own lines. */
interface Run {
  flow: ActionId | null;
  cancelled: boolean;
  /** The model writes what's said: the flow's own lines are kept back as notes, and each wait is reported. */
  voiced: boolean;
  /** A word from the model before the work: said when the flow first shows it's working, dropped if it needs the
   *  person before that (the model then writes the line that leads into what it's waiting on). */
  opening?: Say;
  opened: boolean;
  /** Since its last report: the lines it kept back, what it showed, what the person just did, what's worth offering. */
  lines: Line[];
  shown: StoredMessage[];
  did?: string;
  offer?: string;
  /** What was open when it started, which it took the place of. */
  replaced?: string;
  /** The app began it by itself, from a shortcut: said in its first report. */
  began?: string;
  /** The model's call that started it, as made: the same call again while it waits is no new request. */
  made?: string;
  /** Its opening line, once shown and until the model has been told so: what it says next doesn't say it again. */
  said?: Say;
  /** That call's tool and what it was asked with: the same tool with a detail changed is a correction. */
  asked?: { name: string; input: Record<string, unknown> };
  /** A look-up made while something else is open: it shows what it finds and leaves that open. */
  side?: boolean;
  /** What the tool fills in as it goes: its status and facts. */
  result: ToolResult;
  /** The call waiting on its next report; with none, the report goes to the conversation (a tap set it off). */
  taker?: (report: ToolResult) => void;
  /** Whether what it finishes with is worth following with a few next steps. */
  leads: boolean;
  /** The first message it showed, for what a script said. */
  from: number;
}

/** Something open: held back until the line that leads into it is out, then on screen until it's settled. */
interface Open {
  run: Run;
  wait: Wait;
  shown: boolean;
  reveal: () => void;
  settle?: (given: Given) => void;
}

/** A call under way: its result is what happened by the time it next needs the person, or ends. */
interface Started {
  start: () => Promise<ToolResult>;
  /** Its line as it started went out. */
  spoke: () => boolean;
}

interface Heard {
  /** What the thread shows, when it isn't what was meant (a typed "2" for the second suggestion). */
  shown?: string;
  /** The tile or suggestion this came from: the flow it starts. */
  flow?: ActionId;
  variant?: number;
  setup?: FlowEntry['setup'];
}

const MAX_MESSAGES = 200;
/** The most model calls one turn takes before the agent stops and waits. */
const MAX_STEPS = 6;

/** Under the greeting: things to try, so it's clear you can just type. A tap sends one as the person's own message, so each is in their words. */
const STARTERS: Record<Mode, Chip[]> = {
  personal: [
    { label: 'Set up a balance', flow: 'connect', detail: 'Spend from it, within limits you set' },
    { label: 'Add a card', flow: 'card', detail: 'Save it once, I’ll pay when you ask' },
    { label: 'Send money to friends (US and abroad)', detail: `To banks in ${BANK_REACH} countries` },
    { label: 'What can you do?', detail: 'A quick tour of what I can handle' },
  ],
  business: [
    { label: 'Set up my company', flow: 'company', detail: 'A business account with US bank details' },
    { label: 'Send an invoice', flow: 'invoice', detail: 'Paid by bank transfer, matched for you' },
    { label: 'Run payroll', flow: 'payroll', detail: 'Pay the team in one approved run' },
    { label: 'What can you do?', detail: 'A quick tour of what I can handle for the business' },
  ],
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

/** Asks that set something up for later (a balance, a saved card, a linked bank): a no to one stops the shortcuts. */
const SETUP_ASKS = new Set<string>(['connect', 'vault', 'bank']);
/** Tools that only look something up on the way to something else: nothing to follow them with. */
const LOOKUPS = new Set<string>(['search', 'quote_payment']);
/** Tools that look something up and wait on nothing: asked for while something is open, that stays open. */
const BESIDE = new Set<string>(['quote_payment', 'show_account']);

/* Typed replies that are exactly what a tap would send: an option's own label or number, a bare amount. There's
   nothing in them to read, so they settle what's open at once, as the tap would; anything else typed goes to the
   model. A yes or a no is the model's to read too ("ok" after an explanation isn't always a go-ahead): the word lists
   are only for a script, which has no model to ask. */
const BARE_YES = /^\s*(y|yes|yeah|yep|yup|k|kk|ok|okay|sure|approve|approved)\s*[.!]*\s*$/i;
const BARE_NO = /^\s*(n|no|nope|nah)\s*[.!]*\s*$/i;
const BARE_AMOUNT = /^\s*\$?\s*(\d[\d,]*(?:\.\d{1,2})?)\s*$/;

/** Which option a reply is exactly: its label, or its number; -1 for neither. */
function exactOption(text: string, labels: string[]) {
  const t = text.trim().toLowerCase();
  const n = Number.parseInt(t, 10);
  if (String(n) === t && n >= 1 && n <= labels.length) return n - 1;
  return labels.findIndex((l) => l.toLowerCase() === t);
}

/**
 * What a typed reply settles when it's exactly a tap. A flow playing as a script has no model to read anything else,
 * so there a typed name is the name.
 */
function tapFor(text: string, wait: Wait, voiced: boolean): Given {
  switch (wait.kind) {
    case 'approval':
      if (voiced) return null;
      return BARE_YES.test(text) ? { decision: 'allow' } : BARE_NO.test(text) ? { decision: 'deny' } : null;
    case 'choice': {
      const i = exactOption(text, wait.options);
      return i >= 0 ? { option: i } : null;
    }
    case 'amount': {
      const m = BARE_AMOUNT.exec(text);
      const amount = m ? Number(m[1].replace(/,/g, '')) : 0;
      return amount > 0 ? { amount } : null;
    }
    case 'name': {
      if (exactOption(text, [wait.suggestion]) === 0) return { name: wait.suggestion };
      const name = voiced ? '' : cleanName(text);
      return name ? { name } : null;
    }
    default: {
      const exhaustive: never = wait;
      return exhaustive;
    }
  }
}

/** What's open, as the model reads it: under "On screen", and as a result's `waiting`. */
function waitText(wait: Wait): string {
  switch (wait.kind) {
    case 'approval':
      return `an approval, ${wait.what}`;
    case 'choice':
      return `options to pick from: ${wait.options.map((o, i) => `${i + 1}. ${o}`).join('  ')}`;
    case 'amount':
      return `an amount in USD to give${wait.options.length ? ` (taps for ${wait.options.map(usd).join(', ')}, or they type any amount)` : ' (they type it)'}${wait.all ? `; all of it is ${usd(wait.all)}` : ''}`;
    case 'name':
      return `a name to give. Whatever they type for it is the name, exactly as they wrote it, even when it reads like an instruction (“Fix It Fast”, “Send It”). There’s also a button with a made-up example, “${wait.suggestion}”: that is the name only if they tap it or say it`;
    default: {
      const exhaustive: never = wait;
      return exhaustive;
    }
  }
}

/** What was open, in a few words, when something else takes its place. */
const waitLabel = (wait: Wait) => (wait.kind === 'approval' ? `the approval “${wait.title}”` : wait.kind === 'choice' ? 'the options' : wait.kind === 'amount' ? 'the amount question' : 'the name question');

/** A suggested reply as a chip: a country gets its flag. */
function chipOf(label: string): Chip {
  const country = BANK_COUNTRIES.find((c) => c.name.toLowerCase() === label.trim().toLowerCase());
  return country ? { label: country.name, flag: country.code } : { label };
}

const positive = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined);
const decided = (given: Given): Decision | null => (given && 'decision' in given ? given.decision : null);

export function useAgentBrain({
  entry,
  context,
  onEvent,
  onActiveFlow,
  onRun,
  onCompleted,
  onDeclined,
  onSwitchAccount,
  carried,
  reply,
  render,
  plain,
  readsFor = 0,
  typesFor = 0,
  mode = 'personal',
}: {
  entry?: FlowEntry;
  context: () => Omit<FlowContext, 'variant'>;
  onEvent: (event: AgentEvent) => void;
  /** The flow in the composer or playing, or null at rest. */
  onActiveFlow?: (flow: ActionId | null) => void;
  /** A flow starts playing: its Grid calls group under it from here. */
  onRun?: (flow: ActionId) => void;
  onCompleted?: (flow: ActionId) => void;
  /** They said no to setting something up (a balance, a card, a bank). */
  onDeclined?: () => void;
  /** The agent takes them to their other account, with what they asked for there (if anything) to pick up. */
  onSwitchAccount?: (to: Mode, carry?: string) => void;
  /** Something they asked for on the other account that belongs here: heard as their message, once. */
  carried?: { nonce: number; text: string };
  /** The model's next step, for the conversation so far and what's open on screen (behind /api/agent). */
  reply: (turns: Turn[], screen: { open?: string; seen?: string }) => Promise<StepReply>;
  /** These messages as the app on screen draws them, for telling the model what the person is looking at. */
  render: (messages: StoredMessage[]) => Message[];
  /** A flow's own line as a plain fact, for the model to say in its own words. */
  plain: (key: string, params?: Params) => string;
  /** How long the agent takes to read each of your messages before it reacts, types or carries on (ms). */
  readsFor?: number;
  /** The least time its typing bubble shows before a reply, however fast the model answers (ms). */
  typesFor?: number;
  /** The account this conversation is on: its greeting and the things it offers first. */
  mode?: Mode;
}) {
  const [messages, setMessages] = useState<StoredMessage[]>(() => [
    { id: 0, kind: 'stamp', text: 'Today' },
    { id: 1, kind: 'them', said: { key: mode === 'business' ? 'greeting.business' : 'greeting' }, typing: false },
    { id: 2, kind: 'chips', chips: STARTERS[mode], picked: null },
  ]);
  // The clock is the visitor's, so it lands after hydration.
  useEffect(() => {
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setMessages((all) => all.map((m) => (m.id === 0 && m.kind === 'stamp' ? { ...m, text: `Today ${time}` } : m)));
  }, []);
  const [composer, setComposer] = useState('');
  const [running, setRunning] = useState<ActionId | null>(null);
  const [busy, setBusyState] = useState(false);
  const busyRef = useRef(false);
  const setBusy = useCallback((b: boolean) => {
    busyRef.current = b;
    setBusyState(b);
  }, []);
  const nextId = useRef(3);
  /** The flow playing or waiting on the person, if any: one at a time. */
  const runRef = useRef<Run | null>(null);
  /** What it's waiting on. */
  const openRef = useRef<Open | null>(null);
  const authRef = useRef<(() => void) | null>(null);
  /** The business verification page, while an approval waits on it: true once submitted, false if it's closed. */
  const verifyRef = useRef<((submitted: boolean) => void) | null>(null);
  const [verifying, setVerifying] = useState<Verification | null>(null);
  const [awaitingAmount, setAwaitingAmount] = useState(false);
  const [awaitingName, setAwaitingName] = useState(false);
  /** The person's own words settled what's open (typed, or the model read them): the thread already has them. */
  const inWords = useRef(false);
  /** Turns queued or under way. */
  const pending = useRef(0);
  /** They typed while a step was playing with no turn under way: the step's report starts the turn that answers. */
  const late = useRef(false);
  /** A tile's flow is about to start (their message is being read). */
  const starting = useRef(false);
  /** The record of the conversation, as the model reads it. */
  const log = useRef<Log>([]);
  /** Something is in the record the model hasn't answered yet. */
  const owed = useRef(false);
  /** Bumped by anything that overtakes a turn in flight (a tap, a tile): its answer is dropped when it lands. */
  const turnSeq = useRef(0);
  /** Turns take place one after another. */
  const turns = useRef<Promise<void>>(Promise.resolve());
  const alive = useRef(true);
  /** The typing bubble the model's next line lands in. */
  const typing = useRef<number | null>(null);
  /** Lines a flow kept back for the model that it hasn't said yet: without it, the flow says them itself. */
  const unsaid = useRef<Line[]>([]);
  /** Why the model last couldn't answer, for what a script says to something typed. */
  const without = useRef<'fallback' | 'limited'>('fallback');
  /** The model couldn't answer last time it was asked: tiles play as scripts until it answers again. */
  const down = useRef(false);
  /** What the person last asked for, and whether they've answered something since (Dots quotes the request then). */
  const request = useRef<{ text: string; answered: boolean }>({ text: '', answered: false });
  /** The flow the panel's calls are grouped under since the person last spoke. */
  const grouped = useRef<ActionId | null>(null);
  const memory = useRef(newToolMemory());
  const messagesRef = useRef<StoredMessage[]>([]);
  /** Suggested replies under the agent's last answer: a tap sends one as if typed. */
  const suggested = useRef<{ id: number; chips: Chip[] } | null>({ id: 2, chips: STARTERS[mode] });

  const cb = useRef({ context, onEvent, onActiveFlow, onRun, onCompleted, onDeclined, onSwitchAccount, reply, render, plain, readsFor, typesFor });
  cb.current = { context, onEvent, onActiveFlow, onRun, onCompleted, onDeclined, onSwitchAccount, reply, render, plain, readsFor, typesFor };
  messagesRef.current = messages;

  /** Runs once the agent has read what you just sent. */
  const afterReading = (f: () => void) => {
    if (cb.current.readsFor > 0) setTimeout(f, cb.current.readsFor);
    else f();
  };

  /** The product it just showed, while that's still the last thing in the thread: the next one found joins it. */
  const shelf = useRef<number | null>(null);
  const push = useCallback((m: NewMessage) => {
    const id = nextId.current++;
    // The model's empty typing bubble isn't anything said yet.
    if (!(m.kind === 'them' && m.typing && 'text' in m.said && !m.said.text)) shelf.current = null;
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
  /** The model is working out what to say. A step's status ("quoting…") gives way to it: one sign of thinking at a time. */
  const startTyping = useCallback(() => {
    clearWork();
    if (typing.current === null) typing.current = push({ kind: 'them', said: { text: '' }, typing: true });
  }, [push, clearWork]);
  const stopTyping = useCallback(() => {
    const id = typing.current;
    if (id === null) return;
    typing.current = null;
    setMessages((list) => list.filter((m) => m.id !== id));
  }, []);
  /** Something for the thread. The app showing it means the model isn't mid-thought: its typing bubble goes. */
  const show = useCallback(
    (m: NewMessage) => {
      stopTyping();
      clearWork();
      return push(m);
    },
    [stopTyping, clearWork, push],
  );
  /** A line the model wrote, once per app, in the typing bubble if one is up. */
  const say = useCallback(
    async (lines: Say) => {
      const said: Said = { text: lines.muse ?? Object.values(lines)[0] ?? '', voices: lines };
      const replyTo = request.current.answered ? request.current.text : undefined;
      request.current.answered = false;
      const id = typing.current;
      shelf.current = null;
      if (id !== null) {
        typing.current = null;
        clearWork();
        patch(id, (m) => (m.kind === 'them' ? { ...m, said, typing: false, replyTo } : m));
        await sleep(700);
        return;
      }
      const fresh = show({ kind: 'them', said, typing: true, replyTo });
      await sleep(700);
      patch(fresh, (m) => (m.kind === 'them' ? { ...m, typing: false } : m));
      await sleep(500);
    },
    [show, patch, clearWork],
  );

  /** Builds what comes next against this conversation's own account. The stores a flow reads (saved recipients, the
   *  linked bank) follow the account on screen, and this conversation may have been switched away from mid-run. */
  const own = useCallback(
    <T,>(build: () => T): T => {
      const shown = activeMode();
      setActiveMode(mode);
      try {
        return build();
      } finally {
        setActiveMode(shown);
      }
    },
    [mode],
  );

  /** An approval as the app on screen draws it, before it's shown. */
  const askOf = (key: string, params?: Params): AgentAsk | null => {
    const [m] = cb.current.render([{ id: -1, kind: 'ask', key, params, state: 'open' }]);
    return m?.kind === 'ask' ? m.ask : null;
  };

  /* ── The model's side: a turn, a step at a time ───────────────────── */

  /** Something the model hasn't answered is in the record: it takes a turn, after any turn already under way. */
  const takeTurn = (opts: { read?: boolean } = {}) => {
    owed.current = true;
    pending.current += 1;
    turns.current = turns.current
      .then(() => turn(opts))
      .catch(() => undefined)
      .finally(() => void (pending.current -= 1));
  };

  /**
   * A flow's report on what happened since its last one, and what it now waits on or how it ended. A call waiting on
   * it takes it as its result; otherwise a tap set it off, so it goes in the record and the model takes a turn.
   */
  const report = (run: Run, extra: ToolResult) => {
    const c = cb.current;
    const notes = run.lines.map((l) => c.plain(l.key, l.params)).filter(Boolean);
    const shown = describe(c.render(run.shown));
    const out: ToolResult = {
      ...(run.did && { they: run.did }),
      ...(run.began && { started: run.began }),
      ...(run.replaced && { replaced: `${run.replaced} closed when you called this: this took its place` }),
      ...(run.said && { they_read: `your line as you started this is already in front of them (“${Object.values(run.said)[0] ?? ''}”): what you say next carries on from it, without saying it again` }),
      ...run.result,
      ...(notes.length && { notes }),
      ...(shown.length && { shown }),
      ...(run.offer && { could_offer: run.offer }),
      ...extra,
      account: accountNow(c.context().account()),
    };
    unsaid.current = [...unsaid.current, ...run.lines];
    run.lines = [];
    run.shown = [];
    run.did = undefined;
    run.offer = undefined;
    run.replaced = undefined;
    run.began = undefined;
    run.said = undefined;
    const taker = run.taker;
    run.taker = undefined;
    if (taker) return taker(out);
    fromApp(log.current, out);
    // Something they typed while this was playing is in the record just above: the turn answers both.
    const read = late.current;
    late.current = false;
    // Nothing new to tell them: what's waiting goes straight on screen.
    if (out.waiting && !notes.length && !read) return reveal();
    takeTurn({ read });
  };

  /** What the app was holding back goes on screen, now the line that leads into it is out. */
  const reveal = () => {
    const open = openRef.current;
    if (open && !open.shown) open.reveal();
  };

  /**
   * Something only the person can do. Played for the model, it's reported first and held back until the model's line
   * leading into it is out; then (or straight away, in a script) `put` shows it and it's open until settled.
   */
  const hold = async (run: Run, wait: Wait, put: () => void): Promise<Open | null> => {
    // A look-up beside something open never opens anything of its own.
    if (run.side) return null;
    const open: Open = { run, wait, shown: false, reveal: () => undefined };
    openRef.current = open;
    run.opening = undefined;
    if (run.voiced) {
      await new Promise<void>((resolve) => {
        open.reveal = resolve;
        report(run, { waiting: waitText(wait) });
      });
      if (run.cancelled) return null;
    }
    open.shown = true;
    put();
    setBusy(false);
    return open;
  };
  const given = (open: Open) => new Promise<Given>((resolve) => (open.settle = resolve));
  const close = (open: Open) => {
    open.settle = undefined;
    if (openRef.current === open) openRef.current = null;
  };

  const play = useCallback(
    async (beats: Beat[], run: Run): Promise<boolean> => {
      /** Something the app shows, noted for the model when it's the one talking. */
      const put = (m: NewMessage) => {
        const id = show(m);
        if (run.voiced) run.shown.push({ ...m, id } as StoredMessage);
        return id;
      };
      for (let i = 0; i < beats.length; i++) {
        const b = beats[i];
        if (run.cancelled) return false;
        // The flow is about to show it's working: the model's line for that goes out first.
        if (run.opening && ('work' in b || 'products' in b || 'subagent' in b || 'card' in b || 'meta' in b)) {
          const line = run.opening;
          run.opening = undefined;
          run.opened = true;
          run.said = line;
          await say(line);
          if (run.cancelled) return false;
        }
        if ('work' in b) {
          stopTyping();
          setMessages((list) => {
            const rest = list.filter((m) => m.kind !== 'work');
            return [...rest, { id: nextId.current++, kind: 'work', key: b.work, params: b.params } as StoredMessage].slice(-MAX_MESSAGES);
          });
          await sleep(b.ms);
        } else if ('products' in b) {
          const onShelf = shelf.current;
          if (onShelf !== null) {
            // Another thing found right after the last: one message, not one apiece.
            stopTyping();
            clearWork();
            patch(onShelf, (m) => (m.kind === 'products' ? { ...m, also: [...(m.also ?? []), b.params ?? {}] } : m));
            if (run.voiced) run.shown.push({ id: onShelf, kind: 'products', key: b.products, params: b.params });
          } else {
            const id = put({ kind: 'products', key: b.products, params: b.params });
            shelf.current = id;
          }
          await sleep(1200);
        } else if ('subagent' in b) {
          const id = show({ kind: 'subagent', key: b.subagent, params: b.params, done: false });
          await sleep(b.ms);
          if (run.cancelled) return false;
          patch(id, (m) => (m.kind === 'subagent' ? { ...m, done: true } : m));
          if (run.voiced) run.shown.push({ id, kind: 'subagent', key: b.subagent, params: b.params, done: true });
          await sleep(500);
        } else if ('react' in b) {
          // A reaction is the script's own touch; the model speaks for itself.
          if (run.voiced) continue;
          setMessages((list) => {
            const last = [...list].reverse().find((m) => m.kind === 'me');
            return last ? list.map((m) => (m === last ? { ...m, react: b.react } : m)) : list;
          });
          await sleep(400);
        } else if ('meta' in b) {
          put({ kind: 'meta', key: b.meta, params: b.params });
          await sleep(500);
        } else if ('divider' in b) {
          show({ kind: 'divider', text: b.divider });
        } else if ('say' in b) {
          // The model writes what's said: the flow's line is kept back as a note for it.
          if (run.voiced && !b.sender) {
            run.lines.push({ key: b.say, params: b.params });
            continue;
          }
          // Lines that carry this one on join it in one bubble.
          const parts = [{ key: b.say, params: b.params }];
          for (let next = beats[i + 1]; next && 'say' in next && next.join; next = beats[i + 1]) {
            parts.push({ key: next.say, params: next.params });
            i += 1;
          }
          const said = parts.length > 1 ? { parts } : parts[0];
          const replyTo = request.current.answered ? request.current.text : undefined;
          request.current.answered = false;
          const id = put({ kind: 'them', said, sender: b.sender, typing: true, replyTo });
          await sleep(700);
          if (run.cancelled) return false;
          patch(id, (m) => (m.kind === 'them' ? { ...m, typing: false } : m));
          await sleep(900);
        } else if ('card' in b) {
          put({ kind: 'card', key: b.card, params: b.params });
          await sleep(1000);
        } else if ('emit' in b) {
          cb.current.onEvent(b.emit);
        } else if ('pause' in b) {
          await sleep(b.pause);
        } else if ('when' in b) {
          if (!(await play(own(b.when), run))) return false;
        } else if ('ask' in b) {
          const ask = askOf(b.ask, b.params);
          const title = ask?.title ?? b.ask;
          let id = -1;
          const open = await hold(run, { kind: 'approval', title, what: ask ? describeAsk(ask) : `“${title}”` }, () => {
            id = show({ kind: 'ask', key: b.ask, params: b.params, state: 'open', led: run.voiced });
          });
          if (!open) return false;
          let answer = await given(open);
          // Approved, it opens the verification page first; closed without submitting, the approval waits again.
          while (decided(answer) === 'allow' && b.verify && !run.cancelled) {
            patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'pressing' } : m));
            setVerifying(b.verify);
            const submitted = await new Promise<boolean>((r) => (verifyRef.current = r));
            verifyRef.current = null;
            setVerifying(null);
            if (submitted) break;
            patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'open' } : m));
            answer = await given(open);
          }
          close(open);
          inWords.current = false;
          const decision = decided(answer);
          if (!decision || run.cancelled) return false;
          setBusy(true);
          // Paying another way: this checkout goes, and the flow comes back with one for the new way.
          if (typeof decision === 'object') {
            setMessages((list) => list.filter((m) => m.id !== id));
            const swap = decision.swap;
            run.did = `switched “${title}” to pay ${swap === 'card' ? 'with their card' : swap === 'topup' ? 'from the balance after adding to it' : 'from the balance'}`;
            if (b.swap && !(await play(own(() => b.swap!(swap)), run))) return false;
            continue;
          }
          if (decision === 'deny') {
            // A real no (a tile tapped over the sheet or a reset isn't one) stops the shortcuts setting things up.
            if (SETUP_ASKS.has(b.ask)) cb.current.onDeclined?.();
            run.did = `declined “${title}”`;
            patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'denied' } : m));
            await sleep(500);
            await play(b.deny, run);
            // A no ends the flow: nothing after it plays.
            return false;
          }
          run.did = `approved “${title}”`;
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
          let id = -1;
          const labels = b.chips.map((c) => c.label);
          const open = await hold(run, { kind: 'choice', options: labels }, () => {
            id = show({ kind: 'chips', chips: b.chips, picked: null, led: run.voiced });
          });
          if (!open) return false;
          const answer = await given(open);
          close(open);
          if (!answer || !('option' in answer) || run.cancelled) return false;
          const picked = answer.option;
          setBusy(true);
          patch(id, (m) => (m.kind === 'chips' ? { ...m, picked } : m));
          if (b.reply && !inWords.current && !answer.onPage) {
            push({ kind: 'me', text: labels[picked] });
            request.current.answered = true;
          }
          inWords.current = false;
          run.did = `picked “${labels[picked]}”`;
          await sleep(600);
          if (!(await play(own(() => [...(answer.onPage && b.onPage ? b.onPage(picked) : []), ...b.then(picked)]), run))) return false;
        } else if ('amount' in b) {
          const offered = b.options ?? [];
          // A script offers Other, and asks for one in its own words; with the model, they just type it.
          const labels = [...offered.map(usd), ...(run.voiced || !offered.length ? [] : ['Other'])];
          let chipsId: number | null = null;
          const open = await hold(run, { kind: 'amount', options: offered, all: b.all ? b.all / 100 : undefined }, () => {
            setAwaitingAmount(true);
            chipsId = labels.length ? show({ kind: 'chips', chips: labels.map((label) => ({ label })), picked: null, led: run.voiced }) : null;
          });
          if (!open) return false;
          let amount = 0;
          while (!amount && !run.cancelled) {
            const answer = await given(open);
            if (!answer) break;
            if ('amount' in answer) amount = answer.amount;
            if (!('option' in answer)) continue;
            const picked = answer.option;
            if (chipsId !== null) patch(chipsId, (m) => (m.kind === 'chips' ? { ...m, picked } : m));
            if (!inWords.current) push({ kind: 'me', text: labels[picked] ?? '' });
            if (picked < offered.length) amount = offered[picked];
            else void play([{ pause: 500 }, { say: 'amount.other' }], run).then(() => setBusy(false));
          }
          close(open);
          setAwaitingAmount(false);
          if (chipsId !== null) patch(chipsId, (m) => (m.kind === 'chips' && m.picked === null ? { ...m, expired: true } : m));
          if (!amount || run.cancelled) return false;
          inWords.current = false;
          request.current.answered = true;
          setBusy(true);
          run.did = `gave the amount ${usd(amount)}`;
          await sleep(500);
          if (!(await play(own(() => b.then(amount)), run))) return false;
        } else if ('name' in b) {
          const labels = run.voiced ? [b.suggestion] : [b.suggestion, 'Type my own'];
          let chipsId = -1;
          const open = await hold(run, { kind: 'name', suggestion: b.suggestion }, () => {
            setAwaitingName(true);
            chipsId = show({ kind: 'chips', chips: labels.map((label) => ({ label })), picked: null, led: run.voiced });
          });
          if (!open) return false;
          let name = '';
          while (!name && !run.cancelled) {
            const answer = await given(open);
            if (!answer) break;
            if ('name' in answer) {
              name = answer.name;
              // Typed, the thread already has it; the model read it out of what they said.
              continue;
            }
            if (!('option' in answer)) continue;
            const picked = answer.option;
            patch(chipsId, (m) => (m.kind === 'chips' ? { ...m, picked } : m));
            if (!inWords.current) push({ kind: 'me', text: labels[picked] ?? '' });
            if (picked === 0) name = b.suggestion;
            else void play([{ pause: 500 }, { say: b.other }], run).then(() => setBusy(false));
          }
          close(open);
          setAwaitingName(false);
          patch(chipsId, (m) => (m.kind === 'chips' && m.picked === null ? { ...m, expired: true } : m));
          if (!name || run.cancelled) return false;
          inWords.current = false;
          request.current.answered = true;
          setBusy(true);
          run.did = `gave the name “${name}”`;
          await sleep(500);
          if (!(await play(own(() => b.named(name)), run))) return false;
        }
      }
      return !run.cancelled;
    },
    // The helpers it calls read only refs, so the one made on first render is as good as any.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [push, patch, show, own, setBusy, stopTyping, say],
  );

  /** Whatever is playing or open gives way: open asks and chips expire. Says what was open, if anything was. */
  const dismiss = useCallback((): string | undefined => {
    const run = runRef.current;
    const open = openRef.current;
    const was = open?.shown ? waitLabel(open.wait) : undefined;
    if (!run) return was;
    run.cancelled = true;
    runRef.current = null;
    openRef.current = null;
    open?.reveal();
    open?.settle?.(null);
    authRef.current?.();
    verifyRef.current?.(false);
    authRef.current = verifyRef.current = null;
    inWords.current = false;
    setVerifying(null);
    setAwaitingAmount(false);
    setAwaitingName(false);
    setMessages((list) =>
      list
        .filter((m) => m.kind !== 'work')
        .map((m) => {
          if (m.kind === 'ask' && (m.state === 'open' || m.state === 'pressing' || m.state === 'authing')) return { ...m, state: 'expired' };
          if (m.kind === 'chips' && m.picked === null) return { ...m, expired: true };
          // A script's line caught mid-typing lands; the model's own typing bubble is its turn's to clear.
          if (m.kind === 'them' && m.typing && !('text' in m.said && !m.said.text)) return { ...m, typing: false };
          return m;
        }),
    );
    setRunning(null);
    return was;
  }, []);

  /** Somewhere to go once a script finishes: a few flows that follow, unless something else has begun. */
  const offerNext = useCallback(
    async (flow: ActionId) => {
      const ctx = cb.current.context();
      const chips = nextSteps(flow, ctx.mode ?? 'personal', ctx.account());
      if (!chips.length) return;
      await sleep(700);
      if (runRef.current || busyRef.current) return;
      dropSuggestions();
      push({ kind: 'them', said: { key: 'next.ask' }, typing: false });
      await sleep(350);
      if (runRef.current || busyRef.current) return;
      suggested.current = { id: push({ kind: 'chips', chips, picked: null }), chips };
    },
    [push, dropSuggestions],
  );

  /** A flow starts playing. It reports as it goes when the model is talking; a script just plays through. */
  const launch = useCallback(
    (run: Run, beats: Beat[]) => {
      runRef.current = run;
      setRunning(run.flow);
      setBusy(true);
      void play(beats, run).then((finished) => {
        if (run.cancelled) return;
        if (runRef.current === run) runRef.current = null;
        clearWork();
        setRunning(null);
        if (finished && run.flow) cb.current.onCompleted?.(run.flow);
        if (run.voiced) {
          const next = finished && run.flow && run.leads ? nextSteps(run.flow, mode, cb.current.context().account()).map((c) => c.label) : [];
          return report(run, finished ? { finished: true, ...(next.length && { could_suggest: next }) } : { finished: false, note: 'it stopped here: they said no, so nothing after this step happened, and what it was a step of wasn’t done. Calling it again asks for the same thing again' });
        }
        // A script said its own lines: the record gets them, so the model knows where things stand when it's back.
        const said = cb.current
          .render(messagesRef.current.filter((m) => m.id >= run.from))
          .flatMap((m) => (m.kind === 'them' && m.text ? [m.text] : []))
          .join(' ')
          .slice(0, 900);
        fromApp(log.current, { note: 'the app played this flow with its own lines, without you', ...(run.flow && { flow: run.flow }), said, finished, account: accountNow(cb.current.context().account()) });
        setBusy(false);
        if (finished && run.flow) void offerNext(run.flow);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [play, clearWork, offerNext, mode, setBusy],
  );

  const newRun = (flow: ActionId | null, voiced: boolean): Run => ({ flow, cancelled: false, voiced, opened: false, lines: [], shown: [], result: {}, leads: false, from: nextId.current });

  /** The panel groups a flow's Grid calls under it, and Duet labels the run, the first time it comes up since they spoke. */
  const group = (flow: ActionId | null, topic: () => string) => {
    if (!flow || flow === grouped.current) return;
    grouped.current = flow;
    cb.current.onRun?.(flow);
    const text = topic();
    if (!text) return;
    const eyebrow: StoredMessage = { id: nextId.current++, kind: 'eyebrow', flow, text };
    const at = typing.current;
    setMessages((list) => (at !== null ? list.flatMap((m) => (m.id === at ? [eyebrow, m] : [m])) : [...list, eyebrow]));
  };

  /**
   * A tile (or a suggestion that starts a flow) is a control: its flow starts at once, as it always has, and the model
   * takes it from what the flow reports: the line that leads into what it needs, or how it went. With the model down
   * it plays as a script, with the flow's own lines.
   */
  const startFlow = (heard: Heard) => {
    const flow = heard.flow!;
    dismiss();
    const run = newRun(flow, !down.current);
    run.leads = true;
    // Their message is what they said; that it came from a shortcut is nothing to them, or to the model.
    run.began = 'what they just asked for, in their message above: the app has already begun it, so there is nothing to call to start it';
    const ctx: FlowContext = { ...cb.current.context(), variant: heard.variant ?? 0, naming: memory.current.naming, ...(run.voiced && { offer: (what: string) => void (run.offer = what) }) };
    // Still missing what it needs (a card-only account and a flow that holds money): it asks, as the chat would.
    const beats = own(() => (needsSetup(flow, ctx.account()) ? planFor(flow, ctx) : FLOWS[flow](ctx)));
    // A shortcut that set things up on its own says so, right after it reacts.
    const setup = heard.setup;
    if (setup && (setup.connected || setup.funded > 0)) {
      const note: Beat = { say: 'setup.auto', params: { connected: setup.connected ? 1 : 0, funded: setup.funded } };
      beats.splice(beats[0] && 'react' in beats[0] ? 1 : 0, 0, note);
    }
    group(flow, () => own(() => topicFor(flow, ctx)));
    launch(run, beats);
  };

  /**
   * The model can't answer (off, over its cap, failing). What a flow kept back for it, the flow says itself and
   * carries on as a script; anything else gets the app's stock line.
   */
  const carryOnWithout = async (why: 'fallback' | 'limited') => {
    without.current = why;
    down.current = true;
    const lines = unsaid.current;
    unsaid.current = [];
    const run = runRef.current;
    if (run) run.voiced = false;
    if (lines.length) {
      const id = show({ kind: 'them', said: lines.length > 1 ? { parts: lines } : lines[0], typing: true });
      await sleep(700);
      patch(id, (m) => (m.kind === 'them' ? { ...m, typing: false } : m));
      await sleep(400);
      fromApp(log.current, { note: 'you were unavailable, so the app said this itself', said: lines.map((l) => cb.current.plain(l.key, l.params)) });
    } else {
      const said = stockLine(why);
      show({ kind: 'them', said, typing: false });
      fromApp(log.current, { note: 'you were unavailable, so the app said this itself', said: cb.current.plain(said.key, said.params) });
    }
    reveal();
    if (!runRef.current || openRef.current?.shown) setBusy(false);
  };

  /**
   * What the app has put in front of them since they last wrote (a product card, a receipt), for the model: they can
   * read it, so its next line has no call to say it again.
   */
  const seenText = () => {
    const all = messagesRef.current;
    const since = all.slice(all.map((m) => m.kind).lastIndexOf('me') + 1).filter((m) => m.kind === 'products' || m.kind === 'card' || m.kind === 'meta');
    return describe(cb.current.render(since)).slice(-4).join(' | ').slice(0, 900) || undefined;
  };

  /** What's open, for the model: on screen and waiting, or held back until its line is out. */
  const openText = () => {
    const open = openRef.current;
    if (!open) return undefined;
    return open.shown
      ? `open and waiting on them: ${waitText(open.wait)}. If what they just typed answers it in any words (a yes or a no, which one, how much, the name), call answer for them: don’t tell them to tap, and don’t call the tool that opened it again. A no, or asking you to cancel or close it, is answer with decline: you close it for them, whether or not it has a button for that. A question about it is neither: answer the question, and it stays open.`
      : `about to appear once your line is out (they can’t see it yet): ${waitText(open.wait)}. Lead into it with reply; only if they’ve already said exactly what it asks for, call answer with that instead.`;
  };

  /** The model answers what's open from what the person typed: it settles as a tap would, and the flow reports on. */
  const answerOpen = (call: ToolCall): { error: ToolResult } | Started => {
    const open = openRef.current;
    if (!open) return { error: { error: 'nothing_open', fix: 'nothing is waiting on screen: do what they asked with another tool, or reply' } };
    const i = call.input;
    const option = typeof i.option === 'number' && Number.isInteger(i.option) ? i.option - 1 : -1;
    let answer: Given = null;
    switch (open.wait.kind) {
      case 'approval':
        answer = i.decision === 'approve' ? { decision: 'allow' } : i.decision === 'decline' ? { decision: 'deny' } : null;
        break;
      case 'choice':
        answer = option >= 0 && option < open.wait.options.length ? { option } : null;
        break;
      case 'amount': {
        const amount = positive(i.amount_usd) ?? open.wait.options[option];
        answer = amount ? { amount: Math.round(amount * 100) / 100 } : null;
        break;
      }
      case 'name': {
        const name = (typeof i.name === 'string' && cleanName(i.name)) || (option === 0 ? open.wait.suggestion : '');
        answer = name ? { name } : null;
        break;
      }
      default: {
        const exhaustive: never = open.wait;
        return exhaustive;
      }
    }
    if (!answer) return { error: { error: 'not_an_answer', open: waitText(open.wait), fix: 'give what it asks for, or reply instead' } };
    const run = open.run;
    return {
      spoke: () => false,
      start: async () => {
        // Held back for a line that isn't coming (they'd already said what it asks): it goes up, and is answered.
        if (!open.shown) {
          open.reveal();
          for (let k = 0; k < 100 && !open.settle && openRef.current === open; k++) await sleep(20);
        }
        // Closed meanwhile (a tap got there first): nothing left to answer.
        if (openRef.current !== open || !open.settle) return { status: 'already_settled', note: 'they tapped it themselves just now' };
        inWords.current = true;
        // A script doesn't report: it carries on with its own lines.
        if (!run.voiced) {
          open.settle(answer);
          return Promise.resolve({ status: 'answered', note: 'the app carries on with its own lines' });
        }
        const next = new Promise<ToolResult>((resolve) => (run.taker = resolve));
        open.settle(answer);
        return next;
      },
    };
  };

  /**
   * One of the app's steps, checked and started for the model. An error before anything shows; otherwise whatever was
   * open gives way, and the step plays until it needs the person or ends, which is its result.
   */
  const prepare = (call: ToolCall, next: ToolCall | undefined, opening: boolean, whilePicking = false): { error: ToolResult } | Started => {
    const { say: _line, ...asked } = call.input;
    const made = `${call.name} ${JSON.stringify(asked)}`;
    // The very call that put up what's open: making it again would only put the same thing up afresh, and lose
    // where they'd got to.
    const open = openRef.current;
    if (open?.shown && open.run.made === made) {
      return { error: { error: 'already_open', open: waitText(open.wait), fix: 'this is already on screen from that same call, waiting on them: if what they typed answers it (a yes, a no, which one, how much, the name), call answer; otherwise reply' } };
    }
    const run = newRun(flowOf(call), true);
    run.made = made;
    run.asked = { name: call.name, input: asked };
    run.leads = !LOOKUPS.has(call.name);
    const ctx: FlowContext = { ...cb.current.context(), variant: 0, offer: (what) => (run.offer = what) };
    const out = own(() => runTool({ ctx, memory: memory.current, next }, call));
    if ('error' in out) return out;
    run.result = out.result;
    if (opening) run.opening = call.input.say;
    // Something else to find while a pick waits: only what needs no pick of its own.
    if (whilePicking && out.result.named !== true) return { error: { status: 'not_run' } };
    // A look-up while something is open (what's the fee? what's my balance?) shows what it finds and leaves it open.
    if (whilePicking || (BESIDE.has(call.name) && openRef.current?.shown)) {
      run.side = true;
      return {
        spoke: () => run.opened,
        start: (): Promise<ToolResult> => {
          const found = new Promise<ToolResult>((resolve) => (run.taker = resolve));
          void play(out.beats, run).then((finished) => report(run, whilePicking ? { finished } : { finished, note: 'what was open is still open' }));
          return found;
        },
      };
    }
    const closed = dismiss();
    if (closed) run.replaced = closed;
    group(run.flow, () => own(() => topicOf(call, ctx)));
    return {
      spoke: () => run.opened,
      start: (): Promise<ToolResult> => {
        if (!out.beats.length) return Promise.resolve({ ...out.result, finished: true, account: accountNow(cb.current.context().account()) });
        const first = new Promise<ToolResult>((resolve) => (run.taker = resolve));
        launch(run, out.beats);
        return first;
      },
    };
  };

  /**
   * The model's turn. Each step it calls tools; they're carried out in order and what happened goes back, until it
   * ends the turn (a reply, or nothing more to say) or the app has to wait on the person. An answer that lands after
   * something overtook the turn (a tap, a tile) is dropped: the record has moved on, and the next turn reads it.
   */
  const turn = async ({ read }: { read?: boolean }) => {
    if (!alive.current || !owed.current) return;
    const seq = turnSeq.current;
    const overtaken = () => seq !== turnSeq.current || !alive.current;
    const c = cb.current;
    setBusy(true);
    if (read && c.readsFor > 0) await sleep(c.readsFor);
    if (overtaken()) return;
    startTyping();
    let chips: Chip[] = [];
    let ended = false;
    // A word before the work is for a turn they started by saying something, and once: carrying on from a tap, what
    // there is to say is how that went, which comes with the result.
    let opening = !!read;
    let switching: (() => void) | undefined;
    for (let step = 0; step < MAX_STEPS && !ended; step++) {
      owed.current = false;
      const asked = endOf(log.current);
      const [answer] = await Promise.all([c.reply(windowOf(log.current), { open: openText(), seen: seenText() }), step === 0 ? sleep(c.typesFor) : undefined]);
      if (overtaken()) return;
      if ('fallback' in answer) {
        stopTyping();
        return carryOnWithout(answer.fallback);
      }
      down.current = false;
      const { calls } = answer;
      called(log.current, calls, asked);
      /** Why the calls after one that stopped the step didn't run. */
      let stopped = '';
      /** A search is waiting on their pick, held back for the model's line: the rest of what it's finding still shows. */
      let picking = false;
      /** A call in this step has run through: a line written alongside it was written before its result was in. */
      let ran = false;
      /** The model turned down what was open for them, in this step: what it says in the same breath needs no result. */
      let declined = false;
      for (let i = 0; i < calls.length; i++) {
        const call = calls[i];
        // "Cancel that": it closes what was open and says so at once. A no has one outcome, so the line isn't a guess.
        const closing = declined && (call.name === 'reply' || call.name === 'offer_choices' || call.name === 'wait') && !overtaken();
        if (stopped && !closing) {
          // Asked for several things, they see everything found at once, then pick: not one thing, a question, then more.
          const also = picking && call.name === 'search' && !overtaken() ? prepare(call, undefined, false, true) : null;
          if (also && 'start' in also) settled(log.current, call.id, await also.start());
          else settled(log.current, call.id, { status: 'not_run', note: stopped });
          continue;
        }
        if (overtaken()) break;
        if (ran && !closing && ENDS_TURN.has(call.name)) {
          // Written in the same step as what it's about, so without knowing how that went ("Checking the fee…",
          // or a guess at the outcome): it isn't shown, and the model says it with the result in front of it.
          settled(log.current, call.id, { status: 'not_shown', note: 'you wrote this in the same step as the calls above, before their results were in, so they haven’t seen it: say how it went now, once' });
          stopped = 'the step ended before this';
          continue;
        }
        if (call.name === 'wait' || call.name === 'reply' || call.name === 'offer_choices') {
          if (call.name !== 'wait' && call.input.say) await say(call.input.say);
          const options = call.name === 'offer_choices' ? call.input.options : call.input.suggestions;
          chips = Array.isArray(options) ? options.filter((o): o is string => typeof o === 'string').map(chipOf) : [];
          settled(log.current, call.id, { status: 'shown' });
          ended = true;
          stopped = 'the turn ended before this';
          continue;
        }
        if (call.name === 'switch_account') {
          const to = MODES.find((m) => m === call.input.to);
          const go = cb.current.onSwitchAccount;
          if (!to || to === mode || !go) {
            settled(log.current, call.id, { error: 'already_here', fix: 'they’re on this account already: do what they asked here, or reply' }, true);
            stopped = 'an earlier call in this step failed';
            continue;
          }
          if (call.input.say) await say(call.input.say);
          const carry = typeof call.input.carry === 'string' ? call.input.carry.trim().slice(0, 280) : '';
          settled(log.current, call.id, { status: 'switched', note: `they’re on their ${to} account now, which has its own conversation${carry ? ': what they asked was passed on there' : ''}` });
          switching = () => go(to, carry || undefined);
          ended = true;
          stopped = 'the turn ended before this';
          continue;
        }
        // What the app is holding back comes next, and they haven't seen it yet: until the model's line is out,
        // there's nothing else to start. (Once it's open, something they type can take its place.)
        const held = openRef.current && !openRef.current.shown ? openRef.current : null;
        const started: { error: ToolResult } | Started =
          held && call.name !== 'answer' && !corrects(held.run, call)
            ? { error: { error: 'waiting_on_them', waiting: waitText(held.wait), fix: 'the app shows this the moment your line is out, and the flow carries on by itself once they act: lead into it with reply, in one sentence, and call nothing else' } }
            : call.name === 'answer'
              ? answerOpen(call)
              : prepare(call, calls[i + 1], opening && !!call.input.say);
        if ('error' in started) {
          settled(log.current, call.id, started.error, true);
          stopped = 'an earlier call in this step failed';
          continue;
        }
        if (call.name !== 'answer' && call.input.say) opening = false;
        const result = await started.start();
        settled(log.current, call.id, result);
        ran = true;
        if (result.waiting) {
          picking = call.name === 'search';
          stopped = 'an earlier call in this step is waiting on them: call this again once they’ve acted, if it’s still wanted';
          // Its line as it started leads into this, and there's nothing new to tell them: it goes straight on screen.
          if (started.spoke() && !result.notes) ended = true;
        } else if (result.finished === false) {
          stopped = 'an earlier call in this step stopped: they said no';
          declined = call.name === 'answer';
        }
      }
      if (overtaken()) return;
      if (!ended) startTyping();
    }
    stopTyping();
    clearWork();
    unsaid.current = [];
    reveal();
    if (chips.length && !openRef.current) {
      await sleep(350);
      if (overtaken()) return;
      const id = push({ kind: 'chips', chips, picked: null, led: true });
      suggested.current = { id, chips };
    }
    if (overtaken()) return;
    setBusy(false);
    if (!switching) return;
    // Its line is read, then the other account comes up.
    await sleep(900);
    if (!overtaken()) switching();
  };

  /* ── The person's side ────────────────────────────────────────────── */

  /**
   * Something the person said: into the thread and the record. Typed, the model takes a turn; from a tile or a
   * suggestion that starts a flow, the flow starts.
   */
  const hear = (meant: string, heard: Heard = {}) => {
    const text = heard.shown ?? meant;
    push({ kind: 'me', text, ...(meant !== text ? { meant } : {}) });
    request.current = { text, answered: false };
    grouped.current = null;
    typed(log.current, meant);
    // Where they typed it is something the model can't see: while a name or an amount is asked for, the message field
    // itself says so ("Type a name"), so what goes into it is that, whatever else it reads like.
    const asked = !heard.flow && openRef.current?.shown ? openRef.current.wait.kind : null;
    if (asked === 'name' || asked === 'amount') {
      fromApp(log.current, {
        typed_into: `the message field, which read “Type ${asked === 'name' ? 'a name' : 'an amount'}” as they wrote this: it’s the ${asked} they’re giving, however much it reads like a request, unless it’s plainly a question for you or them backing out`,
      });
    }
    if (heard.flow) {
      setBusy(true);
      starting.current = true;
      return afterReading(() => {
        starting.current = false;
        if (alive.current) startFlow(heard);
      });
    }
    // Typed while a step plays on from a tap, with no turn under way: it's answered with how that step went, when
    // it reports, rather than by a turn that would start something on top of it.
    const midStep = starting.current || (!!runRef.current && !openRef.current?.shown);
    if (midStep && !pending.current) return void (late.current = true);
    takeTurn({ read: true });
  };

  /** A tap (or its exact words) settles what's open, ahead of any turn in flight. */
  const settle = (answer: NonNullable<Given>): boolean => {
    const open = openRef.current;
    if (!open?.shown || !open.settle) return false;
    turnSeq.current += 1;
    stopTyping();
    open.settle(answer);
    return true;
  };

  // A tile's jump, applied once: whatever was playing gives way, and the tile's line goes out as the visitor's message.
  const lastNonce = useRef(0);
  useEffect(() => {
    if (!entry || entry.nonce === lastNonce.current) return;
    lastNonce.current = entry.nonce;
    const def = ACTIONS.find((a) => a.id === entry.flow)!;
    turnSeq.current += 1;
    stopTyping();
    unsaid.current = [];
    const closed = dismiss();
    if (closed) fromApp(log.current, { note: `they had ${closed} open, which closed: they tapped a tile instead` });
    dropSuggestions();
    hear(def.prompts[entry.variant % def.prompts.length], { flow: entry.flow, variant: entry.variant, setup: entry.setup });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);

  // Something they asked for on the other account that belongs here: it arrives as their message.
  const lastCarried = useRef(0);
  useEffect(() => {
    if (!carried || carried.nonce === lastCarried.current) return;
    lastCarried.current = carried.nonce;
    dropSuggestions();
    hear(carried.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carried]);

  /** A control in the thread (the balance card's Add money) asks as the visitor would, with its tile's line. */
  const prompt = useCallback(
    (flow: ActionId) => {
      if (runRef.current || busyRef.current) return;
      dropSuggestions();
      hear(ACTIONS.find((a) => a.id === flow)!.prompts[0], { flow });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dropSuggestions],
  );

  const activeFlow = running;
  useEffect(() => {
    cb.current.onActiveFlow?.(activeFlow);
  }, [activeFlow]);

  const send = useCallback(() => {
    const text = composer.trim();
    if (!text) return;
    const open = openRef.current?.shown && openRef.current.settle ? openRef.current : null;
    if (open) {
      // Exactly what a tap would send: it settles what's open, as the tap would.
      const tap = tapFor(text, open.wait, open.run.voiced);
      if (tap) {
        setComposer('');
        push({ kind: 'me', text });
        inWords.current = true;
        afterReading(() => {
          if (openRef.current === open) settle(tap);
          else inWords.current = false;
        });
        return;
      }
      // A script has no model to read anything else: it says so, and what's open stays open.
      if (!open.run.voiced) {
        setComposer('');
        push({ kind: 'me', text });
        show({ kind: 'them', said: stockLine(without.current), typing: false });
        return;
      }
    }
    // Mid-step, a script can't take anything in. The model can: what they type any time is read, and answered once
    // the step under way is done (a turn already going reads it on its next step).
    if (busyRef.current && down.current) return;
    setComposer('');
    // A typed number picks a suggestion (Instinct lists them as a numbered text).
    const s = suggested.current;
    const n = Number.parseInt(text, 10);
    const i = !open && s && String(n) === text && n >= 1 && n <= s.chips.length ? n - 1 : -1;
    dropSuggestions(i >= 0 ? i : undefined);
    if (i >= 0) hear(s!.chips[i].label, { shown: text, flow: s!.chips[i].flow });
    else hear(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composer, push, show, dropSuggestions, mode]);

  /** The visitor's tap on the open ask's primary button. */
  const allow = useCallback(() => void (openRef.current?.wait.kind === 'approval' && settle({ decision: 'allow' })), []);
  const deny = useCallback(() => void (openRef.current?.wait.kind === 'approval' && settle({ decision: 'deny' })), []);
  /** The checkout's Pay with switched to another way to pay. */
  const swap = useCallback((to: PayTo) => void (openRef.current?.wait.kind === 'approval' && settle({ decision: { swap: to } })), []);
  /** A choice tapped: a chip, or (`onPage`) an option on a page the app opened. */
  const pick = useCallback(
    (i: number, onPage?: boolean) => {
      const open = openRef.current;
      if (open?.shown && open.wait.kind !== 'approval') return void settle({ option: i, onPage });
      const s = suggested.current;
      if (!s || runRef.current || busyRef.current || !s.chips[i]) return;
      setComposer((c) => (s.chips.some((chip) => chip.label === c) ? '' : c));
      dropSuggestions(i);
      hear(s.chips[i].label, { flow: s.chips[i].flow });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dropSuggestions],
  );
  /** Face ID finished its scan and checkmark. */
  const authed = useCallback(() => authRef.current?.(), []);
  /** The verification page submitted, or closed. */
  const verified = useCallback(() => verifyRef.current?.(true), []);
  const verifyClosed = useCallback(() => verifyRef.current?.(false), []);
  /** The account as it stands, for the balance page. */
  const account = useCallback(() => cb.current.context().account(), []);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      dismiss();
    };
  }, [dismiss]);

  const authing = messages.some((m) => m.kind === 'ask' && m.state === 'authing');
  const asking = messages.some((m) => m.kind === 'ask' && (m.state === 'open' || m.state === 'pressing' || m.state === 'authing'));
  const answering = messages.some((m) => (m.kind === 'ask' && m.state === 'open') || (m.kind === 'chips' && m.picked === null && !m.expired));

  return {
    messages,
    composer,
    setComposer,
    send,
    canSend: composer.trim().length > 0 && (answering || awaitingAmount || awaitingName || !busy),
    /** A flow is waiting on a typed dollar amount ("How much?"). */
    awaitingAmount,
    /** A flow is waiting on a typed name (the company, the owner). */
    awaitingName,
    /** The account this conversation is on. */
    mode,
    busy,
    allow,
    deny,
    swap,
    pick,
    prompt,
    authed,
    /** The business verification page to show, while an approval waits on it. */
    verifying,
    verified,
    verifyClosed,
    authing,
    asking,
    activeFlow,
    account,
  };
}

export type AgentBrain = ReturnType<typeof useAgentBrain>;
