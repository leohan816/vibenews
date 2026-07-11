# 01 Advisor Brief and Decision Gate — VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001

## Gate result

```text
ADVISOR_DIAGNOSIS: COMPLETE
DESIGN_DEPTH: FULL_DESIGN
DESIGN_REVIEW_REQUIRED: true
DESIGN_ROUTING_ALLOWED: false
BLOCK_REASON: unresolved high-risk platform/copyright, credential/provider, database/backend, automated-cost, retention, identity, and approval-policy decisions
```

Canonical `RUN_PROTOCOL.md` section 3 forbids routing past intake while any of those triggers remains unresolved.
Designer, Reviewer, and Worker have therefore not been launched. Advisor has not designed or implemented the
feature.

## Unknown Gate

```text
CONFIRMED_FACTS:
- Current explicit playback correction supersedes and deletes the five-second exclusion behavior.
- The app is a frontend skeleton with no backend, DB, auth, persistent playback store, ingestion, model, TTS, or automated tests.
- YouTube official API cannot download arbitrary third-party public captions without owner edit permission/OAuth.
- Official channel push notifications require a web-accessible callback server; a public feed can alternatively be polled.
- No required provider, database, or storage credentials are available.
- The existing documents name Fish Audio for TTS, DeepSeek for the 9/10 verifier, and a larger Builder model, but these are design-era candidates, not deployed contracts.
- The current Candidate Review canonical product design requires MD/Leo approval before expensive processing, while this mission explicitly requests automatic channel processing.

ASSUMPTIONS:
- None of the unresolved material decisions below is silently inferred.
- “User-global” may mean one-device fixed-user MVP or authenticated multi-device state; those are materially different and require selection.
- Add-button submission may be intended as explicit approval and channel registration as standing approval, but this has not been confirmed.

UNKNOWNS:
- Permitted public-caption extraction mechanism and accepted YouTube/platform/copyright posture.
- Backend/DB/object-storage/deployment boundary for a real channel watcher and generated audio.
- Builder, verifier, and TTS providers/model IDs plus secure credentials and retention/training settings.
- Per-user/batch/channel/day cost and concurrency limits.
- Transcript TTL, derived-audio retention, provenance display, deletion/correction policy, and allowed deployment audience.
- Authentication/user identity boundary for globally persistent playback state.
- Exact manual replay interaction with the single active auto-resume pointer.
- Authorized test video/channel for the required live vertical slice.

COST_IF_WRONG:
- A non-official caption route may violate platform/copyright expectations or fail unpredictably.
- Client-side secrets or an incorrect backend boundary can expose credentials and user data.
- Unbounded registered-channel automation can create uncontrolled model/TTS costs.
- A wrong playback state model can replay completed items, lose resume position, or create conflicting per-screen histories.
- Mock-only implementation would falsely claim the required MVP vertical slice.

REVERSIBILITY:
- Advisor intake Markdown is reversible in a later authorized commit.
- Provider calls, external audio publication, channel subscriptions, and schema deployment are not treated as freely reversible.

REQUIRED_LEO_DECISIONS: D-001 through D-008 below
REQUIRED_EXTERNAL_REVIEW: platform/copyright policy acceptance for third-party public captions and derived audio before non-private deployment
SAFE_DEFAULT: do not route Designer, freeze design, call providers, install extraction tools, create schema, or implement runtime
REPO_TOPOLOGY_DECISION: SINGLE_REPO
```

## Required Leo/GPT decisions

### D-001 — Public-caption acquisition

Recommended for this MVP: explicitly authorize a server/container-only `yt-dlp` caption adapter with
`--skip-download`, public captions only, no cookies/login/video/audio download, strict timeout/size limits, temporary
files outside the repo, and fail-closed behavior. Accept that this is not the official YouTube captions API and needs
reliability/platform-policy monitoring.

Alternative: official API only. That limits the MVP to videos whose captions the authenticated owner may edit and
conflicts with the current no-login arbitrary-link goal.

```text
D-001_DECISION_REQUIRED: authorize constrained yt-dlp adapter, or restrict to owner-authorized captions
```

