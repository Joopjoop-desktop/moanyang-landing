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
import type { CatMood } from '../../components/app/CatFace';

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
  { start: 2.6, chapter: 0, caption: '선택한 문장을 모아냥 입력창에 끌어다 놓아요' },
  { start: 4.75, chapter: 1, caption: '놓는 순간 고양이가 먹이를 받고 할 일 카드가 바로 생겨요' },
  { start: 6.0, chapter: 1, caption: '날짜가 없어서 ‘날짜 없음’으로 표시돼요' },
  { start: 8.0, chapter: 2, caption: '며칠 뒤 카톡으로 마감일 연락이 와요' },
  { start: 9.6, chapter: 2, caption: '카톡 메시지는 복사해서' },
  { start: 11.4, chapter: 2, caption: '입력창에 붙여넣고' },
  { start: 13.2, chapter: 2, caption: '먹이주기를 눌러요' },
  { start: 15.4, chapter: 2, caption: '날짜만 담긴 카드는 ‘할 일 없음’으로 표시돼요' },
  { start: 17.2, chapter: 3, caption: '날짜 카드를 할 일 카드 위로 끌어와 합쳐요' },
  { start: 19.4, chapter: 3, caption: '하나로 합쳐지며 빠진 정보가 모두 채워져요' },
  { start: 22.0, chapter: 4, caption: '완성된 일정은 ‘채워 주세요’에서 빠지고 캘린더 23일에 표시돼요' },
];

export const CHAPTER_COUNT = 5;
export const DURATION = 25.6;
/** 반복할 때 0–0.45초는 막이 걷히는 구간이라, 처음 재생은 그 뒤에서 시작합니다 */
export const FIRST_FRAME = 0.45;

/** 각 챕터가 시작하는 시각 */
export const CHAPTER_STARTS = Array.from(
  { length: CHAPTER_COUNT },
  (_, c) => SCENES.find((s) => s.chapter === c)!.start,
);

/** 일시정지 상태에서 챕터를 고르면 보여줄 대표 장면 (챕터가 끝나기 직전) */
export const CHAPTER_POSTERS = CHAPTER_STARTS.map((_, c) =>
  c + 1 < CHAPTER_COUNT ? CHAPTER_STARTS[c + 1] - 0.3 : 23.6,
);

export function sceneIndexAt(t: number) {
  let i = 0;
  for (let k = 0; k < SCENES.length; k++) if (t >= SCENES[k].start) i = k;
  return i;
}

/* ───────── 주요 시각 ───────── */

const T = {
  /* 메일 문장 선택 — 한 번의 드래그로 두 줄을 선택합니다 */
  selStart: 0.6,
  selEnd: 2.3,
  /* 선택한 문장을 끌어서 입력창에 놓기 */
  ghostIn: 2.75,
  dragStart: 2.95,
  dragEnd: 4.55,
  drop: 4.75,
  /* 끌어다 놓으면 바로 먹이를 받고 카드가 됩니다 (입력창에 글이 머물지 않음) */
  cardA: 4.95,
  idleMove: 5.2,
  /* 카톡 */
  kakaoIn: 8.1,
  toBubble: 9.6,
  rightClick: 10.45,
  menuHover: 10.85,
  copyClick: 11.1,
  toInput: 11.4,
  pasteHintIn: 12.2,
  pasted: 12.5,
  pasteHintOut: 13.1,
  toFeed: 13.2,
  feedPress: 14.0,
  eat2: 15.1,
  cardB: 15.4,
  /* 합치기 */
  toCardB: 16.0,
  grab: 17.3,
  receive: 18.1,
  release: 18.9,
  merge: 19.4,
  fillStart: 19.8,
  fillStep: 0.35,
  cardExit: 22.2,
  day23: 22.6,
  fadeOut: 24.9,
} as const;

