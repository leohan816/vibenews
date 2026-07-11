# VibeNews 설계문서

VibeNews는 전체 제품 skeleton을 유지하면서, 동결된 큰 기능 문서가 지정한 세로 절편은 실제 동작으로
승격한다. `VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001`의 YouTube Add·provider pipeline·generated audio·전역
resume는 mock/placeholder로 완료할 수 없으며 [18번 문서](18_YouTube_Add_Global_Resume_MVP.md)가 정본이다.

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

- 일반 skeleton에서 아직 연결되지 않은 기능은 각 문서의 상태를 따른다. 단 18번 private MVP는 공개
  caption 취득, DeepSeek Builder/Verifier, Fish Audio, private server DB/storage, device persistence까지
  실제 acceptance가 필요하다.
- Foundation 연동, 결제, 실제 음성 명령, production/public service는 여전히 범위 밖이다.
- 민감정보·raw caption·원본 media·provider response는 커밋하지 않는다. nonsecret placeholder만
  `.env.example`에 둔다.

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
- [14_Video_Briefing_Quality_Strategy.md](14_Video_Briefing_Quality_Strategy.md)
- [15_Source_Pool_and_Editorial_Curation.md](15_Source_Pool_and_Editorial_Curation.md)
- [16_Candidate_Review_and_TTS_Approval_Pipeline.md](16_Candidate_Review_and_TTS_Approval_Pipeline.md)
- [17_Design_Direction_Neo_Retro_AI_Radio.md](17_Design_Direction_Neo_Retro_AI_Radio.md)
- [18_YouTube_Add_Global_Resume_MVP.md](18_YouTube_Add_Global_Resume_MVP.md)
