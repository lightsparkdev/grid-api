'use client';

import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion as m, useReducedMotion } from 'motion/react';
import { IconArrowDownWall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowDownWall';
import { IconChainLink1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChainLink1';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconEyeOpen } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEyeOpen';
import { IconShareOs } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconShareOs';
import { IconX } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconX';
import { FrostPanel } from '@/components/liquid-glass';
import type { CardExporter } from '@/components/CardStage/export/exportRenderer';
import { BACKDROPS, type BackdropId } from '@/components/CardStage/export/compose';
import { canEncodeVideo, renderSpinVideo } from '@/components/CardStage/export/exportVideo';
import {
  renderStill,
  renderStillCanvas,
  STILLS,
  stillSize,
  type StillFormat,
} from '@/components/CardStage/export/stills';
import { programNameOf } from '@/apps/shared/brand/BrandContext';
import { brandColorOf, luminance, sameDesign, type CardDesign } from '@/data/design';
import type { SharedCard } from '@/hooks/useCardsDemoLogic';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import {
  attachVideo,
  checkSlug,
  createShare,
  fetchViews,
  ShareError,
  teamUnlocked,
  type ShareHandle,
  type ShareProgress,
} from '@/lib/share/client';
import { normalizeSlug } from '@/lib/share/types';
import { shareEditUrl, shareOrigin, shareUrl, xIntentUrl } from '@/lib/share/urls';
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

/** The preview renders at this fraction of the format's size. */
const PREVIEW_SCALE = 0.3;
const FORMATS: StillFormat[] = ['post', 'square', 'card'];

type VideoState =
  | { status: 'idle' }
  | { status: 'rendering'; done: number; total: number }
  | { status: 'uploading' }
  | { status: 'done'; url: string; blob: Blob }
  | { status: 'unavailable' }
  | { status: 'failed' };

const SHEET_IN = motionTransition(easeOutSnappy, 0.42);
const SHEET_OUT = motionTransition(easeOutQuick, 0.2);

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
 * Share the card: a picture of it on a backdrop, a link whose preview is that
 * picture (and, where the browser can encode, the spin video), the X
 * composer, downloads. Team members can make it for a customer, under a
 * name, with an edit link and a view count.
 */
export function ShareSheet({ open, onClose, exporterRef, design, shared }: ShareSheetProps) {
  const theme = useThemeMode();
  const reduceMotion = useReducedMotion() ?? false;
  // The portal exists only on the client; the server renders nothing here.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [format, setFormat] = useState<StillFormat>('post');
  const brandColor = brandColorOf(design);
  // The backdrop follows the theme until the visitor picks one; a pale card
  // on the light stage would vanish, so it takes the dark one.
  const [backdropPick, setBackdropPick] = useState<BackdropId | null>(null);
  const paleCard = luminance(brandColor) > 0.72;
  const backdrop: BackdropId = backdropPick ?? (theme === 'dark' || paleCard ? 'dark' : 'light');
  const setBackdrop = setBackdropPick;
  const team = teamUnlocked();

  // The share made from this sheet (or the one the page opened from).
  const [handle, setHandle] = useState<ShareHandle | null>(null);
  const [handleDesign, setHandleDesign] = useState<CardDesign | null>(null);
  const [progress, setProgress] = useState<ShareProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'link' | 'edit' | null>(null);
  const [video, setVideo] = useState<VideoState>({ status: 'idle' });
  const [views, setViews] = useState<number | null>(null);
  // For a customer.
  const [forCustomer, setForCustomer] = useState(false);
  const [forName, setForName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugState, setSlugState] = useState<{ slug: string; available: boolean; valid: boolean } | null>(null);

  // Opened from a share this visitor may edit: updates go to it.
  useEffect(() => {
    if (!shared) return;
    if (shared.editToken) {
      setHandle({ record: shared.record, editToken: shared.editToken, url: shareUrl(shared.record.slug) });
      setHandleDesign(shared.record.design);
      if (shared.record.kind === 'pitch') {
        setForCustomer(true);
        setForName(shared.record.forName ?? '');
        setSlug(shared.record.slug);
      }
      if (shared.record.assets.video) setVideo({ status: 'done', url: shared.record.assets.video, blob: new Blob() });
    }
  }, [shared]);
  useEffect(() => {
    if (!open || !handle) return;
    fetchViews(handle.record.id, handle.editToken)
      .then(setViews)
      .catch(() => setViews(null));
  }, [open, handle]);

  // The design has moved on since the link was made: the link needs updating.
  const stale = !!handle && !!handleDesign && !sameDesign(handleDesign, design);

  // ── Preview ────────────────────────────────────────────────────────────
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const size = stillSize(format, exporterRef.current?.orientation ?? design.orientation);
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    let tries = 0;
    const draw = () => {
      const ex = exporterRef.current;
      const canvas = previewRef.current;
      if (!ex || !canvas) return;
      if (!ex.ready) {
        if (tries++ < 120) raf = requestAnimationFrame(draw);
        return;
      }
      const src = renderStillCanvas(ex, { format, backdrop, brandColor, scale: PREVIEW_SCALE });
      canvas.width = src.width;
      canvas.height = src.height;
      canvas.getContext('2d')!.drawImage(src, 0, 0);
      setPreviewReady(true);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [open, format, backdrop, brandColor, design, exporterRef]);

  // ── Slug ───────────────────────────────────────────────────────────────
  const slugWanted = normalizeSlug(slug || forName);
  useEffect(() => {
    if (!forCustomer || !slugWanted || (handle && handle.record.slug === slugWanted)) {
      setSlugState(null);
      return;
    }
    let alive = true;
    const t = setTimeout(() => {
      checkSlug(slugWanted)
        .then((s) => alive && setSlugState(s))
        .catch(() => alive && setSlugState(null));
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [forCustomer, slugWanted, handle]);

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
          backdrop: backdrop === 'none' ? (theme === 'dark' ? 'dark' : 'light') : backdrop,
          brandColor,
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
    [backdrop, brandColor, exporterRef, theme],
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
        kind: forCustomer ? 'pitch' : 'public',
        slug: forCustomer ? slugWanted : undefined,
        forName: forCustomer ? forName.trim() || null : null,
        backdrop: backdrop === 'none' ? (theme === 'dark' ? 'dark' : 'light') : backdrop,
        brandColor,
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
        code === 'slug-taken'
          ? 'That name is taken.'
          : code === 'slug-invalid'
            ? 'Use letters, numbers, and dashes.'
            : code === 'http-401' || code === 'http-403'
              ? 'This link belongs to someone else. Make a new one.'
              : 'Something went wrong. Try again.',
      );
      setProgress(null);
      return null;
    }
  }, [backdrop, brandColor, design, exporterRef, forCustomer, forName, handle, makeVideo, slugWanted, stale, theme]);

  const copy = async (text: string, what: 'link' | 'edit') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      play('success');
      setTimeout(() => setCopied((c) => (c === what ? null : c)), 1800);
    } catch {
      setError('Could not copy. Select the link and copy it.');
    }
  };

  const onCopyLink = async () => {
    const h = await ensureShare();
    if (h) await copy(h.url, 'link');
  };
  const onPostToX = async () => {
    const h = await ensureShare();
    if (!h) return;
    const text = `I designed the ${programNameOf(design)} card on @lightspark Grid`;
    window.open(xIntentUrl(text, h.url), '_blank', 'noopener');
  };
  const onDownloadImage = async () => {
    const ex = exporterRef.current;
    if (!ex?.ready) return;
    const blob = await renderStill(ex, { format, backdrop, brandColor });
    download(blob, `${fileStem(design)}-${format}.${blob.type.split('/')[1].replace('jpeg', 'jpg')}`);
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
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const onNativeShare = async () => {
    const h = await ensureShare();
    if (!h) return;
    const files =
      video.status === 'done' && video.blob.size > 0
        ? [new File([video.blob], `${fileStem(design)}-spin.mp4`, { type: 'video/mp4' })]
        : [];
    const data: ShareData = { title: `${programNameOf(design)} card`, url: h.url };
    if (files.length && navigator.canShare?.({ files })) data.files = files;
    try {
      await navigator.share(data);
    } catch {
      // Dismissed.
    }
  };

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const statusLine = useMemo(() => {
    if (error) return error;
    if (progress && progress.stage !== 'done') {
      return progress.stage === 'record'
        ? 'Making the link…'
        : progress.stage === 'render'
          ? `Rendering ${progress.detail === 'post' ? 'the preview' : progress.detail === 'square' ? 'the square' : 'the card'}…`
          : `Uploading…`;
    }
    return null;
  }, [error, progress]);

  const videoLine = (() => {
    switch (video.status) {
      case 'idle':
        return canEncodeVideo()
          ? 'Spin video renders when you copy the link'
          : 'Spin video needs Chrome, Edge, or Safari 16.4+';
      case 'rendering':
        return `Rendering spin video · ${Math.round((video.done / video.total) * 100)}%`;
      case 'uploading':
        return 'Uploading spin video…';
      case 'done':
        return 'Spin video attached. iMessage plays it in the preview.';
      case 'unavailable':
        return 'Spin video needs Chrome, Edge, or Safari 16.4+';
      case 'failed':
        return 'Spin video failed. Download to try again.';
      default: {
        const never: never = video;
        return never;
      }
    }
  })();

  const origin = shareOrigin().replace(/^https?:\/\//, '');
  const linkPreview =
    forCustomer && slugWanted
      ? `${origin}/${slugWanted}`
      : handle
        ? handle.url.replace(/^https?:\/\//, '')
        : `${origin}/…`;

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          className={styles.scrim}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduceMotion ? { duration: 0 } : SHEET_OUT}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <m.div
            className={styles.sheetWrap}
            role="dialog"
            aria-modal="true"
            aria-label="Share your card"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, transition: SHEET_IN }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8, transition: SHEET_OUT }}
          >
            <FrostPanel
              className={styles.sheet}
              radius={24}
              cornerSmoothing={0.6}
              tint="var(--share-sheet-tint)"
              tintBlur={28}
              shadow="0 24px 80px rgba(0, 0, 0, 0.28), 0 2px 8px rgba(0, 0, 0, 0.08)"
            >
              <div className={styles.body}>
                <header className={styles.header}>
                  <div>
                    <h2 className={styles.title}>Share your card</h2>
                    <p className={styles.subtitle}>
                      {handle && !stale
                        ? 'Your link is ready.'
                        : stale
                          ? 'The design changed since the link was made.'
                          : 'The link shows this picture wherever you paste it.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.close}
                    aria-label="Close"
                    {...pressable({ onClick: onClose })}
                  >
                    <IconCrossMedium size={16} />
                  </button>
                </header>

                <div
                  className={clsx(styles.preview, styles[`preview_${format}`], !previewReady && styles.previewPending)}
                  style={{ aspectRatio: `${size.width} / ${size.height}` }}
                >
                  <canvas ref={previewRef} className={styles.previewCanvas} aria-label="Preview of the picture" />
                  {!previewReady && <span className={styles.previewHint}>Rendering…</span>}
                </div>

                <div className={styles.controls}>
                  <Segmented
                    label="Format"
                    value={format}
                    options={FORMATS.map((f) => ({ id: f, label: STILLS[f].label }))}
                    onChange={setFormat}
                  />
                  <Segmented
                    label="Backdrop"
                    value={backdrop}
                    options={BACKDROPS.filter((b) => b.id !== 'none')}
                    onChange={setBackdrop}
                    disabled={format === 'card'}
                  />
                </div>

                {team && (
                  <div className={styles.team}>
                    <label className={styles.toggleRow}>
                      <input
                        type="checkbox"
                        checked={forCustomer}
                        disabled={!!handle && handle.record.kind === 'pitch'}
                        onChange={(e) => {
                          setForCustomer(e.target.checked);
                          play('press');
                        }}
                      />
                      <span>For a customer</span>
                      <span className={styles.toggleHint}>A named link, an edit link, and a view count</span>
                    </label>
                    {forCustomer && (
                      <div className={styles.teamFields}>
                        <input
                          className={styles.field}
                          placeholder="Customer name"
                          value={forName}
                          maxLength={40}
                          onChange={(e) => setForName(e.target.value)}
                          disabled={busy}
                        />
                        <input
                          className={styles.field}
                          placeholder={normalizeSlug(forName) || 'link-name'}
                          value={slug}
                          maxLength={40}
                          onChange={(e) => setSlug(e.target.value)}
                          disabled={busy || (!!handle && handle.record.kind === 'pitch')}
                          aria-label="Link name"
                        />
                        <span
                          className={clsx(
                            styles.slugState,
                            slugState && (!slugState.available || !slugState.valid) && styles.slugBad,
                          )}
                        >
                          {slugState === null
                            ? ''
                            : !slugState.valid
                              ? 'Letters, numbers, dashes'
                              : slugState.available
                                ? 'Available'
                                : 'Taken'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.linkRow}>
                  <IconChainLink1 size={14} className={styles.linkIcon} />
                  <span className={styles.linkText} title={handle?.url}>
                    {linkPreview}
                  </span>
                  {handle && views !== null && (
                    <span className={styles.views} title="Opens of the link">
                      <IconEyeOpen size={13} />
                      {views}
                    </span>
                  )}
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={clsx(styles.btn, styles.btnPrimary)}
                    disabled={busy || (forCustomer && slugState !== null && (!slugState.available || !slugState.valid))}
                    {...pressable({ onClick: onCopyLink, disabled: busy })}
                  >
                    {copied === 'link' ? <IconCheckmark1 size={16} /> : <IconChainLink1 size={16} />}
                    {copied === 'link' ? 'Copied' : stale ? 'Update link' : handle ? 'Copy link' : 'Copy link'}
                  </button>
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={busy}
                    {...pressable({ onClick: onPostToX, disabled: busy })}
                  >
                    <IconX size={15} />
                    Post to X
                  </button>
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={busy}
                    {...pressable({ onClick: onDownloadImage, disabled: busy })}
                  >
                    <IconArrowDownWall size={16} />
                    Image
                  </button>
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={
                      busy ||
                      video.status === 'unavailable' ||
                      video.status === 'rendering' ||
                      video.status === 'uploading'
                    }
                    title={video.status === 'unavailable' ? 'This browser has no video encoder' : undefined}
                    {...pressable({ onClick: onDownloadVideo, disabled: busy })}
                  >
                    <IconArrowDownWall size={16} />
                    Video
                  </button>
                  {canNativeShare && (
                    <button
                      type="button"
                      className={styles.btn}
                      disabled={busy}
                      {...pressable({ onClick: onNativeShare, disabled: busy })}
                    >
                      <IconShareOs size={16} />
                      Share
                    </button>
                  )}
                </div>

                <div className={styles.status}>
                  <span className={clsx(styles.statusLine, error && styles.statusError)}>
                    {statusLine ?? videoLine}
                  </span>
                  {video.status === 'rendering' && (
                    <span className={styles.bar} aria-hidden>
                      <span className={styles.barFill} style={{ width: `${(video.done / video.total) * 100}%` }} />
                    </span>
                  )}
                </div>

                {handle && (forCustomer || handle.record.kind === 'pitch') && (
                  <div className={styles.editRow}>
                    <span className={styles.editLabel}>Edit link</span>
                    <span className={styles.editText}>
                      {shareEditUrl(handle.record.slug, handle.editToken).replace(/^https?:\/\//, '')}
                    </span>
                    <button
                      type="button"
                      className={styles.editCopy}
                      {...pressable({
                        onClick: () => copy(shareEditUrl(handle.record.slug, handle.editToken), 'edit'),
                      })}
                    >
                      {copied === 'edit' ? 'Copied' : 'Copy'}
                    </button>
                    <span className={styles.editHint}>Keep it. Anyone with it can change this card.</span>
                  </div>
                )}
              </div>
            </FrostPanel>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ id: T; label: string }>;
  onChange: (id: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className={clsx(styles.segRow, disabled && styles.segDisabled)}>
      <span className={styles.segLabel}>{label}</span>
      <div className={styles.seg} role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            className={clsx(styles.segBtn, value === o.id && styles.segOn)}
            disabled={disabled}
            {...pressable({ onClick: () => onChange(o.id), disabled }, { press: 'tickBright' })}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
