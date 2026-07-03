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

## SourceLocator (소스 위치 표현, future)
"더 알아보기"는 여러 소스를 인용/재분석하지만, **모든 소스에 timestamp를 강제하지 않는다.** 소스 성격이 제각각(영상·글·코드·게시글)이라 위치 표현도 소스별로 달라야 한다. 그래서 위치는 단일 `timestamp` 필드가 아니라 `SourceLocator`로 표현한다.

- `SourceLocator`는 [`ContentItem`](10_DataModel_데이터구조.md)의 `sourceLocators`에 붙는 소스별 위치 정보다(설계 레벨 서술, future).
- 위치 표현은 sourceType에 따라 달라진다.

| sourceType | 위치 필드(예) | 성격 |
| --- | --- | --- |
| youtube | `startSec` / `endSec` | **내부용**: 구간 요약·검증·스크립트 생성·재분석에만 사용. 사용자 화면에 반드시 노출하지 않는다. |
| github | `repo` / `commitSha` / `filePath` / `lineStart` / `lineEnd` / `issueNumber` / `pullRequestNumber` | 코드/이슈/PR 위치 |
| rss · web | `paragraphIndex` / `sectionTitle` | 문단·섹션 위치 |
| reddit · x | `postId` / `commentId` | 게시글·댓글 위치 |
| 공통(모든 소스) | `url` / `fetchedAt` / `contentHash` | 원위치·수집시각·본문 해시(중복/변경 감지) |

- 원칙: `startSec/endSec` 같은 정밀 위치는 **파이프라인 내부 근거**(구간 요약, 사실 검증, audioScript 생성, 재분석)로만 쓰고, 사용자에게 "몇 분 몇 초" 형태로 그대로 노출하지 않는다.
- 타입 정본은 [10_DataModel](10_DataModel_데이터구조.md). 여기서는 위치 표현이 **소스별로 갈린다**는 설계 의도만 기록한다.

## YouTube 출처 표시 정책 (SourceDisclosurePolicy)
YouTube 기반 분석은 내부적으로 출처를 정확히 알고 있어야 하지만, **사용자 화면에 채널명을 기본 노출하지 않는다.** 이는 저작권 리스크가 아니라 표현·신뢰 관점의 정책이다.

- 내부 저장: `sourceUrl` / `videoId` / `channelName` / `channelId`는 [`ContentItem`](10_DataModel_데이터구조.md)의 source에 저장한다(검증·재분석·중복 판정용).
- 사용자 표현: 채널명 대신 **"영상 기반 분석" / "외부 영상 자료 기반 요약"**으로 표현한다.
- 원 출처 우선: 영상이 공식 자료/원출처를 참조하면 **채널명보다 원 출처를 우선 표시**한다(예: "OpenAI 발표 기반", "GitHub repo 기준"). 즉 화면에는 "누가 영상을 만들었나"가 아니라 "무엇을 근거로 했나"를 보여준다.

### 노출 단계 (SourceDisclosurePolicy)
소스마다 어디까지 사용자에게 보일지를 4단계로 표현한다(설계 레벨, future).

| 단계 | 사용자에게 보이는 것 | 예 |
| --- | --- | --- |
| `internal_only` | 아무것도 노출 안 함(내부 근거로만 사용) | 미검증 영상 |
| `source_type_only` | 소스 성격만 | "영상 기반 분석" |
| `underlying_sources_only` | 영상이 참조한 원 출처만 | "OpenAI 발표 / GitHub repo 기준" |
| `full_source_visible` | 실제 출처(채널명/링크 등)까지 | 공식 채널·명시적 허용 소스 |

- **YouTube 기본값: `source_type_only` 또는 `underlying_sources_only`.** `full_source_visible`는 예외적으로만.

### 저작권·원문 정책
- 출처를 숨긴다고 저작권 리스크가 사라지는 것은 **아니다.**
- 따라서 원문 전체 저장/재배포를 회피하고 **요약·인사이트·메타·audioScript 중심**으로만 보관한다(transcript는 temporary cache). → [정책 상세는 10_DataModel](10_DataModel_데이터구조.md).

