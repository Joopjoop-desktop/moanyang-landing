import { AnimatePresence, motion } from 'motion/react';
import cat from '../../assets/figma/cat.svg';
import catSmile from '../../assets/figma/cat-smile.svg';
import styles from './CatFace.module.css';

/** 모아냥 고양이. 먹이를 받으면 웃는 표정으로 바뀝니다. */
export function CatFace({ smile }: { smile?: boolean }) {
  return (
    <span className={styles.wrap}>
      <AnimatePresence initial={false}>
        {smile ? (
          <motion.img
            key="smile"
            className={styles.smile}
            src={catSmile}
            alt=""
            initial={{ opacity: 0, scale: 0.92, y: 2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          />
        ) : (
          <motion.img
            key="default"
            className={styles.default}
            src={cat}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </span>
  );
}
