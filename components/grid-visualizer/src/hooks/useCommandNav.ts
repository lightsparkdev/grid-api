import { useEffect } from 'react';

/**
 * Unified keyboard ↔ mouse highlight management for the Command modal.
 *
 * base-ui's Autocomplete keeps keyboard and mouse highlights on separate
 * tracks. This hook takes over `data-highlighted` so hovering an item
 * with the mouse updates the starting position for arrow-key navigation,
 * and vice-versa — only one item is ever highlighted.
 */
export function useCommandNav(open: boolean) {
  useEffect(() => {
    if (!open) return;

    const getDialog = () =>
      document.querySelector<HTMLElement>('[role="dialog"]');

    const getOptions = (): HTMLElement[] => {
      const dialog = getDialog();
      if (!dialog) return [];
      return Array.from(
        dialog.querySelectorAll<HTMLElement>('[role="option"]:not([hidden])'),
      );
    };

    let highlighted: HTMLElement | null = null;

    const setHighlight = (el: HTMLElement | null) => {
      getOptions().forEach((o) => o.removeAttribute('data-highlighted'));
      highlighted = el;
      if (el) {
        el.setAttribute('data-highlighted', '');
        el.scrollIntoView({ block: 'nearest' });
      }
    };

    const move = (delta: number) => {
      const opts = getOptions();
      if (!opts.length) return;
      const cur = highlighted ? opts.indexOf(highlighted) : -1;
      const next =
        cur === -1
          ? delta > 0
            ? 0
            : opts.length - 1
          : Math.max(0, Math.min(cur + delta, opts.length - 1));
      setHighlight(opts[next]);
    };

    // Intercept arrow / enter so base-ui never sees them — we own the highlight.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        move(e.key === 'ArrowDown' ? 1 : -1);
        getDialog()?.setAttribute('data-keyboard-nav', '');
      } else if (e.key === 'Enter' && highlighted) {
        e.preventDefault();
        e.stopPropagation();
        highlighted.click();
      }
    };

    // Mouse enters an option → update tracked position, switch to mouse mode.
    const onPointerOver = (e: Event) => {
      const option = (e.target as HTMLElement).closest?.(
        '[role="option"]',
      ) as HTMLElement | null;
      if (option && getDialog()?.contains(option)) {
        getOptions().forEach((o) => o.removeAttribute('data-highlighted'));
        highlighted = option;
        getDialog()?.removeAttribute('data-keyboard-nav');
      }
    };

    // Any mouse movement inside the dialog exits keyboard mode.
    const onMouseMove = (e: MouseEvent) => {
      const dialog = getDialog();
      if (dialog?.contains(e.target as Node)) {
        dialog.removeAttribute('data-keyboard-nav');
      }
    };

    // When the list re-renders (search filtering), reset highlight if needed.
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => {
        const opts = getOptions();
        if (opts.length && (!highlighted || !opts.includes(highlighted))) {
          setHighlight(opts[0]);
        }
      });
    });

    // Wait one frame for the portal to mount before attaching the observer.
    requestAnimationFrame(() => {
      const listbox = getDialog()?.querySelector('[role="listbox"]');
      if (listbox) {
        observer.observe(listbox, { childList: true, subtree: true });
      }
      const opts = getOptions();
      if (opts.length) setHighlight(opts[0]);
    });

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerover', onPointerOver, true);
    document.addEventListener('mousemove', onMouseMove, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerover', onPointerOver, true);
      document.removeEventListener('mousemove', onMouseMove, true);
      observer.disconnect();
    };
  }, [open]);
}
