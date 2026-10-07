import { Composition, Folder } from 'remotion';
import { CardsLaunch, cardsLaunchDefaults, cardsLaunchSchema } from './CardsLaunch';
import { PLATE } from './plate';

/** Output frames at the plate's rate: the plate's own length. */
const duration = PLATE.frames;

const FORMATS = [
  { id: 'CardsLaunch-Square', width: 1080, height: 1080, scale: 1 },
  { id: 'CardsLaunch-Landscape', width: 1920, height: 1080, scale: 1 },
  { id: 'CardsLaunch-Portrait', width: 1080, height: 1350, scale: 1 },
  { id: 'CardsLaunch-Master', width: PLATE.size, height: PLATE.size, scale: 1 },
];

export const RemotionRoot: React.FC = () => (
  <Folder name="Cards-launch">
    {FORMATS.map((f) => (
      <Composition
        key={f.id}
        id={f.id}
        component={CardsLaunch}
        schema={cardsLaunchSchema}
        defaultProps={{ ...cardsLaunchDefaults, scale: f.scale }}
        width={f.width}
        height={f.height}
        fps={PLATE.fps}
        durationInFrames={duration}
      />
    ))}
  </Folder>
);