/* ───────── 보간 도구 ───────── */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const progress = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
/** 시작과 끝만 살짝 부드럽고 가운데는 거의 일정한 속도 (사람이 끄는 느낌) */
const easeInOutSoft = (u: number) => u - Math.sin(2 * Math.PI * u) / (2 * Math.PI) * 0.6;

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
  catMood: CatMood;
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

/** 끌고 가는 문장 상자에서 커서가 잡고 있는 지점 (상자 왼쪽 위 기준) */
const GHOST_GRIP = { x: -14, y: -8 };

/**
 * 메일 선택 드래그의 커서 경로.
 * 첫 줄 끝까지 오른쪽으로 간 뒤 둘째 줄 끝으로 내려갑니다.
 * u(0–1)를 경로 길이에 맞춰 나눠서 속도가 일정하게 유지됩니다.
 */
function selectionPath(u: number, start: Pt, end: Pt, line1Width: number): Pt {
  const corner = { x: start.x + line1Width, y: start.y };
  const lenA = line1Width;
  const lenB = Math.hypot(end.x - corner.x, end.y - corner.y);
  const s = u * (lenA + lenB);
  if (s <= lenA) return { x: start.x + s, y: start.y };
  return curve(corner, end, (s - lenA) / lenB, 0.25);
}

/** 커서 위치로 선택 영역을 계산합니다 (실제 텍스트 선택처럼) */
function selectionFromCursor(c: Pt, line1Y: number, line2Y: number, m: Measures): [number, number] {
  const onLine2 = c.y >= (line1Y + line2Y) / 2;
  const fromLeft = c.x - MAIL_BODY.x;
  if (!onLine2) return [clamp01(fromLeft / m.line1), 0];
  return [1, clamp01(fromLeft / m.line2)];
}

const CHAT_TEXT = '제안서 초안 마감은 10월 23일 오후 3시까지 부탁드립니다.';

/** 날짜 카드를 할 일 카드 위로 끌어올리는 거리 (카드 높이 + 간격 − 겹침) */
const CARD_B_LIFT = { x: 10, y: -(APP_POINTS.cardHeight + APP_POINTS.cardGap) + 24 };

