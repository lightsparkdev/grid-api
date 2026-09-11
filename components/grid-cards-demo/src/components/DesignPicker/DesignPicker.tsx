'use client';

import clsx from 'clsx';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconPlusSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusSmall';
import { IconAddImage } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconAddImage';
import {
  ART_TREATMENTS,
  brandColorOf,
  DESIGN_SWATCHES,
  FINISHES,
  LOGO_TREATMENTS,
  MATERIALS,
  ORIENTATIONS,
  reorientDesign,
  stockOf,
  VISA_MARK_FACES,
  type CardDesign,
} from '@/data/design';
import { PRESETS, type PresetId } from '@/data/presets';
import { Tooltip } from '@/components/Tooltip/Tooltip';
import { TEX_H, TEX_W } from '@/components/CardStage/card3d/facePaint';
import { ColorPicker } from './ColorPicker';
import styles from './DesignPicker.module.scss';

interface DesignPickerProps {
  design: CardDesign;
  onChange: (patch: Partial<CardDesign>) => void;
  /** The preset the design currently is; null when it is the visitor's own. */
  preset: PresetId | null;
  onPresetSelect: (id: PresetId) => void;
}

const MAX_NAME = 18;
const MAX_CARDHOLDER = 24;

/**
 * Whether the picker shows the rows the public playground leads without:
 * Orientation and the Visa mark's face. Every preset is landscape with the
 * mark on the back, which is the recommendation; the alternatives are
 * decisions a customer makes in the card design tool, against the
 * manufacturer's constraints. `?design=full` brings the rows back for a
 * walkthrough. Read after mount so the server and first client render agree.
 */
function useFullDesignControls(): boolean {
  const [full, setFull] = useState(false);
  useEffect(() => {
    setFull(new URLSearchParams(window.location.search).get('design') === 'full');
  }, []);
  return full;
}

function swatchStyle(color: string) {
  return { background: color };
}

/** A row unfolding into (or out of) a group: the picker's spring. */
const ROW_UNFOLD = { type: 'spring', stiffness: 380, damping: 34, mass: 0.8 } as const;

/** How far the ring sits outside its swatch; the row's gap is twice this
 *  plus the stroke, so the ring clears its neighbors by the same distance. */
const RING_OUT = 3;
const RING_STROKE = 2;

/**
 * A row of swatches with one selection ring that slides between them. The
 * ring is a single element positioned over whichever child is checked
 * (`aria-checked` or `data-active`), sprung to its place; while it travels it
 * stretches a little toward where it is going, by how far it still has to
 * go. Pressing another swatch (pointer down, before release) already leans
 * the ring toward it, so the move begins under the finger; letting go off
 * the swatch relaxes it back.
 */
function SwatchRow({ label, active, children }: { label: string; active: string | null; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const w = useMotionValue(20);
  const h = useMotionValue(20);
  const spring = { stiffness: 620, damping: 40, mass: 0.9 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  // A press on another swatch leans the ring toward it: signed, in px.
  const press = useMotionValue(0);
  const lean = useSpring(press, { stiffness: 520, damping: 32 });
  // Signed reach: remaining travel (positive when the target is to the
  // right), capped, plus the lean.
  const reach = useTransform([x, sx, lean], ([tx, px, l]) => {
    const d = (tx as number) - (px as number);
    return Math.sign(d) * Math.min(6, Math.abs(d) * 0.12) + (l as number);
  });
  // The leading edge reaches ahead: going left, the box starts earlier.
  const left = useTransform([sx, reach], ([px, r]) => (px as number) - RING_OUT - Math.max(0, -(r as number)));
  const top = useTransform(sy, (py) => py - RING_OUT);
  const width = useTransform([w, reach], ([bw, r]) => (bw as number) + RING_OUT * 2 + Math.abs(r as number));

  // Press: lean toward the swatch under the pointer until it is released.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const row = ref.current;
    const el = (e.target as HTMLElement).closest<HTMLElement>('[role="radio"], label');
    if (!row || !el || el.getAttribute('aria-checked') === 'true' || el.dataset.active === 'true') return;
    const rr = row.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const targetCenter = er.left + er.width / 2 - rr.left;
    const ringCenter = sx.get() + w.get() / 2;
    press.set(Math.sign(targetCenter - ringCenter) * 6);
  };
  const release = () => press.set(0);
  const height = useTransform(h, (bh) => bh + RING_OUT * 2);
  const [placed, setPlaced] = useState(false);

  useLayoutEffect(() => {
    const row = ref.current;
    if (!row) return;
    const place = (jump: boolean) => {
      const el = row.querySelector<HTMLElement>('[aria-checked="true"], [data-active="true"]');
      if (!el) return;
      // Sub-pixel: the row is right-aligned, so a swatch often sits on a half
      // pixel that offsetLeft rounds away. Measure from the swatch's center so
      // the hover scale does not move it.
      const rr = row.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const bw = el.offsetWidth;
      const bh = el.offsetHeight;
      const nx = er.left + er.width / 2 - rr.left - bw / 2;
      const ny = er.top + er.height / 2 - rr.top - bh / 2;
      x.set(nx);
      y.set(ny);
      w.set(bw);
      h.set(bh);
      if (jump) {
        sx.jump(nx);
        sy.jump(ny);
      }
    };
    place(!placed);
    if (!placed) setPlaced(true);
    // The swatches move without a selection changing: the row wraps or the
    // panel resizes, fonts swap in. Follow them (animated, never a jump, so
    // the observer's own first call after observe() cannot cut a slide short).
    const follow = () => place(false);
    const ro = new ResizeObserver(follow);
    ro.observe(row);
    Array.from(row.children).forEach((el) => ro.observe(el));
    document.fonts?.ready.then(follow);
    window.addEventListener('resize', follow);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', follow);
    };
  }, [active, placed, x, y, w, h, sx, sy]);

  return (
    <div
      ref={ref}
      className={styles.swatches}
      role="radiogroup"
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
    >
      {children}
      {placed && active !== null && (
        <motion.span className={styles.ring} style={{ left, top, width, height }} aria-hidden />
      )}
    </div>
  );
}

