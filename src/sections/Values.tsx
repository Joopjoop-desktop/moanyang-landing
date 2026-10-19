import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion, type Variants } from 'motion/react';
import { SectionHead } from '../components/SectionHead';
import { Scaled } from '../components/Scaled';
import { TaskCard } from '../components/app/TaskCard';
import { mergedTask, taskFromChat, taskFromMail, type Task } from '../data/demo';
import arrow from '../assets/figma/arrow-right.svg';
import eventTodo from '../assets/figma/event-todo.svg';
import styles from './Values.module.css';

const sampleCards: Task[] = [
  { id: 'v1', title: '제안서 초안 작성', time: '10/15 09:12', tags: ['no-date'] },
  { id: 'v2', title: '회의록 공유', time: '10/16 14:20', tags: [] },
  { id: 'v3', title: '견적서 검토', time: '10/16 17:05', tags: ['no-date'] },
];

const pendingCards: Task[] = [
  { id: 'p1', title: '견적서 검토', time: '10/16 17:05', tags: ['no-date'] },
  { id: 'p2', title: '회의록 공유', time: '10/17 11:30', tags: ['no-task'] },
];

/* ───────── 등장 연출 ─────────
 * 각 행이 화면에 보이면 '전 → 후' 순서로 나타납니다.
 * 행이 화면 밖으로 완전히 나가면 처음 상태로 되돌려 두었다가, 다시 들어오면 처음부터 재생합니다.
 * (보는 동안에는 완성된 상태로 멈춰 있고, 반복 재생은 하지 않습니다)
 * 행(li)이 hidden ↔ shown 으로 바뀌면 아래 변형이 자식들에게 전달되고, custom 값은 지연 시간(초)입니다.
 * 동작 줄이기 설정이면 처음부터 완성된 상태로 보여줍니다.
 */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 되돌릴 때는 화면 밖이므로 즉시 */
const RESET = { duration: 0 };

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14, transition: RESET },
  shown: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay } }),
};

const slideIn: Variants = {
  hidden: { opacity: 0, x: -14, transition: RESET },
  shown: (delay = 0) => ({ opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE, delay } }),
};

const pop: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.97, transition: RESET },
  shown: (delay = 0) => ({ opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE, delay } }),
};

/** 화살표: 흐리게 있다가 오른쪽으로 한 번 '툭' */
const nudge: Variants = {
  hidden: { opacity: 0.25, x: -6, transition: RESET },
  shown: (delay = 0) => ({
    opacity: 1,
    x: [-6, 5, 0],
    transition: { duration: 0.5, ease: EASE, delay, times: [0, 0.6, 1] },
  }),
};

/**
 * 행이 재생 중(active)이 된 뒤 delay(ms)가 지나면 켜지고, 행이 리셋되면 꺼지는 값.
 * 카드 펼침처럼 상태로 바꿔야 하는 연출에 씁니다.
 */
function useDelayedFlag(active: boolean, delay: number) {
  const reduce = useReducedMotion() ?? false;
  const [on, setOn] = useState(reduce);
  useEffect(() => {
    if (reduce) {
      setOn(true);
      return;
    }
    if (!active) {
      setOn(false);
      return;
    }
    const id = window.setTimeout(() => setOn(true), delay);
    return () => window.clearTimeout(id);
  }, [active, delay, reduce]);
  return on;
}

function Cards({ tasks, delay = 0 }: { tasks: Task[]; delay?: number }) {
  return (
    <div className={styles.cards}>
      {tasks.map((t, i) => (
        <motion.div key={t.id} variants={pop} custom={delay + i * 0.12}>
          <TaskCard task={t} size="sm" />
        </motion.div>
      ))}
    </div>
  );
}

function Column({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`${styles.column} ${className ?? ''}`}>
      <p className={styles.colLabel}>{label}</p>
      {children}
    </div>
  );
}

function Arrow({ delay }: { delay: number }) {
  return (
    <motion.img
      className={styles.arrow}
      src={arrow}
      width={28}
      height={28}
      alt=""
      variants={nudge}
      custom={delay}
    />
  );
}

function Vignette({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className={styles.vignetteWrap} aria-label={label}>
      <Scaled baseWidth={635}>
        <div className={styles.vignette}>{children}</div>
      </Scaled>
    </figure>
  );
}

function Value({
  num,
  title,
  desc,
  children,
}: {
  num: string;
  title: ReactNode;
  desc: string;
  /** play: 지금 이 행의 연출이 재생 중(또는 끝나서 완성된 상태)인지 */
  children: (play: boolean) => ReactNode;
}) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLLIElement>(null);
  // 35% 이상 보이면 재생, 한 픽셀도 안 보이면(완전히 나가면) 리셋
  const enough = useInView(ref, { amount: 0.35 });
  const anyVisible = useInView(ref, { amount: 0 });
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (enough) setPlay(true);
    else if (!anyVisible) setPlay(false);
  }, [enough, anyVisible]);

  return (
    <motion.li
      ref={ref}
      className={styles.value}
      initial={reduce ? false : 'hidden'}
      animate={reduce || play ? 'shown' : 'hidden'}
    >
      <div className={styles.copy}>
        <motion.p className={styles.num} variants={fadeUp} custom={0}>
          {num}
        </motion.p>
        <motion.h3 className={styles.valueTitle} variants={fadeUp} custom={0.06}>
          {title}
        </motion.h3>
        <motion.p className={styles.desc} variants={fadeUp} custom={0.12}>
          {desc}
        </motion.p>
      </div>
      {children(reduce || play)}
    </motion.li>
  );
}

