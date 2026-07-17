/** The docs' theme-switcher glyphs, verbatim (16-grid, 1.5 stroke): system
 *  and sun are extracted from Mintlify's own component, the crescent moon is
 *  the classic one the docs restore over Mintlify's stock Lucide moon. Used
 *  in EMBED mode only, so the footer toggle is pixel-identical to the docs'
 *  sidebar switcher; the standalone flow builder keeps its central-icons set.
 */

interface IconProps {
  size?: number;
}

export function DocsSystemIcon({ size = 12 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5.11133 14.4444C5.78511 14.232 6.78066 14 8.00022 14C8.70688 14 9.72555 14.0782 10.8891 14.4444" />
      <path d="M8 11.7778V14.0001" />
      <path d="M12.6668 2.44434H3.33344C2.3516 2.44434 1.55566 3.24027 1.55566 4.22211V9.99989C1.55566 10.9817 2.3516 11.7777 3.33344 11.7777H12.6668C13.6486 11.7777 14.4446 10.9817 14.4446 9.99989V4.22211C14.4446 3.24027 13.6486 2.44434 12.6668 2.44434Z" />
    </svg>
  );
}

export function DocsSunIcon({ size = 12 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 1.11133V2.00022" />
      <path d="M12.8711 3.12891L12.2427 3.75735" />
      <path d="M14.8889 8H14" />
      <path d="M12.8711 12.8711L12.2427 12.2427" />
      <path d="M8 14.8889V14" />
      <path d="M3.12891 12.8711L3.75735 12.2427" />
      <path d="M1.11133 8H2.00022" />
      <path d="M3.12891 3.12891L3.75735 3.75735" />
      <path d="M8.00043 11.7782C10.0868 11.7782 11.7782 10.0868 11.7782 8.00043C11.7782 5.91402 10.0868 4.22266 8.00043 4.22266C5.91402 4.22266 4.22266 5.91402 4.22266 8.00043C4.22266 10.0868 5.91402 11.7782 8.00043 11.7782Z" />
    </svg>
  );
}

export function DocsMoonIcon({ size = 12 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.5556 10.4445C8.48717 10.4445 6.00005 7.95743 6.00005 4.88899C6.00005 3.68721 6.38494 2.57877 7.03294 1.66943C4.04272 2.22766 1.77783 4.84721 1.77783 8.0001C1.77783 11.5592 4.66317 14.4445 8.22228 14.4445C11.2196 14.4445 13.7316 12.3948 14.4525 9.62321C13.6081 10.1414 12.6187 10.4445 11.5556 10.4445Z" />
    </svg>
  );
}
