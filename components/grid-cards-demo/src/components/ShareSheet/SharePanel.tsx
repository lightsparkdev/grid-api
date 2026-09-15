'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion as m, useReducedMotion } from 'motion/react';
import { TextMorph } from 'torph/react';
import { IconChainLink1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChainLink1';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
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
  paletteFor,
  paletteOn,
  TEMPLATE_TUPLE,
  warmTemplate,
  type BackdropId,
  type Palette,
  type Surfaces,
} from '@/components/CardStage/export/compose';
import { canEncodeVideo, renderSpinVideo } from '@/components/CardStage/export/exportVideo';
import {
  CARD_IN_LAYOUT,
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
}

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
/** The phone's own entrance (AppShell: 128 px up, 0.9 to 1, a 48 px blur
 *  clearing, 0.7 s in and 0.45 s out on an ease-out quart), for the panel. */
const easeOutQuart = [0.165, 0.84, 0.44, 1] as const;
const PANEL_IN = motionTransition(easeOutQuart, 0.7);
const PANEL_OUT = motionTransition(easeOutQuart, 0.45);
const PANEL_AWAY = { opacity: 0, scale: 0.9, y: 128, filter: 'blur(48px)' };
/** The panel's growth, and the controls' rise inside it: a gentler curve
 *  than the snappy one (which front-loads so hard the growth reads as a
 *  jump), on the same clock so they land together. */
const easeOutGentle = [0.32, 0.72, 0, 1] as const;
const GROW = motionTransition(easeOutGentle, 0.7);
const ROW_IN = motionTransition(easeOutGentle, 0.6);

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
export function SharePanel({ open, exporterRef, design, shared, onStage }: SharePanelProps) {
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

  // The pose from the row, or null once the card has been turned by hand.
  const [poseId, setPoseId] = useState<PoseId | null>('angle');
  const pose: ExportPose | null = useMemo(() => POSES.find((p) => p.id === poseId)?.pose ?? null, [poseId]);
  const onTurned = useCallback(() => setPoseId(null), []);
  useEffect(() => {
    if (open) setPoseId((p) => p ?? 'angle');
  }, [open]);
  useEffect(() => {
    onStage({ open, exposure: exposureFor(palette), pose: open ? pose : HERO_POSE, onTurned });
  }, [open, palette, pose, onTurned, onStage]);

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

  // ── Making the share ───────────────────────────────────────────────────
  const busy = progress !== null && progress.stage !== 'done';
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
        pose: ex.livePose,
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
  }, [design, exporterRef, handle, palette, stale]);

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
    const h = await ensureShare();
    if (h) await copy(h.url);
  };
  const onPostToX = async () => {
    const h = await ensureShare();
    if (!h) return;
    window.open(
      xIntentUrl(`I designed the ${programNameOf(design)} card on @lightspark Grid`, h.url),
      '_blank',
      'noopener',
    );
  };
  const onDownloadImage = async () => {
    const ex = exporterRef.current;
    if (!ex?.ready) return;
    setSavingWhat('image');
    try {
      await warmTemplate();
      const blob = await renderStill(ex, { format: 'square', palette, pose: ex.livePose, scale: SAVE_SCALE });
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
      label: busy ? 'Making link…' : copied ? 'Copied' : stale ? 'Update link' : 'Copy link',
      icon: copied ? <IconCheckmark1 size={24} /> : <IconChainLink1 size={24} />,
      onClick: onCopyLink,
      disabled: busy,
      loading: busy,
    },
    { id: 'x', label: 'Share on X', icon: <IconX size={22} />, onClick: onPostToX, disabled: busy },
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
      disabled: busy || videoBusy || savingWhat === 'video' || video.status === 'unavailable',
      loading: videoBusy || savingWhat === 'video',
      title: video.status === 'unavailable' ? 'This browser has no video encoder' : undefined,
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
      <AnimatePresence>
        {open && (
          <m.div
            className={styles.panel}
            style={{ top: panelTop }}
            // As the phone comes in (AppShell's boot): up from below, out of
            // a blur, growing to size. Centered by Motion's own x (a CSS
            // transform would be overwritten by the ones it animates).
            initial={reduceMotion ? { opacity: 0, x: '-50%' } : { ...PANEL_AWAY, x: '-50%' }}
            animate={
              reduceMotion
                ? { opacity: 1, x: '-50%' }
                : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', x: '-50%', transition: PANEL_IN }
            }
            exit={reduceMotion ? { opacity: 0, x: '-50%' } : { ...PANEL_AWAY, x: '-50%', transition: PANEL_OUT }}
          >
            {/* Grows from the frame alone to the frame with its controls. */}
            <m.div
              className={styles.grow}
              initial={false}
              animate={{ height: grown ? (contentH ?? frameSide + CONTROLS_H) : frameSide }}
              transition={reduceMotion ? { duration: 0 } : GROW}
            >
              <div ref={contentRef} className={styles.growInner}>
                <ShareFrame side={frameSide} palette={palette} orientation={design.orientation} />

                <m.div className={picker.groups} {...rowMotion(0)}>
                  <div className={picker.group}>
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
                    <div className={picker.row}>
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
                    </div>
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
function ShareFrame({
  side,
  palette,
  orientation,
}: {
  side: number;
  palette: Palette;
  orientation: CardDesign['orientation'];
}) {
  const k = side / LAYOUT;
  const foot = footprint(orientation);
  const long = CARD_IN_LAYOUT * side;
  const slot =
    orientation === 'portrait'
      ? { width: (long * foot.w) / foot.h, height: long }
      : { width: long, height: (long * foot.h) / foot.w };
  const text = { fontSize: TEXT * k, lineHeight: 1 } as const;
  return (
    <div className={styles.frame} style={{ width: side, height: side, background: palette.bg, color: palette.ink }}>
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
      <span className={styles.slot} style={slot} data-share-card-slot aria-hidden />
    </div>
  );
}
