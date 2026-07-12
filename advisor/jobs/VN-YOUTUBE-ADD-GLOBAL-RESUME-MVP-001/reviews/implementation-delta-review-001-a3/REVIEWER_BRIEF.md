# Reviewer Brief — implementation-delta-review-001-a3

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
MISSION: Independently delta-review D-010-A exceptional implementation rework attempt 3 for IR-F1-D1(b)/(g) against the unchanged frozen design and prior subject.
TARGET_ACTOR: VibeNews Reviewer
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews-reviewer
REVIEW_TYPE: IMPLEMENTATION_DELTA_REVIEW
REVIEW_ID: implementation-delta-review-001-a3
REVIEW_PASS: delta
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
LEO_DECISION_ID: D-010
LEO_DECISION_ACK_HEAD: 53f64282ec594962011da22c2328335d6a12fd8f
INITIAL_IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
PRIOR_DELTA_REVIEW_ID: implementation-delta-review-001-a2
PRIOR_DELTA_REVIEW_REPORT_HEAD: 054333eb08d677c831e911866d3c7a9dbb34df9c
PREVIOUS_SUBJECT_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
SUBJECT_HEAD: df6dfd502593735518d77ee7d7ec62035989a016
SUBJECT_PATH_COUNT: 87
VERDICT_TARGET_PATHS: the exact prior 87 implementation paths; Worker/Rework results and pointers excluded
DELTA_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
REWORK_INPUT_HEAD: 2b36dbfcde9007ddcab823f0b330364ededd5966
REWORK_CONTENT_HEAD: df6dfd502593735518d77ee7d7ec62035989a016
REWORK_POINTER_HEAD: 45bd8185026395256fc855bd9dfd600b36c942d5
FINDING_IDS_IN_SCOPE: IR-F1-D1(b); IR-F1-D1(g)
PREVIOUSLY_CLOSED_SUBITEMS_REGRESSION_ONLY: IR-F1-D1(a); IR-F1-D1(c); IR-F1-D1(d); IR-F1-D1(e); IR-F1-D1(f)
AUTOMATIC_IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2
AUTOMATIC_IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPT: 3
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPTS_USED: 1
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 1
ADVISOR_ROUTE_VALIDATION: PASS_FOR_INDEPENDENT_A3_REVIEW_ONLY
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_PENDING_IMPLEMENTATION_DELTA_REVIEW
REPORT_PATHS: runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-delta-review-001-a3/REVIEW_RESULT.md; runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-delta-review-001-a3/REVIEW_RESULT_POINTER.md
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

## Required direct reads and identity checks

Directly read, without relying on prior Reviewer memory or Worker/Advisor summaries:

- both root entries and all canonical protocols;
- all frozen-design subjects at `FROZEN_DESIGN_HEAD`, especially sections 4.2, 8.2, 12.3, 14.1, 14.4, 14.5,
  16.1, 16.3, 17, and 18;
- D-010 request/ACK at `LEO_DECISION_ACK_HEAD` and the complete initial, a1, and a2 implementation-review reports;
- both exceptional rework-3 prompts and the Worker result/pointer at their actual content/pointer heads;
- both changed subject files at `SUBJECT_HEAD`, their previous blobs at `PREVIOUS_SUBJECT_HEAD`, and every called
  config/contract/DB/provider/service/API interface needed to decide `(b)` and `(g)`;
- the exact previous-to-new Git history and path-filtered delta.

Verify repo/origin/branch, fetched origin, clean staged/unstaged/untracked state, ancestry, commit ownership, exact
87-path target identity, exact two-path product delta, result/pointer exclusion, frozen-design/all-prior-review
immutability, and absence of unrelated product changes. The content commit may additionally update only the declared
Worker `REWORK_RESULT.md`; the pointer commit may update only its pointer.

At minimum read:

```text
git diff 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518..df6dfd502593735518d77ee7d7ec62035989a016 -- server/src/bin/accept-private.ts server/test/integration/accept-private.test.ts
git diff 2b36dbfcde9007ddcab823f0b330364ededd5966..df6dfd502593735518d77ee7d7ec62035989a016
```

## IR-F1-D1(b)/(g) exceptional delta-review criteria

Determine independently whether both remaining findings are completely closed, previously closed sub-items remain
closed, and the normal CLI can truthfully execute later live acceptance without modifying the reviewed subject.
Passing tests and claimed output strings are not proof by themselves.

Resolve these direct-code questions. They are risk-focused questions, not pre-declared verdicts:

1. **Dedicated private-access observations, D1(b)/§14.4(9).** Confirm the normal `realAccessSeams` path—not only test
   seams—performs bounded read-only observations for loopback health/non-loopback denial, Tailscale Serve HTTPS,
   authorized Leo peer/grant reachability, Funnel-disabled state, and public/non-tailnet denial. Verify no constant,
   generic tailnet-up inference, shared proof, missing-target success, timeout success, or synthetic fallback remains.
