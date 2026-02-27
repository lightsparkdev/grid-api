import type { Meta, StoryObj } from '@storybook/react';
import {
  BasicTable,
  SortableTable,
  SelectableTable,
  AlignedTable,
  LoadingTable,
  ResizableTable,
  CompactTable,
  SlotsTable,
  DescriptionTable,
  FooterTable,
  CompactFooterTable,
} from './Table.test-stories';

const meta: Meta = {
  title: 'Components/Table',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => <BasicTable />,
};

export const Sortable: Story = {
  render: () => <SortableTable />,
  parameters: {
    docs: {
      description: {
        story: 'Click column headers to sort. Columns must opt-in via `enableSorting: true`.',
      },
    },
  },
};

export const Selectable: Story = {
  render: () => <SelectableTable />,
  parameters: {
    docs: {
      description: {
        story: 'Single row selection with checkboxes.',
      },
    },
  },
};

export const Aligned: Story = {
  render: () => <AlignedTable />,
  parameters: {
    docs: {
      description: {
        story: 'Right-aligned columns using column meta.',
      },
    },
  },
};

export const Loading: Story = {
  render: () => <LoadingTable />,
  parameters: {
    docs: {
      description: {
        story: 'Per-cell loading state with skeleton placeholder.',
      },
    },
  },
};

export const Resizable: Story = {
  render: () => <ResizableTable />,
  parameters: {
    docs: {
      description: {
        story: 'Drag column borders to resize.',
      },
    },
  },
};

export const Compact: Story = {
  render: () => <CompactTable />,
  parameters: {
    docs: {
      description: {
        story: 'Compact density with shorter row heights (header 32px, cell 36px).',
      },
    },
  },
};

export const WithSlots: Story = {
  render: () => <SlotsTable />,
  parameters: {
    docs: {
      description: {
        story: 'Cells with leading and trailing slots for icons, status dots, and action buttons.',
      },
    },
  },
};

export const WithDescription: Story = {
  render: () => <DescriptionTable />,
  parameters: {
    docs: {
      description: {
        story: 'Cells with primary label and secondary description text.',
      },
    },
  },
};

export const WithFooter: Story = {
  render: () => <FooterTable />,
  parameters: {
    docs: {
      description: {
        story: 'Table with an inline footer for pagination or summary content.',
      },
    },
  },
};

export const CompactWithFooter: Story = {
  render: () => <CompactFooterTable />,
  parameters: {
    docs: {
      description: {
        story: 'Compact density table with a compact footer.',
      },
    },
  },
};
