# 08 D-011 Decision ACK — VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001

```text
DECISION_ID: D-011
DECISION: D-011-A — AUTHORIZE EXACTLY ONE FINAL LIFECYCLE MICRO-CORRECTION
DECISION_SOURCE: Leo/GPT explicit ACK
ACK_STATUS: ACKNOWLEDGED
APPLIES_TO: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001 implementation review loop only
SOURCE_REVIEW_ID: implementation-delta-review-001-a3
SOURCE_REVIEW_REPORT_HEAD: d228be432e5645b06e2ad8847293a2adebb8ca88
VERDICT_TARGET_HEAD: df6dfd502593735518d77ee7d7ec62035989a016
OPEN_FINDING_ID: IR-F1-D1(g)-L
FINAL_LIFECYCLE_MICRO_CORRECTION_AUTHORIZED: true
SAME_WORKER_REQUIRED: true
SAME_REVIEWER_REQUIRED: true
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a4
```

## Exact authority granted

Leo/GPT authorizes exactly one final mission-specific lifecycle micro-correction after the automatic and D-010
exceptional rework counters were exhausted. It is limited to closing `IR-F1-D1(g)-L` against the unchanged frozen
design. It creates no new product, privacy, provider, cost, security, legal, or architecture decision and authorizes no
design revision, schema, package, migration, API-contract, service, or deployment change.

The same fixed `VibeNews` Worker may change only:

- `server/src/bin/accept-private.ts`;
- `server/test/integration/accept-private.test.ts`; and
- the canonical Worker rework result/pointer evidence paths.

The same fixed `VibeNews-reviewer` must perform `implementation-delta-review-001-a4`. No substitute actor, new agent,
subagent, temporary session, widened finding, or widened product path is authorized.

## Required fail-closed lifecycle

When `provider_runtime_bindings` contains zero rows, initial audit-key creation and initial binding provisioning are
allowed. When any binding row already exists, a missing, invalid, symlinked, wrong-owner, wrong-mode, or wrong-size
audit key must return `RUNTIME_BINDING_REQUIRED`.

Every existing-binding failure must occur without creating a replacement key, silently rotating the key, creating
replacement binding rows, rewriting existing binding rows, returning `PASS`, or emitting the five-label success
evidence block. Existing bindings plus the correct valid key must validate idempotently: no new key or binding rows are
created, and the normal acceptance flow may continue.

## Required deterministic proof

The isolated integration suite must prove:

- empty-state initial provisioning succeeds;
- existing bindings plus a missing key fail closed, create no key, and create no binding rows;
- existing bindings plus an invalid key fail closed without replacement;
- existing bindings plus a symlinked, wrong-owner, wrong-mode, or wrong-size key each fail closed;
- existing bindings plus the valid key succeed idempotently;
- previously closed `IR-F1-D1(a)` through `IR-F1-D1(f)` remain closed; and
- all 80 existing integration tests remain passing or the passing count increases without regression.

The tests must exercise the normal runtime lifecycle seam and must verify key/binding absence or immutability in each
failure case, not merely the returned status label.

## Correction execution boundary

- No live DeepSeek, Fish Audio, YouTube, Tailscale, public-network, or device call.
- No secret-value access or output, runtime mutation, deployment, or production action.
- Use only synthetic, local, deterministic test state.
- Do not open, source, print, copy, or expose `.env.server.local` or any credential value.
- The frozen design and D-001 through D-010 remain unchanged.

## Review and continuation rule

After the Worker publishes the correction, the Advisor directly validates the exact diff, path ownership, tests,
clean state, commit ancestry, and push. The same Reviewer then inspects the actual code and executes the relevant tests
for `implementation-delta-review-001-a4`, including direct proof that existing bindings can never cause a missing or
invalid key to be replaced.

An a4 `PASS` immediately opens the already-approved private live acceptance. Exhausted historical rework counters do
not require another Leo/GPT approval in that case. The original mission must then continue through real private
YouTube to DeepSeek to Fish Audio acceptance, global playback resume/exclusion acceptance, Advisor final audit, and
the final pointer. Any a4 `NEEDS_PATCH`, `FAIL`, or `PASS_WITH_RISK` stops and returns the exact remaining finding and
evidence to Leo/GPT; no further authority is inferred.

## Future governance note

After this product mission is completed, record this governance improvement candidate in the mission evidence, but do
not modify canonical governance during the mission:

> Bounded implementation-only corrections may continue without repeated Leo/GPT approval when frozen design is
> unchanged, scope and files are explicit, no new policy/risk decision exists, the same Worker patches, the same
> Reviewer re-reviews, and the finding set is monotonically shrinking.
