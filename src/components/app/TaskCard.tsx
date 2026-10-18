import { forwardRef, type HTMLAttributes } from 'react';
import { AnimatePresence, motion, type HTMLMotionProps, type MotionStyle } from 'motion/react';
import { tagLabel, type Task } from '../../data/demo';
import checkbox from '../../assets/figma/app-checkbox.svg';
import chevronDown from '../../assets/figma/app-chevron-down.svg';
import chevronUp from '../../assets/figma/app-chevron-up.svg';
import plus from '../../assets/figma/app-plus.svg';
import styles from './TaskCard.module.css';

type TaskCardProps = {
  task: Task;
  /** 펼친 상태 (합친 카드) */
  expanded?: boolean;
  /** 다른 카드를 받는 중 — 검정 테두리 */
  receiving?: boolean;
  /** 끌고 있는 카드 — 떠 있는 그림자 */
  lifted?: boolean;
  /** 펼친 내용 중 앞에서부터 몇 개를 보여줄지 (채워지는 연출용) */
  filledCount?: number;
  style?: MotionStyle;
  className?: string;
} & Omit<HTMLMotionProps<'div'>, 'children' | 'style'> &
  Pick<HTMLAttributes<HTMLDivElement>, 'aria-label'>;

/** Figma Main2_2 '채워 주세요' 목록의 카드 (기준 크기 390px) */
export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(function TaskCard(
  { task, expanded, receiving, lifted, filledCount, style, className, transition, ...motionProps },
  ref,
) {
  const fields = task.fields ?? [];
  const visibleCount = filledCount ?? fields.length;

  return (
    <motion.div
      ref={ref}
      layout
      className={[styles.card, expanded && styles.expanded, receiving && styles.receiving, lifted && styles.lifted, className]
        .filter(Boolean)
        .join(' ')}
      style={style}
      {...motionProps}
      transition={{ layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }, ...transition }}
    >
      <motion.div layout="position" className={styles.head}>
        <img className={styles.checkbox} src={checkbox} width={20} height={20} alt="" />
        <div className={styles.headText}>
          <div className={styles.titleRow}>
            <div className={styles.titleGroup}>
              <p className={styles.title}>{task.title}</p>
              <AnimatePresence initial={false}>
                {task.tags.map((tag) => (
                  <motion.span
                    key={tag}
                    layout
                    className={tag === 'no-date' ? styles.tagRed : styles.tagBlue}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    {tagLabel[tag]}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
            <img src={expanded ? chevronUp : chevronDown} width={20} height={20} alt="" />
          </div>
          <p className={styles.time}>{task.time}</p>
        </div>
      </motion.div>

      {expanded && (
        <motion.div
          className={styles.body}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <dl className={styles.fields}>
            {fields.map((f, i) => (
              <motion.div
                key={f.label}
                className={styles.field}
                initial={false}
                animate={{ opacity: i < visibleCount ? 1 : 0, x: i < visibleCount ? 0 : -6 }}
                transition={{ duration: 0.3 }}
              >
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </motion.div>
            ))}
          </dl>
          <span className={styles.addChip} aria-hidden="true">
            추가
            <img src={plus} width={20} height={20} alt="" />
          </span>
          <div className={styles.divider} />
          <span className={styles.deleteBtn} aria-hidden="true">
            삭제하기
          </span>
        </motion.div>
      )}
    </motion.div>
  );
});
