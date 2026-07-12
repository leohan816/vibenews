# Worker Exceptional Rework Handoff — implementation-rework-001-a3

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
TARGET_ACTOR: VibeNews Worker
TARGET_SESSION_NAME: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
LEO_DECISION_ID: D-010
LEO_DECISION: D-010-A — AUTHORIZE ONE EXCEPTIONAL FINAL REWORK
LEO_DECISION_ACK_HEAD: 53f64282ec594962011da22c2328335d6a12fd8f
LEO_DECISION_ACK_PATH: advisor/jobs/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/07_D010_DECISION_ACK.md
INITIAL_IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
PRIOR_DELTA_REVIEW_ID: implementation-delta-review-001-a2
PRIOR_DELTA_REVIEW_REPORT_HEAD: 054333eb08d677c831e911866d3c7a9dbb34df9c
REVIEW_FINDING_IDS: IR-F1-D1(b); IR-F1-D1(g)
REWORK_INPUT_HEAD: RECORDED_AFTER_REWORK_ROUTING_PUSH_IN_ACTUAL_LAUNCHER
PREVIOUS_SUBJECT_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
ALLOWED_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
WORKER_EVIDENCE_PATHS: runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT.md; runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT_POINTER.md
FORBIDDEN_PATHS: every other repository path, including frozen design, canonical protocols, Reviewer reports, Advisor artifacts, package/config files, environment files, runtime state, generated audio, databases, and secrets
AUTOMATIC_IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2
AUTOMATIC_IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPT: 3
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPTS_USED: 1
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 1
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a3
LIVE_PROVIDER_CALLS_ALLOWED: false
LIVE_YOUTUBE_CALLS_ALLOWED: false
LIVE_TAILNET_OR_PUBLIC_NETWORK_CALLS_ALLOWED: false
SECRET_ACCESS: false
RUNTIME_MUTATION_ALLOWED: false
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

## Required direct reads and identity checks

Before editing, verify exact repo/origin/branch, launcher-supplied `REWORK_INPUT_HEAD`, fetched `origin/master`, clean
staged/unstaged/untracked state, ancestry, and the D-010 ACK commit. Directly read, without chat-memory substitution:

- both root entries and every canonical protocol;
- all frozen-design paths at `FROZEN_DESIGN_HEAD`, especially sections 4.2, 8.2, 12.3, 14.1, 14.4, 14.5, 16.1,
  and 16.3;
- `05_LEO_DECISION_REQUEST.md` and `07_D010_DECISION_ACK.md` at `LEO_DECISION_ACK_HEAD`;
- the complete initial implementation review plus a1/a2 delta-review results/pointers, especially the final exact
  findings at `PRIOR_DELTA_REVIEW_REPORT_HEAD`;
- all prior rework prompts/results/pointers;
- both allowed subject files at `PREVIOUS_SUBJECT_HEAD`, their prior blobs, and every called access/config/contract/
  DB/API/service interface needed to close only `(b)` and `(g)`.

Never open, source, print, copy, inspect, hash into output, or expose `.env.server.local` or any real secret. Do not run
the normal acceptance CLI or any live Tailscale/provider/YouTube/public-network/device/runtime path. All correction
checks use injected synthetic command results, probes, paths, key bytes, DBs, and transports.

## IR-F1-D1(b) — dedicated observable access proof

Keep every attempt-2 improvement. Replace `cliAccessObserver`'s generic-tailnet inference with a normal-runtime
collector whose exact logic is testable through injected command/probe seams and used unchanged by `main()`.

Within the two allowed subject paths:

1. Obtain five independent, time-bound observations. A fact may pass only from its own dedicated evidence:
   - loopback-only Fastify binding plus a successful bounded loopback health probe and failed direct non-loopback bind
     probe for the configured API port;
   - read-only Tailscale Serve status proving HTTPS is configured and targets the expected loopback API port;
   - read-only tailnet peer/grant evidence proving the explicitly configured authorized Leo device identity is the
     matching online peer/grant, without outputting that identity;
   - read-only Funnel status proving Funnel is explicitly disabled for the Serve target; and
   - bounded direct public/non-tailnet denial evidence. Combine verified loopback-only binding, explicit Funnel-off,
     and a dedicated denial probe; do not infer denial merely from tailnet-up.
2. Use strict parsers and explicit expected command/probe identities. Missing command, non-zero exit, timeout,
   malformed/ambiguous output, unexpected target/port, missing/wrong/offline device, Funnel enabled/unknown, public or
   non-loopback success, stale observation, or reused/shared proof must yield non-zero `RUNTIME_ACCESS_REQUIRED` and
   no five-label block.
3. Produce a per-fact digest from canonical redacted fields, not raw output length. Emit only safe fixed source codes,
   timestamp/age, status, and short digest. Never emit raw command output, hostname, IP, route, peer/device ID, URL,
   token, or secret. Sanitize every thrown command/probe error.
