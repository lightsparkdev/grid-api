import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar.Root,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['16', '20', '24', '32', '40', '48'],
    },
    variant: {
      control: { type: 'select' },
      options: ['squircle', 'circle'],
    },
    color: {
      control: { type: 'select' },
      options: ['blue', 'purple', 'sky', 'pink', 'green', 'yellow', 'red', 'gray'],
    },
  },
} satisfies Meta<typeof Avatar.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: '32',
    variant: 'squircle',
    color: 'blue',
  },
  render: (args) => (
    <Avatar.Root {...args}>
      <Avatar.Fallback>CS</Avatar.Fallback>
    </Avatar.Root>
  ),
};

export const WithImage: Story = {
  args: {
    size: '48',
    variant: 'circle',
  },
  render: (args) => (
    <Avatar.Root {...args}>
      <Avatar.Image
        src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"
        alt="User avatar"
      />
      <Avatar.Fallback>LT</Avatar.Fallback>
    </Avatar.Root>
  ),
};

export const Squircle: Story = {
  args: {
    size: '48',
    variant: 'squircle',
    color: 'blue',
  },
  render: (args) => (
    <Avatar.Root {...args}>
      <Avatar.Fallback>CS</Avatar.Fallback>
    </Avatar.Root>
  ),
};

export const Circle: Story = {
  args: {
    size: '48',
    variant: 'circle',
    color: 'blue',
  },
  render: (args) => (
    <Avatar.Root {...args}>
      <Avatar.Fallback>CS</Avatar.Fallback>
    </Avatar.Root>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Avatar.Root size="16" variant="squircle">
        <Avatar.Fallback>C</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="20" variant="squircle">
        <Avatar.Fallback>C</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="24" variant="squircle">
        <Avatar.Fallback>C</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="32" variant="squircle">
        <Avatar.Fallback>CS</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="40" variant="squircle">
        <Avatar.Fallback>CS</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="48" variant="squircle">
        <Avatar.Fallback>CS</Avatar.Fallback>
      </Avatar.Root>
    </div>
  ),
};

export const AllSizesCircle: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Avatar.Root size="16" variant="circle">
        <Avatar.Fallback>C</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="20" variant="circle">
        <Avatar.Fallback>C</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="24" variant="circle">
        <Avatar.Fallback>C</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="32" variant="circle">
        <Avatar.Fallback>CS</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="40" variant="circle">
        <Avatar.Fallback>CS</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="48" variant="circle">
        <Avatar.Fallback>CS</Avatar.Fallback>
      </Avatar.Root>
    </div>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Avatar.Root size="40" color="blue">
        <Avatar.Fallback>BL</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="40" color="purple">
        <Avatar.Fallback>PU</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="40" color="sky">
        <Avatar.Fallback>SK</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="40" color="pink">
        <Avatar.Fallback>PK</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="40" color="green">
        <Avatar.Fallback>GR</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="40" color="yellow">
        <Avatar.Fallback>YE</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="40" color="red">
        <Avatar.Fallback>RE</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="40" color="gray">
        <Avatar.Fallback>GY</Avatar.Fallback>
      </Avatar.Root>
    </div>
  ),
};

export const ImageWithFallback: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Avatar.Root size="48" variant="circle">
        <Avatar.Image
          src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"
          alt="Valid image"
        />
        <Avatar.Fallback>LT</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="48" variant="circle">
        <Avatar.Image
          src="https://invalid-url.example/broken.jpg"
          alt="Broken image"
        />
        <Avatar.Fallback>FB</Avatar.Fallback>
      </Avatar.Root>
    </div>
  ),
};

export const VariantComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>Squircle</p>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Avatar.Root size="16" variant="squircle">
            <Avatar.Fallback>C</Avatar.Fallback>
          </Avatar.Root>
          <Avatar.Root size="20" variant="squircle">
            <Avatar.Fallback>C</Avatar.Fallback>
          </Avatar.Root>
          <Avatar.Root size="24" variant="squircle">
            <Avatar.Fallback>C</Avatar.Fallback>
          </Avatar.Root>
          <Avatar.Root size="32" variant="squircle">
            <Avatar.Fallback>CS</Avatar.Fallback>
          </Avatar.Root>
          <Avatar.Root size="40" variant="squircle">
            <Avatar.Fallback>CS</Avatar.Fallback>
          </Avatar.Root>
          <Avatar.Root size="48" variant="squircle">
            <Avatar.Fallback>CS</Avatar.Fallback>
          </Avatar.Root>
        </div>
      </div>
      <div>
        <p style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>Circle</p>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Avatar.Root size="16" variant="circle">
            <Avatar.Fallback>C</Avatar.Fallback>
          </Avatar.Root>
          <Avatar.Root size="20" variant="circle">
            <Avatar.Fallback>C</Avatar.Fallback>
          </Avatar.Root>
          <Avatar.Root size="24" variant="circle">
            <Avatar.Fallback>C</Avatar.Fallback>
          </Avatar.Root>
          <Avatar.Root size="32" variant="circle">
            <Avatar.Fallback>CS</Avatar.Fallback>
          </Avatar.Root>
          <Avatar.Root size="40" variant="circle">
            <Avatar.Fallback>CS</Avatar.Fallback>
          </Avatar.Root>
          <Avatar.Root size="48" variant="circle">
            <Avatar.Fallback>CS</Avatar.Fallback>
          </Avatar.Root>
        </div>
      </div>
    </div>
  ),
};
