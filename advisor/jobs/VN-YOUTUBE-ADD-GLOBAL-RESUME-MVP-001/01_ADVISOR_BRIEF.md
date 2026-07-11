# 01 Advisor Brief and Decision ACK — VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001

## Current gate result

```text
ADVISOR_DIAGNOSIS: COMPLETE
DECISION_ACK_SOURCE: Leo/GPT explicit D-001 through D-008 resolution
DECISION_ACK_STATUS: ACKNOWLEDGED
DESIGN_DEPTH: FULL_DESIGN
DESIGN_REVIEW_REQUIRED: true
DESIGN_ROUTING_ALLOWED: true
BLOCK_REASON: none
UNRESOLVED_DECISIONS: none
NEXT_ACTOR: VibeNews Designer
```

This ACK supersedes only the unresolved-decision state recorded at intake. It does not replace the preserved product
intent, playback-policy correction, safety constraints, acceptance scenarios, repository facts, or role boundaries
in `00_INTAKE.md`. No completed discovery is restarted.

## Leo/GPT decision ACK

### D-001 — Public-caption acquisition

```text
DECISION: constrained server-side yt-dlp for public captions only
LOGIN: forbidden
COOKIES: forbidden
ORIGINAL_VIDEO_DOWNLOAD: forbidden
ORIGINAL_AUDIO_DOWNLOAD: forbidden
TRANSCRIPT_RETENTION: temporary only; hard-delete within 24 hours
```

The design must fail closed when a public caption cannot be obtained and must bound process time, output size,
temporary paths, and cleanup. It must not imply that this route is the official arbitrary-public-caption YouTube API.

### D-002 — Private vertical-slice boundary

```text
DECISION: existing Hetzner development server
SERVER_RUNTIME: repository-contained Node API and background worker
SERVER_DATABASE: local private database
GENERATED_AUDIO_STORAGE: private server storage
DEVICE_STATE: persistent local device playback state
CHANNEL_DISCOVERY: hourly polling
PRODUCTION_DEPLOYMENT: out of scope
MULTI_DEVICE_AUTH: out of scope
```

### D-003 — Provider contract

```text
BUILDER_PROVIDER: DeepSeek
VERIFIER_PROVIDER: DeepSeek
BUILDER_MODEL: configured server value; never copy its value into Git, logs, reports, or chat
VERIFIER_MODEL: configured server value; never copy its value into Git, logs, reports, or chat
BUILDER_VERIFIER_SEPARATION: separate prompts, contexts, and schemas
VERIFIER_PASS_THRESHOLD: overallScore >= 9.0 and no critical failure
VERIFIER_ATTEMPTS_MAX: 2 total attempts
TTS_PROVIDER: Fish Audio
TTS_MODEL_AND_REFERENCE_VOICE: configured server values; never copy values into Git, logs, reports, or chat
FORBIDDEN_LLM_PROVIDERS_THIS_MVP: Anthropic API; OpenAI API; Kimi API; local runtime LLM
REPLACEABLE_INTERFACES: BuilderProvider; VerifierProvider; TtsProvider; CaptionProvider
```

The configured values in `.env.server.local` are runtime-only inputs. The Advisor verified only file existence,
mode `600`, Git-ignore status, and absence from tracked files; no secret value was read into or copied to an artifact
or output.

### D-004 — Approval mapping

```text
MANUAL_BATCH_APPROVAL: pressing “분석·음성 생성” is explicit approval for that batch
CHANNEL_APPROVAL: auto-processing ON is revocable standing approval for that channel
HUMAN_REVIEW_REQUIRED: never reaches TTS or automatic queue
```

### D-005 — Limits

```text
LINKS_PER_BATCH_MAX: 10
REGISTERED_CHANNELS_MAX: 5
CHANNEL_POLL_INTERVAL: hourly
UNSEEN_VIDEOS_PER_CHANNEL_PER_POLL_MAX: 3
SUCCESSFUL_TTS_GENERATIONS_PER_DAY_MAX: 10
PIPELINE_CONCURRENCY: 1
VERIFIER_ATTEMPTS_MAX: 2
LIMIT_BEHAVIOR: defer; never discard
```

### D-006 — Retention, provenance, deletion, and audience

