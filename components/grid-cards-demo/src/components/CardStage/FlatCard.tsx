'use client';

import { useEffect, useRef, useState, type MutableRefObject, type Ref } from 'react';
import { footprint } from '@/apps/card/cardMetrics';
import { currentCredentials, type CardCredentials } from '@/apps/shared/card/cardholder';
import type { CardDesign, Orientation } from '@/data/design';
import { CARD_R } from './card3d/cardGeometry';
import type { Side } from './card3d/faceFrame';
import { loadFaceAssets, makeCanvas, paintBack, paintFront, TEX_H, TEX_W, type FaceAssets } from './card3d/facePaint';
import { useLoadedImage } from './card3d/useLoadedImage';
import type { Pose } from './cardMotion';
import type { FlatFaces } from './export/flatExporter';
import { introCard } from './introTimeline';
import styles from './FlatCard.module.scss';

interface FlatCardProps {
  design: CardDesign;
  /** The element that turns (see `poseTransform`), for the caller's frame loop. */
  turnRef?: Ref<HTMLDivElement>;
  /** Filled with the painted faces, for pictures of the card (FlatExporter). */
  facesRef?: MutableRefObject<FlatFaces | null>;
  issued?: boolean;
  /** What the back prints once issued. Absent, the current card's. */
  credentials?: CardCredentials;
  frozen?: boolean;
  closed?: boolean;
  /** The front has painted for the first time. */
  onPainted?: () => void;
}

/** The motion's pose as a CSS transform: the 3D stage's Euler XYZ, with the
 *  y axis flipped from the scene's (up) to the page's (down). The upright
 *  card is laid out upright, so its quarter-turn roll is not added. */
export function poseTransform(p: Pose): string {
  return `rotateX(${(-p.rotX).toFixed(3)}deg) rotateY(${p.rotY.toFixed(3)}deg) rotateZ(${(-p.rotZ).toFixed(3)}deg)`;
}

/** The intro's look on the flat card at real time `t` (the 3D stage puts the
 *  same on its canvas and mesh): hidden, then fading in as the blur clears
 *  and it settles down to size. */
export function applyIntroLook(el: HTMLElement, t: number) {
  const look = introCard(Math.max(0, t));
  el.style.opacity = String(look.opacity);
  el.style.filter = look.blur > 0.05 ? `blur(${look.blur.toFixed(2)}px)` : '';
  el.style.transform = `scale(${look.scale})`;
}

export function clearIntroLook(el: HTMLElement) {
  el.style.opacity = '';
  el.style.filter = '';
  el.style.transform = '';
}

/** A face's texture (the landscape blank's, see faceFrame) onto `canvas` as
 *  the face is held: an upright card's artwork is turned a quarter in the
 *  texture, the front's one way and the back's the other, so it is turned
 *  back here. */
function present(canvas: HTMLCanvasElement, texture: HTMLCanvasElement, o: Orientation, side: Side) {
  const upright = o === 'portrait';
  const w = upright ? TEX_H : TEX_W;
  const h = upright ? TEX_W : TEX_H;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (upright) {
    if (side === 'front') ctx.setTransform(0, 1, -1, 0, TEX_H, 0);
    else ctx.setTransform(0, -1, 1, 0, 0, TEX_W);
  }
  ctx.drawImage(texture, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/**
 * The card without WebGL: the same painted faces the 3D card wears, as two
 * flat sides turned in CSS 3D by the caller's frame loop. Laid out in card px
 * (its footprint as held); the caller places and scales it.
 */
export function FlatCard({
  design,
  turnRef,
  facesRef,
  issued = false,
  credentials,
  frozen = false,
  closed = false,
  onPainted,
}: FlatCardProps) {
  const frontRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const texture = useRef<HTMLCanvasElement | null>(null);
  const onPaintedRef = useRef(onPainted);
  onPaintedRef.current = onPainted;
  const paintedOnce = useRef(false);

  const [assets, setAssets] = useState<FaceAssets | null>(null);
  useEffect(() => {
    let alive = true;
    loadFaceAssets().then(
      (a) => alive && setAssets(a),
      (e) => console.error(e),
    );
    return () => {
      alive = false;
    };
  }, []);
  const { img: logo, pending: logoPending } = useLoadedImage(design.logoUrl);
  const { img: art, pending: artPending } = useLoadedImage(design.backgroundUrl);

  // The faces are offered for pictures from their first paint (so there is
  // never a blank card to render) until the card goes.
  useEffect(() => {
    if (!facesRef) return;
    return () => {
      facesRef.current = null;
    };
  }, [facesRef]);
  // A logo or art on its way: the last paint stays up, but isn't the design.
  useEffect(() => {
    if (facesRef?.current && (logoPending || artPending)) facesRef.current.ready = false;
  }, [facesRef, logoPending, artPending]);

  useEffect(() => {
    const canvas = frontRef.current;
    if (!assets || logoPending || artPending || !canvas) return;
    texture.current ??= makeCanvas(TEX_W, TEX_H);
    paintFront(texture.current.getContext('2d')!, { design, logo, art, frozen, closed }, assets);
    present(canvas, texture.current, design.orientation, 'front');
    if (facesRef && backRef.current) facesRef.current = { front: canvas, back: backRef.current, ready: true };
    if (!paintedOnce.current) {
      paintedOnce.current = true;
      onPaintedRef.current?.();
    }
  }, [assets, design, logo, art, logoPending, artPending, frozen, closed, facesRef]);

  useEffect(() => {
    const canvas = backRef.current;
    if (!assets || !canvas) return;
    texture.current ??= makeCanvas(TEX_W, TEX_H);
    paintBack(
      texture.current.getContext('2d')!,
      { design, personalized: issued ? 1 : 0, credentials: credentials ?? currentCredentials(), frozen, closed },
      assets,
    );
    present(canvas, texture.current, design.orientation, 'back');
  }, [assets, design, issued, credentials, frozen, closed]);

  const foot = footprint(design.orientation);
  return (
    <div
      className={styles.card}
      style={{ width: foot.w, height: foot.h, '--card-radius': `${CARD_R}px` } as React.CSSProperties}
    >
      <div ref={turnRef} className={styles.turn}>
        <canvas ref={frontRef} className={styles.face} />
        <canvas ref={backRef} className={styles.face} data-side="back" />
      </div>
    </div>
  );
}