const WEEK = [19, 20, 21, 22, 23];

/** 01: 메일·카톡 칸이 들어오고, 화살표 뒤에 카드가 하나씩 생깁니다 (행의 변형만으로 재생) */
function SourcesVignette() {
  return (
    <Vignette label="메일과 메신저 메시지 세 개가 모아냥 카드 세 장으로 정리된 모습">
      <Column label="메일 · 메신저">
        <div className={styles.minis}>
          <motion.p className={styles.mini} variants={slideIn} custom={0.1}>
            <b>메일</b>제안서 초안 작성 부탁…
          </motion.p>
          <motion.p className={styles.mini} variants={slideIn} custom={0.2}>
            <b>카톡</b>회의록 공유 부탁해요…
          </motion.p>
          <motion.p className={styles.mini} variants={slideIn} custom={0.3}>
            <b>메일</b>견적서 검토 요청…
          </motion.p>
        </div>
      </Column>
      <Arrow delay={0.5} />
      <Column label="모아냥 카드">
        <Cards tasks={sampleCards} delay={0.7} />
      </Column>
    </Vignette>
  );
}

/** 02: 오른쪽 합친 카드가 접힌 채로 나타났다가 펼쳐지며 내용이 채워집니다 */
function MergeVignette({ play }: { play: boolean }) {
  const merged = useDelayedFlag(play, 900);
  return (
    <Vignette label="날짜 없는 카드와 할 일 없는 카드가 한 장으로 합쳐져 마감일과 요청자가 채워진 모습">
      <Column label="합치기 전 · 카드 2">
        <Cards tasks={[taskFromMail, taskFromChat]} delay={0.1} />
      </Column>
      <Arrow delay={0.45} />
      <Column label="합친 후 · 카드 1">
        {/* 펼쳐진 높이만큼 자리를 미리 잡아 두어, 펼칠 때 행 높이가 흔들리지 않게 합니다 */}
        <div className={styles.mergedSlot}>
          <motion.div variants={pop} custom={0.6}>
            <TaskCard task={mergedTask} expanded={merged} size="sm" />
          </motion.div>
        </div>
      </Column>
    </Vignette>
  );
}

/** 03: 왼쪽 카드가 보인 뒤 23일 칸에 일정이 올라갑니다 */
function CalendarVignette({ play }: { play: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const placed = useDelayedFlag(play, 950);
  return (
    <Vignette label="채워 주세요 목록의 카드와 10월 23일에 일정이 올라간 주간 캘린더">
      <Column label="채워 주세요 · 2" className={styles.narrow}>
        <Cards tasks={pendingCards} delay={0.1} />
      </Column>
      <Arrow delay={0.45} />
      <Column label="10월 19일 – 23일" className={styles.week}>
        <motion.div className={styles.weekRow} variants={pop} custom={0.55}>
          {WEEK.map((d) => (
            <div key={d} className={styles.day}>
              <span>{d}</span>
              {d === 23 && placed && (
                <motion.span
                  className={styles.dayEvent}
                  initial={reduce ? false : { opacity: 0, y: -8, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                >
                  <img src={eventTodo} width={6} height={6} alt="" />
                  제안서 초안
                </motion.span>
              )}
            </div>
          ))}
        </motion.div>
      </Column>
    </Vignette>
  );
}

export function Values() {
  return (
    <section id="how" className={styles.section} aria-labelledby="how-title">
      <div className="container">
        <SectionHead
          id="how-title"
          eyebrow="이렇게 정리돼요"
          title={
            <>
              조작은 적게,
              <br />
              정리는 끝까지.
            </>
          }
        />
        <ol className={styles.values}>
          <Value num="01" title="흩어진 요청을 한곳으로" desc="메일과 메신저에서 필요한 부분만 골라 넣으면, 할 일 카드로 정리됩니다.">
            {() => <SourcesVignette />}
          </Value>

          <Value
            num="02"
            title={
              <>
                나중에 온 정보도
                <br />
                기존 업무에 합치기
              </>
            }
            desc="며칠 뒤 따로 온 마감 정보를 새 할 일로 만들지 않고, 원래 업무 카드에 합칩니다."
          >
            {(play) => <MergeVignette play={play} />}
          </Value>

          <Value
            num="03"
            title={
              <>
                빠진 것만 채우고
                <br />
                일정으로 확인
              </>
            }
            desc="날짜가 빠진 카드는 ‘채워 주세요’에 모입니다. 채우면 바로 캘린더에서 보입니다."
          >
            {(play) => <CalendarVignette play={play} />}
          </Value>
        </ol>
      </div>
    </section>
  );
}
