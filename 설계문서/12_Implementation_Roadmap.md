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
Phase 1~16을 이번 스켈레톤 작업에서 일괄 구현(모두 mock). 이후 실제 기능은 블록별로 이 로드맵을 따라 채운다.

## 실제 기능 연결(스켈레톤 이후) 권장 순서
1. 본문 추출(웹/유튜브/RSS) 백엔드 — agent-reach 검증 후 결정
2. AI 요약/분석
3. TTS + 배경/이어재생 (앱의 심장)
4. Daily Recap 자동화
5. Foundation 동기화
6. 개인화 상품 추천 / 음성 명령 / 결제(후보)