/**
 * A choice as a small sample of itself, the way the Color row shows colors:
 * plastic and steel; matte and gloss; ink flat, spot gloss with a shine, foil
 * silver with a bright run, an etch pressed in; for the Visa mark, a card's
 * front (the chip) or back (the stripe) with the mark's spot on it; for the
 * orientation, a card held flat or upright. Each names itself in a tooltip
 * on hover.
 */
const SAMPLE: Record<string, string> = {
  plastic: styles.samplePlastic,
  metal: styles.sampleMetal,
  matte: styles.sampleInk,
  gloss: styles.sampleGloss,
  print: styles.sampleInk,
  spotGloss: styles.sampleGloss,
  foil: styles.sampleFoil,
  etch: styles.sampleEtch,
  front: styles.sampleFront,
  back: styles.sampleBack,
  landscape: styles.sampleLandscape,
  portrait: styles.samplePortrait,
};

function SampleSwatches<T extends string>({
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
  disabled?: Partial<Record<T, string>>;
}) {
  return (
    <SwatchRow label={label} active={value}>
      {options.map((o) => {
        const why = disabled?.[o.id];
        return (
          <Tooltip key={o.id} text={why ?? o.label}>
            {(tip) => (
              <button
                type="button"
                role="radio"
                aria-checked={value === o.id}
                aria-label={o.label}
                disabled={!!why}
                className={clsx(styles.swatch, SAMPLE[o.id])}
                onClick={() => onChange(o.id)}
                {...tip}
              />
            )}
          </Tooltip>
        );
      })}
    </SwatchRow>
  );
}

/**
 * A text field whose empty state invites: the placeholder is a ghost span
 * under the caret with the project tracker's "pulse of attention" shimmer,
 * a single glint gliding across the words every couple of seconds, resting
 * at the normal placeholder tone between passes. `phase` (0..1) offsets the
 * cycle so two fields don't pulse in step.
 */
function ShimmerField({
  value,
  maxLength,
  placeholder,
  label,
  phase,
  onChange,
}: {
  value: string;
  maxLength: number;
  placeholder: string;
  label: string;
  phase: number;
  onChange: (value: string) => void;
}) {
  const duration = 2400;
  return (
    <span className={styles.shimmerField}>
      <input
        type="text"
        className={styles.nameInput}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
      />
      {!value && (
        <span
          className={styles.shimmerGhost}
          style={
            {
              '--shimmer-duration': `${duration}ms`,
              '--shimmer-delay': `${-phase * duration}ms`,
            } as CSSProperties
          }
          aria-hidden
        >
          {placeholder}
        </span>
      )}
    </span>
  );
}

/** One image upload, as a whole row: until a file is picked the row itself
 *  is the target (the label, the empty space, the Upload button), after that
 *  a swatch-sized preview and a Remove tile. */
