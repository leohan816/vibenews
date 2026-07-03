# 07. Product · 개인화 상품 추천

## 목적
건강/뷰티/보충제 관련 뉴스와 연결되는 **개인화 상품 추천**. 단순 관련 상품이 아니라 개인화 커머스 방향.

## 사용자 경험
- 초기에는 **mock 카드**.
- 표현은 안전하게:
  - "관련 키워드 기반 상품"
  - "오늘 들은 주제와 연결된 제품"
  - "관심사 기반 제품"
- **피해야 할 표현(금지):** 치료합니다 / 예방합니다 / 이걸 먹어야 합니다 / 질병 개선 추천.
- 나중에 Foundation 기억, 건강/피부 관심사, 구매 이력과 연결 가능.

## 화면 구성
- ProductRecommendation: 상단 안내(개인화 기반 설명) → `상품 카드 목록`.
- 카드: 이미지(placeholder) + 상품명 + "왜 추천되었는가(관심사/키워드 연결)" + 안전 문구.

## 데이터 모델
`ProductRecommendation` (→ [10_DataModel](10_DataModel_데이터구조.md))

## 현재 상태
**mock** — 상품 카드 하드코딩. 실제 커머스/추천 로직 없음.

## 구현할 컴포넌트
- `ProductCard` (안전 표현 라벨 포함)
- `RecommendationReason` (키워드/관심사 연결 설명)

## 구현 전 확인사항
- 의료/효능 단정 표현 필터 문구 확정.
- 진입 지점(재생 화면 / 카드 / Recap) 확정.

## 나중에 연결될 기능
Foundation 관심사·구매 이력 연동, 실제 상품 카탈로그, 개인화 랭킹.

## 구현 체크리스트
- [ ] 상품 카드 목록(mock)
- [ ] 추천 이유(키워드/관심사) 표시
- [ ] 금지 표현 미사용(안전 문구만)
- [ ] "준비 중/mock" 배지 표시

## 콘텐츠 유형 · 이미지 상세페이지 (OCR)

### 개요
쇼핑몰 상품 상세는 대부분 **긴 이미지 한 장(상세페이지)** 에 성분·용량·수치·효능 문구가 그려져 있어, 일반 웹 파싱으로는 텍스트를 얻지 못한다. 이를 다루기 위해 taxonomy의 **contentKind에 `product_detail`(상품 상세)** 를 포함하고, 이미지 기반 상세페이지는 **OCR로 텍스트·수치를 추출**해 ContentItem으로 편입한다.

- taxonomy 3축 배치(정본 그대로):
  - **sourceType**: `image` (또는 상세페이지를 감싼 `web`/`html`)
  - **contentKind**: `product_detail`
  - **topicCategory**: `K-Beauty` / `Beauty` / `Health` / `Lifestyle` 등 상품 성격에 맞게
- 수집 도구는 core에 직접 의존하지 않고 **SourceAdapter로 감싼다**(OCR 엔진도 어댑터 뒤 교체 가능한 후보). 원문 이미지 전체를 장기 저장하지 않고 **추출 텍스트·핵심 수치·메타 중심**으로 보관(원문 전체 저장 회피 정책).

### 파이프라인 편입(상세페이지 이미지 기준)
```
상품 상세 이미지(URL/파일)
  → SourceAdapter(image)  // yt-dlp/curl 등 특정 도구 비의존, 어댑터로 격리
  → OCR 추출 (future/mock)  // 텍스트 + 수치 후보 + confidence
  → OcrExtractionResult      // 수치 오독 위험 관리
  → analysis(요약/인사이트) + taxonomy(product_detail)
  → Content Intelligence JSON = ContentItem 등록
  → Global News Pool → Personal Briefing Plan 조립
```
(공통 파이프라인은 [08_Pipeline](08_Pipeline_수집처리.md) / 타입 정본은 [10_DataModel](10_DataModel_데이터구조.md) 참조.)

### OCR 수치 오독 위험 관리 — `OcrExtractionResult`
OCR은 특히 **숫자·단위 오독**(예: `50mg` ↔ `500mg`, `0.1%` ↔ `0.7%`, `O`↔`0`, `l`↔`1`) 위험이 크다. 상품의 성분·용량 수치는 안전과 직결되므로 별도 결과 타입으로 신뢰도와 위험을 명시한다. (설계 레벨 서술, 실제 구현 아님 — future/mock. 타입 정본은 [10_DataModel](10_DataModel_데이터구조.md).)

| 필드 | 의미 | 용도 |
|---|---|---|
| `ocrConfidence` | OCR 텍스트 전체/영역별 신뢰도(0~1) | 낮으면 노출 보류·재검토 큐 |
| `numericRisk` | 추출 수치의 오독 위험도(low/medium/high) | 단위·자릿수 애매·저해상도 시 상향 |
| `needsHumanCheck` | 사람 검수 필요 플래그 | 핵심 수치는 게시 전 human verification 게이트 |

- **핵심 수치(성분 함량·용량·가격 등)는 human verification 통과 전까지 단정 노출 금지.** 미검증 값은 "원문 표기 확인 필요" 등 유보 표현으로 처리.
- `numericRisk=high` 또는 `ocrConfidence` 임계 미만 → 자동으로 `needsHumanCheck=true`, 브리핑 조립에서 수치 인용 보류.
- 추출 실패/저신뢰 수치는 브리핑 스크립트(audioScript)에서 **읽어주지 않음**(오독 낭독 방지).

### 안전 표현 원칙(기존 유지)
- 상세페이지 문구를 OCR로 그대로 가져오더라도 **치료/예방/복용 단정 금지** 원칙은 동일 적용.
- 금지: "치료합니다 / 예방합니다 / 이걸 먹어야 합니다 / 질병 개선".
- 허용: "관련 키워드 기반 상품", "오늘 들은 주제와 연결된 제품", "원문 표기 기준" 같은 유보·출처 명시 표현.
- OCR로 뽑은 효능성 문구는 **상품 판매자 표기 인용**임을 드러내고, VibeNews의 단정으로 재서술하지 않는다.

### 현재 상태
**future/mock** — OCR 엔진·`OcrExtractionResult`·human verification 게이트 모두 설계 단계. 실제 추출/검수 로직 없음.

### 구현 체크리스트(OCR 상세페이지)
- [ ] contentKind `product_detail` 분류 반영
- [ ] image SourceAdapter로 OCR 격리(도구 비의존)
- [ ] `OcrExtractionResult`(ocrConfidence/numericRisk/needsHumanCheck) 관리
- [ ] 핵심 수치 human verification 게이트(미검증 시 유보 표현)
- [ ] 저신뢰 수치 audioScript 낭독 제외
- [ ] 안전 표현(치료/예방/복용 단정 금지) 필터 적용
