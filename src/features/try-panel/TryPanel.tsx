import { useEffect, useReducer, useRef, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Button } from '../../components/Button';
import { Scaled } from '../../components/Scaled';
import { MoaNyangApp, APP_HEIGHT, APP_WIDTH } from '../../components/app/MoaNyangApp';
import { TaskCard } from '../../components/app/TaskCard';
import { chat, eventTitle, mail, mergedTask, taskFromChat, taskFromMail } from '../../data/demo';
import { trackMergeComplete, trackTryStart } from '../../lib/analytics';
import { NEXT_TEXT, NEXT_TEXT_TOUCH, STEP_LABELS, initialTryState, inputTextOf, tryReducer, type Method } from './tryReducer';
import { useDragToTarget } from './useDragToTarget';
import mailIcon from '../../assets/figma/icon-mail-15.svg';
import chatIcon from '../../assets/figma/icon-chat-15.svg';
import styles from './TryPanel.module.css';

const FEED_MS = 900;
/** 끌어다 놓은 뒤 고양이가 웃는 시간 (카드는 이미 생긴 상태) */
const EAT_MS = 700;
const MERGE_MS = 1700;

/** 끄는 동안에는 커서를 바로 따라가고, 놓으면 제자리로 부드럽게 돌아갑니다 */
const followPointer = (dragging: boolean) =>
  dragging
    ? { x: { duration: 0 }, y: { duration: 0 } }
    : { x: { type: 'spring', stiffness: 500, damping: 34 }, y: { type: 'spring', stiffness: 500, damping: 34 } } as const;

/** 좁은 화면에서는 서비스 화면 중 '채워 주세요' 영역만 크게 보여줍니다 */
const MOBILE_CROP = { x: 896, y: 56, w: 432, h: 470 };

function useMedia(query: string) {
  const mq = typeof window !== 'undefined' ? window.matchMedia(query) : null;
  return useSyncExternalStore(
    (cb) => {
      mq?.addEventListener('change', cb);
      return () => mq?.removeEventListener('change', cb);
    },
    () => mq?.matches ?? false,
    () => false,
  );
}

