type PointerEventLike = { pointerType?: string };
type Handler<Event> = (event: Event) => void;
let audioContext: AudioContext | null = null;

function cue(frequency: number) {
  if (typeof window === 'undefined' || document.visibilityState !== 'visible') return;
  if (
    typeof window.localStorage?.getItem === 'function' &&
    window.localStorage.getItem('ls-demo-sounds-muted') === '1'
  ) {
    return;
  }
  const AudioContextConstructor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return;
  const context = audioContext ?? new AudioContextConstructor();
  audioContext = context;
  if (context.state === 'suspended') void context.resume();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.018, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.025);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.03);
}

export function pressable<
  PointerEvent extends PointerEventLike,
  ClickEvent,
>(
  own: {
    onPointerEnter?: Handler<PointerEvent>;
    onClick?: Handler<ClickEvent>;
    disabled?: boolean;
  },
  bright = false,
) {
  return {
    onPointerEnter: (event: PointerEvent) => {
      if (!own.disabled && event.pointerType === 'mouse') cue(bright ? 3600 : 2400);
      own.onPointerEnter?.(event);
    },
    onClick: (event: ClickEvent) => {
      if (!own.disabled) cue(bright ? 1600 : 900);
      own.onClick?.(event);
    },
  };
}