2. **Serve/Funnel/device parser truthfulness.** Check the actual command identities and expected JSON/output shapes.
   Determine whether a `:443` Web entry plus proxy parsing proves the exact preconfigured HTTPS Serve target; whether
   `AllowFunnel={}`/all-false is an explicit disabled state for the command output; and whether matching an online
   `Peer` with `InNetworkMap`, deriving one tailnet IP, and running `tailscale ping` proves the frozen authorized-device
   grant/reachability rather than only generic peer connectivity. Self, wrong peer, malformed IP, unexpected output,
   and an output containing negative text must not pass. No identity/IP/raw output may be emitted.
3. **Direct denial probe semantics.** Review global-unicast classification, every local-interface target, port choice,
   socket result mapping, timeout/error behavior, and the combination with loopback-only bind and Funnel-off. Decide
   whether connecting from this host to its public-interface port 443 is sufficient evidence for the required
   unauthorized/non-tailnet/public denial, and whether all missing/ambiguous cases block.
4. **Freshness and safe evidence.** Verify each fact is timestamped after its own observation, validation time is sampled
   afterward, negative/future/stale ages block, digests are canonical/redacted/distinct, and thrown command/probe errors
   cannot leak raw output, host, route, device ID, IP, token, URL, selector, or secret.
5. **Frozen key lifecycle, D1(g)/§4.2/§8.2.** The frozen design says initial key provisioning is allowed only when no
   binding row exists; if binding rows exist and the key is missing, runtime must fail closed rather than silently create
   a new key. Inspect the normal `main()` ordering and its unconditional
   `resolveAuditKey(config.stateDir, { allowCreate: true })` before any binding-row existence check. Determine whether an
   existing DB plus missing key can create a replacement key/new binding set and pass, and whether this violates the
   frozen key lifecycle. Require direct code/test evidence, not intent comments.
6. **Key-file safety and separation.** Confirm the resolved path is only
   `<stateDir>/private/provider-audit-hmac-v1.key`; parent/file symlink, owner, exact 0700/0600 modes, regular-file type,
   32-byte size, traversal, exclusive creation, CSPRNG, complete write/fsync, race/partial cleanup, and failure behavior
   are fail closed. Verify key bytes/path metadata never enter DB/log/result/output and the device bearer-token hash is
   never provider-binding HMAC material.
7. **Real binding provisioning/validation.** Confirm the normal CLI transactionally creates/selects all three exact
   role rows from the current normalized endpoint origin/base path, Builder/Verifier models, Verifier reasoning, Fish
   model/reference, API surfaces, and adapter schema. Check idempotency/freshness refresh, `audit_key_id`, truthful
   `credential_present`, finite/not-future/fresh `verified_at`, distinct roles, every required/forbidden HMAC, config
   hash, wrong-key behavior, and policy-snapshot ordering before provider calls. A malformed base URL cannot be made safe
   merely by stripping credentials/query/fragment; account for the real `loadConfig` gate.
8. **Tests and regressions.** Confirm the positive test executes `collectAccessEvidence` and the real temp-directory
   key/binding provisioner/validator rather than injecting trusted success evidence or an arbitrary matching key. Check
   all declared access/key/binding negatives, including existing-bindings-plus-missing-key if required by item 5.
   Recheck that `(a)`, `(c)`, `(d)`, `(e)`, and `(f)` remain closed and no failure path emits the five labels or
   `LOCAL_DATA_CONTROLS: VERIFIED`.

A `PASS` requires concrete code evidence that `(b)` and `(g)` are closed with no regression or false-evidence path.
Deferred live provider/network/device execution remains correct, but the normal-runtime tooling must already be
truthful and executable.

Independently run typecheck, lint, all unit/integration/runtime tests, the targeted acceptance test, migration dry-run,
`git diff --check`, exact-path/control-byte checks, and focused secret/body/transcript/synthetic-fallback searches. Do
not open/source `.env.server.local`, make live YouTube/DeepSeek/Fish/tailnet/public-network calls, mutate runtime state,
or perform device acceptance.

Valid verdicts are `PASS`, `PASS_WITH_RISK`, `NEEDS_PATCH`, and `FAIL`. D-010-A's exceptional attempt is used 1/1 and
no attempt 4, substitute actor, or Advisor patch is authorized. A `PASS` closes only implementation tooling and opens
later live acceptance; it is not live acceptance or mission completion. Any non-pass returns to Advisor and then
Leo/GPT. Do not edit any subject, design, Advisor, Worker, result, runtime, or other actor-owned file.
