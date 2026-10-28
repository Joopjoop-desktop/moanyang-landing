import { useSyncExternalStore } from 'react';

/** CSS 미디어 쿼리가 맞는지 여부 (바뀌면 다시 그립니다) */
export function useMedia(query: string) {
  const mq = typeof window !== 'undefined' ? window.matchMedia(query) : null;
  return useSyncExternalStore(
    (cb) => {
      mq?.addEventListener('change', cb);
      return () => mq?.removeEventListener('change', cb);
    },
    () => mq?.matches ?? false,
    () => false,
  );
}
