import { useId, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '../components/Button';
import { trackNotifySubmit } from '../lib/analytics';
import { joinWaitlist, type Os } from '../lib/waitlist';
import badgeDot from '../assets/figma/badge-dot.svg';
import styles from './Notify.module.css';

const OS_OPTIONS: { value: Os; label: string }[] = [
  { value: 'windows', label: 'Windows' },
  { value: 'macos', label: 'macOS' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * 개인정보 수집·이용 동의 안내 (개인정보 보호법 제15조 제2항의 고지 4항목).
 * 문구는 초안입니다 — 개인정보보호위원회 '개인정보 처리 동의 안내서' 기준으로 최종 확인이 필요합니다.
 * 내용을 바꾸면 PRIVACY_VERSION도 함께 올려서, 누가 어떤 안내에 동의했는지 구분되게 합니다.
 */
export const PRIVACY_VERSION = '2026-10-22';

const PRIVACY_NOTICE: { label: string; value: string }[] = [
  { label: '수집 항목', value: '이메일, 사용하는 OS, 출시 전 테스트 참여 의향' },
  { label: '수집 목적', value: '출시 알림 및 출시 전 테스트 안내 메일 발송' },
  { label: '보유·이용 기간', value: '출시 알림 발송 후 지체 없이 파기 (동의를 철회하면 즉시 파기)' },
  {
    label: '동의 거부 권리',
    value: '동의를 거부할 수 있으며, 거부하면 출시 알림을 받을 수 없습니다.',
  },
];

type Errors = { email?: string; os?: string; privacy?: string };

function validate(email: string, os: Os[], privacy: boolean): Errors {
  const errors: Errors = {};
  if (!email.trim()) errors.email = '이메일을 입력해 주세요.';
  else if (!EMAIL_RE.test(email.trim())) errors.email = '이메일 형식을 확인해 주세요.';
  if (os.length === 0) errors.os = '사용하는 OS를 하나 이상 골라 주세요.';
  if (!privacy) errors.privacy = '출시 알림을 받으려면 개인정보 수집·이용에 동의해 주세요.';
  return errors;
}

/** 'Windows', 'macOS', 'Windows · macOS' */
function osLabel(os: Os[]) {
  return OS_OPTIONS.filter((o) => os.includes(o.value))
    .map((o) => o.label)
    .join(' · ');
}

export function Notify() {
  const uid = useId();
  const [email, setEmail] = useState('');
  const [os, setOs] = useState<Os[]>([]);
  const [beta, setBeta] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  /** 저장 자체가 실패했을 때 (네트워크 등) 폼 아래에 보여줄 안내 */
  const [formError, setFormError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const focusOnMount = useRef(false);

  const ids = {
    email: `${uid}-email`,
    emailErr: `${uid}-email-err`,
    os: `${uid}-os`,
    osErr: `${uid}-os-err`,
    beta: `${uid}-beta`,
    privacy: `${uid}-privacy`,
    privacyErr: `${uid}-privacy-err`,
    notice: `${uid}-notice`,
  };

  function toggleOs(value: Os) {
    setOs((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    if (errors.os) setErrors((p) => ({ ...p, os: undefined }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);
    const next = validate(email, os, privacy);
    setErrors(next);
    if (next.email) {
      emailRef.current?.focus();
      return;
    }
    if (next.os) {
      document.getElementById(`${ids.os}-${OS_OPTIONS[0].value}`)?.focus();
      return;
    }
    if (next.privacy) {
      document.getElementById(ids.privacy)?.focus();
      return;
    }

    setSubmitting(true);
    const result = await joinWaitlist({ email, os, betaOptIn: beta, privacyVersion: PRIVACY_VERSION });
    setSubmitting(false);

    if (result === 'duplicate') {
      setErrors({ email: '이미 신청하셨어요.' });
      emailRef.current?.focus();
      return;
    }
    if (result === 'error') {
      setFormError('신청을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }

    focusOnMount.current = true;
    setSubmitted(true);
    trackNotifySubmit({ os, betaOptIn: beta });
  }

  function reset() {
    focusOnMount.current = true;
    setSubmitted(false);
    setEmail('');
    setOs([]);
    setBeta(false);
    setPrivacy(false);
    setNoticeOpen(false);
    setErrors({});
    setFormError(null);
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
                    {osLabel(os)} 버전이 준비되면 알려드릴게요.
                    {beta && ' 출시 전 테스트 소식도 함께 보내드릴게요.'}
                    <br />
                    신청 확인 메일은 곧 보내드릴게요.
                  </p>
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
                    <legend className={styles.label}>
                      사용하는 OS <span className={styles.optional}>(여러 개 선택 가능)</span>
                    </legend>
                    <div className={styles.osOptions}>
                      {OS_OPTIONS.map((o) => {
                        const on = os.includes(o.value);
                        return (
                          <label key={o.value} className={`${styles.os} ${on ? styles.osOn : ''}`}>
                            <input
                              id={`${ids.os}-${o.value}`}
                              className="visually-hidden"
                              type="checkbox"
                              name="os"
                              value={o.value}
                              checked={on}
                              onChange={() => toggleOs(o.value)}
                            />
                            {o.label}
                          </label>
                        );
                      })}
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

                  {/* 개인정보 수집·이용 동의 (필수) */}
                  <div className={styles.consent}>
                    <div className={styles.consentRow}>
                      <label className={styles.check} htmlFor={ids.privacy}>
                        <input
                          id={ids.privacy}
                          className={styles.checkInput}
                          type="checkbox"
                          checked={privacy}
                          onChange={(e) => {
                            setPrivacy(e.target.checked);
                            if (errors.privacy) setErrors((p) => ({ ...p, privacy: undefined }));
                          }}
                          aria-invalid={!!errors.privacy}
                          aria-describedby={errors.privacy ? ids.privacyErr : undefined}
                          required
                        />
                        <span className={styles.checkBox} aria-hidden="true" />
                        <span>
                          <span className={styles.required}>[필수]</span> 개인정보 수집·이용에 동의해요
                        </span>
                      </label>
                      <button
                        type="button"
                        className={styles.noticeToggle}
                        aria-expanded={noticeOpen}
                        aria-controls={ids.notice}
                        onClick={() => setNoticeOpen((v) => !v)}
                      >
                        {noticeOpen ? '접기' : '보기'}
                      </button>
                    </div>
                    {noticeOpen && (
                      <dl id={ids.notice} className={styles.notice}>
                        {PRIVACY_NOTICE.map((n) => (
                          <div key={n.label} className={styles.noticeRow}>
                            <dt>{n.label}</dt>
                            <dd>{n.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {errors.privacy && (
                      <p id={ids.privacyErr} className={styles.error}>
                        {errors.privacy}
                      </p>
                    )}
                  </div>

                  <Button type="submit" size="md" block disabled={submitting} aria-busy={submitting}>
                    {submitting ? '신청하는 중…' : '출시 알림 신청하기'}
                  </Button>
                  {formError && (
                    <p className={styles.error} role="alert">
                      {formError}
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
