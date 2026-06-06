'use client';

import { useCallback, useRef, useState } from 'react';

interface DragOffset {
  x: number;
  y: number;
}

export function usePhoneDrag(enabled: boolean) {
  const [offset, setOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      drag.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        originX: offset.x,
        originY: offset.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [enabled, offset.x, offset.y],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled || !drag.current.active) return;
      setOffset({
        x: drag.current.originX + (e.clientX - drag.current.startX),
        y: drag.current.originY + (e.clientY - drag.current.startY),
      });
    },
    [enabled],
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  return {
    offset,
    dragHandlers: enabled
      ? {
          onPointerDown,
          onPointerMove,
          onPointerUp: endDrag,
          onPointerCancel: endDrag,
        }
      : {},
  };
}
