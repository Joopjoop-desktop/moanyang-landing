/**
 * '직접 정리해 보기' 체험 상태. 히어로 연출과는 완전히 별개입니다.
 *
 * step 0: 메일 넣기 전
 * step 1: 메일 카드 생성 (날짜 없음)
 * step 2: 카톡 카드 생성 (할 일 없음)
 * step 3: 두 카드를 합쳐 캘린더 23일에 표시
 *
 * phase는 단계 사이의 짧은 연출입니다.
 *   feeding — 입력창에 글이 들어가고 고양이가 먹는 중
 *   merging — 합친 카드가 펼쳐져 내용이 채워지는 중
 */

export type TryStep = 0 | 1 | 2 | 3;
export type Method = 'button' | 'drag';

export type TryState = {
  step: TryStep;
  phase: 'idle' | 'feeding' | 'merging';
  /** 리셋할 때마다 바뀌어 카드 애니메이션을 새로 시작하게 합니다 */
  round: number;
};

export type TryAction =
  | { type: 'insertMail' }
  | { type: 'pasteChat' }
  | { type: 'merge' }
  | { type: 'settle' }
  | { type: 'reset' };

export const initialTryState: TryState = { step: 0, phase: 'idle', round: 0 };

export function tryReducer(state: TryState, action: TryAction): TryState {
  switch (action.type) {
    case 'insertMail':
      return state.step === 0 && state.phase === 'idle' ? { ...state, phase: 'feeding' } : state;
    case 'pasteChat':
      return state.step === 1 && state.phase === 'idle' ? { ...state, phase: 'feeding' } : state;
    case 'merge':
      return state.step === 2 && state.phase === 'idle' ? { ...state, phase: 'merging' } : state;
    case 'settle':
      if (state.phase === 'idle') return state;
      return { ...state, step: (state.step + 1) as TryStep, phase: 'idle' };
    case 'reset':
      return { step: 0, phase: 'idle', round: state.round + 1 };
  }
}

/** 지금 입력창에 보이는 글 */
export function inputTextOf(state: TryState, texts: { mail: string; chat: string }) {
  if (state.phase !== 'feeding') return '';
  return state.step === 0 ? texts.mail : texts.chat;
}

export const NEXT_TEXT: Record<TryStep, string> = {
  0: '메일 카드를 오른쪽 모아냥 입력창으로 끌어다 놓거나 ‘메일 내용 넣기’를 누르세요.',
  1: '할 일 카드가 생겼지만 날짜가 없어요. 이제 카톡 메시지를 붙여넣어 보세요.',
  2: '두 카드가 준비됐어요. ‘두 카드 합치기’를 누르거나 날짜 카드를 할 일 카드 위로 끌어다 놓으세요.',
  3: '완성! 할 일과 마감일이 한 카드로 합쳐져 캘린더 10월 23일에 표시됐어요.',
};

/** 터치 화면에서는 끌어다 놓기를 쓰지 않으므로 버튼 안내만 보여줍니다 */
export const NEXT_TEXT_TOUCH: Record<TryStep, string> = {
  ...NEXT_TEXT,
  0: '‘메일 내용 넣기’를 눌러 메일을 모아냥 입력창에 넣어 보세요.',
  2: '두 카드가 준비됐어요. ‘두 카드 합치기’를 눌러 하나로 합쳐 보세요.',
};

export const STEP_LABELS = ['메일 내용 넣기', '카톡 메시지 붙여넣기', '두 카드 합치기'] as const;
