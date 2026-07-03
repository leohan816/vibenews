# 2026-07-03 · 코드 포맷 정리

기능/동작/데이터 내용을 바꾸지 않고, TS/TSX 소스를 사람이 읽기 좋은 포맷으로 정리했다.

## 방법
- **Prettier**(v3)로 일괄 포맷. 결정적(deterministic)이며 AST 의미를 보존해 "기능 변경 없음"이 보장된다.
- 프로젝트에 툴을 추가하지 않기 위해 **설정 파일/devDependency 없이 CLI 플래그로만** 실행:
  `prettier --single-quote --print-width 100 --bracket-same-line --write "src/**/*.{ts,tsx}"`
- 이 설정은 Expo 템플릿 스타일과 일치 → 템플릿 파일(themed-text, collapsible 등)은 **변경 없음**.

## 포맷 정리 대상 (17개 파일)
- `src/app/(tabs)/`: _layout, index, recap, saved, settings
- `src/app/`: briefing-session, explore-more, foundation-candidate, product-recommendation, saved-card-detail, schedule-briefing, voice-command
- `src/components/`: ambient-visual, category-card, chapter-controls
- `src/data/`: mockData.ts, types.ts

주요 개선: mockData의 긴 한 줄 객체(최대 483자) → 객체/필드별 여러 줄, interface 필드별 줄바꿈 유지, JSX 계층적 줄바꿈, StyleSheet 속성별 줄바꿈, import 정렬.

## 기능 변경 없음
- 화면/동작/데이터 내용/route 이름/mock 값 **모두 그대로**. 공백·줄바꿈·트레일링 콤마만 변경.
- `EventLog.payload` 타입은 `Record<string, unknown>` 확인(types.ts).
- 설계문서/docs 내용은 변경하지 않음.

## 검증 결과
- `npx tsc --noEmit` → **0 에러** (의미 보존 확인)
- `npm run web` → HTTP 200, 번들 성공(832 modules)
- route 파일 13개 + _layout 2개 전부 유지
- `git diff --ignore-all-space` → 실질 변경은 줄 재배치/트레일링 콤마뿐(로직 변경 없음)

## 다음 단계
포맷 정리 완료. 이제 다음 기능 블록(예: 본문 추출 백엔드 또는 TTS)의 설계문서를 먼저 업데이트한 뒤 구현으로 진행한다.
