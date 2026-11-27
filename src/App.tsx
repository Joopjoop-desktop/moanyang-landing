import { MotionConfig } from 'motion/react';
import { Nav } from './sections/Nav';
import { Hero } from './sections/Hero';
import { TrySection } from './sections/TrySection';
import { Values } from './sections/Values';
import { Download } from './sections/Download';
import { Notify } from './sections/Notify';
import { Footer } from './sections/Footer';

export function App() {
  return (
    // 운영체제의 '동작 줄이기' 설정을 따릅니다 (transform 애니메이션 생략)
    <MotionConfig reducedMotion="user">
      <div id="top" />
      <Nav />
      <main>
        <Hero />
        <Values />
        <TrySection />
        <Download />
        <Notify />
      </main>
      <Footer />
    </MotionConfig>
  );
}
