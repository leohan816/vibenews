# Review Result — implementation-delta-review-001-a3 (VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001)

```text
REVIEW_RESULT
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
ACTOR: VibeNews Reviewer
REVIEW_TYPE: IMPLEMENTATION_DELTA_REVIEW
REVIEW_ID: implementation-delta-review-001-a3
REVIEW_PASS: delta
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
DESIGN_CONTENT_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
DESIGN_SUBJECT_PATHS: 14 frozen design paths at 5c97382 (unchanged; especially §4.2, §8.2, §14.4)
LEO_DECISION_ID: D-010 (exceptional attempt-3 authorization); ACK head 53f64282ec594962011da22c2328335d6a12fd8f
INITIAL_IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
PRIOR_DELTA_REVIEW_REPORT_HEAD: 054333eb08d677c831e911866d3c7a9dbb34df9c
SUBJECT_BASE: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
VERDICT_TARGET_HEAD: df6dfd502593735518d77ee7d7ec62035989a016
VERDICT_TARGET_PATHS: the 87 implementation paths; Worker/Rework result+pointer excluded
PREVIOUS_SUBJECT_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
DELTA_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
REWORK_CONTENT_HEAD: df6dfd502593735518d77ee7d7ec62035989a016
FINDING_IDS_IN_SCOPE: IR-F1-D1(b); IR-F1-D1(g)
AUTOMATIC_IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2 of 2
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPTS_USED: 1 of 1
ALL_REWORK_BUDGET_EXHAUSTED: true
REPORT_PATHS:
- runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-delta-review-001-a3/REVIEW_RESULT.md
- runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-delta-review-001-a3/REVIEW_RESULT_POINTER.md
REPORT_HEAD: RECORDED_AFTER_REPORT_PUSH_IN_CHAT
FILES_READ:
- CLAUDE.md; AGENTS.md; docs/agent/ROLE_INDEX.md + all five canonical protocols
- frozen §4.2/§8.2/§14.4 at 5c97382; D-010 request/ACK; initial + a1 + a2 review reports; a3 rework prompts + REWORK_RESULT
- server/src/bin/accept-private.ts (full, 894 lines) + previous blob at 98d3ea6; server/test/integration/accept-private.test.ts (full)
- server/src/domain/contracts.ts buildRuntimeBinding/providerBindingHmac/assertValidPolicySnapshot; bin/api buildApp; bin/worker loadPipelineEvidence
DIFF_READ:
- git diff 98d3ea6..df6dfd5 -- accept-private.ts (M +602 net), accept-private.test.ts (M +372); other 85 subject blobs unchanged
- full 98d3ea6..df6dfd5: only the 2 delta paths + expected interleaved evidence (incl. 05_LEO_DECISION_REQUEST, 07_D010_DECISION_ACK); content commit df6dfd5 touches only the 2 delta paths + its own REWORK_RESULT.md
COMMANDS_EXECUTED:
- git preflight/fetch; verified routing head a30659723791e0722094f696de4d7a8fd2cdb164 == origin/master == HEAD; ancestry (98d3ea6 ancestor of df6dfd5) OK; allowlist/path checks; git diff --check (clean)
- npm run typecheck (PASS); node --test accept-private.test.ts (29/29); test:integration 80/80; test:unit 46/46 (no regression)
- read buildRuntimeBinding to confirm config_version_hash is key-dependent; searched the test for the existing-bindings+missing-key negative (absent)
VERDICT: NEEDS_PATCH
DESIGN_CONFORMANCE_CHECK: PARTIAL — IR-F1-D1(b) is fully closed and (g)'s key material/provisioning/validation are greatly improved and correct in the normal path, but (g) still omits the frozen §4.2 audit-key LIFECYCLE guard, so existing-bindings + missing-key silently re-keys and PASSes.
BLOCKING_FINDINGS:
- IR-F1-D1(g)-L: main() mints the audit key unconditionally (resolveAuditKey allowCreate:true) with no binding-row existence check, so an existing binding set plus a missing/deleted key file creates a new key + new bindings and PASSes — violating the frozen §4.2 "create only when no binding row exists; else fail closed" lifecycle. Untested. Exact evidence and bounded fix below.
NON_BLOCKING_FINDINGS: carried IR2/IR3 (caption 60s default; cosmetic lint) remain non-blocking and out of scope.
AUTHORITY_CONFLICTS: none — no D-001..D-010 decision reopened; this finding enforces the frozen §4.2 design that the code omits.
RUNTIME_CHANGE_CHECK: PASS (no unauthorized change) — delta touches only the 2 declared paths; no frozen-design/canonical/Advisor/other-actor path; no secret/media/transcript; no live call; .env.server.local not opened; the key bytes are zeroed after use and never emitted.
DIRTY_FILE_CHECK: PASS — clean worktree; git diff --check clean; 85 non-delta subject blobs unchanged.
RELOAD_READINESS: NOT_APPLICABLE — no PASS.
REQUIRED_PATCHES: IR-F1-D1(g)-L (bounded to the 2 delta paths) — BUT the automatic (2/2) and exceptional (1/1) rework budget is now exhausted; no attempt 4, substitute actor, or Advisor patch is authorized. Returns to Advisor and then Leo/GPT for decision.
RESIDUAL_RISKS: until the lifecycle guard is added, deletion/loss/tampering of the audit key is silently repaired by minting a fresh key and re-binding to arbitrary configured selectors, defeating the audit key's tamper-evidence purpose.
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

## Rework budget

Automatic implementation-rework attempts are used 2/2; the D-010-A exceptional attempt is used 1/1. With this
non-pass the entire rework budget is exhausted. Per the handoff/brief, this returns to Advisor and then Leo/GPT; no
attempt 4, substitute actor, or Advisor patch is authorized, and none is proposed here.

## Genuinely closed by attempt 3 (credit)

- **IR-F1-D1(b) §14.4(9) — CLOSED.** The single-`tailscale status` inference is replaced by five independent,
  time-bound, distinct-proof observations, each from its own dedicated read-only command/probe, all fail-closed:
  loopback health probe (`/v1/health/live` == 200) plus a non-loopback bind probe that must observe the API port
  closed on every non-loopback interface; `tailscale serve status --json` requiring a `:443` site whose handler
  proxies to the exact loopback `apiPort`; `tailscale status --json` matching the CONFIGURED device ID among online
  in-network-map Peers (never Self), deriving one validated tailnet IP and probing it with bounded `tailscale ping`;
  `tailscale funnel status --json` requiring `AllowFunnel` all-false (absent/any-true/malformed fails closed); and a
  `derivePublicDenial` probe requiring every globally-routable public interface to refuse `:443` (no public target,
  any open, or any timeout fails closed), combined with loopback-ok + funnel-off. Freshness uses `accessNow`
  sampled AFTER collection with a `[0, accessMaxAgeMs]` window, and all five digests must be distinct
  (`ACCESS_PROOFS_DISTINCT`). No constant, tailnet-up inference, shared proof, or synthetic fallback remains, and no
  identity/IP/raw output is emitted. This resolves the exact a2 (b) defect.
- **(g) key/provisioning/validation substance — CLOSED.** `resolveAuditKey` resolves only
  `<stateDir>/private/provider-audit-hmac-v1.key`, rejecting symlinks, non-regular/non-dir types, dir!=0700,
  file!=0600, wrong owner (uid), and size!=32, creating a missing key with `O_EXCL` + CSPRNG + fsync + fail-closed
  partial cleanup, never returning/logging path or bytes. `provisionRoleBindings` is transactional and idempotent on
  `UNIQUE(provider_role, config_version_hash)` and stores only the safe `audit_key_id` + value-free HMACs.
  `validateRoleBindings` recomputes with the loaded key and verifies `audit_key_id`, `credential_present`,
  `verified_at` (finite/not-future/fresh), the distinct 3-role matrix, API surface, every required/forbidden selector
  HMAC, and the config-version hash. The device bearer-token hash is no longer used as binding material. These fully
  address the a2 (g) substance concerns.
- **(a),(c),(d),(e),(f) — remain closed (no regression).** Typecheck + accept-private 29/29 + integration 80/80 + unit
  46/46 pass; the raw-scan, this-run channel binding, per-job TTS delta, authorized in-process Range, and strict policy
  validation gate logic is unchanged in substance.

## Blocking finding — IR-F1-D1(g)-L (frozen audit-key lifecycle omitted)

- Evidence (code): `main()` orders `resolveAuditKey(config.stateDir, { allowCreate: true })` (accept-private.ts ~818)
  UNCONDITIONALLY, before any check of whether `provider_runtime_bindings` rows already exist, then calls
  `provisionRoleBindings` (~853). `buildRuntimeBinding` (contracts.ts 526–539) computes `configVersionHash` from the
  key-dependent selector HMACs, so a NEW key yields a NEW `config_version_hash`; `provisionRoleBindings` therefore does
  NOT match pre-existing rows and INSERTs a fresh role set, which `validateRoleBindings` then passes with the new key.
- Failure scenario: existing binding rows (from a prior key) + a deleted/missing key file → `main()` mints a new random
  key → provisions a new binding set → `LIVE_PRIVATE_ACCEPTANCE: PASS`. This silently re-keys and re-binds to arbitrary
  configured selectors on key loss/tampering.
- Frozen rule violated (§4.2): initial key provisioning is allowed ONLY when no binding row exists; "binding row가
  있는데 key가 없거나 mode/owner가 틀리면 새 key로 덮지 않고 fail closed." The existing-bindings + missing-key case must
  fail closed, not create a new key.
- Test gap: the a3 test covers `AUDIT_KEY_MISSING` (allowCreate:false), symlink/mode/size/dir-mode, idempotent
  provisioning, and `verified_at` refresh — but NOT the existing-bindings + missing-key negative (brief item 8).
- Exact bounded fix (for Leo's decision; not an authorized attempt 4): gate key creation on binding-row absence — e.g.
  compute `allowCreate = (count(provider_runtime_bindings) === 0)` and call `resolveAuditKey(stateDir, { allowCreate })`,
  so an existing binding set with a missing/invalid key returns `RUNTIME_BINDING_REQUIRED` and never mints a replacement
  key; add a test asserting existing-bindings + missing-key → BLOCKED with no new key and no five labels. Scope stays
  within `accept-private.ts` + `accept-private.test.ts`.

## Verdict

`NEEDS_PATCH` for rework head `df6dfd502593735518d77ee7d7ec62035989a016` against `FROZEN_DESIGN_HEAD 5c97382`. Attempt 3
fully closed IR-F1-D1(b) and closed the substance of (g) with real dedicated access observations, the frozen server-only
audit key, and complete binding provisioning/validation — a strong, genuine improvement with no regression. It did not
implement the frozen §4.2 audit-key LIFECYCLE guard, so existing-bindings + missing-key silently re-keys and false-PASSes.
Because the automatic (2/2) and exceptional (1/1) rework budget is now exhausted, this returns to Advisor and then
Leo/GPT; no attempt 4 is proposed or authorized. This verdict performs no live acceptance, freezes nothing, and accepts
no risk on Leo/GPT's behalf.
```
