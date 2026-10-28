import { forwardRef, type ReactNode, type Ref } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, type EventKind } from './Calendar';
import { CatFace, type CatMood } from './CatFace';
import iconX from '../../assets/figma/icon-x.svg';
import chevronLeft from '../../assets/figma/chevron-left.svg';
import chevronRight from '../../assets/figma/chevron-right.svg';
import styles from './MoaNyangApp.module.css';

export const APP_WIDTH = 1336;
export const APP_HEIGHT = 824;

type MoaNyangAppProps = {
  /** '채워 주세요' 개수 */
  count: number;
  /** 입력창에 들어 있는 글 */
  inputText?: string;
  /** 캐릭터 표정 (기본: start) */
  catMood?: CatMood;
  /** 먹이주기 버튼이 눌린 순간 */
  feedPressed?: boolean;
  /** 입력창 위로 무언가를 끌고 와서 놓을 수 있는 상태 */
  inputActive?: boolean;
  /** 무언가를 잡고 있는 동안 '여기에 놓으세요' 표시 */
  inputHint?: boolean;
  day23Event?: string | null;
  /** 23일 일정 칩 모양 (기본: 할 일과 날짜가 모두 있는 일정) */
  day23Kind?: EventKind;
  /** '채워 주세요' 목록 (카드들) */
  list?: ReactNode;
  inputRef?: Ref<HTMLDivElement>;
};

/**
 * 모아냥 서비스 화면 (Figma Main2_2, 기준 1336 × 824).
 * 히어로와 체험 패널이 함께 쓰며, 상태는 각자 props로 넘깁니다.
 */
export const MoaNyangApp = forwardRef<HTMLDivElement, MoaNyangAppProps>(function MoaNyangApp(
  { count, inputText, catMood = 'start', feedPressed, inputActive, inputHint, day23Event, day23Kind, list, inputRef },
  ref,
) {
  return (
    <div ref={ref} className={styles.app} aria-hidden="true">
      <div className={styles.titlebar}>
        <span className={styles.logo}>Logo</span>
        <img className={styles.close} src={iconX} width={20} height={20} alt="" />
      </div>

      <div className={styles.monthBar}>
        <span className={styles.month}>2026년 10월</span>
        <span className={styles.navGroup}>
          <span className={styles.navBtn}>
            <img src={chevronLeft} width={20} height={20} alt="" />
          </span>
          <span className={styles.todayBtn}>오늘</span>
          <span className={styles.navBtn}>
            <img src={chevronRight} width={20} height={20} alt="" />
          </span>
        </span>
      </div>

      <div className={styles.calendar}>
        <Calendar day23Event={day23Event} day23Kind={day23Kind} />
      </div>

      <div className={styles.sideHead}>
        <span className={styles.sideTitle}>채워 주세요</span>
        <motion.span key={count} className={styles.count} initial={{ y: -4, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }}>
          {count}
        </motion.span>
      </div>

      <div className={styles.character}>
        <CatFace mood={catMood} />
      </div>

      <div
        ref={inputRef}
        className={`${styles.input} ${inputHint ? styles.inputHint : ''} ${inputActive ? styles.inputActive : ''}`}
      >
        <AnimatePresence>
          {(inputHint || inputActive) && (
            <motion.span
              className={styles.dropLabel}
              initial={{ opacity: 0, y: 6, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, x: '-50%' }}
              transition={{ duration: 0.18 }}
            >
              {inputActive ? '놓으면 바로 정리돼요' : '여기에 놓으세요'}
            </motion.span>
          )}
        </AnimatePresence>
        <div className={styles.inputArea}>
          <AnimatePresence mode="wait" initial={false}>
            {inputText ? (
              <motion.p
                key="text"
                className={styles.inputText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{ duration: 0.25 }}
              >
                {inputText}
              </motion.p>
            ) : (
              <motion.p
                key="placeholder"
                className={styles.placeholder}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                메세지를 붙여넣고 Ctrl + Enter로 먹이 주기
              </motion.p>
            )}
          </AnimatePresence>
          <div className={styles.inputLine} />
        </div>
        <span className={`${styles.feedBtn} ${feedPressed ? styles.feedPressed : ''}`}>먹이주기</span>
      </div>

      <div className={styles.list}>{list}</div>
    </div>
  );
});

/** 히어로 연출에서 커서가 향할 지점들 (서비스 화면 기준 좌표) */
export const APP_POINTS = {
  input: { x: 918, y: 124, w: 390, h: 140 },
  inputText: { x: 1113, y: 170 },
  feedBtn: { x: 1265, y: 237 },
  listTop: { x: 918, y: 292 },
  cardHeight: 72,
  cardGap: 17,
  day23: { x: 648, y: 523 },
} as const;
