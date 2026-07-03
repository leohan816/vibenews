# 06. Explore More · 더 알아보기

## 목적
"더 알아보기"는 외부 링크 목록이 아니라, VibeNews가 **관련 자료를 내부적으로 읽고 분석한 텍스트 심층 분석**을 제공한다.

## 사용자 경험
- **외부 링크 목록 금지.** 중국 등 일부 지역에서는 링크가 안 열릴 수 있으므로 **링크 의존 UX 금지.**
- VibeNews가 관련 기사/영상/논문/GitHub/Reddit/X 반응을 내부적으로 읽고 분석한다.
- MVP에서는 **텍스트 심층 분석만** 제공. 심층 오디오는 나중에 선택/유료 후보.

## 화면 구성 (섹션)
1. 핵심 결론
2. 여러 자료에서 반복되는 흐름
3. 서로 다른 관점
4. 확실한 사실
5. 불확실한 주장
6. 커뮤니티 반응
7. 사용자와의 연결
8. 실행 아이디어
9. 추가 학습 질문

- Source URL은 **내부 메타데이터로 저장**하되 사용자 경험은 링크 클릭에 의존하지 않는다.

## 데이터 모델
`ExploreMore`, `SourceMeta` (→ [10_DataModel](10_DataModel_데이터구조.md))

## 현재 상태
**mock** — 심층 분석 텍스트 하드코딩. 실제 자료 수집/분석 없음.

## 구현할 컴포넌트
- `ExploreSection` (제목 + 본문/리스트)
- `PerspectiveList` (서로 다른 관점)
- `CommunityReactionList`
- 출처는 개수/도메인만 요약 표시(클릭 의존 X)

## 구현 전 확인사항
- 링크 노출 방식: 클릭 유도 없이 "출처 3곳 분석됨"처럼 표기.

## 외부 소스 수집 정책 (Source Adapter)
"더 알아보기"·본문 추출은 외부 소스(웹/유튜브/GitHub/Reddit/X/RSS)를 읽어야 하지만, 특정 수집 도구에 종속되지 않는다.

- VibeNews core는 [`SourceAdapter`](10_DataModel_데이터구조.md) 인터페이스에만 의존하고, 실제 수집 도구는 **교체 가능한 어댑터**로 둔다.
- **Agent Reach**(`github.com/Panniantong/agent-reach`)는 이 어댑터의 **후보**일 뿐 **core 의존성이 아니다.** 성격상 capability layer / installer / doctor이며, 실제 읽기는 `yt-dlp`·`gh CLI`·Jina Reader 등 **upstream tool**을 사용한다.
- **1차 정적 점검 기준 사용 후보**(완전한 보안 감사 아님). 평가 상세: `docs/구현로그/2026-07-03_agent_reach_evaluation.md`.
- 금지/제약:
  - `agent-reach install --env=auto` **금지**(sudo·apt/brew·Node/gh 설치·apt 저장소/키링 등 시스템 변경 위험).
  - 공유 서버/여러 서비스가 도는 서버에서 **자동 설치 금지.**
  - 사용 시 **격리된 venv 또는 container에서만** 평가.
  - `browser-cookie3` 등 브라우저 쿠키 접근은 프라이버시 민감 기능 → **기본 비활성/금지.**
  - 외부 플랫폼 약관/차단 리스크 고려(X/Instagram 등 무인 수집 부적합).

### Source Ingestion Toolkit (참고자료)
수집 "도구(Tool Adapter)" 후보들. 각 도구는 `SourceAdapterConfig`로 감싸 정책(riskLevel/authMode/allowedUse/rawContentPolicy)을 붙인다. 상세: `docs/구현로그/2026-07-03_source_ingestion_toolkit_reference.md`.

| # | 도구 | 용도 | 위험/정책 |
| --- | --- | --- | --- |
| 1 | **yt-dlp** | YouTube 자막 수집 | `--cookies-from-browser`는 민감 → 운영 자동화 금지, transcript는 temp cache |
| 2 | **curl** | 공개 상세페이지 이미지 | UI/로고 제외, 403/WAF 시 fallback 후보 |
| 3 | **Vision/Tesseract OCR** | 이미지 텍스트 | 숫자 오독 위험 → human verification 필요 |
| 4 | **ffmpeg + OCR** | GIF 최종 프레임 수치 | 카운트업은 마지막 프레임이 실제 값 |
| 5 | **Chrome headless** | HTML→PDF | 스크롤 리빌/지연 렌더링 처리 |
| 6 | **insane-search** | 차단된 공개 페이지 fallback | 공개 페이지 전용, 로그인/페이월 금지, `fallback_only` |

**우선순위:** ① RSS/GitHub/공개웹/수동 YouTube → ② yt-dlp 자막 → ③ OCR/이미지 → ④ insane-search fallback → ⑤ 쿠키 기반.
**공개 서비스화 전 운영 자동화 금지:** 쿠키 기반 YouTube 수집 · WAF fallback · 로그인 기반 수집.

## 나중에 연결될 기능
`SourceAdapter` 기반 실제 다중 소스 수집·요약, 심층 오디오 생성. (수집 도구는 sandbox/container 테스트 후 채택.)

## 구현 체크리스트
- [ ] 9개 섹션 렌더
- [ ] 링크 목록 UX 없음(출처는 메타 요약만)
- [ ] 재생 화면/저장 카드에서 진입 가능