### D-002 — Vertical-slice infrastructure boundary

Recommended: repository-contained local Node API/worker for the validated MVP, local server database/object directory
for pipeline artifacts, and Expo SQLite for device playback state; channel feeds are polled while the worker is
running. Production hosting, multi-device sync, and public WebSub callback are a later reviewed deployment phase.

Alternative: choose a production backend now and provide its exact platform, Postgres/object storage, scheduler,
public callback, region, retention, and deployment authority.

```text
D-002_DECISION_REQUIRED: local validated vertical slice, or exact production backend
```

### D-003 — Model and TTS provider contract

Recommended default from current documents: Builder = server-side Anthropic current approved model; Verifier =
DeepSeek API with a separately versioned rubric prompt; TTS = Fish Audio. Required secrets must be placed by Leo in
an ignored server environment file or secret manager, never chat or Git. Exact model IDs and provider retention/
training settings must be recorded before calls.

```text
D-003_DECISION_REQUIRED: approve providers/model-selection rule and securely provision required keys
```

### D-004 — Human approval versus channel automation

Recommended interpretation of the new mission:

- pressing “분석·음성 생성” is explicit approval for that manual batch;
- registering a channel creates revocable standing approval for new public-caption videos from only that channel;
- standing approval remains constrained by caps and DeepSeek 9/10; human-review items stop and never reach TTS/queue;
- all other discovered candidates keep the existing MD/Leo approval gate.

```text
D-004_DECISION_REQUIRED: confirm or replace this approval mapping
```

### D-005 — Automatic-cost and rate caps

Recommended conservative MVP caps: 10 links per batch, 5 registered channels per user, one channel poll per hour,
at most 3 unseen videos per channel per poll, at most 10 successful TTS generations per user/day, pipeline
concurrency 1, and no retry beyond the existing two verifier attempts. Cap hits defer rather than discard.

```text
D-005_DECISION_REQUIRED: accept these caps or provide exact replacements
```

### D-006 — Retention, provenance, deletion, and audience

Recommended private/internal MVP policy: raw transcript hard-deleted within 24 hours and never exposed/exported;
store source URL/video ID/channel ID/title/published time and processing provenance; retain derived structured content,
script, and audio until user deletion; support deletion/correction state before wider deployment; no public feed or
third-party redistribution in this phase.

```text
D-006_DECISION_REQUIRED: accept this policy and private/internal audience, or provide exact policy
```

### D-007 — User identity and resume persistence

Recommended vertical-slice boundary: fixed local `userId=leo`, one active automatic `in_progress` ContentItem per
user, persisted through Expo SQLite across app restarts. Schema and API remain user-keyed for later real auth, but
multi-device sync/auth is out of this slice.

Manual replay of a completed item must not replace or reclassify the saved automatic resume target; it uses
`manual_replay` playback context and updates only `playCount`/`lastPlayedAt`.

```text
D-007_DECISION_REQUIRED: accept fixed-user/device MVP and manual-replay isolation, or require auth/multi-device now
```

### D-008 — Authorized live acceptance source

Provide one YouTube video URL with public captions and one channel ID/URL that Leo authorizes for the private test,
or explicitly authorize the Advisor/Designer to select a low-risk official technology video/channel. No health,
finance, legal, election, private, login-gated, or captionless source will be selected automatically.

```text
D-008_DECISION_REQUIRED: user-provided source, or authorize low-risk official-source selection
```

## Exact response contract

Leo/GPT may resume this job by returning values for `D-001` through `D-008`. The recommended bundle may be accepted
with one statement, provided required secrets are installed outside Git before the live pipeline phase. After every
decision is resolved, the Advisor will recheck repo/head/clean state and continue without repeating discovery:

```text
Advisor Designer brief
-> VibeNews-designer FULL_DESIGN
-> independent design-review-001
-> Advisor freeze
-> VibeNews Worker implementation
-> independent implementation-review-001
-> bounded owner patch and same-Reviewer delta review if needed
-> final audit/content/pointer publish
-> Leo/GPT pointer-only result
```
