import { useId, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '../components/Button';
import { trackNotifySubmit } from '../lib/analytics';
import badgeDot from '../assets/figma/badge-dot.svg';
import styles from './Notify.module.css';

type Os = 'windows' | 'macos';

const OS_OPTIONS: { value: Os; label: string }[] = [
  { value: 'windows', label: 'Windows' },
  { value: 'macos', label: 'macOS' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Errors = { email?: string; os?: string };

function validate(email: string, os: Os | null): Errors {
  const errors: Errors = {};
  if (!email.trim()) errors.email = '이메일을 입력해 주세요.';
  else if (!EMAIL_RE.test(email.trim())) errors.email = '이메일 형식을 확인해 주세요.';
  if (!os) errors.os = '사용하는 OS를 골라 주세요.';
  return errors;
}

export function Notify() {
  const uid = useId();
  const [email, setEmail] = useState('');
  const [os, setOs] = useState<Os | null>(null);
  const [beta, setBeta] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const focusOnMount = useRef(false);

  const ids = {
    email: `${uid}-email`,
    emailErr: `${uid}-email-err`,
    os: `${uid}-os`,
    osErr: `${uid}-os-err`,
    beta: `${uid}-beta`,
  };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate(email, os);
    setErrors(next);
    if (next.email) {
      emailRef.current?.focus();
      return;
    }
    if (next.os) {
      document.getElementById(`${ids.os}-${OS_OPTIONS[0].value}`)?.focus();
      return;
    }
    // 실제 전송은 하지 않습니다. 완료 상태만 보여줍니다.
    focusOnMount.current = true;
    setSubmitted(true);
    trackNotifySubmit({ os: os!, betaOptIn: beta });
  }

  function reset() {
    focusOnMount.current = true;
    setSubmitted(false);
    setEmail('');
    setOs(null);
    setBeta(false);
    setErrors({});
  }

  // 완료 화면 ↔ 폼이 바뀐 뒤 새로 나타난 쪽으로 포커스를 옮깁니다 (전환 애니메이션 뒤에 마운트되므로 ref 콜백에서 처리)
  const focusWhenMounted = (el: HTMLElement | null) => {
    if (el && focusOnMount.current) {
      focusOnMount.current = false;
      el.focus({ preventScroll: true });
    }
  };

  return (
    <section id="notify" className={styles.section} aria-labelledby="notify-title">
      <div className="container">
        <div className={styles.box}>
          <div className={styles.copy}>
            <p className={styles.badge}>
              <img src={badgeDot} width={8} height={8} alt="" />
              현재 개발 중
            </p>
            <h2 id="notify-title" className={styles.title}>
              출시되면
              <br />
              가장 먼저 알려드릴게요.
            </h2>
            <p className={styles.desc}>
              모아냥은 아직 출시 전인 Windows · macOS 데스크톱 앱입니다. 이 신청은 출시 알림을 받기 위한 것이며, 지금 앱을
              내려받거나 결제하는 절차가 아닙니다.
            </p>
          </div>

          <div className={styles.panel}>
            <AnimatePresence mode="wait" initial={false}>
              {submitted ? (
                <motion.div
                  key="done"
                  ref={focusWhenMounted}
                  tabIndex={-1}
                  className={styles.done}
                  role="status"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className={styles.doneIcon} aria-hidden="true">
                    ✓
                  </span>
                  <p className={styles.doneTitle}>출시 알림 신청이 완료됐어요</p>
                  <p className={styles.doneText}>
                    <strong>{email.trim()}</strong>
                    <br />
                    {os === 'windows' ? 'Windows' : 'macOS'} 버전이 준비되면 알려드릴게요.
                    {beta && ' 출시 전 테스트 소식도 함께 보내드릴게요.'}
                  </p>
                  <p className={styles.note}>데모 화면이라 실제로는 아무 정보도 전송되지 않았습니다.</p>
                  <Button variant="ghost" onClick={reset}>
                    다시 작성하기
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  className={styles.form}
                  onSubmit={onSubmit}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor={ids.email}>
                      이메일
                    </label>
                    <input
                      ref={(el) => {
                        emailRef.current = el;
                        focusWhenMounted(el);
                      }}
                      id={ids.email}
                      className={`${styles.input} ${errors.email ? styles.invalid : ''}`}
                      type="email"
                      name="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                      }}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? ids.emailErr : undefined}
                      required
                    />
                    {errors.email && (
                      <p id={ids.emailErr} className={styles.error}>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <fieldset className={styles.field} aria-describedby={errors.os ? ids.osErr : undefined}>
                    <legend className={styles.label}>사용하는 OS</legend>
                    <div className={styles.osOptions}>
                      {OS_OPTIONS.map((o) => (
                        <label key={o.value} className={`${styles.os} ${os === o.value ? styles.osOn : ''}`}>
                          <input
                            id={`${ids.os}-${o.value}`}
                            className="visually-hidden"
                            type="radio"
                            name="os"
                            value={o.value}
                            checked={os === o.value}
                            onChange={() => {
                              setOs(o.value);
                              if (errors.os) setErrors((p) => ({ ...p, os: undefined }));
                            }}
                          />
                          {o.label}
                        </label>
                      ))}
                    </div>
                    {errors.os && (
                      <p id={ids.osErr} className={styles.error}>
                        {errors.os}
                      </p>
                    )}
                  </fieldset>

                  <label className={styles.check} htmlFor={ids.beta}>
                    <input
                      id={ids.beta}
                      className={styles.checkInput}
                      type="checkbox"
                      checked={beta}
                      onChange={(e) => setBeta(e.target.checked)}
                    />
                    <span className={styles.checkBox} aria-hidden="true" />
                    <span>
                      출시 전 테스트에 참여할 의향이 있어요 <span className={styles.optional}>(선택)</span>
                    </span>
                  </label>

                  <Button type="submit" size="md" block>
                    출시 알림 신청하기
                  </Button>
                  <p className={styles.note}>데모 화면이라 입력한 정보는 어디에도 전송되지 않습니다.</p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
