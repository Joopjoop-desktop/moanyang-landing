/** 데모 화면에 쓰는 예시 데이터. 실제 사용자 데이터는 없습니다. */

export const mail = {
  sender: '김지현 · 영업기획',
  time: '10/15 09:12',
  subject: '[요청] 고객사 제안서 초안',
  lines: ['고객사 제안서 초안 작성 부탁드립니다.', '제품 소개와 견적을 포함해 주세요.', '마감일은 추후 안내하겠습니다.'],
  /** 사용자가 골라 넣는 부분 (앞의 두 문장) */
  picked: '고객사 제안서 초안 작성 부탁드립니다. 제품 소개와 견적을 포함해 주세요.',
};

export const chat = {
  sender: '박서준 팀장',
  time: '10/19 10:40',
  clock: '오전 10:40',
  text: '제안서 초안 마감은 10월 23일 오후 3시까지 부탁드립니다.',
};

export type TaskTag = 'no-date' | 'no-task';

export type TaskField = { label: string; value: string };

export type Task = {
  id: string;
  title: string;
  time: string;
  tags: TaskTag[];
  fields?: TaskField[];
};

/** 메일에서 만들어진 카드 — 날짜가 없음 */
export const taskFromMail: Task = {
  id: 'mail',
  title: '고객사 제안서 초안 작성',
  time: mail.time,
  tags: ['no-date'],
};

/** 카톡에서 만들어진 카드 — 할 일이 없음 */
export const taskFromChat: Task = {
  id: 'chat',
  title: '제안서 초안 마감',
  time: chat.time,
  tags: ['no-task'],
};

/** 두 카드를 합친 결과 */
export const mergedTask: Task = {
  id: 'mail',
  title: '고객사 제안서 초안 작성',
  time: mail.time,
  tags: [],
  fields: [
    { label: '할 일', value: '고객사 제안서 초안 작성' },
    { label: '마감일', value: '10/23(금) 15:00' },
    { label: '요청자', value: '김지현' },
    { label: '메모', value: '제품 소개, 견적 포함' },
  ],
};

/** 캘린더 23일에 올라가는 일정 이름 */
export const eventTitle = '제안서 초안 작성';

export const tagLabel: Record<TaskTag, string> = {
  'no-date': '날짜 없음',
  'no-task': '할 일 없음',
};
