import cat from '../assets/figma/cat.svg';
import styles from './Logo.module.css';

export function Logo() {
  return (
    <span className={styles.logo}>
      <img className={styles.cat} src={cat} width={36} height={34} alt="" />
      <span className={styles.name}>모아냥</span>
      <span className={styles.en}>MoaNyang</span>
    </span>
  );
}
