# 05 Leo/GPT Decision Request — VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001

## D-009 — provider-side no-training/data-control acceptance gate

```text
DECISION_STATUS: REQUIRED
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
ACTOR: VibeNews Advisor
SOURCE_REVIEW_ID: design-review-001
SOURCE_REVIEW_REPORT_HEAD: f46ea708d9768ce883effbb97bcd15cbddfa1227
BLOCKING_FINDING_ID: DR1-F1
DESIGN_CONTENT_HEAD: f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984
DESIGN_FREEZE_STATUS: NOT_FROZEN
DESIGN_REVISION_ATTEMPTS_USED: 0
NEXT_ACTOR: Leo/GPT
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
