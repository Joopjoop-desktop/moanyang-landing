import { memo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import eventTodo from '../../assets/figma/event-todo.svg';
import eventDone from '../../assets/figma/event-done.svg';
import styles from './Calendar.module.css';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 2026년 10월: 1일이 목요일. 앞의 네 칸은 9월 27–30일 */
const CELLS: { day: number; muted?: boolean }[] = [
  ...[27, 28, 29, 30].map((day) => ({ day, muted: true })),
  ...Array.from({ length: 31 }, (_, i) => ({ day: i + 1 })),
];

type CalendarProps = {
  /** 23일에 올라갈 일정 이름. 없으면 비어 있음 */
  day23Event?: string | null;
};

function EventChip({ title, done }: { title: string; done?: boolean }) {
  return (
    <span className={done ? styles.eventDone : styles.event}>
      <img src={done ? eventDone : eventTodo} width={12} height={12} alt="" />
      <span className={styles.eventText}>{title}</span>
    </span>
  );
}

/** Figma Main2_2 캘린더 (기준 868 × 647) */
export const Calendar = memo(function Calendar({ day23Event }: CalendarProps) {
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
          const tone = muted ? styles.muted : col === 0 ? styles.sun : col === 6 ? styles.sat : '';
          return (
            <div key={`${muted ? 'p' : 'c'}${day}`} className={`${styles.cell} ${muted ? styles.cellMuted : ''}`}>
              <span className={`${styles.date} ${tone}`}>{day}</span>
              {!muted && day === 17 && (
                <div className={styles.events}>
                  <EventChip title="해야 할 일" />
                  <EventChip title="다 끝낸 일" done />
                  <EventChip title="다 끝낸 일" done />
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
                        <EventChip title={day23Event} />
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
