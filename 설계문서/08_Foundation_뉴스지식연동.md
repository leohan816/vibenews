# 08. Foundation · 뉴스 지식 연동

## 목적
가치 있는 뉴스 지식을 장기 지식 저장소(Foundation)에 축적한다. 초기에는 VibeNews 내부에 저장하고, 나중에 Foundation으로 보낸다.

## 사용자 경험
- 초기에는 VibeNews 내부 저장.
- 나중에 Foundation에 **"뉴스 지식"**으로 저장. 기존 일반 지식과 구분:
  - `knowledgeSource = vibenews`
  - `knowledgeClass = news_knowledge`
  - `freshness = time_sensitive`
- FoundationCandidate 화면에서 후보를 검토/승인/거부.

## Foundation에 저장할 것
검증된 사실 · 반복적으로 나타난 흐름 · 사용자와 연결되는 인사이트 · 실행 아이디어 · 저장한 카드 · Daily Recap 핵심 · 추가 학습 질문 · 상품/성분/시장 연결 정보.

## Foundation에 저장하지 말 것
원문 전체 · 무가치한 단기 노이즈 · 중복 정보.

## 화면 구성
- FoundationCandidate: `상태 필터` → `후보 카드 목록`. 각 후보에 지식 유형, 요약, 출처 메타, 상태 배지, 승인/거부 버튼(mock).

## 데이터 모델
`KnowledgeCandidate` (필드/상태 → [10_DataModel](10_DataModel_데이터구조.md))
- 상태: `local_only | candidate | approved_for_foundation | synced_to_foundation | rejected`

## 현재 상태
**future / mock** — 후보 목록 mock. 실제 Foundation 동기화 없음.

## 구현할 컴포넌트
- `CandidateCard` (상태 배지 + 승인/거부)
- `CandidateStatusFilter`

## 구현 전 확인사항
- Foundation 연동 인터페이스(미정) — 지금은 내부 상태만.

## 나중에 연결될 기능
실제 Foundation API 동기화, 자동 후보 추출, 중복/노이즈 필터.

## 구현 체크리스트
- [ ] 후보 목록 + 상태 배지
- [ ] 상태 필터 동작
- [ ] 승인/거부(mock) 상태 변경
- [ ] 원문 전체 미저장 원칙 반영(요약/지식만)
