# Review Result — implementation-delta-review-001-a1 (VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001)

```text
REVIEW_RESULT
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
ACTOR: VibeNews Reviewer
REVIEW_TYPE: IMPLEMENTATION_DELTA_REVIEW
REVIEW_ID: implementation-delta-review-001-a1
REVIEW_PASS: delta
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
DESIGN_CONTENT_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
DESIGN_SUBJECT_PATHS: 14 frozen design paths at 5c97382 (unchanged; especially §14.1/§14.4/§14.5/§15/§16.1/§17/§18)
INITIAL_IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
SUBJECT_BASE: 767e0d2bdc6d31e9950858c4267adf75c90f5fae
VERDICT_TARGET_HEAD: f6850963349d2a667b766e60a49800079335da00
VERDICT_TARGET_PATHS: the 87 implementation paths (initial 86 + server/test/integration/accept-private.test.ts); Worker/Rework result+pointer excluded
PREVIOUS_SUBJECT_HEAD: 767e0d2bdc6d31e9950858c4267adf75c90f5fae
DELTA_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
REWORK_CONTENT_HEAD: f6850963349d2a667b766e60a49800079335da00
FINDING_IDS_IN_SCOPE: IR-F1
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 1 (this NEEDS_PATCH routes attempt 2 — the final automatic attempt)
EXPECTED_INTERLEAVED_EVIDENCE_PATHS: advisor/jobs/.../{04_ADVISOR_VALIDATION,10_LOOP_STATE,index}.md; implementation/rework/1/{REWORK_HANDOFF_PROMPT,REWORK_RUN_PROMPT}.md; reviews/implementation-review-001/*; runs/reviewer/.../implementation-review-001/*; runs/rework/.../REWORK_RESULT.md; runs/worker/.../WORKER_RESULT{,_POINTER}.md
REPORT_PATHS:
- runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-delta-review-001-a1/REVIEW_RESULT.md
- runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-delta-review-001-a1/REVIEW_RESULT_POINTER.md
REPORT_HEAD: RECORDED_AFTER_REPORT_PUSH_IN_CHAT
FILES_READ:
- CLAUDE.md; AGENTS.md; docs/agent/ROLE_INDEX.md + all five canonical protocols
- frozen §14.1/§14.4/§14.5/§15/§16.1 at 5c97382; initial review report 263678e; delta-review brief/handoff; REWORK_RESULT + handoff/run prompts
- server/src/bin/accept-private.ts (full, new) and its previous blob at 767e0d2; server/test/integration/accept-private.test.ts (full)
- called modules for authority context: config.ts, db/connection, domain/contracts (formatAssurance), providers/caption, services/source, services/scheduler, services/playback, services/processing (runProcessingJob/ports), bin/worker (buildPipelinePorts/loadPipelineEvidence)
DIFF_READ:
- git diff 767e0d2..f685096 -- accept-private.ts (M +334/-12), accept-private.test.ts (A +260); other 85 subject blobs unchanged
- full 767e0d2..f685096 range: only the 2 delta paths + expected interleaved evidence; rework content commit f685096 touches only the 2 delta paths + its own REWORK_RESULT.md
COMMANDS_EXECUTED:
- git preflight/fetch/ancestry (767e0d2 ancestor of f685096, OK); allowlist/path checks; git diff --check (clean); secret scan on delta (none)
- npm run typecheck (PASS); node --test accept-private.test.ts (5/5); test:unit 46/46; test:integration 56/56 (no regression)
VERDICT: NEEDS_PATCH
DESIGN_CONFORMANCE_CHECK: PARTIAL — the runner is now a real, executable, fail-closed orchestrator that drives the actual pipeline (large, genuine improvement closing the "non-executable stub" core of IR-F1), but several §14.4 / D-009-A evidence gates are hard-coded, tautological, or operator-asserted rather than verified, so the runner CAN emit false §14.4-item and false LOCAL_DATA_CONTROLS: VERIFIED evidence. This fails the brief's explicit PASS bar.
BLOCKING_FINDINGS:
- IR-F1-D1: the reworked acceptance runner can falsely claim §14.4 evidence items and the D-009-A LOCAL_DATA_CONTROLS: VERIFIED label because key evidence inputs are not verified. Exact sub-items and bounded patch below.
NON_BLOCKING_FINDINGS:
- carried IR2/IR3 from implementation-review-001 (caption 60s vs 120s default; 47 cosmetic lint warnings) remain non-blocking and out of this delta's scope.
AUTHORITY_CONFLICTS: none — no D-001..D-009-A decision reopened; the required patch delivers the frozen §14.4 evidence-verification the runner must perform, without weakening or reinterpreting the design.
RUNTIME_CHANGE_CHECK: PASS (no unauthorized change) — delta touches only the 2 declared paths; no frozen-design/canonical/Advisor/other-actor path; no secret/media/transcript; no live call made; .env.server.local not opened.
DIRTY_FILE_CHECK: PASS — clean worktree; git diff --check clean; the 85 non-delta subject blobs are unchanged.
RELOAD_READINESS: NOT_APPLICABLE — no PASS.
REQUIRED_PATCHES: IR-F1-D1 (bounded, same-Worker IMPLEMENTATION_REWORK attempt 2 — the final automatic attempt; a further failure escalates to Leo/GPT).
RESIDUAL_RISKS: unchanged from the frozen design; none newly requiring Leo/GPT acceptance.
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

## What the rework genuinely closed (credit)

The previous `accept-private.ts` was a 29-line print stub (IR-F1). The reworked runner (334 net new lines) imports and
drives the REAL subsystem: `loadConfig` (fail-closed → RUNTIME_CONFIG_REQUIRED), `openDatabase`, `buildPipelinePorts`
(real DeepSeek/Fish/caption adapters from validated env), `runProcessingJob` (the actual caption→Builder→Verifier→Fish
pipeline), `createManualBatch/enqueueManualBatch`, channel `registerChannel/fetchChannelFeed/parseChannelFeed/
recordDiscoveries/promoteDiscoveries`, and `createOrResumeAutomaticSession`; it reads §14.4 evidence from real DB rows,
gates the five labels behind a local preflight, and fails closed (exit 2/1, no labels) on missing input/config/access/
binding/vertical-slice/verifier-fail/wrong-source (5/5 tests confirm; typecheck + 56 integration + 46 unit pass, no
regression). Post-review live execution can invoke this without further code — that half of the bar is met.

## Blocking finding — IR-F1-D1 (evidence gates are not verified; the runner can falsely claim §14.4/local-control)

All locations are in `server/src/bin/accept-private.ts` at `f685096`. Per the brief, a PASS also requires that the
runner "cannot falsely claim any section 14.4 item or D-009-A local-control label." The following each violate that:

- **(a) §14.4(8) raw-retention is a hard-coded constant feeding the VERIFIED label — most severe.** Line ~240
  `const rawRetained = false;` then line ~247 `!rawRetained` is part of `localControlsPass`, which gates
  `LOCAL_DATA_CONTROLS: VERIFIED`. The runner asserts a verified local control it never checks; it can emit false
  verified-local-control evidence regardless of actual retention. Required: derive `rawRetained` from real checks —
  the job's `temporary_caption_artifacts` deleted within deadline (already have `captionDeleted`), absence of any raw
  source/body value column/row for the job, and no original media/transcript file remaining under the job's temp/state
  dirs; emit VERIFIED only when all pass.
- **(b) §14.4(9) access preconditions are unverified operator booleans.** `accessFromEnv` (lines ~259–268) derives
  loopback from config but reads `tailscaleServeHttps/authorizedDeviceGrant/funnelDisabled/publicUnreachable` from bare
  `VIBENEWS_ACCEPT_*` env flags. An operator can set them and pass §14.4(9) with no access check, provenance, or
  timestamp. Required: verify these from redacted observable evidence (e.g., redacted `tailscale serve`/`funnel`
  status and a bounded loopback-vs-nonloopback bind probe), recording safe provenance/timestamps; absence →
  RUNTIME_ACCESS_REQUIRED. (Live device execution remains the §14.5 deferral.)
- **(c) §14.4(7) channel discovery uses a tautology.** Line ~216 `channelPollOk = discovered >= 0 && promoted <= 3 &&
  hourly` — `discovered >= 0` is always true and proves no discovery. Required: assert real discovery tied to this run
  (recorded discoveries match the parsed feed entries; promotion applies the oldest-first ≤3 rule; last/next poll
  timestamps are set by this poll and exactly hourly).
- **(d) §14.4(5) "one TTS success" checks the daily total, not this job's increment.** Line ~188 `ttsExactlyOne =
  receipts.c === 1 && (usage.successful_count) === 1 && readyAssets.c === 1` uses `daily_tts_usage.successful_count`,
  which is wrong when the daily table already holds other successful work (false FAIL). Required: assert exactly one
  finalized receipt and exactly one ready asset FOR THIS job/content and a +1 successful_count increment attributable
  to this job — not the daily aggregate.
- **(e) §14.4(6) "authorized Range fetch" is a filesystem stat, not an authorized HTTP Range request.** Lines ~191–198
  use `statSync(...).size === byte_count`. Required: exercise the real authorized audio Range path (invoke the audio
  route handler / an in-process authorized `Range: bytes=` request returning 206 with correct bytes and private/no-store
  headers). Real device A/B/C/D remains the §14.5 deferral, but the authorized Range fetch is a §14.4(6) server path.
- **(f) §14.4(11) policy-snapshot gate accepts empty content.** The runner selects only `lookup_status/date` (lines
  ~122–127) and the PASS fixture seeds empty `official_policy_urls`/statement/control arrays; empty policy evidence
  still gates the five labels. Required: require non-empty official policy URLs, policy/review dates, public API surface,
  statement codes, and verified/unverified control-code sets per D-009-A before emitting the labels.
- **(g) §14.4(11) runtime binding is accepted from a precomputed boolean + row count.** Lines ~124–125 check
  `bindings.length === 3`, a precomputed `runtimeBindingValid`, and non-null HMAC columns — not a recomputation/
  validation against the configured endpoint/model/reasoning/reference selectors, nor the per-role selector matrix
  (builder/verifier/fish require different HMAC fields). Required: validate the role-selector matrix and verify the
  binding against configured selectors (value-free), not merely row count.

Bounded scope: `server/src/bin/accept-private.ts` + `server/test/integration/accept-private.test.ts` only. Required
tests: add negative cases proving each gate FAILS on false evidence — a policy snapshot with empty URLs must not PASS;
a present raw artifact/undeleted caption must FAIL and never emit `LOCAL_DATA_CONTROLS: VERIFIED`; unverified access
(not a bare boolean) must BLOCK; a daily table pre-seeded with other successful work must still compute this job's
single increment correctly; a `discovered === 0` feed must not pass §14.4(7); a mismatched runtime binding must BLOCK.
The synthetic path stays no-live-call; the goal is that the tests exercise the verified boundary, not reproduce the
runner's own assertions with permissive fixtures.

## Verdict

`NEEDS_PATCH` for rework head `f6850963349d2a667b766e60a49800079335da00` against `FROZEN_DESIGN_HEAD 5c97382`. The
runner is now genuinely executable and fail-closed on the pipeline — a real improvement — but it does not yet
truthfully require and verify its §14.4/D-009-A evidence and can therefore emit false acceptance/label evidence, which
the brief's PASS bar forbids. Route a same-Worker `IMPLEMENTATION_REWORK` attempt 2 (the final automatic attempt)
limited to IR-F1-D1(a–g) on the two delta paths, then return for same-Reviewer `IMPLEMENTATION_DELTA_REVIEW`. A further
non-pass reaches the two-attempt limit and must return to Leo/GPT. This verdict performs no live acceptance, freezes
nothing, and accepts no risk on Leo/GPT's behalf.
```
