# Reviewer Brief — implementation-review-001

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
MISSION: Independently review the complete private YouTube-to-generated-audio and global-resume MVP implementation against the frozen design before any live provider, YouTube, server, or device acceptance.
TARGET_ACTOR: VibeNews Reviewer
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews-reviewer
REVIEW_TYPE: IMPLEMENTATION_REVIEW
REVIEW_ID: implementation-review-001
REVIEW_PASS: initial
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
DESIGN_CONTENT_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
DESIGN_SUBJECT_PATHS: 14 frozen paths declared below
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
INITIAL_DESIGN_REVIEW_REPORT_HEAD: f46ea708d9768ce883effbb97bcd15cbddfa1227
DESIGN_DELTA_REVIEW_REPORT_HEAD: 8c9a94480fcaca7104edcb832f283c9e541c60b9
SUBJECT_BASE: 60b6983942f92de123e4fe37fd735353cec06611
SUBJECT_HEAD: 767e0d2bdc6d31e9950858c4267adf75c90f5fae
PREVIOUS_SUBJECT_HEAD: NOT_APPLICABLE
INITIAL_WORKER_CONTENT_HEAD: e73ce657c731d29b3cfb8309866b076c3770081d
VALIDATION_CORRECTION_CONTENT_HEAD: 767e0d2bdc6d31e9950858c4267adf75c90f5fae
WORKER_EVIDENCE_HEAD: d008d9ed0a498fc56d00e555eb64d7e402df9edb
WORKER_POINTER_HEAD: 8fe7f16405954f26722d4266161e5bdf5f4dec51
FINDING_IDS_IN_SCOPE: complete frozen design; D-001 through D-009-A; all original success criteria; complete 86-path implementation subject
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 0
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_PENDING_IMPLEMENTATION_REVIEW
REPORT_PATHS: runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-review-001/REVIEW_RESULT.md; runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-review-001/REVIEW_RESULT_POINTER.md
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

## Immutable frozen-design paths

Read all 14 paths directly from `FROZEN_DESIGN_HEAD`; current working-tree copies or author summaries are not substitutes:

```text
runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT.md
설계문서/README.md
설계문서/00_제품_전체지도.md
설계문서/01_화면_구조_네비게이션.md
설계문서/02_Listen_오디오_플레이어.md
설계문서/03_Briefing_예약_카테고리_브리핑.md
설계문서/10_DataModel_데이터구조.md
설계문서/11_EventLog_사용행동기록.md
설계문서/12_Implementation_Roadmap.md
설계문서/13_FEATURE_INDEX.md
설계문서/14_Video_Briefing_Quality_Strategy.md
설계문서/15_Source_Pool_and_Editorial_Curation.md
설계문서/16_Candidate_Review_and_TTS_Approval_Pipeline.md
설계문서/18_YouTube_Add_Global_Resume_MVP.md
```

## Immutable implementation verdict target

The verdict applies only to these 86 implementation paths at `SUBJECT_HEAD`. `WORKER_RESULT.md` and
`WORKER_RESULT_POINTER.md` are evidence only and are not verdict subjects. The old
`src/app/(tabs)/briefing.tsx` is rename-source evidence for `src/app/briefing.tsx`, not a separate 87th subject.

