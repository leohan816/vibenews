# VibeNews TODO

> 할 일 목록. 최종 업데이트 **2026-07-04**. 최신 커밋 `8034473`.
>
> **작업 규칙(중요)**: 새 기능/화면은 **`설계문서/`에 설계 MD 먼저 → 사용자와 상의 → 동의 후 구현**.
> 순수 버그/포맷/명시적 "바로 해줘"는 예외. 완료 시 `docs/구현로그/`에 기록하고 README 갱신.
> 상태 표기: `[ ]` 미착수 · `[~]` 진행/부분 · `[x]` 완료 · 🔒 사용자 결정 필요 · 🎨 디자인 · 🧱 백엔드/설계.

---

## A. 지금 바로 다음 (디자인 로드맵 이어가기)

설계문서 17 §9 로드맵 기준. 현재 **2단계(홈 리디자인) 완료**.

- [x] 1. Design Direction 문서화 (문서 17) — `c4e5ee8`
- [x] 2. 홈 화면 Neo-Retro 리디자인 (Listen 홈) — `8034473`
- [ ] 🎨 3. **플레이어 화면 리디자인** (`briefing-session` / 설계문서 02)
  - 상단 `AI CHANNEL · CHAPTER 2 / 7`, 중앙 soft waveform/glowing orb/signal visual
  - 챕터 제목 + 한 줄 요약, 음악 플레이어식 진행바
  - 컨트롤 이전/재생·정지/다음, 버튼 저장·더 알아보기·**깊게 듣기(Deep Listen)**
  - NEO 로컬 토큰 재사용. 실제 오디오 연결은 아직 X(UI만)
  - 검증: tsc 0 / web export / route 13 유지
- [ ] 🎨 4. **오늘의 흐름 카드 추가 다듬기** (필요 시) — 아이콘 블록/태그/여백 미세 조정
- [ ] 🎨🔒 5. **디자인 토큰 코드화** — 현재 `NEO`가 파일마다 로컬 중복. 공용 모듈(예:
  `src/constants/neo-theme.ts`)로 승격 여부 결정 필요. → **전역 테마를 warm dark로 옮길지**는 "전체 앱
  리디자인"이라 사용자 승인 필요(§C-1 참고)
- [ ] 6. **mock UI 검수** — 리디자인된 화면들을 실제 기기/웹에서 눈으로 점검, 대비/가독성 확인
- [ ] 🧱 7. **실제 오디오 플레이어 구현** — expo-audio로 실제 음원 재생(자체 설계 필요)

---

## B. 화면별 UI 통일 (Neo-Retro 확산)

> Listen만 다크라 과도기적 혼재 상태. 아래는 전역 테마 방향이 정해진 후 진행.

- [ ] 🎨🔒 **전역 테마 warm dark 전환 여부 결정** — 결정되면 아래 일괄 진행
- [ ] 🎨 Briefing 탭 Neo-Retro 적용
- [ ] 🎨 Recap 탭 Neo-Retro 적용
- [ ] 🎨 Saved 탭 Neo-Retro 적용 (저장한 신호/Saved Signal 감성)
- [ ] 🎨 Settings 탭 Neo-Retro 적용
- [ ] 🎨 상세 화면(explore-more/daily-recap-detail/saved-card-detail/product-recommendation/
  foundation-candidate/schedule-briefing/voice-command) 순차 적용
- [ ] 🎨 공용 컴포넌트(`card`/`screen`/`section-header`/`themed-*`)를 다크 대응 or NEO 기반으로 재정리

---

## C. 열린 결정 (🔒 사용자 상의 필요)

- [ ] 🔒 **전역 다크 전환**: Listen만 다크 vs 앱 전체 warm dark. (전체 전환 = "전체 앱 리디자인" 별도 작업)
- [ ] 🔒 **디자인 토큰 위치**: 파일 로컬 `NEO` 유지 vs 공용 모듈/전역 테마 승격.
- [ ] 🔒 **컨셉 비중 최종 확정**: 현재 70/20/10 (AI Radio/Console/Walkman) 유지?
- [ ] 🔒 **로고/브랜딩**: 현재 `📻 VibeNews` 텍스트. 전용 로고/아이콘 필요 여부(이미지 asset은 지시 필요).
- [ ] 🔒 **백엔드 착수 시점**: 아래 D는 전부 설계만 됨. 언제 실제 구현 시작할지.

