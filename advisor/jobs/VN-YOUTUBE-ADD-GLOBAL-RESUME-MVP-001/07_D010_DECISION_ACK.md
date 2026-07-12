# 07 D-010 Decision ACK — VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001

```text
DECISION_ID: D-010
DECISION: D-010-A — AUTHORIZE ONE EXCEPTIONAL FINAL REWORK
DECISION_SOURCE: Leo/GPT explicit ACK
ACK_STATUS: ACKNOWLEDGED
APPLIES_TO: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001 implementation review loop only
SOURCE_REVIEW_ID: implementation-delta-review-001-a2
SOURCE_REVIEW_REPORT_HEAD: 054333eb08d677c831e911866d3c7a9dbb34df9c
VERDICT_TARGET_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
OPEN_FINDING_IDS: IR-F1-D1(b); IR-F1-D1(g)
AUTOMATIC_REWORK_ATTEMPTS_USED: 2
AUTOMATIC_REWORK_ATTEMPTS_MAX: 2
EXCEPTIONAL_IMPLEMENTATION_REWORK_AUTHORIZED: true
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPT: 3
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 1
SAME_WORKER_REQUIRED: true
SAME_REVIEWER_REQUIRED: true
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a3
```

## Exact authority granted

Leo/GPT authorizes one non-automatic, mission-specific implementation rework after the canonical two-attempt limit.
This authority is limited to closing `IR-F1-D1(b)` and `IR-F1-D1(g)` against the unchanged frozen design. It does not
revive the expired bootstrap exception, create a general third-attempt policy, or authorize the Advisor to patch code.

The same fixed `VibeNews` Worker may change only:

- `server/src/bin/accept-private.ts`;
- `server/test/integration/accept-private.test.ts`; and
- the canonical Worker rework result/pointer evidence paths.

The same fixed `VibeNews-reviewer` must perform `implementation-delta-review-001-a3`. No substitute actor, new agent,
subagent, temporary session, or widened product path is authorized.

## Required correction boundary

### IR-F1-D1(b) — real private-access evidence

The normal CLI must verify every section 14.4(9) fact through a dedicated read-only observation with redacted,
time-bound, per-fact provenance:

- Fastify loopback-only binding;
- Tailscale Serve HTTPS configured for the private API;
- the authorized Leo device grant/peer fact;
- Tailscale Funnel disabled; and
- unauthorized, non-tailnet, and public reachability denied.

Generic tailnet-up/self-online status, a shared success boolean, or one observation reused as proof of another fact is
insufficient. Missing tools, stale/malformed output, Serve absent, Funnel enabled, wrong/missing grant, or a reachable
public/non-tailnet path must fail closed with no five-label block.

### IR-F1-D1(g) — distinct server-only provider audit key and binding path

The normal runtime must use the frozen distinct `provider-audit-hmac-v1.key`, not the device bearer-token hash. The
implementation must provide a real fail-closed provisioning/loading path using the operator-only private location and
verify its required directory/file ownership and `0700`/`0600` modes without outputting, hashing into reports, or
otherwise exposing the key value.

Runtime binding provisioning and validation must use that same key and verify safe `audit_key_id`, credential
presence, verification freshness, role matrix, configured selectors, and config-version hash. Missing, insecure,
stale, duplicate, or mismatched state blocks before provider calls.

## Rework and test restrictions

- No live YouTube, DeepSeek, Fish Audio, Tailscale, public-network, device, or production/runtime call during rework.
- Do not open, source, print, copy, hash into output, or expose `.env.server.local` or any secret value.
- Tests use isolated synthetic paths, key material, command output, probes, DBs, and transports, but must exercise the
  same normal-runtime observers and key/binding seams.
- Negative tests must prove Funnel-enabled, Serve-absent, wrong/missing grant, public-reachable, missing/insecure/stale
  audit key, wrong key ID, absent credential, stale binding, and mismatched HMAC cannot emit PASS or
  `LOCAL_DATA_CONTROLS: VERIFIED`.
- D-001 through D-009-A and every already-closed `IR-F1-D1` sub-item remain unchanged.

## Terminal rule

After the exceptional rework, the same Reviewer issues the only authorized `implementation-delta-review-001-a3`.
`PASS` may open the later real private acceptance phase. Any other verdict returns immediately to Leo/GPT. No fourth
automatic or exceptional attempt, substitute actor, Advisor patch, live acceptance, or completion claim is authorized.
