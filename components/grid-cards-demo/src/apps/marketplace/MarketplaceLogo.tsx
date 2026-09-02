/** Marketplace brand mark — a rounded house outline in the brand coral. Inline
 *  (source: refs/marketplace-app/marketplace-logo.svg) so it scales crisply;
 *  stroke defaults to the brand color but can be overridden via `color`.
 *  Signature matches SkinIcon (size/className) like ZLogo. */
export function MarketplaceLogo({
  size = 78,
  color = '#ff385c',
  className,
}: {
  size?: number | string;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 78 78"
      fill="none"
      className={className}
      role="img"
      aria-label="Logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M30.875 53.6256V65.0006H22.75C17.3652 65.0006 13 60.6356 13 55.2506V34.2501C13 31.1114 14.5109 28.1647 17.0595 26.3329L33.3096 14.6532C36.7097 12.2094 41.2903 12.2094 44.6904 14.6532L60.9404 26.3329C63.4891 28.1647 65 31.1114 65 34.2501V55.2506C65 60.6356 60.6349 65.0006 55.25 65.0006H47.125V53.6256C47.125 49.1384 43.4873 45.5006 39 45.5006C34.5127 45.5006 30.875 49.1384 30.875 53.6256Z"
        stroke={color}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