---

## D. 백엔드 / 파이프라인 (🧱 전부 설계만, 미구현)

> 각 항목은 실제 구현 전 설계 세부화 + 사용자 승인 필요. 실제 수집/모델/TTS 호출은 아직 전부 금지 상태였음.

- [ ] 🧱 **SourceAdapter** 첫 구현 (예: RSS) — core 도구 비종속 유지 (설계문서 06/15)
- [ ] 🧱 **Source Pool → SourceCandidate scoring** 로직 (설계문서 15)
- [ ] 🧱 **CandidatePreview 생성**(Worker LLM=Qwen 8B) + **Admin 승인 화면** (설계문서 16)
- [ ] 🧱 **Content Intelligence 파이프라인**(Builder LLM): ContentItem/VideoContentMap/AnalyticSummary
  (설계문서 10/14)
- [ ] 🧱 **BriefingPlan → SpokenAudioScript** 생성 (설계문서 03/14)
- [ ] 🧱 **DeepSeek verifier**(rubric 10점, 9/10 게이트, retry 2회, human review) (설계문서 16)
- [ ] 🧱 **TTS 생성**(Fish Audio 등) — tts_ready 통과분만 (설계문서 14/16)
- [ ] 🧱 **Personal Briefing Assembly** — 사용자별 조립 (설계문서 03)
- [ ] 🧱 **Hot Topic detector** — 트렌드 감지, trendScore (설계문서 15)
- [ ] 🧱 **EventLog 실제 저장소** 연결 (현재 콘솔 stub, 설계문서 11)

**모델 후보**: Worker=Qwen 8B · Builder=Qwen 14B/32B·DeepSeek distill·Gemma 12B · Verifier=DeepSeek ·
TTS=Fish Audio. **주의: 최신·최고 성능 모델 우선(앱 내 AI는 최신 Claude 계열 기본).**

---

## E. 데이터/문서 정합성 유지

- [ ] `설계문서/10_DataModel`(정본) ↔ `src/data/types.ts` 동기화 유지
- [ ] 새 기능마다 `설계문서/13_FEATURE_INDEX` 행 추가
- [ ] 구현 후 `README.md` + `설계문서/README.md` 갱신
- [ ] `docs/구현로그/`에 작업 기록 남기기
- [ ] taxonomy 규칙 유지: Skin Care top-level, K-Beauty는 tag/business만

---

## F. 운영 / 배포 / 품질

- [ ] 외부 데모(8090) 최신 빌드 반영 절차 문서화/자동화 (`docs/vibenews-deploy` 참고)
- [ ] cloudflared 임시 URL → 고정 접근 방법 검토(🔒)
- [ ] tsc 0 / web export 성공 / route 13 유지 = 커밋 전 체크리스트 습관화
- [ ] Prettier는 **마크다운의 `~` 범위 표기를 `~~`로 깨뜨리므로** 문서에 함부로 돌리지 말 것(범위는 하이픈
  `-` 권장). 돌렸으면 `~~`→`~` 확인.
- [ ] `npx` 도구 실행 시 package.json/lock 오염 여부 항상 확인(과거 eslint/prettier auto-install 사례)

---

## G. 완료된 주요 마일스톤 (참고)

- [x] 제품 skeleton 15개 설계문서 + 13 route mock 화면
- [x] 오디오 플레이어 UI 블록 (expo-audio, mock)
- [x] Source Ingestion Toolkit / Agent Reach 안전성 점검 반영
- [x] 외부 소스 수집·구조화·개인화 조립 설계 (taxonomy 3축, ContentItem)
- [x] Video Briefing Quality Strategy + Gold Sample 검증
- [x] Source Pool & Editorial Curation 설계
- [x] Candidate Review & TTS Approval Pipeline 설계
- [x] K-Beauty → Skin Care 정리(문서 + mock)
- [x] Neo-Retro AI Radio 디자인 방향 + Listen 홈 1차 리디자인

---

### 다음 세션 추천 시작점
**A-3 플레이어 화면 리디자인**부터. 먼저 설계문서 02에 플레이어 리디자인 세부안을 정리하고 사용자와 상의 →
동의 후 `briefing-session` 구현. NEO 로컬 토큰 재사용, 실제 오디오는 아직 붙이지 않음.
