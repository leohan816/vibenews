# Reviewer Brief — implementation-delta-review-001-a4

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
MISSION: Independently delta-review D-011-A's final lifecycle micro-correction for IR-F1-D1(g)-L against the unchanged frozen design and prior subject.
TARGET_ACTOR: VibeNews Reviewer
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews-reviewer
REVIEW_TYPE: IMPLEMENTATION_DELTA_REVIEW
REVIEW_ID: implementation-delta-review-001-a4
REVIEW_PASS: delta
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
LEO_DECISION_ID: D-011
LEO_DECISION_ACK_HEAD: c5086000070db388f6d217384191feb50433bfd2
INITIAL_IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
PRIOR_DELTA_REVIEW_ID: implementation-delta-review-001-a3
PRIOR_DELTA_REVIEW_REPORT_HEAD: d228be432e5645b06e2ad8847293a2adebb8ca88
PREVIOUS_SUBJECT_HEAD: df6dfd502593735518d77ee7d7ec62035989a016
SUBJECT_HEAD: 1b39a51a100c8b5e2925699620e24602a4df9445
SUBJECT_PATH_COUNT: 87
VERDICT_TARGET_PATHS: the exact prior 87 implementation paths; Worker/Rework results and pointers excluded
DELTA_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
REWORK_INPUT_HEAD: e6e336bc091131d85891b2ace136b687e847eecd
REWORK_CONTENT_HEAD: 1b39a51a100c8b5e2925699620e24602a4df9445
REWORK_POINTER_HEAD: 613b9a4ed96e4eaf6ac94b653071b2308d5bd8c7
FINDING_ID_IN_SCOPE: IR-F1-D1(g)-L
PREVIOUSLY_CLOSED_SUBITEMS_REGRESSION_ONLY: IR-F1-D1(a); IR-F1-D1(b); IR-F1-D1(c); IR-F1-D1(d); IR-F1-D1(e); IR-F1-D1(f)
AUTOMATIC_IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2
D010_EXCEPTIONAL_REWORK_ATTEMPTS_USED: 1
D011_FINAL_LIFECYCLE_MICRO_CORRECTION_ATTEMPT: 1
D011_FINAL_LIFECYCLE_MICRO_CORRECTION_ATTEMPTS_MAX: 1
ADVISOR_ROUTE_VALIDATION: PASS_FOR_INDEPENDENT_A4_REVIEW_ONLY
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_PENDING_IMPLEMENTATION_DELTA_REVIEW
REPORT_PATHS: runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-delta-review-001-a4/REVIEW_RESULT.md; runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-delta-review-001-a4/REVIEW_RESULT_POINTER.md
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

## Required direct review scope

Do not repeat broad product discovery. Reload the canonical Reviewer/run/result rules and directly inspect the current
immutable evidence needed for this delta:

- frozen §4.2 and the runtime-binding requirements at `FROZEN_DESIGN_HEAD`;
- D-011 request/ACK at `LEO_DECISION_ACK_HEAD`;
- complete a3 result/pointer at `PRIOR_DELTA_REVIEW_REPORT_HEAD`, especially `IR-F1-D1(g)-L`;
- D-011 rework-4 prompts and Worker result/pointer at the declared input/content/pointer heads;
- both changed product files at `SUBJECT_HEAD` and their previous blobs at `PREVIOUS_SUBJECT_HEAD`; and
- the called DB/runtime-binding contracts needed to decide the single finding.

Verify repo/origin/branch, fetched origin, clean staged/unstaged/untracked state, exact commit parents and ancestry,
content/pointer ownership, exact 87-path target identity, exact two-path product delta, Worker-evidence exclusion,
frozen-design/D-011/all-prior-review immutability, and absence of unrelated changes. The content commit may additionally
change only `REWORK_RESULT.md`; the pointer commit may change only `REWORK_RESULT_POINTER.md`.

At minimum read:

