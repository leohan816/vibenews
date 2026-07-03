# 2026-07-03 · Source Ingestion Toolkit 참고자료

> 기존 클론프로젝트의 다운로드/수집 방법을 **참고자료**로 정리한다. 이 도구들은 VibeNews **core dependency가 아니라 SourceAdapter 후보**다. 지금은 정책 문서화만, 구현은 하지 않는다.
>
> 핵심 원칙: **도구는 강력하게, 사용 정책은 엄격하게.** 쓸 수 있는 방법은 많이 확보하되, core엔 바로 넣지 않고 각 방법을 `SourceAdapter`로 감싸며, 위험한 방식은 `fallback_only`/`research_only`/`internal_only`로 제한한다.

## SourceAdapter Layer
```
SourceAdapter Layer  (core는 이 계층에만 의존, 도구는 교체 가능)
├─ YouTubeSubtitleAdapter      → yt-dlp 기반
├─ WebImageAdapter             → curl 기반
├─ ImageOcrAdapter             → Vision / Tesseract
├─ GifOcrAdapter               → ffmpeg + OCR
├─ HtmlToPdfAdapter            → Chrome headless
├─ BlockedPageFetchAdapter     → insane-search (fallback 전용)
└─ FutureAgentReachAdapter     → 실험 후보 (Agent Reach)
```
각 어댑터는 [`SourceAdapterConfig`](../../설계문서/10_DataModel_데이터구조.md)(id·sourceType·tool·riskLevel·authMode·allowedUse·rawContentPolicy)로 **언제 써도 되는지 정책**을 붙인다.

## 수집 방법 (참고)

### 1. YouTube subtitle ingestion — `yt-dlp`
- 용도: YouTube 영상 자막 수집.
- 옵션 참고: `--write-auto-sub` · `--sub-lang ko/en` · `--skip-download` · `--write-info-json` · `--sleep-interval`/`--max-sleep-interval` · `-a <URL list>`.
- 신규 감지: `--flat-playlist` + 날짜 컷오프.
- ⚠️ 주의: `--cookies-from-browser chrome`은 **민감 기능**. 운영 서버 자동 파이프라인 **기본 금지**, 내부 테스트/연구용으로만 제한. 원문 전체 저장 금지, transcript는 `temporary_cache_only`.
- 정책: `authMode: none`(공개) / `browser_cookie`(제한). `allowedUse: production`(무자막 공개영상) ~ `research_only`(쿠키).

### 2. Web detail page image ingestion — `curl`
- 용도: 공개 쇼핑몰/기사 상세페이지 이미지 다운로드.
- 방식: HTML fetch → 상세 영역 `img src` 추출 → 순서대로 다운로드.
- 403/WAF 시: fallback 후보로 `insane-search`.
- 필터 정책: UI 버튼/로고/불필요 이미지 제외.
- 정책: `riskLevel: low`(공개). `rawContentPolicy: temporary_cache_only`.

### 3. OCR ingestion — macOS Vision / Linux Tesseract
- 용도: 이미지 속 텍스트 추출(이미지 기반 상세페이지 분석에 유용).
- ⚠️ 주의: 숫자/소수점/퍼센트 오류 가능 → 핵심 수치는 **human verification 필요**.
  ```
  91.146 → 91146
  0.05%  → 005%
  1,000  → 1000 or 100
  ```
- 결과에 `ocrConfidence` · `needsHumanCheck` · `numericRisk` 필드([`OcrExtractionResult`](../../설계문서/10_DataModel_데이터구조.md)).

### 4. GIF OCR ingestion — `ffmpeg` + OCR
- 용도: GIF 최종 프레임의 수치/문구 추출.
- 방식: ffmpeg로 frame 추출 → **마지막 프레임** OCR.
- 주의: 카운트업 애니메이션은 마지막 프레임이 실제 값일 가능성이 높음.

### 5. HTML to PDF conversion — Chrome headless
- 용도: HTML 문서 → PDF 변환.
- 주의: 스크롤 리빌 애니메이션/지연 렌더링 처리 필요.
- 정책: `riskLevel: medium`(리소스), `authMode: none`.

### 6. Blocked public page fallback — `insane-search`
- 용도: curl이 실패하는 **공개 페이지**의 fallback fetch.
- 정책(엄격):
  - 허용: 공개 페이지인데 단순 403/WAF로 curl 실패 / 로그인·페이월 없는 페이지 / 내부 검증·수집 실험.
  - **금지**: 로그인 필요 페이지 · 유료/페이월 · 비공개 데이터 · 차단 우회 대량 수집.
  - `allowedUse: fallback_only`. 운영 자동화 전 별도 검증. **core dependency 아님.**

## 민감 기능 운영 정책
| 기능 | 개인 연구/내부 테스트 | 운영 서버 자동 파이프라인 | 공개 서비스 사용자 요청 |
| --- | --- | --- | --- |
| `--cookies-from-browser` | 제한적 가능 | **기본 금지** | 금지 / 별도 승인 |
| `insane-search`(WAF fallback) | 가능(공개 페이지) | 별도 검증 전 금지 | 금지 |
| 로그인 기반 수집 | 제한적 | **금지** | 금지 |

## 우선순위
```
1순위: RSS / GitHub / 공개 웹 / 수동 YouTube 링크
2순위: yt-dlp 자막 처리
3순위: OCR / 이미지 상세페이지 분석
4순위: insane-search fallback
5순위: 쿠키 기반 수집
```
**공개 서비스화 전 운영 자동화 금지 3종:** 쿠키 기반 YouTube 수집 · WAF fallback · 로그인 기반 수집.

## 저장 정책
원문 전체 저장은 피하고 **요약 / 인사이트 / 메타데이터 중심**으로 저장. 원문은 `none` 또는 `temporary_cache_only`.

## 종합 정책
- VibeNews는 **Agent Reach나 insane-search에 의존하지 않는다.**
- 각 수집 도구는 **adapter 후보로만** 관리한다.
- **민감 기능은 기본 비활성화.**
- **쿠키/로그인 기반 수집은 운영 자동화에서 금지.**
- 원문 전체 저장 회피, 요약/인사이트/메타데이터 중심 저장.

## 관련
타입: [10_DataModel](../../설계문서/10_DataModel_데이터구조.md) · 정책: [06_ExploreMore](../../설계문서/06_ExploreMore_더알아보기.md) · 환경변수: [환경변수.md](../환경변수.md) · Agent Reach 평가: [2026-07-03_agent_reach_evaluation.md](2026-07-03_agent_reach_evaluation.md)
