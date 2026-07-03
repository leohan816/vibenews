# 2026-07-03 · Agent Reach 평가

> ⚠️ 이건 **1차 정적 점검(코드 리뷰 + 격리 실행)** 결과다. 완전한 보안 감사가 아니므로 "안전함"이 아니라 **"1차 정적 점검 기준 사용 후보"**로 표현한다.

## 검토 대상
`github.com/Panniantong/agent-reach` (⭐49.6k, MIT, v1.5.0)

## 검토 목적
VibeNews의 **외부 소스 수집 후보** 평가. VibeNews core 의존성으로 넣을지가 아니라, **Source Adapter 후보**로 쓸 수 있는지 확인.

## 설치 방식
- **프로젝트 외부 임시 폴더 + 격리된 venv**에만 설치(핵심 패키지만).
- VibeNews core 코드/`package.json`/앱 실행 경로에는 **연결하지 않음**.

## 실행하지 않은 것 (의도적으로 금지)
- `agent-reach install --env=auto`
- `sudo`
- 시스템 패키지 설치(apt/brew, Node/gh), apt 저장소/키링 추가
- `browser-cookie3`(브라우저 쿠키 접근) 등 선택 확장

## 확인한 위험 요소
- **자동 설치의 시스템 변경 위험** — `install --env=auto`가 sudo로 gh·Node 설치·apt 저장소/키링 추가. 공유 서버에 부적절.
- **browser-cookie3 쿠키 접근 위험** — 로컬 브라우저 쿠키를 읽는 프라이버시 민감 기능(선택 의존성).
- **외부 플랫폼 약관/차단 리스크** — X/Reddit/Instagram 등 스크래핑은 약관 위반·차단 가능성.
- **upstream tool 의존성 리스크** — 실제 읽기는 yt-dlp·gh·Jina Reader 등 외부 도구에 의존. 그 도구들의 변경/취약점이 그대로 전이.

## 점검에서 확인된 정상 신호(참고)
- 표준 hatchling 빌드(설치 시 임의 코드 실행 훅 없음), 유명 의존성(requests/feedparser/yt-dlp 등).
- 자격증명 로컬 저장(`~/.agent-reach/config.yaml`), 알 수 없는 서버로의 유출 미발견.
- 성격상 **installer/doctor/skill** 도구 — 실제 읽기는 upstream tool 직접 호출.
- 격리 venv에서 `doctor` 결과 5/15 채널 즉시 가용(GitHub·RSS·웹(Jina)·V2EX·Bilibili). RSS 수집 실동작 확인(BBC 피드 → 21건).
- 부수효과: `doctor`가 `~/.agents/skills/agent-reach`에 스킬 파일 생성(제거: `agent-reach uninstall`).

## 판단
- **core dependency로 넣지 않음.**
- **Source Adapter 후보로만 유지** — YouTube/GitHub/RSS/Reddit/X 등 외부 소스 수집 실험용 어댑터 후보.
- **실제 운영 전 별도 sandbox/container 테스트 필요.**
- 사용 시 **격리된 venv/container에서만**, `install --env=auto` 금지, `browser-cookie3` 기본 비활성.
- VibeNews core는 **SourceAdapter 인터페이스**로 수집 도구를 교체 가능하게 유지(특정 도구에 종속 금지).

## 관련 설계문서
[00_제품_전체지도](../../설계문서/00_제품_전체지도.md) · [06_ExploreMore](../../설계문서/06_ExploreMore_더알아보기.md) · [10_DataModel](../../설계문서/10_DataModel_데이터구조.md) · [12_Roadmap](../../설계문서/12_Implementation_Roadmap.md) · [13_FEATURE_INDEX](../../설계문서/13_FEATURE_INDEX.md)
