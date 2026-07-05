# VibeNews 핸드오프 문서

> 이 문서 하나로 다음 사람이(또는 다음 세션의 AI가) VibeNews의 현재 상태를 파악하고 바로 이어서 작업할 수
> 있도록 정리한다. 최종 업데이트: **2026-07-04** · 최신 커밋: **`8034473`** (master).

---

## 0. 한 문장 정의

**VibeNews는 뉴스를 읽는 앱이 아니라, AI가 세상의 신호(Signal)를 골라 나만의 오디오 브리핑으로 들려주는
앱이다.** ("뉴스/콘텐츠는 공통으로 준비하고, 브리핑은 사용자마다 다르게 조립한다.")

- 시각 정체성: **Neo-Retro AI Radio** (따뜻한 다크 + amber orange, 오디오 단말기 느낌).
- 모바일 우선. Expo(React Native)로 iOS/Android/Web 하나의 코드베이스.

---

## 1. 현재 상태 요약 (2026-07-04)

| 영역 | 상태 |
| --- | --- |
| 설계문서(00~17) | ✅ 제품 전 영역 + Source Pool/Candidate Review/Design Direction까지 문서화 |
| 화면 skeleton(13 route) | ✅ mock 데이터로 전 화면 뼈대 존재 |
| Listen 홈 | ✅ Neo-Retro AI Radio 1차 리디자인 완료 |
| 나머지 탭/화면 | ⚠️ 기존 cream 테마 skeleton (아직 Neo-Retro 미적용) |
| 오디오 재생 | ⚠️ expo-audio 플레이어 블록 존재하나 실제 음원 없음(mock) |
| 백엔드/수집/모델/TTS | ❌ 미구현 (전부 설계만) |

**핵심 원칙**: 지금까지는 **설계문서 우선 + skeleton UI**. 실제 외부 수집·모델 호출·TTS는 아직 하나도
구현하지 않았다(의도적).

---

## 2. 기술 스택 / 실행

- **Expo SDK 57** + **Expo Router**(파일 기반 라우팅, standard `(tabs)` 그룹 + root Stack).
- 오디오: **expo-audio** (`useAudioPlayer`/`useAudioPlayerStatus`), **expo-linear-gradient**.
- 언어: TypeScript. 포맷: **Prettier**(single-quote, print-width 100).
- 상태: 로컬 mock 데이터(`src/data/`), 이벤트 로그는 콘솔 stub(`src/lib/eventLog.ts`).
- **AGENTS.md 규칙**: 코드 작성 전 반드시 `https://docs.expo.dev/versions/v57.0.0/` 확인.

**실행**
```bash
npm install
npx expo start            # 개발
npx expo export -p web    # 정적 웹 번들(검증용)
npx tsc --noEmit          # 타입 체크(항상 0 유지)
```
- 자세한 건 `docs/실행방법.md`, `docs/테스트방법.md`, `docs/환경변수.md`.
- 외부 데모: 정적 web export를 서버 8090 포트로 서빙(변경 후 rebuild+restart). cloudflared 터널로 임시 외부
  접속 가능(ephemeral URL).

**Git**: repo `https://github.com/leohan816/vibenews` · 브랜치 `master` · push는 민감정보 검사 후.

---

## 3. 아키텍처 / 핵심 개념

파이프라인(설계):
```
Source Pool (Editorial/Hot Topic/User/Internal)
  → SourceCandidate (scoring)
  → CandidatePreview  → [사람(MD/Leo) 승인 게이트]
  → fetch/extract (승인분만)
  → Content Intelligence JSON (ContentItem) / VideoContentMap / AnalyticSummary
  → BriefingPlan → SpokenAudioScript
  → DeepSeek 검수 (rubric 10점, 9/10 이상만 통과, 자동수정 최대 2회, 실패 시 human review)
  → TTS-ready → (TTS 생성) → Personal Briefing Assembly (사용자별 조립)
```

핵심 구분(헷갈리기 쉬움):
- **AnalyticSummary ≠ SpokenAudioScript**: 요약 품질 ≠ 음성용 마사지 품질. 청취 지속성은 후자가 결정.
- **taxonomy 3축**: sourceType(어디서) / contentKind(무엇) / topicCategory(주제).
- **계층**: Category(큰 채널) → Subcategory(세부 주제) → TopicCluster(오늘의 흐름/방송) → Tag → Entity.
- **tts_ready(제작 가능) ≠ tts_generated(음원 완료)**.
- **모델 역할 분리**: Worker(Qwen 8B, CandidatePreview) / Builder(더 큰 open-source, 본 분석·스크립트) /
  Verifier(DeepSeek, 검수) / Human editor.
