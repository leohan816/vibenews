# 2026-07-03 · Design Direction — Neo-Retro AI Radio

> 디자인 방향 **문서화만.** UI 코드 리디자인·라이브러리 설치·이미지 파일 추가·package 변경 없음. docs 전용.

## 목표
VibeNews의 시각적 정체성을 **Neo-Retro AI Radio**로 고정. 제품 정의: 뉴스를 읽는 앱이 아니라 **AI가 세상의 신호를 골라 나만의 오디오 브리핑으로 들려주는 앱.** 핵심 문장: "AI가 세상의 신호를 잡아 나만의 브리핑 라디오로 들려주는 앱."

## 추가/수정한 문서
- **신규**: `설계문서/17_Design_Direction_Neo_Retro_AI_Radio.md` · 이 구현로그.
- **수정**: `00`(제품 감성) · `01`(오디오 단말기 UI 원칙) · `02`(플레이어 화면 방향) · `13`(기능 3행).

## 디자인 컨셉 요약
- **Neo-Retro AI Radio** = 옛 라디오/워크맨 촉감 + 현대 AI 오디오 플레이어 + 프리미엄 warm 다크모드.
- 컬러: warm black/charcoal/dark brown 배경, graphite surface, **amber orange** 주 액센트, cream/muted green/soft blue 보조, 위험은 작은 coral dot만. (네온/사이버펑크/과한 밝은 색 금지)
- 용어(라디오 감성): Signal · Channel · Briefing · Today Mix · Flow · Chapter · Queue · Saved Signal · Deep Listen. 한국어: 오늘의 흐름/브리핑 채널/오늘의 믹스/다음 챕터/저장한 신호/깊게 듣기. (TTS-ready는 내부 용어)
- 컨셉 후보 3개 + 비중: Neo-Retro AI Radio 70% / Premium Briefing Console 20% / Modern Walkman 10%.
- 디자인 원칙 7개(Audio-first, Less feed·more player, Warm premium retro, Signal metaphor, Human listening, Trust & calm, Category clarity — Skin Care top-level·K-Beauty는 tag/business만).
- 디자인 토큰 초안 포함(값은 리디자인 시 확정, 코드 미적용).

## 홈 화면 방향
현재 구조 유지 + 시각 언어 변경. 로고/메뉴/검색 + Category 탭 + 상태 pill + **Hero Playback Card(오디오 단말기 메인 패널·큰 물리버튼 느낌 play)** + 하단 **오늘의 흐름 카드(방송/채널/트랙 카드, signal dot)** + Bottom Tab.

## 플레이어 화면 방향
읽는 화면 아닌 듣는 화면. 상단 `AI CHANNEL · CHAPTER 2/7`, 중앙 soft waveform/glowing orb/signal visual, 제목+한 줄 요약, 음악 플레이어식 진행바, 이전/재생·정지/다음, 버튼 저장·더 알아보기·**깊게 듣기**. 느낌: 음악 재생기·AI 라디오·프리미엄 오디오 기기.

## 디자인 원칙
Audio-first / Less feed·more player / Warm premium retro / Signal metaphor / Human listening / Trust & calm / Category clarity.

## UI 코드 변경 여부
- **없음.** src/·package.json/lock·이미지 파일 미변경. 문서 전용.

## 보안/검증
- `.env`/API key/raw transcript/실사용자 데이터/full copyrighted transcript **없음**.
- `npx tsc --noEmit` → 0 에러(코드 미변경).

## 요약
이번 작업은 로드맵 1단계(**Design Direction 문서화**)까지만. 실제 홈/플레이어 리디자인·디자인 토큰 코드 반영·오디오 구현은 future.
