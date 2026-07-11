# Worker Brief — VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
MISSION: Implement the independently passed, frozen private YouTube-to-generated-audio and user-global resume MVP, including the complete server, app, tests, and acceptance tooling, without making live provider calls before implementation review.
TARGET_ACTOR: VibeNews Worker
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews
WORKER_INPUT_HEAD: RECORDED_AFTER_WORKER_ROUTING_PUSH_IN_ACTUAL_LAUNCHER
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
FROZEN_DESIGN_PATHS: runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT.md; 설계문서/README.md; 설계문서/00_제품_전체지도.md; 설계문서/01_화면_구조_네비게이션.md; 설계문서/02_Listen_오디오_플레이어.md; 설계문서/03_Briefing_예약_카테고리_브리핑.md; 설계문서/10_DataModel_데이터구조.md; 설계문서/11_EventLog_사용행동기록.md; 설계문서/12_Implementation_Roadmap.md; 설계문서/13_FEATURE_INDEX.md; 설계문서/14_Video_Briefing_Quality_Strategy.md; 설계문서/15_Source_Pool_and_Editorial_Curation.md; 설계문서/16_Candidate_Review_and_TTS_Approval_Pipeline.md; 설계문서/18_YouTube_Add_Global_Resume_MVP.md
INITIAL_DESIGN_REVIEW_ID: design-review-001
INITIAL_DESIGN_REVIEW_REPORT_HEAD: f46ea708d9768ce883effbb97bcd15cbddfa1227
DESIGN_DELTA_REVIEW_ID: design-delta-review-001
DESIGN_DELTA_REVIEW_REPORT_HEAD: 8c9a94480fcaca7104edcb832f283c9e541c60b9
DESIGN_REVIEW_VERDICT: PASS
DESIGN_FINDING_CLOSURE: DR1-F1 closed under D-009-A; DR1-F2 retained non-blocking
DESIGN_CONFORMANCE_REQUIRED: true
DESIGN_DEFECT_CHECKPOINT_ALLOWED: true, only as specified below
PRODUCT_CODE_CHANGE_ALLOWED: true, exact allowlist only
REPOSITORY_OPERATIONS_ARTIFACT_CHANGE_ALLOWED: true, exact allowlist only
EXTERNAL_RUNTIME_MUTATION_ALLOWED_IN_THIS_PASS: false
LIVE_PROVIDER_CALLS_ALLOWED_IN_THIS_PASS: false
LIVE_YOUTUBE_CAPTION_FETCH_ALLOWED_IN_THIS_PASS: false
DB_ACCESS: synthetic/temporary test databases only; do not mutate an existing runtime DB
SECRET_ACCESS: false; never open .env.server.local or inspect/copy/output values
PROD_ACCESS: false
PUBLIC_DEPLOYMENT_ALLOWED: false
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

## Required direct reads and preflight

Before writing, verify repository root, origin, `master`, the launcher-supplied `WORKER_INPUT_HEAD`,
`origin/master`, and a clean staged/unstaged/untracked state. Then directly read:

- `CLAUDE.md`, `AGENTS.md`, `docs/agent/ROLE_INDEX.md`, and every canonical protocol it requires;
- all 14 frozen design subjects from `FROZEN_DESIGN_HEAD`, including the complete 584-line Designer result and the
  complete 1,829-line major design contract;
- both Reviewer result and pointer files from `INITIAL_DESIGN_REVIEW_REPORT_HEAD` and
  `DESIGN_DELTA_REVIEW_REPORT_HEAD`;
- D-009 authority in `06_D009_DECISION_ACK.md`, Advisor freeze evidence in `04_ADVISOR_VALIDATION.md`, this brief,
  and its handoff;
- every current implementation path that will be changed, plus current `package.json`, `package-lock.json`,
  `app.json`, and `tsconfig.json` before editing;
- only the official Expo SDK 57 Audio, SQLite, SecureStore, and Router documentation required to implement the
  frozen contracts.

