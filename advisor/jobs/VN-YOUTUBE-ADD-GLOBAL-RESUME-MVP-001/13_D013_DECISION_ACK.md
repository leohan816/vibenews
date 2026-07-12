# D-013 decision ACK — Funnel compatibility correction

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
ACTOR: VibeNews Advisor
DECISION_ID: D-013
DECISION_ACK_DATE: 2026-07-12
DECISION_STATUS: ACKNOWLEDGED
MISSION_TYPE: D-013_OPERATOR_FIX_AND_IMPLEMENTATION_COMPATIBILITY_CORRECTION
AUTHORIZED_DEVICE_BLOCKER: CLOSED_BY_OPERATOR_ATTESTATION
REMAINING_FINDING: FUNNEL_STATUS_COMPATIBILITY
FROZEN_PRODUCT_BEHAVIOR: UNCHANGED
PATCH_OWNER: same fixed VibeNews Worker
REVIEW_OWNER: same fixed VibeNews Reviewer
ALLOWED_PRODUCT_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
PLANNED_REVIEW_ID: implementation-delta-review-001-a5
LIVE_PROVIDER_OR_YOUTUBE_CALLS_DURING_CORRECTION: FORBIDDEN
SECRET_VALUE_ACCESS_OR_OUTPUT: FORBIDDEN
TAILSCALE_MUTATION_DURING_CORRECTION: FORBIDDEN
SCHEMA_PACKAGE_API_POLICY_DEPLOYMENT_CHANGE: FORBIDDEN
EXISTING_RUNTIME_BOOTSTRAP_STATE: PRESERVE_AND_REUSE
MISSION_COMPLETE: false
NEXT_ACTOR: VibeNews Advisor
```

## Exact correction contract

`funnelExplicitlyDisabled()` must return true only after successful command execution and JSON parsing when
`AllowFunnel` is absent, `null`, an empty object, or an object containing only boolean `false` values. It must return
false when any entry is `true`, when the value is an array, when any entry is non-boolean, or when the surrounding
command/JSON operation fails.

The correction must not weaken the separate Serve HTTPS listener and exact loopback API target match; configured stable
device-ID match; `Online` and `InNetworkMap`; bounded Tailscale ping; public/non-tailnet denial; or loopback-only API
binding. Deterministic tests must cover all authorized shapes and failures plus retention of the independent Serve and
device gates. All existing tests must remain passing.

The operator attests that the configured authorized device is online, in the intended network map, and reachable by the
bounded Tailscale ping; `yt-dlp` is configured/executable; config check passes; and private Serve has been restored to
the loopback API. The Advisor independently confirmed only value-free CLI/config-file metadata. No device identity,
tailnet output, address, URL, port, configured selector, environment value, or credential was read into this ACK.

This is a compatibility correction for the installed Tailscale JSON representation, not a product-policy or frozen-
behavior change. Only the same fixed Worker may patch the two named product paths, and only the same fixed Reviewer may
judge `implementation-delta-review-001-a5`. Correction and review are synthetic/local only. Reviewer `PASS` reopens the
existing real private acceptance using the valid audit key, three bindings, two policy snapshots, database, and backup
state without reset. A non-pass returns the exact finding to Leo/GPT without inferred further patch authority.
