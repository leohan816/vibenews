# 17. Design Direction — Neo-Retro AI Radio

> **VibeNews는 뉴스를 읽는 앱이 아니다.** AI가 세상의 신호를 골라 나만의 오디오 브리핑으로 들려주는 앱이다.
>
> 디자인 핵심 문장: **"AI가 세상의 신호를 잡아 나만의 브리핑 라디오로 들려주는 앱."**

이번 작업은 **디자인 방향 문서화**다. UI 코드 리디자인·라이브러리 설치·이미지 파일 추가는 하지 않는다.

## 1. 디자인 컨셉 — Neo-Retro AI Radio

옛날 라디오/워크맨/음악 단말기의 **촉감** + 현대적인 **AI 오디오 플레이어** + 프리미엄 다크모드.
AI가 정보를 골라 "오늘의 브리핑 채널"로 들려주는 느낌.

**피해야 할 것**: 일반 뉴스 앱 카드 피드 · 블로그 앱 느낌 · 긴 기사 목록 · 사실적인 카세트/라디오
스큐어모피즘 · 장난감 같은 레트로 · 과한 네온/사이버펑크 · 읽기 중심 UI.

**지향할 것**: 듣는 앱 · 오디오 플레이어 중심 · 큰 재생 버튼 · 브리핑 채널 · 챕터/트랙/시그널 감성 · 적은
텍스트 · 고급스럽고 따뜻한 어두운 화면 · "켜고 듣고 싶다"는 느낌.

## 2. 시각 톤 · 컬러

**Visual Tone**: warm dark mode · premium audio device · retro LCD hint · amber orange accent · soft
brown/charcoal panels · rounded tactile cards · subtle glow · calm/mature/intelligent · readable Korean
typography.

**Color Direction**

| 역할 | 방향 |
| --- | --- |
| background | warm black / deep charcoal / dark brown |
| surface | soft dark brown / graphite |
| primary accent | amber orange |
| secondary accent | cream white / muted green / soft blue |
| danger/alert | 작은 coral/red dot만 |

> 새빨간 네온 중심 금지. 너무 밝은 컬러 남발 금지. 카테고리별 컬러는 제한적으로.

## 3. 정보 구조 · 용어 (라디오/오디오 기기 감성)

| 뉴스 앱식 | VibeNews식 | 한국어 UI |
| --- | --- | --- |
| 기사 | Signal | 신호 |
| 목록/피드 | Channel / Queue | 브리핑 채널 / 큐 |
| 추천 뉴스 | Today Mix | 오늘의 믹스 |
| 카테고리 흐름 | Flow / TopicCluster | 오늘의 흐름 |
| 상세보기 | Deep Listen | 깊게 듣기 |
| 다음 기사 | Next Chapter | 다음 챕터 |
| 저장 | Saved Signal | 저장한 신호 |

- `TTS-ready`는 **내부 용어**로만 사용(사용자 UI 노출 X).
- 계층 매핑: **Category = 큰 채널** · **Subcategory = 채널 안 세부 주제** · **TopicCluster = 오늘의 흐름/방송
  프로그램** · **ContentItem = 개별 신호/챕터** · **BriefingSession = 오늘의 오디오 믹스**.

## 4. 홈 화면 방향

현재 홈 구조는 유지하되 시각 언어를 바꾼다.

- 상단: VibeNews 로고 · 좌측 메뉴 · 우측 검색
- Category 탭: 전체 · AI · 건강 · 투자 · 피부관리 · 뷰티 · 비즈니스
- 상태 pill: `오늘 22개 · 약 34분 — AI가 골라 담았어요`
- 중앙: **Hero Playback Card** — 일반 카드가 아니라 **오디오 단말기 메인 패널**처럼. 큰 play button은
  물리 버튼/다이얼 느낌. "Leo님을 위한 브리핑이 준비됐어요" / "Today Mix · 22 signals · 34 min" / "오늘의
  브리핑 시작".
- 하단: **오늘의 흐름 카드** — 뉴스 카드가 아니라 **방송 프로그램/트랙/채널 카드**처럼. 제목 · 개수 · 시간 ·
  태그 · 작은 signal dot.
- Bottom Tab

