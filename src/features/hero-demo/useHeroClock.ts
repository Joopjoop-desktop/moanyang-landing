import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useReducedMotion } from 'motion/react';
import { trackHeroPlay } from '../../lib/analytics';
import { CHAPTER_POSTERS, CHAPTER_STARTS, DURATION, FIRST_FRAME } from './timeline';

/**
 * 히어로 연출의 재생 시계.
 * - 사용자가 멈춘 상태(userPaused)와, 화면 밖·탭 숨김으로 잠시 멈춘 상태를 따로 관리합니다.
 * - 동작 줄이기 설정이면 자동 재생하지 않고 결과 장면을 보여줍니다. 재생 버튼으로는 볼 수 있습니다.
 * - 체험 패널과 상태를 공유하지 않습니다.
 */
/** 개발 모드 전용: `?hero-t=12.5` 로 특정 시각에 멈춘 화면을 확인합니다 */
function debugTime(): number | null {
  if (!import.meta.env.DEV || typeof location === 'undefined') return null;
  const v = new URLSearchParams(location.search).get('hero-t');
  return v === null ? null : Number(v);
}

export function useHeroClock(targetRef: RefObject<HTMLElement | null>) {
  const reduceMotion = useReducedMotion() ?? false;
  const fixedT = debugTime();
  // 처음에는 반복 전환용 막(veil)이 걷힌 시점에서 시작합니다
  const [t, setT] = useState(
    () => fixedT ?? (reduceMotion ? CHAPTER_POSTERS[CHAPTER_POSTERS.length - 1] : FIRST_FRAME),
  );
  const [userPaused, setUserPaused] = useState(reduceMotion || fixedT !== null);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const tRef = useRef(t);
  const autoTracked = useRef(false);

  // 동작 줄이기 설정이 바뀌면 그에 맞춰 멈추거나 재생합니다
  useEffect(() => {
    if (reduceMotion) {
      setUserPaused(true);
      tRef.current = CHAPTER_POSTERS[CHAPTER_POSTERS.length - 1];
      setT(tRef.current);
    }
  }, [reduceMotion]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [targetRef]);

  useEffect(() => {
    const onVis = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const playing = !userPaused && inView && pageVisible;

  useEffect(() => {
    if (playing && !autoTracked.current) {
      autoTracked.current = true;
      trackHeroPlay('auto');
    }
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      tRef.current = (tRef.current + dt) % DURATION;
      setT(tRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const play = useCallback(() => {
    autoTracked.current = true;
    setUserPaused(false);
    trackHeroPlay('user');
  }, []);

  const pause = useCallback(() => setUserPaused(true), []);

  /** 챕터로 이동. 재생 중이면 챕터 처음부터, 멈춰 있으면 챕터의 대표 장면을 보여줍니다. */
  const goToChapter = useCallback(
    (chapter: number) => {
      tRef.current = userPaused ? CHAPTER_POSTERS[chapter] : CHAPTER_STARTS[chapter];
      setT(tRef.current);
    },
    [userPaused],
  );

  return { t, playing, userPaused, reduceMotion, play, pause, goToChapter };
}
