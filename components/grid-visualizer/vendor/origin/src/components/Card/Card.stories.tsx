import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './index';
import { Button } from '../Button';

const meta: Meta = {
  title: 'Components/Card',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Structured: StoryObj = {
  render: () => (
    <Card.Root variant="structured" style={{ width: 360 }}>
      <Card.Header>
        <Card.TitleGroup>
          <Card.Title>Card title</Card.Title>
          <Card.Subtitle>Subtitle goes here.</Card.Subtitle>
        </Card.TitleGroup>
      </Card.Header>
      <Card.Body>
        <p>Slot components in to the body here to extend the functionality of the card.</p>
      </Card.Body>
      <Card.Footer>
        <Button>Button</Button>
      </Card.Footer>
    </Card.Root>
  ),
};

export const StructuredWithBackButton: StoryObj = {
  render: () => (
    <Card.Root variant="structured" style={{ width: 360 }}>
      <Card.Header>
        <Card.BackButton onClick={() => console.log('Back clicked')} />
        <Card.TitleGroup>
          <Card.Title>Card title</Card.Title>
          <Card.Subtitle>Subtitle goes here.</Card.Subtitle>
        </Card.TitleGroup>
      </Card.Header>
      <Card.Body>
        <p>Slot components in to the body here to extend the functionality of the card.</p>
      </Card.Body>
      <Card.Footer>
        <Button>Button</Button>
      </Card.Footer>
    </Card.Root>
  ),
};

export const Simple: StoryObj = {
  render: () => (
    <Card.Root variant="simple" style={{ width: 360 }}>
      <Card.TitleGroup>
        <Card.Title>Card title</Card.Title>
        <Card.Subtitle>Subtitle goes here.</Card.Subtitle>
      </Card.TitleGroup>
      <Card.Body>
        <p>Slot components in to the body here to extend the functionality of the card.</p>
      </Card.Body>
      <Button>Button</Button>
    </Card.Root>
  ),
};

export const FullwidthBody: StoryObj = {
  render: () => (
    <Card.Root variant="structured" style={{ width: 360 }}>
      <Card.Header>
        <Card.TitleGroup>
          <Card.Title>Fullwidth body</Card.Title>
          <Card.Subtitle>Body content goes edge-to-edge</Card.Subtitle>
        </Card.TitleGroup>
      </Card.Header>
      <Card.Body fullwidth>
        <div style={{ background: 'var(--surface-secondary)', padding: '12px 24px' }}>
          Edge-to-edge content
        </div>
      </Card.Body>
      <Card.Footer>
        <Button>Button</Button>
      </Card.Footer>
    </Card.Root>
  ),
};

export const AllVariants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <Card.Root variant="structured" style={{ width: 360 }}>
        <Card.Header>
          <Card.TitleGroup>
            <Card.Title>Structured</Card.Title>
            <Card.Subtitle>With card surface</Card.Subtitle>
          </Card.TitleGroup>
        </Card.Header>
        <Card.Body>
          <p>Body content with sectioned layout.</p>
        </Card.Body>
        <Card.Footer>
          <Button>Button</Button>
        </Card.Footer>
      </Card.Root>

      <Card.Root variant="simple" style={{ width: 360 }}>
        <Card.TitleGroup>
          <Card.Title>Simple</Card.Title>
          <Card.Subtitle>No card surface</Card.Subtitle>
        </Card.TitleGroup>
        <Card.Body>
          <p>Body content with uniform padding.</p>
        </Card.Body>
        <Button>Button</Button>
      </Card.Root>
    </div>
  ),
};
