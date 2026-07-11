# Designer Brief — VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 1
MISSION: Design the implementable private YouTube Add, DeepSeek/Fish Audio pipeline, and global durable resume/exclusion MVP vertical slice authorized by Leo/GPT.
ORIGINAL_LEO_GPT_INTENT: Preserve every product requirement and corrected playback rule in 00_INTAKE.md plus the exact D-001 through D-008 decisions acknowledged in 01_ADVISOR_BRIEF.md; do not substitute mocks, sample audio, another provider, public deployment, or a five-second exclusion rule.
TARGET_ACTOR: VibeNews Designer
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews-designer
INPUT_HEAD: RECORDED_AFTER_ADVISOR_KICKOFF_PUSH_IN_SHORT_LAUNCHER
DESIGN_DEPTH: FULL_DESIGN
DESIGN_DEPTH_RATIONALE: Cross-cutting navigation, UI, server architecture, new database/state models, device persistence, external caption/LLM/TTS providers, automation, recurring cost, privacy/copyright, retention/deletion, failure recovery, and multiple modules require FULL_DESIGN.
DESIGN_REVIEW_REQUIRED: true
DESIGN_REVIEW_SKIP_REASON: NOT_APPLICABLE
DESIGN_REVIEW_ID: design-review-001
DESIGN_SUBJECT_PATHS: runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT.md; 설계문서/README.md; 설계문서/00_제품_전체지도.md; 설계문서/01_화면_구조_네비게이션.md; 설계문서/02_Listen_오디오_플레이어.md; 설계문서/03_Briefing_예약_카테고리_브리핑.md; 설계문서/10_DataModel_데이터구조.md; 설계문서/11_EventLog_사용행동기록.md; 설계문서/12_Implementation_Roadmap.md; 설계문서/13_FEATURE_INDEX.md; 설계문서/14_Video_Briefing_Quality_Strategy.md; 설계문서/15_Source_Pool_and_Editorial_Curation.md; 설계문서/16_Candidate_Review_and_TTS_Approval_Pipeline.md; 설계문서/18_YouTube_Add_Global_Resume_MVP.md
DESIGN_AUTHORIZED_WRITE_PATHS: every exact path in DESIGN_SUBJECT_PATHS plus runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT_POINTER.md
FORBIDDEN_PATHS: all paths not listed in DESIGN_AUTHORIZED_WRITE_PATHS, including CLAUDE.md; AGENTS.md; docs/agent/**; advisor/**; runs/worker/**; runs/reviewer/**; src/**; assets/**; package.json; package-lock.json; app.json; tsconfig.json; .env*; server/runtime/database/migration/test/code paths
REQUIRED_DIRECT_READS: the exact files and official Expo SDK 57 sources in the Required direct reads section
SUCCESS_CRITERIA: every condition in the Required design content and Success criteria sections
CONFIRMED_FACTS: the current-state and resolved-decision evidence in the Confirmed facts section
ASSUMPTIONS: the bounded private-slice assumptions in the Assumptions and non-blocking unknowns section
UNKNOWNS: no blocking policy unknown; bounded technical selections and runtime availability remain for design/acceptance
OPEN_DECISIONS: none
REQUIRED_LEO_DECISIONS: none
SAFE_DEFAULT: fail closed; defer limit hits; never expose secrets or retain/download original media; no TTS or automatic queue entry without all gates
REPO_TOPOLOGY_DECISION: SINGLE_REPO
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

## Authority and scope

Author design only. You may create the single new major-feature design document and reconcile only the exact existing
product-design subjects listed above. Do not implement source, runtime, UI, tests, packages, configuration, server,
database, deployment, or canonical governance. Do not read `.env.server.local`; its values are not needed in design
artifacts and must never enter Git, logs, result files, or chat.

`DESIGN_SUBJECT_PATHS` is the immutable review/freeze subject and includes existing product documents even when a
particular file needs no textual delta. `DESIGN_RESULT_POINTER.md` is authorized for the separate pointer-only commit
but is never part of the design content subject.

## Required direct reads

Open each directly; do not use prior chat memory as evidence:

1. `CLAUDE.md`, `AGENTS.md`, `docs/agent/ROLE_INDEX.md`, `docs/agent/AGENT_ROLE_PROTOCOL.md`,
   `docs/agent/DESIGN_PROTOCOL.md`, `docs/agent/RUN_PROTOCOL.md`, `docs/agent/RESULT_REPORTING_PROTOCOL.md`, and
   `docs/agent/SESSION_RELOAD_PROTOCOL.md`.
2. `advisor/jobs/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/00_INTAKE.md`, `01_ADVISOR_BRIEF.md`, this brief,
   `DESIGNER_HANDOFF_PROMPT.md`, `10_LOOP_STATE.md`, and `index.md`.
3. Every exact product-design subject listed in `DESIGN_SUBJECT_PATHS` that already exists, plus read-only
   `설계문서/08_Foundation_뉴스지식연동.md`, `설계문서/09_Settings_개인화설정.md`, and
   `설계문서/17_Design_Direction_Neo_Retro_AI_Radio.md` for adjacent-contract consistency.
4. `package.json`, `package-lock.json`, `app.json`, `tsconfig.json`, `.env.example`,
   `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/index.tsx`, `src/app/(tabs)/briefing.tsx`,
   `src/app/briefing-session.tsx`, `src/app/_layout.tsx`, `src/hooks/use-audio-player-controller.ts`,
   `src/lib/audio.ts`, `src/lib/eventLog.ts`, `src/data/types.ts`, and `src/data/mockData.ts` as read-only current-state
   evidence.
5. Actual Git root/origin/branch/input/clean state, `git diff <previous-head>..<INPUT_HEAD>` for this job's decision
   transition, and relevant recent history. Do not fetch, switch, merge, amend, reset, or rewrite history.
6. Exact Expo SDK 57 official documentation required for any proposed Expo APIs or packages. Use only SDK 57
   contracts and cite the official pages in the design; do not write Expo code.

## Confirmed facts and resolved decisions

- The current app is an Expo SDK 57 / Expo Router / React Native / TypeScript frontend with mock content, remote
  sample audio, hook-local playback, no backend, no database, no authentication, and no automated tests.
- Bottom tabs are currently Listen, Briefing, Recap, Saved, Settings. The mission replaces only the bottom Briefing
  tab with Add; briefing-session and today's-briefing behavior remain product flows and must be reconciled explicitly.
- D-001 through D-008 in `01_ADVISOR_BRIEF.md` are current Leo/GPT authority; none may be reopened or weakened.
- `.env.server.local` exists outside Git tracking, has mode `600`, and is ignored. Secret/model/reference values are
  runtime-only and must never be copied into design artifacts or output.
- The existing development-server slice must use a repository-contained Node API/background worker, a private local
  server database, private generated-audio storage, persistent device playback state, and hourly channel polling.
- Every LLM stage uses DeepSeek. Builder and Verifier use separately versioned prompts, contexts, schemas, and the
  configured model selectors. Pass requires overallScore at least 9.0 with no critical failure and at most two total
  attempts. Fish Audio uses the configured model and reference voice.
- The caption, provider, and TTS implementations remain replaceable behind `CaptionProvider`, `BuilderProvider`,
  `VerifierProvider`, and `TtsProvider`.
- Fixed user identity is `leo`. The playback states are exactly unheard, in_progress, completed, and skipped.
- The prior five-second exclusion rule is deleted.

## Assumptions and non-blocking unknowns

```text
ASSUMPTIONS:
- This is one private device/user plus one private development-server slice, with no public audience or multi-device auth.
- The selected official technology source may be changed within D-008 if captions or channel polling cannot be exercised, but the substitution must stay low-risk, official, public-captioned, and recorded.
- Transient provider/source outages may block a live acceptance run without authorizing mock substitution or a false PASS.

UNKNOWNS:
- Exact official test video/channel, packages, database engine/schema, API endpoints, job state machine, storage layout, cleanup scheduler, device persistence API, and deployment/rollback commands must be selected and justified in the design.
- Exact provider model/reference values remain intentionally undisclosed and are loaded only by server runtime configuration.

OPEN_DECISIONS: none
REQUIRED_LEO_DECISIONS: none
SAFE_DEFAULT: fail closed; defer limit hits; hard-delete temporary transcripts by 24 hours; never call TTS or enqueue automatic playback without all gates; never expose secrets or retain/download original media
REPO_TOPOLOGY_DECISION: SINGLE_REPO
```

If direct evidence reveals a genuine material decision outside D-001 through D-008, return
`BLOCKED_DECISION_REQUIRED` only to Advisor. Do not reopen an already resolved decision merely to choose a bounded,
reversible implementation detail.

## Required design content

The complete replacement design package and reconciled product documents must make every item below executable.

1. **Intent and non-goals:** preserve every intake requirement; explicitly exclude production/public service,
   multi-device auth, non-YouTube sources, original media download/retention, public feed/redistribution, alternate
   LLMs, local LLMs, and mock/sample-audio acceptance.
2. **Alternatives and selections:** compare bounded alternatives for the Node service layout, private local database,
   generated-audio serving, device persistence, job execution/polling, and recovery; select exact technologies with
   Expo SDK 57 compatibility and repository evidence.
3. **Add UX:** exact route/tab change, batch input and per-link validation, maximum-10 behavior, per-item progress and
   failure isolation, manual approval action, channel registration/enable-disable/delete controls, maximum-5 and
   standing-approval copy, deferred-limit visibility, accessibility, loading/empty/error/recovery states, and no
   accidental loss of existing briefing/session access.
4. **Source contract:** URL/video/channel canonicalization and deduplication; constrained public-caption-only
   `yt-dlp --skip-download` execution with no login/cookies/video/audio; command allowlist, timeout, byte/duration
   bounds, temp directory isolation, cleanup on every exit, 24-hour hard-delete backstop, provenance, and fail-closed
   captionless behavior.
5. **Pipeline and provider interfaces:** exact TypeScript interfaces and replaceable adapters for Caption, Builder,
   Verifier, and TTS; server-only config validation; separate Builder/Verifier prompt versions, context construction,
   JSON schemas and parsing; overallScore/no-critical-failure gate; maximum two total verifier attempts; human-review
   routing; Fish model/reference use; idempotency, timeouts, error taxonomy, and no provider fallback outside D-003.
6. **Domain/data model:** authoritative entities, fields, enums, uniqueness, timestamps, foreign keys, indexes, and
   state transitions for users, manual batches/items, channels/standing approval/poll cursors, sources, processing
   jobs/attempts/defer reasons, temporary transcript metadata, ContentItem, Category, Subcategory, TopicCluster,
   Tags, Entities, exactly one AudioAsset, provenance, generated storage, playback state, queue eligibility, immutable
   briefing-session snapshots, and deletion/correction/tombstone behavior.
7. **Limits and scheduling:** enforce 10 links/batch, 5 channels, hourly polling, 3 unseen/channel/poll, 10 successful
   TTS/day, concurrency 1, and two verifier attempts at authoritative transaction boundaries; define timezone/day
   accounting, fairness/order, restart-safe leases, idempotency, cap-defer/requeue timing, crash recovery, and no
   discard.
8. **Global playback semantics:** one user-global automatic state shared by today's briefing, Listen global play,
   Category play, Tag play, and today's-flow play; exact transition table for unheard/in_progress/completed/skipped;
   active incomplete resume first from `lastPositionSec`; then snapshot unheard items ordered by `audioReadyAt ASC`
   with deterministic tie-break; post-start items excluded from active snapshot; completion/skip excluded everywhere;
   manual replay isolated from automatic resume/queue; app-exit persistence, write cadence, race/conflict handling,
   and `이어듣기` copy with current/total time.
9. **API and process boundaries:** exact repository paths, API routes, request/response/error schemas, device-server
   ownership split, generated-audio authorization for the private device, worker/poller lifecycle, health/readiness,
   local database and storage locations outside Git, and no client secrets.
10. **Retention/deletion/security:** original-media prohibition, temporary transcript lifecycle and auditable hard
    deletion within 24 hours, derived-data user deletion, storage/path traversal controls, SSRF/input validation,
    subprocess isolation, log redaction, file permissions, secret boundaries, private-network exposure, provenance,
    correction, backup/restore, and cleanup of partial/failed output.
11. **Migration and rollback:** move current mocks and hook-local playback into the vertical slice without treating
    sample MP3s as acceptance; database initialization/migrations, device-state migration/defaults, safe deployment,
    rollback/cleanup, data compatibility, and a design-defect stop when repo/server facts disagree.
12. **Acceptance:** executable unit/integration/runtime tests, exact commands, fixtures that contain no copyrighted
    transcript or secret, failure injection, restart/crash checks, limit/defer tests, and the full A/B/C/D snapshot,
    2:14 resume, completion/skip exclusion, cross-surface exclusion, and manual-replay isolation scenarios.
13. **Real private vertical slice:** select and record one low-risk official technology video with public captions and
    one official technology channel; define evidence for real `YouTube -> public captions -> DeepSeek Builder ->
    separate DeepSeek Verifier -> Fish Audio -> audio_ready -> app playback`, plus hourly channel discovery. Provider
    IDs, transcript content, secret values, and copyrighted source text must not enter Git or chat.
14. **Implementation boundary:** list an exact, minimal Worker write allowlist including source, tests, package/lock,
    nonsecret config/example/docs, database migration, deployment/operations artifacts, and Worker result paths;
    separately list forbidden paths/actions and identify which validations require server/provider/device access.
15. **Review criteria:** make design review and later implementation review independently checkable, including intent
    reconciliation across every frozen product-design path, stale five-second/provider/mock searches, schema/API/state
    consistency, Expo SDK 57 citations, no-secret/no-original-media evidence, and origin/clean-state lineage.

## Success criteria

`DESIGN_STATUS: READY_FOR_DESIGN_REVIEW` is allowed only when all required design content is present, every exact
product-design subject is internally consistent, `OPEN_DECISIONS` has no blocking item, the selected acceptance
source stays within D-008, and the package gives Worker exact paths/contracts/tests without inventing policy.

The design must use the current `RESULT_REPORTING_PROTOCOL.md` Designer schema, including `COST`,
`DESIGN_SUBJECT_PATHS`, `DESIGN_AUTHORIZED_WRITE_PATHS`, `SUPERSEDES_DESIGN_CONTENT_HEAD: NOT_APPLICABLE`,
`REVISION_ID: NOT_APPLICABLE`, `REVIEW_FINDING_IDS_ADDRESSED: NOT_APPLICABLE`, and
`DESIGN_REVIEW_RECOMMENDATION`. It must not claim freeze or self-approval.

No design-only, mock-only, sample-audio-only, or partial provider result is mission completion. The Designer returns
only the content/pointer evidence to Advisor and stops.