### SourceAdapter 후보 (core는 직접 알면 안 됨)
core는 어댑터가 반환한 [`ContentItem`](10_DataModel_데이터구조.md)만 처리한다. **`yt-dlp`·`curl`·`insane-search`·Agent Reach 같은 수집 수단을 core가 직접 알아서는 안 된다.** 전부 `SourceAdapter` 뒤에 감춘다.

| 어댑터 후보 | 감싸는 대상/용도 |
| --- | --- |
| `RSSFetcher` | RSS 피드 |
| `WebArticleFetcher` | 공개 웹 본문 |
| `YouTubeFetcher` | YouTube 메타/자막(내부적으로 yt-dlp 등, 쿠키 기능 기본 비활성) |
| `GitHubFetcher` | repo/commit/issue/PR |
| `RedditFetcher` | Reddit 게시글·댓글 |
| `XFetcher` | X 게시글(무인 수집 부적합, 제약 큼) |
| `ImageOcrFetcher` | 이미지 텍스트(OCR, 숫자 오독 주의) |
| `GifOcrFetcher` | GIF 최종 프레임 수치 |
| `HtmlDocumentFetcher` | HTML 문서/렌더 결과 |
| `BlockedPageFallbackFetcher` | 차단된 공개 페이지 fallback(공개 전용) |
| `AgentReachFetcher` (future) | Agent Reach 경유(1차 정적 점검 기준 사용 후보, core 의존성 아님) |

- 정책 요약: 민감 기능(쿠키/로그인/insane-search)은 **기본 비활성·운영 자동화 금지**, 어댑터는 반환 `ContentItem`에 정책(riskLevel/authMode/rawContentPolicy 등)을 붙인다. 상세는 위 "외부 소스 수집 정책" 절과 [10_DataModel](10_DataModel_데이터구조.md).

## Source Pool과 SourceAdapter 관계
수집은 임의의 웹을 긁는 것이 아니라 **Source Pool의 후보에서만** 시작한다. Source Pool은 VibeNews가 콘텐츠 후보를 가져오는 전체 원천 목록이며, 여기서 생성된 `SourceCandidate`를 `SourceAdapter`가 fetch/normalize해 `ContentItem`으로 만든다. core는 여전히 특정 수집 도구에 종속되지 않고 어댑터가 반환한 `ContentItem`만 처리한다.

- **역할 분리**
  - Source Pool: "무엇을 후보로 삼을지" 결정(원천 목록·소스 4유형).
  - `SourceAdapter`: 선택된 `SourceCandidate`를 실제로 fetch/normalize(도구 비종속, 교체 가능).
- **우선순위·비용 관리**
  - Editorial Source(MD/운영자 지정, 가장 신뢰)가 Hot Topic Source(시스템 감지 트렌드, 과장 위험)보다 **우선**한다.
  - **모든 후보를 fetch하지 않는다.** score(editorial priority/hot topic/user interest/risk)가 높은 후보만 `ContentItem`으로 승격한다(비용·품질 관리).
- **흐름:** Source Pool → `SourceCandidate` 생성 → scoring → selected 후보만 `SourceAdapter`가 fetch/analyze → `ContentItem` → Global News Pool → Personal Briefing Assembly.
- **'더 알아보기'와의 연결:** 이 문서의 다중 소스 분석(관련 기사/영상/논문/GitHub/Reddit/X 반응)도 임의 수집이 아니라 **Source Pool 후보에서** 온다. 즉 "출처 N곳 분석됨"의 N은 Source Pool에서 score로 선별된 후보들이다.
- 상세: [15_Source_Pool_and_Editorial_Curation](15_Source_Pool_and_Editorial_Curation.md). 타입 정본은 [10_DataModel](10_DataModel_데이터구조.md).
