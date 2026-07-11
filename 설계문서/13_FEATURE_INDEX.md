# 13. FEATURE INDEX

모든 기능 목록. 기능 변경 시 이 표를 **먼저** 업데이트한다.

**상태 범례**

- `mock` — 화면만 / 가짜 데이터
- `partial` — 일부 동작
- `working` — 실제 동작
- `future` — 미착수
- `design-ready` — 18번 문서에 구현·acceptance 계약이 동결 대기 중이며 아직 구현 완료를 뜻하지 않음

## 기능 표

| 기능                               | 설명                                                                                                                                                        | 화면 위치                  | 데이터 모델                                                       | 상태        | 다음 구현 단계                        | 관련 문서        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------- | ----------- | ------------------------------------- | ---------------- |
| 중앙 재생 버튼                     | 한 user-global automatic session 시작/resume                                                                                                                | Listen `(tabs)/index`      | GlobalPlaybackState, BriefingSession                              | design-ready | global controller 연결               | 02, 18           |
| 오디오 플레이어                    | private generated AudioAsset를 single root expo-audio player로 재생                                                                                         | BriefingSession            | PlaybackItem, AudioAsset                                          | design-ready | 실제 private vertical slice           | 02, 18           |
| 챕터 이동                          | Chapter n/N + 자동 이어재생                                                                                                                                 | BriefingSession            | PlaybackState                                                     | partial     | -                                     | 02               |
| 이전/다음/다시/seek                | 뉴스 단위 이동 + 진행바 seek                                                                                                                                | BriefingSession            | PlaybackState                                                     | partial     | -                                     | 02               |
| 백그라운드 재생                    | 잠금화면/백그라운드 오디오                                                                                                                                  | 앱 오디오 모드             | PlaybackState                                                     | future      | audio mode + plugin                   | 02               |
| 저장                               | 재생 중 뉴스 지식 저장                                                                                                                                      | BriefingSession → Saved    | SavedCard                                                         | mock        | 지식 추출 저장                        | 05               |
| 더 알아보기                        | 내부 심층 텍스트 분석                                                                                                                                       | ExploreMore                | ExploreMore                                                       | mock        | 다중 소스 분석                        | 06               |
| 외부 소스 수집(Source Adapter)     | Source Ingestion Toolkit(yt-dlp/curl/OCR/ffmpeg/Chrome/insane-search)을 정책과 함께 어댑터로 추상화. Agent Reach·insane-search 비의존, 민감기능 기본 비활성 | (백엔드)                   | SourceAdapterConfig, SourceIngestionResult, OcrExtractionResult   | future      | 격리 sandbox/container 테스트 후 채택 | 06, 10           |
| Source Adapter Architecture        | 수집 도구를 교체 가능한 어댑터로 감싸는 계층(core 비종속)                                                                                                   | (백엔드)                   | SourceAdapterConfig                                               | future      | 인터페이스 확정                       | 06, 10           |
| Add tab                            | Briefing 하단 탭을 교체; 기존 Briefing은 push route로 보존                                                                                                  | `(tabs)/add`               | ManualBatch, Channel                                              | design-ready | tab/route 구현                        | 01, 18           |
| Manual YouTube batch               | 최대 10 URL, CTA explicit approval, item별 progress/failure isolation                                                                                        | Add                        | ManualBatch, ManualBatchItem, ProcessingJob                       | design-ready | API/UI 구현                           | 18               |
| Approved YouTube channel           | 최대 5, ON/OFF revocable standing approval, hourly discovery, poll당 unseen 최대 3                                                                          | Add                        | Channel, ChannelDiscovery                                         | design-ready | poller/UI 구현                        | 15, 18           |
| YouTube URL ingestion              | exact URL canonicalize/dedup → public captions only                                                                                                          | Add                        | SourceVideo, SourceProvenance                                     | design-ready | constrained CaptionProvider           | 12, 18           |
| YouTube caption temporary artifact | no-login/no-cookie/no-media, isolated temp, 즉시 삭제 + 24h hard backstop                                                                                    | server                     | TemporaryCaptionArtifact metadata only                            | design-ready | yt-dlp adapter/cleanup                | 14, 18           |
| Content Intelligence JSON          | 콘텐츠를 구조화한 정본 단위                                                                                                                                 | (백엔드)                   | ContentItem                                                       | future      | 스키마 확정                           | 10               |
| DeepSeek Builder                   | 별도 prompt/context/schema/model selector로 Content Intelligence와 spoken script 생성                                                                       | server worker              | BuilderOutput, ProviderAttempt                                    | design-ready | adapter 구현                          | 14, 16, 18       |
| Separate DeepSeek Verifier         | 별도 rubric/context/schema/model selector; score >=9.0 + critical 0, 총 최대 2회                                                                             | server worker              | VerifierOutput, ProviderAttempt                                   | design-ready | adapter/gate 구현                     | 14, 16, 18       |
| Fish Audio TTS generation          | passed audioScript → configured Fish Audio → exactly one private AudioAsset                                                                                  | server worker              | AudioScript, AudioAsset, DailyTtsUsage                             | design-ready | atomic finalize                       | 02, 12, 18       |
| Private Node slice                 | Fastify API + SQLite lease worker + hourly poller + private DB/audio                                                                                         | Hetzner dev server         | 전체 MVP server schema                                            | design-ready | server/ops 구현                       | 18               |
| MVP limit/defer                    | 10 links, 5 channels, hourly, 3 unseen/poll, 10 TTS/day, concurrency 1, verifier 2; no discard                                                               | Add/server                 | ProcessingJob, DailyTtsUsage, lease                               | design-ready | transaction tests                     | 18               |
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
| Video Briefing Quality Strategy    | 긴 영상을 요약 아닌 재구성하는 품질 기준·파이프라인                                                                                                         | (설계)                     | VideoContentMap 등                                                | future      | 모델 구현 전 선행                     | 14               |
| BriefingMode                       | quick(1~2분)/standard(5~8분)/deep(10~15분) 길이 모드                                                                                                      | (백엔드)                   | BriefingMode, InformationDensity                                  | future      | 밀도 기반 결정                        | 14, 10           |
| LongVideoBriefingPipeline          | transcript→chunk→VideoContentMap→script→verify→TTS                                                                                                          | (백엔드)                   | VideoBriefingPipeline                                             | future      | 단계별 구현                           | 14               |
| VideoContentMap                    | 영상 논리 구조·섹션·중요/스킵 포인트 지도                                                                                                                   | (백엔드)                   | VideoContentMap, VideoSection                                     | future      | 추출 구현                             | 10, 14           |
| VideoBriefingPipeline              | 영상 브리핑 파이프라인 상태·단계                                                                                                                            | (백엔드)                   | VideoBriefingPipeline                                             | future      | 오케스트레이션                        | 10               |
| VideoBriefingReview                | 검수 결과(누락/왜곡/과장/human check)                                                                                                                       | (백엔드)                   | VideoBriefingReview                                               | future      | verifier 연결                         | 10, 14           |
| Gold Sample Library                | 품질 기준 샘플(synthetic, prompt regression)                                                                                                                | samples/video_briefing     | —                                                                 | 참고        | 후보 폴더 확장                        | 14               |
| DeepSeek verifier/editor           | Builder와 분리된 구조화 결과 검수·편집 senior editor 역할                                                                                                   | server worker              | VerifierOutput                                                    | design-ready | private MVP adapter                   | 14, 18           |
| Source Pool | 콘텐츠 후보를 가져오는 전체 원천 목록 | (백엔드) | SourcePool, OwnerType | future | 소스 등록/mock | 15 |
| Editorial Source | MD/운영자가 정한 신뢰 소스 | (운영자) | EditorialSource | future | 운영 화면 | 15, 09 |
| Hot Topic Source | 시스템 감지 급상승 주제 | (백엔드) | HotTopic | future | trend detector | 15 |
| SourceCandidate | Source Pool→후보→선별→ContentItem | (백엔드) | SourceCandidate | future | scoring 파이프라인 | 15 |
| Category/Subcategory Taxonomy | Category→Subcategory→TopicCluster→Tag→Entity 계층 | 필터/개인화 | CategoryNode, SubcategoryNode | mock/future | mock taxonomy | 15, 03 |
| Quality Prediction | 소스 단계 품질/위험 예측 | (백엔드) | QualityPrediction | future | 예측 로직 | 15, 14 |
| SourceCandidate Scoring | editorial/hot/user/risk 기반 후보 점수화 | (백엔드) | SourceCandidate | future | score 계산 | 15 |
| Candidate Review & Approval Pipeline | manual CTA/channel ON 승인→처리→검수→TTS-ready 운영 게이트 | Add/server | ProcessingJob | design-ready | 게이트 구현 | 16, 18 |
| CandidatePreview | 승인용 미리보기(근거·예측·점수·승인상태) | (Admin) | CandidatePreview | future | Admin 화면 | 16 |
| MVP Approval Gate | manual CTA explicit approval 또는 channel ON standing approval | Add | ManualBatch, Channel | design-ready | 승인 UI/API | 16, 18 |
| Builder LLM | 승인분 본 분석·스크립트 생성; 이 MVP는 DeepSeek 전용 | server worker | BuilderOutput | design-ready | 분리 adapter | 16, 14, 18 |
| DeepSeek Verifier | 별도 rubric/context/schema의 10점 검수·수정 지시 | server worker | VerifierOutput | design-ready | 분리 adapter | 16, 14, 18 |
| 9/10 Quality Gate | overallScore ≥ 9.0이고 critical failure 0만 TTS-ready | server | VerifierOutput | design-ready | server gate | 16, 18 |
| Max 2 Review Attempts | Verifier 총 최대 2회 | server | ProviderAttempt, ProcessingJob | design-ready | transaction limit | 16, 18 |
| Human Review Stop | 2회 실패 시 TTS/automatic queue 없이 사람 검토 상태 | Add/Admin | ProcessingJob | design-ready | terminal state | 16, 18 |
| TTS Ready State | verifier pass 뒤 TTS eligible ≠ atomic AudioAsset `audio_ready` | server | ProcessingJob, AudioAsset | design-ready | 상태 관리 | 16, 18 |
| Design Direction (Neo-Retro AI Radio) | 시각 정체성·용어·컬러·홈/플레이어 방향 문서화 | (설계) | — | 문서 | 리디자인 선행 | 17 |
| Neo-Retro AI Radio UI Redesign | 홈/플레이어/오늘의 흐름 카드 리디자인 | 전 화면 | — | future | 디자인 토큰 후 구현 | 17 |
| Design Tokens | warm 다크·amber orange 등 토큰(초안) | (설계) | — | future | 코드 반영 | 17 |
| User-global automatic playback | Today/Listen/Category/Tag/Flow가 하나의 active/status/revision 공유 | 전 재생 surface | GlobalPlaybackState, PlaybackItem | design-ready | root controller/API | 02, 03, 18 |
| Immutable briefing snapshot | active first + unheard by audioReadyAt/id, post-start ready 제외 | BriefingSession | BriefingSessionItem | design-ready | transaction/service | 02, 18 |
| Durable 2:14 resume | Expo SQLite journal + server checkpoint/outbox conflict reconciliation | 전 재생 surface | PlaybackMutation, device DB | design-ready | device/server 구현 | 02, 18 |
| Manual replay isolation | completed/skipped 상태와 automatic resume pointer를 바꾸지 않는 다시 듣기 | Saved/Recap/history | PlaybackItem | design-ready | separate mode | 02, 18 |
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
- Add manual batch와 approved channel
- public-caption-only DeepSeek Builder/Verifier/Fish Audio private pipeline
- user-global automatic playback와 immutable snapshot
- durable 2:14 resume, completion/skip exclusion, manual replay isolation