Do not execute from chat memory or summaries. Do not open, print, parse, copy, hash, source in a shell, or otherwise
inspect `.env.server.local` values. This pass uses synthetic non-secret configuration in tests only. It must not call
DeepSeek, Fish Audio, or live YouTube caption extraction, alter `/var/lib/vibenews-dev`, install/start systemd units,
or change Tailscale login/Serve/grants/Funnel. Those are post-review live-acceptance actions routed separately.

If repository facts make the frozen design contradictory, incomplete, unsafe, or impossible within the allowlist,
stop and return `BLOCKED_DESIGN_DEFECT` only to Advisor. Do not guess, redesign, edit a frozen subject, or add a path.

## Exact repository implementation allowlist

Create, modify, move, or delete only these implementation subject paths:

```text
package.json
package-lock.json
app.json
tsconfig.json
.env.example
docs/환경변수.md
docs/실행방법.md
docs/테스트방법.md
docs/변경기록.md
docs/구현로그/2026-07-11_youtube_add_global_resume_mvp.md
src/app/_layout.tsx
src/app/(tabs)/_layout.tsx
src/app/(tabs)/index.tsx
src/app/(tabs)/briefing.tsx
src/app/(tabs)/add.tsx
src/app/(tabs)/settings.tsx
src/app/briefing.tsx
src/app/briefing-session.tsx
src/api/client.ts
src/api/contracts.ts
src/audio/global-audio-controller.ts
src/audio/global-playback-context.tsx
src/audio/global-playback-machine.ts
src/storage/device-db.ts
src/storage/playback-journal.ts
src/hooks/use-audio-player-controller.ts
src/components/add/manual-batch-form.tsx
src/components/add/manual-batch-status-list.tsx
src/components/add/channel-registration-panel.tsx
src/components/add/pipeline-status-pill.tsx
src/components/progress-bar.tsx
src/components/chapter-controls.tsx
src/data/types.ts
src/lib/audio.ts
src/lib/eventLog.ts
server/src/bin/api.ts
server/src/bin/worker.ts
server/src/bin/poller.ts
server/src/bin/migrate.ts
server/src/bin/backup.ts
server/src/bin/accept-private.ts
server/tsconfig.json
server/src/config.ts
server/src/db/connection.ts
server/src/db/migrate.ts
server/src/domain/contracts.ts
server/src/domain/enums.ts
server/src/domain/state-machines.ts
server/src/http/auth.ts
server/src/http/errors.ts
server/src/http/schemas.ts
server/src/http/routes/health.ts
server/src/http/routes/batches.ts
server/src/http/routes/channels.ts
server/src/http/routes/library.ts
server/src/http/routes/sessions.ts
server/src/http/routes/playback.ts
server/src/http/routes/audio.ts
server/src/http/routes/content.ts
server/src/providers/caption.ts
server/src/providers/deepseek-builder.ts
server/src/providers/deepseek-verifier.ts
server/src/providers/fish-tts.ts
server/src/services/source.ts
server/src/services/processing.ts
server/src/services/scheduler.ts
server/src/services/retention.ts
server/src/services/playback.ts
server/src/services/backup.ts
server/migrations/001_youtube_add_global_resume.sql
server/test/unit/*.test.ts
server/test/integration/*.test.ts
server/test/runtime/*.test.ts
ops/systemd/vibenews-api.service
ops/systemd/vibenews-worker.service
ops/systemd/vibenews-poller.service
ops/systemd/vibenews-backup.service
ops/systemd/vibenews-backup.timer
scripts/server-smoke.mjs
```

The three test globs allow only new or existing `.test.ts` files directly inside the declared unit, integration, and
runtime directories. No other glob is implied.

Worker-owned evidence paths are additionally allowed:

```text
runs/worker/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/WORKER_RESULT.md
runs/worker/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/WORKER_RESULT_POINTER.md
```

Every other path is forbidden, including frozen design subjects, `CLAUDE.md`, `AGENTS.md`, `docs/agent/**`,
`advisor/**`, `runs/designer/**`, `runs/reviewer/**`, other actor results, `.env.server.local`, any other `.env*`,
runtime DB/audio/temp/backup/private-key locations, and undeclared source/test/asset/config paths. Do not create or
switch branches, merge, amend, force-push, rewrite history, or destructively alter data.

