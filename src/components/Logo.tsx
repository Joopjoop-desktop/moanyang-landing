import logo2x from '../assets/figma/logo@2x.png';
import logo3x from '../assets/figma/logo@3x.png';
import styles from './Logo.module.css';

/** Figma 랜딩 Nav 로고 (199 × 49): 캐릭터 + MoaNyang 글자 + 아래 받침 막대 */
export function Logo() {
  return <img className={styles.logo} src={logo2x} srcSet={`${logo2x} 2x, ${logo3x} 3x`} width={199} height={49} alt="" />;
}
