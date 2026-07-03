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

## Raw content / transcript 저장 정책

### 원칙
- **원문 전체 저장 기본 금지.** 저장 카드나 Foundation 후보(`KnowledgeCandidate`)에 원문 전체(full transcript / full article body)를 넣지 않는다.
- VibeNews는 요약/인사이트/메타/스크립트 중심으로만 축적한다. (정책: 원문 전체 저장 회피 → [09_수집파이프라인](09_수집파이프라인.md) · 타입 정본 → [10_DataModel](10_DataModel_데이터구조.md))
- `ContentItem`의 `transcript`는 파이프라인 중간 산출물(temporary cache)이며, 최종 축적 대상이 아니다.

### 저장 가능한 것 (파생/가치 데이터)
| 항목 | 근거 |
| --- | --- |
| 요약(summary) | 원문 대체·재사용 |
| 핵심 포인트(key points) | 브리핑 조립 재료 |
| 인사이트(insights) | 사용자 연결 가치 |
| action ideas | 실행 아이디어 |
| source metadata (`source` / `sourceLocators`) | 재수집·출처 추적용 (원문 아님) |
| audioScript | 재생용 스크립트 |
| taxonomy (sourceType·contentKind·topicCategory) | 분류·필터 |
| claims | 검증된 사실 |

### RawContentStoragePolicy (설계 레벨, future/mock)
원문/transcript 취급 수준을 4단계로 표기한다.

| 값 | 의미 |
| --- | --- |
| `none` | 원문 미보관. 파생물(요약/인사이트)만 남김 |
| `temporary_cache_only` | 파이프라인 처리 동안만 임시 캐시, 처리 후 폐기 |
| `private_internal` | 내부 비공개 보관(공유/Foundation 후보 제외), 필요 최소 기간 |
| `allowed_persistent` | 지속 보관 허용(원문이 이미 짧은 요약/메타 성격일 때) |

### 소스별 기본값
| 소스(sourceType) | 기본 정책 | 비고 |
| --- | --- | --- |
| YouTube transcript | `temporary_cache_only` | transcript → JSON/audioScript 생성 후 폐기 |
| Web article | `temporary_cache_only` 또는 `private_internal` | 원문 본문 지속 보관 금지 |
| RSS summary | `allowed_persistent` 가능 | 제공 요약 자체가 짧은 메타 성격일 때 |
| GitHub | 소스 정책에 따름 | repo/릴리스 라이선스·공개범위 준수 |
| OCR(image/gif) | `private_internal` 또는 `temporary_cache_only` | 추출 텍스트 최소 보관 |

- 소스가 명시하지 않으면 더 보수적인 값(`temporary_cache_only`)을 기본 적용한다.
- 정책 값은 `ContentItem`의 `processing`/`personalization` 메타에 부착(설계 예정, future). 타입 정본은 [10_DataModel](10_DataModel_데이터구조.md).
