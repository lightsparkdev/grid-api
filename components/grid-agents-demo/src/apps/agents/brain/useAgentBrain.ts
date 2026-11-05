import { useCallback, useEffect, useRef, useState } from 'react';
import { ACTIONS, type ActionId } from '@/data/actions';
import type { AgentEvent } from '@/data/agentEvents';
import type { Beat, Said, StoredMessage } from '../conversation';
import { FLOWS, type FlowContext } from '../flows';

/** A tile's jump: put this flow's line in the composer. */
export interface FlowEntry {
  nonce: number;
  flow: ActionId;
  variant: number;
}

/** What the agent says to anything that isn't a flow's line, until the model is wired. */
export interface FreeTextReply {
  said: Said;
  /** A flow the reply starts, as if its tile's line had been sent. */
  flow?: { id: ActionId; variant: number };
}

type Decision = 'allow' | 'deny' | 'cancel';
type NewMessage = StoredMessage extends infer M ? (M extends StoredMessage ? Omit<M, 'id'> : never) : never;

const MAX_MESSAGES = 16;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
}) {
  const [messages, setMessages] = useState<StoredMessage[]>(() => [
    { id: 0, kind: 'stamp', text: 'Today' },
    { id: 1, kind: 'them', said: { key: 'greeting' }, typing: false },
  ]);
  // The clock is the visitor's, so it lands after hydration.
  useEffect(() => {
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setMessages((all) => all.map((m) => (m.id === 0 && m.kind === 'stamp' ? { ...m, text: `Today ${time}` } : m)));
  }, []);
  const [composer, setComposer] = useState('');
  const [prefill, setPrefill] = useState<{ flow: ActionId; variant: number; text: string } | null>(null);
  const [running, setRunning] = useState<ActionId | null>(null);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(2);
  const runRef = useRef<Run | null>(null);
  const decideRef = useRef<((d: Decision) => void) | null>(null);
  const pickRef = useRef<((i: number) => void) | null>(null);
  const authRef = useRef<(() => void) | null>(null);

  const cb = useRef({ context, onEvent, onActiveFlow, onRun, onCompleted, reply });
  cb.current = { context, onEvent, onActiveFlow, onRun, onCompleted, reply };

  const push = useCallback((m: NewMessage) => {
    const id = nextId.current++;
    setMessages((list) => [...list, { ...m, id } as StoredMessage].slice(-MAX_MESSAGES));
    return id;
  }, []);
  const patch = useCallback((id: number, f: (m: StoredMessage) => StoredMessage) => {
    setMessages((list) => list.map((m) => (m.id === id ? f(m) : m)));
  }, []);

  /** Stop whatever is playing: open asks and chips expire, typing settles. */
  const cancelRun = useCallback(() => {
    const run = runRef.current;
    if (!run) return;
    run.cancelled = true;
    runRef.current = null;
    decideRef.current?.('cancel');
    pickRef.current?.(-1);
    authRef.current?.();
    decideRef.current = pickRef.current = authRef.current = null;
    setMessages((list) =>
      list.map((m) => {
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
        if ('say' in b) {
          const id = push({ kind: 'them', said: { key: b.say, params: b.params }, sender: b.sender, typing: true });
          await sleep(700);
          if (run.cancelled) return false;
          patch(id, (m) => (m.kind === 'them' ? { ...m, typing: false } : m));
          await sleep(900);
        } else if ('card' in b) {
          push({ kind: 'card', key: b.card, params: b.params });
          await sleep(1000);
        } else if ('emit' in b) {
          cb.current.onEvent(b.emit);
        } else if ('pause' in b) {
          await sleep(b.pause);
        } else if ('when' in b) {
          if (!(await play(b.when(), run))) return false;
        } else if ('ask' in b) {
          const id = push({ kind: 'ask', key: b.ask, params: b.params, state: 'open' });
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
          const id = push({ kind: 'chips', chips: b.chips, picked: null });
          setBusy(false);
          const picked = await new Promise<number>((r) => (pickRef.current = r));
          pickRef.current = null;
          if (picked < 0 || run.cancelled) return false;
          setBusy(true);
          patch(id, (m) => (m.kind === 'chips' ? { ...m, picked } : m));
          if (b.reply) push({ kind: 'me', text: b.chips[picked].label });
          await sleep(600);
          if (!(await play(b.then(picked), run))) return false;
        }
      }
      return !run.cancelled;
    },
    [push, patch],
  );

  const start = useCallback(
    async (flow: ActionId | null, beats: Beat[]) => {
      const run: Run = { flow, cancelled: false };
      runRef.current = run;
      if (flow) cb.current.onRun?.(flow);
      setRunning(flow);
      setBusy(true);
      const finished = await play(beats, run);
      if (runRef.current !== run) return;
      runRef.current = null;
      setRunning(null);
      setBusy(false);
      if (finished && flow) cb.current.onCompleted?.(flow);
    },
    [play],
  );

  // A tile's jump, applied once: whatever was playing stops, and its line lands in the composer.
  const lastNonce = useRef(0);
  useEffect(() => {
    if (!entry || entry.nonce === lastNonce.current) return;
    lastNonce.current = entry.nonce;
    const def = ACTIONS.find((a) => a.id === entry.flow)!;
    const text = def.prompts[entry.variant % def.prompts.length];
    cancelRun();
    setPrefill({ flow: entry.flow, variant: entry.variant, text });
    setComposer(text);
  }, [entry, cancelRun]);

  const activeFlow = running ?? prefill?.flow ?? null;
  useEffect(() => {
    cb.current.onActiveFlow?.(activeFlow);
  }, [activeFlow]);

  const send = useCallback(async () => {
    const text = composer.trim();
    if (!text || runRef.current) return;
    setComposer('');
    push({ kind: 'me', text });
    const flowLine = prefill && text === prefill.text ? prefill : null;
    setPrefill(null);
    if (flowLine) {
      const ctx: FlowContext = { ...cb.current.context(), variant: flowLine.variant };
      void start(flowLine.flow, FLOWS[flowLine.flow](ctx));
      return;
    }
    setBusy(true);
    const typingId = push({ kind: 'them', said: { text: '' }, typing: true });
    const answer = await cb.current.reply(text);
    patch(typingId, (m) => (m.kind === 'them' ? { ...m, said: answer.said, typing: false } : m));
    setBusy(false);
    if (answer.flow) {
      const ctx: FlowContext = { ...cb.current.context(), variant: answer.flow.variant };
      await sleep(700);
      void start(answer.flow.id, FLOWS[answer.flow.id](ctx));
    }
  }, [composer, prefill, push, patch, start]);

  /** The visitor's tap on the open ask's primary button. */
  const allow = useCallback(() => decideRef.current?.('allow'), []);
  const deny = useCallback(() => decideRef.current?.('deny'), []);
  const pick = useCallback((i: number) => pickRef.current?.(i), []);
  /** Face ID finished its scan and checkmark. */
  const authed = useCallback(() => authRef.current?.(), []);

  useEffect(() => () => cancelRun(), [cancelRun]);

  const authing = messages.some((m) => m.kind === 'ask' && m.state === 'authing');
  const asking = messages.some((m) => m.kind === 'ask' && (m.state === 'open' || m.state === 'pressing' || m.state === 'authing'));

  return {
    messages,
    composer,
    setComposer,
    send,
    canSend: composer.trim().length > 0 && !running && !busy,
    prefilled: prefill !== null && composer === prefill.text,
    busy,
    allow,
    deny,
    pick,
    authed,
    authing,
    asking,
    activeFlow,
  };
}

export type AgentBrain = ReturnType<typeof useAgentBrain>;
