import type { Meta, StoryObj } from '@storybook/react';
import { Meter } from './index';

const meta: Meta = {
  title: 'Components/Meter',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <div style={{ width: 240 }}>
      <Meter.Root value={50}>
        <Meter.Label>Storage used</Meter.Label>
        <Meter.Value />
        <Meter.Track>
          <Meter.Indicator />
        </Meter.Track>
      </Meter.Root>
    </div>
  ),
};

export const Low: StoryObj = {
  render: () => (
    <div style={{ width: 240 }}>
      <Meter.Root value={25}>
        <Meter.Label>Battery level</Meter.Label>
        <Meter.Value />
        <Meter.Track>
          <Meter.Indicator />
        </Meter.Track>
      </Meter.Root>
    </div>
  ),
};

export const High: StoryObj = {
  render: () => (
    <div style={{ width: 240 }}>
      <Meter.Root value={90}>
        <Meter.Label>Disk space used</Meter.Label>
        <Meter.Value />
        <Meter.Track>
          <Meter.Indicator />
        </Meter.Track>
      </Meter.Root>
    </div>
  ),
};

export const Full: StoryObj = {
  render: () => (
    <div style={{ width: 240 }}>
      <Meter.Root value={100}>
        <Meter.Label>Storage full</Meter.Label>
        <Meter.Value />
        <Meter.Track>
          <Meter.Indicator />
        </Meter.Track>
      </Meter.Root>
    </div>
  ),
};

export const TrackOnly: StoryObj = {
  render: () => (
    <div style={{ width: 240 }}>
      <Meter.Root value={65}>
        <Meter.Track>
          <Meter.Indicator />
        </Meter.Track>
      </Meter.Root>
    </div>
  ),
};
