import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Pagination } from './Pagination';
import { Select } from '../Select';

const meta: Meta = {
  title: 'Components/Pagination',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// Interactive wrapper for controlled pagination
function PaginationDemo({
  initialPage = 1,
  totalItems = 2500,
  initialPageSize = 100,
  showSelect = true,
}: {
  initialPage?: number;
  totalItems?: number;
  initialPageSize?: number;
  showSelect?: boolean;
}) {
  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  return (
    <Pagination.Root
      page={page}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={setPage}
    >
      <Pagination.Label />
      {showSelect && (
        <Select.Root value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
          <Select.Trigger variant="ghost">
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.List>
                  <Select.Item value="10">
                    <Select.ItemText>10</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="25">
                    <Select.ItemText>25</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="50">
                    <Select.ItemText>50</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="100">
                    <Select.ItemText>100</Select.ItemText>
                  </Select.Item>
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      )}
      <Pagination.Range />
      <Pagination.Navigation>
        <Pagination.Previous />
        <Pagination.Next />
      </Pagination.Navigation>
    </Pagination.Root>
  );
}

export const Default: StoryObj = {
  render: () => <PaginationDemo />,
};

export const FirstPage: StoryObj = {
  render: () => <PaginationDemo initialPage={1} />,
};

export const LastPage: StoryObj = {
  render: () => <PaginationDemo initialPage={25} />,
};

export const MiddlePage: StoryObj = {
  render: () => <PaginationDemo initialPage={12} />,
};

export const SinglePage: StoryObj = {
  render: () => <PaginationDemo initialPage={1} totalItems={50} />,
};

export const EmptyState: StoryObj = {
  render: () => <PaginationDemo initialPage={1} totalItems={0} />,
};

export const WithoutSelect: StoryObj = {
  render: () => <PaginationDemo showSelect={false} />,
};

export const SmallPageSize: StoryObj = {
  render: () => <PaginationDemo initialPageSize={10} />,
};
