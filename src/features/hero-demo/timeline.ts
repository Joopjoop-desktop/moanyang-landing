/**
 * 히어로 자동 재생 연출의 타임라인.
 *
 * Figma 'Hero Demo' 16단계 스토리보드의 순서와 상태를 그대로 따르고,
 * 단계 사이의 움직임(커서 곡선 이동, 선택 영역 늘어남, 카드 끌기)은 시간 t로부터 계산합니다.
 * `frameAt(t)`는 순수 함수라서 일시정지·이동·동작 줄이기 모드에서 같은 결과를 냅니다.
 *
 * 좌표는 모두 히어로 무대 기준(1136 × 607.6)입니다.
 */

import { APP_POINTS } from '../../components/app/MoaNyangApp';

/* ───────── 무대 배치 (Figma 82:3389) ───────── */

export const STAGE = { w: 1136, h: 607.63 } as const;
/** 무대 위 서비스 화면 위치와 배율 (882.38 / 1336) */
export const APP_ON_STAGE = { x: 237.77, y: 26.42, scale: 0.6605 } as const;

const toStage = (p: { x: number; y: number }) => ({
  x: APP_ON_STAGE.x + p.x * APP_ON_STAGE.scale,
  y: APP_ON_STAGE.y + p.y * APP_ON_STAGE.scale,
});

/** 메일 본문 첫 글자 위치와 줄 간격 */
export const MAIL_BODY = { x: 33.02, y: 168.4, lineGap: 23.78, lineHeight: 22.46 } as const;

/* ───────── 장면(자막) ───────── */

export type Scene = { start: number; chapter: number; caption: string };

export const SCENES: Scene[] = [
  { start: 0, chapter: 0, caption: '메일에서 필요한 문장을 드래그해서 선택해요' },
  { start: 3.0, chapter: 0, caption: '선택한 문장을 모아냥 입력창에 끌어다 놓아요' },
  { start: 5.5, chapter: 1, caption: '입력창에 들어가면 고양이가 먹이를 받아요' },
  { start: 7.9, chapter: 1, caption: '잠시 후 할 일 카드가 생겨요. 날짜가 없어 ‘날짜 없음’으로 표시돼요' },
  { start: 10.0, chapter: 2, caption: '며칠 뒤 카톡으로 마감일 연락이 와요' },
  { start: 11.6, chapter: 2, caption: '카톡 메시지는 복사해서' },
  { start: 13.4, chapter: 2, caption: '입력창에 붙여넣고' },
  { start: 15.2, chapter: 2, caption: '먹이주기를 눌러요' },
  { start: 17.4, chapter: 2, caption: '날짜만 담긴 카드는 ‘할 일 없음’으로 표시돼요' },
  { start: 19.2, chapter: 3, caption: '날짜 카드를 할 일 카드 위로 끌어와 합쳐요' },
  { start: 21.4, chapter: 3, caption: '하나로 합쳐지며 빠진 정보가 모두 채워져요' },
  { start: 24.0, chapter: 4, caption: '완성된 일정은 ‘채워 주세요’에서 빠지고 캘린더 23일에 표시돼요' },
];

export const CHAPTER_COUNT = 5;
export const DURATION = 27.6;
/** 반복할 때 0–0.45초는 막이 걷히는 구간이라, 처음 재생은 그 뒤에서 시작합니다 */
export const FIRST_FRAME = 0.45;

/** 각 챕터가 시작하는 시각 */
export const CHAPTER_STARTS = Array.from(
  { length: CHAPTER_COUNT },
  (_, c) => SCENES.find((s) => s.chapter === c)!.start,
);

/** 일시정지 상태에서 챕터를 고르면 보여줄 대표 장면 (챕터가 끝나기 직전) */
export const CHAPTER_POSTERS = CHAPTER_STARTS.map((_, c) =>
  c + 1 < CHAPTER_COUNT ? CHAPTER_STARTS[c + 1] - 0.3 : 25.6,
);

export function sceneIndexAt(t: number) {
  let i = 0;
  for (let k = 0; k < SCENES.length; k++) if (t >= SCENES[k].start) i = k;
  return i;
}

/* ───────── 주요 시각 ───────── */

const T = {
  selStart: 0.6,
  sel1End: 1.5,
  sel2End: 2.4,
  ghostIn: 3.2,
  dragEnd: 5.1,
  drop: 5.3,
  smile1: 5.6,
  eat1: 7.6,
  cardA: 7.9,
  kakaoIn: 10.1,
  rightClick: 12.45,
  copyClick: 13.1,
  pasteHintIn: 14.2,
  pasted: 14.5,
  pasteHintOut: 15.1,
  feedPress: 16.0,
  smile2: 16.15,
  eat2: 17.1,
  cardB: 17.4,
  grab: 19.3,
  receive: 20.1,
  release: 20.9,
  merge: 21.4,
  fillStart: 21.8,
  fillStep: 0.35,
  cardExit: 24.2,
  day23: 24.6,
  fadeOut: 26.9,
} as const;