**오늘의 흐름 카드 예시**

- AI 에이전트 흐름 — 오늘 7개 · 약 10분 — #Agent #ClaudeCode #검증루프
- 수면·대사 건강 — 오늘 4개 · 약 6분 — #수면 #혈당 #회복
- 금리와 ETF — 오늘 3개 · 약 5분 — #금리 #ETF #반도체
- 피부관리 팁 — 오늘 5개 · 약 8분 — #피부장벽 #자외선차단 #성분

## 5. 플레이어 화면 방향 (핵심)

읽는 화면이 아니라 **듣는 화면**.

- 상단: `AI CHANNEL · CHAPTER 2 / 7`
- 중앙: soft waveform / glowing orb / signal visual
- 제목: 현재 브리핑 챕터 제목
- 한 줄 요약: 지금 챕터의 핵심
- 진행바: 음악 플레이어처럼
- 컨트롤: 이전 / 재생·정지 / 다음
- 버튼: 저장 · 더 알아보기 · **깊게 듣기(Deep Listen)**

느낌: 음악 재생기 · AI 라디오 · 프리미엄 오디오 기기 · 텍스트 최소 · 음성 청취 중심.

## 6. 디자인 컨셉 후보 3개

| # | 후보 | 성격 | 비중 |
| --- | --- | --- | --- |
| 1 | **Neo-Retro AI Radio** | 라디오/오디오 단말기 느낌, signal/channel/briefing 감성 (기본 추천) | **70%** |
| 2 | **Premium Briefing Console** | 더 고급·진지, 사업가/개발자/투자자용, 콘솔/오디오 장비 | 20% |
| 3 | **Modern Walkman / Today Mix** | 음악 플레이어/플레이리스트 감성(Today Mix/Track/Queue), 일부만 | 10% |

**최종 추천**: Neo-Retro AI Radio 70% + Premium Briefing Console 20% + Modern Walkman 감성 10%.

## 7. 디자인 원칙

1. **Audio-first** — 읽기보다 듣게 만든다.
2. **Less feed, more player** — 기사 피드보다 플레이어/브리핑 큐 중심.
3. **Warm premium retro** — 레트로는 촉감만, UI는 현대적.
4. **Signal metaphor** — 정보를 signal로 보고, AI가 잡아 briefing으로 들려준다.
5. **Human listening experience** — 요약문이 아니라 사람이 읽는 듯한 음성 스크립트가 중심.
6. **Trust and calm** — 뉴스/건강/투자를 다루므로 너무 가벼워 보이면 안 된다.
7. **Category clarity** — Skin Care는 top-level category. K-Beauty는 top-level이 아니며
   tag/entity/business context로만.

## 8. 디자인 토큰 (초안 · 값은 리디자인 시 확정)

> 아직 코드 적용 안 함. 방향 참고용 초안.

```
color.bg.base        deep charcoal / warm black
color.bg.surface     soft dark brown / graphite
color.accent.primary amber orange
color.accent.cream   cream white
color.accent.calm    muted green / soft blue
color.alert.dot      coral (작은 점만)
radius.card          20-24 (tactile, rounded)
glow.subtle          낮은 opacity의 amber glow
type.kr              가독성 좋은 한국어 폰트, 큰 제목/적은 본문
motion               calm, 느린 pulse/waveform, 과한 애니메이션 금지
```

## 9. 향후 구현 단계 (Roadmap)

1. **Design Direction 문서화** ← 이번 작업(여기까지)
2. 홈 화면 Neo-Retro AI Radio 스타일 리디자인
3. 플레이어 화면 리디자인
4. 오늘의 흐름 카드 리디자인
5. 디자인 토큰 정리(코드 반영)
6. mock UI 검수
7. 실제 오디오 플레이어 구현

## 관련
- 제품: [00_제품_전체지도](00_제품_전체지도.md) · 화면/네비: [01](01_화면_구조_네비게이션.md) · 플레이어:
  [02_Listen](02_Listen_오디오_플레이어.md)
- 로드맵: [12_Roadmap](12_Implementation_Roadmap.md) · 구현 기록:
  `docs/구현로그/2026-07-03_design_direction_neo_retro_ai_radio.md`
