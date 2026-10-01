/** Whether a scroller has room to move by `dy` (any of it) in that direction. */
export function canScrollBy(el: HTMLElement, dy: number): boolean {
  if (dy > 0) return el.scrollTop < el.scrollHeight - el.clientHeight - 0.5;
  if (dy < 0) return el.scrollTop > 0.5;
  return false;
}