export function frameAt(t: number, m: Measures): HeroFrame {
  const scene = sceneIndexAt(t);

  /* 메일 선택: 커서가 한 번에 움직이고, 선택 영역은 커서 위치에서 계산합니다 */
  const line1Y = MAIL_BODY.y + MAIL_BODY.lineHeight / 2;
  const line2Y = line1Y + MAIL_BODY.lineGap;
  const selStartPt: Pt = { x: MAIL_BODY.x - 1, y: line1Y };
  const selEndPt: Pt = { x: MAIL_BODY.x + m.line2, y: line2Y };
  const selectionOn = t >= T.selStart && t < T.drop;
  const selCursor = selectionPath(easeInOut(progress(t, T.selStart, T.selEnd)), selStartPt, selEndPt, m.line1);
  const selection = selectionFromCursor(selCursor, line1Y, line2Y, m);

  /* 커서가 지나가는 점들 */
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
  } else if (t < T.dragStart) {
    cursor = selCursor;
  } else if (t < T.drop) {
    // 끄는 동안은 처음부터 끝까지 같은 곡선 위를 고르게 움직입니다
    cursor = curve(selEndPt, dropPt, easeInOutSoft(progress(t, T.dragStart, T.dragEnd)), -0.12);
  } else if (t < T.toBubble) {
    cursor = curve(dropPt, idlePt, easeInOut(progress(t, T.idleMove, T.idleMove + 1.1)), 0.1);
  } else if (t < T.rightClick + 0.15) {
    cursor = curve(idlePt, bubblePt, easeInOut(progress(t, T.toBubble, T.rightClick - 0.05)), 0.2);
  } else if (t < T.toInput) {
    cursor = curve(bubblePt, copyPt, easeInOut(progress(t, T.rightClick + 0.15, T.menuHover + 0.1)), 0.1);
  } else if (t < T.toFeed) {
    cursor = curve(copyPt, inputPt, easeInOut(progress(t, T.toInput, T.pasteHintIn)), -0.15);
  } else if (t < T.toCardB) {
    cursor = curve(inputPt, feedPt, easeInOut(progress(t, T.toFeed, T.feedPress - 0.1)), 0.25);
  } else if (t < T.grab) {
    cursor = curve(feedPt, cardBGrab, easeInOut(progress(t, T.toCardB, T.toCardB + 0.8)), 0.2);
  } else if (t < T.cardExit) {
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
    cursor = curve(from, day23Pt, easeInOut(progress(t, T.cardExit, T.cardExit + 0.9)), -0.18);
  }

  const pressed =
    (t >= T.selStart - 0.05 && t < T.selEnd + 0.1) ||
    (t >= T.ghostIn && t < T.drop) ||
    (t >= T.rightClick && t < T.rightClick + 0.12) ||
    (t >= T.copyClick && t < T.copyClick + 0.12) ||
    (t >= T.feedPress && t < T.feedPress + 0.15) ||
    (t >= T.grab && t < T.release);

  /* 끌고 가는 문장 — 커서에 붙어서 같이 움직이고, 놓으면 입력창으로 빨려 들어갑니다 */
  let ghost: HeroFrame['ghost'] = null;
  if (t >= T.ghostIn && t < T.cardA) {
    const fadeIn = progress(t, T.ghostIn, T.dragStart);
    const sink = easeOut(progress(t, T.drop, T.cardA));
    ghost = {
      x: lerp(cursor.x + GHOST_GRIP.x, dropPt.x - 30, sink),
      y: lerp(cursor.y + GHOST_GRIP.y, dropPt.y - 10, sink),
      opacity: fadeIn * (1 - sink),
      scale: 1 - 0.35 * sink,
    };
  }

  /* 카드 */
  const cardA: CardState = t < T.cardA ? 'hidden' : t < T.merge ? 'shown' : t < T.cardExit ? 'merged' : 'gone';
  const cardB = t < T.cardB ? 'hidden' : t < T.merge ? 'shown' : 'gone';
  const lift = easeInOut(progress(t, T.grab + 0.1, T.release - 0.2));
  const cardBOffset = cardB === 'shown' ? { x: CARD_B_LIFT.x * lift, y: CARD_B_LIFT.y * lift } : { x: 0, y: 0 };
  const count = (cardA === 'shown' || cardA === 'merged' ? 1 : 0) + (cardB === 'shown' ? 1 : 0);

  const menu: HeroFrame['menu'] =
    t >= T.rightClick && t < T.copyClick + 0.15 ? (t >= T.menuHover ? 'hover' : 'open') : 'hidden';

  const veil = Math.max(1 - progress(t, 0, 0.45), progress(t, T.fadeOut, DURATION));

  return {
    scene,
    chapter: SCENES[scene].chapter,
    cursor: { ...cursor, pressed },
    selection: selectionOn ? selection : [0, 0],
    ghost,
    inputActive: t >= T.dragEnd - 0.3 && t < T.drop + 0.1,
    // 메일은 끌어다 놓자마자 카드가 되므로 입력창에 글이 남지 않습니다. 카톡만 붙여넣은 글이 보입니다.
    inputText: t >= T.pasted && t < T.eat2 ? CHAT_TEXT : '',
    // 체험 패널과 같은 규칙: 메일을 입력창에 가져와 넣는 중이거나 글이 입력창에 있으면 입을 벌리고,
    // 그 외에는 '채워 주세요'가 비어 있으면 입이 없는 표정, 하나라도 있으면 먹는 표정
    catMood:
      (t >= T.dragEnd - 0.3 && t < T.cardA) || (t >= T.pasted && t < T.eat2)
        ? 'openMouth'
        : count > 0
          ? 'eating'
          : 'start',
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
