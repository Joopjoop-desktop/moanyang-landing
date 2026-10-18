# moanyang-landing

모아냥(MoaNyang) 랜딩페이지입니다. Vite + React + TypeScript로 만든 정적 사이트이고, Motion으로 애니메이션을 넣었습니다.

## 실행

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # dist/ 에 정적 파일 생성
npm run preview   # 빌드 결과 확인
```

개발 모드에서는 `?hero-t=12.5`처럼 주소에 값을 붙이면 히어로 연출을 그 시각에서 멈춘 상태로 볼 수 있습니다.

## Vercel 배포

이 저장소를 Vercel에 import하면 Vite 프로젝트로 자동 인식됩니다. 따로 설정할 것은 없습니다.

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## 구조

```
src/
  styles/tokens.css        Figma Color 변수 → CSS 변수 (예: text/primary → --color-text-primary)
  lib/analytics.ts         분석 이벤트 함수 (아래 참고)
  data/demo.ts             데모에 쓰는 예시 메일·카톡·카드 데이터
  components/
    Scaled.tsx             고정 크기 화면을 비율대로 축소해 보여주는 래퍼
    app/                   모아냥 서비스 화면 (Figma Main2_2, 기준 1336×824): MoaNyangApp, Calendar, TaskCard, CatFace
  features/
    hero-demo/             히어로 자동 재생 연출
      timeline.ts          16단계 스토리보드 → 시간 t에 대한 순수 함수 frameAt(t)
      useHeroClock.ts      재생/일시정지, 화면 밖·탭 숨김일 때 멈춤, 동작 줄이기 대응
    try-panel/             '직접 정리해 보기' 체험
      tryReducer.ts        단계 상태 (히어로와 공유하지 않음)
      useDragToTarget.ts   마우스 드래그로 놓기 (터치는 버튼으로 진행)
  sections/                Nav, Hero, TrySection, Values, Notify, Footer
```

## 분석 이벤트

외부 SDK는 연결하지 않았습니다. `src/lib/analytics.ts`의 아래 함수가 각 행동 시점에 호출되며, 지금은 개발 모드 콘솔과 `moanyang:analytics` DOM 이벤트로만 내보냅니다. 분석 도구를 붙일 때는 같은 파일의 `send()`만 바꾸면 됩니다.

| 함수 | 호출 시점 |
| --- | --- |
| `trackHeroPlay(source)` | 히어로 연출이 처음 자동 재생될 때(`auto`), 사용자가 재생 버튼을 누를 때(`user`) |
| `trackTryStart(method)` | 체험에서 메일을 처음 넣을 때 (`button` / `drag`) |
| `trackMergeComplete(method)` | 체험에서 두 카드를 합쳤을 때 (`button` / `drag`) |
| `trackNotifySubmit({ os, betaOptIn })` | 출시 알림 신청을 완료했을 때 (이메일은 담지 않음) |

출시 알림 폼은 실제로 아무 데이터도 전송하지 않고 완료 화면만 보여줍니다.
