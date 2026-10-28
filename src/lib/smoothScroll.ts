/**
 * 페이지 안 링크(#try, #notify 등)를 누르면 부드럽게 스크롤합니다.
 *
 * CSS `scroll-behavior: smooth`는 운영체제에서 애니메이션 효과를 끄면 브라우저가 즉시 이동으로 바꿔 버리므로,
 * 매 프레임 직접 위치를 옮겨서 설정과 관계없이 같은 움직임을 보여줍니다.
 */

const easeInOutCubic = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

/** 이동 거리에 따라 0.45–0.9초 */
const durationFor = (distance: number) => Math.min(900, Math.max(450, Math.abs(distance) * 0.45));

let frame = 0;

function stop() {
  cancelAnimationFrame(frame);
  frame = 0;
}

function scrollToY(targetY: number) {
  stop();
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 1) return;
  const duration = durationFor(distance);
  const startTime = performance.now();

  const step = (now: number) => {
    const u = Math.min(1, (now - startTime) / duration);
    window.scrollTo({ top: startY + distance * easeInOutCubic(u), behavior: 'instant' });
    frame = u < 1 ? requestAnimationFrame(step) : 0;
  };
  frame = requestAnimationFrame(step);
}

/** 고정 헤더에 가리지 않도록 html의 scroll-padding-top만큼 덜 내려갑니다 */
function targetYOf(el: Element) {
  const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  return Math.min(maxY, Math.max(0, el.getBoundingClientRect().top + window.scrollY - padding));
}

export function installSmoothScroll() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as Element).closest?.('a[href^="#"]');
    const hash = link?.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    // 화면에 없는 곳(모바일에서 숨긴 섹션 등)은 브라우저 기본 동작에 맡깁니다
    if (!target || target.getClientRects().length === 0) return;

    e.preventDefault();
    history.pushState(null, '', hash);
    scrollToY(targetYOf(target));
    // 키보드 사용자를 위해 이동한 곳으로 초점도 옮깁니다 (스크롤은 직접 하므로 막아 둡니다)
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  // 움직이는 중에 사용자가 직접 스크롤하면 바로 멈춥니다
  for (const type of ['wheel', 'touchstart', 'keydown'] as const) {
    window.addEventListener(type, () => frame && stop(), { passive: true });
  }
}
