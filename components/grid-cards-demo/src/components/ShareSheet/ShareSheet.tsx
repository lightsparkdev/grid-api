'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconChainLink1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChainLink1';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconImages1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconImages1';
import { IconVideo } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconVideo';
import { IconX } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconX';
import { Button } from '@lightsparkdev/origin/button';
import { Dialog } from '@lightsparkdev/origin/dialog';
import type { CardExporter } from '@/components/CardStage/export/exportRenderer';
import {
  BACKDROPS,
  brandSurfaceFor,
  paletteFor,
  warmTemplate,
  type BackdropId,
  type Palette,
} from '@/components/CardStage/export/compose';
import { canEncodeVideo, renderSpinVideo } from '@/components/CardStage/export/exportVideo';
import { renderStill, renderStillCanvas } from '@/components/CardStage/export/stills';
import { SwatchRow } from '@/components/DesignPicker/DesignPicker';
import picker from '@/components/DesignPicker/DesignPicker.module.scss';
import { Tooltip } from '@/components/Tooltip/Tooltip';
import { programNameOf } from '@/apps/shared/brand/BrandContext';
import { brandColorOf, sameDesign, type CardDesign } from '@/data/design';
import type { SharedCard } from '@/hooks/useCardsDemoLogic';
import { useThemeMode } from '@/hooks/useThemeMode';
import { attachVideo, createShare, ShareError, type ShareHandle, type ShareProgress } from '@/lib/share/client';
import { shareOrigin, shareUrl, xIntentUrl } from '@/lib/share/urls';
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

/** The preview renders at this fraction of the square's size. */
const PREVIEW_SCALE = 0.4;

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
 * dark template or one in the card's own color; the link; the X composer;
 * the downloads. The spin video renders in the background once the link is
 * made and attaches to it.
 */
export function ShareSheet({ open, onClose, exporterRef, design, shared }: ShareSheetProps) {
  const theme = useThemeMode();
  const cardColor = brandColorOf(design);

  // The backdrop follows the theme until the visitor picks one.
  const [backdropPick, setBackdropPick] = useState<BackdropId | null>(null);
  const backdrop: BackdropId = backdropPick ?? (theme === 'dark' ? 'dark' : 'light');
  // The Brand surface comes from the card's color or its art (loaded async).
  const [brandBg, setBrandBg] = useState(cardColor);
  useEffect(() => {
    let alive = true;
    brandSurfaceFor(design, cardColor).then((c) => alive && setBrandBg(c));
    return () => {
      alive = false;
    };
  }, [design, cardColor]);
  const palette: Palette = useMemo(() => paletteFor(backdrop, brandBg), [backdrop, brandBg]);

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
      const src = renderStillCanvas(ex, { format: 'square', palette, cardColor, scale: PREVIEW_SCALE });
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
  }, [open, palette, cardColor, design, exporterRef]);

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
  }, [cardColor, design, exporterRef, handle, makeVideo, palette, stale]);

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
    const blob = await renderStill(ex, { format: 'square', palette, cardColor });
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

  const origin = shareOrigin().replace(/^https?:\/\//, '');
  const linkText = handle ? handle.url.replace(/^https?:\/\//, '') : `${origin}/…`;
  const videoBusy = video.status === 'rendering' || video.status === 'uploading';

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
          <div className={clsx(styles.preview, !previewReady && styles.previewPending)}>
            <canvas ref={previewRef} className={styles.previewCanvas} aria-label="The picture the link shows" />
          </div>

          <div className={picker.groups}>
            <div className={picker.group}>
              <div className={picker.row}>
                <span className={picker.rowLabel}>Backdrop</span>
                <SwatchRow label="Backdrop" active={backdrop}>
                  {BACKDROPS.map((b) => {
                    const p = paletteFor(b.id, brandBg);
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
                </SwatchRow>
              </div>
              <div className={picker.row}>
                <span className={picker.rowLabel}>Link</span>
                <span className={clsx(styles.link, !handle && styles.linkPending)} title={handle?.url}>
                  {linkText}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              variant="filled"
              size="compact"
              disabled={busy}
              leadingIcon={copied ? <IconCheckmark1 size={14} /> : <IconChainLink1 size={14} />}
              {...pressable({ onClick: onCopyLink, disabled: busy })}
            >
              {copied ? 'Copied' : stale ? 'Update link' : 'Copy link'}
            </Button>
            <Button
              variant="secondary"
              size="compact"
              disabled={busy}
              leadingIcon={<IconX size={13} />}
              {...pressable({ onClick: onPostToX, disabled: busy })}
            >
              Post to X
            </Button>
            <Button
              variant="secondary"
              size="compact"
              disabled={busy}
              leadingIcon={<IconImages1 size={14} />}
              {...pressable({ onClick: onDownloadImage, disabled: busy })}
            >
              Download image
            </Button>
            <Button
              variant="secondary"
              size="compact"
              disabled={busy || videoBusy || video.status === 'unavailable'}
              title={video.status === 'unavailable' ? 'This browser has no video encoder' : undefined}
              leadingIcon={<IconVideo size={14} />}
              {...pressable({ onClick: onDownloadVideo, disabled: busy || videoBusy })}
            >
              Download video
            </Button>
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
