import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';

type Options = {
  enabled: boolean;
  /** 놓을 곳 */
  targetRef: RefObject<HTMLElement | null>;
  onDrop: () => void;
  /** 목표 위에 놓았을 때 놓은 자리에 그대로 둘지 (사라지는 카드용). 기본은 제자리로 돌아감 */
  keepOffsetOnDrop?: boolean;
};

/**
 * 마우스·펜으로 요소를 끌어 다른 요소 위에 놓는 동작.
 * 터치에서는 화면 스크롤을 막지 않도록 끄고, 버튼으로 진행하게 합니다.
 * 축소된(transform: scale) 화면 안에서도 손가락/커서를 정확히 따라가도록 배율을 보정합니다.
 */
export function useDragToTarget({ enabled, targetRef, onDrop, keepOffsetOnDrop = false }: Options) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [over, setOver] = useState(false);
  /** 마지막 드래그가 목표 위에 놓였는지 */
  const [dropped, setDropped] = useState(false);
  const start = useRef<{ x: number; y: number; scale: number; id: number } | null>(null);
  const overRef = useRef(false);

  const isOverTarget = (clientX: number, clientY: number) => {
    const r = targetRef.current?.getBoundingClientRect();
    if (!r) return false;
    const pad = 12;
    return clientX >= r.left - pad && clientX <= r.right + pad && clientY >= r.top - pad && clientY <= r.bottom + pad;
  };

  const end = useCallback((keepOffset = false) => {
    start.current = null;
    overRef.current = false;
    setDragging(false);
    setOver(false);
    if (!keepOffset) setOffset({ x: 0, y: 0 });
  }, []);

  // pointerup 뒤에도 lostpointercapture가 한 번 더 오므로, 아직 끄는 중일 때만 정리합니다
  const cancel = () => {
    if (start.current) end();
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (!enabled || e.pointerType === 'touch' || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, a, input')) return;
    const el = e.currentTarget;
    const scale = el.getBoundingClientRect().width / el.offsetWidth || 1;
    start.current = { x: e.clientX, y: e.clientY, scale, id: e.pointerId };
    setDropped(false);
    setOffset({ x: 0, y: 0 });
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
    setDropped(dropped);
    end(dropped && keepOffsetOnDrop);
    if (dropped) onDrop();
  };

  return {
    offset,
    dragging,
    over,
    dropped,
    bind: enabled
      ? { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: cancel, onLostPointerCapture: cancel }
      : {},
  };
}
