/** Z brand mark — inline so it inherits `currentColor` (flips black in light /
 *  white in dark via the surrounding text color). Source:
 *  refs/social-platform/logo-z.svg. Signature matches SkinIcon (size/className)
 *  so it can also drop into the decorative tab bar. */
export function ZLogo({
  size = 24,
  className,
}: {
  size?: number | string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 192"
      fill="none"
      className={className}
      role="img"
      aria-label="Z"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M199.706 0L81.2584 172.382H181.649L197.788 191.142H0L72.8104 85.1799H72.8065L118.074 19.3031H24.3851L7.77817 0H199.706ZM35.775 172.382H57.0496L103.738 105.602V105.598L164.068 19.3031H142.793L35.775 172.382Z"
        fill="currentColor"
      />
    </svg>
  );
}