/* ───────── 보간 도구 ───────── */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const progress = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);

type Pt = { x: number; y: number };

/** A→B를 휘어진 곡선(2차 베지어)으로 잇습니다. bend는 거리 대비 휘는 정도. */
function curve(a: Pt, b: Pt, u: number, bend = 0.18): Pt {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // 진행 방향의 수직 방향으로 제어점을 밀어냅니다
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  const v = 1 - u;
  return { x: v * v * a.x + 2 * v * u * cx + u * u * b.x, y: v * v * a.y + 2 * v * u * cy + u * u * b.y };
}

/* ───────── 프레임 ───────── */

export type Measures = { line1: number; line2: number };

export type CardState = 'hidden' | 'shown' | 'merged' | 'gone';

export type HeroFrame = {
  scene: number;
  chapter: number;
  /** 커서 끝점 (무대 좌표) */
  cursor: Pt & { pressed: boolean };
  /** 메일 두 줄의 선택 진행률 0–1 */
  selection: [number, number];
  ghost: (Pt & { opacity: number; scale: number }) | null;
  inputActive: boolean;
  inputText: string;
  catSmile: boolean;
  feedPressed: boolean;
  cardA: CardState;
  cardB: 'hidden' | 'shown' | 'gone';
  /** 날짜 카드를 끄는 거리 (서비스 화면 좌표) */
  cardBOffset: Pt;
  cardBLifted: boolean;
  cardAReceiving: boolean;
  filled: number;
  /** 카톡 창 등장 진행률 0–1 */
  kakao: number;
  bubbleActive: boolean;
  menu: 'hidden' | 'open' | 'hover';
  pasteHint: boolean;
  day23: boolean;
  count: number;
  /** 반복 전환용 흰 막 0–1 */
  veil: number;
};

const MAIL_TEXT = '고객사 제안서 초안 작성 부탁드립니다. 제품 소개와 견적을 포함해 주세요.';
const CHAT_TEXT = '제안서 초안 마감은 10월 23일 오후 3시까지 부탁드립니다.';

/** 날짜 카드를 할 일 카드 위로 끌어올리는 거리 (카드 높이 + 간격 − 겹침) */
const CARD_B_LIFT = { x: 10, y: -(APP_POINTS.cardHeight + APP_POINTS.cardGap) + 24 };

