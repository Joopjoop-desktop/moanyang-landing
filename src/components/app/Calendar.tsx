import { memo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import catDefault from '../../assets/figma/chip-cat-default.svg';
import catDone from '../../assets/figma/chip-cat-done.svg';
import catNoTask from '../../assets/figma/chip-cat-no-task.svg';
import catNoDate from '../../assets/figma/chip-cat-no-date.svg';
import styles from './Calendar.module.css';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 2026년 10월: 1일이 목요일. 앞의 네 칸은 9월 27–30일 */
const CELLS: { day: number; muted?: boolean }[] = [
  ...[27, 28, 29, 30].map((day) => ({ day, muted: true })),
  ...Array.from({ length: 31 }, (_, i) => ({ day: i + 1 })),
];

/** 데모 속 '오늘' */
const TODAY = 17;

/**
 * Figma Component 23 일정 칩
 *   todo   — 할 일과 날짜가 모두 있는 일정 (검정)
 *   done   — 끝낸 일 (회색 + 취소선)
 *   noTask — 할 일이 없는 일정 (파란 점선)
 *   noDate — 날짜가 없는 일정 (빨간 점선)
 */
export type EventKind = 'todo' | 'done' | 'noTask' | 'noDate';

const CHIP: Record<EventKind, { className: string; icon: string }> = {
  todo: { className: styles.eventTodo, icon: catDefault },
  done: { className: styles.eventDone, icon: catDone },
  noTask: { className: styles.eventNoTask, icon: catNoTask },
  noDate: { className: styles.eventNoDate, icon: catNoDate },
};

type CalendarProps = {
  /** 23일에 올라갈 일정 이름. 없으면 비어 있음 */
  day23Event?: string | null;
  day23Kind?: EventKind;
};

function EventChip({ title, kind = 'todo' }: { title: string; kind?: EventKind }) {
  const { className, icon } = CHIP[kind];
  return (
    <span className={`${styles.event} ${className}`}>
      <img src={icon} width={16} height={16} alt="" />
      <span className={styles.eventText}>{title}</span>
    </span>
  );
}

/** Figma Main2_1 캘린더 (기준 868 × 647) */
export const Calendar = memo(function Calendar({ day23Event, day23Kind = 'todo' }: CalendarProps) {
  return (
    <div className={styles.calendar}>
      <div className={styles.weekdays} aria-hidden="true">
        {WEEKDAYS.map((w, i) => (
          <span key={w} className={i === 0 ? styles.sun : i === 6 ? styles.sat : undefined}>
            {w}
          </span>
        ))}
      </div>
      <div className={styles.grid}>
        {CELLS.map(({ day, muted }, i) => {
          const col = i % 7;
          const tone = muted
            ? styles.muted
            : day === TODAY
              ? styles.today
              : col === 0
                ? styles.sun
                : col === 6
                  ? styles.sat
                  : '';
          return (
            <div key={`${muted ? 'p' : 'c'}${day}`} className={`${styles.cell} ${muted ? styles.cellMuted : ''}`}>
              <span className={`${styles.date} ${tone}`}>{day}</span>
              {!muted && day === TODAY && (
                <div className={styles.events}>
                  <EventChip title="해야 할 일" />
                  <EventChip title="다 끝낸 일" kind="done" />
                </div>
              )}
              {!muted && day === 23 && (
                <div className={styles.events}>
                  <AnimatePresence>
                    {day23Event && (
                      <motion.span
                        key="event"
                        initial={{ opacity: 0, y: -6, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <EventChip title={day23Event} kind={day23Kind} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
