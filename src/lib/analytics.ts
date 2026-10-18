/**
 * 분석 이벤트 진입점.
 *
 * 지금은 어떤 외부 도구에도 보내지 않습니다. 개발 모드에서만 콘솔에 남기고,
 * 같은 내용을 `moanyang:analytics` DOM 이벤트로 내보냅니다.
 * 나중에 분석 SDK를 붙일 때는 `send()` 한 곳만 바꾸면 됩니다.
 *
 * 개인정보(이메일 등)는 이벤트에 담지 않습니다.
 */

type EventMap = {
  hero_animation_play: { source: 'auto' | 'user' };
  try_start: { method: 'button' | 'drag' };
  card_merge_complete: { method: 'button' | 'drag' };
  notify_submit_complete: { os: 'windows' | 'macos'; betaOptIn: boolean };
};

export type AnalyticsEventName = keyof EventMap;

function send<K extends AnalyticsEventName>(name: K, props: EventMap[K]) {
  if (import.meta.env.DEV) {
    console.debug('[analytics]', name, props);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('moanyang:analytics', { detail: { name, props } }));
  }
}

/** 히어로 자동 재생 애니메이션이 재생될 때 (자동 시작 또는 사용자가 재생 버튼을 누름) */
export function trackHeroPlay(source: EventMap['hero_animation_play']['source']) {
  send('hero_animation_play', { source });
}

/** '직접 정리해 보기'에서 첫 단계(메일 넣기)를 실행했을 때 */
export function trackTryStart(method: EventMap['try_start']['method']) {
  send('try_start', { method });
}

/** '직접 정리해 보기'에서 두 카드 합치기를 완료했을 때 */
export function trackMergeComplete(method: EventMap['card_merge_complete']['method']) {
  send('card_merge_complete', { method });
}

/** 출시 알림 신청 폼 제출이 완료됐을 때 (실제 전송 없음) */
export function trackNotifySubmit(props: EventMap['notify_submit_complete']) {
  send('notify_submit_complete', props);
}