export function TryPanel() {
  const [state, dispatch] = useReducer(tryReducer, initialTryState);
  const reduceMotion = useReducedMotion() ?? false;
  const narrow = useMedia('(max-width: 768px)');
  // 마우스가 없는 기기(터치)에서는 버튼으로만 진행합니다
  const touchOnly = useMedia('(hover: none) and (pointer: coarse)');
  const inputRef = useRef<HTMLDivElement>(null);
  const cardARef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const resetFocusRef = useRef(false);

  const { step, phase } = state;
  const busy = phase !== 'idle';

  // 단계 사이 연출이 끝나면 다음 단계로 넘어갑니다
  useEffect(() => {
    if (phase === 'idle') return;
    const ms = reduceMotion ? 250 : phase === 'feeding' ? FEED_MS : phase === 'eating' ? EAT_MS : MERGE_MS;
    const id = window.setTimeout(() => dispatch({ type: 'settle' }), ms);
    return () => window.clearTimeout(id);
  }, [phase, reduceMotion]);

  // '다시 해보기' 뒤에는 안내 문구로 포커스를 옮깁니다 (눌렀던 버튼이 사라지므로)
  useEffect(() => {
    if (resetFocusRef.current && step === 0) {
      resetFocusRef.current = false;
      statusRef.current?.focus();
    }
  }, [step, state.round]);

  const insertMail = (method: Method) => {
    if (step !== 0 || busy) return;
    dispatch({ type: 'insertMail', method });
    trackTryStart(method);
  };

  const pasteChat = () => {
    if (step !== 1 || busy) return;
    dispatch({ type: 'pasteChat' });
  };

  const merge = (method: Method) => {
    if (step !== 2 || busy) return;
    dispatch({ type: 'merge' });
    trackMergeComplete(method);
  };

  const reset = () => {
    resetFocusRef.current = true;
    dispatch({ type: 'reset' });
  };

  const mailDrag = useDragToTarget({
    enabled: step === 0 && !busy,
    targetRef: inputRef,
    onDrop: () => insertMail('drag'),
  });

  const cardDrag = useDragToTarget({
    enabled: step === 2 && !busy,
    targetRef: cardARef,
    onDrop: () => merge('drag'),
    // 놓은 자리에서 그대로 합쳐지며 사라지도록 (제자리로 튕겨 돌아가지 않게)
    keepOffsetOnDrop: true,
  });

  /* 서비스 화면에 넘길 상태 */
  const showA = step === 1 || step === 2;
  const showB = step === 2 && phase !== 'merging';
  const merging = phase === 'merging';
  const count = step === 3 ? 0 : merging ? 1 : (step >= 1 ? 1 : 0) + (step >= 2 ? 1 : 0);

  const list = (
    <AnimatePresence initial={false}>
      {showA && (
        <TaskCard
          key={`a-${state.round}`}
          ref={cardARef}
          task={merging ? mergedTask : taskFromMail}
          expanded={merging}
          receiving={cardDrag.over}
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: -90, scale: 0.9, transition: { duration: 0.4 } }}
        />
      )}
      {showB && (
        <TaskCard
          key={`b-${state.round}`}
          task={taskFromChat}
          lifted={cardDrag.dragging}
          className={step === 2 && !busy ? styles.draggableCard : undefined}
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: cardDrag.offset.x,
            y: cardDrag.offset.y,
            rotate: cardDrag.dragging ? 1.2 : 0,
          }}
          transition={followPointer(cardDrag.dragging || cardDrag.dropped)}
          exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
          {...cardDrag.bind}
        />
      )}
    </AnimatePresence>
  );

  const app = (
    <MoaNyangApp
      count={count}
      inputRef={inputRef}
      inputText={inputTextOf(state, { mail: mail.picked, chat: chat.text })}
      catSmile={phase === 'feeding' || phase === 'eating'}
      inputActive={mailDrag.over}
      day23Event={step === 3 ? eventTitle : null}
      list={list}
    />
  );

  const mailDone = step >= 1 || (step === 0 && busy);
  const chatDone = step >= 2 || (step === 1 && busy);
  const chatActive = step === 1 && !busy;

  return (
    <div className={styles.panel}>
      <ol className={styles.stepper} aria-label="체험 단계">
        {STEP_LABELS.map((label, i) => {
          const done = step > i || (step === 3 && i === 2);
          const current = !done && step === i;
          return (
            <li
              key={label}
              className={`${styles.step} ${current ? styles.stepCurrent : ''} ${done ? styles.stepDone : ''}`}
              aria-current={current ? 'step' : undefined}
            >
              <span className={styles.stepNum} aria-hidden="true">
                {done ? '✓' : i + 1}
              </span>
              <span className={styles.stepLabel}>
                {label}
                {done && <span className="visually-hidden"> (완료)</span>}
              </span>
            </li>
          );
        })}
      </ol>

      <div className={styles.nextBar}>
        <span className={styles.key}>{step === 3 ? '완료' : '다음'}</span>
        <p ref={statusRef} className={styles.nextText} role="status" tabIndex={-1}>
          {(touchOnly ? NEXT_TEXT_TOUCH : NEXT_TEXT)[step]}
        </p>
        <div className={styles.nextActions}>
          {step === 2 && (
            <Button variant="accent" onClick={() => merge('button')} disabled={busy}>
              두 카드 합치기
            </Button>
          )}
          {step >= 1 && (
            <Button variant="light" onClick={reset}>
              다시 해보기
            </Button>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.inbox}>
          <div className={styles.inboxHead}>
            <p>
              <strong>받은 메시지</strong> <span>예시</span>
            </p>
            <span className={styles.inboxHint}>{touchOnly ? '버튼으로 진행해요' : '끌어다 놓거나 버튼으로'}</span>
          </div>

          <motion.article
            className={`${styles.message} ${mailDone ? styles.messageDone : styles.messageActive} ${
              step === 0 && !busy ? styles.draggable : ''
            } ${mailDrag.dragging ? styles.dragging : ''}`}
            animate={{ x: mailDrag.offset.x, y: mailDrag.offset.y }}
            // 입력창에 놓았으면 제자리로 날아가지 않고 바로 '넣었어요' 상태로 돌아옵니다
            transition={followPointer(mailDrag.dragging || mailDrag.dropped)}
            aria-label="메일 메시지"
            {...mailDrag.bind}
          >
            <div className={styles.meta}>
              <span className={styles.source}>
                <img src={mailIcon} width={15} height={15} alt="" />
                <b>메일</b>
                <span>{mail.sender}</span>
              </span>
              <span className={styles.time}>{mail.time}</span>
            </div>
            <p className={styles.subject}>{mail.subject}</p>
            <p className={styles.body}>{mail.lines.join(' ')}</p>
            <div className={styles.action}>
              {mailDone ? (
                <Button disabled>넣었어요</Button>
              ) : (
                <Button onClick={() => insertMail('button')} disabled={busy}>
                  메일 내용 넣기
                </Button>
              )}
            </div>
          </motion.article>

          <article
            className={`${styles.message} ${
              chatDone ? styles.messageDone : chatActive ? styles.messageActive : styles.messageLocked
            }`}
            aria-label="카톡 메시지"
          >
            <div className={styles.meta}>
              <span className={styles.source}>
                <img src={chatIcon} width={15} height={15} alt="" />
                <b>카톡</b>
                <span>{chat.sender}</span>
              </span>
              <span className={styles.time}>{chat.time}</span>
            </div>
            <p className={styles.body}>{chat.text}</p>
            <div className={styles.action}>
              {chatDone ? (
                <Button disabled>넣었어요</Button>
              ) : (
                <>
                  <Button onClick={pasteChat} disabled={!chatActive}>
                    복사해서 붙여넣기
                  </Button>
                  {step === 0 && <span className={styles.lockedHint}>메일을 먼저 넣어 보세요</span>}
                </>
              )}
            </div>
          </article>
        </div>

        <div className={styles.preview}>
          {narrow ? (
            <Scaled baseWidth={APP_WIDTH} baseHeight={APP_HEIGHT} crop={MOBILE_CROP} className={styles.previewFrame}>
              {app}
            </Scaled>
          ) : (
            <Scaled baseWidth={APP_WIDTH} baseHeight={APP_HEIGHT} className={styles.previewFrame}>
              {app}
            </Scaled>
          )}
          {narrow && (
            <AnimatePresence>
              {step === 3 && (
                <motion.p
                  className={styles.calendarNote}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  캘린더 <b>10월 23일(금)</b>에 ‘{eventTitle}’이 올라갔어요
                </motion.p>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
