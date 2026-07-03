# samples/video_briefing — Gold Sample Library

이 샘플 라이브러리는 **모델 학습 데이터가 아니라 품질 기준 샘플**이다.
Qwen 8B나 다른 오픈소스 모델에게 "이 정도 품질의 브리핑을 만들어야 한다"는 **기준**을 제공하기 위한 것이다.

## 원칙

- **full transcript를 저장하지 않는다.** 저작권 있는 원문/실제 YouTube transcript를 넣지 않는다.
- **synthetic/example 자료만** 둔다(가상의 영상 내용을 기준 예시로 재구성).
- 긴 영상 처리 기준은 [`14_Video_Briefing_Quality_Strategy`](../../설계문서/14_Video_Briefing_Quality_Strategy.md)의 **LongVideoBriefingPipeline**을 따른다.
- 이 샘플은 향후 **prompt regression test** 기준 자료로 쓸 수 있게 만든다(같은 입력 → 이 정도 품질이 나오는가).

## 구조

```
samples/video_briefing/
├─ README.md
└─ 01_ai_agent_video/
   ├─ content_map.example.json     # VideoContentMap 예시(synthetic)
   ├─ quick_brief_2min.example.md  # quick 브리핑 스크립트 예시
   ├─ standard_brief_7min.example.md # standard 브리핑 스크립트 예시
   └─ quality_notes.md             # 좋은 요약 vs 나쁜 요약 차이
```

## 추후 후보 폴더 (아직 미작성)

- `02_health_supplement_video/` — 건강/보충제 영상(수치·human check 강조)
- `03_kbeauty_market_video/` — K-Beauty 시장/유통 영상
- `04_investment_macro_video/` — 투자/매크로 영상(fact/opinion/prediction 구분 강조)
- `05_dev_tool_release_video/` — 개발 도구 릴리스 영상(entity/버전 보존 강조)

각 폴더는 위 `01_ai_agent_video`와 같은 4개 파일 구조를 갖고, 모두 synthetic/example로 만든다.

## 타입

`content_map.example.json`은 설계문서 10의 `VideoContentMap`을 따른다.
브리핑 스크립트 구조는 14의 "Standard Brief 표준 구조"를 따른다.
