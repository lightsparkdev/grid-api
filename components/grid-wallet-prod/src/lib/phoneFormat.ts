/** US phone display formatting — shared by the aurora auth sheet and the
 *  classic phone's entry screen. */

/** Digits → "(415) 555-0132", progressively as the user types (max 10). */
export function formatUsPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 10);
  if (d.length === 0) return '';
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** "(415) 555-0132" → "(•••) •••-0132" — last 4 visible. */
export function maskUsPhone(value: string): string {
  const d = value.replace(/\D/g, '');
  return `(•••) •••-${d.slice(-4)}`;
}
