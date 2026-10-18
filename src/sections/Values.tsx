import type { ReactNode } from 'react';
import { SectionHead } from '../components/SectionHead';
import { Scaled } from '../components/Scaled';
import { TaskCard } from '../components/app/TaskCard';
import { mergedTask, taskFromChat, taskFromMail, type Task } from '../data/demo';
import arrow from '../assets/figma/arrow-right.svg';
import eventTodo from '../assets/figma/event-todo.svg';
import styles from './Values.module.css';

/** 소개용 카드는 서비스 화면 카드를 0.66배로 줄여 씁니다 (Figma 257.4 / 390) */
const CARD_SCALE = 0.66;

const sampleCards: Task[] = [
  { id: 'v1', title: '제안서 초안 작성', time: '10/15 09:12', tags: ['no-date'] },
  { id: 'v2', title: '회의록 공유', time: '10/16 14:20', tags: [] },
  { id: 'v3', title: '견적서 검토', time: '10/16 17:05', tags: ['no-date'] },
];

const pendingCards: Task[] = [
  { id: 'p1', title: '견적서 검토', time: '10/16 17:05', tags: ['no-date'] },
  { id: 'p2', title: '회의록 공유', time: '10/17 11:30', tags: ['no-task'] },
];

function Cards({ tasks, scale = CARD_SCALE }: { tasks: Task[]; scale?: number }) {
  return (
    <div className={styles.cards}>
      {tasks.map((t) => (
        <Scaled key={t.id} baseWidth={390} scale={scale}>
          <TaskCard task={t} />
        </Scaled>
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

function Arrow() {
  return <img className={styles.arrow} src={arrow} width={28} height={28} alt="" />;
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

function Value({ num, title, desc, children }: { num: string; title: ReactNode; desc: string; children: ReactNode }) {
  return (
    <li className={styles.value}>
      <div className={styles.copy}>
        <p className={styles.num}>{num}</p>
        <h3 className={styles.valueTitle}>{title}</h3>
        <p className={styles.desc}>{desc}</p>
      </div>
      {children}
    </li>
  );
}

const WEEK = [19, 20, 21, 22, 23];

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
            <Vignette label="메일과 메신저 메시지 세 개가 모아냥 카드 세 장으로 정리된 모습">
              <Column label="메일 · 메신저">
                <div className={styles.minis}>
                  <p className={styles.mini}>
                    <b>메일</b>제안서 초안 작성 부탁…
                  </p>
                  <p className={styles.mini}>
                    <b>카톡</b>회의록 공유 부탁해요…
                  </p>
                  <p className={styles.mini}>
                    <b>메일</b>견적서 검토 요청…
                  </p>
                </div>
              </Column>
              <Arrow />
              <Column label="모아냥 카드">
                <Cards tasks={sampleCards} />
              </Column>
            </Vignette>
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
            <Vignette label="날짜 없는 카드와 할 일 없는 카드가 한 장으로 합쳐져 마감일과 요청자가 채워진 모습">
              <Column label="합치기 전 · 카드 2">
                <Cards tasks={[taskFromMail, taskFromChat]} />
              </Column>
              <Arrow />
              <Column label="합친 후 · 카드 1">
                <Scaled baseWidth={390} scale={CARD_SCALE}>
                  <TaskCard task={mergedTask} expanded />
                </Scaled>
              </Column>
            </Vignette>
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
            <Vignette label="채워 주세요 목록의 카드와 10월 23일에 일정이 올라간 주간 캘린더">
              <Column label="채워 주세요 · 2" className={styles.narrow}>
                <Cards tasks={pendingCards} scale={0.55} />
              </Column>
              <Arrow />
              <Column label="10월 19일 – 23일" className={styles.week}>
                <div className={styles.weekRow}>
                  {WEEK.map((d) => (
                    <div key={d} className={styles.day}>
                      <span>{d}</span>
                      {d === 23 && (
                        <span className={styles.dayEvent}>
                          <img src={eventTodo} width={6} height={6} alt="" />
                          제안서 초안
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Column>
            </Vignette>
          </Value>
        </ol>
      </div>
    </section>
  );
}
