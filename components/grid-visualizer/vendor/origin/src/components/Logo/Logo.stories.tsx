import type { Meta, StoryObj } from '@storybook/react';
import { Logo } from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Components/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    brand: {
      control: 'select',
      options: ['lightspark', 'grid'],
    },
    variant: {
      control: 'select',
      options: ['logo', 'logomark', 'wordmark'],
    },
    weight: {
      control: 'select',
      options: ['regular', 'light'],
    },
    height: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  args: {
    'aria-label': 'Lightspark',
  },
};

export const LogoVariant: Story = {
  args: {
    variant: 'logo',
    weight: 'regular',
    'aria-label': 'Lightspark',
  },
};

export const LogoLight: Story = {
  args: {
    variant: 'logo',
    weight: 'light',
    'aria-label': 'Lightspark',
  },
};

export const Logomark: Story = {
  args: {
    variant: 'logomark',
    weight: 'regular',
    'aria-label': 'Lightspark',
  },
};

export const LogomarkLight: Story = {
  args: {
    variant: 'logomark',
    weight: 'light',
    'aria-label': 'Lightspark',
  },
};

export const Wordmark: Story = {
  args: {
    variant: 'wordmark',
    'aria-label': 'Lightspark',
  },
};

export const CustomHeight: Story = {
  args: {
    height: 40,
    'aria-label': 'Lightspark',
  },
};

export const GridLogo: Story = {
  args: {
    brand: 'grid',
    variant: 'logo',
    'aria-label': 'Grid',
  },
};

export const GridLogomark: Story = {
  args: {
    brand: 'grid',
    variant: 'logomark',
    'aria-label': 'Grid',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
      <Logo variant="logo" weight="regular" aria-label="Lightspark logo regular" />
      <Logo variant="logo" weight="light" aria-label="Lightspark logo light" />
      <Logo variant="logomark" weight="regular" aria-label="Lightspark logomark regular" />
      <Logo variant="logomark" weight="light" aria-label="Lightspark logomark light" />
      <Logo variant="wordmark" aria-label="Lightspark wordmark" />
      <Logo brand="grid" variant="logo" aria-label="Grid logo" />
      <Logo brand="grid" variant="logomark" aria-label="Grid logomark" />
    </div>
  ),
};
