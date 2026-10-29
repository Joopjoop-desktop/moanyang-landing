import logo from '../assets/figma/logo.svg';
import styles from './Logo.module.css';

/** Figma 랜딩 Nav 로고 (199 × 49): 캐릭터 + MoaNyang 글자 + 아래 받침 막대 */
export function Logo() {
  return <img className={styles.logo} src={logo} width={199} height={49} alt="" />;
}
