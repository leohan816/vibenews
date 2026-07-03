# VibeNews 설계문서

VibeNews는 좁은 MVP가 아니라 **full product skeleton**을 먼저 만든다. 모든 기능이 화면과 네비게이션에 보이되, 실제 동작은 mock/placeholder여도 된다.

## 원칙
- **구현 전에 설계문서를 먼저 수정한다.**
- **큰 기능 블록 하나당 설계문서 하나**를 둔다.
- **문서에 없는 기능은 구현하지 않는다.**
- **새 아이디어가 나오면 관련 설계문서를 먼저 업데이트한다.**
- **설계문서 업데이트 후 commit하고, 그다음 구현한다.**

## 폴더 역할
- `설계문서/` — **구현 전에** 정하는 문서. 제품 의도·기능 정의·화면 구조·데이터 모델·UX 원칙·Foundation 연결 방향. 모든 새 결정은 여기에 먼저 반영.
- `docs/` — **구현 후에** 기록하는 문서. 실제 구현 내용·실행법·테스트법·환경변수·변경기록. 설계와 실제 구현의 차이도 여기에 남긴다.

## 참고
- 실제 수집 / TTS / Foundation 연동 / 결제 / 실제 음성 명령은 아직 구현하지 않는다. 화면에는 보인다.
- 민감정보는 커밋하지 않는다(`.env`, API 키 등). `.env.example`만 커밋.

## 각 문서 공통 항목
목적 · 사용자 경험 · 화면 구성 · 데이터 모델 · 현재 상태(mock/partial/working/future) · 구현할 컴포넌트 · 구현 전 확인사항 · 나중에 연결될 기능 · 구현 체크리스트

## 문서 목록
- [00_제품_전체지도.md](00_제품_전체지도.md)
- [01_화면_구조_네비게이션.md](01_화면_구조_네비게이션.md)
- [02_Listen_오디오_플레이어.md](02_Listen_오디오_플레이어.md)
- [03_Briefing_예약_카테고리_브리핑.md](03_Briefing_예약_카테고리_브리핑.md)
- [04_Recap_오늘들은내용요약.md](04_Recap_오늘들은내용요약.md)
- [05_Saved_뉴스지식_저장카드.md](05_Saved_뉴스지식_저장카드.md)
- [06_ExploreMore_더알아보기.md](06_ExploreMore_더알아보기.md)
- [07_Product_개인화상품추천.md](07_Product_개인화상품추천.md)
- [08_Foundation_뉴스지식연동.md](08_Foundation_뉴스지식연동.md)
- [09_Settings_개인화설정.md](09_Settings_개인화설정.md)
- [10_DataModel_데이터구조.md](10_DataModel_데이터구조.md)
- [11_EventLog_사용행동기록.md](11_EventLog_사용행동기록.md)
- [12_Implementation_Roadmap.md](12_Implementation_Roadmap.md)
- [13_FEATURE_INDEX.md](13_FEATURE_INDEX.md)
