import { ButtonLink } from '../components/Button';
import { Logo } from '../components/Logo';
import styles from './Nav.module.css';

export function Nav() {
  return (
    <header className={styles.header}>
      <nav className={`container ${styles.nav}`} aria-label="주요 메뉴">
        <a className={styles.logoLink} href="#top" aria-label="모아냥 처음으로">
          <Logo />
        </a>
        <div className={styles.links}>
          <a className={styles.link} href="#try">
            직접 정리해 보기
          </a>
          <a className={styles.link} href="#how">
            이렇게 정리돼요
          </a>
          <ButtonLink href="#notify" size="sm">
            출시 알림 받기
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
