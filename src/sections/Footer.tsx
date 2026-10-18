import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={`container ${styles.footer}`}>
      <p>모아냥 (MoaNyang) · 개발 중인 데스크톱 앱</p>
      <p>이 페이지의 메시지와 일정은 모두 예시입니다.</p>
    </footer>
  );
}
