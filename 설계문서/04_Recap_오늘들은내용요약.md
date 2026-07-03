# 04. Recap · 오늘 들은 내용 요약

## 목적
들은 정보를 **지식 자산**으로 바꾸는 VibeNews 핵심 기능. 오늘 들은 모든 내용을 자동+수동으로 요약한다.

## 사용자 경험
- 기본은 **밤 자동 요약**.
- 사용자가 "오늘 들은 거 요약해줘"처럼 요청하면 **즉시 요약** 가능.
- 출력 방식: **음성 + 텍스트 + 저장 카드**.
- 포함 항목:
  - 오늘 들은 핵심 흐름 5개
  - 오늘 반복해서 나온 키워드
  - 내 관심사와 연결되는 포인트
  - 나중에 다시 봐야 할 소스 요약
  - 실행 아이디어
  - 놓치면 아까운 뉴스
  - 추가 학습 질문

## 화면 구성
- Recap(탭): `오늘 Recap 카드(대표)` + `지난 Recap 목록`. "지금 요약하기" 버튼(mock).
- DailyRecapDetail: 위 포함 항목들을 섹션으로. 상단에 음성 재생바(placeholder), 하단에 "카드로 저장" 버튼.

## 데이터 모델
`DailyRecap`, `RecapCard`, `ListeningHistory` (→ [10_DataModel](10_DataModel_데이터구조.md))

## 현재 상태
**mock** — Recap 데이터 하드코딩. "지금 요약하기"는 mock 결과 표시. 음성은 placeholder.

## 구현할 컴포넌트
- `RecapCardPreview`
- `RecapSection` (제목 + 리스트)
- `RecapAudioBar` (placeholder)
- `GenerateRecapButton` (mock)

## 구현 전 확인사항
- Recap 자동 생성 기본 시각(예: 밤 11시) — Settings와 연동 표기.

## 나중에 연결될 기능
청취 로그 기반 실제 요약(AI), TTS 음성 Recap, Foundation 후보 자동 추출.

## 구현 체크리스트
- [ ] 오늘 Recap 대표 카드 + 지난 목록
- [ ] DailyRecapDetail에 7개 포함 항목 섹션 표시
- [ ] "지금 요약하기"(mock) 동작
- [ ] "카드로 저장" → Saved 반영(mock)
