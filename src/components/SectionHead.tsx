import type { ReactNode } from 'react';
import styles from './SectionHead.module.css';

type Props = { id: string; eyebrow: string; title: ReactNode; aside?: ReactNode };

export function SectionHead({ id, eyebrow, title, aside }: Props) {
  return (
    <div className={styles.head}>
      <div className={styles.text}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}
