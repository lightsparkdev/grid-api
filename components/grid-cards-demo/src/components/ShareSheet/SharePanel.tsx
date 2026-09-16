'use client';

import clsx from 'clsx';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion as m, useReducedMotion } from 'motion/react';
import { TextMorph } from 'torph/react';
import { IconChainLink1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChainLink1';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconHand5Finger } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconHand5Finger';
import { IconLayoutWindow } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLayoutWindow';
import { IconImages1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconImages1';
import { IconPlusSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusSmall';
import { IconVideoClip } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconVideoClip';
import { IconX } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconX';
import type { ShareStageState } from '@/components/CardStage/CardStage';
import type { CardExporter, ExportPose } from '@/components/CardStage/export/exportRenderer';
import {
  BACKDROPS,
  brandSurfaceFor,
  exposureFor,
  HAND_POSE,
  handById,
  handHoleIn,
  handLayerIn,
  handsLoaded,
  handToneFor,
  decodeHand,
  paletteFor,
  prepareHand,
  prepareHands,
  paletteOn,
  TEMPLATE_TUPLE,
  warmTemplate,
  type BackdropId,
  type Hand,
  type Palette,
  type Surfaces,
  type Treatment,
} from '@/components/CardStage/export/compose';
import { canEncodeVideo, renderSpinVideo } from '@/components/CardStage/export/exportVideo';
import {
  CARD_IN_LAYOUT,
  HAND_OVERLAP,
  HERO_POSE,
  POSES,
  renderStill,
  SAVE_SCALE,
  stillSize,
  type PoseId,
} from '@/components/CardStage/export/stills';
import { ColorPicker } from '@/components/DesignPicker/ColorPicker';
import { SwatchRow } from '@/components/DesignPicker/DesignPicker';
import picker from '@/components/DesignPicker/DesignPicker.module.scss';
import { Tooltip } from '@/components/Tooltip/Tooltip';
import { footprint } from '@/apps/card/cardMetrics';
import { programNameOf } from '@/apps/shared/brand/BrandContext';
import { brandColorOf, sameDesign, type CardDesign } from '@/data/design';
import type { SharedCard } from '@/hooks/useCardsDemoLogic';
import { useThemeMode } from '@/hooks/useThemeMode';
import { cubicBezierCss, easeOutQuick, easeOutSnappy, easeOutSwift, motionTransition } from '@/lib/easing';
import { createShare, ShareError, type ShareHandle, type ShareProgress } from '@/lib/share/client';
import { shareUrl, xIntentUrl } from '@/lib/share/urls';
import { play, pressable } from '@/lib/sounds';
import styles from './SharePanel.module.scss';

interface SharePanelProps {
  open: boolean;
  exporterRef: React.MutableRefObject<CardExporter | null>;
  design: CardDesign;
  /** The share the playground was opened from, if any. */
  shared: SharedCard | null;
  /** What the stage needs to park and pose the card in the frame. */
  onStage: (state: ShareStageState) => void;
  /** An element above the stage's canvas (pointer-events none) for what
   *  must draw over the card: the hand. */
  frontHost: HTMLElement | null;
}

/** The hand shown first. */
const DEFAULT_HAND = 'h1';
/** How long into the hand's leaving (SharePanel.module.scss, .handMotion)
 *  the card starts moving off to the template's slot: the two overlap, as
 *  they do arriving. And when the hand has gone, and can be unmounted. */
const HAND_OUT_MS = 260;
const HAND_GONE_MS = 720;

/** The panel's width on the stage, the room kept around it, and the strip
 *  at the bottom the Share/Close button stands in. */
const PANEL_W = 440;
const PANEL_GUTTER = 16;
const BUTTON_STRIP = 68;
/** Below the frame: the rows, the tiles, and a status line (px), for fitting
 *  the frame to a short stage. */
const CONTROLS_H = 8 + 116 + 8 + 108 + 8 + 26;

/** The frame's layout, in the Figma's units (see compose.ts). */
const LAYOUT = 800;
const PAD = 24;
const COL_PAD = 8;
const TEXT = 8;

type VideoState =
  | { status: 'idle' }
  | { status: 'rendering'; done: number; total: number }
  /** Rendered, for the surface and design in `key`. */
  | { status: 'done'; blob: Blob; key: string }
  | { status: 'unavailable' }
  | { status: 'failed' };

const LABEL_MORPH_MS = 280;
/** A tile's glyph giving way to the spinner and back. */
const GLYPH_IN = motionTransition(easeOutSnappy, 0.42);
const GLYPH_OUT = motionTransition(easeOutQuick, 0.2);
/** The phone's own entrance and exit (AppShell): 128 px up, 0.9 to 1, a
 *  48 px blur clearing, 0.7 s in on an ease-out quart; and out over 0.45 s
 *  on the same curve run backward (the boot's linear clock reversing
 *  through the ease-out), so it gathers speed as it goes. */
const easeOutQuart = [0.165, 0.84, 0.44, 1] as const;
const easeInQuart = [0.56, 0, 0.835, 0.16] as const;
const PANEL_IN = motionTransition(easeOutQuart, 0.7);
const PANEL_OUT = motionTransition(easeInQuart, 0.45);
const PANEL_AWAY = { opacity: 0, scale: 0.9, y: 128, filter: 'blur(48px)' };
/** The panel's growth, and the controls' rise inside it: a gentler curve
 *  than the snappy one (which front-loads so hard the growth reads as a
 *  jump), on the same clock so they land together. */
const easeOutGentle = [0.32, 0.72, 0, 1] as const;
const GROW = motionTransition(easeOutGentle, 0.7);
const ROW_IN = motionTransition(easeOutGentle, 0.6);
/** The third row arriving or leaving as the Style changes (Skin for Pose):
 *  each fades where it stands. */
const ROW_SWAP = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: motionTransition(easeOutGentle, 0.4),
} as const;

function download(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

function fileStem(design: CardDesign) {
  return (
    (programNameOf(design)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'card') + '-card'
  );
}

/**
 * Share, on the stage. Open, the card flies into the frame (the share
 * template drawn in DOM, with an empty slot the stage parks the card in), the
 * rows and the tiles come in under it, and the panel grows to hold them. The
 * card is the one on the stage: posed from the row, or turned by hand right
 * there. The pictures are rendered offscreen from that same pose.
 */
export function SharePanel({ open, exporterRef, design, shared, onStage, frontHost }: SharePanelProps) {
  const theme = useThemeMode();
  const reduceMotion = useReducedMotion() ?? false;
  const cardColor = brandColorOf(design);

  // The backdrop follows the theme until the visitor picks one.
  const [backdropPick, setBackdropPick] = useState<BackdropId | null>(null);
  const backdrop: BackdropId = backdropPick ?? (theme === 'dark' ? 'dark' : 'light');
  const [brandBg, setBrandBg] = useState(cardColor);
  const [customBg, setCustomBg] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    brandSurfaceFor(design, cardColor).then((c) => alive && setBrandBg(c));
    return () => {
      alive = false;
    };
  }, [design, cardColor]);
  const surfaces = useMemo<Surfaces>(() => ({ brand: brandBg, custom: customBg }), [brandBg, customBg]);
  const palette: Palette = useMemo(() => paletteFor(backdrop, surfaces), [backdrop, surfaces]);

  // The template on a surface, or the hand. The hand holds a flat card only.
  const [treatmentPick, setTreatmentPick] = useState<Treatment>('template');
  const handOk = design.orientation === 'landscape';
  const treatment: Treatment = handOk ? treatmentPick : 'template';
  const hand = treatment === 'hand';
  // The set of hands (the manifest; then every layer, so a swap is instant),
  // the one picked, and the one shown: the pick becomes the shown hand once
  // its layer is loaded and decoded, so the swap is one frame to the next,
  // with no gap for the frame behind to show through.
  const [hands, setHands] = useState<Hand[] | null>(handsLoaded());
  const [handId, setHandId] = useState<string>(DEFAULT_HAND);
  const [shownHand, setShownHand] = useState<string | null>(null);
  useEffect(() => {
    if (!hand || hands) return;
    let alive = true;
    prepareHands()
      .then((list) => {
        if (!alive) return;
        setHands(list);
        for (const h of list) prepareHand(h.id).catch(() => {});
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [hand, hands]);
  useEffect(() => {
    if (!hand || shownHand === handId) return;
    let alive = true;
    prepareHand(handId)
      .then(() => decodeHand(handId))
      .then(() => alive && setShownHand(handId))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [hand, handId, shownHand]);
  const handLoaded = shownHand !== null;
  const handShown = hand && handLoaded;
  // What the frame and the stage hold. Going to the hand, the card moves
  // first and the hand arrives once it is still; leaving, the hand goes
  // first, and only then does the card move to the template's slot (the
  // hold outlasts the hand's exit).
  const [held, setHeld] = useState<Treatment>(treatment);
  // The hand stays mounted (fading) past the hold, until it has gone.
  const [handMounted, setHandMounted] = useState(hand);
  useEffect(() => {
    if (treatment === 'hand') {
      setHeld('hand');
      setHandMounted(true);
      return;
    }
    const t = setTimeout(() => setHeld('template'), HAND_OUT_MS);
    const gone = setTimeout(() => setHandMounted(false), HAND_GONE_MS);
    return () => {
      clearTimeout(t);
      clearTimeout(gone);
    };
  }, [treatment]);
  const heldHand = held === 'hand';

  // The pose from the row, or null once the card has been turned by hand.
  const [poseId, setPoseId] = useState<PoseId | null>('angle');
  const pose: ExportPose | null = useMemo(() => POSES.find((p) => p.id === poseId)?.pose ?? null, [poseId]);
  const onTurned = useCallback(() => setPoseId(null), []);
  useEffect(() => {
    if (open) setPoseId((p) => p ?? 'angle');
  }, [open]);
  // The card is in the frame's slot and still (the stage says so): what
  // must sit over the card in place (the hand) waits for it.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    onStage({
      open,
      exposure: exposureFor(palette),
      pose: !open ? HERO_POSE : heldHand ? HAND_POSE : pose,
      locked: heldHand,
      onTurned,
      onSettled: setSettled,
    });
  }, [open, palette, pose, heldHand, onTurned, onStage]);

  // The share made from this panel (or the one the page opened from).
  const [handle, setHandle] = useState<ShareHandle | null>(null);
  const [handleDesign, setHandleDesign] = useState<CardDesign | null>(null);
  const [progress, setProgress] = useState<ShareProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [video, setVideo] = useState<VideoState>({ status: 'idle' });
  // A save under way, and one just done: the tile says so.
  const [savingWhat, setSavingWhat] = useState<'image' | 'video' | null>(null);
  const [savedWhat, setSavedWhat] = useState<'image' | 'video' | null>(null);
  const setSaved = (what: 'image' | 'video') => {
    setSavingWhat((w) => (w === what ? null : w));
    setSavedWhat(what);
    play('issued');
    setTimeout(() => setSavedWhat((w) => (w === what ? null : w)), 1800);
  };
  useEffect(() => {
    if (!shared?.editToken) return;
    setHandle({ record: shared.record, editToken: shared.editToken, url: shareUrl(shared.record.slug) });
    setHandleDesign(shared.record.design);
  }, [shared]);
  const stale = !!handle && !!handleDesign && !sameDesign(handleDesign, design);

  // Ready before a picture is asked for: the template's assets, and the
  // exporter's first-render costs at the share's sizes, paid once the panel
  // has settled (the first Copy link used to stutter through them).
  useEffect(() => {
    if (!open) return;
    void warmTemplate();
    const t = setTimeout(() => {
      const ex = exporterRef.current;
      if (!ex?.ready) return;
      ex.warm([stillSize('post'), stillSize('square')]);
    }, 1200);
    return () => clearTimeout(t);
  }, [open, exporterRef]);

  // ── The panel's place on the stage ─────────────────────────────────────
  // Fit the frame to the stage: the panel's width, or what the height leaves
  // once the rows and tiles are under it.
  const rootRef = useRef<HTMLDivElement>(null);
  const [frameSide, setFrameSide] = useState(PANEL_W - 16);
  const [panelTop, setPanelTop] = useState(PANEL_GUTTER);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const w = Math.min(PANEL_W, el.clientWidth - PANEL_GUTTER * 2) - 16;
      const room = el.clientHeight - BUTTON_STRIP;
      const h = room - PANEL_GUTTER * 2 - CONTROLS_H - 16;
      const side = Math.max(160, Math.min(w, h));
      setFrameSide(side);
      // Where the grown panel sits centered in the room; it grows down to it.
      setPanelTop(Math.max(PANEL_GUTTER, (room - (side + 16 + CONTROLS_H)) / 2));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The panel opens at the frame's height and grows to hold the controls,
  // which come in as the room for them arrives: one height animation, the
  // rows and the tiles on their own delays inside it. The target is the
  // content's measured height (not `auto`, which Motion reads once at the
  // start and which the labels' fonts and the rows' ring then nudge by a
  // pixel or two, landing with a jump).
  const [grown, setGrown] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentH, setContentH] = useState<number | null>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // Layout height: the panel is mid-scale as it arrives, and a rect would be too.
    const measure = () => setContentH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);
  useEffect(() => {
    if (!open) {
      setGrown(false);
      return;
    }
    if (reduceMotion) {
      setGrown(true);
      return;
    }
    const t = setTimeout(() => setGrown(true), 180);
    return () => clearTimeout(t);
  }, [open, reduceMotion]);

  // ── The hand ───────────────────────────────────────────────────────────
  // The hand passes in front of the card, so it can't be in the frame (the
  // stage's canvas paints over the frame): it is drawn into a host above the
  // canvas, in a clip the size of the frame placed over it, and follows the
  // frame when the stage resizes. It waits for the card to be in place and
  // still (turned face on, glided into the hole), then arrives out of a
  // blur; it hides again whenever the card is moving.
  const frameRef = useRef<HTMLDivElement>(null);
  const [frontRect, setFrontRect] = useState<{ left: number; top: number; side: number } | null>(null);
  // Where the hand last was: it stays there, mounted, while it leaves.
  const lastRect = useRef<{ left: number; top: number; side: number } | null>(null);
  if (frontRect) lastRect.current = frontRect;
  useEffect(() => {
    if (!open || !handShown || !grown || !frontHost || !settled) {
      setFrontRect(null);
      return;
    }
    const place = () => {
      const f = frameRef.current;
      if (!f) return;
      const fr = f.getBoundingClientRect();
      const hr = frontHost.getBoundingClientRect();
      setFrontRect({ left: fr.left - hr.left, top: fr.top - hr.top, side: fr.width });
    };
    place();
    const ro = new ResizeObserver(place);
    if (rootRef.current) ro.observe(rootRef.current);
    if (frameRef.current) ro.observe(frameRef.current);
    return () => ro.disconnect();
  }, [open, handShown, grown, frontHost, settled, frameSide]);

  // ── Making the share ───────────────────────────────────────────────────
  const busy = progress !== null && progress.stage !== 'done';
  // The tile that asked for the link is the one that says it's being made.
  const [linkFor, setLinkFor] = useState<'link' | 'x' | null>(null);
  const videoRun = useRef<AbortController | null>(null);
  // Save video before the video exists: it is asked for, and saved the moment
  // it is done (making the share starts it; otherwise it is started there).
  const saveWhenDone = useRef(false);

  /** What a rendered video depends on: the surface and the design (the spin
   *  is a full turn, so not the pose). */
  const videoKey = useMemo(() => `${palette.bg}|${palette.ink}|${JSON.stringify(design)}`, [palette, design]);

  /**
   * Render the spin for the current surface and save it where it was asked
   * to go. The video is the visitor's own file; the link carries the still.
   */
  const makeVideo = useCallback(async () => {
    const ex = exporterRef.current;
    if (!ex) return;
    if (!canEncodeVideo()) {
      setVideo({ status: 'unavailable' });
      return;
    }
    videoRun.current?.abort();
    const ctl = new AbortController();
    videoRun.current = ctl;
    const key = videoKey;
    try {
      setVideo({ status: 'rendering', done: 0, total: 1 });
      const blob = await renderSpinVideo(ex, {
        palette,
        signal: ctl.signal,
        onProgress: (done, total) => setVideo({ status: 'rendering', done, total }),
      });
      if (ctl.signal.aborted) return;
      if (!blob) {
        setVideo({ status: 'unavailable' });
        return;
      }
      if (saveWhenDone.current) {
        saveWhenDone.current = false;
        download(blob, `${fileStem(design)}-spin.mp4`);
        setSaved('video');
      }
      setVideo({ status: 'done', blob, key });
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setVideo({ status: 'failed' });
    }
  }, [palette, exporterRef, design, videoKey]);

  // Cancel (the panel closing) stops a render in flight and forgets the ask.
  useEffect(() => {
    if (open) return;
    videoRun.current?.abort();
    saveWhenDone.current = false;
    setSavingWhat(null);
    setVideo((v) => (v.status === 'rendering' ? { status: 'idle' } : v));
  }, [open]);

  /** Make the share, or bring the existing one up to date. */
  const ensureShare = useCallback(async (): Promise<ShareHandle | null> => {
    const ex = exporterRef.current;
    if (!ex || !ex.ready) return null;
    if (handle && !stale) return handle;
    setError(null);
    try {
      const made = await createShare({
        exporter: ex,
        design,
        kind: handle?.record.kind ?? 'public',
        forName: handle?.record.forName ?? null,
        palette,
        pose: hand ? HAND_POSE : ex.livePose,
        treatment,
        hand: hand ? handId : undefined,
        onProgress: setProgress,
        existing: handle ? { id: handle.record.id, editToken: handle.editToken, url: handle.url } : undefined,
      });
      setHandle(made);
      setHandleDesign(design);
      return made;
    } catch (e) {
      const code = e instanceof ShareError ? e.code : 'failed';
      setError(
        code === 'http-401' || code === 'http-403'
          ? 'This link belongs to someone else. Make a new one.'
          : 'Something went wrong. Try again.',
      );
      setProgress(null);
      return null;
    }
  }, [design, exporterRef, handle, palette, stale, hand, handId, treatment]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      play('issued');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Could not copy. Select the link and copy it.');
    }
  };
  const onCopyLink = async () => {
    setLinkFor('link');
    try {
      const h = await ensureShare();
      if (h) await copy(h.url);
    } finally {
      setLinkFor(null);
    }
  };
  const onPostToX = async () => {
    setLinkFor('x');
    try {
      const h = await ensureShare();
      if (!h) return;
      window.open(
        xIntentUrl(`I designed the ${programNameOf(design)} card on @lightspark Grid`, h.url),
        '_blank',
        'noopener',
      );
    } finally {
      setLinkFor(null);
    }
  };
  const onDownloadImage = async () => {
    const ex = exporterRef.current;
    if (!ex?.ready) return;
    setSavingWhat('image');
    try {
      await warmTemplate();
      if (hand) await prepareHand(handId);
      const blob = await renderStill(ex, {
        format: 'square',
        palette,
        pose: hand ? HAND_POSE : ex.livePose,
        treatment,
        hand: hand ? handId : undefined,
        scale: SAVE_SCALE,
      });
      download(blob, `${fileStem(design)}.${blob.type.split('/')[1].replace('jpeg', 'jpg')}`);
      setSaved('image');
    } catch {
      setSavingWhat(null);
    }
  };
  const onDownloadVideo = async () => {
    if (video.status === 'done' && video.blob.size > 0 && video.key === videoKey) {
      download(video.blob, `${fileStem(design)}-spin.mp4`);
      setSaved('video');
      return;
    }
    // Rendered first; handed to the browser the moment it is done.
    saveWhenDone.current = true;
    if (video.status === 'rendering') return;
    await makeVideo();
  };

  // The tiles say what is happening; the panel speaks up only when it went wrong.
  const errorLine = error ?? (video.status === 'failed' ? 'The video failed. Try Save video again.' : null);

  const videoBusy = video.status === 'rendering';
  const tiles: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    /** Working: the glyph becomes a spinner and the label says so. */
    loading?: boolean;
    title?: string;
  }> = [
    {
      id: 'link',
      label: linkFor === 'link' && busy ? 'Making link…' : copied ? 'Copied' : stale ? 'Update link' : 'Copy link',
      icon: copied ? <IconCheckmark1 size={24} /> : <IconChainLink1 size={24} />,
      onClick: onCopyLink,
      disabled: busy,
      loading: linkFor === 'link' && busy,
    },
    {
      id: 'x',
      label: linkFor === 'x' && busy ? 'Sharing…' : 'Share on X',
      icon: <IconX size={22} />,
      onClick: onPostToX,
      disabled: busy,
      loading: linkFor === 'x' && busy,
    },
    {
      id: 'image',
      label: savingWhat === 'image' ? 'Saving…' : savedWhat === 'image' ? 'Saved' : 'Save image',
      icon: savedWhat === 'image' ? <IconCheckmark1 size={24} /> : <IconImages1 size={24} />,
      onClick: onDownloadImage,
      disabled: busy || savingWhat === 'image',
      loading: savingWhat === 'image',
    },
    {
      id: 'video',
      label: videoBusy
        ? 'Rendering…'
        : savingWhat === 'video'
          ? 'Saving…'
          : savedWhat === 'video'
            ? 'Saved'
            : 'Save video',
      icon: savedWhat === 'video' ? <IconCheckmark1 size={24} /> : <IconVideoClip size={24} />,
      onClick: onDownloadVideo,
      disabled: busy || videoBusy || savingWhat === 'video' || video.status === 'unavailable' || hand,
      loading: videoBusy || savingWhat === 'video',
      title: hand
        ? 'The spin video is the card alone; switch the style to Template'
        : video.status === 'unavailable'
          ? 'This browser has no video encoder'
          : undefined,
    },
  ];

  /** A control's arrival: risen into place once the panel has room, the
   *  later ones a beat after the first. */
  const rowMotion = (i: number) =>
    reduceMotion
      ? { animate: { opacity: grown ? 1 : 0 } }
      : {
          initial: false as const,
          animate: grown
            ? { opacity: 1, y: 0, transition: { ...ROW_IN, delay: 0.1 + i * 0.1 } }
            : { opacity: 0, y: -14, transition: { duration: 0 } },
        };

  return (
    <div ref={rootRef} className={styles.root} aria-hidden={!open}>
      {frontHost &&
        createPortal(
          <div
            className={styles.handClip}
            style={(() => {
              // The clip keeps its place while the hand leaves.
              const rect = frontRect ?? lastRect.current;
              return rect ? { left: rect.left, top: rect.top, width: rect.side, height: rect.side } : undefined;
            })()}
            aria-hidden
          >
            <div className={clsx(styles.handMotion, frontRect && handShown && styles.handMotionOn)}>
              {(() => {
                // Mounted from the moment the hand is picked (so it is
                // decoded before it shows) until it has left.
                const rect = frontRect ?? lastRect.current;
                if (!rect || !handMounted || !shownHand) return null;
                const l = handLayerIn(rect.side, rect.side, shownHand);
                const at = { left: l.x, top: l.y, width: l.size, height: l.size };
                const h = handById(shownHand);
                return (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={h?.url} alt="" className={styles.handLayer} style={at} />
                    {/* The rim's shading, at the surface's darkness (see handToneFor). */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={h?.rimUrl}
                      alt=""
                      className={clsx(styles.handLayer, styles.handRim)}
                      style={{ ...at, opacity: handToneFor(palette) }}
                    />
                  </>
                );
              })()}
            </div>
          </div>,
          frontHost,
        )}
      <AnimatePresence>
        {open && (
          <m.div
            className={styles.panel}
            style={{ top: panelTop }}
            // Foreground to the stage: a press here is not a press on the backdrop.
            data-stage-foreground
            // As the phone comes in (AppShell's boot): up from below, out of
            // a blur, growing to size. Centered by CSS `translate` (the
            // stylesheet), which composes with the transform Motion animates
            // and, unlike an x here, is not a transform Motion would undo when
            // it measures layout children (the color picker's field, portaled
            // out of the panel but still under it in React, slid by half the
            // panel's width on every change while it was).
            initial={reduceMotion ? { opacity: 0 } : PANEL_AWAY}
            animate={
              reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: PANEL_IN }
            }
            exit={reduceMotion ? { opacity: 0 } : { ...PANEL_AWAY, transition: PANEL_OUT }}
          >
            {/* Grows from the frame alone to the frame with its controls. */}
            <m.div
              className={styles.grow}
              initial={false}
              animate={{ height: grown ? (contentH ?? frameSide + CONTROLS_H) : frameSide }}
              transition={reduceMotion ? { duration: 0 } : GROW}
            >
              <div ref={contentRef} className={styles.growInner}>
                <ShareFrame
                  ref={frameRef}
                  side={frameSide}
                  palette={palette}
                  orientation={design.orientation}
                  hand={heldHand ? shownHand : null}
                />

                <m.div className={picker.groups} {...rowMotion(0)}>
                  <div className={clsx(picker.group, styles.rows)}>
                    <div className={picker.row}>
                      <span className={picker.rowLabel}>Style</span>
                      <SwatchRow label="Style" active={treatment}>
                        {(
                          [
                            { id: 'template', label: 'Template', Icon: IconLayoutWindow, why: null },
                            {
                              id: 'hand',
                              label: 'Hand',
                              Icon: IconHand5Finger,
                              why: handOk ? null : 'The hand holds a landscape card',
                            },
                          ] as Array<{ id: Treatment; label: string; Icon: typeof IconHand5Finger; why: string | null }>
                        ).map((t) => (
                          <Tooltip key={t.id} text={t.why ?? t.label}>
                            {(tip) => (
                              <button
                                type="button"
                                role="radio"
                                aria-checked={treatment === t.id}
                                aria-label={t.label}
                                disabled={!!t.why}
                                className={clsx(picker.swatch, styles.iconSwatch)}
                                {...tip}
                                {...pressable(
                                  { onClick: () => setTreatmentPick(t.id), disabled: !!t.why },
                                  { press: 'tickBright' },
                                )}
                              >
                                <t.Icon size={13} aria-hidden />
                              </button>
                            )}
                          </Tooltip>
                        ))}
                      </SwatchRow>
                    </div>
                    <div className={picker.row}>
                      <span className={picker.rowLabel}>Backdrop</span>
                      <SwatchRow label="Backdrop" active={backdrop}>
                        {BACKDROPS.map((b) => {
                          const p = paletteFor(b.id, surfaces);
                          return (
                            <Tooltip key={b.id} text={b.label}>
                              {(tip) => (
                                <button
                                  type="button"
                                  role="radio"
                                  aria-checked={backdrop === b.id}
                                  aria-label={b.label}
                                  className={clsx(picker.swatch, styles.swatch)}
                                  style={{ background: p.bg, color: p.ink }}
                                  {...tip}
                                  {...pressable({ onClick: () => setBackdropPick(b.id) }, { press: 'tickBright' })}
                                />
                              )}
                            </Tooltip>
                          );
                        })}
                        <ColorPicker
                          value={customBg ?? paletteOn(surfaces.brand).bg}
                          gradient={null}
                          orientation={design.orientation}
                          solidOnly
                          onChange={(color) => {
                            setCustomBg(color);
                            setBackdropPick('custom');
                          }}
                          triggerClassName={clsx(picker.swatch, picker.swatchCustom)}
                          triggerActive={backdrop === 'custom'}
                          triggerLabel="Custom color"
                          tooltip="Custom color"
                        >
                          {backdrop !== 'custom' ? <IconPlusSmall size={16} aria-hidden /> : null}
                        </ColorPicker>
                      </SwatchRow>
                    </div>
                    {/* The third row is Pose, or Skin with the hand: one fades in
                        over the other on its way out (lifted out of the flow, so
                        the row holds its place and height). */}
                    <AnimatePresence mode="popLayout" initial={false}>
                      {hand && hands ? (
                      <m.div
                        key="skin"
                        className={picker.row}
                        {...ROW_SWAP}
                      >
                        <span className={picker.rowLabel}>Skin</span>
                        <SwatchRow label="Skin" active={handId}>
                          {hands.map((h, i) => (
                            <Tooltip key={h.id} text={`Hand ${i + 1}`}>
                              {(tip) => (
                                <button
                                  type="button"
                                  role="radio"
                                  aria-checked={handId === h.id}
                                  aria-label={`Hand ${i + 1}`}
                                  className={clsx(picker.swatch, styles.swatch)}
                                  style={{ background: h.swatch }}
                                  {...tip}
                                  {...pressable({ onClick: () => setHandId(h.id) }, { press: 'tickBright' })}
                                />
                              )}
                            </Tooltip>
                          ))}
                        </SwatchRow>
                      </m.div>
                      ) : (
                      <m.div
                        key="pose"
                        className={picker.row}
                        {...ROW_SWAP}
                      >
                        <span className={picker.rowLabel}>Pose</span>
                        <SwatchRow label="Pose" active={poseId}>
                          {POSES.map((p) => (
                            <Tooltip key={p.id} text={p.label}>
                              {(tip) => (
                                <button
                                  type="button"
                                  role="radio"
                                  aria-checked={poseId === p.id}
                                  aria-label={p.label}
                                  className={clsx(picker.swatch, styles.poseSwatch, styles[`pose_${p.id}`])}
                                  {...tip}
                                  {...pressable({ onClick: () => setPoseId(p.id) }, { press: 'tickBright' })}
                                >
                                  <span className={styles.poseCard} aria-hidden />
                                </button>
                              )}
                            </Tooltip>
                          ))}
                        </SwatchRow>
                      </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                </m.div>

                <m.div className={styles.tiles} {...rowMotion(1)}>
                  {tiles.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={clsx(styles.tile, t.loading && styles.tileLoading)}
                      disabled={t.disabled}
                      title={t.title}
                      {...pressable({ onClick: t.onClick, disabled: t.disabled })}
                    >
                      <span className={styles.tileIcon}>
                        <AnimatePresence mode="popLayout" initial={false}>
                          <m.span
                            key={t.loading ? 'spinner' : t.label}
                            className={styles.tileGlyph}
                            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5, filter: 'blur(4px)' }}
                            animate={
                              reduceMotion
                                ? { opacity: 1 }
                                : { opacity: 1, scale: 1, filter: 'blur(0px)', transition: GLYPH_IN }
                            }
                            exit={
                              reduceMotion
                                ? { opacity: 0 }
                                : { opacity: 0, scale: 0.5, filter: 'blur(4px)', transition: GLYPH_OUT }
                            }
                          >
                            {t.loading ? <Spinner /> : t.icon}
                          </m.span>
                        </AnimatePresence>
                      </span>
                      <TextMorph
                        as="span"
                        className={styles.tileLabel}
                        duration={LABEL_MORPH_MS}
                        ease={cubicBezierCss(easeOutSwift)}
                      >
                        {t.label}
                      </TextMorph>
                    </button>
                  ))}
                </m.div>

                {errorLine && (
                  <div className={styles.status} role="alert">
                    <span className={clsx(styles.statusLine, styles.statusError)}>{errorLine}</span>
                  </div>
                )}
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A ring turning: the tile's glyph while it works, in the icon set's stroke. */
function Spinner() {
  return (
    <svg className={styles.spinner} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The share template in DOM (the same layout `paintTemplate` draws): the
 * surface, the two rules, the logomark, the type, and in the middle the
 * empty slot the stage parks the card in. `side` px for the 800-unit square.
 */
const ShareFrame = forwardRef<
  HTMLDivElement,
  {
    side: number;
    palette: Palette;
    orientation: CardDesign['orientation'];
    /** The hand over the template (the id of the one shown): the slot
     *  moves to where its card was. The hand itself draws above the canvas. */
    hand: string | null;
  }
>(function ShareFrame({ side, palette, orientation, hand }, ref) {
  const k = side / LAYOUT;
  const foot = footprint(orientation);
  const long = CARD_IN_LAYOUT * side;
  const cardSlot =
    orientation === 'portrait'
      ? { width: (long * foot.w) / foot.h, height: long }
      : { width: long, height: (long * foot.h) / foot.w };
  const text = { fontSize: TEXT * k, lineHeight: 1 } as const;
  // The hole, grown by the export's overlap about its center: the card's
  // anti-aliased edge runs under the skin that touches it here too.
  const h0 = hand ? handHoleIn(side, side, hand) : null;
  const hole = h0
    ? {
        x: h0.x - (h0.w * (HAND_OVERLAP - 1)) / 2,
        y: h0.y - (h0.h * (HAND_OVERLAP - 1)) / 2,
        w: h0.w * HAND_OVERLAP,
        h: h0.h * HAND_OVERLAP,
      }
    : null;
  return (
    <div
      ref={ref}
      className={styles.frame}
      style={{ width: side, height: side, background: palette.bg, color: palette.ink }}
    >
      <span className={styles.rule} style={{ left: PAD * k, top: PAD * k, bottom: PAD * k }} aria-hidden />
      <span className={styles.rule} style={{ right: PAD * k, top: PAD * k, bottom: PAD * k }} aria-hidden />
      <svg
        className={styles.logo}
        style={{ left: (PAD + COL_PAD) * k, top: PAD * k, width: 25.446 * k, height: 16 * k }}
        viewBox="0 0 25.446 16"
        fill="none"
        aria-hidden
      >
        <path
          d="M0.992312 14.2786L8.93104 9.12311H-9.17912e-05L3.45887 6.87684H11.3973V1.72152L14.0481 7.80949e-05V5.80004L20.3285 1.7215L24.4528 1.7215L16.5143 6.87684H25.4459L21.9869 9.12311H14.0481V14.2786L11.3973 16V10.1998L5.1166 14.2786H0.992312Z"
          fill="currentColor"
        />
      </svg>
      <span className={styles.text} style={{ ...text, left: (PAD + COL_PAD) * k, bottom: PAD * k }}>
        {TEMPLATE_TUPLE}
      </span>
      <span
        className={clsx(styles.text, styles.textRight)}
        style={{ ...text, right: (PAD + COL_PAD) * k, top: PAD * k }}
      >
        Lightspark
        <br />
        Cards Playground
      </span>
      <span
        className={clsx(styles.text, styles.textRight)}
        style={{ ...text, right: (PAD + COL_PAD) * k, bottom: PAD * k }}
      >
        docs.lightspark.com
      </span>
      {hole ? (
        <span
          className={styles.slotHand}
          style={{ left: hole.x, top: hole.y, width: hole.w, height: hole.h }}
          data-share-card-slot
          aria-hidden
        />
      ) : (
        <span className={styles.slot} style={cardSlot} data-share-card-slot aria-hidden />
      )}
    </div>
  );
});