```text
AUDIENCE: private/internal MVP only
PUBLIC_FEED: forbidden
THIRD_PARTY_REDISTRIBUTION: forbidden
ORIGINAL_VIDEO_RETENTION: forbidden
ORIGINAL_AUDIO_RETENTION: forbidden
RAW_TRANSCRIPT_RETENTION: temporary only; hard-delete within 24 hours
DERIVED_RETENTION: analysis, script, provenance, and generated audio remain until user deletion
```

### D-007 — Identity and playback state

```text
USER_ID: leo
PLAYBACK_PERSISTENCE: global and durable across app restarts
PLAYBACK_STATES: unheard; in_progress; completed; skipped
AUTO_ENTRY_PRIORITY: in_progress first, then unheard by audioReadyAt ASC
AUTO_QUEUE_EXCLUSIONS: completed; skipped
MANUAL_REPLAY: never re-enters automatic queue and never replaces automatic resume
```

The five-second exclusion rule remains deleted and must not reappear in design, migration, code, tests, or copy.

### D-008 — Private acceptance sources

```text
SELECTION_AUTHORITY: Advisor and Designer may select one low-risk official technology video with public captions and one official technology channel
FORBIDDEN_SOURCE_CLASSES: health; finance; legal; election; private; login-gated; captionless
USE_BOUNDARY: private acceptance only
```

## Resolved Unknown Gate

```text
CONFIRMED_FACTS:
- D-001 through D-008 are explicit Leo/GPT authority and are resolved.
- The original intake intent and corrected global-resume contract remain current.
- The target is a private, fixed-user vertical slice on the existing development server, not a public or production service.
- Provider and reference-voice runtime configuration is prepared outside Git in .env.server.local.
- The secret file exists, has mode 600, is Git-ignored, and is not tracked; values remain undisclosed.
- Current repository topology remains SINGLE_REPO.

ASSUMPTIONS:
- The current repository host is the authorized workspace for designing the existing-development-server slice; deployment mechanics still require explicit, reversible Worker instructions in the frozen design.
- Provider availability, public-caption availability, and the selected official channel's future uploads are runtime acceptance conditions, not permission to substitute mocks.
- Fixed userId=leo identifies this private slice only and does not imply production identity or multi-device synchronization.

UNKNOWNS:
- The exact low-risk official technology video and channel will be selected and recorded by the Designer within D-008 authority.
- Exact packages, schema form, API routes, polling mechanics, device persistence technology, cleanup mechanism, and rollback are design choices bounded by D-001 through D-008.
- External provider or YouTube availability at acceptance time can fail transiently and requires truthful failure evidence and bounded retry behavior.

COST_IF_WRONG:
- An unbounded collector or retry loop can violate the approved cost and platform boundary.
- Incorrect persistence or queue identity can replay excluded content or lose the global resume target.
- A leaked server secret, retained original media, or persistent transcript violates explicit authority.
- A mock-only or sample-audio path would not satisfy the mission.

REVERSIBILITY:
- Design artifacts and repository-contained code are Git-reversible.
- Database migrations, generated audio, provider calls, and server deployment require explicit backup/rollback/cleanup design.

REQUIRED_LEO_DECISIONS: none
REQUIRED_EXTERNAL_REVIEW: required before any future non-private deployment or redistribution; not a blocker for this private slice
SAFE_DEFAULT: fail closed; defer limit hits; no TTS/queue entry without captions and verifier PASS; no automatic entry for human-review-required, failed, incomplete, completed, or skipped content
REPO_TOPOLOGY_DECISION: SINGLE_REPO
```

## Required mission sequence

```text
VibeNews-designer FULL_DESIGN
-> independent DESIGN_REVIEW design-review-001
-> Advisor exact design freeze
-> VibeNews Worker implementation
-> independent IMPLEMENTATION_REVIEW implementation-review-001
-> bounded same-owner correction and same-Reviewer delta review when required
-> real private YouTube-to-DeepSeek-to-Fish-Audio acceptance
-> global resume/exclusion playback acceptance
-> required post-PASS session reloads
-> Advisor final audit and pointer
-> Leo/GPT
```

No design-only, mock-only, sample-audio-only, or partial pipeline result is mission completion.