- **SourceAdapter 추상화**: core는 yt-dlp/Agent Reach 같은 특정 도구에 의존하지 않는다.

---

## 4. 설계문서 지도 (`설계문서/`)

| # | 파일 | 내용 |
| --- | --- | --- |
| 00 | 제품_전체지도 | 제품 정의, taxonomy, Source Pool 개요, Neo-Retro 감성, 후보 승인 게이트 |
| 01 | 화면_구조_네비게이션 | 탭/스택 구조, 오디오 단말기 UI 원칙 |
| 02 | Listen_오디오_플레이어 | 재생 화면, 플레이어 디자인 방향 |
| 03 | Briefing_예약_카테고리 | 브리핑 조립, Subcategory, 승인 후 조립 |
| 04 | Recap | 오늘 들은 내용 요약 |
| 05 | Saved_뉴스지식_저장카드 | 저장 카드(원문 전체 저장 금지) |
| 06 | ExploreMore | 더 알아보기, Source Pool↔SourceAdapter |
| 07 | Product_개인화상품추천 | 상품 추천(내부 메타) |
| 08 | Foundation_뉴스지식연동 | Foundation 연동 |
| 09 | Settings | 개인화, Editorial Source/Subcategory 운영(future) |
| 10 | **DataModel** | **타입 정본**. ContentItem·BriefingPlan·SourcePool·EditorialSource·HotTopic·SourceCandidate·QualityPrediction·CandidatePreview·DeepSeekReviewResult·ReviewLoopState 등 |
| 11 | EventLog | 사용 행동 기록(payload: `Record<string, unknown>`) |
| 12 | Implementation_Roadmap | 구현 로드맵, 수집 선행 단계, 승인 게이트 |
| 13 | **FEATURE_INDEX** | **기능 색인 표**(기능→상태→관련 타입→문서) |
| 14 | Video_Briefing_Quality_Strategy | 영상 품질, BriefingMode, Gold Sample, DeepSeek Quality Gate |
| 15 | Source_Pool_and_Editorial_Curation | 소스풀 4유형, 에디토리얼 큐레이션, Hot Topic, Skin Care taxonomy |
| 16 | Candidate_Review_and_TTS_Approval_Pipeline | 후보 승인→검수→TTS-ready 운영 게이트 |
| 17 | Design_Direction_Neo_Retro_AI_Radio | 시각 정체성, 컬러, 용어, 디자인 토큰 초안 |

> 규칙: **새 기능은 반드시 `설계문서/`에 설계 MD를 먼저 쓰고, 사용자와 상의 후 구현.** 큰 기능 블록 하나당
> 설계문서 하나. 구현 후 `설계문서/README.md`·`README.md` 갱신, `docs/구현로그/`에 기록.

---

## 5. 코드 구조 (`src/`)

**Routes (13개, 변경 금지 없이 유지)**
- `(tabs)/`: `index`(Listen 홈) · `briefing` · `recap` · `saved` · `settings`
- root stack: `briefing-session` · `daily-recap-detail` · `explore-more` · `foundation-candidate` ·
  `product-recommendation` · `saved-card-detail` · `schedule-briefing` · `voice-command`

**데이터** `src/data/`
- `types.ts` — 앱 코드용 타입(설계문서 10과 동기화). `TopicCategory`에 **'Skin Care'**(‘K-Beauty’ 제거).
- `mockData.ts` — 전 화면 mock. category id `skincare`(피부관리), topicClusters, savedCards,
  dailyRecap, productRecommendations 등. **K-Beauty는 상품추천 tag로만 잔존.**

**컴포넌트** `src/components/`
- `topic-cluster-card.tsx` — 오늘의 흐름 카드(Neo-Retro 다크, 로컬 `NEO` 토큰).
- `cover-art.tsx`, `chapter-controls.tsx`, `progress-bar.tsx` — 플레이어 관련(아직 cream 테마).
- `card.tsx`·`screen.tsx`·`themed-*`·`section-header.tsx` 등 — 공용(전역 cream 테마 사용).