export function frameAt(t: number, m: Measures): HeroFrame {
  const scene = sceneIndexAt(t);

  /* 메일 선택 */
  const p1 = easeInOut(progress(t, T.selStart, T.sel1End));
  const p2 = easeInOut(progress(t, T.sel1End + 0.05, T.sel2End));
  const selectionOn = t >= T.selStart && t < T.drop;
  const line1Y = MAIL_BODY.y + MAIL_BODY.lineHeight / 2;
  const line2Y = line1Y + MAIL_BODY.lineGap;

  /* 커서가 지나가는 점들 */
  const selStartPt: Pt = { x: MAIL_BODY.x - 1, y: line1Y };
  const selEndPt: Pt = { x: MAIL_BODY.x + m.line2, y: line2Y };
  const dropPt = toStage({ x: APP_POINTS.input.x + 70, y: APP_POINTS.input.y + 44 });
  const idlePt = toStage({ x: 1120, y: 560 });
  const bubblePt: Pt = { x: 193, y: 429 };
  const copyPt: Pt = { x: 236, y: 449 };
  const inputPt = toStage(APP_POINTS.inputText);
  const feedPt = toStage(APP_POINTS.feedBtn);
  const cardBGrab = toStage({ x: APP_POINTS.listTop.x + 150, y: APP_POINTS.listTop.y + 89 + 30 });
  const day23Pt = toStage({ x: APP_POINTS.day23.x + 70, y: APP_POINTS.day23.y + 50 });

  let cursor: Pt;
  if (t < T.selStart) {
    cursor = curve({ x: selStartPt.x + 60, y: selStartPt.y + 40 }, selStartPt, easeOut(progress(t, 0, T.selStart)));
  } else if (t < T.ghostIn) {
    // 선택 영역 끝을 따라갑니다
    if (t < T.sel1End) cursor = { x: MAIL_BODY.x + m.line1 * p1, y: line1Y };
    else {
      const drop = easeOut(clamp01(p2 * 5));
      cursor = { x: lerp(MAIL_BODY.x + m.line1, MAIL_BODY.x, drop) + m.line2 * p2, y: lerp(line1Y, line2Y, drop) };
    }
  } else if (t < T.drop) {
    cursor = curve(selEndPt, dropPt, easeInOut(progress(t, T.ghostIn + 0.2, T.dragEnd)), -0.22);
  } else if (t < 11.6) {
    cursor = curve(dropPt, idlePt, easeInOut(progress(t, T.drop + 0.6, T.drop + 1.8)), 0.1);
  } else if (t < 12.6) {
    cursor = curve(idlePt, bubblePt, easeInOut(progress(t, 11.6, 12.4)), 0.2);
  } else if (t < 13.4) {
    cursor = curve(bubblePt, copyPt, easeInOut(progress(t, 12.6, 12.95)), 0.1);
  } else if (t < 15.2) {
    cursor = curve(copyPt, inputPt, easeInOut(progress(t, 13.4, 14.2)), -0.15);
  } else if (t < 17.6) {
    cursor = curve(inputPt, feedPt, easeInOut(progress(t, 15.2, 15.9)), 0.25);
  } else if (t < T.grab) {
    cursor = curve(feedPt, cardBGrab, easeInOut(progress(t, 18.0, 18.8)), 0.2);
  } else if (t < 24.2) {
    const u = easeInOut(progress(t, T.grab + 0.1, T.release - 0.2));
    cursor = {
      x: cardBGrab.x + CARD_B_LIFT.x * APP_ON_STAGE.scale * u,
      y: cardBGrab.y + CARD_B_LIFT.y * APP_ON_STAGE.scale * u,
    };
  } else {
    const from = {
      x: cardBGrab.x + CARD_B_LIFT.x * APP_ON_STAGE.scale,
      y: cardBGrab.y + CARD_B_LIFT.y * APP_ON_STAGE.scale,
    };
    cursor = curve(from, day23Pt, easeInOut(progress(t, 24.2, 25.1)), -0.18);
  }

  const pressed =
    (t >= T.selStart - 0.05 && t < T.drop) ||
    (t >= T.rightClick && t < T.rightClick + 0.12) ||
    (t >= T.copyClick && t < T.copyClick + 0.12) ||
    (t >= T.feedPress && t < T.feedPress + 0.15) ||
    (t >= T.grab && t < T.release);

  /* 끌고 가는 문장 */
  let ghost: HeroFrame['ghost'] = null;
  if (t >= T.ghostIn && t < T.drop + 0.15) {
    const fadeIn = progress(t, T.ghostIn, T.ghostIn + 0.2);
    const sink = progress(t, T.dragEnd, T.drop + 0.15);
    ghost = { x: cursor.x + 6, y: cursor.y + 10, opacity: fadeIn * (1 - sink), scale: 1 - 0.15 * sink };
  }

  /* 카드 */
  const cardA: CardState = t < T.cardA ? 'hidden' : t < T.merge ? 'shown' : t < T.cardExit ? 'merged' : 'gone';
  const cardB = t < T.cardB ? 'hidden' : t < T.merge ? 'shown' : 'gone';
  const lift = easeInOut(progress(t, T.grab + 0.1, T.release - 0.2));
  const cardBOffset = cardB === 'shown' ? { x: CARD_B_LIFT.x * lift, y: CARD_B_LIFT.y * lift } : { x: 0, y: 0 };
  const count = (cardA === 'shown' || cardA === 'merged' ? 1 : 0) + (cardB === 'shown' ? 1 : 0);

  const menu: HeroFrame['menu'] =
    t >= T.rightClick && t < T.copyClick + 0.15 ? (t >= 12.85 ? 'hover' : 'open') : 'hidden';

  const veil = Math.max(1 - progress(t, 0, 0.45), progress(t, T.fadeOut, DURATION));

  return {
    scene,
    chapter: SCENES[scene].chapter,
    cursor: { ...cursor, pressed },
    selection: selectionOn ? [p1, p2] : [0, 0],
    ghost,
    inputActive: t >= T.dragEnd - 0.25 && t < T.drop + 0.1,
    inputText: t >= T.drop && t < T.eat1 ? MAIL_TEXT : t >= T.pasted && t < T.eat2 ? CHAT_TEXT : '',
    catSmile: (t >= T.smile1 && t < T.cardA) || (t >= T.smile2 && t < T.cardB),
    feedPressed: t >= T.feedPress && t < T.feedPress + 0.15,
    cardA,
    cardB,
    cardBOffset,
    cardBLifted: t >= T.grab && t < T.merge,
    cardAReceiving: t >= T.receive && t < T.merge,
    filled: cardA === 'merged' ? Math.min(4, Math.max(0, Math.floor((t - T.fillStart) / T.fillStep) + 1)) : 0,
    kakao: easeOut(progress(t, T.kakaoIn, T.kakaoIn + 0.5)),
    bubbleActive: t >= T.rightClick && t < T.feedPress,
    menu,
    pasteHint: t >= T.pasteHintIn && t < T.pasteHintOut,
    day23: t >= T.day23,
    count,
    veil,
  };
}
