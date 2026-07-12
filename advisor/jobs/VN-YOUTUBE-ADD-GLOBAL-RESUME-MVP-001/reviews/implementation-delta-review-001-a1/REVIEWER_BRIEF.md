# Reviewer Brief — implementation-delta-review-001-a1

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
MISSION: Independently delta-review implementation rework attempt 1 for IR-F1 against the unchanged frozen design and the previous implementation subject.
TARGET_ACTOR: VibeNews Reviewer
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews-reviewer
REVIEW_TYPE: IMPLEMENTATION_DELTA_REVIEW
REVIEW_ID: implementation-delta-review-001-a1
REVIEW_PASS: delta
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
INITIAL_IMPLEMENTATION_REVIEW_ID: implementation-review-001
INITIAL_IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
PREVIOUS_SUBJECT_HEAD: 767e0d2bdc6d31e9950858c4267adf75c90f5fae
SUBJECT_HEAD: f6850963349d2a667b766e60a49800079335da00
SUBJECT_PATH_COUNT: 87
VERDICT_TARGET_PATHS: the exact 86 implementation paths in reviews/implementation-review-001/REVIEWER_BRIEF.md plus server/test/integration/accept-private.test.ts; Worker/Rework results and pointers excluded
DELTA_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
REWORK_INPUT_HEAD: 1dfaf191c9712d8691f8533e723ce1e111364b2e
REWORK_CONTENT_HEAD: f6850963349d2a667b766e60a49800079335da00
REWORK_POINTER_HEAD: cd0fae7a173e88d6c3424ac6bf295ac083b9f8fe
FINDING_IDS_IN_SCOPE: IR-F1
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 1
IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_PENDING_IMPLEMENTATION_DELTA_REVIEW
REPORT_PATHS: runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-delta-review-001-a1/REVIEW_RESULT.md; runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-delta-review-001-a1/REVIEW_RESULT_POINTER.md
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

## Required direct reads and identity checks

Directly read, without relying on prior Reviewer memory or Worker/Advisor summaries:

- both root entries and all canonical protocols;
- all 14 frozen-design subjects at `FROZEN_DESIGN_HEAD`, especially sections 14.1, 14.4, 14.5, 15, 16.1, 17, 18;
- the complete initial implementation-review result/pointer at `263678ed5ea71975b23007cb0a84cd167ee9d54c`;
- the rework handoff/run prompts, `REWORK_RESULT.md`, and `REWORK_RESULT_POINTER.md` at their actual heads;
- both delta subject files at `SUBJECT_HEAD`, the previous `accept-private.ts` blob at `PREVIOUS_SUBJECT_HEAD`, and
  every existing module/interface they call;
- the full previous-to-new Git history and exact path-filtered delta.

Verify repo/origin/branch, fetched origin, clean staged/unstaged/untracked state, ancestry, commit ownership, full
87-path target identity, exact two-path subject delta, result/pointer exclusion, frozen-design/report immutability,
and absence of unrelated product changes. Interleaved non-subject paths between previous and new heads must be only
Advisor routing artifacts, the initial Reviewer report, Worker evidence records/pointers, and no undeclared subject.

At minimum read:

```text
git diff 767e0d2bdc6d31e9950858c4267adf75c90f5fae..f6850963349d2a667b766e60a49800079335da00 -- server/src/bin/accept-private.ts server/test/integration/accept-private.test.ts
git diff 1dfaf191c9712d8691f8533e723ce1e111364b2e..f6850963349d2a667b766e60a49800079335da00
```

## IR-F1 delta-review criteria

Determine independently whether the new code closes IR-F1 completely, remains within authority, and introduces no
regression. Do not treat test names, boolean labels, or output strings as proof by themselves. In addition to the exact
initial finding, resolve these risk-focused questions from direct code and tests; they are review questions, not
pre-declared findings:

1. Does the normal CLI genuinely verify loopback, tailnet-only Serve reachability, authorized-device grant,
   Funnel-disabled state, and public/non-tailnet denial using redacted observable evidence? Or can an operator merely
   set `VIBENEWS_ACCEPT_*` booleans and cause a false PASS without any access check, provenance, timestamp, or hash?
2. Does section 14.4 item 6 require an actual authorized HTTP Range fetch and real device playback evidence before
   PASS? Assess whether `statSync` plus creating a playback session proves that requirement, and whether section 14.5
   deferral can legitimately replace item 6.
3. Is `RAW_MEDIA_OR_TRANSCRIPT_RETAINED: false` derived from real repo/DB/log/backup/temp/storage checks, or is it a
   hard-coded assertion capable of emitting false verified local-control evidence?
4. Do DeepSeek and Fish policy records satisfy D-009-A's mandatory provider name, official policy URL, policy date,
   review date, model/API endpoint, retention/training/deletion/data-control statements, verified controls, and
   unverified controls? The synthetic PASS fixture currently uses empty URL/statement/control arrays and the runner
   selects only lookup status/date; determine whether that can validly gate the five labels.
5. Are runtime bindings actually verified for the configured endpoint/model/reasoning/reference selectors, not merely
   accepted from a precomputed boolean or row count? Are all required Fish reference and provider values present while
   remaining non-output?
6. Does the runner bind the selected video's acquired provenance to the authorized official channel, use a fresh or
   safely resumable acceptance job deterministically, handle repeat runs without selecting an arbitrary old job, and
   calculate one TTS success correctly when the daily table already contains other successful work?
7. Does channel acceptance prove the required live poll/discovery evidence rather than pass on `discovered >= 0`? Are
   poll timestamps and three-item/hourly constraints tied to this run?
8. Are payload-audit cleanliness and no-value/body leakage verified meaningfully? Assess the `semantic_payload_bytes
   IS NULL` query, minimum audit count, required roles/attempts, and whether raw-retention proof is structural and
   complete.
9. Are all failure paths non-zero, sanitized, cleanup-safe, and unable to print stack traces/provider details or emit
   any of the five labels before every required local control passes? Does the CLI close resources and avoid partial
   acceptance mutation being mistaken for PASS on retry?
10. Do the five new tests exercise the real CLI/access/evidence boundary enough to prove the normal live path, or do
    injected true booleans and permissive fixture rows merely reproduce the implementation's assertions?

A PASS requires concrete code evidence that post-review live acceptance can run without modifying the reviewed
subject and cannot falsely claim any section 14.4 item or D-009-A local-control label. Deferred live network/device
execution remains correct, but the reviewed tooling must truthfully require and verify its evidence.

Independently run typecheck, lint, all unit/integration/runtime tests, the targeted acceptance test, migration dry-run,
`git diff --check`, exact-path/control-byte checks, and focused secret/body/transcript/synthetic-fallback searches. Do
not open/source `.env.server.local`, make live YouTube/DeepSeek/Fish calls, mutate systemd/Tailscale/runtime state, or
perform physical-device acceptance.

Valid verdicts are `PASS`, `PASS_WITH_RISK`, `NEEDS_PATCH`, and `FAIL`. `PASS` closes only IR-F1/tooling and opens the
later live-acceptance phase; it is not live acceptance or mission completion. `NEEDS_PATCH` must use stable finding IDs
and exact bounded paths/tests and will consume the second and final automatic implementation-rework attempt. Do not
edit or patch any subject, design, Advisor, Worker, result, runtime, or other actor-owned file.