```text
.env.example
app.json
docs/구현로그/2026-07-11_youtube_add_global_resume_mvp.md
docs/변경기록.md
docs/실행방법.md
docs/테스트방법.md
docs/환경변수.md
ops/systemd/vibenews-api.service
ops/systemd/vibenews-backup.service
ops/systemd/vibenews-backup.timer
ops/systemd/vibenews-poller.service
ops/systemd/vibenews-worker.service
package-lock.json
package.json
scripts/server-smoke.mjs
server/migrations/001_youtube_add_global_resume.sql
server/src/bin/accept-private.ts
server/src/bin/api.ts
server/src/bin/backup.ts
server/src/bin/migrate.ts
server/src/bin/poller.ts
server/src/bin/worker.ts
server/src/config.ts
server/src/db/connection.ts
server/src/db/migrate.ts
server/src/domain/contracts.ts
server/src/domain/enums.ts
server/src/domain/state-machines.ts
server/src/http/auth.ts
server/src/http/errors.ts
server/src/http/routes/audio.ts
server/src/http/routes/batches.ts
server/src/http/routes/channels.ts
server/src/http/routes/content.ts
server/src/http/routes/health.ts
server/src/http/routes/library.ts
server/src/http/routes/playback.ts
server/src/http/routes/sessions.ts
server/src/http/schemas.ts
server/src/providers/caption.ts
server/src/providers/deepseek-builder.ts
server/src/providers/deepseek-verifier.ts
server/src/providers/fish-tts.ts
server/src/services/backup.ts
server/src/services/playback.ts
server/src/services/processing.ts
server/src/services/retention.ts
server/src/services/scheduler.ts
server/src/services/source.ts
server/test/integration/api.test.ts
server/test/integration/enqueue.test.ts
server/test/integration/migration.test.ts
server/test/integration/ops.test.ts
server/test/integration/pipeline.test.ts
server/test/integration/playback.test.ts
server/test/integration/providers.test.ts
server/test/integration/wiring.test.ts
server/test/runtime/migrate-cli.test.ts
server/test/unit/caption.test.ts
server/test/unit/config.test.ts
server/test/unit/contracts.test.ts
server/test/unit/device-machine.test.ts
server/test/unit/domain.test.ts
server/test/unit/guard.test.ts
server/tsconfig.json
src/api/client.ts
src/api/contracts.ts
src/app/(tabs)/_layout.tsx
src/app/(tabs)/add.tsx
src/app/(tabs)/settings.tsx
src/app/_layout.tsx
src/app/briefing-session.tsx
src/app/briefing.tsx
src/audio/global-audio-controller.ts
src/audio/global-playback-context.tsx
src/audio/global-playback-machine.ts
src/components/add/channel-registration-panel.tsx
src/components/add/manual-batch-form.tsx
src/components/add/manual-batch-status-list.tsx
src/components/add/pipeline-status-pill.tsx
src/data/types.ts
src/hooks/use-audio-player-controller.ts
src/lib/audio.ts
src/storage/device-db.ts
src/storage/playback-journal.ts
tsconfig.json
```

`src/hooks/use-audio-player-controller.ts` is an intentional deletion. Inspect its base blob and every caller migration.
Read directly imported unchanged dependencies when necessary for integration context, but do not expand the verdict target.

## Required direct reads and Git evidence

Directly open and read, without substituting commit messages, Worker summaries, or this brief:

- `CLAUDE.md`, `AGENTS.md`, `docs/agent/ROLE_INDEX.md`, and every canonical protocol it requires;
- all 14 frozen-design subjects at `5c97382841d00ceb8b18e27998c5e68bbe468555`;
- the initial `design-review-001` result/pointer at report head `f46ea708d9768ce883effbb97bcd15cbddfa1227`;
- the passing `design-delta-review-001` result/pointer at report head `8c9a94480fcaca7104edcb832f283c9e541c60b9`;
- `00_INTAKE.md`, `01_ADVISOR_BRIEF.md`, `04_ADVISOR_VALIDATION.md`, `06_D009_DECISION_ACK.md`,
  `10_LOOP_STATE.md`, `index.md`, and the complete Worker brief/handoff;
- every immutable verdict-target path at `767e0d2bdc6d31e9950858c4267adf75c90f5fae`, using `git show` for
  deleted or renamed sources;
- the complete current Worker result and pointer plus the actual evidence/pointer objects;
- the complete base-to-subject diff, initial implementation diff, and validation-correction delta.

Verify repo/origin/branch, fetched `origin/master`, clean staged/unstaged/untracked state, ancestry, exact commit
ownership, frozen-design/report immutability, result/pointer/subject identity separation, and all 86 subject paths.
Expected interleaved paths in `SUBJECT_BASE..SUBJECT_HEAD` are only the two Worker evidence files. Later commits after
`SUBJECT_HEAD` must be Worker evidence-only/pointer-only or Advisor review routing; none may alter a verdict subject.

At minimum, read:

```text
git diff 60b6983942f92de123e4fe37fd735353cec06611..767e0d2bdc6d31e9950858c4267adf75c90f5fae
git diff 60b6983942f92de123e4fe37fd735353cec06611..e73ce657c731d29b3cfb8309866b076c3770081d
git diff e73ce657c731d29b3cfb8309866b076c3770081d..767e0d2bdc6d31e9950858c4267adf75c90f5fae -- server/src/http/schemas.ts server/src/providers/caption.ts
```

