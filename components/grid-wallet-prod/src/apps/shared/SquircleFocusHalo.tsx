/** SVG stroke outside a squircle clip-path — default border, focus tint via CSS. */
export function SquircleFocusHalo({
  path,
  width,
  height,
  className,
}: {
  path: string;
  width: number;
  height: number;
  className?: string;
}) {
  if (!path || width <= 0 || height <= 0) return null;
  return (
    <svg
      className={className}
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <path d={path} />
    </svg>
  );
}
