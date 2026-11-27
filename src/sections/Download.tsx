import { useState } from 'react';
import { SectionHead } from '../components/SectionHead';
import styles from './Download.module.css';

/*
 * 다운로드 섹션 — 버튼은 데스크톱 저장소의 최신 Release 설치 파일로 바로 연결됩니다.
 * releases/latest/download/파일이름 주소라서, 새 버전을 Publish해도 파일 이름만 같으면 여기는 고치지 않아도 됩니다.
 */

type OsKey = 'windows' | 'macos';

function WindowsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 5.1 10.4 4v7.1H3V5.1Zm8.4-1.2L21 2.5v8.6h-9.6V3.9ZM3 12.9h7.4V20L3 18.9v-6Zm8.4 0H21v8.6l-9.6-1.4v-7.2Z" />
    </svg>
  );
}

function AppleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.2 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.4-1-2.4-3.9ZM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4Z" />
    </svg>
  );
}

type Step = { title: string; note?: string };

const RELEASE_URL = 'https://github.com/Joopjoop-desktop/moanyang-desktop/releases/latest/download';

/*
 * 설치 파일·지원 환경은 랜딩 이슈 #1, 데스크톱 배포 이슈(moanyang-desktop#42) 기준입니다.
 * 코드 서명이 없어 처음 실행할 때 보안 경고가 뜰 수 있어, 그 넘기는 방법을 단계에 함께 적었습니다.
 */
const OS: Record<OsKey, { name: string; Icon: typeof AppleIcon; requirement: string; file: string; href: string; steps: Step[] }> = {
  windows: {
    name: 'Windows',
    Icon: WindowsIcon,
    requirement: 'Windows 10 이상',
    file: '.exe',
    href: `${RELEASE_URL}/MoaNyang-Setup.exe`,
    steps: [
      { title: '설치 파일을 내려받아요' },
      {
        title: '파일을 열고 안내대로 설치해요',
        note: '‘Windows의 PC 보호’ 창이 뜨면 ‘추가 정보 → 실행’을 눌러 주세요.',
      },
      { title: '모아냥을 실행하면 끝이에요' },
    ],
  },
  macos: {
    name: 'macOS',
    Icon: AppleIcon,
    requirement: 'Apple 실리콘(M1 이후) 전용',
    file: '.dmg',
    href: `${RELEASE_URL}/MoaNyang-arm64.dmg`,
    steps: [
      { title: '설치 파일을 내려받아요' },
      { title: '파일을 열고 모아냥을 응용 프로그램 폴더로 옮겨요' },
      {
        title: '모아냥을 실행하면 끝이에요',
        note: '열리지 않으면 시스템 설정 → 개인정보 보호 및 보안에서 ‘확인 없이 열기’를 눌러 주세요.',
      },
    ],
  },
};

function detectOs(): OsKey {
  if (typeof navigator === 'undefined') return 'macos';
  return /Mac|iPhone|iPad/i.test(navigator.userAgent) ? 'macos' : 'windows';
}

function DownloadButton({ os }: { os: OsKey }) {
  const { Icon, name, file, href } = OS[os];
  return (
    <a className={styles.button} href={href}>
      <Icon size={18} />
      {name}용 다운로드
      <span className={styles.file}>{file}</span>
    </a>
  );
}

const Title = () => (
  <>
    쓰는 컴퓨터에 맞춰
    <br />
    바로 설치하세요.
  </>
);

/** Windows / macOS 탭을 누르면 설치 단계와 버튼이 바뀝니다. 처음에는 접속한 컴퓨터의 OS를 보여줍니다. */
export function Download() {
  const [os, setOs] = useState<OsKey>(detectOs);
  const cur = OS[os];
  return (
    <section id="download" className={styles.section} aria-labelledby="download-title">
      <div className="container">
        <SectionHead id="download-title" eyebrow="다운로드" title={<Title />} />
        <div className={styles.tabs} role="tablist" aria-label="운영체제">
          {(['windows', 'macos'] as OsKey[]).map((k) => {
            const { Icon, name } = OS[k];
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={os === k}
                className={`${styles.tab} ${os === k ? styles.tabOn : ''}`}
                onClick={() => setOs(k)}
              >
                <Icon size={16} />
                {name}
              </button>
            );
          })}
        </div>
        <div className={styles.tabPanel} role="tabpanel">
          <ol className={styles.steps}>
            {cur.steps.map((s, i) => (
              <li key={s.title} className={styles.step}>
                <span className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.stepBody}>
                  <span className={styles.stepText}>{s.title}</span>
                  {s.note && <span className={styles.stepNote}>{s.note}</span>}
                </span>
              </li>
            ))}
          </ol>
          <div className={styles.tabAction}>
            <DownloadButton os={os} />
            <p className={styles.meta}>{cur.requirement}</p>
            <p className={styles.mobileNote}>모아냥은 데스크톱 앱이에요. 컴퓨터에서 내려받아 주세요.</p>
          </div>
        </div>
        <p className={styles.footnote}>설치 방법은 정식 배포에 맞춰 바뀔 수 있어요.</p>
      </div>
    </section>
  );
}
