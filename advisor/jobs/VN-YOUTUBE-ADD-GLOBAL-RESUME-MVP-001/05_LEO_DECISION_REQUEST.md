# 05 Leo/GPT Decision Request — VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001

## D-009 — provider-side no-training/data-control acceptance gate

```text
DECISION_STATUS: RESOLVED
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
ACTOR: VibeNews Advisor
SOURCE_REVIEW_ID: design-review-001
SOURCE_REVIEW_REPORT_HEAD: f46ea708d9768ce883effbb97bcd15cbddfa1227
BLOCKING_FINDING_ID: DR1-F1
DESIGN_CONTENT_HEAD: f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984
DESIGN_FREEZE_STATUS: NOT_FROZEN
DESIGN_REVISION_ATTEMPTS_USED: 0
DECISION_ACK: D-009-A — RECORD WITHOUT BLOCKING
DECISION_ACK_PATH: advisor/jobs/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/06_D009_DECISION_ACK.md
NEXT_ACTOR: VibeNews Designer
```

### Why a decision is required

The Designer added a rule that real acceptance must stop if the selected DeepSeek or Fish account's provider-side
no-training/data-control behavior cannot be verified. The independent Reviewer found this to be a material provider
privacy policy not established by D-001 through D-008:

- D-003 fixes DeepSeek for every LLM stage and Fish Audio for TTS.
- D-006 fixes VibeNews-side private use, local retention/deletion, and no redistribution/original-media retention.
- Neither existing decision states whether unverifiable provider-side training/retention controls must block the MVP.

Advisor cannot infer this policy or accept the risk. No secret value, provider body, caption text, or private audio is
needed or permitted for the decision.

### Exact choices

#### D-009-A — record without blocking (Advisor recommendation)

- Record only safe provider-policy version/date and supported boolean/control evidence where available.
- Never claim that VibeNews's local 24-hour caption deletion proves provider-side deletion or non-training.
- Provider-side no-training/data-control unverifiability alone does **not** block acceptance.
- All existing local privacy, minimization, private-use, no-redistribution, secret, and raw-media boundaries remain.

This preserves the already-selected DeepSeek/Fish path and avoids inventing a new acceptance prerequisite.

#### D-009-B — hard acceptance blocker

- Require verifiable provider-side no-training/data-control before any real live acceptance.
- If either selected provider/account cannot supply that proof/control, real acceptance remains blocked.
- Do not substitute another provider because D-003 fixes DeepSeek/Fish; a later Leo/GPT decision would be required.

### Required continuation after ACK

Advisor will route same-Designer revision attempt 1 limited to `DR1-F1`, then return the revised immutable subject to
the same Reviewer for `DESIGN_DELTA_REVIEW`. Only a passing delta may be frozen and routed to Worker.

## Resolution

Leo/GPT selected `D-009-A — RECORD WITHOUT BLOCKING`. The complete binding minimization, recording, prohibited-claim,
escalation, and live-evidence contract is preserved in `06_D009_DECISION_ACK.md`.

## D-010 — implementation rework limit reached with two bounded findings open

```text
DECISION_STATUS: RESOLVED
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
ACTOR: VibeNews Advisor
SOURCE_REVIEW_ID: implementation-delta-review-001-a2
SOURCE_REVIEW_REPORT_HEAD: 054333eb08d677c831e911866d3c7a9dbb34df9c
VERDICT: NEEDS_PATCH
VERDICT_TARGET_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
BLOCKING_FINDING_IDS: IR-F1-D1(b); IR-F1-D1(g)
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2
IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
AUTOMATIC_REWORK_LIMIT_REACHED: true
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN
ADVISOR_RECOMMENDATION: D-010-A
DECISION_ACK: D-010-A — AUTHORIZE ONE EXCEPTIONAL FINAL REWORK
DECISION_ACK_PATH: advisor/jobs/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/07_D010_DECISION_ACK.md
NEXT_ACTOR: VibeNews Advisor
```

### Why a decision is required

The same Worker used both automatic implementation-rework attempts and the same Reviewer completed both independent
delta reviews. Attempt 2 genuinely closed five of seven evidence defects and all synthetic checks remain green, but
the Reviewer found two normal-runtime blockers:

- `IR-F1-D1(b)`: `cliAccessObserver` reads only generic `tailscale status --json` and infers Serve HTTPS, the Leo device
  grant, Funnel-disabled, and public denial. A running tailnet with Funnel enabled or Serve absent can therefore
  false-PASS section 14.4(9).
- `IR-F1-D1(g)`: the CLI reuses `VIBENEWS_DEVICE_TOKEN_SHA256` as the provider binding HMAC key. Frozen section 8.2
  requires a separate server-only `provider-audit-hmac-v1.key` under the operator-only 0700/0600 private path. No real
  key provisioning/loading or runtime-binding row provisioning exists, and key ID/credential/freshness are not fully
  verified.

Proceeding to live acceptance would make its PASS evidence untrustworthy. The canonical two-attempt limit forbids the
Advisor from routing a third correction without explicit Leo/GPT authority. This is not a D-001 through D-009 policy
question and does not reopen them. No secret value, provider body, transcript, private audio, or runtime mutation is
needed for this decision.

### Exact choices

#### D-010-A — authorize one exceptional final rework (Advisor recommendation)

Authorize exactly one non-automatic `IMPLEMENTATION_REWORK` exception, attempt 3, with all of these constraints:

- same fixed `VibeNews` Worker and same fixed `VibeNews-reviewer`; no substitute actor, agent, or subagent;
- finding scope only `IR-F1-D1(b)` and `IR-F1-D1(g)`;
- product patch paths only `server/src/bin/accept-private.ts` and
  `server/test/integration/accept-private.test.ts`, plus normal Worker result/pointer evidence;
- access proof must use dedicated read-only Serve/Funnel/grant/loopback-vs-public observations with redacted per-fact
  provenance; generic tailnet-up or self-online cannot stand in for any fact;
- provider binding must use the frozen distinct server-only audit key and safe key ID, verify 0700/0600 path/mode,
  provide a real normal-runtime binding-provisioning/loading path, and verify key ID, credential presence, and freshness;
- no live provider/YouTube/tailnet/public-network/device call, no secret reading/output, and no runtime mutation during
  the correction; synthetic tests must exercise the real normal-runtime seams and negative cases;
- follow with same-Reviewer `implementation-delta-review-001-a3`; any non-pass returns immediately to Leo/GPT with no
  further automatic or exceptional attempt.

This keeps the frozen design unchanged and is the shortest safe path to real acceptance.

#### D-010-B — hold the mission

- Keep current implementation head and evidence unchanged.
- Do not run live private acceptance, deploy the acceptance runner, or claim implementation PASS/mission completion.
- Resume only after a later Leo/GPT instruction supplies new authority.

#### D-010-C — request a design-policy change

- Do not accept the current implementation as conforming.
- Return to Designer with a new explicitly scoped design decision about access evidence and/or audit-key separation,
  then require independent design review, a new freeze, implementation, and implementation review.
- This is broader and slower than D-010-A and is not recommended because the current frozen requirements are clear.

### Resolution

Leo/GPT selected `D-010-A — AUTHORIZE ONE EXCEPTIONAL FINAL REWORK`. The exact one-attempt, same-Worker,
same-Reviewer, two-finding, two-product-path, no-live-call/no-secret boundary is recorded in
`07_D010_DECISION_ACK.md`.
