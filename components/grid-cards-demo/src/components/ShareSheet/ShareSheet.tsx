'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { IconChainLink1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChainLink1';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconImages1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconImages1';
import { IconPlusSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusSmall';
import { IconVideo } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconVideo';
import { IconX } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconX';
import { Dialog } from '@lightsparkdev/origin/dialog';
import type { CardExporter, ExportPose } from '@/components/CardStage/export/exportRenderer';
import {
  BACKDROPS,
  brandSurfaceFor,
  paletteFor,
  paletteOn,
  warmTemplate,
  type BackdropId,
  type Palette,
  type Surfaces,
} from '@/components/CardStage/export/compose';
import { canEncodeVideo, renderSpinVideo } from '@/components/CardStage/export/exportVideo';
import { HERO_POSE, POSES, poseIdOf, renderStill, renderStillCanvas } from '@/components/CardStage/export/stills';
import { ColorPicker } from '@/components/DesignPicker/ColorPicker';
import { SwatchRow } from '@/components/DesignPicker/DesignPicker';
import picker from '@/components/DesignPicker/DesignPicker.module.scss';
import { Tooltip } from '@/components/Tooltip/Tooltip';
import { programNameOf } from '@/apps/shared/brand/BrandContext';
import { brandColorOf, sameDesign, type CardDesign } from '@/data/design';
import type { SharedCard } from '@/hooks/useCardsDemoLogic';
import { useThemeMode } from '@/hooks/useThemeMode';
import { attachVideo, createShare, ShareError, type ShareHandle, type ShareProgress } from '@/lib/share/client';
import { shareUrl, xIntentUrl } from '@/lib/share/urls';
import { play, pressable } from '@/lib/sounds';
import styles from './ShareSheet.module.scss';

interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  exporterRef: React.MutableRefObject<CardExporter | null>;
  design: CardDesign;
  /** The share the playground was opened from, if any. */
  shared: SharedCard | null;
}

/** The preview renders at this fraction of the square's size; less while
 *  the card is being turned by hand, so it keeps up with the pointer. */
const PREVIEW_SCALE = 0.4;
const PREVIEW_SCALE_DRAGGING = 0.24;
/** Degrees of turn per pixel of drag on the preview (the stage's rate). */
const DRAG_DEG_PER_PX = 0.55;

type VideoState =
  | { status: 'idle' }
  | { status: 'rendering'; done: number; total: number }
  | { status: 'uploading' }
  | { status: 'done'; url: string; blob: Blob }
  | { status: 'unavailable' }
  | { status: 'failed' };

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
 * Share the card: the square picture the link will show, on the light or
 * dark template, one in the card's own color, or a color of the visitor's
 * own; the card in a pose from the row, or turned by hand on the preview;
 * the link; the X composer; the downloads. The spin video renders in the
 * background once the link is made and attaches to it.
 */
