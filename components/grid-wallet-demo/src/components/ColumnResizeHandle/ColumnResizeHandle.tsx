import styles from './ColumnResizeHandle.module.scss';

interface ColumnResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export function ColumnResizeHandle({ onMouseDown }: ColumnResizeHandleProps) {
  return (
    <div
      className={styles.handle}
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize columns"
    />
  );
}
