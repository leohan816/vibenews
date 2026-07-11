# 00 Intake — VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
TARGET_ACTOR: VibeNews Advisor
TARGET_PROJECT: VibeNews
MISSION_TYPE: PRODUCT_MVP_VERTICAL_SLICE
DESIGN_REQUIRED: true
DESIGN_DEPTH: FULL_DESIGN
DESIGN_REVIEW_REQUIRED: true
IMPLEMENTATION_REVIEW_REQUIRED: true
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Leo/GPT
SPECIAL_IMPLEMENTATION_EXCEPTION: EXPIRED
```

## Resolved preflight

```text
RESOLVED_TARGET_REPO: /home/leo/Project/VibeNews
EXPECTED_ORIGIN_REPOSITORY: https://github.com/leohan816/vibenews.git
ORIGIN: https://github.com/leohan816/vibenews.git
TARGET_BRANCH: master
HEAD: 8f3f2d0a89c3d89a7092a3c248b031cd88340b1f
ORIGIN_MASTER: 8f3f2d0a89c3d89a7092a3c248b031cd88340b1f
DIRTY_STATE_BEFORE_WRITE: clean
REPO_TOPOLOGY_DECISION: SINGLE_REPO
FIXED_SESSIONS: VibeNews-advisor; VibeNews-designer; VibeNews; VibeNews-reviewer
```

The Advisor directly opened `CLAUDE.md`, `AGENTS.md`, all six canonical protocol files, the previous governance
final audit/pointer, the relevant product-design documents, current source, package/configuration, environment-name
documentation, tests, and recent Git evidence. The four existing fixed sessions all exist at the exact repository.
No branch creation/switch, merge, force push, history rewrite, new tmux session, agent, subagent, or replacement
context occurred.

## Preserved Leo/GPT product intent

1. Replace the bottom `Briefing` tab with `Add`.
2. Add MVP supports:
   - multiple YouTube video links submitted as one batch for analysis and audio generation;
   - YouTube channel registration, with newly detected videos automatically analyzed and converted to audio.
3. Every generated content item has Category, Subcategory, TopicCluster, Tags, Entities, and one AudioAsset.
4. When `audio_ready`, the single ContentItem is immediately visible through Listen, Category, Tag, and today's-flow
   views and enters the user's global automatic playback queue; views reference rather than duplicate it.
5. The automatic playback queue and listening state are global per user, never separate per screen/category/tag.
6. A briefing entry creates an immutable session snapshot from eligible items. Items becoming ready after session
   start never enter the active session and become eligible for the next session.
7. Unheard ordering is `audioReadyAt ASC`; the oldest ready audio plays first.
8. One video failure never blocks the rest of a batch.
9. MVP does not expire unheard items; they remain until completed or skipped.
10. Completed/skipped content remains manually playable from detail, Category, Tag, and Saved without returning to
    the automatic queue. Manual replay updates only `playCount` and `lastPlayedAt` for queue eligibility purposes.

## Playback-policy correction (current authority)

The prior five-second exclusion rule is deleted and must not survive in design, code, tests, copy, or migration.

```text
PLAYBACK_STATES: unheard; in_progress; completed; skipped
AUTO_QUEUE_EXCLUDED_STATES: completed; skipped
GLOBAL_PLAYBACK_STATE: activeContentId; activePositionSec; activeBriefingSessionId; updatedAt
RESUME_PRIORITY: an active incomplete in_progress item always precedes unheard items at every automatic entry point
RESUME_POSITION: lastPositionSec
AFTER_RESUME_COMPLETES: continue the session snapshot's unheard items by audioReadyAt ASC
PERSISTENCE: same user across app exit, screen move, category move, and tag move
IN_PROGRESS_COPY: 이어듣기; current/total; e.g. 2:14부터 이어듣기
MANUAL_REPLAY: completed content may be manually replayed without automatic-queue reentry
```

All automatic entry points share this contract: today's briefing, Listen global play, Category play, Tag play, and
today's-flow play. The expected interpretation to be confirmed is one global auto queue, not five filtered queue
states.

## Safety and pipeline constraints

```text
SUPPORTED_SOURCE: YouTube only
CAPTION_POLICY: public captions only
LOGIN_OR_BROWSER_COOKIE: forbidden
ORIGINAL_VIDEO_DOWNLOAD: forbidden
RAW_TRANSCRIPT: temporary cache only; never commit or persist as product content
QUALITY_GATE: DeepSeek rubric overallScore >= 9.0 and no critical failure
AUTOMATIC_REVIEW_ATTEMPTS_MAX: 2
NO_AUTO_QUEUE: no captions; TTS failed; human-review-required; audio not ready
SECRET_LOCATION: server only; never client, repo, result, log, or chat
```

## Required acceptance scenarios

### Global ordering and snapshot

- Generate audio A, B, C in that order; first briefing starts A.
- Generate D after an active session starts; D does not enter that session and is eligible in the next snapshot.
- A batch item failure does not block successful siblings.
- Items without captions, failed TTS, or human review never enter the automatic queue.

### Corrected resume scenario

- Play A to 2:14 and close the app before completion.
- Generate new audio D.
- Start today's briefing again and resume A from 2:14 before any unheard content.
- After A completes, play B, C, D by `audioReadyAt ASC` from the new session snapshot.
- Completed A is absent from every later automatic entry.
- Manual replay of A remains possible and does not reinsert A into the automatic queue.
- If B completes or is skipped through another global entry surface, B is excluded everywhere.

## Current repository facts

```text
APP: Expo SDK 57 / Expo Router / React Native / TypeScript
CURRENT_TABS: Listen; Briefing; Recap; Saved; Settings
CURRENT_BACKEND: none
CURRENT_DATABASE: none
CURRENT_AUTH: none; mock user Leo only
CURRENT_PIPELINE: design only; no actual collection, analysis, verifier, TTS, or content storage
CURRENT_AUDIO: expo-audio chapter player using remote fallback sample MP3s
CURRENT_PLAYBACK_PERSISTENCE: none; hook-local component state only
CURRENT_AUTOMATED_TESTS: none
BASELINE_TYPECHECK: PASS (`npx tsc --noEmit`)
BASELINE_WEB_EXPORT: PASS (`npx expo export -p web`, 20 static routes)
BASELINE_LINT: BLOCKED_BY_MISSING_CONFIG; Expo CLI attempted automatic config and failed module resolution; all automatic package/config changes were removed and clean state reverified
```

No relevant provider or persistence credential is present in the process environment:

```text
YOUTUBE_API_KEY: absent
FISH_AUDIO_API_KEY: absent
DEEPSEEK_API_KEY: absent
ANTHROPIC_API_KEY: absent
OPENAI_API_KEY: absent
DATABASE_URL: absent
SUPABASE_URL: absent
SUPABASE_ANON_KEY: absent
SUPABASE_SERVICE_ROLE_KEY: absent
```

`agent-reach`, `yt-dlp`, `youtube_transcript_api`, `ffmpeg`, Supabase CLI, and a server runtime are not installed as
project capabilities. `agent-reach` skill instructions were read, but its doctor command is unavailable. No package
or tool was retained from discovery.

## Direct external-contract evidence

- Expo SDK 57 `expo-audio` supports remote audio, status/position updates, playlist APIs, persistent player creation,
  and optional background playback configuration:
  <https://docs.expo.dev/versions/v57.0.0/sdk/audio/>.
- Expo SDK 57 `expo-sqlite` persists across app restarts but is not installed; its web support requires additional
  WASM/headers and is marked alpha:
  <https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/>.
- YouTube's official Data API `captions.download` requires OAuth and permission to edit the video. It is not an
  official route for arbitrary third-party public captions:
  <https://developers.google.com/youtube/v3/docs/captions/download>.
- YouTube officially documents channel upload notifications through WebSub/PubSubHubbub and channel Atom feeds,
  which require a reachable callback server for push delivery:
  <https://developers.google.com/youtube/v3/guides/push_notifications>.

Therefore the requested no-login arbitrary-public-caption path needs an explicitly accepted server-side extraction
adapter such as sandboxed `yt-dlp`, or the scope must be limited to owner-authorized caption tracks. This is a
material copyright/platform-policy and reliability decision, not an implementation detail.

## Intake gate

```text
INTAKE_STATUS: BLOCKED_DECISION_REQUIRED
DESIGNER_BRIEF_CREATED: false
DESIGNER_LAUNCHED: false
DESIGN_REVIEW_STARTED: false
FROZEN_DESIGN_HEAD: NOT_APPLICABLE
WORKER_LAUNCHED: false
SAFE_DEFAULT: no design freeze; no source extraction; no provider call; no schema/runtime/package change
NEXT_ACTOR: Leo/GPT
```
