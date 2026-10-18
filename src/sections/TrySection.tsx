import { SectionHead } from '../components/SectionHead';
import { TryPanel } from '../features/try-panel/TryPanel';
import infoIcon from '../assets/figma/icon-info-sm.svg';
import styles from './TrySection.module.css';

export function TrySection() {
  return (
    <section id="try" className={styles.section} aria-labelledby="try-title">
      <div className="container">
        <SectionHead
          id="try-title"
          eyebrow="직접 정리해 보기"
          title={
            <>
              메일 하나, 카톡 하나.
              <br />세 번 누르면 일정이 됩니다.
            </>
          }
          aside={
            <p className={styles.note}>
              <img src={infoIcon} width={14} height={14} alt="" />
              예시 데이터로 동작하는 데모입니다
            </p>
          }
        />
        <TryPanel />
      </div>
    </section>
  );
}
