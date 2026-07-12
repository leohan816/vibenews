# Worker Final Lifecycle Micro-Correction Handoff — implementation-rework-001-a4

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
TARGET_ACTOR: VibeNews Worker
TARGET_SESSION_NAME: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
LEO_DECISION_ID: D-011
LEO_DECISION: D-011-A — AUTHORIZE EXACTLY ONE FINAL LIFECYCLE MICRO-CORRECTION
LEO_DECISION_ACK_HEAD: c5086000070db388f6d217384191feb50433bfd2
LEO_DECISION_ACK_PATH: advisor/jobs/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/08_D011_DECISION_ACK.md
INITIAL_IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
PRIOR_DELTA_REVIEW_ID: implementation-delta-review-001-a3
PRIOR_DELTA_REVIEW_REPORT_HEAD: d228be432e5645b06e2ad8847293a2adebb8ca88
REVIEW_FINDING_ID: IR-F1-D1(g)-L
REWORK_INPUT_HEAD: RECORDED_AFTER_REWORK_ROUTING_PUSH_IN_ACTUAL_LAUNCHER
PREVIOUS_SUBJECT_HEAD: df6dfd502593735518d77ee7d7ec62035989a016
ALLOWED_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
WORKER_EVIDENCE_PATHS: runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT.md; runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT_POINTER.md
FORBIDDEN_PATHS: every other repository path, including frozen design, canonical protocols, Reviewer reports, Advisor artifacts, package/config files, environment files, runtime state, generated audio, databases, and secrets
AUTOMATIC_IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2
D010_EXCEPTIONAL_REWORK_ATTEMPTS_USED: 1
D010_EXCEPTIONAL_REWORK_ATTEMPTS_MAX: 1
D011_FINAL_LIFECYCLE_MICRO_CORRECTION_ATTEMPT: 1
D011_FINAL_LIFECYCLE_MICRO_CORRECTION_ATTEMPTS_MAX: 1
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a4
LIVE_PROVIDER_CALLS_ALLOWED: false
LIVE_YOUTUBE_CALLS_ALLOWED: false
LIVE_TAILNET_OR_PUBLIC_NETWORK_CALLS_ALLOWED: false
SECRET_ACCESS: false
RUNTIME_MUTATION_ALLOWED: false
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

## Required direct reads and identity checks

Do not repeat completed high-depth discovery. Before editing, verify the exact repo/origin/branch, launcher-supplied
`REWORK_INPUT_HEAD`, fetched `origin/master`, clean staged/unstaged/untracked state, ancestry, and D-011 ACK commit.
Read directly only the canonical role/run/result rules needed for this same-Worker return, then read:

- frozen section 4.2 and the audit-key/runtime-binding requirements at `FROZEN_DESIGN_HEAD`;
- `08_D011_DECISION_ACK.md` at `LEO_DECISION_ACK_HEAD`;
- the complete a3 result/pointer at `PRIOR_DELTA_REVIEW_REPORT_HEAD`, especially `IR-F1-D1(g)-L`;
- rework-3 result/pointer and the two allowed subject files at `PREVIOUS_SUBJECT_HEAD`; and
- the called DB/contract seams needed to correct only the lifecycle ordering inside the two allowed product files.

Never open, source, print, copy, inspect, or expose `.env.server.local` or any real secret value. Do not run the normal
acceptance CLI or any live provider, YouTube, Tailscale, public-network, device, deployment, production, or runtime
path. All correction checks use isolated synthetic state only.

## Only finding — IR-F1-D1(g)-L

The normal runtime currently calls `resolveAuditKey(config.stateDir, { allowCreate: true })` before determining whether
`provider_runtime_bindings` already contains rows. A lost/tampered key can therefore be replaced and new key-dependent
bindings inserted, allowing a false PASS. Make the audit-key and binding lifecycle fail closed without changing the
frozen design or any other closed behavior.

Implement an exported/testable lifecycle preparation seam used unchanged by `main()` (name is implementation-defined)
with this exact ordering and behavior:

1. Query the existing `provider_runtime_bindings` row count before resolving or creating the key.
2. If the row count is zero, and only then, allow secure initial key creation and initial three-role binding
   provisioning. Validate the provisioned set normally.
3. If any row already exists, key resolution is load-only. A missing, invalid, symlinked, wrong-owner, wrong-mode, or
   wrong-size key returns/throws only the sanitized `RUNTIME_BINDING_REQUIRED` outcome before any provisioning or row
   mutation.
