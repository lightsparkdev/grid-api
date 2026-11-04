import { useCallback, useEffect, useRef, useState } from 'react';
import type { AgentEvent } from '@/data/agentEvents';
import { keyFor, type KeyboardLayer } from './keyboard/Keyboard';
import type { BrainStep, Episode, Message, Step } from './conversation';

export interface Keys {
  layer: KeyboardLayer;
  shift: boolean;
  pressed: string | null;
}

/** One flow to play in the thread: the steps come from the brain (see lib/chatBrain). */
export interface ChatRun {
  nonce: number;
  steps: () => AsyncIterable<BrainStep>;
}

type NewMessage = Message extends infer M ? (M extends Message ? Omit<M, 'id'> : never) : never;

const MAX_MESSAGES = 14;
const KEY_POP_MS = 110;
/** An open approval waits this long for the visitor's tap, then answers itself. */
const ASK_WAIT_MS = 7000;
const CHIPS_WAIT_MS = 4500;
const FACE_ID_WAIT_MS = 5000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A history as it reads once it's happened: everything said, every ask answered, every chip picked. */
function settled(history: Episode): Message[] {
  return history.flatMap((step, i): Message[] => {
    const id = i + 1;
    if ('me' in step) return [{ id, kind: 'me', text: step.me }];
    if ('them' in step) return [{ id, kind: 'them', text: step.them, sender: step.sender, bullets: step.bullets, typing: false }];
    if ('ask' in step) return [{ id, kind: 'ask', ask: step.ask, state: 'done' }];
    if ('card' in step) return [{ id, kind: 'card', card: step.card, sender: step.sender }];
    if ('chips' in step) return [{ id, kind: 'chips', chips: step.chips, picked: step.pick }];
    if ('tag' in step) return [{ id, kind: 'tag', text: step.tag }];
    if ('stamp' in step) return [{ id, kind: 'stamp', text: step.stamp }];
    return [];
  });
}

/**
 * Plays flows in an agent's thread on demand: the person types on the
 * keyboard, the agent types then speaks, asks for approval (the visitor
 * answers; it answers itself if they don't), and every Grid call the flow
 * makes fires at its beat through `onEvent`. The thread keeps what's been
 * said, so flows read as one running conversation.
 */
export function useAgentChat({
  history,
  run,
  onEvent,
  onSettled,
}: {
  history: Episode;
  run?: ChatRun;
  onEvent?: (event: AgentEvent) => void;
  /** The flow has played out. */
  onSettled?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>(() => settled(history));
  // What's typed in the composer while the keyboard is up; null when it's down.
  const [draft, setDraft] = useState<string | null>(null);
  const [keys, setKeys] = useState<Keys>({ layer: 'letters', shift: true, pressed: null });
  const [sending, setSending] = useState(false);
  const nextId = useRef(history.length + 1);
  const answerRef = useRef<(() => void) | null>(null);
  const authRef = useRef<(() => void) | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;

  const push = useCallback((m: NewMessage) => {
    const id = nextId.current++;
    setMessages((list) => [...list, { ...m, id } as Message].slice(-MAX_MESSAGES));
    return id;
  }, []);
  const patch = useCallback(
    (id: number, f: (m: Message) => Message) => setMessages((list) => list.map((m) => (m.id === id ? f(m) : m))),
    [],
  );

  const nonce = run?.nonce;
  const stepsRef = useRef(run?.steps);
  stepsRef.current = run?.steps;

  useEffect(() => {
    const steps = stepsRef.current;
    if (nonce === undefined || !steps) return;
    let alive = true;

    const type = async (text: string) => {
      setKeys({ layer: 'letters', shift: true, pressed: null });
      setDraft('');
      await sleep(650);
      for (const ch of text) {
        if (!alive) return false;
        const k = keyFor(ch);
        setKeys({ layer: k.layer, shift: k.shift, pressed: k.id });
        setDraft((d) => (d ?? '') + ch);
        await sleep(KEY_POP_MS);
        setKeys((s) => ({ ...s, pressed: null, shift: false }));
        await sleep(ch === ' ' ? 30 : 15 + Math.random() * 55);
      }
      await sleep(360);
      setSending(true);
      await sleep(160);
      setSending(false);
      push({ kind: 'me', text });
      setDraft(null);
      return true;
    };

    const play = async (step: Step) => {
      if ('me' in step) {
        if (step.quick) push({ kind: 'me', text: step.me });
        else if (!(await type(step.me))) return false;
        await sleep(800);
      } else if ('them' in step) {
        const id = push({ kind: 'them', text: step.them, sender: step.sender, bullets: step.bullets, typing: true });
        await sleep(1000);
        patch(id, (m) => (m.kind === 'them' ? { ...m, typing: false } : m));
        await sleep(900 + Math.min(1400, step.them.length * 10));
      } else if ('ask' in step) {
        const id = push({ kind: 'ask', ask: step.ask, state: 'open' });
        await Promise.race([new Promise<void>((r) => (answerRef.current = r)), sleep(ASK_WAIT_MS)]);
        answerRef.current = null;
        if (!alive) return false;
        patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'pressing' } : m));
        await sleep(160);
        if (step.faceId) {
          patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'authing' } : m));
          await Promise.race([new Promise<void>((r) => (authRef.current = r)), sleep(FACE_ID_WAIT_MS)]);
          authRef.current = null;
          if (!alive) return false;
        }
        patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'done' } : m));
        await sleep(900);
      } else if ('card' in step) {
        push({ kind: 'card', card: step.card, sender: step.sender });
        await sleep(step.moment ? 2400 : 1400);
      } else if ('chips' in step) {
        const id = push({ kind: 'chips', chips: step.chips, picked: null });
        await Promise.race([new Promise<void>((r) => (answerRef.current = r)), sleep(CHIPS_WAIT_MS)]);
        answerRef.current = null;
        patch(id, (m) => (m.kind === 'chips' ? { ...m, picked: step.pick } : m));
        await sleep(600);
      } else if ('tag' in step) {
        push({ kind: 'tag', text: step.tag });
        await sleep(500);
      } else if ('stamp' in step) {
        push({ kind: 'stamp', text: step.stamp });
        await sleep(300);
      } else {
        await sleep(step.pause);
      }
      return alive;
    };

    (async () => {
      for await (const step of steps()) {
        if (!alive) return;
        if ('emit' in step) {
          onEventRef.current?.(step.emit);
          continue;
        }
        if (!(await play(step))) return;
      }
      if (alive) onSettledRef.current?.();
    })();
    return () => {
      alive = false;
      answerRef.current = null;
      authRef.current = null;
      setDraft(null);
      setSending(false);
    };
  }, [nonce, push, patch]);

  /** The visitor answers the open ask (or picks the chip) before the agent does. */
  const answer = useCallback(() => answerRef.current?.(), []);
  /** Face ID finished its scan and checkmark. */
  const authed = useCallback(() => authRef.current?.(), []);
  const authing = messages.some((m) => m.kind === 'ask' && m.state === 'authing');
  const asking = messages.some((m) => m.kind === 'ask' && m.state !== 'done');

  return { messages, draft, keys, sending, answer, authing, authed, asking };
}

export type AgentChat = ReturnType<typeof useAgentChat>;
