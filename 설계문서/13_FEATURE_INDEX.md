# 13. FEATURE INDEX

모든 기능 목록. 기능 변경 시 이 표를 **먼저** 업데이트한다.

**상태 범례**

- `mock` — 화면만 / 가짜 데이터
- `partial` — 일부 동작
- `working` — 실제 동작
- `future` — 미착수

## 기능 표

| 기능                               | 설명                                                                                                                                                        | 화면 위치                  | 데이터 모델                                                       | 상태        | 다음 구현 단계                        | 관련 문서        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------- | ----------- | ------------------------------------- | ---------------- |
| 중앙 재생 버튼                     | 앱 첫 화면의 큰 재생 버튼 + 문구                                                                                                                            | Listen `(tabs)/index`      | BriefingSession, Category                                         | mock        | 실제 오디오 시작 연결                 | 02               |
| 오디오 플레이어                    | chapter 기반 실제 재생(expo-audio)                                                                                                                          | BriefingSession            | PlaybackState, NewsAudioItem                                      | partial     | TTS audioUrl 연결                     | 02               |
| 챕터 이동                          | Chapter n/N + 자동 이어재생                                                                                                                                 | BriefingSession            | PlaybackState                                                     | partial     | -                                     | 02               |
| 이전/다음/다시/seek                | 뉴스 단위 이동 + 진행바 seek                                                                                                                                | BriefingSession            | PlaybackState                                                     | partial     | -                                     | 02               |
| 백그라운드 재생                    | 잠금화면/백그라운드 오디오                                                                                                                                  | 앱 오디오 모드             | PlaybackState                                                     | future      | audio mode + plugin                   | 02               |
| 저장                               | 재생 중 뉴스 지식 저장                                                                                                                                      | BriefingSession → Saved    | SavedCard                                                         | mock        | 지식 추출 저장                        | 05               |
| 더 알아보기                        | 내부 심층 텍스트 분석                                                                                                                                       | ExploreMore                | ExploreMore                                                       | mock        | 다중 소스 분석                        | 06               |
| 외부 소스 수집(Source Adapter)     | Source Ingestion Toolkit(yt-dlp/curl/OCR/ffmpeg/Chrome/insane-search)을 정책과 함께 어댑터로 추상화. Agent Reach·insane-search 비의존, 민감기능 기본 비활성 | (백엔드)                   | SourceAdapterConfig, SourceIngestionResult, OcrExtractionResult   | future      | 격리 sandbox/container 테스트 후 채택 | 06, 10           |
| Source Adapter Architecture        | 수집 도구를 교체 가능한 어댑터로 감싸는 계층(core 비종속)                                                                                                   | (백엔드)                   | SourceAdapterConfig                                               | future      | 인터페이스 확정                       | 06, 10           |
| YouTube URL ingestion              | 사용자가 YouTube URL 입력 → 콘텐츠 처리                                                                                                                     | Listen/입력                | ContentItem, SourceLocator                                        | future      | 파이프라인 구현                       | 02, 12           |
| YouTube transcript temporary cache | 자막을 temporary cache로만 보관(원문 저장 X)                                                                                                                | (백엔드)                   | ContentTranscript                                                 | future      | 캐시 정책                             | 08, 14정책       |
| Content Intelligence JSON          | 콘텐츠를 구조화한 정본 단위                                                                                                                                 | (백엔드)                   | ContentItem                                                       | future      | 스키마 확정                           | 10               |
| Fish Audio TTS generation          | audioScript → Fish Audio → audioAsset(mp3)                                                                                                                  | (백엔드)                   | AudioScript, AudioAsset                                           | future      | 서버 파이프라인                       | 02, 12           |
| Global News Pool                   | 하루 공통 ContentItem 풀(공통 1회 처리)                                                                                                                     | (백엔드)                   | GlobalNewsPool                                                    | future      | 풀 생성 잡                            | 03, 12           |
| Personal Briefing Assembly         | 공통 풀 → 사용자별 선택·정렬·연결                                                                                                                           | Listen/Briefing            | PersonalizedBriefingPlan                                          | future      | 조립 로직                             | 03               |
| User Interest Profile              | 사용자 취향 프로필(관심/부정/톤/길이)                                                                                                                       | Settings                   | UserInterestProfile                                               | future      | 프로필 저장                           | 09               |
| Source disclosure policy           | 출처 노출 정책(YouTube 채널명 비노출 등)                                                                                                                    | 상세/재생                  | SourceDisclosurePolicy                                            | future      | 표시 규칙                             | 06               |
| Source risk policy                 | 도구/소스별 riskLevel·allowedUse 정책                                                                                                                       | (백엔드)                   | SourceRiskLevel, AllowedUse                                       | future      | 정책 매트릭스                         | 06               |
| Source ingestion toolkit reference | 수집 도구 참고자료·정책                                                                                                                                     | (문서)                     | —                                                                 | 참고        | 유지                                  | 06               |
| OCR ingestion                      | 이미지 텍스트 추출(숫자 검증)                                                                                                                               | (백엔드)                   | OcrExtractionResult                                               | future      | Vision/Tesseract                      | 06, 07           |
| GIF OCR ingestion                  | GIF 최종 프레임 수치 추출                                                                                                                                   | (백엔드)                   | OcrExtractionResult                                               | future      | ffmpeg+OCR                            | 06               |
| HTML to PDF conversion             | HTML 문서 PDF 변환                                                                                                                                          | (백엔드)                   | ContentItem                                                       | future      | Chrome headless                       | 06               |
| insane-search fallback adapter     | 차단된 공개 페이지 fallback                                                                                                                                 | (백엔드)                   | SourceAdapterConfig                                               | future      | fallback_only 검증                    | 06               |
| Agent Reach experimental adapter   | 실험용 수집 어댑터 후보(1차 정적 점검)                                                                                                                      | (백엔드)                   | SourceAdapterConfig                                               | future      | 격리 테스트                           | 06               |
| Daily Recap                        | 오늘 들은 내용 요약(음성+텍스트)                                                                                                                            | Recap, DailyRecapDetail    | DailyRecap, RecapCard                                             | mock        | 청취로그 기반 AI 요약                 | 04               |
| 저장 카드                          | 카테고리별 뉴스 지식                                                                                                                                        | Saved, SavedCardDetail     | SavedCard                                                         | mock        | Foundation 연동                       | 05               |
| 카테고리 브리핑                    | 카테고리 큰 카드(개수·시간·키워드)                                                                                                                          | Briefing                   | Category                                                          | mock        | 야간 수집 연결                        | 03               |
| 예약 브리핑                        | 시간 기반 자동 브리핑                                                                                                                                       | ScheduleBriefing           | ScheduledBriefing                                                 | mock        | 스케줄러 / 푸시                       | 03               |
| 개인화 브리핑 조립                 | 공통 뉴스 풀에서 사용자별로 뉴스 일부를 선택·정렬·연결해 브리핑 큐 생성                                                                                     | Briefing, Listen, Settings | UserInterestProfile, PersonalizedBriefingPlan, NewsConnectionEdge | mock/future | 풀→프로필→플랜 파이프라인             | 00, 03, 10       |
| 음성 명령                          | 음성으로 앱 제어                                                                                                                                            | VoiceCommand               | VoiceCommand                                                      | future      | STT / 인텐트                          | 02, 09           |
| 개인화 상품 추천                   | 관심사 연결 상품(안전 표현)                                                                                                                                 | ProductRecommendation      | ProductRecommendation                                             | mock        | 커머스 / Foundation                   | 07               |
| Foundation 뉴스 지식 후보          | 지식 후보 검토 / 승인                                                                                                                                       | FoundationCandidate        | KnowledgeCandidate                                                | mock/future | Foundation API                        | 08               |
| Event Log                          | 사용 행동 mock 기록                                                                                                                                         | (내부)                     | EventLog                                                          | mock        | 분석 백엔드                           | 11               |
| 개인화 설정                        | 관심사/브리핑/음성/저장 정책                                                                                                                                | Settings                   | UserSettings 등                                                   | mock        | 영속화                                | 09               |
| 보안 원칙                          | public repo 민감정보 금지                                                                                                                                   | 저장소                     | —                                                                 | working     | 유지                                  | README/CLAUDE.md |

## 반드시 포함(확인)

아래 기능이 **모두 위 표에 존재**한다.

- 중앙 재생 버튼
- 오디오 플레이어
- 챕터 이동
- 이전/다음/다시 듣기
- 저장
- 더 알아보기
- 외부 소스 수집 (Source Adapter)
- Daily Recap
- 저장 카드
- 카테고리 브리핑
- 예약 브리핑
- 개인화 브리핑 조립
- 음성 명령
- 개인화 상품 추천
- Foundation 뉴스 지식 후보
- Event Log
- GitHub 보안 원칙
