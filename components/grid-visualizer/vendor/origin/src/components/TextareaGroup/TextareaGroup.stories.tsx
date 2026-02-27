import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TextareaGroup } from './';
import { Chip } from '@/components/Chip';

const meta: Meta<typeof TextareaGroup.Root> = {
  title: 'Components/TextareaGroup',
  component: TextareaGroup.Root,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TextareaGroup.Root>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <TextareaGroup.Root>
        <TextareaGroup.Textarea placeholder="Write a message..." />
      </TextareaGroup.Root>
    </div>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <TextareaGroup.Root>
        <TextareaGroup.Header>
          <Chip onDismiss={() => {}}>recipient-1</Chip>
          <Chip onDismiss={() => {}}>recipient-2</Chip>
        </TextareaGroup.Header>
        <TextareaGroup.Textarea placeholder="Write a message..." />
      </TextareaGroup.Root>
    </div>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <TextareaGroup.Root>
        <TextareaGroup.Textarea placeholder="Write a message..." />
        <TextareaGroup.Footer>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Chip onDismiss={() => {}}>label</Chip>
          </div>
          <div>
            <button type="button">Send</button>
          </div>
        </TextareaGroup.Footer>
      </TextareaGroup.Root>
    </div>
  ),
};

export const FullComposer: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <TextareaGroup.Root>
        <TextareaGroup.Header>
          <Chip onDismiss={() => {}}>tag-1</Chip>
          <Chip onDismiss={() => {}}>tag-2</Chip>
        </TextareaGroup.Header>
        <TextareaGroup.Textarea placeholder="Write a message..." />
        <TextareaGroup.Footer>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Chip onDismiss={() => {}}>label</Chip>
          </div>
          <div>
            <button type="button">Send</button>
          </div>
        </TextareaGroup.Footer>
      </TextareaGroup.Root>
    </div>
  ),
};

export const WithMaxHeight: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <TextareaGroup.Root maxHeight={200}>
        <TextareaGroup.Textarea
          placeholder="Write a long prompt..."
          defaultValue={'This is a long prompt that grows.\n'.repeat(15)}
        />
        <TextareaGroup.Footer>
          <div />
          <div>
            <button type="button">Send</button>
          </div>
        </TextareaGroup.Footer>
      </TextareaGroup.Root>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <TextareaGroup.Root disabled>
        <TextareaGroup.Header>
          <Chip>tag-1</Chip>
        </TextareaGroup.Header>
        <TextareaGroup.Textarea placeholder="Write a message..." />
        <TextareaGroup.Footer>
          <div />
          <div>
            <button type="button">Send</button>
          </div>
        </TextareaGroup.Footer>
      </TextareaGroup.Root>
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <TextareaGroup.Root invalid>
        <TextareaGroup.Textarea
          placeholder="Write a message..."
          defaultValue="Bad content"
        />
      </TextareaGroup.Root>
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledComposer() {
    const [value, setValue] = useState('');
    return (
      <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TextareaGroup.Root>
          <TextareaGroup.Textarea
            value={value}
            onChange={(e) => setValue((e.target as HTMLTextAreaElement).value)}
            placeholder="Type here..."
          />
          <TextareaGroup.Footer>
            <div />
            <div>
              <button type="button" disabled={!value.trim()}>
                Send
              </button>
            </div>
          </TextareaGroup.Footer>
        </TextareaGroup.Root>
        <span style={{ fontSize: 12, color: '#7c7c7c' }}>
          Characters: {value.length}
        </span>
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 400 }}>
      <div>
        <span style={{ fontSize: 12, color: '#7c7c7c', marginBottom: 4, display: 'block' }}>
          Default
        </span>
        <TextareaGroup.Root>
          <TextareaGroup.Textarea placeholder="Write a message..." />
        </TextareaGroup.Root>
      </div>
      <div>
        <span style={{ fontSize: 12, color: '#7c7c7c', marginBottom: 4, display: 'block' }}>
          With Header
        </span>
        <TextareaGroup.Root>
          <TextareaGroup.Header>
            <Chip onDismiss={() => {}}>tag-1</Chip>
            <Chip onDismiss={() => {}}>tag-2</Chip>
          </TextareaGroup.Header>
          <TextareaGroup.Textarea placeholder="Write a message..." />
        </TextareaGroup.Root>
      </div>
      <div>
        <span style={{ fontSize: 12, color: '#7c7c7c', marginBottom: 4, display: 'block' }}>
          Disabled
        </span>
        <TextareaGroup.Root disabled>
          <TextareaGroup.Textarea placeholder="Write a message..." />
        </TextareaGroup.Root>
      </div>
      <div>
        <span style={{ fontSize: 12, color: '#7c7c7c', marginBottom: 4, display: 'block' }}>
          Invalid
        </span>
        <TextareaGroup.Root invalid>
          <TextareaGroup.Textarea defaultValue="Bad content" />
        </TextareaGroup.Root>
      </div>
      <div>
        <span style={{ fontSize: 12, color: '#7c7c7c', marginBottom: 4, display: 'block' }}>
          Max Height (200px)
        </span>
        <TextareaGroup.Root maxHeight={200}>
          <TextareaGroup.Textarea
            defaultValue={'Long content.\n'.repeat(15)}
          />
          <TextareaGroup.Footer>
            <div />
            <div>
              <button type="button">Send</button>
            </div>
          </TextareaGroup.Footer>
        </TextareaGroup.Root>
      </div>
    </div>
  ),
};
