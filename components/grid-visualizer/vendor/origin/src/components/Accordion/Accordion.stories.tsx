import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Accordion } from './index';

const meta: Meta = {
  title: 'Components/Accordion',
  component: Accordion.Root,
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <Accordion.Root defaultValue={['item-1']}>
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>
            What is Base UI?
            <Accordion.Icon />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          Base UI is an unstyled component library for building accessible web applications.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>
            How does it work?
            <Accordion.Icon />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          It provides behavior and accessibility while you bring your own styles.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Header>
          <Accordion.Trigger>
            Is it accessible?
            <Accordion.Icon />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          Yes, all components follow WAI-ARIA patterns.
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  ),
};

export const Multiple: StoryObj = {
  render: () => (
    <Accordion.Root multiple>
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>
            First
            <Accordion.Icon />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Multiple items can be open.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>
            Second
            <Accordion.Icon />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>This stays open when others open.</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  ),
};

export const Controlled: StoryObj = {
  render: function Render() {
    const [value, setValue] = useState<string[]>(['item-1']);

    return (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          Open items: {value.join(', ') || 'none'}
        </div>
        <Accordion.Root value={value} onValueChange={setValue}>
          <Accordion.Item value="item-1">
            <Accordion.Header>
              <Accordion.Trigger>
                Controlled Item 1
                <Accordion.Icon />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>Content for item 1.</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="item-2">
            <Accordion.Header>
              <Accordion.Trigger>
                Controlled Item 2
                <Accordion.Icon />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>Content for item 2.</Accordion.Panel>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    );
  },
};