**lib** `src/lib/`
- `eventLog.ts` — `logEvent(name, payload)` 콘솔 stub.
- `audio.ts` — 오디오 헬퍼.

**테마** `src/constants/theme.ts`
- 전역은 **cream/orange light 테마**. Listen 홈/탭바만 **파일 내부 `NEO` 다크 로컬 토큰** 적용.
- `NEO` 팔레트: bgWarmBlack `#16110D` · surfaceDark `#211A14` · surfaceSoft `#2B2219` · accentAmber
  `#FFA23A` · textCream `#F4EBE0` · textMuted `#A6968A` · signalCoral `#FF6F61` · border `#33281F`.

---

## 6. 이번 세션에 한 일 (커밋 타임라인)

| 커밋 | 내용 |
| --- | --- |
| `8b4c965` | **Source Pool & Editorial Curation** 설계(문서 15 + DataModel 타입 9종) |
| `2f8784e` | **Candidate Review & TTS Approval Pipeline** 설계(문서 16 + 타입 8종) + **K-Beauty→Skin Care** 교체(문서 + 최소 mock 코드) |
| `c4e5ee8` | **Neo-Retro AI Radio 디자인 방향** 문서화(문서 17) |
| `8034473` | **Listen 홈 Neo-Retro 1차 리디자인**(index/topic-cluster-card/_layout) |

(이전: `e587805` 영상 샘플 검증, `e510d51` 영상 품질 전략, `9a4fdc6` 포맷/타입 sync, `bece456` taxonomy UI 등)

각 작업 상세는 `docs/구현로그/2026-07-03_*.md` 참고.

---

## 7. 중요한 결정 사항 (지켜야 할 것)

1. **Skin Care가 top-level category, K-Beauty는 아니다.** K-Beauty는 tag/entity/business
   context(Beauty Export 등)/source context로만. (Skin Care=실용 피부관리 / Beauty=메이크업·산업)
2. **AI가 자동으로 모든 콘텐츠를 음성화하지 않는다.** MD/Leo 승인 게이트 후에만 비싼 분석/스크립트/TTS.
3. **DeepSeek 9/10 품질 게이트**, 자동 수정 **최대 2회**, 실패 시 **human review**.
4. **Neo-Retro AI Radio** 비중: 70% AI Radio + 20% Premium Briefing Console + 10% Modern Walkman.
5. **보안**: `.env`/API key/service role/raw transcript/실사용자 데이터/full copyrighted transcript **커밋
   금지**. `.env.example`만. push 전 민감정보 검사.
6. **Agent Reach**(github.com/panniantong/agent-reach): "1차 정적 점검 기준 사용 후보"이며 core dep 아님.
   `install --env=auto` 금지, browser-cookie3 기본 금지. **역할 = fallback/최후 수단 추출기**: 평소엔 안
   쓰고, 일반 어댑터(RSS/Jina/yt-dlp/GitHub)로 **자료를 못 찾거나 접근이 어려울 때만** 마지막 수단으로 사용
   (`BlockedPageFallback` 계층). — Leo 결정(2026-07-05).
7. Video Briefing 등 특정 작업은 **반드시 VibeNews repo에서만**(SIASIU/Foundation/Cosmile repo에서 금지).

---

## 8. 지금의 과도기 상태 / 알려진 이슈

- **테마 혼재**: Listen 탭 + 하단 탭바만 다크(Neo-Retro), 나머지 탭(Briefing/Recap/Saved/Settings)은 아직
  cream light. → 다크 탭바 위 밝은 화면이 과도기적으로 보임. 다음 단계에서 전역 테마 통일 필요(별도 지시
  필요 — "전체 앱 리디자인").
- **오디오 mock**: `briefing-session` 등은 실제 음원 없이 UI만.
- **GitHub raw 착시**: 일부 파일이 raw에서 긴 줄처럼 보인다는 지적이 반복됐으나, 로컬/타입 모두 정상으로
  확인됨(뷰어 렌더링 이슈).

---

## 9. 다음 작업은 → `docs/TODO.md`

우선순위·단계별 할 일은 **`docs/TODO.md`**에 정리했다. 로드맵 기준 현재 **디자인 2단계(홈 리디자인) 완료**,
다음은 **플레이어 화면 리디자인**.