## Independent implementation checks

Independently verify every frozen-design requirement and original success criterion. The following are risk-focused
review questions, not pre-declared findings:

1. The SQLite schema, migrations, constraints, leases, state machines, transactions, idempotency keys, retry/defer
   behavior, crash recovery, TTS reservations/receipts, and Asia/Seoul daily accounting are executable and mutually
   consistent, including transient retry paths and uniqueness constraints.
2. Manual batches and channel standing approval create real claimable jobs, re-check authorization at claim and before
   every network attempt, enforce 10 links/5 channels/3 unseen/hourly/10 successful TTS/concurrency 1, and defer rather
   than discard. Human-review-required content must be structurally unable to reach TTS or the automatic queue.
3. The Caption provider uses constrained `yt-dlp` with no login, cookies, netrc, original video, or original audio;
   handles manual/automatic caption selection and provenance correctly; bounds output; isolates temporary files; and
   guarantees cleanup plus the 24-hour deadline.
4. DeepSeek Builder and Verifier use the configured separate models, prompts, contexts, schemas, selectors, and actual
   attempt accounting; network responses are bounded; verifier pass is score >= 9.0 with zero critical failures and at
   most two submissions; retries cannot collide with persistence or silently replay an uncertain provider outcome.
5. Fish receives only the approved spoken script, configured reference identifier, model, and minimum synthesis
   parameters. Verify the real wire schema, response parsing, audio/duration/size bounds, error sanitization,
   staging/finalization, receipt semantics, and restart behavior without making a live call.
6. D-009-A guards are pre-network and role-specific. DeepSeek/Fish payload boundaries, hard escalation scopes,
   policy-record schema, exact five acceptance labels, and prohibited-claim formatting conform exactly. Provider policy
   uncertainty remains nonblocking only for this approved public low-risk slice and is not represented as assurance.
7. Fixed-user auth, API schemas, range streaming, path traversal defense, Add UI, channel controls, status recovery,
   accessibility, client/server contract versioning, and server-secret isolation are connected to real code paths rather
   than mock-only displays.
8. The root-lifetime Expo audio controller, device SQLite journal/outbox, reconciliation, immutable automatic snapshot,
   ordering, four states, completed/skipped exclusion, cold-start 2:14 resume, and isolated manual replay are integrated
   through the actual app root and API—not merely unit-level state machines.
9. No secret/provider value, original media, raw provider body, raw transcript retention, or private audio artifact is
   tracked or logged. Provider errors are sanitized. Do not open or source `.env.server.local`; only its already-recorded
   non-value existence/mode/ignore evidence may be used.
10. API/worker/poller/backup/systemd/readiness/rollback documentation is internally consistent, loopback/private by
    default, and usable on the authorized development server without silently mutating Tailscale identity, grants,
    Serve, or Funnel.
11. `accept-private.ts` is a real, fail-closed post-review acceptance runner for the authorized Expo video/channel and
    exact provider/playback evidence. It must not convert sentinel, fake, sample-audio, or synthetic evidence into live
    acceptance and must not expose secrets or bodies.
12. All tests assert meaningful production wiring, not only fakes. Evaluate the 47 lint warnings and the pre-existing
    out-of-scope web-hook finding for material impact; do not treat exit 0 alone as design conformance.
13. Live YouTube/DeepSeek/Fish, systemd installation, Tailscale mutation, and device A/B/C/D are correctly still
    `NOT_RUN_PENDING_IMPLEMENTATION_REVIEW`. This review must not perform or claim those later acceptances.

Run the complete synthetic suite independently, including `npm ci`, typecheck, scoped lint, Expo dependency/doctor
checks, unit/integration/runtime tests, synthetic config check, and migration dry-run. Do not use live configuration.
Also run `git diff --check`, immutable-blob control-byte/text checks, allowlist/path-count checks, and focused security
searches. If a command cannot be run, record the exact reason and assess it; do not silently rely on Worker output.

Valid verdicts are `PASS`, `PASS_WITH_RISK`, `NEEDS_PATCH`, and `FAIL`. `NEEDS_PATCH` requires stable finding IDs,
exact affected paths, exact required corrections, and bounded verification. Do not reopen D-001 through D-009-A.
Do not edit or patch any subject, design, Advisor, Worker, runtime, or other actor-owned file.
