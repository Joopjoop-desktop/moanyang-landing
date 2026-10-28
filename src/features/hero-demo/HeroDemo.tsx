import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Scaled } from '../../components/Scaled';
import { MoaNyangApp, APP_HEIGHT, APP_WIDTH } from '../../components/app/MoaNyangApp';
import { TaskCard } from '../../components/app/TaskCard';
import { chat, eventTitle, mail, mergedTask, taskFromChat, taskFromMail } from '../../data/demo';
import { useHeroClock } from './useHeroClock';
import { APP_ON_STAGE, CHAPTER_COUNT, SCENES, STAGE, frameAt, type HeroFrame, type Measures } from './timeline';
import windowDotsMail from '../../assets/figma/window-dots-mail.svg';
import windowDotsKakao from '../../assets/figma/window-dots-kakao.svg';
import mailIcon from '../../assets/figma/icon-mail.svg';
import avatar from '../../assets/figma/avatar.svg';
import cursorImg from '../../assets/figma/cursor.svg';
import styles from './HeroDemo.module.css';

/** 커서 그림에서 화살표 끝이 있는 위치 */
const CURSOR_TIP = { x: 4.68, y: 2.81 };

function MailWindow({
  selection,
  lineRefs,
  lineWidths,
}: {
  selection: [number, number];
  lineRefs: [React.RefObject<HTMLSpanElement | null>, React.RefObject<HTMLSpanElement | null>];
  lineWidths: Measures;
}) {
  return (
    <div className={styles.mail}>
      <div className={styles.mailBar}>
        <img src={windowDotsMail} width={34.34} height={7.93} alt="" />
        <img src={mailIcon} width={11.89} height={11.89} alt="" />
        <span>받은편지함</span>
      </div>
      <div className={styles.mailContent}>
        <div className={styles.mailMeta}>
          <span>{mail.sender}</span>
          <span className={styles.mailTime}>{mail.time}</span>
        </div>
        <p className={styles.mailSubject}>{mail.subject}</p>
        <div className={styles.mailBody}>
          <span className={styles.selection} style={{ top: 1.32, width: selection[0] * (lineWidths.line1 + 4) }} />
          <span
            className={styles.selection}
            style={{ top: 1.32 + 23.78, width: selection[1] * (lineWidths.line2 + 4) }}
          />
          {mail.lines.map((line, i) => (
            <span
              key={line}
              ref={i < 2 ? lineRefs[i] : undefined}
              className={styles.mailLine}
              style={{ top: i * 23.78 }}
            >
              {line}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function KakaoWindow({ progress, bubbleActive }: { progress: number; bubbleActive: boolean }) {
  return (
    <div
      className={styles.kakao}
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * 18}px)`,
        visibility: progress === 0 ? 'hidden' : 'visible',
      }}
    >
      <div className={styles.kakaoBar}>
        <img src={windowDotsKakao} width={34.34} height={7.93} alt="" />
        <span>{chat.sender}</span>
        <span className={styles.kakaoApp}>카카오톡</span>
      </div>
      <div className={styles.chat}>
        <img src={avatar} width={30.38} height={30.38} alt="" />
        <div className={styles.chatCol}>
          <span className={styles.chatName}>{chat.sender}</span>
          <div className={styles.chatRow}>
            <p className={`${styles.bubble} ${bubbleActive ? styles.bubbleActive : ''}`}>{chat.text}</p>
            <span className={styles.chatTime}>{chat.clock}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContextMenu({ state }: { state: HeroFrame['menu'] }) {
  if (state === 'hidden') return null;
  return (
    <div className={styles.menu}>
      <span className={state === 'hover' ? styles.menuActive : undefined}>복사</span>
      <span>답장</span>
      <span>전달</span>
    </div>
  );
}

export function HeroDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const [measures, setMeasures] = useState<Measures>({ line1: 214, line2: 190 });
  const clock = useHeroClock(rootRef);

  // 폰트가 로드된 뒤 메일 문장 너비를 재서 선택 영역이 글자 끝에 맞도록 합니다
  useLayoutEffect(() => {
    const measure = () => {
      const l1 = line1Ref.current?.offsetWidth;
      const l2 = line2Ref.current?.offsetWidth;
      if (l1 && l2) setMeasures({ line1: l1, line2: l2 });
    };
    measure();
    document.fonts?.ready.then(measure);
  }, []);

  const f = useMemo(() => frameAt(clock.t, measures), [clock.t, measures]);
  const scene = SCENES[f.scene];

  // popLayout은 축소된 화면 안에서 위치 계산이 어긋나 튕기므로 쓰지 않습니다
  const list = (
    <AnimatePresence initial={false}>
      {(f.cardA === 'shown' || f.cardA === 'merged') && (
        <TaskCard
          key="a"
          task={f.cardA === 'merged' ? mergedTask : taskFromMail}
          expanded={f.cardA === 'merged'}
          receiving={f.cardAReceiving}
          filledCount={f.filled}
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: -80, scale: 0.9, transition: { duration: 0.45 } }}
        />
      )}
      {f.cardB === 'shown' && (
        <TaskCard
          key="b"
          task={taskFromChat}
          lifted={f.cardBLifted}
          style={{ x: f.cardBOffset.x, y: f.cardBOffset.y, rotate: f.cardBLifted ? 1.2 : 0 }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
        />
      )}
    </AnimatePresence>
  );

  return (
    <div ref={rootRef} className={styles.demo}>
      {/* 화면 낭독기에는 단계 설명 목록을 대신 읽어 줍니다 */}
      <div className="visually-hidden">
        <p>모아냥 사용 흐름을 보여주는 자동 재생 데모입니다.</p>
        <ol>
          {SCENES.map((s) => (
            <li key={s.start}>{s.caption}</li>
          ))}
        </ol>
      </div>

      <Scaled baseWidth={STAGE.w} baseHeight={STAGE.h} className={styles.stageWrap}>
        <div className={styles.stage} aria-hidden="true">
          <div className={styles.appSlot} style={{ left: APP_ON_STAGE.x, top: APP_ON_STAGE.y }}>
            <Scaled baseWidth={APP_WIDTH} baseHeight={APP_HEIGHT} scale={APP_ON_STAGE.scale} style={{ overflow: 'visible' }}>
              <MoaNyangApp
                count={f.count}
                inputText={f.inputText}
                catMood={f.catMood}
                feedPressed={f.feedPressed}
                inputActive={f.inputActive}
                day23Event={f.day23 ? eventTitle : null}
                list={list}
              />
            </Scaled>
          </div>

          <MailWindow selection={f.selection} lineRefs={[line1Ref, line2Ref]} lineWidths={measures} />
          <KakaoWindow progress={f.kakao} bubbleActive={f.bubbleActive} />
          <ContextMenu state={f.menu} />

          {f.pasteHint && (
            <div className={styles.pasteHint}>
              <span className={styles.key}>Ctrl + V</span>
              <span>붙여넣기</span>
            </div>
          )}

          {f.ghost && (
            <div
              className={styles.ghost}
              style={{
                left: f.ghost.x,
                top: f.ghost.y,
                opacity: f.ghost.opacity,
                transform: `scale(${f.ghost.scale})`,
              }}
            >
              {mail.picked}
            </div>
          )}

          <img
            className={styles.cursor}
            src={cursorImg}
            width={22.46}
            height={22.46}
            alt=""
            style={{
              left: f.cursor.x - CURSOR_TIP.x,
              top: f.cursor.y - CURSOR_TIP.y,
              transform: f.cursor.pressed ? 'scale(0.88)' : undefined,
            }}
          />

          <div className={styles.veil} style={{ opacity: f.veil }} />
        </div>
      </Scaled>

      <div className={styles.caption}>
        <span className={styles.captionIndex}>
          {scene.chapter + 1} / {CHAPTER_COUNT}
        </span>
        <p className={styles.captionText} aria-hidden="true">
          {scene.caption}
        </p>
        <div className={styles.controls}>
          <div className={styles.dots} role="group" aria-label="데모 단계 이동">
            {Array.from({ length: CHAPTER_COUNT }, (_, c) => (
              <button
                key={c}
                type="button"
                className={`${styles.dot} ${c === f.chapter ? styles.dotOn : ''}`}
                aria-label={`${c + 1}단계 보기`}
                aria-current={c === f.chapter ? 'step' : undefined}
                onClick={() => clock.goToChapter(c)}
              />
            ))}
          </div>
          <button
            type="button"
            className={styles.playBtn}
            onClick={clock.userPaused ? clock.play : clock.pause}
            aria-label={clock.userPaused ? '데모 재생' : '데모 일시정지'}
          >
            {clock.userPaused ? (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M3.5 2.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L4.4 1.7a.6.6 0 0 0-.9.5Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <rect x="3" y="2" width="2.8" height="10" rx="0.8" fill="currentColor" />
                <rect x="8.2" y="2" width="2.8" height="10" rx="0.8" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
