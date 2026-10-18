import { ButtonLink } from '../components/Button';
import { HeroDemo } from '../features/hero-demo/HeroDemo';
import infoIcon from '../assets/figma/icon-info.svg';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className="container">
        <div className={styles.top}>
          <div className={styles.headline}>
            <p className={styles.eyebrow}>Windows · macOS 데스크톱 앱 — 현재 개발 중</p>
            <h1 id="hero-title" className={styles.title}>
              메일로 온 업무,
              <br />
              카톡으로 온 마감.
              <br />
              <span className={styles.marked}>합치면 하나의 일정.</span>
            </h1>
          </div>
          <div className={styles.copy}>
            <p className={styles.lede}>
              필요한 메시지만 골라 모아냥에 넣으세요. 할 일은 카드로 정리되고, 나중에 온 일정은 기존 카드에 합쳐 캘린더에
              올라갑니다.
            </p>
            <div className={styles.cta}>
              <ButtonLink href="#try" size="md">
                직접 정리해 보기
              </ButtonLink>
              <ButtonLink href="#notify" size="md" variant="ghost">
                출시 알림 받기
              </ButtonLink>
            </div>
            <p className={styles.fine}>
              <img src={infoIcon} width={16} height={16} alt="" />
              메일·메신저를 자동으로 읽지 않아요. 직접 고른 내용만 정리합니다.
            </p>
          </div>
        </div>
        <HeroDemo />
      </div>
    </section>
  );
}