## Required implementation

Implement the frozen design as one coherent vertical slice without weakening any boundary:

1. Add the locked Expo/server/test dependencies, shared versioned API contracts, scripts, and client/server import
   boundary. Use `npx expo install` for Expo SDK 57 packages and keep `package-lock.json` reproducible by `npm ci`.
2. Implement the complete SQLite migration, checksum/WAL/FK startup verification, exact entities, constraints,
   indexes, transactions, state machines, leases, idempotency, TTS reservations/receipts, and safe audit records.
3. Implement server-only configuration validation using only the exact prepared provider key names in the frozen
   design. Values must never reach client code, DB, logs, events, reports, tests, or chat. Implement value-free
   role-specific HMAC runtime-binding code and its fail-closed key/mode behavior, but do not provision the live key in
   this pass.
4. Implement fixed-user private bearer auth, request/error schemas, manual batches, channel controls, library,
   content delete/correction, automatic sessions, playback mutations, manual replay, health, and single-range private
   audio streaming. Bind behavior must remain loopback-only.
5. Implement the constrained `CaptionProvider`: exact YouTube canonicalization, `shell:false` yt-dlp argument
   allowlist, no login/cookie/netrc/media, bounds, isolated temp, `finally` cleanup, 15-minute sweeper, and 24-hour hard
   deadline. Unit/integration tests use synthetic VTT only; do not fetch the selected live caption in this pass.
6. Implement replaceable `BuilderProvider`, `VerifierProvider`, `TtsProvider`, and `CaptionProvider`. Every LLM stage
   is DeepSeek; Builder chunk/aggregate and Verifier have distinct prompts, contexts, schemas, selectors, adapters,
   and attempt accounting. Server PASS is model PASS plus score `>=9.0` plus zero critical failures; Verifier has at
   most two actual submissions and no fallback.
7. Implement D-009-A exactly: versioned current-scope approvals, deterministic pre-network payload guards, per-role
   recursive allowlists, value-free audits, official-policy snapshot schemas, exact five assurance labels only after
   verified local preflight, prohibited-claim formatting, and all expanded/ambiguous scope hard escalations.
8. Ensure DeepSeek semantic payloads contain only the allowed public transcript chunk/evidence, public provenance,
   and strict generated analysis/scripts needed for the stage. Ensure Fish semantic payload contains only the final
   approved spoken script, configured reference identifier, and minimum synthesis parameters. Authorization is added
   only after the semantic guard. Tests must capture fields without any real credential or copyrighted transcript.
9. Implement Fish receipt/reservation/outcome-unknown/staging/finalization recovery, exact one AudioAsset, Asia/Seoul
   daily successful-generation limit 10, and no automatic resubmission of uncertain or already-successful calls.
10. Replace the Briefing tab with Add while preserving Briefing/Schedule/BriefingSession push access. Implement 10-link
    batch UX, five-channel standing approval/revocation, progress/defer/human-review states, recovery, Dynamic Type,
    screen-reader semantics, focus, and reduced motion.
11. Implement root Expo SQLite and one root-lifetime `expo-audio` controller with a durable outbox/journal, exact
    four-state automatic playback, active-first immutable snapshots, `audioReadyAt,id` ordering, completed/skipped
    exclusion, deliberate seek reconciliation, cold-start 2:14 resume, and isolated manual replay.
12. Implement API/worker/poller/backup entrypoints, systemd artifacts, backup/restore, retention, readiness, rollback
    documentation, and a redacted real-acceptance runner. The files may be authored and tested locally; do not install
    or start services or mutate operator-owned Tailscale state in this pass.
13. Preserve all exact limits: 10 links per batch, 5 channels, hourly polling, 3 unseen videos per channel per poll,
    10 successful TTS generations per Asia/Seoul day, pipeline concurrency 1, and at most 2 Verifier submissions.
    Every cap hit defers without discard.
