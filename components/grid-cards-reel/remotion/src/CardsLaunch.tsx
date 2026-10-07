/* The launch video: the card plate on a background, sized to the frame.
   Everything Cole would want to tweak is a prop (scale, position, color,
   when the plate starts), editable live in Remotion Studio. Add type,
   logo, and sound as more layers here; `SWAPS` and `BEATS` (plate.ts) give
   the frames to sync them to. */

import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { PLATE } from './plate';

export const cardsLaunchSchema = z.object({
  background: z.string(),
  /** The plate's size as a share of the frame's shorter side. */
  scale: z.number().min(0.1).max(3),
  /** Nudge the plate, px of the output frame. */
  offsetX: z.number(),
  offsetY: z.number(),
  /** Output frames before the plate starts (lengthen the composition to match). */
  startAt: z.number().int().min(0),
});

export type CardsLaunchProps = z.infer<typeof cardsLaunchSchema>;

export const cardsLaunchDefaults: CardsLaunchProps = {
  background: '#000000',
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  startAt: 0,
};

export const CardsLaunch: React.FC<CardsLaunchProps> = ({ background, scale, offsetX, offsetY, startAt }) => {
  const { width, height } = useVideoConfig();
  const side = Math.min(width, height) * scale;
  const plate = (
    <OffthreadVideo
      src={staticFile(PLATE.file)}
      transparent
      muted
      style={{
        position: 'absolute',
        width: side,
        height: side,
        left: (width - side) / 2 + offsetX,
        top: (height - side) / 2 + offsetY,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background }}>
      <Sequence from={startAt} durationInFrames={PLATE.frames} layout="none">
        {plate}
      </Sequence>
    </AbsoluteFill>
  );
};
