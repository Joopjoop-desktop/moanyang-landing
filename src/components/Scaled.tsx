import { createContext, useContext, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** 화면에 실제로 그려지는 배율 (중첩된 Scaled의 곱). 드래그 거리 보정에 씁니다. */
const ScaleContext = createContext(1);
export const useScale = () => useContext(ScaleContext);

type Crop = { x: number; y: number; w: number; h: number };

type ScaledProps = {
  /** 디자인 기준 너비(px) */
  baseWidth: number;
  /** 디자인 기준 높이(px). 생략하면 내용 높이를 측정합니다. */
  baseHeight?: number;
  /** 고정 배율. 생략하면 부모 너비에 맞춰 배율을 계산합니다. */
  scale?: number;
  /** 일부 영역만 잘라서 보여줄 때 (기준 좌표) */
  crop?: Crop;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * 고정 크기로 디자인된 화면(서비스 화면, 히어로 무대)을 비율 그대로 축소해 보여줍니다.
 * transform으로 축소하므로 내부 좌표는 Figma 값을 그대로 쓸 수 있습니다.
 */
export function Scaled({ baseWidth, baseHeight, scale, crop, className, style, children }: ScaledProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const parentScale = useScale();
  const [fitScale, setFitScale] = useState(scale ?? 1);
  const [contentHeight, setContentHeight] = useState(baseHeight ?? 0);

  const viewW = crop?.w ?? baseWidth;

  useLayoutEffect(() => {
    if (scale !== undefined) return;
    const el = outerRef.current;
    if (!el) return;
    const update = () => setFitScale(el.clientWidth / viewW);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scale, viewW]);

  useLayoutEffect(() => {
    if (baseHeight !== undefined) return;
    const el = innerRef.current;
    if (!el) return;
    const update = () => setContentHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [baseHeight]);

  const s = scale ?? fitScale;
  const viewH = crop?.h ?? baseHeight ?? contentHeight;

  return (
    <div
      ref={outerRef}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: scale !== undefined ? viewW * s : '100%',
        height: viewH * s,
        ...style,
      }}
    >
      <div
        ref={innerRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: baseWidth,
          height: baseHeight,
          transformOrigin: '0 0',
          transform: `translate(${-(crop?.x ?? 0) * s}px, ${-(crop?.y ?? 0) * s}px) scale(${s})`,
        }}
      >
        <ScaleContext.Provider value={parentScale * s}>{children}</ScaleContext.Provider>
      </div>
    </div>
  );
}