14. Keep `human_review_required` structurally unable to enter TTS or automatic playback. Keep original video/audio,
    raw caption, provider bodies, real secrets, and configured provider values out of Git, fixtures, DB, logs, events,
    docs, and Worker reports.
15. Build the later real acceptance path for video `5JqK9JLD140`, channel
    `UCx_YiR733cfqVPRsQ1n8Fag`, exact D-009 labels, private transport denial, and A/B/C/D plus 2:14 playback evidence,
    but record it as `NOT_RUN_PENDING_IMPLEMENTATION_REVIEW` in this implementation pass. Do not substitute sample
    audio or synthetic provider output for later live evidence.

## Required tests and checks

Use synthetic, non-secret, non-copyright fixtures only. Run and record at minimum:

```text
npm ci
npx expo install --check
npx expo-doctor
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run server:migrate -- --dry-run
npm run server:config-check
npm run test:runtime-local
```

`server:config-check` in this pass must use a documented synthetic non-secret environment supplied without opening
the ignored live file. `test:runtime-local` must use only synthetic metadata/caption hashes and generated tiny audio.
Do not run `accept:private` yet.

Also execute and record:

- exact input-to-content path comparison against the allowlist plus `WORKER_RESULT.md`;
- `git diff --check` and frozen-subject/Reviewer-report immutability checks;
- no client import/reference of server-only environment keys;
- scans for alternate LLMs, cookies/login/netrc/media download, sample/fallback automatic paths, the deleted
  five-second rule, forbidden DeepSeek/Fish fields, stale provider aliases, tracked secrets/captions/audio, and raw
  bodies;
- migration empty/repeat/checksum/FK/cap tests; API auth/Range/traversal tests; worker crash/lease/idempotency tests;
- 8.9/9.0/critical/no-attempt-3 tests; all expanded-scope pre-network stops; policy-unavailable nonblocking and exact
  label/prohibited-claim tests;
- playback state-machine, immutable snapshot, restart/offline/conflict/manual-replay tests;
- clean staged/unstaged/untracked state and exact `origin/master` verification after each push.

No test may print or persist a real provider value, request/response body, raw transcript, or generated private audio.

## Design-defect checkpoint

If a true frozen-design defect appears before implementation edits, write only a result-only
`BLOCKED_DESIGN_DEFECT` report and return to Advisor. If substantial authorized edits already exist, you may create
one clearly non-release checkpoint commit containing only the exact authorized implementation paths already changed
plus `WORKER_RESULT.md`; record `DESIGN_DEFECT_CHECKPOINT_HEAD` and do not create a pointer or continue. Never patch
the design or add an implementation path. This checkpoint authority does not permit a workaround or release claim.

## Normal commit and result contract

Use two additive commits without amend or history rewrite:

1. A Worker content commit containing only the exact implementation paths actually changed plus
   `runs/worker/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/WORKER_RESULT.md`. The result must use the canonical `WORK_RESULT`
   schema, `RESULT_HEAD: RECORDED_AFTER_RESULT_PUSH_IN_POINTER`, record the launcher-supplied base, frozen design and
   both review heads, exact changed/staged/unstaged/untracked paths, design conformance, commands, tests/builds,
   access status, `LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_PENDING_IMPLEMENTATION_REVIEW`, limitations, and risks.
2. After pushing and verifying the content commit, a pointer-only commit containing only
   `WORKER_RESULT_POINTER.md`. It records the actual Worker content head and uses
   `WORKER_POINTER_HEAD: RECORDED_AFTER_POINTER_PUSH_IN_CHAT`.

The later implementation-review subject is the Worker content head and the implementation allowlist paths actually
changed; the Worker result and separate pointer are evidence, not product verdict subjects. Push both commits to
`master`, verify origin and a clean worktree, return only the concise canonical `RESULT_WRITTEN` pointer block with
both actual heads to Advisor, and STOP. Do not launch or message Reviewer, Designer, Leo/GPT, another agent, or
another session.
