import { forwardRef, useRef, type HTMLAttributes } from 'react';
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
  /** 다른 카드를 잡고 있는 동안 놓을 곳으로 표시 — 점선 테두리 */
  dropHint?: boolean;
  /** 카드 위에 띄우는 안내 문구 (예: '여기에 놓으세요') */
  dropLabel?: string;
  /** 펼친 내용 중 앞에서부터 몇 개를 보여줄지 (채워지는 연출용) */
  filledCount?: number;
  /**
   * md: 서비스 화면 크기 (390px 기준, 축소된 화면 안에서 사용)
   * sm: 소개 섹션용 작은 카드 — 줄이지 않고 실제 글자 크기(제목 13px, 태그 11px)로 그립니다
   */
  size?: 'md' | 'sm';
  style?: MotionStyle;
  className?: string;
} & Omit<HTMLMotionProps<'div'>, 'children' | 'style'> &
  Pick<HTMLAttributes<HTMLDivElement>, 'aria-label'>;

/** Figma Main2_2 '채워 주세요' 목록의 카드 (기준 크기 390px) */
export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(function TaskCard(
  {
    task,
    expanded,
    receiving,
    lifted,
    dropHint,
    dropLabel,
    filledCount,
    size = 'md',
    style,
    className,
    transition,
    ...motionProps
  },
  ref,
) {
  const fields = task.fields ?? [];
  const visibleCount = filledCount ?? fields.length;
  // 처음부터 펼친 채로 그려진 카드(소개 섹션)는 내용 등장 연출을 생략합니다
  const bornExpanded = useRef(expanded);

  /*
   * 주의: 이 카드는 transform: scale로 축소된 화면 안에서 쓰입니다.
   * Motion의 layout 애니메이션은 조상의 scale을 고려하지 못해 위치가 튕기므로 쓰지 않고,
   * 펼침은 CSS grid 높이 전환으로 처리합니다.
   */
  return (
    <motion.div
      ref={ref}
      className={[
        styles.card,
        size === 'sm' && styles.sm,
        expanded && styles.expanded,
        dropHint && styles.dropHint,
        receiving && styles.receiving,
        lifted && styles.lifted,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      {...motionProps}
      transition={transition}
    >
      <AnimatePresence>
        {dropLabel && (
          <motion.span
            key="drop-label"
            className={styles.dropLabel}
            initial={{ opacity: 0, y: 6, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, x: '-50%' }}
            transition={{ duration: 0.18 }}
          >
            {dropLabel}
          </motion.span>
        )}
      </AnimatePresence>
      <div className={styles.head}>
        <img className={styles.checkbox} src={checkbox} width={20} height={20} alt="" />
        <div className={styles.headText}>
          <div className={styles.titleRow}>
            <div className={styles.titleGroup}>
              <p className={styles.title}>{task.title}</p>
              <AnimatePresence initial={false}>
                {task.tags.map((tag) => (
                  <motion.span
                    key={tag}
                    className={tag === 'no-date' ? styles.tagRed : styles.tagBlue}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                  >
                    {tagLabel[tag]}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
            <img className={styles.chevron} src={expanded ? chevronUp : chevronDown} width={20} height={20} alt="" />
          </div>
          <p className={styles.time}>{task.time}</p>
        </div>
      </div>

      {/* 접힌 카드에도 자리를 만들어 두어야 펼칠 때 높이 전환이 일어납니다 */}
      <div className={styles.bodyWrap}>
        <div className={styles.bodyClip}>
          {expanded && fields.length > 0 && (
            <div className={styles.body}>
              <dl className={styles.fields}>
                {fields.map((f, i) => {
                  const shown = i < visibleCount;
                  return (
                    <motion.div
                      key={f.label}
                      className={styles.field}
                      initial={bornExpanded.current ? false : { opacity: 0, x: -6 }}
                      animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : -6 }}
                      // 한꺼번에 채울 때는 위에서부터 차례로 나타납니다
                      transition={{ duration: 0.3, delay: filledCount === undefined ? 0.15 + i * 0.12 : 0 }}
                    >
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </motion.div>
                  );
                })}
              </dl>
              <span className={styles.addChip} aria-hidden="true">
                추가
                <img src={plus} width={20} height={20} alt="" />
              </span>
              <div className={styles.divider} />
              <span className={styles.deleteBtn} aria-hidden="true">
                삭제하기
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
