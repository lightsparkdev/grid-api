// Circular country flag (circle-flags, vendored in public/assets/flags via
// `npm run fetch:flags`). The SVGs are already circular, so this is just a
// sized <img>; `code` is an ISO 3166-1 alpha-2 lowercase code (e.g. "mx").

interface FlagProps {
  code: string;
  size?: number;
  className?: string;
}

export function Flag({ code, size = 24, className }: FlagProps) {
  return (
    <img
      className={className}
      src={`/assets/flags/${code}.svg`}
      alt=""
      width={size}
      height={size}
      draggable={false}
    />
  );
}
