import { motion } from 'motion/react';
import characterStart from '../../assets/figma/character-start.png';
import characterOpenMouth from '../../assets/figma/character-open-mouth.png';
import characterEating from '../../assets/figma/character-eating.png';
import characterDefault from '../../assets/figma/character-default.png';
import styles from './CatFace.module.css';

/** Figma '캐릭터 최종'의 네 가지 표정 */
export type CatMood = 'start' | 'openMouth' | 'eating' | 'default';

const MOODS: Record<CatMood, string> = {
  start: characterStart,
  openMouth: characterOpenMouth,
  eating: characterEating,
  default: characterDefault,
};

/**
 * 모아냥 캐릭터. 네 표정을 모두 겹쳐 두고 지금 표정만 보여줍니다
 * (처음 바뀔 때 이미지를 새로 불러오느라 깜빡이지 않도록).
 */
export function CatFace({ mood }: { mood: CatMood }) {
  return (
    <span className={styles.wrap}>
      {(Object.keys(MOODS) as CatMood[]).map((m) => (
        <motion.img
          key={m}
          className={styles.character}
          src={MOODS[m]}
          alt=""
          initial={false}
          animate={m === mood ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
          transition={{
            opacity: { duration: 0.15 },
            scale: { type: 'spring', stiffness: 420, damping: 22 },
          }}
        />
      ))}
    </span>
  );
}