4. With existing rows, do not insert a replacement binding set. Load the exact existing role set for the current valid
   key/configuration and validate it. Missing, extra, mismatched, invalid, or ambiguous existing rows fail closed; they
   must not cause fallback provisioning.
5. On every existing-binding failure, leave the filesystem and the complete binding table byte-for-value unchanged:
   no replacement key, silent rotation, new row, delete, update, or rewritten row. Do not reach
   `runPrivateAcceptance`, return PASS, or emit any of the five D-009 success labels.
6. Existing bindings plus the correct valid key must succeed idempotently, reuse the same key and row IDs, and create no
   key or binding row. Preserve the previously reviewed freshness behavior only if it does not weaken these rules.
7. Zero/discard loaded key buffers on both success and failure paths where practical. Ensure the CLI maps every
   lifecycle/preparation failure to `LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_BINDING_REQUIRED` and exits non-zero.

Do not modify the key format, path, ownership/mode/size checks, binding schema, selector/HMAC contract, provider
configuration, migration, API, package, service, or deployment behavior. Preserve closed `IR-F1-D1(a)` through `(f)`,
the already-closed access work in `(b)`, and all earlier `(g)` protections.

## Required deterministic integration proof

Extend only `server/test/integration/accept-private.test.ts` and exercise the same lifecycle seam used by `main()`.
Prove all of the following with isolated temp directories and in-memory/local synthetic databases:

- zero binding rows allow one initial key creation and one three-role provisioning, then validate successfully;
- existing rows plus a missing key return `RUNTIME_BINDING_REQUIRED`, keep the key absent, create no key, and leave the
  binding row count and complete row snapshots unchanged;
- existing rows plus an invalid but correctly sized key fail closed and preserve that exact file and all rows, with no
  replacement;
- existing rows plus a symlinked, wrong-owner, wrong-mode, or wrong-size key each fail closed and preserve the exact
  artifact/table state;
- wrong-owner behavior is deterministic. Exercise the exact shared owner-check logic or a narrow injected filesystem
  metadata/expected-UID seam used by the normal resolver; do not skip the test based on privileges and do not require
  privileged `chown`;
- existing rows plus the correct valid key succeed repeatedly with the same key, same row IDs, and unchanged row count;
- every failure is non-zero/blocked, never calls the downstream acceptance dependency, and never emits
  `LOCAL_DATA_CONTROLS: VERIFIED` or any five-label success block;
- the earlier `IR-F1-D1(a)` through `(f)` and `(g)` negative/positive tests remain passing; and
- the full integration suite remains at least 80 passing tests with zero regression.

Assertions must compare before/after key-path state and complete ordered binding-row snapshots, not only an error string
or row count. Do not use arbitrary precomputed success evidence or a test-only lifecycle path.

## Required verification

Run and record at minimum:

```text
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run test:runtime-local
npm run server:migrate -- --dry-run
```

Also run the targeted acceptance integration file, exact path/ancestry checks, `git diff --check`, text/control-byte
checks, frozen-design/D-011/all-Reviewer-report immutability, and focused searches proving there is no unconditional
`allowCreate:true` before the binding-row check and no existing-row fallback that inserts/replaces bindings. Do not
execute `accept:private` against live configuration.

## Result and commit contract

Use two additive commits without amend or history rewrite:

1. Content commit: only the two allowed product paths plus the updated canonical `REWORK_RESULT.md`. Record D-011-A,
   `IR-F1-D1(g)-L`, the exhausted historical counters, D-011 micro-correction 1/1, frozen/prior-review/previous-subject
   heads, exact deterministic tests, no-live/no-secret/no-runtime statuses, new-subject sentinel, and unrelated changes
   `none`. The verdict subject remains the same 87 implementation paths; Worker evidence is excluded.
2. After pushing and verifying content, pointer-only commit: only the updated `REWORK_RESULT_POINTER.md`, with the
   actual content/new-subject head and pointer sentinel.

Push both commits to `master`; verify origin equality, clean state, prior-subject/routing ancestry, immutable
frozen/decision/review artifacts, and exact ownership. Return only the canonical concise rework pointer to Advisor and
STOP. Do not launch or message Reviewer, Designer, Leo/GPT, or another actor.
