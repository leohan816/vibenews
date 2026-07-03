# 2026-07-03 · Listen 홈 Neo-Retro AI Radio 1차 리디자인

> Listen 홈 화면의 **시각 언어만** 개선. 백엔드/오디오/TTS/수집/모델/외부 API·이미지·라이브러리·package·route 변경 없음. 정보 구조·mock 데이터 의미 유지. 참조: 설계문서 17/01/02.

## 수정한 화면 / 컴포넌트
- `src/app/(tabs)/index.tsx` — Listen 홈 전체 재구성(warm dark Neo-Retro).
- `src/components/topic-cluster-card.tsx` — 오늘의 흐름 카드(방송/트랙 카드) 다크 리스타일.
- `src/app/(tabs)/_layout.tsx` — 하단 탭바를 다크 오디오 컨트롤 톤(amber active/muted inactive/warm black bg)으로.

## 디자인 방향 (Neo-Retro AI Radio)
- 팔레트(파일 내부 로컬 토큰 `NEO`): bgWarmBlack `#16110D` · surfaceDark `#211A14` · surfaceSoft `#2B2219` · accentAmber `#FFA23A` · textCream `#F4EBE0` · textMuted `#A6968A` · signalCoral `#FF6F61` · border `#33281F`.
- 읽는 앱이 아니라 듣는 기기. 뉴스 피드가 아니라 오디오 플레이어. 큰 재생 버튼·은은한 amber glow·둥근 촉감 카드.
- 네온/사이버펑크/사실적 카세트/장난감 레트로 금지. LCD/라디오 감성은 텍스트 배지 정도로만.

## 변경 내용
- **헤더**: `☰ / 📻 VibeNews(amber) / 🔍`.
- **카테고리 탭**: 전체·AI·건강·투자·피부관리·뷰티·비즈니스. 선택 = cream + **amber underline**, 비선택 = muted gray. (K-Beauty 없음, 피부관리 top-level)
- **상태 pill**: 다크 브라운 LCD 느낌. amber signal dot + "오늘 22개 · 약 34분 — AI가 골라 담았어요" + `SIGNAL READY`.
- **Hero Playback Card**: 오디오 단말기 메인 패널. `◉ TODAY MIX` / `22 signals · 34 min` LCD 배지, "Leo님을 위한 브리핑이 준비됐어요", **다이얼형 큰 play 버튼(amber + glow)**, "오늘의 브리핑 시작". → 기존과 동일하게 `/briefing-session`로 이동.
- **오늘의 흐름 카드**: 좌측 아이콘 블록(톤다운 그라데이션+이모지) · 제목(cream) · "오늘 n개 · 약 n분"(muted) · amber 태그 · 우측 chevron · 작은 coral signal dot.
- **하단 탭바**: warm black bg, Listen=amber, 나머지=muted gray(구조 유지).

## 유지한 정보 구조
홈 구성(로고/메뉴/검색 · Category 탭 · 상태 pill · Hero Card · 오늘의 흐름 리스트 · Bottom Tab)·네비게이션 대상·mock 데이터 의미 모두 유지. 숫자(22 signals/34 min)는 기존 mock 집계 그대로.

## 변경하지 않은 것
- 플레이어 화면, Briefing/Recap/Saved/Settings 본문.
- 오디오/TTS/수집/모델/외부 API, 데이터 구조, route(13개 유지), package.json/lock, asset/이미지.
- 전역 테마(`constants/theme`) — 다크는 홈/탭바에 로컬 토큰으로만 적용(전체 앱 리디자인 아님).

## 검증
- `npx tsc --noEmit` → **0 에러**.
- `npx expo export -p web` → 성공(웹 번들 OK).
- route **13개 유지** 확인.
- 보안: `.env`/API key/raw transcript/실사용자 데이터/full copyrighted transcript **없음**. package.json/lock 미변경.

## 요약
로드맵 2단계(홈 화면 Neo-Retro 리디자인) 1차 완료. 플레이어 리디자인·디자인 토큰 코드화·mock UI 검수·실제 오디오는 다음 단계.