4. The positive integration test must construct access evidence by executing this same collector with injected
   synthetic command/probe results. It may not call `okAccess()` or directly inject five trusted success objects.
   Add negatives for Serve absent/wrong target, Funnel enabled/unknown, authorized device missing/wrong/offline,
   non-loopback/public reachable, malformed output, command failure, and stale per-fact evidence.

Use only read-only operations in the future normal CLI. Do not mutate Tailscale login, Serve, Funnel, grants, ACLs,
firewall, bind state, or systemd.

## IR-F1-D1(g) — frozen separate audit key and real binding provisioning

The device bearer-token hash must never be used as provider-binding HMAC material. Implement and test the real
normal-runtime key/binding path inside the allowed runner file:

1. Resolve the key only as `<validated stateDir>/private/provider-audit-hmac-v1.key`. Reject symlinks, traversal,
   non-regular files, wrong owner, wrong size, overly permissive modes, or a private directory/file not exactly
   `0700`/`0600`. The real runtime path may securely create a missing directory/key only during the later authorized
   acceptance run: exclusive creation (`O_EXCL`/equivalent), cryptographically random 32 bytes, exact modes, fsync, and
   fail-closed cleanup on partial creation. Rework tests use only isolated temp paths.
2. Export/test the same key loader/provisioner used by `main()`. Never output, log, persist in DB, return in evidence,
   or include in an error the key bytes, derived raw HMAC material, device token/hash, configured selectors, or file
   metadata that exposes private paths. Zero/discard in-memory key buffers after binding work where practical.
3. Provide a real transaction-bound normal-runtime binding provisioning/loading function. Build the three exact role
   bindings from the current configured endpoint/base path, models, Verifier reasoning, Fish model/reference, and
   adapter schema using the separate key; insert/select idempotently under the existing uniqueness constraints; and
   return only safe row IDs to the pipeline evidence. Do not depend on tests or manual SQL to create these rows.
4. Validation must recompute with the loaded separate key and verify `audit_key_id='provider-audit-hmac-v1'`,
   `credential_present=1`, `verified_at` is finite/not future/within an explicit freshness bound, exact distinct role
   matrix, API surface, every required/forbidden selector HMAC, and config-version hash. Missing/extra/duplicate/stale/
   wrong-key/wrong-key-ID/no-credential/mismatched rows block before provider calls.
5. Reorder the normal CLI so key/binding preparation occurs safely before pipeline evidence is accepted. Policy
   snapshots remain required and unchanged. `loadPipelineEvidence`'s old precomputed boolean or tests' arbitrary
   matching key cannot substitute for this verification.
6. Tests must execute the real temp-directory key loader/provisioner and DB binding provisioner/validator, proving
   idempotent success and failure on missing/non-provisionable key, symlink, wrong directory/file mode, wrong owner when
   safely simulatable, wrong size, stale verification, wrong key ID, absent credential, wrong HMAC/config, duplicate/
   missing role, and any attempt to reuse the device-token hash. No test may build and validate with an arbitrary
   injected key while bypassing the normal key source.

Preserve every closed `(a)`, `(c)`, `(d)`, `(e)`, `(f)` behavior and all D-001 through D-009-A constraints. No design,
schema, package, config, provider, service, API, migration, or other test path may change. If the two findings cannot be
closed within this exact authority, return blocked to Advisor; do not widen scope.

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

Run the targeted acceptance suite independently; exact path/ancestry checks; `git diff --check`; control-byte/text
checks; frozen-design/D-010/all-Reviewer-report immutability; and focused searches proving no generic `funnelOff =
!!status`, device-token-as-audit-key, trusted `okAccess`, secret/body/selector/key output, or synthetic fallback remains.
Do not execute the normal CLI against live configuration.

## Result and commit contract

Use two additive commits without amend/history rewrite:

1. Content commit: only the two allowed subject paths plus the updated canonical `REWORK_RESULT.md`. Record D-010-A,
   `IR-F1-D1(b)`/`(g)`, automatic attempts 2/2, exceptional attempt 3 used 1/1, frozen/prior-review/previous-subject
   heads, exact tests and no-live/no-secret statuses, new-subject sentinel, and unrelated changes `none`. The verdict
   subject remains the same 87 implementation paths; Worker evidence is excluded.
2. After pushing/verifying content, pointer-only commit: only the updated `REWORK_RESULT_POINTER.md`, with the actual
   content/new-subject head and pointer sentinel.

Push both to `master`; verify origin equality, clean state, previous-subject ancestry, immutable frozen/decision/review
artifacts, and exact ownership. Return only the canonical concise rework pointer to Advisor and STOP. Do not launch or
message Reviewer/Designer/Leo/GPT/another actor. Any incomplete outcome returns blocked; no fourth attempt exists.
