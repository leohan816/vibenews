# 12. Implementation Roadmap

구현 순서. 각 Phase는 이전 Phase가 화면에서 확인될 때 다음으로 넘어간다.

- **Phase 1: 설계문서 생성** ✅ (이 폴더)
- **Phase 2: 전체 라우팅/탭 구조** — 루트 Stack + `(tabs)` 5탭 + 8 push 화면
- **Phase 3: mock data/type 정의** — `src/data/types.ts`, `src/data/mockData.ts`, `src/lib/eventLog.ts`
- **Phase 4: Listen 화면** — 큰 중앙 재생 버튼 + 준비 요약
- **Phase 5: 재생 화면** — BriefingSession: ambient visual + chapter controls
- **Phase 6: Briefing 화면** — 카테고리 큰 카드 + 예약 진입
- **Phase 7: Recap 화면**
- **Phase 8: Saved 화면**
- **Phase 9: Settings 화면**
- **Phase 10: Explore More 화면**
- **Phase 11: Schedule Briefing 화면**
- **Phase 12: Product Recommendation 화면**
- **Phase 13: Foundation Candidate 화면**
- **Phase 14: Voice Command 화면**
- **Phase 15: FEATURE_INDEX 업데이트**
- **Phase 16: GitHub commit/push 전 보안 검사**

## 현재 진행
- Phase 1~16 스켈레톤 일괄 구현 완료(모두 mock).
- **블록 2 · 실제 오디오 플레이어 (진행 중/완료)** — Phase 5(재생 화면)를 mock에서 **partial**로 승격. expo-audio로 재생/일시정지/이전/다음/seek·chapter 큐·이어재생·완료 처리를 실제 동작시킨다. 오디오는 mock/샘플, 백그라운드 재생은 future. 설계: [02_Listen](02_Listen_오디오_플레이어.md).

## 실제 기능 연결(스켈레톤 이후) 권장 순서
1. 본문 추출(웹/유튜브/RSS) 백엔드 — `SourceAdapter` 인터페이스로 추상화. **Agent Reach는 core 의존성 아님, Source Adapter 후보**(1차 정적 점검 기준). 채택 전 격리 sandbox/container 테스트 필수. `install --env=auto`·브라우저 쿠키 접근 금지. 평가: `docs/구현로그/2026-07-03_agent_reach_evaluation.md`
   - **Source Ingestion Toolkit 우선순위:** ① RSS/GitHub/공개웹/수동 YouTube → ② yt-dlp 자막 → ③ OCR/이미지 → ④ insane-search fallback → ⑤ 쿠키 기반. 운영 자동화 금지: 쿠키 YouTube·WAF fallback·로그인 수집. 참고: `docs/구현로그/2026-07-03_source_ingestion_toolkit_reference.md`
2. **Global News Pool** — 공통 뉴스 풀 1회 생성(수집·요약·스크립트·TTS 공통 처리)
3. AI 요약/분석
4. **오디오 재생 구조 (블록 2, 진행 중)** → 이후 TTS audioUrl 연결 + 배경 재생(future)
5. **개인화 브리핑 조립** — 공통 풀 → `UserInterestProfile` → `PersonalizedBriefingPlan`(선택·정렬·연결, 오디오 재사용, 연결 멘트만 선택적 LLM). 설계: [03_Briefing](03_Briefing_예약_카테고리_브리핑.md)
6. Daily Recap 자동화
7. Foundation 동기화
8. 개인화 상품 추천 / 음성 명령 / 결제(후보)