```text
git diff df6dfd502593735518d77ee7d7ec62035989a016..1b39a51a100c8b5e2925699620e24602a4df9445 -- server/src/bin/accept-private.ts server/test/integration/accept-private.test.ts
git diff e6e336bc091131d85891b2ace136b687e847eecd..1b39a51a100c8b5e2925699620e24602a4df9445
```

## IR-F1-D1(g)-L exact review criteria

Determine independently whether the actual normal runtime and tests completely close the lifecycle finding. Passing
tests and intent comments alone are insufficient.

1. **Ordering and creation authority.** Confirm `main()` uses `acceptancePreflight`, which uses
   `prepareAuditKeyAndBindings`, and that this seam counts `provider_runtime_bindings` before resolving or creating any
   key. `allowCreate:true` and `provisionRoleBindings` must be reachable only when the count is zero.
2. **Existing-row failure immutability.** With any binding row present, missing, invalid, symlinked, wrong-owner,
   wrong-mode, or wrong-size key state must produce `RUNTIME_BINDING_REQUIRED` without creating/replacing a key,
   inserting/deleting/updating/rewriting a row, calling downstream acceptance, returning PASS, or emitting any of the
   five D-009 labels. Inspect SQL and filesystem paths directly; do not infer this from test names.
3. **No replacement bindings.** Existing rows must use a load-only exact three-role lookup and validation for the
   current key/config. Missing/extra/ambiguous/mismatched rows must fail without falling back to provisioning. Confirm
   key-dependent `config_version_hash` cannot cause a new matching set to be inserted in the existing-row branch.
4. **Empty-state and valid-state behavior.** Zero rows may securely create exactly one 32-byte key and provision the
   initial three-role set. Existing rows plus the correct valid key must succeed idempotently with the same key and row
   IDs and no new key/row or mutation. Repeated validation must preserve complete row state.
5. **Owner-test seam safety.** Verify production `main()` supplies no lifecycle test options and the default resolver
   still compares real directory/key ownership with the real process UID. Decide whether `currentUid`/`keyOwnerUid`
   remain narrow deterministic-test seams or create a production bypass. The wrong-owner test must reach
   `AUDIT_KEY_OWNER` for the key file while the directory-owner check passes.
6. **CLI gate truthfulness.** Confirm `acceptancePreflight` is the actual seam used by `main()`, returns non-zero and
   emits only `LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_BINDING_REQUIRED` on lifecycle failure, never calls its
   downstream, and clears loaded key bytes. On success it calls the real downstream once and clears the key in `finally`.
7. **Frozen behavior and scope.** Check that the correction changes no schema/package/migration/API/service/deployment,
   does not define an unauthorized key-rotation/re-bootstrap policy, and preserves all earlier `(g)` checks plus closed
   `IR-F1-D1(a)` through `(f)`, including the closed `(b)` access collector.
8. **Deterministic proof.** Execute the targeted test and inspect the assertions for complete before/after key artifact
   and ordered binding-row snapshots. Confirm zero-state provisioning, missing-key absence, invalid-key preservation,
   symlink/wrong-owner/wrong-mode/wrong-size failures, extra-row failure, valid-key idempotence, downstream-not-called,
   and no-label behavior are real rather than tautological.

Independently run typecheck, lint, all unit/integration/runtime-local tests, the targeted acceptance test, migration
dry-run, `git diff --check`, exact-path/control-byte checks, and focused lifecycle searches. Do not open/source
`.env.server.local`, make live YouTube/DeepSeek/Fish/Tailscale/public-network/device calls, mutate runtime state, deploy,
or perform production action.

Valid verdicts are `PASS`, `PASS_WITH_RISK`, `NEEDS_PATCH`, and `FAIL`. A `PASS` closes only implementation review and
opens the already-approved private live acceptance; it is not live acceptance or mission completion. Any other verdict
returns the exact remaining finding and evidence to Advisor and then Leo/GPT; no further correction is implied. Do not
patch any subject, design, Advisor, Worker, runtime, or other actor-owned file.
