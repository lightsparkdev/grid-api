import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs } from './index';

const meta: Meta = {
  title: 'Components/Tabs',
  component: Tabs.Root,
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <Tabs.Root defaultValue="account">
      <Tabs.List>
        <Tabs.Indicator />
        <Tabs.Tab value="account">Account</Tabs.Tab>
        <Tabs.Tab value="password">Password</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="account">
        Manage your account settings and preferences.
      </Tabs.Panel>
      <Tabs.Panel value="password">
        Change your password and security options.
      </Tabs.Panel>
      <Tabs.Panel value="settings">
        Configure application settings.
      </Tabs.Panel>
    </Tabs.Root>
  ),
};

export const Minimal: StoryObj = {
  render: () => (
    <Tabs.Root defaultValue="tab1">
      <Tabs.List variant="minimal">
        <Tabs.Indicator />
        <Tabs.Tab value="tab1">Overview</Tabs.Tab>
        <Tabs.Tab value="tab2">Details</Tabs.Tab>
        <Tabs.Tab value="tab3">History</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="tab1">
        Overview content without container background.
      </Tabs.Panel>
      <Tabs.Panel value="tab2">
        Details content.
      </Tabs.Panel>
      <Tabs.Panel value="tab3">
        History content.
      </Tabs.Panel>
    </Tabs.Root>
  ),
};

export const WithDisabled: StoryObj = {
  render: () => (
    <Tabs.Root defaultValue="active">
      <Tabs.List>
        <Tabs.Indicator />
        <Tabs.Tab value="active">Active</Tabs.Tab>
        <Tabs.Tab value="disabled" disabled>Disabled</Tabs.Tab>
        <Tabs.Tab value="another">Another</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="active">
        This tab is active.
      </Tabs.Panel>
      <Tabs.Panel value="disabled">
        This panel cannot be accessed.
      </Tabs.Panel>
      <Tabs.Panel value="another">
        Another tab content.
      </Tabs.Panel>
    </Tabs.Root>
  ),
};

export const Controlled: StoryObj = {
  render: function Render() {
    const [value, setValue] = useState<string | number | null>('first');

    return (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          Active tab: {value}
        </div>
        <Tabs.Root value={value} onValueChange={setValue}>
          <Tabs.List>
            <Tabs.Indicator />
            <Tabs.Tab value="first">First</Tabs.Tab>
            <Tabs.Tab value="second">Second</Tabs.Tab>
            <Tabs.Tab value="third">Third</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="first">
            First panel content.
          </Tabs.Panel>
          <Tabs.Panel value="second">
            Second panel content.
          </Tabs.Panel>
          <Tabs.Panel value="third">
            Third panel content.
          </Tabs.Panel>
        </Tabs.Root>
      </div>
    );
  },
};
