import character from '../assets/figma/character-default.png';
import lettering from '../assets/figma/logo-lettering.png';
import styles from './Logo.module.css';

/** Figma 랜딩 Nav 로고 (199 × 49): 캐릭터 + MoaNyang 글자 + 아래 받침 막대 */
export function Logo() {
  return (
    <span className={styles.logo}>
      <span className={styles.lettering} style={{ maskImage: `url(${lettering})`, WebkitMaskImage: `url(${lettering})` }} />
      <span className={styles.bar} />
      {/* 앞발이 막대 위에 걸치도록 마지막에 그립니다 */}
      <img className={styles.character} src={character} alt="" />
    </span>
  );
}