export function ShareSheet({ open, onClose, exporterRef, design, shared }: ShareSheetProps) {
  const theme = useThemeMode();
  const cardColor = brandColorOf(design);

  // The backdrop follows the theme until the visitor picks one.
  const [backdropPick, setBackdropPick] = useState<BackdropId | null>(null);
  const backdrop: BackdropId = backdropPick ?? (theme === 'dark' ? 'dark' : 'light');
  // The Brand surface comes from the card's color or its art (loaded async);
  // the custom one is the visitor's, kept once picked.
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

  // How the card is held: a pose from the row, or wherever a drag left it.
  const [pose, setPose] = useState<ExportPose>(HERO_POSE);
  const poseId = poseIdOf(pose);

  // The share made from this sheet (or the one the page opened from).
  const [handle, setHandle] = useState<ShareHandle | null>(null);
  const [handleDesign, setHandleDesign] = useState<CardDesign | null>(null);
  const [progress, setProgress] = useState<ShareProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [video, setVideo] = useState<VideoState>({ status: 'idle' });

  // Opened from a share this visitor may edit: updates go to it.
  useEffect(() => {
    if (!shared?.editToken) return;
    setHandle({ record: shared.record, editToken: shared.editToken, url: shareUrl(shared.record.slug) });
    setHandleDesign(shared.record.design);
    if (shared.record.assets.video) setVideo({ status: 'done', url: shared.record.assets.video, blob: new Blob() });
  }, [shared]);

  // The design has moved on since the link was made: the link needs updating.
  const stale = !!handle && !!handleDesign && !sameDesign(handleDesign, design);

  // ── Preview ────────────────────────────────────────────────────────────
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    let tries = 0;
    let alive = true;
    const draw = () => {
      if (!alive) return;
      const ex = exporterRef.current;
      const canvas = previewRef.current;
      if (!ex || !canvas) return;
      if (!ex.ready) {
        if (tries++ < 120) raf = requestAnimationFrame(draw);
        return;
      }
      const src = renderStillCanvas(ex, {
        format: 'square',
        palette,
        cardColor,
        pose,
        scale: dragging ? PREVIEW_SCALE_DRAGGING : PREVIEW_SCALE,
      });
      canvas.width = src.width;
      canvas.height = src.height;
      canvas.getContext('2d')!.drawImage(src, 0, 0);
      setPreviewReady(true);
    };
    warmTemplate().then(() => {
      raf = requestAnimationFrame(draw);
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [open, palette, cardColor, pose, dragging, design, exporterRef]);

  // Drag on the preview turns the card: sideways spins it, up and down
  // pitches it, at the stage's rate. Letting go leaves it where it is.
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const onPreviewDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    setDragging(true);
  };
  const onPreviewMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    setPose((p) => ({ rotX: p.rotX + dy * DRAG_DEG_PER_PX, rotY: p.rotY + dx * DRAG_DEG_PER_PX }));
  };
  const onPreviewUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
  };

  // ── Making the share ───────────────────────────────────────────────────
  const busy = progress !== null && progress.stage !== 'done';
  const videoRun = useRef<AbortController | null>(null);

  const makeVideo = useCallback(
    async (h: ShareHandle) => {
      const ex = exporterRef.current;
      if (!ex) return;
      if (!canEncodeVideo()) {
        setVideo({ status: 'unavailable' });
        return;
      }
      videoRun.current?.abort();
      const ctl = new AbortController();
      videoRun.current = ctl;
      try {
        setVideo({ status: 'rendering', done: 0, total: 1 });
        const blob = await renderSpinVideo(ex, {
          palette,
          cardColor,
          signal: ctl.signal,
          onProgress: (done, total) => setVideo({ status: 'rendering', done, total }),
        });
        if (ctl.signal.aborted) return;
        if (!blob) {
          setVideo({ status: 'unavailable' });
          return;
        }
        setVideo({ status: 'uploading' });
        const record = await attachVideo(h, blob);
        if (ctl.signal.aborted) return;
        setVideo({ status: 'done', url: record.assets.video ?? '', blob });
        setHandle((cur) => (cur && cur.record.id === record.id ? { ...cur, record } : cur));
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setVideo({ status: 'failed' });
      }
    },
    [palette, cardColor, exporterRef],
  );

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
        cardColor,
        pose,
        onProgress: setProgress,
        existing: handle ? { id: handle.record.id, editToken: handle.editToken, url: handle.url } : undefined,
      });
      setHandle(made);
      setHandleDesign(design);
      void makeVideo(made);
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
  }, [cardColor, design, exporterRef, handle, makeVideo, palette, pose, stale]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      play('success');
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
    await warmTemplate();
    const blob = await renderStill(ex, { format: 'square', palette, cardColor, pose });
    download(blob, `${fileStem(design)}.${blob.type.split('/')[1].replace('jpeg', 'jpg')}`);
  };
  const onDownloadVideo = async () => {
    if (video.status === 'done' && video.blob.size > 0) {
      download(video.blob, `${fileStem(design)}-spin.mp4`);
      return;
    }
    const h = await ensureShare();
    if (!h) return;
    if (video.status !== 'rendering' && video.status !== 'uploading') await makeVideo(h);
  };

  // What the sheet says while something is happening; nothing at rest.
  const status = useMemo<{ text: string; progress?: number; error?: boolean } | null>(() => {
    if (error) return { text: error, error: true };
    if (progress && progress.stage !== 'done') {
      return {
        text:
          progress.stage === 'record' ? 'Making the link…' : progress.stage === 'render' ? 'Rendering…' : 'Uploading…',
      };
    }
    switch (video.status) {
      case 'rendering':
        return {
          text: `Rendering video · ${Math.round((video.done / video.total) * 100)}%`,
          progress: video.done / video.total,
        };
      case 'uploading':
        return { text: 'Uploading video…' };
      case 'failed':
        return { text: 'The video failed. Try Download video again.', error: true };
      case 'idle':
      case 'done':
      case 'unavailable':
        return null;
      default: {
        const never: never = video;
        return never;
      }
    }
  }, [error, progress, video]);

  const videoBusy = video.status === 'rendering' || video.status === 'uploading';

  const tiles: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    title?: string;
  }> = [
    {
      id: 'link',
      label: copied ? 'Copied' : stale ? 'Update link' : 'Copy link',
      icon: copied ? <IconCheckmark1 size={24} /> : <IconChainLink1 size={24} />,
      onClick: onCopyLink,
      disabled: busy,
    },
    { id: 'x', label: 'Post to X', icon: <IconX size={22} />, onClick: onPostToX, disabled: busy },
    { id: 'image', label: 'Download image', icon: <IconImages1 size={24} />, onClick: onDownloadImage, disabled: busy },
    {
      id: 'video',
      label: 'Download video',
      icon: <IconVideo size={24} />,
      onClick: onDownloadVideo,
      disabled: busy || videoBusy || video.status === 'unavailable',
      title: video.status === 'unavailable' ? 'This browser has no video encoder' : undefined,
    },
  ];

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup} aria-label="Share your card">
          <div
            className={clsx(styles.preview, !previewReady && styles.previewPending, dragging && styles.previewDragging)}
          >
            <canvas
              ref={previewRef}
              className={styles.previewCanvas}
              aria-label="The picture the link shows. Drag to turn the card."
              onPointerDown={onPreviewDown}
              onPointerMove={onPreviewMove}
              onPointerUp={onPreviewUp}
              onPointerCancel={onPreviewUp}
            />
          </div>

          <div className={picker.groups}>
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
                          {...pressable({ onClick: () => setPose(p.pose) }, { press: 'tickBright' })}
                        >
                          <span className={styles.poseCard} aria-hidden />
                        </button>
                      )}
                    </Tooltip>
                  ))}
                </SwatchRow>
              </div>
            </div>
          </div>

          <div className={styles.tiles}>
            {tiles.map((t) => (
              <button
                key={t.id}
                type="button"
                className={styles.tile}
                disabled={t.disabled}
                title={t.title}
                {...pressable({ onClick: t.onClick, disabled: t.disabled })}
              >
                <span className={styles.tileIcon}>{t.icon}</span>
                <span className={styles.tileLabel}>{t.label}</span>
              </button>
            ))}
          </div>

          {status && (
            <div className={styles.status} role="status">
              <span className={clsx(styles.statusLine, status.error && styles.statusError)}>{status.text}</span>
              {status.progress !== undefined && (
                <span className={styles.bar} aria-hidden>
                  <span className={styles.barFill} style={{ width: `${status.progress * 100}%` }} />
                </span>
              )}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
