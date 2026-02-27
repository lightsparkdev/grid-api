// Origin Design System - Barrel Export
// This file exports all components for use as a package

// Compound components (namespace exports)
export { Accordion } from './components/Accordion';
export { AlertDialog } from './components/AlertDialog';
export { Autocomplete } from './components/Autocomplete';
export { Breadcrumb } from './components/Breadcrumb';
export { Card } from './components/Card';
export { Checkbox } from './components/Checkbox';
export { Command } from './components/Command';
export { Combobox } from './components/Combobox';
export { ContextMenu } from './components/ContextMenu';
export { Dialog } from './components/Dialog';
export { Field } from './components/Field';
export { Fieldset } from './components/Fieldset';
export type { FieldsetRootProps, FieldsetLegendProps, FieldsetErrorProps } from './components/Fieldset';
export { InputGroup } from './components/InputGroup';
export type {
  InputGroupRootProps,
  InputGroupAddonProps,
  InputGroupCapProps,
  InputGroupInputProps,
  InputGroupButtonProps,
  InputGroupSelectTriggerProps,
  InputGroupTextProps,
} from './components/InputGroup';
export { Menu } from './components/Menu';
export { Menubar } from './components/Menubar';
export { Meter } from './components/Meter';
export { NavigationMenu } from './components/NavigationMenu';
export { Pagination } from './components/Pagination';
export { PhoneInput } from './components/PhoneInput';
export { Progress } from './components/Progress';
export { Radio } from './components/Radio';
export { Select } from './components/Select';
export { Sidebar } from './components/Sidebar';
export { Table } from './components/Table';
export { Tabs } from './components/Tabs';
export { Toast } from './components/Toast';
export { Tooltip } from './components/Tooltip';
export { Popover } from './components/Popover';
export type {
  PopoverRootProps,
  PopoverTriggerProps,
  PopoverPortalProps,
  PopoverPositionerProps,
  PopoverPopupProps,
  PopoverBackdropProps,
  PopoverViewportProps,
  PopoverArrowProps,
  PopoverCloseProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
} from './components/Popover';

// Chart
export * as Chart from './components/Chart';
export type { LineChartProps as ChartLineProps, Series as ChartSeries } from './components/Chart';

// Simple components (direct exports)
export { ActionBar, ActionBarLabel, ActionBarActions } from './components/ActionBar';
export type { ActionBarProps, ActionBarLabelProps, ActionBarActionsProps } from './components/ActionBar';

export { Alert, type AlertProps } from './components/Alert';

export {
  Avatar,
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
  type AvatarRootProps,
  type AvatarImageProps,
  type AvatarFallbackProps,
  type AvatarSize,
  type AvatarVariant,
  type AvatarColor,
} from './components/Avatar';

export { Badge, type BadgeProps, type BadgeVariant } from './components/Badge';

export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { ButtonGroup } from './components/ButtonGroup';
export type { ButtonGroupProps } from './components/ButtonGroup';

export { Chip, ChipFilter } from './components/Chip';
export type { ChipProps, ChipFilterProps } from './components/Chip';

export { Form } from './components/Form';
export type { FormProps } from './components/Form';

export { CentralIcon } from './components/Icon';
export type { CentralIconName, CentralIconProps } from './components/Icon';

export { Input, type InputProps } from './components/Input';

export { Item, type ItemProps } from './components/Item';

export { Logo } from './components/Logo';
export type { LogoProps } from './components/Logo';

export { Loader } from './components/Loader';
export type { LoaderProps } from './components/Loader';

export { Separator } from './components/Separator';
export type { SeparatorProps } from './components/Separator';

export { Shortcut, type ShortcutProps } from './components/Shortcut';

export { Switch } from './components/Switch';
export type { SwitchProps } from './components/Switch';

export { Toggle, ToggleGroup } from './components/Toggle';
export type { ToggleProps, ToggleGroupProps } from './components/Toggle';

export { Textarea, type TextareaProps } from './components/Textarea';

export { VisuallyHidden } from './components/VisuallyHidden';
export type { VisuallyHiddenProps } from './components/VisuallyHidden';

export { TextareaGroup } from './components/TextareaGroup';
export type {
  TextareaGroupRootProps,
  TextareaGroupHeaderProps,
  TextareaGroupTextareaProps,
  TextareaGroupFooterProps,
} from './components/TextareaGroup';
