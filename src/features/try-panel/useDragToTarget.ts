import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';

type Options = {
  enabled: boolean;
  /** 놓을 곳 */
  targetRef: RefObject<HTMLElement | null>;
  onDrop: () => void;
};

/**
 * 마우스·펜으로 요소를 끌어 다른 요소 위에 놓는 동작.
 * 터치에서는 화면 스크롤을 막지 않도록 끄고, 버튼으로 진행하게 합니다.
 * 축소된(transform: scale) 화면 안에서도 손가락/커서를 정확히 따라가도록 배율을 보정합니다.
 */
export function useDragToTarget({ enabled, targetRef, onDrop }: Options) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [over, setOver] = useState(false);
  const start = useRef<{ x: number; y: number; scale: number; id: number } | null>(null);
  const overRef = useRef(false);

  const isOverTarget = (clientX: number, clientY: number) => {
    const r = targetRef.current?.getBoundingClientRect();
    if (!r) return false;
    const pad = 12;
    return clientX >= r.left - pad && clientX <= r.right + pad && clientY >= r.top - pad && clientY <= r.bottom + pad;
  };

  const end = useCallback(() => {
    start.current = null;
    overRef.current = false;
    setDragging(false);
    setOver(false);
    setOffset({ x: 0, y: 0 });
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (!enabled || e.pointerType === 'touch' || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, a, input')) return;
    const el = e.currentTarget;
    const scale = el.getBoundingClientRect().width / el.offsetWidth || 1;
    start.current = { x: e.clientX, y: e.clientY, scale, id: e.pointerId };
    el.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!dragging && Math.hypot(dx, dy) < 4) return;
    setDragging(true);
    setOffset({ x: dx / s.scale, y: dy / s.scale });
    const o = isOverTarget(e.clientX, e.clientY);
    if (o !== overRef.current) {
      overRef.current = o;
      setOver(o);
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLElement>) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    const dropped = dragging && isOverTarget(e.clientX, e.clientY);
    end();
    if (dropped) onDrop();
  };

  return {
    offset,
    dragging,
    over,
    bind: enabled
      ? { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: end, onLostPointerCapture: end }
      : {},
  };
}