function UploadRow({
  rowLabel,
  url,
  accept,
  label,
  hint,
  previewStyle,
  onPick,
}: {
  rowLabel: string;
  url: string | null;
  accept: string;
  label: string;
  /** What to upload (formats, size), shown over the button while the row is hovered. */
  hint: string;
  previewStyle?: CSSProperties;
  onPick: (url: string | null) => void;
}) {
  const uploadBtn = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrl = useRef<string | null>(null);

  // Revoke the previous upload's object URL when it's replaced or on unmount.
  useEffect(() => {
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  const onPicked = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    const next = URL.createObjectURL(file);
    objectUrl.current = next;
    onPick(next);
    e.target.value = '';
  };

  const clear = () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    onPick(null);
  };

  return (
    <Tooltip text={hint}>
      {(tip) => (
        <div
          className={clsx(styles.row, !url && styles.rowPick)}
          onClick={url ? undefined : () => fileRef.current?.click()}
          // The hint anchors to the button, whichever part of the row is hovered.
          onMouseEnter={
            url ? undefined : (e) => tip.onMouseEnter({ ...e, currentTarget: uploadBtn.current ?? e.currentTarget })
          }
          onMouseLeave={url ? undefined : tip.onMouseLeave}
        >
          <span className={styles.rowLabel}>{rowLabel}</span>
          <div className={styles.logoRow}>
            {/* The button gives way to the preview and Remove, and back: the
                new content slides in from the right as the old leaves to the
                left, fading both ways. */}
            <AnimatePresence mode="popLayout" initial={false}>
              {url ? (
                <motion.div
                  key="picked"
                  className={styles.logoPicked}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={ROW_UNFOLD}
                >
                  <span className={styles.logoPreview} style={previewStyle}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" />
                  </span>
                  <Tooltip text="Remove">
                    {(t) => (
                      <button type="button" className={styles.logoClear} onClick={clear} aria-label="Remove" {...t}>
                        <IconCrossMedium size={16} aria-hidden />
                      </button>
                    )}
                  </Tooltip>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  className={styles.logoPicked}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={ROW_UNFOLD}
                >
                  {/* The ref stays off the presence child: popLayout reads the
                      child's props.ref, which React warns about. */}
                  <button ref={uploadBtn} type="button" className={styles.logoUpload}>
                    <IconAddImage size={16} aria-hidden />
                    {label}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <input
              ref={fileRef}
              type="file"
              accept={accept}
              className={styles.fileInput}
              onChange={onPicked}
              tabIndex={-1}
            />
          </div>
        </div>
      )}
    </Tooltip>
  );
}

/**
 * The Design section, in the order a card is made. Card: a preset to start
 * from, then material, finish, and the print (a color, or none, or art; the
 * core under a print is chosen to match it, not offered). Brand: the name and
 * logo, and how the mark is applied once there is one. Name: the cardholder's.
 */
export function DesignPicker({ design, onChange, preset, onPresetSelect }: DesignPickerProps) {
  const fullControls = useFullDesignControls();
  const stock = stockOf(design);
  const activeSwatch =
    design.color && !design.gradient ? DESIGN_SWATCHES.find((s) => s.color === design.color) : undefined;
  const custom = design.color !== null && !activeSwatch;
  const brand = brandColorOf(design);
  // Spot gloss is a clear varnish that reads against a matte coat; on a gloss
  // card it is invisible.
  const glossy = design.finish === 'gloss';
  const noSpotGloss = glossy ? ({ spotGloss: 'Spot gloss needs a matte card' } as const) : undefined;

  return (
    <div className={styles.groups}>
      <div className={styles.group}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Preset</span>
          <SwatchRow label="Preset" active={preset}>
            {PRESETS.map((p) => (
              <Tooltip key={p.id} text={p.description}>
                {(tip) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={preset === p.id}
                    aria-label={`${p.description} (${p.design.programName})`}
                    className={clsx(styles.swatch, styles.swatchIcon)}
                    onClick={() => onPresetSelect(p.id)}
                    {...tip}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.iconSrc} alt="" draggable={false} />
                  </button>
                )}
              </Tooltip>
            ))}
          </SwatchRow>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Material</span>
          <SampleSwatches
            label="Card material"
            value={design.material}
            options={MATERIALS}
            onChange={(material) => onChange({ material })}
          />
        </div>
        {/* The same blank held flat or upright. The brand's placement and the
            gradient's line belong to a face, so the switch carries the design
            over (`reorientDesign`) rather than the coordinates. */}
        {fullControls && (
          <div className={styles.row}>
            <span className={styles.rowLabel}>Orientation</span>
            <SampleSwatches
              label="Card orientation"
              value={design.orientation}
              options={ORIENTATIONS}
              onChange={(orientation) => {
                const next = reorientDesign(design, orientation);
                onChange({ orientation, brandLayout: next.brandLayout, gradient: next.gradient });
              }}
            />
          </div>
        )}
        <div className={styles.row}>
          <span className={styles.rowLabel}>Finish</span>
          <SampleSwatches
            label="Card finish"
            value={design.finish}
            options={FINISHES}
            onChange={(finish) => onChange({ finish })}
          />
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Color</span>
          <SwatchRow label="Card color" active={design.color === null ? 'none' : custom ? 'custom' : design.color}>
            <Tooltip text={`None (bare ${stock.label.toLowerCase()})`}>
              {(tip) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={design.color === null}
                  aria-label="None"
                  className={clsx(styles.swatch, styles.swatchNone)}
                  onClick={() => onChange({ color: null, gradient: null })}
                  {...tip}
                />
              )}
            </Tooltip>
            {DESIGN_SWATCHES.map((s) => (
              <Tooltip key={s.id} text={s.label}>
                {(tip) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={activeSwatch?.id === s.id}
                    aria-label={s.label}
                    className={styles.swatch}
                    style={swatchStyle(s.color)}
                    onClick={() => onChange({ color: s.color, gradient: null })}
                    {...tip}
                  />
                )}
              </Tooltip>
            ))}
            <ColorPicker
              value={design.color ?? brand}
              gradient={design.gradient}
              orientation={design.orientation}
              onChange={(color, gradient) => onChange({ color, gradient })}
              triggerClassName={clsx(styles.swatch, styles.swatchCustom)}
              triggerActive={custom}
              triggerLabel={design.gradient ? 'Custom gradient' : 'Custom color'}
              tooltip={design.gradient ? 'Custom gradient' : 'Custom color'}
            >
              {!custom ? <IconPlusSmall size={16} aria-hidden /> : null}
            </ColorPicker>
          </SwatchRow>
        </div>
        <UploadRow
          rowLabel="Art"
          url={design.backgroundUrl}
          accept="image/svg+xml,image/png,image/jpeg,image/webp"
          label="Upload card art"
          hint={design.orientation === 'portrait' ? `${TEX_H} × ${TEX_W} fills the face` : `${TEX_W} × ${TEX_H} fills the face`}
          onPick={(url) => onChange({ backgroundUrl: url })}
        />
        {/* The art's effect row unfolds under the art once there is some. */}
        <AnimatePresence initial={false}>
          {design.backgroundUrl && (
            <motion.div
              key="artEffect"
              className={styles.rowUnfold}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={ROW_UNFOLD}
            >
              <div className={styles.row}>
                <span className={styles.rowLabel}>Effect</span>
                <SampleSwatches
                  label="Art effect"
                  value={design.artTreatment}
                  options={ART_TREATMENTS}
                  onChange={(artTreatment) => onChange({ artTreatment })}
                  disabled={noSpotGloss}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Front: the Visa mark printed flat, bottom right, with the dove
            hologram on the back. Back: the foil mark, which needs no hologram. */}
        {fullControls && (
          <div className={styles.row}>
            <span className={styles.rowLabel}>Visa</span>
            <SampleSwatches
              label="Visa mark"
              value={design.visaMark}
              options={VISA_MARK_FACES}
              onChange={(visaMark) => onChange({ visaMark })}
            />
          </div>
        )}
      </div>

      <div className={styles.group}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Brand</span>
          <ShimmerField
            value={design.programName}
            maxLength={MAX_NAME}
            placeholder="Your brand"
            label="Brand name"
            phase={0}
            onChange={(programName) => onChange({ programName })}
          />
        </div>
        <UploadRow
          rowLabel="Logo"
          url={design.logoUrl}
          accept="image/svg+xml,image/png,image/webp"
          label="Upload logo"
          hint="Transparent, at least 512 px tall"
          previewStyle={swatchStyle(brand)}
          // The placement belongs to the artwork: a logo's layout (say, a
          // watermark at 838 tall and 20%) is wrong for the wordmark that
          // replaces it, and the other way round. Swapping resets it.
          onPick={(url) => onChange({ logoUrl: url, brandLayout: null })}
        />
        <div className={styles.row}>
          <span className={styles.rowLabel}>Effect</span>
          <SampleSwatches
            label="Brand effect"
            value={design.logoTreatment}
            options={LOGO_TREATMENTS}
            onChange={(logoTreatment) => onChange({ logoTreatment })}
            disabled={noSpotGloss}
          />
        </div>
      </div>

      <div className={styles.group}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Name</span>
          <ShimmerField
            value={design.cardholderName}
            maxLength={MAX_CARDHOLDER}
            placeholder="Your name"
            label="Cardholder name"
            phase={0.45}
            onChange={(cardholderName) => onChange({ cardholderName })}
          />
        </div>
      </div>
    </div>
  );
}
