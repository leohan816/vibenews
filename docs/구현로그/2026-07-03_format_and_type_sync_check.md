# 2026-07-03 · 포맷 & EventLog payload 타입 동기화 점검

> 기능 추가/UI 동작 변경/수집·TTS·백엔드 구현 없음. 오직 포맷·타입 정합성만 정리.

## 1. EventLog.payload 타입 (진단 결과)
- **로컬 정상**: `src/data/types.ts:192`, `설계문서/10_DataModel:289` 모두 `payload: Record<string, unknown>;`.
- **GitHub raw 원본도 정상**: `raw.githubusercontent.com/.../types.ts` 확인 → `payload: Record<string, unknown>;`.
- `tsc --noEmit` 0 에러 (만약 `Record;`였다면 "Generic type 'Record' requires 2 type argument(s)" 에러가 났을 것).
- **결론**: 파일 손상이 아니라 **GitHub 마크다운 렌더링 착시**(프로즈에서 `<...>`가 HTML 태그로 오인). 실제로 프로즈(코드펜스/백틱 밖)에 노출된 제네릭은 **없음**(전부 코드펜스·인라인코드 안). → **수정 불필요, 이미 올바름.**

## 2. 실제로 있었던 포맷 문제
- `src/data/mockData.ts`의 `topicClusters`가 160자 **긴 한 줄**(Phase 2에서 추가, prettier 100 기준 초과, 나머지 배열과 불일치).
- 설계문서 `.md`에 긴 프로즈/표 줄(00:243자, 13:285자 등) — raw 가독성 저하.
- 1차 md 정리 시 임베디드 TS가 **쌍따옴표**로 바뀌어 코드(홑따옴표)와 기준 어긋남 → **재정리로 홑따옴표 통일**.

## 3. 수정 방식 (Prettier, 내용 보존)
- `src/**/*.{ts,tsx}`: `--single-quote --print-width 100 --bracket-same-line` → mockData topicClusters 등 여러 줄 정리.
- `설계문서/00·03·10·13`: `--prose-wrap always --print-width 100 --single-quote` → 긴 프로즈 줄바꿈 + 표 정렬 + **임베디드 TS 홑따옴표(코드와 동일 기준)**.
- 프로젝트에 prettier 툴/설정은 **커밋하지 않음**(CLI 실행).

## 4. 검증
- 내용 보존: 10_DataModel export 타입 55개·## 헤딩 7개, 13 표행 37개, types.ts export 25개, topicClusters 4개 — **정리 전후 불변**.
- 기준 통일: 10_DataModel `.md` ts블록 쌍따옴표 0개(홑따옴표만) = `src` 코드와 동일.
- `npx tsc --noEmit` → 0 에러. 웹 번들 성공, route 13개 유지. 보안: `.env`/API key/raw transcript/실사용자 데이터 없음.

## 5. 결론
- EventLog.payload는 **원래 올바름**(수정 없음). `Record;`는 렌더링 착시.
- 포맷만 정리(mockData 줄바꿈 + 설계문서 가독성 + 코드/문서 따옴표 기준 통일). 설계 내용·기능·UI·mock 의미 **불변**.
